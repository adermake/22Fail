import { describe, expect, it } from 'vitest';
import {
  NPC_STAT_KEYS, NpcSoul, NpcStatKey,
  distributeByRatio, normalizeNpcSoul, soulPointBudget,
} from './npc-statblock.model';

const sum = (stats: Record<NpcStatKey, number>) =>
  NPC_STAT_KEYS.reduce((total, k) => total + stats[k], 0);

const ratio = (partial: Partial<Record<NpcStatKey, number>>): Record<NpcStatKey, number> => {
  const out = {} as Record<NpcStatKey, number>;
  for (const k of NPC_STAT_KEYS) out[k] = partial[k] ?? 0;
  return out;
};

describe('distributeByRatio', () => {
  const lopsided = ratio({
    strength: 20, dexterity: 5, speed: 5, intelligence: 3, constitution: 3, wille: 2,
  });

  it('spends the budget exactly', () => {
    for (let level = 1; level <= 60; level++) {
      const budget = soulPointBudget(level);
      expect(sum(distributeByRatio(budget, lopsided))).toBe(budget);
    }
  });

  it('never drops a stat below 1', () => {
    const stats = distributeByRatio(soulPointBudget(1), ratio({ strength: 100 }));
    for (const k of NPC_STAT_KEYS) expect(stats[k]).toBeGreaterThanOrEqual(1);
  });

  it('keeps the proportions — the biggest share stays the biggest', () => {
    const stats = distributeByRatio(soulPointBudget(40), lopsided);
    expect(stats.strength).toBeGreaterThan(stats.dexterity);
    expect(stats.dexterity).toBeGreaterThan(stats.intelligence);
    expect(stats.intelligence).toBeGreaterThan(stats.wille);
  });

  it('returns to the same numbers after a level round-trip', () => {
    // The reason for largest-remainder rather than per-stat rounding: 8 -> 9 -> 8 must land
    // back where it started.
    const at8 = distributeByRatio(soulPointBudget(8), lopsided);
    const at9 = distributeByRatio(soulPointBudget(9), lopsided);
    const backTo8 = distributeByRatio(soulPointBudget(8), lopsided);
    expect(backTo8).toEqual(at8);
    expect(sum(at9)).toBe(sum(at8) + 1);
  });

  it('spreads evenly when there is nothing to weight by', () => {
    const stats = distributeByRatio(soulPointBudget(1), ratio({}));
    expect(sum(stats)).toBe(30);
    // 30 points, 6 stats, no preference: 5 each.
    for (const k of NPC_STAT_KEYS) expect(stats[k]).toBe(5);
  });

  it('stays on the same budget as a hand-built NPC of that level', () => {
    // The old growth x level rule blew past this: a level 10 creature scaled to 40 landed
    // near 240 points where the budget is 69.
    expect(sum(distributeByRatio(soulPointBudget(40), lopsided))).toBe(69);
  });
});

describe('normalizeNpcSoul', () => {
  it('turns a legacy growth soul into a locked one without touching its stats', () => {
    const soul: NpcSoul = {
      level: 10,
      stats: ratio({
        strength: 20, dexterity: 10, speed: 10, intelligence: 6, constitution: 8, wille: 6,
      }),
      growth: ratio({ strength: 2, dexterity: 1, speed: 1 }),
    };
    const before = { ...soul.stats };

    normalizeNpcSoul(soul);

    expect(soul.locked).toBe(true);
    expect(soul.ratio).toEqual(before);
    expect(soul.stats).toEqual(before);
  });

  it('leaves an unlocked soul alone', () => {
    const soul: NpcSoul = { level: 3, stats: ratio({ strength: 5 }) };
    normalizeNpcSoul(soul);
    expect(soul.locked).toBeUndefined();
    expect(soul.ratio).toBeUndefined();
  });

  it('gives a locked soul a ratio if it somehow lacks one', () => {
    const soul: NpcSoul = { level: 3, stats: ratio({ strength: 5, wille: 2 }), locked: true };
    normalizeNpcSoul(soul);
    expect(soul.ratio).toEqual(soul.stats);
  });
});
