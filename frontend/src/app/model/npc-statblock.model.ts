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

// ─── Seele / Körper (soul & body model) ───────────────────────────────────────
// Summons, NPCs and players share ONE stat system. The soul is just a Level (= efficiency of the
// soul rune) that grants a pool of points, distributed directly across the 6 base stats. All
// resources/derived values come from those 6 stats via the standard player formulas.

export type NpcStatKey =
  | 'strength' | 'dexterity' | 'speed' | 'intelligence' | 'constitution' | 'wille';

export const NPC_STAT_KEYS: NpcStatKey[] =
  ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'wille'];

/** The soul: a level plus the 6 base stats it spent its points on (min 1 each). */
export interface NpcSoul {
  level: number;
  stats: Record<NpcStatKey, number>;
}

/** A body stat modifier: either added on top of, or overriding, the matching soul stat. */
export interface NpcBodyStatMod {
  stat: NpcStatKey;
  value: number;
  mode: 'add' | 'override';
}

/** The body: its own Stabilität/Effizienz, plus optional per-stat modifiers to the soul's stats. */
export interface NpcBody {
  stabilitaet: number;
  effizienz: number;
  /** Use the equipped weapon's efficiency instead of the flat `effizienz` above. */
  useWeaponEffizienz: boolean;
  mods: NpcBodyStatMod[];
}

/** Point budget = 30 at level 1, +1 per level. */
export function soulPointBudget(level: number): number {
  return 29 + Math.max(1, Math.floor(level) || 1);
}
export function soulPointsSpent(soul: NpcSoul): number {
  return NPC_STAT_KEYS.reduce((sum, k) => sum + (soul.stats[k] || 0), 0);
}
export function soulPointsRemaining(soul: NpcSoul): number {
  return soulPointBudget(soul.level) - soulPointsSpent(soul);
}

export function createEmptyNpcSoul(): NpcSoul {
  // 30 points at level 1 spread evenly (5 each), respecting the "≥1 in every stat" rule.
  return {
    level: 1,
    stats: { strength: 5, dexterity: 5, speed: 5, intelligence: 5, constitution: 5, wille: 5 },
  };
}

export function createEmptyNpcBody(): NpcBody {
  return { stabilitaet: 0, effizienz: 10, useWeaponEffizienz: false, mods: [] };
}

/** The effective 6 stats after applying the body's add/override modifiers to the soul distribution. */
export function effectiveNpcStats(soul: NpcSoul, body: NpcBody | undefined): Record<NpcStatKey, number> {
  const out = { ...soul.stats };
  for (const m of body?.mods ?? []) {
    if (m.mode === 'override') out[m.stat] = m.value;
    else out[m.stat] = (out[m.stat] || 0) + m.value;
  }
  return out;
}

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

  // ─── Seele / Körper (authoring model) ──────────────────────────────────────
  // The soul (level + 6-stat distribution) and body (Stabilität/Effizienz + per-stat mods) drive the
  // flat stats/resources above via `effectiveNpcStats` + the standard player formulas; those flat
  // fields stay populated so existing consumers (lobby tokens, scripting, tracker) keep working.
  soul?: NpcSoul;
  body?: NpcBody;

  // Token-Bild / Portrait
  defaultPortrait?: string; // Image ID used as token head when dragging onto map
  /** NPC display image (portrait shown in the editor / statblock). */
  image?: string;

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
    soul: createEmptyNpcSoul(),
    body: createEmptyNpcBody(),
    primaryClassTarget: 'Kämpfer',
    secondaryClassTarget: '',
    classWeight: 80,
    gearBudget: 100,
    gearSpreadWeapon: 60,
    gearSpreadArmor: 30,
    gearSpreadAccessory: 10,
  };
}
