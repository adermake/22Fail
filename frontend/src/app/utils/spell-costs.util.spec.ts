import { describe, expect, it } from 'vitest';
import { CastingSpellEntry, SpellBlock } from '../model/spell-block-model';
import {
  committedFokus, spellFokusCost, spellHaltbarkeitsKosten, spellManaCost, spellVoraussetzung,
} from './spell-costs.util';

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

  it('binds Fokus for an id-less spell matched by name', () => {
    const spells = [spell({ name: 'Feuerball', costFokus: 4 })];
    expect(committedFokus(spells, [entry('feuerball')], [])).toBe(4);
  });
});

describe('Voraussetzung', () => {
  it('takes the heaviest single stat, not the sum', () => {
    const s = spell({ statRequirements: { intelligence: 12, dexterity: 4 } });
    expect(spellVoraussetzung(s, [])).toBe(12);
  });

  it('is 0 when the spell demands nothing', () => {
    expect(spellVoraussetzung(spell({}), [])).toBe(0);
  });
});

describe('Haltbarkeitsverbrauch', () => {
  it('burns the full Voraussetzung at cast level 0', () => {
    const s = spell({ statRequirements: { intelligence: 5 } });
    expect(spellHaltbarkeitsKosten(s, [])).toBe(5);
  });

  it('halves at cast level 100 and doubles at Skalierung 2', () => {
    const s = spell({ statRequirements: { intelligence: 12 } });
    expect(spellHaltbarkeitsKosten(s, [], 100, 1)).toBe(6);
    expect(spellHaltbarkeitsKosten(s, [], 100, 2)).toBe(12);
    expect(spellHaltbarkeitsKosten(s, [], 0, 2)).toBe(24);
  });

  it('burns nothing for a spell with no Voraussetzung', () => {
    expect(spellHaltbarkeitsKosten(spell({}), [], 0, 3)).toBe(0);
  });
});
