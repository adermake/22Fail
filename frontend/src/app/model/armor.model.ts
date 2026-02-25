import { ItemBlock, ItemRequirements } from './item-block.model';
import { Material } from './weapon.model';

export enum ArmorType {
    HELMET = 'Helm',
    CHEST = 'Brustpanzer',
    LEGGINGS = 'Beinschutz',
    BOOTS = 'Stiefel',
    GAUNTLETS = 'Handschuhe',
}

export class Armor extends ItemBlock {
  // durability and stability are now inherited from ItemBlock
  armorType!: ArmorType;

  // For crafting
  primaryMaterial!: Material;
  secondaryMaterial!: Material;
  additiveMaterial!: Material;
  craftingPointsUsed!: number;
  
  // Generated name
  generatedName!: string;
}
