import { DrawBitmap, Layer, Point, Stroke, generateId } from '../model/lobby.model';

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

function segmentsIntersect(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
  const d1x = a2.x - a1.x;
  const d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x;
  const d2y = b2.y - b1.y;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return false;
  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / cross;
  const u = ((b1.x - a1.x) * d1y - (b1.y - a1.y) * d1x) / cross;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function segmentIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
  const d1x = a2.x - a1.x;
  const d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x;
  const d2y = b2.y - b1.y;
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return null;
  const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / cross;
  const u = ((b1.x - a1.x) * d1y - (b1.y - a1.y) * d1x) / cross;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a1.x + t * d1x, y: a1.y + t * d1y };
}

function segmentPolygonCrossings(a: Point, b: Point, polygon: Point[]): { t: number; point: Point }[] {
  const hits: { t: number; point: Point }[] = [];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) return hits;

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const hit = segmentIntersection(a, b, polygon[i], polygon[j]);
    if (!hit) continue;
    const t = ((hit.x - a.x) * dx + (hit.y - a.y) * dy) / lenSq;
    if (t >= 0 && t <= 1) {
      hits.push({ t, point: hit });
    }
  }

  hits.sort((a, b) => a.t - b.t);
  const deduped: { t: number; point: Point }[] = [];
  for (const hit of hits) {
    const last = deduped[deduped.length - 1];
    if (!last || Math.abs(last.t - hit.t) > 1e-6) {
      deduped.push(hit);
    }
  }
  return deduped;
}

function segmentIntersectsPolygon(a: Point, b: Point, polygon: Point[]): boolean {
  if (pointInPolygon(a, polygon) || pointInPolygon(b, polygon)) return true;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    if (segmentsIntersect(a, b, polygon[i], polygon[j])) return true;
  }
  return false;
}

export function normalizeLassoPolygon(points: Point[]): Point[] {
  if (points.length < 2) return points;
  const last = points[points.length - 1];
  const first = points[0];
  if (Math.hypot(last.x - first.x, last.y - first.y) < 1e-6) {
    return points.slice(0, -1);
  }
  return points;
}

function fillPolygonPath(ctx: CanvasRenderingContext2D, polygon: Point[]): void {
  if (polygon.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
}

function countImageAlpha(imageData: ImageData): number {
  let total = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    total += imageData.data[i];
  }
  return total;
}

