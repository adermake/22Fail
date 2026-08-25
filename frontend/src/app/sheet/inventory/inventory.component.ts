import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit,
  Output, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';
import {
  CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule, DragDropRegistry,
} from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { ItemComponent } from '../item/item.component';
import { ItemCreatorComponent } from '../item-creator/item-creator.component';
import { ItemEditorComponent } from '../item-editor/item-editor.component';
import { FormsModule } from '@angular/forms';
import { COIN_WEIGHT } from '../../model/currency-model';
import { WorldSocketService } from '../../services/world-socket.service';
import { NotificationService } from '../../services/notification.service';
import { TrueStatsService } from '../../services/true-stats.service';
import { ConsumptionService, isConsumable } from '../../services/consumption.service';
import { MacroExecutorService } from '../../services/macro-executor.service';
import { PartyStashService } from '../../services/party-stash.service';
import { DragSplitService } from '../../services/drag-split.service';
import { canMerge, stackAmount, withAmount } from '../../utils/item-stack.util';
import { PartyStashEntry } from '../../model/world.model';
import { CurrentEvent, ShopEvent, LootBundleEvent, formatCurrency } from '../../model/current-events.model';
import { ActiveStatusEffect } from '../../model/status-effect.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ItemComponent,
    CardComponent,
    ItemCreatorComponent,
    ItemEditorComponent,
    DragDropModule,
    FormsModule,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements OnInit, OnDestroy {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() currentEvents: CurrentEvent[] = [];
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() buyFromShop = new EventEmitter<any>();
  @Output() claimLoot = new EventEmitter<any>();
  /** Emits weapon efficiency when user clicks the roll-damage button on a weapon item */
  @Output() rollWeaponDamage = new EventEmitter<number>();
  /** Requests parent to open the forging overlay */
  @Output() openForge = new EventEmitter<void>();
  /** Requests parent to open the brewing overlay */
  @Output() openBrew = new EventEmitter<void>();
  @Output() openCook = new EventEmitter<void>();
  
  private worldSocket = inject(WorldSocketService);
  private notification = inject(NotificationService);
  private trueStats = inject(TrueStatsService);
  private consumption = inject(ConsumptionService);
  private macroExecutor = inject(MacroExecutorService);
  private partyStash = inject(PartyStashService);
  readonly dragSplit = inject(DragSplitService);
  private elRef = inject(ElementRef);
  private dragRegistry = inject(DragDropRegistry);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private pointerSub?: Subscription;

  Math = Math; // Expose Math to template
  formatCurrency = formatCurrency;

  showCreateDialog = false;
  showSettingsDialog = false;
  showItemEditor = false;
  editingItemIndex: number | null = null;
  editingItem: ItemBlock | null = null;
  private editingItems = new Set<number>();
  private unfoldedItems = new Set<number>();
  /** Which item index is the active tab per visual row (row = Math.floor(i/4)) */
  private activeTabPerRow = new Map<number, number>();
  /** Index of the item currently being dragged (for compact ghost rendering) */
  draggedIndex: number | null = null;
  /** Height in px of the item element at drag start, used to size the placeholder */
  dragItemHeight: number = 52;
  /** Padded slot index the drag began from */
  dragSourceSlotIdx: number | null = null;
  /** Padded slot index the pointer is currently hovering over */
  dropTargetSlotIdx: number | null = null;


  /**
   * Fixed-size slot array: inventory items packed to front, nulls fill the rest.
   * Always has at least 8 slots and expands in rows of 4 as items are added.
   */
  get paddedSlots(): (ItemBlock | null)[] {
    const inv = this.sheet.inventory || [];
    const slotCount = Math.max(8, Math.ceil((inv.length + 4) / 4) * 4);
    const result: (ItemBlock | null)[] = new Array(slotCount).fill(null);
    inv.forEach((item, i) => { result[i] = item; });
    return result;
  }

  /**
   * One entry per visual row that has at least one unfolded item.
   * Used to render a single expansion-row per grid row (with tabs when multiple).
   */
  get expansionRows(): { row: number; activeIdx: number; unfolded: number[] }[] {
    const rowMap = new Map<number, number[]>();
    for (const idx of this.unfoldedItems) {
      const row = Math.floor(idx / 4);
      if (!rowMap.has(row)) rowMap.set(row, []);
      rowMap.get(row)!.push(idx);
    }
    return [...rowMap.entries()]
      .map(([row, unfolded]) => ({
        row,
        activeIdx: this.activeTabPerRow.get(row) ?? unfolded[0],
        unfolded: [...unfolded].sort((a, b) => a - b),
      }))
      .sort((a, b) => a.row - b.row);
  }

  // Connected drop lists - equipment slots plus the shared party bag
  get connectedDropLists(): string[] {
    return [
      'helmetSlot', 'chestplateSlot', 'armschienenSlot', 'leggingsSlot', 'bootsSlot',
      'weaponSlot', 'extraSlot', 'partyStashList',
    ];
  }

  ngOnInit() {
    // Track the hovered slot for EVERY drag, not just drags that started in this grid.
    // (cdkDragMoved) only fires for our own items, so an item coming from the shared bag or an
    // equipment slot left dropTargetSlotIdx null: no hover highlight, and the drop fell back to
    // CDK's currentIndex — meaningless in a sparse padded grid, so the item landed anywhere.
    this.zone.runOutsideAngular(() => {
      this.pointerSub = this.dragRegistry.pointerMove.subscribe(event => {
        const point = event instanceof MouseEvent ? event : event.touches[0] ?? event.changedTouches[0];
        if (point) this.trackHoveredSlot(point.clientX, point.clientY);
      });
    });

    if (!this.sheet.inventory) {
      this.sheet.inventory = [];
    }
    if (this.sheet.carryCapacityMultiplier === undefined) {
      this.sheet.carryCapacityMultiplier = 10;
    }
    if (this.sheet.carryCapacityBonus === undefined) {
      this.sheet.carryCapacityBonus = 0;
    }
  }

  ngOnDestroy(): void {
    this.pointerSub?.unsubscribe();
  }

  /**
   * Which padded slot is under the pointer. Runs outside Angular; only a real change is pushed
   * back in, so a drag across the grid costs one change detection per slot crossed.
   */
  private trackHoveredSlot(clientX: number, clientY: number): void {
    const slotEl = document.elementsFromPoint(clientX, clientY)
      .find(el => (el as HTMLElement).hasAttribute?.('data-slot-idx')) as HTMLElement | undefined;

    const raw = slotEl?.getAttribute('data-slot-idx');
    const idx = raw === null || raw === undefined ? null : parseInt(raw, 10);
    const next = idx === null || isNaN(idx) ? null : idx;

    if (next === this.dropTargetSlotIdx) return;
    this.zone.run(() => {
      this.dropTargetSlotIdx = next;
      this.cdr.markForCheck();
    });
  }

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  openSettingsDialog() {
    this.showSettingsDialog = true;
  }

  closeSettingsDialog() {
    this.showSettingsDialog = false;
  }

 get totalWeight(): number {
  return this.trueStats.getTotalWeight(this.sheet);
}

getCurrencyWeight(): number {
  if (!this.sheet.currency) return 0;
  const totalCoins = (
    (this.sheet.currency.copper || 0) +
    (this.sheet.currency.silver || 0) +
    (this.sheet.currency.gold || 0) +
    (this.sheet.currency.platinum || 0)
  );
  return totalCoins * COIN_WEIGHT;
}

  get maxCapacity(): number {
    const strength = this.sheet.strength?.current * 8 || 10;
    return Math.floor(strength * this.sheet.carryCapacityMultiplier + this.sheet.carryCapacityBonus);
  }

  get encumbrancePercentage(): number {
    return (this.totalWeight / this.maxCapacity) * 100;
  }

  get encumbranceColor(): string {
    const percentage = this.encumbrancePercentage;
    if (percentage < 80) {
      return '#22c55e'; // Green - no penalty
    } else if (percentage < 100) {
      return '#eab308'; // Yellow - half speed
    } else {
      return '#ef4444'; // Red - speed 0
    }
  }

  get encumbranceClass(): string {
    const percentage = this.encumbrancePercentage;
    if (percentage < 80) return 'normal';
    if (percentage < 100) return 'heavy';
    return 'overencumbered';
  }

  get speedPenaltyText(): string {
    const percentage = this.encumbrancePercentage;
    if (percentage < 80) return '';
    if (percentage < 100) return 'Half Speed';
    return 'Speed = 0';
  }

  updateCapacitySetting(field: string, value: any) {
    (this.sheet as any)[field] = value;
    this.patch.emit({ path: field, value: Number(value) });
  }

  updateCurrency(coin: string, value: any) {
    if (!this.sheet.currency) {
      this.sheet.currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    }
    (this.sheet.currency as any)[coin] = Number(value) || 0;
    this.patch.emit({ path: `currency.${coin}`, value: Number(value) || 0 });
  }

  getCurrencyTotalValue(): number {
    if (!this.sheet.currency) return 0;
    return (
      (this.sheet.currency.copper || 0) * 0.01 +
      (this.sheet.currency.silver || 0) * 0.1 +
      (this.sheet.currency.gold || 0) +
      (this.sheet.currency.platinum || 0) * 10
    );
  }

  createItem(item: ItemBlock) {
    const newInv = [...this.sheet.inventory] as (ItemBlock | null)[];
    const emptySlot = newInv.indexOf(null);
    if (emptySlot !== -1) {
      newInv[emptySlot] = item;
    } else {
      newInv.push(item);
    }
    this.sheet.inventory = newInv;
    this.patch.emit({ path: 'inventory', value: newInv });
    this.closeCreateDialog();
  }

  deleteItem(index: number) {
    const item = this.sheet.inventory[index];
    if (!item) return;

    // Null out slot (preserves positions of all other items)
    const newInv = [...this.sheet.inventory] as (ItemBlock | null)[];
    newInv[index] = null;
    // Trim trailing nulls for compact storage
    while (newInv.length > 0 && newInv[newInv.length - 1] === null) newInv.pop();
    this.sheet.inventory = newInv;

    // Add to trash
    const trash = this.sheet.trash || [];
    trash.push({ type: 'item', data: item, deletedAt: Date.now() });

    // Remove from UI state sets — no index shifting needed
    this.editingItems.delete(index);
    this.unfoldedItems.delete(index);
    const row = Math.floor(index / 4);
    if (this.activeTabPerRow.get(row) === index) {
      const rowEntry = this.expansionRows.find(e => e.row === row);
      if (rowEntry && rowEntry.unfolded.length > 0) {
        this.activeTabPerRow.set(row, rowEntry.unfolded[0]);
      } else {
        this.activeTabPerRow.delete(row);
      }
    }

    this.patch.emit({ path: 'inventory', value: newInv });
    this.patch.emit({ path: 'trash', value: trash });
  }

  /**
   * Use up a consumable — potion or Verbrauchsgegenstand, same path. Effects apply immediately,
   * the unit leaves the inventory and lands under Verbraucht for the next Rast.
   * All of it lives in ConsumptionService so the two kinds cannot drift apart.
   */
  consumeItem(index: number): void {
    const item = this.sheet.inventory[index];
    if (!item || !isConsumable(item)) return;

    const result = this.consumption.consume(this.sheet, item, index);
    if (!result.consumed) return;

    this.patch.emit({ path: 'statuses', value: this.sheet.statuses });
    this.patch.emit({ path: 'activeStatusEffects', value: this.sheet.activeStatusEffects ?? [] });
    this.patch.emit({ path: 'seenStatusEffectIds', value: this.sheet.seenStatusEffectIds ?? [] });
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
    this.patch.emit({ path: 'consumedItems', value: this.sheet.consumedItems ?? [] });

    this.editingItems.delete(index);
    this.unfoldedItems.delete(index);
    this.consumeFeedback = `${item.name}: ${result.message}`;
    setTimeout(() => (this.consumeFeedback = ''), 4000);
  }

  /**
   * Fire one named `onTrigger` block of an item's script by hand (right-click → the trigger's
   * name). Nothing is used up: a trigger is an action the item offers, not a consumption.
   */
  runItemTrigger(index: number, trigger: string): void {
    const item = this.sheet.inventory[index];
    if (!item?.script) return;

    const result = this.macroExecutor.runScriptOnSheet(item.script, this.sheet, { trigger });

    this.patch.emit({ path: 'statuses', value: this.sheet.statuses });
    this.patch.emit({ path: 'activeStatusEffects', value: this.sheet.activeStatusEffects ?? [] });
    this.patch.emit({ path: 'seenStatusEffectIds', value: this.sheet.seenStatusEffectIds ?? [] });

    this.consumeFeedback = `${item.name} · ${trigger}: ${result.message}`;
    setTimeout(() => (this.consumeFeedback = ''), 4000);
  }

  /** Kept for the potion menu entry — drinking is just consuming. */
  usePotion(index: number): void {
    this.consumeItem(index);
  }

  /** Short-lived line under the inventory header after consuming something. */
  consumeFeedback = '';

  /** Copy an inventory item into the next free slot and open the editor on the copy. */
  duplicateItem(index: number): void {
    const source = this.sheet.inventory[index];
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source)) as ItemBlock;
    copy.name = `${source.name} (Kopie)`;

    const inventory = [...(this.sheet.inventory || [])];
    let target = inventory.findIndex(slot => slot === null);
    if (target === -1) {
      inventory.push(copy);
      target = inventory.length - 1;
    } else {
      inventory[target] = copy;
    }
    this.sheet.inventory = inventory;
    this.patch.emit({ path: 'inventory', value: inventory });
    this.openItemEditor(target);
  }

  updateItem(index: number, patch: JsonPatch) {
    const item = this.sheet.inventory[index];
    if (!item) return;
    const pathParts = patch.path.split('.');

    if (pathParts.length === 1) {
      (item as any)[patch.path] = patch.value;
    } else if (pathParts[0] === 'requirements') {
      if (!item.requirements) {
        item.requirements = {};
      }
      (item.requirements as any)[pathParts[1]] = patch.value;
    }

    this.sheet.inventory = [...this.sheet.inventory];

    this.patch.emit({
      path: `inventory.${index}.${patch.path}`,
      value: patch.value,
    });
  }

  onDragStarted(event: CdkDragStart, slotIdx: number) {
    // If the item is currently unfolded, fold it before dragging
    if (this.unfoldedItems.has(slotIdx)) {
      this.onFoldChange(slotIdx, true);
    }
    this.dragItemHeight = (event.source.element.nativeElement as HTMLElement).offsetHeight;
    this.draggedIndex = slotIdx;
    this.dragSourceSlotIdx = slotIdx;
    this.dropTargetSlotIdx = slotIdx; // start at self
    // Hold the right button during the drag to split this pile.
    this.dragSplit.begin(this.paddedSlots[slotIdx]);


  }

  onDragMoved(event: CdkDragMove) {
    // Kept for drags that start here; the global tracker handles the rest.
    this.trackHoveredSlot(event.pointerPosition.x, event.pointerPosition.y);
  }

  /**
   * Fires when the drag ends (pointer released).
   * Handles same-container swaps. Cross-container drops are handled by onDrop.
   */
  onDragEnded(event: CdkDragEnd) {
    const src = this.dragSourceSlotIdx;
    const tgt = this.dropTargetSlotIdx;
    this.draggedIndex = null;
    this.dragSourceSlotIdx = null;
    this.dropTargetSlotIdx = null;

    const total = this.dragSplit.total();
    const carried = this.dragSplit.finishDrag();

    // A drop outside our own grid (equipment, the shared bag) leaves no slot under the pointer,
    // and that is the only guard needed: the receiving container does its own work.
    if (src === null || tgt === null || src === tgt) return;

    const padded = [...this.paddedSlots];

    // A split drop moves only part of the pile; the rest stays where it came from.
    if (carried > 0 && carried < total) {
      if (!this.placeSplit(padded, src, tgt, carried, total)) return;
      this.commitSlots(padded);
      return;
    }

    // Whole-pile drop onto the same kind of item: the two become one stack.
    if (canMerge(padded[src], padded[tgt])) {
      padded[tgt] = withAmount(padded[tgt]!, stackAmount(padded[tgt]) + stackAmount(padded[src]));
      padded[src] = null;
      this.unfoldedItems.delete(src);
      this.commitSlots(padded);
      return;
    }

    // Sparse swap: swap directly at their slot positions, no compaction
    [padded[src], padded[tgt]] = [padded[tgt], padded[src]];

    // Directly swap unfoldedItems indices (no reference tracking needed)
    const srcWasUnfolded = this.unfoldedItems.has(src);
    const tgtWasUnfolded = this.unfoldedItems.has(tgt);
    if (srcWasUnfolded) this.unfoldedItems.add(tgt); else this.unfoldedItems.delete(tgt);
    if (tgtWasUnfolded) this.unfoldedItems.add(src); else this.unfoldedItems.delete(src);

    // Swap activeTabPerRow references if they pointed to swapped indices
    const srcRow = Math.floor(src / 4);
    const tgtRow = Math.floor(tgt / 4);
    if (srcRow !== tgtRow) {
      if (this.activeTabPerRow.get(srcRow) === src) this.activeTabPerRow.set(srcRow, tgt);
      if (this.activeTabPerRow.get(tgtRow) === tgt) this.activeTabPerRow.set(tgtRow, src);
    }

    // Trim trailing nulls for compact storage, preserve all non-trailing positions
    const newInv = [...padded] as (ItemBlock | null)[];
    while (newInv.length > 0 && newInv[newInv.length - 1] === null) newInv.pop();
    this.sheet.inventory = newInv;
    this.patch.emit({ path: 'inventory', value: newInv });
  }

