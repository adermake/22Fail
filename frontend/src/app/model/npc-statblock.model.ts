import { ItemBlock } from './item-block.model';
import { SkillBlock } from './skill-block.model';
import { SpellBlock } from './spell-block-model';

// ─── Archetyp ────────────────────────────────────────────────────────────────

export type NpcArchetype =
  | 'fighter'
  | 'tank'
  | 'mage'
  | 'healer'
  | 'rogue'
  | 'ranger'
  | 'allrounder';

export interface NpcArchetypeDefinition {
  id: NpcArchetype;
  label: string;
  icon: string;
  /** Empfohlene Primärklasse für Auto-Skill */
  primaryClass: string;
  /** Empfohlene Sekundärklasse für Auto-Skill */
  secondaryClass: string;
  /** Gewichtung der freien Statpunkte (Summe = 100) */
  statWeights: {
    strength: number;
    dexterity: number;
    speed: number;
    intelligence: number;
    constitution: number;
    wille: number;
  };
  /** Ausrüstungsbudget-Verteilung in % */
  gearSpread: {
    weapon: number;
    armor: number;
    accessory: number;
  };
}

export const NPC_ARCHETYPES: NpcArchetypeDefinition[] = [
  {
    id: 'fighter',
    label: 'Krieger',
    icon: '⚔️',
    primaryClass: 'Kämpfer',
    secondaryClass: 'Krieger',
    statWeights: { strength: 35, constitution: 25, dexterity: 15, speed: 15, intelligence: 5, wille: 5 },
    gearSpread: { weapon: 60, armor: 30, accessory: 10 },
  },
  {
    id: 'tank',
    label: 'Tank',
    icon: '🛡️',
    primaryClass: 'Krieger',
    secondaryClass: 'Ritter',
    statWeights: { constitution: 40, strength: 25, wille: 15, speed: 10, dexterity: 5, intelligence: 5 },
    gearSpread: { weapon: 30, armor: 60, accessory: 10 },
  },
  {
    id: 'mage',
    label: 'Magier',
    icon: '✨',
    primaryClass: 'Magier',
    secondaryClass: 'Arkanist',
    statWeights: { intelligence: 40, wille: 25, constitution: 15, dexterity: 10, speed: 5, strength: 5 },
    gearSpread: { weapon: 50, armor: 20, accessory: 30 },
  },
  {
    id: 'healer',
    label: 'Heiler',
    icon: '💚',
    primaryClass: 'Heiler',
    secondaryClass: 'Paladin',
    statWeights: { intelligence: 30, wille: 30, constitution: 20, speed: 10, dexterity: 5, strength: 5 },
    gearSpread: { weapon: 30, armor: 30, accessory: 40 },
  },
  {
    id: 'rogue',
    label: 'Dieb',
    icon: '🗡️',
    primaryClass: 'Techniker',
    secondaryClass: 'Dieb',
    statWeights: { dexterity: 35, speed: 30, strength: 15, constitution: 10, intelligence: 5, wille: 5 },
    gearSpread: { weapon: 70, armor: 20, accessory: 10 },
  },
  {
    id: 'ranger',
    label: 'Schütze',
    icon: '🏹',
    primaryClass: 'Schütze',
    secondaryClass: 'Jäger',
    statWeights: { dexterity: 30, speed: 25, intelligence: 15, constitution: 15, strength: 10, wille: 5 },
    gearSpread: { weapon: 65, armor: 25, accessory: 10 },
  },
  {
    id: 'allrounder',
    label: 'Allrounder',
    icon: '⭐',
    primaryClass: 'Kämpfer',
    secondaryClass: 'Magier',
    statWeights: { strength: 20, dexterity: 15, speed: 15, constitution: 20, intelligence: 20, wille: 10 },
    gearSpread: { weapon: 50, armor: 30, accessory: 20 },
  },
];

// ─── Statblock ────────────────────────────────────────────────────────────────

export interface NpcStatblock {
  name: string;
  mode: 'humanoid' | 'custom';

  // Identität
  raceId?: string;
  raceName: string;
  level: number;
  archetype?: NpcArchetype;
  notes: string;

  // Ressourcen
  maxHealth: number;
  maxMana: number;
  maxEnergy: number;

  // Basiswerte
  strength: number;
  dexterity: number;
  speed: number;
  intelligence: number;
  constitution: number;
  wille: number;

  // Abgeleitete Werte (berechnet oder manuell überschrieben)
  fokus: number;
  fokusOverride: boolean;
  reaktionswert: number;
  reaktionswertOverride: boolean;
  grundbonus: number;
  grundbonusOverride: boolean;

  // Fertigkeiten aus dem Talentbaum
  learnedSkillIds: string[];

  // Manuell hinzugefügte Fertigkeiten
  customSkills: SkillBlock[];

  // Zauber
  spells: SpellBlock[];

  // Ausrüstung
  equipment: ItemBlock[];

  // Token-Bild
  defaultPortrait?: string; // Image ID used as token head when dragging onto map

  // Auto-Generierungseinstellungen (Humanoid)
  primaryClassTarget: string;
  secondaryClassTarget: string;
  classWeight: number;    // 0–100: Anteil für Primärklasse
  gearBudget: number;     // Gold-Budget für Ausrüstung

  // Ausrüstungs-Verteilung in %
  gearSpreadWeapon: number;
  gearSpreadArmor: number;
  gearSpreadAccessory: number;
}

export function createEmptyNpcStatblock(): NpcStatblock {
  return {
    name: 'Neues NSC',
    mode: 'humanoid',
    raceId: undefined,
    raceName: '',
    level: 1,
    archetype: 'fighter',
    notes: '',
    maxHealth: 80,
    maxMana: 40,
    maxEnergy: 50,
    strength: 10,
    dexterity: 10,
    speed: 10,
    intelligence: 10,
    constitution: 10,
    wille: 10,
    fokus: 10,
    fokusOverride: false,
    reaktionswert: 8,
    reaktionswertOverride: false,
    grundbonus: 0,
    grundbonusOverride: false,
    learnedSkillIds: [],
    customSkills: [],
    spells: [],
    equipment: [],
    primaryClassTarget: 'Kämpfer',
    secondaryClassTarget: '',
    classWeight: 80,
    gearBudget: 100,
    gearSpreadWeapon: 60,
    gearSpreadArmor: 30,
    gearSpreadAccessory: 10,
  };
}
