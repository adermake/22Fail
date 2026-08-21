#!/usr/bin/env node
/**
 * Stages the built frontend into the backend so it can be served.
 *
 * This exists because the copy was previously done by hand, which silently went wrong:
 * the backend expects `backend/frontend-dist/frontend/browser`, and a hand copy produced
 * `backend/frontend-dist/browser` (one level off) holding a months-old build with no icons
 * and no rulebook. Symptoms were "icons are just squares" and "pages only update sometimes".
 *
 * Run via:  npm run deploy:stage      (builds first)
 *           npm run stage             (copy only, if you already built)
 */
import { cpSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(FRONTEND, 'dist', 'frontend', 'browser');
const DEST_ROOT = join(FRONTEND, '..', 'backend', 'frontend-dist');
const DEST = join(DEST_ROOT, 'frontend', 'browser'); // exactly what app.module.ts looks for

function fail(msg) {
  console.error('[stage] ' + msg);
  process.exit(1);
}

if (!existsSync(join(SRC, 'index.html'))) {
  fail(`no build found at ${SRC} - run "npm run build" first.`);
}

// Wipe the whole staging root so a stale layout (or deleted files) can never survive a deploy.
if (existsSync(DEST_ROOT)) rmSync(DEST_ROOT, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });

// Verify the things that actually broke before, so a bad deploy fails loudly instead of silently.
const checks = [
  ['index.html', join(DEST, 'index.html')],
  ['icons/', join(DEST, 'icons')],
  ['rulebook/index.json', join(DEST, 'rulebook', 'index.json')],
];
const missing = checks.filter(([, p]) => !existsSync(p)).map(([label]) => label);
if (missing.length) fail('staged copy is missing: ' + missing.join(', '));

const icons = readdirSync(join(DEST, 'icons')).filter((f) => f.endsWith('.svg')).length;
const pages = readdirSync(join(DEST, 'rulebook')).filter((f) => f.endsWith('.md')).length;
const built = statSync(join(DEST, 'index.html')).mtime.toISOString().slice(0, 19);

console.log(`[stage] staged -> ${DEST}`);
console.log(`[stage] build ${built} | ${icons} icons | ${pages} rulebook pages`);
console.log('[stage] restart the backend, then hard-reload the browser once.');
