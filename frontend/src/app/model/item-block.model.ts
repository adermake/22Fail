import { SkillBlock } from './skill-block.model';
import { SpellBlock } from './spell-block-model';
import type { ForgingData } from './forging.model';

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
  /** Verbrauchsgegenstand: used up on use; lands in the Verbraucht queue until the next Rast. */
  | 'consumable'
  /**
   * Kochzutat: has an `onRest` effect and can go in the pot, but cannot be eaten on its own.
   * Raw dough is not a meal — it only counts once something has been cooked out of it.
   */
  | 'cooking-ingredient'
  | 'raw-material'
  | 'ingredient'
  | 'extractor'
  /**
   * Konstrukt: an item with Anschlüsse that other Konstrukte plug into, recursively. The assembled
   * tree rolls its stats up into the root — see `utils/construct.util.ts`.
   */
  | 'construct';

/**
 * One Anschluss on a Konstrukt. A socket holds at most one child.
 *
 * Attachment is by CONTAINMENT: while `child` is set, that item lives here and nowhere else — it is
 * not also in the inventory. Detaching pops it back out. One assembled machine is therefore one
 * JSON subtree, which is what makes looting, trading and equipping it on a Begleiter just work.
 */
export interface ConstructSocket {
  id: string;
  /** Free-text label shown on the Bauplan node, e.g. 'Arm', 'Waffenhalterung'. */
  label?: string;
  /** The attached Konstrukt. Undefined = the socket is free and costs no Komplexität. */
  child?: ItemBlock;
}

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
  damageType?: 'Schnitt' | 'Stich' | 'Wucht'; // Primary weapon damage type (= damageTypes[0])
  /** Every damage type the weapon deals — a sword is Schnitt AND Stich. */
  damageTypes?: ('Schnitt' | 'Stich' | 'Wucht')[];
  range?: string; // Effective range as text, e.g. '2m', '100m' (the one that matters in play)
  /** Waffenart of the type it was forged from: how it is fought with. */
  weaponCategory?: 'LEICHT' | 'SCHWER' | 'FERNKAMPF';
  /** Reach in melee, in metres. Undefined = not usable in melee. */
  meleeRange?: number;
  /** Reach thrown or fired, in metres. Undefined = not a ranged weapon. */
  rangedRange?: number;
  handed?: 'ONE' | 'TWO';
  /** What reloading / re-readying costs in combat. Undefined = free. */
  reloadAction?: 'ACTION' | 'BONUS' | 'FREE';
  
  // Konstrukt-specific
  /**
   * Which MaterialStats the Schmiede reads for this node: weapon materials give it Effektivität,
   * armor materials Stabilität. One kind per node — but a Schmiedemerkmal writing `item.effectivity`
   * can still turn a structural part into a weapon, so never branch on this when rolling stats up.
   */
  constructMaterialKind?: 'weapon' | 'armor';
  /** Konstrukt-specific: its Anschlüsse. Undefined or empty = nothing can be attached. */
  sockets?: ConstructSocket[];

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

  /** Optional brew session snapshot embedded on finished potions. */
  brewingData?: unknown;

  /** FailScript action code. For Verbrauchsgegenstände this holds the effect on use and the
   *  `onRest { … }` block that resolves once the character rests. */
  script?: string;

  /**
   * What the Schmiede produced this from: materials, spent SP, and the applied Schmiedemerkmale
   * with their levels and scripts. `buildForgedItem` writes it; the stat resolver reads the
   * traits back out to run them.
   */
  forgingData?: ForgingData;

  // Source tracking (for display purposes)
  isItemBased?: boolean; // Flag for skills/spells from this item
}