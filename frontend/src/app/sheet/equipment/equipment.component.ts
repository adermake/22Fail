import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { ItemComponent } from '../item/item.component';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-equipment',
  imports: [CommonModule, ItemComponent, CardComponent, DragDropModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css',
})
export class EquipmentComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  private editingItems = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';

  ngOnInit() {
    if (!this.sheet.equipment) {
      this.sheet.equipment = [];
    }
  }

  get armorWeight(): number {
    return this.sheet.equipment?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
  }

  deleteItem(index: number) {
    this.sheet.equipment = this.sheet.equipment.filter((_, i) => i !== index);
    this.patch.emit({
      path: 'equipment',
      value: this.sheet.equipment,
    });
  }

  updateItem(index: number, patch: JsonPatch) {
    const pathParts = patch.path.split('.');
    
    if (pathParts.length === 1) {
      (this.sheet.equipment[index] as any)[patch.path] = patch.value;
    } else if (pathParts[0] === 'requirements') {
      if (!this.sheet.equipment[index].requirements) {
        this.sheet.equipment[index].requirements = {};
      }
      (this.sheet.equipment[index].requirements as any)[pathParts[1]] = patch.value;
    }
    
    this.sheet.equipment = [...this.sheet.equipment];
    
    this.patch.emit({
      path: `equipment.${index}.${patch.path}`,
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
    // Reorder within equipment
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    if (previousIndex === currentIndex) {
      return;
    }

    const newEquipment = [...this.sheet.equipment];
    moveItemInArray(newEquipment, previousIndex, currentIndex);
    
    this.sheet.equipment = newEquipment;
    
    this.patch.emit({
      path: 'equipment',
      value: newEquipment,
    });
  } else {
    // Transfer from inventory to equipment
    const newEquipment = [...this.sheet.equipment];
    const newInventory = [...this.sheet.inventory];
    
    transferArrayItem(
      event.previousContainer.data as ItemBlock[],
      newEquipment,
      event.previousIndex,
      event.currentIndex
    );
    
    this.sheet.equipment = newEquipment;
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