import { CharacterSheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import {
  STAMINA_PER_HOUR_ON_FOOT,
  TRAVEL_TIERS,
  currentStamina,
  staminaDrainPatch,
  staminaStatusIndex,
} from './travel.util';

/** A sheet with life first and Ausdauer second, so the index is not simply 0. */
function sheet(stamina: number | null): CharacterSheet {
  const statuses: unknown[] = [{ formulaType: FormulaType.LIFE, statusCurrent: 30 }];
  if (stamina !== null) statuses.push({ formulaType: FormulaType.ENERGY, statusCurrent: stamina });
  return { statuses } as unknown as CharacterSheet;
}

describe('Reiseregeln', () => {
  it('kennt fünf Stufen, langsamste zuletzt', () => {
    expect(TRAVEL_TIERS.map(t => t.hours)).toEqual([1, 2, 3, 5, 8]);
    expect(TRAVEL_TIERS.map(t => t.level)).toEqual([1, 2, 3, 4, 5]);
  });

  it('kostet zu Fuß 2 Ausdauer pro Stunde', () => {
    expect(STAMINA_PER_HOUR_ON_FOOT).toBe(2);
  });
});

describe('Ausdauer abziehen', () => {
  it('findet die Ausdauer, auch wenn sie nicht an erster Stelle steht', () => {
    expect(staminaStatusIndex(sheet(12))).toBe(1);
    expect(currentStamina(sheet(12))).toBe(12);
  });

  it('erzeugt einen Patch auf genau diesen Status', () => {
    expect(staminaDrainPatch(sheet(12), 2)).toEqual({ path: 'statuses.1.statusCurrent', value: 10 });
  });

  it('geht unter null, wie der Charakterbogen auch', () => {
    // The sheet's own "use resource" does not clamp, and some abilities depend on that; a
    // travel drain that stopped at zero would disagree with the sheet about the same number.
    expect(staminaDrainPatch(sheet(1), 4)?.value).toBe(-3);
  });

  it('tut nichts ohne Ausdauer auf dem Bogen', () => {
    expect(staminaDrainPatch(sheet(null), 2)).toBeNull();
    expect(currentStamina(sheet(null))).toBe(0);
  });

  it('tut nichts bei null oder negativem Betrag', () => {
    // A negative "drain" would quietly *restore* Ausdauer from a button labelled subtract.
    expect(staminaDrainPatch(sheet(12), 0)).toBeNull();
    expect(staminaDrainPatch(sheet(12), -5)).toBeNull();
    expect(staminaDrainPatch(sheet(12), Number.NaN)).toBeNull();
  });
});
