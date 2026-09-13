import { describe, expect, it } from 'vitest';
import { CastingSpellEntry, SpellBlock } from '../model/spell-block-model';
import { committedFokus, spellFokusCost, spellManaCost } from './spell-costs.util';

const spell = (partial: Partial<SpellBlock>): SpellBlock => ({ name: 'Zauber', ...partial }) as SpellBlock;
const entry = (spellId: string): CastingSpellEntry =>
  ({ spellId, spellName: spellId, castLevel: 0, remainingCast: 0, roundsActive: 0 }) as CastingSpellEntry;

describe('Zauberkosten', () => {
  it('prefers the per-round Fokus over the cast Fokus', () => {
    expect(spellFokusCost(spell({ costFokus: 3, perTurnFokus: 2 }), [])).toBe(2);
    expect(spellFokusCost(spell({ costFokus: 3 }), [])).toBe(3);
  });

  it('charges the stored Mana at cast level 0', () => {
    expect(spellManaCost(spell({ costMana: 12 }), [])).toBe(12);
  });

  it('sums the Fokus of running spells and ignores unknown entries', () => {
    const spells = [spell({ id: 'a', costFokus: 2 }), spell({ id: 'b', perTurnFokus: 3 })];
    expect(committedFokus(spells, [entry('a'), entry('b'), entry('gone')], [])).toBe(5);
  });
});
