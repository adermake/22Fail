/**
 * Stability damage mitigation.
 *
 * Design note: stability lives on the DEFENDER now, not the attacker. Attackers roll raw
 * damage; when a defender takes it (health loss), the loss is reduced by their stability. The
 * formula is unchanged from when it lived on the damage roll:
 *
 *   mitigated = round(rawDamage × 100 / (100 + stability))
 *
 * i.e. 100 stability halves incoming damage, 200 thirds it, etc.
 */

/** Reduce a positive damage amount by the defender's stability. */
export function applyStability(rawDamage: number, stability: number): number {
  const dmg = Math.max(0, rawDamage);
  const stab = Math.max(0, stability || 0);
  if (stab === 0 || dmg === 0) return Math.round(dmg);
  return Math.round(dmg * (100 / (100 + stab)));
}

/**
 * Apply stability to a signed resource delta. Only NEGATIVE deltas (damage/loss) are
 * mitigated; gains pass through unchanged. Returns the mitigated signed delta.
 */
export function applyStabilityToDelta(delta: number, stability: number): number {
  if (delta >= 0) return delta;
  return -applyStability(-delta, stability);
}
