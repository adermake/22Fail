/**
 * FailScript symbol table — the single source of truth for what a script can reference.
 * Drives the static checker, the interpreter's resolver, and the editor's autocomplete /
 * reference panel. Player values resolve via TrueStatsService; NPC values via NpcStatblock.
 */

import { StatusModifierTarget } from '../model/status-effect.model';
import { TALENT_DEFINITIONS } from '../data/talent-definitions';

export type SymbolCategory =
  | 'attribute' | 'resource' | 'derived' | 'level' | 'class' | 'currency' | 'namespace' | 'runtime';

/** Display styles for display()/stat()/banner(). */
export const STYLE_NAMES = new Set(['good', 'bad', 'neutral', 'info']);

export interface SymbolInfo {
  name: string;
  category: SymbolCategory;
  type: 'number' | 'string' | 'namespace';
  description: string;
  /** Assignable (only inside a lifecycle block) — becomes a temporary status modifier. */
  assignable?: boolean;
  /** Which status-modifier target a temporary assignment maps to. */
  modifierTarget?: StatusModifierTarget;
}

/** Attribute member sub-properties, e.g. `strength.modifier`. */
export const ATTRIBUTE_MEMBERS: Record<string, string> = {
  modifier: 'D&D-Modifikator: (Wert−10)/2',
  diceModifier: 'Würfel-Modifikator (niedriger = besser)',
  base: 'Basiswert',
  current: 'Aktueller Gesamtwert',
};

/** Resource names accepted by loseResource/gainResource and as the resource selector. */
export const RESOURCE_NAMES = new Set(['health', 'energy', 'mana', 'fokus']);

const A = (name: string, target: StatusModifierTarget, description: string): SymbolInfo =>
  ({ name, category: 'attribute', type: 'number', description, assignable: true, modifierTarget: target });

export const SYMBOLS: SymbolInfo[] = [
  // Attributes (true totals via TrueStatsService)
  A('strength', 'strength', 'Stärke (Gesamtwert)'),
  A('dexterity', 'dexterity', 'Geschicklichkeit (Gesamtwert)'),
  A('speed', 'speed', 'Geschwindigkeit (Gesamtwert)'),
  A('intelligence', 'intelligence', 'Intelligenz (Gesamtwert)'),
  A('constitution', 'constitution', 'Konstitution (Gesamtwert)'),
  A('wille', 'chill', 'Wille (Gesamtwert)'),

  // Level / class
  { name: 'level', category: 'level', type: 'number', description: 'Charakterstufe' },
  { name: 'primaryClass', category: 'class', type: 'string', description: 'Primäre Klasse' },
  { name: 'secondaryClass', category: 'class', type: 'string', description: 'Sekundäre Klasse' },

  // Resources (current + max) — read-only; change via loseResource/gainResource
  { name: 'health', category: 'resource', type: 'number', description: 'Aktuelles Leben' },
  { name: 'healthMax', category: 'resource', type: 'number', description: 'Maximales Leben' },
  { name: 'energy', category: 'resource', type: 'number', description: 'Aktuelle Ausdauer' },
  { name: 'energyMax', category: 'resource', type: 'number', description: 'Maximale Ausdauer' },
  { name: 'mana', category: 'resource', type: 'number', description: 'Aktuelles Mana' },
  { name: 'manaMax', category: 'resource', type: 'number', description: 'Maximales Mana' },
  { name: 'fokus', category: 'resource', type: 'number', description: 'Verfügbarer Fokus' },
  { name: 'fokusMax', category: 'resource', type: 'number', description: 'Maximaler Fokus' },

  // Derived values
  { name: 'movement', category: 'derived', type: 'number', description: 'Bewegung in Hex-Schritten', assignable: true, modifierTarget: 'bewegung' },
  { name: 'grundbonus', category: 'derived', type: 'number', description: 'Grundbonus', assignable: true, modifierTarget: 'grundbonus' },
  { name: 'reaktion', category: 'derived', type: 'number', description: 'Reaktionswert', assignable: true, modifierTarget: 'reaktion' },
  { name: 'armorMalus', category: 'derived', type: 'number', description: 'Rüstungsmalus (Geschw.)', assignable: true, modifierTarget: 'armorMalus' },
  { name: 'armorNegation', category: 'derived', type: 'number', description: 'Rüstungsnegation', assignable: true, modifierTarget: 'armorNegation' },
  { name: 'effectiveSpeed', category: 'derived', type: 'number', description: 'Effektive Geschwindigkeit (nach Malus)' },
  { name: 'baseSpeed', category: 'derived', type: 'number', description: 'Basis-Geschwindigkeit (ohne Malus)' },
  { name: 'totalArmorDebuff', category: 'derived', type: 'number', description: 'Rüstungs-Geschw.-Malus (Items)' },
  { name: 'speedPenaltyNegation', category: 'derived', type: 'number', description: 'Geschw.-Malus-Negation' },
  { name: 'encumbrancePercent', category: 'derived', type: 'number', description: 'Beladung in %' },
  { name: 'totalWeight', category: 'derived', type: 'number', description: 'Getragenes Gewicht' },
  { name: 'maxCapacity', category: 'derived', type: 'number', description: 'Maximale Tragkraft' },

  // Currency
  { name: 'copper', category: 'currency', type: 'number', description: 'Kupfer' },
  { name: 'silver', category: 'currency', type: 'number', description: 'Silber' },
  { name: 'gold', category: 'currency', type: 'number', description: 'Gold' },
  { name: 'platinum', category: 'currency', type: 'number', description: 'Platin' },

  // Runtime context (of the current effect/execution)
  { name: 'stacks', category: 'runtime', type: 'number', description: 'Stapelanzahl des aktuellen Effekts (Code verarbeitet Stapel selbst)' },
  { name: 'turn', category: 'runtime', type: 'number', description: 'Aktuelle Zugnummer (0 außerhalb des Kampfes)' },
  { name: 'effectStrength', category: 'runtime', type: 'number', description: 'Stärke des aktuellen Status-Effekts' },

  // Namespace
  { name: 'talent', category: 'namespace', type: 'namespace', description: 'Talent-Würfelboni: talent.<name>' },
];

