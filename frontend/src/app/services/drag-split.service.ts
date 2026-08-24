import { Injectable, computed, signal } from '@angular/core';
import { ItemBlock } from '../model/item-block.model';
import { splitHalf, stackAmount } from '../utils/item-stack.util';

/**
 * Splitting a stack WHILE dragging it.
 *
 * Items move by left-drag and nothing else. Hold the right button during a drag and this opens
 * over the item: type a number Blender-style, or sweep the pointer across a radial menu of
 * operations (half, double, +1, -1). Whatever count is set when you let go is what gets dropped;
 * the remainder goes back to the slot the drag started from.
 *
 * The state lives in a service because three components take part: the grid that starts the drag,
 * the overlay that draws the menu, and whichever drop target finishes the move.
 */
export interface DragSplitOperation {
  id: 'half' | 'double' | 'plus' | 'minus';
  label: string;
  hint: string;
}

export const DRAG_SPLIT_OPERATIONS: DragSplitOperation[] = [
  { id: 'minus',  label: '−1', hint: 'Eines weniger mitnehmen' },
  { id: 'half',   label: '½',  hint: 'Die Hälfte mitnehmen' },
  { id: 'double', label: '×2', hint: 'Doppelt so viele mitnehmen' },
  { id: 'plus',   label: '+1', hint: 'Eines mehr mitnehmen' },
];

@Injectable({ providedIn: 'root' })
export class DragSplitService {
  /** Units in the pile being dragged. 0 when no drag is running. */
  readonly total = signal(0);
  /** Units currently being carried — the rest stays behind. */
  readonly taken = signal(0);
  /** Whether the dragged item can be split at all. */
  readonly splittable = signal(false);
  /** The radial menu is visible while the right button is held. */
  readonly menuOpen = signal(false);
  /** Where the menu was opened, in viewport coordinates. */
  readonly menuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  /** A drag is in progress (whether or not the menu is open). */
  readonly isDragging = computed(() => this.total() > 0);
  /** True once the carried amount is less than the whole pile. */
  readonly isSplit = computed(() => this.isDragging() && this.taken() < this.total());

  // Which operations would change anything right now. A greyed-out option is one the
  // pile cannot support — doubling 7 of 10, or taking one off a single unit.
  readonly canHalf = computed(() => this.splittable() && this.taken() > 1);
  readonly canDouble = computed(() => this.splittable() && this.taken() * 2 <= this.total());
  readonly canPlus = computed(() => this.splittable() && this.taken() < this.total());
  readonly canMinus = computed(() => this.splittable() && this.taken() > 1);

  /** Start tracking a drag. */
  begin(item: ItemBlock | null | undefined): void {
    const units = stackAmount(item);
    this.total.set(units);
    this.taken.set(units);
    this.splittable.set(!!item?.stackable && units > 1);
    this.menuOpen.set(false);
  }

  /** The drag finished (or was cancelled). Returns the count that was carried. */
  end(): number {
    const carried = this.taken();
    this.total.set(0);
    this.taken.set(0);
    this.splittable.set(false);
    this.menuOpen.set(false);
    return carried;
  }

  openMenu(x: number, y: number): void {
    if (!this.isDragging()) return;
    this.menuPosition.set({ x, y });
    this.menuOpen.set(true);
  }

  closeMenu(): void { this.menuOpen.set(false); }

  /** Set the carried count directly (the typed number). Clamped into the pile. */
  setTaken(value: number): void {
    if (!this.isDragging()) return;
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return;
    this.taken.set(Math.max(1, Math.min(this.total(), n)));
  }

  /** Run one operation. Returns false when it was not possible, so the UI can say so. */
  apply(op: DragSplitOperation['id']): boolean {
    switch (op) {
      case 'half':
        if (!this.canHalf()) return false;
        // Halving keeps the larger half, the same way picking half of a pile does.
        this.taken.set(splitHalf(this.taken()).taken);
        return true;
      case 'double':
        if (!this.canDouble()) return false;
        this.taken.set(this.taken() * 2);
        return true;
      case 'plus':
        if (!this.canPlus()) return false;
        this.taken.set(this.taken() + 1);
        return true;
      case 'minus':
        if (!this.canMinus()) return false;
        this.taken.set(this.taken() - 1);
        return true;
    }
  }

  /** Is this operation currently possible? */
  can(op: DragSplitOperation['id']): boolean {
    switch (op) {
      case 'half':   return this.canHalf();
      case 'double': return this.canDouble();
      case 'plus':   return this.canPlus();
      case 'minus':  return this.canMinus();
    }
  }
}
