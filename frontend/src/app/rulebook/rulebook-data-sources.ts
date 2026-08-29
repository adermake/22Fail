/**
 * `:::data{source=…}` — renders tables straight from the app's real data modules.
 *
 * This is what stops the guide drifting: weapon/material/talent listings ARE the game data,
 * not a hand-copied prose duplicate of it.
 *
 * Adding a source = one entry in DATA_SOURCES.
 */
import { esc, type DirectiveAttrs } from './markdown/attrs';
import { iconSpan } from './markdown/containers';
import { slugify } from './markdown/slug';
import type { RulebookEnv } from './rulebook.model';
import { runeTile, specialRunesOfType, type RulebookRune } from './rune-render';

import { TALENT_DEFINITIONS } from '../data/talent-definitions';
import {
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_LABELS,
  WEAPON_HANDED_LABELS,
  WEAPON_WEIGHTS,
  WEAPON_WEIGHT_LABELS,
  builtinWeaponTypes,
  describeWeaponReach,
  type WeaponCategory,
  type WeaponTypeBlock,
  type WeaponWeight,
} from '../model/weapon-type-block.model';
import type { MaterialBlock, MaterialStats } from '../model/forging.model';
import { KNOWLEDGE_TIERS, KnowledgeTier, knowledgeTierOf } from '../utils/knowledge-tier.util';
import {
  RUNE_GROUPS,
  RUNE_GROUP_LABELS,
  RUNE_GROUP_MEMBERS,
  RUNE_TYPES,
  RUNE_TYPE_LABELS,
  normalizeRuneType,
  runeGroupOf,
  type RuneGroup,
  type RuneType,
} from '../model/rune-block.model';

type DataRenderer = (attrs: DirectiveAttrs, env: RulebookEnv) => string;

const cell = (v: unknown) => esc(String(v ?? ''));

/** Talents — an exact match for the guide's Talente section. */
function renderTalents(attrs: DirectiveAttrs): string {
  const wanted = (attrs['stat'] ?? '').trim().toUpperCase();
  const rows = TALENT_DEFINITIONS.filter((t) => !wanted || t.statLabel.toUpperCase() === wanted);
  if (!rows.length) return emptyNote('Keine Talente gefunden.');

  return (
    `<div class="rb-grid" style="--rb-grid-min:260px">` +
    rows
      .map(
        (t) =>
          `<article class="rb-card rb-card--accent" id="talent-${esc(slugify(t.name))}">` +
          `<h4 class="rb-card-title">${cell(t.name)}` +
          `<span class="rb-tag">${cell(t.statLabel)}</span></h4>` +
          `<div class="rb-card-body"><p>${cell(t.description)}</p></div></article>`,
      )
      .join('') +
    `</div>`
  );
}

/**
 * Weapon types. Two independent axes, and both filter:
 *   `category=` — **Waffenart**: leicht | schwer | fernkampf (how it is fought with)
 *   `weight=`   — **Gewichtsklasse**: leicht | mittel | schwer (how heavy it is)
 * plus `names="Messer, Speer"`. Confusing the two is easy, so both accept the same words and are
 * kept strictly apart.
 *
 * Types come from the libraries when they have been loaded (a GM can define their own); the
 * hardcoded list is the fallback so the page still renders standalone.
 */
