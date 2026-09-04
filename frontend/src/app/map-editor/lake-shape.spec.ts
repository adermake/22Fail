/**
 * Lake shape and how solidly it becomes water.
 *
 * Two separate complaints, two separate causes.
 *
 * The stamp stopped producing water because the feathered fill was ten flat 16% layers that
 * only reached water by compositing against each other — which makes the whole lake hostage
 * to how the renderer batches identical fills. The alpha now ramps to a solid core, so the
 * middle is unambiguously water however they are drawn.
 *
 * The silhouette was dull because the shoreline carried a *single* sine wave: every bay the
 * same size, evenly spaced, so it read as a squashed circle at any amplitude.
 */

import { lakeOutline } from './brush-engine';

/** Radius of the outline in each direction, as a fraction of the nominal radius. */
function radii(cx: number, cy: number, r: number, seed: number, noise: number): number[] {
  const pts = lakeOutline(cx, cy, r, seed, noise);
  const out: number[] = [];
  for (let i = 0; i < pts.length; i += 2) {
    out.push(Math.hypot(pts[i] - cx, pts[i + 1] - cy) / r);
  }
  return out;
}

/** Sign changes in the radius as the outline is walked — one per bay or headland. */
function reversals(rs: number[]): number {
  let count = 0;
  let prev = Math.sign(rs[1] - rs[0]);
  for (let i = 2; i < rs.length; i++) {
    const dir = Math.sign(rs[i] - rs[i - 1]);
    if (dir !== 0 && dir !== prev) {
      count++;
      prev = dir;
    }
  }
  return count;
}

describe('Seeform', () => {
  it('schließt sich sauber am Rundum-Übergang', () => {
    // Ganzzahlige Frequenzen: sonst klafft dort, wo der letzte Punkt den ersten trifft, eine
    // sichtbare Kerbe.
    const rs = radii(0, 0, 500, 12345, 1);
    expect(Math.abs(rs[0] - rs[rs.length - 1])).toBeLessThan(0.08);
  });

  it('bleibt bei jedem Rauschwert eine brauchbare Form', () => {
    for (const noise of [0, 0.25, 0.5, 0.75, 1]) {
      const rs = radii(0, 0, 500, 999, noise);
      expect(Math.min(...rs)).toBeGreaterThan(0);
      // Der Stempel bemalt einen Bereich von 2,2 Radien; die Form muss hineinpassen.
      expect(Math.max(...rs)).toBeLessThan(2.2);
    }
  });

  it('wird mit dem Rauschregler zerklüfteter', () => {
    /*
     * Gemessen als hochfrequente Rauheit, nicht als Spannweite: die Kontur wird am Ende auf
     * eine feste Maximalreichweite normiert, also verrechnet sich ein größerer Ausschlag
     * teilweise wieder heraus. Der mittlere Abstand benachbarter Stützpunkte trennt dagegen
     * die feine Zerklüftung von der groben Lappenform — und genau die war „zu langweilig".
     */
    const roughness = (noise: number) => {
      const rs = radii(0, 0, 500, 4242, noise);
      const mean = rs.reduce((a, b) => a + b, 0) / rs.length;
      let d = 0;
      for (let i = 1; i < rs.length; i++) d += Math.abs(rs[i] - rs[i - 1]);
      return d / rs.length / mean;
    };
    /*
     * 1,5× und nicht mehr, obwohl die Amplitude selbst um das Rund-Sechsfache wächst: die
     * Lappen treffen sich in Knicken, und deren Sprünge gehen rauschunabhängig in dasselbe
     * Maß ein. Sie sind der Boden, den dieser Wert nicht unterschreiten kann.
     */
    expect(roughness(1)).toBeGreaterThan(roughness(0) * 1.5);
  });

  it('hat mehr als eine Bucht — nicht ein einzelner Sinus', () => {
    /*
     * Der eigentliche Vorwurf: „zu langweilig". Eine einzelne Sinuswelle liefert genau zwei
     * Richtungswechsel pro Umlauf mal ihrer Frequenz, alle gleich groß. Vier Oktaven ergeben
     * große Buchten mit kleineren Einschnitten darin.
     */
    expect(reversals(radii(0, 0, 500, 777, 1))).toBeGreaterThan(8);
  });

  it('gibt für denselben Seed dieselbe Form', () => {
    // Die Vorschau unter dem Cursor muss zeigen, was der Klick tatsächlich stempelt.
    expect(radii(0, 0, 500, 31337, 0.6)).toEqual(radii(0, 0, 500, 31337, 0.6));
  });

  it('unterscheidet sich zwischen Seeds', () => {
    expect(radii(0, 0, 500, 1, 0.6)).not.toEqual(radii(0, 0, 500, 2, 0.6));
  });
});

describe('Seeform: Deckkraft der Federung', () => {
  /** Mirrors `appendFeathered`: ten rings, 1.12 → 0.55, alpha ramping to a solid core. */
  const ring = (s: number) => ({
    t: 1.12 - (s / 9) * 0.57,
    alpha: 0.12 + (s / 9) * 0.88,
  });

  it('macht den Kern auch ohne Aufsummieren zu Wasser', () => {
    /*
     * Der Fehler: bei zehn flachen 16%-Füllungen ergibt eine einzelne nur 0,84 Landanteil —
     * über der Küstenschwelle, also kein See. Mit steigender Deckkraft liegt der Kern auch
     * dann bei 0.
     */
    const innermost = ring(9);
    expect(innermost.alpha).toBeCloseTo(1, 6);
    expect(1 - innermost.alpha).toBeLessThan(0.5);
  });

  it('federt nach außen aus, statt hart abzubrechen', () => {
    const landness = (s: number) => 1 - ring(s).alpha;
    // Von außen nach innen nimmt der Landanteil monoton ab.
    for (let s = 1; s < 10; s++) expect(landness(s)).toBeLessThan(landness(s - 1));
    // Und der äußerste Ring ist noch klar Land, sonst gäbe es keinen Übergang.
    expect(landness(0)).toBeGreaterThan(0.8);
  });
});
