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

  // Generate turn queue showing next N turns
  get turnQueue(): BattleParticipant[] {
    if (this.battleParticipants.length === 0) return [];

    // Create a simulated queue of next 10 turns
    const queue: BattleParticipant[] = [];
    const participants = this.battleParticipants.map(p => ({ ...p }));

    for (let i = 0; i < 10; i++) {
      // Find who goes next
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];

      // Add to queue
      queue.push({ ...next });

      // Advance their turn
      next.nextTurnAt = next.nextTurnAt + (100 / next.speed);
    }

    return queue;
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
