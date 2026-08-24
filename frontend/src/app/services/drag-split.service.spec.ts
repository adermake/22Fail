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
      expect(svc.taken()).toBe(10);
      expect(svc.isSplit()).toBe(false);
      expect(svc.isDragging()).toBe(true);
    });

    it('marks a single unit as unsplittable', () => {
      svc.begin(item({ amount: 1 }));
      expect(svc.splittable()).toBe(false);
      expect(svc.canHalf()).toBe(false);
      expect(svc.canMinus()).toBe(false);
    });

    it('marks an unstackable item as unsplittable', () => {
      svc.begin(item({ stackable: false, amount: 5 }));
      expect(svc.splittable()).toBe(false);
    });

    it('is not dragging before it begins, or after it ends', () => {
      expect(svc.isDragging()).toBe(false);
      svc.begin(item({ amount: 4 }));
      expect(svc.end()).toBe(4);
      expect(svc.isDragging()).toBe(false);
    });
  });

  describe('operations', () => {
    beforeEach(() => svc.begin(item({ amount: 10 })));

    it('halves toward the larger half', () => {
      svc.apply('half');
      expect(svc.taken()).toBe(5);
      svc.apply('half');
      expect(svc.taken()).toBe(3);
    });

    it('doubles back up', () => {
      svc.apply('half');
      svc.apply('double');
      expect(svc.taken()).toBe(10);
    });

    it('adds and removes one', () => {
      svc.apply('minus');
      expect(svc.taken()).toBe(9);
      svc.apply('plus');
      expect(svc.taken()).toBe(10);
    });

    it('refuses to double past the pile', () => {
      svc.setTaken(7);
      expect(svc.canDouble()).toBe(false);
      expect(svc.apply('double')).toBe(false);
      expect(svc.taken()).toBe(7);
    });

    it('refuses to add past the pile', () => {
      expect(svc.canPlus()).toBe(false);
      expect(svc.apply('plus')).toBe(false);
      expect(svc.taken()).toBe(10);
    });

    it('refuses to go below one', () => {
      svc.setTaken(1);
      expect(svc.canMinus()).toBe(false);
      expect(svc.canHalf()).toBe(false);
      expect(svc.apply('minus')).toBe(false);
      expect(svc.taken()).toBe(1);
    });

    it('doubling exactly to the pile size is allowed', () => {
      svc.setTaken(5);
      expect(svc.canDouble()).toBe(true);
      svc.apply('double');
      expect(svc.taken()).toBe(10);
    });

    it('reports a split only once less than everything is carried', () => {
      expect(svc.isSplit()).toBe(false);
      svc.apply('minus');
      expect(svc.isSplit()).toBe(true);
    });

    it('offers nothing for an unsplittable pile', () => {
      svc.begin(item({ amount: 1 }));
      for (const op of ['half', 'double', 'plus', 'minus'] as const) {
        expect(svc.can(op)).toBe(false);
        expect(svc.apply(op)).toBe(false);
      }
    });
  });

  describe('typing a number', () => {
    beforeEach(() => svc.begin(item({ amount: 10 })));

    it('takes the number typed', () => {
      svc.setTaken(3);
      expect(svc.taken()).toBe(3);
    });

    it('clamps above the pile', () => {
      svc.setTaken(99);
      expect(svc.taken()).toBe(10);
    });

    it('clamps below one', () => {
      svc.setTaken(0);
      expect(svc.taken()).toBe(1);
      svc.setTaken(-5);
      expect(svc.taken()).toBe(1);
    });

    it('ignores nonsense instead of blanking the count', () => {
      svc.setTaken(NaN);
      expect(svc.taken()).toBe(10);
    });

    it('floors a fraction', () => {
      svc.setTaken(3.9);
      expect(svc.taken()).toBe(3);
    });

    it('does nothing when no drag is running', () => {
      svc.end();
      svc.setTaken(5);
      expect(svc.taken()).toBe(0);
    });
  });

  describe('the menu', () => {
    it('only opens during a drag', () => {
      svc.openMenu(10, 10);
      expect(svc.menuOpen()).toBe(false);

      svc.begin(item({ amount: 4 }));
      svc.openMenu(10, 20);
      expect(svc.menuOpen()).toBe(true);
      // The exact spot is clamped so the ring fits — see "keeping the ring on screen".
    });

    it('closes when the drag ends', () => {
      svc.begin(item({ amount: 4 }));
      svc.openMenu(0, 0);
      svc.end();
      expect(svc.menuOpen()).toBe(false);
    });
  });

  describe('keeping the ring on screen', () => {
    const withWindow = (w: number, h: number, fn: () => void) => {
      const realW = window.innerWidth, realH = window.innerHeight;
      Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: h, configurable: true });
      try { fn(); } finally {
        Object.defineProperty(window, 'innerWidth', { value: realW, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: realH, configurable: true });
      }
    };

    it('leaves a central click where it is', () => {
      withWindow(1600, 1000, () => {
        svc.begin(item({ amount: 4 }));
        svc.openMenu(800, 500);
        expect(svc.menuPosition()).toEqual({ x: 800, y: 500 });
      });
    });

    it('pushes a corner click inward so the whole ring fits', () => {
      withWindow(1600, 1000, () => {
        svc.begin(item({ amount: 4 }));
        svc.openMenu(5, 5);
        const pos = svc.menuPosition();
        expect(pos.x).toBeGreaterThanOrEqual(DragSplitService.RING_MARGIN);
        expect(pos.y).toBeGreaterThanOrEqual(DragSplitService.RING_MARGIN);
      });
    });

    it('pulls a click near the far edge back in', () => {
      withWindow(1600, 1000, () => {
        svc.begin(item({ amount: 4 }));
        svc.openMenu(1595, 995);
        const pos = svc.menuPosition();
        expect(pos.x).toBeLessThanOrEqual(1600 - DragSplitService.RING_MARGIN);
        expect(pos.y).toBeLessThanOrEqual(1000 - DragSplitService.RING_MARGIN);
      });
    });

    it('centres the ring on a window too small to hold it', () => {
      withWindow(300, 300, () => {
        svc.begin(item({ amount: 4 }));
        svc.openMenu(10, 290);
        expect(svc.menuPosition()).toEqual({ x: 150, y: 150 });
      });
    });
  });

  describe('repeating an operation (Shift)', () => {
    it('walks a big pile down one step at a time and stops at the floor', () => {
      svc.begin(item({ amount: 5 }));
      let guard = 0;
      while (svc.apply('minus') && ++guard < 50) { /* as Shift-repeat does */ }
      expect(svc.taken()).toBe(1);
      expect(svc.apply('minus')).toBe(false);
    });

    it('walks back up and stops at the ceiling', () => {
      svc.begin(item({ amount: 5 }));
      svc.setTaken(1);
      let guard = 0;
      while (svc.apply('plus') && ++guard < 50) { /* as Shift-repeat does */ }
      expect(svc.taken()).toBe(5);
      expect(svc.apply('plus')).toBe(false);
    });
  });
});
