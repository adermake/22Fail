import { Injectable, inject } from '@angular/core';
import { MacroAction, MacroActionType } from '../model/macro-action.model';
import { CharacterSheet } from '../model/character-sheet-model';
import { WorldSocketService } from './world-socket.service';

export interface MacroExecutionResult {
  success: boolean;
  message: string;
  diceRolls?: { formula: string; result: number; rolls: number[] }[];
  resourceChanges?: { resource: string; amount: number }[];
  statChanges?: { stat: string; amount: number }[];
}

/**
 * Macro Executor Service
 * Handles execution of macro actions triggered by status effects
 */
@Injectable({
  providedIn: 'root'
})
export class MacroExecutorService {
  private worldSocket = inject(WorldSocketService);

  /**
   * Execute a macro action on a character
   */
  async executeMacro(
    macro: MacroAction,
    character: CharacterSheet,
    sourceStatusEffectName?: string
  ): Promise<MacroExecutionResult> {
    console.log('[MACRO EXECUTOR] Executing macro:', macro.name, 'on character:', character.name);

    switch (macro.actionType) {
      case 'dice_roll':
        return this.executeDiceRoll(macro, character);
      
      case 'apply_damage':
        return this.applyDamage(macro, character);
      
      case 'apply_healing':
        return this.applyHealing(macro, character);
      
      case 'modify_stat':
        return this.modifyStat(macro, character);
      
      case 'modify_resource':
        return this.modifyResource(macro, character);
      
      case 'apply_status':
        return this.applyStatus(macro, character);
      
      case 'remove_status':
        return this.removeStatus(macro, character);
      
      case 'custom_message':
        return this.customMessage(macro, character);
      
      default:
        return {
          success: false,
          message: `Unknown macro action type: ${macro.actionType}`
        };
    }
  }

  /**
   * Execute a dice roll macro
   */
  private async executeDiceRoll(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    const formula = macro.parameters.diceFormula;
    if (!formula) {
      return { success: false, message: 'No dice formula specified' };
    }

    const rollResult = this.rollDice(formula);
    
    // Send dice roll to world socket for display
    this.worldSocket.sendDiceRoll({
      id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      worldName: character.worldName || '',
      characterId: character.id || '',
      characterName: character.name,
      diceType: rollResult.diceType,
      diceCount: rollResult.diceCount,
      rolls: rollResult.rolls,
      result: rollResult.total,
      bonuses: rollResult.bonuses.map(b => ({ name: b, value: rollResult.bonus, source: 'macro' })),
      timestamp: new Date(),
      isSecret: false,
      actionName: macro.parameters.rollName || macro.name,
      actionColor: macro.parameters.rollColor || macro.color
    });

    return {
      success: true,
      message: `Rolled ${formula}: ${rollResult.total}`,
      diceRolls: [{
        formula,
        result: rollResult.total,
        rolls: rollResult.rolls
      }]
    };
  }

  /**
   * Apply damage to character
   */
  private async applyDamage(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    let damage = macro.parameters.amount || 0;
    
    // If dice formula specified, roll for damage
    if (macro.parameters.diceAmount) {
      const rollResult = this.rollDice(macro.parameters.diceAmount);
      damage = rollResult.total;
    }

    // Find health status
    const healthStatus = character.statuses.find(s => s.statusName === 'Leben');
    if (healthStatus) {
      healthStatus.statusCurrent = Math.max(0, healthStatus.statusCurrent - damage);
    }

    return {
      success: true,
      message: `Applied ${damage} damage to ${character.name}`,
      resourceChanges: [{ resource: 'health', amount: -damage }]
    };
  }

  /**
   * Apply healing to character
   */
  private async applyHealing(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    let healing = macro.parameters.amount || 0;
    
    // If dice formula specified, roll for healing
    if (macro.parameters.diceAmount) {
      const rollResult = this.rollDice(macro.parameters.diceAmount);
      healing = rollResult.total;
    }

    // Find health status
    const healthStatus = character.statuses.find(s => s.statusName === 'Leben');
    if (healthStatus) {
      healthStatus.statusCurrent = Math.min(
        healthStatus.statusBase + healthStatus.statusBonus,
        healthStatus.statusCurrent + healing
      );
    }

    return {
      success: true,
      message: `Healed ${character.name} for ${healing} HP`,
      resourceChanges: [{ resource: 'health', amount: healing }]
    };
  }

