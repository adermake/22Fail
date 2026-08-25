/**
 * Classification of a rune. Two levels: a rune stores one of these LEAF types, and the leaves
 * roll up into the four top-level GROUPS below (Formung is a group of three).
 * Purely descriptive — every rune has the same single flow-in / flow-out pair in the node editor.
 */
export type RuneType =
  | 'elemental'
  | 'manipulation'
  | 'selektor'
  | 'ausfuehrung'
  | 'seele'
  | 'sonstiges';

/** Display order for pickers and the rulebook listing. */
export const RUNE_TYPES: RuneType[] = [
  'elemental', 'manipulation', 'selektor', 'ausfuehrung', 'seele', 'sonstiges',
];

/** Top-level categories. `formung` is a parent that splits into three leaf types. */
export type RuneGroup = 'elemental' | 'formung' | 'seele' | 'sonstiges';

export const RUNE_GROUPS: RuneGroup[] = ['elemental', 'formung', 'seele', 'sonstiges'];

export const RUNE_GROUP_LABELS: Record<RuneGroup, string> = {
  elemental: 'Elemental',
  formung:   'Formung',
  seele:     'Seele',
  sonstiges: 'Sonstiges',
};

/** Which leaf types live under each group, in display order. */
export const RUNE_GROUP_MEMBERS: Record<RuneGroup, RuneType[]> = {
  elemental: ['elemental'],
  formung:   ['manipulation', 'selektor', 'ausfuehrung'],
  seele:     ['seele'],
  sonstiges: ['sonstiges'],
};

const GROUP_OF = new Map<RuneType, RuneGroup>(
  RUNE_GROUPS.flatMap((g) => RUNE_GROUP_MEMBERS[g].map((t) => [t, g] as const)),
);

/** The top-level category a leaf type belongs to. */
export function runeGroupOf(type: RuneType): RuneGroup {
  return GROUP_OF.get(type) ?? 'sonstiges';
}

/** True when the group is more than its single leaf (only Formung today). */
export function isGroupedRuneType(group: RuneGroup): boolean {
  return RUNE_GROUP_MEMBERS[group].length > 1;
}

export interface RuneStatRequirements {
  strength?: number;
  dexterity?: number;
  speed?: number;
  intelligence?: number;
  constitution?: number;
  chill?: number;
}

export class RuneBlock {
  name!: string;
  description!: string;
  drawing!: string;           // Image ID (from image service) or empty string
  tags!: string[];
  glowColor?: string;         // Glow color for drawing strokes (default: #8b5cf6)
  fokus?: number;             // Base Fokus cost
  fokusVerlust?: number;      // Fokus cost per unused input port
  mana?: number;              // Base Mana cost
  manaMult?: number;          // Mana cost multiplier
  effektivitaet?: number;     // Effektivität value
  cost?: number;              // Gold / shop value of the rune
  statRequirements?: RuneStatRequirements;
  identified?: boolean;       // false = show only image, hide all text info
  learned?: boolean;          // character sheet: has the character learned this rune
  libraryOrigin?: string;
  libraryOriginName?: string;
  runeType?: RuneType;    // undefined = legacy / unclassified
}

export const RUNE_GLOW_COLORS = [
  { name: 'Lila',   value: '#8b5cf6' },
  { name: 'Blau',   value: '#3b82f6' },
  { name: 'Cyan',   value: '#06b6d4' },
  { name: 'Grün',   value: '#22c55e' },
  { name: 'Gelb',   value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Rot',    value: '#ef4444' },
  { name: 'Pink',   value: '#ec4899' },
  { name: 'Weiß',   value: '#ffffff' },
];

export const RUNE_DEFAULT_TAGS = [
  'Wasser',
  'Feuer',
  'Stein',
  'Seele',
  'Licht',
  'Dunkel',
  'Heilung',
];

export const RUNE_TAG_OPTIONS = [
  'Wasser', 'Feuer', 'Stein', 'Seele', 'Licht', 'Dunkel', 'Heilung',
  'Schutz', 'Angriff', 'Verteidigung', 'Buff', 'Debuff',
  'Beschwörung', 'Verzauberung', 'Illusion', 'Wind', 'Blitz', 'Eis',
];

export const RUNE_TYPE_LABELS: Record<RuneType, string> = {
  elemental:    'Elemental',
  manipulation: 'Manipulation',
  selektor:     'Selektor',
  ausfuehrung:  'Ausführung',
  seele:        'Seele',
  sonstiges:    'Sonstiges',
};

/** Two-letter labels for the cramped picker in the library rune table (first letters collide). */
export const RUNE_TYPE_SHORT: Record<RuneType, string> = {
  elemental:    'El',
  manipulation: 'Ma',
  selektor:     'Sk',
  ausfuehrung:  'Au',
  seele:        'Se',
  sonstiges:    'So',
};

/**
 * Maps retired classifications onto the current leaf types, so runes saved under an older system
 * keep a sensible type without a data migration pass.
 *
 * - `medium` described the elemental substance -> `elemental`.
 * - `selektor` finally has a home of its own again (it was parked in `sonstiges` while Formung was
 *   still a single flat type).
 * - `formung` is now a GROUP, not a type. A rune stored under the bare group is Formung-something
 *   but unspecified, so it lands on `manipulation` — re-tag those in the rune editor.
 */
const LEGACY_RUNE_TYPES: Record<string, RuneType> = {
  medium: 'elemental',
  formung: 'manipulation',
  custom: 'sonstiges',
};

/** Current type of a rune, translating legacy values. Untyped runes fall back to `sonstiges`. */
export function normalizeRuneType(value: string | undefined): RuneType {
  if (!value) return 'sonstiges';
  if (RUNE_TYPES.includes(value as RuneType)) return value as RuneType;
  return LEGACY_RUNE_TYPES[value] ?? 'sonstiges';
}
