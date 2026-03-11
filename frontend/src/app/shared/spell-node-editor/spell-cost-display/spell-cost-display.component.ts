import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpellCostResult, CostCase, CaseTotals } from '../spell-cost.model';
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
      { key: 'chill',        label: 'CHR' },
    ];
    return map
      .filter(m => (r[m.key] ?? 0) > 0)
      .map(m => ({ key: m.key, label: m.label, value: r[m.key]! }));
  }

  hasStat(): boolean {
    return this.statEntries.length > 0;
  }

  get hasNoFlowCosts(): boolean {
    return !this.result.hasKnownBranches &&
      this.result.cases.every(c => c.entries.length === 0 && !c.subcases?.length);
  }

  /** Returns the cost display string for a case total (turn 0 only) */
  castCostStr(t: CaseTotals): string {
    const parts: string[] = [];
    if (t.mana > 0)  parts.push(`${round(t.mana)} Mana`);
    if (t.fokus > 0) parts.push(`${round(t.fokus)} Fokus`);
    return parts.length > 0 ? parts.join(' · ') : '—';
  }

  /** Per-turn cost string for uniform repeated turns */
  perTurnStr(t: CaseTotals): string {
    const parts: string[] = [];
    if (t.perTurnMana  > 0) parts.push(`${round(t.perTurnMana)} Mana`);
    if (t.perTurnFokus > 0) parts.push(`${round(t.perTurnFokus)} Fokus`);
    return parts.length > 0 ? parts.join(' · ') : '';
  }

  /** Returns individual per-turn entries for non-uniform turns */
  turnEntries(c: CostCase): { turn: number; str: string }[] {
    return c.entries
      .filter(e => e.turn > 0)
      .map(e => {
        const parts: string[] = [];
        if (e.mana  > 0) parts.push(`${round(e.mana)} Mana`);
        if (e.fokus > 0) parts.push(`${round(e.fokus)} Fokus`);
        return { turn: e.turn, str: parts.join(' · ') || '—' };
      });
  }

  totalsFor(idx: number): CaseTotals {
    return this.result.caseTotals[idx];
  }
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}
