import { describe, expect, it } from 'vitest';
import { parseAttrs, esc, splitTarget } from './markdown/attrs';
import { slugify, uniqueSlug } from './markdown/slug';
import { renderMarkdown, stripFrontMatter } from './markdown/rulebook-markdown';

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

  it('supports custom colours on notes, formula boxes and sections', async () => {
    const f = await renderMarkdown(md(':::formula{color=#38bdf8}', 'x', ':::'), 'g');
    expect(f.html).toContain('rb-note--formula');
    expect(f.html).toContain('--rb-note-color:#38bdf8');

    const n = await renderMarkdown(md(':::note{color=orange}', 'x', ':::'), 'g');
    expect(n.html).toContain('--rb-note-color:#f59e0b');

    const sec = await renderMarkdown(md(':::section{title="A" color=tuerkis}', 'x', ':::'), 'g');
    expect(sec.html).toContain('--rb-section-color:#06b6d4');

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
