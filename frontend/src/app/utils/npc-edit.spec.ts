import { describe, expect, it } from 'vitest';
import { createEmptyNpcBody, createEmptyNpcStatblock } from '../model/npc-statblock.model';
import { NPC_BASE_POOL } from './npc-sheet.util';
import { NpcDerivedCalc } from './npc-roll.util';
import { applyNpcEdit } from './npc-edit.util';

const calc: NpcDerivedCalc = {
  calcReaktionswert: () => 0,
  calcGrundbonus: () => 0,
  calcFokus: (intelligence) => intelligence,
  npcResourceMax: (sb) => ({
    life: NPC_BASE_POOL + (sb.constitution ?? 0) * 5,
    energy: NPC_BASE_POOL + (sb.dexterity ?? 0) * 5,
    mana: NPC_BASE_POOL + (sb.intelligence ?? 0) * 5,
  }),
};
const noGear = { weapon: 0, armor: 0 };

describe('applyNpcEdit', () => {
  it('writes a base stat through the soul and recomputes the pools', () => {
    const sb = createEmptyNpcStatblock();
    applyNpcEdit(sb, { stat: { key: 'constitution', value: 14 } }, calc, noGear);
    expect(sb.soul!.stats.constitution).toBe(14);
    expect(sb.constitution).toBe(14);
    expect(sb.maxHealth).toBe(NPC_BASE_POOL + 14 * 5);
  });

  it('takes a body addition back off, so the shown value is what was typed', () => {
    const sb = createEmptyNpcStatblock();
    sb.body!.mods = [{ stat: 'strength', value: 4, mode: 'add' }];
    applyNpcEdit(sb, { stat: { key: 'strength', value: 12 } }, calc, noGear);
    expect(sb.soul!.stats.strength).toBe(8);
    expect(sb.strength).toBe(12);
  });

  it('edits an override mod instead of the soul', () => {
    const sb = createEmptyNpcStatblock();
    sb.body!.mods = [{ stat: 'speed', value: 20, mode: 'override' }];
    applyNpcEdit(sb, { stat: { key: 'speed', value: 25 } }, calc, noGear);
    expect(sb.body!.mods[0]!.value).toBe(25);
    expect(sb.speed).toBe(25);
  });

  it('sets innate Effektivität directly, geared as a bonus over the weapon', () => {
    const innate = createEmptyNpcStatblock();
    applyNpcEdit(innate, { effizienz: 17 }, calc, noGear);
    expect(innate.body!.effizienz).toBe(17);

    const geared = createEmptyNpcStatblock();
    geared.body = { ...createEmptyNpcBody(), useWeaponEffizienz: true, useArmorStabilitaet: true };
    applyNpcEdit(geared, { effizienz: 17, stabilitaet: 3 }, calc, { weapon: 12, armor: 5 });
    expect(geared.body.effizienzBonus).toBe(5);
    expect(geared.body.stabilitaetBonus).toBe(-2);
  });

  it('merges adjustments and drops zeroes', () => {
    const sb = createEmptyNpcStatblock();
    sb.adjust = { reaktion: -2 };
    applyNpcEdit(sb, { adjust: { bewegung: 3 } }, calc, noGear);
    expect(sb.adjust).toEqual({ reaktion: -2, bewegung: 3 });
    applyNpcEdit(sb, { adjust: { reaktion: 0, bewegung: 0 } }, calc, noGear);
    expect(sb.adjust).toBeUndefined();
  });

  it('ignores an empty name', () => {
    const sb = createEmptyNpcStatblock();
    applyNpcEdit(sb, { name: '  ' }, calc, noGear);
    expect(sb.name).toBe('Neues NSC');
  });
});
