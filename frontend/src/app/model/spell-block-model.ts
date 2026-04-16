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

export interface StoredCostCase {
  label: string;
  turns: StoredCostTurn[];
  subcases?: StoredCostCase[];
  isUnknownBranch?: boolean;
}

export interface StoredCostSchedule {
  cases: StoredCostCase[];
}

export function generateSpellId(): string {
  return 'spell_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

// ─────────────────────────────────────────────────────────────────────────────

export class SpellBlock {
  id?: string;                          // Stable identifier (prevents duplicate-save bugs)
  name!: string;
  description!: string;
  drawing?: string;
  tags!: string[];
  binding!: SpellBinding;
  strokeColor?: string;
  libraryOrigin?: string;
  libraryOriginName?: string;
  graph?: SpellGraph;
  costMana?: number;
  costFokus?: number;
  statRequirements?: SpellStatRequirements;
  costSchedule?: StoredCostSchedule;    // Detailed cost plan (from estimator or manual)
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
  'Fire',
  'Water',
  'Earth',
  'Air',
  'Light',
  'Dark',
  'Healing',
  'Protection',
  'Attack',
  'Defense',
  'Buff',
  'Debuff',
  'Summoning',
  'Enchantment',
  'Illusion',
  'Divination',
  'Transmutation',
  'Necromancy',
];