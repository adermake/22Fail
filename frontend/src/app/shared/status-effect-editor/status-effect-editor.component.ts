import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusEffect, StatusStatModifier } from '../../model/status-effect.model';
import { DiceBonus } from '../../model/dice-bonus.model';

@Component({
  selector: 'app-status-effect-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './status-effect-editor.component.html',
  styleUrl: './status-effect-editor.component.css',
})
export class StatusEffectEditorComponent implements OnInit {
  @Input() statusEffect: StatusEffect | null = null;
  @Output() save = new EventEmitter<StatusEffect>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  editEffect!: StatusEffect;
  isNew = true;

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

  // Icon presets
  iconPresets = [
    '💫', '🔥', '❄️', '⚡', '💀', '🛡️', '⚔️', '🎯',
    '💪', '🧠', '👁️', '💨', '🌟', '☠️', '💖', '🌀',
    '🔮', '✨', '🩸', '🧪', '⏳', '🎭', '👻', '🌙'
  ];

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
}
