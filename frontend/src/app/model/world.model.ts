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
  type: 'item' | 'rune' | 'spell';
  data: any; // The actual item/rune/spell data
  claimedBy: string[]; // Character IDs who have claimed this
}