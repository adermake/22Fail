import { Injectable, inject } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { ActionMacro, ActionCondition, ActionConsequence } from '../model/action-macro.model';
import { MacroAction } from '../model/macro-action.model';
import { FormulaType } from '../model/formula-type.enum';
import { WorldSocketService } from './world-socket.service';

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

  /**
   * Execute an ActionMacro with full condition checking
   */
  executeActionMacro(
    macro: ActionMacro,
    sheet: CharacterSheet
  ): UnifiedMacroResult {
    const result: UnifiedMacroResult = {
      success: false,
      rolls: [],
      resourceChanges: [],
      conditionFailures: [],
      actionName: macro.name,
      actionIcon: macro.icon || '⚡',
      actionColor: macro.color || '#f59e0b',
      timestamp: new Date()
    };

    // Check conditions
    for (const condition of macro.conditions) {
      const failure = this.checkCondition(condition, sheet);
      if (failure) {
        result.conditionFailures.push(failure);
      }
    }

    // If any condition failed, don't execute
    if (result.conditionFailures.length > 0) {
      return result;
    }

    // Execute consequences
    for (const consequence of macro.consequences) {
      this.executeConsequence(consequence, result);
    }

    result.success = true;

    // Broadcast to world socket
    this.broadcastToWorld(result, sheet);

    return result;
  }

  /**
   * Execute a MacroAction (simpler library macro)
   */
  executeMacroAction(
    macro: MacroAction,
    sheet: CharacterSheet
  ): UnifiedMacroResult {
    const result: UnifiedMacroResult = {
      success: true,
      rolls: [],
      resourceChanges: [],
      conditionFailures: [],
      actionName: macro.name,
      actionIcon: macro.icon || '✦',
      actionColor: macro.color || '#8b5cf6',
      timestamp: new Date()
    };

    // MacroActions have no conditions - always execute
    switch (macro.actionType) {
      case 'dice_roll':
        if (macro.parameters.diceFormula) {
          const roll = this.rollDice(macro.parameters.diceFormula);
          result.rolls.push({
            id: this.generateUUID(),
            name: macro.parameters.rollName || 'Wurf',
            formula: roll.formula,
            rolls: roll.diceRolls,
            total: roll.total,
            color: macro.parameters.rollColor || macro.color || '#f59e0b'
          });
        }
        break;

      case 'apply_damage':
        const damage = macro.parameters.diceAmount 
          ? this.rollDice(macro.parameters.diceAmount).total
          : (macro.parameters.amount || 0);
        result.resourceChanges.push({
          resource: 'health',
          amount: -damage,
          displayName: 'Leben'
        });
        break;

      case 'apply_healing':
        const healing = macro.parameters.diceAmount 
          ? this.rollDice(macro.parameters.diceAmount).total
          : (macro.parameters.amount || 0);
        result.resourceChanges.push({
          resource: 'health',
          amount: healing,
          displayName: 'Leben'
        });
        break;

      case 'modify_resource':
        if (macro.parameters.resource) {
          const amount = macro.parameters.resourceDiceAmount
            ? this.rollDice(macro.parameters.resourceDiceAmount).total
            : (macro.parameters.resourceAmount || 0);
          result.resourceChanges.push({
            resource: macro.parameters.resource,
            amount: amount,
            displayName: this.getResourceDisplayName(macro.parameters.resource)
          });
        }
        break;

      case 'custom_message':
        // Message is just stored in the result, UI will display it
        break;

      // TODO: Implement other action types (apply_status, remove_status, modify_stat)
    }

    // Broadcast to world socket
    this.broadcastToWorld(result, sheet);

    return result;
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
        return (status.statusBase || 0) + (status.statusBonus || 0) + (status.statusEffectBonus || 0);
      }
    }
    
    return 0;
  }

  /**
   * Get value of a stat
   */
  private getStatValue(stat: string, sheet: CharacterSheet): number {
    const statObj = (sheet as any)[stat];
    return statObj?.current || 0;
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
