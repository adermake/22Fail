import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldStoreService } from '../../services/world-store.service';
import { CharacterApiService } from '../../services/character-api.service';
import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-world',
  imports: [CommonModule, CardComponent, FormsModule],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements OnInit {
  worldName: string = '';
  store = inject(WorldStoreService);
  characterApi = inject(CharacterApiService);

  newCharacterId: string = '';
  selectedCharacterForParty: string = '';
  partyCharacters: Map<string, CharacterSheet> = new Map();

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.worldName = params['worldName'];
      console.log('Loading world:', this.worldName);
      this.store.load(this.worldName);
    });

    // Subscribe to world changes to load party character sheets
    this.store.world$.subscribe(world => {
      if (world) {
        this.loadPartyCharacters(world.partyIds);
      }
    });
  }

  async loadPartyCharacters(partyIds: string[]) {
    // Load character sheets for all party members
    for (const characterId of partyIds) {
      if (!this.partyCharacters.has(characterId)) {
        try {
          const sheet = await this.characterApi.loadCharacter(characterId);
          if (sheet) {
            this.partyCharacters.set(characterId, sheet);
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
}