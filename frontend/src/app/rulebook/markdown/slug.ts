/**
 * Heading → anchor slugs. German umlauts transliterate rather than get stripped, so
 * `## Stärke` becomes `#staerke` (predictable for authors writing jump links).
 */

const UMLAUTS: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      // Must run BEFORE NFD, otherwise 'ä' decomposes into 'a' + combining diaeresis
      // and we'd get 'starke' instead of 'staerke'.
      .replace(/[äöüß]/g, (c) => UMLAUTS[c] ?? c)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'abschnitt'
  );
}

/** Second occurrence of a slug on a page becomes `foo-2`, third `foo-3`, … */
export function uniqueSlug(base: string, seen: Map<string, number>): string {
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}
