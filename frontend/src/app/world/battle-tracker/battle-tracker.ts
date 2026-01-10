import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleParticipant } from '../../model/world.model';

interface CharacterOption {
  id: string;
  name: string;
  speed: number;
}

@Component({
  selector: 'app-battle-tracker',
  imports: [CommonModule, FormsModule],
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
  @Output() changeTeam = new EventEmitter<{ characterId: string; team: string }>();
  @Output() reorder = new EventEmitter<{ characterId: string; newIndex: number }>();

  draggedParticipant: string | null = null;
  dragOverIndex: number | null = null;
  dropPosition: 'before' | 'after' | null = null;
  completingTurn = false;
  availableTeams = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];

  get sortedTurnOrder(): BattleParticipant[] {
    return [...this.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
  }

  get currentTurn(): BattleParticipant | undefined {
    return this.sortedTurnOrder[0];
  }

  // Generate turn queue showing next N turns with grouping by team
  get turnQueue(): Array<{ participants: BattleParticipant[], nextTurnAt: number, team?: string }> {
    if (this.battleParticipants.length === 0) return [];

    const queue: BattleParticipant[] = [];
    const participants = this.battleParticipants.map(p => ({ ...p }));

    for (let i = 0; i < 15; i++) {
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];
      queue.push({ ...next });
      next.nextTurnAt = next.nextTurnAt + (1000 / next.speed);
    }

    // Group turns that happen at the same time (within threshold) and same team
    const grouped: Array<{ participants: BattleParticipant[], nextTurnAt: number, team?: string }> = [];
    for (const turn of queue) {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup &&
          Math.abs(lastGroup.nextTurnAt - turn.nextTurnAt) < 0.01 &&
          lastGroup.team === turn.team) {
        // Add to existing group if same team and time
        lastGroup.participants.push(turn);
      } else {
        // Create new group
        grouped.push({ participants: [turn], nextTurnAt: turn.nextTurnAt, team: turn.team });
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

    // Determine if we're in the top or bottom half to show before/after indicator
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    this.dropPosition = event.clientX < midpoint ? 'before' : 'after';

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragLeaveQueue() {
    this.dragOverIndex = null;
    this.dropPosition = null;
  }

  onDropOnQueue(event: DragEvent, groupIndex: number) {
    event.preventDefault();

    // Calculate actual index based on before/after position
    let targetIndex = groupIndex;
    if (this.dropPosition === 'after') {
      targetIndex = groupIndex + 1;
    }

    this.dragOverIndex = null;
    this.dropPosition = null;

    if (this.draggedParticipant) {
      // Reorder the character to this position
      this.reorder.emit({ characterId: this.draggedParticipant, newIndex: targetIndex });
    }
    this.draggedParticipant = null;
  }

  onTeamChange(characterId: string, team: string) {
    this.changeTeam.emit({ characterId, team });
  }

  onDragEnd() {
    this.draggedParticipant = null;
    this.dragOverIndex = null;
  }
}
