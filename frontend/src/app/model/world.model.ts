import { ItemBlock } from "./item-block.model";
import { RuneBlock } from "./rune-block.model";
import { SpellBlock } from "./spell-block-model";
import { SkillBlock } from "./skill-block.model";

export interface Hex {
  q: number;
  r: number;
  s: number;
}

export interface Drawing {
  path: string;
  color: string;
  lineWidth: number;
}

export interface Token {
  characterId: string;
  position: Hex;
  image?: string;
  name: string;
}

export interface BattleMap {
  id: string;
  name: string;
  drawings: Drawing[];
  tokens: Token[];
}

export interface TrashItem {
  type: 'item' | 'rune' | 'spell' | 'skill';
  data: ItemBlock | RuneBlock | SpellBlock | SkillBlock;
  deletedAt: number; // Timestamp
}

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
  battleParticipants: BattleParticipant[];
  currentTurnIndex: number;
  trash: TrashItem[]; // Recycle bin for deleted items
  battleMaps: BattleMap[];
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

export interface BattleParticipant {
  characterId: string;
  name: string;
  speed: number;
  turnFrequency: number; // Calculated based on speed
  nextTurnAt: number; // Used to determine turn order
  portrait?: string; // Character portrait URL
  team?: string; // Team color for grouping (e.g., 'red', 'blue', 'green', 'yellow', 'purple')
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
    battleParticipants: [],
    currentTurnIndex: 0,
    trash: [],
    battleMaps: [],
  };
}