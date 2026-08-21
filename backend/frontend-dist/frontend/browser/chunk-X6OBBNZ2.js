import {
  ItemBlock
} from "./chunk-WK44VEJK.js";
import {
  AssetBrowserApiService
} from "./chunk-BNPZFNFF.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MaxValidator,
  MinValidator,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  NumberValueAccessor,
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-VMGRJE2Y.js";
import {
  CommonModule,
  DecimalPipe
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  firstValueFrom,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdeclareLet,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵreadContextLet,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstoreLet,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-XJL25EXC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/model/forging.model.ts
var WEAPON_STAT_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "SPD"];
var WEAPON_STAT_TO_REQUIREMENT = {
  STR: "strength",
  DEX: "dexterity",
  CON: "constitution",
  INT: "intelligence",
  WIS: "chill",
  SPD: "speed"
};
var WEAPON_TYPES = [
  // Leicht
  { name: "Messer", category: "LEICHT", damageType: "Schnitt", range: "0,5m", defaultForgeSize: "LIGHT" },
  { name: "Sichel", category: "LEICHT", damageType: "Schnitt", range: "0,5m", defaultForgeSize: "LIGHT" },
  { name: "Kurzschwert", category: "LEICHT", damageType: "Schnitt", range: "1m", defaultForgeSize: "LIGHT" },
  { name: "Peitsche", category: "LEICHT", damageType: "Schnitt", range: "3m", defaultForgeSize: "LIGHT" },
  { name: "Dolch", category: "LEICHT", damageType: "Stich", range: "0,5m", defaultForgeSize: "LIGHT" },
  { name: "Rapier", category: "LEICHT", damageType: "Stich", range: "1,5m", defaultForgeSize: "LIGHT" },
  { name: "Handschuhe", category: "LEICHT", damageType: "Wucht", range: "0,5m", defaultForgeSize: "LIGHT" },
  { name: "Nunchaku", category: "LEICHT", damageType: "Wucht", range: "0,5m", defaultForgeSize: "LIGHT" },
  { name: "Stab", category: "LEICHT", damageType: "Wucht", range: "1m", defaultForgeSize: "LIGHT" },
  // Fernkampf
  { name: "Wurfbeil", category: "FERNKAMPF", damageType: "Schnitt", range: "10m", defaultForgeSize: "LIGHT" },
  { name: "Wurfmesser", category: "FERNKAMPF", damageType: "Schnitt", range: "20m", defaultForgeSize: "LIGHT" },
  { name: "Wurfspeer", category: "FERNKAMPF", damageType: "Stich", range: "50m", defaultForgeSize: "LIGHT" },
  { name: "Kurzbogen", category: "FERNKAMPF", damageType: "Stich", range: "50m", defaultForgeSize: "LIGHT" },
  { name: "Armbrust", category: "FERNKAMPF", damageType: "Stich", range: "100m", defaultForgeSize: "LIGHT" },
  { name: "Langbogen", category: "FERNKAMPF", damageType: "Stich", range: "100m", defaultForgeSize: "LIGHT" },
  { name: "Bola", category: "FERNKAMPF", damageType: "Wucht", range: "20m", defaultForgeSize: "LIGHT" },
  { name: "Bumerang", category: "FERNKAMPF", damageType: "Wucht", range: "30m", defaultForgeSize: "LIGHT" },
  { name: "Schleuder", category: "FERNKAMPF", damageType: "Wucht", range: "50m", defaultForgeSize: "LIGHT" },
  // Schwer
  { name: "Axt", category: "SCHWER", damageType: "Schnitt", range: "1,5m", defaultForgeSize: "HEAVY" },
  { name: "S\xE4bel", category: "SCHWER", damageType: "Schnitt", range: "1,5m", defaultForgeSize: "HEAVY" },
  { name: "Sense", category: "SCHWER", damageType: "Schnitt", range: "1,5m", defaultForgeSize: "HEAVY" },
  { name: "Kriegsaxt", category: "SCHWER", damageType: "Schnitt", range: "2m", defaultForgeSize: "HEAVY" },
  { name: "Langschwert", category: "SCHWER", damageType: "Schnitt", range: "2m", defaultForgeSize: "HEAVY" },
  { name: "Gleve", category: "SCHWER", damageType: "Schnitt", range: "2,5m", defaultForgeSize: "HEAVY" },
  { name: "Gro\xDFschwert", category: "SCHWER", damageType: "Schnitt", range: "2,5m", defaultForgeSize: "HEAVY" },
  { name: "Hellebarde", category: "SCHWER", damageType: "Schnitt", range: "3m", defaultForgeSize: "HEAVY" },
  { name: "Hacke", category: "SCHWER", damageType: "Stich", range: "1m", defaultForgeSize: "HEAVY" },
  { name: "Dreizack", category: "SCHWER", damageType: "Stich", range: "2m", defaultForgeSize: "HEAVY" },
  { name: "Langspeer", category: "SCHWER", damageType: "Stich", range: "3m", defaultForgeSize: "HEAVY" },
  { name: "Lanze", category: "SCHWER", damageType: "Stich", range: "3m", defaultForgeSize: "HEAVY" },
  { name: "Schild", category: "SCHWER", damageType: "Wucht", range: "0,5m", defaultForgeSize: "HEAVY" },
  { name: "Hammer", category: "SCHWER", damageType: "Wucht", range: "1m", defaultForgeSize: "HEAVY" },
  { name: "Keule", category: "SCHWER", damageType: "Wucht", range: "2m", defaultForgeSize: "HEAVY" },
  { name: "Kriegshammer", category: "SCHWER", damageType: "Wucht", range: "2m", defaultForgeSize: "HEAVY" },
  { name: "Morgenstern", category: "SCHWER", damageType: "Wucht", range: "2,5m", defaultForgeSize: "HEAVY" }
];
var WEAPON_CATEGORY_LABELS = {
  LEICHT: "Leicht",
  FERNKAMPF: "Fernkampf",
  SCHWER: "Schwer"
};
var ARMOR_TYPES = [
  { name: "Helm", weight: "LEICHT", itemBlockType: "helmet" },
  { name: "Brustplatte", weight: "SCHWER", itemBlockType: "chestplate" },
  { name: "Hose", weight: "MITTEL", itemBlockType: "leggings" },
  { name: "Stiefel", weight: "LEICHT", itemBlockType: "boots" },
  { name: "Armschienen", weight: "LEICHT", itemBlockType: "armschienen" }
];
var ARMOR_WEIGHT_MULT = {
  LEICHT: 0.8,
  MITTEL: 1,
  SCHWER: 1.2
};
function nextForgeCost(forgeCount) {
  return forgeCount + 1;
}
function totalForgeSPSpent(forgeCount) {
  return forgeCount * (forgeCount + 1) / 2;
}
function createEmptyMaterialBlock() {
  return {
    id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: "Neues Material",
    description: "",
    isPublic: false,
    canBeWeaponMaterial: true,
    canBeArmorMaterial: false,
    cost: 0,
    rarity: "COMMON",
    stackable: false,
    stackLevels: [],
    weaponStats: {
      haltbarkeit: 50,
      haltbarkeitSkalierung: 10,
      effektivitaet: 5,
      effektivitaetSkalierung: 2,
      extraEffect: "",
      weight: 1,
      reqBase: 0,
      reqScaling: 0
    },
    armorStats: {
      haltbarkeit: 80,
      haltbarkeitSkalierung: 15,
      effektivitaet: 5,
      effektivitaetSkalierung: 2,
      extraEffect: "",
      weight: 2,
      ruestungsmalus: 0,
      reqBase: 0,
      reqScaling: 0
    }
  };
}
function createEmptyForgeTrait() {
  return {
    id: `trait_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: "Neues Merkmal",
    description: "",
    effect: "Effekt [L]",
    schmiedepunktKosten: 10,
    maxLevel: 1,
    scalable: false,
    isPublic: false,
    appliesTo: "all"
  };
}
function formatTraitEffect(trait, level) {
  if (trait.scalable) {
    return trait.effect.replace(/\[L\]/g, String(level));
  }
  return trait.effect;
}
function computeForgedStats(material, forgeCount, isWeapon) {
  const base = isWeapon ? material.weaponStats : material.armorStats;
  if (!base)
    return null;
  return {
    haltbarkeit: base.haltbarkeit + forgeCount * base.haltbarkeitSkalierung,
    effektivitaet: base.effektivitaet + forgeCount * base.effektivitaetSkalierung,
    weight: base.weight ?? 0,
    ruestungsmalus: base.ruestungsmalus,
    extraEffect: base.extraEffect ?? "",
    statRequirement: (base.reqBase ?? 0) + forgeCount * (base.reqScaling ?? 0)
  };
}

// src/app/sheet/forging/forging.component.ts
var _forTrack0 = ($index, $item) => $item.key;
var _forTrack1 = ($index, $item) => $item.name;
var _forTrack2 = ($index, $item) => $item.material.id;
var _forTrack3 = ($index, $item) => $item.trait.id;
var _forTrack4 = ($index, $item) => $item.id;
function ForgingComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275element(1, "span", 3);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "Bibliothek wird geladen...");
    \u0275\u0275elementEnd()();
  }
}
function ForgingComponent_Conditional_2_Conditional_21_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 9);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Conditional_21_For_5_Template_button_click_0_listener() {
      const s_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.statRequirement = s_r5);
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const s_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r1.statRequirement === s_r5);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(s_r5);
  }
}
function ForgingComponent_Conditional_2_Conditional_21_For_23_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 43);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const wt_r6 = ctx.$implicit;
    \u0275\u0275property("ngValue", wt_r6);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3("", wt_r6.name, " (", wt_r6.damageType, ", ", wt_r6.range, ")");
  }
}
function ForgingComponent_Conditional_2_Conditional_21_For_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "optgroup", 44);
    \u0275\u0275repeaterCreate(1, ForgingComponent_Conditional_2_Conditional_21_For_23_For_2_Template, 2, 4, "option", 43, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("label", ctx_r1.weaponCategoryLabels[cat_r7]);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.getWeaponTypesForCategory(cat_r7));
  }
}
function ForgingComponent_Conditional_2_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 36)(1, "label");
    \u0275\u0275text(2, "Stat-Anforderung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 37);
    \u0275\u0275repeaterCreate(4, ForgingComponent_Conditional_2_Conditional_21_For_5_Template, 2, 3, "button", 38, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 39)(7, "label");
    \u0275\u0275text(8, "Waffengr\xF6\xDFe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 40)(10, "button", 9);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Conditional_21_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.weaponSize = "LIGHT");
    });
    \u0275\u0275text(11, "Leicht \xD70.8");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 9);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Conditional_21_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.weaponSize = "MEDIUM");
    });
    \u0275\u0275text(13, "Mittel \xD71.0");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "button", 9);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Conditional_21_Template_button_click_14_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.weaponSize = "HEAVY");
    });
    \u0275\u0275text(15, "Schwer \xD71.2");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "div", 41)(17, "label");
    \u0275\u0275text(18, "Waffentyp");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "select", 42);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_2_Conditional_21_Template_select_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.selectedWeaponType, $event) || (ctx_r1.selectedWeaponType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function ForgingComponent_Conditional_2_Conditional_21_Template_select_ngModelChange_19_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onWeaponTypeChange());
    });
    \u0275\u0275elementStart(20, "option", 43);
    \u0275\u0275text(21, "\u2013 Kein Typ \u2013");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(22, ForgingComponent_Conditional_2_Conditional_21_For_23_Template, 3, 1, "optgroup", 44, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r1.statKeys);
    \u0275\u0275advance(6);
    \u0275\u0275classProp("active", ctx_r1.weaponSize === "LIGHT");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r1.weaponSize === "MEDIUM");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r1.weaponSize === "HEAVY");
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.selectedWeaponType);
    \u0275\u0275property("compareWith", ctx_r1.compareByName);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", null);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.weaponCategories);
  }
}
function ForgingComponent_Conditional_2_Conditional_22_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 43);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const at_r9 = ctx.$implicit;
    \u0275\u0275property("ngValue", at_r9);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3("", at_r9.name, " (", at_r9.weight, ", \xD7", at_r9.weight === "LEICHT" ? "0.8" : at_r9.weight === "MITTEL" ? "1.0" : "1.2", ")");
  }
}
function ForgingComponent_Conditional_2_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Rustungstyp");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 45);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_2_Conditional_22_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.selectedArmorType, $event) || (ctx_r1.selectedArmorType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function ForgingComponent_Conditional_2_Conditional_22_Template_select_ngModelChange_3_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onArmorTypeChange());
    });
    \u0275\u0275elementStart(4, "option", 43);
    \u0275\u0275text(5, "\u2013 Kein Typ \u2013");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(6, ForgingComponent_Conditional_2_Conditional_22_For_7_Template, 2, 4, "option", 43, _forTrack1);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.selectedArmorType);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", null);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.armorTypes);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50)(1, "span", 54);
    \u0275\u0275text(2, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 55);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 56);
    \u0275\u0275text(6, " / ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 54);
    \u0275\u0275element(8, "span", 57);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 58);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const preview_r11 = \u0275\u0275readContextLet(1);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(preview_r11.haltbarkeit);
    \u0275\u0275advance(4);
    \u0275\u0275classProp("i-effektivity", ctx_r1.itemType === "weapon")("i-stability", ctx_r1.itemType !== "weapon");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(preview_r11.effektivitaet);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 63)(1, "button", 65);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Conditional_6_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r15);
      const entry_r16 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.unforge(entry_r16));
    });
    \u0275\u0275text(2, "\u2212");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 66);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 67)(6, "div", 68)(7, "span", 69);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 70);
    \u0275\u0275text(10, "\u2192");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 71);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "button", 72);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Conditional_6_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r15);
      const entry_r16 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.forge(entry_r16));
    });
    \u0275\u0275text(14, "Schmieden");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const entry_r16 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    const sc_r17 = ctx_r1.entryScaling(entry_r16);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", entry_r16.forgeCount <= 0);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", entry_r16.forgeCount, "\xD7");
    \u0275\u0275advance(3);
    \u0275\u0275classProp("forg-cost-warn", !ctx_r1.canForge(entry_r16));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r1.nextForgeCostFor(entry_r16), "\u2009SP");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate3("+", sc_r17.halt, "\u2009\u2390 +", sc_r17.eff, "\u2009", ctx_r1.itemType === "weapon" ? "\u2694\uFE0E" : "\u26CA");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.canForge(entry_r16));
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const stackDesc_r18 = \u0275\u0275readContextLet(7);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2726 ", stackDesc_r18);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "div", 60)(2, "span", 61);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 62);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Template_button_click_4_listener() {
      const \u0275$index_172_r13 = \u0275\u0275restoreView(_r12).$index;
      \u0275\u0275nextContext(2);
      const slot_r14 = \u0275\u0275readContextLet(0);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeMaterialEntry(slot_r14, \u0275$index_172_r13));
    });
    \u0275\u0275text(5, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Conditional_6_Template, 15, 9, "div", 63);
    \u0275\u0275declareLet(7);
    \u0275\u0275conditionalCreate(8, ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Conditional_8_Template, 2, 1, "div", 64);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const entry_r16 = ctx.$implicit;
    const slotCfg_r19 = \u0275\u0275nextContext(2).$implicit;
    const slot_r14 = \u0275\u0275readContextLet(0);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(entry_r16.material.name);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(!ctx_r1.isBonusSlot(slotCfg_r19.key) ? 6 : -1);
    \u0275\u0275advance();
    const stackDesc_r20 = \u0275\u0275storeLet(ctx_r1.getStackLevelDesc(entry_r16, slot_r14));
    \u0275\u0275advance();
    \u0275\u0275conditional(stackDesc_r20 ? 8 : -1);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 51);
    \u0275\u0275repeaterCreate(1, ForgingComponent_Conditional_2_For_40_Conditional_10_For_2_Template, 9, 4, "div", 59, _forTrack2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const slot_r14 = \u0275\u0275readContextLet(0);
    \u0275\u0275advance();
    \u0275\u0275repeater(slot_r14.entries);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_11_Conditional_1_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76)(1, "span", 80);
    \u0275\u0275text(2, "\u2296");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 81);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(3);
    const preview_r11 = \u0275\u0275readContextLet(1);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("-", preview_r11.ruestungsmalus);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_11_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 74);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 75)(3, "div", 76)(4, "span", 77);
    \u0275\u0275text(5, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 78);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 76)(9, "span", 79);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 78);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(13, ForgingComponent_Conditional_2_For_40_Conditional_11_Conditional_1_Conditional_13_Template, 5, 1, "div", 76);
    \u0275\u0275elementStart(14, "div", 76)(15, "span", 77);
    \u0275\u0275text(16, "\u2696\uFE0E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "span", 78);
    \u0275\u0275text(18);
    \u0275\u0275pipe(19, "number");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const preview_r11 = \u0275\u0275readContextLet(1);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("col-title-w", ctx_r1.itemType === "weapon")("col-title-a", ctx_r1.itemType !== "weapon");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.itemType === "weapon" ? "Waffenwerte" : "Rustungswerte", " ");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(preview_r11.haltbarkeit);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.itemType === "weapon" ? "\u2694\uFE0E" : "\u26CA");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(preview_r11.effektivitaet);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.itemType === "armor" && preview_r11.ruestungsmalus ? 13 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(19, 10, preview_r11.weight, "1.1-1"), "\u2009kg");
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_11_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 73);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const preview_r11 = \u0275\u0275readContextLet(1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2726 ", preview_r11.extraEffect);
  }
}
function ForgingComponent_Conditional_2_For_40_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 52);
    \u0275\u0275conditionalCreate(1, ForgingComponent_Conditional_2_For_40_Conditional_11_Conditional_1_Template, 20, 13);
    \u0275\u0275conditionalCreate(2, ForgingComponent_Conditional_2_For_40_Conditional_11_Conditional_2_Template, 2, 1, "div", 73);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const slotCfg_r19 = \u0275\u0275nextContext().$implicit;
    const preview_r11 = \u0275\u0275readContextLet(1);
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.isBonusSlot(slotCfg_r19.key) ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(preview_r11.extraEffect ? 2 : -1);
  }
}
function ForgingComponent_Conditional_2_For_40_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275declareLet(0)(1);
    \u0275\u0275elementStart(2, "div", 46)(3, "div", 47)(4, "div")(5, "div", 48);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 49);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(9, ForgingComponent_Conditional_2_For_40_Conditional_9_Template, 11, 6, "div", 50);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, ForgingComponent_Conditional_2_For_40_Conditional_10_Template, 3, 0, "div", 51);
    \u0275\u0275conditionalCreate(11, ForgingComponent_Conditional_2_For_40_Conditional_11_Template, 3, 2, "div", 52);
    \u0275\u0275elementStart(12, "button", 53);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_For_40_Template_button_click_12_listener() {
      const slotCfg_r19 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openPicker(slotCfg_r19.key));
    });
    \u0275\u0275text(13, "+ Material hinzufugen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const slotCfg_r19 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    const slot_r21 = \u0275\u0275storeLet(ctx_r1.getSlotState(slotCfg_r19.key));
    \u0275\u0275advance();
    const preview_r22 = \u0275\u0275storeLet(ctx_r1.getSlotPreview(slotCfg_r19.key));
    \u0275\u0275advance();
    \u0275\u0275classProp("slot-filled", slot_r21.entries.length > 0);
    \u0275\u0275attribute("data-slot", slotCfg_r19.key);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(slotCfg_r19.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(slotCfg_r19.subtitle);
    \u0275\u0275advance();
    \u0275\u0275conditional(slot_r21.entries.length > 0 && preview_r22 && !ctx_r1.isBonusSlot(slotCfg_r19.key) ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(slot_r21.entries.length > 0 ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(slot_r21.entries.length > 0 && preview_r22 ? 11 : -1);
  }
}
function ForgingComponent_Conditional_2_Conditional_48_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 86);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const applied_r24 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Stufe ", applied_r24.level);
  }
}
function ForgingComponent_Conditional_2_Conditional_48_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 92);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Conditional_48_For_2_Conditional_11_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r25);
      const applied_r24 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.addTrait(applied_r24.trait));
    });
    \u0275\u0275text(1, "+");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const applied_r24 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("disabled", ctx_r1.remainingSP < ctx_r1.effectiveTraitCost(applied_r24.trait));
  }
}
function ForgingComponent_Conditional_2_Conditional_48_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 82)(1, "div", 83)(2, "div", 84)(3, "span", 85);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, ForgingComponent_Conditional_2_Conditional_48_For_2_Conditional_5_Template, 2, 1, "span", 86);
    \u0275\u0275elementStart(6, "span", 87);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "span", 88);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 89);
    \u0275\u0275conditionalCreate(11, ForgingComponent_Conditional_2_Conditional_48_For_2_Conditional_11_Template, 2, 1, "button", 90);
    \u0275\u0275elementStart(12, "button", 91);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Conditional_48_For_2_Template_button_click_12_listener() {
      const applied_r24 = \u0275\u0275restoreView(_r23).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.removeTrait(applied_r24.trait));
    });
    \u0275\u0275text(13, "\u2212");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const applied_r24 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(applied_r24.trait.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(applied_r24.level > 1 ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", applied_r24.trait.schmiedepunktKosten * applied_r24.level, " SP");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.formatEffect(applied_r24));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(applied_r24.trait.scalable && applied_r24.level < applied_r24.trait.maxLevel ? 11 : -1);
  }
}
function ForgingComponent_Conditional_2_Conditional_48_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 29);
    \u0275\u0275repeaterCreate(1, ForgingComponent_Conditional_2_Conditional_48_For_2_Template, 14, 5, "div", 82, _forTrack3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.appliedTraits);
  }
}
function ForgingComponent_Conditional_2_Conditional_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 30);
    \u0275\u0275text(1, "Noch keine Merkmale eingraviert.");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_2_Conditional_52_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 94)(1, "span", 97);
    \u0275\u0275text(2, "Rustungsmalus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 103);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("-", ctx_r1.finalRuestungsmalus);
  }
}
function ForgingComponent_Conditional_2_Conditional_52_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 94)(1, "span", 97);
    \u0275\u0275text(2, "Anforderung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 104);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx_r1.statRequirement, " ", ctx_r1.finalStatRequirement);
  }
}
function ForgingComponent_Conditional_2_Conditional_52_Conditional_28_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 105);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const eff_r26 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2726 ", eff_r26);
  }
}
function ForgingComponent_Conditional_2_Conditional_52_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275repeaterCreate(1, ForgingComponent_Conditional_2_Conditional_52_Conditional_28_For_2_Template, 2, 1, "span", 105, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.allExtraEffects);
  }
}
function ForgingComponent_Conditional_2_Conditional_52_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32)(1, "div", 26)(2, "span", 27);
    \u0275\u0275text(3, "\u{1F4CA} Gesamtwerte");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 93)(5, "div", 94)(6, "div", 95)(7, "span", 96);
    \u0275\u0275text(8, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 97);
    \u0275\u0275text(10, "Haltbarkeit");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "span", 98);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 94)(14, "div", 95);
    \u0275\u0275element(15, "span", 99);
    \u0275\u0275elementStart(16, "span", 97);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "span", 100);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(20, ForgingComponent_Conditional_2_Conditional_52_Conditional_20_Template, 5, 1, "div", 94);
    \u0275\u0275conditionalCreate(21, ForgingComponent_Conditional_2_Conditional_52_Conditional_21_Template, 5, 2, "div", 94);
    \u0275\u0275elementStart(22, "div", 94)(23, "span", 97);
    \u0275\u0275text(24, "Gewicht");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "span", 101);
    \u0275\u0275text(26);
    \u0275\u0275pipe(27, "number");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(28, ForgingComponent_Conditional_2_Conditional_52_Conditional_28_Template, 3, 0, "div", 102);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(12);
    \u0275\u0275textInterpolate(ctx_r1.finalHaltbarkeit);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("si-sword", ctx_r1.itemType === "weapon")("si-shield-ic", ctx_r1.itemType !== "weapon");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.itemType === "weapon" ? "Effektivitat" : "Stabilitat");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.finalEffektivitaet);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.itemType === "armor" && ctx_r1.finalRuestungsmalus > 0 ? 20 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.itemType === "weapon" && ctx_r1.finalStatRequirement > 0 ? 21 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(27, 11, ctx_r1.finalWeight, "1.1-1"), " kg");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.allExtraEffects.length > 0 ? 28 : -1);
  }
}
function ForgingComponent_Conditional_2_Conditional_56_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 35);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(!ctx_r1.itemName.trim() ? "Bitte einen Namen eingeben" : "Primarmaterial wird benotigt");
  }
}
function ForgingComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 4)(1, "div", 5)(2, "label");
    \u0275\u0275text(3, "Gegenstandsname");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 6);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_2_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.itemName, $event) || (ctx_r1.itemName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 7)(6, "label");
    \u0275\u0275text(7, "Typ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 8)(9, "button", 9);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.itemType = "weapon";
      return \u0275\u0275resetView(ctx_r1.onItemTypeChange());
    });
    \u0275\u0275text(10, "\u2694 Waffe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 9);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.itemType = "armor";
      return \u0275\u0275resetView(ctx_r1.onItemTypeChange());
    });
    \u0275\u0275text(12, "\u{1F6E1} Rustung");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(13, "div", 10)(14, "label");
    \u0275\u0275text(15, "Modus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 8)(17, "button", 11);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Template_button_click_17_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setAccessMode("enforced"));
    });
    \u0275\u0275text(18, "\u{1F512} Erzwungen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "button", 11);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setAccessMode("free"));
    });
    \u0275\u0275text(20, "\u{1F513} Frei");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(21, ForgingComponent_Conditional_2_Conditional_21_Template, 24, 9)(22, ForgingComponent_Conditional_2_Conditional_22_Template, 8, 2, "div", 12);
    \u0275\u0275elementStart(23, "div", 13)(24, "label");
    \u0275\u0275text(25, "Schmiedepunkte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "div", 14)(27, "input", 15);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_2_Template_input_ngModelChange_27_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.schmiedepunkte, $event) || (ctx_r1.schmiedepunkte = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 16)(29, "span", 17)(30, "strong");
    \u0275\u0275text(31);
    \u0275\u0275elementEnd();
    \u0275\u0275text(32);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "span", 18);
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(35, "div", 19);
    \u0275\u0275element(36, "div", 20);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(37, "div", 21)(38, "div", 22);
    \u0275\u0275repeaterCreate(39, ForgingComponent_Conditional_2_For_40_Template, 14, 10, "div", 23, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "div", 24)(42, "div", 25)(43, "div", 26)(44, "span", 27);
    \u0275\u0275text(45, "\u2699 Schmiedemerkmale");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "span", 28);
    \u0275\u0275text(47);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(48, ForgingComponent_Conditional_2_Conditional_48_Template, 3, 0, "div", 29)(49, ForgingComponent_Conditional_2_Conditional_49_Template, 2, 0, "p", 30);
    \u0275\u0275elementStart(50, "button", 31);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Template_button_click_50_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openTraitPicker());
    });
    \u0275\u0275text(51, "+ Merkmal hinzufugen");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(52, ForgingComponent_Conditional_2_Conditional_52_Template, 29, 14, "div", 32);
    \u0275\u0275elementStart(53, "div", 33)(54, "button", 34);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_2_Template_button_click_54_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.finishForging());
    });
    \u0275\u0275text(55, " \u2692 Schmieden abschliessen & zum Inventar ");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(56, ForgingComponent_Conditional_2_Conditional_56_Template, 2, 1, "span", 35);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.itemName);
    \u0275\u0275advance(5);
    \u0275\u0275classProp("active", ctx_r1.itemType === "weapon");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r1.itemType === "armor");
    \u0275\u0275advance(6);
    \u0275\u0275classProp("active", ctx_r1.accessMode === "enforced");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r1.accessMode === "free");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.itemType === "weapon" ? 21 : 22);
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.schmiedepunkte);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.spentSP);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" / ", ctx_r1.schmiedepunkte, " SP");
    \u0275\u0275advance();
    \u0275\u0275classProp("warning", ctx_r1.remainingSP < 10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r1.remainingSP, " verbl.");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r1.spProgress, "%");
    \u0275\u0275classProp("full", ctx_r1.spProgress >= 100);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r1.slots);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate1("", ctx_r1.appliedTraits.length, " aktiv");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.appliedTraits.length > 0 ? 48 : 49);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r1.primarySlot.entries.length > 0 || ctx_r1.secondarySlot.entries.length > 0 ? 52 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", !ctx_r1.canFinish());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(!ctx_r1.canFinish() ? 56 : -1);
  }
}
function ForgingComponent_Conditional_3_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 117);
    \u0275\u0275text(1, "Keine passenden Materialien in der Bibliothek.");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 125);
    \u0275\u0275text(1, "Waffe");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 126);
    \u0275\u0275text(1, "Rustung");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 127);
    \u0275\u0275text(1, "Selten");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 128);
    \u0275\u0275text(1, "Legend\xE4r");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 129);
    \u0275\u0275text(1, "Stapelbar");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_13_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 73);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r29 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(mat_r29.weaponStats.extraEffect);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 131)(1, "div", 133);
    \u0275\u0275text(2, "Waffenwerte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 75)(4, "div", 76)(5, "span", 77);
    \u0275\u0275text(6, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 78);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 134);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 76)(12, "span", 79);
    \u0275\u0275text(13, "\u2694\uFE0E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "span", 78);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 134);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "div", 76)(19, "span", 77);
    \u0275\u0275text(20, "\u2696\uFE0E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "span", 78);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(23, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_13_Conditional_23_Template, 2, 1, "div", 73);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(mat_r29.weaponStats.haltbarkeit);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("+", mat_r29.weaponStats.haltbarkeitSkalierung);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(mat_r29.weaponStats.effektivitaet);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("+", mat_r29.weaponStats.effektivitaetSkalierung);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", mat_r29.weaponStats.weight, "\u2009kg");
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.weaponStats.extraEffect ? 23 : -1);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_14_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76)(1, "span", 80);
    \u0275\u0275text(2, "\u2296");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 81);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const mat_r29 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(mat_r29.armorStats.ruestungsmalus);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_14_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 73);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r29 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(mat_r29.armorStats.extraEffect);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 131)(1, "div", 135);
    \u0275\u0275text(2, "Rustungswerte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 75)(4, "div", 76)(5, "span", 77);
    \u0275\u0275text(6, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 78);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 134);
    \u0275\u0275text(10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "div", 76)(12, "span", 79);
    \u0275\u0275text(13, "\u26CA");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "span", 78);
    \u0275\u0275text(15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 134);
    \u0275\u0275text(17);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "div", 76)(19, "span", 77);
    \u0275\u0275text(20, "\u2696\uFE0E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "span", 78);
    \u0275\u0275text(22);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(23, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_14_Conditional_23_Template, 5, 1, "div", 76);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(24, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_14_Conditional_24_Template, 2, 1, "div", 73);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(mat_r29.armorStats.haltbarkeit);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("+", mat_r29.armorStats.haltbarkeitSkalierung);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(mat_r29.armorStats.effektivitaet);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("+", mat_r29.armorStats.effektivitaetSkalierung);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", mat_r29.armorStats.weight, "\u2009kg");
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.armorStats.ruestungsmalus ? 23 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.armorStats.extraEffect ? 24 : -1);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 132);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(mat_r29.description);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 120);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_3_Conditional_16_For_2_Template_div_click_0_listener() {
      const mat_r29 = \u0275\u0275restoreView(_r28).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.selectMaterial(mat_r29));
    });
    \u0275\u0275elementStart(1, "div", 121)(2, "span", 122);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 123);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 124);
    \u0275\u0275conditionalCreate(7, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_7_Template, 2, 0, "span", 125);
    \u0275\u0275conditionalCreate(8, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_8_Template, 2, 0, "span", 126);
    \u0275\u0275conditionalCreate(9, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_9_Template, 2, 0, "span", 127);
    \u0275\u0275conditionalCreate(10, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_10_Template, 2, 0, "span", 128);
    \u0275\u0275conditionalCreate(11, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_11_Template, 2, 0, "span", 129);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 130);
    \u0275\u0275conditionalCreate(13, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_13_Template, 24, 6, "div", 131);
    \u0275\u0275conditionalCreate(14, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_14_Template, 25, 7, "div", 131);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(15, ForgingComponent_Conditional_3_Conditional_16_For_2_Conditional_15_Template, 2, 1, "p", 132);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r29 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("card-weapon", mat_r29.canBeWeaponMaterial && !mat_r29.canBeArmorMaterial)("card-armor", mat_r29.canBeArmorMaterial && !mat_r29.canBeWeaponMaterial)("card-both", mat_r29.canBeWeaponMaterial && mat_r29.canBeArmorMaterial)("rarity-rare", mat_r29.rarity === "RARE")("rarity-legendary", mat_r29.rarity === "LEGENDARY");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(mat_r29.name);
    \u0275\u0275advance();
    \u0275\u0275classProp("badge-public", mat_r29.isPublic);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", mat_r29.isPublic ? "Allgemein" : "Spezial", " ");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(mat_r29.canBeWeaponMaterial ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.canBeArmorMaterial ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.rarity === "RARE" ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.rarity === "LEGENDARY" ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.stackable ? 11 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(mat_r29.canBeWeaponMaterial && mat_r29.weaponStats && ctx_r1.itemType === "weapon" ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.canBeArmorMaterial && mat_r29.armorStats && ctx_r1.itemType === "armor" ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r29.description ? 15 : -1);
  }
}
function ForgingComponent_Conditional_3_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 118);
    \u0275\u0275repeaterCreate(1, ForgingComponent_Conditional_3_Conditional_16_For_2_Template, 16, 22, "div", 119, _forTrack4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredMaterials);
  }
}
function ForgingComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 106);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_3_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closePicker());
    });
    \u0275\u0275elementStart(1, "div", 107);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_3_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r27);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 108)(3, "div", 109)(4, "span", 110);
    \u0275\u0275text(5, "Material w\xE4hlen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 111);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 112);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_3_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closePicker());
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 113)(11, "div", 114)(12, "span", 115);
    \u0275\u0275text(13, "\u{1F50D}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 116);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_3_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r27);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.materialFilter, $event) || (ctx_r1.materialFilter = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(15, ForgingComponent_Conditional_3_Conditional_15_Template, 2, 0, "div", 117)(16, ForgingComponent_Conditional_3_Conditional_16_Template, 3, 0, "div", 118);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate2("", ctx_r1.accessMode === "enforced" ? "Nur Ressourcen" : "Alles bekannte Wissen", " \xB7 ", ctx_r1.pickingSlotLabel);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.materialFilter);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.filteredMaterials.length === 0 ? 15 : 16);
  }
}
function ForgingComponent_Conditional_4_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 117);
    \u0275\u0275text(1, "Keine Schmiedemerkmale in der Bibliothek.");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 147);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trait_r31 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("(", trait_r31.schmiedepunktKosten, ")");
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 150);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trait_r31 = \u0275\u0275nextContext().$implicit;
    const appliedLevel_r32 = \u0275\u0275readContextLet(0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", appliedLevel_r32, "/", trait_r31.maxLevel);
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span");
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 151);
    \u0275\u0275text(1, "Max");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 152);
    \u0275\u0275text(1, "Zu wenig SP");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 154);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_15_Template_button_click_0_listener($event) {
      \u0275\u0275restoreView(_r33);
      const trait_r31 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      $event.stopPropagation();
      return \u0275\u0275resetView(ctx_r1.addTrait(trait_r31));
    });
    \u0275\u0275text(1, "+ Hinzuf\xFCgen");
    \u0275\u0275elementEnd();
  }
}
function ForgingComponent_Conditional_4_Conditional_23_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275declareLet(0);
    \u0275\u0275elementStart(1, "div", 143)(2, "div", 144)(3, "span", 145);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 146);
    \u0275\u0275text(6);
    \u0275\u0275conditionalCreate(7, ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_7_Template, 2, 1, "span", 147);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "p", 148);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 149);
    \u0275\u0275conditionalCreate(11, ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_11_Template, 2, 2, "span", 150)(12, ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_12_Template, 1, 0, "span");
    \u0275\u0275conditionalCreate(13, ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_13_Template, 2, 0, "span", 151)(14, ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_14_Template, 2, 0, "span", 152)(15, ForgingComponent_Conditional_4_Conditional_23_For_2_Conditional_15_Template, 2, 0, "button", 153);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const trait_r31 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    const appliedLevel_r34 = \u0275\u0275storeLet(ctx_r1.getAppliedLevel(trait_r31));
    \u0275\u0275advance();
    \u0275\u0275classProp("tc-maxed", appliedLevel_r34 >= trait_r31.maxLevel);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(trait_r31.name);
    \u0275\u0275advance();
    \u0275\u0275classProp("unaffordable", !ctx_r1.canAddTrait(trait_r31));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.effectiveTraitCost(trait_r31), "\u2009SP ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.traitDiscount > 0 ? 7 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(trait_r31.effect);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(trait_r31.scalable ? 11 : 12);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(appliedLevel_r34 >= trait_r31.maxLevel ? 13 : ctx_r1.remainingSP < ctx_r1.effectiveTraitCost(trait_r31) ? 14 : 15);
  }
}
function ForgingComponent_Conditional_4_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 141);
    \u0275\u0275repeaterCreate(1, ForgingComponent_Conditional_4_Conditional_23_For_2_Template, 16, 11, "div", 142, _forTrack4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredForgeTraits);
  }
}
function ForgingComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r30 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 106);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_4_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeTraitPicker());
    });
    \u0275\u0275elementStart(1, "div", 107);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_4_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r30);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 108)(3, "div", 109)(4, "span", 110);
    \u0275\u0275text(5, "\u2699 Schmiedemerkmale");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 111);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 112);
    \u0275\u0275listener("click", function ForgingComponent_Conditional_4_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeTraitPicker());
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 113)(11, "div", 114)(12, "span", 115);
    \u0275\u0275text(13, "\u{1F50D}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 136);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_4_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.traitFilter, $event) || (ctx_r1.traitFilter = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 137)(16, "label");
    \u0275\u0275text(17, "Fertigkeit-Rabatt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 138)(19, "input", 139);
    \u0275\u0275twoWayListener("ngModelChange", function ForgingComponent_Conditional_4_Template_input_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.traitDiscount, $event) || (ctx_r1.traitDiscount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "span", 140);
    \u0275\u0275text(21, "%");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275conditionalCreate(22, ForgingComponent_Conditional_4_Conditional_22_Template, 2, 0, "div", 117)(23, ForgingComponent_Conditional_4_Conditional_23_Template, 3, 0, "div", 141);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1("", ctx_r1.remainingSP, " SP verbleibend");
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.traitFilter);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.traitDiscount);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r1.filteredForgeTraits.length === 0 ? 22 : 23);
  }
}
var ForgingComponent = class _ForgingComponent {
  sheet = null;
  /** GM/NPC forging: every material available and no resource consumption (all unlocked). */
  unlockAll = false;
  patch = new EventEmitter();
  closeOverlay = new EventEmitter();
  api = inject(AssetBrowserApiService);
  cdr = inject(ChangeDetectorRef);
  // ── Loading state ────────────────────────────────────────────────────────────
  isLoading = signal(true, ...ngDevMode ? [{ debugName: "isLoading" }] : []);
  // ── Library data ─────────────────────────────────────────────────────────────
  allMaterials = [];
  allForgeTraits = [];
  // ── Session configuration ────────────────────────────────────────────────────
  itemType = "weapon";
  itemName = "";
  schmiedepunkte = 100;
  /** Chosen stat requirement for the item (weapon only — label for min stat). */
  statRequirement = "STR";
  statKeys = WEAPON_STAT_KEYS;
  /** Weapon size class — multiplies all stats by 0.8 / 1.0 / 1.2. */
  weaponSize = "MEDIUM";
  WEIGHT_MULT = { LIGHT: 0.8, MEDIUM: 1, HEAVY: 1.2 };
  /** Session-level SP discount for traits (0–100 %). Applied during forging only. */
  traitDiscount = 0;
  /** Enforced = only owned resources; Free = all known materials. */
  accessMode = "enforced";
  /** Selected weapon type — cosmetic, stored in produced ItemBlock. */
  selectedWeaponType = null;
  weaponTypes = WEAPON_TYPES;
  weaponCategories = ["LEICHT", "FERNKAMPF", "SCHWER"];
  weaponCategoryLabels = WEAPON_CATEGORY_LABELS;
  /** Selected armor type — cosmetic, determines armor weight multiplier. */
  selectedArmorType = null;
  armorTypes = ARMOR_TYPES;
  // ── Slots ────────────────────────────────────────────────────────────────────
  primarySlot = { entries: [] };
  secondarySlot = { entries: [] };
  bonusSlot = { entries: [] };
  slots = [
    { key: "primary", label: "Prim\xE4r", subtitle: "Alle Werte + Extraeffekt" },
    { key: "secondary", label: "Sekund\xE4r", subtitle: "Halbe Werte + Extraeffekt" },
    { key: "bonus", label: "Zusatz", subtitle: "Nur Extraeffekt" }
  ];
  // ── Traits ───────────────────────────────────────────────────────────────────
  appliedTraits = [];
  // ── UI state: material picker ────────────────────────────────────────────────
  pickingSlot = null;
  materialFilter = "";
  // ── UI state: trait picker ───────────────────────────────────────────────────
  showTraitPicker = false;
  traitFilter = "";
  // ── Available materials filtered by knowledge (+ resources in enforced mode) ─
  get availableMaterials() {
    const knownIds = new Set(this.sheet?.knownMaterialIds ?? []);
    const isWeapon = this.itemType === "weapon";
    let list = this.allMaterials.filter((m) => {
      const compatible = isWeapon ? m.canBeWeaponMaterial : m.canBeArmorMaterial;
      if (!compatible)
        return false;
      return this.unlockAll || m.isPublic || knownIds.has(m.id);
    });
    if (this.accessMode === "enforced" && !this.unlockAll) {
      const owned = new Set((this.sheet?.resources ?? []).filter((r) => r?.itemType === "raw-material" && r.libraryAssetId && (r.amount ?? 1) > 0).map((r) => r.libraryAssetId));
      list = list.filter((m) => owned.has(m.id));
    }
    return list;
  }
  get filteredMaterials() {
    const q = this.materialFilter.toLowerCase();
    const filtered = this.availableMaterials.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q))
        return false;
      return true;
    });
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  get pickingSlotLabel() {
    const labels = { primary: "Prim\xE4rslot", secondary: "Sekund\xE4rslot", bonus: "Zusatzslot" };
    return this.pickingSlot ? labels[this.pickingSlot] : "";
  }
  openTraitPicker() {
    this.showTraitPicker = true;
    this.traitFilter = "";
    this.cdr.markForCheck();
  }
  closeTraitPicker() {
    this.showTraitPicker = false;
    this.cdr.markForCheck();
  }
  get filteredForgeTraits() {
    const q = this.traitFilter.toLowerCase();
    const filtered = this.allForgeTraits.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q))
        return false;
      const applies = t.appliesTo || "all";
      if (applies === "all")
        return true;
      return applies === this.itemType;
    });
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  // ── SP calculations ──────────────────────────────────────────────────────────
  get spentSP() {
    let sp = 0;
    for (const slot of [this.primarySlot, this.secondarySlot, this.bonusSlot]) {
      for (const entry of slot.entries) {
        sp += totalForgeSPSpent(entry.forgeCount);
      }
    }
    sp += this.appliedTraits.reduce((acc, t) => acc + this.effectiveTraitCost(t.trait) * t.level, 0);
    return sp;
  }
  get remainingSP() {
    return this.schmiedepunkte - this.spentSP;
  }
  get spProgress() {
    if (this.schmiedepunkte <= 0)
      return 0;
    return Math.min(100, Math.round(this.spentSP / this.schmiedepunkte * 100));
  }
  // ── Slot stat aggregation ────────────────────────────────────────────────────
  /** Effective SP cost of a trait after applying the session traitDiscount. */
  effectiveTraitCost(trait) {
    return Math.max(1, Math.round(trait.schmiedepunktKosten * (1 - this.traitDiscount / 100)));
  }
  /** Weapon/armor size multiplier based on selected type. */
  get weightMultiplier() {
    if (this.itemType === "weapon") {
      return this.WEIGHT_MULT[this.weaponSize];
    } else {
      if (this.selectedArmorType) {
        return ARMOR_WEIGHT_MULT[this.selectedArmorType.weight];
      }
      return 1;
    }
  }
  /** Aggregate ForgedStatPreview for all entries in a slot. */
  aggregateSlot(slot) {
    if (slot.entries.length === 0)
      return null;
    const stackCounts = /* @__PURE__ */ new Map();
    for (const entry of slot.entries) {
      stackCounts.set(entry.material.id, (stackCounts.get(entry.material.id) ?? 0) + 1);
    }
    let h = 0, e = 0, w = 0, mal = 0, req = 0;
    const effectParts = [];
    const seenMats = /* @__PURE__ */ new Set();
    for (const entry of slot.entries) {
      const preview = computeForgedStats(entry.material, entry.forgeCount, this.itemType === "weapon");
      if (!preview)
        continue;
      h += preview.haltbarkeit;
      e += preview.effektivitaet;
      w += preview.weight;
      mal += preview.ruestungsmalus ?? 0;
      req += preview.statRequirement;
      if (!seenMats.has(entry.material.id)) {
        seenMats.add(entry.material.id);
        const mat = entry.material;
        const count = stackCounts.get(mat.id) ?? 1;
        if (mat.stackable && mat.stackLevels && mat.stackLevels.length > 0) {
          const levelIdx = Math.min(count - 1, mat.stackLevels.length - 1);
          if (mat.stackLevels[levelIdx])
            effectParts.push(mat.stackLevels[levelIdx]);
        } else if (preview.extraEffect) {
          effectParts.push(preview.extraEffect);
        }
      }
    }
    return { haltbarkeit: h, effektivitaet: e, weight: w, ruestungsmalus: mal || void 0, extraEffect: effectParts.join(", "), statRequirement: req };
  }
  get primaryPreview() {
    return this.aggregateSlot(this.primarySlot);
  }
  get secondaryPreview() {
    const raw = this.aggregateSlot(this.secondarySlot);
    if (!raw)
      return null;
    return __spreadProps(__spreadValues({}, raw), {
      haltbarkeit: Math.floor(raw.haltbarkeit / 2),
      effektivitaet: Math.floor(raw.effektivitaet / 2),
      weight: raw.weight / 2,
      ruestungsmalus: raw.ruestungsmalus != null ? Math.floor(raw.ruestungsmalus / 2) : void 0,
      statRequirement: Math.floor(raw.statRequirement / 2)
      // Halve stat requirement too
    });
  }
  get bonusPreview() {
    return this.aggregateSlot(this.bonusSlot);
  }
  get finalHaltbarkeit() {
    return Math.round(((this.primaryPreview?.haltbarkeit ?? 0) + (this.secondaryPreview?.haltbarkeit ?? 0)) * this.weightMultiplier);
  }
  get finalEffektivitaet() {
    return Math.round(((this.primaryPreview?.effektivitaet ?? 0) + (this.secondaryPreview?.effektivitaet ?? 0)) * this.weightMultiplier);
  }
  /** Weight from Primär + Sekundär only — Zusatz contributes no weight. */
  get finalWeight() {
    return Math.round(((this.primaryPreview?.weight ?? 0) + (this.secondaryPreview?.weight ?? 0)) * this.weightMultiplier * 10) / 10;
  }
  /** Malus from Primär + Sekundär, scaled by armor type; fractional part truncated. */
  get finalRuestungsmalus() {
    const raw = (this.primaryPreview?.ruestungsmalus ?? 0) + (this.secondaryPreview?.ruestungsmalus ?? 0);
    return Math.trunc(raw * this.weightMultiplier);
  }
  /** Summed stat requirement from primary + secondary slots, multiplied by weight multiplier. */
  get finalStatRequirement() {
    const priReq = this.primaryPreview?.statRequirement ?? 0;
    const secReq = this.secondaryPreview?.statRequirement ?? 0;
    return Math.round((priReq + secReq) * this.weightMultiplier);
  }
  get allExtraEffects() {
    const seen = /* @__PURE__ */ new Set();
    for (const preview of [this.primaryPreview, this.secondaryPreview, this.bonusPreview]) {
      if (!preview?.extraEffect)
        continue;
      for (const part of preview.extraEffect.split(",").map((s) => s.trim()).filter(Boolean)) {
        seen.add(part);
      }
    }
    return Array.from(seen);
  }
  getWeaponTypesForCategory(cat) {
    return this.weaponTypes.filter((w) => w.category === cat);
  }
  compareByName(a, b) {
    if (!a && !b)
      return true;
    if (!a || !b)
      return false;
    return a.name === b.name;
  }
  onWeaponTypeChange() {
    if (this.selectedWeaponType) {
      this.weaponSize = this.selectedWeaponType.defaultForgeSize;
    }
    this.cdr.markForCheck();
  }
  onArmorTypeChange() {
    this.cdr.markForCheck();
  }
  // ── Lifecycle ────────────────────────────────────────────────────────────────
  async ngOnInit() {
    if (this.unlockAll)
      this.accessMode = "free";
    await this.loadLibraryData();
  }
  async loadLibraryData() {
    this.isLoading.set(true);
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const materialFiles = [];
      const traitFiles = [];
      for (const lib of libraries) {
        const [mats, traits] = await Promise.all([
          firstValueFrom(this.api.searchFiles(lib.id, "", ["material"])),
          firstValueFrom(this.api.searchFiles(lib.id, "", ["forge-trait"]))
        ]);
        materialFiles.push(...mats);
        traitFiles.push(...traits);
      }
      this.allMaterials = materialFiles.map((f) => f.data);
      this.allForgeTraits = traitFiles.map((f) => f.data);
    } catch (e) {
      console.error("Schmiede: Fehler beim Laden der Bibliothek", e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
  // ── Slot helpers ─────────────────────────────────────────────────────────────
  getSlotState(key) {
    if (key === "primary")
      return this.primarySlot;
    if (key === "secondary")
      return this.secondarySlot;
    return this.bonusSlot;
  }
  getSlotPreview(key) {
    if (key === "primary")
      return this.primaryPreview;
    if (key === "secondary")
      return this.secondaryPreview;
    return this.bonusPreview;
  }
  isBonusSlot(key) {
    return key === "bonus";
  }
  // ── Material picker ───────────────────────────────────────────────────────────
  openPicker(slot) {
    this.pickingSlot = slot;
    this.materialFilter = "";
    this.cdr.markForCheck();
  }
  closePicker() {
    this.pickingSlot = null;
  }
  selectMaterial(mat) {
    if (!this.pickingSlot)
      return;
    const slot = this.getSlotState(this.pickingSlot);
    if (!mat.stackable && slot.entries.some((e) => e.material.id === mat.id)) {
      this.pickingSlot = null;
      this.cdr.markForCheck();
      return;
    }
    let resourceItemId;
    if (this.accessMode === "enforced") {
      const res = (this.sheet?.resources ?? []).find((r) => r?.itemType === "raw-material" && r.libraryAssetId === mat.id && (r.amount ?? 1) > 0);
      if (!res) {
        this.pickingSlot = null;
        this.cdr.markForCheck();
        return;
      }
      resourceItemId = res.id;
    }
    slot.entries.push({ material: mat, forgeCount: 0, resourceItemId });
    this.pickingSlot = null;
    this.cdr.markForCheck();
  }
  setAccessMode(mode) {
    this.accessMode = mode;
    this.cdr.markForCheck();
  }
  /** How many times a given material ID appears in a slot's entries. */
  getStackCount(matId, slot) {
    return slot.entries.filter((e) => e.material.id === matId).length;
  }
  /** Returns the stack-level description for an entry's material in a slot, or null if not applicable. */
  getStackLevelDesc(entry, slot) {
    const mat = entry.material;
    if (!mat.stackable || !mat.stackLevels || mat.stackLevels.length === 0)
      return null;
    const count = this.getStackCount(mat.id, slot);
    if (count <= 0)
      return null;
    const levelIdx = Math.min(count - 1, mat.stackLevels.length - 1);
    return mat.stackLevels[levelIdx] || null;
  }
  removeMaterialEntry(slot, idx) {
    slot.entries.splice(idx, 1);
    this.cdr.markForCheck();
  }
  // ── Forging ───────────────────────────────────────────────────────────────────
  nextForgeCostFor(entry) {
    return nextForgeCost(entry.forgeCount);
  }
  canForge(entry) {
    return this.remainingSP >= nextForgeCost(entry.forgeCount);
  }
  /** Returns the per-forge stat gain for a single entry based on current itemType. */
  entryScaling(entry) {
    const stats = this.itemType === "weapon" ? entry.material.weaponStats : entry.material.armorStats;
    return {
      halt: stats?.haltbarkeitSkalierung ?? 0,
      eff: stats?.effektivitaetSkalierung ?? 0
    };
  }
  forge(entry) {
    if (!this.canForge(entry))
      return;
    entry.forgeCount++;
    this.cdr.markForCheck();
  }
  unforge(entry) {
    if (entry.forgeCount <= 0)
      return;
    entry.forgeCount--;
    this.cdr.markForCheck();
  }
  // ── Trait management ─────────────────────────────────────────────────────────
  getAppliedLevel(trait) {
    return this.appliedTraits.find((t) => t.trait.id === trait.id)?.level ?? 0;
  }
  canAddTrait(trait) {
    const current = this.getAppliedLevel(trait);
    if (current >= trait.maxLevel)
      return false;
    return this.remainingSP >= this.effectiveTraitCost(trait);
  }
  addTrait(trait) {
    if (!this.canAddTrait(trait))
      return;
    const existing = this.appliedTraits.find((t) => t.trait.id === trait.id);
    if (existing)
      existing.level++;
    else
      this.appliedTraits.push({ trait, level: 1 });
    this.cdr.markForCheck();
  }
  removeTrait(trait) {
    const idx = this.appliedTraits.findIndex((t) => t.trait.id === trait.id);
    if (idx === -1)
      return;
    if (this.appliedTraits[idx].level <= 1)
      this.appliedTraits.splice(idx, 1);
    else
      this.appliedTraits[idx].level--;
    this.cdr.markForCheck();
  }
  formatEffect(applied) {
    return formatTraitEffect(applied.trait, applied.level);
  }
  // ── Item type change ─────────────────────────────────────────────────────────
  onItemTypeChange() {
    for (const slot of [this.primarySlot, this.secondarySlot, this.bonusSlot]) {
      slot.entries = slot.entries.filter((e) => {
        return this.itemType === "weapon" ? e.material.canBeWeaponMaterial : e.material.canBeArmorMaterial;
      });
    }
    this.cdr.markForCheck();
  }
  // ── Finish forging ────────────────────────────────────────────────────────────
  canFinish() {
    return !!this.itemName.trim() && this.primarySlot.entries.length > 0;
  }
  finishForging() {
    if (!this.canFinish())
      return;
    const isWeapon = this.itemType === "weapon";
    const item = new ItemBlock();
    item.id = `forged_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    item.name = this.itemName.trim();
    item.itemType = isWeapon ? "weapon" : "armor";
    item.description = this.buildDescription();
    item.primaryEffect = this.allExtraEffects.join(" | ") || void 0;
    item.lost = false;
    item.broken = false;
    item.isIdentified = true;
    item.requirements = {};
    item.weight = Math.round(this.finalWeight * 10) / 10;
    item.hasDurability = true;
    item.durability = this.finalHaltbarkeit;
    item.maxDurability = this.finalHaltbarkeit;
    if (isWeapon) {
      item.armorType = "weapon";
      item.efficiency = this.finalEffektivitaet;
      if (this.finalStatRequirement > 0) {
        const reqKey = WEAPON_STAT_TO_REQUIREMENT[this.statRequirement];
        item.requirements = { [reqKey]: this.finalStatRequirement };
      }
      if (this.selectedWeaponType) {
        item.weaponTypeName = this.selectedWeaponType.name;
        item.damageType = this.selectedWeaponType.damageType;
        item.range = this.selectedWeaponType.range;
      }
    } else {
      item.stability = this.finalEffektivitaet;
      item.armorDebuff = this.finalRuestungsmalus || void 0;
      if (this.selectedArmorType) {
        item.armorType = this.selectedArmorType.itemBlockType;
      }
    }
    if (this.appliedTraits.length > 0) {
      item.secondaryEffect = this.appliedTraits.map((t) => this.formatEffect(t)).join("\n");
    }
    const toRecords = (slot) => slot.entries.map((e) => ({ name: e.material.name, forgeCount: e.forgeCount }));
    const forgingData = {
      createdAt: Date.now(),
      itemType: this.itemType,
      primaryMaterials: toRecords(this.primarySlot),
      secondaryMaterials: toRecords(this.secondarySlot),
      bonusMaterials: toRecords(this.bonusSlot),
      appliedTraits: this.appliedTraits.map((t) => ({ name: t.trait.name, level: t.level })),
      totalSP: this.schmiedepunkte,
      spentSP: this.spentSP
    };
    item["forgingData"] = forgingData;
    this.patch.emit({ path: "/inventory/-", value: item });
    if (this.accessMode === "enforced" && !this.unlockAll) {
      this.consumeRawMaterials();
    }
    this.resetSession();
    this.closeOverlay.emit();
  }
  consumeRawMaterials() {
    const resources = [...this.sheet?.resources ?? []];
    const consumeOne = (entry) => {
      let idx = entry.resourceItemId ? resources.findIndex((r2) => r2?.id === entry.resourceItemId) : -1;
      if (idx < 0) {
        idx = resources.findIndex((r2) => r2?.itemType === "raw-material" && r2.libraryAssetId === entry.material.id && (r2.amount ?? 1) > 0);
      }
      if (idx < 0)
        return;
      const r = resources[idx];
      const amt = r.amount ?? 1;
      if (amt <= 1)
        resources.splice(idx, 1);
      else
        resources[idx] = __spreadProps(__spreadValues({}, r), { amount: amt - 1 });
    };
    for (const slot of [this.primarySlot, this.secondarySlot, this.bonusSlot]) {
      for (const entry of slot.entries)
        consumeOne(entry);
    }
    this.patch.emit({ path: "/resources", value: resources });
  }
  buildDescription() {
    const lines = [];
    if (this.itemType === "weapon") {
      const sizeLabel = { LIGHT: "Leicht", MEDIUM: "Mittel", HEAVY: "Schwer" }[this.weaponSize];
      if (this.selectedWeaponType) {
        lines.push(`Typ: ${this.selectedWeaponType.name}  \xB7  ${this.selectedWeaponType.damageType}  \xB7  ${this.selectedWeaponType.range}`);
      }
      lines.push(`Gr\xF6\xDFe: ${sizeLabel} (\xD7${this.WEIGHT_MULT[this.weaponSize]})`);
    } else {
      if (this.selectedArmorType) {
        const weightLabel = { LEICHT: "Leicht", MITTEL: "Mittel", SCHWER: "Schwer" }[this.selectedArmorType.weight];
        lines.push(`Typ: ${this.selectedArmorType.name}  \xB7  ${weightLabel} (\xD7${ARMOR_WEIGHT_MULT[this.selectedArmorType.weight]})`);
      }
    }
    const addSlot = (label, slot) => {
      if (slot.entries.length === 0)
        return;
      const parts = slot.entries.map((e) => `${e.material.name}${e.forgeCount > 0 ? ` (+${e.forgeCount}\xD7)` : ""}`);
      lines.push(`${label}: ${parts.join(", ")}`);
    };
    addSlot("Prim\xE4r", this.primarySlot);
    addSlot("Sekund\xE4r", this.secondarySlot);
    addSlot("Zusatz", this.bonusSlot);
    if (this.appliedTraits.length > 0) {
      lines.push("");
      lines.push("Schmiedemerkmale:");
      this.appliedTraits.forEach((t) => {
        lines.push(`  \u2022 ${t.trait.name}${t.level > 1 ? ` (Stufe ${t.level})` : ""}`);
      });
    }
    return lines.join("\n");
  }
  resetSession() {
    this.itemName = "";
    this.primarySlot = { entries: [] };
    this.secondarySlot = { entries: [] };
    this.bonusSlot = { entries: [] };
    this.appliedTraits = [];
    this.pickingSlot = null;
    this.showTraitPicker = false;
    this.selectedWeaponType = null;
    this.selectedArmorType = null;
    this.cdr.markForCheck();
  }
  static \u0275fac = function ForgingComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ForgingComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ForgingComponent, selectors: [["app-forging"]], inputs: { sheet: "sheet", unlockAll: "unlockAll" }, outputs: { patch: "patch", closeOverlay: "closeOverlay" }, decls: 5, vars: 3, consts: [[1, "forging-root"], [1, "forge-loading"], [1, "picker-backdrop"], [1, "spinner"], [1, "forge-config-bar"], [1, "config-field", "name-field"], ["type", "text", "placeholder", "z.B. Eisenschwert des Nordens", 3, "ngModelChange", "ngModel"], [1, "config-field", "type-field"], [1, "type-toggle"], [3, "click"], [1, "config-field", "mode-field"], ["type", "button", 3, "click"], [1, "config-field", "armor-type-field"], [1, "config-field", "sp-combined-field"], [1, "sp-control-row"], ["type", "number", "min", "0", 1, "sp-max-input", 3, "ngModelChange", "ngModel"], [1, "sp-status"], [1, "sp-used-val"], [1, "sp-remaining"], [1, "sp-track"], [1, "sp-fill"], [1, "forge-main"], [1, "forge-slots-col"], [1, "forge-slot", 3, "slot-filled"], [1, "forge-right-col"], [1, "forge-section"], [1, "section-header"], [1, "section-title"], [1, "section-hint"], [1, "applied-traits"], [1, "no-traits"], [1, "open-trait-btn", 3, "click"], [1, "forge-section", "stats-section"], [1, "forge-finish"], [1, "finish-btn", 3, "click", "disabled"], [1, "finish-hint"], [1, "config-field", "stat-req-field"], [1, "stat-req-toggle"], [3, "active"], [1, "config-field", "weapon-size-field"], [1, "weapon-size-toggle"], [1, "config-field", "weapon-type-field"], [1, "weapon-type-select", 3, "ngModelChange", "ngModel", "compareWith"], [3, "ngValue"], [3, "label"], [1, "armor-type-select", 3, "ngModelChange", "ngModel"], [1, "forge-slot"], [1, "slot-head"], [1, "slot-label"], [1, "slot-subtitle"], [1, "slot-mini-stats"], [1, "slot-entries"], [1, "slot-preview-stats"], [1, "add-mat-btn", 3, "click"], [1, "sms-icon"], [1, "mini-val", "halt"], [1, "mini-sep"], [1, "app-icon"], [1, "mini-val", "effk"], [1, "slot-entry"], [1, "entry-row"], [1, "entry-name"], ["title", "Entfernen", 1, "entry-remove", 3, "click"], [1, "entry-forge-row"], [1, "entry-stack-desc"], [1, "forg-btn", "forg-minus", 3, "click", "disabled"], [1, "forg-num"], [1, "forg-action-group"], [1, "forg-gain-block"], [1, "forg-cost"], [1, "forg-arrow"], [1, "forg-gain"], [1, "forg-btn", "forg-plus", 3, "click", "disabled"], [1, "stat-extra"], [1, "stat-col-title"], [1, "stat-rows"], [1, "sr"], [1, "sr-icon"], [1, "sr-val"], [1, "sr-icon", "sr-icon-eff"], [1, "sr-icon", "sr-malus"], [1, "sr-val", "sr-malus-val"], [1, "applied-trait"], [1, "at-info"], [1, "at-top-row"], [1, "at-name"], [1, "at-level"], [1, "at-cost"], [1, "at-effect"], [1, "at-actions"], [1, "at-btn", "at-plus", 3, "disabled"], [1, "at-btn", "at-minus", 3, "click"], [1, "at-btn", "at-plus", 3, "click", "disabled"], [1, "final-stats-grid"], [1, "fst-block"], [1, "fst-label-row"], [1, "si-inline", "durability-c", "fst-ico"], [1, "fst-label"], [1, "fst-value", "halt"], [1, "stat-icon", "fst-si"], [1, "fst-value", "effk"], [1, "fst-value", "weight"], [1, "final-effects"], [1, "fst-value", "malus"], [1, "fst-value", "stat-req"], [1, "effect-pill"], [1, "picker-backdrop", 3, "click"], [1, "picker-modal", 3, "click"], [1, "picker-modal-header"], [1, "picker-title-block"], [1, "picker-title"], [1, "picker-subtitle"], [1, "picker-close-btn", 3, "click"], [1, "picker-filters-bar"], [1, "picker-search-wrap"], [1, "picker-search-icon"], ["type", "text", "placeholder", "Material suchen...", 1, "picker-search", 3, "ngModelChange", "ngModel"], [1, "picker-empty"], [1, "picker-grid"], [1, "mat-card", "picker-selectable", 3, "card-weapon", "card-armor", "card-both", "rarity-rare", "rarity-legendary"], [1, "mat-card", "picker-selectable", 3, "click"], [1, "mat-header"], [1, "mat-name"], [1, "mat-badge"], [1, "mat-chips"], [1, "chip", "chip-w"], [1, "chip", "chip-a"], [1, "chip", "chip-rare"], [1, "chip", "chip-legendary"], [1, "chip", "chip-stackable"], [1, "mat-stats"], [1, "stat-col"], [1, "mat-desc"], [1, "stat-col-title", "col-title-w"], [1, "sr-scl"], [1, "stat-col-title", "col-title-a"], ["type", "text", "placeholder", "Merkmal suchen...", 1, "picker-search", 3, "ngModelChange", "ngModel"], [1, "picker-discount-field"], [1, "picker-discount-wrap"], ["type", "number", "min", "0", "max", "100", 1, "picker-discount-input", 3, "ngModelChange", "ngModel"], [1, "picker-discount-pct"], [1, "picker-grid", "trait-picker-grid"], [1, "picker-trait-card", 3, "tc-maxed"], [1, "picker-trait-card"], [1, "ptc-header"], [1, "ptc-name"], [1, "ptc-cost"], [1, "ptc-orig-cost"], [1, "ptc-effect"], [1, "ptc-footer"], [1, "ptc-levels"], [1, "ptc-tag", "maxed"], [1, "ptc-tag", "cant"], [1, "ptc-add-btn"], [1, "ptc-add-btn", 3, "click"]], template: function ForgingComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275conditionalCreate(1, ForgingComponent_Conditional_1_Template, 4, 0, "div", 1)(2, ForgingComponent_Conditional_2_Template, 57, 25);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(3, ForgingComponent_Conditional_3_Template, 17, 4, "div", 2);
      \u0275\u0275conditionalCreate(4, ForgingComponent_Conditional_4_Template, 24, 4, "div", 2);
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.isLoading() ? 1 : 2);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.pickingSlot ? 3 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showTraitPicker ? 4 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel, DecimalPipe], styles: [`

[_nghost-%COMP%] {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
}
.forging-root[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.forge-loading[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  color: var(--text-muted, #9ca3af);
  font-size: 1rem;
}
.spinner[_ngcontent-%COMP%] {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border, #4a5568);
  border-top-color: var(--accent, #8b5cf6);
  border-radius: 50%;
  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;
}
@keyframes _ngcontent-%COMP%_spin {
  to {
    transform: rotate(360deg);
  }
}
.forge-config-bar[_ngcontent-%COMP%] {
  display: flex;
  align-items: flex-end;
  gap: 0.9rem;
  padding: 0.75rem 1.25rem;
  background: var(--card, #2d3748);
  border-bottom: 1px solid var(--border, #4a5568);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.config-field[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.config-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.name-field[_ngcontent-%COMP%] {
  flex: 2;
  min-width: 180px;
}
.type-field[_ngcontent-%COMP%] {
  flex-shrink: 0;
}
.sp-combined-field[_ngcontent-%COMP%] {
  flex: 3;
  min-width: 260px;
}
.weapon-type-field[_ngcontent-%COMP%] {
  flex: 1;
  min-width: 200px;
}
.armor-type-field[_ngcontent-%COMP%] {
  flex: 1;
  min-width: 200px;
}
.stat-req-field[_ngcontent-%COMP%] {
  flex-shrink: 0;
}
.weapon-size-field[_ngcontent-%COMP%] {
  flex-shrink: 0;
}
.weapon-type-select[_ngcontent-%COMP%], 
.armor-type-select[_ngcontent-%COMP%] {
  width: 100%;
}
.config-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], 
.config-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {
  padding: 0.45rem 0.75rem;
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-radius: 6px;
  color: var(--text, #e5e7eb);
  font-size: 0.9rem;
  transition: border-color 0.15s;
}
.config-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, 
.config-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {
  outline: none;
  border-color: var(--accent, #8b5cf6);
}
.type-toggle[_ngcontent-%COMP%] {
  display: flex;
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  overflow: hidden;
}
.type-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {
  padding: 0.45rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.type-toggle[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {
  background: var(--accent, #8b5cf6);
  color: white;
  font-weight: 700;
}
.type-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:not(.active):hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text, #e5e7eb);
}
input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, 
input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number][_ngcontent-%COMP%] {
  -moz-appearance: textfield;
  appearance: textfield;
}
.sp-control-row[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.3rem;
}
.sp-max-input[_ngcontent-%COMP%] {
  width: 70px !important;
  flex-shrink: 0;
}
.sp-status[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--text-muted, #9ca3af);
}
.sp-status[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {
  color: var(--text, #e5e7eb);
}
.sp-remaining[_ngcontent-%COMP%] {
  font-size: 0.78rem;
  color: var(--text-muted, #9ca3af);
}
.sp-remaining.warning[_ngcontent-%COMP%] {
  color: #f59e0b;
  font-weight: 700;
}
.sp-track[_ngcontent-%COMP%] {
  height: 6px;
  background: var(--bg, #1e293b);
  border-radius: 4px;
  overflow: hidden;
}
.sp-fill[_ngcontent-%COMP%] {
  height: 100%;
  background: var(--accent, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}
.sp-fill.full[_ngcontent-%COMP%] {
  background: #ef4444;
}
.forge-main[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}
.forge-slots-col[_ngcontent-%COMP%] {
  flex: 0 0 52%;
  border-right: 1px solid var(--border, #4a5568);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem;
}
.forge-slots-col[_ngcontent-%COMP%]::-webkit-scrollbar {
  width: 5px;
}
.forge-slots-col[_ngcontent-%COMP%]::-webkit-scrollbar-track {
  background: transparent;
}
.forge-slots-col[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {
  background: var(--border, #4a5568);
  border-radius: 3px;
}
.forge-slot[_ngcontent-%COMP%] {
  background: var(--card, #2d3748);
  border: 1.5px dashed var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transition: border-color 0.2s;
}
.forge-slot.slot-filled[_ngcontent-%COMP%] {
  border-style: solid;
}
.forge-slot[data-slot=primary].slot-filled[_ngcontent-%COMP%] {
  border-color: #8b5cf6;
}
.forge-slot[data-slot=secondary].slot-filled[_ngcontent-%COMP%] {
  border-color: #60a5fa;
}
.forge-slot[data-slot=bonus].slot-filled[_ngcontent-%COMP%] {
  border-color: #34d399;
}
.slot-head[_ngcontent-%COMP%] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.slot-label[_ngcontent-%COMP%] {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent, #8b5cf6);
}
.forge-slot[data-slot=secondary][_ngcontent-%COMP%]   .slot-label[_ngcontent-%COMP%] {
  color: #60a5fa;
}
.forge-slot[data-slot=bonus][_ngcontent-%COMP%]   .slot-label[_ngcontent-%COMP%] {
  color: #34d399;
}
.slot-subtitle[_ngcontent-%COMP%] {
  font-size: 0.68rem;
  color: var(--text-muted, #9ca3af);
  margin-top: 0.1rem;
}
.slot-mini-stats[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
}
.mini-val[_ngcontent-%COMP%] {
  font-size: 0.9rem;
  font-weight: 800;
}
.mini-val.halt[_ngcontent-%COMP%] {
  color: #34d399;
}
.mini-val.effk[_ngcontent-%COMP%] {
  color: #fb923c;
}
.mini-sep[_ngcontent-%COMP%] {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}
.slot-entries[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.slot-entry[_ngcontent-%COMP%] {
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-left: 3px solid var(--border, #4a5568);
  border-radius: 7px;
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.forge-slot[data-slot=primary][_ngcontent-%COMP%]   .slot-entry[_ngcontent-%COMP%] {
  border-left-color: #8b5cf6;
}
.forge-slot[data-slot=secondary][_ngcontent-%COMP%]   .slot-entry[_ngcontent-%COMP%] {
  border-left-color: #60a5fa;
}
.forge-slot[data-slot=bonus][_ngcontent-%COMP%]   .slot-entry[_ngcontent-%COMP%] {
  border-left-color: #34d399;
}
.entry-row[_ngcontent-%COMP%] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.entry-name[_ngcontent-%COMP%] {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
}
.entry-remove[_ngcontent-%COMP%] {
  background: none;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.28rem;
  border-radius: 3px;
  transition: all 0.15s;
  line-height: 1;
}
.entry-remove[_ngcontent-%COMP%]:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.sms-icon[_ngcontent-%COMP%] {
  font-size: 0.82rem;
  line-height: 1;
  font-variant-emoji: text;
  color: #94a3b8;
}
.entry-forge-row[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.forg-btn[_ngcontent-%COMP%] {
  border-radius: 5px;
  border: 1px solid var(--border, #4a5568);
  background: var(--card, #2d3748);
  color: var(--text, #e5e7eb);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.forg-btn[_ngcontent-%COMP%]:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.forg-minus[_ngcontent-%COMP%] {
  width: 26px;
  height: 26px;
  font-size: 1.1rem;
  padding: 0;
}
.forg-plus[_ngcontent-%COMP%] {
  padding: 0 0.75rem;
  height: 30px;
  font-size: 0.82rem;
  font-weight: 800;
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #8b5cf6);
  flex-shrink: 0;
}
.forg-plus[_ngcontent-%COMP%]:not(:disabled):hover {
  background: rgba(139, 92, 246, 0.15);
}
.forg-num[_ngcontent-%COMP%] {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
  min-width: 26px;
  text-align: center;
  flex-shrink: 0;
}
.forg-gain-block[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 0.25rem 0.55rem;
  min-width: 0;
  overflow: hidden;
}
.forg-cost[_ngcontent-%COMP%] {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--accent, #8b5cf6);
  white-space: nowrap;
  flex-shrink: 0;
}
.forg-cost.forg-cost-warn[_ngcontent-%COMP%] {
  color: #f59e0b;
}
.forg-arrow[_ngcontent-%COMP%] {
  font-size: 0.72rem;
  color: #6b7280;
  flex-shrink: 0;
}
.forg-gain[_ngcontent-%COMP%] {
  font-size: 0.8rem;
  font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
  font-variant-emoji: text;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.forg-next[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {
  color: var(--accent, #8b5cf6);
}
.slot-preview-row[_ngcontent-%COMP%] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.7rem;
  background: rgba(0, 0, 0, 0.18);
  border-radius: 6px;
  padding: 0.4rem 0.65rem;
}
.slot-preview-stats[_ngcontent-%COMP%] {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 7px;
  padding: 0.5rem 0.65rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.prev-pair[_ngcontent-%COMP%] {
  display: flex;
  align-items: baseline;
  gap: 0.28rem;
}
.prev-lbl[_ngcontent-%COMP%] {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted, #9ca3af);
  letter-spacing: 0.04em;
}
.prev-val[_ngcontent-%COMP%] {
  font-size: 1rem;
  font-weight: 800;
}
.prev-val.halt[_ngcontent-%COMP%] {
  color: #34d399;
}
.prev-val.effk[_ngcontent-%COMP%] {
  color: #fb923c;
}
.prev-val.weight[_ngcontent-%COMP%] {
  color: #9ca3af;
}
.prev-val.malus[_ngcontent-%COMP%] {
  color: #f87171;
}
.prev-effect[_ngcontent-%COMP%] {
  font-size: 0.78rem;
  color: var(--accent, #8b5cf6);
  font-style: italic;
  width: 100%;
}
.add-mat-btn[_ngcontent-%COMP%] {
  padding: 0.55rem;
  background: var(--bg, #1e293b);
  border: 1.5px dashed var(--border, #4a5568);
  border-radius: 7px;
  color: var(--text-muted, #9ca3af);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.add-mat-btn[_ngcontent-%COMP%]:hover {
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.05);
}
.forge-right-col[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0.9rem;
  gap: 0.7rem;
  min-width: 0;
}
.forge-right-col[_ngcontent-%COMP%]::-webkit-scrollbar {
  width: 5px;
}
.forge-right-col[_ngcontent-%COMP%]::-webkit-scrollbar-track {
  background: transparent;
}
.forge-right-col[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {
  background: var(--border, #4a5568);
  border-radius: 3px;
}
.forge-section[_ngcontent-%COMP%] {
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.section-header[_ngcontent-%COMP%] {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title[_ngcontent-%COMP%] {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
}
.section-hint[_ngcontent-%COMP%] {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}
.applied-traits[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.applied-trait[_ngcontent-%COMP%] {
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  padding: 0.55rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.at-info[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}
.at-top-row[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.at-name[_ngcontent-%COMP%] {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
}
.at-level[_ngcontent-%COMP%] {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.12);
  border-radius: 6px;
  padding: 0.1rem 0.4rem;
}
.at-cost[_ngcontent-%COMP%] {
  font-size: 0.72rem;
  font-weight: 700;
  color: #fb923c;
}
.at-effect[_ngcontent-%COMP%] {
  font-size: 0.78rem;
  color: var(--text-muted, #9ca3af);
}
.at-actions[_ngcontent-%COMP%] {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}
.at-btn[_ngcontent-%COMP%] {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--border, #4a5568);
  background: var(--card, #2d3748);
  color: var(--text, #e5e7eb);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}
.at-plus[_ngcontent-%COMP%]:not(:disabled) {
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #8b5cf6);
}
.at-btn[_ngcontent-%COMP%]:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.no-traits[_ngcontent-%COMP%] {
  font-size: 0.82rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
}
.open-trait-btn[_ngcontent-%COMP%] {
  align-self: flex-start;
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid var(--accent, #8b5cf6);
  border-radius: 6px;
  color: var(--accent, #8b5cf6);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.open-trait-btn[_ngcontent-%COMP%]:hover {
  background: rgba(139, 92, 246, 0.12);
}
.stats-section[_ngcontent-%COMP%] {
}
.final-stats-grid[_ngcontent-%COMP%] {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.fst-block[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.fst-label[_ngcontent-%COMP%] {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted, #9ca3af);
}
.fst-value[_ngcontent-%COMP%] {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}
.fst-value.halt[_ngcontent-%COMP%] {
  color: #34d399;
  text-shadow: 0 0 20px rgba(52, 211, 153, 0.3);
}
.fst-value.effk[_ngcontent-%COMP%] {
  color: #fb923c;
  text-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
}
.fst-value.weight[_ngcontent-%COMP%] {
  color: #9ca3af;
}
.fst-value.malus[_ngcontent-%COMP%] {
  color: #f87171;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.3);
}
.fst-value.stat-req[_ngcontent-%COMP%] {
  color: #a78bfa;
  text-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
  font-size: 1.5rem;
}
.stat-req-field[_ngcontent-%COMP%] {
  min-width: 280px;
}
.stat-req-toggle[_ngcontent-%COMP%] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.stat-req-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {
  padding: 0.3rem 0.65rem;
  background: transparent;
  border: 1px solid var(--border, #4a5568);
  border-radius: 5px;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  transition: all 0.15s;
}
.stat-req-toggle[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {
  background: #a78bfa;
  border-color: #a78bfa;
  color: #1e1e2e;
}
.stat-req-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:not(.active):hover {
  background: rgba(167, 139, 250, 0.12);
  color: var(--text, #e5e7eb);
}
.final-effects[_ngcontent-%COMP%] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.2rem;
}
.effect-pill[_ngcontent-%COMP%] {
  padding: 0.22rem 0.65rem;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--accent, #8b5cf6);
}
.forge-finish[_ngcontent-%COMP%] {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.25rem;
}
.finish-btn[_ngcontent-%COMP%] {
  padding: 0.85rem;
  background:
    linear-gradient(
      135deg,
      #7c3aed 0%,
      #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.2s;
}
.finish-btn[_ngcontent-%COMP%]:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}
.finish-btn[_ngcontent-%COMP%]:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.finish-hint[_ngcontent-%COMP%] {
  font-size: 0.76rem;
  color: var(--text-muted, #9ca3af);
  text-align: center;
}
.picker-backdrop[_ngcontent-%COMP%] {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  z-index: 50;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  padding: 1.25rem;
}
.picker-modal[_ngcontent-%COMP%] {
  background: var(--bg, #1e293b);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1060px;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.6);
  border-radius: 12px;
}
.picker-modal-header[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border, #4a5568);
  flex-shrink: 0;
  background: var(--card, #2d3748);
}
.picker-title-block[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.picker-title[_ngcontent-%COMP%] {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
}
.picker-subtitle[_ngcontent-%COMP%] {
  font-size: 0.78rem;
  color: var(--text-muted, #9ca3af);
}
.picker-close-btn[_ngcontent-%COMP%] {
  background: none;
  border: none;
  color: var(--text-muted, #9ca3af);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  transition: all 0.15s;
}
.picker-close-btn[_ngcontent-%COMP%]:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text, #e5e7eb);
}
.picker-filters-bar[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border, #4a5568);
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.12);
}
.picker-search-wrap[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  transition: border-color 0.15s;
}
.picker-search-wrap[_ngcontent-%COMP%]:focus-within {
  border-color: var(--accent, #8b5cf6);
}
.picker-search-icon[_ngcontent-%COMP%] {
  font-size: 0.9rem;
  opacity: 0.6;
}
.picker-search[_ngcontent-%COMP%] {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text, #e5e7eb);
  font-size: 0.9rem;
}
.picker-search[_ngcontent-%COMP%]:focus {
  outline: none;
}
.picker-type-tabs[_ngcontent-%COMP%] {
  display: flex;
  gap: 0.35rem;
}
.picker-type-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {
  padding: 0.4rem 0.9rem;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 6px;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.picker-type-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {
  background: var(--accent, #8b5cf6);
  border-color: var(--accent, #8b5cf6);
  color: white;
}
.picker-type-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:not(.active):hover {
  border-color: var(--accent, #8b5cf6);
  color: var(--text, #e5e7eb);
}
.picker-empty[_ngcontent-%COMP%] {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted, #9ca3af);
  font-size: 0.9rem;
  font-style: italic;
}
.picker-grid[_ngcontent-%COMP%] {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-auto-rows: min-content;
  gap: 0.85rem;
  padding: 1.25rem;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  align-content: start;
  align-items: stretch;
}
.picker-grid[_ngcontent-%COMP%]::-webkit-scrollbar {
  width: 6px;
}
.picker-grid[_ngcontent-%COMP%]::-webkit-scrollbar-track {
  background: transparent;
}
.picker-grid[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {
  background: var(--border, #4a5568);
  border-radius: 3px;
}
.picker-mat-card[_ngcontent-%COMP%] {
  background: var(--card, #2d3748);
  border: 1.5px solid var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.85rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: all 0.18s;
}
.picker-mat-card[_ngcontent-%COMP%]:hover {
  border-color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.07);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.pmc-header[_ngcontent-%COMP%] {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.pmc-name[_ngcontent-%COMP%] {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
  line-height: 1.2;
}
.pmc-public-badge[_ngcontent-%COMP%] {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: 8px;
  color: #34d399;
  flex-shrink: 0;
  white-space: nowrap;
}
.pmc-desc[_ngcontent-%COMP%] {
  font-size: 0.76rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
  line-height: 1.35;
}
.pmc-types[_ngcontent-%COMP%] {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.pmc-type[_ngcontent-%COMP%] {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pmc-type.weapon[_ngcontent-%COMP%] {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}
.pmc-type.armor[_ngcontent-%COMP%] {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}
.pmc-stats[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.45rem 0.6rem;
  border-radius: 7px;
  margin-top: 0.1rem;
}
.pmc-stats.weapon-stats[_ngcontent-%COMP%] {
  background: rgba(251, 146, 60, 0.06);
  border: 1px solid rgba(251, 146, 60, 0.18);
}
.pmc-stats.armor-stats[_ngcontent-%COMP%] {
  background: rgba(96, 165, 250, 0.06);
  border: 1px solid rgba(96, 165, 250, 0.18);
}
.pmc-stats-title[_ngcontent-%COMP%] {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.1rem;
}
.pmc-stat-row[_ngcontent-%COMP%] {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.pmc-sn[_ngcontent-%COMP%] {
  font-size: 0.7rem;
  color: var(--text-muted, #9ca3af);
  font-weight: 600;
  min-width: 34px;
}
.pmc-sv[_ngcontent-%COMP%] {
  font-size: 1.05rem;
  font-weight: 800;
}
.pmc-sv.halt[_ngcontent-%COMP%] {
  color: #34d399;
}
.pmc-sv.effk[_ngcontent-%COMP%] {
  color: #fb923c;
}
.pmc-sv.weight[_ngcontent-%COMP%] {
  color: #9ca3af;
}
.pmc-sv.malus[_ngcontent-%COMP%] {
  color: #f87171;
}
.pmc-scale[_ngcontent-%COMP%] {
  font-size: 0.68rem;
  color: var(--text-muted, #9ca3af);
}
.pmc-extra[_ngcontent-%COMP%] {
  font-size: 0.72rem;
  color: var(--accent, #8b5cf6);
  font-style: italic;
  margin-top: 0.1rem;
}
.si-inline[_ngcontent-%COMP%] {
  font-style: normal;
  font-size: 0.85rem;
  line-height: 1;
  font-family: sans-serif;
  font-variant-emoji: text;
}
.pmc-ico[_ngcontent-%COMP%] {
  font-size: 0.78rem;
}
.prev-ico[_ngcontent-%COMP%] {
  font-size: 0.72rem;
}
.fst-ico[_ngcontent-%COMP%] {
  font-size: 1rem;
}
.durability-c[_ngcontent-%COMP%] {
  color: #34d399;
}
.effk-c[_ngcontent-%COMP%] {
  color: #60a5fa;
}
.stab-color[_ngcontent-%COMP%] {
  background-color: #60a5fa !important;
}
.weight-c[_ngcontent-%COMP%] {
  color: #94a3b8;
}
.scale-c[_ngcontent-%COMP%] {
  color: #4ade80;
}
.malus-c[_ngcontent-%COMP%] {
  color: #f87171;
}
.trait-picker-grid[_ngcontent-%COMP%] {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.picker-trait-card[_ngcontent-%COMP%] {
  background: var(--card, #2d3748);
  border: 1.5px solid var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.9rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all 0.18s;
}
.picker-trait-card[_ngcontent-%COMP%]:not(.tc-maxed):hover {
  border-color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.07);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.picker-trait-card.tc-maxed[_ngcontent-%COMP%] {
  opacity: 0.5;
  cursor: default;
}
.ptc-header[_ngcontent-%COMP%] {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.ptc-name[_ngcontent-%COMP%] {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
}
.ptc-cost[_ngcontent-%COMP%] {
  font-size: 0.9rem;
  font-weight: 800;
  color: #fb923c;
  white-space: nowrap;
}
.ptc-cost.unaffordable[_ngcontent-%COMP%] {
  color: #f87171;
}
.ptc-effect[_ngcontent-%COMP%] {
  font-size: 0.82rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
  line-height: 1.45;
  flex: 1;
}
.ptc-footer[_ngcontent-%COMP%] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}
.ptc-levels[_ngcontent-%COMP%] {
  font-size: 0.72rem;
  color: var(--text-muted, #9ca3af);
}
.ptc-tag[_ngcontent-%COMP%] {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.12rem 0.5rem;
  border-radius: 6px;
}
.ptc-tag.maxed[_ngcontent-%COMP%] {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}
.ptc-tag.cant[_ngcontent-%COMP%] {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
}
.ptc-add-btn[_ngcontent-%COMP%] {
  padding: 0.3rem 0.75rem;
  background: var(--accent, #8b5cf6);
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.ptc-add-btn[_ngcontent-%COMP%]:hover {
  filter: brightness(1.15);
}
.stat-icon[_ngcontent-%COMP%] {
  display: inline-block;
  width: 13px;
  height: 13px;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  vertical-align: middle;
  flex-shrink: 0;
}
.si-sword[_ngcontent-%COMP%] {
  background-color: #60a5fa;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3Cline x1='19' y1='21' x2='21' y2='19'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3Cline x1='19' y1='21' x2='21' y2='19'/%3E%3C/svg%3E");
}
.si-shield-ic[_ngcontent-%COMP%] {
  background-color: #60a5fa;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E");
}
.si-gem[_ngcontent-%COMP%] {
  background-color: #34d399;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3h12l4 6-10 13L2 9z'/%3E%3Cline x1='2' y1='9' x2='22' y2='9'/%3E%3Cpath d='M12 3l-4 6 4 13 4-13z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3h12l4 6-10 13L2 9z'/%3E%3Cline x1='2' y1='9' x2='22' y2='9'/%3E%3Cpath d='M12 3l-4 6 4 13 4-13z'/%3E%3C/svg%3E");
}
.mini-si[_ngcontent-%COMP%] {
  width: 11px;
  height: 11px;
}
.prev-si[_ngcontent-%COMP%] {
  width: 11px;
  height: 11px;
}
.fst-si[_ngcontent-%COMP%] {
  width: 14px;
  height: 14px;
}
.pmc-si[_ngcontent-%COMP%] {
  width: 10px;
  height: 10px;
}
.fst-label-row[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.pmc-stats-title[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.pmc-stats.weapon-stats[_ngcontent-%COMP%]   .pmc-stats-title[_ngcontent-%COMP%] {
  color: #fb923c;
}
.pmc-stats.armor-stats[_ngcontent-%COMP%]   .pmc-stats-title[_ngcontent-%COMP%] {
  color: #60a5fa;
}
.pmc-badge-special[_ngcontent-%COMP%] {
  background: rgba(139, 92, 246, 0.12) !important;
  border-color: rgba(139, 92, 246, 0.3) !important;
  color: var(--accent, #8b5cf6) !important;
}
.prev-pair[_ngcontent-%COMP%] {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}
.mat-card[_ngcontent-%COMP%] {
  position: relative;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-left: 3px solid var(--border, #4a5568);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: auto;
  min-height: 0;
  overflow: hidden;
  transition: box-shadow 0.18s, border-color 0.18s;
}
.mat-card.card-weapon[_ngcontent-%COMP%] {
  border-left-color: #f97316;
}
.mat-card.card-armor[_ngcontent-%COMP%] {
  border-left-color: #60a5fa;
}
.mat-card.card-both[_ngcontent-%COMP%] {
  border-left-color: var(--accent, #8b5cf6);
}
.picker-selectable[_ngcontent-%COMP%] {
  cursor: pointer;
  align-self: stretch;
}
.picker-selectable[_ngcontent-%COMP%]:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  border-color: var(--accent, #8b5cf6);
}
.mat-header[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem 0.4rem;
}
.mat-name[_ngcontent-%COMP%] {
  font-size: 0.97rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
  line-height: 1.2;
}
.mat-badge[_ngcontent-%COMP%] {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 9px;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.22);
  color: var(--accent, #8b5cf6);
}
.mat-badge.badge-public[_ngcontent-%COMP%] {
  background: rgba(52, 211, 153, 0.1);
  border-color: rgba(52, 211, 153, 0.25);
  color: #34d399;
}
.mat-chips[_ngcontent-%COMP%] {
  display: flex;
  gap: 0.3rem;
  padding: 0 0.8rem 0.6rem;
}
.chip[_ngcontent-%COMP%] {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.chip-w[_ngcontent-%COMP%] {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}
.chip-a[_ngcontent-%COMP%] {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
}
.mat-stats[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--border, #4a5568);
}
.mat-stats.stats-split[_ngcontent-%COMP%] {
  flex-direction: row;
}
.mat-stats.stats-split[_ngcontent-%COMP%]   .stat-col[_ngcontent-%COMP%]:first-child {
  border-right: 1px solid var(--border, #4a5568);
}
.stat-col[_ngcontent-%COMP%] {
  flex: 1;
  padding: 0.5rem 0.75rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.stat-col-title[_ngcontent-%COMP%] {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.15rem;
}
.col-title-w[_ngcontent-%COMP%] {
  color: #f97316;
}
.col-title-a[_ngcontent-%COMP%] {
  color: #60a5fa;
}
.stat-rows[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 6px;
  padding: 0.35rem 0.45rem;
}
.sr[_ngcontent-%COMP%] {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 0.3rem;
}
.sr-icon[_ngcontent-%COMP%] {
  font-size: 0.78rem;
  line-height: 1;
  color: #6b7280;
  font-variant-emoji: text;
  text-align: center;
}
.sr-val[_ngcontent-%COMP%] {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1;
}
.sr-scl[_ngcontent-%COMP%] {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: right;
  white-space: nowrap;
}
.sr-malus[_ngcontent-%COMP%] {
  color: #f87171;
}
.sr-malus-val[_ngcontent-%COMP%] {
  color: #f87171;
}
.stat-extra[_ngcontent-%COMP%] {
  margin-top: 0.3rem;
  font-size: 0.76rem;
  color: var(--accent, #8b5cf6);
  font-style: italic;
  line-height: 1.35;
}
.mat-desc[_ngcontent-%COMP%] {
  margin: 0;
  padding: 0.5rem 0.8rem 0.65rem;
  font-size: 0.77rem;
  color: #94a3b8;
  line-height: 1.45;
  border-top: 1px solid rgba(74, 85, 104, 0.5);
  font-style: italic;
}
.weapon-size-field[_ngcontent-%COMP%] {
  flex-shrink: 0;
}
.weapon-size-toggle[_ngcontent-%COMP%] {
  display: flex;
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  overflow: hidden;
}
.weapon-size-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {
  padding: 0.45rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.weapon-size-toggle[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {
  background: #fb923c;
  color: white;
  font-weight: 700;
}
.weapon-size-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:not(.active):hover {
  background: rgba(251, 146, 60, 0.1);
  color: var(--text, #e5e7eb);
}
.weapon-type-field[_ngcontent-%COMP%] {
  flex-shrink: 0;
  min-width: 200px;
}
.weapon-type-select[_ngcontent-%COMP%] {
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  color: var(--text, #e5e7eb);
  font-size: 0.82rem;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
  width: 100%;
}
.weapon-type-select[_ngcontent-%COMP%]:focus {
  outline: none;
  border-color: var(--accent, #8b5cf6);
}
.forg-action-group[_ngcontent-%COMP%] {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-width: 0;
}
.forg-action-group[_ngcontent-%COMP%]   .forg-gain-block[_ngcontent-%COMP%] {
  flex: 1;
  border-radius: 6px 0 0 6px;
}
.forg-action-group[_ngcontent-%COMP%]   .forg-btn.forg-plus[_ngcontent-%COMP%] {
  border-radius: 0 5px 5px 0;
  border-left: none;
  height: auto;
  align-self: stretch;
}
.entry-stack-desc[_ngcontent-%COMP%] {
  font-size: 0.76rem;
  color: #a5b4fc;
  font-style: italic;
  padding: 0.1rem 0.2rem;
  margin-top: 0.05rem;
  line-height: 1.3;
}
.mat-card.rarity-rare[_ngcontent-%COMP%] {
  border-color: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.18);
}
.mat-card.rarity-legendary[_ngcontent-%COMP%] {
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.22);
}
.chip-rare[_ngcontent-%COMP%] {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}
.chip-legendary[_ngcontent-%COMP%] {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.chip-stackable[_ngcontent-%COMP%] {
  background: rgba(167, 139, 250, 0.12);
  color: #c4b5fd;
}
.sr-icon.sr-icon-eff[_ngcontent-%COMP%] {
  background: #1e1b4b;
  border: 1px solid #6366f1;
  border-radius: 3px;
  color: #a5b4fc;
  font-size: 0.7rem;
  padding: 0.05rem 0.15rem;
  line-height: 1.2;
}
.sr[_ngcontent-%COMP%] {
  grid-template-columns: auto 1fr auto;
}
.picker-discount-field[_ngcontent-%COMP%] {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex-shrink: 0;
}
.picker-discount-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.picker-discount-wrap[_ngcontent-%COMP%] {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  padding: 0.3rem 0.6rem;
}
.picker-discount-input[_ngcontent-%COMP%] {
  width: 52px;
  background: transparent;
  border: none;
  color: #34d399;
  font-size: 0.9rem;
  font-weight: 800;
  text-align: center;
}
.picker-discount-input[_ngcontent-%COMP%]:focus {
  outline: none;
}
.picker-discount-pct[_ngcontent-%COMP%] {
  font-size: 0.78rem;
  color: #34d399;
  font-weight: 700;
}
.ptc-orig-cost[_ngcontent-%COMP%] {
  font-size: 0.7rem;
  color: var(--text-muted, #9ca3af);
  font-weight: 600;
  text-decoration: line-through;
  margin-left: 0.2rem;
}
/*# sourceMappingURL=forging.component.css.map */`], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ForgingComponent, [{
    type: Component,
    args: [{ selector: "app-forging", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="forging-root">
  @if (isLoading()) {
    <div class="forge-loading">
      <span class="spinner"></span>
      <span>Bibliothek wird geladen...</span>
    </div>
  } @else {

    <!-- Config bar -->
    <div class="forge-config-bar">
      <div class="config-field name-field">
        <label>Gegenstandsname</label>
        <input type="text" [(ngModel)]="itemName" placeholder="z.B. Eisenschwert des Nordens" />
      </div>
      <div class="config-field type-field">
        <label>Typ</label>
        <div class="type-toggle">
          <button [class.active]="itemType === 'weapon'" (click)="itemType='weapon'; onItemTypeChange()">&#x2694; Waffe</button>
          <button [class.active]="itemType === 'armor'" (click)="itemType='armor'; onItemTypeChange()">&#x1F6E1; Rustung</button>
        </div>
      </div>
      <div class="config-field mode-field">
        <label>Modus</label>
        <div class="type-toggle">
          <button type="button" [class.active]="accessMode === 'enforced'" (click)="setAccessMode('enforced')">&#x1F512; Erzwungen</button>
          <button type="button" [class.active]="accessMode === 'free'" (click)="setAccessMode('free')">&#x1F513; Frei</button>
        </div>
      </div>
      @if (itemType === 'weapon') {
        <div class="config-field stat-req-field">
          <label>Stat-Anforderung</label>
          <div class="stat-req-toggle">
            @for (s of statKeys; track s) {
              <button [class.active]="statRequirement === s" (click)="statRequirement = s">{{ s }}</button>
            }
          </div>
        </div>
        <div class="config-field weapon-size-field">
          <label>Waffengr&#xF6;&#xDF;e</label>
          <div class="weapon-size-toggle">
            <button [class.active]="weaponSize === 'LIGHT'" (click)="weaponSize = 'LIGHT'">Leicht &#xD7;0.8</button>
            <button [class.active]="weaponSize === 'MEDIUM'" (click)="weaponSize = 'MEDIUM'">Mittel &#xD7;1.0</button>
            <button [class.active]="weaponSize === 'HEAVY'" (click)="weaponSize = 'HEAVY'">Schwer &#xD7;1.2</button>
          </div>
        </div>
        <div class="config-field weapon-type-field">
          <label>Waffentyp</label>
          <select class="weapon-type-select" [(ngModel)]="selectedWeaponType" (ngModelChange)="onWeaponTypeChange()" [compareWith]="compareByName">
            <option [ngValue]="null">\u2013 Kein Typ \u2013</option>
            @for (cat of weaponCategories; track cat) {
              <optgroup [label]="weaponCategoryLabels[cat]">
                @for (wt of getWeaponTypesForCategory(cat); track wt.name) {
                  <option [ngValue]="wt">{{ wt.name }} ({{ wt.damageType }}, {{ wt.range }})</option>
                }
              </optgroup>
            }
          </select>
        </div>
      } @else {
        <div class="config-field armor-type-field">
          <label>Rustungstyp</label>
          <select class="armor-type-select" [(ngModel)]="selectedArmorType" (ngModelChange)="onArmorTypeChange()">
            <option [ngValue]="null">\u2013 Kein Typ \u2013</option>
            @for (at of armorTypes; track at.name) {
              <option [ngValue]="at">{{ at.name }} ({{ at.weight }}, &#xD7;{{ at.weight === 'LEICHT' ? '0.8' : at.weight === 'MITTEL' ? '1.0' : '1.2' }})</option>
            }
          </select>
        </div>
      }
      <div class="config-field sp-combined-field">
        <label>Schmiedepunkte</label>
        <div class="sp-control-row">
          <input type="number" class="sp-max-input" [(ngModel)]="schmiedepunkte" min="0" />
          <div class="sp-status">
            <span class="sp-used-val"><strong>{{ spentSP }}</strong> / {{ schmiedepunkte }} SP</span>
            <span class="sp-remaining" [class.warning]="remainingSP < 10">{{ remainingSP }} verbl.</span>
          </div>
        </div>
        <div class="sp-track">
          <div class="sp-fill" [style.width.%]="spProgress" [class.full]="spProgress >= 100"></div>
        </div>
      </div>
    </div>

    <!-- Main 2-col layout -->
    <div class="forge-main">
      <!-- Left: Material slots -->
      <div class="forge-slots-col">
        @for (slotCfg of slots; track slotCfg.key) {
          @let slot = getSlotState(slotCfg.key);
          @let preview = getSlotPreview(slotCfg.key);
          <div class="forge-slot" [class.slot-filled]="slot.entries.length > 0" [attr.data-slot]="slotCfg.key">
            <div class="slot-head">
              <div>
                <div class="slot-label">{{ slotCfg.label }}</div>
                <div class="slot-subtitle">{{ slotCfg.subtitle }}</div>
              </div>
              @if (slot.entries.length > 0 && preview && !isBonusSlot(slotCfg.key)) {
                <div class="slot-mini-stats">
                  <span class="sms-icon">&#x2390;</span>
                  <span class="mini-val halt">{{ preview.haltbarkeit }}</span>
                  <span class="mini-sep"> / </span>
                  <span class="sms-icon"><span class="app-icon" [class.i-effektivity]="itemType === 'weapon'" [class.i-stability]="itemType !== 'weapon'"></span></span>
                  <span class="mini-val effk">{{ preview.effektivitaet }}</span>
                </div>
              }
            </div>
            @if (slot.entries.length > 0) {
              <div class="slot-entries">
                @for (entry of slot.entries; track entry.material.id; let i = $index) {
                  <div class="slot-entry">
                    <div class="entry-row">
                      <span class="entry-name">{{ entry.material.name }}</span>
                      <button class="entry-remove" (click)="removeMaterialEntry(slot, i)" title="Entfernen">&#x2715;</button>
                    </div>
                    @if (!isBonusSlot(slotCfg.key)) {
                      @let sc = entryScaling(entry);
                      <div class="entry-forge-row">
                        <button class="forg-btn forg-minus" (click)="unforge(entry)" [disabled]="entry.forgeCount <= 0">&#x2212;</button>
                        <span class="forg-num">{{ entry.forgeCount }}&times;</span>
                        <div class="forg-action-group">
                          <div class="forg-gain-block">
                            <span class="forg-cost" [class.forg-cost-warn]="!canForge(entry)">{{ nextForgeCostFor(entry) }}&thinsp;SP</span>
                            <span class="forg-arrow">&#x2192;</span>
                            <span class="forg-gain">+{{ sc.halt }}&thinsp;&#x2390; +{{ sc.eff }}&thinsp;{{ itemType === 'weapon' ? '&#x2694;&#xFE0E;' : '&#x26CA;' }}</span>
                          </div>
                          <button class="forg-btn forg-plus" (click)="forge(entry)" [disabled]="!canForge(entry)">Schmieden</button>
                        </div>
                      </div>
                    }
                    @let stackDesc = getStackLevelDesc(entry, slot);
                    @if (stackDesc) {
                      <div class="entry-stack-desc">&#x2726; {{ stackDesc }}</div>
                    }
                  </div>
                }
              </div>
            }
            @if (slot.entries.length > 0 && preview) {
              <div class="slot-preview-stats">
                @if (!isBonusSlot(slotCfg.key)) {
                  <div class="stat-col-title" [class.col-title-w]="itemType === 'weapon'" [class.col-title-a]="itemType !== 'weapon'">
                    {{ itemType === 'weapon' ? 'Waffenwerte' : 'Rustungswerte' }}
                  </div>
                  <div class="stat-rows">
                    <div class="sr">
                      <span class="sr-icon">&#x2390;</span>
                      <span class="sr-val">{{ preview.haltbarkeit }}</span>
                    </div>
                    <div class="sr">
                      <span class="sr-icon sr-icon-eff">{{ itemType === 'weapon' ? '&#x2694;&#xFE0E;' : '&#x26CA;' }}</span>
                      <span class="sr-val">{{ preview.effektivitaet }}</span>
                    </div>
                    @if (itemType === 'armor' && preview.ruestungsmalus) {
                      <div class="sr">
                        <span class="sr-icon sr-malus">&#x2296;</span>
                        <span class="sr-val sr-malus-val">-{{ preview.ruestungsmalus }}</span>
                      </div>
                    }
                    <div class="sr">
                      <span class="sr-icon">&#x2696;&#xFE0E;</span>
                      <span class="sr-val">{{ preview.weight | number:'1.1-1' }}&thinsp;kg</span>
                    </div>
                  </div>
                }
                @if (preview.extraEffect) {
                  <div class="stat-extra">&#x2726; {{ preview.extraEffect }}</div>
                }
              </div>
            }
            <button class="add-mat-btn" (click)="openPicker(slotCfg.key)">+ Material hinzufugen</button>
          </div>
        }
      </div>

      <!-- Right: Traits + Stats + Finish -->
      <div class="forge-right-col">

        <!-- Applied traits -->
        <div class="forge-section">
          <div class="section-header">
            <span class="section-title">&#x2699; Schmiedemerkmale</span>
            <span class="section-hint">{{ appliedTraits.length }} aktiv</span>
          </div>
          @if (appliedTraits.length > 0) {
            <div class="applied-traits">
              @for (applied of appliedTraits; track applied.trait.id) {
                <div class="applied-trait">
                  <div class="at-info">
                    <div class="at-top-row">
                      <span class="at-name">{{ applied.trait.name }}</span>
                      @if (applied.level > 1) {
                        <span class="at-level">Stufe {{ applied.level }}</span>
                      }
                      <span class="at-cost">{{ applied.trait.schmiedepunktKosten * applied.level }} SP</span>
                    </div>
                    <span class="at-effect">{{ formatEffect(applied) }}</span>
                  </div>
                  <div class="at-actions">
                    @if (applied.trait.scalable && applied.level < applied.trait.maxLevel) {
                      <button class="at-btn at-plus" (click)="addTrait(applied.trait)" [disabled]="remainingSP < effectiveTraitCost(applied.trait)">+</button>
                    }
                    <button class="at-btn at-minus" (click)="removeTrait(applied.trait)">&#x2212;</button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="no-traits">Noch keine Merkmale eingraviert.</p>
          }
          <button class="open-trait-btn" (click)="openTraitPicker()">+ Merkmal hinzufugen</button>
        </div>

        <!-- Final stats -->
        @if (primarySlot.entries.length > 0 || secondarySlot.entries.length > 0) {
          <div class="forge-section stats-section">
            <div class="section-header">
              <span class="section-title">&#x1F4CA; Gesamtwerte</span>
            </div>
            <div class="final-stats-grid">
              <div class="fst-block">
                <div class="fst-label-row"><span class="si-inline durability-c fst-ico">&#x2390;</span><span class="fst-label">Haltbarkeit</span></div>
                <span class="fst-value halt">{{ finalHaltbarkeit }}</span>
              </div>
              <div class="fst-block">
                <div class="fst-label-row"><span class="stat-icon fst-si" [class.si-sword]="itemType === 'weapon'" [class.si-shield-ic]="itemType !== 'weapon'"></span><span class="fst-label">{{ itemType === 'weapon' ? 'Effektivitat' : 'Stabilitat' }}</span></div>
                <span class="fst-value effk">{{ finalEffektivitaet }}</span>
              </div>
              @if (itemType === 'armor' && finalRuestungsmalus > 0) {
                <div class="fst-block">
                  <span class="fst-label">Rustungsmalus</span>
                  <span class="fst-value malus">-{{ finalRuestungsmalus }}</span>
                </div>
              }
              @if (itemType === 'weapon' && finalStatRequirement > 0) {
                <div class="fst-block">
                  <span class="fst-label">Anforderung</span>
                  <span class="fst-value stat-req">{{ statRequirement }} {{ finalStatRequirement }}</span>
                </div>
              }
              <div class="fst-block">
                <span class="fst-label">Gewicht</span>
                <span class="fst-value weight">{{ finalWeight | number:'1.1-1' }} kg</span>
              </div>
            </div>
            @if (allExtraEffects.length > 0) {
              <div class="final-effects">
                @for (eff of allExtraEffects; track eff) {
                  <span class="effect-pill">&#x2726; {{ eff }}</span>
                }
              </div>
            }
          </div>
        }

        <!-- Finish -->
        <div class="forge-finish">
          <button class="finish-btn" (click)="finishForging()" [disabled]="!canFinish()">
            &#x2692; Schmieden abschliessen &amp; zum Inventar
          </button>
          @if (!canFinish()) {
            <span class="finish-hint">{{ !itemName.trim() ? 'Bitte einen Namen eingeben' : 'Primarmaterial wird benotigt' }}</span>
          }
        </div>

      </div>
    </div>
  }
</div>

<!-- Material Picker Modal -->
@if (pickingSlot) {
  <div class="picker-backdrop" (click)="closePicker()">
    <div class="picker-modal" (click)="$event.stopPropagation()">
      <div class="picker-modal-header">
        <div class="picker-title-block">
          <span class="picker-title">Material w&#xE4;hlen</span>
          <span class="picker-subtitle">{{ accessMode === 'enforced' ? 'Nur Ressourcen' : 'Alles bekannte Wissen' }} \xB7 {{ pickingSlotLabel }}</span>
        </div>
        <button class="picker-close-btn" (click)="closePicker()">&#x2715;</button>
      </div>
      <div class="picker-filters-bar">
        <div class="picker-search-wrap">
          <span class="picker-search-icon">&#x1F50D;</span>
          <input class="picker-search" type="text" [(ngModel)]="materialFilter" placeholder="Material suchen..." />
        </div>
      </div>
      @if (filteredMaterials.length === 0) {
        <div class="picker-empty">Keine passenden Materialien in der Bibliothek.</div>
      } @else {
        <div class="picker-grid">
          @for (mat of filteredMaterials; track mat.id) {
            <div class="mat-card picker-selectable"
              [class.card-weapon]="mat.canBeWeaponMaterial && !mat.canBeArmorMaterial"
              [class.card-armor]="mat.canBeArmorMaterial && !mat.canBeWeaponMaterial"
              [class.card-both]="mat.canBeWeaponMaterial && mat.canBeArmorMaterial"
              [class.rarity-rare]="mat.rarity === 'RARE'"
              [class.rarity-legendary]="mat.rarity === 'LEGENDARY'"
              (click)="selectMaterial(mat)">

              <!-- Header: name + badge -->
              <div class="mat-header">
                <span class="mat-name">{{ mat.name }}</span>
                <span class="mat-badge" [class.badge-public]="mat.isPublic">
                  {{ mat.isPublic ? 'Allgemein' : 'Spezial' }}
                </span>
              </div>

              <!-- Type + rarity chips -->
              <div class="mat-chips">
                @if (mat.canBeWeaponMaterial) { <span class="chip chip-w">Waffe</span> }
                @if (mat.canBeArmorMaterial)  { <span class="chip chip-a">Rustung</span> }
                @if (mat.rarity === 'RARE')       { <span class="chip chip-rare">Selten</span> }
                @if (mat.rarity === 'LEGENDARY')  { <span class="chip chip-legendary">Legend&#xE4;r</span> }
                @if (mat.stackable)               { <span class="chip chip-stackable">Stapelbar</span> }
              </div>

              <!-- Stats: only show relevant type for current forge mode -->
              <div class="mat-stats">
                @if (mat.canBeWeaponMaterial && mat.weaponStats && itemType === 'weapon') {
                  <div class="stat-col">
                    <div class="stat-col-title col-title-w">Waffenwerte</div>
                    <div class="stat-rows">
                      <div class="sr">
                        <span class="sr-icon">&#x2390;</span>
                        <span class="sr-val">{{ mat.weaponStats.haltbarkeit }}</span>
                        <span class="sr-scl">+{{ mat.weaponStats.haltbarkeitSkalierung }}</span>
                      </div>
                      <div class="sr">
                        <span class="sr-icon sr-icon-eff">&#x2694;&#xFE0E;</span>
                        <span class="sr-val">{{ mat.weaponStats.effektivitaet }}</span>
                        <span class="sr-scl">+{{ mat.weaponStats.effektivitaetSkalierung }}</span>
                      </div>
                      <div class="sr">
                        <span class="sr-icon">&#x2696;&#xFE0E;</span>
                        <span class="sr-val">{{ mat.weaponStats.weight }}&thinsp;kg</span>
                      </div>
                    </div>
                    @if (mat.weaponStats.extraEffect) {
                      <div class="stat-extra">{{ mat.weaponStats.extraEffect }}</div>
                    }
                  </div>
                }
                @if (mat.canBeArmorMaterial && mat.armorStats && itemType === 'armor') {
                  <div class="stat-col">
                    <div class="stat-col-title col-title-a">Rustungswerte</div>
                    <div class="stat-rows">
                      <div class="sr">
                        <span class="sr-icon">&#x2390;</span>
                        <span class="sr-val">{{ mat.armorStats.haltbarkeit }}</span>
                        <span class="sr-scl">+{{ mat.armorStats.haltbarkeitSkalierung }}</span>
                      </div>
                      <div class="sr">
                        <span class="sr-icon sr-icon-eff">&#x26CA;</span>
                        <span class="sr-val">{{ mat.armorStats.effektivitaet }}</span>
                        <span class="sr-scl">+{{ mat.armorStats.effektivitaetSkalierung }}</span>
                      </div>
                      <div class="sr">
                        <span class="sr-icon">&#x2696;&#xFE0E;</span>
                        <span class="sr-val">{{ mat.armorStats.weight }}&thinsp;kg</span>
                      </div>
                      @if (mat.armorStats.ruestungsmalus) {
                        <div class="sr">
                          <span class="sr-icon sr-malus">&#x2296;</span>
                          <span class="sr-val sr-malus-val">{{ mat.armorStats.ruestungsmalus }}</span>
                        </div>
                      }
                    </div>
                    @if (mat.armorStats.extraEffect) {
                      <div class="stat-extra">{{ mat.armorStats.extraEffect }}</div>
                    }
                  </div>
                }
              </div>

              <!-- Description below stats -->
              @if (mat.description) {
                <p class="mat-desc">{{ mat.description }}</p>
              }

            </div>
          }
        </div>
      }
    </div>
  </div>
}

<!-- Trait Picker Modal -->
@if (showTraitPicker) {
  <div class="picker-backdrop" (click)="closeTraitPicker()">
    <div class="picker-modal" (click)="$event.stopPropagation()">
      <div class="picker-modal-header">
        <div class="picker-title-block">
          <span class="picker-title">&#x2699; Schmiedemerkmale</span>
          <span class="picker-subtitle">{{ remainingSP }} SP verbleibend</span>
        </div>
        <button class="picker-close-btn" (click)="closeTraitPicker()">&#x2715;</button>
      </div>
      <div class="picker-filters-bar">
        <div class="picker-search-wrap">
          <span class="picker-search-icon">&#x1F50D;</span>
          <input class="picker-search" type="text" [(ngModel)]="traitFilter" placeholder="Merkmal suchen..." />
        </div>
        <div class="picker-discount-field">
          <label>Fertigkeit-Rabatt</label>
          <div class="picker-discount-wrap">
            <input type="number" [(ngModel)]="traitDiscount" min="0" max="100" class="picker-discount-input" />
            <span class="picker-discount-pct">%</span>
          </div>
        </div>
      </div>
      @if (filteredForgeTraits.length === 0) {
        <div class="picker-empty">Keine Schmiedemerkmale in der Bibliothek.</div>
      } @else {
        <div class="picker-grid trait-picker-grid">
          @for (trait of filteredForgeTraits; track trait.id) {
            @let appliedLevel = getAppliedLevel(trait);
            <div class="picker-trait-card" [class.tc-maxed]="appliedLevel >= trait.maxLevel">
              <div class="ptc-header">
                <span class="ptc-name">{{ trait.name }}</span>
                <span class="ptc-cost" [class.unaffordable]="!canAddTrait(trait)">
                  {{ effectiveTraitCost(trait) }}&thinsp;SP
                  @if (traitDiscount > 0) { <span class="ptc-orig-cost">({{ trait.schmiedepunktKosten }})</span> }
                </span>
              </div>
              <p class="ptc-effect">{{ trait.effect }}</p>
              <div class="ptc-footer">
                @if (trait.scalable) {
                  <span class="ptc-levels">{{ appliedLevel }}/{{ trait.maxLevel }}</span>
                } @else {
                  <span></span>
                }
                @if (appliedLevel >= trait.maxLevel) {
                  <span class="ptc-tag maxed">Max</span>
                } @else if (remainingSP < effectiveTraitCost(trait)) {
                  <span class="ptc-tag cant">Zu wenig SP</span>
                } @else {
                  <button class="ptc-add-btn" (click)="$event.stopPropagation(); addTrait(trait)">+ Hinzuf&#xFC;gen</button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  </div>
}
`, styles: [`/* src/app/sheet/forging/forging.component.css */
:host {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;
}
.forging-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.forge-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  color: var(--text-muted, #9ca3af);
  font-size: 1rem;
}
.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border, #4a5568);
  border-top-color: var(--accent, #8b5cf6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.forge-config-bar {
  display: flex;
  align-items: flex-end;
  gap: 0.9rem;
  padding: 0.75rem 1.25rem;
  background: var(--card, #2d3748);
  border-bottom: 1px solid var(--border, #4a5568);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.config-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.config-field label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.name-field {
  flex: 2;
  min-width: 180px;
}
.type-field {
  flex-shrink: 0;
}
.sp-combined-field {
  flex: 3;
  min-width: 260px;
}
.weapon-type-field {
  flex: 1;
  min-width: 200px;
}
.armor-type-field {
  flex: 1;
  min-width: 200px;
}
.stat-req-field {
  flex-shrink: 0;
}
.weapon-size-field {
  flex-shrink: 0;
}
.weapon-type-select,
.armor-type-select {
  width: 100%;
}
.config-field input,
.config-field select {
  padding: 0.45rem 0.75rem;
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-radius: 6px;
  color: var(--text, #e5e7eb);
  font-size: 0.9rem;
  transition: border-color 0.15s;
}
.config-field input:focus,
.config-field select:focus {
  outline: none;
  border-color: var(--accent, #8b5cf6);
}
.type-toggle {
  display: flex;
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  overflow: hidden;
}
.type-toggle button {
  padding: 0.45rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.type-toggle button.active {
  background: var(--accent, #8b5cf6);
  color: white;
  font-weight: 700;
}
.type-toggle button:not(.active):hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text, #e5e7eb);
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}
.sp-control-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.3rem;
}
.sp-max-input {
  width: 70px !important;
  flex-shrink: 0;
}
.sp-status {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--text-muted, #9ca3af);
}
.sp-status strong {
  color: var(--text, #e5e7eb);
}
.sp-remaining {
  font-size: 0.78rem;
  color: var(--text-muted, #9ca3af);
}
.sp-remaining.warning {
  color: #f59e0b;
  font-weight: 700;
}
.sp-track {
  height: 6px;
  background: var(--bg, #1e293b);
  border-radius: 4px;
  overflow: hidden;
}
.sp-fill {
  height: 100%;
  background: var(--accent, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}
.sp-fill.full {
  background: #ef4444;
}
.forge-main {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}
.forge-slots-col {
  flex: 0 0 52%;
  border-right: 1px solid var(--border, #4a5568);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem;
}
.forge-slots-col::-webkit-scrollbar {
  width: 5px;
}
.forge-slots-col::-webkit-scrollbar-track {
  background: transparent;
}
.forge-slots-col::-webkit-scrollbar-thumb {
  background: var(--border, #4a5568);
  border-radius: 3px;
}
.forge-slot {
  background: var(--card, #2d3748);
  border: 1.5px dashed var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transition: border-color 0.2s;
}
.forge-slot.slot-filled {
  border-style: solid;
}
.forge-slot[data-slot=primary].slot-filled {
  border-color: #8b5cf6;
}
.forge-slot[data-slot=secondary].slot-filled {
  border-color: #60a5fa;
}
.forge-slot[data-slot=bonus].slot-filled {
  border-color: #34d399;
}
.slot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.slot-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent, #8b5cf6);
}
.forge-slot[data-slot=secondary] .slot-label {
  color: #60a5fa;
}
.forge-slot[data-slot=bonus] .slot-label {
  color: #34d399;
}
.slot-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted, #9ca3af);
  margin-top: 0.1rem;
}
.slot-mini-stats {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
}
.mini-val {
  font-size: 0.9rem;
  font-weight: 800;
}
.mini-val.halt {
  color: #34d399;
}
.mini-val.effk {
  color: #fb923c;
}
.mini-sep {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}
.slot-entries {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.slot-entry {
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-left: 3px solid var(--border, #4a5568);
  border-radius: 7px;
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.forge-slot[data-slot=primary] .slot-entry {
  border-left-color: #8b5cf6;
}
.forge-slot[data-slot=secondary] .slot-entry {
  border-left-color: #60a5fa;
}
.forge-slot[data-slot=bonus] .slot-entry {
  border-left-color: #34d399;
}
.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.entry-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
}
.entry-remove {
  background: none;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.28rem;
  border-radius: 3px;
  transition: all 0.15s;
  line-height: 1;
}
.entry-remove:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.sms-icon {
  font-size: 0.82rem;
  line-height: 1;
  font-variant-emoji: text;
  color: #94a3b8;
}
.entry-forge-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.forg-btn {
  border-radius: 5px;
  border: 1px solid var(--border, #4a5568);
  background: var(--card, #2d3748);
  color: var(--text, #e5e7eb);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.forg-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.forg-minus {
  width: 26px;
  height: 26px;
  font-size: 1.1rem;
  padding: 0;
}
.forg-plus {
  padding: 0 0.75rem;
  height: 30px;
  font-size: 0.82rem;
  font-weight: 800;
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #8b5cf6);
  flex-shrink: 0;
}
.forg-plus:not(:disabled):hover {
  background: rgba(139, 92, 246, 0.15);
}
.forg-num {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
  min-width: 26px;
  text-align: center;
  flex-shrink: 0;
}
.forg-gain-block {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  padding: 0.25rem 0.55rem;
  min-width: 0;
  overflow: hidden;
}
.forg-cost {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--accent, #8b5cf6);
  white-space: nowrap;
  flex-shrink: 0;
}
.forg-cost.forg-cost-warn {
  color: #f59e0b;
}
.forg-arrow {
  font-size: 0.72rem;
  color: #6b7280;
  flex-shrink: 0;
}
.forg-gain {
  font-size: 0.8rem;
  font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
  font-variant-emoji: text;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.forg-next strong {
  color: var(--accent, #8b5cf6);
}
.slot-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.7rem;
  background: rgba(0, 0, 0, 0.18);
  border-radius: 6px;
  padding: 0.4rem 0.65rem;
}
.slot-preview-stats {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 7px;
  padding: 0.5rem 0.65rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.prev-pair {
  display: flex;
  align-items: baseline;
  gap: 0.28rem;
}
.prev-lbl {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted, #9ca3af);
  letter-spacing: 0.04em;
}
.prev-val {
  font-size: 1rem;
  font-weight: 800;
}
.prev-val.halt {
  color: #34d399;
}
.prev-val.effk {
  color: #fb923c;
}
.prev-val.weight {
  color: #9ca3af;
}
.prev-val.malus {
  color: #f87171;
}
.prev-effect {
  font-size: 0.78rem;
  color: var(--accent, #8b5cf6);
  font-style: italic;
  width: 100%;
}
.add-mat-btn {
  padding: 0.55rem;
  background: var(--bg, #1e293b);
  border: 1.5px dashed var(--border, #4a5568);
  border-radius: 7px;
  color: var(--text-muted, #9ca3af);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.add-mat-btn:hover {
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.05);
}
.forge-right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0.9rem;
  gap: 0.7rem;
  min-width: 0;
}
.forge-right-col::-webkit-scrollbar {
  width: 5px;
}
.forge-right-col::-webkit-scrollbar-track {
  background: transparent;
}
.forge-right-col::-webkit-scrollbar-thumb {
  background: var(--border, #4a5568);
  border-radius: 3px;
}
.forge-section {
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
}
.section-hint {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
}
.applied-traits {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.applied-trait {
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  padding: 0.55rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.at-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}
.at-top-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.at-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
}
.at-level {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.12);
  border-radius: 6px;
  padding: 0.1rem 0.4rem;
}
.at-cost {
  font-size: 0.72rem;
  font-weight: 700;
  color: #fb923c;
}
.at-effect {
  font-size: 0.78rem;
  color: var(--text-muted, #9ca3af);
}
.at-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}
.at-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--border, #4a5568);
  background: var(--card, #2d3748);
  color: var(--text, #e5e7eb);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}
.at-plus:not(:disabled) {
  border-color: var(--accent, #8b5cf6);
  color: var(--accent, #8b5cf6);
}
.at-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.no-traits {
  font-size: 0.82rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
}
.open-trait-btn {
  align-self: flex-start;
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid var(--accent, #8b5cf6);
  border-radius: 6px;
  color: var(--accent, #8b5cf6);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.open-trait-btn:hover {
  background: rgba(139, 92, 246, 0.12);
}
.stats-section {
}
.final-stats-grid {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.fst-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.fst-label {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted, #9ca3af);
}
.fst-value {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}
.fst-value.halt {
  color: #34d399;
  text-shadow: 0 0 20px rgba(52, 211, 153, 0.3);
}
.fst-value.effk {
  color: #fb923c;
  text-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
}
.fst-value.weight {
  color: #9ca3af;
}
.fst-value.malus {
  color: #f87171;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.3);
}
.fst-value.stat-req {
  color: #a78bfa;
  text-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
  font-size: 1.5rem;
}
.stat-req-field {
  min-width: 280px;
}
.stat-req-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.stat-req-toggle button {
  padding: 0.3rem 0.65rem;
  background: transparent;
  border: 1px solid var(--border, #4a5568);
  border-radius: 5px;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  transition: all 0.15s;
}
.stat-req-toggle button.active {
  background: #a78bfa;
  border-color: #a78bfa;
  color: #1e1e2e;
}
.stat-req-toggle button:not(.active):hover {
  background: rgba(167, 139, 250, 0.12);
  color: var(--text, #e5e7eb);
}
.final-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.2rem;
}
.effect-pill {
  padding: 0.22rem 0.65rem;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--accent, #8b5cf6);
}
.forge-finish {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.25rem;
}
.finish-btn {
  padding: 0.85rem;
  background:
    linear-gradient(
      135deg,
      #7c3aed 0%,
      #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.2s;
}
.finish-btn:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}
.finish-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.finish-hint {
  font-size: 0.76rem;
  color: var(--text-muted, #9ca3af);
  text-align: center;
}
.picker-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  z-index: 50;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  padding: 1.25rem;
}
.picker-modal {
  background: var(--bg, #1e293b);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1060px;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.6);
  border-radius: 12px;
}
.picker-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border, #4a5568);
  flex-shrink: 0;
  background: var(--card, #2d3748);
}
.picker-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.picker-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
}
.picker-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted, #9ca3af);
}
.picker-close-btn {
  background: none;
  border: none;
  color: var(--text-muted, #9ca3af);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  transition: all 0.15s;
}
.picker-close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text, #e5e7eb);
}
.picker-filters-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border, #4a5568);
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.12);
}
.picker-search-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 8px;
  padding: 0.45rem 0.85rem;
  transition: border-color 0.15s;
}
.picker-search-wrap:focus-within {
  border-color: var(--accent, #8b5cf6);
}
.picker-search-icon {
  font-size: 0.9rem;
  opacity: 0.6;
}
.picker-search {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text, #e5e7eb);
  font-size: 0.9rem;
}
.picker-search:focus {
  outline: none;
}
.picker-type-tabs {
  display: flex;
  gap: 0.35rem;
}
.picker-type-tabs button {
  padding: 0.4rem 0.9rem;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 6px;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.picker-type-tabs button.active {
  background: var(--accent, #8b5cf6);
  border-color: var(--accent, #8b5cf6);
  color: white;
}
.picker-type-tabs button:not(.active):hover {
  border-color: var(--accent, #8b5cf6);
  color: var(--text, #e5e7eb);
}
.picker-empty {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted, #9ca3af);
  font-size: 0.9rem;
  font-style: italic;
}
.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-auto-rows: min-content;
  gap: 0.85rem;
  padding: 1.25rem;
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  align-content: start;
  align-items: stretch;
}
.picker-grid::-webkit-scrollbar {
  width: 6px;
}
.picker-grid::-webkit-scrollbar-track {
  background: transparent;
}
.picker-grid::-webkit-scrollbar-thumb {
  background: var(--border, #4a5568);
  border-radius: 3px;
}
.picker-mat-card {
  background: var(--card, #2d3748);
  border: 1.5px solid var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.85rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: all 0.18s;
}
.picker-mat-card:hover {
  border-color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.07);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.pmc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.pmc-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
  line-height: 1.2;
}
.pmc-public-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
  border-radius: 8px;
  color: #34d399;
  flex-shrink: 0;
  white-space: nowrap;
}
.pmc-desc {
  font-size: 0.76rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
  line-height: 1.35;
}
.pmc-types {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.pmc-type {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pmc-type.weapon {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}
.pmc-type.armor {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}
.pmc-stats {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding: 0.45rem 0.6rem;
  border-radius: 7px;
  margin-top: 0.1rem;
}
.pmc-stats.weapon-stats {
  background: rgba(251, 146, 60, 0.06);
  border: 1px solid rgba(251, 146, 60, 0.18);
}
.pmc-stats.armor-stats {
  background: rgba(96, 165, 250, 0.06);
  border: 1px solid rgba(96, 165, 250, 0.18);
}
.pmc-stats-title {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 0.1rem;
}
.pmc-stat-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.pmc-sn {
  font-size: 0.7rem;
  color: var(--text-muted, #9ca3af);
  font-weight: 600;
  min-width: 34px;
}
.pmc-sv {
  font-size: 1.05rem;
  font-weight: 800;
}
.pmc-sv.halt {
  color: #34d399;
}
.pmc-sv.effk {
  color: #fb923c;
}
.pmc-sv.weight {
  color: #9ca3af;
}
.pmc-sv.malus {
  color: #f87171;
}
.pmc-scale {
  font-size: 0.68rem;
  color: var(--text-muted, #9ca3af);
}
.pmc-extra {
  font-size: 0.72rem;
  color: var(--accent, #8b5cf6);
  font-style: italic;
  margin-top: 0.1rem;
}
.si-inline {
  font-style: normal;
  font-size: 0.85rem;
  line-height: 1;
  font-family: sans-serif;
  font-variant-emoji: text;
}
.pmc-ico {
  font-size: 0.78rem;
}
.prev-ico {
  font-size: 0.72rem;
}
.fst-ico {
  font-size: 1rem;
}
.durability-c {
  color: #34d399;
}
.effk-c {
  color: #60a5fa;
}
.stab-color {
  background-color: #60a5fa !important;
}
.weight-c {
  color: #94a3b8;
}
.scale-c {
  color: #4ade80;
}
.malus-c {
  color: #f87171;
}
.trait-picker-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.picker-trait-card {
  background: var(--card, #2d3748);
  border: 1.5px solid var(--border, #4a5568);
  border-radius: 10px;
  padding: 0.9rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all 0.18s;
}
.picker-trait-card:not(.tc-maxed):hover {
  border-color: var(--accent, #8b5cf6);
  background: rgba(139, 92, 246, 0.07);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.picker-trait-card.tc-maxed {
  opacity: 0.5;
  cursor: default;
}
.ptc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.ptc-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text, #e5e7eb);
}
.ptc-cost {
  font-size: 0.9rem;
  font-weight: 800;
  color: #fb923c;
  white-space: nowrap;
}
.ptc-cost.unaffordable {
  color: #f87171;
}
.ptc-effect {
  font-size: 0.82rem;
  color: var(--text-muted, #9ca3af);
  margin: 0;
  line-height: 1.45;
  flex: 1;
}
.ptc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
}
.ptc-levels {
  font-size: 0.72rem;
  color: var(--text-muted, #9ca3af);
}
.ptc-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.12rem 0.5rem;
  border-radius: 6px;
}
.ptc-tag.maxed {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}
.ptc-tag.cant {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
}
.ptc-add-btn {
  padding: 0.3rem 0.75rem;
  background: var(--accent, #8b5cf6);
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.ptc-add-btn:hover {
  filter: brightness(1.15);
}
.stat-icon {
  display: inline-block;
  width: 13px;
  height: 13px;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  vertical-align: middle;
  flex-shrink: 0;
}
.si-sword {
  background-color: #60a5fa;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3Cline x1='19' y1='21' x2='21' y2='19'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/%3E%3Cline x1='13' y1='19' x2='19' y2='13'/%3E%3Cline x1='16' y1='16' x2='20' y2='20'/%3E%3Cline x1='19' y1='21' x2='21' y2='19'/%3E%3C/svg%3E");
}
.si-shield-ic {
  background-color: #60a5fa;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E");
}
.si-gem {
  background-color: #34d399;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3h12l4 6-10 13L2 9z'/%3E%3Cline x1='2' y1='9' x2='22' y2='9'/%3E%3Cpath d='M12 3l-4 6 4 13 4-13z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3h12l4 6-10 13L2 9z'/%3E%3Cline x1='2' y1='9' x2='22' y2='9'/%3E%3Cpath d='M12 3l-4 6 4 13 4-13z'/%3E%3C/svg%3E");
}
.mini-si {
  width: 11px;
  height: 11px;
}
.prev-si {
  width: 11px;
  height: 11px;
}
.fst-si {
  width: 14px;
  height: 14px;
}
.pmc-si {
  width: 10px;
  height: 10px;
}
.fst-label-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.pmc-stats-title {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.pmc-stats.weapon-stats .pmc-stats-title {
  color: #fb923c;
}
.pmc-stats.armor-stats .pmc-stats-title {
  color: #60a5fa;
}
.pmc-badge-special {
  background: rgba(139, 92, 246, 0.12) !important;
  border-color: rgba(139, 92, 246, 0.3) !important;
  color: var(--accent, #8b5cf6) !important;
}
.prev-pair {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}
.mat-card {
  position: relative;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-left: 3px solid var(--border, #4a5568);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: auto;
  min-height: 0;
  overflow: hidden;
  transition: box-shadow 0.18s, border-color 0.18s;
}
.mat-card.card-weapon {
  border-left-color: #f97316;
}
.mat-card.card-armor {
  border-left-color: #60a5fa;
}
.mat-card.card-both {
  border-left-color: var(--accent, #8b5cf6);
}
.picker-selectable {
  cursor: pointer;
  align-self: stretch;
}
.picker-selectable:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  border-color: var(--accent, #8b5cf6);
}
.mat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem 0.4rem;
}
.mat-name {
  font-size: 0.97rem;
  font-weight: 700;
  color: var(--text, #e5e7eb);
  line-height: 1.2;
}
.mat-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 9px;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.22);
  color: var(--accent, #8b5cf6);
}
.mat-badge.badge-public {
  background: rgba(52, 211, 153, 0.1);
  border-color: rgba(52, 211, 153, 0.25);
  color: #34d399;
}
.mat-chips {
  display: flex;
  gap: 0.3rem;
  padding: 0 0.8rem 0.6rem;
}
.chip {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.chip-w {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}
.chip-a {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
}
.mat-stats {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--border, #4a5568);
}
.mat-stats.stats-split {
  flex-direction: row;
}
.mat-stats.stats-split .stat-col:first-child {
  border-right: 1px solid var(--border, #4a5568);
}
.stat-col {
  flex: 1;
  padding: 0.5rem 0.75rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.stat-col-title {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.15rem;
}
.col-title-w {
  color: #f97316;
}
.col-title-a {
  color: #60a5fa;
}
.stat-rows {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 6px;
  padding: 0.35rem 0.45rem;
}
.sr {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 0.3rem;
}
.sr-icon {
  font-size: 0.78rem;
  line-height: 1;
  color: #6b7280;
  font-variant-emoji: text;
  text-align: center;
}
.sr-val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1;
}
.sr-scl {
  font-size: 0.88rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: right;
  white-space: nowrap;
}
.sr-malus {
  color: #f87171;
}
.sr-malus-val {
  color: #f87171;
}
.stat-extra {
  margin-top: 0.3rem;
  font-size: 0.76rem;
  color: var(--accent, #8b5cf6);
  font-style: italic;
  line-height: 1.35;
}
.mat-desc {
  margin: 0;
  padding: 0.5rem 0.8rem 0.65rem;
  font-size: 0.77rem;
  color: #94a3b8;
  line-height: 1.45;
  border-top: 1px solid rgba(74, 85, 104, 0.5);
  font-style: italic;
}
.weapon-size-field {
  flex-shrink: 0;
}
.weapon-size-toggle {
  display: flex;
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  overflow: hidden;
}
.weapon-size-toggle button {
  padding: 0.45rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s;
  white-space: nowrap;
}
.weapon-size-toggle button.active {
  background: #fb923c;
  color: white;
  font-weight: 700;
}
.weapon-size-toggle button:not(.active):hover {
  background: rgba(251, 146, 60, 0.1);
  color: var(--text, #e5e7eb);
}
.weapon-type-field {
  flex-shrink: 0;
  min-width: 200px;
}
.weapon-type-select {
  background: var(--bg, #1e293b);
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  color: var(--text, #e5e7eb);
  font-size: 0.82rem;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
  width: 100%;
}
.weapon-type-select:focus {
  outline: none;
  border-color: var(--accent, #8b5cf6);
}
.forg-action-group {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-width: 0;
}
.forg-action-group .forg-gain-block {
  flex: 1;
  border-radius: 6px 0 0 6px;
}
.forg-action-group .forg-btn.forg-plus {
  border-radius: 0 5px 5px 0;
  border-left: none;
  height: auto;
  align-self: stretch;
}
.entry-stack-desc {
  font-size: 0.76rem;
  color: #a5b4fc;
  font-style: italic;
  padding: 0.1rem 0.2rem;
  margin-top: 0.05rem;
  line-height: 1.3;
}
.mat-card.rarity-rare {
  border-color: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.18);
}
.mat-card.rarity-legendary {
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.22);
}
.chip-rare {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}
.chip-legendary {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}
.chip-stackable {
  background: rgba(167, 139, 250, 0.12);
  color: #c4b5fd;
}
.sr-icon.sr-icon-eff {
  background: #1e1b4b;
  border: 1px solid #6366f1;
  border-radius: 3px;
  color: #a5b4fc;
  font-size: 0.7rem;
  padding: 0.05rem 0.15rem;
  line-height: 1.2;
}
.sr {
  grid-template-columns: auto 1fr auto;
}
.picker-discount-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex-shrink: 0;
}
.picker-discount-field label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.picker-discount-wrap {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--card, #2d3748);
  border: 1px solid var(--border, #4a5568);
  border-radius: 7px;
  padding: 0.3rem 0.6rem;
}
.picker-discount-input {
  width: 52px;
  background: transparent;
  border: none;
  color: #34d399;
  font-size: 0.9rem;
  font-weight: 800;
  text-align: center;
}
.picker-discount-input:focus {
  outline: none;
}
.picker-discount-pct {
  font-size: 0.78rem;
  color: #34d399;
  font-weight: 700;
}
.ptc-orig-cost {
  font-size: 0.7rem;
  color: var(--text-muted, #9ca3af);
  font-weight: 600;
  text-decoration: line-through;
  margin-left: 0.2rem;
}
/*# sourceMappingURL=forging.component.css.map */
`] }]
  }], null, { sheet: [{
    type: Input
  }], unlockAll: [{
    type: Input
  }], patch: [{
    type: Output
  }], closeOverlay: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ForgingComponent, { className: "ForgingComponent", filePath: "app/sheet/forging/forging.component.ts", lineNumber: 43 });
})();

export {
  WEAPON_TYPES,
  totalForgeSPSpent,
  createEmptyMaterialBlock,
  createEmptyForgeTrait,
  formatTraitEffect,
  computeForgedStats,
  ForgingComponent
};
//# sourceMappingURL=chunk-X6OBBNZ2.js.map
