import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { InventoryComponent } from '../inventory/inventory.component';
import { ActionMacro } from '../../model/action-macro.model';
import { ForgingComponent } from '../forging/forging.component';
import { BrewingComponent } from '../brewing/brewing.component';
import { WissenComponent } from '../wissen/wissen.component';
import { SpellsComponent } from '../spells/spells.component';
import { SkillsComponent } from '../skills/skills.component';
import { ResourcesComponent } from '../resources/resources.component';
import { CompanionsComponent } from '../companions/companions.component';
import { migrateSpellSummonsToCompanions } from '../../model/companion-block.model';

@Component({
  selector: 'app-character-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InventoryComponent,
    ForgingComponent,
    BrewingComponent,
    WissenComponent,
    SpellsComponent,
    SkillsComponent,
    ResourcesComponent,
    CompanionsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './character-tabs.html',
  styleUrl: './character-tabs.css',
})
export class CharacterTabsComponent implements OnInit {
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

  activeTab: 'inventory' | 'resources' | 'spells' | 'wissen' | 'skills' | 'companions' = 'inventory';
  showForgingOverlay = false;
  showBrewingOverlay = false;

  ngOnInit(): void {
    // One-time move of legacy in-spell summons into the Begleiter list; the rune keeps a reference.
    // Deferred: the patch re-emits the sheet, which must not happen inside the ongoing CD pass.
    if (this.sheet && migrateSpellSummonsToCompanions(this.sheet)) {
      setTimeout(() => {
        this.patch.emit({ path: 'companions', value: this.sheet.companions });
        this.patch.emit({ path: 'spells', value: this.sheet.spells });
      });
    }
  }

  setActiveTab(tab: 'inventory' | 'resources' | 'spells' | 'wissen' | 'skills' | 'companions') {
    this.activeTab = tab;
  }

  openForgingOverlay(): void {
    this.showForgingOverlay = true;
  }

  closeForgingOverlay(): void {
    this.showForgingOverlay = false;
  }

  openBrewingOverlay(): void {
    this.showBrewingOverlay = true;
  }

  closeBrewingOverlay(): void {
    this.showBrewingOverlay = false;
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
