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
  styles: [`
    .battle-tracker-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 8px;
      overflow-x: auto;
    }
    .turn-queue {
      display: flex;
      gap: 4px;
      padding-bottom: 1rem;
      min-height: 120px;
      align-items: center;
    }
    .battle-group {
      display: flex;
      gap: 2px;
      padding: 4px;
      border-radius: 8px;
      background: rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    .battle-card {
      position: relative;
      width: 60px;
      height: 80px;
      background: var(--card-bg);
      border: 2px solid transparent;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s;
      user-select: none;
    }
    .battle-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.8;
    }
    .battle-card span {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.7);
      color: white;
      text-align: center;
      padding: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .battle-card.is-anchor {
      border-color: var(--accent);
      opacity: 1;
      cursor: grab;
      z-index: 2;
    }
    .battle-card.is-anchor:active {
      cursor: grabbing;
      transform: scale(1.05);
    }
    .anchor-indicator {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 12px;
      background: rgba(0,0,0,0.5);
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffd700;
    }
    .team-blue { border-bottom: 3px solid #3b82f6; }
    .team-red { border-bottom: 3px solid #ef4444; }
    .team-green { border-bottom: 3px solid #10b981; }
    .team-yellow { border-bottom: 3px solid #eab308; }
    
    .drop-target-left { border-left: 2px solid var(--accent); margin-left: 4px; }
    .drop-target-right { border-right: 2px solid var(--accent); margin-right: 4px; }
  `],
  template: `
    <div class="battle-tracker-container">
      <div class="controls">
        <button (click)="onNextTurn()" [disabled]="completingTurn">Next Turn</button>
        <button (click)="onResetBattle()">Reset</button>
      </div>
      
      <div class="turn-queue">
        <div *ngFor="let group of turnQueue; let gIdx = index" 
             class="battle-group"
             [ngClass]="'team-' + group.team"
             (dragover)="onDragOverGroup($event, gIdx)"
             (dragleave)="onDragLeaveQueue()"
             (drop)="onDropOnGroup($event, gIdx)"
             [class.drop-target-left]="dragOverIndex === gIdx && dropPosition === 'left'"
             [class.drop-target-right]="dragOverIndex === gIdx && dropPosition === 'right'">
          
          <div *ngFor="let turn of group.participants" 
               class="battle-card"
               [class.is-anchor]="turn.isAnchor"
               [draggable]="turn.isAnchor"
               (dragstart)="onDragStartQueue($event, turn)">
            <img [src]="turn.portrait || 'assets/default-portrait.png'" [alt]="turn.name">
            <span>{{turn.name}}</span>
            <div *ngIf="turn.isAnchor" class="anchor-indicator" title="Anchor Point">⚓</div>
          </div>
        </div>
      </div>
    </div>
  `
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

  // Interface for the view
  interface QueueGroup {
    participants: (ParticipantWithPortrait & { isAnchor: boolean })[];
    team: string;
    startTime: number;
  }

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
      Math.abs(p.nextTurnAt - first.nextTurnAt) < 1.0 && p.team === first.team
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
  get turnQueue(): Array<{ participants: (ParticipantWithPortrait & { isAnchor: boolean })[], team: string, startTime: number }> {
    if (this.battleParticipants.length === 0) return [];

    // 1. Simulate turns
    const turns: (ParticipantWithPortrait & { isAnchor: boolean, time: number })[] = [];
    const participants = this.participantsWithPortraits.map(p => ({ 
      ...p, 
      currentTurnAt: p.nextTurnAt 
    }));

    // Simulate 50 steps to get a good lookahead
    for (let i = 0; i < 50; i++) {
      participants.sort((a, b) => a.currentTurnAt - b.currentTurnAt);
      const next = participants[0];
      
      // Check if this is the anchor (actual stored turn)
      const original = this.battleParticipants.find(p => p.characterId === next.characterId);
      const isAnchor = original ? Math.abs(original.nextTurnAt - next.currentTurnAt) < 0.001 : false;

      turns.push({ 
        ...next, 
        isAnchor,
        time: next.currentTurnAt 
      });
      
      next.currentTurnAt += (1000 / next.speed);
    }

    // 2. Group adjacent same-team turns (Adjacency ONLY, no time check)
    const grouped: Array<{ participants: (ParticipantWithPortrait & { isAnchor: boolean })[], team: string, startTime: number }> = [];
    
    if (turns.length === 0) return [];

    let currentGroup = {
      participants: [turns[0]],
      team: turns[0].team || 'blue',
      startTime: turns[0].time
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
          startTime: turn.time
        };
        membersInGroup = new Set([turn.characterId]);
      }
    }
    grouped.push(currentGroup);

    return grouped.slice(0, 15);
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

    // Calculate the flat index in the queue
    // We need to count how many groups are before this one
    // Since we are dropping *between* groups, we treat the group index as the position
    
    let targetGroupIndex = groupIndex;
    if (this.dropPosition === 'right') {
      targetGroupIndex = groupIndex + 1;
    }
    
    // We pass the group index to the parent, which will map it to the battleQueue
    // The parent's reorderParticipants logic expects an index into the battleQueue (groups)

    this.dragOverIndex = null;
    this.dropPosition = null;

    if (this.draggedParticipant) {
      this.reorder.emit({ characterId: this.draggedParticipant, newIndex: targetGroupIndex });
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