function tightAlphaBounds(imageData: ImageData): {
  minX: number;
  minY: number;
  width: number;
  height: number;
} | null {
  const { width, height, data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < 0) return null;
  return { minX, minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function cropImageData(
  source: ImageData,
  bounds: { minX: number; minY: number; width: number; height: number }
): ImageData {
  const out = new Uint8ClampedArray(bounds.width * bounds.height * 4);
  for (let y = 0; y < bounds.height; y++) {
    for (let x = 0; x < bounds.width; x++) {
      const srcIdx = ((bounds.minY + y) * source.width + (bounds.minX + x)) * 4;
      const dstIdx = (y * bounds.width + x) * 4;
      out[dstIdx] = source.data[srcIdx];
      out[dstIdx + 1] = source.data[srcIdx + 1];
      out[dstIdx + 2] = source.data[srcIdx + 2];
      out[dstIdx + 3] = source.data[srcIdx + 3];
    }
  }
  return new ImageData(out, bounds.width, bounds.height);
}

/** True when rendered stroke pixels overlap the polygon interior */
function strokeVisualIntersectsPolygon(stroke: Stroke, polygon: Point[]): boolean {
  if (strokeIntersectsPolygon(stroke, polygon)) return true;

  const strokeBounds = getStrokeBounds(stroke);
  const polyBounds = getPolygonBounds(polygon);
  if (!boundsOverlap(strokeBounds, polyBounds)) return false;

  const pad = 2;
  const x = Math.floor(strokeBounds.minX - pad);
  const y = Math.floor(strokeBounds.minY - pad);
  const w = Math.max(1, Math.ceil(strokeBounds.maxX - strokeBounds.minX + pad * 2));
  const h = Math.max(1, Math.ceil(strokeBounds.maxY - strokeBounds.minY + pad * 2));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(-x, -y);
  drawStrokeOnContext(ctx, stroke);
  const pixels = ctx.getImageData(0, 0, w, h);

  const step = Math.max(1, Math.floor(Math.min(w, h) / 64));
  for (let py = 0; py < h; py += step) {
    for (let px = 0; px < w; px += step) {
      if (pixels.data[(py * w + px) * 4 + 3] === 0) continue;
      if (pointInPolygon({ x: x + px, y: y + py }, polygon)) return true;
    }
  }
  return false;
}

/** Cut a stroke using its rendered footprint so thick strokes match the lasso clip */
function cutStrokeAgainstPolygon(
  stroke: Stroke,
  polygon: Point[],
  layerId: string
): { strokes: Stroke[]; bitmaps: DrawBitmap[] } {
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3) return { strokes: [stroke], bitmaps: [] };

  if (stroke.isEraser) {
    if (!strokeIntersectsPolygon(stroke, poly)) return { strokes: [stroke], bitmaps: [] };
    if (strokeFullyInsidePolygon(stroke, poly)) return { strokes: [], bitmaps: [] };
    return {
      strokes: splitStrokeKeepOutside(stroke, poly),
      bitmaps: [],
    };
  }

  if (!strokeVisualIntersectsPolygon(stroke, poly)) {
    return { strokes: [stroke], bitmaps: [] };
  }

  const bounds = getStrokeBounds(stroke);
  const pad = 4;
  const x = Math.floor(bounds.minX - pad);
  const y = Math.floor(bounds.minY - pad);
  const w = Math.max(1, Math.ceil(bounds.maxX - bounds.minX + pad * 2));
  const h = Math.max(1, Math.ceil(bounds.maxY - bounds.minY + pad * 2));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(-x, -y);
  drawStrokeOnContext(ctx, stroke);

  const before = ctx.getImageData(0, 0, w, h);
  const beforeAlpha = countImageAlpha(before);
  if (beforeAlpha === 0) return { strokes: [stroke], bitmaps: [] };

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  fillPolygonPath(ctx, poly);
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fill();
  ctx.restore();

  const after = ctx.getImageData(0, 0, w, h);
  const afterAlpha = countImageAlpha(after);
  if (afterAlpha === 0) return { strokes: [], bitmaps: [] };
  if (afterAlpha >= beforeAlpha - 4) return { strokes: [stroke], bitmaps: [] };

  const tight = tightAlphaBounds(after);
  if (!tight) return { strokes: [], bitmaps: [] };

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = tight.width;
  cropCanvas.height = tight.height;
  cropCanvas.getContext('2d')!.putImageData(cropImageData(after, tight), 0, 0);

  return {
    strokes: [],
    bitmaps: [{
      id: generateId(),
      layerId,
      x: x + tight.minX,
      y: y + tight.minY,
      width: tight.width,
      height: tight.height,
      dataUrl: cropCanvas.toDataURL('image/png'),
      drawOrder: stroke.drawOrder,
    }],
  };
}

function strokeFullyInsidePolygon(stroke: Stroke, polygon: Point[]): boolean {
  if (stroke.points.length === 0) return false;
  return stroke.points.every(p => pointInPolygon(p, polygon));
}

function strokeIntersectsPolygon(stroke: Stroke, polygon: Point[]): boolean {
  const polyBounds = getPolygonBounds(polygon);
  const strokeBounds = getStrokeBounds(stroke);
  if (!boundsOverlap(polyBounds, strokeBounds)) return false;

  for (let i = 0; i < stroke.points.length - 1; i++) {
    if (segmentIntersectsPolygon(stroke.points[i], stroke.points[i + 1], polygon)) {
      return true;
    }
  }
  return stroke.points.some(p => pointInPolygon(p, polygon));
}

/** Keep polyline portions outside a polygon as one or more stroke fragments */
export function splitStrokeKeepOutside(stroke: Stroke, polygon: Point[]): Stroke[] {
  const pts = stroke.points;
  if (pts.length < 2) return [stroke];
  if (strokeFullyInsidePolygon(stroke, polygon)) return [];
  if (!strokeIntersectsPolygon(stroke, polygon)) return [stroke];

  const runs: Point[][] = [];
  let current: Point[] = [];

  const flush = () => {
    if (current.length >= 2) runs.push([...current]);
    current = [];
  };

  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const aIn = pointInPolygon(a, polygon);
    const bIn = pointInPolygon(b, polygon);
    const crossings = segmentPolygonCrossings(a, b, polygon);

    if (crossings.length === 0) {
      if (!aIn && !bIn) {
        if (current.length === 0) current.push(a);
        current.push(b);
      } else if (aIn && bIn) {
        flush();
      } else if (!aIn && bIn) {
        if (current.length === 0) current.push(a);
        flush();
      } else {
        flush();
        current.push(b);
      }
      continue;
    }

    let prev = a;
    let prevIn = aIn;
    for (const cross of crossings) {
      if (!prevIn) {
        if (current.length === 0) current.push(prev);
        current.push(cross.point);
        flush();
      }
      prev = cross.point;
      prevIn = !prevIn;
    }

    if (!prevIn) {
      if (current.length === 0) current.push(prev);
      if (!bIn) current.push(b);
      else flush();
    } else {
      flush();
    }
  }

  flush();
  return runs.map(points => ({ ...stroke, id: generateId(), points }));
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
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3) return bmp;
  if (!bitmapIntersectsPolygon(bmp, poly)) return bmp;
  if (bitmapFullyInsidePolygon(bmp, poly)) return null;

  const img = loadDataUrlImage(bmp.dataUrl);
  if (!img) return bmp;

  const canvas = document.createElement('canvas');
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, bmp.width, bmp.height);

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  fillPolygonPath(ctx, poly.map(p => ({ x: p.x - bmp.x, y: p.y - bmp.y })));
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

