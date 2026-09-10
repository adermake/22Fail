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

  it('rejects impure calls inside effectActive', () => {
    expect(errs('effectActive { display("x") }').some(m => m.includes('effectActive'))).toBe(true);
    expect(errs('effectActive { loseResource(health, 5) }').some(m => m.includes('effectActive'))).toBe(true);
  });

  it('allows dice inside effectActive (seeded once per effect instance)', () => {
    expect(compileScript('effectActive { if (2d6 > 3) { speed += 1 } }').ok).toBe(true);
    expect(compileScript('effectActive { speed += roll(1, 6) }').ok).toBe(true);
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

  it('reads icon and buff/debuff from giveStatus', () => {
    const s = 'onTrigger("t") { giveStatus("Slow", "d", 2, 3, "🐌", debuff) { } }';
    const g = runScript(s, dummyCtx, { trigger: 't' }).givenStatuses[0];
    expect(g.icon).toBe('🐌');
    expect(g.isDebuff).toBe(true);
    expect(g.stacks).toBe(2);

    const b = runScript('onTrigger("t") { giveStatus("Bless", "d", 1, 1, "✨", buff) { } }', dummyCtx, { trigger: 't' });
    expect(b.givenStatuses[0].isDebuff).toBe(false);
  });

  it('rejects an invalid giveStatus polarity', () => {
    expect(errs('onTrigger("t") { giveStatus("s","d",1,1,"x",nope) { } }').some(m => m.includes('buff'))).toBe(true);
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

describe('seeded dice in effectActive', () => {
  const seeded = (seed?: number): CharacterContext => ({
    ...dummyCtx,
    seed,
  });

  const collectSpeed = (src: string, seed?: number): number => {
    const res = runScript(src, seeded(seed), { collect: true });
    return res.modifiers.find(m => m.target === 'bewegung')?.amount ?? NaN;
  };

  it('rolls once per seed and repeats that roll on every re-evaluation', () => {
    const src = 'effectActive { movement += roll(1, 20) }';
    const first = collectSpeed(src, 12345);
    for (let i = 0; i < 5; i++) expect(collectSpeed(src, 12345)).toBe(first);
    expect(first).toBeGreaterThanOrEqual(1);
    expect(first).toBeLessThanOrEqual(20);
  });

  it('gives different effect instances different rolls', () => {
    const src = 'effectActive { movement += roll(1, 20) }';
    const values = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(seed => collectSpeed(src, seed)));
    expect(values.size).toBeGreaterThan(1);
  });

  it('falls back to the dice average when there is no instance seed', () => {
    expect(collectSpeed('effectActive { movement += roll(2, 6) }')).toBe(7);
  });

  it('keeps several rolls in one block independent but stable', () => {
    const src = 'effectActive { movement += roll(1, 20) armorNegation += roll(1, 20) }';
    const run = () => runScript(src, seeded(999), { collect: true }).modifiers.map(m => m.amount);
    const a = run();
    expect(run()).toEqual(a);
  });
});

// ── Schmiedemerkmale: item targets and per-trait level ───────────────────────

/** A context where `merkmalLevel` reads back a specific trait level. */
function atLevel(level: number): CharacterContext {
  return { ...dummyCtx, readScalar: (name: string) => (name === 'merkmalLevel' ? level : 10) };
}

describe('FailScript item targets', () => {
  it('accepts the four writable item properties inside effectActive', () => {
    const src = 'effectActive { item.effectivity += 1 item.stability += 1 '
      + 'item.armorDebuff += 1 item.weight -= 1 }';
    expect(compileScript(src).ok).toBe(true);
  });

  it('rejects an unknown item property', () => {
    const e = errs('effectActive { item.schaerfe += 1 }');
    expect(e.some(m => m.includes("Unbekannte Gegenstands-Eigenschaft 'schaerfe'"))).toBe(true);
  });

  it('rejects an item assignment outside effectActive (stat leak)', () => {
    expect(errs('item.effectivity += 5').some(m => m.includes('Stat-Leak'))).toBe(true);
  });

  it('still rejects assignment to any other property', () => {
    expect(errs('effectActive { strength.base += 1 }')
      .some(m => m.includes('Zuweisung an Eigenschaften'))).toBe(true);
  });

  it('collects item modifiers separately from wearer modifiers', () => {
    const r = runScript(
      'effectActive { item.effectivity += 3 speed += 2 }', dummyCtx, { collect: true });
    expect(r.itemModifiers).toEqual([{ target: 'effectivity', op: 'add', amount: 3 }]);
    expect(r.modifiers.map(m => m.target)).toEqual(['speed']);
  });

  it('carries the assignment operator through to the item modifier', () => {
    const r = runScript(
      'effectActive { item.weight *= 0.5 }', dummyCtx, { collect: true });
    expect(r.itemModifiers).toEqual([{ target: 'weight', op: 'mul', amount: 0.5 }]);
  });

  it('emits no item modifiers on a non-collect run', () => {
    expect(runScript('effectActive { item.effectivity += 3 }', dummyCtx).itemModifiers).toEqual([]);
  });
});

describe('FailScript item choices', () => {
  it('accepts a valid literal with plain assignment', () => {
    expect(compileScript('effectActive { item.reloadAction = "FREE" }').ok).toBe(true);
  });

  it('rejects arithmetic on a choice', () => {
    const e = errs('effectActive { item.reloadAction += "FREE" }');
    expect(e.some(m => m.includes('ist eine Auswahl'))).toBe(true);
  });

  it('rejects a value outside the allowed set', () => {
    const e = errs('effectActive { item.reloadAction = "SOFORT" }');
    expect(e.some(m => m.includes('erwartet einen dieser Werte'))).toBe(true);
  });

  it('rejects a non-literal value', () => {
    // The checker validates the literal, so a computed value cannot be verified.
    expect(errs('effectActive { item.handed = someVar }').length).toBeGreaterThan(0);
  });

  it('rejects a choice outside effectActive', () => {
    expect(errs('item.reloadAction = "FREE"').some(m => m.includes('Stat-Leak'))).toBe(true);
  });

  it('collects choices apart from numeric modifiers', () => {
    const r = runScript(
      'effectActive { item.reloadAction = "BONUS" item.effectivity += 2 }',
      dummyCtx, { collect: true });
    expect(r.itemChoices).toEqual([{ target: 'reloadAction', value: 'BONUS' }]);
    expect(r.itemModifiers).toEqual([{ target: 'effectivity', op: 'add', amount: 2 }]);
  });

  it('keeps every choice in order so the last can win', () => {
    const r = runScript(
      'effectActive { item.handed = "TWO" item.handed = "ONE" }', dummyCtx, { collect: true });
    expect(r.itemChoices.map(c => c.value)).toEqual(['TWO', 'ONE']);
  });
});

describe('FailScript merkmalLevel', () => {
  const src = 'effectActive { item.effectivity += 2 * merkmalLevel }';

  it('scales with the level of the trait being run', () => {
    const amount = (level: number) =>
      runScript(src, atLevel(level), { collect: true }).itemModifiers[0]!.amount;
    expect(amount(1)).toBe(2);
    expect(amount(3)).toBe(6);
  });

  it('keeps two traits at different levels apart', () => {
    // The reason trait scripts are run separately instead of concatenated: Parry 2 alongside
    // Attackbuff 1 must not collapse into both seeing the same level.
    const parry = runScript('effectActive { item.effectivity += merkmalLevel }', atLevel(2),
      { collect: true }).itemModifiers[0]!.amount;
    const buff = runScript('effectActive { item.stability += merkmalLevel }', atLevel(1),
      { collect: true }).itemModifiers[0]!.amount;
    expect([parry, buff]).toEqual([2, 1]);
  });

  it('is a known symbol, not an undeclared variable', () => {
    expect(compileScript('effectActive { item.effectivity += merkmalLevel }').ok).toBe(true);
  });
});
