/**
 * Bucket fill on raw RGBA pixels, for the token draw editor.
 *
 * Pure so it can be tested without a canvas: takes the `ImageData.data` array, fills in place and
 * returns how many pixels changed. A pixel joins the region when every channel (alpha included) is
 * within `tolerance` of the start pixel, so filling into a soft anti-aliased edge stops at the edge
 * instead of leaking through it. The new colour is blended over what was there by `alpha` (0–1),
 * which is what the brush opacity slider means for the bucket too.
 */
export function floodFill(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  color: [number, number, number],
  alpha = 1,
  tolerance = 32,
): number {
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return 0;

  const start = (sy * width + sx) * 4;
  const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
  const a = Math.max(0, Math.min(1, alpha));

  const matches = (i: number): boolean =>
    Math.abs(data[i] - target[0]) <= tolerance &&
    Math.abs(data[i + 1] - target[1]) <= tolerance &&
    Math.abs(data[i + 2] - target[2]) <= tolerance &&
    Math.abs(data[i + 3] - target[3]) <= tolerance;

  // Visited mask: a blended fill can land back inside the tolerance of the target colour, so the
  // pixel data alone cannot tell "done" from "still to do".
  const seen = new Uint8Array(width * height);
  const stack: number[] = [sx, sy];
  let changed = 0;

  while (stack.length) {
    const y = stack.pop()!;
    let x = stack.pop()!;
    // Walk left to the start of this run, then fill rightwards (scanline fill).
    while (x > 0 && !seen[y * width + x - 1] && matches((y * width + x - 1) * 4)) x--;
    let upOpen = false;
    let downOpen = false;
    for (; x < width; x++) {
      const p = y * width + x;
      const i = p * 4;
      if (seen[p] || !matches(i)) break;
      seen[p] = 1;

      const srcA = data[i + 3] / 255;
      const outA = a + srcA * (1 - a);
      for (let c = 0; c < 3; c++) {
        data[i + c] = outA > 0 ? Math.round((color[c] * a + data[i + c] * srcA * (1 - a)) / outA) : 0;
      }
      data[i + 3] = Math.round(outA * 255);
      changed++;

      if (y > 0) {
        const up = p - width;
        const open = !seen[up] && matches(up * 4);
        if (open && !upOpen) stack.push(x, y - 1);
        upOpen = open;
      }
      if (y < height - 1) {
        const down = p + width;
        const open = !seen[down] && matches(down * 4);
        if (open && !downOpen) stack.push(x, y + 1);
        downOpen = open;
      }
    }
  }
  return changed;
}
