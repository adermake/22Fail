import { ConstructSocket, ItemBlock, ItemRequirements } from '../model/item-block.model';
import { SkillBlock } from '../model/skill-block.model';
import { SpellBlock } from '../model/spell-block-model';

/**
 * Konstrukt trees, in one place.
 *
 * A Konstrukt is an item with Anschlüsse (sockets) that other Konstrukte plug into, recursively —
 * the Kernkörper carries an Arm, the Arm carries a Säge. The assembled tree behaves as ONE item:
 * its parts' Stabilität, Effektivität, Fähigkeiten and Zauber all roll up into the root.
 *
 * Two kinds of roll-up, and the difference matters everywhere below:
 *
 *  - STRUCTURAL (Komplexität, Anforderungen) counts every attached node, broken or not. A shattered
 *    arm is still bolted on: it still takes concentration to interface with and still weighs on the
 *    wielder's frame.
 *  - FUNCTIONAL (Stabilität, Effektivität, Fähigkeiten, Zauber) skips broken and lost nodes together
 *    with everything below them. A broken Arm takes its Säge out of the fight; the rest of the
 *    machine keeps working.
 *
 * ── The two costs pull in opposite directions ────────────────────────────────────────────────────
 *
 *   Komplexität   = Σ depth(node)        deeper ⇒ MORE  Fokus
 *   Anforderungen = Σ req / (depth + 1)  deeper ⇒ LESS  Kraft
 *
 * so a tall machine is a Fokus problem and a wide one a muscle problem. That tension is deliberate:
 * it gives INT builds and STR builds structurally different Konstrukte instead of one optimal shape.
 *
 * ── Komplexität is structural, and nothing may change that ───────────────────────────────────────
 *
 * There is deliberately no script hook on Komplexität. If a Merkmal could lower it you would get a
 * cycle: script lowers Komplexität → tree fits the Fokus budget → tree activates → script runs. A
 * Konstrukt can never pay for its own Fokus. Merkmale that want to help raise the wearer's `fokus`
 * stat instead, which is resolved from the pre-item snapshot and so stays acyclic.
 *
 * Stat roll-ups take a resolver rather than reading `item.efficiency` directly, because a
 * Schmiedemerkmal writing `item.effectivity += 2 * merkmalLevel` has to count. TrueStatsService
 * passes its own `resolveItemStat`; the default here reads the raw forged values.
 */

/** Hard ceiling on nesting. Deep enough that nobody hits it by design, shallow enough to bound work. */
export const MAX_CONSTRUCT_DEPTH = 10;

/** Item stats a Merkmal can rewrite — mirrors ItemModifierTarget in the interpreter. */
export type ConstructStatProp =
  | 'effectivity' | 'stability' | 'armorDebuff' | 'weight'
  | 'meleeRange' | 'rangedRange' | 'maxDurability';

/** Reads one stat off one node, after that node's own scripts have had their say. */
export type ItemStatResolver = (item: ItemBlock, prop: ConstructStatProp) => number;

/** Fallback resolver: the forged value, before any script touches it. */
export const rawStatResolver: ItemStatResolver = (item, prop) => {
  switch (prop) {
    case 'effectivity':   return item.efficiency ?? 0;
    case 'stability':     return item.stability ?? 0;
    case 'armorDebuff':   return item.armorDebuff ?? 0;
    case 'weight':        return item.weight ?? 0;
    case 'meleeRange':    return item.meleeRange ?? 0;
    case 'rangedRange':   return item.rangedRange ?? 0;
    case 'maxDurability': return item.maxDurability ?? 0;
  }
};

/** One node of a flattened tree. */
export interface ConstructNode {
  item: ItemBlock;
  /** Root = 0. Doubles as the Komplexität this node's edge costs. */
  depth: number;
  /** Item id of the node this one hangs from. Undefined for the root. */
  parentId?: string;
  /** Socket on the parent that holds this node. Undefined for the root. */
  socketId?: string;
  /** Node names from the root down to and including this one — 'Kernkörper / Arm / Säge'. */
  trail: string[];
}

/** One weapon a Konstrukt presents. A machine with three blades fights as three weapons. */
export interface ConstructWeapon {
  item: ItemBlock;
  /** Effektivität after the node's own scripts. */
  effectivity: number;
  /** Display name: 'Kernkörper / Säge' for a part, the bare name for the root. */
  label: string;
  depth: number;
}

