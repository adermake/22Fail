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
  computed,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleTrackerEngine, TurnGroup, TurnTile, BattleCharacter } from './battle-tracker-engine';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

interface RadialMenuPosition {
  x: number;
  y: number;
}

/**
 * Animation tracking for FLIP animations
 */
interface AnimationState {
  previousPositions: Map<string, { x: number; y: number }>;
  animatingIds: Set<string>;
  isAnimating: boolean;
}

@Component({
  selector: 'app-battle-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './battle-tracker.component.html',
  styleUrl: './battle-tracker.component.css',
})
export class BattleTracker implements OnInit, OnDestroy {
  @Input() engine!: BattleTrackerEngine;
  @Input() readOnly = false; // View-only mode for lobby
  @ViewChild('timelineContainer') timelineRef!: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);

  // Reactive state
  timeline = signal<TurnGroup[]>([]);
  participants = signal<BattleCharacter[]>([]);
  allCharacters = signal<BattleCharacter[]>([]);
  currentTurnDisplay = signal<string | null>(null);

  // Computed: characters NOT in battle (for available column)
  availableCharacters = computed(() => this.allCharacters().filter(c => !c.isInBattle));
  
  // Computed: characters IN battle (for battle column)
  inBattleCharacters = computed(() => this.allCharacters().filter(c => c.isInBattle));

  // Drag state for character tiles
  private draggedCharId: string | null = null;

  // Radial menu state
  radialMenuOpen = signal(false);
  radialMenuPosition = signal<RadialMenuPosition>({ x: 0, y: 0 });
  private radialMenuCharId: string | null = null;

  // Slider drag state (to disable animations while dragging)
  isDraggingMeter = signal(false);
  private meterUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

  // Available teams
  readonly teams = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];
  
  // Turn meter max value
  readonly TURN_METER_MAX = 1000;

  // Animation state
  private animState: AnimationState = {
    previousPositions: new Map(),
    animatingIds: new Set(),
    isAnimating: false,
  };

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
    if (this.meterUpdateTimeout) {
      clearTimeout(this.meterUpdateTimeout);
    }
  }

  // Close radial menu when clicking outside
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeRadialMenu();
  }

  // ============================================
  // Data Refresh
  // ============================================

  private onEngineChange(): void {
    // Skip FLIP animations if we're dragging the meter OR in readOnly mode (lobby)
    if (this.isDraggingMeter() || this.readOnly) {
      this.refresh();
      return;
    }
    
    // Record positions BEFORE refresh for FLIP animations
    this.recordPositions();
    
    // Set animation lock
    this.animState.isAnimating = true;
    
    // Update data
    this.refresh();
    
    // Schedule animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.animateTransitions();
        setTimeout(() => {
          this.animState.isAnimating = false;
        }, 350);
      });
    });
  }

  private refresh(): void {
    this.timeline.set(this.engine.getTimeline());
    const chars = this.engine.getCharacters();
    this.allCharacters.set(chars);
    this.participants.set(chars.filter(c => c.isInBattle));
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
  }

  private animateTransitions(): void {
    if (!this.timelineRef?.nativeElement) return;

    const container = this.timelineRef.nativeElement;

    // Animate tiles
    const tiles = container.querySelectorAll<HTMLElement>('[data-tile-id]');
    
    tiles.forEach(el => {
      const id = el.dataset['tileId'];
      if (!id) return;

      const prevPos = this.animState.previousPositions.get(id);
      const currentRect = el.getBoundingClientRect();
      
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

    void el.offsetHeight; // Force reflow

    el.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';

    this.cleanupAfterAnimation(el, id, 350);
  }

  private animateMove(el: HTMLElement, id: string, prevPos: { x: number; y: number }): void {
    const rect = el.getBoundingClientRect();
    const deltaX = prevPos.x - rect.left;
    const deltaY = prevPos.y - rect.top;

    // Skip if movement is negligible
    if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) return;

    if (this.animState.animatingIds.has(id)) return;
    this.animState.animatingIds.add(id);

    el.style.transition = 'none';
    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    void el.offsetHeight; // Force reflow

    el.style.transition = 'transform 0.3s ease-out';
    el.style.transform = 'translate(0, 0)';

    this.cleanupAfterAnimation(el, id, 350);
  }

  private cleanupAfterAnimation(el: HTMLElement, id: string, timeout: number): void {
    setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.opacity = '';
      this.animState.animatingIds.delete(id);
    }, timeout);
  }

  // ============================================
  // Character Actions (World View Only)
  // ============================================

  onAddCharacter(characterId: string): void {
    if (this.readOnly) return;
    this.recordPositions();
    this.engine.addCharacter(characterId);
  }

  onRemoveCharacter(characterId: string): void {
    if (this.readOnly) return;
    this.recordPositions();
    this.engine.removeCharacter(characterId);
  }

  onTeamChange(characterId: string, team: string): void {
    if (this.readOnly) return;
    this.recordPositions();
    this.engine.setTeam(characterId, team);
  }

  // ============================================
  // Character Drag & Drop
  // ============================================

  onCharDragStart(event: DragEvent, char: BattleCharacter): void {
    this.draggedCharId = char.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', char.id);
    }
  }

  onBattleColumnDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onBattleColumnDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.draggedCharId) {
      const char = this.allCharacters().find(c => c.id === this.draggedCharId);
      if (char && !char.isInBattle) {
        this.onAddCharacter(this.draggedCharId);
      }
    }
    this.draggedCharId = null;
  }

  onAvailableColumnDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onAvailableColumnDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.draggedCharId) {
      const char = this.allCharacters().find(c => c.id === this.draggedCharId);
      if (char && char.isInBattle) {
        this.onRemoveCharacter(this.draggedCharId);
      }
    }
    this.draggedCharId = null;
  }

  // ============================================
  // Turn Meter Controls (World View Only)
  // ============================================

  onMeterDragStart(): void {
    this.isDraggingMeter.set(true);
  }

  onMeterDragEnd(): void {
    // Delay turning off dragging to allow final update
    setTimeout(() => {
      this.isDraggingMeter.set(false);
    }, 50);
  }

  onTurnMeterInput(characterId: string, event: Event): void {
    if (this.readOnly) return;
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    
    // Debounce the engine update for smoother dragging
    if (this.meterUpdateTimeout) {
      clearTimeout(this.meterUpdateTimeout);
    }
    
    // Update immediately for responsiveness (no position recording during drag)
    this.engine.setTurnMeterImmediate(characterId, value);
    
    // Debounce the full save
    this.meterUpdateTimeout = setTimeout(() => {
      this.engine.saveTurnMeter(characterId, value);
    }, 100);
  }

  onTurnMeterChange(characterId: string, event: Event): void {
    if (this.readOnly) return;
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.recordPositions();
    this.engine.setTurnMeter(characterId, value);
  }

  onResetTurnMeters(): void {
    if (this.readOnly) return;
    this.recordPositions();
    this.engine.resetTurnMeters();
  }

  // ============================================
  // Radial Team Menu
  // ============================================

  onTileClick(event: MouseEvent, tile: TurnTile): void {
    if (this.readOnly) return;
    event.stopPropagation();
    
    // Find the character for this tile
    const char = this.inBattleCharacters().find(c => c.id === tile.characterId);
    if (!char) return;

    // Position the radial menu at click location
    this.radialMenuCharId = tile.characterId;
    this.radialMenuPosition.set({ x: event.clientX, y: event.clientY });
    this.radialMenuOpen.set(true);
  }

  closeRadialMenu(): void {
    this.radialMenuOpen.set(false);
    this.radialMenuCharId = null;
  }

  getRadialMenuChar(): BattleCharacter | null {
    if (!this.radialMenuCharId) return null;
    return this.inBattleCharacters().find(c => c.id === this.radialMenuCharId) || null;
  }

  onRadialTeamSelect(team: string): void {
    if (this.radialMenuCharId) {
      this.recordPositions();
      this.engine.setTeam(this.radialMenuCharId, team);
    }
    this.closeRadialMenu();
  }

  onRadialRemove(): void {
    if (this.radialMenuCharId) {
      this.recordPositions();
      this.engine.removeCharacter(this.radialMenuCharId);
    }
    this.closeRadialMenu();
  }

  // ============================================
  // Battle Controls
  // ============================================

  onNextTurn(): void {
    if (this.readOnly) return;
    if (this.animState.isAnimating) return;
    
    this.recordPositions();
    this.engine.nextTurn();
  }

  onResetBattle(): void {
    if (this.readOnly) return;
    this.recordPositions();
    this.engine.resetBattle();
  }

  // ============================================
  // Template Helpers
  // ============================================

  trackGroup(index: number, group: TurnGroup): string {
    return group.id;
  }

  trackTile(index: number, tile: TurnTile): string {
    return tile.id;
  }

  trackChar(index: number, char: BattleCharacter): string {
    return char.id;
  }

  isAnimating(id: string): boolean {
    return this.animState.animatingIds.has(id);
  }

  /** Get turn meter percentage for progress bar */
  getTurnMeterPercent(char: BattleCharacter): number {
    return (char.turnMeter / this.TURN_METER_MAX) * 100;
  }
}
