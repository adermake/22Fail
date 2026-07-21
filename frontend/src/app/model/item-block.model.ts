import { SkillBlock } from './skill-block.model';
import { SpellBlock } from './spell-block-model';

export interface ItemRequirements {
  strength?: number;
  dexterity?: number;
  speed?: number;
  intelligence?: number;
  constitution?: number;
  chill?: number;
}

export interface StatModifier {
  stat:
    | 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill'
    | 'mana' | 'life' | 'energy' | 'focus'
    // Derived targets — folded into the derived calculations by TrueStatsService.
    // 'movement' is flat Bewegung (hex steps), NOT a speed buff.
    | 'movement' | 'grundbonus' | 'reaktion' | 'armorMalus' | 'armorNegation';
  amount: number;
}

// Custom counter/bar that can be attached to items
export interface ItemCounter {
  id: string;
  name: string;
  min: number;
  max: number;
  current: number;
  color: string; // Hex color for the bar
}

// Dice bonus that items can provide
export interface ItemDiceBonus {
  name: string;
  value: number; // Positive = bad (adds to roll), Negative = good (subtracts from roll)
}

// Attached skill reference (deprecated, kept for backwards compatibility)
export interface AttachedSkill {
  skillId: string;
  skillName: string;
}

// Attached spell reference (deprecated, kept for backwards compatibility)
export interface AttachedSpell {
  spellId: string;
  spellName: string;
}

// Item type enumeration
export type ItemType =
  | 'weapon'
  | 'armor'
  | 'other'
  | 'potion'
  | 'raw-material'
  | 'ingredient'
  | 'extractor';

/** Resource kinds stored on the Resources tab (not normal inventory). */
export type ResourceItemType = 'raw-material' | 'ingredient' | 'extractor';

export function isResourceItemType(t: ItemType | undefined): t is ResourceItemType {
  return t === 'raw-material' || t === 'ingredient' || t === 'extractor';
}

// Armor type enumeration
export type ArmorType = 'helmet' | 'chestplate' | 'armschienen' | 'leggings' | 'boots' | 'weapon' | 'extra';

export class ItemBlock {
  // Basic properties
  id?: string; // Unique identifier
  name!: string;
  description!: string;
  primaryEffect?: string; // Main effect description
  secondaryEffect?: string; // Secondary effect description
  specialEffect?: string; // Special/unique effect description
  weight!: number;
  value?: number; // Gold value
  itemType: ItemType = 'other';
  armorType?: ArmorType; // For armor items
  
  // Status flags
  lost!: boolean;
  broken: boolean = false;
  isIdentified: boolean = true; // Whether the item has been identified (false = shows as "Unidentifiziertes Item")
  
  // Requirements
  requirements!: ItemRequirements;
  
  // Durability system
  hasDurability: boolean = false;
  durability?: number; // Current durability (0-100+)
  maxDurability?: number; // Maximum durability
  
  // Armor-specific
  armorDebuff?: number; // Speed penalty for wearing this armor
  stability?: number; // Defensive stat for armor
  
  // Weapon-specific
  efficiency?: number; // Weapon effectiveness stat
  weaponTypeName?: string; // E.g. 'Langschwert', 'Dolch' — cosmetic, set during forging
  damageType?: 'Schnitt' | 'Stich' | 'Wucht'; // Weapon damage type
  range?: string; // Effective range e.g. '2m', '100m'
  
  // Stat modifiers
  statModifiers?: StatModifier[];
  
  // Custom counters/bars
  counters?: ItemCounter[];
  
  // Dice bonuses
  diceBonuses?: ItemDiceBonus[];
  
  // Attached skills and spells (deprecated reference-based)
  attachedSkills?: AttachedSkill[];
  attachedSpells?: AttachedSpell[];
  
  // Embedded skills and spells (full data)
  embeddedSkills?: SkillBlock[];
  embeddedSpells?: SpellBlock[];
  
  // Stackable items (e.g. consumables)
  stackable?: boolean; // If true, item can have multiple amounts
  amount?: number; // Number of items in this stack (only relevant when stackable is true)

  // Library origin tracking
  libraryOrigin?: string; // Library ID if this item came from a library (undefined for custom items)
  libraryOriginName?: string; // Human-readable library name

  /** Links a resource/potion unit to its library recipe asset id (Material / Ingredient / Extractor). */
  libraryAssetId?: string;

  /**
   * Potion effects applied on use (right-click → Auf sich anwenden).
   * Stored as plain data so inventory items stay JSON-serializable.
   */
  potionEffects?: {
    slot: 'primary' | 'secondary' | 'tertiary';
    statusEffectId: string;
    statusEffectName?: string;
    sourceLibraryId?: string;
    mode: 'STACK' | 'DURATION';
    amount: number;
    ingredientName: string;
    brewCount: number;
  }[];

  /** Optional brew session snapshot embedded on finished potions. */
  brewingData?: unknown;

  // Source tracking (for display purposes)
  isItemBased?: boolean; // Flag for skills/spells from this item
}