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
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BattleTrackerEngine, TurnGroup, TurnTile, BattleCharacter } from './battle-tracker-engine';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

interface RadialMenuPosition {
  x: number;
  y: number;
}

/** A tile's element and on-screen rect just before a re-render (FLIP "first"). */
interface TileSnapshot {
  el: HTMLElement;
  rect: DOMRect;
}

const TILE_ANIM_MS = 450;

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
  @Input() compactMode = false; // Compact top-bar mode for lobby
  @Input() effectReminderIds: Set<string> = new Set();
  @Input() selectedCharacterId: string | null = null;
  @Output() dismissEffectReminder = new EventEmitter<string>();
  @Output() tileSelect = new EventEmitter<string>();
  /** Compact mode: allow "Aus Kampf entfernen" via right-click (lobby: GM only). */
  @Input() allowRemove = false;
  @Output() tileRemove = new EventEmitter<string>();
  @ViewChild('timelineContainer') timelineRef!: ElementRef<HTMLElement>;

  private cdr = inject(ChangeDetectorRef);

  // Reactive state
  timeline = signal<TurnGroup[]>([]);
  /** The group whose turn just ended (compact "Zuletzt" section). */
  pastGroup = signal<TurnGroup | null>(null);
  tileMenu = signal<{ x: number; y: number; tile: TurnTile } | null>(null);
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
    this.closeTileMenu();
  }

  // ============================================
  // Data Refresh
  // ============================================

  private onEngineChange(): void {
    // No animations while scrubbing a meter slider: every input event reshuffles the timeline.
    if (this.isDraggingMeter()) {
      this.refresh();
      return;
    }

    // FLIP: capture where every tile is on screen, let Angular re-render synchronously
    // (refresh() runs detectChanges), then animate each tile from its old spot to its new one.
    const before = this.captureTiles();
    this.refresh();
    this.animateFrom(before);
  }

  private refresh(): void {
    this.timeline.set(this.engine.getTimeline());
    this.pastGroup.set(this.engine.getPastGroup());
    const chars = this.engine.getCharacters();
    this.allCharacters.set(chars);
    this.participants.set(chars.filter(c => c.isInBattle));
    this.currentTurnDisplay.set(this.engine.getCurrentTurnDisplay());
    this.cdr.detectChanges();
  }

  // ============================================
  // FLIP Animations
  // ============================================

  /**
   * Visual rect of every tile, keyed by its stable id (`characterId#absoluteTurn`). Measured
   * with any running animation applied, so a click mid-animation continues from where the tile
   * actually is instead of snapping.
   */
  private captureTiles(): Map<string, TileSnapshot> {
    const result = new Map<string, TileSnapshot>();
    const container = this.timelineRef?.nativeElement;
    if (!container) return result;
    container.querySelectorAll<HTMLElement>('[data-tile-id]').forEach(el => {
      const id = el.dataset['tileId'];
      if (id) result.set(id, { el, rect: el.getBoundingClientRect() });
    });
    return result;
  }

  private animateFrom(before: Map<string, TileSnapshot>): void {
    const container = this.timelineRef?.nativeElement;
    if (!container || typeof Element.prototype.animate !== 'function') return;
    // First paint / remount: nothing to move from, so don't make the whole bar fly in.
    if (before.size === 0) return;

    const seen = new Set<string>();
    container.querySelectorAll<HTMLElement>('[data-tile-id]').forEach(el => {
      const id = el.dataset['tileId'];
      if (!id) return;
      seen.add(id);
      for (const a of el.getAnimations()) a.cancel();
      const rect = el.getBoundingClientRect();
      const prev = before.get(id)?.rect;

      if (!prev) {
        // Newly visible turn: slides in from the right end of the bar.
        el.animate(
          [
            { transform: 'translateX(24px)', opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: TILE_ANIM_MS, easing: 'ease-out', delay: TILE_ANIM_MS * 0.4, fill: 'backwards' },
        );
        return;
      }

      const dx = prev.left - rect.left;
      const dy = prev.top - rect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: TILE_ANIM_MS, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
      );
    });

    // Consumed turns: Angular already detached their elements. Re-show each one as a fixed
    // ghost where it was and let it slide out to the left, so "this turn is over" is visible.
    for (const [id, snap] of before) {
      if (seen.has(id)) continue;
      const ghost = snap.el;
      for (const a of ghost.getAnimations()) a.cancel();
      Object.assign(ghost.style, {
        position: 'fixed',
        left: `${snap.rect.left}px`,
        top: `${snap.rect.top}px`,
        width: `${snap.rect.width}px`,
        height: `${snap.rect.height}px`,
        margin: '0',
        pointerEvents: 'none',
        zIndex: '1000',
        boxSizing: 'border-box',
      });
      document.body.appendChild(ghost);
      const anim = ghost.animate(
        [
          { transform: 'none', opacity: 1 },
          { transform: 'translateX(-40px) scale(0.85)', opacity: 0 },
        ],
        { duration: TILE_ANIM_MS, easing: 'ease-in', fill: 'forwards' },
      );
      anim.onfinish = anim.oncancel = () => ghost.remove();
    }
  }

  // ============================================
  // Character Actions (World View Only)
  // ============================================

  onAddCharacter(characterId: string): void {
    if (this.readOnly) return;    this.engine.addCharacter(characterId);
  }

  onRemoveCharacter(characterId: string): void {
    if (this.readOnly) return;    this.engine.removeCharacter(characterId);
  }

  onTeamChange(characterId: string, team: string): void {
    if (this.readOnly) return;    this.engine.setTeam(characterId, team);
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
    const value = parseInt((event.target as HTMLInputElement).value, 10);    this.engine.setTurnMeter(characterId, value);
  }

  onResetTurnMeters(): void {
    if (this.readOnly) return;    this.engine.resetTurnMeters();
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

  onCompactTileClick(event: MouseEvent, tile: TurnTile): void {
    if ((event.target as HTMLElement).closest('.compact-effect-reminder')) return;
    this.tileSelect.emit(tile.characterId);
  }

  onCompactTileContextMenu(event: MouseEvent, tile: TurnTile): void {
    if (!this.allowRemove) return;
    event.preventDefault();
    event.stopPropagation();
    // Keep the menu inside the viewport (it opens below/right of the cursor).
    const x = Math.min(event.clientX, window.innerWidth - 190);
    const y = Math.min(event.clientY, window.innerHeight - 90);
    this.tileMenu.set({ x, y, tile });
  }

  closeTileMenu(): void {
    this.tileMenu.set(null);
  }

  onTileMenuRemove(): void {
    const menu = this.tileMenu();
    if (menu) this.tileRemove.emit(menu.tile.characterId);
    this.closeTileMenu();
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
    if (this.radialMenuCharId) {      this.engine.setTeam(this.radialMenuCharId, team);
    }
    this.closeRadialMenu();
  }

  onRadialRemove(): void {
    if (this.radialMenuCharId) {      this.engine.removeCharacter(this.radialMenuCharId);
    }
    this.closeRadialMenu();
  }

  // ============================================
  // Battle Controls
  // ============================================

  onNextTurn(): void {
    if (this.readOnly) return;
    this.engine.nextTurn();
  }

  onResetBattle(): void {
    if (this.readOnly) return;
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

  /** Get turn meter percentage for progress bar (a pending character can sit at >= 1000). */
  getTurnMeterPercent(char: BattleCharacter): number {
    return Math.min(100, (char.turnMeter / this.TURN_METER_MAX) * 100);
  }
}
