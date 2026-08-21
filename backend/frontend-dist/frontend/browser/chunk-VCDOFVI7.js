import {
  ScriptEditorComponent,
  actionMacroToScript,
  createEmptyActionMacro,
  createEmptyCondition,
  createEmptyConsequence
} from "./chunk-BNPZFNFF.js";
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
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-VMGRJE2Y.js";
import {
  TALENT_DEFINITIONS
} from "./chunk-P2J6DNXL.js";
import {
  CommonModule
} from "./chunk-FGI44Z6P.js";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-XJL25EXC.js";

// src/app/shared/embedded-macro-editor/embedded-macro-editor.component.ts
var _c0 = () => ["dice_roll", "spend_resource", "gain_resource", "apply_bonus"];
var _forTrack0 = ($index, $item) => $item.id;
function EmbeddedMacroEditorComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 24);
    \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Conditional_7_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleCopyFrom());
    });
    \u0275\u0275text(1, " \u2398 Als Vorlage kopieren ");
    \u0275\u0275elementEnd();
  }
}
function EmbeddedMacroEditorComponent_Conditional_8_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 28);
    \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Conditional_8_For_5_Template_button_click_0_listener() {
      const m_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.applyTemplate(m_r5));
    });
    \u0275\u0275elementStart(1, "span", 29);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 30);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 31);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const m_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("color", m_r5.color || "#f59e0b");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(m_r5.icon || "\u2726");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(m_r5.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", m_r5.conditions.length, " Bed. \xB7 ", m_r5.consequences.length, " Akt.");
  }
}
function EmbeddedMacroEditorComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 5)(1, "h4");
    \u0275\u0275text(2, "Vorlage w\xE4hlen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 25);
    \u0275\u0275repeaterCreate(4, EmbeddedMacroEditorComponent_Conditional_8_For_5_Template, 7, 6, "button", 26, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 27);
    \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Conditional_8_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleCopyFrom());
    });
    \u0275\u0275text(7, "Abbrechen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r1.availableMacros);
  }
}
function EmbeddedMacroEditorComponent_For_33_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 32);
    \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_For_33_Template_button_click_0_listener() {
      const icon_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.selectIcon(icon_r7));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const icon_r7 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("color", ctx_r1.editMacro.color || "#f59e0b");
    \u0275\u0275classProp("selected", ctx_r1.editMacro.icon === icon_r7);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", icon_r7, " ");
  }
}
function EmbeddedMacroEditorComponent_Conditional_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 20);
    \u0275\u0275text(1, "Keine \u2013 Makro ist immer verf\xFCgbar");
    \u0275\u0275elementEnd();
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r11 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("value", r_r11);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.resourceLabels[r_r11]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_8_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r10);
      const cond_r9 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.resource, $event) || (cond_r9.resource = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(1, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_8_For_2_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275twoWayProperty("ngModel", cond_r9.resource);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.resourceTypes);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_9_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const s_r13 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("value", s_r13);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.statLabels[s_r13]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_9_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r12);
      const cond_r9 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.stat, $event) || (cond_r9.stat = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(1, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_9_For_2_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275twoWayProperty("ngModel", cond_r9.stat);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.statTypes);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 42);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_10_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r14);
      const cond_r9 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.skillName, $event) || (cond_r9.skillName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275twoWayProperty("ngModel", cond_r9.skillName);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const op_r16 = ctx.$implicit;
    \u0275\u0275property("value", op_r16);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(op_r16);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_For_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const vt_r17 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("value", vt_r17);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.valueTypeLabels[vt_r17]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_6_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r18);
      const cond_r9 = \u0275\u0275nextContext(2).$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.value, $event) || (cond_r9.value = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275twoWayProperty("ngModel", cond_r9.value);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_7_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r20 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275property("value", r_r20);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.resourceLabels[r_r20]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_7_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r19);
      const cond_r9 = \u0275\u0275nextContext(2).$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.compareToResource, $event) || (cond_r9.compareToResource = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(1, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_7_For_2_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275twoWayProperty("ngModel", cond_r9.compareToResource);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.resourceTypes);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const s_r22 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(5);
    \u0275\u0275property("value", s_r22);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.statLabels[s_r22]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_8_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r21);
      const cond_r9 = \u0275\u0275nextContext(2).$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.compareToStat, $event) || (cond_r9.compareToStat = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(1, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_8_For_2_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275twoWayProperty("ngModel", cond_r9.compareToStat);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.statTypes);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 43);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r15);
      const cond_r9 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.operator, $event) || (cond_r9.operator = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(1, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_For_2_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r15);
      const cond_r9 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.valueType, $event) || (cond_r9.valueType = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(4, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_For_5_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(6, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_6_Template, 1, 1, "input", 44)(7, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_7_Template, 3, 1, "select", 38)(8, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Conditional_8_Template, 3, 1, "select", 38);
  }
  if (rf & 2) {
    const cond_r9 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275twoWayProperty("ngModel", cond_r9.operator);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.operators);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", cond_r9.valueType);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.valueTypes);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(cond_r9.valueType === "fixed" ? 6 : cond_r9.valueType === "currentResource" || cond_r9.valueType === "maxResource" ? 7 : cond_r9.valueType === "stat" ? 8 : -1);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 33)(1, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Template_select_ngModelChange_1_listener($event) {
      const cond_r9 = \u0275\u0275restoreView(_r8).$implicit;
      \u0275\u0275twoWayBindingSet(cond_r9.type, $event) || (cond_r9.type = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(2, "option", 35);
    \u0275\u0275text(3, "Ressource");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "option", 36);
    \u0275\u0275text(5, "Attribut");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "option", 37);
    \u0275\u0275text(7, "Skill");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_8_Template, 3, 1, "select", 38)(9, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_9_Template, 3, 1, "select", 38)(10, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_10_Template, 1, 1, "input", 39);
    \u0275\u0275conditionalCreate(11, EmbeddedMacroEditorComponent_Conditional_40_For_1_Conditional_11_Template, 9, 3);
    \u0275\u0275elementStart(12, "button", 40);
    \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Conditional_40_For_1_Template_button_click_12_listener() {
      const \u0275$index_97_r23 = \u0275\u0275restoreView(_r8).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeCondition(\u0275$index_97_r23));
    });
    \u0275\u0275text(13, "\u2715");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const cond_r9 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", cond_r9.type);
    \u0275\u0275advance(7);
    \u0275\u0275conditional(cond_r9.type === "resource" ? 8 : cond_r9.type === "stat" ? 9 : 10);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(cond_r9.type !== "skill" ? 11 : -1);
  }
}
function EmbeddedMacroEditorComponent_Conditional_40_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, EmbeddedMacroEditorComponent_Conditional_40_For_1_Template, 14, 3, "div", 33, _forTrack0);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r1.editMacro.conditions);
  }
}
function EmbeddedMacroEditorComponent_Conditional_46_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 20);
    \u0275\u0275text(1, "Keine Aktionen definiert");
    \u0275\u0275elementEnd();
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const k_r26 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275property("value", k_r26);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.consequenceTypeLabels[k_r26]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_10_For_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 41);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r29 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275property("value", r_r29);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.resourceLabels[r_r29]);
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 14)(1, "label");
    \u0275\u0275text(2, "Ressource");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_10_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r28);
      const cons_r25 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(cons_r25.resource, $event) || (cons_r25.resource = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(4, EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_10_For_5_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const cons_r25 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", cons_r25.resource);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.resourceTypes);
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 51);
    \u0275\u0275text(1, "\u2713");
    \u0275\u0275elementEnd();
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1, "\u2717");
    \u0275\u0275elementEnd();
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 53);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cons_r25 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.getFormulaError(cons_r25.diceFormula));
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 46)(1, "div", 47)(2, "div", 10)(3, "label");
    \u0275\u0275text(4, "Aktionstyp");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "select", 34);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_47_For_1_Template_select_ngModelChange_5_listener($event) {
      const cons_r25 = \u0275\u0275restoreView(_r24).$implicit;
      \u0275\u0275twoWayBindingSet(cons_r25.type, $event) || (cons_r25.type = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(6, EmbeddedMacroEditorComponent_Conditional_47_For_1_For_7_Template, 2, 2, "option", 41, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "button", 40);
    \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Conditional_47_For_1_Template_button_click_8_listener() {
      const \u0275$index_174_r27 = \u0275\u0275restoreView(_r24).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeConsequence(\u0275$index_174_r27));
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(10, EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_10_Template, 6, 1, "div", 14);
    \u0275\u0275elementStart(11, "div", 9)(12, "div", 10)(13, "label");
    \u0275\u0275text(14, "Anzeigename ");
    \u0275\u0275elementStart(15, "span", 15);
    \u0275\u0275text(16, "Optional");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "input", 48);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_47_For_1_Template_input_ngModelChange_17_listener($event) {
      const cons_r25 = \u0275\u0275restoreView(_r24).$implicit;
      \u0275\u0275twoWayBindingSet(cons_r25.rollName, $event) || (cons_r25.rollName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "div", 12)(19, "label");
    \u0275\u0275text(20, "Farbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "input", 13);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_47_For_1_Template_input_ngModelChange_21_listener($event) {
      const cons_r25 = \u0275\u0275restoreView(_r24).$implicit;
      \u0275\u0275twoWayBindingSet(cons_r25.rollColor, $event) || (cons_r25.rollColor = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(22, "div", 14)(23, "label");
    \u0275\u0275text(24, " W\xFCrfelformel oder fester Wert ");
    \u0275\u0275elementStart(25, "span", 15);
    \u0275\u0275text(26, "z.B. 1d20+3, 2d6*2, 10");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "div", 49)(28, "input", 50);
    \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Conditional_47_For_1_Template_input_ngModelChange_28_listener($event) {
      const cons_r25 = \u0275\u0275restoreView(_r24).$implicit;
      \u0275\u0275twoWayBindingSet(cons_r25.diceFormula, $event) || (cons_r25.diceFormula = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(29, EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_29_Template, 2, 0, "span", 51);
    \u0275\u0275conditionalCreate(30, EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_30_Template, 2, 0, "span", 52);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(31, EmbeddedMacroEditorComponent_Conditional_47_For_1_Conditional_31_Template, 2, 1, "div", 53);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const cons_r25 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", cons_r25.type);
    \u0275\u0275advance();
    \u0275\u0275repeater(\u0275\u0275pureFunction0(12, _c0));
    \u0275\u0275advance(4);
    \u0275\u0275conditional(cons_r25.type === "spend_resource" || cons_r25.type === "gain_resource" ? 10 : -1);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", cons_r25.rollName);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", cons_r25.rollColor);
    \u0275\u0275advance(7);
    \u0275\u0275classProp("valid", ctx_r1.isFormulaValid(cons_r25.diceFormula))("invalid", cons_r25.diceFormula && !ctx_r1.isFormulaValid(cons_r25.diceFormula));
    \u0275\u0275twoWayProperty("ngModel", cons_r25.diceFormula);
    \u0275\u0275advance();
    \u0275\u0275conditional(cons_r25.diceFormula && ctx_r1.isFormulaValid(cons_r25.diceFormula) ? 29 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(cons_r25.diceFormula && !ctx_r1.isFormulaValid(cons_r25.diceFormula) ? 30 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(cons_r25.diceFormula && !ctx_r1.isFormulaValid(cons_r25.diceFormula) ? 31 : -1);
  }
}
function EmbeddedMacroEditorComponent_Conditional_47_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, EmbeddedMacroEditorComponent_Conditional_47_For_1_Template, 32, 13, "div", 46, _forTrack0);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r1.editMacro.consequences);
  }
}
var MACRO_ICON_SYMBOLS = [
  // Combat
  "\u2694",
  "\u2692",
  "\u26CF",
  "\u265E",
  // Death & Dark
  "\u2620",
  "\u26B0",
  "\u26B1",
  "\u26E7",
  // Magic & Arcane
  "\u26A1",
  "\u269B",
  "\u26E4",
  "\u2624",
  // Divine & Holy
  "\u2720",
  "\u269C",
  "\u2625",
  "\u271A",
  // Elements & Nature
  "\u2744",
  "\u2698",
  "\u263D",
  "\u2388",
  // Binding & Status
  "\u26D3",
  "\u2691",
  "\u2699",
  "\u2696",
  // Travel & Misc
  "\u2693",
  "\u262F",
  "\u2695",
  "\u2697",
  // Stars
  "\u2605",
  "\u2726",
  "\u2736",
  "\u2739",
  // Card Suits
  "\u2666",
  "\u2660",
  "\u2663",
  "\u2665",
  // Science & Danger
  "\u2622",
  "\u2623",
  "\u269D",
  "\u221E",
  // Simple
  "\u25CE",
  "\u2295",
  "\u267E",
  "+"
];
function quickValidateFormula(formula) {
  if (!formula || !formula.trim())
    return { valid: false, error: "Formel fehlt" };
  const clean = formula.trim().replace(/\s/g, "");
  if (!/^[0-9d+\-*/().]+$/i.test(clean))
    return { valid: false, error: "Ung\xFCltige Zeichen" };
  if (!/[0-9]/.test(clean))
    return { valid: false, error: "Keine Zahl gefunden" };
  return { valid: true };
}
var EmbeddedMacroEditorComponent = class _EmbeddedMacroEditorComponent {
  /** If null → create new macro. Otherwise edit a copy. */
  macro = null;
  /** Available macros to "copy from" as template */
  availableMacros = [];
  save = new EventEmitter();
  cancel = new EventEmitter();
  editMacro;
  isNew = true;
  iconSymbols = MACRO_ICON_SYMBOLS;
  resourceTypes = ["health", "energy", "mana", "fokus"];
  statTypes = ["strength", "dexterity", "speed", "intelligence", "constitution", "chill"];
  operators = [">", "<", ">=", "<=", "==", "!="];
  valueTypes = ["fixed", "currentResource", "maxResource", "stat"];
  resourceLabels = {
    health: "Leben",
    energy: "Ausdauer",
    mana: "Mana",
    fokus: "Fokus"
  };
  statLabels = {
    strength: "St\xE4rke",
    dexterity: "Geschicklichkeit",
    speed: "Geschwindigkeit",
    intelligence: "Intelligenz",
    constitution: "Konstitution",
    chill: "Wille"
  };
  valueTypeLabels = {
    fixed: "Fester Wert",
    currentResource: "Aktuelle Ressource",
    maxResource: "Max Ressource",
    stat: "Attribut"
  };
  consequenceTypeLabels = {
    dice_roll: "W\xFCrfeln",
    spend_resource: "Ressource ausgeben",
    gain_resource: "Ressource erhalten",
    apply_bonus: "Bonus anwenden"
  };
  showCopyFrom = false;
  copyFromError = "";
  ngOnInit() {
    if (this.macro) {
      this.editMacro = JSON.parse(JSON.stringify(this.macro));
      this.isNew = false;
    } else {
      this.editMacro = createEmptyActionMacro();
      this.isNew = true;
    }
    if (!this.editMacro.conditions)
      this.editMacro.conditions = [];
    if (!this.editMacro.consequences)
      this.editMacro.consequences = [];
  }
  // ---- Conditions ----
  addCondition() {
    this.editMacro.conditions = [...this.editMacro.conditions, createEmptyCondition()];
  }
  removeCondition(i) {
    this.editMacro.conditions = this.editMacro.conditions.filter((_, idx) => idx !== i);
  }
  // ---- Consequences ----
  addConsequence() {
    this.editMacro.consequences = [...this.editMacro.consequences, createEmptyConsequence()];
  }
  removeConsequence(i) {
    this.editMacro.consequences = this.editMacro.consequences.filter((_, idx) => idx !== i);
  }
  // ---- Formula validation ----
  isFormulaValid(formula) {
    if (!formula)
      return false;
    return quickValidateFormula(formula).valid;
  }
  getFormulaError(formula) {
    if (!formula)
      return "";
    return quickValidateFormula(formula).error ?? "";
  }
  // ---- Copy from template ----
  toggleCopyFrom() {
    this.showCopyFrom = !this.showCopyFrom;
    this.copyFromError = "";
  }
  applyTemplate(source) {
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = `macro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    copy.createdAt = /* @__PURE__ */ new Date();
    copy.modifiedAt = /* @__PURE__ */ new Date();
    if (this.isNew) {
      this.editMacro = copy;
    } else {
      this.editMacro.conditions = [...copy.conditions];
      this.editMacro.consequences = [...copy.consequences];
    }
    this.showCopyFrom = false;
  }
  // ---- Save / Cancel ----
  onSave() {
    this.editMacro.modifiedAt = /* @__PURE__ */ new Date();
    this.editMacro.isValid = true;
    this.save.emit(JSON.parse(JSON.stringify(this.editMacro)));
  }
  onCancel() {
    this.cancel.emit();
  }
  selectIcon(icon) {
    this.editMacro.icon = icon;
  }
  static \u0275fac = function EmbeddedMacroEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EmbeddedMacroEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _EmbeddedMacroEditorComponent, selectors: [["app-embedded-macro-editor"]], inputs: { macro: "macro", availableMacros: "availableMacros" }, outputs: { save: "save", cancel: "cancel" }, decls: 53, vars: 13, consts: [[1, "eme-wrapper"], [1, "eme-header"], [1, "eme-header-left"], [1, "eme-icon"], ["title", "Aus vorh. Makro als Vorlage", 1, "eme-copy-btn"], [1, "eme-copy-panel"], [1, "eme-body"], [1, "eme-section"], [1, "eme-section-title"], [1, "eme-row"], [1, "eme-field", "grow"], ["type", "text", "placeholder", "z.B. Feuerball, Heilzauber", 3, "ngModelChange", "ngModel"], [1, "eme-field", "compact"], ["type", "color", 3, "ngModelChange", "ngModel"], [1, "eme-field"], [1, "hint"], ["type", "text", "placeholder", "Was macht dieses Makro?", 3, "ngModelChange", "ngModel"], [1, "eme-icon-grid"], [1, "eme-icon-btn", 3, "selected", "color"], [1, "eme-add-small", 3, "click"], [1, "eme-empty"], [1, "eme-footer"], [1, "eme-cancel-btn", 3, "click"], [1, "eme-save-btn", 3, "click"], ["title", "Aus vorh. Makro als Vorlage", 1, "eme-copy-btn", 3, "click"], [1, "eme-copy-list"], [1, "eme-copy-item"], [1, "eme-cancel-btn", "small", 3, "click"], [1, "eme-copy-item", 3, "click"], [1, "eme-copy-icon"], [1, "eme-copy-name"], [1, "eme-copy-meta"], [1, "eme-icon-btn", 3, "click"], [1, "eme-cond-row"], [1, "eme-select", 3, "ngModelChange", "ngModel"], ["value", "resource"], ["value", "stat"], ["value", "skill"], [1, "eme-select", 3, "ngModel"], ["type", "text", "placeholder", "Skill-Name", 1, "eme-input", 3, "ngModel"], ["title", "Entfernen", 1, "eme-remove-btn", 3, "click"], [3, "value"], ["type", "text", "placeholder", "Skill-Name", 1, "eme-input", 3, "ngModelChange", "ngModel"], [1, "eme-select", "narrow", 3, "ngModelChange", "ngModel"], ["type", "number", "placeholder", "Wert", 1, "eme-input", "narrow", 3, "ngModel"], ["type", "number", "placeholder", "Wert", 1, "eme-input", "narrow", 3, "ngModelChange", "ngModel"], [1, "eme-cons-card"], [1, "eme-cons-header"], ["type", "text", "placeholder", "z.B. Angriff, Schaden", 1, "eme-input", 3, "ngModelChange", "ngModel"], [1, "eme-formula-wrap"], ["type", "text", "placeholder", "z.B. 2d6+3", 1, "eme-input", 3, "ngModelChange", "ngModel"], [1, "eme-valid-icon"], [1, "eme-invalid-icon"], [1, "eme-error"]], template: function EmbeddedMacroEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "span", 3);
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "h3");
      \u0275\u0275text(6);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(7, EmbeddedMacroEditorComponent_Conditional_7_Template, 2, 0, "button", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(8, EmbeddedMacroEditorComponent_Conditional_8_Template, 8, 0, "div", 5);
      \u0275\u0275elementStart(9, "div", 6)(10, "section", 7)(11, "div", 8);
      \u0275\u0275text(12, "\u2699 Grundeinstellungen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "div", 9)(14, "div", 10)(15, "label");
      \u0275\u0275text(16, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "input", 11);
      \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Template_input_ngModelChange_17_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.name, $event) || (ctx.editMacro.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(18, "div", 12)(19, "label");
      \u0275\u0275text(20, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Template_input_ngModelChange_21_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.color, $event) || (ctx.editMacro.color = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(22, "div", 14)(23, "label");
      \u0275\u0275text(24, "Beschreibung ");
      \u0275\u0275elementStart(25, "span", 15);
      \u0275\u0275text(26, "Optional");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(27, "input", 16);
      \u0275\u0275twoWayListener("ngModelChange", function EmbeddedMacroEditorComponent_Template_input_ngModelChange_27_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.description, $event) || (ctx.editMacro.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(28, "div", 14)(29, "label");
      \u0275\u0275text(30, "Icon");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(31, "div", 17);
      \u0275\u0275repeaterCreate(32, EmbeddedMacroEditorComponent_For_33_Template, 2, 5, "button", 18, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(34, "section", 7)(35, "div", 8);
      \u0275\u0275text(36, " \u2753 Bedingungen ");
      \u0275\u0275elementStart(37, "button", 19);
      \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Template_button_click_37_listener() {
        return ctx.addCondition();
      });
      \u0275\u0275text(38, "+ Bedingung");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(39, EmbeddedMacroEditorComponent_Conditional_39_Template, 2, 0, "p", 20)(40, EmbeddedMacroEditorComponent_Conditional_40_Template, 2, 0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(41, "section", 7)(42, "div", 8);
      \u0275\u0275text(43, " \u26A1 Aktionen (Dann\u2026) ");
      \u0275\u0275elementStart(44, "button", 19);
      \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Template_button_click_44_listener() {
        return ctx.addConsequence();
      });
      \u0275\u0275text(45, "+ Aktion");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(46, EmbeddedMacroEditorComponent_Conditional_46_Template, 2, 0, "p", 20)(47, EmbeddedMacroEditorComponent_Conditional_47_Template, 2, 0);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(48, "div", 21)(49, "button", 22);
      \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Template_button_click_49_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(50, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(51, "button", 23);
      \u0275\u0275listener("click", function EmbeddedMacroEditorComponent_Template_button_click_51_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(52, "Makro speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275styleProp("color", ctx.editMacro.color || "#f59e0b");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate(ctx.editMacro.icon || "\u2726");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.isNew ? "Neues Makro erstellen" : "Makro bearbeiten");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.availableMacros.length > 0 ? 7 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showCopyFrom ? 8 : -1);
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.color);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.description);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.iconSymbols);
      \u0275\u0275advance(7);
      \u0275\u0275conditional(ctx.editMacro.conditions.length === 0 ? 39 : 40);
      \u0275\u0275advance(7);
      \u0275\u0275conditional(ctx.editMacro.consequences.length === 0 ? 46 : 47);
      \u0275\u0275advance(5);
      \u0275\u0275styleProp("--mc", ctx.editMacro.color || "#f59e0b");
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, SelectControlValueAccessor, NgControlStatus, NgModel], styles: ["\n\n.eme-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  background: #1e1e1e;\n  border: 1px solid #3a3a3a;\n  border-radius: 12px;\n  overflow: hidden;\n  width: 100%;\n  max-width: 680px;\n  max-height: 80vh;\n}\n.eme-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 16px;\n  border-bottom: 1px solid #333;\n  background:\n    linear-gradient(\n      180deg,\n      #252525,\n      #1e1e1e);\n  flex-shrink: 0;\n}\n.eme-header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.eme-header-left[_ngcontent-%COMP%]   .eme-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  line-height: 1;\n}\n.eme-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #e5e7eb;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n.eme-copy-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid #444;\n  color: #aaa;\n  padding: 6px 12px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.8rem;\n  transition: all 0.2s;\n  white-space: nowrap;\n}\n.eme-copy-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.13);\n  color: #ddd;\n}\n.eme-copy-panel[_ngcontent-%COMP%] {\n  background: #252525;\n  border-bottom: 1px solid #333;\n  padding: 12px 16px;\n  flex-shrink: 0;\n}\n.eme-copy-panel[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  color: #ccc;\n  font-size: 0.85rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.eme-copy-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  max-height: 160px;\n  overflow-y: auto;\n  margin-bottom: 8px;\n}\n.eme-copy-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid #444;\n  border-radius: 6px;\n  padding: 6px 10px;\n  cursor: pointer;\n  text-align: left;\n  transition: all 0.15s;\n}\n.eme-copy-item[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.09);\n  border-color: #666;\n}\n.eme-copy-icon[_ngcontent-%COMP%] {\n  font-size: 1.1rem;\n}\n.eme-copy-name[_ngcontent-%COMP%] {\n  color: #e5e7eb;\n  font-size: 0.9rem;\n  flex: 1;\n}\n.eme-copy-meta[_ngcontent-%COMP%] {\n  color: #777;\n  font-size: 0.75rem;\n}\n.eme-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 14px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.eme-section[_ngcontent-%COMP%] {\n  background: #252525;\n  border: 1px solid #333;\n  border-radius: 8px;\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.eme-section-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  color: #f59e0b;\n  font-size: 0.82rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  margin-bottom: 2px;\n}\n.eme-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.eme-field.grow[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.eme-field.compact[_ngcontent-%COMP%] {\n  flex: 0 0 auto;\n}\n.eme-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  color: #9ca3af;\n  font-size: 0.75rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.eme-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   .hint[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 0.7rem;\n  font-weight: 400;\n  text-transform: none;\n  letter-spacing: 0;\n  margin-left: 4px;\n}\n.eme-field[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%], \n.eme-field[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%], \n.eme-input[_ngcontent-%COMP%] {\n  background: #1a1a1a;\n  border: 1px solid #3a3a3a;\n  border-radius: 6px;\n  padding: 7px 10px;\n  color: #e5e7eb;\n  font-size: 0.88rem;\n  outline: none;\n  transition: border-color 0.2s;\n  width: 100%;\n  box-sizing: border-box;\n}\n.eme-input[_ngcontent-%COMP%] {\n  width: auto;\n  min-width: 0;\n}\n.eme-input.narrow[_ngcontent-%COMP%] {\n  width: 80px;\n}\n.eme-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.eme-input[_ngcontent-%COMP%]:focus {\n  border-color: #f59e0b;\n}\n.eme-input.valid[_ngcontent-%COMP%] {\n  border-color: #22c55e;\n}\n.eme-input.invalid[_ngcontent-%COMP%] {\n  border-color: #ef4444;\n}\n.eme-field[_ngcontent-%COMP%]   input[type=color][_ngcontent-%COMP%] {\n  width: 48px;\n  height: 34px;\n  padding: 2px;\n  border: 1px solid #3a3a3a;\n  border-radius: 6px;\n  background: #1a1a1a;\n  cursor: pointer;\n}\n.eme-select[_ngcontent-%COMP%] {\n  background: #1a1a1a;\n  border: 1px solid #3a3a3a;\n  border-radius: 6px;\n  padding: 7px 10px;\n  color: #e5e7eb;\n  font-size: 0.82rem;\n  outline: none;\n  cursor: pointer;\n  transition: border-color 0.2s;\n}\n.eme-select[_ngcontent-%COMP%]:focus {\n  border-color: #f59e0b;\n}\n.eme-select.narrow[_ngcontent-%COMP%] {\n  width: 90px;\n}\n.eme-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  align-items: flex-end;\n}\n.eme-cond-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  flex-wrap: wrap;\n  background: #1e1e1e;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 8px 10px;\n}\n.eme-cons-card[_ngcontent-%COMP%] {\n  background: #1e1e1e;\n  border: 1px solid #333;\n  border-radius: 8px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.eme-cons-header[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n}\n.eme-formula-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 100%;\n}\n.eme-formula-wrap[_ngcontent-%COMP%]   .eme-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding-right: 32px;\n  box-sizing: border-box;\n}\n.eme-valid-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  color: #22c55e;\n  font-size: 0.9rem;\n}\n.eme-invalid-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  color: #ef4444;\n  font-size: 0.9rem;\n}\n.eme-error[_ngcontent-%COMP%] {\n  color: #ef4444;\n  font-size: 0.75rem;\n  margin-top: 2px;\n}\n.eme-icon-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.eme-icon-btn[_ngcontent-%COMP%] {\n  width: 34px;\n  height: 34px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid #3a3a3a;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 1rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.eme-icon-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.1);\n  border-color: #666;\n  transform: scale(1.1);\n}\n.eme-icon-btn.selected[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.18);\n  border-color: #f59e0b;\n}\n.eme-add-small[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px dashed #555;\n  color: #9ca3af;\n  padding: 3px 9px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  transition: all 0.15s;\n}\n.eme-add-small[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: #ddd;\n  border-color: #888;\n}\n.eme-remove-btn[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.1);\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  color: #ef4444;\n  width: 28px;\n  height: 28px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  transition: all 0.15s;\n}\n.eme-remove-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.25);\n  border-color: #ef4444;\n}\n.eme-empty[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 0.82rem;\n  font-style: italic;\n  margin: 0;\n  text-align: center;\n  padding: 8px 0;\n}\n.eme-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding: 12px 16px;\n  border-top: 1px solid #333;\n  background: #1e1e1e;\n  flex-shrink: 0;\n}\n.eme-cancel-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid #444;\n  color: #9ca3af;\n  padding: 8px 18px;\n  border-radius: 7px;\n  cursor: pointer;\n  font-size: 0.88rem;\n  transition: all 0.2s;\n}\n.eme-cancel-btn.small[_ngcontent-%COMP%] {\n  padding: 5px 12px;\n  font-size: 0.8rem;\n}\n.eme-cancel-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ddd;\n}\n.eme-save-btn[_ngcontent-%COMP%] {\n  background: var(--mc, #f59e0b);\n  border: none;\n  color: #000;\n  padding: 8px 22px;\n  border-radius: 7px;\n  cursor: pointer;\n  font-size: 0.88rem;\n  font-weight: 700;\n  transition: all 0.2s;\n}\n.eme-save-btn[_ngcontent-%COMP%]:hover {\n  filter: brightness(1.15);\n  transform: translateY(-1px);\n}\n/*# sourceMappingURL=embedded-macro-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EmbeddedMacroEditorComponent, [{
    type: Component,
    args: [{ selector: "app-embedded-macro-editor", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="eme-wrapper">\r
\r
  <!-- Header -->\r
  <div class="eme-header">\r
    <div class="eme-header-left">\r
      <span class="eme-icon" [style.color]="editMacro.color || '#f59e0b'">{{ editMacro.icon || '\u2726' }}</span>\r
      <h3>{{ isNew ? 'Neues Makro erstellen' : 'Makro bearbeiten' }}</h3>\r
    </div>\r
    @if (availableMacros.length > 0) {\r
      <button class="eme-copy-btn" (click)="toggleCopyFrom()" title="Aus vorh. Makro als Vorlage">\r
        \u2398 Als Vorlage kopieren\r
      </button>\r
    }\r
  </div>\r
\r
  <!-- Copy-from picker -->\r
  @if (showCopyFrom) {\r
    <div class="eme-copy-panel">\r
      <h4>Vorlage w\xE4hlen</h4>\r
      <div class="eme-copy-list">\r
        @for (m of availableMacros; track m.id) {\r
          <button class="eme-copy-item" (click)="applyTemplate(m)">\r
            <span class="eme-copy-icon" [style.color]="m.color || '#f59e0b'">{{ m.icon || '\u2726' }}</span>\r
            <span class="eme-copy-name">{{ m.name }}</span>\r
            <span class="eme-copy-meta">{{ m.conditions.length }} Bed. \xB7 {{ m.consequences.length }} Akt.</span>\r
          </button>\r
        }\r
      </div>\r
      <button class="eme-cancel-btn small" (click)="toggleCopyFrom()">Abbrechen</button>\r
    </div>\r
  }\r
\r
  <div class="eme-body">\r
\r
    <!-- Basic Settings -->\r
    <section class="eme-section">\r
      <div class="eme-section-title">\u2699 Grundeinstellungen</div>\r
\r
      <div class="eme-row">\r
        <div class="eme-field grow">\r
          <label>Name</label>\r
          <input type="text" [(ngModel)]="editMacro.name" placeholder="z.B. Feuerball, Heilzauber" />\r
        </div>\r
        <div class="eme-field compact">\r
          <label>Farbe</label>\r
          <input type="color" [(ngModel)]="editMacro.color" />\r
        </div>\r
      </div>\r
\r
      <div class="eme-field">\r
        <label>Beschreibung <span class="hint">Optional</span></label>\r
        <input type="text" [(ngModel)]="editMacro.description" placeholder="Was macht dieses Makro?" />\r
      </div>\r
\r
      <!-- Icon picker (colorable symbols) -->\r
      <div class="eme-field">\r
        <label>Icon</label>\r
        <div class="eme-icon-grid">\r
          @for (icon of iconSymbols; track icon) {\r
            <button\r
              class="eme-icon-btn"\r
              [class.selected]="editMacro.icon === icon"\r
              [style.color]="editMacro.color || '#f59e0b'"\r
              (click)="selectIcon(icon)">\r
              {{ icon }}\r
            </button>\r
          }\r
        </div>\r
      </div>\r
    </section>\r
\r
    <!-- Conditions -->\r
    <section class="eme-section">\r
      <div class="eme-section-title">\r
        \u2753 Bedingungen\r
        <button class="eme-add-small" (click)="addCondition()">+ Bedingung</button>\r
      </div>\r
      @if (editMacro.conditions.length === 0) {\r
        <p class="eme-empty">Keine \u2013 Makro ist immer verf\xFCgbar</p>\r
      } @else {\r
        @for (cond of editMacro.conditions; track cond.id; let i = $index) {\r
          <div class="eme-cond-row">\r
            <select [(ngModel)]="cond.type" class="eme-select">\r
              <option value="resource">Ressource</option>\r
              <option value="stat">Attribut</option>\r
              <option value="skill">Skill</option>\r
            </select>\r
\r
            @if (cond.type === 'resource') {\r
              <select [(ngModel)]="cond.resource" class="eme-select">\r
                @for (r of resourceTypes; track r) {\r
                  <option [value]="r">{{ resourceLabels[r] }}</option>\r
                }\r
              </select>\r
            } @else if (cond.type === 'stat') {\r
              <select [(ngModel)]="cond.stat" class="eme-select">\r
                @for (s of statTypes; track s) {\r
                  <option [value]="s">{{ statLabels[s] }}</option>\r
                }\r
              </select>\r
            } @else {\r
              <input type="text" [(ngModel)]="cond.skillName" placeholder="Skill-Name" class="eme-input" />\r
            }\r
\r
            @if (cond.type !== 'skill') {\r
              <select [(ngModel)]="cond.operator" class="eme-select narrow">\r
                @for (op of operators; track op) {\r
                  <option [value]="op">{{ op }}</option>\r
                }\r
              </select>\r
              <select [(ngModel)]="cond.valueType" class="eme-select">\r
                @for (vt of valueTypes; track vt) {\r
                  <option [value]="vt">{{ valueTypeLabels[vt] }}</option>\r
                }\r
              </select>\r
              @if (cond.valueType === 'fixed') {\r
                <input type="number" [(ngModel)]="cond.value" placeholder="Wert" class="eme-input narrow" />\r
              } @else if (cond.valueType === 'currentResource' || cond.valueType === 'maxResource') {\r
                <select [(ngModel)]="cond.compareToResource" class="eme-select">\r
                  @for (r of resourceTypes; track r) {\r
                    <option [value]="r">{{ resourceLabels[r] }}</option>\r
                  }\r
                </select>\r
              } @else if (cond.valueType === 'stat') {\r
                <select [(ngModel)]="cond.compareToStat" class="eme-select">\r
                  @for (s of statTypes; track s) {\r
                    <option [value]="s">{{ statLabels[s] }}</option>\r
                  }\r
                </select>\r
              }\r
            }\r
\r
            <button class="eme-remove-btn" (click)="removeCondition(i)" title="Entfernen">\u2715</button>\r
          </div>\r
        }\r
      }\r
    </section>\r
\r
    <!-- Consequences -->\r
    <section class="eme-section">\r
      <div class="eme-section-title">\r
        \u26A1 Aktionen (Dann\u2026)\r
        <button class="eme-add-small" (click)="addConsequence()">+ Aktion</button>\r
      </div>\r
      @if (editMacro.consequences.length === 0) {\r
        <p class="eme-empty">Keine Aktionen definiert</p>\r
      } @else {\r
        @for (cons of editMacro.consequences; track cons.id; let i = $index) {\r
          <div class="eme-cons-card">\r
            <div class="eme-cons-header">\r
              <div class="eme-field grow">\r
                <label>Aktionstyp</label>\r
                <select [(ngModel)]="cons.type" class="eme-select">\r
                  @for (k of ['dice_roll','spend_resource','gain_resource','apply_bonus']; track k) {\r
                    <option [value]="k">{{ consequenceTypeLabels[k] }}</option>\r
                  }\r
                </select>\r
              </div>\r
              <button class="eme-remove-btn" (click)="removeConsequence(i)" title="Entfernen">\u2715</button>\r
            </div>\r
\r
            @if (cons.type === 'spend_resource' || cons.type === 'gain_resource') {\r
              <div class="eme-field">\r
                <label>Ressource</label>\r
                <select [(ngModel)]="cons.resource" class="eme-select">\r
                  @for (r of resourceTypes; track r) {\r
                    <option [value]="r">{{ resourceLabels[r] }}</option>\r
                  }\r
                </select>\r
              </div>\r
            }\r
\r
            <div class="eme-row">\r
              <div class="eme-field grow">\r
                <label>Anzeigename <span class="hint">Optional</span></label>\r
                <input type="text" [(ngModel)]="cons.rollName" placeholder="z.B. Angriff, Schaden" class="eme-input" />\r
              </div>\r
              <div class="eme-field compact">\r
                <label>Farbe</label>\r
                <input type="color" [(ngModel)]="cons.rollColor" />\r
              </div>\r
            </div>\r
\r
            <div class="eme-field">\r
              <label>\r
                W\xFCrfelformel oder fester Wert\r
                <span class="hint">z.B. 1d20+3, 2d6*2, 10</span>\r
              </label>\r
              <div class="eme-formula-wrap">\r
                <input\r
                  type="text"\r
                  [(ngModel)]="cons.diceFormula"\r
                  placeholder="z.B. 2d6+3"\r
                  class="eme-input"\r
                  [class.valid]="isFormulaValid(cons.diceFormula)"\r
                  [class.invalid]="cons.diceFormula && !isFormulaValid(cons.diceFormula)" />\r
                @if (cons.diceFormula && isFormulaValid(cons.diceFormula)) {\r
                  <span class="eme-valid-icon">\u2713</span>\r
                }\r
                @if (cons.diceFormula && !isFormulaValid(cons.diceFormula)) {\r
                  <span class="eme-invalid-icon">\u2717</span>\r
                }\r
              </div>\r
              @if (cons.diceFormula && !isFormulaValid(cons.diceFormula)) {\r
                <div class="eme-error">{{ getFormulaError(cons.diceFormula) }}</div>\r
              }\r
            </div>\r
          </div>\r
        }\r
      }\r
    </section>\r
\r
  </div>\r
\r
  <!-- Footer -->\r
  <div class="eme-footer">\r
    <button class="eme-cancel-btn" (click)="onCancel()">Abbrechen</button>\r
    <button class="eme-save-btn" [style.--mc]="editMacro.color || '#f59e0b'" (click)="onSave()">Makro speichern</button>\r
  </div>\r
\r
</div>\r
`, styles: ["/* src/app/shared/embedded-macro-editor/embedded-macro-editor.component.css */\n.eme-wrapper {\n  display: flex;\n  flex-direction: column;\n  background: #1e1e1e;\n  border: 1px solid #3a3a3a;\n  border-radius: 12px;\n  overflow: hidden;\n  width: 100%;\n  max-width: 680px;\n  max-height: 80vh;\n}\n.eme-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 16px;\n  border-bottom: 1px solid #333;\n  background:\n    linear-gradient(\n      180deg,\n      #252525,\n      #1e1e1e);\n  flex-shrink: 0;\n}\n.eme-header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.eme-header-left .eme-icon {\n  font-size: 1.5rem;\n  line-height: 1;\n}\n.eme-header h3 {\n  margin: 0;\n  color: #e5e7eb;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n.eme-copy-btn {\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid #444;\n  color: #aaa;\n  padding: 6px 12px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 0.8rem;\n  transition: all 0.2s;\n  white-space: nowrap;\n}\n.eme-copy-btn:hover {\n  background: rgba(255, 255, 255, 0.13);\n  color: #ddd;\n}\n.eme-copy-panel {\n  background: #252525;\n  border-bottom: 1px solid #333;\n  padding: 12px 16px;\n  flex-shrink: 0;\n}\n.eme-copy-panel h4 {\n  margin: 0 0 8px;\n  color: #ccc;\n  font-size: 0.85rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.eme-copy-list {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  max-height: 160px;\n  overflow-y: auto;\n  margin-bottom: 8px;\n}\n.eme-copy-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid #444;\n  border-radius: 6px;\n  padding: 6px 10px;\n  cursor: pointer;\n  text-align: left;\n  transition: all 0.15s;\n}\n.eme-copy-item:hover {\n  background: rgba(255, 255, 255, 0.09);\n  border-color: #666;\n}\n.eme-copy-icon {\n  font-size: 1.1rem;\n}\n.eme-copy-name {\n  color: #e5e7eb;\n  font-size: 0.9rem;\n  flex: 1;\n}\n.eme-copy-meta {\n  color: #777;\n  font-size: 0.75rem;\n}\n.eme-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 14px 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.eme-section {\n  background: #252525;\n  border: 1px solid #333;\n  border-radius: 8px;\n  padding: 12px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.eme-section-title {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  color: #f59e0b;\n  font-size: 0.82rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  margin-bottom: 2px;\n}\n.eme-field {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.eme-field.grow {\n  flex: 1;\n}\n.eme-field.compact {\n  flex: 0 0 auto;\n}\n.eme-field label {\n  color: #9ca3af;\n  font-size: 0.75rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.eme-field label .hint {\n  color: #666;\n  font-size: 0.7rem;\n  font-weight: 400;\n  text-transform: none;\n  letter-spacing: 0;\n  margin-left: 4px;\n}\n.eme-field input[type=text],\n.eme-field input[type=number],\n.eme-input {\n  background: #1a1a1a;\n  border: 1px solid #3a3a3a;\n  border-radius: 6px;\n  padding: 7px 10px;\n  color: #e5e7eb;\n  font-size: 0.88rem;\n  outline: none;\n  transition: border-color 0.2s;\n  width: 100%;\n  box-sizing: border-box;\n}\n.eme-input {\n  width: auto;\n  min-width: 0;\n}\n.eme-input.narrow {\n  width: 80px;\n}\n.eme-field input:focus,\n.eme-input:focus {\n  border-color: #f59e0b;\n}\n.eme-input.valid {\n  border-color: #22c55e;\n}\n.eme-input.invalid {\n  border-color: #ef4444;\n}\n.eme-field input[type=color] {\n  width: 48px;\n  height: 34px;\n  padding: 2px;\n  border: 1px solid #3a3a3a;\n  border-radius: 6px;\n  background: #1a1a1a;\n  cursor: pointer;\n}\n.eme-select {\n  background: #1a1a1a;\n  border: 1px solid #3a3a3a;\n  border-radius: 6px;\n  padding: 7px 10px;\n  color: #e5e7eb;\n  font-size: 0.82rem;\n  outline: none;\n  cursor: pointer;\n  transition: border-color 0.2s;\n}\n.eme-select:focus {\n  border-color: #f59e0b;\n}\n.eme-select.narrow {\n  width: 90px;\n}\n.eme-row {\n  display: flex;\n  gap: 10px;\n  align-items: flex-end;\n}\n.eme-cond-row {\n  display: flex;\n  gap: 6px;\n  align-items: center;\n  flex-wrap: wrap;\n  background: #1e1e1e;\n  border: 1px solid #333;\n  border-radius: 6px;\n  padding: 8px 10px;\n}\n.eme-cons-card {\n  background: #1e1e1e;\n  border: 1px solid #333;\n  border-radius: 8px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.eme-cons-header {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n}\n.eme-formula-wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 100%;\n}\n.eme-formula-wrap .eme-input {\n  width: 100%;\n  padding-right: 32px;\n  box-sizing: border-box;\n}\n.eme-valid-icon {\n  position: absolute;\n  right: 8px;\n  color: #22c55e;\n  font-size: 0.9rem;\n}\n.eme-invalid-icon {\n  position: absolute;\n  right: 8px;\n  color: #ef4444;\n  font-size: 0.9rem;\n}\n.eme-error {\n  color: #ef4444;\n  font-size: 0.75rem;\n  margin-top: 2px;\n}\n.eme-icon-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.eme-icon-btn {\n  width: 34px;\n  height: 34px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid #3a3a3a;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 1rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.eme-icon-btn:hover {\n  background: rgba(255, 255, 255, 0.1);\n  border-color: #666;\n  transform: scale(1.1);\n}\n.eme-icon-btn.selected {\n  background: rgba(245, 158, 11, 0.18);\n  border-color: #f59e0b;\n}\n.eme-add-small {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px dashed #555;\n  color: #9ca3af;\n  padding: 3px 9px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  transition: all 0.15s;\n}\n.eme-add-small:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: #ddd;\n  border-color: #888;\n}\n.eme-remove-btn {\n  background: rgba(239, 68, 68, 0.1);\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  color: #ef4444;\n  width: 28px;\n  height: 28px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.75rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  transition: all 0.15s;\n}\n.eme-remove-btn:hover {\n  background: rgba(239, 68, 68, 0.25);\n  border-color: #ef4444;\n}\n.eme-empty {\n  color: #666;\n  font-size: 0.82rem;\n  font-style: italic;\n  margin: 0;\n  text-align: center;\n  padding: 8px 0;\n}\n.eme-footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n  padding: 12px 16px;\n  border-top: 1px solid #333;\n  background: #1e1e1e;\n  flex-shrink: 0;\n}\n.eme-cancel-btn {\n  background: rgba(255, 255, 255, 0.07);\n  border: 1px solid #444;\n  color: #9ca3af;\n  padding: 8px 18px;\n  border-radius: 7px;\n  cursor: pointer;\n  font-size: 0.88rem;\n  transition: all 0.2s;\n}\n.eme-cancel-btn.small {\n  padding: 5px 12px;\n  font-size: 0.8rem;\n}\n.eme-cancel-btn:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ddd;\n}\n.eme-save-btn {\n  background: var(--mc, #f59e0b);\n  border: none;\n  color: #000;\n  padding: 8px 22px;\n  border-radius: 7px;\n  cursor: pointer;\n  font-size: 0.88rem;\n  font-weight: 700;\n  transition: all 0.2s;\n}\n.eme-save-btn:hover {\n  filter: brightness(1.15);\n  transform: translateY(-1px);\n}\n/*# sourceMappingURL=embedded-macro-editor.component.css.map */\n"] }]
  }], null, { macro: [{
    type: Input
  }], availableMacros: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(EmbeddedMacroEditorComponent, { className: "EmbeddedMacroEditorComponent", filePath: "app/shared/embedded-macro-editor/embedded-macro-editor.component.ts", lineNumber: 61 });
})();

