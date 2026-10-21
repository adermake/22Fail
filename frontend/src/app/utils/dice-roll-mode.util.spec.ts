import { chooseRollSet, rollSetCount } from './dice-roll-mode.util';

describe('Vorteil / Nachteil', () => {
  it('rolls one, two or three sets', () => {
    expect(rollSetCount('normal')).toBe(1);
    expect(rollSetCount('vorteil')).toBe(2);
    expect(rollSetCount('nachteil')).toBe(2);
    expect(rollSetCount('vorteil+')).toBe(3);
    expect(rollSetCount('nachteil+')).toBe(3);
  });

  it('Vorteil keeps the lowest total — lower is better', () => {
    expect(chooseRollSet([12, 5], 'vorteil')).toBe(1);
    expect(chooseRollSet([9, 14, 3], 'vorteil+')).toBe(2);
  });

  it('Nachteil keeps the highest total', () => {
    expect(chooseRollSet([12, 5], 'nachteil')).toBe(0);
    expect(chooseRollSet([9, 14, 3], 'nachteil+')).toBe(1);
  });

  it('ties go to the first set', () => {
    expect(chooseRollSet([7, 7], 'vorteil')).toBe(0);
    expect(chooseRollSet([7, 7, 7], 'nachteil+')).toBe(0);
  });
});
