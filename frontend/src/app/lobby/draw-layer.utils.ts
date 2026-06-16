import { DrawBitmap, Layer, Point, Stroke } from '../model/lobby.model';

export interface DrawLayerSnapshot {
  strokes: Stroke[];
  drawBitmaps: DrawBitmap[];
}

/** Ray-casting point-in-polygon test */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getPolygonBounds(polygon: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of polygon) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function boundsOverlap(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export function getDefaultDrawLayerId(layers: Layer[] | undefined): string | null {
  const drawLayers = (layers || []).filter(l => l.type === 'draw');
  if (drawLayers.length === 0) return null;
  return drawLayers.sort((a, b) => b.zIndex - a.zIndex)[0].id;
}

export function getStrokeLayerId(stroke: Stroke, defaultLayerId: string | null): string | null {
  return stroke.layerId || defaultLayerId;
}

function strokeDrawOrder(stroke: Stroke, index: number): number {
  return stroke.drawOrder ?? index;
}

function bitmapDrawOrder(bmp: DrawBitmap, index: number, strokeCount: number): number {
  return bmp.drawOrder ?? strokeCount + index;
}

export function drawStrokeOnContext(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const minPoints = stroke.isEraserFill ? 3 : 2;
  if (stroke.points.length < minPoints) return;

  ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  if (stroke.isEraserFill) {
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
  } else {
    ctx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}

export type BitmapDrawFn = (ctx: CanvasRenderingContext2D, bmp: DrawBitmap) => void;

/** Render layer content in chronological order (erasers only affect earlier items) */
export function renderDrawLayerContent(
  ctx: CanvasRenderingContext2D,
  layerId: string,
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): void {
  type Item = { order: number; render: () => void };
  const items: Item[] = [];

  strokes.forEach((stroke, index) => {
    if (getStrokeLayerId(stroke, defaultLayerId) !== layerId) return;
    const order = strokeDrawOrder(stroke, index);
    items.push({ order, render: () => drawStrokeOnContext(ctx, stroke) });
  });

  bitmaps.forEach((bmp, index) => {
    if (bmp.layerId !== layerId) return;
    const order = bitmapDrawOrder(bmp, index, strokes.length);
    items.push({
      order,
      render: () => {
        if (drawBitmap) {
          drawBitmap(ctx, bmp);
        } else {
          drawBitmapFromDataUrl(ctx, bmp);
        }
      },
    });
  });

  items.sort((a, b) => a.order - b.order);
  for (const item of items) {
    item.render();
  }
  ctx.globalCompositeOperation = 'source-over';
}

/** Draw bitmap synchronously from data URL (works for inline data URLs) */
export function loadDataUrlImage(dataUrl: string): HTMLImageElement | null {
  const img = new Image();
  img.src = dataUrl;
  if (img.complete && img.naturalWidth > 0) {
    return img;
  }
  return null;
}

export function drawBitmapFromDataUrl(ctx: CanvasRenderingContext2D, bmp: DrawBitmap): void {
  const img = loadDataUrlImage(bmp.dataUrl);
  if (img) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, bmp.x, bmp.y, bmp.width, bmp.height);
  }
}

function getStrokeBounds(stroke: Stroke): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of stroke.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const pad = stroke.lineWidth / 2;
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

function strokeIntersectsPolygon(stroke: Stroke, polygon: Point[]): boolean {
  const polyBounds = getPolygonBounds(polygon);
  const strokeBounds = getStrokeBounds(stroke);
  if (!boundsOverlap(polyBounds, strokeBounds)) return false;

  if (stroke.points.some(p => pointInPolygon(p, polygon))) return true;

  const cx = (strokeBounds.minX + strokeBounds.maxX) / 2;
  const cy = (strokeBounds.minY + strokeBounds.maxY) / 2;
  return pointInPolygon({ x: cx, y: cy }, polygon);
}

function bitmapFullyInsidePolygon(bmp: DrawBitmap, polygon: Point[]): boolean {
  const corners = [
    { x: bmp.x, y: bmp.y },
    { x: bmp.x + bmp.width, y: bmp.y },
    { x: bmp.x + bmp.width, y: bmp.y + bmp.height },
    { x: bmp.x, y: bmp.y + bmp.height },
  ];
  return corners.every(c => pointInPolygon(c, polygon));
}

