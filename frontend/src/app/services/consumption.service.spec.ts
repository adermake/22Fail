import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ConsumptionService, isConsumable } from './consumption.service';
import { RestService } from './rest.service';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { PotionEffectInstance, potionEffectsToScript } from '../model/brewing.model';
import { FormulaType } from '../model/formula-type.enum';

/**
 * Potions and Verbrauchsgegenstände run through ONE path: brewing writes the script, the item
 * editor writes it by hand, and consuming is identical for both.
 */

function sheet(): CharacterSheet {
  const s = createEmptySheet();
  s.level = 1;
  s.statuses.find(x => x.formulaType === FormulaType.LIFE)!.statusCurrent = 50;
  return s;
}

function item(partial: Partial<ItemBlock>): ItemBlock {
  return { name: 'Trank', itemType: 'potion', ...partial } as ItemBlock;
}

const STACK_EFFECT: PotionEffectInstance = {
  slot: 'primary', statusEffectId: 'fx_kraft', statusEffectName: 'Kraft',
  mode: 'STACK', amount: 6, ingredientName: 'Wurzel', brewCount: 1,
};
const DURATION_EFFECT: PotionEffectInstance = {
  slot: 'secondary', statusEffectId: 'fx_benommen', statusEffectName: 'Benommen',
  mode: 'DURATION', amount: 3, ingredientName: 'Wurzel', brewCount: 1,
};

describe('potionEffectsToScript', () => {
  it('writes STACK effects as applyStatus(id, stacks)', () => {
    expect(potionEffectsToScript([STACK_EFFECT])).toBe('applyStatus("fx_kraft", 6)');
  });

  it('writes DURATION effects as applyStatus(id, 1, turns)', () => {
    expect(potionEffectsToScript([DURATION_EFFECT])).toBe('applyStatus("fx_benommen", 1, 3)');
  });

  it('emits one line per effect and skips unset ones', () => {
    const script = potionEffectsToScript([
      STACK_EFFECT, DURATION_EFFECT, { ...STACK_EFFECT, statusEffectId: '' },
    ]);
    expect(script.split('\n').length).toBe(2);
  });

  it('quotes ids safely', () => {
    const script = potionEffectsToScript([{ ...STACK_EFFECT, statusEffectId: 'fx"weird' }]);
    expect(script).toContain('"fx\\"weird"');
  });
});

describe('ConsumptionService', () => {
  let svc: ConsumptionService;
  let rest: RestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    svc = TestBed.inject(ConsumptionService);
    rest = TestBed.inject(RestService);
  });

  it('recognises potions, consumables and scripted items alike', () => {
    expect(isConsumable(item({ itemType: 'potion', script: 'applyStatus("fx_kraft", 6)' }))).toBe(true);
    expect(isConsumable(item({ itemType: 'consumable' }))).toBe(true);
    expect(isConsumable(item({ itemType: 'other', script: 'gainResource(health, 1)' }))).toBe(true);
    expect(isConsumable(item({ itemType: 'weapon' }))).toBe(false);
    expect(isConsumable(null)).toBe(false);
  });

  it('applies a scripted potion immediately', () => {
    const s = sheet();
    s.inventory = [item({ script: 'gainResource(health, 7)' })];
    svc.consume(s, s.inventory[0]!, 0);
    expect(s.statuses.find(x => x.formulaType === FormulaType.LIFE)!.statusCurrent).toBe(57);
  });

  it('applies a brewed potion script: stacks and duration land on the sheet', () => {
    const s = sheet();
    s.inventory = [item({ script: potionEffectsToScript([STACK_EFFECT, DURATION_EFFECT]) })];
    svc.consume(s, s.inventory[0]!, 0);

    const kraft = s.activeStatusEffects.find(e => e.statusEffectId === 'fx_kraft');
    const benommen = s.activeStatusEffects.find(e => e.statusEffectId === 'fx_benommen');
    expect(kraft?.stacks).toBe(6);
    expect(benommen?.duration).toBe(3);
    expect(s.seenStatusEffectIds).toContain('fx_kraft');
  });

  it('takes one unit off a stack and leaves the rest', () => {
    const s = sheet();
    s.inventory = [item({ stackable: true, amount: 3 })];
    svc.consume(s, s.inventory[0]!, 0);
    expect(s.inventory[0]?.amount).toBe(2);
  });

  it('removes a single item entirely', () => {
    const s = sheet();
    s.inventory = [item({})];
    svc.consume(s, s.inventory[0]!, 0);
    expect(s.inventory.length).toBe(0);
  });

  it('queues the used unit under Verbraucht with amount 1', () => {
    const s = sheet();
    s.inventory = [item({ name: 'Heiltrank', stackable: true, amount: 5 })];
    svc.consume(s, s.inventory[0]!, 0);
    expect(s.consumedItems?.length).toBe(1);
    expect(s.consumedItems![0].item.name).toBe('Heiltrank');
    expect(s.consumedItems![0].item.amount).toBe(1);
  });

  it('refuses items that are not consumable', () => {
    const s = sheet();
    s.inventory = [item({ itemType: 'weapon' })];
    const result = svc.consume(s, s.inventory[0]!, 0);
    expect(result.consumed).toBe(false);
    expect(s.inventory.length).toBe(1);
    expect(s.consumedItems ?? []).toEqual([]);
  });

  // ── The whole point of the merge: potions reach the Rast like anything else ──

  it('lets a consumed potion react to the next Rast', () => {
    const s = sheet();
    s.inventory = [item({
      name: 'Rauschtrank',
      script: 'gainResource(health, 5) onRest { loseResource(health, 2) }',
    })];

    svc.consume(s, s.inventory[0]!, 0);
    const life = () => s.statuses.find(x => x.formulaType === FormulaType.LIFE)!.statusCurrent;
    expect(life()).toBe(55);           // immediate effect
    expect(s.consumedItems?.length).toBe(1);

    const outcome = rest.performRest(s);
    expect(outcome.fired.map(f => f.name)).toEqual(['Rauschtrank']);
    expect(life()).toBe(53);           // the hangover
    expect(s.consumedItems).toEqual([]);
  });
});
