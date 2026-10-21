import { AMMO_BATCH, ammoStats } from './forge-calc.util';

describe('Munition schmieden', () => {
  it('halves the Effektivität', () => {
    expect(ammoStats(20, 0).efficiency).toBe(10);
    expect(ammoStats(15, 0).efficiency).toBe(8);
  });

  it('weighs a hundredth per piece', () => {
    expect(ammoStats(0, 3).weightPerPiece).toBe(0.03);
    expect(ammoStats(0, 1.25).weightPerPiece).toBe(0.013);
  });

  it('comes in stacks of seven', () => {
    expect(AMMO_BATCH).toBe(7);
  });
});
