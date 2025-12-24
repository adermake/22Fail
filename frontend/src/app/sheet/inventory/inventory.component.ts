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

@Component({
  selector: 'app-inventory',
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
    return this.sheet.inventory?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
  }

  get maxCapacity(): number {
    const strength = this.sheet.strength?.current * 8 || 10;
    return strength * this.sheet.carryCapacityMultiplier + this.sheet.carryCapacityBonus;
  }

  get encumbrancePercentage(): number {
    return (this.totalWeight / this.maxCapacity) * 100;
  }

  get encumbranceColor(): string {
    const percentage = this.encumbrancePercentage;
    if (percentage < 50) {
      return '#4caf50'; // Green
    } else if (percentage < 100) {
      return '#ffd700'; // Yellow
    } else if (percentage < 125) {
      return '#ff9800'; // Orange
    } else {
      return '#f44336'; // Red
    }
  }

  get encumbranceClass(): string {
    const percentage = this.encumbrancePercentage;
    if (percentage < 50) return 'light';
    if (percentage < 75) return 'medium';
    if (percentage < 100) return 'heavy';
    return 'overencumbered';
  }

  updateCapacitySetting(field: string, value: any) {
    (this.sheet as any)[field] = value;
    this.patch.emit({ path: field, value: Number(value) });
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
    this.sheet.inventory = this.sheet.inventory.filter((_, i) => i !== index);
    this.patch.emit({
      path: 'inventory',
      value: this.sheet.inventory,
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
    
    // Add to inventory
    this.sheet.inventory = [...this.sheet.inventory];
    this.sheet.inventory.splice(event.currentIndex, 0, item);
    
    // Remove from equipment
    this.sheet.equipment = this.sheet.equipment.filter((_, i) => i !== event.previousIndex);
    
    // Emit both changes
    this.patch.emit({
      path: 'inventory',
      value: this.sheet.inventory,
    });
    this.patch.emit({
      path: 'equipment',
      value: this.sheet.equipment,
    });
  }
}

  onEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingItems.add(index);
    } else {
      this.editingItems.delete(index);
    }
  }

  isItemEditing(index: number): boolean {
    return this.editingItems.has(index);
  }
}
