import { ItemBlock } from "./item-block.model";
import { RuneBlock } from "./rune-block.model";
import { SpellBlock } from "./spell-block-model";
import { SkillBlock } from "./skill-block.model";

export interface WorldData {
  name: string;
  characterIds: string[]; // All characters in this world
  partyIds: string[]; // Characters currently in the active party
  itemLibrary: ItemBlock[];
  runeLibrary: RuneBlock[];
  spellLibrary: SpellBlock[];
  skillLibrary: SkillBlock[];
  lootBundles: LootBundle[];
  battleLoot: LootItem[];
}

export interface LootItem {
  id: string;
  type: 'item' | 'rune' | 'spell' | 'skill' | 'currency';
  data: any; // The actual item/rune/spell/skill data
  claimedBy: string[]; // Character IDs who have claimed this
  recipientIds?: string[]; // Specific party members who should receive this loot (if empty, all party members)
}

export interface LootBundle {
  id: string;
  name: string;
  items: ItemBlock[];
  runes: RuneBlock[];
  spells: SpellBlock[];
  skills: SkillBlock[];
  currency?: {
    copper?: number;
    silver?: number;
    gold?: number;
    platinum?: number;
  };
}

export function createEmptyWorld(name: string): WorldData {
  return {
    name,
    characterIds: [],
    partyIds: [],
    itemLibrary: [],
    runeLibrary: [],
    spellLibrary: [],
    skillLibrary: [],
    lootBundles: [],
    battleLoot: [],
  };
}