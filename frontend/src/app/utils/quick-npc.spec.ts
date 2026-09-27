import { describe, expect, it } from 'vitest';
import { NPC_STAT_KEYS, soulPointBudget } from '../model/npc-statblock.model';
import { makeRng } from './gear-generator.util';
import { NPC_BASE_POOL } from './npc-sheet.util';
import { NpcDerivedCalc, rollNpcInstance } from './npc-roll.util';
import {
  buildQuickNpcTemplate, materialPoolForValue, quickGearBudget, quickGearSlots, quickNpcInnate,
  quickNpcRatio,
} from './quick-npc.util';

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
const gear = (archetype: 'krieger' | 'bogenschuetze' | 'magier' | 'klingentaenzer', amount = 6) =>
  ({ archetype, amount, value: 0.5, budget: 10 });

describe('Schnell-NSC: quickNpcRatio', () => {
  it('spreads evenly without stat traits, whatever the specialisation', () => {
    for (const traits of [[], ['gepanzert', 'aggressiv', 'aufmerksam']] as const) {
      const ratio = quickNpcRatio([...traits], 1);
      for (const k of NPC_STAT_KEYS) expect(ratio[k]).toBeCloseTo(1 / 6);
    }
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

describe('Schnell-NSC: ohne Ausrüstung', () => {
  it('has innate Effektivität and Stabilität and no gear', () => {
    const sb = buildQuickNpcTemplate({ name: 'Wolf', traits: [], specialization: 0.5, level: 8 }, makeRng(3));
    expect(sb.body!.useWeaponEffizienz).toBe(false);
    expect(sb.body!.useArmorStabilitaet).toBe(false);
    expect(sb.body!.effizienz).toBeGreaterThanOrEqual(8);
    expect(sb.body!.effizienz).toBeLessThanOrEqual(12);
    expect(sb.variation!.gear).toBeUndefined();
  });

  it('Aggressiv raises Effektivität, Gepanzert raises Stabilität', () => {
    const rng = () => 0.5;
    const plain = quickNpcInnate(8, [], rng);
    const tough = quickNpcInnate(8, ['aggressiv', 'gepanzert'], rng);
    expect(tough.effizienz).toBeGreaterThan(plain.effizienz);
    expect(tough.stabilitaet).toBeGreaterThan(plain.stabilitaet + 10);
  });

  it('Aufmerksam improves (lowers) Reaktion', () => {
    const sb = buildQuickNpcTemplate({ name: 'X', traits: ['aufmerksam'], specialization: 0.5, level: 5 });
    expect(sb.adjust!.reaktion).toBeLessThan(0);
  });

  it('spends exactly the player-curve budget of its level', () => {
    const sb = buildQuickNpcTemplate({ name: 'Ork', traits: ['stark', 'zaeh'], specialization: 0.5, level: 7 });
    const spent = NPC_STAT_KEYS.reduce((sum, k) => sum + sb.soul!.stats[k], 0);
    expect(spent).toBe(soulPointBudget(7, 0, 'player'));
    expect(sb.soul!.stats.strength).toBeGreaterThan(sb.soul!.stats.intelligence);
  });

  it('falls back to a name when none was typed', () => {
    expect(buildQuickNpcTemplate({ name: '  ', traits: [], specialization: 0.5, level: 1 }).name).toBe('Gegner');
  });
});

describe('Schnell-NSC: mit Ausrüstung', () => {
  it('reads Effektivität/Stabilität from the gear, combat traits as bonus', () => {
    const sb = buildQuickNpcTemplate({
      name: 'A', traits: ['aggressiv'], specialization: 0.5, level: 8, gear: gear('krieger'),
    });
    expect(sb.body!.useWeaponEffizienz).toBe(true);
    expect(sb.body!.useArmorStabilitaet).toBe(true);
    expect(sb.body!.effizienzBonus).toBeGreaterThan(0);
    expect(sb.body!.stabilitaetBonus).toBe(0);
    expect(sb.variation!.gear!.settings.budget).toBe(10);
  });

  it('takes the first N pieces of the archetype', () => {
    const slots = quickGearSlots(gear('krieger', 3), weaponTypes, makeRng(1));
    expect(slots.length).toBe(3);
    expect(slots[0]!.weaponTypeName).toBe('Hammer');
    expect(slots[0]!.statRequirementKey).toBe('STR');
    expect(slots[1]!.armorSlot).toBe('chestplate');
  });

  it('archer gets a bow, blade dancer two light blades, mage never a bow', () => {
    expect(quickGearSlots(gear('bogenschuetze', 1), weaponTypes)[0]!.weaponTypeName).toBe('Bogen');
    const blades = quickGearSlots(gear('klingentaenzer', 2), weaponTypes);
    expect(blades.map(s => s.weaponTypeName)).toEqual(['Schwert', 'Schwert']);
    for (let seed = 1; seed < 40; seed++) {
      const mage = quickGearSlots(gear('magier', 1), weaponTypes, makeRng(seed))[0]!;
      expect(mage.weaponTypeName).not.toBe('Bogen');
      expect(mage.statRequirementKey).toBe('INT');
    }
  });

  it('quickGearBudget is 10 around level 8', () => {
    expect(quickGearBudget(8)).toBe(10);
    expect(quickGearBudget(1)).toBeLessThan(10);
    expect(quickGearBudget(20)).toBeGreaterThan(10);
  });
});

describe('Schnell-NSC: materialPoolForValue', () => {
  const mats = [
    { id: 'holz', cost: 1 }, { id: 'eisen', cost: 5 }, { id: 'stahl', cost: 20 },
    { id: 'mithril', cost: 200 }, { id: 'drachen', rarity: 'LEGENDARY' as const },
  ];

  it('cheap value picks the cheapest, high value the rarest', () => {
    expect(materialPoolForValue(mats, 0)).toContain('holz');
    expect(materialPoolForValue(mats, 0)).not.toContain('mithril');
    expect(materialPoolForValue(mats, 1)).toContain('mithril');
    expect(materialPoolForValue(mats, 1)).not.toContain('holz');
  });

  it('never returns an empty pool for a non-empty library', () => {
    for (const v of [0, 0.1, 0.33, 0.5, 0.9, 1]) {
      expect(materialPoolForValue([{ id: 'a', cost: 1 }], v).length).toBe(1);
      expect(materialPoolForValue(mats, v).length).toBeGreaterThan(0);
    }
  });
});

describe('Schnell-NSC: würfeln', () => {
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

  it('keeps the adjustments through a roll', () => {
    const template = buildQuickNpcTemplate({ name: 'F', traits: ['aufmerksam'], specialization: 0.5, level: 4 });
    expect(rollNpcInstance(template, ctx, 1, calc).adjust).toEqual(template.adjust);
  });
});
