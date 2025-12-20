import { FormulaType } from "./formula-type.enum";


export class SkillBlock {
  name!: string;
  class!: string;
  description!: string;
  type!: 'active' | 'passive'; 
  enlightened!: boolean; 
}