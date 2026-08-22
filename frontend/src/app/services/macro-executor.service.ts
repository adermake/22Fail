import { Injectable, inject } from '@angular/core';
import { MacroAction } from '../model/macro-action.model';
import { CharacterSheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import { TrueStatsService } from './true-stats.service';
import { LibraryStoreService } from './library-store.service';
import { ActiveStatusEffect, StatusEffect } from '../model/status-effect.model';
import { applyStacking } from '../utils/status-stacking.utils';
import { runScript } from '../scripting/interpreter';
import { createPlayerContext } from '../scripting/character-context';
import { macroActionToScript } from '../scripting/decompiler';

export interface MacroExecutionResult {
  success: boolean;
  message: string;
  resourceChanges?: { resource: string; amount: number }[];
}

const RESOURCE_FORMULA: Record<string, FormulaType> = {
  health: FormulaType.LIFE,
  energy: FormulaType.ENERGY,
  mana: FormulaType.MANA,
};

/**
 * Executes a legacy MacroAction by decompiling it to FailScript, running it through the
 * single interpreter, and applying the resulting resource/status changes directly to the
 * sheet (the caller then persists via a patch). Kept as a thin wrapper so existing skill
 * code (`skill.component`) that relies on direct-mutation semantics keeps working.
 */
@Injectable({ providedIn: 'root' })
export class MacroExecutorService {
  private trueStats = inject(TrueStatsService);
  private libraryStore = inject(LibraryStoreService);

  async executeMacro(
    macro: MacroAction,
    character: CharacterSheet,
    _sourceStatusEffectName?: string,
  ): Promise<MacroExecutionResult> {
    return this.runScriptOnSheet(macroActionToScript(macro), character);
  }

  /** Run a FailScript against a sheet and apply its resource/status effects in place.
   *  `opts.trigger` runs only that named block (e.g. the Rast's `onRest`). */
  runScriptOnSheet(
    script: string,
    character: CharacterSheet,
    opts: { trigger?: string } = {},
  ): MacroExecutionResult {
    const ctx = createPlayerContext(character, this.trueStats, {
      inCombat: false, stacks: 1, turn: 0, duration: 0, effectStrength: 0,
    });
    const result = runScript(script, ctx, { trigger: opts.trigger });

    const resourceChanges: { resource: string; amount: number }[] = [];
    for (const rc of result.resourceChanges) {
      if (this.applyResourceToSheet(character, rc.resource, rc.amount)) {
        resourceChanges.push({ resource: rc.resource, amount: rc.amount });
      }
    }
    for (const op of result.statusOps) {
      if (op.op === 'remove') this.removeStatusFromSheet(character, op.id);
      else this.applyStatusToSheet(character, op.id, op.stacks ?? 1, op.duration);
    }

    const message = result.displays
      .map(d => (d.type === 'text' || d.type === 'banner') ? d.text : d.type === 'stat' ? `${d.label}: ${d.value}` : '')
      .filter(Boolean)
      .join(' · ');

    return {
      success: result.ok,
      message: result.ok ? (message || 'Ausgeführt') : (result.errors[0] ?? 'Fehler'),
      resourceChanges,
    };
  }

  private applyResourceToSheet(character: CharacterSheet, resource: string, amount: number): boolean {
    const ft = RESOURCE_FORMULA[resource];
    if (ft === undefined) return false; // fokus is a derived pool, not a stored status
    const status = character.statuses?.find(s => s.formulaType === ft);
    if (!status) return false;
    const max = this.trueStats.calculateResourceMax(character, ft);
    status.statusCurrent = this.trueStats.clampResourceCurrent(ft, (status.statusCurrent || 0) + amount, max);
    return true;
  }

  /**
   * Apply a status effect to the sheet, stacking onto an existing instance the same way the lobby
   * does. Until now only `removeStatus` reached the sheet, so `applyStatus` from a skill or a
   * consumable's script silently did nothing outside the lobby.
   */
  private applyStatusToSheet(
    character: CharacterSheet,
    id: string,
    stacks: number,
    duration: number | undefined,
  ): void {
    const def = this.resolveLibraryEffect(id);
    const incoming: ActiveStatusEffect = {
      statusEffectId: id,
      sourceLibraryId: '',
      appliedAt: Date.now(),
      stacks: Math.max(1, Math.floor(stacks) || 1),
      duration: duration ?? def?.defaultDuration,
      customName: def?.name,
    };
    // Cap: the definition decides when we know it. For an effect the library has not (yet) loaded,
    // honour what the script asked for instead of silently clamping every application to one stack.
    const cap = def?.maxStacks || Math.max(1, incoming.stacks ?? 1);
    const current = character.activeStatusEffects ?? [];
    character.activeStatusEffects = applyStacking<ActiveStatusEffect>(current, incoming, cap).list;

    const seen = new Set(character.seenStatusEffectIds ?? []);
    seen.add(id);
    character.seenStatusEffectIds = [...seen];
  }

  private resolveLibraryEffect(id: string): StatusEffect | undefined {
    for (const lib of this.libraryStore.allLibraries) {
      const found = lib.statusEffects?.find((se: StatusEffect) => se.id === id);
      if (found) return found;
    }
    return undefined;
  }

  private removeStatusFromSheet(character: CharacterSheet, id: string): void {
    if (!character.activeStatusEffects) return;
    const i = character.activeStatusEffects.findIndex(se => se.statusEffectId === id);
    if (i >= 0) character.activeStatusEffects.splice(i, 1);
  }
}
