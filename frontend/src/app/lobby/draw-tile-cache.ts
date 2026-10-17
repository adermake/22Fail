import { DrawBitmap, Stroke } from '../model/lobby.model';
import {
  bitmapDrawOrder,
  drawStrokeOnContext,
  getBitmapBounds,
  getStrokeBounds,
  getStrokeLayerId,
  strokeDrawOrder,
} from './draw-layer.utils';

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

interface Item {
  ref: Stroke | DrawBitmap;
  order: number;
  bounds: Bounds;
  isBitmap: boolean;
}

interface Tile {
  /** null = nothing on this tile, costs no memory */
  canvas: HTMLCanvasElement | null;
  layerId: string;
  bounds: Bounds;
  /** A bitmap was not decoded yet — re-render on the next frame that draws this tile */
  stale: boolean;
}

export interface DrawTileView {
  panX: number;
  panY: number;
  scale: number;
  dpr: number;
  /** Viewport size in CSS pixels */
  width: number;
  height: number;
}

/** Draws a bitmap item; returns false while its image is still decoding. */
export type TileBitmapDrawFn = (ctx: CanvasRenderingContext2D, bmp: DrawBitmap) => boolean;

const TILE_PX = 512;
const MIN_CACHED_TILES = 192;
/** Above this many changed items a layer is simply dropped instead of diffed tile by tile */
const MAX_DIFF_ITEMS = 400;

/**
 * Rasterised world-space tiles per draw layer.
 *
 * Redrawing every stroke point by point on each frame made large drawn maps crawl — panning,
 * zooming and even drawing a new line re-stroked the whole map. Tiles are rendered once per zoom
 * level (half-octave steps, so a tile is never stretched more than ~19 %) and only the tiles under
 * a changed stroke or bitmap are re-rendered. Each layer has its own tiles, so erasers stay
 * layer-local exactly as with the old per-layer offscreen canvas.
 */
export class DrawTileCache {
  /** Insertion order doubles as LRU order */
  private tiles = new Map<string, Tile>();
  private layers = new Map<string, Item[]>();
  private boundsCache = new WeakMap<object, Bounds>();
  private version: unknown = undefined;
  private defaultLayerId: string | null | undefined = undefined;
  private dpr = 0;

  /**
   * Bring the cache up to date. `version` must change whenever the stroke/bitmap content may
   * have changed — the lobby store replaces the map object on every patch.
   */
  sync(version: unknown, strokes: Stroke[], bitmaps: DrawBitmap[], defaultLayerId: string | null): void {
    if (version === this.version && defaultLayerId === this.defaultLayerId) return;
    const layerResolutionChanged = defaultLayerId !== this.defaultLayerId;
    this.version = version;
    this.defaultLayerId = defaultLayerId;

    const next = new Map<string, Item[]>();
    const add = (layerId: string, item: Item) => {
      let list = next.get(layerId);
      if (!list) {
        list = [];
        next.set(layerId, list);
      }
      list.push(item);
    };

    strokes.forEach((stroke, index) => {
      const layerId = getStrokeLayerId(stroke, defaultLayerId);
      if (!layerId) return;
      add(layerId, {
        ref: stroke,
        order: strokeDrawOrder(stroke, index),
        bounds: this.boundsOf(stroke, false),
        isBitmap: false,
      });
    });
    bitmaps.forEach((bmp, index) => {
      add(bmp.layerId, {
        ref: bmp,
        order: bitmapDrawOrder(bmp, index, strokes.length),
        bounds: this.boundsOf(bmp, true),
        isBitmap: true,
      });
    });
    for (const list of next.values()) list.sort((a, b) => a.order - b.order);

    if (layerResolutionChanged) {
      this.tiles.clear();
    } else {
      for (const [layerId, oldItems] of this.layers) {
        this.invalidateChanges(layerId, oldItems, next.get(layerId) ?? []);
      }
    }
    this.layers = next;
  }

