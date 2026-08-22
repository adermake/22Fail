import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RestService } from './rest.service';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { ItemBlock } from '../model/item-block.model';
import { FormulaType } from '../model/formula-type.enum';

/** Heals 5 Leben when the character rests, and nothing otherwise. */
const REST_HEAL = 'onRest { gainResource(health, 5) }';

function sheetWithHealth(current: number): CharacterSheet {
  const sheet = createEmptySheet();
  sheet.level = 1;
  const life = sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!;
  life.statusCurrent = current;
  return sheet;
}

function consumable(name: string, script?: string): ItemBlock {
  return { name, itemType: 'consumable', script } as ItemBlock;
}

function skill(partial: Partial<SkillBlock>): SkillBlock {
  return { name: 'S', class: 'X', description: '', type: 'passive', enlightened: false, ...partial } as SkillBlock;
}

function spell(partial: Partial<SpellBlock>): SpellBlock {
  return { id: 'sp1', name: 'Z', description: '', tags: [], binding: { type: 'learned' }, ...partial } as SpellBlock;
}

describe('RestService', () => {
  let svc: RestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(RestService);
  });

  // ── What qualifies ────────────────────────────────────────────────────────

  it('collects consumed items that carry an onRest block', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{ item: consumable('Kraftrune', REST_HEAL), consumedAt: 0 }];
    expect(svc.collectRestSources(sheet).map(s => s.name)).toEqual(['Kraftrune']);
  });

  it('ignores consumed items without an onRest block', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{ item: consumable('Nur Trank'), consumedAt: 0 }];
    expect(svc.collectRestSources(sheet).length).toBe(0);
  });

  it('fires passive skills, which are always on', () => {
    const sheet = sheetWithHealth(50);
    sheet.skills = [skill({ name: 'Zäher Schlaf', type: 'passive', script: REST_HEAL })];
    expect(svc.collectRestSources(sheet).map(s => s.name)).toEqual(['Zäher Schlaf']);
  });

  it('fires an active skill only while it is switched on', () => {
    const sheet = sheetWithHealth(50);
    sheet.skills = [skill({ name: 'Meditation', type: 'active', script: REST_HEAL })];
    expect(svc.collectRestSources(sheet).length).toBe(0);

    sheet.activeSkillNames = ['Meditation'];
    expect(svc.collectRestSources(sheet).map(s => s.name)).toEqual(['Meditation']);
  });

  it('treats an activeSkillEntry as switched on too', () => {
    const sheet = sheetWithHealth(50);
    sheet.skills = [skill({ name: 'Meditation', type: 'active', script: REST_HEAL })];
    sheet.activeSkillEntries = [{ skillName: 'Meditation' } as any];
    expect(svc.collectRestSources(sheet).length).toBe(1);
  });

  it('never fires a disabled skill', () => {
    const sheet = sheetWithHealth(50);
    sheet.skills = [skill({ name: 'Aus', type: 'passive', script: REST_HEAL, disabled: true })];
    expect(svc.collectRestSources(sheet).length).toBe(0);
  });

  it('fires a spell only while it is sustained (fully cast)', () => {
    const sheet = sheetWithHealth(50);
    sheet.spells = [spell({ name: 'Traumhain', script: REST_HEAL })];
    sheet.castingSpells = [{ spellId: 'sp1', spellName: 'Traumhain', castLevel: 0, remainingCast: 2 }];
    expect(svc.collectRestSources(sheet).length).toBe(0); // still casting

    sheet.castingSpells = [{ spellId: 'sp1', spellName: 'Traumhain', castLevel: 0, remainingCast: 0 }];
    expect(svc.collectRestSources(sheet).map(s => s.kind)).toEqual(['spell']);
  });

  // ── Performing the rest ───────────────────────────────────────────────────

  it('applies each onRest effect to the sheet', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{ item: consumable('Kraftrune', REST_HEAL), consumedAt: 0 }];
    svc.performRest(sheet);
    const life = sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!;
    expect(life.statusCurrent).toBe(55);
  });

  it('empties the consumed queue, including items without an onRest block', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [
      { item: consumable('Mit', REST_HEAL), consumedAt: 0 },
      { item: consumable('Ohne'), consumedAt: 0 },
    ];
    const outcome = svc.performRest(sheet);
    expect(outcome.clearedItems).toBe(2);
    expect(sheet.consumedItems).toEqual([]);
    expect(outcome.fired.map(f => f.name)).toEqual(['Mit']);
  });

  it('stacks several sources in one rest', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{ item: consumable('Rune', REST_HEAL), consumedAt: 0 }];
    sheet.skills = [skill({ name: 'Passiv', type: 'passive', script: REST_HEAL })];
    svc.performRest(sheet);
    const life = sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!;
    expect(life.statusCurrent).toBe(60);
  });

  it('does not run the base script — only the onRest block', () => {
    const sheet = sheetWithHealth(50);
    // The base action would heal 100; only the onRest part may fire on a rest.
    sheet.consumedItems = [{
      item: consumable('Doppelt', 'gainResource(health, 100) onRest { gainResource(health, 5) }'),
      consumedAt: 0,
    }];
    svc.performRest(sheet);
    const life = sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!;
    expect(life.statusCurrent).toBe(55);
  });

  it('resting twice does nothing the second time (queue is gone)', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{ item: consumable('Rune', REST_HEAL), consumedAt: 0 }];
    svc.performRest(sheet);
    const second = svc.performRest(sheet);
    expect(second.fired.length).toBe(0);
    expect(second.clearedItems).toBe(0);
  });

  it('a rest with nothing queued and nothing active is a no-op', () => {
    const sheet = sheetWithHealth(50);
    const outcome = svc.performRest(sheet);
    expect(outcome.fired).toEqual([]);
    expect(outcome.clearedItems).toBe(0);
    expect(sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!.statusCurrent).toBe(50);
  });

  it('never heals past the maximum', () => {
    const sheet = sheetWithHealth(50);
    const life = sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!;
    life.statusCurrent = 9999;
    sheet.consumedItems = [{ item: consumable('Rune', REST_HEAL), consumedAt: 0 }];
    svc.performRest(sheet);
    expect(life.statusCurrent).toBeLessThanOrEqual(
      sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!.statusCurrent);
  });
});
