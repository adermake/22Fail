import { TestBed } from '@angular/core/testing';
import { DragSplitService } from './drag-split.service';
import { ItemBlock } from '../model/item-block.model';

function item(partial: Partial<ItemBlock> = {}): ItemBlock {
  return {
    name: 'Pfeil', itemType: 'other', weight: 0.1, stackable: true, amount: 1, ...partial,
  } as ItemBlock;
}

describe('Teilen beim Ziehen', () => {
  let svc: DragSplitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(DragSplitService);
  });

  describe('starting a drag', () => {
    it('carries the whole pile until something changes it', () => {
      svc.begin(item({ amount: 10 }));
      expect(svc.total()).toBe(10);
      expect(svc.carried()).toBe(10);
      expect(svc.leftover()).toBe(0);
      expect(svc.isSplit()).toBe(false);
      expect(svc.isDragging()).toBe(true);
    });

    it('marks a single unit as unsplittable', () => {
      svc.begin(item({ amount: 1 }));
      expect(svc.splittable()).toBe(false);
    });

    it('marks an unstackable item as unsplittable', () => {
      svc.begin(item({ stackable: false, amount: 5 }));
      expect(svc.splittable()).toBe(false);
    });
  });

  describe('typing a count', () => {
    beforeEach(() => svc.begin(item({ amount: 10 })));

    it('takes the number typed and leaves the rest behind', () => {
      svc.setCarried(3);
      expect(svc.carried()).toBe(3);
      expect(svc.leftover()).toBe(7);
      expect(svc.isSplit()).toBe(true);
    });

    it('clamps above the pile', () => {
      svc.setCarried(99);
      expect(svc.carried()).toBe(10);
      expect(svc.leftover()).toBe(0);
    });

    it('allows zero — everything stays behind', () => {
      svc.setCarried(0);
      expect(svc.carried()).toBe(0);
      expect(svc.leftover()).toBe(10);
    });

    it('never goes negative', () => {
      svc.setCarried(-5);
      expect(svc.carried()).toBe(0);
    });

    it('ignores nonsense instead of blanking the count', () => {
      svc.setCarried(NaN);
      expect(svc.carried()).toBe(10);
    });

    it('floors a fraction', () => {
      svc.setCarried(3.9);
      expect(svc.carried()).toBe(3);
    });

    it('does nothing when no drag is running', () => {
      svc.reset();
      svc.setCarried(5);
      expect(svc.carried()).toBe(0);
    });
  });

  describe('right-clicking units into slots', () => {
    beforeEach(() => svc.begin(item({ amount: 10 })));

    it('moves one unit off the cursor per click', () => {
      expect(svc.parkOne(4)).toBe(true);
      expect(svc.carried()).toBe(9);
      expect(svc.parkedAt(4)).toBe(1);
      expect(svc.parkedCount()).toBe(1);
    });

    it('stacks repeated clicks on the same slot', () => {
      svc.parkOne(4);
      svc.parkOne(4);
      svc.parkOne(4);
      expect(svc.parkedAt(4)).toBe(3);
      expect(svc.carried()).toBe(7);
    });

    it('spreads across several slots', () => {
      svc.parkOne(1);
      svc.parkOne(2);
      expect(svc.parkedAt(1)).toBe(1);
      expect(svc.parkedAt(2)).toBe(1);
      expect(svc.parkedCount()).toBe(2);
    });

    it('stops once the cursor is empty', () => {
      for (let i = 0; i < 10; i++) expect(svc.parkOne(1)).toBe(true);
      expect(svc.carried()).toBe(0);
      expect(svc.parkOne(1)).toBe(false);
      expect(svc.parkedCount()).toBe(10);
    });

    it('conserves the pile: carried + parked + leftover always equals the total', () => {
      svc.setCarried(6); // 4 left behind
      svc.parkOne(1);
      svc.parkOne(2);
      expect(svc.carried() + svc.parkedCount() + svc.leftover()).toBe(10);
    });

    it('does not let a typed count reclaim units already placed', () => {
      svc.parkOne(1);
      svc.parkOne(2);
      svc.setCarried(99);
      expect(svc.carried()).toBe(8);
      expect(svc.leftover()).toBe(0);
    });

    it('does nothing without a drag', () => {
      svc.reset();
      expect(svc.parkOne(1)).toBe(false);
    });
  });

  describe('surviving the drop handler', () => {
    // Angular CDK emits `ended` BEFORE `dropped`. Everything that moves units runs in the drop
    // handler, so the counts have to still be readable after the drag has "finished".
    it('still reports the split count synchronously after finishDrag', () => {
      svc.begin(item({ amount: 10 }));
      svc.setCarried(3);

      expect(svc.finishDrag()).toBe(3);

      expect(svc.isSplit()).toBe(true);
      expect(svc.carried()).toBe(3);
      expect(svc.total()).toBe(10);
      expect(svc.leftover()).toBe(7);
    });

    it('still reports parked units after finishDrag', () => {
      svc.begin(item({ amount: 5 }));
      svc.parkOne(2);
      svc.finishDrag();
      expect(svc.parkedAt(2)).toBe(1);
    });

    it('clears itself once the tick is over', async () => {
      svc.begin(item({ amount: 10 }));
      svc.setCarried(3);
      svc.finishDrag();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(svc.isDragging()).toBe(false);
      expect(svc.carried()).toBe(0);
      expect(svc.parkedCount()).toBe(0);
    });

    it('a new drag starts clean even if the cleanup has not run yet', () => {
      svc.begin(item({ amount: 10 }));
      svc.setCarried(3);
      svc.parkOne(1);
      svc.finishDrag();

      svc.begin(item({ amount: 4 }));
      expect(svc.total()).toBe(4);
      expect(svc.carried()).toBe(4);
      expect(svc.parkedCount()).toBe(0);
      expect(svc.isSplit()).toBe(false);
    });

    it('does not wipe the fresh drag when the old cleanup fires', async () => {
      svc.begin(item({ amount: 10 }));
      svc.finishDrag();
      svc.begin(item({ amount: 6 }));

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(svc.total()).toBe(6);
      expect(svc.isDragging()).toBe(true);
    });
  });
});
