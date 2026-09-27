import { ARMOR_TYPES, WeaponStatKey } from '../model/forging.model';
import {
  NPC_STAT_KEYS, NpcGearSlotRoll, NpcStatKey, NpcStatblock,
  createEmptyNpcBody, createEmptyNpcStatblock, distributeByRatio, soulPointBudget,
} from '../model/npc-statblock.model';
import type { WeaponCategory } from '../model/weapon-type-block.model';
import { defaultBudgetForLevel } from './gear-generator.util';
import type { Rng } from './npc-roll.util';

/**
 * Schnell-NSC: a whole statblock from a handful of buttons, for an enemy the GM needs *now*.
 *
 * The result is a template, not a finished NSC — it carries stat shuffle and gear slots, and the
 * lobby rolls it through `rollNpcInstance` like any library statblock. The token keeps the template
 * (`Token.npcTemplate`), so „Neu würfeln" and copy/paste give a different creature every time.
 */

/** `Token.statblockId` of a quick NSC: it has no library statblock, only its own `npcTemplate`. */
export const QUICK_NPC_STATBLOCK_ID = 'quick-npc';

export type QuickNpcTraitId =
  | 'zaeh' | 'stark' | 'schnell' | 'geschickt' | 'klug' | 'gepanzert' | 'reaktion' | 'fernkampf';

export interface QuickNpcTrait {
  id: QuickNpcTraitId;
  label: string;
  /** What the button does, as a tooltip. */
  hint: string;
  /** Relative weight this trait adds to each stat. */
  weights: Partial<Record<NpcStatKey, number>>;
  /** Preferred Waffenart for the generated weapon. */
  weaponCategory?: WeaponCategory;
  /** Stat the generated weapon asks for. */
  weaponStat?: WeaponStatKey;
}

export const QUICK_NPC_TRAITS: QuickNpcTrait[] = [
  { id: 'zaeh', label: 'Zäh', hint: 'Konstitution, etwas Wille — viel Leben', weights: { constitution: 3, wille: 1 } },
  {
    id: 'stark', label: 'Schadensstark', hint: 'Stärke, schwere Waffe',
    weights: { strength: 3 }, weaponCategory: 'SCHWER', weaponStat: 'STR',
  },
  { id: 'schnell', label: 'Schnell', hint: 'Tempo — mehr Bewegung', weights: { speed: 3 } },
  {
    id: 'geschickt', label: 'Geschickt', hint: 'Geschick — Ausdauer, leichte Waffe',
    weights: { dexterity: 3 }, weaponCategory: 'LEICHT', weaponStat: 'DEX',
  },
  {
    id: 'klug', label: 'Intelligent', hint: 'Intelligenz — Mana und Fokus',
    weights: { intelligence: 3 }, weaponStat: 'INT',
  },
  { id: 'gepanzert', label: 'Gepanzert', hint: 'Volle Rüstung, etwas Konstitution', weights: { constitution: 1 } },
  { id: 'reaktion', label: 'Reaktionsschnell', hint: 'Wille — bessere Reaktion und Grundbonus', weights: { wille: 3 } },
  {
    id: 'fernkampf', label: 'Fernkämpfer', hint: 'Geschick und Tempo, Fernkampfwaffe',
    weights: { dexterity: 2, speed: 1 }, weaponCategory: 'FERNKAMPF', weaponStat: 'DEX',
  },
];

export interface QuickNpcOptions {
  name: string;
  traits: QuickNpcTraitId[];
  /** 0–1: how much of the budget goes to the traits' stats instead of being spread evenly. */
  specialization: number;
  level: number;
  /** Weapon types to pick from; the name lands on the gear slot. Empty = the forge's first type. */
  weaponTypes?: readonly { name: string; category: WeaponCategory }[];
}

/** Armour slots rolled for a creature that is not `gepanzert`, with this chance each. */
const LIGHT_ARMOR_SLOTS = ['chestplate', 'helmet'] as const;
const LIGHT_ARMOR_CHANCE = 0.3;

function traitsOf(ids: readonly QuickNpcTraitId[]): QuickNpcTrait[] {
  return QUICK_NPC_TRAITS.filter(t => ids.includes(t.id));
}

/**
 * The stat proportions: `(1 − s)` of the weight spread evenly, `s` along the traits.
 * At 0 % every stat gets the same share; at 100 % the stats no trait asks for stay at their
 * minimum of 1. Without traits there is nothing to specialise in, so the spread stays even.
 */
