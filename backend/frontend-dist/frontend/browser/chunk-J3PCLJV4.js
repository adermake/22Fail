import {
  createEmptyWorld
} from "./chunk-4YEN6ADO.js";
import {
  WorldSocketService
} from "./chunk-5ZPJN4WG.js";
import {
  setSfxVolume,
  sfxVolume
} from "./chunk-RAWCOLGX.js";
import {
  ImageUrlPipe
} from "./chunk-6EXL6IWA.js";
import {
  WorldApiService
} from "./chunk-YTW6ZOS6.js";
import {
  FormsModule
} from "./chunk-VMGRJE2Y.js";
import {
  CommonModule,
  NgClass
} from "./chunk-FGI44Z6P.js";
import {
  BehaviorSubject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  Output,
  ViewChild,
  computed,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵcomponentInstance,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomProperty,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵviewQuery
} from "./chunk-XJL25EXC.js";
import {
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/services/world-store.service.ts
var WorldStoreService = class _WorldStoreService {
  api;
  socket;
  worldSubject = new BehaviorSubject(null);
  world$ = this.worldSubject.asObservable();
  worldName;
  pendingPatchPaths = /* @__PURE__ */ new Set();
  get worldValue() {
    return this.worldSubject.value;
  }
  constructor(api, socket) {
    this.api = api;
    this.socket = socket;
    this.socket.patches$.subscribe((patch) => {
      const world = this.worldSubject.value;
      if (!world)
        return;
      if (this.pendingPatchPaths.has(patch.path)) {
        console.log("[WORLD STORE] Skipping echo of own patch:", patch.path);
        this.pendingPatchPaths.delete(patch.path);
        return;
      }
      this.applyJsonPatch(world, patch);
      this.worldSubject.next(__spreadValues({}, world));
    });
  }
  async save() {
    const world = this.worldSubject.value;
    if (!world) {
      console.warn("[WORLD STORE] No world loaded, cannot save.");
      return;
    }
    if (!this.worldName) {
      console.error("[WORLD STORE] No worldName set, cannot save.");
      return;
    }
    try {
      await this.api.saveWorld(this.worldName, world);
      console.log("[WORLD STORE] World saved successfully");
    } catch (err) {
      console.error("[WORLD STORE] Failed to save world:", err);
    }
  }
  async load(name) {
    this.worldName = name;
    console.log("[WORLD STORE] Loading world:", name);
    let world = await this.api.loadWorld(name);
    console.log("[WORLD STORE] Loaded world from API:", world);
    if (!world) {
      console.log("[WORLD STORE] No world found, creating new");
      world = createEmptyWorld(name);
      this.worldSubject.next(world);
      this.save();
    } else {
      let needsSave = false;
      if (world.characters && !world.characterIds) {
        console.log("[WORLD STORE] Migrating: characters -> characterIds");
        world.characterIds = world.characters;
        delete world.characters;
        needsSave = true;
      }
      if (world.party && !world.partyIds) {
        console.log("[WORLD STORE] Migrating: party -> partyIds");
        world.partyIds = world.party;
        delete world.party;
        needsSave = true;
      }
      if (world.library) {
        console.log("[WORLD STORE] Migrating: library object -> separate libraries");
        world.itemLibrary = world.library.items || [];
        world.runeLibrary = world.library.runes || [];
        world.spellLibrary = world.library.spells || [];
        world.skillLibrary = world.library.skills || [];
        delete world.library;
        needsSave = true;
      }
      if (!world.name) {
        world.name = name;
        needsSave = true;
      }
      if (world.worldClockMinutes === void 0 || world.worldClockMinutes === null) {
        console.log("[WORLD STORE] Migrating: adding worldClockMinutes");
        world.worldClockMinutes = Math.floor(Date.now() / 6e4);
        needsSave = true;
      }
      if (!world.worldClock) {
        console.log("[WORLD STORE] Migrating: adding worldClock");
        world.worldClock = {
          year: 321,
          day: 1,
          hour: 8,
          minute: 0
        };
        needsSave = true;
      }
      if (!world.encounterTimer) {
        console.log("[WORLD STORE] Migrating: adding encounterTimer");
        const startHour = (world.worldClock.year * 360 + (world.worldClock.day - 1)) * 24 + world.worldClock.hour;
        world.encounterTimer = {
          enabled: false,
          intervalHours: 4,
          nextTriggerAtHour: startHour + 4
        };
        needsSave = true;
      }
      if (!world.battleParticipants) {
        console.log("[WORLD STORE] Migrating: adding battleParticipants");
        world.battleParticipants = [];
        needsSave = true;
      }
      if (world.currentTurnIndex === void 0) {
        console.log("[WORLD STORE] Migrating: adding currentTurnIndex");
        world.currentTurnIndex = 0;
        needsSave = true;
      }
      if (!world.lootBundles) {
        console.log("[WORLD STORE] Migrating: adding lootBundles");
        world.lootBundles = [];
        needsSave = true;
      }
      if (!world.skillLibrary) {
        console.log("[WORLD STORE] Migrating: adding skillLibrary");
        world.skillLibrary = [];
        needsSave = true;
      }
      if (!world.trash) {
        console.log("[WORLD STORE] Migrating: adding trash");
        world.trash = [];
        needsSave = true;
      }
      if (!world.currentEvents) {
        console.log("[WORLD STORE] Migrating: adding currentEvents");
        world.currentEvents = [];
        needsSave = true;
      }
      console.log("[WORLD STORE] Setting loaded world with", world.battleParticipants?.length || 0, "battle participants");
      this.worldSubject.next(world);
      if (needsSave) {
        console.log("[WORLD STORE] Saving migrated world to backend");
        await this.save();
      }
    }
    this.socket.connect();
    this.socket.joinWorld(name);
  }
  applyPatch(patch) {
    const world = this.worldSubject.value;
    if (world) {
      this.applyJsonPatch(world, patch);
      this.worldSubject.next(__spreadValues({}, world));
    }
    this.pendingPatchPaths.add(patch.path);
    setTimeout(() => this.pendingPatchPaths.delete(patch.path), 5e3);
    this.socket.sendPatch(this.worldName, patch);
  }
  revealBattleLoot() {
    this.socket.revealBattleLoot(this.worldName);
  }
  applyJsonPatch(target, patch) {
    let normalizedPath = patch.path.trim();
    if (normalizedPath.startsWith("/")) {
      normalizedPath = normalizedPath.substring(1);
    }
    normalizedPath = normalizedPath.replace(/\//g, ".");
    const keys = normalizedPath.split(".");
    let current = target;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);
      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = current[key] ??= {};
      }
    }
    const finalKey = keys[keys.length - 1];
    if (finalKey === "-" && Array.isArray(current)) {
      current.push(patch.value);
      return;
    }
    const finalIndex = parseInt(finalKey, 10);
    if (!isNaN(finalIndex) && Array.isArray(current)) {
      current[finalIndex] = patch.value;
    } else {
      current[finalKey] = patch.value;
    }
  }
  static \u0275fac = function WorldStoreService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WorldStoreService)(\u0275\u0275inject(WorldApiService), \u0275\u0275inject(WorldSocketService));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _WorldStoreService, factory: _WorldStoreService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WorldStoreService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: WorldApiService }, { type: WorldSocketService }], null);
})();

