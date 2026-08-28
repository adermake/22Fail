import { Injectable, computed, signal } from '@angular/core';
import { ItemBlock } from '../model/item-block.model';
import { stackAmount } from '../utils/item-stack.util';

/**
 * Splitting a stack WHILE dragging it — no modes, no menus.
 *
 *   type a number   that many come with you, the rest stays behind
 *   right click     drop a single unit into the slot under the pointer
 *
 * Three counts always add up to the size of the pile you picked up:
 *
 *   carried   still on the cursor, dropped wherever you release
 *   parked    already placed elsewhere by right-clicking, one at a time
 *   leftover  going back to the slot it came from, shown there in yellow while you drag
 *
 * Nothing is written to the sheet until the drag ends; the leftover badge is a preview. Writing
 * mid-drag would re-render the grid underneath Angular CDK while it is holding one of its rows.
 */
@Injectable({ providedIn: 'root' })
export class DragSplitService {
  /** Units in the pile that was picked up. 0 when no drag is running. */
  readonly total = signal(0);
  /** Units still on the cursor. */
  readonly carried = signal(0);
  /** Units right-clicked into other slots, as slot index → count. */
  readonly parked = signal<ReadonlyMap<number, number>>(new Map());
  /** Whether this pile can be split at all. */
  readonly splittable = signal(false);

  /** A drag is in progress. */
  readonly isDragging = computed(() => this.total() > 0);
  /** Units already placed elsewhere during this drag. */
  readonly parkedCount = computed(
    () => [...this.parked().values()].reduce((sum, n) => sum + n, 0),
  );
  /** Units that will go back to the slot the drag started from. */
  readonly leftover = computed(
    () => Math.max(0, this.total() - this.carried() - this.parkedCount()),
  );
  /** True once the whole pile is no longer coming along. */
  readonly isSplit = computed(() => this.isDragging() && this.carried() < this.total());
  /** A number has been typed during this drag (drives the count badge's highlight). */
  readonly typed = signal(false);

  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  /** Start tracking a drag. */
  begin(item: ItemBlock | null | undefined): void {
    this.reset(); // cancels any pending cleanup from the previous drag
    const units = stackAmount(item);
    this.total.set(units);
    this.carried.set(units);
    this.splittable.set(!!item?.stackable && units > 1);
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
    const carried = this.carried();
    this.clearTimer ??= setTimeout(() => this.reset(), 0);
    return carried;
  }

  /** Wipe the state now. Used when a new drag starts, and by the deferred cleanup. */
  reset(): void {
    if (this.clearTimer) { clearTimeout(this.clearTimer); this.clearTimer = null; }
    this.total.set(0);
    this.carried.set(0);
    this.parked.set(new Map());
    this.splittable.set(false);
    this.typed.set(false);
  }

  /**
   * Take a typed count along. Clamped to what is actually still available: a pile of ten with
   * three already parked can carry at most seven.
   */
  setCarried(value: number): void {
    if (!this.isDragging()) return;
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) return;
    const max = this.total() - this.parkedCount();
    this.carried.set(Math.max(0, Math.min(max, n)));
  }

  /** Note that the count came from the keyboard (for the badge's highlight). */
  markTyped(): void { this.typed.set(true); }

  /**
   * Right click: put one unit into `slot`. Returns false when there is nothing left on the
   * cursor to place. The unit is only recorded here — the drop commits it.
   */
  parkOne(slot: number): boolean {
    if (!this.isDragging() || this.carried() < 1) return false;
    const next = new Map(this.parked());
    next.set(slot, (next.get(slot) ?? 0) + 1);
    this.parked.set(next);
    this.carried.set(this.carried() - 1);
    return true;
  }

  /** Units destined for one slot, for the pending badge on it. */
  parkedAt(slot: number): number { return this.parked().get(slot) ?? 0; }
}
