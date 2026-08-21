import {
  NPC_STAT_KEYS,
  createEmptyNpcStatblock,
  effectiveNpcStats
} from "./chunk-CBEKLTT4.js";
import {
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/model/soul-block.model.ts
function soulGrowth(soul) {
  const lvl = Math.max(1, soul.level || 1);
  const out = {};
  for (const k of NPC_STAT_KEYS)
    out[k] = (soul.stats[k] || 0) / lvl;
  return out;
}
function effectiveSoulStats(soul) {
  return __spreadValues({}, soul.stats);
}
function soulFromNpc(npc, targetLevel, sourceType = "npc") {
  const eff = npc.soul ? effectiveNpcStats(npc.soul, npc.body) : {
    strength: npc.strength,
    dexterity: npc.dexterity,
    speed: npc.speed,
    intelligence: npc.intelligence,
    constitution: npc.constitution,
    wille: npc.wille
  };
  const npcLevel = Math.max(1, npc.soul?.level ?? npc.level ?? 1);
  const L = Math.max(1, Math.floor(targetLevel) || npcLevel);
  const stats = {};
  for (const k of NPC_STAT_KEYS)
    stats[k] = Math.max(1, Math.round(eff[k] / npcLevel * L));
  return {
    id: "soul_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
    sourceName: npc.name || "Unbekanntes Wesen",
    sourceType,
    level: L,
    stats,
    skills: JSON.parse(JSON.stringify(npc.customSkills ?? [])),
    image: npc.image || npc.defaultPortrait || void 0,
    createdAt: Date.now()
  };
}
function createSummonStatblock(soul) {
  const sb = createEmptyNpcStatblock();
  sb.name = soul.sourceName + " (Beschw\xF6rung)";
  sb.soul = { level: soul.level, stats: __spreadValues({}, soul.stats), growth: soulGrowth(soul) };
  sb.customSkills = JSON.parse(JSON.stringify(soul.skills ?? []));
  if (soul.image) {
    sb.image = soul.image;
    sb.defaultPortrait = soul.image;
  }
  return sb;
}

export {
  effectiveSoulStats,
  soulFromNpc,
  createSummonStatblock
};
//# sourceMappingURL=chunk-USZVCDDR.js.map
