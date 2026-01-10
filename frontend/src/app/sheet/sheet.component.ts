import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { CharacterComponent } from './character/character.component';
import { LevelclassComponent } from './levelclass/levelclass.component';
import { CurrentstatComponent } from './currentstat/currentstat.component';
import { CurrentstatsComponent } from './currentstats/currentstats.component';
import { PortraitComponent } from './portrait/portrait.component';
import { ActivatedRoute } from '@angular/router';
import { CharacterApiService } from '../services/character-api.service';
import { CharacterStoreService } from '../services/character-store.service';
import { CharacterSocketService, BattleLootEvent } from '../services/character-socket.service';
import { WorldSocketService } from '../services/world-socket.service';
import { CommonModule } from '@angular/common';
import { SkillsComponent } from './skills/skills.component';
import { ClassTree } from './class-tree-model';
import { InventoryComponent } from "./inventory/inventory.component";
import { EquipmentComponent } from './equipment/equipment.component';

import { SpellsComponent } from "./spells/spells.component";
import { RunesComponent } from '../shared/runes/runes.component';
import { CurrencyComponent } from "./currency/currency.component";
import { LootPopupComponent } from '../shared/loot-popup/loot-popup.component';
import { LootItem } from '../model/world.model';

@Component({
  selector: 'app-sheet',
  imports: [
    CommonModule,
    StatsComponent,
    CharacterComponent,
    LevelclassComponent,
    CurrentstatComponent,
    CurrentstatsComponent,
    EquipmentComponent,
    PortraitComponent,
    SkillsComponent,
    InventoryComponent,
    SpellsComponent,
    RunesComponent,
    CurrencyComponent,
    LootPopupComponent
],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.css',
})
export class SheetComponent implements OnInit {
  public store = inject(CharacterStoreService);
  private route = inject(ActivatedRoute);
  private socket = inject(CharacterSocketService);
  private worldSocket = inject(WorldSocketService);

  showLootPopup = false;
  receivedLoot: LootItem[] = [];
  isBattleLoot = false;
  currentWorldName = '';

  async ngOnInit() {
    const classDefinitions = await fetch('class-definitions.txt').then((r) => r.text());
    await ClassTree.initialize(classDefinitions);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.load(id);

    // Connect to world socket for battle loot notifications
    this.worldSocket.connect();

    // Listen for loot notifications
    this.socket.lootReceived$.subscribe((loot: LootItem) => {
      this.receivedLoot = [loot];
      this.isBattleLoot = false;
      this.showLootPopup = true;
    });

    this.socket.battleLootReceived$.subscribe((data: BattleLootEvent) => {
      this.receivedLoot = data.loot;
      this.isBattleLoot = true;
      this.currentWorldName = data.worldName;
      this.showLootPopup = true;
    });
  }

  onClaimLoot(lootItem: LootItem) {
    // Add item to character sheet based on type
    const sheet = this.store.sheetValue;
    if (!sheet) return;

    switch (lootItem.type) {
      case 'item':
        this.store.applyPatch({
          path: 'inventory',
          value: [...sheet.inventory, lootItem.data]
        });
        break;
      case 'rune':
        this.store.applyPatch({
          path: 'runes',
          value: [...sheet.runes, lootItem.data]
        });
        break;
      case 'spell':
        this.store.applyPatch({
          path: 'spells',
          value: [...sheet.spells, lootItem.data]
        });
        break;
    }

    // Remove claimed loot from popup
    this.receivedLoot = this.receivedLoot.filter(l => l.id !== lootItem.id);

    // Close popup if no more loot
    if (this.receivedLoot.length === 0) {
      this.showLootPopup = false;
    }

    // Notify server that loot was claimed (only for battle loot)
    if (this.isBattleLoot && this.currentWorldName) {
      this.worldSocket.claimBattleLoot(this.currentWorldName, lootItem.id);
    }
  }

  onCloseLootPopup() {
    this.showLootPopup = false;
    this.receivedLoot = [];
  }
}
