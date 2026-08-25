/**
 * The rulebook markdown pipeline.
 *
 * ── SECURITY ─────────────────────────────────────────────────────────────────────
 * The rendered HTML is injected with `bypassSecurityTrustHtml` (Angular's sanitizer
 * strips `data-*` attributes and `<button>`, which the jump-link delegation needs).
 * Three invariants keep that safe and MUST hold:
 *   1. `html: false` stays set below, so raw HTML in a .md file is escaped, never passed through.
 *   2. Every author-supplied value written by a directive goes through `esc()`.
 *   3. Rulebook markdown is only ever loaded from /rulebook/*.md shipped with the build —
 *      never from user input, a character sheet field, or the backend.
 * If rulebook pages ever become user-editable, switch to a real sanitizer (e.g. DOMPurify
 * with a data-rb-* allowlist).
 *
 * ── BUNDLE ───────────────────────────────────────────────────────────────────────
 * markdown-it is pulled in via a dynamic import inside buildMarkdown(), so it lands in
 * its own lazy chunk instead of the initial bundle (which is already near its 1 MB budget).
 * Keep the `import type` above type-only.
 */
import type { MarkdownIt } from 'markdown-it';
import { registerContainers } from './containers';
import { INLINE_DIRECTIVES, registerInlineDirectives } from './inline-directives';
import { registerRenderers } from './renderers';
import type { RenderResult, RulebookEnv, RulebookRenderContext } from '../rulebook.model';

let mdPromise: Promise<MarkdownIt> | null = null;

function getMarkdown(): Promise<MarkdownIt> {
  mdPromise ??= buildMarkdown();
  return mdPromise;
}

/** esbuild CJS/ESM interop: some bundling paths yield `{ default: { default: Ctor } }`. */
function interop<T>(mod: unknown): T {
  const m = mod as { default?: { default?: unknown } | unknown };
  return ((m as any)?.default?.default ?? (m as any)?.default ?? m) as T;
}

async function buildMarkdown(): Promise<MarkdownIt> {
  const mdMod = await import('markdown-it');
  const MarkdownItCtor = interop<new (opts: unknown) => MarkdownIt>(mdMod);

  const md = new MarkdownItCtor({
    html: false, // ← load-bearing: see SECURITY above
    linkify: false, // German prose has few bare URLs; avoids surprises
    typographer: false, // don't rewrite -- / "..." in rules text
    breaks: true, // single newline = <br>; matches how the raw guide is written
  });

  registerContainers(md);
  registerInlineDirectives(md, INLINE_DIRECTIVES);
  registerRenderers(md);
  return md;
}

/** Strips YAML-ish front matter (and a UTF-8 BOM — some files in this repo carry one). */
export function stripFrontMatter(raw: string): string {
  return raw.replace(/^﻿/, '').replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '');
}

export async function renderMarkdown(
  source: string,
  pageId: string,
  context: RulebookRenderContext = {},
): Promise<RenderResult> {
  const md = await getMarkdown();
  const env: RulebookEnv = {
    pageId,
    closeStack: [],
    seenSlugs: new Map(),
    headings: [],
    warnings: [],
    context,
  };
  const html = md.render(stripFrontMatter(source), env as unknown as Record<string, unknown>);
  return { html, headings: env.headings, warnings: env.warnings };
}
