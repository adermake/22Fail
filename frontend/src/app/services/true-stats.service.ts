import { Injectable } from '@angular/core';
import { CharacterSheet } from '../model/character-sheet-model';
import { StatBlock } from '../model/stat-block.model';

/**
 * All calculated stat values for a character.
 */
export interface CalculatedStats {
  strength: number;
  dexterity: number;
  speed: number;
  intelligence: number;
  constitution: number;
  chill: number;
}

/**
 * Detailed breakdown of a stat calculation.
 */
export interface CalculatedStatDetails {
  base: number;
  bonus: number;
  gain: number;
  level: number;
  levelBonus: number;
  effectBonus: number;
  total: number;
}

/**
 * Source of a stat modifier for display purposes.
 */
export interface StatModifierSource {
  name: string;
  amount: number;
  type: 'skill' | 'equipment';
}

type StatKey = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';

/**
 * TrueStatsService - Centralized stat calculation service.
 * 
 * This service provides the canonical implementation for calculating character stats.
 * All stat calculations should go through this service to ensure consistency.
 * 
 * The formula is: (base + bonus + effectBonus + (gain * level)) | 0
 * 
 * Where:
 * - base: The character's base stat value
 * - bonus: Manual bonus added by user
 * - gain: Per-level stat increase (from race)
 * - level: Character's current level
 * - effectBonus: Sum of bonuses from skills (multiplied by skill level) and equipped items
 */
@Injectable({
  providedIn: 'root'
})
export class TrueStatsService {
  
