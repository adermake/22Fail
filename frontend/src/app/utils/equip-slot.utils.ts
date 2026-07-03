import { ArmorType, ItemBlock } from '../model/item-block.model';

export type EquipSlot = ArmorType;

/** Resolve which equipment slot an item occupies. */
export function getEquipSlot(item: ItemBlock): EquipSlot {
  if (item.armorType) return item.armorType;
  return item.itemType === 'weapon' ? 'weapon' : 'extra';
}

/** True when a weapon is in the wielded weapon slot (not stowed in extra). */
export function isWieldedWeapon(item: ItemBlock): boolean {
  return item.itemType === 'weapon' && !item.lost && getEquipSlot(item) === 'weapon';
}
