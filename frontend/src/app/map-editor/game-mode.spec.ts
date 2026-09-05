/**
 * Game mode: fog, sketch strokes and tokens.
 *
 * The parts worth pinning are the ones with a consequence at the table. Fog decides what the
 * party can see, so a delta that applies in the wrong order shows them ground they should not
 * have. A sketch is the one thing a *player* writes to the document, so its shape has to be
 * exactly what the server's whitelist expects, or the line silently never appears.
 */

import { describe, expect, it } from 'vitest';
import {
  MapEditorData,
  MapOp,
  applyMapOp,
  createEmptyMapEditorData,
} from './map-editor.model';
import { hexKey, hexesInRadius, hexToWorld, worldToHex } from './map-hex';
import { dashSegments, measureKm } from './play-aids';
import { fogNeedsRedraw, paddedBounds } from './fog-view';
import { HEX_HEIGHT, HEX_X_SPACING, KM_PER_HEX, worldToKm } from './map-hex';

/** Ops travel as JSON, so tests apply them the way the socket delivers them. */
function run(data: MapEditorData, ops: MapOp[]): void {
  for (const op of ops) applyMapOp(data, JSON.parse(JSON.stringify(op)) as MapOp);
}

describe('Nebel', () => {
  it('deckt auf und wieder zu', () => {
    const data = createEmptyMapEditorData('Testwelt');

    run(data, [{ t: 'fog', add: ['0,0', '1,0'] }]);
    expect(data.fog.revealed.sort()).toEqual(['0,0', '1,0']);

    run(data, [{ t: 'fog', remove: ['0,0'] }]);
    expect(data.fog.revealed).toEqual(['1,0']);
  });

  it('speichert ein doppelt aufgedecktes Hex nur einmal', () => {
    const data = createEmptyMapEditorData('Testwelt');
    // A fog brush drags over the same hexes constantly; without the Set the revealed list
    // would grow without bound over a session and be shipped in full on every load.
    run(data, [{ t: 'fog', add: ['2,2'] }, { t: 'fog', add: ['2,2'] }]);
    expect(data.fog.revealed).toEqual(['2,2']);
  });

  it('deckt im selben Op nach dem Verdecken auf', () => {
    const data = createEmptyMapEditorData('Testwelt');
    run(data, [{ t: 'fog', add: ['3,3'], remove: ['3,3'] }]);
    // Order is fixed rather than payload-dependent, so one brush dab that both covers and
    // reveals a hex always ends the way the last gesture meant.
    expect(data.fog.revealed).toEqual(['3,3']);
  });

  it('lässt einen leeren Delta das Dokument unverändert', () => {
    const data = createEmptyMapEditorData('Testwelt');
    run(data, [{ t: 'fog', add: ['1,1'] }, { t: 'fog' }]);
    expect(data.fog.revealed).toEqual(['1,1']);
  });
});

describe('Nebelpinsel', () => {
  it('deckt bei Radius 0 genau ein Hex auf', () => {
    expect(hexesInRadius(0, 0, 0).map(h => hexKey(h.q, h.r))).toEqual(['0,0']);
  });

  it('deckt mit dem Radius wachsende Ringe auf', () => {
    // A hex disc of radius n holds 1 + 3n(n+1) hexes; anything else means the brush is
    // leaving gaps or painting a rectangle.
    expect(hexesInRadius(0, 0, 1)).toHaveLength(7);
    expect(hexesInRadius(0, 0, 2)).toHaveLength(19);
  });
});

describe('Figuren rasten auf Hexmitten ein', () => {
  it('legt einen Punkt irgendwo im Hex auf dessen Mitte', () => {
    const centre = hexToWorld({ q: 3, r: -2 });
    // A point nudged off-centre must land back on the same hex's middle, or distances
    // measured between figures stop matching the grid they are counted on.
    const nudged = { x: centre.x + 40, y: centre.y - 30 };
    const snapped = hexToWorld(worldToHex(nudged.x, nudged.y));
    expect(snapped.x).toBeCloseTo(centre.x, 6);
    expect(snapped.y).toBeCloseTo(centre.y, 6);
  });
});

