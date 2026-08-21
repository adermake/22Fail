import {
  scaledVolume
} from "./chunk-RAWCOLGX.js";
import {
  lookup
} from "./chunk-J3D7AX2Y.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MinValidator,
  NgControlStatus,
  NgModel,
  NumberValueAccessor
} from "./chunk-VMGRJE2Y.js";
import {
  identityAuth
} from "./chunk-VMYLUGMS.js";
import {
  CommonModule,
  NgForOf
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injectable,
  Input,
  Output,
  Subject,
  inject,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵcomponentInstance,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
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

// src/app/services/character-socket.service.ts
var CharacterSocketService = class _CharacterSocketService {
  socket;
  patchSubject = new Subject();
  lootReceivedSubject = new Subject();
  battleLootReceivedSubject = new Subject();
  localUpdateSubject = new Subject();
  patches$ = this.patchSubject.asObservable();
  lootReceived$ = this.lootReceivedSubject.asObservable();
  battleLootReceived$ = this.battleLootReceivedSubject.asObservable();
  /** Fires immediately when the local UI mutates character data (before server echo). */
  localUpdate$ = this.localUpdateSubject.asObservable();
  notifyLocalUpdate() {
    this.localUpdateSubject.next();
  }
  connect() {
    if (this.socket)
      return;
    this.socket = lookup(window.location.origin, {
      path: "/socket.io",
      auth: identityAuth(),
      transports: ["websocket"]
    });
    this.socket.on("characterPatched", (data) => {
      this.patchSubject.next(data);
    });
    this.socket.on("lootReceived", (loot) => {
      this.lootReceivedSubject.next(loot);
    });
    this.socket.on("battleLootReceived", (data) => {
      this.battleLootReceivedSubject.next(data);
    });
  }
  joinCharacter(characterId) {
    this.socket?.emit("joinCharacter", characterId);
  }
  sendPatch(characterId, patch) {
    console.log("Sending patch " + JSON.stringify(patch));
    this.socket?.emit("patchCharacter", { characterId, patch });
  }
  static \u0275fac = function CharacterSocketService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CharacterSocketService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CharacterSocketService, factory: _CharacterSocketService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CharacterSocketService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/services/world-socket.service.ts
var WorldSocketService = class _WorldSocketService {
  socket;
  patchSubject = new Subject();
  lootReceivedSubject = new Subject();
  battleLootReceivedSubject = new Subject();
  connectionReadySubject = new Subject();
  diceRollSubject = new Subject();
  isConnected = false;
  /** Rolling buffer of the last 100 received dice roll events (survives tab open/close) */
  _rollBuffer = [];
  get rollBuffer() {
    return this._rollBuffer;
  }
  patches$ = this.patchSubject.asObservable();
  lootReceived$ = this.lootReceivedSubject.asObservable();
  battleLootReceived$ = this.battleLootReceivedSubject.asObservable();
  connectionReady$ = this.connectionReadySubject.asObservable();
  diceRoll$ = this.diceRollSubject.asObservable();
  connect() {
    if (this.socket) {
      console.log("[WORLD SOCKET] Already connected");
      if (this.isConnected) {
        this.connectionReadySubject.next();
      }
      return;
    }
    console.log("[WORLD SOCKET] Connecting to:", window.location.origin);
    this.socket = lookup(window.location.origin, {
      path: "/socket.io",
      auth: identityAuth(),
      transports: ["websocket"]
    });
    this.socket.on("connect", () => {
      console.log("[WORLD SOCKET] Connected! Socket ID:", this.socket?.id);
      this.isConnected = true;
      this.connectionReadySubject.next();
    });
    this.socket.on("disconnect", (reason) => {
      console.log("[WORLD SOCKET] Disconnected. Reason:", reason);
      this.isConnected = false;
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        console.warn("[WORLD SOCKET] Socket disconnected! This may be due to large message size.");
      }
    });
    this.socket.on("connect_error", (error) => {
      console.error("[WORLD SOCKET] Connection error:", error);
    });
    this.socket.on("worldPatched", (patch) => {
      console.log("[WORLD SOCKET] Received worldPatched:", patch);
      this.patchSubject.next(patch);
    });
    this.socket.on("lootReceived", (loot) => {
      this.lootReceivedSubject.next(loot);
    });
    this.socket.on("battleLootReceived", (loot) => {
      this.battleLootReceivedSubject.next(loot);
    });
    this.socket.on("diceRolled", (roll) => {
      console.log("[WORLD SOCKET] Received diceRolled:", roll);
      this._rollBuffer = [roll, ...this._rollBuffer.slice(0, 99)];
      this.diceRollSubject.next(roll);
    });
  }
  async joinWorld(worldName) {
    if (!this.isConnected) {
      console.log("[WORLD SOCKET] Waiting for connection before joining world:", worldName);
      await new Promise((resolve) => {
        const sub = this.connectionReady$.subscribe(() => {
          sub.unsubscribe();
          resolve();
        });
      });
    }
    console.log("[WORLD SOCKET] Joining world:", worldName);
    this.socket?.emit("joinWorld", worldName);
  }
  sendPatch(worldName, patch) {
    this.socket?.emit("patchWorld", { worldName, patch });
  }
  claimBattleLoot(worldName, lootId) {
    console.log("Claiming battle loot:", lootId);
    this.socket?.emit("claimBattleLoot", { worldName, lootId });
  }
  revealBattleLoot(worldName) {
    console.log("Revealing battle loot for:", worldName);
    this.socket?.emit("revealBattleLoot", { worldName });
  }
  sendDirectLoot(characterId, loot) {
    console.log("Sending direct loot to:", characterId, loot);
    this.socket?.emit("sendDirectLoot", { characterId, loot });
  }
  sendDiceRoll(roll) {
    console.log("[WORLD SOCKET] Sending dice roll:", roll);
    this.socket?.emit("diceRoll", roll);
  }
  static \u0275fac = function WorldSocketService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WorldSocketService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _WorldSocketService, factory: _WorldSocketService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WorldSocketService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/world/damage-calculator/damage-calculator.component.ts
var _forTrack0 = ($index, $item) => $item.label;
function DamageCalculatorComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 26);
    \u0275\u0275listener("click", function DamageCalculatorComponent_Conditional_4_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.close.emit());
    });
    \u0275\u0275text(1, "\u2715");
    \u0275\u0275elementEnd();
  }
}
function DamageCalculatorComponent_button_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 27);
    \u0275\u0275listener("click", function DamageCalculatorComponent_button_19_Template_button_click_0_listener() {
      const s_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.selectSeverity(s_r4));
    });
    \u0275\u0275elementStart(1, "span", 28);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 29);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const s_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("--sev-color", s_r4.color);
    \u0275\u0275classProp("selected", s_r4 === ctx_r1.selectedSeverity);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r4.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getSeverityDisplay(s_r4));
  }
}
function DamageCalculatorComponent_For_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 30)(1, "span", 31);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 32);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const t_r5 = ctx.$implicit;
    \u0275\u0275styleProp("--tc", t_r5.color);
    \u0275\u0275property("title", t_r5.label + " Differenz");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(t_r5.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(t_r5.label);
  }
}
function DamageCalculatorComponent_Conditional_28_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.lastResult.flatBonus);
  }
}
function DamageCalculatorComponent_Conditional_28_For_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 42);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const r_r6 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("max-roll", r_r6 === ctx_r1.lastResult.effektivitaet)("min-roll", r_r6 === 1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(r_r6);
  }
}
function DamageCalculatorComponent_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19)(1, "div", 33)(2, "span", 34);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 35);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 36);
    \u0275\u0275conditionalCreate(7, DamageCalculatorComponent_Conditional_28_Conditional_7_Template, 2, 1, "span", 37);
    \u0275\u0275repeaterCreate(8, DamageCalculatorComponent_Conditional_28_For_9_Template, 2, 5, "span", 38, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 39)(11, "span", 40);
    \u0275\u0275text(12, "Gesamtschaden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 41);
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", ctx_r1.lastResult.severity.color);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", ctx_r1.lastResult.severity.icon, " ", ctx_r1.lastResult.severity.label, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.lastResult.formula);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.lastResult.flatBonus > 0 ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.lastResult.individualRolls);
    \u0275\u0275advance(5);
    \u0275\u0275styleProp("color", ctx_r1.lastResult.severity.color);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.lastResult.total);
  }
}
function DamageCalculatorComponent_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 24)(1, "span", 43);
    \u0275\u0275text(2, "\u2694");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4, "Noch keine W\xFCrfe in dieser Sitzung");
    \u0275\u0275elementEnd()();
  }
}
function DamageCalculatorComponent_Conditional_36_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 45);
    \u0275\u0275listener("click", function DamageCalculatorComponent_Conditional_36_For_2_Template_button_click_0_listener() {
      const entry_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.useHistoryEntry(entry_r8));
    });
    \u0275\u0275elementStart(1, "span", 46);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 47);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 48)(6, "span", 49);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const entry_r8 = ctx.$implicit;
    \u0275\u0275property("title", "d" + entry_r8.effektivitaet + " laden");
    \u0275\u0275advance();
    \u0275\u0275styleProp("color", entry_r8.severity.color);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(entry_r8.severity.icon);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(entry_r8.formula);
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("color", entry_r8.severity.color);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(entry_r8.total);
  }
}
function DamageCalculatorComponent_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25);
    \u0275\u0275repeaterCreate(1, DamageCalculatorComponent_Conditional_36_For_2_Template, 8, 8, "button", 44, \u0275\u0275componentInstance().trackByTimestamp, true);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.rollHistory);
  }
}
var SEVERITY_OPTIONS = [
  { label: "Schwacher Treffer", multiplier: 1, color: "#eab308", icon: "\u25E6" },
  { label: "Normaler Treffer", multiplier: 2, color: "#f59e0b", icon: "\u25C8" },
  { label: "Starker Treffer", multiplier: 3, color: "#f97316", icon: "\u25C9" },
  { label: "Kritischer Treffer", multiplier: 3, color: "#ef4444", icon: "\u25CE" },
  { label: "T\xF6dlicher Treffer", multiplier: 3, color: "#dc2626", icon: "\u2726" }
];
var DAMAGE_THRESHOLDS = [
  { icon: "\u25CB", label: "0\u20132", color: "#9ca3af" },
  { icon: "\u25CF", label: "3\u20136", color: "#eab308" },
  { icon: "\u25C6", label: "7\u201310", color: "#f59e0b" },
  { icon: "\u2738", label: "11\u201317", color: "#f97316" },
  { icon: "\u2620", label: "18\u201321", color: "#ef4444" },
  { icon: "\u2620\u{1F3F9}", label: "22+", color: "#dc2626" }
];
var STORAGE_KEY_HISTORY = "dmg-calc-history";
var MAX_HISTORY = 20;
var DICE_BASE_LEVEL = 0.3;
var DamageCalculatorComponent = class _DamageCalculatorComponent {
  worldName = "";
  characterName = "Spielleiter";
  characterId = "dm";
  /** Pre-fills the Effektivit\u00E4t field (e.g. from weapon efficiency) */
  initialEffektivitaet;
  rolled = new EventEmitter();
  close = new EventEmitter();
  worldSocket = inject(WorldSocketService);
  cdr = inject(ChangeDetectorRef);
  severityOptions = SEVERITY_OPTIONS;
  damageThresholds = DAMAGE_THRESHOLDS;
  effektivitaet = 6;
  selectedSeverity = SEVERITY_OPTIONS[1];
  // Normaler Treffer default
  lastResult = null;
  isRolling = false;
  rollHistory = [];
  rollSound = null;
  get formula() {
    return this.getRollPlan(this.selectedSeverity, this.effektivitaet).formula;
  }
  getSeverityDisplay(severity) {
    return this.getRollPlan(severity, this.effektivitaet).displayMulti;
  }
  getRollPlan(severity, eff) {
    const sides = Math.max(2, eff || 2);
    switch (severity.label) {
      case "Kritischer Treffer":
        return {
          diceCount: 3,
          flatBonus: sides,
          formula: `${sides} + 3d${sides}`,
          displayMulti: `Eff + \xD73`
        };
      case "T\xF6dlicher Treffer":
        return {
          diceCount: 3,
          flatBonus: sides * 2,
          formula: `${sides * 2} + 3d${sides}`,
          displayMulti: `2\xD7Eff + \xD73`
        };
      default:
        return {
          diceCount: severity.multiplier,
          flatBonus: 0,
          formula: `${severity.multiplier}d${sides}`,
          displayMulti: `\xD7${severity.multiplier}`
        };
    }
  }
  ngOnInit() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    this.initRollSound();
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        this.rollHistory = parsed.map((e) => __spreadProps(__spreadValues({}, e), { timestamp: new Date(e.timestamp) }));
      } catch {
        this.rollHistory = [];
      }
    }
  }
  ngOnDestroy() {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
  ngOnChanges(changes) {
    if (changes["initialEffektivitaet"] && changes["initialEffektivitaet"].currentValue != null) {
      this.effektivitaet = changes["initialEffektivitaet"].currentValue;
      this.cdr.markForCheck();
    }
  }
  selectSeverity(severity) {
    this.selectedSeverity = severity;
    this.cdr.markForCheck();
  }
  rollDamage() {
    if (this.isRolling)
      return;
    if (!this.effektivitaet || this.effektivitaet < 2)
      return;
    this.isRolling = true;
    this.playRollSound();
    this.cdr.markForCheck();
    const plan = this.getRollPlan(this.selectedSeverity, this.effektivitaet);
    const count = plan.diceCount;
    const sides = this.effektivitaet;
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    const diceSum = rolls.reduce((a, b) => a + b, 0);
    const total = plan.flatBonus + diceSum;
    const formula = plan.formula;
    const result = {
      formula,
      individualRolls: rolls,
      flatBonus: plan.flatBonus,
      total,
      severity: this.selectedSeverity,
      effektivitaet: sides,
      stabilitaet: 0,
      finalDamage: total,
      timestamp: /* @__PURE__ */ new Date()
    };
    this.lastResult = result;
    this.rollHistory = [result, ...this.rollHistory].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.rollHistory));
    if (this.worldName) {
      const rollEvent = {
        id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        worldName: this.worldName,
        characterId: this.characterId,
        characterName: this.characterName,
        diceType: sides,
        diceCount: count,
        rolls,
        result: total,
        rawResult: total,
        stabilitaet: 0,
        finalDamage: total,
        bonuses: [],
        timestamp: result.timestamp,
        isSecret: false,
        actionName: `${this.selectedSeverity.icon} ${this.selectedSeverity.label}`,
        actionIcon: this.selectedSeverity.icon,
        actionColor: this.selectedSeverity.color
      };
      this.worldSocket.sendDiceRoll(rollEvent);
    }
    this.rolled.emit(result);
    setTimeout(() => {
      this.isRolling = false;
      this.cdr.markForCheck();
    }, 400);
    this.cdr.markForCheck();
  }
  /** Load a history entry's values back into the inputs */
  useHistoryEntry(entry) {
    this.effektivitaet = entry.effektivitaet;
    const sev = SEVERITY_OPTIONS.find((s) => s.label === entry.severity.label);
    if (sev)
      this.selectedSeverity = sev;
    this.cdr.markForCheck();
  }
  trackBySeverity(_, s) {
    return s.label;
  }
  trackByTimestamp(_, r) {
    return r.timestamp.getTime();
  }
  initRollSound() {
    this.rollSound = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVQIj6PLwZ14MQ+E1uvl0pZlAQBfnNPq7LqBT+7uubvV8ei/Nx1u0fbuqXkmAKzw//+rZTofrdnt/5Z3LyKWy+/+tX0vH4fG7f/Hi0osaMjq/7eYPyZYsuT/1aNREV657/z/l2wdB1qf2er9qnwyDl+XyvKvhT4UUInB7rKKRxVGbJ/Xx5dOICdOXoO2s2orCBYrVHOhsGszCgAJGEBniqhiOwobJy9EYoOUZEoqKjQaHSw+VGmBbkguNjwsGRQhNERZbmtSQUxNQy0eDRQjN05mZU5DSkI9Ly0hERUiMEhebVZAPz02Li8oIiMiLDZIVk1BP0E8NjM0Li4sJiorNEFMRDs+QDs3NDUyNDEvMjY8Q0M9PD8+Ozg3NjY2NzQ4PEA+Ozw+Pjo5ODg5ODk6Ozw8Ozs8PDw7Ozs7PDw8PD08PD09PT4+Pj4+Pz8/Pz9AQEBAQEBAQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB");
  }
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
  static \u0275fac = function DamageCalculatorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _DamageCalculatorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DamageCalculatorComponent, selectors: [["app-damage-calculator"]], inputs: { worldName: "worldName", characterName: "characterName", characterId: "characterId", initialEffektivitaet: "initialEffektivitaet" }, outputs: { rolled: "rolled", close: "close" }, features: [\u0275\u0275NgOnChangesFeature], decls: 37, vars: 9, consts: [[1, "dmg-calc-card"], [1, "dmg-calc-header"], [1, "dmg-calc-title"], ["title", "Schlie\xDFen", 1, "dmg-close-btn"], [1, "dmg-calc-body"], [1, "dmg-controls"], [1, "dmg-inputs-row"], [1, "dmg-field"], [1, "dmg-label"], [1, "dmg-effekt-row"], [1, "dmg-dice-prefix"], ["type", "number", "min", "2", 1, "dmg-effekt-input", 3, "ngModelChange", "ngModel"], [1, "dmg-severity-grid"], ["class", "dmg-severity-btn", 3, "selected", "--sev-color", "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "dmg-roll-btn", 3, "click", "disabled"], [1, "dmg-roll-icon"], [1, "dmg-ruler"], [1, "dmg-ruler-track"], [1, "dmg-ruler-cell", 3, "--tc", "title"], [1, "dmg-result-panel"], [1, "dmg-history"], [1, "dmg-history-header"], [1, "dmg-history-title"], [1, "dmg-history-hint"], [1, "dmg-history-empty"], [1, "dmg-history-list"], ["title", "Schlie\xDFen", 1, "dmg-close-btn", 3, "click"], [1, "dmg-severity-btn", 3, "click"], [1, "dmg-sev-label"], [1, "dmg-sev-multi"], [1, "dmg-ruler-cell", 3, "title"], [1, "dmg-ruler-icon"], [1, "dmg-ruler-range"], [1, "dmg-result-header"], [1, "dmg-result-severity"], [1, "dmg-result-formula"], [1, "dmg-dice-list"], ["title", "Effektivit\xE4ts-Bonus", 1, "dmg-flat-chip"], [1, "dmg-die-chip", 3, "max-roll", "min-roll"], [1, "dmg-total-row"], [1, "dmg-total-label"], [1, "dmg-total-value"], [1, "dmg-die-chip"], [1, "dmg-history-empty-icon"], [1, "dmg-history-entry", 3, "title"], [1, "dmg-history-entry", 3, "click", "title"], [1, "dmg-hist-sev-icon"], [1, "dmg-hist-formula"], [1, "dmg-hist-result"], [1, "dmg-hist-final"]], template: function DamageCalculatorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "span", 2);
      \u0275\u0275text(3, "\u2694 Schadensrechner");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(4, DamageCalculatorComponent_Conditional_4_Template, 2, 0, "button", 3);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "div", 4)(6, "div", 5)(7, "div", 6)(8, "div", 7)(9, "label", 8);
      \u0275\u0275text(10, "Effektivit\xE4t (W\xFCrfelgr\xF6\xDFe)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "div", 9)(12, "span", 10);
      \u0275\u0275text(13, "\u2694");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "input", 11);
      \u0275\u0275twoWayListener("ngModelChange", function DamageCalculatorComponent_Template_input_ngModelChange_14_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.effektivitaet, $event) || (ctx.effektivitaet = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(15, "div", 7)(16, "label", 8);
      \u0275\u0275text(17, "Trefferst\xE4rke");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "div", 12);
      \u0275\u0275template(19, DamageCalculatorComponent_button_19_Template, 5, 6, "button", 13);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "button", 14);
      \u0275\u0275listener("click", function DamageCalculatorComponent_Template_button_click_20_listener() {
        return ctx.rollDamage();
      });
      \u0275\u0275elementStart(21, "span", 15);
      \u0275\u0275text(22, "\u2694");
      \u0275\u0275elementEnd();
      \u0275\u0275text(23, " Schaden w\xFCrfeln ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "div", 16)(25, "div", 17);
      \u0275\u0275repeaterCreate(26, DamageCalculatorComponent_For_27_Template, 5, 5, "div", 18, _forTrack0);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(28, DamageCalculatorComponent_Conditional_28_Template, 15, 9, "div", 19);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "div", 20)(30, "div", 21)(31, "span", 22);
      \u0275\u0275text(32, "Verlauf");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "span", 23);
      \u0275\u0275text(34, "Klick = Werte laden");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(35, DamageCalculatorComponent_Conditional_35_Template, 5, 0, "div", 24)(36, DamageCalculatorComponent_Conditional_36_Template, 3, 0, "div", 25);
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.close.observed ? 4 : -1);
      \u0275\u0275advance(10);
      \u0275\u0275twoWayProperty("ngModel", ctx.effektivitaet);
      \u0275\u0275advance(5);
      \u0275\u0275property("ngForOf", ctx.severityOptions)("ngForTrackBy", ctx.trackBySeverity);
      \u0275\u0275advance();
      \u0275\u0275classProp("rolling", ctx.isRolling);
      \u0275\u0275property("disabled", ctx.isRolling || ctx.effektivitaet < 2);
      \u0275\u0275advance(6);
      \u0275\u0275repeater(ctx.damageThresholds);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.lastResult ? 28 : -1);
      \u0275\u0275advance(7);
      \u0275\u0275conditional(ctx.rollHistory.length === 0 ? 35 : 36);
    }
  }, dependencies: [CommonModule, NgForOf, FormsModule, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, MinValidator, NgModel], styles: ['\n\n.dmg-calc-card[_ngcontent-%COMP%] {\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 10px;\n  overflow: hidden;\n}\n.dmg-calc-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px 10px;\n  border-bottom: 1px solid var(--border, #374151);\n  background: rgba(0, 0, 0, 0.2);\n}\n.dmg-calc-title[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 600;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-calc-formula[_ngcontent-%COMP%] {\n  font-family: "Courier New", monospace;\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.12);\n  padding: 2px 8px;\n  border-radius: 4px;\n  border: 1px solid rgba(139, 92, 246, 0.25);\n}\n.dmg-close-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  color: #9ca3af;\n  width: 26px;\n  height: 26px;\n  border-radius: 6px;\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  margin-left: auto;\n  flex-shrink: 0;\n}\n.dmg-close-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.dmg-calc-body[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0;\n  min-height: 0;\n}\n.dmg-controls[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  padding: 14px 16px;\n  border-right: 1px solid var(--border, #374151);\n}\n.dmg-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.dmg-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-inputs-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.dmg-inputs-row[_ngcontent-%COMP%]   .dmg-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 130px;\n}\n.dmg-effekt-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  gap: 0;\n  width: 100%;\n}\n.dmg-dice-prefix[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-right: none;\n  padding: 0 12px;\n  border-radius: 6px 0 0 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  height: 48px;\n  box-sizing: border-box;\n}\n.dmg-effekt-input[_ngcontent-%COMP%] {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 0 6px 6px 0;\n  color: var(--text, #e5e7eb);\n  font-size: 1.5rem;\n  font-weight: 700;\n  padding: 0 12px;\n  height: 48px;\n  box-sizing: border-box;\n  flex: 1;\n  min-width: 0;\n  text-align: center;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.dmg-effekt-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--accent, #8b5cf6);\n}\n.dmg-effekt-input[_ngcontent-%COMP%]::-webkit-inner-spin-button, \n.dmg-effekt-input[_ngcontent-%COMP%]::-webkit-outer-spin-button {\n  opacity: 0.4;\n}\n.dmg-stab-prefix[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  background: rgba(99, 102, 241, 0.15);\n  border: 1px solid rgba(99, 102, 241, 0.35);\n  border-right: none;\n  padding: 0 12px;\n  border-radius: 6px 0 0 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  height: 48px;\n  box-sizing: border-box;\n  line-height: 1;\n}\n.dmg-stab-input[_ngcontent-%COMP%] {\n  border-radius: 0 6px 6px 0;\n}\n.dmg-stab-input[_ngcontent-%COMP%]:focus {\n  border-color: #6366f1;\n}\n.dmg-severity-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dmg-severity-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 7px 12px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  cursor: pointer;\n  transition:\n    background 0.15s,\n    border-color 0.15s,\n    transform 0.1s;\n  text-align: left;\n  color: var(--text, #e5e7eb);\n}\n.dmg-severity-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.04);\n  border-color: var(--sev-color, #6b7280);\n}\n.dmg-severity-btn.selected[_ngcontent-%COMP%] {\n  background: color-mix(in srgb, var(--sev-color, #6b7280) 14%, transparent);\n  border-color: var(--sev-color, #6b7280);\n  color: var(--sev-color, #e5e7eb);\n}\n.dmg-severity-btn.selected[_ngcontent-%COMP%]   .dmg-sev-icon[_ngcontent-%COMP%], \n.dmg-severity-btn.selected[_ngcontent-%COMP%]   .dmg-sev-multi[_ngcontent-%COMP%] {\n  color: var(--sev-color, #e5e7eb);\n}\n.dmg-sev-icon[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--muted, #9ca3af);\n  width: 16px;\n  text-align: center;\n  flex-shrink: 0;\n}\n.dmg-sev-label[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 0.82rem;\n  font-weight: 500;\n}\n.dmg-sev-multi[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  font-weight: 700;\n  font-family: "Courier New", monospace;\n  color: var(--muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.06);\n  padding: 1px 6px;\n  border-radius: 3px;\n}\n.dmg-roll-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 9px 16px;\n  background: #991b1b;\n  border: 1px solid #b91c1c;\n  border-radius: 6px;\n  color: #fef2f2;\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition:\n    background 0.15s,\n    transform 0.1s,\n    opacity 0.15s;\n  width: 100%;\n}\n.dmg-roll-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #b91c1c;\n  border-color: #dc2626;\n}\n.dmg-roll-btn[_ngcontent-%COMP%]:active:not(:disabled) {\n  transform: scale(0.98);\n}\n.dmg-roll-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.dmg-roll-btn.rolling[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_dmg-roll-pulse 0.4s ease-in-out;\n}\n@keyframes _ngcontent-%COMP%_dmg-roll-pulse {\n  0% {\n    transform: scale(1);\n    background: #991b1b;\n  }\n  40% {\n    transform: scale(0.96);\n    background: #7f1d1d;\n  }\n  100% {\n    transform: scale(1);\n    background: #991b1b;\n  }\n}\n.dmg-roll-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n.dmg-result-panel[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.25);\n  border: 1px solid var(--border, #374151);\n  border-radius: 7px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  animation: _ngcontent-%COMP%_dmg-result-in 0.25s ease-out;\n}\n@keyframes _ngcontent-%COMP%_dmg-result-in {\n  from {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.dmg-result-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.dmg-result-severity[_ngcontent-%COMP%] {\n  font-size: 0.82rem;\n  font-weight: 700;\n}\n.dmg-result-formula[_ngcontent-%COMP%] {\n  font-family: "Courier New", monospace;\n  font-size: 0.75rem;\n  color: var(--muted, #9ca3af);\n}\n.dmg-dice-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.dmg-flat-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 28px;\n  height: 28px;\n  padding: 0 8px;\n  background: rgba(245, 158, 11, 0.12);\n  border: 1px solid rgba(245, 158, 11, 0.45);\n  border-radius: 5px;\n  font-size: 0.82rem;\n  font-weight: 700;\n  font-family: "Courier New", monospace;\n  color: #fbbf24;\n}\n.dmg-die-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 28px;\n  height: 28px;\n  padding: 0 6px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 5px;\n  font-size: 0.82rem;\n  font-weight: 700;\n  font-family: "Courier New", monospace;\n  color: var(--text, #e5e7eb);\n}\n.dmg-die-chip.max-roll[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.dmg-die-chip.min-roll[_ngcontent-%COMP%] {\n  background: rgba(107, 114, 128, 0.12);\n  border-color: #4b5563;\n  color: #6b7280;\n}\n.dmg-total-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  padding-top: 6px;\n  border-top: 1px solid var(--border, #374151);\n}\n.dmg-total-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--muted, #9ca3af);\n}\n.dmg-total-value[_ngcontent-%COMP%] {\n  font-size: 1.6rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  line-height: 1;\n}\n.dmg-final-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  padding-top: 6px;\n  border-top: 1px solid var(--border, #374151);\n}\n.dmg-final-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6366f1;\n}\n.dmg-final-value[_ngcontent-%COMP%] {\n  font-size: 1.9rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  line-height: 1;\n  filter: brightness(1.15);\n}\n.dmg-history[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  background: rgba(0, 0, 0, 0.1);\n}\n.dmg-history-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px 8px;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n}\n.dmg-history-title[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-history-hint[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: rgba(156, 163, 175, 0.5);\n  font-style: italic;\n}\n.dmg-history-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 32px 16px;\n  color: rgba(156, 163, 175, 0.4);\n  font-size: 0.8rem;\n  text-align: center;\n}\n.dmg-history-empty-icon[_ngcontent-%COMP%] {\n  font-size: 1.6rem;\n  opacity: 0.25;\n}\n.dmg-history-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  max-height: 400px;\n}\n.dmg-history-list[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 4px;\n}\n.dmg-history-list[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.dmg-history-list[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n}\n.dmg-history-entry[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n  cursor: pointer;\n  transition: background 0.12s;\n  text-align: left;\n  color: var(--text, #e5e7eb);\n  width: 100%;\n}\n.dmg-history-entry[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.05);\n}\n.dmg-history-entry[_ngcontent-%COMP%]:first-child {\n  border-top: none;\n}\n.dmg-hist-sev-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  flex-shrink: 0;\n  width: 14px;\n  text-align: center;\n}\n.dmg-hist-formula[_ngcontent-%COMP%] {\n  font-family: "Courier New", monospace;\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n  min-width: 0;\n}\n.dmg-hist-stab[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--muted, #9ca3af);\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n.dmg-hist-result[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.dmg-hist-raw[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-family: "Courier New", monospace;\n  color: rgba(156, 163, 175, 0.6);\n  text-decoration: line-through;\n}\n.dmg-hist-arrow[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: rgba(156, 163, 175, 0.4);\n}\n.dmg-hist-final[_ngcontent-%COMP%] {\n  font-size: 0.92rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  min-width: 28px;\n  text-align: right;\n}\n.dmg-history[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  background: rgba(0, 0, 0, 0.1);\n}\n.dmg-history-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px 8px;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n}\n.dmg-history-title[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-history-hint[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: rgba(156, 163, 175, 0.5);\n  font-style: italic;\n}\n.dmg-history-empty[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 32px 16px;\n  color: rgba(156, 163, 175, 0.4);\n  font-size: 0.8rem;\n  text-align: center;\n}\n.dmg-history-empty-icon[_ngcontent-%COMP%] {\n  font-size: 1.6rem;\n  opacity: 0.25;\n}\n.dmg-history-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  max-height: 400px;\n}\n.dmg-history-list[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 4px;\n}\n.dmg-history-list[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.dmg-history-list[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n}\n.dmg-history-entry[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n  cursor: pointer;\n  transition: background 0.12s;\n  text-align: left;\n  color: var(--text, #e5e7eb);\n  width: 100%;\n}\n.dmg-history-entry[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.05);\n}\n.dmg-history-entry[_ngcontent-%COMP%]:first-child {\n  border-top: none;\n}\n.dmg-hist-sev-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  flex-shrink: 0;\n  width: 14px;\n  text-align: center;\n}\n.dmg-hist-formula[_ngcontent-%COMP%] {\n  font-family: "Courier New", monospace;\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n  min-width: 0;\n}\n.dmg-hist-stab[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: var(--muted, #9ca3af);\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n.dmg-hist-result[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.dmg-hist-raw[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-family: "Courier New", monospace;\n  color: rgba(156, 163, 175, 0.6);\n  text-decoration: line-through;\n}\n.dmg-hist-arrow[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: rgba(156, 163, 175, 0.4);\n}\n.dmg-hist-final[_ngcontent-%COMP%] {\n  font-size: 0.92rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  min-width: 28px;\n  text-align: right;\n}\n.dmg-ruler[_ngcontent-%COMP%] {\n  margin-top: 4px;\n}\n.dmg-ruler-track[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  gap: 0;\n  background: rgba(0, 0, 0, 0.18);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px;\n  padding: 6px 4px;\n  overflow-x: auto;\n}\n.dmg-ruler-cell[_ngcontent-%COMP%] {\n  --tc: #9ca3af;\n  position: relative;\n  flex: 1 1 0;\n  min-width: 42px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n  padding: 2px 2px;\n  border-radius: 6px;\n  transition: background 0.15s, transform 0.15s;\n}\n.dmg-ruler-cell[_ngcontent-%COMP%]:not(:last-child)::after {\n  content: "";\n  position: absolute;\n  top: 13px;\n  right: -50%;\n  width: 100%;\n  height: 2px;\n  background: rgba(255, 255, 255, 0.12);\n  z-index: 0;\n}\n.dmg-ruler-icon[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n  font-size: 1.05rem;\n  line-height: 1;\n  color: var(--tc);\n  filter: grayscale(0.35);\n  opacity: 0.7;\n  transition: all 0.15s;\n}\n.dmg-ruler-range[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n  transition: color 0.15s;\n}\n/*# sourceMappingURL=damage-calculator.component.css.map */'], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(DamageCalculatorComponent, [{
    type: Component,
    args: [{ selector: "app-damage-calculator", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="dmg-calc-card">\r
  <!-- Header -->\r
  <div class="dmg-calc-header">\r
    <span class="dmg-calc-title">&#x2694; Schadensrechner</span>\r
    @if (close.observed) {\r
      <button class="dmg-close-btn" (click)="close.emit()" title="Schlie\xDFen">&#x2715;</button>\r
    }\r
  </div>\r
\r
  <!-- Two-column body -->\r
  <div class="dmg-calc-body">\r
\r
    <!-- Left column: Controls -->\r
    <div class="dmg-controls">\r
\r
      <!-- Effektivit\xE4t only. Stability now lives on the DEFENDER: the attacker rolls raw\r
           damage, the defender applies their own stability when taking it. -->\r
      <div class="dmg-inputs-row">\r
        <div class="dmg-field">\r
          <label class="dmg-label">Effektivit\xE4t (W\xFCrfelgr\xF6\xDFe)</label>\r
          <div class="dmg-effekt-row">\r
            <span class="dmg-dice-prefix">&#x2694;</span>\r
            <input class="dmg-effekt-input" type="number" min="2" [(ngModel)]="effektivitaet" />\r
          </div>\r
        </div>\r
      </div>\r
\r
      <!-- Severity selector -->\r
      <div class="dmg-field">\r
        <label class="dmg-label">Trefferst\xE4rke</label>\r
        <div class="dmg-severity-grid">\r
          <button\r
            *ngFor="let s of severityOptions; trackBy: trackBySeverity"\r
            class="dmg-severity-btn"\r
            [class.selected]="s === selectedSeverity"\r
            [style.--sev-color]="s.color"\r
            (click)="selectSeverity(s)"\r
          >\r
            <span class="dmg-sev-label">{{ s.label }}</span>\r
            <span class="dmg-sev-multi">{{ getSeverityDisplay(s) }}</span>\r
          </button>\r
        </div>\r
      </div>\r
\r
      <!-- Roll button -->\r
      <button class="dmg-roll-btn" [class.rolling]="isRolling" [disabled]="isRolling || effektivitaet < 2" (click)="rollDamage()">\r
        <span class="dmg-roll-icon">&#x2694;</span>\r
        Schaden w\xFCrfeln\r
      </button>\r
\r
      <!-- Static cheat sheet: W\xFCrfeldifferenz \u2192 Trefferst\xE4rke. Purely a reminder for the\r
           GM \u2014 it is NOT tied to the rolled damage and never highlights. -->\r
      <div class="dmg-ruler">\r
        <div class="dmg-ruler-track">\r
          @for (t of damageThresholds; track t.label) {\r
            <div class="dmg-ruler-cell" [style.--tc]="t.color" [title]="t.label + ' Differenz'">\r
              <span class="dmg-ruler-icon">{{ t.icon }}</span>\r
              <span class="dmg-ruler-range">{{ t.label }}</span>\r
            </div>\r
          }\r
        </div>\r
      </div>\r
\r
      <!-- Last result panel -->\r
      @if (lastResult) {\r
        <div class="dmg-result-panel">\r
          <div class="dmg-result-header">\r
            <span class="dmg-result-severity" [style.color]="lastResult.severity.color">\r
              {{ lastResult.severity.icon }} {{ lastResult.severity.label }}\r
            </span>\r
            <span class="dmg-result-formula">{{ lastResult.formula }}</span>\r
          </div>\r
          <div class="dmg-dice-list">\r
            @if (lastResult.flatBonus > 0) {\r
              <span class="dmg-flat-chip" title="Effektivit\xE4ts-Bonus">+{{ lastResult.flatBonus }}</span>\r
            }\r
            @for (r of lastResult.individualRolls; track $index) {\r
              <span class="dmg-die-chip"\r
                    [class.max-roll]="r === lastResult.effektivitaet"\r
                    [class.min-roll]="r === 1">{{ r }}</span>\r
            }\r
          </div>\r
          <div class="dmg-total-row">\r
            <span class="dmg-total-label">Gesamtschaden</span>\r
            <span class="dmg-total-value" [style.color]="lastResult.severity.color">{{ lastResult.total }}</span>\r
          </div>\r
        </div>\r
      }\r
    </div>\r
\r
    <!-- Right column: History -->\r
    <div class="dmg-history">\r
      <div class="dmg-history-header">\r
        <span class="dmg-history-title">Verlauf</span>\r
        <span class="dmg-history-hint">Klick = Werte laden</span>\r
      </div>\r
\r
      @if (rollHistory.length === 0) {\r
        <div class="dmg-history-empty">\r
          <span class="dmg-history-empty-icon">&#x2694;</span>\r
          <span>Noch keine W\xFCrfe in dieser Sitzung</span>\r
        </div>\r
      } @else {\r
        <div class="dmg-history-list">\r
          @for (entry of rollHistory; track trackByTimestamp($index, entry)) {\r
            <button class="dmg-history-entry" (click)="useHistoryEntry(entry)"\r
                    [title]="'d' + entry.effektivitaet + ' laden'">\r
              <span class="dmg-hist-sev-icon" [style.color]="entry.severity.color">{{ entry.severity.icon }}</span>\r
              <span class="dmg-hist-formula">{{ entry.formula }}</span>\r
              <span class="dmg-hist-result">\r
                <span class="dmg-hist-final" [style.color]="entry.severity.color">{{ entry.total }}</span>\r
              </span>\r
            </button>\r
          }\r
        </div>\r
      }\r
    </div>\r
\r
  </div>\r
</div>\r
`, styles: ['/* src/app/world/damage-calculator/damage-calculator.component.css */\n.dmg-calc-card {\n  background: var(--card, #1f2937);\n  border: 1px solid var(--border, #374151);\n  border-radius: 10px;\n  overflow: hidden;\n}\n.dmg-calc-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px 10px;\n  border-bottom: 1px solid var(--border, #374151);\n  background: rgba(0, 0, 0, 0.2);\n}\n.dmg-calc-title {\n  font-size: 0.85rem;\n  font-weight: 600;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-calc-formula {\n  font-family: "Courier New", monospace;\n  font-size: 0.8rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.12);\n  padding: 2px 8px;\n  border-radius: 4px;\n  border: 1px solid rgba(139, 92, 246, 0.25);\n}\n.dmg-close-btn {\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  color: #9ca3af;\n  width: 26px;\n  height: 26px;\n  border-radius: 6px;\n  font-size: 0.9rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s;\n  margin-left: auto;\n  flex-shrink: 0;\n}\n.dmg-close-btn:hover {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #ef4444;\n}\n.dmg-calc-body {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0;\n  min-height: 0;\n}\n.dmg-controls {\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  padding: 14px 16px;\n  border-right: 1px solid var(--border, #374151);\n}\n.dmg-field {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.dmg-label {\n  font-size: 0.72rem;\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-inputs-row {\n  display: flex;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.dmg-inputs-row .dmg-field {\n  flex: 1;\n  min-width: 130px;\n}\n.dmg-effekt-row {\n  display: flex;\n  align-items: stretch;\n  gap: 0;\n  width: 100%;\n}\n.dmg-dice-prefix {\n  font-size: 1rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  background: rgba(139, 92, 246, 0.15);\n  border: 1px solid rgba(139, 92, 246, 0.3);\n  border-right: none;\n  padding: 0 12px;\n  border-radius: 6px 0 0 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  height: 48px;\n  box-sizing: border-box;\n}\n.dmg-effekt-input {\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 0 6px 6px 0;\n  color: var(--text, #e5e7eb);\n  font-size: 1.5rem;\n  font-weight: 700;\n  padding: 0 12px;\n  height: 48px;\n  box-sizing: border-box;\n  flex: 1;\n  min-width: 0;\n  text-align: center;\n  outline: none;\n  transition: border-color 0.15s;\n}\n.dmg-effekt-input:focus {\n  border-color: var(--accent, #8b5cf6);\n}\n.dmg-effekt-input::-webkit-inner-spin-button,\n.dmg-effekt-input::-webkit-outer-spin-button {\n  opacity: 0.4;\n}\n.dmg-stab-prefix {\n  font-size: 1rem;\n  background: rgba(99, 102, 241, 0.15);\n  border: 1px solid rgba(99, 102, 241, 0.35);\n  border-right: none;\n  padding: 0 12px;\n  border-radius: 6px 0 0 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  height: 48px;\n  box-sizing: border-box;\n  line-height: 1;\n}\n.dmg-stab-input {\n  border-radius: 0 6px 6px 0;\n}\n.dmg-stab-input:focus {\n  border-color: #6366f1;\n}\n.dmg-severity-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dmg-severity-btn {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 7px 12px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  cursor: pointer;\n  transition:\n    background 0.15s,\n    border-color 0.15s,\n    transform 0.1s;\n  text-align: left;\n  color: var(--text, #e5e7eb);\n}\n.dmg-severity-btn:hover {\n  background: rgba(255, 255, 255, 0.04);\n  border-color: var(--sev-color, #6b7280);\n}\n.dmg-severity-btn.selected {\n  background: color-mix(in srgb, var(--sev-color, #6b7280) 14%, transparent);\n  border-color: var(--sev-color, #6b7280);\n  color: var(--sev-color, #e5e7eb);\n}\n.dmg-severity-btn.selected .dmg-sev-icon,\n.dmg-severity-btn.selected .dmg-sev-multi {\n  color: var(--sev-color, #e5e7eb);\n}\n.dmg-sev-icon {\n  font-size: 0.9rem;\n  color: var(--muted, #9ca3af);\n  width: 16px;\n  text-align: center;\n  flex-shrink: 0;\n}\n.dmg-sev-label {\n  flex: 1;\n  font-size: 0.82rem;\n  font-weight: 500;\n}\n.dmg-sev-multi {\n  font-size: 0.78rem;\n  font-weight: 700;\n  font-family: "Courier New", monospace;\n  color: var(--muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.06);\n  padding: 1px 6px;\n  border-radius: 3px;\n}\n.dmg-roll-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 9px 16px;\n  background: #991b1b;\n  border: 1px solid #b91c1c;\n  border-radius: 6px;\n  color: #fef2f2;\n  font-size: 0.88rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition:\n    background 0.15s,\n    transform 0.1s,\n    opacity 0.15s;\n  width: 100%;\n}\n.dmg-roll-btn:hover:not(:disabled) {\n  background: #b91c1c;\n  border-color: #dc2626;\n}\n.dmg-roll-btn:active:not(:disabled) {\n  transform: scale(0.98);\n}\n.dmg-roll-btn:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.dmg-roll-btn.rolling {\n  animation: dmg-roll-pulse 0.4s ease-in-out;\n}\n@keyframes dmg-roll-pulse {\n  0% {\n    transform: scale(1);\n    background: #991b1b;\n  }\n  40% {\n    transform: scale(0.96);\n    background: #7f1d1d;\n  }\n  100% {\n    transform: scale(1);\n    background: #991b1b;\n  }\n}\n.dmg-roll-icon {\n  font-size: 1rem;\n}\n.dmg-result-panel {\n  background: rgba(0, 0, 0, 0.25);\n  border: 1px solid var(--border, #374151);\n  border-radius: 7px;\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  animation: dmg-result-in 0.25s ease-out;\n}\n@keyframes dmg-result-in {\n  from {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.dmg-result-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n.dmg-result-severity {\n  font-size: 0.82rem;\n  font-weight: 700;\n}\n.dmg-result-formula {\n  font-family: "Courier New", monospace;\n  font-size: 0.75rem;\n  color: var(--muted, #9ca3af);\n}\n.dmg-dice-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.dmg-flat-chip {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 28px;\n  height: 28px;\n  padding: 0 8px;\n  background: rgba(245, 158, 11, 0.12);\n  border: 1px solid rgba(245, 158, 11, 0.45);\n  border-radius: 5px;\n  font-size: 0.82rem;\n  font-weight: 700;\n  font-family: "Courier New", monospace;\n  color: #fbbf24;\n}\n.dmg-die-chip {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 28px;\n  height: 28px;\n  padding: 0 6px;\n  background: var(--bg, #111827);\n  border: 1px solid var(--border, #374151);\n  border-radius: 5px;\n  font-size: 0.82rem;\n  font-weight: 700;\n  font-family: "Courier New", monospace;\n  color: var(--text, #e5e7eb);\n}\n.dmg-die-chip.max-roll {\n  background: rgba(239, 68, 68, 0.15);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.dmg-die-chip.min-roll {\n  background: rgba(107, 114, 128, 0.12);\n  border-color: #4b5563;\n  color: #6b7280;\n}\n.dmg-total-row {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  padding-top: 6px;\n  border-top: 1px solid var(--border, #374151);\n}\n.dmg-total-label {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: var(--muted, #9ca3af);\n}\n.dmg-total-value {\n  font-size: 1.6rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  line-height: 1;\n}\n.dmg-final-row {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  padding-top: 6px;\n  border-top: 1px solid var(--border, #374151);\n}\n.dmg-final-label {\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6366f1;\n}\n.dmg-final-value {\n  font-size: 1.9rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  line-height: 1;\n  filter: brightness(1.15);\n}\n.dmg-history {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  background: rgba(0, 0, 0, 0.1);\n}\n.dmg-history-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px 8px;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n}\n.dmg-history-title {\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-history-hint {\n  font-size: 0.65rem;\n  color: rgba(156, 163, 175, 0.5);\n  font-style: italic;\n}\n.dmg-history-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 32px 16px;\n  color: rgba(156, 163, 175, 0.4);\n  font-size: 0.8rem;\n  text-align: center;\n}\n.dmg-history-empty-icon {\n  font-size: 1.6rem;\n  opacity: 0.25;\n}\n.dmg-history-list {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  max-height: 400px;\n}\n.dmg-history-list::-webkit-scrollbar {\n  width: 4px;\n}\n.dmg-history-list::-webkit-scrollbar-track {\n  background: transparent;\n}\n.dmg-history-list::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n}\n.dmg-history-entry {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n  cursor: pointer;\n  transition: background 0.12s;\n  text-align: left;\n  color: var(--text, #e5e7eb);\n  width: 100%;\n}\n.dmg-history-entry:hover {\n  background: rgba(255, 255, 255, 0.05);\n}\n.dmg-history-entry:first-child {\n  border-top: none;\n}\n.dmg-hist-sev-icon {\n  font-size: 0.85rem;\n  flex-shrink: 0;\n  width: 14px;\n  text-align: center;\n}\n.dmg-hist-formula {\n  font-family: "Courier New", monospace;\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n  min-width: 0;\n}\n.dmg-hist-stab {\n  font-size: 0.72rem;\n  color: var(--muted, #9ca3af);\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n.dmg-hist-result {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.dmg-hist-raw {\n  font-size: 0.75rem;\n  font-family: "Courier New", monospace;\n  color: rgba(156, 163, 175, 0.6);\n  text-decoration: line-through;\n}\n.dmg-hist-arrow {\n  font-size: 0.7rem;\n  color: rgba(156, 163, 175, 0.4);\n}\n.dmg-hist-final {\n  font-size: 0.92rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  min-width: 28px;\n  text-align: right;\n}\n.dmg-history {\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  background: rgba(0, 0, 0, 0.1);\n}\n.dmg-history-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 10px 14px 8px;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n}\n.dmg-history-title {\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: var(--muted, #9ca3af);\n}\n.dmg-history-hint {\n  font-size: 0.65rem;\n  color: rgba(156, 163, 175, 0.5);\n  font-style: italic;\n}\n.dmg-history-empty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 32px 16px;\n  color: rgba(156, 163, 175, 0.4);\n  font-size: 0.8rem;\n  text-align: center;\n}\n.dmg-history-empty-icon {\n  font-size: 1.6rem;\n  opacity: 0.25;\n}\n.dmg-history-list {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  max-height: 400px;\n}\n.dmg-history-list::-webkit-scrollbar {\n  width: 4px;\n}\n.dmg-history-list::-webkit-scrollbar-track {\n  background: transparent;\n}\n.dmg-history-list::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n}\n.dmg-history-entry {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n  cursor: pointer;\n  transition: background 0.12s;\n  text-align: left;\n  color: var(--text, #e5e7eb);\n  width: 100%;\n}\n.dmg-history-entry:hover {\n  background: rgba(255, 255, 255, 0.05);\n}\n.dmg-history-entry:first-child {\n  border-top: none;\n}\n.dmg-hist-sev-icon {\n  font-size: 0.85rem;\n  flex-shrink: 0;\n  width: 14px;\n  text-align: center;\n}\n.dmg-hist-formula {\n  font-family: "Courier New", monospace;\n  font-size: 0.82rem;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n  min-width: 0;\n}\n.dmg-hist-stab {\n  font-size: 0.72rem;\n  color: var(--muted, #9ca3af);\n  flex-shrink: 0;\n  white-space: nowrap;\n}\n.dmg-hist-result {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.dmg-hist-raw {\n  font-size: 0.75rem;\n  font-family: "Courier New", monospace;\n  color: rgba(156, 163, 175, 0.6);\n  text-decoration: line-through;\n}\n.dmg-hist-arrow {\n  font-size: 0.7rem;\n  color: rgba(156, 163, 175, 0.4);\n}\n.dmg-hist-final {\n  font-size: 0.92rem;\n  font-weight: 800;\n  font-family: "Courier New", monospace;\n  min-width: 28px;\n  text-align: right;\n}\n.dmg-ruler {\n  margin-top: 4px;\n}\n.dmg-ruler-track {\n  display: flex;\n  align-items: stretch;\n  gap: 0;\n  background: rgba(0, 0, 0, 0.18);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  border-radius: 8px;\n  padding: 6px 4px;\n  overflow-x: auto;\n}\n.dmg-ruler-cell {\n  --tc: #9ca3af;\n  position: relative;\n  flex: 1 1 0;\n  min-width: 42px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n  padding: 2px 2px;\n  border-radius: 6px;\n  transition: background 0.15s, transform 0.15s;\n}\n.dmg-ruler-cell:not(:last-child)::after {\n  content: "";\n  position: absolute;\n  top: 13px;\n  right: -50%;\n  width: 100%;\n  height: 2px;\n  background: rgba(255, 255, 255, 0.12);\n  z-index: 0;\n}\n.dmg-ruler-icon {\n  position: relative;\n  z-index: 1;\n  font-size: 1.05rem;\n  line-height: 1;\n  color: var(--tc);\n  filter: grayscale(0.35);\n  opacity: 0.7;\n  transition: all 0.15s;\n}\n.dmg-ruler-range {\n  font-size: 0.6rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n  transition: color 0.15s;\n}\n/*# sourceMappingURL=damage-calculator.component.css.map */\n'] }]
  }], null, { worldName: [{
    type: Input
  }], characterName: [{
    type: Input
  }], characterId: [{
    type: Input
  }], initialEffektivitaet: [{
    type: Input
  }], rolled: [{
    type: Output
  }], close: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DamageCalculatorComponent, { className: "DamageCalculatorComponent", filePath: "app/world/damage-calculator/damage-calculator.component.ts", lineNumber: 74 });
})();

export {
  CharacterSocketService,
  WorldSocketService,
  DamageCalculatorComponent
};
//# sourceMappingURL=chunk-5ZPJN4WG.js.map
