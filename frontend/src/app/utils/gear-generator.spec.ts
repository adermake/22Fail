import {
  DEFAULT_GEAR_SETTINGS, GearGenContext, GearGenSettings, budgetFor, defaultBudgetForLevel,
  generateArmorSet, generatePiece, generateWeapons, makeRng, seedFor, spendOnForges,
} from './gear-generator.util';
import { aggregateSlot, buildForgedItem, halveSlot, spentForgePoints } from './forge-calc.util';
import { ForgeTrait, MaterialBlock, SlotMaterialEntry } from '../model/forging.model';

/** Two plain materials plus one that only works for weapons, so filtering is observable. */
function material(id: string, name: string, opts: Partial<MaterialBlock> = {}): MaterialBlock {
  return {
    id, name, isPublic: true,
    canBeWeaponMaterial: true, canBeArmorMaterial: true,
    weaponStats: {
      haltbarkeit: 50, haltbarkeitSkalierung: 10, effektivitaet: 5, effektivitaetSkalierung: 2,
      extraEffect: '', weight: 1, reqBase: 0, reqScaling: 0,
    },
    armorStats: {
      haltbarkeit: 80, haltbarkeitSkalierung: 15, effektivitaet: 5, effektivitaetSkalierung: 2,
      extraEffect: '', weight: 2, ruestungsmalus: 2, reqBase: 0, reqScaling: 0,
    },
    ...opts,
  } as MaterialBlock;
}

function trait(id: string, cost: number, opts: Partial<ForgeTrait> = {}): ForgeTrait {
  return {
    id, name: 'Merkmal ' + id, effect: 'Effekt [L]', schmiedepunktKosten: cost,
    maxLevel: 1, scalable: false, isPublic: true, appliesTo: 'all', ...opts,
  } as ForgeTrait;
}

const MATERIALS = [
  material('m1', 'Eisen'),
  material('m2', 'Stahl'),
  material('m3', 'Mithril'),
  material('m4', 'Drachenknochen'),
];

function ctx(settings: Partial<GearGenSettings> = {}, traits: ForgeTrait[] = []): GearGenContext {
  return {
    materials: MATERIALS,
    traits,
    settings: { ...DEFAULT_GEAR_SETTINGS, seed: 42, budget: 20, poolIds: ['m1', 'm2'], ...settings },
  };
}

