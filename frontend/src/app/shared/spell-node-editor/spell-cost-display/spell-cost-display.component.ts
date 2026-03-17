import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpellCostResult, CaseTotals, TraceStep, TurnCostEntry } from '../spell-cost.model';
import { RuneStatRequirements } from '../../../model/rune-block.model';

@Component({
  selector: 'app-spell-cost-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spell-cost-display.component.html',
  styleUrl: './spell-cost-display.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpellCostDisplayComponent {
  @Input({ required: true }) result!: SpellCostResult;
  @Input() spellName = '';

  get statEntries(): { key: string; label: string; value: number }[] {
    const r = this.result.statRequirements;
    const map: { key: keyof RuneStatRequirements; label: string }[] = [
      { key: 'strength',     label: 'STR' },
      { key: 'dexterity',    label: 'GES' },
      { key: 'speed',        label: 'SPD' },
      { key: 'intelligence', label: 'INT' },
      { key: 'constitution', label: 'KON' },
      { key: 'chill',        label: 'WIL' },
    ];
    return map.filter(m => (r[m.key] ?? 0) > 0).map(m => ({ key: m.key, label: m.label, value: r[m.key]! }));
  }

  hasStat(): boolean { return this.statEntries.length > 0; }

  fmt(v: number): string {
    if (v === 0) return '0';
    if (v % 1 === 0) return String(v);
    return (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
  }

  /** Returns the complete per-turn entries for a case (shared path + branch costs merged). */
  caseEntries(ci: number): TurnCostEntry[] {
    const c = this.result.cases[ci];
    return c?.fullEntries ?? c?.entries ?? [];
  }

  /** True when entries span more than just a single Turn-0 cost. */
  hasMultipleTurns(entries: TurnCostEntry[]): boolean {
    return entries.length > 1 || (entries.length === 1 && entries[0].turn > 0);
  }

  /** Format a single TurnCostEntry as "5 Mana · 3 Fokus". */
  turnCostStr(e: TurnCostEntry): string {
    const parts: string[] = [];
    if (e.mana  > 0) parts.push(`${this.fmt(e.mana)} Mana`);
    if (e.fokus > 0) parts.push(`${this.fmt(e.fokus)} Fokus`);
    return parts.length > 0 ? parts.join(' · ') : '—';
  }

  castCostStr(t: CaseTotals): string {
    const parts: string[] = [];
    if (t.mana  > 0) parts.push(`${this.fmt(t.mana)} Mana`);
    if (t.fokus > 0) parts.push(`${this.fmt(t.fokus)} Fokus`);
    return parts.length > 0 ? parts.join(' · ') : '—';
  }

  perTurnStr(t: CaseTotals): string {
    const parts: string[] = [];
    if (t.perTurnMana  > 0) parts.push(`${this.fmt(t.perTurnMana)} Mana`);
    if (t.perTurnFokus > 0) parts.push(`${this.fmt(t.perTurnFokus)} Fokus`);
    return parts.join(' · ');
  }

  totalsFor(idx: number): CaseTotals { return this.result.caseTotals[idx]; }

  hasManaInfo(s: TraceStep): boolean  { return s.baseMana > 0; }
  hasFokusInfo(s: TraceStep): boolean { return s.baseFokus > 0 || s.additionalFokus > 0; }
  isZeroCost(s: TraceStep): boolean   { return s.finalMana === 0 && s.finalFokus === 0; }

  multLabel(s: TraceStep): string {
    if (s.manaMult === 1 || s.baseMana === 0) return this.fmt(s.finalMana);
    return `${this.fmt(s.baseMana)} × ${this.fmt(s.manaMult)} = ${this.fmt(s.finalMana)}`;
  }

  fokusLabel(s: TraceStep): string {
    if (s.additionalFokus > 0)
      return `${this.fmt(s.baseFokus)} + ${s.unusedDataPorts}×${this.fmt(s.fokusVerlust)} = ${this.fmt(s.finalFokus)}`;
    return this.fmt(s.finalFokus);
  }

  get hasNoFlowCosts(): boolean {
    return !this.result.hasKnownBranches &&
      this.result.cases.every(c => c.entries.length === 0 && !c.subcases?.length);
  }
}
