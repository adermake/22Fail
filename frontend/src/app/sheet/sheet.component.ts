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
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ItemComponent } from './item/item.component';
import { ItemCreatorComponent } from './item-creator/item-creator.component';
import { CardComponent } from '../shared/card/card.component';
import { CharacterTabsComponent } from './character-tabs/character-tabs';
import { SkillTreeComponent } from './skill-tree/skill-tree.component';
import { BackstoryComponent } from './backstory/backstory.component';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsComponent,
    CharacterComponent,
    LevelclassComponent,
    CurrentstatComponent,
    CurrentstatsComponent,
    EquipmentComponent,
    LootPopupComponent,
    CharacterTabsComponent,
    SkillTreeComponent,
    BackstoryComponent
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

  // Editing states
  editingRunes = new Set<number>();
  editingSpells = new Set<number>();
  editingSkills = new Set<number>();

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

  onRuneEditingChange(index: number, isEditing: boolean) {
    const newSet = new Set(this.editingRunes);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingRunes = newSet;
  }

  onSpellEditingChange(index: number, isEditing: boolean) {
    const newSet = new Set(this.editingSpells);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingSpells = newSet;
  }

  onSkillEditingChange(index: number, isEditing: boolean) {
    const newSet = new Set(this.editingSkills);
    if (isEditing) {
      newSet.add(index);
    } else {
      newSet.delete(index);
    }
    this.editingSkills = newSet;
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

  // Skill Tree
  showSkillTree = false;

  openSkillTree() {
    this.showSkillTree = true;
  }

  closeSkillTree() {
    this.showSkillTree = false;
  }

  // Use Resource
  showUseResource = false;
  resourceType: 'health' | 'energy' | 'mana' = 'health';
  resourceAmount = 0;
  recentSpendings: Array<{ type: 'health' | 'energy' | 'mana', amount: number }> = [];

  openUseResource() {
    this.loadRecentSpendings();
    this.showUseResource = true;
    this.resourceType = 'health';
    this.resourceAmount = 0;
  }

  closeUseResource() {
    this.showUseResource = false;
  }

  getResourceCurrent(type: 'health' | 'energy' | 'mana'): number {
    const sheet = this.store.sheetValue;
    if (!sheet) return 0;
    const index = type === 'health' ? 0 : type === 'energy' ? 1 : 2;
    return sheet.statuses[index]?.statusCurrent || 0;
  }

  canUseResource(): boolean {
    return this.resourceAmount > 0 && this.resourceAmount <= this.getResourceCurrent(this.resourceType);
  }

  useResource() {
    const sheet = this.store.sheetValue;
    if (!sheet || !this.canUseResource()) return;

    const index = this.resourceType === 'health' ? 0 : this.resourceType === 'energy' ? 1 : 2;
    const currentValue = sheet.statuses[index].statusCurrent;
    const newValue = currentValue - this.resourceAmount;

    // Store spending in recent history
    this.addRecentSpending(this.resourceType, this.resourceAmount);

    this.store.applyPatch({
      path: `statuses.${index}.statusCurrent`,
      value: newValue
    });

    this.closeUseResource();
    this.resourceAmount = 0; // Reset amount after using
  loadRecentSpendings() {
    const key = `recentSpendings_${this.store.characterId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.recentSpendings = JSON.parse(stored);
      } catch {
        this.recentSpendings = [];
      }
    }
  }

  addRecentSpending(type: 'health' | 'energy' | 'mana', amount: number) {
    // Add to front of array
    this.recentSpendings.unshift({ type, amount });
    
    // Keep only last 10
    if (this.recentSpendings.length > 10) {
      this.recentSpendings = this.recentSpendings.slice(0, 10);
    }
    
    // Save to localStorage
    const key = `recentSpendings_${this.store.characterId}`;
    localStorage.setItem(key, JSON.stringify(this.recentSpendings));
  }

  useRecentSpending(spending: { type: 'health' | 'energy' | 'mana', amount: number }) {
    this.resourceType = spending.type;
    this.resourceAmount = spending.amount;
    // Let the user confirm by clicking the Use button
  }

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
    const sheet = this.store.sheetValue;
    if (!sheet || !sheet.trash) return;

    const trashItem = sheet.trash[index];
    const newTrash = [...sheet.trash];
    newTrash.splice(index, 1);

    // Restore to appropriate location
    switch (trashItem.type) {
      case 'item':
        this.store.applyPatch({
          path: 'inventory',
          value: [...sheet.inventory, trashItem.data]
        });
        break;
      case 'equipment':
        this.store.applyPatch({
          path: 'equipment',
          value: [...sheet.equipment, trashItem.data]
        });
        break;
      case 'rune':
        this.store.applyPatch({
          path: 'runes',
          value: [...sheet.runes, trashItem.data]
        });
        break;
      case 'spell':
        this.store.applyPatch({
          path: 'spells',
          value: [...sheet.spells, trashItem.data]
        });
        break;
      case 'skill':
        this.store.applyPatch({
          path: 'skills',
          value: [...sheet.skills, trashItem.data]
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
    const sheet = this.store.sheetValue;
    if (!sheet || !sheet.trash) return;

    const newTrash = [...sheet.trash];
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
