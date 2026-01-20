import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ItemComponent } from '../item/item.component';
import { ItemCreatorComponent } from '../item-creator/item-creator.component';
import { FormsModule } from '@angular/forms';
import { COIN_WEIGHT } from '../../model/currency-model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ItemComponent,
    CardComponent,
    ItemCreatorComponent,
    DragDropModule,
    FormsModule,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  Math = Math; // Expose Math to template

  showCreateDialog = false;
  showSettingsDialog = false;
  private editingItems = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';

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
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    this.placeholderHeight = `${rect.height}px`;
    this.placeholderWidth = `${rect.width}px`;
  }

onDrop(event: CdkDragDrop<ItemBlock[]>) {
  if (event.previousContainer === event.container) {
    // Reorder within inventory
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    if (previousIndex === currentIndex) {
      return;
    }

    const newInventory = [...this.sheet.inventory];
    moveItemInArray(newInventory, previousIndex, currentIndex);
    
    this.sheet.inventory = newInventory;
    
    this.patch.emit({
      path: 'inventory',
      value: newInventory,
    });
  } else {
    // Transfer from equipment to inventory
    const item = event.previousContainer.data[event.previousIndex];
    
    // Remove from equipment
    this.sheet.equipment = this.sheet.equipment.filter((_, i) => i !== event.previousIndex);
    
    // Add to inventory
    const newInventory = [...this.sheet.inventory];
    newInventory.splice(event.currentIndex, 0, item);
    this.sheet.inventory = newInventory;
    
    // Emit both changes
    this.patch.emit({
      path: 'equipment',
      value: this.sheet.equipment,
    });
    this.patch.emit({
      path: 'inventory',
      value: this.sheet.inventory,
    });
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
}

