import { floodFill } from './flood-fill.util';

/** A w×h image, every pixel the given RGBA. */
function image(w: number, h: number, rgba: [number, number, number, number]): Uint8ClampedArray {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) data.set(rgba, i * 4);
  return data;
}

const px = (data: Uint8ClampedArray, w: number, x: number, y: number) =>
  Array.from(data.slice((y * w + x) * 4, (y * w + x) * 4 + 4));

describe('Füllen (Farbeimer)', () => {
  it('fills a uniform image completely', () => {
    const data = image(4, 3, [255, 255, 255, 255]);
    expect(floodFill(data, 4, 3, 1, 1, [255, 0, 0])).toBe(12);
    expect(px(data, 4, 3, 2)).toEqual([255, 0, 0, 255]);
  });

  it('stops at a wall of a different colour', () => {
    // 5 wide, column 2 is black: filling the left half leaves the right half alone.
    const w = 5, h = 3;
    const data = image(w, h, [255, 255, 255, 255]);
    for (let y = 0; y < h; y++) data.set([0, 0, 0, 255], (y * w + 2) * 4);
    expect(floodFill(data, w, h, 0, 0, [0, 0, 255])).toBe(6);
    expect(px(data, w, 1, 1)).toEqual([0, 0, 255, 255]);
    expect(px(data, w, 2, 1)).toEqual([0, 0, 0, 255]);
    expect(px(data, w, 4, 1)).toEqual([255, 255, 255, 255]);
  });

  it('fills transparent space and makes it opaque', () => {
    const data = image(2, 2, [0, 0, 0, 0]);
    floodFill(data, 2, 2, 0, 0, [10, 20, 30]);
    expect(px(data, 2, 1, 1)).toEqual([10, 20, 30, 255]);
  });

  it('blends by alpha instead of overwriting', () => {
    const data = image(1, 1, [0, 0, 0, 255]);
    floodFill(data, 1, 1, 0, 0, [200, 100, 0], 0.5);
    expect(px(data, 1, 0, 0)).toEqual([100, 50, 0, 255]);
  });

  it('terminates when the blended colour stays inside the tolerance', () => {
    const data = image(8, 8, [100, 100, 100, 255]);
    expect(floodFill(data, 8, 8, 0, 0, [110, 110, 110], 0.5)).toBe(64);
  });

  it('ignores a start point outside the image', () => {
    const data = image(2, 2, [0, 0, 0, 255]);
    expect(floodFill(data, 2, 2, 5, 5, [255, 255, 255])).toBe(0);
  });
});
