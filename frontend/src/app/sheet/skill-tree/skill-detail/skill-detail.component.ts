import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillDefinition } from '../../../model/skill-definition.model';

@Component({
  selector: 'app-skill-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-detail.component.html',
  styleUrl: './skill-detail.component.css'
})
export class SkillDetailComponent {
  @Input() className: string = '';
  @Input() skills: SkillDefinition[] = [];
  @Input() learnedSkillIds: string[] = [];
  @Input() availablePoints: number = 0;
  @Input() canLearnFromClass: boolean = true;  // Has 3 skills from parent class
  @Input() isPrimaryClass: boolean = false;
  @Input() isSecondaryClass: boolean = false;
  @Input() isTier1Class: boolean = false;  // Only tier 1 classes can be selected as primary/secondary

  @Output() learnSkill = new EventEmitter<SkillDefinition>();
  @Output() unlearnSkill = new EventEmitter<SkillDefinition>();
  @Output() close = new EventEmitter<void>();
  @Output() setPrimary = new EventEmitter<void>();
  @Output() setSecondary = new EventEmitter<void>();

  onSetPrimary() {
    this.setPrimary.emit();
  }

  onSetSecondary() {
    this.setSecondary.emit();
  }

  isLearned(skill: SkillDefinition): boolean {
    return this.learnedSkillIds.includes(skill.id);
  }

  canLearn(skill: SkillDefinition): boolean {
    if (this.isLearned(skill)) return false;
    if (this.availablePoints <= 0) return false;
    if (!this.canLearnFromClass) return false;

    // Check required skill
    if (skill.requiresSkill && !this.learnedSkillIds.includes(skill.requiresSkill)) {
      return false;
    }

    return true;
  }

  onLearn(skill: SkillDefinition) {
    if (this.canLearn(skill)) {
      this.learnSkill.emit(skill);
    }
  }

  onUnlearn(skill: SkillDefinition) {
    if (this.isLearned(skill)) {
      this.unlearnSkill.emit(skill);
    }
  }

  onClose() {
    this.close.emit();
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'stat_bonus': return 'Bonus';
      case 'passive': return 'Passiv';
      case 'active': return 'Aktiv';
      default: return type;
    }
  }

  getTypeClass(type: string): string {
    return `type-${type.replace('_', '-')}`;
  }

  getCostDisplay(skill: SkillDefinition): string {
    if (!skill.cost) return '';

    const typeLabels: Record<string, string> = {
      'mana': 'Mana',
      'energy': 'Ausdauer',
      'life': 'Leben'
    };

    let costText = `${skill.cost.amount} ${typeLabels[skill.cost.type] || skill.cost.type}`;
    if (skill.cost.perRound) {
      costText += ' pro Runde';
    }
    if (skill.bonusAction) {
      costText += ' (Bonusaktion)';
    }

    return costText;
  }

  getStatBonusDisplay(skill: SkillDefinition): string {
    if (!skill.statBonus) return '';

    const statLabels: Record<string, string> = {
      'intelligence': 'Intelligenz',
      'strength': 'Stärke',
      'dexterity': 'Geschicklichkeit',
      'speed': 'Tempo',
      'constitution': 'Konstitution',
      'chill': 'Chill',
      'mana': 'Mana',
      'life': 'Leben',
      'energy': 'Ausdauer',
      'focus': 'Fokus',
      'maxCastValue': 'Max. Castwert',
      'spellRadius': 'Zauberradius'
    };

    const label = statLabels[skill.statBonus.stat] || skill.statBonus.stat;
    const sign = skill.statBonus.amount >= 0 ? '+' : '';
    return `${sign}${skill.statBonus.amount} ${label}`;
  }

  getLockedReason(): string {
    if (!this.canLearnFromClass) {
      return 'Benötigt 3 Skills von einer Vorgängerklasse';
    }
    return '';
  }
}
