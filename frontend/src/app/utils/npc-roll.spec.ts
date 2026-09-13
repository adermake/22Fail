import { describe, expect, it } from 'vitest';
import { ItemBlock } from '../model/item-block.model';
import {
  NPC_STAT_KEYS, NpcRollEntry, NpcStatblock, createEmptyNpcStatblock, hasNpcVariation,
  normalizeNpcVariation, soulPointBudget,
} from '../model/npc-statblock.model';
import { makeRng } from './gear-generator.util';
import {
  NpcDerivedCalc, rollEquipment, rollInventory, rollNpcInstance, rollSoul, rollSubset,
} from './npc-roll.util';

const calc: NpcDerivedCalc = {
  calcReaktionswert: () => 0,
  calcGrundbonus: () => 0,
  calcFokus: (intelligence) => intelligence,
};
const ctx = { materials: [], traits: [] };
const entries = (...chances: number[]): NpcRollEntry[] => chances.map(chance => ({ chance }));
const item = (partial: Partial<ItemBlock>): ItemBlock => ({ name: 'X', ...partial }) as ItemBlock;

describe('NSC-Variation: rollSubset', () => {
  it('respects min and max across many seeds', () => {
    const list = entries(0.1, 0.4, 0.2);
    for (let seed = 1; seed < 500; seed++) {
      const picked = rollSubset(list, { min: 1, max: 2 }, makeRng(seed));
      expect(picked.length).toBeGreaterThanOrEqual(1);
      expect(picked.length).toBeLessThanOrEqual(2);
    }
  });

  it('never picks a chance of 0, even to reach min', () => {
    for (let seed = 1; seed < 200; seed++) {
      expect(rollSubset(entries(0, 0), { min: 2 }, makeRng(seed))).toEqual([]);
    }
  });

  it('always picks a chance of 1 when nothing caps it', () => {
    for (let seed = 1; seed < 200; seed++) {
      expect(rollSubset(entries(1, 1, 1), { min: 0 }, makeRng(seed))).toEqual([0, 1, 2]);
    }
  });

  it('is reproducible for the same seed', () => {
    const list = entries(0.5, 0.5, 0.5, 0.5);
    expect(rollSubset(list, { min: 0 }, makeRng(42))).toEqual(rollSubset(list, { min: 0 }, makeRng(42)));
  });
});

describe('rollSoul', () => {
  const soul = {
    level: 4,
    stats: { strength: 12, dexterity: 5, speed: 5, intelligence: 3, constitution: 6, wille: 2 },
  };

  it('keeps the point budget of the rolled level', () => {
    for (let seed = 1; seed < 200; seed++) {
      const rolled = rollSoul(soul, { enabled: true, levelMin: 3, levelMax: 6, shuffle: 4 }, makeRng(seed));
      expect(rolled.level).toBeGreaterThanOrEqual(3);
      expect(rolled.level).toBeLessThanOrEqual(6);
      const total = NPC_STAT_KEYS.reduce((sum, k) => sum + rolled.stats[k], 0);
      expect(total).toBe(soulPointBudget(rolled.level));
      for (const k of NPC_STAT_KEYS) expect(rolled.stats[k]).toBeGreaterThanOrEqual(1);
    }
  });

  it('changes nothing while disabled', () => {
    expect(rollSoul(soul, { enabled: false, levelMin: 1, levelMax: 9, shuffle: 5 }, makeRng(1))).toEqual(soul);
  });
});

