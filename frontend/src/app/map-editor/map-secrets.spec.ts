/**
 * Secret groups.
 *
 * The rules being pinned here are the ones with a consequence at the table: grouping hides,
 * revealing does not destroy the group, and dissolving does not reveal. The last is the one
 * that matters most — tidying up the panel must never put a secret on the players' screens.
 *
 * The JSON round-trip test guards a bug that would not show up locally at all: `applyMapOp`
 * uses `Object.assign`, so clearing a field with `undefined` works in memory but is dropped by
 * `JSON.stringify` on the way to the socket, leaving the sender and everyone else disagreeing.
 */

import { describe, expect, it } from 'vitest';
import {
  AnyMapObject,
  MapEditorData,
  MapLabel,
  MapOp,
  MapSymbol,
  applyMapOp,
  createEmptyMapEditorData,
} from './map-editor.model';
import {
  defaultSecretName,
  dissolveOps,
  groupOps,
  hideOps,
  membersOf,
  moveOps,
  newSecretId,
  refKey,
  revealOps,
  secretNameFor,
  summarize,
  ungroupOps,
} from './map-secrets';
import { MapRegion } from './map-editor.model';

function symbol(id: string): MapSymbol {
  return { id, x: 0, y: 0, vis: 'public', asset: 'trees/oak/oak_01', group: 'trees/oak', scale: 1, rotation: 0 };
}

function label(id: string): MapLabel {
  return {
    id,
    x: 0,
    y: 0,
    vis: 'public',
    text: id,
    rotation: 0,
    style: {
      fontFamily: 'serif',
      fontSize: 64,
      fill: '#fff',
      outline: '#000',
      outlineWidth: 4,
      curvature: 0,
      letterSpacing: 0,
    },
  };
}

function makeData(): MapEditorData {
  const data = createEmptyMapEditorData('Testwelt');
  data.symbols.push(symbol('s1'), symbol('s2'));
  data.labels.push(label('l1'));
  return data;
}

/** Apply ops the way the client does, but through JSON — the socket is not a local call. */
function run(data: MapEditorData, ops: MapOp[]): void {
  for (const op of ops) applyMapOp(data, JSON.parse(JSON.stringify(op)) as MapOp);
}

function get(data: MapEditorData, c: 'symbols' | 'labels', id: string): AnyMapObject {
  const obj = (data[c] as AnyMapObject[]).find(o => o.id === id);
  if (!obj) throw new Error(`missing ${c}/${id}`);
  return obj;
}

