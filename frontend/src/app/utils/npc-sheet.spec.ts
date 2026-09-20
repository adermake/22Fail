import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { FormulaType } from '../model/formula-type.enum';
import { createEmptyNpcStatblock, NpcStatblock } from '../model/npc-statblock.model';
import { SkillBlock } from '../model/skill-block.model';
import { ActiveSkillEntry } from '../model/spell-block-model';
import { HEALTH_PER_LEVEL, TrueStatsService } from '../services/true-stats.service';
import { NPC_BASE_POOL, buildNpcSheet, npcSkillFromDefinition } from './npc-sheet.util';

/**
 * NSCs on the player calculator.
 *
 * Every case here was broken at the table: a Fähigkeit's `+Konstitution` never left the class-tree
 * definition, `+30 Leben` reached nothing at all, a skill activated on a token never ran its
 * `effectActive` (so `diceBonus("Blutfluch", 2)` was invisible in the token's Würfelwurf), and a
 * script asking for `healthMax` got the pool counted twice.
 */

/** A statblock with flat, predictable numbers: every stat 10, level 1. */
function statblock(overrides: Partial<NpcStatblock> = {}): NpcStatblock {
  const sb = createEmptyNpcStatblock();
  sb.level = 1;
  sb.strength = 10; sb.dexterity = 10; sb.speed = 10;
  sb.intelligence = 10; sb.constitution = 10; sb.wille = 10;
  sb.customSkills = [];
  sb.equipment = [];
  return Object.assign(sb, overrides);
}

function skill(partial: Partial<SkillBlock>): SkillBlock {
  return {
    name: 'Test', class: 'Test', description: '', type: 'passive', enlightened: false, ...partial,
  } as SkillBlock;
}

function entry(skillName: string): ActiveSkillEntry {
  return { entryId: 'e1', skillName, roundsActive: 0 } as ActiveSkillEntry;
}

describe('NSC-Blatt', () => {
  let svc: TrueStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(TrueStatsService);
  });

  describe('Klassenbaum-Fertigkeiten', () => {
    it('carries a definition\'s statBonus over as statModifiers', () => {
      // "Konstitution+1" of the Kämpfer tree — the id shape used by the data file.
      const withBonus = npcSkillFromDefinition('kaempfer_konstitution_1');
      expect(withBonus?.statModifiers).toEqual([{ stat: 'constitution', amount: 1 }]);
    });

    it('raises the NSC\'s stat through the calculator', () => {
      const sb = statblock({ customSkills: [skill({ type: 'stat_bonus', statModifiers: [{ stat: 'constitution', amount: 4 }] })] });
      expect(svc.calculateConstitution(buildNpcSheet(sb))).toBe(14);
    });
  });

  describe('Ressourcen', () => {
    it('uses the player formula: Grundpool plus Stat×5 plus flat Leben per level', () => {
      const sheet = buildNpcSheet(statblock({ level: 10 }));
      sheet.level = 10;
      expect(svc.calculateResourceMax(sheet, FormulaType.LIFE)).toBe(NPC_BASE_POOL + 10 * 5 + 10 * HEALTH_PER_LEVEL);
      expect(svc.calculateResourceMax(sheet, FormulaType.ENERGY)).toBe(NPC_BASE_POOL + 50);
      expect(svc.calculateResourceMax(sheet, FormulaType.MANA)).toBe(NPC_BASE_POOL + 50);
    });

    it('gives every NSC the flat Grundpool the race used to provide', () => {
      // 15 in each stands in for the 50 points every race spreads over the three pools.
      expect(NPC_BASE_POOL).toBe(15);
      for (const status of buildNpcSheet(statblock()).statuses ?? []) {
        expect(status.statusBase).toBe(NPC_BASE_POOL);
      }
    });

    it('counts a Fähigkeit\'s resource bonus', () => {
      const sb = statblock({ customSkills: [skill({ statModifiers: [{ stat: 'life', amount: 30 }] })] });
      const sheet = buildNpcSheet(sb);
      expect(svc.calculateResourceMax(sheet, FormulaType.LIFE)).toBe(NPC_BASE_POOL + 50 + HEALTH_PER_LEVEL + 30);
    });

    it('does not count the statblock\'s own pool a second time', () => {
      // The statblock's finished maxHealth must never become the sheet's base, or `healthMax` inside
      // a script reads it plus the whole formula again.
      const sb = statblock({ maxHealth: 999 });
      expect(svc.calculateResourceMax(buildNpcSheet(sb), FormulaType.LIFE)).toBe(NPC_BASE_POOL + 52);
    });
  });

  describe('effectActive einer aktivierten Fertigkeit', () => {
    const blutfluch = skill({
      name: 'Blutfluch',
      type: 'active',
      script: 'effectActive {\n  diceBonus("Blutfluch", 2)\n}',
    });

    it('is collected when the skill is activated from the abilities dock', () => {
      const sb = statblock({ customSkills: [blutfluch] });
      const sheet = buildNpcSheet(sb, { activeSkillEntries: [entry('Blutfluch')] });
      expect(svc.getDerivedDiceBonuses(sheet)).toEqual([
        expect.objectContaining({ name: 'Blutfluch', value: 2, source: 'Blutfluch' }),
      ]);
    });

    it('is collected when the skill is toggled by name (cast window)', () => {
      const sb = statblock({ customSkills: [blutfluch] });
      const sheet = buildNpcSheet(sb, { activeSkillNames: ['Blutfluch'] });
      expect(svc.getDerivedDiceBonuses(sheet).map(b => b.value)).toEqual([2]);
    });

    it('stays silent while the skill is not active', () => {
      const sheet = buildNpcSheet(statblock({ customSkills: [blutfluch] }));
      expect(svc.getDerivedDiceBonuses(sheet)).toEqual([]);
    });

    it('applies a stat assignment from an activated skill', () => {
      const sb = statblock({
        customSkills: [skill({ name: 'Rage', type: 'active', script: 'effectActive {\n  strength += 6\n}' })],
      });
      const sheet = buildNpcSheet(sb, { activeSkillEntries: [entry('Rage')] });
      expect(svc.calculateStrength(sheet)).toBe(16);
    });
  });

  describe('Token-Statuseffekte', () => {
    it('modify the NSC\'s stats like they do a player\'s', () => {
      const sheet = buildNpcSheet(statblock(), {
        activeStatusEffects: [{
          id: 'fx1', name: 'Schwächung', stacks: 2,
          customEffect: { id: 'fx1', name: 'Schwächung', description: '', statModifiers: [{ stat: 'strength', amount: -2 }] } as any,
        }],
      });
      expect(svc.calculateStrength(sheet)).toBe(6);
    });
  });
});
