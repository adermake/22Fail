import {
  FormulaType
} from "./chunk-SVTPZQLG.js";

// src/app/model/stat-block.model.ts
var StatBlock = class {
  name;
  bonus;
  base;
  gain;
  free;
  // Free stat points allocated to this stat
  current;
  effectBonus;
  // Auto-calculated from skills/items
  constructor(name, base, gain = 0, bonus = 0) {
    this.base = base;
    this.gain = gain;
    this.bonus = bonus;
    this.name = name;
    this.free = 0;
    this.current = 1;
    this.effectBonus = 0;
  }
};

// src/app/model/character-sheet-model.ts
function createEmptySheet() {
  return {
    name: "",
    race: "",
    age: 0,
    alignment: "",
    size: "",
    extrainfo: "",
    primary_class: "",
    secondary_class: "",
    level: 1,
    learned_classes: "",
    strength: createEmptyStatBlock("St\xE4rke"),
    dexterity: createEmptyStatBlock("Geschicklichkeit"),
    speed: createEmptyStatBlock("Geschwindigkeit"),
    intelligence: createEmptyStatBlock("Intelligenz"),
    chill: createEmptyStatBlock("Wille"),
    constitution: createEmptyStatBlock("Konstitution"),
    skills: [],
    inventory: [],
    equipment: [],
    resources: [],
    carryCapacityMultiplier: 1,
    carryCapacityBonus: 0,
    speedPenaltyNegation: 0,
    statuses: createBasicStatuses(),
    runes: [],
    spells: [],
    fokusMultiplier: 1,
    fokusBonus: 0,
    currency: {
      copper: 0,
      silver: 0,
      gold: 0,
      platinum: 0
    },
    trash: [],
    activeStatusEffects: [],
    seenStatusEffectIds: [],
    talentPoints: 2,
    talentPointsBonus: 0,
    learnedSkillIds: [],
    talentRanks: {},
    talentRankBonus: 0,
    herstellenEntries: [],
    freeStatPoints: 0,
    freeStatPointsBonus: 0,
    grundbonusBonus: 0,
    reaktionswertBonus: 0,
    backstory: "",
    knownMaterialIds: [],
    knownForgeTraitIds: [],
    knownIngredientIds: [],
    knownExtractorIds: [],
    knownBrewTraitIds: []
  };
}
function createEmptyStatBlock(name) {
  return new StatBlock(name, 10, 5, 0);
}
function createBasicStatuses() {
  return [
    {
      statusName: "Leben",
      statusColor: "red",
      statusBase: 80,
      statusBonus: 0,
      statusCurrent: 80,
      formulaType: FormulaType.LIFE
    },
    {
      statusName: "Ausdauer",
      statusColor: "green",
      statusBase: 50,
      statusBonus: 0,
      statusCurrent: 50,
      formulaType: FormulaType.ENERGY
    },
    {
      statusName: "Mana",
      statusColor: "blue",
      statusBase: 40,
      statusBonus: 0,
      statusCurrent: 40,
      formulaType: FormulaType.MANA
    }
  ];
}

export {
  StatBlock,
  createEmptySheet
};
//# sourceMappingURL=chunk-U6IPOXKZ.js.map
