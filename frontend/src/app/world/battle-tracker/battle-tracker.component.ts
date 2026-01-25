import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  ChangeDetectorRef,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleTrackerEngine, TurnGroup, TurnTile, BattleCharacter } from './battle-tracker-engine';

/**
 * Animation tracking for FLIP animations
 */
interface AnimationState {
  previousPositions: Map<string, { x: number; y: number }>;
  animatingIds: Set<string>;
  removedTiles: Map<string, { x: number; y: number; tile: TurnTile }>;
}

@Component({
  selector: 'app-battle-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battle-tracker.component.html',
  styleUrl: './battle-tracker.component.css',
})
export class BattleTracker implements OnInit, OnDestroy {
  @Input() engine!: BattleTrackerEngine;
  @ViewChild('timelineContainer') timelineRef!: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);

  // Reactive state
  timeline = signal<TurnGroup[]>([]);
  characters = signal<BattleCharacter[]>([]);
  currentTurnDisplay = signal<string | null>(null);

  // Available teams
  readonly teams = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];

  // Drag state
  draggedTileId: string | null = null;
  dragOverGroupIndex: number | null = null;
  dropPosition: 'before' | 'after' | null = null;

  // Animation state
  private animState: AnimationState = {
    previousPositions: new Map(),
    animatingIds: new Set(),
    removedTiles: new Map(),
  };

  private pendingAnimation = false;

  ngOnInit(): void {
    if (this.engine) {
      this.engine.setChangeCallback(() => this.onEngineChange());
      this.refresh();
    }
  }

  ngOnDestroy(): void {
    if (this.engine) {
      this.engine.setChangeCallback(() => {});
    }
  }

  // ============================================
  // Data Refresh
  // ============================================

  private onEngineChange(): void {
    // Step 1 of FLIP: Record current positions before update
    this.recordPositions();
    
    // Update data
    this.refresh();
    
    // Schedule animation - need to wait TWO frames:
    // Frame 1: Angular renders the new DOM
    // Frame 2: We can measure new positions and start animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.animateTransitions();
      });
    });
  }

  private refresh(): void {
    this.timeline.set(this.engine.getTimeline());
    this.characters.set(this.engine.getCharacters());
    this.currentTurnDisplay.set(this.engine.getCurrentTurnDisplay());
    this.cdr.detectChanges();
  }

  // ============================================
  // FLIP Animations
  // ============================================

  private recordPositions(): void {
    if (!this.timelineRef?.nativeElement) return;

    const container = this.timelineRef.nativeElement;
    this.animState.previousPositions.clear();

    // Record tile positions
    const tiles = container.querySelectorAll<HTMLElement>('[data-tile-id]');
    tiles.forEach(el => {
      const id = el.dataset['tileId'];
      if (id) {
        const rect = el.getBoundingClientRect();
        this.animState.previousPositions.set(id, { x: rect.left, y: rect.top });
      }
    });

    // Record group positions
    const groups = container.querySelectorAll<HTMLElement>('[data-group-id]');
    groups.forEach(el => {
      const id = el.dataset['groupId'];
      if (id) {
        const rect = el.getBoundingClientRect();
        this.animState.previousPositions.set(`group_${id}`, { x: rect.left, y: rect.top });
      }
    });
  }

  private animateTransitions(): void {
    if (!this.timelineRef?.nativeElement) return;

    const container = this.timelineRef.nativeElement;
    
    console.log('[ANIM] Starting animation cycle');
    console.log('[ANIM] Recorded positions:', Array.from(this.animState.previousPositions.keys()));

    // Animate tiles
    const tiles = container.querySelectorAll<HTMLElement>('[data-tile-id]');
    console.log('[ANIM] Current tiles in DOM:', tiles.length);
    
    tiles.forEach(el => {
      const id = el.dataset['tileId'];
      if (!id) return;

      const prevPos = this.animState.previousPositions.get(id);
      const currentRect = el.getBoundingClientRect();
      
      console.log(`[ANIM] Tile ${id}: prevPos=${prevPos ? `(${prevPos.x.toFixed(1)}, ${prevPos.y.toFixed(1)})` : 'NEW'}, currentPos=(${currentRect.left.toFixed(1)}, ${currentRect.top.toFixed(1)})`);
      
      if (!prevPos) {
        // New tile - slide in from top
        this.animateIn(el, id);
      } else {
        // Existing tile - slide to new position
        this.animateMove(el, id, prevPos);
      }
    });
  }

  private animateIn(el: HTMLElement, id: string): void {
    if (this.animState.animatingIds.has(id)) return;
    this.animState.animatingIds.add(id);

    el.style.transition = 'none';
    el.style.transform = 'translateY(-40px)';
    el.style.opacity = '0';

    // Force reflow
    void el.offsetHeight;

    el.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';

    this.cleanupAfterAnimation(el, id, 350);
  }

  private animateMove(el: HTMLElement, id: string, prevPos: { x: number; y: number }): void {
    const rect = el.getBoundingClientRect();
    const deltaX = prevPos.x - rect.left;
    const deltaY = prevPos.y - rect.top;

    console.log(`[ANIM] Tile ${id}: deltaX=${deltaX.toFixed(1)}, deltaY=${deltaY.toFixed(1)}`);

    // Skip if movement is negligible
    if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) return;

    if (this.animState.animatingIds.has(id)) return;
    this.animState.animatingIds.add(id);

    el.style.transition = 'none';
    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Force reflow
    void el.offsetHeight;

    el.style.transition = 'transform 0.3s ease-out';
    el.style.transform = 'translate(0, 0)';

    this.cleanupAfterAnimation(el, id, 350);
  }

  private cleanupAfterAnimation(el: HTMLElement, id: string, timeout: number): void {
    let cleaned = false;
    
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      el.style.transition = '';
      el.style.transform = '';
      el.style.opacity = '';
      this.animState.animatingIds.delete(id);
    };

    // Use setTimeout only - transitionend can be unreliable
    setTimeout(cleanup, timeout);
  }

  // ============================================
  // Character Actions
  // ============================================

  onAddCharacter(characterId: string): void {
    this.engine.addCharacter(characterId);
  }

  onRemoveCharacter(characterId: string): void {
    this.engine.removeCharacter(characterId);
  }

  onTeamChange(characterId: string, team: string): void {
    this.engine.setTeam(characterId, team);
  }

  // ============================================
  // Battle Controls
  // ============================================

  onNextTurn(): void {
    this.engine.nextTurn();
  }

  onResetBattle(): void {
    this.engine.resetBattle();
  }

  // ============================================
  // Drag & Drop
  // ============================================

  onDragStart(event: DragEvent, tile: TurnTile): void {
    this.draggedTileId = tile.id;
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tile.id);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.draggedTileId) return;

    const container = event.currentTarget as HTMLElement;
    const groupEls = Array.from(container.querySelectorAll<HTMLElement>('[data-group-id]'));

    if (groupEls.length === 0) {
      this.dragOverGroupIndex = 0;
      this.dropPosition = 'before';
      return;
    }

    const mouseX = event.clientX;

    // Before first group?
    const firstRect = groupEls[0].getBoundingClientRect();
    if (mouseX < firstRect.left) {
      this.dragOverGroupIndex = 0;
      this.dropPosition = 'before';
      return;
    }

    // After last group?
    const lastRect = groupEls[groupEls.length - 1].getBoundingClientRect();
    if (mouseX > lastRect.right) {
      this.dragOverGroupIndex = groupEls.length - 1;
      this.dropPosition = 'after';
      return;
    }

    // Find closest group
    let closestIndex = 0;
    let minDistance = Infinity;
    let position: 'before' | 'after' = 'before';

    groupEls.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
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

  onDragLeave(event: DragEvent): void {
    const container = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;

    if (related && container.contains(related)) return;

    this.dragOverGroupIndex = null;
    this.dropPosition = null;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    
    if (!this.draggedTileId || this.dragOverGroupIndex === null || !this.dropPosition) {
      this.clearDragState();
      return;
    }

    this.engine.dropTile(this.draggedTileId, this.dragOverGroupIndex, this.dropPosition);
    this.clearDragState();
  }

  onDragEnd(): void {
    this.clearDragState();
  }

  private clearDragState(): void {
    this.draggedTileId = null;
    this.dragOverGroupIndex = null;
    this.dropPosition = null;
  }

  // ============================================
  // Template Helpers
  // ============================================

  isAnimating(id: string): boolean {
    return this.animState.animatingIds.has(id);
  }

  isDragged(id: string): boolean {
    return this.draggedTileId === id;
  }

  trackGroup(index: number, group: TurnGroup): string {
    return group.id;
  }

  trackTile(index: number, tile: TurnTile): string {
    return tile.id;
  }

  trackChar(index: number, char: BattleCharacter): string {
    return char.id;
  }
}
