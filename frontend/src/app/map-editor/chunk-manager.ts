/**
 * Chunked raster layers — GPU residency, streaming, painting and upload.
 *
 * The map is far too large to hold as one texture, so each layer is a grid of
 * `CHUNK_WORLD_SIZE`-square chunks backed by a Pixi `RenderTexture`. Only chunks near the
 * viewport are resident; the rest live as PNGs on the server. This is what makes both
 * "the map is huge" and "edits sync live" possible at once: a brush stroke rewrites the two
 * or three chunks it touched, and other clients refetch exactly those.
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
 * This class owns *textures only* — it draws nothing. `TerrainView` composites the three
 * layers into the visible map, because land colour has to be resolved against the height
 * field rather than stacked over it.
 */

import { Container, Matrix, Rectangle, Renderer, RenderTexture, Sprite, Texture } from 'pixi.js';
import {
  CHUNK_WORLD_SIZE,
  LAYER_TEXELS,
  MAX_TILE_LEVEL,
  tileWorldSize,
  RASTER_LAYERS,
  RasterLayer,
  chunkKey,
  layerScale,
} from './map-editor.model';
import { Bounds } from './map-camera';
import { MapEditorApiService } from '../services/map-editor-api.service';
import { MapEditorStoreService } from '../services/map-editor-store.service';

export interface ChunkRecord {
  layer: RasterLayer;
  cx: number;
  cy: number;
  /** Pyramid level: 0 is the painted chunk, higher levels are derived on the server. */
  level: DetailLevel;
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

/*
 * Residency budget.
 *
 * These two limits are counted in *cells* — one cx,cy position, which owns one texture per
 * layer. Mixing units here was a real bug: the stream limit counted cells while the
 * resident limit counted individual textures, so the streamer was allowed three times more
 * than the evictor would ever tolerate. Worse, every chunk in view is marked seen on the
 * same frame, so eviction had no eligible candidates and freed nothing while allocation
 * carried on — VRAM climbed until the WebGL context was lost and the map went grey.
 *
 * At 512² RGBA per layer a tile costs ~3 MB at every level.
 */
const BYTES_PER_CELL_MB = 3;
/** Full-detail cells kept on the GPU (~370 MB). Must exceed what a working view streams. */
const MAX_RESIDENT_CELLS = 124;

/** Pyramid level. 0 is what the brushes paint; higher levels are derived on the server. */
export type DetailLevel = number;

/**
 * Tiles a screenful should need.
 *
 * The level is chosen to keep the count near this at *any* zoom — that constant is the
 * whole point of a pyramid. The previous two-level scheme only made distant tiles cheaper
 * while their number still grew as zoom⁻², which no budget could absorb.
 */
const TARGET_TILES = 64;
/** Safety valve only — the level choice already keeps the count near `TARGET_TILES`. */
const MAX_STREAM_CELLS = 100;

export class ChunkManager {
  private chunks = new Map<string, ChunkRecord>();
  private frame = 0;
  /** Scratch container reused for every stamp, so painting allocates nothing per stroke. */
  private stampHost = new Container();

  /** Raised when a chunk's pixels change from a fetch, so the view can refresh. */
  onChunkUpdated?: (rec: ChunkRecord) => void;
  /** Raised when a chunk is evicted, so the view can drop anything referencing it. */
  onChunkDisposed?: (layer: RasterLayer, cx: number, cy: number) => void;
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

  /** Records are keyed by level too, so a cell can hold both resolutions at once. */
  private recKey(layer: RasterLayer, cx: number, cy: number, level: DetailLevel): string {
    return level === 0 ? chunkKey(layer, cx, cy) : `${chunkKey(layer, cx, cy)}@${level}`;
  }

  /** Every level is the same texture size; only the world area it covers changes. */
  private texelsFor(layer: RasterLayer, _level: DetailLevel): number {
    return LAYER_TEXELS[layer];
  }

