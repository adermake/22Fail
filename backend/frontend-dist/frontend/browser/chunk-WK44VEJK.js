// src/app/model/item-block.model.ts
function isResourceItemType(t) {
  return t === "raw-material" || t === "ingredient" || t === "extractor";
}
var ItemBlock = class {
  // Basic properties
  id;
  // Unique identifier
  name;
  description;
  primaryEffect;
  // Main effect description
  secondaryEffect;
  // Secondary effect description
  specialEffect;
  // Special/unique effect description
  weight;
  value;
  // Gold value
  itemType = "other";
  armorType;
  // For armor items
  // Status flags
  lost;
  broken = false;
  isIdentified = true;
  // Whether the item has been identified (false = shows as "Unidentifiziertes Item")
  // Requirements
  requirements;
  // Durability system
  hasDurability = false;
  durability;
  // Current durability (0-100+)
  maxDurability;
  // Maximum durability
  // Armor-specific
  armorDebuff;
  // Speed penalty for wearing this armor
  stability;
  // Defensive stat for armor
  // Weapon-specific
  efficiency;
  // Weapon effectiveness stat
  weaponTypeName;
  // E.g. 'Langschwert', 'Dolch' — cosmetic, set during forging
  damageType;
  // Weapon damage type
  range;
  // Effective range e.g. '2m', '100m'
  // Stat modifiers
  statModifiers;
  // Custom counters/bars
  counters;
  // Dice bonuses
  diceBonuses;
  // Attached skills and spells (deprecated reference-based)
  attachedSkills;
  attachedSpells;
  // Embedded skills and spells (full data)
  embeddedSkills;
  embeddedSpells;
  // Stackable items (e.g. consumables)
  stackable;
  // If true, item can have multiple amounts
  amount;
  // Number of items in this stack (only relevant when stackable is true)
  // Library origin tracking
  libraryOrigin;
  // Library ID if this item came from a library (undefined for custom items)
  libraryOriginName;
  // Human-readable library name
  /** Links a resource/potion unit to its library recipe asset id (Material / Ingredient / Extractor). */
  libraryAssetId;
  /**
   * Potion effects applied on use (right-click → Auf sich anwenden).
   * Stored as plain data so inventory items stay JSON-serializable.
   */
  potionEffects;
  /** Optional brew session snapshot embedded on finished potions. */
  brewingData;
  // Source tracking (for display purposes)
  isItemBased;
  // Flag for skills/spells from this item
};

export {
  isResourceItemType,
  ItemBlock
};
//# sourceMappingURL=chunk-WK44VEJK.js.map
