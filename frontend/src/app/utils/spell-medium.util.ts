import { CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { SpellBlock, SpellKnowledge, generateSpellId } from '../model/spell-block-model';
import { MAX_CONSTRUCT_DEPTH, constructSockets } from './construct.util';

/**
 * Zauberwissen und Medien — who can cast what, and off which piece of material.
 *
 * The ruleset (`public/rulebook/zauber.md`) splits one question into two independent ones, and the
 * whole file exists to keep them independent:
 *
 *   WISSEN  lives on the character. `sheet.spells` is the Zauberbuch, each entry tagged
 *           'gelernt' or 'verinnerlicht'. There is no stored 'unbekannt' — not knowing a spell is
 *           simply having no entry for it.
 *   MEDIUM  lives on items. `item.embeddedSpells` are inscriptions, each with its own Haltbarkeit.
 *
 * Castability is then DERIVED and never stored: `verinnerlicht || carries a medium`. That is why a
 * scroll someone else wrote works for a character who has never heard of the spell, and why a
 * well-studied mage with an empty pack still cannot cast anything they have not internalised.
 */

// ── Identity ──────────────────────────────────────────────────────────────────

/**
 * Stable identity for a spell across its copies.
 *
 * Everything in this codebase is copy-by-value: a spell inscribed onto a scroll is a clone of the
 * Zauberbuch entry. An inscription INHERITS the book entry's id (see the Einschreiben dialog), so
 * "the same spell" is plain id equality and renaming a book entry cannot orphan its scrolls.
 * The name fallback only ever fires for legacy `embeddedSpells` authored before ids existed.
 */
export function spellKey(spell: Pick<SpellBlock, 'id' | 'name'>): string {
  if (spell.id) return spell.id;
  return (spell.name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sameSpell(
  a: Pick<SpellBlock, 'id' | 'name'>, b: Pick<SpellBlock, 'id' | 'name'>,
): boolean {
  return spellKey(a) === spellKey(b);
}

/** Normalise-on-read: a Zauberbuch entry without the field is 'gelernt'. No migration needed. */
export function spellKnowledge(spell: SpellBlock): SpellKnowledge {
  return spell.knowledge === 'verinnerlicht' ? 'verinnerlicht' : 'gelernt';
}

/**
 * Give every Zauberbuch entry an id, in place. Returns true if anything changed.
 *
 * Run on load, the way `normalizeRace` repairs races — there is no migration system here. Read
 * paths stay tolerant regardless (`spellKey` falls back to the name), because the lobby hydrates
 * characters through a different route.
 */
export function ensureSpellIds(sheet: CharacterSheet): boolean {
  let changed = false;
  for (const spell of sheet.spells ?? []) {
    if (spell && !spell.id) {
      spell.id = generateSpellId();
      changed = true;
    }
  }
  return changed;
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface SpellMedium {
  /** The item actually carrying the inscription — a Konstrukt part, if nested. */
  item: ItemBlock;
  itemName: string;
  /** The entry inside `item.embeddedSpells`. */
  inscription: SpellBlock;
  source: 'equipment' | 'inventory';
  /** Dot path of the inscription, e.g. 'equipment.2.sockets.0.child.embeddedSpells.1'. */
  path: string;
  /** Dot path of the carrying item, for setting `lost`. */
  itemPath: string;
  /** Undefined = unbegrenzt: this medium burns no Haltbarkeit. */
  durability?: number;
  maxDurability?: number;
  broken: boolean;
  /** Can this medium be cast from right now? */
  usable: boolean;
}

function mediumFrom(
  item: ItemBlock, inscription: SpellBlock, index: number,
  itemPath: string, source: 'equipment' | 'inventory',
): SpellMedium {
  const binding = inscription.binding;
  const broken = !!binding?.broken;
  const durability = binding?.durability;
  return {
    item,
    itemName: item.name,
    inscription,
    source,
    path: `${itemPath}.embeddedSpells.${index}`,
    itemPath,
    durability,
    maxDurability: binding?.maxDurability,
    broken,
    usable: !broken && (durability === undefined || durability > 0),
  };
}

/**
 * Walk one carried item and everything plugged into it, collecting inscriptions.
 *
 * Deliberately NOT `flattenConstruct` — that yields socket ids and name trails, and we need patch
 * paths. It does mirror its `functional` filter though: a lost or broken node carries no usable
 * inscription, because the Regelwerk is explicit that equipment breaking takes its engraved spell
 * with it ("Selbst wenn sie repariert wird ist der Zauber nicht mehr verwendbar").
 */
function collectFrom(
  item: ItemBlock | null | undefined, path: string,
  source: 'equipment' | 'inventory', depth: number, out: SpellMedium[],
): void {
  if (!item || depth > MAX_CONSTRUCT_DEPTH) return;
  if (item.lost || item.broken) return;

  (item.embeddedSpells ?? []).forEach((inscription, index) => {
    if (inscription) out.push(mediumFrom(item, inscription, index, path, source));
  });

  constructSockets(item).forEach((socket, index) => {
    if (socket.child) collectFrom(socket.child, `${path}.sockets.${index}.child`, source, depth + 1, out);
  });
}

/**
 * Every inscription the character is carrying.
 *
 * Equipment AND inventory both count: a Schriftrolle works out of the pack, it does not need an
 * equipment slot. This is the one place that differs from `TrueStatsService.grantingItems`, which
 * stays equipment-only — a stowed sword must not hand out its stat bonuses.
 *
 * Inventory is sparse (null = empty slot), so indices are preserved rather than filtered away;
 * the emitted paths have to address the real array position.
 */
export function carriedMedia(sheet: CharacterSheet): SpellMedium[] {
  const out: SpellMedium[] = [];
  (sheet.equipment ?? []).forEach((item, index) => {
    collectFrom(item, `equipment.${index}`, 'equipment', 0, out);
  });
  (sheet.inventory ?? []).forEach((item, index) => {
    collectFrom(item, `inventory.${index}`, 'inventory', 0, out);
  });
  return out;
}

/** Usable media carrying this spell. Broken and spent inscriptions are left out. */
export function mediaForSpell(sheet: CharacterSheet, spell: Pick<SpellBlock, 'id' | 'name'>): SpellMedium[] {
  const key = spellKey(spell);
  return carriedMedia(sheet).filter(m => m.usable && spellKey(m.inscription) === key);
}

/**
 * Resolve a spell by key across BOTH the Zauberbuch and every carried inscription, including
 * unusable ones.
 *
 * The unusable ones matter: a spell sustained from a scroll that then shattered must keep
 * resolving, or its active row silently loses its Fokus cost, duration and counters mid-fight.
 */
export function resolveSpellByKey(sheet: CharacterSheet, key: string): SpellBlock | undefined {
  const known = (sheet.spells ?? []).find(s => s && spellKey(s) === key);
  if (known) return known;
  return carriedMedia(sheet).find(m => spellKey(m.inscription) === key)?.inscription;
}

// ── The union ─────────────────────────────────────────────────────────────────

export type SpellKnowledgeState = 'unbekannt' | SpellKnowledge;

export interface CastableSpell {
  key: string;
  /** The definition to cast with. A Zauberbuch entry wins over an inscription of the same spell. */
  spell: SpellBlock;
  knowledge: SpellKnowledgeState;
  /** Usable media carrying it. Empty for a verinnerlicht spell cast from memory. */
  media: SpellMedium[];
  /** The single gate: verinnerlicht, or a medium in hand. */
  castable: boolean;
}

/**
 * What the character can put in front of them, castable or not.
 *
 * The union of the whole Zauberbuch and every carried inscription, deduped by key. A gelernt spell
 * with no medium stays IN the list, flagged uncastable — hiding it would leave the player unable to
 * see what they know, and the "Medium fehlt" state is the entire point of the rule.
 *
 * The Zauberbuch entry is the definition of record: the player may have edited its costs or script
 * after writing the scroll, and the scroll is a stale snapshot.
 */
export function castableSpells(sheet: CharacterSheet): CastableSpell[] {
  const media = carriedMedia(sheet).filter(m => m.usable);
  const byKey = new Map<string, SpellMedium[]>();
  for (const m of media) {
    const key = spellKey(m.inscription);
    const list = byKey.get(key);
    if (list) list.push(m);
    else byKey.set(key, [m]);
  }

  const out: CastableSpell[] = [];
  const seen = new Set<string>();

  for (const spell of sheet.spells ?? []) {
    if (!spell) continue;
    const key = spellKey(spell);
    if (seen.has(key)) continue;
    seen.add(key);
    const knowledge = spellKnowledge(spell);
    const carried = byKey.get(key) ?? [];
    out.push({
      key,
      spell,
      knowledge,
      media: carried,
      castable: knowledge === 'verinnerlicht' || carried.length > 0,
    });
  }

  // Inscriptions for spells the character does not know at all — someone else's scroll.
  for (const [key, carried] of byKey) {
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ key, spell: carried[0].inscription, knowledge: 'unbekannt', media: carried, castable: true });
  }

  return out;
}

// ── Einschreiben ──────────────────────────────────────────────────────────────

/** Inscription capacity. Undefined = 1: a plain surface holds one spell. */
export function inscriptionSlots(item: ItemBlock): number {
  const slots = item.inscriptionSlots;
  return slots === undefined || slots === null ? 1 : Math.max(0, slots);
}

/** Occupied slots. Burnt-out inscriptions still count — the material is spent, not freed. */
export function usedInscriptionSlots(item: ItemBlock): number {
  return (item.embeddedSpells ?? []).length;
}

export function freeInscriptionSlots(item: ItemBlock): number {
  return Math.max(0, inscriptionSlots(item) - usedInscriptionSlots(item));
}

export interface InscribableItem {
  item: ItemBlock;
  path: string;
  free: number;
  source: 'equipment' | 'inventory';
}

/**
 * Carried items that could take an inscription, for the Einschreiben picker.
 *
 * Items with no free slot are included with `free: 0` so the dialog can show them greyed rather
 * than making a player wonder where their Buch went.
 */
export function inscribableItems(sheet: CharacterSheet): InscribableItem[] {
  const out: InscribableItem[] = [];

  const walk = (item: ItemBlock | null | undefined, path: string,
                source: 'equipment' | 'inventory', depth: number): void => {
    if (!item || depth > MAX_CONSTRUCT_DEPTH) return;
    if (item.lost || item.broken) return;
    if (inscriptionSlots(item) > 0) {
      out.push({ item, path, free: freeInscriptionSlots(item), source });
    }
    constructSockets(item).forEach((socket, index) => {
      if (socket.child) walk(socket.child, `${path}.sockets.${index}.child`, source, depth + 1);
    });
  };

  (sheet.equipment ?? []).forEach((item, i) => walk(item, `equipment.${i}`, 'equipment', 0));
  (sheet.inventory ?? []).forEach((item, i) => walk(item, `inventory.${i}`, 'inventory', 0));

  // Items that already carry something first — that is where a player looks for their spellbook.
  return out.sort((a, b) => usedInscriptionSlots(b.item) - usedInscriptionSlots(a.item));
}

/**
 * The copy that goes onto a Medium.
 *
 * Keeps the id (identity across copies), drops the Zauberbuch-only and derived fields, and binds it
 * to the carrier with a fresh Haltbarkeit.
 */
export function buildInscription(
  spell: SpellBlock, itemName: string, durability: number,
): SpellBlock {
  const copy: SpellBlock = structuredClone(spell);
  delete copy.knowledge;
  delete copy.derived;
  delete copy.itemOrigin;
  copy.id = spell.id ?? generateSpellId();
  copy.binding = { type: 'item', itemName, durability, maxDurability: durability };
  return copy;
}
