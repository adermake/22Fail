/**
 * The audit view's geometry, and the hit-test rule that made symbols selectable again.
 *
 * The selection bug this pins was not subtle in effect — symbols simply could not be picked
 * in the Geheimnisse tab — but it was invisible in the code: labels were checked first and
 * won unconditionally, and a label's reach was a *circle* of half its longest side. A name
 * stretched across a valley therefore claimed a radius of half its own width in every
 * direction, swallowing every icon anywhere near it.
 */

import { describe, expect, it } from 'vitest';
import { boundsOverlap, padBounds, unionBounds } from './secret-overview';
import { ScoredHit, pickTightest } from './map-secrets';
import { LabelView } from './label-view';
import { MapLabel } from './map-editor.model';
import { Bounds } from './map-camera';

const box = (minX: number, minY: number, maxX: number, maxY: number): Bounds => ({
  minX,
  minY,
  maxX,
  maxY,
});

describe('Übersicht: Rahmen', () => {
  it('fasst mehrere Mitglieder zu einem Rahmen zusammen', () => {
    expect(unionBounds([box(0, 0, 10, 10), box(50, -20, 60, 5)])).toEqual(box(0, -20, 60, 10));
  });

  it('gibt für eine leere Gruppe keinen Rahmen', () => {
    // A group whose members all scrolled off screen must draw nothing, not a rectangle at
    // the origin — which is what a naive reduce over an empty list produces.
    expect(unionBounds([])).toBeNull();
  });

  it('behält einen einzelnen Kasten unverändert', () => {
    expect(unionBounds([box(3, 4, 5, 6)])).toEqual(box(3, 4, 5, 6));
  });

  it('polstert in alle vier Richtungen', () => {
    expect(padBounds(box(0, 0, 10, 10), 2)).toEqual(box(-2, -2, 12, 12));
  });

  it('erkennt Überlappung, auch bei bloßer Berührung', () => {
    expect(boundsOverlap(box(0, 0, 10, 10), box(5, 5, 20, 20))).toBe(true);
    // Touching counts: a group exactly on the viewport edge is half visible, so drawing it
    // is right and culling it would pop the frame away as you pan onto it.
    expect(boundsOverlap(box(0, 0, 10, 10), box(10, 10, 20, 20))).toBe(true);
    expect(boundsOverlap(box(0, 0, 10, 10), box(11, 0, 20, 10))).toBe(false);
    expect(boundsOverlap(box(0, 0, 10, 10), box(0, 11, 10, 20))).toBe(false);
  });
});

/**
 * The arbitration rule.
 *
 * Score is "how deep inside its own shape the click falls": 0 dead centre, 1 on the edge.
 * Comparing those instead of ranking by collection is what lets a click land on the castle
 * rather than on the label that happens to span it.
 */
describe('Treffer über Kategorien hinweg', () => {
  const label = (score: number): ScoredHit => ({ c: 'labels', id: 'l1', score });
  const symbol = (score: number): ScoredHit => ({ c: 'symbols', id: 's1', score });
  const region = (score: number): ScoredHit => ({ c: 'regions', id: 'r1', score });

  it('nimmt das Symbol, wenn der Klick tiefer in ihm sitzt', () => {
    // Exactly the case that was broken: a huge label barely contains the point (0.95),
    // a symbol sits squarely under the cursor (0.1).
    expect(pickTightest([label(0.95), symbol(0.1), null])).toEqual({ c: 'symbols', id: 's1' });
  });

  it('nimmt die Beschriftung, wenn der Klick auf ihr sitzt', () => {
    expect(pickTightest([label(0.1), symbol(0.9), null])).toEqual({ c: 'labels', id: 'l1' });
  });

  it('zieht bei Gleichstand das Obenliegende vor', () => {
    expect(pickTightest([label(0.4), symbol(0.4), region(0.4)])).toEqual({
      c: 'labels',
      id: 'l1',
    });
    expect(pickTightest([null, symbol(0.4), region(0.4)])).toEqual({ c: 'symbols', id: 's1' });
  });

  it('nimmt die Region nur, wenn sonst nichts trifft', () => {
    expect(pickTightest([null, null, region(0.8)])).toEqual({ c: 'regions', id: 'r1' });
  });

  it('meldet Leerraum als Treffer auf nichts', () => {
    expect(pickTightest([null, null, null])).toBeNull();
  });

  it('ignoriert einen unendlichen Wert statt ihn zu gewinnen zu lassen', () => {
    // Infinity is how "no hit" arrives from a distance calculation; it must never be picked
    // just because it is the only entry.
    expect(pickTightest([{ c: 'labels', id: 'l1', score: Infinity }])).toBeNull();
  });
});

/**
 * A label's reach.
 *
 * `LabelView` needs a real Pixi container to bake glyph bounds, so this exercises the shape
 * of the rule on the pre-render fallback instead — which is the same ellipse, and is what a
 * freshly loaded map uses before anything has been drawn.
 */
describe('Reichweite einer Beschriftung', () => {
  const view = new LabelView();
  const wide: MapLabel = {
    id: 'l1',
    x: 0,
    y: 0,
    vis: 'public',
    text: 'Das Nördliche Königreich',
    rotation: 0,
    style: {
      fontFamily: 'serif',
      fontSize: 100,
      fill: '#fff',
      outline: '#000',
      outlineWidth: 4,
      curvature: 0,
      letterSpacing: 0,
    },
  };

  it('reicht waagerecht weiter als senkrecht', () => {
    const { rx, ry } = view.halfExtents(wide);
    // The whole bug in one assertion: a circle would make these equal, and the vertical
    // reach would balloon to half the text's width, swallowing every symbol above and below.
    expect(rx).toBeGreaterThan(ry * 3);
  });

  it('umschließt einen Punkt neben dem Text, aber nicht weit darüber', () => {
    view.rebuild([wide]);
    const { rx, ry } = view.halfExtents(wide);

    expect(view.hitTest(rx * 0.8, 0)).not.toBeNull();
    // Straight up, well past the glyphs but well inside what a circle of radius rx covered.
    expect(view.hitTest(0, ry * 2)).toBeNull();
  });

  it('bleibt für winzige Beschriftungen anklickbar', () => {
    const tiny: MapLabel = { ...wide, id: 'l2', text: 'A', style: { ...wide.style, fontSize: 1 } };
    const { rx, ry } = view.halfExtents(tiny);
    // A minimum reach, or a small label at low zoom becomes impossible to hit.
    expect(Math.min(rx, ry)).toBeGreaterThanOrEqual(8);
  });
});
