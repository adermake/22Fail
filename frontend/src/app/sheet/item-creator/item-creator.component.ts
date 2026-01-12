import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemBlock } from '../../model/item-block.model';

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
  };

  createItem() {
    if (!this.newItem.name.trim()) {
      alert('Item name is required');
      return;
    }

    this.create.emit({ ...this.newItem });
    
    // Reset form
    this.newItem = {
      name: '',
      lost: false,
      description: '',
      weight: 0,
      requirements: {},
    };
  }

  cancelCreate() {
    this.cancel.emit();
  }
}