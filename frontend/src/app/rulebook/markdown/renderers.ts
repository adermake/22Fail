/**
 * Renderer overrides:
 *  - headings get slug ids so `[…](seite#anker)` works without an explicit jumpmark
 *  - internal links become data-attributes for click delegation (no SPA reload)
 */
import type { MarkdownIt } from 'markdown-it';
import { splitTarget } from './attrs';
import { slugify, uniqueSlug } from './slug';
import type { RulebookEnv } from '../rulebook.model';

const EXPLICIT_ID_RE = /\s*\{#([\w-]+)\}\s*$/;

export function registerRenderers(md: MarkdownIt): void {
  md.renderer.rules['heading_open'] = (tokens, idx, options, e, self) => {
    const env = e as unknown as RulebookEnv;
    const inline = tokens[idx + 1];
    let id: string;

    const explicit = EXPLICIT_ID_RE.exec(inline.content);
    if (explicit) {
      id = explicit[1];
      inline.content = inline.content.replace(EXPLICIT_ID_RE, '');
      // Strip the marker from the last text child too, or it renders literally.
      const kids = inline.children ?? [];
      for (let i = kids.length - 1; i >= 0; i--) {
        if (kids[i].type === 'text') {
          kids[i].content = kids[i].content.replace(EXPLICIT_ID_RE, '');
          break;
        }
      }
    } else {
      id = slugify(inline.content);
    }

    id = uniqueSlug(id, env.seenSlugs);
    env.headings.push({ id, level: Number(tokens[idx].tag.slice(1)), text: inline.content });
    tokens[idx].attrSet('id', id);
    tokens[idx].attrJoin('class', 'rb-heading');
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules['link_open'] = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    const href = String(token.attrGet('href') ?? '');

    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
      token.attrJoin('class', 'rb-link rb-link--external');
    } else {
      const { page, anchor } = splitTarget(href);
      if (page) token.attrSet('data-rb-page', page);
      if (anchor) token.attrSet('data-rb-anchor', anchor);
      token.attrSet('href', anchor && !page ? `#${anchor}` : '#');
      token.attrJoin('class', 'rb-link');
    }
    return self.renderToken(tokens, idx, options);
  };
}
