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
  fokusMult?: number;         // Fokus cost multiplier
  mana?: number;              // Base Mana cost
  manaMult?: number;          // Mana cost multiplier
  effektivitaet?: number;     // Effektivität value
  statRequirements?: RuneStatRequirements;
  identified?: boolean;       // false = show only image, hide all text info
  learned?: boolean;          // character sheet: has the character learned this rune
  libraryOrigin?: string;
  libraryOriginName?: string;
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
