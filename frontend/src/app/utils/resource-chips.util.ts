import { SpellBlock } from '../model/spell-block-model';

/**
 * Resource costs, shown as the icon the resource already has.
 *
 * `public/icons/` carries mana, energy, life and focus, and `styles.css` has the matching `.i-*`
 * mask rules — so abbreviations like 'MP', 'EP', 'LP', 'M' and 'F' were a second vocabulary for
 * things that already had a symbol, invented separately in four places. One table here instead.
 *
 * `label` exists because an icon cannot go in a `title` attribute or be read aloud; it spells the
 * resource out in German rather than abbreviating it again.
 */

/** One resource cost, rendered as an icon plus a number. */
export interface CostChip {
  amount: number;
  /** `app-icon` modifier class, e.g. 'i-mana'. */
  icon: string;
  /** German resource name, for tooltips and aria. */
  label: string;
  /** Per-round upkeep rather than a one-off cost. */
  perRound?: boolean;
}

const RESOURCES: Record<string, { icon: string; label: string }> = {
  mana:   { icon: 'i-mana',   label: 'Mana' },
  energy: { icon: 'i-energy', label: 'Ausdauer' },
  life:   { icon: 'i-life',   label: 'Leben' },
  fokus:  { icon: 'i-focus',  label: 'Fokus' },
};

/** Icon class for a resource, or null for anything that has no symbol (then show text). */
export function resourceIcon(resource: string): string | null {
  return RESOURCES[resource]?.icon ?? null;
}

export function resourceLabel(resource: string): string | null {
  return RESOURCES[resource]?.label ?? null;
}

/** One chip, or null when the amount is zero or the resource is unknown. */
export function resourceChip(
  resource: string, amount: number | undefined, perRound = false,
): CostChip | null {
  const meta = RESOURCES[resource];
  if (!meta || !amount) return null;
  return { amount, icon: meta.icon, label: meta.label, perRound: perRound || undefined };
}

/** Text form of a chip list, for `title` attributes where markup cannot go. */
export function chipsToText(chips: readonly CostChip[]): string {
  return chips.map(c => `${c.amount} ${c.label}${c.perRound ? '/Runde' : ''}`).join(' · ');
}

/** A spell's stored one-off cost. */
export function spellBaseCostChips(spell: SpellBlock): CostChip[] {
  return [
    resourceChip('mana', spell.costMana),
    resourceChip('fokus', spell.costFokus),
  ].filter((c): c is CostChip => !!c);
}

/** A spell's stored per-round upkeep. */
export function spellPerTurnChips(spell: SpellBlock): CostChip[] {
  return [
    resourceChip('mana', spell.perTurnMana, true),
    resourceChip('fokus', spell.perTurnFokus, true),
  ].filter((c): c is CostChip => !!c);
}
