/**
 * Directive attribute parsing for the rulebook markup: `{key=value key2="two words"}`.
 *
 * NOTE: this tsconfig sets `noPropertyAccessFromIndexSignature`, so attributes are always
 * read as `attrs['title']`, never `attrs.title`.
 */

export type DirectiveAttrs = Readonly<Record<string, string>>;

const ATTR_RE = /([A-Za-z_][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s}]+)))?/g;

/** Parses `{a=1 b="two words" flag}` (braces optional). A valueless key yields ''. */
export function parseAttrs(raw: string | undefined): DirectiveAttrs {
  const out: Record<string, string> = {};
  if (!raw) return out;
  const body = raw.trim().replace(/^\{/, '').replace(/\}$/, '');
  for (const m of body.matchAll(ATTR_RE)) {
    out[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

/** Whitelist helper — every enum-ish attribute goes through this so authors can't inject classes. */
export function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value ?? '') ? (value as T) : fallback;
}

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * MANDATORY on every author-supplied value that reaches the HTML output.
 * The rendered HTML bypasses Angular's sanitizer (see rulebook-markdown.ts), so this
 * plus `html: false` is what keeps injection impossible.
 */
export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);
}

/** `stats#staerke` → { page: 'stats', anchor: 'staerke' }; `#top` → { page: '', anchor: 'top' }. */
export function splitTarget(target: string): { page: string; anchor: string } {
  const [page = '', anchor = ''] = target.replace(/\.md$/, '').split('#');
  return { page, anchor };
}
