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
      event.dataTransfer.setData('characterId', characterId);
      event.dataTransfer.effectAllowed = 'copy';
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
