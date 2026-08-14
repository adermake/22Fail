import { describe, expect, it } from 'vitest';
import { parseAttrs, esc, splitTarget } from './markdown/attrs';
import { slugify, uniqueSlug } from './markdown/slug';
import { renderMarkdown, stripFrontMatter } from './markdown/rulebook-markdown';

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

  it('renders the section directive as a box with a title', async () => {
    const { html } = await renderMarkdown(':::section{title="Würfelsystem"}\nText\n:::\n', 'g');
    expect(html).toContain('class="rb-section"');
    expect(html).toContain('id="wuerfelsystem"');
    expect(html).toContain('Würfelsystem');
  });

  it('supports note types and the formula/warning shorthands', async () => {
    const note = await renderMarkdown(':::note{type=tip}\nHinweis\n:::\n', 'g');
    expect(note.html).toContain('rb-note--tip');
    const formula = await renderMarkdown(':::formula\nLeben = 5 x KON\n:::\n', 'g');
    expect(formula.html).toContain('rb-note--formula');
    const warning = await renderMarkdown(':::warning\nAchtung\n:::\n', 'g');
    expect(warning.html).toContain('rb-note--warning');
  });

  it('nests cards inside a grid', async () => {
    const src = '::::grid{cols=3}\n:::card{title="Stärke" accent=health}\nText\n:::\n::::\n';
    const { html } = await renderMarkdown(src, 'g');
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
      'Ein :icon[dice] Wurf ist :hl[wichtig].\n\n:jump[Zum Kampf]{to=kampf#effektivitaet}\n',
      'g',
    );
    expect(html).toContain('app-icon i-dice');
    expect(html).toContain('<span class="rb-hl">wichtig</span>');
    expect(html).toContain('class="rb-jump"');
    expect(html).toContain('data-rb-anchor="effektivitaet"');
  });

  it('renders live talent data from the app data module', async () => {
    const { html } = await renderMarkdown(':::data{source=talents}\n:::\n', 'talente');
    expect(html).toContain('Athletik');
    expect(html).toContain('rb-card');
  });

  it('warns (visibly) about an unknown directive instead of breaking the page', async () => {
    const { html, warnings } = await renderMarkdown(':::bogus\nText\n:::\n', 'g');
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
      ':::card{title="<img src=x onerror=alert(1)>"}\nText\n:::\n',
      'g',
    );
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  it('keeps formula inside card inside grid (the real stats.md pattern)', async () => {
    const src = [
      '::::grid{min=300}',
      ':::card{title="Stärke" icon=attack accent=health}',
      ':::formula',
      'Würfelbonus: Stärke / 5',
      ':::',
      'Viele Waffen setzen einen Stärkewert voraus.',
      ':::',
      '',
      ':::card{title="Konstitution" accent=health}',
      'Zweite Karte.',
      ':::',
      '::::',
      '',
    ].join('\n');
    const { html } = await renderMarkdown(src, 'stats');
    expect((html.match(/class="rb-card /g) ?? []).length).toBe(2);
    expect((html.match(/rb-note--formula/g) ?? []).length).toBe(1);
    expect(html).toContain('Viele Waffen');
    expect(html.indexOf('rb-grid')).toBeLessThan(html.indexOf('Konstitution'));
  });
});
