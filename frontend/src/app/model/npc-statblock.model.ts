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

/**
 * The soul: a level plus bonus points distributed across four categories. You have `level`
 * bonus points to spend in total. Each category has a per-level base and a per-point bonus:
 *   Leben          base L×1,        +5×L  per point
 *   Energie        base L×1,        +5×L  per point   (pool = Ausdauer + Mana)
 *   Geschwindigkeit → Reaktion  base L/10, +L/4 per point
 *                   → Zug-Tempo  base L/5,  +L/2 per point   (turn-order speed, NOT movement)
 *   Angriff (Angriffsbonus) base L/15, +L/6 per point
 */
export interface NpcSoul {
  level: number;
  bonus: { leben: number; energie: number; geschwindigkeit: number; angriff: number };
}

/**
 * The body: freely assigned by the creator. Any override left `undefined` falls through to the
 * soul-derived value; a number here replaces the soul value for that stat.
 */
export interface NpcBody {
  bewegung: number;
  stabilitaet: number;
  effizienz: number;
  /** Use the equipped weapon's efficiency instead of the flat `effizienz` above. */
  useWeaponEffizienz: boolean;
  /** Optional overrides — the body can overwrite parts of the soul. */
  overrides: {
    maxHealth?: number;
    maxEnergy?: number;
    maxMana?: number;
    reaktion?: number;
    turnSpeed?: number;
    angriff?: number;
  };
}

/**
 * Slider shares (0..1) that split each dual-mapped soul stat between two player attributes when
 * estimating the 6 base stats. Defaults 0.5 each.
 */
export interface NpcEstimateSplits {
  /** Energie → Geschick (this share) vs Intelligenz (1 − this). */
  ausdauerShare: number;
  /** Geschwindigkeit → Speed (this share) vs Wille (1 − this). */
  speedShare: number;
  /** Angriff → Stärke (this share) vs Geschick (1 − this). */
  strShare: number;
}

export interface NpcSoulDerived {
  maxHealth: number;
  /** Combined Energie pool before the Ausdauer/Mana split. */
  energie: number;
  maxEnergy: number;
  maxMana: number;
  reaktion: number;
  turnSpeed: number;
  angriff: number;
}

export function createEmptyNpcSoul(): NpcSoul {
  return { level: 1, bonus: { leben: 0, energie: 0, geschwindigkeit: 0, angriff: 0 } };
}

export function createEmptyNpcBody(): NpcBody {
  return { bewegung: 8, stabilitaet: 0, effizienz: 10, useWeaponEffizienz: false, overrides: {} };
}

export function createEmptyEstimateSplits(): NpcEstimateSplits {
  return { ausdauerShare: 0.5, speedShare: 0.5, strShare: 0.5 };
}

/** How many bonus points are still free to distribute (level total minus spent). */
export function soulBonusRemaining(soul: NpcSoul): number {
  const b = soul.bonus;
  return soul.level - (b.leben + b.energie + b.geschwindigkeit + b.angriff);
}

/**
 * Resolve the raw soul-derived resources/values from level + point allocation, then let the body
 * overrides win where present. `angriff`/`reaktion`/`turnSpeed` are rounded; the Ausdauer/Mana
 * split of the Energie pool uses the same slider as the Geschick/Int estimation.
 */
export function computeSoulDerived(soul: NpcSoul, body: NpcBody | undefined, splits: NpcEstimateSplits): NpcSoulDerived {
  const L = Math.max(1, soul.level || 1);
  const b = soul.bonus;
  const ov = body?.overrides ?? {};

  const maxHealth = Math.round(L * 1 + 5 * L * b.leben);
  const energie = Math.round(L * 1 + 5 * L * b.energie);
  const reaktion = Math.round(L / 10 + (L / 4) * b.geschwindigkeit);
  const turnSpeed = Math.round(L / 5 + (L / 2) * b.geschwindigkeit);
  const angriff = Math.round(L / 15 + (L / 6) * b.angriff);

  const ausdauerShare = clamp01(splits.ausdauerShare);
  const maxEnergy = Math.round(energie * ausdauerShare);
  const maxMana = energie - maxEnergy;

  return {
    maxHealth: ov.maxHealth ?? maxHealth,
    energie,
    maxEnergy: ov.maxEnergy ?? maxEnergy,
    maxMana: ov.maxMana ?? maxMana,
    reaktion: ov.reaktion ?? reaktion,
    turnSpeed: ov.turnSpeed ?? turnSpeed,
    angriff: ov.angriff ?? angriff,
  };
}