describe('rollEquipment', () => {
  it('lets only one piece occupy an armour slot', () => {
    const helmets = [
      item({ name: 'Helm A', itemType: 'armor', armorType: 'helmet' }),
      item({ name: 'Helm B', itemType: 'armor', armorType: 'helmet' }),
      item({ name: 'Schwert', itemType: 'weapon' }),
      item({ name: 'Dolch', itemType: 'weapon' }),
    ];
    const list = { mode: 'random' as const, min: 0, entries: entries(1, 1, 1, 1) };
    for (let seed = 1; seed < 50; seed++) {
      const rolled = rollEquipment(helmets, list, undefined, undefined, ctx, seed);
      expect(rolled.filter(i => i.armorType === 'helmet')).toHaveLength(1);
      expect(rolled.filter(i => i.itemType === 'weapon')).toHaveLength(2);
    }
  });

  it('takes everything in fixed mode', () => {
    const items = [item({ armorType: 'helmet' }), item({ armorType: 'helmet' })];
    expect(rollEquipment(items, { mode: 'fixed', min: 0, entries: entries(0, 0) }, undefined, undefined, ctx, 1)).toHaveLength(2);
  });

  const armory = [
    item({ name: 'Helm A', itemType: 'armor', armorType: 'helmet' }),
    item({ name: 'Helm B', itemType: 'armor', armorType: 'helmet' }),
    item({ name: 'Stiefel', itemType: 'armor', armorType: 'boots' }),
    item({ name: 'Hose', itemType: 'armor', armorType: 'leggings' }),
    item({ name: 'Schwert', itemType: 'weapon' }),
    item({ name: 'Dolch', itemType: 'weapon' }),
    item({ name: 'Bogen', itemType: 'weapon' }),
    item({ name: 'Ring', itemType: 'other' }),
  ];
  const kinds = (rolled: ItemBlock[]) => ({
    armor: rolled.filter(i => i.itemType === 'armor').length,
    weapons: rolled.filter(i => i.itemType === 'weapon').length,
  });

  it('caps Rüstung and Waffen separately', () => {
    const list = { mode: 'random' as const, min: 0, entries: entries(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5) };
    const groups = { armor: { min: 1, max: 2 }, weapons: { min: 1, max: 1 } };
    for (let seed = 1; seed < 300; seed++) {
      const { armor, weapons } = kinds(rollEquipment(armory, list, undefined, groups, ctx, seed));
      expect(armor).toBeGreaterThanOrEqual(1);
      expect(armor).toBeLessThanOrEqual(2);
      expect(weapons).toBe(1);
    }
  });

  it('never fills an armour min with a second piece for the same slot', () => {
    const list = { mode: 'random' as const, min: 0, entries: entries(0.3, 0.3, 0.3, 0.3, 0, 0, 0, 0) };
    const groups = { armor: { min: 4 }, weapons: { min: 0 } };
    for (let seed = 1; seed < 100; seed++) {
      const rolled = rollEquipment(armory, list, undefined, groups, ctx, seed);
      expect(rolled.filter(i => i.armorType === 'helmet')).toHaveLength(1);
      expect(kinds(rolled).armor).toBe(3);
    }
  });

  it('rolls other items on chance alone, outside both groups', () => {
    const list = { mode: 'random' as const, min: 0, entries: entries(1, 1, 1, 1, 1, 1, 1, 1) };
    const groups = { armor: { min: 0, max: 0 }, weapons: { min: 0, max: 0 } };
    expect(rollEquipment(armory, list, undefined, groups, ctx, 5).map(i => i.name)).toEqual(['Ring']);
  });
});

describe('rollInventory', () => {
  it('rolls amounts inside the range and merges equal stacks', () => {
    const apple = item({ name: 'Apfel', stackable: true, amount: 1 });
    const list = {
      mode: 'random' as const, min: 0,
      entries: [{ chance: 1, min: 1, max: 3 }, { chance: 1, min: 2, max: 2 }],
    };
    for (let seed = 1; seed < 100; seed++) {
      const rolled = rollInventory([apple, { ...apple } as ItemBlock], list, seed);
      expect(rolled).toHaveLength(1);
      expect(rolled[0]!.amount).toBeGreaterThanOrEqual(3);
      expect(rolled[0]!.amount).toBeLessThanOrEqual(5);
    }
  });

  it('turns an amount range on an unstackable item into copies', () => {
    const list = { mode: 'random' as const, min: 0, entries: [{ chance: 1, min: 2, max: 2 }] };
    expect(rollInventory([item({ name: 'Dolch' })], list, 7)).toHaveLength(2);
  });
});

describe('rollNpcInstance', () => {
  const goblin = (): NpcStatblock => {
    const sb = createEmptyNpcStatblock();
    sb.spells = [{ name: 'Feuerball' }, { name: 'Eiswand' }, { name: 'Blutbolzen' }] as NpcStatblock['spells'];
    sb.inventory = [item({ name: 'Apfel', stackable: true, amount: 4 })];
    return sb;
  };

  it('is an identity copy when every list is fixed', () => {
    const sb = goblin();
    normalizeNpcVariation(sb);
    expect(hasNpcVariation(sb)).toBe(false);
    const rolled = rollNpcInstance(sb, ctx, 3, calc);
    expect(rolled.spells.map(s => s.name)).toEqual(['Feuerball', 'Eiswand', 'Blutbolzen']);
    expect(rolled.inventory[0]!.amount).toBe(4);
    expect(rolled.variation).toBeUndefined();
  });

  it('rolls a random spell list within min/max and leaves the template untouched', () => {
    const sb = goblin();
    const v = normalizeNpcVariation(sb);
    v.lists!.spells = { mode: 'random', min: 1, max: 2, entries: entries(0.1, 0.4, 0.2) };
    expect(hasNpcVariation(sb)).toBe(true);
    for (let seed = 1; seed < 100; seed++) {
      const count = rollNpcInstance(sb, ctx, seed, calc).spells.length;
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(2);
    }
    expect(sb.spells).toHaveLength(3);
  });

  it('writes the rolled soul into the flat stats', () => {
    const sb = goblin();
    sb.soul = { level: 1, stats: { strength: 10, dexterity: 5, speed: 5, intelligence: 4, constitution: 4, wille: 2 } };
    normalizeNpcVariation(sb).stats = { enabled: true, levelMin: 5, levelMax: 5, shuffle: 0 };
    const rolled = rollNpcInstance(sb, ctx, 11, calc);
    expect(rolled.level).toBe(5);
    expect(rolled.maxHealth).toBe(rolled.soul!.stats.constitution * 5);
    expect(rolled.fokus).toBe(rolled.intelligence);
  });
});
