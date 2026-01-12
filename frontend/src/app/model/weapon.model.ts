import { ItemBlock, ItemRequirements } from './item-block.model';

export enum WeaponType {
  LEICHT = 'Leicht',
  SCHWER = 'Schwer',
  FERNKAMPF = 'Fernkampf',
}

export enum DamageType {
  SCHNITT = 'Schnitt',
  STICH = 'Stich',
  WUCHT = 'Wucht',
}

export interface Material {
  name: string;
  type: 'sehr leicht' | 'leicht' | 'mittel' | 'schwer' | 'sehr schwer' | '?';
  rarity: 'sehr häufig' | 'häufig' | 'selten' | 'sehr selten' | '???';
  locations: string[];
  durability: number;
  durabilityModifier: number;
  efficiency: number;
  efficiencyModifier: number;
  stability?: number; // For armor
  stabilityModifier?: number; // For armor
  specialEffect?: string;
}

export interface WeaponBonus {
  name: 'Werfen' | 'Entwaffnen' | 'Zerstören' | 'Vorraussetzung-1' | 'Reichweite x2' | 'Unzerbrechlich';
  level: number;
  cost: number;
}

export class Weapon extends ItemBlock {
  // From base game rules
  durability!: number;
  efficiency!: number;
  range!: number;
  weaponType!: WeaponType;
  damageType!: DamageType;
  
  // For crafting
  primaryMaterial!: Material;
  secondaryMaterial!: Material;
  additiveMaterial!: Material;
  craftingPointsUsed!: number;
  bonuses: WeaponBonus[] = [];
  
  // Generated name
  generatedName!: string;
}

export interface BaseWeaponType {
    name: string;
    damageType: DamageType;
    range: number;
    type: WeaponType;
}
