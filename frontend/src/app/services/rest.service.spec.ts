import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RestService } from './rest.service';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { ItemBlock } from '../model/item-block.model';
import { FormulaType } from '../model/formula-type.enum';
import { TrueStatsService } from './true-stats.service';

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
  let stats: TrueStatsService;
  const svcMax = (sheet: CharacterSheet, ft: FormulaType) => stats.calculateResourceMax(sheet, ft);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(RestService);
    stats = TestBed.inject(TrueStatsService);
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

  it('restores a quarter of every maximum on its own', () => {
    const sheet = sheetWithHealth(0);
    const base = svc.baseRestore(sheet);
    expect(base.health).toBe(Math.floor(svcMax(sheet, FormulaType.LIFE) * 0.25));

    svc.performRest(sheet);
    expect(sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!.statusCurrent).toBe(base.health);
  });

  it('adds onRest effects on top of the base restore', () => {
    const sheet = sheetWithHealth(0);
    const base = svc.baseRestore(sheet).health;
    sheet.consumedItems = [{ item: consumable('Kraftrune', REST_HEAL), consumedAt: 0 }];
    svc.performRest(sheet);
    expect(sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!.statusCurrent).toBe(base + 5);
  });

  it('halves the SUMMED gains when the character drank too little', () => {
    const sheet = sheetWithHealth(0);
    const base = svc.baseRestore(sheet).health;
    sheet.consumedItems = [{ item: consumable('Kraftrune', REST_HEAL), consumedAt: 0 }];
    const outcome = svc.performRest(sheet, { drankWater: false });
    expect(outcome.halved).toBe(true);
    // summed first, then halved — not each contribution halved on its own
    expect(outcome.restored.health).toBe(Math.floor((base + 5) / 2));
  });

  it('does not halve anything when the character drank enough', () => {
    const sheet = sheetWithHealth(0);
    const base = svc.baseRestore(sheet).health;
    const outcome = svc.performRest(sheet, { drankWater: true });
    expect(outcome.halved).toBe(false);
    expect(outcome.restored.health).toBe(base);
  });

  it('never softens a net loss through dehydration', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{
      item: consumable('Rausch', 'onRest { loseResource(health, 500) }'), consumedAt: 0,
    }];
    const outcome = svc.performRest(sheet, { drankWater: false });
    expect(outcome.restored.health).toBeLessThan(0);
  });

  it('restores energy and mana too', () => {
    const sheet = sheetWithHealth(0);
    const outcome = svc.performRest(sheet);
    expect(outcome.restored.energy).toBe(svc.baseRestore(sheet).energy);
    expect(outcome.restored.mana).toBeGreaterThanOrEqual(0);
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
    const sheet = sheetWithHealth(0);
    const base = svc.baseRestore(sheet).health;
    sheet.consumedItems = [{ item: consumable('Rune', REST_HEAL), consumedAt: 0 }];
    sheet.skills = [skill({ name: 'Passiv', type: 'passive', script: REST_HEAL })];
    svc.performRest(sheet);
    expect(sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!.statusCurrent).toBe(base + 10);
  });

  it('does not run the base script — only the onRest block', () => {
    const sheet = sheetWithHealth(0);
    // The base action would heal 100; only the onRest part may fire on a rest.
    sheet.consumedItems = [{
      item: consumable('Doppelt', 'gainResource(health, 100) onRest { gainResource(health, 5) }'),
      consumedAt: 0,
    }];
    const base = svc.baseRestore(sheet).health;
    svc.performRest(sheet);
    const life = sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!;
    expect(life.statusCurrent).toBe(base + 5);
  });

  it('resting twice still gives the base restore, but fires nothing', () => {
    const sheet = sheetWithHealth(50);
    sheet.consumedItems = [{ item: consumable('Rune', REST_HEAL), consumedAt: 0 }];
    svc.performRest(sheet);
    const second = svc.performRest(sheet);
    expect(second.fired.length).toBe(0);
    expect(second.clearedItems).toBe(0);
  });

  it('a rest with nothing queued still gives the base restore', () => {
    const sheet = sheetWithHealth(50);
    const outcome = svc.performRest(sheet);
    expect(outcome.fired).toEqual([]);
    expect(outcome.clearedItems).toBe(0);
    expect(sheet.statuses.find(s => s.formulaType === FormulaType.LIFE)!.statusCurrent)
      .toBe(50 + outcome.restored.health);
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

  describe('Vorschau (previewRest)', () => {
    it('reports what each source contributes, per pool', () => {
      const s = sheetWithHealth(1);
      s.consumedItems = [
        { item: consumable('Heiltrank', 'onRest { gainResource(health, 12) }'), consumedAt: 1 },
        { item: consumable('Kater', 'onRest { loseResource(energy, 4) }'), consumedAt: 2 },
      ];

      const preview = svc.previewRest(s);
      expect(preview.length).toBe(2);
      expect(preview[0].name).toBe('Heiltrank');
      expect(preview[0].contributes.health).toBe(12);
      expect(preview[1].contributes.energy).toBe(-4);
    });

    it('changes nothing on the sheet — it is a dry run', () => {
      const s = sheetWithHealth(1);
      s.consumedItems = [
        { item: consumable('Heiltrank', 'onRest { gainResource(health, 12) }'), consumedAt: 1 },
      ];
      const before = s.statuses.map(st => st.statusCurrent);

      svc.previewRest(s);

      expect(s.statuses.map(st => st.statusCurrent)).toEqual(before);
      expect(s.consumedItems.length).toBe(1);
    });

    it('leaves out sources that touch no pool', () => {
      const s = sheetWithHealth(1);
      s.consumedItems = [
        { item: consumable('Leuchtstein', 'onRest { display("Es leuchtet") }'), consumedAt: 1 },
      ];
      const preview = svc.previewRest(s);
      expect(preview.length).toBe(1);
      expect(preview[0].contributes).toEqual({});
    });

    it('matches what the Rast then actually applies', () => {
      const s = sheetWithHealth(1);
      s.consumedItems = [
        { item: consumable('Heiltrank', 'onRest { gainResource(health, 9) }'), consumedAt: 1 },
      ];
      const previewed = svc.previewRest(s)[0].contributes.health;
      const outcome = svc.performRest(s, { drankWater: true });
      expect(outcome.fired[0].contributes.health).toBe(previewed);
    });
  });
});
