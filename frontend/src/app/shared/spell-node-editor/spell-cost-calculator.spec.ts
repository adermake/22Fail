import { describe, expect, it } from 'vitest';
import { calculateSpellCost } from './spell-cost-calculator';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellGraph } from './spell-node.model';

const rune = (name: string, partial: Partial<RuneBlock> = {}): RuneBlock => ({
  name, description: '', drawing: '', tags: [], ...partial,
} as RuneBlock);

/** A straight chain start -> n1 -> n2 -> ... over the given rune names. */
const chain = (runeIds: string[]): SpellGraph => ({
  nodes: runeIds.map((runeId, i) => ({ id: `n${i}`, runeId, x: 0, y: 0 })),
  connections: runeIds.map((_, i) => ({
    id: `c${i}`,
    fromNodeId: i === 0 ? 'start' : `n${i - 1}`,
    toNodeId: `n${i}`,
  })),
} as unknown as SpellGraph);

describe('calculateSpellCost', () => {
  it('sums mana straight from the rune, with no multiplier', () => {
    // manaMult used to sit between these two, and both creation paths defaulted it to 0 —
    // so every rune made in the UI estimated mana x 0 = 0.
    const runes = [rune('A', { mana: 4 }), rune('B', { mana: 6 })];
    const cost = calculateSpellCost(chain(['A', 'B']), runes);
    expect(cost.mana).toBe(10);
  });

  it('sums fokus and effektivität across the graph', () => {
    const runes = [rune('A', { fokus: 2, effektivitaet: 3 }), rune('B', { fokus: 5, effektivitaet: 1 })];
    const cost = calculateSpellCost(chain(['A', 'B']), runes);
    expect(cost.fokus).toBe(7);
    expect(cost.effektivitaet).toBe(4);
    expect(cost.nodeCount).toBe(2);
  });

  it('counts the heaviest requirement rune twice', () => {
    const runes = [
      rune('Schwer', { statRequirements: { strength: 10, intelligence: 2 } }),
      rune('Leicht', { statRequirements: { strength: 3 } }),
    ];
    const cost = calculateSpellCost(chain(['Schwer', 'Leicht']), runes);
    // STR: 10 + 3 summed, then the heavier rune (total 12) added again -> +10.
    expect(cost.statRequirements['strength']).toBe(23);
    // The doubled rune brings its whole block, not just its biggest stat.
    expect(cost.statRequirements['intelligence']).toBe(4);
  });

  it('doubles by the rune total, not by a single stat', () => {
    // "Breit" has the larger total (9) even though "Spitz" has the single biggest stat (8).
    const runes = [
      rune('Spitz', { statRequirements: { strength: 8 } }),
      rune('Breit', { statRequirements: { strength: 3, dexterity: 3, speed: 3 } }),
    ];
    const cost = calculateSpellCost(chain(['Spitz', 'Breit']), runes);
    expect(cost.statRequirements['strength']).toBe(14); // 8 + 3 + 3 doubled
    expect(cost.statRequirements['dexterity']).toBe(6); // 3 + 3 doubled
  });

  it('doubles a lone requirement rune too', () => {
    // Runes name the sixth stat `chill`; the NPC model calls the same stat `wille`.
    const runes = [rune('Einzig', { statRequirements: { chill: 4 } })];
    const cost = calculateSpellCost(chain(['Einzig']), runes);
    expect(cost.statRequirements['chill']).toBe(8);
  });

  it('reports no requirements when no rune has any', () => {
    const cost = calculateSpellCost(chain(['A']), [rune('A', { mana: 1 })]);
    expect(cost.statRequirements).toEqual({});
  });
});
