import { NpcStatKey, NPC_STAT_KEYS, NpcStatblock, effectiveNpcStats, createEmptyNpcStatblock } from './npc-statblock.model';
import { SkillBlock } from './skill-block.model';

/**
 * A captured soul — obtained by studying or stealing the soul of a living being (NPC or PC).
 * Holds the being's stats at a given LEVEL + skills. Level represents quality: the per-level growth
 * (stats ÷ level) lets the soul be scaled up or down to any level. A player keeps souls under Wissen
 * and can use one as a rune to summon a being (the summoner builds the body; the soul's stats are
 * locked into the summon and rescale with level).
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

/** Per-level stat growth of the soul (stats ÷ level) — used to scale it to other levels. */
export function soulGrowth(soul: { level: number; stats: Record<NpcStatKey, number> }): Record<NpcStatKey, number> {
  const lvl = Math.max(1, soul.level || 1);
  const out = {} as Record<NpcStatKey, number>;
  for (const k of NPC_STAT_KEYS) out[k] = (soul.stats[k] || 0) / lvl;
  return out;
}

/** The soul's stats (level already baked in). Kept as a stable accessor for the UI. */
export function effectiveSoulStats(soul: SoulBlock): Record<NpcStatKey, number> {
  return { ...soul.stats };
}

/**
 * Build a soul from an NPC statblock, captured at `targetLevel`: the being's per-level growth is
 * derived from its own stats/level, then scaled to the chosen level. Level = quality.
 */
export function soulFromNpc(npc: NpcStatblock, targetLevel: number, sourceType: 'npc' | 'pc' = 'npc'): SoulBlock {
  const eff = npc.soul ? effectiveNpcStats(npc.soul, npc.body) : {
    strength: npc.strength, dexterity: npc.dexterity, speed: npc.speed,
    intelligence: npc.intelligence, constitution: npc.constitution, wille: npc.wille,
  };
  const npcLevel = Math.max(1, npc.soul?.level ?? npc.level ?? 1);
  const L = Math.max(1, Math.floor(targetLevel) || npcLevel);
  const stats = {} as Record<NpcStatKey, number>;
  for (const k of NPC_STAT_KEYS) stats[k] = Math.max(1, Math.round(((eff as any)[k] / npcLevel) * L));
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
 * Seed an NpcStatblock for a summon built from a soul: the soul's stats (× quality) + level are locked
 * in, the soul's skills are pre-loaded, and the body is empty for the summoner to shape.
 */
export function createSummonStatblock(soul: SoulBlock): NpcStatblock {
  const sb = createEmptyNpcStatblock();
  sb.name = soul.sourceName + ' (Beschwörung)';
  // Carry the growth so the summon's level can be moved up/down and its stats rescale.
  sb.soul = { level: soul.level, stats: { ...soul.stats }, growth: soulGrowth(soul) };
  sb.customSkills = JSON.parse(JSON.stringify(soul.skills ?? [])) as SkillBlock[];
  // Inherit the source image (overwritable in the summon editor).
  if (soul.image) { sb.image = soul.image; sb.defaultPortrait = soul.image; }
  return sb;
}
