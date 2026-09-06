import {
  AppliedTraitState, ARMOR_TYPES, ARMOR_WEIGHT_MULT, ForgeTrait, ForgingArmorType,
  MaterialBlock, SlotMaterialEntry, WeaponStatKey,
  nextForgeCost,
} from '../model/forging.model';
import {
  WeaponTypeBlock, builtinWeaponTypes, forgeSizeFor, formatRangeMeters, primaryDamageType,
} from '../model/weapon-type-block.model';
import { ItemBlock } from '../model/item-block.model';
import { buildForgedItem, effectiveTraitCost, materialFits, spentForgePoints } from './forge-calc.util';

/**
 * Auto-forge: outfit an NPC in one pass instead of running the manual Schmiede five times.
 *
 * Everything here is a pure function of the settings — the same seed and sliders always produce
 * the same gear, so moving a slider re-rolls nothing that was not asked for, and the reroll button
 * is simply "pick a new seed".
 */

// ── Seeded RNG (mulberry32) ──────────────────────────────────────────────────

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fold a label into the seed so each piece rolls independently but reproducibly. */
export function seedFor(seed: number, label: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < label.length; i++) h = (Math.imul(h ^ label.charCodeAt(i), 16777619) >>> 0);
  return h >>> 0;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface GearGenSettings {
  seed: number;
  /** Schmiedepunkte per piece. Default for an NPC: level × 2 + 10. */
  budget: number;
  /** 0–100 %: how far a piece's budget may stray from the nominal one. */
  variation: number;
  /**
   * 0–100 %: how interesting a piece gets — the chance of a Sekundär/Zusatz material (possibly
   * one OUTSIDE the chosen pool) and of Schmiedemerkmale being applied.
   */
  mutation: number;
  /** Material ids the generator draws from. */
  poolIds: string[];
}

export const DEFAULT_GEAR_SETTINGS: GearGenSettings = {
  seed: 1, budget: 20, variation: 25, mutation: 25, poolIds: [],
};

/** The budget an NPC of this level is outfitted with by default. */
export function defaultBudgetForLevel(level: number): number {
  return Math.max(1, Math.floor(level || 1) * 2 + 10);
}

export interface GearGenContext {
  materials: MaterialBlock[];
  traits: ForgeTrait[];
  settings: GearGenSettings;
  /**
   * The Waffentypen to draw from — passed in rather than imported, so the generator uses the
   * same library-defined list the Schmiede does instead of a hardcoded copy. Falls back to the
   * built-ins when a caller does not supply one.
   */
  weaponTypes?: WeaponTypeBlock[];
}

/** One generated piece plus the reasoning behind it, so the GM can see what happened. */
export interface GeneratedPiece {
  key: string;
  label: string;
  item: ItemBlock;
  budget: number;
  spent: number;
  primaryName: string;
  secondaryName?: string;
  bonusName?: string;
  traitNames: string[];
  /** True when a material from outside the pool was pulled in by the mutation slider. */
  mutated: boolean;
}

const pick = <T>(rng: () => number, list: readonly T[]): T | undefined =>
  list.length ? list[Math.floor(rng() * list.length)] : undefined;

/** Budget for one piece after the variation slider. */
export function budgetFor(rng: () => number, settings: GearGenSettings): number {
  const spread = (settings.variation / 100) * settings.budget;
  const offset = (rng() * 2 - 1) * spread;
  return Math.max(1, Math.round(settings.budget + offset));
}

/**
 * Spend points forging the entries. The n-th forge of one entry costs n + 2 SP (the first is 3), so
 * the cheapest next forge always wins — that spreads the budget over the materials rather than dumping it on one.
 */
export function spendOnForges(entries: SlotMaterialEntry[], budget: number): number {
  if (!entries.length) return 0;
  let spent = 0;
  for (;;) {
    let cheapest: SlotMaterialEntry | null = null;
    let cheapestCost = Infinity;
    for (const entry of entries) {
      const cost = nextForgeCost(entry.forgeCount);
      if (cost < cheapestCost) { cheapest = entry; cheapestCost = cost; }
    }
    if (!cheapest || spent + cheapestCost > budget) return spent;
    cheapest.forgeCount++;
    spent += cheapestCost;
  }
}

interface PieceRequest {
  key: string;
  label: string;
  isWeapon: boolean;
  weightMultiplier: number;
  armorSlot?: ItemBlock['armorType'];
  weaponType?: WeaponTypeBlock;
  statRequirementKey?: WeaponStatKey;
}

