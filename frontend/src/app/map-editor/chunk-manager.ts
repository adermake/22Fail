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
  /** Detail level: 0 = full resolution, 1 = the low-memory overview copy. */
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
 * At 512² RGBA per layer a cell costs ~3 MB, so the resident cap is roughly 190 MB.
 */
const BYTES_PER_CELL_MB = 3;
/** Full-detail cells kept on the GPU (~310 MB). Must exceed what a working view streams. */
const MAX_RESIDENT_CELLS = 104;

/**
 * Detail levels.
 *
 * A wide view needs hundreds of cells, and at full resolution that is over a gigabyte of
 * texture — not a budget that can be raised, it is off by an order of magnitude. So chunks
 * also exist at 1/8 scale, which is 1/64th the memory: the same view costs tens of
 * megabytes instead, and the map is visible to its edges rather than through a porthole.
 *
 * The server side needs no changes at all. A chunk is one PNG; the low level simply renders
 * it into a smaller texture, and the downscale happens on upload to the GPU.
 */
export type DetailLevel = 0 | 1;
const LOW_TEXELS = 64;
/** Overview cells resident (~66 MB at 3 layers × 16 KB). */
const MAX_LOW_CELLS = 1400;
/**
 * Above this many cells in view, stop streaming *new* ones and render what is resident.
 * Kept below the resident cap so the evictor always has slack to work with.
 *
 * Sized so ordinary working zooms stream fully and only a far zoom-out is capped, where
 * incomplete terrain is the intended trade rather than a bug.
 */
const MAX_STREAM_CELLS = 84;

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

  private texelsFor(layer: RasterLayer, level: DetailLevel): number {
    return level === 0 ? LAYER_TEXELS[layer] : LOW_TEXELS;
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

    if (this.store.chunkExists(layer, cx, cy)) void this.fetchInto(rec);
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
    const ver = this.store.chunkVersion(rec.layer, rec.cx, rec.cy);
    const blob = await this.api.fetchChunk(this.worldName, rec.layer, rec.cx, rec.cy, ver);
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

    const minCx = Math.floor(bounds.minX / CHUNK_WORLD_SIZE);
    const maxCx = Math.floor(bounds.maxX / CHUNK_WORLD_SIZE);
    const minCy = Math.floor(bounds.minY / CHUNK_WORLD_SIZE);
    const maxCy = Math.floor(bounds.maxY / CHUNK_WORLD_SIZE);

    const wantedCells = (maxCx - minCx + 1) * (maxCy - minCy + 1);

    /*
     * Pick the detail level from how much is on screen. Under the full-detail budget the
     * view streams real chunks; past it the overview copies take over, which cost 1/64th
     * the memory and so can cover a view that full-resolution chunks never could.
     */
    /*
     * Hysteresis on the switch. With a single threshold, a zoom that hovers near it flips
     * level every few frames, and each flip rebuilds every mesh on screen — which is what
     * made zooming choppy. Coming back down to full detail needs a clearly smaller view
     * than going up to the overview did.
     */
    if (this.level === 0 && wantedCells > MAX_STREAM_CELLS) this.level = 1;
    else if (this.level === 1 && wantedCells < MAX_STREAM_CELLS * 0.65) this.level = 0;

    const cap = this.level === 0 ? MAX_STREAM_CELLS : MAX_LOW_CELLS;
    const streaming = wantedCells <= cap;

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
    this.evictLevel(0, MAX_RESIDENT_CELLS);
    this.evictLevel(1, MAX_LOW_CELLS);
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
        this.stamp(rec, cx, cy);
        rec.dirty = true;
        touched.push(rec);

        /*
         * Mirror the stroke into the overview copy when one is resident.
         *
         * Both levels come from the same PNG, but only on the next flush — so while zoomed
         * out, where the overview is what is actually on screen, painting would otherwise
         * appear to do nothing until the upload landed a second later.
         */
        const low = this.chunks.get(this.recKey(layer, cx, cy, 1));
        if (low && this.isUsable(low)) this.stamp(low, cx, cy);
      }
    }

    this.stampHost.removeChildren();
    return touched;
  }

  /** Render the current stamp host into one chunk, in that chunk's texel space. */
  private stamp(rec: ChunkRecord, cx: number, cy: number): void {
    const s = this.texelsFor(rec.layer, rec.level) / CHUNK_WORLD_SIZE; // world px → texels
    // World → this chunk's texel space: translate to the chunk origin, then scale.
    const m = new Matrix(s, 0, 0, s, -cx * CHUNK_WORLD_SIZE * s, -cy * CHUNK_WORLD_SIZE * s);

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
    const dirty = [...this.chunks.values()].filter(r => r.dirty && !r.uploading);
    if (dirty.length === 0) return;

    await Promise.all(
      dirty.map(async rec => {
        rec.uploading = true;
        // Cleared before the upload: a stroke landing mid-flight must re-dirty the chunk,
        // otherwise the newer paint would never be saved.
        rec.dirty = false;
        try {
          const blob = await this.toBlob(rec);
          if (!blob) return;
          const ver = await this.api.putChunk(this.worldName, rec.layer, rec.cx, rec.cy, blob);
          if (ver == null) {
            rec.dirty = true; // upload failed — try again on the next flush
            return;
          }
          this.store.announceChunk(rec.layer, rec.cx, rec.cy, ver);
          // The overview copy of this cell is now stale; reload it from the new PNG.
          this.refreshLow(rec.layer, rec.cx, rec.cy);
        } catch (err) {
          console.error('[ChunkManager] Chunk flush failed', rec.layer, rec.cx, rec.cy, err);
          rec.dirty = true;
        } finally {
          rec.uploading = false;
        }
      }),
    );
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
   * Re-pull the low-detail copy after the full one changed.
   *
   * Both levels come from the same stored PNG, so the overview only needs refetching once
   * the new pixels have actually been uploaded — hence this runs after a successful flush
   * rather than at stroke end.
   */
  private refreshLow(layer: RasterLayer, cx: number, cy: number): void {
    const low = this.chunks.get(this.recKey(layer, cx, cy, 1));
    if (low && this.isUsable(low)) void this.fetchInto(low);
  }

  /** Another client changed this chunk — refetch it if we have it resident. */
  invalidate(layer: RasterLayer, cx: number, cy: number): void {
    for (const level of [0, 1] as const) {
      const rec = this.chunks.get(this.recKey(layer, cx, cy, level));
      if (!rec) continue;
      // Local unsaved paint wins; our own flush will publish it shortly.
      if (rec.dirty || rec.uploading) continue;
      void this.fetchInto(rec);
    }
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
