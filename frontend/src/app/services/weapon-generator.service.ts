/**
 * WeaponGeneratorService
 *
 * Generates random forged weapons using the forging system's pure functions
 * exclusively. No stat math is duplicated here — all computations go through
 * computeForgedStats, totalForgeSPSpent, nextForgeCost, and formatTraitEffect
 * from forging.model.ts. This guarantees that rule changes in the model
 * automatically propagate to the generator.
 */

import { Injectable } from '@angular/core';
import {
  MaterialBlock, ForgeTrait,
  MaterialSlotState, SlotMaterialEntry, AppliedTraitState, ForgedStatPreview,
  computeForgedStats, totalForgeSPSpent, formatTraitEffect,
  WeaponType, WEAPON_TYPES,
} from '../model/forging.model';
import { ItemBlock } from '../model/item-block.model';

export type ItemFilterState = 'neutral' | 'whitelist' | 'blacklist';

export interface GeneratorParams {
  /** Total Schmiedepunkte the blacksmith has available. */
  maxSP: number;
  /** Gold cost per SP spent (for budget calculation). */
  costPerSP: number;
  /** Minimum gold budget. 0 = no minimum. */
  minBudget: number;
  /** Maximum gold budget. 0 = unlimited. */
  budget: number;
  /**
   * 0–100. Share of SP allocated to forging materials.
   * The rest goes to traits. Default 50 = equal split.
   */
  forgingRatio: number;
  /** Specific weapon type by name, or null = random. */
  weaponTypeName: string | null;
  /** Specific forge size, or null = random. */
  weaponSize: 'LIGHT' | 'MEDIUM' | 'HEAVY' | null;
  /** Metric filters — null means no constraint. */
  minHaltbarkeit: number | null;
  minEffektivitaet: number | null;
  maxWeight: number | null;
}

export interface GeneratedWeaponResult {
  weaponType: WeaponType;
  weaponSize: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  primarySlot: MaterialSlotState;
  secondarySlot: MaterialSlotState;
  bonusSlot: MaterialSlotState;
  appliedTraits: AppliedTraitState[];
  spentSP: number;
  maxSP: number;
  /** Total gold cost = material costs (with slot discounts) + spentSP * costPerSP */
  totalCost: number;
  finalHaltbarkeit: number;
  finalEffektivitaet: number;
  finalWeight: number;
  finalStatRequirement: number;
  allExtraEffects: string[];
  allTraitEffects: string[];
}

@Injectable({ providedIn: 'root' })
export class WeaponGeneratorService {

  /**
   * Try to generate a random weapon up to maxAttempts times.
   * Returns null if no valid result could be found (e.g. constraints too strict).
   */
  generate(
    params: GeneratorParams,
    allMaterials: MaterialBlock[],
    allTraits: ForgeTrait[],
    materialFilters: Record<string, ItemFilterState>,
    traitFilters: Record<string, ItemFilterState>,
    maxAttempts = 30,
  ): GeneratedWeaponResult | null {
    const availMaterials = this.applyFilters(
      allMaterials.filter(m => m.canBeWeaponMaterial),
      materialFilters,
    );
    const availTraits = this.applyFilters(allTraits, traitFilters);

    if (availMaterials.length === 0) return null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = this.tryGenerate(params, availMaterials, availTraits);
      if (!result) continue;

      if (params.minHaltbarkeit != null && result.finalHaltbarkeit < params.minHaltbarkeit) continue;
      if (params.minEffektivitaet != null && result.finalEffektivitaet < params.minEffektivitaet) continue;
      if (params.maxWeight != null && result.finalWeight > params.maxWeight) continue;
      if (params.minBudget > 0 && result.totalCost < params.minBudget) continue;

      return result;
    }

