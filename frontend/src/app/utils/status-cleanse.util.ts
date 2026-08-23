/**
 * `removeStatus(id)` wipes an effect outright. `removeStatus(id, X)` cleanses only part of it:
 *
 *  - a stacked effect loses X stacks (gone once nothing is left),
 *  - an unstacked effect loses X turns of duration instead — the same "partial cleanse" idea
 *    for effects that measure their strength in time rather than in stacks.
 *
 * One helper so the sheet and the lobby cleanse identically.
 */
export interface CleansableEffect {
  stacks?: number;
  duration?: number;
}

/**
 * Apply a cleanse to one effect instance.
 * Returns the reduced effect, or `null` when nothing of it remains (the caller drops it).
 */
export function cleanseEffect<T extends CleansableEffect>(effect: T, amount?: number): T | null {
  const by = Math.floor(amount ?? 0);
  if (by <= 0) return null; // removeStatus(id) — the whole thing goes

  const stacks = Math.max(1, Math.floor(effect.stacks ?? 1));
  if (stacks > 1) {
    const left = stacks - by;
    return left > 0 ? { ...effect, stacks: left } : null;
  }

  // Single stack: cleanse duration instead. An effect with no duration has nothing to whittle
  // down, so a partial cleanse removes it — otherwise it could never be cleansed at all.
  if (effect.duration === undefined || effect.duration === null) return null;
  const left = Math.floor(effect.duration) - by;
  return left > 0 ? { ...effect, duration: left } : null;
}

/**
 * Cleanse the FIRST matching instance in a list. Returns a new list and whether anything changed.
 */
export function cleanseFromList<T extends CleansableEffect>(
  list: readonly T[],
  matches: (effect: T) => boolean,
  amount?: number,
): { list: T[]; changed: boolean } {
  const index = list.findIndex(matches);
  if (index < 0) return { list: [...list], changed: false };

  const reduced = cleanseEffect(list[index], amount);
  const next = [...list];
  if (reduced) next[index] = reduced;
  else next.splice(index, 1);
  return { list: next, changed: true };
}
