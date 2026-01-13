import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { InventoryComponent } from '../inventory/inventory.component';
import { EquipmentComponent } from '../equipment/equipment.component';
import { SpellsComponent } from '../spells/spells.component';
import { RunesComponent } from '../../shared/runes/runes.component';
import { SkillsComponent } from '../skills/skills.component';

@Component({
  selector: 'app-character-tabs',
  standalone: true,
  imports: [CommonModule, FormsModule, InventoryComponent, EquipmentComponent, SpellsComponent, RunesComponent, SkillsComponent],
  templateUrl: './character-tabs.html',
  styleUrl: './character-tabs.css',
})
export class CharacterTabsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() editingRunes = new Set<number>();
  @Input() editingSpells = new Set<number>();
  @Input() editingSkills = new Set<number>();

  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() runeEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() spellEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() skillEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() openTrash = new EventEmitter<void>();

  activeTab: 'inventory' | 'spells' | 'runes' | 'skills' = 'inventory';

  setActiveTab(tab: 'inventory' | 'spells' | 'runes' | 'skills') {
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
}
