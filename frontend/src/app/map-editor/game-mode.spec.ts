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
import { measureKm } from './play-aids';
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

describe('Lineal', () => {
  it('misst eine Hexbreite als eine Hexentfernung', () => {
    const a = hexToWorld({ q: 0, r: 0 });
    const b = hexToWorld({ q: 1, r: 0 });
    // Neighbouring hexes are one step apart, so the ruler must read exactly the map scale.
    expect(measureKm(a, b)).toBeCloseTo(KM_PER_HEX, 6);
  });

  it('misst null für eine Linie ohne Länge', () => {
    expect(measureKm({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('misst senkrechte und schräge Nachbarn gleich weit', () => {
    const origin = hexToWorld({ q: 0, r: 0 });
    // The defining property of a hex grid, and the reason the column pitch is the wrong
    // divisor: every neighbour is the same distance away, in all six directions.
    for (const n of [
      { q: 1, r: 0 },
      { q: 0, r: 1 },
      { q: -1, r: 0 },
      { q: 0, r: -1 },
    ]) {
      expect(measureKm(origin, hexToWorld(n))).toBeCloseTo(KM_PER_HEX, 6);
    }
  });

  it('rechnet nicht mit dem Spaltenabstand', () => {
    // Guards the actual bug: HEX_X_SPACING is 3/4 of a hex width, so using it read every
    // distance ~15% long. The two constants must not be confused again.
    expect(worldToKm(HEX_HEIGHT)).toBeCloseTo(KM_PER_HEX, 6);
    expect(worldToKm(HEX_X_SPACING)).toBeLessThan(KM_PER_HEX);
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
