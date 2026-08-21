import {
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/model/npc-statblock.model.ts
var NPC_STAT_KEYS = ["strength", "dexterity", "speed", "intelligence", "constitution", "wille"];
function soulPointBudget(level) {
  return 29 + Math.max(1, Math.floor(level) || 1);
}
function soulPointsSpent(soul) {
  return NPC_STAT_KEYS.reduce((sum, k) => sum + (soul.stats[k] || 0), 0);
}
function soulPointsRemaining(soul) {
  return soulPointBudget(soul.level) - soulPointsSpent(soul);
}
function createEmptyNpcSoul() {
  return {
    level: 1,
    stats: { strength: 1, dexterity: 1, speed: 1, intelligence: 1, constitution: 1, wille: 1 }
  };
}
function createEmptyNpcBody() {
  return { stabilitaet: 0, effizienz: 10, useWeaponEffizienz: false, useArmorStabilitaet: false, mods: [] };
}
function effectiveNpcStats(soul, body) {
  const out = __spreadValues({}, soul.stats);
  for (const m of body?.mods ?? []) {
    if (m.mode === "override")
      out[m.stat] = m.value;
    else
      out[m.stat] = (out[m.stat] || 0) + m.value;
  }
  return out;
}
function createEmptyNpcStatblock() {
  return {
    name: "Neues NSC",
    mode: "humanoid",
    raceId: void 0,
    raceName: "",
    level: 1,
    archetype: "fighter",
    notes: "",
    maxHealth: 80,
    maxMana: 40,
    maxEnergy: 50,
    strength: 10,
    dexterity: 10,
    speed: 10,
    intelligence: 10,
    constitution: 10,
    wille: 10,
    fokus: 10,
    fokusOverride: false,
    reaktionswert: 8,
    reaktionswertOverride: false,
    grundbonus: 0,
    grundbonusOverride: false,
    learnedSkillIds: [],
    customSkills: [],
    spells: [],
    equipment: [],
    soul: createEmptyNpcSoul(),
    body: createEmptyNpcBody(),
    primaryClassTarget: "K\xE4mpfer",
    secondaryClassTarget: "",
    classWeight: 80,
    gearBudget: 100,
    gearSpreadWeapon: 60,
    gearSpreadArmor: 30,
    gearSpreadAccessory: 10
  };
}

export {
  NPC_STAT_KEYS,
  soulPointBudget,
  soulPointsSpent,
  soulPointsRemaining,
  createEmptyNpcSoul,
  createEmptyNpcBody,
  effectiveNpcStats,
  createEmptyNpcStatblock
};
//# sourceMappingURL=chunk-CBEKLTT4.js.map
