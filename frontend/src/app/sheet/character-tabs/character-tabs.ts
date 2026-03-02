import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { CurrentEvent } from '../../model/current-events.model';
import { InventoryComponent } from '../inventory/inventory.component';
import { SpellsComponent } from '../spells/spells.component';
import { RunesComponent } from '../../shared/runes/runes.component';
import { SkillsComponent } from '../skills/skills.component';
import { StatusEffectsTabComponent } from '../status-effects-tab/status-effects-tab.component';
import { CurrentEventsViewComponent } from '../current-events-view';
import type { BuyItemEvent, ClaimLootEvent } from '../current-events-view';

@Component({
  selector: 'app-character-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InventoryComponent,
    SpellsComponent,
    RunesComponent,
    SkillsComponent,
    StatusEffectsTabComponent,
    CurrentEventsViewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './character-tabs.html',
  styleUrl: './character-tabs.css',
})
export class CharacterTabsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() editingRunes = new Set<number>();
  @Input() editingSpells = new Set<number>();
  @Input() editingSkills = new Set<number>();
  @Input() currentEvents: CurrentEvent[] = [];
  @Input() characterId: string = '';

  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() runeEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() spellEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() skillEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() openTrash = new EventEmitter<void>();
  @Output() buyFromShop = new EventEmitter<BuyItemEvent>();
  @Output() claimLoot = new EventEmitter<ClaimLootEvent>();

  activeTab: 'inventory' | 'spells' | 'runes' | 'skills' | 'status-effects' | 'events' = 'inventory';

  setActiveTab(tab: 'inventory' | 'spells' | 'runes' | 'skills' | 'status-effects' | 'events') {
    this.activeTab = tab;
  }

  onRuneEditingChange(data: {index: number, isEditing: boolean}) {
    this.runeEditingChange.emit(data);
  }

  onSpellEditingChange(data: {index: number, isEditing: boolean}) {
    this.spellEditingChange.emit(data);
  }

  onSkillEditingChange(data: {index: number, isEditing: boolean}) {
    this.skillEditingChange.emit(data);
  }

  onPatch(patch: JsonPatch) {
    this.patch.emit(patch);
  }

  onBuyFromShop(event: BuyItemEvent) {
    this.buyFromShop.emit(event);
  }

  onClaimLoot(event: ClaimLootEvent) {
    this.claimLoot.emit(event);
  }
}
