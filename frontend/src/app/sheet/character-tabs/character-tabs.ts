import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { InventoryComponent } from '../inventory/inventory.component';
import { ActionMacro } from '../../model/action-macro.model';
import { ForgingComponent } from '../forging/forging.component';
import { WissenComponent } from '../wissen/wissen.component';
import { SpellsComponent } from '../spells/spells.component';
import { SkillsComponent } from '../skills/skills.component';

@Component({
  selector: 'app-character-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InventoryComponent,
    ForgingComponent,
    WissenComponent,
    SpellsComponent,
    SkillsComponent,
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

  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() runeEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() spellEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() skillEditingChange = new EventEmitter<{index: number, isEditing: boolean}>();
  @Output() openTrash = new EventEmitter<void>();
  @Output() triggerMacro = new EventEmitter<ActionMacro>();
  @Output() requestCastWindow = new EventEmitter<void>();
  @Output() rollWeaponDamage = new EventEmitter<number>();

  activeTab: 'inventory' | 'spells' | 'wissen' | 'skills' = 'inventory';
  showForgingOverlay = false;

  setActiveTab(tab: 'inventory' | 'spells' | 'wissen' | 'skills') {
    this.activeTab = tab;
  }

  openForgingOverlay(): void {
    this.showForgingOverlay = true;
  }

  closeForgingOverlay(): void {
    this.showForgingOverlay = false;
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
