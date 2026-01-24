import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { BattleMapStoreService } from '../services/battlemap-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { ComfyUIService } from '../services/comfyui.service';
import { BattlemapData, BattlemapToken, HexCoord, HexMath, AiColorPrompt, getDefaultAiColorPrompts } from '../model/battlemap.model';
import { CharacterSheet } from '../model/character-sheet-model';
import { CharacterApiService } from '../services/character-api.service';

import { BattlemapGridComponent } from './battlemap-grid/battlemap-grid.component';
import { BattlemapToolbarComponent } from './battlemap-toolbar/battlemap-toolbar.component';
import { BattlemapCharacterListComponent } from './battlemap-character-list/battlemap-character-list.component';
import { BattlemapBattleTrackerComponent } from './battlemap-battle-tracker/battlemap-battle-tracker.component';


export type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure' | 'ai-draw';
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
})
export class BattlemapComponent implements OnInit, OnDestroy {
  @ViewChild(BattlemapGridComponent) gridComponent!: BattlemapGridComponent;

  private route = inject(ActivatedRoute);
  private store = inject(BattleMapStoreService);
  private worldStore = inject(WorldStoreService);
  private characterApi = inject(CharacterApiService);
  comfyUI = inject(ComfyUIService);
  
  private subscriptions: Subscription[] = [];

  // Route params
  worldName = signal<string>('');
  battleMapId = signal<string>('');

  // Battlemap data
  battleMap = signal<BattlemapData | null>(null);

  // World data signal for reactive updates
  world = signal<any>(null);

  // World characters for the character list
  worldCharacters = signal<{ id: string; sheet: CharacterSheet }[]>([]);

  // Current tool state
  currentTool = signal<ToolType>('cursor');
  brushColor = signal<string>('#ef4444');
  penBrushSize = signal<number>(4);
  eraserBrushSize = signal<number>(12);
  drawWithWalls = signal<boolean>(false);
  dragMode = signal<DragMode>('free');

  // AI drawing tool state
  selectedAiColor = signal<string>('#22c55e'); // Default to forest green

  // Layer visibility
  drawLayerVisible = signal<boolean>(true);
  aiLayerVisible = signal<boolean>(true);

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

  // Panel visibility
  showCharacterList = signal(true);
  showBattleTracker = signal(true);

  ngOnInit() {
    // Subscribe to route params
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        const worldName = params.get('worldName') || 'default';
        const mapId = params.get('mapId') || 'default';
        
        this.worldName.set(worldName);
        this.battleMapId.set(mapId);

        // Load the battlemap
        await this.store.load(worldName, mapId);
        
        // Also load world data for characters and battle tracker
        await this.worldStore.load(worldName);
        
        // Load characters from the world
        await this.loadWorldCharacters();
      })
    );

    // Subscribe to battlemap changes
    this.subscriptions.push(
      this.store.battleMap$.subscribe((map) => {
        this.battleMap.set(map);
        // Load AI prompt into ComfyUI service when battlemap changes
        if (map?.aiPrompt) {
          this.comfyUI.setCustomPrompt(map.aiPrompt);
        }
        // Load AI settings into ComfyUI service when battlemap changes
        if (map?.aiSettings) {
          this.comfyUI.setSettings(map.aiSettings);
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

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
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
    } else if (tool === 'draw' || tool === 'ai-draw') {
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
      portrait: character.sheet.portrait,
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

  // AI Prompt change
  onAiPromptChange(prompt: string) {
    this.store.setAiPrompt(prompt);
    // Update ComfyUI service with new prompt
    this.comfyUI.setCustomPrompt(prompt);
  }

  // AI Settings change
  onAiSettingsChange(settings: { seed?: number; steps?: number; cfg?: number; denoise?: number }) {
    this.store.setAiSettings(settings);
    this.comfyUI.setSettings(settings);
  }

  // Layer visibility toggles
  onDrawLayerVisibleChange(visible: boolean) {
    this.drawLayerVisible.set(visible);
  }

  onAiLayerVisibleChange(visible: boolean) {
    this.aiLayerVisible.set(visible);
  }

  // AI Color Prompt handlers
  onSelectedAiColorChange(color: string) {
    this.selectedAiColor.set(color);
  }

  onAiColorPromptUpdate(event: { id: string; updates: Partial<AiColorPrompt> }) {
    this.store.updateAiColorPrompt(event.id, event.updates);
  }

  onClearAiStrokes() {
    this.store.clearAiStrokes();
  }

  // Trigger AI generation from AI strokes with regional prompting
  onGenerateFromAiStrokes() {
    if (this.gridComponent) {
      this.gridComponent.generateFromAiStrokes();
    }
  }

  // Computed: get AI color prompts from battlemap
  getAiColorPrompts(): AiColorPrompt[] {
    return this.battleMap()?.aiColorPrompts || getDefaultAiColorPrompts();
  }

  // Computed: get AI prompt from battlemap
  getAiPrompt(): string {
    return this.battleMap()?.aiPrompt || '';
  }

  // Computed: get AI settings from battlemap
  getAiSettings(): { seed: number; steps: number; cfg: number; denoise: number } {
    // ControlNet defaults: denoise = ControlNet strength (how closely to follow sketch)
    const defaults = { seed: -1, steps: 25, cfg: 3.5, denoise: 0.7 };
    const settings = this.battleMap()?.aiSettings;
    if (!settings) return defaults;
    return {
      seed: settings.seed ?? defaults.seed,
      steps: settings.steps ?? defaults.steps,
      cfg: settings.cfg ?? defaults.cfg,
      denoise: settings.denoise ?? defaults.denoise,
    };
  }
}
