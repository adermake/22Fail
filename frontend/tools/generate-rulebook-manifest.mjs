#!/usr/bin/env node
/**
 * Regenerates public/rulebook/index.json from the *.md files next to it.
 *
 * HTTP cannot list a directory, so the rulebook needs a manifest for its tab bar.
 * The manifest also carries a per-page OUTLINE (headings + section titles) which powers the
 * tab hover-dropdowns and gives search its high-priority "jump point" entries without having
 * to download every page first.
 *
 * This keeps authoring at "drop a .md file in" — run via npm prestart/prebuild.
 * No dependencies: front-matter is deliberately flat `key: value`.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULEBOOK_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'rulebook');
const FRONT_MATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/;

// ── Must mirror src/app/rulebook/markdown/slug.ts exactly ───────────────────────
const UMLAUTS = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[äöüß]/g, (c) => UMLAUTS[c] ?? c)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'abschnitt'
  );
}
function uniqueSlug(base, seen) {
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

function parseFrontMatter(raw) {
  const match = FRONT_MATTER.exec(raw);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const stripFrontMatter = (raw) =>
  raw.replace(/^﻿/, '').replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '');

const attr = (params, key) => {
  const m = new RegExp(`${key}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s}]+))`).exec(params);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
};

const KNOWN_DIRECTIVES = new Set([
  'section', 'note', 'formula', 'warning', 'tip', 'grid', 'card', 'actions', 'data', 'runeflow', 'table',
]);

/**
 * Checks fence balance and directive names. Unbalanced `:::` used to surface in the app as
 * phantom "Unbekannte Direktive" boxes — catching it here means the author sees it at build time.
 */
function lintFences(body, file, lineOffset = 0) {
  const problems = [];
  const stack = [];
  let inCode = false;
  let lineNo = 0;

  for (const line of body.split(/\r?\n/)) {
    lineNo++;
    const trimmed = line.trim();
    if (/^(```|~~~)/.test(trimmed)) { inCode = !inCode; continue; }
    if (inCode) continue;
    if (!/^:{3,}/.test(trimmed)) continue;

    const params = trimmed.replace(/^:{3,}/, '').trim();
    if (params) {
      const name = params.split(/[\s{]/)[0];
      if (!KNOWN_DIRECTIVES.has(name)) {
        problems.push(`${file}:${lineNo + lineOffset} unbekannte Direktive ":::${name}"`);
      }
      stack.push({ name, lineNo });
    } else if (!stack.pop()) {
      problems.push(`${file}:${lineNo + lineOffset} überzähliges ":::" ohne offenen Block`);
    }
  }
  for (const open of stack) {
    problems.push(`${file}:${open.lineNo + lineOffset} ":::${open.name}" wurde nie geschlossen`);
  }
  return problems;
}

/** Headings and :::section titles — the page's jump points, in document order. */
function buildOutline(body) {
  const seen = new Map();
  const outline = [];
  let inCode = false;

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^(```|~~~)/.test(trimmed)) { inCode = !inCode; continue; }
    if (inCode) continue;

    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(trimmed);
    if (heading) {
      let text = heading[2];
      const explicit = /\s*\{#([\w-]+)\}\s*$/.exec(text);
      let id;
      if (explicit) { id = explicit[1]; text = text.replace(/\s*\{#[\w-]+\}\s*$/, ''); }
      else id = slugify(text);
      outline.push({ id: uniqueSlug(id, seen), text, level: heading[1].length, kind: 'heading' });
      continue;
    }

    const section = /^:{3,}\s*section\b(.*)$/.exec(trimmed);
    if (section) {
      const params = section[1] ?? '';
      const title = attr(params, 'title');
      if (!title) continue;
      const id = attr(params, 'id') || slugify(title);
      outline.push({ id: uniqueSlug(id, seen), text: title, level: 3, kind: 'section' });
    }
  }
  return outline;
}

const files = (await readdir(RULEBOOK_DIR)).filter((f) => f.endsWith('.md')).sort();
const pages = [];
const problems = [];

for (const file of files) {
  const raw = await readFile(join(RULEBOOK_DIR, file), 'utf8');
  const fm = parseFrontMatter(raw);
  const id = file.replace(/\.md$/, '');
  if (!fm.title) {
    console.warn(`[rulebook] ${file}: no "title:" in front matter — falling back to "${id}"`);
  }
  pages.push({
    id,
    file,
    title: fm.title ?? id,
    tab: fm.tab ?? fm.title ?? id,
    ...(fm.icon ? { icon: fm.icon } : {}),
    order: Number.isFinite(Number(fm.order)) ? Number(fm.order) : 999,
    // Assets are NOT content-hashed by Angular, so this is the cache-buster.
    hash: createHash('sha256').update(raw).digest('hex').slice(0, 8),
    outline: buildOutline(stripFrontMatter(raw)),
  });
  const body = stripFrontMatter(raw);
  const frontMatterLines = raw.slice(0, raw.length - body.length).split(/\r?\n/).length - 1;
  problems.push(...lintFences(body, file, frontMatterLines));
}

pages.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, 'de'));

await writeFile(
  join(RULEBOOK_DIR, 'index.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), pages }, null, 2) + '\n',
  'utf8',
);

if (problems.length) {
  console.warn(`
[rulebook] ${problems.length} Problem(e) gefunden:`);
  for (const p of problems) console.warn(`  ! ${p}`);
  console.warn('');
}

const total = pages.reduce((n, p) => n + p.outline.length, 0);
console.log(
  `[rulebook] index.json: ${pages.length} page(s), ${total} Sprungmarken — ` +
    pages.map((p) => `${p.id}(${p.outline.length})`).join(', '),
);
