export class StatBlock {
  name!: string;
  bonus!: number;
  base!: number;
  gain!: number;
  current!: number;

  constructor(name: string, base: number, gain: number = 0, bonus: number = 0) {
    this.base = base;
    this.gain = gain;
    this.bonus = bonus;
    this.name = name;
    this.current = 1;
  }
}