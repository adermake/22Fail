import {
  generateId
} from "./chunk-OVLXAWKG.js";
import {
  scaledVolume
} from "./chunk-RAWCOLGX.js";
import {
  ImageUrlPipe
} from "./chunk-6EXL6IWA.js";
import {
  CommonModule
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵgetCurrentView,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-XJL25EXC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/lobby/draw-layer.utils.ts
function pointInPolygon(point, polygon) {
  if (polygon.length < 3)
    return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > point.y !== yj > point.y && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi;
    if (intersect)
      inside = !inside;
  }
  return inside;
}
function getPolygonBounds(polygon) {
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
function boundsOverlap(a, b) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}
function getDefaultDrawLayerId(layers) {
  const drawLayers = (layers || []).filter((l) => l.type === "draw");
  if (drawLayers.length === 0)
    return null;
  return drawLayers.sort((a, b) => b.zIndex - a.zIndex)[0].id;
}
function getStrokeLayerId(stroke, defaultLayerId) {
  return stroke.layerId || defaultLayerId;
}
function strokeDrawOrder(stroke, index) {
  return stroke.drawOrder ?? index;
}
function bitmapDrawOrder(bmp, index, strokeCount) {
  return bmp.drawOrder ?? strokeCount + index;
}
function drawStrokeOnContext(ctx, stroke) {
  const minPoints = stroke.isEraserFill ? 3 : 2;
  if (stroke.points.length < minPoints)
    return;
  ctx.globalCompositeOperation = stroke.isEraser ? "destination-out" : "source-over";
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  if (stroke.isEraserFill) {
    ctx.closePath();
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fill();
  } else {
    ctx.strokeStyle = stroke.isEraser ? "rgba(0,0,0,1)" : stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}
function renderDrawLayerContent(ctx, layerId, strokes, bitmaps, defaultLayerId, drawBitmap) {
  const items = [];
  strokes.forEach((stroke, index) => {
    if (getStrokeLayerId(stroke, defaultLayerId) !== layerId)
      return;
    const order = strokeDrawOrder(stroke, index);
    items.push({ order, render: () => drawStrokeOnContext(ctx, stroke) });
  });
  bitmaps.forEach((bmp, index) => {
    if (bmp.layerId !== layerId)
      return;
    const order = bitmapDrawOrder(bmp, index, strokes.length);
    items.push({
      order,
      render: () => {
        if (drawBitmap) {
          drawBitmap(ctx, bmp);
        } else {
          drawBitmapFromDataUrl(ctx, bmp);
        }
      }
    });
  });
  items.sort((a, b) => a.order - b.order);
  for (const item of items) {
    item.render();
  }
  ctx.globalCompositeOperation = "source-over";
}
function loadDataUrlImage(dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  if (img.complete && img.naturalWidth > 0) {
    return img;
  }
  return null;
}
function drawBitmapFromDataUrl(ctx, bmp) {
  const img = loadDataUrlImage(bmp.dataUrl);
  if (img) {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, bmp.x, bmp.y, bmp.width, bmp.height);
  }
}
function getStrokeBounds(stroke) {
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
function normalizeLassoPolygon(points) {
  if (points.length < 2)
    return points;
  const last = points[points.length - 1];
  const first = points[0];
  if (Math.hypot(last.x - first.x, last.y - first.y) < 1e-6) {
    return points.slice(0, -1);
  }
  return points;
}
function fillPolygonPath(ctx, polygon) {
  if (polygon.length < 3)
    return;
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i].x, polygon[i].y);
  }
  ctx.closePath();
}
function countImageAlpha(imageData) {
  let total = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    total += imageData.data[i];
  }
  return total;
}
function tightAlphaBounds(imageData) {
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
  if (maxX < 0)
    return null;
  return { minX, minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}
function cropImageData(source, bounds) {
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
function getBitmapBounds(bmp) {
  return { minX: bmp.x, minY: bmp.y, maxX: bmp.x + bmp.width, maxY: bmp.y + bmp.height };
}
function getLassoCutPadding(strokes, layerId, defaultLayerId) {
  let maxWidth = 16;
  for (const s of strokes) {
    if (getStrokeLayerId(s, defaultLayerId) === layerId) {
      maxWidth = Math.max(maxWidth, s.lineWidth);
    }
  }
  return Math.ceil(maxWidth / 2) + 8;
}
function maskImageDataToPolygon(imageData, originX, originY, polygon) {
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3)
    return imageData;
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
function tightCropExtractedRegion(extracted) {
  const tight = tightAlphaBounds(extracted.imageData);
  if (!tight)
    return null;
  return {
    imageData: cropImageData(extracted.imageData, tight),
    x: extracted.x + tight.minX,
    y: extracted.y + tight.minY,
    width: tight.width,
    height: tight.height
  };
}
function subtractInsideFromFull(full, inside) {
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
function punchRectFromImageData(imageData, originX, originY, cutRegion) {
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
function imageDataToDrawBitmap(imageData, worldX, worldY, layerId, drawOrder) {
  const tight = tightAlphaBounds(imageData);
  if (!tight)
    return null;
  const canvas = document.createElement("canvas");
  canvas.width = tight.width;
  canvas.height = tight.height;
  canvas.getContext("2d").putImageData(cropImageData(imageData, tight), 0, 0);
  return {
    id: generateId(),
    layerId,
    x: worldX + tight.minX,
    y: worldY + tight.minY,
    width: tight.width,
    height: tight.height,
    dataUrl: canvas.toDataURL("image/png"),
    drawOrder
  };
}
function getItemsBounds(strokes, bitmaps) {
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
  if (maxX < minX)
    return null;
  return { minX, minY, maxX, maxY };
}
function extractExteriorBitmapsForLayerCut(strokes, bitmaps, layerId, cutRegion, defaultLayerId, drawBitmap) {
  const overlappingStrokes = strokes.filter((s) => getStrokeLayerId(s, defaultLayerId) === layerId && boundsOverlap(getStrokeBounds(s), cutRegion));
  const overlappingBitmaps = bitmaps.filter((b) => b.layerId === layerId && boundsOverlap(getBitmapBounds(b), cutRegion));
  if (overlappingStrokes.length === 0 && overlappingBitmaps.length === 0)
    return [];
  const bounds = getItemsBounds(overlappingStrokes, overlappingBitmaps);
  if (!bounds)
    return [];
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
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.translate(-x, -y);
  renderDrawLayerContent(ctx, layerId, overlappingStrokes, overlappingBitmaps, defaultLayerId, drawBitmap);
  const data = ctx.getImageData(0, 0, w, h);
  punchRectFromImageData(data, x, y, cutRegion);
  if (!tightAlphaBounds(data))
    return [];
  const bmp = imageDataToDrawBitmap(data, x, y, layerId, minOrder === Infinity ? void 0 : minOrder);
  return bmp ? [bmp] : [];
}
function getLayerContentBounds(strokes, bitmaps, layerId, defaultLayerId) {
  const layerStrokes = strokes.filter((s) => getStrokeLayerId(s, defaultLayerId) === layerId);
  const layerBitmaps = bitmaps.filter((b) => b.layerId === layerId);
  return getItemsBounds(layerStrokes, layerBitmaps);
}
function flattenDrawLayerContent(strokes, bitmaps, layerId, defaultLayerId, drawBitmap) {
  const hasLayerStrokes = strokes.some((s) => getStrokeLayerId(s, defaultLayerId) === layerId);
  const layerBitmaps = bitmaps.filter((b) => b.layerId === layerId);
  if (!hasLayerStrokes && layerBitmaps.length <= 1) {
    return { strokes, drawBitmaps: bitmaps };
  }
  const bounds = getLayerContentBounds(strokes, bitmaps, layerId, defaultLayerId);
  if (!bounds) {
    return {
      strokes: strokes.filter((s) => getStrokeLayerId(s, defaultLayerId) !== layerId),
      drawBitmaps: bitmaps.filter((b) => b.layerId !== layerId)
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
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.translate(-x, -y);
  renderDrawLayerContent(ctx, layerId, strokes, bitmaps, defaultLayerId, drawBitmap);
  const imageData = ctx.getImageData(0, 0, w, h);
  const tight = tightAlphaBounds(imageData);
  if (!tight) {
    return {
      strokes: strokes.filter((s) => getStrokeLayerId(s, defaultLayerId) !== layerId),
      drawBitmaps: bitmaps.filter((b) => b.layerId !== layerId)
    };
  }
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = tight.width;
  cropCanvas.height = tight.height;
  cropCanvas.getContext("2d").putImageData(cropImageData(imageData, tight), 0, 0);
  const merged = {
    id: generateId(),
    layerId,
    x: x + tight.minX,
    y: y + tight.minY,
    width: tight.width,
    height: tight.height,
    dataUrl: cropCanvas.toDataURL("image/png"),
    drawOrder: minOrder === Infinity ? void 0 : minOrder
  };
  return {
    strokes: strokes.filter((s) => getStrokeLayerId(s, defaultLayerId) !== layerId),
    drawBitmaps: [...bitmaps.filter((b) => b.layerId !== layerId), merged]
  };
}
function renderLayerInCutBox(cutW, cutH, cutX, cutY, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, clipToPolygon) {
  const canvas = document.createElement("canvas");
  canvas.width = cutW;
  canvas.height = cutH;
  const ctx = canvas.getContext("2d");
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
function removeLayerContentInPolygon(strokes, bitmaps, layerId, polygon, defaultLayerId, drawBitmap) {
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
  const fullData = renderLayerInCutBox(cutW, cutH, cutX, cutY, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, null);
  const insideData = renderLayerInCutBox(cutW, cutH, cutX, cutY, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, poly);
  const after = subtractInsideFromFull(fullData, insideData);
  const keptStrokes = strokes.filter((s) => {
    if (getStrokeLayerId(s, defaultLayerId) !== layerId)
      return true;
    return !boundsOverlap(getStrokeBounds(s), cutRegion);
  });
  let keptBitmaps = bitmaps.filter((b) => {
    if (b.layerId !== layerId)
      return true;
    return !boundsOverlap(getBitmapBounds(b), cutRegion);
  });
  keptBitmaps.push(...extractExteriorBitmapsForLayerCut(strokes, bitmaps, layerId, cutRegion, defaultLayerId, drawBitmap));
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
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = tight.width;
      cropCanvas.height = tight.height;
      cropCanvas.getContext("2d").putImageData(cropImageData(after, tight), 0, 0);
      keptBitmaps.push({
        id: generateId(),
        layerId,
        x: cutX + tight.minX,
        y: cutY + tight.minY,
        width: tight.width,
        height: tight.height,
        dataUrl: cropCanvas.toDataURL("image/png"),
        drawOrder: minOrder === Infinity ? void 0 : minOrder
      });
    }
  }
  return { strokes: keptStrokes, drawBitmaps: keptBitmaps };
}
function extractLassoRegion(polygon, strokes, bitmaps, layerId, defaultLayerId, drawBitmap) {
  const poly = normalizeLassoPolygon(polygon);
  if (poly.length < 3)
    return null;
  const pad = getLassoCutPadding(strokes, layerId, defaultLayerId);
  const bounds = getPolygonBounds(poly);
  if (bounds.width < 1 || bounds.height < 1)
    return null;
  const x = Math.floor(bounds.minX - pad);
  const y = Math.floor(bounds.minY - pad);
  const width = Math.max(1, Math.ceil(bounds.width + pad * 2));
  const height = Math.max(1, Math.ceil(bounds.height + pad * 2));
  const imageData = renderLayerInCutBox(width, height, x, y, layerId, strokes, bitmaps, defaultLayerId, drawBitmap, poly);
  if (!tightAlphaBounds(imageData))
    return null;
  return { imageData, x, y, width, height };
}
function createLassoRegionFromPolygon(polygon, strokes, bitmaps, layerId, defaultLayerId, drawBitmap) {
  const raw = extractLassoRegion(polygon, strokes, bitmaps, layerId, defaultLayerId, drawBitmap);
  if (!raw)
    return null;
  return tightCropExtractedRegion(raw);
}
function imageDataToDataUrl(imageData) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

// src/app/shared/image-upload.utils.ts
var DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
var DEFAULT_MAX_DIMENSION = 8192;
var WORLD_MAP_TILE_MAX_BYTES = 95 * 1024 * 1024;
function jpegName(originalName) {
  const base = originalName.replace(/\.[^/.]+$/, "") || "image";
  return `${base}.jpg`;
}
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read image: ${file.name}`));
    };
    img.src = url;
  });
}
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Failed to encode image")), type, quality);
  });
}
async function encodeUnderLimit(img, originalName, maxDimension, maxBytes) {
  let dim = maxDimension;
  while (dim >= 256) {
    const scale = Math.min(1, dim / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Canvas not available");
    ctx.drawImage(img, 0, 0, width, height);
    let quality = 0.92;
    while (quality >= 0.45) {
      const blob = await canvasToBlob(canvas, "image/jpeg", quality);
      if (blob.size <= maxBytes) {
        return new File([blob], jpegName(originalName), { type: "image/jpeg", lastModified: Date.now() });
      }
      quality -= 0.07;
    }
    dim = Math.floor(dim * 0.75);
  }
  throw new Error("Image is too large even after compression");
}
async function prepareImageForUpload(file, options) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file");
  }
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options?.maxDimension ?? DEFAULT_MAX_DIMENSION;
  if (file.size <= maxBytes) {
    return file;
  }
  const img = await loadImageFromFile(file);
  try {
    return await encodeUnderLimit(img, file.name, maxDimension, maxBytes);
  } finally {
    img.src = "";
  }
}
function formatBytes(bytes) {
  if (bytes < 1024)
    return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function extensionForMime(mime, originalName) {
  if (mime === "image/webp")
    return ".webp";
  if (mime === "image/png")
    return ".png";
  if (mime === "image/jpeg")
    return ".jpg";
  const ext = originalName.match(/(\.[^.]+)$/)?.[1];
  return ext ?? ".png";
}
async function prepareWorldMapTileForUpload(file, options) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file");
  }
  const maxBytes = options?.maxBytes ?? WORLD_MAP_TILE_MAX_BYTES;
  if (file.size <= maxBytes) {
    return file;
  }
  const img = await loadImageFromFile(file);
  try {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Canvas not available");
    ctx.drawImage(img, 0, 0, width, height);
    const baseName = file.name.replace(/\.[^/.]+$/, "") || "hex_tile";
    for (const mime of ["image/webp", "image/png"]) {
      const qualities = mime === "image/webp" ? [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45] : [void 0];
      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, mime, quality ?? 1);
        if (blob.size <= maxBytes) {
          const ext = extensionForMime(mime, file.name);
          return new File([blob], `${baseName}${ext}`, {
            type: mime,
            lastModified: Date.now()
          });
        }
      }
    }
    throw new Error(`Kachel "${file.name}" ist ${formatBytes(file.size)} \u2014 auch als WebP unter ${formatBytes(maxBytes)} nicht darstellbar. Entweder nginx client_max_body_size erh\xF6hen (z. B. 500m) oder Kacheln extern verkleinern.`);
  } finally {
    img.src = "";
  }
}

// src/app/lobby/lobby-token/lobby-token.component.ts
function LobbyTokenComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "img", 3);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275domProperty("src", ctx_r0.token.customPortraitData, \u0275\u0275sanitizeUrl);
  }
}
function LobbyTokenComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "img", 5);
    \u0275\u0275pipe(1, "imageUrl");
    \u0275\u0275domListener("error", function LobbyTokenComponent_Conditional_4_Template_img_error_0_listener($event) {
      \u0275\u0275restoreView(_r2);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onImageError($event));
    });
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275domProperty("src", \u0275\u0275pipeBind1(1, 1, ctx_r0.token.portrait), \u0275\u0275sanitizeUrl);
  }
}
function LobbyTokenComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 4);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.token.name.charAt(0).toUpperCase(), " ");
  }
}
function LobbyTokenComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 6);
    \u0275\u0275domElement(1, "div", 7);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(2, "div", 8);
    \u0275\u0275domElement(3, "div", 9);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(4, "div", 10);
    \u0275\u0275domElement(5, "div", 11);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("--bar-percentage", ctx_r0.getPercentage(ctx_r0.resources.health));
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("--bar-percentage", ctx_r0.getPercentage(ctx_r0.resources.energy));
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("--bar-percentage", ctx_r0.getPercentage(ctx_r0.resources.mana));
  }
}
var LobbyTokenComponent = class _LobbyTokenComponent {
  token;
  position = { x: 0, y: 0 };
  scale = 1;
  isCurrentTurn = false;
  isInteractive = true;
  isDragging = false;
  resources = null;
  // Character resources
  showResources = false;
  // Only show for party members
  isSelected = false;
  dragStart = new EventEmitter();
  contextMenu = new EventEmitter();
  // Team colors
  teamColors = {
    blue: "#3b82f6",
    red: "#ef4444",
    green: "#22c55e",
    yellow: "#eab308",
    purple: "#8b5cf6",
    orange: "#f97316"
  };
  getTeamColor(team) {
    if (team === "default" || !team)
      return "#475569";
    return this.teamColors[team] || "#475569";
  }
  getPercentage(resource) {
    if (resource.max === 0)
      return 0;
    return Math.max(0, Math.min(100, resource.current / resource.max * 100));
  }
  onMouseDown(event) {
    if (event.button === 0) {
      event.preventDefault();
      event.stopPropagation();
      this.dragStart.emit(event);
    }
  }
  onDragStart(event) {
    event.preventDefault();
  }
  onContextMenu(event) {
    event.preventDefault();
    this.contextMenu.emit(event);
  }
  onImageError(event) {
    const img = event.target;
    img.style.display = "none";
  }
  static \u0275fac = function LobbyTokenComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LobbyTokenComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LobbyTokenComponent, selectors: [["app-lobby-token"]], inputs: { token: "token", position: "position", scale: "scale", isCurrentTurn: "isCurrentTurn", isInteractive: "isInteractive", isDragging: "isDragging", resources: "resources", showResources: "showResources", isSelected: "isSelected" }, outputs: { dragStart: "dragStart", contextMenu: "contextMenu" }, decls: 7, vars: 32, consts: [[1, "token-wrapper", 3, "mousedown", "contextmenu", "dragstart"], [1, "token-border"], [1, "token-content"], ["alt", "", 1, "token-portrait", 3, "src"], [1, "token-placeholder"], ["alt", "", 1, "token-portrait", 3, "error", "src"], [1, "resource-bar", "health-bar"], [1, "bar-fill", "health-fill"], [1, "resource-bar", "energy-bar"], [1, "bar-fill", "energy-fill"], [1, "resource-bar", "mana-bar"], [1, "bar-fill", "mana-fill"]], template: function LobbyTokenComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275domListener("mousedown", function LobbyTokenComponent_Template_div_mousedown_0_listener($event) {
        return ctx.onMouseDown($event);
      })("contextmenu", function LobbyTokenComponent_Template_div_contextmenu_0_listener($event) {
        return ctx.onContextMenu($event);
      })("dragstart", function LobbyTokenComponent_Template_div_dragstart_0_listener($event) {
        return ctx.onDragStart($event);
      });
      \u0275\u0275domElement(1, "div", 1);
      \u0275\u0275domElementStart(2, "div", 2);
      \u0275\u0275conditionalCreate(3, LobbyTokenComponent_Conditional_3_Template, 1, 1, "img", 3)(4, LobbyTokenComponent_Conditional_4_Template, 2, 3, "img", 3)(5, LobbyTokenComponent_Conditional_5_Template, 2, 1, "div", 4);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(6, LobbyTokenComponent_Conditional_6_Template, 6, 6);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275styleProp("left", ctx.position.x, "px")("top", ctx.position.y, "px")("--team-color", ctx.getTeamColor(ctx.token.team || "default"))("--token-scale", ctx.scale)("--user-scale-x", ctx.token.scaleX ?? 1)("--user-scale-y", ctx.token.scaleY ?? 1)("--user-rotation", (ctx.token.rotation ?? 0) + "deg")("cursor", ctx.isInteractive ? "grab" : "default")("pointer-events", ctx.isInteractive ? "auto" : "none");
      \u0275\u0275classProp("current-turn", ctx.isCurrentTurn)("selected", ctx.isSelected)("dragging", ctx.isDragging)("non-interactive", !ctx.isInteractive)("show-resources", ctx.showResources);
      \u0275\u0275advance(2);
      \u0275\u0275classProp("stretch", (ctx.token.imageMode || "fill") === "stretch");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.token.customPortraitData ? 3 : ctx.token.portrait ? 4 : 5);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.resources && ctx.showResources ? 6 : -1);
    }
  }, dependencies: [CommonModule, ImageUrlPipe], styles: ["\n\n.token-wrapper[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 60px;\n  height: 60px;\n  margin-left: -30px;\n  margin-top: -30px;\n  pointer-events: auto;\n  z-index: 1;\n  transform: scale(var(--token-scale, 1)) rotate(var(--user-rotation, 0deg)) scale(var(--user-scale-x, 1), var(--user-scale-y, 1));\n  transform-origin: center center;\n}\n.token-border[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 60px;\n  height: 60px;\n  background: var(--team-color, #475569);\n  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n  -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n}\n.token-content[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  width: 54px;\n  height: 54px;\n  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n  -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n  overflow: hidden;\n}\n.token-wrapper[_ngcontent-%COMP%]:hover:not(.non-interactive) {\n  z-index: 2;\n  filter: brightness(1.1);\n}\n.token-wrapper[_ngcontent-%COMP%]:active, \n.token-wrapper.dragging[_ngcontent-%COMP%] {\n  cursor: grabbing;\n  z-index: 10;\n  opacity: 0.7;\n}\n.token-wrapper.current-turn[_ngcontent-%COMP%]   .token-border[_ngcontent-%COMP%] {\n  background: #22c55e;\n  filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.8));\n}\n.token-wrapper.selected[_ngcontent-%COMP%]   .token-border[_ngcontent-%COMP%] {\n  background: #7c3aed !important;\n  filter: drop-shadow(0 0 8px #a78bfa) drop-shadow(0 0 20px rgba(167, 139, 250, 0.9));\n  animation: _ngcontent-%COMP%_token-glow-pulse 1.5s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_token-glow-pulse {\n  0%, 100% {\n    background: #7c3aed;\n    filter: drop-shadow(0 0 8px #a78bfa) drop-shadow(0 0 20px rgba(167, 139, 250, 0.9));\n  }\n  50% {\n    background: #a78bfa;\n    filter: drop-shadow(0 0 12px #c4b5fd) drop-shadow(0 0 30px rgba(196, 181, 253, 1.0));\n  }\n}\n.token-wrapper.selected[_ngcontent-%COMP%] {\n  z-index: 3;\n}\n.token-portrait[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.token-content.stretch[_ngcontent-%COMP%]   .token-portrait[_ngcontent-%COMP%] {\n  object-fit: fill;\n}\n.token-placeholder[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 20px;\n  font-weight: 600;\n  color: #94a3b8;\n  background: #1e293b;\n}\n.resource-bar[_ngcontent-%COMP%] {\n  position: absolute;\n  height: 4px;\n  background: rgba(0, 0, 0, 0.6);\n  overflow: hidden;\n  -webkit-backdrop-filter: blur(2px);\n  backdrop-filter: blur(2px);\n  opacity: 0;\n  transition: opacity 0.3s;\n  border-radius: 2px;\n}\n.token-wrapper.show-resources[_ngcontent-%COMP%]   .resource-bar[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.bar-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  width: calc(var(--bar-percentage, 0) * 1%);\n  transition: width 0.3s ease-out;\n  box-shadow: 0 0 4px currentColor;\n  border-radius: 2px;\n}\n.health-bar[_ngcontent-%COMP%] {\n  bottom: 0px;\n  left: 18px;\n  right: 18px;\n}\n.health-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #dc2626 0%,\n      #ef4444 100%);\n  box-shadow: 0 0 6px #ef4444;\n}\n.mana-bar[_ngcontent-%COMP%] {\n  bottom: 24px;\n  right: 0px;\n  width: 28px;\n  transform: rotate(-60deg);\n  transform-origin: bottom right;\n}\n.mana-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #2563eb 0%,\n      #3b82f6 100%);\n  box-shadow: 0 0 6px #3b82f6;\n}\n.energy-bar[_ngcontent-%COMP%] {\n  bottom: 24px;\n  left: 0px;\n  width: 28px;\n  transform: rotate(60deg);\n  transform-origin: bottom left;\n}\n.energy-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #16a34a 0%,\n      #22c55e 100%);\n  box-shadow: 0 0 6px #22c55e;\n}\n/*# sourceMappingURL=lobby-token.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LobbyTokenComponent, [{
    type: Component,
    args: [{ selector: "app-lobby-token", standalone: true, imports: [CommonModule, ImageUrlPipe], template: `
    <div 
      class="token-wrapper"
      [class.current-turn]="isCurrentTurn"
      [class.selected]="isSelected"
      [class.dragging]="isDragging"
      [class.non-interactive]="!isInteractive"
      [class.show-resources]="showResources"
      [style.left.px]="position.x"
      [style.top.px]="position.y"
      [style.--team-color]="getTeamColor(token.team || 'default')"
      [style.--token-scale]="scale"
      [style.--user-scale-x]="token.scaleX ?? 1"
      [style.--user-scale-y]="token.scaleY ?? 1"
      [style.--user-rotation]="(token.rotation ?? 0) + 'deg'"
      [style.cursor]="isInteractive ? 'grab' : 'default'"
      [style.pointer-events]="isInteractive ? 'auto' : 'none'"
      (mousedown)="onMouseDown($event)"
      (contextmenu)="onContextMenu($event)"
      (dragstart)="onDragStart($event)"
    >
      <!-- Border layer: slightly larger hex with team color fill, NOT clipped by outer -->
      <div class="token-border"></div>
      <!-- Content layer: clipped hex with image/placeholder -->
      <div class="token-content" [class.stretch]="(token.imageMode || 'fill') === 'stretch'">
        @if (token.customPortraitData) {
          <img 
            class="token-portrait" 
            [src]="token.customPortraitData" 
            alt=""
          />
        } @else if (token.portrait) {
          <img 
            class="token-portrait" 
            [src]="token.portrait | imageUrl" 
            alt=""
            (error)="onImageError($event)"
          />
        } @else {
          <div class="token-placeholder">
            {{ token.name.charAt(0).toUpperCase() }}
          </div>
        }
      </div>
      
      <!-- Resource Bars (only for party members) -->
      @if (resources && showResources) {
        <!-- Health Bar (bottom) -->
        <div class="resource-bar health-bar" [style.--bar-percentage]="getPercentage(resources.health)">
          <div class="bar-fill health-fill"></div>
        </div>
        
        <!-- Energy Bar (bottom-left diagonal) -->
        <div class="resource-bar energy-bar" [style.--bar-percentage]="getPercentage(resources.energy)">
          <div class="bar-fill energy-fill"></div>
        </div>
        
        <!-- Mana Bar (bottom-right diagonal) -->
        <div class="resource-bar mana-bar" [style.--bar-percentage]="getPercentage(resources.mana)">
          <div class="bar-fill mana-fill"></div>
        </div>
      }
    </div>
  `, changeDetection: ChangeDetectionStrategy.OnPush, styles: ["/* angular:styles/component:css;59a08bed48b961d1f7f356176df3908b4f62c51b04ede86a0fa5dbc5ea73f1b9;C:/Users/adermake/Documents/22FailApp/frontend/src/app/lobby/lobby-token/lobby-token.component.ts */\n.token-wrapper {\n  position: absolute;\n  width: 60px;\n  height: 60px;\n  margin-left: -30px;\n  margin-top: -30px;\n  pointer-events: auto;\n  z-index: 1;\n  transform: scale(var(--token-scale, 1)) rotate(var(--user-rotation, 0deg)) scale(var(--user-scale-x, 1), var(--user-scale-y, 1));\n  transform-origin: center center;\n}\n.token-border {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 60px;\n  height: 60px;\n  background: var(--team-color, #475569);\n  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n  -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n}\n.token-content {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  width: 54px;\n  height: 54px;\n  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n  -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);\n  overflow: hidden;\n}\n.token-wrapper:hover:not(.non-interactive) {\n  z-index: 2;\n  filter: brightness(1.1);\n}\n.token-wrapper:active,\n.token-wrapper.dragging {\n  cursor: grabbing;\n  z-index: 10;\n  opacity: 0.7;\n}\n.token-wrapper.current-turn .token-border {\n  background: #22c55e;\n  filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.8));\n}\n.token-wrapper.selected .token-border {\n  background: #7c3aed !important;\n  filter: drop-shadow(0 0 8px #a78bfa) drop-shadow(0 0 20px rgba(167, 139, 250, 0.9));\n  animation: token-glow-pulse 1.5s ease-in-out infinite;\n}\n@keyframes token-glow-pulse {\n  0%, 100% {\n    background: #7c3aed;\n    filter: drop-shadow(0 0 8px #a78bfa) drop-shadow(0 0 20px rgba(167, 139, 250, 0.9));\n  }\n  50% {\n    background: #a78bfa;\n    filter: drop-shadow(0 0 12px #c4b5fd) drop-shadow(0 0 30px rgba(196, 181, 253, 1.0));\n  }\n}\n.token-wrapper.selected {\n  z-index: 3;\n}\n.token-portrait {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.token-content.stretch .token-portrait {\n  object-fit: fill;\n}\n.token-placeholder {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 20px;\n  font-weight: 600;\n  color: #94a3b8;\n  background: #1e293b;\n}\n.resource-bar {\n  position: absolute;\n  height: 4px;\n  background: rgba(0, 0, 0, 0.6);\n  overflow: hidden;\n  -webkit-backdrop-filter: blur(2px);\n  backdrop-filter: blur(2px);\n  opacity: 0;\n  transition: opacity 0.3s;\n  border-radius: 2px;\n}\n.token-wrapper.show-resources .resource-bar {\n  opacity: 1;\n}\n.bar-fill {\n  height: 100%;\n  width: calc(var(--bar-percentage, 0) * 1%);\n  transition: width 0.3s ease-out;\n  box-shadow: 0 0 4px currentColor;\n  border-radius: 2px;\n}\n.health-bar {\n  bottom: 0px;\n  left: 18px;\n  right: 18px;\n}\n.health-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #dc2626 0%,\n      #ef4444 100%);\n  box-shadow: 0 0 6px #ef4444;\n}\n.mana-bar {\n  bottom: 24px;\n  right: 0px;\n  width: 28px;\n  transform: rotate(-60deg);\n  transform-origin: bottom right;\n}\n.mana-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #2563eb 0%,\n      #3b82f6 100%);\n  box-shadow: 0 0 6px #3b82f6;\n}\n.energy-bar {\n  bottom: 24px;\n  left: 0px;\n  width: 28px;\n  transform: rotate(60deg);\n  transform-origin: bottom left;\n}\n.energy-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #16a34a 0%,\n      #22c55e 100%);\n  box-shadow: 0 0 6px #22c55e;\n}\n/*# sourceMappingURL=lobby-token.component.css.map */\n"] }]
  }], null, { token: [{
    type: Input
  }], position: [{
    type: Input
  }], scale: [{
    type: Input
  }], isCurrentTurn: [{
    type: Input
  }], isInteractive: [{
    type: Input
  }], isDragging: [{
    type: Input
  }], resources: [{
    type: Input
  }], showResources: [{
    type: Input
  }], isSelected: [{
    type: Input
  }], dragStart: [{
    type: Output
  }], contextMenu: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LobbyTokenComponent, { className: "LobbyTokenComponent", filePath: "app/lobby/lobby-token/lobby-token.component.ts", lineNumber: 249 });
})();

// src/app/shared/ping/ping.model.ts
var SOUND_BASE = "/ping-sounds";
var PING_TYPES = {
  danger: {
    type: "danger",
    label: "Danger",
    color: "#ef4444",
    icon: "\u2757",
    sound: `${SOUND_BASE}/Caution_ping_SFX.ogg`,
    direction: "up"
  },
  onmyway: {
    type: "onmyway",
    label: "On My Way",
    color: "#22c55e",
    icon: "\u{1F3C3}",
    sound: `${SOUND_BASE}/On_My_Way_ping_SFX.ogg`,
    direction: "right"
  },
  assist: {
    type: "assist",
    label: "Assist Me",
    color: "#3b82f6",
    icon: "\u{1F6A9}",
    sound: `${SOUND_BASE}/Assist_Me_ping_SFX.ogg`,
    direction: "down"
  },
  enemy: {
    type: "enemy",
    label: "Enemy Missing",
    color: "#eab308",
    icon: "\u2753",
    sound: `${SOUND_BASE}/Enemy_Missing_ping_SFX.ogg`,
    direction: "left"
  },
  generic: {
    type: "generic",
    label: "Ping",
    color: "#e2e8f0",
    icon: "\u{1F4CD}",
    sound: `${SOUND_BASE}/Generic_ping_SFX.ogg`,
    direction: "center"
  }
};
var PING_WHEEL_TYPES = [
  PING_TYPES.danger,
  PING_TYPES.onmyway,
  PING_TYPES.assist,
  PING_TYPES.enemy
];
var PING_DURATION_MS = 2400;
var PING_WHEEL_DEADZONE = 28;
function pingTypeFromDrag(dx, dy) {
  if (Math.hypot(dx, dy) < PING_WHEEL_DEADZONE)
    return "generic";
  const angle = Math.atan2(dy, dx);
  const deg = angle * 180 / Math.PI;
  if (deg >= -45 && deg < 45)
    return "onmyway";
  if (deg >= 45 && deg < 135)
    return "assist";
  if (deg >= -135 && deg < -45)
    return "danger";
  return "enemy";
}
var idCounter = 0;
function makePingId() {
  idCounter = (idCounter + 1) % 1e6;
  return `ping-${Date.now().toString(36)}-${idCounter}`;
}

// src/app/shared/ping/ping-layer.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function PingLayerComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 2);
    \u0275\u0275domElement(1, "span", 3)(2, "span", 4)(3, "span", 5);
    \u0275\u0275domElementStart(4, "span", 6);
    \u0275\u0275text(5);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const p_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("left", p_r1.x, "px")("top", p_r1.y, "px")("--ping-color", ctx_r1.color(p_r1.type));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.icon(p_r1.type));
  }
}
var PingLayerComponent = class _PingLayerComponent {
  pings = [];
  color(type) {
    return PING_TYPES[type].color;
  }
  icon(type) {
    return PING_TYPES[type].icon;
  }
  static \u0275fac = function PingLayerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PingLayerComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PingLayerComponent, selectors: [["app-ping-layer"]], inputs: { pings: "pings" }, decls: 3, vars: 0, consts: [[1, "ping-layer"], [1, "ping", 3, "left", "top", "--ping-color"], [1, "ping"], [1, "ping-ring"], [1, "ping-ring", "ping-ring-2"], [1, "ping-ring", "ping-ring-3"], [1, "ping-icon"]], template: function PingLayerComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, PingLayerComponent_For_2_Template, 6, 7, "div", 1, _forTrack0);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.pings);
    }
  }, dependencies: [CommonModule], styles: ["\n\n.ping-layer[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  z-index: 50;\n  overflow: hidden;\n}\n.ping[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 0;\n  height: 0;\n  transform: translate(-50%, -50%);\n}\n.ping-ring[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  width: 54px;\n  height: 54px;\n  margin: -27px 0 0 -27px;\n  border-radius: 50%;\n  border: 3px solid var(--ping-color, #e2e8f0);\n  opacity: 0;\n  animation: _ngcontent-%COMP%_ping-ring 0.85s ease-out 3;\n}\n.ping-ring-2[_ngcontent-%COMP%] {\n  animation-delay: 0.18s;\n}\n.ping-ring-3[_ngcontent-%COMP%] {\n  animation-delay: 0.36s;\n}\n.ping-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 26px;\n  line-height: 1;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6));\n  animation: _ngcontent-%COMP%_ping-icon 2.4s ease-out forwards;\n  text-shadow: 0 0 6px var(--ping-color, #e2e8f0);\n}\n@keyframes _ngcontent-%COMP%_ping-ring {\n  0% {\n    transform: scale(0.25);\n    opacity: 0.9;\n  }\n  100% {\n    transform: scale(1.7);\n    opacity: 0;\n  }\n}\n@keyframes _ngcontent-%COMP%_ping-icon {\n  0% {\n    transform: translate(-50%, -160%) scale(0.6);\n    opacity: 0;\n  }\n  12% {\n    transform: translate(-50%, -50%) scale(1.35);\n    opacity: 1;\n  }\n  22% {\n    transform: translate(-50%, -50%) scale(1);\n  }\n  82% {\n    transform: translate(-50%, -50%) scale(1);\n    opacity: 1;\n  }\n  100% {\n    transform: translate(-50%, -80%) scale(0.7);\n    opacity: 0;\n  }\n}\n/*# sourceMappingURL=ping-layer.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PingLayerComponent, [{
    type: Component,
    args: [{ selector: "app-ping-layer", standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="ping-layer">
      @for (p of pings; track p.id) {
        <div
          class="ping"
          [style.left.px]="p.x"
          [style.top.px]="p.y"
          [style.--ping-color]="color(p.type)"
        >
          <span class="ping-ring"></span>
          <span class="ping-ring ping-ring-2"></span>
          <span class="ping-ring ping-ring-3"></span>
          <span class="ping-icon">{{ icon(p.type) }}</span>
        </div>
      }
    </div>
  `, styles: ["/* angular:styles/component:css;c6ecb41ef4f71a4cafe1739e55fc8f4beae3b9ac293b519d7135a4605ecd26ab;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/ping/ping-layer.component.ts */\n.ping-layer {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  z-index: 50;\n  overflow: hidden;\n}\n.ping {\n  position: absolute;\n  width: 0;\n  height: 0;\n  transform: translate(-50%, -50%);\n}\n.ping-ring {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  width: 54px;\n  height: 54px;\n  margin: -27px 0 0 -27px;\n  border-radius: 50%;\n  border: 3px solid var(--ping-color, #e2e8f0);\n  opacity: 0;\n  animation: ping-ring 0.85s ease-out 3;\n}\n.ping-ring-2 {\n  animation-delay: 0.18s;\n}\n.ping-ring-3 {\n  animation-delay: 0.36s;\n}\n.ping-icon {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 26px;\n  line-height: 1;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6));\n  animation: ping-icon 2.4s ease-out forwards;\n  text-shadow: 0 0 6px var(--ping-color, #e2e8f0);\n}\n@keyframes ping-ring {\n  0% {\n    transform: scale(0.25);\n    opacity: 0.9;\n  }\n  100% {\n    transform: scale(1.7);\n    opacity: 0;\n  }\n}\n@keyframes ping-icon {\n  0% {\n    transform: translate(-50%, -160%) scale(0.6);\n    opacity: 0;\n  }\n  12% {\n    transform: translate(-50%, -50%) scale(1.35);\n    opacity: 1;\n  }\n  22% {\n    transform: translate(-50%, -50%) scale(1);\n  }\n  82% {\n    transform: translate(-50%, -50%) scale(1);\n    opacity: 1;\n  }\n  100% {\n    transform: translate(-50%, -80%) scale(0.7);\n    opacity: 0;\n  }\n}\n/*# sourceMappingURL=ping-layer.component.css.map */\n"] }]
  }], null, { pings: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PingLayerComponent, { className: "PingLayerComponent", filePath: "app/shared/ping/ping-layer.component.ts", lineNumber: 118 });
})();

