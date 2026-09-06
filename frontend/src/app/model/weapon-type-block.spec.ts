import { describe, expect, it } from 'vitest';
import {
  builtinWeaponTypes,
  mergeWeaponTypes,
  normalizeWeaponType,
  primaryDamageType,
  toggleDamageType,
  type WeaponTypeBlock,
} from './weapon-type-block.model';

const make = (over: Partial<WeaponTypeBlock> = {}): WeaponTypeBlock => ({
  id: 'wt', name: 'Speer', category: 'SCHWER', damageTypes: ['Stich'], damageType: 'Stich',
  meleeRange: 3, rangedRange: 0, weight: 'MITTEL', handed: 'TWO', reloadAction: 'FREE',
  extraEffect: '', ...over,
});

describe('the offered Waffentypen', () => {
  it('falls back to the built-ins while no library defines any', () => {
    const list = mergeWeaponTypes([]);
    expect(list.length).toBe(builtinWeaponTypes().length);
    expect(list.some((w) => w.name === 'Langschwert')).toBe(true);
  });

  it('is ONLY the library types once a library defines some', () => {
    const list = mergeWeaponTypes([make({ name: 'Speer' }), make({ id: 'w2', name: 'Axt' })]);
    expect(list.map((w) => w.name)).toEqual(['Axt', 'Speer']); // sorted, and nothing else
    expect(list.some((w) => w.builtin)).toBe(false);
  });
});

describe('normalising stored weapon types', () => {
  it('repairs entries that predate category, damageTypes and reloadAction', () => {
    const legacy = {
      id: 'old', name: 'Dolch', damageType: 'Stich', meleeRange: 0.5, rangedRange: 0,
      weight: 'LEICHT', handed: 'ONE', extraEffect: '',
    } as unknown as WeaponTypeBlock;

    const fixed = normalizeWeaponType(legacy);
    expect(fixed.category).toBe('LEICHT');
    expect(fixed.damageTypes).toEqual(['Stich']);
    expect(fixed.reloadAction).toBe('FREE'); // no reload cost is what they always had
  });

  it('derives FERNKAMPF for a legacy entry that only has a ranged reach', () => {
    const bow = { name: 'Bogen', meleeRange: 0, rangedRange: 50, weight: 'LEICHT',
                  handed: 'TWO', damageType: 'Stich', extraEffect: '' } as unknown as WeaponTypeBlock;
    expect(normalizeWeaponType(bow).category).toBe('FERNKAMPF');
  });

  it('keeps the damage list in canonical order and never empties it', () => {
    const w = make({ damageTypes: ['Wucht', 'Schnitt'] });
    expect(normalizeWeaponType(w).damageTypes).toEqual(['Schnitt', 'Wucht']);

    // The last damage type cannot be removed — a weapon has to hurt somehow.
    const one = make({ damageTypes: ['Schnitt'] });
    toggleDamageType(one, 'Schnitt');
    expect(one.damageTypes).toEqual(['Schnitt']);

    toggleDamageType(one, 'Stich');
    expect(one.damageTypes).toEqual(['Schnitt', 'Stich']);
    expect(primaryDamageType(one)).toBe('Schnitt');
    expect(one.damageType).toBe('Schnitt'); // legacy scalar stays in sync
  });
});
