import { Component, EventEmitter, Input, Output,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { ItemComponent } from '../item/item.component';
import { ItemEditorComponent } from '../item-editor/item-editor.component';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { WorldSocketService } from '../../services/world-socket.service';
import { NotificationService } from '../../services/notification.service';

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
  private notification = inject(NotificationService);

  private editingItems = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';
  
  // Item editor state
  showItemEditor = false;
  editingItemIndex: number | null = null;
  editingItem: ItemBlock | null = null;

  // Connected drop lists - safely connect to inventory and other slots
  get connectedDropLists(): string[] {
    try {
      return ['inventoryList', 'helmetSlot', 'chestplateSlot', 'armschienenSlot', 'leggingsSlot', 'bootsSlot', 'extraSlot'];
    } catch {
      return [];
    }
  }

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

  // Get items for a specific armor slot
  getArmorSlot(slotType: 'helmet' | 'chestplate' | 'armschienen' | 'leggings' | 'boots' | 'extra'): ItemBlock[] {
    if (!this.sheet.equipment) return [];
    return this.sheet.equipment.filter(item => (item.armorType || 'extra') === slotType);
  }

  // Get the global equipment index for an item
  getItemIndex(item: ItemBlock): number {
    return this.sheet.equipment?.indexOf(item) ?? -1;
  }

  // Handle drop into armor slots with validation
  onSlotDrop(event: CdkDragDrop<ItemBlock[]>, targetSlot: string) {
    if (event.previousContainer === event.container) {
      // Same slot - ignore for all slots except extra
      if (targetSlot !== 'extra') {
        return; // Single-item slots: don't allow reordering
      }
      // For extra slot, allow reordering within the slot
      const item = event.previousContainer.data[event.previousIndex];
      
      // Remove and re-add to equipment in new position
      const equipmentIndex = this.sheet.equipment.indexOf(item);
      this.sheet.equipment.splice(equipmentIndex, 1);
      
      // Find new position among extra items
      const extraItems = this.getArmorSlot('extra');
      const beforeItem = extraItems[event.currentIndex];
      if (beforeItem) {
        const beforeIndex = this.sheet.equipment.indexOf(beforeItem);
        this.sheet.equipment.splice(beforeIndex, 0, item);
      } else {
        this.sheet.equipment.push(item);
      }
      
      this.patch.emit({
        path: 'equipment',
        value: this.sheet.equipment,
      });
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      const isFromInventory = event.previousContainer.id === 'inventoryList';
      
      // Note: Validation is now handled by enter predicates, so we don't need to check here
      
      // Set the armor type if moving from inventory or if not set
      if (!item.armorType || item.armorType === 'extra') {
        item.armorType = targetSlot as any;
      }
      
      if (isFromInventory) {
        // Remove from inventory
        this.sheet.inventory = this.sheet.inventory.filter((_, i) => i !== event.previousIndex);
        
        // Add to equipment
        this.sheet.equipment.push(item);
        
        // Emit both patches
        this.patch.emit({
          path: 'inventory',
          value: this.sheet.inventory,
        });
        this.patch.emit({
          path: 'equipment',
          value: this.sheet.equipment,
        });
      } else {
        // Moving between equipment slots
        // Item is already in equipment, just update its armorType
        const equipmentIndex = this.sheet.equipment.indexOf(item);
        if (equipmentIndex !== -1) {
          this.sheet.equipment[equipmentIndex].armorType = targetSlot as any;
          this.sheet.equipment = [...this.sheet.equipment];
          
          this.patch.emit({
            path: 'equipment',
            value: this.sheet.equipment,
          });
        }
      }
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

  // Predicate functions to prevent invalid drops
  canDropInHelmet = (drag: any, drop: any) => {
    const item = drag?.data as ItemBlock;
    if (!item) return false;
    return this.canDropInSlot(item, 'helmet');
  };

  canDropInChestplate = (drag: any, drop: any) => {
    const item = drag?.data as ItemBlock;
    if (!item) return false;
    return this.canDropInSlot(item, 'chestplate');
  };

  canDropInArmschienen = (drag: any, drop: any) => {
    const item = drag?.data as ItemBlock;
    if (!item) return false;
    return this.canDropInSlot(item, 'armschienen');
  };

  canDropInLeggings = (drag: any, drop: any) => {
    const item = drag?.data as ItemBlock;
    if (!item) return false;
    return this.canDropInSlot(item, 'leggings');
  };

  canDropInBoots = (drag: any, drop: any) => {
    const item = drag?.data as ItemBlock;
    if (!item) return false;
    return this.canDropInSlot(item, 'boots');
  };

  canDropInExtra = (drag: any, drop: any) => {
    // Extra slot accepts anything
    return true;
  };

  private canDropInSlot(item: ItemBlock, targetSlot: string): boolean {
    if (!item) return false;
    
    // Extra slot accepts everything
    if (targetSlot === 'extra') return true;
    
    // All other slots only accept armor type items
    if (item.itemType !== 'armor') {
      return false;
    }
    
    // Check if item type matches slot
    const itemType = item.armorType || 'extra';
    
    // Item must match the slot or have no specific slot (extra)
    if (itemType !== targetSlot && itemType !== 'extra') {
      return false;
    }
    
    // Check if slot is already occupied (single-item slots, except extra)
    const currentSlotItems = this.getArmorSlot(targetSlot as any);
    if (currentSlotItems.length > 0 && !currentSlotItems.includes(item)) {
      return false; // Slot already has an item
    }
    
    return true;
  }
}