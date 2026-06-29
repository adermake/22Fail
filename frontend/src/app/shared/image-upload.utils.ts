/** Target max upload size (binary). Keeps uploads under typical reverse-proxy limits. */
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 8192;

/** Stay under typical nginx client_max_body_size 100m (leave headroom for multipart overhead). */
export const WORLD_MAP_TILE_MAX_BYTES = 95 * 1024 * 1024;

function jpegName(originalName: string): string {
  const base = originalName.replace(/\.[^/.]+$/, '') || 'image';
  return `${base}.jpg`;
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
      reject(new Error(`Could not read image: ${file.name}`));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Failed to encode image'))),
      type,
      quality,
    );
  });
}

async function encodeUnderLimit(
  img: HTMLImageElement,
  originalName: string,
  maxDimension: number,
  maxBytes: number,
): Promise<File> {
  let dim = maxDimension;
  while (dim >= 256) {
    const scale = Math.min(1, dim / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.92;
    while (quality >= 0.45) {
      const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (blob.size <= maxBytes) {
        return new File([blob], jpegName(originalName), { type: 'image/jpeg', lastModified: Date.now() });
      }
      quality -= 0.07;
    }

    dim = Math.floor(dim * 0.75);
  }

  throw new Error('Image is too large even after compression');
}

/**
 * Prepare a file for server upload: pass through small files, compress large ones.
 */
export async function prepareImageForUpload(
  file: File,
  options?: { maxBytes?: number; maxDimension?: number },
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file');
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
    img.src = '';
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionForMime(mime: string, originalName: string): string {
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/jpeg') return '.jpg';
  const ext = originalName.match(/(\.[^.]+)$/)?.[1];
  return ext ?? '.png';
}

/**
 * Prepare a world-map macro tile for upload: never downscales (hex alignment depends on pixel size).
 * Re-encodes as WebP/PNG at full resolution only if the file exceeds maxBytes.
 */
export async function prepareWorldMapTileForUpload(
  file: File,
  options?: { maxBytes?: number },
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file');
  }

  const maxBytes = options?.maxBytes ?? WORLD_MAP_TILE_MAX_BYTES;
  if (file.size <= maxBytes) {
    return file;
  }

  const img = await loadImageFromFile(file);
  try {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');
    ctx.drawImage(img, 0, 0, width, height);

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'hex_tile';

    for (const mime of ['image/webp', 'image/png'] as const) {
      const qualities =
        mime === 'image/webp'
          ? [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45]
          : [undefined];
      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, mime, quality ?? 1);
        if (blob.size <= maxBytes) {
          const ext = extensionForMime(mime, file.name);
          return new File([blob], `${baseName}${ext}`, {
            type: mime,
            lastModified: Date.now(),
          });
        }
      }
    }

    throw new Error(
      `Kachel "${file.name}" ist ${formatBytes(file.size)} — auch als WebP unter ${formatBytes(maxBytes)} nicht darstellbar. ` +
        'Entweder nginx client_max_body_size erhöhen (z. B. 500m) oder Kacheln extern verkleinern.',
    );
  } finally {
    img.src = '';
  }
}

export function uploadTooLargeMessage(status: number): string | null {
  if (status !== 413) return null;
  return (
    'Upload abgelehnt (413): nginx client_max_body_size ist vermutlich 100m und die Datei ist größer. ' +
    'Nach dem nächsten Frontend-Deploy werden große Kacheln automatisch komprimiert. ' +
    'Alternativ nginx auf 500m erhöhen.'
  );
}
