/** Coarse classification of a rune. Purely descriptive — every rune has the same
 *  single flow-in / flow-out pair in the spell node editor. */
export type RuneType = 'elemental' | 'formung' | 'seele' | 'sonstiges';

/** Display order for pickers and the rulebook listing. */
export const RUNE_TYPES: RuneType[] = ['elemental', 'formung', 'seele', 'sonstiges'];

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
  elemental: 'Elemental',
  formung:   'Formung',
  seele:     'Seele',
  sonstiges: 'Sonstiges',
};

/**
 * Maps the retired classification (medium / selektor / custom) onto the current one, so runes
 * saved under the old system keep a sensible type without a data migration pass.
 * `medium` described the elemental substance, so it becomes `elemental`; the rest are
 * unclassified and land in `sonstiges`. Re-tag anything that lands wrong in the rune editor.
 */
const LEGACY_RUNE_TYPES: Record<string, RuneType> = {
  medium: 'elemental',
  formung: 'formung',
  selektor: 'sonstiges',
  custom: 'sonstiges',
};

/** Current type of a rune, translating legacy values. Untyped runes fall back to `sonstiges`. */
export function normalizeRuneType(value: string | undefined): RuneType {
  if (!value) return 'sonstiges';
  if (RUNE_TYPES.includes(value as RuneType)) return value as RuneType;
  return LEGACY_RUNE_TYPES[value] ?? 'sonstiges';
}