describe('seeded RNG', () => {
  it('is deterministic for a seed', () => {
    const a = makeRng(7), b = makeRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('gives different streams for different seeds', () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });

  it('derives an independent stream per piece label', () => {
    expect(seedFor(5, 'armor:helmet')).not.toBe(seedFor(5, 'armor:boots'));
    expect(seedFor(5, 'armor:helmet')).toBe(seedFor(5, 'armor:helmet'));
  });
});

describe('budget', () => {
  it('defaults to level × 2 + 10', () => {
    expect(defaultBudgetForLevel(1)).toBe(12);
    expect(defaultBudgetForLevel(10)).toBe(30);
  });

  it('never drops below 1 for level 0', () => {
    expect(defaultBudgetForLevel(0)).toBeGreaterThanOrEqual(1);
  });

  it('stays exactly on budget with no variation', () => {
    const settings = { ...DEFAULT_GEAR_SETTINGS, budget: 20, variation: 0 };
    expect(budgetFor(makeRng(1), settings)).toBe(20);
  });

  it('strays at most ±variation % of the budget', () => {
    const settings = { ...DEFAULT_GEAR_SETTINGS, budget: 100, variation: 30 };
    for (let seed = 0; seed < 50; seed++) {
      const b = budgetFor(makeRng(seed), settings);
      expect(b).toBeGreaterThanOrEqual(70);
      expect(b).toBeLessThanOrEqual(130);
    }
  });
});

describe('spending forge points', () => {
  it('spends on the cheapest next forge, spreading across materials', () => {
    const entries: SlotMaterialEntry[] = [
      { material: MATERIALS[0], forgeCount: 0 },
      { material: MATERIALS[1], forgeCount: 0 },
    ];
    // Each first forge costs 3, so 6 buys one forge per material; the next would cost 4.
    const spent = spendOnForges(entries, 6);
    expect(spent).toBe(6);
    expect(entries.map(e => e.forgeCount)).toEqual([1, 1]);
  });

  it('never overspends', () => {
    const entries: SlotMaterialEntry[] = [{ material: MATERIALS[0], forgeCount: 0 }];
    expect(spendOnForges(entries, 2)).toBe(0); // a forge costs 3 — 2 SP buys nothing
    expect(entries[0].forgeCount).toBe(0);
    expect(spendOnForges(entries, 4)).toBe(3); // 3 for the first, the second would cost 4
    expect(entries[0].forgeCount).toBe(1);
  });

  it('does nothing without entries or budget', () => {
    expect(spendOnForges([], 100)).toBe(0);
    const entries: SlotMaterialEntry[] = [{ material: MATERIALS[0], forgeCount: 0 }];
    expect(spendOnForges(entries, 0)).toBe(0);
  });
});

describe('generating a full armour set', () => {
  it('produces all five pieces, each in its own slot', () => {
    const set = generateArmorSet(ctx());
    expect(set.map(p => p.label)).toEqual(['Helm', 'Brustplatte', 'Armschienen', 'Hose', 'Stiefel']);
    expect(set.map(p => p.item.armorType))
      .toEqual(['helmet', 'chestplate', 'armschienen', 'leggings', 'boots']);
    expect(set.every(p => p.item.itemType === 'armor')).toBe(true);
  });

  it('is deterministic for a seed', () => {
    const a = generateArmorSet(ctx());
    const b = generateArmorSet(ctx());
    expect(a.map(p => [p.primaryName, p.spent, p.item.stability]))
      .toEqual(b.map(p => [p.primaryName, p.spent, p.item.stability]));
  });

  it('changes when the seed is rerolled', () => {
    const a = generateArmorSet(ctx({ seed: 1 }));
    const b = generateArmorSet(ctx({ seed: 2 }));
    const same = a.every((p, i) => p.primaryName === b[i].primaryName && p.spent === b[i].spent);
    expect(same).toBe(false);
  });

  it('keeps every piece within its rolled budget', () => {
    for (let seed = 1; seed <= 20; seed++) {
      for (const piece of generateArmorSet(ctx({ seed, mutation: 60 }))) {
        expect(piece.spent).toBeLessThanOrEqual(piece.budget);
      }
    }
  });

  it('draws only from the pool while mutation is off', () => {
    const set = generateArmorSet(ctx({ mutation: 0, poolIds: ['m1'] }));
    expect(set.every(p => p.primaryName === 'Eisen')).toBe(true);
    expect(set.every(p => !p.mutated)).toBe(true);
  });

  it('pulls in materials outside the pool as mutation rises', () => {
    const tame = generateArmorSet(ctx({ mutation: 0, poolIds: ['m1'] }));
    const wild = generateArmorSet(ctx({ mutation: 100, poolIds: ['m1'] }));
    expect(tame.some(p => p.mutated)).toBe(false);
    expect(wild.some(p => p.mutated)).toBe(true);
  });

  it('adds Schmiedemerkmale only when mutation allows it', () => {
    const traits = [trait('t1', 3), trait('t2', 4)];
    const tame = generateArmorSet(ctx({ mutation: 0 }, traits));
    const wild = generateArmorSet(ctx({ mutation: 100, budget: 60 }, traits));
    expect(tame.every(p => p.traitNames.length === 0)).toBe(true);
    expect(wild.some(p => p.traitNames.length > 0)).toBe(true);
  });

  it('falls back to all usable materials when the pool is empty', () => {
    const set = generateArmorSet(ctx({ poolIds: [] }));
    expect(set.length).toBe(5);
  });

  it('returns nothing when no material fits the item kind', () => {
    const weaponOnly = [material('w1', 'Klingenstahl', { canBeArmorMaterial: false })];
    const set = generateArmorSet({ materials: weaponOnly, traits: [], settings: { ...DEFAULT_GEAR_SETTINGS } });
    expect(set).toEqual([]);
  });

  it('gives a bigger budget better armour', () => {
    const poor = generateArmorSet(ctx({ budget: 5, variation: 0, mutation: 0 }));
    const rich = generateArmorSet(ctx({ budget: 60, variation: 0, mutation: 0 }));
    const stability = (set: typeof poor) => set.reduce((sum, p) => sum + (p.item.stability ?? 0), 0);
    expect(stability(rich)).toBeGreaterThan(stability(poor));
  });
});

describe('generating weapons', () => {
  it('honours the chosen weapon type', () => {
    const [weapon] = generateWeapons(ctx(), [{ id: 'w1', weaponTypeName: 'Langschwert' }]);
    expect(weapon.item.weaponTypeName).toBe('Langschwert');
    expect(weapon.item.itemType).toBe('weapon');
    expect(weapon.item.damageType).toBe('Schnitt');
    expect(weapon.item.efficiency).toBeGreaterThan(0);
  });

  it('rolls each weapon independently but reproducibly', () => {
    const reqs = [
      { id: 'w1', weaponTypeName: 'Dolch' },
      { id: 'w2', weaponTypeName: 'Dolch' },
    ];
    const a = generateWeapons(ctx(), reqs);
    const b = generateWeapons(ctx(), reqs);
    expect(a.map(p => p.spent)).toEqual(b.map(p => p.spent));
    // Same type, different id ⇒ different roll.
    expect(a[0].item.durability === a[1].item.durability && a[0].primaryName === a[1].primaryName)
      .toBe(false);
  });

  it('keeps an existing weapon roll when another weapon is added', () => {
    const first = generateWeapons(ctx(), [{ id: 'w1', weaponTypeName: 'Axt' }]);
    const both = generateWeapons(ctx(), [
      { id: 'w1', weaponTypeName: 'Axt' },
      { id: 'w2', weaponTypeName: 'Bogen' as string },
    ]);
    expect(both[0].spent).toBe(first[0].spent);
    expect(both[0].primaryName).toBe(first[0].primaryName);
  });

  it('sets a stat requirement when the material demands one', () => {
    const demanding = [material('m9', 'Schwermetall', {
      weaponStats: {
        haltbarkeit: 50, haltbarkeitSkalierung: 10, effektivitaet: 5, effektivitaetSkalierung: 2,
        extraEffect: '', weight: 3, reqBase: 12, reqScaling: 1,
      },
    })];
    const [weapon] = generateWeapons(
      { materials: demanding, traits: [], settings: { ...DEFAULT_GEAR_SETTINGS, seed: 3, poolIds: ['m9'] } },
      [{ id: 'w1', weaponTypeName: 'Hammer', statRequirementKey: 'STR' }],
    );
    expect(weapon.item.requirements?.strength).toBeGreaterThan(0);
  });
});

describe('forge maths shared with the manual Schmiede', () => {
  it('halves the secondary slot', () => {
    const raw = aggregateSlot([{ material: MATERIALS[0], forgeCount: 0 }], false)!;
    const halved = halveSlot(raw)!;
    expect(halved.haltbarkeit).toBe(Math.floor(raw.haltbarkeit / 2));
    expect(halved.effektivitaet).toBe(Math.floor(raw.effektivitaet / 2));
  });

  it('counts SP as 3+4+…+(n+2) per entry plus trait costs', () => {
    const entries: SlotMaterialEntry[] = [{ material: MATERIALS[0], forgeCount: 3 }];
    const traits = [{ trait: trait('t1', 5), level: 2 }];
    expect(spentForgePoints([entries], traits)).toBe(12 + 10);
  });

  it('builds an armour item with durability, stability and malus', () => {
    const item = buildForgedItem({
      name: 'Testhelm', isWeapon: false,
      primary: [{ material: MATERIALS[0], forgeCount: 2 }],
      secondary: [], bonus: [], traits: [],
      weightMultiplier: 1, armorSlot: 'helmet', totalSP: 10, spentSP: 3,
    });
    expect(item.itemType).toBe('armor');
    expect(item.armorType).toBe('helmet');
    expect(item.durability).toBe(80 + 2 * 15);
    expect(item.stability).toBe(5 + 2 * 2);
    expect(item.armorDebuff).toBe(2);
    expect(item.maxDurability).toBe(item.durability);
  });
});