// src/app/shared/ping/ping-wheel.component.ts
var _forTrack02 = ($index, $item) => $item.type;
function PingWheelComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 4)(1, "span", 3);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const t_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap("seg-" + t_r1.direction);
    \u0275\u0275styleProp("--seg-color", t_r1.color);
    \u0275\u0275classProp("active", ctx_r1.selected === t_r1.type);
    \u0275\u0275domProperty("title", t_r1.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(t_r1.icon);
  }
}
var PingWheelComponent = class _PingWheelComponent {
  x = 0;
  y = 0;
  selected = "generic";
  wheelTypes = PING_WHEEL_TYPES;
  genericColor = PING_TYPES.generic.color;
  genericIcon = PING_TYPES.generic.icon;
  genericLabel = PING_TYPES.generic.label;
  static \u0275fac = function PingWheelComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _PingWheelComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _PingWheelComponent, selectors: [["app-ping-wheel"]], inputs: { x: "x", y: "y", selected: "selected" }, decls: 6, vars: 10, consts: [[1, "wheel"], [1, "seg", 3, "class", "active", "--seg-color", "title"], [1, "center", 3, "title"], [1, "seg-icon"], [1, "seg", 3, "title"]], template: function PingWheelComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, PingWheelComponent_For_2_Template, 3, 8, "div", 1, _forTrack02);
      \u0275\u0275domElementStart(3, "div", 2)(4, "span", 3);
      \u0275\u0275text(5);
      \u0275\u0275domElementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275styleProp("left", ctx.x, "px")("top", ctx.y, "px");
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.wheelTypes);
      \u0275\u0275advance(2);
      \u0275\u0275styleProp("--seg-color", ctx.genericColor);
      \u0275\u0275classProp("active", ctx.selected === "generic");
      \u0275\u0275domProperty("title", ctx.genericLabel);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.genericIcon);
    }
  }, dependencies: [CommonModule], styles: ["\n\n.wheel[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 0;\n  height: 0;\n  z-index: 60;\n  pointer-events: none;\n}\n.seg[_ngcontent-%COMP%], \n.center[_ngcontent-%COMP%] {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  background: rgba(15, 23, 42, 0.72);\n  border: 2px solid rgba(148, 163, 184, 0.55);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);\n  transition:\n    transform 0.08s ease,\n    background 0.08s ease,\n    border-color 0.08s ease;\n}\n.seg[_ngcontent-%COMP%] {\n  width: 46px;\n  height: 46px;\n  margin: -23px 0 0 -23px;\n}\n.center[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  left: 0;\n  top: 0;\n  margin: -20px 0 0 -20px;\n}\n.seg-up[_ngcontent-%COMP%] {\n  left: 0;\n  top: -58px;\n}\n.seg-right[_ngcontent-%COMP%] {\n  left: 58px;\n  top: 0;\n}\n.seg-down[_ngcontent-%COMP%] {\n  left: 0;\n  top: 58px;\n}\n.seg-left[_ngcontent-%COMP%] {\n  left: -58px;\n  top: 0;\n}\n.seg-icon[_ngcontent-%COMP%] {\n  font-size: 22px;\n  line-height: 1;\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));\n}\n.seg.active[_ngcontent-%COMP%], \n.center.active[_ngcontent-%COMP%] {\n  background: var(--seg-color);\n  border-color: #fff;\n  transform: scale(1.22);\n}\n.seg.active[_ngcontent-%COMP%]   .seg-icon[_ngcontent-%COMP%], \n.center.active[_ngcontent-%COMP%]   .seg-icon[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.85));\n}\n/*# sourceMappingURL=ping-wheel.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PingWheelComponent, [{
    type: Component,
    args: [{ selector: "app-ping-wheel", standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="wheel" [style.left.px]="x" [style.top.px]="y">
      @for (t of wheelTypes; track t.type) {
        <div
          class="seg"
          [class]="'seg-' + t.direction"
          [class.active]="selected === t.type"
          [style.--seg-color]="t.color"
          [title]="t.label"
        >
          <span class="seg-icon">{{ t.icon }}</span>
        </div>
      }
      <div
        class="center"
        [class.active]="selected === 'generic'"
        [style.--seg-color]="genericColor"
        [title]="genericLabel"
      >
        <span class="seg-icon">{{ genericIcon }}</span>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;357935c775dbe9b6350ed69907a356bb6fd1df8fed3665709872f1fbc0dae505;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/ping/ping-wheel.component.ts */\n.wheel {\n  position: absolute;\n  width: 0;\n  height: 0;\n  z-index: 60;\n  pointer-events: none;\n}\n.seg,\n.center {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  background: rgba(15, 23, 42, 0.72);\n  border: 2px solid rgba(148, 163, 184, 0.55);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);\n  transition:\n    transform 0.08s ease,\n    background 0.08s ease,\n    border-color 0.08s ease;\n}\n.seg {\n  width: 46px;\n  height: 46px;\n  margin: -23px 0 0 -23px;\n}\n.center {\n  width: 40px;\n  height: 40px;\n  left: 0;\n  top: 0;\n  margin: -20px 0 0 -20px;\n}\n.seg-up {\n  left: 0;\n  top: -58px;\n}\n.seg-right {\n  left: 58px;\n  top: 0;\n}\n.seg-down {\n  left: 0;\n  top: 58px;\n}\n.seg-left {\n  left: -58px;\n  top: 0;\n}\n.seg-icon {\n  font-size: 22px;\n  line-height: 1;\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));\n}\n.seg.active,\n.center.active {\n  background: var(--seg-color);\n  border-color: #fff;\n  transform: scale(1.22);\n}\n.seg.active .seg-icon,\n.center.active .seg-icon {\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.85));\n}\n/*# sourceMappingURL=ping-wheel.component.css.map */\n"] }]
  }], null, { x: [{
    type: Input
  }], y: [{
    type: Input
  }], selected: [{
    type: Input
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(PingWheelComponent, { className: "PingWheelComponent", filePath: "app/shared/ping/ping-wheel.component.ts", lineNumber: 105 });
})();

// src/app/shared/ping/ping-audio.ts
var PING_BASE_LEVEL = 0.25;
var cache = /* @__PURE__ */ new Map();
function getBase(type) {
  let base = cache.get(type);
  if (!base) {
    base = new Audio(PING_TYPES[type].sound);
    base.preload = "auto";
    cache.set(type, base);
  }
  return base;
}
function playPingSound(type) {
  try {
    const volume = scaledVolume(PING_BASE_LEVEL);
    if (volume <= 0)
      return;
    const el = getBase(type).cloneNode(true);
    el.volume = volume;
    void el.play().catch(() => {
    });
  } catch {
  }
}
function preloadPingSounds() {
  for (const type of Object.keys(PING_TYPES)) {
    getBase(type);
  }
}

// src/app/shared/ping/ping-controller.ts
var PingController = class {
  onChange;
  broadcast;
  selfId;
  activePings = [];
  gDown = false;
  wheelOpen = false;
  wheelScreen = { x: 0, y: 0 };
  wheelType = "generic";
  wheelWorld = { x: 0, y: 0 };
  downScreen = null;
  timers = /* @__PURE__ */ new Set();
  constructor(onChange, broadcast, selfId) {
    this.onChange = onChange;
    this.broadcast = broadcast;
    this.selfId = selfId;
  }
  destroy() {
    for (const t of this.timers)
      clearTimeout(t);
    this.timers.clear();
    this.activePings = [];
  }
  /**
   * Track the G key. Once the wheel is OPEN it deliberately survives a G release — letting go
   * a moment early while aiming used to dismiss the wheel mid-drag. The wheel then closes
   * either by firing a ping (endWheel) or by tapping G again, which acts as a cancel.
   */
  setGDown(v) {
    if (this.gDown === v)
      return;
    this.gDown = v;
    if (v && this.wheelOpen)
      this.cancelWheel();
  }
  /** Arm the wheel on mousedown. Returns true if it consumed the event. */
  beginWheel(screenX, screenY, worldX, worldY) {
    if (!this.gDown)
      return false;
    this.wheelOpen = true;
    this.downScreen = { x: screenX, y: screenY };
    this.wheelScreen = { x: screenX, y: screenY };
    this.wheelWorld = { x: worldX, y: worldY };
    this.wheelType = "generic";
    this.onChange();
    return true;
  }
  updateWheel(screenX, screenY) {
    if (!this.wheelOpen || !this.downScreen)
      return false;
    this.wheelType = pingTypeFromDrag(screenX - this.downScreen.x, screenY - this.downScreen.y);
    this.onChange();
    return true;
  }
  /** Fire the selected ping on mouseup. Returns true if it consumed the event. */
  endWheel() {
    if (!this.wheelOpen)
      return false;
    const id = makePingId();
    const type = this.wheelType;
    const { x: worldX, y: worldY } = this.wheelWorld;
    const createdBy = this.selfId();
    this.wheelOpen = false;
    this.downScreen = null;
    this.addPing({ id, type, worldX, worldY, createdBy, createdAt: Date.now() }, true);
    this.broadcast({ id, type, worldX, worldY, createdBy });
    return true;
  }
  cancelWheel() {
    this.wheelOpen = false;
    this.downScreen = null;
    this.onChange();
  }
  /** A ping from another client (or our own echo — deduped by id). */
  addRemotePing(b) {
    if (this.activePings.some((p) => p.id === b.id))
      return;
    this.addPing(__spreadProps(__spreadValues({}, b), { createdAt: Date.now() }), true);
  }
  addPing(ping, playSound) {
    this.activePings = [...this.activePings, ping];
    if (playSound)
      playPingSound(ping.type);
    const t = setTimeout(() => {
      this.activePings = this.activePings.filter((p) => p.id !== ping.id);
      this.timers.delete(t);
      this.onChange();
    }, PING_DURATION_MS);
    this.timers.add(t);
    this.onChange();
  }
};

export {
  getDefaultDrawLayerId,
  drawStrokeOnContext,
  renderDrawLayerContent,
  loadDataUrlImage,
  normalizeLassoPolygon,
  flattenDrawLayerContent,
  removeLayerContentInPolygon,
  createLassoRegionFromPolygon,
  imageDataToDataUrl,
  prepareImageForUpload,
  formatBytes,
  prepareWorldMapTileForUpload,
  LobbyTokenComponent,
  PingLayerComponent,
  PingWheelComponent,
  preloadPingSounds,
  PingController
};
//# sourceMappingURL=chunk-4GT4FVN3.js.map
