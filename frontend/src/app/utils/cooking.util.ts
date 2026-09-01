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
 * How well the cooking went, as a percentage change to the whole dish:
 *
 *   5 × (15 − W20) %
 *
 * Lower is better, like every roll in this game: a 1 is +70 %, a 15 is exactly neutral, a 20 is
 * −25 %. The kitchen bonus lowers the die, so a bonus of 3 turns a 15 into a 12 (+15 %).
 */
export const COOKING_NEUTRAL_ROLL = 15;
export const COOKING_PERCENT_PER_POINT = 5;

export interface CookingRoll {
  /** The raw d20. */
  die: number;
  /** The character's kitchen bonus, which lowers the effective die. */
  bonus: number;
  /** Percentage change to the dish, e.g. -25 or +70. */
  percent: number;
  /** The same thing as a factor: 1 + percent / 100. */
  multiplier: number;
}

/** The outcome for a known die, split out so it can be tested without randomness. */
export function cookingOutcome(die: number, bonus: number): CookingRoll {
  const b = Math.floor(bonus) || 0;
  const percent = COOKING_PERCENT_PER_POINT * (COOKING_NEUTRAL_ROLL - die + b);
  // A dish can be ruined but never turned into nothing.
  const multiplier = Math.max(0.05, Math.round((1 + percent / 100) * 100) / 100);
  return { die, bonus: b, percent, multiplier };
}

export function rollCookingQuality(bonus: number, rng: () => number = Math.random): CookingRoll {
  return cookingOutcome(Math.floor(rng() * 20) + 1, bonus);
}

/**
 * Scale everything the dish does by the cooking multiplier — immediate effects and `onRest`
 * alike. How well you cooked changes the whole dish, not just the part that keeps overnight.
 */
export function scaleAllValues(script: string, multiplier: number): string {
  if (!script.trim() || multiplier === 1) return script;
  return mapEffectValues(script, value => scaleAmount(value, multiplier));
}

/** Scale one value, never rounding a real effect away to nothing. */
function scaleAmount(amount: number, multiplier: number): number {
  if (amount === 0) return 0;
  const scaled = Math.round(amount * multiplier);
  if (scaled !== 0) return scaled;
  return amount > 0 ? 1 : -1;
}

// ── Was das Gericht tut ─────────────────────────────────────────────────────

/** The pools a meal can move, in the order they are shown. */
export const MEAL_RESOURCES: { key: string; label: string }[] = [
  { key: 'health', label: 'Leben' },
  { key: 'energy', label: 'Ausdauer' },
  { key: 'mana', label: 'Mana' },
  { key: 'fokus', label: 'Fokus' },
];

export interface MealEffectSummary {
  resources: { key: string; label: string; amount: number }[];
  statuses: { id: string; stacks: number; duration?: number }[];
  messages: string[];
  empty: boolean;
}

/** What one script run adds up to — the readable version of a meal, instead of its code. */
export function summariseEffects(result: {
  resourceChanges: { resource: string; amount: number }[];
  statusOps: { op: 'apply' | 'remove'; id: string; stacks?: number; duration?: number }[];
  displays: { type: string; text?: string; label?: string; value?: string }[];
}): MealEffectSummary {
  const totals = new Map<string, number>();
  for (const change of result.resourceChanges ?? []) {
    totals.set(change.resource, (totals.get(change.resource) ?? 0) + change.amount);
  }

  const resources = MEAL_RESOURCES
    .filter(r => !!totals.get(r.key))
    .map(r => ({ key: r.key, label: r.label, amount: totals.get(r.key)! }));

  const statuses = (result.statusOps ?? [])
    .filter(op => op.op === 'apply')
    .map(op => ({ id: op.id, stacks: op.stacks ?? 1, duration: op.duration }));

  const messages = (result.displays ?? [])
    .map(d => d.text ?? (d.label ? `${d.label}: ${d.value ?? ''}` : ''))
    .filter(Boolean) as string[];

  return {
    resources,
    statuses,
    messages,
    empty: resources.length === 0 && statuses.length === 0 && messages.length === 0,
  };
}