/** Generate one piece of gear. Pure: same context + request ⇒ same item. */
export function generatePiece(ctx: GearGenContext, request: PieceRequest): GeneratedPiece | null {
  const { settings } = ctx;
  const rng = makeRng(seedFor(settings.seed, request.key));

  const usable = ctx.materials.filter(m => materialFits(m, request.isWeapon));
  const pool = usable.filter(m => settings.poolIds.includes(m.id));
  const outside = usable.filter(m => !settings.poolIds.includes(m.id));
  const source = pool.length ? pool : usable; // empty pool ⇒ draw from everything usable
  if (!source.length) return null;

  const primaryMat = pick(rng, source)!;
  const primary: SlotMaterialEntry[] = [{ material: primaryMat, forgeCount: 0 }];
  const secondary: SlotMaterialEntry[] = [];
  const bonus: SlotMaterialEntry[] = [];
  let mutated = false;

  // Mutation: pull in extra materials — sometimes from outside the pool, which is the whole point.
  const mutationChance = settings.mutation / 100;
  const drawExtra = (): MaterialBlock | undefined => {
    const fromOutside = outside.length > 0 && rng() < mutationChance;
    const from = fromOutside ? outside : source;
    const material = pick(rng, from);
    if (material && fromOutside) mutated = true;
    return material;
  };

  if (rng() < mutationChance) {
    const material = drawExtra();
    if (material) secondary.push({ material, forgeCount: 0 });
  }
  if (rng() < mutationChance * 0.6) {
    const material = drawExtra();
    if (material) bonus.push({ material, forgeCount: 0 });
  }

  const budget = budgetFor(rng, settings);
  let remaining = budget;

  // Traits first — they are fixed-price, so buying them before forging keeps them affordable.
  const traits: AppliedTraitState[] = [];
  const traitPool = ctx.traits.filter(t =>
    !t.appliesTo || t.appliesTo === 'all' || t.appliesTo === (request.isWeapon ? 'weapon' : 'armor'));
  let traitTries = 0;
  while (traitPool.length && rng() < mutationChance && traitTries < 3) {
    traitTries++;
    const trait = pick(rng, traitPool)!;
    const cost = effectiveTraitCost(trait);
    const existing = traits.find(t => t.trait.id === trait.id);
    const level = existing?.level ?? 0;
    if (level >= (trait.maxLevel || 1) || cost > remaining) continue;
    if (existing) existing.level++;
    else traits.push({ trait, level: 1 });
    remaining -= cost;
    mutated = true;
  }

  remaining -= spendOnForges([...primary, ...secondary], remaining);

  const spent = spentForgePoints([primary, secondary, bonus], traits);
  const item = buildForgedItem({
    name: `${request.label} (${primaryMat.name})`,
    isWeapon: request.isWeapon,
    primary, secondary, bonus, traits,
    weightMultiplier: request.weightMultiplier,
    description: `Automatisch geschmiedet · ${spent}/${budget} SP`,
    statRequirementKey: request.statRequirementKey ?? 'STR',
    weaponTypeName: request.weaponType?.name,
    damageType: request.weaponType ? primaryDamageType(request.weaponType) : undefined,
    range: request.weaponType ? weaponRangeText(request.weaponType) : undefined,
    weaponType: request.weaponType,
    armorSlot: request.armorSlot,
    totalSP: budget,
    spentSP: spent,
  });

  return {
    key: request.key,
    label: request.label,
    item,
    budget,
    spent,
    primaryName: primaryMat.name,
    secondaryName: secondary[0]?.material.name,
    bonusName: bonus[0]?.material.name,
    traitNames: traits.map(t => t.trait.name),
    mutated,
  };
}

/** The five armour pieces, in the order the sheet shows them. */
export function generateArmorSet(ctx: GearGenContext): GeneratedPiece[] {
  const order: ForgingArmorType[] = ['Helm', 'Brustplatte', 'Armschienen', 'Hose', 'Stiefel']
    .map(name => ARMOR_TYPES.find(a => a.name === name))
    .filter((a): a is ForgingArmorType => !!a);

  return order
    .map(type => generatePiece(ctx, {
      key: 'armor:' + type.itemBlockType,
      label: type.name,
      isWeapon: false,
      weightMultiplier: ARMOR_WEIGHT_MULT[type.weight],
      armorSlot: type.itemBlockType,
    }))
    .filter((p): p is GeneratedPiece => !!p);
}

const WEAPON_SIZE_MULT = { LIGHT: 0.8, MEDIUM: 1.0, HEAVY: 1.2 } as const;

export interface WeaponRequest {
  /** Stable id so a weapon keeps its roll while others are added or removed. */
  id: string;
  weaponTypeName: string;
  statRequirementKey?: WeaponStatKey;
}

/** The single range text an item shows: the ranged reach for a pure ranged type, else melee. */
function weaponRangeText(w: WeaponTypeBlock): string {
  return formatRangeMeters(w.rangedRange > 0 && !w.meleeRange ? w.rangedRange : w.meleeRange);
}

export function generateWeapons(ctx: GearGenContext, requests: readonly WeaponRequest[]): GeneratedPiece[] {
  return requests
    .map(req => {
      const pool = ctx.weaponTypes?.length ? ctx.weaponTypes : builtinWeaponTypes();
      const type = pool.find(w => w.name === req.weaponTypeName) ?? pool[0];
      return generatePiece(ctx, {
        key: 'weapon:' + req.id,
        label: type.name,
        isWeapon: true,
        weightMultiplier: WEAPON_SIZE_MULT[forgeSizeFor(type)],
        weaponType: type,
        statRequirementKey: req.statRequirementKey,
      });
    })
    .filter((p): p is GeneratedPiece => !!p);
}
