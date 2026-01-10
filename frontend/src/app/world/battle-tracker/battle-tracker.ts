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
  dragOverIndex: number | null = null;
  completingTurn = false;

  get sortedTurnOrder(): BattleParticipant[] {
    return [...this.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
  }

  get currentTurn(): BattleParticipant | undefined {
    return this.sortedTurnOrder[0];
  }

  // Generate turn queue showing next N turns with grouping
  get turnQueue(): Array<{ participants: BattleParticipant[], nextTurnAt: number }> {
    if (this.battleParticipants.length === 0) return [];

    const queue: BattleParticipant[] = [];
    const participants = this.battleParticipants.map(p => ({ ...p }));

    for (let i = 0; i < 15; i++) {
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];
      queue.push({ ...next });
      next.nextTurnAt = next.nextTurnAt + (1000 / next.speed);
    }

    // Group turns that happen at the same time (within threshold of 0.01)
    const grouped: Array<{ participants: BattleParticipant[], nextTurnAt: number }> = [];
    for (const turn of queue) {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && Math.abs(lastGroup.nextTurnAt - turn.nextTurnAt) < 0.01) {
        // Add to existing group
        lastGroup.participants.push(turn);
      } else {
        // Create new group
        grouped.push({ participants: [turn], nextTurnAt: turn.nextTurnAt });
      }
    }

    return grouped.slice(0, 10); // Show 10 turn slots (groups)
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
    this.completingTurn = true;
    setTimeout(() => {
      this.nextTurn.emit();
      this.completingTurn = false;
    }, 300); // Match animation duration
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

  onDragOverQueue(event: DragEvent, groupIndex: number) {
    event.preventDefault();
    this.dragOverIndex = groupIndex;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragLeaveQueue() {
    this.dragOverIndex = null;
  }

  onDropOnQueue(event: DragEvent, groupIndex: number) {
    event.preventDefault();
    this.dragOverIndex = null;
    if (this.draggedParticipant) {
      // Set the character to appear at this position in the queue
      this.setTurnOrder.emit({ characterId: this.draggedParticipant, position: groupIndex });
    }
    this.draggedParticipant = null;
  }

  // Drop on specific character to create group
  onDropOnCharacter(event: DragEvent, targetCharacterId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverIndex = null;
    if (this.draggedParticipant && this.draggedParticipant !== targetCharacterId) {
      // Sync the dragged character's turn with the target character
      this.syncTurns.emit({ sourceId: this.draggedParticipant, targetId: targetCharacterId });
    }
    this.draggedParticipant = null;
  }

  onDragEnd() {
    this.draggedParticipant = null;
    this.dragOverIndex = null;
  }
}
