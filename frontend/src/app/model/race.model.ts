import { SkillBlock } from './skill-block.model';

/**
 * A skill that unlocks at a certain level for a race
 */
export interface RaceSkill {
  levelRequired: number;
  skill: SkillBlock;
}

/**
 * Race definition - shared globally across all character sheets
 */
export interface Race {
  id: string;              // Unique identifier
  name: string;            // Display name
  baseImage?: string;      // Image for selection screen
  ageRange: string;        // e.g., "60-80"
  lore: string;            // Lore/description text

  // Base stats at level 1
  baseHealth: number;
  baseEnergy: number;
  baseMana: number;
  baseStrength: number;
  baseDexterity: number;
  baseSpeed: number;
  baseIntelligence: number;
  baseConstitution: number;
  baseChill: number;

  // Stat gains per level
  healthPerLevel: number;
  energyPerLevel: number;
  manaPerLevel: number;
  strengthPerLevel: number;
  dexterityPerLevel: number;
  speedPerLevel: number;
  intelligencePerLevel: number;
  constitutionPerLevel: number;
  chillPerLevel: number;

  // Skills that unlock at certain levels
  skills: RaceSkill[];
}

/**
 * Create a new empty race with default values
 */
export function createEmptyRace(): Race {
  return {
    id: '',
    name: '',
    baseImage: '',
    ageRange: '20-80',
    lore: '',
    baseHealth: 80,
    baseEnergy: 50,
    baseMana: 40,
    baseStrength: 10,
    baseDexterity: 10,
    baseSpeed: 10,
    baseIntelligence: 10,
    baseConstitution: 10,
    baseChill: 10,
    healthPerLevel: 5,
    energyPerLevel: 3,
    manaPerLevel: 2,
    strengthPerLevel: 0,
    dexterityPerLevel: 0,
    speedPerLevel: 0,
    intelligencePerLevel: 0,
    constitutionPerLevel: 0,
    chillPerLevel: 0,
    skills: [],
  };
}
