import {
  NpcStatKey, NPC_STAT_KEYS, NpcStatblock, effectiveNpcStats, createEmptyNpcStatblock,
  distributeByRatio, soulPointBudget,
} from './npc-statblock.model';
import { SkillBlock } from './skill-block.model';

/**
 * A captured soul — obtained by studying or stealing the soul of a living being (NPC or PC).
 * Holds the being's stats at a given LEVEL + skills. Level represents quality.
 *
 * Souls run on the same point economy as every other NPC: `soulPointBudget(level)`. Capturing at
 * a higher level than the source therefore buys the extra points of those levels and nothing
 * more, dealt out in the source's own proportions. (It used to multiply instead — stats ÷ level
 * × target — which put a soul scaled to level 40 near 240 points against a hand-built NPC's 69.)
 */
export interface SoulBlock {
  id: string;
  sourceName: string;
  sourceType: 'npc' | 'pc';
  level: number;
  stats: Record<NpcStatKey, number>;
  skills: SkillBlock[];
  /** Image id inherited from the source being (used for the summon; overwritable in the editor). */
  image?: string;
  createdAt: number;
}

/** The soul's stats (level already baked in). Kept as a stable accessor for the UI. */
export function effectiveSoulStats(soul: SoulBlock): Record<NpcStatKey, number> {
  return { ...soul.stats };
}

/**
 * Build a soul from an NPC statblock, captured at `targetLevel`.
 *
 * The being's own stat proportions carry over; the level decides how many points there are to
 * spread across them. Nobody is present to distribute points during an extraction, so this is
 * exactly the locked behaviour of the NPC editor, applied once at capture time.
 */
export function soulFromNpc(npc: NpcStatblock, targetLevel: number, sourceType: 'npc' | 'pc' = 'npc'): SoulBlock {
  const eff = npc.soul ? effectiveNpcStats(npc.soul, npc.body) : {
    strength: npc.strength, dexterity: npc.dexterity, speed: npc.speed,
    intelligence: npc.intelligence, constitution: npc.constitution, wille: npc.wille,
  };
  const npcLevel = Math.max(1, npc.soul?.level ?? npc.level ?? 1);
  const L = Math.max(1, Math.floor(targetLevel) || npcLevel);
  const stats = distributeByRatio(soulPointBudget(L), eff as Record<NpcStatKey, number>);
  return {
    id: 'soul_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
    sourceName: npc.name || 'Unbekanntes Wesen',
    sourceType,
    level: L,
    stats,
    skills: JSON.parse(JSON.stringify(npc.customSkills ?? [])) as SkillBlock[],
    image: npc.image || npc.defaultPortrait || undefined,
    createdAt: Date.now(),
  };
}

/**
 * Seed an NpcStatblock for a summon built from a soul: the soul's stats + level are locked in,
 * the soul's skills are pre-loaded, and the body is empty for the summoner to shape.
 */
export function createSummonStatblock(soul: SoulBlock): NpcStatblock {
  const sb = createEmptyNpcStatblock();
  sb.name = soul.sourceName + ' (Beschwörung)';
  // Locked, with the soul's proportions frozen: moving the summon's level re-deals that level's
  // budget instead of leaving the summoner points to place by hand.
  sb.soul = { level: soul.level, stats: { ...soul.stats }, locked: true, ratio: { ...soul.stats } };
  sb.customSkills = JSON.parse(JSON.stringify(soul.skills ?? [])) as SkillBlock[];
  // Inherit the source image (overwritable in the summon editor).
  if (soul.image) { sb.image = soul.image; sb.defaultPortrait = soul.image; }
  return sb;
}