// src/app/shared/status-effect-editor/status-effect-editor.component.ts
function StatusEffectEditorComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 41);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_Conditional_8_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.deleteEffect());
    });
    \u0275\u0275text(1, "\u{1F5D1}\uFE0F L\xF6schen");
    \u0275\u0275elementEnd();
  }
}
function StatusEffectEditorComponent_For_38_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 42);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_For_38_Template_button_click_0_listener() {
      const icon_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.selectIcon(icon_r4));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const icon_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("color", ctx_r1.editEffect.color);
    \u0275\u0275classProp("selected", ctx_r1.editEffect.icon === icon_r4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", icon_r4, " ");
  }
}
function StatusEffectEditorComponent_For_45_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 43);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_For_45_Template_button_click_0_listener() {
      const color_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.selectColor(color_r6));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const color_r6 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("background", color_r6);
    \u0275\u0275classProp("selected", ctx_r1.isColorSelected(color_r6));
  }
}
function StatusEffectEditorComponent_Conditional_83_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 44);
    \u0275\u0275text(1);
    \u0275\u0275elementStart(2, "button", 45);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_Conditional_83_For_2_Template_button_click_2_listener() {
      const $index_r8 = \u0275\u0275restoreView(_r7).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeTag($index_r8));
    });
    \u0275\u0275text(3, "\u2715");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const tag_r9 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", tag_r9, " ");
  }
}
function StatusEffectEditorComponent_Conditional_83_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 31);
    \u0275\u0275repeaterCreate(1, StatusEffectEditorComponent_Conditional_83_For_2_Template, 4, 1, "span", 44, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.editEffect.tags);
  }
}
function StatusEffectEditorComponent_Conditional_98_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 46);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_Conditional_98_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveEffectGlobally());
    });
    \u0275\u0275text(1, "Global \xE4ndern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "button", 47);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_Conditional_98_Template_button_click_2_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveEffect());
    });
    \u0275\u0275text(3, "Lokal \xE4ndern");
    \u0275\u0275elementEnd();
  }
}
function StatusEffectEditorComponent_Conditional_99_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 47);
    \u0275\u0275listener("click", function StatusEffectEditorComponent_Conditional_99_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveEffect());
    });
    \u0275\u0275text(1, "Speichern");
    \u0275\u0275elementEnd();
  }
}
var StatusEffectEditorComponent = class _StatusEffectEditorComponent {
  statusEffect = null;
  /** ActionMacros from the library to allow 'copy from template' */
  availableMacros = [];
  /** When true (GM), offer a second "Global ändern" save that writes back to the library. */
  allowGlobalSave = false;
  save = new EventEmitter();
  /** GM-only: persist the change to the library definition (affects everyone). */
  saveGlobal = new EventEmitter();
  cancel = new EventEmitter();
  delete = new EventEmitter();
  editEffect;
  isNew = true;
  // Embedded macro editor state
  showMacroEditor = false;
  macroEditMode = "new";
  showCopyFromLibrary = false;
  // Tag input
  newTag = "";
  // Available targets for stat modifiers (base stats, resources, derived values)
  stats = [
    "strength",
    "dexterity",
    "speed",
    "intelligence",
    "constitution",
    "chill",
    "life",
    "energy",
    "mana",
    "fokus",
    "armorMalus",
    "armorNegation",
    "grundbonus",
    "reaktion",
    "bewegung",
    "stability"
  ];
  statLabels = {
    strength: "St\xE4rke",
    dexterity: "Geschicklichkeit",
    speed: "Geschwindigkeit",
    intelligence: "Intelligenz",
    constitution: "Konstitution",
    chill: "Wille",
    life: "Leben",
    energy: "Ausdauer",
    mana: "Mana",
    fokus: "Fokus",
    armorMalus: "R\xFCstungsmalus",
    armorNegation: "R\xFCstungsnegation",
    grundbonus: "Grundbonus",
    reaktion: "Reaktionsbonus",
    bewegung: "Bewegung",
    stability: "Stabilit\xE4t"
  };
  // Talents available for talent modifiers
  talentOptions = TALENT_DEFINITIONS.map((t) => ({ id: t.id, name: t.name, statLabel: t.statLabel }));
  // Color presets 
  colorPresets = [
    "#8b5cf6",
    // Purple (default)
    "#ef4444",
    // Red
    "#f97316",
    // Orange
    "#eab308",
    // Yellow
    "#22c55e",
    // Green
    "#06b6d4",
    // Cyan
    "#3b82f6",
    // Blue
    "#ec4899",
    // Pink
    "#6b7280"
    // Gray
  ];
  // Colorable Unicode icon presets (respond to CSS color property)
  iconPresets = MACRO_ICON_SYMBOLS;
  ngOnInit() {
    if (this.statusEffect) {
      this.editEffect = JSON.parse(JSON.stringify(this.statusEffect));
      this.isNew = false;
    } else {
      this.editEffect = {
        id: `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: "Neuer Status-Effekt",
        description: "",
        icon: "\u{1F4AB}",
        color: "#8b5cf6",
        diceBonuses: [],
        statModifiers: [],
        tags: [],
        isDebuff: false,
        maxStacks: 1,
        defaultDuration: void 0
      };
    }
    if (!this.editEffect.diceBonuses)
      this.editEffect.diceBonuses = [];
    if (!this.editEffect.statModifiers)
      this.editEffect.statModifiers = [];
    if (!this.editEffect.talentModifiers)
      this.editEffect.talentModifiers = [];
    if (!this.editEffect.tags)
      this.editEffect.tags = [];
    if (!this.editEffect.script?.trim() && this.editEffect.embeddedMacro) {
      this.editEffect.script = actionMacroToScript(this.editEffect.embeddedMacro);
    }
  }
  // Save/Cancel/Delete
  saveEffect() {
    this.save.emit(this.editEffect);
  }
  saveEffectGlobally() {
    this.saveGlobal.emit(this.editEffect);
  }
  cancelEdit() {
    this.cancel.emit();
  }
  deleteEffect() {
    if (confirm("Status-Effekt wirklich l\xF6schen?")) {
      this.delete.emit();
    }
  }
  // Tags
  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.editEffect.tags.includes(tag)) {
      this.editEffect.tags = [...this.editEffect.tags, tag];
      this.newTag = "";
    }
  }
  removeTag(index) {
    this.editEffect.tags = this.editEffect.tags.filter((_, i) => i !== index);
  }
  // Dice Bonuses
  addDiceBonus() {
    const newBonus = {
      name: this.editEffect.name || "Bonus",
      value: 1,
      source: "status_effect",
      context: ""
    };
    this.editEffect.diceBonuses = [...this.editEffect.diceBonuses, newBonus];
  }
  removeDiceBonus(index) {
    this.editEffect.diceBonuses = this.editEffect.diceBonuses.filter((_, i) => i !== index);
  }
  // Stat Modifiers
  addStatModifier() {
    const newMod = {
      stat: "strength",
      amount: 1,
      isPercentage: false
    };
    this.editEffect.statModifiers = [...this.editEffect.statModifiers, newMod];
  }
  removeStatModifier(index) {
    this.editEffect.statModifiers = this.editEffect.statModifiers.filter((_, i) => i !== index);
  }
  // Talent Modifiers
  addTalentModifier() {
    const newMod = {
      talentId: this.talentOptions[0]?.id ?? "",
      amount: 1
    };
    this.editEffect.talentModifiers = [...this.editEffect.talentModifiers ?? [], newMod];
  }
  removeTalentModifier(index) {
    this.editEffect.talentModifiers = (this.editEffect.talentModifiers ?? []).filter((_, i) => i !== index);
  }
  // Color selection
  selectColor(color) {
    this.editEffect.color = color;
  }
  isColorSelected(color) {
    return this.editEffect.color === color;
  }
  // Icon selection
  selectIcon(icon) {
    this.editEffect.icon = icon;
  }
  // ---- Embedded Macro ----
  openCreateMacro() {
    this.macroEditMode = "new";
    this.showMacroEditor = true;
    this.showCopyFromLibrary = false;
  }
  openEditMacro() {
    this.macroEditMode = "edit";
    this.showMacroEditor = true;
    this.showCopyFromLibrary = false;
  }
  removeMacro() {
    if (confirm("Eingebettetes Makro entfernen?")) {
      this.editEffect.embeddedMacro = void 0;
    }
  }
  onMacroSaved(macro) {
    this.editEffect.embeddedMacro = macro;
    this.showMacroEditor = false;
  }
  onMacroCancel() {
    this.showMacroEditor = false;
  }
  toggleCopyFromLibrary() {
    this.showCopyFromLibrary = !this.showCopyFromLibrary;
  }
  copyMacroFromLibrary(macro) {
    const copy = JSON.parse(JSON.stringify(macro));
    copy.id = `macro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    copy.createdAt = /* @__PURE__ */ new Date();
    copy.modifiedAt = /* @__PURE__ */ new Date();
    this.editEffect.embeddedMacro = copy;
    this.showCopyFromLibrary = false;
  }
  static \u0275fac = function StatusEffectEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _StatusEffectEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _StatusEffectEditorComponent, selectors: [["app-status-effect-editor"]], inputs: { statusEffect: "statusEffect", availableMacros: "availableMacros", allowGlobalSave: "allowGlobalSave" }, outputs: { save: "save", saveGlobal: "saveGlobal", cancel: "cancel", delete: "delete" }, decls: 100, vars: 20, consts: [[1, "editor-container"], [1, "editor-header"], [1, "header-left"], [1, "effect-icon"], [1, "header-actions"], [1, "delete-btn"], [1, "editor-content"], [1, "section"], [1, "form-row"], ["type", "text", "placeholder", "Name des Effekts", 3, "ngModelChange", "ngModel"], ["rows", "3", "placeholder", "Beschreibung des Effekts", 3, "ngModelChange", "ngModel"], [1, "form-row", "checkboxes-row"], [1, "checkbox-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "icon-grid"], [1, "icon-btn", 3, "selected", "color"], ["type", "text", "placeholder", "Oder eigenes Symbol eingeben", 1, "icon-input", 3, "ngModelChange", "ngModel"], [1, "color-grid"], [1, "color-btn", 3, "background", "selected"], [1, "custom-color"], ["type", "color", 1, "color-picker", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "#8b5cf6", 1, "color-text", 3, "ngModelChange", "ngModel"], [1, "form-row-inline"], [1, "inline-field"], [1, "input-with-suffix"], ["type", "number", "min", "0", "placeholder", "\u221E", 3, "ngModelChange", "ngModel"], [1, "suffix"], [1, "hint"], ["type", "number", "min", "1", "max", "99", "placeholder", "1", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "placeholder", "\u2013", 3, "ngModelChange", "ngModel"], ["type", "number", "placeholder", "0", 3, "ngModelChange", "ngModel"], [1, "tags-list"], [1, "add-tag-row"], ["type", "text", "placeholder", "Neuer Tag", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "add-btn", "small", 3, "click"], [1, "section-hint"], [1, "script-editor-host"], [3, "valueChange", "value"], [1, "editor-footer"], [1, "cancel-btn", 3, "click"], [1, "save-btn"], [1, "delete-btn", 3, "click"], [1, "icon-btn", 3, "click"], [1, "color-btn", 3, "click"], [1, "tag"], [3, "click"], ["title", "\xC4ndert die Bibliotheks-Definition \u2014 betrifft alle", 1, "save-btn", "global", 3, "click"], [1, "save-btn", 3, "click"]], template: function StatusEffectEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "span", 3);
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "h2");
      \u0275\u0275text(6);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "div", 4);
      \u0275\u0275conditionalCreate(8, StatusEffectEditorComponent_Conditional_8_Template, 2, 0, "button", 5);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 6)(10, "section", 7)(11, "h3");
      \u0275\u0275text(12, "Allgemein");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(13, "div", 8)(14, "label");
      \u0275\u0275text(15, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_16_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.name, $event) || (ctx.editEffect.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "div", 8)(18, "label");
      \u0275\u0275text(19, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "textarea", 10);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_textarea_ngModelChange_20_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.description, $event) || (ctx.editEffect.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(21, "div", 11)(22, "label", 12)(23, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_23_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.isDebuff, $event) || (ctx.editEffect.isDebuff = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "span");
      \u0275\u0275text(25, "Ist Debuff (negative Wirkung)");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(26, "label", 12)(27, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_27_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.public, $event) || (ctx.editEffect.public = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "span");
      \u0275\u0275text(29, "\xD6ffentlich (auf jedem Charakterbogen sichtbar)");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(30, "section", 7)(31, "h3");
      \u0275\u0275text(32, "Aussehen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "div", 8)(34, "label");
      \u0275\u0275text(35, "Icon");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "div", 14);
      \u0275\u0275repeaterCreate(37, StatusEffectEditorComponent_For_38_Template, 2, 5, "button", 15, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(39, "input", 16);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_39_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.icon, $event) || (ctx.editEffect.icon = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(40, "div", 8)(41, "label");
      \u0275\u0275text(42, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(43, "div", 17);
      \u0275\u0275repeaterCreate(44, StatusEffectEditorComponent_For_45_Template, 1, 4, "button", 18, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "div", 19)(47, "input", 20);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_47_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.color, $event) || (ctx.editEffect.color = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "input", 21);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_48_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.color, $event) || (ctx.editEffect.color = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(49, "section", 7)(50, "h3");
      \u0275\u0275text(51, "Dauer & Stapeln");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "div", 22)(53, "div", 23)(54, "label");
      \u0275\u0275text(55, "Standard-Dauer");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(56, "div", 24)(57, "input", 25);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_57_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.defaultDuration, $event) || (ctx.editEffect.defaultDuration = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "span", 26);
      \u0275\u0275text(59, "Runden");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(60, "span", 27);
      \u0275\u0275text(61, "Leer = unbegrenzt");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(62, "div", 23)(63, "label");
      \u0275\u0275text(64, "Max. Stapel");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(65, "input", 28);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_65_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.maxStacks, $event) || (ctx.editEffect.maxStacks = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(66, "span", 27);
      \u0275\u0275text(67, "Wie oft stapelbar");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(68, "div", 23)(69, "label");
      \u0275\u0275text(70, "St\xE4rke");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(71, "input", 29);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_71_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.strength, $event) || (ctx.editEffect.strength = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(72, "span", 27);
      \u0275\u0275text(73, "Schwierigkeit zu entfernen");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(74, "div", 23)(75, "label");
      \u0275\u0275text(76, "Priorit\xE4t");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(77, "input", 30);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_77_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editEffect.priority, $event) || (ctx.editEffect.priority = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(78, "span", 27);
      \u0275\u0275text(79, "effectActive-Reihenfolge (klein zuerst; z.B. \xD72 nach +2)");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(80, "section", 7)(81, "h3");
      \u0275\u0275text(82, "Tags");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(83, StatusEffectEditorComponent_Conditional_83_Template, 3, 0, "div", 31);
      \u0275\u0275elementStart(84, "div", 32)(85, "input", 33);
      \u0275\u0275twoWayListener("ngModelChange", function StatusEffectEditorComponent_Template_input_ngModelChange_85_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.newTag, $event) || (ctx.newTag = $event);
        return $event;
      });
      \u0275\u0275listener("keydown.enter", function StatusEffectEditorComponent_Template_input_keydown_enter_85_listener() {
        return ctx.addTag();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "button", 34);
      \u0275\u0275listener("click", function StatusEffectEditorComponent_Template_button_click_86_listener() {
        return ctx.addTag();
      });
      \u0275\u0275text(87, "+ Tag");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(88, "section", 7)(89, "h3");
      \u0275\u0275text(90, "Skript (Aktion)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(91, "p", 35);
      \u0275\u0275text(92, "Code, das beim Ausl\xF6sen des Effekts l\xE4uft. Hat Vorrang vor dem Makro unten.");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(93, "div", 36)(94, "app-script-editor", 37);
      \u0275\u0275listener("valueChange", function StatusEffectEditorComponent_Template_app_script_editor_valueChange_94_listener($event) {
        return ctx.editEffect.script = $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(95, "div", 38)(96, "button", 39);
      \u0275\u0275listener("click", function StatusEffectEditorComponent_Template_button_click_96_listener() {
        return ctx.cancelEdit();
      });
      \u0275\u0275text(97, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(98, StatusEffectEditorComponent_Conditional_98_Template, 4, 0)(99, StatusEffectEditorComponent_Conditional_99_Template, 2, 0, "button", 40);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(3);
      \u0275\u0275styleProp("color", ctx.editEffect.color);
      \u0275\u0275advance();
      \u0275\u0275textInterpolate(ctx.editEffect.icon);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate(ctx.isNew ? "Neuen Status-Effekt erstellen" : "Status-Effekt bearbeiten");
      \u0275\u0275advance(2);
      \u0275\u0275conditional(!ctx.isNew ? 8 : -1);
      \u0275\u0275advance(8);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.description);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.isDebuff);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.public);
      \u0275\u0275advance(10);
      \u0275\u0275repeater(ctx.iconPresets);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.icon);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.colorPresets);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.color);
      \u0275\u0275advance();
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.color);
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.defaultDuration);
      \u0275\u0275advance(8);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.maxStacks);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.strength);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.editEffect.priority);
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.editEffect.tags && ctx.editEffect.tags.length > 0 ? 83 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.newTag);
      \u0275\u0275advance(9);
      \u0275\u0275property("value", ctx.editEffect.script || "");
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.allowGlobalSave ? 98 : 99);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel, ScriptEditorComponent], styles: ["\n\n.editor-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: #1e1e1e;\n  color: #e0e0e0;\n}\n.editor-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n  background: #252525;\n  border-bottom: 1px solid #3d3d3d;\n}\n.header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.effect-icon[_ngcontent-%COMP%] {\n  font-size: 32px;\n}\n.editor-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 500;\n}\n.delete-btn[_ngcontent-%COMP%] {\n  background: #3d2828;\n  border: 1px solid #5c2828;\n  color: #f44336;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.delete-btn[_ngcontent-%COMP%]:hover {\n  background: #5c2828;\n}\n.editor-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px;\n}\n.section[_ngcontent-%COMP%] {\n  margin-bottom: 24px;\n  padding-bottom: 24px;\n  border-bottom: 1px solid #3d3d3d;\n}\n.section[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n}\n.section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  font-size: 14px;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #888;\n}\n.section-hint[_ngcontent-%COMP%] {\n  margin: -8px 0 12px;\n  font-size: 13px;\n  color: #666;\n}\n.form-row[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.form-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 13px;\n  color: #aaa;\n}\n.form-row[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%], \n.form-row[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%], \n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], \n.form-row[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  width: 100%;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 10px 12px;\n  border-radius: 4px;\n  font-size: 14px;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.form-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus, \n.form-row[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  border-color: #0078d4;\n}\n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  resize: vertical;\n  min-height: 60px;\n}\n.hint[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 4px;\n  font-size: 12px;\n  color: #666;\n}\n.checkboxes-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 20px;\n}\n.checkbox-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n}\n.checkbox-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  accent-color: #0078d4;\n}\n.checkbox-label.small[_ngcontent-%COMP%] {\n  font-size: 13px;\n}\n.form-row-inline[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 24px;\n}\n.inline-field[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.inline-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 13px;\n  color: #aaa;\n}\n.inline-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 100%;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 10px 12px;\n  border-radius: 4px;\n  font-size: 14px;\n  outline: none;\n}\n.input-with-suffix[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n}\n.input-with-suffix[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  border-radius: 4px 0 0 4px;\n}\n.input-with-suffix[_ngcontent-%COMP%]   .suffix[_ngcontent-%COMP%] {\n  background: #3d3d3d;\n  border: 1px solid #3d3d3d;\n  border-left: none;\n  padding: 10px 12px;\n  border-radius: 0 4px 4px 0;\n  font-size: 14px;\n  color: #888;\n}\n.icon-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.icon-btn[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 4px;\n  font-size: 20px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.icon-btn[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n}\n.icon-btn.selected[_ngcontent-%COMP%] {\n  background: #0078d4;\n  border-color: #0078d4;\n}\n.icon-input[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 200px;\n}\n.color-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.color-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border: 2px solid transparent;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.color-btn[_ngcontent-%COMP%]:hover {\n  transform: scale(1.1);\n}\n.color-btn.selected[_ngcontent-%COMP%] {\n  border-color: #fff;\n  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);\n}\n.custom-color[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.color-picker[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 32px;\n  padding: 0;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.color-text[_ngcontent-%COMP%] {\n  width: 100px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 8px;\n  border-radius: 4px;\n  font-size: 13px;\n}\n.bonus-list[_ngcontent-%COMP%], \n.modifier-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.bonus-row[_ngcontent-%COMP%], \n.modifier-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.bonus-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.modifier-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.modifier-row[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 8px 10px;\n  border-radius: 4px;\n  font-size: 13px;\n}\n.bonus-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:first-child {\n  flex: 1;\n}\n.bonus-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:nth-child(3) {\n  flex: 2;\n}\n.modifier-row[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.value-input[_ngcontent-%COMP%] {\n  width: 70px !important;\n  text-align: center;\n}\n.remove-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #555;\n  color: #888;\n  width: 28px;\n  height: 28px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 12px;\n  transition: all 0.15s;\n}\n.remove-btn[_ngcontent-%COMP%]:hover {\n  background: #3d2828;\n  border-color: #f44336;\n  color: #f44336;\n}\n.add-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px dashed #555;\n  color: #888;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 0.15s;\n}\n.add-btn[_ngcontent-%COMP%]:hover {\n  background: #2d2d2d;\n  border-color: #0078d4;\n  color: #0078d4;\n}\n.add-btn.small[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n}\n.tags-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.tag[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: #3d3d3d;\n  padding: 4px 8px 4px 12px;\n  border-radius: 16px;\n  font-size: 13px;\n}\n.tag[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #888;\n  cursor: pointer;\n  padding: 0 4px;\n  font-size: 12px;\n}\n.tag[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  color: #f44336;\n}\n.add-tag-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.add-tag-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 8px 12px;\n  border-radius: 4px;\n  font-size: 13px;\n}\n.editor-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding: 16px 20px;\n  background: #252525;\n  border-top: 1px solid #3d3d3d;\n}\n.cancel-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #555;\n  color: #888;\n  padding: 10px 20px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  transition: all 0.15s;\n}\n.cancel-btn[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n  color: #fff;\n}\n.save-btn[_ngcontent-%COMP%] {\n  background: #0078d4;\n  border: none;\n  color: #fff;\n  padding: 10px 24px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 500;\n  transition: background 0.15s;\n}\n.save-btn[_ngcontent-%COMP%]:hover {\n  background: #1084d8;\n}\n.save-btn.global[_ngcontent-%COMP%] {\n  background: #b91c1c;\n}\n.save-btn.global[_ngcontent-%COMP%]:hover {\n  background: #dc2626;\n}\n.editor-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n}\n.editor-content[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: #1e1e1e;\n}\n.editor-content[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #3d3d3d;\n  border-radius: 4px;\n}\n.editor-content[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n.macro-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  background: #252525;\n  border: 1px solid #3a3a3a;\n  border-radius: 7px;\n  padding: 10px 12px;\n  margin-bottom: 10px;\n}\n.macro-summary-icon[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  line-height: 1;\n}\n.macro-summary-info[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.macro-summary-info[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #e5e7eb;\n  font-size: 0.9rem;\n}\n.macro-meta[_ngcontent-%COMP%] {\n  color: #777;\n  font-size: 0.75rem;\n}\n.edit-macro-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid #444;\n  color: #aaa;\n  padding: 5px 11px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.8rem;\n  transition: all 0.15s;\n}\n.edit-macro-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ddd;\n}\n.remove-macro-btn[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  color: #ef4444;\n  width: 28px;\n  height: 28px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.78rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.remove-macro-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.macro-actions-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.add-btn.secondary[_ngcontent-%COMP%] {\n  border-color: #555;\n  color: #9ca3af;\n}\n.add-btn.secondary[_ngcontent-%COMP%]:hover {\n  border-color: #888;\n  color: #ddd;\n}\n.copy-library-panel[_ngcontent-%COMP%] {\n  background: #252525;\n  border: 1px solid #333;\n  border-radius: 7px;\n  padding: 12px;\n  margin-top: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.copy-library-panel[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 6px;\n  color: #ccc;\n  font-size: 0.8rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.copy-library-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid #3a3a3a;\n  border-radius: 5px;\n  padding: 7px 10px;\n  cursor: pointer;\n  text-align: left;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  transition: all 0.15s;\n}\n.copy-library-item[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.09);\n  border-color: #555;\n}\n.cancel-btn.small[_ngcontent-%COMP%] {\n  padding: 5px 12px;\n  font-size: 0.8rem;\n}\n.script-editor-host[_ngcontent-%COMP%] {\n  height: 320px;\n  margin-top: 4px;\n}\n/*# sourceMappingURL=status-effect-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StatusEffectEditorComponent, [{
    type: Component,
    args: [{ selector: "app-status-effect-editor", standalone: true, imports: [CommonModule, FormsModule, ScriptEditorComponent], template: `<div class="editor-container">\r
  <!-- Header -->\r
  <div class="editor-header">\r
    <div class="header-left">\r
      <span class="effect-icon" [style.color]="editEffect.color">{{ editEffect.icon }}</span>\r
      <h2>{{ isNew ? 'Neuen Status-Effekt erstellen' : 'Status-Effekt bearbeiten' }}</h2>\r
    </div>\r
    <div class="header-actions">\r
      @if (!isNew) {\r
        <button class="delete-btn" (click)="deleteEffect()">\u{1F5D1}\uFE0F L\xF6schen</button>\r
      }\r
    </div>\r
  </div>\r
\r
  <!-- Content -->\r
  <div class="editor-content">\r
    <!-- Basic Info -->\r
    <section class="section">\r
      <h3>Allgemein</h3>\r
      \r
      <div class="form-row">\r
        <label>Name</label>\r
        <input type="text" [(ngModel)]="editEffect.name" placeholder="Name des Effekts">\r
      </div>\r
\r
      <div class="form-row">\r
        <label>Beschreibung</label>\r
        <textarea [(ngModel)]="editEffect.description" rows="3" placeholder="Beschreibung des Effekts"></textarea>\r
      </div>\r
\r
      <div class="form-row checkboxes-row">\r
        <label class="checkbox-label">\r
          <input type="checkbox" [(ngModel)]="editEffect.isDebuff">\r
          <span>Ist Debuff (negative Wirkung)</span>\r
        </label>\r
        <label class="checkbox-label">\r
          <input type="checkbox" [(ngModel)]="editEffect.public">\r
          <span>\xD6ffentlich (auf jedem Charakterbogen sichtbar)</span>\r
        </label>\r
      </div>\r
    </section>\r
\r
    <!-- Visual -->\r
    <section class="section">\r
      <h3>Aussehen</h3>\r
      \r
      <div class="form-row">\r
        <label>Icon</label>\r
        <div class="icon-grid">\r
          @for (icon of iconPresets; track icon) {\r
            <button \r
              class="icon-btn" \r
              [class.selected]="editEffect.icon === icon"\r
              [style.color]="editEffect.color"\r
              (click)="selectIcon(icon)">\r
              {{ icon }}\r
            </button>\r
          }\r
        </div>\r
        <input type="text" [(ngModel)]="editEffect.icon" placeholder="Oder eigenes Symbol eingeben" class="icon-input">\r
      </div>\r
\r
      <div class="form-row">\r
        <label>Farbe</label>\r
        <div class="color-grid">\r
          @for (color of colorPresets; track color) {\r
            <button \r
              class="color-btn" \r
              [style.background]="color"\r
              [class.selected]="isColorSelected(color)"\r
              (click)="selectColor(color)">\r
            </button>\r
          }\r
        </div>\r
        <div class="custom-color">\r
          <input type="color" [(ngModel)]="editEffect.color" class="color-picker">\r
          <input type="text" [(ngModel)]="editEffect.color" placeholder="#8b5cf6" class="color-text">\r
        </div>\r
      </div>\r
    </section>\r
\r
    <!-- Duration & Stacking -->\r
    <section class="section">\r
      <h3>Dauer & Stapeln</h3>\r
      \r
      <div class="form-row-inline">\r
        <div class="inline-field">\r
          <label>Standard-Dauer</label>\r
          <div class="input-with-suffix">\r
            <input type="number" [(ngModel)]="editEffect.defaultDuration" min="0" placeholder="\u221E">\r
            <span class="suffix">Runden</span>\r
          </div>\r
          <span class="hint">Leer = unbegrenzt</span>\r
        </div>\r
\r
        <div class="inline-field">\r
          <label>Max. Stapel</label>\r
          <input type="number" [(ngModel)]="editEffect.maxStacks" min="1" max="99" placeholder="1">\r
          <span class="hint">Wie oft stapelbar</span>\r
        </div>\r
\r
        <div class="inline-field">\r
          <label>St\xE4rke</label>\r
          <input type="number" [(ngModel)]="editEffect.strength" min="0" placeholder="\u2013">\r
          <span class="hint">Schwierigkeit zu entfernen</span>\r
        </div>\r
\r
        <div class="inline-field">\r
          <label>Priorit\xE4t</label>\r
          <input type="number" [(ngModel)]="editEffect.priority" placeholder="0">\r
          <span class="hint">effectActive-Reihenfolge (klein zuerst; z.B. \xD72 nach +2)</span>\r
        </div>\r
      </div>\r
    </section>\r
\r
    <!-- W\xFCrfel-Boni, Attributs- und Talent-Modifikatoren werden jetzt im Skript (effectActive)\r
         gehandhabt und wurden hier entfernt. -->\r
\r
    <!-- Tags -->\r
    <section class="section">\r
      <h3>Tags</h3>\r
      \r
      @if (editEffect.tags && editEffect.tags.length > 0) {\r
        <div class="tags-list">\r
          @for (tag of editEffect.tags; track $index) {\r
            <span class="tag">\r
              {{ tag }}\r
              <button (click)="removeTag($index)">\u2715</button>\r
            </span>\r
          }\r
        </div>\r
      }\r
      \r
      <div class="add-tag-row">\r
        <input \r
          type="text" \r
          [(ngModel)]="newTag" \r
          placeholder="Neuer Tag" \r
          (keydown.enter)="addTag()">\r
        <button class="add-btn small" (click)="addTag()">+ Tag</button>\r
      </div>\r
    </section>\r
\r
    <!-- Skript (FailScript) -->\r
    <section class="section">\r
      <h3>Skript (Aktion)</h3>\r
      <p class="section-hint">Code, das beim Ausl\xF6sen des Effekts l\xE4uft. Hat Vorrang vor dem Makro unten.</p>\r
      <div class="script-editor-host">\r
        <app-script-editor\r
          [value]="editEffect.script || ''"\r
          (valueChange)="editEffect.script = $event">\r
        </app-script-editor>\r
      </div>\r
    </section>\r
\r
  </div>\r
\r
  <!-- Footer -->\r
  <div class="editor-footer">\r
    <button class="cancel-btn" (click)="cancelEdit()">Abbrechen</button>\r
    @if (allowGlobalSave) {\r
      <button class="save-btn global" (click)="saveEffectGlobally()"\r
              title="\xC4ndert die Bibliotheks-Definition \u2014 betrifft alle">Global \xE4ndern</button>\r
      <button class="save-btn" (click)="saveEffect()">Lokal \xE4ndern</button>\r
    } @else {\r
      <button class="save-btn" (click)="saveEffect()">Speichern</button>\r
    }\r
  </div>\r
</div>\r
`, styles: ["/* src/app/shared/status-effect-editor/status-effect-editor.component.css */\n.editor-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: #1e1e1e;\n  color: #e0e0e0;\n}\n.editor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n  background: #252525;\n  border-bottom: 1px solid #3d3d3d;\n}\n.header-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.effect-icon {\n  font-size: 32px;\n}\n.editor-header h2 {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 500;\n}\n.delete-btn {\n  background: #3d2828;\n  border: 1px solid #5c2828;\n  color: #f44336;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.delete-btn:hover {\n  background: #5c2828;\n}\n.editor-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px;\n}\n.section {\n  margin-bottom: 24px;\n  padding-bottom: 24px;\n  border-bottom: 1px solid #3d3d3d;\n}\n.section:last-child {\n  border-bottom: none;\n}\n.section h3 {\n  margin: 0 0 12px;\n  font-size: 14px;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #888;\n}\n.section-hint {\n  margin: -8px 0 12px;\n  font-size: 13px;\n  color: #666;\n}\n.form-row {\n  margin-bottom: 16px;\n}\n.form-row label {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 13px;\n  color: #aaa;\n}\n.form-row input[type=text],\n.form-row input[type=number],\n.form-row textarea,\n.form-row select {\n  width: 100%;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 10px 12px;\n  border-radius: 4px;\n  font-size: 14px;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.form-row input:focus,\n.form-row textarea:focus,\n.form-row select:focus {\n  border-color: #0078d4;\n}\n.form-row textarea {\n  resize: vertical;\n  min-height: 60px;\n}\n.hint {\n  display: block;\n  margin-top: 4px;\n  font-size: 12px;\n  color: #666;\n}\n.checkboxes-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 20px;\n}\n.checkbox-label {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n}\n.checkbox-label input[type=checkbox] {\n  width: 16px;\n  height: 16px;\n  accent-color: #0078d4;\n}\n.checkbox-label.small {\n  font-size: 13px;\n}\n.form-row-inline {\n  display: flex;\n  gap: 24px;\n}\n.inline-field {\n  flex: 1;\n}\n.inline-field label {\n  display: block;\n  margin-bottom: 6px;\n  font-size: 13px;\n  color: #aaa;\n}\n.inline-field input {\n  width: 100%;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 10px 12px;\n  border-radius: 4px;\n  font-size: 14px;\n  outline: none;\n}\n.input-with-suffix {\n  display: flex;\n  align-items: center;\n}\n.input-with-suffix input {\n  border-radius: 4px 0 0 4px;\n}\n.input-with-suffix .suffix {\n  background: #3d3d3d;\n  border: 1px solid #3d3d3d;\n  border-left: none;\n  padding: 10px 12px;\n  border-radius: 0 4px 4px 0;\n  font-size: 14px;\n  color: #888;\n}\n.icon-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.icon-btn {\n  width: 40px;\n  height: 40px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 4px;\n  font-size: 20px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.icon-btn:hover {\n  background: #3d3d3d;\n}\n.icon-btn.selected {\n  background: #0078d4;\n  border-color: #0078d4;\n}\n.icon-input {\n  width: 100%;\n  max-width: 200px;\n}\n.color-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.color-btn {\n  width: 32px;\n  height: 32px;\n  border: 2px solid transparent;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.color-btn:hover {\n  transform: scale(1.1);\n}\n.color-btn.selected {\n  border-color: #fff;\n  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);\n}\n.custom-color {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.color-picker {\n  width: 40px;\n  height: 32px;\n  padding: 0;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.color-text {\n  width: 100px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 8px;\n  border-radius: 4px;\n  font-size: 13px;\n}\n.bonus-list,\n.modifier-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.bonus-row,\n.modifier-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.bonus-row input,\n.modifier-row input,\n.modifier-row select {\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 8px 10px;\n  border-radius: 4px;\n  font-size: 13px;\n}\n.bonus-row input:first-child {\n  flex: 1;\n}\n.bonus-row input:nth-child(3) {\n  flex: 2;\n}\n.modifier-row select {\n  flex: 1;\n}\n.value-input {\n  width: 70px !important;\n  text-align: center;\n}\n.remove-btn {\n  background: transparent;\n  border: 1px solid #555;\n  color: #888;\n  width: 28px;\n  height: 28px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 12px;\n  transition: all 0.15s;\n}\n.remove-btn:hover {\n  background: #3d2828;\n  border-color: #f44336;\n  color: #f44336;\n}\n.add-btn {\n  background: transparent;\n  border: 1px dashed #555;\n  color: #888;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 0.15s;\n}\n.add-btn:hover {\n  background: #2d2d2d;\n  border-color: #0078d4;\n  color: #0078d4;\n}\n.add-btn.small {\n  padding: 6px 12px;\n}\n.tags-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.tag {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: #3d3d3d;\n  padding: 4px 8px 4px 12px;\n  border-radius: 16px;\n  font-size: 13px;\n}\n.tag button {\n  background: transparent;\n  border: none;\n  color: #888;\n  cursor: pointer;\n  padding: 0 4px;\n  font-size: 12px;\n}\n.tag button:hover {\n  color: #f44336;\n}\n.add-tag-row {\n  display: flex;\n  gap: 8px;\n}\n.add-tag-row input {\n  flex: 1;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  color: #e0e0e0;\n  padding: 8px 12px;\n  border-radius: 4px;\n  font-size: 13px;\n}\n.editor-footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding: 16px 20px;\n  background: #252525;\n  border-top: 1px solid #3d3d3d;\n}\n.cancel-btn {\n  background: transparent;\n  border: 1px solid #555;\n  color: #888;\n  padding: 10px 20px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  transition: all 0.15s;\n}\n.cancel-btn:hover {\n  background: #3d3d3d;\n  color: #fff;\n}\n.save-btn {\n  background: #0078d4;\n  border: none;\n  color: #fff;\n  padding: 10px 24px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 500;\n  transition: background 0.15s;\n}\n.save-btn:hover {\n  background: #1084d8;\n}\n.save-btn.global {\n  background: #b91c1c;\n}\n.save-btn.global:hover {\n  background: #dc2626;\n}\n.editor-content::-webkit-scrollbar {\n  width: 8px;\n}\n.editor-content::-webkit-scrollbar-track {\n  background: #1e1e1e;\n}\n.editor-content::-webkit-scrollbar-thumb {\n  background: #3d3d3d;\n  border-radius: 4px;\n}\n.editor-content::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n.macro-summary {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  background: #252525;\n  border: 1px solid #3a3a3a;\n  border-radius: 7px;\n  padding: 10px 12px;\n  margin-bottom: 10px;\n}\n.macro-summary-icon {\n  font-size: 1.4rem;\n  line-height: 1;\n}\n.macro-summary-info {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.macro-summary-info strong {\n  color: #e5e7eb;\n  font-size: 0.9rem;\n}\n.macro-meta {\n  color: #777;\n  font-size: 0.75rem;\n}\n.edit-macro-btn {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid #444;\n  color: #aaa;\n  padding: 5px 11px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.8rem;\n  transition: all 0.15s;\n}\n.edit-macro-btn:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ddd;\n}\n.remove-macro-btn {\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  color: #ef4444;\n  width: 28px;\n  height: 28px;\n  border-radius: 5px;\n  cursor: pointer;\n  font-size: 0.78rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n}\n.remove-macro-btn:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.macro-actions-row {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.add-btn.secondary {\n  border-color: #555;\n  color: #9ca3af;\n}\n.add-btn.secondary:hover {\n  border-color: #888;\n  color: #ddd;\n}\n.copy-library-panel {\n  background: #252525;\n  border: 1px solid #333;\n  border-radius: 7px;\n  padding: 12px;\n  margin-top: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.copy-library-panel h4 {\n  margin: 0 0 6px;\n  color: #ccc;\n  font-size: 0.8rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.copy-library-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid #3a3a3a;\n  border-radius: 5px;\n  padding: 7px 10px;\n  cursor: pointer;\n  text-align: left;\n  color: #e5e7eb;\n  font-size: 0.85rem;\n  transition: all 0.15s;\n}\n.copy-library-item:hover {\n  background: rgba(255, 255, 255, 0.09);\n  border-color: #555;\n}\n.cancel-btn.small {\n  padding: 5px 12px;\n  font-size: 0.8rem;\n}\n.script-editor-host {\n  height: 320px;\n  margin-top: 4px;\n}\n/*# sourceMappingURL=status-effect-editor.component.css.map */\n"] }]
  }], null, { statusEffect: [{
    type: Input
  }], availableMacros: [{
    type: Input
  }], allowGlobalSave: [{
    type: Input
  }], save: [{
    type: Output
  }], saveGlobal: [{
    type: Output
  }], cancel: [{
    type: Output
  }], delete: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(StatusEffectEditorComponent, { className: "StatusEffectEditorComponent", filePath: "app/shared/status-effect-editor/status-effect-editor.component.ts", lineNumber: 19 });
})();

export {
  StatusEffectEditorComponent
};
//# sourceMappingURL=chunk-VCDOFVI7.js.map
