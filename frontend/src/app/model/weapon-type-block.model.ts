import {
  DamageType,
  WEAPON_CATEGORY_LABELS,
  WEAPON_TYPES,
  WeaponCategory,
  WeaponType as BuiltinWeaponType,
} from './forging.model';

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

export interface WeaponTypeBlock {
  id: string;
  name: string;
  /** Waffenart — how it is fought with. Independent of `weight`. */
  category: WeaponCategory;
  damageType: DamageType;
  /** Reach in melee, in metres. 0 = the type cannot be swung at all (a bow). */
  meleeRange: number;
  /** Effective range thrown or fired, in metres. 0 = pure melee. */
  rangedRange: number;
  weight: WeaponWeight;
  handed: WeaponHanded;
  /** Free text folded into the forged weapon's description. */
  extraEffect: string;
  description?: string;
  /** Set on entries derived from the hardcoded list — they are not library files. */
  builtin?: boolean;
}

export function createEmptyWeaponType(name = 'Neuer Waffentyp'): WeaponTypeBlock {
  return {
    id: `weapontype_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    category: 'LEICHT',
    damageType: 'Schnitt',
    meleeRange: 1,
    rangedRange: 0,
    weight: 'MITTEL',
    handed: 'ONE',
    extraEffect: '',
    description: '',
  };
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
    damageType: w.damageType,
    range: formatRangeMeters(useRanged ? w.rangedRange : w.meleeRange),
    defaultForgeSize: forgeSizeFor(w),
  };
}

/** Normalise a stored entry — older files predate `category`, so derive one rather than crash. */
export function normalizeWeaponType(w: WeaponTypeBlock): WeaponTypeBlock {
  const category: WeaponCategory = WEAPON_CATEGORIES.includes(w.category)
    ? w.category
    : (w.rangedRange ?? 0) > 0 && !(w.meleeRange ?? 0)
      ? 'FERNKAMPF'
      : w.weight === 'SCHWER'
        ? 'SCHWER'
        : 'LEICHT';
  return { ...w, category, weight: WEAPON_WEIGHTS.includes(w.weight) ? w.weight : 'MITTEL' };
}
