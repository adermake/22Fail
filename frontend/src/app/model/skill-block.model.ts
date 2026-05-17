import { FormulaType } from "./formula-type.enum";

export interface StatModifier {
  stat: 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'chill' | 'mana' | 'life' | 'energy';
  amount: number;
}

export class SkillBlock {
  name!: string;
  class!: string;
  description!: string;
  type!: 'active' | 'passive' | 'dice_bonus' | 'stat_bonus';
  enlightened!: boolean;
  level?: number;
  skillId?: string;
  statModifiers?: StatModifier[];
  libraryOrigin?: string;
  libraryOriginName?: string;
  // Source category
  skillSource?: 'class' | 'race' | 'custom';
  // User-set disabled flag (DM can disable individual skills)
  disabled?: boolean;
  // Custom cost for active skills (falls back to definition lookup if not set)
  cost?: { type: 'mana' | 'energy' | 'life'; amount: number; perRound?: boolean };
  actionType?: 'Aktion' | 'Bonusaktion' | 'Keine Aktion' | 'Reaktion';
  // Optional inline action macro (overrides cost popup when set)
  embeddedMacro?: import('./action-macro.model').ActionMacro;
  // Simpler skill macro (MacroAction, configured in editor)
  embeddedMacroAction?: import('./macro-action.model').MacroAction;
  // Set when this skill was granted by a race (holds race id) - used for cleanup on race change
  sourceRaceId?: string;
}