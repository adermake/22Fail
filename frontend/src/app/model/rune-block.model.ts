export class RuneBlock {
  name!: string;
  description!: string;
  drawing!: string; // Base64 encoded image
  tags!: string[];
  strokeColor?: string; // Color for the rune drawing stroke (default: #8b5cf6)
}

export const RUNE_GLOW_COLORS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'White', value: '#ffffff' },
];

export const RUNE_TAG_OPTIONS = [
  'Fire',
  'Water',
  'Earth',
  'Air',
  'Light',
  'Dark',
  'Healing',
  'Protection',
  'Attack',
  'Defense',
  'Buff',
  'Debuff',
  'Summoning',
  'Enchantment',
  'Illusion',
  'Divination',
];