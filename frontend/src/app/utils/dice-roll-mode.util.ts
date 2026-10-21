/**
 * Vorteil / Nachteil for a dice roll. Lower is better in this system, so Vorteil keeps the
 * lowest of several full roll sets and Nachteil the highest. The "+" variants roll three sets
 * instead of two.
 */
export type RollMode = 'normal' | 'vorteil' | 'vorteil+' | 'nachteil' | 'nachteil+';

export const ROLL_MODES: { id: RollMode; label: string }[] = [
  { id: 'nachteil+', label: 'Nachteil+' },
  { id: 'nachteil', label: 'Nachteil' },
  { id: 'normal', label: 'Normal' },
  { id: 'vorteil', label: 'Vorteil' },
  { id: 'vorteil+', label: 'Vorteil+' },
];

/** How many full roll sets the mode throws. */
export function rollSetCount(mode: RollMode): number {
  if (mode === 'normal') return 1;
  return mode.endsWith('+') ? 3 : 2;
}

/** Index of the set that counts. Ties go to the first set. */
export function chooseRollSet(totals: number[], mode: RollMode): number {
  const better = mode.startsWith('vorteil')
    ? (a: number, b: number) => a < b
    : mode.startsWith('nachteil')
      ? (a: number, b: number) => a > b
      : () => false;
  let chosen = 0;
  for (let i = 1; i < totals.length; i++) {
    if (better(totals[i], totals[chosen])) chosen = i;
  }
  return chosen;
}

export function rollModeLabel(mode: RollMode): string {
  return ROLL_MODES.find(m => m.id === mode)?.label ?? 'Normal';
}
