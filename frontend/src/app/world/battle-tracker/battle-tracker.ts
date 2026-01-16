import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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

interface QueueGroup {
  participants: (ParticipantWithPortrait & { isAnchor: boolean })[];
  team: string;
  startTime: number;
  shouldFadeOut?: boolean; // Flag for turns that should fade out (removed during drag)
}

@Component({
  selector: 'app-battle-tracker',
  imports: [CommonModule, FormsModule],
  templateUrl: './battle-tracker.html',
  styleUrl: './battle-tracker.css',
})
export class BattleTracker implements OnChanges {
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

  queueGroups: QueueGroup[] = [];
  isAnimating = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['battleParticipants'] || changes['characterPortraits']) {
      this.calculateTurnQueue();
    }
  }

  // Enrich participants with portraits from character map
  get participantsWithPortraits(): ParticipantWithPortrait[] {
    return this.battleParticipants.map((p) => ({
      ...p,
      portrait: this.characterPortraits.get(p.characterId) || (p as any).portrait,
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
    return this.sortedTurnOrder.filter(
      (p) => Math.abs(p.nextTurnAt - first.nextTurnAt) < 1.0 && p.team === first.team
    );
  }

  // Get comma-separated names for current turn display
  get currentTurnNames(): string {
    return this.currentTurnGroup.map((p) => p.name).join(', ');
  }

  // Check if a character is in battle
  isInBattle(characterId: string): boolean {
    return this.battleParticipants.some((p) => p.characterId === characterId);
  }

  // Get participant by character ID
  getParticipant(characterId: string): BattleParticipant | undefined {
    return this.battleParticipants.find((p) => p.characterId === characterId);
  }

  // Get character portrait URL
  getCharacterPortrait(characterId: string): string | undefined {
    return this.characterPortraits.get(characterId);
  }

  // Calculate turn queue (moved from getter to method for performance)
  calculateTurnQueue() {
    if (this.battleParticipants.length === 0) {
      this.queueGroups = [];
      return;
    }

    // 1. Simulate turns
    const turns: (ParticipantWithPortrait & { isAnchor: boolean; time: number })[] = [];
    const participants = this.participantsWithPortraits.map((p) => ({
      ...p,
      currentTurnAt: p.nextTurnAt,
    }));

    // Simulate 50 steps to get a good lookahead
    for (let i = 0; i < 50; i++) {
      participants.sort((a, b) => a.currentTurnAt - b.currentTurnAt);
      const next = participants[0];

      // Check if this is the anchor (actual stored turn)
      const original = this.battleParticipants.find((p) => p.characterId === next.characterId);
      const isAnchor = original
        ? Math.abs(original.nextTurnAt - next.currentTurnAt) < 0.001
        : false;

      turns.push({
        ...next,
        isAnchor,
        time: next.currentTurnAt,
      });

      next.currentTurnAt += 1000 / next.speed;
    }

    // 2. Group adjacent same-team turns (Adjacency ONLY, no time check)
    const grouped: QueueGroup[] = [];

    if (turns.length === 0) {
      this.queueGroups = [];
      return;
    }

    let currentGroup = {
      participants: [turns[0]],
      team: turns[0].team || 'blue',
      startTime: turns[0].time,
    };
    let membersInGroup = new Set<string>([turns[0].characterId]);

    for (let i = 1; i < turns.length; i++) {
      const turn = turns[i];
      const turnTeam = turn.team || 'blue';

      // Join group if: Same team AND not already in group (no duplicates)
      if (turnTeam === currentGroup.team && !membersInGroup.has(turn.characterId)) {
        currentGroup.participants.push(turn);
        membersInGroup.add(turn.characterId);
      } else {
        // Finalize current group
        grouped.push(currentGroup);

        // Start new group
        currentGroup = {
          participants: [turn],
          team: turnTeam,
          startTime: turn.time,
        };
        membersInGroup = new Set([turn.characterId]);
      }
    }
    grouped.push(currentGroup);

    // Mark groups that should fade out during drag
    const finalGroups = grouped.slice(0, 15);

    if (this.draggedParticipant) {
      // Find the index of the anchor turn for the dragged character
      let anchorIndex = -1;
      for (let i = 0; i < finalGroups.length; i++) {
        const hasAnchor = finalGroups[i].participants.some(
          (p) => p.characterId === this.draggedParticipant && p.isAnchor
        );
        if (hasAnchor) {
          anchorIndex = i;
          break;
        }
      }

      // Mark all non-anchor turns of the dragged character that are BEFORE the anchor
      if (anchorIndex >= 0) {
        for (let i = 0; i < anchorIndex; i++) {
          const hasDraggedChar = finalGroups[i].participants.some(
            (p) => p.characterId === this.draggedParticipant
          );
          if (hasDraggedChar) {
            finalGroups[i].shouldFadeOut = true;
          }
        }
      }
    }

    this.queueGroups = finalGroups;
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
    }, 300); // Quick response
  }

  onResetBattle() {
    this.resetBattle.emit();
  }

  // Drag and drop handlers for turn queue
  onDragStartQueue(event: DragEvent, turn: ParticipantWithPortrait & { isAnchor: boolean }) {
    if (!turn.isAnchor) {
      event.preventDefault();
      return;
    }
    this.draggedParticipant = turn.characterId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', turn.characterId);
    }
  }

  onDragOverQueue(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedParticipant) return;

    const container = event.currentTarget as HTMLElement;
    const groups = Array.from(container.querySelectorAll('.battle-group'));

    // Always allow dropping, even if no groups exist
    if (groups.length === 0) {
      this.dragOverIndex = 0;
      this.dropPosition = 'before';
      return;
    }

    const mouseX = event.clientX;

    // Check if before first group
    const firstGroup = groups[0];
    const firstRect = firstGroup.getBoundingClientRect();
    if (mouseX < firstRect.left) {
      this.dragOverIndex = 0;
      this.dropPosition = 'before';
      return;
    }

    // Check if after last group
    const lastGroup = groups[groups.length - 1];
    const lastRect = lastGroup.getBoundingClientRect();
    if (mouseX > lastRect.right) {
      this.dragOverIndex = groups.length;
      this.dropPosition = 'before';
      return;
    }

    // Find the closest group and determine position
    let closestIndex = 0;
    let minDistance = Infinity;
    let position: 'before' | 'after' = 'before';

    groups.forEach((group, index) => {
      const rect = group.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(mouseX - center);

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
        position = mouseX < center ? 'before' : 'after';
      }
    });

    // Always set a valid drop position
    this.dragOverIndex = closestIndex;
    this.dropPosition = position;
  }

  onDragLeaveQueue(event: DragEvent) {
    const container = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node;

    if (relatedTarget && container.contains(relatedTarget)) {
      return;
    }
    this.dragOverIndex = null;
    this.dropPosition = null;
  }

  onDropOnQueue(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedParticipant || this.dragOverIndex === null) return;

    let targetIndex = this.dragOverIndex;
    if (this.dropPosition === 'after') {
      targetIndex++;
    }

    if (this.dragOverIndex === this.queueGroups.length) {
      targetIndex = this.queueGroups.length;
    }

    this.reorder.emit({ characterId: this.draggedParticipant, newIndex: targetIndex });
    this.onDragEnd();
  }

  onTeamChange(characterId: string, team: string) {
    this.changeTeam.emit({ characterId, team });
  }

  onDragEnd() {
    this.draggedParticipant = null;
    this.dragOverIndex = null;
  }

  trackByCharId(index: number, item: any): string {
    return item.id || item.characterId;
  }

  trackByGroup(index: number, item: QueueGroup): string {
    return index + '-' + item.participants.map((p) => p.characterId).join('-');
  }
}