export const SYMBOL_MAP = new Map(SYMBOLS.map(s => [s.name, s]));

/** Talent ids usable as `talent.<id>`. */
export const TALENT_IDS = new Set(TALENT_DEFINITIONS.map(t => t.id));
export const TALENT_INFO = TALENT_DEFINITIONS.map(t => ({ id: t.id, name: t.name, statLabel: t.statLabel, description: t.description }));

// ── Built-in functions ──

export interface FnInfo {
  name: string;
  signature: string;
  description: string;
  minArgs: number;
  maxArgs: number;
  /** First arg is a resource selector identifier (loseResource/gainResource). */
  resourceFirstArg?: boolean;
  /** Index of an optional style-selector argument (good/bad/neutral/info). */
  styleArgIndex?: number;
}

export const BUILTINS: FnInfo[] = [
  { name: 'display', signature: 'display(text, style?)', description: 'Zeigt Text an (style: good/bad/neutral/info)', minArgs: 1, maxArgs: 2, styleArgIndex: 1 },
  { name: 'stat', signature: 'stat(label, value, style?)', description: 'Zeigt einen Wert als Chip an', minArgs: 2, maxArgs: 3, styleArgIndex: 2 },
  { name: 'banner', signature: 'banner(text, style?)', description: 'Große Überschrift', minArgs: 1, maxArgs: 2, styleArgIndex: 1 },
  { name: 'roll', signature: 'roll(dice) oder roll(count, sides)', description: 'Würfelt und liefert das Ergebnis', minArgs: 1, maxArgs: 2 },
  { name: 'loseResource', signature: 'loseResource(resource, amount)', description: 'Verliert dauerhaft Ressource (health/energy/mana/fokus)', minArgs: 2, maxArgs: 2, resourceFirstArg: true },
  { name: 'gainResource', signature: 'gainResource(resource, amount)', description: 'Gewinnt dauerhaft Ressource', minArgs: 2, maxArgs: 2, resourceFirstArg: true },
  { name: 'applyStatus', signature: 'applyStatus(id, stacks?)', description: 'Wendet einen Status-Effekt an', minArgs: 1, maxArgs: 2 },
  { name: 'removeStatus', signature: 'removeStatus(id)', description: 'Entfernt einen Status-Effekt', minArgs: 1, maxArgs: 1 },
  { name: 'hasSkill', signature: 'hasSkill(name)', description: 'Ob eine Fähigkeit vorhanden ist (true/false)', minArgs: 1, maxArgs: 1 },
  { name: 'min', signature: 'min(a, b, …)', description: 'Kleinster Wert', minArgs: 1, maxArgs: 99 },
  { name: 'max', signature: 'max(a, b, …)', description: 'Größter Wert', minArgs: 1, maxArgs: 99 },
  { name: 'floor', signature: 'floor(x)', description: 'Abrunden', minArgs: 1, maxArgs: 1 },
  { name: 'ceil', signature: 'ceil(x)', description: 'Aufrunden', minArgs: 1, maxArgs: 1 },
  { name: 'round', signature: 'round(x)', description: 'Runden', minArgs: 1, maxArgs: 1 },
  { name: 'abs', signature: 'abs(x)', description: 'Betrag', minArgs: 1, maxArgs: 1 },
];

export const BUILTIN_MAP = new Map(BUILTINS.map(f => [f.name, f]));

export const KEYWORD_INFO: { name: string; description: string; snippet?: string }[] = [
  { name: 'var', description: 'Lokale Variable deklarieren', snippet: 'var name = 0' },
  { name: 'if', description: 'Bedingung', snippet: 'if (bedingung) {\n\t\n}' },
  { name: 'else', description: 'Sonst-Zweig' },
  { name: 'untilNextTurn', description: 'Temporäre Modifikatoren bis zum nächsten Zug', snippet: 'untilNextTurn {\n\t\n}' },
  { name: 'grantSkill', description: 'Temporäre Fähigkeit gewähren', snippet: 'grantSkill("Name", 0, 0, 0) {\n\t\n}' },
  { name: 'action', description: 'Benannter Aktionsblock', snippet: 'action name {\n\t\n}' },
  { name: 'repeat', description: 'Wiederhole n-mal', snippet: 'repeat(n) {\n\t\n}' },
  { name: 'while', description: 'Solange Bedingung wahr', snippet: 'while (bedingung) {\n\t\n}' },
  { name: 'true', description: 'Wahr' },
  { name: 'false', description: 'Falsch' },
];
