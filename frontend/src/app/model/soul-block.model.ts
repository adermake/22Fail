import { NpcStatKey, NPC_STAT_KEYS, NpcStatblock, effectiveNpcStats, createEmptyNpcStatblock } from './npc-statblock.model';
import { SkillBlock } from './skill-block.model';

/**
 * A captured soul — obtained by studying or stealing the soul of a living being (NPC or PC).
 * Holds the being's base stats + level + skills, plus a GM-set quality multiplier that scales all
 * stats across the board. A player keeps souls under Wissen and can use one as a rune to summon a
 * being (the summoner builds the body; the soul's stats × multiplier are locked into the summon).
 */
export interface SoulBlock {
  id: string;
  sourceName: string;
  sourceType: 'npc' | 'pc';
  level: number;
  stats: Record<NpcStatKey, number>;
  skills: SkillBlock[];
  /** GM-set quality (extraction result). Multiplies every soul stat. */
  qualityMultiplier: number;
  createdAt: number;
}

/** The soul's stats after applying its quality multiplier — what a summon gets locked in. */
export function effectiveSoulStats(soul: SoulBlock): Record<NpcStatKey, number> {
  const mult = soul.qualityMultiplier || 1;
  const out = {} as Record<NpcStatKey, number>;
  for (const k of NPC_STAT_KEYS) out[k] = Math.max(1, Math.round((soul.stats[k] || 1) * mult));
  return out;
}

/** Build a soul from an NPC statblock (captures the effective stats + level + all skills). */
export function soulFromNpc(npc: NpcStatblock, multiplier: number, sourceType: 'npc' | 'pc' = 'npc'): SoulBlock {
  const eff = npc.soul ? effectiveNpcStats(npc.soul, npc.body) : {
    strength: npc.strength, dexterity: npc.dexterity, speed: npc.speed,
    intelligence: npc.intelligence, constitution: npc.constitution, wille: npc.wille,
  };
  return {
    id: 'soul_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
    sourceName: npc.name || 'Unbekanntes Wesen',
    sourceType,
    level: npc.soul?.level ?? npc.level ?? 1,
    stats: { ...eff },
    skills: JSON.parse(JSON.stringify(npc.customSkills ?? [])) as SkillBlock[],
    qualityMultiplier: multiplier,
    createdAt: Date.now(),
  };
}

/**
 * Seed an NpcStatblock for a summon built from a soul: the soul's stats (× quality) + level are locked
 * in, the soul's skills are pre-loaded, and the body is empty for the summoner to shape.
 */
export function createSummonStatblock(soul: SoulBlock): NpcStatblock {
  const sb = createEmptyNpcStatblock();
  sb.name = soul.sourceName + ' (Beschwörung)';
  sb.soul = { level: soul.level, stats: { ...effectiveSoulStats(soul) } };
  sb.customSkills = JSON.parse(JSON.stringify(soul.skills ?? [])) as SkillBlock[];
  return sb;
}
