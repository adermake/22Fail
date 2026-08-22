import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TrueStatsService } from './true-stats.service';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { ItemBlock } from '../model/item-block.model';
import { StatusEffect } from '../model/status-effect.model';
import { FormulaType } from '../model/formula-type.enum';

/**
 * Wide-coverage tests for the stat calculator — the layer every number on the sheet, in the lobby
 * and in the damage calculator comes from. It exists because `effectActive { movespeed = 30 }`
 * silently ADDED 30 to the base instead of setting it: the pipeline ran on the modifier subtotal
 * rather than on the finished value.
 */

/** A sheet with predictable numbers: every base stat 10, no gain, level 1. */
function makeSheet(overrides: Partial<CharacterSheet> = {}): CharacterSheet {
  const sheet = createEmptySheet();
  for (const key of ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const) {
    sheet[key].base = 10;
    sheet[key].gain = 0;
    sheet[key].bonus = 0;
    sheet[key].free = 0;
  }
  sheet.level = 1;
  return { ...sheet, ...overrides };
}

/** Attach a status effect whose script drives the effectActive pipeline. */
function withEffect(sheet: CharacterSheet, script: string, extra: Partial<StatusEffect> = {}): CharacterSheet {
  const effect: StatusEffect = {
    id: 'fx_' + Math.random().toString(36).slice(2),
    name: 'Testeffekt',
    description: '',
    script,
    ...extra,
  } as StatusEffect;
  sheet.activeStatusEffects = [
    ...(sheet.activeStatusEffects ?? []),
    { statusEffectId: effect.id, stacks: 1, customEffect: effect } as any,
  ];
  return sheet;
}

function skill(partial: Partial<SkillBlock>): SkillBlock {
  return {
    name: 'Test', class: 'Test', description: '', type: 'passive', enlightened: false, ...partial,
  } as SkillBlock;
}

function item(partial: Partial<ItemBlock>): ItemBlock {
  return { name: 'Testgegenstand', itemType: 'armor', ...partial } as ItemBlock;
}

