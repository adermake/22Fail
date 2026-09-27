import type { ItemBlock } from '../model/item-block.model';
import { MaterialBlock, WeaponStatKey } from '../model/forging.model';
import {
  NPC_STAT_KEYS, NpcGearSlotRoll, NpcStatKey, NpcStatblock,
  createEmptyNpcBody, createEmptyNpcStatblock, distributeByRatio, soulPointBudget,
} from '../model/npc-statblock.model';
import type { WeaponCategory } from '../model/weapon-type-block.model';
import type { Rng } from './npc-roll.util';

/**
 * Schnell-NSC: a whole statblock from a handful of buttons, for an enemy the GM needs *now*.
 *
 * The result is a template, not a finished NSC — it carries stat shuffle (and gear slots, when
 * geared), and the lobby rolls it through `rollNpcInstance` like any library statblock. The token
 * keeps the template (`Token.npcTemplate`), so „Neu würfeln" and copy/paste give a different
 * creature every time.
 */

/** `Token.statblockId` of a quick NSC: it has no library statblock, only its own `npcTemplate`. */
export const QUICK_NPC_STATBLOCK_ID = 'quick-npc';

// ─── Merkmale ────────────────────────────────────────────────────────────────

export type QuickNpcTraitId =
  | 'stark' | 'zaeh' | 'schnell' | 'geschickt' | 'klug' | 'willensstark'
  | 'gepanzert' | 'aggressiv' | 'aufmerksam';

export interface QuickNpcTrait {
  id: QuickNpcTraitId;
  label: string;
  /** What the button does, as a tooltip. */
  hint: string;
  /** Relative weight this trait adds to each stat. Empty for the three combat traits. */
  weights: Partial<Record<NpcStatKey, number>>;
}

export const QUICK_NPC_TRAITS: QuickNpcTrait[] = [
  { id: 'stark', label: 'Stark', hint: 'Stärke', weights: { strength: 1 } },
  { id: 'zaeh', label: 'Zäh', hint: 'Konstitution — mehr Leben', weights: { constitution: 1 } },
  { id: 'schnell', label: 'Schnell', hint: 'Tempo — mehr Bewegung', weights: { speed: 1 } },
  { id: 'geschickt', label: 'Geschickt', hint: 'Geschick — mehr Ausdauer', weights: { dexterity: 1 } },
  { id: 'klug', label: 'Klug', hint: 'Intelligenz — mehr Mana und Fokus', weights: { intelligence: 1 } },
  { id: 'willensstark', label: 'Willensstark', hint: 'Wille — Reaktion und Grundbonus', weights: { wille: 1 } },
  { id: 'gepanzert', label: 'Gepanzert', hint: 'Mehr Stabilität', weights: {} },
  { id: 'aggressiv', label: 'Aggressiv', hint: 'Mehr Effektivität', weights: {} },
  { id: 'aufmerksam', label: 'Aufmerksam', hint: 'Bessere Reaktion', weights: {} },
];

// ─── Ausrüstung ──────────────────────────────────────────────────────────────

type ArmorSlot = NonNullable<ItemBlock['armorType']>;
type GearPiece =
  | { kind: 'weapon'; category?: WeaponCategory; stat: WeaponStatKey }
  | { kind: 'armor'; slot: ArmorSlot };

export type QuickNpcArchetypeId =
  | 'krieger' | 'waechter' | 'barbar' | 'klingentaenzer' | 'schurke' | 'bogenschuetze' | 'magier';

export interface QuickNpcArchetype {
  id: QuickNpcArchetypeId;
  label: string;
  hint: string;
  /** Pieces in the order they are handed out — „Menge" takes the first N. */
  pieces: GearPiece[];
}

const W = (category: WeaponCategory | undefined, stat: WeaponStatKey): GearPiece => ({ kind: 'weapon', category, stat });
const A = (slot: ArmorSlot): GearPiece => ({ kind: 'armor', slot });

