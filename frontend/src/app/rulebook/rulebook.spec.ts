import { describe, expect, it } from 'vitest';
import { parseAttrs, esc, splitTarget } from './markdown/attrs';
import { slugify, uniqueSlug } from './markdown/slug';
import { renderMarkdown, stripFrontMatter } from './markdown/rulebook-markdown';
import type { RuneBlock } from '../model/rune-block.model';
import type { WeaponTypeBlock } from '../model/weapon-type-block.model';
import type { MaterialBlock } from '../model/forging.model';

const md = (...lines: string[]) => lines.join('\n') + '\n';

describe('slugify', () => {
  it('transliterates German umlauts rather than stripping them', () => {
    expect(slugify('Stärke')).toBe('staerke');
    expect(slugify('Würfelsystem')).toBe('wuerfelsystem');
    expect(slugify('Rüstungsmalus')).toBe('ruestungsmalus');
    expect(slugify('Größe')).toBe('groesse');
  });

  it('collapses punctuation and trims', () => {
    expect(slugify('Würfel & Boni!')).toBe('wuerfel-boni');
  });

  it('deduplicates repeated headings', () => {
    const seen = new Map<string, number>();
    expect(uniqueSlug('leben', seen)).toBe('leben');
    expect(uniqueSlug('leben', seen)).toBe('leben-2');
    expect(uniqueSlug('leben', seen)).toBe('leben-3');
  });
});

describe('parseAttrs', () => {
  it('parses bare, quoted and valueless attributes', () => {
    expect(parseAttrs('{type=warning title="Achtung, Patzer!" flag}')).toEqual({
      type: 'warning',
      title: 'Achtung, Patzer!',
      flag: '',
    });
  });
  it('returns an empty object for undefined', () => {
    expect(parseAttrs(undefined)).toEqual({});
  });
});

