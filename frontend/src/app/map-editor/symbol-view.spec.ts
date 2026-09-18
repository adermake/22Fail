import { Texture } from 'pixi.js';
import { SymbolView } from './symbol-view';
import { MapAssets } from './map-assets';
import { MapSymbol } from './map-editor.model';

/** Enough of the asset library for the view to place a sprite. */
const assets = {
  meta: () => ({ w: 100, h: 100, offsetX: 0, offsetY: 0, radius: 50, colorable: false }),
  sprite: () => Texture.EMPTY,
} as unknown as MapAssets;

function symbol(over: Partial<MapSymbol> = {}): MapSymbol {
  return {
    id: 's1',
    x: 0,
    y: 0,
    vis: 'public',
    asset: 'misc/a/b',
    group: 'misc/a',
    scale: 1,
    rotation: 0,
    ...over,
  };
}

const VIEW = { minX: -500, minY: -500, maxX: 500, maxY: 500 };

/**
 * Resizing a placed symbol.
 *
 * The edit reaches the screen by a chain with several links: the op mutates the document
 * object, the spatial index holds *that same instance*, and the view reads `scale` off it on
 * the next render. Any link storing a copy instead of the reference breaks resizing silently
 * — the document is right and the map never changes.
 */
describe('SymbolView — Größe ändern', () => {
  it('zeichnet eine geänderte Größe beim nächsten Rendern', () => {
    const view = new SymbolView(assets);
    const sym = symbol();
    view.rebuild([sym]);
    view.render(VIEW, 1, true);

    // Exactly what an `upd` op does to the document object.
    sym.scale = 3;
    view.update(sym);
    view.render(VIEW, 1, true);

    const sprite = view.container.children[0] as { scale: { x: number; y: number } };
    expect(sprite.scale.x).toBe(3);
  });

  it('teilt sich die Instanz mit dem Dokument', () => {
    const view = new SymbolView(assets);
    const sym = symbol();
    view.rebuild([sym]);
    // The index must hand back the very object it was given, not a copy: every edit path
    // mutates the document's instance and expects the view to see it.
    expect(view.index.get('s1')).toBe(sym);
  });

  it('spiegelt beim Skalieren weiter korrekt', () => {
    const view = new SymbolView(assets);
    const sym = symbol({ flipX: true, scale: 2 });
    view.rebuild([sym]);
    view.render(VIEW, 1, true);

    const sprite = view.container.children[0] as { scale: { x: number; y: number } };
    expect(sprite.scale.x).toBe(-2);
    expect(sprite.scale.y).toBe(2);
  });
});

/**
 * Index drift.
 *
 * The spatial index caches *references* to the document's objects. A reconnect or a reload
 * replaces the document, and from then on the index holds instances nothing writes to any
 * more. Editing through the index then reads a stale copy, writes to the live one, and
 * refreshes the view from the stale one — the document ends up correct and the map never
 * moves, which is what "the resize buttons do nothing" looks like from the outside.
 */
describe('SymbolView — veralteter Index', () => {
  it('zeigt weiter den alten Wert, wenn nur die Dokumentkopie geändert wird', () => {
    const view = new SymbolView(assets);
    const stale = symbol();
    view.rebuild([stale]);
    view.render(VIEW, 1, true);

    // A fresh document object with the same id — what a reload produces.
    const live = symbol({ scale: 4 });
    expect(live).not.toBe(stale);
    view.update(stale);
    view.render(VIEW, 1, true);

    const sprite = view.container.children[0] as { scale: { x: number; y: number } };
    // Refreshing from the stale instance cannot show the new size; the fix is to edit and
    // refresh from the document object instead.
    expect(sprite.scale.x).toBe(1);

    view.update(live);
    view.render(VIEW, 1, true);
    expect(sprite.scale.x).toBe(4);
  });
});
