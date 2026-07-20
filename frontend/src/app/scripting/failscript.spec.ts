import { compileScript } from './checker';
import { rollDice } from './dice';
import { CharacterContext, listTriggers, runScript } from './interpreter';

function errs(src: string): string[] {
  return compileScript(src).diagnostics.filter(d => d.severity === 'error').map(d => d.message);
}

const dummyCtx: CharacterContext = {
  readScalar: () => 10,
  readAttributeMember: () => 0,
  readTalent: () => 0,
  hasSkill: () => false,
  inCombat: () => true,
  rng: () => 0.5,
};

describe('FailScript checker', () => {
  it('rejects a top-level stat assignment (stat leak)', () => {
    const e = errs('speed = speed + 5');
    expect(e.some(m => m.includes('Stat-Leak'))).toBe(true);
  });

  it('allows a stat assignment inside effectActive', () => {
    expect(compileScript('effectActive { speed += 5 }').ok).toBe(true);
  });

  it('accepts all assignment ops inside effectActive', () => {
    expect(compileScript('effectActive { speed += 2 speed *= 2 speed -= 1 speed /= 2 speed = 0 }').ok).toBe(true);
  });

  it('keeps untilNextTurn as an alias for effectActive', () => {
    expect(compileScript('untilNextTurn { speed += 5 }').ok).toBe(true);
  });

  it('rejects grantSkill outside effectActive (skill leak)', () => {
    expect(errs('grantSkill("X", 0, 0, 0) { }').some(m => m.includes('Skill-Leak'))).toBe(true);
  });

  it('rejects impure calls and dice inside effectActive', () => {
    expect(errs('effectActive { display("x") }').some(m => m.includes('effectActive'))).toBe(true);
    expect(errs('effectActive { loseResource(health, 5) }').some(m => m.includes('effectActive'))).toBe(true);
    expect(errs('effectActive { if (2d6 > 3) { speed += 1 } }').some(m => m.includes('effectActive'))).toBe(true);
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

  it('parses and checks grantSkill with description, action type and an action body', () => {
    expect(compileScript(
      'effectActive { grantSkill("Teleport", "Kurzer Sprung", Aktion, 5, 0, 0) { loseResource(mana, 5) display("Teleported") } }',
    ).ok).toBe(true);
  });

  it('rejects an invalid grantSkill action type', () => {
    expect(errs('effectActive { grantSkill("X", "d", Foo, 0, 0, 0) { } }').some(m => m.includes('Aktionstyp'))).toBe(true);
  });
});

describe('FailScript execution modes', () => {
  it('collect run yields ordered modifiers with ops, no side effects', () => {
    const r = runScript('effectActive { speed += 2 speed *= 3 } display("hi")', dummyCtx, { collect: true });
    expect(r.ok).toBe(true);
    expect(r.modifiers.map(m => `${m.target}:${m.op}:${m.amount}`)).toEqual(['speed:add:2', 'speed:mul:3']);
    expect(r.displays.length).toBe(0);         // side effects suppressed during collect
  });

  it('trigger run applies side effects but no effectActive modifiers', () => {
    const r = runScript('effectActive { speed += 2 } loseResource(health, 5)', dummyCtx);
    expect(r.ok).toBe(true);
    expect(r.modifiers.length).toBe(0);        // effectActive skipped on trigger
    expect(r.resourceChanges).toEqual([{ resource: 'health', amount: -5 }]);
  });

  it('derives granted skills only during collect, with description + action type', () => {
    const src = 'effectActive { grantSkill("Fireball", "Feuerball", Bonusaktion, 3, 0, 0) { display("boom") } }';
    expect(runScript(src, dummyCtx).grantedSkills.length).toBe(0);
    const g = runScript(src, dummyCtx, { collect: true }).grantedSkills;
    expect(g.length).toBe(1);
    expect(g[0].name).toBe('Fireball');
    expect(g[0].description).toBe('Feuerball');
    expect(g[0].actionType).toBe('Bonusaktion');
    expect(g[0].manaCost).toBe(3);
  });
});

describe('FailScript onTrigger / giveStatus', () => {
  const src =
    'loseResource(health, 1)\n' +
    'onTrigger("Frost") { loseResource(health, 5) giveStatus("Slow", "verlangsamt", 1, 2) { effectActive { speed /= 2 } } }';

  it('rejects nested onTrigger and stat-leak in a trigger body', () => {
    expect(errs('if (level > 1) { onTrigger("x") { } }').some(m => m.includes('oberster Ebene'))).toBe(true);
    expect(errs('onTrigger("x") { speed += 2 }').some(m => m.includes('Stat-Leak'))).toBe(true);
  });

  it('lists triggers and runs only the base on a normal run', () => {
    expect(listTriggers(src).map(t => t.name)).toEqual(['Frost']);
    const base = runScript(src, dummyCtx);
    expect(base.resourceChanges).toEqual([{ resource: 'health', amount: -1 }]);
    expect(base.givenStatuses.length).toBe(0);
  });

  it('runs only the named trigger body and yields the given status', () => {
    const t = runScript(src, dummyCtx, { trigger: 'Frost' });
    expect(t.resourceChanges).toEqual([{ resource: 'health', amount: -5 }]);
    expect(t.givenStatuses.length).toBe(1);
    expect(t.givenStatuses[0].name).toBe('Slow');
    expect(t.givenStatuses[0].duration).toBe(2);
    expect(t.givenStatuses[0].script).toContain('effectActive');
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
