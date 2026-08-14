/** Types for the markdown-driven rulebook. */

export interface RulebookPage {
  id: string;
  file: string;
  title: string;
  tab: string;
  icon?: string;
  order: number;
  /** Content hash — used as a `?v=` cache-buster (Angular does not hash assets). */
  hash: string;
}

export interface RulebookManifest {
  generatedAt: string;
  pages: RulebookPage[];
}

export interface RulebookHeading {
  id: string;
  level: number;
  text: string;
}

/** Per-render state handed to markdown-it as its `env`. */
export interface RulebookEnv {
  pageId: string;
  /** Container close tags, LIFO — directives push on open, pop on close. */
  closeStack: string[];
  seenSlugs: Map<string, number>;
  headings: RulebookHeading[];
  /** Author mistakes (unknown directive/icon/data source), surfaced in dev. */
  warnings: string[];
}

export interface RenderResult {
  html: string;
  headings: RulebookHeading[];
  warnings: string[];
}
