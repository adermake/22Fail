export interface ItemRequirements {
  strength?: number;
  dexterity?: number;
  speed?: number;
  intelligence?: number;
  constitution?: number;
  chill?: number;
}

export interface StatModifier {
  stat: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill' | 'mana' | 'life' | 'energy';
  amount: number;
}

export class ItemBlock {
  name!: string;
  description!: string;
  weight!: number;
  lost! : boolean;
  requirements!: ItemRequirements;
  armorDebuff?: number; // Speed penalty for wearing this armor
  statModifiers?: StatModifier[]; // Stat bonuses/penalties from this item
}