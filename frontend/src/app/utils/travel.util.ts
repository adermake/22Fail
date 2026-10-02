/**
 * Overland travel: how long a hex takes to cross, and what walking it costs.
 *
 * Kept as data rather than written into a template so the legend on the map, and anything
 * that later computes a route, read the same numbers. A rule stated twice drifts.
 */

import { CharacterSheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import { JsonPatch } from '../model/json-patch.model';

export interface TravelTier {
  level: number;
  /** Hours to cross one hex on foot. */
  hours: number;
  terrain: string;
}

/** Five tiers of terrain, slowest last. Times vary further by travel method. */
export const TRAVEL_TIERS: readonly TravelTier[] = [
  { level: 1, hours: 1, terrain: 'Straße, Fußweg' },
  { level: 2, hours: 2, terrain: 'Flachland, lichter Wald' },
  { level: 3, hours: 3, terrain: 'dichter Wald, Wüste, Schneegebiete, Hügel' },
  { level: 4, hours: 5, terrain: 'Sumpf' },
  { level: 5, hours: 8, terrain: 'Gebirge, Eis, Vulkan' },
];

/** Ausdauer spent per hour of walking. Other travel methods shift this either way. */
export const STAMINA_PER_HOUR_ON_FOOT = 2;

/** Ausdauer is the `ENERGY` resource on a sheet. */
export function staminaStatusIndex(sheet: CharacterSheet): number {
  return (sheet.statuses ?? []).findIndex(s => s.formulaType === FormulaType.ENERGY);
}

export function currentStamina(sheet: CharacterSheet): number {
  const i = staminaStatusIndex(sheet);
  return i < 0 ? 0 : (sheet.statuses[i].statusCurrent ?? 0);
}

/**
 * The patch that lowers a character's Ausdauer by `amount`, or null if there is nothing to
 * patch — no Ausdauer on the sheet, or a non-positive amount.
 *
 * **Not clamped at zero.** The sheet's own "use resource" lets Ausdauer go negative, and some
 * abilities rely on that; a travel drain that quietly stopped at zero would disagree with the
 * sheet about the very same number. If the table wants a floor, it belongs in one place for
 * every way Ausdauer is spent, not just this one.
 */
export function staminaDrainPatch(sheet: CharacterSheet, amount: number): JsonPatch | null {
  if (!(amount > 0)) return null;
  const i = staminaStatusIndex(sheet);
  if (i < 0) return null;
  return {
    path: `statuses.${i}.statusCurrent`,
    value: (sheet.statuses[i].statusCurrent ?? 0) - amount,
  };
}
