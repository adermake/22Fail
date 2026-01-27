/**
 * Action Macro Model
 * 
 * Action macros are visually scripted actions that combine conditions and consequences.
 * They allow players to define complex actions like "If health > 10, roll 2d6 and spend 5 mana"
 */

export type ConditionOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';
export type ResourceType = 'health' | 'energy' | 'mana' | 'fokus';
export type StatType = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';

/**
 * A single condition that must be met to execute the action
 */
export interface ActionCondition {
  id: string;
  type: 'resource' | 'stat' | 'skill';
  
  // For resource conditions (health > 10)
  resource?: ResourceType;
  
  // For stat conditions (strength >= 5)
  stat?: StatType;
  
  // For skill conditions (check if skill is available)
  skillName?: string;
  
  operator: ConditionOperator;
  value: number;
}

/**
 * A single consequence that occurs when the action is executed
 */
export interface ActionConsequence {
  id: string;
  type: 'dice_roll' | 'spend_resource' | 'gain_resource' | 'apply_bonus';
  
  // For dice rolls
  diceType?: number;
  diceCount?: number;
  bonuses?: string[]; // References to stat/skill bonuses by name
  
  // For resource changes
  resource?: ResourceType;
  amount?: number;
  
  // For applying bonuses
  bonusName?: string;
  bonusValue?: number;
  bonusDuration?: number; // In rounds
}

/**
 * An action macro that the player can execute
 */
export interface ActionMacro {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Emoji or icon identifier
  color?: string; // Hex color for the button
  
  // Conditions that must all be met
  conditions: ActionCondition[];
  
  // Consequences that occur in order
  consequences: ActionConsequence[];
  
  // Skill references - if any of these skills are removed, the macro becomes invalid
  referencedSkillNames: string[];
  
  // Is this macro valid? (False if referenced skills are removed)
  isValid: boolean;
  
  // Order for display
  order: number;
  
  // Created/Modified timestamps
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Create a new empty action macro
 */
export function createEmptyActionMacro(): ActionMacro {
  return {
    id: `macro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Neue Aktion',
    description: '',
    icon: '⚡',
    color: '#f59e0b',
    conditions: [],
    consequences: [],
    referencedSkillNames: [],
    isValid: true,
    order: 0,
    createdAt: new Date(),
    modifiedAt: new Date()
  };
}

/**
 * Create a new condition
 */
export function createEmptyCondition(): ActionCondition {
  return {
    id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'resource',
    resource: 'health',
    operator: '>',
    value: 0
  };
}

/**
 * Create a new consequence
 */
export function createEmptyConsequence(): ActionConsequence {
  return {
    id: `cons-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'dice_roll',
    diceType: 20,
    diceCount: 1,
    bonuses: []
  };
}

/**
 * Validate an action macro against current character skills
 * Returns list of missing skills
 */
export function validateActionMacro(macro: ActionMacro, characterSkillNames: string[]): string[] {
  const missingSkills: string[] = [];
  
  for (const skillName of macro.referencedSkillNames) {
    if (!characterSkillNames.includes(skillName)) {
      missingSkills.push(skillName);
    }
  }
  
  return missingSkills;
}

/**
 * Update all macros' validity based on current character skills
 */
export function updateMacrosValidity(macros: ActionMacro[], characterSkillNames: string[]): ActionMacro[] {
  return macros.map(macro => {
    const missingSkills = validateActionMacro(macro, characterSkillNames);
    return {
      ...macro,
      isValid: missingSkills.length === 0
    };
  });
}
