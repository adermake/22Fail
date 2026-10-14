import { describe, expect, it } from 'vitest';
import { CastingSpellEntry, SpellBlock } from '../model/spell-block-model';
import {
  applyTurnStartUpkeep, isCastingEntryFinished, isSustainedUntilReleased,
} from './spell-upkeep.util';

const spell = (partial: Partial<SpellBlock>): SpellBlock =>
  ({ id: 'sp', name: 'Zauber', description: '', ...partial } as SpellBlock);

const entry = (partial: Partial<CastingSpellEntry>): CastingSpellEntry =>
  ({ spellId: 'sp', spellName: 'Zauber', castLevel: 0, remainingCast: 0, roundsActive: 0, ...partial });

describe('Zauber-Unterhalt', () => {
  it('Dauer 0 mit Rundenkosten läuft bis zum Lösen', () => {
    const s = spell({ durationTurns: 0, perTurnMana: 3 });
    expect(isSustainedUntilReleased(s)).toBe(true);
    expect(isCastingEntryFinished(entry({ roundsActive: 99 }), s)).toBe(false);
  });

  it('Dauer 0 ohne Rundenkosten ist sofort vorbei', () => {
    expect(isCastingEntryFinished(entry({}), spell({ durationTurns: 0 }))).toBe(true);
  });

  it('Dauer zählt mit Skalierung', () => {
    const s = spell({ durationTurns: 2 });
    expect(isCastingEntryFinished(entry({ roundsActive: 2 }), s)).toBe(true);
    expect(isCastingEntryFinished(entry({ roundsActive: 1 }), s)).toBe(false);
  });

  it('Zugbeginn: Runde +1 und Mana pro Runde wird abgezogen', () => {
    const s = spell({ durationTurns: 3, perTurnMana: 4 });
    const res = applyTurnStartUpkeep([entry({ roundsActive: 1 })], () => s, 10);
    expect(res.castingSpells[0].roundsActive).toBe(2);
    expect(res.manaSpent).toBe(4);
    expect(res.unpaid).toEqual([]);
  });

  it('nicht genug Mana: Zauber läuft weiter, Kosten entfallen, Warnung', () => {
    const s = spell({ perTurnMana: 5 });
    const res = applyTurnStartUpkeep([entry({})], () => s, 2);
    expect(res.castingSpells[0].roundsActive).toBe(1);
    expect(res.manaSpent).toBe(0);
    expect(res.unpaid).toEqual(['Zauber']);
  });

  it('noch im Wirken oder bereits beendet: nichts passiert', () => {
    const s = spell({ durationTurns: 1, perTurnMana: 5 });
    const res = applyTurnStartUpkeep(
      [entry({ remainingCast: 10, roundsActive: undefined }), entry({ roundsActive: 1 })], () => s, 50);
    expect(res.changed).toBe(false);
    expect(res.manaSpent).toBe(0);
  });
});
