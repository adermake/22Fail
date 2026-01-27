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
  @Input() set skills(value: SkillDefinition[]) {
    this._skills = this.sortSkills(value);
  }
  get skills(): SkillDefinition[] {
    return this._skills;
  }
  private _skills: SkillDefinition[] = [];

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

  private sortSkills(skills: SkillDefinition[]): SkillDefinition[] {
    // Sort order: dice_bonus, active, passive, stat_bonus
    const typeOrder = { 'dice_bonus': 0, 'active': 1, 'passive': 2, 'stat_bonus': 3 };
    return [...skills].sort((a, b) => {
      const orderA = typeOrder[a.type] ?? 4;
      const orderB = typeOrder[b.type] ?? 4;
      return orderA - orderB;
    });
  }

  onSetPrimary() {
    // Check if at least one skill is learned from this class
    if (!this.hasLearnedSkill()) {
      return;
    }
    this.setPrimary.emit();
  }

  onSetSecondary() {
    // Check if at least one skill is learned from this class
    if (!this.hasLearnedSkill()) {
      return;
    }
    this.setSecondary.emit();
  }

  hasLearnedSkill(): boolean {
    return this.skills.some(skill => this.isLearned(skill));
  }

  isLearned(skill: SkillDefinition): boolean {
    return this.learnedSkillIds.includes(skill.id);
  }

  getSkillLevel(skill: SkillDefinition): number {
    return this.learnedSkillIds.filter(id => id === skill.id).length;
  }

  canLearn(skill: SkillDefinition): boolean {
    // For infinite level skills, always allow if we have talent points
    if (skill.infiniteLevel) {
      if (this.availablePoints <= 0) return false;
      if (!this.canLearnFromClass) return false;
      
      // Check required skill(s)
      if (skill.requiresSkill) {
        const requiredSkills = Array.isArray(skill.requiresSkill) ? skill.requiresSkill : [skill.requiresSkill];
        for (const requiredSkillId of requiredSkills) {
          if (!this.learnedSkillIds.includes(requiredSkillId)) {
            return false;
          }
        }
      }
      
      return true;
    }
    
    // For normal skills, can't learn if already learned
    if (this.isLearned(skill)) return false;
    if (this.availablePoints <= 0) return false;
    if (!this.canLearnFromClass) return false;

    // Check required skill(s)
    if (skill.requiresSkill) {
      const requiredSkills = Array.isArray(skill.requiresSkill) ? skill.requiresSkill : [skill.requiresSkill];
      for (const requiredSkillId of requiredSkills) {
        if (!this.learnedSkillIds.includes(requiredSkillId)) {
          return false;
        }
      }
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
