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

/**
 * Named colours for `:hl[…]{color=…}` / `:c[…]{color=…}`.
 * Only these names or a literal hex value ever reach the style attribute — author text is
 * never interpolated raw.
 */
const NAMED_COLORS: Record<string, string> = {
  rot: '#ef4444', red: '#ef4444',
  gruen: '#22c55e', 'grün': '#22c55e', green: '#22c55e',
  blau: '#3b82f6', blue: '#3b82f6',
  gelb: '#eab308', yellow: '#eab308',
  orange: '#f59e0b',
  lila: '#a78bfa', violett: '#a78bfa', purple: '#a78bfa',
  tuerkis: '#06b6d4', 'türkis': '#06b6d4', cyan: '#06b6d4',
  pink: '#ec4899', magenta: '#ec4899',
  grau: '#9ca3af', gray: '#9ca3af', grey: '#9ca3af',
  weiss: '#ffffff', 'weiß': '#ffffff', white: '#ffffff',
  schwarz: '#111827', black: '#111827',
  // semantic aliases that follow the app theme
  leben: 'var(--health-color, #ef4444)',
  ausdauer: 'var(--energy-color, #22c55e)',
  mana: 'var(--mana-color, #3b82f6)',
  akzent: 'var(--accent, #8b5cf6)', accent: 'var(--accent, #8b5cf6)',
};

/** Returns a safe CSS colour, or null if the author wrote something unsupported. */
export function safeColor(value: string | undefined): string | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) return key;
  return null;
}

export const COLOR_NAMES = Object.keys(NAMED_COLORS);

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
  {
    // :hl[Text]              → amber highlight (unchanged)
    // :hl[Text]{color=rot}   → coloured + bold
    name: 'hl',
    render: (label, attrs, env) => {
      const raw = attrs['color'];
      const colour = safeColor(raw);
      if (raw && !colour) env.warnings.push(`Unbekannte Farbe ":hl{color=${raw}}"`);
      const style = colour ? ` style="color:${colour}"` : '';
      return `<span class="rb-hl"${style}>${esc(label)}</span>`;
    },
  },
  {
    // :c[Text]{color=#ff8800} → coloured text WITHOUT the bold highlight styling
    name: 'c',
    render: (label, attrs, env) => {
      const raw = attrs['color'];
      const colour = safeColor(raw);
      if (raw && !colour) env.warnings.push(`Unbekannte Farbe ":c{color=${raw}}"`);
      const style = colour ? ` style="color:${colour}"` : '';
      return `<span class="rb-c"${style}>${esc(label)}</span>`;
    },
  },
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
