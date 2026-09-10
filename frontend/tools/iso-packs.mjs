/**
 * Imports the bought isometric asset packs into the map editor's sprite library.
 *
 * These are a different kind of artwork from the Wonderdraft library and need different
 * handling, which is the whole reason this is its own module.
 *
 * ## Why they are not packed into the atlas
 *
 * The Wonderdraft symbols average ~147px a side; these average ~721px, some are 2847px, and
 * there are around 1150 of them. Packed at native resolution they would need 36 atlas pages,
 * and a 4096² page costs 64 MB of VRAM whatever the PNG weighs on disk — 2.3 GB, on a
 * renderer that has already lost its WebGL context to VRAM pressure once.
 *
 * The atlas exists to solve a problem these do not have. It is there because a map scatters
 * *thousands* of trees and each loose texture would be its own draw call. Nobody scatters a
 * thousand mansions; a few sit in each city. So these ship as individual textures that the
 * client loads when one is actually placed, and VRAM then follows what is on the map rather
 * than what exists in the library.
 *
 * What they do need is a way to be *browsed* — the picker shows hundreds at once — so a
 * separate thumbnail atlas is generated for that alone. Thumbnails are small enough that all
 * of them together fit in less than one page.
 *
 * ## Shadows
 *
 * Most assets ship twice, with and without a baked shadow. The shadowless one is preferred
 * where both exist: a baked shadow fixes a light direction, and symbols on this map get
 * mirrored and rotated freely, which would light neighbouring copies from opposite sides.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { classify } from './iso-classify.mjs';

/**
 * Longest side a placed prop is written at.
 *
 * Chosen against the library it sits beside, not against the source art: the Wonderdraft
 * symbols on this map average ~147px a side, so 256 is already close to twice the resolution
 * of everything around it. The originals are ~721px, but that detail cannot survive being
 * drawn at world scale — and it costs dearly, because these files are committed so the
 * server can serve them. At 512 the set weighed 200 MB; at 256 it is a quarter of that for
 * no visible difference on the map.
 */
export const PROP_MAX_SIDE = 256;

/** Longest side of a picker thumbnail. The grid draws them at 44px. */
export const THUMB_MAX_SIDE = 64;

/**
 * The asset behind a filename, with only the *variant* markers removed.
 *
 * Shadow markers go; the `_isoNN` set number stays. Stripping that too looked tidier and
 * quietly merged distinct assets: `medieval_house1_iso0` and `medieval_house1_iso7` are
 * different houses from different sets, and collapsing them dropped 26 of them on the floor.
 * A shadow pair always shares its set number, so keeping it costs nothing for pairing.
 */
function baseName(stem) {
  return stem
    .replace(/[_-]?no[_-]?shadow/gi, '')
    .replace(/[_-]?shadow/gi, '')
    .replace(/[_-]+$/, '');
}

/** The same name with the set number dropped — for display, where `Iso7` is just noise. */
function labelName(base) {
  return base.replace(/[_-]?iso\d+$/i, '').replace(/[_-]+$/, '');
}

function isShadowless(stem) {
  return /no[_-]?shadow/i.test(stem);
}

/** `EuropeanNature_birch_3` → group `europeannature`, so a theme stays together. */
function groupOf(base) {
  const head = base.split(/[_-]/)[0] || 'sonstige';
  return head.toLowerCase();
}

