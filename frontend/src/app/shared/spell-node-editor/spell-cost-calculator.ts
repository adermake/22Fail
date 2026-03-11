/**
 * Spell Cost Calculator
 *
 * Pure function — no Angular dependencies. Traverses the spell flow graph and
 * computes mana, fokus and stat requirements according to the game rules:
 *
 *  Mana:   Follows flow connections. Each node's mana is multiplied by the
 *          manaMult of any rune connected to its Mana data-in port (chained).
 *
 *  Fokus:  fokus + unusedDataInputPorts × fokusVerlust  (per node).
 *
 *  Loops:  maxPassthrough on a connection limits how many times it is traversed.
 *          Unlimited loops (passthroughEnabled, no maxPassthrough) are capped at 5.
 *
 *  Delays: lineDelay N on a connection means the following chain's costs accumulate
 *          on turn N (0 = cast turn).
 *
 *  Branches (condition):
 *    - precastKnown = true  → fork into two named cases (FALL A / FALL B etc.)
 *    - precastKnown = false → run both paths and merge worst-case values.
 */

import { SpellGraph, SpellNode, SpellConnection } from './spell-node.model';
import { RuneBlock, RuneStatRequirements } from '../../model/rune-block.model';
import { buildRunePorts } from './spell-node.model';
import {
  SpellCostResult, CostCase, TurnCostEntry, CaseTotals,
} from './spell-cost.model';

const UNLIMITED_LOOP_CAP = 5;

// ─── helpers ──────────────────────────────────────────────────────────────────

type RuneMap = Map<string, RuneBlock>;
type PortsMap = Map<string, ReturnType<typeof buildRunePorts>>;

/** Build ports for every node in the graph once. */
function buildPortsMap(nodes: SpellNode[], runeMap: RuneMap): PortsMap {
  const map: PortsMap = new Map();
  for (const n of nodes) {
    const rune = runeMap.get(n.runeId);
    if (rune) map.set(n.id, buildRunePorts(rune as any));
  }
  return map;
}

/** Return true when the connection from-port is a flow port. */
function isFlowConnection(
  conn: SpellConnection,
  portsMap: PortsMap,
): boolean {
  if (conn.fromNodeId === 'start') return true;
  const ports = portsMap.get(conn.fromNodeId) ?? [];
  const p = ports.find(pp => pp.id === conn.fromPortId);
  return p?.kind === 'flow-out';
}

/** Recursively computes the effective mana multiplier for a node */
function getEffectiveMult(
  nodeId: string,
  connections: SpellConnection[],
  runeMap: RuneMap,
  portsMap: PortsMap,
  visited: Set<string>,
): number {
  if (visited.has(nodeId)) return 1; // cycle guard
  visited.add(nodeId);

  const rune = runeMap.get(nodeId);
  const ownMult = rune?.manaMult ?? 1;

  // Find the Mana data-in input connection(s) for this node
  const ports = portsMap.get(nodeId) ?? [];
  const manaInPorts = ports.filter(p => p.kind === 'data-in' && p.types.includes('Mana'));
  if (manaInPorts.length === 0) return ownMult;

  let chainMult = 1;
  for (const mp of manaInPorts) {
    const conn = connections.find(c => c.toNodeId === nodeId && c.toPortId === mp.id);
    if (conn) {
      const providerMult = getEffectiveMult(conn.fromNodeId, connections, runeMap, portsMap, new Set(visited));
      chainMult = Math.max(chainMult, providerMult);
    }
  }
  return ownMult * chainMult;
}

/** Compute mana + fokus cost for one node instance */
function nodeCost(
  nodeId: string,
  connections: SpellConnection[],
  runeMap: RuneMap,
  portsMap: PortsMap,
): { mana: number; fokus: number } {
  const rune = runeMap.get(nodeId);
  if (!rune) return { mana: 0, fokus: 0 };

  // Mana
  const baseMana = rune.mana ?? 0;
  let mana = 0;
  if (baseMana > 0) {
    const mult = getEffectiveMult(nodeId, connections, runeMap, portsMap, new Set());
    mana = baseMana * mult;
  }

  // Fokus: base + unusedDataInputPorts * fokusVerlust
  const baseFokus = rune.fokus ?? 0;
  const fokusVerlust = rune.fokusVerlust ?? 0;
  const ports = portsMap.get(nodeId) ?? [];
  const dataInPorts = ports.filter(p => p.kind === 'data-in');
  const usedDataInCount = connections.filter(
    c => c.toNodeId === nodeId && dataInPorts.some(p => p.id === c.toPortId)
  ).length;
  const unusedDataIn = Math.max(0, dataInPorts.length - usedDataInCount);
  const fokus = baseFokus + unusedDataIn * fokusVerlust;

  return { mana, fokus };
}

// ─── traversal ────────────────────────────────────────────────────────────────

/** Mutable accumulator for one case during traversal */
interface TraversalAccumulator {
  turnMap: Map<number, { mana: number; fokus: number }>;
  subcases: CostCase[];
}

