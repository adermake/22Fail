import { SpellGraph } from './spell-node.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SimpleSpellCost } from './spell-cost.model';

/**
 * Simple cost estimation: traverse all reachable nodes from start,
 * respecting loop caps (maxPassthrough). Sum mana * manaMult + fokus per node.
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
  let nodeCount = 0;
  const statReqs: Record<string, number> = {};
  const statKeys = ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const;

  for (const [nodeId, visits] of visitCount) {
    if (nodeId === 'start') continue;
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) continue;
    const rune = runeByName.get(node.runeId);
    if (!rune) continue;
    nodeCount++;
    const mana  = (rune.mana  ?? 0) * (rune.manaMult  ?? 1);
    const fokus = (rune.fokus ?? 0);
    totalMana  += mana  * visits;
    totalFokus += fokus * visits;
    // Accumulate stat requirements (additive across all rune visits)
    if (rune.statRequirements) {
      for (const key of statKeys) {
        const val = (rune.statRequirements as Record<string, number | undefined>)[key];
        if (val && val > 0) {
          statReqs[key] = (statReqs[key] ?? 0) + val * visits;
        }
      }
    }
  }

  return {
    mana:      Math.round(totalMana  * 100) / 100,
    fokus:     Math.round(totalFokus * 100) / 100,
    nodeCount,
    statRequirements: statReqs,
  };
}
