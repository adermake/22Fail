/**
 * Block directives: `:::name{attrs}` … `:::`
 *
 * We implement the fence rule ourselves instead of using markdown-it-container, because that
 * plugin's closing scan only compares marker LENGTH with no depth tracking — so a nested
 * `:::formula` inside a `:::card` would close the card early and leave an orphan `:::`.
 * This rule counts depth (any fence WITH a name opens, a bare `:::` closes), so authors never
 * have to count colons.
 *
 * Adding a new block directive = one entry in CONTAINER_DIRECTIVES (+ one CSS block).
 */
import type { MarkdownIt } from 'markdown-it';
import { esc, oneOf, parseAttrs, type DirectiveAttrs } from './attrs';
import { safeColor } from './inline-directives';
import { slugify } from './slug';
import type { RulebookEnv } from '../rulebook.model';
import { renderDataDirective } from '../rulebook-data-sources';

export interface ContainerDirective {
  name: string;
  render(attrs: DirectiveAttrs, env: RulebookEnv): { open: string; close: string };
}

export const iconSpan = (name: string | undefined): string =>
  name ? `<span class="app-icon i-${esc(name)}" aria-hidden="true"></span>` : '';

/** Sections are collapsible (native <details>); `collapsed` starts them closed. */
const section: ContainerDirective = {
  name: 'section',
  render: (attrs, env) => {
    const title = attrs['title'] ?? '';
    const id = attrs['id'] || (title ? slugify(title) : '');
    const collapsed = 'collapsed' in attrs || attrs['open'] === 'false';
    // Register as a jump point so the live outline (tab dropdown / search) includes sections,
    // not just markdown headings.
    if (id && title) env.headings?.push({ id, level: 3, text: title, kind: 'section' });
    const sectionColor = safeColor(attrs['color']);
    if (attrs['color'] && !sectionColor) env.warnings.push(`Unbekannte Farbe "{color=${attrs['color']}}"`);
    const sectionStyle = sectionColor ? ` style="--rb-section-color:${sectionColor}"` : '';
    return {
      open:
        `<details class="rb-section"${collapsed ? '' : ' open'}${id ? ` id="${esc(id)}"` : ''}${sectionStyle}>` +
        `<summary class="rb-section-title">${iconSpan(attrs['icon'])}` +
        `<span class="rb-section-titletext">${esc(title)}</span>` +
        `<span class="rb-section-chev" aria-hidden="true"></span></summary>` +
        `<div class="rb-section-body">`,
      close: `</div></details>`,
    };
  },
};

const NOTE_TYPES = ['info', 'formula', 'warning', 'tip'] as const;

const note: ContainerDirective = {
  name: 'note',
  render: (attrs, env) => {
    const rawColor = attrs['color'];
    // `color` may name a note TYPE (legacy spelling) or be a real custom colour.
    const type = oneOf(attrs['type'] ?? rawColor, NOTE_TYPES, 'info');
    const custom = attrs['type'] || !NOTE_TYPES.includes(rawColor as never) ? safeColor(rawColor) : null;
    if (rawColor && !custom && !NOTE_TYPES.includes(rawColor as never)) {
      env.warnings.push(`Unbekannte Farbe "{color=${rawColor}}"`);
    }
    const style = custom ? ` style="--rb-note-color:${custom}"` : '';
    const title = attrs['title'];
    return {
      open:
        `<aside class="rb-note rb-note--${type}"${style}>` +
        (title ? `<div class="rb-note-title">${iconSpan(attrs['icon'])}${esc(title)}</div>` : ''),
      close: `</aside>`,
    };
  },
};

/** `:::formula` / `:::warning` / `:::tip` are shorthands for the matching note type. */
const noteAlias = (name: string, type: (typeof NOTE_TYPES)[number]): ContainerDirective => ({
  name,
  render: (attrs, env) => note.render({ ...attrs, type }, env),
});

const grid: ContainerDirective = {
  name: 'grid',
  render: (attrs) => {
    // Coerced to a number — never interpolate raw author text into a style attribute.
    const explicitMin = Number(attrs['min']);
    const cols = Number(attrs['cols']);
    const min = Number.isFinite(explicitMin) && explicitMin > 0
      ? Math.min(600, Math.max(120, explicitMin))
      : Number.isFinite(cols) && cols > 0
        ? Math.min(600, Math.max(120, Math.round(1100 / cols)))
        : 280;
    return { open: `<div class="rb-grid" style="--rb-grid-min:${min}px">`, close: `</div>` };
  },
};