/**
 * The ruler counts **hex steps**, not straight-line pixels.
 *
 * That is what the old map reported and what the table expects: movement happens hex by hex,
 * so a euclidean answer disagrees with the grid everyone is counting on.
 */
describe('Lineal', () => {
  it('misst einen Nachbarn als einen Hexschritt', () => {
    expect(measureKm(hexToWorld({ q: 0, r: 0 }), hexToWorld({ q: 1, r: 0 }))).toBeCloseTo(
      KM_PER_HEX,
      6,
    );
  });

  it('misst null für eine Linie ohne Länge', () => {
    expect(measureKm({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('misst alle sechs Nachbarn gleich weit', () => {
    const origin = hexToWorld({ q: 0, r: 0 });
    for (const n of [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: 1 },
      { q: -1, r: 0 },
      { q: -1, r: -1 },
      { q: 0, r: -1 },
    ]) {
      expect(measureKm(origin, hexToWorld(n))).toBeCloseTo(KM_PER_HEX, 6);
    }
  });

  it('gibt ganze Hexschritte zurück, keine Luftlinie', () => {
    // Four columns across is four steps, even though the straight-line distance between the
    // centres is longer than four times the column pitch.
    expect(measureKm(hexToWorld({ q: 0, r: 0 }), hexToWorld({ q: 4, r: 0 }))).toBeCloseTo(
      4 * KM_PER_HEX,
      6,
    );
  });

  it('ändert sich nicht, wenn der Punkt im Hex verrutscht', () => {
    // Both ends snap before measuring, so nudging the cursor within a hex must not change
    // the reading — the number and the drawn line always agree.
    const a = hexToWorld({ q: 0, r: 0 });
    const b = hexToWorld({ q: 2, r: 1 });
    const nudged = { x: b.x + 60, y: b.y - 40 };
    expect(measureKm(a, hexToWorld(worldToHex(nudged.x, nudged.y)))).toBeCloseTo(
      measureKm(a, b),
      6,
    );
  });

  it('rechnet nicht mit dem Spaltenabstand', () => {
    // HEX_X_SPACING is 3/4 of a hex width and not the distance between neighbours; using it
    // read every distance ~15% long. The two constants must not be confused again.
    expect(worldToKm(HEX_HEIGHT)).toBeCloseTo(KM_PER_HEX, 6);
    expect(worldToKm(HEX_X_SPACING)).toBeLessThan(KM_PER_HEX);
  });
});

/** Dashes are what make the ruler readable over any terrain, so the maths is pinned. */
describe('Gestrichelte Linie', () => {
  it('bleibt auf der Strecke', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    for (const seg of dashSegments(a, b, 10, 5)) {
      expect(seg.from.y).toBeCloseTo(0, 6);
      expect(seg.from.x).toBeGreaterThanOrEqual(0);
      expect(seg.to.x).toBeLessThanOrEqual(100);
    }
  });

  it('deckt ungefähr den Strichanteil ab', () => {
    const segs = dashSegments({ x: 0, y: 0 }, { x: 90, y: 0 }, 10, 5);
    const covered = segs.reduce((sum, s) => sum + (s.to.x - s.from.x), 0);
    // Two thirds on, one third off.
    expect(covered).toBeGreaterThan(50);
    expect(covered).toBeLessThan(70);
  });

  it('gibt für eine Linie ohne Länge nichts zurück', () => {
    expect(dashSegments({ x: 3, y: 3 }, { x: 3, y: 3 }, 10, 5)).toEqual([]);
  });

  it('bricht bei einer sehr langen Linie ab statt zu ersticken', () => {
    // A ruler dragged across a continent must not emit tens of thousands of segments.
    expect(dashSegments({ x: 0, y: 0 }, { x: 1e9, y: 0 }, 10, 5).length).toBeLessThanOrEqual(2000);
  });
});

describe('Skizzenlinien', () => {
  it('sind gewöhnliche Objekte und kommen über dieselben Ops', () => {
    const data = createEmptyMapEditorData('Testwelt');
    const stroke = {
      id: 'k1',
      x: 0,
      y: 0,
      vis: 'public' as const,
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ],
      color: '#fff',
      width: 20,
      author: 'Alice',
    };

    run(data, [{ t: 'add', c: 'sketch', v: stroke }]);
    expect(data.sketch).toHaveLength(1);
    // The author has to survive the JSON trip: the server checks it before it will let a
    // player delete the line again.
    expect(data.sketch[0].author).toBe('Alice');

    run(data, [{ t: 'del', c: 'sketch', id: 'k1' }]);
    expect(data.sketch).toEqual([]);
  });

  it('berührt das Gelände nicht', () => {
    const data = createEmptyMapEditorData('Testwelt');
    run(data, [
      {
        t: 'add',
        c: 'sketch',
        v: { id: 'k1', x: 0, y: 0, vis: 'public', points: [], color: '#fff', width: 4, author: 'A' },
      },
    ]);
    // The whole promise of the sketch layer: it is drawn over the map, never into it.
    expect(data.chunkVersions).toEqual({});
  });
});

describe('Ein leeres Dokument kennt die Spielmodus-Felder', () => {
  it('hat Figuren, Skizze und Nebel', () => {
    const data = createEmptyMapEditorData('Testwelt');
    expect(data.tokens).toEqual([]);
    expect(data.sketch).toEqual([]);
    expect(data.fog).toEqual({ revealed: [] });
  });
});

/**
 * Fog redraw scheduling.
 *
 * The first version keyed on a quantised viewport and skipped both the redraw *and* the
 * sprite placement when the key matched — so while zooming, the texture kept being stretched
 * over bounds it had not been drawn for, and the fog edge visibly slid and flashed. The rule
 * now is: redraw unless the view still lies inside what was drawn, for the same audience and
 * the same fog.
 */
describe('Nebel-Neuzeichnen', () => {
  const view = (minX: number, minY: number, maxX: number, maxY: number) => ({
    minX,
    minY,
    maxX,
    maxY,
  });
  const drawn = (b: ReturnType<typeof view>, gm = true, revision = 1) => ({
    bounds: b,
    gm,
    revision,
  });

  it('zeichnet mit Rand, sodass kleine Bewegungen nichts kosten', () => {
    const padded = paddedBounds(view(0, 0, 1000, 800));
    expect(padded.minX).toBeLessThan(0);
    expect(padded.maxX).toBeGreaterThan(1000);
    expect(padded.minY).toBeLessThan(0);
    expect(padded.maxY).toBeGreaterThan(800);
  });

  it('zeichnet ohne vorherige Textur', () => {
    expect(fogNeedsRedraw(null, view(0, 0, 100, 100), true, 1)).toBe(true);
  });

  it('zeichnet bei einer kleinen Bewegung innerhalb des Randes nicht neu', () => {
    const padded = paddedBounds(view(0, 0, 1000, 800));
    expect(fogNeedsRedraw(drawn(padded), view(50, 40, 1050, 840), true, 1)).toBe(false);
  });

  it('zeichnet neu, sobald die Ansicht den gezeichneten Bereich verlässt', () => {
    const padded = paddedBounds(view(0, 0, 1000, 800));
    // Exactly the zoom case that used to flash instead of redrawing.
    expect(fogNeedsRedraw(drawn(padded), view(-5000, -5000, 5000, 5000), true, 1)).toBe(true);
  });

  it('zeichnet neu, wenn sich der Nebel geändert hat', () => {
    const padded = paddedBounds(view(0, 0, 1000, 800));
    expect(fogNeedsRedraw(drawn(padded), view(0, 0, 1000, 800), true, 2)).toBe(true);
  });

  it('zeichnet neu, wenn GM und Spieler wechseln', () => {
    // Player fog is opaque and GM fog is not, so the texture cannot be shared.
    const padded = paddedBounds(view(0, 0, 1000, 800));
    expect(fogNeedsRedraw(drawn(padded), view(0, 0, 1000, 800), false, 1)).toBe(true);
  });

  it('zeichnet neu, wenn die Ansicht auch nur an einer Kante übersteht', () => {
    const padded = paddedBounds(view(0, 0, 1000, 800));
    const justOver = view(padded.minX - 1, 0, 1000, 800);
    expect(fogNeedsRedraw(drawn(padded), justOver, true, 1)).toBe(true);
  });
});
