/**
 * Macro-tile stencil masking (white square PNG → hex-shaped alpha).
 * Uses /world-map/stencil.png when present, otherwise generates a flat-top hex mask.
 */

import { HEX_HEIGHT, HEX_WIDTH } from './world-map-hex.utils';

const STENCIL_URL = '/world-map/stencil.png';
let cachedStencil: HTMLImageElement | null | undefined;

export async function loadMacroStencil(): Promise<HTMLImageElement | null> {
  if (cachedStencil !== undefined) return cachedStencil;
  try {
    const img = await loadImage(STENCIL_URL);
    cachedStencil = img;
    return img;
  } catch {
    cachedStencil = null;
    return null;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

/** Pointy-top hex mask (white = visible) matching the real stencil.png shape. */
export function createGeneratedMacroStencil(
  width = HEX_WIDTH,
  height = HEX_HEIGHT,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  // Pointy-top: width = sqrt(3)·r (points at top & bottom, vertical side edges).
  const r = Math.min(width / Math.sqrt(3), height / 2);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  return canvas;
}

function getStencilCanvas(
  width: number,
  height: number,
  stencil: HTMLImageElement | null,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  if (stencil) {
    ctx.drawImage(stencil, 0, 0, width, height);
  } else {
    ctx.drawImage(createGeneratedMacroStencil(width, height), 0, 0);
  }
  return canvas;
}

/** Apply macro hex stencil alpha to an image file (same as apply_mask.py). */
export async function applyMacroStencilToFile(file: File): Promise<File> {
  const img = await loadImageFromFile(file);
  const stencil = await loadMacroStencil();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const maskCanvas = getStencilCanvas(w, h, stencil);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  const blob = await canvasToBlob(canvas, 'image/png');
  const base = file.name.replace(/\.[^.]+$/, '') || 'hex_tile';
  return new File([blob], `${base}.png`, { type: 'image/png', lastModified: Date.now() });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode failed'))), type);
  });
}
