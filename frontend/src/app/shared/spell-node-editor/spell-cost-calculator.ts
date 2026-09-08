import { SpellGraph } from './spell-node.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SimpleSpellCost } from './spell-cost.model';

/**
 * Simple cost estimation: traverse all reachable nodes from start, respecting loop caps
 * (maxPassthrough), and sum mana + fokus per node.
 *
 * Attribute requirements are the exception to plain summing: the heaviest rune in the spell is
 * counted TWICE. Carrying the hardest rune is what actually gates a spell, so a graph built
 * around one demanding rune should read as harder than the same points spread thin.
 */
export function calculateSpellCost(
  graph: SpellGraph,
  availableRunes: RuneBlock[],
): SimpleSpellCost {
  const runeByName = new Map<string, RuneBlock>(availableRunes.map(r => [r.name, r]));

  // BFS / DFS visit count per node, capped by loop passthrough
  const visitCount = new Map<string, number>();

  function maxVisits(nodeId: string): number {
    // Find the passthrough connection pointing TO this node
    const incoming = graph.connections.find(c => c.toNodeId === nodeId && c.passthroughEnabled);
    return incoming?.maxPassthrough ?? 1;
  }

  const queue: string[] = ['start'];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curVisits = (visitCount.get(cur) ?? 0) + 1;
    visitCount.set(cur, curVisits);
    const cap = cur === 'start' ? 1 : maxVisits(cur);
    if (curVisits > cap) continue; // exceeded loop cap — stop expanding

    // Enqueue outgoing neighbours
    for (const conn of graph.connections) {
      if (conn.fromNodeId !== cur) continue;
      queue.push(conn.toNodeId);
    }
  }

  let totalMana = 0;
  let totalFokus = 0;
  let totalEffektivitaet = 0;
  let nodeCount = 0;
  const statReqs: Record<string, number> = {};
  const statKeys = ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const;

  // The heaviest single contribution, kept aside so it can be added a second time at the end.
  let heaviest: { total: number; reqs: Record<string, number> } | null = null;

  for (const [nodeId, visits] of visitCount) {
    if (nodeId === 'start') continue;
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) continue;
    const rune = runeByName.get(node.runeId);
    if (!rune) continue;
    nodeCount++;
    const mana  = rune.mana  ?? 0;
    const fokus = rune.fokus ?? 0;
    const eff   = rune.effektivitaet ?? 0;
    totalMana  += mana  * visits;
    totalFokus += fokus * visits;
    totalEffektivitaet += eff * visits;

    // Stat requirements add up across visits, and the node's own weighted contribution is
    // remembered so the heaviest one can be counted twice below.
    if (rune.statRequirements) {
      const contribution: Record<string, number> = {};
      let contributionTotal = 0;
      for (const key of statKeys) {
        const val = (rune.statRequirements as Record<string, number | undefined>)[key];
        if (val && val > 0) {
          const weighted = val * visits;
          statReqs[key] = (statReqs[key] ?? 0) + weighted;
          contribution[key] = weighted;
          contributionTotal += weighted;
        }
      }
      if (contributionTotal > 0 && (!heaviest || contributionTotal > heaviest.total)) {
        heaviest = { total: contributionTotal, reqs: contribution };
      }
    }
  }

  // The hardest rune counts double.
  if (heaviest) {
    for (const [key, val] of Object.entries(heaviest.reqs)) {
      statReqs[key] = (statReqs[key] ?? 0) + val;
    }
  }

  return {
    mana:      Math.round(totalMana  * 100) / 100,
    fokus:     Math.round(totalFokus * 100) / 100,
    effektivitaet: Math.round(totalEffektivitaet * 100) / 100,
    nodeCount,
    statRequirements: statReqs,
  };
}
