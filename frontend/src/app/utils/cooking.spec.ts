import {
  COOKED_MARK, cookingMultiplier, dividePortions, isCookable, isCookedMeal,
  mergeConsumableScripts, rollCookingQuality, scaleRestValues, splitAmount,
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
    it('turns the die into a multiplier: (die + 5 + bonus) / 10', () => {
      expect(cookingMultiplier(1, 0).multiplier).toBe(0.6);
      expect(cookingMultiplier(5, 0).multiplier).toBe(1);
      expect(cookingMultiplier(20, 0).multiplier).toBe(2.5);
    });

    it('counts the kitchen bonus', () => {
      expect(cookingMultiplier(10, 5).multiplier).toBe(2);
      expect(cookingMultiplier(1, -4).multiplier).toBe(0.2);
    });

    it('never drops to zero, however bad it goes', () => {
      expect(cookingMultiplier(1, -99).multiplier).toBeGreaterThan(0);
    });

    it('rolls a d20 and reports what it rolled', () => {
      const roll = rollCookingQuality(3, () => 0.5);
      expect(roll.die).toBe(11);
      expect(roll.bonus).toBe(3);
      expect(roll.multiplier).toBe(1.9);
    });

    it('stays inside 1..20 across the whole random range', () => {
      for (const r of [0, 0.049, 0.5, 0.999]) {
        const die = rollCookingQuality(0, () => r).die;
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('scaling what a meal restores', () => {
    it('multiplies the values inside onRest', () => {
      const out = scaleRestValues('onRest { gainResource(health, 10) }', 2);
      expect(out).toBe('onRest { gainResource(health, 20) }');
    });

    it('leaves instant effects alone — they are the ingredient, not the cooking', () => {
      const out = scaleRestValues('gainResource(mana, 10) onRest { gainResource(health, 10) }', 2);
      expect(out).toContain('gainResource(mana, 10)');
      expect(out).toContain('gainResource(health, 20)');
    });

    it('scales applyStatus stacks and duration inside onRest', () => {
      const out = scaleRestValues('onRest { applyStatus("fx_satt", 2, 4) }', 2);
      expect(out).toBe('onRest { applyStatus("fx_satt", 4, 8) }');
    });

    it('handles several onRest blocks from several ingredients', () => {
      const out = scaleRestValues(
        ['onRest { gainResource(health, 4) }', 'onRest { gainResource(mana, 6) }'].join('\n'),
        0.5,
      );
      expect(out).toContain('gainResource(health, 2)');
      expect(out).toContain('gainResource(mana, 3)');
    });

    it('keeps a nested block inside onRest', () => {
      const out = scaleRestValues('onRest { if (level > 2) { gainResource(health, 10) } }', 2);
      expect(out).toBe('onRest { if (level > 2) { gainResource(health, 20) } }');
    });

    it('never rounds a real effect away to nothing', () => {
      const out = scaleRestValues('onRest { gainResource(health, 1) }', 0.1);
      expect(out).toBe('onRest { gainResource(health, 1) }');
    });

    it('is a no-op at a multiplier of one', () => {
      const src = 'onRest { gainResource(health, 7) }';
      expect(scaleRestValues(src, 1)).toBe(src);
    });

    it('leaves a script with no onRest untouched', () => {
      const src = 'gainResource(health, 7)';
      expect(scaleRestValues(src, 3)).toBe(src);
    });

    it('survives an unclosed onRest block', () => {
      const src = 'onRest { gainResource(health, 7)';
      expect(() => scaleRestValues(src, 2)).not.toThrow();
    });
  });
});
