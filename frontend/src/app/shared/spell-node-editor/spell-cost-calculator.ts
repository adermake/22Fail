/**
 * Spell Cost Calculator
 *
 * BUG FIX: The original calculator built runeMap keyed by rune.name but then
 * called runeMap.get(nodeId) where nodeId is the node's INSTANCE ID (e.g.
 * "node-1675xxx"), not the rune name â€” every lookup silently returned undefined
 * and all costs were 0.
 *
 * Fix: buildNodeRuneMap() creates a Map<nodeInstanceId, RuneBlock>.
 */

import { SpellGraph, SpellNode, SpellConnection } from './spell-node.model';
import { RuneBlock, RuneStatRequirements } from '../../model/rune-block.model';
import { buildRunePorts } from './spell-node.model';
import { SpellCostResult, CostCase, TurnCostEntry, CaseTotals, TraceStep, TurnSummaryGroup } from './spell-cost.model';

/** When no maxPassthrough is set, cap loops at this value for cost estimation */
const UNLIMITED_LOOP_CAP = 20;

type PortsMap    = Map<string, ReturnType<typeof buildRunePorts>>;
/** Keyed by node INSTANCE ID (SpellNode.id), NOT by rune name */
type NodeRuneMap = Map<string, RuneBlock>;

function buildPortsMap(nodes: SpellNode[], runeByName: Map<string, RuneBlock>): PortsMap {
  const m: PortsMap = new Map();
  for (const n of nodes) {
    const r = runeByName.get(n.runeId);
    if (r) m.set(n.id, buildRunePorts(r as any));
  }
  return m;
}

/** The KEY FIX â€” maps node.id â†’ RuneBlock instead of rune.name â†’ RuneBlock */
function buildNodeRuneMap(nodes: SpellNode[], runeByName: Map<string, RuneBlock>): NodeRuneMap {
  const m: NodeRuneMap = new Map();
  for (const n of nodes) {
    const r = runeByName.get(n.runeId);
    if (r) m.set(n.id, r);
  }
  return m;
}

function isFlowConnection(conn: SpellConnection, portsMap: PortsMap): boolean {
  if (conn.fromNodeId === 'start') return true;
  const ports = portsMap.get(conn.fromNodeId) ?? [];
  const p = ports.find(pp => pp.id === conn.fromPortId);
  return p?.kind === 'flow-out';
}

function getEffectiveMult(
  nodeId: string,
  connections: SpellConnection[],
  nodeRuneMap: NodeRuneMap,
  portsMap: PortsMap,
  visited: Set<string>,
): number {
  if (visited.has(nodeId)) return 1;
  visited.add(nodeId);
  const rune = nodeRuneMap.get(nodeId);
  const ownMult = rune?.manaMult ?? 1;
  const ports = portsMap.get(nodeId) ?? [];
  const manaInPorts = ports.filter(p => p.kind === 'data-in' && p.types.includes('Mana'));
  if (manaInPorts.length === 0) return ownMult;
  let chainMult = 1;
  for (const mp of manaInPorts) {
    const conn = connections.find(c => c.toNodeId === nodeId && c.toPortId === mp.id);
    if (conn) {
      const prov = getEffectiveMult(conn.fromNodeId, connections, nodeRuneMap, portsMap, new Set(visited));
      chainMult = Math.max(chainMult, prov);
    }
  }
  return ownMult * chainMult;
}

function nodeCostWithTrace(
  nodeId: string,
  turn: number,
  connections: SpellConnection[],
  nodeRuneMap: NodeRuneMap,
  portsMap: PortsMap,
): { mana: number; fokus: number; step: TraceStep } {
  const rune = nodeRuneMap.get(nodeId);
  const runeName = rune?.name ?? `[?${nodeId.slice(-6)}]`;
  if (!rune) {
    return { mana: 0, fokus: 0, step: { nodeId, runeName, turn, baseMana: 0, manaMult: 1, finalMana: 0, baseFokus: 0, fokusVerlust: 0, unusedDataPorts: 0, additionalFokus: 0, finalFokus: 0 } };
  }
  const baseMana = rune.mana ?? 0;
  const manaMult = baseMana > 0
    ? getEffectiveMult(nodeId, connections, nodeRuneMap, portsMap, new Set())
    : (rune.manaMult ?? 1);
  const finalMana = baseMana * manaMult;
  const baseFokus = rune.fokus ?? 0;
  const fv = rune.fokusVerlust ?? 0;
  const ports = portsMap.get(nodeId) ?? [];
  const dataInPorts = ports.filter(p => p.kind === 'data-in');
  const usedCount = connections.filter(c => c.toNodeId === nodeId && dataInPorts.some(p => p.id === c.toPortId)).length;
  const unusedDataPorts = Math.max(0, dataInPorts.length - usedCount);
  const additionalFokus = unusedDataPorts * fv;
  const finalFokus = baseFokus + additionalFokus;
  return { mana: finalMana, fokus: finalFokus, step: { nodeId, runeName, turn, baseMana, manaMult, finalMana, baseFokus, fokusVerlust: fv, unusedDataPorts, additionalFokus, finalFokus } };
}

