import { ItemBlock } from '../model/item-block.model';
import { hasRestBlock } from '../scripting/interpreter';

/**
 * Kochen merges the action code of several consumables into one meal and splits it across the
 * portions. Since a consumable's effect IS its script, merging is concatenation and "dividing"
 * means scaling the numeric argument of every effect call.
 *
 * Only the well-known effect calls are scaled — `gainResource`, `loseResource` and the stack/
 * duration arguments of `applyStatus`. Anything else (conditions, display text, giveStatus bodies)
 * is copied through untouched: a cook can divide a portion, not rewrite an author's logic.
 */

/** Concatenate the scripts of everything in the pot, keeping each source recognisable. */
export function mergeConsumableScripts(items: readonly ItemBlock[]): string {
  return items
    .map(item => {
      const src = (item.script ?? '').trim();
      return src ? `// ${item.name}\n${src}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

/** Split a value across portions: always at least 1 when the original was positive. */
export function splitAmount(amount: number, portions: number): number {
  const per = amount / Math.max(1, portions);
  if (amount === 0) return 0;
  const rounded = Math.trunc(per);
  if (rounded !== 0) return rounded;
  return amount > 0 ? 1 : -1; // never divide an effect out of existence entirely
}

/**
 * Scale every effect amount in a script by 1/portions. Comments and unknown calls pass through.
 */
export function dividePortions(script: string, portions: number): string {
  const count = Math.max(1, Math.floor(portions) || 1);
  if (!script.trim() || count === 1) return script;
  return mapEffectValues(script, value => splitAmount(value, count));
}

/**
 * Rewrite every effect amount in a script through `map`. One place that knows which calls carry
 * numbers worth scaling, shared by the portion split and the cooking-quality multiplier.
 */
function mapEffectValues(script: string, map: (value: number) => number): string {
  // gainResource(health, 20) / loseResource(mana, 5) → the second argument
  let out = script.replace(
    /\b(gainResource|loseResource)\s*\(\s*([A-Za-z_]\w*)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g,
    (_m, fn: string, res: string, amount: string) => `${fn}(${res}, ${map(Number(amount))})`,
  );

  // applyStatus("id", stacks) and applyStatus("id", stacks, duration) → both numbers
  out = out.replace(
    /\bapplyStatus\s*\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*)?\)/g,
    (_m, id: string, stacks: string, duration?: string) => {
      const s = map(Number(stacks));
      if (duration === undefined) return `applyStatus(${id}, ${s})`;
      return `applyStatus(${id}, ${s}, ${map(Number(duration))})`;
    },
  );

  return out;
}

/**
 * A cooked meal is marked so it can never go back in the pot. Cooking merges and DIVIDES
 * effects; cooking a meal again would let a stack of one portion be split into ten, so the loop
 * has to be closed at the ingredient level.
 */
export const COOKED_MARK = 'cooked';

export function isCookedMeal(item: ItemBlock | null | undefined): boolean {
  return !!item && (item as { origin?: string }).origin === COOKED_MARK;
}

/** The item kinds that belong in a pot. An amulet has an `onRest` too — it is not food. */
const EDIBLE_TYPES: ReadonlyArray<ItemBlock['itemType']> = ['consumable', 'potion', 'cooking-ingredient'];

/**
 * What may go in the pot: food whose effect outlasts the meal, i.e. it has an `onRest { … }`
 * block. An instant potion has nothing left to carry into a stew; a meal that came out of the pot
 * is barred outright; and equipment is barred by kind however many scripts it carries.
 */
export function isCookable(item: ItemBlock | null | undefined): boolean {
  if (!item || item.lost || isCookedMeal(item)) return false;
  if (!EDIBLE_TYPES.includes(item.itemType)) return false;
  try {
    return hasRestBlock(item.script ?? '');
  } catch {
    return false;
  }
}

// ── Kochprobe ───────────────────────────────────────────────────────────────

/**
 * How well the cooking went: `(1d20 + 5 + bonus) / 10`, applied as a multiplier to everything the
 * meal restores. A bad roll still leaves a meal worth eating (0.6× at worst without a bonus), a
 * great one is worth planning around (2.5×).
 */
export const COOKING_ROLL_BASE = 5;
export const COOKING_ROLL_DIVISOR = 10;

export interface CookingRoll {
  /** The raw d20. */
  die: number;
  /** The character's own kitchen bonus. */
  bonus: number;
  /** (die + 5 + bonus) / 10, rounded to two decimals. */
  multiplier: number;
}

export function rollCookingQuality(bonus: number, rng: () => number = Math.random): CookingRoll {
  const die = Math.floor(rng() * 20) + 1;
  return { die, bonus: Math.floor(bonus) || 0, ...cookingMultiplier(die, bonus) };
}

/** The multiplier for a known die result — split out so it can be tested without randomness. */
export function cookingMultiplier(die: number, bonus: number): { multiplier: number } {
  const raw = (die + COOKING_ROLL_BASE + (Math.floor(bonus) || 0)) / COOKING_ROLL_DIVISOR;
  return { multiplier: Math.max(0.1, Math.round(raw * 100) / 100) };
}

/**
 * Scale everything an `onRest { … }` block restores by the cooking multiplier. Only the rest
 * block is touched: an instant effect is not "how well you cooked", it is what the ingredient
 * already was.
 */
export function scaleRestValues(script: string, multiplier: number): string {
  if (!script.trim() || multiplier === 1) return script;
  return replaceRestBlocks(script, body =>
    mapEffectValues(body, value => scaleAmount(value, multiplier)));
}

/** Scale one value, never rounding a real effect away to nothing. */
function scaleAmount(amount: number, multiplier: number): number {
  if (amount === 0) return 0;
  const scaled = Math.round(amount * multiplier);
  if (scaled !== 0) return scaled;
  return amount > 0 ? 1 : -1;
}

/** Run `transform` over the body of every `onRest { … }` block, leaving the rest of the script. */
function replaceRestBlocks(script: string, transform: (body: string) => string): string {
  let out = '';
  let index = 0;

  for (;;) {
    const start = script.indexOf('onRest', index);
    if (start < 0) { out += script.slice(index); return out; }

    const open = script.indexOf('{', start);
    if (open < 0) { out += script.slice(index); return out; }

    // Walk to the matching brace so a nested block inside onRest is included.
    let depth = 0;
    let end = -1;
    for (let i = open; i < script.length; i++) {
      if (script[i] === '{') depth++;
      else if (script[i] === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end < 0) { out += script.slice(index); return out; }

    out += script.slice(index, open + 1);
    out += transform(script.slice(open + 1, end));
    out += '}';
    index = end + 1;
  }
}
