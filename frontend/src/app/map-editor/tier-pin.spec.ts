/**
 * The working-tier pin, as arithmetic.
 *
 * `ChunkManager.resolveTier` needs a GPU, but the rule it applies does not: a pin is honoured
 * only while the tier fits the same on-screen chunk budget the automatic chooser respects.
 * That clamp is the difference between a useful control and a way to lose the WebGL context,
 * so it is worth pinning down without a renderer.
 */

import {
  DetailTier,
  TARGET_CHUNKS_ON_SCREEN,
  TIERS,
  TIER_WORLD_SIZE,
  chooseTier,
  chunksOnScreen,
} from './map-editor.model';
import { Bounds } from './map-camera';

/** Mirrors `ChunkManager.resolveTier`, hysteresis included. */
function resolveTier(
  current: DetailTier,
  pin: DetailTier | null,
  view: Bounds,
  pinFresh = false,
): DetailTier {
  const w = view.maxX - view.minX;
  const h = view.maxY - view.minY;
  const auto = chooseTier(current, w, h);
  if (!pin) return auto;

  const holding = current === pin;
  const budget =
    holding || pinFresh ? TARGET_CHUNKS_ON_SCREEN : TARGET_CHUNKS_ON_SCREEN * 0.6;
  return chunksOnScreen(w, h, pin) > budget ? auto : pin;
}

const view = (w: number, h = w): Bounds => ({ minX: 0, minY: 0, maxX: w, maxY: h });

describe('Arbeitsstufe festnageln', () => {
  it('folgt ohne Pin dem Zoom', () => {
    const wide = view(TIER_WORLD_SIZE.low * 4);
    expect(resolveTier('high', null, wide)).toBe(chooseTier('high', wide.maxX, wide.maxY));
  });

  it('erzwingt eine gröbere Stufe, als der Zoom wählen würde', () => {
    // Eng herangezoomt: automatisch wäre das `high`, festgenagelt bleibt es `low`.
    const close = view(TIER_WORLD_SIZE.high);
    expect(chooseTier('high', close.maxX, close.maxY)).toBe('high');
    expect(resolveTier('high', 'low', close)).toBe('low');
  });

  it('erlaubt eine feinere Stufe, solange sie auf den Schirm passt', () => {
    const close = view(TIER_WORLD_SIZE.high * 2);
    expect(resolveTier('low', 'high', close)).toBe('high');
  });

  it('ignoriert den Pin, wenn die Stufe zu viele Kacheln bedeutete', () => {
    // Eine Weltansicht auf `high` wären Zehntausende 3-MB-Zellen — genau der Zusammenbruch,
    // gegen den es die Stufen überhaupt gibt.
    const worldView = view(TIER_WORLD_SIZE.low * 8);
    expect(resolveTier('low', 'high', worldView)).not.toBe('high');
    expect(resolveTier('low', 'high', worldView)).toBe(
      chooseTier('low', worldView.maxX, worldView.maxY),
    );
  });

  /*
   * Die eigentliche Zusicherung ist nicht „immer im Budget“ — `chooseTier` gibt am Ende
   * bedingungslos `low` zurück, weil es keine gröbere Stufe gibt, und reißt das Budget beim
   * Herauszoomen ins Extreme selbst. Zugesichert ist, dass ein Pin die Lage nie *verschlimmert*:
   * er kann nie mehr Kacheln kosten, als die automatische Wahl ohnehin gekostet hätte.
   */
  it('kostet nie mehr Kacheln als die automatische Wahl', () => {
    for (const pin of TIERS) {
      for (let span = TIER_WORLD_SIZE.high / 4; span < TIER_WORLD_SIZE.low * 16; span *= 1.7) {
        const v = view(span);
        const auto = chooseTier(pin, v.maxX, v.maxY);
        const pinned = resolveTier(pin, pin, v);

        expect(chunksOnScreen(v.maxX, v.maxY, pinned)).toBeLessThanOrEqual(
          Math.max(chunksOnScreen(v.maxX, v.maxY, auto), TARGET_CHUNKS_ON_SCREEN),
        );
      }
    }
  });

  /*
   * Der Grund für die Hysterese, und der gemeldete Fehler.
   *
   * Ohne Totband kippt eine festgenagelte Stufe dicht an der Budgetgrenze bei jeder
   * Mausrad-Raste hin und her. Beim automatischen Wähler kostet das nur Neuaufbauten; bei
   * einer festgenagelten Stufe entscheidet sie, *was isoliert gezeichnet* und *worauf gemalt*
   * wird — das Bild springt also zwischen zwei Stufen, was aussieht wie Terrain, das von
   * selbst auftaucht und verschwindet.
   */
  describe('Hysterese', () => {
    /** Kleinste Ansichtsbreite, bei der `pin` das Budget gerade reißt. */
    const thresholdWidth = (pin: DetailTier): number => {
      let w = TIER_WORLD_SIZE[pin];
      while (chunksOnScreen(w, w, pin) <= TARGET_CHUNKS_ON_SCREEN) w *= 1.02;
      return w;
    };

    it('kippt an der Grenze nicht hin und her', () => {
      const pin: DetailTier = 'med';
      const edge = thresholdWidth(pin);

      // Um die Grenze herum wackeln, wie es ein Mausrad tut.
      let current: DetailTier = pin;
      const seen = new Set<DetailTier>();
      for (let i = 0; i < 40; i++) {
        const w = edge * (i % 2 === 0 ? 0.995 : 1.005);
        current = resolveTier(current, pin, view(w));
        seen.add(current);
      }

      // Genau eine Stufe über den ganzen Schwung — kein Flackern zwischen zweien.
      expect(seen.size).toBe(1);
    });

    it('gibt die Stufe erst auf, wenn sie wirklich nicht mehr passt', () => {
      const pin: DetailTier = 'med';
      const edge = thresholdWidth(pin);

      expect(resolveTier(pin, pin, view(edge * 0.98))).toBe(pin);
      expect(resolveTier(pin, pin, view(edge * 1.6))).not.toBe(pin);
    });

    it('nimmt sie erst mit Luft nach oben zurück', () => {
      const pin: DetailTier = 'med';
      const edge = thresholdWidth(pin);

      // Knapp unter der Grenze, aber ohne Reserve: noch nicht zurücknehmen …
      expect(resolveTier('low', pin, view(edge * 0.95))).toBe('low');
      // … eng genug herangezoomt dagegen schon.
      expect(resolveTier('low', pin, view(TIER_WORLD_SIZE[pin] * 2))).toBe(pin);
    });

    it('greift eine frisch gewählte Stufe sofort, wenn sie ins Budget passt', () => {
      const pin: DetailTier = 'med';
      const edge = thresholdWidth(pin);

      // Ohne diese Ausnahme täte ein Klick auf eine gerade noch passende Stufe scheinbar nichts.
      expect(resolveTier('low', pin, view(edge * 0.95), true)).toBe(pin);
    });
  });
});
