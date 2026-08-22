import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { FormulaType } from '../model/formula-type.enum';
import { hasRestBlock, REST_TRIGGER } from '../scripting/interpreter';
import { MacroExecutorService } from './macro-executor.service';
import { TrueStatsService } from './true-stats.service';

/** One thing that reacts to resting. */
export interface RestSource {
  kind: 'item' | 'skill' | 'spell';
  name: string;
  script: string;
}

/** The three pools a Rast restores. */
export type RestResource = 'health' | 'energy' | 'mana';

export const REST_RESOURCES: { key: RestResource; formula: FormulaType; label: string }[] = [
  { key: 'health', formula: FormulaType.LIFE,   label: 'Leben' },
  { key: 'energy', formula: FormulaType.ENERGY, label: 'Ausdauer' },
  { key: 'mana',   formula: FormulaType.MANA,   label: 'Mana' },
];

/** Share of the maximum a plain Rast gives back. */
export const REST_RESTORE_SHARE = 0.25;

export interface RestOutcome {
  /** What fired, with whatever its script reported. */
  fired: { kind: RestSource['kind']; name: string; message: string }[];
  /** Consumed items removed from the queue (they are gone after a Rast, fired or not). */
  clearedItems: number;
  /** Net change actually applied per pool, after the water rule. */
  restored: Record<RestResource, number>;
  /** True when the gains were halved because the character had too little water. */
  halved: boolean;
}

/**
 * Die Rast. A rest gives back a quarter of each maximum pool, plus whatever the queued
 * Verbrauchsgegenstände and active abilities contribute through their `onRest` blocks.
 *
 * The water rule: without a litre of water over the day, every GAIN is halved. The base restore and
 * all script gains are therefore summed FIRST and halved together — halving each contribution on its
 * own would round differently. Losses (a hangover, say) are never softened by dehydration.
 *
 * What reacts to a Rast:
 *  - every consumed item still in the queue,
 *  - passive skills and active skills the player currently has switched on,
 *  - spells that are currently sustained.
 */
@Injectable({ providedIn: 'root' })
export class RestService {
  private macros = inject(MacroExecutorService);
  private trueStats = inject(TrueStatsService);

  /** Is this skill "on" right now? Passives always are; actives only while toggled on. */
  isSkillActive(sheet: CharacterSheet, skill: SkillBlock): boolean {
    if (skill.disabled) return false;
    if (skill.type === 'passive') return true;
    const byName = (sheet.activeSkillNames ?? []).includes(skill.name);
    const byEntry = (sheet.activeSkillEntries ?? []).some(e =>
      (skill.skillId && e.skillId === skill.skillId) || e.skillName === skill.name);
    return byName || byEntry;
  }

  /** Is this spell currently sustained (finished casting and not dismissed)? */
  isSpellActive(sheet: CharacterSheet, spell: SpellBlock): boolean {
    return (sheet.castingSpells ?? []).some(c =>
      ((spell.id && c.spellId === spell.id) || c.spellName === spell.name) && (c.remainingCast ?? 1) <= 0);
  }

  /** Everything that will fire on the next Rast, in the order it will run. */
  collectRestSources(sheet: CharacterSheet): RestSource[] {
    const out: RestSource[] = [];

    for (const entry of sheet.consumedItems ?? []) {
      const script = entry.item?.script;
      if (script && hasRestBlock(script)) {
        out.push({ kind: 'item', name: entry.item.name, script });
      }
    }
    for (const skill of sheet.skills ?? []) {
      if (skill.script && hasRestBlock(skill.script) && this.isSkillActive(sheet, skill)) {
        out.push({ kind: 'skill', name: skill.name, script: skill.script });
      }
    }
    for (const spell of sheet.spells ?? []) {
      if (spell.script && hasRestBlock(spell.script) && this.isSpellActive(sheet, spell)) {
        out.push({ kind: 'spell', name: spell.name, script: spell.script });
      }
    }
    return out;
  }

  /** A quarter of each maximum — what a Rast restores before any script or the water rule. */
  baseRestore(sheet: CharacterSheet): Record<RestResource, number> {
    const out = { health: 0, energy: 0, mana: 0 } as Record<RestResource, number>;
    for (const res of REST_RESOURCES) {
      out[res.key] = Math.floor(this.trueStats.calculateResourceMax(sheet, res.formula) * REST_RESTORE_SHARE);
    }
    return out;
  }

  /**
   * Perform the Rast. `drankWater: false` halves the summed gains. Mutates `sheet`; the caller
   * persists (statuses, activeStatusEffects, consumedItems).
   */
  performRest(sheet: CharacterSheet, opts: { drankWater: boolean } = { drankWater: true }): RestOutcome {
    const sources = this.collectRestSources(sheet);
    const fired: RestOutcome['fired'] = [];

    // 1. Start from the flat restore, then let every onRest block add to the pot. Status effects
    //    and other side effects apply immediately; only the resource numbers are held back.
    const totals = this.baseRestore(sheet);
    for (const source of sources) {
      const result = this.macros.runScriptOnSheet(source.script, sheet, {
        trigger: REST_TRIGGER,
        applyResources: false,
      });
      for (const change of result.resourceChanges ?? []) {
        if (change.resource in totals) {
          totals[change.resource as RestResource] += change.amount;
        }
      }
      fired.push({ kind: source.kind, name: source.name, message: result.message });
    }

    // 2. Too little water halves what the character GAINS. A net loss stands as it is.
    const halved = !opts.drankWater;
    if (halved) {
      for (const res of REST_RESOURCES) {
        if (totals[res.key] > 0) totals[res.key] = Math.floor(totals[res.key] / 2);
      }
    }

    // 3. Commit through the normal clamping path, so nothing exceeds a maximum.
    for (const res of REST_RESOURCES) {
      if (totals[res.key] !== 0) this.macros.applyResourceToSheet(sheet, res.key, totals[res.key]);
    }

    const clearedItems = (sheet.consumedItems ?? []).length;
    sheet.consumedItems = [];

    return { fired, clearedItems, restored: totals, halved };
  }
}
