import {
  CLASS_DEFINITIONS
} from "./chunk-BNPZFNFF.js";

// src/app/model/skill-block.model.ts
var SkillBlock = class {
  name;
  class;
  description;
  type;
  enlightened;
  level;
  skillId;
  statModifiers;
  libraryOrigin;
  libraryOriginName;
  // Source category
  skillSource;
  // User-set disabled flag (DM can disable individual skills)
  disabled;
  // Custom cost for active skills (falls back to definition lookup if not set)
  cost;
  actionType;
  // Optional inline action macro (overrides cost popup when set)
  embeddedMacro;
  // Simpler skill macro (MacroAction, configured in editor)
  embeddedMacroAction;
  // FailScript action (new); takes precedence over the legacy macros above
  script;
  // Perpetual: while this skill is active, its script's effectActive block is collected
  // continuously (like a status effect) instead of running once on activation.
  perpetual;
  // Set when this skill was granted by a race (holds race id) - used for cleanup on race change
  sourceRaceId;
  // Configurable counter bars shown while skill is active
  counters;
  // Effect-bound: derived from an active effect's effectActive grantSkill (not persisted).
  derived;
  /** Granted by an equipped item (derived, not persisted). */
  isItemBased;
};

// src/app/utils/skill-tree-rules.util.ts
function talentPointsForLevel(level) {
  return 2 + Math.floor((Math.max(1, level) - 1) / 10);
}
function totalTalentPointsAtLevel(level) {
  let total = 0;
  for (let l = 1; l <= Math.max(0, level); l++)
    total += talentPointsForLevel(l);
  return total;
}
function talentPointCostForTier(tier) {
  switch (tier) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 2;
    case 4:
      return 3;
    default:
      return 3;
  }
}
function talentPointCostForSkill(skill) {
  const tier = CLASS_DEFINITIONS[skill.class]?.tier;
  return talentPointCostForTier(tier ?? 1);
}

export {
  SkillBlock,
  totalTalentPointsAtLevel,
  talentPointCostForTier,
  talentPointCostForSkill
};
//# sourceMappingURL=chunk-SYK3RTY6.js.map
