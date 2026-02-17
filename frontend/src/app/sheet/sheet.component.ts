import { ChangeDetectorRef, Component, inject, OnInit, NgZone, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { CharacterComponent } from './character/character.component';
import { LevelclassComponent } from './levelclass/levelclass.component';
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
import { FormulaType } from '../model/formula-type.enum';
import { StatusBlock } from '../model/status-block.model';
import { DiceRollerComponent } from './dice-roller/dice-roller.component';
import { ActionMacrosComponent, RollResult } from './action-macros/action-macros.component';
import { ActionMacro } from '../model/action-macro.model';
import { ActionExecution } from './action-macros/action-macros.component';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatsComponent,
    CharacterComponent,
    LevelclassComponent,
    CurrentstatsComponent,
    EquipmentComponent,
    LootPopupComponent,
    CharacterTabsComponent,
    SkillTreeComponent,
    BackstoryComponent,
    DiceRollerComponent,
    ActionMacrosComponent
  ],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetComponent implements OnInit {
  public store = inject(CharacterStoreService);
  private route = inject(ActivatedRoute);
  private socket = inject(CharacterSocketService);
  private worldSocket = inject(WorldSocketService);
  private worldApi = inject(WorldApiService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  // Expose Math for template
  Math = Math;

  showLootPopup = false;
  receivedLoot: LootItem[] = [];
  isBattleLoot = false;
  currentWorldName = '';
  isCurrentTurn = false;
  isGroupTurn = false;
  showDiceRoller = false;
  showResourcePanel = false;
  showActionMacros = false;

  // Editing states
  editingRunes = new Set<number>();
  editingSpells = new Set<number>();
  editingSkills = new Set<number>();

  // Keyboard shortcuts for D/R/A (dice, resources, actions)
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Don't trigger if user is typing in an input field
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
    
    if (isInputField) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case 'd':
        // Toggle dice roller, close others
        if (!this.showDiceRoller) {
          this.showResourcePanel = false;
          this.showActionMacros = false;
          this.showDiceRoller = true;
        } else {
          this.showDiceRoller = false;
        }
        this.cdr.detectChanges();
        event.preventDefault();
        break;
      case 'r':
        // Toggle resources, close others
        if (!this.showResourcePanel) {
          this.showDiceRoller = false;
          this.showActionMacros = false;
          this.showResourcePanel = true;
        } else {
          this.showResourcePanel = false;
        }
        this.cdr.detectChanges();
        event.preventDefault();
        break;
      case 'a':
        // Toggle action macros, close others
        if (!this.showActionMacros) {
          this.showDiceRoller = false;
          this.showResourcePanel = false;
          this.showActionMacros = true;
        } else {
          this.showActionMacros = false;
        }
        this.cdr.detectChanges();
        event.preventDefault();
        break;
      case 'escape':
        // Close all panels
        if (this.showDiceRoller || this.showResourcePanel || this.showActionMacros) {
          this.showDiceRoller = false;
          this.showResourcePanel = false;
          this.showActionMacros = false;
          this.cdr.detectChanges();
          event.preventDefault();
        }
        break;
    }
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    
    // Initialize class tree (auto-initializes from CLASS_DEFINITIONS)
    ClassTree.initialize();
    
    // Load character data
    await this.store.load(id);
    
    // Connect to world socket for battle loot notifications and turn tracking
    this.worldSocket.connect();

    // Join world room when character sheet loads (if character has a world)
    this.store.sheet$.subscribe(async (sheet) => {
      if (sheet && sheet.worldName) {
        this.currentWorldName = sheet.worldName;

        // Wait for socket connection before joining world room
        await this.worldSocket.joinWorld(sheet.worldName);

        // Check initial turn state
        try {
          const world = await this.worldApi.loadWorld(sheet.worldName);

          if (world && world.battleParticipants && world.battleParticipants.length > 0) {
            const sorted = [...world.battleParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
            const currentTurnAt = sorted[0].nextTurnAt;
            const currentTurnTeam = sorted[0].team;

            // Find all in current group (same time and team)
            const currentGroup = sorted.filter(p =>
              Math.abs(p.nextTurnAt - currentTurnAt) < 0.01 && p.team === currentTurnTeam
            );

            this.isCurrentTurn = currentGroup.some(p => p.characterId === id);
            this.isGroupTurn = currentGroup.length > 1 && this.isCurrentTurn;
            this.cdr.detectChanges();
          }
        } catch (error) {
          console.error('Failed to check initial turn state:', error);
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
          const updatedBattleLoot = patch.value as any[];

          // Filter our current loot to only show items that still exist
          const updatedLootIds = new Set(updatedBattleLoot.map((item: any) => item.id));
          this.receivedLoot = this.receivedLoot.filter(loot => updatedLootIds.has(loot.id));

          // Close popup if no more loot
          if (this.receivedLoot.length === 0) {
            this.showLootPopup = false;
          }

          this.cdr.detectChanges();
        }

        // Check if battle participants were updated to determine current turn
        if (patch.path === 'battleParticipants') {
          const participants = patch.value as any[];
          if (participants && participants.length > 0) {
            // Find who has the current turn (lowest nextTurnAt)
            // For groups, check if ANY member of the current group matches this character
            const sorted = [...participants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
            const currentTurnAt = sorted[0].nextTurnAt;
            const currentTurnTeam = sorted[0].team;

            // Find all in current group (same time and team)
            const currentGroup = sorted.filter(p =>
              Math.abs(p.nextTurnAt - currentTurnAt) < 0.01 && p.team === currentTurnTeam
            );

            const isInCurrentGroup = currentGroup.some(p => p.characterId === id);

            this.isCurrentTurn = isInCurrentGroup;
            this.isGroupTurn = currentGroup.length > 1 && isInCurrentGroup;
            this.cdr.detectChanges();
          } else {
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
  resourceType: 'health' | 'energy' | 'mana' = 'health';
  resourceAmount = 0;
  recentSpendings: Array<{ type: 'health' | 'energy' | 'mana', amount: number }> = [];

  // Toggle methods for keyboard shortcuts and buttons
  toggleDiceRoller() {
    this.showDiceRoller = !this.showDiceRoller;
    this.cdr.detectChanges();
  }

  toggleResourcePanel() {
    if (!this.showResourcePanel) {
      this.loadRecentSpendings();
      this.resourceType = 'health';
      this.resourceAmount = 0;
    }
    this.showResourcePanel = !this.showResourcePanel;
    this.cdr.detectChanges();
  }

  toggleActionMacros() {
    this.showActionMacros = !this.showActionMacros;
    this.cdr.detectChanges();
  }

  openDiceRoller() {
    this.showDiceRoller = true;
  }

  closeDiceRoller() {
    this.showDiceRoller = false;
  }

  closeResourcePanel() {
    this.showResourcePanel = false;
  }

  closeActionMacros() {
    this.showActionMacros = false;
  }

  handleMacroExecution(macro: ActionMacro) {
    const sheet = this.store.sheetValue;
    if (!sheet) return;

    // Execute each consequence in order
    for (const consequence of macro.consequences) {
      switch (consequence.type) {
        case 'dice_roll':
          // Open dice roller with preset
          this.showDiceRoller = true;
          // The dice roller will handle the actual roll
          break;
          
        case 'spend_resource':
          if (consequence.resource && consequence.amount) {
            const resourceType = consequence.resource as 'health' | 'energy' | 'mana';
            const status = sheet.statuses?.find((s: StatusBlock) => {
              if (resourceType === 'health') return s.formulaType === FormulaType.LIFE;
              if (resourceType === 'energy') return s.formulaType === FormulaType.ENERGY;
              if (resourceType === 'mana') return s.formulaType === FormulaType.MANA;
              return false;
            });
            if (status) {
              status.statusCurrent = Math.max(0, status.statusCurrent - consequence.amount);
              this.store.applyPatch({ path: '/statuses', value: sheet.statuses });
            }
          }
          break;
          
        case 'gain_resource':
          if (consequence.resource && consequence.amount) {
            const resourceType = consequence.resource as 'health' | 'energy' | 'mana';
            const status = sheet.statuses?.find((s: StatusBlock) => {
              if (resourceType === 'health') return s.formulaType === FormulaType.LIFE;
              if (resourceType === 'energy') return s.formulaType === FormulaType.ENERGY;
              if (resourceType === 'mana') return s.formulaType === FormulaType.MANA;
              return false;
            });
            if (status) {
              // Gain but don't exceed max
              const max = status.statusBase + (status.statusEffectBonus || 0);
              status.statusCurrent = Math.min(max, status.statusCurrent + consequence.amount);
              this.store.applyPatch({ path: '/statuses', value: sheet.statuses });
            }
          }
          break;
      }
    }
    
    this.cdr.markForCheck();
  }

  // Handle resource changes from action macros (immediate update with animation)
  handleResourceChange(event: { resource: string, amount: number }) {
    const sheet = this.store.sheetValue;
    if (!sheet || !sheet.statuses) return;

    const resourceType = event.resource as 'health' | 'energy' | 'mana';
    const status = sheet.statuses.find((s: StatusBlock) => {
      if (resourceType === 'health') return s.formulaType === FormulaType.LIFE;
      if (resourceType === 'energy') return s.formulaType === FormulaType.ENERGY;
      if (resourceType === 'mana') return s.formulaType === FormulaType.MANA;
      return false;
    });

    if (status) {
      if (event.amount < 0) {
        // Spending
        status.statusCurrent = Math.max(0, status.statusCurrent + event.amount);
      } else {
        // Gaining - don't exceed max
        const max = status.statusBase + (status.statusEffectBonus || 0);
        status.statusCurrent = Math.min(max, status.statusCurrent + event.amount);
      }
      this.store.applyPatch({ path: '/statuses', value: sheet.statuses });
    }
    
    this.cdr.markForCheck();
  }

  // Handle rolls from action macros - sync with dice roller history and broadcast to world
  handleActionRoll(results: RollResult[]) {
    // Store the roll results for syncing with dice roller
    // The dice roller can read these when opened
    localStorage.setItem('action-roll-results', JSON.stringify(results));

    // Broadcast each roll to the world via socket
    const sheet = this.store.sheetValue;
    if (sheet && sheet.worldName) {
      for (const roll of results) {
        // Parse the formula to extract dice info
        const formulaParts = roll.formula.match(/(\d+)d(\d+)/i);
        const diceCount = formulaParts ? parseInt(formulaParts[1]) : 1;
        const diceType = formulaParts ? parseInt(formulaParts[2]) : 20;

        // Calculate bonuses from formula (total - dice rolls = bonuses)
        const diceSum = roll.rolls.reduce((sum, die) => sum + die, 0);
        const bonusValue = roll.total - diceSum;

        // Create bonuses array with the action name as source
        const bonuses: { name: string; value: number; source: string }[] = [];
        if (bonusValue !== 0) {
          bonuses.push({
            name: 'Bonus',
            value: bonusValue,
            source: roll.name || 'Action'
          });
        } else if (roll.name) {
          // Even if no numeric bonus, include the action name
          bonuses.push({
            name: roll.name,
            value: 0,
            source: roll.name
          });
        }

        this.worldSocket.sendDiceRoll({
          id: roll.id,
          worldName: sheet.worldName,
          characterName: sheet.name,
          characterId: sheet.id || '',
          diceType,
          diceCount,
          bonuses,
          result: roll.total,
          rolls: roll.rolls,
          timestamp: new Date(),
          isSecret: false
        });
      }
    }

    this.cdr.markForCheck();
  }
Handle full action execution from action macros - broadcast to world
  handleActionExecution(execution: ActionExecution) {
    const sheet = this.store.sheetValue;
    if (!sheet || !sheet.worldName) return;

    // Group rolls by action - send one event per action execution
    const allRolls = execution.rolls.map(roll => roll.rolls).flat();
    const totalResult = execution.rolls.reduce((sum, roll) => sum + roll.total, 0);
    
    // Use first roll for dice type/count or defaults
    const firstRoll = execution.rolls[0];
    const formulaParts = firstRoll?.formula?.match(/(\d+)d(\d+)/i);
    const diceCount = formulaParts ? parseInt(formulaParts[1]) : 1;
    const diceType = formulaParts ? parseInt(formulaParts[2]) : 20;

    // Create resource changes array
    const resourceChanges = execution.resourceChanges.map(change => ({
      resource: change.resource,
      amount: change.amount
    }));

    this.worldSocket.sendDiceRoll({
      id: execution.id,
      worldName: sheet.worldName,
      characterName: sheet.name,
      characterId: sheet.id || '',
      diceType,
      diceCount,
      bonuses: [], // Bonuses already calculated in totals
      result: totalResult,
      rolls: allRolls,
      timestamp: execution.timestamp,
      isSecret: false,
      actionName: execution.actionName,
      actionIcon: execution.actionIcon,
      actionColor: execution.actionColor,
      resourceChanges
    });

    this.cdr.markForCheck();
  }

  // 
  // Keep old names for backward compatibility
  openUseResource() {
    this.loadRecentSpendings();
    this.showResourcePanel = true;
    this.resourceType = 'health';
    this.resourceAmount = 0;
  }

  closeUseResource() {
    this.showResourcePanel = false;
  }

  getResourceCurrent(type: 'health' | 'energy' | 'mana'): number {
    const sheet = this.store.sheetValue;
    if (!sheet) return 0;
    
    // Map type to FormulaType
    const formulaType = type === 'health' ? FormulaType.LIFE : 
                       type === 'energy' ? FormulaType.ENERGY : 
                       FormulaType.MANA;
    
    // Find the status by its formulaType instead of assuming array order
    const status = sheet.statuses.find(s => s.formulaType === formulaType);
    return status?.statusCurrent || 0;
  }

  canUseResource(): boolean {
    return this.resourceAmount > 0 && this.resourceAmount <= this.getResourceCurrent(this.resourceType);
  }

  changeResource() {
    const sheet = this.store.sheetValue;
    if (!sheet || this.resourceAmount === 0) return;

    // Map type to FormulaType
    const formulaType = this.resourceType === 'health' ? FormulaType.LIFE : 
                       this.resourceType === 'energy' ? FormulaType.ENERGY : 
                       FormulaType.MANA;
    
    // Find the status by its formulaType
    const statusIndex = sheet.statuses.findIndex(s => s.formulaType === formulaType);
    if (statusIndex === -1) return;
    
    const currentValue = sheet.statuses[statusIndex].statusCurrent;
    const newValue = currentValue + this.resourceAmount; // Add (can be negative)

    // Store change in recent history
    this.addRecentSpending(this.resourceType, this.resourceAmount);

    this.store.applyPatch({
      path: `statuses.${statusIndex}.statusCurrent`,
      value: newValue
    });

    this.closeUseResource();
    this.resourceAmount = 0; // Reset amount after using
  }

  useResource() {
    const sheet = this.store.sheetValue;
    if (!sheet || !this.canUseResource()) return;

    // Map type to FormulaType
    const formulaType = this.resourceType === 'health' ? FormulaType.LIFE : 
                       this.resourceType === 'energy' ? FormulaType.ENERGY : 
                       FormulaType.MANA;
    
    // Find the status by its formulaType
    const statusIndex = sheet.statuses.findIndex(s => s.formulaType === formulaType);
    if (statusIndex === -1) return;
    
    const currentValue = sheet.statuses[statusIndex].statusCurrent;
    const newValue = currentValue - this.resourceAmount;

    // Store spending in recent history
    this.addRecentSpending(this.resourceType, -this.resourceAmount); // Store as negative

    this.store.applyPatch({
      path: `statuses.${statusIndex}.statusCurrent`,
      value: newValue
    });

    this.closeUseResource();
    this.resourceAmount = 0; // Reset amount after using
  }

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
    // Check if this exact spending already exists
    const exists = this.recentSpendings.some(s => s.type === type && s.amount === amount);
    if (exists) return;
    
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
