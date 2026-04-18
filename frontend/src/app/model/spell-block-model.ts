import { SpellGraph } from '../shared/spell-node-editor/spell-node.model';
import { ActionMacro } from './action-macro.model';

export interface SpellBinding {
  type: 'learned' | 'item';
  itemName?: string;
  durability?: number;
  maxDurability?: number;
}

export interface SpellStatRequirements {
  strength?: number;
  dexterity?: number;
  speed?: number;
  intelligence?: number;
  constitution?: number;
  chill?: number;
}

// ── Cost schedule (stored, program-readable) ──────────────────────────────────

export interface StoredCostTurn {
  turn: number;
  mana: number;
  fokus: number;
}

/** A range of turns that all share the same per-turn cost (collapsed representation) */
export interface StoredCostRange {
  from: number;
  to: number;    // inclusive; 9999 = open-ended
  mana: number;
  fokus: number;
}

export interface StoredCostCase {
  label: string;
  /** Whether this branch condition is known before casting ('known') or discovered at runtime ('unknown') */
  conditionType?: 'known' | 'unknown';
  /** Turn at which this branch diverges from its parent (undefined = from the start) */
  branchAtTurn?: number;
  turns: StoredCostTurn[];
  ranges?: StoredCostRange[];    // Collapsed multi-turn ranges
  subcases?: StoredCostCase[];
  isUnknownBranch?: boolean;     // Legacy compat
}

export interface StoredCostSchedule {
  cases: StoredCostCase[];
}

export function generateSpellId(): string {
  return 'spell_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

// ── Casting Spell Entry (active/sustained cast tracking on the character sheet) ─
export interface CastingSpellEntry {
  entryId?: string;     // Unique per cast instance (allows same spell multiple times)
  spellId: string;      // Matches SpellBlock.id
  spellName: string;    // Denormalized for fast display
  castLevel: number;    // Accumulated cast level (determines cost reduction)
}

// ─────────────────────────────────────────────────────────────────────────────

export class SpellBlock {
  id?: string;                          // Stable identifier (prevents duplicate-save bugs)
  name!: string;
  description!: string;
  drawing?: string;
  tags!: string[];
  binding!: SpellBinding;
  strokeColor?: string;                 // Card left-border / glow color
  icon?: string;                        // Unicode symbol for card display
  libraryOrigin?: string;
  libraryOriginName?: string;
  graph?: SpellGraph;
  costMana?: number;
  costFokus?: number;
  perTurnMana?: number;                 // Mana cost per active turn
  perTurnFokus?: number;                // Fokus cost per active turn
  durationTurns?: number;               // How many turns the spell lasts
  statRequirements?: SpellStatRequirements;
  costSchedule?: StoredCostSchedule;    // Kept for backwards compat (not editable)
  embeddedMacro?: ActionMacro;          // Optional action macro to execute on cast
}

export const SPELL_GLOW_COLORS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'White', value: '#ffffff' },
];

export const SPELL_TAG_OPTIONS = [
  'Feuer',
  'Wasser',
  'Erde',
  'Luft',
  'Licht',
  'Dunkel',
  'Heilung',
  'Schutz',
  'Angriff',
  'Verteidigung',
  'Buff',
  'Debuff',
  'Beschwörung',
  'Verzauberung',
  'Illusion',
  'Weissagung',
  'Verwandlung',
  'Nekromantie',
];