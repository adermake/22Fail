/**
 * Builds a FailScript CharacterContext from a real CharacterSheet, resolving every symbol
 * through TrueStatsService (the canonical calculator) so scripts always see effective
 * values including skills, equipment and status effects. NPCs in the lobby are already
 * converted to a synthetic sheet (see lobby-bottom-panel `sheetForMacros`), so this single
 * sheet-based path covers both players and NPCs.
 */

import { CharacterSheet } from '../model/character-sheet-model';
import { StatBlock } from '../model/stat-block.model';
import { FormulaType } from '../model/formula-type.enum';
import { TrueStatsService } from '../services/true-stats.service';
import { TALENT_DEFINITIONS } from '../data/talent-definitions';
import { computeSkillTalentBonusBreakdown } from '../utils/skill-talent-bonus.utils';
import { CharacterContext } from './interpreter';

type StatKey = 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill';

/** Map a FailScript attribute name to the sheet's StatBlock key (`wille` → `chill`). */
const ATTR_TO_STATKEY: Record<string, StatKey> = {
  strength: 'strength', dexterity: 'dexterity', speed: 'speed',
  intelligence: 'intelligence', constitution: 'constitution', wille: 'chill',
};

export function createPlayerContext(
  sheet: CharacterSheet,
  trueStats: TrueStatsService,
  inCombat: boolean,
  rng: () => number = Math.random,
): CharacterContext {
  const resourceCurrent = (ft: FormulaType) => sheet.statuses?.find(s => s.formulaType === ft)?.statusCurrent ?? 0;

  const scalars: Record<string, () => number | string> = {
    // Attributes
    strength: () => trueStats.calculateStrength(sheet),
    dexterity: () => trueStats.calculateDexterity(sheet),
    speed: () => trueStats.calculateSpeed(sheet),
    intelligence: () => trueStats.calculateIntelligence(sheet),
    constitution: () => trueStats.calculateConstitution(sheet),
    wille: () => trueStats.calculateWille(sheet),
    // Level / class
    level: () => sheet.level || 1,
    primaryClass: () => sheet.primary_class ?? '',
    secondaryClass: () => sheet.secondary_class ?? '',
    // Resources
    health: () => resourceCurrent(FormulaType.LIFE),
    healthMax: () => trueStats.calculateResourceMax(sheet, FormulaType.LIFE),
    energy: () => resourceCurrent(FormulaType.ENERGY),
    energyMax: () => trueStats.calculateResourceMax(sheet, FormulaType.ENERGY),
    mana: () => resourceCurrent(FormulaType.MANA),
    manaMax: () => trueStats.calculateResourceMax(sheet, FormulaType.MANA),
    fokus: () => trueStats.calculateFokusMax(sheet),
    fokusMax: () => trueStats.calculateFokusMax(sheet),
    // Derived
    movement: () => trueStats.calculateMovementSpeed(sheet),
    grundbonus: () => trueStats.calculateGrundbonus(sheet),
    reaktion: () => trueStats.calculateReaktionswert(sheet),
    armorMalus: () => trueStats.calculateTotalSpeedMalus(sheet),
    armorNegation: () => trueStats.calculateSpeedPenaltyNegation(sheet),
    effectiveSpeed: () => trueStats.calculateEffectiveSpeed(sheet),
    baseSpeed: () => trueStats.calculateSpeed(sheet),
    totalArmorDebuff: () => trueStats.calculateTotalArmorDebuff(sheet),
    speedPenaltyNegation: () => trueStats.calculateSpeedPenaltyNegation(sheet),
    encumbrancePercent: () => Math.round(trueStats.getEncumbrancePercentage(sheet)),
    totalWeight: () => trueStats.getTotalWeight(sheet),
    maxCapacity: () => trueStats.getMaxCapacity(sheet),
    // Currency
    copper: () => sheet.currency?.copper ?? 0,
    silver: () => sheet.currency?.silver ?? 0,
    gold: () => sheet.currency?.gold ?? 0,
    platinum: () => sheet.currency?.platinum ?? 0,
  };

  return {
    rng,
    inCombat: () => inCombat,
    readScalar: (name) => scalars[name]?.() ?? 0,
    readAttributeMember: (attr, prop) => {
      const key = ATTR_TO_STATKEY[attr];
      if (!key) return 0;
      switch (prop) {
        case 'modifier': return trueStats.calculateStatModifier(sheet, key);
        case 'diceModifier': return trueStats.calculateStatDiceModifier(sheet, key);
        case 'base': return (sheet[key] as StatBlock)?.base ?? 0;
        case 'current': return trueStats.calculateStat(sheet, sheet[key] as StatBlock, key);
        default: return 0;
      }
    },
    readTalent: (id) => {
      const def = TALENT_DEFINITIONS.find(t => t.id === id);
      if (!def) return 0;
      const statMod = trueStats.calculateStatModifier(sheet, def.stat as StatKey);
      const rank = (sheet.talentRanks ?? {})[id] ?? 0;
      const skillBonus = computeSkillTalentBonusBreakdown(sheet).get(id as never)?.total ?? 0;
      const statusBonus = trueStats.getStatusTalentBonus(sheet, id);
      return -(statMod + rank + skillBonus + statusBonus);
    },
  };
}
