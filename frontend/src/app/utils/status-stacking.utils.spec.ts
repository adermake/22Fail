import { applyStacking, StackableEffect } from './status-stacking.utils';

const fx = (id: string, duration: number | undefined, stacks = 1): StackableEffect =>
  ({ statusEffectId: id, duration, stacks });

describe('status stacking', () => {
  it('adds a new instance when nothing matches', () => {
    const { list, changed, merged } = applyStacking([], fx('poison', 3), 5);
    expect(changed).toBe(true);
    expect(merged).toBe(false);
    expect(list.length).toBe(1);
  });

  it('merges stacks when effect AND duration match', () => {
    const start = [fx('poison', 3, 2)];
    const { list, changed, merged } = applyStacking(start, fx('poison', 3, 1), 5);
    expect(changed).toBe(true);
    expect(merged).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0].stacks).toBe(3);
  });

  it('keeps instances separate when the duration differs', () => {
    const start = [fx('poison', 3, 2)];
    const { list, merged } = applyStacking(start, fx('poison', 1, 1), 5);
    expect(merged).toBe(false);
    expect(list.length).toBe(2);
    expect(list[0].stacks).toBe(2);
    expect(list[1].duration).toBe(1);
  });

  it('treats undefined (permanent) duration as its own bucket', () => {
    const start = [fx('poison', undefined, 1)];
    expect(applyStacking(start, fx('poison', undefined, 1), 5).list.length).toBe(1);
    expect(applyStacking(start, fx('poison', 2, 1), 5).list.length).toBe(2);
  });

  it('respects maxStacks and reports no change at the cap', () => {
    const start = [fx('poison', 3, 3)];
    const capped = applyStacking(start, fx('poison', 3, 1), 3);
    expect(capped.changed).toBe(false);
    expect(capped.list[0].stacks).toBe(3);

    // A partial merge clamps rather than overshooting.
    const partial = applyStacking([fx('poison', 3, 2)], fx('poison', 3, 5), 3);
    expect(partial.list[0].stacks).toBe(3);
  });

  it('clamps a brand-new instance to the cap', () => {
    const { list } = applyStacking([], fx('poison', 3, 9), 2);
    expect(list[0].stacks).toBe(2);
  });

  it('does not merge different effects sharing a duration', () => {
    const { list } = applyStacking([fx('poison', 3, 1)], fx('burn', 3, 1), 5);
    expect(list.length).toBe(2);
  });
});
