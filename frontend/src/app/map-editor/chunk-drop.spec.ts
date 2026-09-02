/**
 * Chunk drops, and the one thing that makes them dangerous.
 *
 * A drop is the only op that can arrive after it has been superseded. `clearImportArea` sends
 * it over the socket and the stamp then repaints the same chunks over HTTP — two channels with
 * no ordering between them — so a drop echo can land *after* the new pixels are already
 * published. Applied blindly it deletes the version record of a chunk whose file is current,
 * and the client frees a texture it has just painted: part of a stamped region comes out wiped,
 * with a hard boundary wherever the echo happened to land.
 *
 * `MapEditorStoreService` filters that case using `ownChunkVersions`. The filter is reproduced
 * here rather than driven through the service, which would need a socket, an HTTP client and
 * Angular's injector for a rule that is three lines of set arithmetic.
 */

import { MapEditorData, chunkKey, createEmptyMapEditorData } from './map-editor.model';

type Cell = [number, number];

/** Mirrors the `chunkDrop` branch of `MapEditorStoreService.applyRemoteOp`. */
function applyDrop(data: MapEditorData, own: Map<string, number>, cells: Cell[]): Cell[] {
  const stale: Cell[] = [];
  for (const [cx, cy] of cells) {
    const key = chunkKey('landColor', 'high', cx, cy);
    if (own.has(key)) continue;
    delete data.chunkVersions[key];
    stale.push([cx, cy]);
  }
  return stale;
}

const key = (cx: number, cy: number) => chunkKey('landColor', 'high', cx, cy);

describe('Chunk-Drop', () => {
  let data: MapEditorData;
  let own: Map<string, number>;

  beforeEach(() => {
    data = createEmptyMapEditorData('Testwelt');
    own = new Map();
  });

  it('entfernt gelöschte Kacheln aus der Versionsliste', () => {
    data.chunkVersions[key(0, 0)] = 3;
    data.chunkVersions[key(1, 0)] = 7;

    const stale = applyDrop(data, own, [
      [0, 0],
      [1, 0],
    ]);

    expect(stale).toEqual([
      [0, 0],
      [1, 0],
    ]);
    expect(data.chunkVersions[key(0, 0)]).toBeUndefined();
    expect(data.chunkVersions[key(1, 0)]).toBeUndefined();
  });

  it('verschont Kacheln, die wir seit dem Löschen neu hochgeladen haben', () => {
    // Genau der Ablauf beim Re-Import: Bereich löschen, sofort neu stempeln, und erst danach
    // trifft das Echo des eigenen Löschens ein.
    data.chunkVersions[key(0, 0)] = 1;
    own.set(key(0, 0), 1);

    const stale = applyDrop(data, own, [[0, 0]]);

    expect(stale).toEqual([]);
    expect(data.chunkVersions[key(0, 0)]).toBe(1);
  });

  it('trennt frisch gestempelte von wirklich gelöschten Kacheln im selben Echo', () => {
    // Das Echo deckt den ganzen Bereich ab, der Stempel hatte aber erst die Hälfte erreicht —
    // die Ursache der harten Kante mitten im gestempelten Gebiet.
    data.chunkVersions[key(0, 0)] = 1;
    data.chunkVersions[key(1, 0)] = 1;
    own.set(key(0, 0), 1);

    const stale = applyDrop(data, own, [
      [0, 0],
      [1, 0],
    ]);

    expect(stale).toEqual([[1, 0]]);
    expect(data.chunkVersions[key(0, 0)]).toBe(1);
    expect(data.chunkVersions[key(1, 0)]).toBeUndefined();
  });

  it('meldet nichts, wenn jede Kachel inzwischen neu geschrieben wurde', () => {
    // Kein Signal heißt: der Renderer gibt keine Textur frei, die er gerade bemalt hat.
    data.chunkVersions[key(0, 0)] = 2;
    own.set(key(0, 0), 2);

    expect(applyDrop(data, own, [[0, 0]])).toHaveLength(0);
  });
});