  /**
   * Coarsest level that still fills the screen with roughly `TARGET_TILES`.
   *
   * Walking up from 0 means the sharpest level that fits wins, so working zooms stay at
   * level 0 where painting happens and only genuinely wide views climb the pyramid.
   */
  levelFor(bounds: Bounds): DetailLevel {
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;

    for (let level = 0; level < MAX_TILE_LEVEL; level++) {
      const span = tileWorldSize(level);
      if ((Math.ceil(w / span) + 1) * (Math.ceil(h / span) + 1) <= TARGET_TILES) return level;
    }
    return MAX_TILE_LEVEL;
  }

  private create(layer: RasterLayer, cx: number, cy: number, level: DetailLevel): ChunkRecord {
    const texels = this.texelsFor(layer, level);
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
      level,
      texture,
      loaded: false,
      dirty: false,
      uploading: false,
      lastSeen: this.frame,
    };
    this.chunks.set(this.recKey(layer, cx, cy, level), rec);

    // Level 0 knows from the document whether anything was ever painted here; derived
    // levels have no such record, so they always ask and treat 404 as empty ocean.
    if (level > 0 || this.store.chunkExists(layer, cx, cy)) void this.fetchInto(rec);
    else rec.loaded = true; // never painted — the cleared texture is already correct

    return rec;
  }

  /** Resident record for a chunk at a level, creating and queueing a load if absent. */
  get(layer: RasterLayer, cx: number, cy: number, level: DetailLevel = 0): ChunkRecord {
    const rec = this.chunks.get(this.recKey(layer, cx, cy, level));
    if (rec) {
      rec.lastSeen = this.frame;
      return rec;
    }
    return this.create(layer, cx, cy, level);
  }

  /** Whether a level's copy of a chunk exists and has its pixels. */
  isReady(layer: RasterLayer, cx: number, cy: number, level: DetailLevel): boolean {
    const rec = this.chunks.get(this.recKey(layer, cx, cy, level));
    return !!rec && rec.loaded && this.isUsable(rec);
  }

  /**
   * Whether *every* layer of a cell is loaded at a level.
   *
   * Layers are fetched independently, so a cell can have its height while its land colour
   * is still in flight — and the terrain shader will happily draw that as correctly-shaped
   * land with no colour on it. Showing a cell only once all three are in is what stops
   * blocks of the map flashing white as they stream.
   */
  isCellReady(cx: number, cy: number, level: DetailLevel): boolean {
    return RASTER_LAYERS.every(layer => this.isReady(layer, cx, cy, level));
  }

  private async fetchInto(rec: ChunkRecord): Promise<void> {
    const ver = rec.level === 0 ? this.store.chunkVersion(rec.layer, rec.cx, rec.cy) : 0;
    const blob = await this.api.fetchTile(
      this.worldName,
      rec.layer,
      rec.cx,
      rec.cy,
      rec.level,
      ver,
    );
    if (!blob) {
      // Nothing stored: the cleared texture is already correct, but the view still needs
      // telling, since it holds cells back until every layer reports in.
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
      return;
    }

    // The chunk may have been evicted while the fetch was in flight.
    if (this.chunks.get(this.recKey(rec.layer, rec.cx, rec.cy, rec.level)) !== rec) return;
    if (!this.isUsable(rec)) return;

    try {
      const bitmap = await createImageBitmap(blob);
      const tex = Texture.from(bitmap);
      const sprite = new Sprite(tex);
      // Stored chunks may predate a resolution change, so scale to the current size rather
      // than assuming the PNG matches — otherwise old terrain would load into a corner.
      const size = this.texelsFor(rec.layer, rec.level);
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
      this.onChunkUpdated?.(rec);
    } catch (err) {
      console.error('[ChunkManager] Failed to decode chunk', rec.layer, rec.cx, rec.cy, err);
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
    }
  }

