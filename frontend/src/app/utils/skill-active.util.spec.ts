import { describe, expect, it } from 'vitest';
import { createEmptySheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { isSkillInEffect, skillsInEffect } from './skill-active.util';

const skill = (partial: Partial<SkillBlock>): SkillBlock =>
  ({ name: 'S', class: 'Magier', description: '', type: 'stat_bonus', enlightened: false, ...partial } as SkillBlock);

describe('isSkillInEffect (Klassen-Gate)', () => {
  it('zählt Fähigkeiten der aktuellen Klasse und ihrer Vorfahren', () => {
    const sheet = { primary_class: 'Kampfzauberer', secondary_class: '' };
    expect(isSkillInEffect(skill({ class: 'Kampfzauberer' }), sheet)).toBe(true);
    expect(isSkillInEffect(skill({ class: 'Magier' }), sheet)).toBe(true);
  });

  it('zählt Fähigkeiten einer abgelegten Klasse nicht mehr (+10 Mana bleibt nicht hängen)', () => {
    const sheet = { primary_class: 'Krieger', secondary_class: '' };
    expect(isSkillInEffect(skill({ class: 'Magier' }), sheet)).toBe(false);
  });

  it('manuell deaktiviert schlägt alles, erleuchtet und Rasse gelten immer', () => {
    const sheet = { primary_class: 'Krieger', secondary_class: '' };
    expect(isSkillInEffect(skill({ class: 'Krieger', disabled: true }), sheet)).toBe(false);
    expect(isSkillInEffect(skill({ class: 'Magier', enlightened: true }), sheet)).toBe(true);
    expect(isSkillInEffect(skill({ class: 'Magier', sourceRaceId: 'elf' }), sheet)).toBe(true);
  });

  it('klassenlose Blätter (NSC) haben kein Klassen-Gate', () => {
    expect(isSkillInEffect(skill({ class: 'Magier' }), { primary_class: '', secondary_class: '' })).toBe(true);
  });

  it('skillsInEffect filtert das Blatt', () => {
    const sheet = createEmptySheet();
    sheet.primary_class = 'Krieger';
    sheet.skills = [skill({ name: 'A', class: 'Krieger' }), skill({ name: 'B', class: 'Magier' })];
    expect(skillsInEffect(sheet).map(s => s.name)).toEqual(['A']);
  });
});
