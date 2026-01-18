import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';

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

  // Calculate available talent points
  // Base = level, plus bonus, minus spent (learned skills)
  get availableTalentPoints(): number {
    const basePoints = this.sheet.level || 1;
    const bonusPoints = this.sheet.talentPointsBonus || 0;
    const spentPoints = (this.sheet.learnedSkillIds || []).length;
    return basePoints + bonusPoints - spentPoints;
  }

  get totalTalentPoints(): number {
    return (this.sheet.level || 1) + (this.sheet.talentPointsBonus || 0);
  }

  get spentTalentPoints(): number {
    return (this.sheet.learnedSkillIds || []).length;
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
