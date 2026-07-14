/**
 * The single shared dice roller for FailScript (and, over time, the replacement for the
 * five ad-hoc dice parsers elsewhere in the app). Each roll is recorded so the lobby
 * summary/breakdown UI can show individual dice.
 */

export interface DiceRoll {
  count: number;
  sides: number;
  rolls: number[];
  total: number;
  /** e.g. "2d8" */
  formula: string;
}

/** Roll `count` dice of `sides` each. Clamped to sane bounds; invalid inputs roll nothing. */
export function rollDice(count: number, sides: number, rng: () => number = Math.random): DiceRoll {
  const c = Math.max(0, Math.min(1000, Math.floor(count)));
  const s = Math.max(1, Math.min(1000, Math.floor(sides)));
  const rolls: number[] = [];
  let total = 0;
  for (let k = 0; k < c; k++) {
    const r = Math.floor(rng() * s) + 1;
    rolls.push(r);
    total += r;
  }
  return { count: c, sides: s, rolls, total, formula: `${c}d${s}` };
}