export type LayerContextSetup = (ctx: CanvasRenderingContext2D) => void;

/** Render one draw layer to an offscreen buffer, then composite (erasers stay layer-local) */
export function compositeDrawLayerContent(
  targetCtx: CanvasRenderingContext2D,
  layerId: string,
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  defaultLayerId: string | null,
  width: number,
  height: number,
  prepareLayerCtx: LayerContextSetup,
  drawBitmap?: BitmapDrawFn
): void {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const offCtx = off.getContext('2d')!;
  prepareLayerCtx(offCtx);
  renderDrawLayerContent(offCtx, layerId, strokes, bitmaps, defaultLayerId, drawBitmap);
  targetCtx.globalCompositeOperation = 'source-over';
  targetCtx.drawImage(off, 0, 0, width, height);
}

/** Render multiple draw layers in z-order, each isolated so erasers don't bleed through */
export function renderDrawLayersContent(
  ctx: CanvasRenderingContext2D,
  layerIds: string[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn,
  prepareLayerCtx: LayerContextSetup = c => c
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  for (const layerId of layerIds) {
    compositeDrawLayerContent(
      ctx,
      layerId,
      strokes,
      bitmaps,
      defaultLayerId,
      width,
      height,
      prepareLayerCtx,
      drawBitmap
    );
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

function getBitmapBounds(bmp: DrawBitmap): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  return { minX: bmp.x, minY: bmp.y, maxX: bmp.x + bmp.width, maxY: bmp.y + bmp.height };
}

function getLassoCutPadding(strokes: Stroke[], layerId: string, defaultLayerId: string | null): number {
  let maxWidth = 16;
  for (const s of strokes) {
    if (getStrokeLayerId(s, defaultLayerId) === layerId) {
      maxWidth = Math.max(maxWidth, s.lineWidth);
    }
  }
  return Math.ceil(maxWidth / 2) + 8;
}

/** Zero alpha for pixels outside the lasso polygon (removes bbox corner bleed) */
export function maskImageDataToPolygon(
  imageData: ImageData,
  originX: number,
  originY: number,
  polygon: Point[]
): ImageData {
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3) return imageData;
  const { width, height, data } = imageData;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      if (!pointInPolygon({ x: originX + px, y: originY + py }, poly)) {
        data[(py * width + px) * 4 + 3] = 0;
      }
    }
  }
  return imageData;
}

export function tightCropExtractedRegion(extracted: {
  imageData: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
}): {
  imageData: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  const tight = tightAlphaBounds(extracted.imageData);
  if (!tight) return null;
  return {
    imageData: cropImageData(extracted.imageData, tight),
    x: extracted.x + tight.minX,
    y: extracted.y + tight.minY,
    width: tight.width,
    height: tight.height,
  };
}

function subtractInsideFromFull(full: ImageData, inside: ImageData): ImageData {
  const out = new ImageData(full.width, full.height);
  for (let i = 0; i < full.data.length; i += 4) {
    if (inside.data[i + 3] > 8) {
      out.data[i + 3] = 0;
    } else {
      out.data[i] = full.data[i];
      out.data[i + 1] = full.data[i + 1];
      out.data[i + 2] = full.data[i + 2];
      out.data[i + 3] = full.data[i + 3];
    }
  }
  return out;
}

