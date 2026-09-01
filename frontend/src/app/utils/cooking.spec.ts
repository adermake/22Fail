import {
  COOKED_MARK, buildMealScript, cookingOutcome, describeMealEffects, isCookable, isCookedMeal,
  mergeConsumableScripts, rollCookingQuality, scaleSummary, summariseEffects,
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

  describe('adding up repeats', () => {
    it('merges the same status from two ingredients into one, with the stacks added', () => {
      const sum = summariseEffects({
        resourceChanges: [],
        statusOps: [
          { op: 'apply', id: 'fx_satt', stacks: 2, duration: 4 },
          { op: 'apply', id: 'fx_satt', stacks: 3, duration: 6 },
        ],
        displays: [],
      });
      expect(sum.statuses).toEqual([{ id: 'fx_satt', stacks: 5, duration: 6 }]);
    });

    it('does not repeat the same message twice', () => {
      const sum = summariseEffects({
        resourceChanges: [], statusOps: [],
        displays: [{ type: 'text', text: 'Lecker' }, { type: 'text', text: 'Lecker' }],
      });
      expect(sum.messages).toEqual(['Lecker']);
    });
  });

  describe('scaling the finished dish', () => {
    const summary = () => summariseEffects({
      resourceChanges: [{ resource: 'health', amount: 40 }, { resource: 'mana', amount: -8 }],
      statusOps: [{ op: 'apply', id: 'fx_satt', stacks: 4, duration: 8 }],
      displays: [],
    });

    it('divides by the portions', () => {
      const out = scaleSummary(summary(), 1 / 4);
      expect(out.resources).toEqual([
        { key: 'health', label: 'Leben', amount: 10 },
        { key: 'mana', label: 'Mana', amount: -2 },
      ]);
      expect(out.statuses[0]).toEqual({ id: 'fx_satt', stacks: 1, duration: 2 });
    });

    it('applies the roll on top of the portions', () => {
      // 4 portions of a dish cooked at +50 %: 40 → 10 → 15
      const out = scaleSummary(summary(), (1 / 4) * 1.5);
      expect(out.resources[0].amount).toBe(15);
    });

    it('shrinks a bad dish', () => {
      expect(scaleSummary(summary(), 0.75).resources[0].amount).toBe(30);
    });

    it('never scales a real effect away to nothing', () => {
      const tiny = summariseEffects({
        resourceChanges: [{ resource: 'health', amount: 1 }], statusOps: [], displays: [],
      });
      expect(scaleSummary(tiny, 0.01).resources[0].amount).toBe(1);
    });

    it('keeps a status at one stack at minimum', () => {
      const out = scaleSummary(summary(), 0.01);
      expect(out.statuses[0].stacks).toBe(1);
    });
  });

  describe('building the meal', () => {
    it('writes gains, losses and statuses, splitting immediate from onRest', () => {
      const script = buildMealScript({
        immediate: summariseEffects({
          resourceChanges: [{ resource: 'health', amount: 12 }],
          statusOps: [{ op: 'apply', id: 'fx_satt', stacks: 2, duration: 6 }],
          displays: [],
        }),
        onRest: summariseEffects({
          resourceChanges: [{ resource: 'mana', amount: -3 }], statusOps: [], displays: [],
        }),
      });

      expect(script).toContain('gainResource(health, 12)');
      expect(script).toContain('applyStatus("fx_satt", 2, 6)');
      expect(script).toContain('onRest {');
      expect(script).toContain('loseResource(mana, 3)');
    });

    it('leaves out an onRest block when nothing happens at rest', () => {
      const script = buildMealScript({
        immediate: summariseEffects({
          resourceChanges: [{ resource: 'health', amount: 5 }], statusOps: [], displays: [],
        }),
        onRest: summariseEffects({ resourceChanges: [], statusOps: [], displays: [] }),
      });
      expect(script).toBe('gainResource(health, 5)');
    });

    it('produces an empty script for a dish that does nothing', () => {
      const nothing = summariseEffects({ resourceChanges: [], statusOps: [], displays: [] });
      expect(buildMealScript({ immediate: nothing, onRest: nothing })).toBe('');
    });
  });

  describe('describing the meal for its item card', () => {
    it('reads as one line covering both halves', () => {
      const text = describeMealEffects({
        immediate: summariseEffects({
          resourceChanges: [{ resource: 'health', amount: 12 }], statusOps: [], displays: [],
        }),
        onRest: summariseEffects({
          resourceChanges: [{ resource: 'mana', amount: 4 }],
          statusOps: [{ op: 'apply', id: 'fx_satt', stacks: 2 }],
          displays: [],
        }),
      }, id => (id === 'fx_satt' ? 'Satt' : id));

      expect(text).toBe('Sofort: +12 Leben · Bei der Rast: +4 Mana, Satt ×2');
    });

    it('says nothing for a dish that does nothing', () => {
      const nothing = summariseEffects({ resourceChanges: [], statusOps: [], displays: [] });
      expect(describeMealEffects({ immediate: nothing, onRest: nothing }, id => id)).toBe('');
    });
  });
});
