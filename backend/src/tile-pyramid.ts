import { PNG } from 'pngjs';

/**
 * Tile pyramid maths and image composition.
 *
 * The point of a pyramid is not that distant tiles are blurrier — it is that the *number*
 * of tiles on screen stays constant at every zoom. Each level covers four times the world
 * area per tile, so zooming out swaps to bigger tiles instead of asking for more of them.
 * Without that, tile count grows with the square of the zoom-out and no budget survives it.
 *
 * Level 0 is what the editor paints on. Level N is built by downscaling the four level-N-1
 * tiles beneath it, so a parent is always derivable and never authored directly.
 */

/** Texels per tile side, every level. Matches the client's `LAYER_TEXELS`. */
export const TILE_TEXELS = 512;

/**
 * Deepest level built. Level 0 spans 1024 world px, so level 11 spans ~2 million — far
 * past any map that will be drawn, and the ceiling only bounds recursion.
 */
export const MAX_TILE_LEVEL = 11;

/** The four level-(L-1) tiles that make up one level-L tile. */
export function childrenOf(cx: number, cy: number): { cx: number; cy: number }[] {
  const x = cx * 2;
  const y = cy * 2;
  return [
    { cx: x, cy: y },
    { cx: x + 1, cy: y },
    { cx: x, cy: y + 1 },
    { cx: x + 1, cy: y + 1 },
  ];
}

/** The level-(L+1) tile containing a level-L tile. Floor division, so negatives work. */
export function parentOf(cx: number, cy: number): { cx: number; cy: number } {
  return { cx: Math.floor(cx / 2), cy: Math.floor(cy / 2) };
}

/**
 * Compose four child tiles into one parent.
 *
 * Each child is box-filtered to half size and blitted into its quadrant. Missing children
 * are left transparent, which is exactly right: an unpainted quadrant should read as empty
 * rather than as a hole, and the client's shader already treats transparent as open sea.
 */
export function composeParent(children: (Buffer | null)[]): Buffer | null {
  if (children.every(c => !c)) return null;

  const out = new PNG({ width: TILE_TEXELS, height: TILE_TEXELS });
  out.data.fill(0);

  const half = TILE_TEXELS / 2;
  const offsets = [
    { x: 0, y: 0 },
    { x: half, y: 0 },
    { x: 0, y: half },
    { x: half, y: half },
  ];

  for (let i = 0; i < 4; i++) {
    const raw = children[i];
    if (!raw) continue;

    let src: PNG;
    try {
      src = PNG.sync.read(raw);
    } catch {
      continue; // a corrupt child must not take the whole parent down
    }

    downscaleInto(src, out, offsets[i].x, offsets[i].y, half);
  }

  return PNG.sync.write(out);
}

/**
 * Box-filter `src` to `size`×`size` and write it at (dx, dy) in `dst`.
 *
 * Averaged rather than point-sampled, and averaged in *premultiplied* space: these tiles
 * carry coverage in alpha, and mixing a transparent texel's stale colour into the average
 * would drag fringes of arbitrary colour along every coastline as you zoom out.
 */
function downscaleInto(src: PNG, dst: PNG, dx: number, dy: number, size: number): void {
  const factor = Math.max(1, Math.round(src.width / size));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;

      for (let sy = 0; sy < factor; sy++) {
        for (let sx = 0; sx < factor; sx++) {
          const px = x * factor + sx;
          const py = y * factor + sy;
          if (px >= src.width || py >= src.height) continue;

          const i = (py * src.width + px) * 4;
          const alpha = src.data[i + 3] / 255;
          r += src.data[i] * alpha;
          g += src.data[i + 1] * alpha;
          b += src.data[i + 2] * alpha;
          a += alpha;
          n++;
        }
      }
      if (n === 0) continue;

      const outA = a / n;
      const o = ((dy + y) * dst.width + (dx + x)) * 4;

      if (outA <= 0) {
        dst.data[o] = dst.data[o + 1] = dst.data[o + 2] = dst.data[o + 3] = 0;
        continue;
      }

      // Back out of premultiplied space so the stored tile keeps straight alpha.
      dst.data[o] = Math.round(r / n / outA);
      dst.data[o + 1] = Math.round(g / n / outA);
      dst.data[o + 2] = Math.round(b / n / outA);
      dst.data[o + 3] = Math.round(outA * 255);
    }
  }
}
