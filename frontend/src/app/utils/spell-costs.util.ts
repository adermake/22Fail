import { CastingSpellEntry, SpellBlock, SpellStatRequirements } from '../model/spell-block-model';
import { RuneBlock } from '../model/rune-block.model';
import { calculateSpellCost } from '../shared/spell-node-editor/spell-cost-calculator';
import { haltbarkeitsKosten, scaledManaCost } from '../shared/spell-cast-formulas';
import { spellKey } from './spell-medium.util';

const STAT_KEYS: readonly (keyof SpellStatRequirements)[] =
  ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'];

/**
 * What a spell costs, in one place: the cast window, the lobby's abilities dock (greying out what
 * cannot be cast) and the Fokus readout in the lobby panel must all agree.
 *
 * Stored values win; a spell without them falls back to the estimate from its rune graph.
 */
export function spellBaseCosts(
  spell: SpellBlock, runes: readonly RuneBlock[],
): { mana: number; fokus: number; effektivitaet: number } {
  let mana = spell.costMana ?? 0;
  let fokus = spell.perTurnFokus ?? spell.costFokus ?? 0;
  let effektivitaet = 0;
  if (spell.graph) {
    const est = calculateSpellCost(spell.graph, [...runes]);
    if (mana <= 0) mana = est.mana;
    if (fokus <= 0) fokus = est.fokus;
    effektivitaet = est.effektivitaet;
  }
  return { mana, fokus, effektivitaet };
}

/** Mana at a cast level and Skalierung: base × 100/(Cast+100) × Skalierung. */
export function spellManaCost(spell: SpellBlock, runes: readonly RuneBlock[], castLevel = 0, skalierung = 1): number {
  return scaledManaCost(spellBaseCosts(spell, runes).mana, castLevel, skalierung);
}

/** Fokus a running spell binds (not changed by cast level or Skalierung). */
export function spellFokusCost(spell: SpellBlock, runes: readonly RuneBlock[]): number {
  return Math.round(spellBaseCosts(spell, runes).fokus * 100) / 100;
}

/**
 * Fokus bound by all running spells. Entries whose spell is unknown bind nothing.
 *
 * Matched by `spellKey`, not raw id: a spell cast from a Medium the character does not otherwise
 * know is not in `sheet.spells`, so `spells` must be the union list (`castableSpells`) or a
 * sustained scroll-spell silently binds zero Fokus.
 */
export function committedFokus(
  spells: readonly SpellBlock[], casting: readonly CastingSpellEntry[], runes: readonly RuneBlock[],
): number {
  return casting.reduce((sum, entry) => {
    const spell = spells.find(s => s && spellKey(s) === entry.spellId);
    return spell ? sum + spellFokusCost(spell, runes) : sum;
  }, 0);
}

/**
 * Voraussetzung — the spell's single gating number, and what a cast burns off its Medium.
 *
 * The model stores requirements per stat, but the ruleset speaks of one Voraussetzung: "die
 * Mindestanforderung für den gewählten Stat (meist Intelligenz)". The heaviest stat is that number;
 * a spell demanding INT 12 and GES 4 is an INT-12 spell, not a 16 one.
 *
 * Stored wins, with the rune-graph estimate as fallback — same precedence as `spellBaseCosts`.
 */
export function spellVoraussetzung(spell: SpellBlock, runes: readonly RuneBlock[]): number {
  let max = 0;
  const stored = spell.statRequirements;
  if (stored) {
    for (const key of STAT_KEYS) max = Math.max(max, stored[key] ?? 0);
  }
  if (max <= 0 && spell.graph) {
    const est = calculateSpellCost(spell.graph, [...runes]).statRequirements;
    for (const key of STAT_KEYS) max = Math.max(max, est[key] ?? 0);
  }
  return max;
}

/** Haltbarkeit one cast burns off its Medium: Voraussetzung × castFactor × Skalierung. */
export function spellHaltbarkeitsKosten(
  spell: SpellBlock, runes: readonly RuneBlock[], castLevel = 0, skalierung = 1,
): number {
  return haltbarkeitsKosten(spellVoraussetzung(spell, runes), castLevel, skalierung);
}
