import { FormulaType } from "./formula-type.enum";


export class SkillBlock {
  name!: string;
  class!: string;
  description!: string;
  type!: 'active' | 'passive'; 
  enlightened!: boolean;
  level?: number;  // How many times this skill has been learned (for infiniteLevel skills)
  skillId?: string;  // Reference to the skill definition ID
}