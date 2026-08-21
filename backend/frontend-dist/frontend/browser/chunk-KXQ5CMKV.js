import {
  ItemBlock
} from "./chunk-WK44VEJK.js";

// src/app/model/brewing.model.ts
var BREW_SLOT_MULT = {
  primary: 1,
  secondary: 2,
  tertiary: 3
};
var BREW_SLOT_LABELS = {
  primary: "Prim\xE4r",
  secondary: "Sekund\xE4r",
  tertiary: "Terti\xE4r"
};
function createEmptyBrewTrait() {
  return {
    id: `brewtrait_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: "Neues Merkmal",
    description: "",
    effect: "",
    braupunktKosten: 1,
    maxLevel: 1,
    scalable: false,
    isPublic: false
  };
}
function formatBrewTraitEffect(trait, level) {
  if (trait.scalable)
    return trait.effect.replace(/\[L\]/g, String(level));
  return trait.effect;
}
function brewTraitCost(trait, level = 1) {
  return Math.max(0, trait.braupunktKosten) * Math.max(0, level);
}
function createEmptyIngredientEffect() {
  return {
    statusEffectId: "",
    statusEffectName: "",
    mode: "STACK",
    amount: 1,
    cost: 1
  };
}
function createEmptyIngredientBlock(name = "Neuer Wirkstoff") {
  return {
    id: "",
    name,
    description: "",
    isPublic: false,
    primary: createEmptyIngredientEffect(),
    secondary: createEmptyIngredientEffect(),
    tertiary: createEmptyIngredientEffect(),
    cost: 0,
    rarity: "COMMON"
  };
}
function createEmptyExtractorBlock(name = "Neuer Extraktor") {
  return {
    id: "",
    name,
    description: "",
    isPublic: false,
    primaryReductionPercent: 0,
    secondaryReductionPercent: 0,
    tertiaryReductionPercent: 0,
    cost: 0,
    rarity: "COMMON"
  };
}
function brewCountOf(entry, slot) {
  if (slot === "primary")
    return entry.primaryBrewCount;
  if (slot === "secondary")
    return entry.secondaryBrewCount;
  return entry.tertiaryBrewCount;
}
function effectOf(ingredient, slot) {
  return ingredient[slot];
}
function combinedExtractorReduction(extractors, slot) {
  let sum = 0;
  for (const e of extractors) {
    if (slot === "primary")
      sum += e.extractor.primaryReductionPercent;
    else if (slot === "secondary")
      sum += e.extractor.secondaryReductionPercent;
    else
      sum += e.extractor.tertiaryReductionPercent;
  }
  return Math.min(95, Math.max(0, sum)) / 100;
}
function brewBaseCost(entry, slot, extractors) {
  const effect = effectOf(entry.ingredient, slot);
  return Math.max(1, Math.round(effect.cost * BREW_SLOT_MULT[slot] * (1 - combinedExtractorReduction(extractors, slot))));
}
function nextBrewCost(entry, slot, extractors) {
  const effect = effectOf(entry.ingredient, slot);
  if (!effect.statusEffectId)
    return Infinity;
  return brewBaseCost(entry, slot, extractors) * brewCountOf(entry, slot);
}
function totalBrewBPSpent(entry, slot, extractors) {
  const count = brewCountOf(entry, slot);
  if (count <= 1)
    return 0;
  const base = brewBaseCost(entry, slot, extractors);
  return base * (count * (count - 1)) / 2;
}
function intensifiedAmount(baseAmount, brewCount) {
  return baseAmount * Math.max(1, brewCount);
}
function newInstanceId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
function createResourceItem(kind, name, libraryAssetId, amount = 1, extras) {
  const item = new ItemBlock();
  item.id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  item.name = name;
  item.description = "";
  item.itemType = kind;
  item.libraryAssetId = libraryAssetId;
  item.stackable = true;
  item.amount = amount;
  item.weight = 0;
  item.lost = false;
  item.broken = false;
  item.isIdentified = true;
  item.requirements = {};
  if (extras)
    Object.assign(item, extras);
  return item;
}

export {
  BREW_SLOT_MULT,
  BREW_SLOT_LABELS,
  createEmptyBrewTrait,
  formatBrewTraitEffect,
  brewTraitCost,
  createEmptyIngredientEffect,
  createEmptyIngredientBlock,
  createEmptyExtractorBlock,
  brewCountOf,
  effectOf,
  nextBrewCost,
  totalBrewBPSpent,
  intensifiedAmount,
  newInstanceId,
  createResourceItem
};
//# sourceMappingURL=chunk-KXQ5CMKV.js.map
