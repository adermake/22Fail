import { RuneStatRequirements } from '../../model/rune-block.model';

/** Cost for a specific turn (0 = same turn as cast, 1+ = delayed turns) */
export interface TurnCostEntry {
  turn: number;
  mana: number;
  fokus: number;
}

/** A single node visit recorded during cost traversal */
export interface TraceStep {
  nodeId: string;
  runeName: string;
  turn: number;
  baseMana: number;
  manaMult: number;
  finalMana: number;
  baseFokus: number;
  fokusVerlust: number;
  unusedDataPorts: number;
  additionalFokus: number;
  finalFokus: number;
  /** > 1 when this is a repeated visit in a loop */
  loopPass?: number;
}

/** A named cost case (e.g., from a known branch condition). */
export interface CostCase {
  label: string;
  entries: TurnCostEntry[];
  /** Full per-turn costs including shared-path costs before this branch (set by calculateSpellCost). */
  fullEntries?: TurnCostEntry[];
  trace: TraceStep[];
  subcases?: CostCase[];
  isUnknownMerge?: boolean;
}

/** Aggregated totals across all turns */
export interface CaseTotals {
  mana: number;
  fokus: number;
  perTurnMana: number;
  perTurnFokus: number;
  perTurnUniform: boolean;
  maxRepeats: number;
}

/** The complete result from the spell cost calculator */
export interface SpellCostResult {
  statRequirements: RuneStatRequirements;
  hasKnownBranches: boolean;
  cases: CostCase[];
  caseTotals: CaseTotals[];
  simpleTotals: CaseTotals;
  hasPerTurnCosts: boolean;
  nodeCount: number;
  connectionCount: number;
  /** Ordered trace of shared path nodes (before branches). Full trace when no branches. */
  rootTrace: TraceStep[];
  /** Costs along the shared path before known branches (includes unknown worst-case if any). */
  sharedEntries: TurnCostEntry[];
  /** Individual unknown branch costs (before merging), for tree visualization. */
  unknownBranches: { label: string; entries: TurnCostEntry[] }[];
  /** How unknown branches were merged. */
  unknownMergeMode: 'exclusive' | 'combined' | 'none';
}
