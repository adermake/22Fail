import {
  Currency, CustomPrice, DealCategoryId, ShopDeal, ShopDealGrant,
  convertToCopper, copperToCurrency,
} from '../model/current-events.model';
import {
  DeskEntry, GrantType, KNOWLEDGE_SHEET_FIELD, KnowledgeKind, assetEntryId, createDeskEntry,
} from '../model/gm-desk.model';
import { AssetType } from '../model/asset-browser.model';
import { CharacterSheet } from '../model/character-sheet-model';

/**
 * Was ein Shop alles verkaufen kann, und woraus es im Library-Editor ausgewählt wird.
 *
 * Material, Zutat und Extraktor gibt es zweimal: als Ware (landet bei den Rohstoffen) und als
 * Wissen (landet in `known*Ids`). Beides kommt aus demselben Bibliotheks-Asset.
 */
export interface DealCategory {
  id: DealCategoryId;
  label: string;
  /** `.i-*`-Klasse aus styles.css. */
  icon: string;
  /** Woraus gewählt wird; fehlt bei Freitext. */
  assetType?: AssetType;
  grantType?: GrantType;
  knowledgeKind?: KnowledgeKind;
}

export const DEAL_CATEGORIES: DealCategory[] = [
  { id: 'item', label: 'Gegenstand', icon: 'i-item', assetType: 'item', grantType: 'item' },
  { id: 'rune', label: 'Rune', icon: 'i-rune', assetType: 'rune', grantType: 'rune' },
  { id: 'spell', label: 'Zauber', icon: 'i-spell', assetType: 'spell', grantType: 'spell' },
  { id: 'skill', label: 'Fähigkeit', icon: 'i-ability', assetType: 'skill', grantType: 'skill' },
  { id: 'status-effect', label: 'Statuseffekt', icon: 'i-status-effect', assetType: 'status-effect', grantType: 'status-effect' },
  { id: 'material', label: 'Material', icon: 'i-material', assetType: 'material', grantType: 'resource' },
  { id: 'ingredient', label: 'Zutat', icon: 'i-brewing', assetType: 'ingredient', grantType: 'resource' },
  { id: 'extractor', label: 'Extraktor', icon: 'i-brewing', assetType: 'extractor', grantType: 'resource' },
  { id: 'material-knowledge', label: 'Materialwissen', icon: 'i-knowledge', assetType: 'material', grantType: 'knowledge', knowledgeKind: 'material' },
  { id: 'forge-trait-knowledge', label: 'Schmiedemerkmal', icon: 'i-knowledge', assetType: 'forge-trait', grantType: 'knowledge', knowledgeKind: 'forge-trait' },
  { id: 'ingredient-knowledge', label: 'Zutatenwissen', icon: 'i-knowledge', assetType: 'ingredient', grantType: 'knowledge', knowledgeKind: 'ingredient' },
  { id: 'extractor-knowledge', label: 'Extraktorwissen', icon: 'i-knowledge', assetType: 'extractor', grantType: 'knowledge', knowledgeKind: 'extractor' },
  { id: 'brew-trait-knowledge', label: 'Braumerkmal', icon: 'i-knowledge', assetType: 'brew-trait', grantType: 'knowledge', knowledgeKind: 'brew-trait' },
  { id: 'text', label: 'Freitext', icon: 'i-draw' },
];

const TEXT_CATEGORY = DEAL_CATEGORIES[DEAL_CATEGORIES.length - 1];

export function dealCategoryById(id: DealCategoryId): DealCategory {
  return DEAL_CATEGORIES.find(c => c.id === id) ?? TEXT_CATEGORY;
}

/** Baut den Inhalt eines neuen Deals aus einer Bibliotheksdatei. */
export function createDealGrant(
  category: DealCategory,
  file: { id?: string; data?: unknown },
): ShopDealGrant | undefined {
  if (!category.grantType) return undefined;
  // Die ID muss mit, sonst findet der Bogen das Wissen nicht wieder (siehe `assetEntryId`).
  const data = { ...structuredClone(file.data as object), id: assetEntryId(file) };
  return { category: category.id, type: category.grantType, knowledgeKind: category.knowledgeKind, data };
}

/** Kategorie eines Deals — auch für Alt-Deals, die ihren Inhalt noch in `item`/`rune`/… tragen. */
export function dealCategory(deal: ShopDeal): DealCategory {
  if (deal.grant) return dealCategoryById(deal.grant.category);
  if (deal.item) return dealCategoryById('item');
  if (deal.rune) return dealCategoryById('rune');
  if (deal.spell) return dealCategoryById('spell');
  if (deal.skill) return dealCategoryById('skill');
  if (deal.statusEffect) return dealCategoryById('status-effect');
  return TEXT_CATEGORY;
}

