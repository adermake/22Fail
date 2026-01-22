import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattlemapToken, HexMath } from '../../model/battlemap.model';

@Component({
  selector: 'app-battlemap-token',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battlemap-token.component.html',
  styleUrl: './battlemap-token.component.css',
})
export class BattlemapTokenComponent {
  @Input({ required: true }) token!: BattlemapToken;
  @Input() isCurrentTurn = false;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };
  @Input() scale = 1;

  @Output() dragStart = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() remove = new EventEmitter<void>();

  showContextMenu = false;

  // Get the world position directly from hex coordinates
  get worldPosition(): { x: number; y: number } {
    return HexMath.hexToPixel(this.token.position);
  }

  // Size based on hex
  get tokenSize(): number {
    return HexMath.SIZE * 1.8; // Slightly smaller than hex
  }

  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('tokenId', this.token.id);
      event.dataTransfer.effectAllowed = 'move';
    }
    this.dragStart.emit();
  }

  onDragEnd(event: DragEvent) {
    this.dragEnd.emit(event);
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.showContextMenu = !this.showContextMenu;
  }

  onRemove() {
    this.showContextMenu = false;
    this.remove.emit();
  }

  closeContextMenu() {
    this.showContextMenu = false;
  }

  // Get initials for fallback
  get initials(): string {
    const name = this.token.characterName || 'Unknown';
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // Team color for border
  get teamColor(): string {
    switch (this.token.team) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'purple': return '#a855f7';
      default: return '#60a5fa';
    }
  }
}
