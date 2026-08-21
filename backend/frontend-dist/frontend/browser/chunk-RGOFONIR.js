import {
  AuthService,
  UserApiService
} from "./chunk-GPFFHOI7.js";
import {
  createEmptyWorld
} from "./chunk-4YEN6ADO.js";
import {
  CharacterApiService,
  WorldApiService
} from "./chunk-YTW6ZOS6.js";
import {
  createEmptySheet
} from "./chunk-U6IPOXKZ.js";
import "./chunk-SVTPZQLG.js";
import {
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgModel
} from "./chunk-VMGRJE2Y.js";
import "./chunk-VMYLUGMS.js";
import {
  Router
} from "./chunk-V6FR55FP.js";
import "./chunk-YJYDFJW3.js";
import {
  CommonModule
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-XJL25EXC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/home/home.component.ts
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.name;
function HomeComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 1);
    \u0275\u0275element(1, "span", 3);
    \u0275\u0275text(2, " Lade\u2026");
    \u0275\u0275elementEnd();
  }
}
function HomeComponent_Conditional_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 5)(1, "h2");
    \u0275\u0275text(2, "Ersten Admin erstellen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 7);
    \u0275\u0275text(4, "Es gibt noch keine Nutzer. Der erste Nutzer wird zum Admin.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 8);
    \u0275\u0275twoWayListener("ngModelChange", function HomeComponent_Conditional_2_Conditional_3_Template_input_ngModelChange_5_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.bootstrapName, $event) || (ctx_r1.bootstrapName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.enter", function HomeComponent_Conditional_2_Conditional_3_Template_input_keydown_enter_5_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.doBootstrap());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 9);
    \u0275\u0275listener("click", function HomeComponent_Conditional_2_Conditional_3_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.doBootstrap());
    });
    \u0275\u0275text(7, " Admin werden ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.bootstrapName);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.busy() || !ctx_r1.bootstrapName.trim());
  }
}
function HomeComponent_Conditional_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 5)(1, "h2");
    \u0275\u0275text(2, "Anmelden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "p", 7);
    \u0275\u0275text(4, "Name und Beitritts-Code (vom Admin erhalten).");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "input", 10);
    \u0275\u0275twoWayListener("ngModelChange", function HomeComponent_Conditional_2_Conditional_4_Template_input_ngModelChange_5_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.loginName, $event) || (ctx_r1.loginName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.enter", function HomeComponent_Conditional_2_Conditional_4_Template_input_keydown_enter_5_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.doLogin());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 11);
    \u0275\u0275twoWayListener("ngModelChange", function HomeComponent_Conditional_2_Conditional_4_Template_input_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.loginCode, $event) || (ctx_r1.loginCode = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.enter", function HomeComponent_Conditional_2_Conditional_4_Template_input_keydown_enter_6_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.doLogin());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 9);
    \u0275\u0275listener("click", function HomeComponent_Conditional_2_Conditional_4_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.doLogin());
    });
    \u0275\u0275text(8, " Anmelden ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.loginName);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.loginCode);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.busy() || !ctx_r1.loginName.trim() || !ctx_r1.loginCode.trim());
  }
}
function HomeComponent_Conditional_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 6);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.authError());
  }
}
function HomeComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2)(1, "h1", 4);
    \u0275\u0275text(2, "\u2694\uFE0F 22Fail");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, HomeComponent_Conditional_2_Conditional_3_Template, 8, 2, "div", 5)(4, HomeComponent_Conditional_2_Conditional_4_Template, 9, 3, "div", 5);
    \u0275\u0275conditionalCreate(5, HomeComponent_Conditional_2_Conditional_5_Template, 2, 1, "div", 6);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r1.needsBootstrap() ? 3 : 4);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.authError() ? 5 : -1);
  }
}
function HomeComponent_Conditional_3_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 15);
    \u0275\u0275text(1, "Admin");
    \u0275\u0275elementEnd();
  }
}
function HomeComponent_Conditional_3_For_15_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 27);
  }
  if (rf & 2) {
    const c_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", c_r6.portrait, \u0275\u0275sanitizeUrl);
  }
}
function HomeComponent_Conditional_3_For_15_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 28);
    \u0275\u0275text(1, "\u{1F9D1}");
    \u0275\u0275elementEnd();
  }
}
function HomeComponent_Conditional_3_For_15_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "span", 31);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 32);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_For_15_Conditional_6_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r7);
      const c_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openLobby(c_r6.worldName));
    });
    \u0275\u0275text(4, "Lobby");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 32);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_For_15_Conditional_6_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r7);
      const c_r6 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openMap(c_r6.worldName));
    });
    \u0275\u0275text(6, "Karte");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const c_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u{1F30D} ", c_r6.worldName);
  }
}
function HomeComponent_Conditional_3_For_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 20)(1, "button", 26);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_For_15_Template_button_click_1_listener() {
      const c_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSheet(c_r6.id));
    });
    \u0275\u0275conditionalCreate(2, HomeComponent_Conditional_3_For_15_Conditional_2_Template, 1, 1, "img", 27)(3, HomeComponent_Conditional_3_For_15_Conditional_3_Template, 2, 0, "span", 28);
    \u0275\u0275elementStart(4, "span", 29);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, HomeComponent_Conditional_3_For_15_Conditional_6_Template, 7, 1, "div", 30);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r6 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275conditional(c_r6.portrait ? 2 : 3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(c_r6.name || c_r6.id);
    \u0275\u0275advance();
    \u0275\u0275conditional(c_r6.worldName ? 6 : -1);
  }
}
function HomeComponent_Conditional_3_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 7);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Noch keine Welten", ctx_r1.isAdmin() ? "" : " \u2014 dein GM muss deinen Charakter einer Welt hinzuf\xFCgen.");
  }
}
function HomeComponent_Conditional_3_For_27_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 34);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_For_27_Conditional_8_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r10);
      const w_r9 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openWorld(w_r9.name));
    });
    \u0275\u0275text(1, "GM");
    \u0275\u0275elementEnd();
  }
}
function HomeComponent_Conditional_3_For_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 24)(1, "span", 29);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 30)(4, "button", 32);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_For_27_Template_button_click_4_listener() {
      const w_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openLobby(w_r9.name));
    });
    \u0275\u0275text(5, "Lobby");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 32);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_For_27_Template_button_click_6_listener() {
      const w_r9 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openMap(w_r9.name));
    });
    \u0275\u0275text(7, "Karte");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, HomeComponent_Conditional_3_For_27_Conditional_8_Template, 2, 0, "button", 33);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const w_r9 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\u{1F30D} ", w_r9.name);
    \u0275\u0275advance(6);
    \u0275\u0275conditional(ctx_r1.isAdmin() ? 8 : -1);
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 15);
    \u0275\u0275text(1, "Du");
    \u0275\u0275elementEnd();
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 51);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_10_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r15);
      const u_r14 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.toggleAdmin(u_r14));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const u_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(u_r14.isAdmin ? "Admin \u2713" : "Spieler");
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 52);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_12_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r16);
      const u_r14 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.deleteUser(u_r14));
    });
    \u0275\u0275text(1, "\u2715");
    \u0275\u0275elementEnd();
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "td")(4, "code", 47);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 48);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Template_button_click_6_listener() {
      const u_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r1.regenerateCode(u_r14));
    });
    \u0275\u0275text(7, "\u21BB");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "td");
    \u0275\u0275conditionalCreate(9, HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_9_Template, 2, 0, "span", 15)(10, HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_10_Template, 2, 1, "button", 49);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "td");
    \u0275\u0275conditionalCreate(12, HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Conditional_12_Template, 2, 0, "button", 50);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const u_r14 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(u_r14.name);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(u_r14.joinCode);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(u_r14.id === ctx_r1.user().id ? 9 : 10);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(u_r14.id !== ctx_r1.user().id ? 12 : -1);
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 39)(1, "div", 35)(2, "label");
    \u0275\u0275text(3, "Neuer Nutzer");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function HomeComponent_Conditional_3_Conditional_28_Conditional_13_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r1.newUserName, $event) || (ctx_r1.newUserName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.enter", function HomeComponent_Conditional_3_Conditional_28_Conditional_13_Template_input_keydown_enter_4_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.createUser());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 9);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_Conditional_13_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.createUser());
    });
    \u0275\u0275text(6, "Erstellen");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "table", 46)(8, "thead")(9, "tr")(10, "th");
    \u0275\u0275text(11, "Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "th");
    \u0275\u0275text(13, "Beitritts-Code");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "th");
    \u0275\u0275text(15, "Rolle");
    \u0275\u0275elementEnd();
    \u0275\u0275element(16, "th");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "tbody");
    \u0275\u0275repeaterCreate(18, HomeComponent_Conditional_3_Conditional_28_Conditional_13_For_19_Template, 13, 4, "tr", null, _forTrack0);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newUserName);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.busy() || !ctx_r1.newUserName.trim());
    \u0275\u0275advance(13);
    \u0275\u0275repeater(ctx_r1.users());
  }
}
function HomeComponent_Conditional_3_Conditional_28_For_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 53);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_For_20_Template_button_click_0_listener() {
      let tmp_13_0;
      const c_r18 = \u0275\u0275restoreView(_r17).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.assignTarget.set(((tmp_13_0 = ctx_r1.assignTarget()) == null ? null : tmp_13_0.id) === c_r18.id ? null : c_r18));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_12_0;
    const c_r18 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ((tmp_12_0 = ctx_r1.assignTarget()) == null ? null : tmp_12_0.id) === c_r18.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", c_r18.name || c_r18.id, " ");
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_21_For_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 55)(1, "input", 56);
    \u0275\u0275listener("change", function HomeComponent_Conditional_3_Conditional_28_Conditional_21_For_4_Template_input_change_1_listener() {
      const u_r20 = \u0275\u0275restoreView(_r19).$implicit;
      const t_r21 = \u0275\u0275nextContext();
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.toggleControl(t_r21, u_r20));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const u_r20 = ctx.$implicit;
    const t_r21 = \u0275\u0275nextContext();
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r1.userControls(t_r21, u_r20));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", u_r20.name, " ");
  }
}
function HomeComponent_Conditional_3_Conditional_28_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 44)(1, "div", 54);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(3, HomeComponent_Conditional_3_Conditional_28_Conditional_21_For_4_Template, 3, 2, "label", 55, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r21 = ctx;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Wer kontrolliert \u201E", t_r21.name || t_r21.id, "\u201C?");
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.users());
  }
}
function HomeComponent_Conditional_3_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "section", 25)(1, "div", 18)(2, "h2");
    \u0275\u0275text(3, "\u2699\uFE0F Admin");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 35)(5, "label");
    \u0275\u0275text(6, "Neue Welt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function HomeComponent_Conditional_3_Conditional_28_Template_input_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.newWorldName, $event) || (ctx_r1.newWorldName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.enter", function HomeComponent_Conditional_3_Conditional_28_Template_input_keydown_enter_7_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.createWorld());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 37);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.createWorld());
    });
    \u0275\u0275text(9, "Welt erstellen");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 35)(11, "button", 38);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Conditional_28_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r11);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.showUserManager.set(!ctx_r1.showUserManager()));
    });
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(13, HomeComponent_Conditional_3_Conditional_28_Conditional_13_Template, 20, 2, "div", 39);
    \u0275\u0275elementStart(14, "div", 40)(15, "label");
    \u0275\u0275text(16, "Charakter-Kontrolle zuweisen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "div", 41)(18, "div", 42);
    \u0275\u0275repeaterCreate(19, HomeComponent_Conditional_3_Conditional_28_For_20_Template, 2, 3, "button", 43, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(21, HomeComponent_Conditional_3_Conditional_28_Conditional_21_Template, 5, 1, "div", 44);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_7_0;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newWorldName);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.newWorldName.trim());
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2(" ", ctx_r1.showUserManager() ? "\u25BE" : "\u25B8", " Nutzer verwalten (", ctx_r1.users().length, ") ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showUserManager() ? 13 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275repeater(ctx_r1.allCharacters());
    \u0275\u0275advance(2);
    \u0275\u0275conditional((tmp_7_0 = ctx_r1.assignTarget()) ? 21 : -1, tmp_7_0);
  }
}
function HomeComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "header", 12)(1, "div", 13)(2, "span", 14);
    \u0275\u0275text(3, "Hallo, ");
    \u0275\u0275elementStart(4, "strong");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, HomeComponent_Conditional_3_Conditional_6_Template, 2, 0, "span", 15);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 16);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.switchUser());
    });
    \u0275\u0275text(8, "Nutzer wechseln");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "section", 17)(10, "div", 18)(11, "h2");
    \u0275\u0275text(12, "Deine Charaktere");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "div", 19);
    \u0275\u0275repeaterCreate(14, HomeComponent_Conditional_3_For_15_Template, 7, 3, "div", 20, _forTrack0);
    \u0275\u0275elementStart(16, "div", 21)(17, "input", 22);
    \u0275\u0275twoWayListener("ngModelChange", function HomeComponent_Conditional_3_Template_input_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newCharName, $event) || (ctx_r1.newCharName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keydown.enter", function HomeComponent_Conditional_3_Template_input_keydown_enter_17_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.createCharacter());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "button", 23);
    \u0275\u0275listener("click", function HomeComponent_Conditional_3_Template_button_click_18_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.createCharacter());
    });
    \u0275\u0275text(19, " + Erstellen ");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(20, "section", 17)(21, "div", 18)(22, "h2");
    \u0275\u0275text(23);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(24, HomeComponent_Conditional_3_Conditional_24_Template, 2, 1, "p", 7);
    \u0275\u0275elementStart(25, "div", 19);
    \u0275\u0275repeaterCreate(26, HomeComponent_Conditional_3_For_27_Template, 9, 2, "div", 24, _forTrack1);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(28, HomeComponent_Conditional_3_Conditional_28_Template, 22, 6, "section", 25);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.user().name);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isAdmin() ? 6 : -1);
    \u0275\u0275advance(8);
    \u0275\u0275repeater(ctx_r1.myCharacters());
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newCharName);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.newCharName.trim());
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.isAdmin() ? "Welten" : "Deine Welten");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.myWorlds().length === 0 ? 24 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.myWorlds());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.isAdmin() ? 28 : -1);
  }
}
var HomeComponent = class _HomeComponent {
  auth = inject(AuthService);
  userApi = inject(UserApiService);
  characterApi = inject(CharacterApiService);
  worldApi = inject(WorldApiService);
  router = inject(Router);
  // Auth state (from AuthService signals)
  loading = this.auth.loading;
  user = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;
  // Identify screen
  needsBootstrap = signal(false, ...ngDevMode ? [{ debugName: "needsBootstrap" }] : []);
  loginName = "";
  loginCode = "";
  bootstrapName = "";
  authError = signal("", ...ngDevMode ? [{ debugName: "authError" }] : []);
  busy = signal(false, ...ngDevMode ? [{ debugName: "busy" }] : []);
  // Dashboard data
  characters = signal([], ...ngDevMode ? [{ debugName: "characters" }] : []);
  worlds = signal([], ...ngDevMode ? [{ debugName: "worlds" }] : []);
  users = signal([], ...ngDevMode ? [{ debugName: "users" }] : []);
  // New-thing inputs
  newCharName = "";
  newWorldName = "";
  newUserName = "";
  showUserManager = signal(false, ...ngDevMode ? [{ debugName: "showUserManager" }] : []);
  assignTarget = signal(null, ...ngDevMode ? [{ debugName: "assignTarget" }] : []);
  myCharacters = computed(() => {
    const uid = this.user()?.id;
    if (!uid)
      return [];
    return this.characters().filter((c) => (c.controllerUserIds ?? []).includes(uid));
  }, ...ngDevMode ? [{ debugName: "myCharacters" }] : []);
  /** Worlds to show: all for admin, else worlds where I control a character. */
  myWorlds = computed(() => {
    if (this.isAdmin())
      return this.worlds();
    const myCharIds = new Set(this.myCharacters().map((c) => c.id));
    const myWorldNames = new Set(this.myCharacters().map((c) => c.worldName).filter(Boolean));
    return this.worlds().filter((w) => myWorldNames.has(w.name) || w.characterIds.some((id) => myCharIds.has(id)));
  }, ...ngDevMode ? [{ debugName: "myWorlds" }] : []);
  /** All characters (admin view — for assigning control). */
  allCharacters = computed(() => this.characters(), ...ngDevMode ? [{ debugName: "allCharacters" }] : []);
  constructor() {
    effect(() => {
      const u = this.user();
      if (u)
        this.loadDashboard();
      else if (!this.loading())
        this.refreshStatus();
    });
  }
  async refreshStatus() {
    try {
      const s = await this.auth.status();
      this.needsBootstrap.set(s.needsBootstrap);
    } catch {
    }
  }
  async loadDashboard() {
    try {
      const [chars, worlds] = await Promise.all([
        this.characterApi.getCharacterSummaries(),
        this.worldApi.listWorlds()
      ]);
      this.characters.set(chars);
      this.worlds.set(worlds);
      if (this.isAdmin())
        this.users.set(await this.userApi.list().catch(() => []));
    } catch {
    }
  }
  // ── Identify ──
  async doLogin() {
    this.authError.set("");
    if (!this.loginName.trim() || !this.loginCode.trim())
      return;
    this.busy.set(true);
    try {
      await this.auth.login(this.loginName.trim(), this.loginCode.trim());
    } catch {
      this.authError.set("Name oder Code ist nicht korrekt.");
    } finally {
      this.busy.set(false);
    }
  }
  async doBootstrap() {
    this.authError.set("");
    if (!this.bootstrapName.trim())
      return;
    this.busy.set(true);
    try {
      await this.auth.bootstrapFirstAdmin(this.bootstrapName.trim());
    } catch {
      this.authError.set("Konnte den ersten Admin nicht erstellen (existiert bereits?).");
      this.refreshStatus();
    } finally {
      this.busy.set(false);
    }
  }
  switchUser() {
    this.auth.logout();
    this.characters.set([]);
    this.worlds.set([]);
    this.users.set([]);
    this.loginName = "";
    this.loginCode = "";
    this.refreshStatus();
  }
  // ── Characters ──
  sanitize(s) {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "char";
  }
  async createCharacter() {
    const name = this.newCharName.trim();
    if (!name)
      return;
    const id = `${this.sanitize(name)}_${Date.now()}`;
    const sheet = createEmptySheet();
    sheet.id = id;
    sheet.name = name;
    const uid = this.user()?.id;
    if (uid)
      sheet.controllerUserIds = [uid];
    await this.characterApi.saveCharacter(id, sheet);
    this.newCharName = "";
    this.router.navigate(["/characters", id]);
  }
  openSheet(id) {
    this.router.navigate(["/characters", id]);
  }
  openLobby(world) {
    this.router.navigate(["/lobby", world]);
  }
  openMap(world) {
    this.router.navigate(["/world-map", world]);
  }
  openWorld(world) {
    this.router.navigate(["/world", world]);
  }
  // ── Admin: worlds ──
  async createWorld() {
    const name = this.newWorldName.trim();
    if (!name || !this.isAdmin())
      return;
    const world = createEmptyWorld(name);
    await this.worldApi.saveWorld(name, world);
    this.newWorldName = "";
    await this.loadDashboard();
    this.openWorld(name);
  }
  // ── Admin: users ──
  async createUser() {
    const name = this.newUserName.trim();
    if (!name || !this.isAdmin())
      return;
    this.busy.set(true);
    try {
      await this.userApi.create(name);
      this.newUserName = "";
      this.users.set(await this.userApi.list());
    } finally {
      this.busy.set(false);
    }
  }
  async toggleAdmin(u) {
    if (!this.isAdmin() || u.id === this.user()?.id)
      return;
    await this.userApi.update(u.id, { isAdmin: !u.isAdmin });
    this.users.set(await this.userApi.list());
  }
  async regenerateCode(u) {
    if (!this.isAdmin())
      return;
    await this.userApi.update(u.id, { regenerateCode: true });
    this.users.set(await this.userApi.list());
  }
  async deleteUser(u) {
    if (!this.isAdmin() || u.id === this.user()?.id)
      return;
    if (!confirm(`Nutzer "${u.name}" l\xF6schen?`))
      return;
    await this.userApi.remove(u.id);
    this.users.set(await this.userApi.list());
  }
  // ── Admin: assign character control ──
  userControls(c, u) {
    return (c.controllerUserIds ?? []).includes(u.id);
  }
  async toggleControl(c, u) {
    if (!this.isAdmin())
      return;
    const set = new Set(c.controllerUserIds ?? []);
    if (set.has(u.id))
      set.delete(u.id);
    else
      set.add(u.id);
    const ids = [...set];
    await this.characterApi.setControllers(c.id, ids);
    this.characters.set(this.characters().map((x) => x.id === c.id ? __spreadProps(__spreadValues({}, x), { controllerUserIds: ids }) : x));
    const t = this.assignTarget();
    if (t && t.id === c.id)
      this.assignTarget.set(__spreadProps(__spreadValues({}, t), { controllerUserIds: ids }));
  }
  static \u0275fac = function HomeComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _HomeComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _HomeComponent, selectors: [["app-home"]], decls: 4, vars: 1, consts: [[1, "home"], [1, "center-card"], [1, "identify"], [1, "spinner"], [1, "brand"], [1, "auth-card"], [1, "auth-error"], [1, "muted"], ["placeholder", "Dein Name", 1, "fld", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "btn", "primary", 3, "click", "disabled"], ["placeholder", "Name", 1, "fld", 3, "ngModelChange", "keydown.enter", "ngModel"], ["placeholder", "Code, z. B. swift-fox-72", 1, "fld", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "top"], [1, "who"], [1, "hi"], [1, "badge", "admin"], [1, "btn", "ghost", 3, "click"], [1, "panel"], [1, "panel-head"], [1, "grid"], [1, "card", "char"], [1, "card", "create"], ["placeholder", "Neuer Charakter\u2026", 1, "fld", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "btn", "primary", "sm", 3, "click", "disabled"], [1, "card", "world"], [1, "panel", "admin-panel"], [1, "card-main", 3, "click"], ["alt", "", 1, "pic", 3, "src"], [1, "pic", "ph"], [1, "card-name"], [1, "jump"], [1, "jump-lbl"], [1, "chip", 3, "click"], [1, "chip", "gm"], [1, "chip", "gm", 3, "click"], [1, "admin-row"], ["placeholder", "Weltname\u2026", 1, "fld", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "btn", 3, "click", "disabled"], [1, "btn", 3, "click"], [1, "user-manager"], [1, "admin-row", "col"], [1, "assign"], [1, "assign-list"], [1, "assign-item", 3, "active"], [1, "assign-users"], ["placeholder", "Name\u2026", 1, "fld", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "users"], [1, "code"], ["title", "Neuen Code erzeugen", 1, "mini", 3, "click"], [1, "mini"], [1, "mini", "danger"], [1, "mini", 3, "click"], [1, "mini", "danger", 3, "click"], [1, "assign-item", 3, "click"], [1, "assign-title"], [1, "assign-user"], ["type", "checkbox", 3, "change", "checked"]], template: function HomeComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275conditionalCreate(1, HomeComponent_Conditional_1_Template, 3, 0, "div", 1)(2, HomeComponent_Conditional_2_Template, 6, 2, "div", 2)(3, HomeComponent_Conditional_3_Template, 29, 7);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.loading() ? 1 : !ctx.user() ? 2 : 3);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NgControlStatus, NgModel], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  min-height: 100vh;\n  background: #0b1220;\n  color: #e5e7eb;\n}\n.home[_ngcontent-%COMP%] {\n  max-width: 1100px;\n  margin: 0 auto;\n  padding: 24px 20px 60px;\n}\n.center-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  min-height: 60vh;\n  color: #9ca3af;\n}\n.spinner[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  border: 2px solid #334155;\n  border-top-color: #8b5cf6;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n  display: inline-block;\n}\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.identify[_ngcontent-%COMP%] {\n  max-width: 380px;\n  margin: 10vh auto 0;\n  text-align: center;\n}\n.brand[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  font-weight: 900;\n  margin-bottom: 18px;\n}\n.auth-card[_ngcontent-%COMP%] {\n  background: #111827;\n  border: 1px solid #1f2937;\n  border-radius: 14px;\n  padding: 22px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  text-align: left;\n}\n.auth-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.15rem;\n}\n.muted[_ngcontent-%COMP%] {\n  color: #9ca3af;\n  font-size: 0.85rem;\n  margin: 0;\n}\n.auth-error[_ngcontent-%COMP%] {\n  margin-top: 12px;\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.12);\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  border-radius: 8px;\n  padding: 8px 10px;\n  font-size: 0.85rem;\n}\n.fld[_ngcontent-%COMP%] {\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 8px;\n  color: #f1f5f9;\n  padding: 9px 11px;\n  font-size: 0.9rem;\n  width: 100%;\n  box-sizing: border-box;\n}\n.fld[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #8b5cf6;\n}\n.btn[_ngcontent-%COMP%] {\n  background: #1f2937;\n  border: 1px solid #374151;\n  color: #e5e7eb;\n  border-radius: 8px;\n  padding: 8px 14px;\n  font-weight: 700;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  white-space: nowrap;\n}\n.btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #273449;\n}\n.btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.btn.primary[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.9);\n  border-color: #8b5cf6;\n  color: #fff;\n}\n.btn.primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #8b5cf6;\n}\n.btn.ghost[_ngcontent-%COMP%] {\n  background: none;\n  border-color: #334155;\n}\n.btn.sm[_ngcontent-%COMP%] {\n  padding: 6px 10px;\n  font-size: 0.78rem;\n}\n.top[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 20px;\n  padding-bottom: 14px;\n  border-bottom: 1px solid #1f2937;\n}\n.who[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.hi[_ngcontent-%COMP%] {\n  font-size: 1.05rem;\n}\n.badge[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  font-weight: 800;\n  padding: 2px 7px;\n  border-radius: 999px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.badge.admin[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  color: #c4b5fd;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n}\n.panel[_ngcontent-%COMP%] {\n  margin-bottom: 26px;\n}\n.panel-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n.panel-head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1.05rem;\n  margin: 0;\n}\n.grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));\n  gap: 12px;\n}\n.card[_ngcontent-%COMP%] {\n  background: #111827;\n  border: 1px solid #1f2937;\n  border-radius: 12px;\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.card-main[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: inherit;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  text-align: left;\n  width: 100%;\n  padding: 0;\n}\n.pic[_ngcontent-%COMP%] {\n  width: 42px;\n  height: 42px;\n  border-radius: 8px;\n  object-fit: cover;\n  flex-shrink: 0;\n  background: #0f172a;\n}\n.pic.ph[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 22px;\n}\n.card-name[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.95rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.card.char[_ngcontent-%COMP%]:hover, \n.card.world[_ngcontent-%COMP%]:hover {\n  border-color: #374151;\n}\n.jump[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.jump-lbl[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #9ca3af;\n  margin-right: auto;\n}\n.chip[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.14);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  color: #c4b5fd;\n  border-radius: 6px;\n  padding: 3px 9px;\n  font-size: 0.72rem;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chip[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.28);\n}\n.chip.gm[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.14);\n  border-color: rgba(245, 158, 11, 0.4);\n  color: #fbbf24;\n}\n.card.create[_ngcontent-%COMP%] {\n  justify-content: center;\n  border-style: dashed;\n}\n.admin-panel[_ngcontent-%COMP%] {\n  background: #0f172a;\n  border: 1px solid #1f2937;\n  border-radius: 14px;\n  padding: 16px;\n}\n.admin-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n.admin-row.col[_ngcontent-%COMP%] {\n  flex-direction: column;\n  align-items: stretch;\n}\n.admin-row[_ngcontent-%COMP%]    > label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: #9ca3af;\n  min-width: 160px;\n}\n.admin-row[_ngcontent-%COMP%]   .fld[_ngcontent-%COMP%] {\n  max-width: 260px;\n}\n.user-manager[_ngcontent-%COMP%] {\n  margin: 4px 0 16px;\n}\n.users[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.85rem;\n}\n.users[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  text-align: left;\n  color: #9ca3af;\n  font-weight: 700;\n  padding: 6px 8px;\n  font-size: 0.72rem;\n  text-transform: uppercase;\n}\n.users[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 6px 8px;\n  border-top: 1px solid #1f2937;\n}\n.code[_ngcontent-%COMP%] {\n  background: #0b1220;\n  border: 1px solid #334155;\n  border-radius: 5px;\n  padding: 2px 6px;\n  color: #86efac;\n  font-family: ui-monospace, monospace;\n}\n.mini[_ngcontent-%COMP%] {\n  background: #1f2937;\n  border: 1px solid #374151;\n  color: #e5e7eb;\n  border-radius: 5px;\n  padding: 3px 8px;\n  font-size: 0.72rem;\n  cursor: pointer;\n}\n.mini[_ngcontent-%COMP%]:hover {\n  background: #273449;\n}\n.mini.danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.2);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.assign[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 14px;\n  flex-wrap: wrap;\n}\n.assign-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 180px;\n  max-height: 220px;\n  overflow-y: auto;\n}\n.assign-item[_ngcontent-%COMP%] {\n  background: #111827;\n  border: 1px solid #1f2937;\n  color: #e5e7eb;\n  border-radius: 6px;\n  padding: 6px 9px;\n  text-align: left;\n  cursor: pointer;\n  font-size: 0.82rem;\n}\n.assign-item.active[_ngcontent-%COMP%] {\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.assign-users[_ngcontent-%COMP%] {\n  background: #111827;\n  border: 1px solid #1f2937;\n  border-radius: 8px;\n  padding: 10px 12px;\n  min-width: 200px;\n}\n.assign-title[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: #9ca3af;\n  margin-bottom: 8px;\n}\n.assign-user[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 0.85rem;\n  padding: 3px 0;\n  cursor: pointer;\n}\n/*# sourceMappingURL=home.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HomeComponent, [{
    type: Component,
    args: [{ selector: "app-home", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="home">
  <!-- \u2500\u2500 Loading \u2500\u2500 -->
  @if (loading()) {
    <div class="center-card"><span class="spinner"></span> Lade\u2026</div>
  }

  <!-- \u2500\u2500 Identify (signed out) \u2500\u2500 -->
  @else if (!user()) {
    <div class="identify">
      <h1 class="brand">\u2694\uFE0F 22Fail</h1>

      @if (needsBootstrap()) {
        <div class="auth-card">
          <h2>Ersten Admin erstellen</h2>
          <p class="muted">Es gibt noch keine Nutzer. Der erste Nutzer wird zum Admin.</p>
          <input class="fld" [(ngModel)]="bootstrapName" placeholder="Dein Name"
                 (keydown.enter)="doBootstrap()" />
          <button class="btn primary" [disabled]="busy() || !bootstrapName.trim()" (click)="doBootstrap()">
            Admin werden
          </button>
        </div>
      } @else {
        <div class="auth-card">
          <h2>Anmelden</h2>
          <p class="muted">Name und Beitritts-Code (vom Admin erhalten).</p>
          <input class="fld" [(ngModel)]="loginName" placeholder="Name" (keydown.enter)="doLogin()" />
          <input class="fld" [(ngModel)]="loginCode" placeholder="Code, z. B. swift-fox-72"
                 (keydown.enter)="doLogin()" />
          <button class="btn primary" [disabled]="busy() || !loginName.trim() || !loginCode.trim()" (click)="doLogin()">
            Anmelden
          </button>
        </div>
      }

      @if (authError()) { <div class="auth-error">{{ authError() }}</div> }
    </div>
  }

  <!-- \u2500\u2500 Dashboard (signed in) \u2500\u2500 -->
  @else {
    <header class="top">
      <div class="who">
        <span class="hi">Hallo, <strong>{{ user()!.name }}</strong></span>
        @if (isAdmin()) { <span class="badge admin">Admin</span> }
      </div>
      <button class="btn ghost" (click)="switchUser()">Nutzer wechseln</button>
    </header>

    <!-- Your characters -->
    <section class="panel">
      <div class="panel-head">
        <h2>Deine Charaktere</h2>
      </div>
      <div class="grid">
        @for (c of myCharacters(); track c.id) {
          <div class="card char">
            <button class="card-main" (click)="openSheet(c.id)">
              @if (c.portrait) { <img class="pic" [src]="c.portrait" alt="" /> }
              @else { <span class="pic ph">\u{1F9D1}</span> }
              <span class="card-name">{{ c.name || c.id }}</span>
            </button>
            @if (c.worldName) {
              <div class="jump">
                <span class="jump-lbl">\u{1F30D} {{ c.worldName }}</span>
                <button class="chip" (click)="openLobby(c.worldName!)">Lobby</button>
                <button class="chip" (click)="openMap(c.worldName!)">Karte</button>
              </div>
            }
          </div>
        }
        <div class="card create">
          <input class="fld" [(ngModel)]="newCharName" placeholder="Neuer Charakter\u2026"
                 (keydown.enter)="createCharacter()" />
          <button class="btn primary sm" [disabled]="!newCharName.trim()" (click)="createCharacter()">
            + Erstellen
          </button>
        </div>
      </div>
    </section>

    <!-- Your worlds -->
    <section class="panel">
      <div class="panel-head"><h2>{{ isAdmin() ? 'Welten' : 'Deine Welten' }}</h2></div>
      @if (myWorlds().length === 0) {
        <p class="muted">Noch keine Welten{{ isAdmin() ? '' : ' \u2014 dein GM muss deinen Charakter einer Welt hinzuf\xFCgen.' }}</p>
      }
      <div class="grid">
        @for (w of myWorlds(); track w.name) {
          <div class="card world">
            <span class="card-name">\u{1F30D} {{ w.name }}</span>
            <div class="jump">
              <button class="chip" (click)="openLobby(w.name)">Lobby</button>
              <button class="chip" (click)="openMap(w.name)">Karte</button>
              @if (isAdmin()) { <button class="chip gm" (click)="openWorld(w.name)">GM</button> }
            </div>
          </div>
        }
      </div>
    </section>

    <!-- \u2500\u2500 Admin section \u2500\u2500 -->
    @if (isAdmin()) {
      <section class="panel admin-panel">
        <div class="panel-head"><h2>\u2699\uFE0F Admin</h2></div>

        <div class="admin-row">
          <label>Neue Welt</label>
          <input class="fld" [(ngModel)]="newWorldName" placeholder="Weltname\u2026" (keydown.enter)="createWorld()" />
          <button class="btn" [disabled]="!newWorldName.trim()" (click)="createWorld()">Welt erstellen</button>
        </div>

        <div class="admin-row">
          <button class="btn" (click)="showUserManager.set(!showUserManager())">
            {{ showUserManager() ? '\u25BE' : '\u25B8' }} Nutzer verwalten ({{ users().length }})
          </button>
        </div>

        @if (showUserManager()) {
          <div class="user-manager">
            <div class="admin-row">
              <label>Neuer Nutzer</label>
              <input class="fld" [(ngModel)]="newUserName" placeholder="Name\u2026" (keydown.enter)="createUser()" />
              <button class="btn primary" [disabled]="busy() || !newUserName.trim()" (click)="createUser()">Erstellen</button>
            </div>
            <table class="users">
              <thead><tr><th>Name</th><th>Beitritts-Code</th><th>Rolle</th><th></th></tr></thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td>{{ u.name }}</td>
                    <td><code class="code">{{ u.joinCode }}</code>
                        <button class="mini" (click)="regenerateCode(u)" title="Neuen Code erzeugen">\u21BB</button></td>
                    <td>
                      @if (u.id === user()!.id) { <span class="badge admin">Du</span> }
                      @else {
                        <button class="mini" (click)="toggleAdmin(u)">{{ u.isAdmin ? 'Admin \u2713' : 'Spieler' }}</button>
                      }
                    </td>
                    <td>
                      @if (u.id !== user()!.id) {
                        <button class="mini danger" (click)="deleteUser(u)">\u2715</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Assign character control -->
        <div class="admin-row col">
          <label>Charakter-Kontrolle zuweisen</label>
          <div class="assign">
            <div class="assign-list">
              @for (c of allCharacters(); track c.id) {
                <button class="assign-item" [class.active]="assignTarget()?.id === c.id"
                        (click)="assignTarget.set(assignTarget()?.id === c.id ? null : c)">
                  {{ c.name || c.id }}
                </button>
              }
            </div>
            @if (assignTarget(); as t) {
              <div class="assign-users">
                <div class="assign-title">Wer kontrolliert \u201E{{ t.name || t.id }}\u201C?</div>
                @for (u of users(); track u.id) {
                  <label class="assign-user">
                    <input type="checkbox" [checked]="userControls(t, u)" (change)="toggleControl(t, u)" />
                    {{ u.name }}
                  </label>
                }
              </div>
            }
          </div>
        </div>
      </section>
    }
  }
</div>
`, styles: ["/* src/app/home/home.component.css */\n:host {\n  display: block;\n  min-height: 100vh;\n  background: #0b1220;\n  color: #e5e7eb;\n}\n.home {\n  max-width: 1100px;\n  margin: 0 auto;\n  padding: 24px 20px 60px;\n}\n.center-card {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  min-height: 60vh;\n  color: #9ca3af;\n}\n.spinner {\n  width: 18px;\n  height: 18px;\n  border: 2px solid #334155;\n  border-top-color: #8b5cf6;\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n  display: inline-block;\n}\n@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.identify {\n  max-width: 380px;\n  margin: 10vh auto 0;\n  text-align: center;\n}\n.brand {\n  font-size: 2rem;\n  font-weight: 900;\n  margin-bottom: 18px;\n}\n.auth-card {\n  background: #111827;\n  border: 1px solid #1f2937;\n  border-radius: 14px;\n  padding: 22px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  text-align: left;\n}\n.auth-card h2 {\n  margin: 0;\n  font-size: 1.15rem;\n}\n.muted {\n  color: #9ca3af;\n  font-size: 0.85rem;\n  margin: 0;\n}\n.auth-error {\n  margin-top: 12px;\n  color: #fca5a5;\n  background: rgba(239, 68, 68, 0.12);\n  border: 1px solid rgba(239, 68, 68, 0.3);\n  border-radius: 8px;\n  padding: 8px 10px;\n  font-size: 0.85rem;\n}\n.fld {\n  background: #0f172a;\n  border: 1px solid #334155;\n  border-radius: 8px;\n  color: #f1f5f9;\n  padding: 9px 11px;\n  font-size: 0.9rem;\n  width: 100%;\n  box-sizing: border-box;\n}\n.fld:focus {\n  outline: none;\n  border-color: #8b5cf6;\n}\n.btn {\n  background: #1f2937;\n  border: 1px solid #374151;\n  color: #e5e7eb;\n  border-radius: 8px;\n  padding: 8px 14px;\n  font-weight: 700;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.15s;\n  white-space: nowrap;\n}\n.btn:hover:not(:disabled) {\n  background: #273449;\n}\n.btn:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.btn.primary {\n  background: rgba(139, 92, 246, 0.9);\n  border-color: #8b5cf6;\n  color: #fff;\n}\n.btn.primary:hover:not(:disabled) {\n  background: #8b5cf6;\n}\n.btn.ghost {\n  background: none;\n  border-color: #334155;\n}\n.btn.sm {\n  padding: 6px 10px;\n  font-size: 0.78rem;\n}\n.top {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 20px;\n  padding-bottom: 14px;\n  border-bottom: 1px solid #1f2937;\n}\n.who {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.hi {\n  font-size: 1.05rem;\n}\n.badge {\n  font-size: 0.62rem;\n  font-weight: 800;\n  padding: 2px 7px;\n  border-radius: 999px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.badge.admin {\n  background: rgba(139, 92, 246, 0.2);\n  color: #c4b5fd;\n  border: 1px solid rgba(139, 92, 246, 0.4);\n}\n.panel {\n  margin-bottom: 26px;\n}\n.panel-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n}\n.panel-head h2 {\n  font-size: 1.05rem;\n  margin: 0;\n}\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));\n  gap: 12px;\n}\n.card {\n  background: #111827;\n  border: 1px solid #1f2937;\n  border-radius: 12px;\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.card-main {\n  background: none;\n  border: none;\n  color: inherit;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  text-align: left;\n  width: 100%;\n  padding: 0;\n}\n.pic {\n  width: 42px;\n  height: 42px;\n  border-radius: 8px;\n  object-fit: cover;\n  flex-shrink: 0;\n  background: #0f172a;\n}\n.pic.ph {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 22px;\n}\n.card-name {\n  font-weight: 700;\n  font-size: 0.95rem;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.card.char:hover,\n.card.world:hover {\n  border-color: #374151;\n}\n.jump {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.jump-lbl {\n  font-size: 0.72rem;\n  color: #9ca3af;\n  margin-right: auto;\n}\n.chip {\n  background: rgba(139, 92, 246, 0.14);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  color: #c4b5fd;\n  border-radius: 6px;\n  padding: 3px 9px;\n  font-size: 0.72rem;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chip:hover {\n  background: rgba(139, 92, 246, 0.28);\n}\n.chip.gm {\n  background: rgba(245, 158, 11, 0.14);\n  border-color: rgba(245, 158, 11, 0.4);\n  color: #fbbf24;\n}\n.card.create {\n  justify-content: center;\n  border-style: dashed;\n}\n.admin-panel {\n  background: #0f172a;\n  border: 1px solid #1f2937;\n  border-radius: 14px;\n  padding: 16px;\n}\n.admin-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n.admin-row.col {\n  flex-direction: column;\n  align-items: stretch;\n}\n.admin-row > label {\n  font-size: 0.8rem;\n  color: #9ca3af;\n  min-width: 160px;\n}\n.admin-row .fld {\n  max-width: 260px;\n}\n.user-manager {\n  margin: 4px 0 16px;\n}\n.users {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.85rem;\n}\n.users th {\n  text-align: left;\n  color: #9ca3af;\n  font-weight: 700;\n  padding: 6px 8px;\n  font-size: 0.72rem;\n  text-transform: uppercase;\n}\n.users td {\n  padding: 6px 8px;\n  border-top: 1px solid #1f2937;\n}\n.code {\n  background: #0b1220;\n  border: 1px solid #334155;\n  border-radius: 5px;\n  padding: 2px 6px;\n  color: #86efac;\n  font-family: ui-monospace, monospace;\n}\n.mini {\n  background: #1f2937;\n  border: 1px solid #374151;\n  color: #e5e7eb;\n  border-radius: 5px;\n  padding: 3px 8px;\n  font-size: 0.72rem;\n  cursor: pointer;\n}\n.mini:hover {\n  background: #273449;\n}\n.mini.danger:hover {\n  background: rgba(239, 68, 68, 0.2);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.assign {\n  display: flex;\n  gap: 14px;\n  flex-wrap: wrap;\n}\n.assign-list {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  min-width: 180px;\n  max-height: 220px;\n  overflow-y: auto;\n}\n.assign-item {\n  background: #111827;\n  border: 1px solid #1f2937;\n  color: #e5e7eb;\n  border-radius: 6px;\n  padding: 6px 9px;\n  text-align: left;\n  cursor: pointer;\n  font-size: 0.82rem;\n}\n.assign-item.active {\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.assign-users {\n  background: #111827;\n  border: 1px solid #1f2937;\n  border-radius: 8px;\n  padding: 10px 12px;\n  min-width: 200px;\n}\n.assign-title {\n  font-size: 0.8rem;\n  color: #9ca3af;\n  margin-bottom: 8px;\n}\n.assign-user {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 0.85rem;\n  padding: 3px 0;\n  cursor: pointer;\n}\n/*# sourceMappingURL=home.component.css.map */\n"] }]
  }], () => [], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(HomeComponent, { className: "HomeComponent", filePath: "app/home/home.component.ts", lineNumber: 26 });
})();
export {
  HomeComponent
};
//# sourceMappingURL=chunk-RGOFONIR.js.map
