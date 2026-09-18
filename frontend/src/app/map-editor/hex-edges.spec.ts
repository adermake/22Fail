/**
 * Hex edges, which passages sit on.
 *
 * An edge belongs to two hexes at once, and that is the whole difficulty: clicking the same
 * line from either side has to name the same edge and draw the same segment, or the map ends
 * up with two passages stacked on one boundary and a click that removes only one of them.
 */

import {
  HEX_RADIUS,
  edgeCrossing,
  edgeEndpoints,
  edgeKey,
  edgeMidpoint,
  hexCorners,
  hexNeighbor,
  hexNeighbors,
  hexToWorld,
  nearestEdge,
  worldToHex,
} from './map-hex';
import { applyMapOp, createEmptyMapEditorData } from './map-editor.model';

describe('Nachbarn', () => {
  it('liegt in jeder Richtung genau einen Schritt entfernt', () => {
    const origin = { q: 4, r: 3 };
    const centre = hexToWorld(origin);
    for (let dir = 0; dir < 6; dir++) {
      const n = hexToWorld(hexNeighbor(origin, dir));
      // Every neighbour is √3·R away — the property that makes it a hex grid.
      expect(Math.hypot(n.x - centre.x, n.y - centre.y)).toBeCloseTo(Math.sqrt(3) * HEX_RADIUS, 6);
    }
  });

  it('ist wechselseitig', () => {
    const hex = { q: -3, r: 2 };
    for (let dir = 0; dir < 6; dir++) {
      const n = hexNeighbor(hex, dir);
      // Stepping across an edge and back has to return to where it started.
      expect(hexNeighbors(n)).toContainEqual(hex);
    }
  });

  it('liefert sechs verschiedene Nachbarn', () => {
    const keys = hexNeighbors({ q: 0, r: 0 }).map(h => `${h.q},${h.r}`);
    expect(new Set(keys).size).toBe(6);
  });
});

