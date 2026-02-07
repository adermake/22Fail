/**
 * Lobby Component
 * 
 * Main coordinator for the virtual tabletop.
 * Links to /world/:worldName for character data.
 * 
 * URL: /lobby/:worldName
 */

import { Component, OnInit, OnDestroy, HostListener, inject, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { LobbyStoreService } from '../services/lobby-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { CharacterApiService } from '../services/character-api.service';
import { ImageService } from '../services/image.service';
import { TextureService } from '../services/texture.service';
import { CharacterSheet } from '../model/character-sheet-model';
import { LobbyData, LobbyMap, Token, HexCoord, LibraryImage, LibraryTexture } from '../model/lobby.model';

import { LobbyGridComponent } from './lobby-grid/lobby-grid.component';
import { LobbyToolbarComponent } from './lobby-toolbar/lobby-toolbar.component';
import { LobbySidebarComponent } from './lobby-sidebar/lobby-sidebar.component';
import { BattleTracker } from '../world/battle-tracker/battle-tracker.component';
import { BattleTrackerEngine } from '../world/battle-tracker/battle-tracker-engine';

// Tool types
export type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure' | 'image' | 'texture';
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
  private characterApi = inject(CharacterApiService);
  private imageService = inject(ImageService);
  private textureService = inject(TextureService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions: Subscription[] = [];

  // Route state
  worldName = signal('');
  isGM = signal(false);

  // Lobby state
  lobby = signal<LobbyData | null>(null);
  currentMapId = signal('default');

  // World state
  worldCharacters = signal<{ id: string; sheet: CharacterSheet }[]>([]);

  // Tool state
  currentTool = signal<ToolType>('cursor');
  brushColor = signal('#000000');
  penBrushSize = signal(4);
  eraserBrushSize = signal(12);
  textureBrushSize = signal(30);
  textureScale = signal(0.1); // Default 10x smaller tiles
  textureBrushType = signal<'hard' | 'soft'>('hard');
  textureColorBlend = signal(0); // 0-100%
  textureBlendColor = signal('#ffffff');
  textureHue = signal(0); // -180 to 180 degrees
  isEraserMode = signal(false); // E key toggles this
  drawWithWalls = signal(false);
  dragMode = signal<DragMode>('free');

  // Layer visibility
  drawLayerVisible = signal(true);
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
    const portraitMap = new Map<string, string>();
    chars.forEach(c => {
      if (c.sheet.portrait) {
        portraitMap.set(c.id, c.sheet.portrait);
      }
    });

    return map.tokens.map(token => ({
      ...token,
      portrait: token.isQuickToken ? token.portrait : (portraitMap.get(token.characterId) || token.portrait),
      team: teams.get(token.characterId) || token.team || 'blue',
    }));
  });

  // Computed: image library
  imageLibrary = computed(() => this.lobby()?.imageLibrary || []);
  textureLibrary = computed(() => this.lobby()?.textureLibrary || []);

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

  ngOnInit(): void {
    // Connect battle engine to world store for persistence (mirrors world view)
    this.battleEngine.setWorldStore(this.worldStore);
    
    // Subscribe to world changes to keep battle tracker in sync
    this.subscriptions.push(
      this.worldStore.world$.subscribe((world) => {
        if (world) {
          // Sync battle tracker when world changes (e.g., participants updated from other client)
          this.battleEngine.syncFromWorldStore();

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

        // Load world for characters
        await this.worldStore.load(worldName);
        console.log('[Lobby] World loaded, characterIds:', this.worldStore.worldValue?.characterIds);
        await this.loadWorldCharacters();
        
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
    // Load ALL characters from the system, not just world.characterIds
    // This allows players to access any character they need
    console.log('[Lobby] Loading all characters from system');
    
    const characters: { id: string; sheet: CharacterSheet }[] = [];

    try {
      const allCharacterIds = await this.characterApi.getAllCharacterIds();
      console.log('[Lobby] Found total characters:', allCharacterIds.length);
      
      for (const charId of allCharacterIds) {
        try {
          console.log('[Lobby] Loading character:', charId);
          const sheet = await this.characterApi.loadCharacter(charId);
          if (sheet) {
            console.log('[Lobby] Character loaded:', charId, sheet.name);
            characters.push({ id: charId, sheet });
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
    
    // Update battle engine with character data for portraits
    this.battleEngine.setAvailableCharacters(characters.map(c => ({
      id: c.id,
      name: c.sheet.name,
      portrait: c.sheet.portrait,
      speed: 10 // Default, will be overridden by battle participants data
    })));
    
    // Force change detection after character library loads
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
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
        // Toggle eraser mode in current tool context
        this.isEraserMode.set(!this.isEraserMode());
        event.preventDefault();
        break;
      case 'b':
        this.currentTool.set('draw');
        this.isEraserMode.set(false); // Reset eraser when switching tools
        event.preventDefault();
        break;
      case 't':
        this.currentTool.set('texture');
        this.isEraserMode.set(false); // Reset eraser when switching tools
        // Auto-switch to textures tab
        this.sidebarTab.set('textures' as any);
        event.preventDefault();
        break;
      case 'f':
        this.currentTool.set('cursor');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'r':
        this.currentTool.set('measure');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'w':
        this.currentTool.set('walls');
        this.isEraserMode.set(false);
        event.preventDefault();
        break;
      case 'i':
        this.currentTool.set('image');
        this.isEraserMode.set(false);
        // Auto-switch to textures tab for image tool
        this.sidebarTab.set('textures' as any);
        event.preventDefault();
        break;
      case 'z':
        if (event.ctrlKey) {
          this.store.undoStroke();
          event.preventDefault();
        }
        break;
    }
  }

  // ============================================
  // Tool Handlers
  // ============================================

  onToolChange(tool: ToolType): void {
    this.currentTool.set(tool);
    this.isEraserMode.set(false); // Reset eraser when tool changes
    
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

  onTextureBrushSizeChange(size: number): void {
    this.textureBrushSize.set(size);
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

    const speedStat = character.sheet.speed;
    const movementSpeed = speedStat ? (speedStat.base + (speedStat.bonus || 0)) : 6;

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

  // ============================================
  // Image Handlers
  // ============================================

  async onLoadImages(files: FileList): Promise<void> {
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
            await this.store.addLibraryImage(dataUrl, name);
            this.cdr.markForCheck();
          } catch (error) {
            console.error('[Lobby] Failed to upload image:', error);
          }
        }
      };
      reader.readAsDataURL(file);
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
    this.drawLayerVisible.set(visible);
  }

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

  getMapBackground(mapId: string): string {
    const lobby = this.lobby();
    return lobby?.maps[mapId]?.backgroundColor || '#e5e7eb';
  }
}