onDrop(event: CdkDragDrop<(ItemBlock | null)[]>) {
  // Same-container drops are handled by onDragEnded — skip here
  if (event.previousContainer === event.container) return;

  // The slot the pointer was actually over. CDK's currentIndex is not usable here: this grid is
  // sparse and padded, so its index has nothing to do with the slot under the cursor.
  const targetSlot = this.dropTargetSlotIdx ?? event.currentIndex;
  this.dropTargetSlotIdx = null;

  // Coming out of the shared party bag: the server decides whether we actually get it, so this
  // goes through the stash service and lands in the sheet only once it acks.
  if (event.previousContainer.id === 'partyStashList') {
    const entry = event.item.data as PartyStashEntry | null;
    // The split menu may have reduced how much of the pile is being taken. Read it here:
    // the split state is cleared on the next tick.
    const carried = this.dragSplit.isSplit() ? this.dragSplit.taken() : undefined;
    if (entry?.entryId) void this.takeFromPartyStash(entry, targetSlot, carried);
    return;
  }

  // Equipment → inventory cross-container drop
  const rawItem = event.previousContainer.data[event.previousIndex];
  if (!rawItem) return; // null-safe guard (equipment data should never be null)
  const item = rawItem as ItemBlock;
  const tgtSlot = targetSlot;

  const padded = this.paddedSlots;
  const existingItem = tgtSlot < padded.length ? (padded[tgtSlot] ?? null) : null;

  if (existingItem) {
    // Swap: existing inventory item returns to the source equipment slot
    const newEquipment = [...(this.sheet.equipment || [])];
    const equipSrcIdx = newEquipment.indexOf(item);
    if (equipSrcIdx !== -1) {
      newEquipment[equipSrcIdx] = existingItem;
    } else {
      newEquipment.push(existingItem);
    }
    // Place the incoming item at the target slot (sparse — preserve all other positions)
    const newInv = [...padded] as (ItemBlock | null)[];
    newInv[tgtSlot] = item;
    while (newInv.length > 0 && newInv[newInv.length - 1] === null) newInv.pop();
    this.sheet.inventory = newInv;
    this.sheet.equipment = newEquipment;
    this.patch.emit({ path: 'equipment', value: newEquipment });
  } else {
    // Empty target slot: place item at that position (or extend array as needed)
    const newInv = [...(this.sheet.inventory || [])] as (ItemBlock | null)[];
    while (newInv.length <= tgtSlot) newInv.push(null);
    newInv[tgtSlot] = item;
    while (newInv.length > 0 && newInv[newInv.length - 1] === null) newInv.pop();
    this.sheet.inventory = newInv;
    this.sheet.equipment = (this.sheet.equipment || []).filter(e => e !== item);
    this.patch.emit({ path: 'equipment', value: this.sheet.equipment });
  }
  this.unfoldedItems.clear();
  this.activeTabPerRow.clear();
  this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
}

  /** Pull one entry out of the shared bag into a specific slot (drag target). */
  private async takeFromPartyStash(
    entry: PartyStashEntry, targetSlot: number, amount?: number,
  ): Promise<void> {
    const item = await this.partyStash.withdraw(entry.entryId, amount);
    if (!item) return; // someone else got it — nothing changes here

    const newInv = [...(this.sheet.inventory || [])] as (ItemBlock | null)[];
    const slot = Math.max(0, targetSlot);
    // Landing on the same kind of item stacks with it.
    if (canMerge(newInv[slot], item)) {
      newInv[slot] = withAmount(newInv[slot]!, stackAmount(newInv[slot]) + stackAmount(item));
    } else if (newInv[slot]) {
      const free = newInv.findIndex(s => s === null || s === undefined);
      if (free >= 0) newInv[free] = item;
      else newInv.push(item);
    } else {
      while (newInv.length <= slot) newInv.push(null);
      newInv[slot] = item;
    }
    while (newInv.length > 0 && newInv[newInv.length - 1] === null) newInv.pop();
    this.sheet.inventory = newInv as typeof this.sheet.inventory;
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
  }

  /**
   * Move `carried` units from `src` to `tgt`, leaving the remainder behind. Returns false when
   * the target cannot take them (something else is sitting there), in which case nothing moves —
   * dropping half a stack onto an unrelated item has no sensible meaning.
   */
  private placeSplit(
    padded: (ItemBlock | null)[], src: number, tgt: number, carried: number, total: number,
  ): boolean {
    const source = padded[src];
    if (!source) return false;

    const target = padded[tgt];
    if (target && !canMerge(target, source)) return false;

    padded[tgt] = target
      ? withAmount(target, stackAmount(target) + carried)
      : withAmount(source, carried);
    padded[src] = withAmount(source, total - carried);
    return true;
  }

  /** Persist a slot array, trimming the trailing empties. */
  private commitSlots(slots: (ItemBlock | null)[]): void {
    const next = [...slots];
    while (next.length > 0 && next[next.length - 1] === null) next.pop();
    this.sheet.inventory = next as typeof this.sheet.inventory;
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
  }

  onEditingChange(index: number, isEditing: boolean) {
    const newSet = new Set(this.editingItems);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingItems = newSet;
  }

  isItemEditing(index: number): boolean {
    return this.editingItems.has(index);
  }

  isItemUnfolded(index: number): boolean {
    return this.unfoldedItems.has(index);
  }

  /**
   * Returns the 1-based CSS grid-row for inventory item[i],
   * accounting for expansion rows inserted after visual rows with unfolded items.
   */
  getItemGridRow(i: number): number {
    const padded = this.paddedSlots;
    const visualRow = Math.floor(i / 4);
    let extra = 0;
    for (let r = 0; r < visualRow; r++) {
      const start = r * 4;
      const end = Math.min(start + 4, padded.length);
      for (let j = start; j < end; j++) {
        if (this.unfoldedItems.has(j)) { extra++; break; }
      }
    }
    return visualRow + extra + 1;
  }

  /** Returns the 1-based CSS grid-row for the expansion row of item[i]. */
  getExpansionGridRow(i: number): number {
    return this.getItemGridRow(i) + 1;
  }

  /** CSS grid-row for the expansion row belonging to a given visual row index. */
  getExpansionGridRowForVisualRow(visualRow: number): number {
    return this.getItemGridRow(visualRow * 4) + 1;
  }

  onFoldChange(index: number, isFolded: boolean) {
    const row = Math.floor(index / 4);
    if (isFolded) {
      this.unfoldedItems.delete(index);
      // If this was the active tab, switch to another in the same row
      if (this.activeTabPerRow.get(row) === index) {
        const others = [...this.unfoldedItems].filter(j => Math.floor(j / 4) === row);
        if (others.length > 0) {
          this.activeTabPerRow.set(row, others[0]);
        } else {
          this.activeTabPerRow.delete(row);
        }
      }
    } else {
      this.unfoldedItems.add(index);
      this.activeTabPerRow.set(row, index); // newly opened becomes the active tab
      this.updateExpansionRowMaxHeights();
    }
  }

  setActiveTab(row: number, idx: number) {
    this.activeTabPerRow.set(row, idx);
    this.updateExpansionRowMaxHeights();
  }

  /** Tracks the tallest expansion-row height seen per visual row, to prevent height jumps on tab switch */
  private expansionRowMaxHeights = new Map<number, number>();

  /** Returns the corner radius CSS value for an expansion row based on the active chip column */
  getExpansionBorderRadius(chipCol: number): string {
    if (chipCol === 0) return '0 6px 6px 6px';
    if (chipCol === 3) return '6px 0 6px 6px';
    return '6px';
  }

  /** Returns the reserved min-height for this expansion row (max ever seen) */
  getExpansionMinHeight(row: number): number | null {
    return this.expansionRowMaxHeights.get(row) ?? null;
  }

  /** Measures all currently rendered expansion rows and updates the max-height map */
  private updateExpansionRowMaxHeights() {
    setTimeout(() => {
      const rows = (this.elRef.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-exp-row]');
      rows.forEach(el => {
        const rowIdx = parseInt(el.getAttribute('data-exp-row')!, 10);
        const h = el.offsetHeight;
        const prev = this.expansionRowMaxHeights.get(rowIdx) ?? 0;
        if (h > prev) this.expansionRowMaxHeights.set(rowIdx, h);
      });
    });
  }

  /** Returns the visual 0-based row for a padded slot index */
  getVisualRow(i: number): number {
    return Math.floor(i / 4);
  }

  /** Returns true if this chip is the currently active expansion tab for its row */
  isActiveTab(i: number): boolean {
    const row = this.getVisualRow(i);
    const active = this.activeTabPerRow.get(row);
    return active === i || (active === undefined && this.expansionRows.find(e => e.row === row)?.unfolded[0] === i);
  }

  // Open full-screen item editor
  openItemEditor(index: number) {
    this.editingItemIndex = index;
    this.editingItem = this.sheet.inventory[index];
    this.showItemEditor = true;
  }

  // Create new item via full-screen editor
  openNewItemEditor() {
    this.editingItemIndex = null;
    this.editingItem = null;
    this.showItemEditor = true;
  }

  closeItemEditor() {
    this.showItemEditor = false;
    this.editingItemIndex = null;
    this.editingItem = null;
  }

  saveItemFromEditor(item: ItemBlock) {
    if (this.editingItemIndex !== null) {
      // Update existing item
      this.sheet.inventory[this.editingItemIndex] = item;
      this.sheet.inventory = [...this.sheet.inventory];
      this.patch.emit({
        path: `inventory.${this.editingItemIndex}`,
        value: item,
      });
    } else {
      // Create new item
      this.sheet.inventory = [...this.sheet.inventory, item];
      this.patch.emit({
        path: 'inventory',
        value: this.sheet.inventory,
      });
    }
    this.closeItemEditor();
  }

  // Break test: Roll d20, need to roll <= 10 to survive
  // Modifier: -5 + (100 - durability) / 10
  async performBreakTest(index: number) {
    const item = this.sheet.inventory[index];
    if (!item || item.broken) return;

    // Calculate break test modifier
    // As durability gets lower, modifier gets higher (harder to survive)
    // At 0 durability: -5 + 100/10 = -5 + 10 = +5
    // At 50 durability: -5 + 50/10 = -5 + 5 = 0
    // At 100 durability: -5 + 0/10 = -5
    const durability = item.durability || 0;
    const modifier = Math.floor(-5 + (100 - durability) / 10);

    // Roll d20
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + modifier;
    
    const survived = total <= 10;
    const resultText = survived ? 'überlebt' : 'zerbrochen';
    
    // Send roll to lobby
    if (this.sheet.worldName) {
      this.worldSocket.sendDiceRoll({
        id: `${Date.now()}-${Math.random()}`,
        worldName: this.sheet.worldName,
        characterName: this.sheet.name,
        characterId: this.sheet.id || '',
        diceType: 20,
        diceCount: 1,
        bonuses: modifier !== 0 ? [{ name: 'Bruchtest-Modifier', value: modifier, source: 'item' }] : [],
        result: total,
        rolls: [roll],
        timestamp: new Date(),
        isSecret: false
      });
    }

    // Update item state
    if (!survived) {
      const invItem = this.sheet.inventory[index];
      if (invItem) invItem.broken = true;
      this.sheet.inventory = [...this.sheet.inventory];
      this.patch.emit({
        path: `inventory.${index}.broken`,
        value: true,
      });
    }
    
    const message = `Bruchtest für ${item.name}: ${roll} ${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''} = ${total}\n${item.name} ${resultText}!`;
    if (survived) {
      this.notification.success(message, 5000);
    } else {
      this.notification.error(message, 5000);
    }
  }

  // Get available skills from sheet for item editor
  getAvailableSkills(): { id: string; name: string }[] {
    return (this.sheet.skills || []).map(s => ({ id: s.name, name: s.name }));
  }

  // Get available spells from sheet for item editor
  getAvailableSpells(): { id: string; name: string }[] {
    return (this.sheet.spells || []).map(s => ({ id: s.name, name: s.name }));
  }
}