function prettify(base) {
  return base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Area-average downscale, done on **premultiplied** alpha.
 *
 * Averaging straight RGBA mixes the colour of fully transparent pixels into their visible
 * neighbours, which on artwork cut out against transparency draws a dark halo around every
 * edge — the same premultiplication mistake that once put dark rims on the terrain gradients.
 * Premultiplying first weights each pixel's colour by its own coverage, which is the only
 * thing that makes an edge average correctly.
 */
export function downscale(png, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(png.width, png.height));
  if (scale >= 1) return png;

  const w = Math.max(1, Math.round(png.width * scale));
  const h = Math.max(1, Math.round(png.height * scale));
  const out = new PNG({ width: w, height: h });

  const xRatio = png.width / w;
  const yRatio = png.height / h;

  for (let y = 0; y < h; y++) {
    const sy0 = Math.floor(y * yRatio);
    const sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * yRatio));

    for (let x = 0; x < w; x++) {
      const sx0 = Math.floor(x * xRatio);
      const sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * xRatio));

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;

      for (let sy = sy0; sy < sy1 && sy < png.height; sy++) {
        for (let sx = sx0; sx < sx1 && sx < png.width; sx++) {
          const i = (sy * png.width + sx) << 2;
          const alpha = png.data[i + 3] / 255;
          r += png.data[i] * alpha;
          g += png.data[i + 1] * alpha;
          b += png.data[i + 2] * alpha;
          a += png.data[i + 3];
          n++;
        }
      }

      const o = (y * w + x) << 2;
      if (n === 0 || a === 0) {
        out.data[o] = 0;
        out.data[o + 1] = 0;
        out.data[o + 2] = 0;
        out.data[o + 3] = 0;
        continue;
      }

      // Back to straight alpha, which is what a PNG stores.
      const meanAlpha = a / n / 255;
      out.data[o] = Math.round(Math.min(255, r / n / meanAlpha));
      out.data[o + 1] = Math.round(Math.min(255, g / n / meanAlpha));
      out.data[o + 2] = Math.round(Math.min(255, b / n / meanAlpha));
      out.data[o + 3] = Math.round(a / n);
    }
  }
  return out;
}

/**
 * Trim fully transparent margins.
 *
 * These are cut-outs from larger scenes and many carry a lot of empty space. Trimming shrinks
 * both the file and the thumbnail sheet, and — more importantly — makes the symbol's centre
 * mean something, since placement and hit-testing measure from it.
 */
export function trim(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      if (png.data[((y * png.width + x) << 2) + 3] === 0) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return png; // fully transparent; leave it alone rather than produce a 0×0
  if (minX === 0 && minY === 0 && maxX === png.width - 1 && maxY === png.height - 1) return png;

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    const src = ((y + minY) * png.width + minX) << 2;
    png.data.copy(out.data, (y * w) << 2, src, src + (w << 2));
  }
  return out;
}

/**
 * Scan the extracted packs and return one descriptor per unique asset.
 *
 * Returns `[]` when the folder is absent, so a checkout without the (large, licensed) packs
 * still builds — same contract as the Wonderdraft library.
 */
export async function collectIsoProps(root) {
  if (!existsSync(root)) return [];

  const packs = (await readdir(root, { withFileTypes: true }))
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  const out = [];
  /*
   * Ids are lowercased, and some packs ship names that differ only in case —
   * `Marketsquare_Cart_1` beside `Marketsquare_cart_1`, two genuinely different carts. Left
   * alone the second overwrote the first in the manifest and eleven assets vanished with no
   * error anywhere.
   */
  const usedIds = new Set();

  for (const pack of packs) {
    const dir = join(root, pack);
    const files = (await readdir(dir)).filter(f => f.toLowerCase().endsWith('.png')).sort();

    // Keyed by the asset behind the variants, so a shadow/shadowless pair collapses to one.
    const chosen = new Map();
    for (const file of files) {
      const stem = file.replace(/\.png$/i, '');
      const base = baseName(stem);
      const prev = chosen.get(base);
      if (!prev || (isShadowless(stem) && !isShadowless(prev.stem))) {
        chosen.set(base, { stem, file });
      }
    }

    for (const [base, pick] of chosen) {
      let png;
      try {
        png = PNG.sync.read(await readFile(join(dir, pick.file)));
      } catch (err) {
        console.warn(`  ! skipped unreadable ${pack}/${pick.stem}: ${err.message}`);
        continue;
      }

      const category = classify(labelName(base));
      const group = `${category}/${groupOf(base)}`;

      let id = `${group}/${base.toLowerCase()}`;
      if (usedIds.has(id)) {
        let n = 2;
        while (usedIds.has(`${id}_${n}`)) n++;
        id = `${id}_${n}`;
      }
      usedIds.add(id);

      out.push({
        id,
        groupId: group,
        category,
        name: prettify(labelName(base)),
        pack,
        png,
      });
    }
  }

  return out;
}
