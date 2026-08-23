import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { PartyStashEntry } from '../../model/world.model';
import { PartyStashService } from '../../services/party-stash.service';
import { HeldStackService } from '../../services/held-stack.service';
import { splitHalf, stackAmount, withAmount } from '../../utils/item-stack.util';
import { ItemComponent } from '../item/item.component';

/**
 * Gemeinsamer Beutel — the party's shared bag, in the gap under the stats block.
 *
 * Drag an item in from the inventory to hand it over, drag one out (or press Nehmen) to take it.
 * Both directions go through PartyStashService, which only touches the sheet after the server
 * confirms the move, so nothing is ever in two inventories or in none.
 */
@Component({
  selector: 'app-party-stash',
  standalone: true,
  imports: [CommonModule, DragDropModule, ItemComponent],
  templateUrl: './party-stash.component.html',
  styleUrl: './party-stash.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyStashComponent implements OnInit {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() characterId = '';
  @Output() patch = new EventEmitter<JsonPatch>();

  readonly stash = inject(PartyStashService);
  readonly heldStack = inject(HeldStackService);
  private cdr = inject(ChangeDetectorRef);

  /** Which entry is being previewed in full (click on the row). */
  expandedEntry: string | null = null;
  /** True while a deposit is waiting on the server — blocks a second, duplicating hand-over. */
  private depositing = false;

  async ngOnInit(): Promise<void> {
    if (this.sheet?.worldName) await this.stash.attach(this.sheet.worldName);
    this.cdr.markForCheck();
  }

  get entries(): PartyStashEntry[] { return this.stash.entries(); }

  get hasWorld(): boolean { return !!this.sheet?.worldName; }

  toggleExpanded(entryId: string): void {
    this.expandedEntry = this.expandedEntry === entryId ? null : entryId;
  }

  // ── In ────────────────────────────────────────────────────────────────────

  /** An inventory item was dropped on the bag. */
  async onDrop(event: CdkDragDrop<PartyStashEntry[]>): Promise<void> {
    if (event.previousContainer === event.container) return;
    const item = event.item.data as ItemBlock | null;
    if (!item) return;
    await this.give(item);
  }

  /** Hand one unit of an item to the party. */
  async give(item: ItemBlock): Promise<void> {
    const index = (this.sheet.inventory ?? []).indexOf(item);
    if (index < 0) return;

    const unit: ItemBlock = item.stackable && (item.amount ?? 1) > 1
      ? { ...item, amount: 1 }
      : item;

    const ok = await this.stash.deposit(unit, { id: this.characterId, name: this.sheet.name });
    if (!ok) { this.cdr.markForCheck(); return; }

    // Only now does the item leave the sheet — the server has it.
    const inventory = [...(this.sheet.inventory ?? [])] as (ItemBlock | null)[];
    if (item.stackable && (item.amount ?? 1) > 1) {
      inventory[index] = { ...item, amount: (item.amount ?? 1) - 1 };
    } else {
      inventory[index] = null;
      while (inventory.length > 0 && inventory[inventory.length - 1] === null) inventory.pop();
    }
    this.sheet.inventory = inventory as typeof this.sheet.inventory;
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
    this.cdr.markForCheck();
  }

  // ── Stapel: aufnehmen und ablegen ────────────────────────────────────────
  // Same gestures as the inventory grid, but every move is a server move: the hand is only
  // filled once the server confirms the units left the bag, and only emptied once it confirms
  // they arrived. A refused move leaves both sides exactly as they were.

  /** Left click on an entry: take the whole pile into the hand — or drop everything held. */
  async onEntryClick(entry: PartyStashEntry, event: MouseEvent): Promise<void> {
    if (this.isInteractive(event)) return;
    event.preventDefault();
    // An entry sits INSIDE the bag, so without this the click also reaches onBagClick and the
    // stack is handed over twice — the server merges both and the pile doubles.
    event.stopPropagation();
    if (this.heldStack.isHolding()) { await this.depositHeld(this.heldStack.heldAmount()); return; }
    await this.takeToHand(entry);
  }

  /** Right click on an entry: take half — or drop a single unit. */
  async onEntryRightClick(entry: PartyStashEntry, event: MouseEvent): Promise<void> {
    if (this.isInteractive(event)) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.heldStack.isHolding()) { await this.depositHeld(1); return; }

    const total = stackAmount(entry.item);
    if (!entry.item.stackable || total <= 1) { await this.takeToHand(entry); return; }
    await this.takeToHand(entry, splitHalf(total).taken);
  }

  /** Clicking the empty area of the bag puts the held stack in. */
  async onBagClick(event: MouseEvent): Promise<void> {
    if (this.isInteractive(event) || !this.heldStack.isHolding()) return;
    event.preventDefault();
    await this.depositHeld(this.heldStack.heldAmount());
  }

  async onBagRightClick(event: MouseEvent): Promise<void> {
    if (this.isInteractive(event) || !this.heldStack.isHolding()) return;
    event.preventDefault();
    await this.depositHeld(1);
  }

  private isInteractive(event: Event): boolean {
    const el = event.target as HTMLElement | null;
    return !!el?.closest('button, input, select, textarea, a');
  }

  /** Move units out of the bag into the hand. Nothing enters the hand unless the server agreed. */
  private async takeToHand(entry: PartyStashEntry, amount?: number): Promise<void> {
    if (this.heldStack.isHolding()) return;
    const item = await this.stash.withdraw(entry.entryId, amount);
    if (item) this.heldStack.pickUpAll(item, 'stash');
    this.cdr.markForCheck();
  }

  /**
   * Move units from the hand into the bag. The hand keeps them until the server has them —
   * which is also why a second call must not start while the first is still in flight: it would
   * see the same full hand and hand the same units over twice.
   */
  private async depositHeld(count: number): Promise<void> {
    const item = this.heldStack.heldItem();
    if (!item || this.depositing) return;
    this.depositing = true;
    const amount = Math.max(1, Math.min(count, stackAmount(item)));
    try {
      const ok = await this.stash.deposit(
        withAmount(item, amount), { id: this.characterId, name: this.sheet.name },
      );
      if (ok) this.heldStack.takeHeld(amount);
    } finally {
      // Always release the guard — a thrown request must not leave the bag permanently locked.
      this.depositing = false;
      this.cdr.markForCheck();
    }
  }

  // ── Out ───────────────────────────────────────────────────────────────────

  /** Take an entry into this character's inventory (first free slot). */
  async take(entry: PartyStashEntry): Promise<void> {
    const item = await this.stash.withdraw(entry.entryId);
    if (!item) { this.cdr.markForCheck(); return; }

    const inventory = [...(this.sheet.inventory ?? [])] as (ItemBlock | null)[];
    const free = inventory.findIndex(slot => slot === null || slot === undefined);
    if (free >= 0) inventory[free] = item;
    else inventory.push(item);

    this.sheet.inventory = inventory as typeof this.sheet.inventory;
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
    this.expandedEntry = null;
    this.cdr.markForCheck();
  }
}
