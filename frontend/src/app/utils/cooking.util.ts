import { ItemBlock } from '../model/item-block.model';
import { hasRestBlock } from '../scripting/interpreter';

/**
 * Kochen: several ingredients go in the pot, their effects are added up, divided by the portions
 * and scaled by the Kochprobe, and a single new dish comes out.
 *
 * The scaling is done on NUMBERS, never on the ingredients' script text — see `MealEffects`.
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

/**
 * A cooked meal is marked so it can never go back in the pot: cooking a meal again would let one
 * portion be split into ten, so the loop is closed at the ingredient level.
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

  // The same effect from two ingredients (or two of the same ingredient) is one entry with the
  // stacks added up, not the same name listed twice.
  const byId = new Map<string, { id: string; stacks: number; duration?: number }>();
  for (const op of result.statusOps ?? []) {
    if (op.op !== 'apply') continue;
    const seen = byId.get(op.id);
    if (!seen) {
      byId.set(op.id, { id: op.id, stacks: op.stacks ?? 1, duration: op.duration });
      continue;
    }
    seen.stacks += op.stacks ?? 1;
    if (op.duration !== undefined) {
      seen.duration = Math.max(seen.duration ?? 0, op.duration);
    }
  }
  const statuses = [...byId.values()];

  const messages = [...new Set((result.displays ?? [])
    .map(d => d.text ?? (d.label ? `${d.label}: ${d.value ?? ''}` : ''))
    .filter(Boolean) as string[])];

  return {
    resources,
    statuses,
    messages,
    empty: resources.length === 0 && statuses.length === 0 && messages.length === 0,
  };
}

// ── Vom Topf zum Gericht ────────────────────────────────────────────────────

/**
 * A finished dish, as numbers rather than as code.
 *
 * Cooking used to rewrite the ingredients' script text with a regex, which only ever matched
 * literal numbers in exactly the expected shape — so portions and the Kochprobe silently did
 * nothing to anything written even slightly differently. Now the ingredients are RUN once, their
 * effects are added up, those numbers are scaled, and a fresh, plain script is generated from
 * them. What the kitchen promises and what the meal does are the same numbers.
 *
 * The trade: an ingredient's conditional logic (`if (level > 3) { … }`) is resolved at cooking
 * time rather than at eating time. For a merged stew that is the more predictable behaviour.
 */
export interface MealEffects {
  immediate: MealEffectSummary;
  onRest: MealEffectSummary;
}

/** Scale one summary by a factor, never rounding a real effect away to nothing. */
export function scaleSummary(summary: MealEffectSummary, factor: number): MealEffectSummary {
  const scale = (value: number): number => {
    if (!value) return 0;
    const scaled = Math.round(value * factor);
    if (scaled !== 0) return scaled;
    return value > 0 ? 1 : -1;
  };

  const resources = summary.resources
    .map(r => ({ ...r, amount: scale(r.amount) }))
    .filter(r => r.amount !== 0);
  const statuses = summary.statuses.map(fx => ({
    ...fx,
    stacks: Math.max(1, scale(fx.stacks)),
    duration: fx.duration === undefined ? undefined : Math.max(1, scale(fx.duration)),
  }));

  return {
    resources,
    statuses,
    messages: summary.messages,
    empty: resources.length === 0 && statuses.length === 0 && summary.messages.length === 0,
  };
}

/** Turn the computed effects back into a script the meal can carry. */
export function buildMealScript(effects: MealEffects): string {
  const lines = [...effectLines(effects.immediate)];
  const rest = effectLines(effects.onRest);
  if (rest.length) {
    lines.push('onRest {');
    lines.push(...rest.map(line => `  ${line}`));
    lines.push('}');
  }
  return lines.join('\n');
}

function effectLines(summary: MealEffectSummary): string[] {
  const lines: string[] = [];
  for (const res of summary.resources) {
    lines.push(res.amount > 0
      ? `gainResource(${res.key}, ${res.amount})`
      : `loseResource(${res.key}, ${Math.abs(res.amount)})`);
  }
  for (const fx of summary.statuses) {
    lines.push(fx.duration === undefined
      ? `applyStatus(${JSON.stringify(fx.id)}, ${fx.stacks})`
      : `applyStatus(${JSON.stringify(fx.id)}, ${fx.stacks}, ${fx.duration})`);
  }
  for (const msg of summary.messages) lines.push(`display(${JSON.stringify(msg)})`);
  return lines;
}

/**
 * One readable line describing a dish, for the item card — so a cooked meal in the inventory is
 * not an anonymous black box.
 */
export function describeMealEffects(effects: MealEffects, statusName: (id: string) => string): string {
  const part = (summary: MealEffectSummary): string => [
    ...summary.resources.map(r => `${r.amount > 0 ? '+' : ''}${r.amount} ${r.label}`),
    ...summary.statuses.map(fx => statusName(fx.id) + (fx.stacks > 1 ? ` ×${fx.stacks}` : '')),
  ].join(', ');

  const now = part(effects.immediate);
  const later = part(effects.onRest);
  const chunks: string[] = [];
  if (now) chunks.push(`Sofort: ${now}`);
  if (later) chunks.push(`Bei der Rast: ${later}`);
  return chunks.join(' · ');
}
