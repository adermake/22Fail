import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { ActionMacro, ActionCondition, ActionConsequence } from '../model/action-macro.model';
import { MacroAction } from '../model/macro-action.model';
import { FormulaType } from '../model/formula-type.enum';
import { TrueStatsService } from './true-stats.service';
import { WorldSocketService } from './world-socket.service';
import { runScript, ScriptResult, DisplayItem } from '../scripting/interpreter';
import { createPlayerContext } from '../scripting/character-context';
import { actionMacroToScript, macroActionToScript } from '../scripting/decompiler';

/**
 * Unified result type for all macro executions
 */
export interface UnifiedMacroResult {
  success: boolean;
  rolls: MacroRoll[];
  resourceChanges: MacroResourceChange[];
  conditionFailures: string[]; // German error messages
  actionName: string;
  actionIcon: string;
  actionColor: string;
  timestamp: Date;
  displays?: DisplayItem[]; // styled display()/stat()/banner() output from FailScript
}

/** Result of running a FailScript action: the display-facing result plus script extras. */
export interface ScriptExecution {
  unified: UnifiedMacroResult;
  /** Temporary modifiers, granted skills and status ops for the caller to apply. */
  script: ScriptResult;
}

export interface MacroRoll {
  id: string;
  name: string;
  formula: string;
  rolls: number[];
  total: number;
  color: string;
}

export interface MacroResourceChange {
  resource: string;
  amount: number; // Negative for spending
  displayName: string; // e.g., "Leben", "Mana"
}

/**
 * Unified Macro Executor Service
 * 
 * Handles execution of both ActionMacro (character sheet macros) and MacroAction (library macros)
 * with consistent result format, condition checking, and world broadcasting
 */
@Injectable({
  providedIn: 'root'
})
export class UnifiedMacroExecutorService {
  private worldSocket = inject(WorldSocketService);
  private trueStats = inject(TrueStatsService);

  /**
   * Execute an ActionMacro with full condition checking
   */
  executeActionMacro(
    macro: ActionMacro,
    sheet: CharacterSheet,
  ): UnifiedMacroResult {
    // Legacy structured macros now run through the single FailScript interpreter.
    return this.executeScript(actionMacroToScript(macro), sheet, {
      name: macro.name, icon: macro.icon, color: macro.color,
    }).unified;
  }

  /**
   * Execute a FailScript action against a character sheet. Reads resolve through
   * TrueStatsService; the result maps to a UnifiedMacroResult (rolls, resourceChanges,
   * display messages) so the existing lobby/sheet display + application paths work, and
   * `script` carries the temp modifiers / granted skills / status ops for the caller.
   */
  executeScript(
    src: string,
    sheet: CharacterSheet,
    opts: {
      inCombat?: boolean; stacks?: number; turn?: number; effectStrength?: number;
      name?: string; icon?: string; color?: string;
    } = {},
  ): ScriptExecution {
    const ctx = createPlayerContext(sheet, this.trueStats, {
      inCombat: opts.inCombat ?? false,
      stacks: opts.stacks ?? 1,
      turn: opts.turn ?? 0,
      effectStrength: opts.effectStrength ?? 0,
    });
    const script = runScript(src, ctx);

    const unified: UnifiedMacroResult = {
      success: script.ok,
      rolls: script.rolls.map(r => ({
        id: this.generateUUID(), name: r.name, formula: r.formula,
        rolls: r.rolls, total: r.total, color: opts.color || '#f59e0b',
      })),
      resourceChanges: script.resourceChanges.map(rc => ({
        resource: rc.resource, amount: rc.amount, displayName: this.getResourceDisplayName(rc.resource),
      })),
      conditionFailures: script.errors,
      actionName: opts.name || 'Skript',
      actionIcon: opts.icon || '⚡',
      actionColor: opts.color || '#f59e0b',
      timestamp: new Date(),
      displays: script.displays,
    };

    // Note: scripts do NOT broadcast to the world dice feed — status/skill rolls are
    // internal (viewable via the roll breakdown), not the normal on-token dice popup.
    return { unified, script };
  }

