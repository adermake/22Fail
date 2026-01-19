import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleTimelineEngine, TimelineGroup, TimelineTile, CharacterOption } from './battle-timeline-engine';

interface TilePosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-battle-tracker',
  imports: [CommonModule, FormsModule],
  templateUrl: './battle-tracker.html',
  styleUrl: './battle-tracker.css',
})
export class BattleTracker implements OnInit, OnDestroy, AfterViewChecked {
  @Input() engine!: BattleTimelineEngine;
  @ViewChild('turnQueue') turnQueueRef!: ElementRef<HTMLElement>;

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

  // FLIP animation state
  private previousPositions: Map<string, TilePosition> = new Map();
  private pendingAnimation = false;
  private animatingTiles: Set<string> = new Set();

  ngOnInit() {
    if (this.engine) {
      this.engine._setChangeCallback(() => this.onEngineChange());
      this.refresh();
    }
  }

  ngOnDestroy() {
    if (this.engine) {
      this.engine._setChangeCallback(() => {});
    }
  }

  ngAfterViewChecked() {
    if (this.pendingAnimation) {
      this.pendingAnimation = false;
      this.animateTiles();
    }
  }

  /** Called when engine notifies of a change */
  private onEngineChange() {
    // FLIP Step 1: Record current positions (First)
    this.recordTilePositions();

    // Update data
    this.refresh();

    // Schedule animation after DOM updates
    this.pendingAnimation = true;
  }

  /** Refresh all data from engine */
  private refresh() {
    this.timeline = this.engine.getTimeline();
    this.characters = this.engine.getCharacters();
    this.availableTeams = this.engine.getAvailableTeams();
    this.currentTurnDisplay = this.engine.getCurrentTurnDisplay();
  }

  /** FLIP Step 1: Record current tile positions */
  private recordTilePositions() {
    if (!this.turnQueueRef) return;

    const container = this.turnQueueRef.nativeElement;
    const tileElements = container.querySelectorAll('.battle-card[data-tile-id]');

    this.previousPositions.clear();
    tileElements.forEach((el) => {
      const tileId = el.getAttribute('data-tile-id');
      if (tileId) {
        const rect = el.getBoundingClientRect();
        this.previousPositions.set(tileId, { x: rect.left, y: rect.top });
      }
    });
  }

  /** FLIP Steps 2-4: Calculate delta and animate */
  private animateTiles() {
    if (!this.turnQueueRef) return;

    const container = this.turnQueueRef.nativeElement;
    const tileElements = container.querySelectorAll('.battle-card[data-tile-id]');

    tileElements.forEach((el) => {
      const tileId = el.getAttribute('data-tile-id');
      if (!tileId) return;

      const prevPos = this.previousPositions.get(tileId);
      if (!prevPos) {
        // New tile - animate in from above
        this.animateNewTile(el as HTMLElement);
        return;
      }

      // FLIP Step 2: Get new position (Last)
      const newRect = el.getBoundingClientRect();
      const newPos = { x: newRect.left, y: newRect.top };

      // FLIP Step 3: Calculate the delta (Invert)
      const deltaX = prevPos.x - newPos.x;
      const deltaY = prevPos.y - newPos.y;

      // Skip if no movement
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

      // FLIP Step 4: Animate (Play)
      const htmlEl = el as HTMLElement;
      this.animatingTiles.add(tileId);

      // Apply inverted position immediately (no transition)
      htmlEl.style.transition = 'none';
      htmlEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      // Force reflow
      htmlEl.offsetHeight;

      // Animate to final position
      htmlEl.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
      htmlEl.style.transform = 'translate(0, 0)';

      // Clean up after animation
      const cleanup = () => {
        htmlEl.style.transition = '';
        htmlEl.style.transform = '';
        this.animatingTiles.delete(tileId);
        htmlEl.removeEventListener('transitionend', cleanup);
      };
      htmlEl.addEventListener('transitionend', cleanup, { once: true });

      // Fallback cleanup
      setTimeout(cleanup, 350);
    });

    this.previousPositions.clear();
  }

  /** Animate a new tile entering */
  private animateNewTile(el: HTMLElement) {
    const tileId = el.getAttribute('data-tile-id');
    if (!tileId || this.animatingTiles.has(tileId)) return;

    this.animatingTiles.add(tileId);

    // Start from above and faded
    el.style.transition = 'none';
    el.style.transform = 'translateY(-30px)';
    el.style.opacity = '0';

    // Force reflow
    el.offsetHeight;

    // Animate in
    el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s ease';
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';

    // Clean up
    const cleanup = () => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.opacity = '';
      this.animatingTiles.delete(tileId!);
      el.removeEventListener('transitionend', cleanup);
    };
    el.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 350);
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

  isAnimating(tileId: string): boolean {
    return this.animatingTiles.has(tileId);
  }

  trackByCharId(_index: number, item: CharacterOption): string {
    return item.id;
  }

  trackByGroup(_index: number, group: TimelineGroup): string {
    return group.id;
  }

  trackByTile(_index: number, tile: TimelineTile): string {
    return tile.id;
  }
}
