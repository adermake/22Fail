import { Injectable, inject } from '@angular/core';
import { MacroAction } from '../model/macro-action.model';
import { CharacterSheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import { TrueStatsService } from './true-stats.service';
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

  async executeMacro(
    macro: MacroAction,
    character: CharacterSheet,
    _sourceStatusEffectName?: string,
  ): Promise<MacroExecutionResult> {
    return this.runScriptOnSheet(macroActionToScript(macro), character);
  }

  /** Run a FailScript against a sheet and apply its resource/status effects in place. */
  runScriptOnSheet(script: string, character: CharacterSheet): MacroExecutionResult {
    const ctx = createPlayerContext(character, this.trueStats, {
      inCombat: false, stacks: 1, turn: 0, duration: 0, effectStrength: 0,
    });
    const result = runScript(script, ctx);

    const resourceChanges: { resource: string; amount: number }[] = [];
    for (const rc of result.resourceChanges) {
      if (this.applyResourceToSheet(character, rc.resource, rc.amount)) {
        resourceChanges.push({ resource: rc.resource, amount: rc.amount });
      }
    }
    for (const op of result.statusOps) {
      if (op.op === 'remove') this.removeStatusFromSheet(character, op.id);
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

  private removeStatusFromSheet(character: CharacterSheet, id: string): void {
    if (!character.activeStatusEffects) return;
    const i = character.activeStatusEffects.findIndex(se => se.statusEffectId === id);
    if (i >= 0) character.activeStatusEffects.splice(i, 1);
  }
}