  /**
   * Blit one layer's visible tiles onto `ctx` (any transform; drawn in device pixels).
   * Missing tiles are rendered on demand.
   */
  drawLayer(ctx: CanvasRenderingContext2D, layerId: string, view: DrawTileView, drawBitmap: TileBitmapDrawFn): void {
    if (view.dpr !== this.dpr) {
      this.tiles.clear();
      this.dpr = view.dpr;
    }
    const items = this.layers.get(layerId);
    if (!items || items.length === 0) return;

    const level = Math.max(-20, Math.min(10, Math.round(Math.log2(view.scale) * 2)));
    const pxScale = Math.pow(2, level / 2) * view.dpr;
    const worldSize = TILE_PX / pxScale;

    const x0 = -view.panX / view.scale;
    const y0 = -view.panY / view.scale;
    const x1 = x0 + view.width / view.scale;
    const y1 = y0 + view.height / view.scale;
    const tx0 = Math.floor(x0 / worldSize);
    const ty0 = Math.floor(y0 / worldSize);
    const tx1 = Math.floor(x1 / worldSize);
    const ty1 = Math.floor(y1 / worldSize);

    // World -> device pixels for the target canvas
    const k = view.scale * view.dpr;
    const ox = view.panX * view.dpr;
    const oy = view.panY * view.dpr;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;

    let visible = 0;
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        visible++;
        const key = `${layerId}|${level}|${tx}|${ty}`;
        let tile = this.tiles.get(key);
        if (tile) this.tiles.delete(key);
        if (!tile || tile.stale) {
          tile = this.renderTile(layerId, items, tx * worldSize, ty * worldSize, worldSize, pxScale, drawBitmap);
        }
        this.tiles.set(key, tile);
        if (!tile.canvas) continue;

        // Round both edges so neighbouring tiles share them exactly — no hairline seams
        const dx0 = Math.round(tile.bounds.minX * k + ox);
        const dy0 = Math.round(tile.bounds.minY * k + oy);
        const dx1 = Math.round(tile.bounds.maxX * k + ox);
        const dy1 = Math.round(tile.bounds.maxY * k + oy);
        ctx.drawImage(tile.canvas, dx0, dy0, dx1 - dx0, dy1 - dy0);
      }
    }
    ctx.restore();

    this.evict(Math.max(MIN_CACHED_TILES, visible * 3));
  }

  private renderTile(
    layerId: string,
    items: Item[],
    worldX: number,
    worldY: number,
    worldSize: number,
    pxScale: number,
    drawBitmap: TileBitmapDrawFn
  ): Tile {
    const bounds = { minX: worldX, minY: worldY, maxX: worldX + worldSize, maxY: worldY + worldSize };
    const tile: Tile = { canvas: null, layerId, bounds, stale: false };

    let ctx: CanvasRenderingContext2D | null = null;
    for (const item of items) {
      if (!overlaps(item.bounds, bounds)) continue;
      if (!ctx) {
        // Lazily allocated: an eraser alone on an empty tile still needs nothing
        if (isEraserStroke(item)) continue;
        tile.canvas = document.createElement('canvas');
        tile.canvas.width = TILE_PX;
        tile.canvas.height = TILE_PX;
        ctx = tile.canvas.getContext('2d')!;
        ctx.setTransform(pxScale, 0, 0, pxScale, -worldX * pxScale, -worldY * pxScale);
      }
      if (item.isBitmap) {
        ctx.globalCompositeOperation = 'source-over';
        if (!drawBitmap(ctx, item.ref as DrawBitmap)) tile.stale = true;
      } else {
        drawStrokeOnContext(ctx, item.ref as Stroke);
      }
    }
    if (ctx) ctx.globalCompositeOperation = 'source-over';
    return tile;
  }

  /** Drop only the tiles under items that were added, removed or reordered */
  private invalidateChanges(layerId: string, oldItems: Item[], newItems: Item[]): void {
    const previous = new Map<object, Item>();
    for (const item of oldItems) previous.set(item.ref, item);

    const dirty: Bounds[] = [];
    for (const item of newItems) {
      const old = previous.get(item.ref);
      if (old && old.order === item.order) {
        previous.delete(item.ref);
      } else {
        dirty.push(item.bounds);
      }
    }
    for (const removed of previous.values()) dirty.push(removed.bounds);
    if (dirty.length === 0) return;

    const dropAll = dirty.length > MAX_DIFF_ITEMS;
    for (const [key, tile] of this.tiles) {
      if (tile.layerId !== layerId) continue;
      if (dropAll || dirty.some(b => overlaps(b, tile.bounds))) this.tiles.delete(key);
    }
  }

  private evict(limit: number): void {
    if (this.tiles.size <= limit) return;
    let excess = this.tiles.size - limit;
    for (const key of this.tiles.keys()) {
      if (excess-- <= 0) break;
      this.tiles.delete(key);
    }
  }

  private boundsOf(ref: Stroke | DrawBitmap, isBitmap: boolean): Bounds {
    let b = this.boundsCache.get(ref);
    if (!b) {
      b = isBitmap ? getBitmapBounds(ref as DrawBitmap) : getStrokeBounds(ref as Stroke);
      this.boundsCache.set(ref, b);
    }
    return b;
  }
}

function overlaps(a: Bounds, b: Bounds): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

function isEraserStroke(item: Item): boolean {
  return !item.isBitmap && (item.ref as Stroke).isEraser;
}
