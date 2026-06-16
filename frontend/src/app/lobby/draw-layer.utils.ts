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

export function getDefaultDrawLayerId(layers: Layer[] | undefined): string | null {
  const drawLayers = (layers || []).filter(l => l.type === 'draw');
  if (drawLayers.length === 0) return null;
  return drawLayers.sort((a, b) => b.zIndex - a.zIndex)[0].id;
}

export function getStrokeLayerId(stroke: Stroke, defaultLayerId: string | null): string | null {
  return stroke.layerId || defaultLayerId;
}

export function renderDrawLayerContent(
  ctx: CanvasRenderingContext2D,
  layerId: string,
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  defaultLayerId: string | null
): void {
  for (const stroke of strokes) {
    if (getStrokeLayerId(stroke, defaultLayerId) !== layerId) continue;
    const minPoints = stroke.isEraserFill ? 3 : 2;
    if (stroke.points.length < minPoints) continue;

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

  ctx.globalCompositeOperation = 'source-over';
  for (const bmp of bitmaps) {
    if (bmp.layerId !== layerId) continue;
    const img = new Image();
    img.src = bmp.dataUrl;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, bmp.x, bmp.y, bmp.width, bmp.height);
    }
  }
}

/** Render layer content to an offscreen canvas clipped by polygon; returns ImageData + bounds */
export function extractLassoRegion(
  polygon: Point[],
  strokes: Stroke[],
  bitmaps: DrawBitmap[],
  layerId: string,
  defaultLayerId: string | null,
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

  renderDrawLayerContent(ctx, layerId, strokes, bitmaps, defaultLayerId);
  ctx.restore();

  const imageData = ctx.getImageData(0, 0, width, height);

  // Check if selection has any non-transparent pixels
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

export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function createEraserFillStroke(polygon: Point[], layerId: string, id: string): Stroke {
  return {
    id,
    layerId,
    points: [...polygon],
    color: '#000000',
    lineWidth: 1,
    isEraser: true,
    isEraserFill: true,
  };
}

export function createEraserPolygonStroke(polygon: Point[], layerId: string, id: string): Stroke {
  return createEraserFillStroke(polygon, layerId, id);
}