function isBoundsFullyInside(
  inner: { minX: number; minY: number; maxX: number; maxY: number },
  outer: { minX: number; minY: number; maxX: number; maxY: number }
): boolean {
  return (
    inner.minX >= outer.minX &&
    inner.minY >= outer.minY &&
    inner.maxX <= outer.maxX &&
    inner.maxY <= outer.maxY
  );
}

function cropDrawBitmapRegion(
  bmp: DrawBitmap,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number
): DrawBitmap | null {
  const img = loadDataUrlImage(bmp.dataUrl);
  if (!img) return null;

  const srcX = Math.round(cropX - bmp.x);
  const srcY = Math.round(cropY - bmp.y);
  const srcW = Math.round(cropW);
  const srcH = Math.round(cropH);
  if (srcW < 1 || srcH < 1) return null;

  const canvas = document.createElement('canvas');
  canvas.width = srcW;
  canvas.height = srcH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
  if (!tightAlphaBounds(ctx.getImageData(0, 0, srcW, srcH))) return null;

  return {
    id: generateId(),
    layerId: bmp.layerId,
    x: cropX,
    y: cropY,
    width: srcW,
    height: srcH,
    dataUrl: canvas.toDataURL('image/png'),
    drawOrder: bmp.drawOrder,
  };
}

/** Keep bitmap portions strictly outside the cut bounding box */
function splitBitmapOutsideCutRegion(
  bmp: DrawBitmap,
  cutRegion: { minX: number; minY: number; maxX: number; maxY: number }
): DrawBitmap[] {
  const bb = getBitmapBounds(bmp);
  if (!boundsOverlap(bb, cutRegion)) return [bmp];
  if (isBoundsFullyInside(bb, cutRegion)) return [];

  const result: DrawBitmap[] = [];
  const add = (x: number, y: number, w: number, h: number) => {
    const cropped = cropDrawBitmapRegion(bmp, x, y, w, h);
    if (cropped) result.push(cropped);
  };

  if (bb.minY < cutRegion.minY) {
    add(bmp.x, bmp.y, bmp.width, cutRegion.minY - bb.minY);
  }
  if (bb.maxY > cutRegion.maxY) {
    add(bmp.x, cutRegion.maxY, bmp.width, bb.maxY - cutRegion.maxY);
  }
  const midTop = Math.max(bb.minY, cutRegion.minY);
  const midBottom = Math.min(bb.maxY, cutRegion.maxY);
  if (bb.minX < cutRegion.minX && midBottom > midTop) {
    add(bmp.x, midTop, cutRegion.minX - bb.minX, midBottom - midTop);
  }
  if (bb.maxX > cutRegion.maxX && midBottom > midTop) {
    add(cutRegion.maxX, midTop, bb.maxX - cutRegion.maxX, midBottom - midTop);
  }
  return result;
}

function punchRectFromImageData(
  imageData: ImageData,
  originX: number,
  originY: number,
  cutRegion: { minX: number; minY: number; maxX: number; maxY: number }
): void {
  const { width, height, data } = imageData;
  const x0 = Math.max(0, Math.ceil(cutRegion.minX - originX));
  const y0 = Math.max(0, Math.ceil(cutRegion.minY - originY));
  const x1 = Math.min(width, Math.floor(cutRegion.maxX - originX));
  const y1 = Math.min(height, Math.floor(cutRegion.maxY - originY));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      data[(py * width + px) * 4 + 3] = 0;
    }
  }
}

function imageDataToDrawBitmap(
  imageData: ImageData,
  worldX: number,
  worldY: number,
  layerId: string,
  drawOrder?: number
): DrawBitmap | null {
  const tight = tightAlphaBounds(imageData);
  if (!tight) return null;
  const canvas = document.createElement('canvas');
  canvas.width = tight.width;
  canvas.height = tight.height;
  canvas.getContext('2d')!.putImageData(cropImageData(imageData, tight), 0, 0);
  return {
    id: generateId(),
    layerId,
    x: worldX + tight.minX,
    y: worldY + tight.minY,
    width: tight.width,
    height: tight.height,
    dataUrl: canvas.toDataURL('image/png'),
    drawOrder,
  };
}

