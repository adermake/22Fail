import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemBlock, StatModifier } from '../../model/item-block.model';

@Component({
  selector: 'app-item-creator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-creator.component.html',
  styleUrl: './item-creator.component.css',
})
export class ItemCreatorComponent {
  @Output() create = new EventEmitter<ItemBlock>();
  @Output() cancel = new EventEmitter<void>();

  newItem: ItemBlock = {
    name: '',
    description: '',
    weight: 0,
    lost: false,
    requirements: {},
    statModifiers: []
  };

  // Track stat modifiers being edited
  tempModifiers: {[key: string]: number} = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    constitution: 0,
    chill: 0,
    mana: 0,
    life: 0,
    energy: 0
  };

  createItem() {
    if (!this.newItem.name.trim()) {
      alert('Item name is required');
      return;
    }

    // Build stat modifiers array from temp values
    const statModifiers: StatModifier[] = [];
    Object.entries(this.tempModifiers).forEach(([stat, amount]) => {
      if (amount !== 0) {
        statModifiers.push({
          stat: stat as any,
          amount
        });
      }
    });

    const itemToCreate = {
      ...this.newItem,
      statModifiers: statModifiers.length > 0 ? statModifiers : undefined
    };

    this.create.emit(itemToCreate);
    
    // Reset form
    this.newItem = {
      name: '',
      lost: false,
      description: '',
      weight: 0,
      requirements: {},
      statModifiers: []
    };
    this.tempModifiers = {
      strength: 0,
      dexterity: 0,
      speed: 0,
      intelligence: 0,
      constitution: 0,
      chill: 0,
      mana: 0,
      life: 0,
      energy: 0
    };
  }

  cancelCreate() {
    this.cancel.emit();
  }
}