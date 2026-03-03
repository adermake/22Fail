import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragRelease, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
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
  placeholderHeight = '90px';
  placeholderWidth = '100%';
  /** Index of the item currently being dragged (for compact ghost) */
  draggedIndex: number | null = null;

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

  onDragStarted(event: CdkDragStart) {
    // Always use compact fixed height for placeholder - item collapses during drag
    this.placeholderHeight = '52px';
    this.placeholderWidth = '100%';
    // Track which item is being dragged so we can force-collapse it
    const draggedItem = event.source.data as ItemBlock;
    this.draggedIndex = this.sheet.inventory.indexOf(draggedItem);
  }

  onDragReleased(event: CdkDragRelease) {
    this.draggedIndex = null;
  }

onDrop(event: CdkDragDrop<ItemBlock[]>) {
  this.draggedIndex = null;

  if (event.previousContainer === event.container) {
    const prev = event.previousIndex;
    const curr = event.currentIndex;
    if (prev === curr) return;

    // Swap the two items (Minecraft-style fixed grid)
    const newInventory = [...this.sheet.inventory];
    [newInventory[prev], newInventory[curr]] = [newInventory[curr], newInventory[prev]];
    this.sheet.inventory = newInventory;

    // Swap fold-tracking to follow the items
    const prevWasUnfolded = this.unfoldedItems.has(prev);
    const currWasUnfolded = this.unfoldedItems.has(curr);
    if (prevWasUnfolded) this.unfoldedItems.add(curr); else this.unfoldedItems.delete(curr);
    if (currWasUnfolded) this.unfoldedItems.add(prev); else this.unfoldedItems.delete(prev);

    this.patch.emit({ path: 'inventory', value: newInventory });
  } else {
    // Transfer from equipment to inventory — try swap if occupied slot, else place
    const item = event.previousContainer.data[event.previousIndex];
    const targetIndex = event.currentIndex;
    const existingItem = this.sheet.inventory[targetIndex];

    const newInventory = [...this.sheet.inventory];

    if (existingItem) {
      // Swap: put inventory item back to equipment source position
      const newEquipment = [...(this.sheet.equipment || [])];
      const equipSrcIdx = newEquipment.indexOf(item);
      if (equipSrcIdx !== -1) {
        newEquipment[equipSrcIdx] = existingItem;
        existingItem.armorType = item.armorType; // inherit slot type
      } else {
        newEquipment.push(existingItem);
      }
      newInventory[targetIndex] = item;
      this.sheet.equipment = newEquipment;
      this.sheet.inventory = newInventory;
      this.patch.emit({ path: 'equipment', value: newEquipment });
    } else {
      // Empty slot – just place
      newInventory.splice(targetIndex, 0, item);
      this.sheet.equipment = (this.sheet.equipment || []).filter((_, i) => i !== event.previousIndex);
      this.sheet.inventory = newInventory;
      this.patch.emit({ path: 'equipment', value: this.sheet.equipment });
    }
    this.patch.emit({ path: 'inventory', value: this.sheet.inventory });
    this.unfoldedItems.clear();
  }
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

  onFoldChange(index: number, isFolded: boolean) {
    if (isFolded) {
      this.unfoldedItems.delete(index);
    } else {
      this.unfoldedItems.add(index);
    }
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

