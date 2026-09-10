import { ItemChoiceTarget, ItemModifierTarget, ModifierOp } from '../scripting/interpreter';
import { ITEM_CHOICE_WRITABLE } from '../scripting/symbols';
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
  meleeRange: 'Nahkampfreichweite',
  rangedRange: 'Reichweite',
  maxDurability: 'Max. Haltbarkeit',
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

export interface ItemChoiceLike {
  target: ItemChoiceTarget;
  value: string;
  source?: string;
}

const CHOICE_LABEL: Record<ItemChoiceTarget, string> = {
  reloadAction: 'Nachladen',
  handed: 'Führung',
  weaponCategory: 'Waffenart',
  damageType: 'Schadenstyp',
};

/** One categorical change as text: `Nachladen → Umsonst`. */
export function formatItemChoice(choice: ItemChoiceLike): string {
  const info = ITEM_CHOICE_WRITABLE[choice.target];
  const label = info?.values.find(v => v.value === choice.value)?.label ?? choice.value;
  return `${CHOICE_LABEL[choice.target]} → ${label}`;
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
export function describeItemModifiers(
  mods: readonly ItemModifierLike[],
  choices: readonly ItemChoiceLike[] = [],
): string[] {
  const bySource = new Map<string, string[]>();
  const add = (source: string | undefined, text: string) => {
    const key = source ?? '';
    const list = bySource.get(key) ?? [];
    list.push(text);
    bySource.set(key, list);
  };
  for (const m of mods) add(m.source, formatItemModifier(m));
  // Only the choice that actually took effect is worth showing: with last-writer-wins, an
  // overridden one is not in force and listing it would just be confusing.
  const winners = new Map<ItemChoiceTarget, ItemChoiceLike>();
  for (const c of choices) winners.set(c.target, c);
  for (const c of winners.values()) add(c.source, formatItemChoice(c));

  return [...bySource].map(([source, parts]) =>
    source ? `${source}: ${parts.join(', ')}` : parts.join(', '));
}
