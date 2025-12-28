export class RuneBlock {
  name!: string;
  description!: string;
  drawing!: string; // Base64 encoded image
  tags!: string[];
}

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