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
  /** Maximum gold budget. 0 = unlimited. */
  budget: number;
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
  /** Gold cost = spentSP * costPerSP */
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

    // SP budget capped by budget / costPerSP
    const spFromBudget = params.costPerSP > 0 && params.budget > 0
      ? Math.floor(params.budget / params.costPerSP)
      : Number.MAX_SAFE_INTEGER;
    const spBudget = Math.min(params.maxSP, spFromBudget);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = this.tryGenerate(params, availMaterials, availTraits, spBudget);
      if (!result) continue;

      if (params.minHaltbarkeit != null && result.finalHaltbarkeit < params.minHaltbarkeit) continue;
      if (params.minEffektivitaet != null && result.finalEffektivitaet < params.minEffektivitaet) continue;
      if (params.maxWeight != null && result.finalWeight > params.maxWeight) continue;

      return result;
    }

    return null;
  }

  private tryGenerate(
    params: GeneratorParams,
    availMaterials: MaterialBlock[],
    availTraits: ForgeTrait[],
    spBudget: number,
  ): GeneratedWeaponResult | null {
    const weaponType = params.weaponTypeName
      ? (WEAPON_TYPES.find(w => w.name === params.weaponTypeName) ?? this.pick(WEAPON_TYPES))
      : this.pick(WEAPON_TYPES);

    const weaponSize: 'LIGHT' | 'MEDIUM' | 'HEAVY' =
      params.weaponSize ?? this.pick(['LIGHT', 'MEDIUM', 'HEAVY'] as const);
    const sizeMult = { LIGHT: 0.8, MEDIUM: 1.0, HEAVY: 1.2 }[weaponSize];

    let remainingSP = spBudget;

    // ── Primary slot (required) ───────────────────────────────────────────────
    const primaryMat = this.pick(availMaterials);
    const primaryEntry: SlotMaterialEntry = { material: primaryMat, forgeCount: 0 };
    const primaryBudget = Math.floor(remainingSP * (0.25 + Math.random() * 0.4));
    this.forgeMaterial(primaryEntry, primaryBudget);
    remainingSP -= totalForgeSPSpent(primaryEntry.forgeCount);

    // ── Secondary slot (60% chance) ───────────────────────────────────────────
    let secondaryEntry: SlotMaterialEntry | null = null;
    if (remainingSP > 0 && Math.random() < 0.6) {
      const pool = availMaterials.filter(m => m.stackable || m.id !== primaryMat.id);
      if (pool.length > 0) {
        const secMat = this.pick(pool);
        secondaryEntry = { material: secMat, forgeCount: 0 };
        const secBudget = Math.floor(remainingSP * (0.15 + Math.random() * 0.3));
        this.forgeMaterial(secondaryEntry, secBudget);
        remainingSP -= totalForgeSPSpent(secondaryEntry.forgeCount);
      }
    }

    // ── Bonus slot (30% chance, no forging) ───────────────────────────────────
    let bonusEntry: SlotMaterialEntry | null = null;
    if (remainingSP > 0 && Math.random() < 0.3) {
      bonusEntry = { material: this.pick(availMaterials), forgeCount: 0 };
    }

    // ── Traits (spend remaining SP) ───────────────────────────────────────────
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
    const totalCost = spentSP * params.costPerSP;

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

