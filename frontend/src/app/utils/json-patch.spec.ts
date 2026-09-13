import { describe, expect, it } from 'vitest';
import { applyJsonPatchTo } from './json-patch.util';

describe('applyJsonPatchTo', () => {
  it('sets a top-level key', () => {
    const target: any = {};
    applyJsonPatchTo(target, { path: 'name', value: 'Karte' });
    expect(target.name).toBe('Karte');
  });

  it('treats slash and dot paths the same', () => {
    const a: any = { map: { strokes: [] } };
    const b: any = { map: { strokes: [] } };
    applyJsonPatchTo(a, { path: '/map/strokes', value: [1] });
    applyJsonPatchTo(b, { path: 'map.strokes', value: [1] });
    expect(a).toEqual(b);
  });

  it('appends with a trailing dash', () => {
    const target: any = { strokes: [{ id: 'a' }] };
    applyJsonPatchTo(target, { path: 'strokes/-', value: { id: 'b' } });
    expect(target.strokes.map((s: any) => s.id)).toEqual(['a', 'b']);
  });

  it('keeps two appends instead of letting one overwrite the other', () => {
    // The disappearing-drawings case: two clients each adding a stroke.
    const target: any = { strokes: [] };
    applyJsonPatchTo(target, { path: 'strokes/-', value: { id: 'mine' } });
    applyJsonPatchTo(target, { path: 'strokes/-', value: { id: 'theirs' } });
    expect(target.strokes).toHaveLength(2);
  });

  it('creates an array when the next segment appends into a missing one', () => {
    // Defaulting to {} here stored the value under a literal '-' key and lost it.
    const target: any = {};
    applyJsonPatchTo(target, { path: 'strokes/-', value: { id: 'a' } });
    expect(Array.isArray(target.strokes)).toBe(true);
    expect(target.strokes).toEqual([{ id: 'a' }]);
  });

  it('creates an array when the next segment indexes a missing one', () => {
    const target: any = {};
    applyJsonPatchTo(target, { path: 'tokens/0', value: { id: 't' } });
    expect(Array.isArray(target.tokens)).toBe(true);
    expect(target.tokens[0]).toEqual({ id: 't' });
  });

  it('creates an object for a non-array segment', () => {
    const target: any = {};
    applyJsonPatchTo(target, { path: 'settings/grid/size', value: 5 });
    expect(target.settings.grid.size).toBe(5);
  });

  it('replaces an element by index', () => {
    const target: any = { strokes: [{ id: 'a' }, { id: 'b' }] };
    applyJsonPatchTo(target, { path: 'strokes/1', value: { id: 'c' } });
    expect(target.strokes.map((s: any) => s.id)).toEqual(['a', 'c']);
  });

  it('reaches through an array index into an object', () => {
    const target: any = { strokes: [{ id: 'a', color: '#fff' }] };
    applyJsonPatchTo(target, { path: 'strokes/0/color', value: '#000' });
    expect(target.strokes[0].color).toBe('#000');
  });

  it('replaces a whole array when addressed directly', () => {
    const target: any = { strokes: [{ id: 'a' }] };
    applyJsonPatchTo(target, { path: 'strokes', value: [] });
    expect(target.strokes).toEqual([]);
  });
});