/** Split raster pixels into up to four strips outside a cut bounding box (no async image reload) */
function splitImageDataOutsideCutRegion(
  imageData: ImageData,
  originX: number,
  originY: number,
  cutRegion: { minX: number; minY: number; maxX: number; maxY: number },
  layerId: string,
  drawOrder?: number
): DrawBitmap[] {
  const bb = {
    minX: originX,
    minY: originY,
    maxX: originX + imageData.width,
    maxY: originY + imageData.height,
  };
  if (!boundsOverlap(bb, cutRegion)) {
    const bmp = imageDataToDrawBitmap(imageData, originX, originY, layerId, drawOrder);
    return bmp ? [bmp] : [];
  }
  if (isBoundsFullyInside(bb, cutRegion)) return [];

  const result: DrawBitmap[] = [];
  const addStrip = (sx: number, sy: number, sw: number, sh: number) => {
    const localX = Math.round(sx - originX);
    const localY = Math.round(sy - originY);
    const localW = Math.round(sw);
    const localH = Math.round(sh);
    if (localW < 1 || localH < 1) return;
    if (localX < 0 || localY < 0 || localX + localW > imageData.width || localY + localH > imageData.height) {
      return;
    }
    const strip = cropImageData(imageData, { minX: localX, minY: localY, width: localW, height: localH });
    const bmp = imageDataToDrawBitmap(strip, sx, sy, layerId, drawOrder);
    if (bmp) result.push(bmp);
  };

  if (bb.minY < cutRegion.minY) {
    addStrip(originX, originY, imageData.width, cutRegion.minY - bb.minY);
  }
  if (bb.maxY > cutRegion.maxY) {
    addStrip(originX, cutRegion.maxY, imageData.width, bb.maxY - cutRegion.maxY);
  }
  const midTop = Math.max(bb.minY, cutRegion.minY);
  const midBottom = Math.min(bb.maxY, cutRegion.maxY);
  if (bb.minX < cutRegion.minX && midBottom > midTop) {
    addStrip(originX, midTop, cutRegion.minX - bb.minX, midBottom - midTop);
  }
  if (bb.maxX > cutRegion.maxX && midBottom > midTop) {
    addStrip(cutRegion.maxX, midTop, bb.maxX - cutRegion.maxX, midBottom - midTop);
  }
  return result;
}

