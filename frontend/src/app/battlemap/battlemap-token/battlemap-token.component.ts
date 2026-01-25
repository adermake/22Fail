import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattlemapToken, HexMath } from '../../model/battlemap.model';

type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure';

@Component({
  selector: 'app-battlemap-token',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battlemap-token.component.html',
  styleUrl: './battlemap-token.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlemapTokenComponent {
  private elementRef = inject(ElementRef);
  
  @Input({ required: true }) token!: BattlemapToken;
  @Input() isCurrentTurn = false;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };
  @Input() scale = 1;
  @Input() currentTool: ToolType = 'cursor';
  @Input() isDragEnabled = false; // Only true when cursor tool is selected
  @Input() syncedTeam?: string; // Team color synced from battleParticipants

  @Output() dragStart = new EventEmitter<{ event: MouseEvent }>();
  @Output() dragMove = new EventEmitter<{ event: MouseEvent }>();
  @Output() dragEnd = new EventEmitter<{ event: MouseEvent }>();
  @Output() remove = new EventEmitter<void>();

  showContextMenu = false;
  isDragging = false;

  // Get the world position directly from hex coordinates
  get worldPosition(): { x: number; y: number } {
    return HexMath.hexToPixel(this.token.position);
  }

  // Token dimensions based on hex - for flat-top hex, width > height
  get tokenWidth(): number {
    // Use 90% of hex width (point to point horizontally)
    return HexMath.WIDTH * 0.9;
  }
  
  get tokenHeight(): number {
    // Use 90% of hex height (flat edge to flat edge vertically)
    return HexMath.HEIGHT * 0.9;
  }
  
  // Check if dragging is allowed (only with cursor tool)
  get canDrag(): boolean {
    return this.currentTool === 'cursor';
  }

  onPointerDown(event: PointerEvent) {
    this.onMouseDown(event);
  }

  onMouseDown(event: MouseEvent) {
    // Only allow dragging with cursor tool and left mouse button
    if (!this.canDrag || event.button !== 0) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = true;
    this.dragStart.emit({ event });
  }
  
  @HostListener('document:pointermove', ['$event'])
  onDocumentPointerMove(event: PointerEvent) {
    this.onDocumentMouseMove(event);
  }
  
  @HostListener('document:pointerup', ['$event'])
  onDocumentPointerUp(event: PointerEvent) {
    this.onDocumentMouseUp(event);
  }
  
  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    this.dragMove.emit({ event });
  }
  
  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    
    // Only end drag on left-click release, not right-click
    if (event.button !== 0) return;
    
    this.isDragging = false;
    this.dragEnd.emit({ event });
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
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

  // Team color for border - use synced team from battleParticipants if available
  get teamColor(): string {
    const team = this.syncedTeam || this.token.team;
    switch (team) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'purple': return '#a855f7';
      default: return '#60a5fa';
    }
  }
}
