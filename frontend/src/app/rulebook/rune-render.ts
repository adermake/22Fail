/**
 * Shared rune rendering for the rulebook: single runes, the gallery tiles, and the
 * `:::runeflow` connection widget.
 *
 * Lives in its own module (importing only from markdown/attrs) so containers.ts,
 * inline-directives.ts and rulebook-data-sources.ts can all use it without adding
 * import cycles between them.
 */
import { esc, type DirectiveAttrs } from './markdown/attrs';
import type { RulebookEnv } from './rulebook.model';
import type { RuneBlock, RuneType } from '../model/rune-block.model';
import { SUMMON_RUNE_ID } from '../shared/spell-node-editor/spell-node.model';

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * A rune as the rulebook draws it. Library runes are plain RuneBlocks; the node editor's
 * hardcoded runes have no asset and no drawing, so they carry a `glyph` marker instead and the
 * tile renders animated markup in place of an <img>.
 */
export interface RulebookRune extends RuneBlock {
  glyph?: 'soul';
  /** Extra names `:rune[...]` accepts for this rune. */
  aliases?: string[];
}

/**
 * The soul rune is hardcoded in the spell node editor (SUMMON_RUNE_ID) rather than stored in a
 * library, so nothing would fetch it — it has to be injected here or the Seele category looks
 * empty. The glyph mirrors the editor's stacked, drifting squares.
 */
export const SOUL_RUNE: RulebookRune = {
  name: 'Seelenrune',
  description:
    'Bindet eine Seele in den Zauber. Die einzige Rune, die nicht gezeichnet, sondern beim ' +
    'Beschwören aus der Seele selbst geformt wird.',
  drawing: '',
  tags: ['Beschwörung', 'Seele'],
  glowColor: '#a78bfa',
  runeType: 'seele',
  glyph: 'soul',
  aliases: ['seelenrune', 'beschwörungsrune', 'beschwoerungsrune', 'summon', SUMMON_RUNE_ID],
};

/** Every hardcoded rune, in display order. */
export const SPECIAL_RUNES: RulebookRune[] = [SOUL_RUNE];

/** The hardcoded runes belonging to one leaf type. */
export function specialRunesOfType(type: RuneType): RulebookRune[] {
  return SPECIAL_RUNES.filter((r) => r.runeType === type);
}

/** A rune's drawing as a usable src, or '' when it has none. */
function runeSrc(rune: RulebookRune): string {
  const drawing = rune.drawing ?? '';
  if (!drawing) return '';
  return drawing.startsWith('data:image') ? drawing : `/api/images/${drawing}`;
}

function runeGlow(rune: RulebookRune): string {
  return HEX.test(rune.glowColor ?? '') ? rune.glowColor! : '#8b5cf6';
}

/**
 * Case/whitespace-insensitive lookup by name. Library runes win over the hardcoded ones, so a
 * library rune actually named "Seelenrune" still resolves to the real asset.
 */
export function findRune(env: RulebookEnv, name: string): RulebookRune | undefined {
  const wanted = name.trim().toLowerCase();
  const fromLibrary = (env.context?.runes ?? []).find(
    (r) => (r.name ?? '').trim().toLowerCase() === wanted,
  );
  if (fromLibrary) return fromLibrary;
  return SPECIAL_RUNES.find(
    (r) => r.name.toLowerCase() === wanted || (r.aliases ?? []).includes(wanted),
  );
}

/** The artwork for a tile/chip: a drawing, a hardcoded glyph, or an empty placeholder. */
function runeArt(rune: RulebookRune, size: 'tile' | 'chip'): string {
  if (rune.glyph === 'soul') {
    // Eight stacked squares, each drifting at its own speed — same idea as the node editor.
    return (
      `<span class="rb-soulglyph rb-soulglyph--${size}" aria-hidden="true">` +
      '<span></span>'.repeat(8) +
      `</span>`
    );
  }
  const src = runeSrc(rune);
  const cls = size === 'tile' ? 'rb-rune-img' : 'rb-runechip-img';
  return src
    ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy">`
    : size === 'tile'
      ? `<span class="rb-rune-img rb-rune-img--empty" aria-hidden="true"></span>`
      : '';
}

