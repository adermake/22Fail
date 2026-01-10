import { ChangeDetectorRef, Component, inject, OnInit, NgZone } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  showLootPopup = false;
  receivedLoot: LootItem[] = [];
  isBattleLoot = false;
  currentWorldName = '';
  isCurrentTurn = false;

  async ngOnInit() {
    const classDefinitions = await fetch('class-definitions.txt').then((r) => r.text());
    await ClassTree.initialize(classDefinitions);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.load(id);

    // Connect to world socket for battle loot notifications and turn tracking
    this.worldSocket.connect();

    // Join world room when character sheet loads (if character has a world)
    this.store.sheet$.subscribe((sheet) => {
      if (sheet && sheet.worldName) {
        console.log('Joining world room:', sheet.worldName);
        this.currentWorldName = sheet.worldName;
        this.worldSocket.joinWorld(sheet.worldName);
      }
    });

    // Listen for loot notifications
    this.socket.lootReceived$.subscribe((loot: LootItem) => {
      this.ngZone.run(() => {
        this.receivedLoot = [loot];
        this.isBattleLoot = false;
        this.showLootPopup = true;
        this.cdr.detectChanges();
      });
    });

    this.socket.battleLootReceived$.subscribe((data: BattleLootEvent) => {
      this.ngZone.run(() => {
        console.log('Battle loot received in sheet component:', data);
        this.receivedLoot = data.loot;
        this.isBattleLoot = true;
        this.currentWorldName = data.worldName;
        this.showLootPopup = true;

        // Join the world room to receive battle loot updates
        this.worldSocket.joinWorld(data.worldName);

        this.cdr.detectChanges();
      });
    });

    // Listen for world patches to update battle loot when someone else claims
    this.worldSocket.patches$.subscribe((patch) => {
      this.ngZone.run(() => {
        // If battle loot was updated and we're showing the popup
        if (patch.path === 'battleLoot' && this.showLootPopup && this.isBattleLoot) {
          console.log('Received battleLoot patch:', patch);
          const updatedBattleLoot = patch.value as any[];
          console.log('Current receivedLoot:', this.receivedLoot);
          console.log('Updated battleLoot from server:', updatedBattleLoot);

          // Filter our current loot to only show items that still exist
          const updatedLootIds = new Set(updatedBattleLoot.map((item: any) => item.id));
          const beforeLength = this.receivedLoot.length;
          this.receivedLoot = this.receivedLoot.filter(loot => updatedLootIds.has(loot.id));
          console.log(`Filtered loot from ${beforeLength} to ${this.receivedLoot.length}`);

          // Close popup if no more loot
          if (this.receivedLoot.length === 0) {
            this.showLootPopup = false;
            console.log('Closing popup - no more loot');
          }

          this.cdr.detectChanges();
        }

        // Check if battle participants were updated to determine current turn
        if (patch.path === 'battleParticipants') {
          console.log('Battle participants updated:', patch.value);
          const participants = patch.value as any[];
          if (participants && participants.length > 0) {
            // Find who has the current turn (lowest nextTurnAt)
            const sorted = [...participants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
            const currentTurnCharacterId = sorted[0]?.characterId;
            console.log('Current turn character ID:', currentTurnCharacterId, 'My ID:', id);
            this.isCurrentTurn = currentTurnCharacterId === id;
            console.log('Is current turn:', this.isCurrentTurn);
            this.cdr.detectChanges();
          } else {
            this.isCurrentTurn = false;
            this.cdr.detectChanges();
          }
        }
      });
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
      case 'currency':
        // Add currency to character's currency
        const currentCurrency = sheet.currency || { copper: 0, silver: 0, gold: 0, platinum: 0 };
        const newCurrency = {
          copper: (currentCurrency.copper || 0) + (lootItem.data.copper || 0),
          silver: (currentCurrency.silver || 0) + (lootItem.data.silver || 0),
          gold: (currentCurrency.gold || 0) + (lootItem.data.gold || 0),
          platinum: (currentCurrency.platinum || 0) + (lootItem.data.platinum || 0)
        };
        this.store.applyPatch({
          path: 'currency',
          value: newCurrency
        });
        break;
    }

    // Remove claimed loot from popup immediately
    this.receivedLoot = this.receivedLoot.filter(l => l.id !== lootItem.id);

    // Close popup if no more loot
    if (this.receivedLoot.length === 0) {
      this.showLootPopup = false;
    }

    // Trigger change detection to update UI immediately
    this.cdr.detectChanges();

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
