import { ItemBlock } from './item-block.model';
import { RuneBlock } from './rune-block.model';
import { SpellBlock } from './spell-block-model';
import { SkillBlock } from './skill-block.model';
import { StatusEffect } from './status-effect.model';
import { MacroAction } from './macro-action.model';

/**
 * Library - A standalone, reusable collection of game content
 * Can be linked to multiple worlds for safe, centralized content management
 */
export interface Library {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  
  // Content arrays
  items: ItemBlock[];
  runes: RuneBlock[];
  spells: SpellBlock[];
  skills: SkillBlock[];
  statusEffects: StatusEffect[];
  macroActions: MacroAction[];
  
  // Metadata
  tags?: string[]; // Optional categorization
  isPublic?: boolean; // Whether this library can be shared/discovered
  author?: string; // Creator info
}

/**
 * Create a new empty library
 */
export function createEmptyLibrary(name: string): Library {
  const now = Date.now();
  return {
    id: `lib_${now}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    description: '',
    createdAt: now,
    updatedAt: now,
    items: [],
    runes: [],
    spells: [],
    skills: [],
    statusEffects: [],
    macroActions: [],
    tags: [],
    isPublic: false
  };
}

/**
 * Reference to track which library content came from
 */
export interface LibraryReference {
  libraryId: string;
  libraryName: string;
  itemId?: string; // ID within the library's array
}
