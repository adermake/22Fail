import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActionMacro,
  ActionCondition,
  ActionConsequence,
  createEmptyActionMacro,
  createEmptyCondition,
  createEmptyConsequence,
} from '../../model/action-macro.model';

// Colorable Unicode icon set (no emoji – all respond to CSS color)
export const MACRO_ICON_SYMBOLS = [
  // Combat
  '⚔', '⚒', '⛏', '♞',
  // Death & Dark
  '☠', '⚰', '⚱', '⛧',
  // Magic & Arcane
  '⚡', '⚛', '⛤', '☤',
  // Divine & Holy
  '✠', '⚜', '☥', '✚',
  // Elements & Nature
  '❄', '⚘', '☽', '⎈',
  // Binding & Status
  '⛓', '⚑', '⚙', '⚖',
  // Travel & Misc
  '⚓', '☯', '⚕', '⚗',
  // Stars
  '★', '✦', '✶', '✹',
  // Card Suits
  '♦', '♠', '♣', '♥',
  // Science & Danger
  '☢', '☣', '⚝', '∞',
  // Simple
  '◎', '⊕', '♾', '+',
];

interface ParseResult {
  valid: boolean;
  error?: string;
}

function quickValidateFormula(formula: string): ParseResult {
  if (!formula || !formula.trim()) return { valid: false, error: 'Formel fehlt' };
  const clean = formula.trim().replace(/\s/g, '');
  // allow: NdN, +, -, *, /, (, ), digits, d
  if (!/^[0-9d+\-*/().]+$/i.test(clean)) return { valid: false, error: 'Ungültige Zeichen' };
  // must contain at least a digit
  if (!/[0-9]/.test(clean)) return { valid: false, error: 'Keine Zahl gefunden' };
  return { valid: true };
}

@Component({
  selector: 'app-embedded-macro-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './embedded-macro-editor.component.html',
  styleUrl: './embedded-macro-editor.component.css',
})
export class EmbeddedMacroEditorComponent implements OnInit {
  /** If null → create new macro. Otherwise edit a copy. */
  @Input() macro: ActionMacro | null = null;
  /** Available macros to "copy from" as template */
  @Input() availableMacros: ActionMacro[] = [];
  @Output() save   = new EventEmitter<ActionMacro>();
  @Output() cancel = new EventEmitter<void>();

  editMacro!: ActionMacro;
  isNew = true;

  iconSymbols = MACRO_ICON_SYMBOLS;

  resourceTypes = ['health', 'energy', 'mana', 'fokus'] as const;
  statTypes     = ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const;
  operators     = ['>', '<', '>=', '<=', '==', '!='] as const;
  valueTypes    = ['fixed', 'currentResource', 'maxResource', 'stat'] as const;

  resourceLabels: Record<string, string> = {
    health: 'Leben', energy: 'Ausdauer', mana: 'Mana', fokus: 'Fokus',
  };
  statLabels: Record<string, string> = {
    strength: 'Stärke', dexterity: 'Geschicklichkeit', speed: 'Geschwindigkeit',
    intelligence: 'Intelligenz', constitution: 'Konstitution', chill: 'Wille',
  };
  valueTypeLabels: Record<string, string> = {
    fixed: 'Fester Wert',
    currentResource: 'Aktuelle Ressource',
    maxResource: 'Max Ressource',
    stat: 'Attribut',
  };
  consequenceTypeLabels: Record<string, string> = {
    dice_roll:      'Würfeln',
    spend_resource: 'Ressource ausgeben',
    gain_resource:  'Ressource erhalten',
    apply_bonus:    'Bonus anwenden',
  };

  showCopyFrom = false;
  copyFromError = '';

  ngOnInit() {
    if (this.macro) {
      this.editMacro = JSON.parse(JSON.stringify(this.macro));
      this.isNew = false;
    } else {
      this.editMacro = createEmptyActionMacro();
      this.isNew = true;
    }
    if (!this.editMacro.conditions)   this.editMacro.conditions = [];
    if (!this.editMacro.consequences) this.editMacro.consequences = [];
  }

  // ---- Conditions ----
  addCondition() {
    this.editMacro.conditions = [...this.editMacro.conditions, createEmptyCondition()];
  }
  removeCondition(i: number) {
    this.editMacro.conditions = this.editMacro.conditions.filter((_, idx) => idx !== i);
  }

  // ---- Consequences ----
  addConsequence() {
    this.editMacro.consequences = [...this.editMacro.consequences, createEmptyConsequence()];
  }
  removeConsequence(i: number) {
    this.editMacro.consequences = this.editMacro.consequences.filter((_, idx) => idx !== i);
  }

  // ---- Formula validation ----
  isFormulaValid(formula: string | undefined): boolean {
    if (!formula) return false;
    return quickValidateFormula(formula).valid;
  }
  getFormulaError(formula: string | undefined): string {
    if (!formula) return '';
    return quickValidateFormula(formula).error ?? '';
  }

  // ---- Copy from template ----
  toggleCopyFrom() {
    this.showCopyFrom = !this.showCopyFrom;
    this.copyFromError = '';
  }
  applyTemplate(source: ActionMacro) {
    const copy: ActionMacro = JSON.parse(JSON.stringify(source));
    // give it a fresh id, keep modified time fresh
    copy.id = `macro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    copy.createdAt  = new Date();
    copy.modifiedAt = new Date();
    if (this.isNew) {
      this.editMacro = copy;
    } else {
      // merge conditions + consequences only
      this.editMacro.conditions   = [...copy.conditions];
      this.editMacro.consequences = [...copy.consequences];
    }
    this.showCopyFrom = false;
  }

  // ---- Save / Cancel ----
  onSave() {
    this.editMacro.modifiedAt = new Date();
    this.editMacro.isValid    = true;
    this.save.emit(JSON.parse(JSON.stringify(this.editMacro)));
  }
  onCancel() {
    this.cancel.emit();
  }

  selectIcon(icon: string) {
    this.editMacro.icon = icon;
  }
}
