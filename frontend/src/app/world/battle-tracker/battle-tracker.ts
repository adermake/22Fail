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
  @Output() syncTurns = new EventEmitter<{ sourceId: string; targetId: string }>();
  @Output() setTurnOrder = new EventEmitter<{ characterId: string; position: number }>();

  draggedParticipant: string | null = null;

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

      // Advance their turn using same formula as actual turn advancement
      // Higher speed = smaller increment = more frequent turns
      next.nextTurnAt = next.nextTurnAt + (1000 / next.speed);
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

  // Drag and drop handlers for participants list
  onDragStartParticipant(event: DragEvent, characterId: string) {
    this.draggedParticipant = characterId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', characterId);
    }
  }

  onDragOverParticipant(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDropOnParticipant(event: DragEvent, targetId: string) {
    event.preventDefault();
    if (this.draggedParticipant && this.draggedParticipant !== targetId) {
      // Sync the dragged character's turn with the target character
      this.syncTurns.emit({ sourceId: this.draggedParticipant, targetId });
    }
    this.draggedParticipant = null;
  }

  // Drag and drop handlers for turn queue
  onDragStartQueue(event: DragEvent, characterId: string) {
    this.draggedParticipant = characterId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', characterId);
    }
  }

  onDragOverQueue(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDropOnQueue(event: DragEvent, position: number) {
    event.preventDefault();
    if (this.draggedParticipant) {
      // Set the character to appear at this position in the queue
      this.setTurnOrder.emit({ characterId: this.draggedParticipant, position });
    }
    this.draggedParticipant = null;
  }

  onDragEnd() {
    this.draggedParticipant = null;
  }
}
