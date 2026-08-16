import {
  HEX_RADIUS,
  HEX_WIDTH,
  HEX_X_SPACING,
  HEX_Y_SPACING,
  hexDistance,
  hexToWorld,
  hexesInRadius,
  hexRangeForBounds,
  parseHexKey,
  hexKey,
  worldToHex,
} from './map-hex';
import {
  CHUNK_WORLD_SIZE,
  LAYER_TEXELS,
  tileWorldSize,
  worldToTile,
  chunkKey,
  layerScale,
  parseChunkKey,
  worldToChunk,
} from './map-editor.model';

describe('global hex grid', () => {
  it('round-trips a hex through world space', () => {
    for (const [q, r] of [
      [0, 0],
      [1, 0],
      [5, 3],
      [-4, 7],
      [-9, -2],
      [13, -6],
    ] as const) {
      const w = hexToWorld({ q, r });
      const back = worldToHex(w.x, w.y);
      expect(`${back.q},${back.r}`).toBe(`${q},${r}`);
    }
  });

  it('keeps odd columns staggered by half a row', () => {
    expect(hexToWorld({ q: 0, r: 0 })).toEqual({ x: 0, y: 0 });
    expect(hexToWorld({ q: 1, r: 0 })).toEqual({ x: HEX_X_SPACING, y: HEX_Y_SPACING / 2 });
    expect(hexToWorld({ q: 2, r: 0 })).toEqual({ x: 2 * HEX_X_SPACING, y: 0 });
  });

  it('resolves points near a shared edge to the correct hex', () => {
    // The failure mode of v1's rectangular rounding: points just inside a neighbour's
    // territory got attributed to the wrong hex, which would misplace fog and hit-tests.
    const centre = hexToWorld({ q: 4, r: 4 });
    const right = hexToWorld({ q: 5, r: 4 });
    const midpoint = { x: (centre.x + right.x) / 2, y: (centre.y + right.y) / 2 };

    const justLeft = worldToHex(midpoint.x - 2, midpoint.y);
    const justRight = worldToHex(midpoint.x + 2, midpoint.y);

    expect(hexKey(justLeft.q, justLeft.r)).toBe('4,4');
    expect(hexKey(justRight.q, justRight.r)).toBe('5,4');
  });

  it('every point in a hex maps back to that hex', () => {
    const target = { q: 3, r: -2 };
    const c = hexToWorld(target);
    // Sample well inside the inradius, which for a flat-top hex is (√3/2)·R.
    const inradius = (Math.sqrt(3) / 2) * HEX_RADIUS;
    for (let a = 0; a < 12; a++) {
      const angle = (Math.PI / 6) * a;
      const p = {
        x: c.x + Math.cos(angle) * inradius * 0.9,
        y: c.y + Math.sin(angle) * inradius * 0.9,
      };
      const got = worldToHex(p.x, p.y);
      expect(hexKey(got.q, got.r)).toBe(hexKey(target.q, target.r));
    }
  });

  it('measures distance in hex steps, not offset-coordinate steps', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);
    expect(hexDistance({ q: 0, r: 0 }, { q: 1, r: 0 })).toBe(1);
    expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 1 })).toBe(1);
    // Straight line of three columns is three steps, despite the odd/even row skew.
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: 1 })).toBe(3);
  });

  it('builds radius discs with the hex-count formula 3r(r+1)+1', () => {
    for (const radius of [0, 1, 2, 3, 4]) {
      const expected = radius === 0 ? 1 : 3 * radius * (radius + 1) + 1;
      expect(hexesInRadius(7, -3, radius).length).toBe(expected);
    }
  });

  it('produces discs that are symmetric around the centre', () => {
    const disc = hexesInRadius(0, 0, 3);
    for (const h of disc) expect(hexDistance({ q: 0, r: 0 }, h)).toBeLessThanOrEqual(3);
  });

  it('covers a world rectangle with its hex range', () => {
    const range = hexRangeForBounds(-500, -500, 500, 500);
    for (let x = -500; x <= 500; x += 37) {
      for (let y = -500; y <= 500; y += 37) {
        const h = worldToHex(x, y);
        expect(h.q).toBeGreaterThanOrEqual(range.minQ);
        expect(h.q).toBeLessThanOrEqual(range.maxQ);
        expect(h.r).toBeGreaterThanOrEqual(range.minR);
        expect(h.r).toBeLessThanOrEqual(range.maxR);
      }
    }
  });

  it('round-trips hex keys', () => {
    expect(parseHexKey(hexKey(-4, 12))).toEqual({ q: -4, r: 12 });
    expect(parseHexKey('nope')).toBeNull();
  });
});

