import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillBlock, StatModifier } from '../../model/skill-block.model';

@Component({
  selector: 'app-skill-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-editor.component.html',
  styleUrl: './skill-editor.component.css',
})
export class SkillEditorComponent implements OnInit {
  @Input() skill: SkillBlock | null = null; // null = creating new skill
  @Output() save = new EventEmitter<SkillBlock>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  // Working copy
  editSkill!: SkillBlock;
  isNewSkill = true;

  // Stat modifier UI
  statModifiers: { [key: string]: number } = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    constitution: 0,
    chill: 0,
    mana: 0,
    life: 0,
    energy: 0
  };

  skillTypes: { value: string; label: string }[] = [
    { value: 'active', label: 'Aktiv' },
    { value: 'passive', label: 'Passiv' },
    { value: 'dice_bonus', label: 'Würfelbonus' },
    { value: 'stat_bonus', label: 'Stat-Bonus' }
  ];

  ngOnInit() {
    if (this.skill) {
      this.editSkill = JSON.parse(JSON.stringify(this.skill));
      this.isNewSkill = false;
      // Initialize stat modifiers from skill
      if (this.editSkill.statModifiers) {
        for (const mod of this.editSkill.statModifiers) {
          this.statModifiers[mod.stat] = mod.amount;
        }
      }
    } else {
      this.editSkill = {
        name: '',
        class: 'Allgemein',
        description: '',
        type: 'passive',
        enlightened: true, // Item-based skills are always "enlightened" (no class restriction)
      };
    }
  }

  saveSkill() {
    // Convert stat modifiers to array
    const modifiers: StatModifier[] = [];
    for (const [stat, amount] of Object.entries(this.statModifiers)) {
      if (amount !== 0) {
        modifiers.push({ stat: stat as StatModifier['stat'], amount });
      }
    }
    this.editSkill.statModifiers = modifiers.length > 0 ? modifiers : undefined;

    this.save.emit(this.editSkill);
  }

  cancelEdit() {
    this.cancel.emit();
  }

  deleteSkill() {
    if (confirm('Fähigkeit wirklich löschen?')) {
      this.delete.emit();
    }
  }

  incrementStat(stat: string) {
    this.statModifiers[stat]++;
  }

  decrementStat(stat: string) {
    this.statModifiers[stat]--;
  }

  getStatLabel(stat: string): string {
    const labels: Record<string, string> = {
      strength: 'Stärke',
      dexterity: 'Geschick',
      speed: 'Tempo',
      intelligence: 'Intelligenz',
      constitution: 'Konstitution',
      chill: 'Gemüt',
      mana: 'Mana',
      life: 'Leben',
      energy: 'Energie'
    };
    return labels[stat] || stat;
  }
}
