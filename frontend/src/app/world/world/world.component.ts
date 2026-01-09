import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldApiService } from '../../services/world-api.service';
import { FormulaType } from '../../model/formula-type.enum';
import { CurrentstatComponent } from '../../sheet/currentstat/currentstat.component';
import { ItemCreatorComponent } from '../../sheet/item-creator/item-creator.component';
import { WorldStoreService } from '../../services/world-store.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CharacterSocketService } from '../../services/character-socket.service';


interface WorldData {
  characters: string[];
  party: string[];
  library: { items: any[]; runes: any[]; spells: any[] };
  battleLoot: any[];
}

@Component({
  selector: 'app-world',
  imports: [CommonModule, FormsModule, CardComponent, CurrentstatComponent, ItemCreatorComponent, DragDropModule],
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css'],
})
export class WorldComponent implements OnInit {
  worldName: string = '';
  world: WorldData | null = null;
  allCharacters: Record<string, any> = {};

  newCharacterId = '';
  newItemName = '';
  showCreateItem = false;
  FormulaType = FormulaType;

  constructor(
    private route: ActivatedRoute,
    private api: WorldApiService,
    private store: WorldStoreService,
    private charSocket: CharacterSocketService,
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.worldName = params['worldName'];
      console.log('Loading world:', this.worldName);
      await this.store.load(this.worldName);
      this.store.world$.subscribe((w) => (this.world = w));

      // load characters
      this.allCharacters = await this.api.listCharacters();
    });
  }

  private async loadWorld() {
    const world = await this.api.getWorld(this.worldName);
    if (!world) {
      // create default world structure
      this.world = {
        characters: [],
        party: [],
        library: { items: [], runes: [], spells: [] },
        battleLoot: [],
      };
      await this.api.saveWorld(this.worldName, this.world);
    } else {
      this.world = world as WorldData;
    }

    // load all characters for listing
    this.allCharacters = await this.api.listCharacters();
  }

  async addCharacterToWorld() {
    if (!this.newCharacterId || !this.world) return;
    if (!this.world.characters.includes(this.newCharacterId)) {
      const newChars = [...this.world.characters, this.newCharacterId];
      this.store.applyPatch({ path: 'characters', value: newChars });
      this.newCharacterId = '';
    }
  }

  async removeCharacter(id: string) {
    if (!this.world) return;
    const newChars = this.world.characters.filter((c) => c !== id);
    const newParty = this.world.party.filter((p) => p !== id);
    this.store.applyPatch({ path: 'characters', value: newChars });
    this.store.applyPatch({ path: 'party', value: newParty });
  }

  async addToParty(id: string) {
    if (!this.world) return;
    if (!this.world.party.includes(id)) {
      const newParty = [...this.world.party, id];
      this.store.applyPatch({ path: 'party', value: newParty });
    }
  }

  async removeFromParty(id: string) {
    if (!this.world) return;
    const newParty = this.world.party.filter((p) => p !== id);
    this.store.applyPatch({ path: 'party', value: newParty });
  }

  async addItemToLibrary() {
    if (!this.world || !this.newItemName) return;
    const newItems = [...this.world.library.items, { name: this.newItemName }];
    this.store.applyPatch({ path: 'library.items', value: newItems });
    this.newItemName = '';
  }

  createLibraryItem(item: any) {
    if (!this.world) return;
    this.world.library.items.push(item);
    this.showCreateItem = false;
    this.saveWorld();
  }

  cancelCreateItem() {
    this.showCreateItem = false;
  }

  async saveWorld() {
    if (!this.world) return;
    await this.api.saveWorld(this.worldName, this.world);
  }

  getStatusCurrent(id: string, formulaType: FormulaType): number {
    const ch = this.allCharacters[id];
    if (!ch || !ch.statuses) return 0;
    const s = ch.statuses.find((st: any) => st.formulaType === formulaType);
    return Number(s?.statusCurrent ?? 0);
  }

  getStatusObj(id: string, formulaType: FormulaType): { statusBase: number; statusBonus: number; statusColor: string } {
    const ch = this.allCharacters[id];
    if (!ch || !ch.statuses) return { statusBase: 0, statusBonus: 0, statusColor: '#999' };
    const s = ch.statuses.find((st: any) => st.formulaType === formulaType) ?? null;
    return {
      statusBase: Number(s?.statusBase ?? 0),
      statusBonus: Number(s?.statusBonus ?? 0),
      statusColor: s?.statusColor ?? '#999',
    };
  }

  // Drag & drop handlers
  async dropToPlayer(event: CdkDragDrop<any[]>, playerId: string) {
    if (!this.world) return;
    // Get item from library
    const item = event.previousContainer.data[event.previousIndex];
    if (!item) return;

    // Remove from library
    const newLib = this.world.library.items.filter((_, i) => i !== event.previousIndex);
    this.store.applyPatch({ path: 'library.items', value: newLib });

    // Add to player's inventory via socket patch
    const player = this.allCharacters[playerId] || {};
    const newInv = [...(player.inventory || []), item];
    this.charSocket.sendPatch(playerId, { path: 'inventory', value: newInv });
  }

  async dropToBattle(event: CdkDragDrop<any[]>) {
    if (!this.world) return;
    const item = event.previousContainer.data[event.previousIndex];
    if (!item) return;

    // Remove from library
    const newLib = this.world.library.items.filter((_, i) => i !== event.previousIndex);
    this.store.applyPatch({ path: 'library.items', value: newLib });

    // Add to battleLoot
    const newBattle = [...(this.world.battleLoot || []), item];
    this.store.applyPatch({ path: 'battleLoot', value: newBattle });
  }
}