interface Acc { turnMap: Map<number, { mana: number; fokus: number }>; trace: TraceStep[]; subcases: CostCase[]; }

function accumAdd(acc: Acc, turn: number, mana: number, fokus: number) {
  const c = acc.turnMap.get(turn) ?? { mana: 0, fokus: 0 };
  acc.turnMap.set(turn, { mana: c.mana + mana, fokus: c.fokus + fokus });
}

function mergeWorstCase(a: Acc, b: Acc): Acc {
  const r: Acc = { turnMap: new Map(), trace: [], subcases: [] };
  for (const t of new Set([...a.turnMap.keys(), ...b.turnMap.keys()])) {
    const av = a.turnMap.get(t) ?? { mana: 0, fokus: 0 };
    const bv = b.turnMap.get(t) ?? { mana: 0, fokus: 0 };
    r.turnMap.set(t, { mana: Math.max(av.mana, bv.mana), fokus: Math.max(av.fokus, bv.fokus) });
  }
  return r;
}

/** Non-exclusive unknown branches: all fire simultaneously → sum costs */
function mergeSumCase(a: Acc, b: Acc): Acc {
  const r: Acc = { turnMap: new Map(), trace: [], subcases: [] };
  for (const t of new Set([...a.turnMap.keys(), ...b.turnMap.keys()])) {
    const av = a.turnMap.get(t) ?? { mana: 0, fokus: 0 };
    const bv = b.turnMap.get(t) ?? { mana: 0, fokus: 0 };
    r.turnMap.set(t, { mana: av.mana + bv.mana, fokus: av.fokus + bv.fokus });
  }
  return r;
}

/** Merge two TurnCostEntry arrays, summing costs for the same turn */
function mergeEntries(a: TurnCostEntry[], b: TurnCostEntry[]): TurnCostEntry[] {
  const m = new Map<number, { mana: number; fokus: number }>();
  for (const e of [...a, ...b]) {
    const ex = m.get(e.turn) ?? { mana: 0, fokus: 0 };
    m.set(e.turn, { mana: ex.mana + e.mana, fokus: ex.fokus + e.fokus });
  }
  return Array.from(m.entries())
    .map(([t, v]) => ({ turn: t, mana: v.mana, fokus: v.fokus }))
    .sort((a, b) => a.turn - b.turn);
}