function getItemsBounds(
  strokes: Stroke[],
  bitmaps: DrawBitmap[]
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    const b = getStrokeBounds(s);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  for (const bmp of bitmaps) {
    const b = getBitmapBounds(bmp);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  if (maxX < minX) return null;
  return { minX, minY, maxX, maxY };
}

/** Render full layer, punch cut box, return bitmap strips outside the cut region */
function extractExteriorBitmapsForLayerCut(
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  cutRegion: { minX: number; minY: number; maxX: number; maxY: number },
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): DrawBitmap[] {
  const overlappingStrokes = strokes.filter(
    s => getStrokeLayerId(s, defaultLayerId) === layerId && boundsOverlap(getStrokeBounds(s), cutRegion)
  );
  const overlappingBitmaps = bitmaps.filter(
    b => b.layerId === layerId && boundsOverlap(getBitmapBounds(b), cutRegion)
  );
  if (overlappingStrokes.length === 0 && overlappingBitmaps.length === 0) return [];

  const bounds = getItemsBounds(overlappingStrokes, overlappingBitmaps);
  if (!bounds) return [];

  let minOrder = Infinity;
  for (const s of overlappingStrokes) {
    minOrder = Math.min(minOrder, s.drawOrder ?? minOrder);
  }
  for (const b of overlappingBitmaps) {
    minOrder = Math.min(minOrder, b.drawOrder ?? minOrder);
  }

  const pad = 8;
  const x = Math.floor(bounds.minX - pad);
  const y = Math.floor(bounds.minY - pad);
  const w = Math.max(1, Math.ceil(bounds.maxX - bounds.minX + pad * 2));
  const h = Math.max(1, Math.ceil(bounds.maxY - bounds.minY + pad * 2));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(-x, -y);
  renderDrawLayerContent(
    ctx,
    layerId,
    overlappingStrokes,
    overlappingBitmaps,
    defaultLayerId,
    drawBitmap
  );

  const data = ctx.getImageData(0, 0, w, h);
  punchRectFromImageData(data, x, y, cutRegion);
  if (!tightAlphaBounds(data)) return [];

  return splitImageDataOutsideCutRegion(
    data,
    x,
    y,
    cutRegion,
    layerId,
    minOrder === Infinity ? undefined : minOrder
  );
}

function getLayerContentBounds(
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  defaultLayerId: string | null
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const layerStrokes = strokes.filter(s => getStrokeLayerId(s, defaultLayerId) === layerId);
  const layerBitmaps = bitmaps.filter(b => b.layerId === layerId);
  return getItemsBounds(layerStrokes, layerBitmaps);
}

/** Merge all vectors and bitmaps on one draw layer into a single bitmap (reduces fragment lag) */
export function flattenDrawLayerContent(
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): { strokes: Stroke[]; drawBitmaps: DrawBitmap[] } {
  const hasLayerStrokes = strokes.some(s => getStrokeLayerId(s, defaultLayerId) === layerId);
  const layerBitmaps = bitmaps.filter(b => b.layerId === layerId);
  if (!hasLayerStrokes && layerBitmaps.length <= 1) {
    return { strokes, drawBitmaps: bitmaps };
  }

  const bounds = getLayerContentBounds(strokes, bitmaps, layerId, defaultLayerId);
  if (!bounds) {
    return {
      strokes: strokes.filter(s => getStrokeLayerId(s, defaultLayerId) !== layerId),
      drawBitmaps: bitmaps.filter(b => b.layerId !== layerId),
    };
  }

  let minOrder = Infinity;
  for (const s of strokes) {
    if (getStrokeLayerId(s, defaultLayerId) === layerId) {
      minOrder = Math.min(minOrder, s.drawOrder ?? minOrder);
    }
  }
  for (const b of layerBitmaps) {
    minOrder = Math.min(minOrder, b.drawOrder ?? minOrder);
  }

  const pad = 8;
  const x = Math.floor(bounds.minX - pad);
  const y = Math.floor(bounds.minY - pad);
  const w = Math.max(1, Math.ceil(bounds.maxX - bounds.minX + pad * 2));
  const h = Math.max(1, Math.ceil(bounds.maxY - bounds.minY + pad * 2));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(-x, -y);
  renderDrawLayerContent(ctx, layerId, strokes, bitmaps, defaultLayerId, drawBitmap);

  const imageData = ctx.getImageData(0, 0, w, h);
  const tight = tightAlphaBounds(imageData);
  if (!tight) {
    return {
      strokes: strokes.filter(s => getStrokeLayerId(s, defaultLayerId) !== layerId),
      drawBitmaps: bitmaps.filter(b => b.layerId !== layerId),
    };
  }

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = tight.width;
  cropCanvas.height = tight.height;
  cropCanvas.getContext('2d')!.putImageData(cropImageData(imageData, tight), 0, 0);

  const merged: DrawBitmap = {
    id: generateId(),
    layerId,
    x: x + tight.minX,
    y: y + tight.minY,
    width: tight.width,
    height: tight.height,
    dataUrl: cropCanvas.toDataURL('image/png'),
    drawOrder: minOrder === Infinity ? undefined : minOrder,
  };

  return {
    strokes: strokes.filter(s => getStrokeLayerId(s, defaultLayerId) !== layerId),
    drawBitmaps: [...bitmaps.filter(b => b.layerId !== layerId), merged],
  };
}

/** Render layer in a cut bounding box — full frame or clipped to polygon interior */
function renderLayerInCutBox(
  cutW: number,
  cutH: number,
  cutX: number,
  cutY: number,
  layerId: string,
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  defaultLayerId: string | null,
  drawBitmap: BitmapDrawFn | undefined,
  clipToPolygon: Point[] | null
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = cutW;
  canvas.height = cutH;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, cutW, cutH);
  ctx.translate(-cutX, -cutY);
  if (clipToPolygon && clipToPolygon.length >= 3) {
    fillPolygonPath(ctx, clipToPolygon);
    ctx.clip();
  }
  renderDrawLayerContent(ctx, layerId, strokes, bitmaps, defaultLayerId, drawBitmap);
  let data = ctx.getImageData(0, 0, cutW, cutH);
  if (clipToPolygon && clipToPolygon.length >= 3) {
    data = maskImageDataToPolygon(data, cutX, cutY, clipToPolygon);
  }
  return data;
}

