import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldStoreService } from '../../services/world-store.service';
import { WorldSocketService } from '../../services/world-socket.service';
import { CharacterApiService } from '../../services/character-api.service';
import { CharacterSocketService, CharacterPatchEvent } from '../../services/character-socket.service';
import { BattleService, SimulatedTurn, BattleGroup } from '../../services/battle.service';
import { LibraryService } from '../../services/library.service';
import { TrashService } from '../../services/trash.service';
import { ItemBlock } from '../../model/item-block.model';
import { CharacterSheet, createEmptySheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { FormulaType } from '../../model/formula-type.enum';
import { StatusBlock } from '../../model/status-block.model';
import { Subscription } from 'rxjs';
import { ItemCreatorComponent } from '../../sheet/item-creator/item-creator.component';
import { LibraryTabsComponent } from '../library-tabs/library-tabs.component';
import { BattleTracker } from '../battle-tracker/battle-tracker.component';
import { LootManagerComponent, LootBundle } from '../loot-manager/loot-manager.component';
import { BattleTrackerEngine } from '../battle-tracker/battle-tracker-engine';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { CharacterGeneratorComponent } from '../character-generator/character-generator.component';

// Re-export types for template usage
export type { SimulatedTurn, BattleGroup };

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule, ItemCreatorComponent, LibraryTabsComponent, BattleTracker, LootManagerComponent, ImageUrlPipe, CharacterGeneratorComponent],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldComponent implements OnInit, OnDestroy {
  worldName: string = '';

  // Services
  store = inject(WorldStoreService);
  worldSocket = inject(WorldSocketService);
  characterApi = inject(CharacterApiService);
  characterSocket = inject(CharacterSocketService);
  battleService = inject(BattleService);
  libraryService = inject(LibraryService);
  trashService = inject(TrashService);
  cdr = inject(ChangeDetectorRef);

  // Character/party state
  newCharacterId: string = '';
  selectedCharacterForParty: string = '';
  partyCharacters: Map<string, CharacterSheet> = new Map();
  characterPortraitsMap: Map<string, string> = new Map();
  private characterPatchSubscription?: Subscription;

  // Battle Engine
  battleEngine = new BattleTrackerEngine();

  // UI state
  dummySheet: CharacterSheet = createEmptySheet();
  showItemCreator = false;
  showTrash = false;
  showCharacterGenerator = false;
  editingItems = new Set<number>();
  editingRunes = new Set<number>();
  editingSpells = new Set<number>();
  editingSkills = new Set<number>();

  // Drag state
  private dragScrollInterval?: number;
  private isDragging = false;

  constructor(private route: ActivatedRoute) {}

  // Loot Bundles getter
  get lootBundleLibrary(): LootBundle[] {
    return (this.store.worldValue as any)?.lootBundleLibrary || [];
  }

  // Battle queue getter - delegates to service
  get battleQueue(): BattleGroup[] {
    return this.battleService.getBattleQueue();
  }

  get availableCharactersForBattle() {
    return this.battleService.getAvailableCharactersForBattle(this.getPartyCharacterArray());
  }

  ngOnInit() {
    // Connect battle engine to world store for persistence
    this.battleEngine.setWorldStore(this.store);
    
    this.route.params.subscribe(params => {
      this.worldName = params['worldName'];
      this.store.load(this.worldName);
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

    this.store.world$.subscribe(world => {
      if (world) {
        this.loadPartyCharacters(world.partyIds);
      }
    });
  }

  ngOnDestroy() {
    this.characterPatchSubscription?.unsubscribe();
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
    
    // Load battle state from world store (after setting available characters)
    this.battleEngine.loadFromWorldStore();

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

  createItem(item: ItemBlock) {
    this.libraryService.createItem(item);
    this.closeItemCreator();
  }

  generateRandomWeapon() { this.libraryService.generateRandomWeapon(5); }
  generateRandomArmor() { this.libraryService.generateRandomArmor(5); }

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

  // ==================== Drag and Drop ====================

  onDragStart(event: DragEvent, type: 'item' | 'rune' | 'spell' | 'skill' | 'bundle', index: number) {
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('lootType', type);
    event.dataTransfer!.setData('lootIndex', index.toString());
    this.isDragging = true;
    this.startAutoScroll();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    this.updateAutoScroll(event.clientY);
  }

  private startAutoScroll() {
    if (this.dragScrollInterval) clearInterval(this.dragScrollInterval);
    this.dragScrollInterval = window.setInterval(() => {
      if (!this.isDragging) this.stopAutoScroll();
    }, 16);
  }

  private updateAutoScroll(mouseY: number) {
    const scrollSpeed = 10;
    const scrollThreshold = 100;
    const viewportHeight = window.innerHeight;

    if (mouseY < scrollThreshold) window.scrollBy(0, -scrollSpeed);
    else if (mouseY > viewportHeight - scrollThreshold) window.scrollBy(0, scrollSpeed);
  }

  private stopAutoScroll() {
    if (this.dragScrollInterval) {
      clearInterval(this.dragScrollInterval);
      this.dragScrollInterval = undefined;
    }
    this.isDragging = false;
  }

  onDropOnCharacter(event: DragEvent, characterId: string) {
    event.preventDefault();
    this.stopAutoScroll();

    const type = event.dataTransfer!.getData('lootType') as 'item' | 'rune' | 'spell' | 'skill' | 'bundle';
    const index = parseInt(event.dataTransfer!.getData('lootIndex'));
    const world = this.store.worldValue;
    if (!world) return;

    if (type === 'bundle') {
      const bundle = this.lootBundleLibrary[index];
      if (bundle) {
        this.characterApi.loadCharacter(characterId).then(freshSheet => {
          if (!freshSheet) return;
          bundle.items.forEach(item => this.giveItemToCharacter(characterId, 'item', item, freshSheet));
          bundle.runes.forEach(rune => this.giveItemToCharacter(characterId, 'rune', rune, freshSheet));
          bundle.spells.forEach(spell => this.giveItemToCharacter(characterId, 'spell', spell, freshSheet));
          bundle.skills.forEach(skill => this.giveItemToCharacter(characterId, 'skill', skill, freshSheet));
        });
      }
      return;
    }

    let lootData: any;
    switch (type) {
      case 'item': lootData = world.itemLibrary[index]; break;
      case 'rune': lootData = world.runeLibrary[index]; break;
      case 'spell': lootData = world.spellLibrary[index]; break;
      case 'skill': lootData = world.skillLibrary[index]; break;
    }

    if (lootData) {
      this.characterApi.loadCharacter(characterId).then(freshSheet => {
        if (!freshSheet) return;
        this.giveItemToCharacter(characterId, type, lootData, freshSheet);
      });
    }
  }

  private giveItemToCharacter(characterId: string, type: 'item' | 'rune' | 'spell' | 'skill', lootData: any, freshSheet: CharacterSheet) {
    let fieldPath: string;
    let currentArray: any[];

    switch (type) {
      case 'item':
        fieldPath = 'inventory';
        currentArray = freshSheet.inventory || [];
        break;
      case 'rune':
        fieldPath = 'runes';
        currentArray = freshSheet.runes || [];
        break;
      case 'spell':
        fieldPath = 'spells';
        currentArray = freshSheet.spells || [];
        break;
      case 'skill':
        fieldPath = 'skills';
        currentArray = freshSheet.skills || [];
        break;
    }

    currentArray.push({ ...lootData });

    this.characterSocket.sendPatch(characterId, { path: fieldPath, value: currentArray });
    this.sendDirectLootNotification(characterId, type, lootData);
  }

  private sendDirectLootNotification(characterId: string, type: 'item' | 'rune' | 'spell' | 'skill', data: any) {
    const lootItem = {
      id: `direct_${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      claimedBy: []
    };
    this.worldSocket.sendDirectLoot(characterId, lootItem);
  }

  // ==================== Loot Bundle Events ====================

  onBundleCreated(bundle: LootBundle) {
    const world = this.store.worldValue;
    if (world) {
      const currentBundles = (world as any).lootBundleLibrary || [];
      const existingIndex = currentBundles.findIndex((b: LootBundle) => b.name === bundle.name);

      const newBundles = existingIndex >= 0
        ? currentBundles.map((b: LootBundle, i: number) => i === existingIndex ? bundle : b)
        : [...currentBundles, bundle];

      this.store.applyPatch({ path: 'lootBundleLibrary', value: newBundles });
    }
  }

  onBundleDeleted(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const currentBundles = (world as any).lootBundleLibrary || [];
      const newBundles = [...currentBundles];
      newBundles.splice(index, 1);
      this.store.applyPatch({ path: 'lootBundleLibrary', value: newBundles });
    }
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

  // Get max resource value (base + bonus + effectBonus)
  getResourceMax(sheet: CharacterSheet, type: FormulaType): number {
    const status = this.getResourceStatus(sheet, type);
    if (!status) return 0;
    return (status.statusBase || 0) + (status.statusBonus || 0) + (status.statusEffectBonus || 0);
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
    const finalIndex = parseInt(finalKey, 10);
    if (!isNaN(finalIndex) && Array.isArray(current)) current[finalIndex] = patch.value;
    else current[finalKey] = patch.value;
  }
}
