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

/** Same effect and same remaining duration → the two instances may merge. */
function sameBucket(a: StackableEffect, b: StackableEffect): boolean {
  return a.statusEffectId === b.statusEffectId && (a.duration ?? null) === (b.duration ?? null);
}

/**
 * Add `incoming` to `list`, merging into a matching instance when the stacking rule allows.
 * Returns a new array; `changed` is false when the effect was already at its stack cap.
 */
export function applyStacking<T extends StackableEffect>(
  list: T[],
  incoming: T,
  maxStacks = 1,
): { list: T[]; changed: boolean; merged: boolean } {
  const cap = Math.max(1, maxStacks || 1);
  const idx = list.findIndex(e => sameBucket(e, incoming));

  if (idx < 0) {
    // No instance with this duration yet — a separate instance, clamped to the cap.
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
