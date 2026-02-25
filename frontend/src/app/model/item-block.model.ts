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
  stat: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill' | 'mana' | 'life' | 'energy';
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
export type ItemType = 'weapon' | 'armor' | 'other';

// Armor type enumeration
export type ArmorType = 'helmet' | 'chestplate' | 'armschienen' | 'leggings' | 'boots' | 'extra';

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
  
  // Source tracking (for display purposes)
  isItemBased?: boolean; // Flag for skills/spells from this item
}