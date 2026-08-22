import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { getSkillById } from '../../data/skill-definitions';
import { spentTalentPoints, totalTalentPointsAtLevel } from '../../utils/skill-tree-rules.util';

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

  /** Total FP earned at the current level — the shared rule (2/level, +1 every 10 levels). */
  get earnedTalentPoints(): number {
    return totalTalentPointsAtLevel(this.sheet.level || 1);
  }

  /** FP spent, charging every skill what it actually cost when it was bought. */
  get spentTalentPoints(): number {
    return spentTalentPoints(this.sheet.learnedSkillIds || [], this.sheet.skillCostsPaid, getSkillById);
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
