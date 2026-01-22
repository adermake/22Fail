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
  @Input() currentTool: 'select' | 'cursor' | 'draw' | 'erase' | 'measure' = 'cursor';

  @Output() dragStart = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() remove = new EventEmitter<void>();

  showContextMenu = false;
  isDragging = false;

  // Get the world position directly from hex coordinates
  get worldPosition(): { x: number; y: number } {
    return HexMath.hexToPixel(this.token.position);
  }

  // Size based on hex
  get tokenSize(): number {
    return HexMath.SIZE * 1.8; // Slightly smaller than hex
  }

  onDragStart(event: DragEvent) {
    this.isDragging = true;
    
    if (event.dataTransfer) {
      event.dataTransfer.setData('tokenId', this.token.id);
      event.dataTransfer.effectAllowed = 'move';
      
      // Create beautiful hex drag image with portrait
      const size = 80;
      const dragImg = document.createElement('canvas');
      dragImg.width = size;
      dragImg.height = size;
      const ctx = dragImg.getContext('2d');
      
      if (ctx) {
        ctx.save();
        ctx.translate(size/2, size/2);
        
        // Hexagon path (flat-top)
        ctx.beginPath();
        const hexRadius = size/2 - 4;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 180) * (60 * i);
          const x = hexRadius * Math.cos(angle);
          const y = hexRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // Fill with gradient
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, hexRadius);
        grad.addColorStop(0, this.teamColor);
        grad.addColorStop(1, this.darkenColor(this.teamColor, 30));
        ctx.fillStyle = grad;
        ctx.fill();
        
        // Outer glow
        ctx.shadowColor = this.teamColor;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw character initials
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.initials, 0, 0);
        
        ctx.restore();
      }
      
      dragImg.style.position = 'absolute';
      dragImg.style.top = '-1000px';
      document.body.appendChild(dragImg);
      event.dataTransfer.setDragImage(dragImg, size/2, size/2);
      setTimeout(() => document.body.removeChild(dragImg), 0);
    }
    this.dragStart.emit();
  }

  onDragEnd(event: DragEvent) {
    this.isDragging = false;
    this.dragEnd.emit(event);
  }
  
  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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
