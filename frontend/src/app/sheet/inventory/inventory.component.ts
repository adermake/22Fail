import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ItemComponent } from '../item/item.component';
import { ItemCreatorComponent } from '../item-creator/item-creator.component';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, ItemComponent, CardComponent, ItemCreatorComponent, DragDropModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  showCreateDialog = false;
  private editingItems = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';

  ngOnInit() {
    if (!this.sheet.inventory) {
      this.sheet.inventory = [];
    }
  }

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  get totalWeight(): number {
    return this.sheet.inventory?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
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
      // Simple field like name, description, weight
      (this.sheet.inventory[index] as any)[patch.path] = patch.value;
    } else if (pathParts[0] === 'requirements') {
      // Nested requirement field
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