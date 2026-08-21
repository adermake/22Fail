import {
  ForgingComponent
} from "./chunk-X6OBBNZ2.js";
import {
  ItemComponent,
  ItemEditorComponent,
  SkillComponent,
  SkillEditorComponent,
  SpellComponent,
  SpellEditorOverlayComponent
} from "./chunk-SJFL75AL.js";
import {
  NPC_STAT_KEYS,
  createEmptyNpcBody,
  createEmptyNpcSoul,
  effectiveNpcStats,
  soulPointBudget,
  soulPointsRemaining,
  soulPointsSpent
} from "./chunk-CBEKLTT4.js";
import {
  CLASS_DEFINITIONS,
  SKILL_DEFINITIONS,
  getSkillsForClass
} from "./chunk-BNPZFNFF.js";
import {
  ImageService
} from "./chunk-7RNBGZ3X.js";
import {
  CheckboxControlValueAccessor,
  DefaultValueAccessor,
  FormsModule,
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
  NgClass
} from "./chunk-FGI44Z6P.js";
import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  Output,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinterpolate2,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-XJL25EXC.js";
import {
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/services/npc-generator.service.ts
var NpcGeneratorService = class _NpcGeneratorService {
  /** Eltern-Map: Kind-Klasse → Liste der Eltern-Klassen */
  parentMap;
  constructor() {
    this.parentMap = /* @__PURE__ */ new Map();
    for (const [cls, info] of Object.entries(CLASS_DEFINITIONS)) {
      for (const child of info.children) {
        if (!this.parentMap.has(child.className)) {
          this.parentMap.set(child.className, []);
        }
        this.parentMap.get(child.className).push(cls);
      }
    }
  }
  // ─── Talentpunkte ─────────────────────────────────────────────────────────
  /** Gesamte verdiente Talentpunkte für ein Level. */
  calcTalentPoints(level) {
    let total = 0;
    for (let l = 1; l <= level; l++) {
      total += 1 + Math.floor((l - 1) / 10);
    }
    return total;
  }
  /** TP-Kosten einer Fertigkeit anhand der Klassen-Stufe. */
  getSkillTPCost(skill) {
    const classInfo = CLASS_DEFINITIONS[skill.class];
    if (!classInfo)
      return 1;
    const tier = classInfo.tier;
    if (tier <= 2)
      return 1;
    if (tier <= 4)
      return 2;
    return 3;
  }
  /** Bereits verbrauchte TP für eine Liste gelernter Skill-IDs. */
  calcSpentTP(learnedSkillIds) {
    return learnedSkillIds.reduce((sum, id) => {
      const skill = SKILL_DEFINITIONS.find((s) => s.id === id);
      return sum + (skill ? this.getSkillTPCost(skill) : 1);
    }, 0);
  }
  // ─── Pfad-Suche ───────────────────────────────────────────────────────────
  /**
   * Findet den kürzesten Pfad von einer Tier-1-Klasse zur Zielklasse.
   * Gibt ein geordnetes Array [Tier1, ..., Ziel] zurück.
   * Wenn Ziel selbst Tier-1 ist, wird [Ziel] zurückgegeben.
   */
  findPathToClass(targetClass) {
    const info = CLASS_DEFINITIONS[targetClass];
    if (!info)
      return [targetClass];
    if (info.tier === 1)
      return [targetClass];
    const queue = [
      { cls: targetClass, path: [targetClass] }
    ];
    const visited = /* @__PURE__ */ new Set();
    while (queue.length > 0) {
      const { cls, path } = queue.shift();
      if (visited.has(cls))
        continue;
      visited.add(cls);
      const tier = CLASS_DEFINITIONS[cls]?.tier;
      if (tier === 1) {
        return [...path].reverse();
      }
      const parents = this.parentMap.get(cls) ?? [];
      for (const parent of parents) {
        if (!visited.has(parent)) {
          queue.push({ cls: parent, path: [...path, parent] });
        }
      }
    }
    return [targetClass];
  }
  // ─── Talentbaum-Traversierung ─────────────────────────────────────────────
  /**
   * Generiert automatisch eine Liste gelernter Skill-IDs.
   *
   * - Findet den Pfad zur Primär- und Sekundärklasse.
   * - Füllt den gemeinsamen Stamm bis 50%.
   * - Teilt die restlichen TP nach Gewicht auf.
   * - Respektiert die 50%-Regel: Jede Klasse muss zu 50% gelernt sein,
   *   bevor die Kindklasse zugänglich wird.
   */
  autoSkillTree(primaryClass, secondaryClass, weight, totalTP) {
    const learnedIds = [];
    const classProgress = /* @__PURE__ */ new Map();
    if (totalTP <= 0)
      return learnedIds;
    const primaryPath = this.findPathToClass(primaryClass);
    const secondaryPath = secondaryClass ? this.findPathToClass(secondaryClass) : [];
    let trunkLength = 0;
    for (let i = 0; i < Math.min(primaryPath.length, secondaryPath.length); i++) {
      if (primaryPath[i] === secondaryPath[i]) {
        trunkLength = i + 1;
      } else {
        break;
      }
    }
    const trunk = primaryPath.slice(0, trunkLength);
    const primaryBranch = primaryPath.slice(trunkLength);
    const secondaryBranch = secondaryPath.slice(trunkLength);
    let remainingTP = totalTP;
    remainingTP = this.fillPathClasses(trunk, remainingTP, learnedIds, classProgress, false);
    if (remainingTP <= 0)
      return learnedIds;
    const clampedWeight = Math.max(0, Math.min(100, weight));
    const primaryShare = secondaryClass ? Math.round(remainingTP * clampedWeight / 100) : remainingTP;
    const secondaryShare = remainingTP - primaryShare;
    const leftoverFromPrimary = this.fillPathClasses(primaryBranch, primaryShare, learnedIds, classProgress, true);
    this.fillPathClasses(secondaryBranch, secondaryShare + leftoverFromPrimary, learnedIds, classProgress, true);
    return learnedIds;
  }
  /**
   * Füllt Fertigkeiten entlang eines Klassen-Pfades.
   *
   * @param isTargetPhase  true = letzte Klasse im Pfad wird vollständig gefüllt;
   *                       false = jede Klasse wird nur bis zur 50%-Schwelle gefüllt.
   * @returns Verbleibende TP
   */
  fillPathClasses(path, tp, learnedIds, classProgress, isTargetPhase) {
    let remaining = tp;
    for (let i = 0; i < path.length; i++) {
      const cls = path[i];
      const skills = getSkillsForClass(cls).filter((s) => !s.infiniteLevel);
      const isLast = i === path.length - 1;
      const fillTarget = isTargetPhase && isLast ? skills.length : Math.ceil(skills.length / 2);
      let learned = classProgress.get(cls) ?? 0;
      for (const skill of skills) {
        if (learnedIds.includes(skill.id))
          continue;
        if (learned >= fillTarget || remaining <= 0)
          break;
        const cost = this.getSkillTPCost(skill);
        if (remaining >= cost) {
          learnedIds.push(skill.id);
          learned++;
          remaining -= cost;
          classProgress.set(cls, learned);
        }
      }
      const threshold = Math.ceil(skills.length / 2);
      if (!isLast && (classProgress.get(cls) ?? 0) < threshold) {
        break;
      }
    }
    return remaining;
  }
  // ─── Ressourcen ───────────────────────────────────────────────────────────
  /** Berechnet HP, Mana und Ausdauer aus Rasse und Level. */
  calcResources(race, level) {
    const lvl = Math.max(1, level);
    return {
      health: race.baseHealth + (lvl - 1) * race.healthPerLevel,
      mana: race.baseMana + (lvl - 1) * race.manaPerLevel,
      energy: race.baseEnergy + (lvl - 1) * race.energyPerLevel
    };
  }
  // ─── Basiswerte ───────────────────────────────────────────────────────────
  /** Berechnet Rassenbasisboni (ohne freie Statpunkte). */
  calcRaceBaseStats(race, level) {
    const lvl = Math.max(1, level);
    return {
      str: race.baseStrength + (lvl - 1) * race.strengthPerLevel,
      dex: race.baseDexterity + (lvl - 1) * race.dexterityPerLevel,
      spd: race.baseSpeed + (lvl - 1) * race.speedPerLevel,
      int: race.baseIntelligence + (lvl - 1) * race.intelligencePerLevel,
      con: race.baseConstitution + (lvl - 1) * race.constitutionPerLevel,
      wil: race.baseChill + (lvl - 1) * race.chillPerLevel
    };
  }
  /** Freie Statpunkte für ein Level. */
  calcFreeStatPoints(level) {
    return Math.floor(level / 3);
  }
  /**
   * Verteilt freie Statpunkte proportional zu den Archetyp-Gewichten.
   * Gibt den angepassten BaseStats-Wert zurück.
   */
  autoAllocateStats(archetype, base, freePoints) {
    const w = archetype.statWeights;
    const totalWeight = w.strength + w.dexterity + w.speed + w.intelligence + w.constitution + w.wille;
    if (totalWeight === 0 || freePoints <= 0)
      return base;
    const allocate = (weight) => Math.round(freePoints * weight / totalWeight);
    return {
      str: base.str + allocate(w.strength),
      dex: base.dex + allocate(w.dexterity),
      spd: base.spd + allocate(w.speed),
      int: base.int + allocate(w.intelligence),
      con: base.con + allocate(w.constitution),
      wil: base.wil + allocate(w.wille)
    };
  }
  // ─── Abgeleitete Werte ────────────────────────────────────────────────────
  /** Berechnet Fokus (= Intelligenz + Fokus-Boni aus Fertigkeiten). */
  calcFokus(intelligence, learnedSkillIds) {
    let fokus = intelligence;
    for (const id of learnedSkillIds) {
      const skill = SKILL_DEFINITIONS.find((s) => s.id === id);
      if (!skill)
        continue;
      if (skill.statBonus?.stat === "focus")
        fokus += skill.statBonus.amount;
      if (skill.statBonuses) {
        for (const b of skill.statBonuses) {
          if (b.stat === "focus")
            fokus += b.amount;
        }
      }
    }
    return fokus;
  }
  /** Berechnet Reaktionswert (= 10 − ⌊Wille / 5⌋ − ⌊Level / 5⌋). */
  calcReaktionswert(wille, level = 1) {
    return 10 - Math.floor(wille / 5) - Math.floor(level / 5);
  }
  /** Berechnet Grundbonus (= ⌊Level / 5⌋ + ⌊Wille / 5⌋). */
  calcGrundbonus(level, wille = 10) {
    return Math.floor(level / 5) + Math.floor(wille / 5);
  }
  // ─── Hilfsmethoden für die UI ─────────────────────────────────────────────
  /** Gibt alle Klassennamen eines bestimmten Tiers zurück. */
  getClassesByTier(tier) {
    return Object.entries(CLASS_DEFINITIONS).filter(([, info]) => info.tier === tier).map(([name]) => name);
  }
  /** Gibt alle Klassennamen sortiert zurück. */
  getAllClasses() {
    return Object.keys(CLASS_DEFINITIONS).sort();
  }
  static \u0275fac = function NpcGeneratorService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NpcGeneratorService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _NpcGeneratorService, factory: _NpcGeneratorService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NpcGeneratorService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [], null);
})();