const ACCENTS = ['accent', 'health', 'energy', 'mana'] as const;

const card: ContainerDirective = {
  name: 'card',
  render: (attrs) => {
    const accent = oneOf(attrs['accent'], ACCENTS, 'accent');
    const title = attrs['title'];
    const id = attrs['id'] || (title ? `card-${slugify(title)}` : '');
    return {
      open:
        `<article class="rb-card rb-card--${accent}"${id ? ` id="${esc(id)}"` : ''}>` +
        (title ? `<h4 class="rb-card-title">${iconSpan(attrs['icon'])}${esc(title)}</h4>` : '') +
        `<div class="rb-card-body">`,
      close: `</div></article>`,
    };
  },
};

const actions: ContainerDirective = {
  name: 'actions',
  render: () => ({ open: `<div class="rb-actions">`, close: `</div>` }),
};

/** Live data straight from the app's TypeScript data modules — can never drift. */
const data: ContainerDirective = {
  name: 'data',
  render: (attrs, env) => ({ open: renderDataDirective(attrs, env), close: '' }),
};

export const CONTAINER_DIRECTIVES: ContainerDirective[] = [
  section,
  note,
  noteAlias('formula', 'formula'),
  noteAlias('warning', 'warning'),
  noteAlias('tip', 'tip'),
  grid,
  card,
  actions,
  data,
];

const COLON = 0x3a;

/** Length of the leading `:::` run on a line, or 0 if it isn't a fence. */
function fenceLen(src: string, start: number, max: number): number {
  let pos = start;
  while (pos < max && src.charCodeAt(pos) === COLON) pos++;
  const len = pos - start;
  return len >= 3 ? len : 0;
}

export function registerContainers(md: MarkdownIt): void {
  const byName = new Map(CONTAINER_DIRECTIVES.map((d) => [d.name, d]));

  md.block.ruler.before(
    'fence',
    'rb_container',
    (state: any, startLine: number, endLine: number, silent: boolean): boolean => {
      const start = state.bMarks[startLine] + state.tShift[startLine];
      const max = state.eMarks[startLine];
      if (state.src.charCodeAt(start) !== COLON) return false;

      const markerLen = fenceLen(state.src, start, max);
      if (!markerLen) return false;

      const params = state.src.slice(start + markerLen, max).trim();
      // A bare `:::` here is a stray closer (its opener already consumed its own). Ignore it
      // rather than treating it as a new container — that produced phantom "unknown directives".
      if (!params) return false;
      if (silent) return true;

      // Nesting-aware scan: a fence WITH params opens, a bare fence closes.
      let depth = 1;
      let line = startLine;
      let closed = false;
      while (line + 1 < endLine) {
        line++;
        const s = state.bMarks[line] + state.tShift[line];
        const m = state.eMarks[line];
        if (state.src.charCodeAt(s) !== COLON) continue;
        const len = fenceLen(state.src, s, m);
        if (!len) continue;
        if (state.src.slice(s + len, m).trim()) depth++;
        else if (--depth === 0) {
          closed = true;
          break;
        }
      }

      const contentEnd = closed ? line : endLine;
      const openToken = state.push('rb_container_open', 'div', 1);
      openToken.info = params;
      openToken.markup = ':'.repeat(markerLen);
      openToken.map = [startLine, contentEnd];
      openToken.block = true;

      const oldMax = state.lineMax;
      state.lineMax = contentEnd;
      state.md.block.tokenize(state, startLine + 1, contentEnd);
      state.lineMax = oldMax;

      const closeToken = state.push('rb_container_close', 'div', -1);
      closeToken.block = true;

      state.line = closed ? contentEnd + 1 : contentEnd;
      return true;
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] },
  );

  md.renderer.rules['rb_container_open'] = (tokens, idx, _o, e) => {
    const env = e as unknown as RulebookEnv;
    const info = String(tokens[idx].info);
    const name = info.split(/[\s{]/)[0];
    const def = byName.get(name);

    if (!def) {
      env.warnings.push(`Unbekannte Direktive ":::${name}"`);
      env.closeStack.push('</aside>');
      return (
        `<aside class="rb-note rb-note--warning"><div class="rb-note-title">` +
        `Unbekannte Direktive: <code>${esc(name)}</code></div>`
      );
    }

    const { open, close } = def.render(parseAttrs(info.slice(name.length)), env);
    env.closeStack.push(close);
    return open;
  };

  md.renderer.rules['rb_container_close'] = (_tokens, _idx, _o, e) =>
    (e as unknown as RulebookEnv).closeStack.pop() ?? '</div>';
}
