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
  /** The big symbol in the ring. */
  label: string;
  /** The small word under it. */
  name: string;
  hint: string;
}

/** Clockwise from the top: +1, ×2, −1, ½ — adding on the right, taking away on the left. */
export const DRAG_SPLIT_OPERATIONS: DragSplitOperation[] = [
  { id: 'plus',   label: '+1', name: 'Eins',   hint: 'Eines mehr mitnehmen (Shift: schnell)' },
  { id: 'double', label: '×2', name: 'Doppelt', hint: 'Doppelt so viele mitnehmen (Shift: schnell)' },
  { id: 'minus',  label: '−1', name: 'Eins',   hint: 'Eines weniger mitnehmen (Shift: schnell)' },
  { id: 'half',   label: '½',  name: 'Hälfte', hint: 'Die Hälfte mitnehmen (Shift: schnell)' },
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

  private clearTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.reset(); // cancels any pending cleanup from the previous drag
    const units = stackAmount(item);
    this.total.set(units);
    this.taken.set(units);
    this.splittable.set(!!item?.stackable && units > 1);
    this.menuOpen.set(false);
  }

  /**
   * The drag finished. Returns the count that was carried, and clears the state on the next
   * macrotask rather than immediately.
   *
   * The delay is not cosmetic. Angular CDK emits `ended` BEFORE `dropped`, so the drop handler —
   * the code that actually moves the units — runs after this. Clearing here made every drop read
   * a count of zero and fall back to "the whole pile", which is how dragging a split stack into
   * the shared bag handed over all of it.
   */
  finishDrag(): number {
    const carried = this.taken();
    this.menuOpen.set(false);
    this.clearTimer ??= setTimeout(() => this.reset(), 0);
    return carried;
  }

  /** Wipe the state now. Used when a new drag starts, and by the deferred cleanup. */
  reset(): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this.total.set(0);
    this.taken.set(0);
    this.splittable.set(false);
    this.menuOpen.set(false);
  }

  /**
   * Radius the ring needs around the cursor, so the menu can be kept fully on screen. Opening
   * it near an edge otherwise pushed half the options out of view.
   */
  static readonly RING_MARGIN = 220;

  openMenu(x: number, y: number): void {
    if (!this.isDragging()) return;
    const margin = DragSplitService.RING_MARGIN;
    const clamp = (value: number, size: number) => size < margin * 2
      ? size / 2
      : Math.max(margin, Math.min(size - margin, value));
    this.menuPosition.set({
      x: clamp(x, window.innerWidth),
      y: clamp(y, window.innerHeight),
    });
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
