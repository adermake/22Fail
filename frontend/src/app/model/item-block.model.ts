export interface ItemRequirements {
  strength?: number;
  dexterity?: number;
  speed?: number;
  intelligence?: number;
  constitution?: number;
  chill?: number;
}

export class ItemBlock {
  name!: string;
  description!: string;
  weight!: number;
  lost! : boolean;
  requirements!: ItemRequirements;
}