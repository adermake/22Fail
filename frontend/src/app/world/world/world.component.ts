import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { WorldApiService } from '../../services/world-api.service';
import { FormulaType } from '../../model/formula-type.enum';
import { CurrentstatComponent } from '../../sheet/currentstat/currentstat.component';
import { ItemCreatorComponent } from '../../sheet/item-creator/item-creator.component';


interface WorldData {
  characters: string[];
  party: string[];
  library: { items: any[]; runes: any[]; spells: any[] };
  battleLoot: any[];
}

@Component({
  selector: 'app-world',
  imports: [CommonModule, FormsModule, CardComponent, CurrentstatComponent, ItemCreatorComponent],
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

  constructor(private route: ActivatedRoute, private api: WorldApiService) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.worldName = params['worldName'];
      console.log('Loading world:', this.worldName);
      await this.loadWorld();
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
      this.world.characters.push(this.newCharacterId);
      await this.saveWorld();
      this.newCharacterId = '';
    }
  }

  async removeCharacter(id: string) {
    if (!this.world) return;
    this.world.characters = this.world.characters.filter((c) => c !== id);
    this.world.party = this.world.party.filter((p) => p !== id);
    await this.saveWorld();
  }

  async addToParty(id: string) {
    if (!this.world) return;
    if (!this.world.party.includes(id)) {
      this.world.party.push(id);
      await this.saveWorld();
    }
  }

  async removeFromParty(id: string) {
    if (!this.world) return;
    this.world.party = this.world.party.filter((p) => p !== id);
    await this.saveWorld();
  }

  async addItemToLibrary() {
    if (!this.world || !this.newItemName) return;
    this.world.library.items.push({ name: this.newItemName });
    this.newItemName = '';
    await this.saveWorld();
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
}