  /**
   * Ensure chunks covering `bounds` are resident and evict distant ones.
   * Call once per frame with the camera's visible bounds plus a margin.
   */
  update(bounds: Bounds): void {
    this.frame++;

    this.level = this.levelFor(bounds);
    const span = tileWorldSize(this.level);

    const minCx = Math.floor(bounds.minX / span);
    const maxCx = Math.floor(bounds.maxX / span);
    const minCy = Math.floor(bounds.minY / span);
    const maxCy = Math.floor(bounds.maxY / span);

    const wantedCells = (maxCx - minCx + 1) * (maxCy - minCy + 1);

    /*
     * Pick the detail level from how much is on screen. Under the full-detail budget the
     * view streams real chunks; past it the overview copies take over, which cost 1/64th
     * the memory and so can cover a view that full-resolution chunks never could.
     */
    // The level already sized the view, so this only guards against a pathological case.
    const streaming = wantedCells <= MAX_STREAM_CELLS;

    if (streaming) {
      for (const layer of RASTER_LAYERS) {
        for (let cy = minCy; cy <= maxCy; cy++) {
          for (let cx = minCx; cx <= maxCx; cx++) {
            const rec = this.chunks.get(this.recKey(layer, cx, cy, this.level));
            if (rec) rec.lastSeen = this.frame;
            else this.create(layer, cx, cy, this.level);
          }
        }
      }
    } else {
      /*
       * Beyond even the overview budget the cell range can be tens of thousands of
       * positions while residency is capped in the low thousands. Sweeping the range to
       * mark visibility then costs far more than sweeping what actually exists — and it was
       * pure waste, since nothing new can be created here anyway.
       */
      for (const rec of this.chunks.values()) {
        if (rec.cx >= minCx && rec.cx <= maxCx && rec.cy >= minCy && rec.cy <= maxCy) {
          rec.lastSeen = this.frame;
        }
      }
    }

    this.evict();
  }

  /**
   * Cells painted recently, and the frame they were last touched.
   *
   * Painting creates full-resolution chunks even when the view is showing the overview, and
   * nothing else marks those as visible. Once a stroke flushed they lost their dirty pin,
   * were evicted immediately, and the next stroke had to re-fetch every one of them — which
   * is exactly the stutter, and the chunks vanishing and coming back, that appears when
   * drawing zoomed out. Keeping them hot for a while means working in one area stays
   * resident regardless of which level is on screen.
   */
  private hotCells = new Map<string, number>();

  /** Detail level the last `update` settled on. */
  get detailLevel(): DetailLevel {
    return this.level;
  }

