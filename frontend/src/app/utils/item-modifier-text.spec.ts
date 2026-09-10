import { describe, expect, it } from 'vitest';
import { describeItemModifiers, formatItemModifier } from './item-modifier-text.util';

describe('formatItemModifier', () => {
  it('writes an addition with a sign', () => {
    expect(formatItemModifier({ target: 'effectivity', op: 'add', amount: 5 }))
      .toBe('Effektivität +5');
  });

  it('writes a negative addition as a minus rather than "+-5"', () => {
    expect(formatItemModifier({ target: 'armorDebuff', op: 'add', amount: -2 }))
      .toBe('Rüstungsmalus −2');
  });

  it('writes the other operators', () => {
    expect(formatItemModifier({ target: 'weight', op: 'mul', amount: 0.5 })).toBe('Gewicht ×0.5');
    expect(formatItemModifier({ target: 'weight', op: 'div', amount: 2 })).toBe('Gewicht ÷2');
    expect(formatItemModifier({ target: 'stability', op: 'sub', amount: 3 })).toBe('Stabilität −3');
    expect(formatItemModifier({ target: 'stability', op: 'set', amount: 7 })).toBe('Stabilität = 7');
  });

  it('rounds float artefacts away', () => {
    expect(formatItemModifier({ target: 'weight', op: 'add', amount: 0.1 + 0.2 }))
      .toBe('Gewicht +0.3');
  });
});

describe('describeItemModifiers', () => {
  it('groups several changes under the Merkmal that made them', () => {
    expect(describeItemModifiers([
      { target: 'weight', op: 'mul', amount: 2, source: 'Bleifuß' },
      { target: 'armorDebuff', op: 'add', amount: 1, source: 'Bleifuß' },
    ])).toEqual(['Bleifuß: Gewicht ×2, Rüstungsmalus +1']);
  });

  it('keeps different Merkmale on their own lines', () => {
    expect(describeItemModifiers([
      { target: 'effectivity', op: 'add', amount: 5, source: 'Schärfe' },
      { target: 'stability', op: 'add', amount: 2, source: 'Härtung' },
    ])).toEqual(['Schärfe: Effektivität +5', 'Härtung: Stabilität +2']);
  });

  it('omits the prefix when there is no source', () => {
    expect(describeItemModifiers([{ target: 'effectivity', op: 'add', amount: 5 }]))
      .toEqual(['Effektivität +5']);
  });

  it('says nothing when nothing is in force', () => {
    expect(describeItemModifiers([])).toEqual([]);
  });

  it('renders a categorical change with its label', () => {
    expect(describeItemModifiers([], [
      { target: 'reloadAction', value: 'FREE', source: 'Schnellspanner' },
    ])).toEqual(['Schnellspanner: Nachladen → Umsonst']);
  });

  it('lists only the choice that actually won', () => {
    // Last writer wins, so showing the overridden one would describe an effect not in force.
    expect(describeItemModifiers([], [
      { target: 'handed', value: 'TWO', source: 'Wuchtgriff' },
      { target: 'handed', value: 'ONE', source: 'Balance' },
    ])).toEqual(['Balance: Führung → Einhändig']);
  });

  it('puts numbers and choices from one Merkmal on the same line', () => {
    expect(describeItemModifiers(
      [{ target: 'effectivity', op: 'add', amount: 3, source: 'Umbau' }],
      [{ target: 'handed', value: 'TWO', source: 'Umbau' }],
    )).toEqual(['Umbau: Effektivität +3, Führung → Zweihändig']);
  });
});
