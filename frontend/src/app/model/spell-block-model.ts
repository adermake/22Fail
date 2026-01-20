export interface SpellBinding {
  type: 'learned' | 'item';
  itemName?: string; // Only for item-bound spells
  durability?: number; // Current durability for item-bound spells
  maxDurability?: number; // Max durability for item-bound spells
}

export class SpellBlock {
  name!: string;
  description!: string;
  drawing?: string; // Optional base64 encoded image
  tags!: string[];
  binding!: SpellBinding;
  strokeColor?: string; // Color for the spell drawing stroke (default: #673ab7)
}

export const SPELL_GLOW_COLORS = [
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

export const SPELL_TAG_OPTIONS = [
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
  'Transmutation',
  'Necromancy',
];