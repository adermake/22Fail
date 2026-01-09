import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { LootItem } from '../../model/world.model';

@Component({
  selector: 'app-loot-popup',
  imports: [CommonModule, CardComponent],
  templateUrl: './loot-popup.component.html',
  styleUrl: './loot-popup.component.css',
})
export class LootPopupComponent {
  @Input() loot: LootItem[] = [];
  @Input() isBattleLoot: boolean = false;
  @Output() claimItem = new EventEmitter<LootItem>();
  @Output() close = new EventEmitter<void>();

  onClaim(item: LootItem) {
    this.claimItem.emit(item);
  }

  onClose() {
    this.close.emit();
  }
}