  /**
   * Modify a stat temporarily
   */
  private async modifyStat(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    const stat = macro.parameters.stat;
    const modifier = macro.parameters.statModifier || 0;

    if (!stat) {
      return { success: false, message: 'No stat specified' };
    }

    // Apply stat modifier
    const statBlock = (character as any)[stat];
    if (statBlock) {
      statBlock.bonus = (statBlock.bonus || 0) + modifier;
    }

    return {
      success: true,
      message: `Modified ${stat} by ${modifier > 0 ? '+' : ''}${modifier}`,
      statChanges: [{ stat, amount: modifier }]
    };
  }

  /**
   * Modify a resource (health, mana, energy, fokus)
   */
  private async modifyResource(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    const resource = macro.parameters.resource;
    let amount = macro.parameters.resourceAmount || 0;

    if (!resource) {
      return { success: false, message: 'No resource specified' };
    }

    // If dice formula specified, roll for amount
    if (macro.parameters.resourceDiceAmount) {
      const rollResult = this.rollDice(macro.parameters.resourceDiceAmount);
      amount = rollResult.total;
    }

    // Map resource names to status names
    const resourceMap: Record<string, string> = {
      health: 'Leben',
      energy: 'Ausdauer',
      mana: 'Mana',
      fokus: 'Fokus'
    };

    const statusName = resourceMap[resource];
    const status = character.statuses.find(s => s.statusName === statusName);
    
    if (status) {
      status.statusCurrent = Math.max(0, Math.min(
        status.statusBase + status.statusBonus,
        status.statusCurrent + amount
      ));
    }

    return {
      success: true,
      message: `Modified ${resource} by ${amount > 0 ? '+' : ''}${amount}`,
      resourceChanges: [{ resource, amount }]
    };
  }

  /**
   * Apply another status effect
   */
  private async applyStatus(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    // This would require access to the library service to look up the status effect
    // For now, just return a message
    return {
      success: true,
      message: `Would apply status effect: ${macro.parameters.statusEffectId}`
    };
  }

  /**
   * Remove a status effect
   */
  private async removeStatus(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    const statusEffectId = macro.parameters.statusEffectId;
    if (!statusEffectId) {
      return { success: false, message: 'No status effect ID specified' };
    }

    // Remove from activeStatusEffects
    if (character.activeStatusEffects) {
      const index = character.activeStatusEffects.findIndex(se => se.statusEffectId === statusEffectId);
      if (index >= 0) {
        character.activeStatusEffects.splice(index, 1);
        return {
          success: true,
          message: `Removed status effect ${statusEffectId}`
        };
      }
    }

    return {
      success: false,
      message: `Status effect ${statusEffectId} not found`
    };
  }

  /**
   * Display a custom message
   */
  private async customMessage(macro: MacroAction, character: CharacterSheet): Promise<MacroExecutionResult> {
    const message = macro.parameters.message || 'Macro triggered';
    
    return {
      success: true,
      message
    };
  }

  /**
   * Roll dice from a formula like "2d6+3"
   */
  private rollDice(formula: string): {
    total: number;
    diceType: number;
    diceCount: number;
    rolls: number[];
    bonus: number;
    bonuses: string[];
  } {
    const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    
    if (!match) {
      // Try parsing as a fixed number
      const fixed = parseInt(formula);
      if (!isNaN(fixed)) {
        return {
          total: fixed,
          diceType: 0,
          diceCount: 0,
          rolls: [],
          bonus: fixed,
          bonuses: []
        };
      }
      
      console.error('Invalid dice formula:', formula);
      return {
        total: 0,
        diceType: 20,
        diceCount: 1,
        rolls: [0],
        bonus: 0,
        bonuses: []
      };
    }

    const count = match[1] ? parseInt(match[1]) : 1;
    const type = parseInt(match[2]);
    const bonus = match[3] ? parseInt(match[3]) : 0;

    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * type) + 1);
    }

    const rollSum = rolls.reduce((sum, roll) => sum + roll, 0);
    const total = rollSum + bonus;

    return {
      total,
      diceType: type,
      diceCount: count,
      rolls,
      bonus,
      bonuses: bonus !== 0 ? [`${bonus > 0 ? '+' : ''}${bonus}`] : []
    };
  }
}
