import { describe, expect, it } from 'vitest';
import { Stroke, isStrokeBy } from './lobby.model';

const stroke = (author?: string): Stroke => ({
  id: 's1', points: [], color: '#fff', lineWidth: 2, isEraser: false, author,
});

describe('isStrokeBy', () => {
  it('matches the author who drew it', () => {
    expect(isStrokeBy(stroke('Mara'), 'Mara', false)).toBe(true);
  });

  it('does not match anyone else', () => {
    expect(isStrokeBy(stroke('Mara'), 'Jon', false)).toBe(false);
    // Not even the GM "owns" it — the GM clears everything via scope 'all' instead.
    expect(isStrokeBy(stroke('Mara'), 'Jon', true)).toBe(false);
  });

  it('gives unsigned legacy strokes to the GM', () => {
    expect(isStrokeBy(stroke(undefined), 'Jon', true)).toBe(true);
    expect(isStrokeBy(stroke(undefined), 'Jon', false)).toBe(false);
  });

  it('does not hand legacy strokes to a signed-out viewer', () => {
    // The empty-name case is the trap: a plain equality check would make every unsigned stroke
    // belong to anyone who is not signed in.
    expect(isStrokeBy(stroke(undefined), '', false)).toBe(false);
    expect(isStrokeBy(stroke(''), '', false)).toBe(false);
  });
});
