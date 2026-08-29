/** Types for the markdown-driven rulebook. */

/** A jump point (heading or :::section title), extracted at manifest-build time. */
export interface RulebookOutlineEntry {
  id: string;
  text: string;
  level: number;
  kind: 'heading' | 'section';
}

export interface RulebookPage {
  id: string;
  file: string;
  title: string;
  tab: string;
  icon?: string;
  order: number;
  /** Content hash — used as a `?v=` cache-buster (Angular does not hash assets). */
  hash: string;
  /** Jump points, in document order — powers the tab dropdown and search. */
  outline: RulebookOutlineEntry[];
}

/** One search hit. Jump points rank above body-text matches. */
export interface RulebookSearchHit {
  pageId: string;
  pageTab: string;
  anchor?: string;
  title: string;
  /** Surrounding text for body hits. */
  excerpt?: string;
  kind: 'jump' | 'text';
  score: number;
}

export interface RulebookManifest {
  generatedAt: string;
  pages: RulebookPage[];
}

export interface RulebookHeading {
  id: string;
  level: number;
  text: string;
  kind?: 'heading' | 'section';
}

/**
 * Data that has to be fetched before rendering (unlike talents/weapons/materials, which are
 * static TS modules). Loaded by RulebookService only when a page actually asks for it.
 */
export interface RulebookRenderContext {
  runes?: import('./../model/rune-block.model').RuneBlock[];
  /** GM-defined Waffentypen merged over the built-ins. */
  weaponTypes?: import('./../model/weapon-type-block.model').WeaponTypeBlock[];
  /** Forge materials, straight from the libraries — the numbers players actually forge with. */
  materials?: import('./../model/forging.model').MaterialBlock[];
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
  /** Async data available to :::data directives. */
  context: RulebookRenderContext;
}

export interface RenderResult {
  html: string;
  headings: RulebookHeading[];
  warnings: string[];
}