describe('Geheimnis-Gruppen', () => {
  it('gruppiert über Kategorien hinweg und verbirgt dabei', () => {
    const data = makeData();
    const id = newSecretId();
    data.secrets.push({ id, name: 'Räuberlager' });

    run(
      data,
      groupOps(
        [
          { c: 'labels', id: 'l1' },
          { c: 'symbols', id: 's1' },
        ],
        id,
      ),
    );

    // Grouping is one act to the user: the picked things are now a secret *and* hidden.
    expect(get(data, 'labels', 'l1').secret).toBe(id);
    expect(get(data, 'labels', 'l1').vis).toBe('secret');
    expect(get(data, 'symbols', 's1').vis).toBe('secret');
    // Untouched objects stay exactly as they were.
    expect(get(data, 'symbols', 's2').vis).toBe('public');
    expect(get(data, 'symbols', 's2').secret).toBeUndefined();
  });

  it('deckt auf, ohne die Gruppe zu zerstören', () => {
    const data = makeData();
    const id = newSecretId();
    data.secrets.push({ id, name: 'Räuberlager' });
    run(data, groupOps([{ c: 'symbols', id: 's1' }], id));

    run(data, revealOps(data, id));

    expect(get(data, 'symbols', 's1').vis).toBe('public');
    // The group survives its own reveal, so it can be hidden again after the party moves on.
    expect(get(data, 'symbols', 's1').secret).toBe(id);
    expect(data.secrets).toHaveLength(1);
    expect(summarize(data)[0].revealed).toBe(true);
  });

  it('verbirgt eine aufgedeckte Gruppe wieder', () => {
    const data = makeData();
    const id = newSecretId();
    data.secrets.push({ id, name: 'Räuberlager' });
    run(data, groupOps([{ c: 'symbols', id: 's1' }], id));
    run(data, revealOps(data, id));

    run(data, hideOps(data, id));

    expect(get(data, 'symbols', 's1').vis).toBe('secret');
    expect(summarize(data)[0].revealed).toBe(false);
  });

  it('deckt beim Auflösen nichts auf', () => {
    const data = makeData();
    const id = newSecretId();
    data.secrets.push({ id, name: 'Räuberlager' });
    run(data, groupOps([{ c: 'symbols', id: 's1' }], id));

    run(data, dissolveOps(data, id));

    // This is the one that must never regress: dissolving is housekeeping, not a reveal.
    expect(get(data, 'symbols', 's1').vis).toBe('secret');
    expect(get(data, 'symbols', 's1').secret).toBeFalsy();
    expect(data.secrets).toHaveLength(0);
  });

  it('löst die Zugehörigkeit auch über eine JSON-Runde hinweg', () => {
    const data = makeData();
    const id = newSecretId();
    data.secrets.push({ id, name: 'Räuberlager' });
    run(data, groupOps([{ c: 'symbols', id: 's1' }], id));

    // `run` serialises deliberately. With `{ secret: undefined }` the key would vanish from
    // the payload and this would still report the old group.
    run(data, ungroupOps([{ c: 'symbols', id: 's1' }]));

    expect(membersOf(data, id)).toHaveLength(0);
    // Removing it from the group says nothing about who may see it.
    expect(get(data, 'symbols', 's1').vis).toBe('secret');
  });

  it('hält ein Objekt in höchstens einer Gruppe', () => {
    const data = makeData();
    const first = newSecretId();
    const second = newSecretId();
    data.secrets.push({ id: first, name: 'A' }, { id: second, name: 'B' });

    run(data, groupOps([{ c: 'symbols', id: 's1' }], first));
    run(data, groupOps([{ c: 'symbols', id: 's1' }], second));

    expect(membersOf(data, first)).toHaveLength(0);
    expect(membersOf(data, second)).toEqual([{ c: 'symbols', id: 's1' }]);
  });

  it('meldet eine leere Gruppe als nicht aufgedeckt', () => {
    const data = makeData();
    data.secrets.push({ id: 'leer', name: 'Leer' });

    const summary = summarize(data)[0];
    expect(summary.members).toHaveLength(0);
    // A group with nothing in it has revealed nothing — calling it "revealed" would let the
    // panel claim the party has seen a secret that does not exist.
    expect(summary.revealed).toBe(false);
  });

  it('gibt eine Gruppe nur einmal zurück, auch bei doppelter Auswahl', () => {
    const ops = groupOps(
      [
        { c: 'symbols', id: 's1' },
        { c: 'symbols', id: 's1' },
      ],
      'x',
    );
    expect(ops).toHaveLength(1);
  });

  it('benennt ein neues Geheimnis nach seiner Beschriftung', () => {
    const data = makeData();
    data.labels[0].text = 'Räuberlager';

    // The name is already on the map; making the GM retype it — and reading "Geheimnis 3" in
    // a panel of hundreds — was the whole complaint.
    expect(
      secretNameFor(
        data,
        [
          { c: 'symbols', id: 's1' },
          { c: 'labels', id: 'l1' },
        ],
        [],
      ),
    ).toBe('Räuberlager');
  });

  it('fällt auf eine Nummer zurück, wenn keine Beschriftung dabei ist', () => {
    const data = makeData();
    expect(secretNameFor(data, [{ c: 'symbols', id: 's1' }], [])).toBe('Geheimnis 1');
  });

  it('übergeht eine leere Beschriftung', () => {
    const data = makeData();
    data.labels[0].text = '   ';
    // Whitespace is not a name; it would produce an invisible row in the panel.
    expect(secretNameFor(data, [{ c: 'labels', id: 'l1' }], [])).toBe('Geheimnis 1');
  });

  it('nimmt bei mehreren Beschriftungen die erste der Auswahl', () => {
    const data = makeData();
    data.labels[0].text = 'Erste';
    data.labels.push({ ...label('l2'), text: 'Zweite' });
    expect(
      secretNameFor(
        data,
        [
          { c: 'labels', id: 'l1' },
          { c: 'labels', id: 'l2' },
        ],
        [],
      ),
    ).toBe('Erste');
  });

  it('erlaubt bei Beschriftungsnamen Dopplungen', () => {
    const data = makeData();
    data.labels[0].text = 'Räuberlager';
    // Two places really can share a name. Silently renaming one behind the GM's back would
    // be worse than the collision — unlike the numbered fallback, which exists to be unique.
    expect(secretNameFor(data, [{ c: 'labels', id: 'l1' }], [{ id: 'a', name: 'Räuberlager' }])).toBe(
      'Räuberlager',
    );
  });

  it('vergibt unterscheidbare Vorgabenamen', () => {
    expect(defaultSecretName([])).toBe('Geheimnis 1');
    expect(defaultSecretName([{ id: 'a', name: 'Geheimnis 1' }])).toBe('Geheimnis 2');
    // A hand-typed name occupying the slot must not produce a duplicate.
    expect(
      defaultSecretName([
        { id: 'a', name: 'Räuberlager' },
        { id: 'b', name: 'Geheimnis 3' },
      ]),
    ).toBe('Geheimnis 4');
  });
});

