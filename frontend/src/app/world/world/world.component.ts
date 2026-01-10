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

@Component({
  selector: 'app-world',
  imports: [CommonModule, CardComponent, FormsModule, ItemCreatorComponent, LibraryTabsComponent, BattleTracker],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements OnInit, OnDestroy {
  worldName: string = '';
  store = inject(WorldStoreService);
  worldSocket = inject(WorldSocketService);
  characterApi = inject(CharacterApiService);
  characterSocket = inject(CharacterSocketService);
  cdr = inject(ChangeDetectorRef);

  newCharacterId: string = '';
  selectedCharacterForParty: string = '';
  partyCharacters: Map<string, CharacterSheet> = new Map();
  private characterPatchSubscription?: Subscription;

  // Dummy sheet for item/spell components that require it
  dummySheet: CharacterSheet = createEmptySheet();

  // Item creator dialog
  showItemCreator = false;

  // Track which items/runes/spells/skills are being edited (to disable dragging)
  editingItems = new Set<number>();
  editingRunes = new Set<number>();
  editingSpells = new Set<number>();
  editingSkills = new Set<number>();

  // Currency reward form
  newCurrencyReward = {
    copper: 0,
    silver: 0,
    gold: 0,
    platinum: 0
  };

  // Auto-scroll while dragging
  private dragScrollInterval?: number;
  private isDragging = false;

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
    this.cdr.detectChanges();
  }

  getPartyCharacterArray(): Array<{id: string, sheet: CharacterSheet}> {
    return Array.from(this.partyCharacters.entries()).map(([id, sheet]) => ({id, sheet}));
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

  updateItem(index: number, patch: JsonPatch) {
    const world = this.store.worldValue;
    if (world) {
      const updatedItems = [...world.itemLibrary];
      const item = { ...updatedItems[index] };

      // Apply the patch to the item - handle nested objects properly
      const keys = patch.path.split('.');
      let current: any = item;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        // Create a copy of nested objects to avoid mutation
        if (current[key] && typeof current[key] === 'object' && !Array.isArray(current[key])) {
          current[key] = { ...current[key] };
        } else if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }

      const finalKey = keys[keys.length - 1];
      current[finalKey] = patch.value;

      updatedItems[index] = item;
      this.store.applyPatch({
        path: 'itemLibrary',
        value: updatedItems
      });
    }
  }

  removeItem(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newItems = [...world.itemLibrary];
      newItems.splice(index, 1);
      this.store.applyPatch({
        path: 'itemLibrary',
        value: newItems
      });
    }
  }

  onItemEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingItems.add(index);
    } else {
      this.editingItems.delete(index);
    }
  }

  isItemEditing(index: number): boolean {
    return this.editingItems.has(index);
  }

  onRuneEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingRunes.add(index);
    } else {
      this.editingRunes.delete(index);
    }
  }

  isRuneEditing(index: number): boolean {
    return this.editingRunes.has(index);
  }

  onSpellEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingSpells.add(index);
    } else {
      this.editingSpells.delete(index);
    }
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
    const world = this.store.worldValue;
    if (world) {
      const updatedRunes = [...world.runeLibrary];
      const rune = { ...updatedRunes[index] };

      // Apply the patch to the rune
      const keys = patch.path.split('.');
      let current: any = rune;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = patch.value;

      updatedRunes[index] = rune;
      this.store.applyPatch({
        path: 'runeLibrary',
        value: updatedRunes
      });
    }
  }

  removeRune(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newRunes = [...world.runeLibrary];
      newRunes.splice(index, 1);
      this.store.applyPatch({
        path: 'runeLibrary',
        value: newRunes
      });
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
    const world = this.store.worldValue;
    if (world) {
      const updatedSpells = [...world.spellLibrary];
      const spell = { ...updatedSpells[index] };

      // Apply the patch to the spell
      const keys = patch.path.split('.');
      let current: any = spell;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = patch.value;

      updatedSpells[index] = spell;
      this.store.applyPatch({
        path: 'spellLibrary',
        value: updatedSpells
      });
    }
  }

  removeSpell(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newSpells = [...world.spellLibrary];
      newSpells.splice(index, 1);
      this.store.applyPatch({
        path: 'spellLibrary',
        value: newSpells
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
    const world = this.store.worldValue;
    if (world) {
      const updatedSkills = [...world.skillLibrary];
      const skill = { ...updatedSkills[index] };

      // Apply the patch to the skill
      const keys = patch.path.split('.');
      let current: any = skill;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = patch.value;

      updatedSkills[index] = skill;
      this.store.applyPatch({
        path: 'skillLibrary',
        value: updatedSkills
      });
    }
  }

  removeSkill(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newSkills = [...world.skillLibrary];
      newSkills.splice(index, 1);
      this.store.applyPatch({
        path: 'skillLibrary',
        value: newSkills
      });
    }
  }

  onSkillEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingSkills.add(index);
    } else {
      this.editingSkills.delete(index);
    }
  }

  // Battle loot management
  removeBattleLoot(index: number) {
    const world = this.store.worldValue;
    if (world) {
      const newLoot = [...world.battleLoot];
      newLoot.splice(index, 1);
      this.store.applyPatch({
        path: 'battleLoot',
        value: newLoot
      });
    }
  }

  revealBattleLoot() {
    const world = this.store.worldValue;
    if (world && world.battleLoot.length > 0) {
      console.log('Revealing battle loot to party:', world.battleLoot);
      this.store.revealBattleLoot();
    }
  }

  addCurrencyReward() {
    const world = this.store.worldValue;
    if (!world) return;

    // Check if any currency value is greater than 0
    const hasValue = this.newCurrencyReward.copper > 0 ||
                     this.newCurrencyReward.silver > 0 ||
                     this.newCurrencyReward.gold > 0 ||
                     this.newCurrencyReward.platinum > 0;

    if (!hasValue) {
      alert('Please enter at least one currency value greater than 0');
      return;
    }

    const currencyLoot = {
      id: `currency_${Date.now()}_${Math.random()}`,
      type: 'currency' as const,
      data: { ...this.newCurrencyReward },
      claimedBy: [],
      recipientIds: world.partyIds // Default to all party members
    };

    this.store.applyPatch({
      path: 'battleLoot',
      value: [...world.battleLoot, currencyLoot]
    });

    // Reset form
    this.newCurrencyReward = {
      copper: 0,
      silver: 0,
      gold: 0,
      platinum: 0
    };
  }

  isRecipient(loot: any, characterId: string): boolean {
    // If recipientIds is not set or empty, everyone receives it
    if (!loot.recipientIds || loot.recipientIds.length === 0) {
      return true;
    }
    return loot.recipientIds.includes(characterId);
  }

  toggleRecipient(lootIndex: number, characterId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const loot = world.battleLoot[lootIndex];
    let recipientIds = loot.recipientIds || [];

    // If recipientIds was empty (meaning "all"), initialize it with all party members
    if (recipientIds.length === 0) {
      recipientIds = [...world.partyIds];
    }

    // Toggle this character
    if (recipientIds.includes(characterId)) {
      recipientIds = recipientIds.filter(id => id !== characterId);
    } else {
      recipientIds = [...recipientIds, characterId];
    }

    // Update the loot item
    const updatedLoot = [...world.battleLoot];
    updatedLoot[lootIndex] = {
      ...loot,
      recipientIds
    };

    this.store.applyPatch({
      path: 'battleLoot',
      value: updatedLoot
    });
  }

  // Drag and drop functionality
  onDragStart(event: DragEvent, type: 'item' | 'rune' | 'spell' | 'skill', index: number) {
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

    const type = event.dataTransfer!.getData('lootType') as 'item' | 'rune' | 'spell' | 'skill';
    const index = parseInt(event.dataTransfer!.getData('lootIndex'));

    const world = this.store.worldValue;
    if (!world) return;

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

        // Determine which field to update based on type
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

        // Create a copy of the loot data to add to the character
        const newItem = { ...lootData };

        // Send patch to add the item to the character's inventory
        const patch: JsonPatch = {
          path: fieldPath,
          value: [...currentArray, newItem]
        };

        console.log(`Giving ${type} to ${characterId}:`, lootData);
        this.characterSocket.sendPatch(characterId, patch);

        // Send notification to the player
        this.sendDirectLootNotification(characterId, type, lootData);

        // Update our local copy
        this.partyCharacters.set(characterId, freshSheet);
      });
    }
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

  onDropOnBattleLoot(event: DragEvent) {
    event.preventDefault();
    this.stopAutoScroll();

    const type = event.dataTransfer!.getData('lootType') as 'item' | 'rune' | 'spell' | 'skill';
    const index = parseInt(event.dataTransfer!.getData('lootIndex'));

    const world = this.store.worldValue;
    if (!world) return;

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
      // Add to battle loot
      const newLootItem = {
        id: `${type}_${Date.now()}_${Math.random()}`,
        type,
        data: lootData,
        claimedBy: [],
        recipientIds: world.partyIds // Default to all party members
      };

      this.store.applyPatch({
        path: 'battleLoot',
        value: [...world.battleLoot, newLootItem]
      });
    }
  }

  // Apply JSON patch to character sheet (for real-time updates)
  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.split('.');
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

    // Stagger initial nextTurnAt to avoid ties
    // Add a small offset based on current participant count
    const offset = world.battleParticipants.length * 0.1;

    const newParticipant: BattleParticipant = {
      characterId,
      name: character.name || characterId,
      speed,
      turnFrequency: speed,
      nextTurnAt: offset,
      portrait: character.portrait,
      team: 'blue' // Default team color
    };

    this.store.applyPatch({
      path: 'battleParticipants',
      value: [...world.battleParticipants, newParticipant]
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
      value: updatedParticipants
    });
  }

  advanceTurn() {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) return;

    // Sort by nextTurnAt to find who goes next
    const sorted = [...world.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
    const currentTurnAt = sorted[0].nextTurnAt;

    // Find all participants in the current group (same nextTurnAt within threshold and same team)
    const currentGroup = sorted.filter(p =>
      Math.abs(p.nextTurnAt - currentTurnAt) < 0.01 && p.team === sorted[0].team
    );
    const currentGroupIds = new Set(currentGroup.map(p => p.characterId));

    // Update participants with fresh speed calculations and advance current group
    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;

      if (currentGroupIds.has(p.characterId)) {
        // Advance all participants in the current group
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
      value: updatedParticipants
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
      value: resetParticipants
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
      value: updatedParticipants
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
      value: updatedParticipants
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
      value: updatedParticipants
    });
  }

  // Change a participant's team and auto-sync with adjacent DIFFERENT same-team members
  changeParticipantTeam(characterId: string, team: string) {
    const world = this.store.worldValue;
    if (!world) return;

    // Sort by current turn order
    const sorted = [...world.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);

    // Find the index of the character being changed
    const charIndex = sorted.findIndex(p => p.characterId === characterId);
    if (charIndex === -1) return;

    // Update team
    sorted[charIndex] = { ...sorted[charIndex], team };

    // Auto-sync with adjacent same-team DIFFERENT character members
    // Look backward for same team with different character
    let syncTurnAt = sorted[charIndex].nextTurnAt;
    for (let i = charIndex - 1; i >= 0; i--) {
      if (sorted[i].team === team && sorted[i].characterId !== characterId) {
        // Found adjacent same-team DIFFERENT character, sync to their time
        syncTurnAt = sorted[i].nextTurnAt;
        break;
      } else if (sorted[i].team !== team) {
        // Different team, stop looking
        break;
      }
      // Same character, continue looking
    }

    // Look forward for same team with different characters and sync them all to the earliest time
    for (let i = charIndex; i < sorted.length; i++) {
      if (sorted[i].team === team && sorted[i].characterId !== characterId) {
        sorted[i] = { ...sorted[i], nextTurnAt: syncTurnAt };
      } else if (sorted[i].team !== team) {
        // Different team, stop looking
        break;
      }
      // Same character gets synced too if it's the character we're changing
      if (sorted[i].characterId === characterId) {
        sorted[i] = { ...sorted[i], nextTurnAt: syncTurnAt };
      }
    }

    this.store.applyPatch({
      path: 'battleParticipants',
      value: sorted
    });
  }

  // Reorder participants by moving one to a new position and auto-group same team
  reorderParticipants(characterId: string, newIndex: number) {
    const world = this.store.worldValue;
    if (!world) return;

    // Sort current participants by nextTurnAt
    const sorted = [...world.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);

    // Find the participant being moved
    const movingParticipant = sorted.find(p => p.characterId === characterId);
    if (!movingParticipant) return;

    // Remove from current position
    const filtered = sorted.filter(p => p.characterId !== characterId);

    // Insert at new position
    filtered.splice(newIndex, 0, movingParticipant);

    // NEW LOGIC: Queue is fixed up to the drop point, then calculated from there
    const reordered: BattleParticipant[] = [];
    let currentTime = 0;

    for (let i = 0; i < filtered.length; i++) {
      const current = filtered[i];

      if (i <= newIndex) {
        // FIXED PART: Up to and including the drop point
        // Check if previous participant is DIFFERENT and has same team
        if (i > 0 &&
            reordered[i - 1].team === current.team &&
            reordered[i - 1].characterId !== current.characterId) {
          // Same team as previous AND different character, use same time (group turn)
          reordered.push({ ...current, nextTurnAt: reordered[i - 1].nextTurnAt });
        } else {
          // Different team or same character or first participant, use new time
          reordered.push({ ...current, nextTurnAt: currentTime });
          currentTime += 10;
        }
      } else {
        // CALCULATED PART: After the drop point, continue the sequence
        // Check if previous participant is DIFFERENT and has same team
        if (reordered[i - 1].team === current.team &&
            reordered[i - 1].characterId !== current.characterId) {
          // Same team as previous AND different character, use same time (group turn)
          reordered.push({ ...current, nextTurnAt: reordered[i - 1].nextTurnAt });
        } else {
          // Different team or same character, use new time
          reordered.push({ ...current, nextTurnAt: currentTime });
          currentTime += 10;
        }
      }
    }

    this.store.applyPatch({
      path: 'battleParticipants',
      value: reordered
    });
  }
}