// src/app/world/battle-tracker/battle-tracker.component.ts
var _c0 = ["timelineContainer"];
function BattleTracker_Conditional_1_For_2_For_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 8);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const tile_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 2, tile_r2.portrait), \u0275\u0275sanitizeUrl)("alt", tile_r2.name);
  }
}
function BattleTracker_Conditional_1_For_2_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 9);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tile_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tile_r2.name.charAt(0));
  }
}
function BattleTracker_Conditional_1_For_2_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 12);
    \u0275\u0275listener("click", function BattleTracker_Conditional_1_For_2_For_2_Conditional_5_Template_button_click_0_listener($event) {
      \u0275\u0275restoreView(_r4);
      const tile_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      ctx_r2.dismissEffectReminder.emit(tile_r2.characterId);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275element(1, "span", 13);
    \u0275\u0275elementEnd();
  }
}
function BattleTracker_Conditional_1_For_2_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 7);
    \u0275\u0275listener("click", function BattleTracker_Conditional_1_For_2_For_2_Template_div_click_0_listener($event) {
      const tile_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onCompactTileClick($event, tile_r2));
    });
    \u0275\u0275conditionalCreate(1, BattleTracker_Conditional_1_For_2_For_2_Conditional_1_Template, 2, 4, "img", 8)(2, BattleTracker_Conditional_1_For_2_For_2_Conditional_2_Template, 2, 1, "span", 9);
    \u0275\u0275elementStart(3, "span", 10);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, BattleTracker_Conditional_1_For_2_For_2_Conditional_5_Template, 2, 0, "button", 11);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tile_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("compact-tile--selected", ctx_r2.selectedCharacterId === tile_r2.characterId);
    \u0275\u0275property("ngClass", "team-" + tile_r2.team);
    \u0275\u0275advance();
    \u0275\u0275conditional(tile_r2.portrait ? 1 : 2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(tile_r2.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.effectReminderIds.has(tile_r2.characterId) ? 5 : -1);
  }
}
function BattleTracker_Conditional_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5);
    \u0275\u0275repeaterCreate(1, BattleTracker_Conditional_1_For_2_For_2_Template, 6, 6, "div", 6, \u0275\u0275componentInstance().trackTile, true);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const group_r5 = ctx.$implicit;
    const \u0275$index_6_r6 = ctx.$index;
    \u0275\u0275classProp("first-group", \u0275$index_6_r6 === 0);
    \u0275\u0275property("ngClass", "team-" + group_r5.team);
    \u0275\u0275advance();
    \u0275\u0275repeater(group_r5.tiles);
  }
}
function BattleTracker_Conditional_1_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 4);
    \u0275\u0275text(1, "Keine Teilnehmer");
    \u0275\u0275elementEnd();
  }
}
function BattleTracker_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 2);
    \u0275\u0275repeaterCreate(1, BattleTracker_Conditional_1_For_2_Template, 3, 3, "div", 3, \u0275\u0275componentInstance().trackGroup, true);
    \u0275\u0275conditionalCreate(3, BattleTracker_Conditional_1_Conditional_3_Template, 2, 0, "span", 4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.timeline());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.timeline().length === 0 ? 3 : -1);
  }
}
function BattleTracker_Conditional_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 15)(1, "button", 21);
    \u0275\u0275listener("click", function BattleTracker_Conditional_2_Conditional_3_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onResetTurnMeters());
    });
    \u0275\u0275text(2, " Reset Meters ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 22);
    \u0275\u0275listener("click", function BattleTracker_Conditional_2_Conditional_3_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onResetBattle());
    });
    \u0275\u0275text(4, " Reset Battle ");
    \u0275\u0275elementEnd()();
  }
}
function BattleTracker_Conditional_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16)(1, "span", 23);
    \u0275\u0275text(2, "Current Turn:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 24);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r2.currentTurnDisplay());
  }
}
function BattleTracker_Conditional_2_Conditional_5_For_6_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 36);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const char_r10 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 1, char_r10.portrait), \u0275\u0275sanitizeUrl);
  }
}
function BattleTracker_Conditional_2_Conditional_5_For_6_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const char_r10 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(char_r10.name.charAt(0) || "?");
  }
}
function BattleTracker_Conditional_2_Conditional_5_For_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 35);
    \u0275\u0275listener("dragstart", function BattleTracker_Conditional_2_Conditional_5_For_6_Template_div_dragstart_0_listener($event) {
      const char_r10 = \u0275\u0275restoreView(_r9).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onCharDragStart($event, char_r10));
    });
    \u0275\u0275conditionalCreate(1, BattleTracker_Conditional_2_Conditional_5_For_6_Conditional_1_Template, 2, 3, "img", 36)(2, BattleTracker_Conditional_2_Conditional_5_For_6_Conditional_2_Template, 2, 1, "span", 37);
    \u0275\u0275elementStart(3, "span", 38);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const char_r10 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275conditional(char_r10.portrait ? 1 : 2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(char_r10.name);
  }
}
function BattleTracker_Conditional_2_Conditional_5_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 30);
    \u0275\u0275text(1, "All in battle");
    \u0275\u0275elementEnd();
  }
}
function BattleTracker_Conditional_2_Conditional_5_For_13_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 36);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const char_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 1, char_r12.portrait), \u0275\u0275sanitizeUrl);
  }
}
function BattleTracker_Conditional_2_Conditional_5_For_13_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const char_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(char_r12.name.charAt(0) || "?");
  }
}
function BattleTracker_Conditional_2_Conditional_5_For_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 39);
    \u0275\u0275listener("dragstart", function BattleTracker_Conditional_2_Conditional_5_For_13_Template_div_dragstart_0_listener($event) {
      const char_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onCharDragStart($event, char_r12));
    });
    \u0275\u0275conditionalCreate(1, BattleTracker_Conditional_2_Conditional_5_For_13_Conditional_1_Template, 2, 3, "img", 36)(2, BattleTracker_Conditional_2_Conditional_5_For_13_Conditional_2_Template, 2, 1, "span", 37);
    \u0275\u0275elementStart(3, "span", 38);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const char_r12 = ctx.$implicit;
    \u0275\u0275property("ngClass", "team-" + char_r12.team);
    \u0275\u0275advance();
    \u0275\u0275conditional(char_r12.portrait ? 1 : 2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(char_r12.name);
  }
}
function BattleTracker_Conditional_2_Conditional_5_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 33);
    \u0275\u0275text(1, "Drag characters here");
    \u0275\u0275elementEnd();
  }
}
function BattleTracker_Conditional_2_Conditional_5_Conditional_15_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 42)(1, "span", 43);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 44)(4, "div", 45);
    \u0275\u0275element(5, "div", 46)(6, "div", 47);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 48);
    \u0275\u0275listener("mousedown", function BattleTracker_Conditional_2_Conditional_5_Conditional_15_For_5_Template_input_mousedown_7_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.onMeterDragStart());
    })("mouseup", function BattleTracker_Conditional_2_Conditional_5_Conditional_15_For_5_Template_input_mouseup_7_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.onMeterDragEnd());
    })("input", function BattleTracker_Conditional_2_Conditional_5_Conditional_15_For_5_Template_input_input_7_listener($event) {
      const char_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.onTurnMeterInput(char_r14.id, $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "span", 49);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const char_r14 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275property("ngClass", "team-" + char_r14.team);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(char_r14.name);
    \u0275\u0275advance();
    \u0275\u0275classProp("dragging", ctx_r2.isDraggingMeter());
    \u0275\u0275advance(2);
    \u0275\u0275styleProp("width", ctx_r2.getTurnMeterPercent(char_r14), "%");
    \u0275\u0275advance();
    \u0275\u0275styleProp("left", ctx_r2.getTurnMeterPercent(char_r14), "%");
    \u0275\u0275advance();
    \u0275\u0275property("min", 0)("max", ctx_r2.TURN_METER_MAX - 1)("value", char_r14.turnMeter);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(char_r14.turnMeter);
  }
}
function BattleTracker_Conditional_2_Conditional_5_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 34)(1, "div", 40);
    \u0275\u0275text(2, "Turn Meters");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 41);
    \u0275\u0275repeaterCreate(4, BattleTracker_Conditional_2_Conditional_5_Conditional_15_For_5_Template, 10, 12, "div", 42, \u0275\u0275componentInstance().trackChar, true);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r2.inBattleCharacters());
  }
}
function BattleTracker_Conditional_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 25)(1, "div", 26);
    \u0275\u0275listener("dragover", function BattleTracker_Conditional_2_Conditional_5_Template_div_dragover_1_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onAvailableColumnDragOver($event));
    })("drop", function BattleTracker_Conditional_2_Conditional_5_Template_div_drop_1_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onAvailableColumnDrop($event));
    });
    \u0275\u0275elementStart(2, "div", 27);
    \u0275\u0275text(3, "Available");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 28);
    \u0275\u0275repeaterCreate(5, BattleTracker_Conditional_2_Conditional_5_For_6_Template, 5, 2, "div", 29, \u0275\u0275componentInstance().trackChar, true);
    \u0275\u0275conditionalCreate(7, BattleTracker_Conditional_2_Conditional_5_Conditional_7_Template, 2, 0, "div", 30);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 31);
    \u0275\u0275listener("dragover", function BattleTracker_Conditional_2_Conditional_5_Template_div_dragover_8_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onBattleColumnDragOver($event));
    })("drop", function BattleTracker_Conditional_2_Conditional_5_Template_div_drop_8_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onBattleColumnDrop($event));
    });
    \u0275\u0275elementStart(9, "div", 27);
    \u0275\u0275text(10, "In Battle");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 28);
    \u0275\u0275repeaterCreate(12, BattleTracker_Conditional_2_Conditional_5_For_13_Template, 5, 3, "div", 32, \u0275\u0275componentInstance().trackChar, true);
    \u0275\u0275conditionalCreate(14, BattleTracker_Conditional_2_Conditional_5_Conditional_14_Template, 2, 0, "div", 33);
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(15, BattleTracker_Conditional_2_Conditional_5_Conditional_15_Template, 6, 0, "div", 34);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r2.availableCharacters());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.availableCharacters().length === 0 ? 7 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275repeater(ctx_r2.inBattleCharacters());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.inBattleCharacters().length === 0 ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.inBattleCharacters().length > 0 ? 15 : -1);
  }
}
function BattleTracker_Conditional_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19)(1, "span");
    \u0275\u0275text(2, "Add characters to start battle");
    \u0275\u0275elementEnd()();
  }
}
function BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 55);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const tile_r16 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 2, tile_r16.portrait), \u0275\u0275sanitizeUrl)("alt", tile_r16.name);
  }
}
function BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 56);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tile_r16 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tile_r16.name.charAt(0) || "?");
  }
}
function BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54);
    \u0275\u0275listener("click", function BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Template_div_click_0_listener($event) {
      const tile_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.onTileClick($event, tile_r16));
    });
    \u0275\u0275conditionalCreate(1, BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Conditional_1_Template, 2, 4, "img", 55)(2, BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Conditional_2_Template, 2, 1, "span", 56);
    \u0275\u0275elementStart(3, "span", 57);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 58);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const tile_r16 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("animating", ctx_r2.isAnimating(tile_r16.id));
    \u0275\u0275property("ngClass", "team-" + tile_r16.team);
    \u0275\u0275attribute("data-tile-id", tile_r16.id);
    \u0275\u0275advance();
    \u0275\u0275conditional(tile_r16.portrait ? 1 : 2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(tile_r16.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(tile_r16.speed - 10);
  }
}
function BattleTracker_Conditional_2_Conditional_10_For_1_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 53);
  }
}
function BattleTracker_Conditional_2_Conditional_10_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 51);
    \u0275\u0275repeaterCreate(1, BattleTracker_Conditional_2_Conditional_10_For_1_For_2_Template, 7, 7, "div", 52, \u0275\u0275componentInstance().trackTile, true);
    \u0275\u0275conditionalCreate(3, BattleTracker_Conditional_2_Conditional_10_For_1_Conditional_3_Template, 1, 0, "div", 53);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const group_r17 = ctx.$implicit;
    const \u0275$index_147_r18 = ctx.$index;
    \u0275\u0275classProp("first-group", \u0275$index_147_r18 === 0);
    \u0275\u0275property("ngClass", "team-" + group_r17.team);
    \u0275\u0275attribute("data-group-id", group_r17.id);
    \u0275\u0275advance();
    \u0275\u0275repeater(group_r17.tiles);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(group_r17.tiles.length > 1 ? 3 : -1);
  }
}
function BattleTracker_Conditional_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, BattleTracker_Conditional_2_Conditional_10_For_1_Template, 4, 5, "div", 50, \u0275\u0275componentInstance().trackGroup, true);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r2.timeline());
  }
}
function BattleTracker_Conditional_2_Conditional_11_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 62);
    \u0275\u0275listener("click", function BattleTracker_Conditional_2_Conditional_11_For_3_Template_button_click_0_listener() {
      const team_r21 = \u0275\u0275restoreView(_r20).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onRadialTeamSelect(team_r21));
    });
    \u0275\u0275element(1, "span", 63);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_15_0;
    const team_r21 = ctx.$implicit;
    const \u0275$index_175_r22 = ctx.$index;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275styleProp("--angle", \u0275$index_175_r22 * 60 - 90 + "deg");
    \u0275\u0275classProp("selected", ((tmp_15_0 = ctx_r2.getRadialMenuChar()) == null ? null : tmp_15_0.team) === team_r21);
    \u0275\u0275property("ngClass", "team-" + team_r21)("title", team_r21);
  }
}
function BattleTracker_Conditional_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59);
    \u0275\u0275listener("click", function BattleTracker_Conditional_2_Conditional_11_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r19);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeRadialMenu());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(1, "div", 60);
    \u0275\u0275repeaterCreate(2, BattleTracker_Conditional_2_Conditional_11_For_3_Template, 2, 6, "button", 61, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275styleProp("left", ctx_r2.radialMenuPosition().x, "px")("top", ctx_r2.radialMenuPosition().y, "px");
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.teams);
  }
}
function BattleTracker_Conditional_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 20)(1, "button", 64);
    \u0275\u0275listener("click", function BattleTracker_Conditional_2_Conditional_12_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onNextTurn());
    });
    \u0275\u0275text(2, " Next Turn ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r2.timeline().length === 0);
  }
}
function BattleTracker_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 14)(1, "h2");
    \u0275\u0275text(2, "Battle Tracker");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, BattleTracker_Conditional_2_Conditional_3_Template, 5, 0, "div", 15);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, BattleTracker_Conditional_2_Conditional_4_Template, 5, 1, "div", 16);
    \u0275\u0275conditionalCreate(5, BattleTracker_Conditional_2_Conditional_5_Template, 16, 3);
    \u0275\u0275elementStart(6, "div", 17)(7, "div", 18, 0);
    \u0275\u0275conditionalCreate(9, BattleTracker_Conditional_2_Conditional_9_Template, 3, 0, "div", 19)(10, BattleTracker_Conditional_2_Conditional_10_Template, 2, 0);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(11, BattleTracker_Conditional_2_Conditional_11_Template, 4, 4);
    \u0275\u0275conditionalCreate(12, BattleTracker_Conditional_2_Conditional_12_Template, 3, 1, "div", 20);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275conditional(!ctx_r2.readOnly ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.currentTurnDisplay() ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.readOnly ? 5 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r2.timeline().length === 0 ? 9 : 10);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.radialMenuOpen() ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.readOnly ? 12 : -1);
  }
}
var BattleTracker = class _BattleTracker {
  engine;
  readOnly = false;
  // View-only mode for lobby
  compactMode = false;
  // Compact top-bar mode for lobby
  effectReminderIds = /* @__PURE__ */ new Set();
  selectedCharacterId = null;
  dismissEffectReminder = new EventEmitter();
  tileSelect = new EventEmitter();
  timelineRef;
  cdr = inject(ChangeDetectorRef);
  // Reactive state
  timeline = signal([], ...ngDevMode ? [{ debugName: "timeline" }] : []);
  participants = signal([], ...ngDevMode ? [{ debugName: "participants" }] : []);
  allCharacters = signal([], ...ngDevMode ? [{ debugName: "allCharacters" }] : []);
  currentTurnDisplay = signal(null, ...ngDevMode ? [{ debugName: "currentTurnDisplay" }] : []);
  // Computed: characters NOT in battle (for available column)
  availableCharacters = computed(() => this.allCharacters().filter((c) => !c.isInBattle), ...ngDevMode ? [{ debugName: "availableCharacters" }] : []);
  // Computed: characters IN battle (for battle column)
  inBattleCharacters = computed(() => this.allCharacters().filter((c) => c.isInBattle), ...ngDevMode ? [{ debugName: "inBattleCharacters" }] : []);
  // Drag state for character tiles
  draggedCharId = null;
  // Radial menu state
  radialMenuOpen = signal(false, ...ngDevMode ? [{ debugName: "radialMenuOpen" }] : []);
  radialMenuPosition = signal({ x: 0, y: 0 }, ...ngDevMode ? [{ debugName: "radialMenuPosition" }] : []);
  radialMenuCharId = null;
  // Slider drag state (to disable animations while dragging)
  isDraggingMeter = signal(false, ...ngDevMode ? [{ debugName: "isDraggingMeter" }] : []);
  meterUpdateTimeout = null;
  // Available teams
  teams = ["blue", "red", "green", "yellow", "purple", "orange"];
  // Turn meter max value
  TURN_METER_MAX = 1e3;
  // Animation state
  animState = {
    previousPositions: /* @__PURE__ */ new Map(),
    animatingIds: /* @__PURE__ */ new Set(),
    isAnimating: false
  };
  ngOnInit() {
    if (this.engine) {
      this.engine.setChangeCallback(() => this.onEngineChange());
      this.refresh();
    }
  }
  ngOnDestroy() {
    if (this.engine) {
      this.engine.setChangeCallback(() => {
      });
    }
    if (this.meterUpdateTimeout) {
      clearTimeout(this.meterUpdateTimeout);
    }
  }
  // Close radial menu when clicking outside
  onEscapeKey() {
    this.closeRadialMenu();
  }
  // ============================================
  // Data Refresh
  // ============================================
  onEngineChange() {
    if (this.isDraggingMeter() || this.readOnly) {
      this.refresh();
      return;
    }
    this.recordPositions();
    this.animState.isAnimating = true;
    this.refresh();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.animateTransitions();
        setTimeout(() => {
          this.animState.isAnimating = false;
        }, 350);
      });
    });
  }
  refresh() {
    this.timeline.set(this.engine.getTimeline());
    const chars = this.engine.getCharacters();
    this.allCharacters.set(chars);
    this.participants.set(chars.filter((c) => c.isInBattle));
    this.currentTurnDisplay.set(this.engine.getCurrentTurnDisplay());
    this.cdr.detectChanges();
  }
  // ============================================
  // FLIP Animations
  // ============================================
  recordPositions() {
    if (!this.timelineRef?.nativeElement)
      return;
    const container = this.timelineRef.nativeElement;
    this.animState.previousPositions.clear();
    const tiles = container.querySelectorAll("[data-tile-id]");
    tiles.forEach((el) => {
      const id = el.dataset["tileId"];
      if (id) {
        const rect = el.getBoundingClientRect();
        this.animState.previousPositions.set(id, { x: rect.left, y: rect.top });
      }
    });
  }
  animateTransitions() {
    if (!this.timelineRef?.nativeElement)
      return;
    const container = this.timelineRef.nativeElement;
    const tiles = container.querySelectorAll("[data-tile-id]");
    tiles.forEach((el) => {
      const id = el.dataset["tileId"];
      if (!id)
        return;
      const prevPos = this.animState.previousPositions.get(id);
      const currentRect = el.getBoundingClientRect();
      if (!prevPos) {
        this.animateIn(el, id);
      } else {
        this.animateMove(el, id, prevPos);
      }
    });
  }
  animateIn(el, id) {
    if (this.animState.animatingIds.has(id))
      return;
    this.animState.animatingIds.add(id);
    el.style.transition = "none";
    el.style.transform = "translateY(-40px)";
    el.style.opacity = "0";
    void el.offsetHeight;
    el.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
    el.style.transform = "translateY(0)";
    el.style.opacity = "1";
    this.cleanupAfterAnimation(el, id, 350);
  }
  animateMove(el, id, prevPos) {
    const rect = el.getBoundingClientRect();
    const deltaX = prevPos.x - rect.left;
    const deltaY = prevPos.y - rect.top;
    if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2)
      return;
    if (this.animState.animatingIds.has(id))
      return;
    this.animState.animatingIds.add(id);
    el.style.transition = "none";
    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    void el.offsetHeight;
    el.style.transition = "transform 0.3s ease-out";
    el.style.transform = "translate(0, 0)";
    this.cleanupAfterAnimation(el, id, 350);
  }
  cleanupAfterAnimation(el, id, timeout) {
    setTimeout(() => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
      this.animState.animatingIds.delete(id);
    }, timeout);
  }
  // ============================================
  // Character Actions (World View Only)
  // ============================================
  onAddCharacter(characterId) {
    if (this.readOnly)
      return;
    this.recordPositions();
    this.engine.addCharacter(characterId);
  }
  onRemoveCharacter(characterId) {
    if (this.readOnly)
      return;
    this.recordPositions();
    this.engine.removeCharacter(characterId);
  }
  onTeamChange(characterId, team) {
    if (this.readOnly)
      return;
    this.recordPositions();
    this.engine.setTeam(characterId, team);
  }
  // ============================================
  // Character Drag & Drop
  // ============================================
  onCharDragStart(event, char) {
    this.draggedCharId = char.id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", char.id);
    }
  }
  onBattleColumnDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }
  onBattleColumnDrop(event) {
    event.preventDefault();
    if (this.draggedCharId) {
      const char = this.allCharacters().find((c) => c.id === this.draggedCharId);
      if (char && !char.isInBattle) {
        this.onAddCharacter(this.draggedCharId);
      }
    }
    this.draggedCharId = null;
  }
  onAvailableColumnDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }
  onAvailableColumnDrop(event) {
    event.preventDefault();
    if (this.draggedCharId) {
      const char = this.allCharacters().find((c) => c.id === this.draggedCharId);
      if (char && char.isInBattle) {
        this.onRemoveCharacter(this.draggedCharId);
      }
    }
    this.draggedCharId = null;
  }
  // ============================================
  // Turn Meter Controls (World View Only)
  // ============================================
  onMeterDragStart() {
    this.isDraggingMeter.set(true);
  }
  onMeterDragEnd() {
    setTimeout(() => {
      this.isDraggingMeter.set(false);
    }, 50);
  }
  onTurnMeterInput(characterId, event) {
    if (this.readOnly)
      return;
    const value = parseInt(event.target.value, 10);
    if (this.meterUpdateTimeout) {
      clearTimeout(this.meterUpdateTimeout);
    }
    this.engine.setTurnMeterImmediate(characterId, value);
    this.meterUpdateTimeout = setTimeout(() => {
      this.engine.saveTurnMeter(characterId, value);
    }, 100);
  }
  onTurnMeterChange(characterId, event) {
    if (this.readOnly)
      return;
    const value = parseInt(event.target.value, 10);
    this.recordPositions();
    this.engine.setTurnMeter(characterId, value);
  }
  onResetTurnMeters() {
    if (this.readOnly)
      return;
    this.recordPositions();
    this.engine.resetTurnMeters();
  }
  // ============================================
  // Radial Team Menu
  // ============================================
  onTileClick(event, tile) {
    if (this.readOnly)
      return;
    event.stopPropagation();
    const char = this.inBattleCharacters().find((c) => c.id === tile.characterId);
    if (!char)
      return;
    this.radialMenuCharId = tile.characterId;
    this.radialMenuPosition.set({ x: event.clientX, y: event.clientY });
    this.radialMenuOpen.set(true);
  }
  onCompactTileClick(event, tile) {
    if (event.target.closest(".compact-effect-reminder"))
      return;
    this.tileSelect.emit(tile.characterId);
  }
  closeRadialMenu() {
    this.radialMenuOpen.set(false);
    this.radialMenuCharId = null;
  }
  getRadialMenuChar() {
    if (!this.radialMenuCharId)
      return null;
    return this.inBattleCharacters().find((c) => c.id === this.radialMenuCharId) || null;
  }
  onRadialTeamSelect(team) {
    if (this.radialMenuCharId) {
      this.recordPositions();
      this.engine.setTeam(this.radialMenuCharId, team);
    }
    this.closeRadialMenu();
  }
  onRadialRemove() {
    if (this.radialMenuCharId) {
      this.recordPositions();
      this.engine.removeCharacter(this.radialMenuCharId);
    }
    this.closeRadialMenu();
  }
  // ============================================
  // Battle Controls
  // ============================================
  onNextTurn() {
    if (this.readOnly)
      return;
    if (this.animState.isAnimating)
      return;
    this.recordPositions();
    this.engine.nextTurn();
  }
  onResetBattle() {
    if (this.readOnly)
      return;
    this.recordPositions();
    this.engine.resetBattle();
  }
  // ============================================
  // Template Helpers
  // ============================================
  trackGroup(index, group) {
    return group.id;
  }
  trackTile(index, tile) {
    return tile.id;
  }
  trackChar(index, char) {
    return char.id;
  }
  isAnimating(id) {
    return this.animState.animatingIds.has(id);
  }
  /** Get turn meter percentage for progress bar */
  getTurnMeterPercent(char) {
    return char.turnMeter / this.TURN_METER_MAX * 100;
  }
  static \u0275fac = function BattleTracker_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BattleTracker)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BattleTracker, selectors: [["app-battle-tracker"]], viewQuery: function BattleTracker_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c0, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.timelineRef = _t.first);
    }
  }, hostBindings: function BattleTracker_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown.escape", function BattleTracker_keydown_escape_HostBindingHandler() {
        return ctx.onEscapeKey();
      }, \u0275\u0275resolveDocument);
    }
  }, inputs: { engine: "engine", readOnly: "readOnly", compactMode: "compactMode", effectReminderIds: "effectReminderIds", selectedCharacterId: "selectedCharacterId" }, outputs: { dismissEffectReminder: "dismissEffectReminder", tileSelect: "tileSelect" }, decls: 3, vars: 5, consts: [["timelineContainer", ""], [1, "battle-tracker-container"], [1, "compact-timeline"], [1, "compact-group", 3, "ngClass", "first-group"], [1, "compact-empty"], [1, "compact-group", 3, "ngClass"], [1, "compact-tile", 3, "ngClass", "compact-tile--selected"], [1, "compact-tile", 3, "click", "ngClass"], [1, "compact-tile-portrait", 3, "src", "alt"], [1, "compact-tile-portrait", "compact-tile-initial"], [1, "compact-tile-name"], ["type", "button", "title", "Status-Effekte ausl\xF6sen?", 1, "compact-effect-reminder"], ["type", "button", "title", "Status-Effekte ausl\xF6sen?", 1, "compact-effect-reminder", 3, "click"], [1, "app-icon", "i-status-effect"], [1, "battle-header"], [1, "header-buttons"], [1, "current-turn-display"], [1, "timeline-section"], [1, "timeline"], [1, "empty-timeline"], [1, "controls"], ["title", "Reset all turn meters to 0", 1, "reset-meters-btn", 3, "click"], ["title", "Clear all participants", 1, "reset-button", 3, "click"], [1, "label"], [1, "names"], [1, "characters-grid-section"], [1, "character-column", "available-column", 3, "dragover", "drop"], [1, "column-header"], [1, "character-tiles"], ["draggable", "true", "title", "Drag to add to battle", 1, "character-tile"], [1, "empty-column"], [1, "character-column", "battle-column", 3, "dragover", "drop"], ["draggable", "true", "title", "Drag to remove from battle", 1, "character-tile", "in-battle", 3, "ngClass"], [1, "empty-column", "drop-zone"], [1, "turn-meters-section"], ["draggable", "true", "title", "Drag to add to battle", 1, "character-tile", 3, "dragstart"], ["alt", "", 1, "tile-portrait-small", 3, "src"], [1, "tile-portrait-small", "tile-initial"], [1, "tile-char-name"], ["draggable", "true", "title", "Drag to remove from battle", 1, "character-tile", "in-battle", 3, "dragstart", "ngClass"], [1, "meters-header"], [1, "meters-list"], [1, "meter-row", 3, "ngClass"], [1, "meter-name"], [1, "meter-slider-wrapper"], [1, "meter-track"], [1, "meter-fill"], [1, "meter-thumb"], ["type", "range", 1, "meter-input", 3, "mousedown", "mouseup", "input", "min", "max", "value"], [1, "meter-value"], [1, "turn-group", 3, "ngClass", "first-group"], [1, "turn-group", 3, "ngClass"], [1, "tile", 3, "animating", "ngClass"], [1, "group-line"], [1, "tile", 3, "click", "ngClass"], [1, "tile-portrait", 3, "src", "alt"], [1, "tile-portrait", "tile-initial"], [1, "tile-name"], [1, "tile-speed"], [1, "radial-menu-backdrop", 3, "click"], [1, "radial-menu"], [1, "radial-team-btn", 3, "ngClass", "selected", "title", "--angle"], [1, "radial-team-btn", 3, "click", "ngClass", "title"], [1, "radial-color-circle"], ["title", "Advance to next turn", 1, "next-turn-btn", 3, "click", "disabled"]], template: function BattleTracker_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 1);
      \u0275\u0275conditionalCreate(1, BattleTracker_Conditional_1_Template, 4, 1, "div", 2)(2, BattleTracker_Conditional_2_Template, 13, 6);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275classProp("read-only", ctx.readOnly)("compact-mode", ctx.compactMode);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.compactMode ? 1 : 2);
    }
  }, dependencies: [CommonModule, NgClass, FormsModule, ImageUrlPipe], styles: ['\n\n.battle-tracker-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n  background: #1a1a2e;\n  border-radius: 8px;\n  color: #eee;\n  min-height: 200px;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n  min-height: auto;\n  gap: 0.5rem;\n}\n.battle-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  border-bottom: 1px solid #333;\n  padding-bottom: 0.5rem;\n}\n.battle-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  color: #fff;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .battle-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n.header-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.reset-button[_ngcontent-%COMP%], \n.reset-meters-btn[_ngcontent-%COMP%] {\n  padding: 0.35rem 0.75rem;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  transition: background 0.2s;\n}\n.reset-button[_ngcontent-%COMP%] {\n  background: #e74c3c;\n  color: white;\n}\n.reset-button[_ngcontent-%COMP%]:hover {\n  background: #c0392b;\n}\n.reset-meters-btn[_ngcontent-%COMP%] {\n  background: #7f8c8d;\n  color: white;\n}\n.reset-meters-btn[_ngcontent-%COMP%]:hover {\n  background: #6c7a7b;\n}\n.current-turn-display[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #2c3e50,\n      #34495e);\n  padding: 0.75rem 1rem;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.current-turn-display[_ngcontent-%COMP%]   .label[_ngcontent-%COMP%] {\n  color: #95a5a6;\n  font-size: 0.9rem;\n}\n.current-turn-display[_ngcontent-%COMP%]   .names[_ngcontent-%COMP%] {\n  color: #fff;\n  font-weight: 600;\n  font-size: 1.1rem;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .current-turn-display[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.75rem;\n}\n.characters-grid-section[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.5rem;\n  max-height: 180px;\n}\n.character-column[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  background: #1a1a30;\n  border-radius: 6px;\n  overflow: hidden;\n}\n.column-header[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n  padding: 0.4rem 0.5rem;\n  background: #252540;\n  text-align: center;\n  border-bottom: 1px solid #333;\n}\n.character-tiles[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));\n  gap: 0.35rem;\n  padding: 0.35rem;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 60px;\n}\n.character-tile[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 0.35rem;\n  background: #252540;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background 0.15s, transform 0.1s;\n  border: 2px solid transparent;\n}\n.character-tile[_ngcontent-%COMP%]:hover {\n  background: #303050;\n  transform: scale(1.05);\n}\n.character-tile.in-battle[_ngcontent-%COMP%] {\n  position: relative;\n}\n.character-tile.team-blue[_ngcontent-%COMP%] {\n  border-color: #3498db;\n}\n.character-tile.team-red[_ngcontent-%COMP%] {\n  border-color: #e74c3c;\n}\n.character-tile.team-green[_ngcontent-%COMP%] {\n  border-color: #27ae60;\n}\n.character-tile.team-yellow[_ngcontent-%COMP%] {\n  border-color: #f1c40f;\n}\n.character-tile.team-purple[_ngcontent-%COMP%] {\n  border-color: #9b59b6;\n}\n.character-tile.team-orange[_ngcontent-%COMP%] {\n  border-color: #e67e22;\n}\n.tile-portrait-small[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  object-fit: cover;\n  background: #333;\n}\n.tile-char-name[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  color: #ccc;\n  text-align: center;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 50px;\n  margin-top: 0.2rem;\n}\n.mini-team-selector[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 2px;\n  right: 2px;\n  width: 14px;\n  height: 14px;\n  padding: 0;\n  background: #333;\n  border: 1px solid #555;\n  border-radius: 3px;\n  color: #fff;\n  font-size: 0.5rem;\n  cursor: pointer;\n  opacity: 0;\n  transition: opacity 0.15s;\n}\n.character-tile[_ngcontent-%COMP%]:hover   .mini-team-selector[_ngcontent-%COMP%] {\n  opacity: 1;\n}\n.empty-column[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n  text-align: center;\n  color: #555;\n  font-size: 0.7rem;\n  font-style: italic;\n  padding: 1rem;\n}\n.empty-column.drop-zone[_ngcontent-%COMP%] {\n  border: 2px dashed #444;\n  border-radius: 4px;\n  background: #1f1f35;\n}\n.available-column[_ngcontent-%COMP%] {\n  border: 1px solid #333;\n}\n.battle-column[_ngcontent-%COMP%] {\n  border: 1px solid #444;\n  background: #1f1f35;\n}\n.turn-meters-section[_ngcontent-%COMP%] {\n  background: #1a1a30;\n  border-radius: 6px;\n  padding: 0.5rem;\n}\n.meters-header[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n  margin-bottom: 0.4rem;\n}\n.meters-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n}\n.meter-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.25rem 0;\n}\n.meter-row.team-blue[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #2980b9,\n      #3498db);\n}\n.meter-row.team-red[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #c0392b,\n      #e74c3c);\n}\n.meter-row.team-green[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #219a52,\n      #27ae60);\n}\n.meter-row.team-yellow[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #d4a300,\n      #f1c40f);\n}\n.meter-row.team-purple[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #8e44ad,\n      #9b59b6);\n}\n.meter-row.team-orange[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #d35400,\n      #e67e22);\n}\n.meter-row.team-blue[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  background: #3498db;\n}\n.meter-row.team-red[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  background: #e74c3c;\n}\n.meter-row.team-green[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  background: #27ae60;\n}\n.meter-row.team-yellow[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  background: #f1c40f;\n}\n.meter-row.team-purple[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  background: #9b59b6;\n}\n.meter-row.team-orange[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  background: #e67e22;\n}\n.meter-name[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #bbb;\n  min-width: 60px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.meter-slider-wrapper[_ngcontent-%COMP%] {\n  flex: 1;\n  position: relative;\n  height: 16px;\n}\n.meter-track[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 6px;\n  transform: translateY(-50%);\n  background: #333;\n  border-radius: 3px;\n  overflow: visible;\n}\n.meter-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.1s ease-out;\n}\n.meter-thumb[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 50%;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);\n  pointer-events: none;\n  transition: left 0.1s ease-out;\n}\n.meter-slider-wrapper.dragging[_ngcontent-%COMP%]   .meter-fill[_ngcontent-%COMP%], \n.meter-slider-wrapper.dragging[_ngcontent-%COMP%]   .meter-thumb[_ngcontent-%COMP%] {\n  transition: none !important;\n}\n.meter-input[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  cursor: pointer;\n  margin: 0;\n}\n.meter-value[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: #777;\n  min-width: 28px;\n  text-align: right;\n}\n.timeline-section[_ngcontent-%COMP%] {\n  margin-top: 0.5rem;\n}\n.timeline[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  background: #16162a;\n  border-radius: 6px;\n  overflow-x: auto;\n  min-height: 100px;\n  align-items: flex-start;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .timeline[_ngcontent-%COMP%] {\n  min-height: 70px;\n  padding: 0.5rem;\n}\n.empty-timeline[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  color: #555;\n  font-style: italic;\n}\n.turn-group[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  position: relative;\n  flex-shrink: 0;\n  background: rgba(255, 255, 255, 0.03);\n  border: 2px solid transparent;\n}\n.turn-group.first-group[_ngcontent-%COMP%] {\n  border-color: rgba(255, 255, 255, 0.3);\n  background: rgba(255, 255, 255, 0.08);\n}\n.turn-group.team-blue[_ngcontent-%COMP%] {\n  border-color: #3498db40;\n  background: #3498db15;\n}\n.turn-group.team-red[_ngcontent-%COMP%] {\n  border-color: #e74c3c40;\n  background: #e74c3c15;\n}\n.turn-group.team-green[_ngcontent-%COMP%] {\n  border-color: #27ae6040;\n  background: #27ae6015;\n}\n.turn-group.team-yellow[_ngcontent-%COMP%] {\n  border-color: #f1c40f40;\n  background: #f1c40f15;\n}\n.turn-group.team-purple[_ngcontent-%COMP%] {\n  border-color: #9b59b640;\n  background: #9b59b615;\n}\n.turn-group.team-orange[_ngcontent-%COMP%] {\n  border-color: #e67e2240;\n  background: #e67e2215;\n}\n.turn-group.first-group.team-blue[_ngcontent-%COMP%] {\n  border-color: #3498db80;\n  background: #3498db25;\n}\n.turn-group.first-group.team-red[_ngcontent-%COMP%] {\n  border-color: #e74c3c80;\n  background: #e74c3c25;\n}\n.turn-group.first-group.team-green[_ngcontent-%COMP%] {\n  border-color: #27ae6080;\n  background: #27ae6025;\n}\n.turn-group.first-group.team-yellow[_ngcontent-%COMP%] {\n  border-color: #f1c40f80;\n  background: #f1c40f25;\n}\n.turn-group.first-group.team-purple[_ngcontent-%COMP%] {\n  border-color: #9b59b680;\n  background: #9b59b625;\n}\n.turn-group.first-group.team-orange[_ngcontent-%COMP%] {\n  border-color: #e67e2280;\n  background: #e67e2225;\n}\n.group-line[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 4px;\n  left: 8px;\n  right: 8px;\n  height: 3px;\n  border-radius: 2px;\n  background: currentColor;\n  opacity: 0.4;\n}\n.turn-group.team-blue[_ngcontent-%COMP%]   .group-line[_ngcontent-%COMP%] {\n  color: #3498db;\n}\n.turn-group.team-red[_ngcontent-%COMP%]   .group-line[_ngcontent-%COMP%] {\n  color: #e74c3c;\n}\n.turn-group.team-green[_ngcontent-%COMP%]   .group-line[_ngcontent-%COMP%] {\n  color: #27ae60;\n}\n.turn-group.team-yellow[_ngcontent-%COMP%]   .group-line[_ngcontent-%COMP%] {\n  color: #f1c40f;\n}\n.turn-group.team-purple[_ngcontent-%COMP%]   .group-line[_ngcontent-%COMP%] {\n  color: #9b59b6;\n}\n.turn-group.team-orange[_ngcontent-%COMP%]   .group-line[_ngcontent-%COMP%] {\n  color: #e67e22;\n}\n.tile[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.25rem;\n  padding: 0.5rem;\n  background: #252540;\n  border-radius: 6px;\n  min-width: 60px;\n  transition: transform 0.3s ease-out, opacity 0.3s ease-out;\n  border: 2px solid transparent;\n}\n.tile.team-blue[_ngcontent-%COMP%] {\n  border-color: #3498db;\n}\n.tile.team-red[_ngcontent-%COMP%] {\n  border-color: #e74c3c;\n}\n.tile.team-green[_ngcontent-%COMP%] {\n  border-color: #27ae60;\n}\n.tile.team-yellow[_ngcontent-%COMP%] {\n  border-color: #f1c40f;\n}\n.tile.team-purple[_ngcontent-%COMP%] {\n  border-color: #9b59b6;\n}\n.tile.team-orange[_ngcontent-%COMP%] {\n  border-color: #e67e22;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .tile[_ngcontent-%COMP%] {\n  min-width: 50px;\n  padding: 0.35rem;\n}\n.tile-portrait[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 50%;\n  object-fit: cover;\n  background: #333;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .tile-portrait[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n}\n.tile-name[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #ddd;\n  text-align: center;\n  max-width: 55px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .tile-name[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  max-width: 45px;\n}\n.tile-speed[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: #aaa;\n  font-weight: 500;\n}\n.tile-speed[_ngcontent-%COMP%]::before {\n  content: "\\26a1";\n  margin-right: 2px;\n  font-size: 0.55rem;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .tile-speed[_ngcontent-%COMP%] {\n  font-size: 0.55rem;\n}\n.turn-number[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  color: #777;\n}\n.battle-tracker-container.read-only[_ngcontent-%COMP%]   .turn-number[_ngcontent-%COMP%] {\n  font-size: 0.55rem;\n}\n.turn-meter-fill.team-blue[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #2980b9,\n      #3498db);\n}\n.turn-meter-fill.team-red[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #c0392b,\n      #e74c3c);\n}\n.turn-meter-fill.team-green[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #219a52,\n      #27ae60);\n}\n.turn-meter-fill.team-yellow[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #d4a300,\n      #f1c40f);\n}\n.turn-meter-fill.team-purple[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #8e44ad,\n      #9b59b6);\n}\n.turn-meter-fill.team-orange[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #d35400,\n      #e67e22);\n}\n.controls[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding-top: 0.5rem;\n  border-top: 1px solid #333;\n}\n.next-turn-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 2rem;\n  background:\n    linear-gradient(\n      135deg,\n      #3498db,\n      #2980b9);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 600;\n  transition: background 0.2s, transform 0.1s;\n}\n.next-turn-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background:\n    linear-gradient(\n      135deg,\n      #2980b9,\n      #1a5276);\n  transform: translateY(-1px);\n}\n.next-turn-btn[_ngcontent-%COMP%]:active:not(:disabled) {\n  transform: translateY(0);\n}\n.next-turn-btn[_ngcontent-%COMP%]:disabled {\n  background: #444;\n  cursor: not-allowed;\n  opacity: 0.5;\n}\n.timeline[_ngcontent-%COMP%]::-webkit-scrollbar {\n  height: 6px;\n}\n.timeline[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: #1a1a2e;\n  border-radius: 3px;\n}\n.timeline[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #444;\n  border-radius: 3px;\n}\n.timeline[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n.characters-section[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 6px;\n}\n.characters-section[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: #1a1a2e;\n  border-radius: 3px;\n}\n.characters-section[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #444;\n  border-radius: 3px;\n}\n.characters-section[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n.radial-menu-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 999;\n}\n.radial-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 1000;\n  width: 0;\n  height: 0;\n  transform: translate(-50%, -50%);\n}\n.radial-team-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  border: 3px solid transparent;\n  cursor: pointer;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: transform 0.15s, border-color 0.15s;\n  background: rgba(26, 26, 46, 0.95);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);\n  transform: rotate(var(--angle)) translateY(-50px) rotate(calc(-1 * var(--angle)));\n}\n.radial-team-btn[_ngcontent-%COMP%]:hover {\n  transform: rotate(var(--angle)) translateY(-50px) rotate(calc(-1 * var(--angle))) scale(1.2);\n}\n.radial-team-btn.selected[_ngcontent-%COMP%] {\n  border-color: #fff;\n  transform: rotate(var(--angle)) translateY(-50px) rotate(calc(-1 * var(--angle))) scale(1.25);\n}\n.radial-color-circle[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n.radial-team-btn.team-blue[_ngcontent-%COMP%]   .radial-color-circle[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #3498db,\n      #2980b9);\n}\n.radial-team-btn.team-red[_ngcontent-%COMP%]   .radial-color-circle[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #e74c3c,\n      #c0392b);\n}\n.radial-team-btn.team-green[_ngcontent-%COMP%]   .radial-color-circle[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #27ae60,\n      #219a52);\n}\n.radial-team-btn.team-yellow[_ngcontent-%COMP%]   .radial-color-circle[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #f1c40f,\n      #d4a300);\n}\n.radial-team-btn.team-purple[_ngcontent-%COMP%]   .radial-color-circle[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #9b59b6,\n      #8e44ad);\n}\n.radial-team-btn.team-orange[_ngcontent-%COMP%]   .radial-color-circle[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #e67e22,\n      #d35400);\n}\n.tile-initial[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background:\n    linear-gradient(\n      135deg,\n      #3498db,\n      #2980b9);\n  color: white;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n.tile-portrait-small.tile-initial[_ngcontent-%COMP%] {\n  font-size: 14px;\n}\n.tile-portrait.tile-initial[_ngcontent-%COMP%] {\n  font-size: 20px;\n}\n.battle-tracker-container.compact-mode[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n}\n.compact-timeline[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex: 1;\n  overflow-x: auto;\n  scrollbar-width: none;\n  padding: 2px 0;\n}\n.compact-timeline[_ngcontent-%COMP%]::-webkit-scrollbar {\n  display: none;\n}\n.compact-group[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n}\n.compact-group.team-blue[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: rgba(52, 152, 219, 0.8);\n  background: rgba(52, 152, 219, 0.18);\n}\n.compact-group.team-red[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: rgba(231, 76, 60, 0.85);\n  background: rgba(231, 76, 60, 0.2);\n}\n.compact-group.team-green[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: rgba(39, 174, 96, 0.85);\n  background: rgba(39, 174, 96, 0.2);\n}\n.compact-group.team-yellow[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: rgba(241, 196, 15, 0.85);\n  background: rgba(241, 196, 15, 0.22);\n}\n.compact-group.team-purple[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: rgba(155, 89, 182, 0.85);\n  background: rgba(155, 89, 182, 0.2);\n}\n.compact-group.team-orange[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: rgba(230, 126, 34, 0.85);\n  background: rgba(230, 126, 34, 0.2);\n}\n.compact-tile.team-blue[_ngcontent-%COMP%] {\n  border-color: rgba(52, 152, 219, 0.95);\n}\n.compact-tile.team-red[_ngcontent-%COMP%] {\n  border-color: rgba(231, 76, 60, 0.95);\n}\n.compact-tile.team-green[_ngcontent-%COMP%] {\n  border-color: rgba(39, 174, 96, 0.95);\n}\n.compact-tile.team-yellow[_ngcontent-%COMP%] {\n  border-color: rgba(241, 196, 15, 0.95);\n}\n.compact-tile.team-purple[_ngcontent-%COMP%] {\n  border-color: rgba(155, 89, 182, 0.95);\n}\n.compact-tile.team-orange[_ngcontent-%COMP%] {\n  border-color: rgba(230, 126, 34, 0.95);\n}\n.compact-group.first-group[_ngcontent-%COMP%]   .compact-tile[_ngcontent-%COMP%] {\n  border-color: #fbbf24;\n  box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);\n}\n.compact-tile[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n  padding: 2px 4px;\n  border-radius: 5px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  background: rgba(255, 255, 255, 0.07);\n  min-width: 36px;\n  cursor: pointer;\n  transition: box-shadow 0.15s, transform 0.1s;\n}\n.compact-tile[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);\n}\n.compact-tile--selected[_ngcontent-%COMP%] {\n  box-shadow: 0 0 0 2px #fbbf24, 0 0 10px rgba(251, 191, 36, 0.45) !important;\n}\n.compact-tile-portrait[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  object-fit: cover;\n}\n.compact-tile-initial[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.12);\n  font-size: 14px;\n  font-weight: 700;\n  color: #e5e7eb;\n}\n.compact-tile-name[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  color: #9ca3af;\n  white-space: nowrap;\n  max-width: 50px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.compact-effect-reminder[_ngcontent-%COMP%] {\n  position: absolute;\n  top: -4px;\n  right: -4px;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  border: 1px solid rgba(251, 191, 36, 0.8);\n  background: rgba(251, 191, 36, 0.25);\n  color: #fbbf24;\n  font-size: 10px;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0;\n  animation: _ngcontent-%COMP%_effect-reminder-pulse 1s ease-in-out infinite;\n}\n.compact-tile[_ngcontent-%COMP%] {\n  position: relative;\n}\n@keyframes _ngcontent-%COMP%_effect-reminder-pulse {\n  0%, 100% {\n    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5);\n  }\n  50% {\n    box-shadow: 0 0 8px 2px rgba(251, 191, 36, 0.7);\n  }\n}\n.compact-empty[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #6b7280;\n  padding: 0 0.5rem;\n}\n/*# sourceMappingURL=battle-tracker.component.css.map */'] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BattleTracker, [{
    type: Component,
    args: [{ selector: "app-battle-tracker", standalone: true, imports: [CommonModule, FormsModule, ImageUrlPipe], template: `<div class="battle-tracker-container" [class.read-only]="readOnly" [class.compact-mode]="compactMode">\r
\r
  @if (compactMode) {\r
    <!-- Compact mode: just show timeline inline -->\r
    <div class="compact-timeline">\r
      @for (group of timeline(); track trackGroup($index, group); let gIdx = $index) {\r
        <div class="compact-group" [ngClass]="'team-' + group.team" [class.first-group]="gIdx === 0">\r
          @for (tile of group.tiles; track trackTile($index, tile)) {\r
            <div class="compact-tile"\r
              [ngClass]="'team-' + tile.team"\r
              [class.compact-tile--selected]="selectedCharacterId === tile.characterId"\r
              (click)="onCompactTileClick($event, tile)">\r
              @if (tile.portrait) {\r
                <img [src]="tile.portrait | imageUrl" [alt]="tile.name" class="compact-tile-portrait">\r
              } @else {\r
                <span class="compact-tile-portrait compact-tile-initial">{{ tile.name.charAt(0) }}</span>\r
              }\r
              <span class="compact-tile-name">{{ tile.name }}</span>\r
              @if (effectReminderIds.has(tile.characterId)) {\r
                <button\r
                  type="button"\r
                  class="compact-effect-reminder"\r
                  title="Status-Effekte ausl\xF6sen?"\r
                  (click)="dismissEffectReminder.emit(tile.characterId); $event.stopPropagation()">\r
                  <span class="app-icon i-status-effect"></span>\r
                </button>\r
              }\r
            </div>\r
          }\r
        </div>\r
      }\r
      @if (timeline().length === 0) {\r
        <span class="compact-empty">Keine Teilnehmer</span>\r
      }\r
    </div>\r
  } @else {\r
  <!-- Header -->\r
  <div class="battle-header">\r
    <h2>Battle Tracker</h2>\r
    @if (!readOnly) {\r
      <div class="header-buttons">\r
        <button class="reset-meters-btn" (click)="onResetTurnMeters()" title="Reset all turn meters to 0">\r
          Reset Meters\r
        </button>\r
        <button class="reset-button" (click)="onResetBattle()" title="Clear all participants">\r
          Reset Battle\r
        </button>\r
      </div>\r
    }\r
  </div>\r
\r
  <!-- Current Turn Display -->\r
  @if (currentTurnDisplay()) {\r
    <div class="current-turn-display">\r
      <span class="label">Current Turn:</span>\r
      <span class="names">{{ currentTurnDisplay() }}</span>\r
    </div>\r
  }\r
\r
  <!-- Character Grid (World View Only) - Two columns: Available | In Battle -->\r
  @if (!readOnly) {\r
    <div class="characters-grid-section">\r
      <!-- Available Characters (Left) -->\r
      <div \r
        class="character-column available-column"\r
        (dragover)="onAvailableColumnDragOver($event)"\r
        (drop)="onAvailableColumnDrop($event)"\r
      >\r
        <div class="column-header">Available</div>\r
        <div class="character-tiles">\r
          @for (char of availableCharacters(); track trackChar($index, char)) {\r
            <div \r
              class="character-tile"\r
              draggable="true"\r
              (dragstart)="onCharDragStart($event, char)"\r
              title="Drag to add to battle"\r
            >\r
              @if (char.portrait) {\r
                <img [src]="char.portrait | imageUrl" class="tile-portrait-small" alt="">\r
              } @else {\r
                <span class="tile-portrait-small tile-initial">{{ char.name.charAt(0) || '?' }}</span>\r
              }\r
              <span class="tile-char-name">{{ char.name }}</span>\r
            </div>\r
          }\r
          @if (availableCharacters().length === 0) {\r
            <div class="empty-column">All in battle</div>\r
          }\r
        </div>\r
      </div>\r
\r
      <!-- In Battle Characters (Right) -->\r
      <div \r
        class="character-column battle-column"\r
        (dragover)="onBattleColumnDragOver($event)"\r
        (drop)="onBattleColumnDrop($event)"\r
      >\r
        <div class="column-header">In Battle</div>\r
        <div class="character-tiles">\r
          @for (char of inBattleCharacters(); track trackChar($index, char)) {\r
            <div \r
              class="character-tile in-battle"\r
              [ngClass]="'team-' + char.team"\r
              draggable="true"\r
              (dragstart)="onCharDragStart($event, char)"\r
              title="Drag to remove from battle"\r
            >\r
              @if (char.portrait) {\r
                <img [src]="char.portrait | imageUrl" class="tile-portrait-small" alt="">\r
              } @else {\r
                <span class="tile-portrait-small tile-initial">{{ char.name.charAt(0) || '?' }}</span>\r
              }\r
              <span class="tile-char-name">{{ char.name }}</span>\r
            </div>\r
          }\r
          @if (inBattleCharacters().length === 0) {\r
            <div class="empty-column drop-zone">Drag characters here</div>\r
          }\r
        </div>\r
      </div>\r
    </div>\r
\r
    <!-- Turn Meters for In-Battle Characters -->\r
    @if (inBattleCharacters().length > 0) {\r
      <div class="turn-meters-section">\r
        <div class="meters-header">Turn Meters</div>\r
        <div class="meters-list">\r
          @for (char of inBattleCharacters(); track trackChar($index, char)) {\r
            <div class="meter-row" [ngClass]="'team-' + char.team">\r
                <span class="meter-name">{{ char.name }}</span>\r
                <div class="meter-slider-wrapper" [class.dragging]="isDraggingMeter()">\r
                  <div class="meter-track">\r
                    <div \r
                      class="meter-fill"\r
                      [style.width.%]="getTurnMeterPercent(char)"\r
                    ></div>\r
                    <div \r
                      class="meter-thumb"\r
                      [style.left.%]="getTurnMeterPercent(char)"\r
                    ></div>\r
                  </div>\r
                  <input \r
                    type="range" \r
                    class="meter-input"\r
                    [min]="0" \r
                    [max]="TURN_METER_MAX - 1" \r
                    [value]="char.turnMeter"\r
                    (mousedown)="onMeterDragStart()"\r
                    (mouseup)="onMeterDragEnd()"\r
                    (input)="onTurnMeterInput(char.id, $event)"\r
                  >\r
                </div>\r
                <span class="meter-value">{{ char.turnMeter }}</span>\r
              </div>\r
          }\r
        </div>\r
      </div>\r
    }\r
  }\r
\r
  <!-- Timeline -->\r
  <div class="timeline-section">\r
    <div \r
      class="timeline" \r
      #timelineContainer\r
    >\r
      @if (timeline().length === 0) {\r
        <div class="empty-timeline">\r
          <span>Add characters to start battle</span>\r
        </div>\r
      } @else {\r
        @for (group of timeline(); track trackGroup($index, group); let gIdx = $index) {\r
          <div \r
            class="turn-group"\r
            [attr.data-group-id]="group.id"\r
            [ngClass]="'team-' + group.team"\r
            [class.first-group]="gIdx === 0"\r
          >\r
            <!-- Tiles -->\r
            @for (tile of group.tiles; track trackTile($index, tile)) {\r
              <div \r
                class="tile"\r
                [attr.data-tile-id]="tile.id"\r
                [class.animating]="isAnimating(tile.id)"\r
                [ngClass]="'team-' + tile.team"\r
                (click)="onTileClick($event, tile)"\r
            >\r
                @if (tile.portrait) {\r
                  <img \r
                    [src]="tile.portrait | imageUrl" \r
                    [alt]="tile.name"\r
                    class="tile-portrait"\r
                  >\r
                } @else {\r
                  <span class="tile-portrait tile-initial">{{ tile.name.charAt(0) || '?' }}</span>\r
                }\r
                <span class="tile-name">{{ tile.name }}</span>\r
                <span class="tile-speed">{{ tile.speed - 10 }}</span>\r
              </div>\r
            }\r
\r
            <!-- Group indicator line (when multiple tiles in group) -->\r
            @if (group.tiles.length > 1) {\r
              <div class="group-line"></div>\r
            }\r
          </div>\r
        }\r
      }\r
    </div>\r
  </div>\r
\r
  <!-- Radial Team Menu -->\r
  @if (radialMenuOpen()) {\r
    <div class="radial-menu-backdrop" (click)="closeRadialMenu()"></div>\r
    <div class="radial-menu" [style.left.px]="radialMenuPosition().x" [style.top.px]="radialMenuPosition().y">\r
      @for (team of teams; track team; let i = $index) {\r
        <button \r
          class="radial-team-btn" \r
          [ngClass]="'team-' + team"\r
          [class.selected]="getRadialMenuChar()?.team === team"\r
          (click)="onRadialTeamSelect(team)"\r
          [title]="team"\r
          [style.--angle]="(i * 60 - 90) + 'deg'"\r
        >\r
          <span class="radial-color-circle"></span>\r
        </button>\r
      }\r
    </div>\r
  }\r
\r
  <!-- Controls -->\r
  @if (!readOnly) {\r
    <div class="controls">\r
      <button \r
        class="next-turn-btn"\r
        (click)="onNextTurn()" \r
        [disabled]="timeline().length === 0"\r
        title="Advance to next turn"\r
      >\r
        Next Turn\r
      </button>\r
    </div>\r
  }\r
\r
  } <!-- end @else (compact-mode) -->\r
\r
</div>\r
`, styles: ['/* src/app/world/battle-tracker/battle-tracker.component.css */\n.battle-tracker-container {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n  background: #1a1a2e;\n  border-radius: 8px;\n  color: #eee;\n  min-height: 200px;\n}\n.battle-tracker-container.read-only {\n  padding: 0.5rem;\n  min-height: auto;\n  gap: 0.5rem;\n}\n.battle-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  border-bottom: 1px solid #333;\n  padding-bottom: 0.5rem;\n}\n.battle-header h2 {\n  margin: 0;\n  font-size: 1.25rem;\n  color: #fff;\n}\n.battle-tracker-container.read-only .battle-header h2 {\n  font-size: 1rem;\n}\n.header-buttons {\n  display: flex;\n  gap: 0.5rem;\n}\n.reset-button,\n.reset-meters-btn {\n  padding: 0.35rem 0.75rem;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.85rem;\n  transition: background 0.2s;\n}\n.reset-button {\n  background: #e74c3c;\n  color: white;\n}\n.reset-button:hover {\n  background: #c0392b;\n}\n.reset-meters-btn {\n  background: #7f8c8d;\n  color: white;\n}\n.reset-meters-btn:hover {\n  background: #6c7a7b;\n}\n.current-turn-display {\n  background:\n    linear-gradient(\n      135deg,\n      #2c3e50,\n      #34495e);\n  padding: 0.75rem 1rem;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.current-turn-display .label {\n  color: #95a5a6;\n  font-size: 0.9rem;\n}\n.current-turn-display .names {\n  color: #fff;\n  font-weight: 600;\n  font-size: 1.1rem;\n}\n.battle-tracker-container.read-only .current-turn-display {\n  padding: 0.5rem 0.75rem;\n}\n.characters-grid-section {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0.5rem;\n  max-height: 180px;\n}\n.character-column {\n  display: flex;\n  flex-direction: column;\n  background: #1a1a30;\n  border-radius: 6px;\n  overflow: hidden;\n}\n.column-header {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n  padding: 0.4rem 0.5rem;\n  background: #252540;\n  text-align: center;\n  border-bottom: 1px solid #333;\n}\n.character-tiles {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));\n  gap: 0.35rem;\n  padding: 0.35rem;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 60px;\n}\n.character-tile {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 0.35rem;\n  background: #252540;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background 0.15s, transform 0.1s;\n  border: 2px solid transparent;\n}\n.character-tile:hover {\n  background: #303050;\n  transform: scale(1.05);\n}\n.character-tile.in-battle {\n  position: relative;\n}\n.character-tile.team-blue {\n  border-color: #3498db;\n}\n.character-tile.team-red {\n  border-color: #e74c3c;\n}\n.character-tile.team-green {\n  border-color: #27ae60;\n}\n.character-tile.team-yellow {\n  border-color: #f1c40f;\n}\n.character-tile.team-purple {\n  border-color: #9b59b6;\n}\n.character-tile.team-orange {\n  border-color: #e67e22;\n}\n.tile-portrait-small {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  object-fit: cover;\n  background: #333;\n}\n.tile-char-name {\n  font-size: 0.6rem;\n  color: #ccc;\n  text-align: center;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 50px;\n  margin-top: 0.2rem;\n}\n.mini-team-selector {\n  position: absolute;\n  bottom: 2px;\n  right: 2px;\n  width: 14px;\n  height: 14px;\n  padding: 0;\n  background: #333;\n  border: 1px solid #555;\n  border-radius: 3px;\n  color: #fff;\n  font-size: 0.5rem;\n  cursor: pointer;\n  opacity: 0;\n  transition: opacity 0.15s;\n}\n.character-tile:hover .mini-team-selector {\n  opacity: 1;\n}\n.empty-column {\n  grid-column: 1 / -1;\n  text-align: center;\n  color: #555;\n  font-size: 0.7rem;\n  font-style: italic;\n  padding: 1rem;\n}\n.empty-column.drop-zone {\n  border: 2px dashed #444;\n  border-radius: 4px;\n  background: #1f1f35;\n}\n.available-column {\n  border: 1px solid #333;\n}\n.battle-column {\n  border: 1px solid #444;\n  background: #1f1f35;\n}\n.turn-meters-section {\n  background: #1a1a30;\n  border-radius: 6px;\n  padding: 0.5rem;\n}\n.meters-header {\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n  margin-bottom: 0.4rem;\n}\n.meters-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.35rem;\n}\n.meter-row {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.25rem 0;\n}\n.meter-row.team-blue .meter-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #2980b9,\n      #3498db);\n}\n.meter-row.team-red .meter-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #c0392b,\n      #e74c3c);\n}\n.meter-row.team-green .meter-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #219a52,\n      #27ae60);\n}\n.meter-row.team-yellow .meter-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #d4a300,\n      #f1c40f);\n}\n.meter-row.team-purple .meter-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #8e44ad,\n      #9b59b6);\n}\n.meter-row.team-orange .meter-fill {\n  background:\n    linear-gradient(\n      90deg,\n      #d35400,\n      #e67e22);\n}\n.meter-row.team-blue .meter-thumb {\n  background: #3498db;\n}\n.meter-row.team-red .meter-thumb {\n  background: #e74c3c;\n}\n.meter-row.team-green .meter-thumb {\n  background: #27ae60;\n}\n.meter-row.team-yellow .meter-thumb {\n  background: #f1c40f;\n}\n.meter-row.team-purple .meter-thumb {\n  background: #9b59b6;\n}\n.meter-row.team-orange .meter-thumb {\n  background: #e67e22;\n}\n.meter-name {\n  font-size: 0.7rem;\n  color: #bbb;\n  min-width: 60px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.meter-slider-wrapper {\n  flex: 1;\n  position: relative;\n  height: 16px;\n}\n.meter-track {\n  position: absolute;\n  top: 50%;\n  left: 0;\n  right: 0;\n  height: 6px;\n  transform: translateY(-50%);\n  background: #333;\n  border-radius: 3px;\n  overflow: visible;\n}\n.meter-fill {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.1s ease-out;\n}\n.meter-thumb {\n  position: absolute;\n  top: 50%;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  transform: translate(-50%, -50%);\n  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);\n  pointer-events: none;\n  transition: left 0.1s ease-out;\n}\n.meter-slider-wrapper.dragging .meter-fill,\n.meter-slider-wrapper.dragging .meter-thumb {\n  transition: none !important;\n}\n.meter-input {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  cursor: pointer;\n  margin: 0;\n}\n.meter-value {\n  font-size: 0.65rem;\n  color: #777;\n  min-width: 28px;\n  text-align: right;\n}\n.timeline-section {\n  margin-top: 0.5rem;\n}\n.timeline {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  background: #16162a;\n  border-radius: 6px;\n  overflow-x: auto;\n  min-height: 100px;\n  align-items: flex-start;\n}\n.battle-tracker-container.read-only .timeline {\n  min-height: 70px;\n  padding: 0.5rem;\n}\n.empty-timeline {\n  flex: 1;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  color: #555;\n  font-style: italic;\n}\n.turn-group {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  position: relative;\n  flex-shrink: 0;\n  background: rgba(255, 255, 255, 0.03);\n  border: 2px solid transparent;\n}\n.turn-group.first-group {\n  border-color: rgba(255, 255, 255, 0.3);\n  background: rgba(255, 255, 255, 0.08);\n}\n.turn-group.team-blue {\n  border-color: #3498db40;\n  background: #3498db15;\n}\n.turn-group.team-red {\n  border-color: #e74c3c40;\n  background: #e74c3c15;\n}\n.turn-group.team-green {\n  border-color: #27ae6040;\n  background: #27ae6015;\n}\n.turn-group.team-yellow {\n  border-color: #f1c40f40;\n  background: #f1c40f15;\n}\n.turn-group.team-purple {\n  border-color: #9b59b640;\n  background: #9b59b615;\n}\n.turn-group.team-orange {\n  border-color: #e67e2240;\n  background: #e67e2215;\n}\n.turn-group.first-group.team-blue {\n  border-color: #3498db80;\n  background: #3498db25;\n}\n.turn-group.first-group.team-red {\n  border-color: #e74c3c80;\n  background: #e74c3c25;\n}\n.turn-group.first-group.team-green {\n  border-color: #27ae6080;\n  background: #27ae6025;\n}\n.turn-group.first-group.team-yellow {\n  border-color: #f1c40f80;\n  background: #f1c40f25;\n}\n.turn-group.first-group.team-purple {\n  border-color: #9b59b680;\n  background: #9b59b625;\n}\n.turn-group.first-group.team-orange {\n  border-color: #e67e2280;\n  background: #e67e2225;\n}\n.group-line {\n  position: absolute;\n  bottom: 4px;\n  left: 8px;\n  right: 8px;\n  height: 3px;\n  border-radius: 2px;\n  background: currentColor;\n  opacity: 0.4;\n}\n.turn-group.team-blue .group-line {\n  color: #3498db;\n}\n.turn-group.team-red .group-line {\n  color: #e74c3c;\n}\n.turn-group.team-green .group-line {\n  color: #27ae60;\n}\n.turn-group.team-yellow .group-line {\n  color: #f1c40f;\n}\n.turn-group.team-purple .group-line {\n  color: #9b59b6;\n}\n.turn-group.team-orange .group-line {\n  color: #e67e22;\n}\n.tile {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0.25rem;\n  padding: 0.5rem;\n  background: #252540;\n  border-radius: 6px;\n  min-width: 60px;\n  transition: transform 0.3s ease-out, opacity 0.3s ease-out;\n  border: 2px solid transparent;\n}\n.tile.team-blue {\n  border-color: #3498db;\n}\n.tile.team-red {\n  border-color: #e74c3c;\n}\n.tile.team-green {\n  border-color: #27ae60;\n}\n.tile.team-yellow {\n  border-color: #f1c40f;\n}\n.tile.team-purple {\n  border-color: #9b59b6;\n}\n.tile.team-orange {\n  border-color: #e67e22;\n}\n.battle-tracker-container.read-only .tile {\n  min-width: 50px;\n  padding: 0.35rem;\n}\n.tile-portrait {\n  width: 36px;\n  height: 36px;\n  border-radius: 50%;\n  object-fit: cover;\n  background: #333;\n}\n.battle-tracker-container.read-only .tile-portrait {\n  width: 28px;\n  height: 28px;\n}\n.tile-name {\n  font-size: 0.75rem;\n  color: #ddd;\n  text-align: center;\n  max-width: 55px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.battle-tracker-container.read-only .tile-name {\n  font-size: 0.65rem;\n  max-width: 45px;\n}\n.tile-speed {\n  font-size: 0.65rem;\n  color: #aaa;\n  font-weight: 500;\n}\n.tile-speed::before {\n  content: "\\26a1";\n  margin-right: 2px;\n  font-size: 0.55rem;\n}\n.battle-tracker-container.read-only .tile-speed {\n  font-size: 0.55rem;\n}\n.turn-number {\n  font-size: 0.65rem;\n  color: #777;\n}\n.battle-tracker-container.read-only .turn-number {\n  font-size: 0.55rem;\n}\n.turn-meter-fill.team-blue {\n  background:\n    linear-gradient(\n      90deg,\n      #2980b9,\n      #3498db);\n}\n.turn-meter-fill.team-red {\n  background:\n    linear-gradient(\n      90deg,\n      #c0392b,\n      #e74c3c);\n}\n.turn-meter-fill.team-green {\n  background:\n    linear-gradient(\n      90deg,\n      #219a52,\n      #27ae60);\n}\n.turn-meter-fill.team-yellow {\n  background:\n    linear-gradient(\n      90deg,\n      #d4a300,\n      #f1c40f);\n}\n.turn-meter-fill.team-purple {\n  background:\n    linear-gradient(\n      90deg,\n      #8e44ad,\n      #9b59b6);\n}\n.turn-meter-fill.team-orange {\n  background:\n    linear-gradient(\n      90deg,\n      #d35400,\n      #e67e22);\n}\n.controls {\n  display: flex;\n  justify-content: center;\n  padding-top: 0.5rem;\n  border-top: 1px solid #333;\n}\n.next-turn-btn {\n  padding: 0.75rem 2rem;\n  background:\n    linear-gradient(\n      135deg,\n      #3498db,\n      #2980b9);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 600;\n  transition: background 0.2s, transform 0.1s;\n}\n.next-turn-btn:hover:not(:disabled) {\n  background:\n    linear-gradient(\n      135deg,\n      #2980b9,\n      #1a5276);\n  transform: translateY(-1px);\n}\n.next-turn-btn:active:not(:disabled) {\n  transform: translateY(0);\n}\n.next-turn-btn:disabled {\n  background: #444;\n  cursor: not-allowed;\n  opacity: 0.5;\n}\n.timeline::-webkit-scrollbar {\n  height: 6px;\n}\n.timeline::-webkit-scrollbar-track {\n  background: #1a1a2e;\n  border-radius: 3px;\n}\n.timeline::-webkit-scrollbar-thumb {\n  background: #444;\n  border-radius: 3px;\n}\n.timeline::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n.characters-section::-webkit-scrollbar {\n  width: 6px;\n}\n.characters-section::-webkit-scrollbar-track {\n  background: #1a1a2e;\n  border-radius: 3px;\n}\n.characters-section::-webkit-scrollbar-thumb {\n  background: #444;\n  border-radius: 3px;\n}\n.characters-section::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n.radial-menu-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 999;\n}\n.radial-menu {\n  position: fixed;\n  z-index: 1000;\n  width: 0;\n  height: 0;\n  transform: translate(-50%, -50%);\n}\n.radial-team-btn {\n  position: absolute;\n  width: 40px;\n  height: 40px;\n  border-radius: 50%;\n  border: 3px solid transparent;\n  cursor: pointer;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: transform 0.15s, border-color 0.15s;\n  background: rgba(26, 26, 46, 0.95);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);\n  transform: rotate(var(--angle)) translateY(-50px) rotate(calc(-1 * var(--angle)));\n}\n.radial-team-btn:hover {\n  transform: rotate(var(--angle)) translateY(-50px) rotate(calc(-1 * var(--angle))) scale(1.2);\n}\n.radial-team-btn.selected {\n  border-color: #fff;\n  transform: rotate(var(--angle)) translateY(-50px) rotate(calc(-1 * var(--angle))) scale(1.25);\n}\n.radial-color-circle {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n.radial-team-btn.team-blue .radial-color-circle {\n  background:\n    linear-gradient(\n      135deg,\n      #3498db,\n      #2980b9);\n}\n.radial-team-btn.team-red .radial-color-circle {\n  background:\n    linear-gradient(\n      135deg,\n      #e74c3c,\n      #c0392b);\n}\n.radial-team-btn.team-green .radial-color-circle {\n  background:\n    linear-gradient(\n      135deg,\n      #27ae60,\n      #219a52);\n}\n.radial-team-btn.team-yellow .radial-color-circle {\n  background:\n    linear-gradient(\n      135deg,\n      #f1c40f,\n      #d4a300);\n}\n.radial-team-btn.team-purple .radial-color-circle {\n  background:\n    linear-gradient(\n      135deg,\n      #9b59b6,\n      #8e44ad);\n}\n.radial-team-btn.team-orange .radial-color-circle {\n  background:\n    linear-gradient(\n      135deg,\n      #e67e22,\n      #d35400);\n}\n.tile-initial {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background:\n    linear-gradient(\n      135deg,\n      #3498db,\n      #2980b9);\n  color: white;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n.tile-portrait-small.tile-initial {\n  font-size: 14px;\n}\n.tile-portrait.tile-initial {\n  font-size: 20px;\n}\n.battle-tracker-container.compact-mode {\n  background: transparent;\n  border: none;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n}\n.compact-timeline {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex: 1;\n  overflow-x: auto;\n  scrollbar-width: none;\n  padding: 2px 0;\n}\n.compact-timeline::-webkit-scrollbar {\n  display: none;\n}\n.compact-group {\n  display: flex;\n  gap: 3px;\n}\n.compact-group.team-blue .compact-tile {\n  border-color: rgba(52, 152, 219, 0.8);\n  background: rgba(52, 152, 219, 0.18);\n}\n.compact-group.team-red .compact-tile {\n  border-color: rgba(231, 76, 60, 0.85);\n  background: rgba(231, 76, 60, 0.2);\n}\n.compact-group.team-green .compact-tile {\n  border-color: rgba(39, 174, 96, 0.85);\n  background: rgba(39, 174, 96, 0.2);\n}\n.compact-group.team-yellow .compact-tile {\n  border-color: rgba(241, 196, 15, 0.85);\n  background: rgba(241, 196, 15, 0.22);\n}\n.compact-group.team-purple .compact-tile {\n  border-color: rgba(155, 89, 182, 0.85);\n  background: rgba(155, 89, 182, 0.2);\n}\n.compact-group.team-orange .compact-tile {\n  border-color: rgba(230, 126, 34, 0.85);\n  background: rgba(230, 126, 34, 0.2);\n}\n.compact-tile.team-blue {\n  border-color: rgba(52, 152, 219, 0.95);\n}\n.compact-tile.team-red {\n  border-color: rgba(231, 76, 60, 0.95);\n}\n.compact-tile.team-green {\n  border-color: rgba(39, 174, 96, 0.95);\n}\n.compact-tile.team-yellow {\n  border-color: rgba(241, 196, 15, 0.95);\n}\n.compact-tile.team-purple {\n  border-color: rgba(155, 89, 182, 0.95);\n}\n.compact-tile.team-orange {\n  border-color: rgba(230, 126, 34, 0.95);\n}\n.compact-group.first-group .compact-tile {\n  border-color: #fbbf24;\n  box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);\n}\n.compact-tile {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n  padding: 2px 4px;\n  border-radius: 5px;\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  background: rgba(255, 255, 255, 0.07);\n  min-width: 36px;\n  cursor: pointer;\n  transition: box-shadow 0.15s, transform 0.1s;\n}\n.compact-tile:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);\n}\n.compact-tile--selected {\n  box-shadow: 0 0 0 2px #fbbf24, 0 0 10px rgba(251, 191, 36, 0.45) !important;\n}\n.compact-tile-portrait {\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  object-fit: cover;\n}\n.compact-tile-initial {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.12);\n  font-size: 14px;\n  font-weight: 700;\n  color: #e5e7eb;\n}\n.compact-tile-name {\n  font-size: 0.6rem;\n  color: #9ca3af;\n  white-space: nowrap;\n  max-width: 50px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.compact-effect-reminder {\n  position: absolute;\n  top: -4px;\n  right: -4px;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  border: 1px solid rgba(251, 191, 36, 0.8);\n  background: rgba(251, 191, 36, 0.25);\n  color: #fbbf24;\n  font-size: 10px;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0;\n  animation: effect-reminder-pulse 1s ease-in-out infinite;\n}\n.compact-tile {\n  position: relative;\n}\n@keyframes effect-reminder-pulse {\n  0%, 100% {\n    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5);\n  }\n  50% {\n    box-shadow: 0 0 8px 2px rgba(251, 191, 36, 0.7);\n  }\n}\n.compact-empty {\n  font-size: 0.72rem;\n  color: #6b7280;\n  padding: 0 0.5rem;\n}\n/*# sourceMappingURL=battle-tracker.component.css.map */\n'] }]
  }], null, { engine: [{
    type: Input
  }], readOnly: [{
    type: Input
  }], compactMode: [{
    type: Input
  }], effectReminderIds: [{
    type: Input
  }], selectedCharacterId: [{
    type: Input
  }], dismissEffectReminder: [{
    type: Output
  }], tileSelect: [{
    type: Output
  }], timelineRef: [{
    type: ViewChild,
    args: ["timelineContainer"]
  }], onEscapeKey: [{
    type: HostListener,
    args: ["document:keydown.escape"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BattleTracker, { className: "BattleTracker", filePath: "app/world/battle-tracker/battle-tracker.component.ts", lineNumber: 42 });
})();

// src/app/world/battle-tracker/battle-tracker-engine.ts
var TURN_METER_MAX = 1e3;
var TIMELINE_LENGTH = 15;
var BASE_SPEED = 25;
var BattleTrackerEngine = class {
  // Callback for UI updates
  onChange = null;
  // World store for persistence
  worldStore = null;
  isSaving = false;
  isInitialized = false;
  // All characters available to add to battle (with their current stats)
  allCharacters = /* @__PURE__ */ new Map();
  // Characters currently in battle with their turn meter state
  participants = /* @__PURE__ */ new Map();
  // Available teams
  TEAMS = ["blue", "red", "green", "yellow", "purple", "orange"];
  // ============================================
  // Setup
  // ============================================
  setChangeCallback(callback) {
    this.onChange = callback;
  }
  setWorldStore(store) {
    this.worldStore = store;
  }
  setAvailableCharacters(characters) {
    this.allCharacters.clear();
    for (const char of characters) {
      this.allCharacters.set(char.id, {
        id: char.id,
        name: char.name,
        portrait: char.portrait,
        speed: char.speed ?? 10
      });
    }
    for (const [id, participant] of this.participants) {
      const char = this.allCharacters.get(id);
      if (char) {
        participant.name = char.name;
        participant.portrait = char.portrait;
        participant.speed = char.speed;
      }
    }
    this.notifyChange();
  }
  // ============================================
  // Persistence
  // ============================================
  /**
   * Load state from world store. Only loads on first call (initialization).
   */
  loadFromWorldStore() {
    if (this.isInitialized || this.isSaving || !this.worldStore)
      return;
    const world = this.worldStore.worldValue;
    if (!world)
      return;
    this.isInitialized = true;
    const saved = world.battleParticipants || [];
    if (saved.length === 0) {
      this.participants.clear();
      this.notifyChange();
      return;
    }
    this.participants.clear();
    for (const bp of saved) {
      const char = this.allCharacters.get(bp.characterId);
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: char?.name || bp.name,
        portrait: char?.portrait,
        speed: char?.speed || bp.speed,
        team: bp.team || "blue",
        // Load turn meter from saved data (stored in turnFrequency for compatibility)
        turnMeter: bp.turnFrequency ?? 0
      });
    }
    this.notifyChange();
  }
  /**
   * Sync from world store (for external updates via websocket).
   */
  syncFromWorldStore() {
    if (!this.worldStore)
      return;
    const world = this.worldStore.worldValue;
    if (!world)
      return;
    const saved = world.battleParticipants || [];
    if (saved.length === 0) {
      this.participants.clear();
      this.notifyChange();
      return;
    }
    this.participants.clear();
    for (const bp of saved) {
      const char = this.allCharacters.get(bp.characterId);
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: char?.name || bp.name,
        portrait: char?.portrait,
        speed: char?.speed ?? bp.speed ?? 10,
        team: bp.team || "blue",
        turnMeter: bp.turnFrequency ?? 0
      });
    }
    this.notifyChange();
  }
  saveToWorldStore() {
    if (!this.worldStore)
      return;
    this.isSaving = true;
    const battleParticipants = [];
    for (const [id, p] of this.participants) {
      battleParticipants.push({
        characterId: p.characterId,
        name: p.name,
        team: p.team,
        speed: p.speed,
        // Store turn meter in turnFrequency field for compatibility
        turnFrequency: p.turnMeter,
        nextTurnAt: 0,
        // Not used in new system
        currentTurn: 0
        // Not used in new system
      });
    }
    this.worldStore.applyPatch({
      path: "battleParticipants",
      value: battleParticipants
    });
    setTimeout(() => {
      this.isSaving = false;
    }, 200);
  }
  // ============================================
  // Core Simulation Logic
  // ============================================
  /**
   * Simulate the timeline from current turn meter states.
   * Returns an array of TurnTiles representing the upcoming turns.
   */
  simulateTimeline() {
    if (this.participants.size === 0)
      return [];
    const simStates = [];
    for (const [id, p] of this.participants) {
      simStates.push({
        characterId: p.characterId,
        name: p.name,
        portrait: p.portrait,
        speed: p.speed + BASE_SPEED,
        team: p.team,
        meter: p.turnMeter,
        turnsTaken: 0
      });
    }
    const tiles = [];
    let tick = 0;
    const maxTicks = 1e4;
    while (tiles.length < TIMELINE_LENGTH && tick < maxTicks) {
      tick++;
      for (const state of simStates) {
        state.meter += state.speed;
      }
      const triggered = simStates.filter((s) => s.meter >= TURN_METER_MAX);
      if (triggered.length === 0)
        continue;
      triggered.sort((a, b) => {
        if (b.speed !== a.speed)
          return b.speed - a.speed;
        return b.meter - a.meter;
      });
      for (const state of triggered) {
        state.turnsTaken++;
        tiles.push({
          id: `${state.characterId}_tick${tick}_turn${state.turnsTaken}`,
          characterId: state.characterId,
          name: state.name,
          portrait: state.portrait,
          team: state.team,
          speed: state.speed,
          turnNumber: state.turnsTaken,
          simulationTick: tick,
          meterAtTurn: state.meter
        });
        state.meter -= TURN_METER_MAX;
        if (tiles.length >= TIMELINE_LENGTH)
          break;
      }
    }
    return tiles;
  }
  /**
   * Calculate the next turn meter state after the first turn (or group) completes.
   * This advances the actual turn meters to the state where the next turn would happen.
   */
  advanceToNextTurn() {
    if (this.participants.size === 0)
      return;
    const timeline = this.simulateTimeline();
    if (timeline.length === 0)
      return;
    const groups = this.groupTiles(timeline);
    if (groups.length === 0)
      return;
    const firstGroup = groups[0];
    const targetTick = firstGroup.tiles[firstGroup.tiles.length - 1].simulationTick;
    for (const [id, p] of this.participants) {
      let meter = p.turnMeter;
      const effectiveSpeed = p.speed + BASE_SPEED;
      for (let tick = 1; tick <= targetTick; tick++) {
        meter += effectiveSpeed;
        const triggeredInTick = firstGroup.tiles.some((t) => t.characterId === id && t.simulationTick === tick);
        if (triggeredInTick) {
          meter -= TURN_METER_MAX;
        }
      }
      p.turnMeter = Math.max(0, Math.min(meter, TURN_METER_MAX - 1));
    }
  }
  /**
   * Group tiles by team (adjacent tiles of same team, but different characters).
   */
  groupTiles(tiles) {
    if (tiles.length === 0)
      return [];
    const groups = [];
    let currentTiles = [];
    let currentTeam = null;
    let currentChars = /* @__PURE__ */ new Set();
    for (const tile of tiles) {
      const needNewGroup = currentTeam === null || tile.team !== currentTeam || currentChars.has(tile.characterId);
      if (needNewGroup && currentTiles.length > 0) {
        groups.push({
          id: `group_${groups.length}`,
          tiles: [...currentTiles],
          team: currentTeam
        });
        currentTiles = [];
        currentChars.clear();
      }
      if (needNewGroup) {
        currentTeam = tile.team;
      }
      currentTiles.push(tile);
      currentChars.add(tile.characterId);
    }
    if (currentTiles.length > 0) {
      groups.push({
        id: `group_${groups.length}`,
        tiles: [...currentTiles],
        team: currentTeam
      });
    }
    return groups;
  }
  // ============================================
  // Public API - Queries
  // ============================================
  /** Get the timeline as groups for display */
  getTimeline() {
    const tiles = this.simulateTimeline();
    return this.groupTiles(tiles);
  }
  /** Get flat tile list (for animations) */
  getTiles() {
    return this.simulateTimeline();
  }
  /** Get characters for the character list */
  getCharacters() {
    const result = /* @__PURE__ */ new Map();
    for (const [id, char] of this.allCharacters) {
      const participant = this.participants.get(id);
      result.set(id, {
        id,
        name: participant?.name || char.name,
        portrait: participant?.portrait || char.portrait,
        speed: participant?.speed ?? char.speed,
        team: participant?.team || "blue",
        isInBattle: !!participant,
        turnMeter: participant?.turnMeter ?? 0
      });
    }
    for (const [id, participant] of this.participants) {
      if (result.has(id))
        continue;
      result.set(id, {
        id,
        name: participant.name,
        portrait: participant.portrait,
        speed: participant.speed,
        team: participant.team,
        isInBattle: true,
        turnMeter: participant.turnMeter
      });
    }
    const ordered = Array.from(result.values());
    ordered.sort((a, b) => {
      if (a.isInBattle !== b.isInBattle)
        return a.isInBattle ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return ordered;
  }
  /** Get participants only (characters in battle) */
  getParticipants() {
    return this.getCharacters().filter((c) => c.isInBattle);
  }
  /** Get current turn display text */
  getCurrentTurnDisplay() {
    const groups = this.getTimeline();
    if (groups.length === 0)
      return null;
    const firstGroup = groups[0];
    return firstGroup.tiles.map((t) => t.name).join(" & ");
  }
  /** Character IDs in the current (first) turn group. */
  getCurrentTurnCharacterIds() {
    const groups = this.getTimeline();
    if (groups.length === 0)
      return [];
    const seen = /* @__PURE__ */ new Set();
    const ids = [];
    for (const tile of groups[0].tiles) {
      if (!seen.has(tile.characterId)) {
        seen.add(tile.characterId);
        ids.push(tile.characterId);
      }
    }
    return ids;
  }
  /** Check if there are any participants */
  hasParticipants() {
    return this.participants.size > 0;
  }
  /** Get turn meter value for a character (0-999) */
  getTurnMeter(characterId) {
    return this.participants.get(characterId)?.turnMeter ?? 0;
  }
  /** Get all turn meters as a map */
  getTurnMeters() {
    const result = /* @__PURE__ */ new Map();
    for (const [id, p] of this.participants) {
      result.set(id, p.turnMeter);
    }
    return result;
  }
  // ============================================
  // Public API - Actions
  // ============================================
  /** Add a character to battle */
  /**
   * Register a character in the available-characters map without adding to battle.
   * Used for NPC tokens that aren't loaded via setAvailableCharacters.
   */
  registerCharacter(id, data) {
    if (!this.allCharacters.has(id)) {
      this.allCharacters.set(id, __spreadValues({ id }, data));
      this.notifyChange();
    }
  }
  addCharacter(characterId) {
    const char = this.allCharacters.get(characterId);
    if (!char || this.participants.has(characterId))
      return;
    this.participants.set(characterId, {
      characterId,
      name: char.name,
      portrait: char.portrait,
      speed: char.speed,
      team: "blue",
      turnMeter: 0
      // Start at 0
    });
    this.notifyChange();
    this.saveToWorldStore();
  }
  /** Remove a character from battle */
  removeCharacter(characterId) {
    this.participants.delete(characterId);
    this.notifyChange();
    this.saveToWorldStore();
  }
  /** Set a character's team */
  setTeam(characterId, team) {
    const participant = this.participants.get(characterId);
    if (!participant)
      return;
    participant.team = team;
    this.notifyChange();
    this.saveToWorldStore();
  }
  /** Set a character's turn meter directly (0-999) */
  setTurnMeter(characterId, value) {
    const participant = this.participants.get(characterId);
    if (!participant)
      return;
    participant.turnMeter = Math.max(0, Math.min(value, TURN_METER_MAX - 1));
    this.notifyChange();
    this.saveToWorldStore();
  }
  /** Set turn meter immediately without triggering animations (for drag) */
  setTurnMeterImmediate(characterId, value) {
    const participant = this.participants.get(characterId);
    if (!participant)
      return;
    participant.turnMeter = Math.max(0, Math.min(value, TURN_METER_MAX - 1));
    this.notifyChange();
  }
  /** Save turn meter to world store (debounced call from UI) */
  saveTurnMeter(characterId, value) {
    const participant = this.participants.get(characterId);
    if (!participant)
      return;
    participant.turnMeter = Math.max(0, Math.min(value, TURN_METER_MAX - 1));
    this.saveToWorldStore();
  }
  /** Advance to the next turn - consumes the first group */
  nextTurn() {
    if (this.participants.size === 0)
      return;
    this.advanceToNextTurn();
    this.notifyChange();
    this.saveToWorldStore();
  }
  /** Reset battle - clear all participants and their turn meters */
  resetBattle() {
    this.participants.clear();
    this.isInitialized = false;
    this.notifyChange();
    this.saveToWorldStore();
  }
  /** Reset just the turn meters (keep participants) */
  resetTurnMeters() {
    for (const p of this.participants.values()) {
      p.turnMeter = 0;
    }
    this.notifyChange();
    this.saveToWorldStore();
  }
  // ============================================
  // Private
  // ============================================
  notifyChange() {
    if (this.onChange) {
      this.onChange();
    }
  }
};

// src/app/shared/sound/sound-volume-control.component.ts
var SoundVolumeControlComponent = class _SoundVolumeControlComponent {
  volume = sfxVolume;
  /** Level restored when un-muting. */
  lastAudible = 0.6;
  percent() {
    return Math.round(this.volume() * 100);
  }
  icon() {
    const v = this.volume();
    if (v === 0)
      return "\u{1F507}";
    if (v < 0.34)
      return "\u{1F508}";
    if (v < 0.67)
      return "\u{1F509}";
    return "\u{1F50A}";
  }
  onInput(event) {
    const v = Number(event.target.value) / 100;
    if (v > 0)
      this.lastAudible = v;
    setSfxVolume(v);
  }
  toggleMute() {
    if (this.volume() > 0) {
      this.lastAudible = this.volume();
      setSfxVolume(0);
    } else {
      setSfxVolume(this.lastAudible || 0.6);
    }
  }
  static \u0275fac = function SoundVolumeControlComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SoundVolumeControlComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SoundVolumeControlComponent, selectors: [["app-sound-volume-control"]], decls: 4, vars: 4, consts: [[1, "svc", 3, "title"], ["type", "button", 1, "svc-btn", 3, "click"], ["type", "range", "min", "0", "max", "100", "step", "1", "aria-label", "Lautst\xE4rke der Soundeffekte", 1, "svc-range", 3, "input", "value"]], template: function SoundVolumeControlComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0)(1, "button", 1);
      \u0275\u0275domListener("click", function SoundVolumeControlComponent_Template_button_click_1_listener() {
        return ctx.toggleMute();
      });
      \u0275\u0275text(2);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElementStart(3, "input", 2);
      \u0275\u0275domListener("input", function SoundVolumeControlComponent_Template_input_input_3_listener($event) {
        return ctx.onInput($event);
      });
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275domProperty("title", "Lautst\xE4rke: " + ctx.percent() + "%");
      \u0275\u0275advance();
      \u0275\u0275attribute("aria-label", ctx.volume() === 0 ? "Ton einschalten" : "Stummschalten");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.icon(), " ");
      \u0275\u0275advance();
      \u0275\u0275domProperty("value", ctx.percent());
    }
  }, dependencies: [CommonModule], styles: ["\n\n.svc[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n.svc-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  padding: 2px;\n  color: inherit;\n  opacity: 0.85;\n}\n.svc-btn[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n.svc-range[_ngcontent-%COMP%] {\n  width: 88px;\n  accent-color: #8b5cf6;\n  cursor: pointer;\n}\n/*# sourceMappingURL=sound-volume-control.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SoundVolumeControlComponent, [{
    type: Component,
    args: [{ selector: "app-sound-volume-control", standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="svc" [title]="'Lautst\xE4rke: ' + percent() + '%'">
      <button class="svc-btn" type="button" (click)="toggleMute()"
              [attr.aria-label]="volume() === 0 ? 'Ton einschalten' : 'Stummschalten'">
        {{ icon() }}
      </button>
      <input class="svc-range" type="range" min="0" max="100" step="1"
             [value]="percent()"
             (input)="onInput($event)"
             aria-label="Lautst\xE4rke der Soundeffekte" />
    </div>
  `, styles: ["/* angular:styles/component:css;dc9d9c07311798d43f39be0052af7bff61f6a6be61a1d62496c4968e1850bc38;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/sound/sound-volume-control.component.ts */\n.svc {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n.svc-btn {\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 1rem;\n  line-height: 1;\n  padding: 2px;\n  color: inherit;\n  opacity: 0.85;\n}\n.svc-btn:hover {\n  opacity: 1;\n}\n.svc-range {\n  width: 88px;\n  accent-color: #8b5cf6;\n  cursor: pointer;\n}\n/*# sourceMappingURL=sound-volume-control.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SoundVolumeControlComponent, { className: "SoundVolumeControlComponent", filePath: "app/shared/sound/sound-volume-control.component.ts", lineNumber: 37 });
})();

export {
  WorldStoreService,
  BattleTracker,
  BattleTrackerEngine,
  SoundVolumeControlComponent
};
//# sourceMappingURL=chunk-J3PCLJV4.js.map
