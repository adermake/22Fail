/**
 * Brewing System Models
 *
 * Ingredients (Wirkstoffe) define up to 3 effects (primary / secondary / tertiary).
 * Each effect references a status effect and stacks either by STACK count or DURATION.
 *
 * Brew flow:
 *  - Add ingredient instances from resources (or knowledge in free mode)
 *  - Spend brew points to lock an ingredient's P/S/T effect into the matching potion slot
 *  - Re-brewing the same ingredient+slot intensifies (more stacks / duration); cost +1 each time
 *  - Extractors reduce brew costs; default max 1, configurable
 *
 * Slot multipliers: Primary 100%, Secondary 200%, Tertiary 300%.
 */

import { ItemBlock } from './item-block.model';

export type BrewEffectSlot = 'primary' | 'secondary' | 'tertiary';
export type EffectStackMode = 'STACK' | 'DURATION';
export type CraftAccessMode = 'enforced' | 'free';

export const BREW_SLOT_MULT: Record<BrewEffectSlot, number> = {
  primary: 1,
  secondary: 2,
  tertiary: 3,
};

export const BREW_SLOT_LABELS: Record<BrewEffectSlot, string> = {
  primary: 'Primär',
  secondary: 'Sekundär',
  tertiary: 'Tertiär',
};

/** One of the three effects on an ingredient recipe. */
export interface IngredientEffect {
  /** Library status-effect id (empty = unset). */
  statusEffectId: string;
  /** Denormalized display name. */
  statusEffectName?: string;
  sourceLibraryId?: string;
  mode: EffectStackMode;
  /** Stacks or duration turns, depending on mode. */
  amount: number;
  /** Base brew-point cost before slot multiplier / extractor. */
  cost: number;
}

export interface IngredientBlock {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  primary: IngredientEffect;
  secondary: IngredientEffect;
  tertiary: IngredientEffect;
  /** Gold / shop value of one unit. */
  cost?: number;
  rarity?: 'COMMON' | 'RARE' | 'LEGENDARY';
  libraryOrigin?: string;
  libraryOriginName?: string;
}

/** Extractor recipe — reduces brew costs. */
export interface ExtractorBlock {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic: boolean;
  /** Cost reduction 0–100 applied to primary-slot brews. */
  primaryReductionPercent: number;
  secondaryReductionPercent: number;
  tertiaryReductionPercent: number;
  cost?: number;
  rarity?: 'COMMON' | 'RARE' | 'LEGENDARY';
  libraryOrigin?: string;
  libraryOriginName?: string;
}

export function createEmptyIngredientEffect(): IngredientEffect {
  return {
    statusEffectId: '',
    statusEffectName: '',
    mode: 'STACK',
    amount: 1,
    cost: 1,
  };
}

export function createEmptyIngredientBlock(name = 'Neuer Wirkstoff'): IngredientBlock {
  return {
    id: '',
    name,
    description: '',
    isPublic: false,
    primary: createEmptyIngredientEffect(),
    secondary: createEmptyIngredientEffect(),
    tertiary: createEmptyIngredientEffect(),
    cost: 0,
    rarity: 'COMMON',
  };
}

export function createEmptyExtractorBlock(name = 'Neuer Extraktor'): ExtractorBlock {
  return {
    id: '',
    name,
    description: '',
    isPublic: false,
    primaryReductionPercent: 0,
    secondaryReductionPercent: 0,
    tertiaryReductionPercent: 0,
    cost: 0,
    rarity: 'COMMON',
  };
}

/** Session entry: one physical (or free-mode) ingredient copy in the brew. */
export interface BrewIngredientEntry {
  /** Stable session id for this instance. */
  instanceId: string;
  ingredient: IngredientBlock;
  /** Resource item id when taken from sheet.resources (enforced mode). */
  resourceItemId?: string;
  primaryBrewCount: number;
  secondaryBrewCount: number;
  tertiaryBrewCount: number;
}

