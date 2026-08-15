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
  texture: RenderTexture;
  /** Pixels fetched, or confirmed never painted. */
  loaded: boolean;
  /** Painted since the last successful upload. */
  dirty: boolean;
  uploading: boolean;
  /** Frame counter at last visibility, for LRU eviction. */
  lastSeen: number;
}

/**
 * Resident-chunk ceiling across all layers. At the current resolution a height chunk is
 * 1024² RGBA (4 MB) and a colour chunk 512² (1 MB), so a cell costs ~6 MB across the three
 * layers. This holds GPU residency to roughly 300 MB worst case.
 */
const MAX_RESIDENT_CHUNKS = 72;

/**
 * Above this many chunks in view, stop streaming *new* ones and render whatever is already
 * resident. Without it, zooming all the way out would queue thousands of fetches at once.
 */
const MAX_STREAM_CHUNKS = 96;

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

  private create(layer: RasterLayer, cx: number, cy: number): ChunkRecord {
    const texels = LAYER_TEXELS[layer];
    // Linear filtering is essential: with nearest, every texel edge shows as a hard block
    // and the whole map reads as pixel art however high the resolution goes.
    const texture = RenderTexture.create({
      width: texels,
      height: texels,
      scaleMode: 'linear',
      antialias: true,
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
      texture,
      loaded: false,
      dirty: false,
      uploading: false,
      lastSeen: this.frame,
    };
    this.chunks.set(chunkKey(layer, cx, cy), rec);

    if (this.store.chunkExists(layer, cx, cy)) void this.fetchInto(rec);
    else rec.loaded = true; // never painted — the cleared texture is already correct

    return rec;
  }

  /** Resident record for a chunk, creating and queueing a load if absent. */
  get(layer: RasterLayer, cx: number, cy: number): ChunkRecord {
    const rec = this.chunks.get(chunkKey(layer, cx, cy));
    if (rec) {
      rec.lastSeen = this.frame;
      return rec;
    }
    return this.create(layer, cx, cy);
  }

  private async fetchInto(rec: ChunkRecord): Promise<void> {
    const ver = this.store.chunkVersion(rec.layer, rec.cx, rec.cy);
    const blob = await this.api.fetchChunk(this.worldName, rec.layer, rec.cx, rec.cy, ver);
    if (!blob) {
      rec.loaded = true;
      return;
    }

    // The chunk may have been evicted while the fetch was in flight.
    if (this.chunks.get(chunkKey(rec.layer, rec.cx, rec.cy)) !== rec) return;

    try {
      const bitmap = await createImageBitmap(blob);
      const tex = Texture.from(bitmap);
      const sprite = new Sprite(tex);
      // Stored chunks may predate a resolution change, so scale to the current size rather
      // than assuming the PNG matches — otherwise old terrain would load into a corner.
      sprite.setSize(LAYER_TEXELS[rec.layer], LAYER_TEXELS[rec.layer]);

      this.stampHost.removeChildren();
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

    const wanted = (maxCx - minCx + 1) * (maxCy - minCy + 1);
    // Zoomed far enough out that streaming detail is pointless; coast on what we have.
    const streaming = wanted <= MAX_STREAM_CHUNKS;

    for (const layer of RASTER_LAYERS) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const key = chunkKey(layer, cx, cy);
          const rec = this.chunks.get(key);
          if (rec) rec.lastSeen = this.frame;
          else if (streaming) this.create(layer, cx, cy);
        }
      }
    }

    this.evict();
  }

  /** Drop the least recently seen chunks once over budget. Never drops unsaved work. */
  private evict(): void {
    if (this.chunks.size <= MAX_RESIDENT_CHUNKS) return;

    const candidates = [...this.chunks.values()]
      .filter(r => !r.dirty && !r.uploading && r.lastSeen !== this.frame)
      .sort((a, b) => a.lastSeen - b.lastSeen);

    let excess = this.chunks.size - MAX_RESIDENT_CHUNKS;
    for (const rec of candidates) {
      if (excess-- <= 0) break;
      this.dispose(rec);
    }
  }

  private dispose(rec: ChunkRecord): void {
    this.chunks.delete(chunkKey(rec.layer, rec.cx, rec.cy));
    this.onChunkDisposed?.(rec.layer, rec.cx, rec.cy);
    rec.texture.destroy(true);
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

    const s = 1 / layerScale(layer); // world px → texels
    const touched: ChunkRecord[] = [];

    this.stampHost.removeChildren();
    this.stampHost.addChild(node);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const rec = this.get(layer, cx, cy);
        this.onBeforePaint?.(rec);

        // World → this chunk's texel space: translate to the chunk origin, then scale.
        const m = new Matrix(s, 0, 0, s, -cx * CHUNK_WORLD_SIZE * s, -cy * CHUNK_WORLD_SIZE * s);

        this.renderer.render({
          container: this.stampHost,
          target: rec.texture,
          clear: false,
          transform: m,
        });

        rec.dirty = true;
        touched.push(rec);
      }
    }

    this.stampHost.removeChildren();
    return touched;
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
    if (!rec || !rec.loaded) return null;

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

  /** Snapshot a chunk's pixels, for the undo stack. */
  snapshot(rec: ChunkRecord): Texture | null {
    try {
      return this.renderer.extract.texture({ target: rec.texture });
    } catch (err) {
      console.error('[ChunkManager] snapshot failed', err);
      return null;
    }
  }

  /** Restore a snapshot taken by `snapshot`, marking the chunk dirty for re-upload. */
  restore(layer: RasterLayer, cx: number, cy: number, snap: Texture): void {
    const rec = this.get(layer, cx, cy);
    const sprite = new Sprite(snap);

    this.stampHost.removeChildren();
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
    const canvas = this.renderer.extract.canvas({ target: rec.texture }) as HTMLCanvasElement &
      Partial<OffscreenCanvas>;

    if (typeof canvas.convertToBlob === 'function') {
      return canvas.convertToBlob({ type: 'image/png' });
    }
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
  }

  /** Another client changed this chunk — refetch it if we have it resident. */
  invalidate(layer: RasterLayer, cx: number, cy: number): void {
    const rec = this.chunks.get(chunkKey(layer, cx, cy));
    if (!rec) return;
    // Local unsaved paint wins; our own flush will publish it shortly.
    if (rec.dirty || rec.uploading) return;
    void this.fetchInto(rec);
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
