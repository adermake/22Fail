import { ItemBlock } from "./item-block.model";
import { RuneBlock } from "./rune-block.model";
import { SpellBlock } from "./spell-block-model";

export interface WorldData {
  name: string;
  characterIds: string[]; // All characters in this world
  partyIds: string[]; // Characters currently in the active party
  itemLibrary: ItemBlock[];
  runeLibrary: RuneBlock[];
  spellLibrary: SpellBlock[];
  battleLoot: LootItem[];
}

export interface LootItem {
  id: string;
  type: 'item' | 'rune' | 'spell' | 'currency';
  data: any; // The actual item/rune/spell data
  claimedBy: string[]; // Character IDs who have claimed this
  recipientIds?: string[]; // Specific party members who should receive this loot (if empty, all party members)
}

export function createEmptyWorld(name: string): WorldData {
  return {
    name,
    characterIds: [],
    partyIds: [],
    itemLibrary: [],
    runeLibrary: [],
    spellLibrary: [],
    battleLoot: [],
  };
}