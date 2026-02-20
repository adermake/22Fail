import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { CLASS_DEFINITIONS, SKILL_DEFINITIONS } from '../../data/skill-definitions';

@Component({
  selector: 'app-levelclass',
  imports: [CardComponent, CommonModule, FormsModule],
  templateUrl: './levelclass.component.html',
  styleUrl: './levelclass.component.css',
})
export class LevelclassComponent {
  @Input({ required: true }) sheet!: CharacterSheet;

  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() openSkillTree = new EventEmitter<void>();

  updateField(path: string, value: any) {
    this.patch.emit({ path, value });
  }

  /**
   * Calculate total talent points earned at current level.
   * Formula: 1 TP per level + 1 additional TP per 10 levels
   * Level 1-10: 1 TP each = 10 total
   * Level 11-20: 2 TP each = 20 total (30 cumulative)
   * Level 21-30: 3 TP each = 30 total (60 cumulative)
   */
  get earnedTalentPoints(): number {
    const level = this.sheet.level || 1;
    let total = 0;
    for (let l = 1; l <= level; l++) {
      total += 1 + Math.floor((l - 1) / 10);
    }
    return total;
  }

  /**
   * Get the talent point cost to learn a skill based on its class tier.
   * Tier 1-2: 1 TP, Tier 3-4: 2 TP, Tier 5: 3 TP
   */
  private getSkillTPCost(skillId: string): number {
    // Find the skill's class from SKILL_DEFINITIONS
    const skill = SKILL_DEFINITIONS.find(s => s.id === skillId);
    if (!skill) return 1;
    
    // Get the class tier from CLASS_DEFINITIONS
    const classInfo = CLASS_DEFINITIONS[skill.class];
    if (!classInfo) return 1;
    
    const tier = classInfo.tier || 1;
    if (tier <= 2) return 1;
    if (tier <= 4) return 2;
    return 3;
  }

  /**
   * Calculate total spent talent points accounting for tier-based costs.
   */
  get spentTalentPoints(): number {
    const learnedIds = this.sheet.learnedSkillIds || [];
    let totalCost = 0;
    for (const skillId of learnedIds) {
      totalCost += this.getSkillTPCost(skillId);
    }
    return totalCost;
  }

  get totalTalentPoints(): number {
    return this.earnedTalentPoints + (this.sheet.talentPointsBonus || 0);
  }

  get availableTalentPoints(): number {
    return this.totalTalentPoints - this.spentTalentPoints;
  }

  adjustBonusPoints(delta: number) {
    const current = this.sheet.talentPointsBonus || 0;
    const newValue = Math.max(0, current + delta);
    this.updateField('talentPointsBonus', newValue);
  }

  onOpenSkillTree() {
    this.openSkillTree.emit();
  }
}