function entriesIdentical(a: TurnCostEntry[], b: TurnCostEntry[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((e, i) => e.turn === b[i].turn && Math.abs(e.mana - b[i].mana) < 0.001 && Math.abs(e.fokus - b[i].fokus) < 0.001);
}

/**
 * Compress a sorted list of TurnCostEntry into run-length groups.
 * E.g. turns 1-5 identical → one group {fromTurn:1, toTurn:5}; then turn 6 different → separate group.
 */
function compressTurns(entries: TurnCostEntry[]): TurnSummaryGroup[] {
  if (entries.length === 0) return [];
  const groups: TurnSummaryGroup[] = [];
  let cur = entries[0];
  let fromTurn = cur.turn;
  let prevTurn = cur.turn;
  for (let i = 1; i < entries.length; i++) {
    const e = entries[i];
    const consecutive = e.turn === prevTurn + 1;
    const sameCost = Math.abs(e.mana - cur.mana) < 0.001 && Math.abs(e.fokus - cur.fokus) < 0.001;
    if (consecutive && sameCost) {
      prevTurn = e.turn;
    } else {
      groups.push({ fromTurn, toTurn: prevTurn, mana: cur.mana, fokus: cur.fokus });
      cur = e; fromTurn = e.turn; prevTurn = e.turn;
    }
  }
  groups.push({ fromTurn, toTurn: prevTurn, mana: cur.mana, fokus: cur.fokus });
  return groups;
}

function traverse(
  startNodeId: string, startTurn: number, startPc: Map<string, number>,
  graph: SpellGraph, nodeRuneMap: NodeRuneMap, portsMap: PortsMap, label: string,
): CostCase {
  const acc: Acc = { turnMap: new Map(), trace: [], subcases: [] };
  type SE = { nodeId: string; turn: number; pc: Map<string, number> };
  const stack: SE[] = [{ nodeId: startNodeId, turn: startTurn, pc: new Map(startPc) }];
  const visitCount = new Map<string, number>();

  while (stack.length > 0) {
    const { nodeId, turn, pc } = stack.pop()!;

    if (nodeId !== 'start') {
      const vc = (visitCount.get(nodeId) ?? 0) + 1;
      visitCount.set(nodeId, vc);
      const { mana, fokus, step } = nodeCostWithTrace(nodeId, turn, graph.connections, nodeRuneMap, portsMap);
      if (vc > 1) step.loopPass = vc;
      acc.trace.push(step);
      accumAdd(acc, turn, mana, fokus);
    }

    const outConns = graph.connections.filter(c => c.fromNodeId === nodeId && isFlowConnection(c, portsMap));
    const unconditional   = outConns.filter(c => !c.condition);
    const knownBranches   = outConns.filter(c =>  c.condition &&  c.precastKnown);
    const unknownBranches = outConns.filter(c =>  c.condition && !c.precastKnown);

    // Reverse so first output is processed first (stack is LIFO)
    // limit: explicit maxPassthrough caps the loop; without it the connection is unlimited (capped by UNLIMITED_LOOP_CAP)
    for (const conn of [...unconditional].reverse()) {
      const limit = conn.maxPassthrough ?? UNLIMITED_LOOP_CAP;
      const count = pc.get(conn.id) ?? 0;
      if (count >= limit) continue;
      const nc = new Map(pc);
      nc.set(conn.id, count + 1);
      stack.push({ nodeId: conn.toNodeId, turn: turn + (conn.lineDelay ?? 0), pc: nc });
    }

    if (knownBranches.length > 0) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const isExclusive = knownBranches.some(c => c.exclusive);

      if (isExclusive) {
        // EXCLUSIVE: each branch fires independently — mutually exclusive cases
        knownBranches.forEach((conn, idx) => {
          const limit = conn.maxPassthrough ?? UNLIMITED_LOOP_CAP;
          const count = pc.get(conn.id) ?? 0;
          if (count >= limit) return;
          const nc = new Map(pc);
          nc.set(conn.id, count + 1);
          acc.subcases.push(traverse(conn.toNodeId, turn + (conn.lineDelay ?? 0), nc, graph, nodeRuneMap, portsMap,
            conn.condition || `FALL ${letters[idx]}`));
        });
      } else {
        // NON-EXCLUSIVE: enumerate all 2^N − 1 non-empty subsets (branches can fire simultaneously)
        const n = knownBranches.length;
        for (let mask = 1; mask < (1 << n); mask++) {
          const subset = knownBranches.filter((_, i) => (mask >> i) & 1);
          const subLabel = subset.map(c => c.condition || `F${letters[knownBranches.indexOf(c)]}`).join(' + ');
          const subTurnMap = new Map<number, { mana: number; fokus: number }>();
          const subTrace: TraceStep[] = [];
          for (const conn of subset) {
            const limit = conn.maxPassthrough ?? UNLIMITED_LOOP_CAP;
            const count = pc.get(conn.id) ?? 0;
            if (count >= limit) continue;
            const nc = new Map(pc);
            nc.set(conn.id, count + 1);
            const sub = traverse(conn.toNodeId, turn + (conn.lineDelay ?? 0), nc, graph, nodeRuneMap, portsMap, subLabel);
            for (const e of sub.entries) {
              const ex = subTurnMap.get(e.turn) ?? { mana: 0, fokus: 0 };
              subTurnMap.set(e.turn, { mana: ex.mana + e.mana, fokus: ex.fokus + e.fokus });
            }
            subTrace.push(...sub.trace);
          }
          const entries: TurnCostEntry[] = Array.from(subTurnMap.entries())
            .map(([t, v]) => ({ turn: t, mana: v.mana, fokus: v.fokus }))
            .sort((a, b) => a.turn - b.turn);
          acc.subcases.push({ label: subLabel, entries, trace: subTrace });
        }
      }
    }

    if (unknownBranches.length > 0) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      // exclusive unknown: only one fires → worst-case = max; non-exclusive: all fire → sum
      const isExclusiveUnknown = unknownBranches.some(c => c.exclusive);
      const branchAccs: Acc[] = [];
      unknownBranches.forEach((conn, idx) => {
        const limit = conn.maxPassthrough ?? UNLIMITED_LOOP_CAP;
        const count = pc.get(conn.id) ?? 0;
        if (count >= limit) {
          acc.subcases.push({ label: conn.condition || `Pfad ${letters[idx]}`, entries: [], trace: [], isUnknownMerge: true });
          branchAccs.push({ turnMap: new Map(), trace: [], subcases: [] });
          return;
        }
        const nc = new Map(pc);
        nc.set(conn.id, count + 1);
        const sub = traverse(conn.toNodeId, turn + (conn.lineDelay ?? 0), nc, graph, nodeRuneMap, portsMap, conn.condition || `Pfad ${letters[idx]}`);
        acc.subcases.push({ ...sub, isUnknownMerge: true });
        const subAcc: Acc = { turnMap: new Map(), trace: sub.trace, subcases: [] };
        for (const e of sub.entries) subAcc.turnMap.set(e.turn, { mana: e.mana, fokus: e.fokus });
        branchAccs.push(subAcc);
      });
      if (branchAccs.length > 0) {
        let merged = branchAccs[0];
        for (let i = 1; i < branchAccs.length; i++) {
          merged = isExclusiveUnknown
            ? mergeWorstCase(merged, branchAccs[i])   // exclusive: take max (only one fires)
            : mergeSumCase(merged, branchAccs[i]);     // non-exclusive: sum all (all can fire)
        }
        for (const [t, v] of merged.turnMap) accumAdd(acc, t, v.mana, v.fokus);
      }
    }
  }

  const entries: TurnCostEntry[] = Array.from(acc.turnMap.entries())
    .map(([t, v]) => ({ turn: t, mana: v.mana, fokus: v.fokus }))
    .sort((a, b) => a.turn - b.turn);
  return { label, entries, trace: acc.trace, subcases: acc.subcases.length > 0 ? acc.subcases : undefined };
}

