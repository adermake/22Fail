import { SkillBlock } from './skill-block.model';

// Re-export SkillBlock for convenience
export { SkillBlock } from './skill-block.model';

/**
 * A rack of racial skills that unlock at one level. Every skill sharing a level lives in ONE group
 * and is rendered as a single row — with more than one entry the player picks exactly one of them
 * (`isChoice` is derived from the count by `normalizeRace`, never authored by hand).
 */
export interface RaceSkill {
  levelRequired: number;
  skills: SkillBlock[];    // Array of skill options to choose from
  isChoice: boolean;       // Derived: skills.length > 1
}

/** Where a racial ability sits: always-on boon, always-on drawback, or a level-gated pick. */
export type RaceAbilityCategory = 'advantage' | 'disadvantage' | 'skill';

/**
 * Race definition - shared globally across all character sheets
 */
export interface Race {
  id: string;              // Unique identifier
  name: string;            // Display name
  baseImage?: string;      // Image for selection screen
  ageRange: string;        // e.g., "60-80"
  size: string;            // e.g., "1.7m" or "0.3-1.5m"
  weight: string;          // e.g., "mittel", "leicht", "schwer"
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

  /** Always-on boons: granted the moment the race is chosen, never selectable. */
  advantages?: SkillBlock[];
  /** Always-on drawbacks: granted the moment the race is chosen, never selectable. */
  disadvantages?: SkillBlock[];

  // Skills that unlock at certain levels (one group per level)
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
    size: '1.7m',
    weight: 'mittel',
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
    advantages: [],
    disadvantages: [],
    skills: [],
  };
}

/**
 * Repair whatever shape a race arrives in — old files, hand-written JSON, importer output —
 * without losing anything:
 *  - `advantages` / `disadvantages` always exist as arrays;
 *  - skill groups sharing a level are MERGED into one group (they used to render as separate
 *    "Level 1 …" rows instead of one choice row);
 *  - `isChoice` is derived from the group size, so it can never contradict the content;
 *  - groups are sorted by level; empty ones are dropped unless `keepEmptyGroups` is set.
 * Returns a new object; the input is left untouched.
 */
export function normalizeRace(race: Race, opts?: { keepEmptyGroups?: boolean }): Race {
  const byLevel = new Map<number, SkillBlock[]>();
  for (const group of race.skills ?? []) {
    const level = Number(group?.levelRequired) || 0;
    const bucket = byLevel.get(level) ?? [];
    for (const skill of group?.skills ?? []) {
      if (!skill) continue;
      // Guard against the same skill being listed twice after a merge.
      if (bucket.some(s => s.name === skill.name)) continue;
      bucket.push(skill);
    }
    byLevel.set(level, bucket);
  }

  const skills: RaceSkill[] = [...byLevel.entries()]
    // The editor keeps empty Stufen alive so a freshly added one can be dragged into.
    .filter(([, list]) => opts?.keepEmptyGroups || list.length > 0)
    .sort((a, b) => a[0] - b[0])
    .map(([levelRequired, list]) => ({ levelRequired, skills: list, isChoice: list.length > 1 }));

  return {
    ...race,
    advantages: [...(race.advantages ?? [])],
    disadvantages: [...(race.disadvantages ?? [])],
    skills,
  };
}

/** Every always-on ability of a race (advantages + disadvantages), granted on selection. */
export function grantedRaceSkills(race: Race): SkillBlock[] {
  return [...(race.advantages ?? []), ...(race.disadvantages ?? [])];
}

/** Waffenlose Effektivität — the race's BASE strength minus 5. */
export function unarmedEffectiveness(baseStrength: number): number {
  return (baseStrength || 0) - 5;
}
