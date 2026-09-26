import { JsonPatch } from '../model/json-patch.model';
import { SpellMedium } from './spell-medium.util';

/**
 * Bruchprobe — does the Medium survive the cast?
 *
 * Regelwerk (`public/rulebook/zauber.md`): "Wenn die Haltbarkeit beim Zaubern unter 10 fällt, muss
 * gewürfelt werden, ob der Zauber kaputtgeht. Der Würfelbonus für diesen Wurf lautet +5 - Haltbarkeit."
 *
 * The direction is the easy thing to get backwards. Dice here are LOWER IS BETTER, so the bonus
 * `5 − Haltbarkeit` is NEGATIVE (helpful) while the medium is still healthy and turns positive
 * (harmful) as it wears out — at Haltbarkeit 9 it is −4, at 0 it is +5. A roll of
 * `W20 + bonus` at or under the threshold holds; above it the inscription is gone.
 */

/** Roll at or under this and the Medium survives. Above it, it breaks. */
export const BRUCHPROBE_SCHWELLE = 10;

/** Below this remaining Haltbarkeit a cast forces the roll. */
export const BRUCHPROBE_GRENZE = 10;

export interface Bruchprobe {
  /** Würfelbonus: 5 − Haltbarkeit. Negative helps, positive hurts. */
  bonus: number;
  /** The raw W20. */
  roll: number;
  /** roll + bonus. */
  total: number;
  broken: boolean;
}

/** A cast that leaves the Medium under 10 Haltbarkeit forces a Bruchprobe. */
export function needsBruchprobe(restHaltbarkeit: number): boolean {
  return restHaltbarkeit < BRUCHPROBE_GRENZE;
}

/** Würfelbonus for the Bruchprobe. Haltbarkeit below 0 does not help the roll further. */
export function bruchprobeBonus(restHaltbarkeit: number): number {
  return 5 - Math.max(0, restHaltbarkeit);
}

/**
 * Resolve the roll. `roll` is injected rather than drawn here so this stays pure and testable;
 * the caller rolls the W20 and broadcasts it.
 */
export function resolveBruchprobe(restHaltbarkeit: number, roll: number): Bruchprobe {
  const bonus = bruchprobeBonus(restHaltbarkeit);
  const total = Math.round((roll + bonus) * 100) / 100;
  return { bonus, roll, total, broken: total > BRUCHPROBE_SCHWELLE };
}

/**
 * Patches that kill an inscription for good.
 *
 * Two of them, and both are load-bearing. `binding.broken` marks the inscription itself: the
 * material can never carry a spell again, so this must outlive anyone clearing `lost` by hand.
 * `lost` on the carrier is the user's ruling — a break destroys the whole item, even a Buch that
 * still holds intact inscriptions.
 *
 * This is deliberately the ONLY place that policy is written down, so softening it later (mark the
 * inscription, leave the item) is a one-line change here rather than a hunt through the cast path.
 */
export function breakInscriptionPatches(medium: SpellMedium): JsonPatch[] {
  return [
    { path: `${medium.path}.binding.broken`, value: true },
    { path: `${medium.itemPath}.lost`, value: true },
  ];
}
