import { FormulaType } from "./formula-type.enum";


export class StatusBlock {
  statusName!: string;
  statusColor!: string;
  statusBonus!: number;
  statusBase!: number;
  statusCurrent!: number;
  formulaType!: FormulaType;
}