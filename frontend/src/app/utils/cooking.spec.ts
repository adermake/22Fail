import {
  COOKED_MARK, cookingOutcome, dividePortions, isCookable, isCookedMeal, mergeConsumableScripts,
  rollCookingQuality, scaleAllValues, splitAmount, summariseEffects,
} from './cooking.util';
import { ItemBlock } from '../model/item-block.model';

function item(name: string, script?: string): ItemBlock {
  return { name, itemType: 'consumable', script } as ItemBlock;
}

function typed(type: ItemBlock['itemType'], script?: string): ItemBlock {
  return { name: 'X', itemType: type, script } as ItemBlock;
}

describe('Kochen', () => {
  describe('merging', () => {
    it('concatenates the scripts, labelled by source', () => {
      const merged = mergeConsumableScripts([
        item('Heiltrank', 'gainResource(health, 20)'),
        item('Kraftbrühe', 'gainResource(energy, 10)'),
      ]);
      expect(merged).toContain('// Heiltrank');
      expect(merged).toContain('gainResource(health, 20)');
      expect(merged).toContain('// Kraftbrühe');
      expect(merged).toContain('gainResource(energy, 10)');
    });

    it('skips ingredients without an effect', () => {
      const merged = mergeConsumableScripts([item('Wasser'), item('Trank', 'gainResource(mana, 4)')]);
      expect(merged).not.toContain('Wasser');
      expect(merged.split('\n').filter(l => l.startsWith('//')).length).toBe(1);
    });

    it('returns nothing for an empty pot', () => {
      expect(mergeConsumableScripts([])).toBe('');
    });
  });

  describe('splitting across portions', () => {
    it('divides evenly', () => {
      expect(splitAmount(20, 4)).toBe(5);
    });

    it('truncates rather than inflating a portion', () => {
      expect(splitAmount(10, 3)).toBe(3);
    });

    it('never divides an effect out of existence', () => {
      expect(splitAmount(2, 5)).toBe(1);
      expect(splitAmount(-2, 5)).toBe(-1);
    });

    it('leaves zero at zero', () => {
      expect(splitAmount(0, 3)).toBe(0);
    });
  });

  describe('dividePortions', () => {
    it('scales gainResource and loseResource', () => {
      const out = dividePortions('gainResource(health, 20) loseResource(mana, 8)', 4);
      expect(out).toContain('gainResource(health, 5)');
      expect(out).toContain('loseResource(mana, 2)');
    });

    it('scales applyStatus stacks and duration', () => {
      const out = dividePortions('applyStatus("fx_kraft", 8, 12)', 4);
      expect(out).toBe('applyStatus("fx_kraft", 2, 3)');
    });

    it('scales a stacks-only applyStatus', () => {
      expect(dividePortions('applyStatus("fx_kraft", 6)', 3)).toBe('applyStatus("fx_kraft", 2)');
    });

    it('leaves a single portion untouched', () => {
      const src = 'gainResource(health, 20)';
      expect(dividePortions(src, 1)).toBe(src);
    });

    it('passes comments and unknown calls through unchanged', () => {
      const src = '// Eintopf\nif (level > 3) { display("Sättigend") }\ngiveStatus("Satt", "", 1, 5, "", buff) { }';
      expect(dividePortions(src, 4)).toBe(src);
    });

    it('keeps onRest blocks working, scaled like everything else', () => {
      const out = dividePortions('onRest { gainResource(health, 12) }', 3);
      expect(out).toBe('onRest { gainResource(health, 4) }');
    });

    it('handles a real two-ingredient meal end to end', () => {
      const merged = mergeConsumableScripts([
        item('Heiltrank', 'gainResource(health, 30)'),
        item('Rauschtrank', 'applyStatus("fx_rausch", 4) onRest { loseResource(health, 6) }'),
      ]);
      const out = dividePortions(merged, 2);
      expect(out).toContain('gainResource(health, 15)');
      expect(out).toContain('applyStatus("fx_rausch", 2)');
      expect(out).toContain('loseResource(health, 3)');
    });
  });

  describe('was in den Topf darf', () => {
    const REST = 'onRest { gainResource(health, 4) }';

    it('accepts a consumable with an onRest effect', () => {
      expect(isCookable(item('Kräutersud', REST))).toBe(true);
    });

    it('rejects an instant potion — nothing of it survives the meal', () => {
      expect(isCookable(item('Heiltrank', 'gainResource(health, 20)'))).toBe(false);
    });

    it('rejects an item with no script at all', () => {
      expect(isCookable(item('Stein'))).toBe(false);
    });

    it('rejects a lost item', () => {
      const lost = item('Kräutersud', REST);
      lost.lost = true;
      expect(isCookable(lost)).toBe(false);
    });

    it('rejects a meal that came out of the pot — no infinite portion loop', () => {
      const meal = item('Eintopf', REST) as ItemBlock & { origin?: string };
      meal.origin = COOKED_MARK;
      expect(isCookedMeal(meal)).toBe(true);
      expect(isCookable(meal)).toBe(false);
    });

    it('never throws on a script that does not compile', () => {
      // The parser is error-tolerant: a malformed `onRest {` still declares the block, so the
      // item stays cookable and the author fixes it in the editor's lint panel.
      expect(() => isCookable(item('Kaputt', 'onRest { ('))).not.toThrow();
      expect(isCookable(item('Kaputt', 'gainResource(health,'))).toBe(false);
    });
  });

  describe('Kochzutaten', () => {
    const REST = 'onRest { gainResource(health, 4) }';

    it('accepts a Kochzutat, which cannot be eaten on its own', () => {
      expect(isCookable(typed('cooking-ingredient', REST))).toBe(true);
    });

    it('refuses equipment, however many onRest blocks it carries', () => {
      expect(isCookable(typed('other', REST))).toBe(false);
      expect(isCookable(typed('armor', REST))).toBe(false);
      expect(isCookable(typed('weapon', REST))).toBe(false);
    });

    it('still accepts ordinary food', () => {
      expect(isCookable(typed('consumable', REST))).toBe(true);
      expect(isCookable(typed('potion', REST))).toBe(true);
    });
  });

  describe('Kochprobe', () => {
    it('is 5 × (15 − W20) percent, so low rolls are good', () => {
      expect(cookingOutcome(15, 0).percent).toBe(0);
      expect(cookingOutcome(1, 0).percent).toBe(70);
      expect(cookingOutcome(20, 0).percent).toBe(-25);
    });

    it('turns the percentage into a factor', () => {
      expect(cookingOutcome(15, 0).multiplier).toBe(1);
      expect(cookingOutcome(20, 0).multiplier).toBe(0.75);
      expect(cookingOutcome(5, 0).multiplier).toBe(1.5);
    });

    it('lets the kitchen bonus lower the die', () => {
      expect(cookingOutcome(18, 3).percent).toBe(cookingOutcome(15, 0).percent);
      expect(cookingOutcome(15, 2).percent).toBe(10);
    });

    it('never ruins a dish down to nothing', () => {
      expect(cookingOutcome(20, -99).multiplier).toBeGreaterThan(0);
    });

    it('rolls a d20 and reports what it rolled', () => {
      const roll = rollCookingQuality(0, () => 0.5);
      expect(roll.die).toBe(11);
      expect(roll.percent).toBe(20);
    });

    it('stays inside 1..20 across the whole random range', () => {
      for (const r of [0, 0.049, 0.5, 0.999]) {
        const die = rollCookingQuality(0, () => r).die;
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('scaling the whole dish', () => {
    it('scales immediate effects as well as onRest ones', () => {
      const out = scaleAllValues('gainResource(mana, 10) onRest { gainResource(health, 10) }', 1.5);
      expect(out).toContain('gainResource(mana, 15)');
      expect(out).toContain('gainResource(health, 15)');
    });

    it('scales down on a bad roll', () => {
      expect(scaleAllValues('gainResource(health, 20)', 0.75)).toBe('gainResource(health, 15)');
    });

    it('scales applyStatus stacks and duration', () => {
      const out = scaleAllValues('applyStatus("fx_satt", 2, 4)', 2);
      expect(out).toBe('applyStatus("fx_satt", 4, 8)');
    });

    it('never rounds a real effect away to nothing', () => {
      expect(scaleAllValues('gainResource(health, 1)', 0.05)).toBe('gainResource(health, 1)');
    });

    it('is a no-op at a multiplier of one', () => {
      const src = 'onRest { gainResource(health, 7) }';
      expect(scaleAllValues(src, 1)).toBe(src);
    });

    it('combines with the portion split: both shrink the dish', () => {
      const perPortion = dividePortions('onRest { gainResource(health, 40) }', 4);
      expect(perPortion).toContain('gainResource(health, 10)');
      expect(scaleAllValues(perPortion, 0.75)).toContain('gainResource(health, 8)');
    });
  });

  describe('adding up what a dish does', () => {
    it('sums repeated changes to the same pool', () => {
      const sum = summariseEffects({
        resourceChanges: [
          { resource: 'health', amount: 5 },
          { resource: 'health', amount: 7 },
          { resource: 'mana', amount: 3 },
        ],
        statusOps: [],
        displays: [],
      });
      expect(sum.resources).toEqual([
        { key: 'health', label: 'Leben', amount: 12 },
        { key: 'mana', label: 'Mana', amount: 3 },
      ]);
      expect(sum.empty).toBe(false);
    });

    it('drops pools that net out to nothing', () => {
      const sum = summariseEffects({
        resourceChanges: [{ resource: 'health', amount: 5 }, { resource: 'health', amount: -5 }],
        statusOps: [],
        displays: [],
      });
      expect(sum.resources).toEqual([]);
      expect(sum.empty).toBe(true);
    });

    it('keeps losses as negative numbers', () => {
      const sum = summariseEffects({
        resourceChanges: [{ resource: 'energy', amount: -4 }], statusOps: [], displays: [],
      });
      expect(sum.resources[0].amount).toBe(-4);
    });

    it('lists applied statuses and ignores removals', () => {
      const sum = summariseEffects({
        resourceChanges: [],
        statusOps: [
          { op: 'apply', id: 'fx_satt', stacks: 2, duration: 6 },
          { op: 'remove', id: 'fx_hunger' },
        ],
        displays: [],
      });
      expect(sum.statuses).toEqual([{ id: 'fx_satt', stacks: 2, duration: 6 }]);
    });

    it('carries display text through', () => {
      const sum = summariseEffects({
        resourceChanges: [], statusOps: [],
        displays: [{ type: 'text', text: 'Schmeckt herrlich' }],
      });
      expect(sum.messages).toEqual(['Schmeckt herrlich']);
      expect(sum.empty).toBe(false);
    });

    it('reports an empty dish as empty', () => {
      expect(summariseEffects({ resourceChanges: [], statusOps: [], displays: [] }).empty).toBe(true);
    });
  });
});
