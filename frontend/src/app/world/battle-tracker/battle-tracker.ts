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
  styles: [`
    .battle-tracker-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 8px;
    }
    
    /* Header & Controls */
    .battle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }
    .battle-header h2 { margin: 0; color: var(--accent); font-size: 1.2rem; }
    .reset-button {
      padding: 4px 8px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 4px;
      cursor: pointer;
    }
    .reset-button:hover { border-color: var(--accent); color: var(--accent); }

    /* Character List */
    .characters-section { margin-bottom: 1rem; }
    .characters-section h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--text); }
    .character-list { 
      display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto;
      padding-right: 4px;
    }
    .character-list::-webkit-scrollbar { width: 6px; }
    .character-list::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
    .character-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    .character-list::-webkit-scrollbar-thumb:hover { background: var(--accent); }

    .character-option {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.5rem; background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
    }
    .character-option.in-battle { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.05); }
    .character-info { display: flex; align-items: center; gap: 0.75rem; }
    .character-portrait-small { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    .character-details { display: flex; flex-direction: column; }
    .character-name { font-weight: 500; font-size: 0.9rem; }
    .character-speed { font-size: 0.75rem; color: var(--text-muted); }
    .team-selector {
      margin-top: 2px; padding: 2px; font-size: 0.75rem;
      background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px;
    }
    .toggle-button {
      padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;
      background: var(--accent); color: white;
    }
    .toggle-button.in-battle { background: var(--bg-secondary); color: var(--text); border: 1px solid var(--border); }

    /* Turn Queue */
    .turn-queue-container {
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scrollbar-width: thin;
      scrollbar-color: var(--accent) transparent;
    }
    .turn-queue-container::-webkit-scrollbar { height: 6px; }
    .turn-queue-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 3px; }
    .turn-queue-container::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

    .turn-queue {
      display: flex;
      gap: 4px;
      min-height: 100px;
      align-items: center;
      padding: 4px;
      position: relative;
    }
    .battle-group {
      display: flex;
      gap: 2px;
      padding: 4px;
      border-radius: 8px;
      background: rgba(0,0,0,0.1);
      position: relative;
      animation: slideLeftIn 1s ease-out;
    }

    @keyframes slideLeftIn {
      from {
        opacity: 0;
        transform: translateX(100px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    /* Fade out + slide up animation for turns being removed during drag */
    .battle-group.fading-out {
      animation: fadeOutSlideUp 1s ease-out forwards !important;
      pointer-events: none;
    }

    @keyframes fadeOutSlideUp {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-80px) scale(0.5);
      }
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
      transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s;
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
    .team-purple { border-bottom: 3px solid #a855f7; }
    .team-orange { border-bottom: 3px solid #f97316; }
    
    /* Fix hover jitter during drag */
    .turn-queue:not(.is-dragging) .battle-card:hover {
      transform: scale(1.15);
      z-index: 10;
    }
    .turn-queue.is-dragging .battle-card {
      pointer-events: none;
    }

    .drop-indicator {
      position: absolute;
      top: -5px; bottom: -5px;
      width: 4px;
      background: var(--accent);
      border-radius: 2px;
      z-index: 20;
      box-shadow: 0 0 8px var(--accent);
      pointer-events: none;
    }

    .controls { margin-top: 1rem; display: flex; gap: 0.5rem; }
    .controls button {
      padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;
    }
    .controls button:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  template: `
    <div class="battle-tracker-container">
      <div class="battle-header">
        <h2>Battle Tracker</h2>
        <button class="reset-button" (click)="onResetBattle()">Reset Battle</button>
      </div>

      <div class="characters-section">
        <h3>Characters</h3>
        <div class="character-list" *ngIf="availableCharacters.length > 0; else noChars">
          <div *ngFor="let char of availableCharacters; trackBy: trackByCharId" class="character-option" [class.in-battle]="isInBattle(char.id)">
            <div class="character-info">
              <img [src]="getCharacterPortrait(char.id) || 'assets/default-portrait.png'" class="character-portrait-small">
              <div class="character-details">
                <span class="character-name">{{ char.name }}</span>
                <span class="character-speed">Speed: {{ char.speed }}</span>
                <select *ngIf="isInBattle(char.id)" 
                        class="team-selector" 
                        [ngModel]="getParticipant(char.id)?.team" 
                        (ngModelChange)="onTeamChange(char.id, $event)">
                  <option *ngFor="let team of availableTeams" [value]="team">{{ team }}</option>
                </select>
              </div>
            </div>
            <button class="toggle-button" 
                    [class.in-battle]="isInBattle(char.id)"
                    (click)="isInBattle(char.id) ? onRemoveCharacter(char.id) : onAddCharacter(char.id)">
              {{ isInBattle(char.id) ? 'Remove' : 'Add' }}
            </button>
          </div>
        </div>
        <ng-template #noChars>
          <p style="color: var(--text-muted); font-style: italic;">No characters available</p>
        </ng-template>
      </div>
      
      <div class="turn-queue-container">
        <div class="turn-queue" 
             [class.is-dragging]="!!draggedParticipant"
             (dragover)="onDragOverQueue($event)"
             (dragleave)="onDragLeaveQueue($event)"
             (drop)="onDropOnQueue($event)">
             
          <div *ngFor="let group of queueGroups; let gIdx = index; trackBy: trackByGroup"
               class="battle-group"
               [class.fading-out]="group.shouldFadeOut"
               [ngClass]="'team-' + group.team">
            
            <div *ngIf="dragOverIndex === gIdx && dropPosition === 'before'" class="drop-indicator" style="left: -4px;"></div>
            <div *ngIf="dragOverIndex === gIdx && dropPosition === 'after'" class="drop-indicator" style="right: -4px;"></div>
            
            <div *ngFor="let turn of group.participants; trackBy: trackByCharId" 
                 class="battle-card"
                 [class.is-anchor]="turn.isAnchor"
                 [draggable]="turn.isAnchor"
                 (dragstart)="onDragStartQueue($event, turn)"
                 (dragend)="onDragEnd()">
              <img [src]="turn.portrait || 'assets/default-portrait.png'" [alt]="turn.name">
              <span>{{turn.name}}</span>
              <div *ngIf="turn.isAnchor" class="anchor-indicator" title="Anchor Point">⚓</div>
            </div>
          </div>
          
          <div *ngIf="dragOverIndex === queueGroups.length" class="drop-indicator" style="right: 0; position: relative; height: 80px; margin-left: 4px;"></div>
        </div>
      </div>

      <div class="controls">
        <button (click)="onNextTurn()" [disabled]="completingTurn">Next Turn</button>
      </div>
    </div>
  `
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
  private animationKey = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['battleParticipants'] || changes['characterPortraits']) {
      // Increment animation key to force DOM recreation for animations
      this.animationKey++;
      this.calculateTurnQueue();
    }
  }

  // Enrich participants with portraits from character map
  get participantsWithPortraits(): ParticipantWithPortrait[] {
    return this.battleParticipants.map(p => ({
      ...p,
      portrait: this.characterPortraits.get(p.characterId) || (p as any).portrait
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

  // Calculate turn queue (moved from getter to method for performance)
  calculateTurnQueue() {
    if (this.battleParticipants.length === 0) { this.queueGroups = []; return; }

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
    const grouped: QueueGroup[] = [];
    
    if (turns.length === 0) { this.queueGroups = []; return; }

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

    // Mark groups that should fade out during drag
    const finalGroups = grouped.slice(0, 15);

    if (this.draggedParticipant) {
      // Find the index of the anchor turn for the dragged character
      let anchorIndex = -1;
      for (let i = 0; i < finalGroups.length; i++) {
        const hasAnchor = finalGroups[i].participants.some(p =>
          p.characterId === this.draggedParticipant && p.isAnchor
        );
        if (hasAnchor) {
          anchorIndex = i;
          break;
        }
      }

      // Mark all non-anchor turns of the dragged character that are BEFORE the anchor
      if (anchorIndex >= 0) {
        for (let i = 0; i < anchorIndex; i++) {
          const hasDraggedChar = finalGroups[i].participants.some(p =>
            p.characterId === this.draggedParticipant
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
    // Include animation key to force recreation on every change
    return this.animationKey + '-' + index + '-' + item.participants.map(p => p.characterId).join('-');
  }
}