const REQUIREMENT_KEYS: readonly (keyof ItemRequirements)[] =
  ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'];

// ── Basics ────────────────────────────────────────────────────────────────────

export function isConstruct(item: ItemBlock | null | undefined): boolean {
  return !!item && item.itemType === 'construct';
}

/** A node's sockets, always an array. */
export function constructSockets(item: ItemBlock | null | undefined): ConstructSocket[] {
  return item?.sockets ?? [];
}

/** Sockets with something in them. Only these cost Komplexität. */
export function usedSockets(item: ItemBlock | null | undefined): ConstructSocket[] {
  return constructSockets(item).filter(s => !!s.child);
}

/** Does this node carry anything at all? */
export function hasAttachments(item: ItemBlock | null | undefined): boolean {
  return usedSockets(item).length > 0;
}

/**
 * Give an item an id if it has none, in place.
 *
 * Not cosmetic: item-modifier bookkeeping keys on `id || name`, so two hand-made parts both called
 * 'Arm' in one machine would share a key and merge each other's Merkmale. Every node entering a
 * tree gets a real id first.
 */
export function ensureItemId(item: ItemBlock): string {
  if (!item.id) {
    item.id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  return item.id;
}

// ── Walking ───────────────────────────────────────────────────────────────────

/**
 * Every node of the tree, root first, depth-first in socket order.
 *
 * `opts.functional` drops broken and lost nodes ALONG WITH their subtrees — use it for stat
 * roll-ups. Omit it for structural ones (Komplexität, Anforderungen), which count everything.
 */
export function flattenConstruct(
  root: ItemBlock | null | undefined,
  opts: { functional?: boolean } = {},
): ConstructNode[] {
  if (!root) return [];
  const out: ConstructNode[] = [];

  const walk = (item: ItemBlock, depth: number, parentId: string | undefined,
                socketId: string | undefined, trail: string[]): void => {
    if (depth > MAX_CONSTRUCT_DEPTH) return;
    if (opts.functional && (item.broken || item.lost)) return;

    const here = [...trail, item.name];
    out.push({ item, depth, parentId, socketId, trail: here });

    for (const socket of constructSockets(item)) {
      if (socket.child) walk(socket.child, depth + 1, item.id ?? item.name, socket.id, here);
    }
  };

  walk(root, 0, undefined, undefined, []);
  return out;
}

/** Find one node anywhere in the tree by item id. */
export function findConstructNode(
  root: ItemBlock | null | undefined,
  itemId: string,
): ConstructNode | undefined {
  return flattenConstruct(root).find(n => n.item.id === itemId);
}

/** How deep the tree runs. A bare item with nothing attached is 0. */
export function constructDepth(root: ItemBlock | null | undefined): number {
  return flattenConstruct(root).reduce((max, n) => Math.max(max, n.depth), 0);
}

// ── Structural roll-ups ───────────────────────────────────────────────────────

/**
 * Nutzungskomplexität: every used socket costs the depth of the child that fills it.
 *
 * A socket on the root costs 1, one on a root child costs 2, and so on. The root itself is free —
 * carrying an unassembled Konstrukt costs nothing. Counts broken parts: they are still attached.
 */
export function constructComplexity(root: ItemBlock | null | undefined): number {
  return flattenConstruct(root).reduce((sum, n) => sum + n.depth, 0);
}

/**
 * Anforderungen of the assembled machine, per stat, with depth decay:
 * the root contributes fully, tier 2 a half, tier 3 a third — `req / (depth + 1)`.
 *
 * Summed as floats and floored ONCE per stat at the end, so a deep tree does not bleed a point at
 * every node. Stats that come out at zero are left off entirely.
 */
export function constructRequirements(root: ItemBlock | null | undefined): ItemRequirements {
  const totals = new Map<keyof ItemRequirements, number>();

  for (const node of flattenConstruct(root)) {
    const req = node.item.requirements;
    if (!req) continue;
    for (const key of REQUIREMENT_KEYS) {
      const value = req[key];
      if (!value) continue;
      totals.set(key, (totals.get(key) ?? 0) + value / (node.depth + 1));
    }
  }

  const out: ItemRequirements = {};
  for (const [key, value] of totals) {
    const floored = Math.floor(value);
    if (floored > 0) out[key] = floored;
  }
  return out;
}

// ── Functional roll-ups ───────────────────────────────────────────────────────

/** Total Stabilität of every working part. Fed into the wearer's total like any equipped item. */
export function constructStability(
  root: ItemBlock | null | undefined,
  resolve: ItemStatResolver = rawStatResolver,
): number {
  return flattenConstruct(root, { functional: true })
    .reduce((sum, n) => sum + resolve(n.item, 'stability'), 0);
}

/**
 * Every part that can actually hit something, as its own weapon.
 *
 * Reads through the resolver rather than off `efficiency`, so a Merkmal writing
 * `item.effectivity += 2 * merkmalLevel` on an otherwise structural Arm turns it into a weapon here
 * — which is the whole point of letting one node be forged from armor materials.
 */
export function constructWeapons(
  root: ItemBlock | null | undefined,
  resolve: ItemStatResolver = rawStatResolver,
): ConstructWeapon[] {
  const out: ConstructWeapon[] = [];
  for (const node of flattenConstruct(root, { functional: true })) {
    const effectivity = resolve(node.item, 'effectivity');
    if (effectivity <= 0) continue;
    out.push({
      item: node.item,
      effectivity,
      label: node.trail.join(' / '),
      depth: node.depth,
    });
  }
  return out;
}

/** Summed weight of every part, broken ones included — a dead limb still hangs off the frame. */
export function constructWeight(
  root: ItemBlock | null | undefined,
  resolve: ItemStatResolver = rawStatResolver,
): number {
  return flattenConstruct(root).reduce((sum, n) => sum + resolve(n.item, 'weight'), 0);
}

/** Summed Rüstungsmalus of every working part. */
export function constructArmorDebuff(
  root: ItemBlock | null | undefined,
  resolve: ItemStatResolver = rawStatResolver,
): number {
  return flattenConstruct(root, { functional: true })
    .reduce((sum, n) => sum + resolve(n.item, 'armorDebuff'), 0);
}

/** Summed gold value of every part — what the whole machine is worth. */
export function constructValue(root: ItemBlock | null | undefined): number {
  return flattenConstruct(root).reduce((sum, n) => sum + (n.item.value ?? 0), 0);
}

/** Fähigkeiten of every working part, each labelled with the part it came from. */
export function constructSkills(root: ItemBlock | null | undefined): SkillBlock[] {
  const out: SkillBlock[] = [];
  for (const node of flattenConstruct(root, { functional: true })) {
    for (const skill of node.item.embeddedSkills ?? []) {
      out.push({ ...skill, class: skill.class || `Konstrukt: ${node.trail.join(' / ')}` } as SkillBlock);
    }
  }
  return out;
}

/** Zauber of every working part, each labelled with the part it came from. */
export function constructSpells(root: ItemBlock | null | undefined): SpellBlock[] {
  const out: SpellBlock[] = [];
  for (const node of flattenConstruct(root, { functional: true })) {
    for (const spell of node.item.embeddedSpells ?? []) {
      out.push({ ...spell, itemOrigin: node.trail.join(' / ') } as SpellBlock);
    }
  }
  return out;
}

// ── Assembly ──────────────────────────────────────────────────────────────────

/** Why an attachment was refused, for the Bauplan to explain. */
export type AttachRefusal = 'no-such-socket' | 'socket-occupied' | 'not-a-construct' | 'too-deep' | 'cycle';

export interface AttachResult {
  /** The new root. Unchanged (same reference) when `refused` is set. */
  root: ItemBlock;
  refused?: AttachRefusal;
}

/**
 * Clone the path from the root down to `targetId`, leaving untouched branches shared.
 *
 * Returns the new root and the clone of the target, so the caller can mutate that clone freely.
 * Structural sharing keeps a deep edit cheap; the caller patches the whole root anyway.
 */
function cloneToNode(root: ItemBlock, targetId: string): { root: ItemBlock; target: ItemBlock } | null {
  if ((root.id ?? root.name) === targetId) {
    const clone: ItemBlock = { ...root, sockets: constructSockets(root).map(s => ({ ...s })) };
    return { root: clone, target: clone };
  }

  for (const [index, socket] of constructSockets(root).entries()) {
    if (!socket.child) continue;
    const below = cloneToNode(socket.child, targetId);
    if (!below) continue;
    const sockets = constructSockets(root).map(s => ({ ...s }));
    sockets[index] = { ...sockets[index], child: below.root };
    return { root: { ...root, sockets }, target: below.target };
  }
  return null;
}

/**
 * Plug `child` into one socket of one node.
 *
 * Refuses rather than throws — the Bauplan turns the reason into a message. `child` is taken as-is
 * and may itself be an assembled subtree; its own depth counts towards the ceiling.
 */
export function attachChild(
  root: ItemBlock,
  parentItemId: string,
  socketId: string,
  child: ItemBlock,
): AttachResult {
  if (!isConstruct(child)) return { root, refused: 'not-a-construct' };

  const parent = findConstructNode(root, parentItemId);
  if (!parent) return { root, refused: 'no-such-socket' };

  const socket = constructSockets(parent.item).find(s => s.id === socketId);
  if (!socket) return { root, refused: 'no-such-socket' };
  if (socket.child) return { root, refused: 'socket-occupied' };

  // Containment makes a true cycle impossible — a child comes out of the inventory, so it cannot
  // already hold its own future parent. Cheap to check anyway, and it catches a UI bug loudly.
  if (findConstructNode(child, parentItemId)) return { root, refused: 'cycle' };

  if (parent.depth + 1 + constructDepth(child) > MAX_CONSTRUCT_DEPTH) {
    return { root, refused: 'too-deep' };
  }

  // Every node entering the tree needs a stable id, or Merkmal bookkeeping merges same-named parts.
  const attached: ItemBlock = { ...child };
  ensureItemId(attached);
  for (const node of flattenConstruct(attached)) ensureItemId(node.item);

  const cloned = cloneToNode(root, parentItemId);
  if (!cloned) return { root, refused: 'no-such-socket' };

  const sockets = constructSockets(cloned.target);
  const index = sockets.findIndex(s => s.id === socketId);
  sockets[index] = { ...sockets[index], child: attached };
  cloned.target.sockets = sockets;

  return { root: cloned.root };
}

export interface DetachResult {
  /** The new root. Unchanged (same reference) when nothing was detached. */
  root: ItemBlock;
  /** The freed subtree, ready to go back into the inventory. Undefined if the socket was empty. */
  detached?: ItemBlock;
}

/**
 * Pull one subtree back out of a socket.
 *
 * Deliberately unconditional: a Konstrukt can be taken apart however broken, lost or over its Fokus
 * budget it is. Being unable to disassemble a machine you cannot run would only ever lose people
 * their gear.
 */
export function detachChild(root: ItemBlock, parentItemId: string, socketId: string): DetachResult {
  const cloned = cloneToNode(root, parentItemId);
  if (!cloned) return { root };

  const sockets = constructSockets(cloned.target);
  const index = sockets.findIndex(s => s.id === socketId);
  if (index < 0 || !sockets[index].child) return { root };

  const detached = sockets[index].child;
  sockets[index] = { ...sockets[index], child: undefined };
  cloned.target.sockets = sockets;

  return { root: cloned.root, detached };
}

/**
 * Which of a set of equipped Konstrukte actually run, resolved in order: first come, first served.
 *
 * Shared by players and Begleiter so a summon with a machine strapped to it obeys exactly the rule
 * its summoner does. Order is the owner's lever — equipment reorders by drag, so whoever cannot
 * sustain everything decides what runs by putting it first.
 *
 * An unassembled Konstrukt costs nothing and therefore always runs, even at zero free Fokus.
 */
export function resolveActiveConstructs(
  roots: readonly ItemBlock[],
  freeFokus: number,
): Set<ItemBlock> {
  const active = new Set<ItemBlock>();
  let spent = 0;
  for (const root of roots) {
    const cost = constructComplexity(root);
    if (cost === 0) { active.add(root); continue; }
    if (spent + cost > freeFokus) continue;
    spent += cost;
    active.add(root);
  }
  return active;
}

/**
 * Every part inside a machine, root excluded — what deleting it would silently take along.
 *
 * The inventory's delete has no confirm and the Recycle-Bin shows one line per entry, so without
 * this a player would bin a Kernkörper and never see three other items go with it.
 */
export function constructContents(root: ItemBlock | null | undefined): ItemBlock[] {
  return flattenConstruct(root).slice(1).map(n => n.item);
}