/** Punch a polygon hole in a bitmap; returns null if fully removed or unchanged if no overlap */
function cutBitmapByPolygon(bmp: DrawBitmap, polygon: Point[]): DrawBitmap | null {
  if (!bitmapIntersectsPolygon(bmp, polygon)) return bmp;
  if (bitmapFullyInsidePolygon(bmp, polygon)) return null;

  const img = loadDataUrlImage(bmp.dataUrl);
  if (!img) return bmp;

  const canvas = document.createElement('canvas');
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, bmp.width, bmp.height);

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.moveTo(polygon[0].x - bmp.x, polygon[0].y - bmp.y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x - bmp.x, polygon[i].y - bmp.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fill();
  ctx.restore();

  const imageData = ctx.getImageData(0, 0, bmp.width, bmp.height);
  let hasContent = false;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] > 0) {
      hasContent = true;
      break;
    }
  }
  if (!hasContent) return null;

  return { ...bmp, dataUrl: canvas.toDataURL('image/png') };
}

/** Render multiple draw layers in z-order (bottom to top) */
export function renderDrawLayersContent(
  ctx: CanvasRenderingContext2D,
  layerIds: string[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): void {
  for (const layerId of layerIds) {
    renderDrawLayerContent(ctx, layerId, strokes, bitmaps, defaultLayerId, drawBitmap);
  }
}

function bitmapIntersectsPolygon(bmp: DrawBitmap, polygon: Point[]): boolean {
  const polyBounds = getPolygonBounds(polygon);
  const bmpBounds = {
    minX: bmp.x,
    minY: bmp.y,
    maxX: bmp.x + bmp.width,
    maxY: bmp.y + bmp.height,
  };
  if (!boundsOverlap(polyBounds, bmpBounds)) return false;

  // Corners or center inside polygon
  const corners = [
    { x: bmp.x, y: bmp.y },
    { x: bmp.x + bmp.width, y: bmp.y },
    { x: bmp.x + bmp.width, y: bmp.y + bmp.height },
    { x: bmp.x, y: bmp.y + bmp.height },
    { x: bmp.x + bmp.width / 2, y: bmp.y + bmp.height / 2 },
  ];
  return corners.some(c => pointInPolygon(c, polygon));
}

/**
 * Remove strokes and bitmaps inside/intersecting a lasso polygon from a layer.
 * Used when cutting/moving a selection (destructive, not eraser-mask).
 */
export function removeLayerContentInPolygon(
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  polygon: Point[],
  defaultLayerId: string | null
): { strokes: Stroke[]; drawBitmaps: DrawBitmap[] } {
  if (polygon.length < 3) {
    return { strokes, drawBitmaps: bitmaps };
  }

  return {
    strokes: strokes.filter(s => {
      if (getStrokeLayerId(s, defaultLayerId) !== layerId) return true;
      return !strokeIntersectsPolygon(s, polygon);
    }),
    drawBitmaps: bitmaps.flatMap(b => {
      if (b.layerId !== layerId) return [b];
      const cut = cutBitmapByPolygon(b, polygon);
      if (cut === null) return [];
      return [cut];
    }),
  };
}

/** Render layer content to an offscreen canvas clipped by polygon; returns ImageData + bounds */
export function extractLassoRegion(
  polygon: Point[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerIds: string[],
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn,
  padding = 2
): { imageData: ImageData; x: number; y: number; width: number; height: number } | null {
  const bounds = getPolygonBounds(polygon);
  if (bounds.width < 1 || bounds.height < 1) return null;

  const x = Math.floor(bounds.minX - padding);
  const y = Math.floor(bounds.minY - padding);
  const width = Math.ceil(bounds.width + padding * 2);
  const height = Math.ceil(bounds.height + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(-x, -y);
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
  ctx.clip();

  renderDrawLayersContent(ctx, layerIds, strokes, bitmaps, defaultLayerId, drawBitmap);
  ctx.restore();

  const imageData = ctx.getImageData(0, 0, width, height);

  let hasContent = false;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] > 0) {
      hasContent = true;
      break;
    }
  }
  if (!hasContent) return null;

  return { imageData, x, y, width, height };
}

/** Create a transparent selection region from polygon bounds (empty/air selection) */
export function createEmptyLassoRegion(polygon: Point[], padding = 2): {
  imageData: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const bounds = getPolygonBounds(polygon);
  const x = Math.floor(bounds.minX - padding);
  const y = Math.floor(bounds.minY - padding);
  const width = Math.max(1, Math.ceil(bounds.width + padding * 2));
  const height = Math.max(1, Math.ceil(bounds.height + padding * 2));
  return { imageData: new ImageData(width, height), x, y, width, height };
}

/** Extract lasso region; falls back to empty transparent region if no pixels found */
export function createLassoRegionFromPolygon(
  polygon: Point[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerIds: string[],
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): { imageData: ImageData; x: number; y: number; width: number; height: number } {
  return extractLassoRegion(polygon, strokes, bitmaps, layerIds, defaultLayerId, drawBitmap)
    ?? createEmptyLassoRegion(polygon);
}

export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