// src/app/shared/npc-editor/npc-editor.component.ts
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.path;
function NpcEditorComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275element(0, "img", 66);
    \u0275\u0275elementStart(1, "button", 67);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_4_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.clearImage());
    });
    \u0275\u0275text(2, "\xD7");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("src", ctx_r1.imageUrl, \u0275\u0275sanitizeUrl);
  }
}
function NpcEditorComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 4);
    \u0275\u0275text(1);
    \u0275\u0275elementStart(2, "input", 68);
    \u0275\u0275listener("change", function NpcEditorComponent_Conditional_5_Template_input_change_2_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onImagePick($event));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.imageUploading ? "\u2026" : "\uFF0B Bild", " ");
  }
}
function NpcEditorComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 14);
    \u0275\u0275text(1, "\u{1F512} Seele gesperrt");
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 69);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("npc-budget-full", ctx_r1.remaining === 0)("npc-budget-over", ctx_r1.remaining < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r1.spent, " / ", ctx_r1.budget, " Punkte ");
  }
}
function NpcEditorComponent_For_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 20)(1, "div", 70)(2, "span", 71);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 72);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 73)(7, "button", 74);
    \u0275\u0275listener("click", function NpcEditorComponent_For_28_Template_button_click_7_listener() {
      const k_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.decStat(k_r5));
    });
    \u0275\u0275text(8, "\u2212");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 75);
    \u0275\u0275listener("ngModelChange", function NpcEditorComponent_For_28_Template_input_ngModelChange_9_listener($event) {
      const k_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setStat(k_r5, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 74);
    \u0275\u0275listener("click", function NpcEditorComponent_For_28_Template_button_click_10_listener() {
      const k_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.incStat(k_r5));
    });
    \u0275\u0275text(11, "+");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "span", 76);
    \u0275\u0275text(13);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const k_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.statMeta[k_r5].label);
    \u0275\u0275advance();
    \u0275\u0275classProp("dice-good", ctx_r1.rollBonus(k_r5) < 0)("dice-bad", ctx_r1.rollBonus(k_r5) > 0)("dice-zero", ctx_r1.rollBonus(k_r5) === 0);
    \u0275\u0275property("title", \u0275\u0275interpolate2("W\xFCrfelmodifikator (1d20 ", ctx_r1.rollBonus(k_r5) > 0 ? "+" : "", "", ctx_r1.rollBonus(k_r5), ") \u2014 negativ ist gut"));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r1.rollBonus(k_r5) > 0 ? "+" : "", "", ctx_r1.rollBonus(k_r5), " ");
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", ctx_r1.soulLocked || ctx_r1.soul.stats[k_r5] <= 1);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r1.soul.stats[k_r5])("disabled", ctx_r1.soulLocked);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.soulLocked || ctx_r1.remaining <= 0);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.growthOf(k_r5), "/Lv");
  }
}
function NpcEditorComponent_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 18);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("npc-warn", ctx_r1.remaining < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.remaining > 0 ? ctx_r1.remaining + " Punkt(e) \xFCbrig" : "Budget um " + -ctx_r1.remaining + " \xFCberschritten", " ");
  }
}
function NpcEditorComponent_For_55_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 33)(1, "span", 77);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 78);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 79);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 80);
    \u0275\u0275listener("click", function NpcEditorComponent_For_55_Template_button_click_7_listener() {
      const $index_r7 = \u0275\u0275restoreView(_r6).$index;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.removeBodyMod($index_r7));
    });
    \u0275\u0275text(8, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.statMeta[m_r8.stat].label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", m_r8.mode === "override" ? "=" : "+", " ", m_r8.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u2192 ", ctx_r1.effective[m_r8.stat]);
  }
}
function NpcEditorComponent_For_59_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const k_r9 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("value", k_r9);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.statMeta[k_r9].label);
  }
}
function NpcEditorComponent_Conditional_106_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 82);
    \u0275\u0275text(1, "Noch keine \u2014 im Browser rechts ausw\xE4hlen oder erstellen.");
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_106_For_8_Conditional_7_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 90)(1, "span", 91);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 92);
    \u0275\u0275element(4, "div", 93);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 94);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const c_r13 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(c_r13.name);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r1.barPct(c_r13), "%")("background", c_r13.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", c_r13.current, "/", c_r13.max);
  }
}
function NpcEditorComponent_Conditional_106_For_8_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 89);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_106_For_8_Conditional_7_For_2_Template, 7, 7, "div", 90, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sk_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(sk_r14.counters);
  }
}
function NpcEditorComponent_Conditional_106_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 84)(1, "div", 85)(2, "button", 86);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_106_For_8_Template_button_click_2_listener() {
      const $index_r12 = \u0275\u0275restoreView(_r11).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSkillEditor($index_r12));
    });
    \u0275\u0275text(3, "\u270E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 87);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_106_For_8_Template_button_click_4_listener() {
      const $index_r12 = \u0275\u0275restoreView(_r11).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeCustomSkill($index_r12));
    });
    \u0275\u0275text(5, "\xD7");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "app-skill", 88);
    \u0275\u0275conditionalCreate(7, NpcEditorComponent_Conditional_106_For_8_Conditional_7_Template, 3, 0, "div", 89);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sk_r14 = ctx.$implicit;
    const $index_r12 = ctx.$index;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275property("skill", sk_r14)("sheet", ctx_r1.previewSheet)("index", $index_r12)("readOnly", true);
    \u0275\u0275advance();
    \u0275\u0275conditional((sk_r14.counters == null ? null : sk_r14.counters.length) ? 7 : -1);
  }
}
function NpcEditorComponent_Conditional_106_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 81)(1, "span", 18);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 40);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_106_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openSkillEditor(null));
    });
    \u0275\u0275text(4, "\uFF0B Erstellen");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(5, NpcEditorComponent_Conditional_106_Conditional_5_Template, 2, 0, "p", 82);
    \u0275\u0275elementStart(6, "div", 83);
    \u0275\u0275repeaterCreate(7, NpcEditorComponent_Conditional_106_For_8_Template, 8, 5, "div", 84, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r1.draft.customSkills.length, " Fertigkeit(en)");
    \u0275\u0275advance(3);
    \u0275\u0275conditional(!ctx_r1.draft.customSkills.length ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.draft.customSkills);
  }
}
function NpcEditorComponent_Conditional_107_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 82);
    \u0275\u0275text(1, "Noch keine \u2014 im Browser rechts ausw\xE4hlen oder erstellen.");
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_107_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 84)(1, "div", 85)(2, "button", 86);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_107_For_8_Template_button_click_2_listener() {
      const $index_r17 = \u0275\u0275restoreView(_r16).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSpellEditor($index_r17));
    });
    \u0275\u0275text(3, "\u270E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 87);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_107_For_8_Template_button_click_4_listener() {
      const $index_r17 = \u0275\u0275restoreView(_r16).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeSpell($index_r17));
    });
    \u0275\u0275text(5, "\xD7");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "app-spell", 95);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sp_r18 = ctx.$implicit;
    const $index_r17 = ctx.$index;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275property("spell", sp_r18)("sheet", ctx_r1.previewSheet)("index", $index_r17);
  }
}
function NpcEditorComponent_Conditional_107_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 81)(1, "span", 18);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 40);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_107_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r15);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openSpellEditor(null));
    });
    \u0275\u0275text(4, "\uFF0B Erstellen");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(5, NpcEditorComponent_Conditional_107_Conditional_5_Template, 2, 0, "p", 82);
    \u0275\u0275elementStart(6, "div", 83);
    \u0275\u0275repeaterCreate(7, NpcEditorComponent_Conditional_107_For_8_Template, 7, 3, "div", 84, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r1.draft.spells.length, " Zauber");
    \u0275\u0275advance(3);
    \u0275\u0275conditional(!ctx_r1.draft.spells.length ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.draft.spells);
  }
}
function NpcEditorComponent_Conditional_108_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 82);
    \u0275\u0275text(1, "Noch keine \u2014 im Browser rechts ausw\xE4hlen oder erstellen.");
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_108_For_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 84)(1, "div", 85)(2, "button", 86);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_108_For_11_Template_button_click_2_listener() {
      const $index_r21 = \u0275\u0275restoreView(_r20).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openItemEditor($index_r21));
    });
    \u0275\u0275text(3, "\u270E");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 87);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_108_For_11_Template_button_click_4_listener() {
      const $index_r21 = \u0275\u0275restoreView(_r20).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeEquipment($index_r21));
    });
    \u0275\u0275text(5, "\xD7");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "app-item", 98);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const it_r22 = ctx.$implicit;
    const $index_r21 = ctx.$index;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275property("item", it_r22)("sheet", ctx_r1.previewSheet)("index", $index_r21)("startUnfolded", true)("hideFoldControls", true);
  }
}
function NpcEditorComponent_Conditional_108_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 81)(1, "span", 18);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 96)(4, "button", 97);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_108_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r19);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openForge());
    });
    \u0275\u0275text(5, "Schmieden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 40);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_108_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r19);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.openItemEditor(null));
    });
    \u0275\u0275text(7, "\uFF0B Erstellen");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(8, NpcEditorComponent_Conditional_108_Conditional_8_Template, 2, 0, "p", 82);
    \u0275\u0275elementStart(9, "div", 83);
    \u0275\u0275repeaterCreate(10, NpcEditorComponent_Conditional_108_For_11_Template, 7, 5, "div", 84, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r1.draft.equipment.length, " Gegenstand/-st\xE4nde");
    \u0275\u0275advance(6);
    \u0275\u0275conditional(!ctx_r1.draft.equipment.length ? 8 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.draft.equipment);
  }
}
function NpcEditorComponent_Conditional_109_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "textarea", 99);
    \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Conditional_109_Template_textarea_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r23);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.draft.notes, $event) || (ctx_r1.draft.notes = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.draft.notes);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_5_For_3_Conditional_6_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 108);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Conditional_5_For_3_Conditional_6_For_2_Template_button_click_0_listener() {
      const s_r29 = \u0275\u0275restoreView(_r28).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r1.selectTreeSkill(s_r29.id));
    });
    \u0275\u0275elementStart(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const s_r29 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275classProp("picked", ctx_r1.isAdded(s_r29.id))("selected", ctx_r1.selectedTreeSkillId === s_r29.id);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r1.isAdded(s_r29.id) ? "\u2713" : "", " ", s_r29.name);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_5_For_3_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 106);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_119_Conditional_5_For_3_Conditional_6_For_2_Template, 3, 6, "button", 107, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cls_r27 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.skillsForClass(cls_r27));
  }
}
function NpcEditorComponent_Conditional_119_Conditional_5_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 103)(1, "button", 105);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Conditional_5_For_3_Template_button_click_1_listener() {
      const cls_r27 = \u0275\u0275restoreView(_r26).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.toggleClass(cls_r27));
    });
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "small");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, NpcEditorComponent_Conditional_119_Conditional_5_For_3_Conditional_6_Template, 3, 0, "div", 106);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cls_r27 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", ctx_r1.tierClass(ctx_r1.classTier(cls_r27)));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r1.expandedClass === cls_r27 ? "\u25BE" : "\u25B8", " ", cls_r27);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("T", ctx_r1.classTier(cls_r27));
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.expandedClass === cls_r27 || ctx_r1.treeQuery ? 6 : -1);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_5_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r30 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 104)(1, "div", 109)(2, "span", 18);
    \u0275\u0275text(3, "Vorschau");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 40);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Conditional_5_Conditional_4_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.addSelectedTreeSkill());
    });
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(6, "app-skill", 88);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r1.isAdded(ctx_r1.selectedTreeSkillId) ? "\uFF0B Nochmal hinzuf\xFCgen" : "\uFF0B Hinzuf\xFCgen", " ");
    \u0275\u0275advance();
    \u0275\u0275property("skill", ctx)("sheet", ctx_r1.previewSheet)("index", 0)("readOnly", true);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 101);
    \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Conditional_119_Conditional_5_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r25);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.treeQuery, $event) || (ctx_r1.treeQuery = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(1, "div", 102);
    \u0275\u0275repeaterCreate(2, NpcEditorComponent_Conditional_119_Conditional_5_For_3_Template, 7, 5, "div", 103, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, NpcEditorComponent_Conditional_119_Conditional_5_Conditional_4_Template, 7, 5, "div", 104);
  }
  if (rf & 2) {
    let tmp_4_0;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.treeQuery);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.skillClasses);
    \u0275\u0275advance(2);
    \u0275\u0275conditional((tmp_4_0 = ctx_r1.selectedTreeSkill) ? 4 : -1, tmp_4_0);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Conditional_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 108);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Conditional_8_For_2_Template_button_click_0_listener() {
      const f_r34 = \u0275\u0275restoreView(_r33).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(6);
      return \u0275\u0275resetView(ctx_r1.addSkillFromLibrary(f_r34));
    });
    \u0275\u0275elementStart(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const f_r34 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\uFF0B ", f_r34.name);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 106);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Conditional_8_For_2_Template, 3, 1, "button", 112, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const fol_r32 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(fol_r32.files);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 103)(1, "button", 110);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Template_button_click_1_listener() {
      const fol_r32 = \u0275\u0275restoreView(_r31).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.toggleFolder("skill", fol_r32.path));
    });
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275element(4, "i", 111);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "small");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Conditional_8_Template, 3, 0, "div", 106);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const fol_r32 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.isFolderOpen("skill", fol_r32.path) ? "\u25BE" : "\u25B8", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", fol_r32.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(fol_r32.files.length);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isFolderOpen("skill", fol_r32.path) ? 8 : -1);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_For_2_Template, 9, 4, "div", 103, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.skillFolders);
  }
}
function NpcEditorComponent_Conditional_119_Conditional_6_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 82);
    \u0275\u0275text(1, "Keine Fertigkeiten in der Bibliothek.");
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_119_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, NpcEditorComponent_Conditional_119_Conditional_6_Conditional_0_Template, 3, 0, "div", 102)(1, NpcEditorComponent_Conditional_119_Conditional_6_Conditional_1_Template, 2, 0, "p", 82);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275conditional(ctx_r1.skillFolders.length ? 0 : 1);
  }
}
function NpcEditorComponent_Conditional_119_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 100)(1, "button", 58);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r24);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.skillTab = "tree");
    });
    \u0275\u0275text(2, "Klassenbaum");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 58);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_119_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r24);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.skillTab = "library");
    });
    \u0275\u0275text(4, "Bibliothek");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(5, NpcEditorComponent_Conditional_119_Conditional_5_Template, 5, 2);
    \u0275\u0275conditionalCreate(6, NpcEditorComponent_Conditional_119_Conditional_6_Template, 2, 1);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.skillTab === "tree");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r1.skillTab === "library");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.skillTab === "tree" ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.skillTab === "library" ? 6 : -1);
  }
}
function NpcEditorComponent_Conditional_120_Conditional_0_For_2_Conditional_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r37 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 108);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_120_Conditional_0_For_2_Conditional_8_For_2_Template_button_click_0_listener() {
      const f_r38 = \u0275\u0275restoreView(_r37).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r1.addItemFromLibrary(f_r38));
    });
    \u0275\u0275elementStart(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const f_r38 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\uFF0B ", f_r38.name);
  }
}
function NpcEditorComponent_Conditional_120_Conditional_0_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 106);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_120_Conditional_0_For_2_Conditional_8_For_2_Template, 3, 1, "button", 112, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const fol_r36 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(fol_r36.files);
  }
}
function NpcEditorComponent_Conditional_120_Conditional_0_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r35 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 103)(1, "button", 110);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_120_Conditional_0_For_2_Template_button_click_1_listener() {
      const fol_r36 = \u0275\u0275restoreView(_r35).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.toggleFolder("item", fol_r36.path));
    });
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275element(4, "i", 111);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "small");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, NpcEditorComponent_Conditional_120_Conditional_0_For_2_Conditional_8_Template, 3, 0, "div", 106);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const fol_r36 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.isFolderOpen("item", fol_r36.path) ? "\u25BE" : "\u25B8", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", fol_r36.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(fol_r36.files.length);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isFolderOpen("item", fol_r36.path) ? 8 : -1);
  }
}
function NpcEditorComponent_Conditional_120_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_120_Conditional_0_For_2_Template, 9, 4, "div", 103, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.itemFolders);
  }
}
function NpcEditorComponent_Conditional_120_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 82);
    \u0275\u0275text(1, 'Keine Items in der Bibliothek \u2014 nutze \u201EErstellen".');
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_120_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, NpcEditorComponent_Conditional_120_Conditional_0_Template, 3, 0, "div", 102)(1, NpcEditorComponent_Conditional_120_Conditional_1_Template, 2, 0, "p", 82);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275conditional(ctx_r1.itemFolders.length ? 0 : 1);
  }
}
function NpcEditorComponent_Conditional_121_Conditional_0_For_2_Conditional_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r41 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 108);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_121_Conditional_0_For_2_Conditional_8_For_2_Template_button_click_0_listener() {
      const f_r42 = \u0275\u0275restoreView(_r41).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r1.addSpellFromLibrary(f_r42));
    });
    \u0275\u0275elementStart(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const f_r42 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\uFF0B ", f_r42.name);
  }
}
function NpcEditorComponent_Conditional_121_Conditional_0_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 106);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_121_Conditional_0_For_2_Conditional_8_For_2_Template, 3, 1, "button", 112, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const fol_r40 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(fol_r40.files);
  }
}
function NpcEditorComponent_Conditional_121_Conditional_0_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r39 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 103)(1, "button", 110);
    \u0275\u0275listener("click", function NpcEditorComponent_Conditional_121_Conditional_0_For_2_Template_button_click_1_listener() {
      const fol_r40 = \u0275\u0275restoreView(_r39).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.toggleFolder("spell", fol_r40.path));
    });
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275element(4, "i", 111);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "small");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, NpcEditorComponent_Conditional_121_Conditional_0_For_2_Conditional_8_Template, 3, 0, "div", 106);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const fol_r40 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r1.isFolderOpen("spell", fol_r40.path) ? "\u25BE" : "\u25B8", " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", fol_r40.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(fol_r40.files.length);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isFolderOpen("spell", fol_r40.path) ? 8 : -1);
  }
}
function NpcEditorComponent_Conditional_121_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275repeaterCreate(1, NpcEditorComponent_Conditional_121_Conditional_0_For_2_Template, 9, 4, "div", 103, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.spellFolders);
  }
}
function NpcEditorComponent_Conditional_121_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 82);
    \u0275\u0275text(1, "Keine Zauber in der Bibliothek.");
    \u0275\u0275elementEnd();
  }
}
function NpcEditorComponent_Conditional_121_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, NpcEditorComponent_Conditional_121_Conditional_0_Template, 3, 0, "div", 102)(1, NpcEditorComponent_Conditional_121_Conditional_1_Template, 2, 0, "p", 82);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275conditional(ctx_r1.spellFolders.length ? 0 : 1);
  }
}
function NpcEditorComponent_Conditional_122_Template(rf, ctx) {
  if (rf & 1) {
    const _r43 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-skill-editor", 113);
    \u0275\u0275listener("save", function NpcEditorComponent_Conditional_122_Template_app_skill_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r43);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSkillSave($event));
    })("cancel", function NpcEditorComponent_Conditional_122_Template_app_skill_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r43);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeSkillEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("skill", ctx_r1.editingSkill);
  }
}
function NpcEditorComponent_Conditional_123_Template(rf, ctx) {
  if (rf & 1) {
    const _r44 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-item-editor", 114);
    \u0275\u0275listener("save", function NpcEditorComponent_Conditional_123_Template_app_item_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r44);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onItemSave($event));
    })("cancel", function NpcEditorComponent_Conditional_123_Template_app_item_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r44);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeItemEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("item", ctx_r1.editingItem);
  }
}
function NpcEditorComponent_Conditional_124_Template(rf, ctx) {
  if (rf & 1) {
    const _r45 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-spell-editor-overlay", 115);
    \u0275\u0275listener("save", function NpcEditorComponent_Conditional_124_Template_app_spell_editor_overlay_save_0_listener($event) {
      \u0275\u0275restoreView(_r45);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSpellSave($event));
    })("cancel", function NpcEditorComponent_Conditional_124_Template_app_spell_editor_overlay_cancel_0_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeSpellEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("spell", ctx_r1.editingSpell)("availableRunes", ctx_r1.availableRunes);
  }
}
function NpcEditorComponent_Conditional_125_Template(rf, ctx) {
  if (rf & 1) {
    const _r46 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 65)(1, "app-forging", 116);
    \u0275\u0275listener("patch", function NpcEditorComponent_Conditional_125_Template_app_forging_patch_1_listener($event) {
      \u0275\u0275restoreView(_r46);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onForgePatch($event));
    })("closeOverlay", function NpcEditorComponent_Conditional_125_Template_app_forging_closeOverlay_1_listener() {
      \u0275\u0275restoreView(_r46);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeForge());
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("sheet", ctx_r1.previewSheet)("unlockAll", true);
  }
}
var NpcEditorComponent = class _NpcEditorComponent {
  statblock;
  availableSpells = [];
  availableItems = [];
  availableSkills = [];
  availableRunes = [];
  /** Summon mode: the soul's stats + level are fixed (read-only); only body/skills are editable. */
  soulLocked = false;
  // Kept for backward-compatible parent bindings (weapon-gen removed from the UI).
  availableMaterials = [];
  availableForgeTraits = [];
  save = new EventEmitter();
  cancel = new EventEmitter();
  npcGen = inject(NpcGeneratorService);
  imageService = inject(ImageService);
  draft;
  // ─── Static metadata ────────────────────────────────────────────────────────
  statKeys = NPC_STAT_KEYS;
  statMeta = {
    strength: { label: "St\xE4rke" },
    dexterity: { label: "Geschick" },
    speed: { label: "Tempo" },
    intelligence: { label: "Intelligenz" },
    constitution: { label: "Konstitution" },
    wille: { label: "Wille" }
  };
  /** Same 2×3 arrangement as the character sheet: STR/KON/SPD then GES/INT/WIL. */
  statGrid = ["strength", "constitution", "speed", "dexterity", "intelligence", "wille"];
  /** Würfelmodifikator = ⌊(10 − stat) / 4⌋ (same as players: negative helps, positive hurts). */
  rollBonus(k) {
    return Math.trunc((10 - this.effective[k]) / 4);
  }
  skillClasses = Object.keys(CLASS_DEFINITIONS).sort((a, b) => CLASS_DEFINITIONS[a].tier - CLASS_DEFINITIONS[b].tier || a.localeCompare(b));
  /** New body-mod being composed in the UI. */
  newMod = { stat: "constitution", value: 1, mode: "add" };
  // ─── UI state ───────────────────────────────────────────────────────────────
  aktuellTab = "skills";
  browseCategory = "skills";
  skillTab = "tree";
  expandedClass = null;
  treeQuery = "";
  /** Class-tree: the skill currently highlighted for preview (not yet added). */
  selectedTreeSkillId = null;
  /** Library browser: folder groups per category + which folder is open (keyed "cat|path"). */
  itemFolders = [];
  spellFolders = [];
  skillFolders = [];
  expandedFolder = null;
  // Fullscreen nested editors (open flags — editingSkill/Item are null when creating new)
  skillEditorOpen = false;
  editingSkill = null;
  editingSkillIndex = null;
  itemEditorOpen = false;
  editingItem = null;
  editingItemIndex = null;
  spellEditorOpen = false;
  editingSpell = null;
  editingSpellIndex = null;
  forgeOpen = false;
  /** Stub sheet so read-only display components (app-item/app-spell) can render NPC previews.
   * Stats are set high so item requirement badges always read as "met" (never a false red). */
  previewSheet = (() => {
    const stat = () => ({ current: 999, base: 999, bonus: 0, free: 0, gain: 0 });
    return {
      statuses: [],
      skills: [],
      equipment: [],
      inventory: [],
      primary_class: "",
      secondary_class: "",
      level: 1,
      strength: stat(),
      dexterity: stat(),
      speed: stat(),
      intelligence: stat(),
      constitution: stat(),
      chill: stat()
    };
  })();
  imageUploading = false;
  prevBodyOverflow = "";
  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.draft = JSON.parse(JSON.stringify(this.statblock));
    if (!this.draft.soul) {
      this.draft.soul = createEmptyNpcSoul();
      this.draft.soul.level = this.draft.level || 1;
      for (const k of this.statKeys) {
        this.draft.soul.stats[k] = Math.max(1, this.draft[k] || 1);
      }
    }
    if (!this.draft.body)
      this.draft.body = createEmptyNpcBody();
    if (!this.draft.body.mods)
      this.draft.body.mods = [];
    if (!this.draft.customSkills)
      this.draft.customSkills = [];
    for (const id of this.draft.learnedSkillIds ?? []) {
      if (this.draft.customSkills.some((s) => s.skillId === id))
        continue;
      const sk = this.materializeSkill(id);
      if (sk)
        this.draft.customSkills.push(sk);
    }
    this.draft.learnedSkillIds = [];
    this.itemFolders = this.groupByFolder(this.availableItems);
    this.spellFolders = this.groupByFolder(this.availableSpells);
    this.skillFolders = this.groupByFolder(this.availableSkills);
    this.recalc();
    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  // ─── Library folder grouping ────────────────────────────────────────────────
  groupByFolder(files) {
    const map = /* @__PURE__ */ new Map();
    for (const f of files ?? []) {
      const dir = this.folderPath(f.path);
      (map.get(dir) ?? map.set(dir, []).get(dir)).push(f);
    }
    return [...map.entries()].map(([path, list]) => ({
      path,
      label: this.folderLabel(path),
      files: list.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.label.localeCompare(b.label));
  }
  folderPath(p) {
    const i = (p || "").lastIndexOf("/");
    return i <= 0 ? "/" : p.slice(0, i);
  }
  folderLabel(dir) {
    return !dir || dir === "/" ? "Wurzel" : dir.replace(/^\//, "");
  }
  /** Toggle a library folder open (one at a time, keyed by category so lists don't collide). */
  toggleFolder(cat, path) {
    const key = cat + "|" + path;
    this.expandedFolder = this.expandedFolder === key ? null : key;
  }
  isFolderOpen(cat, path) {
    return this.expandedFolder === cat + "|" + path;
  }
  /** Build a full editable SkillBlock from a class-tree definition id (same mapping the lobby uses). */
  materializeSkill(id) {
    const def = SKILL_DEFINITIONS.find((s) => s.id === id);
    if (!def)
      return null;
    return {
      name: def.name,
      class: def.class,
      description: def.description,
      type: def.type,
      enlightened: def.enlightened ?? false,
      skillId: def.id,
      cost: def.cost,
      actionType: def.actionType
    };
  }
  ngOnDestroy() {
    document.body.style.overflow = this.prevBodyOverflow;
  }
  // ─── Soul: level → point budget → distribute over the 6 base stats ──────────
  get soul() {
    return this.draft.soul;
  }
  get budget() {
    return soulPointBudget(this.soul.level);
  }
  get spent() {
    return soulPointsSpent(this.soul);
  }
  get remaining() {
    return soulPointsRemaining(this.soul);
  }
  /** Effective stats (soul + body mods) — what actually feeds the derived readout & gameplay. */
  get effective() {
    return effectiveNpcStats(this.soul, this.draft.body);
  }
  setLevel(v) {
    this.soul.level = Math.max(1, Math.floor(v) || 1);
    const g = this.soul.growth;
    if (g) {
      for (const k of this.statKeys)
        this.soul.stats[k] = Math.max(1, Math.round((g[k] || 0) * this.soul.level));
    }
    this.recalc();
  }
  /** Per-level growth shown in the stat pad: the soul's stored growth, else stat ÷ level. */
  growthOf(k) {
    const g = this.soul.growth?.[k] ?? this.soul.stats[k] / Math.max(1, this.soul.level);
    return Math.round(g * 100) / 100;
  }
  incStat(key) {
    if (this.remaining <= 0)
      return;
    this.soul.stats[key]++;
    this.recalc();
  }
  decStat(key) {
    if (this.soul.stats[key] <= 1)
      return;
    this.soul.stats[key]--;
    this.recalc();
  }
  setStat(key, v) {
    let n = Math.max(1, Math.floor(v) || 1);
    const others = this.spent - this.soul.stats[key];
    n = Math.min(n, this.budget - others);
    this.soul.stats[key] = Math.max(1, n);
    this.recalc();
  }
  // ─── Body: Stabilität / Effizienz + per-stat add/override mods ──────────────
  addBodyMod() {
    this.draft.body.mods.push(__spreadValues({}, this.newMod));
    this.newMod = { stat: "constitution", value: 1, mode: "add" };
    this.recalc();
  }
  removeBodyMod(i) {
    this.draft.body.mods.splice(i, 1);
    this.recalc();
  }
  // ─── Derived (all from the effective 6 stats, standard player formulas) ─────
  get derived() {
    const e = this.effective;
    const L = this.soul.level;
    return {
      maxHealth: e.constitution * 5,
      maxEnergy: e.dexterity * 5,
      maxMana: e.intelligence * 5,
      fokus: this.draft.fokus,
      reaktion: this.npcGen.calcReaktionswert(e.wille, L),
      grundbonus: this.npcGen.calcGrundbonus(L, e.wille),
      bewegung: Math.floor(8 + e.speed / 4)
    };
  }
  /** Write the effective stats + all derived values into the flat gameplay fields consumers read. */
  recalc() {
    const e = this.effective;
    const L = this.soul.level;
    this.draft.level = L;
    this.draft.strength = e.strength;
    this.draft.dexterity = e.dexterity;
    this.draft.speed = e.speed;
    this.draft.intelligence = e.intelligence;
    this.draft.constitution = e.constitution;
    this.draft.wille = e.wille;
    this.draft.maxHealth = e.constitution * 5;
    this.draft.maxEnergy = e.dexterity * 5;
    this.draft.maxMana = e.intelligence * 5;
    this.draft.reaktionswert = this.npcGen.calcReaktionswert(e.wille, L);
    this.draft.grundbonus = this.npcGen.calcGrundbonus(L, e.wille);
    this.recalcFokus();
  }
  /** Fokus depends on Intelligenz + any fokus-granting learned skills (kept via their skillId). */
  recalcFokus() {
    const ids = this.draft.customSkills.filter((s) => s.skillId).map((s) => s.skillId);
    this.draft.fokus = this.npcGen.calcFokus(this.effective.intelligence, ids);
  }
  // ─── Skills: class tree ───────────────────────────────────────────────────
  classTier(cls) {
    return CLASS_DEFINITIONS[cls]?.tier ?? 1;
  }
  skillsForClass(cls) {
    const q = this.treeQuery.trim().toLowerCase();
    return SKILL_DEFINITIONS.filter((s) => s.class === cls && (!q || s.name.toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
  }
  toggleClass(cls) {
    this.expandedClass = this.expandedClass === cls ? null : cls;
  }
  /** Class-tree click just SELECTS a skill for preview — you read it, then press Hinzufügen. */
  selectTreeSkill(id) {
    this.selectedTreeSkillId = this.selectedTreeSkillId === id ? null : id;
  }
  /** The selected class-tree skill materialised for the full app-skill preview. */
  get selectedTreeSkill() {
    return this.selectedTreeSkillId ? this.materializeSkill(this.selectedTreeSkillId) : null;
  }
  /** True once a class-tree skill has been added to this NPC (by its definition id). */
  isAdded(id) {
    return this.draft.customSkills.some((s) => s.skillId === id);
  }
  addSelectedTreeSkill() {
    const sk = this.selectedTreeSkill;
    if (!sk)
      return;
    this.draft.customSkills.push(sk);
    this.recalcFokus();
    this.selectedTreeSkillId = null;
  }
  // ─── Skills: library + custom ─────────────────────────────────────────────
  addSkillFromLibrary(file) {
    const skill = JSON.parse(JSON.stringify(file.data));
    this.draft.customSkills.push(skill);
  }
  openSkillEditor(index) {
    this.editingSkillIndex = index;
    this.editingSkill = index === null ? null : JSON.parse(JSON.stringify(this.draft.customSkills[index]));
    this.skillEditorOpen = true;
  }
  onSkillSave(skill) {
    if (this.editingSkillIndex === null)
      this.draft.customSkills.push(skill);
    else
      this.draft.customSkills[this.editingSkillIndex] = skill;
    this.closeSkillEditor();
  }
  closeSkillEditor() {
    this.skillEditorOpen = false;
    this.editingSkill = null;
    this.editingSkillIndex = null;
  }
  removeCustomSkill(index) {
    this.draft.customSkills.splice(index, 1);
    this.recalcFokus();
  }
  // ─── Items: library + custom ──────────────────────────────────────────────
  addItemFromLibrary(file) {
    const item = JSON.parse(JSON.stringify(file.data));
    this.draft.equipment.push(item);
  }
  openItemEditor(index) {
    this.editingItemIndex = index;
    this.editingItem = index === null ? null : JSON.parse(JSON.stringify(this.draft.equipment[index]));
    this.itemEditorOpen = true;
  }
  onItemSave(item) {
    if (this.editingItemIndex === null)
      this.draft.equipment.push(item);
    else
      this.draft.equipment[this.editingItemIndex] = item;
    this.closeItemEditor();
  }
  closeItemEditor() {
    this.itemEditorOpen = false;
    this.editingItem = null;
    this.editingItemIndex = null;
  }
  removeEquipment(index) {
    this.draft.equipment.splice(index, 1);
  }
  // ─── Forge (all materials unlocked) ───────────────────────────────────────
  openForge() {
    this.forgeOpen = true;
  }
  closeForge() {
    this.forgeOpen = false;
  }
  /** The forge emits the finished item via a patch to /inventory/-; add it to NPC equipment. */
  onForgePatch(p) {
    if (p.path === "/inventory/-" && p.value) {
      this.draft.equipment.push(p.value);
    }
  }
  // ─── Spells: library + custom ─────────────────────────────────────────────
  addSpellFromLibrary(file) {
    this.draft.spells.push(JSON.parse(JSON.stringify(file.data)));
  }
  openSpellEditor(index) {
    this.editingSpellIndex = index;
    this.editingSpell = index === null ? null : JSON.parse(JSON.stringify(this.draft.spells[index]));
    this.spellEditorOpen = true;
  }
  onSpellSave(spell) {
    if (this.editingSpellIndex === null)
      this.draft.spells.push(spell);
    else
      this.draft.spells[this.editingSpellIndex] = spell;
    this.closeSpellEditor();
  }
  closeSpellEditor() {
    this.spellEditorOpen = false;
    this.editingSpell = null;
    this.editingSpellIndex = null;
  }
  removeSpell(index) {
    this.draft.spells.splice(index, 1);
  }
  getSpellName(spell) {
    return spell.name ?? "Zauber";
  }
  // ─── Skill preview helpers (show how a skill will read in play) ────────────
  skillCostLabel(sk) {
    if (!sk.cost)
      return "";
    const res = sk.cost.type === "mana" ? "Mana" : sk.cost.type === "energy" ? "Ausdauer" : "Leben";
    return `${sk.cost.amount} ${res}${sk.cost.perRound ? "/Runde" : ""}`;
  }
  skillTypeLabel(t) {
    return { active: "Aktiv", passive: "Passiv", dice_bonus: "W\xFCrfelbonus", stat_bonus: "Stat-Bonus", talent_bonus: "Talent" }[t] ?? t;
  }
  barPct(c) {
    const span = (c.max ?? 0) - (c.min ?? 0);
    if (span <= 0)
      return 0;
    return Math.max(0, Math.min(100, (c.current - c.min) / span * 100));
  }
  // ─── Image ────────────────────────────────────────────────────────────────
  get imageUrl() {
    return this.draft.image ? this.imageService.getImageUrl(this.draft.image) : null;
  }
  async onImagePick(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file)
      return;
    this.imageUploading = true;
    try {
      const id = await this.imageService.uploadImageFile(file, file.name);
      this.draft.image = id;
      this.draft.defaultPortrait = id;
    } catch {
      alert("Bild konnte nicht hochgeladen werden.");
    } finally {
      this.imageUploading = false;
      input.value = "";
    }
  }
  clearImage() {
    this.draft.image = void 0;
    this.draft.defaultPortrait = void 0;
  }
  // ─── Save / cancel ────────────────────────────────────────────────────────
  onSave() {
    if (!this.draft.name?.trim())
      this.draft.name = "NSC";
    this.draft.fokus = this.npcGen.calcFokus(this.draft.intelligence, this.draft.learnedSkillIds);
    this.save.emit(this.draft);
  }
  onCancel() {
    this.cancel.emit();
  }
  // ─── Helpers ──────────────────────────────────────────────────────────────
  tierClass(tier) {
    return `tier-${Math.min(tier, 5)}`;
  }
  static \u0275fac = function NpcEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NpcEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NpcEditorComponent, selectors: [["app-npc-editor"]], inputs: { statblock: "statblock", availableSpells: "availableSpells", availableItems: "availableItems", availableSkills: "availableSkills", availableRunes: "availableRunes", soulLocked: "soulLocked", availableMaterials: "availableMaterials", availableForgeTraits: "availableForgeTraits" }, outputs: { save: "save", cancel: "cancel" }, decls: 126, vars: 47, consts: [[1, "npc-overlay"], [1, "npc-modal"], [1, "npc-header"], [1, "npc-image-slot"], [1, "npc-image-upload"], ["type", "text", "placeholder", "Name des NSC\u2026", 1, "npc-name", 3, "ngModelChange", "ngModel"], [1, "npc-header-actions"], [1, "npc-btn-cancel", 3, "click"], [1, "npc-btn-save", 3, "click"], [1, "npc-body"], [1, "npc-col", "npc-col-values"], [1, "npc-card"], [1, "npc-card-head"], [1, "npc-card-title"], ["title", "Seelenwerte durch die Seele festgelegt", 1, "npc-budget", "npc-budget-locked"], [1, "npc-budget", 3, "npc-budget-full", "npc-budget-over"], [1, "npc-level-row"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"], [1, "npc-hint"], [1, "npc-soul-grid"], [1, "npc-soul-cell"], [1, "npc-hint", 3, "npc-warn"], [1, "npc-body-grid", "npc-body-grid-2"], ["title", "Stabilit\xE4t", 1, "npc-field"], [1, "ico", "ico-stability"], ["type", "number", 3, "ngModelChange", "ngModel", "disabled"], ["title", "Effizienz", 1, "npc-field"], [1, "ico", "ico-effektivity"], ["title", "Nutzt die Stabilit\xE4t der ausger\xFCsteten R\xFCstung statt des festen Werts", 1, "npc-check"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], ["title", "Nutzt die Effizienz der ausger\xFCsteten Waffe statt des festen Werts", 1, "npc-check"], [1, "npc-modblock"], [1, "npc-section-label"], [1, "npc-mod-row"], [1, "npc-mod-add"], [3, "ngModelChange", "ngModel"], [3, "value"], ["value", "add"], ["value", "override"], ["type", "number", 3, "ngModelChange", "ngModel"], [1, "npc-btn-add", 3, "click"], [1, "npc-derived-row"], ["title", "Leben", 1, "npc-dv"], [1, "ico", "ico-life"], ["title", "Ausdauer", 1, "npc-dv"], [1, "ico", "ico-energy"], ["title", "Mana", 1, "npc-dv"], [1, "ico", "ico-mana"], ["title", "Fokus", 1, "npc-dv"], ["title", "Reaktion", 1, "npc-dv"], [1, "ico", "ico-reaction"], ["title", "Grundbonus", 1, "npc-dv"], [1, "ico", "ico-grundbonus"], ["title", "Bewegung", 1, "npc-dv"], [1, "ico", "ico-movement"], [1, "npc-col", "npc-col-current"], [1, "npc-card", "npc-current-card"], [1, "npc-tabs"], [3, "click"], ["placeholder", "GM-Notizen\u2026", 1, "npc-notes", 3, "ngModel"], [1, "npc-col", "npc-col-browser"], [1, "npc-card", "npc-browser-card"], [3, "skill"], [3, "item"], [3, "spell", "availableRunes"], [1, "npc-forge-overlay"], ["alt", "NSC-Bild", 1, "npc-image", 3, "src"], ["title", "Bild entfernen", 1, "npc-image-clear", 3, "click"], ["type", "file", "accept", "image/*", "hidden", "", 3, "change"], [1, "npc-budget"], [1, "npc-soul-cell-head"], [1, "npc-soul-label"], [1, "npc-soul-bonus", 3, "title"], [1, "npc-soul-ctrl"], [3, "click", "disabled"], ["type", "number", "min", "1", 1, "npc-soul-input", 3, "ngModelChange", "ngModel", "disabled"], ["title", "Wachstum pro Level", 1, "npc-soul-growth"], [1, "npc-mod-stat"], [1, "npc-mod-op"], [1, "npc-mod-eff"], [1, "npc-row-del", 3, "click"], [1, "npc-tab-head"], [1, "npc-empty"], [1, "npc-embed-list"], [1, "npc-embed-card"], [1, "npc-embed-actions"], ["title", "Bearbeiten", 3, "click"], ["title", "Entfernen", 3, "click"], [3, "skill", "sheet", "index", "readOnly"], [1, "npc-bars", "npc-embed-bars"], [1, "npc-bar"], [1, "npc-bar-label"], [1, "npc-bar-track"], [1, "npc-bar-fill"], [1, "npc-bar-val"], [3, "spell", "sheet", "index"], [1, "npc-tab-head-actions"], [1, "npc-btn-add", "npc-btn-forge", 3, "click"], [3, "item", "sheet", "index", "startUnfolded", "hideFoldControls"], ["placeholder", "GM-Notizen\u2026", 1, "npc-notes", 3, "ngModelChange", "ngModel"], [1, "npc-subtabs"], ["type", "text", "placeholder", "Fertigkeit suchen\u2026", 1, "npc-search", 3, "ngModelChange", "ngModel"], [1, "npc-scroll"], [1, "npc-tree-class"], [1, "npc-info-box"], [1, "npc-tree-head", 3, "click", "ngClass"], [1, "npc-tree-skills"], [1, "npc-tree-skill", 3, "picked", "selected"], [1, "npc-tree-skill", 3, "click"], [1, "npc-info-head"], [1, "npc-tree-head", "npc-folder-head", 3, "click"], [1, "ico", "ico-folder"], [1, "npc-tree-skill"], [3, "save", "cancel", "skill"], [3, "save", "cancel", "item"], [3, "save", "cancel", "spell", "availableRunes"], [3, "patch", "closeOverlay", "sheet", "unlockAll"]], template: function NpcEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
      \u0275\u0275conditionalCreate(4, NpcEditorComponent_Conditional_4_Template, 3, 1)(5, NpcEditorComponent_Conditional_5_Template, 3, 1, "label", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "input", 5);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_6_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.draft.name, $event) || (ctx.draft.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "div", 6)(8, "button", 7);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_8_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(9, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(10, "button", 8);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_10_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(11, "Speichern");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(12, "div", 9)(13, "div", 10)(14, "section", 11)(15, "div", 12)(16, "span", 13);
      \u0275\u0275text(17, "Seele");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(18, NpcEditorComponent_Conditional_18_Template, 2, 0, "span", 14)(19, NpcEditorComponent_Conditional_19_Template, 2, 6, "span", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "div", 16)(21, "label");
      \u0275\u0275text(22, "Level");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "input", 17);
      \u0275\u0275listener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_23_listener($event) {
        return ctx.setLevel($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "span", 18);
      \u0275\u0275text(25);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "div", 19);
      \u0275\u0275repeaterCreate(27, NpcEditorComponent_For_28_Template, 14, 17, "div", 20, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(29, NpcEditorComponent_Conditional_29_Template, 2, 3, "p", 21);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "section", 11)(31, "div", 12)(32, "span", 13);
      \u0275\u0275text(33, "K\xF6rper");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(34, "div", 22)(35, "label", 23);
      \u0275\u0275element(36, "i", 24);
      \u0275\u0275elementStart(37, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_37_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.draft.body.stabilitaet, $event) || (ctx.draft.body.stabilitaet = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(38, "label", 26);
      \u0275\u0275element(39, "i", 27);
      \u0275\u0275elementStart(40, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_40_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.draft.body.effizienz, $event) || (ctx.draft.body.effizienz = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(41, "label", 28)(42, "input", 29);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_42_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.draft.body.useArmorStabilitaet, $event) || (ctx.draft.body.useArmorStabilitaet = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "span");
      \u0275\u0275text(44, "R\xFCstungs-Stabilit\xE4t verwenden");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(45, "label", 30)(46, "input", 29);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_46_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.draft.body.useWeaponEffizienz, $event) || (ctx.draft.body.useWeaponEffizienz = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(47, "span");
      \u0275\u0275text(48, "Waffen-Effizienz verwenden");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(49, "div", 31)(50, "span", 32);
      \u0275\u0275text(51, "K\xF6rper-Modifikatoren");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "p", 18);
      \u0275\u0275text(53, "Addieren zum oder \xFCberschreiben den Seelen-Stat.");
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(54, NpcEditorComponent_For_55_Template, 9, 4, "div", 33, \u0275\u0275repeaterTrackByIndex);
      \u0275\u0275elementStart(56, "div", 34)(57, "select", 35);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_select_ngModelChange_57_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newMod.stat, $event) || (ctx.newMod.stat = $event);
        return $event;
      });
      \u0275\u0275repeaterCreate(58, NpcEditorComponent_For_59_Template, 2, 2, "option", 36, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(60, "select", 35);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_select_ngModelChange_60_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newMod.mode, $event) || (ctx.newMod.mode = $event);
        return $event;
      });
      \u0275\u0275elementStart(61, "option", 37);
      \u0275\u0275text(62, "Addieren (+)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(63, "option", 38);
      \u0275\u0275text(64, "\xDCberschreiben (=)");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(65, "input", 39);
      \u0275\u0275twoWayListener("ngModelChange", function NpcEditorComponent_Template_input_ngModelChange_65_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newMod.value, $event) || (ctx.newMod.value = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "button", 40);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_66_listener() {
        return ctx.addBodyMod();
      });
      \u0275\u0275text(67, "\uFF0B");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(68, "section", 11)(69, "div", 12)(70, "span", 13);
      \u0275\u0275text(71, "Abgeleitet");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(72, "span", 18);
      \u0275\u0275text(73, "aus den Stats");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(74, "div", 41)(75, "span", 42);
      \u0275\u0275element(76, "i", 43);
      \u0275\u0275text(77);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(78, "span", 44);
      \u0275\u0275element(79, "i", 45);
      \u0275\u0275text(80);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(81, "span", 46);
      \u0275\u0275element(82, "i", 47);
      \u0275\u0275text(83);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(84, "span", 48);
      \u0275\u0275text(85);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "span", 49);
      \u0275\u0275element(87, "i", 50);
      \u0275\u0275text(88);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(89, "span", 51);
      \u0275\u0275element(90, "i", 52);
      \u0275\u0275text(91);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(92, "span", 53);
      \u0275\u0275element(93, "i", 54);
      \u0275\u0275text(94);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(95, "div", 55)(96, "section", 56)(97, "div", 57)(98, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_98_listener() {
        return ctx.aktuellTab = "skills";
      });
      \u0275\u0275text(99, "Fertigkeiten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(100, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_100_listener() {
        return ctx.aktuellTab = "spells";
      });
      \u0275\u0275text(101, "Zauber");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(102, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_102_listener() {
        return ctx.aktuellTab = "equipment";
      });
      \u0275\u0275text(103, "Ausr\xFCstung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(104, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_104_listener() {
        return ctx.aktuellTab = "notes";
      });
      \u0275\u0275text(105, "Notizen");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(106, NpcEditorComponent_Conditional_106_Template, 9, 2);
      \u0275\u0275conditionalCreate(107, NpcEditorComponent_Conditional_107_Template, 9, 2);
      \u0275\u0275conditionalCreate(108, NpcEditorComponent_Conditional_108_Template, 12, 2);
      \u0275\u0275conditionalCreate(109, NpcEditorComponent_Conditional_109_Template, 1, 1, "textarea", 59);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(110, "div", 60)(111, "section", 61)(112, "div", 57)(113, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_113_listener() {
        return ctx.browseCategory = "skills";
      });
      \u0275\u0275text(114, "Fertigkeiten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(115, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_115_listener() {
        return ctx.browseCategory = "items";
      });
      \u0275\u0275text(116, "Ausr\xFCstung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(117, "button", 58);
      \u0275\u0275listener("click", function NpcEditorComponent_Template_button_click_117_listener() {
        return ctx.browseCategory = "spells";
      });
      \u0275\u0275text(118, "Zauber");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(119, NpcEditorComponent_Conditional_119_Template, 7, 6);
      \u0275\u0275conditionalCreate(120, NpcEditorComponent_Conditional_120_Template, 2, 1);
      \u0275\u0275conditionalCreate(121, NpcEditorComponent_Conditional_121_Template, 2, 1);
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275conditionalCreate(122, NpcEditorComponent_Conditional_122_Template, 1, 1, "app-skill-editor", 62);
      \u0275\u0275conditionalCreate(123, NpcEditorComponent_Conditional_123_Template, 1, 1, "app-item-editor", 63);
      \u0275\u0275conditionalCreate(124, NpcEditorComponent_Conditional_124_Template, 1, 2, "app-spell-editor-overlay", 64);
      \u0275\u0275conditionalCreate(125, NpcEditorComponent_Conditional_125_Template, 2, 2, "div", 65);
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.imageUrl ? 4 : 5);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.draft.name);
      \u0275\u0275advance(12);
      \u0275\u0275conditional(ctx.soulLocked ? 18 : 19);
      \u0275\u0275advance(5);
      \u0275\u0275property("ngModel", ctx.soul.level);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.soulLocked ? "Skaliert die Seele \xFCber das Wachstum/Level" : "Effizienz der Seelenrune \u2014 je Level +1 Punkt");
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.statGrid);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(!ctx.soulLocked && ctx.remaining !== 0 ? 29 : -1);
      \u0275\u0275advance(8);
      \u0275\u0275twoWayProperty("ngModel", ctx.draft.body.stabilitaet);
      \u0275\u0275property("disabled", ctx.draft.body.useArmorStabilitaet);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.draft.body.effizienz);
      \u0275\u0275property("disabled", ctx.draft.body.useWeaponEffizienz);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.draft.body.useArmorStabilitaet);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.draft.body.useWeaponEffizienz);
      \u0275\u0275advance(8);
      \u0275\u0275repeater(ctx.draft.body.mods);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.newMod.stat);
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.statKeys);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.newMod.mode);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.newMod.value);
      \u0275\u0275advance(12);
      \u0275\u0275textInterpolate(ctx.derived.maxHealth);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.derived.maxEnergy);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.derived.maxMana);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1("Fk ", ctx.derived.fokus);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.derived.reaktion);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.derived.grundbonus);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.derived.bewegung);
      \u0275\u0275advance(4);
      \u0275\u0275classProp("active", ctx.aktuellTab === "skills");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.aktuellTab === "spells");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.aktuellTab === "equipment");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.aktuellTab === "notes");
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.aktuellTab === "skills" ? 106 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.aktuellTab === "spells" ? 107 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.aktuellTab === "equipment" ? 108 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.aktuellTab === "notes" ? 109 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275classProp("active", ctx.browseCategory === "skills");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.browseCategory === "items");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.browseCategory === "spells");
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.browseCategory === "skills" ? 119 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.browseCategory === "items" ? 120 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.browseCategory === "spells" ? 121 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.skillEditorOpen ? 122 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.itemEditorOpen ? 123 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.spellEditorOpen ? 124 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.forgeOpen ? 125 : -1);
    }
  }, dependencies: [CommonModule, NgClass, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel, SkillEditorComponent, ItemEditorComponent, SpellEditorOverlayComponent, ItemComponent, SpellComponent, SkillComponent, ForgingComponent], styles: ["\n\n.npc-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 1150;\n  background: var(--bg, #1e293b);\n  display: flex;\n  justify-content: center;\n}\n.npc-modal[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 1600px;\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  background: var(--bg, #1e293b);\n  color: var(--text, #e5e7eb);\n}\n.ico[_ngcontent-%COMP%] {\n  display: inline-block;\n  width: 15px;\n  height: 15px;\n  flex-shrink: 0;\n  background-color: currentColor;\n  vertical-align: -2px;\n  -webkit-mask: var(--m) center / contain no-repeat;\n  mask: var(--m) center / contain no-repeat;\n}\n.ico-life[_ngcontent-%COMP%] {\n  --m: url(/icons/life.svg);\n  color: #ef4444;\n}\n.ico-energy[_ngcontent-%COMP%] {\n  --m: url(/icons/energy.svg);\n  color: #f59e0b;\n}\n.ico-mana[_ngcontent-%COMP%] {\n  --m: url(/icons/mana.svg);\n  color: #3b82f6;\n}\n.ico-attack[_ngcontent-%COMP%] {\n  --m: url(/icons/attack.svg);\n  color: #fb7185;\n}\n.ico-reaction[_ngcontent-%COMP%] {\n  --m: url(/icons/reaction.svg);\n  color: #a78bfa;\n}\n.ico-turnspeed[_ngcontent-%COMP%] {\n  --m: url(/icons/turnspeed.svg);\n  color: #38bdf8;\n}\n.ico-movement[_ngcontent-%COMP%] {\n  --m: url(/icons/movement.svg);\n  color: #34d399;\n}\n.ico-stability[_ngcontent-%COMP%] {\n  --m: url(/icons/stability.svg);\n  color: #94a3b8;\n}\n.ico-effektivity[_ngcontent-%COMP%] {\n  --m: url(/icons/effektivity.svg);\n  color: #fbbf24;\n}\n.ico-grundbonus[_ngcontent-%COMP%] {\n  --m: url(/icons/grundbonus.svg);\n  color: #cbd5e1;\n}\n.ico-folder[_ngcontent-%COMP%] {\n  --m: url(/icons/folder.svg);\n  color: #eab308;\n}\n.npc-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 10px 20px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  flex-shrink: 0;\n}\n.npc-image-slot[_ngcontent-%COMP%] {\n  position: relative;\n  width: 48px;\n  height: 48px;\n  flex-shrink: 0;\n}\n.npc-image[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  object-fit: cover;\n  border-radius: 8px;\n  border: 1px solid var(--border, #4a5568);\n}\n.npc-image-clear[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -6px;\n  right: -6px;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #ef4444;\n  color: #fff;\n  border: none;\n  cursor: pointer;\n  font-size: 0.85rem;\n  line-height: 1;\n}\n.npc-image-upload[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  border-radius: 8px;\n  border: 1px dashed var(--border, #6b7280);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  font-size: 0.6rem;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n}\n.npc-image-upload[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.npc-name[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 1.1rem;\n  font-weight: 600;\n  padding: 8px 12px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  color: var(--text, #e5e7eb);\n}\n.npc-name[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.npc-btn-save[_ngcontent-%COMP%] {\n  padding: 9px 24px;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.npc-btn-save[_ngcontent-%COMP%]:hover {\n  filter: brightness(1.12);\n}\n.npc-btn-cancel[_ngcontent-%COMP%] {\n  padding: 9px 18px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n}\n.npc-btn-cancel[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e5e7eb);\n}\n.npc-body[_ngcontent-%COMP%] {\n  flex: 1;\n  display: grid;\n  grid-template-columns: minmax(300px, 1.05fr) minmax(260px, 1fr) minmax(260px, 1fr);\n  overflow: hidden;\n}\n.npc-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 12px 14px;\n  overflow-y: auto;\n  min-height: 0;\n}\n.npc-col-values[_ngcontent-%COMP%], \n.npc-col-current[_ngcontent-%COMP%] {\n  border-right: 1px solid var(--border, #4a5568);\n}\n.npc-card[_ngcontent-%COMP%] {\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 10px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.npc-card-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-card-title[_ngcontent-%COMP%] {\n  font-size: 0.86rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n.npc-hint[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n}\n.npc-budget[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 600;\n  color: #f59e0b;\n  padding: 2px 9px;\n  border-radius: 12px;\n  background: rgba(245, 158, 11, 0.12);\n}\n.npc-budget-full[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.05);\n}\n.npc-level-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.npc-level-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 600;\n}\n.npc-level-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 76px;\n  padding: 5px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n}\n.npc-soul-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.npc-soul-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  padding: 4px 8px;\n  background: var(--bg, #1e293b);\n  border-radius: 7px;\n}\n.npc-soul-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 0.84rem;\n  font-weight: 600;\n}\n.npc-soul-ctrl[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n}\n.npc-soul-ctrl[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  color: var(--text, #e5e7eb);\n  font-size: 1rem;\n  line-height: 1;\n  cursor: pointer;\n}\n.npc-soul-ctrl[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-soul-ctrl[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled {\n  opacity: 0.3;\n  cursor: not-allowed;\n}\n.npc-soul-val[_ngcontent-%COMP%] {\n  min-width: 20px;\n  text-align: center;\n  font-weight: 700;\n}\n.npc-soul-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 6px;\n}\n.npc-soul-cell[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 6px 7px;\n  background: var(--bg, #1e293b);\n  border-radius: 7px;\n}\n.npc-soul-cell-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 5px;\n}\n.npc-soul-cell[_ngcontent-%COMP%]   .npc-soul-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n}\n.npc-soul-bonus[_ngcontent-%COMP%] {\n  font-size: 0.74rem;\n  font-weight: 700;\n}\n.npc-soul-cell[_ngcontent-%COMP%]   .npc-soul-ctrl[_ngcontent-%COMP%] {\n  justify-content: space-between;\n}\n.npc-soul-input[_ngcontent-%COMP%] {\n  width: 46px;\n  text-align: center;\n  padding: 4px 4px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-weight: 700;\n  font-size: 0.85rem;\n}\n.npc-soul-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-budget-over[_ngcontent-%COMP%] {\n  color: #ef4444 !important;\n  background: rgba(239, 68, 68, 0.14) !important;\n}\n.npc-warn[_ngcontent-%COMP%] {\n  color: #ef4444;\n  font-weight: 600;\n}\n.npc-body-grid-2[_ngcontent-%COMP%] {\n  grid-template-columns: 1fr 1fr;\n}\n.npc-modblock[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  border-top: 1px dashed var(--border, #4a5568);\n  padding-top: 8px;\n}\n.npc-section-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n}\n.npc-mod-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr auto auto auto;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 8px;\n  background: var(--bg, #1e293b);\n  border-radius: 6px;\n  font-size: 0.82rem;\n}\n.npc-mod-stat[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n.npc-mod-op[_ngcontent-%COMP%] {\n  color: #a78bfa;\n  font-weight: 700;\n}\n.npc-mod-eff[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n}\n.npc-mod-add[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr 64px auto;\n  gap: 5px;\n  align-items: center;\n}\n.npc-mod-add[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.npc-mod-add[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  padding: 5px 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.8rem;\n  min-width: 0;\n}\n.npc-mod-add[_ngcontent-%COMP%]   .npc-btn-add[_ngcontent-%COMP%] {\n  padding: 5px 10px;\n}\n.npc-derived-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  padding-top: 2px;\n}\n.npc-dv[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  background: var(--bg, #1e293b);\n  border-radius: 12px;\n  font-size: 0.8rem;\n  font-weight: 600;\n}\n.npc-body-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.npc-stat-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.npc-derived-extra[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}\n.npc-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.npc-field[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 0.66rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.02em;\n  white-space: nowrap;\n}\n.npc-body-grid[_ngcontent-%COMP%]   .npc-field[_ngcontent-%COMP%] {\n  flex-direction: row;\n  align-items: center;\n  gap: 7px;\n}\n.npc-body-grid[_ngcontent-%COMP%]   .ico[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n}\n.npc-stat-grid[_ngcontent-%COMP%], \n.npc-derived-extra[_ngcontent-%COMP%] {\n  align-items: end;\n}\n.npc-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 100%;\n  min-width: 0;\n  box-sizing: border-box;\n  padding: 5px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  text-align: center;\n}\n.npc-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n}\n.npc-check[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 0.8rem;\n  cursor: pointer;\n}\n.npc-check[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 15px;\n  height: 15px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.npc-overrides[_ngcontent-%COMP%] {\n  border-top: 1px dashed var(--border, #4a5568);\n  padding-top: 6px;\n}\n.npc-overrides[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] {\n  cursor: pointer;\n  font-size: 0.78rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n}\n.npc-override-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  margin-top: 5px;\n}\n.npc-override-row[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%] {\n  width: 84px;\n  padding: 4px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  text-align: center;\n}\n.npc-sliders[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n}\n.npc-slider[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 110px 1fr 110px;\n  align-items: center;\n  gap: 8px;\n}\n.npc-slider-l[_ngcontent-%COMP%], \n.npc-slider-r[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: var(--text-muted, #cbd5e1);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.npc-slider-l[_ngcontent-%COMP%] {\n  text-align: left;\n}\n.npc-slider-r[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.npc-slider[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%] {\n  -webkit-appearance: none;\n  appearance: none;\n  height: 6px;\n  border-radius: 3px;\n  outline: none;\n  cursor: pointer;\n}\n.npc-slider[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: #fff;\n  border: 2px solid #1e293b;\n  cursor: pointer;\n}\n.npc-slider[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-thumb {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: #fff;\n  border: 2px solid #1e293b;\n  cursor: pointer;\n}\n.npc-btn-ghost[_ngcontent-%COMP%] {\n  align-self: flex-start;\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.76rem;\n  cursor: pointer;\n}\n.npc-btn-ghost[_ngcontent-%COMP%]:hover {\n  color: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-btn-add[_ngcontent-%COMP%] {\n  padding: 4px 11px;\n  background: rgba(139, 92, 246, 0.16);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 6px;\n  color: var(--accent, #8b5cf6);\n  font-size: 0.76rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.npc-btn-add[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.28);\n}\n.npc-chip-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.npc-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 6px 3px 9px;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid var(--border, #4a5568);\n}\n.npc-chip[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  opacity: 0.65;\n  font-size: 0.64rem;\n}\n.npc-chip[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: inherit;\n  cursor: pointer;\n  font-size: 0.9rem;\n  line-height: 1;\n  opacity: 0.7;\n}\n.npc-chip[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n  color: #ef4444;\n}\n.npc-item-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.npc-item-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 9px;\n  background: var(--bg, #1e293b);\n  border-radius: 7px;\n}\n.npc-item-name[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 0.83rem;\n  font-weight: 600;\n}\n.npc-item-tag[_ngcontent-%COMP%] {\n  font-size: 0.64rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n}\n.npc-row-edit[_ngcontent-%COMP%], \n.npc-row-del[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 0.92rem;\n  padding: 0 3px;\n}\n.npc-row-edit[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n}\n.npc-row-edit[_ngcontent-%COMP%]:hover {\n  color: var(--accent, #8b5cf6);\n}\n.npc-row-del[_ngcontent-%COMP%] {\n  color: #ef4444;\n  opacity: 0.75;\n}\n.npc-row-del[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.npc-empty[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n}\n.npc-preview-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.npc-preview[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.npc-preview-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-preview-name[_ngcontent-%COMP%] {\n  font-size: 0.88rem;\n  font-weight: 700;\n}\n.npc-preview-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.npc-badges[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.npc-badge[_ngcontent-%COMP%] {\n  font-size: 0.66rem;\n  font-weight: 600;\n  padding: 2px 7px;\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.07);\n  color: var(--text-muted, #cbd5e1);\n}\n.npc-badge-cost[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.16);\n  color: #60a5fa;\n}\n.npc-badge-perp[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  color: #a78bfa;\n}\n.npc-badge-script[_ngcontent-%COMP%] {\n  background: rgba(52, 211, 153, 0.16);\n  color: #34d399;\n}\n.npc-preview-desc[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #cbd5e1);\n  line-height: 1.4;\n  margin: 0;\n  white-space: pre-wrap;\n}\n.npc-bars[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.npc-bar[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  align-items: center;\n  gap: 7px;\n}\n.npc-bar-label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n}\n.npc-bar-track[_ngcontent-%COMP%] {\n  height: 8px;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.08);\n  overflow: hidden;\n}\n.npc-bar-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 4px;\n}\n.npc-bar-val[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n}\n.npc-embed[_ngcontent-%COMP%] {\n  margin: -2px;\n}\n.npc-current-card[_ngcontent-%COMP%], \n.npc-browser-card[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n}\n.npc-tab-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-tab-head-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n}\n.npc-btn-forge[_ngcontent-%COMP%] {\n  background: rgba(234, 179, 8, 0.16);\n  border-color: #eab308;\n  color: #eab308;\n}\n.npc-btn-forge[_ngcontent-%COMP%]:hover {\n  background: rgba(234, 179, 8, 0.28);\n}\n.npc-forge-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 1600;\n  background: var(--bg, #1e293b);\n}\n.npc-embed-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  overflow-y: auto;\n  min-height: 0;\n  flex: 1;\n}\n.npc-embed-card[_ngcontent-%COMP%] {\n  position: relative;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 4px;\n  background: var(--bg, #1e293b);\n}\n.npc-embed-actions[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 4px;\n  right: 4px;\n  z-index: 2;\n  display: flex;\n  gap: 3px;\n}\n.npc-embed-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 5px;\n  border: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  color: var(--text-muted, #cbd5e1);\n  cursor: pointer;\n  font-size: 0.85rem;\n  line-height: 1;\n}\n.npc-embed-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  color: #fff;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-embed-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:last-child:hover {\n  color: #ef4444;\n  border-color: #ef4444;\n}\n.npc-tree-skill.selected[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.npc-info-box[_ngcontent-%COMP%] {\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  padding: 8px;\n  background: rgba(139, 92, 246, 0.06);\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.npc-info-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-embed-bars[_ngcontent-%COMP%] {\n  padding: 6px 8px 4px;\n}\n.npc-notes[_ngcontent-%COMP%] {\n  min-height: 64px;\n  padding: 8px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-family: inherit;\n  font-size: 0.85rem;\n  resize: vertical;\n}\n.npc-notes[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-browser-card[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n}\n.npc-tabs[_ngcontent-%COMP%], \n.npc-subtabs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n}\n.npc-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], \n.npc-subtabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.76rem;\n  cursor: pointer;\n}\n.npc-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%], \n.npc-subtabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.npc-subtabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  padding: 4px;\n}\n.npc-search[_ngcontent-%COMP%] {\n  padding: 6px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.84rem;\n}\n.npc-search[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-scroll[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  overflow-y: auto;\n  min-height: 0;\n  flex: 1;\n}\n.npc-tree-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 6px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-left-width: 3px;\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.npc-tree-head[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  font-size: 0.64rem;\n}\n.npc-folder-head[_ngcontent-%COMP%] {\n  border-left-color: #eab308;\n}\n.npc-folder-head[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n}\n.npc-tree-skills[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  padding: 4px 0 6px 12px;\n}\n.npc-tree-skill[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 9px;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  color: var(--text-muted, #cbd5e1);\n  font-size: 0.79rem;\n  cursor: pointer;\n  text-align: left;\n}\n.npc-tree-skill[_ngcontent-%COMP%]:hover {\n  background: var(--card, #2d3748);\n}\n.npc-tree-skill.picked[_ngcontent-%COMP%] {\n  color: #34d399;\n  font-weight: 600;\n}\n.npc-lib-list[_ngcontent-%COMP%] {\n  flex-wrap: wrap;\n}\n.npc-lib-item[_ngcontent-%COMP%] {\n  padding: 5px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.77rem;\n  cursor: pointer;\n  text-align: left;\n}\n.npc-lib-item[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.tier-1[_ngcontent-%COMP%] {\n  border-left-color: #9ca3af;\n}\n.tier-2[_ngcontent-%COMP%] {\n  border-left-color: #34d399;\n}\n.tier-3[_ngcontent-%COMP%] {\n  border-left-color: #38bdf8;\n}\n.tier-4[_ngcontent-%COMP%] {\n  border-left-color: #a78bfa;\n}\n.tier-5[_ngcontent-%COMP%] {\n  border-left-color: #f59e0b;\n}\n.npc-chip.tier-2[_ngcontent-%COMP%] {\n  border-color: rgba(52, 211, 153, 0.5);\n}\n.npc-chip.tier-3[_ngcontent-%COMP%] {\n  border-color: rgba(56, 189, 248, 0.5);\n}\n.npc-chip.tier-4[_ngcontent-%COMP%] {\n  border-color: rgba(167, 139, 250, 0.5);\n}\n.npc-chip.tier-5[_ngcontent-%COMP%] {\n  border-color: rgba(245, 158, 11, 0.5);\n}\n@media (max-width: 1000px) {\n  .npc-body[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    overflow-y: auto;\n  }\n  .npc-col[_ngcontent-%COMP%] {\n    overflow-y: visible;\n  }\n  .npc-col-values[_ngcontent-%COMP%], \n   .npc-col-current[_ngcontent-%COMP%] {\n    border-right: none;\n    border-bottom: 1px solid var(--border, #4a5568);\n  }\n  .npc-browser-card[_ngcontent-%COMP%] {\n    flex: none;\n  }\n  .npc-scroll[_ngcontent-%COMP%] {\n    max-height: 340px;\n  }\n}\n.npc-soul-growth[_ngcontent-%COMP%] {\n  display: block;\n  text-align: center;\n  font-size: 0.6rem;\n  color: #93c5fd;\n  margin-top: 2px;\n}\n/*# sourceMappingURL=npc-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NpcEditorComponent, [{
    type: Component,
    args: [{ selector: "app-npc-editor", standalone: true, imports: [CommonModule, FormsModule, SkillEditorComponent, ItemEditorComponent, SpellEditorOverlayComponent, ItemComponent, SpellComponent, SkillComponent, ForgingComponent], template: `<div class="npc-overlay">
  <div class="npc-modal">

    <!-- \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
    <div class="npc-header">
      <div class="npc-image-slot">
        @if (imageUrl) {
          <img class="npc-image" [src]="imageUrl" alt="NSC-Bild">
          <button class="npc-image-clear" (click)="clearImage()" title="Bild entfernen">\xD7</button>
        } @else {
          <label class="npc-image-upload">
            {{ imageUploading ? '\u2026' : '\uFF0B Bild' }}
            <input type="file" accept="image/*" (change)="onImagePick($event)" hidden>
          </label>
        }
      </div>
      <input class="npc-name" type="text" [(ngModel)]="draft.name" placeholder="Name des NSC\u2026">
      <div class="npc-header-actions">
        <button class="npc-btn-cancel" (click)="onCancel()">Abbrechen</button>
        <button class="npc-btn-save" (click)="onSave()">Speichern</button>
      </div>
    </div>

    <!-- \u2500\u2500 Body: three panels \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
    <div class="npc-body">

      <!-- \u2550\u2550 COL 1 \u2014 WERTE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
      <div class="npc-col npc-col-values">

        <!-- SEELE: Level \u2192 Punkte \u2192 auf die 6 Grundstats verteilen -->
        <section class="npc-card">
          <div class="npc-card-head">
            <span class="npc-card-title">Seele</span>
            @if (soulLocked) {
              <span class="npc-budget npc-budget-locked" title="Seelenwerte durch die Seele festgelegt">\u{1F512} Seele gesperrt</span>
            } @else {
              <span class="npc-budget" [class.npc-budget-full]="remaining === 0" [class.npc-budget-over]="remaining < 0">
                {{ spent }} / {{ budget }} Punkte
              </span>
            }
          </div>

          <div class="npc-level-row">
            <label>Level</label>
            <input type="number" min="1" [ngModel]="soul.level" (ngModelChange)="setLevel($event)">
            <span class="npc-hint">{{ soulLocked ? 'Skaliert die Seele \xFCber das Wachstum/Level' : 'Effizienz der Seelenrune \u2014 je Level +1 Punkt' }}</span>
          </div>

          <div class="npc-soul-grid">
            @for (k of statGrid; track k) {
              <div class="npc-soul-cell">
                <div class="npc-soul-cell-head">
                  <span class="npc-soul-label">{{ statMeta[k].label }}</span>
                  <span class="npc-soul-bonus"
                        [class.dice-good]="rollBonus(k) < 0" [class.dice-bad]="rollBonus(k) > 0"
                        [class.dice-zero]="rollBonus(k) === 0"
                        title="W\xFCrfelmodifikator (1d20 {{ rollBonus(k) > 0 ? '+' : '' }}{{ rollBonus(k) }}) \u2014 negativ ist gut">
                    {{ rollBonus(k) > 0 ? '+' : '' }}{{ rollBonus(k) }}
                  </span>
                </div>
                <div class="npc-soul-ctrl">
                  <button (click)="decStat(k)" [disabled]="soulLocked || soul.stats[k] <= 1">\u2212</button>
                  <input class="npc-soul-input" type="number" min="1"
                         [ngModel]="soul.stats[k]" (ngModelChange)="setStat(k, $event)" [disabled]="soulLocked">
                  <button (click)="incStat(k)" [disabled]="soulLocked || remaining <= 0">+</button>
                </div>
                <span class="npc-soul-growth" title="Wachstum pro Level">{{ growthOf(k) }}/Lv</span>
              </div>
            }
          </div>
          @if (!soulLocked && remaining !== 0) {
            <p class="npc-hint" [class.npc-warn]="remaining < 0">
              {{ remaining > 0 ? remaining + ' Punkt(e) \xFCbrig' : 'Budget um ' + (-remaining) + ' \xFCberschritten' }}
            </p>
          }
        </section>

        <!-- K\xD6RPER: Stabilit\xE4t / Effizienz + per-stat Modifikatoren -->
        <section class="npc-card">
          <div class="npc-card-head"><span class="npc-card-title">K\xF6rper</span></div>
          <div class="npc-body-grid npc-body-grid-2">
            <label class="npc-field" title="Stabilit\xE4t">
              <i class="ico ico-stability"></i>
              <input type="number" [(ngModel)]="draft.body!.stabilitaet" [disabled]="draft.body!.useArmorStabilitaet"></label>
            <label class="npc-field" title="Effizienz">
              <i class="ico ico-effektivity"></i>
              <input type="number" [(ngModel)]="draft.body!.effizienz" [disabled]="draft.body!.useWeaponEffizienz"></label>
          </div>
          <label class="npc-check" title="Nutzt die Stabilit\xE4t der ausger\xFCsteten R\xFCstung statt des festen Werts">
            <input type="checkbox" [(ngModel)]="draft.body!.useArmorStabilitaet">
            <span>R\xFCstungs-Stabilit\xE4t verwenden</span>
          </label>
          <label class="npc-check" title="Nutzt die Effizienz der ausger\xFCsteten Waffe statt des festen Werts">
            <input type="checkbox" [(ngModel)]="draft.body!.useWeaponEffizienz">
            <span>Waffen-Effizienz verwenden</span>
          </label>

          <div class="npc-modblock">
            <span class="npc-section-label">K\xF6rper-Modifikatoren</span>
            <p class="npc-hint">Addieren zum oder \xFCberschreiben den Seelen-Stat.</p>
            @for (m of draft.body!.mods; track $index) {
              <div class="npc-mod-row">
                <span class="npc-mod-stat">{{ statMeta[m.stat].label }}</span>
                <span class="npc-mod-op">{{ m.mode === 'override' ? '=' : '+' }} {{ m.value }}</span>
                <span class="npc-mod-eff">\u2192 {{ effective[m.stat] }}</span>
                <button class="npc-row-del" (click)="removeBodyMod($index)">\xD7</button>
              </div>
            }
            <div class="npc-mod-add">
              <select [(ngModel)]="newMod.stat">
                @for (k of statKeys; track k) { <option [value]="k">{{ statMeta[k].label }}</option> }
              </select>
              <select [(ngModel)]="newMod.mode">
                <option value="add">Addieren (+)</option>
                <option value="override">\xDCberschreiben (=)</option>
              </select>
              <input type="number" [(ngModel)]="newMod.value">
              <button class="npc-btn-add" (click)="addBodyMod()">\uFF0B</button>
            </div>
          </div>
        </section>

        <!-- ABGELEITET (aus den 6 Stats, Spieler-Formeln) -->
        <section class="npc-card">
          <div class="npc-card-head">
            <span class="npc-card-title">Abgeleitet</span>
            <span class="npc-hint">aus den Stats</span>
          </div>
          <div class="npc-derived-row">
            <span class="npc-dv" title="Leben"><i class="ico ico-life"></i>{{ derived.maxHealth }}</span>
            <span class="npc-dv" title="Ausdauer"><i class="ico ico-energy"></i>{{ derived.maxEnergy }}</span>
            <span class="npc-dv" title="Mana"><i class="ico ico-mana"></i>{{ derived.maxMana }}</span>
            <span class="npc-dv" title="Fokus">Fk {{ derived.fokus }}</span>
            <span class="npc-dv" title="Reaktion"><i class="ico ico-reaction"></i>{{ derived.reaktion }}</span>
            <span class="npc-dv" title="Grundbonus"><i class="ico ico-grundbonus"></i>{{ derived.grundbonus }}</span>
            <span class="npc-dv" title="Bewegung"><i class="ico ico-movement"></i>{{ derived.bewegung }}</span>
          </div>
        </section>
      </div>

      <!-- \u2550\u2550 COL 2 \u2014 AKTUELL (current selections, tabbed) \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
      <div class="npc-col npc-col-current">
        <section class="npc-card npc-current-card">
          <div class="npc-tabs">
            <button [class.active]="aktuellTab === 'skills'" (click)="aktuellTab = 'skills'">Fertigkeiten</button>
            <button [class.active]="aktuellTab === 'spells'" (click)="aktuellTab = 'spells'">Zauber</button>
            <button [class.active]="aktuellTab === 'equipment'" (click)="aktuellTab = 'equipment'">Ausr\xFCstung</button>
            <button [class.active]="aktuellTab === 'notes'" (click)="aktuellTab = 'notes'">Notizen</button>
          </div>

          <!-- SKILLS \u2014 rendered exactly like the sheet (app-skill) -->
          @if (aktuellTab === 'skills') {
            <div class="npc-tab-head">
              <span class="npc-hint">{{ draft.customSkills.length }} Fertigkeit(en)</span>
              <button class="npc-btn-add" (click)="openSkillEditor(null)">\uFF0B Erstellen</button>
            </div>
            @if (!draft.customSkills.length) {
              <p class="npc-empty">Noch keine \u2014 im Browser rechts ausw\xE4hlen oder erstellen.</p>
            }
            <div class="npc-embed-list">
              @for (sk of draft.customSkills; track $index) {
                <div class="npc-embed-card">
                  <div class="npc-embed-actions">
                    <button (click)="openSkillEditor($index)" title="Bearbeiten">\u270E</button>
                    <button (click)="removeCustomSkill($index)" title="Entfernen">\xD7</button>
                  </div>
                  <app-skill [skill]="sk" [sheet]="previewSheet" [index]="$index" [readOnly]="true"></app-skill>
                  @if (sk.counters?.length) {
                    <div class="npc-bars npc-embed-bars">
                      @for (c of sk.counters; track c.id) {
                        <div class="npc-bar">
                          <span class="npc-bar-label">{{ c.name }}</span>
                          <div class="npc-bar-track"><div class="npc-bar-fill" [style.width.%]="barPct(c)" [style.background]="c.color"></div></div>
                          <span class="npc-bar-val">{{ c.current }}/{{ c.max }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- SPELLS -->
          @if (aktuellTab === 'spells') {
            <div class="npc-tab-head">
              <span class="npc-hint">{{ draft.spells.length }} Zauber</span>
              <button class="npc-btn-add" (click)="openSpellEditor(null)">\uFF0B Erstellen</button>
            </div>
            @if (!draft.spells.length) {
              <p class="npc-empty">Noch keine \u2014 im Browser rechts ausw\xE4hlen oder erstellen.</p>
            }
            <div class="npc-embed-list">
              @for (sp of draft.spells; track $index) {
                <div class="npc-embed-card">
                  <div class="npc-embed-actions">
                    <button (click)="openSpellEditor($index)" title="Bearbeiten">\u270E</button>
                    <button (click)="removeSpell($index)" title="Entfernen">\xD7</button>
                  </div>
                  <app-spell [spell]="sp" [sheet]="previewSheet" [index]="$index"></app-spell>
                </div>
              }
            </div>
          }

          <!-- EQUIPMENT -->
          @if (aktuellTab === 'equipment') {
            <div class="npc-tab-head">
              <span class="npc-hint">{{ draft.equipment.length }} Gegenstand/-st\xE4nde</span>
              <span class="npc-tab-head-actions">
                <button class="npc-btn-add npc-btn-forge" (click)="openForge()">Schmieden</button>
                <button class="npc-btn-add" (click)="openItemEditor(null)">\uFF0B Erstellen</button>
              </span>
            </div>
            @if (!draft.equipment.length) {
              <p class="npc-empty">Noch keine \u2014 im Browser rechts ausw\xE4hlen oder erstellen.</p>
            }
            <div class="npc-embed-list">
              @for (it of draft.equipment; track $index) {
                <div class="npc-embed-card">
                  <div class="npc-embed-actions">
                    <button (click)="openItemEditor($index)" title="Bearbeiten">\u270E</button>
                    <button (click)="removeEquipment($index)" title="Entfernen">\xD7</button>
                  </div>
                  <app-item [item]="it" [sheet]="previewSheet" [index]="$index"
                            [startUnfolded]="true" [hideFoldControls]="true"></app-item>
                </div>
              }
            </div>
          }

          <!-- NOTES -->
          @if (aktuellTab === 'notes') {
            <textarea class="npc-notes" [(ngModel)]="draft.notes" placeholder="GM-Notizen\u2026"></textarea>
          }
        </section>
      </div>

      <!-- \u2550\u2550 COL 3 \u2014 BROWSER \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->
      <div class="npc-col npc-col-browser">
        <section class="npc-card npc-browser-card">
          <div class="npc-tabs">
            <button [class.active]="browseCategory === 'skills'" (click)="browseCategory = 'skills'">Fertigkeiten</button>
            <button [class.active]="browseCategory === 'items'" (click)="browseCategory = 'items'">Ausr\xFCstung</button>
            <button [class.active]="browseCategory === 'spells'" (click)="browseCategory = 'spells'">Zauber</button>
          </div>

          <!-- SKILLS -->
          @if (browseCategory === 'skills') {
            <div class="npc-subtabs">
              <button [class.active]="skillTab === 'tree'" (click)="skillTab = 'tree'">Klassenbaum</button>
              <button [class.active]="skillTab === 'library'" (click)="skillTab = 'library'">Bibliothek</button>
            </div>

            @if (skillTab === 'tree') {
              <input class="npc-search" type="text" [(ngModel)]="treeQuery" placeholder="Fertigkeit suchen\u2026">
              <div class="npc-scroll">
                @for (cls of skillClasses; track cls) {
                  <div class="npc-tree-class">
                    <button class="npc-tree-head" [ngClass]="tierClass(classTier(cls))" (click)="toggleClass(cls)">
                      <span>{{ expandedClass === cls ? '\u25BE' : '\u25B8' }} {{ cls }}</span>
                      <small>T{{ classTier(cls) }}</small>
                    </button>
                    @if (expandedClass === cls || treeQuery) {
                      <div class="npc-tree-skills">
                        @for (s of skillsForClass(cls); track s.id) {
                          <button class="npc-tree-skill"
                                  [class.picked]="isAdded(s.id)"
                                  [class.selected]="selectedTreeSkillId === s.id"
                                  (click)="selectTreeSkill(s.id)">
                            <span>{{ isAdded(s.id) ? '\u2713' : '' }} {{ s.name }}</span>
                          </button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Info box: read the selected skill in full, then add it -->
              @if (selectedTreeSkill; as sel) {
                <div class="npc-info-box">
                  <div class="npc-info-head">
                    <span class="npc-hint">Vorschau</span>
                    <button class="npc-btn-add" (click)="addSelectedTreeSkill()">
                      {{ isAdded(selectedTreeSkillId!) ? '\uFF0B Nochmal hinzuf\xFCgen' : '\uFF0B Hinzuf\xFCgen' }}
                    </button>
                  </div>
                  <app-skill [skill]="sel" [sheet]="previewSheet" [index]="0" [readOnly]="true"></app-skill>
                </div>
              }
            }
            @if (skillTab === 'library') {
              @if (skillFolders.length) {
                <div class="npc-scroll">
                  @for (fol of skillFolders; track fol.path) {
                    <div class="npc-tree-class">
                      <button class="npc-tree-head npc-folder-head" (click)="toggleFolder('skill', fol.path)">
                        <span>{{ isFolderOpen('skill', fol.path) ? '\u25BE' : '\u25B8' }} <i class="ico ico-folder"></i> {{ fol.label }}</span>
                        <small>{{ fol.files.length }}</small>
                      </button>
                      @if (isFolderOpen('skill', fol.path)) {
                        <div class="npc-tree-skills">
                          @for (f of fol.files; track f.id) {
                            <button class="npc-tree-skill" (click)="addSkillFromLibrary(f)"><span>\uFF0B {{ f.name }}</span></button>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else { <p class="npc-empty">Keine Fertigkeiten in der Bibliothek.</p> }
            }
          }

          <!-- ITEMS -->
          @if (browseCategory === 'items') {
            @if (itemFolders.length) {
              <div class="npc-scroll">
                @for (fol of itemFolders; track fol.path) {
                  <div class="npc-tree-class">
                    <button class="npc-tree-head npc-folder-head" (click)="toggleFolder('item', fol.path)">
                      <span>{{ isFolderOpen('item', fol.path) ? '\u25BE' : '\u25B8' }} <i class="ico ico-folder"></i> {{ fol.label }}</span>
                      <small>{{ fol.files.length }}</small>
                    </button>
                    @if (isFolderOpen('item', fol.path)) {
                      <div class="npc-tree-skills">
                        @for (f of fol.files; track f.id) {
                          <button class="npc-tree-skill" (click)="addItemFromLibrary(f)"><span>\uFF0B {{ f.name }}</span></button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            } @else { <p class="npc-empty">Keine Items in der Bibliothek \u2014 nutze \u201EErstellen".</p> }
          }

          <!-- SPELLS -->
          @if (browseCategory === 'spells') {
            @if (spellFolders.length) {
              <div class="npc-scroll">
                @for (fol of spellFolders; track fol.path) {
                  <div class="npc-tree-class">
                    <button class="npc-tree-head npc-folder-head" (click)="toggleFolder('spell', fol.path)">
                      <span>{{ isFolderOpen('spell', fol.path) ? '\u25BE' : '\u25B8' }} <i class="ico ico-folder"></i> {{ fol.label }}</span>
                      <small>{{ fol.files.length }}</small>
                    </button>
                    @if (isFolderOpen('spell', fol.path)) {
                      <div class="npc-tree-skills">
                        @for (f of fol.files; track f.id) {
                          <button class="npc-tree-skill" (click)="addSpellFromLibrary(f)"><span>\uFF0B {{ f.name }}</span></button>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            } @else { <p class="npc-empty">Keine Zauber in der Bibliothek.</p> }
          }
        </section>
      </div>
    </div>
  </div>
</div>

<!-- \u2500\u2500 Fullscreen nested editors (cover everything, no bg scroll) \u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
@if (skillEditorOpen) {
  <app-skill-editor [skill]="editingSkill" (save)="onSkillSave($event)" (cancel)="closeSkillEditor()"></app-skill-editor>
}
@if (itemEditorOpen) {
  <app-item-editor [item]="editingItem" (save)="onItemSave($event)" (cancel)="closeItemEditor()"></app-item-editor>
}
@if (spellEditorOpen) {
  <app-spell-editor-overlay [spell]="editingSpell" [availableRunes]="availableRunes"
    (save)="onSpellSave($event)" (cancel)="closeSpellEditor()"></app-spell-editor-overlay>
}
@if (forgeOpen) {
  <div class="npc-forge-overlay">
    <app-forging [sheet]="previewSheet" [unlockAll]="true"
      (patch)="onForgePatch($event)" (closeOverlay)="closeForge()"></app-forging>
  </div>
}
`, styles: ["/* src/app/shared/npc-editor/npc-editor.component.css */\n.npc-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1150;\n  background: var(--bg, #1e293b);\n  display: flex;\n  justify-content: center;\n}\n.npc-modal {\n  width: 100%;\n  max-width: 1600px;\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  background: var(--bg, #1e293b);\n  color: var(--text, #e5e7eb);\n}\n.ico {\n  display: inline-block;\n  width: 15px;\n  height: 15px;\n  flex-shrink: 0;\n  background-color: currentColor;\n  vertical-align: -2px;\n  -webkit-mask: var(--m) center / contain no-repeat;\n  mask: var(--m) center / contain no-repeat;\n}\n.ico-life {\n  --m: url(/icons/life.svg);\n  color: #ef4444;\n}\n.ico-energy {\n  --m: url(/icons/energy.svg);\n  color: #f59e0b;\n}\n.ico-mana {\n  --m: url(/icons/mana.svg);\n  color: #3b82f6;\n}\n.ico-attack {\n  --m: url(/icons/attack.svg);\n  color: #fb7185;\n}\n.ico-reaction {\n  --m: url(/icons/reaction.svg);\n  color: #a78bfa;\n}\n.ico-turnspeed {\n  --m: url(/icons/turnspeed.svg);\n  color: #38bdf8;\n}\n.ico-movement {\n  --m: url(/icons/movement.svg);\n  color: #34d399;\n}\n.ico-stability {\n  --m: url(/icons/stability.svg);\n  color: #94a3b8;\n}\n.ico-effektivity {\n  --m: url(/icons/effektivity.svg);\n  color: #fbbf24;\n}\n.ico-grundbonus {\n  --m: url(/icons/grundbonus.svg);\n  color: #cbd5e1;\n}\n.ico-folder {\n  --m: url(/icons/folder.svg);\n  color: #eab308;\n}\n.npc-header {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 10px 20px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  flex-shrink: 0;\n}\n.npc-image-slot {\n  position: relative;\n  width: 48px;\n  height: 48px;\n  flex-shrink: 0;\n}\n.npc-image {\n  width: 48px;\n  height: 48px;\n  object-fit: cover;\n  border-radius: 8px;\n  border: 1px solid var(--border, #4a5568);\n}\n.npc-image-clear {\n  position: absolute;\n  top: -6px;\n  right: -6px;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #ef4444;\n  color: #fff;\n  border: none;\n  cursor: pointer;\n  font-size: 0.85rem;\n  line-height: 1;\n}\n.npc-image-upload {\n  width: 48px;\n  height: 48px;\n  border-radius: 8px;\n  border: 1px dashed var(--border, #6b7280);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  font-size: 0.6rem;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n}\n.npc-image-upload:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.npc-name {\n  flex: 1;\n  font-size: 1.1rem;\n  font-weight: 600;\n  padding: 8px 12px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  color: var(--text, #e5e7eb);\n}\n.npc-name:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-header-actions {\n  display: flex;\n  gap: 8px;\n}\n.npc-btn-save {\n  padding: 9px 24px;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border: none;\n  border-radius: 8px;\n  font-weight: 600;\n  cursor: pointer;\n}\n.npc-btn-save:hover {\n  filter: brightness(1.12);\n}\n.npc-btn-cancel {\n  padding: 9px 18px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n}\n.npc-btn-cancel:hover {\n  color: var(--text, #e5e7eb);\n}\n.npc-body {\n  flex: 1;\n  display: grid;\n  grid-template-columns: minmax(300px, 1.05fr) minmax(260px, 1fr) minmax(260px, 1fr);\n  overflow: hidden;\n}\n.npc-col {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 12px 14px;\n  overflow-y: auto;\n  min-height: 0;\n}\n.npc-col-values,\n.npc-col-current {\n  border-right: 1px solid var(--border, #4a5568);\n}\n.npc-card {\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 10px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.npc-card-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-card-title {\n  font-size: 0.86rem;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n.npc-hint {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n}\n.npc-budget {\n  font-size: 0.72rem;\n  font-weight: 600;\n  color: #f59e0b;\n  padding: 2px 9px;\n  border-radius: 12px;\n  background: rgba(245, 158, 11, 0.12);\n}\n.npc-budget-full {\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.05);\n}\n.npc-level-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.npc-level-row label {\n  font-size: 0.78rem;\n  font-weight: 600;\n}\n.npc-level-row input {\n  width: 76px;\n  padding: 5px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n}\n.npc-soul-list {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.npc-soul-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  padding: 4px 8px;\n  background: var(--bg, #1e293b);\n  border-radius: 7px;\n}\n.npc-soul-label {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 0.84rem;\n  font-weight: 600;\n}\n.npc-soul-ctrl {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n}\n.npc-soul-ctrl button {\n  width: 24px;\n  height: 24px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  color: var(--text, #e5e7eb);\n  font-size: 1rem;\n  line-height: 1;\n  cursor: pointer;\n}\n.npc-soul-ctrl button:hover:not(:disabled) {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-soul-ctrl button:disabled {\n  opacity: 0.3;\n  cursor: not-allowed;\n}\n.npc-soul-val {\n  min-width: 20px;\n  text-align: center;\n  font-weight: 700;\n}\n.npc-soul-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 6px;\n}\n.npc-soul-cell {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 6px 7px;\n  background: var(--bg, #1e293b);\n  border-radius: 7px;\n}\n.npc-soul-cell-head {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 5px;\n}\n.npc-soul-cell .npc-soul-label {\n  font-size: 0.72rem;\n}\n.npc-soul-bonus {\n  font-size: 0.74rem;\n  font-weight: 700;\n}\n.npc-soul-cell .npc-soul-ctrl {\n  justify-content: space-between;\n}\n.npc-soul-input {\n  width: 46px;\n  text-align: center;\n  padding: 4px 4px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-weight: 700;\n  font-size: 0.85rem;\n}\n.npc-soul-input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-budget-over {\n  color: #ef4444 !important;\n  background: rgba(239, 68, 68, 0.14) !important;\n}\n.npc-warn {\n  color: #ef4444;\n  font-weight: 600;\n}\n.npc-body-grid-2 {\n  grid-template-columns: 1fr 1fr;\n}\n.npc-modblock {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  border-top: 1px dashed var(--border, #4a5568);\n  padding-top: 8px;\n}\n.npc-section-label {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.03em;\n}\n.npc-mod-row {\n  display: grid;\n  grid-template-columns: 1fr auto auto auto;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 8px;\n  background: var(--bg, #1e293b);\n  border-radius: 6px;\n  font-size: 0.82rem;\n}\n.npc-mod-stat {\n  font-weight: 600;\n}\n.npc-mod-op {\n  color: #a78bfa;\n  font-weight: 700;\n}\n.npc-mod-eff {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n}\n.npc-mod-add {\n  display: grid;\n  grid-template-columns: 1fr 1fr 64px auto;\n  gap: 5px;\n  align-items: center;\n}\n.npc-mod-add select,\n.npc-mod-add input {\n  padding: 5px 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.8rem;\n  min-width: 0;\n}\n.npc-mod-add .npc-btn-add {\n  padding: 5px 10px;\n}\n.npc-derived-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  padding-top: 2px;\n}\n.npc-dv {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  background: var(--bg, #1e293b);\n  border-radius: 12px;\n  font-size: 0.8rem;\n  font-weight: 600;\n}\n.npc-body-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.npc-stat-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.npc-derived-extra {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}\n.npc-field {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.npc-field > span {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 0.66rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.02em;\n  white-space: nowrap;\n}\n.npc-body-grid .npc-field {\n  flex-direction: row;\n  align-items: center;\n  gap: 7px;\n}\n.npc-body-grid .ico {\n  width: 26px;\n  height: 26px;\n}\n.npc-stat-grid,\n.npc-derived-extra {\n  align-items: end;\n}\n.npc-field input {\n  width: 100%;\n  min-width: 0;\n  box-sizing: border-box;\n  padding: 5px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  text-align: center;\n}\n.npc-field input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-field input:disabled {\n  opacity: 0.4;\n}\n.npc-check {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 0.8rem;\n  cursor: pointer;\n}\n.npc-check input[type=checkbox] {\n  width: 15px;\n  height: 15px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.npc-overrides {\n  border-top: 1px dashed var(--border, #4a5568);\n  padding-top: 6px;\n}\n.npc-overrides summary {\n  cursor: pointer;\n  font-size: 0.78rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n}\n.npc-override-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  margin-top: 5px;\n}\n.npc-override-row input[type=number] {\n  width: 84px;\n  padding: 4px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  text-align: center;\n}\n.npc-sliders {\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n}\n.npc-slider {\n  display: grid;\n  grid-template-columns: 110px 1fr 110px;\n  align-items: center;\n  gap: 8px;\n}\n.npc-slider-l,\n.npc-slider-r {\n  font-size: 0.7rem;\n  color: var(--text-muted, #cbd5e1);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.npc-slider-l {\n  text-align: left;\n}\n.npc-slider-r {\n  text-align: right;\n}\n.npc-slider input[type=range] {\n  -webkit-appearance: none;\n  appearance: none;\n  height: 6px;\n  border-radius: 3px;\n  outline: none;\n  cursor: pointer;\n}\n.npc-slider input[type=range]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: #fff;\n  border: 2px solid #1e293b;\n  cursor: pointer;\n}\n.npc-slider input[type=range]::-moz-range-thumb {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: #fff;\n  border: 2px solid #1e293b;\n  cursor: pointer;\n}\n.npc-btn-ghost {\n  align-self: flex-start;\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.76rem;\n  cursor: pointer;\n}\n.npc-btn-ghost:hover {\n  color: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-btn-add {\n  padding: 4px 11px;\n  background: rgba(139, 92, 246, 0.16);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 6px;\n  color: var(--accent, #8b5cf6);\n  font-size: 0.76rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.npc-btn-add:hover {\n  background: rgba(139, 92, 246, 0.28);\n}\n.npc-chip-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.npc-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 6px 3px 9px;\n  border-radius: 12px;\n  font-size: 0.75rem;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid var(--border, #4a5568);\n}\n.npc-chip small {\n  opacity: 0.65;\n  font-size: 0.64rem;\n}\n.npc-chip button {\n  background: none;\n  border: none;\n  color: inherit;\n  cursor: pointer;\n  font-size: 0.9rem;\n  line-height: 1;\n  opacity: 0.7;\n}\n.npc-chip button:hover {\n  opacity: 1;\n  color: #ef4444;\n}\n.npc-item-list {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.npc-item-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 9px;\n  background: var(--bg, #1e293b);\n  border-radius: 7px;\n}\n.npc-item-name {\n  flex: 1;\n  font-size: 0.83rem;\n  font-weight: 600;\n}\n.npc-item-tag {\n  font-size: 0.64rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n}\n.npc-row-edit,\n.npc-row-del {\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 0.92rem;\n  padding: 0 3px;\n}\n.npc-row-edit {\n  color: var(--text-muted, #9ca3af);\n}\n.npc-row-edit:hover {\n  color: var(--accent, #8b5cf6);\n}\n.npc-row-del {\n  color: #ef4444;\n  opacity: 0.75;\n}\n.npc-row-del:hover {\n  opacity: 1;\n}\n.npc-empty {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n}\n.npc-preview-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.npc-preview {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 8px 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.npc-preview-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-preview-name {\n  font-size: 0.88rem;\n  font-weight: 700;\n}\n.npc-preview-actions {\n  display: flex;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.npc-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.npc-badge {\n  font-size: 0.66rem;\n  font-weight: 600;\n  padding: 2px 7px;\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.07);\n  color: var(--text-muted, #cbd5e1);\n}\n.npc-badge-cost {\n  background: rgba(59, 130, 246, 0.16);\n  color: #60a5fa;\n}\n.npc-badge-perp {\n  background: rgba(139, 92, 246, 0.18);\n  color: #a78bfa;\n}\n.npc-badge-script {\n  background: rgba(52, 211, 153, 0.16);\n  color: #34d399;\n}\n.npc-preview-desc {\n  font-size: 0.78rem;\n  color: var(--text-muted, #cbd5e1);\n  line-height: 1.4;\n  margin: 0;\n  white-space: pre-wrap;\n}\n.npc-bars {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.npc-bar {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  align-items: center;\n  gap: 7px;\n}\n.npc-bar-label {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n}\n.npc-bar-track {\n  height: 8px;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.08);\n  overflow: hidden;\n}\n.npc-bar-fill {\n  height: 100%;\n  border-radius: 4px;\n}\n.npc-bar-val {\n  font-size: 0.7rem;\n  font-weight: 600;\n}\n.npc-embed {\n  margin: -2px;\n}\n.npc-current-card,\n.npc-browser-card {\n  flex: 1;\n  min-height: 0;\n}\n.npc-tab-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-tab-head-actions {\n  display: flex;\n  gap: 6px;\n}\n.npc-btn-forge {\n  background: rgba(234, 179, 8, 0.16);\n  border-color: #eab308;\n  color: #eab308;\n}\n.npc-btn-forge:hover {\n  background: rgba(234, 179, 8, 0.28);\n}\n.npc-forge-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1600;\n  background: var(--bg, #1e293b);\n}\n.npc-embed-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  overflow-y: auto;\n  min-height: 0;\n  flex: 1;\n}\n.npc-embed-card {\n  position: relative;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 4px;\n  background: var(--bg, #1e293b);\n}\n.npc-embed-actions {\n  position: absolute;\n  top: 4px;\n  right: 4px;\n  z-index: 2;\n  display: flex;\n  gap: 3px;\n}\n.npc-embed-actions button {\n  width: 24px;\n  height: 24px;\n  border-radius: 5px;\n  border: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  color: var(--text-muted, #cbd5e1);\n  cursor: pointer;\n  font-size: 0.85rem;\n  line-height: 1;\n}\n.npc-embed-actions button:hover {\n  color: #fff;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-embed-actions button:last-child:hover {\n  color: #ef4444;\n  border-color: #ef4444;\n}\n.npc-tree-skill.selected {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.npc-info-box {\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  padding: 8px;\n  background: rgba(139, 92, 246, 0.06);\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.npc-info-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.npc-embed-bars {\n  padding: 6px 8px 4px;\n}\n.npc-notes {\n  min-height: 64px;\n  padding: 8px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-family: inherit;\n  font-size: 0.85rem;\n  resize: vertical;\n}\n.npc-notes:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-browser-card {\n  flex: 1;\n  min-height: 0;\n}\n.npc-tabs,\n.npc-subtabs {\n  display: flex;\n  gap: 4px;\n}\n.npc-tabs button,\n.npc-subtabs button {\n  flex: 1;\n  padding: 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.76rem;\n  cursor: pointer;\n}\n.npc-tabs button.active,\n.npc-subtabs button.active {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.npc-subtabs button {\n  font-size: 0.72rem;\n  padding: 4px;\n}\n.npc-search {\n  padding: 6px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.84rem;\n}\n.npc-search:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.npc-scroll {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  overflow-y: auto;\n  min-height: 0;\n  flex: 1;\n}\n.npc-tree-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 6px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-left-width: 3px;\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.npc-tree-head small {\n  opacity: 0.6;\n  font-size: 0.64rem;\n}\n.npc-folder-head {\n  border-left-color: #eab308;\n}\n.npc-folder-head span {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n}\n.npc-tree-skills {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  padding: 4px 0 6px 12px;\n}\n.npc-tree-skill {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 9px;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 5px;\n  color: var(--text-muted, #cbd5e1);\n  font-size: 0.79rem;\n  cursor: pointer;\n  text-align: left;\n}\n.npc-tree-skill:hover {\n  background: var(--card, #2d3748);\n}\n.npc-tree-skill.picked {\n  color: #34d399;\n  font-weight: 600;\n}\n.npc-lib-list {\n  flex-wrap: wrap;\n}\n.npc-lib-item {\n  padding: 5px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.77rem;\n  cursor: pointer;\n  text-align: left;\n}\n.npc-lib-item:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.tier-1 {\n  border-left-color: #9ca3af;\n}\n.tier-2 {\n  border-left-color: #34d399;\n}\n.tier-3 {\n  border-left-color: #38bdf8;\n}\n.tier-4 {\n  border-left-color: #a78bfa;\n}\n.tier-5 {\n  border-left-color: #f59e0b;\n}\n.npc-chip.tier-2 {\n  border-color: rgba(52, 211, 153, 0.5);\n}\n.npc-chip.tier-3 {\n  border-color: rgba(56, 189, 248, 0.5);\n}\n.npc-chip.tier-4 {\n  border-color: rgba(167, 139, 250, 0.5);\n}\n.npc-chip.tier-5 {\n  border-color: rgba(245, 158, 11, 0.5);\n}\n@media (max-width: 1000px) {\n  .npc-body {\n    grid-template-columns: 1fr;\n    overflow-y: auto;\n  }\n  .npc-col {\n    overflow-y: visible;\n  }\n  .npc-col-values,\n  .npc-col-current {\n    border-right: none;\n    border-bottom: 1px solid var(--border, #4a5568);\n  }\n  .npc-browser-card {\n    flex: none;\n  }\n  .npc-scroll {\n    max-height: 340px;\n  }\n}\n.npc-soul-growth {\n  display: block;\n  text-align: center;\n  font-size: 0.6rem;\n  color: #93c5fd;\n  margin-top: 2px;\n}\n/*# sourceMappingURL=npc-editor.component.css.map */\n"] }]
  }], null, { statblock: [{
    type: Input
  }], availableSpells: [{
    type: Input
  }], availableItems: [{
    type: Input
  }], availableSkills: [{
    type: Input
  }], availableRunes: [{
    type: Input
  }], soulLocked: [{
    type: Input
  }], availableMaterials: [{
    type: Input
  }], availableForgeTraits: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NpcEditorComponent, { className: "NpcEditorComponent", filePath: "app/shared/npc-editor/npc-editor.component.ts", lineNumber: 57 });
})();

export {
  NpcEditorComponent
};
//# sourceMappingURL=chunk-FLX2T2TN.js.map
