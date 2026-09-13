import { ItemBlock } from '../model/item-block.model';
import {
  NPC_STAT_KEYS, NpcGearTemplate, NpcRollEntry, NpcRollList, NpcSoul, NpcStatblock, NpcStatVariation,
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
 * against its chance, then clamped to the list's min/max). Stats can roll a level and shuffle a few
 * points. Everything here is pure and seeded — the lobby picks a random seed per spawn, the specs
 * pick fixed ones.
 */

export type Rng = () => number;

/** What `applyDerivedNpcStats` needs from `NpcGeneratorService`, kept structural so this stays pure. */
export interface NpcDerivedCalc {
  calcReaktionswert(wille: number, level?: number): number;
  calcGrundbonus(level: number, wille?: number): number;
  calcFokus(intelligence: number, learnedSkillIds: string[]): number;
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

/**
 * Which entries make it. Each rolls independently against its chance; too many and the least
 * likely are dropped first, too few and the most likely of the rest are added. A chance of 0 means
 * never — a min cannot force it in.
 */
export function rollSubset(
  entries: readonly NpcRollEntry[], bounds: { min: number; max?: number }, rng: Rng,
): number[] {
  const picked: number[] = [];
  const rest: number[] = [];
  entries.forEach((e, i) => (rng() < clamp01(e.chance) ? picked : rest).push(i));

  const max = bounds.max === undefined ? Infinity : Math.max(0, bounds.max);
  const min = Math.min(Math.max(0, bounds.min || 0), max);

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
export function rollSoul(soul: NpcSoul, variation: NpcStatVariation | undefined, rng: Rng): NpcSoul {
  const out: NpcSoul = JSON.parse(JSON.stringify(soul));
  if (!variation?.enabled) return out;

  const level = Math.max(1, rollInt(rng, Math.max(1, variation.levelMin || 1), Math.max(1, variation.levelMax || 1)));
  if (level !== soul.level) {
    out.level = level;
    out.stats = distributeByRatio(soulPointBudget(level), soul.locked ? soul.ratio : soul.stats);
  }

  for (let n = 0; n < Math.max(0, Math.floor(variation.shuffle || 0)); n++) {
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

const ARMOR_SLOTS = new Set<string>(['helmet', 'chestplate', 'armschienen', 'leggings', 'boots']);

/**
 * Hand-picked items rolled like any list, plus auto-forged slots rolled against their own chance.
 * One body wears one helmet: when several pieces land in the same armour slot, one is kept at random.
 * Weapons may stack.
 */
export function rollEquipment(
  items: readonly ItemBlock[], list: NpcRollList | undefined, gear: NpcGearTemplate | undefined,
  ctx: NpcRollContext, seed: number,
): ItemBlock[] {
  const rng = makeRng(seedFor(seed, 'equipment'));
  const out = pickList(items, list, rng).map(p => p.item);
  if (list?.mode !== 'random') return out;

  if (gear?.slots?.length) {
    const forgeCtx: GearGenContext = { ...ctx, settings: { ...gear.settings, seed: seedFor(seed, 'forge') } };
    for (const slot of gear.slots) {
      if (!(rng() < clamp01(slot.chance))) continue;
      const piece = slot.armorSlot
        ? generateArmorPiece(forgeCtx, slot.armorSlot, 'armor:' + slot.key)
        : slot.weaponTypeName
          ? generateWeapons(forgeCtx, [{
              id: slot.key, weaponTypeName: slot.weaponTypeName, statRequirementKey: slot.statRequirementKey,
            }])[0] ?? null
          : null;
      if (piece) out.push(piece.item);
    }
  }

  const bySlot = new Map<string, number[]>();
  out.forEach((item, i) => {
    const slot = getEquipSlot(item);
    if (!ARMOR_SLOTS.has(slot)) return;
    (bySlot.get(slot) ?? bySlot.set(slot, []).get(slot)!).push(i);
  });
  const dropped = new Set<number>();
  for (const indices of bySlot.values()) {
    if (indices.length < 2) continue;
    const keep = indices[Math.floor(rng() * indices.length)];
    for (const i of indices) if (i !== keep) dropped.add(i);
  }
  return out.filter((_, i) => !dropped.has(i));
}

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
  sb.maxHealth = e.constitution * 5;
  sb.maxEnergy = e.dexterity * 5;
  sb.maxMana = e.intelligence * 5;
  sb.reaktionswert = calc.calcReaktionswert(e.wille, level);
  sb.grundbonus = calc.calcGrundbonus(level, e.wille);
  const skillIds = (sb.customSkills ?? []).filter(s => s.skillId).map(s => s.skillId!);
  sb.fokus = calc.calcFokus(e.intelligence, skillIds);
}

/**
 * One concrete NSC from a statblock. The result carries no `variation` — it is a snapshot, not a
 * template — and its flat stats are recomputed from the rolled soul.
 */
export function rollNpcInstance(
  statblock: NpcStatblock, ctx: NpcRollContext, seed: number, calc: NpcDerivedCalc,
): NpcStatblock {
  const out: NpcStatblock = JSON.parse(JSON.stringify(statblock));
  const variation = normalizeNpcVariation(out);
  const lists = variation.lists ?? {};

  if (out.soul && variation.stats?.enabled) {
    out.soul = rollSoul(out.soul, variation.stats, makeRng(seedFor(seed, 'stats')));
  }
  out.customSkills = pickList(out.customSkills ?? [], lists.customSkills, makeRng(seedFor(seed, 'skills'))).map(p => p.item);
  out.spells = pickList(out.spells ?? [], lists.spells, makeRng(seedFor(seed, 'spells'))).map(p => p.item);
  out.equipment = rollEquipment(out.equipment ?? [], lists.equipment, variation.gear, ctx, seed);
  out.inventory = rollInventory(out.inventory ?? [], lists.inventory, seed);

  delete out.variation;
  applyDerivedNpcStats(out, calc);
  return out;
}
