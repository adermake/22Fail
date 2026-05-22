import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/card/card.component';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { TALENT_DEFINITIONS, TalentDefinition } from '../../data/talent-definitions';
import { TrueStatsService } from '../../services/true-stats.service';

@Component({
  selector: 'app-talents',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.css',
})
export class TalentsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  readonly talents = TALENT_DEFINITIONS;
  private trueStats = inject(TrueStatsService);

  /** Total talent points at the current level: 5 + floor((level - 1) / 3) */
  get totalTalentPoints(): number {
    const level = this.sheet.level || 1;
    return 5 + Math.floor((level - 1) / 3);
  }

  get bonusTalentPoints(): number {
    return this.sheet.talentRankBonus ?? 0;
  }

  get spentTalentPoints(): number {
    const ranks = this.sheet.talentRanks ?? {};
    return Object.values(ranks).reduce((sum, r) => sum + (r || 0), 0);
  }

  get availableTalentPoints(): number {
    return this.totalTalentPoints + this.bonusTalentPoints - this.spentTalentPoints;
  }

  getRank(talentId: string): number {
    return (this.sheet.talentRanks ?? {})[talentId] ?? 0;
  }

  /** Standard DnD-style stat modifier: (-5 + stat/2) | 0 */
  getStatModifier(talent: TalentDefinition): number {
    return this.trueStats.calculateStatModifier(this.sheet, talent.stat as any);
  }

  getTotalBonus(talent: TalentDefinition): number {
    return this.getStatModifier(talent) + this.getRank(talent.id);
  }

  /** Dice bonus: inverted — negative = helpful (less is better). stat modifier inverted + ranks. */
  getDiceBonus(talent: TalentDefinition): number {
    return -(this.getStatModifier(talent) + this.getRank(talent.id));
  }

  incrementRank(talentId: string): void {
    if (this.availableTalentPoints <= 0) return;
    const current = this.getRank(talentId);
    this.patchRank(talentId, current + 1);
  }

  decrementRank(talentId: string): void {
    const current = this.getRank(talentId);
    if (current <= 0) return;
    this.patchRank(talentId, current - 1);
  }

  adjustBonusPoints(delta: number): void {
    const current = this.sheet.talentRankBonus ?? 0;
    const newValue = Math.max(0, current + delta);
    this.patch.emit({ path: 'talentRankBonus', value: newValue });
  }

  private patchRank(talentId: string, newRank: number): void {
    const ranks = { ...(this.sheet.talentRanks ?? {}), [talentId]: newRank };
    this.patch.emit({ path: 'talentRanks', value: ranks });
  }
}
