/**
 * Block directives: `:::name{attrs}` … `:::`
 *
 * Adding a new block directive = one entry in CONTAINER_DIRECTIVES (+ one CSS block).
 * Nothing else changes.
 */
import type { MarkdownIt } from 'markdown-it';
import { esc, oneOf, parseAttrs, type DirectiveAttrs } from './attrs';
import { slugify } from './slug';
import type { RulebookEnv } from '../rulebook.model';
import { renderDataDirective } from '../rulebook-data-sources';

export interface ContainerDirective {
  name: string;
  render(attrs: DirectiveAttrs, env: RulebookEnv): { open: string; close: string };
}

export const iconSpan = (name: string | undefined): string =>
  name ? `<span class="app-icon i-${esc(name)}" aria-hidden="true"></span>` : '';

const section: ContainerDirective = {
  name: 'section',
  render: (attrs) => {
    const title = attrs['title'] ?? '';
    const id = attrs['id'] || (title ? slugify(title) : '');
    return {
      open:
        `<section class="rb-section"${id ? ` id="${esc(id)}"` : ''}>` +
        (title
          ? `<h3 class="rb-section-title">${iconSpan(attrs['icon'])}${esc(title)}</h3>`
          : '') +
        `<div class="rb-section-body">`,
      close: `</div></section>`,
    };
  },
};

const NOTE_TYPES = ['info', 'formula', 'warning', 'tip'] as const;

const note: ContainerDirective = {
  name: 'note',
  render: (attrs) => {
    // `color` is accepted as an alias for `type` so both spellings work for authors.
    const type = oneOf(attrs['type'] ?? attrs['color'], NOTE_TYPES, 'info');
    const title = attrs['title'];
    return {
      open:
        `<aside class="rb-note rb-note--${type}">` +
        (title ? `<div class="rb-note-title">${iconSpan(attrs['icon'])}${esc(title)}</div>` : ''),
      close: `</aside>`,
    };
  },
};

/** `:::formula` and `:::warning` are shorthands for the corresponding note type. */
const noteAlias = (name: string, type: (typeof NOTE_TYPES)[number]): ContainerDirective => ({
  name,
  render: (attrs) => note.render({ ...attrs, type }, {} as RulebookEnv),
});

const grid: ContainerDirective = {
  name: 'grid',
  render: (attrs) => {
    // Coerced to a number — never interpolate raw author text into a style attribute.
    const fromCols = Number(attrs['cols']);
    const min = Number.isFinite(Number(attrs['min']))
      ? Math.min(600, Math.max(120, Number(attrs['min'])))
      : Number.isFinite(fromCols) && fromCols > 0
        ? Math.min(600, Math.max(120, Math.round(1100 / fromCols)))
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
    return {
      open:
        `<article class="rb-card rb-card--${accent}">` +
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

export function registerContainers(md: MarkdownIt, container: unknown): void {
  const use = md.use.bind(md) as (plugin: unknown, name: string, opts: unknown) => MarkdownIt;

  for (const def of CONTAINER_DIRECTIVES) {
    const head = new RegExp(`^${def.name}(?:\\s|\\{|$)`);
    use(container, def.name, {
      validate: (params: string) => head.test(params.trim()),
      render: (tokens: any[], idx: number, _o: unknown, env: RulebookEnv) => {
        const token = tokens[idx];
        if (token.nesting === 1) {
          const info: string = String(token.info).trim();
          const { open, close } = def.render(parseAttrs(info.slice(def.name.length)), env);
          env.closeStack.push(close);
          return open;
        }
        return env.closeStack.pop() ?? '</div>';
      },
    });
  }

  // Catch-all for typos — MUST be registered last (markdown-it-container inserts each
  // rule directly before 'fence', so the newest registration runs last).
  use(container, 'unknown', {
    validate: () => true,
    render: (tokens: any[], idx: number, _o: unknown, env: RulebookEnv) => {
      if (tokens[idx].nesting !== 1) return env.closeStack.pop() ?? '</div>';
      const name = String(tokens[idx].info).trim().split(/[\s{]/)[0];
      env.warnings.push(`Unbekannte Direktive ":::${name}"`);
      env.closeStack.push('</aside>');
      return (
        `<aside class="rb-note rb-note--warning"><div class="rb-note-title">` +
        `Unbekannte Direktive: <code>${esc(name)}</code></div>`
      );
    },
  });
}
