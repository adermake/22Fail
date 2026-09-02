/**
 * Landmass import — turn an existing map image into terrain.
 *
 * A map drawn in another tool cannot be brought across as artwork: v2 stores terrain as
 * data, not as a picture. What *can* be carried across is the landmass itself, which is the
 * part that is tedious to retrace by hand — symbols and labels are quick to re-place, a
 * coastline is not.
 *
 * The convention is the one every landmass export already uses: **transparent is sea,
 * opaque is land**. So the source alpha channel is the land mask, and the source RGB is the
 * ground colour underneath it. Those map exactly onto the two rasters the editor already
 * has — `height` (alpha = terrain height) and `landColor` (alpha = coverage, RGB = colour) —
 * which is why the import needs no new layer and no new format.
 *
 * The mask is thresholded rather than kept as a gradient. A soft alpha ramp would land in
 * the height field as ground that is *neither* sea nor land, sitting right at the coastline
 * shader's cutoff, where the noise term then makes it flicker between the two. One hard
 * decision per source pixel, resampled with linear filtering when it is stamped, gives a
 * clean coast that the shader can then wobble deliberately.
 *
 * Nothing here touches Pixi or Angular: it is canvas work and arithmetic, so the sizing
 * rules — which decide how many chunks an import will write, and therefore whether it is
 * feasible at all — are testable without a GPU.
 */

import { DetailTier, LAYER_TEXELS, TIERS, TIER_WORLD_SIZE, coarserTiers } from './map-editor.model';
import { Bounds } from './map-camera';

/** A loaded source image, with the numbers the placement UI needs. */
export interface LandmassSource {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  fileName: string;
}

/**
 * Where the image sits on the map, in world pixels.
 *
 * Stored as centre plus a uniform scale rather than as a rectangle: the user drags the
 * image around and zooms it, and both gestures are about the centre.
 */
export interface LandmassPlacement {
  /** World position of the image centre. */
  x: number;
  y: number;
  /** World pixels per image pixel. */
  scale: number;
}

/** World rectangle the placed image covers. */
export function placementBounds(src: LandmassSource, p: LandmassPlacement): Bounds {
  const w = src.width * p.scale;
  const h = src.height * p.scale;
  return { minX: p.x - w / 2, minY: p.y - h / 2, maxX: p.x + w / 2, maxY: p.y + h / 2 };
}

/** World pixels one texel covers at a tier — the import's effective resolution. */
export function worldPerTexel(tier: DetailTier): number {
  // Every layer is the same size, so `height` stands for all of them.
  return TIER_WORLD_SIZE[tier] / LAYER_TEXELS.height;
}

/** Chunk positions of `tier` a world rectangle covers. */
export function cellsCovering(bounds: Bounds, tier: DetailTier): { cx: number; cy: number }[] {
  const span = TIER_WORLD_SIZE[tier];
  const minCx = Math.floor(bounds.minX / span);
  const maxCx = Math.floor((bounds.maxX - 1e-6) / span);
  const minCy = Math.floor(bounds.minY / span);
  const maxCy = Math.floor((bounds.maxY - 1e-6) / span);

  const cells: { cx: number; cy: number }[] = [];
  for (let cy = minCy; cy <= maxCy; cy++) {
    for (let cx = minCx; cx <= maxCx; cx++) cells.push({ cx, cy });
  }
  return cells;
}

/**
 * Chunk rectangle of `tier` lying wholly inside a world rectangle, or null if none does.
 *
 * These can be cleared by deleting their files outright, which costs nothing whatever the
 * area. Returned as a rectangle rather than a list because that is what the delete endpoint
 * takes, and because at `high` the list can run to thousands of entries.
 */
export function innerCellRect(
  bounds: Bounds,
  tier: DetailTier,
): { minCx: number; minCy: number; maxCx: number; maxCy: number } | null {
  const span = TIER_WORLD_SIZE[tier];
  const rect = {
    minCx: Math.ceil(bounds.minX / span),
    minCy: Math.ceil(bounds.minY / span),
    maxCx: Math.floor(bounds.maxX / span) - 1,
    maxCy: Math.floor(bounds.maxY / span) - 1,
  };
  if (rect.maxCx < rect.minCx || rect.maxCy < rect.minCy) return null;
  return rect;
}

