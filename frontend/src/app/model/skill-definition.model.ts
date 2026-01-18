export interface SkillDefinition {
  id: string;                    // Unique ID: "magier_intelligenz_1"
  name: string;                  // Display name: "Intelligenz+1"
  class: string;                 // Class: "Magier"
  type: 'stat_bonus' | 'passive' | 'active';
  description: string;           // Full description
  enlightened?: boolean;         // If true, skill is "enlightened" (marked with ! in original data)

  // For stat bonuses (type: 'stat_bonus')
  statBonus?: {
    stat: 'intelligence' | 'strength' | 'dexterity' | 'speed' | 'constitution' | 'chill' |
          'mana' | 'life' | 'energy' | 'focus' | 'maxCastValue' | 'spellRadius';
    amount: number;
  };

  // For active skills (type: 'active')
  cost?: {
    type: 'mana' | 'energy' | 'life';
    amount: number;
    perRound?: boolean;          // Cost per round (like "10 pro Runde")
  };
  bonusAction?: boolean;         // Is it a bonus action?

  // Special flags
  requiresSkill?: string;        // Requires another skill (e.g., "+Verinnerlichen" requires "Verinnerlichen")
}

// Helper to get skills for a specific class
export function getSkillsForClass(skills: SkillDefinition[], className: string): SkillDefinition[] {
  return skills.filter(s => s.class === className);
}

// Helper to check if a skill is learned
export function isSkillLearned(learnedIds: string[], skillId: string): boolean {
  return learnedIds.includes(skillId);
}
