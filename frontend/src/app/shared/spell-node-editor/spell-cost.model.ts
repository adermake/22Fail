import { RuneStatRequirements } from '../../model/rune-block.model';

/** Cost for a specific turn (0 = same turn as cast, 1 = next turn, etc.) */
export interface TurnCostEntry {
  turn: number;
  mana: number;
  fokus: number;
}

/** A named cost case (e.g., from a known branch condition). */
export interface CostCase {
  label: string;                    // e.g. 'FALL A', 'FALL B', 'Schlimmster Fall'
  entries: TurnCostEntry[];         // per-turn costs (turn 0 = cast turn)
  subcases?: CostCase[];            // nested branches from within this case
  isUnknownMerge?: boolean;        // true = merged worst-case from unknown conditions
}

/** Aggregated totals across all turns */
export interface CaseTotals {
  mana: number;
  fokus: number;
  perTurnMana: number;   // cost per repeated turn (0 if not uniform)
  perTurnFokus: number;
  perTurnUniform: boolean; // true if all turns from t=1 onward have the same cost
  maxRepeats: number;      // how many repeating turns (0 = no delays)
}

/** The complete result from the spell cost calculator */
export interface SpellCostResult {
  /** Sum of all stat requirements across all rune nodes */
  statRequirements: RuneStatRequirements;
  /** True when result is split into known cases (known-condition branches) */
  hasKnownBranches: boolean;
  /** Root-level cost cases. Single entry = no branching or unknown-merged. */
  cases: CostCase[];
  /** Pre-computed totals for each root case */
  caseTotals: CaseTotals[];
  /** Flat totals when no branching (or after worst-case merge) */
  simpleTotals: CaseTotals;
  /** True if any loop/delay creates per-turn costs */
  hasPerTurnCosts: boolean;
}