/**
 * Cells the rectangle's edge crosses — overlapped, but not wholly contained.
 *
 * These are the ones a file delete cannot touch, because they also hold map *outside* the
 * rectangle that has to survive. Skipping them was a real bug rather than a rounding detail:
 * one chunk is 23 hexes at `med` and 182 at `low`, so "a chunk-wide fringe of stale content"
 * is most of a continent, and it composites straight over the freshly imported ground.
 *
 * They have to be erased the expensive way — load, subtract the rectangle, upload — but there
 * are only ever O(perimeter) of them, against O(area) for the interior.
 */
export function edgeCells(bounds: Bounds, tier: DetailTier): { cx: number; cy: number }[] {
  const inner = innerCellRect(bounds, tier);
  return cellsCovering(bounds, tier).filter(
    c =>
      inner === null ||
      c.cx < inner.minCx ||
      c.cx > inner.maxCx ||
      c.cy < inner.minCy ||
      c.cy > inner.maxCy,
  );
}

/**
 * Cells an import at `tier` writes, counting the coarser tiers it also fills.
 *
 * This is the number that decides whether an import is a click or a coffee break: each cell
 * is a texture to fetch, paint and PNG-encode back to the server, per layer. Shown in the
 * panel so the choice of tier is made against the real cost rather than against a word like
 * "hoch".
 */
export function importCellCount(bounds: Bounds, tier: DetailTier): number {
  let total = 0;
  for (const t of [tier, ...coarserTiers(tier)]) total += cellsCovering(bounds, t).length;
  return total;
}

/**
 * Above this many cells an import is refused unless the user insists.
 *
 * A continent at `high` is tens of thousands of cells — hours of uploads for detail the
 * source image does not contain. The cap is a guard rail, not a technical limit.
 */
export const IMPORT_CELL_WARN = 400;

/**
 * Finest tier worth importing at.
 *
 * Bounded from both ends. Going finer than the source image resolves is pure cost — the
 * extra texels are interpolation, not detail — so the first rule is never to upsample by
 * more than a little. The second is the cell budget: even a high-resolution source is not
 * worth thousands of round trips, and the coastline shader recovers most of the apparent
 * detail anyway.
 */
export function recommendedTier(src: LandmassSource, p: LandmassPlacement): DetailTier {
  const bounds = placementBounds(src, p);
  // World pixels one *source* pixel covers once placed.
  const worldPerSourcePx = p.scale;

  for (const tier of TIERS) {
    // Allow a 2× upsample: a slightly finer grid keeps the coast smooth rather than blocky.
    if (worldPerTexel(tier) * 2 < worldPerSourcePx) continue;
    if (importCellCount(bounds, tier) > IMPORT_CELL_WARN) continue;
    return tier;
  }
  return 'low';
}

export interface MaskOptions {
  /** Source alpha (0..1) at or above which a pixel counts as land. */
  threshold: number;
  /** Whether to carry the image's colours into `landColor` as well as its shape. */
  withColor: boolean;
  /**
   * World pixels per texel of the tier being written.
   *
   * The masks are rendered at that density and no finer: a 8000² source stamped at `low`
   * would otherwise be decoded, thresholded and held in full for texels that cannot resolve
   * a hundredth of it.
   */
  worldPerTexel: number;
  /**
   * World width of the placed image, so the working resolution can be derived.
   *
   * Width alone, because the placement scales uniformly — the aspect ratio of the source is
   * preserved, so height carries no extra information.
   */
  worldWidth: number;
}

/** Hard ceiling on a working canvas side, so a huge source cannot exhaust memory. */
export const MAX_MASK_TEXELS = 4096;

export interface LandmassMasks {
  /** White RGB, alpha = land. Written into the `height` raster. */
  heightCanvas: HTMLCanvasElement;
  /** Source RGB, alpha = land. Written into `landColor`; null when colour is not imported. */
  colorCanvas: HTMLCanvasElement | null;
  width: number;
  height: number;
}