export function quickNpcRatio(
  traitIds: readonly QuickNpcTraitId[], specialization: number,
): Record<NpcStatKey, number> {
  const s = Math.max(0, Math.min(1, Number.isFinite(specialization) ? specialization : 0.5));
  const raw = {} as Record<NpcStatKey, number>;
  for (const k of NPC_STAT_KEYS) raw[k] = 0;
  for (const trait of traitsOf(traitIds)) {
    for (const k of NPC_STAT_KEYS) raw[k] += trait.weights[k] ?? 0;
  }
  const total = NPC_STAT_KEYS.reduce((sum, k) => sum + raw[k], 0);
  const out = {} as Record<NpcStatKey, number>;
  for (const k of NPC_STAT_KEYS) {
    const even = 1 / NPC_STAT_KEYS.length;
    out[k] = total > 0 ? (1 - s) * even + s * (raw[k] / total) : even;
  }
  return out;
}

/** The weapon the NSC carries: Waffenart and stat from the first trait that has an opinion. */
function pickWeapon(
  traits: QuickNpcTrait[], stats: Record<NpcStatKey, number>,
  weaponTypes: QuickNpcOptions['weaponTypes'], rng: Rng,
): { weaponTypeName: string; statRequirementKey: WeaponStatKey } {
  // Fernkampf wins: someone who asked for a bow should not end up with a hammer because they
  // also asked for Stärke.
  const order: QuickNpcTraitId[] = ['fernkampf', 'stark', 'geschickt', 'klug'];
  const lead = order.map(id => traits.find(t => t.id === id)).find(Boolean);
  const byStat: [WeaponStatKey, number][] = [
    ['STR', stats.strength], ['DEX', stats.dexterity], ['INT', stats.intelligence],
  ];
  const statRequirementKey = lead?.weaponStat
    ?? byStat.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];

  const pool = weaponTypes ?? [];
  const wanted = lead?.weaponCategory;
  // Without a ranged trait nobody gets a bow by accident.
  const candidates = wanted
    ? pool.filter(w => w.category === wanted)
    : pool.filter(w => w.category !== 'FERNKAMPF');
  const from = candidates.length ? candidates : pool;
  const weaponTypeName = from.length ? from[Math.floor(rng() * from.length)]!.name : '';
  return { weaponTypeName, statRequirementKey };
}

export function buildQuickNpcTemplate(options: QuickNpcOptions, rng: Rng = Math.random): NpcStatblock {
  const level = Math.max(1, Math.floor(options.level) || 1);
  const traits = traitsOf(options.traits);
  const ratio = quickNpcRatio(options.traits, options.specialization);
  const budget = soulPointBudget(level, 0, 'player');
  const stats = distributeByRatio(budget, ratio);

  const sb = createEmptyNpcStatblock();
  sb.name = options.name.trim() || 'Gegner';
  sb.archetype = undefined;
  sb.level = level;
  sb.notes = traits.length ? 'Schnell-NSC: ' + traits.map(t => t.label).join(', ') : 'Schnell-NSC';
  // Player curve: a quick enemy is meant to stand against the party, not be summoned by it.
  // Locked, so a level change in the lobby re-deals the budget along these proportions.
  sb.soul = { level, stats, scaling: 'player', locked: true, ratio };
  sb.body = { ...createEmptyNpcBody(), useWeaponEffizienz: true, useArmorStabilitaet: true };

  const slots: NpcGearSlotRoll[] = [{ key: 'waffe', chance: 1, ...pickWeapon(traits, stats, options.weaponTypes, rng) }];
  if (traits.some(t => t.id === 'gepanzert')) {
    for (const armor of ARMOR_TYPES) slots.push({ key: 'r-' + armor.itemBlockType, chance: 1, armorSlot: armor.itemBlockType });
  } else {
    for (const slot of LIGHT_ARMOR_SLOTS) slots.push({ key: 'r-' + slot, chance: LIGHT_ARMOR_CHANCE, armorSlot: slot });
  }

  sb.variation = {
    // Same level, a few points hopping between stats: two quick goblins are never twins.
    stats: { enabled: true, levelMin: level, levelMax: level, shuffle: Math.max(2, Math.round(budget * 0.08)) },
    lists: { equipment: { mode: 'random', min: 0, entries: [] } },
    gear: {
      settings: { budget: defaultBudgetForLevel(level), variation: 25, mutation: 25, poolIds: [] },
      slots,
    },
    equipmentGroups: { armor: { min: 0 }, weapons: { min: 0 } },
  };
  return sb;
}
