import { CELL_SIZE, SpatialIndex, IndexedObject } from './spatial-index';

const obj = (id: string, x: number, y: number): IndexedObject => ({ id, x, y });

describe('spatial index', () => {
  it('finds objects inside a query rectangle', () => {
    const ix = new SpatialIndex();
    ix.insert(obj('a', 100, 100));
    ix.insert(obj('b', 5000, 5000));

    const hits = ix.query({ minX: 0, minY: 0, maxX: 500, maxY: 500 }).map(o => o.id);
    expect(hits).toContain('a');
    expect(hits).not.toContain('b');
  });

  it('handles negative coordinates without collapsing cells', () => {
    const ix = new SpatialIndex();
    ix.insert(obj('neg', -3000, -3000));
    ix.insert(obj('pos', 3000, 3000));

    // Truncation instead of flooring would file both into cell 0 and cross-contaminate.
    const negHits = ix.query({ minX: -4000, minY: -4000, maxX: -2000, maxY: -2000 }).map(o => o.id);
    expect(negHits).toEqual(['neg']);

    const posHits = ix.query({ minX: 2000, minY: 2000, maxX: 4000, maxY: 4000 }).map(o => o.id);
    expect(posHits).toEqual(['pos']);
  });

  /*
   * `get` replaced `data.symbols.find(...)` on the selection-drag path, where the scan cost
   * selection × total symbols on every pointer move. It has to survive the object moving, and
   * it has to hand back the *same instance* the document array holds — the drag mutates what
   * it gets back and expects the document to change with it.
   */
  describe('Nachschlagen per id', () => {
    it('findet ein Objekt und liefert dieselbe Instanz zurück', () => {
      const ix = new SpatialIndex();
      const o = obj('a', 100, 100);
      ix.insert(o);

      expect(ix.get('a')).toBe(o);
    });

    it('findet es auch nach einem Zellenwechsel wieder', () => {
      const ix = new SpatialIndex();
      const o = obj('mover', 100, 100);
      ix.insert(o);

      o.x = CELL_SIZE * 5 + 10;
      ix.update(o);

      expect(ix.get('mover')).toBe(o);
    });

    it('liefert undefined für Unbekanntes und für Entferntes', () => {
      const ix = new SpatialIndex();
      ix.insert(obj('a', 0, 0));

      expect(ix.get('gibtsnicht')).toBeUndefined();
      ix.remove('a');
      expect(ix.get('a')).toBeUndefined();
    });

    it('gibt nach rebuild die neuen Instanzen zurück', () => {
      const ix = new SpatialIndex();
      ix.insert(obj('a', 0, 0));

      const replacement = obj('a', 999, 999);
      ix.rebuild([replacement]);

      expect(ix.get('a')).toBe(replacement);
    });
  });

  it('re-files an object when it moves to another cell', () => {
    const ix = new SpatialIndex();
    const o = obj('mover', 100, 100);
    ix.insert(o);

    o.x = CELL_SIZE * 3 + 50;
    o.y = CELL_SIZE * 3 + 50;
    ix.update(o);

    // The stale entry is the bug to guard against: a moved symbol appearing in two places.
    expect(ix.query({ minX: 0, minY: 0, maxX: 500, maxY: 500 })).toHaveLength(0);
    expect(
      ix.query({
        minX: CELL_SIZE * 3,
        minY: CELL_SIZE * 3,
        maxX: CELL_SIZE * 4,
        maxY: CELL_SIZE * 4,
      }),
    ).toHaveLength(1);
    expect(ix.size).toBe(1);
  });

  it('keeps one entry when an object moves within its own cell', () => {
    const ix = new SpatialIndex();
    const o = obj('same', 10, 10);
    ix.insert(o);
    o.x = 20;
    ix.update(o);

    expect(ix.size).toBe(1);
    expect(ix.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 })).toHaveLength(1);
  });

  it('removes objects', () => {
    const ix = new SpatialIndex();
    ix.insert(obj('a', 10, 10));
    ix.remove('a');
    expect(ix.size).toBe(0);
    expect(ix.query({ minX: -1e6, minY: -1e6, maxX: 1e6, maxY: 1e6 })).toHaveLength(0);
  });

  it('ignores removal of an unknown id', () => {
    const ix = new SpatialIndex();
    expect(() => ix.remove('ghost')).not.toThrow();
  });

  it('rebuilds from a fresh collection', () => {
    const ix = new SpatialIndex();
    ix.insert(obj('old', 10, 10));
    ix.rebuild([obj('new1', 20, 20), obj('new2', 30, 30)]);

    expect(ix.size).toBe(2);
    const ids = ix.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 }).map(o => o.id);
    expect(ids).not.toContain('old');
  });

  it('finds the nearest object within a radius, across cell borders', () => {
    const ix = new SpatialIndex();
    // Straddle a cell boundary — the classic miss if the query is not expanded to cells.
    ix.insert(obj('left', CELL_SIZE - 5, 100));
    ix.insert(obj('right', CELL_SIZE + 5, 100));

    const near = ix.nearest(CELL_SIZE + 1, 100, 50);
    expect(near?.id).toBe('right');

    expect(ix.nearest(0, 100000, 50)).toBeNull();
  });

  it('spans every cell a wide query covers', () => {
    const ix = new SpatialIndex();
    for (let i = 0; i < 10; i++) ix.insert(obj(`o${i}`, i * CELL_SIZE, 0));

    const all = ix.query({ minX: 0, minY: -10, maxX: 9 * CELL_SIZE, maxY: 10 });
    expect(all).toHaveLength(10);
  });

  it('scales to a large population without scanning everything', () => {
    const ix = new SpatialIndex();
    for (let i = 0; i < 20000; i++) {
      ix.insert(obj(`s${i}`, (i % 200) * 500, Math.floor(i / 200) * 500));
    }
    expect(ix.size).toBe(20000);

    // A viewport-sized query must return a small slice, not the whole collection.
    const view = ix.query({ minX: 0, minY: 0, maxX: 1000, maxY: 1000 });
    expect(view.length).toBeGreaterThan(0);
    expect(view.length).toBeLessThan(1000);
  });
});
