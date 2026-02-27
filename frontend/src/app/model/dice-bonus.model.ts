/**
 * Dice Bonus Model
 * Represents a bonus or penalty that can be applied to dice rolls
 */

export interface DiceBonus {
  name: string; // Display name of the bonus
  value: number; // Numeric value (can be negative for penalties)
  source: string; // Source type: 'skill', 'stat', 'manual', 'item', 'status_effect'
  context?: string; // Optional context (e.g., "auf Zauber mit voller Mana")
}

/**
 * Create a dice bonus from a status effect
 */
export function createDiceBonusFromStatusEffect(
  statusEffectName: string,
  value: number,
  context?: string
): DiceBonus {
  return {
    name: statusEffectName,
    value,
    source: 'status_effect',
    context
  };
}
