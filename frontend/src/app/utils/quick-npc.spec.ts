import { describe, expect, it } from 'vitest';
import { NPC_STAT_KEYS, soulPointBudget } from '../model/npc-statblock.model';
import { makeRng } from './gear-generator.util';
import { NPC_BASE_POOL } from './npc-sheet.util';
import { NpcDerivedCalc, rollNpcInstance } from './npc-roll.util';
import { buildQuickNpcTemplate, quickNpcRatio } from './quick-npc.util';

const calc: NpcDerivedCalc = {
  calcReaktionswert: () => 0,
  calcGrundbonus: () => 0,
  calcFokus: (intelligence) => intelligence,
  npcResourceMax: (sb) => ({
    life: NPC_BASE_POOL + (sb.constitution ?? 0) * 5,
    energy: NPC_BASE_POOL + (sb.dexterity ?? 0) * 5,
    mana: NPC_BASE_POOL + (sb.intelligence ?? 0) * 5,
  }),
};
const ctx = { materials: [], traits: [] };
const weaponTypes = [
  { name: 'Schwert', category: 'LEICHT' as const },
  { name: 'Hammer', category: 'SCHWER' as const },
  { name: 'Bogen', category: 'FERNKAMPF' as const },
];

describe('Schnell-NSC: quickNpcRatio', () => {
  it('spreads evenly without traits, whatever the specialisation', () => {
    const ratio = quickNpcRatio([], 1);
    for (const k of NPC_STAT_KEYS) expect(ratio[k]).toBeCloseTo(1 / 6);
  });

  it('spreads evenly at 0 % specialisation', () => {
    const ratio = quickNpcRatio(['zaeh', 'stark'], 0);
    for (const k of NPC_STAT_KEYS) expect(ratio[k]).toBeCloseTo(1 / 6);
  });

  it('ignores untouched stats at 100 %', () => {
    const ratio = quickNpcRatio(['schnell'], 1);
    expect(ratio.speed).toBeCloseTo(1);
    expect(ratio.strength).toBe(0);
  });

  it('shifts weight toward the traits as specialisation grows', () => {
    const low = quickNpcRatio(['stark'], 0.25);
    const high = quickNpcRatio(['stark'], 0.75);
    expect(high.strength).toBeGreaterThan(low.strength);
    expect(high.intelligence).toBeLessThan(low.intelligence);
  });
});

describe('Schnell-NSC: buildQuickNpcTemplate', () => {
  it('spends exactly the player-curve budget of its level', () => {
    const sb = buildQuickNpcTemplate({ name: 'Ork', traits: ['stark', 'zaeh'], specialization: 0.5, level: 7 });
    const spent = NPC_STAT_KEYS.reduce((sum, k) => sum + sb.soul!.stats[k], 0);
    expect(spent).toBe(soulPointBudget(7, 0, 'player'));
    expect(sb.soul!.stats.strength).toBeGreaterThan(sb.soul!.stats.intelligence);
  });

  it('falls back to a name when none was typed', () => {
    expect(buildQuickNpcTemplate({ name: '  ', traits: [], specialization: 0.5, level: 1 }).name).toBe('Gegner');
  });

  it('arms by trait: ranged gets a bow, strong gets a heavy weapon', () => {
    const bow = buildQuickNpcTemplate(
      { name: 'A', traits: ['fernkampf', 'stark'], specialization: 0.5, level: 3, weaponTypes }, makeRng(1));
    expect(bow.variation!.gear!.slots[0]!.weaponTypeName).toBe('Bogen');
    const hammer = buildQuickNpcTemplate(
      { name: 'B', traits: ['stark'], specialization: 0.5, level: 3, weaponTypes }, makeRng(1));
    expect(hammer.variation!.gear!.slots[0]!.weaponTypeName).toBe('Hammer');
    expect(hammer.variation!.gear!.slots[0]!.statRequirementKey).toBe('STR');
  });

  it('never hands out a bow without the ranged trait', () => {
    for (let seed = 1; seed < 50; seed++) {
      const sb = buildQuickNpcTemplate(
        { name: 'C', traits: ['zaeh'], specialization: 0.5, level: 3, weaponTypes }, makeRng(seed));
      expect(sb.variation!.gear!.slots[0]!.weaponTypeName).not.toBe('Bogen');
    }
  });

  it('gepanzert rolls every armour slot for certain', () => {
    const sb = buildQuickNpcTemplate({ name: 'D', traits: ['gepanzert'], specialization: 0.5, level: 3 });
    const armor = sb.variation!.gear!.slots.filter(s => s.armorSlot);
    expect(armor.length).toBe(5);
    expect(armor.every(s => s.chance === 1)).toBe(true);
  });

  it('rolls into different NSCs on different seeds, same total', () => {
    const template = buildQuickNpcTemplate({ name: 'E', traits: ['geschickt'], specialization: 0.5, level: 10 });
    const a = rollNpcInstance(template, ctx, 1, calc);
    const b = rollNpcInstance(template, ctx, 2, calc);
    const total = (sb: typeof a) => NPC_STAT_KEYS.reduce((sum, k) => sum + sb.soul!.stats[k], 0);
    expect(total(a)).toBe(total(b));
    expect(NPC_STAT_KEYS.some(k => a.soul!.stats[k] !== b.soul!.stats[k])).toBe(true);
    expect(a.variation).toBeUndefined();
    expect(a.level).toBe(10);
  });
});
