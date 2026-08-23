import { Injectable, computed, signal } from '@angular/core';
import { ItemBlock } from '../model/item-block.model';
import { canMerge, splitHalf, stackAmount, takeFrom, withAmount } from '../utils/item-stack.util';

/**
 * The stack "in hand" — the pile you are carrying between slots, the way an inventory cursor
 * works in Minecraft:
 *
 *   left click   pick up the whole stack  /  drop everything you hold
 *   right click  pick up half             /  drop a single unit
 *
 * It is one root-level service so the inventory grid and the shared party bag pass items to each
 * other without either knowing about the other. Nothing here talks to the server; the party bag
 * wraps these same moves in its own confirm-then-apply protocol.
 */
export interface HeldStack {
  item: ItemBlock;
  /** Where it came from, so an aborted move can be put back sensibly. */
  from: 'inventory' | 'stash';
}

@Injectable({ providedIn: 'root' })
export class HeldStackService {
  private readonly _held = signal<HeldStack | null>(null);

  readonly held = this._held.asReadonly();
  readonly isHolding = computed(() => this._held() !== null);
  readonly heldItem = computed(() => this._held()?.item ?? null);
  readonly heldAmount = computed(() => stackAmount(this._held()?.item));

  /** Pointer position, so the floating preview can follow the cursor. */
  readonly pointer = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  trackPointer(event: MouseEvent): void {
    if (this._held()) this.pointer.set({ x: event.clientX, y: event.clientY });
  }

  // ── Picking up ────────────────────────────────────────────────────────────

  /** Take everything in the slot. Returns what stays behind (always null). */
  pickUpAll(item: ItemBlock, from: HeldStack['from']): ItemBlock | null {
    this._held.set({ item: withAmount(item, stackAmount(item)), from });
    return null;
  }

  /**
   * Take half (the larger half). Returns what stays behind. An unstackable item or a single unit
   * is taken whole — there is no half of one thing.
   */
  pickUpHalf(item: ItemBlock, from: HeldStack['from']): ItemBlock | null {
    const total = stackAmount(item);
    if (!item.stackable || total <= 1) return this.pickUpAll(item, from);

    const { taken, left } = splitHalf(total);
    this._held.set({ item: withAmount(item, taken), from });
    return left > 0 ? withAmount(item, left) : null;
  }

  // ── Putting down ──────────────────────────────────────────────────────────

  /**
   * Drop everything held onto a slot: place, merge, or swap with whatever is there.
   * Returns the slot's new contents. The hand ends up empty, or holding what it swapped for.
   */
  dropAll(slot: ItemBlock | null): ItemBlock | null {
    const held = this._held();
    if (!held) return slot;

    if (!slot) {
      this._held.set(null);
      return held.item;
    }
    if (canMerge(slot, held.item)) {
      this._held.set(null);
      return withAmount(slot, stackAmount(slot) + stackAmount(held.item));
    }
    // Different item: swap. What was in the slot comes into the hand.
    this._held.set({ item: slot, from: held.from });
    return held.item;
  }

  /**
   * Drop a single unit onto a slot. Returns the slot's new contents; the slot is left untouched
   * when it holds something the unit cannot join.
   */
  dropOne(slot: ItemBlock | null): ItemBlock | null {
    const held = this._held();
    if (!held) return slot;

    const one = withAmount(held.item, 1);
    if (slot && !canMerge(slot, held.item)) return slot; // nothing happens

    const remaining = takeFrom(held.item, stackAmount(held.item) - 1);
    this._held.set(remaining.taken ? { ...held, item: remaining.taken } : null);

    if (!slot) return one;
    return withAmount(slot, stackAmount(slot) + 1);
  }

  /** Take a fixed number of units out of the hand (used when a server move is confirmed). */
  takeHeld(count: number): ItemBlock | null {
    const held = this._held();
    if (!held) return null;
    const { taken, left } = takeFrom(held.item, count);
    this._held.set(left ? { ...held, item: left } : null);
    return taken;
  }

  /** Put the whole hand back (a move was refused). */
  clear(): ItemBlock | null {
    const held = this._held();
    this._held.set(null);
    return held?.item ?? null;
  }
}
