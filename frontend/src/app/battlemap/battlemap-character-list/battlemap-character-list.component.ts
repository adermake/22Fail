import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { BattlemapToken } from '../../model/battlemap.model';

@Component({
  selector: 'app-battlemap-character-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battlemap-character-list.component.html',
  styleUrl: './battlemap-character-list.component.css',
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
      event.dataTransfer.effectAllowed = 'move';
      
      // Get character info for drag image
      const char = this.characters.find(c => c.id === characterId);
      
      // Create custom hex drag image with portrait
      const dragImg = document.createElement('canvas');
      dragImg.width = 100;
      dragImg.height = 100;
      const ctx = dragImg.getContext('2d');
      
      if (ctx) {
        // Draw hexagon
        ctx.save();
        ctx.translate(50, 50);
        
        // Hexagon path (flat-top)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 180) * (60 * i);
          const x = 40 * Math.cos(angle);
          const y = 40 * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        // Fill with blue
        ctx.fillStyle = 'rgba(96, 165, 250, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(59, 130, 246, 1)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw character name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const name = char?.sheet.name || 'Token';
        ctx.fillText(name.substring(0, 8), 0, 0);
        
        ctx.restore();
      }
      
      dragImg.style.position = 'absolute';
      dragImg.style.top = '-1000px';
      document.body.appendChild(dragImg);
      event.dataTransfer.setDragImage(dragImg, 50, 50);
      setTimeout(() => document.body.removeChild(dragImg), 0);
      
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
