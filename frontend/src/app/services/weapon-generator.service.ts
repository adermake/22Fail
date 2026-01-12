import { Injectable } from '@angular/core';
import {
  Weapon,
  WeaponType,
  Material,
  BaseWeaponType,
  DamageType,
} from '../model/weapon.model';
import { Armor, ArmorType } from '../model/armor.model';
import { WEAPON_MATERIALS } from '../data/materials.data';
import { ARMOR_MATERIALS } from '../data/armor-materials.data';
import { BASE_WEAPON_TYPES } from '../data/weapons.data';
import { ItemRequirements } from '../model/item-block.model';

@Injectable({
  providedIn: 'root',
})
export class WeaponGeneratorService {
  private namePrefixes = [
    'Mächtige(r)',
    'Verfluchte(r)',
    'Gesegnete(r)',
    'Alte(r)',
    'Meisterlich gefertigte(r)',
    'Brutale(r)',
    'Elegante(r)',
    'Tödliche(r)',
    'Rostige(r)',
    'Leuchtende(r)',
    'Dämonische(r)',
    'Himmlische(r)',
  ];
  private nameSuffixes = [
    'der Verdammnis',
    'des Lichts',
    'der Zerstörung',
    'des Schutzes',
    'aus der Tiefe',
    'des Königs',
    'der alten Götter',
    'des Chaos',
    'der Ordnung',
    'des Blutes',
  ];

  constructor() {}

  public generateWeapon(level: number, weaponType?: WeaponType): Weapon {
    const weapon = new Weapon();

    // 1. Select base weapon type
    let baseTypes = BASE_WEAPON_TYPES;
    if (weaponType) {
      baseTypes = baseTypes.filter((t) => t.type === weaponType);
    }
    const baseType = this.getRandomElement(baseTypes);
    weapon.weaponType = baseType.type;
    weapon.damageType = baseType.damageType;
    weapon.range = baseType.range;
    weapon.weight = this.getWeightFromType(baseType.type);


    // 2. Select materials
    // For now, just random. Later we can add logic based on level.
    const primaryMaterial = this.getRandomElement(WEAPON_MATERIALS);
    const secondaryMaterial = this.getRandomElement(WEAPON_MATERIALS);
    const additiveMaterial = this.getRandomElement(WEAPON_MATERIALS);
    weapon.primaryMaterial = primaryMaterial;
    weapon.secondaryMaterial = secondaryMaterial;
    weapon.additiveMaterial = additiveMaterial;

    // 3. Calculate stats
    weapon.durability =
      primaryMaterial.durability + Math.floor(secondaryMaterial.durability / 2);
    weapon.efficiency =
      primaryMaterial.efficiency + Math.floor(secondaryMaterial.efficiency / 2);

    // 4. Apply crafting points (SP)
    const craftingPoints = 10 + this.rollD20();
    // TODO: Implement logic to spend points
    weapon.craftingPointsUsed = 0; // for now

    // 5. Calculate Requirements
    weapon.requirements = this.calculateRequirements(weapon.durability, weapon.efficiency);
    
    // 6. Generate Name
    weapon.generatedName = this.generateName(baseType, primaryMaterial);
    weapon.name = weapon.generatedName;

    // 7. Generate Description
    weapon.description = this.generateDescription(weapon);

    return weapon;
  }

  public generateArmor(level: number, armorType?: ArmorType): Armor {
    const armor = new Armor();

    // 1. Select armor type
    const baseType = armorType || this.getRandomElement(Object.values(ArmorType));
    armor.armorType = baseType;
    armor.weight = this.getWeightFromType(baseType);

    // 2. Select materials
    const primaryMaterial = this.getRandomElement(ARMOR_MATERIALS);
    const secondaryMaterial = this.getRandomElement(ARMOR_MATERIALS);
    const additiveMaterial = this.getRandomElement(ARMOR_MATERIALS);
    armor.primaryMaterial = primaryMaterial;
    armor.secondaryMaterial = secondaryMaterial;
    armor.additiveMaterial = additiveMaterial;

    // 3. Calculate stats
    armor.durability = primaryMaterial.durability + Math.floor(secondaryMaterial.durability / 2);
    armor.stability = (primaryMaterial.stability || 0) + Math.floor((secondaryMaterial.stability || 0) / 2);

    // 4. Apply crafting points (SP)
    const craftingPoints = 10 + this.rollD20();
    // TODO: Implement logic to spend points
    armor.craftingPointsUsed = 0;

    // 5. Calculate Requirements
    armor.requirements = {}; // TODO: Armor requirements

    // 6. Generate Name
    armor.generatedName = `${primaryMaterial.name}-${baseType}`;
    armor.name = armor.generatedName;

    // 7. Generate Description
    armor.description = this.generateArmorDescription(armor);

    return armor;
  }

