import { ItemBlock } from '../model/item-block.model';
import { CETRIS_ORDER, Currency } from '../model/current-events.model';
import type { NpcCetris } from '../model/npc-statblock.model';
import {
  NPC_STAT_KEYS, NpcEquipmentGroups, NpcGearSlotRoll, NpcGearTemplate, NpcRollBounds, NpcRollEntry,
  NpcRollList, NpcSoul, NpcStatblock, NpcStatVariation, NpcVariation,
  distributeByRatio, effectiveNpcStats, normalizeNpcVariation, soulPointBudget,
} from '../model/npc-statblock.model';
import { getEquipSlot } from './equip-slot.utils';
import {
  GearGenContext, generateArmorPiece, generateWeapons, makeRng, seedFor,
} from './gear-generator.util';
import { canMerge, mergeStacks } from './item-stack.util';

/**
 * NSC-Variation: turns a statblock into one concrete token.
 *
 * A statblock is a template: every list can be „Fest" (taken as is) or „Zufällig" (each entry rolled
 * against its chance, then clamped to min/max). Stats can roll a level and shuffle a few points.
 * Everything here is pure and seeded — the lobby picks a random seed per spawn, the specs pick
 * fixed ones.
 */

export type Rng = () => number;

/** What `applyDerivedNpcStats` needs from `NpcGeneratorService`, kept structural so this stays pure. */
export interface NpcDerivedCalc {
  calcReaktionswert(wille: number, level?: number): number;
  calcGrundbonus(level: number, wille?: number): number;
  calcFokus(intelligence: number, learnedSkillIds: string[]): number;
  /** Ressourcenmaxima über den einen Statrechner (TrueStatsService) — siehe `npcResourceMax`. */
  npcResourceMax(sb: NpcStatblock): { life: number; energy: number; mana: number };
}

/** Library data that forging a generated slot needs. */
export type NpcRollContext = Omit<GearGenContext, 'settings'>;

const clamp01 = (n: number): number => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0);

