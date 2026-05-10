/**
 * Forging System Models
 *
 * Materials are library assets that define the raw components of crafted items.
 * ForgeTraits are library assets that define special properties engraved during forging.
 *
 * Slot rules:
 *  - Primary (Primär): contributes ALL stats + extra effect
 *  - Secondary (Sekundär): contributes HALF stats + extra effect
 *  - Bonus (Zusatz): contributes ONLY extra effect
 *
 * Forging a material costs 1 Schmiedepunkt (SP) and increases its stats by its scaling values.
 */

export interface MaterialStats {
  haltbarkeit: number;             // Base durability
  haltbarkeitSkalierung: number;   // Durability added per forge
  effektivitaet: number;           // Effectiveness (weapons) or Stabilität (armor)
  effektivitaetSkalierung: number; // Per-forge increase
  extraEffect: string;             // Free-text extra effect granted to the item
  weight: number;                  // Weight contribution (kg)
  ruestungsmalus?: number;         // Speed penalty — armor only
}

export interface MaterialBlock {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  canBeWeaponMaterial: boolean;
  canBeArmorMaterial: boolean;
  weaponStats?: MaterialStats;
  armorStats?: MaterialStats;
  libraryOrigin?: string;
  libraryOriginName?: string;
}

export interface ForgeTrait {
  id: string;
  name: string;
  description?: string;
  /** Effect text. Use [L] as a placeholder replaced by the current level (application count). */
  effect: string;
  schmiedepunktKosten: number;
  /** Maximum times this trait may be added. undefined or 1 = not scalable. */
  maxLevel: number;
  scalable: boolean;
  libraryOrigin?: string;
  libraryOriginName?: string;
}

// ── In-session state ──────────────────────────────────────────────────────────

export interface MaterialSlotState {
  material: MaterialBlock | null;
  /** Number of times this material has been forged in this session (1 SP each). */
  forgeCount: number;
}

export interface AppliedTraitState {
  trait: ForgeTrait;
  /** How many times this trait has been applied (capped by maxLevel). */
  level: number;
}

/** Computed preview of one stat set after forging. */
export interface ForgedStatPreview {
  haltbarkeit: number;
  effektivitaet: number;
  weight: number;
  ruestungsmalus?: number;
  extraEffect: string;
}

// ── Forging history embedded in the produced ItemBlock ────────────────────────

export interface ForgedMaterialRecord {
  name: string;
  forgeCount: number;
}

export interface ForgedTraitRecord {
  name: string;
  level: number;
}

export interface ForgingData {
  createdAt: number;
  itemType: 'weapon' | 'armor';
  primaryMaterial?: ForgedMaterialRecord;
  secondaryMaterial?: ForgedMaterialRecord;
  bonusMaterial?: ForgedMaterialRecord;
  appliedTraits: ForgedTraitRecord[];
  totalSP: number;
  spentSP: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function createEmptyMaterialBlock(): MaterialBlock {
  return {
    id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Neues Material',
    description: '',
    canBeWeaponMaterial: true,
    canBeArmorMaterial: false,
    weaponStats: {
      haltbarkeit: 50,
      haltbarkeitSkalierung: 10,
      effektivitaet: 5,
      effektivitaetSkalierung: 2,
      extraEffect: '',
      weight: 1,
    },
    armorStats: {
      haltbarkeit: 80,
      haltbarkeitSkalierung: 15,
      effektivitaet: 5,
      effektivitaetSkalierung: 2,
      extraEffect: '',
      weight: 2,
      ruestungsmalus: 0,
    },
  };
}

export function createEmptyForgeTrait(): ForgeTrait {
  return {
    id: `trait_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Neues Merkmal',
    description: '',
    effect: 'Effekt [L]',
    schmiedepunktKosten: 10,
    maxLevel: 1,
    scalable: false,
  };
}

/** Replace [L] in an effect string with the given level number. */
export function formatTraitEffect(trait: ForgeTrait, level: number): string {
  if (trait.scalable) {
    return trait.effect.replace(/\[L\]/g, String(level));
  }
  return trait.effect;
}

/** Compute the forged stats of a material after n forges. Returns null if stats are missing. */
export function computeForgedStats(
  material: MaterialBlock,
  forgeCount: number,
  isWeapon: boolean
): ForgedStatPreview | null {
  const base = isWeapon ? material.weaponStats : material.armorStats;
  if (!base) return null;
  return {
    haltbarkeit: base.haltbarkeit + forgeCount * base.haltbarkeitSkalierung,
    effektivitaet: base.effektivitaet + forgeCount * base.effektivitaetSkalierung,
    weight: base.weight ?? 0,
    ruestungsmalus: base.ruestungsmalus,
    extraEffect: base.extraEffect ?? '',
  };
}
