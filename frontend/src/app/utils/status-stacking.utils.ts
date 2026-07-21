/**
 * Shared stacking rule for status effects, used by every path that applies one — the manual
 * picker (sheet + lobby), `applyStatus(...)` from a script, and `giveStatus(...)`.
 *
 * The rule: two instances merge only when they are the SAME effect AND have the SAME remaining
 * duration. Then their stacks add (capped at maxStacks). Instances with different durations stay
 * separate, so a 3-round application does not silently inherit a 1-round timer (or vice versa).
 *
 * Written against a minimal shape so it serves both `ActiveStatusEffect` (sheet/character) and
 * `TokenStatusEffect` (lobby token).
 */
export interface StackableEffect {
  statusEffectId?: string;
  duration?: number;
  stacks: number;
}

/**
 * Add `incoming` to `list`, merging per the stacking rule. Returns a new array; `changed` is
 * false when the application had no effect (e.g. already at the stack cap).
 *
 * Two behaviours, chosen by whether the effect is stackable (maxStacks > 1):
 *
 *  - **Stackable:** merges only with an instance that has the SAME remaining duration. Stacks
 *    add (capped); the duration is left alone. A different duration becomes its own tile, so a
 *    fresh 3-round application never inherits a 1-round timer.
 *
 *  - **Non-stackable:** re-applying cannot add a stack, so it EXTENDS the existing instance's
 *    duration instead (durations add). Matching ignores duration — there is only ever one tile.
 *    A permanent instance (no duration) stays permanent.
 */
export function applyStacking<T extends StackableEffect>(
  list: T[],
  incoming: T,
  maxStacks = 1,
): { list: T[]; changed: boolean; merged: boolean } {
  const cap = Math.max(1, maxStacks || 1);

  if (cap <= 1) {
    // ── Non-stackable: extend the timer of the single existing instance ──
    const idx = list.findIndex(e => e.statusEffectId === incoming.statusEffectId);
    if (idx < 0) {
      return { list: [...list, { ...incoming, stacks: 1 }], changed: true, merged: false };
    }
    const existing = list[idx];
    // Permanent on either side means "already unlimited" — nothing to extend.
    if (existing.duration == null || incoming.duration == null) {
      return { list, changed: false, merged: true };
    }
    const out = [...list];
    out[idx] = { ...existing, duration: existing.duration + incoming.duration };
    return { list: out, changed: true, merged: true };
  }

  // ── Stackable: same effect AND same duration merge; stacks add, duration untouched ──
  const idx = list.findIndex(
    e => e.statusEffectId === incoming.statusEffectId && (e.duration ?? null) === (incoming.duration ?? null),
  );

  if (idx < 0) {
    return {
      list: [...list, { ...incoming, stacks: Math.min(Math.max(1, incoming.stacks || 1), cap) }],
      changed: true,
      merged: false,
    };
  }

  const existing = list[idx];
  const current = existing.stacks || 1;
  const total = Math.min(current + Math.max(1, incoming.stacks || 1), cap);
  if (total === current) return { list, changed: false, merged: true }; // already capped

  const out = [...list];
  out[idx] = { ...existing, stacks: total };
  return { list: out, changed: true, merged: true };
}
