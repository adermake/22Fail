import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldStoreService } from '../../services/world-store.service';
import { WorldSocketService } from '../../services/world-socket.service';
import { CharacterApiService } from '../../services/character-api.service';
import { CharacterSocketService, CharacterPatchEvent } from '../../services/character-socket.service';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { CharacterSheet, createEmptySheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { Subscription } from 'rxjs';
import { ItemCreatorComponent } from '../../sheet/item-creator/item-creator.component';
import { LibraryTabsComponent } from '../library-tabs/library-tabs.component';
import { BattleTracker } from '../battle-tracker/battle-tracker';
import { BattleParticipant } from '../../model/world.model';
import { LootManagerComponent, LootBundle } from './loot-manager.component';
import { WeaponGeneratorService } from '../../services/weapon-generator.service';
import { Armor } from '../../model/armor.model';

export interface SimulatedTurn {
  characterId: string;
  name: string;
  team: string;
  time: number;
  isAnchor: boolean;
  speed: number;
}

export interface BattleGroup {
  turns: SimulatedTurn[];
  team: string;
  startTime: number;
}

@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, CardComponent, FormsModule, ItemCreatorComponent, LibraryTabsComponent, BattleTracker, LootManagerComponent],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements OnInit, OnDestroy {
  worldName: string = '';
  store = inject(WorldStoreService);
  worldSocket = inject(WorldSocketService);
  characterApi = inject(CharacterApiService);
  characterSocket = inject(CharacterSocketService);
  weaponGenerator = inject(WeaponGeneratorService);
  cdr = inject(ChangeDetectorRef);

  newCharacterId: string = '';
  selectedCharacterForParty: string = '';
  partyCharacters: Map<string, CharacterSheet> = new Map();
  private characterPatchSubscription?: Subscription;

  // Map of character IDs to portrait URLs (for battle tracker)
  characterPortraitsMap: Map<string, string> = new Map();

  updateCharacterPortraits() {
    const map = new Map<string, string>();
    this.partyCharacters.forEach((sheet, id) => {
      if (sheet.portrait) {
        map.set(id, sheet.portrait);
      }
    });
    this.characterPortraitsMap = map;
  }

  // Dummy sheet for item/spell components that require it
  dummySheet: CharacterSheet = createEmptySheet();

  // Item creator dialog
  showItemCreator = false;

  // Track which items/runes/spells/skills are being edited (to disable dragging)
  editingItems = new Set<number>();
  editingRunes = new Set<number>();
  editingSpells = new Set<number>();
  editingSkills = new Set<number>();

  // Auto-scroll while dragging
  private dragScrollInterval?: number;
  private isDragging = false;

  // Loot Bundles
  get lootBundleLibrary(): LootBundle[] {
    return (this.store.worldValue as any)?.lootBundleLibrary || [];
  }

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.worldName = params['worldName'];
      console.log('Loading world:', this.worldName);
      this.store.load(this.worldName);
    });

    // Connect to character socket for real-time updates
    this.characterSocket.connect();

    // Subscribe to character patches for real-time GM dashboard updates
    this.characterPatchSubscription = this.characterSocket.patches$.subscribe((data: CharacterPatchEvent) => {
      // Check if the patched character is in our party
      const sheet = this.partyCharacters.get(data.characterId);
      if (sheet) {
        // Apply the patch to the specific character sheet
        this.applyJsonPatch(sheet, data.patch);

        // If speed stat or level changed, refresh battle speeds
        if (data.patch.path.includes('speed') || data.patch.path === 'level') {
          this.refreshBattleSpeeds();
        }

        // Update portraits if needed
        if (data.patch.path.includes('portrait')) {
          this.updateCharacterPortraits();
        }

        // Trigger change detection to update the view
        this.cdr.markForCheck();
      }
    });

    // Subscribe to world changes to load party character sheets
    this.store.world$.subscribe(world => {
      if (world) {
        this.loadPartyCharacters(world.partyIds);
      }
    });
  }

  ngOnDestroy() {
    if (this.characterPatchSubscription) {
      this.characterPatchSubscription.unsubscribe();
    }
  }

  async loadPartyCharacters(partyIds: string[]) {
    // Load character sheets for all party members
    for (const characterId of partyIds) {
      if (!this.partyCharacters.has(characterId)) {
        try {
          const sheet = await this.characterApi.loadCharacter(characterId);
          if (sheet) {
            // Ensure currency is initialized (for older character sheets)
            if (!sheet.currency) {
              sheet.currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
            }
            this.partyCharacters.set(characterId, sheet);
            // Join the character's socket room to receive real-time updates
            this.characterSocket.joinCharacter(characterId);

            // Auto-assign world to character if it doesn't match
            if (sheet.worldName !== this.worldName) {
              try {
                await this.characterApi.patchCharacter(characterId, {
                  path: 'worldName',
                  value: this.worldName
                });
                console.log(`Auto-assigned world ${this.worldName} to character ${characterId}`);
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

    // Remove characters that are no longer in the party
    const currentPartyIds = new Set(partyIds);
    for (const characterId of this.partyCharacters.keys()) {
      if (!currentPartyIds.has(characterId)) {
        this.partyCharacters.delete(characterId);
        // Note: We don't have a "leave" method, but the socket will handle it
      }
    }

    // Trigger change detection after loading characters
    this.updateCharacterPortraits();
    this.cdr.detectChanges();
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

  // Character management
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

      // Also remove from party if present
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

  // Party management
  async addToParty() {
    if (!this.selectedCharacterForParty) return;

    const world = this.store.worldValue;
    if (world && !world.partyIds.includes(this.selectedCharacterForParty)) {
      // Update world to include character in party
      this.store.applyPatch({
        path: 'partyIds',
        value: [...world.partyIds, this.selectedCharacterForParty]
      });

      // Update character's worldName so they auto-join the world room
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

  // Item library management
  openItemCreator() {
    this.showItemCreator = true;
  }

  closeItemCreator() {
    this.showItemCreator = false;
  }

  createItem(item: ItemBlock) {
    console.log('Creating item:', item);
    const world = this.store.worldValue;
    if (world) {
      this.store.applyPatch({
        path: 'itemLibrary',
        value: [...world.itemLibrary, item]
      });
    }
    this.closeItemCreator();
  }

  generateRandomWeapon() {
    // Generiert eine Waffe (Level 5 als Beispiel)
    const world = this.store.worldValue;
    if (!world) return;
    const weapon = this.weaponGenerator.generateWeapon(5);
    this.store.applyPatch({
      path: 'itemLibrary',
      value: [...world.itemLibrary, weapon]
    });
  }

  generateRandomArmor() {
    // Generiert eine Rüstung (Level 5 als Beispiel)
    const world = this.store.worldValue;
    if (!world) return;
    const armor = this.weaponGenerator.generateArmor(5);
    this.store.applyPatch({
      path: 'itemLibrary',
      value: [...world.itemLibrary, armor]
    });
  }

  updateItem(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `itemLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeItem(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const item = world.itemLibrary[index];
      const newItems = [...world.itemLibrary];
      newItems.splice(index, 1);

      // Add to trash
      const newTrash = [...(world.trash || []), {
        type: 'item' as const,
        data: item,
        deletedAt: Date.now()
      }];

      this.store.applyPatch({
        path: 'itemLibrary',
        value: newItems
      });
      this.store.applyPatch({
        path: 'trash',
        value: newTrash
      });

      // Update editing state: remove the deleted item and shift indices
      const newSet = new Set<number>();
      this.editingItems.forEach(i => {
        if (i < index) {
          newSet.add(i);
        } else if (i > index) {
          newSet.add(i - 1);
        }
      });
      this.editingItems = newSet;
    }
  }

  onItemEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    const newSet = new Set(this.editingItems);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingItems = newSet;
  }

  isItemEditing(index: number): boolean {
    return this.editingItems.has(index);
  }

  onRuneEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    const newSet = new Set(this.editingRunes);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingRunes = newSet;
  }

  isRuneEditing(index: number): boolean {
    return this.editingRunes.has(index);
  }

  onSpellEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    const newSet = new Set(this.editingSpells);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingSpells = newSet;
  }

  isSpellEditing(index: number): boolean {
    return this.editingSpells.has(index);
  }

  // TrackBy function to prevent component recreation
  trackByIndex(index: number): number {
    return index;
  }

  // Rune library management
  addRune() {
    const world = this.store.worldValue;
    if (world) {
      const newRune: RuneBlock = {
        name: 'New Rune',
        description: '',
        drawing: '',
        tags: []
      };
      this.store.applyPatch({
        path: 'runeLibrary',
        value: [...world.runeLibrary, newRune]
      });
    }
  }

  updateRune(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `runeLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeRune(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const rune = world.runeLibrary[index];
      const newRunes = [...world.runeLibrary];
      newRunes.splice(index, 1);

      // Add to trash
      const newTrash = [...(world.trash || []), {
        type: 'rune' as const,
        data: rune,
        deletedAt: Date.now()
      }];

      this.store.applyPatch({
        path: 'runeLibrary',
        value: newRunes
      });
      this.store.applyPatch({
        path: 'trash',
        value: newTrash
      });

      // Update editing state: remove the deleted rune and shift indices
      const newSet = new Set<number>();
      this.editingRunes.forEach(i => {
        if (i < index) {
          newSet.add(i);
        } else if (i > index) {
          newSet.add(i - 1);
        }
      });
      this.editingRunes = newSet;
    }
  }

  // Spell library management
  addSpell() {
    const world = this.store.worldValue;
    if (world) {
      const newSpell: SpellBlock = {
        name: 'New Spell',
        description: '',
        drawing: '',
        tags: [],
        binding: { type: 'learned' }
      };
      this.store.applyPatch({
        path: 'spellLibrary',
        value: [...world.spellLibrary, newSpell]
      });
    }
  }

  updateSpell(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `spellLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeSpell(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const spell = world.spellLibrary[index];
      const newSpells = [...world.spellLibrary];
      newSpells.splice(index, 1);

      // Add to trash
      const newTrash = [...(world.trash || []), {
        type: 'spell' as const,
        data: spell,
        deletedAt: Date.now()
      }];

      this.store.applyPatch({
        path: 'spellLibrary',
        value: newSpells
      });
      this.store.applyPatch({
        path: 'trash',
        value: newTrash
      });
    }
  }

  // Skill library management
  addSkill() {
    const world = this.store.worldValue;
    if (world) {
      const newSkill = new SkillBlock();
      newSkill.name = 'New Skill';
      newSkill.description = '';
      newSkill.type = 'passive';
      newSkill.class = '';
      newSkill.enlightened = false;
      this.store.applyPatch({
        path: 'skillLibrary',
        value: [...world.skillLibrary, newSkill]
      });
    }
  }

  updateSkill(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `skillLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeSkill(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const skill = world.skillLibrary[index];
      const newSkills = [...world.skillLibrary];
      newSkills.splice(index, 1);

      // Add to trash
      const newTrash = [...(world.trash || []), {
        type: 'skill' as const,
        data: skill,
        deletedAt: Date.now()
      }];

      this.store.applyPatch({
        path: 'skillLibrary',
        value: newSkills
      });
      this.store.applyPatch({
        path: 'trash',
        value: newTrash
      });
    }
  }

  onSkillEditingChange({ index, isEditing }: { index: number; isEditing: boolean }) {
    const newSet = new Set(this.editingSkills);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingSkills = newSet;
  }

  // Drag and drop functionality
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

    // Update auto-scroll based on mouse position
    this.updateAutoScroll(event.clientY);
  }

  private startAutoScroll() {
    if (this.dragScrollInterval) {
      clearInterval(this.dragScrollInterval);
    }

    this.dragScrollInterval = window.setInterval(() => {
      if (!this.isDragging) {
        this.stopAutoScroll();
      }
    }, 16); // ~60fps
  }

  private updateAutoScroll(mouseY: number) {
    const scrollSpeed = 10;
    const scrollThreshold = 100; // pixels from edge

    const viewportHeight = window.innerHeight;

    if (mouseY < scrollThreshold) {
      // Scroll up
      window.scrollBy(0, -scrollSpeed);
    } else if (mouseY > viewportHeight - scrollThreshold) {
      // Scroll down
      window.scrollBy(0, scrollSpeed);
    }
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
        // Unpack bundle directly to character
        this.characterApi.loadCharacter(characterId).then(freshSheet => {
          if (!freshSheet) return;
          // We need to send multiple patches or one big update. 
          // For simplicity, we'll iterate and send patches.
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
      case 'item':
        lootData = world.itemLibrary[index];
        break;
      case 'rune':
        lootData = world.runeLibrary[index];
        break;
      case 'spell':
        lootData = world.spellLibrary[index];
        break;
      case 'skill':
        lootData = world.skillLibrary[index];
        break;
    }

    if (lootData) {
      // Reload the character to get the latest data
      this.characterApi.loadCharacter(characterId).then(freshSheet => {
        if (!freshSheet) {
          console.error(`Failed to reload character ${characterId}`);
          return;
        }

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
        if (!freshSheet.inventory) freshSheet.inventory = [];
        currentArray = freshSheet.inventory;
        break;
      case 'rune':
        fieldPath = 'runes';
        if (!freshSheet.runes) freshSheet.runes = [];
        currentArray = freshSheet.runes;
        break;
      case 'spell':
        fieldPath = 'spells';
        if (!freshSheet.spells) freshSheet.spells = [];
        currentArray = freshSheet.spells;
        break;
      case 'skill':
        fieldPath = 'skills';
        if (!freshSheet.skills) freshSheet.skills = [];
        currentArray = freshSheet.skills;
        break;
    }

    const newItem = { ...lootData };
    currentArray.push(newItem);

    const patch: JsonPatch = {
      path: fieldPath,
      value: currentArray
    };

    this.characterSocket.sendPatch(characterId, patch);
    this.sendDirectLootNotification(characterId, type, lootData);
    
    // Note: We don't update local partyCharacters map here because the socket patch event will do it
  }

  private sendDirectLootNotification(characterId: string, type: 'item' | 'rune' | 'spell' | 'skill', data: any) {
    // Create a loot item for the notification
    const lootItem = {
      id: `direct_${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      claimedBy: []
    };

    // Send via world socket to trigger notification on player's screen
    this.worldSocket.sendDirectLoot(characterId, lootItem);
  }

  // Event handler for bundle creation from LootManager
  onBundleCreated(bundle: LootBundle) {
    const world = this.store.worldValue;
    if (world) {
      const currentBundles = (world as any).lootBundleLibrary || [];
      const existingIndex = currentBundles.findIndex((b: LootBundle) => b.name === bundle.name);
      
      let newBundles;
      if (existingIndex >= 0) {
        newBundles = [...currentBundles];
        newBundles[existingIndex] = bundle;
      } else {
        newBundles = [...currentBundles, bundle];
      }

      this.store.applyPatch({
        path: 'lootBundleLibrary',
        value: newBundles
      });
    }
  }

  onBundleDeleted(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const currentBundles = (world as any).lootBundleLibrary || [];
      const newBundles = [...currentBundles];
      newBundles.splice(index, 1);
      this.store.applyPatch({
        path: 'lootBundleLibrary',
        value: newBundles
      });
    }
  }

  // Apply JSON patch to character sheet (for real-time updates)
  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.startsWith('/') ? patch.path.substring(1).split('/') : patch.path.split('.');
    let current = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);

      // Check if it's an array index
      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = current[key] ??= {};
      }
    }

    const finalKey = keys[keys.length - 1];
    const finalIndex = parseInt(finalKey, 10);

    // Handle final key - could also be an array index
    if (!isNaN(finalIndex) && Array.isArray(current)) {
      current[finalIndex] = patch.value;
    } else {
      current[finalKey] = patch.value;
    }
  }

  // Battle tracker methods
  private calculateSpeed(character: CharacterSheet): number {
    const speedStat = character.speed;
    if (!speedStat) return 10;
    // Formula: base + bonus + (level / gain)
    const calculated = speedStat.base + speedStat.bonus + (character.level / (speedStat.gain || 1));
    return Math.floor(calculated) || 10;
  }

  get availableCharactersForBattle() {
    return this.getPartyCharacterArray().map(member => ({
      id: member.id,
      name: member.sheet.name || member.id,
      speed: this.calculateSpeed(member.sheet)
    }));
  }

  addToBattle(characterId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const character = this.partyCharacters.get(characterId);
    if (!character) return;

    const speed = this.calculateSpeed(character);

    // Place at the end of the current queue
    const maxTurn = world.battleParticipants.length > 0
      ? Math.max(...world.battleParticipants.map(p => p.nextTurnAt))
      : 0;

    const newParticipant: BattleParticipant = {
      characterId,
      name: character.name || characterId,
      speed,
      turnFrequency: speed,
      nextTurnAt: maxTurn + 10,
      // NOTE: portrait removed to avoid socket disconnect with large images
      // Battle tracker will fetch portrait from character data using characterId
      team: 'blue' // Default team color
    };

    const updatedParticipants = [...world.battleParticipants, newParticipant];

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  removeFromBattle(characterId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const updatedParticipants = world.battleParticipants.filter(
      (p: BattleParticipant) => p.characterId !== characterId
    );

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  advanceTurn() {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) {
      console.log('[TURN DEBUG] No world or no participants');
      return;
    }

    // Use the battle queue to identify the first group (which handles all grouping logic)
    const queue = this.battleQueue;
    if (queue.length === 0) return;

    const firstGroup = queue[0];
    const groupIds = new Set(firstGroup.turns.map(t => t.characterId));

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;

      if (groupIds.has(p.characterId)) {
        // Advance all participants in the current group by their speed interval
        return {
          ...p,
          speed: freshSpeed,
          nextTurnAt: p.nextTurnAt + (1000 / freshSpeed)
        };
      }
      return {
        ...p,
        speed: freshSpeed
      };
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  resetBattle() {
    const world = this.store.worldValue;
    if (!world) return;

    // Reset all participants' nextTurnAt to 0 and refresh speeds
    const resetParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      return {
        ...p,
        speed: freshSpeed,
        nextTurnAt: 0
      };
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(resetParticipants)
    });
  }

  // Refresh speeds for all battle participants (call when character stats change)
  refreshBattleSpeeds() {
    const world = this.store.worldValue;
    if (!world) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      return {
        ...p,
        speed: freshSpeed
      };
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  // Sync one character's turn with another (for manual turn synchronization)
  syncTurns(sourceId: string, targetId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const targetParticipant = world.battleParticipants.find(p => p.characterId === targetId);
    if (!targetParticipant) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      if (p.characterId === sourceId) {
        return {
          ...p,
          nextTurnAt: targetParticipant.nextTurnAt
        };
      }
      return p;
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  // Set a character's position in the turn queue (manual priority override)
  setTurnOrder(characterId: string, position: number) {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) return;

    // Calculate the turn queue to know what nextTurnAt values exist
    const queue: BattleParticipant[] = [];
    const participants = world.battleParticipants.map(p => ({ ...p }));

    for (let i = 0; i < 10; i++) {
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];
      queue.push({ ...next });
      next.nextTurnAt = next.nextTurnAt + (1000 / next.speed);
    }

    // Get the nextTurnAt value at the desired position
    const targetTurnAt = queue[position]?.nextTurnAt;
    if (targetTurnAt === undefined) return;

    // Set the character's nextTurnAt to match that position
    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      if (p.characterId === characterId) {
        return {
          ...p,
          nextTurnAt: targetTurnAt
        };
      }
      return p;
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  // Change a participant's team and recalculate grouping
  changeParticipantTeam(characterId: string, team: string) {
    const world = this.store.worldValue;
    if (!world) return;

    // Sort by current turn order
    const sorted = [...world.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);

    // Find the index of the character being changed
    const charIndex = sorted.findIndex(p => p.characterId === characterId);
    if (charIndex === -1) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => 
      p.characterId === characterId ? { ...p, team } : p
    );

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  // Reorder participants by moving one to a new position
  // This represents a "pass turn" - the character's turn is moved to the new position
  // All earlier turns of this character are removed from the queue
  reorderParticipants(characterId: string, newIndex: number) {
    const world = this.store.worldValue;
    if (!world) return;

    // Use the projected queue to determine the time at the new index
    const queue = this.battleQueue;
    if (queue.length === 0) return;

    console.log('[REORDER DEBUG] Character:', characterId, 'New index:', newIndex);
    console.log('[REORDER DEBUG] Queue length:', queue.length);
    console.log('[REORDER DEBUG] Queue:', queue.map((g, i) => ({
      index: i,
      team: g.team,
      startTime: g.startTime
    })));

    let newNextTurnAt: number;

    if (newIndex <= 0) {
      newNextTurnAt = queue[0].startTime - 10;
      console.log('[REORDER DEBUG] Placing before first, time:', newNextTurnAt);
    } else if (newIndex >= queue.length) {
      newNextTurnAt = queue[queue.length - 1].startTime + 10;
      console.log('[REORDER DEBUG] Placing after last, time:', newNextTurnAt);
    } else {
      const prev = queue[newIndex - 1];
      const next = queue[newIndex];
      newNextTurnAt = (prev.startTime + next.startTime) / 2;
      console.log('[REORDER DEBUG] Placing between', prev.startTime, 'and', next.startTime, '=', newNextTurnAt);
    }

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      if (p.characterId === characterId) {
        console.log('[REORDER DEBUG] Updating anchor from', p.nextTurnAt, 'to', newNextTurnAt);
        return { ...p, nextTurnAt: newNextTurnAt };
      }
      return p;
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: this.applyAdjacencyGrouping(updatedParticipants)
    });
  }

  // Helper to group adjacent same-team participants by syncing their nextTurnAt
  private applyAdjacencyGrouping(participants: BattleParticipant[]): BattleParticipant[] {
    if (participants.length === 0) return participants;

    // Don't apply grouping at all - it was causing issues where dragging
    // would get overridden by grouping logic
    // Users can manually group characters by setting the same time if desired
    console.log('[ADJACENCY DEBUG] Skipping adjacency grouping - returning participants as-is');
    return participants;
  }

  // Generates the projected battle queue with proper grouping
  get battleQueue(): BattleGroup[] {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) return [];

    // 1. Generate flat list of simulated turns
    const turns: SimulatedTurn[] = [];
    const participants = world.battleParticipants.map(p => ({
      ...p,
      currentTurnAt: p.nextTurnAt,
      // Ensure speed is up to date
      speed: this.partyCharacters.get(p.characterId) 
        ? this.calculateSpeed(this.partyCharacters.get(p.characterId)!) 
        : p.speed
    }));

    // Simulate 50 turns into the future
    for (let step = 0; step < 50; step++) {
      // Sort by time
      participants.sort((a, b) => a.currentTurnAt - b.currentTurnAt);
      
      const next = participants[0];
      
      // Check if this is the "anchor" (the actual next turn stored in DB)
      const original = world.battleParticipants.find(p => p.characterId === next.characterId);
      const isAnchor = original ? Math.abs(original.nextTurnAt - next.currentTurnAt) < 0.001 : false;

      turns.push({
        characterId: next.characterId,
        name: next.name,
        team: next.team || 'blue',
        time: next.currentTurnAt,
        isAnchor,
        speed: next.speed
      });

      // Advance this participant in the simulation
      next.currentTurnAt += (1000 / next.speed);
    }

    // 2. Group adjacent same-team turns
    const groups: BattleGroup[] = [];
    if (turns.length === 0) return [];

    let currentGroup: BattleGroup = {
      turns: [turns[0]],
      team: turns[0].team,
      startTime: turns[0].time
    };
    let membersInGroup = new Set<string>([turns[0].characterId]);

    for (let i = 1; i < turns.length; i++) {
      const turn = turns[i];
      
      // Check if can join group: Same team AND not already in group
      if (turn.team === currentGroup.team && !membersInGroup.has(turn.characterId)) {
        currentGroup.turns.push(turn);
        membersInGroup.add(turn.characterId);
      } else {
        // Finalize current group
        groups.push(currentGroup);
        
        // Start new group
        currentGroup = {
          turns: [turn],
          team: turn.team,
          startTime: turn.time
        };
        membersInGroup = new Set([turn.characterId]);
      }
    }
    groups.push(currentGroup);

    return groups;
  }

  // Trash management
  showTrash = false;

  openTrash() {
    this.showTrash = true;
  }

  closeTrash() {
    this.showTrash = false;
  }

  restoreFromTrash(index: number) {
    const world = this.store.worldValue;
    if (!world || !world.trash) return;

    const trashItem = world.trash[index];
    const newTrash = [...world.trash];
    newTrash.splice(index, 1);

    // Restore to appropriate library
    switch (trashItem.type) {
      case 'item':
        this.store.applyPatch({
          path: 'itemLibrary',
          value: [...world.itemLibrary, trashItem.data]
        });
        break;
      case 'rune':
        this.store.applyPatch({
          path: 'runeLibrary',
          value: [...world.runeLibrary, trashItem.data]
        });
        break;
      case 'spell':
        this.store.applyPatch({
          path: 'spellLibrary',
          value: [...world.spellLibrary, trashItem.data]
        });
        break;
      case 'skill':
        this.store.applyPatch({
          path: 'skillLibrary',
          value: [...world.skillLibrary, trashItem.data]
        });
        break;
    }

    // Update trash
    this.store.applyPatch({
      path: 'trash',
      value: newTrash
    });
  }

  permanentlyDelete(index: number) {
    const world = this.store.worldValue;
    if (!world || !world.trash) return;

    const newTrash = [...world.trash];
    newTrash.splice(index, 1);

    this.store.applyPatch({
      path: 'trash',
      value: newTrash
    });
  }

  emptyTrash() {
    this.store.applyPatch({
      path: 'trash',
      value: []
    });
  }
}