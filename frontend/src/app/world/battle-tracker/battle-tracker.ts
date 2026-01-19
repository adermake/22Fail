import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleTimelineEngine, TimelineGroup, TimelineTile, CharacterOption } from './battle-timeline-engine';

@Component({
  selector: 'app-battle-tracker',
  imports: [CommonModule, FormsModule],
  templateUrl: './battle-tracker.html',
  styleUrl: './battle-tracker.css',
})
export class BattleTracker implements OnInit, OnDestroy {
  @Input() engine!: BattleTimelineEngine;

  // UI state for drag and drop
  draggedTileId: string | null = null;
  dragOverGroupIndex: number | null = null;
  dropPosition: 'before' | 'after' | null = null;
  tilesToFade: Set<string> = new Set();

  // Cached data from engine
  timeline: TimelineGroup[] = [];
  characters: CharacterOption[] = [];
  availableTeams: string[] = [];
  currentTurnDisplay: string | null = null;

  ngOnInit() {
    if (this.engine) {
      this.engine._setChangeCallback(() => this.refresh());
      this.refresh();
    }
  }

  ngOnDestroy() {
    if (this.engine) {
      this.engine._setChangeCallback(() => {});
    }
  }

  /** Refresh all data from engine */
  private refresh() {
    this.timeline = this.engine.getTimeline();
    this.characters = this.engine.getCharacters();
    this.availableTeams = this.engine.getAvailableTeams();
    this.currentTurnDisplay = this.engine.getCurrentTurnDisplay();
  }

  // ============================================
  // Character List Handlers
  // ============================================

  onAddCharacter(characterId: string) {
    this.engine.onAddCharacter(characterId);
  }

  onRemoveCharacter(characterId: string) {
    this.engine.onRemoveCharacter(characterId);
  }

  onTeamChange(characterId: string, team: string) {
    this.engine.onTeamChange(characterId, team);
  }

  // ============================================
  // Control Handlers
  // ============================================

  onNextTurn() {
    this.engine.onNextTurn();
  }

  onResetBattle() {
    this.engine.onResetBattle();
  }

  // ============================================
  // Drag and Drop - Any tile is draggable now!
  // ============================================

  onDragStart(event: DragEvent, tile: TimelineTile) {
    // Ask engine if this tile can be dragged
    if (!this.engine.canDragTile(tile.id)) {
      event.preventDefault();
      return;
    }

    this.draggedTileId = tile.id;

    // Get tiles that should fade during drag
    const fadeTiles = this.engine.getTilesToFadeOnDrag(tile.id);
    this.tilesToFade = new Set(fadeTiles);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tile.id);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedTileId) return;

    const container = event.currentTarget as HTMLElement;
    const groups = Array.from(container.querySelectorAll('.battle-group'));

    if (groups.length === 0) {
      this.dragOverGroupIndex = 0;
      this.dropPosition = 'before';
      return;
    }

    const mouseX = event.clientX;

    // Check if before first group
    const firstRect = groups[0].getBoundingClientRect();
    if (mouseX < firstRect.left) {
      this.dragOverGroupIndex = 0;
      this.dropPosition = 'before';
      return;
    }

    // Check if after last group
    const lastRect = groups[groups.length - 1].getBoundingClientRect();
    if (mouseX > lastRect.right) {
      this.dragOverGroupIndex = groups.length - 1;
      this.dropPosition = 'after';
      return;
    }

    // Find closest group
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

    this.dragOverGroupIndex = closestIndex;
    this.dropPosition = position;
  }

  onDragLeave(event: DragEvent) {
    const container = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node;

    if (relatedTarget && container.contains(relatedTarget)) {
      return;
    }
    this.dragOverGroupIndex = null;
    this.dropPosition = null;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedTileId || this.dragOverGroupIndex === null || !this.dropPosition) return;

    // Call engine with drop info
    this.engine.onTileDrop(this.draggedTileId, this.dragOverGroupIndex, this.dropPosition);

    this.clearDragState();
  }

  onDragEnd() {
    this.clearDragState();
  }

  private clearDragState() {
    this.draggedTileId = null;
    this.dragOverGroupIndex = null;
    this.dropPosition = null;
    this.tilesToFade.clear();
  }

  // ============================================
  // Template Helpers
  // ============================================

  shouldTileFade(tileId: string): boolean {
    return this.tilesToFade.has(tileId);
  }

  trackByCharId(index: number, item: CharacterOption): string {
    return item.id;
  }

  trackByGroup(index: number, group: TimelineGroup): string {
    return group.id;
  }

  trackByTile(index: number, tile: TimelineTile): string {
    return tile.id;
  }
}
