import {
  WorldSocketService
} from "./chunk-5ZPJN4WG.js";
import {
  KeywordEnhancer,
  LibraryStoreService,
  SKILL_DEFINITIONS,
  SUMMON_RUNE_ID,
  TrueStatsService,
  actionMacroToScript,
  calculateSpellCost,
  computeSkillTalentBonuses,
  createPlayerContext,
  generateSpellId,
  macroActionToScript,
  runScript
} from "./chunk-BNPZFNFF.js";
import {
  scaledVolume
} from "./chunk-RAWCOLGX.js";
import {
  ImageService
} from "./chunk-7RNBGZ3X.js";
import {
  FormulaType
} from "./chunk-SVTPZQLG.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MinValidator,
  NgControlStatus,
  NgModel,
  NumberValueAccessor,
  RangeValueAccessor
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
  isPlatformBrowser
} from "./chunk-FGI44Z6P.js";
import {
  APP_ID,
  ApplicationRef,
  BehaviorSubject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ConnectableObservable,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  HostListener,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  IterableDiffers,
  NgModule,
  NgZone,
  Observable,
  Output,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  Subject,
  Subscription,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  animationFrameScheduler,
  asapScheduler,
  auditTime,
  booleanAttribute,
  computed,
  createComponent,
  distinctUntilChanged,
  effect,
  filter,
  forwardRef,
  inject,
  interval,
  isObservable,
  map,
  merge,
  numberAttribute,
  of,
  pairwise,
  setClassMetadata,
  shareReplay,
  signal,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  untracked,
  ɵsetClassDebugInfo,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
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

// src/app/utils/stability.util.ts
function applyStability(rawDamage, stability) {
  const dmg = Math.max(0, rawDamage);
  const stab = Math.max(0, stability || 0);
  if (stab === 0 || dmg === 0)
    return Math.round(dmg);
  return Math.round(dmg * (100 / (100 + stab)));
}
function applyStabilityToDelta(delta, stability) {
  if (delta >= 0)
    return delta;
  return -applyStability(-delta, stability);
}

// src/app/sheet/dice-roller/dice-roller.component.ts
var _forTrack0 = ($index, $item) => $item.name;
var _forTrack1 = ($index, $item) => $item.id;
function DiceRollerComponent_For_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 42);
    \u0275\u0275listener("click", function DiceRollerComponent_For_26_Template_button_click_0_listener() {
      const type_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.selectDice(type_r2));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const type_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("selected", ctx_r2.selectedDiceType() === type_r2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" d", type_r2, " ");
  }
}
function DiceRollerComponent_Conditional_44_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("negative", ctx_r2.totalBonus() < 0)("positive", ctx_r2.totalBonus() > 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r2.totalBonus() > 0 ? "+" : "", "", ctx_r2.totalBonus(), " ");
  }
}
function DiceRollerComponent_Conditional_49_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 50);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const set_r4 = ctx.$implicit;
    const $index_r5 = ctx.$index;
    const rollResult_r6 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("chosen", $index_r5 === rollResult_r6.chosenAdvantageIndex);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3(" Wurf ", $index_r5 + 1, ": [", set_r4.join("+"), "] = ", rollResult_r6.advantageTotals == null ? null : rollResult_r6.advantageTotals[$index_r5], " ");
  }
}
function DiceRollerComponent_Conditional_49_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275repeaterCreate(1, DiceRollerComponent_Conditional_49_Conditional_4_For_2_Template, 2, 5, "span", 49, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rollResult_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(rollResult_r6.advantageRolls);
  }
}
function DiceRollerComponent_Conditional_49_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 47);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rollResult_r6 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("[", rollResult_r6.rolls.join("+"), "]");
  }
}
function DiceRollerComponent_Conditional_49_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 51);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bonus_r7 = ctx.$implicit;
    \u0275\u0275classProp("negative", bonus_r7.value < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3(" ", bonus_r7.name, ": ", bonus_r7.value > 0 ? "+" : "", "", bonus_r7.value, " ");
  }
}
function DiceRollerComponent_Conditional_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 43)(1, "div", 44);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 45);
    \u0275\u0275conditionalCreate(4, DiceRollerComponent_Conditional_49_Conditional_4_Template, 3, 0, "div", 46)(5, DiceRollerComponent_Conditional_49_Conditional_5_Template, 2, 1, "span", 47);
    \u0275\u0275repeaterCreate(6, DiceRollerComponent_Conditional_49_For_7_Template, 2, 5, "span", 48, _forTrack0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const rollResult_r6 = ctx;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("secret", rollResult_r6.isSecret)("animate", ctx_r2.isAnimating());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(rollResult_r6.result);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(rollResult_r6.advantage && rollResult_r6.advantageRolls ? 4 : 5);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(rollResult_r6.bonuses);
  }
}
function DiceRollerComponent_For_63_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 52);
    \u0275\u0275listener("click", function DiceRollerComponent_For_63_Template_button_click_0_listener() {
      const stat_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleBonus(stat_r9.name));
    });
    \u0275\u0275elementStart(1, "span", 53);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 54);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const stat_r9 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("selected", ctx_r2.isBonusSelected(stat_r9.name));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(stat_r9.name);
    \u0275\u0275advance();
    \u0275\u0275classProp("negative", stat_r9.value < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", stat_r9.value > 0 ? "+" : "", "", stat_r9.value, " ");
  }
}
function DiceRollerComponent_Conditional_64_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 59);
    \u0275\u0275listener("input", function DiceRollerComponent_Conditional_64_Conditional_4_Template_input_input_0_listener($event) {
      \u0275\u0275restoreView(_r10);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.skillFilter.set($event.target.value));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("value", ctx_r2.skillFilter());
  }
}
function DiceRollerComponent_Conditional_64_For_7_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 61);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bonus_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(bonus_r12.context);
  }
}
function DiceRollerComponent_Conditional_64_For_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 60);
    \u0275\u0275listener("click", function DiceRollerComponent_Conditional_64_For_7_Template_button_click_0_listener() {
      const bonus_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleBonus(bonus_r12.name));
    });
    \u0275\u0275elementStart(1, "span", 53);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 54);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, DiceRollerComponent_Conditional_64_For_7_Conditional_5_Template, 2, 1, "span", 61);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bonus_r12 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", ctx_r2.isBonusSelected(bonus_r12.name));
    \u0275\u0275property("title", bonus_r12.context || "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(bonus_r12.name);
    \u0275\u0275advance();
    \u0275\u0275classProp("negative", bonus_r12.value < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", bonus_r12.value > 0 ? "+" : "", "", bonus_r12.value);
    \u0275\u0275advance();
    \u0275\u0275conditional(bonus_r12.context ? 5 : -1);
  }
}
function DiceRollerComponent_Conditional_64_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33)(1, "div", 55)(2, "h4");
    \u0275\u0275text(3, "W\xFCrfelboni (Skills)");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, DiceRollerComponent_Conditional_64_Conditional_4_Template, 1, 1, "input", 56);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 57);
    \u0275\u0275repeaterCreate(6, DiceRollerComponent_Conditional_64_For_7_Template, 6, 9, "button", 58, _forTrack0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r2.availableDiceBonuses().length > 4 ? 4 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.filteredDiceBonuses());
  }
}
function DiceRollerComponent_Conditional_65_For_5_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 61);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bonus_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(bonus_r14.context);
  }
}
function DiceRollerComponent_Conditional_65_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 63);
    \u0275\u0275listener("click", function DiceRollerComponent_Conditional_65_For_5_Template_button_click_0_listener() {
      const bonus_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.toggleBonus(bonus_r14.name));
    });
    \u0275\u0275elementStart(1, "span", 53);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 54);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, DiceRollerComponent_Conditional_65_For_5_Conditional_5_Template, 2, 1, "span", 61);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bonus_r14 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", ctx_r2.isBonusSelected(bonus_r14.name));
    \u0275\u0275property("title", bonus_r14.context || "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(bonus_r14.name.replace("Talent: ", ""));
    \u0275\u0275advance();
    \u0275\u0275classProp("negative", bonus_r14.value < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", bonus_r14.value > 0 ? "+" : "", "", bonus_r14.value);
    \u0275\u0275advance();
    \u0275\u0275conditional(bonus_r14.context ? 5 : -1);
  }
}
function DiceRollerComponent_Conditional_65_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33)(1, "h4");
    \u0275\u0275text(2, "Talente");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 57);
    \u0275\u0275repeaterCreate(4, DiceRollerComponent_Conditional_65_For_5_Template, 6, 9, "button", 62, _forTrack0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r2.talentBonuses());
  }
}
function DiceRollerComponent_Conditional_66_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 36)(1, "span", 64);
    \u0275\u0275text(2, "Ausgew\xE4hlt:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 65);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx_r2.totalBonus() > 0 ? "+" : "", "", ctx_r2.totalBonus());
  }
}
function DiceRollerComponent_Conditional_73_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 66);
    \u0275\u0275text(1, "Keine gespeicherten Konfigurationen");
    \u0275\u0275elementEnd();
  }
}
function DiceRollerComponent_Conditional_73_Conditional_2_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 67)(1, "button", 68);
    \u0275\u0275listener("click", function DiceRollerComponent_Conditional_73_Conditional_2_For_1_Template_button_click_1_listener() {
      const config_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.loadConfiguration(config_r16));
    });
    \u0275\u0275elementStart(2, "span", 69);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 70);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "button", 71);
    \u0275\u0275listener("click", function DiceRollerComponent_Conditional_73_Conditional_2_For_1_Template_button_click_6_listener() {
      const config_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.deleteConfiguration(config_r16.id));
    });
    \u0275\u0275text(7, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const config_r16 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(config_r16.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", config_r16.diceCount, "d", config_r16.diceType);
  }
}
function DiceRollerComponent_Conditional_73_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, DiceRollerComponent_Conditional_73_Conditional_2_For_1_Template, 8, 3, "div", 67, _forTrack1);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r2.savedConfigs());
  }
}
function DiceRollerComponent_Conditional_73_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 39);
    \u0275\u0275conditionalCreate(1, DiceRollerComponent_Conditional_73_Conditional_1_Template, 2, 0, "p", 66)(2, DiceRollerComponent_Conditional_73_Conditional_2_Template, 2, 0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.savedConfigs().length === 0 ? 1 : 2);
  }
}
function DiceRollerComponent_Conditional_80_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 73);
    \u0275\u0275listener("click", function DiceRollerComponent_Conditional_80_For_2_Template_button_click_0_listener() {
      const roll_r18 = \u0275\u0275restoreView(_r17).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.repeatRoll(roll_r18));
    });
    \u0275\u0275elementStart(1, "span", 74);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 75);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 76);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const roll_r18 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", roll_r18.diceCount, "d", roll_r18.diceType);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("= ", roll_r18.result);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getTimeAgo(roll_r18.timestamp));
  }
}
function DiceRollerComponent_Conditional_80_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 41);
    \u0275\u0275repeaterCreate(1, DiceRollerComponent_Conditional_80_For_2_Template, 7, 4, "button", 72, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.rollHistory().rolls.slice(0, 8));
  }
}
function DiceRollerComponent_Conditional_81_For_8_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 81);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const roll_r19 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(roll_r19.actionName);
  }
}
function DiceRollerComponent_Conditional_81_For_8_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 82);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const roll_r19 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", roll_r19.diceCount, "d", roll_r19.diceType);
  }
}
function DiceRollerComponent_Conditional_81_For_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 79)(1, "span", 80);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, DiceRollerComponent_Conditional_81_For_8_Conditional_3_Template, 2, 1, "span", 81)(4, DiceRollerComponent_Conditional_81_For_8_Conditional_4_Template, 2, 2, "span", 82);
    \u0275\u0275elementStart(5, "span", 83);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const roll_r19 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("color", roll_r19.actionColor || "#9ca3af");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", roll_r19.actionIcon || "\u{1F3B2}", " ", roll_r19.characterName);
    \u0275\u0275advance();
    \u0275\u0275conditional(roll_r19.actionName ? 3 : 4);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(roll_r19.finalDamage ?? roll_r19.result);
  }
}
function DiceRollerComponent_Conditional_81_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 40)(1, "div", 12)(2, "h4");
    \u0275\u0275text(3, "Aktionsverlauf");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 77);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 78);
    \u0275\u0275repeaterCreate(7, DiceRollerComponent_Conditional_81_For_8_Template, 7, 6, "div", 79, _forTrack1);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.receivedRolls().length);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.receivedRolls().slice(0, 100));
  }
}
var DICE_BASE_LEVEL = 0.3;
var DiceRollerComponent = class _DiceRollerComponent {
  sheet;
  close = new EventEmitter();
  worldSocket = inject(WorldSocketService);
  libraryStore = inject(LibraryStoreService);
  trueStats = inject(TrueStatsService);
  diceRollSub;
  // Dice rolling state
  selectedDiceType = signal(20, ...ngDevMode ? [{ debugName: "selectedDiceType" }] : []);
  diceCount = signal(1, ...ngDevMode ? [{ debugName: "diceCount" }] : []);
  selectedBonuses = signal(/* @__PURE__ */ new Set(), ...ngDevMode ? [{ debugName: "selectedBonuses" }] : []);
  manualBonus = signal(0, ...ngDevMode ? [{ debugName: "manualBonus" }] : []);
  isSecretRoll = signal(false, ...ngDevMode ? [{ debugName: "isSecretRoll" }] : []);
  // Secret roll - only GM sees
  useAdvantage = signal(false, ...ngDevMode ? [{ debugName: "useAdvantage" }] : []);
  // Animation state
  isRolling = signal(false, ...ngDevMode ? [{ debugName: "isRolling" }] : []);
  isAnimating = signal(false, ...ngDevMode ? [{ debugName: "isAnimating" }] : []);
  lastRoll = signal(null, ...ngDevMode ? [{ debugName: "lastRoll" }] : []);
  // Received rolls from other players
  receivedRolls = signal([], ...ngDevMode ? [{ debugName: "receivedRolls" }] : []);
  // Roll history (last 10 unique roll configurations)
  rollHistory = signal({ rolls: [] }, ...ngDevMode ? [{ debugName: "rollHistory" }] : []);
  // Saved configurations
  savedConfigs = signal([], ...ngDevMode ? [{ debugName: "savedConfigs" }] : []);
  showSavedList = signal(true, ...ngDevMode ? [{ debugName: "showSavedList" }] : []);
  showHistoryList = signal(true, ...ngDevMode ? [{ debugName: "showHistoryList" }] : []);
  newConfigName = "";
  // Skill filter for searching
  skillFilter = signal("", ...ngDevMode ? [{ debugName: "skillFilter" }] : []);
  // Expose Math for template
  Math = Math;
  // Audio for dice roll
  rollSound = null;
  // Available options
  diceTypes = [4, 6, 8, 10, 12, 20, 100];
  // Computed dice formula string (e.g., "2d20+5")
  diceFormula = computed(() => {
    const count = this.diceCount();
    const type = this.selectedDiceType();
    const bonus = this.totalBonus();
    let formula = `${count}d${type}`;
    if (bonus !== 0) {
      formula += bonus > 0 ? `+${bonus}` : `${bonus}`;
    }
    return formula;
  }, ...ngDevMode ? [{ debugName: "diceFormula" }] : []);
  // Computed values
  availableDiceBonuses = computed(() => {
    if (!this.sheet)
      return [];
    const bonuses = [];
    const characterSkills = this.sheet.skills || [];
    characterSkills.forEach((skill) => {
      const isDiceBonus = skill.type === "dice_bonus";
      if (isDiceBonus) {
        const definition = SKILL_DEFINITIONS.find((s) => s.name === skill.name);
        const description = definition?.description || skill.description || "";
        const match = description.match(/([+-]\d+)/);
        if (match) {
          const contextMatch = description.match(/[+-]\d+\s*(.+)/);
          const skillLevel = skill.level || 1;
          bonuses.push({
            name: skill.name,
            value: parseInt(match[1]) * skillLevel,
            // Preserves sign: negative = good, positive = bad
            source: "skill",
            context: contextMatch?.[1] || void 0
          });
        }
      }
    });
    if (this.sheet.equipment) {
      this.sheet.equipment.forEach((item) => {
        if (item.diceBonuses && item.diceBonuses.length > 0) {
          item.diceBonuses.forEach((diceBonus) => {
            bonuses.push({
              name: `${item.name}: ${diceBonus.name}`,
              value: diceBonus.value,
              source: "item",
              context: `von ${item.name}`
            });
          });
        }
      });
    }
    if (this.sheet.activeStatusEffects) {
      this.sheet.activeStatusEffects.forEach((active) => {
        const effect2 = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        if (!effect2)
          return;
        const diceBonuses = active.customDiceBonuses ?? effect2.diceBonuses;
        if (diceBonuses && diceBonuses.length > 0) {
          const stacks = active.stacks || 1;
          diceBonuses.forEach((db) => {
            bonuses.push({
              name: `${effect2.name}: ${db.name}`,
              value: db.value * stacks,
              source: "status_effect",
              context: stacks > 1 ? `${stacks}\xD7 Stapel` : `von ${effect2.name}`
            });
          });
        }
      });
    }
    return bonuses;
  }, ...ngDevMode ? [{ debugName: "availableDiceBonuses" }] : []);
  // Filtered and sorted dice bonuses based on search filter
  filteredDiceBonuses = computed(() => {
    const filter2 = this.skillFilter().toLowerCase().trim();
    let bonuses = this.availableDiceBonuses();
    if (filter2) {
      bonuses = bonuses.filter((b) => b.name.toLowerCase().includes(filter2) || b.context && b.context.toLowerCase().includes(filter2));
    }
    return bonuses.sort((a, b) => a.name.localeCompare(b.name));
  }, ...ngDevMode ? [{ debugName: "filteredDiceBonuses" }] : []);
  resolveStatusEffect(statusEffectId, customEffect) {
    if (customEffect)
      return customEffect;
    for (const lib of this.libraryStore.allLibraries) {
      const found = lib.statusEffects?.find((se) => se.id === statusEffectId);
      if (found)
        return found;
    }
    return void 0;
  }
  statBonuses = computed(() => {
    if (!this.sheet)
      return [];
    const statKeys = [
      { name: "St\xE4rke", key: "strength" },
      { name: "Geschicklichkeit", key: "dexterity" },
      { name: "Konstitution", key: "constitution" },
      { name: "Intelligenz", key: "intelligence" },
      { name: "Wille", key: "chill" },
      { name: "Geschwindigkeit", key: "speed" }
    ];
    return statKeys.map(({ name, key }) => ({
      name,
      value: this.trueStats.calculateStatDiceModifier(this.sheet, key),
      source: "stat"
    })).filter((b) => b.value !== 0);
  }, ...ngDevMode ? [{ debugName: "statBonuses" }] : []);
  /** Talent bonuses — matches talents tab: -(statModifier + ranks + skill bonuses). */
  talentBonuses = computed(() => {
    if (!this.sheet)
      return [];
    const ranks = this.sheet.talentRanks ?? {};
    const skillBonuses = computeSkillTalentBonuses(this.sheet);
    return TALENT_DEFINITIONS.map((t) => {
      const statKey = t.stat;
      const statModifier = this.trueStats.calculateStatModifier(this.sheet, statKey);
      const talentRank = ranks[t.id] ?? 0;
      const skillBonus = skillBonuses.get(t.id) ?? 0;
      const totalValue = -(statModifier + talentRank + skillBonus);
      const contextParts = [`${t.statLabel}: ${statModifier >= 0 ? "+" : ""}${statModifier}`, `${talentRank} R\xE4nge`];
      if (skillBonus !== 0)
        contextParts.push(`+${skillBonus} F\xE4higkeiten`);
      return {
        name: `Talent: ${t.name}`,
        value: totalValue,
        source: "talent",
        context: contextParts.join(", ")
      };
    }).filter((b, i) => b.value !== 0 || (ranks[TALENT_DEFINITIONS[i].id] ?? 0) > 0 || (skillBonuses.get(TALENT_DEFINITIONS[i].id) ?? 0) > 0);
  }, ...ngDevMode ? [{ debugName: "talentBonuses" }] : []);
  totalBonus = computed(() => {
    let total = this.manualBonus();
    const allBonuses = [...this.availableDiceBonuses(), ...this.statBonuses(), ...this.talentBonuses()];
    this.selectedBonuses().forEach((bonusName) => {
      const bonus = allBonuses.find((b) => b.name === bonusName);
      if (bonus) {
        total += bonus.value;
      }
    });
    return total;
  }, ...ngDevMode ? [{ debugName: "totalBonus" }] : []);
  ngOnInit() {
    this.loadRollHistory();
    this.loadSavedConfigs();
    this.initRollSound();
    this.loadSyncedActionRolls();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (this.sheet.worldName) {
      const buffered = this.worldSocket.rollBuffer.filter((r) => r.characterId !== this.sheet.id && !r.isSecret);
      this.receivedRolls.set(buffered.slice(0, 100));
      this.diceRollSub = this.worldSocket.diceRoll$.subscribe((roll) => {
        if (roll.characterId !== this.sheet.id) {
          if (!roll.isSecret) {
            this.receivedRolls.update((rolls) => [roll, ...rolls.slice(0, 99)]);
          }
        }
      });
    }
  }
  // Load synced roll results from action macros
  loadSyncedActionRolls() {
    const stored = localStorage.getItem("action-roll-results");
    if (stored) {
      try {
        const results = JSON.parse(stored);
        if (results && results.length > 0) {
          results.forEach((result) => {
            const roll = {
              id: result.id,
              characterName: this.sheet.name,
              diceType: parseInt(result.formula.split("d")[1]) || 20,
              diceCount: parseInt(result.formula.split("d")[0]) || 1,
              bonuses: [],
              result: result.total,
              rolls: result.rolls,
              timestamp: /* @__PURE__ */ new Date()
            };
            this.rollHistory.update((h) => ({
              rolls: [roll, ...h.rolls.slice(0, 9)]
            }));
          });
          localStorage.removeItem("action-roll-results");
        }
      } catch (e) {
        console.error("Failed to load synced action rolls:", e);
      }
    }
  }
  ngOnDestroy() {
    this.diceRollSub?.unsubscribe();
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
  // Initialize dice roll sound
  initRollSound() {
    this.rollSound = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVQIj6PLwZ14MQ+E1uvl0pZlAQBfnNPq7LqBT+7uubvV8ei/Nx1u0fbuqXkmAKzw//+rZTofrdnt/5Z3LyKWy+/+tX0vH4fG7f/Hi0osaMjq/7eYPyZYsuT/1aNREV657/z/l2wdB1qf2er9qnwyDl+XyvKvhT4UUInB7rKKRxVGbJ/Xx5dOICdOXoO2s2orCBYrVHOhsGszCgAJGEBniqhiOwobJy9EYoOUZEoqKjQaHSw+VGmBbkguNjwsGRQhNERZbmtSQUxNQy0eDRQjN05mZU5DSkI9Ly0hERUiMEhebVZAPz02Li8oIiMiLDZIVk1BP0E8NjM0Li4sJiorNEFMRDs+QDs3NDUyNDEvMjY8Q0M9PD8+Ozg3NjY2NzQ4PEA+Ozw+Pjo5ODg5ODk6Ozw8Ozs8PDw7Ozs7PDw8PD08PD09PT4+Pj4+Pz8/Pz9AQEBAQEBAQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB");
  }
  // Play the dice roll sound
  playRollSound() {
    if (this.rollSound) {
      this.rollSound.currentTime = 0;
      const v = scaledVolume(DICE_BASE_LEVEL);
      if (v <= 0)
        return;
      this.rollSound.volume = v;
      this.rollSound.play().catch(() => {
      });
    }
  }
  // Parse dice formula like "2d6+3" or "1d20-5"
  parseDiceFormula(formula) {
    const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    if (match) {
      const count = match[1] ? parseInt(match[1]) : 1;
      const type = parseInt(match[2]);
      const bonus = match[3] ? parseInt(match[3]) : 0;
      if (this.diceTypes.includes(type) || type > 0) {
        this.diceCount.set(Math.min(20, Math.max(1, count)));
        this.selectedDiceType.set(type);
        this.manualBonus.set(bonus);
      }
    }
  }
  // Select a dice type
  selectDice(type) {
    this.selectedDiceType.set(type);
  }
  // Save/Load configurations
  saveConfiguration() {
    if (!this.newConfigName.trim())
      return;
    const config = {
      id: `config-${Date.now()}`,
      name: this.newConfigName.trim(),
      diceType: this.selectedDiceType(),
      diceCount: this.diceCount(),
      bonusNames: Array.from(this.selectedBonuses()),
      manualBonus: this.manualBonus()
    };
    this.savedConfigs.update((configs) => [...configs, config]);
    this.saveSavedConfigs();
    this.newConfigName = "";
  }
  loadConfiguration(config) {
    this.selectedDiceType.set(config.diceType);
    this.diceCount.set(config.diceCount);
    this.manualBonus.set(config.manualBonus);
    this.selectedBonuses.set(new Set(config.bonusNames));
  }
  deleteConfiguration(id) {
    this.savedConfigs.update((configs) => configs.filter((c) => c.id !== id));
    this.saveSavedConfigs();
  }
  loadSavedConfigs() {
    try {
      const saved = localStorage.getItem(`dice-configs-${this.sheet.name}`);
      if (saved) {
        this.savedConfigs.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved configs", e);
    }
  }
  saveSavedConfigs() {
    try {
      localStorage.setItem(`dice-configs-${this.sheet.name}`, JSON.stringify(this.savedConfigs()));
    } catch (e) {
      console.error("Failed to save configs", e);
    }
  }
  toggleBonus(bonusName) {
    const current = new Set(this.selectedBonuses());
    if (current.has(bonusName)) {
      current.delete(bonusName);
    } else {
      current.add(bonusName);
    }
    this.selectedBonuses.set(current);
  }
  isBonusSelected(bonusName) {
    return this.selectedBonuses().has(bonusName);
  }
  async roll() {
    if (this.isRolling())
      return;
    this.isRolling.set(true);
    this.isAnimating.set(false);
    this.playRollSound();
    await this.animateRoll();
    const diceType = this.selectedDiceType();
    const count = this.diceCount();
    const bonus = this.totalBonus();
    const rollOnce = () => {
      const r = [];
      for (let i = 0; i < count; i++) {
        r.push(Math.floor(Math.random() * diceType) + 1);
      }
      return r;
    };
    let rolls;
    let advantageRolls;
    let advantageTotals;
    let chosenAdvantageIndex;
    if (this.useAdvantage()) {
      const setA = rollOnce();
      const setB = rollOnce();
      const totalA = setA.reduce((a, b) => a + b, 0) + bonus;
      const totalB = setB.reduce((a, b) => a + b, 0) + bonus;
      advantageRolls = [setA, setB];
      advantageTotals = [totalA, totalB];
      chosenAdvantageIndex = totalA <= totalB ? 0 : 1;
      rolls = advantageRolls[chosenAdvantageIndex];
    } else {
      rolls = rollOnce();
    }
    const diceSum = rolls.reduce((a, b) => a + b, 0);
    const total = diceSum + bonus;
    const allBonuses = [...this.availableDiceBonuses(), ...this.statBonuses(), ...this.talentBonuses()];
    const appliedBonuses = [];
    this.selectedBonuses().forEach((bonusName) => {
      const bonus2 = allBonuses.find((b) => b.name === bonusName);
      if (bonus2) {
        appliedBonuses.push(bonus2);
      }
    });
    if (this.manualBonus() !== 0) {
      appliedBonuses.push({
        name: "Manuell",
        value: this.manualBonus(),
        source: "manual"
      });
    }
    const roll = {
      id: `${Date.now()}-${Math.random()}`,
      characterName: this.sheet.name,
      diceType,
      diceCount: count,
      bonuses: appliedBonuses,
      result: total,
      rolls,
      timestamp: /* @__PURE__ */ new Date(),
      isSecret: this.isSecretRoll(),
      advantage: this.useAdvantage() || void 0,
      advantageRolls,
      advantageTotals,
      chosenAdvantageIndex
    };
    this.lastRoll.set(roll);
    this.isRolling.set(false);
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 600);
    this.addToHistory(roll);
    if (this.sheet.worldName) {
      const rollEvent = {
        id: roll.id,
        worldName: this.sheet.worldName,
        characterName: roll.characterName,
        characterId: this.sheet.id || "",
        diceType: roll.diceType,
        diceCount: roll.diceCount,
        bonuses: roll.bonuses,
        result: roll.result,
        rolls: roll.rolls,
        timestamp: roll.timestamp,
        isSecret: roll.isSecret || false
      };
      this.worldSocket.sendDiceRoll(rollEvent);
    }
  }
  async animateRoll() {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
  repeatRoll(roll) {
    this.selectedDiceType.set(roll.diceType);
    this.diceCount.set(roll.diceCount);
    const newBonuses = /* @__PURE__ */ new Set();
    let manualBonusValue = 0;
    roll.bonuses.forEach((bonus) => {
      if (bonus.source === "manual") {
        manualBonusValue = bonus.value;
      } else {
        newBonuses.add(bonus.name);
      }
    });
    this.selectedBonuses.set(newBonuses);
    this.manualBonus.set(manualBonusValue);
    this.roll();
  }
  addToHistory(roll) {
    const history = this.rollHistory();
    const existingIndex = history.rolls.findIndex((r) => r.diceType === roll.diceType && r.diceCount === roll.diceCount && JSON.stringify(r.bonuses) === JSON.stringify(roll.bonuses));
    if (existingIndex >= 0) {
      history.rolls[existingIndex] = roll;
    } else {
      history.rolls.unshift(roll);
      if (history.rolls.length > 10) {
        history.rolls = history.rolls.slice(0, 10);
      }
    }
    this.rollHistory.set({ rolls: [...history.rolls] });
    this.saveRollHistory();
  }
  loadRollHistory() {
    try {
      const saved = localStorage.getItem(`dice-history-${this.sheet.name}`);
      if (saved) {
        const history = JSON.parse(saved);
        history.rolls.forEach((r) => r.timestamp = new Date(r.timestamp));
        this.rollHistory.set(history);
      }
    } catch (e) {
      console.error("Failed to load roll history", e);
    }
  }
  saveRollHistory() {
    try {
      localStorage.setItem(`dice-history-${this.sheet.name}`, JSON.stringify(this.rollHistory()));
    } catch (e) {
      console.error("Failed to save roll history", e);
    }
  }
  getRollLabel(roll) {
    const bonusStr = roll.bonuses.length > 0 ? ` +${roll.bonuses.reduce((sum, b) => sum + b.value, 0)}` : "";
    return `${roll.diceCount}d${roll.diceType}${bonusStr}`;
  }
  getTimeAgo(date) {
    const seconds = Math.floor(((/* @__PURE__ */ new Date()).getTime() - new Date(date).getTime()) / 1e3);
    if (seconds < 60)
      return "Gerade eben";
    if (seconds < 3600)
      return `vor ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400)
      return `vor ${Math.floor(seconds / 3600)}h`;
    return `vor ${Math.floor(seconds / 86400)}d`;
  }
  onClose() {
    this.close.emit();
  }
  static \u0275fac = function DiceRollerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DiceRollerComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DiceRollerComponent, selectors: [["app-dice-roller"]], inputs: { sheet: "sheet" }, outputs: { close: "close" }, decls: 82, vars: 31, consts: [[1, "dice-roller-overlay"], [1, "dice-roller-fullscreen"], [1, "dialog-header"], [1, "app-icon", "i-dice"], [1, "header-controls"], [1, "secret-toggle"], ["type", "checkbox", 3, "change", "checked"], [1, "secret-label"], [1, "secret-toggle", "advantage-toggle"], [1, "close-btn", 3, "click"], [1, "dialog-body"], [1, "panel", "roll-panel"], [1, "panel-header"], [1, "dice-input-section"], ["type", "text", "placeholder", "z.B. 2d6+3 oder 1d20", 1, "dice-formula-input", 3, "input", "value"], [1, "dice-type-grid"], [1, "dice-type-btn", 3, "selected"], [1, "dice-controls"], [1, "control-group"], [1, "number-control"], [3, "click"], ["type", "number", "min", "1", "max", "20", 3, "input", "value"], ["type", "number", 1, "bonus-input", 3, "input", "value"], [1, "roll-summary"], [1, "formula-display"], [3, "negative", "positive"], [1, "roll-btn", 3, "click", "disabled"], [1, "roll-text"], [1, "result-display", 3, "secret", "animate"], [1, "save-config-section"], ["type", "text", "placeholder", "Konfiguration speichern...", 1, "config-name-input", 3, "ngModelChange", "ngModel"], [1, "save-config-btn", 3, "click", "disabled"], [1, "panel", "bonus-panel"], [1, "bonus-section"], [1, "bonus-grid"], [1, "bonus-chip", "stat", 3, "selected"], [1, "selected-summary"], [1, "panel", "config-panel"], [1, "toggle-list-btn", 3, "click"], [1, "saved-configs"], [1, "history-section"], [1, "history-list"], [1, "dice-type-btn", 3, "click"], [1, "result-display"], [1, "result-number"], [1, "result-breakdown"], [1, "advantage-rolls"], [1, "dice-rolls"], [1, "bonus-pill", 3, "negative"], [1, "advantage-set", 3, "chosen"], [1, "advantage-set"], [1, "bonus-pill"], [1, "bonus-chip", "stat", 3, "click"], [1, "chip-name"], [1, "chip-value"], [1, "section-header-row"], ["type", "text", "placeholder", "Filter...", 1, "skill-filter-input", 3, "value"], [1, "bonus-grid", "scrollable"], [1, "bonus-chip", "skill", 3, "selected", "title"], ["type", "text", "placeholder", "Filter...", 1, "skill-filter-input", 3, "input", "value"], [1, "bonus-chip", "skill", 3, "click", "title"], [1, "chip-context"], [1, "bonus-chip", "talent", 3, "selected", "title"], [1, "bonus-chip", "talent", 3, "click", "title"], [1, "summary-label"], [1, "summary-value"], [1, "empty-hint"], [1, "config-item"], [1, "config-btn", 3, "click"], [1, "config-name"], [1, "config-formula"], [1, "config-delete", 3, "click"], [1, "history-item"], [1, "history-item", 3, "click"], [1, "history-formula"], [1, "history-result"], [1, "history-time"], [1, "rolls-count"], [1, "history-list", "received-list"], [1, "received-roll-item"], [1, "received-name"], [1, "received-action"], [1, "received-formula"], [1, "received-result"]], template: function DiceRollerComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h2");
      \u0275\u0275element(4, "span", 3);
      \u0275\u0275text(5, " W\xFCrfel Werfen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "div", 4)(7, "label", 5)(8, "input", 6);
      \u0275\u0275listener("change", function DiceRollerComponent_Template_input_change_8_listener($event) {
        return ctx.isSecretRoll.set($event.target.checked);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "span", 7);
      \u0275\u0275text(10, "Geheim");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "label", 8)(12, "input", 6);
      \u0275\u0275listener("change", function DiceRollerComponent_Template_input_change_12_listener($event) {
        return ctx.useAdvantage.set($event.target.checked);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "span", 7);
      \u0275\u0275text(14, "Vorteil");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(15, "button", 9);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_15_listener() {
        return ctx.onClose();
      });
      \u0275\u0275text(16, "\xD7");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(17, "div", 10)(18, "div", 11)(19, "div", 12)(20, "h3");
      \u0275\u0275text(21, "W\xFCrfeln");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(22, "div", 13)(23, "input", 14);
      \u0275\u0275listener("input", function DiceRollerComponent_Template_input_input_23_listener($event) {
        return ctx.parseDiceFormula($event.target.value);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(24, "div", 15);
      \u0275\u0275repeaterCreate(25, DiceRollerComponent_For_26_Template, 2, 3, "button", 16, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "div", 17)(28, "div", 18)(29, "label");
      \u0275\u0275text(30, "Anzahl");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "div", 19)(32, "button", 20);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_32_listener() {
        return ctx.diceCount.set(ctx.Math.max(1, ctx.diceCount() - 1));
      });
      \u0275\u0275text(33, "-");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "input", 21);
      \u0275\u0275listener("input", function DiceRollerComponent_Template_input_input_34_listener($event) {
        return ctx.diceCount.set(+$event.target.value);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "button", 20);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_35_listener() {
        return ctx.diceCount.set(ctx.Math.min(20, ctx.diceCount() + 1));
      });
      \u0275\u0275text(36, "+");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(37, "div", 18)(38, "label");
      \u0275\u0275text(39, "\xB1Bonus");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "input", 22);
      \u0275\u0275listener("input", function DiceRollerComponent_Template_input_input_40_listener($event) {
        return ctx.manualBonus.set(+$event.target.value);
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(41, "div", 23)(42, "span", 24);
      \u0275\u0275text(43);
      \u0275\u0275conditionalCreate(44, DiceRollerComponent_Conditional_44_Template, 2, 6, "span", 25);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(45, "button", 26);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_45_listener() {
        return ctx.roll();
      });
      \u0275\u0275elementStart(46, "span", 27);
      \u0275\u0275element(47, "span", 3);
      \u0275\u0275text(48);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(49, DiceRollerComponent_Conditional_49_Template, 8, 6, "div", 28);
      \u0275\u0275elementStart(50, "div", 29)(51, "input", 30);
      \u0275\u0275twoWayListener("ngModelChange", function DiceRollerComponent_Template_input_ngModelChange_51_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newConfigName, $event) || (ctx.newConfigName = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "button", 31);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_52_listener() {
        return ctx.saveConfiguration();
      });
      \u0275\u0275text(53, "\u{1F4BE}");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(54, "div", 32)(55, "div", 12)(56, "h3");
      \u0275\u0275text(57, "Boni");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(58, "div", 33)(59, "h4");
      \u0275\u0275text(60, "Attribute");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(61, "div", 34);
      \u0275\u0275repeaterCreate(62, DiceRollerComponent_For_63_Template, 5, 7, "button", 35, _forTrack0);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(64, DiceRollerComponent_Conditional_64_Template, 8, 1, "div", 33);
      \u0275\u0275conditionalCreate(65, DiceRollerComponent_Conditional_65_Template, 6, 0, "div", 33);
      \u0275\u0275conditionalCreate(66, DiceRollerComponent_Conditional_66_Template, 5, 2, "div", 36);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(67, "div", 37)(68, "div", 12)(69, "h3");
      \u0275\u0275text(70, "Gespeichert");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(71, "button", 38);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_71_listener() {
        return ctx.showSavedList.set(!ctx.showSavedList());
      });
      \u0275\u0275text(72);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(73, DiceRollerComponent_Conditional_73_Template, 3, 1, "div", 39);
      \u0275\u0275elementStart(74, "div", 40)(75, "div", 12)(76, "h4");
      \u0275\u0275text(77, "Verlauf");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(78, "button", 38);
      \u0275\u0275listener("click", function DiceRollerComponent_Template_button_click_78_listener() {
        return ctx.showHistoryList.set(!ctx.showHistoryList());
      });
      \u0275\u0275text(79);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(80, DiceRollerComponent_Conditional_80_Template, 3, 0, "div", 41);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(81, DiceRollerComponent_Conditional_81_Template, 9, 1, "div", 40);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      let tmp_15_0;
      \u0275\u0275advance();
      \u0275\u0275classProp("secret-mode", ctx.isSecretRoll());
      \u0275\u0275advance(6);
      \u0275\u0275classProp("active", ctx.isSecretRoll());
      \u0275\u0275advance();
      \u0275\u0275property("checked", ctx.isSecretRoll());
      \u0275\u0275advance(3);
      \u0275\u0275classProp("active", ctx.useAdvantage());
      \u0275\u0275advance();
      \u0275\u0275property("checked", ctx.useAdvantage());
      \u0275\u0275advance(11);
      \u0275\u0275property("value", ctx.diceFormula());
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.diceTypes);
      \u0275\u0275advance(9);
      \u0275\u0275property("value", ctx.diceCount());
      \u0275\u0275advance(6);
      \u0275\u0275property("value", ctx.manualBonus());
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate2(" ", ctx.diceCount(), "d", ctx.selectedDiceType(), " ");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.totalBonus() !== 0 ? 44 : -1);
      \u0275\u0275advance();
      \u0275\u0275classProp("rolling", ctx.isRolling())("secret", ctx.isSecretRoll());
      \u0275\u0275property("disabled", ctx.isRolling());
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate1(" ", ctx.isRolling() ? "..." : "W\xFCrfeln");
      \u0275\u0275advance();
      \u0275\u0275conditional((tmp_15_0 = ctx.lastRoll()) ? 49 : -1, tmp_15_0);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.newConfigName);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.newConfigName);
      \u0275\u0275advance(10);
      \u0275\u0275repeater(ctx.statBonuses());
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.availableDiceBonuses().length > 0 ? 64 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.talentBonuses().length > 0 ? 65 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.selectedBonuses().size > 0 ? 66 : -1);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1(" ", ctx.showSavedList() ? "\u25BC" : "\u25B6", " ");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showSavedList() ? 73 : -1);
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1(" ", ctx.showHistoryList() ? "\u25BC" : "\u25B6", " ");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showHistoryList() ? 80 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.receivedRolls().length > 0 ? 81 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NgControlStatus, NgModel], styles: ["\n\n.dice-roller-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.85);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 2000;\n  animation: _ngcontent-%COMP%_fadeIn 0.2s ease-out;\n  overflow: hidden;\n  overscroll-behavior: contain;\n}\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.dice-roller-fullscreen[_ngcontent-%COMP%] {\n  background: #1a1a1a;\n  border: none;\n  border-radius: 0;\n  width: 100vw;\n  height: 100vh;\n  max-width: none;\n  max-height: none;\n  display: flex;\n  flex-direction: column;\n  animation: _ngcontent-%COMP%_slideIn 0.3s ease-out;\n  overflow: hidden;\n}\n.dice-roller-fullscreen.secret-mode[_ngcontent-%COMP%] {\n  border-color: transparent;\n}\n@keyframes _ngcontent-%COMP%_slideIn {\n  from {\n    transform: scale(0.9);\n    opacity: 0;\n  }\n  to {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n.dialog-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  background:\n    linear-gradient(\n      135deg,\n      #22c55e 0%,\n      #16a34a 100%);\n  flex-shrink: 0;\n}\n.dice-roller-fullscreen.secret-mode[_ngcontent-%COMP%]   .dialog-header[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e40af 0%,\n      #1e3a8a 100%);\n}\n.dialog-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  color: white;\n  font-size: 22px;\n  font-weight: bold;\n}\n.header-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.secret-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  padding: 8px 16px;\n  background: rgba(255, 255, 255, 0.15);\n  border-radius: 20px;\n  transition: all 0.2s;\n}\n.secret-toggle[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.25);\n}\n.secret-toggle.active[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.3);\n}\n.secret-toggle[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  display: none;\n}\n.secret-label[_ngcontent-%COMP%] {\n  color: white;\n  font-size: 14px;\n  font-weight: 500;\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.2);\n  border: none;\n  color: white;\n  font-size: 28px;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.3);\n  transform: scale(1.1);\n}\n.dialog-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  overflow: hidden;\n  gap: 0;\n}\n.panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 20px;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n.panel-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #333;\n}\n.panel-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #22c55e;\n  font-size: 16px;\n  font-weight: 600;\n}\n.dice-roller-fullscreen.secret-mode[_ngcontent-%COMP%]   .panel-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  color: #60a5fa;\n}\n.roll-panel[_ngcontent-%COMP%] {\n  flex: 1.2;\n  background: #222;\n  border-right: 1px solid #333;\n}\n.dice-input-section[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.dice-formula-input[_ngcontent-%COMP%] {\n  width: 100%;\n  background: #1a1a1a;\n  border: 2px solid #444;\n  border-radius: 8px;\n  color: white;\n  font-size: 18px;\n  padding: 12px 16px;\n  text-align: center;\n  font-family: monospace;\n}\n.dice-formula-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #22c55e;\n}\n.dice-type-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));\n  gap: 8px;\n  margin-bottom: 16px;\n}\n.dice-type-btn[_ngcontent-%COMP%] {\n  background: #2a2a2a;\n  border: 2px solid #444;\n  border-radius: 8px;\n  color: #888;\n  font-size: 16px;\n  font-weight: bold;\n  padding: 12px 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.dice-type-btn[_ngcontent-%COMP%]:hover {\n  background: #333;\n  border-color: #22c55e;\n  color: white;\n}\n.dice-type-btn.selected[_ngcontent-%COMP%] {\n  background: #22c55e;\n  border-color: #22c55e;\n  color: white;\n}\n.dice-controls[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  margin-bottom: 16px;\n}\n.control-group[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.control-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  color: #888;\n  font-size: 12px;\n  margin-bottom: 6px;\n}\n.number-control[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 8px;\n  overflow: hidden;\n}\n.number-control[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: #333;\n  border: none;\n  color: white;\n  width: 36px;\n  height: 36px;\n  cursor: pointer;\n  font-size: 18px;\n}\n.number-control[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #444;\n}\n.number-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  background: transparent;\n  border: none;\n  color: white;\n  font-size: 16px;\n  text-align: center;\n  width: 50px;\n}\n.bonus-input[_ngcontent-%COMP%] {\n  width: 100%;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 8px;\n  color: white;\n  font-size: 16px;\n  padding: 8px 12px;\n  text-align: center;\n}\n.roll-summary[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 16px;\n}\n.formula-display[_ngcontent-%COMP%] {\n  font-size: 28px;\n  font-weight: bold;\n  color: white;\n  font-family: monospace;\n}\n.formula-display[_ngcontent-%COMP%]   .negative[_ngcontent-%COMP%] {\n  color: #22c55e;\n}\n.formula-display[_ngcontent-%COMP%]   .positive[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.roll-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  background:\n    linear-gradient(\n      135deg,\n      #22c55e 0%,\n      #16a34a 100%);\n  border: none;\n  border-radius: 12px;\n  color: white;\n  font-size: 20px;\n  font-weight: bold;\n  padding: 16px 24px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.roll-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);\n}\n.roll-btn.rolling[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_shake 0.3s infinite;\n}\n.roll-btn.secret[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1e40af 0%,\n      #1e3a8a 100%);\n}\n@keyframes _ngcontent-%COMP%_shake {\n  0%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(-4px) rotate(-2deg);\n  }\n  75% {\n    transform: translateX(4px) rotate(2deg);\n  }\n}\n.result-display[_ngcontent-%COMP%] {\n  margin-top: 20px;\n  padding: 24px;\n  background:\n    linear-gradient(\n      135deg,\n      #1a3a1a 0%,\n      #1a2a1a 100%);\n  border: 2px solid #22c55e;\n  border-radius: 12px;\n  text-align: center;\n}\n.result-display.secret[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #1a2a4a 0%,\n      #1a1a3a 100%);\n  border-color: #1e40af;\n}\n.result-display.animate[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_resultPop 0.5s ease-out;\n}\n@keyframes _ngcontent-%COMP%_resultPop {\n  0% {\n    transform: scale(0.8);\n    opacity: 0;\n  }\n  50% {\n    transform: scale(1.1);\n  }\n  100% {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n.result-number[_ngcontent-%COMP%] {\n  font-size: 64px;\n  font-weight: bold;\n  color: #22c55e;\n  line-height: 1;\n}\n.result-display.secret[_ngcontent-%COMP%]   .result-number[_ngcontent-%COMP%] {\n  color: #60a5fa;\n}\n.result-breakdown[_ngcontent-%COMP%] {\n  margin-top: 12px;\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 8px;\n}\n.dice-rolls[_ngcontent-%COMP%] {\n  color: #888;\n  font-family: monospace;\n  font-size: 14px;\n}\n.advantage-rolls[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  width: 100%;\n}\n.advantage-set[_ngcontent-%COMP%] {\n  font-family: monospace;\n  font-size: 13px;\n  color: #888;\n  padding: 4px 8px;\n  border-radius: 6px;\n  border: 1px solid transparent;\n}\n.advantage-set.chosen[_ngcontent-%COMP%] {\n  color: #22c55e;\n  border-color: rgba(34, 197, 94, 0.4);\n  background: rgba(34, 197, 94, 0.08);\n}\n.bonus-pill[_ngcontent-%COMP%] {\n  background: #333;\n  color: #ef4444;\n  padding: 4px 10px;\n  border-radius: 12px;\n  font-size: 12px;\n}\n.bonus-pill.negative[_ngcontent-%COMP%] {\n  color: #22c55e;\n}\n.save-config-section[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-top: 20px;\n}\n.config-name-input[_ngcontent-%COMP%] {\n  flex: 1;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 8px;\n  color: white;\n  padding: 10px 14px;\n  font-size: 14px;\n}\n.save-config-btn[_ngcontent-%COMP%] {\n  background: #22c55e;\n  border: none;\n  border-radius: 8px;\n  color: white;\n  width: 44px;\n  height: 44px;\n  cursor: pointer;\n  font-size: 18px;\n}\n.save-config-btn[_ngcontent-%COMP%]:disabled {\n  background: #333;\n  cursor: not-allowed;\n}\n.bonus-panel[_ngcontent-%COMP%] {\n  flex: 1;\n  background: #1e1e1e;\n  border-right: 1px solid #333;\n}\n.bonus-section[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.section-header-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 10px;\n}\n.section-header-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.skill-filter-input[_ngcontent-%COMP%] {\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  padding: 4px 8px;\n  font-size: 12px;\n  width: 100px;\n}\n.skill-filter-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #22c55e;\n}\n.bonus-section[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px 0;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.bonus-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.bonus-grid.scrollable[_ngcontent-%COMP%] {\n  overflow: visible;\n  padding-right: 0;\n}\n.bonus-chip[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: 6px;\n  background: #2a2a2a;\n  border: 2px solid #444;\n  border-radius: 6px;\n  padding: 5px 10px;\n  cursor: pointer;\n  transition: all 0.2s;\n  min-width: 0;\n}\n.bonus-chip[_ngcontent-%COMP%]:hover {\n  border-color: #666;\n  background: #333;\n}\n.bonus-chip.selected[_ngcontent-%COMP%] {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.15);\n}\n.bonus-chip.stat.selected[_ngcontent-%COMP%] {\n  border-color: #a855f7;\n  background: rgba(168, 85, 247, 0.15);\n}\n.bonus-chip.skill.selected[_ngcontent-%COMP%] {\n  border-color: #f59e0b;\n  background: rgba(245, 158, 11, 0.15);\n}\n.bonus-chip.talent.selected[_ngcontent-%COMP%] {\n  border-color: #34d399;\n  background: rgba(52, 211, 153, 0.15);\n}\n.chip-name[_ngcontent-%COMP%] {\n  color: #ccc;\n  font-size: 11px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 120px;\n}\n.chip-value[_ngcontent-%COMP%] {\n  color: #ef4444;\n  font-size: 13px;\n  font-weight: bold;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.chip-value.negative[_ngcontent-%COMP%] {\n  color: #22c55e;\n}\n.chip-context[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 9px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 80px;\n}\n.selected-summary[_ngcontent-%COMP%] {\n  background: #2a2a2a;\n  border-radius: 8px;\n  padding: 12px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.summary-label[_ngcontent-%COMP%] {\n  color: #888;\n  font-size: 14px;\n}\n.summary-value[_ngcontent-%COMP%] {\n  color: #22c55e;\n  font-size: 20px;\n  font-weight: bold;\n}\n.config-panel[_ngcontent-%COMP%] {\n  flex: 0.8;\n  background: #1a1a1a;\n}\n.toggle-list-btn[_ngcontent-%COMP%] {\n  background: #333;\n  border: none;\n  color: #888;\n  width: 28px;\n  height: 28px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 10px;\n}\n.saved-configs[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.empty-hint[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 12px;\n  font-style: italic;\n}\n.config-item[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n.config-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 6px;\n  padding: 10px 12px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.config-btn[_ngcontent-%COMP%]:hover {\n  background: #333;\n  border-color: #22c55e;\n}\n.config-name[_ngcontent-%COMP%] {\n  color: white;\n  font-size: 13px;\n}\n.config-formula[_ngcontent-%COMP%] {\n  color: #888;\n  font-size: 12px;\n  font-family: monospace;\n}\n.config-delete[_ngcontent-%COMP%] {\n  background: #333;\n  border: none;\n  color: #888;\n  width: 32px;\n  height: 32px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 16px;\n}\n.config-delete[_ngcontent-%COMP%]:hover {\n  background: #ef4444;\n  color: white;\n}\n.history-section[_ngcontent-%COMP%] {\n  margin-bottom: 20px;\n}\n.history-section[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px 0;\n}\n.history-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.history-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background: #2a2a2a;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 8px 12px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.history-item[_ngcontent-%COMP%]:hover {\n  background: #333;\n  border-color: #22c55e;\n}\n.history-formula[_ngcontent-%COMP%] {\n  color: white;\n  font-family: monospace;\n  font-size: 13px;\n}\n.history-result[_ngcontent-%COMP%] {\n  color: #22c55e;\n  font-weight: bold;\n  font-size: 13px;\n}\n.history-time[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 11px;\n}\n.received-section[_ngcontent-%COMP%] {\n  margin-top: auto;\n}\n.received-section[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px 0;\n}\n.received-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.received-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: #2a2a2a;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 8px 12px;\n  animation: _ngcontent-%COMP%_slideInRight 0.3s ease-out;\n}\n@keyframes _ngcontent-%COMP%_slideInRight {\n  from {\n    transform: translateX(20px);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n.received-item[_ngcontent-%COMP%]   .player-name[_ngcontent-%COMP%] {\n  color: #22c55e;\n  font-weight: 600;\n  font-size: 12px;\n}\n.received-item[_ngcontent-%COMP%]   .roll-info[_ngcontent-%COMP%] {\n  color: #888;\n  font-size: 12px;\n}\n.received-item[_ngcontent-%COMP%]   .roll-result[_ngcontent-%COMP%] {\n  color: white;\n  font-weight: bold;\n  font-size: 14px;\n  margin-left: auto;\n}\n.received-roll-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: #2a2a2a;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 6px 10px;\n  font-size: 12px;\n}\n.received-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.received-action[_ngcontent-%COMP%] {\n  color: #9ca3af;\n  flex: 1;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.received-formula[_ngcontent-%COMP%] {\n  color: #9ca3af;\n  font-family: monospace;\n  flex: 1;\n}\n.received-result[_ngcontent-%COMP%] {\n  color: white;\n  font-weight: bold;\n  margin-left: auto;\n  flex-shrink: 0;\n}\n.rolls-count[_ngcontent-%COMP%] {\n  background: #4a5568;\n  color: #e5e7eb;\n  font-size: 10px;\n  font-weight: 700;\n  border-radius: 10px;\n  padding: 1px 6px;\n}\n@media (max-width: 1000px) {\n  .dialog-body[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n  .panel[_ngcontent-%COMP%] {\n    border-right: none !important;\n    border-bottom: 1px solid #333;\n  }\n  .roll-panel[_ngcontent-%COMP%], \n   .bonus-panel[_ngcontent-%COMP%], \n   .config-panel[_ngcontent-%COMP%] {\n    flex: none;\n    max-height: 40vh;\n  }\n}\n/*# sourceMappingURL=dice-roller.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DiceRollerComponent, [{
    type: Component,
    args: [{ selector: "app-dice-roller", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="dice-roller-overlay">\r
  <div class="dice-roller-fullscreen" [class.secret-mode]="isSecretRoll()">\r
    <!-- Header -->\r
    <div class="dialog-header">\r
      <h2><span class="app-icon i-dice"></span> W\xFCrfel Werfen</h2>\r
      <div class="header-controls">\r
        <label class="secret-toggle" [class.active]="isSecretRoll()">\r
          <input type="checkbox" [checked]="isSecretRoll()" (change)="isSecretRoll.set($any($event.target).checked)" />\r
          <span class="secret-label">Geheim</span>\r
        </label>\r
        <label class="secret-toggle advantage-toggle" [class.active]="useAdvantage()">\r
          <input type="checkbox" [checked]="useAdvantage()" (change)="useAdvantage.set($any($event.target).checked)" />\r
          <span class="secret-label">Vorteil</span>\r
        </label>\r
        <button class="close-btn" (click)="onClose()">&times;</button>\r
      </div>\r
    </div>\r
\r
    <div class="dialog-body">\r
      <!-- Left Panel: Rolling Area -->\r
      <div class="panel roll-panel">\r
        <div class="panel-header">\r
          <h3>W\xFCrfeln</h3>\r
        </div>\r
\r
        <!-- Custom Dice Input -->\r
        <div class="dice-input-section">\r
          <input \r
            type="text" \r
            class="dice-formula-input"\r
            [value]="diceFormula()"\r
            (input)="parseDiceFormula($any($event.target).value)"\r
            placeholder="z.B. 2d6+3 oder 1d20"\r
          />\r
        </div>\r
\r
        <!-- Dice Type Buttons -->\r
        <div class="dice-type-grid">\r
          @for (type of diceTypes; track type) {\r
            <button \r
              class="dice-type-btn"\r
              [class.selected]="selectedDiceType() === type"\r
              (click)="selectDice(type)">\r
              d{{type}}\r
            </button>\r
          }\r
        </div>\r
        \r
        <!-- Dice Count & Bonus -->\r
        <div class="dice-controls">\r
          <div class="control-group">\r
            <label>Anzahl</label>\r
            <div class="number-control">\r
              <button (click)="diceCount.set(Math.max(1, diceCount() - 1))">-</button>\r
              <input type="number" min="1" max="20" [value]="diceCount()" (input)="diceCount.set(+$any($event.target).value)" />\r
              <button (click)="diceCount.set(Math.min(20, diceCount() + 1))">+</button>\r
            </div>\r
          </div>\r
          <div class="control-group">\r
            <label>\xB1Bonus</label>\r
            <input type="number" class="bonus-input" [value]="manualBonus()" (input)="manualBonus.set(+$any($event.target).value)" />\r
          </div>\r
        </div>\r
\r
        <!-- Roll Summary -->\r
        <div class="roll-summary">\r
          <span class="formula-display">\r
            {{diceCount()}}d{{selectedDiceType()}}\r
            @if (totalBonus() !== 0) {\r
              <span [class.negative]="totalBonus() < 0" [class.positive]="totalBonus() > 0">\r
                {{totalBonus() > 0 ? '+' : ''}}{{totalBonus()}}\r
              </span>\r
            }\r
          </span>\r
        </div>\r
\r
        <!-- Roll Button -->\r
        <button \r
          class="roll-btn"\r
          [class.rolling]="isRolling()"\r
          [class.secret]="isSecretRoll()"\r
          [disabled]="isRolling()"\r
          (click)="roll()">\r
          <span class="roll-text"><span class="app-icon i-dice"></span> {{isRolling() ? '...' : 'W\xFCrfeln'}}</span>\r
        </button>\r
\r
        <!-- Result Display -->\r
        @if (lastRoll(); as rollResult) {\r
          <div class="result-display" [class.secret]="rollResult.isSecret" [class.animate]="isAnimating()">\r
            <div class="result-number">{{rollResult.result}}</div>\r
            <div class="result-breakdown">\r
              @if (rollResult.advantage && rollResult.advantageRolls) {\r
                <div class="advantage-rolls">\r
                  @for (set of rollResult.advantageRolls; track $index) {\r
                    <span class="advantage-set" [class.chosen]="$index === rollResult.chosenAdvantageIndex">\r
                      Wurf {{ $index + 1 }}: [{{ set.join('+') }}] = {{ rollResult.advantageTotals?.[$index] }}\r
                    </span>\r
                  }\r
                </div>\r
              } @else {\r
                <span class="dice-rolls">[{{rollResult.rolls.join('+')}}]</span>\r
              }\r
              @for (bonus of rollResult.bonuses; track bonus.name) {\r
                <span class="bonus-pill" [class.negative]="bonus.value < 0">\r
                  {{bonus.name}}: {{bonus.value > 0 ? '+' : ''}}{{bonus.value}}\r
                </span>\r
              }\r
            </div>\r
          </div>\r
        }\r
\r
        <!-- Save Configuration -->\r
        <div class="save-config-section">\r
          <input \r
            type="text" \r
            class="config-name-input"\r
            [(ngModel)]="newConfigName"\r
            placeholder="Konfiguration speichern..." \r
          />\r
          <button class="save-config-btn" (click)="saveConfiguration()" [disabled]="!newConfigName">\u{1F4BE}</button>\r
        </div>\r
      </div>\r
\r
      <!-- Middle Panel: Bonuses -->\r
      <div class="panel bonus-panel">\r
        <div class="panel-header">\r
          <h3>Boni</h3>\r
        </div>\r
\r
        <!-- Stat Bonuses -->\r
        <div class="bonus-section">\r
          <h4>Attribute</h4>\r
          <div class="bonus-grid">\r
            @for (stat of statBonuses(); track stat.name) {\r
              <button \r
                class="bonus-chip stat"\r
                [class.selected]="isBonusSelected(stat.name)"\r
                (click)="toggleBonus(stat.name)">\r
                <span class="chip-name">{{stat.name}}</span>\r
                <span class="chip-value" [class.negative]="stat.value < 0">\r
                  {{stat.value > 0 ? '+' : ''}}{{stat.value}}\r
                </span>\r
              </button>\r
            }\r
          </div>\r
        </div>\r
\r
        <!-- Dice Skill Bonuses -->\r
        @if (availableDiceBonuses().length > 0) {\r
          <div class="bonus-section">\r
            <div class="section-header-row">\r
              <h4>W\xFCrfelboni (Skills)</h4>\r
              @if (availableDiceBonuses().length > 4) {\r
                <input type="text" \r
                       class="skill-filter-input"\r
                       placeholder="Filter..."\r
                       [value]="skillFilter()"\r
                       (input)="skillFilter.set($any($event.target).value)" />\r
              }\r
            </div>\r
            <div class="bonus-grid scrollable">\r
              @for (bonus of filteredDiceBonuses(); track bonus.name) {\r
                <button \r
                  class="bonus-chip skill"\r
                  [class.selected]="isBonusSelected(bonus.name)"\r
                  (click)="toggleBonus(bonus.name)"\r
                  [title]="bonus.context || ''">\r
                  <span class="chip-name">{{bonus.name}}</span>\r
                  <span class="chip-value" [class.negative]="bonus.value < 0">{{bonus.value > 0 ? '+' : ''}}{{bonus.value}}</span>\r
                  @if (bonus.context) {\r
                    <span class="chip-context">{{bonus.context}}</span>\r
                  }\r
                </button>\r
              }\r
            </div>\r
          </div>\r
        }\r
\r
        <!-- Talent Bonuses -->\r
        @if (talentBonuses().length > 0) {\r
          <div class="bonus-section">\r
            <h4>Talente</h4>\r
            <div class="bonus-grid scrollable">\r
              @for (bonus of talentBonuses(); track bonus.name) {\r
                <button\r
                  class="bonus-chip talent"\r
                  [class.selected]="isBonusSelected(bonus.name)"\r
                  (click)="toggleBonus(bonus.name)"\r
                  [title]="bonus.context || ''">\r
                  <span class="chip-name">{{bonus.name.replace('Talent: ', '')}}</span>\r
                  <span class="chip-value" [class.negative]="bonus.value < 0">{{bonus.value > 0 ? '+' : ''}}{{bonus.value}}</span>\r
                  @if (bonus.context) {\r
                    <span class="chip-context">{{bonus.context}}</span>\r
                  }\r
                </button>\r
              }\r
            </div>\r
          </div>\r
        }\r
\r
        <!-- Selected Bonuses Summary -->\r
        @if (selectedBonuses().size > 0) {\r
          <div class="selected-summary">\r
            <span class="summary-label">Ausgew\xE4hlt:</span>\r
            <span class="summary-value">{{totalBonus() > 0 ? '+' : ''}}{{totalBonus()}}</span>\r
          </div>\r
        }\r
      </div>\r
\r
      <!-- Right Panel: Saved Configs & History -->\r
      <div class="panel config-panel">\r
        <div class="panel-header">\r
          <h3>Gespeichert</h3>\r
          <button class="toggle-list-btn" (click)="showSavedList.set(!showSavedList())">\r
            {{showSavedList() ? '\u25BC' : '\u25B6'}}\r
          </button>\r
        </div>\r
\r
        @if (showSavedList()) {\r
          <div class="saved-configs">\r
            @if (savedConfigs().length === 0) {\r
              <p class="empty-hint">Keine gespeicherten Konfigurationen</p>\r
            } @else {\r
              @for (config of savedConfigs(); track config.id) {\r
                <div class="config-item">\r
                  <button class="config-btn" (click)="loadConfiguration(config)">\r
                    <span class="config-name">{{config.name}}</span>\r
                    <span class="config-formula">{{config.diceCount}}d{{config.diceType}}</span>\r
                  </button>\r
                  <button class="config-delete" (click)="deleteConfiguration(config.id)">\xD7</button>\r
                </div>\r
              }\r
            }\r
          </div>\r
        }\r
\r
        <!-- Roll History -->\r
        <div class="history-section">\r
          <div class="panel-header">\r
            <h4>Verlauf</h4>\r
            <button class="toggle-list-btn" (click)="showHistoryList.set(!showHistoryList())">\r
              {{showHistoryList() ? '\u25BC' : '\u25B6'}}\r
            </button>\r
          </div>\r
          @if (showHistoryList()) {\r
            <div class="history-list">\r
              @for (roll of rollHistory().rolls.slice(0, 8); track roll.id) {\r
                <button class="history-item" (click)="repeatRoll(roll)">\r
                  <span class="history-formula">{{roll.diceCount}}d{{roll.diceType}}</span>\r
                  <span class="history-result">= {{roll.result}}</span>\r
                  <span class="history-time">{{getTimeAgo(roll.timestamp)}}</span>\r
                </button>\r
              }\r
            </div>\r
          }\r
        </div>\r
\r
        <!-- Received Rolls / Aktionsverlauf -->\r
        @if (receivedRolls().length > 0) {\r
          <div class="history-section">\r
            <div class="panel-header">\r
              <h4>Aktionsverlauf</h4>\r
              <span class="rolls-count">{{ receivedRolls().length }}</span>\r
            </div>\r
            <div class="history-list received-list">\r
              @for (roll of receivedRolls().slice(0, 100); track roll.id) {\r
                <div class="received-roll-item">\r
                  <span class="received-name" [style.color]="roll.actionColor || '#9ca3af'">{{ roll.actionIcon || '\u{1F3B2}' }} {{ roll.characterName }}</span>\r
                  @if (roll.actionName) {\r
                    <span class="received-action">{{ roll.actionName }}</span>\r
                  } @else {\r
                    <span class="received-formula">{{ roll.diceCount }}d{{ roll.diceType }}</span>\r
                  }\r
                  <span class="received-result">{{ roll.finalDamage ?? roll.result }}</span>\r
                </div>\r
              }\r
            </div>\r
          </div>\r
        }\r
      </div>\r
    </div>\r
  </div>\r
</div>\r
`, styles: ["/* src/app/sheet/dice-roller/dice-roller.component.css */\n.dice-roller-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.85);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 2000;\n  animation: fadeIn 0.2s ease-out;\n  overflow: hidden;\n  overscroll-behavior: contain;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.dice-roller-fullscreen {\n  background: #1a1a1a;\n  border: none;\n  border-radius: 0;\n  width: 100vw;\n  height: 100vh;\n  max-width: none;\n  max-height: none;\n  display: flex;\n  flex-direction: column;\n  animation: slideIn 0.3s ease-out;\n  overflow: hidden;\n}\n.dice-roller-fullscreen.secret-mode {\n  border-color: transparent;\n}\n@keyframes slideIn {\n  from {\n    transform: scale(0.9);\n    opacity: 0;\n  }\n  to {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n.dialog-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  background:\n    linear-gradient(\n      135deg,\n      #22c55e 0%,\n      #16a34a 100%);\n  flex-shrink: 0;\n}\n.dice-roller-fullscreen.secret-mode .dialog-header {\n  background:\n    linear-gradient(\n      135deg,\n      #1e40af 0%,\n      #1e3a8a 100%);\n}\n.dialog-header h2 {\n  margin: 0;\n  color: white;\n  font-size: 22px;\n  font-weight: bold;\n}\n.header-controls {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.secret-toggle {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  padding: 8px 16px;\n  background: rgba(255, 255, 255, 0.15);\n  border-radius: 20px;\n  transition: all 0.2s;\n}\n.secret-toggle:hover {\n  background: rgba(255, 255, 255, 0.25);\n}\n.secret-toggle.active {\n  background: rgba(255, 255, 255, 0.3);\n}\n.secret-toggle input {\n  display: none;\n}\n.secret-label {\n  color: white;\n  font-size: 14px;\n  font-weight: 500;\n}\n.close-btn {\n  background: rgba(255, 255, 255, 0.2);\n  border: none;\n  color: white;\n  font-size: 28px;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.2s;\n}\n.close-btn:hover {\n  background: rgba(255, 255, 255, 0.3);\n  transform: scale(1.1);\n}\n.dialog-body {\n  display: flex;\n  flex: 1;\n  overflow: hidden;\n  gap: 0;\n}\n.panel {\n  display: flex;\n  flex-direction: column;\n  padding: 20px;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n.panel-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #333;\n}\n.panel-header h3 {\n  margin: 0;\n  color: #22c55e;\n  font-size: 16px;\n  font-weight: 600;\n}\n.dice-roller-fullscreen.secret-mode .panel-header h3 {\n  color: #60a5fa;\n}\n.roll-panel {\n  flex: 1.2;\n  background: #222;\n  border-right: 1px solid #333;\n}\n.dice-input-section {\n  margin-bottom: 16px;\n}\n.dice-formula-input {\n  width: 100%;\n  background: #1a1a1a;\n  border: 2px solid #444;\n  border-radius: 8px;\n  color: white;\n  font-size: 18px;\n  padding: 12px 16px;\n  text-align: center;\n  font-family: monospace;\n}\n.dice-formula-input:focus {\n  outline: none;\n  border-color: #22c55e;\n}\n.dice-type-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));\n  gap: 8px;\n  margin-bottom: 16px;\n}\n.dice-type-btn {\n  background: #2a2a2a;\n  border: 2px solid #444;\n  border-radius: 8px;\n  color: #888;\n  font-size: 16px;\n  font-weight: bold;\n  padding: 12px 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.dice-type-btn:hover {\n  background: #333;\n  border-color: #22c55e;\n  color: white;\n}\n.dice-type-btn.selected {\n  background: #22c55e;\n  border-color: #22c55e;\n  color: white;\n}\n.dice-controls {\n  display: flex;\n  gap: 16px;\n  margin-bottom: 16px;\n}\n.control-group {\n  flex: 1;\n}\n.control-group label {\n  display: block;\n  color: #888;\n  font-size: 12px;\n  margin-bottom: 6px;\n}\n.number-control {\n  display: flex;\n  align-items: center;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 8px;\n  overflow: hidden;\n}\n.number-control button {\n  background: #333;\n  border: none;\n  color: white;\n  width: 36px;\n  height: 36px;\n  cursor: pointer;\n  font-size: 18px;\n}\n.number-control button:hover {\n  background: #444;\n}\n.number-control input {\n  flex: 1;\n  background: transparent;\n  border: none;\n  color: white;\n  font-size: 16px;\n  text-align: center;\n  width: 50px;\n}\n.bonus-input {\n  width: 100%;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 8px;\n  color: white;\n  font-size: 16px;\n  padding: 8px 12px;\n  text-align: center;\n}\n.roll-summary {\n  text-align: center;\n  margin-bottom: 16px;\n}\n.formula-display {\n  font-size: 28px;\n  font-weight: bold;\n  color: white;\n  font-family: monospace;\n}\n.formula-display .negative {\n  color: #22c55e;\n}\n.formula-display .positive {\n  color: #ef4444;\n}\n.roll-btn {\n  width: 100%;\n  background:\n    linear-gradient(\n      135deg,\n      #22c55e 0%,\n      #16a34a 100%);\n  border: none;\n  border-radius: 12px;\n  color: white;\n  font-size: 20px;\n  font-weight: bold;\n  padding: 16px 24px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.roll-btn:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);\n}\n.roll-btn.rolling {\n  animation: shake 0.3s infinite;\n}\n.roll-btn.secret {\n  background:\n    linear-gradient(\n      135deg,\n      #1e40af 0%,\n      #1e3a8a 100%);\n}\n@keyframes shake {\n  0%, 100% {\n    transform: translateX(0);\n  }\n  25% {\n    transform: translateX(-4px) rotate(-2deg);\n  }\n  75% {\n    transform: translateX(4px) rotate(2deg);\n  }\n}\n.result-display {\n  margin-top: 20px;\n  padding: 24px;\n  background:\n    linear-gradient(\n      135deg,\n      #1a3a1a 0%,\n      #1a2a1a 100%);\n  border: 2px solid #22c55e;\n  border-radius: 12px;\n  text-align: center;\n}\n.result-display.secret {\n  background:\n    linear-gradient(\n      135deg,\n      #1a2a4a 0%,\n      #1a1a3a 100%);\n  border-color: #1e40af;\n}\n.result-display.animate {\n  animation: resultPop 0.5s ease-out;\n}\n@keyframes resultPop {\n  0% {\n    transform: scale(0.8);\n    opacity: 0;\n  }\n  50% {\n    transform: scale(1.1);\n  }\n  100% {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n.result-number {\n  font-size: 64px;\n  font-weight: bold;\n  color: #22c55e;\n  line-height: 1;\n}\n.result-display.secret .result-number {\n  color: #60a5fa;\n}\n.result-breakdown {\n  margin-top: 12px;\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 8px;\n}\n.dice-rolls {\n  color: #888;\n  font-family: monospace;\n  font-size: 14px;\n}\n.advantage-rolls {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  width: 100%;\n}\n.advantage-set {\n  font-family: monospace;\n  font-size: 13px;\n  color: #888;\n  padding: 4px 8px;\n  border-radius: 6px;\n  border: 1px solid transparent;\n}\n.advantage-set.chosen {\n  color: #22c55e;\n  border-color: rgba(34, 197, 94, 0.4);\n  background: rgba(34, 197, 94, 0.08);\n}\n.bonus-pill {\n  background: #333;\n  color: #ef4444;\n  padding: 4px 10px;\n  border-radius: 12px;\n  font-size: 12px;\n}\n.bonus-pill.negative {\n  color: #22c55e;\n}\n.save-config-section {\n  display: flex;\n  gap: 8px;\n  margin-top: 20px;\n}\n.config-name-input {\n  flex: 1;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 8px;\n  color: white;\n  padding: 10px 14px;\n  font-size: 14px;\n}\n.save-config-btn {\n  background: #22c55e;\n  border: none;\n  border-radius: 8px;\n  color: white;\n  width: 44px;\n  height: 44px;\n  cursor: pointer;\n  font-size: 18px;\n}\n.save-config-btn:disabled {\n  background: #333;\n  cursor: not-allowed;\n}\n.bonus-panel {\n  flex: 1;\n  background: #1e1e1e;\n  border-right: 1px solid #333;\n}\n.bonus-section {\n  margin-bottom: 20px;\n}\n.section-header-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 10px;\n}\n.section-header-row h4 {\n  margin: 0;\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.skill-filter-input {\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  padding: 4px 8px;\n  font-size: 12px;\n  width: 100px;\n}\n.skill-filter-input:focus {\n  outline: none;\n  border-color: #22c55e;\n}\n.bonus-section h4 {\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px 0;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.bonus-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.bonus-grid.scrollable {\n  overflow: visible;\n  padding-right: 0;\n}\n.bonus-chip {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: 6px;\n  background: #2a2a2a;\n  border: 2px solid #444;\n  border-radius: 6px;\n  padding: 5px 10px;\n  cursor: pointer;\n  transition: all 0.2s;\n  min-width: 0;\n}\n.bonus-chip:hover {\n  border-color: #666;\n  background: #333;\n}\n.bonus-chip.selected {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.15);\n}\n.bonus-chip.stat.selected {\n  border-color: #a855f7;\n  background: rgba(168, 85, 247, 0.15);\n}\n.bonus-chip.skill.selected {\n  border-color: #f59e0b;\n  background: rgba(245, 158, 11, 0.15);\n}\n.bonus-chip.talent.selected {\n  border-color: #34d399;\n  background: rgba(52, 211, 153, 0.15);\n}\n.chip-name {\n  color: #ccc;\n  font-size: 11px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 120px;\n}\n.chip-value {\n  color: #ef4444;\n  font-size: 13px;\n  font-weight: bold;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.chip-value.negative {\n  color: #22c55e;\n}\n.chip-context {\n  color: #666;\n  font-size: 9px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 80px;\n}\n.selected-summary {\n  background: #2a2a2a;\n  border-radius: 8px;\n  padding: 12px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.summary-label {\n  color: #888;\n  font-size: 14px;\n}\n.summary-value {\n  color: #22c55e;\n  font-size: 20px;\n  font-weight: bold;\n}\n.config-panel {\n  flex: 0.8;\n  background: #1a1a1a;\n}\n.toggle-list-btn {\n  background: #333;\n  border: none;\n  color: #888;\n  width: 28px;\n  height: 28px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 10px;\n}\n.saved-configs {\n  margin-bottom: 20px;\n}\n.empty-hint {\n  color: #666;\n  font-size: 12px;\n  font-style: italic;\n}\n.config-item {\n  display: flex;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n.config-btn {\n  flex: 1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 6px;\n  padding: 10px 12px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.config-btn:hover {\n  background: #333;\n  border-color: #22c55e;\n}\n.config-name {\n  color: white;\n  font-size: 13px;\n}\n.config-formula {\n  color: #888;\n  font-size: 12px;\n  font-family: monospace;\n}\n.config-delete {\n  background: #333;\n  border: none;\n  color: #888;\n  width: 32px;\n  height: 32px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 16px;\n}\n.config-delete:hover {\n  background: #ef4444;\n  color: white;\n}\n.history-section {\n  margin-bottom: 20px;\n}\n.history-section h4 {\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px 0;\n}\n.history-list {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.history-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background: #2a2a2a;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 8px 12px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.history-item:hover {\n  background: #333;\n  border-color: #22c55e;\n}\n.history-formula {\n  color: white;\n  font-family: monospace;\n  font-size: 13px;\n}\n.history-result {\n  color: #22c55e;\n  font-weight: bold;\n  font-size: 13px;\n}\n.history-time {\n  color: #666;\n  font-size: 11px;\n}\n.received-section {\n  margin-top: auto;\n}\n.received-section h4 {\n  color: #888;\n  font-size: 13px;\n  font-weight: 600;\n  margin: 0 0 10px 0;\n}\n.received-list {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.received-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: #2a2a2a;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 8px 12px;\n  animation: slideInRight 0.3s ease-out;\n}\n@keyframes slideInRight {\n  from {\n    transform: translateX(20px);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n.received-item .player-name {\n  color: #22c55e;\n  font-weight: 600;\n  font-size: 12px;\n}\n.received-item .roll-info {\n  color: #888;\n  font-size: 12px;\n}\n.received-item .roll-result {\n  color: white;\n  font-weight: bold;\n  font-size: 14px;\n  margin-left: auto;\n}\n.received-roll-item {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: #2a2a2a;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 6px 10px;\n  font-size: 12px;\n}\n.received-name {\n  font-weight: 600;\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.received-action {\n  color: #9ca3af;\n  flex: 1;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.received-formula {\n  color: #9ca3af;\n  font-family: monospace;\n  flex: 1;\n}\n.received-result {\n  color: white;\n  font-weight: bold;\n  margin-left: auto;\n  flex-shrink: 0;\n}\n.rolls-count {\n  background: #4a5568;\n  color: #e5e7eb;\n  font-size: 10px;\n  font-weight: 700;\n  border-radius: 10px;\n  padding: 1px 6px;\n}\n@media (max-width: 1000px) {\n  .dialog-body {\n    flex-direction: column;\n  }\n  .panel {\n    border-right: none !important;\n    border-bottom: 1px solid #333;\n  }\n  .roll-panel,\n  .bonus-panel,\n  .config-panel {\n    flex: none;\n    max-height: 40vh;\n  }\n}\n/*# sourceMappingURL=dice-roller.component.css.map */\n"] }]
  }], null, { sheet: [{
    type: Input,
    args: [{ required: true }]
  }], close: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DiceRollerComponent, { className: "DiceRollerComponent", filePath: "app/sheet/dice-roller/dice-roller.component.ts", lineNumber: 62 });
})();

// src/app/shared/spell-cast-formulas.ts
function castFactor(castLevel) {
  const cl = Math.max(0, castLevel || 0);
  return 100 / (cl + 100);
}
function castFactorPercent(castLevel) {
  return Math.round(castFactor(castLevel) * 1e3) / 10;
}
function effectiveStatRequirement(baseReq, castLevel) {
  if (baseReq <= 0)
    return 0;
  return Math.round(baseReq * castFactor(castLevel) * 100) / 100;
}
function castLevelForStatRequirement(baseReq, currentStat) {
  if (baseReq <= 0 || currentStat >= baseReq)
    return 0;
  if (currentStat <= 0)
    return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.ceil(100 * baseReq / currentStat - 100));
}
function scaledManaCost(baseMana, castLevel, skalierung) {
  return Math.round(baseMana * castFactor(castLevel) * skalierung * 100) / 100;
}
function scaledBySkalierung(base, skalierung) {
  return Math.round(base * skalierung * 100) / 100;
}
function scaledBySkalierungSoul(base, skalierung) {
  const factor = skalierung > 1 ? 1 + 0.25 * (skalierung - 1) : skalierung;
  return Math.round(base * factor * 100) / 100;
}

// src/app/sheet/spellcast-window/spellcast-window.component.ts
var _forTrack02 = ($index, $item) => $item.id;
var _forTrack12 = ($index, $item) => $item.label;
var _forTrack2 = ($index, $item) => $item.name;
var _forTrack3 = ($index, $item) => $item.entryId ?? $item.spellId;
var _forTrack4 = ($index, $item) => $item.key;
function SpellcastWindowComponent_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r1 = ctx.$implicit;
    \u0275\u0275styleProp("left", rune_r1.x, "%")("top", rune_r1.y, "%")("font-size", rune_r1.size, "px")("opacity", rune_r1.opacity)("color", rune_r1.color)("animation-duration", rune_r1.speed, "s")("animation-delay", rune_r1.delay, "s");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(rune_r1.symbol);
  }
}
function SpellcastWindowComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.sheet.name);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33);
    \u0275\u0275text(1, "Keine Zauber vorhanden.");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 44);
    \u0275\u0275text(1, "Aktiv");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 45);
  }
  if (rf & 2) {
    const spell_r4 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("innerHTML", ctx_r1.enhancedSpellDesc(spell_r4), \u0275\u0275sanitizeHtml);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_9_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 57);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const req_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275classProp("scw-spell-req--unmet", !ctx_r1.spellMeetsStat(req_r5.key, req_r5.value));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", req_r5.label, "\xA0", req_r5.value, " ");
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_9_For_2_Template, 2, 4, "span", 56, _forTrack12);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r4 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.spellStatReqs(spell_r4));
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 49);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u25C6\xA0", spell_r4.costMana);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 50);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u25C6\xA0", spell_r4.costFokus);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 51);
    \u0275\u0275text(1, "Kostenlos");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 53);
    \u0275\u0275text(1, "/Rd");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 54);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u29D7", spell_r4.durationTurns);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_18_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 58);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tag_r6);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 55);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_18_For_2_Template, 2, 1, "span", 58, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(spell_r4.tags);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 39);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Template_div_click_0_listener() {
      const spell_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.requestCast(spell_r4));
    });
    \u0275\u0275element(1, "div", 40);
    \u0275\u0275elementStart(2, "div", 41)(3, "span", 42);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 43);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(7, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_7_Template, 2, 0, "span", 44);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_8_Template, 1, 1, "div", 45);
    \u0275\u0275conditionalCreate(9, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_9_Template, 3, 0, "div", 46);
    \u0275\u0275elementStart(10, "div", 47)(11, "div", 48);
    \u0275\u0275conditionalCreate(12, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_12_Template, 2, 1, "span", 49);
    \u0275\u0275conditionalCreate(13, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_13_Template, 2, 1, "span", 50);
    \u0275\u0275conditionalCreate(14, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_14_Template, 2, 0, "span", 51);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "div", 52);
    \u0275\u0275conditionalCreate(16, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_16_Template, 2, 0, "span", 53);
    \u0275\u0275conditionalCreate(17, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_17_Template, 2, 1, "span", 54);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(18, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Conditional_18_Template, 3, 0, "div", 55);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275styleProp("--sc", ctx_r1.spellColor(spell_r4));
    \u0275\u0275classProp("is-casting", ctx_r1.isActivelyCasting(spell_r4));
    \u0275\u0275property("title", "Klicken zum Wirken: " + spell_r4.name);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(spell_r4.icon || "\u2726");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(spell_r4.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isActivelyCasting(spell_r4) ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(spell_r4.description ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spellStatReqs(spell_r4).length > 0 ? 9 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(spell_r4.costMana ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(spell_r4.costFokus ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!spell_r4.costMana && !spell_r4.costFokus ? 14 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(spell_r4.perTurnMana || spell_r4.perTurnFokus ? 16 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(spell_r4.durationTurns ? 17 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(spell_r4.tags && spell_r4.tags.length > 0 ? 18 : -1);
  }
}
function SpellcastWindowComponent_Conditional_54_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_54_Conditional_1_For_2_Template, 19, 16, "div", 38, _forTrack02);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.availableSpells);
  }
}
function SpellcastWindowComponent_Conditional_54_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SpellcastWindowComponent_Conditional_54_Conditional_0_Template, 2, 0, "div", 33)(1, SpellcastWindowComponent_Conditional_54_Conditional_1_Template, 3, 0, "div", 37);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275conditional(ctx_r1.availableSpells.length === 0 ? 0 : 1);
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33);
    \u0275\u0275text(1, "Keine aktiven F\xE4higkeiten vorhanden.");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33);
    \u0275\u0275text(1, "Keine F\xE4higkeiten gefunden.");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 63);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const at_r10 = ctx;
    \u0275\u0275attribute("data-action", at_r10);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(at_r10);
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 64);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r9 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(skill_r9.description);
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 49);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r9 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("\u25C6\xA0", skill_r9.cost.amount, "", skill_r9.cost.perRound ? "/Rd" : "");
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 65);
    \u0275\u0275element(1, "span", 67);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r9 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("\xA0", skill_r9.cost.amount, "", skill_r9.cost.perRound ? "/Rd" : "");
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 66);
    \u0275\u0275element(1, "span", 68);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r9 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("\xA0", skill_r9.cost.amount, "", skill_r9.cost.perRound ? "/Rd" : "");
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Conditional_0_Template, 2, 2, "span", 49)(1, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Conditional_1_Template, 3, 2, "span", 65)(2, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Conditional_2_Template, 3, 2, "span", 66);
  }
  if (rf & 2) {
    const skill_r9 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275conditional(skill_r9.cost.type === "mana" ? 0 : skill_r9.cost.type === "energy" ? 1 : 2);
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 51);
    \u0275\u0275text(1, "Kostenlos");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 52)(1, "span", 58);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const skill_r9 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(skill_r9.class);
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 62);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Template_div_click_0_listener() {
      const skill_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.toggleActiveSkill(skill_r9));
    });
    \u0275\u0275element(1, "div", 40);
    \u0275\u0275elementStart(2, "div", 41)(3, "span", 42);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 43);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(7, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_7_Template, 2, 2, "span", 63);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_8_Template, 2, 1, "div", 64);
    \u0275\u0275elementStart(9, "div", 47)(10, "div", 48);
    \u0275\u0275conditionalCreate(11, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_11_Template, 3, 1)(12, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_12_Template, 2, 0, "span", 51);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(13, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Conditional_13_Template, 3, 1, "div", 52);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_17_0;
    const skill_r9 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("is-casting", ctx_r1.isSkillActive(skill_r9));
    \u0275\u0275property("title", skill_r9.description || skill_r9.name);
    \u0275\u0275attribute("data-action", ctx_r1.effectiveActionType(skill_r9) || "Aktion");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(skill_r9.name.charAt(0).toUpperCase());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(skill_r9.name);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_17_0 = ctx_r1.effectiveActionType(skill_r9)) ? 7 : -1, tmp_17_0);
    \u0275\u0275advance();
    \u0275\u0275conditional(skill_r9.description ? 8 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(skill_r9.cost ? 11 : 12);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(skill_r9.class ? 13 : -1);
  }
}
function SpellcastWindowComponent_Conditional_55_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_55_Conditional_4_For_2_Template, 14, 10, "div", 61, _forTrack2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredAvailableSkills);
  }
}
function SpellcastWindowComponent_Conditional_55_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59)(1, "input", 60);
    \u0275\u0275twoWayListener("ngModelChange", function SpellcastWindowComponent_Conditional_55_Template_input_ngModelChange_1_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.skillSearchText, $event) || (ctx_r1.skillSearchText = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(2, SpellcastWindowComponent_Conditional_55_Conditional_2_Template, 2, 0, "div", 33)(3, SpellcastWindowComponent_Conditional_55_Conditional_3_Template, 2, 0, "div", 33)(4, SpellcastWindowComponent_Conditional_55_Conditional_4_Template, 3, 0, "div", 37);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.skillSearchText);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.availableSkills.length === 0 ? 2 : ctx_r1.filteredAvailableSkills.length === 0 ? 3 : 4);
  }
}
function SpellcastWindowComponent_Conditional_69_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33);
    \u0275\u0275text(1, "Nichts aktiv.");
    \u0275\u0275element(2, "br");
    \u0275\u0275elementStart(3, "span", 69);
    \u0275\u0275text(4, "Klicke einen Zauber oder eine F\xE4higkeit an.");
    \u0275\u0275elementEnd()();
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 77);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const entry_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2726 \xD7", entry_r12.skalierung);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 82);
  }
  if (rf & 2) {
    const spell_r13 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("innerHTML", ctx_r1.enhancedSpellDesc(spell_r13), \u0275\u0275sanitizeHtml);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 83);
    \u0275\u0275element(1, "span", 67);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Einmalig: ", ctx);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 84);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 86)(1, "span", 87);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 88);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_For_2_Template_button_click_3_listener() {
      const ctx_r14 = \u0275\u0275restoreView(_r14);
      const counter_r16 = ctx_r14.$implicit;
      const \u0275$index_308_r17 = ctx_r14.$index;
      const entry_r12 = \u0275\u0275nextContext(3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adjustCounter(entry_r12.spellId, \u0275$index_308_r17, counter_r16.current - 1));
    });
    \u0275\u0275text(4, "\u2212");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 89);
    \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_For_2_Template_input_ngModelChange_5_listener($event) {
      const \u0275$index_308_r17 = \u0275\u0275restoreView(_r14).$index;
      const entry_r12 = \u0275\u0275nextContext(3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adjustCounter(entry_r12.spellId, \u0275$index_308_r17, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 88);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_For_2_Template_button_click_6_listener() {
      const ctx_r17 = \u0275\u0275restoreView(_r14);
      const counter_r16 = ctx_r17.$implicit;
      const \u0275$index_308_r17 = ctx_r17.$index;
      const entry_r12 = \u0275\u0275nextContext(3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adjustCounter(entry_r12.spellId, \u0275$index_308_r17, counter_r16.current + 1));
    });
    \u0275\u0275text(7, "+");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 90);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 91);
    \u0275\u0275element(11, "div", 92);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const counter_r16 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(counter_r16.name);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", counter_r16.current);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("/ ", counter_r16.max);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", counter_r16.max > counter_r16.min ? (counter_r16.current - counter_r16.min) / (counter_r16.max - counter_r16.min) * 100 : 0, "%")("background-color", counter_r16.color);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 85);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_For_2_Template, 12, 7, "div", 86, _forTrack02);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r13 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(spell_r13.counters);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_0_Template, 1, 1, "div", 82);
    \u0275\u0275conditionalCreate(1, SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_1_Template, 3, 1, "div", 83);
    \u0275\u0275conditionalCreate(2, SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_2_Template, 2, 1, "div", 84);
    \u0275\u0275conditionalCreate(3, SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Conditional_3_Template, 3, 0, "div", 85);
  }
  if (rf & 2) {
    let tmp_14_0;
    let tmp_15_0;
    const spell_r13 = ctx;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275conditional(spell_r13.description ? 0 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_14_0 = ctx_r1.costLabel(spell_r13)) ? 1 : -1, tmp_14_0);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_15_0 = ctx_r1.perTurnLabel(spell_r13)) ? 2 : -1, tmp_15_0);
    \u0275\u0275advance();
    \u0275\u0275conditional(spell_r13.counters && spell_r13.counters.length > 0 ? 3 : -1);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_13_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 100);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 79)(1, "div", 93)(2, "span", 94);
    \u0275\u0275text(3, "Wirken...");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 95)(5, "input", 96);
    \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_13_Template_input_ngModelChange_5_listener($event) {
      \u0275\u0275restoreView(_r19);
      const entry_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.setRemainingCast(entry_r12, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 97);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(8, "div", 98);
    \u0275\u0275element(9, "div", 99);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, SpellcastWindowComponent_Conditional_70_For_2_Conditional_13_Conditional_10_Template, 2, 1, "div", 100);
    \u0275\u0275elementStart(11, "button", 101);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_13_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r19);
      const entry_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.rollCast(entry_r12));
    });
    \u0275\u0275element(12, "span", 102);
    \u0275\u0275text(13, " W20 W\xFCrfeln");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_15_0;
    const entry_r12 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275property("ngModel", entry_r12.remainingCast);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("/ ", entry_r12.castLevel);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r1.castProgressPercent(entry_r12), "%");
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_15_0 = ctx_r1.reductionLabel(entry_r12.castLevel)) ? 10 : -1, tmp_15_0);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Conditional_4_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 106);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const dur_r21 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("/ ", dur_r21);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Conditional_4_Conditional_0_Template, 2, 1, "span", 106);
  }
  if (rf & 2) {
    \u0275\u0275conditional(ctx > 0 ? 0 : -1);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 80)(1, "span", 103);
    \u0275\u0275text(2, "Runde");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 104);
    \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r20);
      const entry_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.setRoundsActive(entry_r12, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Conditional_4_Template, 1, 1);
    \u0275\u0275elementStart(5, "button", 105);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r20);
      const entry_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.advanceRound(entry_r12));
    });
    \u0275\u0275text(6, "+");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_13_0;
    const entry_r12 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", entry_r12.roundsActive ?? 0);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_13_0 = ctx_r1.entryScaledHaltbarkeit(entry_r12)) ? 4 : -1, tmp_13_0);
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r22 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 81)(1, "span", 107);
    \u0275\u0275text(2, "\u2713 Beendet");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 108);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_70_For_2_Conditional_15_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r22);
      const entry_r12 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.stopCasting(entry_r12));
    });
    \u0275\u0275text(4, "Entlassen");
    \u0275\u0275elementEnd()();
  }
}
function SpellcastWindowComponent_Conditional_70_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 71);
    \u0275\u0275element(1, "div", 72);
    \u0275\u0275elementStart(2, "div", 73)(3, "span", 74);
    \u0275\u0275text(4, "Zauber");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 75);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 76);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(9, SpellcastWindowComponent_Conditional_70_For_2_Conditional_9_Template, 2, 1, "span", 77);
    \u0275\u0275elementStart(10, "button", 78);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_70_For_2_Template_button_click_10_listener() {
      const entry_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.stopCasting(entry_r12));
    });
    \u0275\u0275text(11, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(12, SpellcastWindowComponent_Conditional_70_For_2_Conditional_12_Template, 4, 4);
    \u0275\u0275conditionalCreate(13, SpellcastWindowComponent_Conditional_70_For_2_Conditional_13_Template, 14, 5, "div", 79);
    \u0275\u0275conditionalCreate(14, SpellcastWindowComponent_Conditional_70_For_2_Conditional_14_Template, 7, 2, "div", 80);
    \u0275\u0275conditionalCreate(15, SpellcastWindowComponent_Conditional_70_For_2_Conditional_15_Template, 5, 0, "div", 81);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_12_0;
    let tmp_15_0;
    const entry_r12 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("--sc", ctx_r1.getSpell(entry_r12.spellId) ? ctx_r1.spellColor(ctx_r1.getSpell(entry_r12.spellId)) : "#8b5cf6");
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(((tmp_12_0 = ctx_r1.getSpell(entry_r12.spellId)) == null ? null : tmp_12_0.icon) || "\u2726");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r12.spellName);
    \u0275\u0275advance();
    \u0275\u0275conditional(entry_r12.skalierung && entry_r12.skalierung > 1 ? 9 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275conditional((tmp_15_0 = ctx_r1.getSpell(entry_r12.spellId)) ? 12 : -1, tmp_15_0);
    \u0275\u0275advance();
    \u0275\u0275conditional(entry_r12.remainingCast > 0 ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(entry_r12.remainingCast <= 0 && !ctx_r1.isSpellFinished(entry_r12) ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isSpellFinished(entry_r12) ? 15 : -1);
  }
}
function SpellcastWindowComponent_Conditional_70_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 34);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_70_For_2_Template, 16, 9, "div", 70, _forTrack3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.castingSpells);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 110);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const at_r24 = ctx;
    \u0275\u0275attribute("data-action", at_r24);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(at_r24);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 110);
    \u0275\u0275text(1, "F\xE4higkeit");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 112);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r25 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(skill_r25.description);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_12_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 117);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_71_For_2_Conditional_12_Conditional_3_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r26);
      const skill_r25 = \u0275\u0275nextContext(2).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.paySkillRoundCost(skill_r25));
    });
    \u0275\u0275element(1, "span", 67);
    \u0275\u0275text(2, " Zahlen");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 113)(1, "span", 83);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, SpellcastWindowComponent_Conditional_71_For_2_Conditional_12_Conditional_3_Template, 3, 0, "button", 116);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cost_r27 = ctx;
    const skill_r25 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r1.skillCostLabel(skill_r25), "", cost_r27.perRound ? "/Runde" : "");
    \u0275\u0275advance();
    \u0275\u0275conditional(cost_r27.perRound ? 3 : -1);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_13_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 119);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mod_r28 = ctx.$implicit;
    \u0275\u0275classProp("positive", mod_r28.amount > 0)("negative", mod_r28.amount < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3(" ", mod_r28.stat.slice(0, 3).toUpperCase(), " ", mod_r28.amount > 0 ? "+" : "", "", mod_r28.amount, " ");
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 114);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_71_For_2_Conditional_13_For_2_Template, 2, 7, "span", 118, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r25 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(skill_r25.statModifiers);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r29 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 115)(1, "button", 108);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_71_For_2_Conditional_14_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r29);
      const skill_r25 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleActiveSkill(skill_r25));
    });
    \u0275\u0275text(2, "Entlassen");
    \u0275\u0275elementEnd()();
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r30 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 86)(1, "span", 87);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 88);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_For_2_Template_button_click_3_listener() {
      const ctx_r30 = \u0275\u0275restoreView(_r30);
      const counter_r32 = ctx_r30.$implicit;
      const \u0275$index_441_r33 = ctx_r30.$index;
      const skill_r25 = \u0275\u0275nextContext(2).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adjustSkillCounter(skill_r25.name, \u0275$index_441_r33, counter_r32.current - 1));
    });
    \u0275\u0275text(4, "\u2212");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 89);
    \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_For_2_Template_input_ngModelChange_5_listener($event) {
      const \u0275$index_441_r33 = \u0275\u0275restoreView(_r30).$index;
      const skill_r25 = \u0275\u0275nextContext(2).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adjustSkillCounter(skill_r25.name, \u0275$index_441_r33, $event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 88);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_For_2_Template_button_click_6_listener() {
      const ctx_r33 = \u0275\u0275restoreView(_r30);
      const counter_r32 = ctx_r33.$implicit;
      const \u0275$index_441_r33 = ctx_r33.$index;
      const skill_r25 = \u0275\u0275nextContext(2).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.adjustSkillCounter(skill_r25.name, \u0275$index_441_r33, counter_r32.current + 1));
    });
    \u0275\u0275text(7, "+");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 90);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 91);
    \u0275\u0275element(11, "div", 92);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const counter_r32 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(counter_r32.name);
    \u0275\u0275advance(3);
    \u0275\u0275property("ngModel", counter_r32.current);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("/ ", counter_r32.max);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", counter_r32.max > counter_r32.min ? (counter_r32.current - counter_r32.min) / (counter_r32.max - counter_r32.min) * 100 : 0, "%")("background-color", counter_r32.color);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 85);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_For_2_Template, 12, 7, "div", 86, _forTrack02);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r25 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(skill_r25.counters);
  }
}
function SpellcastWindowComponent_Conditional_71_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 109);
    \u0275\u0275element(1, "div", 72);
    \u0275\u0275elementStart(2, "div", 73);
    \u0275\u0275conditionalCreate(3, SpellcastWindowComponent_Conditional_71_For_2_Conditional_3_Template, 2, 2, "span", 110)(4, SpellcastWindowComponent_Conditional_71_For_2_Conditional_4_Template, 2, 0, "span", 110);
    \u0275\u0275elementStart(5, "span", 75);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 76);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 111);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_71_For_2_Template_button_click_9_listener() {
      const skill_r25 = \u0275\u0275restoreView(_r23).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.toggleActiveSkill(skill_r25));
    });
    \u0275\u0275text(10, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(11, SpellcastWindowComponent_Conditional_71_For_2_Conditional_11_Template, 2, 1, "div", 112);
    \u0275\u0275conditionalCreate(12, SpellcastWindowComponent_Conditional_71_For_2_Conditional_12_Template, 4, 3, "div", 113);
    \u0275\u0275conditionalCreate(13, SpellcastWindowComponent_Conditional_71_For_2_Conditional_13_Template, 3, 0, "div", 114);
    \u0275\u0275conditionalCreate(14, SpellcastWindowComponent_Conditional_71_For_2_Conditional_14_Template, 3, 0, "div", 115);
    \u0275\u0275conditionalCreate(15, SpellcastWindowComponent_Conditional_71_For_2_Conditional_15_Template, 3, 0, "div", 85);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_12_0;
    let tmp_16_0;
    let tmp_18_0;
    const skill_r25 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275attribute("data-action", ctx_r1.effectiveActionType(skill_r25) || "Aktion");
    \u0275\u0275advance(3);
    \u0275\u0275conditional((tmp_12_0 = ctx_r1.effectiveActionType(skill_r25)) ? 3 : 4, tmp_12_0);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(skill_r25.name.charAt(0).toUpperCase());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(skill_r25.name);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(skill_r25.description ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional((tmp_16_0 = ctx_r1.effectiveCost(skill_r25)) ? 12 : -1, tmp_16_0);
    \u0275\u0275advance();
    \u0275\u0275conditional(skill_r25.statModifiers && skill_r25.statModifiers.length > 0 ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!((tmp_18_0 = ctx_r1.effectiveCost(skill_r25)) == null ? null : tmp_18_0.perRound) ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(skill_r25.counters && skill_r25.counters.length > 0 ? 15 : -1);
  }
}
function SpellcastWindowComponent_Conditional_71_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 34);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_71_For_2_Template, 16, 9, "div", 109, _forTrack2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.activeSkillsList);
  }
}
function SpellcastWindowComponent_Conditional_72_For_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 168);
  }
  if (rf & 2) {
    const rune_r36 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275styleProp("filter", "drop-shadow(0 0 8px " + rune_r36.color + ") drop-shadow(0 0 20px " + rune_r36.color + "66)");
    \u0275\u0275property("src", rune_r36.drawing, \u0275\u0275sanitizeUrl)("alt", rune_r36.symbol);
  }
}
function SpellcastWindowComponent_Conditional_72_For_3_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 169);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r36 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275styleProp("color", rune_r36.color)("text-shadow", "0 0 12px " + rune_r36.color + ", 0 0 30px " + rune_r36.color + "88");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", rune_r36.symbol, " ");
  }
}
function SpellcastWindowComponent_Conditional_72_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 165);
    \u0275\u0275conditionalCreate(1, SpellcastWindowComponent_Conditional_72_For_3_Conditional_1_Template, 1, 4, "img", 166)(2, SpellcastWindowComponent_Conditional_72_For_3_Conditional_2_Template, 2, 5, "span", 167);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r36 = ctx.$implicit;
    \u0275\u0275styleProp("left", rune_r36.x, "%")("top", rune_r36.y, "%")("width", rune_r36.size, "px")("height", rune_r36.size, "px")("animation-duration", rune_r36.speed, "s")("animation-delay", rune_r36.delay, "s")("opacity", rune_r36.opacity);
    \u0275\u0275advance();
    \u0275\u0275conditional(rune_r36.drawing ? 1 : 2);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 130);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("innerHTML", ctx_r1.enhancedSpellDesc(ctx_r1.pendingCastSpell), \u0275\u0275sanitizeHtml);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_16_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 172);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span", 173);
    \u0275\u0275text(3, "\u2192");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 174);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const req_r37 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(req_r37.value);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.castLevelReducedReq(req_r37.value));
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_16_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const req_r37 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275textInterpolate1(" ", req_r37.value, " ");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_16_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 171);
    \u0275\u0275text(1);
    \u0275\u0275conditionalCreate(2, SpellcastWindowComponent_Conditional_72_Conditional_16_For_2_Conditional_2_Template, 6, 2)(3, SpellcastWindowComponent_Conditional_72_Conditional_16_For_2_Conditional_3_Template, 1, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const req_r37 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("cast-req--met", ctx_r1.castLevelMeetsReq(req_r37.key, req_r37.value))("cast-req--unmet", !ctx_r1.castLevelMeetsReq(req_r37.key, req_r37.value));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", req_r37.label, "\xA0 ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castLevelReducedReq(req_r37.value) < req_r37.value ? 2 : 3);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 131);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_72_Conditional_16_For_2_Template, 4, 6, "span", 170, _forTrack12);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.spellStatReqs(ctx_r1.pendingCastSpell));
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 135);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_25_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 176)(1, "span", 177);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const marker_r38 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275styleProp("left", ctx_r1.castMarkerLeftPct(marker_r38.level), "%");
    \u0275\u0275property("title", marker_r38.label + " " + marker_r38.level + " CL ben\xF6tigt");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(marker_r38.label);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 139);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_72_Conditional_25_For_2_Template, 3, 4, "div", 175, _forTrack4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.castLevelMarkers);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_35_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 178);
    \u0275\u0275text(1, "\u2605");
    \u0275\u0275elementEnd();
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 144);
    \u0275\u0275repeaterCreate(1, SpellcastWindowComponent_Conditional_72_Conditional_35_For_2_Template, 2, 0, "span", 178, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.skalerungStars);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_36_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 179);
    \u0275\u0275element(1, "span", 180);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Eff. ", \u0275\u0275pipeBind2(3, 1, ctx_r1.castPreview.scaledEffektivitaet, "1.0-1"));
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_36_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 179);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u29D7 ", \u0275\u0275pipeBind2(2, 1, ctx_r1.castPreview.scaledHaltbarkeit, "1.0-1"), " Rd");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 145);
    \u0275\u0275conditionalCreate(1, SpellcastWindowComponent_Conditional_72_Conditional_36_Conditional_1_Template, 4, 4, "span", 179);
    \u0275\u0275conditionalCreate(2, SpellcastWindowComponent_Conditional_72_Conditional_36_Conditional_2_Template, 3, 4, "span", 179);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.scaledEffektivitaet > 0 ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.scaledHaltbarkeit > 0 ? 2 : -1);
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 181);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("width", ctx_r1.castPreview.manaCostPct, "%")("left", ctx_r1.castPreview.manaAfterPct, "%");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 155);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u2192 ", \u0275\u0275pipeBind2(2, 1, ctx_r1.castPreview.manaAfter, "1.0-1"));
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_52_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 157);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u2212\u25C6\xA0", \u0275\u0275pipeBind2(2, 1, ctx_r1.castPreview.manaCost, "1.0-1"), " ");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_58_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 182);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("width", ctx_r1.castPreview.fokusCostPct, "%")("left", ctx_r1.castPreview.fokusAfterPct, "%");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_62_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 155);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u2192 ", \u0275\u0275pipeBind2(2, 1, ctx_r1.castPreview.fokusAfter, "1.0-1"));
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_65_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 160);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u2212\u25C6\xA0", \u0275\u0275pipeBind2(2, 1, ctx_r1.castPreview.fokusCost, "1.0-1"), " ");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 183);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.pendingCastSpell.perTurnMana, "/Rd \u25C6");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 184);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.pendingCastSpell.perTurnFokus, "/Rd \u25C6");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 185);
    \u0275\u0275text(1);
    \u0275\u0275pipe(2, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u29D7\xA0", \u0275\u0275pipeBind2(2, 1, ctx_r1.castPreview.scaledHaltbarkeit, "1.0-1"), "Rd");
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 186);
    \u0275\u0275element(1, "span", 180);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "number");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\xA0", \u0275\u0275pipeBind2(3, 1, ctx_r1.castPreview.scaledEffektivitaet, "1.0-1"));
  }
}
function SpellcastWindowComponent_Conditional_72_Conditional_66_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 161);
    \u0275\u0275conditionalCreate(1, SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_1_Template, 2, 1, "span", 183);
    \u0275\u0275conditionalCreate(2, SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_2_Template, 2, 1, "span", 184);
    \u0275\u0275conditionalCreate(3, SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_3_Template, 3, 4, "span", 185);
    \u0275\u0275conditionalCreate(4, SpellcastWindowComponent_Conditional_72_Conditional_66_Conditional_4_Template, 4, 4, "span", 186);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.pendingCastSpell.perTurnMana ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.pendingCastSpell.perTurnFokus ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.scaledHaltbarkeit > 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.scaledEffektivitaet > 0 ? 4 : -1);
  }
}
function SpellcastWindowComponent_Conditional_72_Template(rf, ctx) {
  if (rf & 1) {
    const _r35 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 120);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_72_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelCast());
    });
    \u0275\u0275elementStart(1, "div", 121);
    \u0275\u0275repeaterCreate(2, SpellcastWindowComponent_Conditional_72_For_3_Template, 3, 15, "div", 122, _forTrack02);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 123);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_72_Template_div_click_4_listener($event) {
      \u0275\u0275restoreView(_r35);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(5, "div", 124)(6, "span", 125);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 126)(9, "span", 127);
    \u0275\u0275text(10, "ZAUBER");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 128);
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "button", 129);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_72_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelCast());
    });
    \u0275\u0275text(14, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(15, SpellcastWindowComponent_Conditional_72_Conditional_15_Template, 1, 1, "div", 130);
    \u0275\u0275conditionalCreate(16, SpellcastWindowComponent_Conditional_72_Conditional_16_Template, 3, 0, "div", 131);
    \u0275\u0275elementStart(17, "div", 132)(18, "div", 133)(19, "div", 134);
    \u0275\u0275text(20, " Cast-Level ");
    \u0275\u0275conditionalCreate(21, SpellcastWindowComponent_Conditional_72_Conditional_21_Template, 2, 1, "span", 135);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "div", 136)(23, "input", 137);
    \u0275\u0275listener("input", function SpellcastWindowComponent_Conditional_72_Template_input_input_23_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onCastLevelChange($event.target.value));
    })("ngModelChange", function SpellcastWindowComponent_Conditional_72_Template_input_ngModelChange_23_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onCastLevelChange($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "input", 138);
    \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Conditional_72_Template_input_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onCastLevelChange($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(25, SpellcastWindowComponent_Conditional_72_Conditional_25_Template, 3, 0, "div", 139);
    \u0275\u0275elementStart(26, "div", 140)(27, "span", 141);
    \u0275\u0275text(28, "Dauer:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "span", 142);
    \u0275\u0275text(30);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 143);
    \u0275\u0275text(32, " Skalierung ");
    \u0275\u0275elementStart(33, "span", 135);
    \u0275\u0275text(34);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(35, SpellcastWindowComponent_Conditional_72_Conditional_35_Template, 3, 0, "span", 144);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(36, SpellcastWindowComponent_Conditional_72_Conditional_36_Template, 3, 2, "div", 145);
    \u0275\u0275elementStart(37, "input", 146);
    \u0275\u0275listener("input", function SpellcastWindowComponent_Conditional_72_Template_input_input_37_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSkalierungChange(+$event.target.value));
    })("ngModelChange", function SpellcastWindowComponent_Conditional_72_Template_input_ngModelChange_37_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSkalierungChange($event));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "input", 147);
    \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Conditional_72_Template_input_ngModelChange_38_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSkalierungChange($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(39, "div", 148)(40, "div", 134);
    \u0275\u0275text(41, "Mana");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "div", 149)(43, "div", 150);
    \u0275\u0275element(44, "div", 151);
    \u0275\u0275conditionalCreate(45, SpellcastWindowComponent_Conditional_72_Conditional_45_Template, 1, 4, "div", 152);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "div", 153)(47, "span", 154);
    \u0275\u0275text(48);
    \u0275\u0275conditionalCreate(49, SpellcastWindowComponent_Conditional_72_Conditional_49_Template, 3, 4, "span", 155);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(50, "span", 156);
    \u0275\u0275text(51);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(52, SpellcastWindowComponent_Conditional_72_Conditional_52_Template, 3, 4, "div", 157);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(53, "div", 134);
    \u0275\u0275text(54, "Fokus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(55, "div", 149)(56, "div", 158);
    \u0275\u0275element(57, "div", 151);
    \u0275\u0275conditionalCreate(58, SpellcastWindowComponent_Conditional_72_Conditional_58_Template, 1, 4, "div", 159);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(59, "div", 153)(60, "span", 154);
    \u0275\u0275text(61);
    \u0275\u0275conditionalCreate(62, SpellcastWindowComponent_Conditional_72_Conditional_62_Template, 3, 4, "span", 155);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(63, "span", 156);
    \u0275\u0275text(64);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(65, SpellcastWindowComponent_Conditional_72_Conditional_65_Template, 3, 4, "div", 160);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(66, SpellcastWindowComponent_Conditional_72_Conditional_66_Template, 5, 4, "div", 161);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(67, "div", 162)(68, "button", 163);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_72_Template_button_click_68_listener() {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelCast());
    });
    \u0275\u0275text(69, "Abbrechen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(70, "button", 164);
    \u0275\u0275listener("click", function SpellcastWindowComponent_Conditional_72_Template_button_click_70_listener() {
      \u0275\u0275restoreView(_r35);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.confirmCast());
    });
    \u0275\u0275element(71, "span", 6);
    \u0275\u0275text(72, " AKTIVIEREN ");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    let tmp_8_0;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("--sc", ctx_r1.spellColor(ctx_r1.pendingCastSpell));
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.portalRunes);
    \u0275\u0275advance(3);
    \u0275\u0275styleProp("--sc", ctx_r1.spellColor(ctx_r1.pendingCastSpell));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.pendingCastSpell.icon || "\u2726");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.pendingCastSpell.name);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r1.pendingCastSpell.description ? 15 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.spellStatReqs(ctx_r1.pendingCastSpell).length > 0 ? 16 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275conditional((tmp_8_0 = ctx_r1.reductionLabel(ctx_r1.pendingCastLevel)) ? 21 : -1, tmp_8_0);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("--sc", ctx_r1.spellColor(ctx_r1.pendingCastSpell))("--pct", ctx_r1.castLevelSliderMax > 0 ? ctx_r1.pendingCastLevel / ctx_r1.castLevelSliderMax * 100 : 0);
    \u0275\u0275property("max", ctx_r1.castLevelSliderMax)("ngModel", ctx_r1.pendingCastLevel);
    \u0275\u0275advance();
    \u0275\u0275property("ngModel", ctx_r1.pendingCastLevel);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castLevelMarkers.length > 0 ? 25 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("~", (ctx_r1.pendingCastLevel / 10).toFixed(1), " Runden");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("\xD7 ", ctx_r1.skalierung.toFixed(1));
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.skalerungStars.length > 0 ? 35 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.scaledEffektivitaet > 0 || ctx_r1.castPreview.scaledHaltbarkeit > 0 ? 36 : -1);
    \u0275\u0275advance();
    \u0275\u0275styleProp("--sc", ctx_r1.spellColor(ctx_r1.pendingCastSpell));
    \u0275\u0275property("ngModel", ctx_r1.skalierung);
    \u0275\u0275advance();
    \u0275\u0275property("ngModel", ctx_r1.skalierung);
    \u0275\u0275advance(6);
    \u0275\u0275styleProp("width", ctx_r1.castPreview.manaAfterPct, "%")("background", "#3b82f6");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.manaCost > 0 ? 45 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", "#60a5fa");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.manaCurrent, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.manaCost > 0 ? 49 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("/", ctx_r1.manaMax);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.manaCost > 0 ? 52 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275styleProp("width", ctx_r1.castPreview.fokusAfterPct, "%")("background", "#7c3aed");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.fokusCost > 0 ? 58 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", "#a78bfa");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.fokusAvailable, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.fokusCost > 0 ? 62 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("/", ctx_r1.fokusMax);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.castPreview.fokusCost > 0 ? 65 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.pendingCastSpell.perTurnMana || ctx_r1.pendingCastSpell.perTurnFokus || ctx_r1.pendingCastSpell.durationTurns || ctx_r1.castPreview.scaledEffektivitaet > 0 ? 66 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275styleProp("--sc", ctx_r1.spellColor(ctx_r1.pendingCastSpell));
    \u0275\u0275property("disabled", !ctx_r1.canCast)("title", !ctx_r1.canCast ? "Fehlende Ressourcen oder Stats" : "");
  }
}
var EMPTY_CAST_PREVIEW = {
  manaCost: 0,
  fokusCost: 0,
  manaAfter: 0,
  fokusAfter: 0,
  manaAfterPct: 0,
  manaCostPct: 0,
  fokusAfterPct: 0,
  fokusCostPct: 0,
  scaledEffektivitaet: 0,
  scaledHaltbarkeit: 0
};
var PORTAL_POSITIONS = [
  { x: 4, y: 8 },
  { x: 86, y: 6 },
  { x: 4, y: 50 },
  { x: 90, y: 52 },
  { x: 12, y: 84 },
  { x: 82, y: 86 },
  { x: 42, y: 3 },
  { x: 52, y: 91 },
  { x: 8, y: 28 },
  { x: 86, y: 30 },
  { x: 18, y: 72 },
  { x: 76, y: 75 },
  { x: 38, y: 5 },
  { x: 60, y: 7 },
  { x: 6, y: 68 },
  { x: 88, y: 70 }
];
var RUNE_SYMBOLS = ["\u16A0", "\u16A2", "\u16A6", "\u16A8", "\u16B1", "\u16B2", "\u16B7", "\u16B9", "\u16BA", "\u16BE", "\u16C1", "\u16C3", "\u16C7", "\u16C8", "\u16C9", "\u16CA", "\u16CF", "\u16D2", "\u16D6", "\u16D7", "\u16DA", "\u16DC", "\u16DE", "\u16DF"];
var SpellcastWindowComponent = class _SpellcastWindowComponent {
  sheet;
  defaultTab = "spells";
  patch = new EventEmitter();
  tabChange = new EventEmitter();
  close = new EventEmitter();
  cdr = inject(ChangeDetectorRef);
  _sanitizer = inject(DomSanitizer);
  _imageService = inject(ImageService);
  _worldSocket = inject(WorldSocketService);
  _trueStats = inject(TrueStatsService);
  Math = Math;
  floatingRunes = [];
  runeIdCounter = 0;
  _portalRunes = [];
  get portalRunes() {
    return this._portalRunes;
  }
  // ── Left panel tab ────────────────────────────────────────────────────────
  leftTab = "spells";
  skillSearchText = "";
  // ── Pending cast state ────────────────────────────────────────────────────
  pendingCastSpell = null;
  pendingCastLevel = 0;
  skalierung = 1;
  castPreview = __spreadValues({}, EMPTY_CAST_PREVIEW);
  // ── Cast-bonus (saved on sheet) ───────────────────────────────────────────
  get castBonus() {
    return this.sheet.spellCastBonus ?? 0;
  }
  setCastBonus(v) {
    this.sheet.spellCastBonus = v;
    this.patch.emit({ path: "spellCastBonus", value: v });
    this.cdr.markForCheck();
  }
  // ── Data accessors ────────────────────────────────────────────────────────
  get availableSpells() {
    return this.sheet.spells || [];
  }
  get castingSpells() {
    return this.sheet.castingSpells || [];
  }
  get manaCurrent() {
    return this.sheet.statuses?.find((s) => s.formulaType === FormulaType.MANA)?.statusCurrent ?? 0;
  }
  get manaMax() {
    const s = this.sheet.statuses?.find((s2) => s2.formulaType === FormulaType.MANA);
    if (!s)
      return 100;
    return this._trueStats.calculateResourceMax(this.sheet, FormulaType.MANA);
  }
  get manaPercent() {
    const max = this.manaMax;
    return max ? Math.min(100, Math.round(this.manaCurrent / max * 100)) : 0;
  }
  get lebenCurrent() {
    return this.sheet.statuses?.find((s) => s.formulaType === FormulaType.LIFE)?.statusCurrent ?? 0;
  }
  get lebenMax() {
    const s = this.sheet.statuses?.find((s2) => s2.formulaType === FormulaType.LIFE);
    if (!s)
      return 100;
    return this._trueStats.calculateResourceMax(this.sheet, FormulaType.LIFE);
  }
  get lebenPercent() {
    const max = this.lebenMax;
    return max ? Math.min(100, Math.round(this.lebenCurrent / max * 100)) : 0;
  }
  get ausdauerCurrent() {
    return this.sheet.statuses?.find((s) => s.formulaType === FormulaType.ENERGY)?.statusCurrent ?? 0;
  }
  get ausdauerMax() {
    const s = this.sheet.statuses?.find((s2) => s2.formulaType === FormulaType.ENERGY);
    if (!s)
      return 100;
    return this._trueStats.calculateResourceMax(this.sheet, FormulaType.ENERGY);
  }
  get ausdauerPercent() {
    const max = this.ausdauerMax;
    return max ? Math.min(100, Math.round(this.ausdauerCurrent / max * 100)) : 0;
  }
  get fokusMax() {
    return this._trueStats.calculateFokusMax(this.sheet);
  }
  get fokusUsed() {
    return this.castingSpells.reduce((sum, entry) => {
      const spell = this.availableSpells.find((s) => s.id === entry.spellId);
      if (!spell)
        return sum;
      return sum + this.computeFokusCost(spell, entry.castLevel || 0);
    }, 0);
  }
  get fokusPercent() {
    const max = this.fokusMax;
    return max ? Math.min(100, Math.round(this.fokusUsed / max * 100)) : 0;
  }
  isActivelyCasting(spell) {
    return this.castingSpells.some((e) => e.spellId === spell.id);
  }
  getActiveCast(spell) {
    return this.castingSpells.find((e) => e.spellId === spell.id);
  }
  getSpell(spellId) {
    return this.availableSpells.find((s) => s.id === spellId);
  }
  spellColor(spell) {
    return spell.strokeColor || "#8b5cf6";
  }
  costLabel(spell) {
    const parts = [];
    if (spell.costMana)
      parts.push(`${spell.costMana}M`);
    if (spell.costFokus)
      parts.push(`${spell.costFokus}F`);
    return parts.join(" ");
  }
  perTurnLabel(spell) {
    const parts = [];
    if (spell.perTurnMana)
      parts.push(`${spell.perTurnMana}M`);
    if (spell.perTurnFokus)
      parts.push(`${spell.perTurnFokus}F`);
    return parts.length ? parts.join(" ") + "/Rd" : "";
  }
  reductionLabel(castLevel) {
    const pct = castFactorPercent(castLevel);
    return pct < 100 ? `\xD7${pct}% Mana & Anf.` : "";
  }
  // ── Spell stat helpers ────────────────────────────────────────────────────
  spellStatReqs(spell) {
    const req = spell.statRequirements;
    if (!req)
      return [];
    const map2 = [
      { key: "strength", label: "STR" },
      { key: "dexterity", label: "GES" },
      { key: "speed", label: "SPD" },
      { key: "intelligence", label: "INT" },
      { key: "constitution", label: "KON" },
      { key: "chill", label: "WIL" }
    ];
    return map2.filter((m) => req[m.key] > 0).map((m) => ({ key: m.key, label: m.label, value: req[m.key] }));
  }
  spellMeetsStat(key, value) {
    const stat = this.sheet[key];
    const current = stat?.current ?? 0;
    return current >= value;
  }
  castLevelMeetsReq(key, value) {
    const stat = this.sheet[key];
    const current = stat?.current ?? 0;
    return current >= this.castLevelReducedReq(value);
  }
  /** Effective stat requirement: base × 100/(Cast+100) */
  castLevelReducedReq(value) {
    return effectiveStatRequirement(value, this.pendingCastLevel);
  }
  castLevelForReq(key, value) {
    const stat = this.sheet[key];
    const current = stat?.current ?? 0;
    const needed = castLevelForStatRequirement(value, current);
    return Number.isFinite(needed) ? needed : 9999;
  }
  /** Slider scale for cast-level markers (supports CL > 100) */
  get castLevelSliderMax() {
    const markerMax = this.castLevelMarkers.reduce((m, x) => Math.max(m, x.level), 0);
    return Math.max(100, this.pendingCastLevel, markerMax, 1);
  }
  castMarkerLeftPct(level) {
    return Math.min(98, level / this.castLevelSliderMax * 98);
  }
  get castLevelMarkers() {
    if (!this.pendingCastSpell?.statRequirements)
      return [];
    return this.spellStatReqs(this.pendingCastSpell).filter((req) => !this.spellMeetsStat(req.key, req.value)).map((req) => ({ key: req.key, label: req.label, level: this.castLevelForReq(req.key, req.value) })).filter((m) => Number.isFinite(m.level) && m.level <= 9999);
  }
  // ── Resource impact computations ──────────────────────────────────────────
  get fokusAvailable() {
    return Math.max(0, this.fokusMax - this.fokusUsed);
  }
  get fokusAvailPercent() {
    return this.fokusMax > 0 ? Math.min(100, Math.round(this.fokusAvailable / this.fokusMax * 100)) : 0;
  }
  learnedRunes() {
    return (this.sheet.runes || []).filter((r) => r !== null);
  }
  /** Resolve stored or graph-derived base values for a spell */
  spellBaseValues(spell) {
    let mana = spell.costMana ?? 0;
    let fokus = spell.perTurnFokus ?? spell.costFokus ?? 0;
    let effektivitaet = 0;
    if (spell.graph) {
      const est = calculateSpellCost(spell.graph, this.learnedRunes());
      if (mana <= 0)
        mana = est.mana;
      if (fokus <= 0)
        fokus = est.fokus;
      effektivitaet = est.effektivitaet;
    }
    return {
      mana,
      fokus,
      effektivitaet,
      haltbarkeit: spell.durationTurns ?? 0
    };
  }
  /** Mana: base × 100/(Cast+100) × skalierung */
  computeManaCost(spell, castLevel, skalierung) {
    const base = this.spellBaseValues(spell).mana;
    return scaledManaCost(base, castLevel, skalierung);
  }
  /** Fokus commitment (unchanged by cast/skalierung per rules) */
  computeFokusCost(spell, _castLevel) {
    const base = this.spellBaseValues(spell).fokus;
    return Math.round(base * 100) / 100;
  }
  /** A "soul spell" contains a Beschwörungsrune — its effectivity scales at the nerfed ¼ rate. */
  isSoulSpell(spell) {
    return (spell.graph?.nodes ?? []).some((n) => n.runeId === SUMMON_RUNE_ID);
  }
  computeScaledEffektivitaet(spell, skalierung) {
    const baseEff = this.spellBaseValues(spell).effektivitaet;
    return this.isSoulSpell(spell) ? scaledBySkalierungSoul(baseEff, skalierung) : scaledBySkalierung(baseEff, skalierung);
  }
  computeScaledHaltbarkeit(spell, skalierung) {
    return scaledBySkalierung(this.spellBaseValues(spell).haltbarkeit, skalierung);
  }
  recalcCastPreview() {
    const spell = this.pendingCastSpell;
    if (!spell) {
      this.castPreview = __spreadValues({}, EMPTY_CAST_PREVIEW);
      return;
    }
    const manaCost = this.computeManaCost(spell, this.pendingCastLevel, this.skalierung);
    const fokusCost = this.computeFokusCost(spell, this.pendingCastLevel);
    const manaAfter = this.manaCurrent - manaCost;
    const fokusAfter = this.fokusAvailable - fokusCost;
    this.castPreview = {
      manaCost,
      fokusCost,
      manaAfter,
      fokusAfter,
      manaAfterPct: this.manaMax > 0 ? Math.round(Math.max(0, manaAfter) / this.manaMax * 100) : 0,
      manaCostPct: this.manaMax > 0 ? Math.min(100, Math.round(manaCost / this.manaMax * 100)) : 0,
      fokusAfterPct: this.fokusMax > 0 ? Math.round(Math.max(0, fokusAfter) / this.fokusMax * 100) : 0,
      fokusCostPct: this.fokusMax > 0 ? Math.min(100, Math.round(fokusCost / this.fokusMax * 100)) : 0,
      scaledEffektivitaet: this.computeScaledEffektivitaet(spell, this.skalierung),
      scaledHaltbarkeit: this.computeScaledHaltbarkeit(spell, this.skalierung)
    };
  }
  get canCast() {
    if (!this.pendingCastSpell)
      return false;
    const manaOk = this.castPreview.manaAfter >= 0;
    const fokusOk = this.castPreview.fokusAfter >= 0;
    const statsOk = this.spellStatReqs(this.pendingCastSpell).every((r) => this.castLevelMeetsReq(r.key, r.value));
    return manaOk && fokusOk && statsOk;
  }
  get skalerungStars() {
    return Array.from({ length: Math.min(9, Math.floor(this.skalierung - 1)) });
  }
  // ── Cast confirmation popup ───────────────────────────────────────────────
  get showCastConfirm() {
    return this.pendingCastSpell !== null;
  }
  /** Explicit handlers so OnPush re-evaluates cost preview bars while dragging sliders */
  onCastLevelChange(val) {
    this.pendingCastLevel = Math.max(0, +val || 0);
    this.recalcCastPreview();
    this.cdr.detectChanges();
  }
  onSkalierungChange(val) {
    this.skalierung = Math.max(0.1, +val || 1);
    this.recalcCastPreview();
    this.cdr.detectChanges();
  }
  requestCast(spell) {
    this.pendingCastSpell = spell;
    this.pendingCastLevel = 0;
    this.skalierung = 1;
    this.recalcCastPreview();
    this._computePortalRunes(spell);
    this.cdr.markForCheck();
  }
  cancelCast() {
    this.pendingCastSpell = null;
    this.castPreview = __spreadValues({}, EMPTY_CAST_PREVIEW);
    this._portalRunes = [];
    this.cdr.markForCheck();
  }
  confirmCast() {
    const spell = this.pendingCastSpell;
    if (!spell || !this.canCast)
      return;
    const sk = this.skalierung;
    const cl = this.pendingCastLevel;
    this.pendingCastSpell = null;
    this.castPreview = __spreadValues({}, EMPTY_CAST_PREVIEW);
    this._portalRunes = [];
    this.castSpell(spell, cl, sk);
    this.cdr.markForCheck();
  }
  enhancedSpellDesc(spell) {
    const enhanced = KeywordEnhancer.enhance(spell.description || "");
    return this._sanitizer.bypassSecurityTrustHtml(enhanced);
  }
  _computePortalRunes(spell) {
    const runeByName = new Map((this.sheet.runes || []).filter((r) => r !== null).map((r) => [r.name, r]));
    const nodes = spell.graph?.nodes || [];
    const positions = PORTAL_POSITIONS;
    const useCount = Math.min(positions.length, Math.max(nodes.length > 0 ? nodes.length : 0, 8));
    const speeds = [12, 9, 14, 11, 8, 13, 10, 15, 12, 9, 11, 14, 8, 13, 10, 12];
    const delays = [0, -4, -8, -2, -6, -10, -3, -7, -1, -5, -9, -2, -6, -4, -8, -3];
    const sizes = [52, 38, 56, 42, 46, 40, 58, 44, 48, 36, 52, 40, 46, 42, 50, 38];
    const opacities = [0.6, 0.5, 0.65, 0.55, 0.45, 0.6, 0.5, 0.55, 0.65, 0.45, 0.55, 0.6, 0.5, 0.65, 0.55, 0.45];
    this._portalRunes = [];
    for (let i = 0; i < useCount; i++) {
      const nodeIdx = nodes.length > 0 ? i % nodes.length : -1;
      const node = nodeIdx >= 0 ? nodes[nodeIdx] : null;
      const rune = node ? runeByName.get(node.runeId) : null;
      const color = rune?.glowColor || spell.strokeColor || "#8b5cf6";
      const drawingUrl = rune?.drawing ? this._imageService.getImageUrl(rune.drawing) : null;
      const pos = positions[i % positions.length];
      this._portalRunes.push({
        id: i,
        drawing: drawingUrl,
        symbol: rune ? rune.name?.charAt(0)?.toUpperCase() ?? "\u2726" : RUNE_SYMBOLS[i % RUNE_SYMBOLS.length],
        color,
        x: pos.x,
        y: pos.y,
        size: sizes[i % 16],
        speed: speeds[i % 16],
        delay: delays[i % 16],
        opacity: opacities[i % 16]
      });
    }
  }
  // ── Actions ───────────────────────────────────────────────────────────────
  castSpell(spell, castLevel = 0, skalierung = 1) {
    const entryId = `${spell.id || generateSpellId()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const manaCost = this.computeManaCost(spell, castLevel, skalierung);
    this._consumeMana(manaCost);
    const entry = {
      spellId: spell.id || generateSpellId(),
      spellName: spell.name,
      castLevel,
      entryId,
      skalierung: skalierung !== 1 ? skalierung : void 0,
      remainingCast: castLevel,
      // 0 = instant cast; >0 = needs d20 rolls to complete
      roundsActive: castLevel <= 0 ? 0 : void 0
      // instant spells start active immediately
    };
    const updated = [...this.castingSpells, entry];
    this.sheet.castingSpells = updated;
    this.patch.emit({ path: "castingSpells", value: updated });
    this._spawnRunesForSpell(spell);
    this.cdr.markForCheck();
  }
  _consumeMana(amount) {
    if (amount <= 0)
      return;
    const statuses = [...this.sheet.statuses || []];
    const idx = statuses.findIndex((s) => s.statusName === "Mana");
    if (idx < 0)
      return;
    const newVal = Math.max(0, statuses[idx].statusCurrent - amount);
    statuses[idx] = __spreadProps(__spreadValues({}, statuses[idx]), { statusCurrent: newVal });
    this.sheet.statuses = statuses;
    this.patch.emit({ path: `statuses.${idx}.statusCurrent`, value: newVal });
  }
  /** Sent each time a d20 cast roll is made — shows the roll to the lobby */
  _sendCastRollAction(entry, roll, bonus, total) {
    if (!this.sheet.worldName)
      return;
    const spell = this.getSpell(entry.spellId);
    const spellName = entry.spellName;
    const remaining = entry.remainingCast;
    this._worldSocket.sendDiceRoll({
      id: `cast-roll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      worldName: this.sheet.worldName,
      characterName: this.sheet.name,
      characterId: this.sheet.id || "",
      diceType: 20,
      diceCount: 1,
      bonuses: bonus !== 0 ? [{ name: "Wirk-Bonus", value: bonus, source: "sheet" }] : [],
      result: total,
      rolls: [roll],
      timestamp: /* @__PURE__ */ new Date(),
      isSecret: false,
      actionName: `\u{1F3B2} Wirken: ${spellName} (noch ${remaining})`,
      actionIcon: spell?.icon || "\u{1F3B2}",
      actionColor: spell?.strokeColor || "#8b5cf6"
    });
  }
  /** Sent once when casting finishes (remainingCast reaches 0) */
  _sendSpellActivatedAction(entry, manaCost) {
    if (!this.sheet.worldName)
      return;
    const spell = this.getSpell(entry.spellId);
    const sk = entry.skalierung ?? 1;
    const cl = entry.castLevel || 0;
    const fokusCommit = spell ? this.computeFokusCost(spell, cl) : 0;
    const resourceChanges = [];
    if (manaCost > 0)
      resourceChanges.push({ resource: "Mana", amount: -manaCost });
    if (fokusCommit > 0)
      resourceChanges.push({ resource: "Fokus", amount: -fokusCommit });
    this._worldSocket.sendDiceRoll({
      id: `cast-done-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      worldName: this.sheet.worldName,
      characterName: this.sheet.name,
      characterId: this.sheet.id || "",
      diceType: 0,
      diceCount: 0,
      bonuses: [],
      result: 0,
      rolls: [],
      timestamp: /* @__PURE__ */ new Date(),
      isSecret: false,
      actionName: `\u2726 ${entry.spellName}${sk > 1 ? ` \xD7${sk}` : ""} \u2014 Gewirkt!`,
      actionIcon: spell?.icon || "\u2726",
      actionColor: spell?.strokeColor || "#8b5cf6",
      resourceChanges: resourceChanges.length > 0 ? resourceChanges : void 0
    });
  }
  /** Roll d20 + castBonus and subtract from remaining cast. Sends lobby actions. */
  rollCast(entry) {
    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = this.castBonus;
    const total = roll + bonus;
    const before = entry.remainingCast;
    entry.remainingCast = Math.max(0, before - total);
    const justCompleted = before > 0 && entry.remainingCast <= 0;
    if (justCompleted) {
      entry.roundsActive = 0;
    }
    this._sendCastRollAction(entry, roll, bonus, total);
    if (justCompleted) {
      const spell = this.getSpell(entry.spellId);
      const sk = entry.skalierung ?? 1;
      const manaCost = spell ? this.computeManaCost(spell, entry.castLevel || 0, sk) : 0;
      this._sendSpellActivatedAction(entry, manaCost);
    }
    this._patchCasting();
  }
  /** Advance round counter for an active spell */
  advanceRound(entry) {
    entry.roundsActive = (entry.roundsActive ?? 0) + 1;
    this._patchCasting();
  }
  /** Whether a spell has exceeded its scaled round duration */
  isSpellFinished(entry) {
    if (entry.remainingCast > 0)
      return false;
    const spell = this.getSpell(entry.spellId);
    const baseDur = spell?.durationTurns ?? 0;
    if (!baseDur)
      return true;
    const sk = entry.skalierung ?? 1;
    const scaledDur = scaledBySkalierung(baseDur, sk);
    return (entry.roundsActive ?? 0) >= scaledDur;
  }
  entryScaledHaltbarkeit(entry) {
    const spell = this.getSpell(entry.spellId);
    const base = spell?.durationTurns ?? 0;
    return scaledBySkalierung(base, entry.skalierung ?? 1);
  }
  entryScaledEffektivitaet(entry) {
    const spell = this.getSpell(entry.spellId);
    if (!spell)
      return 0;
    return this.computeScaledEffektivitaet(spell, entry.skalierung ?? 1);
  }
  /** Whether the spell is actively sustained (casting complete, not yet finished) */
  isSpellActive(entry) {
    return entry.remainingCast <= 0 && !this.isSpellFinished(entry);
  }
  castProgressPercent(entry) {
    const total = entry.castLevel || 0;
    if (total <= 0)
      return 100;
    return Math.round((total - entry.remainingCast) / total * 100);
  }
  /** Edit remaining cast directly */
  setRemainingCast(entry, value) {
    entry.remainingCast = Math.max(0, value);
    if (entry.remainingCast <= 0 && entry.roundsActive === void 0) {
      entry.roundsActive = 0;
    }
    this._patchCasting();
  }
  /** Edit round counter directly */
  setRoundsActive(entry, value) {
    entry.roundsActive = Math.max(0, value);
    this._patchCasting();
  }
  /** Stop / dismiss a spell (removes from active list) */
  stopCasting(entry) {
    const updated = entry.entryId ? this.castingSpells.filter((e) => e.entryId !== entry.entryId) : this.castingSpells.filter((e) => e.spellId !== entry.spellId);
    this.sheet.castingSpells = updated;
    this._patchCasting();
    this.cdr.markForCheck();
  }
  _patchCasting() {
    this.patch.emit({ path: "castingSpells", value: [...this.castingSpells] });
    this.cdr.markForCheck();
  }
  /** Adjust a counter on a spell's definition and sync via patch */
  adjustCounter(spellId, counterIndex, newValue) {
    const spells = [...this.sheet.spells || []];
    const idx = spells.findIndex((s) => s.id === spellId);
    if (idx < 0)
      return;
    const spell = __spreadValues({}, spells[idx]);
    if (!spell.counters || counterIndex >= spell.counters.length)
      return;
    spell.counters = spell.counters.map((c, i) => i === counterIndex ? __spreadProps(__spreadValues({}, c), { current: Math.max(c.min, Math.min(c.max, newValue)) }) : c);
    spells[idx] = spell;
    this.sheet.spells = spells;
    this.patch.emit({ path: "spells", value: spells });
    this.cdr.markForCheck();
  }
  // ── Skill support ─────────────────────────────────────────────────────────
  /** Active skills (type === 'active') available on the sheet, plus effect-granted temporary
   * skills derived from active effectActive blocks (they appear/vanish with their source effect). */
  get availableSkills() {
    const own = (this.sheet.skills || []).filter((s) => s.type === "active" && !s.disabled);
    return [...own, ...this._trueStats.getDerivedSkillBlocks(this.sheet)];
  }
  /** Active skills filtered by search text */
  get filteredAvailableSkills() {
    if (!this.skillSearchText.trim())
      return this.availableSkills;
    const q = this.skillSearchText.toLowerCase();
    return this.availableSkills.filter((s) => (s.name || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q) || (s.class || "").toLowerCase().includes(q));
  }
  /** Active spells filtered by spell name for search */
  get filteredAvailableSpells() {
    return this.availableSpells;
  }
  /** Skills currently toggled on (have name in activeSkillNames) */
  get activeSkillsList() {
    return this.availableSkills.filter((s) => this.isSkillActive(s));
  }
  /** Whether a skill is currently toggled on */
  isSkillActive(skill) {
    return (this.sheet.activeSkillNames || []).includes(skill.name);
  }
  /** Toggle a skill on/off and emit patch */
  toggleActiveSkill(skill) {
    const current = [...this.sheet.activeSkillNames || []];
    const idx = current.indexOf(skill.name);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(skill.name);
    }
    this.sheet.activeSkillNames = current;
    this.patch.emit({ path: "activeSkillNames", value: current });
    this.cdr.markForCheck();
  }
  /** Adjust a counter on a skill definition and sync via patch */
  adjustSkillCounter(skillName, counterIndex, newValue) {
    const skills = [...this.sheet.skills || []];
    const idx = skills.findIndex((s) => s.name === skillName);
    if (idx < 0)
      return;
    const skill = __spreadValues({}, skills[idx]);
    if (!skill.counters || counterIndex >= skill.counters.length)
      return;
    skill.counters = skill.counters.map((c, i) => i === counterIndex ? __spreadProps(__spreadValues({}, c), { current: Math.max(c.min, Math.min(c.max, newValue)) }) : c);
    skills[idx] = skill;
    this.sheet.skills = skills;
    this.patch.emit({ path: "skills", value: skills });
    this.cdr.markForCheck();
  }
  // ── Skill definition resolution ───────────────────────────────────────────
  getSkillDefinition(skill) {
    if (skill.skillId)
      return SKILL_DEFINITIONS.find((s) => s.id === skill.skillId);
    return SKILL_DEFINITIONS.find((s) => s.name === skill.name && s.class === skill.class) ?? SKILL_DEFINITIONS.find((s) => s.name === skill.name);
  }
  effectiveCost(skill) {
    return skill.cost ?? this.getSkillDefinition(skill)?.cost;
  }
  effectiveActionType(skill) {
    return skill.actionType ?? this.getSkillDefinition(skill)?.actionType;
  }
  skillCostLabel(skill) {
    const cost = this.effectiveCost(skill);
    if (!cost)
      return "";
    const type = cost.type === "mana" ? "M" : cost.type === "energy" ? "E" : "\u2764";
    return `${cost.amount}${type}${cost.perRound ? "/Rd" : ""}`;
  }
  /** Deduct per-round cost of an active skill from the matching status resource */
  paySkillRoundCost(skill) {
    const cost = this.effectiveCost(skill);
    if (!cost?.perRound || !cost.amount)
      return;
    const formulaMap = {
      mana: FormulaType.MANA,
      energy: FormulaType.ENERGY,
      life: FormulaType.LIFE
    };
    const targetType = formulaMap[cost.type];
    if (!targetType)
      return;
    const statuses = [...this.sheet.statuses || []];
    const idx = statuses.findIndex((s) => s.formulaType === targetType);
    if (idx < 0)
      return;
    const newVal = Math.max(0, (statuses[idx].statusCurrent || 0) - cost.amount);
    statuses[idx] = __spreadProps(__spreadValues({}, statuses[idx]), { statusCurrent: newVal });
    this.sheet.statuses = statuses;
    this.patch.emit({ path: "statuses", value: statuses });
    this.cdr.markForCheck();
  }
  // ── Floating runes ────────────────────────────────────────────────────────
  ngOnInit() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    this.leftTab = this.defaultTab;
    this._generateAmbientRunes();
  }
  ngOnDestroy() {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
  ngOnChanges(_) {
    if (this.pendingCastSpell) {
      this.recalcCastPreview();
    }
    this.cdr.markForCheck();
  }
  setLeftTab(tab) {
    this.leftTab = tab;
    this.tabChange.emit(tab);
    this.cdr.markForCheck();
  }
  onEscape() {
    this.close.emit();
  }
  _generateAmbientRunes() {
    const count = 18;
    for (let i = 0; i < count; i++) {
      this.floatingRunes.push(this._makeRune());
    }
  }
  _spawnRunesForSpell(spell) {
    const color = spell.strokeColor || "#8b5cf6";
    for (let i = 0; i < 5; i++) {
      this.floatingRunes.push(this._makeRune(color));
    }
    if (this.floatingRunes.length > 40) {
      this.floatingRunes = this.floatingRunes.slice(-40);
    }
    this.cdr.markForCheck();
  }
  _makeRune(color) {
    const colors = ["#8b5cf6", "#3b82f6", "#06b6d4", "#ec4899", "#a78bfa"];
    return {
      id: this.runeIdCounter++,
      symbol: RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)],
      x: Math.random() * 95,
      y: Math.random() * 95,
      size: 14 + Math.floor(Math.random() * 28),
      opacity: 0.05 + Math.random() * 0.15,
      speed: 8 + Math.random() * 14,
      delay: Math.random() * -12,
      color: color || colors[Math.floor(Math.random() * colors.length)]
    };
  }
  static \u0275fac = function SpellcastWindowComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SpellcastWindowComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SpellcastWindowComponent, selectors: [["app-spellcast-window"]], hostBindings: function SpellcastWindowComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown.escape", function SpellcastWindowComponent_keydown_escape_HostBindingHandler() {
        return ctx.onEscape();
      }, \u0275\u0275resolveDocument);
    }
  }, inputs: { sheet: "sheet", defaultTab: "defaultTab" }, outputs: { patch: "patch", tabChange: "tabChange", close: "close" }, features: [\u0275\u0275NgOnChangesFeature], decls: 73, vars: 30, consts: [[1, "scw-overlay", 3, "click"], ["aria-hidden", "true", 1, "scw-rune-field"], [1, "scw-rune-glyph", 3, "left", "top", "font-size", "opacity", "color", "animation-duration", "animation-delay"], [1, "scw-header"], [1, "scw-header-left"], [1, "scw-title"], [1, "app-icon", "i-spell"], [1, "scw-char-name"], [1, "scw-resources"], [1, "scw-res-block"], [1, "scw-res-label"], [1, "scw-res-bar"], [1, "scw-res-fill", "scw-res-fill--leben"], [1, "scw-res-val"], [1, "scw-res-fill", "scw-res-fill--ausdauer"], [1, "scw-res-fill", "scw-res-fill--mana"], [1, "scw-res-fill", "scw-res-fill--fokus"], ["title", "Schlie\xDFen (Esc)", 1, "scw-close-btn", 3, "click"], [1, "scw-body"], [1, "scw-panel", "scw-panel--available"], [1, "scw-left-tabs"], [1, "scw-left-tab", 3, "click"], [1, "scw-left-tab-count"], [1, "app-icon", "i-ability"], [1, "scw-divider"], [1, "scw-divider-line"], [1, "scw-divider-rune"], [1, "scw-panel", "scw-panel--active"], [1, "scw-panel-header"], [1, "scw-cast-bonus-row"], [1, "scw-cast-bonus-label"], ["type", "number", "title", "Wird zu jedem Wirk-W\xFCrfelwurf addiert", 1, "scw-cast-bonus-input", 3, "ngModelChange", "ngModel"], [1, "scw-active-scroll"], [1, "scw-empty"], [1, "scw-active-list"], [1, "cast-portal", 3, "--sc"], [1, "scw-rune-glyph"], [1, "scw-spell-grid"], [1, "scw-spell-card", 3, "is-casting", "--sc", "title"], [1, "scw-spell-card", 3, "click", "title"], [1, "scw-spell-glow"], [1, "scw-card-head"], [1, "scw-spell-icon"], [1, "scw-spell-name"], [1, "scw-active-badge"], [1, "scw-spell-desc-short", 3, "innerHTML"], [1, "scw-spell-reqs-row"], [1, "scw-card-footer"], [1, "scw-card-costs"], [1, "scw-cost-chip", "scw-cost-chip--mana"], [1, "scw-cost-chip", "scw-cost-chip--fokus"], [1, "scw-cost-chip", "scw-cost-chip--free"], [1, "scw-card-meta"], [1, "scw-card-perturn"], [1, "scw-card-dur"], [1, "scw-spell-tags"], [1, "scw-spell-req", 3, "scw-spell-req--unmet"], [1, "scw-spell-req"], [1, "scw-tag"], [1, "scw-skill-search-row"], ["type", "text", "placeholder", "F\xE4higkeit suchen...", 1, "scw-skill-search", 3, "ngModelChange", "ngModel"], [1, "scw-spell-card", "scw-spell-card--skill", 3, "is-casting", "title"], [1, "scw-spell-card", "scw-spell-card--skill", 3, "click", "title"], [1, "scw-skill-action-badge"], [1, "scw-spell-desc-short"], [1, "scw-cost-chip", "scw-cost-chip--energy"], [1, "scw-cost-chip", "scw-cost-chip--life"], [1, "app-icon", "i-energy"], [1, "app-icon", "i-life"], [1, "scw-empty-hint"], [1, "scw-active-card", 3, "--sc"], [1, "scw-active-card"], [1, "scw-active-glow"], [1, "scw-active-header"], [1, "scw-active-type-badge", "scw-active-type-badge--spell"], [1, "scw-active-icon"], [1, "scw-active-name"], [1, "scw-skal-badge", "scw-skal-badge--prominent"], ["title", "Beenden", 1, "scw-stop-btn", 3, "click"], [1, "scw-cast-progress"], [1, "scw-round-counter"], [1, "scw-spell-finished"], [1, "scw-active-desc", 3, "innerHTML"], [1, "scw-active-startcost"], [1, "scw-active-cost"], [1, "scw-counter-list"], [1, "scw-counter"], [1, "scw-counter-name"], [1, "scw-counter-btn", 3, "click"], ["type", "number", 1, "scw-counter-input", 3, "ngModelChange", "ngModel"], [1, "scw-counter-max"], [1, "scw-counter-bar"], [1, "scw-counter-fill"], [1, "scw-cast-progress-header"], [1, "scw-cast-progress-label"], [1, "scw-cast-remaining-row"], ["type", "number", "min", "0", 1, "scw-cast-remaining-input", 3, "ngModelChange", "ngModel"], [1, "scw-cast-remaining-of"], [1, "scw-cast-bar"], [1, "scw-cast-bar-fill"], [1, "scw-reduction"], [1, "scw-roll-btn", 3, "click"], [1, "app-icon", "i-dice"], [1, "scw-round-label"], ["type", "number", "min", "0", 1, "scw-round-input", 3, "ngModelChange", "ngModel"], ["title", "Runde voranbringen", 1, "scw-advance-btn", 3, "click"], [1, "scw-round-of"], [1, "scw-finished-badge"], [1, "scw-dismiss-btn", 3, "click"], [1, "scw-active-card", "scw-active-card--skill"], [1, "scw-active-type-badge", "scw-active-type-badge--skill"], ["title", "Deaktivieren", 1, "scw-stop-btn", 3, "click"], [1, "scw-active-desc"], [1, "scw-active-meta-row"], [1, "scw-skill-modifiers"], [1, "scw-active-dismiss-row"], ["title", "Rundenkosten zahlen", 1, "scw-pay-cost-btn"], ["title", "Rundenkosten zahlen", 1, "scw-pay-cost-btn", 3, "click"], [1, "scw-skill-mod", 3, "positive", "negative"], [1, "scw-skill-mod"], [1, "cast-portal", 3, "click"], [1, "portal-rune-field"], [1, "portal-rune", 3, "left", "top", "width", "height", "animationDuration", "animationDelay", "opacity"], [1, "cast-card", 3, "click"], [1, "cast-card-head"], [1, "cast-icon"], [1, "cast-title-block"], [1, "cast-type-label"], [1, "cast-spell-name"], ["title", "Schlie\xDFen", 1, "cast-close-btn", 3, "click"], [1, "cast-desc", 3, "innerHTML"], [1, "cast-reqs-row"], [1, "cast-controls"], [1, "cast-col", "cast-col--left"], [1, "cast-section-label"], [1, "cast-skal-val"], [1, "cast-slider-row"], ["type", "range", "min", "0", "step", "1", 1, "cast-slider", "cast-slider--cl", 3, "input", "ngModelChange", "max", "ngModel"], ["type", "number", "min", "0", "step", "1", "title", "Cast-Level direkt eingeben (kein Maximum)", 1, "cast-level-input", 3, "ngModelChange", "ngModel"], [1, "cast-cl-markers"], [1, "cast-estimate"], [1, "cast-estimate-label"], [1, "cast-estimate-val"], [1, "cast-section-label", "cast-section-label--skal"], [1, "cast-stars"], [1, "cast-skal-stats"], ["type", "range", "min", "0.1", "max", "10", "step", "0.1", 1, "cast-slider", "cast-slider--skal", 3, "input", "ngModelChange", "ngModel"], ["type", "number", "min", "0.1", "step", "0.1", "title", "Skalierung direkt eingeben", 1, "cast-skal-input", 3, "ngModelChange", "ngModel"], [1, "cast-col", "cast-col--right"], [1, "cast-res-bar-wrap"], [1, "cast-res-bar", "cast-res-bar--mana"], [1, "cast-res-fill"], [1, "cast-res-cost-overlay", "cast-res-cost-overlay--mana", 3, "width", "left"], [1, "cast-res-labels"], [1, "cast-res-cur"], [1, "cast-res-after"], [1, "cast-res-max"], [1, "cast-res-cost-tag", "cast-res-cost-tag--mana"], [1, "cast-res-bar", "cast-res-bar--fokus"], [1, "cast-res-cost-overlay", "cast-res-cost-overlay--fokus", 3, "width", "left"], [1, "cast-res-cost-tag", "cast-res-cost-tag--fokus"], [1, "cast-perturn-block"], [1, "cast-footer"], [1, "cast-cancel-btn", 3, "click"], [1, "cast-confirm-btn", 3, "click", "disabled", "title"], [1, "portal-rune"], [1, "portal-rune-img", 3, "src", "filter", "alt"], [1, "portal-rune-glyph", 3, "color", "textShadow"], [1, "portal-rune-img", 3, "src", "alt"], [1, "portal-rune-glyph"], [1, "cast-req", 3, "cast-req--met", "cast-req--unmet"], [1, "cast-req"], [1, "cast-req-orig"], [1, "cast-req-arrow"], [1, "cast-req-effective"], [1, "cast-cl-marker", 3, "left", "title"], [1, "cast-cl-marker", 3, "title"], [1, "cast-cl-marker-label"], [1, "cast-star"], [1, "cast-skal-stat"], [1, "app-icon", "i-effektivity"], [1, "cast-res-cost-overlay", "cast-res-cost-overlay--mana"], [1, "cast-res-cost-overlay", "cast-res-cost-overlay--fokus"], [1, "cast-perturn-chip", "cast-perturn-chip--mana"], [1, "cast-perturn-chip", "cast-perturn-chip--fokus"], [1, "cast-perturn-chip", "cast-perturn-chip--dur"], [1, "cast-perturn-chip", "cast-perturn-chip--eff"]], template: function SpellcastWindowComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275listener("click", function SpellcastWindowComponent_Template_div_click_0_listener($event) {
        return $event.stopPropagation();
      });
      \u0275\u0275elementStart(1, "div", 1);
      \u0275\u0275repeaterCreate(2, SpellcastWindowComponent_For_3_Template, 2, 15, "span", 2, _forTrack02);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 3)(5, "div", 4)(6, "span", 5);
      \u0275\u0275element(7, "span", 6);
      \u0275\u0275text(8, " Zauber und F\xE4higkeiten");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(9, SpellcastWindowComponent_Conditional_9_Template, 2, 1, "span", 7);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(10, "div", 8)(11, "div", 9)(12, "span", 10);
      \u0275\u0275text(13, "Leben");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "div", 11);
      \u0275\u0275element(15, "div", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "span", 13);
      \u0275\u0275text(17);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(18, "div", 9)(19, "span", 10);
      \u0275\u0275text(20, "Ausdauer");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "div", 11);
      \u0275\u0275element(22, "div", 14);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "span", 13);
      \u0275\u0275text(24);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 9)(26, "span", 10);
      \u0275\u0275text(27, "Mana");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "div", 11);
      \u0275\u0275element(29, "div", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "span", 13);
      \u0275\u0275text(31);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(32, "div", 9)(33, "span", 10);
      \u0275\u0275text(34, "Fokus");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "div", 11);
      \u0275\u0275element(36, "div", 16);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(37, "span", 13);
      \u0275\u0275text(38);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(39, "button", 17);
      \u0275\u0275listener("click", function SpellcastWindowComponent_Template_button_click_39_listener() {
        return ctx.close.emit();
      });
      \u0275\u0275text(40, "\u2715");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(41, "div", 18)(42, "div", 19)(43, "div", 20)(44, "button", 21);
      \u0275\u0275listener("click", function SpellcastWindowComponent_Template_button_click_44_listener() {
        return ctx.setLeftTab("spells");
      });
      \u0275\u0275element(45, "span", 6);
      \u0275\u0275text(46, " Zauber ");
      \u0275\u0275elementStart(47, "span", 22);
      \u0275\u0275text(48);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(49, "button", 21);
      \u0275\u0275listener("click", function SpellcastWindowComponent_Template_button_click_49_listener() {
        return ctx.setLeftTab("skills");
      });
      \u0275\u0275element(50, "span", 23);
      \u0275\u0275text(51, " F\xE4higkeiten ");
      \u0275\u0275elementStart(52, "span", 22);
      \u0275\u0275text(53);
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(54, SpellcastWindowComponent_Conditional_54_Template, 2, 1);
      \u0275\u0275conditionalCreate(55, SpellcastWindowComponent_Conditional_55_Template, 5, 2);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "div", 24);
      \u0275\u0275element(57, "div", 25);
      \u0275\u0275elementStart(58, "span", 26);
      \u0275\u0275text(59, "\u16CA");
      \u0275\u0275elementEnd();
      \u0275\u0275element(60, "div", 25);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(61, "div", 27)(62, "div", 28);
      \u0275\u0275text(63, "Aktive Zauber & F\xE4higkeiten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(64, "div", 29)(65, "label", 30);
      \u0275\u0275text(66, "Wirk-Bonus");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(67, "input", 31);
      \u0275\u0275listener("ngModelChange", function SpellcastWindowComponent_Template_input_ngModelChange_67_listener($event) {
        return ctx.setCastBonus($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(68, "div", 32);
      \u0275\u0275conditionalCreate(69, SpellcastWindowComponent_Conditional_69_Template, 5, 0, "div", 33);
      \u0275\u0275conditionalCreate(70, SpellcastWindowComponent_Conditional_70_Template, 3, 0, "div", 34);
      \u0275\u0275conditionalCreate(71, SpellcastWindowComponent_Conditional_71_Template, 3, 0, "div", 34);
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(72, SpellcastWindowComponent_Conditional_72_Template, 73, 52, "div", 35);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.floatingRunes);
      \u0275\u0275advance(7);
      \u0275\u0275conditional(ctx.sheet.name ? 9 : -1);
      \u0275\u0275advance(6);
      \u0275\u0275styleProp("width", ctx.lebenPercent, "%");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("", ctx.lebenCurrent, " / ", ctx.lebenMax);
      \u0275\u0275advance(5);
      \u0275\u0275styleProp("width", ctx.ausdauerPercent, "%");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("", ctx.ausdauerCurrent, " / ", ctx.ausdauerMax);
      \u0275\u0275advance(5);
      \u0275\u0275styleProp("width", ctx.manaPercent, "%");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("", ctx.manaCurrent, " / ", ctx.manaMax);
      \u0275\u0275advance(5);
      \u0275\u0275styleProp("width", ctx.fokusAvailPercent, "%");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("", ctx.fokusAvailable, " / ", ctx.fokusMax);
      \u0275\u0275advance(6);
      \u0275\u0275classProp("active", ctx.leftTab === "spells");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.availableSpells.length);
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.leftTab === "skills");
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.availableSkills.length);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.leftTab === "spells" ? 54 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.leftTab === "skills" ? 55 : -1);
      \u0275\u0275advance(12);
      \u0275\u0275property("ngModel", ctx.castBonus);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.castingSpells.length === 0 && ctx.activeSkillsList.length === 0 ? 69 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.castingSpells.length > 0 ? 70 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeSkillsList.length > 0 ? 71 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showCastConfirm && ctx.pendingCastSpell ? 72 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, RangeValueAccessor, NgControlStatus, MinValidator, NgModel, DecimalPipe], styles: ['\n\n[_nghost-%COMP%] {\n  display: block;\n  position: fixed;\n  inset: 0;\n  z-index: 2000;\n  pointer-events: all;\n}\n.scw-overlay[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background:\n    radial-gradient(\n      ellipse at 40% 30%,\n      rgba(88, 28, 235, 0.18) 0%,\n      rgba(0, 0, 0, 0) 60%),\n    radial-gradient(\n      ellipse at 70% 70%,\n      rgba(59, 130, 246, 0.12) 0%,\n      rgba(0, 0, 0, 0) 60%),\n    rgb(8, 6, 20);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.scw-rune-field[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  overflow: hidden;\n  z-index: 0;\n}\n.scw-rune-glyph[_ngcontent-%COMP%] {\n  position: absolute;\n  font-family: serif;\n  -webkit-user-select: none;\n  user-select: none;\n  animation: _ngcontent-%COMP%_runeFloat linear infinite;\n  will-change: transform, opacity;\n}\n@keyframes _ngcontent-%COMP%_runeFloat {\n  0% {\n    transform: translateY(0px) rotate(0deg);\n    opacity: var(--ro, 0.08);\n  }\n  25% {\n    transform: translateY(-18px) rotate(6deg);\n    opacity: calc(var(--ro, 0.08) * 1.4);\n  }\n  50% {\n    transform: translateY(-8px) rotate(-4deg);\n    opacity: var(--ro, 0.08);\n  }\n  75% {\n    transform: translateY(-24px) rotate(3deg);\n    opacity: calc(var(--ro, 0.08) * 0.7);\n  }\n  100% {\n    transform: translateY(0px) rotate(0deg);\n    opacity: var(--ro, 0.08);\n  }\n}\n.scw-header[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  gap: 20px;\n  padding: 18px 28px 14px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.25);\n  background:\n    linear-gradient(\n      180deg,\n      rgba(139, 92, 246, 0.12) 0%,\n      transparent 100%);\n  flex-shrink: 0;\n}\n.scw-header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  gap: 12px;\n}\n.scw-title[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  font-weight: 800;\n  color: #c4b5fd;\n  letter-spacing: 0.04em;\n  text-shadow: 0 0 20px rgba(139, 92, 246, 0.6);\n}\n.scw-char-name[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 500;\n}\n.scw-resources[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 20px;\n  margin-left: auto;\n  align-items: center;\n}\n.scw-res-block[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.scw-res-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.scw-res-bar[_ngcontent-%COMP%] {\n  width: 120px;\n  height: 8px;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 4px;\n  overflow: hidden;\n}\n.scw-res-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 4px;\n  transition: width 0.4s ease;\n}\n.scw-res-fill--leben[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #ef4444,\n      #f87171);\n  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);\n}\n.scw-res-fill--ausdauer[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #22c55e,\n      #4ade80);\n  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);\n}\n.scw-res-fill--mana[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #3b82f6,\n      #6366f1);\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);\n}\n.scw-res-fill--fokus[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #8b5cf6,\n      #a78bfa);\n  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);\n}\n.scw-res-val[_ngcontent-%COMP%] {\n  font-size: 0.76rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  white-space: nowrap;\n  min-width: 52px;\n}\n.scw-close-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: var(--text-muted, #9ca3af);\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  font-size: 1rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.scw-close-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.scw-body[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  align-items: stretch;\n  gap: 0;\n  overflow: hidden;\n  padding: 24px 28px;\n}\n.scw-panel[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  overflow: hidden;\n}\n.scw-panel-header[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: rgba(196, 181, 253, 0.7);\n  padding-bottom: 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.2);\n  flex-shrink: 0;\n}\n.scw-empty[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.85rem;\n  text-align: center;\n  padding: 30px 0;\n  line-height: 1.6;\n}\n.scw-empty-hint[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  opacity: 0.7;\n}\n.scw-spell-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  overflow-y: auto;\n  align-content: flex-start;\n  flex: 1;\n  padding-right: 4px;\n}\n.scw-spell-grid[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n}\n.scw-spell-grid[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.scw-spell-grid[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n.scw-spell-card[_ngcontent-%COMP%] {\n  position: relative;\n  width: 160px;\n  min-height: 140px;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  padding: 0 0 8px 0;\n  border-radius: 12px;\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-left: 3px solid var(--sc, #8b5cf6);\n  background: rgba(255, 255, 255, 0.03);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  overflow: hidden;\n}\n.scw-spell-card[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.08);\n  border-color: var(--sc, #8b5cf6);\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2), 0 0 0 1px var(--sc, #8b5cf6);\n  transform: translateY(-2px);\n}\n.scw-spell-card.is-casting[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.13);\n  border-color: var(--sc, #8b5cf6);\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.3);\n  cursor: default;\n}\n.scw-spell-glow[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at 50% 30%,\n      var(--sc, #8b5cf6) 0%,\n      transparent 70%);\n  opacity: 0;\n  transition: opacity 0.2s;\n  pointer-events: none;\n}\n.scw-spell-card[_ngcontent-%COMP%]:hover   .scw-spell-glow[_ngcontent-%COMP%] {\n  opacity: 0.08;\n}\n.scw-spell-card.is-casting[_ngcontent-%COMP%]   .scw-spell-glow[_ngcontent-%COMP%] {\n  opacity: 0.12;\n  animation: _ngcontent-%COMP%_pulseGlow 2s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_pulseGlow {\n  0%, 100% {\n    opacity: 0.08;\n  }\n  50% {\n    opacity: 0.2;\n  }\n}\n.scw-card-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 9px 8px 6px;\n}\n.scw-spell-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  color: var(--sc, #8b5cf6);\n  text-shadow: 0 0 10px var(--sc, #8b5cf6);\n  line-height: 1;\n  flex-shrink: 0;\n  animation: _ngcontent-%COMP%_iconPulse 3s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_iconPulse {\n  0%, 100% {\n    text-shadow: 0 0 8px var(--sc, #8b5cf6);\n  }\n  50% {\n    text-shadow: 0 0 18px var(--sc, #8b5cf6), 0 0 30px var(--sc, #8b5cf6);\n  }\n}\n.scw-spell-name[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  line-height: 1.3;\n  flex: 1;\n  word-break: break-word;\n  -webkit-hyphens: auto;\n  hyphens: auto;\n}\n.scw-active-badge[_ngcontent-%COMP%] {\n  font-size: 0.55rem;\n  font-weight: 700;\n  background: rgba(139, 92, 246, 0.4);\n  color: #c4b5fd;\n  border-radius: 5px;\n  padding: 1px 4px;\n  letter-spacing: 0.04em;\n  flex-shrink: 0;\n}\n.scw-spell-desc-short[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #7c8ca0;\n  line-height: 1.4;\n  padding: 0 9px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n.scw-spell-reqs-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  padding: 2px 9px 0;\n}\n.scw-spell-req[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 4px;\n  background: #1e3a5f;\n  color: #90caf9;\n  border: 1px solid rgba(66, 165, 245, 0.4);\n  white-space: nowrap;\n}\n.scw-spell-req--unmet[_ngcontent-%COMP%] {\n  background: #4d1c21;\n  color: #ffcdd2;\n  border-color: rgba(229, 115, 115, 0.5);\n  text-decoration: line-through;\n}\n.scw-card-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 8px 0;\n  gap: 4px;\n  margin-top: auto;\n}\n.scw-card-costs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n  flex-wrap: wrap;\n}\n.scw-cost-chip[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 4px;\n  white-space: nowrap;\n}\n.scw-cost-chip--mana[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.35);\n  color: #60a5fa;\n}\n.scw-cost-chip--fokus[_ngcontent-%COMP%] {\n  background: rgba(109, 40, 217, 0.12);\n  border: 1px solid rgba(109, 40, 217, 0.4);\n  color: #a78bfa;\n}\n.scw-cost-chip--free[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #4b5563;\n  font-style: italic;\n}\n.scw-card-meta[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n  align-items: center;\n}\n.scw-card-perturn[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  color: #9ca3af;\n}\n.scw-card-dur[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  color: #fcd34d;\n}\n.scw-spell-tags[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  padding: 2px 8px 0;\n}\n.scw-tag[_ngcontent-%COMP%] {\n  font-size: 0.56rem;\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.scw-skal-badge[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 700;\n  background: rgba(251, 191, 36, 0.12);\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  color: #fbbf24;\n  border-radius: 5px;\n  padding: 1px 5px;\n  flex-shrink: 0;\n}\n.scw-divider[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  padding: 0 20px;\n  flex-shrink: 0;\n}\n.scw-divider-line[_ngcontent-%COMP%] {\n  flex: 1;\n  width: 1px;\n  background:\n    linear-gradient(\n      to bottom,\n      transparent,\n      rgba(139, 92, 246, 0.3),\n      transparent);\n}\n.scw-divider-rune[_ngcontent-%COMP%] {\n  font-size: 1.6rem;\n  color: rgba(139, 92, 246, 0.4);\n  font-family: serif;\n  line-height: 1;\n  animation: _ngcontent-%COMP%_runeFloat 6s ease-in-out infinite;\n}\n.scw-active-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  padding-right: 4px;\n}\n.scw-active-scroll[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n}\n.scw-active-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.scw-active-scroll[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n.scw-active-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.scw-active-card[_ngcontent-%COMP%] {\n  position: relative;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-left: 3px solid var(--sc, #8b5cf6);\n  border-radius: 10px;\n  background: rgba(139, 92, 246, 0.07);\n  padding: 12px 14px;\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_slideIn 0.25s ease;\n}\n@keyframes _ngcontent-%COMP%_slideIn {\n  from {\n    opacity: 0;\n    transform: translateX(20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateX(0);\n  }\n}\n.scw-active-glow[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at 10% 50%,\n      var(--sc, #8b5cf6) 0%,\n      transparent 60%);\n  opacity: 0.06;\n  pointer-events: none;\n  animation: _ngcontent-%COMP%_pulseGlow 3s ease-in-out infinite;\n}\n.scw-active-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 6px;\n}\n.scw-active-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n  color: var(--sc, #8b5cf6);\n  text-shadow: 0 0 8px var(--sc, #8b5cf6);\n}\n.scw-active-name[_ngcontent-%COMP%] {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n}\n.scw-stop-btn[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.1);\n  border: 1px solid rgba(239, 68, 68, 0.25);\n  color: #fca5a5;\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  font-size: 0.72rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.scw-stop-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.25);\n  color: #ef4444;\n}\n.scw-pay-cost-btn[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  color: #c4b5fd;\n  height: 22px;\n  padding: 0 7px;\n  border-radius: 5px;\n  font-size: 0.68rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 3px;\n  transition: all 0.15s;\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n.scw-pay-cost-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.3);\n  color: #a78bfa;\n}\n.scw-active-desc[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: #9ca3af;\n  line-height: 1.5;\n  margin-bottom: 8px;\n  max-height: 60px;\n  overflow-y: auto;\n}\n.scw-active-startcost[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #a78bfa;\n  background: rgba(139, 92, 246, 0.08);\n  border-radius: 8px;\n  padding: 2px 8px;\n  display: inline-block;\n  margin-bottom: 6px;\n  font-weight: 600;\n}\n.scw-active-cost[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #fcd34d;\n  background: rgba(252, 211, 77, 0.1);\n  border-radius: 8px;\n  padding: 2px 8px;\n  display: inline-block;\n  margin-bottom: 8px;\n  font-weight: 600;\n}\n.scw-cl-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.scw-cl-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: var(--text-muted, #9ca3af);\n  flex: 1;\n}\n.scw-cl-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  background: rgba(139, 92, 246, 0.1);\n  color: #c4b5fd;\n  font-size: 0.85rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.12s;\n}\n.scw-cl-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.3);\n}\n.scw-cl-val[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  min-width: 20px;\n  text-align: center;\n}\n.scw-reduction[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  font-weight: 700;\n  color: #4ade80;\n  background: rgba(74, 222, 128, 0.1);\n  border-radius: 8px;\n  padding: 2px 6px;\n}\n.scw-counter-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-top: 8px;\n  padding-top: 8px;\n  border-top: 1px solid rgba(139, 92, 246, 0.2);\n}\n.scw-counter[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.scw-counter-dot[_ngcontent-%COMP%] {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.scw-counter-name[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  flex-shrink: 0;\n  min-width: 50px;\n}\n.scw-counter-btn[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.1);\n  color: #c4b5fd;\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  line-height: 1;\n  padding: 0;\n  font-family: inherit;\n}\n.scw-counter-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.25);\n}\n.scw-counter-val[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  min-width: 20px;\n  text-align: center;\n}\n.scw-counter-max[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.scw-counter-bar[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 60px;\n  height: 5px;\n  background: rgba(255, 255, 255, 0.08);\n  border-radius: 3px;\n  overflow: hidden;\n}\n.scw-counter-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.2s ease;\n}\n.cast-portal[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  z-index: 100;\n  background: rgba(4, 3, 12, 0.96);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: _ngcontent-%COMP%_portalFadeIn 0.25s ease;\n}\n.cast-portal[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      ellipse at 50% 50%,\n      color-mix(in srgb, var(--sc, #8b5cf6) 30%, transparent) 0%,\n      transparent 65%);\n  pointer-events: none;\n  z-index: 0;\n}\n@keyframes _ngcontent-%COMP%_portalFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.portal-rune-field[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  overflow: hidden;\n  z-index: 1;\n}\n.portal-rune[_ngcontent-%COMP%] {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: _ngcontent-%COMP%_runeOrbit linear infinite;\n  will-change: transform, opacity;\n}\n@keyframes _ngcontent-%COMP%_runeOrbit {\n  0% {\n    transform: translateY(0px) rotate(0deg) scale(1);\n  }\n  20% {\n    transform: translateY(-18px) rotate(8deg) scale(1.08);\n  }\n  45% {\n    transform: translateY(-10px) rotate(-5deg) scale(0.95);\n  }\n  70% {\n    transform: translateY(-24px) rotate(12deg) scale(1.05);\n  }\n  100% {\n    transform: translateY(0px) rotate(0deg) scale(1);\n  }\n}\n.portal-rune-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  border-radius: 8px;\n  animation: _ngcontent-%COMP%_runeImgPulse 4s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_runeImgPulse {\n  0%, 100% {\n    opacity: 0.85;\n  }\n  50% {\n    opacity: 1;\n  }\n}\n.portal-rune-glyph[_ngcontent-%COMP%] {\n  font-family: serif;\n  font-size: 1.6em;\n  -webkit-user-select: none;\n  user-select: none;\n  animation: _ngcontent-%COMP%_runeGlyphPulse 3.5s ease-in-out infinite;\n}\n@keyframes _ngcontent-%COMP%_runeGlyphPulse {\n  0%, 100% {\n    transform: scale(1);\n    opacity: 0.8;\n  }\n  50% {\n    transform: scale(1.15);\n    opacity: 1;\n  }\n}\n.cast-card[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 10;\n  width: min(700px, 92vw);\n  max-height: 88vh;\n  overflow-y: auto;\n  background: rgba(14, 10, 30, 0.92);\n  border-radius: 18px;\n  border: 1px solid rgba(255, 255, 255, 0.07);\n  box-shadow:\n    0 0 0 1px var(--sc, #8b5cf6),\n    0 0 60px rgba(0, 0, 0, 0.8),\n    inset 0 1px 0 rgba(255, 255, 255, 0.06);\n  animation: _ngcontent-%COMP%_cardEnter 0.35s cubic-bezier(0.22, 1, 0.36, 1);\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.cast-card[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n}\n.cast-card[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n@keyframes _ngcontent-%COMP%_cardEnter {\n  from {\n    opacity: 0;\n    transform: scale(0.88) translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.cast-card-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 20px 22px 16px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(255, 255, 255, 0.04) 0%,\n      transparent 100%);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n  border-radius: 18px 18px 0 0;\n}\n.cast-icon[_ngcontent-%COMP%] {\n  font-size: 2.4rem;\n  color: var(--sc, #8b5cf6);\n  text-shadow: 0 0 20px var(--sc, #8b5cf6), 0 0 40px var(--sc, #8b5cf6);\n  animation: _ngcontent-%COMP%_castIconBeat 2.5s ease-in-out infinite;\n  flex-shrink: 0;\n}\n@keyframes _ngcontent-%COMP%_castIconBeat {\n  0%, 100% {\n    text-shadow: 0 0 16px var(--sc, #8b5cf6), 0 0 40px var(--sc, #8b5cf6);\n  }\n  50% {\n    text-shadow:\n      0 0 28px var(--sc, #8b5cf6),\n      0 0 60px var(--sc, #8b5cf6),\n      0 0 100px var(--sc, #8b5cf6);\n  }\n}\n.cast-title-block[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  flex: 1;\n}\n.cast-type-label[_ngcontent-%COMP%] {\n  font-size: 0.66rem;\n  font-weight: 800;\n  letter-spacing: 0.14em;\n  color: var(--sc, #8b5cf6);\n  opacity: 0.8;\n  text-transform: uppercase;\n}\n.cast-spell-name[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: 800;\n  color: #f0f4ff;\n  letter-spacing: 0.02em;\n  line-height: 1.1;\n}\n.cast-close-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #6b7280;\n  width: 34px;\n  height: 34px;\n  border-radius: 8px;\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.cast-close-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.cast-desc[_ngcontent-%COMP%] {\n  padding: 14px 22px 8px;\n  font-size: 0.88rem;\n  color: #9ca3af;\n  line-height: 1.6;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n}\n.cast-reqs-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  padding: 10px 22px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n}\n.cast-req[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 3px 9px;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  transition: all 0.3s ease;\n  white-space: nowrap;\n}\n.cast-req--met[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.1);\n  border: 1px solid rgba(34, 197, 94, 0.4);\n  color: #86efac;\n}\n.cast-req--unmet[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.1);\n  border: 1px solid rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n}\n.cast-req-boost[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: #4ade80;\n  opacity: 0.85;\n}\n.cast-req-orig[_ngcontent-%COMP%] {\n  opacity: 0.55;\n  text-decoration: line-through;\n}\n.cast-req-arrow[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  opacity: 0.7;\n  margin: 0 1px;\n}\n.cast-req-effective[_ngcontent-%COMP%] {\n  font-weight: 800;\n  color: #4ade80;\n}\n.cast-controls[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 24px;\n  padding: 18px 22px 14px;\n}\n.cast-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.cast-col--left[_ngcontent-%COMP%] {\n  flex: 1.1;\n}\n.cast-col--right[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.cast-section-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  font-weight: 700;\n  letter-spacing: 0.1em;\n  color: rgba(156, 163, 175, 0.75);\n  text-transform: uppercase;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.cast-section-label--skal[_ngcontent-%COMP%] {\n  margin-top: 6px;\n}\n.cast-skal-val[_ngcontent-%COMP%] {\n  color: #fbbf24;\n  font-size: 0.8rem;\n}\n.cast-stars[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1px;\n}\n.cast-star[_ngcontent-%COMP%] {\n  color: #fbbf24;\n  font-size: 0.7rem;\n  text-shadow: 0 0 6px #fbbf24;\n  animation: _ngcontent-%COMP%_starPop 0.3s cubic-bezier(0.18, 1.4, 0.4, 1) both;\n}\n@keyframes _ngcontent-%COMP%_starPop {\n  from {\n    transform: scale(0);\n    opacity: 0;\n  }\n  to {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n.cast-slider-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.cast-slider[_ngcontent-%COMP%] {\n  -webkit-appearance: none;\n  appearance: none;\n  flex: 1;\n  height: 5px;\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.08);\n  outline: none;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.cast-slider[_ngcontent-%COMP%]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: var(--sc, #8b5cf6);\n  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 12px var(--sc, #8b5cf6);\n  cursor: pointer;\n  transition: transform 0.15s, box-shadow 0.15s;\n}\n.cast-slider[_ngcontent-%COMP%]::-webkit-slider-thumb:hover {\n  transform: scale(1.25);\n  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 22px var(--sc, #8b5cf6);\n}\n.cast-slider--cl[_ngcontent-%COMP%]::-webkit-slider-runnable-track {\n  background:\n    linear-gradient(\n      to right,\n      var(--sc, #8b5cf6) 0%,\n      var(--sc, #8b5cf6) calc(var(--pct, 0) * 1%),\n      rgba(255, 255, 255, 0.06) calc(var(--pct, 0) * 1%));\n}\n.cast-level-input[_ngcontent-%COMP%] {\n  width: 56px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 7px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  font-weight: 700;\n  padding: 4px 7px;\n  font-family: inherit;\n  text-align: center;\n  outline: none;\n}\n.cast-level-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--sc, #8b5cf6);\n}\n.cast-cl-markers[_ngcontent-%COMP%] {\n  position: relative;\n  height: 24px;\n  margin-top: -4px;\n}\n.cast-cl-marker[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n}\n.cast-cl-marker[_ngcontent-%COMP%]::before {\n  content: "";\n  width: 2px;\n  height: 8px;\n  background: #f59e0b;\n  border-radius: 1px;\n}\n.cast-cl-marker-label[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 700;\n  color: #f59e0b;\n  white-space: nowrap;\n  background: rgba(245, 158, 11, 0.1);\n  padding: 0px 3px;\n  border-radius: 3px;\n}\n.cast-estimate[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: -4px;\n}\n.cast-estimate-label[_ngcontent-%COMP%] {\n  font-size: 0.67rem;\n  color: #6b7280;\n}\n.cast-estimate-val[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #d1d5db;\n}\n.cast-res-bar-wrap[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-bottom: 4px;\n}\n.cast-res-bar[_ngcontent-%COMP%] {\n  position: relative;\n  height: 10px;\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.06);\n  overflow: hidden;\n}\n.cast-res-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 6px;\n  transition: width 0.35s ease;\n}\n.cast-res-bar--mana[_ngcontent-%COMP%]   .cast-res-fill[_ngcontent-%COMP%] {\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);\n}\n.cast-res-bar--fokus[_ngcontent-%COMP%]   .cast-res-fill[_ngcontent-%COMP%] {\n  box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);\n}\n.cast-res-cost-overlay[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  border-radius: 0 6px 6px 0;\n  transition: all 0.35s ease;\n}\n.cast-res-cost-overlay--mana[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.5);\n}\n.cast-res-cost-overlay--fokus[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.5);\n}\n.cast-res-labels[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  gap: 4px;\n}\n.cast-res-cur[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  font-weight: 700;\n}\n.cast-res-after[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  opacity: 0.75;\n}\n.cast-res-max[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #4b5563;\n  margin-left: auto;\n}\n.cast-res-cost-tag[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 700;\n  align-self: flex-end;\n  border-radius: 6px;\n  padding: 1px 7px;\n}\n.cast-res-cost-tag--mana[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.1);\n  color: #60a5fa;\n  border: 1px solid rgba(59, 130, 246, 0.25);\n}\n.cast-res-cost-tag--fokus[_ngcontent-%COMP%] {\n  background: rgba(109, 40, 217, 0.1);\n  color: #a78bfa;\n  border: 1px solid rgba(109, 40, 217, 0.25);\n}\n.cast-perturn-block[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 4px;\n}\n.cast-perturn-chip[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 700;\n  padding: 2px 7px;\n  border-radius: 5px;\n}\n.cast-perturn-chip--mana[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.1);\n  color: #60a5fa;\n  border: 1px solid rgba(59, 130, 246, 0.2);\n}\n.cast-perturn-chip--fokus[_ngcontent-%COMP%] {\n  background: rgba(109, 40, 217, 0.1);\n  color: #a78bfa;\n  border: 1px solid rgba(109, 40, 217, 0.2);\n}\n.cast-perturn-chip--dur[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.08);\n  color: #fbbf24;\n  border: 1px solid rgba(245, 158, 11, 0.18);\n}\n.cast-perturn-chip--eff[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.08);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.18);\n}\n.cast-skal-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 4px 0 8px;\n}\n.cast-skal-stat[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #a78bfa;\n  background: rgba(124, 58, 237, 0.1);\n  border: 1px solid rgba(124, 58, 237, 0.2);\n  border-radius: 4px;\n  padding: 2px 6px;\n}\n.cast-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding: 14px 22px 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.05);\n}\n.cast-cancel-btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border-radius: 9px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  background: transparent;\n  color: #6b7280;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n}\n.cast-cancel-btn[_ngcontent-%COMP%]:hover {\n  border-color: rgba(255, 255, 255, 0.22);\n  color: #d1d5db;\n}\n.cast-confirm-btn[_ngcontent-%COMP%] {\n  padding: 11px 28px;\n  border-radius: 9px;\n  border: 1px solid var(--sc, #8b5cf6);\n  background: rgba(139, 92, 246, 0.15);\n  color: #fff;\n  font-size: 0.95rem;\n  font-weight: 800;\n  letter-spacing: 0.06em;\n  cursor: pointer;\n  font-family: inherit;\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);\n  transition: all 0.2s;\n  animation: _ngcontent-%COMP%_confirmPulse 2.8s ease-in-out infinite;\n}\n.cast-confirm-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.3);\n  box-shadow: 0 0 0 1px var(--sc, #8b5cf6), 0 0 40px rgba(139, 92, 246, 0.4);\n  transform: scale(1.03);\n  animation: none;\n}\n@keyframes _ngcontent-%COMP%_confirmPulse {\n  0%, 100% {\n    box-shadow: 0 0 16px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);\n  }\n  50% {\n    box-shadow:\n      0 0 32px rgba(139, 92, 246, 0.5),\n      0 0 0 1px var(--sc, #8b5cf6),\n      inset 0 1px 0 rgba(255, 255, 255, 0.08);\n  }\n}\n.cast-confirm-backdrop[_ngcontent-%COMP%] {\n  display: none;\n}\n.cast-confirm-box[_ngcontent-%COMP%] {\n  display: none;\n}\n.cast-confirm-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.35;\n  cursor: not-allowed;\n  animation: none;\n  transform: none;\n  box-shadow: none;\n}\n.cast-skal-input[_ngcontent-%COMP%] {\n  width: 60px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 7px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  font-weight: 700;\n  padding: 4px 7px;\n  font-family: inherit;\n  text-align: center;\n  outline: none;\n  margin-top: 6px;\n}\n.cast-skal-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--sc, #8b5cf6);\n}\n.scw-skal-badge--prominent[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 800;\n  background: rgba(251, 191, 36, 0.2);\n  border: 1.5px solid rgba(251, 191, 36, 0.6);\n  color: #fbbf24;\n  border-radius: 7px;\n  padding: 2px 8px;\n  letter-spacing: 0.02em;\n  box-shadow: 0 0 8px rgba(251, 191, 36, 0.25);\n}\n.scw-cast-bonus-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 8px;\n  flex-shrink: 0;\n}\n.scw-cast-bonus-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  white-space: nowrap;\n}\n.scw-cast-bonus-input[_ngcontent-%COMP%] {\n  width: 60px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  font-weight: 700;\n  padding: 3px 7px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-cast-bonus-input[_ngcontent-%COMP%]:focus {\n  border-color: #8b5cf6;\n}\n.scw-cast-progress[_ngcontent-%COMP%] {\n  margin-top: 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 10px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.scw-cast-progress-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.scw-cast-progress-label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n.scw-cast-remaining-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.scw-cast-remaining-input[_ngcontent-%COMP%] {\n  width: 56px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.82rem;\n  font-weight: 700;\n  padding: 3px 6px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-cast-remaining-input[_ngcontent-%COMP%]:focus {\n  border-color: #8b5cf6;\n}\n.scw-cast-remaining-of[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.scw-cast-bar[_ngcontent-%COMP%] {\n  height: 8px;\n  background: rgba(255, 255, 255, 0.07);\n  border-radius: 4px;\n  overflow: hidden;\n}\n.scw-cast-bar-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background:\n    linear-gradient(\n      90deg,\n      #7c3aed,\n      #8b5cf6,\n      #a78bfa);\n  border-radius: 4px;\n  transition: width 0.3s ease;\n}\n.scw-roll-btn[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border-radius: 8px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.15);\n  color: #c4b5fd;\n  font-size: 0.8rem;\n  font-weight: 700;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n  align-self: flex-end;\n}\n.scw-roll-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.3);\n  border-color: #8b5cf6;\n  color: #fff;\n}\n.scw-round-counter[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 10px;\n  background: rgba(59, 130, 246, 0.08);\n  border: 1px solid rgba(59, 130, 246, 0.2);\n  border-radius: 10px;\n  padding: 8px 12px;\n}\n.scw-round-label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 700;\n  color: #93c5fd;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  flex: 1;\n}\n.scw-round-input[_ngcontent-%COMP%] {\n  width: 52px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(59, 130, 246, 0.3);\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.88rem;\n  font-weight: 700;\n  padding: 3px 6px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-round-input[_ngcontent-%COMP%]:focus {\n  border-color: #3b82f6;\n}\n.scw-round-of[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.scw-advance-btn[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 7px;\n  border: 1px solid rgba(59, 130, 246, 0.4);\n  background: rgba(59, 130, 246, 0.12);\n  color: #93c5fd;\n  font-size: 1rem;\n  font-weight: 700;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.scw-advance-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(59, 130, 246, 0.3);\n  border-color: #3b82f6;\n  color: #fff;\n}\n.scw-spell-finished[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  margin-top: 10px;\n  background: rgba(74, 222, 128, 0.07);\n  border: 1.5px solid rgba(74, 222, 128, 0.35);\n  border-radius: 10px;\n  padding: 8px 12px;\n}\n.scw-finished-badge[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 800;\n  color: #4ade80;\n  letter-spacing: 0.04em;\n}\n.scw-dismiss-btn[_ngcontent-%COMP%] {\n  padding: 5px 12px;\n  border-radius: 7px;\n  border: 1px solid rgba(74, 222, 128, 0.4);\n  background: rgba(74, 222, 128, 0.12);\n  color: #4ade80;\n  font-size: 0.78rem;\n  font-weight: 700;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n}\n.scw-dismiss-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(74, 222, 128, 0.3);\n  border-color: #4ade80;\n  color: #fff;\n}\n.scw-counter-input[_ngcontent-%COMP%] {\n  width: 46px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 5px;\n  color: #e5e7eb;\n  font-size: 0.82rem;\n  font-weight: 700;\n  padding: 2px 5px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-counter-input[_ngcontent-%COMP%]:focus {\n  border-color: rgba(139, 92, 246, 0.6);\n}\n.scw-skills-section[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.scw-panel-header--skills[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #a78bfa;\n  margin-bottom: 0.5rem;\n}\n.scw-skills-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n}\n.scw-skill-card[_ngcontent-%COMP%] {\n  position: relative;\n  background: rgba(167, 139, 250, 0.07);\n  border: 1px solid rgba(167, 139, 250, 0.2);\n  border-radius: 8px;\n  padding: 0.5rem 0.65rem;\n  cursor: pointer;\n  transition: border-color 0.2s, background 0.2s;\n  overflow: hidden;\n}\n.scw-skill-card[_ngcontent-%COMP%]:hover {\n  border-color: rgba(167, 139, 250, 0.45);\n  background: rgba(167, 139, 250, 0.13);\n}\n.scw-skill-card.is-active[_ngcontent-%COMP%] {\n  border-color: #a78bfa;\n  background: rgba(167, 139, 250, 0.18);\n  box-shadow: 0 0 10px rgba(167, 139, 250, 0.25);\n}\n.scw-skill-glow[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      ellipse at 50% 0%,\n      rgba(167, 139, 250, 0.1) 0%,\n      transparent 70%);\n  pointer-events: none;\n}\n.scw-skill-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.scw-skill-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.15);\n  border-radius: 4px;\n  padding: 1px 5px;\n  min-width: 22px;\n  text-align: center;\n}\n.scw-skill-name[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: #e5e7eb;\n  flex: 1;\n}\n.scw-skill-desc[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #9ca3af;\n  margin-top: 0.25rem;\n  line-height: 1.3;\n}\n.scw-skill-footer[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.35rem;\n  margin-top: 0.3rem;\n  flex-wrap: wrap;\n}\n.scw-skill-tag[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  background: rgba(255, 255, 255, 0.07);\n  border-radius: 4px;\n  padding: 1px 6px;\n  color: #9ca3af;\n}\n.scw-cost-chip--skill[_ngcontent-%COMP%] {\n  background: rgba(167, 139, 250, 0.18);\n  color: #a78bfa;\n  border: 1px solid rgba(167, 139, 250, 0.3);\n  font-size: 0.65rem;\n  border-radius: 4px;\n  padding: 1px 6px;\n}\n.scw-active-skills-section[_ngcontent-%COMP%] {\n  margin-top: 0.75rem;\n  padding-top: 0.75rem;\n  border-top: 1px solid rgba(167, 139, 250, 0.15);\n}\n.scw-active-skills-label[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #a78bfa;\n  margin-bottom: 0.5rem;\n}\n.scw-active-skill-card[_ngcontent-%COMP%] {\n  background: rgba(167, 139, 250, 0.1);\n  border: 1px solid rgba(167, 139, 250, 0.35);\n  border-radius: 8px;\n  padding: 0.5rem 0.65rem;\n  margin-bottom: 0.4rem;\n}\n.scw-active-cost[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.15);\n  border-radius: 4px;\n  padding: 1px 6px;\n}\n.scw-left-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  margin-bottom: 0.75rem;\n  gap: 2px;\n}\n.scw-left-tab[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.45rem 0.5rem;\n  background: transparent;\n  border: none;\n  border-bottom: 2px solid transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.8rem;\n  cursor: pointer;\n  transition: color 0.15s, border-color 0.15s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.35rem;\n}\n.scw-left-tab.active[_ngcontent-%COMP%] {\n  color: #a78bfa;\n  border-bottom-color: #8b5cf6;\n}\n.scw-left-tab[_ngcontent-%COMP%]:hover:not(.active) {\n  color: var(--text, #e5e7eb);\n}\n.scw-left-tab-count[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 9px;\n  padding: 0 5px;\n  font-size: 0.7rem;\n}\n.scw-skill-search-row[_ngcontent-%COMP%] {\n  margin-bottom: 0.6rem;\n}\n.scw-skill-search[_ngcontent-%COMP%] {\n  width: 100%;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 6px;\n  padding: 0.4rem 0.7rem;\n  color: var(--text, #e5e7eb);\n  font-size: 0.82rem;\n  outline: none;\n  box-sizing: border-box;\n}\n.scw-skill-search[_ngcontent-%COMP%]:focus {\n  border-color: rgba(139, 92, 246, 0.5);\n}\n.scw-spell-card--skill[_ngcontent-%COMP%] {\n  --sc: #22c55e;\n  border-color: rgba(34, 197, 94, 0.25);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(34, 197, 94, 0.05) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n}\n.scw-spell-card--skill.is-casting[_ngcontent-%COMP%] {\n  border-color: rgba(34, 197, 94, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(34, 197, 94, 0.14) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(34, 197, 94, 0.18);\n}\n.scw-spell-card--skill[data-action=Aktion][_ngcontent-%COMP%] {\n  --sc: #f59e0b;\n  border-color: rgba(245, 158, 11, 0.3);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(245, 158, 11, 0.06) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(245, 158, 11, 0.5);\n}\n.scw-spell-card--skill[data-action=Aktion].is-casting[_ngcontent-%COMP%] {\n  border-color: rgba(245, 158, 11, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(245, 158, 11, 0.15) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);\n}\n.scw-spell-card--skill[data-action=Bonusaktion][_ngcontent-%COMP%] {\n  --sc: #a78bfa;\n  border-color: rgba(167, 139, 250, 0.3);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(167, 139, 250, 0.06) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(167, 139, 250, 0.5);\n}\n.scw-spell-card--skill[data-action=Bonusaktion].is-casting[_ngcontent-%COMP%] {\n  border-color: rgba(167, 139, 250, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(167, 139, 250, 0.15) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(167, 139, 250, 0.2);\n}\n.scw-spell-card--skill[data-action=Reaktion][_ngcontent-%COMP%] {\n  --sc: #38bdf8;\n  border-color: rgba(56, 189, 248, 0.3);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(56, 189, 248, 0.06) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(56, 189, 248, 0.5);\n}\n.scw-spell-card--skill[data-action=Reaktion].is-casting[_ngcontent-%COMP%] {\n  border-color: rgba(56, 189, 248, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(56, 189, 248, 0.15) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);\n}\n.scw-spell-card--skill[data-action="Keine Aktion"][_ngcontent-%COMP%] {\n  --sc: #9ca3af;\n  border-color: rgba(156, 163, 175, 0.22);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(156, 163, 175, 0.04) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(156, 163, 175, 0.35);\n}\n.scw-skill-action-badge[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 3px;\n  flex-shrink: 0;\n  white-space: nowrap;\n  background: rgba(245, 158, 11, 0.16);\n  color: #f59e0b;\n  border: 1px solid rgba(245, 158, 11, 0.3);\n}\n.scw-skill-action-badge[data-action=Bonusaktion][_ngcontent-%COMP%] {\n  background: rgba(167, 139, 250, 0.16);\n  color: #a78bfa;\n  border-color: rgba(167, 139, 250, 0.3);\n}\n.scw-skill-action-badge[data-action=Reaktion][_ngcontent-%COMP%] {\n  background: rgba(56, 189, 248, 0.16);\n  color: #38bdf8;\n  border-color: rgba(56, 189, 248, 0.3);\n}\n.scw-skill-action-badge[data-action="Keine Aktion"][_ngcontent-%COMP%] {\n  background: rgba(156, 163, 175, 0.12);\n  color: #9ca3af;\n  border-color: rgba(156, 163, 175, 0.25);\n}\n.scw-spell-action-type[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: #fbbf24;\n  background: rgba(251, 191, 36, 0.1);\n  border-radius: 3px;\n  padding: 1px 5px;\n  margin-bottom: 0.25rem;\n  display: inline-block;\n}\n.scw-cost-chip--energy[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.15);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.3);\n  font-size: 0.72rem;\n  border-radius: 4px;\n  padding: 2px 6px;\n}\n.scw-cost-chip--life[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.15);\n  color: #f87171;\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  font-size: 0.72rem;\n  border-radius: 4px;\n  padding: 2px 6px;\n}\n.scw-active-type-badge[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 700;\n  border-radius: 3px;\n  padding: 1px 5px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.scw-active-type-badge--spell[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  color: #a78bfa;\n  border: 1px solid rgba(139, 92, 246, 0.35);\n}\n.scw-active-type-badge--skill[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.2);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.35);\n}\n.scw-active-type-badge--skill[data-action=Aktion][_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.2);\n  color: #f59e0b;\n  border: 1px solid rgba(245, 158, 11, 0.35);\n}\n.scw-active-type-badge--skill[data-action=Bonusaktion][_ngcontent-%COMP%] {\n  background: rgba(167, 139, 250, 0.2);\n  color: #a78bfa;\n  border: 1px solid rgba(167, 139, 250, 0.35);\n}\n.scw-active-type-badge--skill[data-action=Reaktion][_ngcontent-%COMP%] {\n  background: rgba(56, 189, 248, 0.2);\n  color: #38bdf8;\n  border: 1px solid rgba(56, 189, 248, 0.35);\n}\n.scw-active-type-badge--skill[data-action="Keine Aktion"][_ngcontent-%COMP%] {\n  background: rgba(156, 163, 175, 0.15);\n  color: #9ca3af;\n  border: 1px solid rgba(156, 163, 175, 0.25);\n}\n.scw-active-card--skill[_ngcontent-%COMP%] {\n  --sc: #22c55e;\n  border-color: rgba(34, 197, 94, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(34, 197, 94, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action=Aktion][_ngcontent-%COMP%] {\n  --sc: #f59e0b;\n  border-color: rgba(245, 158, 11, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(245, 158, 11, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action=Bonusaktion][_ngcontent-%COMP%] {\n  --sc: #a78bfa;\n  border-color: rgba(167, 139, 250, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(167, 139, 250, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action=Reaktion][_ngcontent-%COMP%] {\n  --sc: #38bdf8;\n  border-color: rgba(56, 189, 248, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(56, 189, 248, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action="Keine Aktion"][_ngcontent-%COMP%] {\n  --sc: #9ca3af;\n  border-color: rgba(156, 163, 175, 0.25);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(156, 163, 175, 0.05) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-skill-modifiers[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  padding: 2px 0 2px 2px;\n}\n.scw-skill-mod[_ngcontent-%COMP%] {\n  font-size: 9px;\n  font-weight: 700;\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: rgba(100, 116, 139, 0.15);\n  color: #64748b;\n  border: 1px solid rgba(100, 116, 139, 0.2);\n}\n.scw-skill-mod.positive[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.12);\n  color: #4ade80;\n  border-color: rgba(34, 197, 94, 0.25);\n}\n.scw-skill-mod.negative[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.12);\n  color: #f87171;\n  border-color: rgba(239, 68, 68, 0.25);\n}\n.scw-active-dismiss-row[_ngcontent-%COMP%] {\n  padding: 4px 0 0;\n}\n.scw-dismiss-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 5px 10px;\n  background: rgba(34, 197, 94, 0.1);\n  border: 1px solid rgba(34, 197, 94, 0.3);\n  border-radius: 5px;\n  color: #4ade80;\n  font-size: 11px;\n  font-weight: 700;\n  cursor: pointer;\n  transition: background 0.15s, border-color 0.15s;\n}\n.scw-dismiss-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(34, 197, 94, 0.2);\n  border-color: rgba(34, 197, 94, 0.5);\n}\n.scw-active-meta-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 2px 0;\n  font-size: 10px;\n  color: #6b7280;\n}\n/*# sourceMappingURL=spellcast-window.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SpellcastWindowComponent, [{
    type: Component,
    args: [{ selector: "app-spellcast-window", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="scw-overlay" (click)="$event.stopPropagation()">\r
\r
  <!-- Ambient floating runes -->\r
  <div class="scw-rune-field" aria-hidden="true">\r
    @for (rune of floatingRunes; track rune.id) {\r
      <span class="scw-rune-glyph"\r
            [style.left.%]="rune.x"\r
            [style.top.%]="rune.y"\r
            [style.font-size.px]="rune.size"\r
            [style.opacity]="rune.opacity"\r
            [style.color]="rune.color"\r
            [style.animation-duration.s]="rune.speed"\r
            [style.animation-delay.s]="rune.delay">{{ rune.symbol }}</span>\r
    }\r
  </div>\r
\r
  <!-- Header -->\r
  <div class="scw-header">\r
    <div class="scw-header-left">\r
      <span class="scw-title"><span class="app-icon i-spell"></span> Zauber und F\xE4higkeiten</span>\r
      @if (sheet.name) {\r
        <span class="scw-char-name">{{ sheet.name }}</span>\r
      }\r
    </div>\r
\r
    <!-- Resources -->\r
    <div class="scw-resources">\r
      <div class="scw-res-block">\r
        <span class="scw-res-label">Leben</span>\r
        <div class="scw-res-bar">\r
          <div class="scw-res-fill scw-res-fill--leben" [style.width.%]="lebenPercent"></div>\r
        </div>\r
        <span class="scw-res-val">{{ lebenCurrent }} / {{ lebenMax }}</span>\r
      </div>\r
      <div class="scw-res-block">\r
        <span class="scw-res-label">Ausdauer</span>\r
        <div class="scw-res-bar">\r
          <div class="scw-res-fill scw-res-fill--ausdauer" [style.width.%]="ausdauerPercent"></div>\r
        </div>\r
        <span class="scw-res-val">{{ ausdauerCurrent }} / {{ ausdauerMax }}</span>\r
      </div>\r
      <div class="scw-res-block">\r
        <span class="scw-res-label">Mana</span>\r
        <div class="scw-res-bar">\r
          <div class="scw-res-fill scw-res-fill--mana" [style.width.%]="manaPercent"></div>\r
        </div>\r
        <span class="scw-res-val">{{ manaCurrent }} / {{ manaMax }}</span>\r
      </div>\r
      <div class="scw-res-block">\r
        <span class="scw-res-label">Fokus</span>\r
        <div class="scw-res-bar">\r
          <div class="scw-res-fill scw-res-fill--fokus" [style.width.%]="fokusAvailPercent"></div>\r
        </div>\r
        <span class="scw-res-val">{{ fokusAvailable }} / {{ fokusMax }}</span>\r
      </div>\r
    </div>\r
\r
    <button class="scw-close-btn" (click)="close.emit()" title="Schlie\xDFen (Esc)">\u2715</button>\r
  </div>\r
\r
  <!-- Body -->\r
  <div class="scw-body">\r
\r
    <!-- Left: Tabbed panel (Zauber | F\xE4higkeiten) -->\r
    <div class="scw-panel scw-panel--available">\r
\r
      <!-- Tab bar -->\r
      <div class="scw-left-tabs">\r
        <button class="scw-left-tab" [class.active]="leftTab === 'spells'" (click)="setLeftTab('spells')">\r
          <span class="app-icon i-spell"></span> Zauber <span class="scw-left-tab-count">{{ availableSpells.length }}</span>\r
        </button>\r
        <button class="scw-left-tab" [class.active]="leftTab === 'skills'" (click)="setLeftTab('skills')">\r
          <span class="app-icon i-ability"></span> F\xE4higkeiten <span class="scw-left-tab-count">{{ availableSkills.length }}</span>\r
        </button>\r
      </div>\r
\r
      <!-- Spells tab content -->\r
      @if (leftTab === 'spells') {\r
        @if (availableSpells.length === 0) {\r
          <div class="scw-empty">Keine Zauber vorhanden.</div>\r
        } @else {\r
          <div class="scw-spell-grid">\r
            @for (spell of availableSpells; track spell.id) {\r
              <div class="scw-spell-card"\r
                   [class.is-casting]="isActivelyCasting(spell)"\r
                   [style.--sc]="spellColor(spell)"\r
                   (click)="requestCast(spell)"\r
                   [title]="'Klicken zum Wirken: ' + spell.name">\r
                <div class="scw-spell-glow"></div>\r
\r
                <!-- Card header -->\r
                <div class="scw-card-head">\r
                  <span class="scw-spell-icon">{{ spell.icon || '\u2726' }}</span>\r
                  <span class="scw-spell-name">{{ spell.name }}</span>\r
                  @if (isActivelyCasting(spell)) {\r
                    <span class="scw-active-badge">Aktiv</span>\r
                  }\r
                </div>\r
\r
                <!-- Description (short) -->\r
                @if (spell.description) {\r
                  <div class="scw-spell-desc-short" [innerHTML]="enhancedSpellDesc(spell)"></div>\r
                }\r
\r
                <!-- Stat requirements -->\r
                @if (spellStatReqs(spell).length > 0) {\r
                  <div class="scw-spell-reqs-row">\r
                    @for (req of spellStatReqs(spell); track req.label) {\r
                      <span class="scw-spell-req"\r
                            [class.scw-spell-req--unmet]="!spellMeetsStat(req.key, req.value)">\r
                        {{ req.label }}&nbsp;{{ req.value }}\r
                      </span>\r
                    }\r
                  </div>\r
                }\r
\r
                <!-- Cost footer -->\r
                <div class="scw-card-footer">\r
                  <div class="scw-card-costs">\r
                    @if (spell.costMana) {\r
                      <span class="scw-cost-chip scw-cost-chip--mana">\u25C6&nbsp;{{ spell.costMana }}</span>\r
                    }\r
                    @if (spell.costFokus) {\r
                      <span class="scw-cost-chip scw-cost-chip--fokus">\u25C6&nbsp;{{ spell.costFokus }}</span>\r
                    }\r
                    @if (!spell.costMana && !spell.costFokus) {\r
                      <span class="scw-cost-chip scw-cost-chip--free">Kostenlos</span>\r
                    }\r
                  </div>\r
                  <div class="scw-card-meta">\r
                    @if (spell.perTurnMana || spell.perTurnFokus) {\r
                      <span class="scw-card-perturn">/Rd</span>\r
                    }\r
                    @if (spell.durationTurns) {\r
                      <span class="scw-card-dur">\u29D7{{ spell.durationTurns }}</span>\r
                    }\r
                  </div>\r
                </div>\r
\r
                <!-- Tags -->\r
                @if (spell.tags && spell.tags.length > 0) {\r
                  <div class="scw-spell-tags">\r
                    @for (tag of spell.tags; track tag) {\r
                      <span class="scw-tag">{{ tag }}</span>\r
                    }\r
                  </div>\r
                }\r
              </div>\r
            }\r
          </div>\r
        }\r
      }\r
\r
      <!-- Skills tab content -->\r
      @if (leftTab === 'skills') {\r
        <!-- Search bar -->\r
        <div class="scw-skill-search-row">\r
          <input class="scw-skill-search"\r
                 type="text"\r
                 placeholder="F\xE4higkeit suchen..."\r
                 [(ngModel)]="skillSearchText" />\r
        </div>\r
\r
        @if (availableSkills.length === 0) {\r
          <div class="scw-empty">Keine aktiven F\xE4higkeiten vorhanden.</div>\r
        } @else if (filteredAvailableSkills.length === 0) {\r
          <div class="scw-empty">Keine F\xE4higkeiten gefunden.</div>\r
        } @else {\r
          <div class="scw-spell-grid">\r
            @for (skill of filteredAvailableSkills; track skill.name) {\r
              <div class="scw-spell-card scw-spell-card--skill"\r
                   [class.is-casting]="isSkillActive(skill)"\r
                   [attr.data-action]="effectiveActionType(skill) || 'Aktion'"\r
                   (click)="toggleActiveSkill(skill)"\r
                   [title]="skill.description || skill.name">\r
                <div class="scw-spell-glow"></div>\r
\r
                <div class="scw-card-head">\r
                  <span class="scw-spell-icon">{{ skill.name.charAt(0).toUpperCase() }}</span>\r
                  <span class="scw-spell-name">{{ skill.name }}</span>\r
                  @if (effectiveActionType(skill); as at) {\r
                    <span class="scw-skill-action-badge" [attr.data-action]="at">{{ at }}</span>\r
                  }\r
                </div>\r
\r
                @if (skill.description) {\r
                  <div class="scw-spell-desc-short">{{ skill.description }}</div>\r
                }\r
\r
                <div class="scw-card-footer">\r
                  <div class="scw-card-costs">\r
                    @if (skill.cost) {\r
                      @if (skill.cost.type === 'mana') {\r
                        <span class="scw-cost-chip scw-cost-chip--mana">\u25C6&nbsp;{{ skill.cost.amount }}{{ skill.cost.perRound ? '/Rd' : '' }}</span>\r
                      } @else if (skill.cost.type === 'energy') {\r
                        <span class="scw-cost-chip scw-cost-chip--energy"><span class="app-icon i-energy"></span>&nbsp;{{ skill.cost.amount }}{{ skill.cost.perRound ? '/Rd' : '' }}</span>\r
                      } @else {\r
                        <span class="scw-cost-chip scw-cost-chip--life"><span class="app-icon i-life"></span>&nbsp;{{ skill.cost.amount }}{{ skill.cost.perRound ? '/Rd' : '' }}</span>\r
                      }\r
                    } @else {\r
                      <span class="scw-cost-chip scw-cost-chip--free">Kostenlos</span>\r
                    }\r
                  </div>\r
                  @if (skill.class) {\r
                    <div class="scw-card-meta">\r
                      <span class="scw-tag">{{ skill.class }}</span>\r
                    </div>\r
                  }\r
                </div>\r
              </div>\r
            }\r
          </div>\r
        }\r
      }\r
\r
    </div>\r
\r
    <!-- Divider -->\r
    <div class="scw-divider">\r
      <div class="scw-divider-line"></div>\r
      <span class="scw-divider-rune">\u16CA</span>\r
      <div class="scw-divider-line"></div>\r
    </div>\r
\r
    <!-- Right: Merged active spells + active skills in one column -->\r
    <div class="scw-panel scw-panel--active">\r
      <div class="scw-panel-header">Aktive Zauber &amp; F\xE4higkeiten</div>\r
\r
      <!-- Cast Bonus (saved on sheet) -->\r
      <div class="scw-cast-bonus-row">\r
        <label class="scw-cast-bonus-label">Wirk-Bonus</label>\r
        <input class="scw-cast-bonus-input"\r
               type="number"\r
               [ngModel]="castBonus"\r
               (ngModelChange)="setCastBonus($event)"\r
               title="Wird zu jedem Wirk-W\xFCrfelwurf addiert" />\r
      </div>\r
\r
      <div class="scw-active-scroll">\r
        @if (castingSpells.length === 0 && activeSkillsList.length === 0) {\r
          <div class="scw-empty">Nichts aktiv.<br><span class="scw-empty-hint">Klicke einen Zauber oder eine F\xE4higkeit an.</span></div>\r
        }\r
\r
        <!-- Active Spells -->\r
        @if (castingSpells.length > 0) {\r
          <div class="scw-active-list">\r
            @for (entry of castingSpells; track (entry.entryId ?? entry.spellId)) {\r
              <div class="scw-active-card"\r
                   [style.--sc]="getSpell(entry.spellId) ? spellColor(getSpell(entry.spellId)!) : '#8b5cf6'">\r
                <div class="scw-active-glow"></div>\r
                <div class="scw-active-header">\r
                  <span class="scw-active-type-badge scw-active-type-badge--spell">Zauber</span>\r
                  <span class="scw-active-icon">{{ getSpell(entry.spellId)?.icon || '\u2726' }}</span>\r
                  <span class="scw-active-name">{{ entry.spellName }}</span>\r
                  @if (entry.skalierung && entry.skalierung > 1) {\r
                    <span class="scw-skal-badge scw-skal-badge--prominent">\u2726 \xD7{{ entry.skalierung }}</span>\r
                  }\r
                  <button class="scw-stop-btn" (click)="stopCasting(entry)" title="Beenden">\u2715</button>\r
                </div>\r
                @if (getSpell(entry.spellId); as spell) {\r
                  @if (spell.description) {\r
                    <div class="scw-active-desc" [innerHTML]="enhancedSpellDesc(spell)"></div>\r
                  }\r
                  @if (costLabel(spell); as cl) {\r
                    <div class="scw-active-startcost"><span class="app-icon i-energy"></span> Einmalig: {{ cl }}</div>\r
                  }\r
                  @if (perTurnLabel(spell); as ptl) {\r
                    <div class="scw-active-cost">{{ ptl }}</div>\r
                  }\r
                  @if (spell.counters && spell.counters.length > 0) {\r
                    <div class="scw-counter-list">\r
                      @for (counter of spell.counters; track counter.id; let ci = $index) {\r
                        <div class="scw-counter">\r
                          <span class="scw-counter-name">{{ counter.name }}</span>\r
                          <button class="scw-counter-btn" (click)="adjustCounter(entry.spellId, ci, counter.current - 1)">\u2212</button>\r
                          <input class="scw-counter-input"\r
                                 type="number"\r
                                 [ngModel]="counter.current"\r
                                 (ngModelChange)="adjustCounter(entry.spellId, ci, $event)" />\r
                          <button class="scw-counter-btn" (click)="adjustCounter(entry.spellId, ci, counter.current + 1)">+</button>\r
                          <span class="scw-counter-max">/ {{ counter.max }}</span>\r
                          <div class="scw-counter-bar">\r
                            <div class="scw-counter-fill"\r
                                 [style.width.%]="counter.max > counter.min ? ((counter.current - counter.min) / (counter.max - counter.min)) * 100 : 0"\r
                                 [style.backgroundColor]="counter.color"></div>\r
                          </div>\r
                        </div>\r
                      }\r
                    </div>\r
                  }\r
                }\r
\r
                <!-- Cast progress (while remainingCast > 0) -->\r
                @if (entry.remainingCast > 0) {\r
                  <div class="scw-cast-progress">\r
                    <div class="scw-cast-progress-header">\r
                      <span class="scw-cast-progress-label">Wirken...</span>\r
                      <div class="scw-cast-remaining-row">\r
                        <input class="scw-cast-remaining-input"\r
                               type="number"\r
                               min="0"\r
                               [ngModel]="entry.remainingCast"\r
                               (ngModelChange)="setRemainingCast(entry, $event)" />\r
                        <span class="scw-cast-remaining-of">/ {{ entry.castLevel }}</span>\r
                      </div>\r
                    </div>\r
                    <div class="scw-cast-bar">\r
                      <div class="scw-cast-bar-fill" [style.width.%]="castProgressPercent(entry)"></div>\r
                    </div>\r
                    @if (reductionLabel(entry.castLevel); as red) {\r
                      <div class="scw-reduction">{{ red }}</div>\r
                    }\r
                    <button class="scw-roll-btn" (click)="rollCast(entry)"><span class="app-icon i-dice"></span> W20 W\xFCrfeln</button>\r
                  </div>\r
                }\r
\r
                <!-- Round counter (spell active) -->\r
                @if (entry.remainingCast <= 0 && !isSpellFinished(entry)) {\r
                  <div class="scw-round-counter">\r
                    <span class="scw-round-label">Runde</span>\r
                    <input class="scw-round-input"\r
                           type="number"\r
                           min="0"\r
                           [ngModel]="entry.roundsActive ?? 0"\r
                           (ngModelChange)="setRoundsActive(entry, $event)" />\r
                    @if (entryScaledHaltbarkeit(entry); as dur) {\r
                      @if (dur > 0) {\r
                        <span class="scw-round-of">/ {{ dur }}</span>\r
                      }\r
                    }\r
                    <button class="scw-advance-btn" (click)="advanceRound(entry)" title="Runde voranbringen">+</button>\r
                  </div>\r
                }\r
\r
                <!-- Finished / expired state -->\r
                @if (isSpellFinished(entry)) {\r
                  <div class="scw-spell-finished">\r
                    <span class="scw-finished-badge">\u2713 Beendet</span>\r
                    <button class="scw-dismiss-btn" (click)="stopCasting(entry)">Entlassen</button>\r
                  </div>\r
                }\r
              </div>\r
            }\r
          </div>\r
        }\r
\r
        <!-- Active Skills (merged in same column) -->\r
        @if (activeSkillsList.length > 0) {\r
          <div class="scw-active-list">\r
            @for (skill of activeSkillsList; track skill.name) {\r
              <div class="scw-active-card scw-active-card--skill"\r
                   [attr.data-action]="effectiveActionType(skill) || 'Aktion'">\r
                <div class="scw-active-glow"></div>\r
                <div class="scw-active-header">\r
                  @if (effectiveActionType(skill); as at) {\r
                    <span class="scw-active-type-badge scw-active-type-badge--skill" [attr.data-action]="at">{{ at }}</span>\r
                  } @else {\r
                    <span class="scw-active-type-badge scw-active-type-badge--skill">F\xE4higkeit</span>\r
                  }\r
                  <span class="scw-active-icon">{{ skill.name.charAt(0).toUpperCase() }}</span>\r
                  <span class="scw-active-name">{{ skill.name }}</span>\r
                  <button class="scw-stop-btn" (click)="toggleActiveSkill(skill)" title="Deaktivieren">\u2715</button>\r
                </div>\r
                @if (skill.description) {\r
                  <div class="scw-active-desc">{{ skill.description }}</div>\r
                }\r
                @if (effectiveCost(skill); as cost) {\r
                  <div class="scw-active-meta-row">\r
                    <span class="scw-active-startcost">{{ skillCostLabel(skill) }}{{ cost.perRound ? '/Runde' : '' }}</span>\r
                    @if (cost.perRound) {\r
                      <button class="scw-pay-cost-btn" (click)="paySkillRoundCost(skill)" title="Rundenkosten zahlen"><span class="app-icon i-energy"></span> Zahlen</button>\r
                    }\r
                  </div>\r
                }\r
                @if (skill.statModifiers && skill.statModifiers.length > 0) {\r
                  <div class="scw-skill-modifiers">\r
                    @for (mod of skill.statModifiers; track $index) {\r
                      <span class="scw-skill-mod" [class.positive]="mod.amount > 0" [class.negative]="mod.amount < 0">\r
                        {{ mod.stat.slice(0, 3).toUpperCase() }} {{ mod.amount > 0 ? '+' : '' }}{{ mod.amount }}\r
                      </span>\r
                    }\r
                  </div>\r
                }\r
                @if (!effectiveCost(skill)?.perRound) {\r
                  <div class="scw-active-dismiss-row">\r
                    <button class="scw-dismiss-btn" (click)="toggleActiveSkill(skill)">Entlassen</button>\r
                  </div>\r
                }\r
                @if (skill.counters && skill.counters.length > 0) {\r
                  <div class="scw-counter-list">\r
                    @for (counter of skill.counters; track counter.id; let ci = $index) {\r
                      <div class="scw-counter">\r
                        <span class="scw-counter-name">{{ counter.name }}</span>\r
                        <button class="scw-counter-btn" (click)="adjustSkillCounter(skill.name, ci, counter.current - 1)">\u2212</button>\r
                        <input class="scw-counter-input"\r
                               type="number"\r
                               [ngModel]="counter.current"\r
                               (ngModelChange)="adjustSkillCounter(skill.name, ci, $event)" />\r
                        <button class="scw-counter-btn" (click)="adjustSkillCounter(skill.name, ci, counter.current + 1)">+</button>\r
                        <span class="scw-counter-max">/ {{ counter.max }}</span>\r
                        <div class="scw-counter-bar">\r
                          <div class="scw-counter-fill"\r
                               [style.width.%]="counter.max > counter.min ? ((counter.current - counter.min) / (counter.max - counter.min)) * 100 : 0"\r
                               [style.backgroundColor]="counter.color"></div>\r
                        </div>\r
                      </div>\r
                    }\r
                  </div>\r
                }\r
              </div>\r
            }\r
          </div>\r
        }\r
      </div>\r
    </div>\r
\r
  </div>\r
\r
  <!-- \u2500\u2500 Cast confirmation popup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
  @if (showCastConfirm && pendingCastSpell) {\r
    <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 EPIC CAST PORTAL \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\r
    <div class="cast-portal" [style.--sc]="spellColor(pendingCastSpell)" (click)="cancelCast()">\r
\r
      <!-- Floating rune field (background) -->\r
      <div class="portal-rune-field">\r
        @for (rune of portalRunes; track rune.id) {\r
          <div class="portal-rune"\r
               [style.left.%]="rune.x"\r
               [style.top.%]="rune.y"\r
               [style.width.px]="rune.size"\r
               [style.height.px]="rune.size"\r
               [style.animationDuration.s]="rune.speed"\r
               [style.animationDelay.s]="rune.delay"\r
               [style.opacity]="rune.opacity">\r
            @if (rune.drawing) {\r
              <img class="portal-rune-img"\r
                   [src]="rune.drawing"\r
                   [style.filter]="'drop-shadow(0 0 8px ' + rune.color + ') drop-shadow(0 0 20px ' + rune.color + '66)'"\r
                   [alt]="rune.symbol" />\r
            } @else {\r
              <span class="portal-rune-glyph"\r
                    [style.color]="rune.color"\r
                    [style.textShadow]="'0 0 12px ' + rune.color + ', 0 0 30px ' + rune.color + '88'">\r
                {{ rune.symbol }}\r
              </span>\r
            }\r
          </div>\r
        }\r
      </div>\r
\r
      <!-- Central cast card (click does NOT bubble to backdrop) -->\r
      <div class="cast-card" (click)="$event.stopPropagation()">\r
\r
        <!-- Header -->\r
        <div class="cast-card-head" [style.--sc]="spellColor(pendingCastSpell)">\r
          <span class="cast-icon">{{ pendingCastSpell.icon || '\u2726' }}</span>\r
          <div class="cast-title-block">\r
            <span class="cast-type-label">ZAUBER</span>\r
            <span class="cast-spell-name">{{ pendingCastSpell.name }}</span>\r
          </div>\r
          <button class="cast-close-btn" (click)="cancelCast()" title="Schlie\xDFen">\u2715</button>\r
        </div>\r
\r
        <!-- Description -->\r
        @if (pendingCastSpell.description) {\r
          <div class="cast-desc" [innerHTML]="enhancedSpellDesc(pendingCastSpell)"></div>\r
        }\r
\r
        <!-- Stat requirements -->\r
        @if (spellStatReqs(pendingCastSpell).length > 0) {\r
          <div class="cast-reqs-row">\r
            @for (req of spellStatReqs(pendingCastSpell); track req.label) {\r
              <span class="cast-req"\r
                    [class.cast-req--met]="castLevelMeetsReq(req.key, req.value)"\r
                    [class.cast-req--unmet]="!castLevelMeetsReq(req.key, req.value)">\r
                {{ req.label }}&nbsp;\r
                @if (castLevelReducedReq(req.value) < req.value) {\r
                  <span class="cast-req-orig">{{ req.value }}</span>\r
                  <span class="cast-req-arrow">\u2192</span>\r
                  <span class="cast-req-effective">{{ castLevelReducedReq(req.value) }}</span>\r
                } @else {\r
                  {{ req.value }}\r
                }\r
              </span>\r
            }\r
          </div>\r
        }\r
\r
        <!-- Two-column controls -->\r
        <div class="cast-controls">\r
\r
          <!-- LEFT: Sliders -->\r
          <div class="cast-col cast-col--left">\r
\r
            <!-- Cast Level (longer activation = lower mana cost & stat reqs via 100/(Cast+100)) -->\r
            <div class="cast-section-label">\r
              Cast-Level\r
              @if (reductionLabel(pendingCastLevel); as red) {\r
                <span class="cast-skal-val">{{ red }}</span>\r
              }\r
            </div>\r
            <div class="cast-slider-row">\r
              <input class="cast-slider cast-slider--cl"\r
                     type="range"\r
                     [style.--sc]="spellColor(pendingCastSpell)"\r
                     [style.--pct]="castLevelSliderMax > 0 ? (pendingCastLevel / castLevelSliderMax * 100) : 0"\r
                     min="0" [max]="castLevelSliderMax" step="1"\r
                     [ngModel]="pendingCastLevel"\r
                     (input)="onCastLevelChange($any($event.target).value)"\r
                     (ngModelChange)="onCastLevelChange($event)" />\r
              <input class="cast-level-input"\r
                     type="number"\r
                     min="0" step="1"\r
                     [ngModel]="pendingCastLevel"\r
                     (ngModelChange)="onCastLevelChange($event)"\r
                     title="Cast-Level direkt eingeben (kein Maximum)" />\r
            </div>\r
\r
            @if (castLevelMarkers.length > 0) {\r
              <div class="cast-cl-markers">\r
                @for (marker of castLevelMarkers; track marker.key) {\r
                  <div class="cast-cl-marker"\r
                       [style.left.%]="castMarkerLeftPct(marker.level)"\r
                       [title]="marker.label + ' ' + marker.level + ' CL ben\xF6tigt'">\r
                    <span class="cast-cl-marker-label">{{ marker.label }}</span>\r
                  </div>\r
                }\r
              </div>\r
            }\r
\r
            <div class="cast-estimate">\r
              <span class="cast-estimate-label">Dauer:</span>\r
              <span class="cast-estimate-val">~{{ (pendingCastLevel / 10).toFixed(1) }} Runden</span>\r
            </div>\r
\r
            <!-- Skalierung (Effektivit\xE4t, Haltbarkeit, Manakosten) -->\r
            <div class="cast-section-label cast-section-label--skal">\r
              Skalierung\r
              <span class="cast-skal-val">\xD7 {{ skalierung.toFixed(1) }}</span>\r
              @if (skalerungStars.length > 0) {\r
                <span class="cast-stars">\r
                  @for (star of skalerungStars; track $index) {\r
                    <span class="cast-star">\u2605</span>\r
                  }\r
                </span>\r
              }\r
            </div>\r
            @if (castPreview.scaledEffektivitaet > 0 || castPreview.scaledHaltbarkeit > 0) {\r
              <div class="cast-skal-stats">\r
                @if (castPreview.scaledEffektivitaet > 0) {\r
                  <span class="cast-skal-stat"><span class="app-icon i-effektivity"></span> Eff. {{ castPreview.scaledEffektivitaet | number:'1.0-1' }}</span>\r
                }\r
                @if (castPreview.scaledHaltbarkeit > 0) {\r
                  <span class="cast-skal-stat">\u29D7 {{ castPreview.scaledHaltbarkeit | number:'1.0-1' }} Rd</span>\r
                }\r
              </div>\r
            }\r
            <input class="cast-slider cast-slider--skal"\r
                   type="range"\r
                   [style.--sc]="spellColor(pendingCastSpell)"\r
                   min="0.1" max="10" step="0.1"\r
                   [ngModel]="skalierung"\r
                   (input)="onSkalierungChange(+$any($event.target).value)"\r
                   (ngModelChange)="onSkalierungChange($event)" />\r
            <input class="cast-skal-input"\r
                   type="number"\r
                   min="0.1" step="0.1"\r
                   [ngModel]="skalierung"\r
                   (ngModelChange)="onSkalierungChange($event)"\r
                   title="Skalierung direkt eingeben" />\r
          </div>\r
\r
          <!-- RIGHT: Resource bars -->\r
          <div class="cast-col cast-col--right">\r
\r
            <!-- Mana bar -->\r
            <div class="cast-section-label">Mana</div>\r
            <div class="cast-res-bar-wrap">\r
              <div class="cast-res-bar cast-res-bar--mana">\r
                <div class="cast-res-fill"\r
                     [style.width.%]="castPreview.manaAfterPct"\r
                     [style.background]="'#3b82f6'"></div>\r
                @if (castPreview.manaCost > 0) {\r
                  <div class="cast-res-cost-overlay cast-res-cost-overlay--mana"\r
                       [style.width.%]="castPreview.manaCostPct"\r
                       [style.left.%]="castPreview.manaAfterPct"></div>\r
                }\r
              </div>\r
              <div class="cast-res-labels">\r
                <span class="cast-res-cur" [style.color]="'#60a5fa'">\r
                  {{ manaCurrent }}\r
                  @if (castPreview.manaCost > 0) {\r
                    <span class="cast-res-after"> \u2192 {{ castPreview.manaAfter | number:'1.0-1' }}</span>\r
                  }\r
                </span>\r
                <span class="cast-res-max">/{{ manaMax }}</span>\r
              </div>\r
              @if (castPreview.manaCost > 0) {\r
                <div class="cast-res-cost-tag cast-res-cost-tag--mana">\r
                  \u2212\u25C6&nbsp;{{ castPreview.manaCost | number:'1.0-1' }}\r
                </div>\r
              }\r
            </div>\r
\r
            <!-- Fokus bar -->\r
            <div class="cast-section-label">Fokus</div>\r
            <div class="cast-res-bar-wrap">\r
              <div class="cast-res-bar cast-res-bar--fokus">\r
                <div class="cast-res-fill"\r
                     [style.width.%]="castPreview.fokusAfterPct"\r
                     [style.background]="'#7c3aed'"></div>\r
                @if (castPreview.fokusCost > 0) {\r
                  <div class="cast-res-cost-overlay cast-res-cost-overlay--fokus"\r
                       [style.width.%]="castPreview.fokusCostPct"\r
                       [style.left.%]="castPreview.fokusAfterPct"></div>\r
                }\r
              </div>\r
              <div class="cast-res-labels">\r
                <span class="cast-res-cur" [style.color]="'#a78bfa'">\r
                  {{ fokusAvailable }}\r
                  @if (castPreview.fokusCost > 0) {\r
                    <span class="cast-res-after"> \u2192 {{ castPreview.fokusAfter | number:'1.0-1' }}</span>\r
                  }\r
                </span>\r
                <span class="cast-res-max">/{{ fokusMax }}</span>\r
              </div>\r
              @if (castPreview.fokusCost > 0) {\r
                <div class="cast-res-cost-tag cast-res-cost-tag--fokus">\r
                  \u2212\u25C6&nbsp;{{ castPreview.fokusCost | number:'1.0-1' }}\r
                </div>\r
              }\r
            </div>\r
\r
            <!-- Per-turn / duration info -->\r
            @if (pendingCastSpell.perTurnMana || pendingCastSpell.perTurnFokus || pendingCastSpell.durationTurns || castPreview.scaledEffektivitaet > 0) {\r
              <div class="cast-perturn-block">\r
                @if (pendingCastSpell.perTurnMana) {\r
                  <span class="cast-perturn-chip cast-perturn-chip--mana">+{{ pendingCastSpell.perTurnMana }}/Rd \u25C6</span>\r
                }\r
                @if (pendingCastSpell.perTurnFokus) {\r
                  <span class="cast-perturn-chip cast-perturn-chip--fokus">+{{ pendingCastSpell.perTurnFokus }}/Rd \u25C6</span>\r
                }\r
                @if (castPreview.scaledHaltbarkeit > 0) {\r
                  <span class="cast-perturn-chip cast-perturn-chip--dur">\u29D7&nbsp;{{ castPreview.scaledHaltbarkeit | number:'1.0-1' }}Rd</span>\r
                }\r
                @if (castPreview.scaledEffektivitaet > 0) {\r
                  <span class="cast-perturn-chip cast-perturn-chip--eff"><span class="app-icon i-effektivity"></span>&nbsp;{{ castPreview.scaledEffektivitaet | number:'1.0-1' }}</span>\r
                }\r
              </div>\r
            }\r
          </div>\r
        </div>\r
\r
        <!-- Footer actions -->\r
        <div class="cast-footer">\r
          <button class="cast-cancel-btn" (click)="cancelCast()">Abbrechen</button>\r
          <button class="cast-confirm-btn" [style.--sc]="spellColor(pendingCastSpell)" (click)="confirmCast()" [disabled]="!canCast" [title]="!canCast ? 'Fehlende Ressourcen oder Stats' : ''">\r
            <span class="app-icon i-spell"></span> AKTIVIEREN\r
          </button>\r
        </div>\r
      </div><!-- /cast-card -->\r
    </div><!-- /cast-portal -->\r
  }\r
\r
</div>\r
`, styles: ['/* src/app/sheet/spellcast-window/spellcast-window.component.css */\n:host {\n  display: block;\n  position: fixed;\n  inset: 0;\n  z-index: 2000;\n  pointer-events: all;\n}\n.scw-overlay {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background:\n    radial-gradient(\n      ellipse at 40% 30%,\n      rgba(88, 28, 235, 0.18) 0%,\n      rgba(0, 0, 0, 0) 60%),\n    radial-gradient(\n      ellipse at 70% 70%,\n      rgba(59, 130, 246, 0.12) 0%,\n      rgba(0, 0, 0, 0) 60%),\n    rgb(8, 6, 20);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.scw-rune-field {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  overflow: hidden;\n  z-index: 0;\n}\n.scw-rune-glyph {\n  position: absolute;\n  font-family: serif;\n  -webkit-user-select: none;\n  user-select: none;\n  animation: runeFloat linear infinite;\n  will-change: transform, opacity;\n}\n@keyframes runeFloat {\n  0% {\n    transform: translateY(0px) rotate(0deg);\n    opacity: var(--ro, 0.08);\n  }\n  25% {\n    transform: translateY(-18px) rotate(6deg);\n    opacity: calc(var(--ro, 0.08) * 1.4);\n  }\n  50% {\n    transform: translateY(-8px) rotate(-4deg);\n    opacity: var(--ro, 0.08);\n  }\n  75% {\n    transform: translateY(-24px) rotate(3deg);\n    opacity: calc(var(--ro, 0.08) * 0.7);\n  }\n  100% {\n    transform: translateY(0px) rotate(0deg);\n    opacity: var(--ro, 0.08);\n  }\n}\n.scw-header {\n  position: relative;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  gap: 20px;\n  padding: 18px 28px 14px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.25);\n  background:\n    linear-gradient(\n      180deg,\n      rgba(139, 92, 246, 0.12) 0%,\n      transparent 100%);\n  flex-shrink: 0;\n}\n.scw-header-left {\n  display: flex;\n  align-items: baseline;\n  gap: 12px;\n}\n.scw-title {\n  font-size: 1.4rem;\n  font-weight: 800;\n  color: #c4b5fd;\n  letter-spacing: 0.04em;\n  text-shadow: 0 0 20px rgba(139, 92, 246, 0.6);\n}\n.scw-char-name {\n  font-size: 0.85rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 500;\n}\n.scw-resources {\n  display: flex;\n  gap: 20px;\n  margin-left: auto;\n  align-items: center;\n}\n.scw-res-block {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.scw-res-label {\n  font-size: 0.72rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.07em;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.scw-res-bar {\n  width: 120px;\n  height: 8px;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 4px;\n  overflow: hidden;\n}\n.scw-res-fill {\n  height: 100%;\n  border-radius: 4px;\n  transition: width 0.4s ease;\n}\n.scw-res-fill--leben {\n  background:\n    linear-gradient(\n      90deg,\n      #ef4444,\n      #f87171);\n  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);\n}\n.scw-res-fill--ausdauer {\n  background:\n    linear-gradient(\n      90deg,\n      #22c55e,\n      #4ade80);\n  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);\n}\n.scw-res-fill--mana {\n  background:\n    linear-gradient(\n      90deg,\n      #3b82f6,\n      #6366f1);\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);\n}\n.scw-res-fill--fokus {\n  background:\n    linear-gradient(\n      90deg,\n      #8b5cf6,\n      #a78bfa);\n  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);\n}\n.scw-res-val {\n  font-size: 0.76rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  white-space: nowrap;\n  min-width: 52px;\n}\n.scw-close-btn {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: var(--text-muted, #9ca3af);\n  width: 36px;\n  height: 36px;\n  border-radius: 8px;\n  font-size: 1rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.scw-close-btn:hover {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.scw-body {\n  position: relative;\n  z-index: 1;\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  align-items: stretch;\n  gap: 0;\n  overflow: hidden;\n  padding: 24px 28px;\n}\n.scw-panel {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  overflow: hidden;\n}\n.scw-panel-header {\n  font-size: 0.72rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  color: rgba(196, 181, 253, 0.7);\n  padding-bottom: 8px;\n  border-bottom: 1px solid rgba(139, 92, 246, 0.2);\n  flex-shrink: 0;\n}\n.scw-empty {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.85rem;\n  text-align: center;\n  padding: 30px 0;\n  line-height: 1.6;\n}\n.scw-empty-hint {\n  font-size: 0.75rem;\n  opacity: 0.7;\n}\n.scw-spell-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  overflow-y: auto;\n  align-content: flex-start;\n  flex: 1;\n  padding-right: 4px;\n}\n.scw-spell-grid::-webkit-scrollbar {\n  width: 5px;\n}\n.scw-spell-grid::-webkit-scrollbar-track {\n  background: transparent;\n}\n.scw-spell-grid::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n.scw-spell-card {\n  position: relative;\n  width: 160px;\n  min-height: 140px;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  padding: 0 0 8px 0;\n  border-radius: 12px;\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-left: 3px solid var(--sc, #8b5cf6);\n  background: rgba(255, 255, 255, 0.03);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  overflow: hidden;\n}\n.scw-spell-card:hover {\n  background: rgba(139, 92, 246, 0.08);\n  border-color: var(--sc, #8b5cf6);\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2), 0 0 0 1px var(--sc, #8b5cf6);\n  transform: translateY(-2px);\n}\n.scw-spell-card.is-casting {\n  background: rgba(139, 92, 246, 0.13);\n  border-color: var(--sc, #8b5cf6);\n  box-shadow: 0 0 24px rgba(139, 92, 246, 0.3);\n  cursor: default;\n}\n.scw-spell-glow {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at 50% 30%,\n      var(--sc, #8b5cf6) 0%,\n      transparent 70%);\n  opacity: 0;\n  transition: opacity 0.2s;\n  pointer-events: none;\n}\n.scw-spell-card:hover .scw-spell-glow {\n  opacity: 0.08;\n}\n.scw-spell-card.is-casting .scw-spell-glow {\n  opacity: 0.12;\n  animation: pulseGlow 2s ease-in-out infinite;\n}\n@keyframes pulseGlow {\n  0%, 100% {\n    opacity: 0.08;\n  }\n  50% {\n    opacity: 0.2;\n  }\n}\n.scw-card-head {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 9px 8px 6px;\n}\n.scw-spell-icon {\n  font-size: 1.1rem;\n  color: var(--sc, #8b5cf6);\n  text-shadow: 0 0 10px var(--sc, #8b5cf6);\n  line-height: 1;\n  flex-shrink: 0;\n  animation: iconPulse 3s ease-in-out infinite;\n}\n@keyframes iconPulse {\n  0%, 100% {\n    text-shadow: 0 0 8px var(--sc, #8b5cf6);\n  }\n  50% {\n    text-shadow: 0 0 18px var(--sc, #8b5cf6), 0 0 30px var(--sc, #8b5cf6);\n  }\n}\n.scw-spell-name {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  line-height: 1.3;\n  flex: 1;\n  word-break: break-word;\n  -webkit-hyphens: auto;\n  hyphens: auto;\n}\n.scw-active-badge {\n  font-size: 0.55rem;\n  font-weight: 700;\n  background: rgba(139, 92, 246, 0.4);\n  color: #c4b5fd;\n  border-radius: 5px;\n  padding: 1px 4px;\n  letter-spacing: 0.04em;\n  flex-shrink: 0;\n}\n.scw-spell-desc-short {\n  font-size: 0.7rem;\n  color: #7c8ca0;\n  line-height: 1.4;\n  padding: 0 9px;\n  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n.scw-spell-reqs-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  padding: 2px 9px 0;\n}\n.scw-spell-req {\n  font-size: 0.62rem;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 4px;\n  background: #1e3a5f;\n  color: #90caf9;\n  border: 1px solid rgba(66, 165, 245, 0.4);\n  white-space: nowrap;\n}\n.scw-spell-req--unmet {\n  background: #4d1c21;\n  color: #ffcdd2;\n  border-color: rgba(229, 115, 115, 0.5);\n  text-decoration: line-through;\n}\n.scw-card-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 4px 8px 0;\n  gap: 4px;\n  margin-top: auto;\n}\n.scw-card-costs {\n  display: flex;\n  gap: 3px;\n  flex-wrap: wrap;\n}\n.scw-cost-chip {\n  font-size: 0.65rem;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 4px;\n  white-space: nowrap;\n}\n.scw-cost-chip--mana {\n  background: rgba(59, 130, 246, 0.12);\n  border: 1px solid rgba(59, 130, 246, 0.35);\n  color: #60a5fa;\n}\n.scw-cost-chip--fokus {\n  background: rgba(109, 40, 217, 0.12);\n  border: 1px solid rgba(109, 40, 217, 0.4);\n  color: #a78bfa;\n}\n.scw-cost-chip--free {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #4b5563;\n  font-style: italic;\n}\n.scw-card-meta {\n  display: flex;\n  gap: 3px;\n  align-items: center;\n}\n.scw-card-perturn {\n  font-size: 0.6rem;\n  color: #9ca3af;\n}\n.scw-card-dur {\n  font-size: 0.6rem;\n  color: #fcd34d;\n}\n.scw-spell-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  padding: 2px 8px 0;\n}\n.scw-tag {\n  font-size: 0.56rem;\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.05);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.scw-skal-badge {\n  font-size: 0.62rem;\n  font-weight: 700;\n  background: rgba(251, 191, 36, 0.12);\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  color: #fbbf24;\n  border-radius: 5px;\n  padding: 1px 5px;\n  flex-shrink: 0;\n}\n.scw-divider {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  padding: 0 20px;\n  flex-shrink: 0;\n}\n.scw-divider-line {\n  flex: 1;\n  width: 1px;\n  background:\n    linear-gradient(\n      to bottom,\n      transparent,\n      rgba(139, 92, 246, 0.3),\n      transparent);\n}\n.scw-divider-rune {\n  font-size: 1.6rem;\n  color: rgba(139, 92, 246, 0.4);\n  font-family: serif;\n  line-height: 1;\n  animation: runeFloat 6s ease-in-out infinite;\n}\n.scw-active-scroll {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  padding-right: 4px;\n}\n.scw-active-scroll::-webkit-scrollbar {\n  width: 5px;\n}\n.scw-active-scroll::-webkit-scrollbar-track {\n  background: transparent;\n}\n.scw-active-scroll::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n.scw-active-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.scw-active-card {\n  position: relative;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-left: 3px solid var(--sc, #8b5cf6);\n  border-radius: 10px;\n  background: rgba(139, 92, 246, 0.07);\n  padding: 12px 14px;\n  overflow: hidden;\n  animation: slideIn 0.25s ease;\n}\n@keyframes slideIn {\n  from {\n    opacity: 0;\n    transform: translateX(20px);\n  }\n  to {\n    opacity: 1;\n    transform: translateX(0);\n  }\n}\n.scw-active-glow {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      circle at 10% 50%,\n      var(--sc, #8b5cf6) 0%,\n      transparent 60%);\n  opacity: 0.06;\n  pointer-events: none;\n  animation: pulseGlow 3s ease-in-out infinite;\n}\n.scw-active-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 6px;\n}\n.scw-active-icon {\n  font-size: 1.1rem;\n  color: var(--sc, #8b5cf6);\n  text-shadow: 0 0 8px var(--sc, #8b5cf6);\n}\n.scw-active-name {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n}\n.scw-stop-btn {\n  background: rgba(239, 68, 68, 0.1);\n  border: 1px solid rgba(239, 68, 68, 0.25);\n  color: #fca5a5;\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  font-size: 0.72rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.scw-stop-btn:hover {\n  background: rgba(239, 68, 68, 0.25);\n  color: #ef4444;\n}\n.scw-pay-cost-btn {\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  color: #c4b5fd;\n  height: 22px;\n  padding: 0 7px;\n  border-radius: 5px;\n  font-size: 0.68rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 3px;\n  transition: all 0.15s;\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n.scw-pay-cost-btn:hover {\n  background: rgba(139, 92, 246, 0.3);\n  color: #a78bfa;\n}\n.scw-active-desc {\n  font-size: 0.78rem;\n  color: #9ca3af;\n  line-height: 1.5;\n  margin-bottom: 8px;\n  max-height: 60px;\n  overflow-y: auto;\n}\n.scw-active-startcost {\n  font-size: 0.72rem;\n  color: #a78bfa;\n  background: rgba(139, 92, 246, 0.08);\n  border-radius: 8px;\n  padding: 2px 8px;\n  display: inline-block;\n  margin-bottom: 6px;\n  font-weight: 600;\n}\n.scw-active-cost {\n  font-size: 0.72rem;\n  color: #fcd34d;\n  background: rgba(252, 211, 77, 0.1);\n  border-radius: 8px;\n  padding: 2px 8px;\n  display: inline-block;\n  margin-bottom: 8px;\n  font-weight: 600;\n}\n.scw-cl-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.scw-cl-label {\n  font-size: 0.68rem;\n  color: var(--text-muted, #9ca3af);\n  flex: 1;\n}\n.scw-cl-btn {\n  width: 22px;\n  height: 22px;\n  border-radius: 5px;\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  background: rgba(139, 92, 246, 0.1);\n  color: #c4b5fd;\n  font-size: 0.85rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.12s;\n}\n.scw-cl-btn:hover {\n  background: rgba(139, 92, 246, 0.3);\n}\n.scw-cl-val {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  min-width: 20px;\n  text-align: center;\n}\n.scw-reduction {\n  font-size: 0.68rem;\n  font-weight: 700;\n  color: #4ade80;\n  background: rgba(74, 222, 128, 0.1);\n  border-radius: 8px;\n  padding: 2px 6px;\n}\n.scw-counter-list {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-top: 8px;\n  padding-top: 8px;\n  border-top: 1px solid rgba(139, 92, 246, 0.2);\n}\n.scw-counter {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.scw-counter-dot {\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.scw-counter-name {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  flex-shrink: 0;\n  min-width: 50px;\n}\n.scw-counter-btn {\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.1);\n  color: #c4b5fd;\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  line-height: 1;\n  padding: 0;\n  font-family: inherit;\n}\n.scw-counter-btn:hover {\n  background: rgba(139, 92, 246, 0.25);\n}\n.scw-counter-val {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  min-width: 20px;\n  text-align: center;\n}\n.scw-counter-max {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.scw-counter-bar {\n  flex: 1;\n  min-width: 60px;\n  height: 5px;\n  background: rgba(255, 255, 255, 0.08);\n  border-radius: 3px;\n  overflow: hidden;\n}\n.scw-counter-fill {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.2s ease;\n}\n.cast-portal {\n  position: absolute;\n  inset: 0;\n  z-index: 100;\n  background: rgba(4, 3, 12, 0.96);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: portalFadeIn 0.25s ease;\n}\n.cast-portal::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      ellipse at 50% 50%,\n      color-mix(in srgb, var(--sc, #8b5cf6) 30%, transparent) 0%,\n      transparent 65%);\n  pointer-events: none;\n  z-index: 0;\n}\n@keyframes portalFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.portal-rune-field {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  overflow: hidden;\n  z-index: 1;\n}\n.portal-rune {\n  position: absolute;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: runeOrbit linear infinite;\n  will-change: transform, opacity;\n}\n@keyframes runeOrbit {\n  0% {\n    transform: translateY(0px) rotate(0deg) scale(1);\n  }\n  20% {\n    transform: translateY(-18px) rotate(8deg) scale(1.08);\n  }\n  45% {\n    transform: translateY(-10px) rotate(-5deg) scale(0.95);\n  }\n  70% {\n    transform: translateY(-24px) rotate(12deg) scale(1.05);\n  }\n  100% {\n    transform: translateY(0px) rotate(0deg) scale(1);\n  }\n}\n.portal-rune-img {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  border-radius: 8px;\n  animation: runeImgPulse 4s ease-in-out infinite;\n}\n@keyframes runeImgPulse {\n  0%, 100% {\n    opacity: 0.85;\n  }\n  50% {\n    opacity: 1;\n  }\n}\n.portal-rune-glyph {\n  font-family: serif;\n  font-size: 1.6em;\n  -webkit-user-select: none;\n  user-select: none;\n  animation: runeGlyphPulse 3.5s ease-in-out infinite;\n}\n@keyframes runeGlyphPulse {\n  0%, 100% {\n    transform: scale(1);\n    opacity: 0.8;\n  }\n  50% {\n    transform: scale(1.15);\n    opacity: 1;\n  }\n}\n.cast-card {\n  position: relative;\n  z-index: 10;\n  width: min(700px, 92vw);\n  max-height: 88vh;\n  overflow-y: auto;\n  background: rgba(14, 10, 30, 0.92);\n  border-radius: 18px;\n  border: 1px solid rgba(255, 255, 255, 0.07);\n  box-shadow:\n    0 0 0 1px var(--sc, #8b5cf6),\n    0 0 60px rgba(0, 0, 0, 0.8),\n    inset 0 1px 0 rgba(255, 255, 255, 0.06);\n  animation: cardEnter 0.35s cubic-bezier(0.22, 1, 0.36, 1);\n  scrollbar-width: thin;\n  scrollbar-color: rgba(139, 92, 246, 0.3) transparent;\n}\n.cast-card::-webkit-scrollbar {\n  width: 5px;\n}\n.cast-card::-webkit-scrollbar-thumb {\n  background: rgba(139, 92, 246, 0.3);\n  border-radius: 3px;\n}\n@keyframes cardEnter {\n  from {\n    opacity: 0;\n    transform: scale(0.88) translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.cast-card-head {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 20px 22px 16px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(255, 255, 255, 0.04) 0%,\n      transparent 100%);\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n  border-radius: 18px 18px 0 0;\n}\n.cast-icon {\n  font-size: 2.4rem;\n  color: var(--sc, #8b5cf6);\n  text-shadow: 0 0 20px var(--sc, #8b5cf6), 0 0 40px var(--sc, #8b5cf6);\n  animation: castIconBeat 2.5s ease-in-out infinite;\n  flex-shrink: 0;\n}\n@keyframes castIconBeat {\n  0%, 100% {\n    text-shadow: 0 0 16px var(--sc, #8b5cf6), 0 0 40px var(--sc, #8b5cf6);\n  }\n  50% {\n    text-shadow:\n      0 0 28px var(--sc, #8b5cf6),\n      0 0 60px var(--sc, #8b5cf6),\n      0 0 100px var(--sc, #8b5cf6);\n  }\n}\n.cast-title-block {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  flex: 1;\n}\n.cast-type-label {\n  font-size: 0.66rem;\n  font-weight: 800;\n  letter-spacing: 0.14em;\n  color: var(--sc, #8b5cf6);\n  opacity: 0.8;\n  text-transform: uppercase;\n}\n.cast-spell-name {\n  font-size: 1.5rem;\n  font-weight: 800;\n  color: #f0f4ff;\n  letter-spacing: 0.02em;\n  line-height: 1.1;\n}\n.cast-close-btn {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  color: #6b7280;\n  width: 34px;\n  height: 34px;\n  border-radius: 8px;\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.cast-close-btn:hover {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.cast-desc {\n  padding: 14px 22px 8px;\n  font-size: 0.88rem;\n  color: #9ca3af;\n  line-height: 1.6;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n}\n.cast-reqs-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  padding: 10px 22px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n}\n.cast-req {\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 3px 9px;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  transition: all 0.3s ease;\n  white-space: nowrap;\n}\n.cast-req--met {\n  background: rgba(34, 197, 94, 0.1);\n  border: 1px solid rgba(34, 197, 94, 0.4);\n  color: #86efac;\n}\n.cast-req--unmet {\n  background: rgba(239, 68, 68, 0.1);\n  border: 1px solid rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n}\n.cast-req-boost {\n  font-size: 0.65rem;\n  color: #4ade80;\n  opacity: 0.85;\n}\n.cast-req-orig {\n  opacity: 0.55;\n  text-decoration: line-through;\n}\n.cast-req-arrow {\n  font-size: 0.7rem;\n  opacity: 0.7;\n  margin: 0 1px;\n}\n.cast-req-effective {\n  font-weight: 800;\n  color: #4ade80;\n}\n.cast-controls {\n  display: flex;\n  gap: 24px;\n  padding: 18px 22px 14px;\n}\n.cast-col {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.cast-col--left {\n  flex: 1.1;\n}\n.cast-col--right {\n  flex: 1;\n}\n.cast-section-label {\n  font-size: 0.68rem;\n  font-weight: 700;\n  letter-spacing: 0.1em;\n  color: rgba(156, 163, 175, 0.75);\n  text-transform: uppercase;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.cast-section-label--skal {\n  margin-top: 6px;\n}\n.cast-skal-val {\n  color: #fbbf24;\n  font-size: 0.8rem;\n}\n.cast-stars {\n  display: flex;\n  gap: 1px;\n}\n.cast-star {\n  color: #fbbf24;\n  font-size: 0.7rem;\n  text-shadow: 0 0 6px #fbbf24;\n  animation: starPop 0.3s cubic-bezier(0.18, 1.4, 0.4, 1) both;\n}\n@keyframes starPop {\n  from {\n    transform: scale(0);\n    opacity: 0;\n  }\n  to {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n.cast-slider-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.cast-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  flex: 1;\n  height: 5px;\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.08);\n  outline: none;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.cast-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: var(--sc, #8b5cf6);\n  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 12px var(--sc, #8b5cf6);\n  cursor: pointer;\n  transition: transform 0.15s, box-shadow 0.15s;\n}\n.cast-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.25);\n  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 22px var(--sc, #8b5cf6);\n}\n.cast-slider--cl::-webkit-slider-runnable-track {\n  background:\n    linear-gradient(\n      to right,\n      var(--sc, #8b5cf6) 0%,\n      var(--sc, #8b5cf6) calc(var(--pct, 0) * 1%),\n      rgba(255, 255, 255, 0.06) calc(var(--pct, 0) * 1%));\n}\n.cast-level-input {\n  width: 56px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 7px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  font-weight: 700;\n  padding: 4px 7px;\n  font-family: inherit;\n  text-align: center;\n  outline: none;\n}\n.cast-level-input:focus {\n  border-color: var(--sc, #8b5cf6);\n}\n.cast-cl-markers {\n  position: relative;\n  height: 24px;\n  margin-top: -4px;\n}\n.cast-cl-marker {\n  position: absolute;\n  top: 0;\n  transform: translateX(-50%);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n}\n.cast-cl-marker::before {\n  content: "";\n  width: 2px;\n  height: 8px;\n  background: #f59e0b;\n  border-radius: 1px;\n}\n.cast-cl-marker-label {\n  font-size: 0.6rem;\n  font-weight: 700;\n  color: #f59e0b;\n  white-space: nowrap;\n  background: rgba(245, 158, 11, 0.1);\n  padding: 0px 3px;\n  border-radius: 3px;\n}\n.cast-estimate {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: -4px;\n}\n.cast-estimate-label {\n  font-size: 0.67rem;\n  color: #6b7280;\n}\n.cast-estimate-val {\n  font-size: 0.78rem;\n  font-weight: 700;\n  color: #d1d5db;\n}\n.cast-res-bar-wrap {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin-bottom: 4px;\n}\n.cast-res-bar {\n  position: relative;\n  height: 10px;\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.06);\n  overflow: hidden;\n}\n.cast-res-fill {\n  height: 100%;\n  border-radius: 6px;\n  transition: width 0.35s ease;\n}\n.cast-res-bar--mana .cast-res-fill {\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);\n}\n.cast-res-bar--fokus .cast-res-fill {\n  box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);\n}\n.cast-res-cost-overlay {\n  position: absolute;\n  top: 0;\n  height: 100%;\n  border-radius: 0 6px 6px 0;\n  transition: all 0.35s ease;\n}\n.cast-res-cost-overlay--mana {\n  background: rgba(239, 68, 68, 0.5);\n}\n.cast-res-cost-overlay--fokus {\n  background: rgba(239, 68, 68, 0.5);\n}\n.cast-res-labels {\n  display: flex;\n  align-items: baseline;\n  gap: 4px;\n}\n.cast-res-cur {\n  font-size: 0.82rem;\n  font-weight: 700;\n}\n.cast-res-after {\n  font-size: 0.72rem;\n  opacity: 0.75;\n}\n.cast-res-max {\n  font-size: 0.7rem;\n  color: #4b5563;\n  margin-left: auto;\n}\n.cast-res-cost-tag {\n  font-size: 0.7rem;\n  font-weight: 700;\n  align-self: flex-end;\n  border-radius: 6px;\n  padding: 1px 7px;\n}\n.cast-res-cost-tag--mana {\n  background: rgba(59, 130, 246, 0.1);\n  color: #60a5fa;\n  border: 1px solid rgba(59, 130, 246, 0.25);\n}\n.cast-res-cost-tag--fokus {\n  background: rgba(109, 40, 217, 0.1);\n  color: #a78bfa;\n  border: 1px solid rgba(109, 40, 217, 0.25);\n}\n.cast-perturn-block {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 4px;\n}\n.cast-perturn-chip {\n  font-size: 0.7rem;\n  font-weight: 700;\n  padding: 2px 7px;\n  border-radius: 5px;\n}\n.cast-perturn-chip--mana {\n  background: rgba(59, 130, 246, 0.1);\n  color: #60a5fa;\n  border: 1px solid rgba(59, 130, 246, 0.2);\n}\n.cast-perturn-chip--fokus {\n  background: rgba(109, 40, 217, 0.1);\n  color: #a78bfa;\n  border: 1px solid rgba(109, 40, 217, 0.2);\n}\n.cast-perturn-chip--dur {\n  background: rgba(245, 158, 11, 0.08);\n  color: #fbbf24;\n  border: 1px solid rgba(245, 158, 11, 0.18);\n}\n.cast-perturn-chip--eff {\n  background: rgba(34, 197, 94, 0.08);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.18);\n}\n.cast-skal-stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 4px 0 8px;\n}\n.cast-skal-stat {\n  font-size: 0.72rem;\n  color: #a78bfa;\n  background: rgba(124, 58, 237, 0.1);\n  border: 1px solid rgba(124, 58, 237, 0.2);\n  border-radius: 4px;\n  padding: 2px 6px;\n}\n.cast-footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding: 14px 22px 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.05);\n}\n.cast-cancel-btn {\n  padding: 10px 20px;\n  border-radius: 9px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  background: transparent;\n  color: #6b7280;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n}\n.cast-cancel-btn:hover {\n  border-color: rgba(255, 255, 255, 0.22);\n  color: #d1d5db;\n}\n.cast-confirm-btn {\n  padding: 11px 28px;\n  border-radius: 9px;\n  border: 1px solid var(--sc, #8b5cf6);\n  background: rgba(139, 92, 246, 0.15);\n  color: #fff;\n  font-size: 0.95rem;\n  font-weight: 800;\n  letter-spacing: 0.06em;\n  cursor: pointer;\n  font-family: inherit;\n  box-shadow: 0 0 20px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);\n  transition: all 0.2s;\n  animation: confirmPulse 2.8s ease-in-out infinite;\n}\n.cast-confirm-btn:hover {\n  background: rgba(139, 92, 246, 0.3);\n  box-shadow: 0 0 0 1px var(--sc, #8b5cf6), 0 0 40px rgba(139, 92, 246, 0.4);\n  transform: scale(1.03);\n  animation: none;\n}\n@keyframes confirmPulse {\n  0%, 100% {\n    box-shadow: 0 0 16px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);\n  }\n  50% {\n    box-shadow:\n      0 0 32px rgba(139, 92, 246, 0.5),\n      0 0 0 1px var(--sc, #8b5cf6),\n      inset 0 1px 0 rgba(255, 255, 255, 0.08);\n  }\n}\n.cast-confirm-backdrop {\n  display: none;\n}\n.cast-confirm-box {\n  display: none;\n}\n.cast-confirm-btn:disabled {\n  opacity: 0.35;\n  cursor: not-allowed;\n  animation: none;\n  transform: none;\n  box-shadow: none;\n}\n.cast-skal-input {\n  width: 60px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 7px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  font-weight: 700;\n  padding: 4px 7px;\n  font-family: inherit;\n  text-align: center;\n  outline: none;\n  margin-top: 6px;\n}\n.cast-skal-input:focus {\n  border-color: var(--sc, #8b5cf6);\n}\n.scw-skal-badge--prominent {\n  font-size: 0.78rem;\n  font-weight: 800;\n  background: rgba(251, 191, 36, 0.2);\n  border: 1.5px solid rgba(251, 191, 36, 0.6);\n  color: #fbbf24;\n  border-radius: 7px;\n  padding: 2px 8px;\n  letter-spacing: 0.02em;\n  box-shadow: 0 0 8px rgba(251, 191, 36, 0.25);\n}\n.scw-cast-bonus-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 8px;\n  flex-shrink: 0;\n}\n.scw-cast-bonus-label {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  white-space: nowrap;\n}\n.scw-cast-bonus-input {\n  width: 60px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  font-weight: 700;\n  padding: 3px 7px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-cast-bonus-input:focus {\n  border-color: #8b5cf6;\n}\n.scw-cast-progress {\n  margin-top: 10px;\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.2);\n  border-radius: 10px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.scw-cast-progress-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.scw-cast-progress-label {\n  font-size: 0.7rem;\n  font-weight: 700;\n  color: #c4b5fd;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n.scw-cast-remaining-row {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.scw-cast-remaining-input {\n  width: 56px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.82rem;\n  font-weight: 700;\n  padding: 3px 6px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-cast-remaining-input:focus {\n  border-color: #8b5cf6;\n}\n.scw-cast-remaining-of {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.scw-cast-bar {\n  height: 8px;\n  background: rgba(255, 255, 255, 0.07);\n  border-radius: 4px;\n  overflow: hidden;\n}\n.scw-cast-bar-fill {\n  height: 100%;\n  background:\n    linear-gradient(\n      90deg,\n      #7c3aed,\n      #8b5cf6,\n      #a78bfa);\n  border-radius: 4px;\n  transition: width 0.3s ease;\n}\n.scw-roll-btn {\n  padding: 6px 12px;\n  border-radius: 8px;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  background: rgba(139, 92, 246, 0.15);\n  color: #c4b5fd;\n  font-size: 0.8rem;\n  font-weight: 700;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n  align-self: flex-end;\n}\n.scw-roll-btn:hover {\n  background: rgba(139, 92, 246, 0.3);\n  border-color: #8b5cf6;\n  color: #fff;\n}\n.scw-round-counter {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 10px;\n  background: rgba(59, 130, 246, 0.08);\n  border: 1px solid rgba(59, 130, 246, 0.2);\n  border-radius: 10px;\n  padding: 8px 12px;\n}\n.scw-round-label {\n  font-size: 0.7rem;\n  font-weight: 700;\n  color: #93c5fd;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  flex: 1;\n}\n.scw-round-input {\n  width: 52px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(59, 130, 246, 0.3);\n  border-radius: 6px;\n  color: #e5e7eb;\n  font-size: 0.88rem;\n  font-weight: 700;\n  padding: 3px 6px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-round-input:focus {\n  border-color: #3b82f6;\n}\n.scw-round-of {\n  font-size: 0.72rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n}\n.scw-advance-btn {\n  width: 28px;\n  height: 28px;\n  border-radius: 7px;\n  border: 1px solid rgba(59, 130, 246, 0.4);\n  background: rgba(59, 130, 246, 0.12);\n  color: #93c5fd;\n  font-size: 1rem;\n  font-weight: 700;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  flex-shrink: 0;\n}\n.scw-advance-btn:hover {\n  background: rgba(59, 130, 246, 0.3);\n  border-color: #3b82f6;\n  color: #fff;\n}\n.scw-spell-finished {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  margin-top: 10px;\n  background: rgba(74, 222, 128, 0.07);\n  border: 1.5px solid rgba(74, 222, 128, 0.35);\n  border-radius: 10px;\n  padding: 8px 12px;\n}\n.scw-finished-badge {\n  font-size: 0.78rem;\n  font-weight: 800;\n  color: #4ade80;\n  letter-spacing: 0.04em;\n}\n.scw-dismiss-btn {\n  padding: 5px 12px;\n  border-radius: 7px;\n  border: 1px solid rgba(74, 222, 128, 0.4);\n  background: rgba(74, 222, 128, 0.12);\n  color: #4ade80;\n  font-size: 0.78rem;\n  font-weight: 700;\n  cursor: pointer;\n  font-family: inherit;\n  transition: all 0.15s;\n}\n.scw-dismiss-btn:hover {\n  background: rgba(74, 222, 128, 0.3);\n  border-color: #4ade80;\n  color: #fff;\n}\n.scw-counter-input {\n  width: 46px;\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 5px;\n  color: #e5e7eb;\n  font-size: 0.82rem;\n  font-weight: 700;\n  padding: 2px 5px;\n  text-align: center;\n  font-family: inherit;\n  outline: none;\n}\n.scw-counter-input:focus {\n  border-color: rgba(139, 92, 246, 0.6);\n}\n.scw-skills-section {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n}\n.scw-panel-header--skills {\n  font-size: 0.7rem;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #a78bfa;\n  margin-bottom: 0.5rem;\n}\n.scw-skills-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 0.4rem;\n}\n.scw-skill-card {\n  position: relative;\n  background: rgba(167, 139, 250, 0.07);\n  border: 1px solid rgba(167, 139, 250, 0.2);\n  border-radius: 8px;\n  padding: 0.5rem 0.65rem;\n  cursor: pointer;\n  transition: border-color 0.2s, background 0.2s;\n  overflow: hidden;\n}\n.scw-skill-card:hover {\n  border-color: rgba(167, 139, 250, 0.45);\n  background: rgba(167, 139, 250, 0.13);\n}\n.scw-skill-card.is-active {\n  border-color: #a78bfa;\n  background: rgba(167, 139, 250, 0.18);\n  box-shadow: 0 0 10px rgba(167, 139, 250, 0.25);\n}\n.scw-skill-glow {\n  position: absolute;\n  inset: 0;\n  background:\n    radial-gradient(\n      ellipse at 50% 0%,\n      rgba(167, 139, 250, 0.1) 0%,\n      transparent 70%);\n  pointer-events: none;\n}\n.scw-skill-head {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n.scw-skill-icon {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.15);\n  border-radius: 4px;\n  padding: 1px 5px;\n  min-width: 22px;\n  text-align: center;\n}\n.scw-skill-name {\n  font-size: 0.82rem;\n  font-weight: 600;\n  color: #e5e7eb;\n  flex: 1;\n}\n.scw-skill-desc {\n  font-size: 0.72rem;\n  color: #9ca3af;\n  margin-top: 0.25rem;\n  line-height: 1.3;\n}\n.scw-skill-footer {\n  display: flex;\n  gap: 0.35rem;\n  margin-top: 0.3rem;\n  flex-wrap: wrap;\n}\n.scw-skill-tag {\n  font-size: 0.65rem;\n  background: rgba(255, 255, 255, 0.07);\n  border-radius: 4px;\n  padding: 1px 6px;\n  color: #9ca3af;\n}\n.scw-cost-chip--skill {\n  background: rgba(167, 139, 250, 0.18);\n  color: #a78bfa;\n  border: 1px solid rgba(167, 139, 250, 0.3);\n  font-size: 0.65rem;\n  border-radius: 4px;\n  padding: 1px 6px;\n}\n.scw-active-skills-section {\n  margin-top: 0.75rem;\n  padding-top: 0.75rem;\n  border-top: 1px solid rgba(167, 139, 250, 0.15);\n}\n.scw-active-skills-label {\n  font-size: 0.68rem;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #a78bfa;\n  margin-bottom: 0.5rem;\n}\n.scw-active-skill-card {\n  background: rgba(167, 139, 250, 0.1);\n  border: 1px solid rgba(167, 139, 250, 0.35);\n  border-radius: 8px;\n  padding: 0.5rem 0.65rem;\n  margin-bottom: 0.4rem;\n}\n.scw-active-cost {\n  font-size: 0.7rem;\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.15);\n  border-radius: 4px;\n  padding: 1px 6px;\n}\n.scw-left-tabs {\n  display: flex;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  margin-bottom: 0.75rem;\n  gap: 2px;\n}\n.scw-left-tab {\n  flex: 1;\n  padding: 0.45rem 0.5rem;\n  background: transparent;\n  border: none;\n  border-bottom: 2px solid transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.8rem;\n  cursor: pointer;\n  transition: color 0.15s, border-color 0.15s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.35rem;\n}\n.scw-left-tab.active {\n  color: #a78bfa;\n  border-bottom-color: #8b5cf6;\n}\n.scw-left-tab:hover:not(.active) {\n  color: var(--text, #e5e7eb);\n}\n.scw-left-tab-count {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 9px;\n  padding: 0 5px;\n  font-size: 0.7rem;\n}\n.scw-skill-search-row {\n  margin-bottom: 0.6rem;\n}\n.scw-skill-search {\n  width: 100%;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 6px;\n  padding: 0.4rem 0.7rem;\n  color: var(--text, #e5e7eb);\n  font-size: 0.82rem;\n  outline: none;\n  box-sizing: border-box;\n}\n.scw-skill-search:focus {\n  border-color: rgba(139, 92, 246, 0.5);\n}\n.scw-spell-card--skill {\n  --sc: #22c55e;\n  border-color: rgba(34, 197, 94, 0.25);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(34, 197, 94, 0.05) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n}\n.scw-spell-card--skill.is-casting {\n  border-color: rgba(34, 197, 94, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(34, 197, 94, 0.14) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(34, 197, 94, 0.18);\n}\n.scw-spell-card--skill[data-action=Aktion] {\n  --sc: #f59e0b;\n  border-color: rgba(245, 158, 11, 0.3);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(245, 158, 11, 0.06) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(245, 158, 11, 0.5);\n}\n.scw-spell-card--skill[data-action=Aktion].is-casting {\n  border-color: rgba(245, 158, 11, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(245, 158, 11, 0.15) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);\n}\n.scw-spell-card--skill[data-action=Bonusaktion] {\n  --sc: #a78bfa;\n  border-color: rgba(167, 139, 250, 0.3);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(167, 139, 250, 0.06) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(167, 139, 250, 0.5);\n}\n.scw-spell-card--skill[data-action=Bonusaktion].is-casting {\n  border-color: rgba(167, 139, 250, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(167, 139, 250, 0.15) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(167, 139, 250, 0.2);\n}\n.scw-spell-card--skill[data-action=Reaktion] {\n  --sc: #38bdf8;\n  border-color: rgba(56, 189, 248, 0.3);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(56, 189, 248, 0.06) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(56, 189, 248, 0.5);\n}\n.scw-spell-card--skill[data-action=Reaktion].is-casting {\n  border-color: rgba(56, 189, 248, 0.65);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(56, 189, 248, 0.15) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);\n}\n.scw-spell-card--skill[data-action="Keine Aktion"] {\n  --sc: #9ca3af;\n  border-color: rgba(156, 163, 175, 0.22);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(156, 163, 175, 0.04) 0%,\n      rgba(15, 23, 42, 0.8) 60%);\n  border-left: 3px solid rgba(156, 163, 175, 0.35);\n}\n.scw-skill-action-badge {\n  font-size: 0.6rem;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 3px;\n  flex-shrink: 0;\n  white-space: nowrap;\n  background: rgba(245, 158, 11, 0.16);\n  color: #f59e0b;\n  border: 1px solid rgba(245, 158, 11, 0.3);\n}\n.scw-skill-action-badge[data-action=Bonusaktion] {\n  background: rgba(167, 139, 250, 0.16);\n  color: #a78bfa;\n  border-color: rgba(167, 139, 250, 0.3);\n}\n.scw-skill-action-badge[data-action=Reaktion] {\n  background: rgba(56, 189, 248, 0.16);\n  color: #38bdf8;\n  border-color: rgba(56, 189, 248, 0.3);\n}\n.scw-skill-action-badge[data-action="Keine Aktion"] {\n  background: rgba(156, 163, 175, 0.12);\n  color: #9ca3af;\n  border-color: rgba(156, 163, 175, 0.25);\n}\n.scw-spell-action-type {\n  font-size: 0.68rem;\n  color: #fbbf24;\n  background: rgba(251, 191, 36, 0.1);\n  border-radius: 3px;\n  padding: 1px 5px;\n  margin-bottom: 0.25rem;\n  display: inline-block;\n}\n.scw-cost-chip--energy {\n  background: rgba(34, 197, 94, 0.15);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.3);\n  font-size: 0.72rem;\n  border-radius: 4px;\n  padding: 2px 6px;\n}\n.scw-cost-chip--life {\n  background: rgba(239, 68, 68, 0.15);\n  color: #f87171;\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  font-size: 0.72rem;\n  border-radius: 4px;\n  padding: 2px 6px;\n}\n.scw-active-type-badge {\n  font-size: 0.62rem;\n  font-weight: 700;\n  border-radius: 3px;\n  padding: 1px 5px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.scw-active-type-badge--spell {\n  background: rgba(139, 92, 246, 0.2);\n  color: #a78bfa;\n  border: 1px solid rgba(139, 92, 246, 0.35);\n}\n.scw-active-type-badge--skill {\n  background: rgba(34, 197, 94, 0.2);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.35);\n}\n.scw-active-type-badge--skill[data-action=Aktion] {\n  background: rgba(245, 158, 11, 0.2);\n  color: #f59e0b;\n  border: 1px solid rgba(245, 158, 11, 0.35);\n}\n.scw-active-type-badge--skill[data-action=Bonusaktion] {\n  background: rgba(167, 139, 250, 0.2);\n  color: #a78bfa;\n  border: 1px solid rgba(167, 139, 250, 0.35);\n}\n.scw-active-type-badge--skill[data-action=Reaktion] {\n  background: rgba(56, 189, 248, 0.2);\n  color: #38bdf8;\n  border: 1px solid rgba(56, 189, 248, 0.35);\n}\n.scw-active-type-badge--skill[data-action="Keine Aktion"] {\n  background: rgba(156, 163, 175, 0.15);\n  color: #9ca3af;\n  border: 1px solid rgba(156, 163, 175, 0.25);\n}\n.scw-active-card--skill {\n  --sc: #22c55e;\n  border-color: rgba(34, 197, 94, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(34, 197, 94, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action=Aktion] {\n  --sc: #f59e0b;\n  border-color: rgba(245, 158, 11, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(245, 158, 11, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action=Bonusaktion] {\n  --sc: #a78bfa;\n  border-color: rgba(167, 139, 250, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(167, 139, 250, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action=Reaktion] {\n  --sc: #38bdf8;\n  border-color: rgba(56, 189, 248, 0.35);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(56, 189, 248, 0.08) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-active-card--skill[data-action="Keine Aktion"] {\n  --sc: #9ca3af;\n  border-color: rgba(156, 163, 175, 0.25);\n  background:\n    linear-gradient(\n      145deg,\n      rgba(156, 163, 175, 0.05) 0%,\n      rgba(15, 23, 42, 0.9) 60%);\n}\n.scw-skill-modifiers {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  padding: 2px 0 2px 2px;\n}\n.scw-skill-mod {\n  font-size: 9px;\n  font-weight: 700;\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: rgba(100, 116, 139, 0.15);\n  color: #64748b;\n  border: 1px solid rgba(100, 116, 139, 0.2);\n}\n.scw-skill-mod.positive {\n  background: rgba(34, 197, 94, 0.12);\n  color: #4ade80;\n  border-color: rgba(34, 197, 94, 0.25);\n}\n.scw-skill-mod.negative {\n  background: rgba(239, 68, 68, 0.12);\n  color: #f87171;\n  border-color: rgba(239, 68, 68, 0.25);\n}\n.scw-active-dismiss-row {\n  padding: 4px 0 0;\n}\n.scw-dismiss-btn {\n  width: 100%;\n  padding: 5px 10px;\n  background: rgba(34, 197, 94, 0.1);\n  border: 1px solid rgba(34, 197, 94, 0.3);\n  border-radius: 5px;\n  color: #4ade80;\n  font-size: 11px;\n  font-weight: 700;\n  cursor: pointer;\n  transition: background 0.15s, border-color 0.15s;\n}\n.scw-dismiss-btn:hover {\n  background: rgba(34, 197, 94, 0.2);\n  border-color: rgba(34, 197, 94, 0.5);\n}\n.scw-active-meta-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 2px 0;\n  font-size: 10px;\n  color: #6b7280;\n}\n/*# sourceMappingURL=spellcast-window.component.css.map */\n'] }]
  }], null, { sheet: [{
    type: Input,
    args: [{ required: true }]
  }], defaultTab: [{
    type: Input
  }], patch: [{
    type: Output
  }], tabChange: [{
    type: Output
  }], close: [{
    type: Output
  }], onEscape: [{
    type: HostListener,
    args: ["document:keydown.escape"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SpellcastWindowComponent, { className: "SpellcastWindowComponent", filePath: "app/sheet/spellcast-window/spellcast-window.component.ts", lineNumber: 100 });
})();

// node_modules/@angular/cdk/fesm2022/_shadow-dom-chunk.mjs
var shadowDomIsSupported;
function _supportsShadowDom() {
  if (shadowDomIsSupported == null) {
    const head = typeof document !== "undefined" ? document.head : null;
    shadowDomIsSupported = !!(head && (head.createShadowRoot || head.attachShadow));
  }
  return shadowDomIsSupported;
}
function _getShadowRoot(element) {
  if (_supportsShadowDom()) {
    const rootNode = element.getRootNode ? element.getRootNode() : null;
    if (typeof ShadowRoot !== "undefined" && ShadowRoot && rootNode instanceof ShadowRoot) {
      return rootNode;
    }
  }
  return null;
}
function _getEventTarget(event) {
  return event.composedPath ? event.composedPath()[0] : event.target;
}

// node_modules/@angular/cdk/fesm2022/_fake-event-detection-chunk.mjs
function isFakeMousedownFromScreenReader(event) {
  return event.buttons === 0 || event.detail === 0;
}
function isFakeTouchstartFromScreenReader(event) {
  const touch = event.touches && event.touches[0] || event.changedTouches && event.changedTouches[0];
  return !!touch && touch.identifier === -1 && (touch.radiusX == null || touch.radiusX === 1) && (touch.radiusY == null || touch.radiusY === 1);
}

// node_modules/@angular/cdk/fesm2022/_element-chunk.mjs
function coerceNumberProperty(value, fallbackValue = 0) {
  if (_isNumberValue(value)) {
    return Number(value);
  }
  return arguments.length === 2 ? fallbackValue : 0;
}
function _isNumberValue(value) {
  return !isNaN(parseFloat(value)) && !isNaN(Number(value));
}
function coerceElement(elementOrRef) {
  return elementOrRef instanceof ElementRef ? elementOrRef.nativeElement : elementOrRef;
}

// node_modules/@angular/cdk/fesm2022/_style-loader-chunk.mjs
var appsWithLoaders = /* @__PURE__ */ new WeakMap();
var _CdkPrivateStyleLoader = class __CdkPrivateStyleLoader {
  _appRef;
  _injector = inject(Injector);
  _environmentInjector = inject(EnvironmentInjector);
  load(loader) {
    const appRef = this._appRef = this._appRef || this._injector.get(ApplicationRef);
    let data = appsWithLoaders.get(appRef);
    if (!data) {
      data = {
        loaders: /* @__PURE__ */ new Set(),
        refs: []
      };
      appsWithLoaders.set(appRef, data);
      appRef.onDestroy(() => {
        appsWithLoaders.get(appRef)?.refs.forEach((ref) => ref.destroy());
        appsWithLoaders.delete(appRef);
      });
    }
    if (!data.loaders.has(loader)) {
      data.loaders.add(loader);
      data.refs.push(createComponent(loader, {
        environmentInjector: this._environmentInjector
      }));
    }
  }
  static \u0275fac = function _CdkPrivateStyleLoader_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || __CdkPrivateStyleLoader)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: __CdkPrivateStyleLoader,
    factory: __CdkPrivateStyleLoader.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_CdkPrivateStyleLoader, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// node_modules/@angular/cdk/fesm2022/_platform-chunk.mjs
var hasV8BreakIterator;
try {
  hasV8BreakIterator = typeof Intl !== "undefined" && Intl.v8BreakIterator;
} catch {
  hasV8BreakIterator = false;
}
var Platform = class _Platform {
  _platformId = inject(PLATFORM_ID);
  isBrowser = this._platformId ? isPlatformBrowser(this._platformId) : typeof document === "object" && !!document;
  EDGE = this.isBrowser && /(edge)/i.test(navigator.userAgent);
  TRIDENT = this.isBrowser && /(msie|trident)/i.test(navigator.userAgent);
  BLINK = this.isBrowser && !!(window.chrome || hasV8BreakIterator) && typeof CSS !== "undefined" && !this.EDGE && !this.TRIDENT;
  WEBKIT = this.isBrowser && /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;
  IOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
  FIREFOX = this.isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);
  ANDROID = this.isBrowser && /android/i.test(navigator.userAgent) && !this.TRIDENT;
  SAFARI = this.isBrowser && /safari/i.test(navigator.userAgent) && this.WEBKIT;
  constructor() {
  }
  static \u0275fac = function Platform_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Platform)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _Platform,
    factory: _Platform.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Platform, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();

// node_modules/@angular/cdk/fesm2022/_directionality-chunk.mjs
var DIR_DOCUMENT = new InjectionToken("cdk-dir-doc", {
  providedIn: "root",
  factory: () => inject(DOCUMENT)
});
var RTL_LOCALE_PATTERN = /^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;
function _resolveDirectionality(rawValue) {
  const value = rawValue?.toLowerCase() || "";
  if (value === "auto" && typeof navigator !== "undefined" && navigator?.language) {
    return RTL_LOCALE_PATTERN.test(navigator.language) ? "rtl" : "ltr";
  }
  return value === "rtl" ? "rtl" : "ltr";
}
var Directionality = class _Directionality {
  get value() {
    return this.valueSignal();
  }
  valueSignal = signal("ltr", ...ngDevMode ? [{
    debugName: "valueSignal"
  }] : []);
  change = new EventEmitter();
  constructor() {
    const _document = inject(DIR_DOCUMENT, {
      optional: true
    });
    if (_document) {
      const bodyDir = _document.body ? _document.body.dir : null;
      const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
      this.valueSignal.set(_resolveDirectionality(bodyDir || htmlDir || "ltr"));
    }
  }
  ngOnDestroy() {
    this.change.complete();
  }
  static \u0275fac = function Directionality_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Directionality)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _Directionality,
    factory: _Directionality.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Directionality, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();

// node_modules/@angular/cdk/fesm2022/_scrolling-chunk.mjs
var RtlScrollAxisType;
(function(RtlScrollAxisType2) {
  RtlScrollAxisType2[RtlScrollAxisType2["NORMAL"] = 0] = "NORMAL";
  RtlScrollAxisType2[RtlScrollAxisType2["NEGATED"] = 1] = "NEGATED";
  RtlScrollAxisType2[RtlScrollAxisType2["INVERTED"] = 2] = "INVERTED";
})(RtlScrollAxisType || (RtlScrollAxisType = {}));
var rtlScrollAxisType;
var scrollBehaviorSupported;
function supportsScrollBehavior() {
  if (scrollBehaviorSupported == null) {
    if (typeof document !== "object" || !document || typeof Element !== "function" || !Element) {
      scrollBehaviorSupported = false;
      return scrollBehaviorSupported;
    }
    if (document.documentElement?.style && "scrollBehavior" in document.documentElement.style) {
      scrollBehaviorSupported = true;
    } else {
      const scrollToFunction = Element.prototype.scrollTo;
      if (scrollToFunction) {
        scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
      } else {
        scrollBehaviorSupported = false;
      }
    }
  }
  return scrollBehaviorSupported;
}
function getRtlScrollAxisType() {
  if (typeof document !== "object" || !document) {
    return RtlScrollAxisType.NORMAL;
  }
  if (rtlScrollAxisType == null) {
    const scrollContainer = document.createElement("div");
    const containerStyle = scrollContainer.style;
    scrollContainer.dir = "rtl";
    containerStyle.width = "1px";
    containerStyle.overflow = "auto";
    containerStyle.visibility = "hidden";
    containerStyle.pointerEvents = "none";
    containerStyle.position = "absolute";
    const content = document.createElement("div");
    const contentStyle = content.style;
    contentStyle.width = "2px";
    contentStyle.height = "1px";
    scrollContainer.appendChild(content);
    document.body.appendChild(scrollContainer);
    rtlScrollAxisType = RtlScrollAxisType.NORMAL;
    if (scrollContainer.scrollLeft === 0) {
      scrollContainer.scrollLeft = 1;
      rtlScrollAxisType = scrollContainer.scrollLeft === 0 ? RtlScrollAxisType.NEGATED : RtlScrollAxisType.INVERTED;
    }
    scrollContainer.remove();
  }
  return rtlScrollAxisType;
}

// node_modules/@angular/cdk/fesm2022/bidi.mjs
var Dir = class _Dir {
  _isInitialized = false;
  _rawDir;
  change = new EventEmitter();
  get dir() {
    return this.valueSignal();
  }
  set dir(value) {
    const previousValue = this.valueSignal();
    this.valueSignal.set(_resolveDirectionality(value));
    this._rawDir = value;
    if (previousValue !== this.valueSignal() && this._isInitialized) {
      this.change.emit(this.valueSignal());
    }
  }
  get value() {
    return this.dir;
  }
  valueSignal = signal("ltr", ...ngDevMode ? [{
    debugName: "valueSignal"
  }] : []);
  ngAfterContentInit() {
    this._isInitialized = true;
  }
  ngOnDestroy() {
    this.change.complete();
  }
  static \u0275fac = function Dir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Dir)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _Dir,
    selectors: [["", "dir", ""]],
    hostVars: 1,
    hostBindings: function Dir_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275attribute("dir", ctx._rawDir);
      }
    },
    inputs: {
      dir: "dir"
    },
    outputs: {
      change: "dirChange"
    },
    exportAs: ["dir"],
    features: [\u0275\u0275ProvidersFeature([{
      provide: Directionality,
      useExisting: _Dir
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Dir, [{
    type: Directive,
    args: [{
      selector: "[dir]",
      providers: [{
        provide: Directionality,
        useExisting: Dir
      }],
      host: {
        "[attr.dir]": "_rawDir"
      },
      exportAs: "dir"
    }]
  }], null, {
    change: [{
      type: Output,
      args: ["dirChange"]
    }],
    dir: [{
      type: Input
    }]
  });
})();
var BidiModule = class _BidiModule {
  static \u0275fac = function BidiModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BidiModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _BidiModule,
    imports: [Dir],
    exports: [Dir]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BidiModule, [{
    type: NgModule,
    args: [{
      imports: [Dir],
      exports: [Dir]
    }]
  }], null, null);
})();

// node_modules/@angular/cdk/fesm2022/_data-source-chunk.mjs
var DataSource = class {
};
function isDataSource(value) {
  return value && typeof value.connect === "function" && !(value instanceof ConnectableObservable);
}

// node_modules/@angular/cdk/fesm2022/_recycle-view-repeater-strategy-chunk.mjs
var ArrayDataSource = class extends DataSource {
  _data;
  constructor(_data) {
    super();
    this._data = _data;
  }
  connect() {
    return isObservable(this._data) ? this._data : of(this._data);
  }
  disconnect() {
  }
};
var _ViewRepeaterOperation;
(function(_ViewRepeaterOperation2) {
  _ViewRepeaterOperation2[_ViewRepeaterOperation2["REPLACED"] = 0] = "REPLACED";
  _ViewRepeaterOperation2[_ViewRepeaterOperation2["INSERTED"] = 1] = "INSERTED";
  _ViewRepeaterOperation2[_ViewRepeaterOperation2["MOVED"] = 2] = "MOVED";
  _ViewRepeaterOperation2[_ViewRepeaterOperation2["REMOVED"] = 3] = "REMOVED";
})(_ViewRepeaterOperation || (_ViewRepeaterOperation = {}));
var _VIEW_REPEATER_STRATEGY = new InjectionToken("_ViewRepeater");
var _RecycleViewRepeaterStrategy = class {
  viewCacheSize = 20;
  _viewCache = [];
  applyChanges(changes, viewContainerRef, itemContextFactory, itemValueResolver, itemViewChanged) {
    changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
      let view;
      let operation;
      if (record.previousIndex == null) {
        const viewArgsFactory = () => itemContextFactory(record, adjustedPreviousIndex, currentIndex);
        view = this._insertView(viewArgsFactory, currentIndex, viewContainerRef, itemValueResolver(record));
        operation = view ? _ViewRepeaterOperation.INSERTED : _ViewRepeaterOperation.REPLACED;
      } else if (currentIndex == null) {
        this._detachAndCacheView(adjustedPreviousIndex, viewContainerRef);
        operation = _ViewRepeaterOperation.REMOVED;
      } else {
        view = this._moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, itemValueResolver(record));
        operation = _ViewRepeaterOperation.MOVED;
      }
      if (itemViewChanged) {
        itemViewChanged({
          context: view?.context,
          operation,
          record
        });
      }
    });
  }
  detach() {
    for (const view of this._viewCache) {
      view.destroy();
    }
    this._viewCache = [];
  }
  _insertView(viewArgsFactory, currentIndex, viewContainerRef, value) {
    const cachedView = this._insertViewFromCache(currentIndex, viewContainerRef);
    if (cachedView) {
      cachedView.context.$implicit = value;
      return void 0;
    }
    const viewArgs = viewArgsFactory();
    return viewContainerRef.createEmbeddedView(viewArgs.templateRef, viewArgs.context, viewArgs.index);
  }
  _detachAndCacheView(index, viewContainerRef) {
    const detachedView = viewContainerRef.detach(index);
    this._maybeCacheView(detachedView, viewContainerRef);
  }
  _moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, value) {
    const view = viewContainerRef.get(adjustedPreviousIndex);
    viewContainerRef.move(view, currentIndex);
    view.context.$implicit = value;
    return view;
  }
  _maybeCacheView(view, viewContainerRef) {
    if (this._viewCache.length < this.viewCacheSize) {
      this._viewCache.push(view);
    } else {
      const index = viewContainerRef.indexOf(view);
      if (index === -1) {
        view.destroy();
      } else {
        viewContainerRef.remove(index);
      }
    }
  }
  _insertViewFromCache(index, viewContainerRef) {
    const cachedView = this._viewCache.pop();
    if (cachedView) {
      viewContainerRef.insert(cachedView, index);
    }
    return cachedView || null;
  }
};

// node_modules/@angular/cdk/fesm2022/scrolling.mjs
var _c0 = ["contentWrapper"];
var _c1 = ["*"];
var VIRTUAL_SCROLL_STRATEGY = new InjectionToken("VIRTUAL_SCROLL_STRATEGY");
var FixedSizeVirtualScrollStrategy = class {
  _scrolledIndexChange = new Subject();
  scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
  _viewport = null;
  _itemSize;
  _minBufferPx;
  _maxBufferPx;
  constructor(itemSize, minBufferPx, maxBufferPx) {
    this._itemSize = itemSize;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
  }
  attach(viewport) {
    this._viewport = viewport;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }
  detach() {
    this._scrolledIndexChange.complete();
    this._viewport = null;
  }
  updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
    if (maxBufferPx < minBufferPx && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw Error("CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx");
    }
    this._itemSize = itemSize;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }
  onContentScrolled() {
    this._updateRenderedRange();
  }
  onDataLengthChanged() {
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }
  onContentRendered() {
  }
  onRenderedOffsetChanged() {
  }
  scrollToIndex(index, behavior) {
    if (this._viewport) {
      this._viewport.scrollToOffset(index * this._itemSize, behavior);
    }
  }
  _updateTotalContentSize() {
    if (!this._viewport) {
      return;
    }
    this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
  }
  _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }
    const renderedRange = this._viewport.getRenderedRange();
    const newRange = {
      start: renderedRange.start,
      end: renderedRange.end
    };
    const viewportSize = this._viewport.getViewportSize();
    const dataLength = this._viewport.getDataLength();
    let scrollOffset = this._viewport.measureScrollOffset();
    let firstVisibleIndex = this._itemSize > 0 ? scrollOffset / this._itemSize : 0;
    if (newRange.end > dataLength) {
      const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
      const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
      if (firstVisibleIndex != newVisibleIndex) {
        firstVisibleIndex = newVisibleIndex;
        scrollOffset = newVisibleIndex * this._itemSize;
        newRange.start = Math.floor(firstVisibleIndex);
      }
      newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
    }
    const startBuffer = scrollOffset - newRange.start * this._itemSize;
    if (startBuffer < this._minBufferPx && newRange.start != 0) {
      const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
      newRange.start = Math.max(0, newRange.start - expandStart);
      newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
    } else {
      const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
      if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
        const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
        if (expandEnd > 0) {
          newRange.end = Math.min(dataLength, newRange.end + expandEnd);
          newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
        }
      }
    }
    this._viewport.setRenderedRange(newRange);
    this._viewport.setRenderedContentOffset(Math.round(this._itemSize * newRange.start));
    this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
  }
};
function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir) {
  return fixedSizeDir._scrollStrategy;
}
var CdkFixedSizeVirtualScroll = class _CdkFixedSizeVirtualScroll {
  get itemSize() {
    return this._itemSize;
  }
  set itemSize(value) {
    this._itemSize = coerceNumberProperty(value);
  }
  _itemSize = 20;
  get minBufferPx() {
    return this._minBufferPx;
  }
  set minBufferPx(value) {
    this._minBufferPx = coerceNumberProperty(value);
  }
  _minBufferPx = 100;
  get maxBufferPx() {
    return this._maxBufferPx;
  }
  set maxBufferPx(value) {
    this._maxBufferPx = coerceNumberProperty(value);
  }
  _maxBufferPx = 200;
  _scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.minBufferPx, this.maxBufferPx);
  ngOnChanges() {
    this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.minBufferPx, this.maxBufferPx);
  }
  static \u0275fac = function CdkFixedSizeVirtualScroll_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkFixedSizeVirtualScroll)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkFixedSizeVirtualScroll,
    selectors: [["cdk-virtual-scroll-viewport", "itemSize", ""]],
    inputs: {
      itemSize: "itemSize",
      minBufferPx: "minBufferPx",
      maxBufferPx: "maxBufferPx"
    },
    features: [\u0275\u0275ProvidersFeature([{
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _fixedSizeVirtualScrollStrategyFactory,
      deps: [forwardRef(() => _CdkFixedSizeVirtualScroll)]
    }]), \u0275\u0275NgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkFixedSizeVirtualScroll, [{
    type: Directive,
    args: [{
      selector: "cdk-virtual-scroll-viewport[itemSize]",
      providers: [{
        provide: VIRTUAL_SCROLL_STRATEGY,
        useFactory: _fixedSizeVirtualScrollStrategyFactory,
        deps: [forwardRef(() => CdkFixedSizeVirtualScroll)]
      }]
    }]
  }], null, {
    itemSize: [{
      type: Input
    }],
    minBufferPx: [{
      type: Input
    }],
    maxBufferPx: [{
      type: Input
    }]
  });
})();
var DEFAULT_SCROLL_TIME = 20;
var ScrollDispatcher = class _ScrollDispatcher {
  _ngZone = inject(NgZone);
  _platform = inject(Platform);
  _renderer = inject(RendererFactory2).createRenderer(null, null);
  _cleanupGlobalListener;
  constructor() {
  }
  _scrolled = new Subject();
  _scrolledCount = 0;
  scrollContainers = /* @__PURE__ */ new Map();
  register(scrollable) {
    if (!this.scrollContainers.has(scrollable)) {
      this.scrollContainers.set(scrollable, scrollable.elementScrolled().subscribe(() => this._scrolled.next(scrollable)));
    }
  }
  deregister(scrollable) {
    const scrollableReference = this.scrollContainers.get(scrollable);
    if (scrollableReference) {
      scrollableReference.unsubscribe();
      this.scrollContainers.delete(scrollable);
    }
  }
  scrolled(auditTimeInMs = DEFAULT_SCROLL_TIME) {
    if (!this._platform.isBrowser) {
      return of();
    }
    return new Observable((observer) => {
      if (!this._cleanupGlobalListener) {
        this._cleanupGlobalListener = this._ngZone.runOutsideAngular(() => this._renderer.listen("document", "scroll", () => this._scrolled.next()));
      }
      const subscription = auditTimeInMs > 0 ? this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer) : this._scrolled.subscribe(observer);
      this._scrolledCount++;
      return () => {
        subscription.unsubscribe();
        this._scrolledCount--;
        if (!this._scrolledCount) {
          this._cleanupGlobalListener?.();
          this._cleanupGlobalListener = void 0;
        }
      };
    });
  }
  ngOnDestroy() {
    this._cleanupGlobalListener?.();
    this._cleanupGlobalListener = void 0;
    this.scrollContainers.forEach((_, container) => this.deregister(container));
    this._scrolled.complete();
  }
  ancestorScrolled(elementOrElementRef, auditTimeInMs) {
    const ancestors = this.getAncestorScrollContainers(elementOrElementRef);
    return this.scrolled(auditTimeInMs).pipe(filter((target) => !target || ancestors.indexOf(target) > -1));
  }
  getAncestorScrollContainers(elementOrElementRef) {
    const scrollingContainers = [];
    this.scrollContainers.forEach((_subscription, scrollable) => {
      if (this._scrollableContainsElement(scrollable, elementOrElementRef)) {
        scrollingContainers.push(scrollable);
      }
    });
    return scrollingContainers;
  }
  _scrollableContainsElement(scrollable, elementOrElementRef) {
    let element = coerceElement(elementOrElementRef);
    let scrollableElement = scrollable.getElementRef().nativeElement;
    do {
      if (element == scrollableElement) {
        return true;
      }
    } while (element = element.parentElement);
    return false;
  }
  static \u0275fac = function ScrollDispatcher_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScrollDispatcher)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _ScrollDispatcher,
    factory: _ScrollDispatcher.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScrollDispatcher, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var CdkScrollable = class _CdkScrollable {
  elementRef = inject(ElementRef);
  scrollDispatcher = inject(ScrollDispatcher);
  ngZone = inject(NgZone);
  dir = inject(Directionality, {
    optional: true
  });
  _scrollElement = this.elementRef.nativeElement;
  _destroyed = new Subject();
  _renderer = inject(Renderer2);
  _cleanupScroll;
  _elementScrolled = new Subject();
  constructor() {
  }
  ngOnInit() {
    this._cleanupScroll = this.ngZone.runOutsideAngular(() => this._renderer.listen(this._scrollElement, "scroll", (event) => this._elementScrolled.next(event)));
    this.scrollDispatcher.register(this);
  }
  ngOnDestroy() {
    this._cleanupScroll?.();
    this._elementScrolled.complete();
    this.scrollDispatcher.deregister(this);
    this._destroyed.next();
    this._destroyed.complete();
  }
  elementScrolled() {
    return this._elementScrolled;
  }
  getElementRef() {
    return this.elementRef;
  }
  scrollTo(options) {
    const el = this.elementRef.nativeElement;
    const isRtl = this.dir && this.dir.value == "rtl";
    if (options.left == null) {
      options.left = isRtl ? options.end : options.start;
    }
    if (options.right == null) {
      options.right = isRtl ? options.start : options.end;
    }
    if (options.bottom != null) {
      options.top = el.scrollHeight - el.clientHeight - options.bottom;
    }
    if (isRtl && getRtlScrollAxisType() != RtlScrollAxisType.NORMAL) {
      if (options.left != null) {
        options.right = el.scrollWidth - el.clientWidth - options.left;
      }
      if (getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
        options.left = options.right;
      } else if (getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
        options.left = options.right ? -options.right : options.right;
      }
    } else {
      if (options.right != null) {
        options.left = el.scrollWidth - el.clientWidth - options.right;
      }
    }
    this._applyScrollToOptions(options);
  }
  _applyScrollToOptions(options) {
    const el = this.elementRef.nativeElement;
    if (supportsScrollBehavior()) {
      el.scrollTo(options);
    } else {
      if (options.top != null) {
        el.scrollTop = options.top;
      }
      if (options.left != null) {
        el.scrollLeft = options.left;
      }
    }
  }
  measureScrollOffset(from) {
    const LEFT = "left";
    const RIGHT = "right";
    const el = this.elementRef.nativeElement;
    if (from == "top") {
      return el.scrollTop;
    }
    if (from == "bottom") {
      return el.scrollHeight - el.clientHeight - el.scrollTop;
    }
    const isRtl = this.dir && this.dir.value == "rtl";
    if (from == "start") {
      from = isRtl ? RIGHT : LEFT;
    } else if (from == "end") {
      from = isRtl ? LEFT : RIGHT;
    }
    if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.INVERTED) {
      if (from == LEFT) {
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      } else {
        return el.scrollLeft;
      }
    } else if (isRtl && getRtlScrollAxisType() == RtlScrollAxisType.NEGATED) {
      if (from == LEFT) {
        return el.scrollLeft + el.scrollWidth - el.clientWidth;
      } else {
        return -el.scrollLeft;
      }
    } else {
      if (from == LEFT) {
        return el.scrollLeft;
      } else {
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      }
    }
  }
  static \u0275fac = function CdkScrollable_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkScrollable)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkScrollable,
    selectors: [["", "cdk-scrollable", ""], ["", "cdkScrollable", ""]]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkScrollable, [{
    type: Directive,
    args: [{
      selector: "[cdk-scrollable], [cdkScrollable]"
    }]
  }], () => [], null);
})();
var DEFAULT_RESIZE_TIME = 20;
var ViewportRuler = class _ViewportRuler {
  _platform = inject(Platform);
  _listeners;
  _viewportSize;
  _change = new Subject();
  _document = inject(DOCUMENT);
  constructor() {
    const ngZone = inject(NgZone);
    const renderer = inject(RendererFactory2).createRenderer(null, null);
    ngZone.runOutsideAngular(() => {
      if (this._platform.isBrowser) {
        const changeListener = (event) => this._change.next(event);
        this._listeners = [renderer.listen("window", "resize", changeListener), renderer.listen("window", "orientationchange", changeListener)];
      }
      this.change().subscribe(() => this._viewportSize = null);
    });
  }
  ngOnDestroy() {
    this._listeners?.forEach((cleanup) => cleanup());
    this._change.complete();
  }
  getViewportSize() {
    if (!this._viewportSize) {
      this._updateViewportSize();
    }
    const output = {
      width: this._viewportSize.width,
      height: this._viewportSize.height
    };
    if (!this._platform.isBrowser) {
      this._viewportSize = null;
    }
    return output;
  }
  getViewportRect() {
    const scrollPosition = this.getViewportScrollPosition();
    const {
      width,
      height
    } = this.getViewportSize();
    return {
      top: scrollPosition.top,
      left: scrollPosition.left,
      bottom: scrollPosition.top + height,
      right: scrollPosition.left + width,
      height,
      width
    };
  }
  getViewportScrollPosition() {
    if (!this._platform.isBrowser) {
      return {
        top: 0,
        left: 0
      };
    }
    const document2 = this._document;
    const window2 = this._getWindow();
    const documentElement = document2.documentElement;
    const documentRect = documentElement.getBoundingClientRect();
    const top = -documentRect.top || document2.body.scrollTop || window2.scrollY || documentElement.scrollTop || 0;
    const left = -documentRect.left || document2.body.scrollLeft || window2.scrollX || documentElement.scrollLeft || 0;
    return {
      top,
      left
    };
  }
  change(throttleTime = DEFAULT_RESIZE_TIME) {
    return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
  }
  _getWindow() {
    return this._document.defaultView || window;
  }
  _updateViewportSize() {
    const window2 = this._getWindow();
    this._viewportSize = this._platform.isBrowser ? {
      width: window2.innerWidth,
      height: window2.innerHeight
    } : {
      width: 0,
      height: 0
    };
  }
  static \u0275fac = function ViewportRuler_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ViewportRuler)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _ViewportRuler,
    factory: _ViewportRuler.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ViewportRuler, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var VIRTUAL_SCROLLABLE = new InjectionToken("VIRTUAL_SCROLLABLE");
var CdkVirtualScrollable = class _CdkVirtualScrollable extends CdkScrollable {
  constructor() {
    super();
  }
  measureViewportSize(orientation) {
    const viewportEl = this.elementRef.nativeElement;
    return orientation === "horizontal" ? viewportEl.clientWidth : viewportEl.clientHeight;
  }
  static \u0275fac = function CdkVirtualScrollable_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkVirtualScrollable)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkVirtualScrollable,
    features: [\u0275\u0275InheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollable, [{
    type: Directive
  }], () => [], null);
})();
function rangesEqual(r1, r2) {
  return r1.start == r2.start && r1.end == r2.end;
}
var SCROLL_SCHEDULER = typeof requestAnimationFrame !== "undefined" ? animationFrameScheduler : asapScheduler;
var CdkVirtualScrollViewport = class _CdkVirtualScrollViewport extends CdkVirtualScrollable {
  elementRef = inject(ElementRef);
  _changeDetectorRef = inject(ChangeDetectorRef);
  _scrollStrategy = inject(VIRTUAL_SCROLL_STRATEGY, {
    optional: true
  });
  scrollable = inject(VIRTUAL_SCROLLABLE, {
    optional: true
  });
  _platform = inject(Platform);
  _detachedSubject = new Subject();
  _renderedRangeSubject = new Subject();
  get orientation() {
    return this._orientation;
  }
  set orientation(orientation) {
    if (this._orientation !== orientation) {
      this._orientation = orientation;
      this._calculateSpacerSize();
    }
  }
  _orientation = "vertical";
  appendOnly = false;
  scrolledIndexChange = new Observable((observer) => this._scrollStrategy.scrolledIndexChange.subscribe((index) => Promise.resolve().then(() => this.ngZone.run(() => observer.next(index)))));
  _contentWrapper;
  renderedRangeStream = this._renderedRangeSubject;
  _totalContentSize = 0;
  _totalContentWidth = signal("", ...ngDevMode ? [{
    debugName: "_totalContentWidth"
  }] : []);
  _totalContentHeight = signal("", ...ngDevMode ? [{
    debugName: "_totalContentHeight"
  }] : []);
  _renderedContentTransform;
  _renderedRange = {
    start: 0,
    end: 0
  };
  _dataLength = 0;
  _viewportSize = 0;
  _forOf;
  _renderedContentOffset = 0;
  _renderedContentOffsetNeedsRewrite = false;
  _changeDetectionNeeded = signal(false, ...ngDevMode ? [{
    debugName: "_changeDetectionNeeded"
  }] : []);
  _runAfterChangeDetection = [];
  _viewportChanges = Subscription.EMPTY;
  _injector = inject(Injector);
  _isDestroyed = false;
  constructor() {
    super();
    const viewportRuler = inject(ViewportRuler);
    if (!this._scrollStrategy && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw Error('Error: cdk-virtual-scroll-viewport requires the "itemSize" property to be set.');
    }
    this._viewportChanges = viewportRuler.change().subscribe(() => {
      this.checkViewportSize();
    });
    if (!this.scrollable) {
      this.elementRef.nativeElement.classList.add("cdk-virtual-scrollable");
      this.scrollable = this;
    }
    const ref = effect(() => {
      if (this._changeDetectionNeeded()) {
        this._doChangeDetection();
      }
    }, __spreadProps(__spreadValues({}, ngDevMode ? {
      debugName: "ref"
    } : {}), {
      injector: inject(ApplicationRef).injector
    }));
    inject(DestroyRef).onDestroy(() => void ref.destroy());
  }
  ngOnInit() {
    if (!this._platform.isBrowser) {
      return;
    }
    if (this.scrollable === this) {
      super.ngOnInit();
    }
    this.ngZone.runOutsideAngular(() => Promise.resolve().then(() => {
      this._measureViewportSize();
      this._scrollStrategy.attach(this);
      this.scrollable.elementScrolled().pipe(startWith(null), auditTime(0, SCROLL_SCHEDULER), takeUntil(this._destroyed)).subscribe(() => this._scrollStrategy.onContentScrolled());
      this._markChangeDetectionNeeded();
    }));
  }
  ngOnDestroy() {
    this.detach();
    this._scrollStrategy.detach();
    this._renderedRangeSubject.complete();
    this._detachedSubject.complete();
    this._viewportChanges.unsubscribe();
    this._isDestroyed = true;
    super.ngOnDestroy();
  }
  attach(forOf) {
    if (this._forOf && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw Error("CdkVirtualScrollViewport is already attached.");
    }
    this.ngZone.runOutsideAngular(() => {
      this._forOf = forOf;
      this._forOf.dataStream.pipe(takeUntil(this._detachedSubject)).subscribe((data) => {
        const newLength = data.length;
        if (newLength !== this._dataLength) {
          this._dataLength = newLength;
          this._scrollStrategy.onDataLengthChanged();
        }
        this._doChangeDetection();
      });
    });
  }
  detach() {
    this._forOf = null;
    this._detachedSubject.next();
  }
  getDataLength() {
    return this._dataLength;
  }
  getViewportSize() {
    return this._viewportSize;
  }
  getRenderedRange() {
    return this._renderedRange;
  }
  measureBoundingClientRectWithScrollOffset(from) {
    return this.getElementRef().nativeElement.getBoundingClientRect()[from];
  }
  setTotalContentSize(size) {
    if (this._totalContentSize !== size) {
      this._totalContentSize = size;
      this._calculateSpacerSize();
      this._markChangeDetectionNeeded();
    }
  }
  setRenderedRange(range) {
    if (!rangesEqual(this._renderedRange, range)) {
      if (this.appendOnly) {
        range = {
          start: 0,
          end: Math.max(this._renderedRange.end, range.end)
        };
      }
      this._renderedRangeSubject.next(this._renderedRange = range);
      this._markChangeDetectionNeeded(() => this._scrollStrategy.onContentRendered());
    }
  }
  getOffsetToRenderedContentStart() {
    return this._renderedContentOffsetNeedsRewrite ? null : this._renderedContentOffset;
  }
  setRenderedContentOffset(offset, to = "to-start") {
    offset = this.appendOnly && to === "to-start" ? 0 : offset;
    const isRtl = this.dir && this.dir.value == "rtl";
    const isHorizontal = this.orientation == "horizontal";
    const axis = isHorizontal ? "X" : "Y";
    const axisDirection = isHorizontal && isRtl ? -1 : 1;
    let transform = `translate${axis}(${Number(axisDirection * offset)}px)`;
    this._renderedContentOffset = offset;
    if (to === "to-end") {
      transform += ` translate${axis}(-100%)`;
      this._renderedContentOffsetNeedsRewrite = true;
    }
    if (this._renderedContentTransform != transform) {
      this._renderedContentTransform = transform;
      this._markChangeDetectionNeeded(() => {
        if (this._renderedContentOffsetNeedsRewrite) {
          this._renderedContentOffset -= this.measureRenderedContentSize();
          this._renderedContentOffsetNeedsRewrite = false;
          this.setRenderedContentOffset(this._renderedContentOffset);
        } else {
          this._scrollStrategy.onRenderedOffsetChanged();
        }
      });
    }
  }
  scrollToOffset(offset, behavior = "auto") {
    const options = {
      behavior
    };
    if (this.orientation === "horizontal") {
      options.start = offset;
    } else {
      options.top = offset;
    }
    this.scrollable.scrollTo(options);
  }
  scrollToIndex(index, behavior = "auto") {
    this._scrollStrategy.scrollToIndex(index, behavior);
  }
  measureScrollOffset(from) {
    let measureScrollOffset;
    if (this.scrollable == this) {
      measureScrollOffset = (_from) => super.measureScrollOffset(_from);
    } else {
      measureScrollOffset = (_from) => this.scrollable.measureScrollOffset(_from);
    }
    return Math.max(0, measureScrollOffset(from ?? (this.orientation === "horizontal" ? "start" : "top")) - this.measureViewportOffset());
  }
  measureViewportOffset(from) {
    let fromRect;
    const LEFT = "left";
    const RIGHT = "right";
    const isRtl = this.dir?.value == "rtl";
    if (from == "start") {
      fromRect = isRtl ? RIGHT : LEFT;
    } else if (from == "end") {
      fromRect = isRtl ? LEFT : RIGHT;
    } else if (from) {
      fromRect = from;
    } else {
      fromRect = this.orientation === "horizontal" ? "left" : "top";
    }
    const scrollerClientRect = this.scrollable.measureBoundingClientRectWithScrollOffset(fromRect);
    const viewportClientRect = this.elementRef.nativeElement.getBoundingClientRect()[fromRect];
    return viewportClientRect - scrollerClientRect;
  }
  measureRenderedContentSize() {
    const contentEl = this._contentWrapper.nativeElement;
    return this.orientation === "horizontal" ? contentEl.offsetWidth : contentEl.offsetHeight;
  }
  measureRangeSize(range) {
    if (!this._forOf) {
      return 0;
    }
    return this._forOf.measureRangeSize(range, this.orientation);
  }
  checkViewportSize() {
    this._measureViewportSize();
    this._scrollStrategy.onDataLengthChanged();
  }
  _measureViewportSize() {
    this._viewportSize = this.scrollable.measureViewportSize(this.orientation);
  }
  _markChangeDetectionNeeded(runAfter) {
    if (runAfter) {
      this._runAfterChangeDetection.push(runAfter);
    }
    if (untracked(this._changeDetectionNeeded)) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        this.ngZone.run(() => {
          this._changeDetectionNeeded.set(true);
        });
      });
    });
  }
  _doChangeDetection() {
    if (this._isDestroyed) {
      return;
    }
    this.ngZone.run(() => {
      this._changeDetectorRef.markForCheck();
      this._contentWrapper.nativeElement.style.transform = this._renderedContentTransform;
      afterNextRender(() => {
        this._changeDetectionNeeded.set(false);
        const runAfterChangeDetection = this._runAfterChangeDetection;
        this._runAfterChangeDetection = [];
        for (const fn of runAfterChangeDetection) {
          fn();
        }
      }, {
        injector: this._injector
      });
    });
  }
  _calculateSpacerSize() {
    this._totalContentHeight.set(this.orientation === "horizontal" ? "" : `${this._totalContentSize}px`);
    this._totalContentWidth.set(this.orientation === "horizontal" ? `${this._totalContentSize}px` : "");
  }
  static \u0275fac = function CdkVirtualScrollViewport_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkVirtualScrollViewport)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _CdkVirtualScrollViewport,
    selectors: [["cdk-virtual-scroll-viewport"]],
    viewQuery: function CdkVirtualScrollViewport_Query(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275viewQuery(_c0, 7);
      }
      if (rf & 2) {
        let _t;
        \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx._contentWrapper = _t.first);
      }
    },
    hostAttrs: [1, "cdk-virtual-scroll-viewport"],
    hostVars: 4,
    hostBindings: function CdkVirtualScrollViewport_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275classProp("cdk-virtual-scroll-orientation-horizontal", ctx.orientation === "horizontal")("cdk-virtual-scroll-orientation-vertical", ctx.orientation !== "horizontal");
      }
    },
    inputs: {
      orientation: "orientation",
      appendOnly: [2, "appendOnly", "appendOnly", booleanAttribute]
    },
    outputs: {
      scrolledIndexChange: "scrolledIndexChange"
    },
    features: [\u0275\u0275ProvidersFeature([{
      provide: CdkScrollable,
      useFactory: () => inject(VIRTUAL_SCROLLABLE, {
        optional: true
      }) || inject(_CdkVirtualScrollViewport)
    }]), \u0275\u0275InheritDefinitionFeature],
    ngContentSelectors: _c1,
    decls: 4,
    vars: 4,
    consts: [["contentWrapper", ""], [1, "cdk-virtual-scroll-content-wrapper"], [1, "cdk-virtual-scroll-spacer"]],
    template: function CdkVirtualScrollViewport_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275projectionDef();
        \u0275\u0275domElementStart(0, "div", 1, 0);
        \u0275\u0275projection(2);
        \u0275\u0275domElementEnd();
        \u0275\u0275domElement(3, "div", 2);
      }
      if (rf & 2) {
        \u0275\u0275advance(3);
        \u0275\u0275styleProp("width", ctx._totalContentWidth())("height", ctx._totalContentHeight());
      }
    },
    styles: ["cdk-virtual-scroll-viewport{display:block;position:relative;transform:translateZ(0)}.cdk-virtual-scrollable{overflow:auto;will-change:scroll-position;contain:strict}.cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{height:1px;transform-origin:0 0;flex:0 0 auto}[dir=rtl] .cdk-virtual-scroll-spacer{transform-origin:100% 0}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollViewport, [{
    type: Component,
    args: [{
      selector: "cdk-virtual-scroll-viewport",
      host: {
        "class": "cdk-virtual-scroll-viewport",
        "[class.cdk-virtual-scroll-orientation-horizontal]": 'orientation === "horizontal"',
        "[class.cdk-virtual-scroll-orientation-vertical]": 'orientation !== "horizontal"'
      },
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [{
        provide: CdkScrollable,
        useFactory: () => inject(VIRTUAL_SCROLLABLE, {
          optional: true
        }) || inject(CdkVirtualScrollViewport)
      }],
      template: '<!--\n  Wrap the rendered content in an element that will be used to offset it based on the scroll\n  position.\n-->\n<div #contentWrapper class="cdk-virtual-scroll-content-wrapper">\n  <ng-content></ng-content>\n</div>\n<!--\n  Spacer used to force the scrolling container to the correct size for the *total* number of items\n  so that the scrollbar captures the size of the entire data set.\n-->\n<div class="cdk-virtual-scroll-spacer"\n     [style.width]="_totalContentWidth()" [style.height]="_totalContentHeight()"></div>\n',
      styles: ["cdk-virtual-scroll-viewport{display:block;position:relative;transform:translateZ(0)}.cdk-virtual-scrollable{overflow:auto;will-change:scroll-position;contain:strict}.cdk-virtual-scroll-content-wrapper{position:absolute;top:0;left:0;contain:content}[dir=rtl] .cdk-virtual-scroll-content-wrapper{right:0;left:auto}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper{min-height:100%}.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-horizontal .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-left:0;padding-right:0;margin-left:0;margin-right:0;border-left-width:0;border-right-width:0;outline:none}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper{min-width:100%}.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>dl:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ol:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>table:not([cdkVirtualFor]),.cdk-virtual-scroll-orientation-vertical .cdk-virtual-scroll-content-wrapper>ul:not([cdkVirtualFor]){padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;outline:none}.cdk-virtual-scroll-spacer{height:1px;transform-origin:0 0;flex:0 0 auto}[dir=rtl] .cdk-virtual-scroll-spacer{transform-origin:100% 0}\n"]
    }]
  }], () => [], {
    orientation: [{
      type: Input
    }],
    appendOnly: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    scrolledIndexChange: [{
      type: Output
    }],
    _contentWrapper: [{
      type: ViewChild,
      args: ["contentWrapper", {
        static: true
      }]
    }]
  });
})();
function getOffset(orientation, direction, node) {
  const el = node;
  if (!el.getBoundingClientRect) {
    return 0;
  }
  const rect = el.getBoundingClientRect();
  if (orientation === "horizontal") {
    return direction === "start" ? rect.left : rect.right;
  }
  return direction === "start" ? rect.top : rect.bottom;
}
var CdkVirtualForOf = class _CdkVirtualForOf {
  _viewContainerRef = inject(ViewContainerRef);
  _template = inject(TemplateRef);
  _differs = inject(IterableDiffers);
  _viewRepeater = inject(_VIEW_REPEATER_STRATEGY);
  _viewport = inject(CdkVirtualScrollViewport, {
    skipSelf: true
  });
  viewChange = new Subject();
  _dataSourceChanges = new Subject();
  get cdkVirtualForOf() {
    return this._cdkVirtualForOf;
  }
  set cdkVirtualForOf(value) {
    this._cdkVirtualForOf = value;
    if (isDataSource(value)) {
      this._dataSourceChanges.next(value);
    } else {
      this._dataSourceChanges.next(new ArrayDataSource(isObservable(value) ? value : Array.from(value || [])));
    }
  }
  _cdkVirtualForOf;
  get cdkVirtualForTrackBy() {
    return this._cdkVirtualForTrackBy;
  }
  set cdkVirtualForTrackBy(fn) {
    this._needsUpdate = true;
    this._cdkVirtualForTrackBy = fn ? (index, item) => fn(index + (this._renderedRange ? this._renderedRange.start : 0), item) : void 0;
  }
  _cdkVirtualForTrackBy;
  set cdkVirtualForTemplate(value) {
    if (value) {
      this._needsUpdate = true;
      this._template = value;
    }
  }
  get cdkVirtualForTemplateCacheSize() {
    return this._viewRepeater.viewCacheSize;
  }
  set cdkVirtualForTemplateCacheSize(size) {
    this._viewRepeater.viewCacheSize = coerceNumberProperty(size);
  }
  dataStream = this._dataSourceChanges.pipe(startWith(null), pairwise(), switchMap(([prev, cur]) => this._changeDataSource(prev, cur)), shareReplay(1));
  _differ = null;
  _data;
  _renderedItems;
  _renderedRange;
  _needsUpdate = false;
  _destroyed = new Subject();
  constructor() {
    const ngZone = inject(NgZone);
    this.dataStream.subscribe((data) => {
      this._data = data;
      this._onRenderedDataChange();
    });
    this._viewport.renderedRangeStream.pipe(takeUntil(this._destroyed)).subscribe((range) => {
      this._renderedRange = range;
      if (this.viewChange.observers.length) {
        ngZone.run(() => this.viewChange.next(this._renderedRange));
      }
      this._onRenderedDataChange();
    });
    this._viewport.attach(this);
  }
  measureRangeSize(range, orientation) {
    if (range.start >= range.end) {
      return 0;
    }
    if ((range.start < this._renderedRange.start || range.end > this._renderedRange.end) && (typeof ngDevMode === "undefined" || ngDevMode)) {
      throw Error(`Error: attempted to measure an item that isn't rendered.`);
    }
    const renderedStartIndex = range.start - this._renderedRange.start;
    const rangeLen = range.end - range.start;
    let firstNode;
    let lastNode;
    for (let i = 0; i < rangeLen; i++) {
      const view = this._viewContainerRef.get(i + renderedStartIndex);
      if (view && view.rootNodes.length) {
        firstNode = lastNode = view.rootNodes[0];
        break;
      }
    }
    for (let i = rangeLen - 1; i > -1; i--) {
      const view = this._viewContainerRef.get(i + renderedStartIndex);
      if (view && view.rootNodes.length) {
        lastNode = view.rootNodes[view.rootNodes.length - 1];
        break;
      }
    }
    return firstNode && lastNode ? getOffset(orientation, "end", lastNode) - getOffset(orientation, "start", firstNode) : 0;
  }
  ngDoCheck() {
    if (this._differ && this._needsUpdate) {
      const changes = this._differ.diff(this._renderedItems);
      if (!changes) {
        this._updateContext();
      } else {
        this._applyChanges(changes);
      }
      this._needsUpdate = false;
    }
  }
  ngOnDestroy() {
    this._viewport.detach();
    this._dataSourceChanges.next(void 0);
    this._dataSourceChanges.complete();
    this.viewChange.complete();
    this._destroyed.next();
    this._destroyed.complete();
    this._viewRepeater.detach();
  }
  _onRenderedDataChange() {
    if (!this._renderedRange) {
      return;
    }
    this._renderedItems = this._data.slice(this._renderedRange.start, this._renderedRange.end);
    if (!this._differ) {
      this._differ = this._differs.find(this._renderedItems).create((index, item) => {
        return this.cdkVirtualForTrackBy ? this.cdkVirtualForTrackBy(index, item) : item;
      });
    }
    this._needsUpdate = true;
  }
  _changeDataSource(oldDs, newDs) {
    if (oldDs) {
      oldDs.disconnect(this);
    }
    this._needsUpdate = true;
    return newDs ? newDs.connect(this) : of();
  }
  _updateContext() {
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      const view = this._viewContainerRef.get(i);
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }
  _applyChanges(changes) {
    this._viewRepeater.applyChanges(changes, this._viewContainerRef, (record, _adjustedPreviousIndex, currentIndex) => this._getEmbeddedViewArgs(record, currentIndex), (record) => record.item);
    changes.forEachIdentityChange((record) => {
      const view = this._viewContainerRef.get(record.currentIndex);
      view.context.$implicit = record.item;
    });
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      const view = this._viewContainerRef.get(i);
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
    }
  }
  _updateComputedContextProperties(context) {
    context.first = context.index === 0;
    context.last = context.index === context.count - 1;
    context.even = context.index % 2 === 0;
    context.odd = !context.even;
  }
  _getEmbeddedViewArgs(record, index) {
    return {
      templateRef: this._template,
      context: {
        $implicit: record.item,
        cdkVirtualForOf: this._cdkVirtualForOf,
        index: -1,
        count: -1,
        first: false,
        last: false,
        odd: false,
        even: false
      },
      index
    };
  }
  static ngTemplateContextGuard(directive, context) {
    return true;
  }
  static \u0275fac = function CdkVirtualForOf_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkVirtualForOf)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkVirtualForOf,
    selectors: [["", "cdkVirtualFor", "", "cdkVirtualForOf", ""]],
    inputs: {
      cdkVirtualForOf: "cdkVirtualForOf",
      cdkVirtualForTrackBy: "cdkVirtualForTrackBy",
      cdkVirtualForTemplate: "cdkVirtualForTemplate",
      cdkVirtualForTemplateCacheSize: "cdkVirtualForTemplateCacheSize"
    },
    features: [\u0275\u0275ProvidersFeature([{
      provide: _VIEW_REPEATER_STRATEGY,
      useClass: _RecycleViewRepeaterStrategy
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualForOf, [{
    type: Directive,
    args: [{
      selector: "[cdkVirtualFor][cdkVirtualForOf]",
      providers: [{
        provide: _VIEW_REPEATER_STRATEGY,
        useClass: _RecycleViewRepeaterStrategy
      }]
    }]
  }], () => [], {
    cdkVirtualForOf: [{
      type: Input
    }],
    cdkVirtualForTrackBy: [{
      type: Input
    }],
    cdkVirtualForTemplate: [{
      type: Input
    }],
    cdkVirtualForTemplateCacheSize: [{
      type: Input
    }]
  });
})();
var CdkVirtualScrollableElement = class _CdkVirtualScrollableElement extends CdkVirtualScrollable {
  constructor() {
    super();
  }
  measureBoundingClientRectWithScrollOffset(from) {
    return this.getElementRef().nativeElement.getBoundingClientRect()[from] - this.measureScrollOffset(from);
  }
  static \u0275fac = function CdkVirtualScrollableElement_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkVirtualScrollableElement)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkVirtualScrollableElement,
    selectors: [["", "cdkVirtualScrollingElement", ""]],
    hostAttrs: [1, "cdk-virtual-scrollable"],
    features: [\u0275\u0275ProvidersFeature([{
      provide: VIRTUAL_SCROLLABLE,
      useExisting: _CdkVirtualScrollableElement
    }]), \u0275\u0275InheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollableElement, [{
    type: Directive,
    args: [{
      selector: "[cdkVirtualScrollingElement]",
      providers: [{
        provide: VIRTUAL_SCROLLABLE,
        useExisting: CdkVirtualScrollableElement
      }],
      host: {
        "class": "cdk-virtual-scrollable"
      }
    }]
  }], () => [], null);
})();
var CdkVirtualScrollableWindow = class _CdkVirtualScrollableWindow extends CdkVirtualScrollable {
  constructor() {
    super();
    const document2 = inject(DOCUMENT);
    this.elementRef = new ElementRef(document2.documentElement);
    this._scrollElement = document2;
  }
  measureBoundingClientRectWithScrollOffset(from) {
    return this.getElementRef().nativeElement.getBoundingClientRect()[from];
  }
  static \u0275fac = function CdkVirtualScrollableWindow_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkVirtualScrollableWindow)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkVirtualScrollableWindow,
    selectors: [["cdk-virtual-scroll-viewport", "scrollWindow", ""]],
    features: [\u0275\u0275ProvidersFeature([{
      provide: VIRTUAL_SCROLLABLE,
      useExisting: _CdkVirtualScrollableWindow
    }]), \u0275\u0275InheritDefinitionFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkVirtualScrollableWindow, [{
    type: Directive,
    args: [{
      selector: "cdk-virtual-scroll-viewport[scrollWindow]",
      providers: [{
        provide: VIRTUAL_SCROLLABLE,
        useExisting: CdkVirtualScrollableWindow
      }]
    }]
  }], () => [], null);
})();
var CdkScrollableModule = class _CdkScrollableModule {
  static \u0275fac = function CdkScrollableModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkScrollableModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _CdkScrollableModule,
    imports: [CdkScrollable],
    exports: [CdkScrollable]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkScrollableModule, [{
    type: NgModule,
    args: [{
      exports: [CdkScrollable],
      imports: [CdkScrollable]
    }]
  }], null, null);
})();
var ScrollingModule = class _ScrollingModule {
  static \u0275fac = function ScrollingModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScrollingModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ScrollingModule,
    imports: [BidiModule, CdkScrollableModule, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollableWindow, CdkVirtualScrollableElement],
    exports: [BidiModule, CdkScrollableModule, CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport, CdkVirtualScrollableWindow, CdkVirtualScrollableElement]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    imports: [BidiModule, CdkScrollableModule, BidiModule, CdkScrollableModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScrollingModule, [{
    type: NgModule,
    args: [{
      imports: [BidiModule, CdkScrollableModule, CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollableWindow, CdkVirtualScrollableElement],
      exports: [BidiModule, CdkScrollableModule, CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport, CdkVirtualScrollableWindow, CdkVirtualScrollableElement]
    }]
  }], null, null);
})();

// node_modules/@angular/cdk/fesm2022/_id-generator-chunk.mjs
var counters = {};
var _IdGenerator = class __IdGenerator {
  _appId = inject(APP_ID);
  static _infix = `a${Math.floor(Math.random() * 1e5).toString()}`;
  getId(prefix, randomize = false) {
    if (this._appId !== "ng") {
      prefix += this._appId;
    }
    if (!counters.hasOwnProperty(prefix)) {
      counters[prefix] = 0;
    }
    return `${prefix}${randomize ? __IdGenerator._infix + "-" : ""}${counters[prefix]++}`;
  }
  static \u0275fac = function _IdGenerator_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || __IdGenerator)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: __IdGenerator,
    factory: __IdGenerator.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_IdGenerator, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// node_modules/@angular/cdk/fesm2022/_array-chunk.mjs
function coerceArray(value) {
  return Array.isArray(value) ? value : [value];
}

// node_modules/@angular/cdk/fesm2022/drag-drop.mjs
function deepCloneNode(node) {
  const clone = node.cloneNode(true);
  const descendantsWithId = clone.querySelectorAll("[id]");
  const nodeName = node.nodeName.toLowerCase();
  clone.removeAttribute("id");
  for (let i = 0; i < descendantsWithId.length; i++) {
    descendantsWithId[i].removeAttribute("id");
  }
  if (nodeName === "canvas") {
    transferCanvasData(node, clone);
  } else if (nodeName === "input" || nodeName === "select" || nodeName === "textarea") {
    transferInputData(node, clone);
  }
  transferData("canvas", node, clone, transferCanvasData);
  transferData("input, textarea, select", node, clone, transferInputData);
  return clone;
}
function transferData(selector, node, clone, callback) {
  const descendantElements = node.querySelectorAll(selector);
  if (descendantElements.length) {
    const cloneElements = clone.querySelectorAll(selector);
    for (let i = 0; i < descendantElements.length; i++) {
      callback(descendantElements[i], cloneElements[i]);
    }
  }
}
var cloneUniqueId = 0;
function transferInputData(source, clone) {
  if (clone.type !== "file") {
    clone.value = source.value;
  }
  if (clone.type === "radio" && clone.name) {
    clone.name = `mat-clone-${clone.name}-${cloneUniqueId++}`;
  }
}
function transferCanvasData(source, clone) {
  const context = clone.getContext("2d");
  if (context) {
    try {
      context.drawImage(source, 0, 0);
    } catch {
    }
  }
}
function getMutableClientRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y
  };
}
function isInsideClientRect(clientRect, x, y) {
  const {
    top,
    bottom,
    left,
    right
  } = clientRect;
  return y >= top && y <= bottom && x >= left && x <= right;
}
function isOverflowingParent(parentRect, childRect) {
  const isLeftOverflowing = childRect.left < parentRect.left;
  const isRightOverflowing = childRect.left + childRect.width > parentRect.right;
  const isTopOverflowing = childRect.top < parentRect.top;
  const isBottomOverflowing = childRect.top + childRect.height > parentRect.bottom;
  return isLeftOverflowing || isRightOverflowing || isTopOverflowing || isBottomOverflowing;
}
function adjustDomRect(domRect, top, left) {
  domRect.top += top;
  domRect.bottom = domRect.top + domRect.height;
  domRect.left += left;
  domRect.right = domRect.left + domRect.width;
}
function isPointerNearDomRect(rect, threshold, pointerX, pointerY) {
  const {
    top,
    right,
    bottom,
    left,
    width,
    height
  } = rect;
  const xThreshold = width * threshold;
  const yThreshold = height * threshold;
  return pointerY > top - yThreshold && pointerY < bottom + yThreshold && pointerX > left - xThreshold && pointerX < right + xThreshold;
}
var ParentPositionTracker = class {
  _document;
  positions = /* @__PURE__ */ new Map();
  constructor(_document) {
    this._document = _document;
  }
  clear() {
    this.positions.clear();
  }
  cache(elements) {
    this.clear();
    this.positions.set(this._document, {
      scrollPosition: this.getViewportScrollPosition()
    });
    elements.forEach((element) => {
      this.positions.set(element, {
        scrollPosition: {
          top: element.scrollTop,
          left: element.scrollLeft
        },
        clientRect: getMutableClientRect(element)
      });
    });
  }
  handleScroll(event) {
    const target = _getEventTarget(event);
    const cachedPosition = this.positions.get(target);
    if (!cachedPosition) {
      return null;
    }
    const scrollPosition = cachedPosition.scrollPosition;
    let newTop;
    let newLeft;
    if (target === this._document) {
      const viewportScrollPosition = this.getViewportScrollPosition();
      newTop = viewportScrollPosition.top;
      newLeft = viewportScrollPosition.left;
    } else {
      newTop = target.scrollTop;
      newLeft = target.scrollLeft;
    }
    const topDifference = scrollPosition.top - newTop;
    const leftDifference = scrollPosition.left - newLeft;
    this.positions.forEach((position, node) => {
      if (position.clientRect && target !== node && target.contains(node)) {
        adjustDomRect(position.clientRect, topDifference, leftDifference);
      }
    });
    scrollPosition.top = newTop;
    scrollPosition.left = newLeft;
    return {
      top: topDifference,
      left: leftDifference
    };
  }
  getViewportScrollPosition() {
    return {
      top: window.scrollY,
      left: window.scrollX
    };
  }
};
function getRootNode(viewRef, _document) {
  const rootNodes = viewRef.rootNodes;
  if (rootNodes.length === 1 && rootNodes[0].nodeType === _document.ELEMENT_NODE) {
    return rootNodes[0];
  }
  const wrapper = _document.createElement("div");
  rootNodes.forEach((node) => wrapper.appendChild(node));
  return wrapper;
}
function extendStyles(dest, source, importantProperties2) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      const value = source[key];
      if (value) {
        dest.setProperty(key, value, importantProperties2?.has(key) ? "important" : "");
      } else {
        dest.removeProperty(key);
      }
    }
  }
  return dest;
}
function toggleNativeDragInteractions(element, enable) {
  const userSelect = enable ? "" : "none";
  extendStyles(element.style, {
    "touch-action": enable ? "" : "none",
    "-webkit-user-drag": enable ? "" : "none",
    "-webkit-tap-highlight-color": enable ? "" : "transparent",
    "user-select": userSelect,
    "-ms-user-select": userSelect,
    "-webkit-user-select": userSelect,
    "-moz-user-select": userSelect
  });
}
function toggleVisibility(element, enable, importantProperties2) {
  extendStyles(element.style, {
    position: enable ? "" : "fixed",
    top: enable ? "" : "0",
    opacity: enable ? "" : "0",
    left: enable ? "" : "-999em"
  }, importantProperties2);
}
function combineTransforms(transform, initialTransform) {
  return initialTransform && initialTransform != "none" ? transform + " " + initialTransform : transform;
}
function matchElementSize(target, sourceRect) {
  target.style.width = `${sourceRect.width}px`;
  target.style.height = `${sourceRect.height}px`;
  target.style.transform = getTransform(sourceRect.left, sourceRect.top);
}
function getTransform(x, y) {
  return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}
function parseCssTimeUnitsToMs(value) {
  const multiplier = value.toLowerCase().indexOf("ms") > -1 ? 1 : 1e3;
  return parseFloat(value) * multiplier;
}
function getTransformTransitionDurationInMs(element) {
  const computedStyle = getComputedStyle(element);
  const transitionedProperties = parseCssPropertyValue(computedStyle, "transition-property");
  const property = transitionedProperties.find((prop) => prop === "transform" || prop === "all");
  if (!property) {
    return 0;
  }
  const propertyIndex = transitionedProperties.indexOf(property);
  const rawDurations = parseCssPropertyValue(computedStyle, "transition-duration");
  const rawDelays = parseCssPropertyValue(computedStyle, "transition-delay");
  return parseCssTimeUnitsToMs(rawDurations[propertyIndex]) + parseCssTimeUnitsToMs(rawDelays[propertyIndex]);
}
function parseCssPropertyValue(computedStyle, name) {
  const value = computedStyle.getPropertyValue(name);
  return value.split(",").map((part) => part.trim());
}
var importantProperties = /* @__PURE__ */ new Set(["position"]);
var PreviewRef = class {
  _document;
  _rootElement;
  _direction;
  _initialDomRect;
  _previewTemplate;
  _previewClass;
  _pickupPositionOnPage;
  _initialTransform;
  _zIndex;
  _renderer;
  _previewEmbeddedView;
  _preview;
  get element() {
    return this._preview;
  }
  constructor(_document, _rootElement, _direction, _initialDomRect, _previewTemplate, _previewClass, _pickupPositionOnPage, _initialTransform, _zIndex, _renderer) {
    this._document = _document;
    this._rootElement = _rootElement;
    this._direction = _direction;
    this._initialDomRect = _initialDomRect;
    this._previewTemplate = _previewTemplate;
    this._previewClass = _previewClass;
    this._pickupPositionOnPage = _pickupPositionOnPage;
    this._initialTransform = _initialTransform;
    this._zIndex = _zIndex;
    this._renderer = _renderer;
  }
  attach(parent) {
    this._preview = this._createPreview();
    parent.appendChild(this._preview);
    if (supportsPopover(this._preview)) {
      this._preview["showPopover"]();
    }
  }
  destroy() {
    this._preview.remove();
    this._previewEmbeddedView?.destroy();
    this._preview = this._previewEmbeddedView = null;
  }
  setTransform(value) {
    this._preview.style.transform = value;
  }
  getBoundingClientRect() {
    return this._preview.getBoundingClientRect();
  }
  addClass(className) {
    this._preview.classList.add(className);
  }
  getTransitionDuration() {
    return getTransformTransitionDurationInMs(this._preview);
  }
  addEventListener(name, handler) {
    return this._renderer.listen(this._preview, name, handler);
  }
  _createPreview() {
    const previewConfig = this._previewTemplate;
    const previewClass = this._previewClass;
    const previewTemplate = previewConfig ? previewConfig.template : null;
    let preview;
    if (previewTemplate && previewConfig) {
      const rootRect = previewConfig.matchSize ? this._initialDomRect : null;
      const viewRef = previewConfig.viewContainer.createEmbeddedView(previewTemplate, previewConfig.context);
      viewRef.detectChanges();
      preview = getRootNode(viewRef, this._document);
      this._previewEmbeddedView = viewRef;
      if (previewConfig.matchSize) {
        matchElementSize(preview, rootRect);
      } else {
        preview.style.transform = getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
      }
    } else {
      preview = deepCloneNode(this._rootElement);
      matchElementSize(preview, this._initialDomRect);
      if (this._initialTransform) {
        preview.style.transform = this._initialTransform;
      }
    }
    extendStyles(preview.style, {
      "pointer-events": "none",
      "margin": supportsPopover(preview) ? "0 auto 0 0" : "0",
      "position": "fixed",
      "top": "0",
      "left": "0",
      "z-index": this._zIndex + ""
    }, importantProperties);
    toggleNativeDragInteractions(preview, false);
    preview.classList.add("cdk-drag-preview");
    preview.setAttribute("popover", "manual");
    preview.setAttribute("dir", this._direction);
    if (previewClass) {
      if (Array.isArray(previewClass)) {
        previewClass.forEach((className) => preview.classList.add(className));
      } else {
        preview.classList.add(previewClass);
      }
    }
    return preview;
  }
};
function supportsPopover(element) {
  return "showPopover" in element;
}
var passiveEventListenerOptions = {
  passive: true
};
var activeEventListenerOptions = {
  passive: false
};
var activeCapturingEventOptions$1 = {
  passive: false,
  capture: true
};
var MOUSE_EVENT_IGNORE_TIME = 800;
var PLACEHOLDER_CLASS = "cdk-drag-placeholder";
var dragImportantProperties = /* @__PURE__ */ new Set(["position"]);
var DragRef = class {
  _config;
  _document;
  _ngZone;
  _viewportRuler;
  _dragDropRegistry;
  _renderer;
  _rootElementCleanups;
  _cleanupShadowRootSelectStart;
  _preview;
  _previewContainer;
  _placeholderRef;
  _placeholder;
  _pickupPositionInElement;
  _pickupPositionOnPage;
  _marker;
  _anchor = null;
  _passiveTransform = {
    x: 0,
    y: 0
  };
  _activeTransform = {
    x: 0,
    y: 0
  };
  _initialTransform;
  _hasStartedDragging = signal(false, ...ngDevMode ? [{
    debugName: "_hasStartedDragging"
  }] : []);
  _hasMoved;
  _initialContainer;
  _initialIndex;
  _parentPositions;
  _moveEvents = new Subject();
  _pointerDirectionDelta;
  _pointerPositionAtLastDirectionChange;
  _lastKnownPointerPosition;
  _rootElement;
  _ownerSVGElement;
  _rootElementTapHighlight;
  _pointerMoveSubscription = Subscription.EMPTY;
  _pointerUpSubscription = Subscription.EMPTY;
  _scrollSubscription = Subscription.EMPTY;
  _resizeSubscription = Subscription.EMPTY;
  _lastTouchEventTime;
  _dragStartTime;
  _boundaryElement = null;
  _nativeInteractionsEnabled = true;
  _initialDomRect;
  _previewRect;
  _boundaryRect;
  _previewTemplate;
  _placeholderTemplate;
  _handles = [];
  _disabledHandles = /* @__PURE__ */ new Set();
  _dropContainer;
  _direction = "ltr";
  _parentDragRef;
  _cachedShadowRoot;
  lockAxis = null;
  dragStartDelay = 0;
  previewClass;
  scale = 1;
  get disabled() {
    return this._disabled || !!(this._dropContainer && this._dropContainer.disabled);
  }
  set disabled(value) {
    if (value !== this._disabled) {
      this._disabled = value;
      this._toggleNativeDragInteractions();
      this._handles.forEach((handle) => toggleNativeDragInteractions(handle, value));
    }
  }
  _disabled = false;
  beforeStarted = new Subject();
  started = new Subject();
  released = new Subject();
  ended = new Subject();
  entered = new Subject();
  exited = new Subject();
  dropped = new Subject();
  moved = this._moveEvents;
  data;
  constrainPosition;
  constructor(element, _config, _document, _ngZone, _viewportRuler, _dragDropRegistry, _renderer) {
    this._config = _config;
    this._document = _document;
    this._ngZone = _ngZone;
    this._viewportRuler = _viewportRuler;
    this._dragDropRegistry = _dragDropRegistry;
    this._renderer = _renderer;
    this.withRootElement(element).withParent(_config.parentDragRef || null);
    this._parentPositions = new ParentPositionTracker(_document);
    _dragDropRegistry.registerDragItem(this);
  }
  getPlaceholderElement() {
    return this._placeholder;
  }
  getRootElement() {
    return this._rootElement;
  }
  getVisibleElement() {
    return this.isDragging() ? this.getPlaceholderElement() : this.getRootElement();
  }
  withHandles(handles) {
    this._handles = handles.map((handle) => coerceElement(handle));
    this._handles.forEach((handle) => toggleNativeDragInteractions(handle, this.disabled));
    this._toggleNativeDragInteractions();
    const disabledHandles = /* @__PURE__ */ new Set();
    this._disabledHandles.forEach((handle) => {
      if (this._handles.indexOf(handle) > -1) {
        disabledHandles.add(handle);
      }
    });
    this._disabledHandles = disabledHandles;
    return this;
  }
  withPreviewTemplate(template) {
    this._previewTemplate = template;
    return this;
  }
  withPlaceholderTemplate(template) {
    this._placeholderTemplate = template;
    return this;
  }
  withRootElement(rootElement) {
    const element = coerceElement(rootElement);
    if (element !== this._rootElement) {
      this._removeRootElementListeners();
      const renderer = this._renderer;
      this._rootElementCleanups = this._ngZone.runOutsideAngular(() => [renderer.listen(element, "mousedown", this._pointerDown, activeEventListenerOptions), renderer.listen(element, "touchstart", this._pointerDown, passiveEventListenerOptions), renderer.listen(element, "dragstart", this._nativeDragStart, activeEventListenerOptions)]);
      this._initialTransform = void 0;
      this._rootElement = element;
    }
    if (typeof SVGElement !== "undefined" && this._rootElement instanceof SVGElement) {
      this._ownerSVGElement = this._rootElement.ownerSVGElement;
    }
    return this;
  }
  withBoundaryElement(boundaryElement) {
    this._boundaryElement = boundaryElement ? coerceElement(boundaryElement) : null;
    this._resizeSubscription.unsubscribe();
    if (boundaryElement) {
      this._resizeSubscription = this._viewportRuler.change(10).subscribe(() => this._containInsideBoundaryOnResize());
    }
    return this;
  }
  withParent(parent) {
    this._parentDragRef = parent;
    return this;
  }
  dispose() {
    this._removeRootElementListeners();
    if (this.isDragging()) {
      this._rootElement?.remove();
    }
    this._marker?.remove();
    this._destroyPreview();
    this._destroyPlaceholder();
    this._dragDropRegistry.removeDragItem(this);
    this._removeListeners();
    this.beforeStarted.complete();
    this.started.complete();
    this.released.complete();
    this.ended.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    this._moveEvents.complete();
    this._handles = [];
    this._disabledHandles.clear();
    this._dropContainer = void 0;
    this._resizeSubscription.unsubscribe();
    this._parentPositions.clear();
    this._boundaryElement = this._rootElement = this._ownerSVGElement = this._placeholderTemplate = this._previewTemplate = this._marker = this._parentDragRef = null;
  }
  isDragging() {
    return this._hasStartedDragging() && this._dragDropRegistry.isDragging(this);
  }
  reset() {
    this._rootElement.style.transform = this._initialTransform || "";
    this._activeTransform = {
      x: 0,
      y: 0
    };
    this._passiveTransform = {
      x: 0,
      y: 0
    };
  }
  resetToBoundary() {
    if (this._boundaryElement && this._rootElement && isOverflowingParent(this._boundaryElement.getBoundingClientRect(), this._rootElement.getBoundingClientRect())) {
      const parentRect = this._boundaryElement.getBoundingClientRect();
      const childRect = this._rootElement.getBoundingClientRect();
      let offsetX = 0;
      let offsetY = 0;
      if (childRect.left < parentRect.left) {
        offsetX = parentRect.left - childRect.left;
      } else if (childRect.right > parentRect.right) {
        offsetX = parentRect.right - childRect.right;
      }
      if (childRect.top < parentRect.top) {
        offsetY = parentRect.top - childRect.top;
      } else if (childRect.bottom > parentRect.bottom) {
        offsetY = parentRect.bottom - childRect.bottom;
      }
      const currentLeft = this._activeTransform.x;
      const currentTop = this._activeTransform.y;
      let x = currentLeft + offsetX, y = currentTop + offsetY;
      this._rootElement.style.transform = getTransform(x, y);
      this._activeTransform = {
        x,
        y
      };
      this._passiveTransform = {
        x,
        y
      };
    }
  }
  disableHandle(handle) {
    if (!this._disabledHandles.has(handle) && this._handles.indexOf(handle) > -1) {
      this._disabledHandles.add(handle);
      toggleNativeDragInteractions(handle, true);
    }
  }
  enableHandle(handle) {
    if (this._disabledHandles.has(handle)) {
      this._disabledHandles.delete(handle);
      toggleNativeDragInteractions(handle, this.disabled);
    }
  }
  withDirection(direction) {
    this._direction = direction;
    return this;
  }
  _withDropContainer(container) {
    this._dropContainer = container;
  }
  getFreeDragPosition() {
    const position = this.isDragging() ? this._activeTransform : this._passiveTransform;
    return {
      x: position.x,
      y: position.y
    };
  }
  setFreeDragPosition(value) {
    this._activeTransform = {
      x: 0,
      y: 0
    };
    this._passiveTransform.x = value.x;
    this._passiveTransform.y = value.y;
    if (!this._dropContainer) {
      this._applyRootElementTransform(value.x, value.y);
    }
    return this;
  }
  withPreviewContainer(value) {
    this._previewContainer = value;
    return this;
  }
  _sortFromLastPointerPosition() {
    const position = this._lastKnownPointerPosition;
    if (position && this._dropContainer) {
      this._updateActiveDropContainer(this._getConstrainedPointerPosition(position), position);
    }
  }
  _removeListeners() {
    this._pointerMoveSubscription.unsubscribe();
    this._pointerUpSubscription.unsubscribe();
    this._scrollSubscription.unsubscribe();
    this._cleanupShadowRootSelectStart?.();
    this._cleanupShadowRootSelectStart = void 0;
  }
  _destroyPreview() {
    this._preview?.destroy();
    this._preview = null;
  }
  _destroyPlaceholder() {
    this._anchor?.remove();
    this._placeholder?.remove();
    this._placeholderRef?.destroy();
    this._placeholder = this._anchor = this._placeholderRef = null;
  }
  _pointerDown = (event) => {
    this.beforeStarted.next();
    if (this._handles.length) {
      const targetHandle = this._getTargetHandle(event);
      if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
        this._initializeDragSequence(targetHandle, event);
      }
    } else if (!this.disabled) {
      this._initializeDragSequence(this._rootElement, event);
    }
  };
  _pointerMove = (event) => {
    const pointerPosition = this._getPointerPositionOnPage(event);
    if (!this._hasStartedDragging()) {
      const distanceX = Math.abs(pointerPosition.x - this._pickupPositionOnPage.x);
      const distanceY = Math.abs(pointerPosition.y - this._pickupPositionOnPage.y);
      const isOverThreshold = distanceX + distanceY >= this._config.dragStartThreshold;
      if (isOverThreshold) {
        const isDelayElapsed = Date.now() >= this._dragStartTime + this._getDragStartDelay(event);
        const container = this._dropContainer;
        if (!isDelayElapsed) {
          this._endDragSequence(event);
          return;
        }
        if (!container || !container.isDragging() && !container.isReceiving()) {
          if (event.cancelable) {
            event.preventDefault();
          }
          this._hasStartedDragging.set(true);
          this._ngZone.run(() => this._startDragSequence(event));
        }
      }
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    const constrainedPointerPosition = this._getConstrainedPointerPosition(pointerPosition);
    this._hasMoved = true;
    this._lastKnownPointerPosition = pointerPosition;
    this._updatePointerDirectionDelta(constrainedPointerPosition);
    if (this._dropContainer) {
      this._updateActiveDropContainer(constrainedPointerPosition, pointerPosition);
    } else {
      const offset = this.constrainPosition ? this._initialDomRect : this._pickupPositionOnPage;
      const activeTransform = this._activeTransform;
      activeTransform.x = constrainedPointerPosition.x - offset.x + this._passiveTransform.x;
      activeTransform.y = constrainedPointerPosition.y - offset.y + this._passiveTransform.y;
      this._applyRootElementTransform(activeTransform.x, activeTransform.y);
    }
    if (this._moveEvents.observers.length) {
      this._ngZone.run(() => {
        this._moveEvents.next({
          source: this,
          pointerPosition: constrainedPointerPosition,
          event,
          distance: this._getDragDistance(constrainedPointerPosition),
          delta: this._pointerDirectionDelta
        });
      });
    }
  };
  _pointerUp = (event) => {
    this._endDragSequence(event);
  };
  _endDragSequence(event) {
    if (!this._dragDropRegistry.isDragging(this)) {
      return;
    }
    this._removeListeners();
    this._dragDropRegistry.stopDragging(this);
    this._toggleNativeDragInteractions();
    if (this._handles) {
      this._rootElement.style.webkitTapHighlightColor = this._rootElementTapHighlight;
    }
    if (!this._hasStartedDragging()) {
      return;
    }
    this.released.next({
      source: this,
      event
    });
    if (this._dropContainer) {
      this._dropContainer._stopScrolling();
      this._animatePreviewToPlaceholder().then(() => {
        this._cleanupDragArtifacts(event);
        this._cleanupCachedDimensions();
        this._dragDropRegistry.stopDragging(this);
      });
    } else {
      this._passiveTransform.x = this._activeTransform.x;
      const pointerPosition = this._getPointerPositionOnPage(event);
      this._passiveTransform.y = this._activeTransform.y;
      this._ngZone.run(() => {
        this.ended.next({
          source: this,
          distance: this._getDragDistance(pointerPosition),
          dropPoint: pointerPosition,
          event
        });
      });
      this._cleanupCachedDimensions();
      this._dragDropRegistry.stopDragging(this);
    }
  }
  _startDragSequence(event) {
    if (isTouchEvent(event)) {
      this._lastTouchEventTime = Date.now();
    }
    this._toggleNativeDragInteractions();
    const shadowRoot = this._getShadowRoot();
    const dropContainer = this._dropContainer;
    if (shadowRoot) {
      this._ngZone.runOutsideAngular(() => {
        this._cleanupShadowRootSelectStart = this._renderer.listen(shadowRoot, "selectstart", shadowDomSelectStart, activeCapturingEventOptions$1);
      });
    }
    if (dropContainer) {
      const element = this._rootElement;
      const parent = element.parentNode;
      const placeholder = this._placeholder = this._createPlaceholderElement();
      const marker = this._marker = this._marker || this._document.createComment(typeof ngDevMode === "undefined" || ngDevMode ? "cdk-drag-marker" : "");
      parent.insertBefore(marker, element);
      this._initialTransform = element.style.transform || "";
      this._preview = new PreviewRef(this._document, this._rootElement, this._direction, this._initialDomRect, this._previewTemplate || null, this.previewClass || null, this._pickupPositionOnPage, this._initialTransform, this._config.zIndex || 1e3, this._renderer);
      this._preview.attach(this._getPreviewInsertionPoint(parent, shadowRoot));
      toggleVisibility(element, false, dragImportantProperties);
      this._document.body.appendChild(parent.replaceChild(placeholder, element));
      this.started.next({
        source: this,
        event
      });
      dropContainer.start();
      this._initialContainer = dropContainer;
      this._initialIndex = dropContainer.getItemIndex(this);
    } else {
      this.started.next({
        source: this,
        event
      });
      this._initialContainer = this._initialIndex = void 0;
    }
    this._parentPositions.cache(dropContainer ? dropContainer.getScrollableParents() : []);
  }
  _initializeDragSequence(referenceElement, event) {
    if (this._parentDragRef) {
      event.stopPropagation();
    }
    const isDragging = this.isDragging();
    const isTouchSequence = isTouchEvent(event);
    const isAuxiliaryMouseButton = !isTouchSequence && event.button !== 0;
    const rootElement = this._rootElement;
    const target = _getEventTarget(event);
    const isSyntheticEvent = !isTouchSequence && this._lastTouchEventTime && this._lastTouchEventTime + MOUSE_EVENT_IGNORE_TIME > Date.now();
    const isFakeEvent = isTouchSequence ? isFakeTouchstartFromScreenReader(event) : isFakeMousedownFromScreenReader(event);
    if (target && target.draggable && event.type === "mousedown") {
      event.preventDefault();
    }
    if (isDragging || isAuxiliaryMouseButton || isSyntheticEvent || isFakeEvent) {
      return;
    }
    if (this._handles.length) {
      const rootStyles = rootElement.style;
      this._rootElementTapHighlight = rootStyles.webkitTapHighlightColor || "";
      rootStyles.webkitTapHighlightColor = "transparent";
    }
    this._hasMoved = false;
    this._hasStartedDragging.set(this._hasMoved);
    this._removeListeners();
    this._initialDomRect = this._rootElement.getBoundingClientRect();
    this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
    this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
    this._scrollSubscription = this._dragDropRegistry.scrolled(this._getShadowRoot()).subscribe((scrollEvent) => this._updateOnScroll(scrollEvent));
    if (this._boundaryElement) {
      this._boundaryRect = getMutableClientRect(this._boundaryElement);
    }
    const previewTemplate = this._previewTemplate;
    this._pickupPositionInElement = previewTemplate && previewTemplate.template && !previewTemplate.matchSize ? {
      x: 0,
      y: 0
    } : this._getPointerPositionInElement(this._initialDomRect, referenceElement, event);
    const pointerPosition = this._pickupPositionOnPage = this._lastKnownPointerPosition = this._getPointerPositionOnPage(event);
    this._pointerDirectionDelta = {
      x: 0,
      y: 0
    };
    this._pointerPositionAtLastDirectionChange = {
      x: pointerPosition.x,
      y: pointerPosition.y
    };
    this._dragStartTime = Date.now();
    this._dragDropRegistry.startDragging(this, event);
  }
  _cleanupDragArtifacts(event) {
    toggleVisibility(this._rootElement, true, dragImportantProperties);
    this._marker.parentNode.replaceChild(this._rootElement, this._marker);
    this._destroyPreview();
    this._destroyPlaceholder();
    this._initialDomRect = this._boundaryRect = this._previewRect = this._initialTransform = void 0;
    this._ngZone.run(() => {
      const container = this._dropContainer;
      const currentIndex = container.getItemIndex(this);
      const pointerPosition = this._getPointerPositionOnPage(event);
      const distance = this._getDragDistance(pointerPosition);
      const isPointerOverContainer = container._isOverContainer(pointerPosition.x, pointerPosition.y);
      this.ended.next({
        source: this,
        distance,
        dropPoint: pointerPosition,
        event
      });
      this.dropped.next({
        item: this,
        currentIndex,
        previousIndex: this._initialIndex,
        container,
        previousContainer: this._initialContainer,
        isPointerOverContainer,
        distance,
        dropPoint: pointerPosition,
        event
      });
      container.drop(this, currentIndex, this._initialIndex, this._initialContainer, isPointerOverContainer, distance, pointerPosition, event);
      this._dropContainer = this._initialContainer;
    });
  }
  _updateActiveDropContainer({
    x,
    y
  }, {
    x: rawX,
    y: rawY
  }) {
    let newContainer = this._initialContainer._getSiblingContainerFromPosition(this, x, y);
    if (!newContainer && this._dropContainer !== this._initialContainer && this._initialContainer._isOverContainer(x, y)) {
      newContainer = this._initialContainer;
    }
    if (newContainer && newContainer !== this._dropContainer) {
      this._ngZone.run(() => {
        const exitIndex = this._dropContainer.getItemIndex(this);
        const nextItemElement = this._dropContainer.getItemAtIndex(exitIndex + 1)?.getVisibleElement() || null;
        this.exited.next({
          item: this,
          container: this._dropContainer
        });
        this._dropContainer.exit(this);
        this._conditionallyInsertAnchor(newContainer, this._dropContainer, nextItemElement);
        this._dropContainer = newContainer;
        this._dropContainer.enter(this, x, y, newContainer === this._initialContainer && newContainer.sortingDisabled ? this._initialIndex : void 0);
        this.entered.next({
          item: this,
          container: newContainer,
          currentIndex: newContainer.getItemIndex(this)
        });
      });
    }
    if (this.isDragging()) {
      this._dropContainer._startScrollingIfNecessary(rawX, rawY);
      this._dropContainer._sortItem(this, x, y, this._pointerDirectionDelta);
      if (this.constrainPosition) {
        this._applyPreviewTransform(x, y);
      } else {
        this._applyPreviewTransform(x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
      }
    }
  }
  _animatePreviewToPlaceholder() {
    if (!this._hasMoved) {
      return Promise.resolve();
    }
    const placeholderRect = this._placeholder.getBoundingClientRect();
    this._preview.addClass("cdk-drag-animating");
    this._applyPreviewTransform(placeholderRect.left, placeholderRect.top);
    const duration = this._preview.getTransitionDuration();
    if (duration === 0) {
      return Promise.resolve();
    }
    return this._ngZone.runOutsideAngular(() => {
      return new Promise((resolve) => {
        const handler = (event) => {
          if (!event || this._preview && _getEventTarget(event) === this._preview.element && event.propertyName === "transform") {
            cleanupListener();
            resolve();
            clearTimeout(timeout);
          }
        };
        const timeout = setTimeout(handler, duration * 1.5);
        const cleanupListener = this._preview.addEventListener("transitionend", handler);
      });
    });
  }
  _createPlaceholderElement() {
    const placeholderConfig = this._placeholderTemplate;
    const placeholderTemplate = placeholderConfig ? placeholderConfig.template : null;
    let placeholder;
    if (placeholderTemplate) {
      this._placeholderRef = placeholderConfig.viewContainer.createEmbeddedView(placeholderTemplate, placeholderConfig.context);
      this._placeholderRef.detectChanges();
      placeholder = getRootNode(this._placeholderRef, this._document);
    } else {
      placeholder = deepCloneNode(this._rootElement);
    }
    placeholder.style.pointerEvents = "none";
    placeholder.classList.add(PLACEHOLDER_CLASS);
    return placeholder;
  }
  _getPointerPositionInElement(elementRect, referenceElement, event) {
    const handleElement = referenceElement === this._rootElement ? null : referenceElement;
    const referenceRect = handleElement ? handleElement.getBoundingClientRect() : elementRect;
    const point = isTouchEvent(event) ? event.targetTouches[0] : event;
    const scrollPosition = this._getViewportScrollPosition();
    const x = point.pageX - referenceRect.left - scrollPosition.left;
    const y = point.pageY - referenceRect.top - scrollPosition.top;
    return {
      x: referenceRect.left - elementRect.left + x,
      y: referenceRect.top - elementRect.top + y
    };
  }
  _getPointerPositionOnPage(event) {
    const scrollPosition = this._getViewportScrollPosition();
    const point = isTouchEvent(event) ? event.touches[0] || event.changedTouches[0] || {
      pageX: 0,
      pageY: 0
    } : event;
    const x = point.pageX - scrollPosition.left;
    const y = point.pageY - scrollPosition.top;
    if (this._ownerSVGElement) {
      const svgMatrix = this._ownerSVGElement.getScreenCTM();
      if (svgMatrix) {
        const svgPoint = this._ownerSVGElement.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        return svgPoint.matrixTransform(svgMatrix.inverse());
      }
    }
    return {
      x,
      y
    };
  }
  _getConstrainedPointerPosition(point) {
    const dropContainerLock = this._dropContainer ? this._dropContainer.lockAxis : null;
    let {
      x,
      y
    } = this.constrainPosition ? this.constrainPosition(point, this, this._initialDomRect, this._pickupPositionInElement) : point;
    if (this.lockAxis === "x" || dropContainerLock === "x") {
      y = this._pickupPositionOnPage.y - (this.constrainPosition ? this._pickupPositionInElement.y : 0);
    } else if (this.lockAxis === "y" || dropContainerLock === "y") {
      x = this._pickupPositionOnPage.x - (this.constrainPosition ? this._pickupPositionInElement.x : 0);
    }
    if (this._boundaryRect) {
      const {
        x: pickupX,
        y: pickupY
      } = !this.constrainPosition ? this._pickupPositionInElement : {
        x: 0,
        y: 0
      };
      const boundaryRect = this._boundaryRect;
      const {
        width: previewWidth,
        height: previewHeight
      } = this._getPreviewRect();
      const minY = boundaryRect.top + pickupY;
      const maxY = boundaryRect.bottom - (previewHeight - pickupY);
      const minX = boundaryRect.left + pickupX;
      const maxX = boundaryRect.right - (previewWidth - pickupX);
      x = clamp$1(x, minX, maxX);
      y = clamp$1(y, minY, maxY);
    }
    return {
      x,
      y
    };
  }
  _updatePointerDirectionDelta(pointerPositionOnPage) {
    const {
      x,
      y
    } = pointerPositionOnPage;
    const delta = this._pointerDirectionDelta;
    const positionSinceLastChange = this._pointerPositionAtLastDirectionChange;
    const changeX = Math.abs(x - positionSinceLastChange.x);
    const changeY = Math.abs(y - positionSinceLastChange.y);
    if (changeX > this._config.pointerDirectionChangeThreshold) {
      delta.x = x > positionSinceLastChange.x ? 1 : -1;
      positionSinceLastChange.x = x;
    }
    if (changeY > this._config.pointerDirectionChangeThreshold) {
      delta.y = y > positionSinceLastChange.y ? 1 : -1;
      positionSinceLastChange.y = y;
    }
    return delta;
  }
  _toggleNativeDragInteractions() {
    if (!this._rootElement || !this._handles) {
      return;
    }
    const shouldEnable = this._handles.length > 0 || !this.isDragging();
    if (shouldEnable !== this._nativeInteractionsEnabled) {
      this._nativeInteractionsEnabled = shouldEnable;
      toggleNativeDragInteractions(this._rootElement, shouldEnable);
    }
  }
  _removeRootElementListeners() {
    this._rootElementCleanups?.forEach((cleanup) => cleanup());
    this._rootElementCleanups = void 0;
  }
  _applyRootElementTransform(x, y) {
    const scale = 1 / this.scale;
    const transform = getTransform(x * scale, y * scale);
    const styles = this._rootElement.style;
    if (this._initialTransform == null) {
      this._initialTransform = styles.transform && styles.transform != "none" ? styles.transform : "";
    }
    styles.transform = combineTransforms(transform, this._initialTransform);
  }
  _applyPreviewTransform(x, y) {
    const initialTransform = this._previewTemplate?.template ? void 0 : this._initialTransform;
    const transform = getTransform(x, y);
    this._preview.setTransform(combineTransforms(transform, initialTransform));
  }
  _getDragDistance(currentPosition) {
    const pickupPosition = this._pickupPositionOnPage;
    if (pickupPosition) {
      return {
        x: currentPosition.x - pickupPosition.x,
        y: currentPosition.y - pickupPosition.y
      };
    }
    return {
      x: 0,
      y: 0
    };
  }
  _cleanupCachedDimensions() {
    this._boundaryRect = this._previewRect = void 0;
    this._parentPositions.clear();
  }
  _containInsideBoundaryOnResize() {
    let {
      x,
      y
    } = this._passiveTransform;
    if (x === 0 && y === 0 || this.isDragging() || !this._boundaryElement) {
      return;
    }
    const elementRect = this._rootElement.getBoundingClientRect();
    const boundaryRect = this._boundaryElement.getBoundingClientRect();
    if (boundaryRect.width === 0 && boundaryRect.height === 0 || elementRect.width === 0 && elementRect.height === 0) {
      return;
    }
    const leftOverflow = boundaryRect.left - elementRect.left;
    const rightOverflow = elementRect.right - boundaryRect.right;
    const topOverflow = boundaryRect.top - elementRect.top;
    const bottomOverflow = elementRect.bottom - boundaryRect.bottom;
    if (boundaryRect.width > elementRect.width) {
      if (leftOverflow > 0) {
        x += leftOverflow;
      }
      if (rightOverflow > 0) {
        x -= rightOverflow;
      }
    } else {
      x = 0;
    }
    if (boundaryRect.height > elementRect.height) {
      if (topOverflow > 0) {
        y += topOverflow;
      }
      if (bottomOverflow > 0) {
        y -= bottomOverflow;
      }
    } else {
      y = 0;
    }
    if (x !== this._passiveTransform.x || y !== this._passiveTransform.y) {
      this.setFreeDragPosition({
        y,
        x
      });
    }
  }
  _getDragStartDelay(event) {
    const value = this.dragStartDelay;
    if (typeof value === "number") {
      return value;
    } else if (isTouchEvent(event)) {
      return value.touch;
    }
    return value ? value.mouse : 0;
  }
  _updateOnScroll(event) {
    const scrollDifference = this._parentPositions.handleScroll(event);
    if (scrollDifference) {
      const target = _getEventTarget(event);
      if (this._boundaryRect && target !== this._boundaryElement && target.contains(this._boundaryElement)) {
        adjustDomRect(this._boundaryRect, scrollDifference.top, scrollDifference.left);
      }
      this._pickupPositionOnPage.x += scrollDifference.left;
      this._pickupPositionOnPage.y += scrollDifference.top;
      if (!this._dropContainer) {
        this._activeTransform.x -= scrollDifference.left;
        this._activeTransform.y -= scrollDifference.top;
        this._applyRootElementTransform(this._activeTransform.x, this._activeTransform.y);
      }
    }
  }
  _getViewportScrollPosition() {
    return this._parentPositions.positions.get(this._document)?.scrollPosition || this._parentPositions.getViewportScrollPosition();
  }
  _getShadowRoot() {
    if (this._cachedShadowRoot === void 0) {
      this._cachedShadowRoot = _getShadowRoot(this._rootElement);
    }
    return this._cachedShadowRoot;
  }
  _getPreviewInsertionPoint(initialParent, shadowRoot) {
    const previewContainer = this._previewContainer || "global";
    if (previewContainer === "parent") {
      return initialParent;
    }
    if (previewContainer === "global") {
      const documentRef = this._document;
      return shadowRoot || documentRef.fullscreenElement || documentRef.webkitFullscreenElement || documentRef.mozFullScreenElement || documentRef.msFullscreenElement || documentRef.body;
    }
    return coerceElement(previewContainer);
  }
  _getPreviewRect() {
    if (!this._previewRect || !this._previewRect.width && !this._previewRect.height) {
      this._previewRect = this._preview ? this._preview.getBoundingClientRect() : this._initialDomRect;
    }
    return this._previewRect;
  }
  _nativeDragStart = (event) => {
    if (this._handles.length) {
      const targetHandle = this._getTargetHandle(event);
      if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
        event.preventDefault();
      }
    } else if (!this.disabled) {
      event.preventDefault();
    }
  };
  _getTargetHandle(event) {
    return this._handles.find((handle) => {
      return event.target && (event.target === handle || handle.contains(event.target));
    });
  }
  _conditionallyInsertAnchor(newContainer, exitContainer, nextItemElement) {
    if (newContainer === this._initialContainer) {
      this._anchor?.remove();
      this._anchor = null;
    } else if (exitContainer === this._initialContainer && exitContainer.hasAnchor) {
      const anchor = this._anchor ??= deepCloneNode(this._placeholder);
      anchor.classList.remove(PLACEHOLDER_CLASS);
      anchor.classList.add("cdk-drag-anchor");
      anchor.style.transform = "";
      if (nextItemElement) {
        nextItemElement.before(anchor);
      } else {
        coerceElement(exitContainer.element).appendChild(anchor);
      }
    }
  }
};
function clamp$1(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function isTouchEvent(event) {
  return event.type[0] === "t";
}
function shadowDomSelectStart(event) {
  event.preventDefault();
}
function moveItemInArray(array, fromIndex, toIndex) {
  const from = clamp(fromIndex, array.length - 1);
  const to = clamp(toIndex, array.length - 1);
  if (from === to) {
    return;
  }
  const target = array[from];
  const delta = to < from ? -1 : 1;
  for (let i = from; i !== to; i += delta) {
    array[i] = array[i + delta];
  }
  array[to] = target;
}
function transferArrayItem(currentArray, targetArray, currentIndex, targetIndex) {
  const from = clamp(currentIndex, currentArray.length - 1);
  const to = clamp(targetIndex, targetArray.length);
  if (currentArray.length) {
    targetArray.splice(to, 0, currentArray.splice(from, 1)[0]);
  }
}
function clamp(value, max) {
  return Math.max(0, Math.min(max, value));
}
var SingleAxisSortStrategy = class {
  _dragDropRegistry;
  _element;
  _sortPredicate;
  _itemPositions = [];
  _activeDraggables;
  orientation = "vertical";
  direction;
  constructor(_dragDropRegistry) {
    this._dragDropRegistry = _dragDropRegistry;
  }
  _previousSwap = {
    drag: null,
    delta: 0,
    overlaps: false
  };
  start(items) {
    this.withItems(items);
  }
  sort(item, pointerX, pointerY, pointerDelta) {
    const siblings = this._itemPositions;
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY, pointerDelta);
    if (newIndex === -1 && siblings.length > 0) {
      return null;
    }
    const isHorizontal = this.orientation === "horizontal";
    const currentIndex = siblings.findIndex((currentItem) => currentItem.drag === item);
    const siblingAtNewPosition = siblings[newIndex];
    const currentPosition = siblings[currentIndex].clientRect;
    const newPosition = siblingAtNewPosition.clientRect;
    const delta = currentIndex > newIndex ? 1 : -1;
    const itemOffset = this._getItemOffsetPx(currentPosition, newPosition, delta);
    const siblingOffset = this._getSiblingOffsetPx(currentIndex, siblings, delta);
    const oldOrder = siblings.slice();
    moveItemInArray(siblings, currentIndex, newIndex);
    siblings.forEach((sibling, index) => {
      if (oldOrder[index] === sibling) {
        return;
      }
      const isDraggedItem = sibling.drag === item;
      const offset = isDraggedItem ? itemOffset : siblingOffset;
      const elementToOffset = isDraggedItem ? item.getPlaceholderElement() : sibling.drag.getRootElement();
      sibling.offset += offset;
      const transformAmount = Math.round(sibling.offset * (1 / sibling.drag.scale));
      if (isHorizontal) {
        elementToOffset.style.transform = combineTransforms(`translate3d(${transformAmount}px, 0, 0)`, sibling.initialTransform);
        adjustDomRect(sibling.clientRect, 0, offset);
      } else {
        elementToOffset.style.transform = combineTransforms(`translate3d(0, ${transformAmount}px, 0)`, sibling.initialTransform);
        adjustDomRect(sibling.clientRect, offset, 0);
      }
    });
    this._previousSwap.overlaps = isInsideClientRect(newPosition, pointerX, pointerY);
    this._previousSwap.drag = siblingAtNewPosition.drag;
    this._previousSwap.delta = isHorizontal ? pointerDelta.x : pointerDelta.y;
    return {
      previousIndex: currentIndex,
      currentIndex: newIndex
    };
  }
  enter(item, pointerX, pointerY, index) {
    const newIndex = index == null || index < 0 ? this._getItemIndexFromPointerPosition(item, pointerX, pointerY) : index;
    const activeDraggables = this._activeDraggables;
    const currentIndex = activeDraggables.indexOf(item);
    const placeholder = item.getPlaceholderElement();
    let newPositionReference = activeDraggables[newIndex];
    if (newPositionReference === item) {
      newPositionReference = activeDraggables[newIndex + 1];
    }
    if (!newPositionReference && (newIndex == null || newIndex === -1 || newIndex < activeDraggables.length - 1) && this._shouldEnterAsFirstChild(pointerX, pointerY)) {
      newPositionReference = activeDraggables[0];
    }
    if (currentIndex > -1) {
      activeDraggables.splice(currentIndex, 1);
    }
    if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
      const element = newPositionReference.getRootElement();
      element.parentElement.insertBefore(placeholder, element);
      activeDraggables.splice(newIndex, 0, item);
    } else {
      this._element.appendChild(placeholder);
      activeDraggables.push(item);
    }
    placeholder.style.transform = "";
    this._cacheItemPositions();
  }
  withItems(items) {
    this._activeDraggables = items.slice();
    this._cacheItemPositions();
  }
  withSortPredicate(predicate) {
    this._sortPredicate = predicate;
  }
  reset() {
    this._activeDraggables?.forEach((item) => {
      const rootElement = item.getRootElement();
      if (rootElement) {
        const initialTransform = this._itemPositions.find((p) => p.drag === item)?.initialTransform;
        rootElement.style.transform = initialTransform || "";
      }
    });
    this._itemPositions = [];
    this._activeDraggables = [];
    this._previousSwap.drag = null;
    this._previousSwap.delta = 0;
    this._previousSwap.overlaps = false;
  }
  getActiveItemsSnapshot() {
    return this._activeDraggables;
  }
  getItemIndex(item) {
    return this._getVisualItemPositions().findIndex((currentItem) => currentItem.drag === item);
  }
  getItemAtIndex(index) {
    return this._getVisualItemPositions()[index]?.drag || null;
  }
  updateOnScroll(topDifference, leftDifference) {
    this._itemPositions.forEach(({
      clientRect
    }) => {
      adjustDomRect(clientRect, topDifference, leftDifference);
    });
    this._itemPositions.forEach(({
      drag
    }) => {
      if (this._dragDropRegistry.isDragging(drag)) {
        drag._sortFromLastPointerPosition();
      }
    });
  }
  withElementContainer(container) {
    this._element = container;
  }
  _cacheItemPositions() {
    const isHorizontal = this.orientation === "horizontal";
    this._itemPositions = this._activeDraggables.map((drag) => {
      const elementToMeasure = drag.getVisibleElement();
      return {
        drag,
        offset: 0,
        initialTransform: elementToMeasure.style.transform || "",
        clientRect: getMutableClientRect(elementToMeasure)
      };
    }).sort((a, b) => {
      return isHorizontal ? a.clientRect.left - b.clientRect.left : a.clientRect.top - b.clientRect.top;
    });
  }
  _getVisualItemPositions() {
    return this.orientation === "horizontal" && this.direction === "rtl" ? this._itemPositions.slice().reverse() : this._itemPositions;
  }
  _getItemOffsetPx(currentPosition, newPosition, delta) {
    const isHorizontal = this.orientation === "horizontal";
    let itemOffset = isHorizontal ? newPosition.left - currentPosition.left : newPosition.top - currentPosition.top;
    if (delta === -1) {
      itemOffset += isHorizontal ? newPosition.width - currentPosition.width : newPosition.height - currentPosition.height;
    }
    return itemOffset;
  }
  _getSiblingOffsetPx(currentIndex, siblings, delta) {
    const isHorizontal = this.orientation === "horizontal";
    const currentPosition = siblings[currentIndex].clientRect;
    const immediateSibling = siblings[currentIndex + delta * -1];
    let siblingOffset = currentPosition[isHorizontal ? "width" : "height"] * delta;
    if (immediateSibling) {
      const start = isHorizontal ? "left" : "top";
      const end = isHorizontal ? "right" : "bottom";
      if (delta === -1) {
        siblingOffset -= immediateSibling.clientRect[start] - currentPosition[end];
      } else {
        siblingOffset += currentPosition[start] - immediateSibling.clientRect[end];
      }
    }
    return siblingOffset;
  }
  _shouldEnterAsFirstChild(pointerX, pointerY) {
    if (!this._activeDraggables.length) {
      return false;
    }
    const itemPositions = this._itemPositions;
    const isHorizontal = this.orientation === "horizontal";
    const reversed = itemPositions[0].drag !== this._activeDraggables[0];
    if (reversed) {
      const lastItemRect = itemPositions[itemPositions.length - 1].clientRect;
      return isHorizontal ? pointerX >= lastItemRect.right : pointerY >= lastItemRect.bottom;
    } else {
      const firstItemRect = itemPositions[0].clientRect;
      return isHorizontal ? pointerX <= firstItemRect.left : pointerY <= firstItemRect.top;
    }
  }
  _getItemIndexFromPointerPosition(item, pointerX, pointerY, delta) {
    const isHorizontal = this.orientation === "horizontal";
    const index = this._itemPositions.findIndex(({
      drag,
      clientRect
    }) => {
      if (drag === item) {
        return false;
      }
      if (delta) {
        const direction = isHorizontal ? delta.x : delta.y;
        if (drag === this._previousSwap.drag && this._previousSwap.overlaps && direction === this._previousSwap.delta) {
          return false;
        }
      }
      return isHorizontal ? pointerX >= Math.floor(clientRect.left) && pointerX < Math.floor(clientRect.right) : pointerY >= Math.floor(clientRect.top) && pointerY < Math.floor(clientRect.bottom);
    });
    return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
  }
};
var MixedSortStrategy = class {
  _document;
  _dragDropRegistry;
  _element;
  _sortPredicate;
  _rootNode;
  _activeItems;
  _previousSwap = {
    drag: null,
    deltaX: 0,
    deltaY: 0,
    overlaps: false
  };
  _relatedNodes = [];
  constructor(_document, _dragDropRegistry) {
    this._document = _document;
    this._dragDropRegistry = _dragDropRegistry;
  }
  start(items) {
    const childNodes = this._element.childNodes;
    this._relatedNodes = [];
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      this._relatedNodes.push([node, node.nextSibling]);
    }
    this.withItems(items);
  }
  sort(item, pointerX, pointerY, pointerDelta) {
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
    const previousSwap = this._previousSwap;
    if (newIndex === -1 || this._activeItems[newIndex] === item) {
      return null;
    }
    const toSwapWith = this._activeItems[newIndex];
    if (previousSwap.drag === toSwapWith && previousSwap.overlaps && previousSwap.deltaX === pointerDelta.x && previousSwap.deltaY === pointerDelta.y) {
      return null;
    }
    const previousIndex = this.getItemIndex(item);
    const current = item.getPlaceholderElement();
    const overlapElement = toSwapWith.getRootElement();
    if (newIndex > previousIndex) {
      overlapElement.after(current);
    } else {
      overlapElement.before(current);
    }
    moveItemInArray(this._activeItems, previousIndex, newIndex);
    const newOverlapElement = this._getRootNode().elementFromPoint(pointerX, pointerY);
    previousSwap.deltaX = pointerDelta.x;
    previousSwap.deltaY = pointerDelta.y;
    previousSwap.drag = toSwapWith;
    previousSwap.overlaps = overlapElement === newOverlapElement || overlapElement.contains(newOverlapElement);
    return {
      previousIndex,
      currentIndex: newIndex
    };
  }
  enter(item, pointerX, pointerY, index) {
    const currentIndex = this._activeItems.indexOf(item);
    if (currentIndex > -1) {
      this._activeItems.splice(currentIndex, 1);
    }
    let enterIndex = index == null || index < 0 ? this._getItemIndexFromPointerPosition(item, pointerX, pointerY) : index;
    if (enterIndex === -1) {
      enterIndex = this._getClosestItemIndexToPointer(item, pointerX, pointerY);
    }
    const targetItem = this._activeItems[enterIndex];
    if (targetItem && !this._dragDropRegistry.isDragging(targetItem)) {
      this._activeItems.splice(enterIndex, 0, item);
      targetItem.getRootElement().before(item.getPlaceholderElement());
    } else {
      this._activeItems.push(item);
      this._element.appendChild(item.getPlaceholderElement());
    }
  }
  withItems(items) {
    this._activeItems = items.slice();
  }
  withSortPredicate(predicate) {
    this._sortPredicate = predicate;
  }
  reset() {
    const root = this._element;
    const previousSwap = this._previousSwap;
    for (let i = this._relatedNodes.length - 1; i > -1; i--) {
      const [node, nextSibling] = this._relatedNodes[i];
      if (node.parentNode === root && node.nextSibling !== nextSibling) {
        if (nextSibling === null) {
          root.appendChild(node);
        } else if (nextSibling.parentNode === root) {
          root.insertBefore(node, nextSibling);
        }
      }
    }
    this._relatedNodes = [];
    this._activeItems = [];
    previousSwap.drag = null;
    previousSwap.deltaX = previousSwap.deltaY = 0;
    previousSwap.overlaps = false;
  }
  getActiveItemsSnapshot() {
    return this._activeItems;
  }
  getItemIndex(item) {
    return this._activeItems.indexOf(item);
  }
  getItemAtIndex(index) {
    return this._activeItems[index] || null;
  }
  updateOnScroll() {
    this._activeItems.forEach((item) => {
      if (this._dragDropRegistry.isDragging(item)) {
        item._sortFromLastPointerPosition();
      }
    });
  }
  withElementContainer(container) {
    if (container !== this._element) {
      this._element = container;
      this._rootNode = void 0;
    }
  }
  _getItemIndexFromPointerPosition(item, pointerX, pointerY) {
    const elementAtPoint = this._getRootNode().elementFromPoint(Math.floor(pointerX), Math.floor(pointerY));
    const index = elementAtPoint ? this._activeItems.findIndex((item2) => {
      const root = item2.getRootElement();
      return elementAtPoint === root || root.contains(elementAtPoint);
    }) : -1;
    return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
  }
  _getRootNode() {
    if (!this._rootNode) {
      this._rootNode = _getShadowRoot(this._element) || this._document;
    }
    return this._rootNode;
  }
  _getClosestItemIndexToPointer(item, pointerX, pointerY) {
    if (this._activeItems.length === 0) {
      return -1;
    }
    if (this._activeItems.length === 1) {
      return 0;
    }
    let minDistance = Infinity;
    let minIndex = -1;
    for (let i = 0; i < this._activeItems.length; i++) {
      const current = this._activeItems[i];
      if (current !== item) {
        const {
          x,
          y
        } = current.getRootElement().getBoundingClientRect();
        const distance = Math.hypot(pointerX - x, pointerY - y);
        if (distance < minDistance) {
          minDistance = distance;
          minIndex = i;
        }
      }
    }
    return minIndex;
  }
};
var DROP_PROXIMITY_THRESHOLD = 0.05;
var SCROLL_PROXIMITY_THRESHOLD = 0.05;
var AutoScrollVerticalDirection;
(function(AutoScrollVerticalDirection2) {
  AutoScrollVerticalDirection2[AutoScrollVerticalDirection2["NONE"] = 0] = "NONE";
  AutoScrollVerticalDirection2[AutoScrollVerticalDirection2["UP"] = 1] = "UP";
  AutoScrollVerticalDirection2[AutoScrollVerticalDirection2["DOWN"] = 2] = "DOWN";
})(AutoScrollVerticalDirection || (AutoScrollVerticalDirection = {}));
var AutoScrollHorizontalDirection;
(function(AutoScrollHorizontalDirection2) {
  AutoScrollHorizontalDirection2[AutoScrollHorizontalDirection2["NONE"] = 0] = "NONE";
  AutoScrollHorizontalDirection2[AutoScrollHorizontalDirection2["LEFT"] = 1] = "LEFT";
  AutoScrollHorizontalDirection2[AutoScrollHorizontalDirection2["RIGHT"] = 2] = "RIGHT";
})(AutoScrollHorizontalDirection || (AutoScrollHorizontalDirection = {}));
var DropListRef = class {
  _dragDropRegistry;
  _ngZone;
  _viewportRuler;
  element;
  disabled = false;
  sortingDisabled = false;
  lockAxis = null;
  autoScrollDisabled = false;
  autoScrollStep = 2;
  hasAnchor = false;
  enterPredicate = () => true;
  sortPredicate = () => true;
  beforeStarted = new Subject();
  entered = new Subject();
  exited = new Subject();
  dropped = new Subject();
  sorted = new Subject();
  receivingStarted = new Subject();
  receivingStopped = new Subject();
  data;
  _container;
  _isDragging = false;
  _parentPositions;
  _sortStrategy;
  _domRect;
  _draggables = [];
  _siblings = [];
  _activeSiblings = /* @__PURE__ */ new Set();
  _viewportScrollSubscription = Subscription.EMPTY;
  _verticalScrollDirection = AutoScrollVerticalDirection.NONE;
  _horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
  _scrollNode;
  _stopScrollTimers = new Subject();
  _cachedShadowRoot = null;
  _document;
  _scrollableElements = [];
  _initialScrollSnap;
  _direction = "ltr";
  constructor(element, _dragDropRegistry, _document, _ngZone, _viewportRuler) {
    this._dragDropRegistry = _dragDropRegistry;
    this._ngZone = _ngZone;
    this._viewportRuler = _viewportRuler;
    const coercedElement = this.element = coerceElement(element);
    this._document = _document;
    this.withOrientation("vertical").withElementContainer(coercedElement);
    _dragDropRegistry.registerDropContainer(this);
    this._parentPositions = new ParentPositionTracker(_document);
  }
  dispose() {
    this._stopScrolling();
    this._stopScrollTimers.complete();
    this._viewportScrollSubscription.unsubscribe();
    this.beforeStarted.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    this.sorted.complete();
    this.receivingStarted.complete();
    this.receivingStopped.complete();
    this._activeSiblings.clear();
    this._scrollNode = null;
    this._parentPositions.clear();
    this._dragDropRegistry.removeDropContainer(this);
  }
  isDragging() {
    return this._isDragging;
  }
  start() {
    this._draggingStarted();
    this._notifyReceivingSiblings();
  }
  enter(item, pointerX, pointerY, index) {
    this._draggingStarted();
    if (index == null && this.sortingDisabled) {
      index = this._draggables.indexOf(item);
    }
    this._sortStrategy.enter(item, pointerX, pointerY, index);
    this._cacheParentPositions();
    this._notifyReceivingSiblings();
    this.entered.next({
      item,
      container: this,
      currentIndex: this.getItemIndex(item)
    });
  }
  exit(item) {
    this._reset();
    this.exited.next({
      item,
      container: this
    });
  }
  drop(item, currentIndex, previousIndex, previousContainer, isPointerOverContainer, distance, dropPoint, event = {}) {
    this._reset();
    this.dropped.next({
      item,
      currentIndex,
      previousIndex,
      container: this,
      previousContainer,
      isPointerOverContainer,
      distance,
      dropPoint,
      event
    });
  }
  withItems(items) {
    const previousItems = this._draggables;
    this._draggables = items;
    items.forEach((item) => item._withDropContainer(this));
    if (this.isDragging()) {
      const draggedItems = previousItems.filter((item) => item.isDragging());
      if (draggedItems.every((item) => items.indexOf(item) === -1)) {
        this._reset();
      } else {
        this._sortStrategy.withItems(this._draggables);
      }
    }
    return this;
  }
  withDirection(direction) {
    this._direction = direction;
    if (this._sortStrategy instanceof SingleAxisSortStrategy) {
      this._sortStrategy.direction = direction;
    }
    return this;
  }
  connectedTo(connectedTo) {
    this._siblings = connectedTo.slice();
    return this;
  }
  withOrientation(orientation) {
    if (orientation === "mixed") {
      this._sortStrategy = new MixedSortStrategy(this._document, this._dragDropRegistry);
    } else {
      const strategy = new SingleAxisSortStrategy(this._dragDropRegistry);
      strategy.direction = this._direction;
      strategy.orientation = orientation;
      this._sortStrategy = strategy;
    }
    this._sortStrategy.withElementContainer(this._container);
    this._sortStrategy.withSortPredicate((index, item) => this.sortPredicate(index, item, this));
    return this;
  }
  withScrollableParents(elements) {
    const element = this._container;
    this._scrollableElements = elements.indexOf(element) === -1 ? [element, ...elements] : elements.slice();
    return this;
  }
  withElementContainer(container) {
    if (container === this._container) {
      return this;
    }
    const element = coerceElement(this.element);
    if ((typeof ngDevMode === "undefined" || ngDevMode) && container !== element && !element.contains(container)) {
      throw new Error("Invalid DOM structure for drop list. Alternate container element must be a descendant of the drop list.");
    }
    const oldContainerIndex = this._scrollableElements.indexOf(this._container);
    const newContainerIndex = this._scrollableElements.indexOf(container);
    if (oldContainerIndex > -1) {
      this._scrollableElements.splice(oldContainerIndex, 1);
    }
    if (newContainerIndex > -1) {
      this._scrollableElements.splice(newContainerIndex, 1);
    }
    if (this._sortStrategy) {
      this._sortStrategy.withElementContainer(container);
    }
    this._cachedShadowRoot = null;
    this._scrollableElements.unshift(container);
    this._container = container;
    return this;
  }
  getScrollableParents() {
    return this._scrollableElements;
  }
  getItemIndex(item) {
    return this._isDragging ? this._sortStrategy.getItemIndex(item) : this._draggables.indexOf(item);
  }
  getItemAtIndex(index) {
    return this._isDragging ? this._sortStrategy.getItemAtIndex(index) : this._draggables[index] || null;
  }
  isReceiving() {
    return this._activeSiblings.size > 0;
  }
  _sortItem(item, pointerX, pointerY, pointerDelta) {
    if (this.sortingDisabled || !this._domRect || !isPointerNearDomRect(this._domRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)) {
      return;
    }
    const result = this._sortStrategy.sort(item, pointerX, pointerY, pointerDelta);
    if (result) {
      this.sorted.next({
        previousIndex: result.previousIndex,
        currentIndex: result.currentIndex,
        container: this,
        item
      });
    }
  }
  _startScrollingIfNecessary(pointerX, pointerY) {
    if (this.autoScrollDisabled) {
      return;
    }
    let scrollNode;
    let verticalScrollDirection = AutoScrollVerticalDirection.NONE;
    let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
    this._parentPositions.positions.forEach((position, element) => {
      if (element === this._document || !position.clientRect || scrollNode) {
        return;
      }
      if (isPointerNearDomRect(position.clientRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)) {
        [verticalScrollDirection, horizontalScrollDirection] = getElementScrollDirections(element, position.clientRect, this._direction, pointerX, pointerY);
        if (verticalScrollDirection || horizontalScrollDirection) {
          scrollNode = element;
        }
      }
    });
    if (!verticalScrollDirection && !horizontalScrollDirection) {
      const {
        width,
        height
      } = this._viewportRuler.getViewportSize();
      const domRect = {
        width,
        height,
        top: 0,
        right: width,
        bottom: height,
        left: 0
      };
      verticalScrollDirection = getVerticalScrollDirection(domRect, pointerY);
      horizontalScrollDirection = getHorizontalScrollDirection(domRect, pointerX);
      scrollNode = window;
    }
    if (scrollNode && (verticalScrollDirection !== this._verticalScrollDirection || horizontalScrollDirection !== this._horizontalScrollDirection || scrollNode !== this._scrollNode)) {
      this._verticalScrollDirection = verticalScrollDirection;
      this._horizontalScrollDirection = horizontalScrollDirection;
      this._scrollNode = scrollNode;
      if ((verticalScrollDirection || horizontalScrollDirection) && scrollNode) {
        this._ngZone.runOutsideAngular(this._startScrollInterval);
      } else {
        this._stopScrolling();
      }
    }
  }
  _stopScrolling() {
    this._stopScrollTimers.next();
  }
  _draggingStarted() {
    const styles = this._container.style;
    this.beforeStarted.next();
    this._isDragging = true;
    if ((typeof ngDevMode === "undefined" || ngDevMode) && this._container !== coerceElement(this.element)) {
      for (const drag of this._draggables) {
        if (!drag.isDragging() && drag.getVisibleElement().parentNode !== this._container) {
          throw new Error("Invalid DOM structure for drop list. All items must be placed directly inside of the element container.");
        }
      }
    }
    this._initialScrollSnap = styles.msScrollSnapType || styles.scrollSnapType || "";
    styles.scrollSnapType = styles.msScrollSnapType = "none";
    this._sortStrategy.start(this._draggables);
    this._cacheParentPositions();
    this._viewportScrollSubscription.unsubscribe();
    this._listenToScrollEvents();
  }
  _cacheParentPositions() {
    this._parentPositions.cache(this._scrollableElements);
    this._domRect = this._parentPositions.positions.get(this._container).clientRect;
  }
  _reset() {
    this._isDragging = false;
    const styles = this._container.style;
    styles.scrollSnapType = styles.msScrollSnapType = this._initialScrollSnap;
    this._siblings.forEach((sibling) => sibling._stopReceiving(this));
    this._sortStrategy.reset();
    this._stopScrolling();
    this._viewportScrollSubscription.unsubscribe();
    this._parentPositions.clear();
  }
  _startScrollInterval = () => {
    this._stopScrolling();
    interval(0, animationFrameScheduler).pipe(takeUntil(this._stopScrollTimers)).subscribe(() => {
      const node = this._scrollNode;
      const scrollStep = this.autoScrollStep;
      if (this._verticalScrollDirection === AutoScrollVerticalDirection.UP) {
        node.scrollBy(0, -scrollStep);
      } else if (this._verticalScrollDirection === AutoScrollVerticalDirection.DOWN) {
        node.scrollBy(0, scrollStep);
      }
      if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.LEFT) {
        node.scrollBy(-scrollStep, 0);
      } else if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.RIGHT) {
        node.scrollBy(scrollStep, 0);
      }
    });
  };
  _isOverContainer(x, y) {
    return this._domRect != null && isInsideClientRect(this._domRect, x, y);
  }
  _getSiblingContainerFromPosition(item, x, y) {
    return this._siblings.find((sibling) => sibling._canReceive(item, x, y));
  }
  _canReceive(item, x, y) {
    if (!this._domRect || !isInsideClientRect(this._domRect, x, y) || !this.enterPredicate(item, this)) {
      return false;
    }
    const elementFromPoint = this._getShadowRoot().elementFromPoint(x, y);
    if (!elementFromPoint) {
      return false;
    }
    return elementFromPoint === this._container || this._container.contains(elementFromPoint);
  }
  _startReceiving(sibling, items) {
    const activeSiblings = this._activeSiblings;
    if (!activeSiblings.has(sibling) && items.every((item) => {
      return this.enterPredicate(item, this) || this._draggables.indexOf(item) > -1;
    })) {
      activeSiblings.add(sibling);
      this._cacheParentPositions();
      this._listenToScrollEvents();
      this.receivingStarted.next({
        initiator: sibling,
        receiver: this,
        items
      });
    }
  }
  _stopReceiving(sibling) {
    this._activeSiblings.delete(sibling);
    this._viewportScrollSubscription.unsubscribe();
    this.receivingStopped.next({
      initiator: sibling,
      receiver: this
    });
  }
  _listenToScrollEvents() {
    this._viewportScrollSubscription = this._dragDropRegistry.scrolled(this._getShadowRoot()).subscribe((event) => {
      if (this.isDragging()) {
        const scrollDifference = this._parentPositions.handleScroll(event);
        if (scrollDifference) {
          this._sortStrategy.updateOnScroll(scrollDifference.top, scrollDifference.left);
        }
      } else if (this.isReceiving()) {
        this._cacheParentPositions();
      }
    });
  }
  _getShadowRoot() {
    if (!this._cachedShadowRoot) {
      const shadowRoot = _getShadowRoot(this._container);
      this._cachedShadowRoot = shadowRoot || this._document;
    }
    return this._cachedShadowRoot;
  }
  _notifyReceivingSiblings() {
    const draggedItems = this._sortStrategy.getActiveItemsSnapshot().filter((item) => item.isDragging());
    this._siblings.forEach((sibling) => sibling._startReceiving(this, draggedItems));
  }
};
function getVerticalScrollDirection(clientRect, pointerY) {
  const {
    top,
    bottom,
    height
  } = clientRect;
  const yThreshold = height * SCROLL_PROXIMITY_THRESHOLD;
  if (pointerY >= top - yThreshold && pointerY <= top + yThreshold) {
    return AutoScrollVerticalDirection.UP;
  } else if (pointerY >= bottom - yThreshold && pointerY <= bottom + yThreshold) {
    return AutoScrollVerticalDirection.DOWN;
  }
  return AutoScrollVerticalDirection.NONE;
}
function getHorizontalScrollDirection(clientRect, pointerX) {
  const {
    left,
    right,
    width
  } = clientRect;
  const xThreshold = width * SCROLL_PROXIMITY_THRESHOLD;
  if (pointerX >= left - xThreshold && pointerX <= left + xThreshold) {
    return AutoScrollHorizontalDirection.LEFT;
  } else if (pointerX >= right - xThreshold && pointerX <= right + xThreshold) {
    return AutoScrollHorizontalDirection.RIGHT;
  }
  return AutoScrollHorizontalDirection.NONE;
}
function getElementScrollDirections(element, clientRect, direction, pointerX, pointerY) {
  const computedVertical = getVerticalScrollDirection(clientRect, pointerY);
  const computedHorizontal = getHorizontalScrollDirection(clientRect, pointerX);
  let verticalScrollDirection = AutoScrollVerticalDirection.NONE;
  let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
  if (computedVertical) {
    const scrollTop = element.scrollTop;
    if (computedVertical === AutoScrollVerticalDirection.UP) {
      if (scrollTop > 0) {
        verticalScrollDirection = AutoScrollVerticalDirection.UP;
      }
    } else if (element.scrollHeight - scrollTop > element.clientHeight) {
      verticalScrollDirection = AutoScrollVerticalDirection.DOWN;
    }
  }
  if (computedHorizontal) {
    const scrollLeft = element.scrollLeft;
    if (direction === "rtl") {
      if (computedHorizontal === AutoScrollHorizontalDirection.RIGHT) {
        if (scrollLeft < 0) {
          horizontalScrollDirection = AutoScrollHorizontalDirection.RIGHT;
        }
      } else if (element.scrollWidth + scrollLeft > element.clientWidth) {
        horizontalScrollDirection = AutoScrollHorizontalDirection.LEFT;
      }
    } else {
      if (computedHorizontal === AutoScrollHorizontalDirection.LEFT) {
        if (scrollLeft > 0) {
          horizontalScrollDirection = AutoScrollHorizontalDirection.LEFT;
        }
      } else if (element.scrollWidth - scrollLeft > element.clientWidth) {
        horizontalScrollDirection = AutoScrollHorizontalDirection.RIGHT;
      }
    }
  }
  return [verticalScrollDirection, horizontalScrollDirection];
}
var capturingEventOptions = {
  capture: true
};
var activeCapturingEventOptions = {
  passive: false,
  capture: true
};
var _ResetsLoader = class __ResetsLoader {
  static \u0275fac = function _ResetsLoader_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || __ResetsLoader)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: __ResetsLoader,
    selectors: [["ng-component"]],
    hostAttrs: ["cdk-drag-resets-container", ""],
    decls: 0,
    vars: 0,
    template: function _ResetsLoader_Template(rf, ctx) {
    },
    styles: ["@layer cdk-resets{.cdk-drag-preview{background:none;border:none;padding:0;color:inherit;inset:auto}}.cdk-drag-placeholder *,.cdk-drag-preview *{pointer-events:none !important}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(_ResetsLoader, [{
    type: Component,
    args: [{
      encapsulation: ViewEncapsulation.None,
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        "cdk-drag-resets-container": ""
      },
      styles: ["@layer cdk-resets{.cdk-drag-preview{background:none;border:none;padding:0;color:inherit;inset:auto}}.cdk-drag-placeholder *,.cdk-drag-preview *{pointer-events:none !important}\n"]
    }]
  }], null, null);
})();
var DragDropRegistry = class _DragDropRegistry {
  _ngZone = inject(NgZone);
  _document = inject(DOCUMENT);
  _styleLoader = inject(_CdkPrivateStyleLoader);
  _renderer = inject(RendererFactory2).createRenderer(null, null);
  _cleanupDocumentTouchmove;
  _scroll = new Subject();
  _dropInstances = /* @__PURE__ */ new Set();
  _dragInstances = /* @__PURE__ */ new Set();
  _activeDragInstances = signal([], ...ngDevMode ? [{
    debugName: "_activeDragInstances"
  }] : []);
  _globalListeners;
  _draggingPredicate = (item) => item.isDragging();
  _domNodesToDirectives = null;
  pointerMove = new Subject();
  pointerUp = new Subject();
  constructor() {
  }
  registerDropContainer(drop) {
    if (!this._dropInstances.has(drop)) {
      this._dropInstances.add(drop);
    }
  }
  registerDragItem(drag) {
    this._dragInstances.add(drag);
    if (this._dragInstances.size === 1) {
      this._ngZone.runOutsideAngular(() => {
        this._cleanupDocumentTouchmove?.();
        this._cleanupDocumentTouchmove = this._renderer.listen(this._document, "touchmove", this._persistentTouchmoveListener, activeCapturingEventOptions);
      });
    }
  }
  removeDropContainer(drop) {
    this._dropInstances.delete(drop);
  }
  removeDragItem(drag) {
    this._dragInstances.delete(drag);
    this.stopDragging(drag);
    if (this._dragInstances.size === 0) {
      this._cleanupDocumentTouchmove?.();
    }
  }
  startDragging(drag, event) {
    if (this._activeDragInstances().indexOf(drag) > -1) {
      return;
    }
    this._styleLoader.load(_ResetsLoader);
    this._activeDragInstances.update((instances) => [...instances, drag]);
    if (this._activeDragInstances().length === 1) {
      const isTouchEvent2 = event.type.startsWith("touch");
      const endEventHandler = (e) => this.pointerUp.next(e);
      const toBind = [["scroll", (e) => this._scroll.next(e), capturingEventOptions], ["selectstart", this._preventDefaultWhileDragging, activeCapturingEventOptions]];
      if (isTouchEvent2) {
        toBind.push(["touchend", endEventHandler, capturingEventOptions], ["touchcancel", endEventHandler, capturingEventOptions]);
      } else {
        toBind.push(["mouseup", endEventHandler, capturingEventOptions]);
      }
      if (!isTouchEvent2) {
        toBind.push(["mousemove", (e) => this.pointerMove.next(e), activeCapturingEventOptions]);
      }
      this._ngZone.runOutsideAngular(() => {
        this._globalListeners = toBind.map(([name, handler, options]) => this._renderer.listen(this._document, name, handler, options));
      });
    }
  }
  stopDragging(drag) {
    this._activeDragInstances.update((instances) => {
      const index = instances.indexOf(drag);
      if (index > -1) {
        instances.splice(index, 1);
        return [...instances];
      }
      return instances;
    });
    if (this._activeDragInstances().length === 0) {
      this._clearGlobalListeners();
    }
  }
  isDragging(drag) {
    return this._activeDragInstances().indexOf(drag) > -1;
  }
  scrolled(shadowRoot) {
    const streams = [this._scroll];
    if (shadowRoot && shadowRoot !== this._document) {
      streams.push(new Observable((observer) => {
        return this._ngZone.runOutsideAngular(() => {
          const cleanup = this._renderer.listen(shadowRoot, "scroll", (event) => {
            if (this._activeDragInstances().length) {
              observer.next(event);
            }
          }, capturingEventOptions);
          return () => {
            cleanup();
          };
        });
      }));
    }
    return merge(...streams);
  }
  registerDirectiveNode(node, dragRef) {
    this._domNodesToDirectives ??= /* @__PURE__ */ new WeakMap();
    this._domNodesToDirectives.set(node, dragRef);
  }
  removeDirectiveNode(node) {
    this._domNodesToDirectives?.delete(node);
  }
  getDragDirectiveForNode(node) {
    return this._domNodesToDirectives?.get(node) || null;
  }
  ngOnDestroy() {
    this._dragInstances.forEach((instance) => this.removeDragItem(instance));
    this._dropInstances.forEach((instance) => this.removeDropContainer(instance));
    this._domNodesToDirectives = null;
    this._clearGlobalListeners();
    this.pointerMove.complete();
    this.pointerUp.complete();
  }
  _preventDefaultWhileDragging = (event) => {
    if (this._activeDragInstances().length > 0) {
      event.preventDefault();
    }
  };
  _persistentTouchmoveListener = (event) => {
    if (this._activeDragInstances().length > 0) {
      if (this._activeDragInstances().some(this._draggingPredicate)) {
        event.preventDefault();
      }
      this.pointerMove.next(event);
    }
  };
  _clearGlobalListeners() {
    this._globalListeners?.forEach((cleanup) => cleanup());
    this._globalListeners = void 0;
  }
  static \u0275fac = function DragDropRegistry_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DragDropRegistry)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _DragDropRegistry,
    factory: _DragDropRegistry.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DragDropRegistry, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var DEFAULT_CONFIG = {
  dragStartThreshold: 5,
  pointerDirectionChangeThreshold: 5
};
var DragDrop = class _DragDrop {
  _document = inject(DOCUMENT);
  _ngZone = inject(NgZone);
  _viewportRuler = inject(ViewportRuler);
  _dragDropRegistry = inject(DragDropRegistry);
  _renderer = inject(RendererFactory2).createRenderer(null, null);
  constructor() {
  }
  createDrag(element, config = DEFAULT_CONFIG) {
    return new DragRef(element, config, this._document, this._ngZone, this._viewportRuler, this._dragDropRegistry, this._renderer);
  }
  createDropList(element) {
    return new DropListRef(element, this._dragDropRegistry, this._document, this._ngZone, this._viewportRuler);
  }
  static \u0275fac = function DragDrop_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DragDrop)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _DragDrop,
    factory: _DragDrop.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DragDrop, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var CDK_DRAG_PARENT = new InjectionToken("CDK_DRAG_PARENT");
function assertElementNode(node, name) {
  if (node.nodeType !== 1) {
    throw Error(`${name} must be attached to an element node. Currently attached to "${node.nodeName}".`);
  }
}
var CDK_DRAG_HANDLE = new InjectionToken("CdkDragHandle");
var CdkDragHandle = class _CdkDragHandle {
  element = inject(ElementRef);
  _parentDrag = inject(CDK_DRAG_PARENT, {
    optional: true,
    skipSelf: true
  });
  _dragDropRegistry = inject(DragDropRegistry);
  _stateChanges = new Subject();
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = value;
    this._stateChanges.next(this);
  }
  _disabled = false;
  constructor() {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      assertElementNode(this.element.nativeElement, "cdkDragHandle");
    }
    this._parentDrag?._addHandle(this);
  }
  ngAfterViewInit() {
    if (!this._parentDrag) {
      let parent = this.element.nativeElement.parentElement;
      while (parent) {
        const ref = this._dragDropRegistry.getDragDirectiveForNode(parent);
        if (ref) {
          this._parentDrag = ref;
          ref._addHandle(this);
          break;
        }
        parent = parent.parentElement;
      }
    }
  }
  ngOnDestroy() {
    this._parentDrag?._removeHandle(this);
    this._stateChanges.complete();
  }
  static \u0275fac = function CdkDragHandle_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDragHandle)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkDragHandle,
    selectors: [["", "cdkDragHandle", ""]],
    hostAttrs: [1, "cdk-drag-handle"],
    inputs: {
      disabled: [2, "cdkDragHandleDisabled", "disabled", booleanAttribute]
    },
    features: [\u0275\u0275ProvidersFeature([{
      provide: CDK_DRAG_HANDLE,
      useExisting: _CdkDragHandle
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDragHandle, [{
    type: Directive,
    args: [{
      selector: "[cdkDragHandle]",
      host: {
        "class": "cdk-drag-handle"
      },
      providers: [{
        provide: CDK_DRAG_HANDLE,
        useExisting: CdkDragHandle
      }]
    }]
  }], () => [], {
    disabled: [{
      type: Input,
      args: [{
        alias: "cdkDragHandleDisabled",
        transform: booleanAttribute
      }]
    }]
  });
})();
var CDK_DRAG_CONFIG = new InjectionToken("CDK_DRAG_CONFIG");
var CDK_DROP_LIST = new InjectionToken("CdkDropList");
var CdkDrag = class _CdkDrag {
  element = inject(ElementRef);
  dropContainer = inject(CDK_DROP_LIST, {
    optional: true,
    skipSelf: true
  });
  _ngZone = inject(NgZone);
  _viewContainerRef = inject(ViewContainerRef);
  _dir = inject(Directionality, {
    optional: true
  });
  _changeDetectorRef = inject(ChangeDetectorRef);
  _selfHandle = inject(CDK_DRAG_HANDLE, {
    optional: true,
    self: true
  });
  _parentDrag = inject(CDK_DRAG_PARENT, {
    optional: true,
    skipSelf: true
  });
  _dragDropRegistry = inject(DragDropRegistry);
  _destroyed = new Subject();
  _handles = new BehaviorSubject([]);
  _previewTemplate;
  _placeholderTemplate;
  _dragRef;
  data;
  lockAxis = null;
  rootElementSelector;
  boundaryElement;
  dragStartDelay;
  freeDragPosition;
  get disabled() {
    return this._disabled || !!(this.dropContainer && this.dropContainer.disabled);
  }
  set disabled(value) {
    this._disabled = value;
    this._dragRef.disabled = this._disabled;
  }
  _disabled;
  constrainPosition;
  previewClass;
  previewContainer;
  scale = 1;
  started = new EventEmitter();
  released = new EventEmitter();
  ended = new EventEmitter();
  entered = new EventEmitter();
  exited = new EventEmitter();
  dropped = new EventEmitter();
  moved = new Observable((observer) => {
    const subscription = this._dragRef.moved.pipe(map((movedEvent) => ({
      source: this,
      pointerPosition: movedEvent.pointerPosition,
      event: movedEvent.event,
      delta: movedEvent.delta,
      distance: movedEvent.distance
    }))).subscribe(observer);
    return () => {
      subscription.unsubscribe();
    };
  });
  _injector = inject(Injector);
  constructor() {
    const dropContainer = this.dropContainer;
    const config = inject(CDK_DRAG_CONFIG, {
      optional: true
    });
    const dragDrop = inject(DragDrop);
    this._dragRef = dragDrop.createDrag(this.element, {
      dragStartThreshold: config && config.dragStartThreshold != null ? config.dragStartThreshold : 5,
      pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null ? config.pointerDirectionChangeThreshold : 5,
      zIndex: config?.zIndex
    });
    this._dragRef.data = this;
    this._dragDropRegistry.registerDirectiveNode(this.element.nativeElement, this);
    if (config) {
      this._assignDefaults(config);
    }
    if (dropContainer) {
      dropContainer.addItem(this);
      dropContainer._dropListRef.beforeStarted.pipe(takeUntil(this._destroyed)).subscribe(() => {
        this._dragRef.scale = this.scale;
      });
    }
    this._syncInputs(this._dragRef);
    this._handleEvents(this._dragRef);
  }
  getPlaceholderElement() {
    return this._dragRef.getPlaceholderElement();
  }
  getRootElement() {
    return this._dragRef.getRootElement();
  }
  reset() {
    this._dragRef.reset();
  }
  resetToBoundary() {
    this._dragRef.resetToBoundary();
  }
  getFreeDragPosition() {
    return this._dragRef.getFreeDragPosition();
  }
  setFreeDragPosition(value) {
    this._dragRef.setFreeDragPosition(value);
  }
  ngAfterViewInit() {
    afterNextRender(() => {
      this._updateRootElement();
      this._setupHandlesListener();
      this._dragRef.scale = this.scale;
      if (this.freeDragPosition) {
        this._dragRef.setFreeDragPosition(this.freeDragPosition);
      }
    }, {
      injector: this._injector
    });
  }
  ngOnChanges(changes) {
    const rootSelectorChange = changes["rootElementSelector"];
    const positionChange = changes["freeDragPosition"];
    if (rootSelectorChange && !rootSelectorChange.firstChange) {
      this._updateRootElement();
    }
    this._dragRef.scale = this.scale;
    if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
      this._dragRef.setFreeDragPosition(this.freeDragPosition);
    }
  }
  ngOnDestroy() {
    if (this.dropContainer) {
      this.dropContainer.removeItem(this);
    }
    this._dragDropRegistry.removeDirectiveNode(this.element.nativeElement);
    this._ngZone.runOutsideAngular(() => {
      this._handles.complete();
      this._destroyed.next();
      this._destroyed.complete();
      this._dragRef.dispose();
    });
  }
  _addHandle(handle) {
    const handles = this._handles.getValue();
    handles.push(handle);
    this._handles.next(handles);
  }
  _removeHandle(handle) {
    const handles = this._handles.getValue();
    const index = handles.indexOf(handle);
    if (index > -1) {
      handles.splice(index, 1);
      this._handles.next(handles);
    }
  }
  _setPreviewTemplate(preview) {
    this._previewTemplate = preview;
  }
  _resetPreviewTemplate(preview) {
    if (preview === this._previewTemplate) {
      this._previewTemplate = null;
    }
  }
  _setPlaceholderTemplate(placeholder) {
    this._placeholderTemplate = placeholder;
  }
  _resetPlaceholderTemplate(placeholder) {
    if (placeholder === this._placeholderTemplate) {
      this._placeholderTemplate = null;
    }
  }
  _updateRootElement() {
    const element = this.element.nativeElement;
    let rootElement = element;
    if (this.rootElementSelector) {
      rootElement = element.closest !== void 0 ? element.closest(this.rootElementSelector) : element.parentElement?.closest(this.rootElementSelector);
    }
    if (rootElement && (typeof ngDevMode === "undefined" || ngDevMode)) {
      assertElementNode(rootElement, "cdkDrag");
    }
    this._dragRef.withRootElement(rootElement || element);
  }
  _getBoundaryElement() {
    const boundary = this.boundaryElement;
    if (!boundary) {
      return null;
    }
    if (typeof boundary === "string") {
      return this.element.nativeElement.closest(boundary);
    }
    return coerceElement(boundary);
  }
  _syncInputs(ref) {
    ref.beforeStarted.subscribe(() => {
      if (!ref.isDragging()) {
        const dir = this._dir;
        const dragStartDelay = this.dragStartDelay;
        const placeholder = this._placeholderTemplate ? {
          template: this._placeholderTemplate.templateRef,
          context: this._placeholderTemplate.data,
          viewContainer: this._viewContainerRef
        } : null;
        const preview = this._previewTemplate ? {
          template: this._previewTemplate.templateRef,
          context: this._previewTemplate.data,
          matchSize: this._previewTemplate.matchSize,
          viewContainer: this._viewContainerRef
        } : null;
        ref.disabled = this.disabled;
        ref.lockAxis = this.lockAxis;
        ref.scale = this.scale;
        ref.dragStartDelay = typeof dragStartDelay === "object" && dragStartDelay ? dragStartDelay : coerceNumberProperty(dragStartDelay);
        ref.constrainPosition = this.constrainPosition;
        ref.previewClass = this.previewClass;
        ref.withBoundaryElement(this._getBoundaryElement()).withPlaceholderTemplate(placeholder).withPreviewTemplate(preview).withPreviewContainer(this.previewContainer || "global");
        if (dir) {
          ref.withDirection(dir.value);
        }
      }
    });
    ref.beforeStarted.pipe(take(1)).subscribe(() => {
      if (this._parentDrag) {
        ref.withParent(this._parentDrag._dragRef);
        return;
      }
      let parent = this.element.nativeElement.parentElement;
      while (parent) {
        const parentDrag = this._dragDropRegistry.getDragDirectiveForNode(parent);
        if (parentDrag) {
          ref.withParent(parentDrag._dragRef);
          break;
        }
        parent = parent.parentElement;
      }
    });
  }
  _handleEvents(ref) {
    ref.started.subscribe((startEvent) => {
      this.started.emit({
        source: this,
        event: startEvent.event
      });
      this._changeDetectorRef.markForCheck();
    });
    ref.released.subscribe((releaseEvent) => {
      this.released.emit({
        source: this,
        event: releaseEvent.event
      });
    });
    ref.ended.subscribe((endEvent) => {
      this.ended.emit({
        source: this,
        distance: endEvent.distance,
        dropPoint: endEvent.dropPoint,
        event: endEvent.event
      });
      this._changeDetectorRef.markForCheck();
    });
    ref.entered.subscribe((enterEvent) => {
      this.entered.emit({
        container: enterEvent.container.data,
        item: this,
        currentIndex: enterEvent.currentIndex
      });
    });
    ref.exited.subscribe((exitEvent) => {
      this.exited.emit({
        container: exitEvent.container.data,
        item: this
      });
    });
    ref.dropped.subscribe((dropEvent) => {
      this.dropped.emit({
        previousIndex: dropEvent.previousIndex,
        currentIndex: dropEvent.currentIndex,
        previousContainer: dropEvent.previousContainer.data,
        container: dropEvent.container.data,
        isPointerOverContainer: dropEvent.isPointerOverContainer,
        item: this,
        distance: dropEvent.distance,
        dropPoint: dropEvent.dropPoint,
        event: dropEvent.event
      });
    });
  }
  _assignDefaults(config) {
    const {
      lockAxis,
      dragStartDelay,
      constrainPosition,
      previewClass,
      boundaryElement,
      draggingDisabled,
      rootElementSelector,
      previewContainer
    } = config;
    this.disabled = draggingDisabled == null ? false : draggingDisabled;
    this.dragStartDelay = dragStartDelay || 0;
    this.lockAxis = lockAxis || null;
    if (constrainPosition) {
      this.constrainPosition = constrainPosition;
    }
    if (previewClass) {
      this.previewClass = previewClass;
    }
    if (boundaryElement) {
      this.boundaryElement = boundaryElement;
    }
    if (rootElementSelector) {
      this.rootElementSelector = rootElementSelector;
    }
    if (previewContainer) {
      this.previewContainer = previewContainer;
    }
  }
  _setupHandlesListener() {
    this._handles.pipe(tap((handles) => {
      const handleElements = handles.map((handle) => handle.element);
      if (this._selfHandle && this.rootElementSelector) {
        handleElements.push(this.element);
      }
      this._dragRef.withHandles(handleElements);
    }), switchMap((handles) => {
      return merge(...handles.map((item) => item._stateChanges.pipe(startWith(item))));
    }), takeUntil(this._destroyed)).subscribe((handleInstance) => {
      const dragRef = this._dragRef;
      const handle = handleInstance.element.nativeElement;
      handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
    });
  }
  static \u0275fac = function CdkDrag_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDrag)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkDrag,
    selectors: [["", "cdkDrag", ""]],
    hostAttrs: [1, "cdk-drag"],
    hostVars: 4,
    hostBindings: function CdkDrag_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275classProp("cdk-drag-disabled", ctx.disabled)("cdk-drag-dragging", ctx._dragRef.isDragging());
      }
    },
    inputs: {
      data: [0, "cdkDragData", "data"],
      lockAxis: [0, "cdkDragLockAxis", "lockAxis"],
      rootElementSelector: [0, "cdkDragRootElement", "rootElementSelector"],
      boundaryElement: [0, "cdkDragBoundary", "boundaryElement"],
      dragStartDelay: [0, "cdkDragStartDelay", "dragStartDelay"],
      freeDragPosition: [0, "cdkDragFreeDragPosition", "freeDragPosition"],
      disabled: [2, "cdkDragDisabled", "disabled", booleanAttribute],
      constrainPosition: [0, "cdkDragConstrainPosition", "constrainPosition"],
      previewClass: [0, "cdkDragPreviewClass", "previewClass"],
      previewContainer: [0, "cdkDragPreviewContainer", "previewContainer"],
      scale: [2, "cdkDragScale", "scale", numberAttribute]
    },
    outputs: {
      started: "cdkDragStarted",
      released: "cdkDragReleased",
      ended: "cdkDragEnded",
      entered: "cdkDragEntered",
      exited: "cdkDragExited",
      dropped: "cdkDragDropped",
      moved: "cdkDragMoved"
    },
    exportAs: ["cdkDrag"],
    features: [\u0275\u0275ProvidersFeature([{
      provide: CDK_DRAG_PARENT,
      useExisting: _CdkDrag
    }]), \u0275\u0275NgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDrag, [{
    type: Directive,
    args: [{
      selector: "[cdkDrag]",
      exportAs: "cdkDrag",
      host: {
        "class": "cdk-drag",
        "[class.cdk-drag-disabled]": "disabled",
        "[class.cdk-drag-dragging]": "_dragRef.isDragging()"
      },
      providers: [{
        provide: CDK_DRAG_PARENT,
        useExisting: CdkDrag
      }]
    }]
  }], () => [], {
    data: [{
      type: Input,
      args: ["cdkDragData"]
    }],
    lockAxis: [{
      type: Input,
      args: ["cdkDragLockAxis"]
    }],
    rootElementSelector: [{
      type: Input,
      args: ["cdkDragRootElement"]
    }],
    boundaryElement: [{
      type: Input,
      args: ["cdkDragBoundary"]
    }],
    dragStartDelay: [{
      type: Input,
      args: ["cdkDragStartDelay"]
    }],
    freeDragPosition: [{
      type: Input,
      args: ["cdkDragFreeDragPosition"]
    }],
    disabled: [{
      type: Input,
      args: [{
        alias: "cdkDragDisabled",
        transform: booleanAttribute
      }]
    }],
    constrainPosition: [{
      type: Input,
      args: ["cdkDragConstrainPosition"]
    }],
    previewClass: [{
      type: Input,
      args: ["cdkDragPreviewClass"]
    }],
    previewContainer: [{
      type: Input,
      args: ["cdkDragPreviewContainer"]
    }],
    scale: [{
      type: Input,
      args: [{
        alias: "cdkDragScale",
        transform: numberAttribute
      }]
    }],
    started: [{
      type: Output,
      args: ["cdkDragStarted"]
    }],
    released: [{
      type: Output,
      args: ["cdkDragReleased"]
    }],
    ended: [{
      type: Output,
      args: ["cdkDragEnded"]
    }],
    entered: [{
      type: Output,
      args: ["cdkDragEntered"]
    }],
    exited: [{
      type: Output,
      args: ["cdkDragExited"]
    }],
    dropped: [{
      type: Output,
      args: ["cdkDragDropped"]
    }],
    moved: [{
      type: Output,
      args: ["cdkDragMoved"]
    }]
  });
})();
var CDK_DROP_LIST_GROUP = new InjectionToken("CdkDropListGroup");
var CdkDropListGroup = class _CdkDropListGroup {
  _items = /* @__PURE__ */ new Set();
  disabled = false;
  ngOnDestroy() {
    this._items.clear();
  }
  static \u0275fac = function CdkDropListGroup_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDropListGroup)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkDropListGroup,
    selectors: [["", "cdkDropListGroup", ""]],
    inputs: {
      disabled: [2, "cdkDropListGroupDisabled", "disabled", booleanAttribute]
    },
    exportAs: ["cdkDropListGroup"],
    features: [\u0275\u0275ProvidersFeature([{
      provide: CDK_DROP_LIST_GROUP,
      useExisting: _CdkDropListGroup
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDropListGroup, [{
    type: Directive,
    args: [{
      selector: "[cdkDropListGroup]",
      exportAs: "cdkDropListGroup",
      providers: [{
        provide: CDK_DROP_LIST_GROUP,
        useExisting: CdkDropListGroup
      }]
    }]
  }], null, {
    disabled: [{
      type: Input,
      args: [{
        alias: "cdkDropListGroupDisabled",
        transform: booleanAttribute
      }]
    }]
  });
})();
var CdkDropList = class _CdkDropList {
  element = inject(ElementRef);
  _changeDetectorRef = inject(ChangeDetectorRef);
  _scrollDispatcher = inject(ScrollDispatcher);
  _dir = inject(Directionality, {
    optional: true
  });
  _group = inject(CDK_DROP_LIST_GROUP, {
    optional: true,
    skipSelf: true
  });
  _latestSortedRefs;
  _destroyed = new Subject();
  _scrollableParentsResolved;
  static _dropLists = [];
  _dropListRef;
  connectedTo = [];
  data;
  orientation;
  id = inject(_IdGenerator).getId("cdk-drop-list-");
  lockAxis = null;
  get disabled() {
    return this._disabled || !!this._group && this._group.disabled;
  }
  set disabled(value) {
    this._dropListRef.disabled = this._disabled = value;
  }
  _disabled;
  sortingDisabled;
  enterPredicate = () => true;
  sortPredicate = () => true;
  autoScrollDisabled;
  autoScrollStep;
  elementContainerSelector;
  hasAnchor;
  dropped = new EventEmitter();
  entered = new EventEmitter();
  exited = new EventEmitter();
  sorted = new EventEmitter();
  _unsortedItems = /* @__PURE__ */ new Set();
  constructor() {
    const dragDrop = inject(DragDrop);
    const config = inject(CDK_DRAG_CONFIG, {
      optional: true
    });
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      assertElementNode(this.element.nativeElement, "cdkDropList");
    }
    this._dropListRef = dragDrop.createDropList(this.element);
    this._dropListRef.data = this;
    if (config) {
      this._assignDefaults(config);
    }
    this._dropListRef.enterPredicate = (drag, drop) => {
      return this.enterPredicate(drag.data, drop.data);
    };
    this._dropListRef.sortPredicate = (index, drag, drop) => {
      return this.sortPredicate(index, drag.data, drop.data);
    };
    this._setupInputSyncSubscription(this._dropListRef);
    this._handleEvents(this._dropListRef);
    _CdkDropList._dropLists.push(this);
    if (this._group) {
      this._group._items.add(this);
    }
  }
  addItem(item) {
    this._unsortedItems.add(item);
    item._dragRef._withDropContainer(this._dropListRef);
    if (this._dropListRef.isDragging()) {
      this._syncItemsWithRef(this.getSortedItems().map((item2) => item2._dragRef));
    }
  }
  removeItem(item) {
    this._unsortedItems.delete(item);
    if (this._latestSortedRefs) {
      const index = this._latestSortedRefs.indexOf(item._dragRef);
      if (index > -1) {
        this._latestSortedRefs.splice(index, 1);
        this._syncItemsWithRef(this._latestSortedRefs);
      }
    }
  }
  getSortedItems() {
    return Array.from(this._unsortedItems).sort((a, b) => {
      const documentPosition = a._dragRef.getVisibleElement().compareDocumentPosition(b._dragRef.getVisibleElement());
      return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }
  ngOnDestroy() {
    const index = _CdkDropList._dropLists.indexOf(this);
    if (index > -1) {
      _CdkDropList._dropLists.splice(index, 1);
    }
    if (this._group) {
      this._group._items.delete(this);
    }
    this._latestSortedRefs = void 0;
    this._unsortedItems.clear();
    this._dropListRef.dispose();
    this._destroyed.next();
    this._destroyed.complete();
  }
  _setupInputSyncSubscription(ref) {
    if (this._dir) {
      this._dir.change.pipe(startWith(this._dir.value), takeUntil(this._destroyed)).subscribe((value) => ref.withDirection(value));
    }
    ref.beforeStarted.subscribe(() => {
      const siblings = coerceArray(this.connectedTo).map((drop) => {
        if (typeof drop === "string") {
          const correspondingDropList = _CdkDropList._dropLists.find((list) => list.id === drop);
          if (!correspondingDropList && (typeof ngDevMode === "undefined" || ngDevMode)) {
            console.warn(`CdkDropList could not find connected drop list with id "${drop}"`);
          }
          return correspondingDropList;
        }
        return drop;
      });
      if (this._group) {
        this._group._items.forEach((drop) => {
          if (siblings.indexOf(drop) === -1) {
            siblings.push(drop);
          }
        });
      }
      if (!this._scrollableParentsResolved) {
        const scrollableParents = this._scrollDispatcher.getAncestorScrollContainers(this.element).map((scrollable) => scrollable.getElementRef().nativeElement);
        this._dropListRef.withScrollableParents(scrollableParents);
        this._scrollableParentsResolved = true;
      }
      if (this.elementContainerSelector) {
        const container = this.element.nativeElement.querySelector(this.elementContainerSelector);
        if (!container && (typeof ngDevMode === "undefined" || ngDevMode)) {
          throw new Error(`CdkDropList could not find an element container matching the selector "${this.elementContainerSelector}"`);
        }
        ref.withElementContainer(container);
      }
      ref.disabled = this.disabled;
      ref.lockAxis = this.lockAxis;
      ref.sortingDisabled = this.sortingDisabled;
      ref.autoScrollDisabled = this.autoScrollDisabled;
      ref.autoScrollStep = coerceNumberProperty(this.autoScrollStep, 2);
      ref.hasAnchor = this.hasAnchor;
      ref.connectedTo(siblings.filter((drop) => drop && drop !== this).map((list) => list._dropListRef)).withOrientation(this.orientation);
    });
  }
  _handleEvents(ref) {
    ref.beforeStarted.subscribe(() => {
      this._syncItemsWithRef(this.getSortedItems().map((item) => item._dragRef));
      this._changeDetectorRef.markForCheck();
    });
    ref.entered.subscribe((event) => {
      this.entered.emit({
        container: this,
        item: event.item.data,
        currentIndex: event.currentIndex
      });
    });
    ref.exited.subscribe((event) => {
      this.exited.emit({
        container: this,
        item: event.item.data
      });
      this._changeDetectorRef.markForCheck();
    });
    ref.sorted.subscribe((event) => {
      this.sorted.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        container: this,
        item: event.item.data
      });
    });
    ref.dropped.subscribe((dropEvent) => {
      this.dropped.emit({
        previousIndex: dropEvent.previousIndex,
        currentIndex: dropEvent.currentIndex,
        previousContainer: dropEvent.previousContainer.data,
        container: dropEvent.container.data,
        item: dropEvent.item.data,
        isPointerOverContainer: dropEvent.isPointerOverContainer,
        distance: dropEvent.distance,
        dropPoint: dropEvent.dropPoint,
        event: dropEvent.event
      });
      this._changeDetectorRef.markForCheck();
    });
    merge(ref.receivingStarted, ref.receivingStopped).subscribe(() => this._changeDetectorRef.markForCheck());
  }
  _assignDefaults(config) {
    const {
      lockAxis,
      draggingDisabled,
      sortingDisabled,
      listAutoScrollDisabled,
      listOrientation
    } = config;
    this.disabled = draggingDisabled == null ? false : draggingDisabled;
    this.sortingDisabled = sortingDisabled == null ? false : sortingDisabled;
    this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;
    this.orientation = listOrientation || "vertical";
    this.lockAxis = lockAxis || null;
  }
  _syncItemsWithRef(items) {
    this._latestSortedRefs = items;
    this._dropListRef.withItems(items);
  }
  static \u0275fac = function CdkDropList_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDropList)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkDropList,
    selectors: [["", "cdkDropList", ""], ["cdk-drop-list"]],
    hostAttrs: [1, "cdk-drop-list"],
    hostVars: 7,
    hostBindings: function CdkDropList_HostBindings(rf, ctx) {
      if (rf & 2) {
        \u0275\u0275attribute("id", ctx.id);
        \u0275\u0275classProp("cdk-drop-list-disabled", ctx.disabled)("cdk-drop-list-dragging", ctx._dropListRef.isDragging())("cdk-drop-list-receiving", ctx._dropListRef.isReceiving());
      }
    },
    inputs: {
      connectedTo: [0, "cdkDropListConnectedTo", "connectedTo"],
      data: [0, "cdkDropListData", "data"],
      orientation: [0, "cdkDropListOrientation", "orientation"],
      id: "id",
      lockAxis: [0, "cdkDropListLockAxis", "lockAxis"],
      disabled: [2, "cdkDropListDisabled", "disabled", booleanAttribute],
      sortingDisabled: [2, "cdkDropListSortingDisabled", "sortingDisabled", booleanAttribute],
      enterPredicate: [0, "cdkDropListEnterPredicate", "enterPredicate"],
      sortPredicate: [0, "cdkDropListSortPredicate", "sortPredicate"],
      autoScrollDisabled: [2, "cdkDropListAutoScrollDisabled", "autoScrollDisabled", booleanAttribute],
      autoScrollStep: [0, "cdkDropListAutoScrollStep", "autoScrollStep"],
      elementContainerSelector: [0, "cdkDropListElementContainer", "elementContainerSelector"],
      hasAnchor: [2, "cdkDropListHasAnchor", "hasAnchor", booleanAttribute]
    },
    outputs: {
      dropped: "cdkDropListDropped",
      entered: "cdkDropListEntered",
      exited: "cdkDropListExited",
      sorted: "cdkDropListSorted"
    },
    exportAs: ["cdkDropList"],
    features: [\u0275\u0275ProvidersFeature([{
      provide: CDK_DROP_LIST_GROUP,
      useValue: void 0
    }, {
      provide: CDK_DROP_LIST,
      useExisting: _CdkDropList
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDropList, [{
    type: Directive,
    args: [{
      selector: "[cdkDropList], cdk-drop-list",
      exportAs: "cdkDropList",
      providers: [{
        provide: CDK_DROP_LIST_GROUP,
        useValue: void 0
      }, {
        provide: CDK_DROP_LIST,
        useExisting: CdkDropList
      }],
      host: {
        "class": "cdk-drop-list",
        "[attr.id]": "id",
        "[class.cdk-drop-list-disabled]": "disabled",
        "[class.cdk-drop-list-dragging]": "_dropListRef.isDragging()",
        "[class.cdk-drop-list-receiving]": "_dropListRef.isReceiving()"
      }
    }]
  }], () => [], {
    connectedTo: [{
      type: Input,
      args: ["cdkDropListConnectedTo"]
    }],
    data: [{
      type: Input,
      args: ["cdkDropListData"]
    }],
    orientation: [{
      type: Input,
      args: ["cdkDropListOrientation"]
    }],
    id: [{
      type: Input
    }],
    lockAxis: [{
      type: Input,
      args: ["cdkDropListLockAxis"]
    }],
    disabled: [{
      type: Input,
      args: [{
        alias: "cdkDropListDisabled",
        transform: booleanAttribute
      }]
    }],
    sortingDisabled: [{
      type: Input,
      args: [{
        alias: "cdkDropListSortingDisabled",
        transform: booleanAttribute
      }]
    }],
    enterPredicate: [{
      type: Input,
      args: ["cdkDropListEnterPredicate"]
    }],
    sortPredicate: [{
      type: Input,
      args: ["cdkDropListSortPredicate"]
    }],
    autoScrollDisabled: [{
      type: Input,
      args: [{
        alias: "cdkDropListAutoScrollDisabled",
        transform: booleanAttribute
      }]
    }],
    autoScrollStep: [{
      type: Input,
      args: ["cdkDropListAutoScrollStep"]
    }],
    elementContainerSelector: [{
      type: Input,
      args: ["cdkDropListElementContainer"]
    }],
    hasAnchor: [{
      type: Input,
      args: [{
        alias: "cdkDropListHasAnchor",
        transform: booleanAttribute
      }]
    }],
    dropped: [{
      type: Output,
      args: ["cdkDropListDropped"]
    }],
    entered: [{
      type: Output,
      args: ["cdkDropListEntered"]
    }],
    exited: [{
      type: Output,
      args: ["cdkDropListExited"]
    }],
    sorted: [{
      type: Output,
      args: ["cdkDropListSorted"]
    }]
  });
})();
var CDK_DRAG_PREVIEW = new InjectionToken("CdkDragPreview");
var CdkDragPreview = class _CdkDragPreview {
  templateRef = inject(TemplateRef);
  _drag = inject(CDK_DRAG_PARENT, {
    optional: true
  });
  data;
  matchSize = false;
  constructor() {
    this._drag?._setPreviewTemplate(this);
  }
  ngOnDestroy() {
    this._drag?._resetPreviewTemplate(this);
  }
  static \u0275fac = function CdkDragPreview_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDragPreview)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkDragPreview,
    selectors: [["ng-template", "cdkDragPreview", ""]],
    inputs: {
      data: "data",
      matchSize: [2, "matchSize", "matchSize", booleanAttribute]
    },
    features: [\u0275\u0275ProvidersFeature([{
      provide: CDK_DRAG_PREVIEW,
      useExisting: _CdkDragPreview
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDragPreview, [{
    type: Directive,
    args: [{
      selector: "ng-template[cdkDragPreview]",
      providers: [{
        provide: CDK_DRAG_PREVIEW,
        useExisting: CdkDragPreview
      }]
    }]
  }], () => [], {
    data: [{
      type: Input
    }],
    matchSize: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var CDK_DRAG_PLACEHOLDER = new InjectionToken("CdkDragPlaceholder");
var CdkDragPlaceholder = class _CdkDragPlaceholder {
  templateRef = inject(TemplateRef);
  _drag = inject(CDK_DRAG_PARENT, {
    optional: true
  });
  data;
  constructor() {
    this._drag?._setPlaceholderTemplate(this);
  }
  ngOnDestroy() {
    this._drag?._resetPlaceholderTemplate(this);
  }
  static \u0275fac = function CdkDragPlaceholder_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CdkDragPlaceholder)();
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _CdkDragPlaceholder,
    selectors: [["ng-template", "cdkDragPlaceholder", ""]],
    inputs: {
      data: "data"
    },
    features: [\u0275\u0275ProvidersFeature([{
      provide: CDK_DRAG_PLACEHOLDER,
      useExisting: _CdkDragPlaceholder
    }])]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CdkDragPlaceholder, [{
    type: Directive,
    args: [{
      selector: "ng-template[cdkDragPlaceholder]",
      providers: [{
        provide: CDK_DRAG_PLACEHOLDER,
        useExisting: CdkDragPlaceholder
      }]
    }]
  }], () => [], {
    data: [{
      type: Input
    }]
  });
})();
var DRAG_DROP_DIRECTIVES = [CdkDropList, CdkDropListGroup, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder];
var DragDropModule = class _DragDropModule {
  static \u0275fac = function DragDropModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DragDropModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _DragDropModule,
    imports: [CdkDropList, CdkDropListGroup, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder],
    exports: [CdkScrollableModule, CdkDropList, CdkDropListGroup, CdkDrag, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: [DragDrop],
    imports: [CdkScrollableModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DragDropModule, [{
    type: NgModule,
    args: [{
      imports: DRAG_DROP_DIRECTIVES,
      exports: [CdkScrollableModule, ...DRAG_DROP_DIRECTIVES],
      providers: [DragDrop]
    }]
  }], null, null);
})();

// src/app/services/unified-macro-executor.service.ts
var UnifiedMacroExecutorService = class _UnifiedMacroExecutorService {
  worldSocket = inject(WorldSocketService);
  trueStats = inject(TrueStatsService);
  /**
   * Execute an ActionMacro with full condition checking
   */
  executeActionMacro(macro, sheet) {
    return this.executeScript(actionMacroToScript(macro), sheet, {
      name: macro.name,
      icon: macro.icon,
      color: macro.color
    }).unified;
  }
  /**
   * Execute a FailScript action against a character sheet. Reads resolve through
   * TrueStatsService; the result maps to a UnifiedMacroResult (rolls, resourceChanges,
   * display messages) so the existing lobby/sheet display + application paths work, and
   * `script` carries the temp modifiers / granted skills / status ops for the caller.
   */
  executeScript(src, sheet, opts = {}) {
    const ctx = createPlayerContext(sheet, this.trueStats, {
      inCombat: opts.inCombat ?? false,
      stacks: opts.stacks ?? 1,
      turn: opts.turn ?? 0,
      duration: opts.duration ?? 0,
      effectStrength: opts.effectStrength ?? 0
    });
    const script = runScript(src, ctx, { trigger: opts.trigger });
    const unified = {
      success: script.ok,
      rolls: script.rolls.map((r) => ({
        id: this.generateUUID(),
        name: r.name,
        formula: r.formula,
        rolls: r.rolls,
        total: r.total,
        color: opts.color || "#f59e0b"
      })),
      resourceChanges: script.resourceChanges.map((rc) => ({
        resource: rc.resource,
        amount: rc.amount,
        displayName: this.getResourceDisplayName(rc.resource)
      })),
      conditionFailures: script.errors,
      actionName: opts.name || "Skript",
      actionIcon: opts.icon || "\u26A1",
      actionColor: opts.color || "#f59e0b",
      timestamp: /* @__PURE__ */ new Date(),
      displays: script.displays
    };
    return { unified, script };
  }
  /**
   * Execute a MacroAction (simpler library macro)
   */
  executeMacroAction(macro, sheet) {
    return this.executeScript(macroActionToScript(macro), sheet, {
      name: macro.name,
      icon: macro.icon,
      color: macro.color
    }).unified;
  }
  /**
   * Check a single condition and return error message if failed
   */
  checkCondition(condition, sheet) {
    let currentValue = 0;
    let comparisonValue = condition.value;
    if (condition.type === "resource" && condition.resource) {
      currentValue = this.getResourceValue(condition.resource, sheet);
    } else if (condition.type === "stat" && condition.stat) {
      currentValue = this.getStatValue(condition.stat, sheet);
    } else if (condition.type === "skill" && condition.skillName) {
      const hasSkill = sheet.skills?.some((s) => s.name === condition.skillName);
      if (!hasSkill) {
        return `Ben\xF6tigt F\xE4higkeit: ${condition.skillName}`;
      }
      return null;
    }
    if (condition.valueType === "currentResource" && condition.compareToResource) {
      comparisonValue = this.getResourceValue(condition.compareToResource, sheet);
    } else if (condition.valueType === "maxResource" && condition.compareToResource) {
      comparisonValue = this.getResourceMax(condition.compareToResource, sheet);
    } else if (condition.valueType === "stat" && condition.compareToStat) {
      comparisonValue = this.getStatValue(condition.compareToStat, sheet);
    }
    let passes = false;
    switch (condition.operator) {
      case ">":
        passes = currentValue > comparisonValue;
        break;
      case "<":
        passes = currentValue < comparisonValue;
        break;
      case ">=":
        passes = currentValue >= comparisonValue;
        break;
      case "<=":
        passes = currentValue <= comparisonValue;
        break;
      case "==":
        passes = currentValue === comparisonValue;
        break;
      case "!=":
        passes = currentValue !== comparisonValue;
        break;
    }
    if (!passes) {
      const targetName = condition.resource || condition.stat || "";
      return `Bedingung nicht erf\xFCllt: ${targetName} ${condition.operator} ${comparisonValue}`;
    }
    return null;
  }
  /**
   * Execute a single consequence and update result
   */
  executeConsequence(consequence, result) {
    const rollData = consequence.diceFormula ? this.rollDice(consequence.diceFormula) : null;
    switch (consequence.type) {
      case "dice_roll":
        if (rollData) {
          result.rolls.push({
            id: this.generateUUID(),
            name: consequence.rollName || "Wurf",
            formula: rollData.formula,
            rolls: rollData.diceRolls,
            total: rollData.total,
            color: consequence.rollColor || "#f59e0b"
          });
        }
        break;
      case "spend_resource":
      case "gain_resource":
        if (consequence.resource && rollData) {
          const amount = consequence.type === "spend_resource" ? -rollData.total : rollData.total;
          result.resourceChanges.push({
            resource: consequence.resource,
            amount,
            displayName: this.getResourceDisplayName(consequence.resource)
          });
          if (rollData.diceRolls.length > 0) {
            result.rolls.push({
              id: this.generateUUID(),
              name: consequence.rollName || (consequence.type === "spend_resource" ? "Kosten" : "Gewinn"),
              formula: rollData.formula,
              rolls: rollData.diceRolls,
              total: rollData.total,
              color: consequence.rollColor || (consequence.type === "spend_resource" ? "#ef4444" : "#22c55e")
            });
          }
        }
        break;
    }
  }
  /**
   * Broadcast execution result to world socket for lobby display
   */
  broadcastToWorld(result, sheet) {
    if (!sheet.worldName)
      return;
    for (const roll of result.rolls) {
      this.worldSocket.sendDiceRoll({
        id: roll.id,
        worldName: sheet.worldName,
        characterId: sheet.id || "",
        characterName: sheet.name,
        diceType: this.extractDiceType(roll.formula),
        diceCount: roll.rolls.length,
        rolls: roll.rolls,
        result: roll.total,
        bonuses: [],
        timestamp: result.timestamp,
        isSecret: false,
        actionName: result.actionName,
        actionIcon: result.actionIcon,
        actionColor: result.actionColor,
        resourceChanges: result.resourceChanges.map((rc) => ({
          resource: rc.resource,
          amount: rc.amount
        }))
      });
    }
    if (result.rolls.length === 0 && result.resourceChanges.length > 0) {
      this.worldSocket.sendDiceRoll({
        id: this.generateUUID(),
        worldName: sheet.worldName,
        characterId: sheet.id || "",
        characterName: sheet.name,
        diceType: 0,
        diceCount: 0,
        rolls: [],
        result: 0,
        bonuses: [],
        timestamp: result.timestamp,
        isSecret: false,
        actionName: result.actionName,
        actionIcon: result.actionIcon,
        actionColor: result.actionColor,
        resourceChanges: result.resourceChanges.map((rc) => ({
          resource: rc.resource,
          amount: rc.amount
        }))
      });
    }
  }
  /**
   * Roll dice from a formula string (e.g., "2d6+3", "1d20", "10")
   */
  rollDice(formula) {
    formula = formula.trim();
    const diceRolls = [];
    let total = 0;
    const diceMatch = formula.match(/(\d+)d(\d+)/i);
    if (diceMatch) {
      const count = parseInt(diceMatch[1]);
      const sides = parseInt(diceMatch[2]);
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        diceRolls.push(roll);
        total += roll;
      }
      const modifierMatch = formula.match(/([+\-]\d+)$/);
      if (modifierMatch) {
        total += parseInt(modifierMatch[1]);
      }
    } else {
      const value = parseInt(formula);
      if (!isNaN(value)) {
        total = value;
      }
    }
    return { total, diceRolls, formula };
  }
  /**
   * Extract dice type from formula for display (returns largest die)
   */
  extractDiceType(formula) {
    const match = formula.match(/d(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }
  /**
   * Get current value of a resource
   */
  getResourceValue(resource, sheet) {
    const formulaTypeMap = {
      "health": FormulaType.LIFE,
      "energy": FormulaType.ENERGY,
      "mana": FormulaType.MANA
    };
    const formulaType = formulaTypeMap[resource];
    if (formulaType !== void 0) {
      const status = sheet.statuses?.find((s) => s.formulaType === formulaType);
      return status?.statusCurrent || 0;
    }
    return 0;
  }
  /**
   * Get max value of a resource
   */
  getResourceMax(resource, sheet) {
    const formulaTypeMap = {
      "health": FormulaType.LIFE,
      "energy": FormulaType.ENERGY,
      "mana": FormulaType.MANA
    };
    const formulaType = formulaTypeMap[resource];
    if (formulaType !== void 0) {
      const status = sheet.statuses?.find((s) => s.formulaType === formulaType);
      if (status) {
        return this.trueStats.calculateResourceMax(sheet, formulaType);
      }
    }
    return 0;
  }
  /**
   * Get value of a stat. Routed through TrueStatsService so macro conditions compare
   * against the *effective* stat (base + skills + equipment + status effects), not the
   * possibly-stale cached `.current` value.
   */
  getStatValue(stat, sheet) {
    const statBlock = sheet[stat];
    if (!statBlock)
      return 0;
    return this.trueStats.calculateStat(sheet, statBlock, stat);
  }
  /**
   * Get German display name for a resource
   */
  getResourceDisplayName(resource) {
    const names = {
      "health": "Leben",
      "energy": "Energie",
      "mana": "Mana",
      "fokus": "Fokus"
    };
    return names[resource] || resource;
  }
  /**
   * Generate UUID for unique IDs
   */
  generateUUID() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  static \u0275fac = function UnifiedMacroExecutorService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UnifiedMacroExecutorService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _UnifiedMacroExecutorService, factory: _UnifiedMacroExecutorService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(UnifiedMacroExecutorService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/utils/status-stacking.utils.ts
function applyStacking(list, incoming, maxStacks = 1) {
  const cap = Math.max(1, maxStacks || 1);
  if (cap <= 1) {
    const idx2 = list.findIndex((e) => e.statusEffectId === incoming.statusEffectId);
    if (idx2 < 0) {
      return { list: [...list, __spreadProps(__spreadValues({}, incoming), { stacks: 1 })], changed: true, merged: false };
    }
    const existing2 = list[idx2];
    if (existing2.duration == null || incoming.duration == null) {
      return { list, changed: false, merged: true };
    }
    const out2 = [...list];
    out2[idx2] = __spreadProps(__spreadValues({}, existing2), { duration: existing2.duration + incoming.duration });
    return { list: out2, changed: true, merged: true };
  }
  const idx = list.findIndex((e) => e.statusEffectId === incoming.statusEffectId && (e.duration ?? null) === (incoming.duration ?? null));
  if (idx < 0) {
    return {
      list: [...list, __spreadProps(__spreadValues({}, incoming), { stacks: Math.min(Math.max(1, incoming.stacks || 1), cap) })],
      changed: true,
      merged: false
    };
  }
  const existing = list[idx];
  const current = existing.stacks || 1;
  const total = Math.min(current + Math.max(1, incoming.stacks || 1), cap);
  if (total === current)
    return { list, changed: false, merged: true };
  const out = [...list];
  out[idx] = __spreadProps(__spreadValues({}, existing), { stacks: total });
  return { list: out, changed: true, merged: true };
}

// src/app/utils/scroll-lock.util.ts
var locks = 0;
function lockBodyScroll() {
  if (locks++ === 0) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }
}
function unlockBodyScroll() {
  if (locks === 0)
    return;
  if (--locks === 0) {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
}

export {
  moveItemInArray,
  transferArrayItem,
  CdkDragHandle,
  CdkDrag,
  CdkDropListGroup,
  CdkDropList,
  CdkDragPreview,
  CdkDragPlaceholder,
  DragDropModule,
  applyStability,
  applyStabilityToDelta,
  DiceRollerComponent,
  UnifiedMacroExecutorService,
  applyStacking,
  lockBodyScroll,
  unlockBodyScroll,
  SpellcastWindowComponent
};
//# sourceMappingURL=chunk-WYPP7T4V.js.map
