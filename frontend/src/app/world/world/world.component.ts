import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldStoreService } from '../../services/world-store.service';
import { WorldSocketService } from '../../services/world-socket.service';
import { CharacterApiService } from '../../services/character-api.service';
import { CharacterSocketService, CharacterPatchEvent } from '../../services/character-socket.service';
import { BattleService, SimulatedTurn, BattleGroup } from '../../services/battle.service';
import { LibraryService } from '../../services/library.service';
import { LibraryStoreService } from '../../services/library-store.service';
import { Library } from '../../model/library.model';
import { TrashService } from '../../services/trash.service';
import { NotificationService } from '../../services/notification.service';
import { ItemBlock } from '../../model/item-block.model';
import { MaterialBlock, ForgeTrait } from '../../model/forging.model';
import { CharacterSheet, createEmptySheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { FormulaType } from '../../model/formula-type.enum';
import { StatusBlock } from '../../model/status-block.model';
import { StatusEffect, ActiveStatusEffect } from '../../model/status-effect.model';
import { CurrentEvent, ShopEvent, getCoinParts, CoinPart } from '../../model/current-events.model';
import { Subscription } from 'rxjs';
import { ItemEditorComponent } from '../../sheet/item-editor/item-editor.component';
import { SkillEditorComponent } from '../../shared/skill-editor/skill-editor.component';
import { SpellEditorOverlayComponent } from '../../sheet/spell-editor-overlay/spell-editor-overlay.component';
import { SpellBlock } from '../../model/spell-block-model';
import { RuneEditorComponent } from '../../shared/rune-editor/rune-editor.component';
import { LibrarySelectorComponent } from '../../shared/library-selector/library-selector.component';
import { ContextMenuComponent, ContextMenuItem } from '../../shared/context-menu/context-menu.component';
import { BattleTracker } from '../battle-tracker/battle-tracker.component';
import { CurrentEventsManagerComponent } from '../current-events-manager/current-events-manager.component';
import { BattleTrackerEngine } from '../battle-tracker/battle-tracker-engine';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { CharacterGeneratorComponent } from '../character-generator/character-generator.component';
import { SoundVolumeControlComponent } from '../../shared/sound/sound-volume-control.component';
import { TrueStatsService } from '../../services/true-stats.service';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { GrantService } from '../../services/grant.service';
import {
  assetEntryId,
  createDeskEntry,
  DeskEntry,
  DeskTab,
  GrantType,
  GRANT_TYPE_LABEL,
  KnowledgeKind,
  KNOWLEDGE_KIND_LABEL,
} from '../../model/gm-desk.model';
import { GmDeskComponent, BrowseEntry } from '../gm-desk/gm-desk.component';
import { WorldLobbyBridgeService } from '../../services/world-lobby-bridge.service';
import { PartyStashService } from '../../services/party-stash.service';
import { knowledgeTierOf, KnowledgeGraded } from '../../utils/knowledge-tier.util';
import { AssetFile } from '../../model/asset-browser.model';
import { firstValueFrom } from 'rxjs';

// Re-export types for template usage
export type { SimulatedTurn, BattleGroup };

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule, ItemEditorComponent, SkillEditorComponent, SpellEditorOverlayComponent, RuneEditorComponent, GmDeskComponent, LibrarySelectorComponent, ContextMenuComponent, BattleTracker, CurrentEventsManagerComponent, ImageUrlPipe, CharacterGeneratorComponent, SoundVolumeControlComponent],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldComponent implements OnInit, OnDestroy {
  worldName: string = '';

  @ViewChild(ContextMenuComponent) contextMenu?: ContextMenuComponent;
  @ViewChild(LibrarySelectorComponent) librarySelector?: LibrarySelectorComponent;

  // Services
  store = inject(WorldStoreService);
  worldSocket = inject(WorldSocketService);
  characterApi = inject(CharacterApiService);
  characterSocket = inject(CharacterSocketService);
  battleService = inject(BattleService);
  libraryService = inject(LibraryService);
  libraryStoreService = inject(LibraryStoreService);
  trashService = inject(TrashService);
  notification = inject(NotificationService);
  cdr = inject(ChangeDetectorRef);
  trueStats = inject(TrueStatsService);
  assetBrowserApi = inject(AssetBrowserApiService);
  grants = inject(GrantService);
  lobbyBridge = inject(WorldLobbyBridgeService);
  partyStash = inject(PartyStashService);
  router = inject(Router);

  // Character/party state
  newCharacterId: string = '';
  selectedCharacterForParty: string = '';
  partyCharacters: Map<string, CharacterSheet> = new Map();
  characterPortraitsMap: Map<string, string> = new Map();
  private characterPatchSubscription?: Subscription;
  private libraryChangedSubscription?: Subscription;

  // Battle Engine
  battleEngine = new BattleTrackerEngine();

  // UI state
  dummySheet: CharacterSheet = createEmptySheet();
  showItemCreator = false;
  showTrash = false;
  showCharacterGenerator = false;
  showLibrarySelector = false;
  editingItemIndex: number | null = null;
  editingRuneIndex: number | null = null;
  editingSpellIndex: number | null = null;
  editingSpell: SpellBlock | null = null; // stable ref kept across library updates
  isSpellEditorOpen = false;
  editingSkillIndex: number | null = null;
  editingStatusEffectIndex: number | null = null;
  editingItems = new Set<number>();
  editingRunes = new Set<number>();
  editingSpells = new Set<number>();
  editingSkills = new Set<number>();
  editingStatusEffects = new Set<number>();

  // Dashboard status effect management
  /** Character ID whose status effect picker is open, null = none */
  dashboardStatusPickerFor: string | null = null;

  /** Character ID whose status manager overlay is open */
  statusManagerFor: string | null = null;
  statusManagerSearch = '';

  /** Character ID + type for send-picker overlay */
  sendPickerFor: string | null = null;
  sendPickerType: 'item' | 'rune' | 'spell' | 'skill' | null = null;
  sendPickerSearch = '';

  /** Character ID whose knowledge management overlay is open */
  knowledgeManagerFor: string | null = null;
  knowledgeManagerLoading = false;
  knowledgeManagerType: KnowledgeKind = 'material';
  /** Ein Eintrag pro vergebbarem Wissen, unabhängig von der Wissensart. */
  knowledgeManagerEntries: { id: string; name: string; description?: string; known: boolean }[] = [];
  knowledgeManagerSearch = '';
  readonly knowledgeKindLabel = KNOWLEDGE_KIND_LABEL;
  /** Die Wissensarten, die das Kontextmenü und die Verwaltung anbieten. */
  readonly knowledgeKinds: KnowledgeKind[] = ['material', 'forge-trait', 'ingredient', 'extractor', 'brew-trait'];

  // Asset browser knowledge data loaded from AssetBrowserApi
  allMaterials: MaterialBlock[] = [];
  allForgeTraits: ForgeTrait[] = [];
  private knowledgeDataLoaded = false;

  /**
   * Wissens-Assets für die Bibliotheks-Spalte des Schreibtischs, je Art.
   *
   * Die kommen NICHT aus `/api/library` — `getLibrary` kennt nur acht Asset-Typen, Wissen und
   * Statblöcke sind nicht dabei. Deshalb der eigene Durchlauf über den Asset-Browser.
   */
  knowledgeBrowseAssets: Record<KnowledgeKind, BrowseEntry[]> = {
    'material': [], 'forge-trait': [], 'ingredient': [], 'extractor': [], 'brew-trait': [],
  };
  /** Rohstoffe/Wirkstoffe/Extraktoren als echte Gegenstände (Bogen: Materialien). */
  resourceBrowseItems: BrowseEntry[] = [];

  // Drag state
  private dragScrollInterval?: number;
  private isDragging = false;

  // Context menu state
  private selectedCharacterForContextMenu: string = '';

  // Loaded libraries signal for reactivity
  loadedLibraries = signal<Library[]>([]);

  constructor(private route: ActivatedRoute) {
    // Subscribe to loaded libraries and update signal
    this.libraryStoreService.allLibraries$.subscribe(libs => {
      console.log('[WORLD] Libraries loaded:', libs.length, 'libraries');
      libs.forEach(lib => {
        console.log(`  - ${lib.name}: ${lib.items?.length || 0} items, ${lib.spells?.length || 0} spells, ${lib.runes?.length || 0} runes, ${lib.skills?.length || 0} skills, ${lib.shops?.length || 0} shops`);
      });
      this.loadedLibraries.set(libs);
      this.cdr.markForCheck();
    });
  }

  // Battle queue getter - delegates to service
  get battleQueue(): BattleGroup[] {
    return this.battleService.getBattleQueue();
  }

  get availableCharactersForBattle() {
    return this.battleService.getAvailableCharactersForBattle(this.getPartyCharacterArray());
  }

  // Merged libraries (world's own + linked libraries)  
  mergedItems = computed(() => {
    const world = this.store.worldValue;
    if (!world) return [];
    
    const items = [...(world.itemLibrary || [])];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries(); // Read from signal for reactivity
    
    console.log('[WORLD] Merging items - World items:', items.length, 'Linked libs:', linkedLibs.length, 'Loaded libs:', loadedLibs.length);
    
    linkedLibs.forEach(libId => {
      const lib = loadedLibs.find(l => l.id === libId);
      if (lib?.items) {
        console.log(`  - Adding ${lib.items.length} items from library "${lib.name}"`);
        items.push(...lib.items);
      } else {
        console.log(`  - Library ${libId} not found or has no items`);
      }
    });
    
    console.log('[WORLD] Total merged items:', items.length);
    return items;
  });

  mergedRunes = computed(() => {
    const world = this.store.worldValue;
    if (!world) return [];
    
    const runes = [...(world.runeLibrary || [])];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    
    linkedLibs.forEach(libId => {
      const lib = loadedLibs.find(l => l.id === libId);
      if (lib?.runes) {
        runes.push(...lib.runes);
      }
    });
    
    return runes;
  });

  mergedSpells = computed(() => {
    const world = this.store.worldValue;
    if (!world) return [];
    
    const spells = [...(world.spellLibrary || [])];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    
    linkedLibs.forEach(libId => {
      const lib = loadedLibs.find(l => l.id === libId);
      if (lib?.spells) {
        spells.push(...lib.spells);
      }
    });
    
    return spells;
  });

  mergedSkills = computed(() => {
    const world = this.store.worldValue;
    if (!world) return [];
    
    const skills = [...(world.skillLibrary || [])];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    
    linkedLibs.forEach(libId => {
      const lib = loadedLibs.find(l => l.id === libId);
      if (lib?.skills) {
        skills.push(...lib.skills);
      }
    });
    
    return skills;
  });

  mergedStatusEffects = computed(() => {
    const world = this.store.worldValue;
    if (!world) return [];
    
    const statusEffects: StatusEffect[] = [];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    
    linkedLibs.forEach(libId => {
      const lib = loadedLibs.find(l => l.id === libId);
      if (lib?.statusEffects) {
        statusEffects.push(...lib.statusEffects);
      }
    });
    
    return statusEffects;
  });

  mergedShops = computed(() => {
    const world = this.store.worldValue;
    if (!world) return [];
    
    const shops: ShopEvent[] = [];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    
    console.log('[WORLD] Merging shops - Linked libs:', linkedLibs.length, 'Loaded libs:', loadedLibs.length);
    
    linkedLibs.forEach(libId => {
      const lib = loadedLibs.find(l => l.id === libId);
      if (lib?.shops) {
        console.log(`  - Adding ${lib.shops.length} shops from library "${lib.name}"`);
        shops.push(...lib.shops);
      } else {
        console.log(`  - Library ${libId} not found or has no shops`);
      }
    });
    
    console.log('[WORLD] Total merged shops:', shops.length);
    return shops;
  });

  // ── GM-Schreibtisch ────────────────────────────────────────────────────────

  get deskTabs(): DeskTab[] {
    return this.store.worldValue?.gmDesk ?? [];
  }

  /** Die aufgedeckten Reiter — sie erscheinen unter Aktive Events als gemeinsamer Loot-Pool. */
  get revealedDeskTabs(): DeskTab[] {
    return this.deskTabs.filter(t => t.revealed);
  }

  onDeskChanged(tabs: DeskTab[]): void {
    this.store.applyPatch({ path: 'gmDesk', value: tabs });
  }

  onDeskOffer(event: { characterId: string; entry: DeskEntry }): void {
    const name = this.partyCharacters.get(event.characterId)?.name ?? 'dem Charakter';
    this.grants.offer(event.characterId, event.entry, 'Spielleiter');
    this.notification.success(`"${event.entry.name}" wurde ${name} angeboten.`, 2500);
    this.cdr.markForCheck();
  }

  onNpcInventoryChanged(event: { tokenId: string; inventory: ItemBlock[] }): void {
    this.lobbyBridge.setTokenInventory(event.tokenId, event.inventory);
  }

  /** Ein Gegenstand vom Schreibtisch in den gemeinsamen Beutel der Gruppe. */
  async onDepositToStash(item: ItemBlock): Promise<void> {
    const ok = await this.partyStash.deposit(item, { name: 'Spielleiter' });
    if (ok) this.notification.success(`"${item.name}" liegt jetzt im Beutel der Gruppe.`, 2000);
    else this.notification.error('Der Beutel hat den Gegenstand nicht angenommen.', 3000);
    this.cdr.markForCheck();
  }

  /** Der GM nimmt einen Eintrag aus einem aufgedeckten Reiter wieder heraus. */
  onDeskEntryRemoved(event: { tabId: string; entryId: string }): void {
    this.onDeskChanged(this.deskTabs.map(t => t.tabId !== event.tabId ? t : {
      ...t, entries: t.entries.filter(e => e.entryId !== event.entryId),
    }));
  }

  // Current Events helpers
  get currentEvents(): CurrentEvent[] {
    return this.store.worldValue?.currentEvents || [];
  }

  onEventAdded(event: CurrentEvent) {
    const world = this.store.worldValue;
    if (!world) return;
    
    const events = [...(world.currentEvents || []), event];
    this.store.applyPatch({ path: 'currentEvents', value: events });
  }

  onEventRemoved(eventId: string) {
    const world = this.store.worldValue;
    if (!world) return;
    
    const events = (world.currentEvents || []).filter(e => e.id !== eventId);
    this.store.applyPatch({ path: 'currentEvents', value: events });
  }

  onEventUpdated(event: CurrentEvent) {
    const world = this.store.worldValue;
    if (!world) return;
    
    const events = (world.currentEvents || []).map(e => e.id === event.id ? event : e);
    this.store.applyPatch({ path: 'currentEvents', value: events });
  }

  navigateToLibrary(data: { libraryId: string; tab: 'shops'; itemId: string }) {
    // Navigate to library with query parameters to highlight the item
    this.router.navigate(['/library', data.libraryId], {
      queryParams: {
        tab: data.tab,
        highlightId: data.itemId
      }
    });
  }

  ngOnInit() {
    // Connect battle engine to world store for persistence
    this.battleEngine.setWorldStore(this.store);
    
    // Load all libraries for context menu usage
    this.libraryStoreService.loadAllLibraries();

    // Load materials and forge traits for asset browser knowledge tab
    this.loadKnowledgeData();

    // Materialien und Schmiedemerkmale kommen nicht aus `allLibraries`, sondern aus einem eigenen
    // Asset-Durchlauf — der muss beim Bearbeiten einer Bibliothek gesondert erneuert werden.
    this.libraryChangedSubscription = this.libraryStoreService.libraryChanged$.subscribe(() => {
      this.knowledgeDataLoaded = false;
      void this.loadKnowledgeData();
    });


    this.route.params.subscribe(params => {
      this.worldName = params['worldName'];
      document.title = this.worldName;
      this.store.load(this.worldName);
      // Für die NSC-Reiter des Schreibtischs und den Beutel der Gruppe.
      void this.lobbyBridge.attach(this.worldName);
      this.partyStash.attach(this.worldName);
    });

    this.characterSocket.connect();

    this.characterPatchSubscription = this.characterSocket.patches$.subscribe((data: CharacterPatchEvent) => {
      const sheet = this.partyCharacters.get(data.characterId);
      if (sheet) {
        this.applyJsonPatch(sheet, data.patch);

        if (data.patch.path.includes('speed') || data.patch.path === 'level') {
          this.battleService.refreshBattleSpeeds();
        }

        if (data.patch.path.includes('portrait')) {
          this.updateCharacterPortraits();
        }

        this.cdr.markForCheck();
      }
    });

    this.store.world$.subscribe(async world => {
      if (world) {
        await this.loadPartyCharacters(world.partyIds);
        // Always re-sync tracker from store updates (local + websocket) to prevent drift.
        this.battleEngine.syncFromWorldStore();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.characterPatchSubscription?.unsubscribe();
    this.libraryChangedSubscription?.unsubscribe();
    this.lobbyBridge.detach();
  }

  // ==================== Party Management ====================

  async loadPartyCharacters(partyIds: string[]) {
    for (const characterId of partyIds) {
      if (!this.partyCharacters.has(characterId)) {
        try {
          const sheet = await this.characterApi.loadCharacter(characterId);
          if (sheet) {
            // Ensure sheet has the ID property set
            sheet.id = characterId;
            if (!sheet.currency) {
              sheet.currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
            }
            this.partyCharacters.set(characterId, sheet);
            this.characterSocket.joinCharacter(characterId);

            if (sheet.worldName !== this.worldName) {
              try {
                await this.characterApi.patchCharacter(characterId, {
                  path: 'worldName',
                  value: this.worldName
                });
              } catch (error) {
                console.error(`Failed to auto-assign world to character ${characterId}:`, error);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to load character ${characterId}:`, err);
        }
      }
    }

    const currentPartyIds = new Set(partyIds);
    for (const characterId of this.partyCharacters.keys()) {
      if (!currentPartyIds.has(characterId)) {
        this.partyCharacters.delete(characterId);
      }
    }

    // Update battle service with current party characters
    this.battleService.setPartyCharacters(this.partyCharacters);
    this.updateCharacterPortraits();

    // Update battle engine with available characters
    this.battleEngine.setAvailableCharacters(
      Array.from(this.partyCharacters.entries()).map(([id, sheet]) => ({
        id,
        name: sheet.name || id,
        portrait: sheet.portrait,
        speed: this.battleService.calculateSpeed(sheet)
      }))
    );
    
    // Re-sync battle state after available-character refresh.
    this.battleEngine.syncFromWorldStore();

    this.cdr.detectChanges();
  }

  updateCharacterPortraits() {
    const map = new Map<string, string>();
    this.partyCharacters.forEach((sheet, id) => {
      if (sheet.portrait) {
        map.set(id, sheet.portrait);
      }
    });
    this.characterPortraitsMap = map;
  }

  getPartyCharacterArray(): Array<{id: string, sheet: CharacterSheet}> {
    return Array.from(this.partyCharacters.entries()).map(([id, sheet]) => ({id, sheet}));
  }

  get partyMembersForLoot() {
    return this.getPartyCharacterArray().map(p => ({
      id: p.id,
      name: p.sheet.name || p.id
    }));
  }

  addCharacter() {
    if (!this.newCharacterId.trim()) return;

    const world = this.store.worldValue;
    if (world && !world.characterIds.includes(this.newCharacterId)) {
      this.store.applyPatch({
        path: 'characterIds',
        value: [...world.characterIds, this.newCharacterId]
      });
      this.newCharacterId = '';
    }
  }

  removeCharacter(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newCharacterIds = [...world.characterIds];
      const removedId = newCharacterIds[index];
      newCharacterIds.splice(index, 1);

      const newPartyIds = world.partyIds.filter((id: string) => id !== removedId);

      this.store.applyPatch({
        path: 'characterIds',
        value: newCharacterIds
      });

      if (newPartyIds.length !== world.partyIds.length) {
        this.store.applyPatch({
          path: 'partyIds',
          value: newPartyIds
        });
      }
    }
  }

  async addToParty() {
    if (!this.selectedCharacterForParty) return;

    const world = this.store.worldValue;
    if (world && !world.partyIds.includes(this.selectedCharacterForParty)) {
      this.store.applyPatch({
        path: 'partyIds',
        value: [...world.partyIds, this.selectedCharacterForParty]
      });

      try {
        await this.characterApi.patchCharacter(this.selectedCharacterForParty, {
          path: 'worldName',
          value: world.name
        });
      } catch (error) {
        console.error('Failed to update character worldName:', error);
      }

      this.selectedCharacterForParty = '';
    }
  }

  removeFromParty(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newPartyIds = [...world.partyIds];
      newPartyIds.splice(index, 1);
      this.store.applyPatch({
        path: 'partyIds',
        value: newPartyIds
      });
    }
  }

  // Character Generator methods
  openCharacterGenerator() {
    this.showCharacterGenerator = true;
    this.cdr.markForCheck();
  }

  closeCharacterGenerator() {
    this.showCharacterGenerator = false;
    this.cdr.markForCheck();
  }

  async onCharacterGenerated(character: CharacterSheet) {
    try {
      // Use character name as ID (sanitized for filesystem)
      const sanitizedName = character.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      const characterId = `${sanitizedName}_${Date.now()}`;
      
      // Save character to backend
      await this.characterApi.saveCharacter(characterId, character);
      
      // Add character to world
      const world = this.store.worldValue;
      if (world) {
        this.store.applyPatch({
          path: 'characterIds',
          value: [...world.characterIds, characterId]
        });
      }
      
      // Close the generator
      this.closeCharacterGenerator();
      
      console.log(`Character "${character.name}" created with ID: ${characterId}`);
      
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to save generated character:', error);
      alert('Failed to save character. Please try again.');
    }
  }


  // ==================== Library Management ====================

  openItemCreator() { this.showItemCreator = true; }
  closeItemCreator() { this.showItemCreator = false; }

  openItemEditor(index: number) { this.editingItemIndex = index; }
  closeItemEditor() { this.editingItemIndex = null; }

  openRuneEditorDialog(index: number) { this.editingRuneIndex = index; }
  closeRuneEditor() { this.editingRuneIndex = null; }

  openSpellEditorDialog(index: number) {
    this.editingSpellIndex = index;
    this.editingSpell = this.store.worldValue?.spellLibrary?.[index] ?? null;
    this.isSpellEditorOpen = true;
  }
  closeSpellEditorDialog() { this.isSpellEditorOpen = false; this.editingSpellIndex = null; this.editingSpell = null; }

  openSkillEditorDialog(index: number) { this.editingSkillIndex = index; }
  closeSkillEditorDialog() { this.editingSkillIndex = null; }

  createItem(item: ItemBlock) {
    this.libraryService.createItem(item);
    this.closeItemCreator();
  }

  generateRandomWeapon() { /* deprecated */ }
  generateRandomArmor() { /* deprecated */ }

  updateItem(index: number, patch: JsonPatch) {
    this.libraryService.updateItem(index, patch);
  }

  removeItem(index: number) {
    this.libraryService.removeItem(index);
    this.editingItems = this.shiftEditingSet(this.editingItems, index);
  }

  addRune() { this.libraryService.addRune(); }
  updateRune(index: number, patch: JsonPatch) { this.libraryService.updateRune(index, patch); }
  removeRune(index: number) {
    this.libraryService.removeRune(index);
    this.editingRunes = this.shiftEditingSet(this.editingRunes, index);
  }

  addSpell() { this.libraryService.addSpell(); }
  updateSpell(index: number, patch: JsonPatch) { this.libraryService.updateSpell(index, patch); }
  removeSpell(index: number) { this.libraryService.removeSpell(index); }

  addSkill() { this.libraryService.addSkill(); }
  updateSkill(index: number, patch: JsonPatch) { this.libraryService.updateSkill(index, patch); }
  removeSkill(index: number) { this.libraryService.removeSkill(index); }

  // Status Effect CRUD (store in world.statusEffectLibrary)
  addStatusEffect() {
    const newEffect: StatusEffect = {
      id: `effect_${Date.now()}`,
      name: 'Neuer Effekt',
      description: '',
      icon: '✨',
      defaultDuration: undefined
    };
    const world = this.store.worldValue;
    if (!world) return;
    const effects = [...(world.statusEffectLibrary || []), newEffect];
    this.store.applyPatch({ path: '/statusEffectLibrary', value: effects });
  }

  updateStatusEffect(index: number, patch: JsonPatch) {
    const world = this.store.worldValue;
    if (!world) return;
    const effects = [...(world.statusEffectLibrary || [])];
    if (effects[index]) {
      const key = patch.path.split('/').pop() || '';
      (effects[index] as any)[key] = patch.value;
      this.store.applyPatch({ path: '/statusEffectLibrary', value: effects });
    }
  }

  removeStatusEffect(index: number) {
    const world = this.store.worldValue;
    if (!world) return;
    const effects = [...(world.statusEffectLibrary || [])];
    effects.splice(index, 1);
    this.store.applyPatch({ path: '/statusEffectLibrary', value: effects });
    this.editingStatusEffects = this.shiftEditingSet(this.editingStatusEffects, index);
  }

  openStatusEffectEditorDialog(index: number) {
    // For now, just mark as editing - a full editor dialog could be added later
    this.editingStatusEffectIndex = index;
    console.log('Open status effect editor:', index);
    // TODO: Implement a proper status effect editor dialog
  }

  // ---- Dashboard: assign status effects to party characters ----

  getCoinPartsForMember(sheet: CharacterSheet): CoinPart[] {
    return getCoinParts(sheet.currency ?? { copper: 0, silver: 0, gold: 0, platinum: 0 });
  }

  toggleDashboardStatusPicker(characterId: string) {
    this.dashboardStatusPickerFor = this.dashboardStatusPickerFor === characterId ? null : characterId;
    this.cdr.markForCheck();
  }

  getDashboardActiveEffects(characterId: string): ActiveStatusEffect[] {
    const sheet = this.partyCharacters.get(characterId);
    return sheet?.activeStatusEffects ?? [];
  }

  getDashboardEffectDef(statusEffectId: string): StatusEffect | undefined {
    return this.mergedStatusEffects().find(e => e.id === statusEffectId);
  }

  /** Called when GM picks an effect from the dashboard picker */
  addEffectFromDashboard(characterId: string, effect: StatusEffect) {
    const libId = this.loadedLibraries().find(lib => lib.statusEffects?.some(e => e.id === effect.id))?.id ?? '';
    this.applyStatusEffectToCharacter(characterId, effect.id, libId);
    this.dashboardStatusPickerFor = null;
    this.cdr.markForCheck();
  }

  // ---- Status Manager overlay ----

  closeStatusManager() {
    this.statusManagerFor = null;
    this.statusManagerSearch = '';
    this.cdr.markForCheck();
  }

  get statusManagerEffects(): StatusEffect[] {
    const search = this.statusManagerSearch.toLowerCase().trim();
    return this.mergedStatusEffects().filter(e => {
      if (!search) return true;
      return e.name.toLowerCase().includes(search)
        || (e.tags ?? []).some(t => t.toLowerCase().includes(search));
    });
  }

  getStatusManagerActiveEffects(): ActiveStatusEffect[] {
    if (!this.statusManagerFor) return [];
    return this.getDashboardActiveEffects(this.statusManagerFor);
  }

  addEffectFromManager(effect: StatusEffect) {
    if (!this.statusManagerFor) return;
    const libId = this.loadedLibraries().find(lib => lib.statusEffects?.some(e => e.id === effect.id))?.id ?? '';
    this.applyStatusEffectToCharacter(this.statusManagerFor, effect.id, libId);
    this.cdr.markForCheck();
  }

  removeEffectFromManager(active: ActiveStatusEffect) {
    if (!this.statusManagerFor) return;
    this.removeStatusEffectFromCharacter(this.statusManagerFor, active.statusEffectId, active.appliedAt);
    this.cdr.markForCheck();
  }

  // ---- Send Picker overlay ----

  closeSendPicker() {
    this.sendPickerFor = null;
    this.sendPickerType = null;
    this.sendPickerSearch = '';
    this.cdr.markForCheck();
  }

  get sendPickerItems(): any[] {
    const search = this.sendPickerSearch.toLowerCase().trim();
    let items: any[] = [];
    switch (this.sendPickerType) {
      case 'item': items = this.mergedItems(); break;
      case 'rune': items = this.mergedRunes(); break;
      case 'spell': items = this.mergedSpells(); break;
      case 'skill': items = this.mergedSkills(); break;
    }
    if (!search) return items;
    return items.filter(i => i.name?.toLowerCase().includes(search));
  }

  get sendPickerTypeLabel(): string {
    switch (this.sendPickerType) {
      case 'item': return 'Item';
      case 'rune': return 'Rune';
      case 'spell': return 'Zauber';
      case 'skill': return 'Fähigkeit';
      default: return '';
    }
  }

  sendFromPicker(item: any) {
    if (!this.sendPickerFor || !this.sendPickerType) return;
    const character = this.partyCharacters.get(this.sendPickerFor);
    if (!character) return;

    this.offerToCharacter(this.sendPickerFor, this.sendPickerType, item);
  }

  removeStatusEffectFromCharacter(characterId: string, statusEffectId: string, appliedAt: number) {
    const sheet = this.partyCharacters.get(characterId);
    if (!sheet) return;
    const activeEffects = (sheet.activeStatusEffects ?? []).filter(
      e => !(e.statusEffectId === statusEffectId && e.appliedAt === appliedAt)
    );
    this.characterSocket.sendPatch(characterId, { path: '/activeStatusEffects', value: activeEffects });
    sheet.activeStatusEffects = activeEffects;
    this.cdr.markForCheck();
  }

  // Editing state handlers
  onItemEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    this.editingItems = this.updateEditingSet(this.editingItems, index, isEditing);
  }

  onRuneEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    this.editingRunes = this.updateEditingSet(this.editingRunes, index, isEditing);
  }

  onSpellEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    this.editingSpells = this.updateEditingSet(this.editingSpells, index, isEditing);
  }

  onSkillEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    this.editingSkills = this.updateEditingSet(this.editingSkills, index, isEditing);
  }

  onStatusEffectEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    this.editingStatusEffects = this.updateEditingSet(this.editingStatusEffects, index, isEditing);
  }

  isItemEditing(index: number): boolean { return this.editingItems.has(index); }
  isRuneEditing(index: number): boolean { return this.editingRunes.has(index); }
  isSpellEditing(index: number): boolean { return this.editingSpells.has(index); }

  private updateEditingSet(set: Set<number>, index: number, isEditing: boolean): Set<number> {
    const newSet = new Set(set);
    if (isEditing) newSet.add(index);
    else newSet.delete(index);
    return newSet;
  }

  private shiftEditingSet(set: Set<number>, removedIndex: number): Set<number> {
    const newSet = new Set<number>();
    set.forEach(i => {
      if (i < removedIndex) newSet.add(i);
      else if (i > removedIndex) newSet.add(i - 1);
    });
    return newSet;
  }

  trackByIndex(index: number): number { return index; }

  // ==================== Battle Tracker ====================

  addToBattle(characterId: string) { this.battleService.addToBattle(characterId); }
  removeFromBattle(characterId: string) { this.battleService.removeFromBattle(characterId); }
  advanceTurn() { this.battleService.advanceTurn(); }
  resetBattle() { this.battleService.resetBattle(); }
  changeParticipantTeam(characterId: string, team: string) { this.battleService.changeParticipantTeam(characterId, team); }
  reorderParticipants(characterId: string, newIndex: number) { this.battleService.reorderParticipants(characterId, newIndex); }

  // ==================== Trash Management ====================

  openTrash() { this.showTrash = true; }
  closeTrash() { this.showTrash = false; }
  restoreFromTrash(index: number) { this.trashService.restoreFromTrash(index); }
  permanentlyDelete(index: number) { this.trashService.permanentlyDelete(index); }
  emptyTrash() { this.trashService.emptyTrash(); }

  /**
   * Der einzige Weg, auf dem aus dieser Ansicht etwas an einen Spieler geht: anbieten, nicht
   * einschreiben. Der Spieler entscheidet, und sein eigener Client legt das Ding dann ab — damit
   * kann die Vergabe weder etwas überschreiben noch doppelt landen.
   */
  private offerToCharacter(characterId: string, type: GrantType, data: unknown, knowledgeKind?: KnowledgeKind): void {
    const character = this.partyCharacters.get(characterId);
    const entry = createDeskEntry(type, structuredClone(data), { knowledgeKind });

    this.grants.offer(characterId, entry, 'Spielleiter');
    this.notification.success(
      `${GRANT_TYPE_LABEL[type]} "${entry.name}" wurde ${character?.name ?? 'dem Charakter'} angeboten.`,
      2500,
    );
    this.cdr.markForCheck();
  }

  // ==================== Helpers ====================

  openCharacterSheet(characterId: string) {
    // Open character sheet in a new tab
    const url = `/characters/${characterId}`;
    window.open(url, '_blank');
  }

  // Get resource status block by formula type
  getResourceStatus(sheet: CharacterSheet, type: FormulaType): StatusBlock | undefined {
    return sheet.statuses?.find(s => s.formulaType === type);
  }

  // Get current resource value
  getResourceCurrent(sheet: CharacterSheet, type: FormulaType): number {
    const status = this.getResourceStatus(sheet, type);
    return status?.statusCurrent || 0;
  }

  // Get max resource value using the same formula as currentstat.component
  getResourceMax(sheet: CharacterSheet, type: FormulaType): number {
    return this.trueStats.calculateResourceMax(sheet, type);
  }

  // Get resource percentage
  getResourcePercentage(sheet: CharacterSheet, type: FormulaType): number {
    const max = this.getResourceMax(sheet, type);
    if (max === 0) return 0;
    const current = this.getResourceCurrent(sheet, type);
    return (current / max) * 100;
  }

  // Expose FormulaType enum to template
  FormulaType = FormulaType;

  // Library management
  openLibrarySelector() {
    this.showLibrarySelector = true;
    const world = this.store.worldValue;
    
    // Set selected libraries immediately
    if (this.librarySelector && world) {
      this.librarySelector.setSelectedLibraries(world.linkedLibraries || []);
    }
    
    // Also set after render in case the component wasn't ready
    setTimeout(() => {
      if (this.librarySelector && world) {
        this.librarySelector.setSelectedLibraries(world.linkedLibraries || []);
      }
    }, 0);
    
    this.cdr.markForCheck();
  }

  handleLibrariesChanged(libraryIds: string[]) {
    const world = this.store.worldValue;
    if (world) {
      // Auto-include dependencies
      const withDependencies = this.resolveLibraryDependencies(libraryIds);
      world.linkedLibraries = withDependencies;
      this.store.save();
      console.log('[WORLD] Updated linked libraries (with dependencies):', withDependencies);
    }
    // Don't close the modal - changes are applied instantly
    this.cdr.markForCheck();
  }

  /**
   * Resolve all library dependencies recursively
   * Returns array with libraries + all their dependencies (flattened, deduplicated)
   */
  private resolveLibraryDependencies(libraryIds: string[], visited = new Set<string>()): string[] {
    const result: string[] = [];
    const allLibs = this.loadedLibraries();
    
    for (const id of libraryIds) {
      if (visited.has(id)) continue; // Circular dependency protection
      visited.add(id);
      
      // Add this library
      if (!result.includes(id)) {
        result.push(id);
      }
      
      // Find and add dependencies
      const lib = allLibs.find(l => l.id === id);
      if (lib?.dependencies && lib.dependencies.length > 0) {
        const deps = this.resolveLibraryDependencies(lib.dependencies, visited);
        deps.forEach(depId => {
          if (!result.includes(depId)) {
            result.push(depId);
          }
        });
      }
    }
    
    return result;
  }

  // Context menu for character interactions
  handleCharacterRightClick(event: MouseEvent, characterId: string) {
    event.preventDefault();
    this.selectedCharacterForContextMenu = characterId;
    const character = this.partyCharacters.get(characterId);
    const charName = character?.name || characterId;

    const menuItems: ContextMenuItem[] = [];

    // ── Section 1: Open sheet ──
    menuItems.push({ icon: '📋', label: `${charName} öffnen`, action: `open_sheet::${characterId}` });
    menuItems.push({ label: '', action: '', divider: true });

    // ── Section 2: Send items/spells/runes/skills ──
    menuItems.push({ icon: '📦', label: 'Item senden', action: `send_picker::item::${characterId}` });
    menuItems.push({ icon: '🔮', label: 'Zauber senden', action: `send_picker::spell::${characterId}` });
    menuItems.push({ icon: '💎', label: 'Rune senden', action: `send_picker::rune::${characterId}` });
    menuItems.push({ icon: '⚔', label: 'Fähigkeit senden', action: `send_picker::skill::${characterId}` });
    menuItems.push({ label: '', action: '', divider: true });

    // ── Section 3: Status management ──
    menuItems.push({ icon: '✨', label: 'Status verwalten', action: `manage_status::${characterId}` });
    menuItems.push({ label: '', action: '', divider: true });

    // ── Section 4: Knowledge management ──
    for (const kind of this.knowledgeKinds) {
      menuItems.push({
        icon: '📖',
        label: `${KNOWLEDGE_KIND_LABEL[kind]} verwalten`,
        action: `manage_knowledge::${kind}::${characterId}`,
      });
    }

    this.contextMenu?.show(event.clientX, event.clientY, menuItems);
  }

  // ── Knowledge Management ─────────────────────────────────────────────────────

  /**
   * Wissensverwaltung für eine beliebige der fünf Wissensarten. Vorher deckte sie nur Materialien
   * und Schmiedemerkmale ab — Wirkstoffe, Extraktoren und Braumerkmale hatten überhaupt keinen
   * Vergabeweg, obwohl der Bogen sie liest.
   */
  async openKnowledgeManager(characterId: string, kind: KnowledgeKind = 'material'): Promise<void> {
    this.knowledgeManagerFor = characterId;
    this.knowledgeManagerType = kind;
    this.knowledgeManagerSearch = '';
    this.knowledgeManagerLoading = true;
    this.knowledgeManagerEntries = [];
    this.cdr.markForCheck();

    try {
      const character = this.partyCharacters.get(characterId);
      const knownIds = new Set(this.knownIdsFor(character, kind));
      const files = await this.loadKnowledgeAssets(kind);

      this.knowledgeManagerEntries = files
        // Nach Wissensstufe filtern, nicht nach dem alten `isPublic`-Flag: wer nur `!isPublic`
        // prüft, versteckt jeden Eintrag, der über `knowledgeTier` eingestuft wurde.
        .filter(f => knowledgeTierOf(f.data as KnowledgeGraded) !== 'bekannt')
        .map(f => {
          // Ein Asset trägt seine ID mal in `data.id`, mal nur als Datei-ID. Ohne diesen Fallback
          // wurde `undefined` vergeben und der Bogen fand das Wissen nie wieder.
          const id = assetEntryId(f);
          const data = f.data as { name?: string; description?: string };
          return { id, name: data?.name ?? id, description: data?.description, known: knownIds.has(id) };
        })
        .filter(e => !!e.id);
    } catch (e) {
      console.error('Knowledge manager: Fehler beim Laden', e);
    } finally {
      this.knowledgeManagerLoading = false;
      this.cdr.markForCheck();
    }
  }

  /** Das Bogenfeld, in dem eine Wissensart liegt. */
  private knownIdsFor(sheet: CharacterSheet | undefined, kind: KnowledgeKind): string[] {
    switch (kind) {
      case 'material': return sheet?.knownMaterialIds ?? [];
      case 'forge-trait': return sheet?.knownForgeTraitIds ?? [];
      case 'ingredient': return sheet?.knownIngredientIds ?? [];
      case 'extractor': return sheet?.knownExtractorIds ?? [];
      case 'brew-trait': return sheet?.knownBrewTraitIds ?? [];
    }
  }

  private knowledgeFieldPath(kind: KnowledgeKind): string {
    switch (kind) {
      case 'material': return '/knownMaterialIds';
      case 'forge-trait': return '/knownForgeTraitIds';
      case 'ingredient': return '/knownIngredientIds';
      case 'extractor': return '/knownExtractorIds';
      case 'brew-trait': return '/knownBrewTraitIds';
    }
  }

  private async loadKnowledgeAssets(kind: KnowledgeKind): Promise<AssetFile[]> {
    const libraries = await firstValueFrom(this.assetBrowserApi.getAllLibraries());
    const files: AssetFile[] = [];
    for (const lib of libraries) {
      files.push(...await firstValueFrom(this.assetBrowserApi.searchFiles(lib.id, '', [kind])));
    }
    return files;
  }

  get filteredKnowledgeEntries(): { id: string; name: string; description?: string; known: boolean }[] {
    const q = this.knowledgeManagerSearch.toLowerCase().trim();
    if (!q) return this.knowledgeManagerEntries;
    return this.knowledgeManagerEntries.filter(e => e.name.toLowerCase().includes(q));
  }

  toggleKnowledgeEntry(entry: { known: boolean }): void {
    entry.known = !entry.known;
    this.cdr.markForCheck();
  }

  saveKnowledgeManager(): void {
    if (!this.knowledgeManagerFor) return;
    const name = this.partyCharacters.get(this.knowledgeManagerFor)?.name ?? this.knowledgeManagerFor;
    const knownIds = this.knowledgeManagerEntries.filter(e => e.known).map(e => e.id);

    this.characterSocket.sendPatch(this.knowledgeManagerFor, {
      path: this.knowledgeFieldPath(this.knowledgeManagerType),
      value: knownIds,
    });
    this.notification.success(
      `${KNOWLEDGE_KIND_LABEL[this.knowledgeManagerType]} für ${name} gespeichert.`, 2000,
    );
    this.knowledgeManagerFor = null;
    this.cdr.markForCheck();
  }

  get knownKnowledgeCount(): number {
    return this.knowledgeManagerEntries.filter(e => e.known).length;
  }

  closeKnowledgeManager(): void {
    this.knowledgeManagerFor = null;
    this.cdr.markForCheck();
  }

  /** Loads all materials and forge traits from the asset browser API for the knowledge tab. */
  private async loadKnowledgeData(): Promise<void> {
    if (this.knowledgeDataLoaded) return;
    try {
      const libraries = await firstValueFrom(this.assetBrowserApi.getAllLibraries());
      const byKind: Record<KnowledgeKind, AssetFile[]> = {
        'material': [], 'forge-trait': [], 'ingredient': [], 'extractor': [], 'brew-trait': [],
      };

      for (const lib of libraries) {
        for (const kind of this.knowledgeKinds) {
          byKind[kind].push(...await firstValueFrom(this.assetBrowserApi.searchFiles(lib.id, '', [kind])));
        }
      }

      this.allMaterials = byKind['material'].map(f => f.data as MaterialBlock);
      this.allForgeTraits = byKind['forge-trait'].map(f => f.data as ForgeTrait);

      for (const kind of this.knowledgeKinds) {
        this.knowledgeBrowseAssets[kind] = byKind[kind].map(f => this.toBrowseEntry(f));
      }
      // Rohstoffe und Wirkstoffe sind auch physische Gegenstände — sie sollen sich verschenken
      // lassen, nicht nur als Wissen.
      this.resourceBrowseItems = [
        ...byKind['material'], ...byKind['ingredient'], ...byKind['extractor'],
      ].map(f => this.toBrowseEntry(f));

      this.knowledgeDataLoaded = true;
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[WORLD] Fehler beim Laden der Wissensdaten', e);
    }
  }

  /** Eine Asset-Datei als Browser-Eintrag; der Ordner kommt aus dem Pfad der Datei. */
  private toBrowseEntry(file: AssetFile): BrowseEntry {
    const path = file.path ?? '/';
    const slash = path.lastIndexOf('/');
    return {
      id: assetEntryId(file),
      name: file.name,
      folder: slash > 0 ? path.slice(0, slash) : '/',
      data: file.data,
    };
  }


  handleContextMenuAction(action: string) {
    if (action === 'none') return;

    const parts = action.split('::');
    const command = parts[0];

    switch (command) {
      case 'open_sheet':
        this.openCharacterSheet(parts[1]);
        break;
      case 'send_picker':
        this.sendPickerType = parts[1] as 'item' | 'rune' | 'spell' | 'skill';
        this.sendPickerFor = parts[2];
        this.sendPickerSearch = '';
        this.cdr.markForCheck();
        break;
      case 'manage_status':
        this.statusManagerFor = parts[1];
        this.statusManagerSearch = '';
        this.cdr.markForCheck();
        break;
      case 'manage_knowledge':
        this.openKnowledgeManager(parts[2], parts[1] as KnowledgeKind);
        break;
      case 'remove_status': {
        const statusEffectId = parts[1];
        const appliedAt = parseInt(parts[2], 10);
        this.removeStatusEffectFromCharacter(this.selectedCharacterForContextMenu, statusEffectId, appliedAt);
        break;
      }
    }
  }

  applyStatusEffectToCharacter(characterId: string, statusEffectId: string, libraryId: string) {
    const character = this.partyCharacters.get(characterId);
    if (!character) return;

    // Resolve the effect definition for defaultDuration and maxStacks
    const effectDef = this.mergedStatusEffects().find(e => e.id === statusEffectId);

    // Check if status effect is already applied
    const existingIndex = (character.activeStatusEffects ?? []).findIndex(
      effect => effect.statusEffectId === statusEffectId
    );

    if (!character.activeStatusEffects) {
      character.activeStatusEffects = [];
    }

    if (existingIndex !== -1) {
      // Stack if allowed
      const maxStacks = effectDef?.maxStacks || 1;
      const existing = character.activeStatusEffects[existingIndex];
      const currentStacks = existing.stacks || 1;
      if (currentStacks < maxStacks) {
        character.activeStatusEffects[existingIndex] = { ...existing, stacks: currentStacks + 1 };
      } else {
        console.log('Status effect already at max stacks');
        return;
      }
    } else {
      // Create new active status effect with duration from definition
      const activeEffect: ActiveStatusEffect = {
        statusEffectId,
        sourceLibraryId: libraryId,
        appliedAt: Date.now(),
        duration: effectDef?.defaultDuration,
        stacks: 1
      };
      character.activeStatusEffects.push(activeEffect);
    }

    // Track as seen so the character can re-apply it from their sheet
    const seen = new Set(character.seenStatusEffectIds ?? []);
    seen.add(statusEffectId);
    character.seenStatusEffectIds = Array.from(seen);

    // Emit patches
    this.characterSocket.sendPatch(characterId, { path: '/activeStatusEffects', value: character.activeStatusEffects });
    this.characterSocket.sendPatch(characterId, { path: '/seenStatusEffectIds', value: character.seenStatusEffectIds });
    this.cdr.markForCheck();
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.startsWith('/') ? patch.path.substring(1).split('/') : patch.path.split('.');
    let current = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);
      if (!isNaN(index) && Array.isArray(current)) current = current[index];
      else current = current[key] ??= {};
    }

    const finalKey = keys[keys.length - 1];
    
    // Handle array append operation: '-' means append to array
    if (finalKey === '-' && Array.isArray(current)) {
      current.push(patch.value);
      return;
    }
    
    const finalIndex = parseInt(finalKey, 10);
    if (!isNaN(finalIndex) && Array.isArray(current)) current[finalIndex] = patch.value;
    else current[finalKey] = patch.value;
  }
}
