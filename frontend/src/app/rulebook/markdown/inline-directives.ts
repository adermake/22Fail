/**
 * Inline directives: `:name[label]{attrs}` — e.g. `:icon[dice]`, `:hl[wichtig]`,
 * `:jump[Zu den Stats]{to=stats#staerke}`.
 *
 * Adding one = a single entry in INLINE_DIRECTIVES.
 * Labels are plain text (escaped, no nested markdown) — that keeps the ruler tiny.
 */
import type { MarkdownIt } from 'markdown-it';
import { esc, parseAttrs, splitTarget, type DirectiveAttrs } from './attrs';
import type { RulebookEnv } from '../rulebook.model';

export interface InlineDirective {
  name: string;
  render(label: string, attrs: DirectiveAttrs, env: RulebookEnv): string;
}

/** Icon names that exist as `.i-*` mask classes in styles.css (dev-time warning only). */
const KNOWN_ICONS = new Set([
  'token-drag', 'visibility-on', 'visibility-off', 'lobby', 'equipment', 'mana', 'map', 'draw',
  'wall', 'lasso', 'effektivity', 'dice', 'restore-trash', 'stat', 'status-effect', 'ability',
  'brewing', 'image', 'ruler', 'character', 'fog', 'active', 'texture', 'life', 'spell', 'folder',
  'energy', 'layers', 'passive', 'appearance', 'item', 'tokenlink', 'stability', 'grundbonus',
  'movement', 'reaction', 'attack', 'focus', 'soul', 'turnspeed',
]);

export const INLINE_DIRECTIVES: InlineDirective[] = [
  {
    name: 'icon',
    render: (label, attrs, env) => {
      const name = (attrs['name'] ?? label).trim();
      if (name && !KNOWN_ICONS.has(name)) env.warnings.push(`Unbekanntes Icon ":icon[${name}]"`);
      return `<span class="app-icon i-${esc(name)}" aria-hidden="true"></span>`;
    },
  },
  { name: 'hl', render: (label) => `<span class="rb-hl">${esc(label)}</span>` },
  { name: 'kbd', render: (label) => `<kbd class="rb-kbd">${esc(label)}</kbd>` },
  {
    name: 'jump',
    render: (label, attrs) => {
      const { page, anchor } = splitTarget(attrs['to'] ?? '');
      return (
        `<button type="button" class="rb-jump"` +
        ` data-rb-page="${esc(page)}"${anchor ? ` data-rb-anchor="${esc(anchor)}"` : ''}>` +
        `${esc(label || 'Weiter')}</button>`
      );
    },
  },
];

const DIRECTIVE_RE = /^:([a-z][\w-]*)(?:\[([^\]\n]*)\])?(\{[^}\n]*\})?/;

export function registerInlineDirectives(md: MarkdownIt, defs: InlineDirective[]): void {
  const byName = new Map(defs.map((d) => [d.name, d]));

  md.inline.ruler.before('link', 'rb_directive', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x3a /* : */) return false;
    // `::` is the leaf form and `:::` the container fence — never ours.
    if (state.src.charCodeAt(state.pos + 1) === 0x3a) return false;

    const m = DIRECTIVE_RE.exec(state.src.slice(state.pos));
    if (!m) return false;
    const def = byName.get(m[1]);
    if (!def) return false; // plain ":wort" text stays untouched

    if (!silent) {
      const token = state.push('rb_directive', '', 0);
      token.meta = { name: m[1], label: m[2] ?? '', attrs: parseAttrs(m[3]) };
    }
    state.pos += m[0].length;
    return true;
  });

  md.renderer.rules['rb_directive'] = (tokens, idx, _o, env) => {
    const meta = tokens[idx].meta as { name: string; label: string; attrs: DirectiveAttrs };
    const def = byName.get(meta.name);
    return def ? def.render(meta.label, meta.attrs, env as unknown as RulebookEnv) : '';
  };
}