    return null;
  }

  private tryGenerate(
    params: GeneratorParams,
    availMaterials: MaterialBlock[],
    availTraits: ForgeTrait[],
  ): GeneratedWeaponResult | null {
    const weaponType = params.weaponTypeName
      ? (WEAPON_TYPES.find(w => w.name === params.weaponTypeName) ?? this.pick(WEAPON_TYPES))
      : this.pick(WEAPON_TYPES);

    const weaponSize: 'LIGHT' | 'MEDIUM' | 'HEAVY' =
      params.weaponSize ?? this.pick(['LIGHT', 'MEDIUM', 'HEAVY'] as const);
    const sizeMult = { LIGHT: 0.8, MEDIUM: 1.0, HEAVY: 1.2 }[weaponSize];

    // ── Pick materials first so we know material gold costs up front ─────────
    const primaryMat = this.pick(availMaterials);

    const hasSecondary = Math.random() < 0.6;
    const hasBonus     = Math.random() < 0.3;

    let secMat: MaterialBlock | null = null;
    if (hasSecondary) {
      const pool = availMaterials.filter(m => m.stackable || m.id !== primaryMat.id);
      if (pool.length > 0) secMat = this.pick(pool);
    }
    const bonusMat: MaterialBlock | null = hasBonus ? this.pick(availMaterials) : null;

    // Material base gold costs are paid from the gold budget directly.
    // Secondary slot materials cost half, bonus slot materials cost a quarter.
    const materialGoldCost =
      (primaryMat.cost ?? 0) +
      Math.ceil((secMat?.cost ?? 0) / 2) +
      Math.ceil((bonusMat?.cost ?? 0) / 4);

    // After paying for materials, remaining gold buys forging (SP × costPerSP).
    if (params.budget > 0 && materialGoldCost > params.budget) return null;

    const goldForForging = params.budget > 0
      ? params.budget - materialGoldCost
      : Number.MAX_SAFE_INTEGER;

    const spFromGold = params.costPerSP > 0 && goldForForging < Number.MAX_SAFE_INTEGER
      ? Math.floor(goldForForging / params.costPerSP)
      : Number.MAX_SAFE_INTEGER;
    const spBudget = Math.min(params.maxSP, spFromGold);

    // ── Split SP between forging and traits based on forgingRatio ────────────
    const ratio = Math.max(0, Math.min(100, params.forgingRatio ?? 50)) / 100;
    let spForForging = Math.round(spBudget * ratio);
    let spForTraits  = spBudget - spForForging;

    // ── Primary slot (required) ───────────────────────────────────────────────
    const primaryEntry: SlotMaterialEntry = { material: primaryMat, forgeCount: 0 };
    const primaryBudget = Math.floor(spForForging * (0.25 + Math.random() * 0.4));
    this.forgeMaterial(primaryEntry, primaryBudget);
    spForForging -= totalForgeSPSpent(primaryEntry.forgeCount);

    // ── Secondary slot ────────────────────────────────────────────────────────
    let secondaryEntry: SlotMaterialEntry | null = null;
    if (secMat && spForForging > 0) {
      secondaryEntry = { material: secMat, forgeCount: 0 };
      const secBudget = Math.floor(spForForging * (0.15 + Math.random() * 0.3));
      this.forgeMaterial(secondaryEntry, secBudget);
      spForForging -= totalForgeSPSpent(secondaryEntry.forgeCount);
    }

    // Unused forging SP rolls over to traits
    spForTraits += spForForging;

    // ── Bonus slot (no forging) ───────────────────────────────────────────────
    const bonusEntry: SlotMaterialEntry | null = bonusMat
      ? { material: bonusMat, forgeCount: 0 }
      : null;

    // ── Traits (spend trait SP pool) ──────────────────────────────────────────
    let remainingSP = spForTraits;
    const appliedTraits: AppliedTraitState[] = [];
    if (availTraits.length > 0 && remainingSP > 0) {
      const shuffled = [...availTraits].sort(() => Math.random() - 0.5);
      let idx = 0;
      let skipped = 0;
      while (remainingSP > 0 && skipped < shuffled.length) {
        const trait = shuffled[idx % shuffled.length];
        idx++;
        if (trait.schmiedepunktKosten > remainingSP) { skipped++; continue; }
        const existing = appliedTraits.find(t => t.trait.id === trait.id);
        if (existing && existing.level < trait.maxLevel) {
          existing.level++;
          remainingSP -= trait.schmiedepunktKosten;
          skipped = 0;
        } else if (!existing) {
          appliedTraits.push({ trait, level: 1 });
          remainingSP -= trait.schmiedepunktKosten;
          skipped = 0;
        } else {
          skipped++;
        }
      }
    }

    // ── Build slot states ─────────────────────────────────────────────────────
    const primarySlot: MaterialSlotState = { entries: [primaryEntry] };
    const secondarySlot: MaterialSlotState = { entries: secondaryEntry ? [secondaryEntry] : [] };
    const bonusSlot: MaterialSlotState = { entries: bonusEntry ? [bonusEntry] : [] };

    // ── Compute final stats using forging system functions ────────────────────
    const pri    = this.aggregateSlot(primarySlot);
    const secRaw = this.aggregateSlot(secondarySlot);
    const sec: ForgedStatPreview | null = secRaw ? {
      ...secRaw,
      haltbarkeit:   Math.floor(secRaw.haltbarkeit   / 2),
      effektivitaet: Math.floor(secRaw.effektivitaet / 2),
      weight:        secRaw.weight / 2,
    } : null;
    const bon = this.aggregateSlot(bonusSlot);

    const finalHaltbarkeit   = Math.round(((pri?.haltbarkeit   ?? 0) + (sec?.haltbarkeit   ?? 0)) * sizeMult);
    const finalEffektivitaet = Math.round(((pri?.effektivitaet ?? 0) + (sec?.effektivitaet ?? 0)) * sizeMult);
    const finalWeight = Math.round(
      ((pri?.weight ?? 0) + (sec?.weight ?? 0) + (bon?.weight ?? 0)) * sizeMult * 10
    ) / 10;
    // Secondary stat requirement is NOT halved (same as forging component)
    const finalStatRequirement = (pri?.statRequirement ?? 0) + (secRaw?.statRequirement ?? 0);

    const spentSP = spBudget - remainingSP;
    const totalCost = materialGoldCost + spentSP * params.costPerSP;

    // Collect extra effects
    const allExtraEffects: string[] = [];
    for (const preview of [pri, sec, bon]) {
      if (!preview?.extraEffect) continue;
      for (const eff of preview.extraEffect.split(',').map(s => s.trim()).filter(Boolean)) {
        if (!allExtraEffects.includes(eff)) allExtraEffects.push(eff);
      }
    }

    const allTraitEffects = appliedTraits.map(t => formatTraitEffect(t.trait, t.level));

    return {
      weaponType, weaponSize,
      primarySlot, secondarySlot, bonusSlot,
      appliedTraits, spentSP, maxSP: spBudget, totalCost,
      finalHaltbarkeit, finalEffektivitaet, finalWeight, finalStatRequirement,
      allExtraEffects, allTraitEffects,
    };
  }

  /**
   * Aggregates the stats of all entries in a slot.
   * Delegates per-entry computation to computeForgedStats from forging.model.ts.
   */
  private aggregateSlot(slot: MaterialSlotState): ForgedStatPreview | null {
    if (slot.entries.length === 0) return null;
    let h = 0, e = 0, w = 0, req = 0;
    const effectParts: string[] = [];
    const seenMats = new Set<string>();
    const stackCounts = new Map<string, number>();
    for (const entry of slot.entries) {
      stackCounts.set(entry.material.id, (stackCounts.get(entry.material.id) ?? 0) + 1);
    }
    for (const entry of slot.entries) {
      const preview = computeForgedStats(entry.material, entry.forgeCount, true);
      if (!preview) continue;
      h += preview.haltbarkeit;
      e += preview.effektivitaet;
      w += preview.weight;
      req += preview.statRequirement;
      if (!seenMats.has(entry.material.id)) {
        seenMats.add(entry.material.id);
        const mat = entry.material;
        const count = stackCounts.get(mat.id) ?? 1;
        if (mat.stackable && mat.stackLevels && mat.stackLevels.length > 0) {
          const idx = Math.min(count - 1, mat.stackLevels.length - 1);
          if (mat.stackLevels[idx]) effectParts.push(mat.stackLevels[idx]);
        } else if (preview.extraEffect) {
          effectParts.push(preview.extraEffect);
        }
      }
    }
    return { haltbarkeit: h, effektivitaet: e, weight: w, extraEffect: effectParts.join(', '), statRequirement: req };
  }

  /**
   * Forge a material entry as many times as possible within spBudget.
   * Uses totalForgeSPSpent from forging.model.ts to track SP cost.
   */
  private forgeMaterial(entry: SlotMaterialEntry, spBudget: number): void {
    while (totalForgeSPSpent(entry.forgeCount + 1) <= spBudget) {
      entry.forgeCount++;
    }
  }

  private applyFilters<T extends { id: string }>(
    items: T[],
    filters: Record<string, ItemFilterState>,
  ): T[] {
    const hasWhitelist = Object.values(filters).some(v => v === 'whitelist');
    return items.filter(item => {
      const state = filters[item.id] ?? 'neutral';
      if (state === 'blacklist') return false;
      if (hasWhitelist && state !== 'whitelist') return false;
      return true;
    });
  }

  private pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** Build a complete ItemBlock from a generated weapon result. */
  buildItem(result: GeneratedWeaponResult, itemName: string): ItemBlock {
    const item = new ItemBlock();
    item.id = `forged_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    item.name = itemName.trim() || result.weaponType.name;
    item.itemType = 'weapon';
    item.weaponTypeName = result.weaponType.name;
    item.damageType = result.weaponType.damageType;
    item.range = result.weaponType.range;
    item.weight = result.finalWeight;
    item.hasDurability = true;
    item.durability = result.finalHaltbarkeit;
    item.maxDurability = result.finalHaltbarkeit;
    item.efficiency = result.finalEffektivitaet;
    item.lost = false;
    item.broken = false;
    item.isIdentified = true;
    item.requirements = {};
    item.primaryEffect = result.allExtraEffects.join(' | ') || undefined;
    item.secondaryEffect = result.allTraitEffects.join('\n') || undefined;

    const sizeLabel = { LIGHT: 'Leicht', MEDIUM: 'Mittel', HEAVY: 'Schwer' }[result.weaponSize];
    const entryLabel = (entry: SlotMaterialEntry) =>
      `${entry.material.name}${entry.forgeCount > 0 ? ` (+${entry.forgeCount}×)` : ''}`;
    const lines: string[] = [
      `Typ: ${result.weaponType.name}  ·  ${result.weaponType.damageType}  ·  ${result.weaponType.range}`,
      `Größe: ${sizeLabel}`,
    ];
    if (result.primarySlot.entries.length > 0) {
      lines.push(`Primär: ${result.primarySlot.entries.map(entryLabel).join(', ')}`);
    }
    if (result.secondarySlot.entries.length > 0) {
      lines.push(`Sekundär: ${result.secondarySlot.entries.map(entryLabel).join(', ')}`);
    }
    if (result.bonusSlot.entries.length > 0) {
      lines.push(`Zusatz: ${result.bonusSlot.entries.map(entryLabel).join(', ')}`);
    }
    item.description = lines.join('\n');

    return item;
  }
}