export interface BrewExtractorEntry {
  instanceId: string;
  extractor: ExtractorBlock;
  resourceItemId?: string;
}

/** Which ingredient instance owns a filled potion slot. */
export interface PotionSlotAssignment {
  instanceId: string;
  ingredientId: string;
  ingredientName: string;
  brewCount: number;
}

export interface PotionEffectInstance {
  slot: BrewEffectSlot;
  statusEffectId: string;
  statusEffectName?: string;
  sourceLibraryId?: string;
  mode: EffectStackMode;
  amount: number;
  ingredientName: string;
  brewCount: number;
}

export interface BrewingData {
  createdAt: number;
  ingredients: { name: string; ingredientId: string }[];
  extractors: { name: string; extractorId: string }[];
  effects: PotionEffectInstance[];
  totalBP: number;
  spentBP: number;
}

export function brewCountOf(entry: BrewIngredientEntry, slot: BrewEffectSlot): number {
  if (slot === 'primary') return entry.primaryBrewCount;
  if (slot === 'secondary') return entry.secondaryBrewCount;
  return entry.tertiaryBrewCount;
}

export function effectOf(ingredient: IngredientBlock, slot: BrewEffectSlot): IngredientEffect {
  return ingredient[slot];
}

/**
 * Combined extractor reduction for a slot (sum of Percents, capped at 95%).
 */
export function combinedExtractorReduction(
  extractors: BrewExtractorEntry[],
  slot: BrewEffectSlot,
): number {
  let sum = 0;
  for (const e of extractors) {
    if (slot === 'primary') sum += e.extractor.primaryReductionPercent;
    else if (slot === 'secondary') sum += e.extractor.secondaryReductionPercent;
    else sum += e.extractor.tertiaryReductionPercent;
  }
  return Math.min(95, Math.max(0, sum)) / 100;
}

/**
 * Cost of the next brew click on (entry, slot).
 * first = round(base × slotMult × (1 − reduction)); each further click +1.
 */
export function nextBrewCost(
  entry: BrewIngredientEntry,
  slot: BrewEffectSlot,
  extractors: BrewExtractorEntry[],
): number {
  const effect = effectOf(entry.ingredient, slot);
  if (!effect.statusEffectId) return Infinity;
  const base = Math.max(1, Math.round(
    effect.cost * BREW_SLOT_MULT[slot] * (1 - combinedExtractorReduction(extractors, slot)),
  ));
  return base + brewCountOf(entry, slot);
}

export function totalBrewBPSpent(
  entry: BrewIngredientEntry,
  slot: BrewEffectSlot,
  extractors: BrewExtractorEntry[],
): number {
  const count = brewCountOf(entry, slot);
  if (count <= 0) return 0;
  const effect = effectOf(entry.ingredient, slot);
  const base = Math.max(1, Math.round(
    effect.cost * BREW_SLOT_MULT[slot] * (1 - combinedExtractorReduction(extractors, slot)),
  ));
  // base + (base+1) + … + (base+count-1) = count*base + (0+…+count-1)
  return count * base + (count * (count - 1)) / 2;
}

/** Final effect amount after N intensify clicks. */
export function intensifiedAmount(baseAmount: number, brewCount: number): number {
  return baseAmount * Math.max(1, brewCount);
}

export function newInstanceId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/** Build a stackable resource ItemBlock linked to a library asset. */
export function createResourceItem(
  kind: 'raw-material' | 'ingredient' | 'extractor',
  name: string,
  libraryAssetId: string,
  amount = 1,
  extras?: Partial<ItemBlock>,
): ItemBlock {
  const item = new ItemBlock();
  item.id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  item.name = name;
  item.description = '';
  item.itemType = kind;
  item.libraryAssetId = libraryAssetId;
  item.stackable = true;
  item.amount = amount;
  item.weight = 0;
  item.lost = false;
  item.broken = false;
  item.isIdentified = true;
  item.requirements = {};
  if (extras) Object.assign(item, extras);
  return item;
}