/** Inclusive integer in [a, b]; the bounds may come in either order. */
export function rollInt(rng: Rng, a: number, b: number): number {
  const lo = Math.floor(Math.min(a, b));
  const hi = Math.floor(Math.max(a, b));
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Default `variation.levelChance`: percent per level every chance grows by. */
export const DEFAULT_LEVEL_CHANCE = 10;

/**
 * A chance at another level: `1 − (1 − c)^(1 + s·Δ)`, i.e. as if the entry were rolled `1 + s·Δ`
 * times. At s = 10 %, ten levels up rolls everything "twice" (10 % → 19 %, 40 % → 64 %). 0 and 1
 * never move, nothing passes 100 %, and lower levels shrink chances the same way — the exponent
 * bottoms out at 0.1 so a very low level still keeps a sliver of every chance.
 */
export function scaleChanceForLevel(
  chance: number, levelDelta: number, percentPerLevel = DEFAULT_LEVEL_CHANCE,
): number {
  const c = clamp01(chance);
  if (c === 0 || c === 1 || !levelDelta) return c;
  const exponent = Math.max(0.1, 1 + (Math.max(0, percentPerLevel) / 100) * levelDelta);
  return 1 - Math.pow(1 - c, exponent);
}

/**
 * The purse. Fest: each coin's `min`. Zufällig: an amount in the range, multiplied by the same
 * `1 + s·Δ` factor the chances use (floored at 0.1), so a stronger NSC also carries more.
 */
export function rollCetris(
  cetris: NpcCetris | undefined, random: boolean, levelDelta: number, percentPerLevel: number, rng: Rng,
): Currency {
  const out: Currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
  if (!cetris) return out;
  const factor = Math.max(0.1, 1 + (Math.max(0, percentPerLevel) / 100) * levelDelta);
  for (const key of CETRIS_ORDER) {
    const bounds = cetris[key];
    if (!bounds) continue;
    const min = Math.max(0, Math.floor(bounds.min || 0));
    if (!random) {
      out[key] = min;
      continue;
    }
    const max = Math.max(min, Math.floor(bounds.max ?? min));
    out[key] = Math.max(0, Math.round(rollInt(rng, min, max) * factor));
  }
  return out;
}

/** Every chance (lists and generated slots) moved by `levelDelta`; the forge budget follows level × 2. */
function scaleVariationForLevel(variation: NpcVariation, levelDelta: number): void {
  if (!levelDelta) return;
  const perLevel = variation.levelChance ?? DEFAULT_LEVEL_CHANCE;
  for (const list of Object.values(variation.lists ?? {})) {
    for (const entry of list?.entries ?? []) {
      entry.chance = scaleChanceForLevel(entry.chance, levelDelta, perLevel);
    }
  }
  for (const slot of variation.gear?.slots ?? []) {
    slot.chance = scaleChanceForLevel(slot.chance, levelDelta, perLevel);
  }
  if (variation.gear) {
    variation.gear.settings.budget = Math.max(1, variation.gear.settings.budget + 2 * levelDelta);
  }
}

/** Index into `candidates`, weighted; all-zero weights fall back to uniform. */
function weightedIndex(rng: Rng, candidates: readonly number[], weight: (i: number) => number): number {
  const weights = candidates.map(weight);
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return Math.floor(rng() * candidates.length);
  let r = rng() * total;
  for (let n = 0; n < weights.length; n++) {
    r -= weights[n]!;
    if (r < 0) return n;
  }
  return candidates.length - 1;
}

function boundsOf(bounds: NpcRollBounds | undefined): { min: number; max: number } {
  const max = bounds?.max === undefined ? Infinity : Math.max(0, bounds.max);
  return { min: Math.min(Math.max(0, bounds?.min || 0), max), max };
}

/**
 * Which entries make it. Each rolls independently against its chance; too many and the least
 * likely are dropped first, too few and the most likely of the rest are added. A chance of 0 means
 * never — a min cannot force it in.
 */
export function rollSubset(
  entries: readonly NpcRollEntry[], bounds: NpcRollBounds, rng: Rng,
): number[] {
  const picked: number[] = [];
  const rest: number[] = [];
  entries.forEach((e, i) => (rng() < clamp01(e.chance) ? picked : rest).push(i));

  const { min, max } = boundsOf(bounds);
  while (picked.length > max) {
    picked.splice(weightedIndex(rng, picked, i => 1 - clamp01(entries[i]!.chance)), 1);
  }
  const fill = rest.filter(i => clamp01(entries[i]!.chance) > 0);
  while (picked.length < min && fill.length) {
    const [i] = fill.splice(weightedIndex(rng, fill, j => clamp01(entries[j]!.chance)), 1);
    picked.push(i!);
  }
  return picked.sort((a, b) => a - b);
}

/** The list's items with their roll entries; fixed mode (or no config) keeps everything. */
function pickList<T>(items: readonly T[], list: NpcRollList | undefined, rng: Rng): { item: T; entry: NpcRollEntry }[] {
  const entries = list?.entries ?? [];
  const all = items.map((item, i) => ({ item, entry: entries[i] ?? { chance: 1 } }));
  if (list?.mode !== 'random') return all;
  return rollSubset(all.map(a => a.entry), list, rng).map(i => all[i]!);
}

/**
 * A rolled soul. A new level re-deals that level's budget along the soul's proportions; the same
 * level keeps the authored stats. Then `shuffle` single points hop between stats — the total never
 * changes and no stat drops below 1.
 */
export function rollSoul(
  soul: NpcSoul, variation: NpcStatVariation | undefined, rng: Rng, forcedLevel?: number,
): NpcSoul {
  const out: NpcSoul = JSON.parse(JSON.stringify(soul));
  const enabled = !!variation?.enabled;
  if (!enabled && forcedLevel === undefined) return out;

  // A level the GM set in the lobby wins over the range.
  const level = forcedLevel !== undefined
    ? Math.max(1, Math.floor(forcedLevel) || 1)
    : Math.max(1, rollInt(rng, Math.max(1, variation!.levelMin || 1), Math.max(1, variation!.levelMax || 1)));
  if (level !== soul.level) {
    out.level = level;
    out.stats = distributeByRatio(
      soulPointBudget(level, soul.bonusPoints, soul.scaling),
      soul.locked ? soul.ratio : soul.stats,
    );
  }

  const shuffle = enabled ? Math.max(0, Math.floor(variation!.shuffle || 0)) : 0;
  for (let n = 0; n < shuffle; n++) {
    const donors = NPC_STAT_KEYS.filter(k => out.stats[k] > 1);
    if (!donors.length) break;
    const from = donors[Math.floor(rng() * donors.length)]!;
    const takers = NPC_STAT_KEYS.filter(k => k !== from);
    const to = takers[Math.floor(rng() * takers.length)]!;
    out.stats[from]--;
    out.stats[to]++;
  }
  return out;
}

// ─── Equipment ──────────────────────────────────────────────────────────────

const ARMOR_SLOTS = new Set<string>(['helmet', 'chestplate', 'armschienen', 'leggings', 'boots']);

export type EquipmentKind = 'armor' | 'weapon' | 'other';

/** Which min/max group an equipment item counts toward. */
export function equipmentKind(item: ItemBlock): EquipmentKind {
  if (item.itemType === 'weapon') return 'weapon';
  return ARMOR_SLOTS.has(getEquipSlot(item)) ? 'armor' : 'other';
}

/** One thing that may end up worn: a hand-picked item, or a slot still to be forged. */
interface EquipCandidate {
  chance: number;
  kind: EquipmentKind;
  /** Armour slot — two candidates with the same slot are never both kept. */
  slot?: string;
  item?: ItemBlock;
  gearSlot?: NpcGearSlotRoll;
}

/** One body wears one helmet: among picked candidates sharing a slot, keep one at random. */
function dropSlotConflicts(candidates: readonly EquipCandidate[], picked: Set<number>, rng: Rng): void {
  const bySlot = new Map<string, number[]>();
  for (const i of [...picked].sort((a, b) => a - b)) {
    const slot = candidates[i]!.slot;
    if (!slot) continue;
    (bySlot.get(slot) ?? bySlot.set(slot, []).get(slot)!).push(i);
  }
  for (const indices of bySlot.values()) {
    if (indices.length < 2) continue;
    const keep = indices[Math.floor(rng() * indices.length)];
    for (const i of indices) if (i !== keep) picked.delete(i);
  }
}

/** `rollSubset`'s clamp, restricted to one group — and a min fill never doubles up an armour slot. */
function clampGroup(
  candidates: readonly EquipCandidate[], picked: Set<number>, kind: EquipmentKind,
  bounds: NpcRollBounds | undefined, rng: Rng,
): void {
  const { min, max } = boundsOf(bounds);
  const current = [...picked].filter(i => candidates[i]!.kind === kind).sort((a, b) => a - b);

  while (current.length > max) {
    const [dropped] = current.splice(weightedIndex(rng, current, i => 1 - clamp01(candidates[i]!.chance)), 1);
    picked.delete(dropped!);
  }
  while (current.length < min) {
    const occupied = new Set(current.map(i => candidates[i]!.slot).filter(Boolean));
    const fill = candidates
      .map((_, i) => i)
      .filter(i => {
        const c = candidates[i]!;
        return c.kind === kind && !picked.has(i) && clamp01(c.chance) > 0 && !(c.slot && occupied.has(c.slot));
      });
    if (!fill.length) break;
    const i = fill[weightedIndex(rng, fill, j => clamp01(candidates[j]!.chance))]!;
    picked.add(i);
    current.push(i);
  }
}

/**
 * Hand-picked items and auto-forged slots rolled as one pool: every candidate against its chance,
 * one piece per armour slot, then Rüstung and Waffen each clamped to their own min/max. Only the
 * slots that survive are forged. Other items (rings, tools) roll on their chance alone.
 */
export function rollEquipment(
  items: readonly ItemBlock[], list: NpcRollList | undefined, gear: NpcGearTemplate | undefined,
  groups: NpcEquipmentGroups | undefined, ctx: NpcRollContext, seed: number,
): ItemBlock[] {
  if (list?.mode !== 'random') return [...items];
  const rng = makeRng(seedFor(seed, 'equipment'));

  const candidates: EquipCandidate[] = [
    ...items.map((item, index): EquipCandidate => {
      const kind = equipmentKind(item);
      return {
        chance: list.entries[index]?.chance ?? 1,
        kind,
        slot: kind === 'armor' ? getEquipSlot(item) : undefined,
        item,
      };
    }),
    ...(gear?.slots ?? []).map((gearSlot): EquipCandidate => ({
      chance: gearSlot.chance,
      kind: gearSlot.armorSlot ? 'armor' : 'weapon',
      slot: gearSlot.armorSlot,
      gearSlot,
    })),
  ];

  const picked = new Set<number>();
  candidates.forEach((c, index) => { if (rng() < clamp01(c.chance)) picked.add(index); });
  dropSlotConflicts(candidates, picked, rng);
  clampGroup(candidates, picked, 'armor', groups?.armor, rng);
  clampGroup(candidates, picked, 'weapon', groups?.weapons, rng);

  const forgeCtx: GearGenContext | null = gear
    ? { ...ctx, settings: { ...gear.settings, seed: seedFor(seed, 'forge') } }
    : null;
  const out: ItemBlock[] = [];
  for (const index of [...picked].sort((a, b) => a - b)) {
    const c = candidates[index]!;
    if (c.item) {
      out.push(c.item);
    } else if (c.gearSlot && forgeCtx) {
      const slot = c.gearSlot;
      const piece = slot.armorSlot
        ? generateArmorPiece(forgeCtx, slot.armorSlot, 'armor:' + slot.key)
        : generateWeapons(forgeCtx, [{
            id: slot.key, weaponTypeName: slot.weaponTypeName ?? '', statRequirementKey: slot.statRequirementKey,
          }])[0] ?? null;
      if (piece) out.push(piece.item);
    }
  }
  return out;
}

// ─── Inventory ──────────────────────────────────────────────────────────────

/** Loot: rolled like any list, each pick with its own amount range, equal piles merged. */
export function rollInventory(items: readonly ItemBlock[], list: NpcRollList | undefined, seed: number): ItemBlock[] {
  const rng = makeRng(seedFor(seed, 'inventory'));
  const random = list?.mode === 'random';
  const rolled: ItemBlock[] = [];

  for (const { item, entry } of pickList(items, list, rng)) {
    const hasRange = random && (entry.min !== undefined || entry.max !== undefined);
    if (!hasRange) {
      rolled.push(item);
      continue;
    }
    const count = Math.max(0, rollInt(rng, entry.min ?? entry.max ?? 1, entry.max ?? entry.min ?? 1));
    if (count === 0) continue;
    if (item.stackable) {
      rolled.push({ ...item, amount: count } as ItemBlock);
    } else {
      for (let n = 0; n < count; n++) rolled.push({ ...item } as ItemBlock);
    }
  }

  const merged: ItemBlock[] = [];
  for (const item of rolled) {
    const at = merged.findIndex(m => canMerge(m, item));
    if (at >= 0) merged[at] = mergeStacks(merged[at]!, item).merged;
    else merged.push(item);
  }
  return merged;
}

// ─── Whole NSC ──────────────────────────────────────────────────────────────

/**
 * Writes the effective stats and every derived value into the flat fields the lobby, tracker and
 * scripting read. Shared by the editor and the roller so the two cannot drift.
 */
export function applyDerivedNpcStats(sb: NpcStatblock, calc: NpcDerivedCalc): void {
  if (!sb.soul) return;
  const e = effectiveNpcStats(sb.soul, sb.body);
  const level = sb.soul.level;
  sb.level = level;
  sb.strength = e.strength;
  sb.dexterity = e.dexterity;
  sb.speed = e.speed;
  sb.intelligence = e.intelligence;
  sb.constitution = e.constitution;
  sb.wille = e.wille;
  // Pools last: the calculator reads the flat stats above off the statblock, and it adds Stat×5,
  // the flat Leben per level and every skill/item bonus itself — the same formula a player gets.
  const pools = calc.npcResourceMax(sb);
  sb.maxHealth = pools.life;
  sb.maxEnergy = pools.energy;
  sb.maxMana = pools.mana;
  sb.reaktionswert = calc.calcReaktionswert(e.wille, level);
  sb.grundbonus = calc.calcGrundbonus(level, e.wille);
  const skillIds = (sb.customSkills ?? []).filter(s => s.skillId).map(s => s.skillId!);
  sb.fokus = calc.calcFokus(e.intelligence, skillIds);
}

/**
 * One concrete NSC from a statblock. The result carries no `variation` — it is a snapshot, not a
 * template — and its flat stats are recomputed from the rolled soul.
 */
export interface NpcRollOptions {
  /** Level set by the GM in the lobby — wins over the stat variation's range. */
  level?: number;
}

export function rollNpcInstance(
  statblock: NpcStatblock, ctx: NpcRollContext, seed: number, calc: NpcDerivedCalc,
  options: NpcRollOptions = {},
): NpcStatblock {
  const out: NpcStatblock = JSON.parse(JSON.stringify(statblock));
  const variation = normalizeNpcVariation(out);
  const lists = variation.lists ?? {};
  const authoredLevel = statblock.soul?.level ?? statblock.level ?? 1;

  if (out.soul && (variation.stats?.enabled || options.level !== undefined)) {
    out.soul = rollSoul(out.soul, variation.stats, makeRng(seedFor(seed, 'stats')), options.level);
  } else if (!out.soul && options.level !== undefined) {
    out.level = Math.max(1, Math.floor(options.level) || 1);
  }
  // Level first, then the lists: a stronger NSC rolls with stronger chances.
  const levelDelta = (out.soul?.level ?? out.level ?? authoredLevel) - authoredLevel;
  scaleVariationForLevel(variation, levelDelta);
  out.customSkills = pickList(out.customSkills ?? [], lists.customSkills, makeRng(seedFor(seed, 'skills'))).map(p => p.item);
  out.spells = pickList(out.spells ?? [], lists.spells, makeRng(seedFor(seed, 'spells'))).map(p => p.item);
  out.equipment = rollEquipment(
    out.equipment ?? [], lists.equipment, variation.gear, variation.equipmentGroups, ctx, seed,
  );
  out.inventory = rollInventory(out.inventory ?? [], lists.inventory, seed);
  out.purse = rollCetris(
    out.cetris, lists.inventory?.mode === 'random', levelDelta,
    variation.levelChance ?? DEFAULT_LEVEL_CHANCE, makeRng(seedFor(seed, 'cetris')),
  );

  delete out.variation;
  applyDerivedNpcStats(out, calc);
  return out;
}
