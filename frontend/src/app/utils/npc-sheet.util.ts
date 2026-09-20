import { SKILL_DEFINITIONS } from '../data/skill-definitions';
import { CharacterSheet, createEmptySheet } from '../model/character-sheet-model';
import { FormulaType } from '../model/formula-type.enum';
import { TokenStatusEffect } from '../model/lobby.model';
import { NpcStatblock } from '../model/npc-statblock.model';
import { SkillBlock, StatModifier } from '../model/skill-block.model';
import { ActiveSkillEntry, CastingSpellEntry } from '../model/spell-block-model';
import { StatBlock } from '../model/stat-block.model';
import { ActiveStatusEffect } from '../model/status-effect.model';

/**
 * An NSC as a CharacterSheet, so `TrueStatsService` can calculate for it.
 *
 * NSCs used to be calculated twice: the statblock's flat fields on one side (soul + Körper only)
 * and a hand-built stub in the lobby panel on the other, which is why a Fähigkeit with
 * `+4 Konstitution` moved the token's stats but not the statblock, and a `+30 Leben` moved
 * neither. One builder, one calculator — the sheet here is the only bridge.
 *
 * Contract with `applyDerivedNpcStats`: the six stat BASES are the soul + Körper values from the
 * statblock, and skills/items add on top via the calculator. The resource statuses therefore carry
 * `statusBase: 0` — `calculateResourceMax` adds Stat×5, the flat Leben per level and every
 * skill/item/effect bonus itself. Handing it the statblock's `maxHealth` as a base (as the old stub
 * did) counted the whole pool twice, which is what `healthMax` inside an NSC script used to read.
 */

/**
 * Grundpool je Ressource, den jeder NSC bekommt — die billige Schätzung für die Rassenbasis.
 *
 * Every race hands a player exactly 50 points spread over Leben/Mana/Ausdauer (a Troll 30/0/20, an
 * Engel 10/25/15). NSCs have no race, so they used to start from Stat×5 alone and were short a full
 * player's worth of pool. Rather than model per-creature pools, every NSC gets the same flat 15 in
 * each: 45 instead of 50, evenly split, close enough at the table and impossible to get wrong.
 *
 * It is the `statusBase` of the synthetic sheet, so it lands in exactly one place and every
 * consumer — Editor, Spawn, Lobby, Skripte — sees the same number.
 */
export const NPC_BASE_POOL = 15;

/** Live state of the token an NSC is standing on. Omitted entirely when there is none (editor). */
export interface NpcSheetTokenState {
  id?: string;
  worldName?: string;
  currentHealth?: number;
  currentMana?: number;
  currentEnergy?: number;
  /** Toggled per-round skills (cast window) — merged with `activeSkillEntries`. */
  activeSkillNames?: string[];
  /** Skills activated from the abilities dock. */
  activeSkillEntries?: ActiveSkillEntry[];
  castingSpells?: CastingSpellEntry[];
  activeStatusEffects?: TokenStatusEffect[];
}

/**
 * A class-tree definition as an editable SkillBlock.
 *
 * `statBonus`/`statBonuses` become `statModifiers`, exactly as learning the skill does on a player
 * sheet (`skill-tree.component`). Without that step the numbers printed on a Fähigkeit were pure
 * decoration on an NSC.
 */
export function npcSkillFromDefinition(id: string): SkillBlock | null {
  const def = SKILL_DEFINITIONS.find(s => s.id === id);
  if (!def) return null;
  return {
    name: def.name,
    class: def.class,
    description: def.description,
    type: def.type as SkillBlock['type'],
    enlightened: def.enlightened ?? false,
    skillId: def.id,
    cost: def.cost,
    actionType: def.actionType,
    statModifiers: statModifiersOf(def.id),
  } as SkillBlock;
}

/** The `statModifiers` a class-tree skill grants, or undefined when it grants none. */
export function statModifiersOf(skillId: string): StatModifier[] | undefined {
  const def = SKILL_DEFINITIONS.find(s => s.id === skillId);
  if (!def) return undefined;
  const mods: StatModifier[] = [];
  if (def.statBonus) mods.push({ stat: def.statBonus.stat as StatModifier['stat'], amount: def.statBonus.amount });
  for (const b of def.statBonuses ?? []) {
    mods.push({ stat: b.stat as StatModifier['stat'], amount: b.amount });
  }
  return mods.length ? mods : undefined;
}