function computeTotals(entries: TurnCostEntry[]): CaseTotals {
  const t0      = entries.find(e => e.turn === 0);
  const delayed = entries.filter(e => e.turn > 0);
  let perTurnMana = 0, perTurnFokus = 0, perTurnUniform = false;
  if (delayed.length > 0) {
    const fm = delayed[0].mana, ff = delayed[0].fokus;
    perTurnUniform = delayed.every(e => e.mana === fm && e.fokus === ff);
    if (perTurnUniform) { perTurnMana = fm; perTurnFokus = ff; }
  }
  const turnSummary = compressTurns(delayed);
  return { mana: t0?.mana ?? 0, fokus: t0?.fokus ?? 0, perTurnMana, perTurnFokus, perTurnUniform, maxRepeats: delayed.length, turnSummary };
}

function sumStatRequirements(nodes: SpellNode[], runeByName: Map<string, RuneBlock>): RuneStatRequirements {
  const req: RuneStatRequirements = {};
  for (const n of nodes) {
    const r = runeByName.get(n.runeId);
    if (!r?.statRequirements) continue;
    const s = r.statRequirements;
    if (s.strength)     req.strength     = (req.strength     ?? 0) + s.strength;
    if (s.dexterity)    req.dexterity    = (req.dexterity    ?? 0) + s.dexterity;
    if (s.speed)        req.speed        = (req.speed        ?? 0) + s.speed;
    if (s.intelligence) req.intelligence = (req.intelligence ?? 0) + s.intelligence;
    if (s.constitution) req.constitution = (req.constitution ?? 0) + s.constitution;
    if (s.chill)        req.chill        = (req.chill        ?? 0) + s.chill;
  }
  return req;
}

