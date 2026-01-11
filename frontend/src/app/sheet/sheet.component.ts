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
import { WorldApiService } from '../services/world-api.service';
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
  private worldApi = inject(WorldApiService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  showLootPopup = false;
  receivedLoot: LootItem[] = [];
  isBattleLoot = false;
  currentWorldName = '';
  isCurrentTurn = false;
  isGroupTurn = false;

  async ngOnInit() {
    const classDefinitions = await fetch('class-definitions.txt').then((r) => r.text());
    await ClassTree.initialize(classDefinitions);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.load(id);

    // Connect to world socket for battle loot notifications and turn tracking
    this.worldSocket.connect();

    // Join world room when character sheet loads (if character has a world)
    this.store.sheet$.subscribe(async (sheet) => {
      if (sheet && sheet.worldName) {
        console.log('[GLOW DEBUG] Character has world:', sheet.worldName);
        this.currentWorldName = sheet.worldName;

        // Wait for socket connection before joining world room
        await this.worldSocket.joinWorld(sheet.worldName);
        console.log('[GLOW DEBUG] Successfully joined world room:', sheet.worldName);

        // Check initial turn state
        try {
          console.log('[GLOW DEBUG] Fetching world data for:', sheet.worldName);
          const world = await this.worldApi.loadWorld(sheet.worldName);
          console.log('[GLOW DEBUG] World data:', world);

          if (world && world.battleParticipants && world.battleParticipants.length > 0) {
            console.log('[GLOW DEBUG] Battle participants:', world.battleParticipants);
            const sorted = [...world.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
            const currentTurnAt = sorted[0].nextTurnAt;
            const currentTurnTeam = sorted[0].team;
            console.log('[GLOW DEBUG] First in queue:', sorted[0]);

            // Find all in current group (same time and team)
            const currentGroup = sorted.filter(p =>
              Math.abs(p.nextTurnAt - currentTurnAt) < 0.01 && p.team === currentTurnTeam
            );
            console.log('[GLOW DEBUG] Current group:', currentGroup);
            console.log('[GLOW DEBUG] My character ID:', id);

            this.isCurrentTurn = currentGroup.some(p => p.characterId === id);
            this.isGroupTurn = currentGroup.length > 1 && this.isCurrentTurn;
            console.log('[GLOW DEBUG] Initial turn check - Is current turn:', this.isCurrentTurn);
            console.log('[GLOW DEBUG] Is group turn:', this.isGroupTurn);
            this.cdr.detectChanges();
          } else {
            console.log('[GLOW DEBUG] No battle participants in world');
          }
        } catch (error) {
          console.error('[GLOW DEBUG] Failed to check initial turn state:', error);
        }
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

    this.socket.battleLootReceived$.subscribe(async (data: BattleLootEvent) => {
      await this.ngZone.run(async () => {
        console.log('Battle loot received in sheet component:', data);
        this.receivedLoot = data.loot;
        this.isBattleLoot = true;
        this.currentWorldName = data.worldName;
        this.showLootPopup = true;

        // Join the world room to receive battle loot updates
        await this.worldSocket.joinWorld(data.worldName);

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
          console.log('[GLOW DEBUG] Battle participants patch received:', patch.value);
          const participants = patch.value as any[];
          if (participants && participants.length > 0) {
            // Find who has the current turn (lowest nextTurnAt)
            // For groups, check if ANY member of the current group matches this character
            const sorted = [...participants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
            const currentTurnAt = sorted[0].nextTurnAt;
            const currentTurnTeam = sorted[0].team;
            console.log('[GLOW DEBUG] First in queue:', sorted[0]);

            // Find all in current group (same time and team)
            const currentGroup = sorted.filter(p =>
              Math.abs(p.nextTurnAt - currentTurnAt) < 0.01 && p.team === currentTurnTeam
            );

            const isInCurrentGroup = currentGroup.some(p => p.characterId === id);
            console.log('[GLOW DEBUG] Current group:', currentGroup.map(p => p.characterId));
            console.log('[GLOW DEBUG] My ID:', id, 'Is in group:', isInCurrentGroup);

            this.isCurrentTurn = isInCurrentGroup;
            this.isGroupTurn = currentGroup.length > 1 && isInCurrentGroup;
            console.log('[GLOW DEBUG] Patch handler - Is current turn:', this.isCurrentTurn);
            console.log('[GLOW DEBUG] Patch handler - Is group turn:', this.isGroupTurn);
            this.cdr.detectChanges();
          } else {
            console.log('[GLOW DEBUG] No participants, setting isCurrentTurn to false');
            this.isCurrentTurn = false;
            this.isGroupTurn = false;
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