  private generateArmorDescription(armor: Armor): string {
    let desc = `Eine Rüstung vom Typ ${armor.armorType}.`;
    desc += ` Hergestellt aus ${armor.primaryMaterial.name}, ${armor.secondaryMaterial.name} und ${armor.additiveMaterial.name}.`;
    if(armor.primaryMaterial.specialEffect) desc += `\nPrimär-Effekt: ${armor.primaryMaterial.specialEffect}`;
    if(armor.secondaryMaterial.specialEffect) desc += `\nSekundär-Effekt: ${armor.secondaryMaterial.specialEffect}`;
    if(armor.additiveMaterial.specialEffect) desc += `\nZusatz-Effekt: ${armor.additiveMaterial.specialEffect}`;
    return desc;
  }

  private generateName(baseType: BaseWeaponType, material: Material): string {
      const prefix = this.getRandomElement(this.namePrefixes);
      const suffix = this.getRandomElement(this.nameSuffixes);
      
      // Add 's' to material name if it ends with a consonant
      let materialName = material.name;
      if (!['a','e','i','o','u'].includes(materialName.slice(-1).toLowerCase())) {
        materialName += 's';
      }

      const format = this.rollDie(4);
      switch(format) {
        case 1:
            return `${material.name}-${baseType.name}`;
        case 2:
            return `${prefix} ${baseType.name}`;
        case 3:
            return `${baseType.name} ${suffix}`;
        case 4:
            return `${prefix} ${material.name}-${baseType.name} ${suffix}`;
        default:
            return `${material.name}-${baseType.name}`;
      }
  }

  private generateDescription(weapon: Weapon): string {
    let desc = `Eine Waffe vom Typ ${weapon.weaponType}.`;
    desc += ` Hergestellt aus ${weapon.primaryMaterial.name}, ${weapon.secondaryMaterial.name} und ${weapon.additiveMaterial.name}.`;
    if(weapon.primaryMaterial.specialEffect) desc += `\nPrimär-Effekt: ${weapon.primaryMaterial.specialEffect}`;
    if(weapon.secondaryMaterial.specialEffect) desc += `\nSekundär-Effekt: ${weapon.secondaryMaterial.specialEffect}`;
    if(weapon.additiveMaterial.specialEffect) desc += `\nZusatz-Effekt: ${weapon.additiveMaterial.specialEffect}`;
    return desc;
  }

  private calculateRequirements(durability: number, efficiency: number): ItemRequirements {
    // Formel: [5+Haltbarkeit/20+Effizienz/2]
    const requirementValue = Math.floor(5 + durability / 20 + efficiency / 2);
    // For now, let's just apply it to strength. This could be more sophisticated.
    return { strength: requirementValue };
  }

  private getWeightFromType(type: WeaponType | ArmorType): number {
      switch(type) {
          case WeaponType.LEICHT: return this.rollDie(5) + 2; // 3-7
          case WeaponType.SCHWER: return this.rollDie(10) + 10; // 11-20
          case WeaponType.FERNKAMPF: return this.rollDie(6) + 4; // 5-10
          case ArmorType.HELMET: return this.rollDie(4) + 1; // 2-5
          case ArmorType.CHEST: return this.rollDie(10) + 8; // 9-18
          case ArmorType.LEGGINGS: return this.rollDie(6) + 6; // 7-12
          case ArmorType.BOOTS: return this.rollDie(3) + 1; // 2-4
          case ArmorType.GAUNTLETS: return this.rollDie(2) + 1; // 2-3
      }
  }

  private getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

  private rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }
}
