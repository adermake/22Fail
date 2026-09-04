#!/usr/bin/env node
/**
 * Packs the Wonderdraft sprite library into texture atlases for the map editor.
 *
 * Nearly a thousand loose PNGs would mean a thousand texture binds, which breaks Pixi's
 * sprite batching exactly when it matters most — a map with tens of thousands of symbols on
 * screen. Packing them into a handful of pages keeps the whole library in a few binds.
 *
 * Source of truth for symbol behaviour is Wonderdraft's own `.wonderdraft_symbols` sidecar,
 * not guesswork about the pixels:
 *   - `draw_mode: "sample_color"` → the symbol is drawn in the land colour ("white" symbols)
 *   - `draw_mode: "normal"`       → the symbol keeps its baked colours
 *   - `custom_colors*`            → multi-slot recolouring; treated as baked for now, but the
 *                                   raw mode is preserved so it can be supported later
 *   - `offset_x`/`offset_y`       → anchor relative to the image centre. This is the symbol's
 *                                   visual base (a tree's trunk, not its bounding box), which
 *                                   is what placement and y-sorting must use.
 *
 * The sidecar comes in two shapes: one object describing a whole folder, or an object keyed
 * by file stem describing each sprite. Both are handled.
 *
 * Run via npm prestart/prebuild. Skips silently when the source library is absent, so a
 * checkout without the (large, licensed) Wonderdraft extract still builds.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'DraftExtract', 'sprites');
const TEXTURE_SRC = join(HERE, 'DraftExtract', 'textures', 'ground');
const OUT = join(HERE, '..', 'public', 'mapassets');

/**
 * Paper textures are shipped at half resolution and as pure luminance.
 *
 * They are multiplied over the palette colour, so only their brightness matters — dropping
 * the colour channels turns a 6 MB RGB source into a few hundred KB of greyscale, which is
 * the difference between shipping six of them and shipping none.
 */
const PAPER_SIZE = 1024;

/** Top-level source folders → the editor's three symbol categories. */
const CATEGORIES = { trees: 'trees', mountains: 'mountains', symbols: 'misc' };

const PAGE_SIZE = 4096;
/** Transparent gutter between sprites; stops neighbours bleeding in at fractional zoom. */
const PADDING = 2;

// ── source scanning ──

