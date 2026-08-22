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

/**
 * Is this item actually WORN/WIELDED, i.e. does its `effectActive` script count?
 *  - a weapon must sit in the weapon slot (not stowed in Extra),
 *  - armour must sit in an armour slot,
 *  - anything else counts while it is in the Extra slot.
 * A lost item never counts.
 */
export function isItemEquipped(item: ItemBlock | null | undefined): boolean {
  if (!item || item.lost) return false;
  const slot = getEquipSlot(item);
  if (item.itemType === 'weapon') return slot === 'weapon';
  if (item.itemType === 'armor') return slot !== 'weapon' && slot !== 'extra';
  return slot === 'extra';
}