/**
 * Moving a group.
 *
 * A secret is a *place*: the camp's name, its tents and its outline have to keep their
 * arrangement. The trap is regions — their geometry lives in `points`, and shifting only the
 * cached centroid leaves the drawn outline behind while the spatial index quietly starts
 * pointing at the wrong place.
 */
describe('Geheimnis verschieben', () => {
  function region(id: string): MapRegion {
    return {
      id,
      x: 5,
      y: 5,
      vis: 'secret',
      secret: 'g1',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      color: '#fff',
      thickness: 4,
      dash: 0,
      gap: 0,
    };
  }

  it('verschiebt jedes Mitglied um dieselbe Strecke', () => {
    const data = makeData();
    const origins = new Map<string, AnyMapObject>([
      [refKey({ c: 'symbols', id: 's1' }), structuredClone(get(data, 'symbols', 's1'))],
      [refKey({ c: 'labels', id: 'l1' }), structuredClone(get(data, 'labels', 'l1'))],
    ]);

    run(
      data,
      moveOps(
        [
          { c: 'symbols', id: 's1' },
          { c: 'labels', id: 'l1' },
        ],
        origins,
        100,
        -40,
      ),
    );

    expect([get(data, 'symbols', 's1').x, get(data, 'symbols', 's1').y]).toEqual([100, -40]);
    expect([get(data, 'labels', 'l1').x, get(data, 'labels', 'l1').y]).toEqual([100, -40]);
  });

  it('nimmt bei einer Region die Stützpunkte mit, nicht nur den Schwerpunkt', () => {
    const data = makeData();
    data.regions.push(region('r1'));
    const origins = new Map<string, AnyMapObject>([[refKey({ c: 'regions', id: 'r1' }), region('r1')]]);

    run(data, moveOps([{ c: 'regions', id: 'r1' }], origins, 7, 3));

    const moved = data.regions[0];
    expect([moved.x, moved.y]).toEqual([12, 8]);
    expect(moved.points).toEqual([
      { x: 7, y: 3 },
      { x: 17, y: 3 },
      { x: 17, y: 13 },
    ]);
  });

  it('rechnet immer vom Startpunkt, nie vom aktuellen Stand', () => {
    const data = makeData();
    // A *copy*, as the component takes: the drag mutates the live object, so holding a
    // reference here would make each delta stack on the last instead of replacing it.
    const origins = new Map<string, AnyMapObject>([
      [refKey({ c: 'symbols', id: 's1' }), structuredClone(get(data, 'symbols', 's1'))],
    ]);

    // Two deltas from the same snapshot: the second must not stack on the first, which is
    // what would happen if the ops were built from the objects' live positions mid-drag.
    run(data, moveOps([{ c: 'symbols', id: 's1' }], origins, 10, 10));
    run(data, moveOps([{ c: 'symbols', id: 's1' }], origins, 25, 25));

    expect([get(data, 'symbols', 's1').x, get(data, 'symbols', 's1').y]).toEqual([25, 25]);
  });

  it('ignoriert Mitglieder ohne Startposition', () => {
    expect(moveOps([{ c: 'symbols', id: 'fehlt' }], new Map(), 5, 5)).toEqual([]);
  });
});
