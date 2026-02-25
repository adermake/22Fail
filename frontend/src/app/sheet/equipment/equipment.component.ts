import { Component, EventEmitter, Input, Output,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { ItemComponent } from '../item/item.component';
import { ItemEditorComponent } from '../item-editor/item-editor.component';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { WorldSocketService } from '../../services/world-socket.service';

@Component({
  selector: 'app-equipment',
  imports: [CommonModule, ItemComponent, ItemEditorComponent, CardComponent, DragDropModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.css',
})
export class EquipmentComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  
  private worldSocket = inject(WorldSocketService);

  private editingItems = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';
  
  // Item editor state
  showItemEditor = false;
  editingItemIndex: number | null = null;
  editingItem: ItemBlock | null = null;

  ngOnInit() {
    if (!this.sheet.equipment) {
      this.sheet.equipment = [];
    }
  }

  get armorWeight(): number {
    return this.sheet.equipment?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
  }

  get totalArmorDebuff(): number {
    // Sum of all individual armor debuffs divided by 5, then subtract negation
    // Also add +5 penalty for each broken armor piece
    let sumOfArmorDebuffs = 0;
    let brokenArmorPenalty = 0;
    
    for (const item of (this.sheet.equipment || [])) {
      sumOfArmorDebuffs += item.armorDebuff || 0;
      
      // Broken armor gives +5 penalty
      if (item.broken && item.itemType === 'armor') {
        brokenArmorPenalty += 5;
      }
    }
    
    const armorPenalty = sumOfArmorDebuffs / 5;
    const negation = this.sheet.speedPenaltyNegation || 0;
    
    return Math.max(0, armorPenalty + brokenArmorPenalty - negation);
  }

  get effectiveSpeed(): number {
    const baseSpeed = this.sheet.speed?.current || 0;
    return Math.max(0, baseSpeed - this.totalArmorDebuff);
  }

  deleteItem(index: number) {
    const item = this.sheet.equipment[index];
    this.sheet.equipment = this.sheet.equipment.filter((_, i) => i !== index);

    // Add to trash
    const trash = this.sheet.trash || [];
    trash.push({
      type: 'equipment',
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
    });
    this.editingItems = newSet;

    this.patch.emit({
      path: 'equipment',
      value: this.sheet.equipment,
    });
    this.patch.emit({
      path: 'trash',
      value: trash,
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
    const item = event.previousContainer.data[event.previousIndex];
    
    // Remove from inventory
    this.sheet.inventory = this.sheet.inventory.filter((_, i) => i !== event.previousIndex);
    
    // Add to equipment
    const newEquipment = [...this.sheet.equipment];
    newEquipment.splice(event.currentIndex, 0, item);
    this.sheet.equipment = newEquipment;
    
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

  // Open full-screen item editor
  openItemEditor(index: number) {
    this.editingItemIndex = index;
    this.editingItem = this.sheet.equipment[index];
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
      this.sheet.equipment[this.editingItemIndex] = item;
      this.sheet.equipment = [...this.sheet.equipment];
      this.patch.emit({
        path: `equipment.${this.editingItemIndex}`,
        value: item,
      });
    }
    this.closeItemEditor();
  }

  // Break test for equipment items
  async performBreakTest(index: number) {
    const item = this.sheet.equipment[index];
    if (!item || item.broken) return;

    // Calculate break test modifier
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
      this.sheet.equipment[index].broken = true;
      this.sheet.equipment = [...this.sheet.equipment];
      this.patch.emit({
        path: `equipment.${index}.broken`,
        value: true,
      });
    }
    
    // Show result message
    setTimeout(() => {
      alert(`Bruchtest für ${item.name}: ${roll} + ${modifier} = ${total}\\n${item.name} ${resultText}!`);
    }, 100);
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