function accumAdd(acc: TraversalAccumulator, turn: number, mana: number, fokus: number) {
  const cur = acc.turnMap.get(turn) ?? { mana: 0, fokus: 0 };
  acc.turnMap.set(turn, { mana: cur.mana + mana, fokus: cur.fokus + fokus });
}

/** Merge two accumulators by worst-case (max) per turn */
function mergeWorstCase(a: TraversalAccumulator, b: TraversalAccumulator): TraversalAccumulator {
  const result: TraversalAccumulator = { turnMap: new Map(), subcases: [] };
  const allTurns = new Set([...a.turnMap.keys(), ...b.turnMap.keys()]);
  for (const t of allTurns) {
    const av = a.turnMap.get(t) ?? { mana: 0, fokus: 0 };
    const bv = b.turnMap.get(t) ?? { mana: 0, fokus: 0 };
    result.turnMap.set(t, { mana: Math.max(av.mana, bv.mana), fokus: Math.max(av.fokus, bv.fokus) });
  }
  return result;
}

interface TraversalState {
  nodeId: string;
  turn: number;
  /** connection-id → traversal count */
  passthroughCount: Map<string, number>;
}

/**
 * DFS traversal following flow connections.
 * Branches are handled based on precastKnown.
 * Returns a CostCase for this traversal path.
 */
function traverse(
  state: TraversalState,
  graph: SpellGraph,
  runeMap: RuneMap,
  portsMap: PortsMap,
  /** Labels for branch conditions at THIS level, generated externally */
  branchLabel: string,
): CostCase {
  const acc: TraversalAccumulator = { turnMap: new Map(), subcases: [] };

  // DFS via a worklist so we handle passthrough properly
  type StackEntry = { nodeId: string; turn: number; passthroughCount: Map<string, number> };
  const stack: StackEntry[] = [
    { nodeId: state.nodeId, turn: state.turn, passthroughCount: new Map(state.passthroughCount) },
  ];

  while (stack.length > 0) {
    const { nodeId, turn, passthroughCount } = stack.pop()!;

    // Add this node's cost to the current turn
    if (nodeId !== 'start') {
      const { mana, fokus } = nodeCost(nodeId, graph.connections, runeMap, portsMap);
      accumAdd(acc, turn, mana, fokus);
    }

    // Find outgoing flow connections sorted by condition kind
    const outConns = graph.connections.filter(
      c => c.fromNodeId === nodeId && isFlowConnection(c, portsMap)
    );

    // Separate unconditional and conditional branches
    const unconditional = outConns.filter(c => !c.condition);
    const knownBranches = outConns.filter(c => c.condition && c.precastKnown);
    const unknownBranches = outConns.filter(c => c.condition && !c.precastKnown);

    // ── Unconditional connections ── just follow depth-first
    for (const conn of unconditional) {
      const limit = conn.passthroughEnabled
        ? (conn.maxPassthrough ?? UNLIMITED_LOOP_CAP)
        : 1;
      const count = passthroughCount.get(conn.id) ?? 0;
      if (count >= limit) continue; // loop exhausted

      const nextTurn = turn + (conn.lineDelay ?? 0);
      const nextCount = new Map(passthroughCount);
      nextCount.set(conn.id, count + 1);

      stack.push({ nodeId: conn.toNodeId, turn: nextTurn, passthroughCount: nextCount });
    }

    // ── Known branches (precastKnown) — fork into named subcases ──
    if (knownBranches.length > 0) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      knownBranches.forEach((conn, idx) => {
        const limit = conn.passthroughEnabled ? (conn.maxPassthrough ?? UNLIMITED_LOOP_CAP) : 1;
        const count = passthroughCount.get(conn.id) ?? 0;
        if (count >= limit) return;

        const nextTurn = turn + (conn.lineDelay ?? 0);
        const nextCount = new Map(passthroughCount);
        nextCount.set(conn.id, count + 1);

        const subLabel = `${conn.condition || `FALL ${letters[idx]}`}`;
        const sub = traverse(
          { nodeId: conn.toNodeId, turn: nextTurn, passthroughCount: nextCount },
          graph, runeMap, portsMap, subLabel,
        );
        acc.subcases.push(sub);
      });
    }

    // ── Unknown branches — pick worst case per turn ──
    if (unknownBranches.length > 0) {
      // Run each branch independently, then merge worst case
      const branchAccumulators: TraversalAccumulator[] = unknownBranches.map(conn => {
        const limit = conn.passthroughEnabled ? (conn.maxPassthrough ?? UNLIMITED_LOOP_CAP) : 1;
        const count = passthroughCount.get(conn.id) ?? 0;
        if (count >= limit) return { turnMap: new Map(), subcases: [] };

        const nextTurn = turn + (conn.lineDelay ?? 0);
        const nextCount = new Map(passthroughCount);
        nextCount.set(conn.id, count + 1);

        // Shallow traverse just to get sub-accumulator
        const subCase = traverse(
          { nodeId: conn.toNodeId, turn: nextTurn, passthroughCount: nextCount },
          graph, runeMap, portsMap, '',
        );
        const subAcc: TraversalAccumulator = { turnMap: new Map(), subcases: [] };
        for (const e of subCase.entries) {
          subAcc.turnMap.set(e.turn, { mana: e.mana, fokus: e.fokus });
        }
        return subAcc;
      });

      // Merge all unknown branches into worst case
      let merged = branchAccumulators[0];
      for (let i = 1; i < branchAccumulators.length; i++) {
        merged = mergeWorstCase(merged, branchAccumulators[i]);
      }
      // Fold merged into the accumulator (worst-case branch)
      for (const [t, v] of merged.turnMap) {
        accumAdd(acc, t, v.mana, v.fokus);
      }
    }
  }

  // Convert accumulator to TurnCostEntry[]
  const entries: TurnCostEntry[] = Array.from(acc.turnMap.entries())
    .map(([turn, v]) => ({ turn, mana: v.mana, fokus: v.fokus }))
    .sort((a, b) => a.turn - b.turn);

  return { label: branchLabel, entries, subcases: acc.subcases.length > 0 ? acc.subcases : undefined };
}