describe('chunk coordinates', () => {
  it('floors toward negative infinity so negative chunks are not off by one', () => {
    expect(worldToChunk(0, 0)).toEqual({ cx: 0, cy: 0 });
    expect(worldToChunk(CHUNK_WORLD_SIZE - 1, 0)).toEqual({ cx: 0, cy: 0 });
    expect(worldToChunk(CHUNK_WORLD_SIZE, 0)).toEqual({ cx: 1, cy: 0 });
    // Truncation instead of flooring would put this in chunk 0 alongside +1.
    expect(worldToChunk(-1, -1)).toEqual({ cx: -1, cy: -1 });
    expect(worldToChunk(-CHUNK_WORLD_SIZE, 0)).toEqual({ cx: -1, cy: 0 });
  });

  it('round-trips chunk keys including negatives', () => {
    expect(parseChunkKey(chunkKey('height', -3, 5))).toEqual({
      layer: 'height',
      cx: -3,
      cy: 5,
    });
    expect(parseChunkKey('bogus/1/2')).toBeNull();
  });

  it('keeps every layer on one chunk grid', () => {
    // Layers differ in texel density but must cover the same world square, or dirty
    // tracking and eviction could not share a single cx,cy.
    for (const layer of ['height', 'landColor', 'waterColor'] as const) {
      expect(layerScale(layer) * LAYER_TEXELS[layer]).toBe(CHUNK_WORLD_SIZE);
    }
  });
});

describe('map working scale', () => {
  it('gives a hex enough texels to draw inside', () => {
    // The reason fine brushwork was impossible: at HEX_RADIUS 30 a hex spanned 60 world px,
    // which is ~15 texels at any affordable chunk density — no stroke finer than a blob
    // could survive. This pins the scale that makes detail possible.
    const worldPxPerTexel = CHUNK_WORLD_SIZE / LAYER_TEXELS.height;
    const texelsAcrossAHex = HEX_WIDTH / worldPxPerTexel;
    expect(texelsAcrossAHex).toBeGreaterThanOrEqual(200);
  });

  it('keeps a chunk affordable', () => {
    // 1 MB per layer. Density comes from smaller chunks, never bigger textures — a 1024²
    // layer is what exhausted the GPU and lost the WebGL context mid-stroke.
    for (const texels of Object.values(LAYER_TEXELS)) {
      expect(texels * texels * 4).toBeLessThanOrEqual(1024 * 1024);
    }
  });
});

describe('tile pyramid', () => {
  it('quadruples the area each level', () => {
    for (let l = 0; l < 8; l++) {
      expect(tileWorldSize(l + 1)).toBe(tileWorldSize(l) * 2);
    }
    expect(tileWorldSize(0)).toBe(CHUNK_WORLD_SIZE);
  });

  it('keeps tiles-per-screen near constant at every zoom', () => {
    /*
     * This is the property the whole pyramid exists for. The previous two-level scheme
     * needed 88 tiles at 25% zoom and over 5000 at 2%, which is why far zoom kept breaking
     * however the budgets were tuned. Here the count must stay bounded from a close-up to a
     * thousand-hex overview.
     */
    const TARGET = 64;
    const pick = (w: number, h: number) => {
      for (let level = 0; level < 11; level++) {
        const span = tileWorldSize(level);
        const n = (Math.ceil(w / span) + 1) * (Math.ceil(h / span) + 1);
        if (n <= TARGET) return { level, n };
      }
      return { level: 11, n: 0 };
    };

    for (const zoom of [1, 0.5, 0.25, 0.1, 0.04, 0.02, 0.005, 0.001]) {
      const { n } = pick(1920 / zoom, 1080 / zoom);
      expect(n).toBeLessThanOrEqual(TARGET);
      expect(n).toBeGreaterThan(4);
    }
  });

  it('maps a world point to the containing tile at any level', () => {
    // Floor division, so a point just left of the origin belongs to tile -1, not 0.
    expect(worldToTile(0, 0, 0)).toEqual({ cx: 0, cy: 0 });
    expect(worldToTile(-1, -1, 0)).toEqual({ cx: -1, cy: -1 });
    expect(worldToTile(CHUNK_WORLD_SIZE * 3, 0, 1)).toEqual({ cx: 1, cy: 0 });
    expect(worldToTile(CHUNK_WORLD_SIZE * 3, 0, 2)).toEqual({ cx: 0, cy: 0 });
  });

  it('nests tiles: a point stays inside its parent at every level', () => {
    const x = 12345.6;
    const y = -98765.4;
    for (let level = 0; level < 10; level++) {
      const child = worldToTile(x, y, level);
      const parent = worldToTile(x, y, level + 1);
      // Halving a child's coordinates must land on its parent, negatives included.
      expect({ cx: Math.floor(child.cx / 2), cy: Math.floor(child.cy / 2) }).toEqual(parent);
    }
  });
});