/** Every Fähigkeit an NSC has: its own blocks plus any still-unmaterialised class-tree ids. */
export function npcSkillBlocks(npc: NpcStatblock): SkillBlock[] {
  const custom = (npc.customSkills ?? []).filter((s): s is SkillBlock => !!s);
  const haveId = new Set(custom.map(s => s.skillId).filter(Boolean));
  const tree = (npc.learnedSkillIds ?? [])
    .filter(id => !haveId.has(id))
    .map(id => npcSkillFromDefinition(id))
    .filter((s): s is SkillBlock => !!s);
  return [...tree, ...custom];
}

/** A token status effect as the sheet's own active-effect shape (same library reference). */
function toActiveEffect(fx: TokenStatusEffect): ActiveStatusEffect {
  return {
    statusEffectId: fx.statusEffectId ?? fx.id,
    sourceLibraryId: '',
    appliedAt: fx.appliedAt ?? 0,
    duration: fx.duration,
    stacks: fx.stacks || 1,
    customName: fx.name,
    customEffect: fx.customEffect,
  };
}

/** Fokus the statblock states outright, expressed as the sheet's bonus over ⌊INT/2⌋ + 5. */
function fokusBridge(npc: NpcStatblock): number {
  if (!npc.fokusOverride) return 0;
  return (npc.fokus ?? 0) - (Math.floor((npc.intelligence ?? 0) / 2) + 5);
}

export function buildNpcSheet(npc: NpcStatblock, state: NpcSheetTokenState = {}): CharacterSheet {
  const sheet = createEmptySheet();
  const stat = (name: string, base: number): StatBlock => {
    const sb = new StatBlock(name, base);
    sb.current = base;
    return sb;
  };

  sheet.id = state.id ?? '';
  sheet.name = npc.name;
  if (state.worldName) sheet.worldName = state.worldName;
  sheet.level = npc.level || 1;

  // Bases only — skills, gear and effects are the calculator's job (see the note above).
  sheet.strength = stat('Stärke', npc.strength ?? 0);
  sheet.dexterity = stat('Geschicklichkeit', npc.dexterity ?? 0);
  sheet.speed = stat('Geschwindigkeit', npc.speed ?? 0);
  sheet.intelligence = stat('Intelligenz', npc.intelligence ?? 0);
  sheet.constitution = stat('Konstitution', npc.constitution ?? 0);
  sheet.chill = stat('Wille', npc.wille ?? 0);

  sheet.skills = npcSkillBlocks(npc);
  sheet.spells = npc.spells ?? [];
  // By reference: item identity has to match `npc.equipment` or the Konstrukt budget cannot
  // recognise the same machine twice.
  sheet.equipment = npc.equipment ?? [];
  sheet.inventory = npc.inventory ?? [];
  sheet.fokusMultiplier = 1;
  sheet.fokusBonus = fokusBridge(npc);

  // A skill counts as active from either channel: the cast window's toggle list or the dock's
  // entries. TrueStatsService merges the same two, so both agree on what is running.
  sheet.activeSkillNames = state.activeSkillNames ?? [];
  sheet.activeSkillEntries = state.activeSkillEntries ?? [];
  sheet.castingSpells = state.castingSpells ?? [];
  sheet.activeStatusEffects = (state.activeStatusEffects ?? []).map(toActiveEffect);

  sheet.statuses = [
    { formulaType: FormulaType.LIFE, statusBase: NPC_BASE_POOL, statusCurrent: state.currentHealth ?? npc.maxHealth ?? 0, statusBonus: 0, statusEffectBonus: 0, statusName: 'Leben', statusColor: 'red' },
    { formulaType: FormulaType.MANA, statusBase: NPC_BASE_POOL, statusCurrent: state.currentMana ?? npc.maxMana ?? 0, statusBonus: 0, statusEffectBonus: 0, statusName: 'Mana', statusColor: 'blue' },
    { formulaType: FormulaType.ENERGY, statusBase: NPC_BASE_POOL, statusCurrent: state.currentEnergy ?? npc.maxEnergy ?? 0, statusBonus: 0, statusEffectBonus: 0, statusName: 'Ausdauer', statusColor: 'green' },
  ] as CharacterSheet['statuses'];

  return sheet;
}
