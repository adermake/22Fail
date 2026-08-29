import {
  DamageType,
  WEAPON_CATEGORY_LABELS,
  WEAPON_TYPES,
  WeaponCategory,
  WeaponType as BuiltinWeaponType,
} from './forging.model';
import { KnowledgeTier, setKnowledgeTier } from '../utils/knowledge-tier.util';

/**
 * A weapon type as an editable LIBRARY asset ("Messer", "Speer", "Axt", …).
 *
 * The 30-odd built-in types in `forging.model.WEAPON_TYPES` stay as the fallback so nothing breaks
 * for a world that has never defined one, but a library entry with the same name overrides its
 * built-in twin (see `mergeWeaponTypes`). That way a GM can retune "Axt" without a code change and
 * without invalidating characters that already carry one.
 */

/**
 * Two axes, deliberately separate — they are easy to confuse but mean different things:
 *
 *  - **Waffenart** (`WeaponCategory`: Leicht | Schwer | Fernkampf) is how the weapon is FOUGHT
 *    with, and is what skills, talents and proficiencies key off.
 *  - **Gewichtsklasse** (`WeaponWeight`: Leicht | Mittel | Schwer) is how heavy the thing IS, and
 *    only drives the suggested forge size.
 *
 * A throwing knife is Fernkampf but weighs Leicht; a warhammer is Schwer on both. Nothing forces
 * them to agree.
 */
export type WeaponWeight = 'LEICHT' | 'MITTEL' | 'SCHWER';

export const WEAPON_CATEGORIES: WeaponCategory[] = ['LEICHT', 'SCHWER', 'FERNKAMPF'];

export { WEAPON_CATEGORY_LABELS };
export type { WeaponCategory };

export const WEAPON_WEIGHTS: WeaponWeight[] = ['LEICHT', 'MITTEL', 'SCHWER'];

export const WEAPON_WEIGHT_LABELS: Record<WeaponWeight, string> = {
  LEICHT: 'Leicht',
  MITTEL: 'Mittel',
  SCHWER: 'Schwer',
};

export type WeaponHanded = 'ONE' | 'TWO';

export const WEAPON_HANDED_LABELS: Record<WeaponHanded, string> = {
  ONE: 'Einhändig',
  TWO: 'Zweihändig',
};

export const DAMAGE_TYPES: DamageType[] = ['Schnitt', 'Stich', 'Wucht'];

/** Short labels for cramped table cells — Schnitt and Stich both start with "S". */
export const DAMAGE_TYPE_SHORT: Record<DamageType, string> = {
  Schnitt: 'Sch',
  Stich: 'Sti',
  Wucht: 'Wu',
};

export interface WeaponTypeBlock {
  id: string;
  name: string;
  /** Waffenart — how it is fought with. Independent of `weight`. */
  category: WeaponCategory;
  /**
   * Every damage type the weapon can deal — a sword is Schnitt AND Stich. Always at least one
   * entry after `normalizeWeaponType`.
   */
  damageTypes: DamageType[];
  /**
   * Legacy single value, kept in sync with `damageTypes[0]` so anything still reading one type
   * (ItemBlock, the generators, older saved files) keeps working.
   */
  damageType?: DamageType;
  /** Reach in melee, in metres. 0 = the type cannot be swung at all (a bow). */
  meleeRange: number;
  /** Effective range thrown or fired, in metres. 0 = pure melee. */
  rangedRange: number;
  weight: WeaponWeight;
  handed: WeaponHanded;
  /** Free text folded into the forged weapon's description. */
  extraEffect: string;
  description?: string;
  /** Wissensstufe: geheim | unbekannt | bekannt. Built-ins are always common knowledge. */
  knowledgeTier?: KnowledgeTier;
  /** Legacy public flag, kept in sync by setKnowledgeTier. */
  isPublic?: boolean;
  /** Set on entries derived from the hardcoded list — they are not library files. */
  builtin?: boolean;
}

