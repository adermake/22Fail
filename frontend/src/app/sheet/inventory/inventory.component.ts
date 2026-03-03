import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { ItemComponent } from '../item/item.component';
import { ItemCreatorComponent } from '../item-creator/item-creator.component';
import { ItemEditorComponent } from '../item-editor/item-editor.component';
import { FormsModule } from '@angular/forms';
import { COIN_WEIGHT } from '../../model/currency-model';
import { WorldSocketService } from '../../services/world-socket.service';
import { NotificationService } from '../../services/notification.service';
import { CurrentEvent, ShopEvent, LootBundleEvent, formatCurrency } from '../../model/current-events.model';

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
export class InventoryComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() currentEvents: CurrentEvent[] = [];
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() buyFromShop = new EventEmitter<any>();
  @Output() claimLoot = new EventEmitter<any>();
  
  private worldSocket = inject(WorldSocketService);
  private notification = inject(NotificationService);

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
  /** Set when a cross-container drop was handled by onDrop, so onDragEnded skips same-container swap */
  private crossContainerDropHandled = false;
  /** Index of the item currently being dragged (for compact ghost rendering) */
  draggedIndex: number | null = null;
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

  // Connected drop lists - only connect to equipment if it exists
  get connectedDropLists(): string[] {
    // Try to connect to equipment slots, but handle if they don't exist
    try {
      return ['helmetSlot', 'chestplateSlot', 'armschienenSlot', 'leggingsSlot', 'bootsSlot', 'extraSlot'];
    } catch {
      return [];
    }
  }

  ngOnInit() {
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
  const itemWeight = this.sheet.inventory?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
  const currencyWeight = this.getCurrencyWeight();
  return Math.floor(itemWeight + currencyWeight);
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
    this.sheet.inventory = [...this.sheet.inventory, item];
    this.patch.emit({
      path: 'inventory',
      value: this.sheet.inventory,
    });
    this.closeCreateDialog();
  }

  deleteItem(index: number) {
    const item = this.sheet.inventory[index];
    this.sheet.inventory = this.sheet.inventory.filter((_, i) => i !== index);

    // Add to trash
    const trash = this.sheet.trash || [];
    trash.push({
      type: 'item',
      data: item,
      deletedAt: Date.now()
    });

    // Update editing state: remove the deleted item and shift indices
    const newSet = new Set<number>();
    this.editingItems.forEach(i => {
      if (i < index) {
        newSet.add(i);
      } else if (i > index) {
        newSet.add(i - 1);
      }
      // Skip i === index (the deleted item)
    });
    this.editingItems = newSet;

    // Same for unfolded items
    const newUnfolded = new Set<number>();
    this.unfoldedItems.forEach(i => {
      if (i < index) newUnfolded.add(i);
      else if (i > index) newUnfolded.add(i - 1);
    });
    this.unfoldedItems = newUnfolded;

    this.patch.emit({
      path: 'inventory',
      value: this.sheet.inventory,
    });
    this.patch.emit({
      path: 'trash',
      value: trash,
    });
  }

  updateItem(index: number, patch: JsonPatch) {
    const pathParts = patch.path.split('.');

    if (pathParts.length === 1) {
      (this.sheet.inventory[index] as any)[patch.path] = patch.value;
    } else if (pathParts[0] === 'requirements') {
      if (!this.sheet.inventory[index].requirements) {
        this.sheet.inventory[index].requirements = {};
      }
      (this.sheet.inventory[index].requirements as any)[pathParts[1]] = patch.value;
    }

    this.sheet.inventory = [...this.sheet.inventory];

    this.patch.emit({
      path: `inventory.${index}.${patch.path}`,
      value: patch.value,
    });
  }

  onDragStarted(event: CdkDragStart, slotIdx: number) {
    this.draggedIndex = slotIdx;
    this.dragSourceSlotIdx = slotIdx;
    this.dropTargetSlotIdx = slotIdx; // start at self
  }

  onDragMoved(event: CdkDragMove) {
    // Track which slot is currently under the pointer for visual highlight + drop target
    const els = document.elementsFromPoint(
      event.pointerPosition.x,
      event.pointerPosition.y
    );
    const slotEl = els.find(
      el => (el as HTMLElement).hasAttribute && (el as HTMLElement).hasAttribute('data-slot-idx')
    ) as HTMLElement | undefined;
    if (slotEl) {
      const idx = parseInt(slotEl.getAttribute('data-slot-idx')!);
      this.dropTargetSlotIdx = isNaN(idx) ? null : idx;
    } else {
      this.dropTargetSlotIdx = null;
    }
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

    if (this.crossContainerDropHandled) {
      this.crossContainerDropHandled = false;
      return;
    }

    if (src === null || tgt === null || src === tgt) return;

    // Swap in padded slot space, then compact to inventory
    const padded = this.paddedSlots;
    const unfoldedRefs = new Set(
      [...this.unfoldedItems].map(i => this.sheet.inventory[i]).filter(Boolean)
    );
    [padded[src], padded[tgt]] = [padded[tgt], padded[src]];
    const newInv = padded.filter((x): x is ItemBlock => x !== null);
    this.sheet.inventory = newInv;

    const newUnfolded = new Set<number>();
    newInv.forEach((item, idx) => {
      if (unfoldedRefs.has(item)) newUnfolded.add(idx);
    });
    this.unfoldedItems = newUnfolded;

    // Rebuild activeTabPerRow from new indices
    const newTabPerRow = new Map<number, number>();
    this.activeTabPerRow.forEach((oldActiveIdx, row) => {
      const newActiveItem = this.sheet.inventory.find(
        (_, ni) => unfoldedRefs.has(newInv[ni]) && Math.floor(ni / 4) === row
      );
      const newActiveIdx = newInv.indexOf(newActiveItem!);
      if (newActiveIdx !== -1) newTabPerRow.set(row, newActiveIdx);
    });
    this.activeTabPerRow = newTabPerRow;

    this.patch.emit({ path: 'inventory', value: newInv });
  }

onDrop(event: CdkDragDrop<ItemBlock[]>) {
  // Same-container drops are handled by onDragEnded — skip here
  if (event.previousContainer === event.container) return;

  this.crossContainerDropHandled = true;

  // Equipment → inventory cross-container drop
  const item = event.previousContainer.data[event.previousIndex];
  const tgtSlot = this.dropTargetSlotIdx ?? event.currentIndex;

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
    padded[tgtSlot] = item;
    const compacted = padded.filter((x): x is ItemBlock => x !== null && x !== existingItem);
    this.sheet.inventory = compacted;
    this.sheet.equipment = newEquipment;
    this.patch.emit({ path: 'equipment', value: newEquipment });
  } else {
    // Empty target slot: append to inventory
    const newInv = [...(this.sheet.inventory || []), item];
    this.sheet.inventory = newInv;
    this.sheet.equipment = (this.sheet.equipment || []).filter(e => e !== item);
    this.patch.emit({ path: 'equipment', value: this.sheet.equipment });
  }
  this.unfoldedItems.clear();
  this.activeTabPerRow.clear();
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
    const inventoryLen = this.sheet.inventory?.length || 0;
    const visualRow = Math.floor(i / 4);
    let extra = 0;
    for (let r = 0; r < visualRow; r++) {
      const start = r * 4;
      const end = Math.min(start + 4, inventoryLen);
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
    }
  }

  setActiveTab(row: number, idx: number) {
    this.activeTabPerRow.set(row, idx);
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
      this.sheet.inventory[index].broken = true;
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

