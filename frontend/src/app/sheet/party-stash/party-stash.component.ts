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
  private cdr = inject(ChangeDetectorRef);

  /** Which entry is being previewed in full (click on the row). */
  expandedEntry: string | null = null;

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