  /**
   * Calculate the effect bonus for a specific stat from skills and equipment.
   * This matches the logic in stat.component.ts effectBonus getter.
   * 
   * @param sheet The character sheet
   * @param statKey The stat to calculate ('strength', 'dexterity', etc.)
   * @returns The total effect bonus from all sources
   */
  calculateEffectBonus(sheet: CharacterSheet, statKey: StatKey): number {
    let total = 0;

    // Add bonuses from skills (multiplied by skill level)
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              total += modifier.amount * multiplier;
            }
          }
        }
      }
    }

    // Add bonuses from equipped items
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              total += modifier.amount;
            }
          }
        }
      }
    }

    return total;
  }

  /**
   * Get all sources contributing to a stat's effect bonus.
   * Useful for displaying tooltips showing where bonuses come from.
   * 
   * @param sheet The character sheet
   * @param statKey The stat to get sources for
   * @returns Array of modifier sources with their names and amounts
   */
  getEffectBonusSources(sheet: CharacterSheet, statKey: StatKey): StatModifierSource[] {
    const sources: StatModifierSource[] = [];

    // Collect sources from skills
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              const amount = modifier.amount * multiplier;
              sources.push({
                name: skill.name,
                amount,
                type: 'skill'
              });
            }
          }
        }
      }
    }

    // Collect sources from equipment
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              sources.push({
                name: item.name,
                amount: modifier.amount,
                type: 'equipment'
              });
            }
          }
        }
      }
    }

    return sources;
  }

  /**
   * Calculate a single stat's true value.
   * Formula: (base + bonus + effectBonus + (gain * level)) | 0
   * 
   * @param sheet The character sheet
   * @param stat The stat block to calculate
   * @param statKey The stat key for effect bonus lookup
   * @returns The calculated stat value
   */
  calculateStat(sheet: CharacterSheet, stat: StatBlock | undefined, statKey: StatKey): number {
    if (!stat) return 10; // Default fallback
    
    const base = stat.base || 0;
    const bonus = stat.bonus || 0;
    const gain = stat.gain || 0;
    const level = sheet.level || 1;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    
    return (base + bonus + effectBonus + (gain * level)) | 0;
  }

  /**
   * Calculate a stat with full breakdown details.
   * Useful for debugging or displaying detailed stat information.
   * 
   * @param sheet The character sheet
   * @param stat The stat block to calculate
   * @param statKey The stat key for effect bonus lookup
   * @returns Detailed breakdown of the calculation
   */
  calculateStatDetails(sheet: CharacterSheet, stat: StatBlock | undefined, statKey: StatKey): CalculatedStatDetails {
    const base = stat?.base || 0;
    const bonus = stat?.bonus || 0;
    const gain = stat?.gain || 0;
    const level = sheet.level || 1;
    const levelBonus = gain * level;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    const total = (base + bonus + effectBonus + levelBonus) | 0;
    
    return { base, bonus, gain, level, levelBonus, effectBonus, total };
  }

  /**
   * Get all calculated stats for a character.
   * 
   * @param sheet The character sheet
   * @returns All six stats calculated
   */
  getAllStats(sheet: CharacterSheet): CalculatedStats {
    return {
      strength: this.calculateStat(sheet, sheet.strength, 'strength'),
      dexterity: this.calculateStat(sheet, sheet.dexterity, 'dexterity'),
      speed: this.calculateStat(sheet, sheet.speed, 'speed'),
      intelligence: this.calculateStat(sheet, sheet.intelligence, 'intelligence'),
      constitution: this.calculateStat(sheet, sheet.constitution, 'constitution'),
      chill: this.calculateStat(sheet, sheet.chill, 'chill'),
    };
  }

  /**
   * Calculate speed for battle/movement purposes.
   * This is the most commonly needed stat calculation.
   * IMPORTANT: This returns base speed WITHOUT penalties.
   * For actual movement speed, use calculateEffectiveSpeed()
   * 
   * @param sheet The character sheet
   * @returns The calculated base speed value
   */
  calculateSpeed(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.speed, 'speed');
  }

  /**
   * Calculate strength.
   */
  calculateStrength(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.strength, 'strength');
  }

  /**
   * Calculate dexterity.
   */
  calculateDexterity(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.dexterity, 'dexterity');
  }

  /**
   * Calculate intelligence.
   */
  calculateIntelligence(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.intelligence, 'intelligence');
  }

  /**
   * Calculate constitution.
   */
  calculateConstitution(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.constitution, 'constitution');
  }

  /**
   * Calculate chill.
   */
  calculateChill(sheet: CharacterSheet): number {
    return this.calculateStat(sheet, sheet.chill, 'chill');
  }

  /**
   * Calculate the D&D-style modifier for a stat.
   * Formula: (-5 + total / 2) | 0
   * 
   * This gives:
   * - Stat 10 = +0 modifier
   * - Stat 12 = +1 modifier
   * - Stat 8 = -1 modifier
   * 
   * @param sheet The character sheet
   * @param statKey The stat to calculate modifier for
   * @returns The dice roll modifier
   */
  calculateStatModifier(sheet: CharacterSheet, statKey: StatKey): number {
    const statBlock = sheet[statKey] as StatBlock;
    const total = this.calculateStat(sheet, statBlock, statKey);
    return (-5 + total / 2) | 0;
  }

  /**
   * Calculate effective speed after all penalties.
   * Takes into account:
   * - Armor debuff from equipped items
   * - Encumbrance penalty from inventory weight
   * - Speed penalty negation (reduces both penalties)
   * 
   * Rules:
   * - Armor: Each equipped item may have armorDebuff field
   * - Encumbrance: 80-99% = half speed, 100%+ = speed becomes 0
   * - Negation: speedPenaltyNegation reduces total penalty (but can't make speed higher than base)
   * 
   * @param sheet The character sheet
   * @returns Speed after all penalties
   */
  calculateEffectiveSpeed(sheet: CharacterSheet): number {
    const baseSpeed = this.calculateSpeed(sheet);
    
    // Armor penalty
    const armorDebuff = this.calculateTotalArmorDebuff(sheet);
    
    // Encumbrance penalty
    const encumbrancePenalty = this.calculateEncumbrancePenalty(sheet, baseSpeed);
    
    // Total penalty before negation
    const totalPenalty = armorDebuff + encumbrancePenalty;
    
    // Apply speed penalty negation (can reduce penalty but not create bonus speed)
    const negation = sheet.speedPenaltyNegation || 0;
    const finalPenalty = Math.max(0, totalPenalty - negation);
    
    // Apply penalty to base speed
    return Math.max(0, baseSpeed - finalPenalty);
  }

  /**
   * Calculate encumbrance penalty from inventory weight.
   * 
   * Rules:
   * - < 80% capacity: No penalty
   * - 80-99% capacity: Half of current speed
   * - >= 100% capacity: All speed (becomes 0)
   * 
   * @param sheet The character sheet
   * @param currentSpeed The current base speed (before encumbrance)
   * @returns Speed penalty from being over-encumbered
   */
  private calculateEncumbrancePenalty(sheet: CharacterSheet, currentSpeed: number): number {
    const percentage = this.getEncumbrancePercentage(sheet);
    
    if (percentage < 80) {
      return 0; // No penalty
    } else if (percentage < 100) {
      return Math.floor(currentSpeed / 2); // Half speed penalty
    } else {
      return currentSpeed; // All speed (becomes 0)
    }
  }

  /**
   * Calculate encumbrance percentage.
   * 
   * @param sheet The character sheet
   * @returns Percentage of max capacity being used (0-100+)
   */
  getEncumbrancePercentage(sheet: CharacterSheet): number {
    const totalWeight = this.getTotalWeight(sheet);
    const maxCapacity = this.getMaxCapacity(sheet);
    
    if (maxCapacity === 0) return 100; // Avoid division by zero
    return (totalWeight / maxCapacity) * 100;
  }

  /**
   * Calculate total inventory weight including currency.
   * 
   * @param sheet The character sheet
   * @returns Total weight in pounds/kg
   */
  getTotalWeight(sheet: CharacterSheet): number {
    // Item weight
    const itemWeight = sheet.inventory?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
    
    // Currency weight (using COIN_WEIGHT constant)
    const COIN_WEIGHT = 0.02; // 50 coins per pound
    const currencyWeight = sheet.currency ? (
      (sheet.currency.copper || 0) +
      (sheet.currency.silver || 0) +
      (sheet.currency.gold || 0) +
      (sheet.currency.platinum || 0)
    ) * COIN_WEIGHT : 0;
    
    return Math.floor(itemWeight + currencyWeight);
  }

  /**
   * Calculate maximum carry capacity.
   * Formula: (strength * 8) * multiplier + bonus
   * 
   * @param sheet The character sheet
   * @returns Maximum carry capacity
   */
  getMaxCapacity(sheet: CharacterSheet): number {
    const strength = this.calculateStrength(sheet);
    const baseCapacity = strength * 8;
    const multiplier = sheet.carryCapacityMultiplier || 1;
    const bonus = sheet.carryCapacityBonus || 0;
    
    return Math.floor(baseCapacity * multiplier + bonus);
  }

  /**
   * Calculate total armor debuff from equipped items.
   * 
   * @param sheet The character sheet
   * @returns Total speed penalty from armor
   */
  calculateTotalArmorDebuff(sheet: CharacterSheet): number {
    if (!sheet.equipment) return 0;
    return sheet.equipment.reduce((sum, item) => sum + (item.armorDebuff || 0), 0);
  }

  /**
   * Check if a character meets the stat requirements for an item.
   * 
   * @param sheet The character sheet
   * @param requirements Object with stat requirements
   * @returns True if all requirements are met
   */
  meetsRequirements(
    sheet: CharacterSheet, 
    requirements: Partial<Record<StatKey, number>>
  ): boolean {
    for (const [statKey, required] of Object.entries(requirements)) {
      if (required) {
        const statBlock = sheet[statKey as StatKey] as StatBlock;
        const current = this.calculateStat(sheet, statBlock, statKey as StatKey);
        if (current < required) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Update the .current property on all stat blocks.
   * Call this after making changes to ensure cached values are fresh.
   * 
   * @param sheet The character sheet to update
   */
  updateCurrentValues(sheet: CharacterSheet): void {
    const stats = this.getAllStats(sheet);
    
    if (sheet.strength) sheet.strength.current = stats.strength;
    if (sheet.dexterity) sheet.dexterity.current = stats.dexterity;
    if (sheet.speed) sheet.speed.current = stats.speed;
    if (sheet.intelligence) sheet.intelligence.current = stats.intelligence;
    if (sheet.constitution) sheet.constitution.current = stats.constitution;
    if (sheet.chill) sheet.chill.current = stats.chill;
  }
}
