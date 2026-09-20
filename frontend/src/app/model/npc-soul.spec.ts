import { describe, expect, it } from 'vitest';
import {
  NPC_STAT_KEYS, NpcSoul, NpcStatKey,
  distributeByRatio, normalizeNpcSoul, soulBudget, soulPointBudget, soulPointsRemaining,
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

describe('soulPointBudget — Zusatzpunkte', () => {
  it('adds the bonus on top of the level budget', () => {
    expect(soulPointBudget(1)).toBe(30);
    expect(soulPointBudget(1, 30)).toBe(60);   // Level 1 mit 60 statt 30 Punkten
    expect(soulPointBudget(10, 30)).toBe(69);  // 39 vom Level + 30 Zusatz
  });

  it('allows a negative bonus but never goes below one point per stat', () => {
    expect(soulPointBudget(1, -10)).toBe(20);
    expect(soulPointBudget(1, -100)).toBe(NPC_STAT_KEYS.length);
  });

  it('ignores a missing or unusable bonus', () => {
    expect(soulPointBudget(5, undefined)).toBe(34);
    expect(soulPointBudget(5, NaN)).toBe(34);
  });

  it('is what a soul and its remaining points are measured against', () => {
    const soul: NpcSoul = { level: 1, stats: ratio({}), bonusPoints: 30 };
    for (const k of NPC_STAT_KEYS) soul.stats[k] = 1;
    expect(soulBudget(soul)).toBe(60);
    expect(soulPointsRemaining(soul)).toBe(54);
  });

  it('spends the extra points along the ratio when the soul is locked', () => {
    const lopsided = ratio({ strength: 20, dexterity: 5, speed: 5, intelligence: 3, constitution: 3, wille: 2 });
    const stats = distributeByRatio(soulPointBudget(1, 30), lopsided);
    expect(sum(stats)).toBe(60);
    expect(stats.strength).toBeGreaterThan(stats.dexterity);
  });
});

describe('soulPointBudget — Skalierung', () => {
  it('summon is the flat soul-rune curve (30 + 1 per level)', () => {
    expect(soulPointBudget(1, 0, 'summon')).toBe(30);
    expect(soulPointBudget(10, 0, 'summon')).toBe(39);
    // Omitted scaling behaves exactly like 'summon' — stored statblocks must not change.
    expect(soulPointBudget(10)).toBe(soulPointBudget(10, 0, 'summon'));
  });

  it('player starts at a race\'s 60 points and gains 1,5 per level plus free points', () => {
    expect(soulPointBudget(1, 0, 'player')).toBe(60);
    expect(soulPointBudget(3, 0, 'player')).toBe(64);   // 60 + 3 + 1 freier Punkt
    expect(soulPointBudget(10, 0, 'player')).toBe(76);  // 60 + 13 + 3
    expect(soulPointBudget(20, 0, 'player')).toBe(94);  // 60 + 28 + 6
  });

  it('is the level a summon needs to match a level-1 player', () => {
    // The gap this option exists for: on the flat curve, 60 points arrive at level 31.
    expect(soulPointBudget(31, 0, 'summon')).toBe(soulPointBudget(1, 0, 'player'));
  });

  it('adds Zusatzpunkte on either curve', () => {
    expect(soulPointBudget(1, 30, 'summon')).toBe(60);
    expect(soulPointBudget(1, 30, 'player')).toBe(90);
  });

  it('a soul carries its own curve', () => {
    const soul: NpcSoul = { level: 10, stats: ratio({}), scaling: 'player' };
    expect(soulBudget(soul)).toBe(76);
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
