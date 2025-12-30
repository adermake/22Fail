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
}

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