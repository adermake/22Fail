import { ObjectApplier, ObjectChange, UndoStack, clone } from './undo-stack';
import { AnyMapObject, MapSymbol, ObjectCollection } from './map-editor.model';

/** Minimal stand-in for the store: records what undo/redo actually replayed. */
class FakeStore implements ObjectApplier {
  symbols = new Map<string, MapSymbol>();
  calls: string[] = [];

  add(_c: ObjectCollection, obj: AnyMapObject): void {
    this.calls.push(`add:${obj.id}`);
    this.symbols.set(obj.id, obj as MapSymbol);
  }
  update(_c: ObjectCollection, id: string, patch: Record<string, unknown>): void {
    this.calls.push(`upd:${id}`);
    const cur = this.symbols.get(id);
    if (cur) this.symbols.set(id, { ...cur, ...(patch as Partial<MapSymbol>) });
  }
  remove(_c: ObjectCollection, id: string): void {
    this.calls.push(`del:${id}`);
    this.symbols.delete(id);
  }
}

/** The raster half is GPU-bound, so it is stubbed out; object history is pure logic. */
const noChunks = {
  snapshot: () => null,
  restore: () => undefined,
  get: () => undefined,
} as never;

const sym = (id: string, x = 0, y = 0): MapSymbol => ({
  id,
  x,
  y,
  vis: 'public',
  asset: 'trees/a/b',
  group: 'trees/a',
  scale: 1,
  rotation: 0,
});

function change(c: ObjectCollection, id: string, before: MapSymbol | null, after: MapSymbol | null): ObjectChange {
  return { c, id, before, after };
}

describe('undo stack — object history', () => {
  let store: FakeStore;
  let stack: UndoStack;

  beforeEach(() => {
    store = new FakeStore();
    stack = new UndoStack(noChunks, store);
  });

  it('undoes a placement by deleting it, and redoes by re-adding', () => {
    const s = sym('a', 10, 20);
    store.symbols.set(s.id, s);

    stack.begin();
    stack.recordObject(change('symbols', 'a', null, clone(s)));
    stack.commit('place');

    expect(stack.canUndo()).toBe(true);
    stack.undo();
    expect(store.symbols.has('a')).toBe(false);

    stack.redo();
    expect(store.symbols.get('a')?.x).toBe(10);
  });

  it('undoes a delete by restoring the object', () => {
    const s = sym('a', 5, 6);
    stack.begin();
    stack.recordObject(change('symbols', 'a', clone(s), null));
    stack.commit('delete');

    stack.undo();
    expect(store.symbols.get('a')).toMatchObject({ x: 5, y: 6 });

    stack.redo();
    expect(store.symbols.has('a')).toBe(false);
  });

  it('restores the pre-drag position, not the moved one', () => {
    // The live object is mutated in place while dragging, so recording a reference rather
    // than a copy would make "before" and "after" the same and undo a no-op.
    const live = sym('a', 0, 0);
    store.symbols.set('a', live);
    const before = clone(live);

    live.x = 400;
    live.y = 250;

    stack.begin();
    stack.recordObject(change('symbols', 'a', before, clone(live)));
    stack.commit('move');

    stack.undo();
    expect(store.symbols.get('a')).toMatchObject({ x: 0, y: 0 });

    stack.redo();
    expect(store.symbols.get('a')).toMatchObject({ x: 400, y: 250 });
  });

  it('treats a batch as one step', () => {
    stack.begin();
    for (const id of ['a', 'b', 'c']) {
      stack.recordObject(change('symbols', id, clone(sym(id)), null));
    }
    stack.commit('delete many');

    stack.undo();
    expect(store.symbols.size).toBe(3);

    stack.undo(); // nothing left
    expect(stack.canUndo()).toBe(false);
    expect(store.symbols.size).toBe(3);
  });

  it('unwinds edits to one object in reverse order', () => {
    const s = sym('a');
    stack.begin();
    stack.recordObject(change('symbols', 'a', null, clone(s)));
    stack.recordObject(change('symbols', 'a', clone(s), clone({ ...s, scale: 2 })));
    stack.commit('add then scale');

    stack.undo();
    // The scale change reverts first, then the add — so it ends up removed, not orphaned.
    expect(store.calls).toEqual(['upd:a', 'del:a']);
    expect(store.symbols.has('a')).toBe(false);
  });

  it('drops forward history once a new edit lands', () => {
    stack.begin();
    stack.recordObject(change('symbols', 'a', null, clone(sym('a'))));
    stack.commit('first');
    stack.undo();
    expect(stack.canRedo()).toBe(true);

    stack.begin();
    stack.recordObject(change('symbols', 'b', null, clone(sym('b'))));
    stack.commit('second');
    expect(stack.canRedo()).toBe(false);
  });

  it('ignores an empty step', () => {
    stack.begin();
    stack.commit('nothing');
    expect(stack.canUndo()).toBe(false);
  });

  it('discards an aborted step', () => {
    stack.begin();
    stack.recordObject(change('symbols', 'a', null, clone(sym('a'))));
    stack.abort();
    stack.commit('should not exist');
    expect(stack.canUndo()).toBe(false);
  });
});