export const QUICK_NPC_ARCHETYPES: QuickNpcArchetype[] = [
  {
    id: 'krieger', label: 'Krieger', hint: 'Schwere Waffe, solide Rüstung',
    pieces: [W('SCHWER', 'STR'), A('chestplate'), A('helmet'), A('leggings'), A('armschienen'), A('boots')],
  },
  {
    id: 'waechter', label: 'Wächter', hint: 'Rüstung zuerst, leichte Waffe',
    pieces: [A('chestplate'), W('LEICHT', 'STR'), A('helmet'), A('leggings'), A('armschienen'), A('boots')],
  },
  {
    id: 'barbar', label: 'Barbar', hint: 'Große Waffe, kaum Rüstung',
    pieces: [W('SCHWER', 'STR'), A('leggings'), A('boots'), A('armschienen'), A('helmet'), A('chestplate')],
  },
  {
    id: 'klingentaenzer', label: 'Klingentänzer', hint: 'Zwei leichte Klingen, leichte Rüstung',
    pieces: [W('LEICHT', 'DEX'), W('LEICHT', 'DEX'), A('armschienen'), A('boots'), A('leggings'), A('helmet')],
  },
  {
    id: 'schurke', label: 'Schurke', hint: 'Leichte Waffe, wenig Rüstung',
    pieces: [W('LEICHT', 'DEX'), A('boots'), A('leggings'), A('armschienen'), A('helmet'), A('chestplate')],
  },
  {
    id: 'bogenschuetze', label: 'Bogenschütze', hint: 'Fernkampfwaffe, leichte Rüstung',
    pieces: [W('FERNKAMPF', 'DEX'), A('armschienen'), A('boots'), A('leggings'), A('helmet'), A('chestplate')],
  },
  {
    id: 'magier', label: 'Magier', hint: 'Waffe auf Intelligenz, kaum Rüstung',
    pieces: [W(undefined, 'INT'), A('helmet'), A('boots'), A('leggings'), A('armschienen'), A('chestplate')],
  },
];

export const QUICK_GEAR_MAX_PIECES = 6;

export interface QuickNpcGear {
  archetype: QuickNpcArchetypeId;
  /** Pieces handed out, 1–6, in the archetype's order. */
  amount: number;
  /** 0–1: 0 forges from the cheapest materials, 1 from the rarest. */
  value: number;
  /** Schmiedepunkte per piece (10 is an ordinary smith's work). */
  budget: number;
}

/** Default Schmiedepunkte for a level: 10 around level 8, a little more or less either side. */
export function quickGearBudget(level: number): number {
  return Math.max(1, Math.round(6 + Math.max(1, level) / 2));
}

/**
 * The material pool for a „Wert": materials ranked by cost (rarity where no cost is set), and the
 * window of that ranking around `value` kept. The generator falls back to every usable material
 * when the window has none for a slot, so a thin library can never leave a piece unforged.
 */
export function materialPoolForValue(
  materials: readonly Pick<MaterialBlock, 'id' | 'cost' | 'rarity'>[], value: number,
): string[] {
  if (!materials.length) return [];
  const rarityCost = { COMMON: 1, RARE: 10, LEGENDARY: 100 } as const;
  const price = (m: Pick<MaterialBlock, 'cost' | 'rarity'>) => m.cost ?? rarityCost[m.rarity ?? 'COMMON'];
  const ranked = [...materials].sort((a, b) => price(a) - price(b));
  const v = Math.max(0, Math.min(1, value));
  const n = ranked.length;
  const inWindow = ranked.filter((_, i) => Math.abs((n > 1 ? i / (n - 1) : 0.5) - v) <= 0.25);
  if (inWindow.length) return inWindow.map(m => m.id);
  return [ranked[Math.round(v * (n - 1))]!.id];
}

// ─── Aufbau ──────────────────────────────────────────────────────────────────

export interface QuickNpcOptions {
  name: string;
  traits: QuickNpcTraitId[];
  /** 0–1: how much of the budget goes to the traits' stats instead of being spread evenly. */
  specialization: number;
  level: number;
  /** Unset = no gear: Effektivität and Stabilität are the creature's own (an animal, a golem). */
  gear?: QuickNpcGear | null;
  /** Weapon types to pick from; the name lands on the gear slot. Empty = the forge's first type. */
  weaponTypes?: readonly { name: string; category: WeaponCategory }[];
  /** Materials to derive the pool from (`gear.value`). Empty = the forge draws from everything. */
  materials?: readonly Pick<MaterialBlock, 'id' | 'cost' | 'rarity'>[];
}

function traitsOf(ids: readonly QuickNpcTraitId[]): QuickNpcTrait[] {
  return QUICK_NPC_TRAITS.filter(t => ids.includes(t.id));
}

/**
 * The stat proportions: `(1 − s)` of the weight spread evenly, `s` along the traits.
 * At 0 % every stat gets the same share; at 100 % the stats no trait asks for stay at their
 * minimum of 1. Without stat traits there is nothing to specialise in, so the spread stays even.
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

/**
 * Innate Effektivität / Stabilität of an ungeared creature. Anchored on the rulebook: 10 is the
 * Effektivität of a good weapon — reached around level 8 — and Stabilität grows slower, since it
 * divides damage rather than multiplying it. Aggressiv / Gepanzert push each well past that.
 */
