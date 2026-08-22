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

/**
 * A deterministic RNG for `effectActive` blocks. Those re-run on every stat read, so plain
 * randomness would make a stat flicker on every recompute. Seeding once per effect INSTANCE
 * gives an effect that rolls exactly once — when it is applied — and then keeps that result for
 * as long as the effect lasts. That is what a "scramble my stats" effect needs.
 *
 * mulberry32: small, fast, good enough for dice.
 */
export function seededRng(seed: number): () => number {
  let a = (Math.floor(seed) || 1) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash — turns an effect's identity (id + applied-at) into a seed. */
export function hashSeed(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
