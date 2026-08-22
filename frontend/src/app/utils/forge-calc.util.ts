import {
  AppliedTraitState, ForgeTrait, ForgedStatPreview, ForgedMaterialRecord, ForgingData,
  MaterialBlock, SlotMaterialEntry, WEAPON_STAT_TO_REQUIREMENT, WeaponStatKey,
  computeForgedStats, formatTraitEffect, totalForgeSPSpent,
} from '../model/forging.model';
import { ItemBlock, ItemRequirements } from '../model/item-block.model';

/**
 * The forging maths, in one place: the manual Schmiede and the gear generator both run through
 * these functions, so a generated piece is exactly what a hand-forged one with the same inputs
 * would be.
 *
 * Slot rules: Primär contributes all stats, Sekundär half, Zusatz only its extra effect.
 */

/** Aggregate one slot's entries (stack levels honoured for the effect text). */
export function aggregateSlot(
  entries: readonly SlotMaterialEntry[],
  isWeapon: boolean,
): ForgedStatPreview | null {
  if (!entries.length) return null;

  const stackCounts = new Map<string, number>();
  for (const entry of entries) {
    stackCounts.set(entry.material.id, (stackCounts.get(entry.material.id) ?? 0) + 1);
  }

  let h = 0, e = 0, w = 0, mal = 0, req = 0;
  const effectParts: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const preview = computeForgedStats(entry.material, entry.forgeCount, isWeapon);
    if (!preview) continue;
    h += preview.haltbarkeit;
    e += preview.effektivitaet;
    w += preview.weight;
    mal += preview.ruestungsmalus ?? 0;
    req += preview.statRequirement;

    if (seen.has(entry.material.id)) continue;
    seen.add(entry.material.id);
    const mat = entry.material;
    const count = stackCounts.get(mat.id) ?? 1;
    if (mat.stackable && mat.stackLevels?.length) {
      const idx = Math.min(count - 1, mat.stackLevels.length - 1);
      if (mat.stackLevels[idx]) effectParts.push(mat.stackLevels[idx]);
    } else if (preview.extraEffect) {
      effectParts.push(preview.extraEffect);
    }
  }

  return {
    haltbarkeit: h, effektivitaet: e, weight: w,
    ruestungsmalus: mal || undefined,
    extraEffect: effectParts.join(', '),
    statRequirement: req,
  };
}

/** The Sekundär slot counts half — stats floored, weight exact. */
export function halveSlot(raw: ForgedStatPreview | null): ForgedStatPreview | null {
  if (!raw) return null;
  return {
    ...raw,
    haltbarkeit: Math.floor(raw.haltbarkeit / 2),
    effektivitaet: Math.floor(raw.effektivitaet / 2),
    weight: raw.weight / 2,
    ruestungsmalus: raw.ruestungsmalus != null ? Math.floor(raw.ruestungsmalus / 2) : undefined,
    statRequirement: Math.floor(raw.statRequirement / 2),
  };
}

export interface ForgeTotals {
  haltbarkeit: number;
  effektivitaet: number;
  weight: number;
  ruestungsmalus: number;
  statRequirement: number;
  extraEffects: string[];
}

/** Everything the finished item shows, from the three slots and the size multiplier. */
export function computeForgeTotals(
  primary: ForgedStatPreview | null,
  secondaryHalved: ForgedStatPreview | null,
  bonus: ForgedStatPreview | null,
  weightMultiplier: number,
): ForgeTotals {
  const extras = new Set<string>();
  for (const preview of [primary, secondaryHalved, bonus]) {
    if (!preview?.extraEffect) continue;
    for (const part of preview.extraEffect.split(',').map(s => s.trim()).filter(Boolean)) {
      extras.add(part);
    }
  }
  const raw = (pick: (p: ForgedStatPreview) => number) =>
    (primary ? pick(primary) : 0) + (secondaryHalved ? pick(secondaryHalved) : 0);

  return {
    haltbarkeit: Math.round(raw(p => p.haltbarkeit) * weightMultiplier),
    effektivitaet: Math.round(raw(p => p.effektivitaet) * weightMultiplier),
    weight: Math.round(raw(p => p.weight) * weightMultiplier * 10) / 10,
    ruestungsmalus: Math.trunc(raw(p => p.ruestungsmalus ?? 0) * weightMultiplier),
    statRequirement: Math.round(raw(p => p.statRequirement) * weightMultiplier),
    extraEffects: [...extras],
  };
}

