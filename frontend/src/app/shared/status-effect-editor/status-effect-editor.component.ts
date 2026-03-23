import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusEffect, StatusStatModifier } from '../../model/status-effect.model';
import { DiceBonus } from '../../model/dice-bonus.model';
import { ActionMacro, createEmptyActionMacro } from '../../model/action-macro.model';
import { EmbeddedMacroEditorComponent, MACRO_ICON_SYMBOLS } from '../embedded-macro-editor/embedded-macro-editor.component';

@Component({
  selector: 'app-status-effect-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, EmbeddedMacroEditorComponent],
  templateUrl: './status-effect-editor.component.html',
  styleUrl: './status-effect-editor.component.css',
})
export class StatusEffectEditorComponent implements OnInit {
  @Input() statusEffect: StatusEffect | null = null;
  /** ActionMacros from the library to allow 'copy from template' */
  @Input() availableMacros: ActionMacro[] = [];
  @Output() save = new EventEmitter<StatusEffect>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  editEffect!: StatusEffect;
  isNew = true;

  // Embedded macro editor state
  showMacroEditor = false;
  macroEditMode: 'new' | 'edit' = 'new';
  showCopyFromLibrary = false;

  // Tag input
  newTag = '';

  // Available stats for modifiers
  stats: Array<'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'> = [
    'strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'
  ];

  statLabels: Record<string, string> = {
    strength: 'Stärke',
    dexterity: 'Geschicklichkeit',
    speed: 'Geschwindigkeit',
    intelligence: 'Intelligenz',
    constitution: 'Konstitution',
    chill: 'Wille'
  };

  // Color presets 
  colorPresets = [
    '#8b5cf6', // Purple (default)
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#6b7280', // Gray
  ];

  // Colorable Unicode icon presets (respond to CSS color property)
  iconPresets = MACRO_ICON_SYMBOLS;

  ngOnInit() {
    if (this.statusEffect) {
      this.editEffect = JSON.parse(JSON.stringify(this.statusEffect));
      this.isNew = false;
    } else {
      this.editEffect = {
        id: `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: 'Neuer Status-Effekt',
        description: '',
        icon: '💫',
        color: '#8b5cf6',
        diceBonuses: [],
        statModifiers: [],
        tags: [],
        isDebuff: false,
        maxStacks: 1,
        defaultDuration: undefined
      };
    }

    // Ensure arrays exist
    if (!this.editEffect.diceBonuses) this.editEffect.diceBonuses = [];
    if (!this.editEffect.statModifiers) this.editEffect.statModifiers = [];
    if (!this.editEffect.tags) this.editEffect.tags = [];
  }

  // Save/Cancel/Delete
  saveEffect() {
    this.save.emit(this.editEffect);
  }

  cancelEdit() {
    this.cancel.emit();
  }

  deleteEffect() {
    if (confirm('Status-Effekt wirklich löschen?')) {
      this.delete.emit();
    }
  }

  // Tags
  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.editEffect.tags!.includes(tag)) {
      this.editEffect.tags = [...this.editEffect.tags!, tag];
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.editEffect.tags = this.editEffect.tags!.filter((_, i) => i !== index);
  }

  // Dice Bonuses
  addDiceBonus() {
    const newBonus: DiceBonus = {
      name: this.editEffect.name || 'Bonus',
      value: 1,
      source: 'status_effect',
      context: ''
    };
    this.editEffect.diceBonuses = [...this.editEffect.diceBonuses!, newBonus];
  }

  removeDiceBonus(index: number) {
    this.editEffect.diceBonuses = this.editEffect.diceBonuses!.filter((_, i) => i !== index);
  }

  // Stat Modifiers
  addStatModifier() {
    const newMod: StatusStatModifier = {
      stat: 'strength',
      amount: 1,
      isPercentage: false
    };
    this.editEffect.statModifiers = [...this.editEffect.statModifiers!, newMod];
  }

  removeStatModifier(index: number) {
    this.editEffect.statModifiers = this.editEffect.statModifiers!.filter((_, i) => i !== index);
  }

  // Color selection
  selectColor(color: string) {
    this.editEffect.color = color;
  }

  isColorSelected(color: string): boolean {
    return this.editEffect.color === color;
  }

  // Icon selection
  selectIcon(icon: string) {
    this.editEffect.icon = icon;
  }

  // ---- Embedded Macro ----
  openCreateMacro() {
    this.macroEditMode = 'new';
    this.showMacroEditor = true;
    this.showCopyFromLibrary = false;
  }

  openEditMacro() {
    this.macroEditMode = 'edit';
    this.showMacroEditor = true;
    this.showCopyFromLibrary = false;
  }

  removeMacro() {
    if (confirm('Eingebettetes Makro entfernen?')) {
      this.editEffect.embeddedMacro = undefined;
    }
  }

  onMacroSaved(macro: ActionMacro) {
    this.editEffect.embeddedMacro = macro;
    this.showMacroEditor = false;
  }

  onMacroCancel() {
    this.showMacroEditor = false;
  }

  toggleCopyFromLibrary() {
    this.showCopyFromLibrary = !this.showCopyFromLibrary;
  }

  copyMacroFromLibrary(macro: ActionMacro) {
    const copy: ActionMacro = JSON.parse(JSON.stringify(macro));
    copy.id = `macro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    copy.createdAt = new Date();
    copy.modifiedAt = new Date();
    this.editEffect.embeddedMacro = copy;
    this.showCopyFromLibrary = false;
  }
}