function renderWeapons(attrs: DirectiveAttrs, env: RulebookEnv): string {
  const all: WeaponTypeBlock[] = env.context?.weaponTypes ?? builtinWeaponTypes();

  const rawCategory = (attrs['category'] ?? attrs['art'] ?? attrs['type'] ?? '').trim().toUpperCase();
  const rawWeight = (attrs['weight'] ?? attrs['gewicht'] ?? '').trim().toUpperCase();

  if (rawCategory && !WEAPON_CATEGORIES.includes(rawCategory as WeaponCategory)) {
    env.warnings.push(`Unbekannte Waffenart "category=${rawCategory}"`);
    return emptyNote(
      `Unbekannte Waffenart: <code>${esc(rawCategory)}</code>. Verfügbar: ` +
        WEAPON_CATEGORIES.map((c) => WEAPON_CATEGORY_LABELS[c]).join(', '),
    );
  }
  if (rawWeight && !WEAPON_WEIGHTS.includes(rawWeight as WeaponWeight)) {
    env.warnings.push(`Unbekannte Gewichtsklasse "weight=${rawWeight}"`);
    return emptyNote(
      `Unbekannte Gewichtsklasse: <code>${esc(rawWeight)}</code>. Verfügbar: ` +
        WEAPON_WEIGHTS.map((w) => WEAPON_WEIGHT_LABELS[w]).join(', '),
    );
  }

  const picked = filterByNames(all, attrs['names'] ?? attrs['nur'], env, 'Waffe');
  const rows = (picked ?? all).filter(
    (w) =>
      (!rawCategory || w.category === rawCategory) && (!rawWeight || w.weight === rawWeight),
  );
  if (!rows.length) return emptyNote('Keine Waffentypen für diese Auswahl.');

  const chip = (w: WeaponTypeBlock): string =>
    `<span class="rb-chip"><b>${cell(w.name)}</b>` +
    `<small>${cell(w.damageType)} · ${cell(describeWeaponReach(w))}</small>` +
    `<small>${cell(WEAPON_WEIGHT_LABELS[w.weight])} · ${cell(WEAPON_HANDED_LABELS[w.handed])}` +
    `${w.extraEffect ? ` · ${cell(w.extraEffect)}` : ''}</small></span>`;

  // An explicit name list or a single-category request needs no grouping headings.
  if (picked || rawCategory) {
    return `<div class="rb-chiplist">${rows.map(chip).join('')}</div>`;
  }

  return WEAPON_CATEGORIES.map((category) => {
    const list = rows.filter((w) => w.category === category);
    if (!list.length) return '';
    return (
      `<div class="rb-datagroup">` +
      `<div class="rb-datagroup-title">${cell(WEAPON_CATEGORY_LABELS[category])} (${list.length})</div>` +
      `<div class="rb-chiplist">${list.map(chip).join('')}</div></div>`
    );
  }).join('');
}

/**
 * Rarity order for listings, weakest first. Library materials grade themselves COMMON | RARE |
 * LEGENDARY; an ungraded one sorts as COMMON.
 */
const RARITY_ORDER: MaterialBlock['rarity'][] = ['COMMON', 'RARE', 'LEGENDARY'];

const RARITY_LABELS: Record<NonNullable<MaterialBlock['rarity']>, string> = {
  COMMON: 'Gewöhnlich',
  RARE: 'Selten',
  LEGENDARY: 'Legendär',
};

const rarityRank = (r: MaterialBlock['rarity']): number => {
  const at = RARITY_ORDER.indexOf(r ?? 'COMMON');
  return at < 0 ? 0 : at;
};

/**
 * `names="Eisen, Holz"` — keep only the named entries, in the order the author listed them.
 * Matching is case- and whitespace-insensitive. A name that matches nothing is reported rather
 * than silently dropped, so a typo in a guide page is visible.
 */