/** SP cost of a trait after the session discount (never below 1). */
export function effectiveTraitCost(trait: ForgeTrait, discountPercent = 0): number {
  return Math.max(1, Math.round(trait.schmiedepunktKosten * (1 - discountPercent / 100)));
}

/** Schmiedepunkte spent on materials and traits. */
export function spentForgePoints(
  slots: readonly (readonly SlotMaterialEntry[])[],
  traits: readonly AppliedTraitState[],
  discountPercent = 0,
): number {
  let sp = 0;
  for (const entries of slots) {
    for (const entry of entries) sp += totalForgeSPSpent(entry.forgeCount);
  }
  for (const applied of traits) sp += effectiveTraitCost(applied.trait, discountPercent) * applied.level;
  return sp;
}

export interface ForgedItemInput {
  name: string;
  isWeapon: boolean;
  primary: readonly SlotMaterialEntry[];
  secondary: readonly SlotMaterialEntry[];
  bonus: readonly SlotMaterialEntry[];
  traits: readonly AppliedTraitState[];
  weightMultiplier: number;
  description?: string;
  /** Weapon only. */
  statRequirementKey?: WeaponStatKey;
  weaponTypeName?: string;
  damageType?: string;
  range?: string;
  /** Armor only — the slot the piece goes into. */
  armorSlot?: ItemBlock['armorType'];
  totalSP: number;
  spentSP: number;
}

/** Build the finished ItemBlock from a forge session (manual or generated). */
export function buildForgedItem(input: ForgedItemInput): ItemBlock {
  const primary = aggregateSlot(input.primary, input.isWeapon);
  const secondary = halveSlot(aggregateSlot(input.secondary, input.isWeapon));
  const bonus = aggregateSlot(input.bonus, input.isWeapon);
  const totals = computeForgeTotals(primary, secondary, bonus, input.weightMultiplier);

  const item = new ItemBlock();
  item.id = `forged_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  item.name = input.name;
  item.itemType = input.isWeapon ? 'weapon' : 'armor';
  item.description = input.description ?? '';
  item.primaryEffect = totals.extraEffects.join(' | ') || undefined;
  item.lost = false;
  item.broken = false;
  item.isIdentified = true;
  item.requirements = {};
  item.weight = totals.weight;
  item.hasDurability = true;
  item.durability = totals.haltbarkeit;
  item.maxDurability = totals.haltbarkeit;

  if (input.isWeapon) {
    item.armorType = 'weapon';
    item.efficiency = totals.effektivitaet;
    if (totals.statRequirement > 0 && input.statRequirementKey) {
      const key = WEAPON_STAT_TO_REQUIREMENT[input.statRequirementKey];
      item.requirements = { [key]: totals.statRequirement } as ItemRequirements;
    }
    if (input.weaponTypeName) item.weaponTypeName = input.weaponTypeName;
    if (input.damageType) item.damageType = input.damageType as ItemBlock['damageType'];
    if (input.range) item.range = input.range;
  } else {
    item.stability = totals.effektivitaet;
    item.armorDebuff = totals.ruestungsmalus || undefined;
    if (input.armorSlot) item.armorType = input.armorSlot;
  }

  if (input.traits.length) {
    item.secondaryEffect = input.traits.map(t => formatTraitEffect(t.trait, t.level)).join('\n');
  }

  const toRecords = (entries: readonly SlotMaterialEntry[]): ForgedMaterialRecord[] =>
    entries.map(e => ({ name: e.material.name, forgeCount: e.forgeCount }));

  const forgingData: ForgingData = {
    createdAt: Date.now(),
    itemType: input.isWeapon ? 'weapon' : 'armor',
    primaryMaterials: toRecords(input.primary),
    secondaryMaterials: toRecords(input.secondary),
    bonusMaterials: toRecords(input.bonus),
    appliedTraits: input.traits.map(t => ({ name: t.trait.name, level: t.level })),
    totalSP: input.totalSP,
    spentSP: input.spentSP,
  };
  (item as unknown as { forgingData: ForgingData }).forgingData = forgingData;

  return item;
}

/** A material usable for the given item kind. */
export function materialFits(material: MaterialBlock, isWeapon: boolean): boolean {
  return isWeapon ? !!material.canBeWeaponMaterial : !!material.canBeArmorMaterial;
}
