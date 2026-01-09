import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldStoreService } from '../../services/world-store.service';
import { CharacterApiService } from '../../services/character-api.service';
import { CharacterSocketService, CharacterPatchEvent } from '../../services/character-socket.service';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-world',
  imports: [CommonModule, CardComponent, FormsModule],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements OnInit, OnDestroy {
  worldName: string = '';
  store = inject(WorldStoreService);
  characterApi = inject(CharacterApiService);
  characterSocket = inject(CharacterSocketService);
  cdr = inject(ChangeDetectorRef);

  newCharacterId: string = '';
  selectedCharacterForParty: string = '';
  partyCharacters: Map<string, CharacterSheet> = new Map();
  private characterPatchSubscription?: Subscription;

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
  addToParty() {
    if (!this.selectedCharacterForParty) return;

    const world = this.store.worldValue;
    if (world && !world.partyIds.includes(this.selectedCharacterForParty)) {
      this.store.applyPatch({
        path: 'partyIds',
        value: [...world.partyIds, this.selectedCharacterForParty]
      });
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
  addItem() {
    const world = this.store.worldValue;
    if (world) {
      const newItem: ItemBlock = {
        name: 'New Item',
        description: '',
        weight: 0,
        lost: false,
        requirements: {}
      };
      this.store.applyPatch({
        path: 'itemLibrary',
        value: [...world.itemLibrary, newItem]
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

  // Drag and drop functionality
  onDragStart(event: DragEvent, type: 'item' | 'rune' | 'spell', index: number) {
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('lootType', type);
    event.dataTransfer!.setData('lootIndex', index.toString());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDropOnCharacter(event: DragEvent, characterId: string) {
    event.preventDefault();
    const type = event.dataTransfer!.getData('lootType') as 'item' | 'rune' | 'spell';
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
    }

    if (lootData) {
      // Send loot to specific character via WebSocket
      console.log(`Giving ${type} to ${characterId}:`, lootData);
      // TODO: Implement server-side loot notification
    }
  }

  onDropOnBattleLoot(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer!.getData('lootType') as 'item' | 'rune' | 'spell';
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
    }

    if (lootData) {
      // Add to battle loot
      const newLootItem = {
        id: `${type}_${Date.now()}_${Math.random()}`,
        type,
        data: lootData,
        claimedBy: []
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
}