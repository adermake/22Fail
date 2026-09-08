/**
 * Rounding for display.
 *
 * Binary floating point cannot hold 0.1, so a stack of three 0.1 kg items sums to
 * 0.30000000000000004 and the sheet showed exactly that. Every place that adds or multiplies
 * weights, prices or other fractional game values runs the result through here before it
 * reaches a template.
 *
 * Three decimals by default: enough for the smallest weights the rules use, short enough that
 * the artefact digits are gone.
 */
export function roundTo(value: number, decimals = 3): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