  private level: DetailLevel = 0;

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
    // One budget per level: a level being viewed must not evict the one you paint on.
    const levels = new Set<DetailLevel>([0, this.level]);
    for (const rec of this.chunks.values()) levels.add(rec.level);
    for (const level of levels) this.evictLevel(level, MAX_RESIDENT_CELLS);
  }

  /** Enforce one level's cell budget without disturbing the other's. */
  private evictLevel(level: DetailLevel, maxCells: number): void {
    const budget = maxCells * RASTER_LAYERS.length;
    const ofLevel = [...this.chunks.values()].filter(r => r.level === level);
    if (ofLevel.length <= budget) return;

    // Group by cell, ranking each by its *most* recently seen layer.
    const cells = new Map<string, { recs: ChunkRecord[]; lastSeen: number; pinned: boolean }>();
    for (const rec of ofLevel) {
      const key = `${rec.cx}/${rec.cy}`;
      const cell = cells.get(key);
      const pinned = rec.dirty || rec.uploading || rec.lastSeen === this.frame;
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

    let excess = ofLevel.length - budget;
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
    if (excess > 0 && level === 0 && !this.warnedOverBudget) {
      this.warnedOverBudget = true;
      console.warn(
        `[ChunkManager] over residency budget at level ${level}: ${ofLevel.length} chunks ` +
          `(~${Math.round((ofLevel.length / RASTER_LAYERS.length) * BYTES_PER_CELL_MB)} MB) ` +
          'and none evictable. Lower MAX_STREAM_CELLS or the layer resolution.',
      );
    }
  }

  private warnedOverBudget = false;

  private dispose(rec: ChunkRecord): void {
    this.chunks.delete(this.recKey(rec.layer, rec.cx, rec.cy, rec.level));
    this.onChunkDisposed?.(rec.layer, rec.cx, rec.cy);
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
   * Stamp a world-positioned display object into every chunk of `layer` it covers.
   *
   * `node` is expressed in world coordinates; this applies the per-chunk transform into
   * chunk-local texel space, so callers never deal with chunk math. Set `node.blendMode` to
   * `'erase'` to subtract instead of add.
   */
  paintWorld(layer: RasterLayer, node: Container, bounds: Bounds): ChunkRecord[] {
    const minCx = Math.floor(bounds.minX / CHUNK_WORLD_SIZE);
    const maxCx = Math.floor(bounds.maxX / CHUNK_WORLD_SIZE);
    const minCy = Math.floor(bounds.minY / CHUNK_WORLD_SIZE);
    const maxCy = Math.floor(bounds.maxY / CHUNK_WORLD_SIZE);

    const touched: ChunkRecord[] = [];

    this.stampHost.removeChildren();
    this.stampHost.addChild(node);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        // Full detail is where the stroke actually lives and what gets uploaded.
        const rec = this.get(layer, cx, cy);
        this.onBeforePaint?.(rec);
        this.stamp(rec);
        rec.dirty = true;
        touched.push(rec);
        this.hotCells.set(`${cx}/${cy}`, this.frame);

        /*
         * Mirror the stroke into any resident ancestor.
         *
         * The view may be showing a coarser level than the one being painted — at ordinary
         * working zooms it usually is. Those tiles are only rebuilt server-side after the
         * upload, so without this a stroke would appear to do nothing for a second. Each
         * level halves the coordinates, and `stamp` derives its transform from the record,
         * so the same world-space brush lands correctly at every scale.
         */
        let px = cx;
        let py = cy;
        for (let level = 1; level <= MAX_TILE_LEVEL; level++) {
          px = Math.floor(px / 2);
          py = Math.floor(py / 2);
          const parent = this.chunks.get(this.recKey(layer, px, py, level));
          if (parent && this.isUsable(parent)) this.stamp(parent);
        }

      }
    }

    this.stampHost.removeChildren();
    return touched;
  }

  /** Render the current stamp host into one tile, in that tile's own texel space. */
  private stamp(rec: ChunkRecord): void {
    const span = tileWorldSize(rec.level);
    const s = this.texelsFor(rec.layer, rec.level) / span; // world px → texels
    // World → this tile's texel space: translate to the tile origin, then scale.
    const m = new Matrix(s, 0, 0, s, -rec.cx * span * s, -rec.cy * span * s);

    this.renderer.render({
      container: this.stampHost,
      target: rec.texture,
      clear: false,
      transform: m,
    });
  }

  /**
   * Read a single texel of a layer at a world position.
   *
   * Used to colour `sample_color` symbols from the ground actually beneath them, which is
   * what Wonderdraft does — taking a global land colour instead would be visibly wrong
   * wherever the map has been painted more than one shade.
   *
   * This is a GPU readback and therefore a stall, so it must stay on discrete actions
   * (placing or moving a symbol), never anything per-frame.
   *
   * Returns null where nothing has been painted, so callers can fall back.
   */
  sampleWorld(layer: RasterLayer, x: number, y: number): { r: number; g: number; b: number } | null {
    const cx = Math.floor(x / CHUNK_WORLD_SIZE);
    const cy = Math.floor(y / CHUNK_WORLD_SIZE);
    const rec = this.chunks.get(chunkKey(layer, cx, cy));
    if (!rec || !rec.loaded || !this.isUsable(rec)) return null;

    const s = 1 / layerScale(layer);
    const tx = Math.floor((x - cx * CHUNK_WORLD_SIZE) * s);
    const ty = Math.floor((y - cy * CHUNK_WORLD_SIZE) * s);
    const texels = LAYER_TEXELS[layer];
    if (tx < 0 || ty < 0 || tx >= texels || ty >= texels) return null;

    try {
      const out = this.renderer.extract.pixels({
        target: rec.texture,
        frame: new Rectangle(tx, ty, 1, 1),
      });
      const pixels = out?.pixels;
      if (!pixels) return null;

      /*
       * Do not assume the frame was honoured. When it is, we get a single texel back and
       * the value is at index 0; when it is not, we get the whole chunk and index 0 is its
       * top-left corner — which is unpainted almost everywhere, so every sample came back
       * "unpainted" and symbols fell through to white. Derive the index from the returned
       * width instead of trusting either behaviour.
       */
      const w = out.width || 1;
      const i = w === 1 ? 0 : (ty * w + tx) * 4;
      if (i + 3 >= pixels.length) return null;

      // Alpha is coverage; nothing painted here is not a colour.
      if (pixels[i + 3] < 8) return null;
      return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
    } catch (err) {
      console.error('[ChunkManager] sampleWorld failed', err);
      return null;
    }
  }

  /**
   * Copy a chunk's pixels into an independent texture, for the undo stack.
   *
   * Deliberately not `extract.texture()`: given a Texture that returns *the same object*
   * back rather than a copy. The undo stack then held the live chunk, so restoring blitted
   * a texture into itself — the "feedback loop between framebuffer and active texture" GL
   * error — and its memory trim destroyed live map chunks, cutting holes in the map.
   *
   * Rendering through a fresh RenderTexture is the only way to be sure the pixels are
   * genuinely detached from the chunk they came from.
   */
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
  restore(layer: RasterLayer, cx: number, cy: number, snap: Texture): void {
    const rec = this.get(layer, cx, cy);
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
    const dirty = [...this.chunks.values()].filter(
      r => r.dirty && !r.uploading && r.level === 0,
    );
    if (dirty.length === 0) return;

    /*
     * Uploaded a few at a time rather than all at once.
     *
     * Each chunk means a GPU readback plus a PNG encode of a 512² texture. Firing every
     * dirty chunk in parallel put all of those readbacks in one frame, which is the hitch
     * that shows up after a broad stroke — worst when zoomed out, where one stroke covers
     * many chunks. Working through them in small batches spreads the cost over a few frames
     * and leaves the editor responsive while it saves.
     */
    const BATCH = 3;
    for (let i = 0; i < dirty.length; i += BATCH) {
      await Promise.all(dirty.slice(i, i + BATCH).map(rec => this.uploadChunk(rec)));
      // Yield between batches so input and rendering get a turn.
      if (i + BATCH < dirty.length) await new Promise(r => setTimeout(r, 0));
    }
  }

  private async uploadChunk(rec: ChunkRecord): Promise<void> {
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
      const ver = await this.api.putChunk(this.worldName, rec.layer, rec.cx, rec.cy, blob);
      if (ver == null) {
        rec.dirty = true; // upload failed — try again on the next flush
        return;
      }
      this.store.announceChunk(rec.layer, rec.cx, rec.cy, ver);
      // Every derived tile above this chunk is now stale; pull the rebuilt ones.
      this.refreshParents(rec.layer, rec.cx, rec.cy);
    } catch (err) {
      console.error('[ChunkManager] Chunk flush failed', rec.layer, rec.cx, rec.cy, err);
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
   * Refetch every resident ancestor of a chunk that just changed.
   *
   * The server deletes derived tiles when their child is written and rebuilds them on the
   * next request, so this only has to ask again. Walking the ancestry rather than guessing
   * matters because each level halves the coordinates — a level-3 tile covers eight chunks
   * per side, so the same chunk maps to a different `cx,cy` at every level.
   */
  private refreshParents(layer: RasterLayer, cx: number, cy: number): void {
    let px = cx;
    let py = cy;
    for (let level = 1; level <= MAX_TILE_LEVEL; level++) {
      px = Math.floor(px / 2);
      py = Math.floor(py / 2);
      const rec = this.chunks.get(this.recKey(layer, px, py, level));
      if (rec && this.isUsable(rec) && !rec.dirty && !rec.uploading) void this.fetchInto(rec);
    }
  }

  /** Another client changed this chunk — refetch it if we have it resident. */
  invalidate(layer: RasterLayer, cx: number, cy: number): void {
    const rec = this.chunks.get(this.recKey(layer, cx, cy, 0));
    // Local unsaved paint wins; our own flush will publish it shortly.
    if (rec && !rec.dirty && !rec.uploading) void this.fetchInto(rec);
    this.refreshParents(layer, cx, cy);
  }

  hasPendingWork(): boolean {
    return [...this.chunks.values()].some(r => r.dirty || r.uploading);
  }

  destroy(): void {
    for (const rec of [...this.chunks.values()]) this.dispose(rec);
    this.chunks.clear();
    this.stampHost.destroy();
  }
}
