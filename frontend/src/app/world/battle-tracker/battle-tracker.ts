import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleParticipant } from '../../model/world.model';

interface CharacterOption {
  id: string;
  name: string;
  speed: number;
}

@Component({
  selector: 'app-battle-tracker',
  imports: [CommonModule],
  templateUrl: './battle-tracker.html',
  styleUrl: './battle-tracker.css',
})
export class BattleTracker {
  @Input() battleParticipants: BattleParticipant[] = [];
  @Input() currentTurnIndex: number = 0;
  @Input() availableCharacters: CharacterOption[] = [];

  @Output() addParticipant = new EventEmitter<string>();
  @Output() removeParticipant = new EventEmitter<string>();
  @Output() nextTurn = new EventEmitter<void>();
  @Output() resetBattle = new EventEmitter<void>();

  get sortedTurnOrder(): BattleParticipant[] {
    return [...this.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
  }

  get currentTurn(): BattleParticipant | undefined {
    return this.sortedTurnOrder[0];
  }

  get availableToAdd(): CharacterOption[] {
    const participantIds = new Set(this.battleParticipants.map(p => p.characterId));
    return this.availableCharacters.filter(char => !participantIds.has(char.id));
  }

  onAddCharacter(characterId: string) {
    this.addParticipant.emit(characterId);
  }

  onRemoveCharacter(characterId: string) {
    this.removeParticipant.emit(characterId);
  }

  onNextTurn() {
    this.nextTurn.emit();
  }

  onResetBattle() {
    this.resetBattle.emit();
  }
}