export function quickNpcInnate(
  level: number, traitIds: readonly QuickNpcTraitId[], rng: Rng = Math.random,
): { effizienz: number; stabilitaet: number } {
  const lvl = Math.max(1, level);
  const jitter = () => 0.85 + rng() * 0.3;
  const aggressiv = traitIds.includes('aggressiv');
  const gepanzert = traitIds.includes('gepanzert');
  const effizienz = Math.max(1, Math.round((5 + lvl * 0.6) * (aggressiv ? 1.5 : 1) * jitter()));
  const stabilitaet = Math.round(lvl * 0.8 * jitter()) + (gepanzert ? Math.round(10 + lvl * 1.5) : 0);
  return { effizienz, stabilitaet };
}

function weaponTypeFor(
  category: WeaponCategory | undefined, weaponTypes: QuickNpcOptions['weaponTypes'], rng: Rng,
): string {
  const pool = weaponTypes ?? [];
  // Without a ranged archetype nobody gets a bow by accident.
  const candidates = category
    ? pool.filter(w => w.category === category)
    : pool.filter(w => w.category !== 'FERNKAMPF');
  const from = candidates.length ? candidates : pool;
  return from.length ? from[Math.floor(rng() * from.length)]!.name : '';
}

/** The gear slots for an archetype: its first `amount` pieces, each forged at every roll. */
export function quickGearSlots(
  gear: QuickNpcGear, weaponTypes: QuickNpcOptions['weaponTypes'], rng: Rng = Math.random,
): NpcGearSlotRoll[] {
  const archetype = QUICK_NPC_ARCHETYPES.find(a => a.id === gear.archetype) ?? QUICK_NPC_ARCHETYPES[0]!;
  const amount = Math.max(1, Math.min(QUICK_GEAR_MAX_PIECES, Math.round(gear.amount)));
  return archetype.pieces.slice(0, amount).map((piece, i): NpcGearSlotRoll => piece.kind === 'weapon'
    ? {
        key: 'w' + i, chance: 1,
        weaponTypeName: weaponTypeFor(piece.category, weaponTypes, rng), statRequirementKey: piece.stat,
      }
    : { key: 'r-' + piece.slot, chance: 1, armorSlot: piece.slot });
}

export function buildQuickNpcTemplate(options: QuickNpcOptions, rng: Rng = Math.random): NpcStatblock {
  const level = Math.max(1, Math.floor(options.level) || 1);
  const traits = traitsOf(options.traits);
  const has = (id: QuickNpcTraitId) => options.traits.includes(id);
  const ratio = quickNpcRatio(options.traits, options.specialization);
  const budget = soulPointBudget(level, 0, 'player');
  const stats = distributeByRatio(budget, ratio);

  const sb = createEmptyNpcStatblock();
  sb.name = options.name.trim() || 'Gegner';
  sb.archetype = undefined;
  sb.level = level;
  const gear = options.gear ?? null;
  const archetype = gear ? QUICK_NPC_ARCHETYPES.find(a => a.id === gear.archetype) : undefined;
  sb.notes = ['Schnell-NSC', traits.map(t => t.label).join(', '), archetype?.label]
    .filter(Boolean).join(' · ');
  // Player curve: a quick enemy is meant to stand against the party, not be summoned by it.
  // Locked, so a level change in the lobby re-deals the budget along these proportions.
  sb.soul = { level, stats, scaling: 'player', locked: true, ratio };
  if (has('aufmerksam')) sb.adjust = { reaktion: -(2 + Math.floor(level / 10)) };

  // Same level, a few points hopping between stats: two quick goblins are never twins.
  const statVariation = {
    enabled: true, levelMin: level, levelMax: level, shuffle: Math.max(2, Math.round(budget * 0.08)),
  };

  if (!gear) {
    sb.body = { ...createEmptyNpcBody(), ...quickNpcInnate(level, options.traits, rng) };
    sb.variation = { stats: statVariation };
    return sb;
  }

  // Geared: the gear decides, the combat traits add their edge on top.
  sb.body = {
    ...createEmptyNpcBody(),
    useWeaponEffizienz: true,
    useArmorStabilitaet: true,
    effizienzBonus: has('aggressiv') ? Math.round(3 + level * 0.3) : 0,
    stabilitaetBonus: has('gepanzert') ? Math.round(5 + level * 0.75) : 0,
  };
  const value = Math.max(0, Math.min(1, gear.value));
  sb.variation = {
    stats: statVariation,
    lists: { equipment: { mode: 'random', min: 0, entries: [] } },
    gear: {
      settings: {
        budget: Math.max(1, Math.round(gear.budget)),
        variation: 25,
        // Rarer gear is also stranger gear: more secondary materials and Schmiedemerkmale.
        mutation: Math.round(10 + value * 30),
        poolIds: materialPoolForValue(options.materials ?? [], value),
      },
      slots: quickGearSlots(gear, options.weaponTypes, rng),
    },
    equipmentGroups: { armor: { min: 0 }, weapons: { min: 0 } },
  };
  return sb;
}
