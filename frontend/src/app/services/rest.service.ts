import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { SkillBlock } from '../model/skill-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { hasRestBlock, REST_TRIGGER } from '../scripting/interpreter';
import { MacroExecutorService } from './macro-executor.service';

/** One thing that reacts to resting. */
export interface RestSource {
  kind: 'item' | 'skill' | 'spell';
  name: string;
  script: string;
}

export interface RestOutcome {
  /** What fired, with whatever its script reported. */
  fired: { kind: RestSource['kind']; name: string; message: string }[];
  /** Consumed items removed from the queue (they are gone after a Rast, fired or not). */
  clearedItems: number;
}

/**
 * Die Rast. Consumed Verbrauchsgegenstände wait in `sheet.consumedItems` until the player rests;
 * resting fires every `onRest { … }` block that currently applies and empties the queue.
 *
 * What applies:
 *  - every consumed item still in the queue,
 *  - passive skills (always on) and active skills the player currently has switched on,
 *  - spells that are currently being sustained (fully cast).
 * A dismissed skill or an uncast spell does not react — that is the whole point of the rule.
 */
@Injectable({ providedIn: 'root' })
export class RestService {
  private macros = inject(MacroExecutorService);

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

  /**
   * Perform the Rast: fire every source's `onRest` block against the sheet (resource and status
   * changes are applied in place), then empty the consumed queue. The caller persists the sheet.
   */
  performRest(sheet: CharacterSheet): RestOutcome {
    const sources = this.collectRestSources(sheet);
    const fired: RestOutcome['fired'] = [];

    for (const source of sources) {
      const result = this.macros.runScriptOnSheet(source.script, sheet, { trigger: REST_TRIGGER });
      fired.push({ kind: source.kind, name: source.name, message: result.message });
    }

    const clearedItems = (sheet.consumedItems ?? []).length;
    sheet.consumedItems = [];

    return { fired, clearedItems };
  }
}
