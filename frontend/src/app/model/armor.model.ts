import { ItemBlock, ItemRequirements } from './item-block.model';
import { Material } from './weapon.model';

export class Armor extends ItemBlock {
  // durability and stability are now inherited from ItemBlock
  // armorType is also inherited from ItemBlock

  // For crafting
  primaryMaterial!: Material;
  secondaryMaterial!: Material;
  additiveMaterial!: Material;
  craftingPointsUsed!: number;
  
  // Generated name
  generatedName!: string;
}
