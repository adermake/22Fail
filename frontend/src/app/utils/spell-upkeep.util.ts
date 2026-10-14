import { CastingSpellEntry, SpellBlock } from '../model/spell-block-model';
import { CharacterSheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import { JsonPatch } from '../model/json-patch.model';
import { scaledBySkalierung } from '../shared/spell-cast-formulas';
import { resolveSpellByKey } from './spell-medium.util';

/**
 * Laufende Zauber: wann sie enden und was sie pro Runde kosten.
 *
 * One place for the sheet's cast window, the lobby active column and the turn-start upkeep, which
 * used to disagree (the lobby ignored Skalierung on the duration).
 */

/** Dauer 0 but a per-round cost: the spell runs until the caster releases it. */
export function isSustainedUntilReleased(spell: SpellBlock | undefined): boolean {
  if (!spell || spell.durationTurns) return false;
  return (spell.perTurnMana ?? 0) > 0 || (spell.perTurnFokus ?? 0) > 0;
}

/** Scaled duration in rounds; `Infinity` for a sustained spell, 0 for an instant one. */
export function entryDuration(entry: CastingSpellEntry, spell: SpellBlock | undefined): number {
  if (isSustainedUntilReleased(spell)) return Infinity;
  const base = spell?.durationTurns ?? 0;
  return base ? scaledBySkalierung(base, entry.skalierung ?? 1) : 0;
}

/** Done casting and its rounds are used up (or it was instant). Never true for a sustained spell. */
export function isCastingEntryFinished(entry: CastingSpellEntry, spell: SpellBlock | undefined): boolean {
  if (entry.remainingCast > 0) return false;
  const dur = entryDuration(entry, spell);
  if (dur === Infinity) return false;
  if (!dur) return true;
  return (entry.roundsActive ?? 0) >= dur;
}

export interface TurnUpkeepResult {
  castingSpells: CastingSpellEntry[];
  /** Mana actually paid this turn. */
  manaSpent: number;
  /** Spells whose upkeep could not be paid — kept running, the cost is skipped (GM decides). */
  unpaid: string[];
  /** Whether anything changed (otherwise there is nothing to patch). */
  changed: boolean;
}

/**
 * The caster's turn starts: every running spell ages one round and charges its per-round Mana.
 *
 * Spells still being cast (remainingCast > 0) and spells already over are left alone. Fokus is not
 * paid here — it is bound while the spell runs, not spent. When the Mana isn't there the spell keeps
 * running without paying and is reported in `unpaid`, so the table can decide.
 */
export function applyTurnStartUpkeep(
  entries: readonly CastingSpellEntry[],
  resolve: (spellId: string) => SpellBlock | undefined,
  manaAvailable: number,
): TurnUpkeepResult {
  let mana = manaAvailable;
  let manaSpent = 0;
  let changed = false;
  const unpaid: string[] = [];

  const castingSpells = entries.map(entry => {
    if (entry.remainingCast > 0) return entry;
    const spell = resolve(entry.spellId);
    if (isCastingEntryFinished(entry, spell)) return entry;

    changed = true;
    const next = { ...entry, roundsActive: (entry.roundsActive ?? 0) + 1 };
    const cost = spell?.perTurnMana ?? 0;
    if (cost > 0) {
      if (mana >= cost) {
        mana -= cost;
        manaSpent += cost;
      } else {
        unpaid.push(entry.spellName || spell?.name || entry.spellId);
      }
    }
    return next;
  });

  return { castingSpells, manaSpent, unpaid, changed };
}

/** Turn-start upkeep for a player sheet, as the patches to send (empty when nothing runs). */
export function characterTurnUpkeep(sheet: CharacterSheet): { patches: JsonPatch[]; unpaid: string[] } {
  const statuses = sheet.statuses ?? [];
  const manaIdx = statuses.findIndex(s => s.formulaType === FormulaType.MANA);
  const mana = manaIdx >= 0 ? statuses[manaIdx].statusCurrent ?? 0 : 0;
  const res = applyTurnStartUpkeep(sheet.castingSpells ?? [], key => resolveSpellByKey(sheet, key), mana);
  if (!res.changed) return { patches: [], unpaid: [] };

  const patches: JsonPatch[] = [{ path: 'castingSpells', value: res.castingSpells }];
  if (res.manaSpent > 0 && manaIdx >= 0) {
    patches.push({
      path: 'statuses',
      value: statuses.map((s, i) => (i === manaIdx ? { ...s, statusCurrent: mana - res.manaSpent } : s)),
    });
  }
  return { patches, unpaid: res.unpaid };
}