/**
 * Working resolution for the masks: enough texels to feed the target tier, never more.
 *
 * Doubled against the tier's texel density because the stamp resamples with linear
 * filtering, and a mask at exactly one texel per target texel aliases along every diagonal
 * coastline.
 */
export function maskResolution(
  opts: MaskOptions,
  srcW: number,
  srcH: number,
): { w: number; h: number } {
  const wanted = Math.max(1, (opts.worldWidth / opts.worldPerTexel) * 2);
  const scale = Math.min(1, wanted / srcW, MAX_MASK_TEXELS / Math.max(srcW, srcH));
  return {
    w: Math.max(1, Math.round(srcW * scale)),
    h: Math.max(1, Math.round(srcH * scale)),
  };
}

/**
 * Split a source image into the two rasters the editor stores.
 *
 * Both come out of one `getImageData` pass, because the expensive part is the readback, not
 * the arithmetic. Colour is taken straight from the source *only where the mask says land* —
 * a transparent pixel's RGB is undefined (usually black), and letting it through would draw
 * a dark fringe along every coastline where the source was antialiased.
 */
export function buildLandmassMasks(bitmap: ImageBitmap, opts: MaskOptions): LandmassMasks {
  const { w, h } = maskResolution(opts, bitmap.width, bitmap.height);

  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d', { willReadFrequently: true })!;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  sctx.drawImage(bitmap, 0, 0, w, h);

  const image = sctx.getImageData(0, 0, w, h);
  const color = opts.withColor ? sctx.createImageData(w, h) : null;
  const height = sctx.createImageData(w, h);

  applyThreshold(image, height, color, opts.threshold);

  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = w;
  heightCanvas.height = h;
  heightCanvas.getContext('2d')!.putImageData(height, 0, 0);

  let colorCanvas: HTMLCanvasElement | null = null;
  if (color) {
    colorCanvas = document.createElement('canvas');
    colorCanvas.width = w;
    colorCanvas.height = h;
    colorCanvas.getContext('2d')!.putImageData(color, 0, 0);
  }

  return { heightCanvas, colorCanvas, width: w, height: h };
}

/**
 * The per-pixel decision, split out so it can be tested without a canvas.
 *
 * `height` gets white with the mask in alpha — the raster reads alpha alone, and leaving RGB
 * black would poison anything that ever composites it in premultiplied space. `color` gets
 * the source RGB with the same mask, so land colour and land shape cannot disagree.
 */
export function applyThreshold(
  source: ImageData,
  height: ImageData,
  color: ImageData | null,
  threshold: number,
): void {
  const cut = Math.round(Math.max(0, Math.min(1, threshold)) * 255);
  const s = source.data;
  const hd = height.data;
  const cd = color?.data;

  for (let i = 0; i < s.length; i += 4) {
    // `>= cut` with cut 0 would call fully transparent pixels land, so 0 stays sea.
    const land = s[i + 3] >= cut && s[i + 3] > 0;
    hd[i] = 255;
    hd[i + 1] = 255;
    hd[i + 2] = 255;
    hd[i + 3] = land ? 255 : 0;

    if (cd) {
      cd[i] = land ? s[i] : 0;
      cd[i + 1] = land ? s[i + 1] : 0;
      cd[i + 2] = land ? s[i + 2] : 0;
      cd[i + 3] = land ? 255 : 0;
    }
  }
}

/** Decode a picked file, rejecting anything the browser cannot read as an image. */
export async function loadLandmassImage(file: File): Promise<LandmassSource> {
  const bitmap = await createImageBitmap(file);
  return { bitmap, width: bitmap.width, height: bitmap.height, fileName: file.name };
}

/** Scale that makes the image cover `view` as fully as it can without cropping. */
export function fitScale(src: LandmassSource, view: Bounds): number {
  const w = Math.max(1, view.maxX - view.minX);
  const h = Math.max(1, view.maxY - view.minY);
  return Math.min(w / src.width, h / src.height);
}