/** Die Daten des verkauften Dings (Gegenstand, Zauber, Material …), oder null bei Freitext. */
export function dealContentData(deal: ShopDeal): unknown {
  return deal.grant?.data ?? deal.item ?? deal.rune ?? deal.spell ?? deal.skill ?? deal.statusEffect ?? null;
}

/**
 * Der Schreibtisch-Eintrag, den ein Kauf vergibt. Läuft durch `GrantService.acceptPatches`,
 * damit Stapeln, freie Inventarfächer, Wissen und Statuseffekte genauso landen wie beim Loot.
 */
export function dealGrantEntry(deal: ShopDeal): DeskEntry | null {
  const sourceRef = deal.sourceRef ? { libraryId: deal.sourceRef.libraryId } : undefined;
  if (deal.grant) {
    return createDeskEntry(deal.grant.type, structuredClone(deal.grant.data), {
      name: deal.name, knowledgeKind: deal.grant.knowledgeKind, sourceRef,
    });
  }
  const legacy: [GrantType, unknown][] = [
    ['item', deal.item], ['rune', deal.rune], ['spell', deal.spell],
    ['skill', deal.skill], ['status-effect', deal.statusEffect],
  ];
  const hit = legacy.find(([, data]) => !!data);
  return hit ? createDeskEntry(hit[0], structuredClone(hit[1]), { name: deal.name, sourceRef }) : null;
}

/** Wissen kann man nur einmal kaufen. */
export function isKnowledgeDeal(deal: ShopDeal): boolean {
  return deal.grant?.type === 'knowledge';
}

/** Ob der Charakter das verkaufte Wissen schon hat — dann ist der Kauf sinnlos. */
export function knowsDealKnowledge(sheet: CharacterSheet | null | undefined, deal: ShopDeal): boolean {
  const kind = deal.grant?.knowledgeKind;
  if (!sheet || deal.grant?.type !== 'knowledge' || !kind) return false;
  const id = (deal.grant.data as { id?: string } | null)?.id;
  return !!id && (sheet[KNOWLEDGE_SHEET_FIELD[kind]] ?? []).includes(id);
}

// ── Preise ───────────────────────────────────────────────────────────────────

/** Ein fester Preis existiert (Cetris oder eigene Währung) — ohne ihn ist der Deal Verhandlungssache. */
export function hasFixedPrice(deal: ShopDeal): boolean {
  return !!deal.customPrice || !!deal.price;
}

/** Nur Cetris werden automatisch gebucht; eine eigene Währung regelt der Spieler selbst. */
export function paysInCetris(deal: ShopDeal): boolean {
  return !deal.customPrice && !!deal.price;
}

/** "6 Drachenschuppen" für die gewünschte Stückzahl. */
export function formatCustomPrice(price: CustomPrice, quantity = 1): string {
  return `${(price.amount ?? 0) * quantity} ${price.currency || 'Einheiten'}`.trim();
}

/** Gesamtpreis in Kupfer; 0 bei eigener Währung oder Verhandlungssache. */
export function dealCostCopper(deal: ShopDeal, quantity: number): number {
  return paysInCetris(deal) ? convertToCopper(deal.price!) * quantity : 0;
}

/** Kann sich der Charakter den Deal leisten? Eigene Währung prüft niemand — das ist Absicht. */
export function canAffordDeal(have: Currency | undefined, deal: ShopDeal, quantity: number): boolean {
  if (deal.isReverseDeal || !paysInCetris(deal)) return true;
  return convertToCopper(have ?? emptyCurrency()) >= dealCostCopper(deal, quantity);
}

/**
 * Die Cetris nach dem Handel, oder null wenn der Handel keine Cetris bewegt. Ankauf zahlt aus,
 * Verkauf bucht ab (nie unter null).
 */
export function cetrisAfterDeal(have: Currency | undefined, deal: ShopDeal, quantity: number): Currency | null {
  if (!paysInCetris(deal)) return null;
  const now = convertToCopper(have ?? emptyCurrency());
  const cost = dealCostCopper(deal, quantity);
  return copperToCurrency(deal.isReverseDeal ? now + cost : Math.max(0, now - cost));
}

/** Wie viele Stück auf einmal gehen: Restbestand, Wissen höchstens eins. */
export function maxDealQuantity(deal: ShopDeal): number {
  const left = deal.quantity === undefined ? 999 : Math.max(0, deal.quantity - (deal.sold ?? 0));
  return isKnowledgeDeal(deal) ? Math.min(1, left) : left;
}

function emptyCurrency(): Currency {
  return { copper: 0, silver: 0, gold: 0, platinum: 0 };
}