describe('esc / splitTarget', () => {
  it('escapes HTML-significant characters', () => {
    expect(esc('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
  });
  it('splits page#anchor targets', () => {
    expect(splitTarget('stats#staerke')).toEqual({ page: 'stats', anchor: 'staerke' });
    expect(splitTarget('#top')).toEqual({ page: '', anchor: 'top' });
    expect(splitTarget('kampf')).toEqual({ page: 'kampf', anchor: '' });
  });
});

describe('stripFrontMatter', () => {
  it('removes front matter and a BOM', () => {
    expect(stripFrontMatter('﻿---\ntitle: X\n---\nHallo')).toBe('Hallo');
  });
});

describe('renderMarkdown', () => {
  it('renders headings with slug ids', async () => {
    const { html, headings } = await renderMarkdown('## Stärke\n', 'stats');
    expect(html).toContain('id="staerke"');
    expect(headings[0].id).toBe('staerke');
  });

  it('honours an explicit {#id} override without printing it', async () => {
    const { html } = await renderMarkdown('## Stärke {#str}\n', 'stats');
    expect(html).toContain('id="str"');
    expect(html).not.toContain('{#str}');
  });

  it('renders the section directive with a slugged id', async () => {
    const { html } = await renderMarkdown(md(':::section{title="Würfelsystem"}', 'Text', ':::'), 'g');
    expect(html).toContain('class="rb-section"');
    expect(html).toContain('id="wuerfelsystem"');
    expect(html).toContain('Würfelsystem');
  });

  it('supports note types and the formula/warning shorthands', async () => {
    const note = await renderMarkdown(md(':::note{type=tip}', 'Hinweis', ':::'), 'g');
    expect(note.html).toContain('rb-note--tip');
    const formula = await renderMarkdown(md(':::formula', 'Leben = 5 x KON', ':::'), 'g');
    expect(formula.html).toContain('rb-note--formula');
    const warning = await renderMarkdown(md(':::warning', 'Achtung', ':::'), 'g');
    expect(warning.html).toContain('rb-note--warning');
  });

  it('nests cards inside a grid', async () => {
    const { html } = await renderMarkdown(
      md(':::grid{cols=3}', ':::card{title="Stärke" accent=health}', 'Text', ':::', ':::'),
      'g',
    );
    expect(html).toContain('class="rb-grid"');
    expect(html).toContain('rb-card--health');
    expect(html).toContain('Stärke');
  });

  it('turns internal links into delegation data-attributes', async () => {
    const { html } = await renderMarkdown('[Basiswerte](stats#staerke)\n', 'g');
    expect(html).toContain('data-rb-page="stats"');
    expect(html).toContain('data-rb-anchor="staerke"');
  });

  it('marks external links as new-tab', async () => {
    const { html } = await renderMarkdown('[Extern](https://example.com)\n', 'g');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('renders inline icon, highlight and jump directives', async () => {
    const { html } = await renderMarkdown(
      md('Ein :icon[dice] Wurf ist :hl[wichtig].', '', ':jump[Zum Kampf]{to=kampf#effektivitaet}'),
      'g',
    );
    expect(html).toContain('url(/icons/dice.svg)');
    expect(html).toContain('<span class="rb-hl">wichtig</span>');
    expect(html).toContain('class="rb-jump"');
    expect(html).toContain('data-rb-anchor="effektivitaet"');
  });

  it('renders ANY icon file without needing a CSS class (the squares bug)', async () => {
    // `flair` has an SVG but no .i-flair class in styles.css — used to render a solid square.
    const inline = await renderMarkdown(md('Ein :icon[flair] Symbol.'), 'g');
    expect(inline.html).toContain('class="rb-icon"');
    expect(inline.html).toContain('url(/icons/flair.svg)');
    expect(inline.html).not.toContain('app-icon');

    const onCard = await renderMarkdown(md(':::card{title="X" icon=weightless}', 'y', ':::'), 'g');
    expect(onCard.html).toContain('url(/icons/weightless.svg)');

    // a name that could break out of url(...) is refused
    const bad = await renderMarkdown(md('Ein :icon[../../evil) ;x] Symbol.'), 'g');
    expect(bad.html).not.toContain('url(/icons/..');
  });

  it('supports custom text colours by name and hex, ignoring bad values', async () => {
    const named = await renderMarkdown(md('Ein :hl[Treffer]{color=rot} Wort.'), 'g');
    expect(named.html).toContain('style="color:#ef4444"');
    expect(named.warnings).toEqual([]);

    const hex = await renderMarkdown(md('Ein :c[Wert]{color=#ff8800} Wort.'), 'g');
    expect(hex.html).toContain('class="rb-c" style="color:#ff8800"');

    const themed = await renderMarkdown(md(':c[Leben]{color=leben}'), 'g');
    expect(themed.html).toContain('var(--health-color');

    // anything not whitelisted / not hex must NOT reach the style attribute
    const bad = await renderMarkdown(md(':hl[X]{color=javascript:alert(1)}'), 'g');
    expect(bad.html).not.toContain('javascript');
    expect(bad.html).toContain('<span class="rb-hl">X</span>');
    expect(bad.warnings.join()).toContain('Unbekannte Farbe');
  });

  it('supports custom colours on notes, formula boxes, sections and cards', async () => {
    const f = await renderMarkdown(md(':::formula{color=#38bdf8}', 'x', ':::'), 'g');
    expect(f.html).toContain('rb-note--formula');
    expect(f.html).toContain('--rb-note-color:#38bdf8');

    const n = await renderMarkdown(md(':::note{color=orange}', 'x', ':::'), 'g');
    expect(n.html).toContain('--rb-note-color:#f59e0b');

    const sec = await renderMarkdown(md(':::section{title="A" color=tuerkis}', 'x', ':::'), 'g');
    expect(sec.html).toContain('--rb-section-color:#06b6d4');

    const card = await renderMarkdown(md(':::card{title="A" color=pink}', 'x', ':::'), 'g');
    expect(card.html).toContain('--rb-card-color:#ec4899');
    expect(card.warnings).toEqual([]);

    // `color=` beats `accent=`: the inline custom property outranks the accent class
    const both = await renderMarkdown(md(':::card{accent=health color=#38bdf8}', 'x', ':::'), 'g');
    expect(both.html).toContain('rb-card--health');
    expect(both.html).toContain('--rb-card-color:#38bdf8');

    const badCard = await renderMarkdown(md(':::card{color=javascript:alert(1)}', 'x', ':::'), 'g');
    expect(badCard.html).not.toContain('javascript');
    expect(badCard.warnings.join()).toContain('Unbekannte Farbe');

    // legacy `color=<typename>` still selects the variant rather than a custom colour
    const legacy = await renderMarkdown(md(':::note{color=warning}', 'x', ':::'), 'g');
    expect(legacy.html).toContain('rb-note--warning');
    expect(legacy.warnings).toEqual([]);
  });

  it('renders live talent data from the app data module', async () => {
    const { html } = await renderMarkdown(md(':::data{source=talents}', ':::'), 'talente');
    expect(html).toContain('Athletik');
    expect(html).toContain('rb-card');
  });

  it('filters weapon types by Waffenart and Gewichtsklasse independently', async () => {
    const weaponTypes = [
      { id: '1', name: 'Wurfmesser', category: 'FERNKAMPF', damageType: 'Schnitt',
        meleeRange: 0, rangedRange: 20, weight: 'LEICHT', handed: 'ONE', extraEffect: '' },
      { id: '2', name: 'Kriegsaxt', category: 'SCHWER', damageType: 'Schnitt',
        meleeRange: 2, rangedRange: 0, weight: 'SCHWER', handed: 'TWO', extraEffect: 'Spaltet Schilde' },
      { id: '3', name: 'Speer', category: 'SCHWER', damageType: 'Stich',
        meleeRange: 3, rangedRange: 30, weight: 'MITTEL', handed: 'TWO', extraEffect: '' },
    ] as unknown as WeaponTypeBlock[];

    const all = await renderMarkdown(md(':::data{source=weapons}', ':::'), 'g', { weaponTypes });
    expect(all.warnings).toEqual([]);
    expect(all.html).toContain('Fernkampf (1)');
    expect(all.html).toContain('Schwer (2)');
    // A type usable both ways shows both reaches.
    expect(all.html).toContain('Nahkampf 3m · Fernkampf 30m');
    expect(all.html).toContain('Spaltet Schilde');

    // Waffenart and Gewichtsklasse are different axes: Speer is SCHWER but weighs MITTEL.
    const art = await renderMarkdown(md(':::data{source=weapons category=schwer}', ':::'), 'g', { weaponTypes });
    expect(art.html).toContain('Speer');
    expect(art.html).toContain('Kriegsaxt');
    expect(art.html).not.toContain('Wurfmesser');

    const gewicht = await renderMarkdown(md(':::data{source=weapons weight=schwer}', ':::'), 'g', { weaponTypes });
    expect(gewicht.html).toContain('Kriegsaxt');
    expect(gewicht.html).not.toContain('Speer');

    const bad = await renderMarkdown(md(':::data{source=weapons weight=fernkampf}', ':::'), 'g', { weaponTypes });
    expect(bad.warnings.join()).toContain('Gewichtsklasse');
  });

  it('supports several damage types on one weapon type', async () => {
    const weaponTypes = [
      // A sword cuts AND thrusts.
      { id: '1', name: 'Langschwert', category: 'SCHWER', damageTypes: ['Schnitt', 'Stich'],
        meleeRange: 2, rangedRange: 0, weight: 'SCHWER', handed: 'TWO', extraEffect: '' },
      { id: '2', name: 'Keule', category: 'SCHWER', damageTypes: ['Wucht'],
        meleeRange: 1, rangedRange: 0, weight: 'MITTEL', handed: 'ONE', extraEffect: '' },
    ] as unknown as WeaponTypeBlock[];

    const all = await renderMarkdown(md(':::data{source=weapons}', ':::'), 'g', { weaponTypes });
    expect(all.html).toContain('Schnitt / Stich');
    expect(all.warnings).toEqual([]);

    // `damage=` matches when ANY of the type's damage types fits.
    const stich = await renderMarkdown(md(':::data{source=weapons damage=stich}', ':::'), 'g', { weaponTypes });
    expect(stich.html).toContain('Langschwert');
    expect(stich.html).not.toContain('Keule');

    const schnitt = await renderMarkdown(md(':::data{source=weapons damage=schnitt}', ':::'), 'g', { weaponTypes });
    expect(schnitt.html).toContain('Langschwert');

    // Legacy entries with only the old single field still render.
    const legacy = [
      { id: '3', name: 'Dolch', category: 'LEICHT', damageType: 'Stich', meleeRange: 0.5,
        rangedRange: 0, weight: 'LEICHT', handed: 'ONE', extraEffect: '' },
    ] as unknown as WeaponTypeBlock[];
    const old = await renderMarkdown(md(':::data{source=weapons damage=stich}', ':::'), 'g', {
      weaponTypes: legacy,
    });
    expect(old.html).toContain('Dolch');
  });

  it('gates weapon types by Wissensstufe and filters by damage and handedness', async () => {
    const weaponTypes = [
      { id: '1', name: 'Messer', category: 'LEICHT', damageType: 'Schnitt', meleeRange: 0.5,
        rangedRange: 0, weight: 'LEICHT', handed: 'ONE', extraEffect: '', knowledgeTier: 'bekannt' },
      { id: '2', name: 'Drachenlanze', category: 'SCHWER', damageType: 'Stich', meleeRange: 3,
        rangedRange: 0, weight: 'SCHWER', handed: 'TWO', extraEffect: '', knowledgeTier: 'geheim' },
      // Ungraded must stay visible — the field is new and built-ins were always public.
      { id: '3', name: 'Keule', category: 'SCHWER', damageType: 'Wucht', meleeRange: 1,
        rangedRange: 0, weight: 'MITTEL', handed: 'ONE', extraEffect: '' },
    ] as unknown as WeaponTypeBlock[];

    const def = await renderMarkdown(md(':::data{source=weapons}', ':::'), 'g', { weaponTypes });
    expect(def.warnings).toEqual([]);
    expect(def.html).toContain('Messer');
    expect(def.html).toContain('Keule');
    expect(def.html).not.toContain('Drachenlanze');

    const all = await renderMarkdown(md(':::data{source=weapons tier=all}', ':::'), 'g', { weaponTypes });
    expect(all.html).toContain('Drachenlanze');

    const wucht = await renderMarkdown(md(':::data{source=weapons damage=wucht}', ':::'), 'g', { weaponTypes });
    expect(wucht.html).toContain('Keule');
    expect(wucht.html).not.toContain('Messer');

    const oneHanded = await renderMarkdown(md(':::data{source=weapons handed=one}', ':::'), 'g', { weaponTypes });
    expect(oneHanded.html).toContain('Messer');
    expect(oneHanded.html).toContain('Keule');

    const bad = await renderMarkdown(md(':::data{source=weapons handed=drei}', ':::'), 'g', { weaponTypes });
    expect(bad.warnings.join()).toContain('Führung');
  });

  it('reads materials from the library, not from static data', async () => {
    const materials = [
      {
        name: 'Platin', rarity: 'LEGENDARY', canBeWeaponMaterial: true, canBeArmorMaterial: true,
        isPublic: true,
        weaponStats: { haltbarkeit: 120, haltbarkeitSkalierung: 7, effektivitaet: 14,
                       effektivitaetSkalierung: 4, extraEffect: 'Bricht nie', weight: 3 },
        armorStats: { haltbarkeit: 120, haltbarkeitSkalierung: 7, effektivitaet: 15,
                      effektivitaetSkalierung: 3, extraEffect: '', weight: 4, ruestungsmalus: 2 },
      },
      {
        name: 'Eisen', rarity: 'COMMON', canBeWeaponMaterial: true, canBeArmorMaterial: false,
        isPublic: true,
        weaponStats: { haltbarkeit: 80, haltbarkeitSkalierung: 3, effektivitaet: 7,
                       effektivitaetSkalierung: 3, extraEffect: '', weight: 2 },
      },
      // `geheim` (isPublic false, ungraded) must never reach a player-facing page.
      {
        name: 'Sternenerz', rarity: 'LEGENDARY', canBeWeaponMaterial: true, canBeArmorMaterial: false,
        isPublic: false,
        weaponStats: { haltbarkeit: 200, haltbarkeitSkalierung: 9, effektivitaet: 20,
                       effektivitaetSkalierung: 5, extraEffect: '', weight: 1 },
      },
    ] as unknown as MaterialBlock[];

    const { html, warnings } = await renderMarkdown(
      md(':::data{source=materials kind=weapon}', ':::'), 'g', { materials },
    );
    expect(warnings).toEqual([]);
    // Both forge stats carry their own per-Schmiedung growth.
    expect(html).toContain('80 <span class="rb-scale">(+3)</span>');
    expect(html).toContain('7 <span class="rb-scale">(+3)</span>');
    expect(html).toContain('14 <span class="rb-scale">(+4)</span>');
    expect(html).not.toContain('Sternenerz');
    // rarity order: COMMON before LEGENDARY
    expect(html.indexOf('Eisen')).toBeLessThan(html.indexOf('Platin'));

    // Armor reads armorStats and gains a Rüstungsmalus column; Eisen is weapon-only.
    const armor = await renderMarkdown(md(':::data{source=materials kind=armor}', ':::'), 'g', { materials });
    expect(armor.html).toContain('Stabilität');
    expect(armor.html).toContain('Rüstungsmalus');
    expect(armor.html).toContain('15 <span class="rb-scale">(+3)</span>');
    expect(armor.html).not.toContain('Eisen');

    // Without library data the table says so rather than printing stale numbers.
    const none = await renderMarkdown(md(':::data{source=materials}', ':::'), 'g');
    expect(none.html).toContain('konnten nicht geladen werden');
  });

  it('gates material listings by Wissensstufe, rarity and the effect column', async () => {
    const stats = { haltbarkeit: 80, haltbarkeitSkalierung: 3, effektivitaet: 7,
                    effektivitaetSkalierung: 3, extraEffect: 'Verrät zu viel', weight: 2 };
    const materials = [
      { name: 'Eisen', rarity: 'COMMON', canBeWeaponMaterial: true, knowledgeTier: 'bekannt',
        weaponStats: { ...stats } },
      { name: 'Mondstahl', rarity: 'RARE', canBeWeaponMaterial: true, knowledgeTier: 'unbekannt',
        weaponStats: { ...stats } },
      { name: 'Sternenerz', rarity: 'LEGENDARY', canBeWeaponMaterial: true, knowledgeTier: 'geheim',
        weaponStats: { ...stats } },
    ] as unknown as MaterialBlock[];

    // Default: geheim stays hidden.
    const def = await renderMarkdown(md(':::data{source=materials}', ':::'), 'g', { materials });
    expect(def.html).toContain('Eisen');
    expect(def.html).toContain('Mondstahl');
    expect(def.html).not.toContain('Sternenerz');

    // Only common knowledge.
    const known = await renderMarkdown(md(':::data{source=materials tier=bekannt}', ':::'), 'g', { materials });
    expect(known.html).toContain('Eisen');
    expect(known.html).not.toContain('Mondstahl');

    // A GM page can ask for everything.
    const all = await renderMarkdown(md(':::data{source=materials tier=all}', ':::'), 'g', { materials });
    expect(all.html).toContain('Sternenerz');
    expect(all.warnings).toEqual([]);

    // Rarity narrows independently of tier.
    const rare = await renderMarkdown(md(':::data{source=materials rarity=rare}', ':::'), 'g', { materials });
    expect(rare.html).toContain('Mondstahl');
    expect(rare.html).not.toContain('Eisen');

    // The effect column is the main spoiler surface and can be dropped.
    const noFx = await renderMarkdown(md(':::data{source=materials effects=no}', ':::'), 'g', { materials });
    expect(noFx.html).toContain('Eisen');
    expect(noFx.html).not.toContain('Verrät zu viel');
    expect(noFx.html).not.toContain('<th>Effekt</th>');

    const bad = await renderMarkdown(md(':::data{source=materials tier=quatsch}', ':::'), 'g', { materials });
    expect(bad.warnings.join()).toContain('Wissensstufe');
  });

  it('lists armor materials even when the can-be flag predates the data', async () => {
    const materials = [
      // No canBeArmorMaterial at all — older libraries simply lack the flag.
      { name: 'Stoff', rarity: 'COMMON', isPublic: true,
        armorStats: { haltbarkeit: 50, haltbarkeitSkalierung: 5, effektivitaet: 5,
                      effektivitaetSkalierung: 5, extraEffect: '', weight: 1, ruestungsmalus: 0 } },
      // Explicitly not an armor material — must stay out.
      { name: 'Wurfstein', rarity: 'COMMON', isPublic: true, canBeArmorMaterial: false,
        armorStats: { haltbarkeit: 10, haltbarkeitSkalierung: 1, effektivitaet: 1,
                      effektivitaetSkalierung: 1, extraEffect: '', weight: 1 } },
    ] as unknown as MaterialBlock[];

    const { html, warnings } = await renderMarkdown(
      md(':::data{source=materials kind=armor}', ':::'), 'g', { materials },
    );
    expect(warnings).toEqual([]);
    expect(html).toContain('Stoff');
    expect(html).not.toContain('Wurfstein');
    expect(html).toContain('Rüstungsmalus');
  });

  it('filters data listings down to a named list, in the given order', async () => {
    const materials = [
      { name: 'Silber', rarity: 'RARE', canBeWeaponMaterial: true, isPublic: true,
        weaponStats: { haltbarkeit: 80, haltbarkeitSkalierung: 2, effektivitaet: 11,
                       effektivitaetSkalierung: 2, extraEffect: '', weight: 2 } },
      { name: 'Eisen', rarity: 'COMMON', canBeWeaponMaterial: true, isPublic: true,
        weaponStats: { haltbarkeit: 80, haltbarkeitSkalierung: 3, effektivitaet: 7,
                       effektivitaetSkalierung: 3, extraEffect: '', weight: 2 } },
      { name: 'Holz', rarity: 'COMMON', canBeWeaponMaterial: true, isPublic: true,
        weaponStats: { haltbarkeit: 50, haltbarkeitSkalierung: 5, effektivitaet: 4,
                       effektivitaetSkalierung: 3, extraEffect: '', weight: 1 } },
    ] as unknown as MaterialBlock[];

    const { html, warnings } = await renderMarkdown(
      md(':::data{source=materials names="Silber, Eisen"}', ':::'), 'g', { materials },
    );
    expect(warnings).toEqual([]);
    // The author's order wins over the rarity sort.
    expect(html.indexOf('Silber')).toBeLessThan(html.indexOf('Eisen'));
    expect(html).not.toContain('Holz');

    // A typo is reported rather than silently dropped.
    const typo = await renderMarkdown(
      md(':::data{source=materials names="Eisen, Nixda"}', ':::'), 'g', { materials },
    );
    expect(typo.html).toContain('Eisen');
    expect(typo.warnings.join()).toContain('Nixda');

    // Same filter works for runes, flattened out of their categories.
    const runes = [
      { name: 'Feuer', drawing: 'a', tags: [], runeType: 'elemental' },
      { name: 'Kreis', drawing: 'b', tags: [], runeType: 'manipulation' },
    ] as unknown as RuneBlock[];
    const picked = await renderMarkdown(md(':::data{source=runes names="Kreis"}', ':::'), 'g', { runes });
    expect(picked.html).toContain('Kreis');
    expect(picked.html).not.toContain('Feuer');
    expect(picked.warnings).toEqual([]);
  });

  it('renders runes grouped by category, with Formung split into its sub-types', async () => {
    const runes = [
      { name: 'Feuer', drawing: 'img1', glowColor: '#ff0000', tags: ['Feuer'], runeType: 'elemental' },
      { name: 'Kreis', drawing: '', tags: [], runeType: 'manipulation' },
      { name: 'Naechster', drawing: '', tags: [], runeType: 'selektor' },
      { name: 'Wurf', drawing: '', tags: [], runeType: 'ausfuehrung' },
      // legacy values must still land somewhere sensible
      { name: 'Alt-Medium', drawing: '', tags: [], runeType: 'medium' },
      { name: 'Alt-Formung', drawing: '', tags: [], runeType: 'formung' },
      { name: 'Alt-Custom', drawing: '', tags: [], runeType: 'custom' },
    ] as unknown as RuneBlock[];

    const all = await renderMarkdown(md(':::data{source=runes}', ':::'), 'runen', { runes });
    expect(all.html).toContain('rb-runegrid');
    expect(all.html).toContain('/api/images/img1');
    // legacy medium -> Elemental, legacy formung -> Manipulation, legacy custom -> Sonstiges
    expect(all.html).toContain('Elemental (2)');
    expect(all.html).toContain('Formung (4)');
    expect(all.html).toContain('Manipulation (2)');
    expect(all.html).toContain('Selektor (1)');
    expect(all.html).toContain('Sonstiges (1)');
    expect(all.warnings).toEqual([]);

    // A whole group narrows to that group, still sub-divided.
    const group = await renderMarkdown(md(':::data{source=runes type=formung}', ':::'), 'runen', { runes });
    expect(group.html).toContain('Kreis');
    expect(group.html).toContain('Ausführung (1)');
    expect(group.html).not.toContain('Feuer');
    expect(group.warnings).toEqual([]);

    // A single leaf renders bare — no redundant heading.
    const leaf = await renderMarkdown(md(':::data{source=runes type=selektor}', ':::'), 'runen', { runes });
    expect(leaf.html).toContain('Naechster');
    expect(leaf.html).not.toContain('Kreis');
    expect(leaf.warnings).toEqual([]);

    const bad = await renderMarkdown(md(':::data{source=runes type=quatsch}', ':::'), 'runen', { runes });
    expect(bad.html).toContain('Unbekannter Runentyp');
  });

  it('gates runes by Wissensstufe, defaulting ungraded ones to bekannt', async () => {
    const runes = [
      { name: 'Feuer', drawing: 'a', tags: ['Feuer'], runeType: 'elemental', knowledgeTier: 'bekannt' },
      { name: 'Mondrune', drawing: 'b', tags: ['Dunkel'], runeType: 'elemental', knowledgeTier: 'unbekannt' },
      { name: 'Geheimrune', drawing: 'c', tags: ['Dunkel'], runeType: 'elemental', knowledgeTier: 'geheim' },
      // Runes only just gained the field: an ungraded one must stay visible, not vanish.
      { name: 'Kreis', drawing: 'd', tags: ['Feuer'], runeType: 'manipulation' },
    ] as unknown as RuneBlock[];

    const def = await renderMarkdown(md(':::data{source=runes}', ':::'), 'g', { runes });
    expect(def.warnings).toEqual([]);
    expect(def.html).toContain('Feuer');
    expect(def.html).toContain('Kreis');
    expect(def.html).toContain('Mondrune');
    expect(def.html).not.toContain('Geheimrune');

    const known = await renderMarkdown(md(':::data{source=runes tier=bekannt}', ':::'), 'g', { runes });
    expect(known.html).toContain('Feuer');
    expect(known.html).toContain('Kreis'); // ungraded counts as bekannt
    expect(known.html).not.toContain('Mondrune');

    const all = await renderMarkdown(md(':::data{source=runes tier=all}', ':::'), 'g', { runes });
    expect(all.html).toContain('Geheimrune');

    // The hardcoded Seelenrune has no tier and is always common knowledge.
    const seele = await renderMarkdown(md(':::data{source=runes tier=bekannt}', ':::'), 'g', { runes });
    expect(seele.html).toContain('Seelenrune');

    // Tag filter, matching any of the listed tags.
    const tagged = await renderMarkdown(md(':::data{source=runes tags="Feuer"}', ':::'), 'g', { runes });
    expect(tagged.html).toContain('Kreis');
    expect(tagged.html).not.toContain('Mondrune');

    const bad = await renderMarkdown(md(':::data{source=runes tier=quatsch}', ':::'), 'g', { runes });
    expect(bad.warnings.join()).toContain('Wissensstufe');
  });

  it('includes the hardcoded Seelenrune in the Seele category and by name', async () => {
    const runes = [
      { name: 'Feuer', drawing: 'img1', tags: [], runeType: 'elemental' },
    ] as unknown as RuneBlock[];

    // It has no library asset, so it must be injected or the category looks empty.
    const seele = await renderMarkdown(md(':::data{source=runes type=seele}', ':::'), 'runen', { runes });
    expect(seele.html).toContain('Seelenrune');
    expect(seele.html).toContain('rb-soulglyph');
    expect(seele.warnings).toEqual([]);

    // …and it is reachable inline, including by alias.
    const inline = await renderMarkdown(md('Die :rune[Seelenrune] und :rune[summon].'), 'z', { runes });
    expect((inline.html.match(/rb-soulglyph--chip/g) ?? []).length).toBe(2);
    expect(inline.warnings).toEqual([]);

    // A real library rune of the same name wins over the hardcoded one.
    const shadowed = await renderMarkdown(md('Die :rune[Seelenrune].'), 'z', {
      runes: [{ name: 'Seelenrune', drawing: 'real', tags: [] }] as unknown as RuneBlock[],
    });
    expect(shadowed.html).toContain('/api/images/real');
    expect(shadowed.html).not.toContain('rb-soulglyph');
  });

  it('draws a single rune inline by name', async () => {
    const runes = [
      { name: 'Feuer', drawing: 'img1', glowColor: '#ff0000', tags: [] },
    ] as unknown as RuneBlock[];

    const ok = await renderMarkdown(md('Die :rune[feuer] Rune.'), 'z', { runes });
    expect(ok.html).toContain('rb-runechip');
    expect(ok.html).toContain('/api/images/img1');
    expect(ok.warnings).toEqual([]); // name match is case-insensitive

    const missing = await renderMarkdown(md('Die :rune[Nixda] Rune.'), 'z', { runes });
    expect(missing.html).toContain('rb-runechip--missing');
    expect(missing.warnings.join()).toContain('Unbekannte Rune');
  });

  it('renders a runeflow chain with arrows and labels, body kept raw', async () => {
    const runes = [
      { name: 'Feuer', drawing: 'a', tags: [] },
      { name: 'Kreis', drawing: 'b', tags: [] },
    ] as unknown as RuneBlock[];

    const { html, warnings } = await renderMarkdown(
      md(':::runeflow{title="Beispiel"}', 'Feuer -[verstaerkt]-> Kreis', 'Kreis -> Feuer', ':::'),
      'z',
      { runes },
    );
    expect(warnings).toEqual([]);
    expect(html).toContain('rb-flow-title');
    expect((html.match(/rb-flow-row/g) ?? []).length).toBe(2);
    expect((html.match(/rb-flow-arrow/g) ?? []).length).toBe(2);
    expect(html).toContain('verstaerkt');
    // the raw body must NOT have been turned into markdown paragraphs
    expect(html).not.toContain('<p>Feuer');

    const typo = await renderMarkdown(md(':::runeflow', 'Feuer -> Nixda', ':::'), 'z', { runes });
    expect(typo.html).toContain('rb-rune--missing');
    expect(typo.warnings.join()).toContain('Unbekannte Rune');
  });

  it('warns (visibly) about an unknown directive instead of breaking the page', async () => {
    const { html, warnings } = await renderMarkdown(md(':::bogus', 'Text', ':::'), 'g');
    expect(html).toContain('Unbekannte Direktive');
    expect(warnings.join()).toContain('bogus');
  });

  it('does not pass raw HTML through (html:false)', async () => {
    const { html } = await renderMarkdown('<script>alert(1)</script>\n', 'g');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes attribute values coming from the author', async () => {
    const { html } = await renderMarkdown(
      md(':::card{title="<img src=x onerror=alert(1)>"}', 'Text', ':::'),
      'g',
    );
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  // ── Regression: same-depth nesting used to close the outer container early, leaving an
  //    orphan ::: that rendered as a phantom "Unbekannte Direktive". ──────────────────────
  it('nests same-depth ::: containers without orphan closers', async () => {
    const { html, warnings } = await renderMarkdown(
      md(
        ':::section{title="Stats"}',
        ':::card{title="Stärke"}',
        ':::formula',
        'Würfelbonus: Stärke / 5',
        ':::',
        'Viele Waffen setzen einen Stärkewert voraus.',
        ':::',
        'Text nach der Karte.',
        ':::',
      ),
      'stats',
    );
    expect(warnings).toEqual([]);
    expect(html).not.toContain('Unbekannte Direktive');
    expect(html).toContain('rb-note--formula');
    expect(html).toContain('Viele Waffen');
    expect(html).toContain('Text nach der Karte.');
    // the formula must sit INSIDE the card
    expect(html.indexOf('rb-note--formula')).toBeGreaterThan(html.indexOf('rb-card'));
    expect(html.indexOf('rb-note--formula')).toBeLessThan(html.indexOf('</article>'));
  });

  it('ignores a stray closing ::: instead of inventing a directive', async () => {
    const { html, warnings } = await renderMarkdown(md('Text', '', ':::'), 'g');
    expect(warnings).toEqual([]);
    expect(html).not.toContain('Unbekannte Direktive');
  });

  it('renders sections as collapsible details, closed with {collapsed}', async () => {
    const open = await renderMarkdown(md(':::section{title="A"}', 'X', ':::'), 'g');
    expect(open.html).toContain('<details class="rb-section" open');
    const closed = await renderMarkdown(md(':::section{title="A" collapsed}', 'X', ':::'), 'g');
    expect(closed.html).toContain('<details class="rb-section"');
    expect(closed.html).not.toContain('<details class="rb-section" open');
  });

  it('reports headings AND section titles as live jump points, in document order', async () => {
    const { headings } = await renderMarkdown(
      md(
        '# Stats',
        ':::section{title="Level System"}',
        'Text',
        ':::',
        '## Konditionsstats',
        ':::section{title="Leben"}',
        'Text',
        ':::',
        '## Sonstige Stats',
      ),
      'stats',
    );
    expect(headings.map((h) => h.text)).toEqual([
      'Stats',
      'Level System',
      'Konditionsstats',
      'Leben',
      'Sonstige Stats',
    ]);
    expect(headings.find((h) => h.text === 'Level System')?.kind).toBe('section');
    expect(headings.find((h) => h.text === 'Sonstige Stats')?.id).toBe('sonstige-stats');
  });

  it('renders the whole real stats.md grid pattern cleanly', async () => {
    const { html, warnings } = await renderMarkdown(
      md(
        ':::grid{min=300}',
        ':::card{title="Stärke" icon=attack accent=health}',
        ':::formula',
        'Würfelbonus: Stärke / 5',
        ':::',
        'Viele Waffen setzen einen Stärkewert voraus.',
        ':::',
        ':::card{title="Konstitution" accent=health}',
        'Zweite Karte.',
        ':::',
        ':::',
      ),
      'stats',
    );
    expect(warnings).toEqual([]);
    expect((html.match(/class="rb-card /g) ?? []).length).toBe(2);
    expect((html.match(/rb-note--formula/g) ?? []).length).toBe(1);
    expect(html.indexOf('rb-grid')).toBeLessThan(html.indexOf('Konstitution'));
  });
});
