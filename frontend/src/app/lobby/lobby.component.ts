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
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { LobbyStoreService } from '../services/lobby-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { CharacterApiService } from '../services/character-api.service';
import { ImageService } from '../services/image.service';
import { CharacterSheet } from '../model/character-sheet-model';
import { LobbyData, LobbyMap, Token, HexCoord, LibraryImage } from '../model/lobby.model';

import { LobbyGridComponent } from './lobby-grid/lobby-grid.component';
import { LobbyToolbarComponent } from './lobby-toolbar/lobby-toolbar.component';
import { LobbySidebarComponent } from './lobby-sidebar/lobby-sidebar.component';

// Tool types
export type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure' | 'image';
export type DragMode = 'free' | 'snap';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    CommonModule,
    LobbyGridComponent,
    LobbyToolbarComponent,
    LobbySidebarComponent,
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
  drawWithWalls = signal(false);
  dragMode = signal<DragMode>('free');

  // Layer visibility
  drawLayerVisible = signal(true);
  imageLayerVisible = signal(true);

  // Selection state
  selectedImageId = signal<string | null>(null);

  // UI state
  showSidebar = signal(true);
  sidebarTab = signal<'characters' | 'images'>('characters');
  showMapSettingsModal = signal(false);

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
    const portraitMap = new Map<string, string>();
    chars.forEach(c => {
      if (c.sheet.portrait) {
        portraitMap.set(c.id, c.sheet.portrait);
      }
    });

    return map.tokens.map(token => ({
      ...token,
      portrait: token.isQuickToken ? token.portrait : (portraitMap.get(token.characterId) || token.portrait)
    }));
  });

  // Computed: image library
  imageLibrary = computed(() => this.lobby()?.imageLibrary || []);

  // Computed: map list for management
  mapList = computed(() => {
    const l = this.lobby();
    if (!l) return [];
    return Object.entries(l.maps).map(([id, map]) => ({ id, name: map.name }));
  });

  ngOnInit(): void {
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
    const world = this.worldStore.worldValue;
    if (!world) {
      console.warn('[Lobby] No world loaded');
      return;
    }

    console.log('[Lobby] World data:', { 
      name: world.name, 
      characterIds: world.characterIds,
      hasCharacters: !!world.characterIds?.length 
    });
    
    const characters: { id: string; sheet: CharacterSheet }[] = [];

    for (const charId of world.characterIds || []) {
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

    console.log('[Lobby] Loaded characters:', characters.length, characters.map(c => c.sheet.name));
    this.worldCharacters.set(characters);
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
        this.currentTool.set(this.currentTool() === 'erase' ? 'draw' : 'erase');
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
      case 'i':
        this.currentTool.set('image');
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
    this.store.addImage(data.imageId, data.x, data.y, data.width, data.height);
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
  // Map Management
  // ============================================

  async onCreateMap(name: string): Promise<void> {
    await this.store.createMap(name);
  }

  async onDeleteMap(mapId: string): Promise<void> {
    await this.store.deleteMap(mapId);
  }

  async onSwitchMap(mapId: string): Promise<void> {
    await this.store.switchMap(mapId);
    this.currentMapId.set(mapId);
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
}
