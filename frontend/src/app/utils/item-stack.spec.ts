import {
  canMerge, identityKey, mergeAllStacks, mergeStacks, splitHalf, stackAmount, takeFrom, withAmount,
} from './item-stack.util';
import { ItemBlock } from '../model/item-block.model';

function item(partial: Partial<ItemBlock> = {}): ItemBlock {
  return {
    name: 'Trank', itemType: 'consumable', weight: 0.5, stackable: true, amount: 1,
    ...partial,
  } as ItemBlock;
}

describe('Stapel', () => {
  describe('stackAmount', () => {
    it('counts a stackable pile', () => {
      expect(stackAmount(item({ amount: 7 }))).toBe(7);
    });

    it('treats an unstackable item as exactly one, whatever amount says', () => {
      expect(stackAmount(item({ stackable: false, amount: 9 }))).toBe(1);
    });

    it('defaults a stackable item with no amount to one', () => {
      expect(stackAmount(item({ amount: undefined }))).toBe(1);
    });

    it('is zero for nothing', () => {
      expect(stackAmount(null)).toBe(0);
    });
  });

  describe('identity', () => {
    it('ignores id and amount — two piles of the same potion are the same kind', () => {
      expect(identityKey(item({ id: 'a', amount: 1 }))).toBe(identityKey(item({ id: 'b', amount: 9 })));
    });

    it('separates items that differ in any real field', () => {
      expect(identityKey(item({ name: 'Trank' }))).not.toBe(identityKey(item({ name: 'Gift' })));
      expect(identityKey(item({ script: 'a' }))).not.toBe(identityKey(item({ script: 'b' })));
      expect(identityKey(item({ value: 5 }))).not.toBe(identityKey(item({ value: 6 })));
    });

    it('does not care about field order', () => {
      const a = { name: 'X', weight: 1, stackable: true } as ItemBlock;
      const b = { stackable: true, weight: 1, name: 'X' } as ItemBlock;
      expect(identityKey(a)).toBe(identityKey(b));
    });

    it('treats a missing field and an undefined one alike', () => {
      const a = item({ description: undefined });
      const b = item();
      delete (b as Partial<ItemBlock>).description;
      expect(identityKey(a)).toBe(identityKey(b));
    });
  });

  describe('canMerge', () => {
    it('merges two identical stackable piles', () => {
      expect(canMerge(item({ amount: 2 }), item({ amount: 3 }))).toBe(true);
    });

    it('refuses when either side is not stackable', () => {
      expect(canMerge(item({ stackable: false }), item())).toBe(false);
      expect(canMerge(item(), item({ stackable: false }))).toBe(false);
    });

    it('refuses different items', () => {
      expect(canMerge(item({ name: 'Trank' }), item({ name: 'Seil' }))).toBe(false);
    });

    it('refuses a damaged copy of the same item', () => {
      expect(canMerge(item({ durability: 10 }), item({ durability: 3 }))).toBe(false);
    });

    it('refuses nothing', () => {
      expect(canMerge(null, item())).toBe(false);
    });
  });

  describe('splitHalf', () => {
    it('splits an even pile down the middle', () => {
      expect(splitHalf(8)).toEqual({ taken: 4, left: 4 });
    });

    it('takes the larger half of an odd pile', () => {
      expect(splitHalf(5)).toEqual({ taken: 3, left: 2 });
    });

    it('takes the single unit of a pile of one', () => {
      expect(splitHalf(1)).toEqual({ taken: 1, left: 0 });
    });

    it('handles nothing', () => {
      expect(splitHalf(0)).toEqual({ taken: 0, left: 0 });
    });
  });

  describe('mergeStacks', () => {
    it('adds the amounts', () => {
      const { merged, leftover } = mergeStacks(item({ amount: 2 }), item({ amount: 3 }));
      expect(merged.amount).toBe(5);
      expect(leftover).toBeNull();
    });

    it('hands the source back untouched when the two do not match', () => {
      const source = item({ name: 'Seil' });
      const { merged, leftover } = mergeStacks(item({ amount: 2 }), source);
      expect(merged.amount).toBe(2);
      expect(leftover).toBe(source);
    });
  });

  describe('mergeAllStacks', () => {
    it('folds identical piles into the first slot that holds them', () => {
      const slots = [item({ amount: 2 }), null, item({ amount: 3 }), item({ name: 'Seil' })];
      const out = mergeAllStacks(slots);
      expect(stackAmount(out[0])).toBe(5);
      expect(out[2]).toBeNull();
      expect(out[3]!.name).toBe('Seil');
    });

    it('keeps surviving stacks in their original slots', () => {
      const slots = [null, item({ amount: 1 }), null, item({ amount: 1 })];
      const out = mergeAllStacks(slots);
      expect(out[0]).toBeNull();
      expect(stackAmount(out[1])).toBe(2);
      expect(out[3]).toBeNull();
    });

    it('never merges unstackable items', () => {
      const slots = [item({ stackable: false }), item({ stackable: false })];
      const out = mergeAllStacks(slots);
      expect(out.filter(Boolean).length).toBe(2);
    });

    it('leaves a list with nothing to merge alone', () => {
      const slots = [item({ name: 'A' }), item({ name: 'B' })];
      expect(mergeAllStacks(slots).filter(Boolean).length).toBe(2);
    });

    it('does not mutate the input', () => {
      const slots = [item({ amount: 2 }), item({ amount: 3 })];
      mergeAllStacks(slots);
      expect(slots[1]).not.toBeNull();
      expect(slots[0]!.amount).toBe(2);
    });
  });

  describe('takeFrom', () => {
    it('takes part of a pile', () => {
      const { taken, left } = takeFrom(item({ amount: 5 }), 2);
      expect(stackAmount(taken)).toBe(2);
      expect(stackAmount(left)).toBe(3);
    });

    it('takes the whole pile and leaves nothing', () => {
      const { taken, left } = takeFrom(item({ amount: 3 }), 3);
      expect(stackAmount(taken)).toBe(3);
      expect(left).toBeNull();
    });

    it('never takes more than there is', () => {
      const { taken, left } = takeFrom(item({ amount: 2 }), 99);
      expect(stackAmount(taken)).toBe(2);
      expect(left).toBeNull();
    });

    it('takes nothing for a count of zero', () => {
      const { taken, left } = takeFrom(item({ amount: 2 }), 0);
      expect(taken).toBeNull();
      expect(stackAmount(left)).toBe(2);
    });

    it('conserves units — nothing is created or destroyed', () => {
      for (const count of [0, 1, 2, 3, 4, 5, 6]) {
        const { taken, left } = takeFrom(item({ amount: 5 }), count);
        expect(stackAmount(taken) + stackAmount(left)).toBe(5);
      }
    });
  });

  describe('withAmount', () => {
    it('never writes an amount below one', () => {
      expect(withAmount(item(), 0).amount).toBe(1);
    });

    it('forces an unstackable item to one', () => {
      expect(withAmount(item({ stackable: false }), 5).amount).toBe(1);
    });

    it('copies rather than mutating', () => {
      const original = item({ amount: 2 });
      withAmount(original, 7);
      expect(original.amount).toBe(2);
    });
  });
});
