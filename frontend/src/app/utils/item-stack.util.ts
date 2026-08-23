import { ItemBlock } from '../model/item-block.model';

/**
 * Stack rules, Minecraft-style: pick a stack up, drop it whole or one at a time, split it in
 * half, and merge two stacks back together when they are genuinely the same thing.
 *
 * "The same thing" cannot mean `id` — every copy of a potion carries its own id — and it cannot
 * mean `name` either, or a +2 sword would merge into a plain one. It means: both are stackable,
 * and every field that describes the item is equal. `identityKey` is that comparison, so the
 * inventory, the shared bag and the server all agree on what merges with what.
 */

/** Fields that say nothing about WHAT an item is, only about this particular pile of it. */
const IDENTITY_IGNORED = new Set(['id', 'amount', 'entryId']);

/** How many units this slot holds. Unstackable items are always exactly one. */
export function stackAmount(item: ItemBlock | null | undefined): number {
  if (!item) return 0;
  if (!item.stackable) return 1;
  return Math.max(1, Math.floor(item.amount ?? 1));
}

/**
 * A stable string identifying an item's kind. Two items merge exactly when their keys match.
 * Undefined/null fields are dropped so `{ lost: undefined }` and a missing `lost` agree.
 */
export function identityKey(item: ItemBlock): string {
  const entries = Object.entries(item as unknown as Record<string, unknown>)
    .filter(([key, value]) => !IDENTITY_IGNORED.has(key) && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

/** Can these two piles become one? */
export function canMerge(a: ItemBlock | null | undefined, b: ItemBlock | null | undefined): boolean {
  if (!a || !b) return false;
  if (!a.stackable || !b.stackable) return false;
  return identityKey(a) === identityKey(b);
}

/**
 * Split a pile in half. The larger half is TAKEN — picking up half of 5 gives 3 and leaves 2,
 * which is what every inventory that does this behaves like.
 */
export function splitHalf(amount: number): { taken: number; left: number } {
  const total = Math.max(0, Math.floor(amount));
  const taken = Math.ceil(total / 2);
  return { taken, left: total - taken };
}

/** A copy of an item carrying a given number of units. */
export function withAmount(item: ItemBlock, amount: number): ItemBlock {
  const copy = { ...item } as ItemBlock;
  if (copy.stackable) copy.amount = Math.max(1, Math.floor(amount));
  else copy.amount = 1;
  return copy;
}

/**
 * Merge `source` into `target`. There is no stack ceiling in this game, so a merge always takes
 * everything; the leftover exists so a future max-stack rule has somewhere to live.
 */
export function mergeStacks(
  target: ItemBlock, source: ItemBlock,
): { merged: ItemBlock; leftover: ItemBlock | null } {
  if (!canMerge(target, source)) return { merged: target, leftover: source };
  return {
    merged: withAmount(target, stackAmount(target) + stackAmount(source)),
    leftover: null,
  };
}

/**
 * Fold every mergeable pile in a slot list into the first slot that holds its kind, leaving the
 * emptied slots as null. Slot positions of the surviving stacks never move.
 */
export function mergeAllStacks(slots: readonly (ItemBlock | null)[]): (ItemBlock | null)[] {
  const out = [...slots];
  const firstOfKind = new Map<string, number>();

  for (let i = 0; i < out.length; i++) {
    const item = out[i];
    if (!item || !item.stackable) continue;
    const key = identityKey(item);
    const target = firstOfKind.get(key);
    if (target === undefined) {
      firstOfKind.set(key, i);
      continue;
    }
    out[target] = withAmount(out[target]!, stackAmount(out[target]) + stackAmount(item));
    out[i] = null;
  }
  return out;
}

/** Take `count` units off a pile. Returns what was taken and what is left (null when emptied). */
export function takeFrom(
  item: ItemBlock, count: number,
): { taken: ItemBlock | null; left: ItemBlock | null } {
  const have = stackAmount(item);
  const wanted = Math.max(0, Math.floor(count));
  if (wanted <= 0) return { taken: null, left: item };
  if (wanted >= have) return { taken: withAmount(item, have), left: null };
  return { taken: withAmount(item, wanted), left: withAmount(item, have - wanted) };
}
