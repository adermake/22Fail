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
 * A loot item in a bundle that can be claimed
 */
export interface LootItem {
  id: string;
  type: 'item' | 'rune' | 'spell' | 'skill' | 'status-effect' | 'currency';
  data: ItemBlock | RuneBlock | SpellBlock | SkillBlock | StatusEffect | Currency;
  
  // Reference to source library
  sourceRef?: LibraryItemRef;
  
  // Claim tracking - once claimed, cannot be claimed again
  claimedBy?: string; // characterId who claimed this
}

/**
 * A loot bundle event - players can take items freely
 */
export interface LootBundleEvent {
  id: string;
  type: 'loot';
  name: string;
  description?: string;
  
  items: LootItem[];
  
  // Reference to source library (for editing)
  sourceRef?: LibraryItemRef;
  
  createdAt: number;
}

/**
 * Union type for all current events
 */
export type CurrentEvent = ShopEvent | LootBundleEvent;

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
 * Create an empty loot bundle event
 */
export function createEmptyLootBundleEvent(name: string): LootBundleEvent {
  return {
    id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'loot',
    name,
    description: '',
    items: [],
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

/**
 * Format currency for display
 */
export function formatCurrency(currency: Currency): string {
  const parts: string[] = [];
  if (currency.platinum > 0) parts.push(`${currency.platinum}p`);
  if (currency.gold > 0) parts.push(`${currency.gold}g`);
  if (currency.silver > 0) parts.push(`${currency.silver}s`);
  if (currency.copper > 0) parts.push(`${currency.copper}c`);
  return parts.length > 0 ? parts.join(' ') : '0c';
}
