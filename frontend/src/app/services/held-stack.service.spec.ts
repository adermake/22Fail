import { TestBed } from '@angular/core/testing';
import { HeldStackService } from './held-stack.service';
import { ItemBlock } from '../model/item-block.model';
import { stackAmount } from '../utils/item-stack.util';

function item(partial: Partial<ItemBlock> = {}): ItemBlock {
  return {
    name: 'Trank', itemType: 'consumable', weight: 0.5, stackable: true, amount: 1, ...partial,
  } as ItemBlock;
}

describe('Stapel in der Hand', () => {
  let svc: HeldStackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(HeldStackService);
  });

  describe('picking up', () => {
    it('left click takes the whole stack', () => {
      const left = svc.pickUpAll(item({ amount: 6 }), 'inventory');
      expect(left).toBeNull();
      expect(svc.heldAmount()).toBe(6);
      expect(svc.isHolding()).toBe(true);
    });

    it('right click takes the larger half and leaves the rest', () => {
      const left = svc.pickUpHalf(item({ amount: 5 }), 'inventory');
      expect(svc.heldAmount()).toBe(3);
      expect(stackAmount(left)).toBe(2);
    });

    it('right click on a single unit takes it whole', () => {
      const left = svc.pickUpHalf(item({ amount: 1 }), 'inventory');
      expect(svc.heldAmount()).toBe(1);
      expect(left).toBeNull();
    });

    it('right click on an unstackable item takes it whole', () => {
      const left = svc.pickUpHalf(item({ stackable: false }), 'inventory');
      expect(svc.heldAmount()).toBe(1);
      expect(left).toBeNull();
    });

    it('remembers where the stack came from', () => {
      svc.pickUpAll(item(), 'stash');
      expect(svc.held()!.from).toBe('stash');
    });
  });

  describe('dropping everything', () => {
    it('fills an empty slot and empties the hand', () => {
      svc.pickUpAll(item({ amount: 4 }), 'inventory');
      const slot = svc.dropAll(null);
      expect(stackAmount(slot)).toBe(4);
      expect(svc.isHolding()).toBe(false);
    });

    it('merges into a matching stack', () => {
      svc.pickUpAll(item({ amount: 4 }), 'inventory');
      const slot = svc.dropAll(item({ amount: 3 }));
      expect(stackAmount(slot)).toBe(7);
      expect(svc.isHolding()).toBe(false);
    });

    it('swaps with a different item, which lands in the hand', () => {
      svc.pickUpAll(item({ name: 'Trank', amount: 2 }), 'inventory');
      const slot = svc.dropAll(item({ name: 'Seil', amount: 1 }));
      expect(slot!.name).toBe('Trank');
      expect(svc.heldItem()!.name).toBe('Seil');
    });

    it('does nothing with an empty hand', () => {
      const existing = item({ amount: 2 });
      expect(svc.dropAll(existing)).toBe(existing);
    });
  });

  describe('dropping one', () => {
    it('places a single unit in an empty slot and keeps the rest', () => {
      svc.pickUpAll(item({ amount: 4 }), 'inventory');
      const slot = svc.dropOne(null);
      expect(stackAmount(slot)).toBe(1);
      expect(svc.heldAmount()).toBe(3);
    });

    it('adds one to a matching stack', () => {
      svc.pickUpAll(item({ amount: 4 }), 'inventory');
      const slot = svc.dropOne(item({ amount: 2 }));
      expect(stackAmount(slot)).toBe(3);
      expect(svc.heldAmount()).toBe(3);
    });

    it('empties the hand when the last unit is placed', () => {
      svc.pickUpAll(item({ amount: 1 }), 'inventory');
      const slot = svc.dropOne(null);
      expect(stackAmount(slot)).toBe(1);
      expect(svc.isHolding()).toBe(false);
    });

    it('refuses a slot holding something else, changing nothing', () => {
      svc.pickUpAll(item({ name: 'Trank', amount: 4 }), 'inventory');
      const other = item({ name: 'Seil' });
      expect(svc.dropOne(other)).toBe(other);
      expect(svc.heldAmount()).toBe(4);
    });

    it('conserves units across a full one-by-one unload', () => {
      svc.pickUpAll(item({ amount: 3 }), 'inventory');
      let slot: ItemBlock | null = null;
      for (let i = 0; i < 3; i++) slot = svc.dropOne(slot);
      expect(stackAmount(slot)).toBe(3);
      expect(svc.isHolding()).toBe(false);
    });
  });

  describe('partial commits', () => {
    it('takes a fixed count out of the hand', () => {
      svc.pickUpAll(item({ amount: 5 }), 'inventory');
      const taken = svc.takeHeld(2);
      expect(stackAmount(taken)).toBe(2);
      expect(svc.heldAmount()).toBe(3);
    });

    it('empties the hand when everything is taken', () => {
      svc.pickUpAll(item({ amount: 5 }), 'inventory');
      expect(stackAmount(svc.takeHeld(5))).toBe(5);
      expect(svc.isHolding()).toBe(false);
    });

    it('hands the whole stack back on clear', () => {
      svc.pickUpAll(item({ amount: 5 }), 'inventory');
      expect(stackAmount(svc.clear())).toBe(5);
      expect(svc.isHolding()).toBe(false);
    });
  });
});
