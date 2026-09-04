/**
 * Chunked raster layers — GPU residency, streaming, painting and upload.
 *
 * The map is far too large to hold as one texture, so each layer is a grid of square chunks
 * backed by a Pixi `RenderTexture`. Only chunks near the viewport are resident; the rest live
 * as PNGs on the server. This is what makes both "the map is huge" and "edits sync live"
 * possible at once: a brush stroke rewrites the two or three chunks it touched, and other
 * clients refetch exactly those.
 *
 * There are three such grids — the detail tiers (`high`/`med`/`low`), 8× apart in world size
 * and identical in texel count. They are **authored, not derived**: painting writes the
 * active tier and every coarser one in the same stroke, so what a zoomed-out view reads is
 * the work itself, blurred, rather than something the server had to rebuild. Nothing here
 * downscales anything, and no tier is ever invalidated by an edit to another.
 *
 * Channel convention, shared by every layer:
 *   alpha = coverage, RGB = value.
 * For `height`, alpha *is* the terrain height (0 = ocean), so an untouched chunk clears to
 * transparent and reads as water — a new world starts as open sea with no work. For the
 * colour layers, alpha is paint coverage and RGB the colour, so unpainted areas fall through
 * to the palette default rather than to black.
 *
 * Painting erases by rendering with the `erase` blend mode, which is why height and coverage
 * both live in alpha rather than in a colour channel.
 *
 * This class owns *textures only* — it draws nothing. `TerrainView` composites the tiers and
 * the three layers into the visible map, because land colour has to be resolved against the
 * height field rather than stacked over it.
 */

import { Container, Matrix, Rectangle, Renderer, RenderTexture, Sprite, Texture } from 'pixi.js';
import {
  DetailTier,
  LAYER_TEXELS,
  RASTER_LAYERS,
  RasterLayer,
  TIERS,
  TIER_WORLD_SIZE,
  chooseTier,
  chunkKey,
  coarserTiers,
} from './map-editor.model';
import { Bounds } from './map-camera';
import { MapEditorApiService } from '../services/map-editor-api.service';
import { MapEditorStoreService } from '../services/map-editor-store.service';
import { mapDiag, tileLabel } from './map-diagnostics';

export interface ChunkRecord {
  layer: RasterLayer;
  cx: number;
  cy: number;
  /** Which authored grid this chunk belongs to. Part of its identity, not a quality knob. */
  tier: DetailTier;
  texture: RenderTexture;
  /** Pixels fetched, or confirmed never painted. */
  loaded: boolean;
  /** Painted since the last successful upload. */
  dirty: boolean;
  uploading: boolean;
  /** Set on eviction; guards the read paths against a freed texture. */
  destroyed?: boolean;
  /** Frame counter at last visibility, for LRU eviction. */
  lastSeen: number;
}

/**
 * One raster write of a bulk stamp: a world-space node, and whether it subtracts.
 *
 * Passes for the same layer are applied in the order given, which is how "replace this
 * rectangle" gets expressed — an erasing rect, then the image over the hole it left.
 */
/**
 * A texel as stored: RGB premultiplied by `a`, every channel 0-255.
 *
 * Kept premultiplied on purpose - see `sampleWorldMany`. Resolve it against a background with
 * `background * (1 - a / 255) + rgb`, which is what the shader does.
 */
export interface Sample {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface StampPass {
  layer: RasterLayer;
  /** World-coordinate content. Reused across every chunk, so it must not be mutated. */
  node: Container;
  erase?: boolean;
}

/*
 * Residency budget.
 *
 * These two limits are counted in *cells* — one cx,cy position at one tier, which owns one
 * texture per layer. Mixing units here was a real bug: the stream limit counted cells while
 * the resident limit counted individual textures, so the streamer was allowed three times
 * more than the evictor would ever tolerate. Worse, every chunk in view is marked seen on the
 * same frame, so eviction had no eligible candidates and freed nothing while allocation
 * carried on — VRAM climbed until the WebGL context was lost and the map went grey.
 *
 * At 512² RGBA per layer a chunk costs ~3 MB at every tier.
 */
const BYTES_PER_CELL_MB = 3;
/** Cells kept on the GPU per tier (~370 MB each). Must exceed what a working view streams. */
export const MAX_RESIDENT_CELLS = 124;

/** Safety valve only — the tier choice already bounds the count per tier. */
const MAX_STREAM_CELLS = 100;

export class ChunkManager {
  private chunks = new Map<string, ChunkRecord>();
  private frame = 0;
  /** Scratch container reused for every stamp, so painting allocates nothing per stroke. */
  private stampHost = new Container();

  /** Raised when a chunk's pixels change from a fetch, so the view can refresh. */
  onChunkUpdated?: (rec: ChunkRecord) => void;
  /**
   * Raised when a chunk is evicted, so the view can drop anything referencing it.
   *
   * The tier is part of the identity: `cx,cy` alone names a different patch of world at
   * every tier, so a listener without it cannot tell which chunk actually went away.
   */
  onChunkDisposed?: (layer: RasterLayer, tier: DetailTier, cx: number, cy: number) => void;
  /**
   * Raised immediately before a chunk is painted into. The undo stack hangs off this — a
   * brush destroys the pixels it covers, so they have to be captured while they still exist.
   */
  onBeforePaint?: (rec: ChunkRecord) => void;

  constructor(
    private renderer: Renderer,
    private api: MapEditorApiService,
    private store: MapEditorStoreService,
    private worldName: string,
  ) {}

  // ── residency ──

  /** Records are keyed by tier too, so one position can hold every tier at once. */
  private recKey(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): string {
    return chunkKey(layer, tier, cx, cy);
  }

  /** Every tier is the same texture size; only the world area it covers changes. */
  private texelsFor(layer: RasterLayer): number {
    return LAYER_TEXELS[layer];
  }

