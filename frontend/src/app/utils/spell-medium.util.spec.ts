import { describe, expect, it } from 'vitest';
import { CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { SpellBlock } from '../model/spell-block-model';
import {
  buildInscription, canCarryInscription, carriedMedia, castableSpells, ensureSpellIds,
  freeInscriptionSlots,
  inscribableItems, mediaForSpell, resolveSpellByKey, sameSpell, spellKey, spellKnowledge,
} from './spell-medium.util';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const spell = (partial: Partial<SpellBlock>): SpellBlock =>
  ({ name: 'Zauber', description: '', tags: [], binding: { type: 'learned' }, ...partial }) as SpellBlock;

/** Haltbarkeit belongs to the ITEM: casting wears down the material, not the writing on it. */
const item = (partial: Partial<ItemBlock>): ItemBlock =>
  ({ name: 'Gegenstand', lost: false, broken: false,
     hasDurability: true, durability: 40, maxDurability: 40, ...partial }) as ItemBlock;

/** A spell inscribed on an item. The inscription carries no Haltbarkeit of its own. */
const inscribed = (name: string, id: string, broken = false): SpellBlock =>
  spell({ id, name, binding: { type: 'item', itemName: 'x', broken } });

const sheet = (partial: Partial<CharacterSheet> = {}): CharacterSheet =>
  ({ spells: [], equipment: [], inventory: [], ...partial }) as CharacterSheet;

// ── Identity ──────────────────────────────────────────────────────────────────

describe('Zauber-Identität', () => {
  it('uses the id when there is one', () => {
    expect(spellKey(spell({ id: 'spell_7', name: 'Feuerball' }))).toBe('spell_7');
  });

  it('falls back to a normalised name for legacy spells without an id', () => {
    expect(spellKey(spell({ name: '  Feuer  Ball ' }))).toBe('feuer ball');
    expect(sameSpell(spell({ name: 'Feuerball' }), spell({ name: 'FEUERBALL' }))).toBe(true);
  });

  it('treats a missing knowledge field as gelernt', () => {
    expect(spellKnowledge(spell({}))).toBe('gelernt');
    expect(spellKnowledge(spell({ knowledge: 'verinnerlicht' }))).toBe('verinnerlicht');
  });

  it('stamps ids onto Zauberbuch entries that lack one', () => {
    const s = sheet({ spells: [spell({ name: 'A' }), spell({ id: 'keep', name: 'B' })] });
    expect(ensureSpellIds(s)).toBe(true);
    expect(s.spells[0].id).toBeTruthy();
    expect(s.spells[1].id).toBe('keep');
    expect(ensureSpellIds(s)).toBe(false);
  });
});

// ── Media ─────────────────────────────────────────────────────────────────────

describe('Mitgeführte Medien', () => {
  it('finds inscriptions in equipment AND inventory', () => {
    const s = sheet({
      equipment: [item({ name: 'Stab', embeddedSpells: [inscribed('Licht', 'a')] })],
      inventory: [item({ name: 'Rolle', embeddedSpells: [inscribed('Feuer', 'b')] })],
    });
    const media = carriedMedia(s);
    expect(media.map(m => m.itemName)).toEqual(['Stab', 'Rolle']);
    expect(media.map(m => m.source)).toEqual(['equipment', 'inventory']);
  });

  it('keeps sparse inventory indices so the patch path addresses the real slot', () => {
    const s = sheet({
      inventory: [null, null, item({ name: 'Rolle', embeddedSpells: [inscribed('Feuer', 'b')] })],
    });
    const [medium] = carriedMedia(s);
    expect(medium.path).toBe('inventory.2.embeddedSpells.0');
    expect(medium.itemPath).toBe('inventory.2');
  });

  it('reaches inscriptions on Konstrukt parts and builds a nested path', () => {
    const part = item({ name: 'Arm', embeddedSpells: [inscribed('Blitz', 'c')] });
    const root = item({ name: 'Kernkörper', sockets: [{ id: 's1', child: part }] });
    const [medium] = carriedMedia(sheet({ equipment: [root] }));
    expect(medium.itemName).toBe('Arm');
    expect(medium.path).toBe('equipment.0.sockets.0.child.embeddedSpells.0');
    expect(medium.itemPath).toBe('equipment.0.sockets.0.child');
  });

  it('ignores lost and broken carriers — a shattered item takes its engraving with it', () => {
    const s = sheet({
      inventory: [
        item({ name: 'Verloren', lost: true, embeddedSpells: [inscribed('A', 'a')] }),
        item({ name: 'Kaputt', broken: true, embeddedSpells: [inscribed('B', 'b')] }),
      ],
    });
    expect(carriedMedia(s)).toEqual([]);
  });

  it('reports the carrying item Haltbarkeit, shared by every spell written on it', () => {
    const s = sheet({
      inventory: [item({
        durability: 25, maxDurability: 40,
        embeddedSpells: [inscribed('Eins', 'a'), inscribed('Zwei', 'b')],
      })],
    });
    const media = carriedMedia(s);
    expect(media.map(m => m.durability)).toEqual([25, 25]);
    expect(media.map(m => m.maxDurability)).toEqual([40, 40]);
  });

  it('marks a burnt inscription unusable while the item still has Haltbarkeit', () => {
    const s = sheet({
      inventory: [item({ embeddedSpells: [inscribed('Verbrannt', 'a', true), inscribed('Gut', 'b')] })],
    });
    expect(carriedMedia(s).map(m => m.usable)).toEqual([false, true]);
  });

  it('marks everything on a worn-out item unusable', () => {
    const s = sheet({
      inventory: [item({ durability: 0, embeddedSpells: [inscribed('Leer', 'a')] })],
    });
    expect(carriedMedia(s)[0].usable).toBe(false);
  });

  it('keeps a legacy magic item with no Haltbarkeit stat working, and never wears it', () => {
    // GM-authored wands predate this rule. New inscriptions need Haltbarkeit
    // (canCarryInscription), but an existing one must not go dark.
    const s = sheet({
      equipment: [item({
        name: 'Zauberstab', hasDurability: false, durability: undefined, maxDurability: undefined,
        embeddedSpells: [inscribed('Funke', 'a')],
      })],
    });
    const [medium] = carriedMedia(s);
    expect(medium.wears).toBe(false);
    expect(medium.usable).toBe(true);
  });

  it('only returns usable media for a given spell', () => {
    const s = sheet({
      inventory: [
        item({ durability: 0, embeddedSpells: [inscribed('Feuer', 'fb')] }),
        item({ durability: 8, embeddedSpells: [inscribed('Feuer', 'fb')] }),
      ],
    });
    expect(mediaForSpell(s, { id: 'fb', name: 'Feuer' })).toHaveLength(1);
  });
});

// ── The union ─────────────────────────────────────────────────────────────────

describe('Wirkbare Zauber', () => {
  it('lets a verinnerlicht spell be cast with no medium at all', () => {
    const s = sheet({ spells: [spell({ id: 'a', name: 'Licht', knowledge: 'verinnerlicht' })] });
    const [entry] = castableSpells(s);
    expect(entry.knowledge).toBe('verinnerlicht');
    expect(entry.media).toEqual([]);
    expect(entry.castable).toBe(true);
  });

  it('lists a gelernt spell without a medium, but not as castable', () => {
    const s = sheet({ spells: [spell({ id: 'a', name: 'Licht' })] });
    const [entry] = castableSpells(s);
    expect(entry.knowledge).toBe('gelernt');
    expect(entry.castable).toBe(false);
  });

  it('makes a gelernt spell castable once its medium is carried', () => {
    const s = sheet({
      spells: [spell({ id: 'a', name: 'Licht' })],
      inventory: [item({ name: 'Rolle', embeddedSpells: [inscribed('Licht', 'a')] })],
    });
    const [entry] = castableSpells(s);
    expect(entry.castable).toBe(true);
    expect(entry.media[0].itemName).toBe('Rolle');
  });

  it("casts a stranger's scroll for a spell the character has never learned", () => {
    const s = sheet({
      inventory: [item({ name: 'Fremde Rolle', embeddedSpells: [inscribed('Blitz', 'z')] })],
    });
    const [entry] = castableSpells(s);
    expect(entry.knowledge).toBe('unbekannt');
    expect(entry.castable).toBe(true);
  });

  it('shows a spell that is both known and inscribed exactly once, with the book definition', () => {
    const s = sheet({
      spells: [spell({ id: 'a', name: 'Licht', costMana: 9 })],
      inventory: [item({ embeddedSpells: [{ ...inscribed('Licht', 'a'), costMana: 3 }] })],
    });
    const all = castableSpells(s);
    expect(all).toHaveLength(1);
    expect(all[0].spell.costMana).toBe(9);   // the Zauberbuch entry wins over the stale scroll
    expect(all[0].media).toHaveLength(1);
  });

  it('does not count a worn-out medium as a medium', () => {
    const s = sheet({
      spells: [spell({ id: 'a', name: 'Licht' })],
      inventory: [item({ durability: 0, embeddedSpells: [inscribed('Licht', 'a')] })],
    });
    expect(castableSpells(s)[0].castable).toBe(false);
  });

  it('still resolves a spell whose medium has broken, so sustained casts survive', () => {
    const s = sheet({
      inventory: [item({ durability: 0, embeddedSpells: [inscribed('Blitz', 'z', true)] })],
    });
    expect(castableSpells(s)).toEqual([]);
    expect(resolveSpellByKey(s, 'z')?.name).toBe('Blitz');
  });

  it('resolves a Zauberbuch entry even while it has no Medium', () => {
    const s = sheet({ spells: [spell({ id: 'a', name: 'Licht' })] });
    expect(resolveSpellByKey(s, 'a')?.name).toBe('Licht');
  });

  it('leaves NSC spells castable — a statblock is a list of what it can do', () => {
    // buildNpcSheet marks them verinnerlicht; without that every NSC spell would read "Medium fehlt".
    const s = sheet({ spells: [spell({ id: 'a', name: 'Feuerhauch', knowledge: 'verinnerlicht' })] });
    expect(castableSpells(s)[0].castable).toBe(true);
  });
});

// ── Einschreiben ──────────────────────────────────────────────────────────────

describe('Einschreiben', () => {
  it('gives every item one slot by default and honours an explicit count', () => {
    expect(freeInscriptionSlots(item({}))).toBe(1);
    expect(freeInscriptionSlots(item({ inscriptionSlots: 3 }))).toBe(3);
  });

  it('counts a burnt-out inscription as still occupying its slot', () => {
    const buch = item({ inscriptionSlots: 2, embeddedSpells: [inscribed('Tot', 'a', true)] });
    expect(freeInscriptionSlots(buch)).toBe(1);
  });

  it('lists carried items with their free slots, fullest first', () => {
    const s = sheet({
      inventory: [
        item({ name: 'Leer' }),
        item({ name: 'Buch', inscriptionSlots: 3, embeddedSpells: [inscribed('A', 'a')] }),
      ],
    });
    const list = inscribableItems(s);
    expect(list.map(e => e.item.name)).toEqual(['Buch', 'Leer']);
    expect(list[0].free).toBe(2);
    expect(list[0].path).toBe('inventory.1');
  });

  it('excludes items that can hold nothing', () => {
    const s = sheet({ inventory: [item({ name: 'Stein', inscriptionSlots: 0 })] });
    expect(inscribableItems(s)).toEqual([]);
  });

  it('excludes material with no Haltbarkeit — there would be nothing to wear down', () => {
    const s = sheet({
      inventory: [
        item({ name: 'Ring', hasDurability: false, maxDurability: 0, durability: 0 }),
        item({ name: 'Rolle' }),
      ],
    });
    expect(inscribableItems(s).map(e => e.item.name)).toEqual(['Rolle']);
    expect(canCarryInscription(item({ hasDurability: false }))).toBe(false);
    expect(canCarryInscription(item({ maxDurability: 0 }))).toBe(false);
    expect(canCarryInscription(item({ maxDurability: 30 }))).toBe(true);
  });

  it('keeps the id so the scroll stays tied to its Zauberbuch entry', () => {
    const book = spell({ id: 'a', name: 'Licht', knowledge: 'verinnerlicht' });
    const copy = buildInscription(book, 'Rolle');
    expect(copy.id).toBe('a');
    expect(copy.knowledge).toBeUndefined();
    // No Haltbarkeit on the inscription — that belongs to the item it is written on.
    expect(copy.binding).toEqual({ type: 'item', itemName: 'Rolle' });
    expect(sameSpell(book, copy)).toBe(true);
  });
});