describe('Kanten-Identität', () => {
  it('heißt von beiden Seiten gleich', () => {
    const a = { q: 2, r: 2 };
    for (const b of hexNeighbors(a)) {
      // The invariant the whole feature rests on.
      expect(edgeKey(a, b)).toBe(edgeKey(b, a));
    }
  });

  it('unterscheidet verschiedene Kanten desselben Hex', () => {
    const a = { q: 5, r: -1 };
    const keys = hexNeighbors(a).map(b => edgeKey(a, b));
    expect(new Set(keys).size).toBe(6);
  });

  it('zeichnet von beiden Seiten dieselbe Strecke', () => {
    const a = { q: 1, r: 1 };
    for (const b of hexNeighbors(a)) {
      const fromA = edgeEndpoints(edgeKey(a, b));
      const fromB = edgeEndpoints(edgeKey(b, a));
      expect(fromA).not.toBeNull();
      // Same key both ways, so necessarily the same floats — no almost-aligned circles.
      expect(fromB).toEqual(fromA);
    }
  });

  it('liegt mit den Enden auf den Ecken beider Hexe', () => {
    const a = { q: 0, r: 0 };
    const b = hexNeighbor(a, 2);
    const ends = edgeEndpoints(edgeKey(a, b))!;

    for (const hex of [a, b]) {
      const centre = hexToWorld(hex);
      const corners = hexCorners(centre.x, centre.y);
      for (const end of ends) {
        const onACorner = corners.some(
          c => Math.abs(c.x - end.x) < 0.001 && Math.abs(c.y - end.y) < 0.001,
        );
        expect(onACorner).toBe(true);
      }
    }
  });

  it('meldet nichts für eine Kante zwischen nicht benachbarten Hexen', () => {
    expect(edgeEndpoints('0,0|9,9')).toBeNull();
    expect(edgeEndpoints('kaputt')).toBeNull();
  });

  it('setzt den Mittelpunkt zwischen die Enden', () => {
    const key = edgeKey({ q: 3, r: 3 }, hexNeighbor({ q: 3, r: 3 }, 4));
    const [p, q] = edgeEndpoints(key)!;
    expect(edgeMidpoint(key)).toEqual({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  });
});

describe('Kante unter dem Mauszeiger', () => {
  it('findet von beiden Seiten dieselbe Kante', () => {
    const a = { q: 2, r: -2 };
    for (let dir = 0; dir < 6; dir++) {
      const b = hexNeighbor(a, dir);
      const key = edgeKey(a, b);
      const mid = edgeMidpoint(key)!;

      // Nudge a little to each side of the boundary: both clicks must toggle the same edge.
      const towards = (hex: { q: number; r: number }) => {
        const c = hexToWorld(hex);
        return {
          x: mid.x + (c.x - mid.x) * 0.2,
          y: mid.y + (c.y - mid.y) * 0.2,
        };
      };

      const fromA = towards(a);
      const fromB = towards(b);
      expect(nearestEdge(fromA.x, fromA.y).key).toBe(key);
      expect(nearestEdge(fromB.x, fromB.y).key).toBe(key);
    }
  });

  it('greift die Kante, auf die geklickt wurde, nicht eine benachbarte', () => {
    const hex = { q: 0, r: 0 };
    const centre = hexToWorld(hex);
    const corners = hexCorners(centre.x, centre.y);

    for (let k = 0; k < 6; k++) {
      const next = corners[(k + 1) % 6];
      const mid = { x: (corners[k].x + next.x) / 2, y: (corners[k].y + next.y) / 2 };
      expect(nearestEdge(mid.x, mid.y).key).toBe(edgeKey(hex, hexNeighbor(hex, k)));
    }
  });

  it('meldet die Entfernung, damit ein Klick weit weg ignoriert werden kann', () => {
    const hex = { q: 0, r: 0 };
    const centre = hexToWorld(hex);
    // Dead centre of a hex is as far from every edge as it gets.
    const { distance } = nearestEdge(centre.x, centre.y);
    expect(distance).toBeGreaterThan(HEX_RADIUS * 0.5);

    const mid = edgeMidpoint(edgeKey(hex, hexNeighbor(hex, 0)))!;
    expect(nearestEdge(mid.x, mid.y).distance).toBeCloseTo(0, 6);
  });

  it('bleibt konsistent mit dem Hex, in dem der Punkt liegt', () => {
    // A point just inside a hex must resolve to an edge of *that* hex.
    const hex = { q: 7, r: -4 };
    const centre = hexToWorld(hex);
    const probe = { x: centre.x + HEX_RADIUS * 0.4, y: centre.y + HEX_RADIUS * 0.2 };
    expect(worldToHex(probe.x, probe.y)).toEqual(hex);

    const { key } = nearestEdge(probe.x, probe.y);
    expect(hexNeighbors(hex).some(n => edgeKey(hex, n) === key)).toBe(true);
  });
});

/**
 * Passages as documents.
 *
 * The edge key is the identity, so the invariant that matters is that a passage added from
 * one hex is found again when the same boundary is clicked from the other.
 */
describe('Durchgänge im Dokument', () => {
  it('kommt über dieselben Ops wie jedes andere Objekt', () => {
    const data = createEmptyMapEditorData('Testwelt');
    const a = { q: 1, r: 1 };
    const b = hexNeighbor(a, 3);
    const key = edgeKey(a, b);
    const mid = edgeMidpoint(key)!;

    const passage = { id: 'p1', x: mid.x, y: mid.y, vis: 'public' as const, edge: key };
    applyMapOp(data, JSON.parse(JSON.stringify({ t: 'add', c: 'passages', v: passage })));
    expect(data.passages).toHaveLength(1);
    // The key has to survive the socket, or the other side cannot match the edge.
    expect(data.passages[0].edge).toBe(key);

    applyMapOp(data, { t: 'del', c: 'passages', id: 'p1' });
    expect(data.passages).toEqual([]);
  });

  it('findet den Durchgang wieder, egal von welcher Seite geklickt wird', () => {
    const a = { q: 4, r: -2 };
    const b = hexNeighbor(a, 1);
    const stored = edgeKey(a, b);

    // Click from each side, a little off the line, the way a real click lands.
    const mid = edgeMidpoint(stored)!;
    for (const hex of [a, b]) {
      const c = hexToWorld(hex);
      const probe = { x: mid.x + (c.x - mid.x) * 0.25, y: mid.y + (c.y - mid.y) * 0.25 };
      expect(nearestEdge(probe.x, probe.y).key).toBe(stored);
    }
  });

  it('berührt das Gelände nicht', () => {
    const data = createEmptyMapEditorData('Testwelt');
    applyMapOp(data, {
      t: 'add',
      c: 'passages',
      v: { id: 'p1', x: 0, y: 0, vis: 'public', edge: edgeKey({ q: 0, r: 0 }, { q: 1, r: 0 }) },
    } as never);
    // A passage is a vector object on the map, never painted into a chunk.
    expect(data.chunkVersions).toEqual({});
  });

  it('legt ein leeres Dokument mit der Sammlung an', () => {
    expect(createEmptyMapEditorData('Testwelt').passages).toEqual([]);
  });
});

/**
 * The mark a passage is drawn on.
 *
 * It crosses the edge rather than lying along it. Along the boundary the same `o—o` read as a
 * wall — a line on a border says "here is the border", which is the opposite of "these two
 * hexes are joined".
 */
describe('Durchgang quer zur Kante', () => {
  it('steht senkrecht auf der Kante', () => {
    const a = { q: 2, r: 1 };
    for (const b of hexNeighbors(a)) {
      const key = edgeKey(a, b);
      const [e0, e1] = edgeEndpoints(key)!;
      const [c0, c1] = edgeCrossing(key, 100)!;

      const edge = { x: e1.x - e0.x, y: e1.y - e0.y };
      const cross = { x: c1.x - c0.x, y: c1.y - c0.y };
      const dot = edge.x * cross.x + edge.y * cross.y;
      const norm = Math.hypot(edge.x, edge.y) * Math.hypot(cross.x, cross.y);
      // Perpendicular in every one of the six directions.
      expect(Math.abs(dot / norm)).toBeLessThan(1e-9);
    }
  });

  it('sitzt mittig auf der Kante', () => {
    const key = edgeKey({ q: 0, r: 0 }, { q: 1, r: 0 });
    const mid = edgeMidpoint(key)!;
    const [c0, c1] = edgeCrossing(key, 120)!;
    expect((c0.x + c1.x) / 2).toBeCloseTo(mid.x, 6);
    expect((c0.y + c1.y) / 2).toBeCloseTo(mid.y, 6);
  });

  it('hat die verlangte Länge', () => {
    const key = edgeKey({ q: 3, r: -1 }, { q: 3, r: 0 });
    const [c0, c1] = edgeCrossing(key, 137)!;
    expect(Math.hypot(c1.x - c0.x, c1.y - c0.y)).toBeCloseTo(137, 6);
  });

  it('legt je ein Ende in jedes der beiden Hexe', () => {
    const a = { q: 1, r: 2 };
    for (const b of hexNeighbors(a)) {
      const key = edgeKey(a, b);
      const [c0, c1] = edgeCrossing(key, 120)!;
      // A knob in each hex is what makes it read as a connection rather than a barrier.
      const hexes = [worldToHex(c0.x, c0.y), worldToHex(c1.x, c1.y)].map(h => `${h.q},${h.r}`);
      expect(new Set(hexes).size).toBe(2);
      expect(hexes.sort()).toEqual([`${a.q},${a.r}`, `${b.q},${b.r}`].sort());
    }
  });

  it('zeigt von beiden Seiten in dieselbe Richtung', () => {
    const a = { q: -2, r: 4 };
    const b = hexNeighbor(a, 5);
    // The key is canonical, so the segment cannot flip depending on which side was clicked.
    expect(edgeCrossing(edgeKey(a, b), 90)).toEqual(edgeCrossing(edgeKey(b, a), 90));
  });

  it('meldet nichts für eine kaputte Kante', () => {
    expect(edgeCrossing('kaputt', 100)).toBeNull();
    expect(edgeCrossing('0,0|9,9', 100)).toBeNull();
  });
});
