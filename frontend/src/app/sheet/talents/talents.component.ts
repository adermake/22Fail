import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/card/card.component';
import { CharacterSheet, HerstellenEntry } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { TALENT_DEFINITIONS, TalentDefinition } from '../../data/talent-definitions';
import { TrueStatsService } from '../../services/true-stats.service';
import { computeSkillTalentBonusBreakdown } from '../../utils/skill-talent-bonus.utils';

@Component({
  selector: 'app-talents',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './talents.component.html',
  styleUrl: './talents.component.css',
})
export class TalentsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  readonly talents = TALENT_DEFINITIONS;
  private trueStats = inject(TrueStatsService);

  /** Total talent points at the current level: identical gain schedule to free stat points. */
  get totalTalentPoints(): number {
    const level = this.sheet.level || 1;
    return 5 + Math.floor(level / 3);
  }

  get bonusTalentPoints(): number {
    return this.sheet.talentRankBonus ?? 0;
  }

  get spentTalentPoints(): number {
    const ranks = this.sheet.talentRanks ?? {};
    const regular = Object.values(ranks).reduce((sum, r) => sum + (r || 0), 0);
    const herstellen = (this.sheet.herstellenEntries ?? []).reduce((sum, e) => sum + (e.rank || 0), 0);
    return regular + herstellen;
  }

  get availableTalentPoints(): number {
    return this.totalTalentPoints + this.bonusTalentPoints - this.spentTalentPoints;
  }

  /** Max points that can be invested in a single talent. */
  get maxRankPerTalent(): number {
    return Math.floor((this.totalTalentPoints + this.bonusTalentPoints) / 2);
  }

  get herstellenEntries(): HerstellenEntry[] {
    return this.sheet.herstellenEntries ?? [];
  }

  getRank(talentId: string): number {
    return (this.sheet.talentRanks ?? {})[talentId] ?? 0;
  }

  /** Standard stat modifier for a talent's associated stat. */
  getStatModifier(talent: TalentDefinition): number {
    return this.trueStats.calculateStatModifier(this.sheet, talent.stat as any);
  }

  /** Virtual ranks from learned Fähigkeiten (type: talent_bonus). */
  getSkillTalentBonus(talentId: string): number {
    return computeSkillTalentBonusBreakdown(this.sheet).get(talentId as any)?.total ?? 0;
  }

  getSkillTalentBonusTooltip(talentId: string): string {
    const breakdown = computeSkillTalentBonusBreakdown(this.sheet).get(talentId as any);
    if (!breakdown?.sources.length) return '';
    return breakdown.sources.map(s => `${s.skillName}: +${s.amount}`).join('\n');
  }

  /** Würfelbonus including invested ranks and skill bonuses. Negative = helpful. */
  getTotalDiceBonus(talent: TalentDefinition): number {
    return -(this.getStatModifier(talent) + this.getRank(talent.id) + this.getSkillTalentBonus(talent.id));
  }

  /** Würfelbonus: negative = helpful. Each rank = -1 (base only, without skill bonuses). */
  getDiceBonus(talent: TalentDefinition): number {
    return -(this.getStatModifier(talent) + this.getRank(talent.id));
  }

  /** Würfelbonus for a herstellen entry (no stat, only rank-based). */
  getHerstellenDiceBonus(entry: HerstellenEntry): number {
    return -(entry.rank || 0);
  }

  canIncrement(talentId: string): boolean {
    if (this.availableTalentPoints <= 0) return false;
    return this.getRank(talentId) < this.maxRankPerTalent;
  }

  canIncrementHerstellen(entry: HerstellenEntry): boolean {
    if (this.availableTalentPoints <= 0) return false;
    return (entry.rank || 0) < this.maxRankPerTalent;
  }

  incrementRank(talentId: string): void {
    if (!this.canIncrement(talentId)) return;
    this.patchRank(talentId, this.getRank(talentId) + 1);
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

  // ── Herstellen ────────────────────────────────────────────────────────────

  addHerstellen(): void {
    const entries: HerstellenEntry[] = [...(this.sheet.herstellenEntries ?? [])];
    entries.push({ id: crypto.randomUUID(), label: '', rank: 0 });
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }

  removeHerstellen(id: string): void {
    const entries = (this.sheet.herstellenEntries ?? []).filter(e => e.id !== id);
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }

  updateHerstellenLabel(id: string, label: string): void {
    const entries = (this.sheet.herstellenEntries ?? []).map(e =>
      e.id === id ? { ...e, label } : e
    );
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }

  incrementHerstellenRank(id: string): void {
    const entry = (this.sheet.herstellenEntries ?? []).find(e => e.id === id);
    if (!entry || !this.canIncrementHerstellen(entry)) return;
    this.patchHerstellenRank(id, (entry.rank || 0) + 1);
  }

  decrementHerstellenRank(id: string): void {
    const entry = (this.sheet.herstellenEntries ?? []).find(e => e.id === id);
    if (!entry || (entry.rank || 0) <= 0) return;
    this.patchHerstellenRank(id, (entry.rank || 0) - 1);
  }

  private patchRank(talentId: string, newRank: number): void {
    const ranks = { ...(this.sheet.talentRanks ?? {}), [talentId]: newRank };
    this.patch.emit({ path: 'talentRanks', value: ranks });
  }

  private patchHerstellenRank(id: string, newRank: number): void {
    const entries = (this.sheet.herstellenEntries ?? []).map(e =>
      e.id === id ? { ...e, rank: newRank } : e
    );
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }
}
