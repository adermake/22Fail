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
 */

import {
  Container,
  Matrix,
  Renderer,
  RenderTexture,
  Sprite,
  Texture,
} from 'pixi.js';
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

interface ChunkRecord {
  layer: RasterLayer;
  cx: number;
  cy: number;
  texture: RenderTexture;
  sprite: Sprite;
  /** Pixels fetched, or confirmed never painted. */
  loaded: boolean;
  /** Painted since the last successful upload. */
  dirty: boolean;
  uploading: boolean;
  /** Frame counter at last visibility, for LRU eviction. */
  lastSeen: number;
}

/**
 * Resident-chunk ceiling across all layers. A height chunk is 512² RGBA (1 MB) and a colour
 * chunk 256² (0.25 MB), so this caps GPU residency at roughly 200 MB worst case.
 */
const MAX_RESIDENT_CHUNKS = 192;

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

  constructor(
    private renderer: Renderer,
    private api: MapEditorApiService,
    private store: MapEditorStoreService,
    private worldName: string,
    /** World-space container per layer; chunk sprites are parented here. */
    private layerContainers: Record<RasterLayer, Container>,
  ) {}

  // ── residency ──

  private create(layer: RasterLayer, cx: number, cy: number): ChunkRecord {
    const texels = LAYER_TEXELS[layer];
    const texture = RenderTexture.create({ width: texels, height: texels });

    // A fresh RenderTexture's contents are undefined; clear so unpainted reads as empty.
    this.renderer.render({
      container: this.stampHost,
      target: texture,
      clear: true,
      clearColor: [0, 0, 0, 0],
    });

    const sprite = new Sprite(texture);
    sprite.position.set(cx * CHUNK_WORLD_SIZE, cy * CHUNK_WORLD_SIZE);
    // Texels are coarser than world pixels; scale up to cover the chunk's world square.
    sprite.scale.set(layerScale(layer));
    this.layerContainers[layer].addChild(sprite);

    const rec: ChunkRecord = {
      layer,
      cx,
      cy,
      texture,
      sprite,
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
    if (!this.chunks.has(chunkKey(rec.layer, rec.cx, rec.cy))) return;

    try {
      const bitmap = await createImageBitmap(blob);
      const tex = Texture.from(bitmap);
      const sprite = new Sprite(tex);

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
    rec.sprite.parent?.removeChild(rec.sprite);
    rec.sprite.destroy();
    rec.texture.destroy(true);
    this.chunks.delete(chunkKey(rec.layer, rec.cx, rec.cy));
  }

  // ── painting ──

  /**
   * Stamp a world-positioned display object into every chunk of `layer` it covers.
   *
   * `node` is expressed in world coordinates; this applies the per-chunk transform into
   * chunk-local texel space, so callers never deal with chunk math. Set `node.blendMode` to
   * `'erase'` to subtract instead of add.
   */
  paintWorld(layer: RasterLayer, node: Container, bounds: Bounds): string[] {
    const minCx = Math.floor(bounds.minX / CHUNK_WORLD_SIZE);
    const maxCx = Math.floor(bounds.maxX / CHUNK_WORLD_SIZE);
    const minCy = Math.floor(bounds.minY / CHUNK_WORLD_SIZE);
    const maxCy = Math.floor(bounds.maxY / CHUNK_WORLD_SIZE);

    const s = 1 / layerScale(layer); // world px → texels
    const touched: string[] = [];

    this.stampHost.removeChildren();
    this.stampHost.addChild(node);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const rec = this.get(layer, cx, cy);

        // World → this chunk's texel space: translate to the chunk origin, then scale.
        const m = new Matrix(s, 0, 0, s, -cx * CHUNK_WORLD_SIZE * s, -cy * CHUNK_WORLD_SIZE * s);

        this.renderer.render({
          container: this.stampHost,
          target: rec.texture,
          clear: false,
          transform: m,
        });

        rec.dirty = true;
        touched.push(chunkKey(layer, cx, cy));
      }
    }

    this.stampHost.removeChildren();
    return touched;
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
          const ver = await this.api.putChunk(
            this.worldName,
            rec.layer,
            rec.cx,
            rec.cy,
            blob,
          );
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
