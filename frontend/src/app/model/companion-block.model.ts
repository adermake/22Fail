import { NpcStatblock, createEmptyNpcStatblock } from './npc-statblock.model';
import { SoulBlock, createSummonStatblock } from './soul-block.model';
import { SUMMON_RUNE_ID } from '../shared/spell-node-editor/spell-node.model';

/**
 * A Begleiter — a summon, familiar or permanent companion a character keeps on the sheet
 * (Begleiter tab). Two flavours share one statblock model:
 *  - soul-bound (`soulId` set): built from a captured soul, its stats are locked and rescale with level;
 *  - free-form: authored like a GM builds an NPC (soul points distributed by hand).
 * The lobby always offers every Begleiter as a draggable token — whether a summon is "really" active
 * is the table's business, not the app's.
 */
export interface CompanionBlock {
  id: string;
  name: string;
  /** Set when built from a captured soul (Wissen → Seelen); its stats are locked in the editor. */
  soulId?: string;
  soulName?: string;
  statblock: NpcStatblock;
  createdAt: number;
}

export function generateCompanionId(): string {
  return 'comp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

/** A Begleiter built from a captured soul — stats locked, soul skills preloaded. */
export function companionFromSoul(soul: SoulBlock): CompanionBlock {
  const statblock = createSummonStatblock(soul);
  return {
    id: generateCompanionId(),
    name: statblock.name,
    soulId: soul.id,
    soulName: soul.sourceName,
    statblock,
    createdAt: Date.now(),
  };
}

/** A free-form Begleiter — an empty statblock the player shapes like the GM shapes an NPC. */
export function blankCompanion(name = 'Neuer Begleiter'): CompanionBlock {
  const statblock = createEmptyNpcStatblock();
  statblock.name = name;
  return { id: generateCompanionId(), name, statblock, createdAt: Date.now() };
}

/** Wrap an already-built statblock (e.g. one migrated out of a spell) as a Begleiter. */
export function companionFromStatblock(
  statblock: NpcStatblock,
  soul?: { id: string; name: string },
): CompanionBlock {
  return {
    id: generateCompanionId(),
    name: statblock.name || 'Begleiter',
    soulId: soul?.id,
    soulName: soul?.name,
    statblock,
    createdAt: Date.now(),
  };
}

/**
 * Legacy migration: summoning-rune nodes used to carry their own built statblock. Those move into the
 * Begleiter list once, and the node keeps only a reference. Mutates `sheet` and returns true if
 * anything changed (the caller persists both `companions` and `spells`).
 */
export function migrateSpellSummonsToCompanions(sheet: {
  companions?: CompanionBlock[];
  spells?: { graph?: { nodes?: any[] } }[];
}): boolean {
  let changed = false;
  const companions = sheet.companions ? [...sheet.companions] : [];
  for (const spell of sheet.spells ?? []) {
    for (const node of spell?.graph?.nodes ?? []) {
      if (node.runeId !== SUMMON_RUNE_ID || !node.summon?.statblock || node.summon.companionId) continue;
      const soul = node.summon.soulId ? { id: node.summon.soulId, name: node.summon.soulName } : undefined;
      const companion = companionFromStatblock(node.summon.statblock, soul as any);
      companions.push(companion);
      node.summon = { companionId: companion.id, companionName: companion.name };
      changed = true;
    }
  }
  if (changed) sheet.companions = companions;
  return changed;
}
