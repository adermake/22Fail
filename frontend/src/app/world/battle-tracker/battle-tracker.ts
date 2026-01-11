import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleParticipant } from '../../model/world.model';

interface CharacterOption {
  id: string;
  name: string;
  speed: number;
}

interface ParticipantWithPortrait extends BattleParticipant {
  portrait?: string;
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
  @Input() characterPortraits: Map<string, string> = new Map(); // Character ID -> portrait URL

  @Output() addParticipant = new EventEmitter<string>();
  @Output() removeParticipant = new EventEmitter<string>();
  @Output() nextTurn = new EventEmitter<void>();
  @Output() resetBattle = new EventEmitter<void>();
  @Output() changeTeam = new EventEmitter<{ characterId: string; team: string }>();
  @Output() reorder = new EventEmitter<{ characterId: string; newIndex: number }>();

  draggedParticipant: string | null = null;
  dragOverIndex: number | null = null;
  dropPosition: 'before' | 'after' | 'left' | 'right' | null = null;
  completingTurn = false;
  availableTeams = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];

  // Enrich participants with portraits from character map
  get participantsWithPortraits(): ParticipantWithPortrait[] {
    return this.battleParticipants.map(p => ({
      ...p,
      portrait: this.characterPortraits.get(p.characterId) || p.portrait
    }));
  }

  get sortedTurnOrder(): ParticipantWithPortrait[] {
    return [...this.participantsWithPortraits].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
  }

  get currentTurn(): ParticipantWithPortrait | undefined {
    return this.sortedTurnOrder[0];
  }

  // Get all participants in the current turn group (same nextTurnAt and team)
  get currentTurnGroup(): ParticipantWithPortrait[] {
    if (this.sortedTurnOrder.length === 0) return [];

    const first = this.sortedTurnOrder[0];
    return this.sortedTurnOrder.filter(p =>
      Math.abs(p.nextTurnAt - first.nextTurnAt) < 0.01 && p.team === first.team
    );
  }

  // Get comma-separated names for current turn display
  get currentTurnNames(): string {
    return this.currentTurnGroup.map(p => p.name).join(', ');
  }

  // Check if a character is in battle
  isInBattle(characterId: string): boolean {
    return this.battleParticipants.some(p => p.characterId === characterId);
  }

  // Get participant by character ID
  getParticipant(characterId: string): BattleParticipant | undefined {
    return this.battleParticipants.find(p => p.characterId === characterId);
  }

  // Get character portrait URL
  getCharacterPortrait(characterId: string): string | undefined {
    return this.characterPortraits.get(characterId);
  }

  // Generate turn queue showing next N turns with grouping by team
  get turnQueue(): Array<{ participants: ParticipantWithPortrait[], nextTurnAt: number, team?: string }> {
    if (this.battleParticipants.length === 0) return [];

    const queue: ParticipantWithPortrait[] = [];
    const participants = this.participantsWithPortraits.map(p => ({ ...p }));

    for (let i = 0; i < 15; i++) {
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];
      queue.push({ ...next });
      next.nextTurnAt = next.nextTurnAt + (1000 / next.speed);
    }

    // Group all same-team same-time consecutive characters
    const grouped: Array<{ participants: ParticipantWithPortrait[], nextTurnAt: number, team?: string }> = [];

    for (let i = 0; i < queue.length; i++) {
      const turn = queue[i];
      const currentGroup: ParticipantWithPortrait[] = [turn];

      // Look ahead for consecutive same-team turns at the same time
      for (let j = i + 1; j < queue.length; j++) {
        const nextTurn = queue[j];
        // Must be same team, same time, and not already in group
        if (Math.abs(nextTurn.nextTurnAt - turn.nextTurnAt) < 0.01 &&
            nextTurn.team === turn.team &&
            !currentGroup.some(p => p.characterId === nextTurn.characterId)) {
          currentGroup.push(nextTurn);
          i++; // Skip this turn in the outer loop
        } else {
          break; // Stop if conditions not met
        }
      }

      grouped.push({ participants: currentGroup, nextTurnAt: turn.nextTurnAt, team: turn.team });
    }

    return grouped.slice(0, 10); // Show 10 turn slots (groups)
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

  onDragOverGroup(event: DragEvent, groupIndex: number) {
    event.preventDefault();

    // Determine if we're closer to the left or right edge of the group
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;

    this.dragOverIndex = groupIndex;

    if (event.clientX < midpoint) {
      // Left side - drop before this group
      this.dropPosition = 'left';
    } else {
      // Right side - drop after this group
      this.dropPosition = 'right';
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragLeaveQueue() {
    this.dragOverIndex = null;
    this.dropPosition = null;
  }

  onDropOnGroup(event: DragEvent, groupIndex: number) {
    event.preventDefault();

    // Determine final drop position based on where we were hovering
    let dropIndex = groupIndex;
    if (this.dropPosition === 'right') {
      dropIndex = groupIndex + 1;
    }

    this.dragOverIndex = null;
    this.dropPosition = null;

    if (this.draggedParticipant) {
      this.reorder.emit({ characterId: this.draggedParticipant, newIndex: dropIndex });
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
