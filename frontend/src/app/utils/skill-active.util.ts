import { CharacterSheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { ClassTree } from '../sheet/class-tree-model';

/**
 * Does this learned skill count right now — its bonuses, scripts and talent ranks?
 *
 * The ONE rule for the skill card (greyed out or not) and every calculator. They used to differ:
 * the card greyed out skills of a class the character no longer has, while TrueStats kept adding
 * their bonuses (switch away from a class and its +10 Mana stayed).
 *
 *  - switched off by hand → never
 *  - erleuchtet / Rassenfähigkeit → always
 *  - otherwise only while the skill's class is the primary or secondary class (or an ancestor of
 *    either). A sheet with no class at all (NSC sheets built from statblocks) has no class gate.
 */
export function isSkillInEffect(
  skill: SkillBlock,
  sheet: Pick<CharacterSheet, 'primary_class' | 'secondary_class'>,
): boolean {
  if (skill.disabled) return false;
  if (skill.enlightened || skill.sourceRaceId) return true;
  if (!sheet.primary_class && !sheet.secondary_class) return true;
  return ClassTree.isClassEnabled(skill.class, sheet.primary_class, sheet.secondary_class);
}

/** `sheet.skills` minus everything `isSkillInEffect` rules out. */
export function skillsInEffect(sheet: CharacterSheet): SkillBlock[] {
  return (sheet.skills ?? []).filter(s => isSkillInEffect(s, sheet));
}
