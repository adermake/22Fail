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
  // Custom cost for active skills (falls back to definition lookup if not set)
  cost?: { type: 'mana' | 'energy' | 'life'; amount: number; perRound?: boolean };
  actionType?: 'Aktion' | 'Bonusaktion' | 'Keine Aktion' | 'Reaktion';
  // Optional inline action macro (overrides cost popup when set)
  embeddedMacro?: import('./action-macro.model').ActionMacro;
}