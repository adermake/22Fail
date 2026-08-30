import { ItemBlock, ItemType } from '../model/item-block.model';

/**
 * Kurzinfos für Bibliothekszeilen und Schreibtisch-Einträge.
 *
 * Die Listen zeigten nur den Namen — für "welchen Trank meine ich denn" muss man aber Goldwert,
 * Art und die Werte sehen, ohne erst irgendwo hineinzuklicken. Beides (Zeilenbadges + Tooltip)
 * kommt aus dieser Datei, damit GM-Schreibtisch und NSC-Editor nicht auseinanderlaufen.
 */

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  'weapon': 'Waffe',
  'armor': 'Rüstung',
  'other': 'Sonstiges',
  'potion': 'Trank',
  'consumable': 'Verbrauch',
  'cooking-ingredient': 'Kochzutat',
  'raw-material': 'Rohstoff',
  'ingredient': 'Wirkstoff',
  'extractor': 'Extraktor',
};

/** Die Rüstungsplätze, ausgeschrieben. */
const ARMOR_SLOT_LABEL: Record<string, string> = {
  helmet: 'Helm', chestplate: 'Brust', armschienen: 'Arme',
  leggings: 'Beine', boots: 'Stiefel', weapon: 'Waffenhand', extra: 'Extra',
};

/** Der Goldwert, wenn es einen gibt. */
export function goldValue(data: unknown): number | null {
  const value = (data as { value?: number } | null)?.value;
  return typeof value === 'number' && value > 0 ? value : null;
}

/** Ob das Ding noch unidentifiziert ist (gelber Punkt in der Liste). */
export function isUnidentified(data: unknown): boolean {
  const d = data as { isIdentified?: boolean; identified?: boolean } | null;
  if (!d) return false;
  if (d.isIdentified === false) return true;
  // Runen benutzen `identified`; nur ein ausdrückliches false zählt, fehlend heißt bekannt.
  return d.identified === false;
}

/** Kurzes Etikett für die Art des Dings — bei Gegenständen die Item-Art, sonst leer. */
export function kindLabel(data: unknown): string {
  const d = data as { itemType?: ItemType; armorType?: string } | null;
  if (!d?.itemType) return '';
  const base = ITEM_TYPE_LABEL[d.itemType] ?? d.itemType;
  const slot = d.armorType ? ARMOR_SLOT_LABEL[d.armorType] : '';
  return slot ? `${base} · ${slot}` : base;
}

/**
 * Der Tooltip-Text: alles, was beim Überfahren einer Zeile weiterhilft. Bewusst reiner Text —
 * ein `title`-Attribut braucht kein Markup und funktioniert überall gleich.
 */
export function previewText(name: string, data: unknown): string {
  const d = (data ?? {}) as Record<string, unknown>;
  const lines: string[] = [name];

  const kind = kindLabel(data);
  if (kind) lines.push(kind);

  const desc = typeof d['description'] === 'string' ? d['description'].trim() : '';
  if (desc) lines.push('', desc);

  const stats: string[] = [];
  const num = (key: string, label: string, suffix = '') => {
    const v = d[key];
    if (typeof v === 'number' && v !== 0) stats.push(`${label}: ${v}${suffix}`);
  };
  num('efficiency', 'Effizienz');
  num('stability', 'Stabilität');
  num('armorDebuff', 'Rüstungsmalus');
  num('weight', 'Gewicht', ' kg');
  num('value', 'Wert', ' G');
  num('mana', 'Mana');
  num('fokus', 'Fokus');
  num('cost', 'Kosten');
  if (typeof d['range'] === 'string' && d['range']) stats.push(`Reichweite: ${d['range']}`);
  const dmg = d['damageTypes'];
  if (Array.isArray(dmg) && dmg.length) stats.push(`Schaden: ${dmg.join(', ')}`);
  if (stats.length) lines.push('', ...stats);

  const mods = d['statModifiers'];
  if (Array.isArray(mods) && mods.length) {
    lines.push('', ...mods.map(m => {
      const mod = m as { stat?: string; amount?: number };
      return `${mod.stat}: ${(mod.amount ?? 0) > 0 ? '+' : ''}${mod.amount}`;
    }));
  }

  const req = d['requirements'] as Record<string, number> | undefined;
  if (req) {
    const parts = Object.entries(req).filter(([, v]) => typeof v === 'number' && v > 0);
    if (parts.length) lines.push('', 'Voraussetzungen: ' + parts.map(([k, v]) => `${k} ${v}`).join(', '));
  }

  if (isUnidentified(data)) lines.push('', 'Unidentifiziert');

  return lines.join('\n');
}

/** Stückzahl eines Stapels; 1 wenn es kein Stapel ist. */
export function stackCount(data: unknown): number {
  const d = data as Partial<ItemBlock> | null;
  if (!d?.stackable) return 1;
  return Math.max(1, Math.floor(d.amount ?? 1));
}

/** Anzeigename eines Tokens inklusive Kennzeichnung ("Kultist 2"). */
export function tokenLabel(token: { name: string; tag?: string }): string {
  return token.tag ? `${token.name} ${token.tag}` : token.name;
}
