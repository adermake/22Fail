import { ItemBlock } from '../model/item-block.model';

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

  // gainResource(health, 20) / loseResource(mana, 5) → scale the second argument
  let out = script.replace(
    /\b(gainResource|loseResource)\s*\(\s*([A-Za-z_]\w*)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g,
    (_m, fn: string, res: string, amount: string) =>
      `${fn}(${res}, ${splitAmount(Number(amount), count)})`,
  );

  // applyStatus("id", stacks) and applyStatus("id", stacks, duration) → scale both numbers
  out = out.replace(
    /\bapplyStatus\s*\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*)?\)/g,
    (_m, id: string, stacks: string, duration?: string) => {
      const s = splitAmount(Number(stacks), count);
      if (duration === undefined) return `applyStatus(${id}, ${s})`;
      return `applyStatus(${id}, ${s}, ${splitAmount(Number(duration), count)})`;
    },
  );

  return out;
}
