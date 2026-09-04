/**
 * The tier composite, as arithmetic.
 *
 * The operator lives in GLSL and cannot be unit-tested, but the algebra it implements can —
 * and it is the algebra that was wrong. Pixi renders into a RenderTexture with
 * normal = [ONE, ONE_MINUS_SRC_ALPHA], the *premultiplied* over operator, so a stored texel's
 * RGB is already colour x coverage. The shader treated it as a straight colour and weighted
 * it by alpha a second time, which darkened every partially-covered texel: the feathered edge
 * of a soft brush stroke came out as a dark band rather than a blend, on land and on water.
 *
 * These cases mirror `over()` and the base-colour composite in `terrain-view.ts`. If either
 * is ever "simplified" back to a straight-alpha mix, the dark fringe returns.
 */

type RGBA = { r: number; g: number; b: number; a: number };

const clear: RGBA = { r: 0, g: 0, b: 0, a: 0 };

/** A colour with coverage, stored the way the GPU actually holds it. */
const premultiplied = (r: number, g: number, b: number, a: number): RGBA => ({
  r: r * a,
  g: g * a,
  b: b * a,
  a,
});

/** Mirrors `over()` — premultiplied in, premultiplied out. */
const over = (under: RGBA, top: RGBA): RGBA => ({
  r: top.r + under.r * (1 - top.a),
  g: top.g + under.g * (1 - top.a),
  b: top.b + under.b * (1 - top.a),
  a: top.a + under.a * (1 - top.a),
});

/** Mirrors the land/water resolve against the base colour. */
const onBase = (base: number, layer: RGBA, channel: 'r' | 'g' | 'b'): number =>
  base * (1 - layer.a) + layer[channel];

/** The old, wrong version: treats premultiplied RGB as a straight colour. */
const onBaseStraight = (base: number, layer: RGBA, channel: 'r' | 'g' | 'b'): number =>
  base * (1 - layer.a) + layer[channel] * layer.a;

describe('Terrain-Komposit (vormultipliziert)', () => {
  describe('over()', () => {
    it('lässt eine leere Stufe die darunter unverändert durch', () => {
      const under = premultiplied(0.4, 0.6, 0.3, 1);
      expect(over(under, clear)).toEqual(under);
    });

    it('lässt eine volle Stufe die darunter vollständig verdecken', () => {
      const top = premultiplied(0.2, 0.8, 0.1, 1);
      expect(over(premultiplied(0.9, 0.1, 0.1, 1), top)).toEqual(top);
    });

    it('ist assoziativ, damit drei Stufen wie zwei zusammengefasste aussehen', () => {
      const low = premultiplied(0.8, 0.2, 0.2, 1);
      const med = premultiplied(0.2, 0.8, 0.2, 0.5);
      const high = premultiplied(0.2, 0.2, 0.8, 0.25);

      const leftFirst = over(over(low, med), high);
      const rightFirst = over(low, over(med, high));

      for (const k of ['r', 'g', 'b', 'a'] as const) {
        expect(leftFirst[k]).toBeCloseTo(rightFirst[k], 10);
      }
    });

    it('hält das Ergebnis vormultipliziert (RGB nie heller als Alpha)', () => {
      // Genau die Invariante, die das doppelte Multiplizieren verletzte.
      const result = over(premultiplied(1, 1, 1, 0.4), premultiplied(1, 1, 1, 0.4));
      expect(result.r).toBeLessThanOrEqual(result.a + 1e-9);
    });
  });

  describe('Grundfarbe', () => {
    const base = 0.9; // helles Pergament
    const paint = 0.6; // mittelheller Anstrich

    it('zeigt bei voller Deckung genau die Farbe', () => {
      expect(onBase(base, premultiplied(paint, paint, paint, 1), 'r')).toBeCloseTo(paint, 10);
    });

    it('zeigt ohne Deckung genau die Grundfarbe', () => {
      expect(onBase(base, clear, 'r')).toBeCloseTo(base, 10);
    });

    it('blendet bei halber Deckung linear zwischen beiden', () => {
      const half = onBase(base, premultiplied(paint, paint, paint, 0.5), 'r');
      expect(half).toBeCloseTo((base + paint) / 2, 10);
    });

    it('wird zur Mitte des Verlaufs nicht dunkler als beide Enden', () => {
      // Der gemeldete Fehler: der weiche Rand war dunkler als Grundfarbe *und* Anstrich.
      for (let a = 0; a <= 1.0001; a += 0.05) {
        const v = onBase(base, premultiplied(paint, paint, paint, a), 'r');
        expect(v).toBeGreaterThanOrEqual(Math.min(base, paint) - 1e-9);
        expect(v).toBeLessThanOrEqual(Math.max(base, paint) + 1e-9);
      }
    });

    it('die alte Rechnung verdunkelte jede Teildeckung', () => {
      /*
       * Die genaue Aussage, und zugleich der gemeldete Fehler: die alte Rechnung setzte
       * paint*a*a statt paint*a an, liegt also um paint*a*(1-a) zu tief. Das ist überall
       * dazwischen echt dunkler und nur an den Enden gleich — ein dunkler Streifen genau dort,
       * wo ein weicher Pinsel verläuft.
       */
      for (let a = 0.05; a < 1; a += 0.05) {
        const layer = premultiplied(paint, paint, paint, a);
        const wrong = onBaseStraight(base, layer, 'r');
        const right = onBase(base, layer, 'r');
        expect(wrong).toBeLessThan(right);
        expect(right - wrong).toBeCloseTo(paint * a * (1 - a), 10);
      }

      // An den Enden stimmten beide überein — deshalb sah nur der Verlauf falsch aus.
      for (const a of [0, 1]) {
        const layer = premultiplied(paint, paint, paint, a);
        expect(onBaseStraight(base, layer, 'r')).toBeCloseTo(onBase(base, layer, 'r'), 10);
      }
    });
  });
});
