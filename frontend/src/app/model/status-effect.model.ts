import { DiceBonus } from './dice-bonus.model';
import { ActionMacro } from './action-macro.model';


/**
 * Status Effect - A condition that can be applied to characters
 * Can affect stats, provide bonuses/penalties, and trigger macro actions
 */
export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  
  // Visual
  icon?: string; // Emoji or icon identifier
  color?: string; // Hex color for the status effect tile
  
  // Mechanical effects
  diceBonuses?: DiceBonus[]; // Bonuses or penalties to dice rolls
  statModifiers?: StatusStatModifier[]; // Direct stat modifications
  
  // Macro integration
  macroActionId?: string;      // Legacy: ID of a library MacroAction
  embeddedMacro?: ActionMacro; // Inline ActionMacro (copied, not referenced)

  // Duration & stacking
  defaultDuration?: number; // Default duration in turns/rounds
  maxStacks?: number; // Maximum number of times this effect can stack
  isDebuff?: boolean; // Whether this is a negative effect
  
  // Metadata
  tags?: string[]; // Categorization (e.g., 'poison', 'buff', 'curse')
}

/**
 * Stat modifier applied by a status effect
 */
export interface StatusStatModifier {
  stat: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';
  amount: number; // Can be negative for debuffs
  isPercentage?: boolean; // If true, apply as percentage instead of flat amount
}

/**
 * Active status effect on a character
 * Tracks instance-specific data like duration and stacks
 */
export interface ActiveStatusEffect {
  statusEffectId: string; // References the base status effect
  sourceLibraryId: string; // Which library this came from
  
  // Instance data
  appliedAt: number; // Timestamp
  appliedBy?: string; // Character ID or GM
  duration?: number; // Remaining duration (overrides default)
  stacks: number; // Current stack count
  
  // Optional overrides
  customName?: string; // Override the base name
  customDescription?: string; // Override the base description
  customDiceBonuses?: DiceBonus[]; // Override dice bonuses
}

/**
 * Create a new status effect
 */
export function createEmptyStatusEffect(): StatusEffect {
  return {
    id: `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'New Status Effect',
    description: '',
    diceBonuses: [],
    statModifiers: [],
    tags: [],
    isDebuff: false,
    maxStacks: 1
  };
}

/**
 * Apply a status effect to a character (creates ActiveStatusEffect)
 */
export function applyStatusEffect(
  statusEffect: StatusEffect,
  sourceLibraryId: string,
  appliedBy?: string
): ActiveStatusEffect {
  return {
    statusEffectId: statusEffect.id,
    sourceLibraryId,
    appliedAt: Date.now(),
    appliedBy,
    duration: statusEffect.defaultDuration,
    stacks: 1
  };
}