  /**
   * Execute a MacroAction (simpler library macro)
   */
  executeMacroAction(
    macro: MacroAction,
    sheet: CharacterSheet,
  ): UnifiedMacroResult {
    return this.executeScript(macroActionToScript(macro), sheet, {
      name: macro.name, icon: macro.icon, color: macro.color,
    }).unified;
  }

  /**
   * Check a single condition and return error message if failed
   */
  private checkCondition(
    condition: ActionCondition,
    sheet: CharacterSheet
  ): string | null {
    let currentValue = 0;
    let comparisonValue = condition.value;

    // Get left side value
    if (condition.type === 'resource' && condition.resource) {
      currentValue = this.getResourceValue(condition.resource, sheet);
    } else if (condition.type === 'stat' && condition.stat) {
      currentValue = this.getStatValue(condition.stat, sheet);
    } else if (condition.type === 'skill' && condition.skillName) {
      const hasSkill = sheet.skills?.some(s => s.name === condition.skillName);
      if (!hasSkill) {
        return `Benötigt Fähigkeit: ${condition.skillName}`;
      }
      return null;
    }

    // Get right side value
    if (condition.valueType === 'currentResource' && condition.compareToResource) {
      comparisonValue = this.getResourceValue(condition.compareToResource, sheet);
    } else if (condition.valueType === 'maxResource' && condition.compareToResource) {
      comparisonValue = this.getResourceMax(condition.compareToResource, sheet);
    } else if (condition.valueType === 'stat' && condition.compareToStat) {
      comparisonValue = this.getStatValue(condition.compareToStat, sheet);
    }

    // Check operator
    let passes = false;
    switch (condition.operator) {
      case '>': passes = currentValue > comparisonValue; break;
      case '<': passes = currentValue < comparisonValue; break;
      case '>=': passes = currentValue >= comparisonValue; break;
      case '<=': passes = currentValue <= comparisonValue; break;
      case '==': passes = currentValue === comparisonValue; break;
      case '!=': passes = currentValue !== comparisonValue; break;
    }

    if (!passes) {
      const targetName = condition.resource || condition.stat || '';
      return `Bedingung nicht erfüllt: ${targetName} ${condition.operator} ${comparisonValue}`;
    }

    return null;
  }

  /**
   * Execute a single consequence and update result
   */
  private executeConsequence(
    consequence: ActionConsequence,
    result: UnifiedMacroResult
  ): void {
    const rollData = consequence.diceFormula
      ? this.rollDice(consequence.diceFormula)
      : null;

    switch (consequence.type) {
      case 'dice_roll':
        if (rollData) {
          result.rolls.push({
            id: this.generateUUID(),
            name: consequence.rollName || 'Wurf',
            formula: rollData.formula,
            rolls: rollData.diceRolls,
            total: rollData.total,
            color: consequence.rollColor || '#f59e0b'
          });
        }
        break;

      case 'spend_resource':
      case 'gain_resource':
        if (consequence.resource && rollData) {
          const amount = consequence.type === 'spend_resource' ? -rollData.total : rollData.total;
          result.resourceChanges.push({
            resource: consequence.resource,
            amount: amount,
            displayName: this.getResourceDisplayName(consequence.resource)
          });

          // Also add the roll if it was dice-based
          if (rollData.diceRolls.length > 0) {
            result.rolls.push({
              id: this.generateUUID(),
              name: consequence.rollName || (consequence.type === 'spend_resource' ? 'Kosten' : 'Gewinn'),
              formula: rollData.formula,
              rolls: rollData.diceRolls,
              total: rollData.total,
              color: consequence.rollColor || (consequence.type === 'spend_resource' ? '#ef4444' : '#22c55e')
            });
          }
        }
        break;

      // TODO: Implement apply_bonus
    }
  }

