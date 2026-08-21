import {
  CLASS_DEFINITIONS,
  FLOW_COLOR,
  KeywordEnhancer,
  NEUTRAL_RUNE_ID,
  SKILL_DEFINITIONS,
  SPELL_GLOW_COLORS,
  SPELL_ICON_SYMBOLS,
  SPELL_TAG_OPTIONS,
  SUMMON_RUNE_ID,
  ScriptEditorComponent,
  TrueStatsService,
  actionMacroToScript,
  buildRunePorts,
  calculateSpellCost,
  createEmptyActionMacro,
  createPlayerContext,
  generateSpellId,
  getEquipSlot,
  macroActionToScript,
  runScript
} from "./chunk-BNPZFNFF.js";
import {
  ImageUrlPipe
} from "./chunk-6EXL6IWA.js";
import {
  ImageService
} from "./chunk-7RNBGZ3X.js";
import {
  FormulaType
} from "./chunk-SVTPZQLG.js";
import {
  CheckboxControlValueAccessor,
  DefaultValueAccessor,
  FormsModule,
  MaxValidator,
  MinValidator,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  NumberValueAccessor,
  RangeValueAccessor,
  RequiredValidator,
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-VMGRJE2Y.js";
import {
  TALENT_DEFINITIONS
} from "./chunk-P2J6DNXL.js";
import {
  DomSanitizer
} from "./chunk-YJYDFJW3.js";
import {
  CommonModule,
  DecimalPipe,
  NgForOf,
  NgIf
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Injectable,
  Input,
  Output,
  ViewChild,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdeclareLet,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinterpolate1,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceHTML,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵqueryRefresh,
  ɵɵreadContextLet,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵsanitizeUrl,
  ɵɵstoreLet,
  ɵɵstyleMap,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate3,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuery
} from "./chunk-XJL25EXC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/shared/skill-editor/skill-editor.component.ts
var _c0 = () => ["strength", "dexterity", "speed", "intelligence", "constitution", "chill"];
var _c1 = () => ["mana", "life", "energy"];
var _forTrack0 = ($index, $item) => $item.value;
var _forTrack1 = ($index, $item) => $item.id;
function SkillEditorComponent_For_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 37);
    \u0275\u0275listener("click", function SkillEditorComponent_For_22_Template_button_click_0_listener() {
      const src_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.setSource(src_r2.value));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const src_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("se-tab-active", ctx_r2.skillSource === src_r2.value);
    \u0275\u0275attribute("data-src", src_r2.value);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", src_r2.icon, " ", src_r2.label, " ");
  }
}
function SkillEditorComponent_For_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 38);
    \u0275\u0275listener("click", function SkillEditorComponent_For_28_Template_button_click_0_listener() {
      const t_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.setType(t_r5.value));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r5 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("se-pill-active", ctx_r2.editSkill.type === t_r5.value);
    \u0275\u0275attribute("data-type", t_r5.value);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", t_r5.icon, " ", t_r5.label, " ");
  }
}
function SkillEditorComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "label", 7);
    \u0275\u0275text(2, "Aktionstyp");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 29);
    \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Conditional_34_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r2.editSkill.actionType, $event) || (ctx_r2.editSkill.actionType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(4, "option", 39);
    \u0275\u0275text(5, "\u2014 kein \u2014");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "option", 40);
    \u0275\u0275text(7, "\u2694 Aktion");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "option", 41);
    \u0275\u0275text(9, "\u2726 Bonusaktion");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "option", 42);
    \u0275\u0275text(11, "\u25CE Keine Aktion");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "option", 43);
    \u0275\u0275text(13, "\u21A9 Reaktion");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editSkill.actionType);
  }
}
function SkillEditorComponent_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 17)(1, "label", 44)(2, "input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Conditional_35_Template_input_ngModelChange_2_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r2 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r2.editSkill.enlightened, $event) || (ctx_r2.editSkill.enlightened = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4, "\u2726 Erleuchtet ");
    \u0275\u0275elementStart(5, "span", 21);
    \u0275\u0275text(6, "(kein Klassenrang n\xF6tig)");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editSkill.enlightened);
  }
}
function SkillEditorComponent_Conditional_36_Conditional_9_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "label", 7);
    \u0275\u0275text(2, "Menge");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 54);
    \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Conditional_36_Conditional_9_Conditional_13_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r2 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r2.editCostAmount, $event) || (ctx_r2.editCostAmount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 55)(5, "label", 44)(6, "input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Conditional_36_Conditional_9_Conditional_13_Template_input_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r2 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r2.editCostPerRound, $event) || (ctx_r2.editCostPerRound = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span");
    \u0275\u0275text(8, "Pro Runde");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editCostAmount);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editCostPerRound);
  }
}
function SkillEditorComponent_Conditional_36_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 49)(1, "div", 6)(2, "label", 7);
    \u0275\u0275text(3, "Ressource");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "select", 29);
    \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Conditional_36_Conditional_9_Template_select_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r2 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r2.editCostType, $event) || (ctx_r2.editCostType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(5, "option", 39);
    \u0275\u0275text(6, "Keine");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "option", 51);
    \u0275\u0275text(8, "\u{1F4A7} Mana");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "option", 52);
    \u0275\u0275text(10, "\u26A1 Ausdauer");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "option", 53);
    \u0275\u0275text(12, "\u2764 Leben");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(13, SkillEditorComponent_Conditional_36_Conditional_9_Conditional_13_Template, 9, 2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editCostType);
    \u0275\u0275advance(9);
    \u0275\u0275conditional(ctx_r2.editCostType ? 13 : -1);
  }
}
function SkillEditorComponent_Conditional_36_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 50)(1, "p", 21);
    \u0275\u0275text(2, " Aktionsmakro. ");
    \u0275\u0275elementStart(3, "code");
    \u0275\u0275text(4, "onTrigger");
    \u0275\u0275elementEnd();
    \u0275\u0275text(5, "-Code l\xE4uft beim Aktivieren; ");
    \u0275\u0275elementStart(6, "code");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275text(8, " gilt, solange die F\xE4higkeit im Aktiv-Tab aktiv ist (wie ein Status). ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 56)(10, "app-script-editor", 57);
    \u0275\u0275listener("valueChange", function SkillEditorComponent_Conditional_36_Conditional_10_Template_app_script_editor_valueChange_10_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.editSkill.script = $event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate2("effectActive ", "{", " \u2026 ", "}");
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r2.editSkill.script || "");
  }
}
function SkillEditorComponent_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 18)(1, "div", 46)(2, "span", 20);
    \u0275\u0275text(3, "Aktivierung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 47)(5, "button", 48);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_36_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.disableMacroMode());
    });
    \u0275\u0275text(6, " \u{1F4B0} Kosten ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 48);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_36_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.enableMacroMode());
    });
    \u0275\u0275text(8, " \u2699 Skript ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(9, SkillEditorComponent_Conditional_36_Conditional_9_Template, 14, 2, "div", 49);
    \u0275\u0275conditionalCreate(10, SkillEditorComponent_Conditional_36_Conditional_10_Template, 11, 3, "div", 50);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275classProp("active", !ctx_r2.macroMode);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r2.macroMode);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(!ctx_r2.macroMode ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.macroMode ? 10 : -1);
  }
}
function SkillEditorComponent_Conditional_37_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "span", 61);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 62)(4, "button", 63);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_37_For_5_Template_button_click_4_listener() {
      const stat_r13 = \u0275\u0275restoreView(_r12).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.decrementStat(stat_r13));
    });
    \u0275\u0275text(5, "\u2212");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 64);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 63);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_37_For_5_Template_button_click_8_listener() {
      const stat_r13 = \u0275\u0275restoreView(_r12).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.incrementStat(stat_r13));
    });
    \u0275\u0275text(9, "+");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const stat_r13 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getStatLabel(stat_r13));
    \u0275\u0275advance(4);
    \u0275\u0275classProp("pos", ctx_r2.statModifiers[stat_r13] > 0)("neg", ctx_r2.statModifiers[stat_r13] < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r2.statModifiers[stat_r13] > 0 ? "+" : "", "", ctx_r2.statModifiers[stat_r13], " ");
  }
}
function SkillEditorComponent_Conditional_37_For_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "span", 61);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 62)(4, "button", 63);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_37_For_11_Template_button_click_4_listener() {
      const stat_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.decrementStat(stat_r15));
    });
    \u0275\u0275text(5, "\u2212");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 64);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 63);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_37_For_11_Template_button_click_8_listener() {
      const stat_r15 = \u0275\u0275restoreView(_r14).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.incrementStat(stat_r15));
    });
    \u0275\u0275text(9, "+");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const stat_r15 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getStatLabel(stat_r15));
    \u0275\u0275advance(4);
    \u0275\u0275classProp("pos", ctx_r2.statModifiers[stat_r15] > 0)("neg", ctx_r2.statModifiers[stat_r15] < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r2.statModifiers[stat_r15] > 0 ? "+" : "", "", ctx_r2.statModifiers[stat_r15], " ");
  }
}
function SkillEditorComponent_Conditional_37_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18)(1, "span", 20);
    \u0275\u0275text(2, "Stat-Boni");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 58);
    \u0275\u0275repeaterCreate(4, SkillEditorComponent_Conditional_37_For_5_Template, 10, 7, "div", 59, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 18)(7, "span", 20);
    \u0275\u0275text(8, "Ressourcen-Boni");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 60);
    \u0275\u0275repeaterCreate(10, SkillEditorComponent_Conditional_37_For_11_Template, 10, 7, "div", 59, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275advance(4);
    \u0275\u0275repeater(\u0275\u0275pureFunction0(0, _c0));
    \u0275\u0275advance(6);
    \u0275\u0275repeater(\u0275\u0275pureFunction0(1, _c1));
  }
}
function SkillEditorComponent_Conditional_38_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 18)(1, "span", 20);
    \u0275\u0275text(2, "Aktionsmakro / Skript");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 21);
    \u0275\u0275text(4, " Passiv \u2014 immer aktiv. ");
    \u0275\u0275elementStart(5, "code");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275text(7, " gilt dauerhaft, solange die F\xE4higkeit vorhanden ist. (Optional) ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 56)(9, "app-script-editor", 57);
    \u0275\u0275listener("valueChange", function SkillEditorComponent_Conditional_38_Template_app_script_editor_valueChange_9_listener($event) {
      \u0275\u0275restoreView(_r16);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.editSkill.script = $event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate2("effectActive ", "{", " \u2026 ", "}");
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r2.editSkill.script || "");
  }
}
function SkillEditorComponent_Conditional_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19)(1, "span", 65);
    \u0275\u0275text(2, "\u{1F3B2}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4, "W\xFCrfelbonus \u2014 wird beim W\xFCrfeln automatisch angewendet.");
    \u0275\u0275elementEnd()();
  }
}
function SkillEditorComponent_Conditional_45_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 66);
    \u0275\u0275element(1, "span", 67);
    \u0275\u0275elementStart(2, "span", 68);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 69);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 70);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_45_For_2_Template_button_click_6_listener() {
      const \u0275$index_257_r18 = \u0275\u0275restoreView(_r17).$index;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.removeCounter(\u0275$index_257_r18));
    });
    \u0275\u0275text(7, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const counter_r19 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", counter_r19.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(counter_r19.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", counter_r19.min, "\u2013", counter_r19.max);
  }
}
function SkillEditorComponent_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275repeaterCreate(1, SkillEditorComponent_Conditional_45_For_2_Template, 8, 5, "div", 66, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.editSkill.counters);
  }
}
function SkillEditorComponent_For_66_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 30);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const color_r20 = ctx.$implicit;
    \u0275\u0275property("value", color_r20);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(color_r20);
  }
}
function SkillEditorComponent_Conditional_70_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 71);
    \u0275\u0275listener("click", function SkillEditorComponent_Conditional_70_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r21);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.deleteSkill());
    });
    \u0275\u0275text(1, "L\xF6schen");
    \u0275\u0275elementEnd();
  }
}
var SkillEditorComponent = class _SkillEditorComponent {
  skill = null;
  save = new EventEmitter();
  cancel = new EventEmitter();
  delete = new EventEmitter();
  editSkill;
  isNewSkill = true;
  // Cost editing state
  editCostType = "";
  editCostAmount = 0;
  editCostPerRound = false;
  // Script mode (active skills): the "Aktionsmakro" toggle now edits a FailScript.
  macroMode = false;
  // Custom counter bars (same as items). New counter being composed.
  newCounter = { id: "", name: "", min: 0, max: 10, current: 0, color: "#22c55e" };
  counterColors = [
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#6b7280"
  ];
  /** Restores background scroll on close (locked while the fullscreen editor is open). */
  prevBodyOverflow = "";
  statModifiers = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    constitution: 0,
    chill: 0,
    mana: 0,
    life: 0,
    energy: 0
  };
  skillTypes = [
    { value: "active", label: "Aktiv", icon: "\u26A1" },
    { value: "passive", label: "Passiv", icon: "\u{1F52E}" },
    { value: "dice_bonus", label: "W\xFCrfelbonus", icon: "\u{1F3B2}" },
    { value: "stat_bonus", label: "Stat-Bonus", icon: "\u{1F4C8}" }
  ];
  sourceOptions = [
    { value: "class", label: "Klasse", icon: "\u2694\uFE0F" },
    { value: "race", label: "Rasse", icon: "\u{1F9EC}" },
    { value: "custom", label: "Benutzerdefiniert", icon: "\u2728" }
  ];
  ngOnInit() {
    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (this.skill) {
      this.editSkill = JSON.parse(JSON.stringify(this.skill));
      this.isNewSkill = false;
      if (!this.editSkill.skillSource) {
        this.editSkill.skillSource = this.editSkill.sourceRaceId ? "race" : "class";
      }
      if (this.editSkill.statModifiers) {
        for (const mod of this.editSkill.statModifiers) {
          this.statModifiers[mod.stat] = mod.amount;
        }
      }
      if (this.editSkill.cost) {
        this.editCostType = this.editSkill.cost.type;
        this.editCostAmount = this.editSkill.cost.amount;
        this.editCostPerRound = this.editSkill.cost.perRound ?? false;
      }
      if (this.editSkill.script || this.editSkill.embeddedMacroAction || this.editSkill.embeddedMacro) {
        this.macroMode = true;
        if (!this.editSkill.script) {
          this.editSkill.script = this.editSkill.embeddedMacroAction ? macroActionToScript(this.editSkill.embeddedMacroAction) : this.editSkill.embeddedMacro ? actionMacroToScript(this.editSkill.embeddedMacro) : "";
        }
      }
    } else {
      this.editSkill = {
        name: "",
        class: "Allgemein",
        description: "",
        type: "passive",
        enlightened: false,
        skillSource: "class"
      };
    }
  }
  ngOnDestroy() {
    document.body.style.overflow = this.prevBodyOverflow;
  }
  get skillSource() {
    return this.editSkill.skillSource ?? "class";
  }
  // === Counter (custom bar) methods — same behaviour as the item editor ===
  addCounter() {
    if (!this.newCounter.name.trim())
      return;
    if (!this.editSkill.counters)
      this.editSkill.counters = [];
    this.editSkill.counters.push({
      id: "counter_" + Date.now(),
      name: this.newCounter.name.trim(),
      min: this.newCounter.min,
      max: this.newCounter.max,
      current: this.newCounter.current,
      color: this.newCounter.color
    });
    this.newCounter = { id: "", name: "", min: 0, max: 10, current: 0, color: "#22c55e" };
  }
  removeCounter(index) {
    this.editSkill.counters?.splice(index, 1);
  }
  setSource(src) {
    this.editSkill.skillSource = src;
    if (src !== "class") {
      this.editSkill.enlightened = false;
    }
  }
  setType(type) {
    this.editSkill.type = type;
    if (type !== "active") {
      this.macroMode = false;
    }
  }
  enableMacroMode() {
    this.macroMode = true;
    if (!this.editSkill.script)
      this.editSkill.script = "";
  }
  disableMacroMode() {
    this.macroMode = false;
  }
  saveSkill() {
    const modifiers = [];
    for (const [stat, amount] of Object.entries(this.statModifiers)) {
      if (amount !== 0) {
        modifiers.push({ stat, amount });
      }
    }
    if (this.editSkill.type === "stat_bonus") {
      this.editSkill.statModifiers = modifiers.length > 0 ? modifiers : void 0;
    } else {
      const statOnly = modifiers.filter((m) => !["mana", "life", "energy"].includes(m.stat));
      this.editSkill.statModifiers = statOnly.length > 0 ? statOnly : void 0;
    }
    if (this.editSkill.counters && this.editSkill.counters.length === 0) {
      this.editSkill.counters = void 0;
    }
    if (this.editSkill.type === "active") {
      if (this.macroMode) {
        this.editSkill.embeddedMacroAction = void 0;
        this.editSkill.embeddedMacro = void 0;
        this.editSkill.cost = void 0;
      } else if (this.editCostType) {
        this.editSkill.cost = {
          type: this.editCostType,
          amount: this.editCostAmount,
          perRound: this.editCostPerRound || void 0
        };
        this.editSkill.script = void 0;
        this.editSkill.embeddedMacroAction = void 0;
        this.editSkill.embeddedMacro = void 0;
      } else {
        this.editSkill.cost = void 0;
        this.editSkill.script = void 0;
        this.editSkill.embeddedMacroAction = void 0;
        this.editSkill.embeddedMacro = void 0;
      }
    } else if (this.editSkill.type === "passive") {
      this.editSkill.cost = void 0;
      this.editSkill.actionType = void 0;
      this.editSkill.embeddedMacroAction = void 0;
      this.editSkill.embeddedMacro = void 0;
      if (!this.editSkill.script?.trim())
        this.editSkill.script = void 0;
    } else {
      this.editSkill.cost = void 0;
      this.editSkill.actionType = void 0;
      this.editSkill.script = void 0;
      this.editSkill.embeddedMacroAction = void 0;
      this.editSkill.embeddedMacro = void 0;
    }
    this.editSkill.perpetual = void 0;
    this.save.emit(this.editSkill);
  }
  cancelEdit() {
    this.cancel.emit();
  }
  deleteSkill() {
    if (confirm("F\xE4higkeit wirklich l\xF6schen?")) {
      this.delete.emit();
    }
  }
  incrementStat(stat) {
    this.statModifiers[stat]++;
  }
  decrementStat(stat) {
    this.statModifiers[stat]--;
  }
  getStatLabel(stat) {
    const labels = {
      strength: "St\xE4rke",
      dexterity: "Geschick",
      speed: "Tempo",
      intelligence: "Intelligenz",
      constitution: "Konstitution",
      chill: "Wille",
      mana: "Mana",
      life: "Leben",
      energy: "Ausdauer"
    };
    return labels[stat] || stat;
  }
  static \u0275fac = function SkillEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SkillEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SkillEditorComponent, selectors: [["app-skill-editor"]], inputs: { skill: "skill" }, outputs: { save: "save", cancel: "cancel", delete: "delete" }, decls: 76, vars: 22, consts: [[1, "se-overlay"], [1, "se-modal"], [1, "se-header"], [1, "se-close", 3, "click"], [1, "se-body"], [1, "se-col", "se-col-left"], [1, "se-field"], [1, "se-label"], ["type", "text", "placeholder", "F\xE4higkeitsname...", 1, "se-input", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. K\xE4mpfer, Magier, Allgemein...", 1, "se-input", 3, "ngModelChange", "ngModel"], [1, "se-tabs"], [1, "se-tab", 3, "se-tab-active"], [1, "se-type-pills"], [1, "se-pill", 3, "se-pill-active"], [1, "se-field", "se-field-flex"], ["placeholder", "Beschreibung der F\xE4higkeit...", 1, "se-textarea", 3, "ngModelChange", "ngModel"], [1, "se-col", "se-col-right"], [1, "se-field", "se-field-check"], [1, "se-section"], [1, "se-info"], [1, "se-section-title"], [1, "se-hint"], [1, "se-counter-list"], [1, "se-counter-add"], ["type", "text", "placeholder", "Name, z.B. Ladungen", 1, "se-input", "se-counter-field", 3, "ngModelChange", "ngModel"], [1, "se-counter-nums"], [1, "se-counter-num"], ["type", "number", 1, "se-input", 3, "ngModelChange", "ngModel"], [1, "se-counter-num", "se-counter-color"], [1, "se-select", 3, "ngModelChange", "ngModel"], [3, "value"], [1, "se-btn-add-counter", 3, "click", "disabled"], [1, "se-footer"], [1, "se-btn-del"], [1, "se-footer-right"], [1, "se-btn-cancel", 3, "click"], [1, "se-btn-save", 3, "click", "disabled"], [1, "se-tab", 3, "click"], [1, "se-pill", 3, "click"], ["value", ""], ["value", "Aktion"], ["value", "Bonusaktion"], ["value", "Keine Aktion"], ["value", "Reaktion"], [1, "se-check-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "se-section-header"], [1, "se-toggle"], [1, "se-tog-btn", 3, "click"], [1, "se-cost-row"], [1, "se-macro-block"], ["value", "mana"], ["value", "energy"], ["value", "life"], ["type", "number", "min", "0", 1, "se-input", 3, "ngModelChange", "ngModel"], [1, "se-field", "se-field-check", "se-field-perround"], [1, "se-script-host"], [3, "valueChange", "value"], [1, "se-stat-grid"], [1, "se-stat-item"], [1, "se-stat-grid", "se-stat-grid-3"], [1, "se-stat-name"], [1, "se-stat-ctrl"], [1, "se-stat-btn", 3, "click"], [1, "se-stat-val"], [1, "se-info-icon"], [1, "se-counter-row"], [1, "se-counter-dot"], [1, "se-counter-name"], [1, "se-counter-range"], [1, "se-counter-del", 3, "click"], [1, "se-btn-del", 3, "click"]], template: function SkillEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h2");
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "button", 3);
      \u0275\u0275listener("click", function SkillEditorComponent_Template_button_click_5_listener() {
        return ctx.cancelEdit();
      });
      \u0275\u0275text(6, "\xD7");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "div", 4)(8, "div", 5)(9, "div", 6)(10, "label", 7);
      \u0275\u0275text(11, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "input", 8);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_input_ngModelChange_12_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editSkill.name, $event) || (ctx.editSkill.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "div", 6)(14, "label", 7);
      \u0275\u0275text(15, "Klasse / Kategorie");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_input_ngModelChange_16_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editSkill.class, $event) || (ctx.editSkill.class = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "div", 6)(18, "label", 7);
      \u0275\u0275text(19, "Quelle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "div", 10);
      \u0275\u0275repeaterCreate(21, SkillEditorComponent_For_22_Template, 2, 5, "button", 11, _forTrack0);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(23, "div", 6)(24, "label", 7);
      \u0275\u0275text(25, "Typ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "div", 12);
      \u0275\u0275repeaterCreate(27, SkillEditorComponent_For_28_Template, 2, 5, "button", 13, _forTrack0);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(29, "div", 14)(30, "label", 7);
      \u0275\u0275text(31, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "textarea", 15);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_textarea_ngModelChange_32_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editSkill.description, $event) || (ctx.editSkill.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(33, "div", 16);
      \u0275\u0275conditionalCreate(34, SkillEditorComponent_Conditional_34_Template, 14, 1, "div", 6);
      \u0275\u0275conditionalCreate(35, SkillEditorComponent_Conditional_35_Template, 7, 1, "div", 17);
      \u0275\u0275conditionalCreate(36, SkillEditorComponent_Conditional_36_Template, 11, 6, "div", 18);
      \u0275\u0275conditionalCreate(37, SkillEditorComponent_Conditional_37_Template, 12, 2);
      \u0275\u0275conditionalCreate(38, SkillEditorComponent_Conditional_38_Template, 10, 3, "div", 18);
      \u0275\u0275conditionalCreate(39, SkillEditorComponent_Conditional_39_Template, 5, 0, "div", 19);
      \u0275\u0275elementStart(40, "div", 18)(41, "span", 20);
      \u0275\u0275text(42, "\u{1F4CA} Eigene Leisten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "p", 21);
      \u0275\u0275text(44, "Beliebige Z\xE4hler/Balken, die angezeigt werden, solange die F\xE4higkeit aktiv ist (z.B. Ladungen).");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(45, SkillEditorComponent_Conditional_45_Template, 3, 0, "div", 22);
      \u0275\u0275elementStart(46, "div", 23)(47, "input", 24);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_input_ngModelChange_47_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.name, $event) || (ctx.newCounter.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "div", 25)(49, "label", 26)(50, "span");
      \u0275\u0275text(51, "Min");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "input", 27);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_input_ngModelChange_52_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.min, $event) || (ctx.newCounter.min = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(53, "label", 26)(54, "span");
      \u0275\u0275text(55, "Max");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "input", 27);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_input_ngModelChange_56_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.max, $event) || (ctx.newCounter.max = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(57, "label", 26)(58, "span");
      \u0275\u0275text(59, "Start");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(60, "input", 27);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_input_ngModelChange_60_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.current, $event) || (ctx.newCounter.current = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(61, "label", 28)(62, "span");
      \u0275\u0275text(63, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(64, "select", 29);
      \u0275\u0275twoWayListener("ngModelChange", function SkillEditorComponent_Template_select_ngModelChange_64_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.color, $event) || (ctx.newCounter.color = $event);
        return $event;
      });
      \u0275\u0275repeaterCreate(65, SkillEditorComponent_For_66_Template, 2, 2, "option", 30, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(67, "button", 31);
      \u0275\u0275listener("click", function SkillEditorComponent_Template_button_click_67_listener() {
        return ctx.addCounter();
      });
      \u0275\u0275text(68, "+ Leiste");
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(69, "div", 32);
      \u0275\u0275conditionalCreate(70, SkillEditorComponent_Conditional_70_Template, 2, 0, "button", 33);
      \u0275\u0275elementStart(71, "div", 34)(72, "button", 35);
      \u0275\u0275listener("click", function SkillEditorComponent_Template_button_click_72_listener() {
        return ctx.cancelEdit();
      });
      \u0275\u0275text(73, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(74, "button", 36);
      \u0275\u0275listener("click", function SkillEditorComponent_Template_button_click_74_listener() {
        return ctx.saveSkill();
      });
      \u0275\u0275text(75);
      \u0275\u0275elementEnd()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isNewSkill ? "Neue F\xE4higkeit" : "F\xE4higkeit bearbeiten");
      \u0275\u0275advance(8);
      \u0275\u0275classProp("se-invalid", !ctx.editSkill.name.trim());
      \u0275\u0275twoWayProperty("ngModel", ctx.editSkill.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editSkill.class);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.sourceOptions);
      \u0275\u0275advance(6);
      \u0275\u0275repeater(ctx.skillTypes);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.editSkill.description);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.editSkill.type === "active" ? 34 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.skillSource === "class" ? 35 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.editSkill.type === "active" ? 36 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.editSkill.type === "stat_bonus" ? 37 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.editSkill.type === "passive" ? 38 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.editSkill.type === "dice_bonus" ? 39 : -1);
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.editSkill.counters && ctx.editSkill.counters.length > 0 ? 45 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.name);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.min);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.max);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.current);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.color);
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.counterColors);
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", !ctx.newCounter.name.trim());
      \u0275\u0275advance(3);
      \u0275\u0275conditional(!ctx.isNewSkill ? 70 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", !ctx.editSkill.name.trim());
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isNewSkill ? "Erstellen" : "Speichern", " ");
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel, ScriptEditorComponent], styles: ["\n\n.se-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.75);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1600;\n}\n.se-modal[_ngcontent-%COMP%] {\n  background: var(--card, #2d3748);\n  border-radius: 0;\n  width: 100vw;\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: none;\n  border: none;\n  overflow: hidden;\n}\n.se-body[_ngcontent-%COMP%] {\n  max-width: 1400px;\n  width: 100%;\n  margin: 0 auto;\n}\n.se-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 22px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  flex-shrink: 0;\n}\n.se-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.15rem;\n  color: var(--text, #e5e7eb);\n  font-weight: 600;\n}\n.se-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 1.6rem;\n  line-height: 1;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  padding: 0 6px;\n  transition: color 0.15s;\n}\n.se-close[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e5e7eb);\n}\n.se-body[_ngcontent-%COMP%] {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  overflow: hidden;\n}\n.se-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 18px 20px;\n  overflow-y: auto;\n}\n.se-col-left[_ngcontent-%COMP%] {\n  border-right: 1px solid var(--border, #4a5568);\n}\n.se-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.se-field-flex[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 80px;\n}\n.se-label[_ngcontent-%COMP%] {\n  font-size: 0.73rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.se-input[_ngcontent-%COMP%], \n.se-select[_ngcontent-%COMP%] {\n  padding: 7px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  font-family: inherit;\n  transition: border-color 0.15s;\n}\n.se-input[_ngcontent-%COMP%]:focus, \n.se-select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.se-invalid[_ngcontent-%COMP%] {\n  border-color: #ef4444 !important;\n}\n.se-textarea[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 9px 11px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  font-family: inherit;\n  resize: none;\n  transition: border-color 0.15s;\n}\n.se-textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.se-input-area[_ngcontent-%COMP%] {\n  resize: vertical;\n  min-height: 56px;\n}\n.se-color[_ngcontent-%COMP%] {\n  height: 34px;\n  padding: 2px 4px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  cursor: pointer;\n  width: 60px;\n}\n.se-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 5px;\n}\n.se-tab[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  cursor: pointer;\n  text-align: center;\n  transition: all 0.15s;\n}\n.se-tab[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e5e7eb);\n}\n.se-tab-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.se-tab[data-src=class].se-tab-active[_ngcontent-%COMP%] {\n  border-color: #f59e0b;\n  color: #f59e0b;\n  background: rgba(245, 158, 11, 0.12);\n}\n.se-tab[data-src=race].se-tab-active[_ngcontent-%COMP%] {\n  border-color: #34d399;\n  color: #34d399;\n  background: rgba(52, 211, 153, 0.12);\n}\n.se-tab[data-src=custom].se-tab-active[_ngcontent-%COMP%] {\n  border-color: #a78bfa;\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.12);\n}\n.se-type-pills[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 5px;\n}\n.se-pill[_ngcontent-%COMP%] {\n  padding: 7px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.8rem;\n  cursor: pointer;\n  text-align: center;\n  transition: all 0.15s;\n}\n.se-pill[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e5e7eb);\n}\n.se-pill[data-type=active].se-pill-active[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.15);\n  border-color: #f59e0b;\n  color: #f59e0b;\n}\n.se-pill[data-type=passive].se-pill-active[_ngcontent-%COMP%] {\n  background: rgba(167, 139, 250, 0.15);\n  border-color: #a78bfa;\n  color: #a78bfa;\n}\n.se-pill[data-type=dice_bonus].se-pill-active[_ngcontent-%COMP%] {\n  background: rgba(52, 211, 153, 0.15);\n  border-color: #34d399;\n  color: #34d399;\n}\n.se-pill[data-type=stat_bonus].se-pill-active[_ngcontent-%COMP%] {\n  background: rgba(56, 189, 248, 0.15);\n  border-color: #38bdf8;\n  color: #38bdf8;\n}\n.se-field-check[_ngcontent-%COMP%] {\n  flex-direction: row;\n  align-items: center;\n}\n.se-check-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  color: var(--text, #e5e7eb);\n  font-size: 0.88rem;\n}\n.se-check-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 15px;\n  height: 15px;\n  accent-color: var(--accent, #8b5cf6);\n  cursor: pointer;\n  flex-shrink: 0;\n}\n.se-hint[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n}\n.se-field-perround[_ngcontent-%COMP%] {\n  flex: 0 0 auto !important;\n  justify-content: flex-end;\n  padding-bottom: 2px;\n}\n.se-field-color[_ngcontent-%COMP%] {\n  flex: 0 0 auto;\n}\n.se-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n  padding: 10px 12px;\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  border: 1px solid var(--border, #4a5568);\n}\n.se-section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n}\n.se-section-title[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.se-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n}\n.se-tog-btn[_ngcontent-%COMP%] {\n  padding: 3px 9px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-tog-btn.active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.se-cost-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n  flex-wrap: wrap;\n}\n.se-cost-row[_ngcontent-%COMP%]   .se-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 80px;\n}\n.se-macro-block[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.se-macro-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n}\n.se-macro-row[_ngcontent-%COMP%]   .se-field[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.se-stat-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 6px;\n}\n.se-stat-grid-3[_ngcontent-%COMP%] {\n  grid-template-columns: repeat(3, 1fr);\n}\n.se-stat-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 3px;\n  padding: 7px 4px;\n  background: rgba(255, 255, 255, 0.03);\n  border-radius: 6px;\n}\n.se-stat-name[_ngcontent-%COMP%] {\n  font-size: 0.67rem;\n  color: var(--text-muted, #9ca3af);\n  text-align: center;\n  line-height: 1.2;\n}\n.se-stat-ctrl[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.se-stat-btn[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n  font-size: 0.85rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.se-stat-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n}\n.se-stat-val[_ngcontent-%COMP%] {\n  min-width: 26px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 0.85rem;\n  color: var(--text, #e5e7eb);\n}\n.se-stat-val.pos[_ngcontent-%COMP%] {\n  color: #22c55e;\n}\n.se-stat-val.neg[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.se-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 12px 14px;\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  border: 1px solid var(--border, #4a5568);\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.85rem;\n  line-height: 1.5;\n}\n.se-info-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  flex-shrink: 0;\n}\n.se-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 20px;\n  border-top: 1px solid var(--border, #4a5568);\n  flex-shrink: 0;\n}\n.se-footer-right[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.se-btn-save[_ngcontent-%COMP%] {\n  padding: 8px 22px;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: filter 0.15s;\n}\n.se-btn-save[_ngcontent-%COMP%]:hover {\n  filter: brightness(1.12);\n}\n.se-btn-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n  filter: none;\n}\n.se-btn-cancel[_ngcontent-%COMP%] {\n  padding: 8px 18px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-btn-cancel[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e5e7eb);\n  border-color: var(--text-muted, #9ca3af);\n}\n.se-btn-del[_ngcontent-%COMP%] {\n  padding: 8px 18px;\n  background: transparent;\n  border: 1px solid #ef4444;\n  border-radius: 6px;\n  color: #ef4444;\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-btn-del[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.12);\n}\n.se-script-host[_ngcontent-%COMP%] {\n  height: 300px;\n  margin-top: 6px;\n}\n.se-perpetual[_ngcontent-%COMP%] {\n  align-items: flex-start;\n  padding: 8px 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n}\n.se-perpetual[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  margin-top: 2px;\n}\n.se-counter-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.se-counter-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border-radius: 6px;\n}\n.se-counter-dot[_ngcontent-%COMP%] {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.se-counter-name[_ngcontent-%COMP%] {\n  flex: 1;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.se-counter-range[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n}\n.se-counter-del[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #ef4444;\n  font-size: 1.15rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 4px;\n}\n.se-counter-del[_ngcontent-%COMP%]:hover {\n  color: #f87171;\n}\n.se-counter-add[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 4px;\n}\n.se-counter-field[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.se-counter-nums[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 6px;\n}\n.se-counter-num[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.se-counter-num[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.se-counter-num[_ngcontent-%COMP%]   .se-input[_ngcontent-%COMP%], \n.se-counter-num[_ngcontent-%COMP%]   .se-select[_ngcontent-%COMP%] {\n  padding: 5px 7px;\n  font-size: 0.82rem;\n  width: 100%;\n}\n.se-btn-add-counter[_ngcontent-%COMP%] {\n  align-self: flex-start;\n  padding: 6px 14px;\n  background: rgba(139, 92, 246, 0.18);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 6px;\n  color: var(--accent, #8b5cf6);\n  font-size: 0.82rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-btn-add-counter[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.3);\n}\n.se-btn-add-counter[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=skill-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SkillEditorComponent, [{
    type: Component,
    args: [{ selector: "app-skill-editor", standalone: true, imports: [CommonModule, FormsModule, ScriptEditorComponent], template: `<div class="se-overlay">
  <div class="se-modal">

    <!-- Header -->
    <div class="se-header">
      <h2>{{ isNewSkill ? 'Neue F&auml;higkeit' : 'F&auml;higkeit bearbeiten' }}</h2>
      <button class="se-close" (click)="cancelEdit()">&times;</button>
    </div>

    <!-- Body: 2 columns -->
    <div class="se-body">

      <!-- LEFT: Name, Source, Type, Description -->
      <div class="se-col se-col-left">

        <div class="se-field">
          <label class="se-label">Name</label>
          <input class="se-input" type="text" [(ngModel)]="editSkill.name"
                 [class.se-invalid]="!editSkill.name.trim()"
                 placeholder="F&auml;higkeitsname...">
        </div>

        <div class="se-field">
          <label class="se-label">Klasse / Kategorie</label>
          <input class="se-input" type="text" [(ngModel)]="editSkill.class"
                 placeholder="z.B. K&auml;mpfer, Magier, Allgemein...">
        </div>

        <div class="se-field">
          <label class="se-label">Quelle</label>
          <div class="se-tabs">
            @for (src of sourceOptions; track src.value) {
              <button class="se-tab"
                      [class.se-tab-active]="skillSource === src.value"
                      [attr.data-src]="src.value"
                      (click)="setSource(src.value)">
                {{ src.icon }} {{ src.label }}
              </button>
            }
          </div>
        </div>

        <div class="se-field">
          <label class="se-label">Typ</label>
          <div class="se-type-pills">
            @for (t of skillTypes; track t.value) {
              <button class="se-pill"
                      [attr.data-type]="t.value"
                      [class.se-pill-active]="editSkill.type === t.value"
                      (click)="setType(t.value)">
                {{ t.icon }} {{ t.label }}
              </button>
            }
          </div>
        </div>

        <div class="se-field se-field-flex">
          <label class="se-label">Beschreibung</label>
          <textarea class="se-textarea" [(ngModel)]="editSkill.description"
                    placeholder="Beschreibung der F&auml;higkeit..."></textarea>
        </div>

      </div>

      <!-- RIGHT: Type-specific options -->
      <div class="se-col se-col-right">

        <!-- Action Type (active only) -->
        @if (editSkill.type === 'active') {
          <div class="se-field">
            <label class="se-label">Aktionstyp</label>
            <select class="se-select" [(ngModel)]="editSkill.actionType">
              <option value="">&mdash; kein &mdash;</option>
              <option value="Aktion">&#x2694; Aktion</option>
              <option value="Bonusaktion">&#x2726; Bonusaktion</option>
              <option value="Keine Aktion">&#x25CE; Keine Aktion</option>
              <option value="Reaktion">&#x21A9; Reaktion</option>
            </select>
          </div>
        }

        <!-- Enlightened toggle (class skills only) -->
        @if (skillSource === 'class') {
          <div class="se-field se-field-check">
            <label class="se-check-label">
              <input type="checkbox" [(ngModel)]="editSkill.enlightened">
              <span>&#x2726; Erleuchtet <span class="se-hint">(kein Klassenrang n&ouml;tig)</span></span>
            </label>
          </div>
        }

        <!-- Active: Cost vs Macro -->
        @if (editSkill.type === 'active') {
          <div class="se-section">
            <div class="se-section-header">
              <span class="se-section-title">Aktivierung</span>
              <div class="se-toggle">
                <button class="se-tog-btn" [class.active]="!macroMode" (click)="disableMacroMode()">
                  &#x1F4B0; Kosten
                </button>
                <button class="se-tog-btn" [class.active]="macroMode" (click)="enableMacroMode()">
                  &#x2699; Skript
                </button>
              </div>
            </div>

            @if (!macroMode) {
              <div class="se-cost-row">
                <div class="se-field">
                  <label class="se-label">Ressource</label>
                  <select class="se-select" [(ngModel)]="editCostType">
                    <option value="">Keine</option>
                    <option value="mana">&#x1F4A7; Mana</option>
                    <option value="energy">&#x26A1; Ausdauer</option>
                    <option value="life">&#x2764; Leben</option>
                  </select>
                </div>
                @if (editCostType) {
                  <div class="se-field">
                    <label class="se-label">Menge</label>
                    <input class="se-input" type="number" [(ngModel)]="editCostAmount" min="0">
                  </div>
                  <div class="se-field se-field-check se-field-perround">
                    <label class="se-check-label">
                      <input type="checkbox" [(ngModel)]="editCostPerRound">
                      <span>Pro Runde</span>
                    </label>
                  </div>
                }
              </div>
            }

            @if (macroMode) {
              <div class="se-macro-block">
                <p class="se-hint">
                  Aktionsmakro. <code>onTrigger</code>-Code l\xE4uft beim Aktivieren;
                  <code>effectActive {{ '{' }} \u2026 {{ '}' }}</code> gilt, solange die F\xE4higkeit im Aktiv-Tab aktiv ist (wie ein Status).
                </p>
                <div class="se-script-host">
                  <app-script-editor
                    [value]="editSkill.script || ''"
                    (valueChange)="editSkill.script = $event">
                  </app-script-editor>
                </div>
              </div>
            }
          </div>
        }

        <!-- Stat modifiers (stat_bonus only) -->
        @if (editSkill.type === 'stat_bonus') {
          <div class="se-section">
            <span class="se-section-title">Stat-Boni</span>
            <div class="se-stat-grid">
              @for (stat of ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill']; track stat) {
                <div class="se-stat-item">
                  <span class="se-stat-name">{{ getStatLabel(stat) }}</span>
                  <div class="se-stat-ctrl">
                    <button class="se-stat-btn" (click)="decrementStat(stat)">&minus;</button>
                    <span class="se-stat-val"
                          [class.pos]="statModifiers[stat] > 0"
                          [class.neg]="statModifiers[stat] < 0">
                      {{ statModifiers[stat] > 0 ? '+' : '' }}{{ statModifiers[stat] }}
                    </span>
                    <button class="se-stat-btn" (click)="incrementStat(stat)">+</button>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="se-section">
            <span class="se-section-title">Ressourcen-Boni</span>
            <div class="se-stat-grid se-stat-grid-3">
              @for (stat of ['mana', 'life', 'energy']; track stat) {
                <div class="se-stat-item">
                  <span class="se-stat-name">{{ getStatLabel(stat) }}</span>
                  <div class="se-stat-ctrl">
                    <button class="se-stat-btn" (click)="decrementStat(stat)">&minus;</button>
                    <span class="se-stat-val"
                          [class.pos]="statModifiers[stat] > 0"
                          [class.neg]="statModifiers[stat] < 0">
                      {{ statModifiers[stat] > 0 ? '+' : '' }}{{ statModifiers[stat] }}
                    </span>
                    <button class="se-stat-btn" (click)="incrementStat(stat)">+</button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Passive: always-on action macro (effectActive runs permanently) -->
        @if (editSkill.type === 'passive') {
          <div class="se-section">
            <span class="se-section-title">Aktionsmakro / Skript</span>
            <p class="se-hint">
              Passiv &mdash; immer aktiv. <code>effectActive {{ '{' }} \u2026 {{ '}' }}</code> gilt dauerhaft,
              solange die F\xE4higkeit vorhanden ist. (Optional)
            </p>
            <div class="se-script-host">
              <app-script-editor
                [value]="editSkill.script || ''"
                (valueChange)="editSkill.script = $event">
              </app-script-editor>
            </div>
          </div>
        }
        @if (editSkill.type === 'dice_bonus') {
          <div class="se-info">
            <span class="se-info-icon">&#x1F3B2;</span>
            <span>W&uuml;rfelbonus &mdash; wird beim W&uuml;rfeln automatisch angewendet.</span>
          </div>
        }

        <!-- Custom counter bars (identical to items) -->
        <div class="se-section">
          <span class="se-section-title">&#x1F4CA; Eigene Leisten</span>
          <p class="se-hint">Beliebige Z&auml;hler/Balken, die angezeigt werden, solange die F&auml;higkeit aktiv ist (z.B. Ladungen).</p>

          @if (editSkill.counters && editSkill.counters.length > 0) {
            <div class="se-counter-list">
              @for (counter of editSkill.counters; track counter.id; let i = $index) {
                <div class="se-counter-row">
                  <span class="se-counter-dot" [style.background]="counter.color"></span>
                  <span class="se-counter-name">{{ counter.name }}</span>
                  <span class="se-counter-range">{{ counter.min }}&ndash;{{ counter.max }}</span>
                  <button class="se-counter-del" (click)="removeCounter(i)">&times;</button>
                </div>
              }
            </div>
          }

          <div class="se-counter-add">
            <input class="se-input se-counter-field" type="text" [(ngModel)]="newCounter.name" placeholder="Name, z.B. Ladungen">
            <div class="se-counter-nums">
              <label class="se-counter-num"><span>Min</span><input class="se-input" type="number" [(ngModel)]="newCounter.min"></label>
              <label class="se-counter-num"><span>Max</span><input class="se-input" type="number" [(ngModel)]="newCounter.max"></label>
              <label class="se-counter-num"><span>Start</span><input class="se-input" type="number" [(ngModel)]="newCounter.current"></label>
              <label class="se-counter-num se-counter-color"><span>Farbe</span>
                <select class="se-select" [(ngModel)]="newCounter.color">
                  @for (color of counterColors; track color) {
                    <option [value]="color">{{ color }}</option>
                  }
                </select>
              </label>
            </div>
            <button class="se-btn-add-counter" (click)="addCounter()" [disabled]="!newCounter.name.trim()">+ Leiste</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer -->
    <div class="se-footer">
      @if (!isNewSkill) {
        <button class="se-btn-del" (click)="deleteSkill()">L&ouml;schen</button>
      }
      <div class="se-footer-right">
        <button class="se-btn-cancel" (click)="cancelEdit()">Abbrechen</button>
        <button class="se-btn-save" (click)="saveSkill()" [disabled]="!editSkill.name.trim()">
          {{ isNewSkill ? 'Erstellen' : 'Speichern' }}
        </button>
      </div>
    </div>

  </div>
</div>
`, styles: ["/* src/app/shared/skill-editor/skill-editor.component.css */\n.se-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.75);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1600;\n}\n.se-modal {\n  background: var(--card, #2d3748);\n  border-radius: 0;\n  width: 100vw;\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: none;\n  border: none;\n  overflow: hidden;\n}\n.se-body {\n  max-width: 1400px;\n  width: 100%;\n  margin: 0 auto;\n}\n.se-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 22px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  flex-shrink: 0;\n}\n.se-header h2 {\n  margin: 0;\n  font-size: 1.15rem;\n  color: var(--text, #e5e7eb);\n  font-weight: 600;\n}\n.se-close {\n  background: none;\n  border: none;\n  font-size: 1.6rem;\n  line-height: 1;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  padding: 0 6px;\n  transition: color 0.15s;\n}\n.se-close:hover {\n  color: var(--text, #e5e7eb);\n}\n.se-body {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  overflow: hidden;\n}\n.se-col {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 18px 20px;\n  overflow-y: auto;\n}\n.se-col-left {\n  border-right: 1px solid var(--border, #4a5568);\n}\n.se-field {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.se-field-flex {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 80px;\n}\n.se-label {\n  font-size: 0.73rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.se-input,\n.se-select {\n  padding: 7px 10px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  font-family: inherit;\n  transition: border-color 0.15s;\n}\n.se-input:focus,\n.se-select:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.se-invalid {\n  border-color: #ef4444 !important;\n}\n.se-textarea {\n  flex: 1;\n  padding: 9px 11px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  font-family: inherit;\n  resize: none;\n  transition: border-color 0.15s;\n}\n.se-textarea:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.se-input-area {\n  resize: vertical;\n  min-height: 56px;\n}\n.se-color {\n  height: 34px;\n  padding: 2px 4px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  cursor: pointer;\n  width: 60px;\n}\n.se-tabs {\n  display: flex;\n  gap: 5px;\n}\n.se-tab {\n  flex: 1;\n  padding: 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  cursor: pointer;\n  text-align: center;\n  transition: all 0.15s;\n}\n.se-tab:hover {\n  color: var(--text, #e5e7eb);\n}\n.se-tab-active {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.se-tab[data-src=class].se-tab-active {\n  border-color: #f59e0b;\n  color: #f59e0b;\n  background: rgba(245, 158, 11, 0.12);\n}\n.se-tab[data-src=race].se-tab-active {\n  border-color: #34d399;\n  color: #34d399;\n  background: rgba(52, 211, 153, 0.12);\n}\n.se-tab[data-src=custom].se-tab-active {\n  border-color: #a78bfa;\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.12);\n}\n.se-type-pills {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 5px;\n}\n.se-pill {\n  padding: 7px 8px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.8rem;\n  cursor: pointer;\n  text-align: center;\n  transition: all 0.15s;\n}\n.se-pill:hover {\n  color: var(--text, #e5e7eb);\n}\n.se-pill[data-type=active].se-pill-active {\n  background: rgba(245, 158, 11, 0.15);\n  border-color: #f59e0b;\n  color: #f59e0b;\n}\n.se-pill[data-type=passive].se-pill-active {\n  background: rgba(167, 139, 250, 0.15);\n  border-color: #a78bfa;\n  color: #a78bfa;\n}\n.se-pill[data-type=dice_bonus].se-pill-active {\n  background: rgba(52, 211, 153, 0.15);\n  border-color: #34d399;\n  color: #34d399;\n}\n.se-pill[data-type=stat_bonus].se-pill-active {\n  background: rgba(56, 189, 248, 0.15);\n  border-color: #38bdf8;\n  color: #38bdf8;\n}\n.se-field-check {\n  flex-direction: row;\n  align-items: center;\n}\n.se-check-label {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  color: var(--text, #e5e7eb);\n  font-size: 0.88rem;\n}\n.se-check-label input[type=checkbox] {\n  width: 15px;\n  height: 15px;\n  accent-color: var(--accent, #8b5cf6);\n  cursor: pointer;\n  flex-shrink: 0;\n}\n.se-hint {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n}\n.se-field-perround {\n  flex: 0 0 auto !important;\n  justify-content: flex-end;\n  padding-bottom: 2px;\n}\n.se-field-color {\n  flex: 0 0 auto;\n}\n.se-section {\n  display: flex;\n  flex-direction: column;\n  gap: 9px;\n  padding: 10px 12px;\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  border: 1px solid var(--border, #4a5568);\n}\n.se-section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 6px;\n}\n.se-section-title {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.se-toggle {\n  display: flex;\n  gap: 3px;\n}\n.se-tog-btn {\n  padding: 3px 9px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-tog-btn.active {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.se-cost-row {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n  flex-wrap: wrap;\n}\n.se-cost-row .se-field {\n  flex: 1;\n  min-width: 80px;\n}\n.se-macro-block {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.se-macro-row {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n}\n.se-macro-row .se-field {\n  flex: 1;\n}\n.se-stat-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 6px;\n}\n.se-stat-grid-3 {\n  grid-template-columns: repeat(3, 1fr);\n}\n.se-stat-item {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 3px;\n  padding: 7px 4px;\n  background: rgba(255, 255, 255, 0.03);\n  border-radius: 6px;\n}\n.se-stat-name {\n  font-size: 0.67rem;\n  color: var(--text-muted, #9ca3af);\n  text-align: center;\n  line-height: 1.2;\n}\n.se-stat-ctrl {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.se-stat-btn {\n  width: 20px;\n  height: 20px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n  font-size: 0.85rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.se-stat-btn:hover {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n}\n.se-stat-val {\n  min-width: 26px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 0.85rem;\n  color: var(--text, #e5e7eb);\n}\n.se-stat-val.pos {\n  color: #22c55e;\n}\n.se-stat-val.neg {\n  color: #ef4444;\n}\n.se-info {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 12px 14px;\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  border: 1px solid var(--border, #4a5568);\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.85rem;\n  line-height: 1.5;\n}\n.se-info-icon {\n  font-size: 1.5rem;\n  flex-shrink: 0;\n}\n.se-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 20px;\n  border-top: 1px solid var(--border, #4a5568);\n  flex-shrink: 0;\n}\n.se-footer-right {\n  display: flex;\n  gap: 8px;\n}\n.se-btn-save {\n  padding: 8px 22px;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border: none;\n  border-radius: 6px;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: filter 0.15s;\n}\n.se-btn-save:hover {\n  filter: brightness(1.12);\n}\n.se-btn-save:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n  filter: none;\n}\n.se-btn-cancel {\n  padding: 8px 18px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-btn-cancel:hover {\n  color: var(--text, #e5e7eb);\n  border-color: var(--text-muted, #9ca3af);\n}\n.se-btn-del {\n  padding: 8px 18px;\n  background: transparent;\n  border: 1px solid #ef4444;\n  border-radius: 6px;\n  color: #ef4444;\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-btn-del:hover {\n  background: rgba(239, 68, 68, 0.12);\n}\n.se-script-host {\n  height: 300px;\n  margin-top: 6px;\n}\n.se-perpetual {\n  align-items: flex-start;\n  padding: 8px 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n}\n.se-perpetual input[type=checkbox] {\n  margin-top: 2px;\n}\n.se-counter-list {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.se-counter-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border-radius: 6px;\n}\n.se-counter-dot {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.se-counter-name {\n  flex: 1;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n  font-weight: 600;\n}\n.se-counter-range {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n}\n.se-counter-del {\n  background: none;\n  border: none;\n  color: #ef4444;\n  font-size: 1.15rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 4px;\n}\n.se-counter-del:hover {\n  color: #f87171;\n}\n.se-counter-add {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 4px;\n}\n.se-counter-field {\n  width: 100%;\n}\n.se-counter-nums {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 6px;\n}\n.se-counter-num {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.se-counter-num > span {\n  font-size: 0.68rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.se-counter-num .se-input,\n.se-counter-num .se-select {\n  padding: 5px 7px;\n  font-size: 0.82rem;\n  width: 100%;\n}\n.se-btn-add-counter {\n  align-self: flex-start;\n  padding: 6px 14px;\n  background: rgba(139, 92, 246, 0.18);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 6px;\n  color: var(--accent, #8b5cf6);\n  font-size: 0.82rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.se-btn-add-counter:hover {\n  background: rgba(139, 92, 246, 0.3);\n}\n.se-btn-add-counter:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=skill-editor.component.css.map */\n"] }]
  }], null, { skill: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }], delete: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SkillEditorComponent, { className: "SkillEditorComponent", filePath: "app/shared/skill-editor/skill-editor.component.ts", lineNumber: 16 });
})();

// src/app/sheet/class-tree-model.ts
var ClassTree = class {
  static classes = /* @__PURE__ */ new Map();
  static initialized = false;
  /**
   * Initialize the class tree from CLASS_DEFINITIONS
   * Auto-initializes on first use if not already initialized
   */
  static initialize() {
    if (this.initialized) {
      return;
    }
    this.classes.clear();
    const parentMap = /* @__PURE__ */ new Map();
    for (const [className, classInfo] of Object.entries(CLASS_DEFINITIONS)) {
      const normalized = this.normalize(className);
      if (!this.classes.has(normalized)) {
        this.classes.set(normalized, { name: className, parents: [] });
      }
      for (const child of classInfo.children) {
        const childNormalized = this.normalize(child.className);
        if (!parentMap.has(childNormalized)) {
          parentMap.set(childNormalized, []);
        }
        parentMap.get(childNormalized).push(normalized);
        if (!this.classes.has(childNormalized)) {
          this.classes.set(childNormalized, { name: child.className, parents: [] });
        }
      }
    }
    for (const [className, parents] of parentMap.entries()) {
      const classNode = this.classes.get(className);
      if (classNode) {
        classNode.parents = parents;
      }
    }
    this.initialized = true;
  }
  static normalize(className) {
    return className.split("@")[0].toLowerCase().trim();
  }
  static toDisplayName(normalized) {
    return normalized.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  /**
   * Check if a skill's class is enabled based on character's classes
   * Auto-initializes if needed
   */
  static isClassEnabled(skillClass, primaryClass, secondaryClass) {
    if (!this.initialized) {
      this.initialize();
    }
    if (!skillClass)
      return true;
    const normalizedSkillClass = this.normalize(skillClass);
    if (!this.classes.has(normalizedSkillClass))
      return true;
    const normalizedPrimary = this.normalize(primaryClass || "");
    const normalizedSecondary = this.normalize(secondaryClass || "");
    if (normalizedSkillClass === normalizedPrimary || normalizedSkillClass === normalizedSecondary) {
      return true;
    }
    return this.inheritsFrom(normalizedPrimary, normalizedSkillClass) || this.inheritsFrom(normalizedSecondary, normalizedSkillClass);
  }
  /**
   * Check if childClass inherits from parentClass (recursive)
   */
  static inheritsFrom(childClass, parentClass) {
    if (!childClass || !parentClass)
      return false;
    if (childClass === parentClass)
      return true;
    const classNode = this.classes.get(childClass);
    if (!classNode?.parents || classNode.parents.length === 0)
      return false;
    for (const parent of classNode.parents) {
      if (parent === parentClass || this.inheritsFrom(parent, parentClass)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Get all classes that would enable a given skill class
   */
  static getValidClassesFor(skillClass) {
    const normalized = this.normalize(skillClass);
    const validClasses = [normalized];
    for (const [className] of this.classes.entries()) {
      if (this.inheritsFrom(className, normalized)) {
        validClasses.push(className);
      }
    }
    return validClasses;
  }
  /**
   * Get display name for a class
   */
  static getDisplayName(className) {
    const normalized = this.normalize(className);
    return this.classes.get(normalized)?.name || this.toDisplayName(normalized);
  }
  /**
   * Get all available classes
   */
  static getAllClasses() {
    return Array.from(this.classes.keys());
  }
  /**
   * Check if initialized
   */
  static isInitialized() {
    return this.initialized;
  }
};

// src/app/sheet/item/item.component.ts
var _forTrack02 = ($index, $item) => $item.stat;
var _forTrack12 = ($index, $item) => $item.name;
var _forTrack2 = ($index, $item) => $item.id;
var _forTrack3 = ($index, $item) => $item.skillId;
var _forTrack4 = ($index, $item) => $item.spellId;
function ItemComponent_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 27);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_1_Conditional_1_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.identifyFromMenu());
    });
    \u0275\u0275text(1, "\u{1F50D} Identifizieren");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_1_Conditional_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 32);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_1_Conditional_2_Conditional_0_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.usePotionFromMenu());
    });
    \u0275\u0275domElement(1, "span", 33);
    \u0275\u0275text(2, " Auf sich anwenden");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275conditionalCreate(0, ItemComponent_Conditional_1_Conditional_2_Conditional_0_Template, 3, 0, "button", 28);
    \u0275\u0275domElementStart(1, "button", 29);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_1_Conditional_2_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.openEditorFromMenu());
    });
    \u0275\u0275domElement(2, "span", 30);
    \u0275\u0275text(3, " Bearbeiten");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(4, "button", 31);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_1_Conditional_2_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleLostFromMenu());
    });
    \u0275\u0275text(5);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275conditional(ctx_r2.item.itemType === "potion" && (ctx_r2.item.potionEffects == null ? null : ctx_r2.item.potionEffects.length) ? 0 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r2.item.lost ? "\u2713 Nicht verloren" : "\u2715 Verloren markieren", " ");
  }
}
function ItemComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 23);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_1_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275conditionalCreate(1, ItemComponent_Conditional_1_Conditional_1_Template, 2, 0, "button", 24);
    \u0275\u0275conditionalCreate(2, ItemComponent_Conditional_1_Conditional_2_Template, 6, 2);
    \u0275\u0275domElementStart(3, "button", 25);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_1_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.deleteFromContextMenu());
    });
    \u0275\u0275domElement(4, "span", 26);
    \u0275\u0275text(5, " L\xF6schen");
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("top", ctx_r2.contextMenuY, "px")("left", ctx_r2.contextMenuX, "px");
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.showDetails ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.showDetails ? 2 : -1);
  }
}
function ItemComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "span");
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classMap(\u0275\u0275interpolate1("item-type-icon app-icon ", ctx_r2.itemTypeIcon));
  }
}
function ItemComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 5);
    \u0275\u0275text(1, "\u2753");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 8);
    \u0275\u0275text(1, "Unidentifiziert");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 9);
    \u0275\u0275text(1, "\u26A0 Zerbrochen");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 10);
    \u0275\u0275text(1, "Verloren");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 12);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.slotLabel);
  }
}
function ItemComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 34);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("tag-big", !ctx_r2.isFolded);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r2.totalWeight, " kg");
  }
}
function ItemComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 35);
    \u0275\u0275domElement(1, "span", 36);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("tag-big", !ctx_r2.isFolded);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.item.efficiency);
  }
}
function ItemComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 37);
    \u0275\u0275domElement(1, "span", 38);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("tag-big", !ctx_r2.isFolded);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.item.stability);
  }
}
function ItemComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 16);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("-", ctx_r2.item.armorDebuff, " SPD");
  }
}
function ItemComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 17);
    \u0275\u0275text(1, "Unbrauchbar");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 18);
    \u0275\u0275domElement(1, "span", 39);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275domProperty("title", "Aus Bibliothek: " + ctx_r2.item.libraryOriginName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.item.libraryOriginName);
  }
}
function ItemComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 40);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_22_Template_button_click_0_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.rollDamage.emit(ctx_r2.item.efficiency);
      return \u0275\u0275resetView($event.stopPropagation());
    })("mousedown", function ItemComponent_Conditional_22_Template_button_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r6);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElement(1, "span", 36);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275domProperty("title", \u0275\u0275interpolate1("Schaden w\xFCrfeln (Eff: ", ctx_r2.item.efficiency, ")"));
  }
}
function ItemComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 41);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_23_Template_button_click_0_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.toggleFold();
      return \u0275\u0275resetView($event.stopPropagation());
    })("mousedown", function ItemComponent_Conditional_23_Template_button_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r7);
      return \u0275\u0275resetView($event.stopPropagation());
    })("touchstart", function ItemComponent_Conditional_23_Template_button_touchstart_0_listener($event) {
      \u0275\u0275restoreView(_r7);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275domProperty("title", ctx_r2.isFolded ? "Ausklappen" : "Einklappen");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r2.isFolded ? "\u25BC" : "\u25B2", " ");
  }
}
function ItemComponent_Conditional_24_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 51);
    \u0275\u0275domListener("mousedown", function ItemComponent_Conditional_24_Conditional_0_Template_div_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r8);
      return \u0275\u0275resetView($event.stopPropagation());
    })("click", function ItemComponent_Conditional_24_Conditional_0_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r8);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementStart(1, "span", 52);
    \u0275\u0275text(2, "Anzahl");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "div", 53)(4, "button", 54);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_24_Conditional_0_Template_button_click_4_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.updateField("amount", ctx_r2.Math.max(1, (ctx_r2.item.amount ?? 1) - 1));
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(5, "\u2212");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(6, "input", 55);
    \u0275\u0275domListener("change", function ItemComponent_Conditional_24_Conditional_0_Template_input_change_6_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.updateField("amount", ctx_r2.Math.max(1, +$event.target.value)));
    })("click", function ItemComponent_Conditional_24_Conditional_0_Template_input_click_6_listener($event) {
      \u0275\u0275restoreView(_r8);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(7, "button", 54);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_24_Conditional_0_Template_button_click_7_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.updateField("amount", (ctx_r2.item.amount ?? 1) + 1);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(8, "+");
    \u0275\u0275domElementEnd()()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275domProperty("value", ctx_r2.item.amount ?? 1);
  }
}
function ItemComponent_Conditional_24_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "p", 43);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275domProperty("innerHTML", ctx_r2.enhancedDescription, \u0275\u0275sanitizeHtml);
  }
}
function ItemComponent_Conditional_24_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 56)(1, "span", 59);
    \u0275\u0275text(2, "Prim\xE4reffekt");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "span", 60);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r2.item.primaryEffect);
  }
}
function ItemComponent_Conditional_24_Conditional_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 57)(1, "span", 59);
    \u0275\u0275text(2, "Sekund\xE4reffekt");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "span", 60);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r2.item.secondaryEffect);
  }
}
function ItemComponent_Conditional_24_Conditional_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 58)(1, "span", 59);
    \u0275\u0275text(2, "Spezialeffekt");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "span", 60);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r2.item.specialEffect);
  }
}
function ItemComponent_Conditional_24_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 44);
    \u0275\u0275conditionalCreate(1, ItemComponent_Conditional_24_Conditional_2_Conditional_1_Template, 5, 1, "div", 56);
    \u0275\u0275conditionalCreate(2, ItemComponent_Conditional_24_Conditional_2_Conditional_2_Template, 5, 1, "div", 57);
    \u0275\u0275conditionalCreate(3, ItemComponent_Conditional_24_Conditional_2_Conditional_3_Template, 5, 1, "div", 58);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.primaryEffect ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.secondaryEffect ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.specialEffect ? 3 : -1);
  }
}
function ItemComponent_Conditional_24_Conditional_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 62);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const modifier_r9 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("positive", modifier_r9.amount > 0)("negative", modifier_r9.amount < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3(" ", ctx_r2.getStatLabel(modifier_r9.stat), ": ", modifier_r9.amount > 0 ? "+" : "", "", modifier_r9.amount, " ");
  }
}
function ItemComponent_Conditional_24_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 45);
    \u0275\u0275repeaterCreate(1, ItemComponent_Conditional_24_Conditional_3_For_2_Template, 2, 7, "span", 61, _forTrack02);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.item.statModifiers);
  }
}
function ItemComponent_Conditional_24_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const bonus_r10 = ctx.$implicit;
    \u0275\u0275classProp("good", bonus_r10.value < 0)("bad", bonus_r10.value > 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3(" ", bonus_r10.name, ": ", bonus_r10.value > 0 ? "+" : "", "", bonus_r10.value, " ");
  }
}
function ItemComponent_Conditional_24_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 46);
    \u0275\u0275repeaterCreate(1, ItemComponent_Conditional_24_Conditional_4_For_2_Template, 2, 7, "span", 63, _forTrack12);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.item.diceBonuses);
  }
}
function ItemComponent_Conditional_24_Conditional_5_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 65);
    \u0275\u0275domListener("mousedown", function ItemComponent_Conditional_24_Conditional_5_For_2_Template_div_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r11);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementStart(1, "span", 66);
    \u0275\u0275text(2);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "div", 67)(4, "div", 68);
    \u0275\u0275domElement(5, "div", 69);
    \u0275\u0275domElementStart(6, "input", 70);
    \u0275\u0275domListener("input", function ItemComponent_Conditional_24_Conditional_5_For_2_Template_input_input_6_listener($event) {
      const counter_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      ctx_r2.updateCounter(counter_r12, +$event.target.value);
      return \u0275\u0275resetView($event.stopPropagation());
    })("click", function ItemComponent_Conditional_24_Conditional_5_For_2_Template_input_click_6_listener($event) {
      \u0275\u0275restoreView(_r11);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(7, "input", 71);
    \u0275\u0275domListener("input", function ItemComponent_Conditional_24_Conditional_5_For_2_Template_input_input_7_listener($event) {
      const counter_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      ctx_r2.updateCounter(counter_r12, +$event.target.value);
      return \u0275\u0275resetView($event.stopPropagation());
    })("click", function ItemComponent_Conditional_24_Conditional_5_For_2_Template_input_click_7_listener($event) {
      \u0275\u0275restoreView(_r11);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementEnd()()();
  }
  if (rf & 2) {
    const counter_r12 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(counter_r12.name);
    \u0275\u0275advance(3);
    \u0275\u0275styleProp("width", ctx_r2.getCounterPercent(counter_r12), "%")("background-color", counter_r12.color);
    \u0275\u0275advance();
    \u0275\u0275styleMap("--bar-color:" + counter_r12.color);
    \u0275\u0275domProperty("min", counter_r12.min)("max", counter_r12.max)("value", counter_r12.current);
    \u0275\u0275advance();
    \u0275\u0275domProperty("min", counter_r12.min)("max", counter_r12.max)("value", counter_r12.current);
  }
}
function ItemComponent_Conditional_24_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 47);
    \u0275\u0275repeaterCreate(1, ItemComponent_Conditional_24_Conditional_5_For_2_Template, 8, 13, "div", 48, _forTrack2);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.item.counters);
  }
}
function ItemComponent_Conditional_24_Conditional_6_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 74);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_24_Conditional_6_Conditional_8_Template_button_click_0_listener($event) {
      \u0275\u0275restoreView(_r14);
      const ctx_r2 = \u0275\u0275nextContext(3);
      ctx_r2.requestBreakTest();
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElement(1, "span", 75);
    \u0275\u0275text(2, " Bruchtest ");
    \u0275\u0275domElementEnd();
  }
}
function ItemComponent_Conditional_24_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 65);
    \u0275\u0275domListener("mousedown", function ItemComponent_Conditional_24_Conditional_6_Template_div_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r13);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementStart(1, "span", 66);
    \u0275\u0275text(2, "Haltbarkeit");
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(3, "div", 67)(4, "div", 68);
    \u0275\u0275domElement(5, "div", 69);
    \u0275\u0275domElementStart(6, "input", 72);
    \u0275\u0275domListener("input", function ItemComponent_Conditional_24_Conditional_6_Template_input_input_6_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.updateDurability(+$event.target.value);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(7, "input", 71);
    \u0275\u0275domListener("input", function ItemComponent_Conditional_24_Conditional_6_Template_input_input_7_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.updateDurability(+$event.target.value);
      return \u0275\u0275resetView($event.stopPropagation());
    })("click", function ItemComponent_Conditional_24_Conditional_6_Template_input_click_7_listener($event) {
      \u0275\u0275restoreView(_r13);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementEnd()();
    \u0275\u0275conditionalCreate(8, ItemComponent_Conditional_24_Conditional_6_Conditional_8_Template, 3, 0, "button", 73);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275classMap(ctx_r2.durabilityClass);
    \u0275\u0275styleProp("width", ctx_r2.durabilityPercent, "%");
    \u0275\u0275advance();
    \u0275\u0275domProperty("min", 0)("max", ctx_r2.item.maxDurability)("value", ctx_r2.item.durability || 0);
    \u0275\u0275advance();
    \u0275\u0275domProperty("min", 0)("max", ctx_r2.item.maxDurability)("value", ctx_r2.item.durability || 0);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.item.broken && (ctx_r2.item.durability || 0) === 0 ? 8 : -1);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("unmet", ctx_r2.sheet.strength.current < ctx_r2.item.requirements.strength);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("STR ", ctx_r2.item.requirements.strength);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("unmet", ctx_r2.sheet.dexterity.current < ctx_r2.item.requirements.dexterity);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("DEX ", ctx_r2.item.requirements.dexterity);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("unmet", ctx_r2.sheet.speed.current < ctx_r2.item.requirements.speed);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("SPD ", ctx_r2.item.requirements.speed);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("unmet", ctx_r2.sheet.intelligence.current < ctx_r2.item.requirements.intelligence);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("INT ", ctx_r2.item.requirements.intelligence);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("unmet", ctx_r2.sheet.constitution.current < ctx_r2.item.requirements.constitution);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("CON ", ctx_r2.item.requirements.constitution);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("unmet", ctx_r2.sheet.chill.current < ctx_r2.item.requirements.chill);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("WIL ", ctx_r2.item.requirements.chill);
  }
}
function ItemComponent_Conditional_24_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 49)(1, "span", 76);
    \u0275\u0275text(2, "Anforderungen:");
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(3, ItemComponent_Conditional_24_Conditional_7_Conditional_3_Template, 2, 3, "span", 77);
    \u0275\u0275conditionalCreate(4, ItemComponent_Conditional_24_Conditional_7_Conditional_4_Template, 2, 3, "span", 77);
    \u0275\u0275conditionalCreate(5, ItemComponent_Conditional_24_Conditional_7_Conditional_5_Template, 2, 3, "span", 77);
    \u0275\u0275conditionalCreate(6, ItemComponent_Conditional_24_Conditional_7_Conditional_6_Template, 2, 3, "span", 77);
    \u0275\u0275conditionalCreate(7, ItemComponent_Conditional_24_Conditional_7_Conditional_7_Template, 2, 3, "span", 77);
    \u0275\u0275conditionalCreate(8, ItemComponent_Conditional_24_Conditional_7_Conditional_8_Template, 2, 3, "span", 77);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r2.item.requirements.strength ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.requirements.dexterity ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.requirements.speed ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.requirements.intelligence ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.requirements.constitution ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.requirements.chill ? 8 : -1);
  }
}
function ItemComponent_Conditional_24_Conditional_8_Conditional_1_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 81);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const skill_r15 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(skill_r15.skillName);
  }
}
function ItemComponent_Conditional_24_Conditional_8_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 79)(1, "span", 80);
    \u0275\u0275text(2, "F\xE4higkeiten:");
    \u0275\u0275domElementEnd();
    \u0275\u0275repeaterCreate(3, ItemComponent_Conditional_24_Conditional_8_Conditional_1_For_4_Template, 2, 1, "span", 81, _forTrack3);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r2.item.attachedSkills);
  }
}
function ItemComponent_Conditional_24_Conditional_8_Conditional_2_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 82);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const spell_r16 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(spell_r16.spellName);
  }
}
function ItemComponent_Conditional_24_Conditional_8_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 79)(1, "span", 80);
    \u0275\u0275text(2, "Zauber:");
    \u0275\u0275domElementEnd();
    \u0275\u0275repeaterCreate(3, ItemComponent_Conditional_24_Conditional_8_Conditional_2_For_4_Template, 2, 1, "span", 82, _forTrack4);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r2.item.attachedSpells);
  }
}
function ItemComponent_Conditional_24_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 50);
    \u0275\u0275conditionalCreate(1, ItemComponent_Conditional_24_Conditional_8_Conditional_1_Template, 5, 0, "div", 79);
    \u0275\u0275conditionalCreate(2, ItemComponent_Conditional_24_Conditional_8_Conditional_2_Template, 5, 0, "div", 79);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.attachedSkills && ctx_r2.item.attachedSkills.length > 0 ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.attachedSpells && ctx_r2.item.attachedSpells.length > 0 ? 2 : -1);
  }
}
function ItemComponent_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, ItemComponent_Conditional_24_Conditional_0_Template, 9, 1, "div", 42);
    \u0275\u0275conditionalCreate(1, ItemComponent_Conditional_24_Conditional_1_Template, 1, 1, "p", 43);
    \u0275\u0275conditionalCreate(2, ItemComponent_Conditional_24_Conditional_2_Template, 4, 3, "div", 44);
    \u0275\u0275conditionalCreate(3, ItemComponent_Conditional_24_Conditional_3_Template, 3, 0, "div", 45);
    \u0275\u0275conditionalCreate(4, ItemComponent_Conditional_24_Conditional_4_Template, 3, 0, "div", 46);
    \u0275\u0275conditionalCreate(5, ItemComponent_Conditional_24_Conditional_5_Template, 3, 0, "div", 47);
    \u0275\u0275conditionalCreate(6, ItemComponent_Conditional_24_Conditional_6_Template, 9, 11, "div", 48);
    \u0275\u0275conditionalCreate(7, ItemComponent_Conditional_24_Conditional_7_Template, 9, 6, "div", 49);
    \u0275\u0275conditionalCreate(8, ItemComponent_Conditional_24_Conditional_8_Template, 3, 2, "div", 50);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275conditional(ctx_r2.item.stackable ? 0 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.description ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.primaryEffect || ctx_r2.item.secondaryEffect || ctx_r2.item.specialEffect ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.statModifiers && ctx_r2.item.statModifiers.length > 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.diceBonuses && ctx_r2.item.diceBonuses.length > 0 ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.counters && ctx_r2.item.counters.length > 0 ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.hasDurability && ctx_r2.item.maxDurability ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.requirements && (ctx_r2.item.requirements.strength || ctx_r2.item.requirements.dexterity || ctx_r2.item.requirements.speed || ctx_r2.item.requirements.intelligence || ctx_r2.item.requirements.constitution || ctx_r2.item.requirements.chill) ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.item.attachedSkills && ctx_r2.item.attachedSkills.length > 0 || ctx_r2.item.attachedSpells && ctx_r2.item.attachedSpells.length > 0 ? 8 : -1);
  }
}
function ItemComponent_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 22)(1, "button", 83);
    \u0275\u0275domListener("click", function ItemComponent_Conditional_25_Template_button_click_1_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.requestIdentify();
      return \u0275\u0275resetView($event.stopPropagation());
    })("mousedown", function ItemComponent_Conditional_25_Template_button_mousedown_1_listener($event) {
      \u0275\u0275restoreView(_r17);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(2, " \u{1F50D} Identifizieren ");
    \u0275\u0275domElementEnd()();
  }
}
var ItemComponent = class _ItemComponent {
  cd;
  sanitizer;
  /** Tracks the last opened context menu instance so others can close themselves */
  static activeContextMenu = null;
  item;
  sheet;
  index;
  isEditing = false;
  /** When true, forces item to folded compact state (e.g. during drag) */
  compact = false;
  /** When true, item starts in unfolded state (used for expansion row in inventory grid) */
  set startUnfolded(v) {
    if (v)
      this.isFolded = false;
  }
  /** When true, hides the fold button and disables dblclick-to-fold (expansion row) */
  hideFoldControls = false;
  patch = new EventEmitter();
  delete = new EventEmitter();
  editingChange = new EventEmitter();
  openEditor = new EventEmitter();
  breakTest = new EventEmitter();
  /** Potion: request parent to apply effects and consume. */
  useOnSelf = new EventEmitter();
  isFolded = true;
  // Start items as folded to save space
  Math = Math;
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  foldChange = new EventEmitter();
  /** Emits the weapon's efficiency when the roll-damage button is clicked */
  rollDamage = new EventEmitter();
  /** Maps armorType/itemType to short slot label */
  get slotLabel() {
    const slot = getEquipSlot(this.item);
    const map = {
      helmet: "HELM",
      chestplate: "BRUST",
      armschienen: "ARME",
      leggings: "BEINE",
      boots: "STIEFEL",
      weapon: "WAFFE",
      extra: "EXTRA"
    };
    return map[slot] ?? null;
  }
  onDocumentClick() {
    this.showContextMenu = false;
    if (_ItemComponent.activeContextMenu === this)
      _ItemComponent.activeContextMenu = null;
  }
  onEscape() {
    this.showContextMenu = false;
    if (_ItemComponent.activeContextMenu === this)
      _ItemComponent.activeContextMenu = null;
  }
  ngOnChanges(changes) {
    if (changes["compact"] && changes["compact"].currentValue === true) {
      this.isFolded = true;
    }
  }
  constructor(cd, sanitizer) {
    this.cd = cd;
    this.sanitizer = sanitizer;
  }
  get enhancedDescription() {
    const original = this.item.description || "No description";
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }
  get canUseItem() {
    if (!this.item.requirements)
      return true;
    const reqs = this.item.requirements;
    const stats = this.sheet;
    if (reqs.strength && stats.strength.current < reqs.strength)
      return false;
    if (reqs.dexterity && stats.dexterity.current < reqs.dexterity)
      return false;
    if (reqs.speed && stats.speed.current < reqs.speed)
      return false;
    if (reqs.intelligence && stats.intelligence.current < reqs.intelligence)
      return false;
    if (reqs.constitution && stats.constitution.current < reqs.constitution)
      return false;
    if (reqs.chill && stats.chill.current < reqs.chill)
      return false;
    if (this.item.lost)
      return false;
    if (this.item.broken)
      return false;
    return true;
  }
  get durabilityPercent() {
    if (!this.item.hasDurability || !this.item.maxDurability)
      return 100;
    return Math.round((this.item.durability || 0) / this.item.maxDurability * 100);
  }
  get durabilityClass() {
    const pct = this.durabilityPercent;
    if (pct > 66)
      return "durability-high";
    if (pct > 33)
      return "durability-medium";
    return "durability-low";
  }
  get itemTypeIcon() {
    switch (this.item.itemType) {
      case "weapon":
        return "i-effektivity";
      case "armor":
        return "i-stability";
      case "potion":
        return "i-brewing";
      case "raw-material":
        return "i-item";
      case "ingredient":
        return "i-item";
      case "extractor":
        return "i-brewing";
      default:
        return "i-item";
    }
  }
  get itemTypeLabel() {
    switch (this.item.itemType) {
      case "weapon":
        return "Waffe";
      case "armor":
        return "R\xFCstung";
      case "potion":
        return "Trank";
      case "raw-material":
        return "Rohmaterial";
      case "ingredient":
        return "Wirkstoff";
      case "extractor":
        return "Extraktor";
      default:
        return "Gegenstand";
    }
  }
  toggleEdit() {
    this.openEditor.emit();
  }
  onRightClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (_ItemComponent.activeContextMenu && _ItemComponent.activeContextMenu !== this) {
      _ItemComponent.activeContextMenu.showContextMenu = false;
    }
    _ItemComponent.activeContextMenu = this;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;
  }
  openEditorFromMenu() {
    this.showContextMenu = false;
    this.openEditor.emit();
  }
  usePotionFromMenu() {
    this.showContextMenu = false;
    this.useOnSelf.emit();
  }
  toggleLostFromMenu() {
    this.showContextMenu = false;
    this.patch.emit({ path: "lost", value: !this.item.lost });
  }
  deleteFromContextMenu() {
    this.showContextMenu = false;
    this.delete.emit();
  }
  identifyFromMenu() {
    this.showContextMenu = false;
    this.patch.emit({ path: "identified", value: true });
  }
  updateField(field, value) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }
  updateCounter(counter, value) {
    const newValue = Math.max(counter.min, Math.min(counter.max, value));
    const counterIndex = this.item.counters?.indexOf(counter) ?? -1;
    if (counterIndex >= 0) {
      this.patch.emit({ path: `counters.${counterIndex}.current`, value: newValue });
    }
  }
  getCounterPercent(counter) {
    const range = counter.max - counter.min;
    if (range === 0)
      return 100;
    const current = counter.current - counter.min;
    return Math.round(current / range * 100);
  }
  updateDurability(value) {
    if (!this.item.hasDurability)
      return;
    const newDurability = Math.max(0, Math.min(this.item.maxDurability || 100, value));
    this.patch.emit({ path: "durability", value: newDurability });
    if (newDurability === 0 && !this.item.broken) {
      this.breakTest.emit();
    }
  }
  reduceDurability(amount) {
    if (!this.item.hasDurability)
      return;
    const newDurability = Math.max(0, (this.item.durability || 0) - amount);
    this.patch.emit({ path: "durability", value: newDurability });
    if (newDurability === 0 && !this.item.broken) {
      this.breakTest.emit();
    }
  }
  getStatLabel(stat) {
    const labels = {
      "strength": "STR",
      "dexterity": "DEX",
      "speed": "SPD",
      "intelligence": "INT",
      "constitution": "CON",
      "chill": "WIL",
      "mana": "Mana",
      "life": "Leben",
      "energy": "Energie"
    };
    return labels[stat] || stat;
  }
  requestBreakTest() {
    this.breakTest.emit();
  }
  toggleLost() {
    this.patch.emit({ path: "lost", value: !this.item.lost });
  }
  toggleFold() {
    this.isFolded = !this.isFolded;
    this.foldChange.emit(this.isFolded);
  }
  onCardDblClick(e) {
    if (!this.hideFoldControls) {
      this.toggleFold();
    }
    e.stopPropagation();
  }
  deleteItem() {
    this.delete.emit();
  }
  get displayName() {
    if (this.item.isIdentified === false)
      return "Unidentifiziertes Item";
    const baseName = this.item.name;
    if (this.item.stackable && (this.item.amount ?? 1) > 1) {
      return `${baseName} \xD7${this.item.amount}`;
    }
    return baseName;
  }
  get totalWeight() {
    if (this.item.stackable && (this.item.amount ?? 1) > 1) {
      return (this.item.weight || 0) * (this.item.amount ?? 1);
    }
    return this.item.weight || 0;
  }
  get showDetails() {
    return this.item.isIdentified !== false;
  }
  requestIdentify() {
    if (confirm("M\xF6chtest du dieses Item identifizieren?")) {
      this.patch.emit({ path: "isIdentified", value: true });
    }
  }
  static \u0275fac = function ItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ItemComponent)(\u0275\u0275directiveInject(ChangeDetectorRef), \u0275\u0275directiveInject(DomSanitizer));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ItemComponent, selectors: [["app-item"]], hostBindings: function ItemComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("click", function ItemComponent_click_HostBindingHandler() {
        return ctx.onDocumentClick();
      }, \u0275\u0275resolveDocument)("keydown.escape", function ItemComponent_keydown_escape_HostBindingHandler() {
        return ctx.onEscape();
      }, \u0275\u0275resolveDocument);
    }
  }, inputs: { item: "item", sheet: "sheet", index: "index", isEditing: "isEditing", compact: "compact", startUnfolded: "startUnfolded", hideFoldControls: "hideFoldControls" }, outputs: { patch: "patch", delete: "delete", editingChange: "editingChange", openEditor: "openEditor", breakTest: "breakTest", useOnSelf: "useOnSelf", foldChange: "foldChange", rollDamage: "rollDamage" }, features: [\u0275\u0275NgOnChangesFeature], decls: 26, vars: 34, consts: [[1, "item-card", 3, "contextmenu", "dblclick"], [1, "context-menu", 3, "top", "left"], [1, "item-view"], [1, "item-header"], [3, "class"], [1, "item-type-icon"], [1, "item-name-block"], [1, "item-title-row"], [1, "unidentified-badge"], [1, "broken-badge"], [1, "lost-badge"], [1, "item-tags-row"], [1, "tag", "tag-slot"], [1, "tag", "tag-weight", 3, "tag-big"], [1, "tag", "tag-eff", 3, "tag-big"], [1, "tag", "tag-stab", 3, "tag-big"], [1, "tag", "tag-debuff"], [1, "tag", "tag-unusable"], [1, "tag", "tag-lib", 3, "title"], [1, "item-controls"], [1, "roll-damage-btn", 3, "title"], [1, "fold-btn", 3, "title"], [1, "identify-section"], [1, "context-menu", 3, "click"], [1, "ctx-item", "ctx-identify"], [1, "ctx-item", "ctx-delete", 3, "click"], [1, "app-icon", "i-restore-trash"], [1, "ctx-item", "ctx-identify", 3, "click"], [1, "ctx-item", "ctx-use"], [1, "ctx-item", 3, "click"], [1, "app-icon", "i-draw"], [1, "ctx-item", "ctx-lost", 3, "click"], [1, "ctx-item", "ctx-use", 3, "click"], [1, "app-icon", "i-brewing"], [1, "tag", "tag-weight"], [1, "tag", "tag-eff"], [1, "app-icon", "i-effektivity"], [1, "tag", "tag-stab"], [1, "app-icon", "i-stability"], [1, "app-icon", "i-folder"], [1, "roll-damage-btn", 3, "click", "mousedown", "title"], [1, "fold-btn", 3, "click", "mousedown", "touchstart", "title"], [1, "amount-row"], [1, "item-description", 3, "innerHTML"], [1, "effects-section"], [1, "stat-modifiers-section"], [1, "dice-bonuses-section"], [1, "counters-section"], [1, "bar-row"], [1, "item-requirements"], [1, "attached-section"], [1, "amount-row", 3, "mousedown", "click"], [1, "amount-label"], [1, "amount-controls"], [1, "amount-btn", 3, "click"], ["type", "number", "min", "1", 1, "amount-input", 3, "change", "click", "value"], [1, "effect-item", "primary"], [1, "effect-item", "secondary"], [1, "effect-item", "special"], [1, "effect-label"], [1, "effect-text"], [1, "stat-modifier", 3, "positive", "negative"], [1, "stat-modifier"], [1, "dice-bonus", 3, "good", "bad"], [1, "dice-bonus"], [1, "bar-row", 3, "mousedown"], [1, "bar-label"], [1, "bar-with-input"], [1, "bar-track"], [1, "bar-fill"], ["type", "range", 1, "bar-slider", 3, "input", "click", "min", "max", "value"], ["type", "number", 1, "bar-number-input", 3, "input", "click", "min", "max", "value"], ["type", "range", 1, "bar-slider", 3, "input", "min", "max", "value"], [1, "break-test-btn"], [1, "break-test-btn", 3, "click"], [1, "app-icon", "i-dice"], [1, "req-label"], [1, "req-stat", 3, "unmet"], [1, "req-stat"], [1, "attached-row"], [1, "attached-label"], [1, "attached-skill"], [1, "attached-spell"], [1, "identify-btn", 3, "click", "mousedown"]], template: function ItemComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275domListener("contextmenu", function ItemComponent_Template_div_contextmenu_0_listener($event) {
        return ctx.onRightClick($event);
      })("dblclick", function ItemComponent_Template_div_dblclick_0_listener($event) {
        return ctx.onCardDblClick($event);
      });
      \u0275\u0275conditionalCreate(1, ItemComponent_Conditional_1_Template, 6, 6, "div", 1);
      \u0275\u0275domElementStart(2, "div", 2)(3, "div", 3);
      \u0275\u0275conditionalCreate(4, ItemComponent_Conditional_4_Template, 1, 3, "span", 4);
      \u0275\u0275conditionalCreate(5, ItemComponent_Conditional_5_Template, 2, 0, "span", 5);
      \u0275\u0275domElementStart(6, "div", 6)(7, "div", 7)(8, "h4");
      \u0275\u0275text(9);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(10, ItemComponent_Conditional_10_Template, 2, 0, "span", 8);
      \u0275\u0275conditionalCreate(11, ItemComponent_Conditional_11_Template, 2, 0, "span", 9);
      \u0275\u0275conditionalCreate(12, ItemComponent_Conditional_12_Template, 2, 0, "span", 10);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(13, "div", 11);
      \u0275\u0275conditionalCreate(14, ItemComponent_Conditional_14_Template, 2, 1, "span", 12);
      \u0275\u0275conditionalCreate(15, ItemComponent_Conditional_15_Template, 2, 3, "span", 13);
      \u0275\u0275conditionalCreate(16, ItemComponent_Conditional_16_Template, 3, 3, "span", 14);
      \u0275\u0275conditionalCreate(17, ItemComponent_Conditional_17_Template, 3, 3, "span", 15);
      \u0275\u0275conditionalCreate(18, ItemComponent_Conditional_18_Template, 2, 1, "span", 16);
      \u0275\u0275conditionalCreate(19, ItemComponent_Conditional_19_Template, 2, 0, "span", 17);
      \u0275\u0275conditionalCreate(20, ItemComponent_Conditional_20_Template, 3, 2, "span", 18);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(21, "div", 19);
      \u0275\u0275conditionalCreate(22, ItemComponent_Conditional_22_Template, 2, 2, "button", 20);
      \u0275\u0275conditionalCreate(23, ItemComponent_Conditional_23_Template, 2, 2, "button", 21);
      \u0275\u0275domElementEnd()();
      \u0275\u0275conditionalCreate(24, ItemComponent_Conditional_24_Template, 9, 9);
      \u0275\u0275conditionalCreate(25, ItemComponent_Conditional_25_Template, 3, 0, "div", 22);
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275classProp("unusable", !ctx.canUseItem)("broken", ctx.item.broken)("lost", ctx.item.lost)("folded", ctx.isFolded)("compact", ctx.compact)("unidentified", !ctx.showDetails)("weapon", ctx.item.itemType === "weapon")("armor", ctx.item.itemType === "armor");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showContextMenu ? 1 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.showDetails && ctx.item.itemType ? 4 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.showDetails ? 5 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.displayName);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.showDetails ? 10 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && ctx.item.broken ? 11 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && ctx.item.lost ? 12 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.showDetails && ctx.slotLabel ? 14 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails ? 15 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && ctx.item.itemType === "weapon" && ctx.item.efficiency ? 16 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && ctx.item.itemType === "armor" && ctx.item.stability ? 17 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && ctx.item.armorDebuff ? 18 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && !ctx.canUseItem && !ctx.item.broken && !ctx.item.lost ? 19 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDetails && ctx.item.libraryOriginName ? 20 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.showDetails && ctx.item.itemType === "weapon" && ctx.item.efficiency ? 22 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.hideFoldControls ? 23 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.isFolded && ctx.showDetails ? 24 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.isFolded && !ctx.showDetails ? 25 : -1);
    }
  }, dependencies: [CommonModule, FormsModule], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n}\n.item-card[_ngcontent-%COMP%], \n.item-view[_ngcontent-%COMP%] {\n  overflow: visible;\n}\n.item-card[_ngcontent-%COMP%] {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 0.5rem 0.7rem;\n  transition: all 0.2s;\n  border-left: 3px solid var(--accent);\n  cursor: grab;\n  width: 100%;\n  box-sizing: border-box;\n  position: relative;\n  user-select: none;\n  -webkit-user-select: none;\n}\n.item-card.folded[_ngcontent-%COMP%] {\n  padding: 0.4rem 0.6rem;\n}\n.item-card.compact[_ngcontent-%COMP%]   .item-tags-row[_ngcontent-%COMP%] {\n  display: none;\n}\n.item-card.compact[_ngcontent-%COMP%]   .item-header[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n}\n.cdk-drag-preview[_nghost-%COMP%]   .item-card[_ngcontent-%COMP%], .cdk-drag-preview   [_nghost-%COMP%]   .item-card[_ngcontent-%COMP%] {\n  max-width: 280px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  transform: rotate(1.5deg);\n  padding: 0.4rem 0.6rem;\n}\n.cdk-drag-preview[_nghost-%COMP%]   .item-tags-row[_ngcontent-%COMP%], .cdk-drag-preview   [_nghost-%COMP%]   .item-tags-row[_ngcontent-%COMP%], \n.cdk-drag-preview[_nghost-%COMP%]   .item-controls[_ngcontent-%COMP%], .cdk-drag-preview   [_nghost-%COMP%]   .item-controls[_ngcontent-%COMP%] {\n  display: none;\n}\n.item-card[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.item-card.unusable[_ngcontent-%COMP%] {\n  opacity: 0.7;\n  background: var(--bg);\n  border-left-color: #e53935;\n}\n.item-card[_ngcontent-%COMP%]:not(.cdk-drag-preview):hover {\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n  border-color: var(--accent);\n}\n.item-card.weapon[_ngcontent-%COMP%] {\n  border-left-color: #f59e0b;\n}\n.item-card.armor[_ngcontent-%COMP%] {\n  border-left-color: #6366f1;\n}\n.item-card.broken[_ngcontent-%COMP%] {\n  border-left-color: #ef4444;\n  opacity: 0.65;\n  background:\n    linear-gradient(\n      135deg,\n      var(--card) 0%,\n      #2d1f1f 100%);\n}\n.item-card.lost[_ngcontent-%COMP%] {\n  opacity: 0.4;\n}\n.item-card.unidentified[_ngcontent-%COMP%] {\n  border-left-color: #6b7280;\n  background:\n    linear-gradient(\n      135deg,\n      var(--card) 0%,\n      #2a2a35 100%);\n}\n.item-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin-bottom: 0.25rem;\n}\n.item-type-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  flex-shrink: 0;\n  margin-top: 0.1rem;\n}\n.item-name-block[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.item-title-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  flex-wrap: wrap;\n}\n.item-title-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9rem;\n  color: var(--text);\n  font-weight: 600;\n  word-break: break-word;\n}\n.item-tags-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.2rem;\n  margin-top: 0.2rem;\n}\n.tag[_ngcontent-%COMP%] {\n  padding: 0.1rem 0.3rem;\n  border-radius: 3px;\n  font-size: 0.68rem;\n  font-weight: 600;\n  white-space: nowrap;\n  border: 1px solid;\n}\n.tag-weight[_ngcontent-%COMP%] {\n  background: var(--bg);\n  border-color: var(--border);\n  color: var(--text-muted);\n}\n.tag-eff[_ngcontent-%COMP%] {\n  background: #1e1b4b;\n  border-color: #6366f1;\n  color: #a5b4fc;\n}\n.tag-stab[_ngcontent-%COMP%] {\n  background: #1e1b4b;\n  border-color: #6366f1;\n  color: #a5b4fc;\n}\n.tag-debuff[_ngcontent-%COMP%] {\n  background: #4a2c00;\n  border-color: #f97316;\n  color: #fdba74;\n}\n.tag-unusable[_ngcontent-%COMP%] {\n  background: #4d1c21;\n  border-color: #e57373;\n  color: #ffcdd2;\n}\n.tag-lib[_ngcontent-%COMP%] {\n  background: #1e3a5f;\n  border-color: #3b82f6;\n  color: #93c5fd;\n  cursor: pointer;\n}\n.tag-lib[_ngcontent-%COMP%]:hover {\n  background: #1e4075;\n}\n.tag-slot[_ngcontent-%COMP%] {\n  background: var(--accent);\n  border-color: transparent;\n  color: white;\n  font-size: 0.62rem;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n.item-card[_ngcontent-%COMP%]:not(.folded)   .tag-big[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  padding: 0.2rem 0.5rem;\n  font-weight: 700;\n}\n.item-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n  flex-shrink: 0;\n  margin-top: 0.05rem;\n}\n.fold-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--border);\n  cursor: pointer;\n  font-size: 0.9rem;\n  padding: 0.45rem;\n  opacity: 0.75;\n  transition: all 0.2s;\n  border-radius: 5px;\n  color: var(--text);\n  flex-shrink: 0;\n  min-width: 34px;\n  min-height: 34px;\n  aspect-ratio: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.fold-btn[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n  background: var(--bg);\n  border-color: var(--accent);\n}\n.fold-btn[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.roll-damage-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--border);\n  cursor: pointer;\n  font-size: 0.9rem;\n  padding: 0.45rem;\n  opacity: 0.75;\n  transition: all 0.2s;\n  border-radius: 5px;\n  color: var(--text);\n  flex-shrink: 0;\n  min-width: 34px;\n  min-height: 34px;\n  aspect-ratio: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.roll-damage-btn[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n  background: var(--bg);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.roll-damage-btn[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.action-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  font-size: 0.85rem;\n  padding: 0.2rem 0.3rem;\n  opacity: 0.5;\n  transition: all 0.2s;\n  border-radius: 3px;\n  flex-shrink: 0;\n}\n.action-btn[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.action-btn[_ngcontent-%COMP%]:active {\n  transform: scale(0.95);\n}\n.action-btn.active[_ngcontent-%COMP%] {\n  opacity: 0.3;\n  filter: grayscale(1);\n}\n.lost-btn.active[_ngcontent-%COMP%] {\n  background: rgba(107, 114, 128, 0.2);\n}\n.broken-badge[_ngcontent-%COMP%] {\n  background: #7f1d1d;\n  color: #fecaca;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 600;\n  border: 1px solid #ef4444;\n  white-space: nowrap;\n}\n.lost-badge[_ngcontent-%COMP%] {\n  background: #374151;\n  color: #9ca3af;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 600;\n  border: 1px solid #6b7280;\n  white-space: nowrap;\n}\n.unidentified-badge[_ngcontent-%COMP%] {\n  background: #4a4a4a;\n  color: #d1d5db;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 600;\n  border: 1px solid #6b7280;\n  white-space: nowrap;\n}\n.amount-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 0 6px;\n  border-bottom: 1px solid var(--border);\n  margin-bottom: 6px;\n}\n.amount-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--muted);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.amount-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0;\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  overflow: hidden;\n}\n.amount-btn[_ngcontent-%COMP%] {\n  background: var(--bg);\n  border: none;\n  color: var(--text);\n  width: 28px;\n  height: 28px;\n  font-size: 16px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.15s;\n  flex-shrink: 0;\n}\n.amount-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent);\n  color: #fff;\n}\n.amount-input[_ngcontent-%COMP%] {\n  width: 48px;\n  background: var(--card);\n  border: none;\n  border-left: 1px solid var(--border);\n  border-right: 1px solid var(--border);\n  color: var(--text);\n  font-size: 14px;\n  font-weight: 600;\n  text-align: center;\n  height: 28px;\n  padding: 0 4px;\n}\n.amount-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  background: var(--bg);\n}\n.amount-input[_ngcontent-%COMP%]::-webkit-inner-spin-button, \n.amount-input[_ngcontent-%COMP%]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n}\n.amount-input[type=number][_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\n.item-description[_ngcontent-%COMP%] {\n  color: var(--text-muted);\n  margin: 0.4rem 0;\n  font-size: 0.88rem;\n  line-height: 1.5;\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  white-space: pre-wrap;\n}\n.effects-section[_ngcontent-%COMP%] {\n  margin: 0.4rem 0;\n  padding: 0.45rem 0.5rem;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n}\n.effect-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.effect-label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.effect-item.primary[_ngcontent-%COMP%]   .effect-label[_ngcontent-%COMP%] {\n  color: #60a5fa;\n}\n.effect-item.secondary[_ngcontent-%COMP%]   .effect-label[_ngcontent-%COMP%] {\n  color: #a78bfa;\n}\n.effect-item.special[_ngcontent-%COMP%]   .effect-label[_ngcontent-%COMP%] {\n  color: #fbbf24;\n}\n.effect-text[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--text);\n  line-height: 1.4;\n  white-space: pre-wrap;\n}\n.stat-modifiers-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin: 0.3rem 0;\n}\n.stat-modifier[_ngcontent-%COMP%] {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  color: var(--text);\n}\n.stat-modifier.positive[_ngcontent-%COMP%] {\n  background: #052e16;\n  border-color: #22c55e;\n  color: #86efac;\n}\n.stat-modifier.negative[_ngcontent-%COMP%] {\n  background: #450a0a;\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.dice-bonuses-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin: 0.3rem 0;\n}\n.dice-bonus[_ngcontent-%COMP%] {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  color: var(--text);\n}\n.dice-bonus.good[_ngcontent-%COMP%] {\n  background: #052e16;\n  border-color: #22c55e;\n  color: #86efac;\n}\n.dice-bonus.bad[_ngcontent-%COMP%] {\n  background: #450a0a;\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.bar-with-input[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.45rem;\n  flex: 1;\n}\n.bar-track[_ngcontent-%COMP%] {\n  flex: 1;\n  position: relative;\n  height: 14px;\n  background: #1f2937;\n  border-radius: 7px;\n  overflow: hidden;\n}\n.durability-slider[_ngcontent-%COMP%], \n.counter-slider[_ngcontent-%COMP%], \n.bar-slider[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  -webkit-appearance: none;\n  appearance: none;\n  background: transparent;\n  outline: none;\n  cursor: pointer;\n  z-index: 2;\n  margin: 0;\n  padding: 0;\n}\n.durability-slider[_ngcontent-%COMP%]::-webkit-slider-thumb, \n.counter-slider[_ngcontent-%COMP%]::-webkit-slider-thumb, \n.bar-slider[_ngcontent-%COMP%]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 14px;\n  height: 14px;\n  background: white;\n  border-radius: 50%;\n  cursor: pointer;\n  border: 2px solid var(--accent);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n  transition: transform 0.1s;\n}\n.durability-slider[_ngcontent-%COMP%]::-webkit-slider-thumb:hover, \n.counter-slider[_ngcontent-%COMP%]::-webkit-slider-thumb:hover, \n.bar-slider[_ngcontent-%COMP%]::-webkit-slider-thumb:hover {\n  transform: scale(1.1);\n}\n.durability-slider[_ngcontent-%COMP%]::-moz-range-thumb, \n.counter-slider[_ngcontent-%COMP%]::-moz-range-thumb, \n.bar-slider[_ngcontent-%COMP%]::-moz-range-thumb {\n  width: 14px;\n  height: 14px;\n  background: white;\n  border-radius: 50%;\n  cursor: pointer;\n  border: 2px solid var(--accent);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n.bar-slider[_ngcontent-%COMP%]::-webkit-slider-runnable-track {\n  background: transparent;\n}\n.bar-slider[_ngcontent-%COMP%]::-moz-range-track {\n  background: transparent;\n  height: 14px;\n  border-radius: 7px;\n}\n.counter-fill-bg[_ngcontent-%COMP%], \n.durability-bar-fill[_ngcontent-%COMP%], \n.bar-fill[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  border-radius: 7px;\n  pointer-events: none;\n  z-index: 1;\n  transition: width 0.3s;\n}\n.counter-fill-bg[_ngcontent-%COMP%] {\n}\n.durability-bar-fill.durability-high[_ngcontent-%COMP%], \n.bar-fill.durability-high[_ngcontent-%COMP%] {\n  background: #22c55e;\n}\n.durability-bar-fill.durability-medium[_ngcontent-%COMP%], \n.bar-fill.durability-medium[_ngcontent-%COMP%] {\n  background: #f59e0b;\n}\n.durability-bar-fill.durability-low[_ngcontent-%COMP%], \n.bar-fill.durability-low[_ngcontent-%COMP%] {\n  background: #ef4444;\n}\n.bar-number-input[_ngcontent-%COMP%] {\n  width: 42px;\n  flex-shrink: 0;\n  padding: 0.15rem 0.2rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.72rem;\n  text-align: center;\n}\n.bar-number-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.bar-value[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: var(--text-muted);\n  white-space: nowrap;\n  flex-shrink: 0;\n  min-width: 32px;\n  text-align: right;\n}\n.bar-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin: 0.25rem 0;\n}\n.bar-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text-muted);\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n  min-width: 60px;\n}\n.durability-section[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin: 0.3rem 0;\n}\n.durability-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text-muted);\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.break-test-btn[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  padding: 0.2rem 0.5rem;\n  background: #7f1d1d;\n  border: 1px solid #ef4444;\n  border-radius: 4px;\n  color: #fecaca;\n  font-size: 0.72rem;\n  cursor: pointer;\n  transition: all 0.2s;\n  font-weight: 600;\n}\n.break-test-btn[_ngcontent-%COMP%]:hover {\n  background: #991b1b;\n}\n.counters-section[_ngcontent-%COMP%] {\n  margin: 0.3rem 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.counter-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.counter-name[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text);\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n  width: 70px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.counter-slider[_ngcontent-%COMP%] {\n}\n.counter-slider[_ngcontent-%COMP%]::-webkit-slider-thumb {\n  border-color: var(--counter-color, var(--accent));\n}\n.counter-slider[_ngcontent-%COMP%]::-moz-range-thumb {\n  border-color: var(--counter-color, var(--accent));\n}\n.item-requirements[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.4rem;\n  align-items: center;\n  flex-wrap: wrap;\n  margin-top: 0.5rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid var(--border);\n}\n.req-label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-muted);\n  font-weight: 600;\n}\n.req-stat[_ngcontent-%COMP%] {\n  background: #1e3a5f;\n  color: #90caf9;\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n  border: 1px solid #42a5f5;\n  white-space: nowrap;\n  font-weight: 600;\n}\n.req-stat.unmet[_ngcontent-%COMP%] {\n  background: #4d1c21;\n  color: #ffcdd2;\n  border-color: #e57373;\n  text-decoration: line-through;\n}\n.attached-section[_ngcontent-%COMP%] {\n  margin-top: 0.4rem;\n  padding-top: 0.4rem;\n  border-top: 1px solid var(--border);\n}\n.attached-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.35rem;\n  align-items: center;\n  margin-bottom: 0.25rem;\n}\n.attached-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted);\n  font-weight: 500;\n}\n.attached-skill[_ngcontent-%COMP%] {\n  padding: 0.12rem 0.35rem;\n  background: #1e3a5f;\n  border: 1px solid #3b82f6;\n  border-radius: 4px;\n  font-size: 0.72rem;\n  color: #93c5fd;\n}\n.attached-spell[_ngcontent-%COMP%] {\n  padding: 0.12rem 0.35rem;\n  background: #3b0764;\n  border: 1px solid #a855f7;\n  border-radius: 4px;\n  font-size: 0.72rem;\n  color: #d8b4fe;\n}\n.identify-section[_ngcontent-%COMP%] {\n  padding: 0.4rem 0;\n}\n.identify-btn[_ngcontent-%COMP%] {\n  background: #4f46e5;\n  color: white;\n  padding: 0.3rem 0.6rem;\n  border-radius: 4px;\n  font-size: 0.78rem;\n  font-weight: 600;\n  border: 1px solid #6366f1;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.identify-btn[_ngcontent-%COMP%]:hover {\n  background: #5b52e8;\n  border-color: #818cf8;\n}\n.context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 99999;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.55);\n  min-width: 145px;\n  overflow: hidden;\n  padding: 0.2rem 0;\n}\n.ctx-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.45rem;\n  width: 100%;\n  padding: 0.5rem 0.85rem;\n  background: none;\n  border: none;\n  color: var(--text);\n  cursor: pointer;\n  font-size: 0.88rem;\n  text-align: left;\n  transition: background 0.15s;\n}\n.ctx-item[_ngcontent-%COMP%]:hover {\n  background: var(--bg);\n}\n.ctx-item.ctx-delete[_ngcontent-%COMP%] {\n  color: #f87171;\n}\n.ctx-item.ctx-delete[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.12);\n}\n.ctx-item.ctx-lost[_ngcontent-%COMP%] {\n  color: #9ca3af;\n}\n.ctx-item.ctx-lost[_ngcontent-%COMP%]:hover {\n  background: rgba(156, 163, 175, 0.12);\n}\n.ctx-item.ctx-identify[_ngcontent-%COMP%] {\n  color: #eab308;\n}\n.ctx-item.ctx-identify[_ngcontent-%COMP%]:hover {\n  background: rgba(234, 179, 8, 0.12);\n}\n.field[_ngcontent-%COMP%] {\n  margin-bottom: 0.8rem;\n}\n.field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.2rem;\n  font-weight: 500;\n  font-size: 0.85rem;\n  color: var(--text);\n}\n.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.4rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  font-family: inherit;\n  font-size: 0.85rem;\n  box-sizing: border-box;\n  background: var(--bg);\n  color: var(--text);\n}\n.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  resize: vertical;\n}\n.checkbox-field[_ngcontent-%COMP%] {\n  flex-direction: row !important;\n  align-items: center;\n}\n.checkbox-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  margin-bottom: 0;\n}\n.checkbox-field[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: auto;\n  cursor: pointer;\n}\n/*# sourceMappingURL=item.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ItemComponent, [{
    type: Component,
    args: [{ selector: "app-item", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="item-card"
     [class.unusable]="!canUseItem"
     [class.broken]="item.broken"
     [class.lost]="item.lost"
     [class.folded]="isFolded"
     [class.compact]="compact"
     [class.unidentified]="!showDetails"
     [class.weapon]="item.itemType === 'weapon'"
     [class.armor]="item.itemType === 'armor'"
     (contextmenu)="onRightClick($event)"
     (dblclick)="onCardDblClick($event)">

  <!-- Context menu -->
  @if (showContextMenu) {
    <div class="context-menu" [style.top.px]="contextMenuY" [style.left.px]="contextMenuX" (click)="$event.stopPropagation()">
      @if (!showDetails) {
        <button class="ctx-item ctx-identify" (click)="identifyFromMenu()">\u{1F50D} Identifizieren</button>
      }
      @if (showDetails) {
        @if (item.itemType === 'potion' && item.potionEffects?.length) {
          <button class="ctx-item ctx-use" (click)="usePotionFromMenu()"><span class="app-icon i-brewing"></span> Auf sich anwenden</button>
        }
        <button class="ctx-item" (click)="openEditorFromMenu()"><span class="app-icon i-draw"></span> Bearbeiten</button>
        <button class="ctx-item ctx-lost" (click)="toggleLostFromMenu()">
          {{ item.lost ? '\u2713 Nicht verloren' : '\u2715 Verloren markieren' }}
        </button>
      }
      <button class="ctx-item ctx-delete" (click)="deleteFromContextMenu()"><span class="app-icon i-restore-trash"></span> L\xF6schen</button>
    </div>
  }

  <div class="item-view">
    <!-- Always-visible header row -->
    <div class="item-header">
      @if (showDetails && item.itemType) {
        <span class="item-type-icon app-icon {{ itemTypeIcon }}"></span>
      }
      @if (!showDetails) {
        <span class="item-type-icon">\u2753</span>
      }

      <div class="item-name-block">
        <div class="item-title-row">
          <h4>{{ displayName }}</h4>
          @if (!showDetails) {
            <span class="unidentified-badge">Unidentifiziert</span>
          }
          @if (showDetails && item.broken) {
            <span class="broken-badge">\u26A0 Zerbrochen</span>
          }
          @if (showDetails && item.lost) {
            <span class="lost-badge">Verloren</span>
          }
        </div>
        <div class="item-tags-row">
          @if (showDetails && slotLabel) {
            <span class="tag tag-slot">{{ slotLabel }}</span>
          }
          @if (showDetails) {
            <span class="tag tag-weight" [class.tag-big]="!isFolded">{{ totalWeight }} kg</span>
          }
          @if (showDetails && item.itemType === 'weapon' && item.efficiency) {
            <span class="tag tag-eff" [class.tag-big]="!isFolded"><span class="app-icon i-effektivity"></span> {{ item.efficiency }}</span>
          }
          @if (showDetails && item.itemType === 'armor' && item.stability) {
            <span class="tag tag-stab" [class.tag-big]="!isFolded"><span class="app-icon i-stability"></span> {{ item.stability }}</span>
          }
          @if (showDetails && item.armorDebuff) {
            <span class="tag tag-debuff">-{{ item.armorDebuff }} SPD</span>
          }
          @if (showDetails && !canUseItem && !item.broken && !item.lost) {
            <span class="tag tag-unusable">Unbrauchbar</span>
          }
          @if (showDetails && item.libraryOriginName) {
            <span class="tag tag-lib" [title]="'Aus Bibliothek: ' + item.libraryOriginName"><span class="app-icon i-folder"></span> {{ item.libraryOriginName }}</span>
          }
        </div>
      </div>

      <div class="item-controls">
        @if (showDetails && item.itemType === 'weapon' && item.efficiency) {
          <button class="roll-damage-btn"
                  (click)="rollDamage.emit(item.efficiency!); $event.stopPropagation()"
                  (mousedown)="$event.stopPropagation()"
                  title="Schaden w\xFCrfeln (Eff: {{ item.efficiency }})">
            <span class="app-icon i-effektivity"></span>
          </button>
        }
        @if (!hideFoldControls) {
          <button class="fold-btn"
                  (click)="toggleFold(); $event.stopPropagation()"
                  (mousedown)="$event.stopPropagation()"
                  (touchstart)="$event.stopPropagation()"
                  [title]="isFolded ? 'Ausklappen' : 'Einklappen'">
            {{ isFolded ? '\u25BC' : '\u25B2' }}
          </button>
        }
      </div>
    </div>

    @if (!isFolded && showDetails) {

      <!-- 0. Amount (stackable items only) -->
      @if (item.stackable) {
        <div class="amount-row" (mousedown)="$event.stopPropagation()" (click)="$event.stopPropagation()">
          <span class="amount-label">Anzahl</span>
          <div class="amount-controls">
            <button class="amount-btn" (click)="updateField('amount', Math.max(1, (item.amount ?? 1) - 1)); $event.stopPropagation()">\u2212</button>
            <input
              type="number"
              class="amount-input"
              [value]="item.amount ?? 1"
              min="1"
              (change)="updateField('amount', Math.max(1, +$any($event.target).value))"
              (click)="$event.stopPropagation()" />
            <button class="amount-btn" (click)="updateField('amount', (item.amount ?? 1) + 1); $event.stopPropagation()">+</button>
          </div>
        </div>
      }

      <!-- 1. Description -->
      @if (item.description) {
        <p class="item-description" [innerHTML]="enhancedDescription"></p>
      }

      <!-- 2. Effects -->
      @if (item.primaryEffect || item.secondaryEffect || item.specialEffect) {
        <div class="effects-section">
          @if (item.primaryEffect) {
            <div class="effect-item primary">
              <span class="effect-label">Prim\xE4reffekt</span>
              <span class="effect-text">{{ item.primaryEffect }}</span>
            </div>
          }
          @if (item.secondaryEffect) {
            <div class="effect-item secondary">
              <span class="effect-label">Sekund\xE4reffekt</span>
              <span class="effect-text">{{ item.secondaryEffect }}</span>
            </div>
          }
          @if (item.specialEffect) {
            <div class="effect-item special">
              <span class="effect-label">Spezialeffekt</span>
              <span class="effect-text">{{ item.specialEffect }}</span>
            </div>
          }
        </div>
      }

      <!-- 3. Stat Modifiers -->
      @if (item.statModifiers && item.statModifiers.length > 0) {
        <div class="stat-modifiers-section">
          @for (modifier of item.statModifiers; track modifier.stat) {
            <span class="stat-modifier" [class.positive]="modifier.amount > 0" [class.negative]="modifier.amount < 0">
              {{ getStatLabel(modifier.stat) }}: {{ modifier.amount > 0 ? '+' : '' }}{{ modifier.amount }}
            </span>
          }
        </div>
      }

      <!-- 4. Dice Bonuses -->
      @if (item.diceBonuses && item.diceBonuses.length > 0) {
        <div class="dice-bonuses-section">
          @for (bonus of item.diceBonuses; track bonus.name) {
            <span class="dice-bonus" [class.good]="bonus.value < 0" [class.bad]="bonus.value > 0">
              {{ bonus.name }}: {{ bonus.value > 0 ? '+' : '' }}{{ bonus.value }}
            </span>
          }
        </div>
      }

      <!-- 5. Custom Counters -->
      @if (item.counters && item.counters.length > 0) {
        <div class="counters-section">
          @for (counter of item.counters; track counter.id) {
            <div class="bar-row" (mousedown)="$event.stopPropagation()">
              <span class="bar-label">{{ counter.name }}</span>
              <div class="bar-with-input">
                <div class="bar-track">
                  <div class="bar-fill"
                       [style.width.%]="getCounterPercent(counter)"
                       [style.backgroundColor]="counter.color">
                  </div>
                  <input
                    type="range"
                    class="bar-slider"
                    [min]="counter.min"
                    [max]="counter.max"
                    [value]="counter.current"
                    [style]="'--bar-color:' + counter.color"
                    (input)="updateCounter(counter, +$any($event.target).value); $event.stopPropagation()"
                    (click)="$event.stopPropagation()" />
                </div>
                <input
                  type="number"
                  class="bar-number-input"
                  [min]="counter.min"
                  [max]="counter.max"
                  [value]="counter.current"
                  (input)="updateCounter(counter, +$any($event.target).value); $event.stopPropagation()"
                  (click)="$event.stopPropagation()" />
              </div>
            </div>
          }
        </div>
      }

      <!-- 6. Durability -->
      @if (item.hasDurability && item.maxDurability) {
        <div class="bar-row" (mousedown)="$event.stopPropagation()">
          <span class="bar-label">Haltbarkeit</span>
          <div class="bar-with-input">
            <div class="bar-track">
              <div class="bar-fill" [class]="durabilityClass" [style.width.%]="durabilityPercent"></div>
              <input
                type="range"
                class="bar-slider"
                [min]="0"
                [max]="item.maxDurability"
                [value]="item.durability || 0"
                (input)="updateDurability(+$any($event.target).value); $event.stopPropagation()" />
            </div>
            <input
              type="number"
              class="bar-number-input"
              [min]="0"
              [max]="item.maxDurability"
              [value]="item.durability || 0"
              (input)="updateDurability(+$any($event.target).value); $event.stopPropagation()"
              (click)="$event.stopPropagation()" />
          </div>
          @if (!item.broken && (item.durability || 0) === 0) {
            <button class="break-test-btn" (click)="requestBreakTest(); $event.stopPropagation()">
              <span class="app-icon i-dice"></span> Bruchtest
            </button>
          }
        </div>
      }

      <!-- 7. Requirements -->
      @if (item.requirements && (item.requirements.strength || item.requirements.dexterity || item.requirements.speed || item.requirements.intelligence || item.requirements.constitution || item.requirements.chill)) {
        <div class="item-requirements">
          <span class="req-label">Anforderungen:</span>
          @if (item.requirements.strength) {
            <span class="req-stat" [class.unmet]="sheet.strength.current < item.requirements.strength">STR {{ item.requirements.strength }}</span>
          }
          @if (item.requirements.dexterity) {
            <span class="req-stat" [class.unmet]="sheet.dexterity.current < item.requirements.dexterity">DEX {{ item.requirements.dexterity }}</span>
          }
          @if (item.requirements.speed) {
            <span class="req-stat" [class.unmet]="sheet.speed.current < item.requirements.speed">SPD {{ item.requirements.speed }}</span>
          }
          @if (item.requirements.intelligence) {
            <span class="req-stat" [class.unmet]="sheet.intelligence.current < item.requirements.intelligence">INT {{ item.requirements.intelligence }}</span>
          }
          @if (item.requirements.constitution) {
            <span class="req-stat" [class.unmet]="sheet.constitution.current < item.requirements.constitution">CON {{ item.requirements.constitution }}</span>
          }
          @if (item.requirements.chill) {
            <span class="req-stat" [class.unmet]="sheet.chill.current < item.requirements.chill">WIL {{ item.requirements.chill }}</span>
          }
        </div>
      }

      <!-- 8. Attached Skills/Spells -->
      @if ((item.attachedSkills && item.attachedSkills.length > 0) || (item.attachedSpells && item.attachedSpells.length > 0)) {
        <div class="attached-section">
          @if (item.attachedSkills && item.attachedSkills.length > 0) {
            <div class="attached-row">
              <span class="attached-label">F\xE4higkeiten:</span>
              @for (skill of item.attachedSkills; track skill.skillId) {
                <span class="attached-skill">{{ skill.skillName }}</span>
              }
            </div>
          }
          @if (item.attachedSpells && item.attachedSpells.length > 0) {
            <div class="attached-row">
              <span class="attached-label">Zauber:</span>
              @for (spell of item.attachedSpells; track spell.spellId) {
                <span class="attached-spell">{{ spell.spellName }}</span>
              }
            </div>
          }
        </div>
      }

    } <!-- end unfolded+identified -->

    @if (!isFolded && !showDetails) {
      <div class="identify-section">
        <button class="identify-btn"
                (click)="requestIdentify(); $event.stopPropagation()"
                (mousedown)="$event.stopPropagation()">
          \u{1F50D} Identifizieren
        </button>
      </div>
    }
  </div>
</div>
`, styles: ["/* src/app/sheet/item/item.component.css */\n:host {\n  display: block;\n  width: 100%;\n}\n.item-card,\n.item-view {\n  overflow: visible;\n}\n.item-card {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 0.5rem 0.7rem;\n  transition: all 0.2s;\n  border-left: 3px solid var(--accent);\n  cursor: grab;\n  width: 100%;\n  box-sizing: border-box;\n  position: relative;\n  user-select: none;\n  -webkit-user-select: none;\n}\n.item-card.folded {\n  padding: 0.4rem 0.6rem;\n}\n.item-card.compact .item-tags-row {\n  display: none;\n}\n.item-card.compact .item-header {\n  margin-bottom: 0;\n}\n:host-context(.cdk-drag-preview) .item-card {\n  max-width: 280px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  transform: rotate(1.5deg);\n  padding: 0.4rem 0.6rem;\n}\n:host-context(.cdk-drag-preview) .item-tags-row,\n:host-context(.cdk-drag-preview) .item-controls {\n  display: none;\n}\n.item-card:active {\n  cursor: grabbing;\n}\n.item-card.unusable {\n  opacity: 0.7;\n  background: var(--bg);\n  border-left-color: #e53935;\n}\n.item-card:not(.cdk-drag-preview):hover {\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n  border-color: var(--accent);\n}\n.item-card.weapon {\n  border-left-color: #f59e0b;\n}\n.item-card.armor {\n  border-left-color: #6366f1;\n}\n.item-card.broken {\n  border-left-color: #ef4444;\n  opacity: 0.65;\n  background:\n    linear-gradient(\n      135deg,\n      var(--card) 0%,\n      #2d1f1f 100%);\n}\n.item-card.lost {\n  opacity: 0.4;\n}\n.item-card.unidentified {\n  border-left-color: #6b7280;\n  background:\n    linear-gradient(\n      135deg,\n      var(--card) 0%,\n      #2a2a35 100%);\n}\n.item-header {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n  margin-bottom: 0.25rem;\n}\n.item-type-icon {\n  font-size: 1rem;\n  flex-shrink: 0;\n  margin-top: 0.1rem;\n}\n.item-name-block {\n  flex: 1;\n  min-width: 0;\n}\n.item-title-row {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  flex-wrap: wrap;\n}\n.item-title-row h4 {\n  margin: 0;\n  font-size: 0.9rem;\n  color: var(--text);\n  font-weight: 600;\n  word-break: break-word;\n}\n.item-tags-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.2rem;\n  margin-top: 0.2rem;\n}\n.tag {\n  padding: 0.1rem 0.3rem;\n  border-radius: 3px;\n  font-size: 0.68rem;\n  font-weight: 600;\n  white-space: nowrap;\n  border: 1px solid;\n}\n.tag-weight {\n  background: var(--bg);\n  border-color: var(--border);\n  color: var(--text-muted);\n}\n.tag-eff {\n  background: #1e1b4b;\n  border-color: #6366f1;\n  color: #a5b4fc;\n}\n.tag-stab {\n  background: #1e1b4b;\n  border-color: #6366f1;\n  color: #a5b4fc;\n}\n.tag-debuff {\n  background: #4a2c00;\n  border-color: #f97316;\n  color: #fdba74;\n}\n.tag-unusable {\n  background: #4d1c21;\n  border-color: #e57373;\n  color: #ffcdd2;\n}\n.tag-lib {\n  background: #1e3a5f;\n  border-color: #3b82f6;\n  color: #93c5fd;\n  cursor: pointer;\n}\n.tag-lib:hover {\n  background: #1e4075;\n}\n.tag-slot {\n  background: var(--accent);\n  border-color: transparent;\n  color: white;\n  font-size: 0.62rem;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n}\n.item-card:not(.folded) .tag-big {\n  font-size: 0.82rem;\n  padding: 0.2rem 0.5rem;\n  font-weight: 700;\n}\n.item-controls {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n  flex-shrink: 0;\n  margin-top: 0.05rem;\n}\n.fold-btn {\n  background: transparent;\n  border: 1px solid var(--border);\n  cursor: pointer;\n  font-size: 0.9rem;\n  padding: 0.45rem;\n  opacity: 0.75;\n  transition: all 0.2s;\n  border-radius: 5px;\n  color: var(--text);\n  flex-shrink: 0;\n  min-width: 34px;\n  min-height: 34px;\n  aspect-ratio: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.fold-btn:hover {\n  opacity: 1;\n  background: var(--bg);\n  border-color: var(--accent);\n}\n.fold-btn:active {\n  transform: scale(0.95);\n}\n.roll-damage-btn {\n  background: transparent;\n  border: 1px solid var(--border);\n  cursor: pointer;\n  font-size: 0.9rem;\n  padding: 0.45rem;\n  opacity: 0.75;\n  transition: all 0.2s;\n  border-radius: 5px;\n  color: var(--text);\n  flex-shrink: 0;\n  min-width: 34px;\n  min-height: 34px;\n  aspect-ratio: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.roll-damage-btn:hover {\n  opacity: 1;\n  background: var(--bg);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.roll-damage-btn:active {\n  transform: scale(0.95);\n}\n.action-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  font-size: 0.85rem;\n  padding: 0.2rem 0.3rem;\n  opacity: 0.5;\n  transition: all 0.2s;\n  border-radius: 3px;\n  flex-shrink: 0;\n}\n.action-btn:hover {\n  opacity: 1;\n}\n.action-btn:active {\n  transform: scale(0.95);\n}\n.action-btn.active {\n  opacity: 0.3;\n  filter: grayscale(1);\n}\n.lost-btn.active {\n  background: rgba(107, 114, 128, 0.2);\n}\n.broken-badge {\n  background: #7f1d1d;\n  color: #fecaca;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 600;\n  border: 1px solid #ef4444;\n  white-space: nowrap;\n}\n.lost-badge {\n  background: #374151;\n  color: #9ca3af;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 600;\n  border: 1px solid #6b7280;\n  white-space: nowrap;\n}\n.unidentified-badge {\n  background: #4a4a4a;\n  color: #d1d5db;\n  padding: 0.1rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 600;\n  border: 1px solid #6b7280;\n  white-space: nowrap;\n}\n.amount-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 0 6px;\n  border-bottom: 1px solid var(--border);\n  margin-bottom: 6px;\n}\n.amount-label {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--muted);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.amount-controls {\n  display: flex;\n  align-items: center;\n  gap: 0;\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  overflow: hidden;\n}\n.amount-btn {\n  background: var(--bg);\n  border: none;\n  color: var(--text);\n  width: 28px;\n  height: 28px;\n  font-size: 16px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.15s;\n  flex-shrink: 0;\n}\n.amount-btn:hover {\n  background: var(--accent);\n  color: #fff;\n}\n.amount-input {\n  width: 48px;\n  background: var(--card);\n  border: none;\n  border-left: 1px solid var(--border);\n  border-right: 1px solid var(--border);\n  color: var(--text);\n  font-size: 14px;\n  font-weight: 600;\n  text-align: center;\n  height: 28px;\n  padding: 0 4px;\n}\n.amount-input:focus {\n  outline: none;\n  background: var(--bg);\n}\n.amount-input::-webkit-inner-spin-button,\n.amount-input::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n}\n.amount-input[type=number] {\n  -moz-appearance: textfield;\n}\n.item-description {\n  color: var(--text-muted);\n  margin: 0.4rem 0;\n  font-size: 0.88rem;\n  line-height: 1.5;\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  white-space: pre-wrap;\n}\n.effects-section {\n  margin: 0.4rem 0;\n  padding: 0.45rem 0.5rem;\n  background: rgba(0, 0, 0, 0.2);\n  border-radius: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n}\n.effect-item {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.effect-label {\n  font-size: 0.7rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.effect-item.primary .effect-label {\n  color: #60a5fa;\n}\n.effect-item.secondary .effect-label {\n  color: #a78bfa;\n}\n.effect-item.special .effect-label {\n  color: #fbbf24;\n}\n.effect-text {\n  font-size: 0.85rem;\n  color: var(--text);\n  line-height: 1.4;\n  white-space: pre-wrap;\n}\n.stat-modifiers-section {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin: 0.3rem 0;\n}\n.stat-modifier {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  color: var(--text);\n}\n.stat-modifier.positive {\n  background: #052e16;\n  border-color: #22c55e;\n  color: #86efac;\n}\n.stat-modifier.negative {\n  background: #450a0a;\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.dice-bonuses-section {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin: 0.3rem 0;\n}\n.dice-bonus {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  color: var(--text);\n}\n.dice-bonus.good {\n  background: #052e16;\n  border-color: #22c55e;\n  color: #86efac;\n}\n.dice-bonus.bad {\n  background: #450a0a;\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.bar-with-input {\n  display: flex;\n  align-items: center;\n  gap: 0.45rem;\n  flex: 1;\n}\n.bar-track {\n  flex: 1;\n  position: relative;\n  height: 14px;\n  background: #1f2937;\n  border-radius: 7px;\n  overflow: hidden;\n}\n.durability-slider,\n.counter-slider,\n.bar-slider {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  -webkit-appearance: none;\n  appearance: none;\n  background: transparent;\n  outline: none;\n  cursor: pointer;\n  z-index: 2;\n  margin: 0;\n  padding: 0;\n}\n.durability-slider::-webkit-slider-thumb,\n.counter-slider::-webkit-slider-thumb,\n.bar-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 14px;\n  height: 14px;\n  background: white;\n  border-radius: 50%;\n  cursor: pointer;\n  border: 2px solid var(--accent);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n  transition: transform 0.1s;\n}\n.durability-slider::-webkit-slider-thumb:hover,\n.counter-slider::-webkit-slider-thumb:hover,\n.bar-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.1);\n}\n.durability-slider::-moz-range-thumb,\n.counter-slider::-moz-range-thumb,\n.bar-slider::-moz-range-thumb {\n  width: 14px;\n  height: 14px;\n  background: white;\n  border-radius: 50%;\n  cursor: pointer;\n  border: 2px solid var(--accent);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n.bar-slider::-webkit-slider-runnable-track {\n  background: transparent;\n}\n.bar-slider::-moz-range-track {\n  background: transparent;\n  height: 14px;\n  border-radius: 7px;\n}\n.counter-fill-bg,\n.durability-bar-fill,\n.bar-fill {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  border-radius: 7px;\n  pointer-events: none;\n  z-index: 1;\n  transition: width 0.3s;\n}\n.counter-fill-bg {\n}\n.durability-bar-fill.durability-high,\n.bar-fill.durability-high {\n  background: #22c55e;\n}\n.durability-bar-fill.durability-medium,\n.bar-fill.durability-medium {\n  background: #f59e0b;\n}\n.durability-bar-fill.durability-low,\n.bar-fill.durability-low {\n  background: #ef4444;\n}\n.bar-number-input {\n  width: 42px;\n  flex-shrink: 0;\n  padding: 0.15rem 0.2rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.72rem;\n  text-align: center;\n}\n.bar-number-input:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.bar-value {\n  font-size: 0.7rem;\n  color: var(--text-muted);\n  white-space: nowrap;\n  flex-shrink: 0;\n  min-width: 32px;\n  text-align: right;\n}\n.bar-row {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin: 0.25rem 0;\n}\n.bar-label {\n  font-size: 0.72rem;\n  color: var(--text-muted);\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n  min-width: 60px;\n}\n.durability-section {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin: 0.3rem 0;\n}\n.durability-label {\n  font-size: 0.72rem;\n  color: var(--text-muted);\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.break-test-btn {\n  flex-shrink: 0;\n  padding: 0.2rem 0.5rem;\n  background: #7f1d1d;\n  border: 1px solid #ef4444;\n  border-radius: 4px;\n  color: #fecaca;\n  font-size: 0.72rem;\n  cursor: pointer;\n  transition: all 0.2s;\n  font-weight: 600;\n}\n.break-test-btn:hover {\n  background: #991b1b;\n}\n.counters-section {\n  margin: 0.3rem 0;\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.counter-row {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.counter-name {\n  font-size: 0.72rem;\n  color: var(--text);\n  font-weight: 500;\n  white-space: nowrap;\n  flex-shrink: 0;\n  width: 70px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.counter-slider {\n}\n.counter-slider::-webkit-slider-thumb {\n  border-color: var(--counter-color, var(--accent));\n}\n.counter-slider::-moz-range-thumb {\n  border-color: var(--counter-color, var(--accent));\n}\n.item-requirements {\n  display: flex;\n  gap: 0.4rem;\n  align-items: center;\n  flex-wrap: wrap;\n  margin-top: 0.5rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid var(--border);\n}\n.req-label {\n  font-size: 0.8rem;\n  color: var(--text-muted);\n  font-weight: 600;\n}\n.req-stat {\n  background: #1e3a5f;\n  color: #90caf9;\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n  border: 1px solid #42a5f5;\n  white-space: nowrap;\n  font-weight: 600;\n}\n.req-stat.unmet {\n  background: #4d1c21;\n  color: #ffcdd2;\n  border-color: #e57373;\n  text-decoration: line-through;\n}\n.attached-section {\n  margin-top: 0.4rem;\n  padding-top: 0.4rem;\n  border-top: 1px solid var(--border);\n}\n.attached-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.35rem;\n  align-items: center;\n  margin-bottom: 0.25rem;\n}\n.attached-label {\n  font-size: 0.75rem;\n  color: var(--text-muted);\n  font-weight: 500;\n}\n.attached-skill {\n  padding: 0.12rem 0.35rem;\n  background: #1e3a5f;\n  border: 1px solid #3b82f6;\n  border-radius: 4px;\n  font-size: 0.72rem;\n  color: #93c5fd;\n}\n.attached-spell {\n  padding: 0.12rem 0.35rem;\n  background: #3b0764;\n  border: 1px solid #a855f7;\n  border-radius: 4px;\n  font-size: 0.72rem;\n  color: #d8b4fe;\n}\n.identify-section {\n  padding: 0.4rem 0;\n}\n.identify-btn {\n  background: #4f46e5;\n  color: white;\n  padding: 0.3rem 0.6rem;\n  border-radius: 4px;\n  font-size: 0.78rem;\n  font-weight: 600;\n  border: 1px solid #6366f1;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.identify-btn:hover {\n  background: #5b52e8;\n  border-color: #818cf8;\n}\n.context-menu {\n  position: fixed;\n  z-index: 99999;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.55);\n  min-width: 145px;\n  overflow: hidden;\n  padding: 0.2rem 0;\n}\n.ctx-item {\n  display: flex;\n  align-items: center;\n  gap: 0.45rem;\n  width: 100%;\n  padding: 0.5rem 0.85rem;\n  background: none;\n  border: none;\n  color: var(--text);\n  cursor: pointer;\n  font-size: 0.88rem;\n  text-align: left;\n  transition: background 0.15s;\n}\n.ctx-item:hover {\n  background: var(--bg);\n}\n.ctx-item.ctx-delete {\n  color: #f87171;\n}\n.ctx-item.ctx-delete:hover {\n  background: rgba(239, 68, 68, 0.12);\n}\n.ctx-item.ctx-lost {\n  color: #9ca3af;\n}\n.ctx-item.ctx-lost:hover {\n  background: rgba(156, 163, 175, 0.12);\n}\n.ctx-item.ctx-identify {\n  color: #eab308;\n}\n.ctx-item.ctx-identify:hover {\n  background: rgba(234, 179, 8, 0.12);\n}\n.field {\n  margin-bottom: 0.8rem;\n}\n.field label {\n  display: block;\n  margin-bottom: 0.2rem;\n  font-weight: 500;\n  font-size: 0.85rem;\n  color: var(--text);\n}\n.field input,\n.field textarea {\n  width: 100%;\n  padding: 0.4rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  font-family: inherit;\n  font-size: 0.85rem;\n  box-sizing: border-box;\n  background: var(--bg);\n  color: var(--text);\n}\n.field input:focus,\n.field textarea:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.field textarea {\n  resize: vertical;\n}\n.checkbox-field {\n  flex-direction: row !important;\n  align-items: center;\n}\n.checkbox-field label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  margin-bottom: 0;\n}\n.checkbox-field input[type=checkbox] {\n  width: auto;\n  cursor: pointer;\n}\n/*# sourceMappingURL=item.component.css.map */\n"] }]
  }], () => [{ type: ChangeDetectorRef }, { type: DomSanitizer }], { item: [{
    type: Input,
    args: [{ required: true }]
  }], sheet: [{
    type: Input,
    args: [{ required: true }]
  }], index: [{
    type: Input,
    args: [{ required: true }]
  }], isEditing: [{
    type: Input
  }], compact: [{
    type: Input
  }], startUnfolded: [{
    type: Input
  }], hideFoldControls: [{
    type: Input
  }], patch: [{
    type: Output
  }], delete: [{
    type: Output
  }], editingChange: [{
    type: Output
  }], openEditor: [{
    type: Output
  }], breakTest: [{
    type: Output
  }], useOnSelf: [{
    type: Output
  }], foldChange: [{
    type: Output
  }], rollDamage: [{
    type: Output
  }], onDocumentClick: [{
    type: HostListener,
    args: ["document:click"]
  }], onEscape: [{
    type: HostListener,
    args: ["document:keydown.escape"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ItemComponent, { className: "ItemComponent", filePath: "app/sheet/item/item.component.ts", lineNumber: 18 });
})();

// src/app/shared/spell-node-editor/spell-node-editor.component.ts
var _c02 = ["canvasWrap"];
var _c12 = ["svgLayer"];
var _forTrack03 = ($index, $item) => $item.id;
var _forTrack13 = ($index, $item) => $item.name;
function SpellNodeEditorComponent_For_10_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 49);
  }
}
function SpellNodeEditorComponent_For_10_Conditional_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 56);
  }
}
function SpellNodeEditorComponent_For_10_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50);
    \u0275\u0275repeaterCreate(1, SpellNodeEditorComponent_For_10_Conditional_3_For_2_Template, 1, 0, "span", 56, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.SUMMON_SQUARES);
  }
}
function SpellNodeEditorComponent_For_10_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 51);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const rune_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 2, rune_r3.drawing), \u0275\u0275sanitizeUrl)("alt", rune_r3.name);
  }
}
function SpellNodeEditorComponent_For_10_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1, "\u2726");
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_For_10_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 55);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(rune_r3.tags.join(" \xB7 "));
  }
}
function SpellNodeEditorComponent_For_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 47);
    \u0275\u0275listener("dragstart", function SpellNodeEditorComponent_For_10_Template_div_dragstart_0_listener($event) {
      const rune_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onPaletteDragStart($event, rune_r3));
    })("click", function SpellNodeEditorComponent_For_10_Template_div_click_0_listener() {
      const rune_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.inspectPaletteRune(rune_r3));
    });
    \u0275\u0275elementStart(1, "div", 48);
    \u0275\u0275conditionalCreate(2, SpellNodeEditorComponent_For_10_Conditional_2_Template, 1, 0, "div", 49)(3, SpellNodeEditorComponent_For_10_Conditional_3_Template, 3, 0, "div", 50)(4, SpellNodeEditorComponent_For_10_Conditional_4_Template, 2, 4, "img", 51)(5, SpellNodeEditorComponent_For_10_Conditional_5_Template, 2, 0, "span", 52);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 53)(7, "div", 54);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(9, SpellNodeEditorComponent_For_10_Conditional_9_Template, 2, 1, "div", 55);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const rune_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("--glow", rune_r3.name === ctx_r3.NEUTRAL_RUNE_ID ? "#6b7280" : rune_r3.glowColor || "#8b5cf6");
    \u0275\u0275classProp("palette-rune-neutral", rune_r3.name === ctx_r3.NEUTRAL_RUNE_ID);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(rune_r3.name === ctx_r3.NEUTRAL_RUNE_ID ? 2 : rune_r3.name === ctx_r3.SUMMON_RUNE_ID ? 3 : rune_r3.drawing ? 4 : 5);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r3.paletteRuneName(rune_r3));
    \u0275\u0275advance();
    \u0275\u0275conditional(rune_r3.name !== ctx_r3.NEUTRAL_RUNE_ID && rune_r3.tags.length ? 9 : -1);
  }
}
function SpellNodeEditorComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 10);
    \u0275\u0275text(1, "Keine Runen gefunden");
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_For_40_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 60);
    \u0275\u0275element(1, "div", 67);
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_For_40_Conditional_5_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "span", 56);
  }
}
function SpellNodeEditorComponent_For_40_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 61)(1, "div", 68);
    \u0275\u0275repeaterCreate(2, SpellNodeEditorComponent_For_40_Conditional_5_For_3_Template, 1, 0, "span", 56, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.SUMMON_SQUARES);
  }
}
function SpellNodeEditorComponent_For_40_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 62);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const rune_r7 = \u0275\u0275readContextLet(0);
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 2, rune_r7.drawing), \u0275\u0275sanitizeUrl)("alt", rune_r7.name);
  }
}
function SpellNodeEditorComponent_For_40_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const rune_r7 = \u0275\u0275readContextLet(0);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(rune_r7.name.charAt(0).toUpperCase());
  }
}
function SpellNodeEditorComponent_For_40_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 64)(1, "span");
    \u0275\u0275text(2, "???");
    \u0275\u0275elementEnd()();
  }
}
function SpellNodeEditorComponent_For_40_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 65);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const node_r6 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r3.summonNodeLabel(node_r6));
  }
}
function SpellNodeEditorComponent_For_40_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 66);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const node_r6 = \u0275\u0275nextContext().$implicit;
    const rune_r7 = \u0275\u0275readContextLet(0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate((rune_r7 == null ? null : rune_r7.name) ?? node_r6.runeId);
  }
}
function SpellNodeEditorComponent_For_40_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275declareLet(0);
    \u0275\u0275elementStart(1, "div", 57);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_For_40_Template_div_mousedown_1_listener($event) {
      const node_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onNodeMouseDown($event, node_r6.id));
    })("click", function SpellNodeEditorComponent_For_40_Template_div_click_1_listener($event) {
      const node_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onNodeClick($event, node_r6));
    });
    \u0275\u0275elementStart(2, "div", 58);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_For_40_Template_div_mousedown_2_listener($event) {
      const node_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onPortMouseDown($event, node_r6.id, "flow-in"));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 59);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_For_40_Template_div_mousedown_3_listener($event) {
      const node_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onPortMouseDown($event, node_r6.id, "flow-out"));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, SpellNodeEditorComponent_For_40_Conditional_4_Template, 2, 0, "div", 60)(5, SpellNodeEditorComponent_For_40_Conditional_5_Template, 4, 0, "div", 61)(6, SpellNodeEditorComponent_For_40_Conditional_6_Template, 2, 4, "img", 62)(7, SpellNodeEditorComponent_For_40_Conditional_7_Template, 3, 1, "div", 63)(8, SpellNodeEditorComponent_For_40_Conditional_8_Template, 3, 0, "div", 64);
    \u0275\u0275conditionalCreate(9, SpellNodeEditorComponent_For_40_Conditional_9_Template, 2, 1, "div", 65)(10, SpellNodeEditorComponent_For_40_Conditional_10_Template, 2, 1, "div", 66);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const node_r6 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    const rune_r8 = \u0275\u0275storeLet(ctx_r3.getNodeRune(node_r6.id));
    const isNeutral_r9 = node_r6.runeId === ctx_r3.NEUTRAL_RUNE_ID;
    const isSummon_r10 = node_r6.runeId === ctx_r3.SUMMON_RUNE_ID;
    \u0275\u0275advance();
    \u0275\u0275styleProp("left", node_r6.x, "px")("top", node_r6.y, "px")("--glow", ctx_r3.nodeGlowColor(node_r6.id));
    \u0275\u0275classProp("rune-node-drag", ctx_r3.draggingNodeId === node_r6.id)("rune-node-selected", ctx_r3.isNodeSelected(node_r6.id));
    \u0275\u0275advance();
    \u0275\u0275styleProp("--pc", "#8b5cf6")("left", -ctx_r3.PORT_R, "px")("top", ctx_r3.NODE_IMG / 2 - ctx_r3.PORT_R, "px");
    \u0275\u0275classProp("rune-port-hovered", ctx_r3.isPortHovered(node_r6.id, "flow-in"))("rune-port-valid", ctx_r3.isPendingValidTarget(node_r6.id, "flow-in"));
    \u0275\u0275attribute("data-node-id", node_r6.id);
    \u0275\u0275advance();
    \u0275\u0275styleProp("--pc", "#8b5cf6")("left", ctx_r3.NODE_IMG - ctx_r3.PORT_R, "px")("top", ctx_r3.NODE_IMG / 2 - ctx_r3.PORT_R, "px");
    \u0275\u0275classProp("rune-port-hovered", ctx_r3.isPortHovered(node_r6.id, "flow-out"))("rune-port-valid", ctx_r3.isPendingValidTarget(node_r6.id, "flow-out"));
    \u0275\u0275attribute("data-node-id", node_r6.id);
    \u0275\u0275advance();
    \u0275\u0275conditional(isNeutral_r9 ? 4 : isSummon_r10 ? 5 : (rune_r8 == null ? null : rune_r8.drawing) ? 6 : rune_r8 ? 7 : 8);
    \u0275\u0275advance(5);
    \u0275\u0275conditional(isSummon_r10 ? 9 : !isNeutral_r9 ? 10 : -1);
  }
}
function SpellNodeEditorComponent_For_43_Conditional_0_Conditional_4_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "circle", 77);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_For_43_Conditional_0_Conditional_4_For_1_Template_circle_mousedown_0_listener($event) {
      const \u0275$index_161_r14 = \u0275\u0275restoreView(_r13).$index;
      const c_r12 = \u0275\u0275nextContext(3).$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onWaypointMouseDown($event, c_r12.id, \u0275$index_161_r14));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const wp_r15 = ctx.$implicit;
    const \u0275$index_161_r14 = ctx.$index;
    const c_r12 = \u0275\u0275nextContext(3).$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275classProp("conn-waypoint-selected", ctx_r3.isConnectionSelected(c_r12.id) || ctx_r3.isWaypointSelected(c_r12.id, \u0275$index_161_r14));
    \u0275\u0275attribute("cx", ctx_r3.worldToCanvasLocal(wp_r15.x, wp_r15.y).x)("cy", ctx_r3.worldToCanvasLocal(wp_r15.x, wp_r15.y).y);
  }
}
function SpellNodeEditorComponent_For_43_Conditional_0_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, SpellNodeEditorComponent_For_43_Conditional_0_Conditional_4_For_1_Template, 1, 4, ":svg:circle", 76, \u0275\u0275repeaterTrackByIndex);
  }
  if (rf & 2) {
    const c_r12 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275repeater(c_r12.waypoints);
  }
}
function SpellNodeEditorComponent_For_43_Conditional_0_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "path", 74);
  }
  if (rf & 2) {
    const c_r12 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275attribute("d", ctx_r3.connectionPathScreen(c_r12));
  }
}
function SpellNodeEditorComponent_For_43_Conditional_0_Conditional_6_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "text", 80);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r12 = \u0275\u0275nextContext(3).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", c_r12.maxPassthrough, "\xD7");
  }
}
function SpellNodeEditorComponent_For_43_Conditional_0_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "g", 75);
    \u0275\u0275element(1, "circle", 78);
    \u0275\u0275elementStart(2, "text", 79);
    \u0275\u0275text(3, "\u27F3");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, SpellNodeEditorComponent_For_43_Conditional_0_Conditional_6_Conditional_4_Template, 2, 1, ":svg:text", 80);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const pp_r16 = ctx;
    const c_r12 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275attribute("transform", "translate(" + pp_r16.x + "," + pp_r16.y + ") scale(" + ctx_r3.zoom + ")");
    \u0275\u0275advance(4);
    \u0275\u0275conditional(c_r12.maxPassthrough ? 4 : -1);
  }
}
function SpellNodeEditorComponent_For_43_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "g", 70);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_For_43_Conditional_0_Template_g_click_0_listener($event) {
      \u0275\u0275restoreView(_r11);
      const c_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onConnGroupClick($event, c_r12));
    })("dblclick", function SpellNodeEditorComponent_For_43_Conditional_0_Template_g_dblclick_0_listener($event) {
      \u0275\u0275restoreView(_r11);
      const c_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onConnGroupDblClick($event, c_r12));
    });
    \u0275\u0275elementStart(1, "path", 71);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_For_43_Conditional_0_Template_path_mousedown_1_listener($event) {
      \u0275\u0275restoreView(_r11);
      const c_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onConnHitMouseDown($event, c_r12));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275element(2, "path", 72)(3, "path", 73);
    \u0275\u0275conditionalCreate(4, SpellNodeEditorComponent_For_43_Conditional_0_Conditional_4_Template, 2, 0);
    \u0275\u0275conditionalCreate(5, SpellNodeEditorComponent_For_43_Conditional_0_Conditional_5_Template, 1, 1, ":svg:path", 74);
    \u0275\u0275conditionalCreate(6, SpellNodeEditorComponent_For_43_Conditional_0_Conditional_6_Template, 5, 2, ":svg:g", 75);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_24_0;
    const c_r12 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275attribute("d", ctx_r3.connectionPathScreen(c_r12));
    \u0275\u0275advance();
    \u0275\u0275classProp("conn-selected", ctx_r3.isConnectionSelected(c_r12.id))("conn-passthrough", c_r12.passthroughEnabled);
    \u0275\u0275attribute("d", ctx_r3.connectionPathScreen(c_r12))("stroke", ctx_r3.connectionColor(c_r12));
    \u0275\u0275advance();
    \u0275\u0275classProp("conn-selected", ctx_r3.isConnectionSelected(c_r12.id))("conn-passthrough", c_r12.passthroughEnabled);
    \u0275\u0275attribute("d", ctx_r3.connectionPathScreen(c_r12))("stroke", ctx_r3.connectionColor(c_r12));
    \u0275\u0275advance();
    \u0275\u0275conditional((c_r12.waypoints == null ? null : c_r12.waypoints.length) ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.isConnectionSelected(c_r12.id) ? 5 : -1);
    const bp_r17 = ctx_r3.getBadgePositions(c_r12);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_24_0 = c_r12.passthroughEnabled && bp_r17.passthrough) ? 6 : -1, tmp_24_0);
  }
}
function SpellNodeEditorComponent_For_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SpellNodeEditorComponent_For_43_Conditional_0_Template, 7, 16, ":svg:g", 69);
  }
  if (rf & 2) {
    const c_r12 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275conditional(!ctx_r3.isDirectConnection(c_r12) ? 0 : -1);
  }
}
function SpellNodeEditorComponent_Conditional_44_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "circle", 81);
  }
  if (rf & 2) {
    const sg_r18 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("cx", ctx_r3.worldToCanvasLocal(sg_r18.x, sg_r18.y).x)("cy", ctx_r3.worldToCanvasLocal(sg_r18.x, sg_r18.y).y);
  }
}
function SpellNodeEditorComponent_Conditional_44_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, SpellNodeEditorComponent_Conditional_44_For_1_Template, 1, 2, ":svg:circle", 81, \u0275\u0275repeaterTrackByIndex);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r3.waypointSnapGrid);
  }
}
function SpellNodeEditorComponent_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "circle", 34);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275attribute("cx", ctx_r3.worldToCanvasLocal(ctx_r3.pullingWaypointPos.x, ctx_r3.pullingWaypointPos.y).x)("cy", ctx_r3.worldToCanvasLocal(ctx_r3.pullingWaypointPos.x, ctx_r3.pullingWaypointPos.y).y);
  }
}
function SpellNodeEditorComponent_Conditional_46_For_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 82);
  }
  if (rf & 2) {
    const sl_r19 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("y1", ctx_r3.worldToCanvasLocal(0, sl_r19.v).y)("y2", ctx_r3.worldToCanvasLocal(0, sl_r19.v).y);
  }
}
function SpellNodeEditorComponent_Conditional_46_For_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275element(0, "line", 83);
  }
  if (rf & 2) {
    const sl_r19 = \u0275\u0275nextContext().$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("x1", ctx_r3.worldToCanvasLocal(sl_r19.v, 0).x)("x2", ctx_r3.worldToCanvasLocal(sl_r19.v, 0).x);
  }
}
function SpellNodeEditorComponent_Conditional_46_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SpellNodeEditorComponent_Conditional_46_For_2_Conditional_0_Template, 1, 2, ":svg:line", 82)(1, SpellNodeEditorComponent_Conditional_46_For_2_Conditional_1_Template, 1, 2, ":svg:line", 83);
  }
  if (rf & 2) {
    const sl_r19 = ctx.$implicit;
    \u0275\u0275conditional(sl_r19.axis === "y" ? 0 : 1);
  }
}
function SpellNodeEditorComponent_Conditional_46_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 35);
    \u0275\u0275repeaterCreate(1, SpellNodeEditorComponent_Conditional_46_For_2_Template, 2, 1, null, null, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.nodeDragSnapLines);
  }
}
function SpellNodeEditorComponent_Conditional_47_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 84);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("left", ctx_r3.marqueeRect.x, "px")("top", ctx_r3.marqueeRect.y, "px")("width", ctx_r3.marqueeRect.w, "px")("height", ctx_r3.marqueeRect.h, "px");
  }
}
function SpellNodeEditorComponent_Conditional_48_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275elementStart(0, "svg", 37);
    \u0275\u0275element(1, "path", 85);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275attribute("d", ctx_r3.pendingPathScreen())("stroke", ctx_r3.pendingColor());
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 90);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 2, ctx_r3.inspectedRune.drawing), \u0275\u0275sanitizeUrl)("alt", ctx_r3.inspectedRune.name);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_10_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 95);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r21 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(t_r21);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 92);
    \u0275\u0275repeaterCreate(1, SpellNodeEditorComponent_Conditional_61_Conditional_10_For_2_Template, 2, 1, "span", 95, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.inspectedRune.tags);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 93);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r3.inspectedRune.description);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_12_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 96)(1, "span", 97);
    \u0275\u0275text(2, "Mana");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 98);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r3.inspectedRune.mana);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_12_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 96)(1, "span", 97);
    \u0275\u0275text(2, "Fokus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 98);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r3.inspectedRune.fokus);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_12_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 96)(1, "span", 97);
    \u0275\u0275text(2, "Effekt.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 98);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r3.inspectedRune.effektivitaet);
  }
}
function SpellNodeEditorComponent_Conditional_61_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 94);
    \u0275\u0275conditionalCreate(1, SpellNodeEditorComponent_Conditional_61_Conditional_12_Conditional_1_Template, 5, 1, "div", 96);
    \u0275\u0275conditionalCreate(2, SpellNodeEditorComponent_Conditional_61_Conditional_12_Conditional_2_Template, 5, 1, "div", 96);
    \u0275\u0275conditionalCreate(3, SpellNodeEditorComponent_Conditional_61_Conditional_12_Conditional_3_Template, 5, 1, "div", 96);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.inspectedRune.mana ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.inspectedRune.fokus ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.inspectedRune.effektivitaet ? 3 : -1);
  }
}
function SpellNodeEditorComponent_Conditional_61_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "aside", 44)(1, "div", 86)(2, "span", 87);
    \u0275\u0275text(3, "Runen-Info");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 88);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_61_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r3 = \u0275\u0275nextContext();
      ctx_r3.inspectedRune = null;
      return \u0275\u0275resetView(ctx_r3.inspectedNodeId = null);
    });
    \u0275\u0275text(5, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 89);
    \u0275\u0275conditionalCreate(7, SpellNodeEditorComponent_Conditional_61_Conditional_7_Template, 2, 4, "img", 90);
    \u0275\u0275elementStart(8, "h3", 91);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, SpellNodeEditorComponent_Conditional_61_Conditional_10_Template, 3, 0, "div", 92);
    \u0275\u0275conditionalCreate(11, SpellNodeEditorComponent_Conditional_61_Conditional_11_Template, 2, 1, "p", 93);
    \u0275\u0275conditionalCreate(12, SpellNodeEditorComponent_Conditional_61_Conditional_12_Template, 4, 3, "div", 94);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275conditional(ctx_r3.inspectedRune.drawing ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275styleProp("color", ctx_r3.inspectedRune.glowColor || "#a78bfa");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r3.inspectedRune.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.inspectedRune.tags.length ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.inspectedRune.description ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.inspectedRune.mana || ctx_r3.inspectedRune.fokus || ctx_r3.inspectedRune.effektivitaet ? 12 : -1);
  }
}
function SpellNodeEditorComponent_Conditional_62_Template(rf, ctx) {
  if (rf & 1) {
    const _r22 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "aside", 45)(1, "div", 99)(2, "span", 100);
    \u0275\u0275text(3, "Verbindung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 101);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_62_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r22);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.selectedConnectionId = null);
    });
    \u0275\u0275text(5, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 102)(7, "div", 103);
    \u0275\u0275text(8, "Durchl\xE4ufe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "div", 104)(10, "button", 105);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_62_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r22);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateSelectedConnection({ passthroughEnabled: !ctx_r3.getSelectedConnection().passthroughEnabled }));
    });
    \u0275\u0275text(11, " \u27F3 Aktiv ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 106);
    \u0275\u0275listener("change", function SpellNodeEditorComponent_Conditional_62_Template_input_change_12_listener($event) {
      \u0275\u0275restoreView(_r22);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateSelectedConnection({ maxPassthrough: +$event.target.value || void 0 }));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 107);
    \u0275\u0275text(14, "Max");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(10);
    \u0275\u0275classProp("ci-toggle-active", ctx_r3.getSelectedConnection().passthroughEnabled);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", ctx_r3.getSelectedConnection().maxPassthrough ?? "")("disabled", !ctx_r3.getSelectedConnection().passthroughEnabled);
  }
}
function SpellNodeEditorComponent_Conditional_63_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 108);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_63_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onCloseDialogCancel());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(1, "div", 109)(2, "div", 110);
    \u0275\u0275text(3, "Ungespeicherte \xC4nderungen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 111);
    \u0275\u0275text(5, "M\xF6chtest du die \xC4nderungen an diesem Zauber speichern?");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 112)(7, "button", 113);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_63_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onCloseConfirmSave());
    });
    \u0275\u0275text(8, "Speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 114);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_63_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onCloseConfirmDiscard());
    });
    \u0275\u0275text(10, "Nicht speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 115);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_63_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onCloseDialogCancel());
    });
    \u0275\u0275text(12, "Abbrechen");
    \u0275\u0275elementEnd()()();
  }
}
function SpellNodeEditorComponent_Conditional_64_For_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 122);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r26 = ctx.$implicit;
    \u0275\u0275property("value", c_r26.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(c_r26.name);
  }
}
function SpellNodeEditorComponent_Conditional_64_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 123);
    \u0275\u0275text(1, "Keine Begleiter vorhanden. Lege sie im Begleiter-Tab des Charakterbogens an.");
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_Conditional_64_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 123);
    \u0275\u0275text(1, "Begleiter werden im Begleiter-Tab erstellt und bearbeitet.");
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_Conditional_64_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 124);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const comp_r27 = ctx;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", comp_r27.name, " (Lv ", (comp_r27.statblock.soul == null ? null : comp_r27.statblock.soul.level) ?? comp_r27.statblock.level, ")");
  }
}
function SpellNodeEditorComponent_Conditional_64_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 123);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const sn_r25 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u201E", sn_r25.summon == null ? null : sn_r25.summon.companionName, '" existiert nicht mehr.');
  }
}
function SpellNodeEditorComponent_Conditional_64_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 116);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_Conditional_64_Template_div_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r24);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(1, "div", 117);
    \u0275\u0275element(2, "img", 118);
    \u0275\u0275text(3, " Beschw\xF6rung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "label", 119)(5, "span");
    \u0275\u0275text(6, "Begleiter");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "select", 120);
    \u0275\u0275listener("ngModelChange", function SpellNodeEditorComponent_Conditional_64_Template_select_ngModelChange_7_listener($event) {
      const sn_r25 = \u0275\u0275restoreView(_r24);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.assignSummonCompanion(sn_r25, $event));
    });
    \u0275\u0275elementStart(8, "option", 121);
    \u0275\u0275text(9, "\u2014 Begleiter w\xE4hlen \u2014");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(10, SpellNodeEditorComponent_Conditional_64_For_11_Template, 2, 2, "option", 122, _forTrack03);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(12, SpellNodeEditorComponent_Conditional_64_Conditional_12_Template, 2, 0, "p", 123)(13, SpellNodeEditorComponent_Conditional_64_Conditional_13_Template, 2, 0, "p", 123);
    \u0275\u0275conditionalCreate(14, SpellNodeEditorComponent_Conditional_64_Conditional_14_Template, 2, 2, "span", 124)(15, SpellNodeEditorComponent_Conditional_64_Conditional_15_Template, 2, 1, "span", 123);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_6_0;
    const sn_r25 = ctx;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275property("ngModel", (sn_r25.summon == null ? null : sn_r25.summon.companionId) ?? "");
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r3.availableCompanions);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(!ctx_r3.availableCompanions.length ? 12 : 13);
    \u0275\u0275advance(2);
    \u0275\u0275conditional((tmp_6_0 = ctx_r3.summonCompanion(sn_r25)) ? 14 : (sn_r25.summon == null ? null : sn_r25.summon.companionId) ? 15 : -1, tmp_6_0);
  }
}
function SpellNodeEditorComponent_Conditional_65_For_7_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 134);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const r_r30 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 2, r_r30.drawing), \u0275\u0275sanitizeUrl)("alt", r_r30.name);
  }
}
function SpellNodeEditorComponent_Conditional_65_For_7_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 135);
    \u0275\u0275text(1, "\u2726");
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_Conditional_65_For_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r29 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 132);
    \u0275\u0275listener("click", function SpellNodeEditorComponent_Conditional_65_For_7_Template_button_click_0_listener() {
      const r_r30 = \u0275\u0275restoreView(_r29).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.selectQsRune(r_r30));
    });
    \u0275\u0275elementStart(1, "span", 133);
    \u0275\u0275conditionalCreate(2, SpellNodeEditorComponent_Conditional_65_For_7_Conditional_2_Template, 2, 4, "img", 134)(3, SpellNodeEditorComponent_Conditional_65_For_7_Conditional_3_Template, 2, 0, "span", 135);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 136);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const r_r30 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("qs-item-incompatible", !ctx_r3.isRuneCompatibleWithPending(r_r30));
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", "radial-gradient(circle at 40% 35%, " + (r_r30.glowColor || "#8b5cf6") + "44 0%, transparent 70%)");
    \u0275\u0275advance();
    \u0275\u0275conditional(r_r30.drawing ? 2 : 3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(r_r30.name);
  }
}
function SpellNodeEditorComponent_Conditional_65_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 131);
    \u0275\u0275text(1, "Keine Rune gefunden");
    \u0275\u0275elementEnd();
  }
}
function SpellNodeEditorComponent_Conditional_65_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 125);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_Conditional_65_Template_div_mousedown_0_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeQuickSearch());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(1, "div", 126);
    \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_Conditional_65_Template_div_mousedown_1_listener($event) {
      \u0275\u0275restoreView(_r28);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 127);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 128);
    \u0275\u0275twoWayListener("ngModelChange", function SpellNodeEditorComponent_Conditional_65_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r28);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.qsQuery, $event) || (ctx_r3.qsQuery = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.escape", function SpellNodeEditorComponent_Conditional_65_Template_input_keydown_escape_4_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeQuickSearch());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 129);
    \u0275\u0275repeaterCreate(6, SpellNodeEditorComponent_Conditional_65_For_7_Template, 6, 6, "button", 130, _forTrack13);
    \u0275\u0275conditionalCreate(8, SpellNodeEditorComponent_Conditional_65_Conditional_8_Template, 2, 0, "div", 131);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275styleProp("left", ctx_r3.qsX, "px")("top", ctx_r3.qsY, "px");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.qsPending ? "Rune platzieren & verbinden" : "Rune hinzuf\xFCgen");
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.qsQuery);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.qsResults);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r3.qsResults.length === 0 ? 8 : -1);
  }
}
var SpellNodeEditorComponent = class _SpellNodeEditorComponent {
  cdr;
  spell = null;
  availableRunes = [];
  /** The caster's Begleiter (sheet → Begleiter tab) — a summoning rune just references one. */
  availableCompanions = [];
  save = new EventEmitter();
  cancel = new EventEmitter();
  deleteSpell = new EventEmitter();
  SUMMON_RUNE_ID = SUMMON_RUNE_ID;
  estimatedCostResult = new EventEmitter();
  get isNewSpell() {
    return this.spell === null;
  }
  canvasWrapRef;
  svgRef;
  // ── View state ─────────────────────────────────────────────────────────────
  showProperties = false;
  // ── Spell meta ─────────────────────────────────────────────────────────────
  spellName = "Neuer Zauber";
  spellDescription = "";
  spellTags = [];
  allTagOptions = SPELL_TAG_OPTIONS;
  // ── Spell costs (manual / calculated) ─────────────────────────────────────
  spellCostMana = 0;
  spellCostFokus = 0;
  spellStatRequirements = {};
  // ── Rune palette ───────────────────────────────────────────────────────────
  paletteSearch = "";
  get filteredPaletteRunes() {
    const q = this.paletteSearch.toLowerCase();
    const filtered = this.availableRunes.filter((r) => r.name.toLowerCase().includes(q) || (r.tags || []).some((t) => t.toLowerCase().includes(q)));
    const specials = [];
    if (!q || "neutral".includes(q)) {
      specials.push({ name: NEUTRAL_RUNE_ID, glowColor: "#6b7280", tags: ["neutral"] });
    }
    if (!q || "beschw\xF6rung".includes(q) || "summon".includes(q) || "seele".includes(q)) {
      specials.push({ name: SUMMON_RUNE_ID, glowColor: "#a78bfa", tags: ["beschw\xF6rung"] });
    }
    return [...specials, ...filtered];
  }
  // ── Graph state ────────────────────────────────────────────────────────────
  graph = {
    startNode: { x: 160, y: 300 },
    nodes: [],
    connections: []
  };
  nodeStates = /* @__PURE__ */ new Map();
  // ── Viewport ───────────────────────────────────────────────────────────────
  panX = 0;
  panY = 0;
  zoom = 1;
  MIN_ZOOM = 0.2;
  MAX_ZOOM = 2.5;
  // Node size constants
  NODE_IMG = 110;
  // rune image size (square)
  NODE_W = 110;
  // alias kept for drop centering
  PORT_R = 8;
  // port circle radius
  PORT_GAP = 28;
  // vertical spacing between stacked ports
  // ── Interaction state ──────────────────────────────────────────────────────
  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  panStartPanX = 0;
  panStartPanY = 0;
  draggingNodeId = null;
  dragOffsetX = 0;
  dragOffsetY = 0;
  // Signals — drive template reactivity in Angular 21 zoneless
  pending = signal(null, ...ngDevMode ? [{ debugName: "pending" }] : []);
  hoveredPort = signal(null, ...ngDevMode ? [{ debugName: "hoveredPort" }] : []);
  graphNodesSig = signal([], ...ngDevMode ? [{ debugName: "graphNodesSig" }] : []);
  graphConnectionsSig = signal([], ...ngDevMode ? [{ debugName: "graphConnectionsSig" }] : []);
  selectedConnectionId = null;
  // Multi-select
  selectedNodeIds = /* @__PURE__ */ new Set();
  // Selected waypoints: connId → set of waypoint indices
  selectedWaypoints = /* @__PURE__ */ new Map();
  // Start node box-select state
  startNodeSelected = false;
  // Undo/redo stacks
  undoStack = [];
  redoStack = [];
  // Copy/paste clipboard
  clipboard = null;
  // Expose for cursor CSS: set on host element when user is actively dragging a waypoint
  get isWpDragging() {
    return !!this.pullingWaypointConnId || !!this.draggingWaypointConnId;
  }
  // Marquee (selection box) state
  marqueeActive = false;
  marqueeStartX = 0;
  marqueeStartY = 0;
  marqueeEndX = 0;
  marqueeEndY = 0;
  // ── Waypoint drag state ────────────────────────────────────────────────────
  // Dragging an EXISTING waypoint circle:
  draggingWaypointConnId = null;
  draggingWaypointIndex = -1;
  // Pulling a NEW waypoint out of a line segment (mousedown on conn-hit, not on a waypoint):
  pullingWaypointConnId = null;
  pullingWaypointSegIndex = -1;
  // insert position in waypoints array
  pullingWaypointPos = null;
  // Snap grid shown while dragging/pulling a waypoint:
  waypointSnapGrid = [];
  // Node drag snap indicators (world coords of matched port Ys/Xs)
  nodeDragSnapLines = [];
  // Rune inspector panel (right sidebar)
  inspectedRune = null;
  inspectedNodeId = null;
  // Save feedback
  savedFeedback = false;
  lastSavedJson = "";
  // ── Close-confirmation dialog ──
  showCloseDialog = false;
  // ── Spell cost estimate (simple sum) ──────────────────────────────────────
  simpleEstimate = null;
  calculateEstimate() {
    const result = calculateSpellCost(this.graph, this.availableRunes);
    this.simpleEstimate = result;
    this.spellCostMana = result.mana;
    this.spellCostFokus = result.fokus;
    this.estimatedCostResult.emit(result);
  }
  // ── Quick-search popup state (drop connection into void to place+connect a rune) ──
  qsOpen = false;
  qsX = 0;
  qsY = 0;
  qsWorldX = 0;
  qsWorldY = 0;
  qsQuery = "";
  qsPending = null;
  get qsResults() {
    const q = this.qsQuery.toLowerCase().trim();
    return this.availableRunes.filter((r) => r.name !== NEUTRAL_RUNE_ID && (q === "" || r.name.toLowerCase().includes(q))).slice(0, 12);
  }
  openQuickSearch(pending, clientX, clientY) {
    const world = this.clientToWorld(clientX, clientY);
    this.qsOpen = true;
    this.qsX = Math.min(clientX, window.innerWidth - 260);
    this.qsY = Math.min(clientY, window.innerHeight - 340);
    this.qsWorldX = world.x;
    this.qsWorldY = world.y;
    this.qsQuery = "";
    this.qsPending = __spreadValues({}, pending);
    setTimeout(() => document.querySelector(".qs-input")?.focus(), 0);
  }
  /** Open quick search at canvas center without a pending connection — just places a rune. */
  openSpaceSearch() {
    const rect = this.canvasEl().getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    const world = this.clientToWorld(clientX, clientY);
    this.qsOpen = true;
    this.qsX = Math.min(clientX - 130, window.innerWidth - 260);
    this.qsY = Math.min(clientY - 170, window.innerHeight - 340);
    this.qsWorldX = world.x;
    this.qsWorldY = world.y;
    this.qsQuery = "";
    this.qsPending = null;
    setTimeout(() => document.querySelector(".qs-input")?.focus(), 0);
  }
  // ── Summoning-rune config ──────────────────────────────────────────────────
  /** The single selected node, iff it's a summoning rune — drives the config panel. */
  get selectedSummonNode() {
    if (this.selectedNodeIds.size !== 1)
      return null;
    const id = [...this.selectedNodeIds][0];
    const n = this.graph.nodes.find((x) => x.id === id);
    return n && n.runeId === SUMMON_RUNE_ID ? n : null;
  }
  /** Bind the node to one of the caster's Begleiter (built and edited in the Begleiter tab). */
  assignSummonCompanion(node, companionId) {
    const companion = this.availableCompanions.find((c) => c.id === companionId);
    if (!companion) {
      node.summon = void 0;
      this.graphNodesSig.set([...this.graph.nodes]);
      return;
    }
    node.summon = { companionId: companion.id, companionName: companion.name };
    this.graphNodesSig.set([...this.graph.nodes]);
  }
  summonCompanion(node) {
    return this.availableCompanions.find((c) => c.id === node.summon?.companionId);
  }
  /** The 8 offset squares of the summoning-rune glyph — index drives the CSS animation stagger. */
  SUMMON_SQUARES = [0, 1, 2, 3, 4, 5, 6, 7];
  /** Node caption for a summoning rune — „Beschwöre: <Begleiter>“ once one is bound. */
  summonNodeLabel(node) {
    const name = this.summonCompanion(node)?.name ?? node.summon?.companionName ?? node.summon?.soulName;
    return name ? `Beschw\xF6re: ${name}` : "Beschw\xF6re:";
  }
  /** Palette caption — the special nodes carry internal ids as their name. */
  paletteRuneName(rune) {
    if (rune.name === NEUTRAL_RUNE_ID)
      return "Neutral";
    if (rune.name === SUMMON_RUNE_ID)
      return "Beschw\xF6rung";
    return rune.name;
  }
  closeQuickSearch() {
    this.qsOpen = false;
    this.qsQuery = "";
    this.qsPending = null;
  }
  selectQsRune(rune) {
    this.pushUndo();
    const wx = this.qsWorldX;
    const wy = this.qsWorldY;
    const pending = this.qsPending ? __spreadValues({}, this.qsPending) : null;
    this.closeQuickSearch();
    const newId = `node-${this.nextId++}`;
    const newNode = { id: newId, runeId: rune.name, x: wx - this.NODE_IMG / 2, y: wy - this.NODE_IMG / 2 };
    this.graph.nodes = [...this.graph.nodes, newNode];
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    if (pending) {
      const allPorts = this.allPortPositions().filter((p) => p.nodeId === newId);
      const inputPort = allPorts.find((p) => p.kind === "flow-in" && this.canConnect(pending, p));
      if (inputPort) {
        this.createConnection(pending, inputPort);
      }
    }
  }
  /** True when the rune has at least one input port compatible with the current pending connection. */
  isRuneCompatibleWithPending(rune) {
    if (!this.qsPending)
      return true;
    const ports = buildRunePorts(rune);
    return ports.some((p) => p.kind === "flow-in");
  }
  /**
   * Compute badge screen positions for a connection.
   * Returns { passthrough } as {x,y} or null.
   */
  getBadgePositions(c) {
    const passthrough = c.passthroughEnabled ? this.getPointOnPath(c, 0.15) : null;
    return { passthrough };
  }
  // Track mousedown position to distinguish click vs drag on rune nodes
  lastMouseDownX = 0;
  lastMouseDownY = 0;
  // Expose for template
  NEUTRAL_RUNE_ID = NEUTRAL_RUNE_ID;
  // ── Start node flow-out drag counter ──────────────────────────────────────
  nextId = 1;
  // ── Animation ─────────────────────────────────────────────────────────────
  animFrame = 0;
  // Bound document event handlers (stored for removeEventListener)
  boundMouseMove;
  boundMouseUp;
  constructor(cdr) {
    this.cdr = cdr;
  }
  // ────────────────────────────────────────────────────────────────────────────
  ngOnInit() {
    document.body.style.overflow = "hidden";
    if (this.spell) {
      this.spellName = this.spell.name;
      this.spellDescription = this.spell.description || "";
      this.spellTags = this.spell.tags ? [...this.spell.tags] : [];
      this.spellCostMana = this.spell.costMana ?? 0;
      this.spellCostFokus = this.spell.costFokus ?? 0;
      this.spellStatRequirements = this.spell.statRequirements ?? {};
      if (this.spell.graph) {
        this.graph = JSON.parse(JSON.stringify(this.spell.graph));
        const allNums = [
          ...this.graph.nodes.map((n) => parseInt(n.id.replace(/[^0-9]/g, ""), 10)),
          ...this.graph.connections.map((c) => parseInt(c.id.replace(/[^0-9]/g, ""), 10))
        ].filter((v) => !isNaN(v));
        if (allNums.length > 0)
          this.nextId = Math.max(...allNums) + 1;
      }
    }
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);
    this.lastSavedJson = JSON.stringify(this.graph);
    this.boundMouseMove = (e) => this.handleMouseMove(e);
    this.boundMouseUp = (e) => this.handleMouseUp(e);
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseup", this.boundMouseUp);
    this.startAnimation();
  }
  ngOnDestroy() {
    document.body.style.overflow = "";
    cancelAnimationFrame(this.animFrame);
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseup", this.boundMouseUp);
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Animation loop — drives change detection every frame so interactive drags
  // (pending connection line, node dragging, panning) stay smooth.
  startAnimation() {
    const tick = () => {
      this.cdr.detectChanges();
      this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }
  nodeFloatY(_index) {
    return 0;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Build NodeState from graph
  rebuildNodeStates() {
    const newMap = /* @__PURE__ */ new Map();
    for (const node of this.graph.nodes) {
      const existing = this.nodeStates.get(node.id);
      const isSpecial = node.runeId === NEUTRAL_RUNE_ID || node.runeId === SUMMON_RUNE_ID;
      const rune = isSpecial ? { name: node.runeId } : this.availableRunes.find((r) => r.name === node.runeId);
      const ports = rune ? buildRunePorts(rune) : [
        { id: "flow-in", kind: "flow-in", name: "Fluss" },
        { id: "flow-out", kind: "flow-out", name: "Fluss" }
      ];
      const h = this.NODE_IMG;
      newMap.set(node.id, {
        node,
        ports,
        rect: { w: this.NODE_W, h },
        floating: existing?.floating ?? false
      });
    }
    this.nodeStates = newMap;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Port world positions — MUST exactly match the CSS absolute positioning in the template
  allPortPositions() {
    const result = [];
    result.push({
      nodeId: "start",
      portId: "flow-out-0",
      kind: "flow-out",
      x: this.graph.startNode.x + 34,
      y: this.graph.startNode.y
    });
    for (const ns of this.nodeStates.values()) {
      const n = ns.node;
      const imgCY = n.y + this.NODE_IMG / 2;
      const ins = ns.ports.filter((p) => p.kind === "flow-in");
      const outs = ns.ports.filter((p) => p.kind === "flow-out");
      ins.forEach((p, i) => {
        result.push({
          nodeId: n.id,
          portId: p.id,
          kind: p.kind,
          x: n.x,
          y: imgCY - (ins.length - 1) * this.PORT_GAP / 2 + i * this.PORT_GAP
        });
      });
      outs.forEach((p, i) => {
        result.push({
          nodeId: n.id,
          portId: p.id,
          kind: p.kind,
          x: n.x + this.NODE_IMG,
          y: imgCY - (outs.length - 1) * this.PORT_GAP / 2 + i * this.PORT_GAP
        });
      });
    }
    return result;
  }
  startPortPos() {
    return {
      x: this.graph.startNode.x + 34,
      y: this.graph.startNode.y
    };
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Queen-movement router — all segments must be H, V, or 45° diagonal.
  // Returns intermediate world-space waypoints between (x1,y1)→(x2,y2) (endpoints NOT included).
  // Strategy: H → diagonal → H, splitting horizontal remainder evenly.
  queenRoute(x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx < 0.5 || ady < 0.5)
      return [];
    if (Math.abs(adx - ady) < 0.5)
      return [];
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1;
    const diag = Math.min(adx, ady);
    const hBefore = (adx - diag) / 2;
    const pts = [];
    if (hBefore > 0.5)
      pts.push({ x: x1 + sx * hBefore, y: y1 });
    pts.push({ x: x1 + sx * (hBefore + diag), y: y1 + sy * diag });
    return pts;
  }
  // Build SVG path (screen space) running queenRoute between each consecutive world-space point pair.
  buildQueenPath(worldPoints) {
    if (worldPoints.length < 2)
      return "";
    const all = [worldPoints[0]];
    for (let i = 0; i < worldPoints.length - 1; i++) {
      const a = worldPoints[i], b = worldPoints[i + 1];
      all.push(...this.queenRoute(a.x, a.y, b.x, b.y), b);
    }
    return all.map((p, i) => {
      const s = this.worldToCanvasLocal(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
    }).join(" ");
  }
  // Loop arc — rectangular arch going upward (circuit-board style, no bezier)
  loopArcPathScreen(c) {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return "";
    const worldDy = Math.abs(from.y - to.y);
    const rise = Math.max(80, worldDy * 0.8 + 80);
    const topY = Math.min(from.y, to.y) - rise;
    const pts = [
      { x: from.x, y: from.y },
      { x: from.x, y: topY },
      { x: to.x, y: topY },
      { x: to.x, y: to.y }
    ];
    return pts.map((p, i) => {
      const s = this.worldToCanvasLocal(p.x, p.y);
      return `${i === 0 ? "M" : "L"} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`;
    }).join(" ");
  }
  // Compute snap-grid points for a control point dragged between prev→next.
  // Returns positions where both prev→pt and pt→next are queen-movement.
  computeSnapGrid(prev, next) {
    const grid = [];
    const dx = next.x - prev.x, dy = next.y - prev.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
    const cxs = [
      prev.x,
      next.x,
      (prev.x + next.x) / 2,
      prev.x + sx * ady,
      prev.x - sx * ady,
      next.x + sx * ady,
      next.x - sx * ady
    ];
    const cys = [
      prev.y,
      next.y,
      (prev.y + next.y) / 2,
      prev.y + sy * adx,
      prev.y - sy * adx,
      next.y + sy * adx,
      next.y - sy * adx
    ];
    for (const cx of cxs) {
      for (const cy of cys) {
        const p = { x: cx, y: cy };
        if (this.isQueenMove(prev, p) && this.isQueenMove(p, next)) {
          grid.push(p);
        }
      }
    }
    grid.push(...this.queenRoute(prev.x, prev.y, next.x, next.y));
    const seen = /* @__PURE__ */ new Set();
    return grid.filter((p) => {
      const k = `${Math.round(p.x)},${Math.round(p.y)}`;
      if (seen.has(k))
        return false;
      seen.add(k);
      return true;
    });
  }
  isQueenMove(a, b) {
    const dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y);
    return dx < 0.5 || dy < 0.5 || Math.abs(dx - dy) < 0.5;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Connection path helpers
  connectionPath(_c) {
    return "";
  }
  // world-space — unused
  pendingPath() {
    return "";
  }
  // world-space — unused
  // Screen-space pending path
  pendingPathScreen() {
    const p = this.pending();
    if (!p)
      return "";
    const fx = p.fromX, fy = p.fromY;
    const tx = p.toX, ty = p.toY;
    return this.buildQueenPath([{ x: fx, y: fy }, { x: tx, y: ty }]);
  }
  pendingColor() {
    return FLOW_COLOR;
  }
  // Screen-space (canvas-wrap-local) — used by conn-overlay-svg
  connectionPathScreen(c) {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return "";
    const wps = c.waypoints ?? [];
    const liveWps = this.pullingWaypointConnId === c.id && this.pullingWaypointPos ? [
      ...wps.slice(0, this.pullingWaypointSegIndex),
      this.pullingWaypointPos,
      ...wps.slice(this.pullingWaypointSegIndex)
    ] : wps;
    return this.buildQueenPath([from, ...liveWps, to]);
  }
  resolvePortWorldPos(nodeId, portId) {
    const all = this.allPortPositions();
    return all.find((p) => p.nodeId === nodeId && p.portId === portId) ?? null;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Coordinate helpers
  canvasEl() {
    return this.canvasWrapRef.nativeElement;
  }
  clientToWorld(cx, cy) {
    if (!this.canvasWrapRef)
      return { x: 0, y: 0 };
    const rect = this.canvasEl().getBoundingClientRect();
    return {
      x: (cx - rect.left - this.panX) / this.zoom,
      y: (cy - rect.top - this.panY) / this.zoom
    };
  }
  // World → canvas-wrap-local (no rect offset; used by the screen-space pending line SVG)
  worldToCanvasLocal(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY
    };
  }
  worldToClient(wx, wy) {
    if (!this.canvasWrapRef)
      return { x: 0, y: 0 };
    const rect = this.canvasEl().getBoundingClientRect();
    return {
      x: wx * this.zoom + this.panX + rect.left,
      y: wy * this.zoom + this.panY + rect.top
    };
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Wheel zoom
  onWheel(e) {
    if (!this.canvasWrapRef)
      return;
    e.preventDefault();
    const rect = this.canvasEl().getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.zoom * factor));
    this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
    this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  }
  get transformStyle() {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Canvas mouse events (pan + marquee selection)
  onCanvasMouseDown(e) {
    if (!this.canvasWrapRef)
      return;
    const isCanvas = e.target === this.canvasEl() || e.target.classList.contains("svg-bg");
    if (!isCanvas)
      return;
    if (e.button === 0) {
      this.selectedConnectionId = null;
      this.selectedNodeIds = /* @__PURE__ */ new Set();
      this.startNodeSelected = false;
      const rect = this.canvasEl().getBoundingClientRect();
      this.marqueeActive = true;
      this.marqueeStartX = e.clientX - rect.left;
      this.marqueeStartY = e.clientY - rect.top;
      this.marqueeEndX = this.marqueeStartX;
      this.marqueeEndY = this.marqueeStartY;
    } else if (e.button === 1) {
      e.preventDefault();
      this.isPanning = true;
      this.panStartX = e.clientX;
      this.panStartY = e.clientY;
      this.panStartPanX = this.panX;
      this.panStartPanY = this.panY;
    }
  }
  // Document-level mouse handlers (registered manually in ngOnInit)
  handleMouseMove(e) {
    if (!this.canvasWrapRef)
      return;
    if (this.marqueeActive) {
      const rect = this.canvasEl().getBoundingClientRect();
      this.marqueeEndX = e.clientX - rect.left;
      this.marqueeEndY = e.clientY - rect.top;
    }
    if (this.isPanning) {
      this.panX = this.panStartPanX + (e.clientX - this.panStartX);
      this.panY = this.panStartPanY + (e.clientY - this.panStartY);
      return;
    }
    if (this.draggingWaypointConnId !== null) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const conn = this.graph.connections.find((c) => c.id === this.draggingWaypointConnId);
      if (conn && conn.waypoints) {
        const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
        const to = this.resolvePortWorldPos(conn.toNodeId, conn.toPortId);
        if (from && to) {
          const allPts = [from, ...conn.waypoints, to];
          const prev = allPts[this.draggingWaypointIndex];
          const next = allPts[this.draggingWaypointIndex + 2];
          let snapped = world;
          const grid = this.computeSnapGrid(prev, next);
          this.waypointSnapGrid = grid;
          const SNAP_THRESHOLD = 20;
          let bestDist = SNAP_THRESHOLD;
          for (const g of grid) {
            const d = Math.hypot(world.x - g.x, world.y - g.y);
            if (d < bestDist) {
              bestDist = d;
              snapped = g;
            }
          }
          const newWps = [...conn.waypoints];
          newWps[this.draggingWaypointIndex] = snapped;
          this.graph.connections = this.graph.connections.map((c) => c.id === this.draggingWaypointConnId ? __spreadProps(__spreadValues({}, c), { waypoints: newWps }) : c);
          this.graphConnectionsSig.set(this.graph.connections);
        }
      }
      return;
    }
    if (this.pullingWaypointConnId !== null) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      let snapped = world;
      const SNAP_THRESHOLD = 20;
      let bestDist = SNAP_THRESHOLD;
      for (const g of this.waypointSnapGrid) {
        const d = Math.hypot(world.x - g.x, world.y - g.y);
        if (d < bestDist) {
          bestDist = d;
          snapped = g;
        }
      }
      this.pullingWaypointPos = snapped;
      return;
    }
    if (this.draggingNodeId) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      const primaryNode = this.graph.nodes.find((n) => n.id === this.draggingNodeId);
      if (primaryNode) {
        const newX = world.x - this.dragOffsetX;
        const newY = world.y - this.dragOffsetY;
        let dx = newX - primaryNode.x;
        let dy = newY - primaryNode.y;
        const movingIds = new Set(this.graph.nodes.filter((n) => this.selectedNodeIds.has(n.id)).map((n) => n.id));
        const allPP = this.allPortPositions();
        const stationaryPorts = allPP.filter((pp) => !movingIds.has(pp.nodeId));
        const stationaryYs = stationaryPorts.map((pp) => pp.y);
        const stationaryXs = stationaryPorts.map((pp) => pp.x);
        const SNAP_D = 10;
        let snapDy = null;
        let snapDx = null;
        for (const pp of allPP) {
          if (!movingIds.has(pp.nodeId))
            continue;
          if (snapDy === null) {
            for (const sy of stationaryYs) {
              if (Math.abs(pp.y + dy - sy) < SNAP_D) {
                snapDy = sy - pp.y;
                break;
              }
            }
          }
          if (snapDx === null) {
            for (const sx of stationaryXs) {
              if (Math.abs(pp.x + dx - sx) < SNAP_D) {
                snapDx = sx - pp.x;
                break;
              }
            }
          }
          if (snapDy !== null && snapDx !== null)
            break;
        }
        if (snapDy !== null)
          dy = snapDy;
        if (snapDx !== null)
          dx = snapDx;
        const snapYSet = /* @__PURE__ */ new Set();
        const snapXSet = /* @__PURE__ */ new Set();
        for (const pp of allPP) {
          if (!movingIds.has(pp.nodeId))
            continue;
          for (const sy of stationaryYs) {
            if (Math.abs(pp.y + dy - sy) < 0.5)
              snapYSet.add(sy);
          }
          for (const sx of stationaryXs) {
            if (Math.abs(pp.x + dx - sx) < 0.5)
              snapXSet.add(sx);
          }
        }
        this.nodeDragSnapLines = [
          ...Array.from(snapYSet).map((y) => ({ axis: "y", v: y })),
          ...Array.from(snapXSet).map((x) => ({ axis: "x", v: x }))
        ];
        for (const node of this.graph.nodes) {
          if (this.selectedNodeIds.has(node.id)) {
            node.x += dx;
            node.y += dy;
            this.nodeStates.get(node.id).node = node;
          }
        }
        if (this.startNodeSelected) {
          this.graph.startNode.x += dx;
          this.graph.startNode.y += dy;
        }
        for (const [connId, wpIndices] of this.selectedWaypoints) {
          const conn = this.graph.connections.find((c) => c.id === connId);
          if (conn && conn.waypoints) {
            const newWps = conn.waypoints.map((wp, i) => wpIndices.has(i) ? { x: wp.x + dx, y: wp.y + dy } : wp);
            conn.waypoints = newWps;
          }
        }
        if (this.selectedWaypoints.size > 0) {
          this.graph.connections = [...this.graph.connections];
          this.graphConnectionsSig.set(this.graph.connections);
        }
        this.graphNodesSig.set([...this.graph.nodes]);
      }
      return;
    }
    const cur = this.pending();
    if (cur) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      this.pending.set(__spreadProps(__spreadValues({}, cur), { toX: world.x, toY: world.y }));
      const near = this.findPortAt(world.x, world.y, 22);
      this.hoveredPort.set(near && this.canConnect(cur, near) ? near : null);
      return;
    }
    if (this.isDraggingStartNode) {
      const world = this.clientToWorld(e.clientX, e.clientY);
      let newSX = world.x - this.startNodeDragOffX;
      let newSY = world.y - this.startNodeDragOffY;
      const SNAP_D = 10;
      const allPP = this.allPortPositions();
      for (const pp of allPP) {
        if (pp.nodeId === "start")
          continue;
        if (pp.kind !== "flow-in")
          continue;
        if (Math.abs(newSY - pp.y) < SNAP_D) {
          newSY = pp.y;
          break;
        }
      }
      const dxS = newSX - this.graph.startNode.x;
      const dyS = newSY - this.graph.startNode.y;
      this.graph.startNode.x = newSX;
      this.graph.startNode.y = newSY;
      for (const node of this.graph.nodes) {
        if (this.selectedNodeIds.has(node.id)) {
          node.x += dxS;
          node.y += dyS;
          this.nodeStates.get(node.id).node = node;
        }
      }
      if (this.selectedNodeIds.size > 0)
        this.graphNodesSig.set([...this.graph.nodes]);
    }
  }
  handleMouseUp(e) {
    if (!this.canvasWrapRef)
      return;
    const cur = this.pending();
    if (cur) {
      const portEl = e.target.closest("[data-port-id]");
      const nodeId = portEl?.dataset["nodeId"];
      const portId = portEl?.dataset["portId"];
      let target = null;
      if (nodeId && portId) {
        const pp = this.allPortPositions().find((p) => p.nodeId === nodeId && p.portId === portId);
        if (pp && this.canConnect(cur, pp))
          target = pp;
      }
      if (!target) {
        const world = this.clientToWorld(e.clientX, e.clientY);
        const near = this.findPortAt(world.x, world.y, 40);
        if (near && this.canConnect(cur, near))
          target = near;
      }
      if (target) {
        this.createConnection(cur, target);
      } else if (!cur.isPickup) {
        this.openQuickSearch(cur, e.clientX, e.clientY);
      }
      this.pending.set(null);
      this.hoveredPort.set(null);
      return;
    }
    if (this.pullingWaypointConnId !== null) {
      const connId = this.pullingWaypointConnId;
      const segIdx = this.pullingWaypointSegIndex;
      const pos = this.pullingWaypointPos;
      this.pullingWaypointConnId = null;
      this.pullingWaypointSegIndex = -1;
      this.pullingWaypointPos = null;
      this.waypointSnapGrid = [];
      if (pos) {
        const conn = this.graph.connections.find((c) => c.id === connId);
        if (conn) {
          const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
          const to = this.resolvePortWorldPos(conn.toNodeId, conn.toPortId);
          if (from && to) {
            const wps = conn.waypoints ?? [];
            const allPts = [from, ...wps, to];
            const prev = allPts[segIdx];
            const next = allPts[segIdx + 1];
            const autoRoute = [prev, ...this.queenRoute(prev.x, prev.y, next.x, next.y), next];
            const isRedundant = autoRoute.slice(0, -1).some((a, i) => this.distToSegment(pos, a, autoRoute[i + 1]) < 4);
            if (!isRedundant) {
              const newWps = [...wps.slice(0, segIdx), pos, ...wps.slice(segIdx)];
              this.updateConnectionWaypoints(connId, newWps);
            }
          }
        }
      }
      return;
    }
    if (this.draggingWaypointConnId !== null) {
      const connId = this.draggingWaypointConnId;
      const wpIdx = this.draggingWaypointIndex;
      this.draggingWaypointConnId = null;
      this.draggingWaypointIndex = -1;
      this.waypointSnapGrid = [];
      const conn = this.graph.connections.find((c) => c.id === connId);
      if (conn && conn.waypoints) {
        const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
        const to = this.resolvePortWorldPos(conn.toNodeId, conn.toPortId);
        if (from && to) {
          const allPts = [from, ...conn.waypoints, to];
          const prev = allPts[wpIdx];
          const wp = allPts[wpIdx + 1];
          const next = allPts[wpIdx + 2];
          if (prev && next && wp) {
            const autoRoute = [prev, ...this.queenRoute(prev.x, prev.y, next.x, next.y), next];
            const isRedundant = autoRoute.slice(0, -1).some((a, i) => this.distToSegment(wp, a, autoRoute[i + 1]) < 6);
            if (isRedundant) {
              const newWps = conn.waypoints.filter((_, i) => i !== wpIdx);
              this.updateConnectionWaypoints(connId, newWps);
            }
          }
        }
      }
      return;
    }
    if (this.marqueeActive) {
      this.marqueeActive = false;
      this.finishMarqueeSelection();
    }
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }
    if (this.isDraggingStartNode) {
      this.isDraggingStartNode = false;
      return;
    }
    if (this.draggingNodeId) {
      this.trySnapConnect();
      this.draggingNodeId = null;
      this.nodeDragSnapLines = [];
      return;
    }
  }
  // Returns true if wp lies within `threshold` units of the line segment prev→next
  isNearlyCollinear(prev, wp, next, threshold) {
    return this.distToSegment(wp, prev, next) < threshold;
  }
  /**
   * When a node drag ends, detect if any moved ports are within PORT_R*2 world units
   * of a stationary port with a compatible direction. If so, snap the node
   * position so ports exactly coincide and auto-create the connections.
   */
  trySnapConnect() {
    const SNAP_R = this.PORT_R * 2;
    const movedIds = /* @__PURE__ */ new Set();
    for (const n of this.graph.nodes) {
      if (this.selectedNodeIds.has(n.id))
        movedIds.add(n.id);
    }
    if (this.draggingNodeId)
      movedIds.add(this.draggingNodeId);
    const allPP = this.allPortPositions();
    const movedPorts = allPP.filter((pp) => movedIds.has(pp.nodeId));
    const stationaryPorts = allPP.filter((pp) => !movedIds.has(pp.nodeId));
    let bestDist = SNAP_R;
    let snapDx = 0, snapDy = 0;
    let hasPair = false;
    for (const mp of movedPorts) {
      for (const sp of stationaryPorts) {
        const dist = Math.hypot(mp.x - sp.x, mp.y - sp.y);
        if (dist >= bestDist)
          continue;
        const mpIsOut = mp.kind === "flow-out";
        const spIsIn = sp.kind === "flow-in";
        const mpIsIn = mp.kind === "flow-in";
        const spIsOut = sp.kind === "flow-out";
        if (!(mpIsOut && spIsIn) && !(mpIsIn && spIsOut))
          continue;
        bestDist = dist;
        snapDx = sp.x - mp.x;
        snapDy = sp.y - mp.y;
        hasPair = true;
      }
    }
    if (!hasPair)
      return;
    for (const n of this.graph.nodes) {
      if (movedIds.has(n.id)) {
        n.x += snapDx;
        n.y += snapDy;
        this.nodeStates.get(n.id).node = n;
      }
    }
    this.graphNodesSig.set([...this.graph.nodes]);
    const freshPP = this.allPortPositions();
    const freshMoved = freshPP.filter((pp) => movedIds.has(pp.nodeId));
    const freshStationary = freshPP.filter((pp) => !movedIds.has(pp.nodeId));
    for (const mp of freshMoved) {
      for (const sp of freshStationary) {
        if (Math.hypot(mp.x - sp.x, mp.y - sp.y) > 1)
          continue;
        const mpIsOut = mp.kind === "flow-out";
        const spIsIn = sp.kind === "flow-in";
        const mpIsIn = mp.kind === "flow-in";
        const spIsOut = sp.kind === "flow-out";
        if (!(mpIsOut && spIsIn) && !(mpIsIn && spIsOut))
          continue;
        const fromPort = mpIsOut ? mp : sp;
        const toPort = mpIsOut ? sp : mp;
        this.createSingleConnection(fromPort.nodeId, fromPort.portId, toPort.nodeId, toPort.portId);
      }
    }
    this.graphConnectionsSig.set(this.graph.connections);
  }
  /** True when a connection's from-port and to-port are at the same world position (direct/snap connection → hidden). */
  isDirectConnection(c) {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return false;
    return Math.hypot(from.x - to.x, from.y - to.y) < 2;
  }
  // Compute marquee rect in world space and select contained nodes and waypoints
  finishMarqueeSelection() {
    const ax = Math.min(this.marqueeStartX, this.marqueeEndX);
    const ay = Math.min(this.marqueeStartY, this.marqueeEndY);
    const bx = Math.max(this.marqueeStartX, this.marqueeEndX);
    const by = Math.max(this.marqueeStartY, this.marqueeEndY);
    const threshold = 6;
    if (bx - ax < threshold && by - ay < threshold)
      return;
    const wa = { x: (ax - this.panX) / this.zoom, y: (ay - this.panY) / this.zoom };
    const wb = { x: (bx - this.panX) / this.zoom, y: (by - this.panY) / this.zoom };
    const selected = /* @__PURE__ */ new Set();
    for (const node of this.graph.nodes) {
      const nx = node.x, ny = node.y, nw = this.NODE_IMG, nh = this.NODE_IMG;
      if (nx + nw >= wa.x && nx <= wb.x && ny + nh >= wa.y && ny <= wb.y) {
        selected.add(node.id);
      }
    }
    this.selectedNodeIds = selected;
    const START_R = 34;
    const sn = this.graph.startNode;
    this.startNodeSelected = sn.x + START_R >= wa.x && sn.x - START_R <= wb.x && sn.y + START_R >= wa.y && sn.y - START_R <= wb.y;
    const newWpSel = /* @__PURE__ */ new Map();
    const tolW = 5 / this.zoom;
    for (const c of this.graph.connections) {
      const wps = c.waypoints ?? [];
      const sel = /* @__PURE__ */ new Set();
      for (let i = 0; i < wps.length; i++) {
        if (wps[i].x >= wa.x - tolW && wps[i].x <= wb.x + tolW && wps[i].y >= wa.y - tolW && wps[i].y <= wb.y + tolW) {
          sel.add(i);
        }
      }
      if (sel.size > 0)
        newWpSel.set(c.id, sel);
    }
    this.selectedWaypoints = newWpSel;
  }
  get marqueeRect() {
    return {
      x: Math.min(this.marqueeStartX, this.marqueeEndX),
      y: Math.min(this.marqueeStartY, this.marqueeEndY),
      w: Math.abs(this.marqueeEndX - this.marqueeStartX),
      h: Math.abs(this.marqueeEndY - this.marqueeStartY)
    };
  }
  isNodeSelected(nodeId) {
    return this.selectedNodeIds.has(nodeId);
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Node drag — if part of selection, move all selected nodes together
  onNodeMouseDown(e, nodeId) {
    if (!this.canvasWrapRef)
      return;
    e.stopPropagation();
    if (e.target.closest(".rune-port"))
      return;
    this.pushUndo();
    this.lastMouseDownX = e.clientX;
    this.lastMouseDownY = e.clientY;
    this.selectedWaypoints = /* @__PURE__ */ new Map();
    this.selectedConnectionId = null;
    if (!this.selectedNodeIds.has(nodeId)) {
      this.selectedNodeIds = /* @__PURE__ */ new Set([nodeId]);
      this.startNodeSelected = false;
    }
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    const world = this.clientToWorld(e.clientX, e.clientY);
    this.draggingNodeId = nodeId;
    this.dragOffsetX = world.x - node.x;
    this.dragOffsetY = world.y - node.y;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Start node drag
  isDraggingStartNode = false;
  startNodeDragOffX = 0;
  startNodeDragOffY = 0;
  onStartNodeMouseDown(e) {
    if (!this.canvasWrapRef)
      return;
    e.stopPropagation();
    if (e.target.closest(".rune-port, .port-circle"))
      return;
    this.pushUndo();
    if (!this.startNodeSelected) {
      this.selectedNodeIds = /* @__PURE__ */ new Set();
      this.selectedWaypoints = /* @__PURE__ */ new Map();
      this.selectedConnectionId = null;
      this.startNodeSelected = true;
    }
    const world = this.clientToWorld(e.clientX, e.clientY);
    this.isDraggingStartNode = true;
    this.startNodeDragOffX = world.x - this.graph.startNode.x;
    this.startNodeDragOffY = world.y - this.graph.startNode.y;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Port drag (start connection) — flow ports only
  // If clicking an INPUT port that already has a connection, pick up that connection.
  onPortMouseDown(e, nodeId, portId) {
    if (!this.canvasWrapRef)
      return;
    e.stopPropagation();
    e.preventDefault();
    const all = this.allPortPositions();
    const port = all.find((p) => p.nodeId === nodeId && p.portId === portId);
    if (!port)
      return;
    const isInput = port.kind === "flow-in";
    if (isInput) {
      const incoming = this.graph.connections.filter((c) => c.toNodeId === nodeId && c.toPortId === portId);
      if (incoming.length > 0) {
        const existing = incoming[incoming.length - 1];
        const srcPort = all.find((p) => p.nodeId === existing.fromNodeId && p.portId === existing.fromPortId);
        this.removeConnection(existing.id);
        if (srcPort) {
          this.pending.set({
            fromNodeId: srcPort.nodeId,
            fromPortId: srcPort.portId,
            fromX: srcPort.x,
            fromY: srcPort.y,
            toX: port.x,
            toY: port.y,
            isPickup: true
          });
        }
        return;
      }
    }
    this.pending.set({
      fromNodeId: nodeId,
      fromPortId: portId,
      fromX: port.x,
      fromY: port.y,
      toX: port.x,
      toY: port.y
    });
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Port hover check
  findPortAt(wx, wy, radius) {
    const all = this.allPortPositions();
    for (const p of all) {
      const dx = p.x - wx;
      const dy = p.y - wy;
      if (Math.sqrt(dx * dx + dy * dy) <= radius)
        return p;
    }
    return null;
  }
  canConnect(pending, target) {
    const pendingIsOutput = pending.fromPortId !== "flow-out-0" ? pending.fromPortId.includes("out") || pending.fromPortId === "flow-out" : true;
    const targetIsInput = target.kind === "flow-in";
    const targetIsOutput = target.kind === "flow-out";
    if (pending.isPickup) {
      return targetIsInput && pending.fromNodeId !== target.nodeId;
    }
    const fromKind = pending.fromPortId === "flow-in" || pending.fromPortId === "neutral-in" ? "flow-in" : "flow-out";
    if (fromKind === "flow-out") {
      if (!targetIsInput)
        return false;
    } else {
      if (!targetIsOutput)
        return false;
    }
    if (pending.fromNodeId === target.nodeId)
      return false;
    return true;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Connection creation + loop detection
  createConnection(pending, target) {
    this.createSingleConnectionFromPending(pending, target);
  }
  /** Creates a single SpellConnection, performing cycle detection and de-duplication. */
  createSingleConnectionFromPending(pending, target) {
    this.pushUndo();
    const fromKind = pending.fromPortId.includes("in") && !pending.fromPortId.includes("out") ? "flow-in" : "flow-out";
    const pendingIsOutput = fromKind === "flow-out" || pending.fromPortId === "flow-out-0";
    const fromNodeId = pendingIsOutput ? pending.fromNodeId : target.nodeId;
    const fromPortId = pendingIsOutput ? pending.fromPortId : target.portId;
    const toNodeId = pendingIsOutput ? target.nodeId : pending.fromNodeId;
    const toPortId = pendingIsOutput ? target.portId : pending.fromPortId;
    this.createSingleConnection(fromNodeId, fromPortId, toNodeId, toPortId);
  }
  createSingleConnection(fromNodeId, fromPortId, toNodeId, toPortId) {
    const duplicate = this.graph.connections.find((c) => c.fromNodeId === fromNodeId && c.fromPortId === fromPortId && c.toNodeId === toNodeId && c.toPortId === toPortId);
    if (duplicate)
      return;
    const conn = { id: `conn-${this.nextId++}`, fromNodeId, fromPortId, toNodeId, toPortId };
    if (this.createsCycle(conn)) {
      const hasExistingPassthrough = this.graph.connections.some((c) => c.passthroughEnabled && (c.toNodeId === fromNodeId || c.fromNodeId === toNodeId));
      if (!hasExistingPassthrough) {
        conn.passthroughEnabled = true;
        conn.maxPassthrough = 1;
        const fromPos = this.resolvePortWorldPos(fromNodeId, fromPortId);
        const toPos = this.resolvePortWorldPos(toNodeId, toPortId);
        if (fromPos && toPos) {
          const worldDy = Math.abs(fromPos.y - toPos.y);
          const rise = Math.max(80, worldDy * 0.8 + 80);
          const topY = Math.min(fromPos.y, toPos.y) - rise;
          conn.waypoints = [{ x: fromPos.x, y: topY }, { x: toPos.x, y: topY }];
        }
      }
    }
    if (!conn.waypoints)
      conn.waypoints = [];
    this.graph.connections = [...this.graph.connections, conn];
    this.graphConnectionsSig.set(this.graph.connections);
  }
  createsCycle(newConn) {
    const adj = /* @__PURE__ */ new Map();
    const add = (from, to) => {
      if (!adj.has(from))
        adj.set(from, /* @__PURE__ */ new Set());
      adj.get(from).add(to);
    };
    for (const c of this.graph.connections)
      add(c.fromNodeId, c.toNodeId);
    add(newConn.fromNodeId, newConn.toNodeId);
    const visited = /* @__PURE__ */ new Set();
    const dfs = (node) => {
      if (node === newConn.fromNodeId)
        return true;
      if (visited.has(node))
        return false;
      visited.add(node);
      for (const next of adj.get(node) ?? []) {
        if (dfs(next))
          return true;
      }
      return false;
    };
    return dfs(newConn.toNodeId);
  }
  removeConnection(id) {
    this.graph.connections = this.graph.connections.filter((c) => c.id !== id);
    if (this.selectedConnectionId === id)
      this.selectedConnectionId = null;
    this.graphConnectionsSig.set(this.graph.connections);
  }
  selectConnection(id, e) {
    e.stopPropagation();
    this.selectedWaypoints = /* @__PURE__ */ new Map();
    this.selectedConnectionId = this.selectedConnectionId === id ? null : id;
    this.selectedNodeIds = /* @__PURE__ */ new Set();
    this.startNodeSelected = false;
    this.inspectedRune = null;
    this.inspectedNodeId = null;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Waypoint drag — click on a connection segment to add a waypoint,
  // drag an existing waypoint to move it, or move it "back in line" to delete it.
  onWaypointMouseDown(e, connId, wpIdx) {
    e.stopPropagation();
    e.preventDefault();
    this.pushUndo();
    const conn = this.graph.connections.find((c) => c.id === connId);
    if (conn) {
      const from = this.resolvePortWorldPos(conn.fromNodeId, conn.fromPortId);
      const to = this.resolvePortWorldPos(conn.toNodeId, conn.toPortId);
      if (from && to) {
        const allPts = [from, ...conn.waypoints ?? [], to];
        const prev = allPts[wpIdx];
        const next = allPts[wpIdx + 2];
        if (prev && next)
          this.waypointSnapGrid = this.computeSnapGrid(prev, next);
      }
    }
    this.draggingWaypointConnId = connId;
    this.draggingWaypointIndex = wpIdx;
  }
  // Mousedown on the invisible hit-area path — begin pulling a new waypoint from that segment.
  // Only responds to right-click; left-click on the line just selects it.
  onConnHitMouseDown(e, c) {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 2)
      return;
    this.pushUndo();
    const world = this.clientToWorld(e.clientX, e.clientY);
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return;
    const wps = c.waypoints ?? [];
    const WP_GRAB_RADIUS = 18;
    for (let i = 0; i < wps.length; i++) {
      if (Math.hypot(world.x - wps[i].x, world.y - wps[i].y) < WP_GRAB_RADIUS) {
        const allPts2 = [from, ...wps, to];
        const prev2 = allPts2[i];
        const next2 = allPts2[i + 2];
        if (prev2 && next2)
          this.waypointSnapGrid = this.computeSnapGrid(prev2, next2);
        this.draggingWaypointConnId = c.id;
        this.draggingWaypointIndex = i;
        return;
      }
    }
    const allPts = [from, ...wps, to];
    let bestSeg = 0;
    let bestDist = Infinity;
    for (let i = 0; i < allPts.length - 1; i++) {
      const d = this.distToSegment(world, allPts[i], allPts[i + 1]);
      if (d < bestDist) {
        bestDist = d;
        bestSeg = i;
      }
    }
    if (bestDist > 40)
      return;
    const prev = allPts[bestSeg];
    const next = allPts[bestSeg + 1];
    this.pullingWaypointConnId = c.id;
    this.pullingWaypointSegIndex = bestSeg;
    this.pullingWaypointPos = world;
    this.waypointSnapGrid = this.computeSnapGrid(prev, next);
  }
  // Called from onConnGroupClick to insert a waypoint at the clicked segment position
  onConnGroupClick(e, c) {
    if (this.draggingWaypointConnId)
      return;
    this.selectConnection(c.id, e);
  }
  // Double-click on a connection inserts a waypoint at that position
  onConnGroupDblClick(e, c) {
    e.stopPropagation();
    this.pushUndo();
    const world = this.clientToWorld(e.clientX, e.clientY);
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return;
    const wps = c.waypoints ?? [];
    const allPts = [from, ...wps, to];
    let bestSeg = 0;
    let bestDist = Infinity;
    for (let i = 0; i < allPts.length - 1; i++) {
      const d = this.distToSegment(world, allPts[i], allPts[i + 1]);
      if (d < bestDist) {
        bestDist = d;
        bestSeg = i;
      }
    }
    if (bestDist > 30)
      return;
    const newWp = this.snapToQueenMovement(world, allPts[bestSeg], allPts[bestSeg + 1]);
    const newWps = [...wps.slice(0, bestSeg), newWp, ...wps.slice(bestSeg)];
    this.updateConnectionWaypoints(c.id, newWps);
  }
  distToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0)
      return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  // Snap a point to lie on a queen-movement direction from anchor
  snapToQueenMovement(p, a, _b) {
    const dx = p.x - a.x, dy = p.y - a.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
    const distH = ady;
    const distV = adx;
    const distD = Math.abs(adx - ady);
    const minCost = Math.min(distH, distV, distD);
    if (minCost === distH)
      return { x: p.x, y: a.y };
    if (minCost === distV)
      return { x: a.x, y: p.y };
    const diag = Math.min(adx, ady);
    return { x: a.x + sx * diag, y: a.y + sy * diag };
  }
  updateConnectionWaypoints(connId, rawWps) {
    const MERGE_D = 8;
    const wps = [];
    for (const wp of rawWps) {
      const last = wps[wps.length - 1];
      if (last && Math.hypot(wp.x - last.x, wp.y - last.y) < MERGE_D) {
        wps[wps.length - 1] = { x: (last.x + wp.x) / 2, y: (last.y + wp.y) / 2 };
      } else {
        wps.push(wp);
      }
    }
    this.graph.connections = this.graph.connections.map((c) => c.id === connId ? __spreadProps(__spreadValues({}, c), { waypoints: wps }) : c);
    this.graphConnectionsSig.set(this.graph.connections);
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Palette drag-to-canvas (HTML drag)
  onPaletteDragStart(e, rune) {
    e.dataTransfer.setData("runeName", rune.name);
    e.dataTransfer.effectAllowed = "copy";
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;top:-200px;left:-200px;background:rgba(15,10,35,0.97);border:1px solid rgba(139,92,246,0.6);border-radius:8px;color:#e2e8f0;padding:6px 14px;font-size:0.82rem;font-weight:600;pointer-events:none;z-index:9999;white-space:nowrap";
    ghost.textContent = rune.name === this.NEUTRAL_RUNE_ID ? "Neutral" : rune.name;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, -10, 10);
    setTimeout(() => ghost.remove(), 0);
  }
  onCanvasDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.canvasWrapRef)
      return;
    const runeName = e.dataTransfer.getData("runeName");
    if (!runeName)
      return;
    const world = this.clientToWorld(e.clientX, e.clientY);
    this.addNode(runeName, world.x - this.NODE_IMG / 2, world.y - this.NODE_IMG / 2);
  }
  onCanvasDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  addNode(runeName, x, y) {
    this.pushUndo();
    const id = `node-${this.nextId++}`;
    const node = { id, runeId: runeName, x, y };
    this.graph.nodes = [...this.graph.nodes, node];
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
  }
  removeNode(nodeId) {
    this.graph.nodes = this.graph.nodes.filter((n) => n.id !== nodeId);
    this.graph.connections = this.graph.connections.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId);
    this.nodeStates.delete(nodeId);
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Template helpers
  getNodeRune(nodeId) {
    const ns = this.nodeStates.get(nodeId);
    if (!ns)
      return void 0;
    if (ns.node.runeId === NEUTRAL_RUNE_ID)
      return void 0;
    return this.availableRunes.find((r) => r.name === ns.node.runeId);
  }
  getNodeState(nodeId) {
    return this.nodeStates.get(nodeId);
  }
  // For neutral nodes: fixed grey glow
  nodeGlowColor(nodeId) {
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    if (node?.runeId === NEUTRAL_RUNE_ID)
      return "#6b7280";
    if (node?.runeId === SUMMON_RUNE_ID)
      return "#a78bfa";
    const rune = this.getNodeRune(nodeId);
    return rune?.glowColor || "#8b5cf6";
  }
  nodeIndexForFloat(nodeId) {
    return this.graph.nodes.findIndex((n) => n.id === nodeId);
  }
  portPortPos(nodeId, portId) {
    return this.allPortPositions().find((p) => p.nodeId === nodeId && p.portId === portId);
  }
  isPortHovered(nodeId, portId) {
    const h = this.hoveredPort();
    return h?.nodeId === nodeId && h?.portId === portId;
  }
  // True when a drag is active AND this port is a valid connection target
  isPendingValidTarget(nodeId, portId) {
    const p = this.pending();
    if (!p)
      return false;
    const port = this.allPortPositions().find((pp) => pp.nodeId === nodeId && pp.portId === portId);
    return !!port && this.canConnect(p, port);
  }
  isConnectionSelected(connId) {
    return this.selectedConnectionId === connId;
  }
  isWaypointSelected(connId, wpIdx) {
    return this.selectedWaypoints.get(connId)?.has(wpIdx) ?? false;
  }
  getLoopConn(connId) {
    return this.graph.connections.find((c) => c.id === connId);
  }
  loopMidPoint(c) {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return { x: 0, y: 0 };
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  }
  loopMidPointScreen(c) {
    const wps = c.waypoints ?? [];
    if (wps.length > 0) {
      const mid = wps[Math.floor(wps.length / 2)];
      return this.worldToCanvasLocal(mid.x, mid.y);
    }
    const mp = this.loopMidPoint(c);
    return this.worldToCanvasLocal(mp.x, mp.y);
  }
  // Midpoint of a connection in screen space — used for badges
  connMidPointScreen(c) {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return { x: 0, y: 0 };
    const sf = this.worldToCanvasLocal(from.x, from.y);
    const st = this.worldToCanvasLocal(to.x, to.y);
    return { x: (sf.x + st.x) / 2, y: (sf.y + st.y) / 2 };
  }
  connectionColor(_c) {
    return FLOW_COLOR;
  }
  // True when the connection has any visible settings (only passthrough now)
  hasConnectionSettings(c) {
    return !!c.passthroughEnabled;
  }
  /** Returns the currently selected SpellConnection, or null */
  getSelectedConnection() {
    if (!this.selectedConnectionId)
      return null;
    return this.graph.connections.find((c) => c.id === this.selectedConnectionId) ?? null;
  }
  /** Patches fields on the selected connection and emits change */
  updateSelectedConnection(patch) {
    if (!this.selectedConnectionId)
      return;
    this.pushUndo();
    const updated = this.graph.connections.map((c) => c.id === this.selectedConnectionId ? __spreadValues(__spreadValues({}, c), patch) : c);
    this.graph.connections = updated;
    this.graphConnectionsSig.set(updated);
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Undo / Redo
  pushUndo() {
    const snap = JSON.stringify(this.graph);
    const last = this.undoStack.length > 0 ? JSON.stringify(this.undoStack[this.undoStack.length - 1]) : "";
    if (snap === last)
      return;
    this.undoStack.push(JSON.parse(snap));
    this.redoStack = [];
    if (this.undoStack.length > 60)
      this.undoStack.shift();
  }
  applySnapshot(g) {
    this.graph = g;
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    this.graphConnectionsSig.set(this.graph.connections);
    this.selectedConnectionId = null;
    this.selectedNodeIds = /* @__PURE__ */ new Set();
    this.selectedWaypoints = /* @__PURE__ */ new Map();
    this.startNodeSelected = false;
    const allNums = [
      ...this.graph.nodes.map((n) => parseInt(n.id.replace(/[^0-9]/g, ""), 10)),
      ...this.graph.connections.map((c) => parseInt(c.id.replace(/[^0-9]/g, ""), 10))
    ].filter((v) => !isNaN(v));
    if (allNums.length > 0)
      this.nextId = Math.max(this.nextId, Math.max(...allNums) + 1);
  }
  undo() {
    if (this.undoStack.length === 0)
      return;
    this.redoStack.push(JSON.parse(JSON.stringify(this.graph)));
    this.applySnapshot(this.undoStack.pop());
  }
  redo() {
    if (this.redoStack.length === 0)
      return;
    this.undoStack.push(JSON.parse(JSON.stringify(this.graph)));
    this.applySnapshot(this.redoStack.pop());
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Copy / Paste
  copySelected() {
    if (this.selectedNodeIds.size === 0)
      return;
    const nodes = this.graph.nodes.filter((n) => this.selectedNodeIds.has(n.id));
    const ids = new Set(nodes.map((n) => n.id));
    const connections = this.graph.connections.filter((c) => ids.has(c.fromNodeId) && ids.has(c.toNodeId));
    this.clipboard = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      connections: JSON.parse(JSON.stringify(connections))
    };
  }
  cutSelected() {
    if (this.selectedNodeIds.size === 0)
      return;
    this.copySelected();
    this.pushUndo();
    for (const id of [...this.selectedNodeIds])
      this.removeNode(id);
    this.selectedNodeIds = /* @__PURE__ */ new Set();
  }
  pasteClipboard() {
    if (!this.clipboard || this.clipboard.nodes.length === 0)
      return;
    this.pushUndo();
    const idMap = /* @__PURE__ */ new Map();
    const OFFSET = 50;
    for (const node of this.clipboard.nodes) {
      const newId = `node-${this.nextId++}`;
      idMap.set(node.id, newId);
      const newNode = __spreadProps(__spreadValues({}, node), { id: newId, x: node.x + OFFSET, y: node.y + OFFSET });
      this.graph.nodes = [...this.graph.nodes, newNode];
    }
    this.rebuildNodeStates();
    this.graphNodesSig.set(this.graph.nodes);
    for (const conn of this.clipboard.connections) {
      const newFromId = idMap.get(conn.fromNodeId);
      const newToId = idMap.get(conn.toNodeId);
      if (newFromId && newToId) {
        const newConn = __spreadProps(__spreadValues({}, JSON.parse(JSON.stringify(conn))), {
          id: `conn-${this.nextId++}`,
          fromNodeId: newFromId,
          toNodeId: newToId,
          // Offset waypoints to match the shifted node positions
          waypoints: conn.waypoints?.map((wp) => ({ x: wp.x + OFFSET, y: wp.y + OFFSET }))
        });
        this.graph.connections = [...this.graph.connections, newConn];
      }
    }
    this.graphConnectionsSig.set(this.graph.connections);
    this.selectedNodeIds = new Set(idMap.values());
    this.selectedConnectionId = null;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Point-on-path: returns screen-space position at fraction t (0..1) along connection
  getPointOnPath(c, t) {
    const from = this.resolvePortWorldPos(c.fromNodeId, c.fromPortId);
    const to = this.resolvePortWorldPos(c.toNodeId, c.toPortId);
    if (!from || !to)
      return { x: 0, y: 0 };
    const wps = c.waypoints ?? [];
    const liveWps = this.pullingWaypointConnId === c.id && this.pullingWaypointPos ? [...wps.slice(0, this.pullingWaypointSegIndex), this.pullingWaypointPos, ...wps.slice(this.pullingWaypointSegIndex)] : wps;
    const worldPoints = [from, ...liveWps, to];
    const pts = [worldPoints[0]];
    for (let i = 0; i < worldPoints.length - 1; i++) {
      const a = worldPoints[i], b = worldPoints[i + 1];
      pts.push(...this.queenRoute(a.x, a.y, b.x, b.y), b);
    }
    let totalLen = 0;
    const segLens = [];
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segLens.push(d);
      totalLen += d;
    }
    if (totalLen < 0.01)
      return this.worldToCanvasLocal(from.x, from.y);
    const target = Math.max(0, Math.min(1, t)) * totalLen;
    let walked = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (walked + segLens[i] >= target) {
        const frac = segLens[i] > 0 ? (target - walked) / segLens[i] : 0;
        const a = pts[i], b = pts[i + 1];
        return this.worldToCanvasLocal(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac);
      }
      walked += segLens[i];
    }
    return this.worldToCanvasLocal(pts[pts.length - 1].x, pts[pts.length - 1].y);
  }
  // Port's CSS top offset within the node div (world y → node-local px)
  portNodeTop(nodeId, portId) {
    const pp = this.portPortPos(nodeId, portId);
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    if (!pp || !node)
      return 0;
    return pp.y - node.y - this.PORT_R;
  }
  trackById(_, item) {
    return item.id;
  }
  trackByName(_, item) {
    return item.name;
  }
  // Detect rune-node click (vs drag): if mouse barely moved between mousedown and mouseup
  onNodeClick(e, node) {
    if (e.target.closest("[data-port-id]"))
      return;
    const moved = Math.abs(e.clientX - this.lastMouseDownX) > 4 || Math.abs(e.clientY - this.lastMouseDownY) > 4;
    if (!moved)
      this.inspectNode(node);
  }
  inspectNode(node) {
    if (node.runeId === NEUTRAL_RUNE_ID)
      return;
    this.selectedConnectionId = null;
    this.inspectedRune = this.availableRunes.find((r) => r.name === node.runeId) ?? null;
    this.inspectedNodeId = node.id;
  }
  inspectPaletteRune(rune) {
    if (rune.name === NEUTRAL_RUNE_ID || rune.name === SUMMON_RUNE_ID)
      return;
    this.selectedConnectionId = null;
    this.inspectedRune = rune;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Keyboard: delete selected connection or selected nodes
  onKeyDown(e) {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      this.onSave();
      return;
    }
    if (e.ctrlKey && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
      e.preventDefault();
      this.undo();
      return;
    }
    if (e.ctrlKey && (e.key === "y" || e.key === "Y" || e.key === "z" && e.shiftKey || e.key === "Z" && e.shiftKey)) {
      e.preventDefault();
      this.redo();
      return;
    }
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA")
      return;
    if (e.key === " ") {
      e.preventDefault();
      if (!this.qsOpen)
        this.openSpaceSearch();
      return;
    }
    if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
      this.copySelected();
      return;
    }
    if (e.ctrlKey && (e.key === "x" || e.key === "X")) {
      this.cutSelected();
      return;
    }
    if (e.ctrlKey && (e.key === "v" || e.key === "V")) {
      this.pasteClipboard();
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (this.selectedWaypoints.size > 0) {
        this.pushUndo();
        for (const [connId, indices] of this.selectedWaypoints) {
          const conn = this.graph.connections.find((c) => c.id === connId);
          if (conn?.waypoints) {
            this.updateConnectionWaypoints(connId, conn.waypoints.filter((_, i) => !indices.has(i)));
          }
        }
        this.selectedWaypoints = /* @__PURE__ */ new Map();
        return;
      }
      if (this.selectedConnectionId) {
        this.pushUndo();
        this.removeConnection(this.selectedConnectionId);
      }
      if (this.selectedNodeIds.size > 0) {
        this.pushUndo();
        for (const id of [...this.selectedNodeIds]) {
          this.removeNode(id);
        }
        this.selectedNodeIds = /* @__PURE__ */ new Set();
      }
    }
    if (e.key === "Escape") {
      this.selectedConnectionId = null;
      this.selectedNodeIds = /* @__PURE__ */ new Set();
      this.selectedWaypoints = /* @__PURE__ */ new Map();
      this.startNodeSelected = false;
      this.pending.set(null);
      this.hoveredPort.set(null);
    }
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Zoom controls
  zoomIn() {
    this.zoom = Math.min(this.MAX_ZOOM, this.zoom * 1.2);
  }
  zoomOut() {
    this.zoom = Math.max(this.MIN_ZOOM, this.zoom / 1.2);
  }
  zoomReset() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Save
  onSave() {
    if (this.savedFeedback)
      return;
    const spell = {
      name: this.spellName || "Unbenannter Zauber",
      description: this.spellDescription,
      tags: this.extractTags(),
      binding: this.spell?.binding ?? { type: "learned" },
      strokeColor: this.spell?.strokeColor ?? "#8b5cf6",
      libraryOrigin: this.spell?.libraryOrigin,
      libraryOriginName: this.spell?.libraryOriginName,
      drawing: this.spell?.drawing,
      graph: JSON.parse(JSON.stringify(this.graph)),
      costMana: this.spellCostMana,
      costFokus: this.spellCostFokus,
      statRequirements: Object.keys(this.spellStatRequirements).length > 0 ? this.spellStatRequirements : void 0
    };
    this.save.emit(spell);
    this.estimatedCostResult.emit(this.simpleEstimate);
    this.lastSavedJson = JSON.stringify(spell.graph);
    this.savedFeedback = true;
    setTimeout(() => {
      this.savedFeedback = false;
    }, 700);
  }
  get isDirty() {
    return JSON.stringify(this.graph) !== this.lastSavedJson;
  }
  onClose() {
    if (this.isDirty) {
      this.showCloseDialog = true;
    } else {
      this.cancel.emit();
    }
  }
  onCloseConfirmSave() {
    this.onSave();
    this.showCloseDialog = false;
    this.cancel.emit();
  }
  onCloseConfirmDiscard() {
    this.showCloseDialog = false;
    this.cancel.emit();
  }
  onCloseDialogCancel() {
    this.showCloseDialog = false;
  }
  extractTags() {
    const tags = new Set(this.spellTags);
    for (const node of this.graph.nodes) {
      const rune = this.availableRunes.find((r) => r.name === node.runeId);
      if (rune)
        rune.tags?.forEach((t) => tags.add(t));
    }
    return Array.from(tags);
  }
  toggleSpellTag(tag) {
    const idx = this.spellTags.indexOf(tag);
    if (idx >= 0)
      this.spellTags.splice(idx, 1);
    else
      this.spellTags.push(tag);
  }
  hasSpellTag(tag) {
    return this.spellTags.includes(tag);
  }
  onDelete() {
    if (confirm("Zauber wirklich l\xF6schen?")) {
      this.deleteSpell.emit();
    }
  }
  onCancel() {
    this.cancel.emit();
  }
  // ────────────────────────────────────────────────────────────────────────────
  // SVG viewBox (always matches container size)
  svgViewBox = "0 0 1000 800";
  onCanvasResize(e) {
    const r = e.contentRect;
    this.svgViewBox = `0 0 ${r.width} ${r.height}`;
  }
  static \u0275fac = function SpellNodeEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SpellNodeEditorComponent)(\u0275\u0275directiveInject(ChangeDetectorRef));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SpellNodeEditorComponent, selectors: [["app-spell-node-editor"]], viewQuery: function SpellNodeEditorComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c02, 5)(_c12, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.canvasWrapRef = _t.first);
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.svgRef = _t.first);
    }
  }, hostVars: 2, hostBindings: function SpellNodeEditorComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown", function SpellNodeEditorComponent_keydown_HostBindingHandler($event) {
        return ctx.onKeyDown($event);
      }, \u0275\u0275resolveDocument);
    }
    if (rf & 2) {
      \u0275\u0275classProp("wp-dragging", ctx.isWpDragging);
    }
  }, inputs: { spell: "spell", availableRunes: "availableRunes", availableCompanions: "availableCompanions" }, outputs: { save: "save", cancel: "cancel", deleteSpell: "deleteSpell", estimatedCostResult: "estimatedCostResult" }, decls: 66, vars: 48, consts: [["canvasWrap", ""], [1, "sne-overlay"], [1, "sne-layout"], [1, "rune-palette"], [1, "palette-header"], [1, "palette-title"], [1, "palette-search-wrap"], ["type", "text", "placeholder", "Suchen\u2026", "autocomplete", "off", 1, "palette-search", 3, "ngModelChange", "ngModel"], [1, "palette-list"], ["draggable", "true", 1, "palette-rune", 3, "palette-rune-neutral", "--glow"], [1, "palette-empty"], [1, "sne-main"], [1, "sne-topbar"], [1, "sne-topbar-left"], [1, "sne-spell-title"], [1, "sne-topbar-right"], [1, "tb-btn", "tb-close", 3, "click"], [1, "tb-btn", "tb-save", 3, "click", "disabled"], [1, "canvas-wrap", 3, "wheel", "mousedown", "contextmenu", "drop", "dragover"], ["xmlns", "http://www.w3.org/2000/svg", 1, "canvas-grid-svg"], ["id", "smallGrid", "patternUnits", "userSpaceOnUse"], ["fill", "none", "stroke", "rgba(139,92,246,0.07)", "stroke-width", "0.5"], ["id", "bigGrid", "patternUnits", "userSpaceOnUse"], ["fill", "url(#smallGrid)"], ["fill", "none", "stroke", "rgba(139,92,246,0.14)", "stroke-width", "1"], ["width", "100%", "height", "100%", "fill", "url(#bigGrid)", 1, "svg-bg"], [1, "canvas-world"], [1, "start-node", 3, "mousedown"], [1, "start-node-ring"], [1, "start-node-core"], [1, "start-node-label"], ["data-node-id", "start", "data-port-id", "flow-out-0", 1, "port-circle", "port-out", "port-flow", "start-port-out", 3, "mousedown"], [1, "rune-node", 3, "rune-node-drag", "rune-node-selected", "left", "top", "--glow"], ["xmlns", "http://www.w3.org/2000/svg", 1, "conn-overlay-svg"], ["r", "6", 1, "conn-waypoint-preview"], ["xmlns", "http://www.w3.org/2000/svg", 1, "conn-overlay-svg", "snap-line-svg"], [1, "marquee-box", 3, "left", "top", "width", "height"], ["xmlns", "http://www.w3.org/2000/svg", 1, "pending-overlay-svg"], [1, "zoom-controls"], ["title", "Vergr\xF6\xDFern", 1, "zoom-btn", 3, "click"], [1, "zoom-label"], ["title", "Verkleinern", 1, "zoom-btn", 3, "click"], ["title", "Zur\xFCcksetzen", 1, "zoom-btn", 3, "click"], [1, "canvas-hint"], [1, "rune-inspector"], [1, "conn-inspector"], [1, "summon-config"], ["draggable", "true", 1, "palette-rune", 3, "dragstart", "click"], [1, "palette-rune-glyph"], [1, "palette-neutral-icon"], [1, "summon-glyph", "summon-glyph-mini"], [1, "palette-rune-img", 3, "src", "alt"], [1, "palette-rune-icon"], [1, "palette-rune-info"], [1, "palette-rune-name"], [1, "palette-rune-tags"], [1, "summon-sq"], [1, "rune-node", 3, "mousedown", "click"], ["data-port-id", "flow-in", 1, "rune-port", "rune-port-in", "rune-port-flow", 3, "mousedown"], ["data-port-id", "flow-out", 1, "rune-port", "rune-port-out", "rune-port-flow", 3, "mousedown"], [1, "neutral-node-wrap"], [1, "summon-node-wrap"], [1, "rune-node-img", 3, "src", "alt"], [1, "rune-node-placeholder"], [1, "rune-node-placeholder", "rune-node-unknown"], [1, "rune-node-name", "rune-node-name-summon"], [1, "rune-node-name"], [1, "neutral-node-body"], [1, "summon-glyph"], [1, "conn-group"], [1, "conn-group", 3, "click", "dblclick"], [1, "conn-hit", 3, "mousedown"], [1, "conn-path-glow"], [1, "conn-path"], [1, "conn-path-selected"], [1, "conn-badge"], ["r", "6", 1, "conn-waypoint", 3, "conn-waypoint-selected"], ["r", "6", 1, "conn-waypoint", 3, "mousedown"], ["r", "14", 1, "conn-badge-bg", "conn-badge-passthrough"], [1, "conn-badge-icon"], ["dy", "18", 1, "conn-badge-sub"], ["r", "4", 1, "conn-snap-dot"], ["x1", "0", "x2", "100%", 1, "node-snap-line"], ["y1", "0", "y2", "100%", 1, "node-snap-line"], [1, "marquee-box"], [1, "conn-path-pending"], [1, "ri-header"], [1, "ri-title"], [1, "ri-close", 3, "click"], [1, "ri-body"], [1, "ri-img", 3, "src", "alt"], [1, "ri-name"], [1, "ri-tags"], [1, "ri-desc"], [1, "ri-costs"], [1, "ri-tag"], [1, "ri-cost"], [1, "ri-cost-lbl"], [1, "ri-cost-val"], [1, "ci-header"], [1, "ci-title"], [1, "ci-close", 3, "click"], [1, "ci-body"], [1, "ci-section-lbl"], [1, "ci-passthrough-row"], [1, "ci-toggle-btn", "ci-toggle-passthrough", 3, "click"], ["type", "number", "min", "1", "placeholder", "\u221E", 1, "ci-input", "ci-input-num", 3, "change", "value", "disabled"], [1, "ci-input-hint"], [1, "close-dialog-backdrop", 3, "click"], [1, "close-dialog-box"], [1, "close-dialog-title"], [1, "close-dialog-body"], [1, "close-dialog-actions"], [1, "close-dialog-btn", "close-dialog-save", 3, "click"], [1, "close-dialog-btn", "close-dialog-discard", 3, "click"], [1, "close-dialog-btn", "close-dialog-cancel", 3, "click"], [1, "summon-config", 3, "mousedown"], [1, "summon-config-head"], ["src", "/icons/soul.svg", "alt", "", 1, "summon-config-ico"], [1, "summon-field"], [3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], [1, "summon-hint"], [1, "summon-ok"], [1, "qs-backdrop", 3, "mousedown"], [1, "qs-popup", 3, "mousedown"], [1, "qs-header"], ["type", "text", "placeholder", "Runenname eingeben\u2026", "autocomplete", "off", 1, "qs-input", 3, "ngModelChange", "keydown.escape", "ngModel"], [1, "qs-list"], [1, "qs-item", 3, "qs-item-incompatible"], [1, "qs-empty"], [1, "qs-item", 3, "click"], [1, "qs-item-glyph"], [1, "qs-item-img", 3, "src", "alt"], [1, "qs-item-icon"], [1, "qs-item-name"]], template: function SpellNodeEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "aside", 3)(3, "div", 4)(4, "span", 5);
      \u0275\u0275text(5, "Runen");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 6)(7, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function SpellNodeEditorComponent_Template_input_ngModelChange_7_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.paletteSearch, $event) || (ctx.paletteSearch = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "div", 8);
      \u0275\u0275repeaterCreate(9, SpellNodeEditorComponent_For_10_Template, 10, 7, "div", 9, ctx.trackByName, true);
      \u0275\u0275conditionalCreate(11, SpellNodeEditorComponent_Conditional_11_Template, 2, 0, "div", 10);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(12, "div", 11)(13, "div", 12)(14, "div", 13)(15, "span", 14);
      \u0275\u0275text(16);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "div", 15)(18, "button", 16);
      \u0275\u0275listener("click", function SpellNodeEditorComponent_Template_button_click_18_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onClose());
      });
      \u0275\u0275text(19, "Schlie\xDFen \u2715");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "button", 17);
      \u0275\u0275listener("click", function SpellNodeEditorComponent_Template_button_click_20_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onSave());
      });
      \u0275\u0275text(21);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(22, "div", 18, 0);
      \u0275\u0275listener("wheel", function SpellNodeEditorComponent_Template_div_wheel_22_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onWheel($event));
      })("mousedown", function SpellNodeEditorComponent_Template_div_mousedown_22_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onCanvasMouseDown($event));
      })("contextmenu", function SpellNodeEditorComponent_Template_div_contextmenu_22_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView($event.preventDefault());
      })("drop", function SpellNodeEditorComponent_Template_div_drop_22_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onCanvasDrop($event));
      })("dragover", function SpellNodeEditorComponent_Template_div_dragover_22_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onCanvasDragOver($event));
      });
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(24, "svg", 19)(25, "defs")(26, "pattern", 20);
      \u0275\u0275element(27, "path", 21);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "pattern", 22);
      \u0275\u0275element(29, "rect", 23)(30, "path", 24);
      \u0275\u0275elementEnd()();
      \u0275\u0275element(31, "rect", 25);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(32, "div", 26)(33, "div", 27);
      \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_Template_div_mousedown_33_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onStartNodeMouseDown($event));
      });
      \u0275\u0275element(34, "div", 28);
      \u0275\u0275elementStart(35, "div", 29)(36, "span", 30);
      \u0275\u0275text(37, "START");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(38, "div", 31);
      \u0275\u0275listener("mousedown", function SpellNodeEditorComponent_Template_div_mousedown_38_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onPortMouseDown($event, "start", "flow-out-0"));
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275repeaterCreate(39, SpellNodeEditorComponent_For_40_Template, 11, 35, "div", 32, ctx.trackById, true);
      \u0275\u0275elementEnd();
      \u0275\u0275namespaceSVG();
      \u0275\u0275elementStart(41, "svg", 33);
      \u0275\u0275repeaterCreate(42, SpellNodeEditorComponent_For_43_Template, 1, 1, null, null, ctx.trackById, true);
      \u0275\u0275conditionalCreate(44, SpellNodeEditorComponent_Conditional_44_Template, 2, 0);
      \u0275\u0275conditionalCreate(45, SpellNodeEditorComponent_Conditional_45_Template, 1, 2, ":svg:circle", 34);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(46, SpellNodeEditorComponent_Conditional_46_Template, 3, 0, ":svg:svg", 35);
      \u0275\u0275conditionalCreate(47, SpellNodeEditorComponent_Conditional_47_Template, 1, 8, "div", 36);
      \u0275\u0275conditionalCreate(48, SpellNodeEditorComponent_Conditional_48_Template, 2, 2, ":svg:svg", 37);
      \u0275\u0275namespaceHTML();
      \u0275\u0275elementStart(49, "div", 38)(50, "button", 39);
      \u0275\u0275listener("click", function SpellNodeEditorComponent_Template_button_click_50_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.zoomIn());
      });
      \u0275\u0275text(51, "+");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "span", 40);
      \u0275\u0275text(53);
      \u0275\u0275pipe(54, "number");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(55, "button", 41);
      \u0275\u0275listener("click", function SpellNodeEditorComponent_Template_button_click_55_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.zoomOut());
      });
      \u0275\u0275text(56, "\u2212");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(57, "button", 42);
      \u0275\u0275listener("click", function SpellNodeEditorComponent_Template_button_click_57_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.zoomReset());
      });
      \u0275\u0275text(58, "\u2302");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(59, "div", 43);
      \u0275\u0275text(60, " Leertaste = Rune hinzuf\xFCgen \xB7 Palette anklicken = Runen-Info \xB7 Mausrad = Zoom \xB7 Mittelmaus = Schwenken \xB7 Port ziehen = Verbinden \xB7 Linie ziehen = Wegpunkt \xB7 Entf = L\xF6schen \xB7 Strg+S = Speichern ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(61, SpellNodeEditorComponent_Conditional_61_Template, 13, 7, "aside", 44)(62, SpellNodeEditorComponent_Conditional_62_Template, 15, 4, "aside", 45);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(63, SpellNodeEditorComponent_Conditional_63_Template, 13, 0);
      \u0275\u0275conditionalCreate(64, SpellNodeEditorComponent_Conditional_64_Template, 16, 3, "div", 46);
      \u0275\u0275conditionalCreate(65, SpellNodeEditorComponent_Conditional_65_Template, 9, 7);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      let tmp_38_0;
      \u0275\u0275advance(7);
      \u0275\u0275twoWayProperty("ngModel", ctx.paletteSearch);
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.filteredPaletteRunes);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.filteredPaletteRunes.length === 0 ? 11 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate(ctx.spellName || "Neuer Zauber");
      \u0275\u0275advance(4);
      \u0275\u0275classProp("tb-save-done", ctx.savedFeedback)("tb-save-dirty", ctx.isDirty && !ctx.savedFeedback);
      \u0275\u0275property("disabled", ctx.savedFeedback);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.savedFeedback ? "\u2713 Gespeichert!" : "\xDCbernehmen & Speichern (Strg+S)", " ");
      \u0275\u0275advance(5);
      \u0275\u0275attribute("width", 20 * ctx.zoom)("height", 20 * ctx.zoom)("x", ctx.panX % (20 * ctx.zoom))("y", ctx.panY % (20 * ctx.zoom));
      \u0275\u0275advance();
      \u0275\u0275attribute("d", "M " + 20 * ctx.zoom + " 0 L 0 0 0 " + 20 * ctx.zoom);
      \u0275\u0275advance();
      \u0275\u0275attribute("width", 100 * ctx.zoom)("height", 100 * ctx.zoom)("x", ctx.panX % (100 * ctx.zoom))("y", ctx.panY % (100 * ctx.zoom));
      \u0275\u0275advance();
      \u0275\u0275attribute("width", 100 * ctx.zoom)("height", 100 * ctx.zoom);
      \u0275\u0275advance();
      \u0275\u0275attribute("d", "M " + 100 * ctx.zoom + " 0 L 0 0 0 " + 100 * ctx.zoom);
      \u0275\u0275advance(2);
      \u0275\u0275styleProp("transform", ctx.transformStyle);
      \u0275\u0275advance();
      \u0275\u0275styleProp("left", ctx.graph.startNode.x - 34, "px")("top", ctx.graph.startNode.y - 34, "px");
      \u0275\u0275classProp("start-node-selected", ctx.startNodeSelected);
      \u0275\u0275advance(5);
      \u0275\u0275styleProp("--port-color", "#ffffff");
      \u0275\u0275classProp("port-hovered", ctx.isPortHovered("start", "flow-out-0"))("rune-port-valid", ctx.isPendingValidTarget("start", "flow-out-0"));
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.graphNodesSig());
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.graphConnectionsSig());
      \u0275\u0275advance(2);
      \u0275\u0275conditional((ctx.pullingWaypointConnId || ctx.draggingWaypointConnId) && ctx.waypointSnapGrid.length ? 44 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.pullingWaypointConnId && ctx.pullingWaypointPos ? 45 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.nodeDragSnapLines.length ? 46 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.marqueeActive && (ctx.marqueeRect.w > 4 || ctx.marqueeRect.h > 4) ? 47 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.pending() ? 48 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(54, 45, ctx.zoom * 100, "1.0-0"), "%");
      \u0275\u0275advance(8);
      \u0275\u0275conditional(ctx.inspectedRune ? 61 : ctx.selectedConnectionId && ctx.getSelectedConnection() ? 62 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.showCloseDialog ? 63 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_38_0 = ctx.selectedSummonNode) ? 64 : -1, tmp_38_0);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.qsOpen ? 65 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgModel, DecimalPipe, ImageUrlPipe], styles: ['\n\n.sne-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 1700;\n  background: #050811;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  font-family: inherit;\n}\n.sne-layout[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n.rune-palette[_ngcontent-%COMP%] {\n  width: 240px;\n  flex-shrink: 0;\n  background: rgba(10, 12, 26, 0.98);\n  border-right: 1px solid rgba(139, 92, 246, 0.2);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.palette-header[_ngcontent-%COMP%] {\n  padding: 14px 16px 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.palette-title[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.12em;\n  color: #a78bfa;\n}\n.palette-search-wrap[_ngcontent-%COMP%] {\n  padding: 8px 10px;\n  flex-shrink: 0;\n}\n.palette-search[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 6px 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 8px;\n  color: #e2e8f0;\n  font-size: 0.82rem;\n  outline: none;\n  box-sizing: border-box;\n  transition: border-color 0.2s;\n}\n.palette-search[_ngcontent-%COMP%]:focus {\n  border-color: #8b5cf6;\n}\n.palette-search[_ngcontent-%COMP%]::placeholder {\n  color: rgba(148, 163, 184, 0.5);\n}\n.palette-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 4px 6px 12px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.palette-rune[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 10px;\n  border-radius: 10px;\n  cursor: grab;\n  margin-bottom: 4px;\n  border: 1px solid transparent;\n  background: rgba(255, 255, 255, 0.03);\n  transition:\n    background 0.15s,\n    border-color 0.15s,\n    transform 0.15s,\n    box-shadow 0.15s;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.palette-rune[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.12);\n  border-color: rgba(139, 92, 246, 0.35);\n  transform: translateX(2px);\n  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);\n}\n.palette-rune[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n  transform: scale(0.97);\n}\n.palette-rune-glyph[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  background: rgba(139, 92, 246, 0.1);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  overflow: hidden;\n  box-shadow: 0 0 8px color-mix(in srgb, var(--glow, #8b5cf6) 30%, transparent);\n}\n.palette-rune-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  border-radius: 7px;\n}\n.palette-rune-icon[_ngcontent-%COMP%] {\n  color: var(--glow, #8b5cf6);\n  font-size: 1.1rem;\n  filter: drop-shadow(0 0 6px var(--glow, #8b5cf6));\n}\n.palette-rune-info[_ngcontent-%COMP%] {\n  min-width: 0;\n  flex: 1;\n}\n.palette-rune-name[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: #e2e8f0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.palette-rune-tags[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: #6b7280;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-top: 2px;\n}\n.palette-empty[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #4b5563;\n  font-size: 0.8rem;\n  padding: 24px 0;\n}\n.sne-main[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  min-width: 0;\n}\n.sne-topbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 16px;\n  background: rgba(8, 10, 22, 0.95);\n  border-bottom: 1px solid rgba(139, 92, 246, 0.18);\n  flex-shrink: 0;\n  gap: 12px;\n  min-height: 50px;\n  box-sizing: border-box;\n}\n.sne-topbar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n  flex: 1;\n}\n.sne-spell-title[_ngcontent-%COMP%] {\n  font-size: 0.92rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 180px;\n  flex-shrink: 0;\n}\n.sne-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(139, 92, 246, 0.15);\n  border-radius: 8px;\n  padding: 3px;\n}\n.sne-tab-btn[_ngcontent-%COMP%] {\n  padding: 4px 14px;\n  border-radius: 6px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  background: transparent;\n  border: none;\n  color: #6b7280;\n  transition: background 0.15s, color 0.15s;\n}\n.sne-tab-btn[_ngcontent-%COMP%]:hover {\n  color: #a78bfa;\n}\n.sne-tab-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.25) !important;\n  color: #c4b5fd !important;\n  box-shadow: 0 1px 6px rgba(139, 92, 246, 0.2);\n}\n.sne-topbar-right[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  flex-shrink: 0;\n  align-items: center;\n}\n.tb-btn[_ngcontent-%COMP%] {\n  padding: 6px 16px;\n  border-radius: 8px;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid transparent;\n  background: transparent;\n  transition: all 0.18s;\n}\n.tb-close[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.15);\n  color: #9ca3af;\n}\n.tb-close[_ngcontent-%COMP%]:hover {\n  border-color: rgba(239, 68, 68, 0.6);\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.08);\n}\n.tb-delete[_ngcontent-%COMP%] {\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #ef4444;\n}\n.tb-delete[_ngcontent-%COMP%]:hover {\n  border-color: #ef4444;\n  background: rgba(239, 68, 68, 0.12);\n}\n.tb-save[_ngcontent-%COMP%] {\n  min-width: 210px;\n  background:\n    linear-gradient(\n      135deg,\n      #3b2672,\n      #4c2d8a);\n  color: rgba(255, 255, 255, 0.55);\n  box-shadow: none;\n}\n.tb-save[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 0 14px rgba(139, 92, 246, 0.4);\n  transform: translateY(-1px);\n  color: rgba(255, 255, 255, 0.8);\n}\n.tb-save[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\n.tb-save-dirty[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #7c3aed,\n      #8b5cf6) !important;\n  color: #fff !important;\n  box-shadow: 0 0 16px rgba(139, 92, 246, 0.5) !important;\n  animation: _ngcontent-%COMP%_save-btn-pulse 1.8s ease-in-out infinite alternate;\n}\n.tb-save-dirty[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.75) !important;\n}\n@keyframes _ngcontent-%COMP%_save-btn-pulse {\n  from {\n    box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);\n  }\n  to {\n    box-shadow: 0 0 24px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.35);\n  }\n}\n.tb-save-done[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #065f46,\n      #059669) !important;\n  box-shadow: 0 0 18px rgba(5, 150, 105, 0.55) !important;\n  color: #fff !important;\n  cursor: default;\n}\n.tb-settings[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border-radius: 8px;\n  font-size: 1rem;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  color: #9ca3af;\n  cursor: pointer;\n  background: transparent;\n  transition: all 0.18s;\n}\n.tb-settings[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #a78bfa;\n  background: rgba(139, 92, 246, 0.08);\n}\n.tb-settings-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18) !important;\n  color: #c4b5fd !important;\n  border-color: rgba(139, 92, 246, 0.5) !important;\n}\n.properties-panel[_ngcontent-%COMP%] {\n  width: 340px;\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: rgba(8, 10, 22, 0.97);\n  border-left: 1px solid rgba(139, 92, 246, 0.2);\n}\n.pp-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.pp-title[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #a78bfa;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n.pp-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #6b7280;\n  font-size: 0.9rem;\n  cursor: pointer;\n  padding: 2px 6px;\n  border-radius: 4px;\n  transition: color 0.15s;\n}\n.pp-close[_ngcontent-%COMP%]:hover {\n  color: #fca5a5;\n}\n.pp-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.pp-scroll[_ngcontent-%COMP%]   .ep-section[_ngcontent-%COMP%] {\n  padding: 0 14px;\n  margin-bottom: 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  padding-top: 12px;\n  padding-bottom: 12px;\n}\n.eigenschaften-view[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: rgba(5, 7, 18, 0.98);\n}\n.ep-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px 24px;\n  max-width: 700px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.ep-section[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n}\n.ep-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: #7c3aed;\n  margin-bottom: 8px;\n  display: block;\n}\n.ep-input[_ngcontent-%COMP%], \n.ep-textarea[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 8px 12px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 8px;\n  color: #e2e8f0;\n  font-size: 0.9rem;\n  outline: none;\n  box-sizing: border-box;\n  transition: border-color 0.18s;\n}\n.ep-textarea[_ngcontent-%COMP%] {\n  resize: vertical;\n  font-family: inherit;\n  min-height: 90px;\n}\n.ep-input[_ngcontent-%COMP%]:focus, \n.ep-textarea[_ngcontent-%COMP%]:focus {\n  border-color: #8b5cf6;\n}\n.ep-tag-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.ep-tag-btn[_ngcontent-%COMP%] {\n  padding: 4px 11px;\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #6b7280;\n  font-size: 0.78rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.ep-tag-btn[_ngcontent-%COMP%]:hover {\n  color: #e2e8f0;\n  border-color: rgba(139, 92, 246, 0.3);\n}\n.ep-tag-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2) !important;\n  border-color: rgba(139, 92, 246, 0.6) !important;\n  color: #c4b5fd !important;\n}\n.ep-cost-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: flex-end;\n  flex-wrap: wrap;\n}\n.ep-cost-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.ep-cost-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #6b7280;\n}\n.ep-cost-input[_ngcontent-%COMP%] {\n  width: 100px;\n  padding: 7px 10px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  color: #e2e8f0;\n  font-size: 0.9rem;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.ep-cost-input[_ngcontent-%COMP%]:focus {\n  border-color: rgba(139, 92, 246, 0.5);\n}\n.ep-calc-btn[_ngcontent-%COMP%] {\n  padding: 7px 16px;\n  border-radius: 8px;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(59, 130, 246, 0.12),\n      rgba(139, 92, 246, 0.12));\n  border: 1px solid rgba(59, 130, 246, 0.35);\n  color: #93c5fd;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.18s;\n  align-self: flex-end;\n}\n.ep-calc-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(59, 130, 246, 0.2);\n  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);\n}\n.ep-stat-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 4px;\n}\n.ep-stat-chip[_ngcontent-%COMP%] {\n  padding: 3px 10px;\n  border-radius: 5px;\n  background: rgba(245, 158, 11, 0.12);\n  border: 1px solid rgba(245, 158, 11, 0.3);\n  color: #fcd34d;\n  font-size: 0.78rem;\n  font-weight: 700;\n}\n.ep-empty-stat[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #4b5563;\n  font-style: italic;\n}\n.canvas-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  flex: 1;\n  overflow: hidden;\n  cursor: default;\n  background: #060917;\n}\n.canvas-grid-svg[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n}\n.svg-bg[_ngcontent-%COMP%] {\n  pointer-events: all;\n  cursor: default;\n}\n.canvas-world[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 0;\n  height: 0;\n  transform-origin: 0 0;\n  will-change: transform;\n  z-index: 6;\n}\n.conn-svg[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 0;\n  height: 0;\n  overflow: visible;\n  pointer-events: none;\n}\n.conn-svg[_ngcontent-%COMP%]   .conn-group[_ngcontent-%COMP%] {\n  pointer-events: all;\n  cursor: pointer;\n}\n.conn-path-glow[_ngcontent-%COMP%] {\n  fill: none;\n  stroke-width: 8;\n  opacity: 0.18;\n  stroke-linecap: round;\n  transition: opacity 0.15s;\n}\n.conn-path[_ngcontent-%COMP%] {\n  fill: none;\n  stroke-width: 2;\n  stroke-linecap: round;\n  opacity: 0.85;\n  transition: stroke-width 0.15s, opacity 0.15s;\n}\n.conn-group[_ngcontent-%COMP%]:has(.conn-hit:hover)   .conn-path[_ngcontent-%COMP%] {\n  stroke-width: 3;\n  opacity: 1;\n}\n.conn-group[_ngcontent-%COMP%]:has(.conn-hit:hover)   .conn-path-glow[_ngcontent-%COMP%] {\n  opacity: 0.32;\n}\n.conn-path.conn-selected[_ngcontent-%COMP%] {\n  stroke: #22c55e;\n  stroke-width: 4;\n  opacity: 1;\n}\n.conn-path-glow.conn-selected[_ngcontent-%COMP%] {\n  stroke: #22c55e;\n  stroke-width: 10;\n  animation: _ngcontent-%COMP%_conn-sel-glow 1.4s ease-in-out infinite alternate;\n}\n@keyframes _ngcontent-%COMP%_conn-sel-glow {\n  from {\n    opacity: 0.30;\n  }\n  to {\n    opacity: 0.70;\n  }\n}\n.conn-path-selected[_ngcontent-%COMP%] {\n  fill: none;\n  stroke: rgba(255, 255, 255, 0.65);\n  stroke-width: 1;\n  stroke-linecap: round;\n  pointer-events: none;\n  opacity: 1;\n}\n.conn-path.conn-cond-known[_ngcontent-%COMP%] {\n  stroke: #a78bfa;\n}\n.conn-path-glow.conn-cond-known[_ngcontent-%COMP%] {\n  stroke: #a78bfa;\n}\n.conn-path.conn-cond-unknown[_ngcontent-%COMP%] {\n  stroke: #fb923c;\n}\n.conn-path-glow.conn-cond-unknown[_ngcontent-%COMP%] {\n  stroke: #fb923c;\n}\n.conn-path.conn-passthrough[_ngcontent-%COMP%] {\n  stroke-dasharray: 10 5;\n}\n.conn-path-glow.conn-passthrough[_ngcontent-%COMP%] {\n  stroke-dasharray: 10 5;\n}\n.conn-path.conn-condition[_ngcontent-%COMP%] {\n  stroke-dasharray: 4 4;\n  opacity: 0.9;\n}\n.conn-path-glow.conn-condition[_ngcontent-%COMP%] {\n  stroke-dasharray: 4 4;\n}\n.conn-path.conn-delay[_ngcontent-%COMP%] {\n  stroke-dasharray: 2 6;\n}\n.conn-path-glow.conn-delay[_ngcontent-%COMP%] {\n  stroke-dasharray: 2 6;\n}\n.conn-path-pending[_ngcontent-%COMP%] {\n  fill: none;\n  stroke-width: 2.5;\n  stroke-linecap: round;\n  opacity: 0.75;\n  stroke-dasharray: 6 4;\n  pointer-events: none;\n}\n.conn-overlay-svg[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  overflow: visible;\n  z-index: 4;\n}\n.conn-overlay-svg[_ngcontent-%COMP%]   .conn-group[_ngcontent-%COMP%] {\n  pointer-events: none;\n}\n.conn-hit[_ngcontent-%COMP%] {\n  fill: none;\n  stroke: rgba(0, 0, 0, 0.01);\n  stroke-width: 32;\n  pointer-events: stroke;\n  cursor: default;\n}\n.wp-dragging[_nghost-%COMP%] {\n  cursor: grabbing !important;\n}\n.wp-dragging[_nghost-%COMP%]   .conn-hit[_ngcontent-%COMP%] {\n  cursor: grabbing;\n}\n.pending-overlay-svg[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  overflow: visible;\n  z-index: 10;\n}\n.loop-badge-bg[_ngcontent-%COMP%] {\n  fill: rgba(15, 23, 42, 0.92);\n  stroke: rgba(255, 255, 255, 0.3);\n  stroke-width: 1.5;\n  cursor: pointer;\n  pointer-events: all;\n}\n.loop-badge-count[_ngcontent-%COMP%] {\n  fill: #f8fafc;\n  font-size: 11px;\n  font-weight: 700;\n  font-family: monospace;\n  cursor: pointer;\n  pointer-events: all;\n}\n.conn-delete-btn[_ngcontent-%COMP%] {\n  fill: rgba(239, 68, 68, 0.85);\n  cursor: pointer;\n  pointer-events: all;\n  transition: fill 0.15s;\n}\n.conn-delete-btn[_ngcontent-%COMP%]:hover {\n  fill: #ef4444;\n}\n.conn-delete-x[_ngcontent-%COMP%] {\n  fill: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n  pointer-events: all;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.start-node[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 68px;\n  height: 68px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: grab;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.start-node[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.start-node-ring[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: -6px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.35);\n  animation: _ngcontent-%COMP%_start-ring-pulse 2.4s ease-in-out infinite;\n  pointer-events: none;\n}\n@keyframes _ngcontent-%COMP%_start-ring-pulse {\n  0%, 100% {\n    opacity: 0.5;\n    transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.05);\n  }\n}\n.start-node-core[_ngcontent-%COMP%] {\n  width: 68px;\n  height: 68px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at 38% 35%,\n      rgba(255, 255, 255, 0.25) 0%,\n      rgba(200, 200, 255, 0.08) 55%,\n      transparent 80%);\n  border: 2px solid rgba(255, 255, 255, 0.6);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow:\n    0 0 20px rgba(255, 255, 255, 0.25),\n    0 0 40px rgba(180, 160, 255, 0.18),\n    inset 0 0 16px rgba(255, 255, 255, 0.07);\n  animation: _ngcontent-%COMP%_start-glow-breathe 3s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_start-glow-breathe {\n  0%, 100% {\n    box-shadow:\n      0 0 20px rgba(255, 255, 255, 0.25),\n      0 0 40px rgba(180, 160, 255, 0.18),\n      inset 0 0 16px rgba(255, 255, 255, 0.07);\n  }\n  50% {\n    box-shadow:\n      0 0 34px rgba(255, 255, 255, 0.45),\n      0 0 60px rgba(180, 160, 255, 0.32),\n      inset 0 0 24px rgba(255, 255, 255, 0.12);\n  }\n}\n.start-node-label[_ngcontent-%COMP%] {\n  font-size: 0.58rem;\n  font-weight: 800;\n  letter-spacing: 0.15em;\n  color: rgba(255, 255, 255, 0.85);\n  text-shadow: 0 0 8px #fff;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.start-node.start-node-selected[_ngcontent-%COMP%]   .start-node-core[_ngcontent-%COMP%] {\n  border-color: #fff;\n  box-shadow:\n    0 0 26px rgba(255, 255, 255, 0.6),\n    0 0 55px rgba(180, 160, 255, 0.45),\n    inset 0 0 22px rgba(255, 255, 255, 0.14);\n  animation: none;\n}\n.start-node.start-node-selected[_ngcontent-%COMP%]   .start-node-ring[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.85);\n  opacity: 1;\n}\n.start-port-out[_ngcontent-%COMP%] {\n  position: absolute;\n  right: -7px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.rune-node[_ngcontent-%COMP%] {\n  position: absolute;\n  cursor: grab;\n  -webkit-user-select: none;\n  user-select: none;\n  overflow: visible;\n  width: 110px;\n  will-change: transform;\n}\n.rune-node[_ngcontent-%COMP%]:active, \n.rune-node.rune-node-drag[_ngcontent-%COMP%] {\n  cursor: grabbing;\n}\n.rune-node.rune-node-drag[_ngcontent-%COMP%] {\n  opacity: 0.88;\n}\n@keyframes _ngcontent-%COMP%_rune-node-float {\n  0%, 100% {\n    transform: translateY(0px);\n  }\n  50% {\n    transform: translateY(-6px);\n  }\n}\n.rune-node-img[_ngcontent-%COMP%] {\n  display: block;\n  width: 110px;\n  height: 110px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: none;\n  filter: drop-shadow(0 0 28px color-mix(in srgb, var(--glow, #8b5cf6) 80%, transparent)) drop-shadow(0 0 10px color-mix(in srgb, var(--glow, #8b5cf6) 50%, transparent)) drop-shadow(0 2px 14px rgba(0, 0, 0, 0.65));\n  transition: filter 0.25s, transform 0.35s cubic-bezier(.34, 1.56, .64, 1);\n  pointer-events: none;\n  animation: _ngcontent-%COMP%_rune-node-float 2.8s ease-in-out infinite;\n}\n.rune-node.rune-node-drag[_ngcontent-%COMP%]   .rune-node-img[_ngcontent-%COMP%] {\n  animation: none;\n}\n.rune-node[_ngcontent-%COMP%]:hover   .rune-node-img[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 0 52px color-mix(in srgb, var(--glow, #8b5cf6) 100%, transparent)) drop-shadow(0 0 24px color-mix(in srgb, var(--glow, #8b5cf6) 70%, transparent)) drop-shadow(0 0 10px color-mix(in srgb, var(--glow, #8b5cf6) 40%, transparent)) drop-shadow(0 4px 22px rgba(0, 0, 0, 0.85));\n  animation: _ngcontent-%COMP%_rune-hover-spin 3.2s ease-in-out infinite;\n}\n.rune-node.rune-node-drag[_ngcontent-%COMP%]   .rune-node-img[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 0 52px color-mix(in srgb, var(--glow, #8b5cf6) 100%, transparent)) drop-shadow(0 0 24px color-mix(in srgb, var(--glow, #8b5cf6) 70%, transparent)) drop-shadow(0 4px 22px rgba(0, 0, 0, 0.85));\n}\n@keyframes _ngcontent-%COMP%_rune-hover-spin {\n  0% {\n    transform: scale(1.02) rotate(-4deg);\n  }\n  25% {\n    transform: scale(1.04) rotate(4deg);\n  }\n  50% {\n    transform: scale(1.02) rotate(-3deg);\n  }\n  75% {\n    transform: scale(1.04) rotate(3deg);\n  }\n  100% {\n    transform: scale(1.02) rotate(-4deg);\n  }\n}\n.rune-node-placeholder[_ngcontent-%COMP%] {\n  width: 110px;\n  height: 110px;\n  border-radius: 50%;\n  background: transparent;\n  box-shadow:\n    0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 55%, transparent),\n    0 0 28px color-mix(in srgb, var(--glow, #8b5cf6) 40%, transparent),\n    0 0 8px color-mix(in srgb, var(--glow, #8b5cf6) 20%, transparent);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: box-shadow 0.22s;\n}\n.rune-node[_ngcontent-%COMP%]:hover   .rune-node-placeholder[_ngcontent-%COMP%] {\n  box-shadow:\n    0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 80%, white),\n    0 0 40px color-mix(in srgb, var(--glow, #8b5cf6) 65%, transparent),\n    0 0 14px color-mix(in srgb, var(--glow, #8b5cf6) 35%, transparent);\n}\n.rune-node-placeholder[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  font-size: 2.6rem;\n  font-weight: 800;\n  color: var(--glow, #8b5cf6);\n  filter: drop-shadow(0 0 12px var(--glow, #8b5cf6));\n  -webkit-user-select: none;\n  user-select: none;\n}\n.rune-node-unknown[_ngcontent-%COMP%] {\n  border-color: #6b7280 !important;\n}\n.rune-node-unknown[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  color: #6b7280;\n  filter: none;\n}\n.rune-node-name[_ngcontent-%COMP%] {\n  text-align: center;\n  font-size: 0.72rem;\n  font-weight: 600;\n  color: #c4b5fd;\n  margin-top: 5px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 110px;\n  text-shadow: 0 0 8px color-mix(in srgb, var(--glow, #8b5cf6) 35%, transparent);\n  pointer-events: none;\n  animation: _ngcontent-%COMP%_rune-node-float 2.8s ease-in-out infinite;\n}\n.rune-node.rune-node-drag[_ngcontent-%COMP%]   .rune-node-name[_ngcontent-%COMP%] {\n  animation: none;\n}\n.rune-node.rune-node-selected[_ngcontent-%COMP%]   .rune-node-img[_ngcontent-%COMP%] {\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 80%, white);\n  animation: _ngcontent-%COMP%_rune-img-selected-pulse 1.1s ease-in-out infinite alternate;\n}\n@keyframes _ngcontent-%COMP%_rune-img-selected-pulse {\n  from {\n    filter: drop-shadow(0 0 30px color-mix(in srgb, var(--glow, #8b5cf6) 90%, transparent)) drop-shadow(0 0 55px color-mix(in srgb, var(--glow, #8b5cf6) 55%, transparent)) brightness(1.05);\n    opacity: 0.9;\n  }\n  to {\n    filter: drop-shadow(0 0 48px color-mix(in srgb, var(--glow, #8b5cf6) 100%, transparent)) drop-shadow(0 0 80px color-mix(in srgb, var(--glow, #8b5cf6) 70%, transparent)) brightness(1.3);\n    opacity: 1;\n  }\n}\n.rune-node.rune-node-selected[_ngcontent-%COMP%]   .rune-node-placeholder[_ngcontent-%COMP%] {\n  box-shadow:\n    0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 90%, white),\n    0 0 45px color-mix(in srgb, var(--glow, #8b5cf6) 90%, transparent),\n    0 0 90px color-mix(in srgb, var(--glow, #8b5cf6) 55%, transparent);\n  animation: _ngcontent-%COMP%_rune-selected-pulse 1.1s ease-in-out infinite alternate;\n}\n@keyframes _ngcontent-%COMP%_rune-selected-pulse {\n  from {\n    filter: brightness(1);\n    opacity: 0.88;\n  }\n  to {\n    filter: brightness(1.25);\n    opacity: 1;\n  }\n}\n.rune-port[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: transparent;\n  border: none;\n  cursor: crosshair;\n  z-index: 15;\n}\n.rune-port[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  border: 1.5px solid var(--pc, #ffffff);\n  background: #07090f;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: 0 0 5px color-mix(in srgb, var(--pc, #ffffff) 45%, transparent);\n  transition:\n    transform 0.12s,\n    background 0.12s,\n    box-shadow 0.12s;\n  pointer-events: none;\n}\n.rune-port[_ngcontent-%COMP%]:hover::before, \n.rune-port.rune-port-hovered[_ngcontent-%COMP%]::before {\n  transform: translate(-50%, -50%) scale(1.7);\n  background: var(--pc, #ffffff);\n  box-shadow: 0 0 14px var(--pc, #ffffff), 0 0 5px rgba(255, 255, 255, 0.5);\n}\n.rune-port.rune-port-valid[_ngcontent-%COMP%]::before {\n  background: color-mix(in srgb, var(--pc, #ffffff) 18%, #07090f);\n  box-shadow: 0 0 10px var(--pc, #ffffff), 0 0 20px color-mix(in srgb, var(--pc, #ffffff) 45%, transparent);\n  transform: translate(-50%, -50%) scale(1.3);\n  animation: _ngcontent-%COMP%_port-valid-pulse 0.9s ease-in-out infinite alternate;\n  transition: none;\n}\n.rune-port.rune-port-valid.rune-port-hovered[_ngcontent-%COMP%]::before {\n  transform: translate(-50%, -50%) scale(1.6) !important;\n  background: var(--pc, #ffffff) !important;\n  box-shadow: 0 0 22px var(--pc, #ffffff), 0 0 44px color-mix(in srgb, var(--pc, #ffffff) 65%, transparent) !important;\n}\n@keyframes _ngcontent-%COMP%_port-valid-pulse {\n  from {\n    box-shadow: 0 0 8px var(--pc, #ffffff), 0 0 16px color-mix(in srgb, var(--pc, #ffffff) 35%, transparent);\n  }\n  to {\n    box-shadow: 0 0 16px var(--pc, #ffffff), 0 0 32px color-mix(in srgb, var(--pc, #ffffff) 60%, transparent);\n  }\n}\n.rune-port-tip[_ngcontent-%COMP%] {\n  position: absolute;\n  font-size: 0.63rem;\n  font-weight: 600;\n  color: #e2e8f0;\n  white-space: nowrap;\n  pointer-events: none;\n  background: rgba(6, 8, 20, 0.94);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 5px;\n  padding: 2px 6px;\n  opacity: 0;\n  transition: opacity 0.15s;\n  z-index: 30;\n  top: 50%;\n  transform: translateY(-50%);\n  line-height: 1.4;\n}\n.rune-port[_ngcontent-%COMP%]:hover   .rune-port-tip[_ngcontent-%COMP%], \n.rune-port.rune-port-hovered[_ngcontent-%COMP%]   .rune-port-tip[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.rune-port-tip-in[_ngcontent-%COMP%] {\n  left: 14px;\n}\n.rune-port-tip-out[_ngcontent-%COMP%] {\n  right: 14px;\n}\n.port-circle[_ngcontent-%COMP%] {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  border: 2px solid var(--port-color, #8b5cf6);\n  background: rgba(9, 11, 24, 0.95);\n  cursor: crosshair;\n  flex-shrink: 0;\n  transition:\n    transform 0.12s,\n    box-shadow 0.12s,\n    background 0.12s;\n  box-shadow: 0 0 6px color-mix(in srgb, var(--port-color, #8b5cf6) 50%, transparent);\n}\n.port-circle.port-flow[_ngcontent-%COMP%] {\n  border-color: #ffffff;\n  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);\n}\n.port-circle[_ngcontent-%COMP%]:hover, \n.port-circle.port-hovered[_ngcontent-%COMP%] {\n  transform: scale(1.4);\n  background: var(--port-color, #8b5cf6);\n  box-shadow: 0 0 14px var(--port-color, #8b5cf6);\n}\n.port-circle.port-flow[_ngcontent-%COMP%]:hover, \n.port-circle.port-flow.port-hovered[_ngcontent-%COMP%] {\n  background: #ffffff;\n  box-shadow: 0 0 14px rgba(255, 255, 255, 0.8);\n}\n.zoom-controls[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 16px;\n  bottom: 36px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: rgba(9, 11, 24, 0.88);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 10px;\n  padding: 4px 8px;\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n}\n.zoom-btn[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n  border-radius: 6px;\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #9ca3af;\n  font-size: 1rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  transition: all 0.15s;\n}\n.zoom-btn[_ngcontent-%COMP%]:hover {\n  border-color: #8b5cf6;\n  color: #e2e8f0;\n  background: rgba(139, 92, 246, 0.15);\n}\n.zoom-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #6b7280;\n  min-width: 36px;\n  text-align: center;\n}\n.canvas-hint[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 4px 12px;\n  font-size: 0.65rem;\n  color: rgba(107, 114, 128, 0.7);\n  background: rgba(5, 8, 17, 0.7);\n  -webkit-user-select: none;\n  user-select: none;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  border-top: 1px solid rgba(255, 255, 255, 0.04);\n}\n.rune-port-multi[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  -webkit-mask:\n    radial-gradient(\n      circle at 50% 50%,\n      transparent 0%,\n      transparent 56%,\n      rgba(0, 0, 0, 0.5) 59%,\n      black 62%,\n      black 100%);\n  mask:\n    radial-gradient(\n      circle at 50% 50%,\n      transparent 0%,\n      transparent 56%,\n      rgba(0, 0, 0, 0.5) 59%,\n      black 62%,\n      black 100%);\n  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));\n  animation: _ngcontent-%COMP%_multiport-spin 5s linear infinite;\n}\n.rune-port-multi[_ngcontent-%COMP%]::before {\n  display: none !important;\n}\n@keyframes _ngcontent-%COMP%_multiport-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n.rune-port-multi[_ngcontent-%COMP%]:hover, \n.rune-port-multi.rune-port-hovered[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.75));\n  animation: _ngcontent-%COMP%_multiport-spin-hover 5s linear infinite;\n}\n@keyframes _ngcontent-%COMP%_multiport-spin-hover {\n  from {\n    transform: scale(1.55) rotate(0deg);\n  }\n  to {\n    transform: scale(1.55) rotate(360deg);\n  }\n}\n.rune-port-multi.rune-port-valid[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.6));\n  animation: _ngcontent-%COMP%_multiport-spin-valid 5s linear infinite, _ngcontent-%COMP%_multiport-valid-glow 0.85s ease-in-out infinite alternate;\n}\n.rune-port-multi.rune-port-valid.rune-port-hovered[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_multiport-spin-hover 5s linear infinite, _ngcontent-%COMP%_multiport-valid-glow 0.85s ease-in-out infinite alternate;\n}\n@keyframes _ngcontent-%COMP%_multiport-spin-valid {\n  from {\n    transform: scale(1.35) rotate(0deg);\n  }\n  to {\n    transform: scale(1.35) rotate(360deg);\n  }\n}\n@keyframes _ngcontent-%COMP%_multiport-valid-glow {\n  from {\n    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.55));\n  }\n  to {\n    filter: drop-shadow(0 0 14px rgba(255, 255, 255, 1.0));\n  }\n}\n.rune-port-multi.rune-port-occupied[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.45));\n}\n.conn-path.conn-gradient[_ngcontent-%COMP%] {\n  stroke-dasharray: 10 6;\n  opacity: 0.92;\n  animation: _ngcontent-%COMP%_gradient-flow 0.9s linear infinite;\n}\n.conn-path-glow.conn-gradient[_ngcontent-%COMP%] {\n  stroke-width: 7;\n  opacity: 0.28;\n  stroke-dasharray: none;\n  animation: _ngcontent-%COMP%_gradient-glow-pulse 1.5s ease-in-out infinite alternate;\n}\n@keyframes _ngcontent-%COMP%_gradient-flow {\n  from {\n    stroke-dashoffset: 16;\n  }\n  to {\n    stroke-dashoffset: 0;\n  }\n}\n@keyframes _ngcontent-%COMP%_gradient-glow-pulse {\n  from {\n    opacity: 0.18;\n    stroke-width: 6;\n  }\n  to {\n    opacity: 0.42;\n    stroke-width: 10;\n  }\n}\n.sne-mode-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 0 6px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  background: rgba(255, 255, 255, 0.03);\n}\n.sne-mode-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: rgba(156, 163, 175, 0.7);\n  white-space: nowrap;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.sne-mode-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: rgba(107, 114, 128, 0.8);\n  font-size: 0.72rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition: all 0.12s;\n}\n.sne-mode-btn[_ngcontent-%COMP%]:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.sne-mode-btn.sne-mode-active[_ngcontent-%COMP%] {\n  background: #8b5cf6;\n  border-color: #8b5cf6;\n  color: #fff;\n}\n.ri-section-lbl-mode[_ngcontent-%COMP%] {\n  margin-top: 10px;\n}\n.ri-mode-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  margin: 5px 0 4px;\n}\n.ri-mode-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 5px 0;\n  border-radius: 6px;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  background: rgba(255, 255, 255, 0.04);\n  color: rgba(156, 163, 175, 0.7);\n  font-size: 0.78rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    background 0.12s,\n    color 0.12s;\n}\n.ri-mode-btn[_ngcontent-%COMP%]:hover:not([disabled]) {\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.ri-mode-btn.ri-mode-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.3);\n  border-color: #8b5cf6;\n  color: #e9d5ff;\n}\n.ri-mode-btn.ri-mode-blocked[_ngcontent-%COMP%] {\n  color: rgba(245, 158, 11, 0.7);\n  border-color: rgba(245, 158, 11, 0.25);\n  cursor: not-allowed;\n}\n.ri-mode-btn[disabled][_ngcontent-%COMP%] {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n.ri-mode-hint[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: rgba(245, 158, 11, 0.8);\n  margin: 2px 0 6px;\n  line-height: 1.35;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: rgba(139, 92, 246, 0.55);\n}\n.neutral-node-wrap[_ngcontent-%COMP%] {\n  width: 110px;\n  height: 110px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.neutral-node-body[_ngcontent-%COMP%] {\n  width: 54px;\n  height: 54px;\n  border-radius: 50%;\n  background: transparent;\n  border: 2px solid var(--nc, #6b7280);\n  box-shadow: 0 0 10px 3px color-mix(in srgb, var(--nc, #6b7280) 55%, transparent), inset 0 0 8px color-mix(in srgb, var(--nc, #6b7280) 15%, transparent);\n  position: relative;\n  animation: _ngcontent-%COMP%_neutral-spin 5s linear infinite;\n  flex-shrink: 0;\n}\n.neutral-node-body[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: 12%;\n  bottom: 12%;\n  left: calc(50% - 1px);\n  width: 2px;\n  border-radius: 1px;\n  background: var(--nc, #6b7280);\n  box-shadow: 0 0 5px 1px color-mix(in srgb, var(--nc, #6b7280) 70%, transparent);\n}\n@keyframes _ngcontent-%COMP%_neutral-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.palette-neutral-icon[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  background: transparent;\n  border: 1.5px solid var(--glow, #6b7280);\n  box-shadow: 0 0 6px color-mix(in srgb, var(--glow, #6b7280) 55%, transparent);\n  position: relative;\n  animation: _ngcontent-%COMP%_neutral-spin 5s linear infinite;\n  flex-shrink: 0;\n}\n.palette-neutral-icon[_ngcontent-%COMP%]::after {\n  content: "";\n  position: absolute;\n  top: 15%;\n  bottom: 15%;\n  left: calc(50% - 0.75px);\n  width: 1.5px;\n  border-radius: 1px;\n  background: var(--glow, #6b7280);\n}\n.palette-rune-neutral[_ngcontent-%COMP%] {\n  border-color: rgba(107, 114, 128, 0.25) !important;\n}\n.summon-node-wrap[_ngcontent-%COMP%] {\n  width: 110px;\n  height: 110px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.summon-glyph[_ngcontent-%COMP%] {\n  --sc: var(--glow, #a78bfa);\n  --sw: 2px;\n  position: relative;\n  width: 92px;\n  height: 92px;\n  flex-shrink: 0;\n  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--sc) 55%, transparent));\n}\n.summon-glyph[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: 12%;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle,\n      color-mix(in srgb, var(--sc) 38%, transparent) 0%,\n      transparent 70%);\n  animation: _ngcontent-%COMP%_summon-haze 3.4s ease-in-out infinite alternate;\n}\n.summon-sq[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  border: var(--sw) solid var(--sc);\n  border-radius: 3px;\n  opacity: 0.55;\n  mix-blend-mode: screen;\n  transform-origin: 50% 50%;\n  animation: _ngcontent-%COMP%_summon-spin 8s linear infinite, _ngcontent-%COMP%_summon-breathe 3.6s ease-in-out infinite;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(1) {\n  animation-duration: 6.0s, 3.2s;\n  animation-delay: -0.0s, -0.0s;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(2) {\n  animation-duration: 9.0s, 4.1s;\n  animation-delay: -1.1s, -0.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(3) {\n  animation-duration: 4.5s, 2.7s;\n  animation-delay: -2.2s, -1.0s;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(4) {\n  animation-duration: 11.0s, 5.3s;\n  animation-delay: -3.3s, -1.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(5) {\n  animation-duration: 7.5s, 3.7s;\n  animation-delay: -4.4s, -2.0s;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(6) {\n  animation-duration: 13.0s, 4.7s;\n  animation-delay: -5.5s, -2.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(7) {\n  animation-duration: 5.5s, 2.9s;\n  animation-delay: -6.6s, -3.0s;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(8) {\n  animation-duration: 8.5s, 6.1s;\n  animation-delay: -7.7s, -3.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(3n) {\n  border-color: color-mix(in srgb, var(--sc) 45%, #22d3ee);\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(3n+1) {\n  border-color: color-mix(in srgb, var(--sc) 70%, #f0abfc);\n}\n.summon-sq[_ngcontent-%COMP%]:nth-child(4n) {\n  border-style: dashed;\n}\n@keyframes _ngcontent-%COMP%_summon-spin {\n  to {\n    rotate: 360deg;\n  }\n}\n@keyframes _ngcontent-%COMP%_summon-breathe {\n  0% {\n    scale: 0.34;\n    opacity: 0.28;\n  }\n  50% {\n    scale: 1.00;\n    opacity: 0.72;\n  }\n  100% {\n    scale: 0.34;\n    opacity: 0.28;\n  }\n}\n@keyframes _ngcontent-%COMP%_summon-haze {\n  from {\n    opacity: 0.35;\n    scale: 0.8;\n  }\n  to {\n    opacity: 0.8;\n    scale: 1.15;\n  }\n}\n.rune-node.rune-node-selected[_ngcontent-%COMP%]   .summon-glyph[_ngcontent-%COMP%] {\n  filter: drop-shadow(0 0 18px color-mix(in srgb, var(--sc) 90%, transparent)) drop-shadow(0 0 34px color-mix(in srgb, var(--sc) 50%, transparent)) brightness(1.25);\n}\n.rune-node.rune-node-drag[_ngcontent-%COMP%]   .summon-sq[_ngcontent-%COMP%], \n.rune-node.rune-node-drag[_ngcontent-%COMP%]   .summon-glyph[_ngcontent-%COMP%]::before {\n  animation-play-state: paused;\n}\n.rune-node-name-summon[_ngcontent-%COMP%] {\n  color: #e9d5ff;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n.summon-glyph-mini[_ngcontent-%COMP%] {\n  --sc: var(--glow, #a78bfa);\n  --sw: 1px;\n  width: 22px;\n  height: 22px;\n  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--sc) 60%, transparent));\n}\n.summon-glyph-mini[_ngcontent-%COMP%]   .summon-sq[_ngcontent-%COMP%] {\n  border-radius: 2px;\n}\n@media (prefers-reduced-motion: reduce) {\n  .summon-sq[_ngcontent-%COMP%], \n   .summon-glyph[_ngcontent-%COMP%]::before {\n    animation: none;\n  }\n  .summon-sq[_ngcontent-%COMP%] {\n    scale: 0.34;\n    opacity: 0.5;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(2) {\n    scale: 0.5;\n    rotate: 12deg;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(3) {\n    scale: 0.62;\n    rotate: 24deg;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(4) {\n    scale: 0.72;\n    rotate: 36deg;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(5) {\n    scale: 0.8;\n    rotate: 48deg;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(6) {\n    scale: 0.87;\n    rotate: 60deg;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(7) {\n    scale: 0.94;\n    rotate: 72deg;\n  }\n  .summon-sq[_ngcontent-%COMP%]:nth-child(8) {\n    scale: 1;\n    rotate: 84deg;\n  }\n}\n.conn-badge[_ngcontent-%COMP%] {\n  pointer-events: none;\n}\n.conn-badge-bg[_ngcontent-%COMP%] {\n  fill: rgba(2, 4, 14, 0.96);\n  stroke: rgba(255, 255, 255, 0.2);\n  stroke-width: 1.5;\n}\n.conn-badge-passthrough[_ngcontent-%COMP%] {\n  stroke: rgba(139, 92, 246, 0.85);\n  fill: rgba(60, 20, 120, 0.92);\n}\n.conn-badge-delay[_ngcontent-%COMP%] {\n  stroke: rgba(251, 191, 36, 0.85);\n  fill: rgba(100, 60, 5, 0.92);\n}\n.conn-badge-combined-circle[_ngcontent-%COMP%] {\n  fill: none;\n  stroke: rgba(200, 160, 60, 0.45);\n  stroke-width: 1.5;\n}\n.conn-badge-divider[_ngcontent-%COMP%] {\n  stroke: rgba(255, 255, 255, 0.25);\n  stroke-width: 1;\n}\n.conn-badge-combined[_ngcontent-%COMP%]   .conn-badge-passthrough[_ngcontent-%COMP%], \n.conn-badge-combined[_ngcontent-%COMP%]   .conn-badge-delay[_ngcontent-%COMP%] {\n  stroke: none;\n}\n.conn-badge-icon-sm[_ngcontent-%COMP%] {\n  fill: #f1f5f9;\n  font-size: 12px;\n  text-anchor: middle;\n  dominant-baseline: auto;\n  pointer-events: none;\n  font-family: monospace;\n}\n.conn-badge-sub-l[_ngcontent-%COMP%] {\n  fill: rgba(226, 232, 240, 0.85);\n  font-size: 8px;\n  text-anchor: middle;\n  dominant-baseline: auto;\n  font-family: monospace;\n  font-weight: 700;\n  pointer-events: none;\n}\n.conn-badge-icon[_ngcontent-%COMP%] {\n  fill: #f1f5f9;\n  font-size: 13px;\n  text-anchor: middle;\n  dominant-baseline: central;\n  pointer-events: none;\n  font-family: monospace;\n}\n.conn-badge-sub[_ngcontent-%COMP%] {\n  fill: rgba(226, 232, 240, 0.9);\n  font-size: 9px;\n  text-anchor: middle;\n  dominant-baseline: hanging;\n  font-family: monospace;\n  font-weight: 600;\n  pointer-events: none;\n}\n.conn-cond-label-group[_ngcontent-%COMP%] {\n  pointer-events: none;\n}\n.conn-cond-label-group.cond-unknown[_ngcontent-%COMP%]   .conn-cond-label-bg[_ngcontent-%COMP%] {\n  fill: rgba(120, 40, 5, 0.96);\n  stroke: rgba(251, 146, 60, 0.85);\n  stroke-width: 1.5;\n}\n.conn-cond-label-group.cond-unknown[_ngcontent-%COMP%]   .conn-cond-label-text[_ngcontent-%COMP%] {\n  fill: #fed7aa;\n}\n.conn-cond-label-group.cond-known[_ngcontent-%COMP%]   .conn-cond-label-bg[_ngcontent-%COMP%] {\n  fill: rgba(55, 20, 110, 0.96);\n  stroke: rgba(167, 139, 250, 0.85);\n  stroke-width: 1.5;\n}\n.conn-cond-label-group.cond-known[_ngcontent-%COMP%]   .conn-cond-label-text[_ngcontent-%COMP%] {\n  fill: #ddd6fe;\n}\n.conn-cond-label-text[_ngcontent-%COMP%] {\n  font-size: 10px;\n  text-anchor: middle;\n  dominant-baseline: central;\n  font-family: monospace;\n  font-weight: 700;\n  pointer-events: none;\n}\n.conn-inspector[_ngcontent-%COMP%] {\n  width: 240px;\n  min-width: 240px;\n  background: rgba(7, 9, 20, 0.97);\n  border-left: 1px solid rgba(139, 92, 246, 0.2);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n.ci-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.ci-title[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: #a78bfa;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n.ci-close[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #6b7280;\n  font-size: 0.9rem;\n  cursor: pointer;\n  padding: 2px 4px;\n  border-radius: 4px;\n  transition: color 0.15s;\n}\n.ci-close[_ngcontent-%COMP%]:hover {\n  color: #ef4444;\n}\n.ci-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.ci-section-lbl[_ngcontent-%COMP%] {\n  font-size: 0.63rem;\n  font-weight: 700;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n  color: #4b5563;\n  margin-top: 6px;\n}\n.ci-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 5px 8px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 6px;\n  color: #e2e8f0;\n  font-size: 0.78rem;\n  outline: none;\n  transition: border-color 0.15s;\n  box-sizing: border-box;\n}\n.ci-input[_ngcontent-%COMP%]:focus {\n  border-color: #8b5cf6;\n  background: rgba(139, 92, 246, 0.06);\n}\n.ci-input[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n.ci-input-num[_ngcontent-%COMP%] {\n  max-width: 80px;\n  text-align: right;\n}\n.ci-input-hint[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #6b7280;\n  align-self: center;\n}\n.ci-shape-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.ci-shape-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 6px 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  color: #9ca3af;\n  font-size: 0.75rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.ci-shape-btn[_ngcontent-%COMP%]:hover {\n  border-color: #8b5cf6;\n  color: #e2e8f0;\n}\n.ci-shape-btn.ci-shape-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.ci-shape-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n.ci-toggle-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.ci-toggle-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 6px 10px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 7px;\n  color: #9ca3af;\n  font-size: 0.75rem;\n  cursor: pointer;\n  text-align: left;\n  transition: all 0.15s;\n}\n.ci-toggle-btn[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #e2e8f0;\n}\n.ci-toggle-btn.ci-toggle-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.ci-toggle-passthrough.ci-toggle-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.22);\n  border-color: #a78bfa;\n}\n.ci-precast-toggle[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-top: 6px;\n  padding: 7px 10px;\n  background: rgba(52, 211, 153, 0.07);\n  border: 1px solid rgba(52, 211, 153, 0.3);\n  border-radius: 7px;\n  color: #6ee7b7;\n  font-size: 0.75rem;\n  cursor: pointer;\n  text-align: left;\n  transition: all 0.15s;\n}\n.ci-precast-toggle[_ngcontent-%COMP%]:hover {\n  border-color: rgba(52, 211, 153, 0.6);\n  color: #a7f3d0;\n}\n.ci-precast-toggle.is-known[_ngcontent-%COMP%] {\n  background: rgba(251, 191, 36, 0.12);\n  border-color: #f59e0b;\n  color: #fcd34d;\n}\n.ci-precast-toggle.is-known[_ngcontent-%COMP%]:hover {\n  background: rgba(251, 191, 36, 0.18);\n  border-color: #fbbf24;\n}\n.ci-excl-toggle[_ngcontent-%COMP%] {\n  background: rgba(251, 146, 60, 0.07);\n  border: 1px solid rgba(251, 146, 60, 0.3);\n  color: #fb923c;\n}\n.ci-excl-toggle[_ngcontent-%COMP%]:hover {\n  border-color: rgba(251, 146, 60, 0.55);\n  color: #fdba74;\n}\n.ci-excl-toggle.is-exclusive[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.1);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.ci-excl-toggle.is-exclusive[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.16);\n  border-color: #f87171;\n}\n.ci-passthrough-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.ci-delay-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.qs-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 2000;\n  cursor: default;\n}\n.qs-popup[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 2001;\n  width: 240px;\n  background: rgba(7, 9, 22, 0.98);\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  border-radius: 10px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(139, 92, 246, 0.15);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.qs-header[_ngcontent-%COMP%] {\n  padding: 9px 12px 6px;\n  font-size: 0.7rem;\n  font-weight: 700;\n  color: #a78bfa;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n}\n.qs-input[_ngcontent-%COMP%] {\n  margin: 8px;\n  padding: 6px 10px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n  color: #e2e8f0;\n  font-size: 0.82rem;\n  outline: none;\n}\n.qs-input[_ngcontent-%COMP%]:focus {\n  border-color: #8b5cf6;\n}\n.qs-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  max-height: 260px;\n  overflow-y: auto;\n  padding: 4px 0 6px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.qs-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 10px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #d1d5db;\n  font-size: 0.8rem;\n  transition: background 0.1s;\n}\n.qs-item[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.15);\n  color: #e2e8f0;\n}\n.qs-item-incompatible[_ngcontent-%COMP%] {\n  opacity: 0.38;\n}\n.qs-item-incompatible[_ngcontent-%COMP%]:hover {\n  opacity: 0.58;\n  background: rgba(100, 100, 120, 0.10);\n}\n.qs-item-glyph[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n  overflow: hidden;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(30, 20, 60, 0.8);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n}\n.qs-item-img[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  object-fit: contain;\n}\n.qs-item-icon[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: #a78bfa;\n}\n.qs-item-name[_ngcontent-%COMP%] {\n  flex: 1;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.qs-empty[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  color: #6b7280;\n  font-size: 0.78rem;\n  font-style: italic;\n}\n.close-dialog-backdrop[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.55);\n  z-index: 200;\n}\n.close-dialog-box[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 201;\n  background: rgba(14, 18, 38, 0.98);\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  border-radius: 12px;\n  padding: 28px 32px 24px;\n  min-width: 360px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7);\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.close-dialog-title[_ngcontent-%COMP%] {\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: #e2e8f0;\n  letter-spacing: 0.02em;\n}\n.close-dialog-body[_ngcontent-%COMP%] {\n  font-size: 0.88rem;\n  color: #94a3b8;\n  line-height: 1.5;\n}\n.close-dialog-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  justify-content: flex-end;\n  margin-top: 4px;\n}\n.close-dialog-btn[_ngcontent-%COMP%] {\n  padding: 8px 18px;\n  border-radius: 7px;\n  border: 1px solid;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s, color 0.15s;\n}\n.close-dialog-save[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.15);\n  border-color: rgba(34, 197, 94, 0.5);\n  color: #86efac;\n}\n.close-dialog-save[_ngcontent-%COMP%]:hover {\n  background: rgba(34, 197, 94, 0.28);\n  color: #bbf7d0;\n}\n.close-dialog-discard[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.12);\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n}\n.close-dialog-discard[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.24);\n  color: #fecaca;\n}\n.close-dialog-cancel[_ngcontent-%COMP%] {\n  background: rgba(100, 116, 139, 0.12);\n  border-color: rgba(100, 116, 139, 0.35);\n  color: #94a3b8;\n}\n.close-dialog-cancel[_ngcontent-%COMP%]:hover {\n  background: rgba(100, 116, 139, 0.22);\n  color: #cbd5e1;\n}\n.conn-waypoint[_ngcontent-%COMP%] {\n  fill: rgba(15, 23, 42, 0.9);\n  stroke: rgba(139, 92, 246, 0.7);\n  stroke-width: 1.5;\n  cursor: grab;\n  pointer-events: all;\n  opacity: 0;\n  transition:\n    opacity 0.15s,\n    r 0.1s,\n    stroke 0.1s;\n}\n.conn-group[_ngcontent-%COMP%]:has(.conn-hit:hover)   .conn-waypoint[_ngcontent-%COMP%] {\n  opacity: 0.45;\n}\n.conn-waypoint.conn-waypoint-selected[_ngcontent-%COMP%] {\n  opacity: 1;\n  fill: rgba(139, 92, 246, 0.3);\n  stroke: #c4b5fd;\n}\n.conn-group[_ngcontent-%COMP%]:has(.conn-hit:hover)   .conn-waypoint.conn-waypoint-selected[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.conn-waypoint[_ngcontent-%COMP%]:hover {\n  fill: rgba(139, 92, 246, 0.25);\n  stroke: #a78bfa;\n  stroke-width: 2;\n  cursor: grabbing;\n  opacity: 1;\n}\n.conn-snap-dot[_ngcontent-%COMP%] {\n  fill: none;\n  stroke: rgba(139, 92, 246, 0.45);\n  stroke-width: 1;\n  stroke-dasharray: 2 2;\n  pointer-events: none;\n}\n.conn-waypoint-preview[_ngcontent-%COMP%] {\n  fill: rgba(139, 92, 246, 0.35);\n  stroke: #a78bfa;\n  stroke-width: 2;\n  pointer-events: none;\n}\n.snap-line-svg[_ngcontent-%COMP%] {\n  pointer-events: none;\n}\n.node-snap-line[_ngcontent-%COMP%] {\n  stroke: rgba(139, 92, 246, 0.55);\n  stroke-width: 1;\n  stroke-dasharray: 4 4;\n}\n.marquee-box[_ngcontent-%COMP%] {\n  position: absolute;\n  border: 1.5px dashed rgba(139, 92, 246, 0.7);\n  background: rgba(139, 92, 246, 0.08);\n  border-radius: 3px;\n  pointer-events: none;\n  z-index: 50;\n}\n.rune-inspector[_ngcontent-%COMP%] {\n  width: 240px;\n  flex-shrink: 0;\n  background: rgba(10, 12, 26, 0.98);\n  border-left: 1px solid rgba(139, 92, 246, 0.2);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.ri-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 14px 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.ri-title[_ngcontent-%COMP%] {\n  font-size: 0.66rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.12em;\n  color: #a78bfa;\n}\n.ri-close[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 6px;\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #6b7280;\n  font-size: 0.75rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.ri-close[_ngcontent-%COMP%]:hover {\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.ri-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px 12px 20px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.ri-img[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  aspect-ratio: 1;\n  object-fit: cover;\n  border-radius: 10px;\n  margin-bottom: 12px;\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.3);\n}\n.ri-name[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  font-weight: 700;\n  margin: 0 0 8px;\n  line-height: 1.3;\n  text-shadow: 0 0 12px currentColor;\n}\n.ri-tags[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-bottom: 10px;\n}\n.ri-tag[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 600;\n  padding: 2px 7px;\n  border-radius: 99px;\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  color: #a78bfa;\n}\n.ri-desc[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #9ca3af;\n  line-height: 1.55;\n  margin: 0 0 12px;\n}\n.ri-costs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n.ri-cost[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px;\n  padding: 5px 10px;\n  min-width: 52px;\n}\n.ri-cost-lbl[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: #6b7280;\n  letter-spacing: 0.08em;\n}\n.ri-cost-val[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  font-weight: 700;\n  color: #e2e8f0;\n  margin-top: 1px;\n}\n.summon-config[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 12px;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 30;\n  background: #1e293b;\n  border: 1px solid #a78bfa;\n  border-radius: 10px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-width: 260px;\n  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);\n}\n.summon-config-head[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.85rem;\n  color: #c4b5fd;\n}\n.summon-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  font-size: 0.75rem;\n  color: #9ca3af;\n}\n.summon-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  padding: 6px 8px;\n  background: #0f172a;\n  border: 1px solid #4a5568;\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n}\n.summon-hint[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #9ca3af;\n  font-style: italic;\n  margin: 0;\n}\n.summon-edit-btn[_ngcontent-%COMP%] {\n  padding: 7px 12px;\n  background: rgba(167, 139, 250, 0.18);\n  border: 1px solid #a78bfa;\n  border-radius: 6px;\n  color: #c4b5fd;\n  font-weight: 600;\n  font-size: 0.82rem;\n  cursor: pointer;\n}\n.summon-edit-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(167, 139, 250, 0.3);\n}\n.summon-ok[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #34d399;\n  text-align: center;\n}\n.summon-config-ico[_ngcontent-%COMP%] {\n  width: 15px;\n  height: 15px;\n  vertical-align: -3px;\n}\n/*# sourceMappingURL=spell-node-editor.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SpellNodeEditorComponent, [{
    type: Component,
    args: [{ selector: "app-spell-node-editor", standalone: true, imports: [CommonModule, FormsModule, ImageUrlPipe], template: `<div class="sne-overlay">\r
  <div class="sne-layout">\r
\r
    <!-- \u2500\u2500 LEFT PALETTE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <aside class="rune-palette">\r
      <div class="palette-header">\r
        <span class="palette-title">Runen</span>\r
      </div>\r
      <div class="palette-search-wrap">\r
        <input class="palette-search" type="text" [(ngModel)]="paletteSearch"\r
               placeholder="Suchen\u2026" autocomplete="off"/>\r
      </div>\r
      <div class="palette-list">\r
        @for (rune of filteredPaletteRunes; track trackByName($index, rune)) {\r
          <div class="palette-rune"\r
               [class.palette-rune-neutral]="rune.name === NEUTRAL_RUNE_ID"\r
               draggable="true"\r
               (dragstart)="onPaletteDragStart($event, rune)"\r
               (click)="inspectPaletteRune(rune)"\r
               [style.--glow]="rune.name === NEUTRAL_RUNE_ID ? '#6b7280' : (rune.glowColor || '#8b5cf6')">\r
            <div class="palette-rune-glyph">\r
              @if (rune.name === NEUTRAL_RUNE_ID) {\r
                <div class="palette-neutral-icon"></div>\r
              } @else if (rune.name === SUMMON_RUNE_ID) {\r
                <div class="summon-glyph summon-glyph-mini">\r
                  @for (i of SUMMON_SQUARES; track i) {\r
                    <span class="summon-sq"></span>\r
                  }\r
                </div>\r
              } @else if (rune.drawing) {\r
                <img [src]="rune.drawing | imageUrl" class="palette-rune-img" [alt]="rune.name"/>\r
              } @else {\r
                <span class="palette-rune-icon">\u2726</span>\r
              }\r
            </div>\r
            <div class="palette-rune-info">\r
              <div class="palette-rune-name">{{ paletteRuneName(rune) }}</div>\r
              @if (rune.name !== NEUTRAL_RUNE_ID && rune.tags.length) {\r
                <div class="palette-rune-tags">{{ rune.tags!.join(' \xB7 ') }}</div>\r
              }\r
            </div>\r
          </div>\r
        }\r
        @if (filteredPaletteRunes.length === 0) {\r
          <div class="palette-empty">Keine Runen gefunden</div>\r
        }\r
      </div>\r
    </aside>\r
\r
    <!-- \u2500\u2500 MAIN AREA \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="sne-main">\r
\r
      <!-- Top bar -->\r
      <div class="sne-topbar">\r
        <div class="sne-topbar-left">\r
          <span class="sne-spell-title">{{ spellName || 'Neuer Zauber' }}</span>\r
        </div>\r
        <div class="sne-topbar-right">\r
          <button class="tb-btn tb-close" (click)="onClose()">Schlie\xDFen \u2715</button>\r
          <button class="tb-btn tb-save"\r
                  [class.tb-save-done]="savedFeedback"\r
                  [class.tb-save-dirty]="isDirty && !savedFeedback"\r
                  [disabled]="savedFeedback"\r
                  (click)="onSave()">\r
            {{ savedFeedback ? '\\u2713 Gespeichert!' : '\xDCbernehmen & Speichern (Strg+S)' }}\r
          </button>\r
        </div>\r
      </div>\r
\r
      <!-- Canvas -->\r
      <div class="canvas-wrap"\r
           #canvasWrap\r
           (wheel)="onWheel($event)"\r
           (mousedown)="onCanvasMouseDown($event)"\r
           (contextmenu)="$event.preventDefault()"\r
           (drop)="onCanvasDrop($event)"\r
           (dragover)="onCanvasDragOver($event)">\r
\r
        <!-- Grid bg (visual only) -->\r
        <svg class="canvas-grid-svg" xmlns="http://www.w3.org/2000/svg">\r
          <defs>\r
            <pattern id="smallGrid" [attr.width]="20*zoom" [attr.height]="20*zoom"\r
                     [attr.x]="panX % (20*zoom)" [attr.y]="panY % (20*zoom)"\r
                     patternUnits="userSpaceOnUse">\r
              <path [attr.d]="'M '+(20*zoom)+' 0 L 0 0 0 '+(20*zoom)"\r
                    fill="none" stroke="rgba(139,92,246,0.07)" stroke-width="0.5"/>\r
            </pattern>\r
            <pattern id="bigGrid" [attr.width]="100*zoom" [attr.height]="100*zoom"\r
                     [attr.x]="panX % (100*zoom)" [attr.y]="panY % (100*zoom)"\r
                     patternUnits="userSpaceOnUse">\r
              <rect [attr.width]="100*zoom" [attr.height]="100*zoom"\r
                    fill="url(#smallGrid)"/>\r
              <path [attr.d]="'M '+(100*zoom)+' 0 L 0 0 0 '+(100*zoom)"\r
                    fill="none" stroke="rgba(139,92,246,0.14)" stroke-width="1"/>\r
            </pattern>\r
          </defs>\r
          <rect width="100%" height="100%" fill="url(#bigGrid)" class="svg-bg"/>\r
        </svg>\r
\r
        <!-- World (zoom+pan transform) -->\r
        <div class="canvas-world" [style.transform]="transformStyle">\r
\r
          <!-- \u2500\u2500 START NODE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
          <div class="start-node"\r
               [class.start-node-selected]="startNodeSelected"\r
               [style.left.px]="graph.startNode.x - 34"\r
               [style.top.px]="graph.startNode.y - 34"\r
               (mousedown)="onStartNodeMouseDown($event)">\r
            <div class="start-node-ring"></div>\r
            <div class="start-node-core">\r
              <span class="start-node-label">START</span>\r
            </div>\r
            <!-- Flow-out port -->\r
            <div class="port-circle port-out port-flow start-port-out"\r
                 [class.port-hovered]="isPortHovered('start','flow-out-0')"\r
                 [class.rune-port-valid]="isPendingValidTarget('start','flow-out-0')"\r
                 [style.--port-color]="'#ffffff'"\r
                 data-node-id="start"\r
                 data-port-id="flow-out-0"\r
                 (mousedown)="onPortMouseDown($event, 'start', 'flow-out-0')">\r
            </div>\r
          </div>\r
\r
          <!-- \u2500\u2500 RUNE NODES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
          @for (node of graphNodesSig(); track trackById($index, node)) {\r
            @let rune = getNodeRune(node.id);\r
            @let isNeutral = node.runeId === NEUTRAL_RUNE_ID;\r
            @let isSummon  = node.runeId === SUMMON_RUNE_ID;\r
            <div class="rune-node"\r
                 [class.rune-node-drag]="draggingNodeId === node.id"\r
                 [class.rune-node-selected]="isNodeSelected(node.id)"\r
                 [style.left.px]="node.x"\r
                 [style.top.px]="node.y"\r
                 [style.--glow]="nodeGlowColor(node.id)"\r
                 (mousedown)="onNodeMouseDown($event, node.id)"\r
                 (click)="onNodeClick($event, node)">\r
\r
              <!-- Flow-in port (left edge, centered) -->\r
              <div class="rune-port rune-port-in rune-port-flow"\r
                   [class.rune-port-hovered]="isPortHovered(node.id, 'flow-in')"\r
                   [class.rune-port-valid]="isPendingValidTarget(node.id, 'flow-in')"\r
                   [style.--pc]="'#8b5cf6'"\r
                   [style.left.px]="-PORT_R"\r
                   [style.top.px]="NODE_IMG / 2 - PORT_R"\r
                   [attr.data-node-id]="node.id"\r
                   data-port-id="flow-in"\r
                   (mousedown)="onPortMouseDown($event, node.id, 'flow-in')">\r
              </div>\r
\r
              <!-- Flow-out port (right edge, centered) -->\r
              <div class="rune-port rune-port-out rune-port-flow"\r
                   [class.rune-port-hovered]="isPortHovered(node.id, 'flow-out')"\r
                   [class.rune-port-valid]="isPendingValidTarget(node.id, 'flow-out')"\r
                   [style.--pc]="'#8b5cf6'"\r
                   [style.left.px]="NODE_IMG - PORT_R"\r
                   [style.top.px]="NODE_IMG / 2 - PORT_R"\r
                   [attr.data-node-id]="node.id"\r
                   data-port-id="flow-out"\r
                   (mousedown)="onPortMouseDown($event, node.id, 'flow-out')">\r
              </div>\r
\r
              <!-- Rune image / placeholder -->\r
              @if (isNeutral) {\r
                <div class="neutral-node-wrap">\r
                  <div class="neutral-node-body"></div>\r
                </div>\r
              } @else if (isSummon) {\r
                <div class="summon-node-wrap">\r
                  <div class="summon-glyph">\r
                    @for (i of SUMMON_SQUARES; track i) {\r
                      <span class="summon-sq"></span>\r
                    }\r
                  </div>\r
                </div>\r
              } @else if (rune?.drawing) {\r
                <img class="rune-node-img" [src]="rune!.drawing | imageUrl" [alt]="rune!.name"/>\r
              } @else if (rune) {\r
                <div class="rune-node-placeholder">\r
                  <span>{{ rune.name.charAt(0).toUpperCase() }}</span>\r
                </div>\r
              } @else {\r
                <div class="rune-node-placeholder rune-node-unknown">\r
                  <span>???</span>\r
                </div>\r
              }\r
\r
              <!-- Name label (hidden for neutral) -->\r
              @if (isSummon) {\r
                <div class="rune-node-name rune-node-name-summon">{{ summonNodeLabel(node) }}</div>\r
              } @else if (!isNeutral) {\r
                <div class="rune-node-name">{{ rune?.name ?? node.runeId }}</div>\r
              }\r
\r
            </div>\r
          }\r
\r
        </div><!-- /canvas-world -->\r
\r
        <!-- Connection overlay -->\r
        <svg class="conn-overlay-svg" xmlns="http://www.w3.org/2000/svg">\r
          @for (c of graphConnectionsSig(); track trackById($index, c)) {\r
            @if (!isDirectConnection(c)) {\r
            <g class="conn-group"\r
               (click)="onConnGroupClick($event, c)"\r
               (dblclick)="onConnGroupDblClick($event, c)">\r
              <!-- Invisible wide-stroke hit area: right-click to pull waypoints, left-click to select -->\r
              <path class="conn-hit" [attr.d]="connectionPathScreen(c)"\r
                    (mousedown)="onConnHitMouseDown($event, c)"/>\r
              <path class="conn-path-glow"\r
                    [attr.d]="connectionPathScreen(c)"\r
                    [attr.stroke]="connectionColor(c)"\r
                    [class.conn-selected]="isConnectionSelected(c.id)"\r
                    [class.conn-passthrough]="c.passthroughEnabled"/>\r
              <path class="conn-path"\r
                    [attr.d]="connectionPathScreen(c)"\r
                    [attr.stroke]="connectionColor(c)"\r
                    [class.conn-selected]="isConnectionSelected(c.id)"\r
                    [class.conn-passthrough]="c.passthroughEnabled"/>\r
\r
              <!-- Waypoint handles \u2014 visible on hover or when connection/waypoint is selected -->\r
              @if (c.waypoints?.length) {\r
                @for (wp of c.waypoints; track $index; let wi = $index) {\r
                  <circle class="conn-waypoint"\r
                          [class.conn-waypoint-selected]="isConnectionSelected(c.id) || isWaypointSelected(c.id, wi)"\r
                          [attr.cx]="worldToCanvasLocal(wp.x, wp.y).x"\r
                          [attr.cy]="worldToCanvasLocal(wp.x, wp.y).y"\r
                          r="6"\r
                          (mousedown)="onWaypointMouseDown($event, c.id, wi)"/>\r
                }\r
              }\r
\r
              <!-- Selected-line white highlight drawn on top of colored path -->\r
              @if (isConnectionSelected(c.id)) {\r
                <path class="conn-path-selected" [attr.d]="connectionPathScreen(c)"/>\r
              }\r
\r
              <!-- Connection badges -->\r
              @let bp = getBadgePositions(c);\r
              @if (c.passthroughEnabled && bp.passthrough; as pp) {\r
                <g class="conn-badge" [attr.transform]="'translate('+pp.x+','+pp.y+') scale('+zoom+')'">\r
                  <circle r="14" class="conn-badge-bg conn-badge-passthrough"/>\r
                  <text class="conn-badge-icon">\u27F3</text>\r
                  @if (c.maxPassthrough) {\r
                    <text class="conn-badge-sub" dy="18">{{ c.maxPassthrough }}\xD7</text>\r
                  }\r
                </g>\r
              }\r
            </g>\r
            } <!-- /isDirectConnection guard -->\r
          }\r
          <!-- Snap grid dots \u2014 shown while pulling / dragging a waypoint -->\r
          @if ((pullingWaypointConnId || draggingWaypointConnId) && waypointSnapGrid.length) {\r
            @for (sg of waypointSnapGrid; track $index) {\r
              <circle class="conn-snap-dot"\r
                      [attr.cx]="worldToCanvasLocal(sg.x, sg.y).x"\r
                      [attr.cy]="worldToCanvasLocal(sg.x, sg.y).y"\r
                      r="4"/>\r
            }\r
          }\r
          <!-- Live pull-preview dot -->\r
          @if (pullingWaypointConnId && pullingWaypointPos) {\r
            <circle class="conn-waypoint-preview"\r
                    [attr.cx]="worldToCanvasLocal(pullingWaypointPos.x, pullingWaypointPos.y).x"\r
                    [attr.cy]="worldToCanvasLocal(pullingWaypointPos.x, pullingWaypointPos.y).y"\r
                    r="6"/>\r
          }\r
        </svg>\r
\r
        <!-- Node drag snap indicator lines (Y-horizontal + X-vertical) -->\r
        @if (nodeDragSnapLines.length) {\r
          <svg class="conn-overlay-svg snap-line-svg" xmlns="http://www.w3.org/2000/svg">\r
            @for (sl of nodeDragSnapLines; track $index) {\r
              @if (sl.axis === 'y') {\r
                <line class="node-snap-line"\r
                      x1="0" [attr.y1]="worldToCanvasLocal(0, sl.v).y"\r
                      x2="100%" [attr.y2]="worldToCanvasLocal(0, sl.v).y"/>\r
              } @else {\r
                <line class="node-snap-line"\r
                      [attr.x1]="worldToCanvasLocal(sl.v, 0).x" y1="0"\r
                      [attr.x2]="worldToCanvasLocal(sl.v, 0).x" y2="100%"/>\r
              }\r
            }\r
          </svg>\r
        }\r
\r
        <!-- Marquee selection overlay -->\r
        @if (marqueeActive && (marqueeRect.w > 4 || marqueeRect.h > 4)) {\r
          <div class="marquee-box"\r
               [style.left.px]="marqueeRect.x"\r
               [style.top.px]="marqueeRect.y"\r
               [style.width.px]="marqueeRect.w"\r
               [style.height.px]="marqueeRect.h">\r
          </div>\r
        }\r
\r
        <!-- Pending connection overlay -->\r
        @if (pending()) {\r
          <svg class="pending-overlay-svg" xmlns="http://www.w3.org/2000/svg">\r
            <path class="conn-path-pending"\r
                  [attr.d]="pendingPathScreen()"\r
                  [attr.stroke]="pendingColor()"/>\r
          </svg>\r
        }\r
\r
        <!-- Zoom controls -->\r
        <div class="zoom-controls">\r
          <button class="zoom-btn" (click)="zoomIn()"    title="Vergr\xF6\xDFern">+</button>\r
          <span   class="zoom-label">{{ (zoom * 100) | number:'1.0-0' }}%</span>\r
          <button class="zoom-btn" (click)="zoomOut()"   title="Verkleinern">\u2212</button>\r
          <button class="zoom-btn" (click)="zoomReset()" title="Zur\xFCcksetzen">\u2302</button>\r
        </div>\r
\r
        <!-- Hint bar -->\r
        <div class="canvas-hint">\r
          Leertaste = Rune hinzuf\xFCgen \xB7 Palette anklicken = Runen-Info \xB7 Mausrad = Zoom \xB7 Mittelmaus = Schwenken \xB7 Port ziehen = Verbinden \xB7 Linie ziehen = Wegpunkt \xB7 Entf = L\xF6schen \xB7 Strg+S = Speichern\r
        </div>\r
\r
      </div><!-- /canvas-wrap -->\r
\r
    </div><!-- /sne-main -->\r
\r
    <!-- \u2500\u2500 RIGHT PANEL: rune-inspector | conn-inspector \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    @if (inspectedRune) {\r
      <aside class="rune-inspector">\r
        <div class="ri-header">\r
          <span class="ri-title">Runen-Info</span>\r
          <button class="ri-close" (click)="inspectedRune = null; inspectedNodeId = null">\u2715</button>\r
        </div>\r
        <div class="ri-body">\r
          @if (inspectedRune.drawing) {\r
            <img class="ri-img" [src]="inspectedRune.drawing | imageUrl" [alt]="inspectedRune.name"/>\r
          }\r
          <h3 class="ri-name" [style.color]="inspectedRune.glowColor || '#a78bfa'">{{ inspectedRune.name }}</h3>\r
          @if (inspectedRune.tags.length) {\r
            <div class="ri-tags">\r
              @for (t of inspectedRune.tags; track t) {\r
                <span class="ri-tag">{{ t }}</span>\r
              }\r
            </div>\r
          }\r
          @if (inspectedRune.description) {\r
            <p class="ri-desc">{{ inspectedRune.description }}</p>\r
          }\r
          @if (inspectedRune.mana || inspectedRune.fokus || inspectedRune.effektivitaet) {\r
            <div class="ri-costs">\r
              @if (inspectedRune.mana)          { <div class="ri-cost"><span class="ri-cost-lbl">Mana</span><span class="ri-cost-val">{{ inspectedRune.mana }}</span></div> }\r
              @if (inspectedRune.fokus)         { <div class="ri-cost"><span class="ri-cost-lbl">Fokus</span><span class="ri-cost-val">{{ inspectedRune.fokus }}</span></div> }\r
              @if (inspectedRune.effektivitaet) { <div class="ri-cost"><span class="ri-cost-lbl">Effekt.</span><span class="ri-cost-val">{{ inspectedRune.effektivitaet }}</span></div> }\r
            </div>\r
          }\r
          <!-- \u2500\u2500 Conn-inspector \u2500\u2500 -->\r
        </div>\r
      </aside>\r
    } @else if (selectedConnectionId && getSelectedConnection()) {\r
      <aside class="conn-inspector">\r
        <div class="ci-header">\r
          <span class="ci-title">Verbindung</span>\r
          <button class="ci-close" (click)="selectedConnectionId = null">\u2715</button>\r
        </div>\r
        <div class="ci-body">\r
\r
          <!-- Durchl\xE4ufe / Passthrough -->\r
          <div class="ci-section-lbl">Durchl\xE4ufe</div>\r
          <div class="ci-passthrough-row">\r
            <button class="ci-toggle-btn ci-toggle-passthrough"\r
                    [class.ci-toggle-active]="getSelectedConnection()!.passthroughEnabled"\r
                    (click)="updateSelectedConnection({passthroughEnabled: !getSelectedConnection()!.passthroughEnabled})">\r
              \u27F3 Aktiv\r
            </button>\r
            <input class="ci-input ci-input-num" type="number" min="1" placeholder="\u221E"\r
                   [value]="getSelectedConnection()!.maxPassthrough ?? ''"\r
                   [disabled]="!getSelectedConnection()!.passthroughEnabled"\r
                   (change)="updateSelectedConnection({maxPassthrough: +$any($event.target).value || undefined})"/>\r
            <span class="ci-input-hint">Max</span>\r
          </div>\r
\r
        </div>\r
      </aside>\r
    }\r
\r
  </div><!-- /sne-layout -->\r
\r
  <!-- \u2500\u2500 CLOSE CONFIRMATION DIALOG \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
  @if (showCloseDialog) {\r
    <div class="close-dialog-backdrop" (click)="onCloseDialogCancel()"></div>\r
    <div class="close-dialog-box">\r
      <div class="close-dialog-title">Ungespeicherte \xC4nderungen</div>\r
      <div class="close-dialog-body">M\xF6chtest du die \xC4nderungen an diesem Zauber speichern?</div>\r
      <div class="close-dialog-actions">\r
        <button class="close-dialog-btn close-dialog-save" (click)="onCloseConfirmSave()">Speichern</button>\r
        <button class="close-dialog-btn close-dialog-discard" (click)="onCloseConfirmDiscard()">Nicht speichern</button>\r
        <button class="close-dialog-btn close-dialog-cancel" (click)="onCloseDialogCancel()">Abbrechen</button>\r
      </div>\r
    </div>\r
  }\r
\r
  <!-- \u2500\u2500 SUMMONING-RUNE CONFIG (shown when a single summon node is selected) \u2500\u2500 -->\r
  @if (selectedSummonNode; as sn) {\r
    <div class="summon-config" (mousedown)="$event.stopPropagation()">\r
      <div class="summon-config-head"><img class="summon-config-ico" src="/icons/soul.svg" alt=""> Beschw\xF6rung</div>\r
      <label class="summon-field">\r
        <span>Begleiter</span>\r
        <select [ngModel]="sn.summon?.companionId ?? ''" (ngModelChange)="assignSummonCompanion(sn, $event)">\r
          <option value="">\u2014 Begleiter w\xE4hlen \u2014</option>\r
          @for (c of availableCompanions; track c.id) {\r
            <option [value]="c.id">{{ c.name }}</option>\r
          }\r
        </select>\r
      </label>\r
      @if (!availableCompanions.length) {\r
        <p class="summon-hint">Keine Begleiter vorhanden. Lege sie im Begleiter-Tab des Charakterbogens an.</p>\r
      } @else {\r
        <p class="summon-hint">Begleiter werden im Begleiter-Tab erstellt und bearbeitet.</p>\r
      }\r
      @if (summonCompanion(sn); as comp) {\r
        <span class="summon-ok">{{ comp.name }} (Lv {{ comp.statblock.soul?.level ?? comp.statblock.level }})</span>\r
      } @else if (sn.summon?.companionId) {\r
        <span class="summon-hint">\u201E{{ sn.summon?.companionName }}" existiert nicht mehr.</span>\r
      }\r
    </div>\r
  }\r
\r
  <!-- \u2500\u2500 QUICK SEARCH POPUP (drop connection into void) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
  @if (qsOpen) {\r
    <div class="qs-backdrop" (mousedown)="closeQuickSearch()"></div>\r
    <div class="qs-popup" [style.left.px]="qsX" [style.top.px]="qsY"\r
         (mousedown)="$event.stopPropagation()">\r
      <div class="qs-header">{{ qsPending ? 'Rune platzieren &amp; verbinden' : 'Rune hinzuf\xFCgen' }}</div>\r
      <input class="qs-input" type="text"\r
             [(ngModel)]="qsQuery"\r
             placeholder="Runenname eingeben\u2026"\r
             (keydown.escape)="closeQuickSearch()"\r
             autocomplete="off"/>\r
      <div class="qs-list">\r
        @for (r of qsResults; track r.name) {\r
          <button class="qs-item" (click)="selectQsRune(r)"\r
                  [class.qs-item-incompatible]="!isRuneCompatibleWithPending(r)">\r
            <span class="qs-item-glyph"\r
                  [style.background]="'radial-gradient(circle at 40% 35%, ' + (r.glowColor || '#8b5cf6') + '44 0%, transparent 70%)'">\r
              @if (r.drawing) {\r
                <img [src]="r.drawing | imageUrl" class="qs-item-img" [alt]="r.name"/>\r
              } @else {\r
                <span class="qs-item-icon">\u2726</span>\r
              }\r
            </span>\r
            <span class="qs-item-name">{{ r.name }}</span>\r
          </button>\r
        }\r
        @if (qsResults.length === 0) {\r
          <div class="qs-empty">Keine Rune gefunden</div>\r
        }\r
      </div>\r
    </div>\r
  }\r
\r
</div><!-- /sne-overlay -->\r
`, styles: ['/* src/app/shared/spell-node-editor/spell-node-editor.component.css */\n.sne-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1700;\n  background: #050811;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  font-family: inherit;\n}\n.sne-layout {\n  display: flex;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n.rune-palette {\n  width: 240px;\n  flex-shrink: 0;\n  background: rgba(10, 12, 26, 0.98);\n  border-right: 1px solid rgba(139, 92, 246, 0.2);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.palette-header {\n  padding: 14px 16px 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.palette-title {\n  font-size: 0.68rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.12em;\n  color: #a78bfa;\n}\n.palette-search-wrap {\n  padding: 8px 10px;\n  flex-shrink: 0;\n}\n.palette-search {\n  width: 100%;\n  padding: 6px 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 8px;\n  color: #e2e8f0;\n  font-size: 0.82rem;\n  outline: none;\n  box-sizing: border-box;\n  transition: border-color 0.2s;\n}\n.palette-search:focus {\n  border-color: #8b5cf6;\n}\n.palette-search::placeholder {\n  color: rgba(148, 163, 184, 0.5);\n}\n.palette-list {\n  flex: 1;\n  overflow-y: auto;\n  padding: 4px 6px 12px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.palette-rune {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 10px;\n  border-radius: 10px;\n  cursor: grab;\n  margin-bottom: 4px;\n  border: 1px solid transparent;\n  background: rgba(255, 255, 255, 0.03);\n  transition:\n    background 0.15s,\n    border-color 0.15s,\n    transform 0.15s,\n    box-shadow 0.15s;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.palette-rune:hover {\n  background: rgba(139, 92, 246, 0.12);\n  border-color: rgba(139, 92, 246, 0.35);\n  transform: translateX(2px);\n  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);\n}\n.palette-rune:active {\n  cursor: grabbing;\n  transform: scale(0.97);\n}\n.palette-rune-glyph {\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  background: rgba(139, 92, 246, 0.1);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  overflow: hidden;\n  box-shadow: 0 0 8px color-mix(in srgb, var(--glow, #8b5cf6) 30%, transparent);\n}\n.palette-rune-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  border-radius: 7px;\n}\n.palette-rune-icon {\n  color: var(--glow, #8b5cf6);\n  font-size: 1.1rem;\n  filter: drop-shadow(0 0 6px var(--glow, #8b5cf6));\n}\n.palette-rune-info {\n  min-width: 0;\n  flex: 1;\n}\n.palette-rune-name {\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: #e2e8f0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.palette-rune-tags {\n  font-size: 0.68rem;\n  color: #6b7280;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-top: 2px;\n}\n.palette-empty {\n  text-align: center;\n  color: #4b5563;\n  font-size: 0.8rem;\n  padding: 24px 0;\n}\n.sne-main {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  min-width: 0;\n}\n.sne-topbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 16px;\n  background: rgba(8, 10, 22, 0.95);\n  border-bottom: 1px solid rgba(139, 92, 246, 0.18);\n  flex-shrink: 0;\n  gap: 12px;\n  min-height: 50px;\n  box-sizing: border-box;\n}\n.sne-topbar-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n  flex: 1;\n}\n.sne-spell-title {\n  font-size: 0.92rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 180px;\n  flex-shrink: 0;\n}\n.sne-tabs {\n  display: flex;\n  gap: 3px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(139, 92, 246, 0.15);\n  border-radius: 8px;\n  padding: 3px;\n}\n.sne-tab-btn {\n  padding: 4px 14px;\n  border-radius: 6px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  background: transparent;\n  border: none;\n  color: #6b7280;\n  transition: background 0.15s, color 0.15s;\n}\n.sne-tab-btn:hover {\n  color: #a78bfa;\n}\n.sne-tab-active {\n  background: rgba(139, 92, 246, 0.25) !important;\n  color: #c4b5fd !important;\n  box-shadow: 0 1px 6px rgba(139, 92, 246, 0.2);\n}\n.sne-topbar-right {\n  display: flex;\n  gap: 8px;\n  flex-shrink: 0;\n  align-items: center;\n}\n.tb-btn {\n  padding: 6px 16px;\n  border-radius: 8px;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid transparent;\n  background: transparent;\n  transition: all 0.18s;\n}\n.tb-close {\n  border-color: rgba(255, 255, 255, 0.15);\n  color: #9ca3af;\n}\n.tb-close:hover {\n  border-color: rgba(239, 68, 68, 0.6);\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.08);\n}\n.tb-delete {\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #ef4444;\n}\n.tb-delete:hover {\n  border-color: #ef4444;\n  background: rgba(239, 68, 68, 0.12);\n}\n.tb-save {\n  min-width: 210px;\n  background:\n    linear-gradient(\n      135deg,\n      #3b2672,\n      #4c2d8a);\n  color: rgba(255, 255, 255, 0.55);\n  box-shadow: none;\n}\n.tb-save:hover {\n  box-shadow: 0 0 14px rgba(139, 92, 246, 0.4);\n  transform: translateY(-1px);\n  color: rgba(255, 255, 255, 0.8);\n}\n.tb-save:active {\n  transform: translateY(0);\n}\n.tb-save-dirty {\n  background:\n    linear-gradient(\n      135deg,\n      #7c3aed,\n      #8b5cf6) !important;\n  color: #fff !important;\n  box-shadow: 0 0 16px rgba(139, 92, 246, 0.5) !important;\n  animation: save-btn-pulse 1.8s ease-in-out infinite alternate;\n}\n.tb-save-dirty:hover {\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.75) !important;\n}\n@keyframes save-btn-pulse {\n  from {\n    box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);\n  }\n  to {\n    box-shadow: 0 0 24px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.35);\n  }\n}\n.tb-save-done {\n  background:\n    linear-gradient(\n      135deg,\n      #065f46,\n      #059669) !important;\n  box-shadow: 0 0 18px rgba(5, 150, 105, 0.55) !important;\n  color: #fff !important;\n  cursor: default;\n}\n.tb-settings {\n  padding: 6px 12px;\n  border-radius: 8px;\n  font-size: 1rem;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  color: #9ca3af;\n  cursor: pointer;\n  background: transparent;\n  transition: all 0.18s;\n}\n.tb-settings:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #a78bfa;\n  background: rgba(139, 92, 246, 0.08);\n}\n.tb-settings-active {\n  background: rgba(139, 92, 246, 0.18) !important;\n  color: #c4b5fd !important;\n  border-color: rgba(139, 92, 246, 0.5) !important;\n}\n.properties-panel {\n  width: 340px;\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: rgba(8, 10, 22, 0.97);\n  border-left: 1px solid rgba(139, 92, 246, 0.2);\n}\n.pp-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.pp-title {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #a78bfa;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n.pp-close {\n  background: none;\n  border: none;\n  color: #6b7280;\n  font-size: 0.9rem;\n  cursor: pointer;\n  padding: 2px 6px;\n  border-radius: 4px;\n  transition: color 0.15s;\n}\n.pp-close:hover {\n  color: #fca5a5;\n}\n.pp-scroll {\n  flex: 1;\n  overflow-y: auto;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.pp-scroll .ep-section {\n  padding: 0 14px;\n  margin-bottom: 0;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  padding-top: 12px;\n  padding-bottom: 12px;\n}\n.eigenschaften-view {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  background: rgba(5, 7, 18, 0.98);\n}\n.ep-scroll {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px 24px;\n  max-width: 700px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.ep-section {\n  margin-bottom: 24px;\n}\n.ep-label {\n  font-size: 0.68rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: #7c3aed;\n  margin-bottom: 8px;\n  display: block;\n}\n.ep-input,\n.ep-textarea {\n  width: 100%;\n  padding: 8px 12px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 8px;\n  color: #e2e8f0;\n  font-size: 0.9rem;\n  outline: none;\n  box-sizing: border-box;\n  transition: border-color 0.18s;\n}\n.ep-textarea {\n  resize: vertical;\n  font-family: inherit;\n  min-height: 90px;\n}\n.ep-input:focus,\n.ep-textarea:focus {\n  border-color: #8b5cf6;\n}\n.ep-tag-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.ep-tag-btn {\n  padding: 4px 11px;\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #6b7280;\n  font-size: 0.78rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.ep-tag-btn:hover {\n  color: #e2e8f0;\n  border-color: rgba(139, 92, 246, 0.3);\n}\n.ep-tag-active {\n  background: rgba(139, 92, 246, 0.2) !important;\n  border-color: rgba(139, 92, 246, 0.6) !important;\n  color: #c4b5fd !important;\n}\n.ep-cost-row {\n  display: flex;\n  gap: 12px;\n  align-items: flex-end;\n  flex-wrap: wrap;\n}\n.ep-cost-field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.ep-cost-label {\n  font-size: 0.75rem;\n  color: #6b7280;\n}\n.ep-cost-input {\n  width: 100px;\n  padding: 7px 10px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  color: #e2e8f0;\n  font-size: 0.9rem;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.ep-cost-input:focus {\n  border-color: rgba(139, 92, 246, 0.5);\n}\n.ep-calc-btn {\n  padding: 7px 16px;\n  border-radius: 8px;\n  background:\n    linear-gradient(\n      135deg,\n      rgba(59, 130, 246, 0.12),\n      rgba(139, 92, 246, 0.12));\n  border: 1px solid rgba(59, 130, 246, 0.35);\n  color: #93c5fd;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.18s;\n  align-self: flex-end;\n}\n.ep-calc-btn:hover {\n  background: rgba(59, 130, 246, 0.2);\n  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);\n}\n.ep-stat-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-top: 4px;\n}\n.ep-stat-chip {\n  padding: 3px 10px;\n  border-radius: 5px;\n  background: rgba(245, 158, 11, 0.12);\n  border: 1px solid rgba(245, 158, 11, 0.3);\n  color: #fcd34d;\n  font-size: 0.78rem;\n  font-weight: 700;\n}\n.ep-empty-stat {\n  font-size: 0.78rem;\n  color: #4b5563;\n  font-style: italic;\n}\n.canvas-wrap {\n  position: relative;\n  flex: 1;\n  overflow: hidden;\n  cursor: default;\n  background: #060917;\n}\n.canvas-grid-svg {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n}\n.svg-bg {\n  pointer-events: all;\n  cursor: default;\n}\n.canvas-world {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 0;\n  height: 0;\n  transform-origin: 0 0;\n  will-change: transform;\n  z-index: 6;\n}\n.conn-svg {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 0;\n  height: 0;\n  overflow: visible;\n  pointer-events: none;\n}\n.conn-svg .conn-group {\n  pointer-events: all;\n  cursor: pointer;\n}\n.conn-path-glow {\n  fill: none;\n  stroke-width: 8;\n  opacity: 0.18;\n  stroke-linecap: round;\n  transition: opacity 0.15s;\n}\n.conn-path {\n  fill: none;\n  stroke-width: 2;\n  stroke-linecap: round;\n  opacity: 0.85;\n  transition: stroke-width 0.15s, opacity 0.15s;\n}\n.conn-group:has(.conn-hit:hover) .conn-path {\n  stroke-width: 3;\n  opacity: 1;\n}\n.conn-group:has(.conn-hit:hover) .conn-path-glow {\n  opacity: 0.32;\n}\n.conn-path.conn-selected {\n  stroke: #22c55e;\n  stroke-width: 4;\n  opacity: 1;\n}\n.conn-path-glow.conn-selected {\n  stroke: #22c55e;\n  stroke-width: 10;\n  animation: conn-sel-glow 1.4s ease-in-out infinite alternate;\n}\n@keyframes conn-sel-glow {\n  from {\n    opacity: 0.30;\n  }\n  to {\n    opacity: 0.70;\n  }\n}\n.conn-path-selected {\n  fill: none;\n  stroke: rgba(255, 255, 255, 0.65);\n  stroke-width: 1;\n  stroke-linecap: round;\n  pointer-events: none;\n  opacity: 1;\n}\n.conn-path.conn-cond-known {\n  stroke: #a78bfa;\n}\n.conn-path-glow.conn-cond-known {\n  stroke: #a78bfa;\n}\n.conn-path.conn-cond-unknown {\n  stroke: #fb923c;\n}\n.conn-path-glow.conn-cond-unknown {\n  stroke: #fb923c;\n}\n.conn-path.conn-passthrough {\n  stroke-dasharray: 10 5;\n}\n.conn-path-glow.conn-passthrough {\n  stroke-dasharray: 10 5;\n}\n.conn-path.conn-condition {\n  stroke-dasharray: 4 4;\n  opacity: 0.9;\n}\n.conn-path-glow.conn-condition {\n  stroke-dasharray: 4 4;\n}\n.conn-path.conn-delay {\n  stroke-dasharray: 2 6;\n}\n.conn-path-glow.conn-delay {\n  stroke-dasharray: 2 6;\n}\n.conn-path-pending {\n  fill: none;\n  stroke-width: 2.5;\n  stroke-linecap: round;\n  opacity: 0.75;\n  stroke-dasharray: 6 4;\n  pointer-events: none;\n}\n.conn-overlay-svg {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  overflow: visible;\n  z-index: 4;\n}\n.conn-overlay-svg .conn-group {\n  pointer-events: none;\n}\n.conn-hit {\n  fill: none;\n  stroke: rgba(0, 0, 0, 0.01);\n  stroke-width: 32;\n  pointer-events: stroke;\n  cursor: default;\n}\n:host(.wp-dragging) {\n  cursor: grabbing !important;\n}\n:host(.wp-dragging) .conn-hit {\n  cursor: grabbing;\n}\n.pending-overlay-svg {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  overflow: visible;\n  z-index: 10;\n}\n.loop-badge-bg {\n  fill: rgba(15, 23, 42, 0.92);\n  stroke: rgba(255, 255, 255, 0.3);\n  stroke-width: 1.5;\n  cursor: pointer;\n  pointer-events: all;\n}\n.loop-badge-count {\n  fill: #f8fafc;\n  font-size: 11px;\n  font-weight: 700;\n  font-family: monospace;\n  cursor: pointer;\n  pointer-events: all;\n}\n.conn-delete-btn {\n  fill: rgba(239, 68, 68, 0.85);\n  cursor: pointer;\n  pointer-events: all;\n  transition: fill 0.15s;\n}\n.conn-delete-btn:hover {\n  fill: #ef4444;\n}\n.conn-delete-x {\n  fill: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n  pointer-events: all;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.start-node {\n  position: absolute;\n  width: 68px;\n  height: 68px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: grab;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.start-node:active {\n  cursor: grabbing;\n}\n.start-node-ring {\n  position: absolute;\n  inset: -6px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.35);\n  animation: start-ring-pulse 2.4s ease-in-out infinite;\n  pointer-events: none;\n}\n@keyframes start-ring-pulse {\n  0%, 100% {\n    opacity: 0.5;\n    transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    transform: scale(1.05);\n  }\n}\n.start-node-core {\n  width: 68px;\n  height: 68px;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle at 38% 35%,\n      rgba(255, 255, 255, 0.25) 0%,\n      rgba(200, 200, 255, 0.08) 55%,\n      transparent 80%);\n  border: 2px solid rgba(255, 255, 255, 0.6);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  box-shadow:\n    0 0 20px rgba(255, 255, 255, 0.25),\n    0 0 40px rgba(180, 160, 255, 0.18),\n    inset 0 0 16px rgba(255, 255, 255, 0.07);\n  animation: start-glow-breathe 3s ease-in-out infinite;\n}\n@keyframes start-glow-breathe {\n  0%, 100% {\n    box-shadow:\n      0 0 20px rgba(255, 255, 255, 0.25),\n      0 0 40px rgba(180, 160, 255, 0.18),\n      inset 0 0 16px rgba(255, 255, 255, 0.07);\n  }\n  50% {\n    box-shadow:\n      0 0 34px rgba(255, 255, 255, 0.45),\n      0 0 60px rgba(180, 160, 255, 0.32),\n      inset 0 0 24px rgba(255, 255, 255, 0.12);\n  }\n}\n.start-node-label {\n  font-size: 0.58rem;\n  font-weight: 800;\n  letter-spacing: 0.15em;\n  color: rgba(255, 255, 255, 0.85);\n  text-shadow: 0 0 8px #fff;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.start-node.start-node-selected .start-node-core {\n  border-color: #fff;\n  box-shadow:\n    0 0 26px rgba(255, 255, 255, 0.6),\n    0 0 55px rgba(180, 160, 255, 0.45),\n    inset 0 0 22px rgba(255, 255, 255, 0.14);\n  animation: none;\n}\n.start-node.start-node-selected .start-node-ring {\n  border-color: rgba(255, 255, 255, 0.85);\n  opacity: 1;\n}\n.start-port-out {\n  position: absolute;\n  right: -7px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.rune-node {\n  position: absolute;\n  cursor: grab;\n  -webkit-user-select: none;\n  user-select: none;\n  overflow: visible;\n  width: 110px;\n  will-change: transform;\n}\n.rune-node:active,\n.rune-node.rune-node-drag {\n  cursor: grabbing;\n}\n.rune-node.rune-node-drag {\n  opacity: 0.88;\n}\n@keyframes rune-node-float {\n  0%, 100% {\n    transform: translateY(0px);\n  }\n  50% {\n    transform: translateY(-6px);\n  }\n}\n.rune-node-img {\n  display: block;\n  width: 110px;\n  height: 110px;\n  border-radius: 50%;\n  object-fit: cover;\n  border: none;\n  filter: drop-shadow(0 0 28px color-mix(in srgb, var(--glow, #8b5cf6) 80%, transparent)) drop-shadow(0 0 10px color-mix(in srgb, var(--glow, #8b5cf6) 50%, transparent)) drop-shadow(0 2px 14px rgba(0, 0, 0, 0.65));\n  transition: filter 0.25s, transform 0.35s cubic-bezier(.34, 1.56, .64, 1);\n  pointer-events: none;\n  animation: rune-node-float 2.8s ease-in-out infinite;\n}\n.rune-node.rune-node-drag .rune-node-img {\n  animation: none;\n}\n.rune-node:hover .rune-node-img {\n  filter: drop-shadow(0 0 52px color-mix(in srgb, var(--glow, #8b5cf6) 100%, transparent)) drop-shadow(0 0 24px color-mix(in srgb, var(--glow, #8b5cf6) 70%, transparent)) drop-shadow(0 0 10px color-mix(in srgb, var(--glow, #8b5cf6) 40%, transparent)) drop-shadow(0 4px 22px rgba(0, 0, 0, 0.85));\n  animation: rune-hover-spin 3.2s ease-in-out infinite;\n}\n.rune-node.rune-node-drag .rune-node-img {\n  filter: drop-shadow(0 0 52px color-mix(in srgb, var(--glow, #8b5cf6) 100%, transparent)) drop-shadow(0 0 24px color-mix(in srgb, var(--glow, #8b5cf6) 70%, transparent)) drop-shadow(0 4px 22px rgba(0, 0, 0, 0.85));\n}\n@keyframes rune-hover-spin {\n  0% {\n    transform: scale(1.02) rotate(-4deg);\n  }\n  25% {\n    transform: scale(1.04) rotate(4deg);\n  }\n  50% {\n    transform: scale(1.02) rotate(-3deg);\n  }\n  75% {\n    transform: scale(1.04) rotate(3deg);\n  }\n  100% {\n    transform: scale(1.02) rotate(-4deg);\n  }\n}\n.rune-node-placeholder {\n  width: 110px;\n  height: 110px;\n  border-radius: 50%;\n  background: transparent;\n  box-shadow:\n    0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 55%, transparent),\n    0 0 28px color-mix(in srgb, var(--glow, #8b5cf6) 40%, transparent),\n    0 0 8px color-mix(in srgb, var(--glow, #8b5cf6) 20%, transparent);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: box-shadow 0.22s;\n}\n.rune-node:hover .rune-node-placeholder {\n  box-shadow:\n    0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 80%, white),\n    0 0 40px color-mix(in srgb, var(--glow, #8b5cf6) 65%, transparent),\n    0 0 14px color-mix(in srgb, var(--glow, #8b5cf6) 35%, transparent);\n}\n.rune-node-placeholder > span {\n  font-size: 2.6rem;\n  font-weight: 800;\n  color: var(--glow, #8b5cf6);\n  filter: drop-shadow(0 0 12px var(--glow, #8b5cf6));\n  -webkit-user-select: none;\n  user-select: none;\n}\n.rune-node-unknown {\n  border-color: #6b7280 !important;\n}\n.rune-node-unknown > span {\n  font-size: 1.4rem;\n  color: #6b7280;\n  filter: none;\n}\n.rune-node-name {\n  text-align: center;\n  font-size: 0.72rem;\n  font-weight: 600;\n  color: #c4b5fd;\n  margin-top: 5px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 110px;\n  text-shadow: 0 0 8px color-mix(in srgb, var(--glow, #8b5cf6) 35%, transparent);\n  pointer-events: none;\n  animation: rune-node-float 2.8s ease-in-out infinite;\n}\n.rune-node.rune-node-drag .rune-node-name {\n  animation: none;\n}\n.rune-node.rune-node-selected .rune-node-img {\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 80%, white);\n  animation: rune-img-selected-pulse 1.1s ease-in-out infinite alternate;\n}\n@keyframes rune-img-selected-pulse {\n  from {\n    filter: drop-shadow(0 0 30px color-mix(in srgb, var(--glow, #8b5cf6) 90%, transparent)) drop-shadow(0 0 55px color-mix(in srgb, var(--glow, #8b5cf6) 55%, transparent)) brightness(1.05);\n    opacity: 0.9;\n  }\n  to {\n    filter: drop-shadow(0 0 48px color-mix(in srgb, var(--glow, #8b5cf6) 100%, transparent)) drop-shadow(0 0 80px color-mix(in srgb, var(--glow, #8b5cf6) 70%, transparent)) brightness(1.3);\n    opacity: 1;\n  }\n}\n.rune-node.rune-node-selected .rune-node-placeholder {\n  box-shadow:\n    0 0 0 2px color-mix(in srgb, var(--glow, #8b5cf6) 90%, white),\n    0 0 45px color-mix(in srgb, var(--glow, #8b5cf6) 90%, transparent),\n    0 0 90px color-mix(in srgb, var(--glow, #8b5cf6) 55%, transparent);\n  animation: rune-selected-pulse 1.1s ease-in-out infinite alternate;\n}\n@keyframes rune-selected-pulse {\n  from {\n    filter: brightness(1);\n    opacity: 0.88;\n  }\n  to {\n    filter: brightness(1.25);\n    opacity: 1;\n  }\n}\n.rune-port {\n  position: absolute;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background: transparent;\n  border: none;\n  cursor: crosshair;\n  z-index: 15;\n}\n.rune-port::before {\n  content: "";\n  position: absolute;\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  border: 1.5px solid var(--pc, #ffffff);\n  background: #07090f;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: 0 0 5px color-mix(in srgb, var(--pc, #ffffff) 45%, transparent);\n  transition:\n    transform 0.12s,\n    background 0.12s,\n    box-shadow 0.12s;\n  pointer-events: none;\n}\n.rune-port:hover::before,\n.rune-port.rune-port-hovered::before {\n  transform: translate(-50%, -50%) scale(1.7);\n  background: var(--pc, #ffffff);\n  box-shadow: 0 0 14px var(--pc, #ffffff), 0 0 5px rgba(255, 255, 255, 0.5);\n}\n.rune-port.rune-port-valid::before {\n  background: color-mix(in srgb, var(--pc, #ffffff) 18%, #07090f);\n  box-shadow: 0 0 10px var(--pc, #ffffff), 0 0 20px color-mix(in srgb, var(--pc, #ffffff) 45%, transparent);\n  transform: translate(-50%, -50%) scale(1.3);\n  animation: port-valid-pulse 0.9s ease-in-out infinite alternate;\n  transition: none;\n}\n.rune-port.rune-port-valid.rune-port-hovered::before {\n  transform: translate(-50%, -50%) scale(1.6) !important;\n  background: var(--pc, #ffffff) !important;\n  box-shadow: 0 0 22px var(--pc, #ffffff), 0 0 44px color-mix(in srgb, var(--pc, #ffffff) 65%, transparent) !important;\n}\n@keyframes port-valid-pulse {\n  from {\n    box-shadow: 0 0 8px var(--pc, #ffffff), 0 0 16px color-mix(in srgb, var(--pc, #ffffff) 35%, transparent);\n  }\n  to {\n    box-shadow: 0 0 16px var(--pc, #ffffff), 0 0 32px color-mix(in srgb, var(--pc, #ffffff) 60%, transparent);\n  }\n}\n.rune-port-tip {\n  position: absolute;\n  font-size: 0.63rem;\n  font-weight: 600;\n  color: #e2e8f0;\n  white-space: nowrap;\n  pointer-events: none;\n  background: rgba(6, 8, 20, 0.94);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 5px;\n  padding: 2px 6px;\n  opacity: 0;\n  transition: opacity 0.15s;\n  z-index: 30;\n  top: 50%;\n  transform: translateY(-50%);\n  line-height: 1.4;\n}\n.rune-port:hover .rune-port-tip,\n.rune-port.rune-port-hovered .rune-port-tip {\n  opacity: 1;\n}\n.rune-port-tip-in {\n  left: 14px;\n}\n.rune-port-tip-out {\n  right: 14px;\n}\n.port-circle {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  border: 2px solid var(--port-color, #8b5cf6);\n  background: rgba(9, 11, 24, 0.95);\n  cursor: crosshair;\n  flex-shrink: 0;\n  transition:\n    transform 0.12s,\n    box-shadow 0.12s,\n    background 0.12s;\n  box-shadow: 0 0 6px color-mix(in srgb, var(--port-color, #8b5cf6) 50%, transparent);\n}\n.port-circle.port-flow {\n  border-color: #ffffff;\n  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);\n}\n.port-circle:hover,\n.port-circle.port-hovered {\n  transform: scale(1.4);\n  background: var(--port-color, #8b5cf6);\n  box-shadow: 0 0 14px var(--port-color, #8b5cf6);\n}\n.port-circle.port-flow:hover,\n.port-circle.port-flow.port-hovered {\n  background: #ffffff;\n  box-shadow: 0 0 14px rgba(255, 255, 255, 0.8);\n}\n.zoom-controls {\n  position: absolute;\n  right: 16px;\n  bottom: 36px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: rgba(9, 11, 24, 0.88);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 10px;\n  padding: 4px 8px;\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n}\n.zoom-btn {\n  width: 26px;\n  height: 26px;\n  border-radius: 6px;\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #9ca3af;\n  font-size: 1rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  transition: all 0.15s;\n}\n.zoom-btn:hover {\n  border-color: #8b5cf6;\n  color: #e2e8f0;\n  background: rgba(139, 92, 246, 0.15);\n}\n.zoom-label {\n  font-size: 0.72rem;\n  color: #6b7280;\n  min-width: 36px;\n  text-align: center;\n}\n.canvas-hint {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 4px 12px;\n  font-size: 0.65rem;\n  color: rgba(107, 114, 128, 0.7);\n  background: rgba(5, 8, 17, 0.7);\n  -webkit-user-select: none;\n  user-select: none;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  border-top: 1px solid rgba(255, 255, 255, 0.04);\n}\n.rune-port-multi {\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  -webkit-mask:\n    radial-gradient(\n      circle at 50% 50%,\n      transparent 0%,\n      transparent 56%,\n      rgba(0, 0, 0, 0.5) 59%,\n      black 62%,\n      black 100%);\n  mask:\n    radial-gradient(\n      circle at 50% 50%,\n      transparent 0%,\n      transparent 56%,\n      rgba(0, 0, 0, 0.5) 59%,\n      black 62%,\n      black 100%);\n  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));\n  animation: multiport-spin 5s linear infinite;\n}\n.rune-port-multi::before {\n  display: none !important;\n}\n@keyframes multiport-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n.rune-port-multi:hover,\n.rune-port-multi.rune-port-hovered {\n  filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.75));\n  animation: multiport-spin-hover 5s linear infinite;\n}\n@keyframes multiport-spin-hover {\n  from {\n    transform: scale(1.55) rotate(0deg);\n  }\n  to {\n    transform: scale(1.55) rotate(360deg);\n  }\n}\n.rune-port-multi.rune-port-valid {\n  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.6));\n  animation: multiport-spin-valid 5s linear infinite, multiport-valid-glow 0.85s ease-in-out infinite alternate;\n}\n.rune-port-multi.rune-port-valid.rune-port-hovered {\n  animation: multiport-spin-hover 5s linear infinite, multiport-valid-glow 0.85s ease-in-out infinite alternate;\n}\n@keyframes multiport-spin-valid {\n  from {\n    transform: scale(1.35) rotate(0deg);\n  }\n  to {\n    transform: scale(1.35) rotate(360deg);\n  }\n}\n@keyframes multiport-valid-glow {\n  from {\n    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.55));\n  }\n  to {\n    filter: drop-shadow(0 0 14px rgba(255, 255, 255, 1.0));\n  }\n}\n.rune-port-multi.rune-port-occupied {\n  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.45));\n}\n.conn-path.conn-gradient {\n  stroke-dasharray: 10 6;\n  opacity: 0.92;\n  animation: gradient-flow 0.9s linear infinite;\n}\n.conn-path-glow.conn-gradient {\n  stroke-width: 7;\n  opacity: 0.28;\n  stroke-dasharray: none;\n  animation: gradient-glow-pulse 1.5s ease-in-out infinite alternate;\n}\n@keyframes gradient-flow {\n  from {\n    stroke-dashoffset: 16;\n  }\n  to {\n    stroke-dashoffset: 0;\n  }\n}\n@keyframes gradient-glow-pulse {\n  from {\n    opacity: 0.18;\n    stroke-width: 6;\n  }\n  to {\n    opacity: 0.42;\n    stroke-width: 10;\n  }\n}\n.sne-mode-toggle {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 0 6px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  background: rgba(255, 255, 255, 0.03);\n}\n.sne-mode-label {\n  font-size: 0.68rem;\n  color: rgba(156, 163, 175, 0.7);\n  white-space: nowrap;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.sne-mode-btn {\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: rgba(107, 114, 128, 0.8);\n  font-size: 0.72rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition: all 0.12s;\n}\n.sne-mode-btn:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.sne-mode-btn.sne-mode-active {\n  background: #8b5cf6;\n  border-color: #8b5cf6;\n  color: #fff;\n}\n.ri-section-lbl-mode {\n  margin-top: 10px;\n}\n.ri-mode-row {\n  display: flex;\n  gap: 6px;\n  margin: 5px 0 4px;\n}\n.ri-mode-btn {\n  flex: 1;\n  padding: 5px 0;\n  border-radius: 6px;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  background: rgba(255, 255, 255, 0.04);\n  color: rgba(156, 163, 175, 0.7);\n  font-size: 0.78rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    background 0.12s,\n    color 0.12s;\n}\n.ri-mode-btn:hover:not([disabled]) {\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.ri-mode-btn.ri-mode-active {\n  background: rgba(139, 92, 246, 0.3);\n  border-color: #8b5cf6;\n  color: #e9d5ff;\n}\n.ri-mode-btn.ri-mode-blocked {\n  color: rgba(245, 158, 11, 0.7);\n  border-color: rgba(245, 158, 11, 0.25);\n  cursor: not-allowed;\n}\n.ri-mode-btn[disabled] {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n.ri-mode-hint {\n  font-size: 0.68rem;\n  color: rgba(245, 158, 11, 0.8);\n  margin: 2px 0 6px;\n  line-height: 1.35;\n}\n::-webkit-scrollbar {\n  width: 5px;\n}\n::-webkit-scrollbar-track {\n  background: transparent;\n}\n::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n::-webkit-scrollbar-thumb:hover {\n  background: rgba(139, 92, 246, 0.55);\n}\n.neutral-node-wrap {\n  width: 110px;\n  height: 110px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.neutral-node-body {\n  width: 54px;\n  height: 54px;\n  border-radius: 50%;\n  background: transparent;\n  border: 2px solid var(--nc, #6b7280);\n  box-shadow: 0 0 10px 3px color-mix(in srgb, var(--nc, #6b7280) 55%, transparent), inset 0 0 8px color-mix(in srgb, var(--nc, #6b7280) 15%, transparent);\n  position: relative;\n  animation: neutral-spin 5s linear infinite;\n  flex-shrink: 0;\n}\n.neutral-node-body::after {\n  content: "";\n  position: absolute;\n  top: 12%;\n  bottom: 12%;\n  left: calc(50% - 1px);\n  width: 2px;\n  border-radius: 1px;\n  background: var(--nc, #6b7280);\n  box-shadow: 0 0 5px 1px color-mix(in srgb, var(--nc, #6b7280) 70%, transparent);\n}\n@keyframes neutral-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.palette-neutral-icon {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  background: transparent;\n  border: 1.5px solid var(--glow, #6b7280);\n  box-shadow: 0 0 6px color-mix(in srgb, var(--glow, #6b7280) 55%, transparent);\n  position: relative;\n  animation: neutral-spin 5s linear infinite;\n  flex-shrink: 0;\n}\n.palette-neutral-icon::after {\n  content: "";\n  position: absolute;\n  top: 15%;\n  bottom: 15%;\n  left: calc(50% - 0.75px);\n  width: 1.5px;\n  border-radius: 1px;\n  background: var(--glow, #6b7280);\n}\n.palette-rune-neutral {\n  border-color: rgba(107, 114, 128, 0.25) !important;\n}\n.summon-node-wrap {\n  width: 110px;\n  height: 110px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.summon-glyph {\n  --sc: var(--glow, #a78bfa);\n  --sw: 2px;\n  position: relative;\n  width: 92px;\n  height: 92px;\n  flex-shrink: 0;\n  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--sc) 55%, transparent));\n}\n.summon-glyph::before {\n  content: "";\n  position: absolute;\n  inset: 12%;\n  border-radius: 50%;\n  background:\n    radial-gradient(\n      circle,\n      color-mix(in srgb, var(--sc) 38%, transparent) 0%,\n      transparent 70%);\n  animation: summon-haze 3.4s ease-in-out infinite alternate;\n}\n.summon-sq {\n  position: absolute;\n  inset: 0;\n  border: var(--sw) solid var(--sc);\n  border-radius: 3px;\n  opacity: 0.55;\n  mix-blend-mode: screen;\n  transform-origin: 50% 50%;\n  animation: summon-spin 8s linear infinite, summon-breathe 3.6s ease-in-out infinite;\n}\n.summon-sq:nth-child(1) {\n  animation-duration: 6.0s, 3.2s;\n  animation-delay: -0.0s, -0.0s;\n}\n.summon-sq:nth-child(2) {\n  animation-duration: 9.0s, 4.1s;\n  animation-delay: -1.1s, -0.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq:nth-child(3) {\n  animation-duration: 4.5s, 2.7s;\n  animation-delay: -2.2s, -1.0s;\n}\n.summon-sq:nth-child(4) {\n  animation-duration: 11.0s, 5.3s;\n  animation-delay: -3.3s, -1.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq:nth-child(5) {\n  animation-duration: 7.5s, 3.7s;\n  animation-delay: -4.4s, -2.0s;\n}\n.summon-sq:nth-child(6) {\n  animation-duration: 13.0s, 4.7s;\n  animation-delay: -5.5s, -2.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq:nth-child(7) {\n  animation-duration: 5.5s, 2.9s;\n  animation-delay: -6.6s, -3.0s;\n}\n.summon-sq:nth-child(8) {\n  animation-duration: 8.5s, 6.1s;\n  animation-delay: -7.7s, -3.5s;\n  animation-direction: reverse, normal;\n}\n.summon-sq:nth-child(3n) {\n  border-color: color-mix(in srgb, var(--sc) 45%, #22d3ee);\n}\n.summon-sq:nth-child(3n+1) {\n  border-color: color-mix(in srgb, var(--sc) 70%, #f0abfc);\n}\n.summon-sq:nth-child(4n) {\n  border-style: dashed;\n}\n@keyframes summon-spin {\n  to {\n    rotate: 360deg;\n  }\n}\n@keyframes summon-breathe {\n  0% {\n    scale: 0.34;\n    opacity: 0.28;\n  }\n  50% {\n    scale: 1.00;\n    opacity: 0.72;\n  }\n  100% {\n    scale: 0.34;\n    opacity: 0.28;\n  }\n}\n@keyframes summon-haze {\n  from {\n    opacity: 0.35;\n    scale: 0.8;\n  }\n  to {\n    opacity: 0.8;\n    scale: 1.15;\n  }\n}\n.rune-node.rune-node-selected .summon-glyph {\n  filter: drop-shadow(0 0 18px color-mix(in srgb, var(--sc) 90%, transparent)) drop-shadow(0 0 34px color-mix(in srgb, var(--sc) 50%, transparent)) brightness(1.25);\n}\n.rune-node.rune-node-drag .summon-sq,\n.rune-node.rune-node-drag .summon-glyph::before {\n  animation-play-state: paused;\n}\n.rune-node-name-summon {\n  color: #e9d5ff;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n.summon-glyph-mini {\n  --sc: var(--glow, #a78bfa);\n  --sw: 1px;\n  width: 22px;\n  height: 22px;\n  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--sc) 60%, transparent));\n}\n.summon-glyph-mini .summon-sq {\n  border-radius: 2px;\n}\n@media (prefers-reduced-motion: reduce) {\n  .summon-sq,\n  .summon-glyph::before {\n    animation: none;\n  }\n  .summon-sq {\n    scale: 0.34;\n    opacity: 0.5;\n  }\n  .summon-sq:nth-child(2) {\n    scale: 0.5;\n    rotate: 12deg;\n  }\n  .summon-sq:nth-child(3) {\n    scale: 0.62;\n    rotate: 24deg;\n  }\n  .summon-sq:nth-child(4) {\n    scale: 0.72;\n    rotate: 36deg;\n  }\n  .summon-sq:nth-child(5) {\n    scale: 0.8;\n    rotate: 48deg;\n  }\n  .summon-sq:nth-child(6) {\n    scale: 0.87;\n    rotate: 60deg;\n  }\n  .summon-sq:nth-child(7) {\n    scale: 0.94;\n    rotate: 72deg;\n  }\n  .summon-sq:nth-child(8) {\n    scale: 1;\n    rotate: 84deg;\n  }\n}\n.conn-badge {\n  pointer-events: none;\n}\n.conn-badge-bg {\n  fill: rgba(2, 4, 14, 0.96);\n  stroke: rgba(255, 255, 255, 0.2);\n  stroke-width: 1.5;\n}\n.conn-badge-passthrough {\n  stroke: rgba(139, 92, 246, 0.85);\n  fill: rgba(60, 20, 120, 0.92);\n}\n.conn-badge-delay {\n  stroke: rgba(251, 191, 36, 0.85);\n  fill: rgba(100, 60, 5, 0.92);\n}\n.conn-badge-combined-circle {\n  fill: none;\n  stroke: rgba(200, 160, 60, 0.45);\n  stroke-width: 1.5;\n}\n.conn-badge-divider {\n  stroke: rgba(255, 255, 255, 0.25);\n  stroke-width: 1;\n}\n.conn-badge-combined .conn-badge-passthrough,\n.conn-badge-combined .conn-badge-delay {\n  stroke: none;\n}\n.conn-badge-icon-sm {\n  fill: #f1f5f9;\n  font-size: 12px;\n  text-anchor: middle;\n  dominant-baseline: auto;\n  pointer-events: none;\n  font-family: monospace;\n}\n.conn-badge-sub-l {\n  fill: rgba(226, 232, 240, 0.85);\n  font-size: 8px;\n  text-anchor: middle;\n  dominant-baseline: auto;\n  font-family: monospace;\n  font-weight: 700;\n  pointer-events: none;\n}\n.conn-badge-icon {\n  fill: #f1f5f9;\n  font-size: 13px;\n  text-anchor: middle;\n  dominant-baseline: central;\n  pointer-events: none;\n  font-family: monospace;\n}\n.conn-badge-sub {\n  fill: rgba(226, 232, 240, 0.9);\n  font-size: 9px;\n  text-anchor: middle;\n  dominant-baseline: hanging;\n  font-family: monospace;\n  font-weight: 600;\n  pointer-events: none;\n}\n.conn-cond-label-group {\n  pointer-events: none;\n}\n.conn-cond-label-group.cond-unknown .conn-cond-label-bg {\n  fill: rgba(120, 40, 5, 0.96);\n  stroke: rgba(251, 146, 60, 0.85);\n  stroke-width: 1.5;\n}\n.conn-cond-label-group.cond-unknown .conn-cond-label-text {\n  fill: #fed7aa;\n}\n.conn-cond-label-group.cond-known .conn-cond-label-bg {\n  fill: rgba(55, 20, 110, 0.96);\n  stroke: rgba(167, 139, 250, 0.85);\n  stroke-width: 1.5;\n}\n.conn-cond-label-group.cond-known .conn-cond-label-text {\n  fill: #ddd6fe;\n}\n.conn-cond-label-text {\n  font-size: 10px;\n  text-anchor: middle;\n  dominant-baseline: central;\n  font-family: monospace;\n  font-weight: 700;\n  pointer-events: none;\n}\n.conn-inspector {\n  width: 240px;\n  min-width: 240px;\n  background: rgba(7, 9, 20, 0.97);\n  border-left: 1px solid rgba(139, 92, 246, 0.2);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n.ci-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.ci-title {\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: #a78bfa;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n.ci-close {\n  background: transparent;\n  border: none;\n  color: #6b7280;\n  font-size: 0.9rem;\n  cursor: pointer;\n  padding: 2px 4px;\n  border-radius: 4px;\n  transition: color 0.15s;\n}\n.ci-close:hover {\n  color: #ef4444;\n}\n.ci-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.ci-section-lbl {\n  font-size: 0.63rem;\n  font-weight: 700;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n  color: #4b5563;\n  margin-top: 6px;\n}\n.ci-input {\n  width: 100%;\n  padding: 5px 8px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 6px;\n  color: #e2e8f0;\n  font-size: 0.78rem;\n  outline: none;\n  transition: border-color 0.15s;\n  box-sizing: border-box;\n}\n.ci-input:focus {\n  border-color: #8b5cf6;\n  background: rgba(139, 92, 246, 0.06);\n}\n.ci-input:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n.ci-input-num {\n  max-width: 80px;\n  text-align: right;\n}\n.ci-input-hint {\n  font-size: 0.72rem;\n  color: #6b7280;\n  align-self: center;\n}\n.ci-shape-row {\n  display: flex;\n  gap: 8px;\n}\n.ci-shape-btn {\n  flex: 1;\n  padding: 6px 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 8px;\n  color: #9ca3af;\n  font-size: 0.75rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.ci-shape-btn:hover {\n  border-color: #8b5cf6;\n  color: #e2e8f0;\n}\n.ci-shape-btn.ci-shape-active {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.ci-shape-icon {\n  font-size: 1rem;\n}\n.ci-toggle-row {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.ci-toggle-btn {\n  width: 100%;\n  padding: 6px 10px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 7px;\n  color: #9ca3af;\n  font-size: 0.75rem;\n  cursor: pointer;\n  text-align: left;\n  transition: all 0.15s;\n}\n.ci-toggle-btn:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #e2e8f0;\n}\n.ci-toggle-btn.ci-toggle-active {\n  background: rgba(139, 92, 246, 0.18);\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.ci-toggle-passthrough.ci-toggle-active {\n  background: rgba(139, 92, 246, 0.22);\n  border-color: #a78bfa;\n}\n.ci-precast-toggle {\n  width: 100%;\n  margin-top: 6px;\n  padding: 7px 10px;\n  background: rgba(52, 211, 153, 0.07);\n  border: 1px solid rgba(52, 211, 153, 0.3);\n  border-radius: 7px;\n  color: #6ee7b7;\n  font-size: 0.75rem;\n  cursor: pointer;\n  text-align: left;\n  transition: all 0.15s;\n}\n.ci-precast-toggle:hover {\n  border-color: rgba(52, 211, 153, 0.6);\n  color: #a7f3d0;\n}\n.ci-precast-toggle.is-known {\n  background: rgba(251, 191, 36, 0.12);\n  border-color: #f59e0b;\n  color: #fcd34d;\n}\n.ci-precast-toggle.is-known:hover {\n  background: rgba(251, 191, 36, 0.18);\n  border-color: #fbbf24;\n}\n.ci-excl-toggle {\n  background: rgba(251, 146, 60, 0.07);\n  border: 1px solid rgba(251, 146, 60, 0.3);\n  color: #fb923c;\n}\n.ci-excl-toggle:hover {\n  border-color: rgba(251, 146, 60, 0.55);\n  color: #fdba74;\n}\n.ci-excl-toggle.is-exclusive {\n  background: rgba(239, 68, 68, 0.1);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.ci-excl-toggle.is-exclusive:hover {\n  background: rgba(239, 68, 68, 0.16);\n  border-color: #f87171;\n}\n.ci-passthrough-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.ci-delay-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.qs-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 2000;\n  cursor: default;\n}\n.qs-popup {\n  position: fixed;\n  z-index: 2001;\n  width: 240px;\n  background: rgba(7, 9, 22, 0.98);\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  border-radius: 10px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(139, 92, 246, 0.15);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.qs-header {\n  padding: 9px 12px 6px;\n  font-size: 0.7rem;\n  font-weight: 700;\n  color: #a78bfa;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n}\n.qs-input {\n  margin: 8px;\n  padding: 6px 10px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n  color: #e2e8f0;\n  font-size: 0.82rem;\n  outline: none;\n}\n.qs-input:focus {\n  border-color: #8b5cf6;\n}\n.qs-list {\n  display: flex;\n  flex-direction: column;\n  max-height: 260px;\n  overflow-y: auto;\n  padding: 4px 0 6px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.qs-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 10px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #d1d5db;\n  font-size: 0.8rem;\n  transition: background 0.1s;\n}\n.qs-item:hover {\n  background: rgba(139, 92, 246, 0.15);\n  color: #e2e8f0;\n}\n.qs-item-incompatible {\n  opacity: 0.38;\n}\n.qs-item-incompatible:hover {\n  opacity: 0.58;\n  background: rgba(100, 100, 120, 0.10);\n}\n.qs-item-glyph {\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n  overflow: hidden;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(30, 20, 60, 0.8);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n}\n.qs-item-img {\n  width: 24px;\n  height: 24px;\n  object-fit: contain;\n}\n.qs-item-icon {\n  font-size: 0.9rem;\n  color: #a78bfa;\n}\n.qs-item-name {\n  flex: 1;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.qs-empty {\n  padding: 10px 12px;\n  color: #6b7280;\n  font-size: 0.78rem;\n  font-style: italic;\n}\n.close-dialog-backdrop {\n  position: absolute;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.55);\n  z-index: 200;\n}\n.close-dialog-box {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  z-index: 201;\n  background: rgba(14, 18, 38, 0.98);\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  border-radius: 12px;\n  padding: 28px 32px 24px;\n  min-width: 360px;\n  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7);\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.close-dialog-title {\n  font-size: 1.05rem;\n  font-weight: 700;\n  color: #e2e8f0;\n  letter-spacing: 0.02em;\n}\n.close-dialog-body {\n  font-size: 0.88rem;\n  color: #94a3b8;\n  line-height: 1.5;\n}\n.close-dialog-actions {\n  display: flex;\n  gap: 10px;\n  justify-content: flex-end;\n  margin-top: 4px;\n}\n.close-dialog-btn {\n  padding: 8px 18px;\n  border-radius: 7px;\n  border: 1px solid;\n  font-size: 0.84rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s, color 0.15s;\n}\n.close-dialog-save {\n  background: rgba(34, 197, 94, 0.15);\n  border-color: rgba(34, 197, 94, 0.5);\n  color: #86efac;\n}\n.close-dialog-save:hover {\n  background: rgba(34, 197, 94, 0.28);\n  color: #bbf7d0;\n}\n.close-dialog-discard {\n  background: rgba(239, 68, 68, 0.12);\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n}\n.close-dialog-discard:hover {\n  background: rgba(239, 68, 68, 0.24);\n  color: #fecaca;\n}\n.close-dialog-cancel {\n  background: rgba(100, 116, 139, 0.12);\n  border-color: rgba(100, 116, 139, 0.35);\n  color: #94a3b8;\n}\n.close-dialog-cancel:hover {\n  background: rgba(100, 116, 139, 0.22);\n  color: #cbd5e1;\n}\n.conn-waypoint {\n  fill: rgba(15, 23, 42, 0.9);\n  stroke: rgba(139, 92, 246, 0.7);\n  stroke-width: 1.5;\n  cursor: grab;\n  pointer-events: all;\n  opacity: 0;\n  transition:\n    opacity 0.15s,\n    r 0.1s,\n    stroke 0.1s;\n}\n.conn-group:has(.conn-hit:hover) .conn-waypoint {\n  opacity: 0.45;\n}\n.conn-waypoint.conn-waypoint-selected {\n  opacity: 1;\n  fill: rgba(139, 92, 246, 0.3);\n  stroke: #c4b5fd;\n}\n.conn-group:has(.conn-hit:hover) .conn-waypoint.conn-waypoint-selected {\n  opacity: 1;\n}\n.conn-waypoint:hover {\n  fill: rgba(139, 92, 246, 0.25);\n  stroke: #a78bfa;\n  stroke-width: 2;\n  cursor: grabbing;\n  opacity: 1;\n}\n.conn-snap-dot {\n  fill: none;\n  stroke: rgba(139, 92, 246, 0.45);\n  stroke-width: 1;\n  stroke-dasharray: 2 2;\n  pointer-events: none;\n}\n.conn-waypoint-preview {\n  fill: rgba(139, 92, 246, 0.35);\n  stroke: #a78bfa;\n  stroke-width: 2;\n  pointer-events: none;\n}\n.snap-line-svg {\n  pointer-events: none;\n}\n.node-snap-line {\n  stroke: rgba(139, 92, 246, 0.55);\n  stroke-width: 1;\n  stroke-dasharray: 4 4;\n}\n.marquee-box {\n  position: absolute;\n  border: 1.5px dashed rgba(139, 92, 246, 0.7);\n  background: rgba(139, 92, 246, 0.08);\n  border-radius: 3px;\n  pointer-events: none;\n  z-index: 50;\n}\n.rune-inspector {\n  width: 240px;\n  flex-shrink: 0;\n  background: rgba(10, 12, 26, 0.98);\n  border-left: 1px solid rgba(139, 92, 246, 0.2);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.ri-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 14px 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.15);\n  flex-shrink: 0;\n}\n.ri-title {\n  font-size: 0.66rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.12em;\n  color: #a78bfa;\n}\n.ri-close {\n  width: 22px;\n  height: 22px;\n  border-radius: 6px;\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #6b7280;\n  font-size: 0.75rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.ri-close:hover {\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.ri-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px 12px 20px;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.ri-img {\n  display: block;\n  width: 100%;\n  aspect-ratio: 1;\n  object-fit: cover;\n  border-radius: 10px;\n  margin-bottom: 12px;\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.3);\n}\n.ri-name {\n  font-size: 1rem;\n  font-weight: 700;\n  margin: 0 0 8px;\n  line-height: 1.3;\n  text-shadow: 0 0 12px currentColor;\n}\n.ri-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-bottom: 10px;\n}\n.ri-tag {\n  font-size: 0.65rem;\n  font-weight: 600;\n  padding: 2px 7px;\n  border-radius: 99px;\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  color: #a78bfa;\n}\n.ri-desc {\n  font-size: 0.78rem;\n  color: #9ca3af;\n  line-height: 1.55;\n  margin: 0 0 12px;\n}\n.ri-costs {\n  display: flex;\n  gap: 6px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n.ri-cost {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px;\n  padding: 5px 10px;\n  min-width: 52px;\n}\n.ri-cost-lbl {\n  font-size: 0.6rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: #6b7280;\n  letter-spacing: 0.08em;\n}\n.ri-cost-val {\n  font-size: 0.95rem;\n  font-weight: 700;\n  color: #e2e8f0;\n  margin-top: 1px;\n}\n.summon-config {\n  position: absolute;\n  top: 12px;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 30;\n  background: #1e293b;\n  border: 1px solid #a78bfa;\n  border-radius: 10px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-width: 260px;\n  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);\n}\n.summon-config-head {\n  font-weight: 700;\n  font-size: 0.85rem;\n  color: #c4b5fd;\n}\n.summon-field {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  font-size: 0.75rem;\n  color: #9ca3af;\n}\n.summon-field select {\n  padding: 6px 8px;\n  background: #0f172a;\n  border: 1px solid #4a5568;\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n}\n.summon-hint {\n  font-size: 0.72rem;\n  color: #9ca3af;\n  font-style: italic;\n  margin: 0;\n}\n.summon-edit-btn {\n  padding: 7px 12px;\n  background: rgba(167, 139, 250, 0.18);\n  border: 1px solid #a78bfa;\n  border-radius: 6px;\n  color: #c4b5fd;\n  font-weight: 600;\n  font-size: 0.82rem;\n  cursor: pointer;\n}\n.summon-edit-btn:hover {\n  background: rgba(167, 139, 250, 0.3);\n}\n.summon-ok {\n  font-size: 0.75rem;\n  color: #34d399;\n  text-align: center;\n}\n.summon-config-ico {\n  width: 15px;\n  height: 15px;\n  vertical-align: -3px;\n}\n/*# sourceMappingURL=spell-node-editor.component.css.map */\n'] }]
  }], () => [{ type: ChangeDetectorRef }], { spell: [{
    type: Input
  }], availableRunes: [{
    type: Input,
    args: [{ required: true }]
  }], availableCompanions: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }], deleteSpell: [{
    type: Output
  }], estimatedCostResult: [{
    type: Output
  }], canvasWrapRef: [{
    type: ViewChild,
    args: ["canvasWrap", { static: false }]
  }], svgRef: [{
    type: ViewChild,
    args: ["svgLayer", { static: false }]
  }], isWpDragging: [{
    type: HostBinding,
    args: ["class.wp-dragging"]
  }], onKeyDown: [{
    type: HostListener,
    args: ["document:keydown", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SpellNodeEditorComponent, { className: "SpellNodeEditorComponent", filePath: "app/shared/spell-node-editor/spell-node-editor.component.ts", lineNumber: 32 });
})();

// src/app/sheet/spell-editor-overlay/spell-editor-overlay.component.ts
var _forTrack04 = ($index, $item) => $item.key;
var _forTrack14 = ($index, $item) => $item.id;
function SpellEditorOverlayComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Neuen Zauber erstellen ");
  }
}
function SpellEditorOverlayComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275textInterpolate1(" ", ctx_r0.spellName || "Zauber bearbeiten", " ");
  }
}
function SpellEditorOverlayComponent_For_24_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 49);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_For_24_Template_button_click_0_listener() {
      const ico_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.spellIcon = ico_r3);
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ico_r3 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("color", ctx_r0.spellColor);
    \u0275\u0275classProp("selected", ctx_r0.spellIcon === ico_r3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ico_r3);
  }
}
function SpellEditorOverlayComponent_For_30_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 50);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_For_30_Template_button_click_0_listener() {
      const c_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.spellColor = c_r5);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r5 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("background", c_r5);
    \u0275\u0275classProp("selected", ctx_r0.spellColor === c_r5);
  }
}
function SpellEditorOverlayComponent_For_45_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 51);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_For_45_Template_button_click_0_listener() {
      const tag_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.toggleTag(tag_r7));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r7 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classProp("tag-chip--active", ctx_r0.spellTags.includes(tag_r7));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tag_r7);
  }
}
function SpellEditorOverlayComponent_Conditional_50_For_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 54);
  }
  if (rf & 2) {
    const node_r8 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", node_r8.drawing, \u0275\u0275sanitizeUrl)("alt", node_r8.runeId);
  }
}
function SpellEditorOverlayComponent_Conditional_50_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 55);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const node_r8 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(node_r8.icon);
  }
}
function SpellEditorOverlayComponent_Conditional_50_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 56);
    \u0275\u0275text(1, "???");
    \u0275\u0275elementEnd();
  }
}
function SpellEditorOverlayComponent_Conditional_50_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 53);
    \u0275\u0275conditionalCreate(1, SpellEditorOverlayComponent_Conditional_50_For_2_Conditional_1_Template, 1, 2, "img", 54)(2, SpellEditorOverlayComponent_Conditional_50_For_2_Conditional_2_Template, 2, 1, "span", 55)(3, SpellEditorOverlayComponent_Conditional_50_For_2_Conditional_3_Template, 2, 0, "span", 56);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const node_r8 = ctx.$implicit;
    \u0275\u0275classProp("rune-mini-unknown", !node_r8.known);
    \u0275\u0275property("title", node_r8.known ? node_r8.runeId : "??? (Rune nicht gelernt)");
    \u0275\u0275advance();
    \u0275\u0275conditional(node_r8.drawing ? 1 : node_r8.known ? 2 : 3);
  }
}
function SpellEditorOverlayComponent_Conditional_50_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25);
    \u0275\u0275repeaterCreate(1, SpellEditorOverlayComponent_Conditional_50_For_2_Template, 4, 4, "div", 52, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r0.graphRuneNodes);
  }
}
function SpellEditorOverlayComponent_Conditional_53_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r0.graphNodeCount, " Knoten");
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("STR ", sreqs_r10.strength);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("GES ", sreqs_r10.dexterity);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("TEM ", sreqs_r10.speed);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("INT ", sreqs_r10.intelligence);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("KON ", sreqs_r10.constitution);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext(2);
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("CHR ", sreqs_r10.chill);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62)(1, "span", 63);
    \u0275\u0275text(2, "Anforderungen:");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_3_Template, 2, 1, "span", 64);
    \u0275\u0275conditionalCreate(4, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_4_Template, 2, 1, "span", 64);
    \u0275\u0275conditionalCreate(5, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_5_Template, 2, 1, "span", 64);
    \u0275\u0275conditionalCreate(6, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_6_Template, 2, 1, "span", 64);
    \u0275\u0275conditionalCreate(7, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_7_Template, 2, 1, "span", 64);
    \u0275\u0275conditionalCreate(8, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Conditional_8_Template, 2, 1, "span", 64);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275nextContext();
    const sreqs_r10 = \u0275\u0275readContextLet(10);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(sreqs_r10.strength ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(sreqs_r10.dexterity ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(sreqs_r10.speed ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(sreqs_r10.intelligence ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(sreqs_r10.constitution ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(sreqs_r10.chill ? 8 : -1);
  }
}
function SpellEditorOverlayComponent_Conditional_61_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 31)(1, "div", 57)(2, "span", 58);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 59);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 60);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 61);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_Conditional_61_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.applyEstimate());
    });
    \u0275\u0275text(9, "\u2193 \xDCbernehmen");
    \u0275\u0275elementEnd()();
    \u0275\u0275declareLet(10);
    \u0275\u0275conditionalCreate(11, SpellEditorOverlayComponent_Conditional_61_Conditional_11_Template, 9, 6, "div", 62);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("\u25C6 ", ctx_r0.lastSimpleEstimate.mana, " Mana");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u25C7 ", ctx_r0.lastSimpleEstimate.fokus, " Fokus");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r0.lastSimpleEstimate.nodeCount, " Runen");
    \u0275\u0275advance(3);
    const sreqs_r11 = \u0275\u0275storeLet(ctx_r0.lastSimpleEstimate.statRequirements);
    \u0275\u0275advance();
    \u0275\u0275conditional(sreqs_r11.strength || sreqs_r11.dexterity || sreqs_r11.speed || sreqs_r11.intelligence || sreqs_r11.constitution || sreqs_r11.chill ? 11 : -1);
  }
}
function SpellEditorOverlayComponent_Conditional_88_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 65)(1, "input", 66);
    \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Conditional_88_For_2_Template_input_ngModelChange_1_listener($event) {
      const counter_r13 = \u0275\u0275restoreView(_r12).$implicit;
      \u0275\u0275twoWayBindingSet(counter_r13.color, $event) || (counter_r13.color = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 67);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 68);
    \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Conditional_88_For_2_Template_input_ngModelChange_4_listener($event) {
      const counter_r13 = \u0275\u0275restoreView(_r12).$implicit;
      \u0275\u0275twoWayBindingSet(counter_r13.current, $event) || (counter_r13.current = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 69);
    \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Conditional_88_For_2_Template_input_ngModelChange_5_listener($event) {
      const counter_r13 = \u0275\u0275restoreView(_r12).$implicit;
      \u0275\u0275twoWayBindingSet(counter_r13.current, $event) || (counter_r13.current = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 70);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 71);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_Conditional_88_For_2_Template_button_click_8_listener() {
      const \u0275$index_223_r14 = \u0275\u0275restoreView(_r12).$index;
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.removeCounter(\u0275$index_223_r14));
    });
    \u0275\u0275text(9, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const counter_r13 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", counter_r13.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(counter_r13.name);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", counter_r13.current);
    \u0275\u0275property("min", counter_r13.min)("max", counter_r13.max);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", counter_r13.current);
    \u0275\u0275property("min", counter_r13.min)("max", counter_r13.max);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("/ ", counter_r13.max);
  }
}
function SpellEditorOverlayComponent_Conditional_88_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 36);
    \u0275\u0275repeaterCreate(1, SpellEditorOverlayComponent_Conditional_88_For_2_Template, 10, 9, "div", 65, _forTrack14);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r0.counters);
  }
}
function SpellEditorOverlayComponent_For_119_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 20)(1, "label");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 72);
    \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_For_119_Template_input_ngModelChange_3_listener($event) {
      const stat_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r0.spellStatRequirements[stat_r16.key], $event) || (ctx_r0.spellStatRequirements[stat_r16.key] = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const stat_r16 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(stat_r16.label);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r0.spellStatRequirements[stat_r16.key]);
  }
}
function SpellEditorOverlayComponent_Conditional_131_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 73);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_Conditional_131_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onCloseDialogCancel());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(1, "div", 74)(2, "div", 75);
    \u0275\u0275text(3, "Ungespeicherte \xC4nderungen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 76);
    \u0275\u0275text(5, "M\xF6chtest du die \xC4nderungen an diesem Zauber speichern?");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 77)(7, "button", 78);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_Conditional_131_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onCloseConfirmSave());
    });
    \u0275\u0275text(8, "Speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 79);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_Conditional_131_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onCloseConfirmDiscard());
    });
    \u0275\u0275text(10, "Nicht speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 80);
    \u0275\u0275listener("click", function SpellEditorOverlayComponent_Conditional_131_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onCloseDialogCancel());
    });
    \u0275\u0275text(12, "Abbrechen");
    \u0275\u0275elementEnd()()();
  }
}
function SpellEditorOverlayComponent_Conditional_132_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-spell-node-editor", 81);
    \u0275\u0275listener("save", function SpellEditorOverlayComponent_Conditional_132_Template_app_spell_node_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onNodeEditorSave($event));
    })("cancel", function SpellEditorOverlayComponent_Conditional_132_Template_app_spell_node_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r18);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closeNodeEditor());
    })("estimatedCostResult", function SpellEditorOverlayComponent_Conditional_132_Template_app_spell_node_editor_estimatedCostResult_0_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.onNodeEditorCostResult($event));
    })("deleteSpell", function SpellEditorOverlayComponent_Conditional_132_Template_app_spell_node_editor_deleteSpell_0_listener() {
      \u0275\u0275restoreView(_r18);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closeNodeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275property("spell", ctx_r0.buildSpellForNodeEditor())("availableRunes", ctx_r0.availableRunes)("availableCompanions", ctx_r0.availableCompanions);
  }
}
var SpellEditorOverlayComponent = class _SpellEditorOverlayComponent {
  spell = null;
  availableRunes = [];
  /** The caster's Begleiter — a summoning rune in the graph just picks one of them. */
  availableCompanions = [];
  save = new EventEmitter();
  cancel = new EventEmitter();
  deleteSpell = new EventEmitter();
  cdr = inject(ChangeDetectorRef);
  // ── Form fields ──────────────────────────────────────────────────────────────
  spellId;
  spellName = "";
  spellDescription = "";
  spellTags = [];
  spellCostMana = 0;
  spellCostFokus = 0;
  perTurnMana = 0;
  perTurnFokus = 0;
  durationTurns = 0;
  spellStatRequirements = {};
  spellBinding = { type: "learned" };
  graph;
  embeddedMacro = null;
  spellScript = "";
  hasDrawing = false;
  spellIcon = "\u2726";
  spellColor = "#8b5cf6";
  // ── Counter state ────────────────────────────────────────────────────────────
  counters = [];
  newCounter = { id: "", name: "", min: 0, max: 10, current: 0, color: "#22c55e" };
  // ── UI state ─────────────────────────────────────────────────────────────────
  showNodeEditor = false;
  showDeleteConfirm = false;
  showMacroEditor = false;
  showCloseDialog = false;
  lastSimpleEstimate = null;
  savedFeedback = false;
  _initialSnapshot = "";
  get isDirty() {
    return this._makeSnapshot() !== this._initialSnapshot;
  }
  _makeSnapshot() {
    return JSON.stringify({
      name: this.spellName,
      description: this.spellDescription,
      tags: [...this.spellTags].sort(),
      costMana: this.spellCostMana,
      costFokus: this.spellCostFokus,
      perTurnMana: this.perTurnMana,
      perTurnFokus: this.perTurnFokus,
      durationTurns: this.durationTurns,
      statReqs: this.spellStatRequirements,
      icon: this.spellIcon,
      color: this.spellColor,
      counters: this.counters,
      graph: this.graph
    });
  }
  tagOptions = SPELL_TAG_OPTIONS;
  iconOptions = SPELL_ICON_SYMBOLS;
  colorPresets = [
    "#8b5cf6",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#ec4899",
    "#a78bfa",
    "#ffffff"
  ];
  statLabels = [
    { key: "intelligence", label: "Intelligenz" },
    { key: "constitution", label: "Konstitution" },
    { key: "strength", label: "St\xE4rke" },
    { key: "dexterity", label: "Geschick" },
    { key: "speed", label: "Tempo" },
    { key: "chill", label: "Chill" }
  ];
  counterColors = [
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#06b6d4",
    "#ec4899",
    "#a78bfa",
    "#ffffff"
  ];
  get isNewSpell() {
    return !this.spell;
  }
  get hasGraph() {
    return (this.graph?.nodes?.length ?? 0) > 0;
  }
  ngOnInit() {
    document.body.style.overflow = "hidden";
    if (this.spell) {
      this.spellId = this.spell.id || generateSpellId();
      this.spellName = this.spell.name || "";
      this.spellDescription = this.spell.description || "";
      this.spellTags = [...this.spell.tags || []];
      this.spellCostMana = this.spell.costMana ?? 0;
      this.spellCostFokus = this.spell.costFokus ?? 0;
      this.perTurnMana = this.spell.perTurnMana ?? 0;
      this.perTurnFokus = this.spell.perTurnFokus ?? 0;
      this.durationTurns = this.spell.durationTurns ?? 0;
      this.spellStatRequirements = __spreadValues({}, this.spell.statRequirements || {});
      this.spellBinding = __spreadValues({}, this.spell.binding || { type: "learned" });
      this.graph = this.spell.graph ? JSON.parse(JSON.stringify(this.spell.graph)) : void 0;
      this.embeddedMacro = this.spell.embeddedMacro ? JSON.parse(JSON.stringify(this.spell.embeddedMacro)) : null;
      this.spellScript = this.spell.script ?? (this.spell.embeddedMacro ? actionMacroToScript(this.spell.embeddedMacro) : "");
      this.hasDrawing = !!this.spell.drawing;
      this.spellIcon = this.spell.icon || "\u2726";
      this.spellColor = this.spell.strokeColor || "#8b5cf6";
      this.counters = this.spell.counters ? JSON.parse(JSON.stringify(this.spell.counters)) : [];
    } else {
      this.spellId = generateSpellId();
    }
    this._initialSnapshot = this._makeSnapshot();
  }
  ngOnDestroy() {
    document.body.style.overflow = "";
  }
  // ── Save ─────────────────────────────────────────────────────────────────────
  onSave() {
    const spell = {
      id: this.spellId,
      name: this.spellName.trim() || "Unbenannter Zauber",
      description: this.spellDescription,
      tags: [...this.spellTags],
      binding: __spreadValues({}, this.spellBinding),
      strokeColor: this.spellColor,
      icon: this.spellIcon,
      libraryOrigin: this.spell?.libraryOrigin,
      libraryOriginName: this.spell?.libraryOriginName,
      drawing: this.spell?.drawing,
      graph: this.graph,
      costMana: this.spellCostMana || void 0,
      costFokus: this.spellCostFokus || void 0,
      perTurnMana: this.perTurnMana || void 0,
      perTurnFokus: this.perTurnFokus || void 0,
      durationTurns: this.durationTurns || void 0,
      statRequirements: this.hasAnyStatReq() ? __spreadValues({}, this.spellStatRequirements) : void 0,
      script: this.spellScript.trim() || void 0,
      embeddedMacro: void 0,
      // migrated to script
      counters: this.counters.length > 0 ? JSON.parse(JSON.stringify(this.counters)) : void 0
    };
    this.save.emit(spell);
    this._initialSnapshot = this._makeSnapshot();
    this.savedFeedback = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.savedFeedback = false;
      this.cdr.markForCheck();
    }, 1500);
  }
  onCancel() {
    if (this.isDirty) {
      this.showCloseDialog = true;
      this.cdr.markForCheck();
    } else {
      this.cancel.emit();
    }
  }
  onCloseConfirmSave() {
    this.onSave();
    this.showCloseDialog = false;
    this.cancel.emit();
  }
  onCloseConfirmDiscard() {
    this.showCloseDialog = false;
    this.cancel.emit();
  }
  onCloseDialogCancel() {
    this.showCloseDialog = false;
    this.cdr.markForCheck();
  }
  onDeleteConfirm() {
    this.deleteSpell.emit();
  }
  hasAnyStatReq() {
    return Object.values(this.spellStatRequirements).some((v) => (v ?? 0) > 0);
  }
  // ── Counters ─────────────────────────────────────────────────────────────────
  addCounter() {
    if (!this.newCounter.name.trim())
      return;
    const counter = {
      id: "c_" + Math.random().toString(36).slice(2, 9),
      name: this.newCounter.name.trim(),
      min: this.newCounter.min,
      max: this.newCounter.max,
      current: this.newCounter.current,
      color: this.newCounter.color
    };
    this.counters = [...this.counters, counter];
    this.newCounter = { id: "", name: "", min: 0, max: 10, current: 0, color: "#22c55e" };
    this.cdr.markForCheck();
  }
  removeCounter(index) {
    this.counters = this.counters.filter((_, i) => i !== index);
    this.cdr.markForCheck();
  }
  // ── Tags ─────────────────────────────────────────────────────────────────────
  toggleTag(tag) {
    const idx = this.spellTags.indexOf(tag);
    if (idx >= 0)
      this.spellTags.splice(idx, 1);
    else
      this.spellTags.push(tag);
    this.cdr.markForCheck();
  }
  // ── Rune editor ──────────────────────────────────────────────────────────────
  openNodeEditor() {
    this.showNodeEditor = true;
    this.cdr.markForCheck();
  }
  onNodeEditorSave(savedSpell) {
    this.graph = savedSpell.graph;
    if (savedSpell.costMana !== void 0)
      this.spellCostMana = savedSpell.costMana;
    if (savedSpell.costFokus !== void 0)
      this.spellCostFokus = savedSpell.costFokus;
    if (savedSpell.statRequirements)
      this.spellStatRequirements = __spreadValues({}, savedSpell.statRequirements);
    this._updateEstimateFromGraph();
    this.showNodeEditor = false;
    this.onSave();
  }
  onNodeEditorCostResult(result) {
    if (!result)
      return;
    this.lastSimpleEstimate = result;
    this.cdr.markForCheck();
  }
  closeNodeEditor() {
    this.showNodeEditor = false;
    this.cdr.markForCheck();
  }
  /** Run a quick estimate from the current saved graph without opening the node editor */
  runManualEstimate() {
    this._updateEstimateFromGraph();
  }
  _updateEstimateFromGraph() {
    if (!this.graph || !this.graph.nodes?.length) {
      this.lastSimpleEstimate = null;
    } else {
      this.lastSimpleEstimate = calculateSpellCost(this.graph, this.availableRunes);
    }
    this.cdr.markForCheck();
  }
  /** Build a SpellBlock to pass into the node editor, seeded with current form state */
  buildSpellForNodeEditor() {
    return {
      id: this.spellId,
      name: this.spellName || "Neuer Zauber",
      description: this.spellDescription,
      tags: [...this.spellTags],
      binding: __spreadValues({}, this.spellBinding),
      strokeColor: this.spell?.strokeColor,
      graph: this.graph ? JSON.parse(JSON.stringify(this.graph)) : void 0,
      costMana: this.spellCostMana || void 0,
      costFokus: this.spellCostFokus || void 0,
      statRequirements: this.hasAnyStatReq() ? __spreadValues({}, this.spellStatRequirements) : void 0
    };
  }
  get graphNodeCount() {
    return this.graph?.nodes?.length ?? 0;
  }
  /** Mini preview: rune nodes in graph connection order with their icons/drawings */
  get graphRuneNodes() {
    if (!this.graph?.nodes?.length)
      return [];
    const runeByName = new Map(this.availableRunes.map((r) => [r.name, r]));
    const visited = /* @__PURE__ */ new Set();
    const ordered = [];
    const queue = ["start"];
    while (queue.length > 0) {
      const cur = queue.shift();
      if (visited.has(cur))
        continue;
      visited.add(cur);
      if (cur !== "start")
        ordered.push(cur);
      for (const conn of this.graph.connections || []) {
        if (conn.fromNodeId === cur && !visited.has(conn.toNodeId)) {
          queue.push(conn.toNodeId);
        }
      }
    }
    for (const node of this.graph.nodes) {
      if (!visited.has(node.id))
        ordered.push(node.id);
    }
    return ordered.map((nodeId) => {
      const node = this.graph.nodes.find((n) => n.id === nodeId);
      const rune = runeByName.get(node.runeId);
      return {
        runeId: node.runeId,
        drawing: rune?.drawing,
        icon: rune?.name?.charAt(0)?.toUpperCase() ?? "\u2726",
        known: !!rune
      };
    }).filter(Boolean);
  }
  /** Copy the current estimate values into the spell cost fields */
  applyEstimate() {
    if (!this.lastSimpleEstimate)
      return;
    this.spellCostMana = this.lastSimpleEstimate.mana;
    this.spellCostFokus = this.lastSimpleEstimate.fokus;
    if (this.lastSimpleEstimate.statRequirements && Object.keys(this.lastSimpleEstimate.statRequirements).length > 0) {
      this.spellStatRequirements = __spreadValues({}, this.lastSimpleEstimate.statRequirements);
    }
    this.cdr.markForCheck();
  }
  // ── Macro ─────────────────────────────────────────────────────────────────────
  enableMacro() {
    const m = createEmptyActionMacro();
    m.name = this.spellName || "Zauber-Makro";
    this.embeddedMacro = m;
    this.showMacroEditor = true;
    this.cdr.markForCheck();
  }
  disableMacro() {
    this.embeddedMacro = null;
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }
  onMacroSave(macro) {
    this.embeddedMacro = macro;
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }
  onMacroCancel() {
    if (!this.embeddedMacro) {
      this.embeddedMacro = null;
    }
    this.showMacroEditor = false;
    this.cdr.markForCheck();
  }
  static \u0275fac = function SpellEditorOverlayComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SpellEditorOverlayComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SpellEditorOverlayComponent, selectors: [["app-spell-editor-overlay"]], inputs: { spell: "spell", availableRunes: "availableRunes", availableCompanions: "availableCompanions" }, outputs: { save: "save", cancel: "cancel", deleteSpell: "deleteSpell" }, decls: 133, vars: 34, consts: [[1, "item-editor-overlay"], [1, "item-editor-modal"], [1, "editor-header"], [1, "header-actions"], [1, "btn-save", 3, "click", "disabled"], ["title", "Schlie\xDFen", 1, "btn-close-header", 3, "click"], [1, "editor-content"], [1, "editor-column"], [1, "editor-section"], [1, "form-group", "icon-color-row"], [1, "spell-preview-badge"], [1, "icon-color-pickers"], [1, "picker-label"], [1, "icon-grid-mini"], [1, "icon-btn-mini", 3, "selected", "color"], ["type", "text", "placeholder", "Eigenes Symbol", 1, "icon-text-input", 3, "ngModelChange", "ngModel"], [1, "picker-label", 2, "margin-top", "6px"], [1, "color-row"], [1, "color-dot", 3, "background", "selected"], ["type", "color", 1, "color-picker-custom", 3, "ngModelChange", "ngModel"], [1, "form-group"], ["type", "text", "placeholder", "Zaubername...", 3, "ngModelChange", "ngModel"], ["rows", "10", "placeholder", "Was bewirkt dieser Zauber? Effekte, Reichweite, Dauer...", 3, "ngModelChange", "ngModel"], [1, "tag-grid"], [1, "tag-chip", 3, "tag-chip--active"], [1, "rune-mini-preview"], [1, "rune-edit-btn", 3, "click"], [1, "rune-node-count"], [1, "section-header-row"], [1, "section-header-actions"], ["title", "Kostensch\xE4tzung aus Runen-Netzwerk", 1, "btn-outline-small", 3, "click"], [1, "estimate-inline"], [1, "form-row"], [1, "form-group", 2, "flex", "1"], ["type", "number", "min", "0", "step", "0.5", "placeholder", "0", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "placeholder", "0", 3, "ngModelChange", "ngModel"], [1, "counter-list"], [1, "add-counter-form"], [1, "form-group", 2, "flex", "2"], ["type", "text", "placeholder", "z.B. Ladungen", 3, "ngModelChange", "ngModel"], [1, "form-group", "counter-color-group"], ["type", "number", 3, "ngModelChange", "ngModel"], [1, "btn-outline-small", "add-btn", 3, "click", "disabled"], [1, "stat-reqs-grid"], [1, "editor-section", "macro-section"], [1, "empty-hint"], [1, "spell-script-host"], [3, "valueChange", "value"], [3, "spell", "availableRunes", "availableCompanions"], [1, "icon-btn-mini", 3, "click"], [1, "color-dot", 3, "click"], [1, "tag-chip", 3, "click"], [1, "rune-mini-chip", 3, "rune-mini-unknown", "title"], [1, "rune-mini-chip", 3, "title"], [1, "rune-mini-img", 3, "src", "alt"], [1, "rune-mini-glyph"], [1, "rune-mini-glyph", "rune-mini-glyph-unknown"], [1, "estimate-pills-row"], [1, "estimate-pill", "estimate-pill--mana"], [1, "estimate-pill", "estimate-pill--fokus"], [1, "estimate-pill", "estimate-pill--nodes"], ["title", "Gesch\xE4tzte Kosten \xFCbernehmen", 1, "btn-accent-small", 3, "click"], [1, "estimate-stat-row"], [1, "estimate-stat-label"], [1, "estimate-pill", "estimate-pill--stat"], [1, "counter-item-editable"], ["type", "color", "title", "Farbe \xE4ndern", 1, "counter-color-input-visible", 3, "ngModelChange", "ngModel"], [1, "counter-name"], ["type", "number", 3, "ngModelChange", "ngModel", "min", "max"], ["type", "range", 3, "ngModelChange", "ngModel", "min", "max"], [1, "counter-max-label"], ["title", "Entfernen", 1, "btn-icon-sm", 3, "click"], ["type", "number", "min", "0", "placeholder", "\u2014", 3, "ngModelChange", "ngModel"], [1, "close-dialog-backdrop", 3, "click"], [1, "close-dialog-box"], [1, "close-dialog-title"], [1, "close-dialog-body"], [1, "close-dialog-actions"], [1, "close-dialog-btn", "close-dialog-save", 3, "click"], [1, "close-dialog-btn", "close-dialog-discard", 3, "click"], [1, "close-dialog-btn", "close-dialog-cancel", 3, "click"], [3, "save", "cancel", "estimatedCostResult", "deleteSpell", "spell", "availableRunes", "availableCompanions"]], template: function SpellEditorOverlayComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h2");
      \u0275\u0275conditionalCreate(4, SpellEditorOverlayComponent_Conditional_4_Template, 1, 0)(5, SpellEditorOverlayComponent_Conditional_5_Template, 1, 1);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "div", 3)(7, "button", 4);
      \u0275\u0275listener("click", function SpellEditorOverlayComponent_Template_button_click_7_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "button", 5);
      \u0275\u0275listener("click", function SpellEditorOverlayComponent_Template_button_click_9_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(10, "Schlie\xDFen \u2715");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(11, "div", 6)(12, "div", 7)(13, "section", 8)(14, "h3");
      \u0275\u0275text(15, "Grundlegendes");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "div", 9)(17, "div", 10);
      \u0275\u0275text(18);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "div", 11)(20, "div", 12);
      \u0275\u0275text(21, "Icon");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "div", 13);
      \u0275\u0275repeaterCreate(23, SpellEditorOverlayComponent_For_24_Template, 2, 5, "button", 14, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "input", 15);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_25_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.spellIcon, $event) || (ctx.spellIcon = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "div", 16);
      \u0275\u0275text(27, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "div", 17);
      \u0275\u0275repeaterCreate(29, SpellEditorOverlayComponent_For_30_Template, 1, 4, "button", 18, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementStart(31, "input", 19);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_31_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.spellColor, $event) || (ctx.spellColor = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(32, "div", 20)(33, "label");
      \u0275\u0275text(34, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "input", 21);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_35_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.spellName, $event) || (ctx.spellName = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(36, "div", 20)(37, "label");
      \u0275\u0275text(38, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(39, "textarea", 22);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_textarea_ngModelChange_39_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.spellDescription, $event) || (ctx.spellDescription = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(40, "section", 8)(41, "h3");
      \u0275\u0275text(42, "Tags");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "div", 23);
      \u0275\u0275repeaterCreate(44, SpellEditorOverlayComponent_For_45_Template, 2, 3, "button", 24, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(46, "div", 7)(47, "section", 8)(48, "h3");
      \u0275\u0275text(49, "Runen");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(50, SpellEditorOverlayComponent_Conditional_50_Template, 3, 0, "div", 25);
      \u0275\u0275elementStart(51, "button", 26);
      \u0275\u0275listener("click", function SpellEditorOverlayComponent_Template_button_click_51_listener() {
        return ctx.openNodeEditor();
      });
      \u0275\u0275text(52, " Runen bearbeiten ");
      \u0275\u0275conditionalCreate(53, SpellEditorOverlayComponent_Conditional_53_Template, 2, 1, "span", 27);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(54, "section", 8)(55, "div", 28)(56, "h3");
      \u0275\u0275text(57, "Kosten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "div", 29)(59, "button", 30);
      \u0275\u0275listener("click", function SpellEditorOverlayComponent_Template_button_click_59_listener() {
        return ctx.runManualEstimate();
      });
      \u0275\u0275text(60, "\u26E8 Sch\xE4tzen");
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(61, SpellEditorOverlayComponent_Conditional_61_Template, 12, 5, "div", 31);
      \u0275\u0275elementStart(62, "div", 32)(63, "div", 33)(64, "label");
      \u0275\u0275text(65, "\u25C6 Mana (Start)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "input", 34);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_66_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.spellCostMana, $event) || (ctx.spellCostMana = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(67, "div", 33)(68, "label");
      \u0275\u0275text(69, "\u25C7 Fokus (Start)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(70, "input", 34);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_70_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.spellCostFokus, $event) || (ctx.spellCostFokus = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(71, "div", 32)(72, "div", 33)(73, "label");
      \u0275\u0275text(74, "\u25C6 Mana pro Runde");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(75, "input", 34);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_75_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.perTurnMana, $event) || (ctx.perTurnMana = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(76, "div", 33)(77, "label");
      \u0275\u0275text(78, "\u25C7 Fokus pro Runde");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(79, "input", 34);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_79_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.perTurnFokus, $event) || (ctx.perTurnFokus = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(80, "div", 32)(81, "div", 33)(82, "label");
      \u0275\u0275text(83, "\u29D7 Dauer (Runden)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(84, "input", 35);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_84_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.durationTurns, $event) || (ctx.durationTurns = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(85, "section", 8)(86, "h3");
      \u0275\u0275text(87, "Eigene Z\xE4hler");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(88, SpellEditorOverlayComponent_Conditional_88_Template, 3, 0, "div", 36);
      \u0275\u0275elementStart(89, "div", 37)(90, "div", 32)(91, "div", 38)(92, "label");
      \u0275\u0275text(93, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(94, "input", 39);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_94_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.name, $event) || (ctx.newCounter.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(95, "div", 40)(96, "label");
      \u0275\u0275text(97, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "input", 19);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_98_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.color, $event) || (ctx.newCounter.color = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(99, "div", 32)(100, "div", 33)(101, "label");
      \u0275\u0275text(102, "Min");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(103, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_103_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.min, $event) || (ctx.newCounter.min = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(104, "div", 33)(105, "label");
      \u0275\u0275text(106, "Max");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(107, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_107_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.max, $event) || (ctx.newCounter.max = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(108, "div", 33)(109, "label");
      \u0275\u0275text(110, "Start");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(111, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function SpellEditorOverlayComponent_Template_input_ngModelChange_111_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.current, $event) || (ctx.newCounter.current = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(112, "button", 42);
      \u0275\u0275listener("click", function SpellEditorOverlayComponent_Template_button_click_112_listener() {
        return ctx.addCounter();
      });
      \u0275\u0275text(113, "+ Z\xE4hler hinzuf\xFCgen");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(114, "section", 8)(115, "h3");
      \u0275\u0275text(116, "Stat-Anforderungen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(117, "div", 43);
      \u0275\u0275repeaterCreate(118, SpellEditorOverlayComponent_For_119_Template, 4, 2, "div", 20, _forTrack04);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(120, "section", 44)(121, "div", 28)(122, "h3");
      \u0275\u0275text(123, "Aktions-Skript");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(124, "p", 45);
      \u0275\u0275text(125, "Skript, das beim Wirken ausgef\xFChrt wird (z.B. ");
      \u0275\u0275elementStart(126, "code");
      \u0275\u0275text(127, "loseResource(mana, costMana)");
      \u0275\u0275elementEnd();
      \u0275\u0275text(128, ").");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(129, "div", 46)(130, "app-script-editor", 47);
      \u0275\u0275listener("valueChange", function SpellEditorOverlayComponent_Template_app_script_editor_valueChange_130_listener($event) {
        return ctx.spellScript = $event;
      });
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275conditionalCreate(131, SpellEditorOverlayComponent_Conditional_131_Template, 13, 0);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(132, SpellEditorOverlayComponent_Conditional_132_Template, 1, 3, "app-spell-node-editor", 48);
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.isNewSpell ? 4 : 5);
      \u0275\u0275advance(3);
      \u0275\u0275classProp("btn-save--done", ctx.savedFeedback)("btn-save--dirty", ctx.isDirty && !ctx.savedFeedback);
      \u0275\u0275property("disabled", ctx.savedFeedback);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.savedFeedback ? "\u2713 Gespeichert!" : "Speichern", " ");
      \u0275\u0275advance(9);
      \u0275\u0275styleProp("border-color", ctx.spellColor)("color", ctx.spellColor);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.spellIcon, " ");
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.iconOptions);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.spellIcon);
      \u0275\u0275advance(4);
      \u0275\u0275repeater(ctx.colorPresets);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.spellColor);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.spellName);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.spellDescription);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.tagOptions);
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.graphRuneNodes.length > 0 ? 50 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.graphNodeCount > 0 ? 53 : -1);
      \u0275\u0275advance(8);
      \u0275\u0275conditional(ctx.lastSimpleEstimate ? 61 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.spellCostMana);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.spellCostFokus);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.perTurnMana);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.perTurnFokus);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.durationTurns);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.counters.length > 0 ? 88 : -1);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.color);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.min);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.max);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.current);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.newCounter.name.trim());
      \u0275\u0275advance(6);
      \u0275\u0275repeater(ctx.statLabels);
      \u0275\u0275advance(12);
      \u0275\u0275property("value", ctx.spellScript);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showCloseDialog ? 131 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showNodeEditor ? 132 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, RangeValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel, SpellNodeEditorComponent, ScriptEditorComponent], styles: ["\n\n.item-editor-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--bg, #1e293b);\n  display: flex;\n  align-items: stretch;\n  justify-content: stretch;\n  z-index: 1600;\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease;\n  overflow: hidden;\n}\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.item-editor-modal[_ngcontent-%COMP%] {\n  background: var(--card, #2d3748);\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  min-height: 0;\n  position: relative;\n}\n.editor-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  flex-shrink: 0;\n}\n.editor-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  color: var(--text, #e5e7eb);\n  font-weight: 600;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  font-size: 1.8rem;\n  cursor: pointer;\n  line-height: 1;\n  padding: 0 4px;\n  transition: color 0.15s;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e5e7eb);\n}\n.btn-save[_ngcontent-%COMP%] {\n  padding: 7px 18px;\n  border-radius: 6px;\n  border: 1px solid var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.12);\n  color: #c4b5fd;\n  font-size: 0.9rem;\n  font-weight: 700;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n  white-space: nowrap;\n}\n.btn-save[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.25);\n}\n.btn-save--dirty[_ngcontent-%COMP%] {\n  border-color: #f59e0b;\n  color: #fcd34d;\n  background: rgba(245, 158, 11, 0.1);\n  animation: _ngcontent-%COMP%_pulse-border 1.5s ease-in-out infinite;\n}\n.btn-save--done[_ngcontent-%COMP%] {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.15);\n  color: #4ade80;\n  cursor: default;\n}\n.btn-close-header[_ngcontent-%COMP%] {\n  padding: 7px 14px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n  white-space: nowrap;\n}\n.btn-close-header[_ngcontent-%COMP%]:hover {\n  border-color: var(--text, #e5e7eb);\n  color: var(--text, #e5e7eb);\n}\n.close-dialog-backdrop[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: inherit;\n  z-index: 200;\n}\n.close-dialog-box[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 12px;\n  padding: 28px 32px;\n  z-index: 201;\n  min-width: 340px;\n  max-width: 90%;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);\n}\n.close-dialog-title[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  margin-bottom: 10px;\n}\n.close-dialog-body[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--text-muted, #9ca3af);\n  margin-bottom: 20px;\n  line-height: 1.5;\n}\n.close-dialog-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  justify-content: flex-end;\n}\n.close-dialog-btn[_ngcontent-%COMP%] {\n  padding: 8px 18px;\n  border-radius: 7px;\n  border: 1px solid var(--border, #4a5568);\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n}\n.close-dialog-save[_ngcontent-%COMP%] {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent);\n  color: #fff;\n}\n.close-dialog-save[_ngcontent-%COMP%]:hover {\n  background: var(--accentdark, #7c3aed);\n}\n.close-dialog-discard[_ngcontent-%COMP%] {\n  background: transparent;\n  color: #fca5a5;\n  border-color: #7f1d1d;\n}\n.close-dialog-discard[_ngcontent-%COMP%]:hover {\n  background: rgba(185, 28, 28, 0.1);\n}\n.close-dialog-cancel[_ngcontent-%COMP%] {\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n}\n.close-dialog-cancel[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.saved-feedback[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: #4ade80;\n  font-weight: 600;\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease;\n}\n.delete-confirm-text[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: #fca5a5;\n  font-weight: 500;\n}\n.editor-content[_ngcontent-%COMP%] {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0;\n  overflow: hidden;\n  min-height: 0;\n}\n.editor-column[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 20px 20px 48px 20px;\n  border-right: 1px solid var(--border, #4a5568);\n  min-height: 0;\n  height: 100%;\n}\n.editor-column[_ngcontent-%COMP%]:last-child {\n  border-right: none;\n}\n.editor-section[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  padding: 16px;\n  border: 1px solid var(--border, #4a5568);\n}\n.editor-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--border, #4a5568);\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-bottom: 10px;\n}\n.form-group[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 500;\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:not([type=color]), \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  padding: 7px 10px;\n  font-size: 0.9rem;\n  font-family: inherit;\n  box-sizing: border-box;\n  outline: none;\n  transition: border-color 0.15s;\n  width: 100%;\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  border-color: var(--accent, #8b5cf6);\n}\n.form-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.form-row[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.form-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.section-header-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n.section-header-row[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  border-bottom: none;\n  padding-bottom: 0;\n}\n.section-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.tag-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.tag-chip[_ngcontent-%COMP%] {\n  padding: 4px 10px;\n  border-radius: 20px;\n  border: 1px solid var(--border, #4a5568);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.tag-chip[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.tag-chip--active[_ngcontent-%COMP%] {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n  color: #fff;\n}\n.rune-edit-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 12px 16px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.92rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.rune-edit-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.12);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);\n}\n.rune-node-count[_ngcontent-%COMP%] {\n  margin-left: auto;\n  font-size: 0.78rem;\n  font-weight: 400;\n  color: var(--text-muted, #9ca3af);\n}\n.cost-schedule[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.cost-case[_ngcontent-%COMP%] {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  padding: 10px 12px;\n}\n.cost-case-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n.cost-case-label-input[_ngcontent-%COMP%] {\n  flex: 1;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid var(--border, #374151);\n  border-radius: 0;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n  font-weight: 600;\n  padding: 3px 0;\n  outline: none;\n}\n.cost-case-label-input[_ngcontent-%COMP%]:focus {\n  border-bottom-color: var(--accent, #8b5cf6);\n}\n.cost-turns[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.cost-turn-row[_ngcontent-%COMP%], \n.add-turn-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.turn-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  min-width: 28px;\n}\n.turn-label--new[_ngcontent-%COMP%] {\n  color: var(--accent, #8b5cf6);\n}\n.turn-field-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.turn-input[_ngcontent-%COMP%] {\n  width: 64px !important;\n  padding: 4px 6px !important;\n  text-align: center;\n  font-size: 0.82rem;\n}\n.add-turn-row[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  padding-top: 6px;\n  border-top: 1px dashed var(--border, #374151);\n}\n.stat-reqs-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}\n.macro-section[_ngcontent-%COMP%] {\n  position: relative;\n}\n.macro-editor-wrap[_ngcontent-%COMP%] {\n  max-height: 60vh;\n  overflow-y: auto;\n  border-radius: 6px;\n}\n.macro-editor-wrap[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 6px;\n}\n.macro-editor-wrap[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--bg);\n}\n.macro-editor-wrap[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 3px;\n}\n.macro-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 12px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n}\n.macro-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n}\n.macro-name[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n}\n.macro-meta[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  margin-left: auto;\n}\n.empty-hint[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n  margin: 0;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  padding: 7px 16px;\n  border-radius: 6px;\n  border: none;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  font-weight: 600;\n  font-size: 0.88rem;\n  cursor: pointer;\n  transition: background 0.15s;\n  font-family: inherit;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  background: var(--accentdark, #7c3aed);\n}\n.btn-danger[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: none;\n  background: #b91c1c;\n  color: #fff;\n  font-size: 0.85rem;\n  cursor: pointer;\n  font-family: inherit;\n}\n.btn-danger[_ngcontent-%COMP%]:hover {\n  background: #dc2626;\n}\n.btn-outline[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-outline[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.btn-outline-danger[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: 1px solid #7f1d1d;\n  background: transparent;\n  color: #fca5a5;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-outline-danger[_ngcontent-%COMP%]:hover {\n  background: rgba(185, 28, 28, 0.1);\n}\n.btn-outline-small[_ngcontent-%COMP%] {\n  padding: 3px 8px;\n  border-radius: 5px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.76rem;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-outline-small[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.btn-outline-small.danger[_ngcontent-%COMP%] {\n  border-color: #7f1d1d;\n  color: #fca5a5;\n}\n.btn-outline-small.danger[_ngcontent-%COMP%]:hover {\n  background: rgba(185, 28, 28, 0.1);\n}\n.btn-accent[_ngcontent-%COMP%] {\n  padding: 5px 10px;\n  border-radius: 5px;\n  border: 1px solid var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.15);\n  color: #c4b5fd;\n  font-size: 0.78rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n  white-space: nowrap;\n  animation: _ngcontent-%COMP%_pulse-border 1.5s ease-in-out infinite;\n  font-family: inherit;\n}\n.btn-accent[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.3);\n}\n@keyframes _ngcontent-%COMP%_pulse-border {\n  0%, 100% {\n    box-shadow: 0 0 3px rgba(139, 92, 246, 0.3);\n  }\n  50% {\n    box-shadow: 0 0 10px rgba(139, 92, 246, 0.7);\n  }\n}\n.add-range-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 3px;\n  padding-top: 5px;\n  border-top: 1px dashed rgba(139, 92, 246, 0.25);\n}\n.turn-input--range[_ngcontent-%COMP%] {\n  width: 44px !important;\n}\n.estimate-popup[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  border-radius: 8px;\n  padding: 12px 14px;\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease;\n}\n.estimate-popup-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 10px;\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n.estimate-cases[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 10px;\n}\n.estimate-case-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.estimate-case-label[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 0.82rem;\n  color: var(--text, #e5e7eb);\n  font-weight: 500;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.estimate-badge[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 2px 7px;\n  border-radius: 10px;\n}\n.estimate-badge.mana[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.2);\n  color: #93c5fd;\n}\n.estimate-badge.fokus[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  color: #c4b5fd;\n}\n.estimate-badge.turns[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.06);\n  color: var(--text-muted, #9ca3af);\n}\n.estimate-popup-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n}\n.btn-accent-small[_ngcontent-%COMP%] {\n  padding: 3px 9px;\n  border-radius: 5px;\n  border: 1px solid rgba(139, 92, 246, 0.5);\n  background: rgba(139, 92, 246, 0.12);\n  color: #c4b5fd;\n  font-size: 0.76rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-accent-small[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.25);\n}\n.btn-icon-sm[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 4px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-icon-sm[_ngcontent-%COMP%]:hover {\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.editor-column[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 6px;\n}\n.editor-column[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--bg, #1e293b);\n}\n.editor-column[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border, #4a5568);\n  border-radius: 3px;\n}\n@media (max-width: 768px) {\n  .editor-content[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    overflow-y: auto;\n  }\n  .editor-column[_ngcontent-%COMP%] {\n    border-right: none;\n    border-bottom: 1px solid var(--border, #374151);\n    overflow-y: visible;\n  }\n}\n.icon-color-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n}\n.spell-preview-badge[_ngcontent-%COMP%] {\n  width: 52px;\n  height: 52px;\n  border-radius: 10px;\n  border: 2px solid #8b5cf6;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.6rem;\n  background: rgba(255, 255, 255, 0.03);\n  flex-shrink: 0;\n  transition: border-color 0.2s, color 0.2s;\n}\n.icon-color-pickers[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.picker-label[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: var(--text-muted, #9ca3af);\n  margin-bottom: 4px;\n}\n.icon-grid-mini[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  margin-bottom: 4px;\n}\n.icon-btn-mini[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  cursor: pointer;\n  font-size: 0.95rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.12s;\n  font-family: inherit;\n}\n.icon-btn-mini[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.15);\n  border-color: #8b5cf6;\n}\n.icon-btn-mini.selected[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.25);\n  border-color: #8b5cf6;\n}\n.icon-text-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 4px 6px;\n  border: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  color: var(--text, #e5e7eb);\n  border-radius: 5px;\n  font-size: 0.8rem;\n  font-family: inherit;\n}\n.color-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  align-items: center;\n  max-width: 100%;\n}\n.color-dot[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  cursor: pointer;\n  transition: transform 0.12s, border-color 0.12s;\n  flex-shrink: 0;\n}\n.color-dot[_ngcontent-%COMP%]:hover {\n  transform: scale(1.2);\n}\n.color-dot.selected[_ngcontent-%COMP%] {\n  border-color: #fff;\n  transform: scale(1.15);\n}\n.color-picker-custom[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 22px;\n  padding: 0;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  background: transparent;\n  cursor: pointer;\n  flex-shrink: 0;\n  -webkit-appearance: none;\n}\n.color-picker-custom[_ngcontent-%COMP%]::-webkit-color-swatch-wrapper {\n  padding: 1px;\n}\n.color-picker-custom[_ngcontent-%COMP%]::-webkit-color-swatch {\n  border-radius: 3px;\n  border: none;\n}\n.cost-range-row[_ngcontent-%COMP%]   .turn-label--range[_ngcontent-%COMP%] {\n  font-weight: 700;\n  color: #a78bfa;\n}\n.add-controls-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-top: 6px;\n  padding-top: 6px;\n  border-top: 1px dashed rgba(255, 255, 255, 0.06);\n}\n.add-branch-row[_ngcontent-%COMP%] {\n  margin-top: 6px;\n  display: flex;\n  justify-content: flex-end;\n}\n.subcases-block[_ngcontent-%COMP%] {\n  margin-top: 8px;\n  padding-top: 8px;\n  border-top: 1px solid rgba(139, 92, 246, 0.2);\n}\n.subcases-header-label[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: rgba(167, 139, 250, 0.7);\n  margin-bottom: 6px;\n}\n.subcase-node[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0;\n  margin-bottom: 8px;\n}\n.subcase-connector[_ngcontent-%COMP%] {\n  font-family: monospace;\n  color: rgba(139, 92, 246, 0.5);\n  font-size: 0.85rem;\n  padding-top: 3px;\n  padding-right: 6px;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.subcase-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  background: rgba(139, 92, 246, 0.04);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 8px;\n  padding: 8px;\n}\n.subcase-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  flex-wrap: wrap;\n  margin-bottom: 6px;\n}\n.condition-select[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  padding: 2px 6px;\n  border-radius: 6px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.1);\n  color: #a78bfa;\n  cursor: pointer;\n  font-family: inherit;\n}\n.subcase-at-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.subcase-add-row[_ngcontent-%COMP%] {\n  flex-direction: row;\n  gap: 4px;\n  border-top: none;\n  padding-top: 4px;\n  margin-top: 4px;\n}\n.btn-tiny[_ngcontent-%COMP%] {\n  font-size: 0.68rem !important;\n  padding: 2px 6px !important;\n}\n.counter-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.counter-item-editable[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  padding: 6px 10px;\n}\n.counter-color-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  width: 14px;\n  height: 14px;\n  flex-shrink: 0;\n}\n.counter-color[_ngcontent-%COMP%] {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.counter-color-input[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  opacity: 0;\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n  padding: 0;\n  border: none;\n}\n.counter-color-input-visible[_ngcontent-%COMP%] {\n  width: 32px !important;\n  height: 28px;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  padding: 0;\n  cursor: pointer;\n  flex-shrink: 0;\n  -webkit-appearance: none;\n}\n.counter-name[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  min-width: 60px;\n  flex-shrink: 0;\n}\n.counter-item-editable[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%] {\n  width: 52px;\n  padding: 3px 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n  font-family: inherit;\n  text-align: center;\n  flex-shrink: 0;\n}\n.counter-item-editable[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 60px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.counter-max-label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-muted, #9ca3af);\n  flex-shrink: 0;\n}\n.add-counter-form[_ngcontent-%COMP%] {\n  padding: 10px;\n  background: var(--card, #2d3748);\n  border-radius: 6px;\n  border: 1px dashed var(--border, #4a5568);\n}\n.add-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-top: 8px;\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: 1px dashed var(--border, #4a5568);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.82rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n  text-align: center;\n}\n.add-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.add-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n.estimate-inline[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 10px;\n  padding: 8px 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n}\n.estimate-pills-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  align-items: center;\n}\n.estimate-stat-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  align-items: center;\n}\n.estimate-stat-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  margin-right: 2px;\n}\n.estimate-pill[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 700;\n  padding: 2px 8px;\n  border-radius: 10px;\n}\n.estimate-pill--mana[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.2);\n  color: #93c5fd;\n}\n.estimate-pill--fokus[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  color: #c4b5fd;\n}\n.estimate-pill--nodes[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.06);\n  color: var(--text-muted, #9ca3af);\n}\n.estimate-pill--stat[_ngcontent-%COMP%] {\n  background: rgba(251, 191, 36, 0.15);\n  color: #fcd34d;\n  font-size: 0.72rem;\n}\n.rune-mini-preview[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  margin-bottom: 10px;\n}\n.rune-mini-chip[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 6px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.08);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n.rune-mini-chip.rune-mini-unknown[_ngcontent-%COMP%] {\n  border-color: rgba(107, 114, 128, 0.4);\n  background: rgba(107, 114, 128, 0.08);\n}\n.rune-mini-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n}\n.rune-mini-glyph[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  font-weight: 800;\n  color: #c4b5fd;\n  line-height: 1;\n}\n.rune-mini-glyph-unknown[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: #6b7280;\n  font-weight: 700;\n}\n.spell-script-host[_ngcontent-%COMP%] {\n  height: 300px;\n}\n/*# sourceMappingURL=spell-editor-overlay.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SpellEditorOverlayComponent, [{
    type: Component,
    args: [{ selector: "app-spell-editor-overlay", standalone: true, imports: [CommonModule, FormsModule, SpellNodeEditorComponent, ScriptEditorComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="item-editor-overlay">
  <div class="item-editor-modal">

    <!-- Header -->
    <div class="editor-header">
      <h2>
        @if (isNewSpell) { Neuen Zauber erstellen }
        @else { {{ spellName || 'Zauber bearbeiten' }} }
      </h2>
      <div class="header-actions">
        <button class="btn-save"
                [class.btn-save--done]="savedFeedback"
                [class.btn-save--dirty]="isDirty && !savedFeedback"
                [disabled]="savedFeedback"
                (click)="onSave()">
          {{ savedFeedback ? '\u2713 Gespeichert!' : 'Speichern' }}
        </button>
        <button class="btn-close-header" (click)="onCancel()" title="Schlie\xDFen">Schlie\xDFen \u2715</button>
      </div>
    </div>

    <!-- Content -->
    <div class="editor-content">

      <!-- Left column: Identity -->
      <div class="editor-column">

        <section class="editor-section">
          <h3>Grundlegendes</h3>

          <!-- Icon + Color row -->
          <div class="form-group icon-color-row">
            <div class="spell-preview-badge" [style.border-color]="spellColor" [style.color]="spellColor">
              {{ spellIcon }}
            </div>
            <div class="icon-color-pickers">
              <div class="picker-label">Icon</div>
              <div class="icon-grid-mini">
                @for (ico of iconOptions; track ico) {
                  <button class="icon-btn-mini"
                    [class.selected]="spellIcon === ico"
                    [style.color]="spellColor"
                    (click)="spellIcon = ico">{{ ico }}</button>
                }
              </div>
              <input type="text" [(ngModel)]="spellIcon" class="icon-text-input" placeholder="Eigenes Symbol" />
              <div class="picker-label" style="margin-top:6px">Farbe</div>
              <div class="color-row">
                @for (c of colorPresets; track c) {
                  <button class="color-dot"
                    [style.background]="c"
                    [class.selected]="spellColor === c"
                    (click)="spellColor = c"></button>
                }
                <input type="color" [(ngModel)]="spellColor" class="color-picker-custom" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Name</label>
            <input type="text" [(ngModel)]="spellName" placeholder="Zaubername..." />
          </div>

          <div class="form-group">
            <label>Beschreibung</label>
            <textarea [(ngModel)]="spellDescription" rows="10"
              placeholder="Was bewirkt dieser Zauber? Effekte, Reichweite, Dauer..."></textarea>
          </div>
        </section>

        <section class="editor-section">
          <h3>Tags</h3>
          <div class="tag-grid">
            @for (tag of tagOptions; track tag) {
              <button class="tag-chip"
                [class.tag-chip--active]="spellTags.includes(tag)"
                (click)="toggleTag(tag)">{{ tag }}</button>
            }
          </div>
        </section>

      </div>

      <!-- Right column: Mechanics -->
      <div class="editor-column">

        <section class="editor-section">
          <h3>Runen</h3>
          @if (graphRuneNodes.length > 0) {
            <div class="rune-mini-preview">
              @for (node of graphRuneNodes; track $index) {
                <div class="rune-mini-chip" [class.rune-mini-unknown]="!node.known" [title]="node.known ? node.runeId : '??? (Rune nicht gelernt)'">
                  @if (node.drawing) {
                    <img class="rune-mini-img" [src]="node.drawing" [alt]="node.runeId" />
                  } @else if (node.known) {
                    <span class="rune-mini-glyph">{{ node.icon }}</span>
                  } @else {
                    <span class="rune-mini-glyph rune-mini-glyph-unknown">???</span>
                  }
                </div>
              }
            </div>
          }
          <button class="rune-edit-btn" (click)="openNodeEditor()">
            Runen bearbeiten
            @if (graphNodeCount > 0) {
              <span class="rune-node-count">{{ graphNodeCount }} Knoten</span>
            }
          </button>
        </section>

        <section class="editor-section">
          <div class="section-header-row">
            <h3>Kosten</h3>
            <div class="section-header-actions">
              <button class="btn-outline-small" (click)="runManualEstimate()" title="Kostensch\xE4tzung aus Runen-Netzwerk">&#9960; Sch\xE4tzen</button>
            </div>
          </div>
          @if (lastSimpleEstimate) {
            <div class="estimate-inline">
              <div class="estimate-pills-row">
                <span class="estimate-pill estimate-pill--mana">&#9670; {{ lastSimpleEstimate.mana }} Mana</span>
                <span class="estimate-pill estimate-pill--fokus">&#9671; {{ lastSimpleEstimate.fokus }} Fokus</span>
                <span class="estimate-pill estimate-pill--nodes">{{ lastSimpleEstimate.nodeCount }} Runen</span>
                <button class="btn-accent-small" (click)="applyEstimate()" title="Gesch\xE4tzte Kosten \xFCbernehmen">\u2193 \xDCbernehmen</button>
              </div>
              @let sreqs = lastSimpleEstimate.statRequirements;
              @if (sreqs.strength || sreqs.dexterity || sreqs.speed || sreqs.intelligence || sreqs.constitution || sreqs.chill) {
                <div class="estimate-stat-row">
                  <span class="estimate-stat-label">Anforderungen:</span>
                  @if (sreqs.strength)      { <span class="estimate-pill estimate-pill--stat">STR {{ sreqs.strength }}</span> }
                  @if (sreqs.dexterity)     { <span class="estimate-pill estimate-pill--stat">GES {{ sreqs.dexterity }}</span> }
                  @if (sreqs.speed)         { <span class="estimate-pill estimate-pill--stat">TEM {{ sreqs.speed }}</span> }
                  @if (sreqs.intelligence)  { <span class="estimate-pill estimate-pill--stat">INT {{ sreqs.intelligence }}</span> }
                  @if (sreqs.constitution)  { <span class="estimate-pill estimate-pill--stat">KON {{ sreqs.constitution }}</span> }
                  @if (sreqs.chill)         { <span class="estimate-pill estimate-pill--stat">CHR {{ sreqs.chill }}</span> }
                </div>
              }
            </div>
          }
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label>&#9670; Mana (Start)</label>
              <input type="number" [(ngModel)]="spellCostMana" min="0" step="0.5" placeholder="0" />
            </div>
            <div class="form-group" style="flex:1">
              <label>&#9671; Fokus (Start)</label>
              <input type="number" [(ngModel)]="spellCostFokus" min="0" step="0.5" placeholder="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label>&#9670; Mana pro Runde</label>
              <input type="number" [(ngModel)]="perTurnMana" min="0" step="0.5" placeholder="0" />
            </div>
            <div class="form-group" style="flex:1">
              <label>&#9671; Fokus pro Runde</label>
              <input type="number" [(ngModel)]="perTurnFokus" min="0" step="0.5" placeholder="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label>&#x29D7; Dauer (Runden)</label>
              <input type="number" [(ngModel)]="durationTurns" min="0" placeholder="0" />
            </div>
          </div>
        </section>

        <section class="editor-section">
          <h3>Eigene Z\xE4hler</h3>
          @if (counters.length > 0) {
            <div class="counter-list">
              @for (counter of counters; track counter.id; let i = $index) {
                <div class="counter-item-editable">
                  <input type="color" [(ngModel)]="counter.color" class="counter-color-input-visible" title="Farbe \xE4ndern" />
                  <span class="counter-name">{{ counter.name }}</span>
                  <input type="number" [(ngModel)]="counter.current" [min]="counter.min" [max]="counter.max" />
                  <input type="range"  [(ngModel)]="counter.current" [min]="counter.min" [max]="counter.max" />
                  <span class="counter-max-label">/ {{ counter.max }}</span>
                  <button class="btn-icon-sm" (click)="removeCounter(i)" title="Entfernen">\xD7</button>
                </div>
              }
            </div>
          }
          <div class="add-counter-form">
            <div class="form-row">
              <div class="form-group" style="flex:2">
                <label>Name</label>
                <input type="text" [(ngModel)]="newCounter.name" placeholder="z.B. Ladungen" />
              </div>
              <div class="form-group counter-color-group">
                <label>Farbe</label>
                <input type="color" [(ngModel)]="newCounter.color" class="color-picker-custom" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" style="flex:1">
                <label>Min</label>
                <input type="number" [(ngModel)]="newCounter.min" />
              </div>
              <div class="form-group" style="flex:1">
                <label>Max</label>
                <input type="number" [(ngModel)]="newCounter.max" />
              </div>
              <div class="form-group" style="flex:1">
                <label>Start</label>
                <input type="number" [(ngModel)]="newCounter.current" />
              </div>
            </div>
            <button class="btn-outline-small add-btn" (click)="addCounter()" [disabled]="!newCounter.name.trim()">+ Z\xE4hler hinzuf\xFCgen</button>
          </div>
        </section>

        <section class="editor-section">
          <h3>Stat-Anforderungen</h3>
          <div class="stat-reqs-grid">
            @for (stat of statLabels; track stat.key) {
              <div class="form-group">
                <label>{{ stat.label }}</label>
                <input type="number" [(ngModel)]="spellStatRequirements[stat.key]" min="0" placeholder="\u2014" />
              </div>
            }
          </div>
        </section>

        <section class="editor-section macro-section">
          <div class="section-header-row">
            <h3>Aktions-Skript</h3>
          </div>
          <p class="empty-hint">Skript, das beim Wirken ausgef\xFChrt wird (z.B. <code>loseResource(mana, costMana)</code>).</p>
          <div class="spell-script-host">
            <app-script-editor
              [value]="spellScript"
              (valueChange)="spellScript = $event">
            </app-script-editor>
          </div>
        </section>

      </div>
    </div>

    <!-- \u2500\u2500 Close confirmation dialog \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->
    @if (showCloseDialog) {
      <div class="close-dialog-backdrop" (click)="onCloseDialogCancel()"></div>
      <div class="close-dialog-box">
        <div class="close-dialog-title">Ungespeicherte \xC4nderungen</div>
        <div class="close-dialog-body">M\xF6chtest du die \xC4nderungen an diesem Zauber speichern?</div>
        <div class="close-dialog-actions">
          <button class="close-dialog-btn close-dialog-save" (click)="onCloseConfirmSave()">Speichern</button>
          <button class="close-dialog-btn close-dialog-discard" (click)="onCloseConfirmDiscard()">Nicht speichern</button>
          <button class="close-dialog-btn close-dialog-cancel" (click)="onCloseDialogCancel()">Abbrechen</button>
        </div>
      </div>
    }
  </div>
</div>

@if (showNodeEditor) {
  <app-spell-node-editor
    [spell]="buildSpellForNodeEditor()"
    [availableRunes]="availableRunes"
    [availableCompanions]="availableCompanions"
    (save)="onNodeEditorSave($event)"
    (cancel)="closeNodeEditor()"
    (estimatedCostResult)="onNodeEditorCostResult($event)"
    (deleteSpell)="closeNodeEditor()">
  </app-spell-node-editor>
}
`, styles: ["/* src/app/sheet/spell-editor-overlay/spell-editor-overlay.component.css */\n.item-editor-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--bg, #1e293b);\n  display: flex;\n  align-items: stretch;\n  justify-content: stretch;\n  z-index: 1600;\n  animation: fadeIn 0.2s ease;\n  overflow: hidden;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.item-editor-modal {\n  background: var(--card, #2d3748);\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  min-height: 0;\n  position: relative;\n}\n.editor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  flex-shrink: 0;\n}\n.editor-header h2 {\n  margin: 0;\n  font-size: 1.25rem;\n  color: var(--text, #e5e7eb);\n  font-weight: 600;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n}\n.close-btn {\n  background: transparent;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  font-size: 1.8rem;\n  cursor: pointer;\n  line-height: 1;\n  padding: 0 4px;\n  transition: color 0.15s;\n}\n.close-btn:hover {\n  color: var(--text, #e5e7eb);\n}\n.btn-save {\n  padding: 7px 18px;\n  border-radius: 6px;\n  border: 1px solid var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.12);\n  color: #c4b5fd;\n  font-size: 0.9rem;\n  font-weight: 700;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n  white-space: nowrap;\n}\n.btn-save:hover {\n  background: rgba(139, 92, 246, 0.25);\n}\n.btn-save--dirty {\n  border-color: #f59e0b;\n  color: #fcd34d;\n  background: rgba(245, 158, 11, 0.1);\n  animation: pulse-border 1.5s ease-in-out infinite;\n}\n.btn-save--done {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.15);\n  color: #4ade80;\n  cursor: default;\n}\n.btn-close-header {\n  padding: 7px 14px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n  white-space: nowrap;\n}\n.btn-close-header:hover {\n  border-color: var(--text, #e5e7eb);\n  color: var(--text, #e5e7eb);\n}\n.close-dialog-backdrop {\n  position: absolute;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: inherit;\n  z-index: 200;\n}\n.close-dialog-box {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 12px;\n  padding: 28px 32px;\n  z-index: 201;\n  min-width: 340px;\n  max-width: 90%;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);\n}\n.close-dialog-title {\n  font-size: 1.1rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  margin-bottom: 10px;\n}\n.close-dialog-body {\n  font-size: 0.9rem;\n  color: var(--text-muted, #9ca3af);\n  margin-bottom: 20px;\n  line-height: 1.5;\n}\n.close-dialog-actions {\n  display: flex;\n  gap: 10px;\n  justify-content: flex-end;\n}\n.close-dialog-btn {\n  padding: 8px 18px;\n  border-radius: 7px;\n  border: 1px solid var(--border, #4a5568);\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n}\n.close-dialog-save {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent);\n  color: #fff;\n}\n.close-dialog-save:hover {\n  background: var(--accentdark, #7c3aed);\n}\n.close-dialog-discard {\n  background: transparent;\n  color: #fca5a5;\n  border-color: #7f1d1d;\n}\n.close-dialog-discard:hover {\n  background: rgba(185, 28, 28, 0.1);\n}\n.close-dialog-cancel {\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n}\n.close-dialog-cancel:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.saved-feedback {\n  font-size: 0.82rem;\n  color: #4ade80;\n  font-weight: 600;\n  animation: fadeIn 0.2s ease;\n}\n.delete-confirm-text {\n  font-size: 0.82rem;\n  color: #fca5a5;\n  font-weight: 500;\n}\n.editor-content {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0;\n  overflow: hidden;\n  min-height: 0;\n}\n.editor-column {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 20px 20px 48px 20px;\n  border-right: 1px solid var(--border, #4a5568);\n  min-height: 0;\n  height: 100%;\n}\n.editor-column:last-child {\n  border-right: none;\n}\n.editor-section {\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  padding: 16px;\n  border: 1px solid var(--border, #4a5568);\n}\n.editor-section h3 {\n  margin: 0 0 12px 0;\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--border, #4a5568);\n}\n.form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-bottom: 10px;\n}\n.form-group:last-child {\n  margin-bottom: 0;\n}\n.form-group label {\n  font-size: 0.82rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 500;\n}\n.form-group input:not([type=color]),\n.form-group textarea,\n.form-group select {\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  padding: 7px 10px;\n  font-size: 0.9rem;\n  font-family: inherit;\n  box-sizing: border-box;\n  outline: none;\n  transition: border-color 0.15s;\n  width: 100%;\n}\n.form-group input:focus,\n.form-group textarea:focus,\n.form-group select:focus {\n  border-color: var(--accent, #8b5cf6);\n}\n.form-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.form-row select,\n.form-row input {\n  flex: 1;\n}\n.section-header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n.section-header-row h3 {\n  margin: 0;\n  border-bottom: none;\n  padding-bottom: 0;\n}\n.section-header-actions {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  flex-wrap: wrap;\n}\n.tag-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.tag-chip {\n  padding: 4px 10px;\n  border-radius: 20px;\n  border: 1px solid var(--border, #4a5568);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.tag-chip:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.tag-chip--active {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n  color: #fff;\n}\n.rune-edit-btn {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 12px 16px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.92rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.rune-edit-btn:hover {\n  background: rgba(139, 92, 246, 0.12);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);\n}\n.rune-node-count {\n  margin-left: auto;\n  font-size: 0.78rem;\n  font-weight: 400;\n  color: var(--text-muted, #9ca3af);\n}\n.cost-schedule {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.cost-case {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  padding: 10px 12px;\n}\n.cost-case-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n.cost-case-label-input {\n  flex: 1;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid var(--border, #374151);\n  border-radius: 0;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n  font-weight: 600;\n  padding: 3px 0;\n  outline: none;\n}\n.cost-case-label-input:focus {\n  border-bottom-color: var(--accent, #8b5cf6);\n}\n.cost-turns {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.cost-turn-row,\n.add-turn-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.turn-label {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  min-width: 28px;\n}\n.turn-label--new {\n  color: var(--accent, #8b5cf6);\n}\n.turn-field-label {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.turn-input {\n  width: 64px !important;\n  padding: 4px 6px !important;\n  text-align: center;\n  font-size: 0.82rem;\n}\n.add-turn-row {\n  margin-top: 4px;\n  padding-top: 6px;\n  border-top: 1px dashed var(--border, #374151);\n}\n.stat-reqs-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}\n.macro-section {\n  position: relative;\n}\n.macro-editor-wrap {\n  max-height: 60vh;\n  overflow-y: auto;\n  border-radius: 6px;\n}\n.macro-editor-wrap::-webkit-scrollbar {\n  width: 6px;\n}\n.macro-editor-wrap::-webkit-scrollbar-track {\n  background: var(--bg);\n}\n.macro-editor-wrap::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 3px;\n}\n.macro-summary {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 12px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n}\n.macro-icon {\n  font-size: 1.2rem;\n}\n.macro-name {\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n}\n.macro-meta {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  margin-left: auto;\n}\n.empty-hint {\n  font-size: 0.8rem;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n  margin: 0;\n}\n.btn-primary {\n  padding: 7px 16px;\n  border-radius: 6px;\n  border: none;\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  font-weight: 600;\n  font-size: 0.88rem;\n  cursor: pointer;\n  transition: background 0.15s;\n  font-family: inherit;\n}\n.btn-primary:hover {\n  background: var(--accentdark, #7c3aed);\n}\n.btn-danger {\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: none;\n  background: #b91c1c;\n  color: #fff;\n  font-size: 0.85rem;\n  cursor: pointer;\n  font-family: inherit;\n}\n.btn-danger:hover {\n  background: #dc2626;\n}\n.btn-outline {\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-outline:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.btn-outline-danger {\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: 1px solid #7f1d1d;\n  background: transparent;\n  color: #fca5a5;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-outline-danger:hover {\n  background: rgba(185, 28, 28, 0.1);\n}\n.btn-outline-small {\n  padding: 3px 8px;\n  border-radius: 5px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.76rem;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-outline-small:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e5e7eb);\n}\n.btn-outline-small.danger {\n  border-color: #7f1d1d;\n  color: #fca5a5;\n}\n.btn-outline-small.danger:hover {\n  background: rgba(185, 28, 28, 0.1);\n}\n.btn-accent {\n  padding: 5px 10px;\n  border-radius: 5px;\n  border: 1px solid var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.15);\n  color: #c4b5fd;\n  font-size: 0.78rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n  white-space: nowrap;\n  animation: pulse-border 1.5s ease-in-out infinite;\n  font-family: inherit;\n}\n.btn-accent:hover {\n  background: rgba(139, 92, 246, 0.3);\n}\n@keyframes pulse-border {\n  0%, 100% {\n    box-shadow: 0 0 3px rgba(139, 92, 246, 0.3);\n  }\n  50% {\n    box-shadow: 0 0 10px rgba(139, 92, 246, 0.7);\n  }\n}\n.add-range-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 3px;\n  padding-top: 5px;\n  border-top: 1px dashed rgba(139, 92, 246, 0.25);\n}\n.turn-input--range {\n  width: 44px !important;\n}\n.estimate-popup {\n  margin-bottom: 16px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  border-radius: 8px;\n  padding: 12px 14px;\n  animation: fadeIn 0.2s ease;\n}\n.estimate-popup-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 10px;\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n.estimate-cases {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 10px;\n}\n.estimate-case-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.estimate-case-label {\n  flex: 1;\n  font-size: 0.82rem;\n  color: var(--text, #e5e7eb);\n  font-weight: 500;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.estimate-badge {\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 2px 7px;\n  border-radius: 10px;\n}\n.estimate-badge.mana {\n  background: rgba(59, 130, 246, 0.2);\n  color: #93c5fd;\n}\n.estimate-badge.fokus {\n  background: rgba(139, 92, 246, 0.2);\n  color: #c4b5fd;\n}\n.estimate-badge.turns {\n  background: rgba(255, 255, 255, 0.06);\n  color: var(--text-muted, #9ca3af);\n}\n.estimate-popup-actions {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n}\n.btn-accent-small {\n  padding: 3px 9px;\n  border-radius: 5px;\n  border: 1px solid rgba(139, 92, 246, 0.5);\n  background: rgba(139, 92, 246, 0.12);\n  color: #c4b5fd;\n  font-size: 0.76rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-accent-small:hover {\n  background: rgba(139, 92, 246, 0.25);\n}\n.btn-icon-sm {\n  width: 22px;\n  height: 22px;\n  border-radius: 4px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  transition: all 0.15s;\n  font-family: inherit;\n}\n.btn-icon-sm:hover {\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.editor-column::-webkit-scrollbar {\n  width: 6px;\n}\n.editor-column::-webkit-scrollbar-track {\n  background: var(--bg, #1e293b);\n}\n.editor-column::-webkit-scrollbar-thumb {\n  background: var(--border, #4a5568);\n  border-radius: 3px;\n}\n@media (max-width: 768px) {\n  .editor-content {\n    grid-template-columns: 1fr;\n    overflow-y: auto;\n  }\n  .editor-column {\n    border-right: none;\n    border-bottom: 1px solid var(--border, #374151);\n    overflow-y: visible;\n  }\n}\n.icon-color-row {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n}\n.spell-preview-badge {\n  width: 52px;\n  height: 52px;\n  border-radius: 10px;\n  border: 2px solid #8b5cf6;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.6rem;\n  background: rgba(255, 255, 255, 0.03);\n  flex-shrink: 0;\n  transition: border-color 0.2s, color 0.2s;\n}\n.icon-color-pickers {\n  flex: 1;\n  min-width: 0;\n}\n.picker-label {\n  font-size: 0.65rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: var(--text-muted, #9ca3af);\n  margin-bottom: 4px;\n}\n.icon-grid-mini {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  margin-bottom: 4px;\n}\n.icon-btn-mini {\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  cursor: pointer;\n  font-size: 0.95rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.12s;\n  font-family: inherit;\n}\n.icon-btn-mini:hover {\n  background: rgba(139, 92, 246, 0.15);\n  border-color: #8b5cf6;\n}\n.icon-btn-mini.selected {\n  background: rgba(139, 92, 246, 0.25);\n  border-color: #8b5cf6;\n}\n.icon-text-input {\n  width: 100%;\n  padding: 4px 6px;\n  border: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  color: var(--text, #e5e7eb);\n  border-radius: 5px;\n  font-size: 0.8rem;\n  font-family: inherit;\n}\n.color-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  align-items: center;\n  max-width: 100%;\n}\n.color-dot {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  cursor: pointer;\n  transition: transform 0.12s, border-color 0.12s;\n  flex-shrink: 0;\n}\n.color-dot:hover {\n  transform: scale(1.2);\n}\n.color-dot.selected {\n  border-color: #fff;\n  transform: scale(1.15);\n}\n.color-picker-custom {\n  width: 28px;\n  height: 22px;\n  padding: 0;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  background: transparent;\n  cursor: pointer;\n  flex-shrink: 0;\n  -webkit-appearance: none;\n}\n.color-picker-custom::-webkit-color-swatch-wrapper {\n  padding: 1px;\n}\n.color-picker-custom::-webkit-color-swatch {\n  border-radius: 3px;\n  border: none;\n}\n.cost-range-row .turn-label--range {\n  font-weight: 700;\n  color: #a78bfa;\n}\n.add-controls-row {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-top: 6px;\n  padding-top: 6px;\n  border-top: 1px dashed rgba(255, 255, 255, 0.06);\n}\n.add-branch-row {\n  margin-top: 6px;\n  display: flex;\n  justify-content: flex-end;\n}\n.subcases-block {\n  margin-top: 8px;\n  padding-top: 8px;\n  border-top: 1px solid rgba(139, 92, 246, 0.2);\n}\n.subcases-header-label {\n  font-size: 0.62rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: rgba(167, 139, 250, 0.7);\n  margin-bottom: 6px;\n}\n.subcase-node {\n  display: flex;\n  gap: 0;\n  margin-bottom: 8px;\n}\n.subcase-connector {\n  font-family: monospace;\n  color: rgba(139, 92, 246, 0.5);\n  font-size: 0.85rem;\n  padding-top: 3px;\n  padding-right: 6px;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.subcase-body {\n  flex: 1;\n  min-width: 0;\n  background: rgba(139, 92, 246, 0.04);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 8px;\n  padding: 8px;\n}\n.subcase-meta {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  flex-wrap: wrap;\n  margin-bottom: 6px;\n}\n.condition-select {\n  font-size: 0.65rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  padding: 2px 6px;\n  border-radius: 6px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.1);\n  color: #a78bfa;\n  cursor: pointer;\n  font-family: inherit;\n}\n.subcase-at-label {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.subcase-add-row {\n  flex-direction: row;\n  gap: 4px;\n  border-top: none;\n  padding-top: 4px;\n  margin-top: 4px;\n}\n.btn-tiny {\n  font-size: 0.68rem !important;\n  padding: 2px 6px !important;\n}\n.counter-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.counter-item-editable {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  padding: 6px 10px;\n}\n.counter-color-wrap {\n  position: relative;\n  width: 14px;\n  height: 14px;\n  flex-shrink: 0;\n}\n.counter-color {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.counter-color-input {\n  position: absolute;\n  inset: 0;\n  opacity: 0;\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n  padding: 0;\n  border: none;\n}\n.counter-color-input-visible {\n  width: 32px !important;\n  height: 28px;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  padding: 0;\n  cursor: pointer;\n  flex-shrink: 0;\n  -webkit-appearance: none;\n}\n.counter-name {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  min-width: 60px;\n  flex-shrink: 0;\n}\n.counter-item-editable input[type=number] {\n  width: 52px;\n  padding: 3px 6px;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n  font-family: inherit;\n  text-align: center;\n  flex-shrink: 0;\n}\n.counter-item-editable input[type=range] {\n  flex: 1;\n  min-width: 60px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.counter-max-label {\n  font-size: 0.8rem;\n  color: var(--text-muted, #9ca3af);\n  flex-shrink: 0;\n}\n.add-counter-form {\n  padding: 10px;\n  background: var(--card, #2d3748);\n  border-radius: 6px;\n  border: 1px dashed var(--border, #4a5568);\n}\n.add-btn {\n  width: 100%;\n  margin-top: 8px;\n  padding: 6px 12px;\n  border-radius: 6px;\n  border: 1px dashed var(--border, #4a5568);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.82rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: inherit;\n  text-align: center;\n}\n.add-btn:hover:not(:disabled) {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.add-btn:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n.estimate-inline {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 10px;\n  padding: 8px 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n}\n.estimate-pills-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  align-items: center;\n}\n.estimate-stat-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  align-items: center;\n}\n.estimate-stat-label {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  margin-right: 2px;\n}\n.estimate-pill {\n  font-size: 0.78rem;\n  font-weight: 700;\n  padding: 2px 8px;\n  border-radius: 10px;\n}\n.estimate-pill--mana {\n  background: rgba(59, 130, 246, 0.2);\n  color: #93c5fd;\n}\n.estimate-pill--fokus {\n  background: rgba(139, 92, 246, 0.2);\n  color: #c4b5fd;\n}\n.estimate-pill--nodes {\n  background: rgba(255, 255, 255, 0.06);\n  color: var(--text-muted, #9ca3af);\n}\n.estimate-pill--stat {\n  background: rgba(251, 191, 36, 0.15);\n  color: #fcd34d;\n  font-size: 0.72rem;\n}\n.rune-mini-preview {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  margin-bottom: 10px;\n}\n.rune-mini-chip {\n  width: 36px;\n  height: 36px;\n  border-radius: 6px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.08);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n.rune-mini-chip.rune-mini-unknown {\n  border-color: rgba(107, 114, 128, 0.4);\n  background: rgba(107, 114, 128, 0.08);\n}\n.rune-mini-img {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n}\n.rune-mini-glyph {\n  font-size: 1.1rem;\n  font-weight: 800;\n  color: #c4b5fd;\n  line-height: 1;\n}\n.rune-mini-glyph-unknown {\n  font-size: 0.65rem;\n  color: #6b7280;\n  font-weight: 700;\n}\n.spell-script-host {\n  height: 300px;\n}\n/*# sourceMappingURL=spell-editor-overlay.component.css.map */\n"] }]
  }], null, { spell: [{
    type: Input
  }], availableRunes: [{
    type: Input
  }], availableCompanions: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }], deleteSpell: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SpellEditorOverlayComponent, { className: "SpellEditorOverlayComponent", filePath: "app/sheet/spell-editor-overlay/spell-editor-overlay.component.ts", lineNumber: 28 });
})();

// src/app/sheet/item-editor/item-editor.component.ts
var _c03 = () => [];
function ItemEditorComponent_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 9)(1, "label");
    \u0275\u0275text(2, "Anzahl");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 60);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Conditional_31_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.amount, $event) || (ctx_r1.editItem.amount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.amount);
  }
}
function ItemEditorComponent_div_68_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 61)(1, "div", 9)(2, "label");
    \u0275\u0275text(3, "Effizienz (Schadenswert)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 62);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_68_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.efficiency, $event) || (ctx_r1.editItem.efficiency = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.efficiency);
  }
}
function ItemEditorComponent_div_69_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 61)(1, "div", 9)(2, "label");
    \u0275\u0275text(3, "R\xFCstungsteil");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "select", 63);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_69_Template_select_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.armorType, $event) || (ctx_r1.editItem.armorType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(5, "option", 64);
    \u0275\u0275text(6, "Helm");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "option", 64);
    \u0275\u0275text(8, "Brustpanzer");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "option", 64);
    \u0275\u0275text(10, "Armschienen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "option", 64);
    \u0275\u0275text(12, "Beinschienen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "option", 64);
    \u0275\u0275text(14, "Stiefel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "option", 64);
    \u0275\u0275text(16, "Extra");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(17, "div", 11)(18, "div", 9)(19, "label");
    \u0275\u0275text(20, "Stabilit\xE4t (Schutzwert)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "input", 65);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_69_Template_input_ngModelChange_21_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.stability, $event) || (ctx_r1.editItem.stability = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "div", 9)(23, "label");
    \u0275\u0275text(24, "R\xFCstungsmalus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "input", 13);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_69_Template_input_ngModelChange_25_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.armorDebuff, $event) || (ctx_r1.editItem.armorDebuff = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.armorType);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", "helmet");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", "chestplate");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", "armschienen");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", "leggings");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", "boots");
    \u0275\u0275advance(2);
    \u0275\u0275property("ngValue", "extra");
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.stability);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.armorDebuff);
  }
}
function ItemEditorComponent_div_78_span_20_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Waffe gibt -2 W\xFCrfelmalus");
    \u0275\u0275elementEnd();
  }
}
function ItemEditorComponent_div_78_span_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "R\xFCstung gibt +5 R\xFCstungsmalus");
    \u0275\u0275elementEnd();
  }
}
function ItemEditorComponent_div_78_span_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Gegenstand unbrauchbar");
    \u0275\u0275elementEnd();
  }
}
function ItemEditorComponent_div_78_div_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "label", 75)(2, "input", 16);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_78_div_23_Template_input_ngModelChange_2_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.broken, $event) || (ctx_r1.editItem.broken = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4, "Zerbrochen");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.broken);
  }
}
function ItemEditorComponent_div_78_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 66)(1, "div", 9)(2, "label");
    \u0275\u0275text(3, "Maximum");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 67);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_78_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.maxDurability, $event) || (ctx_r1.editItem.maxDurability = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 68)(6, "span", 69);
    \u0275\u0275text(7, "Aktuell");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 70);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_78_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.durability, $event) || (ctx_r1.editItem.durability = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 71);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_78_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editItem.durability, $event) || (ctx_r1.editItem.durability = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 69);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 72)(13, "p")(14, "strong");
    \u0275\u0275text(15, "Bruchtest:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(16, " Wenn Haltbarkeit auf 0 f\xE4llt, wird W20 gew\xFCrfelt. Modifikator: -5 + (100-Haltbarkeit)/10 ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "p")(18, "strong");
    \u0275\u0275text(19, "Bei Bruch:");
    \u0275\u0275elementEnd();
    \u0275\u0275template(20, ItemEditorComponent_div_78_span_20_Template, 2, 0, "span", 73)(21, ItemEditorComponent_div_78_span_21_Template, 2, 0, "span", 73)(22, ItemEditorComponent_div_78_span_22_Template, 2, 0, "span", 73);
    \u0275\u0275elementEnd()();
    \u0275\u0275template(23, ItemEditorComponent_div_78_div_23_Template, 5, 1, "div", 74);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.maxDurability);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.durability);
    \u0275\u0275property("max", ctx_r1.editItem.maxDurability || 100);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editItem.durability);
    \u0275\u0275property("max", ctx_r1.editItem.maxDurability || 100);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("/ ", ctx_r1.editItem.maxDurability || 100);
    \u0275\u0275advance(9);
    \u0275\u0275property("ngIf", ctx_r1.editItem.itemType === "weapon");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.editItem.itemType === "armor");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.editItem.itemType === "other");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.editItem.hasDurability);
  }
}
function ItemEditorComponent_div_151_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 78);
    \u0275\u0275element(1, "div", 79);
    \u0275\u0275elementStart(2, "span", 80);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 81);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_151_div_1_Template_input_ngModelChange_4_listener($event) {
      const counter_r8 = \u0275\u0275restoreView(_r7).$implicit;
      \u0275\u0275twoWayBindingSet(counter_r8.current, $event) || (counter_r8.current = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 82);
    \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_div_151_div_1_Template_input_ngModelChange_5_listener($event) {
      const counter_r8 = \u0275\u0275restoreView(_r7).$implicit;
      \u0275\u0275twoWayBindingSet(counter_r8.current, $event) || (counter_r8.current = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 83);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 84);
    \u0275\u0275listener("click", function ItemEditorComponent_div_151_div_1_Template_button_click_8_listener() {
      const i_r9 = \u0275\u0275restoreView(_r7).index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeCounter(i_r9));
    });
    \u0275\u0275text(9, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const counter_r8 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-color", counter_r8.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(counter_r8.name);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", counter_r8.current);
    \u0275\u0275property("min", counter_r8.min)("max", counter_r8.max);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", counter_r8.current);
    \u0275\u0275property("min", counter_r8.min)("max", counter_r8.max);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("/ ", counter_r8.max);
  }
}
function ItemEditorComponent_div_151_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76);
    \u0275\u0275template(1, ItemEditorComponent_div_151_div_1_Template, 10, 10, "div", 77);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.editItem.counters);
  }
}
function ItemEditorComponent_option_162_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 85);
    \u0275\u0275text(1, " \u25CF ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const color_r10 = ctx.$implicit;
    \u0275\u0275styleProp("background-color", color_r10);
    \u0275\u0275property("value", color_r10);
  }
}
function ItemEditorComponent_div_183_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 88)(1, "span", 89);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 90);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 84);
    \u0275\u0275listener("click", function ItemEditorComponent_div_183_div_1_Template_button_click_5_listener() {
      const i_r12 = \u0275\u0275restoreView(_r11).index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeDiceBonus(i_r12));
    });
    \u0275\u0275text(6, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const bonus_r13 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(bonus_r13.name);
    \u0275\u0275advance();
    \u0275\u0275classMap(ctx_r1.getDiceBonusClass(bonus_r13.value));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.formatDiceBonusValue(bonus_r13.value), " ");
  }
}
function ItemEditorComponent_div_183_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 86);
    \u0275\u0275template(1, ItemEditorComponent_div_183_div_1_Template, 7, 4, "div", 87);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("ngForOf", ctx_r1.editItem.diceBonuses);
  }
}
function ItemEditorComponent_Conditional_199_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 92);
    \u0275\u0275listener("contextmenu", function ItemEditorComponent_Conditional_199_For_2_Template_div_contextmenu_0_listener($event) {
      const \u0275$index_510_r15 = \u0275\u0275restoreView(_r14).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      $event.preventDefault();
      return \u0275\u0275resetView(ctx_r1.openSkillEditor(\u0275$index_510_r15));
    });
    \u0275\u0275elementStart(1, "div", 93)(2, "span", 94);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 95);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 96)(7, "button", 97);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_199_For_2_Template_button_click_7_listener() {
      const \u0275$index_510_r15 = \u0275\u0275restoreView(_r14).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSkillEditor(\u0275$index_510_r15));
    });
    \u0275\u0275element(8, "span", 98);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 99);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_199_For_2_Template_button_click_9_listener() {
      const \u0275$index_510_r15 = \u0275\u0275restoreView(_r14).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.deleteEmbeddedSkill(\u0275$index_510_r15));
    });
    \u0275\u0275text(10, "\xD7");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const skill_r16 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(skill_r16.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(skill_r16.type);
  }
}
function ItemEditorComponent_Conditional_199_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275repeaterCreate(1, ItemEditorComponent_Conditional_199_For_2_Template, 11, 2, "div", 91, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.editItem.embeddedSkills);
  }
}
function ItemEditorComponent_Conditional_203_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 85);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r18 = ctx.$implicit;
    const $index_r19 = ctx.$index;
    \u0275\u0275property("value", $index_r19);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(skill_r18.name);
  }
}
function ItemEditorComponent_Conditional_203_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 52)(1, "select", null, 0)(3, "option", 100);
    \u0275\u0275text(4, "Aus Bibliothek...");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(5, ItemEditorComponent_Conditional_203_For_6_Template, 2, 2, "option", 85, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 101);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_203_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r17);
      const skillSelect_r20 = \u0275\u0275reference(2);
      const ctx_r1 = \u0275\u0275nextContext();
      skillSelect_r20.value && ctx_r1.importSkillFromLibrary(ctx_r1.librarySkills[+skillSelect_r20.value]);
      return \u0275\u0275resetView(skillSelect_r20.value = "");
    });
    \u0275\u0275text(8, " Importieren ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const skillSelect_r20 = \u0275\u0275reference(2);
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.librarySkills);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", !skillSelect_r20.value);
  }
}
function ItemEditorComponent_Conditional_207_For_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 102);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r23 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(spell_r23.tags.join(", "));
  }
}
function ItemEditorComponent_Conditional_207_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 92);
    \u0275\u0275listener("contextmenu", function ItemEditorComponent_Conditional_207_For_2_Template_div_contextmenu_0_listener($event) {
      const \u0275$index_558_r22 = \u0275\u0275restoreView(_r21).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      $event.preventDefault();
      return \u0275\u0275resetView(ctx_r1.openSpellEditor(\u0275$index_558_r22));
    });
    \u0275\u0275elementStart(1, "div", 93)(2, "span", 94);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, ItemEditorComponent_Conditional_207_For_2_Conditional_4_Template, 2, 1, "span", 102);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 96)(6, "button", 97);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_207_For_2_Template_button_click_6_listener() {
      const \u0275$index_558_r22 = \u0275\u0275restoreView(_r21).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSpellEditor(\u0275$index_558_r22));
    });
    \u0275\u0275element(7, "span", 98);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 99);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_207_For_2_Template_button_click_8_listener() {
      const \u0275$index_558_r22 = \u0275\u0275restoreView(_r21).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.deleteEmbeddedSpell(\u0275$index_558_r22));
    });
    \u0275\u0275text(9, "\xD7");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const spell_r23 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(spell_r23.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(spell_r23.tags && spell_r23.tags.length > 0 ? 4 : -1);
  }
}
function ItemEditorComponent_Conditional_207_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 49);
    \u0275\u0275repeaterCreate(1, ItemEditorComponent_Conditional_207_For_2_Template, 10, 2, "div", 91, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.editItem.embeddedSpells);
  }
}
function ItemEditorComponent_Conditional_211_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 85);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r25 = ctx.$implicit;
    const $index_r26 = ctx.$index;
    \u0275\u0275property("value", $index_r26);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(spell_r25.name);
  }
}
function ItemEditorComponent_Conditional_211_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 52)(1, "select", null, 1)(3, "option", 100);
    \u0275\u0275text(4, "Aus Bibliothek...");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(5, ItemEditorComponent_Conditional_211_For_6_Template, 2, 2, "option", 85, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 101);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_211_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r24);
      const spellSelect_r27 = \u0275\u0275reference(2);
      const ctx_r1 = \u0275\u0275nextContext();
      spellSelect_r27.value && ctx_r1.importSpellFromLibrary(ctx_r1.librarySpells[+spellSelect_r27.value]);
      return \u0275\u0275resetView(spellSelect_r27.value = "");
    });
    \u0275\u0275text(8, " Importieren ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const spellSelect_r27 = \u0275\u0275reference(2);
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.librarySpells);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", !spellSelect_r27.value);
  }
}
function ItemEditorComponent_Conditional_219_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 103);
    \u0275\u0275listener("click", function ItemEditorComponent_Conditional_219_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.deleteItem());
    });
    \u0275\u0275text(1, "L\xF6schen");
    \u0275\u0275elementEnd();
  }
}
function ItemEditorComponent_Conditional_224_Template(rf, ctx) {
  if (rf & 1) {
    const _r29 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-skill-editor", 104);
    \u0275\u0275listener("save", function ItemEditorComponent_Conditional_224_Template_app_skill_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r29);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveSkill($event));
    })("cancel", function ItemEditorComponent_Conditional_224_Template_app_skill_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r29);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeSkillEditor());
    })("delete", function ItemEditorComponent_Conditional_224_Template_app_skill_editor_delete_0_listener() {
      \u0275\u0275restoreView(_r29);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.editingSkillIndex !== null ? ctx_r1.deleteEmbeddedSkill(ctx_r1.editingSkillIndex) : null;
      return \u0275\u0275resetView(ctx_r1.closeSkillEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("skill", ctx_r1.editingSkill);
  }
}
function ItemEditorComponent_Conditional_225_Template(rf, ctx) {
  if (rf & 1) {
    const _r30 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-spell-editor-overlay", 105);
    \u0275\u0275listener("save", function ItemEditorComponent_Conditional_225_Template_app_spell_editor_overlay_save_0_listener($event) {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveSpell($event));
    })("cancel", function ItemEditorComponent_Conditional_225_Template_app_spell_editor_overlay_cancel_0_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.closeSpellEditor());
    })("deleteSpell", function ItemEditorComponent_Conditional_225_Template_app_spell_editor_overlay_deleteSpell_0_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.editingSpellIndex !== null ? ctx_r1.deleteEmbeddedSpell(ctx_r1.editingSpellIndex) : null;
      return \u0275\u0275resetView(ctx_r1.closeSpellEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("spell", ctx_r1.editingSpell)("availableRunes", \u0275\u0275pureFunction0(2, _c03));
  }
}
var ItemEditorComponent = class _ItemEditorComponent {
  item = null;
  // null = creating new item
  sheet;
  availableSkills = [];
  availableSpells = [];
  librarySkills = [];
  // Full library skills for world view
  librarySpells = [];
  // Full library spells for world view
  showLibraryImport = false;
  // Whether to show library import options
  save = new EventEmitter();
  cancel = new EventEmitter();
  delete = new EventEmitter();
  // Working copy of the item
  editItem;
  isNewItem = true;
  // Stat modifier UI state
  statModifiers = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    constitution: 0,
    chill: 0,
    mana: 0,
    life: 0,
    energy: 0
  };
  // Counter being added
  newCounter = {
    id: "",
    name: "",
    min: 0,
    max: 100,
    current: 0,
    color: "#22c55e"
  };
  // Dice bonus being added
  newDiceBonus = {
    name: "",
    value: 0
  };
  // Skill/Spell selection
  selectedSkillId = "";
  selectedSpellId = "";
  // Sub-editor state for embedded skills/spells
  showSkillEditor = false;
  editingSkillIndex = null;
  editingSkill = null;
  showSpellEditor = false;
  editingSpellIndex = null;
  editingSpell = null;
  // Available colors for counters
  counterColors = [
    "#22c55e",
    // Green
    "#3b82f6",
    // Blue
    "#ef4444",
    // Red
    "#f59e0b",
    // Orange
    "#8b5cf6",
    // Purple
    "#ec4899",
    // Pink
    "#14b8a6",
    // Teal
    "#6b7280"
    // Gray
  ];
  ngOnInit() {
    if (this.item) {
      this.editItem = JSON.parse(JSON.stringify(this.item));
      this.isNewItem = false;
      if (this.editItem.statModifiers) {
        for (const mod of this.editItem.statModifiers) {
          this.statModifiers[mod.stat] = mod.amount;
        }
      }
    } else {
      this.editItem = this.createEmptyItem();
      this.isNewItem = true;
    }
    if (!this.editItem.counters)
      this.editItem.counters = [];
    if (!this.editItem.diceBonuses)
      this.editItem.diceBonuses = [];
    if (!this.editItem.attachedSkills)
      this.editItem.attachedSkills = [];
    if (!this.editItem.attachedSpells)
      this.editItem.attachedSpells = [];
    if (!this.editItem.requirements)
      this.editItem.requirements = {};
  }
  createEmptyItem() {
    return {
      id: this.generateId(),
      name: "",
      description: "",
      weight: 0,
      stackable: false,
      amount: 1,
      itemType: "other",
      lost: false,
      broken: false,
      isIdentified: false,
      // New items default to unidentified
      requirements: {},
      hasDurability: false,
      counters: [],
      diceBonuses: [],
      attachedSkills: [],
      attachedSpells: [],
      statModifiers: []
    };
  }
  generateId() {
    return "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
  // === Item Type Methods ===
  setItemType(type) {
    this.editItem.itemType = type;
    if (type === "weapon") {
      if (this.editItem.efficiency === void 0)
        this.editItem.efficiency = 10;
    } else if (type === "armor") {
      if (this.editItem.stability === void 0)
        this.editItem.stability = 10;
      if (this.editItem.armorDebuff === void 0)
        this.editItem.armorDebuff = 0;
    }
  }
  // === Durability Methods ===
  toggleDurability() {
    this.editItem.hasDurability = !this.editItem.hasDurability;
    if (this.editItem.hasDurability) {
      this.editItem.durability = 100;
      this.editItem.maxDurability = 100;
    } else {
      this.editItem.durability = void 0;
      this.editItem.maxDurability = void 0;
    }
  }
  // === Counter Methods ===
  addCounter() {
    if (!this.newCounter.name.trim())
      return;
    const counter = {
      id: "counter_" + Date.now(),
      name: this.newCounter.name,
      min: this.newCounter.min,
      max: this.newCounter.max,
      current: this.newCounter.current,
      color: this.newCounter.color
    };
    this.editItem.counters.push(counter);
    this.newCounter = {
      id: "",
      name: "",
      min: 0,
      max: 100,
      current: 0,
      color: "#22c55e"
    };
  }
  removeCounter(index) {
    this.editItem.counters.splice(index, 1);
  }
  // === Dice Bonus Methods ===
  addDiceBonus() {
    if (!this.newDiceBonus.name.trim())
      return;
    this.editItem.diceBonuses.push({
      name: this.newDiceBonus.name,
      value: this.newDiceBonus.value
    });
    this.newDiceBonus = { name: "", value: 0 };
  }
  removeDiceBonus(index) {
    this.editItem.diceBonuses.splice(index, 1);
  }
  // === Skill/Spell Attachment Methods ===
  attachSkill() {
    if (!this.selectedSkillId)
      return;
    const skill = this.availableSkills.find((s) => s.id === this.selectedSkillId);
    if (skill && !this.editItem.attachedSkills.some((s) => s.skillId === skill.id)) {
      this.editItem.attachedSkills.push({
        skillId: skill.id,
        skillName: skill.name
      });
    }
    this.selectedSkillId = "";
  }
  removeAttachedSkill(index) {
    this.editItem.attachedSkills.splice(index, 1);
  }
  attachSpell() {
    if (!this.selectedSpellId)
      return;
    const spell = this.availableSpells.find((s) => s.id === this.selectedSpellId);
    if (spell && !this.editItem.attachedSpells.some((s) => s.spellId === spell.id)) {
      this.editItem.attachedSpells.push({
        spellId: spell.id,
        spellName: spell.name
      });
    }
    this.selectedSpellId = "";
  }
  removeAttachedSpell(index) {
    this.editItem.attachedSpells.splice(index, 1);
  }
  // === Embedded Skill Methods ===
  openSkillEditor(index = null) {
    if (index !== null && this.editItem.embeddedSkills && this.editItem.embeddedSkills[index]) {
      this.editingSkillIndex = index;
      this.editingSkill = this.editItem.embeddedSkills[index];
    } else {
      this.editingSkillIndex = null;
      this.editingSkill = null;
    }
    this.showSkillEditor = true;
  }
  closeSkillEditor() {
    this.showSkillEditor = false;
    this.editingSkillIndex = null;
    this.editingSkill = null;
  }
  saveSkill(skill) {
    if (!this.editItem.embeddedSkills) {
      this.editItem.embeddedSkills = [];
    }
    if (this.editingSkillIndex !== null) {
      this.editItem.embeddedSkills[this.editingSkillIndex] = skill;
    } else {
      this.editItem.embeddedSkills.push(skill);
    }
    this.closeSkillEditor();
  }
  deleteEmbeddedSkill(index) {
    if (this.editItem.embeddedSkills) {
      this.editItem.embeddedSkills.splice(index, 1);
    }
  }
  // === Embedded Spell Methods ===
  openSpellEditor(index = null) {
    if (index !== null && this.editItem.embeddedSpells && this.editItem.embeddedSpells[index]) {
      this.editingSpellIndex = index;
      this.editingSpell = this.editItem.embeddedSpells[index];
    } else {
      this.editingSpellIndex = null;
      this.editingSpell = null;
    }
    this.showSpellEditor = true;
  }
  closeSpellEditor() {
    this.showSpellEditor = false;
    this.editingSpellIndex = null;
    this.editingSpell = null;
  }
  saveSpell(spell) {
    if (!this.editItem.embeddedSpells) {
      this.editItem.embeddedSpells = [];
    }
    if (this.editingSpellIndex !== null) {
      this.editItem.embeddedSpells[this.editingSpellIndex] = spell;
    } else {
      this.editItem.embeddedSpells.push(spell);
    }
    this.closeSpellEditor();
  }
  deleteEmbeddedSpell(index) {
    if (this.editItem.embeddedSpells) {
      this.editItem.embeddedSpells.splice(index, 1);
    }
  }
  // === Library Import Methods ===
  importSkillFromLibrary(librarySkill) {
    if (!this.editItem.embeddedSkills) {
      this.editItem.embeddedSkills = [];
    }
    const imported = JSON.parse(JSON.stringify(librarySkill));
    imported.enlightened = true;
    this.editItem.embeddedSkills.push(imported);
  }
  importSpellFromLibrary(librarySpell) {
    if (!this.editItem.embeddedSpells) {
      this.editItem.embeddedSpells = [];
    }
    const imported = JSON.parse(JSON.stringify(librarySpell));
    imported.binding = { type: "item", itemName: this.editItem.name };
    this.editItem.embeddedSpells.push(imported);
  }
  // === Stat Requirements Helpers ===
  hasRequirements() {
    if (!this.editItem.requirements)
      return false;
    const reqs = this.editItem.requirements;
    return !!(reqs.strength || reqs.dexterity || reqs.speed || reqs.intelligence || reqs.constitution || reqs.chill);
  }
  // === Save/Cancel ===
  saveItem() {
    if (!this.editItem.name.trim()) {
      alert("Gegenstandsname ist erforderlich");
      return;
    }
    const modifiers = [];
    for (const [stat, amount] of Object.entries(this.statModifiers)) {
      if (amount !== 0) {
        modifiers.push({
          stat,
          amount
        });
      }
    }
    this.editItem.statModifiers = modifiers.length > 0 ? modifiers : void 0;
    if (this.editItem.counters?.length === 0)
      this.editItem.counters = void 0;
    if (this.editItem.diceBonuses?.length === 0)
      this.editItem.diceBonuses = void 0;
    if (this.editItem.attachedSkills?.length === 0)
      this.editItem.attachedSkills = void 0;
    if (this.editItem.attachedSpells?.length === 0)
      this.editItem.attachedSpells = void 0;
    const reqs = this.editItem.requirements;
    if (reqs && !reqs.strength && !reqs.dexterity && !reqs.speed && !reqs.intelligence && !reqs.constitution && !reqs.chill) {
      this.editItem.requirements = {};
    }
    this.save.emit(this.editItem);
  }
  cancelEdit() {
    this.cancel.emit();
  }
  deleteItem() {
    if (confirm("Item wirklich l\xF6schen?")) {
      this.delete.emit();
    }
  }
  // === Helpers ===
  getDiceBonusClass(value) {
    if (value < 0)
      return "bonus-good";
    if (value > 0)
      return "bonus-bad";
    return "";
  }
  formatDiceBonusValue(value) {
    if (value > 0)
      return "+" + value;
    return String(value);
  }
  static \u0275fac = function ItemEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ItemEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ItemEditorComponent, selectors: [["app-item-editor"]], inputs: { item: "item", sheet: "sheet", availableSkills: "availableSkills", availableSpells: "availableSpells", librarySkills: "librarySkills", librarySpells: "librarySpells", showLibraryImport: "showLibraryImport" }, outputs: { save: "save", cancel: "cancel", delete: "delete" }, decls: 226, vars: 60, consts: [["skillSelect", ""], ["spellSelect", ""], [1, "item-editor-overlay"], [1, "item-editor-modal"], [1, "editor-header"], [1, "close-btn", 3, "click"], [1, "editor-content"], [1, "editor-column"], [1, "editor-section"], [1, "form-group"], ["type", "text", "placeholder", "Gegenstandsname", "required", "", 3, "ngModelChange", "ngModel"], [1, "form-row"], ["type", "number", "min", "0", "step", "0.1", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], [1, "form-group", "toggle-group", 2, "flex", "0 0 auto"], [1, "toggle-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "toggle-text"], [1, "form-group", "toggle-group"], [1, "toggle-hint"], ["rows", "4", "placeholder", "Beschreibung...", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Haupteffekt des Gegenstandes...", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Zus\xE4tzlicher Effekt...", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Besondere Eigenschaft...", 3, "ngModelChange", "ngModel"], [1, "type-selector"], [3, "click"], [1, "app-icon", "i-effektivity"], [1, "app-icon", "i-stability"], [1, "app-icon", "i-item"], ["class", "type-options", 4, "ngIf"], [1, "toggle-row"], ["type", "checkbox", 3, "change", "checked"], ["class", "durability-options", 4, "ngIf"], [1, "requirements-grid"], [1, "req-item"], [1, "stat-modifiers-grid"], [1, "stat-mod-item"], ["type", "number", 3, "ngModelChange", "ngModel"], ["class", "counter-list", 4, "ngIf"], [1, "add-counter-form"], [1, "form-group", "flex-2"], ["type", "text", "placeholder", "z.B. Ladungen", 3, "ngModelChange", "ngModel"], [3, "ngModelChange", "ngModel"], [3, "value", "backgroundColor", 4, "ngFor", "ngForOf"], [1, "add-btn", 3, "click", "disabled"], [1, "section-info"], ["class", "bonus-list", 4, "ngIf"], [1, "add-bonus-form"], ["type", "text", "placeholder", "z.B. Angriff mit dieser Waffe", 3, "ngModelChange", "ngModel"], [1, "attached-list"], [1, "add-actions-row"], [1, "add-btn", 3, "click"], [1, "library-import"], [1, "editor-footer"], [1, "footer-buttons"], [1, "delete-btn"], [1, "cancel-btn", 3, "click"], [1, "save-btn", 3, "click"], [3, "skill"], [3, "spell", "availableRunes"], ["type", "number", "min", "1", "step", "1", 3, "ngModelChange", "ngModel"], [1, "type-options"], ["type", "number", "min", "1", "max", "100", 3, "ngModelChange", "ngModel"], [1, "armor-type-select", 3, "ngModelChange", "ngModel"], [3, "ngValue"], ["type", "number", "min", "0", "max", "100", 3, "ngModelChange", "ngModel"], [1, "durability-options"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"], [1, "slider-row"], [1, "slider-label"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel", "max"], ["type", "range", "min", "0", 3, "ngModelChange", "ngModel", "max"], [1, "durability-info"], [4, "ngIf"], ["class", "toggle-row", 4, "ngIf"], [1, "toggle-label", "broken-toggle"], [1, "counter-list"], ["class", "counter-item-editable", 4, "ngFor", "ngForOf"], [1, "counter-item-editable"], [1, "counter-color"], [1, "counter-name"], ["type", "number", 3, "ngModelChange", "ngModel", "min", "max"], ["type", "range", 3, "ngModelChange", "ngModel", "min", "max"], [1, "counter-max-label"], [1, "remove-btn", 3, "click"], [3, "value"], [1, "bonus-list"], ["class", "bonus-item", 4, "ngFor", "ngForOf"], [1, "bonus-item"], [1, "bonus-name"], [1, "bonus-value"], [1, "attached-item"], [1, "attached-item", 3, "contextmenu"], [1, "attached-item-info"], [1, "attached-name"], [1, "attached-type"], [1, "attached-actions"], ["title", "Bearbeiten", 1, "edit-btn", 3, "click"], [1, "app-icon", "i-draw"], ["title", "Entfernen", 1, "remove-btn", 3, "click"], ["value", ""], [1, "import-btn", 3, "click", "disabled"], [1, "attached-tags"], [1, "delete-btn", 3, "click"], [3, "save", "cancel", "delete", "skill"], [3, "save", "cancel", "deleteSpell", "spell", "availableRunes"]], template: function ItemEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 2)(1, "div", 3)(2, "div", 4)(3, "h2");
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "button", 5);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_5_listener() {
        return ctx.cancelEdit();
      });
      \u0275\u0275text(6, "\xD7");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "div", 6)(8, "div", 7)(9, "section", 8)(10, "h3");
      \u0275\u0275text(11, "Grundlegendes");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "div", 9)(13, "label");
      \u0275\u0275text(14, "Name *");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "input", 10);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_15_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.name, $event) || (ctx.editItem.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(16, "div", 11)(17, "div", 9)(18, "label");
      \u0275\u0275text(19, "Gewicht (kg)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "input", 12);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_20_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.weight, $event) || (ctx.editItem.weight = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(21, "div", 9)(22, "label");
      \u0275\u0275text(23, "Wert (Gold)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_24_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.value, $event) || (ctx.editItem.value = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(25, "div", 11)(26, "div", 14)(27, "label", 15)(28, "input", 16);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_28_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.stackable, $event) || (ctx.editItem.stackable = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "span", 17);
      \u0275\u0275text(30, "Stapelbar");
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(31, ItemEditorComponent_Conditional_31_Template, 4, 1, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "div", 18)(33, "label", 15)(34, "input", 16);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_34_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.isIdentified, $event) || (ctx.editItem.isIdentified = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "span", 17);
      \u0275\u0275text(36, "Identifiziert");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(37, "span", 19);
      \u0275\u0275text(38);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(39, "div", 9)(40, "label");
      \u0275\u0275text(41, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "textarea", 20);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_textarea_ngModelChange_42_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.description, $event) || (ctx.editItem.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(43, "div", 9)(44, "label");
      \u0275\u0275text(45, "Prim\xE4rer Effekt");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "textarea", 21);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_textarea_ngModelChange_46_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.primaryEffect, $event) || (ctx.editItem.primaryEffect = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(47, "div", 9)(48, "label");
      \u0275\u0275text(49, "Sekund\xE4rer Effekt");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "textarea", 22);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_textarea_ngModelChange_50_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.secondaryEffect, $event) || (ctx.editItem.secondaryEffect = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(51, "div", 9)(52, "label");
      \u0275\u0275text(53, "Spezialeffekt");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "textarea", 23);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_textarea_ngModelChange_54_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.specialEffect, $event) || (ctx.editItem.specialEffect = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(55, "section", 8)(56, "h3");
      \u0275\u0275text(57, "Gegenstandstyp");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "div", 24)(59, "button", 25);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_59_listener() {
        return ctx.setItemType("weapon");
      });
      \u0275\u0275element(60, "span", 26);
      \u0275\u0275text(61, " Waffe ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(62, "button", 25);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_62_listener() {
        return ctx.setItemType("armor");
      });
      \u0275\u0275element(63, "span", 27);
      \u0275\u0275text(64, " R\xFCstung ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(65, "button", 25);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_65_listener() {
        return ctx.setItemType("other");
      });
      \u0275\u0275element(66, "span", 28);
      \u0275\u0275text(67, " Sonstiges ");
      \u0275\u0275elementEnd()();
      \u0275\u0275template(68, ItemEditorComponent_div_68_Template, 5, 1, "div", 29)(69, ItemEditorComponent_div_69_Template, 26, 9, "div", 29);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(70, "section", 8)(71, "h3");
      \u0275\u0275text(72, "Haltbarkeit");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(73, "div", 30)(74, "label", 15)(75, "input", 31);
      \u0275\u0275listener("change", function ItemEditorComponent_Template_input_change_75_listener() {
        return ctx.toggleDurability();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(76, "span");
      \u0275\u0275text(77, "Haltbarkeit aktivieren");
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(78, ItemEditorComponent_div_78_Template, 24, 10, "div", 32);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(79, "section", 8)(80, "h3");
      \u0275\u0275text(81, "Anforderungen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "div", 33)(83, "div", 34)(84, "label");
      \u0275\u0275text(85, "STR");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_86_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.requirements.strength, $event) || (ctx.editItem.requirements.strength = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(87, "div", 34)(88, "label");
      \u0275\u0275text(89, "DEX");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(90, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_90_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.requirements.dexterity, $event) || (ctx.editItem.requirements.dexterity = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(91, "div", 34)(92, "label");
      \u0275\u0275text(93, "SPD");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(94, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_94_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.requirements.speed, $event) || (ctx.editItem.requirements.speed = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(95, "div", 34)(96, "label");
      \u0275\u0275text(97, "INT");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_98_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.requirements.intelligence, $event) || (ctx.editItem.requirements.intelligence = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(99, "div", 34)(100, "label");
      \u0275\u0275text(101, "CON");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(102, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_102_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.requirements.constitution, $event) || (ctx.editItem.requirements.constitution = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(103, "div", 34)(104, "label");
      \u0275\u0275text(105, "WIL");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(106, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_106_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.requirements.chill, $event) || (ctx.editItem.requirements.chill = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275elementStart(107, "div", 7)(108, "section", 8)(109, "h3");
      \u0275\u0275text(110, "Attributmodifikatoren");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(111, "div", 35)(112, "div", 36)(113, "label");
      \u0275\u0275text(114, "St\xE4rke");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(115, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_115_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["strength"], $event) || (ctx.statModifiers["strength"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(116, "div", 36)(117, "label");
      \u0275\u0275text(118, "Geschick");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(119, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_119_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["dexterity"], $event) || (ctx.statModifiers["dexterity"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(120, "div", 36)(121, "label");
      \u0275\u0275text(122, "Tempo");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(123, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_123_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["speed"], $event) || (ctx.statModifiers["speed"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(124, "div", 36)(125, "label");
      \u0275\u0275text(126, "Intelligenz");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(127, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_127_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["intelligence"], $event) || (ctx.statModifiers["intelligence"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(128, "div", 36)(129, "label");
      \u0275\u0275text(130, "Kondition");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(131, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_131_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["constitution"], $event) || (ctx.statModifiers["constitution"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(132, "div", 36)(133, "label");
      \u0275\u0275text(134, "Ausstrahlung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(135, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_135_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["chill"], $event) || (ctx.statModifiers["chill"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(136, "div", 36)(137, "label");
      \u0275\u0275text(138, "Mana");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(139, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_139_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["mana"], $event) || (ctx.statModifiers["mana"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(140, "div", 36)(141, "label");
      \u0275\u0275text(142, "Leben");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(143, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_143_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["life"], $event) || (ctx.statModifiers["life"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(144, "div", 36)(145, "label");
      \u0275\u0275text(146, "Energie");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(147, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_147_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.statModifiers["energy"], $event) || (ctx.statModifiers["energy"] = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(148, "section", 8)(149, "h3");
      \u0275\u0275text(150, "Eigene Z\xE4hler");
      \u0275\u0275elementEnd();
      \u0275\u0275template(151, ItemEditorComponent_div_151_Template, 2, 1, "div", 38);
      \u0275\u0275elementStart(152, "div", 39)(153, "div", 11)(154, "div", 40)(155, "label");
      \u0275\u0275text(156, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(157, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_157_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.name, $event) || (ctx.newCounter.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(158, "div", 9)(159, "label");
      \u0275\u0275text(160, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(161, "select", 42);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_select_ngModelChange_161_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.color, $event) || (ctx.newCounter.color = $event);
        return $event;
      });
      \u0275\u0275template(162, ItemEditorComponent_option_162_Template, 2, 3, "option", 43);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(163, "div", 11)(164, "div", 9)(165, "label");
      \u0275\u0275text(166, "Min");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(167, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_167_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.min, $event) || (ctx.newCounter.min = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(168, "div", 9)(169, "label");
      \u0275\u0275text(170, "Max");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(171, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_171_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.max, $event) || (ctx.newCounter.max = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(172, "div", 9)(173, "label");
      \u0275\u0275text(174, "Start");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(175, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_175_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newCounter.current, $event) || (ctx.newCounter.current = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(176, "button", 44);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_176_listener() {
        return ctx.addCounter();
      });
      \u0275\u0275text(177, " + Z\xE4hler hinzuf\xFCgen ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(178, "section", 8)(179, "h3");
      \u0275\u0275text(180, "W\xFCrfelboni");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(181, "p", 45);
      \u0275\u0275text(182, "Negativ = gut (hilft niedriger zu w\xFCrfeln)");
      \u0275\u0275elementEnd();
      \u0275\u0275template(183, ItemEditorComponent_div_183_Template, 2, 1, "div", 46);
      \u0275\u0275elementStart(184, "div", 47)(185, "div", 11)(186, "div", 40)(187, "label");
      \u0275\u0275text(188, "Bonus Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(189, "input", 48);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_189_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newDiceBonus.name, $event) || (ctx.newDiceBonus.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(190, "div", 9)(191, "label");
      \u0275\u0275text(192, "Wert");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(193, "input", 37);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_193_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newDiceBonus.value, $event) || (ctx.newDiceBonus.value = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(194, "button", 44);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_194_listener() {
        return ctx.addDiceBonus();
      });
      \u0275\u0275text(195, " + W\xFCrfelbonus hinzuf\xFCgen ");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(196, "section", 8)(197, "h3");
      \u0275\u0275text(198, "F\xE4higkeiten");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(199, ItemEditorComponent_Conditional_199_Template, 3, 0, "div", 49);
      \u0275\u0275elementStart(200, "div", 50)(201, "button", 51);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_201_listener() {
        return ctx.openSkillEditor(null);
      });
      \u0275\u0275text(202, " + Neue F\xE4higkeit ");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(203, ItemEditorComponent_Conditional_203_Template, 9, 1, "div", 52);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(204, "section", 8)(205, "h3");
      \u0275\u0275text(206, "Zauber");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(207, ItemEditorComponent_Conditional_207_Template, 3, 0, "div", 49);
      \u0275\u0275elementStart(208, "div", 50)(209, "button", 51);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_209_listener() {
        return ctx.openSpellEditor(null);
      });
      \u0275\u0275text(210, " + Neuer Zauber ");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(211, ItemEditorComponent_Conditional_211_Template, 9, 1, "div", 52);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(212, "div", 53)(213, "div", 30)(214, "label", 15)(215, "input", 16);
      \u0275\u0275twoWayListener("ngModelChange", function ItemEditorComponent_Template_input_ngModelChange_215_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editItem.lost, $event) || (ctx.editItem.lost = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(216, "span");
      \u0275\u0275text(217, "Verloren");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(218, "div", 54);
      \u0275\u0275conditionalCreate(219, ItemEditorComponent_Conditional_219_Template, 2, 0, "button", 55);
      \u0275\u0275elementStart(220, "button", 56);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_220_listener() {
        return ctx.cancelEdit();
      });
      \u0275\u0275text(221, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(222, "button", 57);
      \u0275\u0275listener("click", function ItemEditorComponent_Template_button_click_222_listener() {
        return ctx.saveItem();
      });
      \u0275\u0275text(223);
      \u0275\u0275elementEnd()()()()();
      \u0275\u0275conditionalCreate(224, ItemEditorComponent_Conditional_224_Template, 1, 1, "app-skill-editor", 58);
      \u0275\u0275conditionalCreate(225, ItemEditorComponent_Conditional_225_Template, 1, 3, "app-spell-editor-overlay", 59);
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isNewItem ? "Neuen Gegenstand erstellen" : "Gegenstand bearbeiten");
      \u0275\u0275advance(11);
      \u0275\u0275classProp("name-empty", !ctx.editItem.name || ctx.editItem.name.trim() === "");
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.name);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.weight);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.value);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.stackable);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.editItem.stackable ? 31 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.isIdentified);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.editItem.isIdentified ? "Item ist identifiziert" : 'Item erscheint als "Unidentifiziertes Item"');
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.description);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.primaryEffect);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.secondaryEffect);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.specialEffect);
      \u0275\u0275advance(5);
      \u0275\u0275classProp("active", ctx.editItem.itemType === "weapon");
      \u0275\u0275advance(3);
      \u0275\u0275classProp("active", ctx.editItem.itemType === "armor");
      \u0275\u0275advance(3);
      \u0275\u0275classProp("active", ctx.editItem.itemType === "other");
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", ctx.editItem.itemType === "weapon");
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.editItem.itemType === "armor");
      \u0275\u0275advance(6);
      \u0275\u0275property("checked", ctx.editItem.hasDurability);
      \u0275\u0275advance(3);
      \u0275\u0275property("ngIf", ctx.editItem.hasDurability);
      \u0275\u0275advance(8);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.requirements.strength);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.requirements.dexterity);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.requirements.speed);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.requirements.intelligence);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.requirements.constitution);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.requirements.chill);
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["strength"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["dexterity"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["speed"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["intelligence"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["constitution"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["chill"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["mana"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["life"]);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.statModifiers["energy"]);
      \u0275\u0275advance(4);
      \u0275\u0275property("ngIf", ctx.editItem.counters && ctx.editItem.counters.length > 0);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.color);
      \u0275\u0275advance();
      \u0275\u0275property("ngForOf", ctx.counterColors);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.min);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.max);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newCounter.current);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.newCounter.name.trim());
      \u0275\u0275advance(7);
      \u0275\u0275property("ngIf", ctx.editItem.diceBonuses && ctx.editItem.diceBonuses.length > 0);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.newDiceBonus.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.newDiceBonus.value);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.newDiceBonus.name.trim());
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.editItem.embeddedSkills && ctx.editItem.embeddedSkills.length > 0 ? 199 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.showLibraryImport && ctx.librarySkills.length > 0 ? 203 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.editItem.embeddedSpells && ctx.editItem.embeddedSpells.length > 0 ? 207 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.showLibraryImport && ctx.librarySpells.length > 0 ? 211 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editItem.lost);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(!ctx.isNewItem ? 219 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.isNewItem ? "Erstellen" : "Speichern");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showSkillEditor ? 224 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showSpellEditor ? 225 : -1);
    }
  }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, RangeValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, RequiredValidator, MinValidator, MaxValidator, NgModel, SkillEditorComponent, SpellEditorOverlayComponent], styles: ["\n\n.item-editor-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--bg, #1e293b);\n  display: flex;\n  align-items: stretch;\n  justify-content: stretch;\n  z-index: 1300;\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease;\n  overflow: hidden;\n}\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.item-editor-modal[_ngcontent-%COMP%] {\n  background: var(--card, #2d3748);\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease;\n  overflow: hidden;\n}\n.editor-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  flex-shrink: 0;\n}\n.editor-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.5rem;\n  color: var(--text-primary, #fff);\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: var(--text-secondary, #888);\n  font-size: 2rem;\n  cursor: pointer;\n  line-height: 1;\n  padding: 0 8px;\n  transition: color 0.2s;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  color: var(--text-primary, #fff);\n}\n.editor-content[_ngcontent-%COMP%] {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 24px;\n  padding: 24px;\n  overflow-y: auto;\n}\n.editor-column[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n.editor-section[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  padding: 16px;\n  border: 1px solid var(--border, #4a5568);\n}\n.editor-section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 16px 0;\n  font-size: 1rem;\n  color: var(--text, #e2e8f0);\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--border, #4a5568);\n}\n.section-info[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-secondary, #888);\n  margin: -8px 0 12px 0;\n}\n.form-group[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.85rem;\n  color: var(--text-secondary, #aaa);\n  margin-bottom: 4px;\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 8px 12px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.95rem;\n  box-sizing: border-box;\n}\n.form-group[_ngcontent-%COMP%]   input.invalid[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:invalid:not(:placeholder-shown) {\n  border-color: #ef4444;\n  background: rgba(239, 68, 68, 0.1);\n}\n.form-group[_ngcontent-%COMP%]   input.name-empty[_ngcontent-%COMP%] {\n  border-color: #ef4444;\n  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);\n  background: rgba(239, 68, 68, 0.1);\n}\n.toggle-group[_ngcontent-%COMP%] {\n  margin: 0.75rem 0;\n}\n.toggle-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n}\n.toggle-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n}\n.toggle-text[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--text);\n}\n.toggle-hint[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--muted);\n  margin-left: auto;\n}\n.slider-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 12px;\n}\n.slider-row[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%] {\n  width: 70px;\n  text-align: center;\n  flex-shrink: 0;\n}\n.slider-row[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%] {\n  flex: 1;\n  height: 8px;\n  -webkit-appearance: none;\n  appearance: none;\n  background: var(--bg, #1e293b);\n  border-radius: 4px;\n  outline: none;\n}\n.slider-row[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 18px;\n  height: 18px;\n  background: var(--accent, #6366f1);\n  border-radius: 50%;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.slider-row[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-webkit-slider-thumb:hover {\n  background: #4f46e5;\n}\n.slider-row[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%]::-moz-range-thumb {\n  width: 18px;\n  height: 18px;\n  background: var(--accent, #6366f1);\n  border-radius: 50%;\n  cursor: pointer;\n  border: none;\n}\n.slider-label[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--text-muted, #a0aec0);\n  min-width: 50px;\n}\n.counter-item-editable[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px;\n  background: var(--bg, #1e293b);\n  border-radius: 6px;\n  margin-bottom: 8px;\n  border: 1px solid var(--border, #4a5568);\n}\n.counter-item-editable[_ngcontent-%COMP%]   .counter-color[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.counter-item-editable[_ngcontent-%COMP%]   .counter-name[_ngcontent-%COMP%] {\n  min-width: 80px;\n  font-weight: 500;\n  color: var(--text, #e2e8f0);\n}\n.counter-item-editable[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%] {\n  width: 60px;\n  padding: 4px 8px;\n  text-align: center;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e2e8f0);\n}\n.counter-item-editable[_ngcontent-%COMP%]   input[type=range][_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 80px;\n}\n.counter-item-editable[_ngcontent-%COMP%]   .counter-max-label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-muted, #a0aec0);\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent-color, #6366f1);\n}\n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  resize: vertical;\n  min-height: 80px;\n}\n.form-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n}\n.form-row[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.form-row[_ngcontent-%COMP%]   .form-group.flex-2[_ngcontent-%COMP%] {\n  flex: 2;\n}\n.type-selector[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.type-selector[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 10px 16px;\n  background: var(--bg-primary, #0f0f1a);\n  border: 2px solid var(--border-color, #333);\n  border-radius: 8px;\n  color: var(--text-secondary, #888);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.type-selector[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent-color, #6366f1);\n  color: var(--text-primary, #fff);\n}\n.type-selector[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {\n  background: var(--accent-color, #6366f1);\n  border-color: var(--accent-color, #6366f1);\n  color: #fff;\n}\n.type-options[_ngcontent-%COMP%] {\n  margin-top: 16px;\n  padding-top: 16px;\n  border-top: 1px dashed var(--border-color, #333);\n}\n.toggle-row[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n}\n.toggle-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  color: var(--text-primary, #fff);\n  font-size: 0.9rem;\n}\n.toggle-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  accent-color: var(--accent-color, #6366f1);\n}\n.broken-toggle[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.durability-options[_ngcontent-%COMP%] {\n  margin-top: 12px;\n}\n.durability-info[_ngcontent-%COMP%] {\n  background: var(--bg-primary, #0f0f1a);\n  padding: 12px;\n  border-radius: 6px;\n  margin: 12px 0;\n}\n.durability-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0 0 8px 0;\n  font-size: 0.85rem;\n  color: var(--text-secondary, #aaa);\n}\n.durability-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.requirements-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.req-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n.req-item[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-secondary, #888);\n  font-weight: bold;\n}\n.req-item[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 60px;\n  padding: 6px 8px;\n  text-align: center;\n  background: var(--bg-primary, #0f0f1a);\n  border: 1px solid var(--border-color, #333);\n  border-radius: 4px;\n  color: var(--text-primary, #fff);\n}\n.stat-modifiers-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n.stat-mod-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.stat-mod-item[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-secondary, #888);\n}\n.stat-mod-item[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  padding: 6px 8px;\n  text-align: center;\n  background: var(--bg-primary, #0f0f1a);\n  border: 1px solid var(--border-color, #333);\n  border-radius: 4px;\n  color: var(--text-primary, #fff);\n  width: 100%;\n  box-sizing: border-box;\n}\n.counter-list[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.counter-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px;\n  background: var(--bg-primary, #0f0f1a);\n  border-radius: 6px;\n  margin-bottom: 6px;\n}\n.counter-color[_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.counter-name[_ngcontent-%COMP%] {\n  flex: 1;\n  color: var(--text-primary, #fff);\n}\n.counter-range[_ngcontent-%COMP%] {\n  color: var(--text-secondary, #888);\n  font-size: 0.85rem;\n}\n.add-counter-form[_ngcontent-%COMP%], \n.add-bonus-form[_ngcontent-%COMP%] {\n  background: var(--bg-primary, #0f0f1a);\n  padding: 12px;\n  border-radius: 6px;\n  border: 1px dashed var(--border-color, #444);\n}\n.add-counter-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%], \n.add-bonus-form[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n.bonus-list[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.bonus-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  background: var(--bg-primary, #0f0f1a);\n  border-radius: 6px;\n  margin-bottom: 6px;\n}\n.bonus-name[_ngcontent-%COMP%] {\n  flex: 1;\n  color: var(--text-primary, #fff);\n}\n.bonus-value[_ngcontent-%COMP%] {\n  font-weight: bold;\n  font-size: 0.95rem;\n}\n.bonus-value.bonus-good[_ngcontent-%COMP%] {\n  color: #22c55e;\n}\n.bonus-value.bonus-bad[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.attached-list[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.attached-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 12px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  margin-bottom: 6px;\n  color: var(--text, #e2e8f0);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.attached-item[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.1);\n}\n.attached-item-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  flex: 1;\n}\n.attached-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--text, #e2e8f0);\n}\n.attached-type[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: capitalize;\n}\n.attached-tags[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--accent, #8b5cf6);\n}\n.attached-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n}\n.edit-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--border, #374151);\n  color: var(--text-muted, #9ca3af);\n  padding: 4px 8px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  transition: all 0.2s;\n}\n.edit-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n  color: #fff;\n}\n.add-attached-form[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.add-attached-form[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 8px 12px;\n  background: var(--bg-primary, #0f0f1a);\n  border: 1px solid var(--border-color, #333);\n  border-radius: 6px;\n  color: var(--text-primary, #fff);\n}\n.no-items-hint[_ngcontent-%COMP%] {\n  color: var(--text-secondary, #666);\n  font-size: 0.85rem;\n  font-style: italic;\n}\n.add-btn[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  background: var(--accent-color, #6366f1);\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: background 0.2s;\n  white-space: nowrap;\n}\n.add-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #4f46e5;\n}\n.add-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.add-btn.full-width[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.add-actions-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.library-import[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  flex: 1;\n}\n.library-import[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 8px 12px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.9rem;\n}\n.library-import[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.import-btn[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  background: #22c55e;\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: background 0.2s;\n  white-space: nowrap;\n}\n.import-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #16a34a;\n}\n.import-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.remove-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #ef4444;\n  font-size: 1.2rem;\n  cursor: pointer;\n  padding: 2px 6px;\n  line-height: 1;\n  opacity: 0.6;\n  transition: opacity 0.2s;\n}\n.remove-btn[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.editor-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  border-top: 1px solid var(--border-color, #333);\n  background: var(--bg-tertiary, #16162a);\n  border-radius: 0 0 12px 12px;\n}\n.footer-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n}\n.cancel-btn[_ngcontent-%COMP%] {\n  padding: 10px 24px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #a0aec0);\n  font-size: 0.95rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.cancel-btn[_ngcontent-%COMP%]:hover {\n  background: var(--bg, #1e293b);\n  color: var(--text, #e2e8f0);\n}\n.delete-btn[_ngcontent-%COMP%] {\n  padding: 10px 24px;\n  background: transparent;\n  border: 1px solid #ef4444;\n  border-radius: 6px;\n  color: #ef4444;\n  font-size: 0.95rem;\n  cursor: pointer;\n  transition: all 0.2s;\n  margin-right: auto;\n}\n.delete-btn[_ngcontent-%COMP%]:hover {\n  background: #ef4444;\n  color: #fff;\n}\n.save-btn[_ngcontent-%COMP%] {\n  padding: 10px 32px;\n  background: #22c55e;\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.95rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.save-btn[_ngcontent-%COMP%]:hover {\n  background: #16a34a;\n}\n@media (max-width: 900px) {\n  .editor-content[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n@media (max-width: 600px) {\n  .editor-header[_ngcontent-%COMP%], \n   .editor-footer[_ngcontent-%COMP%] {\n    padding: 12px 16px;\n  }\n  .editor-content[_ngcontent-%COMP%] {\n    padding: 16px;\n  }\n  .type-selector[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .requirements-grid[_ngcontent-%COMP%], \n   .stat-modifiers-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  .form-row[_ngcontent-%COMP%] {\n    flex-direction: column;\n    gap: 0;\n  }\n}\n/*# sourceMappingURL=item-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ItemEditorComponent, [{
    type: Component,
    args: [{ selector: "app-item-editor", standalone: true, imports: [CommonModule, FormsModule, SkillEditorComponent, SpellEditorOverlayComponent], template: `<div class="item-editor-overlay">\r
  <div class="item-editor-modal">\r
    <!-- Header -->\r
    <div class="editor-header">\r
      <h2>{{ isNewItem ? 'Neuen Gegenstand erstellen' : 'Gegenstand bearbeiten' }}</h2>\r
      <button class="close-btn" (click)="cancelEdit()">\xD7</button>\r
    </div>\r
\r
    <!-- Content -->\r
    <div class="editor-content">\r
      <!-- Left Column: Basic Info & Type -->\r
      <div class="editor-column">\r
        <!-- Basic Info Section -->\r
        <section class="editor-section">\r
          <h3>Grundlegendes</h3>\r
          \r
          <div class="form-group">\r
            <label>Name *</label>\r
            <input type="text" \r
                   [(ngModel)]="editItem.name" \r
                   placeholder="Gegenstandsname" \r
                   required\r
                   [class.name-empty]="!editItem.name || editItem.name.trim() === ''">\r
          </div>\r
\r
          <div class="form-row">\r
            <div class="form-group">\r
              <label>Gewicht (kg)</label>\r
              <input type="number" [(ngModel)]="editItem.weight" min="0" step="0.1">\r
            </div>\r
            <div class="form-group">\r
              <label>Wert (Gold)</label>\r
              <input type="number" [(ngModel)]="editItem.value" min="0">\r
            </div>\r
          </div>\r
\r
          <div class="form-row">\r
            <div class="form-group toggle-group" style="flex: 0 0 auto;">\r
              <label class="toggle-label">\r
                <input type="checkbox" [(ngModel)]="editItem.stackable">\r
                <span class="toggle-text">Stapelbar</span>\r
              </label>\r
            </div>\r
            @if (editItem.stackable) {\r
              <div class="form-group">\r
                <label>Anzahl</label>\r
                <input type="number" [(ngModel)]="editItem.amount" min="1" step="1">\r
              </div>\r
            }\r
          </div>\r
\r
          <div class="form-group toggle-group">\r
            <label class="toggle-label">\r
              <input type="checkbox" [(ngModel)]="editItem.isIdentified">\r
              <span class="toggle-text">Identifiziert</span>\r
              <span class="toggle-hint">{{ editItem.isIdentified ? 'Item ist identifiziert' : 'Item erscheint als "Unidentifiziertes Item"' }}</span>\r
            </label>\r
          </div>\r
\r
          <div class="form-group">\r
            <label>Beschreibung</label>\r
            <textarea [(ngModel)]="editItem.description" rows="4" placeholder="Beschreibung..."></textarea>\r
          </div>\r
\r
          <div class="form-group">\r
            <label>Prim\xE4rer Effekt</label>\r
            <textarea [(ngModel)]="editItem.primaryEffect" rows="2" placeholder="Haupteffekt des Gegenstandes..."></textarea>\r
          </div>\r
\r
          <div class="form-group">\r
            <label>Sekund\xE4rer Effekt</label>\r
            <textarea [(ngModel)]="editItem.secondaryEffect" rows="2" placeholder="Zus\xE4tzlicher Effekt..."></textarea>\r
          </div>\r
\r
          <div class="form-group">\r
            <label>Spezialeffekt</label>\r
            <textarea [(ngModel)]="editItem.specialEffect" rows="2" placeholder="Besondere Eigenschaft..."></textarea>\r
          </div>\r
        </section>\r
\r
        <!-- Item Type Section -->\r
        <section class="editor-section">\r
          <h3>Gegenstandstyp</h3>\r
          \r
          <div class="type-selector">\r
            <button \r
              [class.active]="editItem.itemType === 'weapon'"\r
              (click)="setItemType('weapon')">\r
              <span class="app-icon i-effektivity"></span> Waffe\r
            </button>\r
            <button \r
              [class.active]="editItem.itemType === 'armor'"\r
              (click)="setItemType('armor')">\r
              <span class="app-icon i-stability"></span> R\xFCstung\r
            </button>\r
            <button \r
              [class.active]="editItem.itemType === 'other'"\r
              (click)="setItemType('other')">\r
              <span class="app-icon i-item"></span> Sonstiges\r
            </button>\r
          </div>\r
\r
          <!-- Weapon-specific options -->\r
          <div *ngIf="editItem.itemType === 'weapon'" class="type-options">\r
            <div class="form-group">\r
              <label>Effizienz (Schadenswert)</label>\r
              <input type="number" [(ngModel)]="editItem.efficiency" min="1" max="100">\r
            </div>\r
          </div>\r
\r
          <!-- Armor-specific options -->\r
          <div *ngIf="editItem.itemType === 'armor'" class="type-options">\r
            <div class="form-group">\r
              <label>R\xFCstungsteil</label>\r
              <select [(ngModel)]="editItem.armorType" class="armor-type-select">\r
                <option [ngValue]="'helmet'">Helm</option>\r
                <option [ngValue]="'chestplate'">Brustpanzer</option>\r
                <option [ngValue]="'armschienen'">Armschienen</option>\r
                <option [ngValue]="'leggings'">Beinschienen</option>\r
                <option [ngValue]="'boots'">Stiefel</option>\r
                <option [ngValue]="'extra'">Extra</option>\r
              </select>\r
            </div>\r
            <div class="form-row">\r
              <div class="form-group">\r
                <label>Stabilit\xE4t (Schutzwert)</label>\r
                <input type="number" [(ngModel)]="editItem.stability" min="0" max="100">\r
              </div>\r
              <div class="form-group">\r
                <label>R\xFCstungsmalus</label>\r
                <input type="number" [(ngModel)]="editItem.armorDebuff" min="0">\r
              </div>\r
            </div>\r
          </div>\r
        </section>\r
\r
        <!-- Durability Section -->\r
        <section class="editor-section">\r
          <h3>Haltbarkeit</h3>\r
          \r
          <div class="toggle-row">\r
            <label class="toggle-label">\r
              <input type="checkbox" [checked]="editItem.hasDurability" (change)="toggleDurability()">\r
              <span>Haltbarkeit aktivieren</span>\r
            </label>\r
          </div>\r
\r
          <div *ngIf="editItem.hasDurability" class="durability-options">\r
            <div class="form-group">\r
              <label>Maximum</label>\r
              <input type="number" [(ngModel)]="editItem.maxDurability" min="1">\r
            </div>\r
\r
            <div class="slider-row">\r
              <span class="slider-label">Aktuell</span>\r
              <input type="number" \r
                     [(ngModel)]="editItem.durability" \r
                     [max]="editItem.maxDurability || 100" \r
                     min="0">\r
              <input type="range" \r
                     [(ngModel)]="editItem.durability" \r
                     [max]="editItem.maxDurability || 100" \r
                     min="0">\r
              <span class="slider-label">/ {{ editItem.maxDurability || 100 }}</span>\r
            </div>\r
\r
            <div class="durability-info">\r
              <p>\r
                <strong>Bruchtest:</strong> Wenn Haltbarkeit auf 0 f\xE4llt, wird W20 gew\xFCrfelt.\r
                Modifikator: -5 + (100-Haltbarkeit)/10\r
              </p>\r
              <p>\r
                <strong>Bei Bruch:</strong>\r
                <span *ngIf="editItem.itemType === 'weapon'">Waffe gibt -2 W\xFCrfelmalus</span>\r
                <span *ngIf="editItem.itemType === 'armor'">R\xFCstung gibt +5 R\xFCstungsmalus</span>\r
                <span *ngIf="editItem.itemType === 'other'">Gegenstand unbrauchbar</span>\r
              </p>\r
            </div>\r
\r
            <div class="toggle-row" *ngIf="editItem.hasDurability">\r
              <label class="toggle-label broken-toggle">\r
                <input type="checkbox" [(ngModel)]="editItem.broken">\r
                <span>Zerbrochen</span>\r
              </label>\r
            </div>\r
          </div>\r
        </section>\r
\r
        <!-- Requirements Section -->\r
        <section class="editor-section">\r
          <h3>Anforderungen</h3>\r
          \r
          <div class="requirements-grid">\r
            <div class="req-item">\r
              <label>STR</label>\r
              <input type="number" [(ngModel)]="editItem.requirements!.strength" min="0">\r
            </div>\r
            <div class="req-item">\r
              <label>DEX</label>\r
              <input type="number" [(ngModel)]="editItem.requirements!.dexterity" min="0">\r
            </div>\r
            <div class="req-item">\r
              <label>SPD</label>\r
              <input type="number" [(ngModel)]="editItem.requirements!.speed" min="0">\r
            </div>\r
            <div class="req-item">\r
              <label>INT</label>\r
              <input type="number" [(ngModel)]="editItem.requirements!.intelligence" min="0">\r
            </div>\r
            <div class="req-item">\r
              <label>CON</label>\r
              <input type="number" [(ngModel)]="editItem.requirements!.constitution" min="0">\r
            </div>\r
            <div class="req-item">\r
              <label>WIL</label>\r
              <input type="number" [(ngModel)]="editItem.requirements!.chill" min="0">\r
            </div>\r
          </div>\r
        </section>\r
      </div>\r
\r
      <!-- Right Column: Advanced Features -->\r
      <div class="editor-column">\r
        <!-- Stat Modifiers Section -->\r
        <section class="editor-section">\r
          <h3>Attributmodifikatoren</h3>\r
          \r
          <div class="stat-modifiers-grid">\r
            <div class="stat-mod-item">\r
              <label>St\xE4rke</label>\r
              <input type="number" [(ngModel)]="statModifiers['strength']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Geschick</label>\r
              <input type="number" [(ngModel)]="statModifiers['dexterity']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Tempo</label>\r
              <input type="number" [(ngModel)]="statModifiers['speed']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Intelligenz</label>\r
              <input type="number" [(ngModel)]="statModifiers['intelligence']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Kondition</label>\r
              <input type="number" [(ngModel)]="statModifiers['constitution']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Ausstrahlung</label>\r
              <input type="number" [(ngModel)]="statModifiers['chill']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Mana</label>\r
              <input type="number" [(ngModel)]="statModifiers['mana']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Leben</label>\r
              <input type="number" [(ngModel)]="statModifiers['life']">\r
            </div>\r
            <div class="stat-mod-item">\r
              <label>Energie</label>\r
              <input type="number" [(ngModel)]="statModifiers['energy']">\r
            </div>\r
          </div>\r
        </section>\r
\r
        <!-- Custom Counters Section -->\r
        <section class="editor-section">\r
          <h3>Eigene Z\xE4hler</h3>\r
          \r
          <!-- Existing Counters - Editable with Sliders -->\r
          <div class="counter-list" *ngIf="editItem.counters && editItem.counters.length > 0">\r
            <div class="counter-item-editable" *ngFor="let counter of editItem.counters; let i = index">\r
              <div class="counter-color" [style.backgroundColor]="counter.color"></div>\r
              <span class="counter-name">{{ counter.name }}</span>\r
              <input type="number" \r
                     [(ngModel)]="counter.current" \r
                     [min]="counter.min" \r
                     [max]="counter.max">\r
              <input type="range" \r
                     [(ngModel)]="counter.current" \r
                     [min]="counter.min" \r
                     [max]="counter.max">\r
              <span class="counter-max-label">/ {{ counter.max }}</span>\r
              <button class="remove-btn" (click)="removeCounter(i)">\xD7</button>\r
            </div>\r
          </div>\r
\r
          <!-- Add Counter Form -->\r
          <div class="add-counter-form">\r
            <div class="form-row">\r
              <div class="form-group flex-2">\r
                <label>Name</label>\r
                <input type="text" [(ngModel)]="newCounter.name" placeholder="z.B. Ladungen">\r
              </div>\r
              <div class="form-group">\r
                <label>Farbe</label>\r
                <select [(ngModel)]="newCounter.color">\r
                  <option *ngFor="let color of counterColors" [value]="color" [style.backgroundColor]="color">\r
                    \u25CF\r
                  </option>\r
                </select>\r
              </div>\r
            </div>\r
            <div class="form-row">\r
              <div class="form-group">\r
                <label>Min</label>\r
                <input type="number" [(ngModel)]="newCounter.min">\r
              </div>\r
              <div class="form-group">\r
                <label>Max</label>\r
                <input type="number" [(ngModel)]="newCounter.max">\r
              </div>\r
              <div class="form-group">\r
                <label>Start</label>\r
                <input type="number" [(ngModel)]="newCounter.current">\r
              </div>\r
            </div>\r
            <button class="add-btn" (click)="addCounter()" [disabled]="!newCounter.name.trim()">\r
              + Z\xE4hler hinzuf\xFCgen\r
            </button>\r
          </div>\r
        </section>\r
\r
        <!-- Dice Bonuses Section -->\r
        <section class="editor-section">\r
          <h3>W\xFCrfelboni</h3>\r
          <p class="section-info">Negativ = gut (hilft niedriger zu w\xFCrfeln)</p>\r
          \r
          <!-- Existing Bonuses -->\r
          <div class="bonus-list" *ngIf="editItem.diceBonuses && editItem.diceBonuses.length > 0">\r
            <div class="bonus-item" *ngFor="let bonus of editItem.diceBonuses; let i = index">\r
              <span class="bonus-name">{{ bonus.name }}</span>\r
              <span class="bonus-value" [class]="getDiceBonusClass(bonus.value)">\r
                {{ formatDiceBonusValue(bonus.value) }}\r
              </span>\r
              <button class="remove-btn" (click)="removeDiceBonus(i)">\xD7</button>\r
            </div>\r
          </div>\r
\r
          <!-- Add Bonus Form -->\r
          <div class="add-bonus-form">\r
            <div class="form-row">\r
              <div class="form-group flex-2">\r
                <label>Bonus Name</label>\r
                <input type="text" [(ngModel)]="newDiceBonus.name" placeholder="z.B. Angriff mit dieser Waffe">\r
              </div>\r
              <div class="form-group">\r
                <label>Wert</label>\r
                <input type="number" [(ngModel)]="newDiceBonus.value">\r
              </div>\r
            </div>\r
            <button class="add-btn" (click)="addDiceBonus()" [disabled]="!newDiceBonus.name.trim()">\r
              + W\xFCrfelbonus hinzuf\xFCgen\r
            </button>\r
          </div>\r
        </section>\r
\r
        <!-- Embedded Skills Section -->\r
        <section class="editor-section">\r
          <h3>F\xE4higkeiten</h3>\r
          \r
          <!-- Existing Embedded Skills -->\r
          @if (editItem.embeddedSkills && editItem.embeddedSkills.length > 0) {\r
            <div class="attached-list">\r
              @for (skill of editItem.embeddedSkills; track $index; let i = $index) {\r
                <div class="attached-item" (contextmenu)="$event.preventDefault(); openSkillEditor(i)">\r
                  <div class="attached-item-info">\r
                    <span class="attached-name">{{ skill.name }}</span>\r
                    <span class="attached-type">{{ skill.type }}</span>\r
                  </div>\r
                  <div class="attached-actions">\r
                    <button class="edit-btn" (click)="openSkillEditor(i)" title="Bearbeiten"><span class="app-icon i-draw"></span></button>\r
                    <button class="remove-btn" (click)="deleteEmbeddedSkill(i)" title="Entfernen">\xD7</button>\r
                  </div>\r
                </div>\r
              }\r
            </div>\r
          }\r
\r
          <!-- Add Actions -->\r
          <div class="add-actions-row">\r
            <button class="add-btn" (click)="openSkillEditor(null)">\r
              + Neue F\xE4higkeit\r
            </button>\r
            @if (showLibraryImport && librarySkills.length > 0) {\r
              <div class="library-import">\r
                <select #skillSelect>\r
                  <option value="">Aus Bibliothek...</option>\r
                  @for (skill of librarySkills; track $index) {\r
                    <option [value]="$index">{{ skill.name }}</option>\r
                  }\r
                </select>\r
                <button class="import-btn" (click)="skillSelect.value && importSkillFromLibrary(librarySkills[+skillSelect.value]); skillSelect.value = ''" [disabled]="!skillSelect.value">\r
                  Importieren\r
                </button>\r
              </div>\r
            }\r
          </div>\r
        </section>\r
\r
        <!-- Embedded Spells Section -->\r
        <section class="editor-section">\r
          <h3>Zauber</h3>\r
          \r
          <!-- Existing Embedded Spells -->\r
          @if (editItem.embeddedSpells && editItem.embeddedSpells.length > 0) {\r
            <div class="attached-list">\r
              @for (spell of editItem.embeddedSpells; track $index; let i = $index) {\r
                <div class="attached-item" (contextmenu)="$event.preventDefault(); openSpellEditor(i)">\r
                  <div class="attached-item-info">\r
                    <span class="attached-name">{{ spell.name }}</span>\r
                    @if (spell.tags && spell.tags.length > 0) {\r
                      <span class="attached-tags">{{ spell.tags.join(', ') }}</span>\r
                    }\r
                  </div>\r
                  <div class="attached-actions">\r
                    <button class="edit-btn" (click)="openSpellEditor(i)" title="Bearbeiten"><span class="app-icon i-draw"></span></button>\r
                    <button class="remove-btn" (click)="deleteEmbeddedSpell(i)" title="Entfernen">\xD7</button>\r
                  </div>\r
                </div>\r
              }\r
            </div>\r
          }\r
\r
          <!-- Add Actions -->\r
          <div class="add-actions-row">\r
            <button class="add-btn" (click)="openSpellEditor(null)">\r
              + Neuer Zauber\r
            </button>\r
            @if (showLibraryImport && librarySpells.length > 0) {\r
              <div class="library-import">\r
                <select #spellSelect>\r
                  <option value="">Aus Bibliothek...</option>\r
                  @for (spell of librarySpells; track $index) {\r
                    <option [value]="$index">{{ spell.name }}</option>\r
                  }\r
                </select>\r
                <button class="import-btn" (click)="spellSelect.value && importSpellFromLibrary(librarySpells[+spellSelect.value]); spellSelect.value = ''" [disabled]="!spellSelect.value">\r
                  Importieren\r
                </button>\r
              </div>\r
            }\r
          </div>\r
        </section>\r
      </div>\r
    </div>\r
\r
    <!-- Footer -->\r
    <div class="editor-footer">\r
      <div class="toggle-row">\r
        <label class="toggle-label">\r
          <input type="checkbox" [(ngModel)]="editItem.lost">\r
          <span>Verloren</span>\r
        </label>\r
      </div>\r
      <div class="footer-buttons">\r
        @if (!isNewItem) {\r
          <button class="delete-btn" (click)="deleteItem()">L\xF6schen</button>\r
        }\r
        <button class="cancel-btn" (click)="cancelEdit()">Abbrechen</button>\r
        <button class="save-btn" (click)="saveItem()">{{ isNewItem ? 'Erstellen' : 'Speichern' }}</button>\r
      </div>\r
    </div>\r
  </div>\r
</div>\r
<!-- Sub-Editor: Skill Editor -->\r
@if (showSkillEditor) {\r
  <app-skill-editor\r
    [skill]="editingSkill"\r
    (save)="saveSkill($event)"\r
    (cancel)="closeSkillEditor()"\r
    (delete)="editingSkillIndex !== null ? deleteEmbeddedSkill(editingSkillIndex) : null; closeSkillEditor()">\r
  </app-skill-editor>\r
}\r
\r
<!-- Sub-Editor: Spell Editor -->\r
@if (showSpellEditor) {\r
  <app-spell-editor-overlay\r
    [spell]="editingSpell"\r
    [availableRunes]="[]"\r
    (save)="saveSpell($event)"\r
    (cancel)="closeSpellEditor()"\r
    (deleteSpell)="editingSpellIndex !== null ? deleteEmbeddedSpell(editingSpellIndex) : null; closeSpellEditor()">\r
  </app-spell-editor-overlay>\r
}`, styles: ["/* src/app/sheet/item-editor/item-editor.component.css */\n.item-editor-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: var(--bg, #1e293b);\n  display: flex;\n  align-items: stretch;\n  justify-content: stretch;\n  z-index: 1300;\n  animation: fadeIn 0.2s ease;\n  overflow: hidden;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.item-editor-modal {\n  background: var(--card, #2d3748);\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  animation: fadeIn 0.2s ease;\n  overflow: hidden;\n}\n.editor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  background: var(--card, #2d3748);\n  flex-shrink: 0;\n}\n.editor-header h2 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: var(--text-primary, #fff);\n}\n.close-btn {\n  background: transparent;\n  border: none;\n  color: var(--text-secondary, #888);\n  font-size: 2rem;\n  cursor: pointer;\n  line-height: 1;\n  padding: 0 8px;\n  transition: color 0.2s;\n}\n.close-btn:hover {\n  color: var(--text-primary, #fff);\n}\n.editor-content {\n  flex: 1;\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 24px;\n  padding: 24px;\n  overflow-y: auto;\n}\n.editor-column {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n.editor-section {\n  background: var(--bg, #1e293b);\n  border-radius: 8px;\n  padding: 16px;\n  border: 1px solid var(--border, #4a5568);\n}\n.editor-section h3 {\n  margin: 0 0 16px 0;\n  font-size: 1rem;\n  color: var(--text, #e2e8f0);\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--border, #4a5568);\n}\n.section-info {\n  font-size: 0.8rem;\n  color: var(--text-secondary, #888);\n  margin: -8px 0 12px 0;\n}\n.form-group {\n  margin-bottom: 12px;\n}\n.form-group label {\n  display: block;\n  font-size: 0.85rem;\n  color: var(--text-secondary, #aaa);\n  margin-bottom: 4px;\n}\n.form-group input,\n.form-group textarea,\n.form-group select {\n  width: 100%;\n  padding: 8px 12px;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.95rem;\n  box-sizing: border-box;\n}\n.form-group input.invalid,\n.form-group input:invalid:not(:placeholder-shown) {\n  border-color: #ef4444;\n  background: rgba(239, 68, 68, 0.1);\n}\n.form-group input.name-empty {\n  border-color: #ef4444;\n  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);\n  background: rgba(239, 68, 68, 0.1);\n}\n.toggle-group {\n  margin: 0.75rem 0;\n}\n.toggle-label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n}\n.toggle-label input[type=checkbox] {\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n}\n.toggle-text {\n  font-weight: 600;\n  color: var(--text);\n}\n.toggle-hint {\n  font-size: 0.8rem;\n  color: var(--muted);\n  margin-left: auto;\n}\n.slider-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 12px;\n}\n.slider-row input[type=number] {\n  width: 70px;\n  text-align: center;\n  flex-shrink: 0;\n}\n.slider-row input[type=range] {\n  flex: 1;\n  height: 8px;\n  -webkit-appearance: none;\n  appearance: none;\n  background: var(--bg, #1e293b);\n  border-radius: 4px;\n  outline: none;\n}\n.slider-row input[type=range]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 18px;\n  height: 18px;\n  background: var(--accent, #6366f1);\n  border-radius: 50%;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.slider-row input[type=range]::-webkit-slider-thumb:hover {\n  background: #4f46e5;\n}\n.slider-row input[type=range]::-moz-range-thumb {\n  width: 18px;\n  height: 18px;\n  background: var(--accent, #6366f1);\n  border-radius: 50%;\n  cursor: pointer;\n  border: none;\n}\n.slider-label {\n  font-size: 0.85rem;\n  color: var(--text-muted, #a0aec0);\n  min-width: 50px;\n}\n.counter-item-editable {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px;\n  background: var(--bg, #1e293b);\n  border-radius: 6px;\n  margin-bottom: 8px;\n  border: 1px solid var(--border, #4a5568);\n}\n.counter-item-editable .counter-color {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.counter-item-editable .counter-name {\n  min-width: 80px;\n  font-weight: 500;\n  color: var(--text, #e2e8f0);\n}\n.counter-item-editable input[type=number] {\n  width: 60px;\n  padding: 4px 8px;\n  text-align: center;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e2e8f0);\n}\n.counter-item-editable input[type=range] {\n  flex: 1;\n  min-width: 80px;\n}\n.counter-item-editable .counter-max-label {\n  font-size: 0.8rem;\n  color: var(--text-muted, #a0aec0);\n}\n.form-group input:focus,\n.form-group textarea:focus,\n.form-group select:focus {\n  outline: none;\n  border-color: var(--accent-color, #6366f1);\n}\n.form-group textarea {\n  resize: vertical;\n  min-height: 80px;\n}\n.form-row {\n  display: flex;\n  gap: 12px;\n}\n.form-row .form-group {\n  flex: 1;\n}\n.form-row .form-group.flex-2 {\n  flex: 2;\n}\n.type-selector {\n  display: flex;\n  gap: 8px;\n}\n.type-selector button {\n  flex: 1;\n  padding: 10px 16px;\n  background: var(--bg-primary, #0f0f1a);\n  border: 2px solid var(--border-color, #333);\n  border-radius: 8px;\n  color: var(--text-secondary, #888);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.type-selector button:hover {\n  border-color: var(--accent-color, #6366f1);\n  color: var(--text-primary, #fff);\n}\n.type-selector button.active {\n  background: var(--accent-color, #6366f1);\n  border-color: var(--accent-color, #6366f1);\n  color: #fff;\n}\n.type-options {\n  margin-top: 16px;\n  padding-top: 16px;\n  border-top: 1px dashed var(--border-color, #333);\n}\n.toggle-row {\n  margin-bottom: 12px;\n}\n.toggle-label {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  color: var(--text-primary, #fff);\n  font-size: 0.9rem;\n}\n.toggle-label input[type=checkbox] {\n  width: 18px;\n  height: 18px;\n  accent-color: var(--accent-color, #6366f1);\n}\n.broken-toggle span {\n  color: #ef4444;\n}\n.durability-options {\n  margin-top: 12px;\n}\n.durability-info {\n  background: var(--bg-primary, #0f0f1a);\n  padding: 12px;\n  border-radius: 6px;\n  margin: 12px 0;\n}\n.durability-info p {\n  margin: 0 0 8px 0;\n  font-size: 0.85rem;\n  color: var(--text-secondary, #aaa);\n}\n.durability-info p:last-child {\n  margin-bottom: 0;\n}\n.requirements-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.req-item {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n}\n.req-item label {\n  font-size: 0.75rem;\n  color: var(--text-secondary, #888);\n  font-weight: bold;\n}\n.req-item input {\n  width: 60px;\n  padding: 6px 8px;\n  text-align: center;\n  background: var(--bg-primary, #0f0f1a);\n  border: 1px solid var(--border-color, #333);\n  border-radius: 4px;\n  color: var(--text-primary, #fff);\n}\n.stat-modifiers-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n.stat-mod-item {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.stat-mod-item label {\n  font-size: 0.75rem;\n  color: var(--text-secondary, #888);\n}\n.stat-mod-item input {\n  padding: 6px 8px;\n  text-align: center;\n  background: var(--bg-primary, #0f0f1a);\n  border: 1px solid var(--border-color, #333);\n  border-radius: 4px;\n  color: var(--text-primary, #fff);\n  width: 100%;\n  box-sizing: border-box;\n}\n.counter-list {\n  margin-bottom: 16px;\n}\n.counter-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px;\n  background: var(--bg-primary, #0f0f1a);\n  border-radius: 6px;\n  margin-bottom: 6px;\n}\n.counter-color {\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.counter-name {\n  flex: 1;\n  color: var(--text-primary, #fff);\n}\n.counter-range {\n  color: var(--text-secondary, #888);\n  font-size: 0.85rem;\n}\n.add-counter-form,\n.add-bonus-form {\n  background: var(--bg-primary, #0f0f1a);\n  padding: 12px;\n  border-radius: 6px;\n  border: 1px dashed var(--border-color, #444);\n}\n.add-counter-form .form-group,\n.add-bonus-form .form-group {\n  margin-bottom: 8px;\n}\n.bonus-list {\n  margin-bottom: 16px;\n}\n.bonus-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  background: var(--bg-primary, #0f0f1a);\n  border-radius: 6px;\n  margin-bottom: 6px;\n}\n.bonus-name {\n  flex: 1;\n  color: var(--text-primary, #fff);\n}\n.bonus-value {\n  font-weight: bold;\n  font-size: 0.95rem;\n}\n.bonus-value.bonus-good {\n  color: #22c55e;\n}\n.bonus-value.bonus-bad {\n  color: #ef4444;\n}\n.attached-list {\n  margin-bottom: 16px;\n}\n.attached-item {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 12px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  margin-bottom: 6px;\n  color: var(--text, #e2e8f0);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.attached-item:hover {\n  border-color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.1);\n}\n.attached-item-info {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  flex: 1;\n}\n.attached-name {\n  font-weight: 500;\n  color: var(--text, #e2e8f0);\n}\n.attached-type {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: capitalize;\n}\n.attached-tags {\n  font-size: 0.75rem;\n  color: var(--accent, #8b5cf6);\n}\n.attached-actions {\n  display: flex;\n  gap: 4px;\n}\n.edit-btn {\n  background: transparent;\n  border: 1px solid var(--border, #374151);\n  color: var(--text-muted, #9ca3af);\n  padding: 4px 8px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  transition: all 0.2s;\n}\n.edit-btn:hover {\n  background: var(--accent, #8b5cf6);\n  border-color: var(--accent, #8b5cf6);\n  color: #fff;\n}\n.add-attached-form {\n  display: flex;\n  gap: 8px;\n}\n.add-attached-form select {\n  flex: 1;\n  padding: 8px 12px;\n  background: var(--bg-primary, #0f0f1a);\n  border: 1px solid var(--border-color, #333);\n  border-radius: 6px;\n  color: var(--text-primary, #fff);\n}\n.no-items-hint {\n  color: var(--text-secondary, #666);\n  font-size: 0.85rem;\n  font-style: italic;\n}\n.add-btn {\n  padding: 8px 16px;\n  background: var(--accent-color, #6366f1);\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: background 0.2s;\n  white-space: nowrap;\n}\n.add-btn:hover:not(:disabled) {\n  background: #4f46e5;\n}\n.add-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.add-btn.full-width {\n  width: 100%;\n}\n.add-actions-row {\n  display: flex;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.library-import {\n  display: flex;\n  gap: 8px;\n  flex: 1;\n}\n.library-import select {\n  flex: 1;\n  padding: 8px 12px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.9rem;\n}\n.library-import select:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.import-btn {\n  padding: 8px 16px;\n  background: #22c55e;\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: background 0.2s;\n  white-space: nowrap;\n}\n.import-btn:hover:not(:disabled) {\n  background: #16a34a;\n}\n.import-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.remove-btn {\n  background: transparent;\n  border: none;\n  color: #ef4444;\n  font-size: 1.2rem;\n  cursor: pointer;\n  padding: 2px 6px;\n  line-height: 1;\n  opacity: 0.6;\n  transition: opacity 0.2s;\n}\n.remove-btn:hover {\n  opacity: 1;\n}\n.editor-footer {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  border-top: 1px solid var(--border-color, #333);\n  background: var(--bg-tertiary, #16162a);\n  border-radius: 0 0 12px 12px;\n}\n.footer-buttons {\n  display: flex;\n  gap: 12px;\n}\n.cancel-btn {\n  padding: 10px 24px;\n  background: transparent;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text-muted, #a0aec0);\n  font-size: 0.95rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.cancel-btn:hover {\n  background: var(--bg, #1e293b);\n  color: var(--text, #e2e8f0);\n}\n.delete-btn {\n  padding: 10px 24px;\n  background: transparent;\n  border: 1px solid #ef4444;\n  border-radius: 6px;\n  color: #ef4444;\n  font-size: 0.95rem;\n  cursor: pointer;\n  transition: all 0.2s;\n  margin-right: auto;\n}\n.delete-btn:hover {\n  background: #ef4444;\n  color: #fff;\n}\n.save-btn {\n  padding: 10px 32px;\n  background: #22c55e;\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.95rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.save-btn:hover {\n  background: #16a34a;\n}\n@media (max-width: 900px) {\n  .editor-content {\n    grid-template-columns: 1fr;\n  }\n}\n@media (max-width: 600px) {\n  .editor-header,\n  .editor-footer {\n    padding: 12px 16px;\n  }\n  .editor-content {\n    padding: 16px;\n  }\n  .type-selector {\n    flex-direction: column;\n  }\n  .requirements-grid,\n  .stat-modifiers-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  .form-row {\n    flex-direction: column;\n    gap: 0;\n  }\n}\n/*# sourceMappingURL=item-editor.component.css.map */\n"] }]
  }], null, { item: [{
    type: Input
  }], sheet: [{
    type: Input
  }], availableSkills: [{
    type: Input
  }], availableSpells: [{
    type: Input
  }], librarySkills: [{
    type: Input
  }], librarySpells: [{
    type: Input
  }], showLibraryImport: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }], delete: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ItemEditorComponent, { className: "ItemEditorComponent", filePath: "app/sheet/item-editor/item-editor.component.ts", lineNumber: 26 });
})();

// src/app/sheet/spell/spell.component.ts
var _c04 = ["canvas"];
var _forTrack05 = ($index, $item) => $item.label;
function SpellComponent_Conditional_1_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 12);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("innerHTML", ctx_r1.enhancedDescription, \u0275\u0275sanitizeHtml);
  }
}
function SpellComponent_Conditional_1_Conditional_14_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r3 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tag_r3);
  }
}
function SpellComponent_Conditional_1_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 13);
    \u0275\u0275repeaterCreate(1, SpellComponent_Conditional_1_Conditional_14_For_2_Template, 2, 1, "span", 23, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.spell.tags);
  }
}
function SpellComponent_Conditional_1_For_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 24);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const req_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("scv-req--unmet", !ctx_r1.meetsStatRequirement(req_r4.key, req_r4.value));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", req_r4.label, "\xA0", req_r4.value, " ");
  }
}
function SpellComponent_Conditional_1_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 19);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u25C6\xA0", ctx_r1.spell.costMana);
  }
}
function SpellComponent_Conditional_1_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u25C6\xA0", ctx_r1.spell.costFokus);
  }
}
function SpellComponent_Conditional_1_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 21);
    \u0275\u0275text(1, "Kostenlos");
    \u0275\u0275elementEnd();
  }
}
function SpellComponent_Conditional_1_Conditional_24_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 25);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.spell.perTurnMana, "/Rd");
  }
}
function SpellComponent_Conditional_1_Conditional_24_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 26);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.spell.perTurnFokus, "/Rd");
  }
}
function SpellComponent_Conditional_1_Conditional_24_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u29D7\xA0", ctx_r1.spell.durationTurns, "Rd");
  }
}
function SpellComponent_Conditional_1_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275conditionalCreate(1, SpellComponent_Conditional_1_Conditional_24_Conditional_1_Template, 2, 1, "span", 25);
    \u0275\u0275conditionalCreate(2, SpellComponent_Conditional_1_Conditional_24_Conditional_2_Template, 2, 1, "span", 26);
    \u0275\u0275conditionalCreate(3, SpellComponent_Conditional_1_Conditional_24_Conditional_3_Template, 2, 1, "span", 27);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spell.perTurnMana ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spell.perTurnFokus ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spell.durationTurns ? 3 : -1);
  }
}
function SpellComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 3)(1, "div", 4)(2, "span", 5);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 6);
    \u0275\u0275text(5, "ZAUBER");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 7);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 8)(9, "button", 9);
    \u0275\u0275listener("click", function SpellComponent_Conditional_1_Template_button_click_9_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.openEditor.emit();
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275element(10, "span", 10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 11);
    \u0275\u0275listener("click", function SpellComponent_Conditional_1_Template_button_click_11_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.deleteSpell();
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(12, "\u2715");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(13, SpellComponent_Conditional_1_Conditional_13_Template, 1, 1, "div", 12);
    \u0275\u0275conditionalCreate(14, SpellComponent_Conditional_1_Conditional_14_Template, 3, 0, "div", 13);
    \u0275\u0275elementStart(15, "div", 14)(16, "div", 15);
    \u0275\u0275repeaterCreate(17, SpellComponent_Conditional_1_For_18_Template, 2, 4, "span", 16, _forTrack05);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "div", 17)(20, "div", 18);
    \u0275\u0275conditionalCreate(21, SpellComponent_Conditional_1_Conditional_21_Template, 2, 1, "span", 19);
    \u0275\u0275conditionalCreate(22, SpellComponent_Conditional_1_Conditional_22_Template, 2, 1, "span", 20);
    \u0275\u0275conditionalCreate(23, SpellComponent_Conditional_1_Conditional_23_Template, 2, 0, "span", 21);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(24, SpellComponent_Conditional_1_Conditional_24_Template, 4, 3, "div", 22);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("--sc", ctx_r1.spell.strokeColor || "#8b5cf6");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", ctx_r1.spell.strokeColor || "#8b5cf6");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.spell.icon || "\u2726");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.spell.name || "Unbekannter Zauber");
    \u0275\u0275advance(6);
    \u0275\u0275conditional(ctx_r1.spell.description ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spell.tags.length ? 14 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r1.statReqEntries);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r1.spell.costMana ? 21 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spell.costFokus ? 22 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.spell.costMana && !ctx_r1.spell.costFokus ? 23 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spell.perTurnMana || ctx_r1.spell.perTurnFokus || ctx_r1.spell.durationTurns ? 24 : -1);
  }
}
function SpellComponent_Conditional_2_Conditional_0_Conditional_16_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 69);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Conditional_16_For_3_Template_button_click_0_listener() {
      const color_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.selectColor(color_r9));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const color_r9 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275styleProp("background", color_r9)("border-color", color_r9 === "#ffffff" ? "#666" : color_r9);
    \u0275\u0275classProp("active", ctx_r1.strokeColor === color_r9);
    \u0275\u0275property("title", color_r9);
  }
}
function SpellComponent_Conditional_2_Conditional_0_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 52)(1, "div", 64);
    \u0275\u0275repeaterCreate(2, SpellComponent_Conditional_2_Conditional_0_Conditional_16_For_3_Template, 1, 7, "button", 65, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementStart(4, "label", 66)(5, "input", 67);
    \u0275\u0275listener("input", function SpellComponent_Conditional_2_Conditional_0_Conditional_16_Template_input_input_5_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onColorInput($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275element(6, "span", 68);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.presetColors);
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r1.strokeColor);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", ctx_r1.strokeColor);
  }
}
function SpellComponent_Conditional_2_Conditional_0_Conditional_17_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 73);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Conditional_17_For_5_Template_button_click_0_listener() {
      const size_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.selectEraserSize(size_r11));
    });
    \u0275\u0275element(1, "span", 74);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const size_r11 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("active", ctx_r1.eraserSize === size_r11);
    \u0275\u0275property("title", size_r11 + "px");
    \u0275\u0275advance();
    \u0275\u0275styleProp("width", ctx_r1.Math.min(size_r11, 24), "px")("height", ctx_r1.Math.min(size_r11, 24), "px");
  }
}
function SpellComponent_Conditional_2_Conditional_0_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 52)(1, "span", 70);
    \u0275\u0275text(2, "Eraser Size:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 71);
    \u0275\u0275repeaterCreate(4, SpellComponent_Conditional_2_Conditional_0_Conditional_17_For_5_Template, 2, 7, "button", 72, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r1.eraserSizes);
  }
}
function SpellComponent_Conditional_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 28)(1, "div", 43)(2, "h3");
    \u0275\u0275element(3, "span", 44);
    \u0275\u0275text(4, " Edit Spell Drawing");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 45);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.closeFullscreenDrawing());
    });
    \u0275\u0275text(6, "\u2715 Close");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 46)(8, "div", 47)(9, "div", 48)(10, "button", 49);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.setDrawMode());
    });
    \u0275\u0275elementStart(11, "span", 50);
    \u0275\u0275element(12, "span", 10);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "button", 51);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleEraser());
    });
    \u0275\u0275elementStart(14, "span", 50);
    \u0275\u0275text(15, "\u{1F9F9}");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(16, SpellComponent_Conditional_2_Conditional_0_Conditional_16_Template, 7, 3, "div", 52);
    \u0275\u0275conditionalCreate(17, SpellComponent_Conditional_2_Conditional_0_Conditional_17_Template, 6, 0, "div", 52);
    \u0275\u0275elementStart(18, "div", 53)(19, "button", 54);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.undo());
    });
    \u0275\u0275elementStart(20, "span", 50);
    \u0275\u0275text(21, "\u21B6");
    \u0275\u0275elementEnd();
    \u0275\u0275text(22, " Undo ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "button", 55);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_23_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.clearCanvas());
    });
    \u0275\u0275elementStart(24, "span", 50);
    \u0275\u0275element(25, "span", 56);
    \u0275\u0275elementEnd();
    \u0275\u0275text(26, " Clear ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(27, "div", 57)(28, "button", 58);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_28_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.expandTop());
    });
    \u0275\u0275text(29, "\u25B2");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "button", 59);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_30_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.expandLeft());
    });
    \u0275\u0275text(31, "\u25C4");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "button", 60);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_32_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.expandRight());
    });
    \u0275\u0275text(33, "\u25BA");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "button", 61);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_0_Template_button_click_34_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.expandBottom());
    });
    \u0275\u0275text(35, "\u25BC");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "div", 62)(37, "canvas", 63, 0);
    \u0275\u0275listener("pointerdown", function SpellComponent_Conditional_2_Conditional_0_Template_canvas_pointerdown_37_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.startDrawing($event));
    })("pointermove", function SpellComponent_Conditional_2_Conditional_0_Template_canvas_pointermove_37_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.draw($event));
    })("pointerup", function SpellComponent_Conditional_2_Conditional_0_Template_canvas_pointerup_37_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.stopDrawing());
    })("pointerleave", function SpellComponent_Conditional_2_Conditional_0_Template_canvas_pointerleave_37_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.stopDrawing());
    })("pointercancel", function SpellComponent_Conditional_2_Conditional_0_Template_canvas_pointercancel_37_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.stopDrawing());
    });
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275classProp("active", !ctx_r1.isErasing());
    \u0275\u0275advance(3);
    \u0275\u0275classProp("active", ctx_r1.isErasing());
    \u0275\u0275advance(3);
    \u0275\u0275conditional(!ctx_r1.isErasing() ? 16 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isErasing() ? 17 : -1);
    \u0275\u0275advance(19);
    \u0275\u0275classProp("panning", ctx_r1.isPanning());
    \u0275\u0275advance();
    \u0275\u0275attribute("width", ctx_r1.canvasWidth())("height", ctx_r1.canvasHeight());
  }
}
function SpellComponent_Conditional_2_Conditional_15_Conditional_3_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 75);
    \u0275\u0275element(1, "img", 77);
    \u0275\u0275pipe(2, "imageUrl");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275property("src", \u0275\u0275pipeBind1(2, 1, ctx_r1.spell.drawing), \u0275\u0275sanitizeUrl);
  }
}
function SpellComponent_Conditional_2_Conditional_15_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275conditionalCreate(0, SpellComponent_Conditional_2_Conditional_15_Conditional_3_Conditional_0_Template, 3, 3, "div", 75);
    \u0275\u0275elementStart(1, "button", 76);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Conditional_15_Conditional_3_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.openFullscreenDrawing());
    });
    \u0275\u0275element(2, "span", 10);
    \u0275\u0275text(3, " Edit Drawing in Fullscreen ");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275conditional(ctx_r1.spell.drawing ? 0 : -1);
  }
}
function SpellComponent_Conditional_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 30)(1, "label");
    \u0275\u0275text(2, "Draw Spell Symbol");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, SpellComponent_Conditional_2_Conditional_15_Conditional_3_Template, 4, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r1.hasDrawing ? 3 : -1);
  }
}
function SpellComponent_Conditional_2_Conditional_26_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 80);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r14 = ctx.$implicit;
    \u0275\u0275property("value", item_r14);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r14);
  }
}
function SpellComponent_Conditional_2_Conditional_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "label");
    \u0275\u0275text(2, "Bound Item");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 78);
    \u0275\u0275listener("ngModelChange", function SpellComponent_Conditional_2_Conditional_26_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateField("binding.itemName", $event));
    });
    \u0275\u0275elementStart(4, "option", 79);
    \u0275\u0275text(5, "Select an item...");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(6, SpellComponent_Conditional_2_Conditional_26_For_7_Template, 2, 2, "option", 80, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 81)(9, "div", 30)(10, "label");
    \u0275\u0275text(11, "Durability");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 82);
    \u0275\u0275listener("ngModelChange", function SpellComponent_Conditional_2_Conditional_26_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateField("binding.durability", +$event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 30)(14, "label");
    \u0275\u0275text(15, "Max Durability");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "input", 83);
    \u0275\u0275listener("ngModelChange", function SpellComponent_Conditional_2_Conditional_26_Template_input_ngModelChange_16_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.updateField("binding.maxDurability", +$event));
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", ctx_r1.spell.binding.itemName);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r1.availableItems);
    \u0275\u0275advance(6);
    \u0275\u0275property("ngModel", ctx_r1.spell.binding.durability || 0);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", ctx_r1.spell.binding.maxDurability || 10);
  }
}
function SpellComponent_Conditional_2_For_32_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 84);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_For_32_Template_button_click_0_listener() {
      const tag_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleTag(tag_r16));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r16 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", ctx_r1.hasTag(tag_r16));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", tag_r16, " ");
  }
}
function SpellComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275conditionalCreate(0, SpellComponent_Conditional_2_Conditional_0_Template, 39, 10, "div", 28);
    \u0275\u0275elementStart(1, "div", 29);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r5);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 30)(3, "label");
    \u0275\u0275text(4, "Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 31);
    \u0275\u0275listener("ngModelChange", function SpellComponent_Conditional_2_Template_input_ngModelChange_5_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.updateField("name", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 30)(7, "label");
    \u0275\u0275text(8, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "textarea", 32);
    \u0275\u0275listener("ngModelChange", function SpellComponent_Conditional_2_Template_textarea_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.updateField("description", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 33)(11, "label", 34)(12, "input", 35);
    \u0275\u0275twoWayListener("ngModelChange", function SpellComponent_Conditional_2_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.hasDrawing, $event) || (ctx_r1.hasDrawing = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span");
    \u0275\u0275text(14, "Add spell symbol drawing");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(15, SpellComponent_Conditional_2_Conditional_15_Template, 4, 1, "div", 30);
    \u0275\u0275elementStart(16, "div", 30)(17, "label");
    \u0275\u0275text(18, "Binding Type");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "div", 36)(20, "label", 37)(21, "input", 38);
    \u0275\u0275listener("change", function SpellComponent_Conditional_2_Template_input_change_21_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.updateField("binding.type", "learned"));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(22, " Learned ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "label", 37)(24, "input", 38);
    \u0275\u0275listener("change", function SpellComponent_Conditional_2_Template_input_change_24_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.updateField("binding.type", "item"));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(25, " Item-Bound ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(26, SpellComponent_Conditional_2_Conditional_26_Template, 17, 3);
    \u0275\u0275elementStart(27, "div", 30)(28, "label");
    \u0275\u0275text(29, "Tags");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "div", 39);
    \u0275\u0275repeaterCreate(31, SpellComponent_Conditional_2_For_32_Template, 2, 3, "button", 40, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "div", 41)(34, "button", 42);
    \u0275\u0275listener("click", function SpellComponent_Conditional_2_Template_button_click_34_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleEdit());
    });
    \u0275\u0275text(35, "Done");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275conditional(ctx_r1.hasDrawing && ctx_r1.isFullscreenDrawing() ? 0 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngModel", ctx_r1.spell.name);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", ctx_r1.spell.description);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.hasDrawing);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r1.hasDrawing ? 15 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275property("checked", ctx_r1.spell.binding.type === "learned");
    \u0275\u0275advance(3);
    \u0275\u0275property("checked", ctx_r1.spell.binding.type === "item");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.spell.binding.type === "item" ? 26 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r1.tagOptions);
  }
}
var SpellComponent = class _SpellComponent {
  cd;
  sanitizer;
  imageService;
  canvasRef;
  spell;
  sheet;
  index;
  isEditing = false;
  patch = new EventEmitter();
  delete = new EventEmitter();
  editingChange = new EventEmitter();
  openEditor = new EventEmitter();
  cast = new EventEmitter();
  /** Emitted on left-click — open the cast window for this spell */
  openCastView = new EventEmitter();
  /** Emitted on right-click — parent component renders the context menu */
  contextMenuRequest = new EventEmitter();
  tagOptions = SPELL_TAG_OPTIONS;
  glowColors = SPELL_GLOW_COLORS;
  hasDrawing = false;
  canvasWidth = signal(600, ...ngDevMode ? [{ debugName: "canvasWidth" }] : []);
  canvasHeight = signal(300, ...ngDevMode ? [{ debugName: "canvasHeight" }] : []);
  isErasing = signal(false, ...ngDevMode ? [{ debugName: "isErasing" }] : []);
  isPanning = signal(false, ...ngDevMode ? [{ debugName: "isPanning" }] : []);
  isFullscreenDrawing = signal(false, ...ngDevMode ? [{ debugName: "isFullscreenDrawing" }] : []);
  // Preset colors for color picker
  presetColors = [
    "#ff0000",
    "#ff6600",
    "#ffcc00",
    "#00ff00",
    "#00ffff",
    "#0066ff",
    "#6600ff",
    "#ff00ff",
    "#ffffff",
    "#000000"
  ];
  // Eraser sizes
  eraserSizes = [10, 20, 30, 40];
  eraserSize = 20;
  // Make Math available in template
  Math = Math;
  ctx;
  isDrawing = false;
  lastX = 0;
  lastY = 0;
  expandAmount = 200;
  // Pixels to add when expanding
  undoHistory = [];
  // Undo history
  maxUndoSteps = 20;
  panStartX = 0;
  panStartY = 0;
  constructor(cd, sanitizer, imageService) {
    this.cd = cd;
    this.sanitizer = sanitizer;
    this.imageService = imageService;
  }
  canvasInitialized = false;
  ngOnInit() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  ngOnDestroy() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }
  handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "z" && this.isEditing && this.hasDrawing && this.isDrawing === false) {
      event.preventDefault();
      this.undo();
    }
  }
  ngAfterViewInit() {
    this.tryInitCanvas();
  }
  ngAfterViewChecked() {
    this.tryInitCanvas();
  }
  tryInitCanvas() {
    if (this.isEditing && this.hasDrawing && this.canvasRef && !this.canvasInitialized) {
      this.initCanvas();
      this.canvasInitialized = true;
    } else if (!this.isEditing || !this.hasDrawing) {
      this.canvasInitialized = false;
    }
  }
  toggleDrawing() {
    this.hasDrawing = !this.hasDrawing;
    this.canvasInitialized = false;
    if (!this.hasDrawing) {
      this.updateField("drawing", void 0);
    }
  }
  get strokeColor() {
    return this.spell.strokeColor || "#673ab7";
  }
  initCanvas() {
    if (!this.canvasRef)
      return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext("2d");
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.shadowColor = this.strokeColor;
    this.ctx.shadowBlur = 20;
    if (this.spell.drawing) {
      const img = new Image();
      img.onload = () => {
        this.canvasWidth.set(img.width);
        this.canvasHeight.set(img.height);
        requestAnimationFrame(() => {
          if (this.ctx) {
            this.ctx.fillStyle = "#000";
            this.ctx.fillRect(0, 0, canvas.width, canvas.height);
            this.ctx.drawImage(img, 0, 0);
            this.ctx.strokeStyle = this.strokeColor;
            this.ctx.shadowColor = this.strokeColor;
            this.ctx.shadowBlur = 20;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.saveToHistory();
          }
        });
      };
      img.src = this.imageService.getImageUrl(this.spell.drawing) || "";
    } else {
      this.clearCanvas();
      this.saveToHistory();
    }
  }
  get enhancedDescription() {
    const original = this.spell.description || "Keine Beschreibung";
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }
  get statReqEntries() {
    const req = this.spell.statRequirements;
    if (!req)
      return [];
    const map = [
      { key: "strength", label: "STR" },
      { key: "dexterity", label: "GES" },
      { key: "speed", label: "SPD" },
      { key: "intelligence", label: "INT" },
      { key: "constitution", label: "KON" },
      { key: "chill", label: "CHR" }
    ];
    return map.filter((m) => req[m.key] > 0).map((m) => ({ key: m.key, label: m.label, value: req[m.key] }));
  }
  meetsStatRequirement(key, value) {
    const stat = this.sheet[key];
    const current = stat?.current ?? 0;
    return current >= value;
  }
  get isDisabled() {
    return false;
  }
  get hasCostSchedule() {
    return (this.spell.costSchedule?.cases?.length ?? 0) > 0;
  }
  get availableItems() {
    const allItems = [...this.sheet.inventory || [], ...this.sheet.equipment || []].filter((x) => x !== null && x !== void 0);
    return allItems.map((item) => item.name);
  }
  onRightClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuRequest.emit({ x: event.clientX, y: event.clientY, index: this.index });
  }
  async toggleEdit() {
    const newEditingState = !this.isEditing;
    this.editingChange.emit(newEditingState);
    if (newEditingState) {
      this.hasDrawing = !!this.spell.drawing;
      setTimeout(() => {
        if (this.hasDrawing && this.canvasRef) {
          this.initCanvas();
        }
        this.cd.detectChanges();
      }, 0);
    } else {
      if (this.hasDrawing && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        const dataUrl = canvas.toDataURL("image/png");
        const imageId = await this.imageService.uploadImage(dataUrl);
        this.updateField("drawing", imageId);
      } else if (!this.hasDrawing) {
        this.updateField("drawing", void 0);
      }
    }
  }
  startDrawing(event) {
    if (!this.canvasRef)
      return;
    if (event.button === 1) {
      event.preventDefault();
      this.isPanning.set(true);
      const container = this.canvasRef.nativeElement.parentElement;
      if (container) {
        this.panStartX = event.clientX + container.scrollLeft;
        this.panStartY = event.clientY + container.scrollTop;
      }
      return;
    }
    if (event.button === 0) {
      this.isDrawing = true;
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.lastX = event.clientX - rect.left;
      this.lastY = event.clientY - rect.top;
      this.saveToHistory();
    }
  }
  draw(event) {
    if (!this.canvasRef)
      return;
    if (this.isPanning()) {
      const container = this.canvasRef.nativeElement.parentElement;
      if (container) {
        container.scrollLeft = this.panStartX - event.clientX;
        container.scrollTop = this.panStartY - event.clientY;
      }
      return;
    }
    if (!this.isDrawing || !this.ctx)
      return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (this.isErasing()) {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = this.eraserSize;
      this.ctx.shadowBlur = 0;
    } else {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = 2;
    }
    const blurLevels = this.isErasing() ? [0] : [30, 20, 10, 5];
    blurLevels.forEach((blur) => {
      this.ctx.shadowBlur = blur;
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    });
    this.lastX = x;
    this.lastY = y;
  }
  stopDrawing() {
    this.isDrawing = false;
    this.isPanning.set(false);
  }
  expandLeft() {
    this.expandCanvas("left");
  }
  expandRight() {
    this.expandCanvas("right");
  }
  expandTop() {
    this.expandCanvas("top");
  }
  expandBottom() {
    this.expandCanvas("bottom");
  }
  expandCanvas(direction) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx)
      return;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx)
      return;
    tempCtx.drawImage(canvas, 0, 0);
    let newWidth = this.canvasWidth();
    let newHeight = this.canvasHeight();
    let offsetX = 0;
    let offsetY = 0;
    switch (direction) {
      case "left":
        newWidth += this.expandAmount;
        offsetX = this.expandAmount;
        break;
      case "right":
        newWidth += this.expandAmount;
        break;
      case "top":
        newHeight += this.expandAmount;
        offsetY = this.expandAmount;
        break;
      case "bottom":
        newHeight += this.expandAmount;
        break;
    }
    this.canvasWidth.set(newWidth);
    this.canvasHeight.set(newHeight);
    requestAnimationFrame(() => {
      if (this.ctx && canvas) {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(tempCanvas, offsetX, offsetY);
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.shadowColor = this.strokeColor;
        this.ctx.shadowBlur = 20;
        this.ctx.globalCompositeOperation = this.isErasing() ? "destination-out" : "source-over";
        this.saveToHistory();
      }
    });
  }
  clearCanvas() {
    if (!this.canvasRef || !this.ctx)
      return;
    this.canvasWidth.set(600);
    this.canvasHeight.set(300);
    this.undoHistory = [];
    setTimeout(() => {
      if (!this.ctx || !this.canvasRef)
        return;
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.saveToHistory();
    }, 0);
  }
  updateField(field, value) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }
  toggleTag(tag) {
    if (!this.spell.tags) {
      this.spell.tags = [];
    }
    const index = this.spell.tags.indexOf(tag);
    let newTags;
    if (index > -1) {
      newTags = this.spell.tags.filter((t) => t !== tag);
    } else {
      newTags = [...this.spell.tags, tag];
    }
    this.updateField("tags", newTags);
  }
  updateStrokeColor(color) {
    this.updateField("strokeColor", color);
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }
  hasTag(tag) {
    return this.spell.tags?.includes(tag) || false;
  }
  deleteSpell() {
    this.delete.emit();
  }
  handleTouch(event) {
    event.preventDefault();
    if (!this.canvasRef)
      return;
    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.isDrawing = true;
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
  }
  handleTouchMove(event) {
    event.preventDefault();
    if (!this.isDrawing || !this.ctx || !this.canvasRef)
      return;
    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }
  toggleEraser() {
    this.isErasing.set(!this.isErasing());
  }
  setDrawMode() {
    this.isErasing.set(false);
  }
  selectColor(color) {
    this.updateField("strokeColor", color);
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
    }
  }
  onColorInput(event) {
    const input = event.target;
    this.selectColor(input.value);
  }
  selectEraserSize(size) {
    this.eraserSize = size;
  }
  openFullscreenDrawing() {
    this.isFullscreenDrawing.set(true);
    setTimeout(() => {
      if (this.canvasRef) {
        this.canvasInitialized = false;
        this.initCanvas();
        this.canvasInitialized = true;
      }
    }, 0);
  }
  async closeFullscreenDrawing() {
    if (this.hasDrawing && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      const dataUrl = canvas.toDataURL("image/png");
      const imageId = await this.imageService.uploadImage(dataUrl);
      this.updateField("drawing", imageId);
    }
    this.isFullscreenDrawing.set(false);
  }
  saveToHistory() {
    if (!this.canvasRef || !this.ctx)
      return;
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.undoHistory.push(imageData);
    if (this.undoHistory.length > this.maxUndoSteps) {
      this.undoHistory.shift();
    }
  }
  undo() {
    if (!this.canvasRef || !this.ctx || this.undoHistory.length < 2)
      return;
    this.undoHistory.pop();
    const previousState = this.undoHistory[this.undoHistory.length - 1];
    if (previousState) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.ctx.putImageData(previousState, 0, 0);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.shadowColor = this.strokeColor;
      this.ctx.shadowBlur = 20;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    }
  }
  static \u0275fac = function SpellComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SpellComponent)(\u0275\u0275directiveInject(ChangeDetectorRef), \u0275\u0275directiveInject(DomSanitizer), \u0275\u0275directiveInject(ImageService));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SpellComponent, selectors: [["app-spell"]], viewQuery: function SpellComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c04, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.canvasRef = _t.first);
    }
  }, inputs: { spell: "spell", sheet: "sheet", index: "index", isEditing: "isEditing" }, outputs: { patch: "patch", delete: "delete", editingChange: "editingChange", openEditor: "openEditor", cast: "cast", openCastView: "openCastView", contextMenuRequest: "contextMenuRequest" }, decls: 3, vars: 3, consts: [["canvas", ""], [1, "spell-card", 3, "contextmenu", "click"], [1, "scv", 3, "--sc"], [1, "scv"], [1, "scv-bar"], [1, "scv-icon"], [1, "scv-type"], [1, "scv-name"], [1, "scv-actions"], ["title", "Bearbeiten", 1, "scv-edit-btn", 3, "click"], [1, "app-icon", "i-draw"], ["title", "L\xF6schen", 1, "scv-del-btn", 3, "click"], [1, "scv-desc", 3, "innerHTML"], [1, "scv-tags"], [1, "scv-footer"], [1, "scv-reqs"], [1, "scv-req", 3, "scv-req--unmet"], [1, "scv-cost-block"], [1, "scv-cost-row"], [1, "scv-cost", "scv-cost--mana"], [1, "scv-cost", "scv-cost--fokus"], [1, "scv-cost", "scv-cost--free"], [1, "scv-cost-row", "scv-cost-row--sub"], [1, "scv-tag"], [1, "scv-req"], [1, "scv-perturn", "scv-perturn--mana"], [1, "scv-perturn", "scv-perturn--fokus"], [1, "scv-duration"], [1, "fullscreen-overlay"], [1, "spell-edit", 3, "click"], [1, "field"], ["type", "text", 3, "ngModelChange", "ngModel"], ["rows", "3", 3, "ngModelChange", "ngModel"], [1, "field", "checkbox-field"], [1, "checkbox-label"], ["type", "checkbox", "name", "hasDrawing", 3, "ngModelChange", "ngModel"], [1, "binding-type-selector"], [1, "radio-label"], ["type", "radio", 3, "change", "checked"], [1, "tag-selector"], ["type", "button", 1, "tag-option", 3, "selected"], [1, "spell-actions"], [1, "save-btn", 3, "click"], [1, "fullscreen-header"], [1, "app-icon", "i-spell"], ["type", "button", 1, "close-fullscreen-btn", 3, "click"], [1, "fullscreen-content"], [1, "drawing-toolbar"], [1, "toolbar-section", "tools"], ["type", "button", "title", "Draw Mode", 1, "toolbar-btn", 3, "click"], [1, "btn-icon"], ["type", "button", "title", "Eraser Mode", 1, "toolbar-btn", 3, "click"], [1, "toolbar-section", "brush-settings"], [1, "toolbar-section", "actions"], ["type", "button", "title", "Undo (Ctrl+Z)", 1, "action-btn", 3, "click"], ["type", "button", "title", "Clear Drawing", 1, "action-btn", "clear", 3, "click"], [1, "app-icon", "i-restore-trash"], [1, "canvas-area"], ["type", "button", "title", "Expand Top", 1, "expand-btn", "expand-top", 3, "click"], ["type", "button", "title", "Expand Left", 1, "expand-btn", "expand-left", 3, "click"], ["type", "button", "title", "Expand Right", 1, "expand-btn", "expand-right", 3, "click"], ["type", "button", "title", "Expand Bottom", 1, "expand-btn", "expand-bottom", 3, "click"], [1, "fullscreen-canvas-wrapper"], [3, "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel"], [1, "color-picker"], ["type", "button", 1, "color-swatch", 3, "active", "background", "border-color", "title"], ["title", "Custom Color", 1, "custom-color"], ["type", "color", 3, "input", "value"], [1, "custom-color-preview"], ["type", "button", 1, "color-swatch", 3, "click", "title"], [1, "setting-label"], [1, "size-picker"], ["type", "button", 1, "size-btn", 3, "active", "title"], ["type", "button", 1, "size-btn", 3, "click", "title"], [1, "size-dot"], [1, "drawing-preview"], ["type", "button", 1, "edit-drawing-btn", 3, "click"], ["alt", "Spell drawing", 3, "src"], [3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], [1, "durability-fields"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"], ["type", "button", 1, "tag-option", 3, "click"]], template: function SpellComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 1);
      \u0275\u0275listener("contextmenu", function SpellComponent_Template_div_contextmenu_0_listener($event) {
        return ctx.onRightClick($event);
      })("click", function SpellComponent_Template_div_click_0_listener($event) {
        !ctx.isEditing && ctx.openCastView.emit();
        return $event.stopPropagation();
      });
      \u0275\u0275conditionalCreate(1, SpellComponent_Conditional_1_Template, 25, 12, "div", 2)(2, SpellComponent_Conditional_2_Template, 36, 8);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classProp("editing", ctx.isEditing);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.isEditing ? 1 : 2);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel, ImageUrlPipe], styles: ['\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n}\n.spell-card[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n.spell-card.editing[_ngcontent-%COMP%] {\n  cursor: default;\n}\n.scv[_ngcontent-%COMP%] {\n  background: #0f1829;\n  border-radius: 8px;\n  border: 1px solid var(--border, #374151);\n  border-left: 3px solid var(--sc, #8b5cf6);\n  overflow: hidden;\n  cursor: pointer;\n  transition: box-shadow 0.15s, transform 0.15s;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.scv[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--sc, #8b5cf6);\n  transform: translateY(-1px);\n}\n.scv-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 5px 8px;\n  background: rgba(255, 255, 255, 0.025);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  min-height: 28px;\n}\n.scv-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  flex-shrink: 0;\n  line-height: 1;\n}\n.scv-type[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--sc, #8b5cf6);\n  flex-shrink: 0;\n}\n.scv-name[_ngcontent-%COMP%] {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.scv-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n  flex-shrink: 0;\n}\n.scv-edit-btn[_ngcontent-%COMP%], \n.scv-del-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  background: transparent;\n  cursor: pointer;\n  font-size: 0.78rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  color: var(--text-muted, #9ca3af);\n  padding: 0;\n}\n.scv-edit-btn[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #c4b5fd;\n  background: rgba(139, 92, 246, 0.1);\n}\n.scv-del-btn[_ngcontent-%COMP%]:hover {\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.08);\n}\n.scv-meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  padding: 4px 8px;\n}\n.scv-cost[_ngcontent-%COMP%] {\n  padding: 1px 7px;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.scv-cost--mana[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.35);\n  color: #60a5fa;\n}\n.scv-cost--fokus[_ngcontent-%COMP%] {\n  background: rgba(109, 40, 217, 0.12);\n  border: 1px solid rgba(109, 40, 217, 0.4);\n  color: #a78bfa;\n}\n.scv-cost--free[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  color: #4b5563;\n  font-style: italic;\n}\n.scv-cost--plan[_ngcontent-%COMP%] {\n  background: rgba(167, 139, 250, 0.1);\n  border: 1px solid rgba(167, 139, 250, 0.25);\n  color: #a78bfa;\n}\n.scv-req[_ngcontent-%COMP%] {\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: #1e3a5f;\n  color: #90caf9;\n  border: 1px solid rgba(66, 165, 245, 0.5);\n  font-size: 0.68rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.scv-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 6px;\n  padding: 5px 8px 6px;\n  border-top: 1px solid rgba(255, 255, 255, 0.04);\n  min-height: 28px;\n}\n.scv-reqs[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  flex: 1;\n  align-items: center;\n}\n.scv-req[_ngcontent-%COMP%] {\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: #1e3a5f;\n  color: #90caf9;\n  border: 1px solid rgba(66, 165, 245, 0.5);\n  font-size: 0.66rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.scv-req--unmet[_ngcontent-%COMP%] {\n  background: #4d1c21;\n  color: #ffcdd2;\n  border-color: rgba(229, 115, 115, 0.6);\n  text-decoration: line-through;\n}\n.scv-cost-block[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 2px;\n  flex-shrink: 0;\n}\n.scv-cost-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  align-items: center;\n  justify-content: flex-end;\n}\n.scv-cost-row--sub[_ngcontent-%COMP%] {\n  opacity: 0.85;\n}\n.scv-perturn--mana[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 700;\n  color: #60a5fa;\n  white-space: nowrap;\n}\n.scv-perturn--fokus[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 700;\n  color: #a78bfa;\n  white-space: nowrap;\n}\n.scv-duration[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 700;\n  color: #fcd34d;\n  white-space: nowrap;\n}\n.scv-desc[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--text-muted, #9ca3af);\n  padding: 2px 8px 6px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  line-height: 1.45;\n}\n.scv-tags[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  padding: 0 8px 6px;\n}\n.scv-tag[_ngcontent-%COMP%] {\n  padding: 1px 5px;\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.65rem;\n}\n.context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  z-index: 9999;\n  min-width: 140px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\n  padding: 4px 0;\n}\n.ctx-item[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  padding: 8px 14px;\n  background: transparent;\n  border: none;\n  color: var(--text, #e5e7eb);\n  font-size: 0.88rem;\n  text-align: left;\n  cursor: pointer;\n  font-family: inherit;\n  transition: background 0.12s;\n}\n.ctx-item[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.07);\n}\n.ctx-delete[_ngcontent-%COMP%] {\n  color: #fca5a5;\n}\n.ctx-delete[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.spell-card[_ngcontent-%COMP%]:active {\n  transform: translateY(0);\n}\n.spell-card.editing[_ngcontent-%COMP%] {\n  cursor: default;\n  border-color: var(--muted);\n}\n.spell-card.disabled[_ngcontent-%COMP%] {\n  opacity: 0.6;\n  background: var(--bg);\n}\n.spell-card[_ngcontent-%COMP%]:not(.editing):hover {\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);\n  border-color: var(--accent);\n  transform: translateY(-1px);\n}\n.spell-header[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  margin-bottom: 0.5rem;\n  align-items: flex-start;\n}\n.spell-drawing[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 52px;\n  height: 52px;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 8px;\n  overflow: hidden;\n  background: #000;\n}\n.spell-drawing[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.spell-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.spell-title-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n  margin-bottom: 0.5rem;\n}\n.spell-title-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.1rem;\n  color: var(--text);\n  word-break: break-word;\n  flex: 1;\n  min-width: 0;\n}\n.sc-header[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  align-items: flex-start;\n  margin-bottom: 6px;\n}\n.sc-thumb[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 52px;\n  height: 52px;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  background: #000;\n}\n.sc-thumb[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.sc-title-block[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.sc-title-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.sc-name[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.98rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  word-break: break-word;\n  flex: 1;\n  min-width: 0;\n  line-height: 1.3;\n}\n.sc-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.sc-edit-btn[_ngcontent-%COMP%], \n.sc-del-btn[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 5px;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  background: transparent;\n  cursor: pointer;\n  font-size: 0.82rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  color: #9ca3af;\n  padding: 0;\n}\n.sc-edit-btn[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #c4b5fd;\n  background: rgba(139, 92, 246, 0.1);\n}\n.sc-del-btn[_ngcontent-%COMP%]:hover {\n  border-color: rgba(239, 68, 68, 0.5);\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.08);\n}\n.sc-costs[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  margin-bottom: 4px;\n}\n.sc-cost-pill[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 0.74rem;\n  font-weight: 600;\n}\n.sc-cost-mana[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  color: #c4b5fd;\n}\n.sc-cost-fokus[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.3);\n  color: #93c5fd;\n}\n.sc-cost-none[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #4b5563;\n  font-style: italic;\n}\n.sc-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.sc-stat-chip[_ngcontent-%COMP%] {\n  padding: 2px 7px;\n  border-radius: 4px;\n  background: rgba(245, 158, 11, 0.12);\n  border: 1px solid rgba(245, 158, 11, 0.3);\n  color: #fcd34d;\n  font-size: 0.72rem;\n  font-weight: 700;\n}\n.sc-desc[_ngcontent-%COMP%] {\n  font-size: 0.83rem;\n  color: #9ca3af;\n  margin: 6px 0 0 0;\n  line-height: 1.45;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  word-break: break-word;\n}\n.sc-tags[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 6px;\n}\n.sc-tag[_ngcontent-%COMP%] {\n  padding: 2px 7px;\n  border-radius: 4px;\n  background: rgba(25, 118, 210, 0.12);\n  border: 1px solid rgba(25, 118, 210, 0.3);\n  color: #60a5fa;\n  font-size: 0.72rem;\n}\n.sc-binding[_ngcontent-%COMP%] {\n  margin-top: 5px;\n  font-size: 0.74rem;\n  color: #6b7280;\n}\n.sc-binding-missing[_ngcontent-%COMP%] {\n  color: #f87171;\n  text-decoration: line-through;\n}\n.sc-durability[_ngcontent-%COMP%] {\n  margin-left: 4px;\n  opacity: 0.7;\n}\n@keyframes _ngcontent-%COMP%_spell-glow {\n  0%, 100% {\n    box-shadow:\n      0 0 40px rgba(103, 58, 183, 1),\n      0 0 80px rgba(103, 58, 183, 0.8),\n      0 0 120px rgba(103, 58, 183, 0.6),\n      inset 0 0 20px rgba(103, 58, 183, 0.4);\n    filter: brightness(1.2);\n  }\n  50% {\n    box-shadow:\n      0 0 60px rgba(103, 58, 183, 1),\n      0 0 120px rgba(103, 58, 183, 1),\n      0 0 180px rgba(103, 58, 183, 0.8),\n      inset 0 0 30px rgba(103, 58, 183, 0.6);\n    filter: brightness(1.4);\n  }\n}\n.spell-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n.spell-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.9rem;\n  transition: all 0.2s;\n  flex: 1;\n  font-weight: 600;\n}\n.save-btn[_ngcontent-%COMP%] {\n  background-color: var(--accent);\n  color: white;\n}\n.save-btn[_ngcontent-%COMP%]:hover {\n  background-color: var(--accentdark);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);\n}\n.delete-btn[_ngcontent-%COMP%] {\n  background-color: #f44336;\n  color: white;\n}\n.delete-btn[_ngcontent-%COMP%]:hover {\n  background-color: #e53935;\n  transform: translateY(-1px);\n  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);\n}\n.field[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n}\n.field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 0.25rem;\n  font-weight: 500;\n  font-size: 0.9rem;\n  color: var(--text);\n}\n.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], \n.field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 0.5rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  font-family: inherit;\n  font-size: 0.9rem;\n  box-sizing: border-box;\n  background: var(--bg);\n  color: var(--text);\n}\n.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus, \n.field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  resize: vertical;\n}\n.binding-type-selector[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n}\n.radio-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  font-weight: normal;\n}\n.radio-label[_ngcontent-%COMP%]   input[type=radio][_ngcontent-%COMP%] {\n  width: auto;\n  cursor: pointer;\n}\n.durability-fields[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}\n.tag-selector[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.tag-option[_ngcontent-%COMP%] {\n  padding: 0.4rem 0.8rem;\n  background: var(--bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  transition: all 0.2s;\n}\n.tag-option[_ngcontent-%COMP%]:hover {\n  background: var(--card);\n  border-color: var(--accent);\n}\n.tag-option.selected[_ngcontent-%COMP%] {\n  background: rgba(25, 118, 210, 0.2);\n  color: #64b5f6;\n  border-color: rgba(25, 118, 210, 0.4);\n}\n.spell-edit[_ngcontent-%COMP%] {\n  pointer-events: all;\n}\n.canvas-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.canvas-container[_ngcontent-%COMP%] {\n  border: 2px solid var(--border);\n  border-radius: 4px;\n  display: inline-block;\n  background: #000;\n  cursor: crosshair;\n  overflow: auto;\n  max-width: 100%;\n  max-height: 70vh;\n  touch-action: none;\n}\n.canvas-container.panning[_ngcontent-%COMP%] {\n  cursor: grab;\n}\n.canvas-container.panning[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\ncanvas[_ngcontent-%COMP%] {\n  display: block;\n  touch-action: none;\n  background: #000;\n  cursor: crosshair;\n}\n.color-selector[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n.color-option[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  border: 2px solid var(--border);\n  cursor: pointer;\n  transition: all 0.2s;\n  position: relative;\n}\n.color-option[_ngcontent-%COMP%]:hover {\n  transform: scale(1.1);\n}\n.color-option.selected[_ngcontent-%COMP%] {\n  border-color: var(--text);\n  box-shadow: 0 0 8px currentColor;\n}\n.color-option.selected[_ngcontent-%COMP%]::after {\n  content: "\\2713";\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  color: #000;\n  font-size: 14px;\n  font-weight: bold;\n  text-shadow: 0 0 2px #fff;\n}\n.clear-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: #ff9800;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  font-weight: 600;\n  transition: all 0.2s;\n  align-self: flex-start;\n}\n.clear-btn[_ngcontent-%COMP%]:hover {\n  background: #f57c00;\n  transform: translateY(-1px);\n  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);\n}\n.expand-btn[_ngcontent-%COMP%] {\n  padding: 0.4rem 0.8rem;\n  background: #f0f0f0;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n  transition: all 0.2s;\n  min-width: 40px;\n}\n.expand-btn[_ngcontent-%COMP%]:hover {\n  background: #d0d0d0;\n  border-color: var(--accent);\n}\n.fullscreen-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.95);\n  z-index: 10000;\n  display: flex;\n  flex-direction: column;\n}\n.fullscreen-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 2rem;\n  background: rgba(255, 255, 255, 0.1);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n}\n.fullscreen-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: white;\n  font-size: 1.5rem;\n}\n.close-fullscreen-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: #ff5252;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n.close-fullscreen-btn[_ngcontent-%COMP%]:hover {\n  background: #ff1744;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 8px rgba(255, 82, 82, 0.4);\n}\n.fullscreen-content[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 2rem;\n  overflow: auto;\n  width: 100%;\n}\n.drawing-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 1rem;\n  padding: 0.5rem 1rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  margin-bottom: 1.5rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.toolbar-section[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.toolbar-section.tools[_ngcontent-%COMP%] {\n  background: var(--bg);\n  padding: 0.25rem;\n  border-radius: 8px;\n}\n.toolbar-btn[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border-radius: 8px;\n  background: transparent;\n  border: 1px solid transparent;\n  color: var(--text);\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s;\n}\n.toolbar-btn[_ngcontent-%COMP%]:hover {\n  background: var(--border);\n}\n.toolbar-btn.active[_ngcontent-%COMP%] {\n  background: var(--accent);\n  border-color: var(--accent);\n  color: white;\n  box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);\n}\n.btn-icon[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n}\n.brush-settings[_ngcontent-%COMP%] {\n  background: var(--bg);\n  padding: 0.5rem;\n  border-radius: 8px;\n  gap: 1rem;\n}\n.setting-label[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--text);\n  font-weight: 500;\n}\n.color-picker[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.color-swatch[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.color-swatch[_ngcontent-%COMP%]:hover {\n  transform: scale(1.15);\n}\n.color-swatch.active[_ngcontent-%COMP%] {\n  border-color: white;\n  box-shadow: 0 0 0 2px var(--accent);\n  transform: scale(1.1);\n}\n.custom-color[_ngcontent-%COMP%] {\n  position: relative;\n  width: 28px;\n  height: 28px;\n  cursor: pointer;\n}\n.custom-color[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  position: absolute;\n  opacity: 0;\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n}\n.custom-color-preview[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  border: 2px dashed var(--border);\n  background:\n    conic-gradient(\n      red,\n      yellow,\n      lime,\n      aqua,\n      blue,\n      magenta,\n      red);\n}\n.size-picker[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.size-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border-radius: 6px;\n  background: transparent;\n  border: 1px solid transparent;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s;\n}\n.size-btn[_ngcontent-%COMP%]:hover {\n  background: var(--border);\n}\n.size-btn.active[_ngcontent-%COMP%] {\n  background: var(--accent);\n  border-color: var(--accent);\n}\n.size-dot[_ngcontent-%COMP%] {\n  border-radius: 50%;\n  background: var(--text);\n  max-width: 24px;\n  max-height: 24px;\n}\n.size-btn.active[_ngcontent-%COMP%]   .size-dot[_ngcontent-%COMP%] {\n  background: white;\n}\n.toolbar-section.actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.action-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.9rem;\n  color: var(--text);\n  transition: all 0.2s;\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.action-btn[_ngcontent-%COMP%]:hover {\n  background: var(--border);\n}\n.action-btn.clear[_ngcontent-%COMP%]:hover {\n  background: #ff4444;\n  color: white;\n  border-color: #ff4444;\n}\n.canvas-area[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n  margin: 0 auto;\n  padding: 25px;\n}\n.expand-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  background: var(--card);\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 1.2rem;\n  transition: all 0.2s;\n  color: white;\n  z-index: 10;\n  padding: 0.4rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 36px;\n  min-height: 36px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);\n}\n.expand-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent);\n  color: white;\n  border-color: var(--accent);\n  transform: scale(1.1);\n  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);\n}\n.expand-btn.expand-top[_ngcontent-%COMP%] {\n  top: -20px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.expand-btn.expand-bottom[_ngcontent-%COMP%] {\n  bottom: -20px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.expand-btn.expand-left[_ngcontent-%COMP%] {\n  left: -20px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.expand-btn.expand-right[_ngcontent-%COMP%] {\n  right: -20px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.expand-btn.expand-top[_ngcontent-%COMP%]:hover, \n.expand-btn.expand-bottom[_ngcontent-%COMP%]:hover {\n  transform: translateX(-50%) scale(1.1);\n}\n.expand-btn.expand-left[_ngcontent-%COMP%]:hover, \n.expand-btn.expand-right[_ngcontent-%COMP%]:hover {\n  transform: translateY(-50%) scale(1.1);\n}\n.fullscreen-canvas-wrapper[_ngcontent-%COMP%] {\n  background: #000;\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  border-radius: 8px;\n  overflow: auto;\n  max-width: 95vw;\n  max-height: calc(95vh - 150px);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);\n}\n.fullscreen-canvas-wrapper[_ngcontent-%COMP%]   canvas[_ngcontent-%COMP%] {\n  display: block;\n  cursor: crosshair;\n  touch-action: none;\n}\n.fullscreen-canvas-wrapper.panning[_ngcontent-%COMP%]   canvas[_ngcontent-%COMP%] {\n  cursor: grab;\n}\n.fullscreen-canvas-wrapper.panning[_ngcontent-%COMP%]:active   canvas[_ngcontent-%COMP%] {\n  cursor: grabbing;\n}\n.drawing-preview[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  padding: 1rem;\n  background: #000;\n  max-width: 300px;\n}\n.drawing-preview[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: auto;\n  display: block;\n}\n.edit-drawing-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n.edit-drawing-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accentdark);\n  transform: translateY(-1px);\n  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);\n}\n.checkbox-field[_ngcontent-%COMP%] {\n  margin-bottom: 0.5rem;\n}\n.checkbox-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  font-weight: normal !important;\n  font-size: 0.95rem;\n}\n.checkbox-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n  margin: 0;\n}\n.checkbox-label[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.field[_ngcontent-%COMP%]   .color-picker[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 48px;\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  cursor: pointer;\n  background: var(--bg);\n  transition: all 0.2s;\n}\n.field[_ngcontent-%COMP%]   .color-picker[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent);\n  box-shadow: 0 0 15px currentColor;\n}\n.spell-drawing[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 150px;\n  height: 60px;\n  border: 2px solid var(--border);\n  border-radius: 4px;\n  overflow: hidden;\n  background: var(--card);\n}\n/*# sourceMappingURL=spell.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SpellComponent, [{
    type: Component,
    args: [{ selector: "app-spell", imports: [CommonModule, FormsModule, ImageUrlPipe], template: `<div\r
  class="spell-card"\r
  [class.editing]="isEditing"\r
  (contextmenu)="onRightClick($event)"\r
  (click)="!isEditing && openCastView.emit(); $event.stopPropagation()"\r
>\r
  @if (!isEditing) {\r
  <!-- \u2500\u2500 Trading-card style view \u2500\u2500 -->\r
  <div class="scv" [style.--sc]="spell.strokeColor || '#8b5cf6'">\r
\r
    <!-- Top bar: icon + ZAUBER type label + name + actions -->\r
    <div class="scv-bar">\r
      <span class="scv-icon" [style.color]="spell.strokeColor || '#8b5cf6'">{{ spell.icon || '\u2726' }}</span>\r
      <span class="scv-type">ZAUBER</span>\r
      <span class="scv-name">{{ spell.name || 'Unbekannter Zauber' }}</span>\r
      <div class="scv-actions">\r
        <button class="scv-edit-btn" (click)="openEditor.emit(); $event.stopPropagation()" title="Bearbeiten"><span class="app-icon i-draw"></span></button>\r
        <button class="scv-del-btn" (click)="deleteSpell(); $event.stopPropagation()" title="L\xF6schen">\u2715</button>\r
      </div>\r
    </div>\r
\r
    <!-- Description -->\r
    @if (spell.description) {\r
      <div class="scv-desc" [innerHTML]="enhancedDescription"></div>\r
    }\r
\r
    <!-- Tags -->\r
    @if (spell.tags.length) {\r
      <div class="scv-tags">\r
        @for (tag of spell.tags; track tag) {\r
          <span class="scv-tag">{{ tag }}</span>\r
        }\r
      </div>\r
    }\r
\r
    <!-- Footer: stat requirements (left) + costs (right) -->\r
    <div class="scv-footer">\r
      <!-- Stat requirements (item-like, met = blue, unmet = red strikethrough) -->\r
      <div class="scv-reqs">\r
        @for (req of statReqEntries; track req.label) {\r
          <span class="scv-req" [class.scv-req--unmet]="!meetsStatRequirement(req.key, req.value)">\r
            {{ req.label }}&nbsp;{{ req.value }}\r
          </span>\r
        }\r
      </div>\r
\r
      <!-- Cost block (right-aligned) -->\r
      <div class="scv-cost-block">\r
        <!-- Start costs -->\r
        <div class="scv-cost-row">\r
          @if (spell.costMana) {\r
            <span class="scv-cost scv-cost--mana">\u25C6&nbsp;{{ spell.costMana }}</span>\r
          }\r
          @if (spell.costFokus) {\r
            <span class="scv-cost scv-cost--fokus">\u25C6&nbsp;{{ spell.costFokus }}</span>\r
          }\r
          @if (!spell.costMana && !spell.costFokus) {\r
            <span class="scv-cost scv-cost--free">Kostenlos</span>\r
          }\r
        </div>\r
        <!-- Per-turn + duration -->\r
        @if (spell.perTurnMana || spell.perTurnFokus || spell.durationTurns) {\r
          <div class="scv-cost-row scv-cost-row--sub">\r
            @if (spell.perTurnMana) {\r
              <span class="scv-perturn scv-perturn--mana">+{{ spell.perTurnMana }}/Rd</span>\r
            }\r
            @if (spell.perTurnFokus) {\r
              <span class="scv-perturn scv-perturn--fokus">+{{ spell.perTurnFokus }}/Rd</span>\r
            }\r
            @if (spell.durationTurns) {\r
              <span class="scv-duration">\u29D7&nbsp;{{ spell.durationTurns }}Rd</span>\r
            }\r
          </div>\r
        }\r
      </div>\r
    </div>\r
  </div>\r
  } @else {\r
  <!-- Fullscreen Drawing Modal -->\r
  @if (hasDrawing && isFullscreenDrawing()) {\r
    <div class="fullscreen-overlay">\r
      <div class="fullscreen-header">\r
        <h3><span class="app-icon i-spell"></span> Edit Spell Drawing</h3>\r
        <button type="button" class="close-fullscreen-btn" (click)="closeFullscreenDrawing()">\u2715 Close</button>\r
      </div>\r
      <div class="fullscreen-content">\r
        <!-- Drawing Toolbar -->\r
        <div class="drawing-toolbar">\r
          <!-- Tool Selector -->\r
          <div class="toolbar-section tools">\r
            <button \r
              type="button"\r
              class="toolbar-btn"\r
              [class.active]="!isErasing()"\r
              title="Draw Mode"\r
              (click)="setDrawMode()"\r
            >\r
              <span class="btn-icon"><span class="app-icon i-draw"></span></span>\r
            </button>\r
            <button \r
              type="button"\r
              class="toolbar-btn"\r
              [class.active]="isErasing()"\r
              title="Eraser Mode"\r
              (click)="toggleEraser()"\r
            >\r
              <span class="btn-icon">\u{1F9F9}</span>\r
            </button>\r
          </div>\r
\r
          <!-- Draw Tool Settings -->\r
          @if (!isErasing()) {\r
            <div class="toolbar-section brush-settings">\r
              <!-- Color picker -->\r
              <div class="color-picker">\r
                @for (color of presetColors; track color) {\r
                  <button \r
                    type="button"\r
                    class="color-swatch"\r
                    [class.active]="strokeColor === color"\r
                    [style.background]="color"\r
                    [style.border-color]="color === '#ffffff' ? '#666' : color"\r
                    [title]="color"\r
                    (click)="selectColor(color)"\r
                  ></button>\r
                }\r
                <label class="custom-color" title="Custom Color">\r
                  <input \r
                    type="color" \r
                    [value]="strokeColor"\r
                    (input)="onColorInput($event)"\r
                  />\r
                  <span class="custom-color-preview" [style.background]="strokeColor"></span>\r
                </label>\r
              </div>\r
            </div>\r
          }\r
\r
          <!-- Eraser Settings -->\r
          @if (isErasing()) {\r
            <div class="toolbar-section brush-settings">\r
              <span class="setting-label">Eraser Size:</span>\r
              <div class="size-picker">\r
                @for (size of eraserSizes; track size) {\r
                  <button \r
                    type="button"\r
                    class="size-btn"\r
                    [class.active]="eraserSize === size"\r
                    [title]="size + 'px'"\r
                    (click)="selectEraserSize(size)"\r
                  >\r
                    <span class="size-dot" [style.width.px]="Math.min(size, 24)" [style.height.px]="Math.min(size, 24)"></span>\r
                  </button>\r
                }\r
              </div>\r
            </div>\r
          }\r
\r
          <!-- Actions -->\r
          <div class="toolbar-section actions">\r
            <button type="button" class="action-btn" (click)="undo()" title="Undo (Ctrl+Z)">\r
              <span class="btn-icon">\u21B6</span> Undo\r
            </button>\r
            <button type="button" class="action-btn clear" (click)="clearCanvas()" title="Clear Drawing">\r
              <span class="btn-icon"><span class="app-icon i-restore-trash"></span></span> Clear\r
            </button>\r
          </div>\r
        </div>\r
\r
        <!-- Canvas with border expansion buttons -->\r
        <div class="canvas-area">\r
          <button type="button" class="expand-btn expand-top" (click)="expandTop()" title="Expand Top">\u25B2</button>\r
          <button type="button" class="expand-btn expand-left" (click)="expandLeft()" title="Expand Left">\u25C4</button>\r
          <button type="button" class="expand-btn expand-right" (click)="expandRight()" title="Expand Right">\u25BA</button>\r
          <button type="button" class="expand-btn expand-bottom" (click)="expandBottom()" title="Expand Bottom">\u25BC</button>\r
          \r
          <div class="fullscreen-canvas-wrapper" [class.panning]="isPanning()">\r
            <canvas \r
              #canvas\r
              [attr.width]="canvasWidth()"\r
              [attr.height]="canvasHeight()"\r
              (pointerdown)="startDrawing($event)"\r
              (pointermove)="draw($event)"\r
              (pointerup)="stopDrawing()"\r
              (pointerleave)="stopDrawing()"\r
              (pointercancel)="stopDrawing()"\r
            ></canvas>\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  }\r
  \r
  <div class="spell-edit" (click)="$event.stopPropagation()">\r
    <div class="field">\r
      <label>Name</label>\r
      <input type="text" [ngModel]="spell.name" (ngModelChange)="updateField('name', $event)" />\r
    </div>\r
\r
    <div class="field">\r
      <label>Description</label>\r
      <textarea\r
        [ngModel]="spell.description"\r
        (ngModelChange)="updateField('description', $event)"\r
        rows="3"\r
      ></textarea>\r
    </div>\r
   <div class="field checkbox-field">\r
  <label class="checkbox-label">\r
    <input \r
      type="checkbox" \r
      [(ngModel)]="hasDrawing"\r
      name="hasDrawing"\r
    />\r
    <span>Add spell symbol drawing</span>\r
  </label>\r
</div>\r
\r
@if (hasDrawing) {\r
  <div class="field">\r
    <label>Draw Spell Symbol</label>\r
    @if (hasDrawing) {\r
      @if (spell.drawing) {\r
        <div class="drawing-preview">\r
          <img [src]="spell.drawing | imageUrl" alt="Spell drawing" />\r
        </div>\r
      }\r
      <button type="button" class="edit-drawing-btn" (click)="openFullscreenDrawing()">\r
        <span class="app-icon i-draw"></span> Edit Drawing in Fullscreen\r
      </button>\r
    }\r
  </div>\r
}\r
    <div class="field">\r
      <label>Binding Type</label>\r
      <div class="binding-type-selector">\r
        <label class="radio-label">\r
          <input\r
            type="radio"\r
            [checked]="spell.binding.type === 'learned'"\r
            (change)="updateField('binding.type', 'learned')"\r
          />\r
          Learned\r
        </label>\r
        <label class="radio-label">\r
          <input\r
            type="radio"\r
            [checked]="spell.binding.type === 'item'"\r
            (change)="updateField('binding.type', 'item')"\r
          />\r
          Item-Bound\r
        </label>\r
      </div>\r
    </div>\r
\r
    @if (spell.binding.type === 'item') {\r
    <div class="field">\r
      <label>Bound Item</label>\r
      <select\r
        [ngModel]="spell.binding.itemName"\r
        (ngModelChange)="updateField('binding.itemName', $event)"\r
      >\r
        <option value="">Select an item...</option>\r
        @for (item of availableItems; track item) {\r
        <option [value]="item">{{ item }}</option>\r
        }\r
      </select>\r
    </div>\r
\r
    <div class="durability-fields">\r
      <div class="field">\r
        <label>Durability</label>\r
        <input\r
          type="number"\r
          min="0"\r
          [ngModel]="spell.binding.durability || 0"\r
          (ngModelChange)="updateField('binding.durability', +$event)"\r
        />\r
      </div>\r
      <div class="field">\r
        <label>Max Durability</label>\r
        <input\r
          type="number"\r
          min="1"\r
          [ngModel]="spell.binding.maxDurability || 10"\r
          (ngModelChange)="updateField('binding.maxDurability', +$event)"\r
        />\r
      </div>\r
    </div>\r
    }\r
\r
    <div class="field">\r
      <label>Tags</label>\r
      <div class="tag-selector">\r
        @for (tag of tagOptions; track tag) {\r
        <button\r
          type="button"\r
          class="tag-option"\r
          [class.selected]="hasTag(tag)"\r
          (click)="toggleTag(tag)"\r
        >\r
          {{ tag }}\r
        </button>\r
        }\r
      </div>\r
    </div>\r
\r
    <div class="spell-actions">\r
      <button class="save-btn" (click)="toggleEdit()">Done</button>\r
    </div>\r
  </div>\r
  }\r
</div>\r
`, styles: ['/* src/app/sheet/spell/spell.component.css */\n:host {\n  display: block;\n  width: 100%;\n}\n.spell-card {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n.spell-card.editing {\n  cursor: default;\n}\n.scv {\n  background: #0f1829;\n  border-radius: 8px;\n  border: 1px solid var(--border, #374151);\n  border-left: 3px solid var(--sc, #8b5cf6);\n  overflow: hidden;\n  cursor: pointer;\n  transition: box-shadow 0.15s, transform 0.15s;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.scv:hover {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--sc, #8b5cf6);\n  transform: translateY(-1px);\n}\n.scv-bar {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 5px 8px;\n  background: rgba(255, 255, 255, 0.025);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  min-height: 28px;\n}\n.scv-icon {\n  font-size: 1rem;\n  flex-shrink: 0;\n  line-height: 1;\n}\n.scv-type {\n  font-size: 0.6rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: var(--sc, #8b5cf6);\n  flex-shrink: 0;\n}\n.scv-name {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.scv-actions {\n  display: flex;\n  gap: 3px;\n  flex-shrink: 0;\n}\n.scv-edit-btn,\n.scv-del-btn {\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  background: transparent;\n  cursor: pointer;\n  font-size: 0.78rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  color: var(--text-muted, #9ca3af);\n  padding: 0;\n}\n.scv-edit-btn:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #c4b5fd;\n  background: rgba(139, 92, 246, 0.1);\n}\n.scv-del-btn:hover {\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.08);\n}\n.scv-meta {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  padding: 4px 8px;\n}\n.scv-cost {\n  padding: 1px 7px;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.scv-cost--mana {\n  background: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.35);\n  color: #60a5fa;\n}\n.scv-cost--fokus {\n  background: rgba(109, 40, 217, 0.12);\n  border: 1px solid rgba(109, 40, 217, 0.4);\n  color: #a78bfa;\n}\n.scv-cost--free {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  color: #4b5563;\n  font-style: italic;\n}\n.scv-cost--plan {\n  background: rgba(167, 139, 250, 0.1);\n  border: 1px solid rgba(167, 139, 250, 0.25);\n  color: #a78bfa;\n}\n.scv-req {\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: #1e3a5f;\n  color: #90caf9;\n  border: 1px solid rgba(66, 165, 245, 0.5);\n  font-size: 0.68rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.scv-footer {\n  display: flex;\n  align-items: flex-end;\n  justify-content: space-between;\n  gap: 6px;\n  padding: 5px 8px 6px;\n  border-top: 1px solid rgba(255, 255, 255, 0.04);\n  min-height: 28px;\n}\n.scv-reqs {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  flex: 1;\n  align-items: center;\n}\n.scv-req {\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: #1e3a5f;\n  color: #90caf9;\n  border: 1px solid rgba(66, 165, 245, 0.5);\n  font-size: 0.66rem;\n  font-weight: 700;\n  white-space: nowrap;\n}\n.scv-req--unmet {\n  background: #4d1c21;\n  color: #ffcdd2;\n  border-color: rgba(229, 115, 115, 0.6);\n  text-decoration: line-through;\n}\n.scv-cost-block {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 2px;\n  flex-shrink: 0;\n}\n.scv-cost-row {\n  display: flex;\n  gap: 4px;\n  align-items: center;\n  justify-content: flex-end;\n}\n.scv-cost-row--sub {\n  opacity: 0.85;\n}\n.scv-perturn--mana {\n  font-size: 0.62rem;\n  font-weight: 700;\n  color: #60a5fa;\n  white-space: nowrap;\n}\n.scv-perturn--fokus {\n  font-size: 0.62rem;\n  font-weight: 700;\n  color: #a78bfa;\n  white-space: nowrap;\n}\n.scv-duration {\n  font-size: 0.62rem;\n  font-weight: 700;\n  color: #fcd34d;\n  white-space: nowrap;\n}\n.scv-desc {\n  font-size: 0.8rem;\n  color: var(--text-muted, #9ca3af);\n  padding: 2px 8px 6px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  line-height: 1.45;\n}\n.scv-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  padding: 0 8px 6px;\n}\n.scv-tag {\n  padding: 1px 5px;\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.65rem;\n}\n.context-menu {\n  position: fixed;\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  z-index: 9999;\n  min-width: 140px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);\n  padding: 4px 0;\n}\n.ctx-item {\n  display: block;\n  width: 100%;\n  padding: 8px 14px;\n  background: transparent;\n  border: none;\n  color: var(--text, #e5e7eb);\n  font-size: 0.88rem;\n  text-align: left;\n  cursor: pointer;\n  font-family: inherit;\n  transition: background 0.12s;\n}\n.ctx-item:hover {\n  background: rgba(255, 255, 255, 0.07);\n}\n.ctx-delete {\n  color: #fca5a5;\n}\n.ctx-delete:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.spell-card:active {\n  transform: translateY(0);\n}\n.spell-card.editing {\n  cursor: default;\n  border-color: var(--muted);\n}\n.spell-card.disabled {\n  opacity: 0.6;\n  background: var(--bg);\n}\n.spell-card:not(.editing):hover {\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);\n  border-color: var(--accent);\n  transform: translateY(-1px);\n}\n.spell-header {\n  display: flex;\n  gap: 1rem;\n  margin-bottom: 0.5rem;\n  align-items: flex-start;\n}\n.spell-drawing {\n  flex-shrink: 0;\n  width: 52px;\n  height: 52px;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 8px;\n  overflow: hidden;\n  background: #000;\n}\n.spell-drawing img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.spell-info {\n  flex: 1;\n  min-width: 0;\n}\n.spell-title-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n  margin-bottom: 0.5rem;\n}\n.spell-title-row h4 {\n  margin: 0;\n  font-size: 1.1rem;\n  color: var(--text);\n  word-break: break-word;\n  flex: 1;\n  min-width: 0;\n}\n.sc-header {\n  display: flex;\n  gap: 10px;\n  align-items: flex-start;\n  margin-bottom: 6px;\n}\n.sc-thumb {\n  flex-shrink: 0;\n  width: 52px;\n  height: 52px;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  background: #000;\n}\n.sc-thumb img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.sc-title-block {\n  flex: 1;\n  min-width: 0;\n}\n.sc-title-row {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 8px;\n  margin-bottom: 4px;\n}\n.sc-name {\n  margin: 0;\n  font-size: 0.98rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  word-break: break-word;\n  flex: 1;\n  min-width: 0;\n  line-height: 1.3;\n}\n.sc-actions {\n  display: flex;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.sc-edit-btn,\n.sc-del-btn {\n  width: 24px;\n  height: 24px;\n  border-radius: 5px;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  background: transparent;\n  cursor: pointer;\n  font-size: 0.82rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  color: #9ca3af;\n  padding: 0;\n}\n.sc-edit-btn:hover {\n  border-color: rgba(139, 92, 246, 0.5);\n  color: #c4b5fd;\n  background: rgba(139, 92, 246, 0.1);\n}\n.sc-del-btn:hover {\n  border-color: rgba(239, 68, 68, 0.5);\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.08);\n}\n.sc-costs {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  margin-bottom: 4px;\n}\n.sc-cost-pill {\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 0.74rem;\n  font-weight: 600;\n}\n.sc-cost-mana {\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  color: #c4b5fd;\n}\n.sc-cost-fokus {\n  background: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.3);\n  color: #93c5fd;\n}\n.sc-cost-none {\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #4b5563;\n  font-style: italic;\n}\n.sc-stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.sc-stat-chip {\n  padding: 2px 7px;\n  border-radius: 4px;\n  background: rgba(245, 158, 11, 0.12);\n  border: 1px solid rgba(245, 158, 11, 0.3);\n  color: #fcd34d;\n  font-size: 0.72rem;\n  font-weight: 700;\n}\n.sc-desc {\n  font-size: 0.83rem;\n  color: #9ca3af;\n  margin: 6px 0 0 0;\n  line-height: 1.45;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  word-break: break-word;\n}\n.sc-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 6px;\n}\n.sc-tag {\n  padding: 2px 7px;\n  border-radius: 4px;\n  background: rgba(25, 118, 210, 0.12);\n  border: 1px solid rgba(25, 118, 210, 0.3);\n  color: #60a5fa;\n  font-size: 0.72rem;\n}\n.sc-binding {\n  margin-top: 5px;\n  font-size: 0.74rem;\n  color: #6b7280;\n}\n.sc-binding-missing {\n  color: #f87171;\n  text-decoration: line-through;\n}\n.sc-durability {\n  margin-left: 4px;\n  opacity: 0.7;\n}\n@keyframes spell-glow {\n  0%, 100% {\n    box-shadow:\n      0 0 40px rgba(103, 58, 183, 1),\n      0 0 80px rgba(103, 58, 183, 0.8),\n      0 0 120px rgba(103, 58, 183, 0.6),\n      inset 0 0 20px rgba(103, 58, 183, 0.4);\n    filter: brightness(1.2);\n  }\n  50% {\n    box-shadow:\n      0 0 60px rgba(103, 58, 183, 1),\n      0 0 120px rgba(103, 58, 183, 1),\n      0 0 180px rgba(103, 58, 183, 0.8),\n      inset 0 0 30px rgba(103, 58, 183, 0.6);\n    filter: brightness(1.4);\n  }\n}\n.spell-actions {\n  display: flex;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n.spell-actions button {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.9rem;\n  transition: all 0.2s;\n  flex: 1;\n  font-weight: 600;\n}\n.save-btn {\n  background-color: var(--accent);\n  color: white;\n}\n.save-btn:hover {\n  background-color: var(--accentdark);\n  transform: translateY(-1px);\n  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);\n}\n.delete-btn {\n  background-color: #f44336;\n  color: white;\n}\n.delete-btn:hover {\n  background-color: #e53935;\n  transform: translateY(-1px);\n  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);\n}\n.field {\n  margin-bottom: 1rem;\n}\n.field label {\n  display: block;\n  margin-bottom: 0.25rem;\n  font-weight: 500;\n  font-size: 0.9rem;\n  color: var(--text);\n}\n.field input,\n.field textarea,\n.field select {\n  width: 100%;\n  padding: 0.5rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  font-family: inherit;\n  font-size: 0.9rem;\n  box-sizing: border-box;\n  background: var(--bg);\n  color: var(--text);\n}\n.field input:focus,\n.field textarea:focus,\n.field select:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.field textarea {\n  resize: vertical;\n}\n.binding-type-selector {\n  display: flex;\n  gap: 1rem;\n}\n.radio-label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  font-weight: normal;\n}\n.radio-label input[type=radio] {\n  width: auto;\n  cursor: pointer;\n}\n.durability-fields {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n}\n.tag-selector {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.tag-option {\n  padding: 0.4rem 0.8rem;\n  background: var(--bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  transition: all 0.2s;\n}\n.tag-option:hover {\n  background: var(--card);\n  border-color: var(--accent);\n}\n.tag-option.selected {\n  background: rgba(25, 118, 210, 0.2);\n  color: #64b5f6;\n  border-color: rgba(25, 118, 210, 0.4);\n}\n.spell-edit {\n  pointer-events: all;\n}\n.canvas-wrapper {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.canvas-container {\n  border: 2px solid var(--border);\n  border-radius: 4px;\n  display: inline-block;\n  background: #000;\n  cursor: crosshair;\n  overflow: auto;\n  max-width: 100%;\n  max-height: 70vh;\n  touch-action: none;\n}\n.canvas-container.panning {\n  cursor: grab;\n}\n.canvas-container.panning:active {\n  cursor: grabbing;\n}\ncanvas {\n  display: block;\n  touch-action: none;\n  background: #000;\n  cursor: crosshair;\n}\n.color-selector {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.5rem;\n}\n.color-option {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  border: 2px solid var(--border);\n  cursor: pointer;\n  transition: all 0.2s;\n  position: relative;\n}\n.color-option:hover {\n  transform: scale(1.1);\n}\n.color-option.selected {\n  border-color: var(--text);\n  box-shadow: 0 0 8px currentColor;\n}\n.color-option.selected::after {\n  content: "\\2713";\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  color: #000;\n  font-size: 14px;\n  font-weight: bold;\n  text-shadow: 0 0 2px #fff;\n}\n.clear-btn {\n  padding: 0.5rem 1rem;\n  background: #ff9800;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  font-weight: 600;\n  transition: all 0.2s;\n  align-self: flex-start;\n}\n.clear-btn:hover {\n  background: #f57c00;\n  transform: translateY(-1px);\n  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);\n}\n.expand-btn {\n  padding: 0.4rem 0.8rem;\n  background: #f0f0f0;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n  transition: all 0.2s;\n  min-width: 40px;\n}\n.expand-btn:hover {\n  background: #d0d0d0;\n  border-color: var(--accent);\n}\n.fullscreen-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.95);\n  z-index: 10000;\n  display: flex;\n  flex-direction: column;\n}\n.fullscreen-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 2rem;\n  background: rgba(255, 255, 255, 0.1);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n}\n.fullscreen-header h3 {\n  margin: 0;\n  color: white;\n  font-size: 1.5rem;\n}\n.close-fullscreen-btn {\n  padding: 0.75rem 1.5rem;\n  background: #ff5252;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n.close-fullscreen-btn:hover {\n  background: #ff1744;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 8px rgba(255, 82, 82, 0.4);\n}\n.fullscreen-content {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  padding: 2rem;\n  overflow: auto;\n  width: 100%;\n}\n.drawing-toolbar {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 1rem;\n  padding: 0.5rem 1rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  margin-bottom: 1.5rem;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.toolbar-section {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.toolbar-section.tools {\n  background: var(--bg);\n  padding: 0.25rem;\n  border-radius: 8px;\n}\n.toolbar-btn {\n  width: 44px;\n  height: 44px;\n  border-radius: 8px;\n  background: transparent;\n  border: 1px solid transparent;\n  color: var(--text);\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s;\n}\n.toolbar-btn:hover {\n  background: var(--border);\n}\n.toolbar-btn.active {\n  background: var(--accent);\n  border-color: var(--accent);\n  color: white;\n  box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);\n}\n.btn-icon {\n  font-size: 1.4rem;\n}\n.brush-settings {\n  background: var(--bg);\n  padding: 0.5rem;\n  border-radius: 8px;\n  gap: 1rem;\n}\n.setting-label {\n  font-size: 0.85rem;\n  color: var(--text);\n  font-weight: 500;\n}\n.color-picker {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.color-swatch {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.color-swatch:hover {\n  transform: scale(1.15);\n}\n.color-swatch.active {\n  border-color: white;\n  box-shadow: 0 0 0 2px var(--accent);\n  transform: scale(1.1);\n}\n.custom-color {\n  position: relative;\n  width: 28px;\n  height: 28px;\n  cursor: pointer;\n}\n.custom-color input {\n  position: absolute;\n  opacity: 0;\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n}\n.custom-color-preview {\n  display: block;\n  width: 100%;\n  height: 100%;\n  border-radius: 50%;\n  border: 2px dashed var(--border);\n  background:\n    conic-gradient(\n      red,\n      yellow,\n      lime,\n      aqua,\n      blue,\n      magenta,\n      red);\n}\n.size-picker {\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.size-btn {\n  width: 32px;\n  height: 32px;\n  border-radius: 6px;\n  background: transparent;\n  border: 1px solid transparent;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s;\n}\n.size-btn:hover {\n  background: var(--border);\n}\n.size-btn.active {\n  background: var(--accent);\n  border-color: var(--accent);\n}\n.size-dot {\n  border-radius: 50%;\n  background: var(--text);\n  max-width: 24px;\n  max-height: 24px;\n}\n.size-btn.active .size-dot {\n  background: white;\n}\n.toolbar-section.actions {\n  display: flex;\n  gap: 0.5rem;\n}\n.action-btn {\n  padding: 0.5rem 1rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.9rem;\n  color: var(--text);\n  transition: all 0.2s;\n  display: flex;\n  align-items: center;\n  gap: 0.25rem;\n}\n.action-btn:hover {\n  background: var(--border);\n}\n.action-btn.clear:hover {\n  background: #ff4444;\n  color: white;\n  border-color: #ff4444;\n}\n.canvas-area {\n  position: relative;\n  display: inline-block;\n  margin: 0 auto;\n  padding: 25px;\n}\n.expand-btn {\n  position: absolute;\n  background: var(--card);\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 1.2rem;\n  transition: all 0.2s;\n  color: white;\n  z-index: 10;\n  padding: 0.4rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 36px;\n  min-height: 36px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);\n}\n.expand-btn:hover {\n  background: var(--accent);\n  color: white;\n  border-color: var(--accent);\n  transform: scale(1.1);\n  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5);\n}\n.expand-btn.expand-top {\n  top: -20px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.expand-btn.expand-bottom {\n  bottom: -20px;\n  left: 50%;\n  transform: translateX(-50%);\n}\n.expand-btn.expand-left {\n  left: -20px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.expand-btn.expand-right {\n  right: -20px;\n  top: 50%;\n  transform: translateY(-50%);\n}\n.expand-btn.expand-top:hover,\n.expand-btn.expand-bottom:hover {\n  transform: translateX(-50%) scale(1.1);\n}\n.expand-btn.expand-left:hover,\n.expand-btn.expand-right:hover {\n  transform: translateY(-50%) scale(1.1);\n}\n.fullscreen-canvas-wrapper {\n  background: #000;\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  border-radius: 8px;\n  overflow: auto;\n  max-width: 95vw;\n  max-height: calc(95vh - 150px);\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);\n}\n.fullscreen-canvas-wrapper canvas {\n  display: block;\n  cursor: crosshair;\n  touch-action: none;\n}\n.fullscreen-canvas-wrapper.panning canvas {\n  cursor: grab;\n}\n.fullscreen-canvas-wrapper.panning:active canvas {\n  cursor: grabbing;\n}\n.drawing-preview {\n  margin-bottom: 1rem;\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  padding: 1rem;\n  background: #000;\n  max-width: 300px;\n}\n.drawing-preview img {\n  width: 100%;\n  height: auto;\n  display: block;\n}\n.edit-drawing-btn {\n  padding: 0.75rem 1.5rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n.edit-drawing-btn:hover {\n  background: var(--accentdark);\n  transform: translateY(-1px);\n  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);\n}\n.checkbox-field {\n  margin-bottom: 0.5rem;\n}\n.checkbox-label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  font-weight: normal !important;\n  font-size: 0.95rem;\n}\n.checkbox-label input[type=checkbox] {\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n  margin: 0;\n}\n.checkbox-label span {\n  -webkit-user-select: none;\n  user-select: none;\n}\n.field .color-picker {\n  width: 100%;\n  height: 48px;\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  cursor: pointer;\n  background: var(--bg);\n  transition: all 0.2s;\n}\n.field .color-picker:hover {\n  border-color: var(--accent);\n  box-shadow: 0 0 15px currentColor;\n}\n.spell-drawing {\n  flex-shrink: 0;\n  width: 150px;\n  height: 60px;\n  border: 2px solid var(--border);\n  border-radius: 4px;\n  overflow: hidden;\n  background: var(--card);\n}\n/*# sourceMappingURL=spell.component.css.map */\n'] }]
  }], () => [{ type: ChangeDetectorRef }, { type: DomSanitizer }, { type: ImageService }], { canvasRef: [{
    type: ViewChild,
    args: ["canvas", { static: false }]
  }], spell: [{
    type: Input,
    args: [{ required: true }]
  }], sheet: [{
    type: Input,
    args: [{ required: true }]
  }], index: [{
    type: Input,
    args: [{ required: true }]
  }], isEditing: [{
    type: Input
  }], patch: [{
    type: Output
  }], delete: [{
    type: Output
  }], editingChange: [{
    type: Output
  }], openEditor: [{
    type: Output
  }], cast: [{
    type: Output
  }], openCastView: [{
    type: Output
  }], contextMenuRequest: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SpellComponent, { className: "SpellComponent", filePath: "app/sheet/spell/spell.component.ts", lineNumber: 30 });
})();

// src/app/services/macro-executor.service.ts
var RESOURCE_FORMULA = {
  health: FormulaType.LIFE,
  energy: FormulaType.ENERGY,
  mana: FormulaType.MANA
};
var MacroExecutorService = class _MacroExecutorService {
  trueStats = inject(TrueStatsService);
  async executeMacro(macro, character, _sourceStatusEffectName) {
    return this.runScriptOnSheet(macroActionToScript(macro), character);
  }
  /** Run a FailScript against a sheet and apply its resource/status effects in place. */
  runScriptOnSheet(script, character) {
    const ctx = createPlayerContext(character, this.trueStats, {
      inCombat: false,
      stacks: 1,
      turn: 0,
      duration: 0,
      effectStrength: 0
    });
    const result = runScript(script, ctx);
    const resourceChanges = [];
    for (const rc of result.resourceChanges) {
      if (this.applyResourceToSheet(character, rc.resource, rc.amount)) {
        resourceChanges.push({ resource: rc.resource, amount: rc.amount });
      }
    }
    for (const op of result.statusOps) {
      if (op.op === "remove")
        this.removeStatusFromSheet(character, op.id);
    }
    const message = result.displays.map((d) => d.type === "text" || d.type === "banner" ? d.text : d.type === "stat" ? `${d.label}: ${d.value}` : "").filter(Boolean).join(" \xB7 ");
    return {
      success: result.ok,
      message: result.ok ? message || "Ausgef\xFChrt" : result.errors[0] ?? "Fehler",
      resourceChanges
    };
  }
  applyResourceToSheet(character, resource, amount) {
    const ft = RESOURCE_FORMULA[resource];
    if (ft === void 0)
      return false;
    const status = character.statuses?.find((s) => s.formulaType === ft);
    if (!status)
      return false;
    const max = this.trueStats.calculateResourceMax(character, ft);
    status.statusCurrent = this.trueStats.clampResourceCurrent(ft, (status.statusCurrent || 0) + amount, max);
    return true;
  }
  removeStatusFromSheet(character, id) {
    if (!character.activeStatusEffects)
      return;
    const i = character.activeStatusEffects.findIndex((se) => se.statusEffectId === id);
    if (i >= 0)
      character.activeStatusEffects.splice(i, 1);
  }
  static \u0275fac = function MacroExecutorService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MacroExecutorService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MacroExecutorService, factory: _MacroExecutorService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MacroExecutorService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/sheet/skill/skill.component.ts
function SkillComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 5);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275attribute("data-action", ctx_r0.actionType);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", ctx_r0.actionIcon, " ", ctx_r0.actionType);
  }
}
function SkillComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 6);
    \u0275\u0275text(1, "\u2726");
    \u0275\u0275domElementEnd();
  }
}
function SkillComponent_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 7);
    \u0275\u0275text(1, "\u{1F6AB}");
    \u0275\u0275domElementEnd();
  }
}
function SkillComponent_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 8);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.statSummary);
  }
}
function SkillComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "div", 8);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.talentSummary);
  }
}
function SkillComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 13);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r0.rankRoman);
  }
}
function SkillComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 14);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275attribute("data-resource", ctx_r0.cost.type);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3(" ", ctx_r0.costIcon, " ", ctx_r0.cost.amount, "", ctx_r0.cost.perRound ? "/Rd" : "", " ");
  }
}
function SkillComponent_Conditional_20_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 18);
    \u0275\u0275text(1, "\u23F3 Tempor\xE4r \u2014 durch Effekt gew\xE4hrt");
    \u0275\u0275domElementEnd();
  }
}
function SkillComponent_Conditional_20_Conditional_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 19);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_20_Conditional_2_Conditional_2_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r0 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r0.toggleDisabled());
    });
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.skill.disabled ? "\u2705 Aktivieren" : "\u{1F6AB} Deaktivieren", " ");
  }
}
function SkillComponent_Conditional_20_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 19);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_20_Conditional_2_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.editSkill());
    });
    \u0275\u0275text(1, "\u270F Bearbeiten");
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(2, SkillComponent_Conditional_20_Conditional_2_Conditional_2_Template, 2, 1, "button", 20);
    \u0275\u0275domElementStart(3, "button", 21);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_20_Conditional_2_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r0 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r0.deleteSkill());
    });
    \u0275\u0275text(4, "\u2715 L\xF6schen");
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r0.isEditing ? 2 : -1);
  }
}
function SkillComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 17);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_20_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r2);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275conditionalCreate(1, SkillComponent_Conditional_20_Conditional_1_Template, 2, 0, "span", 18)(2, SkillComponent_Conditional_20_Conditional_2_Template, 5, 1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("left", ctx_r0.menuX, "px")("top", ctx_r0.menuY, "px");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.readOnly ? 1 : 2);
  }
}
function SkillComponent_Conditional_21_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("data-action", ctx_r0.actionType);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", ctx_r0.actionIcon, " ", ctx_r0.actionType);
  }
}
function SkillComponent_Conditional_21_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate2(" \u2713\xA0Eingesetzt \xA0\u2212", ctx_r0.payFeedback.amount, " ", ctx_r0.payFeedback.label, " ");
  }
}
function SkillComponent_Conditional_21_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate3(" Einsetzen \xA0\u2212", ctx_r0.cost == null ? null : ctx_r0.cost.amount, " ", ctx_r0.resourceLabel, "", (ctx_r0.cost == null ? null : ctx_r0.cost.perRound) ? " / Rd" : "", " ");
  }
}
function SkillComponent_Conditional_21_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" Nicht genug ", ctx_r0.resourceLabel, " ");
  }
}
function SkillComponent_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 22);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_21_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closePayPopup());
    });
    \u0275\u0275domElementStart(1, "div", 23);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_21_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r5);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementStart(2, "div", 24)(3, "span", 25);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(5, "span", 26);
    \u0275\u0275text(6);
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(7, SkillComponent_Conditional_21_Conditional_7_Template, 2, 3, "span", 27);
    \u0275\u0275domElementStart(8, "button", 28);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_21_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closePayPopup());
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(10, "div", 29);
    \u0275\u0275text(11);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElement(12, "div", 30);
    \u0275\u0275domElementStart(13, "div", 31)(14, "span", 32);
    \u0275\u0275text(15);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(16, "div", 33);
    \u0275\u0275domElement(17, "div", 34);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(18, "span", 35);
    \u0275\u0275text(19);
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(20, "div", 36)(21, "button", 37);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_21_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.payAndUse());
    });
    \u0275\u0275conditionalCreate(22, SkillComponent_Conditional_21_Conditional_22_Template, 1, 2)(23, SkillComponent_Conditional_21_Conditional_23_Template, 1, 3)(24, SkillComponent_Conditional_21_Conditional_24_Template, 1, 1);
    \u0275\u0275domElementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275attribute("data-type", ctx_r0.effectiveType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.typeIcon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.typeLabel);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.effectiveType === "active" && ctx_r0.actionType ? 7 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r0.skill.name);
    \u0275\u0275advance();
    \u0275\u0275domProperty("innerHTML", ctx_r0.enhancedDescription, \u0275\u0275sanitizeHtml);
    \u0275\u0275advance();
    \u0275\u0275styleProp("--rc", ctx_r0.resourceColor);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.resourceLabel);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ((ctx_r0.resourceStatus == null ? null : ctx_r0.resourceStatus.statusCurrent) ?? 0) / ctx_r0.resourceMax * 100, "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2(" ", (ctx_r0.resourceStatus == null ? null : ctx_r0.resourceStatus.statusCurrent) ?? 0, " / ", ctx_r0.resourceMax, " ");
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("--rc", ctx_r0.resourceColor);
    \u0275\u0275classProp("sp-cant", !ctx_r0.canAfford && !ctx_r0.payFeedback.active)("sp-paid", ctx_r0.payFeedback.active);
    \u0275\u0275domProperty("disabled", !ctx_r0.canAfford && !ctx_r0.payFeedback.active);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.payFeedback.active ? 22 : ctx_r0.canAfford ? 23 : 24);
  }
}
function SkillComponent_Conditional_22_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("data-action", ctx_r0.actionType);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", ctx_r0.actionIcon, " ", ctx_r0.actionType);
  }
}
function SkillComponent_Conditional_22_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" \u2713 ", ctx_r0.macroResult, " ");
  }
}
function SkillComponent_Conditional_22_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Wird ausgef\xFChrt... ");
  }
}
function SkillComponent_Conditional_22_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u25BA Ausf\xFChren ");
  }
}
function SkillComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 22);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_22_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closeMacroPopup());
    });
    \u0275\u0275domElementStart(1, "div", 23);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_22_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r6);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275domElementStart(2, "div", 24)(3, "span", 25);
    \u0275\u0275text(4);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(5, "span", 26);
    \u0275\u0275text(6);
    \u0275\u0275domElementEnd();
    \u0275\u0275conditionalCreate(7, SkillComponent_Conditional_22_Conditional_7_Template, 2, 3, "span", 27);
    \u0275\u0275domElementStart(8, "button", 28);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_22_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.closeMacroPopup());
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275domElementEnd()();
    \u0275\u0275domElementStart(10, "div", 29);
    \u0275\u0275text(11);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElement(12, "div", 30);
    \u0275\u0275domElementStart(13, "div", 36)(14, "button", 37);
    \u0275\u0275domListener("click", function SkillComponent_Conditional_22_Template_button_click_14_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.executeMacroAction());
    });
    \u0275\u0275conditionalCreate(15, SkillComponent_Conditional_22_Conditional_15_Template, 1, 1)(16, SkillComponent_Conditional_22_Conditional_16_Template, 1, 0)(17, SkillComponent_Conditional_22_Conditional_17_Template, 1, 0);
    \u0275\u0275domElementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275attribute("data-type", ctx_r0.effectiveType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.typeIcon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r0.typeLabel);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.actionType ? 7 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r0.skill.name);
    \u0275\u0275advance();
    \u0275\u0275domProperty("innerHTML", ctx_r0.enhancedDescription, \u0275\u0275sanitizeHtml);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("sp-paid", !!ctx_r0.macroResult);
    \u0275\u0275domProperty("disabled", ctx_r0.macroExecuting);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r0.macroResult ? 15 : ctx_r0.macroExecuting ? 16 : 17);
  }
}
var SkillComponent = class _SkillComponent {
  sanitizer;
  cdr;
  skill;
  sheet;
  index;
  isEditing = false;
  /** Read-only (e.g. effect-granted temporary skills): no edit/disable/delete. */
  readOnly = false;
  patch = new EventEmitter();
  delete = new EventEmitter();
  editingChange = new EventEmitter();
  openEditor = new EventEmitter();
  triggerMacro = new EventEmitter();
  showContextMenu = false;
  menuX = 0;
  menuY = 0;
  showPayPopup = false;
  payFeedback = {
    active: false,
    amount: 0,
    label: ""
  };
  showMacroPopup = false;
  macroExecuting = false;
  macroResult = null;
  macroExecutor = inject(MacroExecutorService);
  trueStats = inject(TrueStatsService);
  constructor(sanitizer, cdr) {
    this.sanitizer = sanitizer;
    this.cdr = cdr;
  }
  closeMenu() {
    this.showContextMenu = false;
  }
  closeMenuOnCtx() {
    this.showContextMenu = false;
  }
  onRightClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.showContextMenu = true;
  }
  onCardClick() {
    if (this.effectiveType !== "active")
      return;
    if (this.skill.script?.trim() || this.skill.embeddedMacroAction) {
      this.showMacroPopup = true;
      return;
    }
    const macro = this.skill.embeddedMacro;
    if (macro) {
      this.triggerMacro.emit(macro);
      return;
    }
    if (this.cost) {
      this.showPayPopup = true;
    }
  }
  closeMacroPopup() {
    this.showMacroPopup = false;
    this.macroResult = null;
  }
  async executeMacroAction() {
    const script = this.skill.script?.trim() ? this.skill.script : this.skill.embeddedMacroAction ? macroActionToScript(this.skill.embeddedMacroAction) : null;
    if (!script)
      return;
    this.macroExecuting = true;
    const result = this.macroExecutor.runScriptOnSheet(script, this.sheet);
    if (this.sheet.statuses) {
      this.patch.emit({ path: "statuses", value: this.sheet.statuses });
    }
    this.macroResult = result.message;
    this.macroExecuting = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.macroResult = null;
      this.cdr.markForCheck();
    }, 2500);
  }
  closePayPopup() {
    this.showPayPopup = false;
    this.payFeedback = { active: false, amount: 0, label: "" };
  }
  editSkill() {
    this.showContextMenu = false;
    if (this.readOnly)
      return;
    this.openEditor.emit();
  }
  deleteSkill() {
    this.showContextMenu = false;
    if (this.readOnly)
      return;
    this.delete.emit();
  }
  toggleDisabled() {
    this.showContextMenu = false;
    const skills = [...this.sheet.skills];
    skills[this.index] = __spreadProps(__spreadValues({}, skills[this.index]), { disabled: !skills[this.index].disabled });
    this.sheet.skills = skills;
    this.patch.emit({ path: "skills", value: skills });
  }
  // --- Pay logic ---
  getStatusForCostType(type) {
    const formulaMap = {
      energy: FormulaType.ENERGY,
      mana: FormulaType.MANA,
      life: FormulaType.LIFE
    };
    const ft = formulaMap[type];
    if (!ft)
      return void 0;
    return this.sheet.statuses?.find((s) => s.formulaType === ft);
  }
  get resourceStatus() {
    if (!this.cost)
      return void 0;
    return this.getStatusForCostType(this.cost.type);
  }
  get resourceMax() {
    const status = this.resourceStatus;
    if (!status)
      return 1;
    return this.trueStats.calculateResourceMax(this.sheet, status.formulaType);
  }
  get resourceLabel() {
    const labels = { energy: "Ausdauer", mana: "Mana", life: "Leben" };
    return this.cost ? labels[this.cost.type] ?? this.cost.type : "";
  }
  get resourceColor() {
    const colors = { energy: "#22c55e", mana: "#60a5fa", life: "#f87171" };
    return this.cost ? colors[this.cost.type] ?? "#a78bfa" : "#a78bfa";
  }
  get canAfford() {
    const status = this.resourceStatus;
    if (!status || !this.cost)
      return false;
    return (status.statusCurrent ?? 0) >= this.cost.amount;
  }
  payAndUse() {
    const status = this.resourceStatus;
    if (!status || !this.cost || !this.canAfford)
      return;
    const amount = this.cost.amount;
    const label = this.resourceLabel;
    const statuses = this.sheet.statuses.map((s) => s === status ? __spreadProps(__spreadValues({}, s), { statusCurrent: Math.max(0, (s.statusCurrent ?? 0) - amount) }) : s);
    this.sheet.statuses = statuses;
    this.patch.emit({ path: "statuses", value: statuses });
    this.payFeedback = { active: true, amount, label };
    this.cdr.markForCheck();
    setTimeout(() => {
      this.payFeedback = { active: false, amount: 0, label: "" };
      this.cdr.markForCheck();
    }, 1400);
  }
  // --- Definition lookups ---
  get definition() {
    if (this.skill.skillId)
      return SKILL_DEFINITIONS.find((s) => s.id === this.skill.skillId);
    return SKILL_DEFINITIONS.find((s) => s.name === this.skill.name && s.class === this.skill.class) ?? SKILL_DEFINITIONS.find((s) => s.name === this.skill.name);
  }
  get effectiveType() {
    return this.definition?.type ?? this.skill.type;
  }
  get cost() {
    return this.definition?.cost ?? this.skill.cost;
  }
  get actionType() {
    return this.definition?.actionType ?? this.skill.actionType;
  }
  get rankTier() {
    return CLASS_DEFINITIONS[this.skill.class]?.tier;
  }
  get rankRoman() {
    const map = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
    const t = this.rankTier;
    return t ? map[t] ?? String(t) : "";
  }
  get isDisabled() {
    if (this.skill.disabled)
      return true;
    if (this.skill.enlightened)
      return false;
    if (this.skill.sourceRaceId)
      return false;
    return !ClassTree.isClassEnabled(this.skill.class, this.sheet.primary_class, this.sheet.secondary_class);
  }
  get typeIcon() {
    const icons = {
      active: "\u26A1",
      // lightning bolt
      passive: "\u{1F52E}",
      // crystal ball
      dice_bonus: "\u{1F3B2}",
      // dice
      stat_bonus: "\u{1F4C8}",
      // chart
      talent_bonus: "\u2B50"
      // star
    };
    return icons[this.effectiveType] ?? "\u2726";
  }
  get typeLabel() {
    const labels = {
      active: "Aktiv",
      passive: "Passiv",
      dice_bonus: "W\xFCrfelbonus",
      stat_bonus: "Stat-Bonus",
      talent_bonus: "Talent-Bonus"
    };
    return labels[this.effectiveType] ?? this.effectiveType;
  }
  get costIcon() {
    const icons = {
      mana: "\u{1F4A7}",
      // water drop
      energy: "\u26A1",
      // lightning bolt
      life: "\u2764"
      // heart
    };
    return this.cost ? icons[this.cost.type] ?? "\u25C6" : "";
  }
  get actionIcon() {
    const icons = {
      "Aktion": "\u2694",
      // crossed swords
      "Bonusaktion": "\u2726",
      // star
      "Keine Aktion": "\u25CE",
      // bullseye
      "Reaktion": "\u21A9"
      // curved arrow
    };
    return this.actionType ? icons[this.actionType] ?? "" : "";
  }
  get enhancedDescription() {
    const enhanced = KeywordEnhancer.enhance(this.skill.description || "");
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }
  get statSummary() {
    const def = this.definition;
    if (!def)
      return "";
    const parts = [];
    if (def.statBonus)
      parts.push(`+${def.statBonus.amount} ${this.shortStat(def.statBonus.stat)}`);
    if (def.statBonuses)
      def.statBonuses.forEach((b) => parts.push(`+${b.amount} ${this.shortStat(b.stat)}`));
    return parts.join(", ");
  }
  get talentSummary() {
    const def = this.definition;
    if (!def)
      return "";
    const parts = [];
    const level = this.skill.level ?? 1;
    if (def.talentBonus) {
      parts.push(`+${def.talentBonus.amount * level} ${this.talentName(def.talentBonus.talent)}`);
    }
    if (def.talentBonuses) {
      def.talentBonuses.forEach((b) => parts.push(`+${b.amount * level} ${this.talentName(b.talent)}`));
    }
    return parts.join(", ");
  }
  talentName(talentId) {
    return TALENT_DEFINITIONS.find((t) => t.id === talentId)?.name ?? talentId;
  }
  shortStat(stat) {
    const map = {
      intelligence: "INT",
      strength: "STR",
      dexterity: "GES",
      speed: "GES",
      constitution: "KON",
      chill: "WIL",
      mana: "MANA",
      life: "LP",
      energy: "EP",
      focus: "FO"
    };
    return map[stat] ?? stat.toUpperCase().slice(0, 3);
  }
  static \u0275fac = function SkillComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SkillComponent)(\u0275\u0275directiveInject(DomSanitizer), \u0275\u0275directiveInject(ChangeDetectorRef));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SkillComponent, selectors: [["app-skill"]], hostBindings: function SkillComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("click", function SkillComponent_click_HostBindingHandler() {
        return ctx.closeMenu();
      }, \u0275\u0275resolveDocument)("contextmenu", function SkillComponent_contextmenu_HostBindingHandler() {
        return ctx.closeMenuOnCtx();
      }, \u0275\u0275resolveDocument);
    }
  }, inputs: { skill: "skill", sheet: "sheet", index: "index", isEditing: "isEditing", readOnly: "readOnly" }, outputs: { patch: "patch", delete: "delete", editingChange: "editingChange", openEditor: "openEditor", triggerMacro: "triggerMacro" }, decls: 23, vars: 20, consts: [[1, "sc", 3, "click", "contextmenu"], [1, "sc-bar"], [1, "sc-type-icon"], [1, "sc-type-lbl"], [1, "sc-name"], [1, "sc-action"], ["title", "Erkenntnis", 1, "sc-enl"], ["title", "Deaktiviert", 1, "sc-disabled-badge"], [1, "sc-stat-summary"], [1, "sc-desc", 3, "innerHTML"], [1, "sc-footer"], [1, "sc-footer-left"], [1, "sc-class"], [1, "sc-rank"], [1, "sc-cost"], [1, "sc-ctx", 3, "left", "top"], [1, "sp-backdrop"], [1, "sc-ctx", 3, "click"], [1, "sc-ctx-note"], [1, "sc-ctx-btn", 3, "click"], [1, "sc-ctx-btn"], [1, "sc-ctx-btn", "sc-ctx-del", 3, "click"], [1, "sp-backdrop", 3, "click"], [1, "sp-popup", 3, "click"], [1, "sp-bar"], [1, "sp-type-icon"], [1, "sp-type-lbl"], [1, "sp-action"], ["title", "Schlie\xDFen", 1, "sp-close", 3, "click"], [1, "sp-name"], [1, "sp-desc", 3, "innerHTML"], [1, "sp-resource"], [1, "sp-res-label"], [1, "sp-res-track"], [1, "sp-res-fill"], [1, "sp-res-val"], [1, "sp-actions"], [1, "sp-use", 3, "click", "disabled"]], template: function SkillComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275domListener("click", function SkillComponent_Template_div_click_0_listener() {
        return ctx.onCardClick();
      })("contextmenu", function SkillComponent_Template_div_contextmenu_0_listener($event) {
        return ctx.onRightClick($event);
      });
      \u0275\u0275domElementStart(1, "div", 1)(2, "span", 2);
      \u0275\u0275text(3);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(4, "span", 3);
      \u0275\u0275text(5);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(6, "span", 4);
      \u0275\u0275text(7);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(8, SkillComponent_Conditional_8_Template, 2, 3, "span", 5);
      \u0275\u0275conditionalCreate(9, SkillComponent_Conditional_9_Template, 2, 0, "span", 6);
      \u0275\u0275conditionalCreate(10, SkillComponent_Conditional_10_Template, 2, 0, "span", 7);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(11, SkillComponent_Conditional_11_Template, 2, 1, "div", 8);
      \u0275\u0275conditionalCreate(12, SkillComponent_Conditional_12_Template, 2, 1, "div", 8);
      \u0275\u0275domElement(13, "div", 9);
      \u0275\u0275domElementStart(14, "div", 10)(15, "div", 11)(16, "span", 12);
      \u0275\u0275text(17);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(18, SkillComponent_Conditional_18_Template, 2, 1, "span", 13);
      \u0275\u0275domElementEnd();
      \u0275\u0275conditionalCreate(19, SkillComponent_Conditional_19_Template, 2, 4, "span", 14);
      \u0275\u0275domElementEnd()();
      \u0275\u0275conditionalCreate(20, SkillComponent_Conditional_20_Template, 3, 5, "div", 15);
      \u0275\u0275conditionalCreate(21, SkillComponent_Conditional_21_Template, 25, 21, "div", 16);
      \u0275\u0275conditionalCreate(22, SkillComponent_Conditional_22_Template, 18, 10, "div", 16);
    }
    if (rf & 2) {
      \u0275\u0275classProp("sc-disabled", ctx.isDisabled)("sc-clickable", ctx.effectiveType === "active" && (ctx.cost || ctx.skill.embeddedMacroAction || ctx.skill.embeddedMacro));
      \u0275\u0275attribute("data-type", ctx.effectiveType);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.typeIcon);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.typeLabel);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.skill.name);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.effectiveType === "active" && ctx.actionType ? 8 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.skill.enlightened ? 9 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.skill.disabled ? 10 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.effectiveType === "stat_bonus" && ctx.statSummary ? 11 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.effectiveType === "talent_bonus" && ctx.talentSummary ? 12 : -1);
      \u0275\u0275advance();
      \u0275\u0275domProperty("innerHTML", ctx.enhancedDescription, \u0275\u0275sanitizeHtml);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.skill.class);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.rankRoman ? 18 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.cost ? 19 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showContextMenu ? 20 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showPayPopup ? 21 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showMacroPopup ? 22 : -1);
    }
  }, dependencies: [CommonModule], styles: ['\n\n[_nghost-%COMP%] {\n  display: block;\n}\n.sc[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  background: #0f1829;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  border-left: 3px solid var(--tc, #8b5cf6);\n  overflow: hidden;\n  cursor: context-menu;\n  transition: box-shadow 0.15s, transform 0.15s;\n  min-height: 108px;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.sc[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--tc, #8b5cf6);\n  transform: translateY(-1px);\n}\n.sc[data-type=active][_ngcontent-%COMP%] {\n  --tc: #f59e0b;\n  --tc-bg: rgba(245,158,11,0.10);\n}\n.sc[data-type=passive][_ngcontent-%COMP%] {\n  --tc: #a78bfa;\n  --tc-bg: rgba(167,139,250,0.10);\n}\n.sc[data-type=dice_bonus][_ngcontent-%COMP%] {\n  --tc: #34d399;\n  --tc-bg: rgba(52,211,153,0.10);\n}\n.sc[data-type=stat_bonus][_ngcontent-%COMP%] {\n  --tc: #38bdf8;\n  --tc-bg: rgba(56,189,248,0.10);\n}\n.sc[data-type=talent_bonus][_ngcontent-%COMP%] {\n  --tc: #fbbf24;\n  --tc-bg: rgba(251,191,36,0.10);\n}\n.sc.sc-disabled[_ngcontent-%COMP%] {\n  opacity: 0.45;\n  filter: grayscale(0.5);\n}\n.sc-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  padding: 0.22rem 0.5rem;\n  background: var(--tc-bg);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  min-height: 24px;\n}\n.sc-type-icon[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  flex-shrink: 0;\n}\n.sc-type-lbl[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.09em;\n  color: var(--tc);\n}\n.sc-action[_ngcontent-%COMP%] {\n  font-size: 0.58rem;\n  font-weight: 800;\n  padding: 1px 5px;\n  border-radius: 3px;\n  white-space: nowrap;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  flex-shrink: 0;\n}\n.sc-action[data-action=Aktion][_ngcontent-%COMP%] {\n  background: #dc2626;\n  color: #fff;\n}\n.sc-action[data-action=Bonusaktion][_ngcontent-%COMP%] {\n  background: #2563eb;\n  color: #fff;\n}\n.sc-action[data-action="Keine Aktion"][_ngcontent-%COMP%] {\n  background: #4b5563;\n  color: #d1d5db;\n}\n.sc-action[data-action=Reaktion][_ngcontent-%COMP%] {\n  background: #d97706;\n  color: #fff;\n}\n.sc-rank[_ngcontent-%COMP%] {\n  font-size: 0.59rem;\n  font-weight: 700;\n  color: var(--muted);\n  opacity: 0.75;\n  letter-spacing: 0.04em;\n  flex-shrink: 0;\n}\n.sc-enl[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: #fde68a;\n  flex-shrink: 0;\n  opacity: 0.9;\n}\n.sc-disabled-badge[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  flex-shrink: 0;\n  opacity: 0.85;\n}\n.sc-name[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  font-size: 0.88rem;\n  font-weight: 800;\n  color: #ffffff;\n  line-height: 1.2;\n  letter-spacing: 0.01em;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding: 0 0.25rem;\n}\n.sc-stat-summary[_ngcontent-%COMP%] {\n  padding: 0 0.5rem 0.1rem;\n  font-size: 0.75rem;\n  font-weight: 700;\n  color: var(--tc);\n}\n.sc-desc[_ngcontent-%COMP%] {\n  padding: 0.28rem 0.5rem 0.1rem;\n  font-size: 0.71rem;\n  color: var(--text-muted);\n  line-height: 1.45;\n  flex: 1;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n.sc-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.22rem 0.5rem;\n  border-top: 1px solid rgba(255, 255, 255, 0.04);\n  margin-top: 0.25rem;\n  min-height: 22px;\n}\n.sc-class[_ngcontent-%COMP%] {\n  font-size: 0.59rem;\n  color: var(--muted);\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  min-width: 0;\n  flex: 0 1 auto;\n}\n.sc-footer-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  overflow: hidden;\n  min-width: 0;\n  flex: 1;\n}\n.sc-cost[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  font-weight: 800;\n  padding: 2px 9px;\n  border-radius: 10px;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.sc-cost[data-resource=mana][_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.22);\n  color: #93c5fd;\n}\n.sc-cost[data-resource=energy][_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.22);\n  color: #86efac;\n}\n.sc-cost[data-resource=life][_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.22);\n  color: #fca5a5;\n}\n.sc-ctx[_ngcontent-%COMP%] {\n  position: fixed;\n  background: #1e2d3d;\n  border: 1px solid #334155;\n  border-radius: 7px;\n  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);\n  z-index: 9999;\n  min-width: 148px;\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_ctx-in 0.08s ease;\n}\n@keyframes _ngcontent-%COMP%_ctx-in {\n  from {\n    opacity: 0;\n    transform: scale(0.95) translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.sc-ctx-btn[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  padding: 0.5rem 0.85rem;\n  background: none;\n  border: none;\n  color: var(--text);\n  font-size: 0.85rem;\n  cursor: pointer;\n  text-align: left;\n  transition: background 0.12s;\n  white-space: nowrap;\n}\n.sc-ctx-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.08);\n}\n.sc-ctx-del[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.18);\n  color: #fca5a5;\n}\n.sc-ctx-note[_ngcontent-%COMP%] {\n  display: block;\n  padding: 0.5rem 0.85rem;\n  font-size: 0.78rem;\n  color: #93c5fd;\n  white-space: nowrap;\n}\n.sc-clickable[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.sc-clickable[_ngcontent-%COMP%]:hover {\n  border-color: rgba(139, 92, 246, 0.55);\n}\n.sp-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.65);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 9000;\n}\n.sp-popup[_ngcontent-%COMP%] {\n  background: #0f1829;\n  border-radius: 12px;\n  border: 1px solid #2d3748;\n  width: min(340px, 90vw);\n  overflow: hidden;\n  position: relative;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);\n  animation: _ngcontent-%COMP%_sp-in 0.12s ease;\n}\n@keyframes _ngcontent-%COMP%_sp-in {\n  from {\n    opacity: 0;\n    transform: scale(0.94) translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.sp-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.45rem 0.75rem;\n}\n.sp-bar[data-type=active][_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.18);\n  border-bottom: 1px solid rgba(139, 92, 246, 0.35);\n}\n.sp-bar[data-type=passive][_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.15);\n  border-bottom: 1px solid rgba(59, 130, 246, 0.3);\n}\n.sp-bar[data-type=dice_bonus][_ngcontent-%COMP%] {\n  background: rgba(234, 179, 8, 0.15);\n  border-bottom: 1px solid rgba(234, 179, 8, 0.3);\n}\n.sp-bar[data-type=stat_bonus][_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.12);\n  border-bottom: 1px solid rgba(34, 197, 94, 0.25);\n}\n.sp-type-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n}\n.sp-type-lbl[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: #94a3b8;\n}\n.sp-action[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 700;\n  padding: 0.15rem 0.45rem;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.07);\n  color: #94a3b8;\n  margin-left: auto;\n}\n.sp-close[_ngcontent-%COMP%] {\n  margin-left: auto;\n  background: transparent;\n  border: none;\n  color: #475569;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  padding: 0 0.1rem;\n  transition: color 0.15s;\n  flex-shrink: 0;\n}\n.sp-action[_ngcontent-%COMP%]    + .sp-close[_ngcontent-%COMP%] {\n  margin-left: 0.5rem;\n}\n.sp-close[_ngcontent-%COMP%]:hover {\n  color: #f1f5f9;\n}\n.sp-name[_ngcontent-%COMP%] {\n  padding: 0.65rem 0.85rem 0.2rem;\n  font-size: 1.1rem;\n  font-weight: 800;\n  color: #f1f5f9;\n}\n.sp-desc[_ngcontent-%COMP%] {\n  padding: 0 0.85rem 0.6rem;\n  font-size: 0.78rem;\n  color: #94a3b8;\n  line-height: 1.55;\n  max-height: 90px;\n  overflow-y: auto;\n}\n.sp-resource[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.55rem;\n  margin: 0 0.75rem 0.65rem;\n  padding: 0.45rem 0.65rem;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 7px;\n  border: 1px solid rgba(255, 255, 255, 0.06);\n}\n.sp-res-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 700;\n  color: var(--rc, #94a3b8);\n  flex-shrink: 0;\n  min-width: 56px;\n}\n.sp-res-track[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 6px;\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n  overflow: hidden;\n}\n.sp-res-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: var(--rc, #94a3b8);\n  border-radius: 3px;\n  transition: width 0.3s ease;\n}\n.sp-res-val[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: #f1f5f9;\n  flex-shrink: 0;\n}\n.sp-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0 0.75rem 0.75rem;\n}\n.sp-use[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.55rem 0.75rem;\n  background: var(--rc, #8b5cf6);\n  border: none;\n  border-radius: 7px;\n  color: #fff;\n  font-weight: 700;\n  cursor: pointer;\n  font-size: 0.88rem;\n  transition: background 0.2s, filter 0.15s;\n}\n.sp-use[_ngcontent-%COMP%]:hover:not(.sp-cant):not(.sp-paid) {\n  filter: brightness(1.15);\n}\n.sp-use.sp-cant[_ngcontent-%COMP%] {\n  background: #374151;\n  color: #6b7280;\n  cursor: not-allowed;\n}\n.sp-use.sp-paid[_ngcontent-%COMP%] {\n  background: #166534;\n  color: #bbf7d0;\n  cursor: default;\n  animation: _ngcontent-%COMP%_sp-paid-flash 1.4s ease forwards;\n}\n@keyframes _ngcontent-%COMP%_sp-paid-flash {\n  0% {\n    background: #22c55e;\n    color: #fff;\n    filter: brightness(1.2);\n  }\n  18% {\n    background: #166534;\n    color: #bbf7d0;\n    filter: none;\n  }\n  100% {\n    background: #166534;\n    color: #bbf7d0;\n  }\n}\n/*# sourceMappingURL=skill.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SkillComponent, [{
    type: Component,
    args: [{ selector: "app-skill", imports: [CommonModule], template: `<div class="sc"
     [attr.data-type]="effectiveType"
     [class.sc-disabled]="isDisabled"
     [class.sc-clickable]="effectiveType === 'active' && (cost || skill.embeddedMacroAction || skill.embeddedMacro)"
     (click)="onCardClick()"
     (contextmenu)="onRightClick($event)">

  <!-- Topbar: type icon + type label + NAME (prominent) + action pill + enlightened -->
  <div class="sc-bar">
    <span class="sc-type-icon">{{ typeIcon }}</span>
    <span class="sc-type-lbl">{{ typeLabel }}</span>
    <span class="sc-name">{{ skill.name }}</span>
    @if (effectiveType === 'active' && actionType) {
      <span class="sc-action" [attr.data-action]="actionType">{{ actionIcon }} {{ actionType }}</span>
    }
    @if (skill.enlightened) {
      <span class="sc-enl" title="Erkenntnis">&#x2726;</span>
    }
    @if (skill.disabled) {
      <span class="sc-disabled-badge" title="Deaktiviert">\u{1F6AB}</span>
    }
  </div>

  <!-- Stat summary for stat_bonus type -->
  @if (effectiveType === 'stat_bonus' && statSummary) {
    <div class="sc-stat-summary">{{ statSummary }}</div>
  }

  <!-- Talent summary for talent_bonus type -->
  @if (effectiveType === 'talent_bonus' && talentSummary) {
    <div class="sc-stat-summary">{{ talentSummary }}</div>
  }

  <!-- Description -->
  <div class="sc-desc" [innerHTML]="enhancedDescription"></div>

  <!-- Footer: class + rank (gray) + cost (big) -->
  <div class="sc-footer">
    <div class="sc-footer-left">
      <span class="sc-class">{{ skill.class }}</span>
      @if (rankRoman) {
        <span class="sc-rank">{{ rankRoman }}</span>
      }
    </div>
    @if (cost) {
      <span class="sc-cost" [attr.data-resource]="cost.type">
        {{ costIcon }} {{ cost.amount }}{{ cost.perRound ? '/Rd' : '' }}
      </span>
    }
  </div>

</div>

<!-- Context menu (fixed position) -->
@if (showContextMenu) {
  <div class="sc-ctx" [style.left.px]="menuX" [style.top.px]="menuY"
       (click)="$event.stopPropagation()">
    @if (readOnly) {
      <span class="sc-ctx-note">&#x23F3; Tempor&auml;r &mdash; durch Effekt gew&auml;hrt</span>
    } @else {
      <button class="sc-ctx-btn" (click)="editSkill()">&#x270F; Bearbeiten</button>
      @if (isEditing) {
        <button class="sc-ctx-btn" (click)="toggleDisabled()">
          {{ skill.disabled ? '\\u2705 Aktivieren' : '\\uD83D\\uDEAB Deaktivieren' }}
        </button>
      }
      <button class="sc-ctx-btn sc-ctx-del" (click)="deleteSkill()">&#x2715; L&ouml;schen</button>
    }
  </div>
}

<!-- Pay resource popup -->
@if (showPayPopup) {
  <div class="sp-backdrop" (click)="closePayPopup()">
    <div class="sp-popup" (click)="$event.stopPropagation()">

      <!-- Type bar (same style as card topbar) -->
      <div class="sp-bar" [attr.data-type]="effectiveType">
        <span class="sp-type-icon">{{ typeIcon }}</span>
        <span class="sp-type-lbl">{{ typeLabel }}</span>
        @if (effectiveType === 'active' && actionType) {
          <span class="sp-action" [attr.data-action]="actionType">{{ actionIcon }} {{ actionType }}</span>
        }
        <button class="sp-close" (click)="closePayPopup()" title="Schlie&szlig;en">&#x2715;</button>
      </div>

      <!-- Skill name -->
      <div class="sp-name">{{ skill.name }}</div>

      <!-- Skill description -->
      <div class="sp-desc" [innerHTML]="enhancedDescription"></div>

      <!-- Resource bar -->
      <div class="sp-resource" [style.--rc]="resourceColor">
        <span class="sp-res-label">{{ resourceLabel }}</span>
        <div class="sp-res-track">
          <div class="sp-res-fill"
               [style.width.%]="((resourceStatus?.statusCurrent ?? 0) / resourceMax) * 100">
          </div>
        </div>
        <span class="sp-res-val">
          {{ resourceStatus?.statusCurrent ?? 0 }} / {{ resourceMax }}
        </span>
      </div>

      <!-- Actions -->
      <div class="sp-actions">
        <button class="sp-use"
                [style.--rc]="resourceColor"
                [class.sp-cant]="!canAfford && !payFeedback.active"
                [class.sp-paid]="payFeedback.active"
                [disabled]="!canAfford && !payFeedback.active"
                (click)="payAndUse()">
          @if (payFeedback.active) {
            &#x2713;&nbsp;Eingesetzt &nbsp;&minus;{{ payFeedback.amount }} {{ payFeedback.label }}
          } @else if (canAfford) {
            Einsetzen &nbsp;&minus;{{ cost?.amount }} {{ resourceLabel }}{{ cost?.perRound ? ' / Rd' : '' }}
          } @else {
            Nicht genug {{ resourceLabel }}
          }
        </button>
      </div>

    </div>
  </div>
}

<!-- Macro action popup -->
@if (showMacroPopup) {
  <div class="sp-backdrop" (click)="closeMacroPopup()">
    <div class="sp-popup" (click)="$event.stopPropagation()">
      <div class="sp-bar" [attr.data-type]="effectiveType">
        <span class="sp-type-icon">{{ typeIcon }}</span>
        <span class="sp-type-lbl">{{ typeLabel }}</span>
        @if (actionType) {
          <span class="sp-action" [attr.data-action]="actionType">{{ actionIcon }} {{ actionType }}</span>
        }
        <button class="sp-close" (click)="closeMacroPopup()" title="Schlie&szlig;en">&#x2715;</button>
      </div>
      <div class="sp-name">{{ skill.name }}</div>
      <div class="sp-desc" [innerHTML]="enhancedDescription"></div>
      <div class="sp-actions">
        <button class="sp-use"
                [class.sp-paid]="!!macroResult"
                [disabled]="macroExecuting"
                (click)="executeMacroAction()">
          @if (macroResult) { &#x2713; {{ macroResult }} }
          @else if (macroExecuting) { Wird ausgef&uuml;hrt... }
          @else { &#x25BA; Ausf&uuml;hren }
        </button>
      </div>
    </div>
  </div>
}
`, styles: ['/* src/app/sheet/skill/skill.component.css */\n:host {\n  display: block;\n}\n.sc {\n  display: flex;\n  flex-direction: column;\n  background: #0f1829;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  border-left: 3px solid var(--tc, #8b5cf6);\n  overflow: hidden;\n  cursor: context-menu;\n  transition: box-shadow 0.15s, transform 0.15s;\n  min-height: 108px;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.sc:hover {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--tc, #8b5cf6);\n  transform: translateY(-1px);\n}\n.sc[data-type=active] {\n  --tc: #f59e0b;\n  --tc-bg: rgba(245,158,11,0.10);\n}\n.sc[data-type=passive] {\n  --tc: #a78bfa;\n  --tc-bg: rgba(167,139,250,0.10);\n}\n.sc[data-type=dice_bonus] {\n  --tc: #34d399;\n  --tc-bg: rgba(52,211,153,0.10);\n}\n.sc[data-type=stat_bonus] {\n  --tc: #38bdf8;\n  --tc-bg: rgba(56,189,248,0.10);\n}\n.sc[data-type=talent_bonus] {\n  --tc: #fbbf24;\n  --tc-bg: rgba(251,191,36,0.10);\n}\n.sc.sc-disabled {\n  opacity: 0.45;\n  filter: grayscale(0.5);\n}\n.sc-bar {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  padding: 0.22rem 0.5rem;\n  background: var(--tc-bg);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  min-height: 24px;\n}\n.sc-type-icon {\n  font-size: 0.78rem;\n  flex-shrink: 0;\n}\n.sc-type-lbl {\n  font-size: 0.62rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.09em;\n  color: var(--tc);\n}\n.sc-action {\n  font-size: 0.58rem;\n  font-weight: 800;\n  padding: 1px 5px;\n  border-radius: 3px;\n  white-space: nowrap;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  flex-shrink: 0;\n}\n.sc-action[data-action=Aktion] {\n  background: #dc2626;\n  color: #fff;\n}\n.sc-action[data-action=Bonusaktion] {\n  background: #2563eb;\n  color: #fff;\n}\n.sc-action[data-action="Keine Aktion"] {\n  background: #4b5563;\n  color: #d1d5db;\n}\n.sc-action[data-action=Reaktion] {\n  background: #d97706;\n  color: #fff;\n}\n.sc-rank {\n  font-size: 0.59rem;\n  font-weight: 700;\n  color: var(--muted);\n  opacity: 0.75;\n  letter-spacing: 0.04em;\n  flex-shrink: 0;\n}\n.sc-enl {\n  font-size: 0.65rem;\n  color: #fde68a;\n  flex-shrink: 0;\n  opacity: 0.9;\n}\n.sc-disabled-badge {\n  font-size: 0.65rem;\n  flex-shrink: 0;\n  opacity: 0.85;\n}\n.sc-name {\n  flex: 1;\n  min-width: 0;\n  font-size: 0.88rem;\n  font-weight: 800;\n  color: #ffffff;\n  line-height: 1.2;\n  letter-spacing: 0.01em;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  padding: 0 0.25rem;\n}\n.sc-stat-summary {\n  padding: 0 0.5rem 0.1rem;\n  font-size: 0.75rem;\n  font-weight: 700;\n  color: var(--tc);\n}\n.sc-desc {\n  padding: 0.28rem 0.5rem 0.1rem;\n  font-size: 0.71rem;\n  color: var(--text-muted);\n  line-height: 1.45;\n  flex: 1;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n.sc-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.22rem 0.5rem;\n  border-top: 1px solid rgba(255, 255, 255, 0.04);\n  margin-top: 0.25rem;\n  min-height: 22px;\n}\n.sc-class {\n  font-size: 0.59rem;\n  color: var(--muted);\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  min-width: 0;\n  flex: 0 1 auto;\n}\n.sc-footer-left {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  overflow: hidden;\n  min-width: 0;\n  flex: 1;\n}\n.sc-cost {\n  font-size: 0.82rem;\n  font-weight: 800;\n  padding: 2px 9px;\n  border-radius: 10px;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.sc-cost[data-resource=mana] {\n  background: rgba(59, 130, 246, 0.22);\n  color: #93c5fd;\n}\n.sc-cost[data-resource=energy] {\n  background: rgba(34, 197, 94, 0.22);\n  color: #86efac;\n}\n.sc-cost[data-resource=life] {\n  background: rgba(239, 68, 68, 0.22);\n  color: #fca5a5;\n}\n.sc-ctx {\n  position: fixed;\n  background: #1e2d3d;\n  border: 1px solid #334155;\n  border-radius: 7px;\n  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55);\n  z-index: 9999;\n  min-width: 148px;\n  overflow: hidden;\n  animation: ctx-in 0.08s ease;\n}\n@keyframes ctx-in {\n  from {\n    opacity: 0;\n    transform: scale(0.95) translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.sc-ctx-btn {\n  display: block;\n  width: 100%;\n  padding: 0.5rem 0.85rem;\n  background: none;\n  border: none;\n  color: var(--text);\n  font-size: 0.85rem;\n  cursor: pointer;\n  text-align: left;\n  transition: background 0.12s;\n  white-space: nowrap;\n}\n.sc-ctx-btn:hover {\n  background: rgba(255, 255, 255, 0.08);\n}\n.sc-ctx-del:hover {\n  background: rgba(239, 68, 68, 0.18);\n  color: #fca5a5;\n}\n.sc-ctx-note {\n  display: block;\n  padding: 0.5rem 0.85rem;\n  font-size: 0.78rem;\n  color: #93c5fd;\n  white-space: nowrap;\n}\n.sc-clickable {\n  cursor: pointer;\n}\n.sc-clickable:hover {\n  border-color: rgba(139, 92, 246, 0.55);\n}\n.sp-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.65);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 9000;\n}\n.sp-popup {\n  background: #0f1829;\n  border-radius: 12px;\n  border: 1px solid #2d3748;\n  width: min(340px, 90vw);\n  overflow: hidden;\n  position: relative;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);\n  animation: sp-in 0.12s ease;\n}\n@keyframes sp-in {\n  from {\n    opacity: 0;\n    transform: scale(0.94) translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.sp-bar {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.45rem 0.75rem;\n}\n.sp-bar[data-type=active] {\n  background: rgba(139, 92, 246, 0.18);\n  border-bottom: 1px solid rgba(139, 92, 246, 0.35);\n}\n.sp-bar[data-type=passive] {\n  background: rgba(59, 130, 246, 0.15);\n  border-bottom: 1px solid rgba(59, 130, 246, 0.3);\n}\n.sp-bar[data-type=dice_bonus] {\n  background: rgba(234, 179, 8, 0.15);\n  border-bottom: 1px solid rgba(234, 179, 8, 0.3);\n}\n.sp-bar[data-type=stat_bonus] {\n  background: rgba(34, 197, 94, 0.12);\n  border-bottom: 1px solid rgba(34, 197, 94, 0.25);\n}\n.sp-type-icon {\n  font-size: 0.85rem;\n}\n.sp-type-lbl {\n  font-size: 0.6rem;\n  font-weight: 800;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: #94a3b8;\n}\n.sp-action {\n  font-size: 0.6rem;\n  font-weight: 700;\n  padding: 0.15rem 0.45rem;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.07);\n  color: #94a3b8;\n  margin-left: auto;\n}\n.sp-close {\n  margin-left: auto;\n  background: transparent;\n  border: none;\n  color: #475569;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  padding: 0 0.1rem;\n  transition: color 0.15s;\n  flex-shrink: 0;\n}\n.sp-action + .sp-close {\n  margin-left: 0.5rem;\n}\n.sp-close:hover {\n  color: #f1f5f9;\n}\n.sp-name {\n  padding: 0.65rem 0.85rem 0.2rem;\n  font-size: 1.1rem;\n  font-weight: 800;\n  color: #f1f5f9;\n}\n.sp-desc {\n  padding: 0 0.85rem 0.6rem;\n  font-size: 0.78rem;\n  color: #94a3b8;\n  line-height: 1.55;\n  max-height: 90px;\n  overflow-y: auto;\n}\n.sp-resource {\n  display: flex;\n  align-items: center;\n  gap: 0.55rem;\n  margin: 0 0.75rem 0.65rem;\n  padding: 0.45rem 0.65rem;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 7px;\n  border: 1px solid rgba(255, 255, 255, 0.06);\n}\n.sp-res-label {\n  font-size: 0.75rem;\n  font-weight: 700;\n  color: var(--rc, #94a3b8);\n  flex-shrink: 0;\n  min-width: 56px;\n}\n.sp-res-track {\n  flex: 1;\n  height: 6px;\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n  overflow: hidden;\n}\n.sp-res-fill {\n  height: 100%;\n  background: var(--rc, #94a3b8);\n  border-radius: 3px;\n  transition: width 0.3s ease;\n}\n.sp-res-val {\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: #f1f5f9;\n  flex-shrink: 0;\n}\n.sp-actions {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0 0.75rem 0.75rem;\n}\n.sp-use {\n  flex: 1;\n  padding: 0.55rem 0.75rem;\n  background: var(--rc, #8b5cf6);\n  border: none;\n  border-radius: 7px;\n  color: #fff;\n  font-weight: 700;\n  cursor: pointer;\n  font-size: 0.88rem;\n  transition: background 0.2s, filter 0.15s;\n}\n.sp-use:hover:not(.sp-cant):not(.sp-paid) {\n  filter: brightness(1.15);\n}\n.sp-use.sp-cant {\n  background: #374151;\n  color: #6b7280;\n  cursor: not-allowed;\n}\n.sp-use.sp-paid {\n  background: #166534;\n  color: #bbf7d0;\n  cursor: default;\n  animation: sp-paid-flash 1.4s ease forwards;\n}\n@keyframes sp-paid-flash {\n  0% {\n    background: #22c55e;\n    color: #fff;\n    filter: brightness(1.2);\n  }\n  18% {\n    background: #166534;\n    color: #bbf7d0;\n    filter: none;\n  }\n  100% {\n    background: #166534;\n    color: #bbf7d0;\n  }\n}\n/*# sourceMappingURL=skill.component.css.map */\n'] }]
  }], () => [{ type: DomSanitizer }, { type: ChangeDetectorRef }], { skill: [{
    type: Input,
    args: [{ required: true }]
  }], sheet: [{
    type: Input,
    args: [{ required: true }]
  }], index: [{
    type: Input,
    args: [{ required: true }]
  }], isEditing: [{
    type: Input
  }], readOnly: [{
    type: Input
  }], patch: [{
    type: Output
  }], delete: [{
    type: Output
  }], editingChange: [{
    type: Output
  }], openEditor: [{
    type: Output
  }], triggerMacro: [{
    type: Output
  }], closeMenu: [{
    type: HostListener,
    args: ["document:click"]
  }], closeMenuOnCtx: [{
    type: HostListener,
    args: ["document:contextmenu"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SkillComponent, { className: "SkillComponent", filePath: "app/sheet/skill/skill.component.ts", lineNumber: 25 });
})();

export {
  SkillEditorComponent,
  ClassTree,
  ItemComponent,
  SpellEditorOverlayComponent,
  ItemEditorComponent,
  SpellComponent,
  SkillComponent
};
//# sourceMappingURL=chunk-SJFL75AL.js.map
