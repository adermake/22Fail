import { ItemBlock } from './item-block.model';
import { Currency } from './currency-model';

/**
 * Der GM-Schreibtisch ist die vorbereitete Ablage des Spielleiters: benannte Reiter, in denen
 * Dinge jeder Art liegen, bis sie an einen Spieler gehen oder als Loot-Pool aufgedeckt werden.
 *
 * Ein Eintrag ist bewusst typisiert statt "irgendein Objekt", weil das Ziel im Charakterbogen vom
 * Typ abhängt: ein Gegenstand geht ins Inventar, ein Rohstoff in `resources`, Wissen in eines der
 * fünf `known*Ids`-Arrays. `GrantService` ist die einzige Stelle, die dieses Mapping kennt.
 */
export type GrantType =
  | 'item'
  | 'rune'
  | 'spell'
  | 'skill'
  /** Rohstoff/Wirkstoff/Extraktor als echter Gegenstand — landet in `sheet.resources`. */
  | 'resource'
  /** Handwerkswissen — landet in einem der `known*Ids`-Arrays. */
  | 'knowledge'
  | 'status-effect'
  | 'currency'
  | 'soul';

/** Welche Wissensliste ein `knowledge`-Eintrag füllt. */
export type KnowledgeKind = 'material' | 'forge-trait' | 'ingredient' | 'extractor' | 'brew-trait';

/** Asset-Typen der Bibliothek, die sich auf dem Schreibtisch ablegen lassen. */
export const DESK_ASSET_TYPES = [
  'item', 'rune', 'spell', 'skill',
  'material', 'forge-trait', 'ingredient', 'extractor', 'brew-trait',
  'status-effect',
] as const;

export interface DeskEntrySource {
  libraryId?: string;
  assetId?: string;
}

export interface DeskEntry {
  entryId: string;
  type: GrantType;
  /** Nur bei `type === 'knowledge'`. */
  knowledgeKind?: KnowledgeKind;
  name: string;
  icon?: string;
  /** ItemBlock | RuneBlock | SpellBlock | SkillBlock | SoulBlock | StatusEffect | Currency | string (Wissens-ID) */
  data: unknown;
  /** In einem aufgedeckten Reiter vor den Spielern verborgen. */
  hidden?: boolean;
  /** Wer den Eintrag aus dem Loot-Pool genommen hat. Vom Server gesetzt. */
  claimedBy?: string;
  sourceRef?: DeskEntrySource;
}

export interface DeskTab {
  tabId: string;
  name: string;
  /** Aufgedeckt: erscheint bei den Spielern unter Aktive Events als gemeinsamer Loot-Pool. */
  revealed: boolean;
  entries: DeskEntry[];
}

/** Ein Eintrag, der einem Charakter angeboten wurde und auf Annehmen/Ablehnen wartet. */
export interface PendingGrant extends DeskEntry {
  /** Anzeigename des GM/der Quelle, für die Zeile "von …". */
  fromName?: string;
  offeredAt: number;
}

// ── Anzeige ──────────────────────────────────────────────────────────────────

export const GRANT_TYPE_LABEL: Record<GrantType, string> = {
  'item': 'Gegenstand',
  'rune': 'Rune',
  'spell': 'Zauber',
  'skill': 'Fähigkeit',
  'resource': 'Material',
  'knowledge': 'Wissen',
  'status-effect': 'Statuseffekt',
  'currency': 'Währung',
  'soul': 'Seele',
};

export const KNOWLEDGE_KIND_LABEL: Record<KnowledgeKind, string> = {
  'material': 'Materialwissen',
  'forge-trait': 'Schmiedewissen',
  'ingredient': 'Wirkstoffwissen',
  'extractor': 'Extraktorwissen',
  'brew-trait': 'Braumerkmal',
};

/** CSS-Klasse des Icons (`.i-*` aus styles.css) — keine Emoji in der UI. */
export const GRANT_TYPE_ICON: Record<GrantType, string> = {
  'item': 'i-item',
  'rune': 'i-rune',
  'spell': 'i-spell',
  'skill': 'i-ability',
  'resource': 'i-material',
  'knowledge': 'i-knowledge',
  'status-effect': 'i-status-effect',
  'currency': 'i-currency',
  'soul': 'i-soul',
};

// ── Fabriken ─────────────────────────────────────────────────────────────────

export function newDeskId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDeskTab(name: string): DeskTab {
  return { tabId: newDeskId('tab'), name, revealed: false, entries: [] };
}

/**
 * Baut einen Schreibtisch-Eintrag aus beliebigen Bibliotheksdaten. Der Aufrufer muss die Daten
 * bereits geklont haben, wenn sie aus einem geteilten Array stammen.
 */
export function createDeskEntry(
  type: GrantType,
  data: unknown,
  opts: { name?: string; knowledgeKind?: KnowledgeKind; sourceRef?: DeskEntrySource } = {},
): DeskEntry {
  return {
    entryId: newDeskId('entry'),
    type,
    knowledgeKind: opts.knowledgeKind,
    name: opts.name ?? deskEntryName(type, data, opts.knowledgeKind),
    data,
    sourceRef: opts.sourceRef,
  };
}

/** Ein Währungs-Eintrag; `data` ist die Münzsumme selbst. */
export function createCurrencyEntry(currency: Currency): DeskEntry {
  return {
    entryId: newDeskId('entry'),
    type: 'currency',
    name: 'Münzen',
    data: { ...currency },
  };
}

/** Ein Gegenstands-Eintrag mit Stückzahl (Stapel). */
export function createItemEntry(item: ItemBlock, source?: DeskEntrySource): DeskEntry {
  return createDeskEntry('item', item, { name: item.name, sourceRef: source });
}

function deskEntryName(type: GrantType, data: unknown, kind?: KnowledgeKind): string {
  const named = data as { name?: string; sourceName?: string } | null;
  if (named?.name) return named.name;
  if (named?.sourceName) return named.sourceName;
  if (type === 'knowledge' && kind) return KNOWLEDGE_KIND_LABEL[kind];
  return GRANT_TYPE_LABEL[type];
}

/**
 * Die ID, unter der ein Bibliotheks-Asset im Bogen nachgeschlagen wird. Assets tragen die ID
 * teils in `data.id`, teils nur als Datei-ID — der Bogen prüft beides (siehe `wissen.component`),
 * also muss jede Vergabe denselben Fallback benutzen, sonst kommt Wissen an und ist unsichtbar.
 */
export function assetEntryId(file: { id?: string; data?: unknown } | null | undefined): string {
  if (!file) return '';
  const embedded = (file.data as { id?: string } | undefined)?.id;
  return embedded || file.id || '';
}
