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
import { BASE_WEAPON_TYPES } from '../data/weapons.data';
import { WEAPON_MATERIALS } from '../data/materials.data';
import { ARMOR_MATERIALS } from '../data/armor-materials.data';
import { WeaponType, type Material } from '../model/weapon.model';
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

/** Weapons — optionally filtered by category (leicht | schwer | fernkampf). */
function renderWeapons(attrs: DirectiveAttrs): string {
  const wanted = (attrs['category'] ?? attrs['type'] ?? '').trim().toLowerCase();
  const rows = BASE_WEAPON_TYPES.filter(
    (w) => !wanted || String(w.type).toLowerCase() === wanted,
  );
  if (!rows.length) return emptyNote(`Keine Waffen für Kategorie "${esc(wanted)}".`);

  const groups = new Map<WeaponType, typeof rows>();
  for (const w of rows) {
    const list = groups.get(w.type) ?? [];
    list.push(w);
    groups.set(w.type, list);
  }

  return [...groups.entries()]
    .map(
      ([type, list]) =>
        `<div class="rb-datagroup"><div class="rb-datagroup-title">${cell(type)}</div>` +
        `<div class="rb-chiplist">` +
        list
          .map(
            (w) =>
              `<span class="rb-chip"><b>${cell(w.name)}</b>` +
              `<small>${cell(w.damageType)} · ${cell(w.range)} m</small></span>`,
          )
          .join('') +
        `</div></div>`,
    )
    .join('');
}

/** Materials — weapon or armor. */
function renderMaterials(attrs: DirectiveAttrs): string {
  const kind = (attrs['kind'] ?? 'weapon').trim().toLowerCase();
  const isArmor = kind === 'armor' || kind === 'ruestung' || kind === 'rüstung';
  const rows: Material[] = isArmor ? ARMOR_MATERIALS : WEAPON_MATERIALS;
  if (!rows.length) return emptyNote('Keine Materialien gefunden.');

  const valueCol = isArmor ? 'Stabilität' : 'Effektivität';
  return (
    `<div class="rb-tablewrap"><table class="rb-table"><thead><tr>` +
    `<th>Name</th><th>Seltenheit</th><th>Gewicht</th><th>Haltbarkeit</th><th>${valueCol}</th><th>Effekt</th>` +
    `</tr></thead><tbody>` +
    rows
      .map(
        (m) =>
          `<tr><td><b>${cell(m.name)}</b></td><td>${cell(m.rarity)}</td><td>${cell(m.type)}</td>` +
          `<td>${cell(m.durability)}${m.durabilityModifier ? ` (+${cell(m.durabilityModifier)})` : ''}</td>` +
          `<td>${cell(isArmor ? (m.stability ?? 0) : m.efficiency)}</td>` +
          `<td>${cell(m.specialEffect ?? '—')}</td></tr>`,
      )
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

  // Bucket every rune (library + hardcoded) by its leaf type.
  const byType = new Map<RuneType, RulebookRune[]>();
  const add = (rune: RulebookRune, type: RuneType) => {
    const list = byType.get(type) ?? [];
    list.push(rune);
    byType.set(type, list);
  };
  for (const rune of all) add(rune as RulebookRune, normalizeRuneType(rune.runeType));
  for (const type of RUNE_TYPES) for (const rune of specialRunesOfType(type)) add(rune, type);

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