  /**
   * Finest tier that still fills the screen with roughly `TARGET_CHUNKS_ON_SCREEN` chunks.
   *
   * The choice — including its hysteresis, which is what stops the tier flipping on a hair
   * of zoom and rebuilding every cell — lives in the model as a pure function, so it can be
   * swept across a range of zooms in a unit test without a GPU.
   */
  tierFor(bounds: Bounds): DetailTier {
    return chooseTier(this.tier, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  }

  /**
   * Tier the GM has pinned, or null to follow the zoom.
   *
   * Pinning exists because the tier decides what a *stroke* writes, not just what is drawn —
   * and those two wants do not always agree. Recolouring the coarse base while zoomed in
   * close enough to see what you are aligning against is impossible otherwise, and it is
   * exactly the job that sends people looking for a per-tier eraser.
   */
  tierPin: DetailTier | null = null;

  /**
   * The tier to stream and draw: the pin if there is one, otherwise the zoom's choice.
   *
   * **A pin is obeyed at every zoom.** It used to be clamped against
   * `TARGET_CHUNKS_ON_SCREEN` and silently fall back to the automatic tier, which made
   * zooming out swap what you were looking at — pin `med`, zoom out, and `low` appeared
   * instead. In a mode whose whole purpose is inspecting and cleaning up one tier, quietly
   * substituting a different one is the worst thing it could do.
   *
   * The budget is still respected, just somewhere better: `TerrainView` draws at most
   * `MAX_TERRAIN_CELLS` cells nearest the view centre, so a pin that cannot cover the screen
   * shows *part* of its own tier rather than all of somebody else's. Anything not drawn reads
   * as "no data" instead of as sea, so the difference is visible.
   */
  private resolveTier(view: Bounds): DetailTier {
    return this.tierPin ?? this.tierFor(view);
  }

  private create(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): ChunkRecord {
    const texels = this.texelsFor(layer);
    /*
     * Linear filtering is essential: with nearest, every texel edge shows as a hard block
     * and the map reads as pixel art however high the resolution goes.
     *
     * Deliberately *not* antialiased. A multisampled render target cannot be read back by
     * `extract`, which broke every chunk upload with a null-source error, and it multiplies
     * the memory of a target that is only ever sampled as a texture.
     */
    const texture = RenderTexture.create({
      width: texels,
      height: texels,
      scaleMode: 'linear',
    });

    // A fresh RenderTexture's contents are undefined; clear so unpainted reads as empty.
    this.renderer.render({
      container: this.stampHost,
      target: texture,
      clear: true,
      clearColor: [0, 0, 0, 0],
    });

    const rec: ChunkRecord = {
      layer,
      cx,
      cy,
      tier,
      texture,
      loaded: false,
      dirty: false,
      uploading: false,
      lastSeen: this.frame,
    };
    this.chunks.set(this.recKey(layer, tier, cx, cy), rec);
    mapDiag.log('tile:create', tileLabel(layer, tier, cx, cy));

    /*
     * Ask only for chunks that were actually painted.
     *
     * Every tier is authored, so the document's version record answers this exactly — no
     * footprint search, and no request at all over the vast majority of a map that has
     * never been drawn on. Fetching unconditionally meant a 404 per layer per chunk on every
     * pan, which for an untouched layer is every chunk on screen.
     */
    if (this.store.chunkExists(layer, tier, cx, cy)) void this.fetchInto(rec);
    else rec.loaded = true; // never painted — the cleared texture is already correct

    return rec;
  }

  /** Resident record for a chunk, creating and queueing a load if absent. */
  get(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): ChunkRecord {
    const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
    if (rec) {
      rec.lastSeen = this.frame;
      return rec;
    }
    return this.create(layer, tier, cx, cy);
  }

  /**
   * Whether anything has ever been drawn in the stack of tiers a cell at `tier` composites.
   *
   * The terrain view uses this to skip open sea, which is most of a map: a cell there would
   * composite three transparent tiers into the ocean colour the backdrop already draws.
   *
   * Unsaved local paint counts. Checking only the document's version record would leave a
   * stroke on virgin ground invisible until its upload landed — the brush would appear to do
   * nothing for a second, on exactly the ground where you can least afford to doubt it.
   *
   * `onlyTier` matches the isolating view: with the coarser tiers unsampled, their content is
   * no reason to build a cell, and counting it would draw empty squares over open sea while
   * hiding the fact that the isolated tier is blank there — the one thing isolation is for.
   */
  hasContentUnder(tier: DetailTier, cx: number, cy: number, onlyTier = false): boolean {
    const span = TIER_WORLD_SIZE[tier];

    for (const source of onlyTier ? [tier] : [tier, ...coarserTiers(tier)]) {
      const srcSpan = TIER_WORLD_SIZE[source];
      const sx = Math.floor((cx * span) / srcSpan);
      const sy = Math.floor((cy * span) / srcSpan);

      for (const layer of RASTER_LAYERS) {
        if (this.store.chunkExists(layer, source, sx, sy)) return true;
        const rec = this.chunks.get(this.recKey(layer, source, sx, sy));
        if (rec && (rec.dirty || rec.uploading)) return true;
      }
    }
    return false;
  }

  /**
   * Fetch a chunk's stored pixels, coalescing concurrent requests for the same one.
   *
   * The in-flight promise is *kept* rather than merely flagged, so a caller that genuinely
   * has to wait — the landmass import, which must not paint over a chunk before its stored
   * content arrives — can await the same load the streamer already started.
   */
  private fetchInto(rec: ChunkRecord): Promise<void> {
    const inflightKey = this.recKey(rec.layer, rec.tier, rec.cx, rec.cy);
    const inflight = this.fetching.get(inflightKey);
    if (inflight) return inflight;

    const pending = this.fetchIntoInner(rec)
      // Callers mostly fire and forget, so a rejection here would surface as an unhandled
      // one rather than as anything actionable.
      .catch(err => {
        mapDiag.log('fetch:error', tileLabel(rec.layer, rec.tier, rec.cx, rec.cy), String(err));
      })
      .finally(() => this.fetching.delete(inflightKey));

    this.fetching.set(inflightKey, pending);
    return pending;
  }

  /**
   * Resolve once a chunk holds whatever the server had for it.
   *
   * Only the bulk paths need this. A brush deliberately does not wait — `fetchIntoInner`
   * drops a late response onto a chunk painted meanwhile — but a stamp that only covers
   * *part* of a chunk has to merge with what is already there, so it must see it first.
   */
  private async ensureLoaded(rec: ChunkRecord): Promise<void> {
    const inflight = this.fetching.get(this.recKey(rec.layer, rec.tier, rec.cx, rec.cy));
    if (inflight) await inflight;
  }

  private async fetchIntoInner(rec: ChunkRecord): Promise<void> {
    const label = tileLabel(rec.layer, rec.tier, rec.cx, rec.cy);
    const startedAt = performance.now();
    const ver = this.store.chunkVersion(rec.layer, rec.tier, rec.cx, rec.cy);
    mapDiag.log('fetch:start', label, `v${ver}`);

    const blob = await this.api.fetchChunk(
      this.worldName,
      rec.layer,
      rec.tier,
      rec.cx,
      rec.cy,
      ver,
    );
    /*
     * A fetch takes a moment, and the brush does not wait for it.
     *
     * If this chunk was painted while its download was in flight, applying the response now
     * would blit the server's older copy over the stroke with `clear: true` and erase it —
     * permanently, since the pixels are gone before the upload ever reads them. That is a
     * square of terrain reverting with hard chunk edges, appearing seconds after drawing as
     * each late response lands. Local paint always wins; the upload will publish it.
     */
    if (rec.dirty || rec.uploading) {
      mapDiag.log('fetch:skip-dirty', label, rec.dirty ? 'painted mid-flight' : 'uploading');
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
      return;
    }

    if (!blob) {
      // Nothing stored: the cleared texture is already correct, but the view still needs
      // telling, since it holds cells back until every layer reports in.
      mapDiag.log('fetch:empty', label, `${Math.round(performance.now() - startedAt)}ms`);
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
      return;
    }

    // The chunk may have been evicted while the fetch was in flight.
    if (this.chunks.get(this.recKey(rec.layer, rec.tier, rec.cx, rec.cy)) !== rec) return;
    if (!this.isUsable(rec)) return;

    try {
      const bitmap = await createImageBitmap(blob);
      const tex = Texture.from(bitmap);
      const sprite = new Sprite(tex);
      // Stored chunks may predate a resolution change, so scale to the current size rather
      // than assuming the PNG matches — otherwise old terrain would load into a corner.
      const size = this.texelsFor(rec.layer);
      sprite.setSize(size, size);

      this.stampHost.removeChildren();
      this.stampHost.blendMode = 'normal';
      this.stampHost.addChild(sprite);
      this.renderer.render({
        container: this.stampHost,
        target: rec.texture,
        clear: true,
        clearColor: [0, 0, 0, 0],
      });
      this.stampHost.removeChildren();

      sprite.destroy();
      tex.destroy(true);
      rec.loaded = true;
      mapDiag.log('fetch:done', label, `${Math.round(performance.now() - startedAt)}ms`);
      this.onChunkUpdated?.(rec);
    } catch (err) {
      mapDiag.log('fetch:error', label, String(err));
      console.error('[ChunkManager] Failed to decode chunk', rec.layer, rec.tier, rec.cx, rec.cy, err);
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
    }
  }

  /**
   * Ensure chunks covering the view are resident and evict distant ones.
   * Call once per frame with the camera's *unmargined* visible bounds.
   *
   * The lead is added here rather than by the caller because it has to be measured in chunks
   * of the tier this call chooses, and only this call knows which that is — the terrain view
   * then takes half as much, so what it draws is always a subset of what is streamed.
   */
  update(view: Bounds): void {
    this.frame++;
    this.lastView = view;

    const prevTier = this.tier;
    // Chosen from the screen itself, not the padded rectangle: the lead is loading policy,
    // and letting it feed back into the tier choice would coarsen the view for no reason.
    this.tier = this.resolveTier(view);
    if (prevTier !== this.tier) {
      mapDiag.log('tier:change', '', `${prevTier} -> ${this.tier}`);
    }

    /*
     * A full chunk of lead in every direction.
     *
     * A quarter-chunk was not enough: a chunk only started loading once its edge was nearly
     * on screen, so an ordinary pan outran it and terrain visibly popped in.
     */
    const margin = TIER_WORLD_SIZE[this.tier];
    const bounds: Bounds = {
      minX: view.minX - margin,
      minY: view.minY - margin,
      maxX: view.maxX + margin,
      maxY: view.maxY + margin,
    };

    /*
     * Stream the viewing tier *and every coarser one*.
     *
     * The renderer composites them, so a view on `high` is also reading the `med` and `low`
     * chunks underneath it — and those must be resident and marked visible, or eviction
     * would free the ground the visible cells are drawing from. A coarser tier covers 64×
     * the area per chunk, so this adds a handful of chunks, not a second screenful.
     */
    for (const tier of [this.tier, ...coarserTiers(this.tier)]) {
      this.streamTier(tier, bounds);
    }

    this.evict();
  }

  private streamTier(tier: DetailTier, bounds: Bounds): void {
    const span = TIER_WORLD_SIZE[tier];
    const minCx = Math.floor(bounds.minX / span);
    const maxCx = Math.floor(bounds.maxX / span);
    const minCy = Math.floor(bounds.minY / span);
    const maxCy = Math.floor(bounds.maxY / span);

    const wantedCells = (maxCx - minCx + 1) * (maxCy - minCy + 1);

    // The tier choice already sized the view, so this only guards a pathological case.
    if (wantedCells > MAX_STREAM_CELLS) {
      /*
       * Beyond even the coarsest budget the cell range can be tens of thousands of positions
       * while residency is capped in the low hundreds. Sweeping the range to mark visibility
       * then costs far more than sweeping what actually exists — and it was pure waste, since
       * nothing new can be created here anyway.
       */
      for (const rec of this.chunks.values()) {
        if (
          rec.tier === tier &&
          rec.cx >= minCx &&
          rec.cx <= maxCx &&
          rec.cy >= minCy &&
          rec.cy <= maxCy
        ) {
          rec.lastSeen = this.frame;
        }
      }
      return;
    }

    for (const layer of RASTER_LAYERS) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
          if (rec) rec.lastSeen = this.frame;
          else this.create(layer, tier, cx, cy);
        }
      }
    }
  }

  /**
   * Cells painted recently, and the frame they were last touched.
   *
   * A stroke can create chunks the view is not currently showing — the coarse copies it
   * writes on the way — and nothing else marks those as visible. Once a stroke flushed they
   * lost their dirty pin, were evicted immediately, and the next stroke had to re-fetch every
   * one of them, which is exactly the stutter and the chunks vanishing and coming back that
   * appears when drawing. Keeping them hot for a while means working in one area stays
   * resident regardless of what is on screen.
   *
   * The entries expire. A pin that never lifted would make every chunk ever painted in a
   * session permanently unevictable, which is the same unbounded growth the budget exists to
   * stop — just with a nicer name.
   */
  private hotCells = new Map<string, number>();

  /** How long a painted cell stays pinned, in streamed frames. */
  private static readonly HOT_FRAMES = 600;

  /**
   * Chunks with a fetch already in flight.
   *
   * Overlapping flushes were each requesting the same chunk, so one could be pulled several
   * times in the same millisecond.
   */
  private fetching = new Map<string, Promise<void>>();

  /** Detail tier the last `update` settled on. */
  get detailTier(): DetailTier {
    return this.tier;
  }

  /**
   * Visible rectangle the last `update` was given.
   *
   * Kept so a bulk stamp can tell the handful of chunks the user is actually looking at from
   * the thousands it is only passing through, and free the latter as it goes.
   */
  private lastView: Bounds | null = null;

  private tier: DetailTier = 'high';

  /**
   * Drop the least recently seen *cells* once over budget. Never drops unsaved work.
   *
   * Eviction is per cell rather than per texture because the terrain shader needs all three
   * layers of a position together. Ranking individual textures let a cell lose, say, its
   * land colour while keeping its height — painting height refreshes only that layer's
   * recency, so the colour aged out first — and the map then showed correctly-shaped land
   * with its colour cut off along a dead-straight chunk border.
   */
  private evict(): void {
    // One budget per tier: the tier being viewed must not evict the one you paint on.
    const tiers = new Set<DetailTier>([this.tier]);
    for (const rec of this.chunks.values()) tiers.add(rec.tier);
    for (const tier of tiers) this.evictTier(tier, MAX_RESIDENT_CELLS);
  }

  /** Enforce one tier's cell budget without disturbing the others'. */
  private evictTier(tier: DetailTier, maxCells: number): void {
    const budget = maxCells * RASTER_LAYERS.length;
    const ofTier = [...this.chunks.values()].filter(r => r.tier === tier);
    if (ofTier.length <= budget) return;

    // Group by cell, ranking each by its *most* recently seen layer.
    const cells = new Map<string, { recs: ChunkRecord[]; lastSeen: number; pinned: boolean }>();
    for (const rec of ofTier) {
      const key = `${rec.cx}/${rec.cy}`;
      const cell = cells.get(key);
      /*
       * Recently painted chunks are pinned outright.
       *
       * A continent-scale stroke touches far more chunks than a screenful, and they must not
       * be evicted to make room for chunks the streamer can simply fetch again. Losing a
       * viewing chunk costs a request; losing a painted one costs the stroke.
       */
      const hot = this.isHot(rec.tier, rec.cx, rec.cy);
      const pinned = hot || rec.dirty || rec.uploading || rec.lastSeen === this.frame;
      if (cell) {
        cell.recs.push(rec);
        cell.lastSeen = Math.max(cell.lastSeen, rec.lastSeen);
        cell.pinned ||= pinned;
      } else {
        cells.set(key, { recs: [rec], lastSeen: rec.lastSeen, pinned });
      }
    }

    const candidates = [...cells.values()]
      .filter(c => !c.pinned)
      .sort((a, b) => a.lastSeen - b.lastSeen);

    let excess = ofTier.length - budget;
    for (const cell of candidates) {
      if (excess <= 0) break;
      // All layers of the cell go together, so a partial cell can never be rendered.
      for (const rec of cell.recs) {
        this.dispose(rec);
        excess--;
      }
    }

    /*
     * If nothing could be freed we are over budget with everything in view — the state
     * that previously grew until the GPU context was lost. Say so once rather than
     * silently allocating into a crash; the stream cap should normally prevent it.
     */
    if (excess > 0 && !this.warnedOverBudget) {
      this.warnedOverBudget = true;
      console.warn(
        `[ChunkManager] over residency budget at tier ${tier}: ${ofTier.length} chunks ` +
          `(~${Math.round((ofTier.length / RASTER_LAYERS.length) * BYTES_PER_CELL_MB)} MB) ` +
          'and none evictable. Lower MAX_STREAM_CELLS or the layer resolution.',
      );
    }
  }

  private warnedOverBudget = false;

  private hotKey(tier: DetailTier, cx: number, cy: number): string {
    return `${tier}/${cx}/${cy}`;
  }

  /** Whether a cell was painted recently enough to still be pinned; forgets it if not. */
  private isHot(tier: DetailTier, cx: number, cy: number): boolean {
    const key = this.hotKey(tier, cx, cy);
    const at = this.hotCells.get(key);
    if (at === undefined) return false;
    if (this.frame - at <= ChunkManager.HOT_FRAMES) return true;
    this.hotCells.delete(key);
    return false;
  }

  private dispose(rec: ChunkRecord): void {
    this.chunks.delete(this.recKey(rec.layer, rec.tier, rec.cx, rec.cy));
    mapDiag.log('tile:evict', tileLabel(rec.layer, rec.tier, rec.cx, rec.cy));
    this.onChunkDisposed?.(rec.layer, rec.tier, rec.cx, rec.cy);
    rec.destroyed = true;
    rec.texture.destroy(true);
  }

  /**
   * Whether a chunk's texture can still be read.
   *
   * A destroyed texture — or one whose backing source vanished with a lost WebGL context —
   * leaves `source` null, and every read path then throws deep inside the renderer. Checking
   * here turns that into a skipped operation instead of a crash that takes the editor down.
   */
  private isUsable(rec: ChunkRecord): boolean {
    return !rec.destroyed && !!rec.texture?.source;
  }

  // ── painting ──

  /**
   * Stamp a world-positioned display object into `tier` and every coarser tier it covers.
   *
   * `node` is expressed in world coordinates; `stamp` applies each target chunk's own
   * transform into its texel space, so the same brush lands correctly at every tier and
   * callers never deal with chunk math. Set `node.blendMode` to `'erase'` to subtract.
   *
   * Writing the coarse copies here, in the stroke, is the whole design: it is what makes the
   * tiers consistent by construction, so zooming out needs no derived tiles and the server
   * never rebuilds anything. Finer tiers are deliberately *not* touched — see `coarserTiers`.
   *
   * `onlyTier` suppresses the coarse copies. It is for hand-editing one tier in isolation,
   * where writing the others is the opposite of what is wanted: the whole reason to isolate
   * is that some tier holds content that should be there and no other should copy it.
   */
  paintWorld(
    layer: RasterLayer,
    node: Container,
    bounds: Bounds,
    tier: DetailTier,
    onlyTier = false,
  ): ChunkRecord[] {
    const touched: ChunkRecord[] = [];

    this.stampHost.removeChildren();
    this.stampHost.addChild(node);

    for (const target of onlyTier ? [tier] : [tier, ...coarserTiers(tier)]) {
      const span = TIER_WORLD_SIZE[target];
      const minCx = Math.floor(bounds.minX / span);
      const maxCx = Math.floor(bounds.maxX / span);
      const minCy = Math.floor(bounds.minY / span);
      const maxCy = Math.floor(bounds.maxY / span);

      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const rec = this.get(layer, target, cx, cy);
          this.onBeforePaint?.(rec);
          this.stamp(rec);
          rec.dirty = true;
          touched.push(rec);
          this.hotCells.set(this.hotKey(target, cx, cy), this.frame);
          mapDiag.log(target === tier ? 'paint:chunk' : 'paint:coarse', tileLabel(layer, target, cx, cy));
        }
      }
    }

    this.stampHost.removeChildren();
    return touched;
  }

  /**
   * Stamp fixed content over a world rectangle of any size, at `tier` and every coarser one.
   *
   * `paintWorld` cannot do this. It creates every chunk it touches and leaves them resident,
   * which is correct for a brush — a stroke covers a handful of chunks and you are about to
   * paint over them again — but a landmass import covers hundreds, at ~3 MB a cell, and the
   * residency budget exists precisely because that exhausts the GPU. So this walks the area
   * a few cells at a time and, for each, loads → paints → uploads → frees, keeping only what
   * the camera is actually showing. Peak cost is the batch, not the import.
   *
   * Three deliberate differences from a brush stroke:
   *
   *  - It **waits for each chunk's stored pixels**. A stamp usually covers only part of the
   *    edge chunks, so painting before the load lands would blit the server's copy back over
   *    the imported half a moment later.
   *  - It **uploads as it goes** rather than leaving the work for `flushDirty`, because
   *    nothing else would keep the chunk alive long enough to be flushed.
   *  - It is **not undoable**. `onBeforePaint` is skipped on purpose: capturing a snapshot of
   *    every touched chunk would put the whole import in VRAM, which is the one thing this
   *    method exists to avoid. Callers must confirm with the user first.
   */
  async stampRegion(
    passes: StampPass[],
    bounds: Bounds,
    tier: DetailTier,
    onProgress?: (done: number, total: number) => void,
    cancel?: { cancelled: boolean },
  ): Promise<void> {
    const targets = [tier, ...coarserTiers(tier)];

    let total = 0;
    for (const t of targets) total += this.cellsIn(bounds, t).length;
    let done = 0;
    onProgress?.(0, total);

    for (const t of targets) {
      await this.stampCells(passes, this.cellsIn(bounds, t), t, {
        cancel,
        onProgress: n => onProgress?.(done + n, total),
      });
      if (cancel?.cancelled) return;
      done += this.cellsIn(bounds, t).length;
    }
  }

  /**
   * Stamp an explicit list of cells at one tier, and nothing else.
   *
   * Split out of `stampRegion` for the boundary of a replaced region. A chunk the region's
   * edge crosses cannot be cleared by deleting its file — it also holds map outside the
   * region that has to survive — so it has to be loaded, subtracted from, and written back.
   * There are only ever O(perimeter) of those, but they are the difference between a clean
   * replacement and a stale band 23 hexes wide at `med`, or 182 at `low`.
   *
   * `skipEmpty` keeps that affordable. An erase over ground nothing was ever painted on has
   * no work to do, and without the check the pass would *create* the chunk, upload a blank
   * PNG, and leave a file where there had rightly been none — thousands of them at `high`.
   */
  async stampCells(
    passes: StampPass[],
    cells: { cx: number; cy: number }[],
    tier: DetailTier,
    opts: {
      skipEmpty?: boolean;
      onProgress?: (done: number, total: number) => void;
      cancel?: { cancelled: boolean };
    } = {},
  ): Promise<void> {
    const { skipEmpty, onProgress, cancel } = opts;
    const layers = [...new Set(passes.map(p => p.layer))];

    let done = 0;
    /*
     * Four cells at a time: enough concurrency to keep the network busy while the renderer
     * works, small enough that the transient residency (cells × layers × 3 MB) stays well
     * inside the budget even at the coarsest tier.
     */
    const CELL_BATCH = 4;

    {
      for (let i = 0; i < cells.length; i += CELL_BATCH) {
        if (cancel?.cancelled) return;
        const batch = cells.slice(i, i + CELL_BATCH);
        const t = tier;

        const recs: ChunkRecord[] = [];
        for (const cell of batch) {
          for (const layer of layers) {
            // Nothing stored and nothing painted locally: there is nothing to modify, and
            // touching it would only manufacture an empty chunk.
            if (skipEmpty && !this.isPainted(layer, t, cell.cx, cell.cy)) continue;
            recs.push(this.get(layer, t, cell.cx, cell.cy));
          }
        }
        if (recs.length === 0) {
          done += batch.length;
          onProgress?.(done, cells.length);
          continue;
        }

        // Stored pixels first — the stamp merges with them rather than replacing the chunk.
        await Promise.all(recs.map(rec => this.ensureLoaded(rec)));
        if (cancel?.cancelled) return;

        for (const rec of recs) {
          if (!this.isUsable(rec)) continue;
          for (const pass of passes) {
            if (pass.layer !== rec.layer) continue;
            pass.node.blendMode = pass.erase ? 'erase' : 'normal';
            this.stampHost.removeChildren();
            this.stampHost.addChild(pass.node);
            this.stamp(rec);
            this.stampHost.removeChildren();
          }
          rec.dirty = true;
        }

        await Promise.all(recs.map(rec => this.uploadChunk(rec)));

        // Free everything the camera is not showing; the import is far larger than the view.
        for (const rec of recs) {
          if (!rec.dirty && !rec.uploading && !this.overlapsView(rec)) this.dispose(rec);
        }

        done += batch.length;
        onProgress?.(done, cells.length);
      }
    }
  }

  /**
   * Whether a chunk holds anything — stored on the server, or painted here and not yet saved.
   *
   * The unsaved half matters: an erase running straight after a stamp must still see the
   * chunk the stamp just created, or it would decide there was nothing to erase.
   */
  private isPainted(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): boolean {
    if (this.store.chunkExists(layer, tier, cx, cy)) return true;
    const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
    return !!rec && (rec.dirty || rec.uploading);
  }

  /**
   * Chunk positions of `tier` a world rectangle covers.
   *
   * The far edge is nudged inwards, unlike `paintWorld`'s: a brush stamp is a soft blob
   * inside a generous bounding box, so one chunk too many costs nothing, but a rectangle
   * ending exactly on a chunk boundary must not claim the empty column beyond it — the
   * count is shown to the user and drives the progress bar.
   */
  private cellsIn(bounds: Bounds, tier: DetailTier): { cx: number; cy: number }[] {
    const span = TIER_WORLD_SIZE[tier];
    const minCx = Math.floor(bounds.minX / span);
    const maxCx = Math.floor((bounds.maxX - 1e-6) / span);
    const minCy = Math.floor(bounds.minY / span);
    const maxCy = Math.floor((bounds.maxY - 1e-6) / span);

    const cells: { cx: number; cy: number }[] = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) cells.push({ cx, cy });
    }
    return cells;
  }

  /** Whether a chunk covers any part of the last streamed view. */
  private overlapsView(rec: ChunkRecord): boolean {
    const v = this.lastView;
    if (!v) return false;
    const span = TIER_WORLD_SIZE[rec.tier];
    const x = rec.cx * span;
    const y = rec.cy * span;
    return x < v.maxX && x + span > v.minX && y < v.maxY && y + span > v.minY;
  }

  /** Render the current stamp host into one chunk, in that chunk's own texel space. */
  private stamp(rec: ChunkRecord): void {
    const span = TIER_WORLD_SIZE[rec.tier];
    const s = this.texelsFor(rec.layer) / span; // world px → texels
    // World → this chunk's texel space: translate to the chunk origin, then scale.
    const m = new Matrix(s, 0, 0, s, -rec.cx * span * s, -rec.cy * span * s);

    this.renderer.render({
      container: this.stampHost,
      target: rec.texture,
      clear: false,
      transform: m,
    });
  }

  /**
   * Sample many world positions of one layer at once, compositing the tiers.
   *
   * Two things this has to get right, both learned the hard way.
   *
   * **Batching.** `extract.pixels` is a GPU readback and therefore a pipeline stall, and the
   * live tint preview once issued one per symbol under the brush, every 90 ms — a brush over
   * a forest meant hundreds of stalls a second. The cost is per readback, not per pixel, so
   * points are grouped by the chunk they land in and each chunk's covering rectangle is read
   * exactly once.
   *
   * **Premultiplied.** Pixi's `getPixels` has its `unpremultiplyAlpha` call compiled out, so
   * what comes back is colour × coverage. Returned raw and used as a symbol tint, a texel at
   * the feathered edge of a stroke — 3% coverage — produced 3% brightness, i.e. black symbols
   * fringing every brush stroke. So the values here stay **premultiplied and carry their
   * alpha**, and the caller resolves them against the base colour the same way the shader
   * does. Unpremultiplying instead would divide an 8-bit value by 0.03 and amplify the
   * quantisation into noise.
   *
   * Tiers are composited coarse-to-fine with the same `over` the shader uses, so a fine tier
   * that only partly covers a coarse one reads as the blend actually on screen rather than as
   * whichever tier happened to be checked first.
   *
   * Returns null for a point where no tier had a readable chunk — distinct from a point that
   * was read and legitimately holds nothing, which comes back with `a === 0`.
   */
  sampleWorldMany(layer: RasterLayer, points: { x: number; y: number }[]): (Sample | null)[] {
    const acc = points.map(() => ({ r: 0, g: 0, b: 0, a: 0, read: false }));

    // Coarsest first: each finer tier composites over what the coarser ones contributed.
    for (const tier of [...TIERS].reverse()) {
      const span = TIER_WORLD_SIZE[tier];
      const texels = this.texelsFor(layer);
      const scale = texels / span;

      const groups = new Map<string, { cx: number; cy: number; items: number[] }>();
      points.forEach((p, index) => {
        const cx = Math.floor(p.x / span);
        const cy = Math.floor(p.y / span);
        const key = `${cx}/${cy}`;
        const group = groups.get(key);
        if (group) group.items.push(index);
        else groups.set(key, { cx, cy, items: [index] });
      });

      for (const group of groups.values()) {
        const rec = this.chunks.get(this.recKey(layer, tier, group.cx, group.cy));
        if (!rec || !rec.loaded || !this.isUsable(rec)) continue;

        const local = group.items
          .map(index => ({
            index,
            tx: Math.floor((points[index].x - group.cx * span) * scale),
            ty: Math.floor((points[index].y - group.cy * span) * scale),
          }))
          .filter(l => l.tx >= 0 && l.ty >= 0 && l.tx < texels && l.ty < texels);
        if (local.length === 0) continue;

        const minX = Math.min(...local.map(l => l.tx));
        const minY = Math.min(...local.map(l => l.ty));
        const width = Math.max(...local.map(l => l.tx)) - minX + 1;
        const height = Math.max(...local.map(l => l.ty)) - minY + 1;

        let pixels: Uint8ClampedArray | Uint8Array | null = null;
        let readWidth = 0;
        try {
          const read = this.renderer.extract.pixels({
            target: rec.texture,
            frame: new Rectangle(minX, minY, width, height),
          });
          pixels = read?.pixels ?? null;
          readWidth = read?.width ?? 0;
        } catch (err) {
          console.error('[ChunkManager] sampleWorldMany failed', err);
        }
        if (!pixels || readWidth === 0) continue;

        // The frame is not always honoured; when it is ignored the whole chunk comes back and
        // the requested origin must not be subtracted. Derive it from the returned width.
        const originX = readWidth === width ? minX : 0;
        const originY = readWidth === width ? minY : 0;

        for (const l of local) {
          const px = l.tx - originX;
          const py = l.ty - originY;
          if (px < 0 || py < 0 || px >= readWidth) continue;
          const i = (py * readWidth + px) * 4;
          if (i + 3 >= pixels.length) continue;

          const target = acc[l.index];
          target.read = true;

          // over(under = what coarser tiers gave, top = this tier), premultiplied.
          const k = 1 - pixels[i + 3] / 255;
          target.r = Math.min(255, pixels[i] + target.r * k);
          target.g = Math.min(255, pixels[i + 1] + target.g * k);
          target.b = Math.min(255, pixels[i + 2] + target.b * k);
          target.a = Math.min(255, pixels[i + 3] + target.a * k);
        }
      }
    }

    return acc.map(v => (v.read ? { r: v.r, g: v.g, b: v.b, a: v.a } : null));
  }

  /** One position. A thin wrapper, so both paths share the compositing above. */
  sampleWorld(layer: RasterLayer, x: number, y: number): Sample | null {
    return this.sampleWorldMany(layer, [{ x, y }])[0];
  }

  snapshot(rec: ChunkRecord): Texture | null {
    if (!this.isUsable(rec)) return null;

    const texels = LAYER_TEXELS[rec.layer];
    let copy: RenderTexture | null = null;

    try {
      copy = RenderTexture.create({ width: texels, height: texels, scaleMode: 'linear' });

      const sprite = new Sprite(rec.texture);
      sprite.setSize(texels, texels);

      this.stampHost.removeChildren();
      this.stampHost.blendMode = 'normal';
      this.stampHost.addChild(sprite);
      this.renderer.render({
        container: this.stampHost,
        target: copy,
        clear: true,
        clearColor: [0, 0, 0, 0],
      });
      this.stampHost.removeChildren();
      sprite.destroy();

      return copy;
    } catch (err) {
      console.error('[ChunkManager] snapshot failed', err);
      copy?.destroy(true);
      return null;
    }
  }

  /** Restore a snapshot taken by `snapshot`, marking the chunk dirty for re-upload. */
  restore(layer: RasterLayer, tier: DetailTier, cx: number, cy: number, snap: Texture): void {
    const rec = this.get(layer, tier, cx, cy);
    // The snapshot may have been freed by the history budget, or the chunk re-created.
    if (!this.isUsable(rec) || !snap?.source) return;
    // Never draw a texture into itself; that is the feedback loop this class must not create.
    if (snap.source === rec.texture.source) return;

    const sprite = new Sprite(snap);
    sprite.setSize(LAYER_TEXELS[layer], LAYER_TEXELS[layer]);

    this.stampHost.removeChildren();
    // The host carries whatever blend the last dab used; erasing here would wipe the chunk
    // instead of restoring it.
    this.stampHost.blendMode = 'normal';
    this.stampHost.addChild(sprite);
    this.renderer.render({
      container: this.stampHost,
      target: rec.texture,
      clear: true,
      clearColor: [0, 0, 0, 0],
    });
    this.stampHost.removeChildren();
    sprite.destroy();

    rec.dirty = true;
    this.onChunkUpdated?.(rec);
  }

  // ── persistence ──

  /**
   * Upload every dirty chunk and announce the new versions.
   *
   * Callers debounce this to stroke end — encoding a PNG per chunk is far too expensive to
   * do per pointer move.
   */
  async flushDirty(): Promise<void> {
    /*
     * One flush at a time.
     *
     * A flush snapshots the dirty list and then works through it in batches, awaiting
     * between them. A second flush starting during those awaits picked up the chunks the
     * first had not reached yet and uploaded them too — so the same chunk went up three or
     * four times, each bumping its version. That version churn then made our own broadcast
     * echoes look like edits from another client, which triggered refetches of chunks that
     * had just been painted, and the resulting chunk pressure evicted them. That is the
     * disappearing: a self-inflicted stampede starting from a duplicated upload.
     */
    if (this.flushing) {
      this.flushAgain = true;
      return;
    }
    this.flushing = true;
    try {
      await this.flushOnce();
    } finally {
      this.flushing = false;
    }

    // Work that arrived mid-flush still needs saving.
    if (this.flushAgain) {
      this.flushAgain = false;
      await this.flushDirty();
    }
  }

  private flushing = false;
  private flushAgain = false;

  private async flushOnce(): Promise<void> {
    // Every tier is authored, so every tier's dirty chunks are real work to save.
    const dirty = [...this.chunks.values()].filter(r => r.dirty && !r.uploading);
    if (dirty.length === 0) return;

    /*
     * Uploaded a few at a time rather than all at once.
     *
     * Each chunk means a GPU readback plus a PNG encode of a 512² texture. Firing every
     * dirty chunk in parallel put all of those readbacks in one frame, which is the hitch
     * that shows up after a broad stroke. Working through them in small batches spreads the
     * cost over a few frames and leaves the editor responsive while it saves.
     */
    const BATCH = 3;
    for (let i = 0; i < dirty.length; i += BATCH) {
      await Promise.all(dirty.slice(i, i + BATCH).map(rec => this.uploadChunk(rec)));
      // Yield between batches so input and rendering get a turn.
      if (i + BATCH < dirty.length) await new Promise(r => setTimeout(r, 0));
    }
  }

  private async uploadChunk(rec: ChunkRecord): Promise<void> {
    // The list was snapshotted before the first batch; by now this chunk may already be
    // saved or in flight, and re-sending it would only bump its version for nothing.
    if (!rec.dirty || rec.uploading || !this.isUsable(rec)) return;

    const label = tileLabel(rec.layer, rec.tier, rec.cx, rec.cy);
    mapDiag.log('upload:start', label);
    rec.uploading = true;
    // Cleared before the upload: a stroke landing mid-flight must re-dirty the chunk,
    // otherwise the newer paint would never be saved.
    rec.dirty = false;
    try {
      const blob = await this.toBlob(rec);
      if (!blob) {
        /*
         * Encoding failed — usually because the texture went away mid-flush. `dirty` was
         * already cleared to catch strokes landing during the upload, so returning here
         * silently discarded the paint and never retried it: a chunk would keep its colour
         * on screen until it was evicted, then reload from the server without it, leaving
         * one square of unpainted land with a hard border. Put the flag back so the next
         * flush tries again.
         */
        rec.dirty = true;
        return;
      }
      const ver = await this.api.putChunk(
        this.worldName,
        rec.layer,
        rec.tier,
        rec.cx,
        rec.cy,
        blob,
      );
      if (ver == null) {
        rec.dirty = true; // upload failed — try again on the next flush
        return;
      }
      mapDiag.log('upload:done', label, `v${ver}`);
      this.store.announceChunk(rec.layer, rec.tier, rec.cx, rec.cy, ver);
    } catch (err) {
      mapDiag.log('upload:fail', label, String(err));
      console.error('[ChunkManager] Chunk flush failed', rec.layer, rec.tier, rec.cx, rec.cy, err);
      rec.dirty = true;
    } finally {
      rec.uploading = false;
    }
  }

  private async toBlob(rec: ChunkRecord): Promise<Blob | null> {
    if (!this.isUsable(rec)) return null;

    const canvas = this.renderer.extract.canvas({ target: rec.texture }) as HTMLCanvasElement &
      Partial<OffscreenCanvas>;

    if (typeof canvas.convertToBlob === 'function') {
      return canvas.convertToBlob({ type: 'image/png' });
    }
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
  }

  /**
   * Another client changed this chunk — refetch it if we have it resident.
   *
   * Exactly one chunk, at one tier. There is no ancestry to walk: the other client's stroke
   * wrote its own coarse copies and announced each of them separately, so every affected
   * chunk arrives here on its own.
   */
  invalidate(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): void {
    const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
    // Local unsaved paint wins; our own flush will publish it shortly.
    if (rec && !rec.dirty && !rec.uploading) void this.fetchInto(rec);
  }

  /**
   * Free chunks that no longer exist on the server.
   *
   * Deliberately not `invalidate`. A refetch of a deleted chunk comes back empty, and
   * `fetchIntoInner` leaves the texture untouched in that case on purpose — that is what
   * stops a late 404 from wiping paint that landed while the request was in flight. Applied
   * to a real deletion the same rule is wrong: the pixels would stay on screen until the
   * chunk happened to be evicted. So a drop frees the record outright and lets the streamer
   * decide whether that ground still needs a cell at all.
   */
  dropChunks(layer: RasterLayer, tier: DetailTier, cells: [number, number][]): void {
    for (const [cx, cy] of cells) {
      const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
      if (rec) this.dispose(rec);
      // A pinned "recently painted" entry would keep the freed position unevictable and,
      // worse, claim content is there when the files are gone.
      this.hotCells.delete(this.hotKey(tier, cx, cy));
    }
  }

  hasPendingWork(): boolean {
    return [...this.chunks.values()].some(r => r.dirty || r.uploading);
  }

  destroy(): void {
    for (const rec of [...this.chunks.values()]) this.dispose(rec);
    this.chunks.clear();
    this.hotCells.clear();
    this.stampHost.destroy();
  }
}
