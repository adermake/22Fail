/**
 * Macro Action Model
 * 
 * Library-level macro actions that can be triggered by status effects
 * These are simpler than character ActionMacros - focused on immediate effects
 */

export type MacroActionType = 
  | 'dice_roll'        // Roll dice and display result
  | 'apply_damage'     // Deal damage to character
  | 'apply_healing'    // Heal character
  | 'modify_stat'      // Temporarily modify a stat
  | 'modify_resource'  // Add/subtract resource (health, mana, energy, fokus)
  | 'apply_status'     // Apply another status effect
  | 'remove_status'    // Remove a status effect
  | 'custom_message';  // Display a custom message

export type ResourceTarget = 'health' | 'energy' | 'mana' | 'fokus';
export type StatTarget = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';

/**
 * Parameters for different action types
 */
export interface MacroActionParameters {
  // For dice_roll
  diceFormula?: string; // e.g., "2d6+3"
  rollName?: string; // Display name for the roll
  rollColor?: string; // Color for the roll display
  
  // For apply_damage / apply_healing
  amount?: number; // Fixed amount
  diceAmount?: string; // Or use dice formula (e.g., "1d8+5")
  
  // For modify_stat
  stat?: StatTarget;
  statModifier?: number; // Can be negative
  duration?: number; // Duration in turns
  
  // For modify_resource
  resource?: ResourceTarget;
  resourceAmount?: number; // Can be negative
  resourceDiceAmount?: string; // Or use dice formula
  
  // For apply_status / remove_status
  statusEffectId?: string;
  
  // For custom_message
  message?: string;
  messageColor?: string;
}

/**
 * A macro action that can be triggered by status effects
 */
export interface MacroAction {
  id: string;
  name: string;
  description: string;
  
  // Action configuration
  actionType: MacroActionType;
  parameters: MacroActionParameters;
  
  // Visual
  icon?: string;
  color?: string;
  
  // Metadata
  tags?: string[]; // Categorization
  createdAt: number;
  modifiedAt: number;
}

/**
 * Create a new empty macro action
 */
export function createEmptyMacroAction(): MacroAction {
  return {
    id: `macro_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'New Macro',
    description: '',
    actionType: 'custom_message',
    parameters: {
      message: 'Macro triggered!'
    },
    tags: [],
    createdAt: Date.now(),
    modifiedAt: Date.now()
  };
}

/**
 * Validation helper for macro actions
 */
export function validateMacroAction(macro: MacroAction): string[] {
  const errors: string[] = [];
  
  switch (macro.actionType) {
    case 'dice_roll':
      if (!macro.parameters.diceFormula) {
        errors.push('Dice formula is required for dice_roll actions');
      }
      break;
      
    case 'apply_damage':
    case 'apply_healing':
      if (!macro.parameters.amount && !macro.parameters.diceAmount) {
        errors.push('Amount or dice formula is required');
      }
      break;
      
    case 'modify_stat':
      if (!macro.parameters.stat) {
        errors.push('Stat target is required');
      }
      if (macro.parameters.statModifier === undefined) {
        errors.push('Stat modifier is required');
      }
      break;
      
    case 'modify_resource':
      if (!macro.parameters.resource) {
        errors.push('Resource target is required');
      }
      if (!macro.parameters.resourceAmount && !macro.parameters.resourceDiceAmount) {
        errors.push('Resource amount or dice formula is required');
      }
      break;
      
    case 'apply_status':
    case 'remove_status':
      if (!macro.parameters.statusEffectId) {
        errors.push('Status effect ID is required');
      }
      break;
      
    case 'custom_message':
      if (!macro.parameters.message) {
        errors.push('Message is required for custom_message actions');
      }
      break;
  }
  
  return errors;
}