  /**
   * Broadcast execution result to world socket for lobby display
   */
  private broadcastToWorld(result: UnifiedMacroResult, sheet: CharacterSheet): void {
    if (!sheet.worldName) return;

    // Broadcast each dice roll
    for (const roll of result.rolls) {
      this.worldSocket.sendDiceRoll({
        id: roll.id,
        worldName: sheet.worldName,
        characterId: sheet.id || '',
        characterName: sheet.name,
        diceType: this.extractDiceType(roll.formula),
        diceCount: roll.rolls.length,
        rolls: roll.rolls,
        result: roll.total,
        bonuses: [],
        timestamp: result.timestamp,
        isSecret: false,
        actionName: result.actionName,
        actionIcon: result.actionIcon,
        actionColor: result.actionColor,
        resourceChanges: result.resourceChanges.map(rc => ({ 
          resource: rc.resource, 
          amount: rc.amount 
        }))
      });
    }

    // If no rolls but resource changes, still broadcast
    if (result.rolls.length === 0 && result.resourceChanges.length > 0) {
      this.worldSocket.sendDiceRoll({
        id: this.generateUUID(),
        worldName: sheet.worldName,
        characterId: sheet.id || '',
        characterName: sheet.name,
        diceType: 0,
        diceCount: 0,
        rolls: [],
        result: 0,
        bonuses: [],
        timestamp: result.timestamp,
        isSecret: false,
        actionName: result.actionName,
        actionIcon: result.actionIcon,
        actionColor: result.actionColor,
        resourceChanges: result.resourceChanges.map(rc => ({ 
          resource: rc.resource, 
          amount: rc.amount 
        }))
      });
    }
  }

  /**
   * Roll dice from a formula string (e.g., "2d6+3", "1d20", "10")
   */
  private rollDice(formula: string): { total: number; diceRolls: number[]; formula: string } {
    formula = formula.trim();
    const diceRolls: number[] = [];
    let total = 0;

    // Simple regex to match XdY format
    const diceMatch = formula.match(/(\d+)d(\d+)/i);
    if (diceMatch) {
      const count = parseInt(diceMatch[1]);
      const sides = parseInt(diceMatch[2]);
      
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        diceRolls.push(roll);
        total += roll;
      }

      // Check for modifiers (e.g., +3, -2)
      const modifierMatch = formula.match(/([+\-]\d+)$/);
      if (modifierMatch) {
        total += parseInt(modifierMatch[1]);
      }
    } else {
      // Fixed value
      const value = parseInt(formula);
      if (!isNaN(value)) {
        total = value;
      }
    }

    return { total, diceRolls, formula };
  }

  /**
   * Extract dice type from formula for display (returns largest die)
   */
  private extractDiceType(formula: string): number {
    const match = formula.match(/d(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get current value of a resource
   */
  private getResourceValue(resource: string, sheet: CharacterSheet): number {
    const formulaTypeMap: Record<string, FormulaType> = {
      'health': FormulaType.LIFE,
      'energy': FormulaType.ENERGY,
      'mana': FormulaType.MANA
    };
    
    const formulaType = formulaTypeMap[resource];
    if (formulaType !== undefined) {
      const status = sheet.statuses?.find(s => s.formulaType === formulaType);
      return status?.statusCurrent || 0;
    }
    
    return 0;
  }

  /**
   * Get max value of a resource
   */
  private getResourceMax(resource: string, sheet: CharacterSheet): number {
    const formulaTypeMap: Record<string, FormulaType> = {
      'health': FormulaType.LIFE,
      'energy': FormulaType.ENERGY,
      'mana': FormulaType.MANA
    };
    
    const formulaType = formulaTypeMap[resource];
    if (formulaType !== undefined) {
      const status = sheet.statuses?.find(s => s.formulaType === formulaType);
      if (status) {
        return this.trueStats.calculateResourceMax(sheet, formulaType);
      }
    }
    
    return 0;
  }

  /**
   * Get value of a stat. Routed through TrueStatsService so macro conditions compare
   * against the *effective* stat (base + skills + equipment + status effects), not the
   * possibly-stale cached `.current` value.
   */
  private getStatValue(stat: string, sheet: CharacterSheet): number {
    const statBlock = (sheet as any)[stat];
    if (!statBlock) return 0;
    return this.trueStats.calculateStat(sheet, statBlock, stat as any);
  }

  /**
   * Get German display name for a resource
   */
  private getResourceDisplayName(resource: string): string {
    const names: Record<string, string> = {
      'health': 'Leben',
      'energy': 'Energie',
      'mana': 'Mana',
      'fokus': 'Fokus'
    };
    return names[resource] || resource;
  }

  /**
   * Generate UUID for unique IDs
   */
  private generateUUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
