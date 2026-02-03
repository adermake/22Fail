import { Component, OnInit, OnDestroy, HostListener, inject, signal, computed, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { BattleMapStoreService } from '../services/battlemap-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { BattlemapData, BattlemapToken, HexCoord, HexMath, LobbyData, MapData, MapImage, createEmptyMap } from '../model/battlemap.model';
import { CharacterSheet } from '../model/character-sheet-model';
import { CharacterApiService } from '../services/character-api.service';

import { BattlemapGridComponent } from './battlemap-grid/battlemap-grid.component';
import { BattlemapToolbarComponent } from './battlemap-toolbar/battlemap-toolbar.component';
import { BattlemapCharacterListComponent } from './battlemap-character-list/battlemap-character-list.component';
import { BattlemapBattleTrackerComponent } from './battlemap-battle-tracker/battlemap-battle-tracker.component';


export type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure';
export type DragMode = 'free' | 'enforced';

@Component({
  selector: 'app-battlemap',
  standalone: true,
  imports: [
    CommonModule,
    BattlemapGridComponent,
    BattlemapToolbarComponent,
    BattlemapCharacterListComponent,
    BattlemapBattleTrackerComponent,
  ],
  templateUrl: './battlemap.component.html',
  styleUrl: './battlemap.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlemapComponent implements OnInit, OnDestroy {
  @ViewChild(BattlemapGridComponent) gridComponent!: BattlemapGridComponent;

  private route = inject(ActivatedRoute);
  private store = inject(BattleMapStoreService);
  private worldStore = inject(WorldStoreService);
  private characterApi = inject(CharacterApiService);
  
  private subscriptions: Subscription[] = [];

  // Route params
  worldName = signal<string>('');
  isGM = signal<boolean>(false);

  // Lobby & Map data
  lobby = signal<LobbyData | null>(null);
  currentMapId = signal<string>('default');
  battleMap = signal<BattlemapData | null>(null);
  
  // Map management UI
  showMapManager = signal<boolean>(false);
  mapSearchQuery = signal<string>('');

  // World data signal for reactive updates
  world = signal<any>(null);

  // World characters for the character list
  worldCharacters = signal<{ id: string; sheet: CharacterSheet }[]>([]);

  // Current tool state
  currentTool = signal<ToolType>('cursor');
  brushColor = signal<string>('#000000');
  penBrushSize = signal<number>(4);
  eraserBrushSize = signal<number>(12);
  drawWithWalls = signal<boolean>(false);
  dragMode = signal<DragMode>('free');

  // Layer visibility
  drawLayerVisible = signal<boolean>(true);
  imageLayerVisible = signal<boolean>(true);
  
  // Image layer management
  selectedImageId = signal<string | null>(null);
  isTransformMode = signal<boolean>(false);

  // Computed: current turn character from world battle tracker
  currentTurnCharacterId = computed(() => {
    const world = this.world();
    if (!world || !world.battleParticipants || world.battleParticipants.length === 0) {
      return null;
    }
    const currentIndex = world.currentTurnIndex || 0;
    if (currentIndex >= world.battleParticipants.length) return null;
    return world.battleParticipants[currentIndex]?.characterId || null;
  });

  // Computed: battle participants from world
  battleParticipants = computed(() => {
    const world = this.world();
    return world?.battleParticipants || [];
  });

  // Computed: battlemap with portraits enriched from worldCharacters
  enrichedBattleMap = computed(() => {
    const map = this.battleMap();
    if (!map) return null;

    const chars = this.worldCharacters();
    const portraitMap = new Map<string, string>();
    chars.forEach(c => {
      if (c.sheet.portrait) {
        portraitMap.set(c.id, c.sheet.portrait);
      }
    });

    // Enrich tokens with portraits from character sheets
    const enrichedTokens = map.tokens.map(token => ({
      ...token,
      portrait: token.isOnTheFly ? token.portrait : (portraitMap.get(token.characterId) || token.portrait)
    }));

    return {
      ...map,
      tokens: enrichedTokens
    };
  });

  // Panel visibility
  showCharacterList = signal(true);
  showBattleTracker = signal(true);

  ngOnInit() {
    // Subscribe to route params and query params
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        const worldName = params.get('worldName') || 'default';
        this.worldName.set(worldName);

        // Check query params for GM mode
        this.route.queryParamMap.subscribe((queryParams) => {
          this.isGM.set(queryParams.get('gm') === 'true');
        });

        // Load lobby for this world
        await this.loadLobby(worldName);
        
        // Also load world data for characters and battle tracker
        await this.worldStore.load(worldName);
        
        // Load characters from the world
        await this.loadWorldCharacters();
      })
    );

    // Subscribe to battlemap changes from store
    this.subscriptions.push(
      this.store.battleMap$.subscribe((map) => {
        this.battleMap.set(map);
      })
    );

    // Subscribe to lobby changes from store
    this.subscriptions.push(
      this.store.lobby$.subscribe((lobby) => {
        this.lobby.set(lobby);
        // Update current map ID when lobby changes
        if (lobby && lobby.activeMapId) {
          this.currentMapId.set(lobby.activeMapId);
        }
      })
    );

    // Subscribe to world changes (for battle tracker and team colors)
    this.subscriptions.push(
      this.worldStore.world$.subscribe((world) => {
        // Update world signal for reactive computed properties
        this.world.set(world);
      })
    );
  }

  private async loadLobby(worldName: string) {
    // Load or create lobby through the store
    await this.store.loadLobby(worldName);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // Keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'e':
        // Toggle between draw and erase
        if (this.currentTool() === 'draw') {
          this.currentTool.set('erase');
        } else if (this.currentTool() === 'erase') {
          this.currentTool.set('draw');
        } else {
          this.currentTool.set('erase');
        }
        event.preventDefault();
        break;

      case 'b':
        this.currentTool.set('draw');
        event.preventDefault();
        break;

      case 'f':
        this.currentTool.set('cursor');
        event.preventDefault();
        break;

      case 'r':
        this.currentTool.set('measure');
        event.preventDefault();
        break;

      case 'w':
        this.currentTool.set('walls');
        event.preventDefault();
        break;

      case 'control':
        // Toggle drag mode when in cursor/move tool
        if (this.currentTool() === 'cursor') {
          this.dragMode.set(this.dragMode() === 'free' ? 'enforced' : 'free');
          event.preventDefault();
        }
        break;
    }
  }

  private async loadWorldCharacters() {
    const world = this.worldStore.worldValue;
    if (!world) return;

    const characters: { id: string; sheet: CharacterSheet }[] = [];
    
    for (const charId of world.characterIds || []) {
      try {
        const sheet = await this.characterApi.loadCharacter(charId);
        if (sheet) {
          characters.push({ id: charId, sheet });
        }
      } catch (e) {
        console.error(`Failed to load character ${charId}:`, e);
      }
    }

    this.worldCharacters.set(characters);
  }

  // Tool handlers
  onToolChange(tool: ToolType) {
    this.currentTool.set(tool);
  }

  onBrushColorChange(color: string) {
    this.brushColor.set(color);
  }

  onPenBrushSizeChange(size: number) {
    this.penBrushSize.set(size);
  }

  onEraserBrushSizeChange(size: number) {
    this.eraserBrushSize.set(size);
  }

  onBrushSizeChange(size: number) {
    // Update appropriate brush size based on current tool
    const tool = this.currentTool();
    if (tool === 'erase') {
      this.eraserBrushSize.set(size);
    } else {
      this.penBrushSize.set(size);
    }
  }

  onDrawWithWallsChange(enabled: boolean) {
    this.drawWithWalls.set(enabled);
  }

  onClearWalls() {
    this.store.clearWalls();
  }

  onDragModeChange(mode: DragMode) {
    this.dragMode.set(mode);
  }

  // Token handlers - now allows multiple tokens of the same character
  onTokenDrop(data: { characterId: string; position: HexCoord }) {
    console.log('[BATTLEMAP] Token drop event received:', data);
    const character = this.worldCharacters().find(c => c.id === data.characterId);
    if (!character) {
      console.log('[BATTLEMAP] Character not found:', data.characterId);
      return;
    }

    // Always create a new token (library behavior - can have multiples)
    console.log('[BATTLEMAP] Adding new token at', data.position);
    
    // Get character's movement speed from their speed stat
    const speedStat = character.sheet.speed;
    const movementSpeed = speedStat ? (speedStat.base + (speedStat.bonus || 0)) : 6;
    
    this.store.addToken({
      characterId: data.characterId,
      characterName: character.sheet.name || data.characterId,
      // NOTE: Do NOT include portrait here - it crashes websockets with large images
      // Portrait is retrieved at runtime from character sheets
      position: data.position,
      team: 'blue',
      isOnTheFly: false,
      movementSpeed: movementSpeed,
    });
  }

  // Handler for on-the-fly tokens
  onQuickTokenDrop(data: { name: string; portrait: string; position: HexCoord }) {
    console.log('[BATTLEMAP] Quick token drop:', data);
    this.store.addToken({
      characterId: 'quick-' + Date.now(),
      characterName: data.name,
      // NOTE: Quick tokens use portrait path from server, not base64
      // The portrait string here is already a path like '/uploads/xxx.png'
      portrait: data.portrait,
      position: data.position,
      team: 'red',
      isOnTheFly: true,
    });
  }

  onTokenMove(data: { tokenId: string; position: HexCoord }) {
    this.store.moveToken(data.tokenId, data.position);
  }

  onTokenRemove(tokenId: string) {
    this.store.removeToken(tokenId);
  }

  // Panel toggles
  toggleCharacterList() {
    this.showCharacterList.set(!this.showCharacterList());
  }

  toggleBattleTracker() {
    this.showBattleTracker.set(!this.showBattleTracker());
  }

  // Layer visibility toggles
  onDrawLayerVisibleChange(visible: boolean) {
    this.drawLayerVisible.set(visible);
  }

  onImageLayerVisibleChange(visible: boolean) {
    this.imageLayerVisible.set(visible);
  }

  // Map Management Methods (GM only)
  onShowMapManager() {
    if (!this.isGM()) return;
    this.showMapManager.set(true);
  }

  onHideMapManager() {
    this.showMapManager.set(false);
    this.mapSearchQuery.set('');
  }

  onMapSearchChange(query: string) {
    this.mapSearchQuery.set(query);
  }

  async onCreateMap(name: string) {
    if (!this.isGM()) return;
    const worldName = this.worldName();
    if (!worldName) return;
    
    await this.store.createMap(name);
  }

  async onDeleteMap(mapId: string) {
    if (!this.isGM()) return;
    const lobby = this.lobby();
    if (!lobby) return;

    // Don't delete if it's the only map or the currently active map
    const mapCount = Object.keys(lobby.maps).length;
    if (mapCount <= 1 || mapId === lobby.activeMapId) {
      console.warn('Cannot delete the only map or currently active map');
      return;
    }

    await this.store.deleteMap(mapId);
  }

  async onSwitchMap(mapId: string) {
    const lobby = this.lobby();
    if (!lobby || !lobby.maps[mapId]) return;

    await this.store.switchMap(mapId);
    this.currentMapId.set(mapId);
  }

  // Get filtered maps for the map manager
  getFilteredMaps(): { id: string; name: string; data: MapData }[] {
    const lobby = this.lobby();
    const query = this.mapSearchQuery().toLowerCase();
    
    if (!lobby) return [];

    return Object.entries(lobby.maps)
      .map(([id, data]) => ({ id, name: data.name, data }))
      .filter(({ name }) => name.toLowerCase().includes(query));
  }

  // Image Layer Methods
  async onAddImage(src: string) {
    if (!this.isGM()) return;
    
    const newImage: Omit<MapImage, 'id'> = {
      src,
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      rotation: 0,
      zIndex: 0,
    };

    await this.store.addImage(newImage);
  }

  async onSelectImage(id: string | null) {
    this.selectedImageId.set(id);
    this.isTransformMode.set(id !== null);
  }

  async onTransformImage(id: string, transform: { x?: number; y?: number; width?: number; height?: number; rotation?: number }) {
    if (!this.isGM()) return;
    await this.store.updateImage(id, transform);
  }

  async onDeleteImage(id: string) {
    if (!this.isGM()) return;
    await this.store.removeImage(id);
    if (this.selectedImageId() === id) {
      this.selectedImageId.set(null);
      this.isTransformMode.set(false);
    }
  }

  // Handle paste events for images
  @HostListener('window:paste', ['$event'])
  async handlePaste(event: ClipboardEvent) {
    if (!this.isGM()) return;

    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        const blob = item.getAsFile();
        if (!blob) continue;

        // Convert blob to base64 data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            await this.onAddImage(dataUrl);
          }
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  }
}
