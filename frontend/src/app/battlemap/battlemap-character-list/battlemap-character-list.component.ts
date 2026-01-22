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
      
      // Create custom drag image (hexagon)
      const dragImg = document.createElement('div');
      dragImg.style.width = '80px';
      dragImg.style.height = '80px';
      dragImg.style.background = 'rgba(96, 165, 250, 0.9)';
      dragImg.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      dragImg.style.position = 'absolute';
      dragImg.style.top = '-1000px';
      document.body.appendChild(dragImg);
      event.dataTransfer.setDragImage(dragImg, 40, 40);
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
