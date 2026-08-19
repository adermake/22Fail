import { CLASS_DEFINITIONS } from '../data/skill-definitions';
import { SkillDefinition } from '../model/skill-definition.model';

/**
 * The economy of the Fähigkeitenbaum, in ONE place — the tree component, the skill detail panel and
 * the NPC/character generator all used to carry their own copy and drifted apart.
 */

/** Fähigkeitspunkte gained AT a given level: 2 up to level 10, 3 up to 20, 4 up to 30 … */
export function talentPointsForLevel(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 10);
}

/** Total Fähigkeitspunkte earned by the time a character reaches `level`. */
export function totalTalentPointsAtLevel(level: number): number {
  let total = 0;
  for (let l = 1; l <= Math.max(0, level); l++) total += talentPointsForLevel(l);
  return total;
}

/** Cost of one skill by class tier: 1 · 2 · 2 · 3 · 3. */
export function talentPointCostForTier(tier: number): number {
  switch (tier) {
    case 1:  return 1;
    case 2:  return 2;
    case 3:  return 2;
    case 4:  return 3;
    default: return 3;
  }
}

/** Cost of a specific skill, resolved through its class's tier. */
export function talentPointCostForSkill(skill: SkillDefinition): number {
  const tier = CLASS_DEFINITIONS[skill.class]?.tier;
  return talentPointCostForTier(tier ?? 1);
}
