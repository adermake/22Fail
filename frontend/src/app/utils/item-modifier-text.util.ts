import { ItemModifierTarget, ModifierOp } from '../scripting/interpreter';
import { roundTo } from './round.util';

/**
 * Turning `item.<prop>` modifiers into the line a player reads on the item card.
 *
 * Schmiedemerkmale carry a free-text effect for the things a script cannot say ("Parry"), but
 * the numeric half no longer has to be written by hand — it is derived from what the script
 * actually emitted, so the text cannot drift away from the mechanics the way a hand-written
 * "+5 Effektivität" silently does after a rebalance.
 */

const TARGET_LABEL: Record<ItemModifierTarget, string> = {
  effectivity: 'Effektivität',
  stability: 'Stabilität',
  armorDebuff: 'Rüstungsmalus',
  weight: 'Gewicht',
};

/** `+5`, `−3`, `×2`, `÷2`, `= 7` — the operation as it reads to a player. */
function formatOp(op: ModifierOp, amount: number): string {
  const n = roundTo(amount, 2);
  switch (op) {
    case 'add': return n < 0 ? `−${Math.abs(n)}` : `+${n}`;
    case 'sub': return `−${n}`;
    case 'mul': return `×${n}`;
    case 'div': return `÷${n}`;
    case 'set': return `= ${n}`;
  }
}

export interface ItemModifierLike {
  target: ItemModifierTarget;
  op: ModifierOp;
  amount: number;
  source?: string;
}

/** One modifier as text: `Effektivität +5`. */
export function formatItemModifier(mod: ItemModifierLike): string {
  return `${TARGET_LABEL[mod.target]} ${formatOp(mod.op, mod.amount)}`;
}

/**
 * All of an item's active modifiers, grouped by the Merkmal that produced them:
 * `Schärfe: Effektivität +5`, `Bleifuß: Gewicht ×2, Rüstungsmalus +1`.
 *
 * Grouped rather than one line each, because a single Merkmal usually moves two or three numbers
 * and reading its name once is enough.
 */
export function describeItemModifiers(mods: readonly ItemModifierLike[]): string[] {
  const bySource = new Map<string, string[]>();
  for (const m of mods) {
    const key = m.source ?? '';
    const list = bySource.get(key) ?? [];
    list.push(formatItemModifier(m));
    bySource.set(key, list);
  }
  return [...bySource].map(([source, parts]) =>
    source ? `${source}: ${parts.join(', ')}` : parts.join(', '));
}