function runeTitle(rune: RulebookRune): string {
  const parts = [rune.description, (rune.tags ?? []).join(' · ')].filter(Boolean);
  return parts.length ? ` title="${esc(parts.join(' — '))}"` : '';
}

/** Gallery/flow tile: the drawing with the name underneath. */
export function runeTile(rune: RulebookRune): string {
  const special = rune.glyph ? ' rb-rune--special' : '';
  return (
    `<figure class="rb-rune${special}" style="--rb-rune-glow:${runeGlow(rune)}"${runeTitle(rune)}>` +
    `${runeArt(rune, 'tile')}` +
    `<figcaption class="rb-rune-name">${esc(rune.name ?? '')}</figcaption></figure>`
  );
}

/** A rune that an author referenced but that does not exist — visible, never silent. */
function missingTile(name: string): string {
  return (
    `<figure class="rb-rune rb-rune--missing" title="Unbekannte Rune">` +
    `<span class="rb-rune-img rb-rune-img--empty" aria-hidden="true"></span>` +
    `<figcaption class="rb-rune-name">${esc(name)}?</figcaption></figure>`
  );
}

/** Compact inline form for running text: `:rune[Feuer]`. */
export function runeChip(env: RulebookEnv, name: string): string {
  const rune = findRune(env, name);
  if (!rune) {
    env.warnings.push(`Unbekannte Rune ":rune[${name}]"`);
    return `<span class="rb-runechip rb-runechip--missing">${esc(name)}?</span>`;
  }
  return (
    `<span class="rb-runechip" style="--rb-rune-glow:${runeGlow(rune)}"${runeTitle(rune)}>` +
    `${runeArt(rune, 'chip')}` +
    `<span class="rb-runechip-name">${esc(rune.name ?? '')}</span></span>`
  );
}

/**
 * `:::runeflow` — one chain per line, e.g.  `Feuer -> Kreis -> Ziel`.
 * A line with a single name just shows that rune. `>` is accepted as a shorthand for `->`,
 * and an arrow may carry a label:  `Feuer -[verstärkt]-> Wasser`.
 */
export function renderRuneFlow(body: string, attrs: DirectiveAttrs, env: RulebookEnv): string {
  if (!env.context?.runes) {
    return `<aside class="rb-note rb-note--warning"><div class="rb-note-title">` +
      `Runen konnten nicht geladen werden.</div></aside>`;
  }

  const rows = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!rows.length) {
    env.warnings.push('Leeres ":::runeflow" — erwartet z.B. "Feuer -> Kreis".');
    return '';
  }

  const html = rows
    .map((row) => {
      // Split into names and arrows, keeping the arrows so their labels stay attached.
      const tokens = row.split(/(\s*-\[[^\]]*\]->\s*|\s*->\s*|\s*>\s*)/);
      const cells: string[] = [];

      for (const token of tokens) {
        const arrow = /^\s*(?:-\[([^\]]*)\]->|->|>)\s*$/.exec(token);
        if (arrow) {
          const label = arrow[1] ?? '';
          cells.push(
            `<span class="rb-flow-arrow">` +
              (label ? `<span class="rb-flow-label">${esc(label)}</span>` : '') +
              `</span>`,
          );
          continue;
        }
        const name = token.trim();
        if (!name) continue;
        const rune = findRune(env, name);
        if (!rune) env.warnings.push(`Unbekannte Rune ":::runeflow" -> "${name}"`);
        cells.push(rune ? runeTile(rune) : missingTile(name));
      }
      return `<div class="rb-flow-row">${cells.join('')}</div>`;
    })
    .join('');

  const title = attrs['title'];
  return (
    `<div class="rb-flow">` +
    (title ? `<div class="rb-flow-title">${esc(title)}</div>` : '') +
    html +
    `</div>`
  );
}