/**
 * Estimate the 6 player base stats (+ grundbonus) from how the soul points were spent, so edge-case
 * saves have plausible values. Each stat = 10 baseline + Level × (points × slider share). These are a
 * prefill — the creator can nudge any value afterwards. Grundbonus mirrors the player formula.
 */
export function estimateNpcBaseStats(soul: NpcSoul, splits: NpcEstimateSplits): {
  strength: number; dexterity: number; speed: number;
  intelligence: number; constitution: number; wille: number; grundbonus: number;
} {
  const L = Math.max(1, soul.level || 1);
  const b = soul.bonus;
  const ausdauerShare = clamp01(splits.ausdauerShare);
  const speedShare = clamp01(splits.speedShare);
  const strShare = clamp01(splits.strShare);

  const constitution = Math.round(10 + L * b.leben);
  const intelligence = Math.round(10 + L * b.energie * (1 - ausdauerShare));
  const dexterity = Math.round(10 + L * (b.energie * ausdauerShare + b.angriff * (1 - strShare)));
  const strength = Math.round(10 + L * b.angriff * strShare);
  const speed = Math.round(10 + L * b.geschwindigkeit * speedShare);
  const wille = Math.round(10 + L * b.geschwindigkeit * (1 - speedShare));
  const grundbonus = Math.floor(wille / 8) + Math.floor(L / 8);

  return { strength, dexterity, speed, intelligence, constitution, wille, grundbonus };
}

/**
 * Recompute every flat gameplay field from the soul/body/estimate inputs. This is the "prefill":
 * call it whenever the soul allocation or sliders change. Manual nudges to the flat fields survive
 * until the next call (i.e. until the creator touches the soul again or hits re-estimate).
 */
export function applyNpcEstimation(sb: NpcStatblock): void {
  const soul = sb.soul ?? createEmptyNpcSoul();
  const splits = sb.estimate ?? createEmptyEstimateSplits();
  const d = computeSoulDerived(soul, sb.body, splits);

  sb.level = soul.level;
  sb.maxHealth = d.maxHealth;
  sb.maxEnergy = d.maxEnergy;
  sb.maxMana = d.maxMana;
  sb.reaktionswert = d.reaktion;
  sb.turnSpeed = d.turnSpeed;
  sb.attackBonus = d.angriff;

  const est = estimateNpcBaseStats(soul, splits);
  sb.strength = est.strength;
  sb.dexterity = est.dexterity;
  sb.speed = est.speed;
  sb.intelligence = est.intelligence;
  sb.constitution = est.constitution;
  sb.wille = est.wille;
  sb.grundbonus = est.grundbonus;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0.5));
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

  // ─── Seele / Körper (new authoring model) ──────────────────────────────────
  // The soul + body drive the flat stats/resources above via the estimation; those flat fields
  // stay populated so all existing consumers (lobby tokens, scripting, tracker) keep working.
  soul?: NpcSoul;
  body?: NpcBody;
  estimate?: NpcEstimateSplits;
  /** Attack bonus (Angriffsbonus) — normally used in combat instead of raw strength/dex. */
  attackBonus?: number;
  /** Turn-order speed (Zug-Tempo) for the battle tracker; NOT movement. */
  turnSpeed?: number;

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
    estimate: createEmptyEstimateSplits(),
    attackBonus: 0,
    turnSpeed: 0,
    primaryClassTarget: 'Kämpfer',
    secondaryClassTarget: '',
    classWeight: 80,
    gearBudget: 100,
    gearSpreadWeapon: 60,
    gearSpreadArmor: 30,
    gearSpreadAccessory: 10,
  };
}