function filterByNames<T extends { name: string }>(
  rows: readonly T[],
  raw: string | undefined,
  env: RulebookEnv,
  what: string,
): T[] | null {
  const wanted = (raw ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  if (!wanted.length) return null;

  const byName = new Map(rows.map((r) => [r.name.trim().toLowerCase(), r]));
  const out: T[] = [];
  for (const name of wanted) {
    const hit = byName.get(name.toLowerCase());
    if (hit) out.push(hit);
    else env.warnings.push(`Unbekannte${what === 'Rune' ? '' : 's'} ${what} "${name}" in names=`);
  }
  return out;
}

/** The scaling suffix every forge stat gets: base value plus per-Schmiedung growth. */
const scaling = (value: unknown, step: number | undefined): string =>
  cell(value) + (step ? ` <span class="rb-scale">(+${cell(step)})</span>` : '');

/** Which Wissensstufen a listing shows. Default hides `geheim` — that tier means no player sees it. */
const DEFAULT_TIERS: KnowledgeTier[] = ['bekannt', 'unbekannt'];

/**
 * `tier=` picks Wissensstufen: a comma list of `bekannt` / `unbekannt` / `geheim`, or `all`.
 * Returns null on a bad value, having warned.
 */
function parseTiers(raw: string | undefined, env: RulebookEnv): KnowledgeTier[] | null {
  const text = (raw ?? '').trim().toLowerCase();
  if (!text) return DEFAULT_TIERS;
  if (text === 'all' || text === 'alle') return KNOWLEDGE_TIERS.map((t) => t.value);

  const valid = KNOWLEDGE_TIERS.map((t) => t.value as string);
  const wanted = text.split(',').map((t) => t.trim()).filter(Boolean);
  const bad = wanted.filter((t) => !valid.includes(t));
  if (bad.length) {
    env.warnings.push(`Unbekannte Wissensstufe "tier=${bad.join(',')}"`);
    return null;
  }
  return wanted as KnowledgeTier[];
}

const RARITY_VALUES = ['common', 'rare', 'legendary'];

/** `rarity=` narrows to one or more rarities. Returns null on a bad value, having warned. */
function parseRarities(
  raw: string | undefined,
  env: RulebookEnv,
): NonNullable<MaterialBlock['rarity']>[] | null {
  const text = (raw ?? '').trim().toLowerCase();
  if (!text || text === 'all' || text === 'alle') return null; // null here = "no filter"
  const wanted = text.split(',').map((t) => t.trim()).filter(Boolean);
  const bad = wanted.filter((t) => !RARITY_VALUES.includes(t));
  if (bad.length) {
    env.warnings.push(`Unbekannte Seltenheit "rarity=${bad.join(',')}"`);
    return [];
  }
  return wanted.map((t) => t.toUpperCase() as NonNullable<MaterialBlock['rarity']>);
}

/**
 * Materials — weapon or armor, straight from the LIBRARY.
 *
 * These are not static data: a GM tunes Haltbarkeit/Effektivität per material in the Bibliothek,
 * so the guide has to read the same MaterialBlocks the forge does or it prints numbers nobody
 * plays with. Both forge stats scale per Schmiedung, so both carry their own `(+X)`.
 *
 * Spoiler control:
 *   `tier=`    Wissensstufen to include (default `bekannt,unbekannt`; `all` includes `geheim`)
 *   `rarity=`  common | rare | legendary
 *   `names=`   an explicit whitelist, in the author's order
 *   `effects=no`  drop the Effekt column, where most of the spoilers actually live
 */
function renderMaterials(attrs: DirectiveAttrs, env: RulebookEnv): string {
  const loaded: MaterialBlock[] | undefined = env.context?.materials;
  if (!loaded) return emptyNote('Materialien konnten nicht geladen werden.');

  const kind = (attrs['kind'] ?? 'weapon').trim().toLowerCase();
  const isArmor = kind === 'armor' || kind === 'ruestung' || kind === 'rüstung';

  const tiers = parseTiers(attrs['tier'] ?? attrs['stufe'], env);
  if (!tiers) {
    return emptyNote(
      `Unbekannte Wissensstufe. Verfügbar: ` +
        KNOWLEDGE_TIERS.map((t) => t.value).join(', ') + ', all',
    );
  }
  const rarities = parseRarities(attrs['rarity'] ?? attrs['seltenheit'], env);
  if (rarities?.length === 0) {
    return emptyNote(`Unbekannte Seltenheit. Verfügbar: ` + RARITY_VALUES.join(', ') + ', all');
  }
  const showEffects = !/^(no|nein|false|0)$/i.test((attrs['effects'] ?? attrs['effekte'] ?? '').trim());

  const statsOf = (m: MaterialBlock): MaterialStats | undefined =>
    isArmor ? m.armorStats : m.weaponStats;

  // The can-be flags postdate some libraries: when one is missing, having the stats block is the
  // honest signal that the material is usable that way.
  const usableAs = (m: MaterialBlock): boolean =>
    (isArmor ? m.canBeArmorMaterial : m.canBeWeaponMaterial) ?? true;

  const usable = loaded.filter(
    (m) =>
      tiers.includes(knowledgeTierOf(m)) &&
      usableAs(m) &&
      statsOf(m) &&
      (!rarities || rarities.includes(m.rarity ?? 'COMMON')),
  );

  const picked = filterByNames(usable, attrs['names'] ?? attrs['nur'], env, 'Material');
  // An explicit list keeps the author's order; otherwise sort by rarity, then name.
  const rows = picked ?? [...usable].sort(
    (a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name, 'de'),
  );
  if (!rows.length) {
    return emptyNote(
      isArmor
        ? 'Keine passenden Rüstungsmaterialien gefunden.'
        : 'Keine passenden Waffenmaterialien gefunden.',
    );
  }

  const valueCol = isArmor ? 'Stabilität' : 'Effektivität';
  return (
    `<div class="rb-tablewrap"><table class="rb-table"><thead><tr>` +
    `<th>Name</th><th>Seltenheit</th><th>Gewicht</th><th>Haltbarkeit</th><th>${valueCol}</th>` +
    (isArmor ? `<th>Rüstungsmalus</th>` : '') +
    (showEffects ? `<th>Effekt</th>` : '') +
    `</tr></thead><tbody>` +
    rows
      .map((m) => {
        const st = statsOf(m)!;
        return (
          `<tr><td><b>${cell(m.name)}</b></td>` +
          `<td>${cell(RARITY_LABELS[m.rarity ?? 'COMMON'])}</td>` +
          `<td>${cell(st.weight ?? 0)} kg</td>` +
          `<td>${scaling(st.haltbarkeit, st.haltbarkeitSkalierung)}</td>` +
          `<td>${scaling(st.effektivitaet, st.effektivitaetSkalierung)}</td>` +
          (isArmor ? `<td>${cell(st.ruestungsmalus ?? 0)}</td>` : '') +
          (showEffects ? `<td>${cell(st.extraEffect || m.description || '—')}</td>` : '') +
          `</tr>`
        );
      })
      .join('') +
    `</tbody></table></div>`
  );
}

/**
 * Runes, grouped by category. Formung is a parent category, so its three leaf types render as
 * sub-groups inside it. `type=` narrows to either a whole group (`formung`) or a single leaf
 * (`selektor`).
 *
 * Library runes come from RulebookService via the render context; the node editor's hardcoded
 * runes (the Seelenrune) are merged in, since nothing fetches those.
 */
function renderRunes(attrs: DirectiveAttrs, env: RulebookEnv): string {
  const all = env.context?.runes;
  if (!all) return emptyNote('Runen konnten nicht geladen werden.');

  const wanted = (attrs['type'] ?? attrs['category'] ?? '').trim().toLowerCase();
  const isGroup = RUNE_GROUPS.includes(wanted as RuneGroup);
  const isLeaf = RUNE_TYPES.includes(wanted as RuneType);
  if (wanted && !isGroup && !isLeaf) {
    env.warnings.push(`Unbekannter Runentyp ":::data{source=runes type=${wanted}}"`);
    return emptyNote(
      `Unbekannter Runentyp: <code>${esc(wanted)}</code>. Verfügbar: ` +
        [...new Set([...RUNE_GROUPS, ...RUNE_TYPES])].join(', '),
    );
  }

  // Library runes plus the hardcoded ones, optionally narrowed to an explicit name list.
  const pool: RulebookRune[] = [
    ...(all as RulebookRune[]),
    ...RUNE_TYPES.flatMap((type) => specialRunesOfType(type)),
  ];
  const picked = filterByNames(pool, attrs['names'] ?? attrs['nur'], env, 'Rune');

  // An explicit list is shown as one flat grid in the author's order — grouping a hand-picked
  // set by category just gets in the way.
  if (picked) {
    if (!picked.length) return emptyNote('Keine der genannten Runen gefunden.');
    return `<div class="rb-runegrid">${picked.map(runeTile).join('')}</div>`;
  }

  // Bucket every rune by its leaf type.
  const byType = new Map<RuneType, RulebookRune[]>();
  const add = (rune: RulebookRune, type: RuneType) => {
    const list = byType.get(type) ?? [];
    list.push(rune);
    byType.set(type, list);
  };
  for (const rune of pool) add(rune, normalizeRuneType(rune.runeType));

  const wantsType = (type: RuneType): boolean =>
    !wanted || (isLeaf ? type === wanted : runeGroupOf(type) === wanted);

  const tiles = (type: RuneType): string => {
    const list = (byType.get(type) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, 'de'));
    return `<div class="rb-runegrid">${list.map(runeTile).join('')}</div>`;
  };

  // A group renders one block; a multi-leaf group (Formung) gets a sub-heading per leaf.
  const blocks = RUNE_GROUPS.map((group) => {
    const leaves = RUNE_GROUP_MEMBERS[group].filter(
      (type) => wantsType(type) && (byType.get(type)?.length ?? 0) > 0,
    );
    if (!leaves.length) return '';

    const total = leaves.reduce((n, type) => n + (byType.get(type)?.length ?? 0), 0);
    // The heading is redundant when the author already asked for exactly this one thing.
    const showGroupTitle = !(isLeaf && leaves.length === 1) && !(isGroup && leaves.length === 1);
    const head = showGroupTitle
      ? `<div class="rb-datagroup-title">${cell(RUNE_GROUP_LABELS[group])} (${total})</div>`
      : '';

    const body =
      leaves.length === 1 && RUNE_GROUP_MEMBERS[group].length === 1
        ? tiles(leaves[0])
        : leaves
            .map(
              (type) =>
                `<div class="rb-datasubgroup">` +
                `<div class="rb-datasubgroup-title">${cell(RUNE_TYPE_LABELS[type])} ` +
                `(${byType.get(type)?.length ?? 0})</div>${tiles(type)}</div>`,
            )
            .join('');

    return `<div class="rb-datagroup">${head}${body}</div>`;
  }).join('');

  return blocks || emptyNote('Keine Runen in dieser Kategorie.');
}

const emptyNote = (msg: string) =>
  `<aside class="rb-note rb-note--warning"><div class="rb-note-title">${msg}</div></aside>`;

export const DATA_SOURCES: Record<string, DataRenderer> = {
  talents: renderTalents,
  talente: renderTalents,
  weapons: renderWeapons,
  waffen: renderWeapons,
  weapontypes: renderWeapons,
  waffentypen: renderWeapons,
  materials: renderMaterials,
  materialien: renderMaterials,
  runes: renderRunes,
  runen: renderRunes,
};

export function renderDataDirective(attrs: DirectiveAttrs, env: RulebookEnv): string {
  const source = (attrs['source'] ?? '').trim().toLowerCase();
  const renderer = DATA_SOURCES[source];
  if (!renderer) {
    env.warnings?.push(`Unbekannte Datenquelle ":::data{source=${source}}"`);
    return emptyNote(
      `Unbekannte Datenquelle: <code>${esc(source)}</code>. Verfügbar: ` +
        Object.keys(DATA_SOURCES).join(', '),
    );
  }
  return renderer(attrs, env);
}
