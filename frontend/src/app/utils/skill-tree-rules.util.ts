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

// ── Class progression ────────────────────────────────────────────────────────
// Pure mirrors of the tree's gating rules, so they can be tested and can never drift from
// what the component enforces (the component delegates to these).

/** Parent → children is authored in CLASS_DEFINITIONS; invert it once. */
export function classParentMap(): Map<string, string[]> {
  const parents = new Map<string, string[]>();
  for (const [className, info] of Object.entries(CLASS_DEFINITIONS)) {
    for (const child of info.children) {
      const list = parents.get(child.className) ?? [];
      list.push(className);
      parents.set(child.className, list);
    }
  }
  return parents;
}

/** How many skills of a class the character has learned (infinite skills counted once). */
export function learnedCountForClass(
  className: string,
  learnedSkillIds: readonly string[],
  skillsOfClass: (className: string) => { id: string }[],
): number {
  const ids = new Set(learnedSkillIds);
  return skillsOfClass(className).filter(s => ids.has(s.id)).length;
}

/**
 * A class counts as "had" once HALF of its skills are learned — the same bar the tree has always
 * used to unlock children.
 */
export function classIsHad(
  className: string,
  learnedSkillIds: readonly string[],
  skillsOfClass: (className: string) => { id: string }[],
): boolean {
  const total = skillsOfClass(className).length;
  if (total === 0) return false;
  return learnedCountForClass(className, learnedSkillIds, skillsOfClass) >= Math.ceil(total / 2);
}

export interface ClassGateInput {
  learnedSkillIds: readonly string[];
  gmUnlockedClasses?: readonly string[];
  skillsOfClass: (className: string) => { id: string }[];
}

/** Why a class is closed, or '' when it is open. */
export function classLockReason(className: string, input: ClassGateInput): string {
  const tier = CLASS_DEFINITIONS[className]?.tier ?? 1;
  if (tier === 1) return '';
  // A GM force-unlock skips every requirement, including the tier ladder.
  if ((input.gmUnlockedClasses ?? []).includes(className)) return '';

  const parents = classParentMap().get(className) ?? [];
  if (!parents.some(p => classIsHad(p, input.learnedSkillIds, input.skillsOfClass))) {
    return 'Benötigt die Hälfte der Fähigkeiten einer Vorgängerklasse';
  }
  // Connections may skip a tier; progression may not.
  for (let t = 2; t < tier; t++) {
    const hasTier = Object.entries(CLASS_DEFINITIONS)
      .some(([name, info]) => info.tier === t && classIsHad(name, input.learnedSkillIds, input.skillsOfClass));
    if (!hasTier) return `Benötigt zuerst eine Klasse der Stufe ${t}`;
  }
  return '';
}

/** True when skills of `className` may be learned. */
export function canLearnFromClass(className: string, input: ClassGateInput): boolean {
  return classLockReason(className, input) === '';
}

// ── Grandfathering ───────────────────────────────────────────────────────────

/**
 * The tier price table as it stood before 2026-08 (1 · 1 · 2 · 2 · 3). Skills bought under the old
 * rules keep the price they were paid at: re-pricing an existing sheet with the new, dearer table
 * silently took points away from every character that already existed.
 */
export function legacyTalentPointCostForTier(tier: number): number {
  if (tier <= 2) return 1;
  if (tier <= 4) return 2;
  return 3;
}

/**
 * Points spent on the learned skills. `paid` records what each skill actually cost when it was
 * bought; anything missing predates that bookkeeping and is charged at the legacy price.
 */
export function spentTalentPoints(
  learnedSkillIds: readonly string[],
  paid: Readonly<Record<string, number>> | undefined,
  skillById: (id: string) => SkillDefinition | undefined,
): number {
  let spent = 0;
  for (const id of learnedSkillIds) {
    const recorded = paid?.[id];
    if (recorded !== undefined) { spent += recorded; continue; }
    const skill = skillById(id);
    const tier = skill ? (CLASS_DEFINITIONS[skill.class]?.tier ?? 1) : 1;
    spent += legacyTalentPointCostForTier(tier);
  }
  return spent;
}
