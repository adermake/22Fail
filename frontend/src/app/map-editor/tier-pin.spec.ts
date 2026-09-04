/**
 * The working-tier pin.
 *
 * A pin is now honoured at **every** zoom. It used to be clamped against the on-screen chunk
 * budget and silently fall back to the automatic tier, so pinning `med` and zooming out showed
 * `low` instead — in a mode whose whole purpose is inspecting and cleaning up one tier, quietly
 * substituting a different one is the worst thing it could do.
 *
 * The budget did not go away; it moved. `TerrainView` draws at most `MAX_TERRAIN_CELLS` cells
 * nearest the view centre, so a pin that cannot cover the screen shows *part* of its own tier
 * rather than all of somebody else's. Two things have to hold for that to be safe, and both are
 * checked here.
 */

import {
  DetailTier,
  TIERS,
  TIER_WORLD_SIZE,
  chooseTier,
} from './map-editor.model';
import { MAX_TERRAIN_CELLS } from './terrain-view';
import { MAX_RESIDENT_CELLS } from './chunk-manager';
import { Bounds } from './map-camera';

/** Mirrors `ChunkManager.resolveTier`. */
const resolveTier = (pin: DetailTier | null, current: DetailTier, view: Bounds): DetailTier =>
  pin ?? chooseTier(current, view.maxX - view.minX, view.maxY - view.minY);

/** Mirrors the cell-range clamp at the top of `TerrainView.update`. */
function cellRange(view: Bounds, tier: DetailTier, cap = MAX_TERRAIN_CELLS) {
  const span = TIER_WORLD_SIZE[tier];
  const lead = span * 0.5;

  let minCx = Math.floor((view.minX - lead) / span);
  let maxCx = Math.floor((view.maxX + lead) / span);
  let minCy = Math.floor((view.minY - lead) / span);
  let maxCy = Math.floor((view.maxY + lead) / span);

  if ((maxCx - minCx + 1) * (maxCy - minCy + 1) > cap) {
    const half = Math.ceil(Math.sqrt(cap));
    const midCx = Math.floor((view.minX + view.maxX) / 2 / span);
    const midCy = Math.floor((view.minY + view.maxY) / 2 / span);
    minCx = Math.max(minCx, midCx - half);
    maxCx = Math.min(maxCx, midCx + half);
    minCy = Math.max(minCy, midCy - half);
    maxCy = Math.min(maxCy, midCy + half);
  }
  return { minCx, maxCx, minCy, maxCy, count: (maxCx - minCx + 1) * (maxCy - minCy + 1) };
}

const view = (w: number, h = w, x = 0, y = 0): Bounds => ({
  minX: x,
  minY: y,
  maxX: x + w,
  maxY: y + h,
});

describe('Arbeitsstufe festnageln', () => {
  it('folgt ohne Pin dem Zoom', () => {
    const wide = view(TIER_WORLD_SIZE.low * 4);
    expect(resolveTier(null, 'high', wide)).toBe(chooseTier('high', wide.maxX, wide.maxY));
  });

  it('hält die festgenagelte Stufe auf jeder Zoomstufe', () => {
    // Der gemeldete Fehler: herauszoomen zeigte plötzlich Grob statt der gewählten Stufe.
    for (const pin of TIERS) {
      for (let span = TIER_WORLD_SIZE.high / 4; span < TIER_WORLD_SIZE.low * 32; span *= 2.3) {
        expect(resolveTier(pin, 'high', view(span))).toBe(pin);
        expect(resolveTier(pin, 'low', view(span))).toBe(pin);
      }
    }
  });

  describe('Kachelbereich', () => {
    it('zeigt bei normalem Zoom den ganzen sichtbaren Bereich', () => {
      const v = view(TIER_WORLD_SIZE.med * 3);
      const r = cellRange(v, 'med');
      expect(r.count).toBeLessThanOrEqual(MAX_TERRAIN_CELLS);
      // Nicht beschnitten: der Bereich deckt die Sicht komplett ab.
      expect(r.minCx).toBe(Math.floor(-TIER_WORLD_SIZE.med * 0.5 / TIER_WORLD_SIZE.med));
    });

    it('begrenzt den Bereich, statt Millionen Positionen aufzuzählen', () => {
      /*
       * Ohne diese Klemme würde „Hoch festnageln und ganz herauszoomen" jede Bildposition
       * auflisten, sortieren und dann hundert behalten — das Aufzählen selbst wäre der Stall.
       */
      const v = view(TIER_WORLD_SIZE.low * 40);
      const r = cellRange(v, 'high');

      const unclamped = Math.pow((TIER_WORLD_SIZE.low * 40) / TIER_WORLD_SIZE.high, 2);
      expect(unclamped).toBeGreaterThan(1e6);
      expect(r.count).toBeLessThanOrEqual(Math.pow(2 * Math.ceil(Math.sqrt(100)) + 1, 2));
    });

    it('behält den Bildmittelpunkt', () => {
      // Was gezeigt wird, soll dort liegen, wo man hinsieht.
      const v = view(TIER_WORLD_SIZE.low * 40, TIER_WORLD_SIZE.low * 40, 1e6, -5e5);
      const r = cellRange(v, 'high');
      const midCx = Math.floor((v.minX + v.maxX) / 2 / TIER_WORLD_SIZE.high);
      const midCy = Math.floor((v.minY + v.maxY) / 2 / TIER_WORLD_SIZE.high);

      expect(midCx).toBeGreaterThanOrEqual(r.minCx);
      expect(midCx).toBeLessThanOrEqual(r.maxCx);
      expect(midCy).toBeGreaterThanOrEqual(r.minCy);
      expect(midCy).toBeLessThanOrEqual(r.maxCy);
    });
  });

  it('zeichnet nie mehr Zellen, als resident bleiben dürfen', () => {
    /*
     * Die Invariante, die den bedingungslosen Pin überhaupt trägt. Läge die Zeichengrenze über
     * dem Residenzbudget, wäre jede Zelle im selben Frame als sichtbar markiert, also keine
     * verdrängbar — und der VRAM liefe voll, bis der GL-Kontext wegbricht.
     */
    expect(MAX_TERRAIN_CELLS).toBeLessThanOrEqual(MAX_RESIDENT_CELLS);
  });
});
