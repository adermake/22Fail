export class StatBlock {
  name!: string;
  bonus!: number;
  base!: number;
  gain!: number;
  free!: number;  // Free stat points allocated to this stat
  current!: number;
  effectBonus?: number; // Auto-calculated from skills/items

  constructor(name: string, base: number, gain: number = 0, bonus: number = 0) {
    this.base = base;
    this.gain = gain;
    this.bonus = bonus;
    this.name = name;
    this.free = 0;
    this.current = 1;
    this.effectBonus = 0;
  }
}