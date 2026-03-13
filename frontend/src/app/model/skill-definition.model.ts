export type SkillStatType =
  'intelligence' | 'strength' | 'dexterity' | 'speed' | 'constitution' | 'chill' |
  'mana' | 'life' | 'energy' | 'focus' | 'maxCastValue' | 'spellRadius';

export interface SkillDefinition {
  id: string;                    // Unique ID: "magier_intelligenz_1"
  name: string;                  // Display name: "Intelligenz+1"
  class: string;                 // Class: "Magier"
  type: 'stat_bonus' | 'passive' | 'active' | 'dice_bonus';
  description: string;           // Full description
  enlightened?: boolean;         // If true, skill is "enlightened" (marked with ! in original data)

  // For stat bonuses (type: 'stat_bonus')
  statBonus?: {
    stat: SkillStatType;
    amount: number;
  };

  // For skills that grant two stat bonuses (e.g. Konstitution&Wille+2)
  statBonuses?: Array<{
    stat: SkillStatType;
    amount: number;
  }>;

  // For active skills (type: 'active')
  cost?: {
    type: 'mana' | 'energy' | 'life';
    amount: number;
    perRound?: boolean;          // Cost per round (like "10 pro Runde")
  };

  // Action type for active skills
  actionType?: 'Aktion' | 'Bonusaktion' | 'Keine Aktion' | 'Reaktion';

  /** @deprecated Use actionType instead */
  bonusAction?: boolean;

  // Special flags
  requiresSkill?: string | string[];  // Requires another skill or array of skills
  infiniteLevel?: boolean;            // Can be learned multiple times (marked with ∞)
  maxLevel?: number;                  // Maximum times this skill can be learned (default: 1)
}

// Helper to get skills for a specific class
export function getSkillsForClass(skills: SkillDefinition[], className: string): SkillDefinition[] {
  return skills.filter(s => s.class === className);
}

// Helper to check if a skill is learned
export function isSkillLearned(learnedIds: string[], skillId: string): boolean {
  return learnedIds.includes(skillId);
}
