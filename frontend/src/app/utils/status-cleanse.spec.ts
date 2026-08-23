import { cleanseEffect, cleanseFromList } from './status-cleanse.util';

interface Fx { statusEffectId: string; stacks?: number; duration?: number }

describe('removeStatus mit Menge', () => {
  describe('one effect', () => {
    it('removes the whole effect without an amount', () => {
      expect(cleanseEffect({ stacks: 5 })).toBeNull();
    });

    it('treats zero and negatives as "remove it all"', () => {
      expect(cleanseEffect({ stacks: 5 }, 0)).toBeNull();
      expect(cleanseEffect({ stacks: 5 }, -2)).toBeNull();
    });

    it('cleanses stacks down', () => {
      expect(cleanseEffect({ stacks: 5 }, 2)).toEqual({ stacks: 3 });
    });

    it('removes the effect when the last stack is cleansed', () => {
      expect(cleanseEffect({ stacks: 3 }, 3)).toBeNull();
      expect(cleanseEffect({ stacks: 3 }, 9)).toBeNull();
    });

    it('cleanses duration when the effect does not stack', () => {
      expect(cleanseEffect({ stacks: 1, duration: 6 }, 2)).toEqual({ stacks: 1, duration: 4 });
    });

    it('removes an unstacked effect once its duration runs out', () => {
      expect(cleanseEffect({ stacks: 1, duration: 3 }, 3)).toBeNull();
      expect(cleanseEffect({ duration: 2 }, 5)).toBeNull();
    });

    it('removes an unstacked, undurated effect — otherwise it could never be cleansed', () => {
      expect(cleanseEffect({ stacks: 1 }, 1)).toBeNull();
      expect(cleanseEffect({}, 1)).toBeNull();
    });

    it('prefers stacks over duration while stacks remain', () => {
      expect(cleanseEffect({ stacks: 4, duration: 10 }, 1)).toEqual({ stacks: 3, duration: 10 });
    });

    it('keeps every other field of the effect', () => {
      const fx = { statusEffectId: 'fx_a', stacks: 3, customName: 'Gift' };
      expect(cleanseEffect(fx, 1)).toEqual({ statusEffectId: 'fx_a', stacks: 2, customName: 'Gift' });
    });

    it('floors a fractional amount', () => {
      expect(cleanseEffect({ stacks: 5 }, 2.9)).toEqual({ stacks: 3 });
    });
  });

  describe('in a list', () => {
    const list = (): Fx[] => [
      { statusEffectId: 'fx_gift', stacks: 4 },
      { statusEffectId: 'fx_segen', stacks: 1, duration: 5 },
    ];

    it('reduces the matching entry in place, leaving the others alone', () => {
      const res = cleanseFromList(list(), e => e.statusEffectId === 'fx_gift', 1);
      expect(res.changed).toBe(true);
      expect(res.list[0]).toEqual({ statusEffectId: 'fx_gift', stacks: 3 });
      expect(res.list[1]).toEqual({ statusEffectId: 'fx_segen', stacks: 1, duration: 5 });
    });

    it('drops the entry when nothing is left', () => {
      const res = cleanseFromList(list(), e => e.statusEffectId === 'fx_gift', 4);
      expect(res.list.map(e => e.statusEffectId)).toEqual(['fx_segen']);
    });

    it('drops the entry entirely without an amount', () => {
      const res = cleanseFromList(list(), e => e.statusEffectId === 'fx_segen');
      expect(res.list.map(e => e.statusEffectId)).toEqual(['fx_gift']);
    });

    it('reports no change when nothing matches', () => {
      const res = cleanseFromList(list(), e => e.statusEffectId === 'fx_nope', 2);
      expect(res.changed).toBe(false);
      expect(res.list.length).toBe(2);
    });

    it('does not mutate the list it was given', () => {
      const original = list();
      cleanseFromList(original, e => e.statusEffectId === 'fx_gift', 4);
      expect(original.length).toBe(2);
      expect(original[0].stacks).toBe(4);
    });

    it('only cleanses the first match', () => {
      const doubled: Fx[] = [
        { statusEffectId: 'fx_gift', stacks: 2 },
        { statusEffectId: 'fx_gift', stacks: 2 },
      ];
      const res = cleanseFromList(doubled, e => e.statusEffectId === 'fx_gift', 2);
      expect(res.list.length).toBe(1);
    });
  });
});