async function readSidecar(dir) {
  try {
    return JSON.parse(await readFile(join(dir, '.wonderdraft_symbols'), 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Resolve one sprite's metadata from a sidecar that may describe the folder as a whole or
 * each sprite individually.
 */
function metaFor(sidecar, stem) {
  if (!sidecar) return null;
  if (typeof sidecar.draw_mode === 'string') return sidecar; // folder-wide
  const entry = sidecar[stem];
  return entry && typeof entry === 'object' ? entry : null;
}

async function collectSprites() {
  const sprites = [];
  const groups = new Map();
  let flattenedCustomColor = 0;

  for (const [folder, category] of Object.entries(CATEGORIES)) {
    const catDir = join(SRC, folder);
    if (!existsSync(catDir)) continue;

    const groupDirs = (await readdir(catDir, { withFileTypes: true }))
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();

    for (const groupName of groupDirs) {
      const groupDir = join(catDir, groupName);
      const sidecar = await readSidecar(groupDir);
      const files = (await readdir(groupDir)).filter(f => f.toLowerCase().endsWith('.png')).sort();
      if (files.length === 0) continue;

      const groupId = `${category}/${groupName}`;
      const members = [];

      for (const file of files) {
        const stem = file.replace(/\.png$/i, '');
        let png;
        try {
          png = PNG.sync.read(await readFile(join(groupDir, file)));
        } catch (err) {
          // The extract contains a few truncated files; skipping beats failing the build.
          console.warn(`  ! skipped unreadable ${groupId}/${stem}: ${err.message}`);
          continue;
        }

        const meta = metaFor(sidecar, stem) ?? {};
        const drawMode = meta.draw_mode ?? 'normal';

        /*
         * Wonderdraft's multi-slot recolour sprites, flattened to a tintable silhouette.
         *
         * Their RGB channels are not colours: they are per-slot *weights* that sum to 255,
         * saying which colour slot each pixel belongs to. Measured across the library, R+G+B
         * is 255 to within a rounding error, so the channels carry no brightness whatsoever —
         * the shape lives entirely in the (antialiased) alpha. Drawn as an ordinary image
         * that reads as a garish red/blue mask, which is why these were dropped outright.
         *
         * Whiting out the RGB and keeping the alpha is therefore lossless for a single-colour
         * render, and single-colour is what Wonderdraft itself shows when the slots are set
         * to one colour. The tint is then chosen per symbol at placement.
         *
         * What is genuinely lost is *per-slot* colouring — a town whose roofs and walls take
         * different colours comes out in one. That needs a second tint on the symbol model
         * and a two-channel shader; until then one colour beats no symbol.
         */
        const multiSlot = drawMode === 'custom_colors' || drawMode === 'custom_colors_2';
        if (multiSlot) {
          flattenSlotMask(png);
          flattenedCustomColor++;
        }

        const id = `${groupId}/${stem}`;

        sprites.push({
          id,
          groupId,
          category,
          png,
          w: png.width,
          h: png.height,
          name: meta.name ?? stem,
          radius: meta.radius ?? Math.round(Math.max(png.width, png.height) / 2),
          offsetX: meta.offset_x ?? 0,
          offsetY: meta.offset_y ?? 0,
          drawMode,
          colorable: drawMode === 'sample_color',
          /*
           * Distinct from `colorable`, which means "take the colour of the ground beneath".
           * These are drawn in a colour the user picks, so tinting them to the land would
           * make them vanish into it.
           */
          tintable: multiSlot,
        });
        members.push(id);
      }

      if (members.length === 0) continue;

      // Wonderdraft prefixes de-emphasised groups with '~' and sorts them last.
      const deprioritised = groupName.startsWith('~');
      groups.set(groupId, {
        id: groupId,
        category,
        // Folder-wide sidecars carry the human-readable group name.
        name: (sidecar && typeof sidecar.draw_mode === 'string' && sidecar.name) || prettify(groupName),
        deprioritised,
        sprites: members,
      });
    }
  }

  if (flattenedCustomColor) {
    console.log(
      `[map-atlas] flattened ${flattenedCustomColor} multi-slot recolour sprites to tintable ` +
        'silhouettes',
    );
  }
  return { sprites, groups };
}

function prettify(name) {
  return name
    .replace(/^~/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

// ── packing ──

/**
 * Shelf packer over height-sorted sprites.
 *
 * Sprites here are small and similar in scale, where a shelf packer lands within a few
 * percent of an optimal bin pack — not worth a dependency or a skyline implementation.
 */
function pack(sprites) {
  const sorted = [...sprites].sort((a, b) => b.h - a.h || b.w - a.w);
  const pages = [];

  for (const s of sorted) {
    const needW = s.w + PADDING;
    const needH = s.h + PADDING;

    if (needW > PAGE_SIZE || needH > PAGE_SIZE) {
      console.warn(`  ! ${s.id} is ${s.w}x${s.h}, larger than a ${PAGE_SIZE}px page — skipped`);
      continue;
    }

    let placed = false;
    for (const page of pages) {
      if (tryPlace(page, s, needW, needH)) {
        placed = true;
        break;
      }
    }
    if (!placed) {
      const page = { index: pages.length, shelves: [], used: 0, sprites: [] };
      pages.push(page);
      tryPlace(page, s, needW, needH);
    }
  }

  return pages;
}

function tryPlace(page, sprite, needW, needH) {
  for (const shelf of page.shelves) {
    if (needH <= shelf.height && shelf.x + needW <= PAGE_SIZE) {
      sprite.x = shelf.x;
      sprite.y = shelf.y;
      sprite.page = page.index;
      shelf.x += needW;
      page.sprites.push(sprite);
      return true;
    }
  }

  // No shelf fits; open a new one if the page has vertical room left.
  if (page.used + needH > PAGE_SIZE) return false;

  const shelf = { y: page.used, x: needW, height: needH };
  page.used += needH;
  page.shelves.push(shelf);

  sprite.x = 0;
  sprite.y = shelf.y;
  sprite.page = page.index;
  page.sprites.push(sprite);
  return true;
}

// ── output ──

function renderPage(page) {
  const out = new PNG({ width: PAGE_SIZE, height: PAGE_SIZE });
  out.data.fill(0);

  for (const s of page.sprites) {
    // bitblt copies straight into the destination buffer, preserving the source alpha.
    PNG.bitblt(s.png, out, 0, 0, s.w, s.h, s.x, s.y);
  }
  return out;
}

/** Trim the page to the height actually used — a mostly-empty 4096px page wastes VRAM. */
function usedHeight(page) {
  let max = 0;
  for (const s of page.sprites) max = Math.max(max, s.y + s.h);
  return Math.max(1, Math.min(PAGE_SIZE, nextPowerOfTwo(max)));
}

function nextPowerOfTwo(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Newest mtime anywhere under a directory tree.
 * Packing a thousand PNGs takes long enough that doing it on every `npm start` would be a
 * real tax, so the build is skipped when nothing in the library has changed.
 */
async function newestMtime(dir) {
  let newest = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    const t = e.isDirectory() ? await newestMtime(p) : (await stat(p)).mtimeMs;
    if (t > newest) newest = t;
  }
  return newest;
}

async function isUpToDate() {
  try {
    const manifest = await stat(join(OUT, 'manifest.json'));
    let newest = await newestMtime(SRC);
    if (existsSync(TEXTURE_SRC)) newest = Math.max(newest, await newestMtime(TEXTURE_SRC));
    return newest <= manifest.mtimeMs;
  } catch {
    return false; // no manifest yet
  }
}

/**
 * Convert a ground texture to a tiling greyscale paper texture.
 *
 * Box-filtered rather than point-sampled: these are noisy grain textures, and dropping
 * every other pixel would alias the grain into visible artefacts once it tiles across a map.
 */
function toPaperTexture(src) {
  const factor = Math.max(1, Math.round(src.width / PAPER_SIZE));
  const size = Math.floor(src.width / factor);
  const out = new PNG({ width: size, height: size, colorType: 0 });

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const sx = x * factor + dx;
          const sy = y * factor + dy;
          if (sx >= src.width || sy >= src.height) continue;
          const i = (sy * src.width + sx) * 4;
          // Rec. 601 luma — the texture only contributes brightness to the multiply.
          sum += 0.299 * src.data[i] + 0.587 * src.data[i + 1] + 0.114 * src.data[i + 2];
          n++;
        }
      }
      const v = n ? Math.round(sum / n) : 255;
      const o = (y * size + x) * 4;
      out.data[o] = out.data[o + 1] = out.data[o + 2] = v;
      out.data[o + 3] = 255;
    }
  }
  return { png: out, size };
}

/**
 * Extract Wonderdraft's UI icons.
 *
 * The extract keeps icons only as Godot `.stex` containers plus `.import` stubs — the
 * plain PNGs are gone. A `.stex` in lossless mode is a short header followed by a complete
 * embedded PNG, so slicing from the PNG signature to the end recovers the original file
 * (PNG decoders stop at IEND and ignore any trailing bytes).
 *
 * Using the real icons matters: a toolbar of German words is unreadable at a glance next to
 * the tool shapes the user already knows from Wonderdraft.
 */
async function buildIcons() {
  const iconDir = join(HERE, 'DraftExtract', 'icons');
  const importDir = join(HERE, 'DraftExtract', '.import');
  if (!existsSync(iconDir) || !existsSync(importDir)) return [];

  const outDir = join(OUT, 'icons');
  await mkdir(outDir, { recursive: true });

  const stubs = (await readdir(iconDir)).filter(f => f.endsWith('.png.import')).sort();
  const names = [];

  for (const stub of stubs) {
    const name = stub.replace(/\.png\.import$/, '');

    // The stub names the container, which carries a content hash we cannot guess.
    const text = await readFile(join(iconDir, stub), 'utf-8');
    const m = /path="res:\/\/\.import\/([^"]+)"/.exec(text);
    if (!m) continue;

    let raw;
    try {
      raw = await readFile(join(importDir, m[1]));
    } catch {
      continue; // container missing from the extract
    }

    const start = raw.indexOf(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    if (start < 0) continue; // not a lossless PNG payload (raw or compressed format)

    // Some containers pad after the payload. Cut at the IEND chunk (4-byte type plus its
    // 4-byte CRC) rather than at end-of-file, or strict decoders reject the trailing bytes.
    const iend = raw.indexOf('IEND', start, 'ascii');
    const end = iend < 0 ? raw.length : iend + 8;

    await writeFile(join(outDir, `${name}.png`), raw.subarray(start, end));
    names.push(name);
  }

  console.log(`[map-atlas] extracted ${names.length} icons`);
  return names;
}

async function buildPaperTextures() {
  if (!existsSync(TEXTURE_SRC)) return [];

  const files = (await readdir(TEXTURE_SRC)).filter(f => f.endsWith('.wonderdraft_image')).sort();
  const out = [];

  for (const file of files) {
    const name = file.replace(/\.wonderdraft_image$/, '');
    let src;
    try {
      // Despite the extension these are ordinary PNGs.
      src = PNG.sync.read(await readFile(join(TEXTURE_SRC, file)));
    } catch (err) {
      console.warn(`  ! skipped paper texture ${name}: ${err.message}`);
      continue;
    }

    const { png, size } = toPaperTexture(src);

    // Some themes ship a flat placeholder (Wonderdraft's Black & White has no grain).
    // Multiplying by a constant does nothing, so offering it would be a no-op option.
    let min = 255;
    let max = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      const v = png.data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (max - min < 4) {
      console.log(`[map-atlas]   (skipped ${name} — flat, no grain to multiply)`);
      continue;
    }

    const outFile = `paper-${name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}.png`;
    await writeFile(join(OUT, outFile), PNG.sync.write(png, { colorType: 0 }));

    out.push({ id: outFile.replace(/^paper-|\.png$/g, ''), name, file: outFile, size });
    console.log(`[map-atlas]   ${outFile}  ${size}x${size}`);
  }

  return out;
}

async function main() {
  if (!existsSync(SRC)) {
    console.log('[map-atlas] no DraftExtract/sprites found — skipping atlas generation');
    return;
  }

  const force = process.argv.includes('--force');
  if (!force && (await isUpToDate())) {
    console.log('[map-atlas] atlases are up to date — skipping (use --force to rebuild)');
    return;
  }

  console.log('[map-atlas] scanning sprite library …');
  const { sprites, groups } = await collectSprites();
  console.log(`[map-atlas] ${sprites.length} sprites in ${groups.size} groups`);

  const pages = pack(sprites);
  console.log(`[map-atlas] packed into ${pages.length} page(s)`);

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const pageFiles = [];
  for (const page of pages) {
    const full = renderPage(page);
    const height = usedHeight(page);

    // Re-crop to the used height rather than shipping empty rows.
    const cropped = new PNG({ width: PAGE_SIZE, height });
    PNG.bitblt(full, cropped, 0, 0, PAGE_SIZE, height, 0, 0);

    const file = `atlas-${page.index}.png`;
    await writeFile(join(OUT, file), PNG.sync.write(cropped));
    pageFiles.push({ file, width: PAGE_SIZE, height });
    console.log(`[map-atlas]   ${file}  ${PAGE_SIZE}x${height}  (${page.sprites.length} sprites)`);
  }

  console.log('[map-atlas] building paper textures …');
  const paperTextures = await buildPaperTextures();
  const icons = await buildIcons();

  // Deliberately no timestamp: the manifest is committed, and a generation time would make
  // every rebuild a diff even when nothing about the sprite library changed. Packing is
  // deterministic (sorted input, stable shelf packer), so identical sources produce
  // identical bytes.
  const manifest = {
    pages: pageFiles,
    paperTextures,
    icons,
    categories: {},
    groups: {},
    sprites: {},
  };

  for (const [id, g] of groups) {
    (manifest.categories[g.category] ??= []).push(id);
    manifest.groups[id] = {
      id,
      category: g.category,
      name: g.name,
      deprioritised: g.deprioritised,
      sprites: g.sprites,
    };
  }
  // '~' groups sort last, matching Wonderdraft's own ordering.
  for (const list of Object.values(manifest.categories)) {
    list.sort((a, b) => {
      const ga = manifest.groups[a];
      const gb = manifest.groups[b];
      if (ga.deprioritised !== gb.deprioritised) return ga.deprioritised ? 1 : -1;
      return ga.name.localeCompare(gb.name);
    });
  }

  for (const s of sprites) {
    if (s.page === undefined) continue; // skipped during packing
    manifest.sprites[s.id] = {
      page: s.page,
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      name: s.name,
      radius: s.radius,
      offsetX: s.offsetX,
      offsetY: s.offsetY,
      drawMode: s.drawMode,
      colorable: s.colorable,
      tintable: s.tintable,
    };
  }

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest), 'utf-8');

  const colorable = sprites.filter(s => s.colorable).length;
  console.log(
    `[map-atlas] wrote manifest: ${Object.keys(manifest.sprites).length} sprites ` +
      `(${colorable} colourable, ${sprites.length - colorable} baked)`,
  );
}

await main();

/**
 * Turn a Wonderdraft slot-weight mask into a plain tintable silhouette.
 *
 * The RGB channels are per-slot weights summing to 255, so they say *which* colour a pixel
 * takes and nothing about how bright it is. White RGB with the alpha untouched therefore
 * reproduces exactly what Wonderdraft draws when every slot is set to the same colour, and
 * leaves the sprite ready for the renderer's ordinary tint.
 */
function flattenSlotMask(png) {
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 255;
    png.data[i + 1] = 255;
    png.data[i + 2] = 255;
  }
}