export function createEmptyWeaponType(name = 'Neuer Waffentyp'): WeaponTypeBlock {
  return {
    id: `weapontype_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    category: 'LEICHT',
    damageTypes: ['Schnitt'],
    damageType: 'Schnitt',
    meleeRange: 1,
    rangedRange: 0,
    weight: 'MITTEL',
    handed: 'ONE',
    extraEffect: '',
    description: '',
    knowledgeTier: 'bekannt',
  };
}

/**
 * A Waffentyp's Wissensstufe.
 *
 * Like runes, and unlike Materialien, an ungraded entry is `bekannt`: the field is new, and the
 * built-in types have always been public. `knowledgeTierOf` would call those `geheim` and empty
 * the list.
 */
export function weaponTypeKnowledgeTier(w: {
  knowledgeTier?: KnowledgeTier;
  isPublic?: boolean;
  builtin?: boolean;
}): KnowledgeTier {
  if (w.builtin) return 'bekannt';
  if (w.knowledgeTier) return w.knowledgeTier;
  if (w.isPublic === false) return 'geheim';
  return 'bekannt';
}

/** Write a tier onto a Waffentyp, keeping the legacy `isPublic` flag consistent. */
export function setWeaponTypeKnowledgeTier(w: WeaponTypeBlock, tier: KnowledgeTier): WeaponTypeBlock {
  return setKnowledgeTier(w, tier);
}

/** `'1,5m'` / `'0,5m'` / `'100m'` → metres. The built-in list stores ranges as German strings. */
export function parseRangeMeters(raw: string | number | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const n = parseFloat(String(raw ?? '').replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Metres back to the display form the rest of the app uses (`1,5m`). */
export function formatRangeMeters(m: number): string {
  return `${String(m).replace('.', ',')}m`;
}

const WEIGHT_FROM_FORGE_SIZE: Record<'LIGHT' | 'MEDIUM' | 'HEAVY', WeaponWeight> = {
  LIGHT: 'LEICHT',
  MEDIUM: 'MITTEL',
  HEAVY: 'SCHWER',
};

/**
 * Lift one hardcoded entry into the editable shape. The old list had a single `range`, so a
 * `FERNKAMPF` type's reach becomes `rangedRange` and everything else becomes `meleeRange`; a type
 * that is usable both ways has to be given its second reach by hand. Weight comes from the old
 * `defaultForgeSize`, which is what that field always actually meant.
 */
export function weaponTypeFromBuiltin(w: BuiltinWeaponType): WeaponTypeBlock {
  const meters = parseRangeMeters(w.range);
  const ranged = w.category === 'FERNKAMPF';
  return {
    id: `builtin_${w.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: w.name,
    category: w.category,
    damageTypes: [w.damageType],
    damageType: w.damageType,
    meleeRange: ranged ? 0 : meters,
    rangedRange: ranged ? meters : 0,
    weight: WEIGHT_FROM_FORGE_SIZE[w.defaultForgeSize],
    // Nothing in the old list recorded this; the heavy types are the two-handed ones.
    handed: w.category === 'SCHWER' ? 'TWO' : 'ONE',
    extraEffect: '',
    builtin: true,
  };
}

/** Every built-in type in the editable shape. */
export function builtinWeaponTypes(): WeaponTypeBlock[] {
  return WEAPON_TYPES.map(weaponTypeFromBuiltin);
}

/**
 * Library types win over built-ins of the same name (case-insensitive), so redefining "Axt" in a
 * library replaces the hardcoded one rather than showing it twice.
 */
export function mergeWeaponTypes(library: readonly WeaponTypeBlock[]): WeaponTypeBlock[] {
  const overridden = new Set(library.map((w) => w.name.trim().toLowerCase()));
  const builtins = builtinWeaponTypes().filter((w) => !overridden.has(w.name.toLowerCase()));
  return [...library, ...builtins].sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** `Nahkampf 1,5m` / `Fernkampf 50m` / both, for a compact listing. */
export function describeWeaponReach(w: WeaponTypeBlock): string {
  const parts: string[] = [];
  if (w.meleeRange > 0) parts.push(`Nahkampf ${formatRangeMeters(w.meleeRange)}`);
  if (w.rangedRange > 0) parts.push(`Fernkampf ${formatRangeMeters(w.rangedRange)}`);
  return parts.join(' · ') || '—';
}

/** The forge size a type suggests, matching the built-in `defaultForgeSize` semantics. */
export function forgeSizeFor(w: WeaponTypeBlock): 'LIGHT' | 'MEDIUM' | 'HEAVY' {
  return w.weight === 'SCHWER' ? 'HEAVY' : w.weight === 'MITTEL' ? 'MEDIUM' : 'LIGHT';
}

/**
 * The shape the forging screen and the generators still expect. Keeping this bridge means the
 * library types drop straight into existing code paths without a rewrite.
 */
export function toBuiltinShape(w: WeaponTypeBlock): BuiltinWeaponType {
  const useRanged = w.category === 'FERNKAMPF' || (w.rangedRange > 0 && w.meleeRange === 0);
  return {
    name: w.name,
    category: w.category,
    // The legacy shape holds exactly one; the first is the weapon's primary way of hurting things.
    damageType: primaryDamageType(w),
    range: formatRangeMeters(useRanged ? w.rangedRange : w.meleeRange),
    defaultForgeSize: forgeSizeFor(w),
  };
}

/** The weapon's primary damage type — what single-valued consumers get. */
export function primaryDamageType(w: {
  damageTypes?: DamageType[];
  damageType?: DamageType;
}): DamageType {
  return w.damageTypes?.[0] ?? w.damageType ?? 'Schnitt';
}

/** `Schnitt / Stich` — every type the weapon deals, for display. */
export function describeDamageTypes(w: {
  damageTypes?: DamageType[];
  damageType?: DamageType;
}): string {
  const list = w.damageTypes?.length ? w.damageTypes : [primaryDamageType(w)];
  return list.join(' / ');
}

/**
 * Normalise a stored entry — older files predate `category` and `damageTypes`, so derive them
 * rather than crash. Also keeps the legacy single `damageType` in sync with the list head.
 */
export function normalizeWeaponType(w: WeaponTypeBlock): WeaponTypeBlock {
  const category: WeaponCategory = WEAPON_CATEGORIES.includes(w.category)
    ? w.category
    : (w.rangedRange ?? 0) > 0 && !(w.meleeRange ?? 0)
      ? 'FERNKAMPF'
      : w.weight === 'SCHWER'
        ? 'SCHWER'
        : 'LEICHT';

  // Keep only real values, in the canonical order, and never end up with an empty list.
  const seen = new Set(w.damageTypes ?? (w.damageType ? [w.damageType] : []));
  const damageTypes = DAMAGE_TYPES.filter((d) => seen.has(d));
  if (!damageTypes.length) damageTypes.push('Schnitt');

  return {
    ...w,
    category,
    weight: WEAPON_WEIGHTS.includes(w.weight) ? w.weight : 'MITTEL',
    damageTypes,
    damageType: damageTypes[0],
  };
}

/** Toggle one damage type on a weapon type; the last one cannot be removed. */
export function toggleDamageType(w: WeaponTypeBlock, type: DamageType): WeaponTypeBlock {
  const has = w.damageTypes?.includes(type);
  if (has && (w.damageTypes?.length ?? 0) <= 1) return w; // a weapon must hurt somehow
  const next = has
    ? (w.damageTypes ?? []).filter((d) => d !== type)
    : [...(w.damageTypes ?? []), type];
  w.damageTypes = DAMAGE_TYPES.filter((d) => next.includes(d));
  w.damageType = w.damageTypes[0];
  return w;
}
