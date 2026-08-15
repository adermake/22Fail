import {
  defaultBrush,
  lakeOutline,
  paintPasses,
  parseHex,
  toolLayer,
  TERRAIN_TOOLS,
} from './brush-engine';
import { hexToRgb } from './terrain-view';

describe('terrain tools', () => {
  it('routes each tool to the raster it writes into', () => {
    // Height is one shared scalar field: land and water brushes are the same op with
    // opposite signs, so both must land on 'height' rather than on separate layers.
    expect(toolLayer('landBrush')).toBe('height');
    expect(toolLayer('landEraser')).toBe('height');
    expect(toolLayer('waterBrush')).toBe('height');
    expect(toolLayer('heighten')).toBe('height');
    expect(toolLayer('lower')).toBe('height');
    expect(toolLayer('lakeStamp')).toBe('height');

    expect(toolLayer('landPaint')).toBe('landColor');
    expect(toolLayer('waterPaint')).toBe('waterColor');
  });

  it('maps every declared tool to a valid layer', () => {
    for (const tool of TERRAIN_TOOLS) {
      expect(['height', 'landColor', 'waterColor']).toContain(toolLayer(tool));
    }
  });

  it('offers no water eraser', () => {
    // Height is one field, so "remove water" and "add land" are the same operation.
    // Shipping both invites the state that is neither: water gone, no land put back.
    expect(TERRAIN_TOOLS).not.toContain('waterEraser' as never);
  });

  it('starts on a land brush painting white, not a preset colour', () => {
    const b = defaultBrush();
    expect(b.tool).toBe('landBrush');
    expect(b.size).toBeGreaterThan(0);
    expect(b.strength).toBeGreaterThan(0);
    // Fresh land is blank paper to colour in.
    expect(b.color).toBe('#ffffff');
  });
});

describe('paint passes (colour baked at draw time)', () => {
  it('writes both height and land colour when drawing land', () => {
    // The whole point of baking: what you draw keeps the colour you drew it with, so no
    // later setting can retroactively repaint it.
    const passes = paintPasses('landBrush', 0x336699);
    expect(passes.map(p => p.layer)).toEqual(['height', 'landColor']);
    expect(passes[0].erase).toBe(false);
    expect(passes[1].tint).toBe(0x336699);
  });

  it('takes the colour away with the land when erasing', () => {
    const passes = paintPasses('landEraser', 0x336699);
    expect(passes.every(p => p.erase)).toBe(true);
    expect(passes.map(p => p.layer)).toEqual(['height', 'landColor']);
  });

  it('lowers height and colours water when drawing water', () => {
    const passes = paintPasses('waterBrush', 0x112233);
    expect(passes[0]).toEqual({ layer: 'height', erase: true, tint: 0xffffff });
    expect(passes[1]).toEqual({ layer: 'waterColor', erase: false, tint: 0x112233 });
  });

  it('reshapes the coastline without disturbing colour already laid down', () => {
    for (const tool of ['heighten', 'lower'] as const) {
      const passes = paintPasses(tool, 0x336699);
      expect(passes).toHaveLength(1);
      expect(passes[0].layer).toBe('height');
    }
  });

  it('always writes white into the height field', () => {
    // Height reads alpha only; a coloured tint there would be silently meaningless.
    for (const tool of TERRAIN_TOOLS) {
      for (const pass of paintPasses(tool, 0x336699)) {
        if (pass.layer === 'height') expect(pass.tint).toBe(0xffffff);
      }
    }
  });

  it('covers every tool', () => {
    for (const tool of TERRAIN_TOOLS) {
      expect(paintPasses(tool, 0xffffff).length).toBeGreaterThan(0);
    }
  });
});

describe('lake stamp geometry', () => {
  it('is deterministic for a seed, so the preview matches what gets stamped', () => {
    const a = lakeOutline(100, 200, 50, 12345);
    const b = lakeOutline(100, 200, 50, 12345);
    expect(a).toEqual(b);
  });

  it('produces a different shape for each seed', () => {
    const a = lakeOutline(0, 0, 50, 1);
    const b = lakeOutline(0, 0, 50, 2);
    expect(a).not.toEqual(b);
  });

  it('returns a closed ring of x,y pairs', () => {
    const pts = lakeOutline(0, 0, 50, 7);
    expect(pts.length % 2).toBe(0);
    expect(pts.length / 2).toBeGreaterThanOrEqual(24);
  });

  it('stays within the bounds the stamp dirties', () => {
    // stampLake dirties radius * 1.4; if the wobble could exceed that, a lake would be
    // clipped at the edge of the region actually painted.
    const r = 80;
    const pts = lakeOutline(0, 0, r, 4242);
    for (let i = 0; i < pts.length; i += 2) {
      expect(Math.hypot(pts[i], pts[i + 1])).toBeLessThanOrEqual(r * 1.4);
    }
  });

  it('translates with its centre', () => {
    const at0 = lakeOutline(0, 0, 30, 99);
    const at100 = lakeOutline(100, -50, 30, 99);
    for (let i = 0; i < at0.length; i += 2) {
      expect(at100[i]).toBeCloseTo(at0[i] + 100, 6);
      expect(at100[i + 1]).toBeCloseTo(at0[i + 1] - 50, 6);
    }
  });
});

describe('colour parsing', () => {
  it('parses hex colours for tinting', () => {
    expect(parseHex('#ff8000')).toBe(0xff8000);
    expect(parseHex('ff8000')).toBe(0xff8000);
    expect(parseHex('nonsense')).toBe(0xffffff);
  });

  it('normalises hex to shader RGB', () => {
    expect(hexToRgb('#ffffff', [0, 0, 0])).toEqual([1, 1, 1]);
    expect(hexToRgb('#000000', [1, 1, 1])).toEqual([0, 0, 0]);

    const [r, g, b] = hexToRgb('#8040c0', [0, 0, 0]);
    expect(r).toBeCloseTo(0x80 / 255, 5);
    expect(g).toBeCloseTo(0x40 / 255, 5);
    expect(b).toBeCloseTo(0xc0 / 255, 5);
  });

  it('falls back rather than producing NaN colours', () => {
    expect(hexToRgb('', [0.5, 0.5, 0.5])).toEqual([0.5, 0.5, 0.5]);
  });
});
