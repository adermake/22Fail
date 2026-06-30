import { SKILL_DEFINITIONS } from '../data/skill-definitions';
import { CharacterSheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { SkillDefinition } from '../model/skill-definition.model';
import { TalentId } from '../data/talent-definitions';

export interface SkillTalentBonusSource {
  skillName: string;
  amount: number;
}

export interface SkillTalentBonusBreakdown {
  total: number;
  sources: SkillTalentBonusSource[];
}

function resolveSkillDefinition(skill: SkillBlock): SkillDefinition | undefined {
  if (skill.skillId) return SKILL_DEFINITIONS.find(s => s.id === skill.skillId);
  return SKILL_DEFINITIONS.find(s => s.name === skill.name && s.class === skill.class)
    ?? SKILL_DEFINITIONS.find(s => s.name === skill.name);
}

/** Sum of virtual talent ranks granted by learned skills, per talent id. */
export function computeSkillTalentBonuses(sheet: CharacterSheet): Map<TalentId, number> {
  const totals = new Map<TalentId, number>();

  for (const skill of sheet.skills ?? []) {
    if (skill.disabled) continue;

    const def = resolveSkillDefinition(skill);
    if (!def || def.type !== 'talent_bonus') continue;

    const level = skill.level ?? 1;
    if (def.talentBonus) {
      const talentId = def.talentBonus.talent;
      totals.set(talentId, (totals.get(talentId) ?? 0) + def.talentBonus.amount * level);
    }
    if (def.talentBonuses) {
      for (const bonus of def.talentBonuses) {
        totals.set(bonus.talent, (totals.get(bonus.talent) ?? 0) + bonus.amount * level);
      }
    }
  }

  return totals;
}

/** Per-talent breakdown with contributing skill names (for tooltips). */
export function computeSkillTalentBonusBreakdown(sheet: CharacterSheet): Map<TalentId, SkillTalentBonusBreakdown> {
  const breakdown = new Map<TalentId, SkillTalentBonusBreakdown>();

  for (const skill of sheet.skills ?? []) {
    if (skill.disabled) continue;

    const def = resolveSkillDefinition(skill);
    if (!def || def.type !== 'talent_bonus') continue;

    const level = skill.level ?? 1;
    const entries: { talent: TalentId; amount: number }[] = [];
    if (def.talentBonus) entries.push({ talent: def.talentBonus.talent, amount: def.talentBonus.amount });
    if (def.talentBonuses) {
      for (const bonus of def.talentBonuses) {
        entries.push({ talent: bonus.talent, amount: bonus.amount });
      }
    }

    for (const entry of entries) {
      const amount = entry.amount * level;
      const existing = breakdown.get(entry.talent) ?? { total: 0, sources: [] };
      existing.total += amount;
      existing.sources.push({ skillName: skill.name, amount });
      breakdown.set(entry.talent, existing);
    }
  }

  return breakdown;
}
