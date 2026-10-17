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
  layerId: string;
  level: number;
  bounds: Bounds;
  /** Items overlapping this tile, in draw order */
  items: Item[];
  /** Index of the next item to rasterise — tiles fill in across frames */
  next: number;
  /** null until the first visible item; stays null for empty tiles (no memory) */
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  pxScale: number;
  /** Bitmap generation this tile is waiting on (a bitmap was still decoding) */
  waitingOnGeneration: number | null;
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
 *
 * Rasterising is time-boxed per frame (`beginFrame`): a tile that isn't finished yet shows the
 * nearest zoom level already in memory, and `drawLayer` reports `false` so the caller schedules
 * another frame. Without this, the first view of a dense map (or each zoom step) froze the UI.
 */
export class DrawTileCache {
  /** Insertion order doubles as LRU order */
  private tiles = new Map<string, Tile>();
  private layers = new Map<string, Item[]>();
  private boundsCache = new WeakMap<object, Bounds>();
  private version: unknown = undefined;
  private defaultLayerId: string | null | undefined = undefined;
  private dpr = 0;
  private deadline = Infinity;
  private bitmapGeneration = 0;

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

  /** Start a frame: rasterising stops once `budgetMs` is used up, across all layers. */
  beginFrame(budgetMs: number): void {
    this.deadline = performance.now() + budgetMs;
  }

  /** A bitmap finished decoding — tiles waiting on one may continue. */
  notifyBitmapLoaded(): void {
    this.bitmapGeneration++;
  }

  /**
   * Blit one layer's visible tiles onto `ctx` (any transform; drawn in device pixels).
   * Returns false if some tile is still being rasterised — call again next frame.
   */
  drawLayer(ctx: CanvasRenderingContext2D, layerId: string, view: DrawTileView, drawBitmap: TileBitmapDrawFn): boolean {
    if (view.dpr !== this.dpr) {
      this.tiles.clear();
      this.dpr = view.dpr;
    }
    const items = this.layers.get(layerId);
    if (!items || items.length === 0) return true;

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

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;

    // Fill tiles nearest the screen centre first
    const cx = (x0 + x1) / 2 / worldSize;
    const cy = (y0 + y1) / 2 / worldSize;
    const visible: { tx: number; ty: number }[] = [];
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) visible.push({ tx, ty });
    }
    visible.sort((a, b) => Math.hypot(a.tx + 0.5 - cx, a.ty + 0.5 - cy) - Math.hypot(b.tx + 0.5 - cx, b.ty + 0.5 - cy));

    let complete = true;
    for (const { tx, ty } of visible) {
      const key = `${layerId}|${level}|${tx}|${ty}`;
      let tile = this.tiles.get(key);
      if (tile) this.tiles.delete(key);
      else tile = this.createTile(layerId, level, items, tx * worldSize, ty * worldSize, worldSize, pxScale);
      this.tiles.set(key, tile);

      const state = this.advanceTile(tile, drawBitmap);
      if (state !== 'done') {
        // A tile waiting on a bitmap is woken by notifyBitmapLoaded + a redraw, not by polling
        if (state === 'budget') complete = false;
        this.drawFallback(ctx, tile, view);
      } else if (tile.canvas) {
        this.blit(ctx, tile, tile.bounds, view);
      }
    }
    ctx.restore();

    this.evict(Math.max(MIN_CACHED_TILES, visible.length * 3));
    return complete;
  }

  private createTile(
    layerId: string,
    level: number,
    items: Item[],
    worldX: number,
    worldY: number,
    worldSize: number,
    pxScale: number
  ): Tile {
    const bounds = { minX: worldX, minY: worldY, maxX: worldX + worldSize, maxY: worldY + worldSize };
    return {
      layerId,
      level,
      bounds,
      items: items.filter(item => overlaps(item.bounds, bounds)),
      next: 0,
      canvas: null,
      ctx: null,
      pxScale,
      waitingOnGeneration: null,
    };
  }

  /** Rasterise more of the tile within the frame budget */
  private advanceTile(tile: Tile, drawBitmap: TileBitmapDrawFn): 'done' | 'budget' | 'waiting' {
    if (tile.next >= tile.items.length) return 'done';
    if (tile.waitingOnGeneration === this.bitmapGeneration) return 'waiting';
    tile.waitingOnGeneration = null;

    while (tile.next < tile.items.length) {
      if (performance.now() > this.deadline) return 'budget';
      const item = tile.items[tile.next];

      if (!tile.ctx) {
        // Lazily allocated: an eraser on an empty tile still needs nothing
        if (isEraserStroke(item)) {
          tile.next++;
          continue;
        }
        tile.canvas = document.createElement('canvas');
        tile.canvas.width = TILE_PX;
        tile.canvas.height = TILE_PX;
        tile.ctx = tile.canvas.getContext('2d')!;
        const s = tile.pxScale;
        tile.ctx.setTransform(s, 0, 0, s, -tile.bounds.minX * s, -tile.bounds.minY * s);
      }

      if (item.isBitmap) {
        tile.ctx.globalCompositeOperation = 'source-over';
        if (!drawBitmap(tile.ctx, item.ref as DrawBitmap)) {
          // Resume here once something finishes decoding — not by redrawing every frame
          tile.waitingOnGeneration = this.bitmapGeneration;
          return 'waiting';
        }
      } else {
        drawStrokeOnContext(tile.ctx, item.ref as Stroke);
      }
      tile.next++;
    }
    if (tile.ctx) tile.ctx.globalCompositeOperation = 'source-over';
    return 'done';
  }

  /** Show finished tiles of other zoom levels (closest level on top) where this one isn't ready */
  private drawFallback(ctx: CanvasRenderingContext2D, missing: Tile, view: DrawTileView): void {
    const candidates: Tile[] = [];
    for (const tile of this.tiles.values()) {
      if (tile === missing || tile.layerId !== missing.layerId || tile.level === missing.level) continue;
      if (!tile.canvas || tile.next < tile.items.length) continue;
      if (overlaps(tile.bounds, missing.bounds)) candidates.push(tile);
    }
    if (candidates.length === 0) return;
    candidates.sort((a, b) => Math.abs(b.level - missing.level) - Math.abs(a.level - missing.level));

    const k = view.scale * view.dpr;
    const ox = view.panX * view.dpr;
    const oy = view.panY * view.dpr;
    ctx.save();
    ctx.beginPath();
    const cx0 = Math.round(missing.bounds.minX * k + ox);
    const cy0 = Math.round(missing.bounds.minY * k + oy);
    ctx.rect(cx0, cy0, Math.round(missing.bounds.maxX * k + ox) - cx0, Math.round(missing.bounds.maxY * k + oy) - cy0);
    ctx.clip();
    for (const tile of candidates) this.blit(ctx, tile, tile.bounds, view);
    ctx.restore();
  }

  private blit(ctx: CanvasRenderingContext2D, tile: Tile, bounds: Bounds, view: DrawTileView): void {
    const k = view.scale * view.dpr;
    const ox = view.panX * view.dpr;
    const oy = view.panY * view.dpr;
    // Round both edges so neighbouring tiles share them exactly — no hairline seams
    const dx0 = Math.round(bounds.minX * k + ox);
    const dy0 = Math.round(bounds.minY * k + oy);
    const dx1 = Math.round(bounds.maxX * k + ox);
    const dy1 = Math.round(bounds.maxY * k + oy);
    ctx.drawImage(tile.canvas!, dx0, dy0, dx1 - dx0, dy1 - dy0);
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
