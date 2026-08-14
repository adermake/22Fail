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

import { TALENT_DEFINITIONS } from '../data/talent-definitions';
import { BASE_WEAPON_TYPES } from '../data/weapons.data';
import { WEAPON_MATERIALS } from '../data/materials.data';
import { ARMOR_MATERIALS } from '../data/armor-materials.data';
import { WeaponType, type Material } from '../model/weapon.model';

type DataRenderer = (attrs: DirectiveAttrs) => string;

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

const emptyNote = (msg: string) =>
  `<aside class="rb-note rb-note--warning"><div class="rb-note-title">${msg}</div></aside>`;

export const DATA_SOURCES: Record<string, DataRenderer> = {
  talents: renderTalents,
  talente: renderTalents,
  weapons: renderWeapons,
  waffen: renderWeapons,
  materials: renderMaterials,
  materialien: renderMaterials,
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
  return renderer(attrs);
}
