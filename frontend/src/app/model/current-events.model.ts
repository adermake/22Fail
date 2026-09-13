import { ItemBlock } from './item-block.model';
import { RuneBlock } from './rune-block.model';
import { SpellBlock } from './spell-block-model';
import { SkillBlock } from './skill-block.model';
import { StatusEffect } from './status-effect.model';

/**
 * Currency values for transactions
 */
export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
}

/**
 * Reference to a library item with source tracking
 */
export interface LibraryItemRef {
  libraryId: string;
  libraryName: string;
  itemId?: string;
}

/**
 * A deal in a shop - can be a buy or sell offer
 */
export interface ShopDeal {
  id: string;
  name: string;
  description?: string;
  
  // What the player gets (buy deal) or gives (sell deal)
  item?: ItemBlock;
  rune?: RuneBlock;
  spell?: SpellBlock;
  skill?: SkillBlock;
  statusEffect?: StatusEffect;
  
  // Reference to source library (for editing)
  sourceRef?: LibraryItemRef;
  
  // Pricing
  price?: Currency; // undefined = "Verhandelbar" (negotiable)
  isNegotiable: boolean;
  discount?: number; // Percentage discount (0-100) applied in world
  
  // Stock management
  quantity?: number; // undefined = unlimited
  sold: number; // how many have been sold/bought
  
  // Reverse deal: player sells item for this price
  isReverseDeal: boolean;
  reverseDescription?: string; // e.g., "~5 Gold" rough description

  // Whether the item details are revealed to players
  // If false, players see "Unbekannter Effekt" for description
  identified?: boolean;
}

/**
 * A shop event - players can buy/sell items
 */
export interface ShopEvent {
  id: string;
  type: 'shop';
  name: string;
  description?: string;
  
  deals: ShopDeal[];
  
  // Track who's interacted
  claimedDeals: { [dealId: string]: string[] }; // dealId -> characterIds who bought
  
  // Reference to source library (for editing)
  sourceRef?: LibraryItemRef;
  
  createdAt: number;
}

/**
 * Union type for all current events.
 *
 * Loot lived here as a second event kind (`LootBundleEvent`) with its own authoring UI in the
 * library editor. Vorbereiteter Loot ist jetzt der GM-Schreibtisch (`WorldData.gmDesk`), dessen
 * aufgedeckte Reiter unter den Events erscheinen — Shops sind das einzige, was ein Event bleibt.
 */
export type CurrentEvent = ShopEvent;

/**
 * Current events state for a world
 */
export interface CurrentEventsState {
  events: CurrentEvent[];
}

/**
 * Create an empty shop event
 */
export function createEmptyShopEvent(name: string): ShopEvent {
  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'shop',
    name,
    description: '',
    deals: [],
    claimedDeals: {},
    createdAt: Date.now()
  };
}

/**
 * Create an empty shop deal
 */
export function createEmptyShopDeal(): ShopDeal {
  return {
    id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: 'Neuer Deal',
    isNegotiable: false,
    sold: 0,
    isReverseDeal: false
  };
}

/**
 * Currency conversion rates (10:1 up the chain)
 * 10 copper = 1 silver
 * 10 silver = 1 gold
 * 10 gold = 1 platinum
 */
export function convertToCopper(currency: Currency): number {
  return currency.copper 
    + (currency.silver * 10)
    + (currency.gold * 100)
    + (currency.platinum * 1000);
}

export function copperToCurrency(copper: number): Currency {
  const platinum = Math.floor(copper / 1000);
  copper = copper % 1000;
  const gold = Math.floor(copper / 100);
  copper = copper % 100;
  const silver = Math.floor(copper / 10);
  copper = copper % 10;
  
  return { copper, silver, gold, platinum };
}

// ─── Cetris ──────────────────────────────────────────────────────────────────
// Die Währung heißt Cetris. Gespeichert wird weiter unter copper/silver/gold/platinum — nur die
// Anzeige hat sich geändert, deshalb lesen alle Anzeigen diese Konstanten statt eigener Strings.

export type CetrisKey = keyof Currency;

export const CETRIS_LABEL: Record<CetrisKey, string> = {
  copper: 'Kupfer-Cetris',
  silver: 'Silber-Cetris',
  gold: 'Gold-Cetris',
  platinum: 'Platin-Cetris',
};

export const CETRIS_SHORT: Record<CetrisKey, string> = {
  copper: 'KC',
  silver: 'SC',
  gold: 'GC',
  platinum: 'PC',
};

/** Größte Münze zuerst. */
export const CETRIS_ORDER: CetrisKey[] = ['platinum', 'gold', 'silver', 'copper'];

/** Münzweise addiert, ohne umzurechnen — ein Beutel mit 12 Silber-Cetris bleibt 12 Silber-Cetris. */
export function addCurrency(a: Currency | undefined, b: Currency | undefined): Currency {
  return {
    copper: (a?.copper ?? 0) + (b?.copper ?? 0),
    silver: (a?.silver ?? 0) + (b?.silver ?? 0),
    gold: (a?.gold ?? 0) + (b?.gold ?? 0),
    platinum: (a?.platinum ?? 0) + (b?.platinum ?? 0),
  };
}

export function isEmptyCurrency(c: Currency | undefined | null): boolean {
  return !c || CETRIS_ORDER.every(k => !(c[k] > 0));
}

/** Kurzform, z. B. "3 GC 2 SC". */
export function formatCurrency(currency: Currency): string {
  const parts = CETRIS_ORDER
    .filter(k => (currency[k] ?? 0) > 0)
    .map(k => `${currency[k]} ${CETRIS_SHORT[k]}`);
  return parts.length > 0 ? parts.join(' ') : `0 ${CETRIS_SHORT.copper}`;
}

/** Gesamtwert in Gold-Cetris, z. B. "3,25 GC". */
export function formatCurrencyAsGold(currency: Currency): string {
  const gold = convertToCopper(currency) / 100;
  const text = gold % 1 === 0 ? String(gold) : gold.toFixed(2).replace('.', ',');
  return `${text} ${CETRIS_SHORT.gold}`;
}

/** Langform, z. B. "3 Silber-Cetris 2 Kupfer-Cetris". */
export function formatCurrencyAsUnits(currency: Currency): string {
  const parts = CETRIS_ORDER
    .filter(k => (currency[k] ?? 0) > 0)
    .map(k => `${currency[k]} ${CETRIS_LABEL[k]}`);
  return parts.length > 0 ? parts.join(' ') : `0 ${CETRIS_LABEL.copper}`;
}

/**
 * Coin display parts for colored rendering
 */
export interface CoinPart {
  amount: number;
  type: 'copper' | 'silver' | 'gold' | 'platinum';
  color: string;
  symbol: string;
}

export function getCoinParts(currency: Currency): CoinPart[] {
  const parts: CoinPart[] = [];
  if (currency.platinum > 0) parts.push({ amount: currency.platinum, type: 'platinum', color: '#6ab2e5', symbol: '⬡' });
  if (currency.gold > 0) parts.push({ amount: currency.gold, type: 'gold', color: '#ffd700', symbol: '⬡' });
  if (currency.silver > 0) parts.push({ amount: currency.silver, type: 'silver', color: '#c0c0c0', symbol: '⬡' });
  if (currency.copper > 0) parts.push({ amount: currency.copper, type: 'copper', color: '#b87333', symbol: '⬡' });
  return parts.length > 0 ? parts : [{ amount: 0, type: 'copper', color: '#b87333', symbol: '⬡' }];
}
