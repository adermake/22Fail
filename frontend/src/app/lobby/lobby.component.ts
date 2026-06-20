/**
 * Lobby Component
 * 
 * Main coordinator for the virtual tabletop.
 * Links to /world/:worldName for character data.
 * 
 * URL: /lobby/:worldName
 */

import { Component, OnInit, OnDestroy, HostListener, ViewChild, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { LobbyStoreService } from '../services/lobby-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { WorldSocketService, DiceRollEvent } from '../services/world-socket.service';
import { CharacterSocketService, CharacterPatchEvent } from '../services/character-socket.service';
import { CharacterApiService } from '../services/character-api.service';
import { ImageService } from '../services/image.service';
import { TextureService } from '../services/texture.service';
import { TrueStatsService } from '../services/true-stats.service';
import { AssetBrowserApiService } from '../services/asset-browser-api.service';
import { prepareImageForUpload, formatBytes } from '../shared/image-upload.utils';
import { CharacterSheet } from '../model/character-sheet-model';
import { NpcStatblock } from '../model/npc-statblock.model';
import { LobbyData, LobbyMap, Token, HexCoord, LibraryImage, LibraryTexture, LinkedTokenType } from '../model/lobby.model';

import { LobbyGridComponent } from './lobby-grid/lobby-grid.component';
import { LobbyToolbarComponent } from './lobby-toolbar/lobby-toolbar.component';
import { LobbySidebarComponent } from './lobby-sidebar/lobby-sidebar.component';
import { LobbyCharacterPanelComponent } from './lobby-character-panel/lobby-character-panel.component';
import { LobbyBottomPanelComponent } from './lobby-bottom-panel/lobby-bottom-panel.component';
import { BattleTracker } from '../world/battle-tracker/battle-tracker.component';
import { BattleTrackerEngine } from '../world/battle-tracker/battle-tracker-engine';

// Tool types
export type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure' | 'image' | 'texture' | 'fog' | 'lasso';
export type DragMode = 'free' | 'enforced';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LobbyGridComponent,
    LobbyToolbarComponent,
    LobbySidebarComponent,
    LobbyCharacterPanelComponent,
    LobbyBottomPanelComponent,
    BattleTracker,
  ],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  store = inject(LobbyStoreService);
  private worldStore = inject(WorldStoreService);
  private worldSocket = inject(WorldSocketService);
  private characterSocket = inject(CharacterSocketService);
  private characterApi = inject(CharacterApiService);
  private imageService = inject(ImageService);
  private textureService = inject(TextureService);
  private trueStats = inject(TrueStatsService);
  private assetBrowserApi = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(LobbyGridComponent) gridComponent?: LobbyGridComponent;

  private subscriptions: Subscription[] = [];

  // Route state
  worldName = signal('');
  isGM = signal(false);

  // Lobby state
  lobby = signal<LobbyData | null>(null);
  currentMapId = signal('default');

  // World state
  worldCharacters = signal<{ id: string; sheet: CharacterSheet }[]>([]);
  npcStatblocks = signal<{ id: string; name: string; statblock: NpcStatblock }[]>([]);

  // Dice roll history
  rollHistory = signal<DiceRollEvent[]>([]);

  // Tool state
  currentTool = signal<ToolType>('cursor');
  brushColor = signal('#000000');
  penBrushSize = signal(4);
  eraserBrushSize = signal(12);
  fogBrushSize = signal(30); // Fog of war brush size
  textureBrushSize = signal(30);
  textureBrushStrength = signal(1.0); // 0-1
  textureScale = signal(0.1); // Default 10x smaller tiles
  textureBrushType = signal<'hard' | 'soft'>('hard');
  textureColorBlend = signal(0); // 0-100%
  textureBlendColor = signal('#ffffff');
  textureHue = signal(0); // -180 to 180 degrees
  textureLayer = signal<'background' | 'foreground'>('background');
  isEraserMode = signal(false); // E key toggles this
  drawWithWalls = signal(false);
  dragMode = signal<DragMode>('free');

  // Layer visibility toggles (toolbar eye buttons)
  imageLayerVisible = signal(true);

  // Selection state
  selectedImageId = signal<string | null>(null);
  selectedTextureId = signal<string | null>(null);

  // UI state
  showSidebar = signal(true);
  sidebarTab = signal<'characters' | 'images' | 'textures'>('characters');
  showMapSettingsModal = signal(false);
  newMapName = ''; // For creating new maps

  // Computed: current map
  currentMap = computed(() => {
    const l = this.lobby();
    const mapId = this.currentMapId();
    return l?.maps[mapId] || null;
  });

  // Computed: tokens enriched with portraits from character sheets
  enrichedTokens = computed(() => {
    const map = this.currentMap();
    if (!map) return [];

    const chars = this.worldCharacters();
    const teams = this.battleTeams();
    const charMap = new Map<string, { id: string; sheet: CharacterSheet }>();
    const portraitMap = new Map<string, string>();
    chars.forEach(c => {
      charMap.set(c.id, c);
      if (c.sheet.portrait) {
        portraitMap.set(c.id, c.sheet.portrait);
      }
    });

    return map.tokens.map(token => {
      const char = token.isQuickToken ? null : charMap.get(token.characterId);
      const movementSpeed = char
        ? this.trueStats.calculateEffectiveSpeed(char.sheet)
        : (token.movementSpeed ?? 6);
      return {
        ...token,
        portrait: token.isQuickToken ? token.portrait : (portraitMap.get(token.characterId) || token.portrait),
        team: teams.get(token.characterId) || token.team || 'blue',
        movementSpeed,
      };
    });
  });

  // Computed: image library (NOW FROM GLOBAL STORE, NOT LOBBY DATA)
  imageLibrary = this.store.imageLibraryReadonly;
  textureLibrary = this.store.textureLibrary;

  // Computed: map list for management
  mapList = computed(() => {
    const l = this.lobby();
    if (!l) return [];
    return Object.entries(l.maps).map(([id, map]) => ({ id, name: map.name }));
  });

  // Battle Engine (same as world component)
  battleEngine = new BattleTrackerEngine();

  // Team assignments from battle tracker (reactive for token rendering)
  battleTeams = signal<Map<string, string>>(new Map());

  // Battle tracker visibility
  showBattleTracker = signal(true);
  showClockDialog = signal(false);
  // Kampfrunde mode - GM activates to show compact top-bar battle tracker
  kampfrundeMode = signal(false);

  // Selected token for quick view panel
  selectedTokenId = signal<string | null>(null);
  pendingLinkedToken = signal<{ parentId: string; type: LinkedTokenType; name: string } | null>(null);

  // Computed: selected token quick view data
  selectedTokenInfo = computed(() => {
    const tokenId = this.selectedTokenId();
    if (!tokenId) return null;
    const token = this.enrichedTokens().find(t => t.id === tokenId);
    if (!token) return null;

    if (token.statblockId) {
      const npc = this.npcStatblocks().find(n => n.id === token.statblockId);
      return { token, type: 'npc' as const, npc: npc?.statblock ?? null, character: null };
    }

    const character = this.worldCharacters().find(c => c.id === token.characterId);
    return { token, type: 'character' as const, character: character?.sheet ?? null, npc: null };
  });

  // Computed: separate accessors for character panel inputs
  selectedPanelToken = computed(() => this.selectedTokenInfo()?.token ?? null);
  selectedPanelCharacter = computed(() => this.selectedTokenInfo()?.character ?? null);
  selectedPanelNpc = computed(() => this.selectedTokenInfo()?.npc ?? null);

  ngOnInit(): void {
    // Connect battle engine to world store for persistence (mirrors world view)
    this.battleEngine.setWorldStore(this.worldStore);
    
    // Subscribe to world changes to keep battle tracker in sync
    this.subscriptions.push(
      this.worldStore.world$.subscribe((world) => {
        if (world) {
          this.syncClockInputsFromWorld();

          // Sync battle tracker when world changes (e.g., participants updated from other client)
          this.battleEngine.syncFromWorldStore();

          // Evaluate encounter reminder when synced clock hits a clean interval hour.
          this.maybeTriggerEncounterReminder(this.worldClock, false);

          // Update team assignments for token rendering
          const chars = this.battleEngine.getCharacters();
          const teamMap = new Map<string, string>();
          chars.forEach(c => {
            if (c.isInBattle) {
              teamMap.set(c.id, c.team);
            }
          });
          this.battleTeams.set(teamMap);

          this.cdr.markForCheck();
        }
      })
    );
    
    // Subscribe to route
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        const worldName = params.get('worldName') || 'default';
        this.worldName.set(worldName);

        // Check for GM mode
        this.route.queryParamMap.subscribe((queryParams) => {
          this.isGM.set(queryParams.get('gm') === 'true');
        });

        // Load lobby
        await this.loadLobby(worldName);

        // Connect character socket for status-effect & resource patches
        this.characterSocket.connect();

        // Connect world socket for dice rolls and world events
        this.worldSocket.connect();
        await this.worldSocket.joinWorld(worldName);

        // Load world for characters
        await this.worldStore.load(worldName);
        console.log('[Lobby] World loaded, characterIds:', this.worldStore.worldValue?.characterIds);
        await this.loadWorldCharacters();
        await this.loadNpcStatblocks();
        this.syncClockInputsFromWorld();
        
        // Initial load of battle tracker
        this.battleEngine.loadFromWorldStore();
        
        // Force change detection after all initial data is loaded
        // Using setTimeout to ensure data propagates through all child components
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      })
    );

    // Subscribe to lobby changes
    this.subscriptions.push(
      this.store.lobby$.subscribe((lobby) => {
        this.lobby.set(lobby);
        if (lobby?.activeMapId) {
          this.currentMapId.set(lobby.activeMapId);
        }
        this.cdr.markForCheck();
      })
    );

    // Subscribe to dice roll events
    this.subscriptions.push(
      this.worldSocket.diceRoll$.subscribe((roll) => {
        console.log('[Lobby] Received dice roll:', roll);
        
        // Add to history (keep last 100 rolls)
        this.rollHistory.update(history => {
          const updated = [roll, ...history];
          return updated.slice(0, 100);
        });

        // Show popup over token if visible on current map
        if (this.gridComponent) {
          this.gridComponent.showDiceRollPopup(roll.characterId, {
            id: roll.id,
            characterName: roll.characterName,
            diceType: roll.diceType,
            diceCount: roll.diceCount,
            rolls: roll.rolls,
            total: roll.result,
            bonuses: roll.bonuses
          });
        }

        this.cdr.markForCheck();
      })
    );

    // Subscribe to world patches to refresh character data when sheets are updated
    this.subscriptions.push(
      this.worldSocket.patches$.subscribe(async (patch) => {
        console.log('[Lobby] Received world patch, refreshing character data');
        // Refresh character data to sync resource bars
        await this.loadWorldCharacters();
      })
    );

    // Subscribe to character patches for real-time resource bar updates
    this.characterSocket.connect();
    this.subscriptions.push(
      this.characterSocket.patches$.subscribe((data: CharacterPatchEvent) => {
        const characterIndex = this.worldCharacters().findIndex(c => c.id === data.characterId);
        if (characterIndex >= 0) {
          const characters = [...this.worldCharacters()];
          // Shallow-copy the sheet so Angular OnPush detects a new reference
          const sheet = { ...characters[characterIndex].sheet };
          this.applyJsonPatch(sheet, data.patch);
          characters[characterIndex] = { ...characters[characterIndex], sheet };
          this.worldCharacters.set(characters);
          this.cdr.markForCheck();
        }
      })
    );
  }

  private async loadLobby(worldName: string): Promise<void> {
    console.log('[Lobby] Loading lobby for:', worldName);
    try {
      await this.store.loadLobby(worldName);
      console.log('[Lobby] Lobby loaded successfully');
    } catch (error) {
      console.error('[Lobby] Failed to load lobby:', error);
      // Continue anyway with empty lobby
    }
  }

  private async loadWorldCharacters(): Promise<void> {
    // Load only characters assigned to this world
    const worldCharacterIds = this.worldStore.worldValue?.characterIds ?? [];
    console.log('[Lobby] Loading world characters:', worldCharacterIds.length, worldCharacterIds);
    
    const characters: { id: string; sheet: CharacterSheet }[] = [];

    try {
      const allCharacterIds = worldCharacterIds.length > 0
        ? worldCharacterIds
        : await this.characterApi.getAllCharacterIds();
      console.log('[Lobby] Loading characters:', allCharacterIds.length);
      
      for (const charId of allCharacterIds) {
        try {
          console.log('[Lobby] Loading character:', charId);
          const sheet = await this.characterApi.loadCharacter(charId);
          if (sheet) {
            sheet.id = charId; // Ensure sheet has ID property
            console.log('[Lobby] Character loaded:', charId, sheet.name);
            characters.push({ id: charId, sheet });
            // Join character room for real-time updates
            this.characterSocket.joinCharacter(charId);
          } else {
            console.warn('[Lobby] Character sheet is null for:', charId);
          }
        } catch (e) {
          console.error('[Lobby] Failed to load character:', charId, e);
        }
      }
    } catch (e) {
      console.error('[Lobby] Failed to get character IDs:', e);
    }

    console.log('[Lobby] Loaded characters:', characters.length, characters.map(c => c.sheet.name));
    this.worldCharacters.set(characters);
    
    // Update battle engine with character data including proper speeds
    this.battleEngine.setAvailableCharacters(characters.map(c => ({
      id: c.id,
      name: c.sheet.name,
      portrait: c.sheet.portrait,
      speed: this.trueStats.calculateEffectiveSpeed(c.sheet) // Use effective speed including armor/encumbrance penalties
    })));

    // Keep lobby tracker grouping/turns faithful to persisted world state after character refresh.
    this.battleEngine.syncFromWorldStore();
    
    // Skip FLIP animations in battle tracker when loading characters
    this.cdr.detectChanges();
    
    // Force change detection after character library loads
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // ============================================
  // World Clock + Battle Controls (Top Bar)
  // ============================================

  private encounterReminderText = signal<string | null>(null);

  clockYearInput = signal(321);
  clockDayInput = signal(1);
  clockHourInput = signal(8);
  clockMinuteInput = signal(0);
  encounterIntervalInput = signal(4);

  get encounterReminder(): string | null {
    return this.encounterReminderText();
  }

  get worldClock() {
    return this.worldStore.worldValue?.worldClock ?? { year: 321, day: 1, hour: 8, minute: 0 };
  }

  get worldClockLabel(): string {
    const clock = this.worldClock;
    const day = String(clock.day).padStart(3, '0');
    const hour = String(clock.hour).padStart(2, '0');
    const minute = String(clock.minute).padStart(2, '0');
    return `Jahr: ${clock.year}  |  Tag: ${day}  |  ${hour}:${minute} Uhr`;
  }

  get encounterTimerSettings() {
    const clock = this.worldClock;
    const fallbackHour = this.toAbsoluteHour(clock);
    return this.worldStore.worldValue?.encounterTimer ?? {
      enabled: false,
      intervalHours: 4,
      nextTriggerAtHour: fallbackHour + 4,
    };
  }

  syncClockInputsFromWorld(): void {
    const clock = this.worldClock;
    this.clockYearInput.set(clock.year);
    this.clockDayInput.set(clock.day);
    this.clockHourInput.set(clock.hour);
    this.clockMinuteInput.set(clock.minute);
    this.encounterIntervalInput.set(this.encounterTimerSettings.intervalHours);
  }

  applyFantasyClockFromInputs(): void {
    if (!this.isGM()) return;

    const year = Math.max(1, Math.floor(this.clockYearInput()));
    const day = Math.min(360, Math.max(1, Math.floor(this.clockDayInput())));
    const hour = Math.min(23, Math.max(0, Math.floor(this.clockHourInput())));
    const minute = Math.min(59, Math.max(0, Math.floor(this.clockMinuteInput())));

    this.worldStore.applyPatch({ path: 'worldClock', value: { year, day, hour, minute } });
    this.maybeTriggerEncounterReminder({ year, day, hour, minute }, true);
  }

  shiftWorldClock(minutesDelta: number): void {
    if (!this.isGM()) return;
    const next = this.shiftFantasyClock(this.worldClock, minutesDelta);
    this.worldStore.applyPatch({ path: 'worldClock', value: next });
    this.syncClockInputsFromWorld();
    this.maybeTriggerEncounterReminder(next, true);
  }

  setEncounterTimerEnabled(enabled: boolean): void {
    if (!this.isGM()) return;
    const interval = Math.max(1, Math.floor(this.encounterIntervalInput()));
    const absoluteHour = this.toAbsoluteHour(this.worldClock);
    const timer = {
      enabled,
      intervalHours: interval,
      nextTriggerAtHour: this.nextAlignedHour(absoluteHour, interval),
    };
    this.worldStore.applyPatch({ path: 'encounterTimer', value: timer });
    this.encounterReminderText.set(null);
  }

  applyEncounterInterval(): void {
    if (!this.isGM()) return;
    const interval = Math.max(1, Math.floor(this.encounterIntervalInput()));
    const timer = this.encounterTimerSettings;
    const absoluteHour = this.toAbsoluteHour(this.worldClock);
    this.worldStore.applyPatch({
      path: 'encounterTimer',
      value: {
        ...timer,
        intervalHours: interval,
        nextTriggerAtHour: this.nextAlignedHour(absoluteHour, interval),
      },
    });
    this.encounterReminderText.set(null);
  }

  acknowledgeEncounterReminder(): void {
    this.encounterReminderText.set(null);
  }

  private shiftFantasyClock(clock: { year: number; day: number; hour: number; minute: number }, minutesDelta: number) {
    const minutesPerDay = 24 * 60;
    const minutesPerYear = 360 * minutesPerDay;
    const base = ((clock.year - 1) * minutesPerYear) + ((clock.day - 1) * minutesPerDay) + (clock.hour * 60) + clock.minute;
    const shifted = Math.max(0, base + minutesDelta);

    const year = Math.floor(shifted / minutesPerYear) + 1;
    const restYear = shifted % minutesPerYear;
    const day = Math.floor(restYear / minutesPerDay) + 1;
    const restDay = restYear % minutesPerDay;
    const hour = Math.floor(restDay / 60);
    const minute = restDay % 60;
    return { year, day, hour, minute };
  }

  private toAbsoluteHour(clock: { year: number; day: number; hour: number; minute: number }): number {
    return ((clock.year * 360 + (clock.day - 1)) * 24) + clock.hour;
  }

  private nextAlignedHour(currentHour: number, interval: number): number {
    const safeInterval = Math.max(1, interval);
    return (Math.floor(currentHour / safeInterval) + 1) * safeInterval;
  }

  private maybeTriggerEncounterReminder(clock: { year: number; day: number; hour: number; minute: number }, updateTimer: boolean): void {
    const timer = this.encounterTimerSettings;
    if (!timer.enabled) return;

    const absoluteHour = this.toAbsoluteHour(clock);
    if (absoluteHour < timer.nextTriggerAtHour) return;

    this.encounterReminderText.set('Begegnungswurf fällig: Bitte Begegnungstabelle würfeln.');

    if (!updateTimer || !this.isGM()) return;

    const interval = Math.max(1, timer.intervalHours);
    let nextHour = timer.nextTriggerAtHour;
    while (nextHour <= absoluteHour) {
      nextHour += interval;
    }

    this.worldStore.applyPatch({
      path: 'encounterTimer',
      value: {
        ...timer,
        nextTriggerAtHour: nextHour,
      },
    });
  }

  onLobbyNextTurn(): void {
    if (!this.isGM()) return;
    this.battleEngine.nextTurn();
  }

  private async loadNpcStatblocks(): Promise<void> {
    const linkedLibraries = this.worldStore.worldValue?.linkedLibraries ?? [];
    if (linkedLibraries.length === 0) return;

    const statblocks: { id: string; name: string; statblock: NpcStatblock }[] = [];
    for (const libraryId of linkedLibraries) {
      try {
        const files = await this.assetBrowserApi.searchFiles(libraryId, '', ['statblock']).toPromise();
        if (files) {
          for (const file of files) {
            statblocks.push({ id: file.id, name: file.name, statblock: file.data as NpcStatblock });
          }
        }
      } catch (e) {
        console.warn('[Lobby] Failed to load statblocks from library:', libraryId, e);
      }
    }
    this.npcStatblocks.set(statblocks);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
      case 'e':
        this.isEraserMode.set(!this.isEraserMode());
        event.preventDefault();
        break;
      case 'b':
        this.currentTool.set('draw');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 't':
        this.currentTool.set('texture');
        this.isEraserMode.set(false);
        this.sidebarTab.set('textures' as any);
        event.preventDefault();
        break;
      case 'g':
        this.currentTool.set('fog');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 's':
        this.currentTool.set('cursor');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'f':
        this.currentTool.set('lasso');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'delete':
        if (this.selectedTokenId()) {
          this.store.removeToken(this.selectedTokenId()!);
          this.selectedTokenId.set(null);
        }
        event.preventDefault();
        break;
      case 'm':
        this.currentTool.set('measure');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'r': {
        // Rotate selected token by 60° (Shift = -60°)
        const selectedId = this.selectedTokenId();
        if (selectedId) {
          const delta = event.shiftKey ? -60 : 60;
          this.store.rotateToken(selectedId, delta);
        }
        event.preventDefault();
        break;
      }
      case 'w':
        this.currentTool.set('walls');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'i':
        this.currentTool.set('image');
        this.isEraserMode.set(false);
        this.sidebarTab.set('textures' as any);
        event.preventDefault();
        break;
      case 'z':
        // Undo is handled by lobby-grid component (tool-specific)
        break;
    }
  }

  // ============================================
  // Tool Handlers
  // ============================================

  onToolChange(tool: ToolType): void {
    this.currentTool.set(tool);
    this.isEraserMode.set(false);

    // When switching to draw/lasso, ensure a draw layer is active
    if (tool === 'draw' || tool === 'lasso') {
      try {
        this.store.getActiveDrawLayerId();
      } catch { /* no map */ }
    }
    
    // Auto-switch to texture tab when texture or image tool selected
    if (tool === 'texture' || tool === 'image') {
      this.sidebarTab.set('textures' as any);
    }
  }

  onBrushColorChange(color: string): void {
    this.brushColor.set(color);
  }

  onPenBrushSizeChange(size: number): void {
    this.penBrushSize.set(size);
  }

  onEraserBrushSizeChange(size: number): void {
    this.eraserBrushSize.set(size);
  }

  onFogBrushSizeChange(size: number): void {
    this.fogBrushSize.set(size);
  }

  onClearFog(): void {
    this.store.clearFog();
  }

  onTextureBrushSizeChange(size: number): void {
    this.textureBrushSize.set(size);
  }

  onTextureBrushStrengthChange(strength: number): void {
    this.textureBrushStrength.set(strength);
  }

  onTextureScaleChange(scale: number): void {
    this.textureScale.set(scale);
  }

  onTextureBrushTypeChange(type: 'hard' | 'soft'): void {
    this.textureBrushType.set(type);
  }

  onTextureColorBlendChange(blend: number): void {
    this.textureColorBlend.set(blend);
  }

  onTextureBlendColorChange(color: string): void {
    this.textureBlendColor.set(color);
  }

  onTextureHueChange(hue: number): void {
    this.textureHue.set(hue);
  }

  onClearAllTextures(): void {
    if (confirm('Clear all texture strokes? This cannot be undone.')) {
      this.store.clearAllTextures();
    }
  }

  onDragModeChange(mode: DragMode): void {
    this.dragMode.set(mode);
  }

  onDrawWithWallsChange(enabled: boolean): void {
    this.drawWithWalls.set(enabled);
  }

  // ============================================
  // Token Handlers
  // ============================================

  onTokenDrop(data: { characterId: string; position: HexCoord }): void {
    console.log('[Lobby] Token drop:', data);
    const character = this.worldCharacters().find(c => c.id === data.characterId);
    if (!character) return;

    // Use TrueStatsService for correct speed calculation including all bonuses
    const movementSpeed = this.trueStats.calculateEffectiveSpeed(character.sheet);

    this.store.addToken({
      characterId: data.characterId,
      name: character.sheet.name || data.characterId,
      // Portrait is NOT stored on token - retrieved from character sheet at render time
      position: data.position,
      team: 'blue',
      isQuickToken: false,
      movementSpeed,
    });
    
    // Switch to cursor tool after dropping token
    this.currentTool.set('cursor');
  }

  onQuickTokenDrop(data: { name: string; portrait: string; position: HexCoord }): void {
    console.log('[Lobby] Quick token drop:', data);
    this.store.addToken({
      characterId: 'quick-' + Date.now(),
      name: data.name,
      portrait: data.portrait, // This is an imageId, not base64
      position: data.position,
      team: 'red',
      isQuickToken: true,
    });
    
    // Switch to cursor tool after dropping token
    this.currentTool.set('cursor');
  }

  onTokenMove(data: { tokenId: string; position: HexCoord }): void {
    this.store.moveToken(data.tokenId, data.position);
  }

  onTokenRemove(tokenId: string): void {
    this.store.removeToken(tokenId);
  }

  onTokenCombatAdd(data: { tokenId: string; team?: string }): void {
    const token = this.enrichedTokens().find(t => t.id === data.tokenId);
    if (!token) return;
    const targetTeam = data.team || token.team || 'blue';

    // For NPC quick-tokens, register them in the battle engine first
    // (they aren't added via setAvailableCharacters which only covers player characters)
    if (token.isQuickToken && token.statblockId) {
      const npcEntry = this.npcStatblocks().find(n => n.id === token.statblockId);
      const speed = npcEntry?.statblock?.speed ?? 10;
      this.battleEngine.registerCharacter(token.characterId, {
        name: token.name,
        portrait: token.portrait,
        speed,
      });
    }

    this.battleEngine.addCharacter(token.characterId);
    this.battleEngine.setTeam(token.characterId, targetTeam);
  }

  onTokenCombatRemove(tokenId: string): void {
    const token = this.enrichedTokens().find(t => t.id === tokenId);
    if (!token) return;
    this.battleEngine.removeCharacter(token.characterId);
  }

  onTokenClick(tokenId: string): void {
    // Only select — re-clicking already-selected token does nothing.
    // Deselection happens via background click (onHexClick with no pending).
    this.selectedTokenId.set(tokenId);
  }

  onTokenResourceChange(updates: Partial<Omit<Token, 'id'>>): void {
    const tokenId = this.selectedTokenId();
    if (!tokenId) return;
    this.store.updateToken(tokenId, updates);
    this.cdr.markForCheck();
  }

  /** Called when the lobby character panel patches the character sheet directly (e.g. status effects). */
  onPanelSheetPatched(event: { characterId: string; patch: any }): void {
    const characterIndex = this.worldCharacters().findIndex(c => c.id === event.characterId);
    if (characterIndex < 0) return;
    const characters = [...this.worldCharacters()];
    const sheet = { ...characters[characterIndex].sheet };
    this.applyJsonPatch(sheet, event.patch);
    characters[characterIndex] = { ...characters[characterIndex], sheet };
    this.worldCharacters.set(characters);
    this.cdr.markForCheck();
  }

  onRequestTokenDraw(tokenId: string): void {
    // Handled by the grid component when the user draws at max zoom over the token.
    // Just ensure the pencil tool is active.
    this.currentTool.set('draw');
  }

  onRequestLinkedTokenPlacement(data: { parentId: string; type: LinkedTokenType; name: string }): void {
    this.pendingLinkedToken.set(data);
  }

  onHexClick(hex: HexCoord): void {
    const pending = this.pendingLinkedToken();
    if (pending) {
      const parent = this.currentMap()?.tokens.find(t => t.id === pending.parentId);
      const linkedOffset = parent
        ? { q: hex.q - parent.position.q, r: hex.r - parent.position.r }
        : undefined;
      const linkedDistance = parent
        ? (Math.abs(linkedOffset!.q) + Math.abs(linkedOffset!.r) + Math.abs(linkedOffset!.q + linkedOffset!.r)) / 2
        : undefined;

      // Place a linked token at the clicked hex
      const characterId = 'npc-linked-' + Date.now();
      this.store.addToken({
        characterId,
        name: pending.name,
        position: hex,
        team: 'default',
        isQuickToken: true,
        parentTokenId: pending.parentId,
        linkedTokenType: pending.type,
        linkedOffset: pending.type === 'keepOffset' ? linkedOffset : undefined,
        linkedDistance: pending.type === 'keepDistance' ? linkedDistance : undefined,
      });
      this.pendingLinkedToken.set(null);
      return;
    }
    // No pending action — click on empty hex deselects token
    this.selectedTokenId.set(null);
  }

  onTokenChildDetach(data: { childId: string }): void {
    this.store.updateToken(data.childId, {
      parentTokenId: undefined,
      linkedTokenType: undefined,
      linkedOffset: undefined,
      linkedDistance: undefined,
    });
    this.cdr.markForCheck();
  }

  onNpcStatblockDrop(data: { statblockId: string; name: string; portrait: string; position: HexCoord }): void {
    const characterId = 'npc-' + data.statblockId + '-' + Date.now();
    this.store.addToken({
      characterId,
      name: data.name,
      portrait: data.portrait || undefined,
      position: data.position,
      team: 'red',
      isQuickToken: true,
      statblockId: data.statblockId,
    });
    this.currentTool.set('cursor');
  }

  onLinkedTokenDrop(data: { parentId: string; linkedType: LinkedTokenType; name: string; position: HexCoord }): void {
    const parent = this.currentMap()?.tokens.find(t => t.id === data.parentId);
    const linkedOffset = parent
      ? { q: data.position.q - parent.position.q, r: data.position.r - parent.position.r }
      : undefined;
    const linkedDistance = parent
      ? (Math.abs(linkedOffset!.q) + Math.abs(linkedOffset!.r) + Math.abs(linkedOffset!.q + linkedOffset!.r)) / 2
      : undefined;

    const characterId = 'linked-' + Date.now();
    this.store.addToken({
      characterId,
      name: data.name,
      position: data.position,
      team: 'default',
      isQuickToken: true,
      parentTokenId: data.parentId,
      linkedTokenType: data.linkedType,
      linkedOffset: data.linkedType === 'keepOffset' ? linkedOffset : undefined,
      linkedDistance: data.linkedType === 'keepDistance' ? linkedDistance : undefined,
    });
  }

  // ============================================
  // Image Handlers
  // ============================================

  async onLoadImages(files: FileList): Promise<void> {
    if (!this.isGM()) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const prepared = await prepareImageForUpload(file);
        if (prepared.size < file.size) {
          console.log(
            `[Lobby] Compressed ${file.name}: ${formatBytes(file.size)} → ${formatBytes(prepared.size)}`,
          );
        }
        const name = file.name.replace(/\.[^/.]+$/, '');
        await this.store.addLibraryImage(prepared, name);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('[Lobby] Failed to upload image:', error);
      }
    }
  }

  onRenameLibraryImage(data: { id: string; name: string }): void {
    this.store.updateLibraryImage(data.id, data.name);
  }

  onDeleteLibraryImage(id: string): void {
    this.store.removeLibraryImage(id);
  }

 onPlaceImage(data: { imageId: string; x: number; y: number; width: number; height: number }): void {
    const newImageId = this.store.addImage(data.imageId, data.x, data.y, data.width, data.height);
    // Auto-select the newly placed image so user can immediately transform it
    this.selectedImageId.set(newImageId);
    // Switch to image tool after placing
    this.currentTool.set('image');
  }

  onSelectImage(id: string | null): void {
    this.selectedImageId.set(id);
  }

  onTransformImage(data: { id: string; transform: Partial<{ x: number; y: number; width: number; height: number; rotation: number }> }): void {
    this.store.updateImage(data.id, data.transform);
  }

  onDeleteImage(id: string): void {
    this.store.removeImage(id);
    if (this.selectedImageId() === id) {
      this.selectedImageId.set(null);
    }
  }

  // ============================================
  // Texture Handlers
  // ============================================

  async onLoadTextures(files: FileList): Promise<void> {
    if (!this.isGM()) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          try {
            const name = file.name.replace(/\.[^/.]+$/, '');
            await this.store.addLibraryTexture(dataUrl, name);
            this.cdr.markForCheck();
          } catch (error) {
            console.error('[Lobby] Failed to upload texture:', error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onSelectTexture(textureId: string | null): void {
    this.selectedTextureId.set(textureId);
    // Auto-switch to texture tool when selecting a texture
    if (textureId) {
      this.currentTool.set('texture');
    }
  }

  onImageDragStart(image: LibraryImage): void {
    // Auto-switch to image tool when dragging from library
    this.currentTool.set('image');
  }

  // ============================================
  // Layer Visibility
  // ============================================

  onDrawLayerVisibleChange(visible: boolean): void {
    const map = this.currentMap();
    if (!map?.layers) return;
    for (const layer of map.layers.filter(l => l.type === 'draw')) {
      if (layer.visible !== visible) {
        this.store.toggleLayerVisibility(layer.id);
      }
    }
    this.cdr.markForCheck();
  }

  allDrawLayersVisible = computed(() => {
    const drawLayers = (this.currentMap()?.layers || []).filter(l => l.type === 'draw');
    if (drawLayers.length === 0) return true;
    return drawLayers.every(l => l.visible);
  });

  onImageLayerVisibleChange(visible: boolean): void {
    this.imageLayerVisible.set(visible);
  }

  // ============================================
  // UI
  // ============================================

  toggleSidebar(): void {
    this.showSidebar.set(!this.showSidebar());
  }

  showMapSettings(): void {
    console.log('[Lobby] Opening map settings...');
    this.showMapSettingsModal.set(true);
  }

  async cleanupImages(): Promise<void> {
    console.log('[Lobby] Starting image cleanup...');
    await this.store.cleanupOrphanedImages();
  }

  onToolAutoSelect(tool: string): void {
    // Switch to any tool - used to auto-switch back to cursor after placing image
    this.currentTool.set(tool as ToolType);
  }

  // ============================================
  // Map Management
  // ============================================

  onCreateMap(): void {
    if (!this.newMapName.trim()) {
      console.warn('[Lobby] Map name cannot be empty');
      return;
    }
    
    const mapId = `map-${Date.now()}`;
    this.store.createMap(mapId, this.newMapName.trim());
    this.newMapName = '';
    this.cdr.markForCheck();
  }

  onSwitchMap(mapId: string): void {
    this.store.setActiveMap(mapId);
    this.currentMapId.set(mapId);
    this.cdr.markForCheck();
  }

  onBroadcastMapToAll(mapId: string): void {
    // Switch locally and broadcast to all connected viewers
    this.store.switchMainViewForAll(mapId);
    this.currentMapId.set(mapId);
    this.cdr.markForCheck();
  }

  onDeleteMap(mapId: string): void {
    if (this.mapList().length <= 1) {
      console.warn('[Lobby] Cannot delete the last map');
      return;
    }
    
    if (!confirm('Delete this map? This cannot be undone.')) {
      return;
    }
    
    // If deleting current map, switch to another one first
    if (this.currentMapId() === mapId) {
      const otherMap = this.mapList().find(m => m.id !== mapId);
      if (otherMap) {
        this.onSwitchMap(otherMap.id);
      }
    }
    
    this.store.deleteMap(mapId);
    this.cdr.markForCheck();
  }

  onMapBackgroundChange(mapId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.store.updateMapBackground(mapId, color);
    this.cdr.markForCheck();
  }

  onRenameMap(mapId: string, event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    if (newName) {
      this.store.renameMap(mapId, newName);
      this.cdr.markForCheck();
    }
  }

  getMapBackground(mapId: string): string {
    const lobby = this.lobby();
    return lobby?.maps[mapId]?.backgroundColor || '#e5e7eb';
  }

  // ============================================
  // Layer Management
  // ============================================

  layers = computed(() => {
    const map = this.currentMap();
    if (!map) {
      console.log('[Lobby] Computed layers: no map');
      return [];
    }
    const layers = map.layers || [];
    console.log('[Lobby] Computed layers:', layers.length, 'layers:', layers.map(l => l.name));
    return layers;
  });
  
  activeLayerId = computed(() => {
    const map = this.currentMap();
    return map?.activeLayerId || null;
  });

  onLayerSelect(layerId: string): void {
    this.store.setActiveLayer(layerId);
    this.cdr.markForCheck();
  }

  onLayerToggleVisible(layerId: string): void {
    this.store.toggleLayerVisibility(layerId);
    this.cdr.markForCheck();
  }

  onLayerToggleLock(layerId: string): void {
    this.store.toggleLayerLock(layerId);
    this.cdr.markForCheck();
  }

  onLayerDelete(layerId: string): void {
    this.store.deleteLayer(layerId);
    this.cdr.markForCheck();
  }

  onLayerRename(event: { id: string; name: string }): void {
    this.store.renameLayer(event.id, event.name);
    this.cdr.markForCheck();
  }

  onLayerReorder(layers: any[]): void {
    this.store.reorderLayers(layers);
    this.cdr.markForCheck();
  }

  onLayerAdd(type: 'image' | 'texture' | 'draw'): void {
    this.store.addLayer(type);
    this.cdr.markForCheck();
  }

  // JSON Patch helper
  private applyJsonPatch(target: any, patch: any) {
    // Normalize path: remove leading slash, replace slashes with dots
    let normalizedPath = patch.path.trim();
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.substring(1);
    }
    normalizedPath = normalizedPath.replace(/\//g, '.');
    
    const keys = normalizedPath.split('.');
    let current = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);

      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = current[key] ??= {};
      }
    }

    const finalKey = keys[keys.length - 1];
    
    // Handle array append operation: '-' means append to array
    if (finalKey === '-' && Array.isArray(current)) {
      current.push(patch.value);
      return;
    }
    
    const finalIndex = parseInt(finalKey, 10);

    if (!isNaN(finalIndex) && Array.isArray(current)) {
      current[finalIndex] = patch.value;
    } else {
      current[finalKey] = patch.value;
    }
  }
}