// ─── totals ───────────────────────────────────────────────────────────────────

function computeTotals(c: CostCase): CaseTotals {
  const t0 = c.entries.find(e => e.turn === 0);
  const delayedEntries = c.entries.filter(e => e.turn > 0);

  const totalMana  = c.entries.reduce((s, e) => s + e.mana, 0);
  const totalFokus = c.entries.reduce((s, e) => s + e.fokus, 0);

  // Check if all delayed turns have the same cost
  let perTurnMana = 0, perTurnFokus = 0;
  let perTurnUniform = false;
  if (delayedEntries.length > 0) {
    const firstMana  = delayedEntries[0].mana;
    const firstFokus = delayedEntries[0].fokus;
    perTurnUniform = delayedEntries.every(e => e.mana === firstMana && e.fokus === firstFokus);
    if (perTurnUniform) {
      perTurnMana  = firstMana;
      perTurnFokus = firstFokus;
    }
  }

  return {
    mana:  t0?.mana  ?? totalMana,
    fokus: t0?.fokus ?? totalFokus,
    perTurnMana,
    perTurnFokus,
    perTurnUniform,
    maxRepeats: delayedEntries.length,
  };
}

// ─── stat requirements ────────────────────────────────────────────────────────

function sumStatRequirements(nodes: SpellNode[], runeMap: RuneMap): RuneStatRequirements {
  const req: RuneStatRequirements = {};
  for (const n of nodes) {
    const rune = runeMap.get(n.runeId);
    if (!rune?.statRequirements) continue;
    const r = rune.statRequirements;
    if (r.strength)     req.strength     = (req.strength     ?? 0) + r.strength;
    if (r.dexterity)    req.dexterity    = (req.dexterity    ?? 0) + r.dexterity;
    if (r.speed)        req.speed        = (req.speed        ?? 0) + r.speed;
    if (r.intelligence) req.intelligence = (req.intelligence ?? 0) + r.intelligence;
    if (r.constitution) req.constitution = (req.constitution ?? 0) + r.constitution;
    if (r.chill)        req.chill        = (req.chill        ?? 0) + r.chill;
  }
  return req;
}

// ─── public API ───────────────────────────────────────────────────────────────

export function calculateSpellCost(
  graph: SpellGraph,
  availableRunes: RuneBlock[],
): SpellCostResult {
  const runeMap: RuneMap = new Map(availableRunes.map(r => [r.name, r]));
  const portsMap = buildPortsMap(graph.nodes, runeMap);

  const statRequirements = sumStatRequirements(graph.nodes, runeMap);

  // Main traversal starting from the 'start' node (outputs flow connections)
  const rootCase = traverse(
    { nodeId: 'start', turn: 0, passthroughCount: new Map() },
    graph, runeMap, portsMap, 'Gesamt',
  );

  const hasKnownBranches = (rootCase.subcases?.length ?? 0) > 0;

  const cases: CostCase[] = hasKnownBranches
    ? (rootCase.subcases ?? [])
    : [{ ...rootCase, label: 'Gesamt' }];

  const caseTotals = cases.map(computeTotals);
  const simpleTotals = caseTotals.length === 1
    ? caseTotals[0]
    : {
        mana:  Math.max(...caseTotals.map(t => t.mana)),
        fokus: Math.max(...caseTotals.map(t => t.fokus)),
        perTurnMana:  Math.max(...caseTotals.map(t => t.perTurnMana)),
        perTurnFokus: Math.max(...caseTotals.map(t => t.perTurnFokus)),
        perTurnUniform: caseTotals.every(t => t.perTurnUniform),
        maxRepeats: Math.max(...caseTotals.map(t => t.maxRepeats)),
      };

  const hasPerTurnCosts = cases.some(c => c.entries.some(e => e.turn > 0));

  return {
    statRequirements,
    hasKnownBranches,
    cases,
    caseTotals,
    simpleTotals,
    hasPerTurnCosts,
  };
}
