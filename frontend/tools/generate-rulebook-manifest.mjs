#!/usr/bin/env node
/**
 * Regenerates public/rulebook/index.json from the *.md files next to it.
 *
 * HTTP cannot list a directory, so the rulebook needs a manifest for its tab bar.
 * This keeps authoring at "drop a .md file in" — run via npm prestart/prebuild.
 *
 * No dependencies: front-matter is deliberately flat `key: value`.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULEBOOK_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'rulebook');
const FRONT_MATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/;

function parseFrontMatter(raw) {
  const match = FRONT_MATTER.exec(raw);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue; // ignore blanks / comments
    out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const files = (await readdir(RULEBOOK_DIR)).filter((f) => f.endsWith('.md')).sort();
const pages = [];

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
  });
}

pages.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, 'de'));

await writeFile(
  join(RULEBOOK_DIR, 'index.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), pages }, null, 2) + '\n',
  'utf8',
);

console.log(`[rulebook] index.json: ${pages.length} page(s) — ${pages.map((p) => p.id).join(', ')}`);
