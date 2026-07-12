import { compileScript } from './checker';
import { rollDice } from './dice';

function errs(src: string): string[] {
  return compileScript(src).diagnostics.filter(d => d.severity === 'error').map(d => d.message);
}

describe('FailScript checker', () => {
  it('rejects a top-level stat assignment (stat leak)', () => {
    const e = errs('speed = speed + 5');
    expect(e.some(m => m.includes('Stat-Leak'))).toBe(true);
  });

  it('allows a stat assignment inside untilNextTurn', () => {
    expect(compileScript('untilNextTurn { speed += 5 }').ok).toBe(true);
  });

  it('rejects assigning a read-only resource', () => {
    expect(errs('health = 5').some(m => m.includes('schreibgeschützt'))).toBe(true);
  });

  it('allows local variables', () => {
    expect(compileScript('var x = 5 x = x + 1 display("hi")').ok).toBe(true);
  });

  it('accepts the headline example', () => {
    expect(compileScript(
      'if (movement < roll(2d8) && intelligence > level) { display("Failed Speed Check") }',
    ).ok).toBe(true);
  });

  it('validates the resource selector of loseResource', () => {
    expect(compileScript('loseResource(health, 5)').ok).toBe(true);
    expect(errs('loseResource(foo, 5)').some(m => m.includes('Ressource'))).toBe(true);
  });

  it('flags unknown symbols, functions and talents', () => {
    expect(errs('display(foo)').some(m => m.includes('Unbekanntes Symbol'))).toBe(true);
    expect(errs('nope(1)').some(m => m.includes('Unbekannte Funktion'))).toBe(true);
    expect(errs('display(talent.nope)').some(m => m.includes('Talent'))).toBe(true);
  });

  it('parses and checks grantSkill with an action body', () => {
    expect(compileScript(
      'untilNextTurn { grantSkill("Teleport", 5, 0, 0) { loseResource(mana, 5) display("Teleported") } }',
    ).ok).toBe(true);
  });
});

describe('FailScript dice', () => {
  it('rolls the right count and sums', () => {
    const r = rollDice(3, 6, () => 0.5);
    expect(r.rolls.length).toBe(3);
    expect(r.total).toBe(12);
    expect(r.formula).toBe('3d6');
  });

  it('clamps invalid input', () => {
    expect(rollDice(-2, 6).rolls.length).toBe(0);
    expect(rollDice(1, 0).total).toBe(1); // sides clamped to >=1
  });
});
