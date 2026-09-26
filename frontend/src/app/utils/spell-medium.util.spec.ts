import { describe, expect, it } from 'vitest';
import { CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { SpellBlock } from '../model/spell-block-model';
import {
  buildInscription, carriedMedia, castableSpells, ensureSpellIds, freeInscriptionSlots,
  inscribableItems, mediaForSpell, resolveSpellByKey, sameSpell, spellKey, spellKnowledge,
} from './spell-medium.util';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const spell = (partial: Partial<SpellBlock>): SpellBlock =>
  ({ name: 'Zauber', description: '', tags: [], binding: { type: 'learned' }, ...partial }) as SpellBlock;

const item = (partial: Partial<ItemBlock>): ItemBlock =>
  ({ name: 'Gegenstand', lost: false, broken: false, ...partial }) as ItemBlock;

/** A spell inscribed on an item, with its own Haltbarkeit. */
const inscribed = (name: string, id: string, durability?: number, broken = false): SpellBlock =>
  spell({ id, name, binding: { type: 'item', itemName: 'x', durability, maxDurability: durability, broken } });

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
      equipment: [item({ name: 'Stab', embeddedSpells: [inscribed('Licht', 'a', 20)] })],
      inventory: [item({ name: 'Rolle', embeddedSpells: [inscribed('Feuer', 'b', 12)] })],
    });
    const media = carriedMedia(s);
    expect(media.map(m => m.itemName)).toEqual(['Stab', 'Rolle']);
    expect(media.map(m => m.source)).toEqual(['equipment', 'inventory']);
  });

  it('keeps sparse inventory indices so the patch path addresses the real slot', () => {
    const s = sheet({
      inventory: [null, null, item({ name: 'Rolle', embeddedSpells: [inscribed('Feuer', 'b', 12)] })],
    });
    const [medium] = carriedMedia(s);
    expect(medium.path).toBe('inventory.2.embeddedSpells.0');
    expect(medium.itemPath).toBe('inventory.2');
  });

  it('reaches inscriptions on Konstrukt parts and builds a nested path', () => {
    const part = item({ name: 'Arm', embeddedSpells: [inscribed('Blitz', 'c', 30)] });
    const root = item({ name: 'Kernkörper', sockets: [{ id: 's1', child: part }] });
    const [medium] = carriedMedia(sheet({ equipment: [root] }));
    expect(medium.itemName).toBe('Arm');
    expect(medium.path).toBe('equipment.0.sockets.0.child.embeddedSpells.0');
    expect(medium.itemPath).toBe('equipment.0.sockets.0.child');
  });

  it('ignores lost and broken carriers — a shattered item takes its engraving with it', () => {
    const s = sheet({
      inventory: [
        item({ name: 'Verloren', lost: true, embeddedSpells: [inscribed('A', 'a', 9)] }),
        item({ name: 'Kaputt', broken: true, embeddedSpells: [inscribed('B', 'b', 9)] }),
      ],
    });
    expect(carriedMedia(s)).toEqual([]);
  });

  it('marks spent and burnt inscriptions unusable', () => {
    const s = sheet({
      inventory: [item({
        embeddedSpells: [inscribed('Leer', 'a', 0), inscribed('Verbrannt', 'b', 9, true), inscribed('Gut', 'c', 9)],
      })],
    });
    expect(carriedMedia(s).map(m => m.usable)).toEqual([false, false, true]);
  });

  it('treats an inscription with no Haltbarkeit as unbegrenzt', () => {
    const s = sheet({ inventory: [item({ embeddedSpells: [inscribed('Ewig', 'a', undefined)] })] });
    const [medium] = carriedMedia(s);
    expect(medium.durability).toBeUndefined();
    expect(medium.usable).toBe(true);
  });

  it('only returns usable media for a given spell', () => {
    const s = sheet({
      inventory: [item({ embeddedSpells: [inscribed('Feuer', 'fb', 0), inscribed('Feuer', 'fb', 8)] })],
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
      inventory: [item({ name: 'Rolle', embeddedSpells: [inscribed('Licht', 'a', 15)] })],
    });
    const [entry] = castableSpells(s);
    expect(entry.castable).toBe(true);
    expect(entry.media[0].itemName).toBe('Rolle');
  });

  it("casts a stranger's scroll for a spell the character has never learned", () => {
    const s = sheet({
      inventory: [item({ name: 'Fremde Rolle', embeddedSpells: [inscribed('Blitz', 'z', 40)] })],
    });
    const [entry] = castableSpells(s);
    expect(entry.knowledge).toBe('unbekannt');
    expect(entry.castable).toBe(true);
  });

  it('shows a spell that is both known and inscribed exactly once, with the book definition', () => {
    const s = sheet({
      spells: [spell({ id: 'a', name: 'Licht', costMana: 9 })],
      inventory: [item({ embeddedSpells: [{ ...inscribed('Licht', 'a', 15), costMana: 3 }] })],
    });
    const all = castableSpells(s);
    expect(all).toHaveLength(1);
    expect(all[0].spell.costMana).toBe(9);   // the Zauberbuch entry wins over the stale scroll
    expect(all[0].media).toHaveLength(1);
  });

  it('does not count a spent medium as a medium', () => {
    const s = sheet({
      spells: [spell({ id: 'a', name: 'Licht' })],
      inventory: [item({ embeddedSpells: [inscribed('Licht', 'a', 0)] })],
    });
    expect(castableSpells(s)[0].castable).toBe(false);
  });

  it('still resolves a spell whose medium has broken, so sustained casts survive', () => {
    const s = sheet({
      inventory: [item({ embeddedSpells: [inscribed('Blitz', 'z', 0, true)] })],
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
    const buch = item({ inscriptionSlots: 2, embeddedSpells: [inscribed('Tot', 'a', 0, true)] });
    expect(freeInscriptionSlots(buch)).toBe(1);
  });

  it('lists carried items with their free slots, fullest first', () => {
    const s = sheet({
      inventory: [
        item({ name: 'Leer' }),
        item({ name: 'Buch', inscriptionSlots: 3, embeddedSpells: [inscribed('A', 'a', 5)] }),
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

  it('keeps the id so the scroll stays tied to its Zauberbuch entry', () => {
    const book = spell({ id: 'a', name: 'Licht', knowledge: 'verinnerlicht' });
    const copy = buildInscription(book, 'Rolle', 30);
    expect(copy.id).toBe('a');
    expect(copy.knowledge).toBeUndefined();
    expect(copy.binding).toEqual({ type: 'item', itemName: 'Rolle', durability: 30, maxDurability: 30 });
    expect(sameSpell(book, copy)).toBe(true);
  });
});
