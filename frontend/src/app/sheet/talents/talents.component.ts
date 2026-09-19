import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/card/card.component';
import { CharacterSheet, CustomTalentEntry } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import {
  TALENT_DEFINITIONS,
  TALENT_STAT_OPTIONS,
  TalentStatKey,
  talentStatLabel,
} from '../../data/talent-definitions';
import { TrueStatsService } from '../../services/true-stats.service';
import { computeSkillTalentBonusBreakdown } from '../../utils/skill-talent-bonus.utils';

/**
 * One line of the talent table. Fixed talents come from TALENT_DEFINITIONS, freie
 * "Sonstige Talente" from `sheet.herstellenEntries` — both are rendered and calculated
 * identically, the custom ones simply may have no base stat.
 */
export interface TalentRow {
  id: string;
  name: string;
  stat: TalentStatKey | null;
  statLabel: string;
  description: string;
  custom: boolean;
}

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

  readonly statOptions = TALENT_STAT_OPTIONS;
  private trueStats = inject(TrueStatsService);

  readonly talents: TalentRow[] = TALENT_DEFINITIONS.map(t => ({
    id: t.id,
    name: t.name,
    stat: t.stat,
    statLabel: t.statLabel,
    description: t.description,
    custom: false,
  }));

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
    const custom = this.customEntries.reduce((sum, e) => sum + (e.rank || 0), 0);
    return regular + custom;
  }

  get availableTalentPoints(): number {
    return this.totalTalentPoints + this.bonusTalentPoints - this.spentTalentPoints;
  }

  /** Recommended cap per talent. Only a warning — Fähigkeiten may allow exceeding it. */
  get maxRankPerTalent(): number {
    return Math.floor((this.totalTalentPoints + this.bonusTalentPoints) / 2);
  }

  /** More points invested than available. Rendered as a warning, never blocked. */
  get isOverspent(): boolean {
    return this.availableTalentPoints < 0;
  }

  /** Any single talent above the recommended cap. */
  get hasRankOverLimit(): boolean {
    return this.allRows.some(r => this.isRankOverLimit(r));
  }

  isRankOverLimit(row: TalentRow): boolean {
    return this.getRank(row) > this.maxRankPerTalent;
  }

  get customEntries(): CustomTalentEntry[] {
    return this.sheet.herstellenEntries ?? [];
  }

  /** Custom entries as talent rows — same calculation path as the fixed talents. */
  get customRows(): TalentRow[] {
    return this.customEntries.map(e => ({
      id: e.id,
      name: e.label,
      stat: e.stat ?? null,
      statLabel: talentStatLabel(e.stat),
      description: e.label,
      custom: true,
    }));
  }

  private get allRows(): TalentRow[] {
    return [...this.talents, ...this.customRows];
  }

  private findEntry(id: string): CustomTalentEntry | undefined {
    return this.customEntries.find(e => e.id === id);
  }

  getRank(row: TalentRow): number {
    if (row.custom) return this.findEntry(row.id)?.rank ?? 0;
    return (this.sheet.talentRanks ?? {})[row.id] ?? 0;
  }

  /** Freely assigned Charakterbonus — counted like invested Punkte, but costs nothing. */
  getCharacterBonus(row: TalentRow): number {
    if (row.custom) return this.findEntry(row.id)?.charBonus ?? 0;
    return (this.sheet.talentCharacterBonus ?? {})[row.id] ?? 0;
  }

  setCharacterBonus(row: TalentRow, raw: string): void {
    const value = Math.trunc(Number(raw));
    const safe = Number.isFinite(value) ? value : 0;
    if (row.custom) {
      this.patchEntry(row.id, { charBonus: safe });
      return;
    }
    const map = { ...(this.sheet.talentCharacterBonus ?? {}), [row.id]: safe };
    this.patch.emit({ path: 'talentCharacterBonus', value: map });
  }

  /** Standard stat modifier for a talent's associated stat (0 when the talent has none). */
  getStatModifier(row: TalentRow): number {
    if (!row.stat) return 0;
    return this.trueStats.calculateStatModifier(this.sheet, row.stat as any);
  }

  /** Stat contribution shown in the MOD column, in the dice convention (minus = good, plus = bad). */
  getStatModDisplay(row: TalentRow): number {
    if (!row.stat) return 0;
    return this.trueStats.calculateStatDiceModifier(this.sheet, row.stat as any);
  }

  /** Virtual ranks from learned Fähigkeiten (type: talent_bonus). */
  getSkillTalentBonus(talentId: string): number {
    return computeSkillTalentBonusBreakdown(this.sheet).get(talentId as any)?.total ?? 0;
  }

  /** Bonus from active status effects targeting this talent. */
  getStatusTalentBonus(talentId: string): number {
    return this.trueStats.getStatusTalentBonus(this.sheet, talentId);
  }

  /**
   * EFFEKT column: everything that modifies this talent besides the stat, the invested points
   * and the Charakterbonus — Fähigkeiten (talent_bonus), Statuseffekte, … — aggregated in the
   * dice convention (negative = helps the roll). Hovering the cell lists every contributing source.
   */
  getEffectDice(row: TalentRow): number {
    return -(this.getSkillTalentBonus(row.id) + this.getStatusTalentBonus(row.id))
      + this.getScriptDiceBonus(row);
  }

  /**
   * `diceBonus("Athletik", -3)` from any active script (status effect, skill, spell or worn item)
   * whose label matches this talent. Already written in the dice convention, so it is added as-is.
   */
  private scriptDiceEntries(row: TalentRow) {
    const wanted = row.name.trim().toLowerCase();
    if (!wanted) return [];
    return this.trueStats.getDerivedDiceBonuses(this.sheet)
      .filter(b => b.name.toLowerCase() === wanted);
  }

  getScriptDiceBonus(row: TalentRow): number {
    return this.scriptDiceEntries(row).reduce((sum, b) => sum + b.value, 0);
  }

  /** Tooltip for the EFFEKT column: one line per source, each in the dice convention. */
  getEffectTooltip(row: TalentRow): string {
    const lines: string[] = [];
    const fmt = (n: number) => (n > 0 ? '+' : '') + n;
    for (const s of computeSkillTalentBonusBreakdown(this.sheet).get(row.id as any)?.sources ?? []) {
      lines.push(`${s.skillName} (Fähigkeit): ${fmt(-s.amount)}`);
    }
    for (const s of this.trueStats.getStatusTalentBonusSources(this.sheet, row.id)) {
      lines.push(`${s.name} (Statuseffekt): ${fmt(-s.amount)}`);
    }
    for (const b of this.scriptDiceEntries(row)) {
      lines.push(`${b.source} (Skript): ${fmt(b.value)}`);
    }
    if (!lines.length) return 'Keine Effekte auf ' + (row.name || 'dieses Talent');
    lines.push('─────', `Gesamt: ${fmt(this.getEffectDice(row))}`);
    return lines.join('\n');
  }

  /** Würfelbonus incl. ranks, Charakterbonus, skill/status bonuses and script diceBonus().
   *  Negative = helpful. Keeps the row readable as a sum: Effekt + Mod − Bonus − Punkte = Würfel. */
  getTotalDiceBonus(row: TalentRow): number {
    return -(
      this.getStatModifier(row) +
      this.getRank(row) +
      this.getCharacterBonus(row) +
      this.getSkillTalentBonus(row.id) +
      this.getStatusTalentBonus(row.id)
    ) + this.getScriptDiceBonus(row);
  }

  incrementRank(row: TalentRow): void {
    this.patchRank(row, this.getRank(row) + 1);
  }

  decrementRank(row: TalentRow): void {
    const current = this.getRank(row);
    if (current <= 0) return;
    this.patchRank(row, current - 1);
  }

  adjustBonusPoints(delta: number): void {
    const current = this.sheet.talentRankBonus ?? 0;
    const newValue = Math.max(0, current + delta);
    this.patch.emit({ path: 'talentRankBonus', value: newValue });
  }

  // ── Sonstige Talente ──────────────────────────────────────────────────────

  addCustomTalent(): void {
    const entries: CustomTalentEntry[] = [
      ...this.customEntries,
      { id: crypto.randomUUID(), label: '', rank: 0, stat: null, charBonus: 0 },
    ];
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }

  removeCustomTalent(id: string): void {
    const entries = this.customEntries.filter(e => e.id !== id);
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }

  updateCustomLabel(id: string, label: string): void {
    this.patchEntry(id, { label });
  }

  updateCustomStat(id: string, stat: string): void {
    this.patchEntry(id, { stat: (stat || null) as TalentStatKey | null });
  }

  private patchRank(row: TalentRow, newRank: number): void {
    if (row.custom) {
      this.patchEntry(row.id, { rank: newRank });
      return;
    }
    const ranks = { ...(this.sheet.talentRanks ?? {}), [row.id]: newRank };
    this.patch.emit({ path: 'talentRanks', value: ranks });
  }

  private patchEntry(id: string, changes: Partial<CustomTalentEntry>): void {
    const entries = this.customEntries.map(e => (e.id === id ? { ...e, ...changes } : e));
    this.patch.emit({ path: 'herstellenEntries', value: entries });
  }
}
