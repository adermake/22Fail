import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { BattlemapToken, HexMath } from '../../model/battlemap.model';

@Component({
  selector: 'app-battlemap-character-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battlemap-character-list.component.html',
  styleUrl: './battlemap-character-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlemapCharacterListComponent {
  @Input() characters: { id: string; sheet: CharacterSheet }[] = [];
  @Input() tokensOnMap: BattlemapToken[] = [];

  isOnMap(characterId: string): boolean {
    return this.tokensOnMap.some(t => t.characterId === characterId);
  }

  onDragStart(event: DragEvent, characterId: string) {
    if (event.dataTransfer) {
      // Use text/plain for better browser compatibility
      event.dataTransfer.setData('text/plain', characterId);
      event.dataTransfer.effectAllowed = 'copy';
      
      // Get character info for drag image
      const char = this.characters.find(c => c.id === characterId);
      
      // Create custom hex drag image matching the token appearance
      // Use the same size as tokens for consistency
      const size = Math.round(HexMath.HEIGHT * 0.9);
      const dragImg = document.createElement('canvas');
      dragImg.width = size;
      dragImg.height = size;
      const ctx = dragImg.getContext('2d');
      
      if (ctx) {
        ctx.save();
        ctx.translate(size / 2, size / 2);
        
        // Create hexagon clip path (flat-top)
        ctx.beginPath();
        const hexRadius = size / 2 - 2;
        for (let i = 0; i < 6; i++) {
          // Flat-top hex corners at 0°, 60°, 120°, etc.
          const angle = (Math.PI / 180) * (60 * i);
          const x = hexRadius * Math.cos(angle);
          const y = hexRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // Fill with team color (default blue)
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw character initials
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.round(size * 0.25)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const name = char?.sheet.name || 'Token';
        const initials = name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
        ctx.fillText(initials, 0, 0);
        
        ctx.restore();
      }
      
      // Position off-screen and set as drag image
      dragImg.style.position = 'absolute';
      dragImg.style.left = '-9999px';
      dragImg.style.top = '-9999px';
      document.body.appendChild(dragImg);
      event.dataTransfer.setDragImage(dragImg, size / 2, size / 2);
      
      // Clean up after a short delay
      requestAnimationFrame(() => {
        document.body.removeChild(dragImg);
      });
      
      console.log('[CHARACTER LIST] Drag started for character', characterId);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