export function calculateSpellCost(graph: SpellGraph, availableRunes: RuneBlock[]): SpellCostResult {
  const runeByName  = new Map<string, RuneBlock>(availableRunes.map(r => [r.name, r]));
  const nodeRuneMap = buildNodeRuneMap(graph.nodes, runeByName);
  const portsMap    = buildPortsMap(graph.nodes, runeByName);
  const statRequirements = sumStatRequirements(graph.nodes, runeByName);

  // Detect infinite loops: any unconditional connection without a maxPassthrough that participates in a cycle
  const hasInfiniteLoop = detectInfiniteLoop(graph, portsMap);

  const rootCase = traverse('start', 0, new Map(), graph, nodeRuneMap, portsMap, 'Gesamt');
  const knownSubs = rootCase.subcases?.filter(s => !s.isUnknownMerge) ?? [];
  const hasKnownBranches = knownSubs.length > 0;

  const unknownSubs = rootCase.subcases?.filter(s =>  s.isUnknownMerge) ?? [];
  const allUnknownConns = graph.connections.filter(c => c.condition && !c.precastKnown);
  const unknownMergeMode: 'exclusive' | 'combined' | 'none' =
    allUnknownConns.length === 0 ? 'none'
    : allUnknownConns.some(c => c.exclusive) ? 'exclusive' : 'combined';

  // Merge shared-path costs (rootCase.entries) into each case's fullEntries
  const sharedEntries = rootCase.entries;
  const casesRaw: CostCase[] = hasKnownBranches
    ? knownSubs.map(s => ({ ...s, fullEntries: mergeEntries(sharedEntries, s.entries) }))
    : [{ ...rootCase, label: 'Gesamt', fullEntries: rootCase.entries }];

  // Collapse: if all branch cases have identical full costs → treat as a single "Gesamt"
  const firstFull = casesRaw[0]?.fullEntries ?? [];
  const allIdentical = hasKnownBranches && casesRaw.length > 1 &&
    casesRaw.every(c => entriesIdentical(c.fullEntries ?? [], firstFull));

  const cases: CostCase[] = allIdentical
    ? [{ ...casesRaw[0], label: 'Gesamt' }]
    : casesRaw;
  const finalHasKnownBranches = hasKnownBranches && !allIdentical;

  const caseTotals = cases.map(c => computeTotals(c.fullEntries ?? c.entries));
  const simpleTotals: CaseTotals = caseTotals.length === 1
    ? caseTotals[0]
    : {
        mana:           Math.max(...caseTotals.map(t => t.mana)),
        fokus:          Math.max(...caseTotals.map(t => t.fokus)),
        perTurnMana:    Math.max(...caseTotals.map(t => t.perTurnMana)),
        perTurnFokus:   Math.max(...caseTotals.map(t => t.perTurnFokus)),
        perTurnUniform: caseTotals.every(t => t.perTurnUniform),
        maxRepeats:     Math.max(...caseTotals.map(t => t.maxRepeats)),
      };

  return {
    statRequirements,
    hasKnownBranches: finalHasKnownBranches,
    cases,
    caseTotals,
    simpleTotals,
    hasPerTurnCosts: cases.some(c => (c.fullEntries ?? c.entries).some(e => e.turn > 0)),
    hasInfiniteLoop,
    nodeCount: graph.nodes.length,
    connectionCount: graph.connections.length,
    rootTrace: rootCase.trace,
    sharedEntries,
    unknownBranches: unknownSubs.map(s => ({ label: s.label, entries: s.entries })),
    unknownMergeMode,
  };
}

/** Detect if there's any unconditional cycle with no finite maxPassthrough. */
function detectInfiniteLoop(graph: SpellGraph, portsMap: PortsMap): boolean {
  // Build adjacency from unconditional flow edges that have no maxPassthrough
  const adj = new Map<string, string[]>();
  for (const c of graph.connections) {
    if (c.condition) continue; // conditional branches are not loops
    if (c.maxPassthrough != null) continue; // finite passthrough → not infinite
    if (!isFlowConnection(c, portsMap)) continue;
    const list = adj.get(c.fromNodeId) ?? [];
    list.push(c.toNodeId);
    adj.set(c.fromNodeId, list);
  }
  // DFS cycle detection
  const visited = new Set<string>();
  const inStack = new Set<string>();
  function hasCycle(n: string): boolean {
    if (inStack.has(n)) return true;
    if (visited.has(n)) return false;
    visited.add(n); inStack.add(n);
    for (const nb of adj.get(n) ?? []) { if (hasCycle(nb)) return true; }
    inStack.delete(n);
    return false;
  }
  const allNodes = new Set(['start', ...graph.nodes.map(n => n.id)]);
  for (const n of allNodes) { if (!visited.has(n) && hasCycle(n)) return true; }
  return false;
}

