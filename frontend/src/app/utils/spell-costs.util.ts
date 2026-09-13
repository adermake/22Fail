import { CastingSpellEntry, SpellBlock } from '../model/spell-block-model';
import { RuneBlock } from '../model/rune-block.model';
import { calculateSpellCost } from '../shared/spell-node-editor/spell-cost-calculator';
import { scaledManaCost } from '../shared/spell-cast-formulas';

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

/** Fokus bound by all running spells. Entries whose spell is unknown bind nothing. */
export function committedFokus(
  spells: readonly SpellBlock[], casting: readonly CastingSpellEntry[], runes: readonly RuneBlock[],
): number {
  return casting.reduce((sum, entry) => {
    const spell = spells.find(s => s.id === entry.spellId);
    return spell ? sum + spellFokusCost(spell, runes) : sum;
  }, 0);
}
