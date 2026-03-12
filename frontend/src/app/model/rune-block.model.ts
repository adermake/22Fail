export interface RuneDataLine {
  name: string;
  color: string;
  types: string[]; // Multiple entries = mixed/union port (accepts any listed type)
}

export type RuneType = 'medium' | 'formung' | 'selektor' | 'custom';

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
  statRequirements?: RuneStatRequirements;
  identified?: boolean;       // false = show only image, hide all text info
  learned?: boolean;          // character sheet: has the character learned this rune
  libraryOrigin?: string;
  libraryOriginName?: string;
  runeType?: RuneType;    // undefined = legacy (auto flow ports)
  inputs?: RuneDataLine[];
  outputs?: RuneDataLine[];
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

export interface DataTypePreset {
  name: string;
  color: string;
  type: string;
}

export const DATA_TYPE_PRESETS: DataTypePreset[] = [
  { name: 'Zahl',        color: '#3b82f6', type: 'Zahl' },
  { name: 'Vektor',      color: '#22c55e', type: 'Vektor' },
  { name: 'Aussage',     color: '#f97316', type: 'Aussage' },
  { name: 'Medium',      color: '#ec4899', type: 'Medium' },
  { name: 'Mana',        color: '#3b82f6', type: 'Mana' },
  { name: 'Fluss',       color: '#06b6d4', type: 'Fluss' },
  { name: 'Information', color: '#eab308', type: 'Information' },
];

// ── Rune type port presets ────────────────────────────────────────────────
export interface RuneTypeConfig {
  label: string;
  short: string;
  inputs: RuneDataLine[];
  outputs: RuneDataLine[];
}

export const RUNE_TYPE_CONFIGS: Record<'medium' | 'formung' | 'selektor', RuneTypeConfig> = {
  medium: {
    label: 'Medium', short: 'M',
    inputs:  [{ name: 'Fluss', color: '#06b6d4', types: ['Fluss'] }, { name: 'Mana', color: '#3b82f6', types: ['Mana'] }],
    outputs: [{ name: 'Fluss', color: '#06b6d4', types: ['Fluss'] }, { name: 'Medium', color: '#ec4899', types: ['Medium'] }],
  },
  formung: {
    label: 'Formung', short: 'F',
    inputs:  [{ name: 'Fluss', color: '#06b6d4', types: ['Fluss'] }, { name: 'Medium', color: '#ec4899', types: ['Medium'] }],
    outputs: [{ name: 'Fluss', color: '#06b6d4', types: ['Fluss'] }, { name: 'Medium', color: '#ec4899', types: ['Medium'] }],
  },
  selektor: {
    label: 'Selektor', short: 'S',
    inputs:  [{ name: 'MediumTyp', color: '#7c3aed', types: ['MediumTyp'] }],
    outputs: [{ name: 'Medium', color: '#ec4899', types: ['Medium'] }],
  },
};
