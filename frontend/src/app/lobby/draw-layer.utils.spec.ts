import { describe, expect, it } from 'vitest';
import { bitmapChunkRects, isOversizedBitmap } from './draw-layer.utils';
import { DrawBitmap } from '../model/lobby.model';

const bmp = (width: number, height: number): DrawBitmap => ({
  id: 'b',
  layerId: 'l',
  x: 0,
  y: 0,
  width,
  height,
  dataUrl: '',
});

describe('Zeichnungs-Bitmaps aufteilen', () => {
  it('teilt nur Bitmaps über der Schwelle', () => {
    expect(isOversizedBitmap(bmp(2048, 2048))).toBe(false);
    expect(isOversizedBitmap(bmp(2049, 10))).toBe(true);
    expect(isOversizedBitmap(bmp(10, 16537))).toBe(true);
  });

  it('deckt jedes Pixel ab, mit 1 px Überlappung zum Nachbarn', () => {
    const rects = bitmapChunkRects(2500, 1100, 1024);
    expect(rects.length).toBe(3 * 2);
    // Every source pixel lies in at least one rect, none reach outside the image
    for (const r of rects) {
      expect(r.sx + r.sw).toBeLessThanOrEqual(2500);
      expect(r.sy + r.sh).toBeLessThanOrEqual(1100);
    }
    const covered = (x: number, y: number) =>
      rects.some(r => x >= r.sx && x < r.sx + r.sw && y >= r.sy && y < r.sy + r.sh);
    for (const [x, y] of [[0, 0], [1023, 1023], [1024, 1024], [2499, 1099], [2048, 0]]) {
      expect(covered(x, y)).toBe(true);
    }
    expect(rects[0]).toEqual({ sx: 0, sy: 0, sw: 1025, sh: 1025 });
    expect(rects[2]).toEqual({ sx: 2048, sy: 0, sw: 452, sh: 1025 });
  });

  it('der echte Riesenfall ergibt handliche Stücke', () => {
    const rects = bitmapChunkRects(16537, 14199);
    expect(rects.length).toBe(17 * 14);
    expect(Math.max(...rects.map(r => Math.max(r.sw, r.sh)))).toBe(1025);
  });
});