/**
 * Remove lassoed content by subtracting the exact inside mask (same as extract) from
 * the full layer render. Vectors in the cut bounding box are flattened into one
 * remainder bitmap so outside-lasso content is preserved without duplicates.
 */
export function removeLayerContentInPolygon(
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  polygon: Point[],
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): { strokes: Stroke[]; drawBitmaps: DrawBitmap[] } {
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3) {
    return { strokes, drawBitmaps: bitmaps };
  }

  const pad = getLassoCutPadding(strokes, layerId, defaultLayerId);
  const pb = getPolygonBounds(poly);
  const cutX = Math.floor(pb.minX - pad);
  const cutY = Math.floor(pb.minY - pad);
  const cutW = Math.max(1, Math.ceil(pb.width + pad * 2));
  const cutH = Math.max(1, Math.ceil(pb.height + pad * 2));
  const cutRegion = { minX: cutX, minY: cutY, maxX: cutX + cutW, maxY: cutY + cutH };

  const fullData = renderLayerInCutBox(
    cutW, cutH, cutX, cutY, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, null
  );
  const insideData = renderLayerInCutBox(
    cutW, cutH, cutX, cutY, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, poly
  );
  const after = subtractInsideFromFull(fullData, insideData);

  const keptStrokes = strokes.filter(s => {
    if (getStrokeLayerId(s, defaultLayerId) !== layerId) return true;
    return !boundsOverlap(getStrokeBounds(s), cutRegion);
  });

  let keptBitmaps = bitmaps.filter(b => {
    if (b.layerId !== layerId) return true;
    return !boundsOverlap(getBitmapBounds(b), cutRegion);
  });

  keptBitmaps.push(
    ...extractExteriorBitmapsForLayerCut(
      strokes,
      bitmaps,
      layerId,
      cutRegion,
      defaultLayerId,
      drawBitmap
    )
  );

  if (countImageAlpha(after) > 0) {
    const tight = tightAlphaBounds(after);
    if (tight) {
      let minOrder = Infinity;
      for (const s of strokes) {
        if (getStrokeLayerId(s, defaultLayerId) === layerId && boundsOverlap(getStrokeBounds(s), cutRegion)) {
          minOrder = Math.min(minOrder, s.drawOrder ?? minOrder);
        }
      }
      for (const b of bitmaps) {
        if (b.layerId === layerId && boundsOverlap(getBitmapBounds(b), cutRegion)) {
          minOrder = Math.min(minOrder, b.drawOrder ?? minOrder);
        }
      }

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = tight.width;
      cropCanvas.height = tight.height;
      cropCanvas.getContext('2d')!.putImageData(cropImageData(after, tight), 0, 0);

      keptBitmaps.push({
        id: generateId(),
        layerId,
        x: cutX + tight.minX,
        y: cutY + tight.minY,
        width: tight.width,
        height: tight.height,
        dataUrl: cropCanvas.toDataURL('image/png'),
        drawOrder: minOrder === Infinity ? undefined : minOrder,
      });
    }
  }

  return { strokes: keptStrokes, drawBitmaps: keptBitmaps };
}

/** Render layer content to an offscreen canvas clipped by polygon; returns ImageData + bounds */
export function extractLassoRegion(
  polygon: Point[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): { imageData: ImageData; x: number; y: number; width: number; height: number } | null {
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3) return null;

  const pad = getLassoCutPadding(strokes, layerId, defaultLayerId);
  const bounds = getPolygonBounds(poly);
  if (bounds.width < 1 || bounds.height < 1) return null;

  const x = Math.floor(bounds.minX - pad);
  const y = Math.floor(bounds.minY - pad);
  const width = Math.max(1, Math.ceil(bounds.width + pad * 2));
  const height = Math.max(1, Math.ceil(bounds.height + pad * 2));

  const imageData = renderLayerInCutBox(
    width, height, x, y, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, poly
  );

  if (!tightAlphaBounds(imageData)) return null;

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

/** Extract lasso region; returns null if no visible pixels */
export function createLassoRegionFromPolygon(
  polygon: Point[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  defaultLayerId: string | null,
  drawBitmap?: BitmapDrawFn
): { imageData: ImageData; x: number; y: number; width: number; height: number } | null {
  const raw = extractLassoRegion(polygon, strokes, bitmaps, layerId, defaultLayerId, drawBitmap);
  if (!raw) return null;
  return tightCropExtractedRegion(raw);
}

export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