describe('TrueStatsService', () => {
  let svc: TrueStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(TrueStatsService);
  });

  // ── Base stats ────────────────────────────────────────────────────────────

  describe('base stat formula', () => {
    it('is base + bonus + free + gain × level', () => {
      const sheet = makeSheet();
      sheet.strength.base = 12;
      sheet.strength.bonus = 2;
      sheet.strength.free = 1;
      sheet.strength.gain = 0.5;
      sheet.level = 4;
      expect(svc.calculateStrength(sheet)).toBe(17); // 12 + 2 + 1 + 0.5*4
    });

    it('adds skill stat modifiers, scaled by skill level', () => {
      const sheet = makeSheet();
      sheet.skills = [skill({ name: 'Kraft', statModifiers: [{ stat: 'strength', amount: 2 }], level: 3 })];
      expect(svc.calculateStrength(sheet)).toBe(16); // 10 + 2*3
    });

    it('adds equipped item stat modifiers', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({ statModifiers: [{ stat: 'strength', amount: 4 }] })];
      expect(svc.calculateStrength(sheet)).toBe(14);
    });

    it('dice modifier is the inverse of the stat modifier (lower is better)', () => {
      const sheet = makeSheet();
      sheet.strength.base = 22;
      expect(svc.calculateStatModifier(sheet, 'strength')).toBe(3);
      expect(svc.calculateStatDiceModifier(sheet, 'strength')).toBe(-3);
    });
  });

  // ── effectActive pipeline on BASE stats ───────────────────────────────────

  describe('effectActive pipeline — base stats', () => {
    it('"=" SETS the stat instead of adding to it', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { speed = 30 }');
      expect(svc.calculateSpeed(sheet)).toBe(30);
    });

    it('"+=" adds on top of the base', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { speed += 5 }');
      expect(svc.calculateSpeed(sheet)).toBe(15);
    });

    it('"-=" subtracts', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { speed -= 4 }');
      expect(svc.calculateSpeed(sheet)).toBe(6);
    });

    it('"*=" multiplies the whole value', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { speed *= 2 }');
      expect(svc.calculateSpeed(sheet)).toBe(20);
    });

    it('"/=" divides the whole value', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { speed /= 2 }');
      expect(svc.calculateSpeed(sheet)).toBe(5);
    });

    it('applies several effects in priority order, so a later "=" wins', () => {
      let sheet = makeSheet();
      sheet = withEffect(sheet, 'effectActive { speed += 5 }', { priority: 0 } as any);
      sheet = withEffect(sheet, 'effectActive { speed = 3 }', { priority: 10 } as any);
      expect(svc.calculateSpeed(sheet)).toBe(3);
    });

    it('a lower-priority "=" is still modified by a later "+="', () => {
      let sheet = makeSheet();
      sheet = withEffect(sheet, 'effectActive { speed = 20 }', { priority: 0 } as any);
      sheet = withEffect(sheet, 'effectActive { speed += 5 }', { priority: 10 } as any);
      expect(svc.calculateSpeed(sheet)).toBe(25);
    });

    it('removing the effect restores the original value (nothing is persisted)', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { speed = 30 }');
      expect(svc.calculateSpeed(sheet)).toBe(30);
      sheet.activeStatusEffects = [];
      expect(svc.calculateSpeed(sheet)).toBe(10);
    });
  });

  // ── effectActive pipeline on DERIVED stats (the reported bug) ─────────────

  describe('effectActive pipeline — derived stats', () => {
    it('movespeed "=" sets the final movement, it does not add to it', () => {
      const plain = makeSheet();
      const base = svc.calculateMovementSpeed(plain);
      expect(base).toBe(10); // floor(8 + 10/4)

      const sheet = withEffect(makeSheet(), 'effectActive { movespeed = 30 }');
      expect(svc.calculateMovementSpeed(sheet)).toBe(30);
    });

    it('movespeed "+=" adds to the final movement', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { movespeed += 4 }');
      expect(svc.calculateMovementSpeed(sheet)).toBe(14);
    });

    it('movespeed "*=" doubles the finished value, not an empty modifier subtotal', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { movespeed *= 2 }');
      expect(svc.calculateMovementSpeed(sheet)).toBe(20);
    });

    it('grundbonus "=" sets the final value', () => {
      const sheet = withEffect(makeSheet({ level: 16 }), 'effectActive { grundbonus = 7 }');
      expect(svc.calculateGrundbonus(sheet)).toBe(7);
    });

    it('reaktion "=" sets the final value', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { reaktion = 2 }');
      expect(svc.calculateReaktionswert(sheet)).toBe(2);
    });

    it('movement stays non-negative even when set below zero', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { movespeed = -5 }');
      expect(svc.calculateMovementSpeed(sheet)).toBe(0);
    });
  });

  // ── Derived stats without effects ─────────────────────────────────────────

  describe('derived stats', () => {
    it('grundbonus = floor(level/8) + floor(wille/8) + bonus', () => {
      const sheet = makeSheet({ level: 16 });
      sheet.chill.base = 16;
      sheet.grundbonusBonus = 1;
      expect(svc.calculateGrundbonus(sheet)).toBe(2 + 2 + 1);
    });

    it('reaktion = 5 − floor(wille/8) − floor(level/8) + bonus', () => {
      const sheet = makeSheet({ level: 8 });
      sheet.chill.base = 8;
      expect(svc.calculateReaktionswert(sheet)).toBe(5 - 1 - 1);
    });

    it('movement = floor(8 + effective speed / 4)', () => {
      const sheet = makeSheet();
      sheet.speed.base = 20;
      expect(svc.calculateMovementSpeed(sheet)).toBe(13);
    });

    it('status "bewegung" modifiers add flatly on top of movement', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { movespeed += 2 }');
      expect(svc.calculateMovementSpeed(sheet)).toBe(12);
    });
  });

  // ── Armour: stacking, stability, malus ────────────────────────────────────

  describe('armour', () => {
    it('sums the stability of ALL equipped pieces and divides by 5', () => {
      const sheet = makeSheet();
      sheet.equipment = [
        item({ name: 'Helm', stability: 10 }),
        item({ name: 'Brustplatte', stability: 12 }),
        item({ name: 'Stiefel', stability: 3 }),
      ];
      expect(svc.calculateTotalStability(sheet)).toBe(5); // floor(25/5)
    });

    it('stacks several pieces in the same slot', () => {
      const sheet = makeSheet();
      sheet.equipment = [
        item({ name: 'Kette', armorType: 'chestplate', stability: 10 }),
        item({ name: 'Platte', armorType: 'chestplate', stability: 15 }),
      ];
      expect(svc.calculateTotalStability(sheet)).toBe(5);
    });

    it('ignores lost items', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({ stability: 50, lost: true })];
      expect(svc.calculateTotalStability(sheet)).toBe(0);
    });

    it('never goes negative', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { stability = -3 }');
      expect(svc.calculateTotalStability(sheet)).toBe(0);
    });

    it('armour debuff is the summed debuff ÷ 5, +5 per broken piece', () => {
      const sheet = makeSheet();
      sheet.equipment = [
        item({ armorDebuff: 10 }),
        item({ armorDebuff: 5, broken: true, itemType: 'armor' }),
      ];
      expect(svc.calculateTotalArmorDebuff(sheet)).toBe(3 + 5);
    });

    it('negation reduces the malus but never adds speed', () => {
      const sheet = makeSheet();
      sheet.speed.base = 20;
      sheet.equipment = [item({ armorDebuff: 20 })]; // → 4 malus
      sheet.speedPenaltyNegation = 100;
      expect(svc.calculateEffectiveSpeed(sheet)).toBe(20);
    });
  });

  // ── Item- and effect-granted abilities ────────────────────────────────────

  describe('granted abilities', () => {
    it('surfaces skills embedded in EQUIPPED items', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Flammenschwert',
        itemType: 'weapon',
        embeddedSkills: [skill({ name: 'Flammenstoß', type: 'active' })],
      })];
      const granted = svc.getItemSkillBlocks(sheet);
      expect(granted.length).toBe(1);
      expect(granted[0].name).toBe('Flammenstoß');
      expect(granted[0].isItemBased).toBe(true);
      expect(granted[0].derived).toBe(true);
    });

    it('surfaces spells embedded in equipped items and tags their origin', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Zauberstab',
        embeddedSpells: [{ name: 'Funke', description: '', tags: [], binding: { type: 'item' } } as any],
      })];
      const spells = svc.getItemSpellBlocks(sheet);
      expect(spells.length).toBe(1);
      expect(spells[0].itemOrigin).toBe('Zauberstab');
    });

    it('drops item abilities again when the item is lost/unequipped', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({ embeddedSkills: [skill({ name: 'X' })], lost: true })];
      expect(svc.getItemSkillBlocks(sheet).length).toBe(0);
      sheet.equipment = [];
      expect(svc.getItemSkillBlocks(sheet).length).toBe(0);
    });

    it('grantSkill inside effectActive yields a derived skill', () => {
      const sheet = withEffect(makeSheet(), 'effectActive { grantSkill("Feuerhauch", "Speit Feuer") { } }');
      const derived = svc.getDerivedSkillBlocks(sheet);
      expect(derived.length).toBe(1);
      expect(derived[0].name).toBe('Feuerhauch');
      expect(derived[0].derived).toBe(true);
    });
  });

  // ── Equipped item scripts ─────────────────────────────────────────────────

  describe('item scripts (effectActive while worn)', () => {
    const buffSword = (extra: Partial<ItemBlock> = {}) => item({
      name: 'Klinge der Stärke', itemType: 'weapon', armorType: 'weapon',
      script: 'effectActive { strength += 4 }', ...extra,
    });

    it('applies while the weapon sits in the weapon slot', () => {
      const sheet = makeSheet();
      sheet.equipment = [buffSword()];
      expect(svc.calculateStrength(sheet)).toBe(14);
    });

    it('does NOT apply while the weapon is stowed in Extra', () => {
      const sheet = makeSheet();
      sheet.equipment = [buffSword({ armorType: 'extra' })];
      expect(svc.calculateStrength(sheet)).toBe(10);
    });

    it('does NOT apply when the item is lost', () => {
      const sheet = makeSheet();
      sheet.equipment = [buffSword({ lost: true })];
      expect(svc.calculateStrength(sheet)).toBe(10);
    });

    it('applies for armour worn in an armour slot', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Panzer', itemType: 'armor', armorType: 'chestplate',
        script: 'effectActive { constitution += 3 }',
      })];
      expect(svc.calculateConstitution(sheet)).toBe(13);
    });

    it('applies for a "Sonstiges" item in the Extra slot', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Talisman', itemType: 'other', armorType: 'extra',
        script: 'effectActive { speed += 2 }',
      })];
      expect(svc.calculateSpeed(sheet)).toBe(12);
    });

    it('stops applying the moment the item is unequipped', () => {
      const sheet = makeSheet();
      sheet.equipment = [buffSword()];
      expect(svc.calculateStrength(sheet)).toBe(14);
      sheet.equipment = [];
      expect(svc.calculateStrength(sheet)).toBe(10);
    });

    it('can set a derived stat from an item, like any other effect', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Stiefel der Eile', itemType: 'armor', armorType: 'boots',
        script: 'effectActive { movespeed = 30 }',
      })];
      expect(svc.calculateMovementSpeed(sheet)).toBe(30);
    });

    it('reads the running item durability and counter bars', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Ladungsstab', itemType: 'other', armorType: 'extra',
        durability: 7, maxDurability: 10,
        counters: [{ id: 'c1', name: 'Ladungen', min: 0, max: 5, current: 3, color: '#fff' }],
        script: 'effectActive { intelligence += counter("Ladungen") strength += durability }',
      })];
      expect(svc.calculateIntelligence(sheet)).toBe(13);
      expect(svc.calculateStrength(sheet)).toBe(17);
    });

    it('grants a skill from an equipped item', () => {
      const sheet = makeSheet();
      sheet.equipment = [item({
        name: 'Flammenklinge', itemType: 'weapon', armorType: 'weapon',
        script: 'effectActive { grantSkill("Flammenstoß", "Speit Feuer") { } }',
      })];
      const derived = svc.getDerivedSkillBlocks(sheet);
      expect(derived.map(d => d.name)).toEqual(['Flammenstoß']);
    });
  });

  // ── Talents ───────────────────────────────────────────────────────────────

  describe('talents', () => {
    it('sums status effect talent modifiers with stacks', () => {
      const sheet = makeSheet();
      const effect = {
        id: 'fx_talent', name: 'Fokussiert', description: '',
        talentModifiers: [{ talentId: 'athletik', amount: 2 }],
      } as unknown as StatusEffect;
      sheet.activeStatusEffects = [
        { statusEffectId: effect.id, stacks: 3, customEffect: effect } as any,
      ];
      expect(svc.getStatusTalentBonus(sheet, 'athletik')).toBe(6);
    });

    it('reports the contributing sources for the tooltip', () => {
      const sheet = makeSheet();
      const effect = {
        id: 'fx_t', name: 'Gesegnet', description: '',
        talentModifiers: [{ talentId: 'athletik', amount: 1 }],
      } as unknown as StatusEffect;
      sheet.activeStatusEffects = [{ statusEffectId: effect.id, stacks: 2, customEffect: effect } as any];
      const sources = svc.getStatusTalentBonusSources(sheet, 'athletik');
      expect(sources).toEqual([{ name: 'Gesegnet', amount: 2 }]);
    });
  });

  // ── Resources ─────────────────────────────────────────────────────────────

  describe('resource maxima', () => {
    it('life = base + Konstitution×5 + 2 per level', () => {
      const sheet = makeSheet({ level: 5 });
      sheet.constitution.base = 10;
      sheet.statuses[0].statusBase = 80;
      sheet.statuses[0].statusBonus = 0;
      // 80 + 10*5 + 5*2
      expect(svc.calculateResourceMax(sheet, FormulaType.LIFE)).toBe(140);
    });

    it('the flat +2 per level scales with the level', () => {
      const low = makeSheet({ level: 1 });
      const high = makeSheet({ level: 11 });
      const diff = svc.calculateResourceMax(high, FormulaType.LIFE)
        - svc.calculateResourceMax(low, FormulaType.LIFE);
      expect(diff).toBe(20);
    });

    it('energy and mana do NOT get the flat health bonus', () => {
      const sheet = makeSheet({ level: 10 });
      sheet.dexterity.base = 10;
      sheet.statuses[1].statusBase = 50;
      expect(svc.calculateResourceMax(sheet, FormulaType.ENERGY)).toBe(50 + 50);
    });
  });

  // ── Free stat points ──────────────────────────────────────────────────────

  describe('free stat points', () => {
    it('grants one every three levels', () => {
      expect(svc.calculateTotalFreeStatPoints(makeSheet({ level: 9 }))).toBe(3);
    });

    it('grants one every two levels with Naturtalent', () => {
      const sheet = makeSheet({ level: 10 });
      sheet.skills = [skill({ name: 'Naturtalent' })];
      expect(svc.calculateTotalFreeStatPoints(sheet)).toBe(5);
    });

    it('counts spent points across all six stats', () => {
      const sheet = makeSheet();
      sheet.strength.free = 2;
      sheet.chill.free = 1;
      expect(svc.calculateSpentFreeStatPoints(sheet)).toBe(3);
    });
  });
});
