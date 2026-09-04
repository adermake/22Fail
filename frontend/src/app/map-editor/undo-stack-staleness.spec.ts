/**
 * Undo across an operation that rewrote chunks without capturing them.
 *
 * The landmass stamp, the region clear and the tier wipe all rewrite chunks deliberately
 * *without* `onBeforePaint`, which is what makes them non-undoable. That was only half the
 * story: snapshots taken by earlier strokes describe the same chunks and are now stale, and
 * `ChunkManager.restore` blits a whole 512² chunk with `clear: true`.
 *
 * So undoing across one of those operations did not merely lose a stroke — it dropped an
 * entire chunk of pre-operation map back in, marked it dirty and uploaded it. That is the
 * chunk-shaped square of old terrain that kept reappearing with no stamp involved: the map
 * was correct until somebody pressed Ctrl+Z.
 *
 * `UndoStack` needs a renderer, so the rule is exercised against a stand-in that records what
 * would have been restored.
 */

import { UndoStack } from './undo-stack';
import { ChunkManager, ChunkRecord } from './chunk-manager';
import { DetailTier, RasterLayer } from './map-editor.model';

/**
 * Enough of a chunk record for the stack to key and size a snapshot.
 *
 * `loaded` matters: `capture` refuses to snapshot a chunk whose pixels have not arrived, or
 * undo would blit that emptiness over terrain that loaded in the meantime.
 */
const rec = (layer: RasterLayer, tier: DetailTier, cx: number, cy: number): ChunkRecord =>
  ({ layer, tier, cx, cy, loaded: true }) as ChunkRecord;

function makeStack() {
  const restored: string[] = [];
  const snapshots: { destroyed: boolean }[] = [];

  const chunks = {
    // `undo` captures the *current* state first so there is something to redo into, and that
    // path resolves the live record before snapshotting it.
    get: (layer: RasterLayer, tier: DetailTier, cx: number, cy: number) =>
      rec(layer, tier, cx, cy),
    // A snapshot is a texture; only its lifecycle matters here.
    snapshot: () => {
      const t = { destroyed: false, source: {}, destroy: () => (t.destroyed = true) };
      snapshots.push(t);
      return t;
    },
    restore: (layer: RasterLayer, tier: DetailTier, cx: number, cy: number) => {
      restored.push(`${layer}/${tier}/${cx}/${cy}`);
    },
  } as unknown as ChunkManager;

  const stack = new UndoStack(chunks, { add: () => {}, update: () => {}, remove: () => {} });
  return { stack, restored, snapshots };
}

describe('Undo über eine nicht erfassende Massenoperation', () => {
  it('stellt einen normalen Strich wieder her', () => {
    const { stack, restored } = makeStack();

    stack.begin();
    stack.capture(rec('landColor', 'med', 1, -1));
    stack.commit('Strich');

    expect(stack.canUndo()).toBe(true);
    stack.undo();
    expect(restored).toEqual(['landColor/med/1/-1']);
  });

  it('macht nach dem Leeren gar nichts mehr rückgängig', () => {
    /*
     * Genau der gemeldete Fall: vor dem Import gemalt, gestempelt, später Strg+Z — und ein
     * ganzer Chunk Karte von vor dem Import kam zurück.
     */
    const { stack, restored } = makeStack();

    stack.begin();
    stack.capture(rec('landColor', 'med', 1, -1));
    stack.commit('Strich vor dem Import');

    stack.clear(); // der Stempel läuft

    expect(stack.canUndo()).toBe(false);
    stack.undo();
    expect(restored).toEqual([]);
  });

  it('gibt die Snapshot-Texturen dabei frei', () => {
    // Sonst wäre das Leeren ein VRAM-Leck statt einer Aufräumaktion.
    const { stack, snapshots } = makeStack();

    stack.begin();
    stack.capture(rec('height', 'med', 1, -1));
    stack.capture(rec('landColor', 'med', 1, -1));
    stack.commit('Strich');

    expect(snapshots.length).toBeGreaterThan(0);
    stack.clear();
    expect(snapshots.every(t => t.destroyed)).toBe(true);
  });

  it('nimmt auch die Vorwärts-Historie mit', () => {
    // Ein Redo nach dem Stempel wäre genauso veraltet wie ein Undo.
    const { stack, restored } = makeStack();

    stack.begin();
    stack.capture(rec('landColor', 'low', 0, -1));
    stack.commit('Strich');
    stack.undo();
    restored.length = 0;

    expect(stack.canRedo()).toBe(true);
    stack.clear();

    expect(stack.canRedo()).toBe(false);
    stack.redo();
    expect(restored).toEqual([]);
  });
});
