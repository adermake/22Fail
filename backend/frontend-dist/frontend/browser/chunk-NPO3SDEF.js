import {
  SkillBlock,
  talentPointCostForSkill,
  totalTalentPointsAtLevel
} from "./chunk-SYK3RTY6.js";
import {
  RUNE_TYPE_LABELS,
  RuneEditorComponent,
  createEmptyLootBundleEvent,
  createEmptyShopEvent,
  formatCurrency,
  getCoinParts
} from "./chunk-2K7XH5ES.js";
import {
  ItemComponent,
  ItemEditorComponent,
  SkillComponent,
  SkillEditorComponent,
  SpellComponent,
  SpellEditorOverlayComponent
} from "./chunk-SJFL75AL.js";
import {
  CardComponent
} from "./chunk-OMKCU2ST.js";
import {
  NotificationService
} from "./chunk-DLR6HTDV.js";
import {
  BattleTracker,
  BattleTrackerEngine,
  SoundVolumeControlComponent,
  WorldStoreService
} from "./chunk-J3PCLJV4.js";
import "./chunk-4YEN6ADO.js";
import {
  CharacterSocketService,
  DamageCalculatorComponent,
  WorldSocketService
} from "./chunk-5ZPJN4WG.js";
import {
  AssetBrowserApiService,
  CLASS_DEFINITIONS,
  LibraryStoreService,
  TrueStatsService,
  getSkillById,
  getSkillsForClass
} from "./chunk-BNPZFNFF.js";
import "./chunk-RAWCOLGX.js";
import {
  ImageUrlPipe
} from "./chunk-6EXL6IWA.js";
import "./chunk-7RNBGZ3X.js";
import "./chunk-J3D7AX2Y.js";
import {
  CharacterApiService
} from "./chunk-YTW6ZOS6.js";
import {
  createEmptySheet
} from "./chunk-U6IPOXKZ.js";
import {
  FormulaType
} from "./chunk-SVTPZQLG.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MaxValidator,
  MinValidator,
  NgControlStatus,
  NgModel,
  NgSelectOption,
  NumberValueAccessor,
  RangeValueAccessor,
  SelectControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-VMGRJE2Y.js";
import "./chunk-VMYLUGMS.js";
import "./chunk-P2J6DNXL.js";
import {
  ActivatedRoute,
  Router
} from "./chunk-V6FR55FP.js";
import "./chunk-YJYDFJW3.js";
import {
  AsyncPipe,
  CommonModule,
  DatePipe,
  HttpClient,
  LowerCasePipe,
  NgTemplateOutlet
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injectable,
  Input,
  Output,
  ViewChild,
  computed,
  firstValueFrom,
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
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdirectiveInject,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinterpolate,
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
  ɵɵpureFunction1,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵtextInterpolate4,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuery
} from "./chunk-XJL25EXC.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/services/battle.service.ts
var BattleService = class _BattleService {
  store = inject(WorldStoreService);
  trueStats = inject(TrueStatsService);
  // Reference to party characters - set by WorldComponent
  partyCharacters = /* @__PURE__ */ new Map();
  setPartyCharacters(characters) {
    this.partyCharacters = characters;
  }
  /**
   * Calculate the effective speed for a character in battle.
   * Uses TrueStatsService for correct calculation including all bonuses, penalties, encumbrance, and armor debuffs.
   * This is the speed used for battle turn order and movement.
   */
  calculateSpeed(character) {
    return this.trueStats.calculateEffectiveSpeed(character);
  }
  getHealth(character) {
    const lifeStatus = character.statuses?.find((s) => s.statusName === "Leben");
    if (lifeStatus) {
      return {
        current: lifeStatus.statusCurrent || 0,
        max: this.trueStats.calculateResourceMax(character, lifeStatus.formulaType)
      };
    }
    return { current: 0, max: 0 };
  }
  getAvailableCharactersForBattle(partyArray) {
    return partyArray.map((member) => ({
      id: member.id,
      name: member.sheet.name || member.id,
      speed: this.calculateSpeed(member.sheet)
    }));
  }
  addToBattle(characterId) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const character = this.partyCharacters.get(characterId);
    if (!character)
      return;
    const speed = this.calculateSpeed(character);
    const health = this.getHealth(character);
    const maxTurn = world.battleParticipants.length > 0 ? Math.max(...world.battleParticipants.map((p) => p.nextTurnAt)) : 0;
    const newParticipant = {
      characterId,
      name: character.name || characterId,
      speed,
      turnFrequency: speed,
      nextTurnAt: maxTurn + 10,
      team: "blue",
      portrait: character.portrait,
      currentHealth: health.current,
      maxHealth: health.max
    };
    const updatedParticipants = [...world.battleParticipants, newParticipant];
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  removeFromBattle(characterId) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const updatedParticipants = world.battleParticipants.filter((p) => p.characterId !== characterId);
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  advanceTurn() {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) {
      return;
    }
    const queue = this.getBattleQueue();
    if (queue.length === 0)
      return;
    const firstGroup = queue[0];
    const groupIds = new Set(firstGroup.turns.map((t) => t.characterId));
    const updatedParticipants = world.battleParticipants.map((p) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      if (groupIds.has(p.characterId)) {
        const newNextTurnAt = p.nextTurnAt + 1e3 / freshSpeed;
        return __spreadProps(__spreadValues({}, p), {
          speed: freshSpeed,
          nextTurnAt: newNextTurnAt
        });
      }
      return __spreadProps(__spreadValues({}, p), {
        speed: freshSpeed
      });
    });
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  resetBattle() {
    const world = this.store.worldValue;
    if (!world)
      return;
    const resetParticipants = world.battleParticipants.map((p) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      return __spreadProps(__spreadValues({}, p), {
        speed: freshSpeed,
        nextTurnAt: 0
      });
    });
    this.store.applyPatch({
      path: "battleParticipants",
      value: resetParticipants
    });
  }
  refreshBattleSpeeds() {
    const world = this.store.worldValue;
    if (!world)
      return;
    const updatedParticipants = world.battleParticipants.map((p) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      return __spreadProps(__spreadValues({}, p), {
        speed: freshSpeed
      });
    });
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  syncTurns(sourceId, targetId) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const targetParticipant = world.battleParticipants.find((p) => p.characterId === targetId);
    if (!targetParticipant)
      return;
    const updatedParticipants = world.battleParticipants.map((p) => {
      if (p.characterId === sourceId) {
        return __spreadProps(__spreadValues({}, p), {
          nextTurnAt: targetParticipant.nextTurnAt
        });
      }
      return p;
    });
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  setTurnOrder(characterId, position) {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0)
      return;
    const queue = [];
    const participants = world.battleParticipants.map((p) => __spreadValues({}, p));
    for (let i = 0; i < 10; i++) {
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];
      queue.push(__spreadValues({}, next));
      next.nextTurnAt = next.nextTurnAt + 1e3 / next.speed;
    }
    const targetTurnAt = queue[position]?.nextTurnAt;
    if (targetTurnAt === void 0)
      return;
    const updatedParticipants = world.battleParticipants.map((p) => {
      if (p.characterId === characterId) {
        return __spreadProps(__spreadValues({}, p), {
          nextTurnAt: targetTurnAt
        });
      }
      return p;
    });
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  changeParticipantTeam(characterId, team) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const updatedParticipants = world.battleParticipants.map((p) => p.characterId === characterId ? __spreadProps(__spreadValues({}, p), { team }) : p);
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  reorderParticipants(characterId, newIndex) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const queue = this.getBattleQueue();
    if (queue.length === 0)
      return;
    let newNextTurnAt;
    if (newIndex <= 0) {
      newNextTurnAt = queue[0].startTime - 10;
    } else if (newIndex >= queue.length) {
      newNextTurnAt = queue[queue.length - 1].startTime + 10;
    } else {
      const prev = queue[newIndex - 1];
      const next = queue[newIndex];
      newNextTurnAt = (prev.startTime + next.startTime) / 2;
    }
    const updatedParticipants = world.battleParticipants.map((p) => {
      if (p.characterId === characterId) {
        return __spreadProps(__spreadValues({}, p), { nextTurnAt: newNextTurnAt });
      }
      return p;
    });
    this.store.applyPatch({
      path: "battleParticipants",
      value: updatedParticipants
    });
  }
  getBattleQueue() {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0)
      return [];
    const turns = [];
    const participants = world.battleParticipants.map((p) => __spreadProps(__spreadValues({}, p), {
      currentTurnAt: p.nextTurnAt,
      speed: this.partyCharacters.get(p.characterId) ? this.calculateSpeed(this.partyCharacters.get(p.characterId)) : p.speed
    }));
    for (let step = 0; step < 50; step++) {
      participants.sort((a, b) => a.currentTurnAt - b.currentTurnAt);
      const next = participants[0];
      const original = world.battleParticipants.find((p) => p.characterId === next.characterId);
      const isAnchor = original ? Math.abs(original.nextTurnAt - next.currentTurnAt) < 1e-3 : false;
      turns.push({
        characterId: next.characterId,
        name: next.name,
        team: next.team || "blue",
        time: next.currentTurnAt,
        isAnchor,
        speed: next.speed
      });
      next.currentTurnAt += 1e3 / next.speed;
    }
    const groups = [];
    if (turns.length === 0)
      return [];
    const TIME_THRESHOLD = 1;
    let currentGroup = {
      turns: [turns[0]],
      team: turns[0].team,
      startTime: turns[0].time
    };
    let membersInGroup = /* @__PURE__ */ new Set([turns[0].characterId]);
    for (let i = 1; i < turns.length; i++) {
      const turn = turns[i];
      const timeDiff = Math.abs(turn.time - currentGroup.startTime);
      if (turn.team === currentGroup.team && !membersInGroup.has(turn.characterId) && timeDiff < TIME_THRESHOLD) {
        currentGroup.turns.push(turn);
        membersInGroup.add(turn.characterId);
      } else {
        groups.push(currentGroup);
        currentGroup = {
          turns: [turn],
          team: turn.team,
          startTime: turn.time
        };
        membersInGroup = /* @__PURE__ */ new Set([turn.characterId]);
      }
    }
    groups.push(currentGroup);
    return groups;
  }
  static \u0275fac = function BattleService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BattleService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _BattleService, factory: _BattleService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BattleService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/trash.service.ts
var TrashService = class _TrashService {
  store = inject(WorldStoreService);
  getTrash() {
    return this.store.worldValue?.trash || [];
  }
  addToTrash(type, data) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const newTrash = [...world.trash || [], {
      type,
      data,
      deletedAt: Date.now()
    }];
    this.store.applyPatch({
      path: "trash",
      value: newTrash
    });
  }
  restoreFromTrash(index) {
    const world = this.store.worldValue;
    if (!world || !world.trash)
      return;
    const trashItem = world.trash[index];
    const newTrash = [...world.trash];
    newTrash.splice(index, 1);
    switch (trashItem.type) {
      case "item":
        this.store.applyPatch({
          path: "itemLibrary",
          value: [...world.itemLibrary, trashItem.data]
        });
        break;
      case "rune":
        this.store.applyPatch({
          path: "runeLibrary",
          value: [...world.runeLibrary, trashItem.data]
        });
        break;
      case "spell":
        this.store.applyPatch({
          path: "spellLibrary",
          value: [...world.spellLibrary, trashItem.data]
        });
        break;
      case "skill":
        this.store.applyPatch({
          path: "skillLibrary",
          value: [...world.skillLibrary, trashItem.data]
        });
        break;
    }
    this.store.applyPatch({
      path: "trash",
      value: newTrash
    });
  }
  permanentlyDelete(index) {
    const world = this.store.worldValue;
    if (!world || !world.trash)
      return;
    const newTrash = [...world.trash];
    newTrash.splice(index, 1);
    this.store.applyPatch({
      path: "trash",
      value: newTrash
    });
  }
  emptyTrash() {
    this.store.applyPatch({
      path: "trash",
      value: []
    });
  }
  static \u0275fac = function TrashService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TrashService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _TrashService, factory: _TrashService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TrashService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/library.service.ts
var LibraryService = class _LibraryService {
  store = inject(WorldStoreService);
  trashService = inject(TrashService);
  // Item library management
  createItem(item) {
    const world = this.store.worldValue;
    if (world) {
      this.store.applyPatch({
        path: "itemLibrary",
        value: [...world.itemLibrary, item]
      });
    }
  }
  updateItem(index, patch) {
    let subPath = patch.path.replace(/\//g, ".");
    if (subPath.startsWith("."))
      subPath = subPath.substring(1);
    const path = subPath ? `itemLibrary.${index}.${subPath}` : `itemLibrary.${index}`;
    this.store.applyPatch({ path, value: patch.value });
  }
  removeItem(index) {
    const world = this.store.worldValue;
    if (!world)
      return /* @__PURE__ */ new Set();
    const item = world.itemLibrary[index];
    const newItems = [...world.itemLibrary];
    newItems.splice(index, 1);
    this.trashService.addToTrash("item", item);
    this.store.applyPatch({
      path: "itemLibrary",
      value: newItems
    });
    return this.shiftIndices(index);
  }
  // Rune library management
  addRune() {
    const world = this.store.worldValue;
    if (world) {
      const newRune = {
        name: "New Rune",
        description: "",
        drawing: "",
        tags: []
      };
      this.store.applyPatch({
        path: "runeLibrary",
        value: [...world.runeLibrary, newRune]
      });
    }
  }
  updateRune(index, patch) {
    let subPath = patch.path.replace(/\//g, ".");
    if (subPath.startsWith("."))
      subPath = subPath.substring(1);
    const path = subPath ? `runeLibrary.${index}.${subPath}` : `runeLibrary.${index}`;
    this.store.applyPatch({ path, value: patch.value });
  }
  removeRune(index) {
    const world = this.store.worldValue;
    if (!world)
      return /* @__PURE__ */ new Set();
    const rune = world.runeLibrary[index];
    const newRunes = [...world.runeLibrary];
    newRunes.splice(index, 1);
    this.trashService.addToTrash("rune", rune);
    this.store.applyPatch({
      path: "runeLibrary",
      value: newRunes
    });
    return this.shiftIndices(index);
  }
  // Spell library management
  addSpell() {
    const world = this.store.worldValue;
    if (world) {
      const newSpell = {
        name: "New Spell",
        description: "",
        drawing: "",
        tags: [],
        binding: { type: "learned" }
      };
      this.store.applyPatch({
        path: "spellLibrary",
        value: [...world.spellLibrary, newSpell]
      });
    }
  }
  updateSpell(index, patch) {
    let subPath = patch.path.replace(/\//g, ".");
    if (subPath.startsWith("."))
      subPath = subPath.substring(1);
    const path = subPath ? `spellLibrary.${index}.${subPath}` : `spellLibrary.${index}`;
    this.store.applyPatch({ path, value: patch.value });
  }
  removeSpell(index) {
    const world = this.store.worldValue;
    if (!world)
      return /* @__PURE__ */ new Set();
    const spell = world.spellLibrary[index];
    const newSpells = [...world.spellLibrary];
    newSpells.splice(index, 1);
    this.trashService.addToTrash("spell", spell);
    this.store.applyPatch({
      path: "spellLibrary",
      value: newSpells
    });
    return this.shiftIndices(index);
  }
  // Skill library management
  addSkill() {
    const world = this.store.worldValue;
    if (world) {
      const newSkill = new SkillBlock();
      newSkill.name = "New Skill";
      newSkill.description = "";
      newSkill.type = "passive";
      newSkill.class = "";
      newSkill.enlightened = false;
      this.store.applyPatch({
        path: "skillLibrary",
        value: [...world.skillLibrary, newSkill]
      });
    }
  }
  updateSkill(index, patch) {
    let subPath = patch.path.replace(/\//g, ".");
    if (subPath.startsWith("."))
      subPath = subPath.substring(1);
    const path = subPath ? `skillLibrary.${index}.${subPath}` : `skillLibrary.${index}`;
    this.store.applyPatch({ path, value: patch.value });
  }
  removeSkill(index) {
    const world = this.store.worldValue;
    if (!world)
      return /* @__PURE__ */ new Set();
    const skill = world.skillLibrary[index];
    const newSkills = [...world.skillLibrary];
    newSkills.splice(index, 1);
    this.trashService.addToTrash("skill", skill);
    this.store.applyPatch({
      path: "skillLibrary",
      value: newSkills
    });
    return this.shiftIndices(index);
  }
  // Helper to calculate shifted indices after removal
  shiftIndices(removedIndex) {
    return /* @__PURE__ */ new Set();
  }
  // Get library data from current world
  getItemLibrary() {
    return this.store.worldValue?.itemLibrary || [];
  }
  getRuneLibrary() {
    return this.store.worldValue?.runeLibrary || [];
  }
  getSpellLibrary() {
    return this.store.worldValue?.spellLibrary || [];
  }
  getSkillLibrary() {
    return this.store.worldValue?.skillLibrary || [];
  }
  static \u0275fac = function LibraryService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LibraryService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _LibraryService, factory: _LibraryService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LibraryService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/world/asset-browser/asset-browser.component.ts
function _forTrack0($index, $item) {
  return this.getOriginalIndex($item, "spells");
}
function _forTrack1($index, $item) {
  return this.getOriginalIndex($item, "skills");
}
function _forTrack2($index, $item) {
  return this.getOriginalIndex($item, "status-effects");
}
var _forTrack3 = ($index, $item) => $item.id;
function _forTrack4($index, $item) {
  return this.getOriginalIndex($item, "runes");
}
function AssetBrowserComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 13);
    \u0275\u0275twoWayListener("ngModelChange", function AssetBrowserComponent_Conditional_23_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.itemTypeFilter, $event) || (ctx_r1.itemTypeFilter = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function AssetBrowserComponent_Conditional_23_Template_select_ngModelChange_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onItemTypeFilterChange());
    });
    \u0275\u0275elementStart(1, "option", 14);
    \u0275\u0275text(2, "Alle Typen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "option", 15);
    \u0275\u0275text(4, "Waffe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "option", 16);
    \u0275\u0275text(6, "R\xFCstung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "option", 17);
    \u0275\u0275text(8, "Sonstiges");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.itemTypeFilter);
  }
}
function AssetBrowserComponent_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "select", 13);
    \u0275\u0275twoWayListener("ngModelChange", function AssetBrowserComponent_Conditional_24_Template_select_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.skillTypeFilter, $event) || (ctx_r1.skillTypeFilter = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function AssetBrowserComponent_Conditional_24_Template_select_ngModelChange_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.onSkillTypeFilterChange());
    });
    \u0275\u0275elementStart(1, "option", 14);
    \u0275\u0275text(2, "Alle Typen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "option", 18);
    \u0275\u0275text(4, "Aktiv");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "option", 19);
    \u0275\u0275text(6, "Passiv");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "option", 20);
    \u0275\u0275text(8, "W\xFCrfelbonus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "option", 21);
    \u0275\u0275text(10, "Wertbonus");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.skillTypeFilter);
  }
}
function AssetBrowserComponent_Conditional_26_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 25);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_26_For_2_Template_div_dragstart_0_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "item", ctx_r1.getOriginalIndex(item_r5, "items")));
    })("contextmenu", function AssetBrowserComponent_Conditional_26_For_2_Template_div_contextmenu_0_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onContextMenu($event, "item", ctx_r1.getOriginalIndex(item_r5, "items")));
    });
    \u0275\u0275elementStart(1, "app-item", 26);
    \u0275\u0275listener("patch", function AssetBrowserComponent_Conditional_26_For_2_Template_app_item_patch_1_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onItemUpdate(ctx_r1.getOriginalIndex(item_r5, "items"), $event));
    })("delete", function AssetBrowserComponent_Conditional_26_For_2_Template_app_item_delete_1_listener() {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeItem.emit(ctx_r1.getOriginalIndex(item_r5, "items")));
    })("editingChange", function AssetBrowserComponent_Conditional_26_For_2_Template_app_item_editingChange_1_listener($event) {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onItemEditingChange(ctx_r1.getOriginalIndex(item_r5, "items"), $event));
    })("openEditor", function AssetBrowserComponent_Conditional_26_For_2_Template_app_item_openEditor_1_listener() {
      const item_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openItemEditor.emit(ctx_r1.getOriginalIndex(item_r5, "items")));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("draggable", !ctx_r1.isItemEditing(ctx_r1.getOriginalIndex(item_r5, "items")));
    \u0275\u0275attribute("draggable", !ctx_r1.isItemEditing(ctx_r1.getOriginalIndex(item_r5, "items")));
    \u0275\u0275advance();
    \u0275\u0275property("item", item_r5)("sheet", ctx_r1.dummySheet)("index", ctx_r1.getOriginalIndex(item_r5, "items"))("isEditing", ctx_r1.isItemEditing(ctx_r1.getOriginalIndex(item_r5, "items")));
  }
}
function AssetBrowserComponent_Conditional_26_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Items gefunden.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_26_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 27);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_26_Conditional_4_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addItem.emit());
    });
    \u0275\u0275text(1, "+ Gegenstand hinzuf\xFCgen");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_26_For_2_Template, 2, 7, "div", 22, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_26_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275conditionalCreate(4, AssetBrowserComponent_Conditional_26_Conditional_4_Template, 2, 0, "button", 24);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredItems);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredItems.length === 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.readonly ? 4 : -1);
  }
}
function AssetBrowserComponent_Conditional_27_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 25);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_27_For_2_Template_div_dragstart_0_listener($event) {
      const spell_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "spell", ctx_r1.getOriginalIndex(spell_r8, "spells")));
    })("contextmenu", function AssetBrowserComponent_Conditional_27_For_2_Template_div_contextmenu_0_listener($event) {
      const spell_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onContextMenu($event, "spell", ctx_r1.getOriginalIndex(spell_r8, "spells")));
    });
    \u0275\u0275elementStart(1, "app-spell", 28);
    \u0275\u0275listener("patch", function AssetBrowserComponent_Conditional_27_For_2_Template_app_spell_patch_1_listener($event) {
      const spell_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onSpellUpdate(ctx_r1.getOriginalIndex(spell_r8, "spells"), $event));
    })("delete", function AssetBrowserComponent_Conditional_27_For_2_Template_app_spell_delete_1_listener() {
      const spell_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeSpell.emit(ctx_r1.getOriginalIndex(spell_r8, "spells")));
    })("editingChange", function AssetBrowserComponent_Conditional_27_For_2_Template_app_spell_editingChange_1_listener($event) {
      const spell_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onSpellEditingChange(ctx_r1.getOriginalIndex(spell_r8, "spells"), $event));
    })("openEditor", function AssetBrowserComponent_Conditional_27_For_2_Template_app_spell_openEditor_1_listener() {
      const spell_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSpellEditor.emit(ctx_r1.getOriginalIndex(spell_r8, "spells")));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const spell_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("draggable", !ctx_r1.isSpellEditing(ctx_r1.getOriginalIndex(spell_r8, "spells")));
    \u0275\u0275attribute("draggable", !ctx_r1.isSpellEditing(ctx_r1.getOriginalIndex(spell_r8, "spells")));
    \u0275\u0275advance();
    \u0275\u0275property("spell", spell_r8)("sheet", ctx_r1.dummySheet)("index", ctx_r1.getOriginalIndex(spell_r8, "spells"))("isEditing", ctx_r1.isSpellEditing(ctx_r1.getOriginalIndex(spell_r8, "spells")));
  }
}
function AssetBrowserComponent_Conditional_27_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Zauber gefunden.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_27_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 27);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_27_Conditional_4_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addSpell.emit());
    });
    \u0275\u0275text(1, "+ Zauber hinzuf\xFCgen");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_27_For_2_Template, 2, 7, "div", 22, _forTrack0, true);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_27_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275conditionalCreate(4, AssetBrowserComponent_Conditional_27_Conditional_4_Template, 2, 0, "button", 24);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredSpells);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredSpells.length === 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.readonly ? 4 : -1);
  }
}
function AssetBrowserComponent_Conditional_28_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 25);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_28_For_2_Template_div_dragstart_0_listener($event) {
      const skill_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "skill", ctx_r1.getOriginalIndex(skill_r11, "skills")));
    })("contextmenu", function AssetBrowserComponent_Conditional_28_For_2_Template_div_contextmenu_0_listener($event) {
      const skill_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onContextMenu($event, "skill", ctx_r1.getOriginalIndex(skill_r11, "skills")));
    });
    \u0275\u0275elementStart(1, "app-skill", 29);
    \u0275\u0275listener("patch", function AssetBrowserComponent_Conditional_28_For_2_Template_app_skill_patch_1_listener($event) {
      const skill_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onSkillUpdate(ctx_r1.getOriginalIndex(skill_r11, "skills"), $event));
    })("delete", function AssetBrowserComponent_Conditional_28_For_2_Template_app_skill_delete_1_listener() {
      const skill_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeSkill.emit(ctx_r1.getOriginalIndex(skill_r11, "skills")));
    })("editingChange", function AssetBrowserComponent_Conditional_28_For_2_Template_app_skill_editingChange_1_listener($event) {
      const skill_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onSkillEditingChange(ctx_r1.getOriginalIndex(skill_r11, "skills"), $event));
    })("openEditor", function AssetBrowserComponent_Conditional_28_For_2_Template_app_skill_openEditor_1_listener() {
      const skill_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openSkillEditor.emit(ctx_r1.getOriginalIndex(skill_r11, "skills")));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const skill_r11 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("draggable", !ctx_r1.isSkillEditing(ctx_r1.getOriginalIndex(skill_r11, "skills")));
    \u0275\u0275attribute("draggable", !ctx_r1.isSkillEditing(ctx_r1.getOriginalIndex(skill_r11, "skills")));
    \u0275\u0275advance();
    \u0275\u0275property("skill", skill_r11)("sheet", ctx_r1.dummySheet)("index", ctx_r1.getOriginalIndex(skill_r11, "skills"))("isEditing", ctx_r1.isSkillEditing(ctx_r1.getOriginalIndex(skill_r11, "skills")));
  }
}
function AssetBrowserComponent_Conditional_28_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Talente gefunden.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_28_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 27);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_28_Conditional_4_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addSkill.emit());
    });
    \u0275\u0275text(1, "+ Talent hinzuf\xFCgen");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_28_For_2_Template, 2, 7, "div", 22, _forTrack1, true);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_28_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275conditionalCreate(4, AssetBrowserComponent_Conditional_28_Conditional_4_Template, 2, 0, "button", 24);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredSkills);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredSkills.length === 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.readonly ? 4 : -1);
  }
}
function AssetBrowserComponent_Conditional_29_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const effect_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", effect_r14.defaultDuration, " Runden");
  }
}
function AssetBrowserComponent_Conditional_29_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const effect_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(effect_r14.description);
  }
}
function AssetBrowserComponent_Conditional_29_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 38)(1, "button", 39);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_29_For_2_Conditional_9_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r15);
      const effect_r14 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.openStatusEffectEditor.emit(ctx_r1.getOriginalIndex(effect_r14, "status-effects")));
    });
    \u0275\u0275element(2, "span", 40);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 41);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_29_For_2_Conditional_9_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r15);
      const effect_r14 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.removeStatusEffect.emit(ctx_r1.getOriginalIndex(effect_r14, "status-effects")));
    });
    \u0275\u0275element(4, "span", 42);
    \u0275\u0275elementEnd()();
  }
}
function AssetBrowserComponent_Conditional_29_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 31);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_29_For_2_Template_div_dragstart_0_listener($event) {
      const effect_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "status-effect", ctx_r1.getOriginalIndex(effect_r14, "status-effects")));
    })("contextmenu", function AssetBrowserComponent_Conditional_29_For_2_Template_div_contextmenu_0_listener($event) {
      const effect_r14 = \u0275\u0275restoreView(_r13).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onContextMenu($event, "status-effect", ctx_r1.getOriginalIndex(effect_r14, "status-effects")));
    });
    \u0275\u0275elementStart(1, "div", 32)(2, "div", 33)(3, "span", 34);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 35);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(7, AssetBrowserComponent_Conditional_29_For_2_Conditional_7_Template, 2, 1, "span", 36);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, AssetBrowserComponent_Conditional_29_For_2_Conditional_8_Template, 2, 1, "p", 37);
    \u0275\u0275conditionalCreate(9, AssetBrowserComponent_Conditional_29_For_2_Conditional_9_Template, 5, 0, "div", 38);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const effect_r14 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("draggable", true);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(effect_r14.icon || "\u2728");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(effect_r14.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(effect_r14.defaultDuration ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(effect_r14.description ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.readonly ? 9 : -1);
  }
}
function AssetBrowserComponent_Conditional_29_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Statuseffekte gefunden.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_29_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 27);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_29_Conditional_4_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r16);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.addStatusEffect.emit());
    });
    \u0275\u0275text(1, "+ Statuseffekt hinzuf\xFCgen");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_29_For_2_Template, 10, 7, "div", 30, _forTrack2, true);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_29_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275conditionalCreate(4, AssetBrowserComponent_Conditional_29_Conditional_4_Template, 2, 0, "button", 24);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredStatusEffects);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredStatusEffects.length === 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.readonly ? 4 : -1);
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 48);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const shop_r19 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(shop_r19.description);
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 55);
    \u0275\u0275text(1, "\u2B05 Ankauf");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 56);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const deal_r20 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r1.formatCurrency(deal_r20.price));
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 57);
    \u0275\u0275text(1, "\u{1F4AC}");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 53)(1, "span", 54);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Conditional_3_Template, 2, 0, "span", 55)(4, AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Conditional_4_Template, 2, 1, "span", 56)(5, AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Conditional_5_Template, 2, 0, "span", 57);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const deal_r20 = ctx.$implicit;
    \u0275\u0275classProp("reverse", deal_r20.isReverseDeal);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(deal_r20.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(deal_r20.isReverseDeal ? 3 : deal_r20.price ? 4 : deal_r20.isNegotiable ? 5 : -1);
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_10_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const shop_r19 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", shop_r19.deals.length - 3, " weitere");
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 50);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_30_For_2_Conditional_10_For_2_Template, 6, 4, "div", 51, _forTrack3);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_30_For_2_Conditional_10_Conditional_3_Template, 2, 1, "span", 52);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const shop_r19 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(shop_r19.deals.slice(0, 3));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(shop_r19.deals.length > 3 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_30_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 44);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_30_For_2_Template_div_dragstart_0_listener($event) {
      const $index_r18 = \u0275\u0275restoreView(_r17).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "shop", $index_r18));
    });
    \u0275\u0275elementStart(1, "div", 45)(2, "span", 46);
    \u0275\u0275text(3, "\u{1F3EA}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 47);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, AssetBrowserComponent_Conditional_30_For_2_Conditional_6_Template, 2, 1, "p", 48);
    \u0275\u0275elementStart(7, "div", 49)(8, "strong");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, AssetBrowserComponent_Conditional_30_For_2_Conditional_10_Template, 4, 1, "div", 50);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const shop_r19 = ctx.$implicit;
    \u0275\u0275classProp("draggable", true);
    \u0275\u0275attribute("draggable", true);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(shop_r19.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(shop_r19.description ? 6 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", (shop_r19.deals == null ? null : shop_r19.deals.length) || 0, " Angebote");
    \u0275\u0275advance();
    \u0275\u0275conditional(shop_r19.deals && shop_r19.deals.length > 0 ? 10 : -1);
  }
}
function AssetBrowserComponent_Conditional_30_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Shops in verkn\xFCpften Bibliotheken.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_30_For_2_Template, 11, 7, "div", 43, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_30_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredShops);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredShops.length === 0 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_31_For_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bundle_r23 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(bundle_r23.description);
  }
}
function AssetBrowserComponent_Conditional_31_For_2_Conditional_10_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 66);
    \u0275\u0275element(1, "span");
    \u0275\u0275elementStart(2, "span", 67);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r24 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275classMap(\u0275\u0275interpolate1("loot-type app-icon ", ctx_r1.getLootTypeIcon(item_r24.type)));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getLootItemName(item_r24));
  }
}
function AssetBrowserComponent_Conditional_31_For_2_Conditional_10_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 52);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bundle_r23 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", bundle_r23.items.length - 3, " weitere");
  }
}
function AssetBrowserComponent_Conditional_31_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 65);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_31_For_2_Conditional_10_For_2_Template, 4, 4, "div", 66, _forTrack3);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_31_For_2_Conditional_10_Conditional_3_Template, 2, 1, "span", 52);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bundle_r23 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(bundle_r23.items.slice(0, 3));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(bundle_r23.items.length > 3 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_31_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 59);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_31_For_2_Template_div_dragstart_0_listener($event) {
      const $index_r22 = \u0275\u0275restoreView(_r21).$index;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "loot-bundle", $index_r22));
    });
    \u0275\u0275elementStart(1, "div", 60)(2, "span", 61);
    \u0275\u0275text(3, "\u{1F4B0}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 62);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, AssetBrowserComponent_Conditional_31_For_2_Conditional_6_Template, 2, 1, "p", 63);
    \u0275\u0275elementStart(7, "div", 64)(8, "strong");
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, AssetBrowserComponent_Conditional_31_For_2_Conditional_10_Template, 4, 1, "div", 65);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const bundle_r23 = ctx.$implicit;
    \u0275\u0275classProp("draggable", true);
    \u0275\u0275attribute("draggable", true);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(bundle_r23.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(bundle_r23.description ? 6 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", (bundle_r23.items == null ? null : bundle_r23.items.length) || 0, " Gegenst\xE4nde");
    \u0275\u0275advance();
    \u0275\u0275conditional(bundle_r23.items && bundle_r23.items.length > 0 ? 10 : -1);
  }
}
function AssetBrowserComponent_Conditional_31_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Beutepakete in verkn\xFCpften Bibliotheken.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_31_For_2_Template, 11, 7, "div", 58, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_31_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredBundles);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredBundles.length === 0 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_8_For_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 72);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r27 = ctx.$implicit;
    \u0275\u0275property("value", tag_r27);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tag_r27);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 70)(1, "select", 13);
    \u0275\u0275twoWayListener("ngModelChange", function AssetBrowserComponent_Conditional_32_Conditional_8_Template_select_ngModelChange_1_listener($event) {
      \u0275\u0275restoreView(_r26);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.runeTagFilter, $event) || (ctx_r1.runeTagFilter = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function AssetBrowserComponent_Conditional_32_Conditional_8_Template_select_ngModelChange_1_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onRuneTagFilterChange());
    });
    \u0275\u0275elementStart(2, "option", 14);
    \u0275\u0275text(3, "Alle Tags");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(4, AssetBrowserComponent_Conditional_32_Conditional_8_For_5_Template, 2, 2, "option", 72, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.runeTagFilter);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r1.getUniqueRuneTags());
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 76);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const rune_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("alt", \u0275\u0275interpolate(rune_r29.name))("src", \u0275\u0275pipeBind1(1, 3, rune_r29.drawing), \u0275\u0275sanitizeUrl);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 77);
    \u0275\u0275element(1, "span", 88);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", rune_r29.glowColor || "#8b5cf6");
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 83);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", rune_r29.mana, " M");
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 84);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", rune_r29.fokus, " F");
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_13_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 89);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r30 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(tag_r30);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 85);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_13_For_2_Template, 2, 1, "span", 89, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275repeater(rune_r29.tags);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 86);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(rune_r29.description);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 90);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_15_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r31);
      const rune_r29 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.openRuneEditor.emit(ctx_r1.getOriginalIndex(rune_r29, "runes")));
    });
    \u0275\u0275element(1, "span", 40);
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 74);
    \u0275\u0275listener("dragstart", function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Template_div_dragstart_0_listener($event) {
      const rune_r29 = \u0275\u0275restoreView(_r28).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onDragStart($event, "rune", ctx_r1.getOriginalIndex(rune_r29, "runes")));
    })("contextmenu", function AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Template_div_contextmenu_0_listener($event) {
      const rune_r29 = \u0275\u0275restoreView(_r28).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.onContextMenu($event, "rune", ctx_r1.getOriginalIndex(rune_r29, "runes")));
    });
    \u0275\u0275elementStart(1, "div", 75);
    \u0275\u0275conditionalCreate(2, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_2_Template, 2, 5, "img", 76)(3, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_3_Template, 2, 2, "div", 77);
    \u0275\u0275elementStart(4, "div", 78)(5, "div", 79)(6, "span", 80);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 81);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 82);
    \u0275\u0275conditionalCreate(11, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_11_Template, 2, 1, "span", 83);
    \u0275\u0275conditionalCreate(12, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_12_Template, 2, 1, "span", 84);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(13, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_13_Template, 3, 0, "div", 85);
    \u0275\u0275conditionalCreate(14, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_14_Template, 2, 1, "p", 86);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(15, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Conditional_15_Template, 2, 0, "button", 87);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r29 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275styleProp("border-left-color", rune_r29.glowColor || "#8b5cf6");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(rune_r29.drawing ? 2 : 3);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(rune_r29.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getRuneTypeLabel(rune_r29.runeType));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(rune_r29.mana ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rune_r29.fokus ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional((rune_r29.tags == null ? null : rune_r29.tags.length) ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(rune_r29.description ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r1.readonly ? 15 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Runen gefunden.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 71);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_32_Conditional_9_For_2_Template, 16, 10, "div", 73, _forTrack4, true);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_32_Conditional_9_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredRunes);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredRunes.length === 0 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 93);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r32 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(mat_r32.icon);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275pipe(1, "lowercase");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r32 = \u0275\u0275nextContext().$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classMap(\u0275\u0275interpolate1("rarity-badge rarity-", \u0275\u0275pipeBind1(1, 4, mat_r32.rarity)));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getRarityLabel(mat_r32.rarity));
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 97);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r32 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(mat_r32.description);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_9_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 101);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r32 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(mat_r32.weaponStats.extraEffect);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 98)(1, "span", 100);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 100);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_9_Conditional_5_Template, 2, 1, "span", 101);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r32 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("HB ", mat_r32.weaponStats.haltbarkeit);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("EFF ", mat_r32.weaponStats.effektivitaet);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r32.weaponStats.extraEffect ? 5 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 99);
    \u0275\u0275text(1, "\xD6ffentlich");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 91)(1, "div", 92);
    \u0275\u0275conditionalCreate(2, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_2_Template, 2, 1, "span", 93);
    \u0275\u0275elementStart(3, "span", 94);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_5_Template, 3, 6, "span", 95);
    \u0275\u0275elementStart(6, "span", 96);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_8_Template, 2, 1, "p", 97);
    \u0275\u0275conditionalCreate(9, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_9_Template, 6, 3, "div", 98);
    \u0275\u0275conditionalCreate(10, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Conditional_10_Template, 2, 0, "span", 99);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r32 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(mat_r32.icon ? 2 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(mat_r32.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r32.rarity ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getMaterialCategoryLabel(mat_r32));
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r32.description ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r32.weaponStats ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(mat_r32.isPublic ? 10 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Materialien gefunden. Erstelle Materialien in den Bibliotheken.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_32_Conditional_10_For_2_Template, 11, 7, "div", 91, _forTrack3);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_32_Conditional_10_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredMaterials);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredMaterials.length === 0 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 103);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trait_r33 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("bis Lv.", trait_r33.maxLevel);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 97);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trait_r33 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(trait_r33.description);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 99);
    \u0275\u0275text(1, "\xD6ffentlich");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 91)(1, "div", 92)(2, "span", 94);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 102);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(6, AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Conditional_6_Template, 2, 1, "span", 103);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "p", 104);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(9, AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Conditional_9_Template, 2, 1, "p", 97);
    \u0275\u0275conditionalCreate(10, AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Conditional_10_Template, 2, 0, "span", 99);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trait_r33 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(trait_r33.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", trait_r33.schmiedepunktKosten, " SP");
    \u0275\u0275advance();
    \u0275\u0275conditional(trait_r33.scalable ? 6 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(trait_r33.effect);
    \u0275\u0275advance();
    \u0275\u0275conditional(trait_r33.description ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(trait_r33.isPublic ? 10 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_11_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 23);
    \u0275\u0275text(1, "Keine Schmiede-Traits gefunden. Erstelle Traits in den Bibliotheken.");
    \u0275\u0275elementEnd();
  }
}
function AssetBrowserComponent_Conditional_32_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 12);
    \u0275\u0275repeaterCreate(1, AssetBrowserComponent_Conditional_32_Conditional_11_For_2_Template, 11, 6, "div", 91, _forTrack3);
    \u0275\u0275conditionalCreate(3, AssetBrowserComponent_Conditional_32_Conditional_11_Conditional_3_Template, 2, 0, "p", 23);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.filteredForgeTraits);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredForgeTraits.length === 0 ? 3 : -1);
  }
}
function AssetBrowserComponent_Conditional_32_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 68)(1, "button", 69);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_32_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r25);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setActiveKnowledgeTab("rune"));
    });
    \u0275\u0275element(2, "span", 4);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 69);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_32_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r25);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setActiveKnowledgeTab("material"));
    });
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 69);
    \u0275\u0275listener("click", function AssetBrowserComponent_Conditional_32_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r25);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.setActiveKnowledgeTab("forge-trait"));
    });
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(8, AssetBrowserComponent_Conditional_32_Conditional_8_Template, 6, 1, "div", 70);
    \u0275\u0275conditionalCreate(9, AssetBrowserComponent_Conditional_32_Conditional_9_Template, 4, 1, "div", 71);
    \u0275\u0275conditionalCreate(10, AssetBrowserComponent_Conditional_32_Conditional_10_Template, 4, 1, "div", 12);
    \u0275\u0275conditionalCreate(11, AssetBrowserComponent_Conditional_32_Conditional_11_Template, 4, 1, "div", 12);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.activeKnowledgeTab === "rune");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Runen (", ctx_r1.filteredRunes.length, ") ");
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.activeKnowledgeTab === "material");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u{1FAA8} Materialien (", ctx_r1.filteredMaterials.length, ") ");
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.activeKnowledgeTab === "forge-trait");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" \u{1F528} Schmiede-Traits (", ctx_r1.filteredForgeTraits.length, ") ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.activeKnowledgeTab === "rune" && ctx_r1.getUniqueRuneTags().length > 0 ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.activeKnowledgeTab === "rune" ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.activeKnowledgeTab === "material" ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.activeKnowledgeTab === "forge-trait" ? 11 : -1);
  }
}
var AssetBrowserComponent = class _AssetBrowserComponent {
  items = [];
  runes = [];
  spells = [];
  skills = [];
  statusEffects = [];
  shops = [];
  lootBundles = [];
  materials = [];
  forgeTraits = [];
  dummySheet;
  editingItems;
  editingRunes;
  editingSpells;
  editingSkills;
  editingStatusEffects = /* @__PURE__ */ new Set();
  readonly = false;
  // When true, hides add/delete buttons
  addItem = new EventEmitter();
  addRune = new EventEmitter();
  addSpell = new EventEmitter();
  addSkill = new EventEmitter();
  addStatusEffect = new EventEmitter();
  openItemEditor = new EventEmitter();
  openRuneEditor = new EventEmitter();
  openSpellEditor = new EventEmitter();
  openSkillEditor = new EventEmitter();
  openStatusEffectEditor = new EventEmitter();
  updateItem = new EventEmitter();
  updateRune = new EventEmitter();
  updateSpell = new EventEmitter();
  updateSkill = new EventEmitter();
  updateStatusEffect = new EventEmitter();
  removeItem = new EventEmitter();
  removeRune = new EventEmitter();
  removeSpell = new EventEmitter();
  removeSkill = new EventEmitter();
  removeStatusEffect = new EventEmitter();
  itemEditingChange = new EventEmitter();
  runeEditingChange = new EventEmitter();
  spellEditingChange = new EventEmitter();
  skillEditingChange = new EventEmitter();
  statusEffectEditingChange = new EventEmitter();
  dragStart = new EventEmitter();
  contextMenuRequest = new EventEmitter();
  activeTab = "items";
  activeKnowledgeTab = "rune";
  _searchTerm = "";
  // Per-tab filters
  itemTypeFilter = "";
  skillTypeFilter = "";
  runeTagFilter = "";
  filteredItems = [];
  filteredRunes = [];
  filteredSpells = [];
  filteredSkills = [];
  filteredStatusEffects = [];
  filteredShops = [];
  filteredBundles = [];
  filteredMaterials = [];
  filteredForgeTraits = [];
  // Track previous array lengths to detect add/remove vs patch
  prevItemsLength = 0;
  prevRunesLength = 0;
  prevSpellsLength = 0;
  prevSkillsLength = 0;
  prevStatusEffectsLength = 0;
  prevShopsLength = 0;
  prevBundlesLength = 0;
  get searchTerm() {
    return this._searchTerm;
  }
  set searchTerm(value) {
    this._searchTerm = value;
    this.updateFilteredArrays();
  }
  ngOnChanges(changes) {
    let shouldUpdate = false;
    if (changes["items"] && this.items.length !== this.prevItemsLength) {
      this.prevItemsLength = this.items.length;
      shouldUpdate = true;
    }
    if (changes["runes"] && this.runes.length !== this.prevRunesLength) {
      this.prevRunesLength = this.runes.length;
      shouldUpdate = true;
    }
    if (changes["spells"] && this.spells.length !== this.prevSpellsLength) {
      this.prevSpellsLength = this.spells.length;
      shouldUpdate = true;
    }
    if (changes["skills"] && this.skills.length !== this.prevSkillsLength) {
      this.prevSkillsLength = this.skills.length;
      shouldUpdate = true;
    }
    if (changes["statusEffects"] && this.statusEffects.length !== this.prevStatusEffectsLength) {
      this.prevStatusEffectsLength = this.statusEffects.length;
      shouldUpdate = true;
    }
    if (changes["shops"] && this.shops.length !== this.prevShopsLength) {
      this.prevShopsLength = this.shops.length;
      shouldUpdate = true;
    }
    if (changes["lootBundles"] && this.lootBundles.length !== this.prevBundlesLength) {
      this.prevBundlesLength = this.lootBundles.length;
      shouldUpdate = true;
    }
    if (changes["materials"] || changes["forgeTraits"]) {
      shouldUpdate = true;
    }
    if (changes["items"]?.firstChange || changes["runes"]?.firstChange || changes["spells"]?.firstChange || changes["skills"]?.firstChange || changes["statusEffects"]?.firstChange || changes["shops"]?.firstChange || changes["lootBundles"]?.firstChange || changes["materials"]?.firstChange || changes["forgeTraits"]?.firstChange) {
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      this.updateFilteredArrays();
    }
  }
  updateFilteredArrays() {
    const term = this._searchTerm;
    this.filteredItems = this.filterItems(this.items, term);
    this.filteredRunes = this.filterRunes(this.runes, term);
    this.filteredSpells = this.filterAndSort(this.spells, term);
    this.filteredSkills = this.filterSkills(this.skills, term);
    this.filteredStatusEffects = this.filterAndSort(this.statusEffects || [], term);
    this.filteredShops = this.filterAndSort(this.shops || [], term);
    this.filteredBundles = this.filterAndSort(this.lootBundles || [], term);
    this.filteredMaterials = this.filterKnowledge(this.materials || [], term);
    this.filteredForgeTraits = this.filterKnowledge(this.forgeTraits || [], term);
  }
  filterItems(array, searchTerm) {
    let filtered = array;
    if (this.itemTypeFilter) {
      filtered = filtered.filter((item) => item.itemType === this.itemTypeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => item.name?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term));
    }
    return [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  filterRunes(array, searchTerm) {
    let filtered = array;
    if (this.runeTagFilter) {
      filtered = filtered.filter((r) => r.tags?.includes(this.runeTagFilter));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r) => r.name?.toLowerCase().includes(term) || r.description?.toLowerCase().includes(term) || r.tags?.some((t) => t.toLowerCase().includes(term)));
    }
    return [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  filterSkills(array, searchTerm) {
    let filtered = array;
    if (this.skillTypeFilter) {
      filtered = filtered.filter((s) => s.type === this.skillTypeFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((s) => s.name?.toLowerCase().includes(term) || s.description?.toLowerCase().includes(term));
    }
    const typeOrder = { "dice_bonus": 0, "active": 1, "passive": 2, "stat_bonus": 3 };
    return [...filtered].sort((a, b) => {
      const oA = typeOrder[a.type ?? ""] ?? 4;
      const oB = typeOrder[b.type ?? ""] ?? 4;
      if (oA !== oB)
        return oA - oB;
      return (a.name || "").localeCompare(b.name || "");
    });
  }
  filterKnowledge(array, searchTerm) {
    if (!searchTerm)
      return [...array].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    const term = searchTerm.toLowerCase();
    return array.filter((item) => item.name?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term)).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  filterAndSort(array, searchTerm) {
    let filtered = array;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = array.filter((item) => item.name?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term));
    }
    return [...filtered].sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
  getOriginalIndex(item, type) {
    const originalArray = type === "items" ? this.items : type === "runes" ? this.runes : type === "spells" ? this.spells : type === "skills" ? this.skills : this.statusEffects;
    return originalArray.indexOf(item);
  }
  setActiveTab(tab) {
    this.activeTab = tab;
  }
  setActiveKnowledgeTab(tab) {
    this.activeKnowledgeTab = tab;
  }
  onItemTypeFilterChange() {
    this.filteredItems = this.filterItems(this.items, this._searchTerm);
  }
  onSkillTypeFilterChange() {
    this.filteredSkills = this.filterSkills(this.skills, this._searchTerm);
  }
  onRuneTagFilterChange() {
    this.filteredRunes = this.filterRunes(this.runes, this._searchTerm);
  }
  getRuneTypeLabel(runeType) {
    return runeType ? RUNE_TYPE_LABELS[runeType] ?? runeType : "Legacy";
  }
  getMaterialCategoryLabel(m) {
    const cats = [];
    if (m.canBeWeaponMaterial)
      cats.push("Waffe");
    if (m.canBeArmorMaterial)
      cats.push("R\xFCstung");
    return cats.join(" / ") || "Allgemein";
  }
  getRarityLabel(rarity) {
    const map = { COMMON: "H\xE4ufig", RARE: "Selten", LEGENDARY: "Legend\xE4r" };
    return rarity ? map[rarity] ?? rarity : "";
  }
  getUniqueRuneTags() {
    const tags = /* @__PURE__ */ new Set();
    this.runes.forEach((r) => r.tags?.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }
  getSkillTypeLabel(type) {
    const labels = {
      active: "Aktiv",
      passive: "Passiv",
      dice_bonus: "W\xFCrfelbonus",
      stat_bonus: "Wertbonus"
    };
    return type ? labels[type] ?? type : "";
  }
  onDragStart(event, type, index) {
    this.dragStart.emit({ event, type, index });
  }
  onContextMenu(event, type, index) {
    event.preventDefault();
    this.contextMenuRequest.emit({ event, type, index });
  }
  isItemEditing(index) {
    return this.editingItems.has(index);
  }
  isRuneEditing(index) {
    return this.editingRunes.has(index);
  }
  isSpellEditing(index) {
    return this.editingSpells.has(index);
  }
  isSkillEditing(index) {
    return this.editingSkills.has(index);
  }
  isStatusEffectEditing(index) {
    return this.editingStatusEffects.has(index);
  }
  onItemUpdate(index, patch) {
    this.updateItem.emit({ index, patch });
  }
  onRuneUpdate(index, patch) {
    this.updateRune.emit({ index, patch });
  }
  onSpellUpdate(index, patch) {
    this.updateSpell.emit({ index, patch });
  }
  onSkillUpdate(index, patch) {
    this.updateSkill.emit({ index, patch });
  }
  onStatusEffectUpdate(index, patch) {
    this.updateStatusEffect.emit({ index, patch });
  }
  onItemEditingChange(index, isEditing) {
    this.itemEditingChange.emit({ index, isEditing });
  }
  onRuneEditingChange(index, isEditing) {
    this.runeEditingChange.emit({ index, isEditing });
  }
  onSpellEditingChange(index, isEditing) {
    this.spellEditingChange.emit({ index, isEditing });
  }
  onSkillEditingChange(index, isEditing) {
    this.skillEditingChange.emit({ index, isEditing });
  }
  onStatusEffectEditingChange(index, isEditing) {
    this.statusEffectEditingChange.emit({ index, isEditing });
  }
  // ==================== SHOP/BUNDLE HELPERS ====================
  formatCurrency(currency) {
    const parts = [];
    if (currency.platinum > 0)
      parts.push(`${currency.platinum}p`);
    if (currency.gold > 0)
      parts.push(`${currency.gold}g`);
    if (currency.silver > 0)
      parts.push(`${currency.silver}s`);
    if (currency.copper > 0)
      parts.push(`${currency.copper}c`);
    return parts.length > 0 ? parts.join(" ") : "0c";
  }
  getLootTypeIcon(type) {
    switch (type) {
      case "item":
        return "i-item";
      case "rune":
        return "i-spell";
      case "spell":
        return "i-spell";
      case "skill":
        return "i-ability";
      case "status-effect":
        return "i-status-effect";
      case "currency":
        return "i-stat";
      default:
        return "i-item";
    }
  }
  getLootItemName(lootItem) {
    if (lootItem.type === "currency") {
      return this.formatCurrency(lootItem.data);
    }
    return lootItem.data?.name || "Unnamed";
  }
  static \u0275fac = function AssetBrowserComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AssetBrowserComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AssetBrowserComponent, selectors: [["app-asset-browser"]], inputs: { items: "items", runes: "runes", spells: "spells", skills: "skills", statusEffects: "statusEffects", shops: "shops", lootBundles: "lootBundles", materials: "materials", forgeTraits: "forgeTraits", dummySheet: "dummySheet", editingItems: "editingItems", editingRunes: "editingRunes", editingSpells: "editingSpells", editingSkills: "editingSkills", editingStatusEffects: "editingStatusEffects", readonly: "readonly" }, outputs: { addItem: "addItem", addRune: "addRune", addSpell: "addSpell", addSkill: "addSkill", addStatusEffect: "addStatusEffect", openItemEditor: "openItemEditor", openRuneEditor: "openRuneEditor", openSpellEditor: "openSpellEditor", openSkillEditor: "openSkillEditor", openStatusEffectEditor: "openStatusEffectEditor", updateItem: "updateItem", updateRune: "updateRune", updateSpell: "updateSpell", updateSkill: "updateSkill", updateStatusEffect: "updateStatusEffect", removeItem: "removeItem", removeRune: "removeRune", removeSpell: "removeSpell", removeSkill: "removeSkill", removeStatusEffect: "removeStatusEffect", itemEditingChange: "itemEditingChange", runeEditingChange: "runeEditingChange", spellEditingChange: "spellEditingChange", skillEditingChange: "skillEditingChange", statusEffectEditingChange: "statusEffectEditingChange", dragStart: "dragStart", contextMenuRequest: "contextMenuRequest" }, features: [\u0275\u0275NgOnChangesFeature], decls: 33, vars: 30, consts: [[1, "asset-browser-container"], [1, "tabs-header"], [1, "tab-button", 3, "click"], [1, "app-icon", "i-item"], [1, "app-icon", "i-spell"], [1, "app-icon", "i-ability"], [1, "app-icon", "i-status-effect"], [1, "app-icon", "i-brewing"], [1, "search-container"], ["type", "text", "placeholder", "Nach Name oder Beschreibung suchen...", 1, "search-input", 3, "ngModelChange", "ngModel"], [1, "tab-filter", 3, "ngModel"], [1, "tab-content"], [1, "library-list"], [1, "tab-filter", 3, "ngModelChange", "ngModel"], ["value", ""], ["value", "weapon"], ["value", "armor"], ["value", "other"], ["value", "active"], ["value", "passive"], ["value", "dice_bonus"], ["value", "stat_bonus"], [1, "library-item-wrapper", 3, "draggable"], [1, "empty-hint"], [1, "add-button"], [1, "library-item-wrapper", 3, "dragstart", "contextmenu"], [3, "patch", "delete", "editingChange", "openEditor", "item", "sheet", "index", "isEditing"], [1, "add-button", 3, "click"], [3, "patch", "delete", "editingChange", "openEditor", "spell", "sheet", "index", "isEditing"], [3, "patch", "delete", "editingChange", "openEditor", "skill", "sheet", "index", "isEditing"], ["draggable", "true", 1, "library-item-wrapper", "status-effect-item", 3, "draggable"], ["draggable", "true", 1, "library-item-wrapper", "status-effect-item", 3, "dragstart", "contextmenu"], [1, "status-effect-card"], [1, "effect-header"], [1, "effect-icon"], [1, "effect-name"], [1, "effect-duration"], [1, "effect-description"], [1, "effect-actions"], [1, "edit-btn", 3, "click"], [1, "app-icon", "i-draw"], [1, "delete-btn", 3, "click"], [1, "app-icon", "i-restore-trash"], [1, "shop-card", 3, "draggable"], [1, "shop-card", 3, "dragstart"], [1, "shop-header"], [1, "shop-icon"], [1, "shop-name"], [1, "shop-description"], [1, "deals-summary"], [1, "deals-preview"], [1, "deal-preview-item", 3, "reverse"], [1, "more-items"], [1, "deal-preview-item"], [1, "deal-name"], [1, "reverse-badge"], [1, "deal-price"], [1, "negotiable"], [1, "bundle-card", 3, "draggable"], [1, "bundle-card", 3, "dragstart"], [1, "bundle-header"], [1, "bundle-icon"], [1, "bundle-name"], [1, "bundle-description"], [1, "loot-summary"], [1, "loot-preview"], [1, "loot-preview-item"], [1, "loot-name"], [1, "knowledge-sub-tabs"], [1, "sub-tab-btn", 3, "click"], [1, "knowledge-filter-row"], [1, "library-list", "rune-list"], [3, "value"], ["draggable", "true", 1, "rune-compact-card", 3, "border-left-color"], ["draggable", "true", 1, "rune-compact-card", 3, "dragstart", "contextmenu"], [1, "rune-card-body"], [1, "rune-drawing-thumb", 3, "src", "alt"], [1, "rune-drawing-placeholder"], [1, "rune-card-info"], [1, "rune-compact-header"], [1, "rune-compact-name"], [1, "rune-compact-type"], [1, "rune-compact-costs"], [1, "cost-badge", "mana"], [1, "cost-badge", "fokus"], [1, "rune-tags-row"], [1, "rune-compact-desc"], [1, "edit-btn-sm"], [1, "rune-dot"], [1, "rune-tag"], [1, "edit-btn-sm", 3, "click"], [1, "knowledge-card"], [1, "knowledge-card-header"], [1, "knowledge-icon"], [1, "knowledge-name"], [3, "class"], [1, "knowledge-category"], [1, "knowledge-desc"], [1, "knowledge-stats"], [1, "public-badge"], [1, "stat-chip"], [1, "stat-chip", "effect"], [1, "knowledge-cost"], [1, "scalable-badge"], [1, "knowledge-effect"]], template: function AssetBrowserComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_2_listener() {
        return ctx.setActiveTab("items");
      });
      \u0275\u0275element(3, "span", 3);
      \u0275\u0275text(4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_5_listener() {
        return ctx.setActiveTab("spells");
      });
      \u0275\u0275element(6, "span", 4);
      \u0275\u0275text(7);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_8_listener() {
        return ctx.setActiveTab("skills");
      });
      \u0275\u0275element(9, "span", 5);
      \u0275\u0275text(10);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_11_listener() {
        return ctx.setActiveTab("status-effects");
      });
      \u0275\u0275element(12, "span", 6);
      \u0275\u0275text(13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_14_listener() {
        return ctx.setActiveTab("shops");
      });
      \u0275\u0275text(15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_16_listener() {
        return ctx.setActiveTab("loot-bundles");
      });
      \u0275\u0275text(17);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "button", 2);
      \u0275\u0275listener("click", function AssetBrowserComponent_Template_button_click_18_listener() {
        return ctx.setActiveTab("knowledge");
      });
      \u0275\u0275element(19, "span", 7);
      \u0275\u0275text(20, " Wissen ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(21, "div", 8)(22, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function AssetBrowserComponent_Template_input_ngModelChange_22_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.searchTerm, $event) || (ctx.searchTerm = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(23, AssetBrowserComponent_Conditional_23_Template, 9, 1, "select", 10);
      \u0275\u0275conditionalCreate(24, AssetBrowserComponent_Conditional_24_Template, 11, 1, "select", 10);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "div", 11);
      \u0275\u0275conditionalCreate(26, AssetBrowserComponent_Conditional_26_Template, 5, 2, "div", 12);
      \u0275\u0275conditionalCreate(27, AssetBrowserComponent_Conditional_27_Template, 5, 2, "div", 12);
      \u0275\u0275conditionalCreate(28, AssetBrowserComponent_Conditional_28_Template, 5, 2, "div", 12);
      \u0275\u0275conditionalCreate(29, AssetBrowserComponent_Conditional_29_Template, 5, 2, "div", 12);
      \u0275\u0275conditionalCreate(30, AssetBrowserComponent_Conditional_30_Template, 4, 1, "div", 12);
      \u0275\u0275conditionalCreate(31, AssetBrowserComponent_Conditional_31_Template, 4, 1, "div", 12);
      \u0275\u0275conditionalCreate(32, AssetBrowserComponent_Conditional_32_Template, 12, 13);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.activeTab === "items");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" Items (", ctx.items.length, ") ");
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.activeTab === "spells");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" Zauber (", ctx.spells.length, ") ");
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.activeTab === "skills");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" Talente (", ctx.skills.length, ") ");
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.activeTab === "status-effects");
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" Effekte (", ctx.statusEffects.length || 0, ") ");
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.activeTab === "shops");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" \u{1F3EA} Handel (", ctx.shops.length || 0, ") ");
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.activeTab === "loot-bundles");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" \u{1F4B0} Beute (", ctx.lootBundles.length || 0, ") ");
      \u0275\u0275advance();
      \u0275\u0275classProp("active", ctx.activeTab === "knowledge");
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.searchTerm);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "items" ? 23 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "skills" ? 24 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.activeTab === "items" ? 26 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "spells" ? 27 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "skills" ? 28 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "status-effects" ? 29 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "shops" ? 30 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "loot-bundles" ? 31 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.activeTab === "knowledge" ? 32 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgModel, ItemComponent, SpellComponent, SkillComponent, LowerCasePipe, ImageUrlPipe], styles: ["\n\n.asset-browser-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  overflow: hidden;\n}\n.tabs-header[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  background: var(--bg);\n  border-bottom: 2px solid var(--border);\n}\n.tab-button[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.5rem 0.6rem;\n  background: transparent;\n  border: none;\n  border-bottom: 3px solid transparent;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 12px;\n  color: var(--muted);\n  transition: all 0.2s;\n  white-space: nowrap;\n}\n.tab-button[_ngcontent-%COMP%]:hover {\n  background: rgba(107, 70, 193, 0.05);\n  color: var(--accent);\n}\n.tab-button.active[_ngcontent-%COMP%] {\n  color: var(--accent);\n  border-bottom-color: var(--accent);\n  background: var(--card);\n}\n.search-container[_ngcontent-%COMP%] {\n  padding: 0.6rem 1rem;\n  background: var(--card);\n  border-bottom: 1px solid var(--border);\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.search-input[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  padding: 0.5rem 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  color: var(--text);\n  font-size: 14px;\n  transition: border-color 0.2s;\n}\n.search-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.search-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--muted);\n}\n.tab-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1rem;\n}\n.library-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.library-item-wrapper[_ngcontent-%COMP%] {\n  cursor: grab;\n  transition: opacity 0.2s;\n}\n.library-item-wrapper[draggable=true][_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.library-item-wrapper[draggable=false][_ngcontent-%COMP%] {\n  cursor: default;\n}\n.add-button[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 14px;\n  transition: background 0.2s;\n  margin-top: 0.5rem;\n}\n.add-button[_ngcontent-%COMP%]:hover {\n  background: var(--accentdark);\n}\n.tab-content[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n}\n.tab-content[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--bg);\n}\n.tab-content[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 4px;\n}\n.tab-content[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: var(--muted);\n}\n.status-effect-card[_ngcontent-%COMP%] {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 12px;\n}\n.effect-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.effect-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n}\n.effect-name[_ngcontent-%COMP%] {\n  flex: 1;\n  font-weight: 600;\n  color: var(--text);\n}\n.effect-duration[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--muted);\n  background: rgba(107, 70, 193, 0.2);\n  padding: 2px 8px;\n  border-radius: 12px;\n}\n.effect-description[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  font-size: 13px;\n  color: var(--muted);\n  line-height: 1.4;\n}\n.effect-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n}\n.effect-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 4px 8px;\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  transition: background 0.2s;\n}\n.effect-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.1);\n}\n.effect-actions[_ngcontent-%COMP%]   .delete-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 100, 100, 0.2);\n}\n.shop-card[_ngcontent-%COMP%], \n.bundle-card[_ngcontent-%COMP%] {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 16px;\n  margin-bottom: 12px;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.shop-card[draggable=true][_ngcontent-%COMP%], \n.bundle-card[draggable=true][_ngcontent-%COMP%] {\n  cursor: grab;\n}\n.shop-card[draggable=true][_ngcontent-%COMP%]:active, \n.bundle-card[draggable=true][_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.shop-card[_ngcontent-%COMP%]:hover, \n.bundle-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n.shop-header[_ngcontent-%COMP%], \n.bundle-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 8px;\n}\n.shop-icon[_ngcontent-%COMP%], \n.bundle-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n}\n.shop-name[_ngcontent-%COMP%], \n.bundle-name[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--text);\n}\n.shop-description[_ngcontent-%COMP%], \n.bundle-description[_ngcontent-%COMP%] {\n  margin: 8px 0;\n  font-size: 13px;\n  color: var(--muted);\n  line-height: 1.4;\n}\n.deals-summary[_ngcontent-%COMP%], \n.loot-summary[_ngcontent-%COMP%] {\n  margin-top: 12px;\n  padding-top: 12px;\n  border-top: 1px solid var(--border);\n}\n.deals-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.loot-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: block;\n  margin-bottom: 8px;\n  color: var(--accent);\n  font-size: 14px;\n}\n.deals-preview[_ngcontent-%COMP%], \n.loot-preview[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.deal-preview-item[_ngcontent-%COMP%], \n.loot-preview-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 8px;\n  background: rgba(255, 255, 255, 0.03);\n  border-radius: 4px;\n  font-size: 13px;\n}\n.deal-preview-item.reverse[_ngcontent-%COMP%] {\n  background: rgba(100, 150, 255, 0.1);\n  border-left: 3px solid #6496ff;\n}\n.deal-name[_ngcontent-%COMP%], \n.loot-name[_ngcontent-%COMP%] {\n  flex: 1;\n  color: var(--text);\n}\n.deal-price[_ngcontent-%COMP%] {\n  color: var(--accent);\n  font-weight: 600;\n  font-size: 12px;\n}\n.reverse-badge[_ngcontent-%COMP%] {\n  color: #6496ff;\n  font-size: 11px;\n  font-weight: 600;\n}\n.negotiable[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 12px;\n}\n.loot-type[_ngcontent-%COMP%] {\n  font-size: 16px;\n}\n.more-items[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 12px;\n  font-style: italic;\n  padding: 4px 8px;\n}\n.tab-filter[_ngcontent-%COMP%] {\n  background: var(--bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 4px 8px;\n  font-size: 12px;\n  margin-left: 6px;\n  flex-shrink: 0;\n}\n.rune-compact-card[_ngcontent-%COMP%] {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-left: 3px solid #8b5cf6;\n  border-radius: 8px;\n  padding: 6px 8px;\n  position: relative;\n}\n.rune-card-body[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n}\n.rune-drawing-thumb[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  object-fit: contain;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.3);\n  flex-shrink: 0;\n}\n.rune-drawing-placeholder[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n.rune-card-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.knowledge-filter-row[_ngcontent-%COMP%] {\n  padding: 4px 8px 0;\n  display: flex;\n  gap: 6px;\n}\n.rune-list[_ngcontent-%COMP%] {\n  gap: 4px;\n}\n.rune-compact-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.rune-dot[_ngcontent-%COMP%] {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.rune-compact-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 13px;\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.rune-compact-type[_ngcontent-%COMP%] {\n  font-size: 10px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  padding: 1px 5px;\n  color: var(--muted);\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.rune-compact-costs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.cost-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  border-radius: 4px;\n  padding: 1px 5px;\n  font-weight: 600;\n}\n.cost-badge.mana[_ngcontent-%COMP%] {\n  background: rgba(99, 102, 241, 0.2);\n  color: #818cf8;\n  border: 1px solid rgba(99, 102, 241, 0.3);\n}\n.cost-badge.fokus[_ngcontent-%COMP%] {\n  background: rgba(234, 179, 8, 0.2);\n  color: #fbbf24;\n  border: 1px solid rgba(234, 179, 8, 0.3);\n}\n.rune-tags-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 5px;\n}\n.rune-tag[_ngcontent-%COMP%] {\n  font-size: 10px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 3px;\n  padding: 1px 5px;\n  color: var(--muted);\n}\n.rune-compact-desc[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--muted);\n  margin: 4px 0 0 0;\n  line-height: 1.4;\n}\n.edit-btn-sm[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 6px;\n  right: 6px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 4px;\n  opacity: 0.5;\n  transition: opacity 0.15s;\n}\n.edit-btn-sm[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n  background: var(--card);\n}\n.knowledge-sub-tabs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  padding: 8px 12px 0;\n}\n.sub-tab-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  color: var(--muted);\n  font-size: 12px;\n  padding: 4px 10px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.sub-tab-btn.active[_ngcontent-%COMP%] {\n  background: var(--accent);\n  color: #fff;\n  border-color: var(--accent);\n}\n.knowledge-card[_ngcontent-%COMP%] {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 10px 12px;\n  margin-bottom: 6px;\n}\n.knowledge-card-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin-bottom: 4px;\n}\n.knowledge-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n}\n.knowledge-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 13px;\n  flex: 1;\n}\n.knowledge-category[_ngcontent-%COMP%] {\n  font-size: 11px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  padding: 1px 6px;\n  color: var(--muted);\n}\n.knowledge-cost[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 700;\n  color: var(--accent);\n  background: rgba(var(--accent-rgb, 139, 92, 246), 0.12);\n  border-radius: 4px;\n  padding: 1px 6px;\n}\n.knowledge-effect[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text);\n  margin: 0 0 4px 0;\n}\n.knowledge-desc[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--muted);\n  margin: 0;\n  line-height: 1.4;\n}\n.knowledge-stats[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 6px;\n}\n.stat-chip[_ngcontent-%COMP%] {\n  font-size: 11px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  padding: 2px 7px;\n  color: var(--text);\n}\n.stat-chip.effect[_ngcontent-%COMP%] {\n  color: var(--accent);\n  border-color: var(--accent);\n  background: rgba(var(--accent-rgb, 139, 92, 246), 0.08);\n}\n.rarity-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  border-radius: 4px;\n  padding: 1px 5px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.rarity-badge.rarity-common[_ngcontent-%COMP%] {\n  background: rgba(156, 163, 175, 0.2);\n  color: #9ca3af;\n  border: 1px solid rgba(156, 163, 175, 0.3);\n}\n.rarity-badge.rarity-rare[_ngcontent-%COMP%] {\n  background: rgba(99, 102, 241, 0.2);\n  color: #818cf8;\n  border: 1px solid rgba(99, 102, 241, 0.3);\n}\n.rarity-badge.rarity-legendary[_ngcontent-%COMP%] {\n  background: rgba(245, 158, 11, 0.2);\n  color: #f59e0b;\n  border: 1px solid rgba(245, 158, 11, 0.3);\n}\n.scalable-badge[_ngcontent-%COMP%] {\n  font-size: 11px;\n  background: rgba(16, 185, 129, 0.15);\n  color: #10b981;\n  border: 1px solid rgba(16, 185, 129, 0.3);\n  border-radius: 4px;\n  padding: 1px 5px;\n}\n.public-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  background: rgba(99, 102, 241, 0.1);\n  color: var(--muted);\n  border-radius: 4px;\n  padding: 1px 5px;\n  display: inline-block;\n  margin-top: 4px;\n}\n/*# sourceMappingURL=asset-browser.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AssetBrowserComponent, [{
    type: Component,
    args: [{ selector: "app-asset-browser", imports: [CommonModule, FormsModule, ItemComponent, SpellComponent, SkillComponent, ImageUrlPipe], template: `<div class="asset-browser-container">\r
  <div class="tabs-header">\r
    <button class="tab-button" [class.active]="activeTab === 'items'" (click)="setActiveTab('items')">\r
      <span class="app-icon i-item"></span> Items ({{ items.length }})\r
    </button>\r
    <button class="tab-button" [class.active]="activeTab === 'spells'" (click)="setActiveTab('spells')">\r
      <span class="app-icon i-spell"></span> Zauber ({{ spells.length }})\r
    </button>\r
    <button class="tab-button" [class.active]="activeTab === 'skills'" (click)="setActiveTab('skills')">\r
      <span class="app-icon i-ability"></span> Talente ({{ skills.length }})\r
    </button>\r
    <button class="tab-button" [class.active]="activeTab === 'status-effects'" (click)="setActiveTab('status-effects')">\r
      <span class="app-icon i-status-effect"></span> Effekte ({{ statusEffects.length || 0 }})\r
    </button>\r
    <button class="tab-button" [class.active]="activeTab === 'shops'" (click)="setActiveTab('shops')">\r
      \u{1F3EA} Handel ({{ shops.length || 0 }})\r
    </button>\r
    <button class="tab-button" [class.active]="activeTab === 'loot-bundles'" (click)="setActiveTab('loot-bundles')">\r
      \u{1F4B0} Beute ({{ lootBundles.length || 0 }})\r
    </button>\r
    <button class="tab-button" [class.active]="activeTab === 'knowledge'" (click)="setActiveTab('knowledge')">\r
      <span class="app-icon i-brewing"></span> Wissen\r
    </button>\r
  </div>\r
\r
  <div class="search-container">\r
    <input\r
      type="text"\r
      class="search-input"\r
      [(ngModel)]="searchTerm"\r
      placeholder="Nach Name oder Beschreibung suchen...">\r
\r
    <!-- Per-tab filters -->\r
    @if (activeTab === 'items') {\r
      <select class="tab-filter" [(ngModel)]="itemTypeFilter" (ngModelChange)="onItemTypeFilterChange()">\r
        <option value="">Alle Typen</option>\r
        <option value="weapon">Waffe</option>\r
        <option value="armor">R\xFCstung</option>\r
        <option value="other">Sonstiges</option>\r
      </select>\r
    }\r
    @if (activeTab === 'skills') {\r
      <select class="tab-filter" [(ngModel)]="skillTypeFilter" (ngModelChange)="onSkillTypeFilterChange()">\r
        <option value="">Alle Typen</option>\r
        <option value="active">Aktiv</option>\r
        <option value="passive">Passiv</option>\r
        <option value="dice_bonus">W\xFCrfelbonus</option>\r
        <option value="stat_bonus">Wertbonus</option>\r
      </select>\r
    }\r
  </div>\r
\r
  <div class="tab-content">\r
    <!-- Items Tab -->\r
    @if (activeTab === 'items') {\r
      <div class="library-list">\r
        @for (item of filteredItems; track i; let i = $index) {\r
          <div class="library-item-wrapper"\r
               [class.draggable]="!isItemEditing(getOriginalIndex(item, 'items'))"\r
               [attr.draggable]="!isItemEditing(getOriginalIndex(item, 'items'))"\r
               (dragstart)="onDragStart($event, 'item', getOriginalIndex(item, 'items'))"\r
               (contextmenu)="onContextMenu($event, 'item', getOriginalIndex(item, 'items'))">\r
            <app-item\r
              [item]="item"\r
              [sheet]="dummySheet"\r
              [index]="getOriginalIndex(item, 'items')"\r
              [isEditing]="isItemEditing(getOriginalIndex(item, 'items'))"\r
              (patch)="onItemUpdate(getOriginalIndex(item, 'items'), $event)"\r
              (delete)="removeItem.emit(getOriginalIndex(item, 'items'))"\r
              (editingChange)="onItemEditingChange(getOriginalIndex(item, 'items'), $event)"\r
              (openEditor)="openItemEditor.emit(getOriginalIndex(item, 'items'))">\r
            </app-item>\r
          </div>\r
        }\r
        @if (filteredItems.length === 0) {\r
          <p class="empty-hint">Keine Items gefunden.</p>\r
        }\r
        @if (!readonly) {\r
          <button class="add-button" (click)="addItem.emit()">+ Gegenstand hinzuf\xFCgen</button>\r
        }\r
      </div>\r
    }\r
\r
\r
    <!-- Spells Tab -->\r
    @if (activeTab === 'spells') {\r
      <div class="library-list">\r
        @for (spell of filteredSpells; track getOriginalIndex(spell, 'spells'); let i = $index) {\r
          <div class="library-item-wrapper"\r
               [class.draggable]="!isSpellEditing(getOriginalIndex(spell, 'spells'))"\r
               [attr.draggable]="!isSpellEditing(getOriginalIndex(spell, 'spells'))"\r
               (dragstart)="onDragStart($event, 'spell', getOriginalIndex(spell, 'spells'))"\r
               (contextmenu)="onContextMenu($event, 'spell', getOriginalIndex(spell, 'spells'))">\r
            <app-spell\r
              [spell]="spell"\r
              [sheet]="dummySheet"\r
              [index]="getOriginalIndex(spell, 'spells')"\r
              [isEditing]="isSpellEditing(getOriginalIndex(spell, 'spells'))"\r
              (patch)="onSpellUpdate(getOriginalIndex(spell, 'spells'), $event)"\r
              (delete)="removeSpell.emit(getOriginalIndex(spell, 'spells'))"\r
              (editingChange)="onSpellEditingChange(getOriginalIndex(spell, 'spells'), $event)"\r
              (openEditor)="openSpellEditor.emit(getOriginalIndex(spell, 'spells'))">\r
            </app-spell>\r
          </div>\r
        }\r
        @if (filteredSpells.length === 0) {\r
          <p class="empty-hint">Keine Zauber gefunden.</p>\r
        }\r
        @if (!readonly) {\r
          <button class="add-button" (click)="addSpell.emit()">+ Zauber hinzuf\xFCgen</button>\r
        }\r
      </div>\r
    }\r
\r
    <!-- Skills Tab -->\r
    @if (activeTab === 'skills') {\r
      <div class="library-list">\r
        @for (skill of filteredSkills; track getOriginalIndex(skill, 'skills'); let i = $index) {\r
          <div class="library-item-wrapper"\r
               [class.draggable]="!isSkillEditing(getOriginalIndex(skill, 'skills'))"\r
               [attr.draggable]="!isSkillEditing(getOriginalIndex(skill, 'skills'))"\r
               (dragstart)="onDragStart($event, 'skill', getOriginalIndex(skill, 'skills'))"\r
               (contextmenu)="onContextMenu($event, 'skill', getOriginalIndex(skill, 'skills'))">\r
            <app-skill\r
              [skill]="skill"\r
              [sheet]="dummySheet"\r
              [index]="getOriginalIndex(skill, 'skills')"\r
              [isEditing]="isSkillEditing(getOriginalIndex(skill, 'skills'))"\r
              (patch)="onSkillUpdate(getOriginalIndex(skill, 'skills'), $event)"\r
              (delete)="removeSkill.emit(getOriginalIndex(skill, 'skills'))"\r
              (editingChange)="onSkillEditingChange(getOriginalIndex(skill, 'skills'), $event)"\r
              (openEditor)="openSkillEditor.emit(getOriginalIndex(skill, 'skills'))">\r
            </app-skill>\r
          </div>\r
        }\r
        @if (filteredSkills.length === 0) {\r
          <p class="empty-hint">Keine Talente gefunden.</p>\r
        }\r
        @if (!readonly) {\r
          <button class="add-button" (click)="addSkill.emit()">+ Talent hinzuf\xFCgen</button>\r
        }\r
      </div>\r
    }\r
\r
    <!-- Status Effects Tab -->\r
    @if (activeTab === 'status-effects') {\r
      <div class="library-list">\r
        @for (effect of filteredStatusEffects; track getOriginalIndex(effect, 'status-effects'); let i = $index) {\r
          <div class="library-item-wrapper status-effect-item"\r
               [class.draggable]="true"\r
               draggable="true"\r
               (dragstart)="onDragStart($event, 'status-effect', getOriginalIndex(effect, 'status-effects'))"\r
               (contextmenu)="onContextMenu($event, 'status-effect', getOriginalIndex(effect, 'status-effects'))">\r
            <div class="status-effect-card">\r
              <div class="effect-header">\r
                <span class="effect-icon">{{ effect.icon || '\u2728' }}</span>\r
                <span class="effect-name">{{ effect.name }}</span>\r
                @if (effect.defaultDuration) {\r
                  <span class="effect-duration">{{ effect.defaultDuration }} Runden</span>\r
                }\r
              </div>\r
              @if (effect.description) {\r
                <p class="effect-description">{{ effect.description }}</p>\r
              }\r
              @if (!readonly) {\r
                <div class="effect-actions">\r
                  <button class="edit-btn" (click)="openStatusEffectEditor.emit(getOriginalIndex(effect, 'status-effects'))"><span class="app-icon i-draw"></span></button>\r
                  <button class="delete-btn" (click)="removeStatusEffect.emit(getOriginalIndex(effect, 'status-effects'))"><span class="app-icon i-restore-trash"></span></button>\r
                </div>\r
              }\r
            </div>\r
          </div>\r
        }\r
        @if (filteredStatusEffects.length === 0) {\r
          <p class="empty-hint">Keine Statuseffekte gefunden.</p>\r
        }\r
        @if (!readonly) {\r
          <button class="add-button" (click)="addStatusEffect.emit()">+ Statuseffekt hinzuf\xFCgen</button>\r
        }\r
      </div>\r
    }\r
\r
    <!-- Shops Tab -->\r
    @if (activeTab === 'shops') {\r
      <div class="library-list">\r
        @for (shop of filteredShops; track $index) {\r
          <div class="shop-card"\r
               [class.draggable]="true"\r
               [attr.draggable]="true"\r
               (dragstart)="onDragStart($event, 'shop', $index)">\r
            <div class="shop-header">\r
              <span class="shop-icon">\u{1F3EA}</span>\r
              <span class="shop-name">{{ shop.name }}</span>\r
            </div>\r
            @if (shop.description) {\r
              <p class="shop-description">{{ shop.description }}</p>\r
            }\r
            <div class="deals-summary">\r
              <strong>{{ shop.deals?.length || 0 }} Angebote</strong>\r
              @if (shop.deals && shop.deals.length > 0) {\r
                <div class="deals-preview">\r
                  @for (deal of shop.deals.slice(0, 3); track deal.id) {\r
                    <div class="deal-preview-item" [class.reverse]="deal.isReverseDeal">\r
                      <span class="deal-name">{{ deal.name }}</span>\r
                      @if (deal.isReverseDeal) {\r
                        <span class="reverse-badge">\u2B05 Ankauf</span>\r
                      } @else if (deal.price) {\r
                        <span class="deal-price">{{ formatCurrency(deal.price) }}</span>\r
                      } @else if (deal.isNegotiable) {\r
                        <span class="negotiable">\u{1F4AC}</span>\r
                      }\r
                    </div>\r
                  }\r
                  @if (shop.deals.length > 3) {\r
                    <span class="more-items">+{{ shop.deals.length - 3 }} weitere</span>\r
                  }\r
                </div>\r
              }\r
            </div>\r
          </div>\r
        }\r
        @if (filteredShops.length === 0) {\r
          <p class="empty-hint">Keine Shops in verkn\xFCpften Bibliotheken.</p>\r
        }\r
      </div>\r
    }\r
\r
    <!-- Loot Bundles Tab -->\r
    @if (activeTab === 'loot-bundles') {\r
      <div class="library-list">\r
        @for (bundle of filteredBundles; track $index) {\r
          <div class="bundle-card"\r
               [class.draggable]="true"\r
               [attr.draggable]="true"\r
               (dragstart)="onDragStart($event, 'loot-bundle', $index)">\r
            <div class="bundle-header">\r
              <span class="bundle-icon">\u{1F4B0}</span>\r
              <span class="bundle-name">{{ bundle.name }}</span>\r
            </div>\r
            @if (bundle.description) {\r
              <p class="bundle-description">{{ bundle.description }}</p>\r
            }\r
            <div class="loot-summary">\r
              <strong>{{ bundle.items?.length || 0 }} Gegenst\xE4nde</strong>\r
              @if (bundle.items && bundle.items.length > 0) {\r
                <div class="loot-preview">\r
                  @for (item of bundle.items.slice(0, 3); track item.id) {\r
                    <div class="loot-preview-item">\r
                      <span class="loot-type app-icon {{ getLootTypeIcon(item.type) }}"></span>\r
                      <span class="loot-name">{{ getLootItemName(item) }}</span>\r
                    </div>\r
                  }\r
                  @if (bundle.items.length > 3) {\r
                    <span class="more-items">+{{ bundle.items.length - 3 }} weitere</span>\r
                  }\r
                </div>\r
              }\r
            </div>\r
          </div>\r
        }\r
        @if (filteredBundles.length === 0) {\r
          <p class="empty-hint">Keine Beutepakete in verkn\xFCpften Bibliotheken.</p>\r
        }\r
      </div>\r
    }\r
\r
    <!-- Knowledge Tab -->\r
    @if (activeTab === 'knowledge') {\r
      <div class="knowledge-sub-tabs">\r
        <button class="sub-tab-btn" [class.active]="activeKnowledgeTab === 'rune'" (click)="setActiveKnowledgeTab('rune')">\r
          <span class="app-icon i-spell"></span> Runen ({{ filteredRunes.length }})\r
        </button>\r
        <button class="sub-tab-btn" [class.active]="activeKnowledgeTab === 'material'" (click)="setActiveKnowledgeTab('material')">\r
          \u{1FAA8} Materialien ({{ filteredMaterials.length }})\r
        </button>\r
        <button class="sub-tab-btn" [class.active]="activeKnowledgeTab === 'forge-trait'" (click)="setActiveKnowledgeTab('forge-trait')">\r
          \u{1F528} Schmiede-Traits ({{ filteredForgeTraits.length }})\r
        </button>\r
      </div>\r
\r
      <!-- Rune filter inside knowledge -->\r
      @if (activeKnowledgeTab === 'rune' && getUniqueRuneTags().length > 0) {\r
        <div class="knowledge-filter-row">\r
          <select class="tab-filter" [(ngModel)]="runeTagFilter" (ngModelChange)="onRuneTagFilterChange()">\r
            <option value="">Alle Tags</option>\r
            @for (tag of getUniqueRuneTags(); track tag) {\r
              <option [value]="tag">{{ tag }}</option>\r
            }\r
          </select>\r
        </div>\r
      }\r
\r
      @if (activeKnowledgeTab === 'rune') {\r
        <div class="library-list rune-list">\r
          @for (rune of filteredRunes; track getOriginalIndex(rune, 'runes')) {\r
            <div class="rune-compact-card"\r
                 [style.border-left-color]="rune.glowColor || '#8b5cf6'"\r
                 draggable="true"\r
                 (dragstart)="onDragStart($event, 'rune', getOriginalIndex(rune, 'runes'))"\r
                 (contextmenu)="onContextMenu($event, 'rune', getOriginalIndex(rune, 'runes'))">\r
              <div class="rune-card-body">\r
                @if (rune.drawing) {\r
                  <img class="rune-drawing-thumb" [src]="rune.drawing | imageUrl" alt="{{ rune.name }}" />\r
                } @else {\r
                  <div class="rune-drawing-placeholder">\r
                    <span class="rune-dot" [style.background]="rune.glowColor || '#8b5cf6'"></span>\r
                  </div>\r
                }\r
                <div class="rune-card-info">\r
                  <div class="rune-compact-header">\r
                    <span class="rune-compact-name">{{ rune.name }}</span>\r
                    <span class="rune-compact-type">{{ getRuneTypeLabel(rune.runeType) }}</span>\r
                    <div class="rune-compact-costs">\r
                      @if (rune.mana) { <span class="cost-badge mana">{{ rune.mana }} M</span> }\r
                      @if (rune.fokus) { <span class="cost-badge fokus">{{ rune.fokus }} F</span> }\r
                    </div>\r
                  </div>\r
                  @if (rune.tags?.length) {\r
                    <div class="rune-tags-row">\r
                      @for (tag of rune.tags; track tag) {\r
                        <span class="rune-tag">{{ tag }}</span>\r
                      }\r
                    </div>\r
                  }\r
                  @if (rune.description) {\r
                    <p class="rune-compact-desc">{{ rune.description }}</p>\r
                  }\r
                </div>\r
              </div>\r
              @if (!readonly) {\r
                <button class="edit-btn-sm" (click)="openRuneEditor.emit(getOriginalIndex(rune, 'runes'))"><span class="app-icon i-draw"></span></button>\r
              }\r
            </div>\r
          }\r
          @if (filteredRunes.length === 0) {\r
            <p class="empty-hint">Keine Runen gefunden.</p>\r
          }\r
        </div>\r
      }\r
\r
      @if (activeKnowledgeTab === 'material') {\r
        <div class="library-list">\r
          @for (mat of filteredMaterials; track mat.id) {\r
            <div class="knowledge-card">\r
              <div class="knowledge-card-header">\r
                @if (mat.icon) { <span class="knowledge-icon">{{ mat.icon }}</span> }\r
                <span class="knowledge-name">{{ mat.name }}</span>\r
                @if (mat.rarity) {\r
                  <span class="rarity-badge rarity-{{ mat.rarity | lowercase }}">{{ getRarityLabel(mat.rarity) }}</span>\r
                }\r
                <span class="knowledge-category">{{ getMaterialCategoryLabel(mat) }}</span>\r
              </div>\r
              @if (mat.description) {\r
                <p class="knowledge-desc">{{ mat.description }}</p>\r
              }\r
              @if (mat.weaponStats) {\r
                <div class="knowledge-stats">\r
                  <span class="stat-chip">HB {{ mat.weaponStats.haltbarkeit }}</span>\r
                  <span class="stat-chip">EFF {{ mat.weaponStats.effektivitaet }}</span>\r
                  @if (mat.weaponStats.extraEffect) {\r
                    <span class="stat-chip effect">{{ mat.weaponStats.extraEffect }}</span>\r
                  }\r
                </div>\r
              }\r
              @if (mat.isPublic) {\r
                <span class="public-badge">\xD6ffentlich</span>\r
              }\r
            </div>\r
          }\r
          @if (filteredMaterials.length === 0) {\r
            <p class="empty-hint">Keine Materialien gefunden. Erstelle Materialien in den Bibliotheken.</p>\r
          }\r
        </div>\r
      }\r
\r
      @if (activeKnowledgeTab === 'forge-trait') {\r
        <div class="library-list">\r
          @for (trait of filteredForgeTraits; track trait.id) {\r
            <div class="knowledge-card">\r
              <div class="knowledge-card-header">\r
                <span class="knowledge-name">{{ trait.name }}</span>\r
                <span class="knowledge-cost">{{ trait.schmiedepunktKosten }} SP</span>\r
                @if (trait.scalable) {\r
                  <span class="scalable-badge">bis Lv.{{ trait.maxLevel }}</span>\r
                }\r
              </div>\r
              <p class="knowledge-effect">{{ trait.effect }}</p>\r
              @if (trait.description) {\r
                <p class="knowledge-desc">{{ trait.description }}</p>\r
              }\r
              @if (trait.isPublic) {\r
                <span class="public-badge">\xD6ffentlich</span>\r
              }\r
            </div>\r
          }\r
          @if (filteredForgeTraits.length === 0) {\r
            <p class="empty-hint">Keine Schmiede-Traits gefunden. Erstelle Traits in den Bibliotheken.</p>\r
          }\r
        </div>\r
      }\r
    }\r
  </div>\r
</div>\r
`, styles: ["/* src/app/world/asset-browser/asset-browser.component.css */\n.asset-browser-container {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  overflow: hidden;\n}\n.tabs-header {\n  display: flex;\n  flex-wrap: wrap;\n  background: var(--bg);\n  border-bottom: 2px solid var(--border);\n}\n.tab-button {\n  flex: 1;\n  padding: 0.5rem 0.6rem;\n  background: transparent;\n  border: none;\n  border-bottom: 3px solid transparent;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 12px;\n  color: var(--muted);\n  transition: all 0.2s;\n  white-space: nowrap;\n}\n.tab-button:hover {\n  background: rgba(107, 70, 193, 0.05);\n  color: var(--accent);\n}\n.tab-button.active {\n  color: var(--accent);\n  border-bottom-color: var(--accent);\n  background: var(--card);\n}\n.search-container {\n  padding: 0.6rem 1rem;\n  background: var(--card);\n  border-bottom: 1px solid var(--border);\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.search-input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.5rem 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  color: var(--text);\n  font-size: 14px;\n  transition: border-color 0.2s;\n}\n.search-input:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.search-input::placeholder {\n  color: var(--muted);\n}\n.tab-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1rem;\n}\n.library-list {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.library-item-wrapper {\n  cursor: grab;\n  transition: opacity 0.2s;\n}\n.library-item-wrapper[draggable=true]:active {\n  cursor: grabbing;\n}\n.library-item-wrapper[draggable=false] {\n  cursor: default;\n}\n.add-button {\n  padding: 0.75rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 14px;\n  transition: background 0.2s;\n  margin-top: 0.5rem;\n}\n.add-button:hover {\n  background: var(--accentdark);\n}\n.tab-content::-webkit-scrollbar {\n  width: 8px;\n}\n.tab-content::-webkit-scrollbar-track {\n  background: var(--bg);\n}\n.tab-content::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 4px;\n}\n.tab-content::-webkit-scrollbar-thumb:hover {\n  background: var(--muted);\n}\n.status-effect-card {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 12px;\n}\n.effect-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.effect-icon {\n  font-size: 20px;\n}\n.effect-name {\n  flex: 1;\n  font-weight: 600;\n  color: var(--text);\n}\n.effect-duration {\n  font-size: 12px;\n  color: var(--muted);\n  background: rgba(107, 70, 193, 0.2);\n  padding: 2px 8px;\n  border-radius: 12px;\n}\n.effect-description {\n  margin: 8px 0;\n  font-size: 13px;\n  color: var(--muted);\n  line-height: 1.4;\n}\n.effect-actions {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n}\n.effect-actions button {\n  padding: 4px 8px;\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  transition: background 0.2s;\n}\n.effect-actions button:hover {\n  background: rgba(255, 255, 255, 0.1);\n}\n.effect-actions .delete-btn:hover {\n  background: rgba(255, 100, 100, 0.2);\n}\n.shop-card,\n.bundle-card {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 16px;\n  margin-bottom: 12px;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.shop-card[draggable=true],\n.bundle-card[draggable=true] {\n  cursor: grab;\n}\n.shop-card[draggable=true]:active,\n.bundle-card[draggable=true]:active {\n  cursor: grabbing;\n}\n.shop-card:hover,\n.bundle-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\n.shop-header,\n.bundle-header {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-bottom: 8px;\n}\n.shop-icon,\n.bundle-icon {\n  font-size: 24px;\n}\n.shop-name,\n.bundle-name {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--text);\n}\n.shop-description,\n.bundle-description {\n  margin: 8px 0;\n  font-size: 13px;\n  color: var(--muted);\n  line-height: 1.4;\n}\n.deals-summary,\n.loot-summary {\n  margin-top: 12px;\n  padding-top: 12px;\n  border-top: 1px solid var(--border);\n}\n.deals-summary strong,\n.loot-summary strong {\n  display: block;\n  margin-bottom: 8px;\n  color: var(--accent);\n  font-size: 14px;\n}\n.deals-preview,\n.loot-preview {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n.deal-preview-item,\n.loot-preview-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 8px;\n  background: rgba(255, 255, 255, 0.03);\n  border-radius: 4px;\n  font-size: 13px;\n}\n.deal-preview-item.reverse {\n  background: rgba(100, 150, 255, 0.1);\n  border-left: 3px solid #6496ff;\n}\n.deal-name,\n.loot-name {\n  flex: 1;\n  color: var(--text);\n}\n.deal-price {\n  color: var(--accent);\n  font-weight: 600;\n  font-size: 12px;\n}\n.reverse-badge {\n  color: #6496ff;\n  font-size: 11px;\n  font-weight: 600;\n}\n.negotiable {\n  color: var(--muted);\n  font-size: 12px;\n}\n.loot-type {\n  font-size: 16px;\n}\n.more-items {\n  color: var(--muted);\n  font-size: 12px;\n  font-style: italic;\n  padding: 4px 8px;\n}\n.tab-filter {\n  background: var(--bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 4px 8px;\n  font-size: 12px;\n  margin-left: 6px;\n  flex-shrink: 0;\n}\n.rune-compact-card {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-left: 3px solid #8b5cf6;\n  border-radius: 8px;\n  padding: 6px 8px;\n  position: relative;\n}\n.rune-card-body {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n}\n.rune-drawing-thumb {\n  width: 48px;\n  height: 48px;\n  object-fit: contain;\n  border-radius: 4px;\n  background: rgba(0, 0, 0, 0.3);\n  flex-shrink: 0;\n}\n.rune-drawing-placeholder {\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n.rune-card-info {\n  flex: 1;\n  min-width: 0;\n}\n.knowledge-filter-row {\n  padding: 4px 8px 0;\n  display: flex;\n  gap: 6px;\n}\n.rune-list {\n  gap: 4px;\n}\n.rune-compact-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.rune-dot {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.rune-compact-name {\n  font-weight: 600;\n  font-size: 13px;\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.rune-compact-type {\n  font-size: 10px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  padding: 1px 5px;\n  color: var(--muted);\n  white-space: nowrap;\n  flex-shrink: 0;\n}\n.rune-compact-costs {\n  display: flex;\n  gap: 4px;\n  flex-shrink: 0;\n}\n.cost-badge {\n  font-size: 10px;\n  border-radius: 4px;\n  padding: 1px 5px;\n  font-weight: 600;\n}\n.cost-badge.mana {\n  background: rgba(99, 102, 241, 0.2);\n  color: #818cf8;\n  border: 1px solid rgba(99, 102, 241, 0.3);\n}\n.cost-badge.fokus {\n  background: rgba(234, 179, 8, 0.2);\n  color: #fbbf24;\n  border: 1px solid rgba(234, 179, 8, 0.3);\n}\n.rune-tags-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 5px;\n}\n.rune-tag {\n  font-size: 10px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 3px;\n  padding: 1px 5px;\n  color: var(--muted);\n}\n.rune-compact-desc {\n  font-size: 11px;\n  color: var(--muted);\n  margin: 4px 0 0 0;\n  line-height: 1.4;\n}\n.edit-btn-sm {\n  position: absolute;\n  top: 6px;\n  right: 6px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 4px;\n  opacity: 0.5;\n  transition: opacity 0.15s;\n}\n.edit-btn-sm:hover {\n  opacity: 1;\n  background: var(--card);\n}\n.knowledge-sub-tabs {\n  display: flex;\n  gap: 6px;\n  padding: 8px 12px 0;\n}\n.sub-tab-btn {\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  color: var(--muted);\n  font-size: 12px;\n  padding: 4px 10px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.sub-tab-btn.active {\n  background: var(--accent);\n  color: #fff;\n  border-color: var(--accent);\n}\n.knowledge-card {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 10px 12px;\n  margin-bottom: 6px;\n}\n.knowledge-card-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin-bottom: 4px;\n}\n.knowledge-icon {\n  font-size: 16px;\n}\n.knowledge-name {\n  font-weight: 600;\n  font-size: 13px;\n  flex: 1;\n}\n.knowledge-category {\n  font-size: 11px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  padding: 1px 6px;\n  color: var(--muted);\n}\n.knowledge-cost {\n  font-size: 12px;\n  font-weight: 700;\n  color: var(--accent);\n  background: rgba(var(--accent-rgb, 139, 92, 246), 0.12);\n  border-radius: 4px;\n  padding: 1px 6px;\n}\n.knowledge-effect {\n  font-size: 12px;\n  color: var(--text);\n  margin: 0 0 4px 0;\n}\n.knowledge-desc {\n  font-size: 11px;\n  color: var(--muted);\n  margin: 0;\n  line-height: 1.4;\n}\n.knowledge-stats {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 6px;\n}\n.stat-chip {\n  font-size: 11px;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  padding: 2px 7px;\n  color: var(--text);\n}\n.stat-chip.effect {\n  color: var(--accent);\n  border-color: var(--accent);\n  background: rgba(var(--accent-rgb, 139, 92, 246), 0.08);\n}\n.rarity-badge {\n  font-size: 10px;\n  border-radius: 4px;\n  padding: 1px 5px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.rarity-badge.rarity-common {\n  background: rgba(156, 163, 175, 0.2);\n  color: #9ca3af;\n  border: 1px solid rgba(156, 163, 175, 0.3);\n}\n.rarity-badge.rarity-rare {\n  background: rgba(99, 102, 241, 0.2);\n  color: #818cf8;\n  border: 1px solid rgba(99, 102, 241, 0.3);\n}\n.rarity-badge.rarity-legendary {\n  background: rgba(245, 158, 11, 0.2);\n  color: #f59e0b;\n  border: 1px solid rgba(245, 158, 11, 0.3);\n}\n.scalable-badge {\n  font-size: 11px;\n  background: rgba(16, 185, 129, 0.15);\n  color: #10b981;\n  border: 1px solid rgba(16, 185, 129, 0.3);\n  border-radius: 4px;\n  padding: 1px 5px;\n}\n.public-badge {\n  font-size: 10px;\n  background: rgba(99, 102, 241, 0.1);\n  color: var(--muted);\n  border-radius: 4px;\n  padding: 1px 5px;\n  display: inline-block;\n  margin-top: 4px;\n}\n/*# sourceMappingURL=asset-browser.component.css.map */\n"] }]
  }], null, { items: [{
    type: Input,
    args: [{ required: true }]
  }], runes: [{
    type: Input,
    args: [{ required: true }]
  }], spells: [{
    type: Input,
    args: [{ required: true }]
  }], skills: [{
    type: Input,
    args: [{ required: true }]
  }], statusEffects: [{
    type: Input
  }], shops: [{
    type: Input
  }], lootBundles: [{
    type: Input
  }], materials: [{
    type: Input
  }], forgeTraits: [{
    type: Input
  }], dummySheet: [{
    type: Input,
    args: [{ required: true }]
  }], editingItems: [{
    type: Input,
    args: [{ required: true }]
  }], editingRunes: [{
    type: Input,
    args: [{ required: true }]
  }], editingSpells: [{
    type: Input,
    args: [{ required: true }]
  }], editingSkills: [{
    type: Input,
    args: [{ required: true }]
  }], editingStatusEffects: [{
    type: Input
  }], readonly: [{
    type: Input
  }], addItem: [{
    type: Output
  }], addRune: [{
    type: Output
  }], addSpell: [{
    type: Output
  }], addSkill: [{
    type: Output
  }], addStatusEffect: [{
    type: Output
  }], openItemEditor: [{
    type: Output
  }], openRuneEditor: [{
    type: Output
  }], openSpellEditor: [{
    type: Output
  }], openSkillEditor: [{
    type: Output
  }], openStatusEffectEditor: [{
    type: Output
  }], updateItem: [{
    type: Output
  }], updateRune: [{
    type: Output
  }], updateSpell: [{
    type: Output
  }], updateSkill: [{
    type: Output
  }], updateStatusEffect: [{
    type: Output
  }], removeItem: [{
    type: Output
  }], removeRune: [{
    type: Output
  }], removeSpell: [{
    type: Output
  }], removeSkill: [{
    type: Output
  }], removeStatusEffect: [{
    type: Output
  }], itemEditingChange: [{
    type: Output
  }], runeEditingChange: [{
    type: Output
  }], spellEditingChange: [{
    type: Output
  }], skillEditingChange: [{
    type: Output
  }], statusEffectEditingChange: [{
    type: Output
  }], dragStart: [{
    type: Output
  }], contextMenuRequest: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AssetBrowserComponent, { className: "AssetBrowserComponent", filePath: "app/world/asset-browser/asset-browser.component.ts", lineNumber: 32 });
})();

// src/app/shared/library-selector/library-selector.component.ts
var _forTrack02 = ($index, $item) => $item.id;
function LibrarySelectorComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 10)(1, "input", 20, 0);
    \u0275\u0275twoWayListener("ngModelChange", function LibrarySelectorComponent_Conditional_14_Template_input_ngModelChange_1_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newLibraryName, $event) || (ctx_r1.newLibraryName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keyup.enter", function LibrarySelectorComponent_Conditional_14_Template_input_keyup_enter_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.createNewLibrary());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 21);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_14_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.createNewLibrary());
    });
    \u0275\u0275text(4, " Create ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 19);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_14_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      ctx_r1.showCreateDialog = false;
      return \u0275\u0275resetView(ctx_r1.newLibraryName = "");
    });
    \u0275\u0275text(6, " Cancel ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newLibraryName);
    \u0275\u0275advance(2);
    \u0275\u0275property("disabled", !ctx_r1.newLibraryName.trim());
  }
}
function LibrarySelectorComponent_Conditional_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 22);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_20_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.removeAll());
    });
    \u0275\u0275text(1, "Remove All");
    \u0275\u0275elementEnd();
  }
}
function LibrarySelectorComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1, "No libraries linked. Add some from below!");
    \u0275\u0275elementEnd();
  }
}
function LibrarySelectorComponent_Conditional_23_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 23)(1, "div", 24)(2, "div", 25);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 26);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 27)(7, "button", 28);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_23_For_1_Template_button_click_7_listener() {
      const library_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.editLibrary(library_r5.id));
    });
    \u0275\u0275text(8, " \u270F\uFE0F ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 29);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_23_For_1_Template_button_click_9_listener() {
      const library_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.remove(library_r5.id));
    });
    \u0275\u0275text(10, " \u2796 ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const library_r5 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(library_r5.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate4(" ", library_r5.items.length, "i \xB7 ", library_r5.spells.length, "s \xB7 ", library_r5.runes.length, "r \xB7 ", library_r5.skills.length, "sk ");
  }
}
function LibrarySelectorComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibrarySelectorComponent_Conditional_23_For_1_Template, 11, 5, "div", 23, _forTrack02);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r1.linkedLibraries());
  }
}
function LibrarySelectorComponent_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1, "Loading...");
    \u0275\u0275elementEnd();
  }
}
function LibrarySelectorComponent_Conditional_30_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " No libraries match your search. ");
  }
}
function LibrarySelectorComponent_Conditional_30_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " All libraries are linked! ");
  }
}
function LibrarySelectorComponent_Conditional_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275conditionalCreate(1, LibrarySelectorComponent_Conditional_30_Conditional_1_Template, 1, 0)(2, LibrarySelectorComponent_Conditional_30_Conditional_2_Template, 1, 0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.searchQuery ? 1 : 2);
  }
}
function LibrarySelectorComponent_Conditional_31_For_1_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 31);
    \u0275\u0275text(1, "\u{1F310}");
    \u0275\u0275elementEnd();
  }
}
function LibrarySelectorComponent_Conditional_31_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "div", 24)(2, "div", 25);
    \u0275\u0275text(3);
    \u0275\u0275conditionalCreate(4, LibrarySelectorComponent_Conditional_31_For_1_Conditional_4_Template, 2, 0, "span", 31);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 26);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 27)(8, "button", 28);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_31_For_1_Template_button_click_8_listener() {
      const library_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.editLibrary(library_r7.id));
    });
    \u0275\u0275text(9, " \u270F\uFE0F ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 32);
    \u0275\u0275listener("click", function LibrarySelectorComponent_Conditional_31_For_1_Template_button_click_10_listener() {
      const library_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.add(library_r7.id));
    });
    \u0275\u0275text(11, " \u2795 ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const library_r7 = ctx.$implicit;
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", library_r7.name, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(library_r7.isPublic ? 4 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate4(" ", library_r7.items.length, "i \xB7 ", library_r7.spells.length, "s \xB7 ", library_r7.runes.length, "r \xB7 ", library_r7.skills.length, "sk ");
  }
}
function LibrarySelectorComponent_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibrarySelectorComponent_Conditional_31_For_1_Template, 12, 6, "div", 30, _forTrack02);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r1.availableLibraries());
  }
}
var LibrarySelectorComponent = class _LibrarySelectorComponent {
  close = new EventEmitter();
  librariesChanged = new EventEmitter();
  libraryStore = inject(LibraryStoreService);
  router = inject(Router);
  selectedLibraryIds = signal(/* @__PURE__ */ new Set(), ...ngDevMode ? [{ debugName: "selectedLibraryIds" }] : []);
  allLibraries = signal([], ...ngDevMode ? [{ debugName: "allLibraries" }] : []);
  searchQuery = "";
  showCreateDialog = false;
  newLibraryName = "";
  // Filter libraries based on search and linked status
  linkedLibraries = computed(() => {
    const all = this.allLibraries();
    const selected = this.selectedLibraryIds();
    const query = this.searchQuery.toLowerCase();
    return all.filter((lib) => selected.has(lib.id)).filter((lib) => !query || lib.name.toLowerCase().includes(query));
  }, ...ngDevMode ? [{ debugName: "linkedLibraries" }] : []);
  availableLibraries = computed(() => {
    const all = this.allLibraries();
    const selected = this.selectedLibraryIds();
    const query = this.searchQuery.toLowerCase();
    return all.filter((lib) => !selected.has(lib.id)).filter((lib) => !query || lib.name.toLowerCase().includes(query));
  }, ...ngDevMode ? [{ debugName: "availableLibraries" }] : []);
  ngOnInit() {
    this.libraryStore.loadAllLibraries();
    this.libraryStore.allLibraries$.subscribe((libs) => {
      this.allLibraries.set(libs);
    });
  }
  setSelectedLibraries(libraryIds) {
    this.selectedLibraryIds.set(new Set(libraryIds));
  }
  add(libraryId) {
    const selected = new Set(this.selectedLibraryIds());
    selected.add(libraryId);
    this.selectedLibraryIds.set(selected);
    this.emitChanges();
  }
  remove(libraryId) {
    const selected = new Set(this.selectedLibraryIds());
    selected.delete(libraryId);
    this.selectedLibraryIds.set(selected);
    this.emitChanges();
  }
  addAll() {
    const selected = new Set(this.selectedLibraryIds());
    this.availableLibraries().forEach((lib) => selected.add(lib.id));
    this.selectedLibraryIds.set(selected);
    this.emitChanges();
  }
  removeAll() {
    this.selectedLibraryIds.set(/* @__PURE__ */ new Set());
    this.emitChanges();
  }
  async createNewLibrary() {
    const name = this.newLibraryName.trim();
    if (!name)
      return;
    try {
      const library = await this.libraryStore.createLibrary(name);
      this.newLibraryName = "";
      this.showCreateDialog = false;
      const selected = new Set(this.selectedLibraryIds());
      selected.add(library.id);
      this.selectedLibraryIds.set(selected);
      this.emitChanges();
    } catch (error) {
      console.error("Failed to create library:", error);
    }
  }
  editLibrary(libraryId) {
    this.router.navigate(["/library", libraryId]);
    this.closeModal();
  }
  emitChanges() {
    const selected = Array.from(this.selectedLibraryIds());
    this.librariesChanged.emit(selected);
  }
  closeModal() {
    this.close.emit();
  }
  static \u0275fac = function LibrarySelectorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LibrarySelectorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LibrarySelectorComponent, selectors: [["app-library-selector"]], outputs: { close: "close", librariesChanged: "librariesChanged" }, decls: 35, vars: 8, consts: [["newLibInput", ""], [1, "modal-overlay", 3, "click"], [1, "modal-content", 3, "click"], [1, "modal-header"], [1, "close-btn", 3, "click"], [1, "modal-body"], [1, "toolbar"], ["type", "text", "placeholder", "\u{1F50D} Search libraries...", 1, "search-input", 3, "ngModelChange", "ngModel"], [1, "action-btn", "add-all-btn", 3, "click", "disabled"], [1, "action-btn", "create-btn", 3, "click"], [1, "create-dialog"], [1, "content-wrapper"], [1, "section"], [1, "section-header"], [1, "text-btn"], [1, "library-list"], [1, "empty-message"], [1, "loading"], [1, "modal-footer"], [1, "btn-secondary", 3, "click"], ["type", "text", "placeholder", "Library name...", 3, "ngModelChange", "keyup.enter", "ngModel"], [1, "btn-primary", 3, "click", "disabled"], [1, "text-btn", 3, "click"], [1, "library-item", "linked"], [1, "library-details"], [1, "library-name"], [1, "library-stats"], [1, "library-buttons"], ["title", "Edit Library", 1, "icon-btn", "edit-btn", 3, "click"], ["title", "Unlink Library", 1, "icon-btn", "remove-btn", 3, "click"], [1, "library-item", "available"], [1, "badge"], ["title", "Link Library", 1, "icon-btn", "add-btn", 3, "click"]], template: function LibrarySelectorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 1);
      \u0275\u0275listener("click", function LibrarySelectorComponent_Template_div_click_0_listener() {
        return ctx.closeModal();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(1, "div", 2);
      \u0275\u0275listener("click", function LibrarySelectorComponent_Template_div_click_1_listener($event) {
        return $event.stopPropagation();
      });
      \u0275\u0275elementStart(2, "div", 3)(3, "h2");
      \u0275\u0275text(4, "\u{1F4DA} Library Manager");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "button", 4);
      \u0275\u0275listener("click", function LibrarySelectorComponent_Template_button_click_5_listener() {
        return ctx.closeModal();
      });
      \u0275\u0275text(6, "\xD7");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "div", 5)(8, "div", 6)(9, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function LibrarySelectorComponent_Template_input_ngModelChange_9_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.searchQuery, $event) || (ctx.searchQuery = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(10, "button", 8);
      \u0275\u0275listener("click", function LibrarySelectorComponent_Template_button_click_10_listener() {
        return ctx.addAll();
      });
      \u0275\u0275text(11, " \u2795 Add All ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "button", 9);
      \u0275\u0275listener("click", function LibrarySelectorComponent_Template_button_click_12_listener() {
        return ctx.showCreateDialog = true;
      });
      \u0275\u0275text(13, " \u2728 New Library ");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(14, LibrarySelectorComponent_Conditional_14_Template, 7, 2, "div", 10);
      \u0275\u0275elementStart(15, "div", 11)(16, "div", 12)(17, "div", 13)(18, "h3");
      \u0275\u0275text(19);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(20, LibrarySelectorComponent_Conditional_20_Template, 2, 0, "button", 14);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "div", 15);
      \u0275\u0275conditionalCreate(22, LibrarySelectorComponent_Conditional_22_Template, 2, 0, "div", 16)(23, LibrarySelectorComponent_Conditional_23_Template, 2, 0);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(24, "div", 12)(25, "div", 13)(26, "h3");
      \u0275\u0275text(27);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(28, "div", 15);
      \u0275\u0275conditionalCreate(29, LibrarySelectorComponent_Conditional_29_Template, 2, 0, "div", 17)(30, LibrarySelectorComponent_Conditional_30_Template, 3, 1, "div", 16)(31, LibrarySelectorComponent_Conditional_31_Template, 2, 0);
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(32, "div", 18)(33, "button", 19);
      \u0275\u0275listener("click", function LibrarySelectorComponent_Template_button_click_33_listener() {
        return ctx.closeModal();
      });
      \u0275\u0275text(34, "Close");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.searchQuery);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", ctx.availableLibraries().length === 0);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.showCreateDialog ? 14 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("\u2705 Linked Libraries (", ctx.linkedLibraries().length, ")");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.linkedLibraries().length > 0 ? 20 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.linkedLibraries().length === 0 ? 22 : 23);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("\u{1F4E6} Available Libraries (", ctx.availableLibraries().length, ")");
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.libraryStore.isLoading() ? 29 : ctx.availableLibraries().length === 0 ? 30 : 31);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NgControlStatus, NgModel], styles: ["\n\n.modal-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.7);\n  z-index: 1000;\n}\n.modal-content[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background: var(--card);\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  width: 90%;\n  max-width: 700px;\n  max-height: 85vh;\n  display: flex;\n  flex-direction: column;\n  z-index: 1001;\n  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);\n}\n.modal-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.5rem;\n  border-bottom: 1px solid var(--border);\n}\n.modal-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1.25rem;\n  color: var(--text);\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--text);\n  font-size: 1.5rem;\n  cursor: pointer;\n  padding: 0;\n  width: 28px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  transition: background 0.2s;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent);\n}\n.modal-body[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n.search-input[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.5rem 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.9rem;\n}\n.action-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n  white-space: nowrap;\n}\n.add-all-btn[_ngcontent-%COMP%] {\n  background: #3b82f6;\n  color: white;\n}\n.add-all-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #2563eb;\n}\n.add-all-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.create-btn[_ngcontent-%COMP%] {\n  background: #22c55e;\n  color: white;\n}\n.create-btn[_ngcontent-%COMP%]:hover {\n  background: #16a34a;\n}\n.create-dialog[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n}\n.create-dialog[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.5rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n}\n.btn-primary[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: #22c55e;\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #16a34a;\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn-secondary[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-secondary[_ngcontent-%COMP%]:hover {\n  background: var(--accent);\n}\n.content-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  flex: 1;\n  overflow: hidden;\n}\n.section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  min-height: 0;\n}\n.section-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.section-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.95rem;\n  color: var(--text);\n  font-weight: 600;\n}\n.text-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #ef4444;\n  font-size: 0.85rem;\n  cursor: pointer;\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  transition: background 0.2s;\n}\n.text-btn[_ngcontent-%COMP%]:hover {\n  background: #ef444410;\n}\n.library-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  overflow-y: auto;\n  max-height: 250px;\n  padding: 0.25rem;\n}\n.library-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  transition: all 0.2s;\n}\n.library-item.linked[_ngcontent-%COMP%] {\n  border-left: 3px solid #3b82f6;\n}\n.library-item[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent);\n  background: var(--card);\n}\n.library-details[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.library-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--text);\n  font-size: 0.95rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-bottom: 0.25rem;\n}\n.badge[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n}\n.library-stats[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: #94a3b8;\n}\n.library-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.25rem;\n}\n.icon-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  padding: 0;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  background: var(--card);\n  cursor: pointer;\n  font-size: 1rem;\n  transition: all 0.2s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.icon-btn[_ngcontent-%COMP%]:hover {\n  transform: scale(1.1);\n}\n.add-btn[_ngcontent-%COMP%] {\n  color: #22c55e;\n  border-color: #22c55e;\n}\n.add-btn[_ngcontent-%COMP%]:hover {\n  background: #22c55e20;\n}\n.remove-btn[_ngcontent-%COMP%] {\n  color: #ef4444;\n  border-color: #ef4444;\n}\n.remove-btn[_ngcontent-%COMP%]:hover {\n  background: #ef444420;\n}\n.edit-btn[_ngcontent-%COMP%] {\n  color: #f59e0b;\n  border-color: #f59e0b;\n}\n.edit-btn[_ngcontent-%COMP%]:hover {\n  background: #f59e0b20;\n}\n.empty-message[_ngcontent-%COMP%], \n.loading[_ngcontent-%COMP%] {\n  padding: 2rem;\n  text-align: center;\n  color: #94a3b8;\n  font-size: 0.9rem;\n}\n.modal-footer[_ngcontent-%COMP%] {\n  padding: 1rem 1.5rem;\n  border-top: 1px solid var(--border);\n  display: flex;\n  justify-content: flex-end;\n}\n/*# sourceMappingURL=library-selector.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LibrarySelectorComponent, [{
    type: Component,
    args: [{ selector: "app-library-selector", standalone: true, imports: [CommonModule, FormsModule], template: `
    <div class="modal-overlay" (click)="closeModal()"></div>
    <div class="modal-content" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h2>\u{1F4DA} Library Manager</h2>
        <button class="close-btn" (click)="closeModal()">\xD7</button>
      </div>

      <div class="modal-body">
        <!-- Search and Actions Bar -->
        <div class="toolbar">
          <input 
            type="text" 
            class="search-input"
            [(ngModel)]="searchQuery" 
            placeholder="\u{1F50D} Search libraries..."
          />
          <button class="action-btn add-all-btn" (click)="addAll()" [disabled]="availableLibraries().length === 0">
            \u2795 Add All
          </button>
          <button class="action-btn create-btn" (click)="showCreateDialog = true">
            \u2728 New Library
          </button>
        </div>

        <!-- Create Dialog -->
        @if (showCreateDialog) {
          <div class="create-dialog">
            <input 
              type="text" 
              [(ngModel)]="newLibraryName" 
              placeholder="Library name..."
              (keyup.enter)="createNewLibrary()"
              #newLibInput
            />
            <button class="btn-primary" (click)="createNewLibrary()" [disabled]="!newLibraryName.trim()">
              Create
            </button>
            <button class="btn-secondary" (click)="showCreateDialog = false; newLibraryName = ''">
              Cancel
            </button>
          </div>
        }

        <div class="content-wrapper">
          <!-- Linked Libraries -->
          <div class="section">
            <div class="section-header">
              <h3>\u2705 Linked Libraries ({{ linkedLibraries().length }})</h3>
              @if (linkedLibraries().length > 0) {
                <button class="text-btn" (click)="removeAll()">Remove All</button>
              }
            </div>
            <div class="library-list">
              @if (linkedLibraries().length === 0) {
                <div class="empty-message">No libraries linked. Add some from below!</div>
              } @else {
                @for (library of linkedLibraries(); track library.id) {
                  <div class="library-item linked">
                    <div class="library-details">
                      <div class="library-name">{{ library.name }}</div>
                      <div class="library-stats">
                        {{ library.items.length }}i \xB7 {{ library.spells.length }}s \xB7 {{ library.runes.length }}r \xB7 {{ library.skills.length }}sk
                      </div>
                    </div>
                    <div class="library-buttons">
                      <button class="icon-btn edit-btn" (click)="editLibrary(library.id)" title="Edit Library">
                        \u270F\uFE0F
                      </button>
                      <button class="icon-btn remove-btn" (click)="remove(library.id)" title="Unlink Library">
                        \u2796
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Available Libraries -->
          <div class="section">
            <div class="section-header">
              <h3>\u{1F4E6} Available Libraries ({{ availableLibraries().length }})</h3>
            </div>
            <div class="library-list">
              @if (libraryStore.isLoading()) {
                <div class="loading">Loading...</div>
              } @else if (availableLibraries().length === 0) {
                <div class="empty-message">
                  @if (searchQuery) {
                    No libraries match your search.
                  } @else {
                    All libraries are linked!
                  }
                </div>
              } @else {
                @for (library of availableLibraries(); track library.id) {
                  <div class="library-item available">
                    <div class="library-details">
                      <div class="library-name">
                        {{ library.name }}
                        @if (library.isPublic) {
                          <span class="badge">\u{1F310}</span>
                        }
                      </div>
                      <div class="library-stats">
                        {{ library.items.length }}i \xB7 {{ library.spells.length }}s \xB7 {{ library.runes.length }}r \xB7 {{ library.skills.length }}sk
                      </div>
                    </div>
                    <div class="library-buttons">
                      <button class="icon-btn edit-btn" (click)="editLibrary(library.id)" title="Edit Library">
                        \u270F\uFE0F
                      </button>
                      <button class="icon-btn add-btn" (click)="add(library.id)" title="Link Library">
                        \u2795
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" (click)="closeModal()">Close</button>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;8faa8b966392a841c98acb97b7599d3ba6daade96b60ed0a3627f552cf155807;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/library-selector/library-selector.component.ts */\n.modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.7);\n  z-index: 1000;\n}\n.modal-content {\n  position: fixed;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background: var(--card);\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  width: 90%;\n  max-width: 700px;\n  max-height: 85vh;\n  display: flex;\n  flex-direction: column;\n  z-index: 1001;\n  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);\n}\n.modal-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.5rem;\n  border-bottom: 1px solid var(--border);\n}\n.modal-header h2 {\n  margin: 0;\n  font-size: 1.25rem;\n  color: var(--text);\n}\n.close-btn {\n  background: none;\n  border: none;\n  color: var(--text);\n  font-size: 1.5rem;\n  cursor: pointer;\n  padding: 0;\n  width: 28px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  transition: background 0.2s;\n}\n.close-btn:hover {\n  background: var(--accent);\n}\n.modal-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.toolbar {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n.search-input {\n  flex: 1;\n  padding: 0.5rem 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.9rem;\n}\n.action-btn {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n  white-space: nowrap;\n}\n.add-all-btn {\n  background: #3b82f6;\n  color: white;\n}\n.add-all-btn:hover:not(:disabled) {\n  background: #2563eb;\n}\n.add-all-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.create-btn {\n  background: #22c55e;\n  color: white;\n}\n.create-btn:hover {\n  background: #16a34a;\n}\n.create-dialog {\n  display: flex;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n}\n.create-dialog input {\n  flex: 1;\n  padding: 0.5rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n}\n.btn-primary {\n  padding: 0.5rem 1rem;\n  background: #22c55e;\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.btn-primary:hover:not(:disabled) {\n  background: #16a34a;\n}\n.btn-primary:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn-secondary {\n  padding: 0.5rem 1rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-secondary:hover {\n  background: var(--accent);\n}\n.content-wrapper {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  flex: 1;\n  overflow: hidden;\n}\n.section {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  min-height: 0;\n}\n.section-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.section-header h3 {\n  margin: 0;\n  font-size: 0.95rem;\n  color: var(--text);\n  font-weight: 600;\n}\n.text-btn {\n  background: none;\n  border: none;\n  color: #ef4444;\n  font-size: 0.85rem;\n  cursor: pointer;\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  transition: background 0.2s;\n}\n.text-btn:hover {\n  background: #ef444410;\n}\n.library-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  overflow-y: auto;\n  max-height: 250px;\n  padding: 0.25rem;\n}\n.library-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  transition: all 0.2s;\n}\n.library-item.linked {\n  border-left: 3px solid #3b82f6;\n}\n.library-item:hover {\n  border-color: var(--accent);\n  background: var(--card);\n}\n.library-details {\n  flex: 1;\n  min-width: 0;\n}\n.library-name {\n  font-weight: 600;\n  color: var(--text);\n  font-size: 0.95rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  margin-bottom: 0.25rem;\n}\n.badge {\n  font-size: 0.7rem;\n}\n.library-stats {\n  font-size: 0.8rem;\n  color: #94a3b8;\n}\n.library-buttons {\n  display: flex;\n  gap: 0.25rem;\n}\n.icon-btn {\n  width: 32px;\n  height: 32px;\n  padding: 0;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  background: var(--card);\n  cursor: pointer;\n  font-size: 1rem;\n  transition: all 0.2s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.icon-btn:hover {\n  transform: scale(1.1);\n}\n.add-btn {\n  color: #22c55e;\n  border-color: #22c55e;\n}\n.add-btn:hover {\n  background: #22c55e20;\n}\n.remove-btn {\n  color: #ef4444;\n  border-color: #ef4444;\n}\n.remove-btn:hover {\n  background: #ef444420;\n}\n.edit-btn {\n  color: #f59e0b;\n  border-color: #f59e0b;\n}\n.edit-btn:hover {\n  background: #f59e0b20;\n}\n.empty-message,\n.loading {\n  padding: 2rem;\n  text-align: center;\n  color: #94a3b8;\n  font-size: 0.9rem;\n}\n.modal-footer {\n  padding: 1rem 1.5rem;\n  border-top: 1px solid var(--border);\n  display: flex;\n  justify-content: flex-end;\n}\n/*# sourceMappingURL=library-selector.component.css.map */\n"] }]
  }], null, { close: [{
    type: Output
  }], librariesChanged: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LibrarySelectorComponent, { className: "LibrarySelectorComponent", filePath: "app/shared/library-selector/library-selector.component.ts", lineNumber: 491 });
})();

// src/app/shared/context-menu/context-menu.component.ts
var _forTrack03 = ($index, $item) => $item.action;
function ContextMenuComponent_Conditional_0_For_3_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElement(0, "div", 2);
  }
}
function ContextMenuComponent_Conditional_0_For_3_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domElementStart(0, "span", 5);
    \u0275\u0275text(1);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const item_r4 = \u0275\u0275nextContext(2).$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r4.icon);
  }
}
function ContextMenuComponent_Conditional_0_For_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "button", 4);
    \u0275\u0275domListener("click", function ContextMenuComponent_Conditional_0_For_3_Conditional_1_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const item_r4 = \u0275\u0275nextContext().$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.onItemClick(item_r4.action));
    });
    \u0275\u0275conditionalCreate(1, ContextMenuComponent_Conditional_0_For_3_Conditional_1_Conditional_1_Template, 2, 1, "span", 5);
    \u0275\u0275domElementStart(2, "span", 6);
    \u0275\u0275text(3);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const item_r4 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275conditional(item_r4.icon ? 1 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r4.label);
  }
}
function ContextMenuComponent_Conditional_0_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, ContextMenuComponent_Conditional_0_For_3_Conditional_0_Template, 1, 0, "div", 2)(1, ContextMenuComponent_Conditional_0_For_3_Conditional_1_Template, 4, 2, "button", 3);
  }
  if (rf & 2) {
    const item_r4 = ctx.$implicit;
    \u0275\u0275conditional(item_r4.divider ? 0 : 1);
  }
}
function ContextMenuComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 0);
    \u0275\u0275domListener("click", function ContextMenuComponent_Conditional_0_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.close());
    });
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(1, "div", 1);
    \u0275\u0275repeaterCreate(2, ContextMenuComponent_Conditional_0_For_3_Template, 2, 1, null, null, _forTrack03);
    \u0275\u0275domElementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275styleProp("left", ctx_r1.position().x, "px")("top", ctx_r1.position().y, "px");
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.items());
  }
}
var ContextMenuComponent = class _ContextMenuComponent {
  isVisible = signal(false, ...ngDevMode ? [{ debugName: "isVisible" }] : []);
  position = signal({ x: 0, y: 0 }, ...ngDevMode ? [{ debugName: "position" }] : []);
  items = signal([], ...ngDevMode ? [{ debugName: "items" }] : []);
  itemSelected = new EventEmitter();
  closed = new EventEmitter();
  show(x, y, menuItems) {
    const menuWidth = 200;
    const menuHeight = menuItems.length * 44;
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    this.position.set({ x, y });
    this.items.set(menuItems);
    this.isVisible.set(true);
  }
  close() {
    this.isVisible.set(false);
    this.closed.emit();
  }
  onItemClick(action) {
    this.itemSelected.emit(action);
    this.close();
  }
  static \u0275fac = function ContextMenuComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ContextMenuComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ContextMenuComponent, selectors: [["app-context-menu"]], outputs: { itemSelected: "itemSelected", closed: "closed" }, decls: 1, vars: 1, consts: [[1, "context-menu-overlay", 3, "click"], [1, "context-menu"], [1, "menu-divider"], [1, "menu-item"], [1, "menu-item", 3, "click"], [1, "menu-icon"], [1, "menu-label"]], template: function ContextMenuComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275conditionalCreate(0, ContextMenuComponent_Conditional_0_Template, 4, 4);
    }
    if (rf & 2) {
      \u0275\u0275conditional(ctx.isVisible() ? 0 : -1);
    }
  }, dependencies: [CommonModule, FormsModule], styles: ["\n\n.context-menu-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 9998;\n}\n.context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  background: var(--card);\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  padding: 0.5rem 0;\n  min-width: 200px;\n  z-index: 9999;\n  animation: _ngcontent-%COMP%_fadeIn 0.15s ease-out;\n}\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n    transform: scale(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n.menu-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  width: 100%;\n  padding: 0.75rem 1rem;\n  background: none;\n  border: none;\n  color: var(--text);\n  font-size: 0.95rem;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.menu-item[_ngcontent-%COMP%]:hover {\n  background: var(--accent);\n}\n.menu-icon[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  line-height: 1;\n}\n.menu-label[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.menu-divider[_ngcontent-%COMP%] {\n  height: 1px;\n  background: var(--border);\n  margin: 0.5rem 0;\n}\n/*# sourceMappingURL=context-menu.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ContextMenuComponent, [{
    type: Component,
    args: [{ selector: "app-context-menu", standalone: true, imports: [CommonModule, FormsModule], template: `
    @if (isVisible()) {
      <div class="context-menu-overlay" (click)="close()"></div>
      <div class="context-menu"
           [style.left.px]="position().x"
           [style.top.px]="position().y">
        @for (item of items(); track item.action) {
          @if (item.divider) {
            <div class="menu-divider"></div>
          } @else {
            <button class="menu-item" (click)="onItemClick(item.action)">
              @if (item.icon) {
                <span class="menu-icon">{{ item.icon }}</span>
              }
              <span class="menu-label">{{ item.label }}</span>
            </button>
          }
        }
      </div>
    }
  `, styles: ["/* angular:styles/component:css;689433baa2e31ccbefad8467d3dab9379eed09d2e713081581d976a1638a4490;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/context-menu/context-menu.component.ts */\n.context-menu-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 9998;\n}\n.context-menu {\n  position: fixed;\n  background: var(--card);\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\n  padding: 0.5rem 0;\n  min-width: 200px;\n  z-index: 9999;\n  animation: fadeIn 0.15s ease-out;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n    transform: scale(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n.menu-item {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  width: 100%;\n  padding: 0.75rem 1rem;\n  background: none;\n  border: none;\n  color: var(--text);\n  font-size: 0.95rem;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.menu-item:hover {\n  background: var(--accent);\n}\n.menu-icon {\n  font-size: 1.2rem;\n  line-height: 1;\n}\n.menu-label {\n  flex: 1;\n}\n.menu-divider {\n  height: 1px;\n  background: var(--border);\n  margin: 0.5rem 0;\n}\n/*# sourceMappingURL=context-menu.component.css.map */\n"] }]
  }], null, { itemSelected: [{
    type: Output
  }], closed: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ContextMenuComponent, { className: "ContextMenuComponent", filePath: "app/shared/context-menu/context-menu.component.ts", lineNumber: 110 });
})();

// src/app/world/current-events-manager/current-events-manager.component.ts
var _c0 = (a0) => ({ $implicit: a0 });
var _forTrack04 = ($index, $item) => $item.id;
function CurrentEventsManagerComponent_Conditional_7_Conditional_5_For_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 10);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_Conditional_7_Conditional_5_For_4_Template_button_click_0_listener() {
      const shop_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.addShopFromLibrary(shop_r5));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const shop_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u{1F3EA} ", shop_r5.name);
  }
}
function CurrentEventsManagerComponent_Conditional_7_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "hr");
    \u0275\u0275elementStart(1, "span", 11);
    \u0275\u0275text(2, "Aus Bibliothek:");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(3, CurrentEventsManagerComponent_Conditional_7_Conditional_5_For_4_Template, 2, 1, "button", null, _forTrack04);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r2.libraryShops);
  }
}
function CurrentEventsManagerComponent_Conditional_7_Conditional_6_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 10);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_Conditional_7_Conditional_6_For_1_Template_button_click_0_listener() {
      const bundle_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.addLootBundleFromLibrary(bundle_r7));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const bundle_r7 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u{1F4B0} ", bundle_r7.name);
  }
}
function CurrentEventsManagerComponent_Conditional_7_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, CurrentEventsManagerComponent_Conditional_7_Conditional_6_For_1_Template, 2, 1, "button", null, _forTrack04);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r2.libraryLootBundles);
  }
}
function CurrentEventsManagerComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "button", 10);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_Conditional_7_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createNewLootBundle());
    });
    \u0275\u0275text(2, "\u{1F4B0} Neues Loot-B\xFCndel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 10);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_Conditional_7_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createNewShop());
    });
    \u0275\u0275text(4, "\u{1F3EA} Neuer Shop");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, CurrentEventsManagerComponent_Conditional_7_Conditional_5_Template, 5, 0);
    \u0275\u0275conditionalCreate(6, CurrentEventsManagerComponent_Conditional_7_Conditional_6_Template, 2, 0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx_r2.libraryShops.length > 0 ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.libraryLootBundles.length > 0 ? 6 : -1);
  }
}
function CurrentEventsManagerComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 7);
    \u0275\u0275text(1, "Keine aktiven Events. Events werden f\xFCr alle Spieler in der Party sichtbar.");
    \u0275\u0275elementEnd();
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 22);
    \u0275\u0275twoWayListener("ngModelChange", function CurrentEventsManagerComponent_For_11_Conditional_4_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r9);
      const event_r10 = \u0275\u0275nextContext().$implicit;
      \u0275\u0275twoWayBindingSet(event_r10.name, $event) || (event_r10.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("blur", function CurrentEventsManagerComponent_For_11_Conditional_4_Template_input_blur_0_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.stopEditingEvent());
    })("keyup.enter", function CurrentEventsManagerComponent_For_11_Conditional_4_Template_input_keyup_enter_0_listener() {
      \u0275\u0275restoreView(_r9);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.stopEditingEvent());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const event_r10 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275twoWayProperty("ngModel", event_r10.name);
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 23);
    \u0275\u0275listener("dblclick", function CurrentEventsManagerComponent_For_11_Conditional_5_Template_span_dblclick_0_listener() {
      \u0275\u0275restoreView(_r11);
      const event_r10 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.startEditingEvent(event_r10.id));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const event_r10 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(event_r10.name);
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 24);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_For_11_Conditional_7_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r12);
      const event_r10 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.editInLibrary(event_r10));
    });
    \u0275\u0275element(1, "span", 25);
    \u0275\u0275elementEnd();
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_1_ng_container_0_Template, 1, 0, "ng-container", 26);
  }
  if (rf & 2) {
    const event_r10 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    const shopContent_r13 = \u0275\u0275reference(13);
    \u0275\u0275property("ngTemplateOutlet", shopContent_r13)("ngTemplateOutletContext", \u0275\u0275pureFunction1(2, _c0, ctx_r2.asShop(event_r10)));
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_2_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 26);
  }
  if (rf & 2) {
    const event_r10 = \u0275\u0275nextContext(2).$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    const lootContent_r14 = \u0275\u0275reference(15);
    \u0275\u0275property("ngTemplateOutlet", lootContent_r14)("ngTemplateOutletContext", \u0275\u0275pureFunction1(2, _c0, ctx_r2.asLoot(event_r10)));
  }
}
function CurrentEventsManagerComponent_For_11_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275conditionalCreate(1, CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_1_Template, 1, 4, "ng-container")(2, CurrentEventsManagerComponent_For_11_Conditional_12_Conditional_2_Template, 1, 4, "ng-container");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const event_r10 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275conditional(event_r10.type === "shop" ? 1 : 2);
  }
}
function CurrentEventsManagerComponent_For_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 12)(1, "div", 13)(2, "span", 14);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, CurrentEventsManagerComponent_For_11_Conditional_4_Template, 1, 1, "input", 15)(5, CurrentEventsManagerComponent_For_11_Conditional_5_Template, 2, 1, "span", 16);
    \u0275\u0275elementStart(6, "div", 17);
    \u0275\u0275conditionalCreate(7, CurrentEventsManagerComponent_For_11_Conditional_7_Template, 2, 0, "button", 18);
    \u0275\u0275elementStart(8, "button", 19);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_For_11_Template_button_click_8_listener() {
      const event_r10 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleEventExpanded(event_r10.id));
    });
    \u0275\u0275text(9);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 20);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_For_11_Template_button_click_10_listener() {
      const event_r10 = \u0275\u0275restoreView(_r8).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.removeEvent(event_r10.id));
    });
    \u0275\u0275text(11, "\u2715");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(12, CurrentEventsManagerComponent_For_11_Conditional_12_Template, 3, 1, "div", 21);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const event_r10 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("shop", event_r10.type === "shop")("loot", event_r10.type === "loot");
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(event_r10.type === "shop" ? "\u{1F3EA}" : "\u{1F4B0}");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.editingEventId === event_r10.id ? 4 : 5);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(event_r10.sourceRef ? 7 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" ", ctx_r2.expandedEvents.has(event_r10.id) ? "\u25BC" : "\u25B6", " ");
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r2.expandedEvents.has(event_r10.id) ? 12 : -1);
  }
}
function CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 35);
    \u0275\u0275text(1, "Verhandelbar");
    \u0275\u0275elementEnd();
  }
}
function CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const deal_r16 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.formatCurrency(deal_r16.price));
  }
}
function CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const deal_r16 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", deal_r16.quantity - deal_r16.sold, "/", deal_r16.quantity);
  }
}
function CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 38);
    \u0275\u0275text(1, "\u2B05 Ankauf");
    \u0275\u0275elementEnd();
  }
}
function CurrentEventsManagerComponent_ng_template_12_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 32)(1, "div", 33)(2, "span", 34);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_4_Template, 2, 0, "span", 35)(5, CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_5_Template, 2, 1, "span", 36);
    \u0275\u0275conditionalCreate(6, CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_6_Template, 2, 2, "span", 37);
    \u0275\u0275conditionalCreate(7, CurrentEventsManagerComponent_ng_template_12_For_8_Conditional_7_Template, 2, 0, "span", 38);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "div", 39)(9, "input", 40);
    \u0275\u0275twoWayListener("ngModelChange", function CurrentEventsManagerComponent_ng_template_12_For_8_Template_input_ngModelChange_9_listener($event) {
      const deal_r16 = \u0275\u0275restoreView(_r15).$implicit;
      \u0275\u0275twoWayBindingSet(deal_r16.discount, $event) || (deal_r16.discount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("change", function CurrentEventsManagerComponent_ng_template_12_For_8_Template_input_change_9_listener() {
      const deal_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const shop_r17 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.updateDealDiscount(shop_r17.id, deal_r16.id));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 41);
    \u0275\u0275text(11, "% Off");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 42);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_ng_template_12_For_8_Template_button_click_12_listener() {
      const deal_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const shop_r17 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.removeDeal(shop_r17.id, deal_r16.id));
    });
    \u0275\u0275text(13, "\u2715");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const deal_r16 = ctx.$implicit;
    \u0275\u0275classProp("reverse", deal_r16.isReverseDeal)("sold-out", deal_r16.quantity !== void 0 && deal_r16.sold >= deal_r16.quantity);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(deal_r16.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(deal_r16.isNegotiable ? 4 : deal_r16.price ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(deal_r16.quantity !== void 0 ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(deal_r16.isReverseDeal ? 7 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", deal_r16.discount);
  }
}
function CurrentEventsManagerComponent_ng_template_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27)(1, "p", 28);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 29)(4, "div", 30)(5, "h4");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275repeaterCreate(7, CurrentEventsManagerComponent_ng_template_12_For_8_Template, 14, 9, "div", 31, _forTrack04);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const shop_r17 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(shop_r17.description || "Keine Beschreibung");
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Angebote (", shop_r17.deals.length, ")");
    \u0275\u0275advance();
    \u0275\u0275repeater(shop_r17.deals);
  }
}
function CurrentEventsManagerComponent_ng_template_14_For_5_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 48);
    \u0275\u0275text(1, "Beansprucht");
    \u0275\u0275elementEnd();
  }
}
function CurrentEventsManagerComponent_ng_template_14_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275element(1, "span");
    \u0275\u0275elementStart(2, "span", 47);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, CurrentEventsManagerComponent_ng_template_14_For_5_Conditional_4_Template, 2, 0, "span", 48);
    \u0275\u0275elementStart(5, "button", 42);
    \u0275\u0275listener("click", function CurrentEventsManagerComponent_ng_template_14_For_5_Template_button_click_5_listener() {
      const item_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const loot_r20 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.removeLootItem(loot_r20.id, item_r19.id));
    });
    \u0275\u0275text(6, "\u2715");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r19 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("claimed", item_r19.claimedBy);
    \u0275\u0275advance();
    \u0275\u0275classMap(\u0275\u0275interpolate1("loot-type-icon app-icon ", ctx_r2.getLootTypeIcon(item_r19.type)));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r2.getLootName(item_r19));
    \u0275\u0275advance();
    \u0275\u0275conditional(item_r19.claimedBy ? 4 : -1);
  }
}
function CurrentEventsManagerComponent_ng_template_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 43)(1, "p", 28);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 44);
    \u0275\u0275repeaterCreate(4, CurrentEventsManagerComponent_ng_template_14_For_5_Template, 7, 7, "div", 45, _forTrack04);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const loot_r20 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(loot_r20.description || "Keine Beschreibung");
    \u0275\u0275advance(2);
    \u0275\u0275repeater(loot_r20.items);
  }
}
var CurrentEventsManagerComponent = class _CurrentEventsManagerComponent {
  events = [];
  libraries = [];
  mergedItems = [];
  mergedRunes = [];
  mergedSpells = [];
  mergedSkills = [];
  mergedStatusEffects = [];
  eventsChange = new EventEmitter();
  eventAdded = new EventEmitter();
  eventRemoved = new EventEmitter();
  eventUpdated = new EventEmitter();
  navigateToLibrary = new EventEmitter();
  showAddMenu = false;
  expandedEvents = /* @__PURE__ */ new Set();
  editingEventId = null;
  isDraggingOverList = false;
  // Get shops and loot bundles from linked libraries
  get libraryShops() {
    return this.libraries.flatMap((lib) => lib.shops || []);
  }
  get libraryLootBundles() {
    return this.libraries.flatMap((lib) => lib.lootBundles || []);
  }
  formatCurrency = formatCurrency;
  createNewLootBundle() {
    const bundle = createEmptyLootBundleEvent("Neues Loot-B\xFCndel");
    this.eventAdded.emit(bundle);
    this.expandedEvents.add(bundle.id);
    this.showAddMenu = false;
  }
  createNewShop() {
    const shop = createEmptyShopEvent("Neuer Shop");
    this.eventAdded.emit(shop);
    this.expandedEvents.add(shop.id);
    this.showAddMenu = false;
  }
  addShopFromLibrary(shop) {
    const sourceLibrary = this.libraries.find((lib) => lib.shops.some((s) => s.id === shop.id));
    const newShop = __spreadProps(__spreadValues({}, JSON.parse(JSON.stringify(shop))), {
      id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      claimedDeals: {},
      sourceRef: sourceLibrary ? {
        libraryId: sourceLibrary.id,
        libraryName: sourceLibrary.name,
        itemId: shop.id
      } : void 0
    });
    this.eventAdded.emit(newShop);
    this.expandedEvents.add(newShop.id);
    this.showAddMenu = false;
  }
  addLootBundleFromLibrary(bundle) {
    const sourceLibrary = this.libraries.find((lib) => lib.lootBundles.some((b) => b.id === bundle.id));
    const newBundle = __spreadProps(__spreadValues({}, JSON.parse(JSON.stringify(bundle))), {
      id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      items: bundle.items.map((item) => __spreadProps(__spreadValues({}, item), {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        claimedBy: void 0
      })),
      sourceRef: sourceLibrary ? {
        libraryId: sourceLibrary.id,
        libraryName: sourceLibrary.name,
        itemId: bundle.id
      } : void 0
    });
    this.eventAdded.emit(newBundle);
    this.expandedEvents.add(newBundle.id);
    this.showAddMenu = false;
  }
  removeEvent(eventId) {
    this.eventRemoved.emit(eventId);
  }
  toggleEventExpanded(eventId) {
    if (this.expandedEvents.has(eventId)) {
      this.expandedEvents.delete(eventId);
    } else {
      this.expandedEvents.add(eventId);
    }
  }
  startEditingEvent(eventId) {
    this.editingEventId = eventId;
  }
  stopEditingEvent() {
    if (this.editingEventId) {
      const event = this.events.find((e) => e.id === this.editingEventId);
      if (event) {
        this.eventUpdated.emit(event);
      }
      this.editingEventId = null;
    }
  }
  asShop(event) {
    return event;
  }
  asLoot(event) {
    return event;
  }
  updateDealDiscount(shopId, dealId) {
    const shop = this.events.find((e) => e.id === shopId);
    if (shop) {
      this.eventUpdated.emit(shop);
    }
  }
  removeDeal(shopId, dealId) {
    const shop = this.events.find((e) => e.id === shopId);
    if (shop) {
      shop.deals = shop.deals.filter((d) => d.id !== dealId);
      this.eventUpdated.emit(shop);
    }
  }
  getLootTypeIcon(type) {
    switch (type) {
      case "item":
        return "i-item";
      case "rune":
        return "i-spell";
      case "spell":
        return "i-spell";
      case "skill":
        return "i-ability";
      case "status-effect":
        return "i-status-effect";
      case "currency":
        return "i-stat";
      default:
        return "i-item";
    }
  }
  getLootName(item) {
    if (item.type === "currency") {
      return formatCurrency(item.data);
    }
    return item.data?.name || "Unbekannt";
  }
  removeLootItem(eventId, itemId) {
    const loot = this.events.find((e) => e.id === eventId);
    if (loot) {
      loot.items = loot.items.filter((i) => i.id !== itemId);
      this.eventUpdated.emit(loot);
    }
  }
  editInLibrary(event) {
    if (!event.sourceRef)
      return;
    const tab = event.type === "shop" ? "shops" : "loot-bundles";
    this.navigateToLibrary.emit({
      libraryId: event.sourceRef.libraryId,
      tab,
      itemId: event.sourceRef.itemId
    });
  }
  onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }
  onDragOverEvents(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    const type = event.dataTransfer.types.includes("loottype");
    if (type) {
      this.isDraggingOverList = true;
    }
  }
  onDragLeaveEvents(event) {
    const target = event.target;
    const currentTarget = event.currentTarget;
    if (target === currentTarget) {
      this.isDraggingOverList = false;
    }
  }
  onDropEvent(event) {
    event.preventDefault();
    this.isDraggingOverList = false;
    const type = event.dataTransfer.getData("lootType");
    const index = parseInt(event.dataTransfer.getData("lootIndex"));
    if (type === "shop") {
      const shop = this.libraryShops[index];
      if (shop) {
        this.addShopFromLibrary(shop);
      }
    } else if (type === "loot-bundle") {
      const bundle = this.libraryLootBundles[index];
      if (bundle) {
        this.addLootBundleFromLibrary(bundle);
      }
    }
  }
  onDropToLoot(event, eventId) {
    event.preventDefault();
    const type = event.dataTransfer.getData("lootType");
    const index = parseInt(event.dataTransfer.getData("lootIndex"));
    const loot = this.events.find((e) => e.id === eventId);
    if (!loot)
      return;
    let data;
    switch (type) {
      case "item":
        data = this.mergedItems[index];
        break;
      case "rune":
        data = this.mergedRunes[index];
        break;
      case "spell":
        data = this.mergedSpells[index];
        break;
      case "skill":
        data = this.mergedSkills[index];
        break;
    }
    if (data) {
      const lootItem = {
        id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        data: __spreadValues({}, data)
      };
      loot.items.push(lootItem);
      this.eventUpdated.emit(loot);
    }
  }
  static \u0275fac = function CurrentEventsManagerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CurrentEventsManagerComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CurrentEventsManagerComponent, selectors: [["app-current-events-manager"]], inputs: { events: "events", libraries: "libraries", mergedItems: "mergedItems", mergedRunes: "mergedRunes", mergedSpells: "mergedSpells", mergedSkills: "mergedSkills", mergedStatusEffects: "mergedStatusEffects" }, outputs: { eventsChange: "eventsChange", eventAdded: "eventAdded", eventRemoved: "eventRemoved", eventUpdated: "eventUpdated", navigateToLibrary: "navigateToLibrary" }, decls: 16, vars: 4, consts: [["shopContent", ""], ["lootContent", ""], [1, "current-events-manager"], [1, "events-header"], [1, "event-actions"], [1, "add-btn", 3, "click"], [1, "add-menu"], [1, "empty-state"], [1, "events-list", 3, "dragover", "dragleave", "drop"], [1, "event-card", 3, "shop", "loot"], [3, "click"], [1, "menu-label"], [1, "event-card"], [1, "event-header"], [1, "event-icon"], ["type", "text", 1, "event-name-input", 3, "ngModel"], [1, "event-name"], [1, "event-actions-inline"], ["title", "In Bibliothek bearbeiten", 1, "icon-btn", "library"], ["title", "Details", 1, "icon-btn", 3, "click"], ["title", "Event entfernen", 1, "icon-btn", "delete", 3, "click"], [1, "event-content"], ["type", "text", 1, "event-name-input", 3, "ngModelChange", "blur", "keyup.enter", "ngModel"], [1, "event-name", 3, "dblclick"], ["title", "In Bibliothek bearbeiten", 1, "icon-btn", "library", 3, "click"], [1, "app-icon", "i-folder"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "shop-content"], [1, "event-description"], [1, "deals-section"], [1, "deals-header"], [1, "deal-card", 3, "reverse", "sold-out"], [1, "deal-card"], [1, "deal-info"], [1, "deal-name"], [1, "deal-price", "negotiable"], [1, "deal-price"], [1, "deal-stock"], [1, "deal-type", "reverse"], [1, "deal-quick-actions"], ["type", "number", "min", "0", "max", "100", "placeholder", "0", "title", "Discount %", 1, "discount-input", 3, "ngModelChange", "change", "ngModel"], [1, "discount-label"], ["title", "Entfernen", 1, "icon-btn", "delete", 3, "click"], [1, "loot-content"], [1, "loot-items"], [1, "loot-item", 3, "claimed"], [1, "loot-item"], [1, "loot-name"], [1, "claimed-by"]], template: function CurrentEventsManagerComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 2)(1, "div", 3)(2, "h3");
      \u0275\u0275text(3, "\u{1F3AA} Aktive Events");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "div", 4)(5, "button", 5);
      \u0275\u0275listener("click", function CurrentEventsManagerComponent_Template_button_click_5_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.showAddMenu = !ctx.showAddMenu);
      });
      \u0275\u0275text(6, " + Event hinzuf\xFCgen ");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(7, CurrentEventsManagerComponent_Conditional_7_Template, 7, 2, "div", 6);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(8, CurrentEventsManagerComponent_Conditional_8_Template, 2, 0, "p", 7);
      \u0275\u0275elementStart(9, "div", 8);
      \u0275\u0275listener("dragover", function CurrentEventsManagerComponent_Template_div_dragover_9_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onDragOverEvents($event));
      })("dragleave", function CurrentEventsManagerComponent_Template_div_dragleave_9_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onDragLeaveEvents($event));
      })("drop", function CurrentEventsManagerComponent_Template_div_drop_9_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onDropEvent($event));
      });
      \u0275\u0275repeaterCreate(10, CurrentEventsManagerComponent_For_11_Template, 13, 9, "div", 9, _forTrack04);
      \u0275\u0275elementEnd();
      \u0275\u0275template(12, CurrentEventsManagerComponent_ng_template_12_Template, 9, 2, "ng-template", null, 0, \u0275\u0275templateRefExtractor)(14, CurrentEventsManagerComponent_ng_template_14_Template, 6, 1, "ng-template", null, 1, \u0275\u0275templateRefExtractor);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(7);
      \u0275\u0275conditional(ctx.showAddMenu ? 7 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.events.length === 0 ? 8 : -1);
      \u0275\u0275advance();
      \u0275\u0275classProp("drag-over", ctx.isDraggingOverList);
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.events);
    }
  }, dependencies: [CommonModule, NgTemplateOutlet, FormsModule, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel], styles: ["\n\n.current-events-manager[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n}\n.events-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1rem;\n  position: relative;\n}\n.events-header[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n}\n.add-btn[_ngcontent-%COMP%] {\n  background: var(--accent);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.add-menu[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 100%;\n  right: 0;\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 0.5rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n  z-index: 100;\n  min-width: 200px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.add-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  padding: 0.5rem;\n  text-align: left;\n  cursor: pointer;\n  border-radius: 4px;\n  color: var(--text);\n}\n.add-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: var(--bg-hover);\n}\n.add-menu[_ngcontent-%COMP%]   hr[_ngcontent-%COMP%] {\n  border: none;\n  border-top: 1px solid var(--border);\n  margin: 0.25rem 0;\n}\n.menu-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--muted);\n  padding: 0.25rem 0.5rem;\n}\n.empty-state[_ngcontent-%COMP%] {\n  color: var(--muted);\n  text-align: center;\n  padding: 2rem;\n  font-style: italic;\n}\n.events-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  min-height: 100px;\n  padding: 0.5rem;\n  border: 2px dashed transparent;\n  border-radius: 8px;\n  transition: all 0.2s;\n}\n.events-list.drag-over[_ngcontent-%COMP%] {\n  border-color: var(--accent);\n  background: rgba(107, 70, 193, 0.05);\n}\n.event-card[_ngcontent-%COMP%] {\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.event-card.shop[_ngcontent-%COMP%] {\n  border-left: 3px solid #4CAF50;\n}\n.event-card.loot[_ngcontent-%COMP%] {\n  border-left: 3px solid #FF9800;\n}\n.event-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  background: var(--bg-darker);\n}\n.event-icon[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n}\n.event-name[_ngcontent-%COMP%] {\n  flex: 1;\n  font-weight: 600;\n  cursor: pointer;\n}\n.event-name-input[_ngcontent-%COMP%] {\n  flex: 1;\n  background: var(--bg);\n  border: 1px solid var(--accent);\n  border-radius: 4px;\n  padding: 0.25rem;\n  color: var(--text);\n}\n.event-actions-inline[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.25rem;\n}\n.icon-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  color: var(--text);\n}\n.icon-btn[_ngcontent-%COMP%]:hover {\n  background: var(--bg-hover);\n}\n.icon-btn.delete[_ngcontent-%COMP%]:hover {\n  background: #f44336;\n  color: white;\n}\n.event-content[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n}\n.event-description[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.85rem;\n  margin: 0 0 0.75rem 0;\n}\n.deals-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.deals-header[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9rem;\n}\n.add-deal-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--border);\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 0.8rem;\n}\n.deal-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.5rem;\n  background: var(--bg);\n  border-radius: 4px;\n  margin-bottom: 0.25rem;\n}\n.deal-card.reverse[_ngcontent-%COMP%] {\n  border-left: 2px solid #9C27B0;\n}\n.deal-card.sold-out[_ngcontent-%COMP%] {\n  opacity: 0.5;\n}\n.deal-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex: 1;\n}\n.deal-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n.deal-price[_ngcontent-%COMP%] {\n  color: #FFD700;\n  font-size: 0.85rem;\n}\n.deal-price.negotiable[_ngcontent-%COMP%] {\n  color: #FF9800;\n  font-style: italic;\n}\n.deal-stock[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.8rem;\n}\n.deal-type.reverse[_ngcontent-%COMP%] {\n  background: #9C27B0;\n  color: white;\n  padding: 0.125rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n}\n.deal-quick-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.discount-input[_ngcontent-%COMP%] {\n  width: 50px;\n  padding: 0.25rem;\n  background: var(--bg-darker);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  text-align: center;\n}\n.discount-label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  color: var(--muted);\n}\n.loot-items[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.loot-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem;\n  background: var(--bg);\n  border-radius: 4px;\n}\n.loot-item.claimed[_ngcontent-%COMP%] {\n  opacity: 0.5;\n  text-decoration: line-through;\n}\n.loot-type-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n}\n.loot-name[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.claimed-by[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.8rem;\n  font-style: italic;\n}\n.add-loot-zone[_ngcontent-%COMP%] {\n  border: 2px dashed var(--border);\n  border-radius: 4px;\n  padding: 1rem;\n  text-align: center;\n  color: var(--muted);\n  margin-top: 0.5rem;\n}\n.add-loot-zone[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent);\n  background: rgba(var(--accent-rgb), 0.1);\n}\n.add-loot-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: var(--accent);\n  cursor: pointer;\n  text-decoration: underline;\n  margin: 0 0.25rem;\n}\n.deal-editor[_ngcontent-%COMP%], \n.currency-loot-editor[_ngcontent-%COMP%] {\n  background: var(--bg-darker);\n  padding: 1rem;\n  border-radius: 6px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n.editor-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.editor-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  min-width: 80px;\n}\n.editor-row[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%], \n.editor-row[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.4rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  background: var(--bg-card);\n  color: var(--text);\n}\n.currency-inputs[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  flex: 1;\n}\n.currency-input[_ngcontent-%COMP%] {\n  width: 60px;\n  padding: 0.4rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  background: var(--bg-card);\n  color: var(--text);\n  text-align: center;\n}\n.editor-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  justify-content: flex-end;\n}\n.save-btn[_ngcontent-%COMP%] {\n  background: var(--accent);\n  color: white;\n  border: none;\n  padding: 0.4rem 0.8rem;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.cancel-btn[_ngcontent-%COMP%] {\n  background: var(--bg-card);\n  color: var(--text);\n  border: 1px solid var(--border);\n  padding: 0.4rem 0.8rem;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.deal-card.editing[_ngcontent-%COMP%] {\n  border-color: var(--accent);\n}\n.currency-loot-editor[_ngcontent-%COMP%]   h5[_ngcontent-%COMP%] {\n  margin: 0 0 0.5rem 0;\n}\n/*# sourceMappingURL=current-events-manager.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CurrentEventsManagerComponent, [{
    type: Component,
    args: [{ selector: "app-current-events-manager", standalone: true, imports: [CommonModule, FormsModule], template: `
    <div class="current-events-manager">
      <div class="events-header">
        <h3>\u{1F3AA} Aktive Events</h3>
        <div class="event-actions">
          <button class="add-btn" (click)="showAddMenu = !showAddMenu">
            + Event hinzuf\xFCgen
          </button>
          @if (showAddMenu) {
            <div class="add-menu">
              <button (click)="createNewLootBundle()">\u{1F4B0} Neues Loot-B\xFCndel</button>
              <button (click)="createNewShop()">\u{1F3EA} Neuer Shop</button>
              @if (libraryShops.length > 0) {
                <hr>
                <span class="menu-label">Aus Bibliothek:</span>
                @for (shop of libraryShops; track shop.id) {
                  <button (click)="addShopFromLibrary(shop)">\u{1F3EA} {{ shop.name }}</button>
                }
              }
              @if (libraryLootBundles.length > 0) {
                @for (bundle of libraryLootBundles; track bundle.id) {
                  <button (click)="addLootBundleFromLibrary(bundle)">\u{1F4B0} {{ bundle.name }}</button>
                }
              }
            </div>
          }
        </div>
      </div>

      @if (events.length === 0) {
        <p class="empty-state">Keine aktiven Events. Events werden f\xFCr alle Spieler in der Party sichtbar.</p>
      }

      <div class="events-list" 
           [class.drag-over]="isDraggingOverList"
           (dragover)="onDragOverEvents($event)"
           (dragleave)="onDragLeaveEvents($event)"
           (drop)="onDropEvent($event)">
        @for (event of events; track event.id) {
          <div class="event-card" [class.shop]="event.type === 'shop'" [class.loot]="event.type === 'loot'">
            <div class="event-header">
              <span class="event-icon">{{ event.type === 'shop' ? '\u{1F3EA}' : '\u{1F4B0}' }}</span>
              @if (editingEventId === event.id) {
                <input 
                  type="text" 
                  [(ngModel)]="event.name" 
                  (blur)="stopEditingEvent()"
                  (keyup.enter)="stopEditingEvent()"
                  class="event-name-input"
                />
              } @else {
                <span class="event-name" (dblclick)="startEditingEvent(event.id)">{{ event.name }}</span>
              }
              <div class="event-actions-inline">
                @if (event.sourceRef) {
                  <button class="icon-btn library" (click)="editInLibrary(event)" title="In Bibliothek bearbeiten">
                    <span class="app-icon i-folder"></span>
                  </button>
                }
                <button class="icon-btn" (click)="toggleEventExpanded(event.id)" title="Details">
                  {{ expandedEvents.has(event.id) ? '\u25BC' : '\u25B6' }}
                </button>
                <button class="icon-btn delete" (click)="removeEvent(event.id)" title="Event entfernen">\u2715</button>
              </div>
            </div>

            @if (expandedEvents.has(event.id)) {
              <div class="event-content">
                @if (event.type === 'shop') {
                  <ng-container *ngTemplateOutlet="shopContent; context: { $implicit: asShop(event) }"></ng-container>
                } @else {
                  <ng-container *ngTemplateOutlet="lootContent; context: { $implicit: asLoot(event) }"></ng-container>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Shop Content Template -->
      <ng-template #shopContent let-shop>
        <div class="shop-content">
          <p class="event-description">{{ shop.description || 'Keine Beschreibung' }}</p>
          
          <div class="deals-section">
            <div class="deals-header">
              <h4>Angebote ({{ shop.deals.length }})</h4>
            </div>
            
            @for (deal of shop.deals; track deal.id; let dealIdx = $index) {
              <div class="deal-card" [class.reverse]="deal.isReverseDeal" [class.sold-out]="deal.quantity !== undefined && deal.sold >= deal.quantity">
                <div class="deal-info">
                  <span class="deal-name">{{ deal.name }}</span>
                  @if (deal.isNegotiable) {
                    <span class="deal-price negotiable">Verhandelbar</span>
                  } @else if (deal.price) {
                    <span class="deal-price">{{ formatCurrency(deal.price) }}</span>
                  }
                  @if (deal.quantity !== undefined) {
                    <span class="deal-stock">{{ deal.quantity - deal.sold }}/{{ deal.quantity }}</span>
                  }
                  @if (deal.isReverseDeal) {
                    <span class="deal-type reverse">\u2B05 Ankauf</span>
                  }
                </div>
                <div class="deal-quick-actions">
                  <input 
                    type="number" 
                    [(ngModel)]="deal.discount" 
                    (change)="updateDealDiscount(shop.id, deal.id)"
                    min="0" 
                    max="100" 
                    placeholder="0"
                    class="discount-input"
                    title="Discount %"
                  />
                  <span class="discount-label">% Off</span>
                  <button class="icon-btn delete" (click)="removeDeal(shop.id, deal.id)" title="Entfernen">\u2715</button>
                </div>
              </div>
            }
          </div>
        </div>
      </ng-template>

      <!-- Loot Content Template -->
      <ng-template #lootContent let-loot>
        <div class="loot-content">
          <p class="event-description">{{ loot.description || 'Keine Beschreibung' }}</p>
          
          <div class="loot-items">
            @for (item of loot.items; track item.id) {
              <div class="loot-item" [class.claimed]="item.claimedBy">
                <span class="loot-type-icon app-icon {{ getLootTypeIcon(item.type) }}"></span>
                <span class="loot-name">{{ getLootName(item) }}</span>
                @if (item.claimedBy) {
                  <span class="claimed-by">Beansprucht</span>
                }
                <button class="icon-btn delete" (click)="removeLootItem(loot.id, item.id)" title="Entfernen">\u2715</button>
              </div>
            }
          </div>
        </div>
      </ng-template>
    </div>
  `, styles: ["/* angular:styles/component:css;25afff2119496a6ee27f27a84df49948fe808d3029044a70f738af3a7b8abef6;C:/Users/adermake/Documents/22FailApp/frontend/src/app/world/current-events-manager/current-events-manager.component.ts */\n.current-events-manager {\n  padding: 0.5rem;\n}\n.events-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 1rem;\n  position: relative;\n}\n.events-header h3 {\n  margin: 0;\n  font-size: 1rem;\n}\n.add-btn {\n  background: var(--accent);\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.add-menu {\n  position: absolute;\n  top: 100%;\n  right: 0;\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 0.5rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n  z-index: 100;\n  min-width: 200px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.add-menu button {\n  background: transparent;\n  border: none;\n  padding: 0.5rem;\n  text-align: left;\n  cursor: pointer;\n  border-radius: 4px;\n  color: var(--text);\n}\n.add-menu button:hover {\n  background: var(--bg-hover);\n}\n.add-menu hr {\n  border: none;\n  border-top: 1px solid var(--border);\n  margin: 0.25rem 0;\n}\n.menu-label {\n  font-size: 0.75rem;\n  color: var(--muted);\n  padding: 0.25rem 0.5rem;\n}\n.empty-state {\n  color: var(--muted);\n  text-align: center;\n  padding: 2rem;\n  font-style: italic;\n}\n.events-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  min-height: 100px;\n  padding: 0.5rem;\n  border: 2px dashed transparent;\n  border-radius: 8px;\n  transition: all 0.2s;\n}\n.events-list.drag-over {\n  border-color: var(--accent);\n  background: rgba(107, 70, 193, 0.05);\n}\n.event-card {\n  background: var(--bg-card);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  overflow: hidden;\n}\n.event-card.shop {\n  border-left: 3px solid #4CAF50;\n}\n.event-card.loot {\n  border-left: 3px solid #FF9800;\n}\n.event-header {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.75rem;\n  background: var(--bg-darker);\n}\n.event-icon {\n  font-size: 1.25rem;\n}\n.event-name {\n  flex: 1;\n  font-weight: 600;\n  cursor: pointer;\n}\n.event-name-input {\n  flex: 1;\n  background: var(--bg);\n  border: 1px solid var(--accent);\n  border-radius: 4px;\n  padding: 0.25rem;\n  color: var(--text);\n}\n.event-actions-inline {\n  display: flex;\n  gap: 0.25rem;\n}\n.icon-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  color: var(--text);\n}\n.icon-btn:hover {\n  background: var(--bg-hover);\n}\n.icon-btn.delete:hover {\n  background: #f44336;\n  color: white;\n}\n.event-content {\n  padding: 0.75rem;\n}\n.event-description {\n  color: var(--muted);\n  font-size: 0.85rem;\n  margin: 0 0 0.75rem 0;\n}\n.deals-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.deals-header h4 {\n  margin: 0;\n  font-size: 0.9rem;\n}\n.add-deal-btn {\n  background: transparent;\n  border: 1px solid var(--border);\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 0.8rem;\n}\n.deal-card {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 0.5rem;\n  background: var(--bg);\n  border-radius: 4px;\n  margin-bottom: 0.25rem;\n}\n.deal-card.reverse {\n  border-left: 2px solid #9C27B0;\n}\n.deal-card.sold-out {\n  opacity: 0.5;\n}\n.deal-info {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  flex: 1;\n}\n.deal-name {\n  font-weight: 500;\n}\n.deal-price {\n  color: #FFD700;\n  font-size: 0.85rem;\n}\n.deal-price.negotiable {\n  color: #FF9800;\n  font-style: italic;\n}\n.deal-stock {\n  color: var(--muted);\n  font-size: 0.8rem;\n}\n.deal-type.reverse {\n  background: #9C27B0;\n  color: white;\n  padding: 0.125rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.75rem;\n}\n.deal-quick-actions {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.discount-input {\n  width: 50px;\n  padding: 0.25rem;\n  background: var(--bg-darker);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  text-align: center;\n}\n.discount-label {\n  font-size: 0.8rem;\n  color: var(--muted);\n}\n.loot-items {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.loot-item {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem;\n  background: var(--bg);\n  border-radius: 4px;\n}\n.loot-item.claimed {\n  opacity: 0.5;\n  text-decoration: line-through;\n}\n.loot-type-icon {\n  font-size: 1rem;\n}\n.loot-name {\n  flex: 1;\n}\n.claimed-by {\n  color: var(--muted);\n  font-size: 0.8rem;\n  font-style: italic;\n}\n.add-loot-zone {\n  border: 2px dashed var(--border);\n  border-radius: 4px;\n  padding: 1rem;\n  text-align: center;\n  color: var(--muted);\n  margin-top: 0.5rem;\n}\n.add-loot-zone:hover {\n  border-color: var(--accent);\n  background: rgba(var(--accent-rgb), 0.1);\n}\n.add-loot-btn {\n  background: transparent;\n  border: none;\n  color: var(--accent);\n  cursor: pointer;\n  text-decoration: underline;\n  margin: 0 0.25rem;\n}\n.deal-editor,\n.currency-loot-editor {\n  background: var(--bg-darker);\n  padding: 1rem;\n  border-radius: 6px;\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n.editor-row {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.editor-row label {\n  min-width: 80px;\n}\n.editor-row input[type=text],\n.editor-row input[type=number] {\n  flex: 1;\n  padding: 0.4rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  background: var(--bg-card);\n  color: var(--text);\n}\n.currency-inputs {\n  display: flex;\n  gap: 0.5rem;\n  flex: 1;\n}\n.currency-input {\n  width: 60px;\n  padding: 0.4rem;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  background: var(--bg-card);\n  color: var(--text);\n  text-align: center;\n}\n.editor-actions {\n  display: flex;\n  gap: 0.5rem;\n  justify-content: flex-end;\n}\n.save-btn {\n  background: var(--accent);\n  color: white;\n  border: none;\n  padding: 0.4rem 0.8rem;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.cancel-btn {\n  background: var(--bg-card);\n  color: var(--text);\n  border: 1px solid var(--border);\n  padding: 0.4rem 0.8rem;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.deal-card.editing {\n  border-color: var(--accent);\n}\n.currency-loot-editor h5 {\n  margin: 0 0 0.5rem 0;\n}\n/*# sourceMappingURL=current-events-manager.component.css.map */\n"] }]
  }], null, { events: [{
    type: Input
  }], libraries: [{
    type: Input
  }], mergedItems: [{
    type: Input
  }], mergedRunes: [{
    type: Input
  }], mergedSpells: [{
    type: Input
  }], mergedSkills: [{
    type: Input
  }], mergedStatusEffects: [{
    type: Input
  }], eventsChange: [{
    type: Output
  }], eventAdded: [{
    type: Output
  }], eventRemoved: [{
    type: Output
  }], eventUpdated: [{
    type: Output
  }], navigateToLibrary: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CurrentEventsManagerComponent, { className: "CurrentEventsManagerComponent", filePath: "app/world/current-events-manager/current-events-manager.component.ts", lineNumber: 570 });
})();

// src/app/world/character-generator/compass-selector.component.ts
var _c02 = ["compassSvg"];
var _c1 = ["arrow"];
var CompassSelectorComponent = class _CompassSelectorComponent {
  angle = 90;
  // Default to North
  angleChange = new EventEmitter();
  compassSvg;
  arrow;
  isDragging = false;
  Math = Math;
  ngAfterViewInit() {
    const svg = this.compassSvg.nativeElement;
    const arrowEl = this.arrow.nativeElement;
    arrowEl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.isDragging = true;
      arrowEl.style.cursor = "grabbing";
    });
    document.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        this.updateAngleFromMouse(e.clientX, e.clientY);
      }
    });
    document.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        arrowEl.style.cursor = "grab";
      }
    });
    arrowEl.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.isDragging = true;
    });
    document.addEventListener("touchmove", (e) => {
      if (this.isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        this.updateAngleFromMouse(touch.clientX, touch.clientY);
      }
    });
    document.addEventListener("touchend", () => {
      this.isDragging = false;
    });
  }
  updateAngleFromMouse(clientX, clientY) {
    const svg = this.compassSvg.nativeElement;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let newAngle = Math.atan2(-deltaY, deltaX) * (180 / Math.PI) + 90;
    if (newAngle < 0)
      newAngle += 360;
    if (newAngle >= 360)
      newAngle -= 360;
    this.angle = newAngle;
    this.angleChange.emit(this.angle);
  }
  static \u0275fac = function CompassSelectorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CompassSelectorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CompassSelectorComponent, selectors: [["app-compass-selector"]], viewQuery: function CompassSelectorComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c02, 5)(_c1, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.compassSvg = _t.first);
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.arrow = _t.first);
    }
  }, inputs: { angle: "angle" }, outputs: { angleChange: "angleChange" }, decls: 24, vars: 2, consts: [["compassSvg", ""], ["arrow", ""], [1, "compass-container"], ["width", "200", "height", "200", "viewBox", "0 0 200 200"], ["cx", "100", "cy", "100", "r", "90", "fill", "#1a1a1a", "stroke", "#444", "stroke-width", "2"], [1, "direction-markers"], ["x1", "100", "y1", "15", "x2", "100", "y2", "30", "stroke", "#666", "stroke-width", "2"], ["x", "100", "y", "12", "text-anchor", "middle", "fill", "#888", "font-size", "12"], ["x1", "185", "y1", "100", "x2", "170", "y2", "100", "stroke", "#666", "stroke-width", "2"], ["x", "192", "y", "105", "text-anchor", "middle", "fill", "#888", "font-size", "12"], ["x1", "100", "y1", "185", "x2", "100", "y2", "170", "stroke", "#666", "stroke-width", "2"], ["x", "100", "y", "195", "text-anchor", "middle", "fill", "#888", "font-size", "12"], ["x1", "15", "y1", "100", "x2", "30", "y2", "100", "stroke", "#666", "stroke-width", "2"], ["x", "8", "y", "105", "text-anchor", "middle", "fill", "#888", "font-size", "12"], [1, "arrow", 2, "cursor", "grab"], ["x1", "100", "y1", "100", "x2", "100", "y2", "35", "stroke", "#4CAF50", "stroke-width", "3", "stroke-linecap", "round"], ["points", "100,25 95,35 105,35", "fill", "#4CAF50"], ["cx", "100", "cy", "100", "r", "8", "fill", "#4CAF50", "stroke", "#2d6e2f", "stroke-width", "2"], [1, "angle-display"]], template: function CompassSelectorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 2);
      \u0275\u0275namespaceSVG();
      \u0275\u0275domElementStart(1, "svg", 3, 0);
      \u0275\u0275domElement(3, "circle", 4);
      \u0275\u0275domElementStart(4, "g", 5);
      \u0275\u0275domElement(5, "line", 6);
      \u0275\u0275domElementStart(6, "text", 7);
      \u0275\u0275text(7, "N");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElement(8, "line", 8);
      \u0275\u0275domElementStart(9, "text", 9);
      \u0275\u0275text(10, "E");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElement(11, "line", 10);
      \u0275\u0275domElementStart(12, "text", 11);
      \u0275\u0275text(13, "S");
      \u0275\u0275domElementEnd();
      \u0275\u0275domElement(14, "line", 12);
      \u0275\u0275domElementStart(15, "text", 13);
      \u0275\u0275text(16, "W");
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElementStart(17, "g", 14, 1);
      \u0275\u0275domElement(19, "line", 15)(20, "polygon", 16)(21, "circle", 17);
      \u0275\u0275domElementEnd()();
      \u0275\u0275namespaceHTML();
      \u0275\u0275domElementStart(22, "div", 18);
      \u0275\u0275text(23);
      \u0275\u0275domElementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(17);
      \u0275\u0275attribute("transform", "rotate(" + ctx.angle + " 100 100)");
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate1("", ctx.Math.round(ctx.angle), "\xB0");
    }
  }, dependencies: [CommonModule], styles: ["\n\n.compass-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\nsvg[_ngcontent-%COMP%] {\n  border-radius: 50%;\n  background: #0f0f0f;\n}\n.arrow[_ngcontent-%COMP%] {\n  transition: transform 0.05s ease-out;\n}\n.arrow[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.angle-display[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: #4CAF50;\n  background: #1a1a1a;\n  padding: 4px 12px;\n  border-radius: 4px;\n  border: 1px solid #333;\n}\n/*# sourceMappingURL=compass-selector.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CompassSelectorComponent, [{
    type: Component,
    args: [{ selector: "app-compass-selector", standalone: true, imports: [CommonModule], template: `
    <div class="compass-container">
      <svg #compassSvg width="200" height="200" viewBox="0 0 200 200">
        <!-- Compass circle background -->
        <circle cx="100" cy="100" r="90" fill="#1a1a1a" stroke="#444" stroke-width="2"/>
        
        <!-- Direction markers -->
        <g class="direction-markers">
          <!-- North -->
          <line x1="100" y1="15" x2="100" y2="30" stroke="#666" stroke-width="2"/>
          <text x="100" y="12" text-anchor="middle" fill="#888" font-size="12">N</text>
          
          <!-- East -->
          <line x1="185" y1="100" x2="170" y2="100" stroke="#666" stroke-width="2"/>
          <text x="192" y="105" text-anchor="middle" fill="#888" font-size="12">E</text>
          
          <!-- South -->
          <line x1="100" y1="185" x2="100" y2="170" stroke="#666" stroke-width="2"/>
          <text x="100" y="195" text-anchor="middle" fill="#888" font-size="12">S</text>
          
          <!-- West -->
          <line x1="15" y1="100" x2="30" y2="100" stroke="#666" stroke-width="2"/>
          <text x="8" y="105" text-anchor="middle" fill="#888" font-size="12">W</text>
        </g>
        
        <!-- Draggable arrow -->
        <g #arrow class="arrow" [attr.transform]="'rotate(' + angle + ' 100 100)'" style="cursor: grab;">
          <!-- Arrow shaft -->
          <line x1="100" y1="100" x2="100" y2="35" stroke="#4CAF50" stroke-width="3" stroke-linecap="round"/>
          
          <!-- Arrow head -->
          <polygon points="100,25 95,35 105,35" fill="#4CAF50"/>
          
          <!-- Arrow tail circle -->
          <circle cx="100" cy="100" r="8" fill="#4CAF50" stroke="#2d6e2f" stroke-width="2"/>
        </g>
      </svg>
      <div class="angle-display">{{ Math.round(angle) }}\xB0</div>
    </div>
  `, styles: ["/* angular:styles/component:css;97273d4c3866b5a99eaa99f861cd08abfcb382a59410472b3f0f3eebc109f088;C:/Users/adermake/Documents/22FailApp/frontend/src/app/world/character-generator/compass-selector.component.ts */\n.compass-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n}\nsvg {\n  border-radius: 50%;\n  background: #0f0f0f;\n}\n.arrow {\n  transition: transform 0.05s ease-out;\n}\n.arrow:active {\n  cursor: grabbing;\n}\n.angle-display {\n  font-size: 14px;\n  font-weight: 600;\n  color: #4CAF50;\n  background: #1a1a1a;\n  padding: 4px 12px;\n  border-radius: 4px;\n  border: 1px solid #333;\n}\n/*# sourceMappingURL=compass-selector.component.css.map */\n"] }]
  }], null, { angle: [{
    type: Input
  }], angleChange: [{
    type: Output
  }], compassSvg: [{
    type: ViewChild,
    args: ["compassSvg"]
  }], arrow: [{
    type: ViewChild,
    args: ["arrow"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CompassSelectorComponent, { className: "CompassSelectorComponent", filePath: "app/world/character-generator/compass-selector.component.ts", lineNumber: 80 });
})();

// src/app/world/character-generator/spider-chart.component.ts
var _c03 = ["chartSvg"];
var _forTrack05 = ($index, $item) => $item.key;
function SpiderChartComponent_For_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275namespaceSVG();
    \u0275\u0275domElement(0, "line", 12);
  }
  if (rf & 2) {
    const stat_r1 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275attribute("x1", 200)("y1", 200)("x2", ctx_r1.getAxisX(stat_r1.angle, 152))("y2", ctx_r1.getAxisY(stat_r1.angle, 152));
  }
}
function SpiderChartComponent_For_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275namespaceSVG();
    \u0275\u0275domElementStart(0, "g")(1, "circle", 19);
    \u0275\u0275domListener("mousedown", function SpiderChartComponent_For_18_Template_circle_mousedown_1_listener($event) {
      const stat_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.startDrag($event, stat_r4.key));
    })("touchstart", function SpiderChartComponent_For_18_Template_circle_touchstart_1_listener($event) {
      const stat_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.startDragTouch($event, stat_r4.key));
    });
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(2, "text", 20);
    \u0275\u0275text(3);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(4, "text", 21);
    \u0275\u0275text(5);
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const stat_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275attribute("cx", ctx_r1.getPointX(stat_r4))("cy", ctx_r1.getPointY(stat_r4))("fill", ctx_r1.draggedStat === stat_r4.key ? "#66BB6A" : "#4CAF50");
    \u0275\u0275advance();
    \u0275\u0275attribute("x", ctx_r1.getLabelX(stat_r4.angle))("y", ctx_r1.getLabelY(stat_r4.angle))("dy", ctx_r1.getLabelDy(stat_r4.angle));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", stat_r4.label, " ");
    \u0275\u0275advance();
    \u0275\u0275attribute("x", ctx_r1.getValueLabelX(stat_r4))("y", ctx_r1.getValueLabelY(stat_r4));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.getStatValue(stat_r4.key), " ");
  }
}
var SpiderChartComponent = class _SpiderChartComponent {
  distribution = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    chill: 0,
    constitution: 0
  };
  maxPoints = 10;
  distributionChange = new EventEmitter();
  chartSvg;
  draggedStat = null;
  maxRadius = 152;
  // Max distance from center
  stats = [
    { name: "Strength", key: "strength", angle: 90, label: "STR" },
    { name: "Dexterity", key: "dexterity", angle: 30, label: "DEX" },
    { name: "Speed", key: "speed", angle: -30, label: "SPD" },
    { name: "Intelligence", key: "intelligence", angle: -90, label: "INT" },
    { name: "Wille", key: "chill", angle: -150, label: "WIL" },
    { name: "Constitution", key: "constitution", angle: 150, label: "CON" }
  ];
  ngAfterViewInit() {
    document.addEventListener("mousemove", (e) => this.onDrag(e));
    document.addEventListener("mouseup", () => this.endDrag());
    document.addEventListener("touchmove", (e) => this.onDragTouch(e));
    document.addEventListener("touchend", () => this.endDrag());
  }
  startDrag(event, statKey) {
    event.preventDefault();
    this.draggedStat = statKey;
  }
  startDragTouch(event, statKey) {
    event.preventDefault();
    this.draggedStat = statKey;
  }
  onDrag(event) {
    if (!this.draggedStat)
      return;
    this.updateStatFromMouse(event.clientX, event.clientY);
  }
  onDragTouch(event) {
    if (!this.draggedStat || event.touches.length === 0)
      return;
    const touch = event.touches[0];
    this.updateStatFromMouse(touch.clientX, touch.clientY);
  }
  endDrag() {
    this.draggedStat = null;
  }
  updateStatFromMouse(clientX, clientY) {
    if (!this.draggedStat)
      return;
    const svg = this.chartSvg.nativeElement;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedDistance = Math.min(distance / rect.width * 2 * this.maxRadius, this.maxRadius);
    const value = Math.round(normalizedDistance / this.maxRadius * this.maxPoints);
    this.distribution[this.draggedStat] = Math.max(0, Math.min(this.maxPoints, value));
    this.distributionChange.emit(__spreadValues({}, this.distribution));
  }
  get totalPoints() {
    return Object.values(this.distribution).reduce((sum, val) => sum + val, 0);
  }
  getStatValue(key) {
    return this.distribution[key];
  }
  // Get point position based on value
  getPointX(stat) {
    const value = this.distribution[stat.key];
    const radius = value / this.maxPoints * this.maxRadius;
    return this.getAxisX(stat.angle, radius);
  }
  getPointY(stat) {
    const value = this.distribution[stat.key];
    const radius = value / this.maxPoints * this.maxRadius;
    return this.getAxisY(stat.angle, radius);
  }
  // Get axis end point
  getAxisX(angle, radius) {
    return 200 + radius * Math.sin(angle * Math.PI / 180);
  }
  getAxisY(angle, radius) {
    return 200 - radius * Math.cos(angle * Math.PI / 180);
  }
  // Get label position (outside the chart)
  getLabelX(angle) {
    return this.getAxisX(angle, 175);
  }
  getLabelY(angle) {
    return this.getAxisY(angle, 175);
  }
  getLabelDy(angle) {
    if (angle > -30 && angle < 30)
      return "0.3em";
    if (angle > 150 || angle < -150)
      return "0.3em";
    return "0.3em";
  }
  // Get value label position (next to point)
  getValueLabelX(stat) {
    const value = this.distribution[stat.key];
    const radius = value / this.maxPoints * this.maxRadius;
    return this.getAxisX(stat.angle, radius * 0.7);
  }
  getValueLabelY(stat) {
    const value = this.distribution[stat.key];
    const radius = value / this.maxPoints * this.maxRadius;
    return this.getAxisY(stat.angle, radius * 0.7);
  }
  // Get polygon points for the data shape
  getPolygonPoints() {
    return this.stats.map((stat) => {
      const x = this.getPointX(stat);
      const y = this.getPointY(stat);
      return `${x},${y}`;
    }).join(" ");
  }
  static \u0275fac = function SpiderChartComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SpiderChartComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SpiderChartComponent, selectors: [["app-spider-chart"]], viewQuery: function SpiderChartComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c03, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.chartSvg = _t.first);
    }
  }, inputs: { distribution: "distribution", maxPoints: "maxPoints" }, outputs: { distributionChange: "distributionChange" }, decls: 25, vars: 5, consts: [["chartSvg", ""], [1, "spider-chart-container"], ["width", "400", "height", "400", "viewBox", "0 0 400 400"], ["id", "chartGradient", "cx", "50%", "cy", "50%"], ["offset", "0%", 2, "stop-color", "#2a2a2a", "stop-opacity", "1"], ["offset", "100%", 2, "stop-color", "#1a1a1a", "stop-opacity", "1"], ["cx", "200", "cy", "200", "r", "190", "fill", "url(#chartGradient)", "stroke", "#333", "stroke-width", "2"], ["cx", "200", "cy", "200", "r", "38", "fill", "none", "stroke", "#333", "stroke-width", "1", "opacity", "0.3"], ["cx", "200", "cy", "200", "r", "76", "fill", "none", "stroke", "#333", "stroke-width", "1", "opacity", "0.3"], ["cx", "200", "cy", "200", "r", "114", "fill", "none", "stroke", "#333", "stroke-width", "1", "opacity", "0.3"], ["cx", "200", "cy", "200", "r", "152", "fill", "none", "stroke", "#333", "stroke-width", "1", "opacity", "0.3"], [1, "axes"], ["stroke", "#444", "stroke-width", "1"], ["stroke-width", "2"], [1, "data-points"], ["cx", "200", "cy", "200", "r", "4", "fill", "#666"], [1, "stat-summary"], [1, "stat-info"], [1, "highlight"], ["r", "8", "stroke", "#2d6e2f", "stroke-width", "2", 2, "cursor", "grab", 3, "mousedown", "touchstart"], ["text-anchor", "middle", "fill", "#aaa", "font-size", "14", "font-weight", "600", "pointer-events", "none"], ["text-anchor", "middle", "dy", "4", "fill", "#4CAF50", "font-size", "12", "font-weight", "700", "pointer-events", "none"]], template: function SpiderChartComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 1);
      \u0275\u0275namespaceSVG();
      \u0275\u0275domElementStart(1, "svg", 2, 0)(3, "defs")(4, "radialGradient", 3);
      \u0275\u0275domElement(5, "stop", 4)(6, "stop", 5);
      \u0275\u0275domElementEnd()();
      \u0275\u0275domElement(7, "circle", 6)(8, "circle", 7)(9, "circle", 8)(10, "circle", 9)(11, "circle", 10);
      \u0275\u0275domElementStart(12, "g", 11);
      \u0275\u0275repeaterCreate(13, SpiderChartComponent_For_14_Template, 1, 4, ":svg:line", 12, _forTrack05);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElement(15, "polygon", 13);
      \u0275\u0275domElementStart(16, "g", 14);
      \u0275\u0275repeaterCreate(17, SpiderChartComponent_For_18_Template, 6, 10, ":svg:g", null, _forTrack05);
      \u0275\u0275domElementEnd();
      \u0275\u0275domElement(19, "circle", 15);
      \u0275\u0275domElementEnd();
      \u0275\u0275namespaceHTML();
      \u0275\u0275domElementStart(20, "div", 16)(21, "div", 17);
      \u0275\u0275text(22, "Total Points: ");
      \u0275\u0275domElementStart(23, "span", 18);
      \u0275\u0275text(24);
      \u0275\u0275domElementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(13);
      \u0275\u0275repeater(ctx.stats);
      \u0275\u0275advance(2);
      \u0275\u0275attribute("points", ctx.getPolygonPoints())("fill", "rgba(76, 175, 80, 0.2)")("stroke", "#4CAF50");
      \u0275\u0275advance(2);
      \u0275\u0275repeater(ctx.stats);
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate2("", ctx.totalPoints, " / ", ctx.maxPoints);
    }
  }, dependencies: [CommonModule], styles: ["\n\n.spider-chart-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n}\nsvg[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  background: #0f0f0f;\n}\n.data-points[_ngcontent-%COMP%]   circle[_ngcontent-%COMP%]:hover {\n  r: 10;\n  filter: brightness(1.2);\n}\n.data-points[_ngcontent-%COMP%]   circle[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.stat-summary[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  font-size: 13px;\n  color: #888;\n}\n.stat-info[_ngcontent-%COMP%] {\n  background: #1a1a1a;\n  padding: 6px 12px;\n  border-radius: 4px;\n  border: 1px solid #333;\n}\n.highlight[_ngcontent-%COMP%] {\n  color: #4CAF50;\n  font-weight: 600;\n}\n/*# sourceMappingURL=spider-chart.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SpiderChartComponent, [{
    type: Component,
    args: [{ selector: "app-spider-chart", standalone: true, imports: [CommonModule], template: `
    <div class="spider-chart-container">
      <svg #chartSvg width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <radialGradient id="chartGradient" cx="50%" cy="50%">
            <stop offset="0%" style="stop-color:#2a2a2a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <circle cx="200" cy="200" r="190" fill="url(#chartGradient)" stroke="#333" stroke-width="2"/>
        
        <!-- Concentric circles (guides) -->
        <circle cx="200" cy="200" r="38" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="76" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="114" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="152" fill="none" stroke="#333" stroke-width="1" opacity="0.3"/>
        
        <!-- Axis lines -->
        <g class="axes">
          @for (stat of stats; track stat.key) {
            <line 
              [attr.x1]="200" 
              [attr.y1]="200"
              [attr.x2]="getAxisX(stat.angle, 152)"
              [attr.y2]="getAxisY(stat.angle, 152)"
              stroke="#444" 
              stroke-width="1"
            />
          }
        </g>
        
        <!-- Data polygon -->
        <polygon 
          [attr.points]="getPolygonPoints()"
          [attr.fill]="'rgba(76, 175, 80, 0.2)'"
          [attr.stroke]="'#4CAF50'"
          stroke-width="2"
        />
        
        <!-- Draggable points -->
        <g class="data-points">
          @for (stat of stats; track stat.key) {
            <g>
              <!-- Point circle -->
              <circle
                [attr.cx]="getPointX(stat)"
                [attr.cy]="getPointY(stat)"
                r="8"
                [attr.fill]="draggedStat === stat.key ? '#66BB6A' : '#4CAF50'"
                stroke="#2d6e2f"
                stroke-width="2"
                style="cursor: grab;"
                (mousedown)="startDrag($event, stat.key)"
                (touchstart)="startDragTouch($event, stat.key)"
              />
              
              <!-- Label -->
              <text
                [attr.x]="getLabelX(stat.angle)"
                [attr.y]="getLabelY(stat.angle)"
                text-anchor="middle"
                [attr.dy]="getLabelDy(stat.angle)"
                fill="#aaa"
                font-size="14"
                font-weight="600"
                pointer-events="none"
              >
                {{ stat.label }}
              </text>
              
              <!-- Value label -->
              <text
                [attr.x]="getValueLabelX(stat)"
                [attr.y]="getValueLabelY(stat)"
                text-anchor="middle"
                dy="4"
                fill="#4CAF50"
                font-size="12"
                font-weight="700"
                pointer-events="none"
              >
                {{ getStatValue(stat.key) }}
              </text>
            </g>
          }
        </g>
        
        <!-- Center dot -->
        <circle cx="200" cy="200" r="4" fill="#666"/>
      </svg>
      
      <div class="stat-summary">
        <div class="stat-info">Total Points: <span class="highlight">{{ totalPoints }} / {{ maxPoints }}</span></div>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;9767e34d04b3e3833b52d1c662c2e7827d8b36622391486e86f0784fd8f3529d;C:/Users/adermake/Documents/22FailApp/frontend/src/app/world/character-generator/spider-chart.component.ts */\n.spider-chart-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n}\nsvg {\n  border-radius: 8px;\n  background: #0f0f0f;\n}\n.data-points circle:hover {\n  r: 10;\n  filter: brightness(1.2);\n}\n.data-points circle:active {\n  cursor: grabbing;\n}\n.stat-summary {\n  display: flex;\n  gap: 16px;\n  font-size: 13px;\n  color: #888;\n}\n.stat-info {\n  background: #1a1a1a;\n  padding: 6px 12px;\n  border-radius: 4px;\n  border: 1px solid #333;\n}\n.highlight {\n  color: #4CAF50;\n  font-weight: 600;\n}\n/*# sourceMappingURL=spider-chart.component.css.map */\n"] }]
  }], null, { distribution: [{
    type: Input
  }], maxPoints: [{
    type: Input
  }], distributionChange: [{
    type: Output
  }], chartSvg: [{
    type: ViewChild,
    args: ["chartSvg"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SpiderChartComponent, { className: "SpiderChartComponent", filePath: "app/world/character-generator/spider-chart.component.ts", lineNumber: 164 });
})();

// src/app/world/character-generator/character-generator.component.ts
var _forTrack06 = ($index, $item) => $item.id;
function CharacterGeneratorComponent_For_39_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 18);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const race_r1 = ctx.$implicit;
    \u0275\u0275property("value", race_r1.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(race_r1.name);
  }
}
function CharacterGeneratorComponent_Conditional_60_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 30)(1, "span", 31);
    \u0275\u0275text(2, "Secondary:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 32);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.secondary_class);
  }
}
function CharacterGeneratorComponent_Conditional_60_Conditional_84_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r2.generatedCharacter.currency.platinum, "pp");
  }
}
function CharacterGeneratorComponent_Conditional_60_Conditional_85_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r2.generatedCharacter.currency.gold, "gp");
  }
}
function CharacterGeneratorComponent_Conditional_60_Conditional_86_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r2.generatedCharacter.currency.silver, "sp");
  }
}
function CharacterGeneratorComponent_Conditional_60_Conditional_87_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 36);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r2.generatedCharacter.currency.copper, "cp");
  }
}
function CharacterGeneratorComponent_Conditional_60_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "h3");
    \u0275\u0275text(1, "Generated Character");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 27)(3, "div", 28)(4, "h4");
    \u0275\u0275text(5, "Basic Info");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 29)(7, "div", 30)(8, "span", 31);
    \u0275\u0275text(9, "Name:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 32);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 30)(13, "span", 31);
    \u0275\u0275text(14, "Race:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span", 32);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 30)(18, "span", 31);
    \u0275\u0275text(19, "Level:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "span", 32);
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "div", 30)(23, "span", 31);
    \u0275\u0275text(24, "Age:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "span", 32);
    \u0275\u0275text(26);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "div", 30)(28, "span", 31);
    \u0275\u0275text(29, "Height:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "span", 32);
    \u0275\u0275text(31);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "div", 30)(33, "span", 31);
    \u0275\u0275text(34, "Alignment:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "span", 32);
    \u0275\u0275text(36);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(37, "div", 28)(38, "h4");
    \u0275\u0275text(39, "Classes");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "div", 30)(41, "span", 31);
    \u0275\u0275text(42, "Primary:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "span", 32);
    \u0275\u0275text(44);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(45, CharacterGeneratorComponent_Conditional_60_Conditional_45_Template, 5, 1, "div", 30);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(46, "div", 28)(47, "h4");
    \u0275\u0275text(48, "Stats");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "div", 33)(50, "div", 34);
    \u0275\u0275text(51);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(52, "div", 34);
    \u0275\u0275text(53);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "div", 34);
    \u0275\u0275text(55);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(56, "div", 34);
    \u0275\u0275text(57);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(58, "div", 34);
    \u0275\u0275text(59);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(60, "div", 34);
    \u0275\u0275text(61);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(62, "div", 28)(63, "h4");
    \u0275\u0275text(64, "Resources");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(65, "div", 30)(66, "span", 31);
    \u0275\u0275text(67, "Health:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(68, "span", 32);
    \u0275\u0275text(69);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(70, "div", 30)(71, "span", 31);
    \u0275\u0275text(72, "Mana:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(73, "span", 32);
    \u0275\u0275text(74);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(75, "div", 30)(76, "span", 31);
    \u0275\u0275text(77, "Energy:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(78, "span", 32);
    \u0275\u0275text(79);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(80, "div", 28)(81, "h4");
    \u0275\u0275text(82, "Wealth");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(83, "div", 35);
    \u0275\u0275conditionalCreate(84, CharacterGeneratorComponent_Conditional_60_Conditional_84_Template, 2, 1, "span", 36);
    \u0275\u0275conditionalCreate(85, CharacterGeneratorComponent_Conditional_60_Conditional_85_Template, 2, 1, "span", 36);
    \u0275\u0275conditionalCreate(86, CharacterGeneratorComponent_Conditional_60_Conditional_86_Template, 2, 1, "span", 36);
    \u0275\u0275conditionalCreate(87, CharacterGeneratorComponent_Conditional_60_Conditional_87_Template, 2, 1, "span", 36);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(88, "div", 28)(89, "h4");
    \u0275\u0275text(90, "Learned Skills");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(91, "div", 37);
    \u0275\u0275text(92);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(93, "div", 38)(94, "button", 39);
    \u0275\u0275listener("click", function CharacterGeneratorComponent_Conditional_60_Template_button_click_94_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.rerollAll());
    });
    \u0275\u0275text(95, " \u{1F504} Reroll All ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(96, "button", 40);
    \u0275\u0275listener("click", function CharacterGeneratorComponent_Conditional_60_Template_button_click_96_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.saveCharacter());
    });
    \u0275\u0275text(97, " \u{1F4BE} Save Character ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(11);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.name);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.race);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.level);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.age);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1("", ctx_r2.generatedCharacter.size, "cm");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.alignment);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(ctx_r2.generatedCharacter.primary_class);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.generatedCharacter.secondary_class ? 45 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate1("STR: ", ctx_r2.generatedCharacter.strength.base);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("DEX: ", ctx_r2.generatedCharacter.dexterity.base);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("SPD: ", ctx_r2.generatedCharacter.speed.base);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("INT: ", ctx_r2.generatedCharacter.intelligence.base);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("WIL: ", ctx_r2.generatedCharacter.chill.base);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("CON: ", ctx_r2.generatedCharacter.constitution.base);
    \u0275\u0275advance(8);
    \u0275\u0275textInterpolate(ctx_r2.getStatusValue(ctx_r2.generatedCharacter, ctx_r2.FormulaType.LIFE));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.getStatusValue(ctx_r2.generatedCharacter, ctx_r2.FormulaType.MANA));
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r2.getStatusValue(ctx_r2.generatedCharacter, ctx_r2.FormulaType.ENERGY));
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx_r2.generatedCharacter.currency.platinum > 0 ? 84 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.generatedCharacter.currency.gold > 0 ? 85 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.generatedCharacter.currency.silver > 0 ? 86 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.generatedCharacter.currency.copper > 0 ? 87 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r2.generatedCharacter.learnedSkillIds.length, " skills learned ");
  }
}
function CharacterGeneratorComponent_Conditional_61_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26)(1, "p");
    \u0275\u0275text(2, '\u{1F446} Configure parameters and click "Generate Character" to preview');
    \u0275\u0275elementEnd()();
  }
}
var CharacterGeneratorComponent = class _CharacterGeneratorComponent {
  close = new EventEmitter();
  characterGenerated = new EventEmitter();
  http = inject(HttpClient);
  // Generation parameters
  level = 1;
  richness = 50;
  // 0-100 scale
  compassAngle = 90;
  // For compass selector
  characterName = "";
  // Available races from backend
  races = [];
  selectedRaceId = "";
  // Generated character
  generatedCharacter = null;
  // Stat distribution (spider chart)
  statDistribution = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    chill: 0,
    constitution: 0
  };
  ngOnInit() {
    this.loadRaces();
    this.generateRandomName();
  }
  get statPoints() {
    return Math.floor(this.level / 3);
  }
  loadRaces() {
    this.http.get("/api/races").subscribe({
      next: (races) => {
        this.races = races;
        if (races.length > 0 && !this.selectedRaceId) {
          this.selectedRaceId = races[0].id;
        }
      },
      error: (err) => {
        console.error("Failed to load races:", err);
        this.races = [
          { id: "human", name: "Human", stats: { strength: 10, dexterity: 10, speed: 10, intelligence: 10, chill: 10, constitution: 10 } }
        ];
        this.selectedRaceId = "human";
      }
    });
  }
  onAngleChange(angle) {
    this.compassAngle = angle;
  }
  onDistributionChange(distribution) {
    this.statDistribution = distribution;
  }
  onLevelChange() {
    if (this.generatedCharacter) {
      this.generateCharacter();
    }
  }
  randomizeRace() {
    if (this.races.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.races.length);
      this.selectedRaceId = this.races[randomIndex].id;
    }
  }
  generateRandomName() {
    this.characterName = this.generateName();
  }
  // Main generation function
  generateCharacter() {
    const character = createEmptySheet();
    character.name = this.characterName || this.generateName();
    const selectedRace = this.races.find((r) => r.id === this.selectedRaceId);
    if (selectedRace) {
      character.race = selectedRace.name;
      character.raceId = selectedRace.id;
      character.strength.base = selectedRace.baseStrength || 10;
      character.dexterity.base = selectedRace.baseDexterity || 10;
      character.speed.base = selectedRace.baseSpeed || 10;
      character.intelligence.base = selectedRace.baseIntelligence || 10;
      character.chill.base = selectedRace.baseChill || 10;
      character.constitution.base = selectedRace.baseConstitution || 10;
    } else {
      character.race = "Human";
      character.raceId = "human";
      character.strength.base = 10;
      character.dexterity.base = 10;
      character.speed.base = 10;
      character.intelligence.base = 10;
      character.chill.base = 10;
      character.constitution.base = 10;
    }
    const levelStatPoints = this.statPoints;
    if (levelStatPoints > 0) {
      const totalDistribution = Object.values(this.statDistribution).reduce((a, b) => a + b, 0);
      if (totalDistribution > 0) {
        const factor = levelStatPoints / totalDistribution;
        character.strength.base += Math.floor(this.statDistribution.strength * factor);
        character.dexterity.base += Math.floor(this.statDistribution.dexterity * factor);
        character.speed.base += Math.floor(this.statDistribution.speed * factor);
        character.intelligence.base += Math.floor(this.statDistribution.intelligence * factor);
        character.chill.base += Math.floor(this.statDistribution.chill * factor);
        character.constitution.base += Math.floor(this.statDistribution.constitution * factor);
      }
    }
    character.age = this.generateAge();
    character.size = this.generateHeight().toString() + "cm";
    character.alignment = this.generateAlignment();
    character.level = this.level;
    character.talentPoints = this.calculateTotalTalentPoints(this.level);
    const learnedSkills = this.traverseTalentTree(character.talentPoints);
    character.learnedSkillIds = learnedSkills;
    const topClasses = this.determineTopClasses(learnedSkills);
    character.primary_class = topClasses[0] || "Magier";
    character.secondary_class = topClasses[1] || "";
    character.learned_classes = topClasses.join(", ");
    this.generateWealth(character);
    this.initializeStatuses(character);
    this.generatedCharacter = character;
  }
  // Talent tree traversal with directional preference and 50% progression rule
  traverseTalentTree(talentPoints) {
    const learnedSkillIds = [];
    if (talentPoints <= 0) {
      return learnedSkillIds;
    }
    const tier1Classes = Object.entries(CLASS_DEFINITIONS).filter(([_, info]) => info.tier === 1).map(([name, _]) => name);
    let currentClass = this.chooseClassByAngle(tier1Classes);
    const classProgress = /* @__PURE__ */ new Map();
    let remainingPoints = talentPoints;
    let lastClass = "";
    let stuckCount = 0;
    while (remainingPoints > 0 && stuckCount < 100) {
      const classSkills = getSkillsForClass(currentClass);
      const learnedInClass = classProgress.get(currentClass) || 0;
      const totalSkills = classSkills.length;
      const progressionThreshold = Math.ceil(totalSkills / 2);
      const shouldTryProgress = learnedInClass >= progressionThreshold;
      if (classSkills.length > 0 && remainingPoints > 0 && !shouldTryProgress) {
        const affordableUnlearnedSkills = classSkills.filter((s) => {
          if (learnedSkillIds.includes(s.id))
            return false;
          const cost = this.getSkillTPCost(s);
          return remainingPoints >= cost;
        });
        if (affordableUnlearnedSkills.length > 0) {
          const randomSkill = affordableUnlearnedSkills[Math.floor(Math.random() * affordableUnlearnedSkills.length)];
          const cost = this.getSkillTPCost(randomSkill);
          learnedSkillIds.push(randomSkill.id);
          classProgress.set(currentClass, learnedInClass + 1);
          remainingPoints -= cost;
          stuckCount = 0;
          continue;
        }
      }
      const classInfo = CLASS_DEFINITIONS[currentClass];
      if (shouldTryProgress && classInfo && classInfo.children.length > 0) {
        const eligibleChildren = classInfo.children.map((c) => c.className).filter((childClass) => {
          const childSkills = getSkillsForClass(childClass);
          return childSkills.some((s) => !learnedSkillIds.includes(s.id));
        });
        if (eligibleChildren.length > 0) {
          currentClass = this.chooseClassByAngle(eligibleChildren);
          continue;
        }
      }
      const allClasses = Object.keys(CLASS_DEFINITIONS);
      const availableClasses = allClasses.filter((c) => {
        const skills = getSkillsForClass(c);
        return skills.some((s) => !learnedSkillIds.includes(s.id));
      });
      if (availableClasses.length > 0) {
        const unexploredClasses = availableClasses.filter((c) => {
          const total = getSkillsForClass(c).length;
          const learned = classProgress.get(c) || 0;
          return learned < Math.ceil(total / 2);
        });
        if (unexploredClasses.length > 0) {
          currentClass = this.chooseClassByAngle(unexploredClasses);
        } else {
          currentClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        }
      } else {
        break;
      }
      if (currentClass === lastClass) {
        stuckCount++;
      } else {
        stuckCount = 0;
      }
      lastClass = currentClass;
    }
    return learnedSkillIds;
  }
  // Choose class closest to compass angle
  chooseClassByAngle(classNames) {
    if (classNames.length === 0) {
      return "Magier";
    }
    if (classNames.length === 1) {
      return classNames[0];
    }
    const targetAngle = this.compassAngle;
    let bestClass = classNames[0];
    let bestDifference = 360;
    for (const className of classNames) {
      const classInfo = CLASS_DEFINITIONS[className];
      if (classInfo) {
        const angleDiff = Math.abs(this.normalizeAngle(classInfo.angle - targetAngle));
        if (angleDiff < bestDifference) {
          bestDifference = angleDiff;
          bestClass = className;
        }
      }
    }
    return bestClass;
  }
  // Normalize angle to -180 to 180 range
  normalizeAngle(angle) {
    while (angle > 180)
      angle -= 360;
    while (angle < -180)
      angle += 360;
    return angle;
  }
  /** Total Fähigkeitspunkte at a level — shared with the skill tree. */
  calculateTotalTalentPoints(level) {
    return totalTalentPointsAtLevel(level);
  }
  /**
   * Get the talent point cost to learn a skill based on its class tier.
   * Tier 1-2: 1 TP, Tier 3-4: 2 TP, Tier 5: 3 TP
   */
  getSkillTPCost(skill) {
    return talentPointCostForSkill(skill);
  }
  // Determine top 2 classes based on learned skills
  determineTopClasses(learnedSkillIds) {
    const classSkillCounts = /* @__PURE__ */ new Map();
    for (const skillId of learnedSkillIds) {
      const skill = getSkillById(skillId);
      if (skill) {
        const count = classSkillCounts.get(skill.class) || 0;
        classSkillCounts.set(skill.class, count + 1);
      }
    }
    const sortedClasses = Array.from(classSkillCounts.entries()).sort((a, b) => b[1] - a[1]).map(([className, _]) => className);
    return sortedClasses.slice(0, 2);
  }
  // Generate random name
  generateName() {
    const prefixes = ["Ald", "Bel", "Cor", "Dra", "El", "Fen", "Gar", "Hal", "Ith", "Jor", "Kal", "Lor", "Mor", "Nar", "Oth", "Pel", "Qua", "Ren", "Sal", "Tar", "Ul", "Val", "Wen", "Xan", "Yor", "Zel"];
    const suffixes = ["dor", "wen", "ric", "ton", "mar", "lyn", "wyn", "dil", "ran", "mir", "din", "thor", "win", "gor", "ros", "lan", "mon", "dar", "fin", "kan"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + suffix;
  }
  // Generate random age (18-80)
  generateAge() {
    return 18 + Math.floor(Math.random() * 63);
  }
  // Generate random height (140-200cm)
  generateHeight() {
    return 140 + Math.floor(Math.random() * 61);
  }
  // Generate random alignment
  generateAlignment() {
    const alignments = [
      "Lawful Good",
      "Neutral Good",
      "Chaotic Good",
      "Lawful Neutral",
      "True Neutral",
      "Chaotic Neutral",
      "Lawful Evil",
      "Neutral Evil",
      "Chaotic Evil"
    ];
    return alignments[Math.floor(Math.random() * alignments.length)];
  }
  // Generate wealth based on richness setting
  generateWealth(character) {
    const baseWealth = this.level * 100;
    const richnessFactor = 0.1 + this.richness / 100 * 1.9;
    const totalCopper = Math.floor(baseWealth * richnessFactor);
    character.currency.platinum = Math.floor(totalCopper / 1e6);
    character.currency.gold = Math.floor(totalCopper % 1e6 / 1e4);
    character.currency.silver = Math.floor(totalCopper % 1e4 / 100);
    character.currency.copper = totalCopper % 100;
  }
  // Initialize status values (health, mana, energy)
  initializeStatuses(character) {
    const lifeStatus = character.statuses.find((s) => s.formulaType === FormulaType.LIFE);
    const manaStatus = character.statuses.find((s) => s.formulaType === FormulaType.MANA);
    const energyStatus = character.statuses.find((s) => s.formulaType === FormulaType.ENERGY);
    if (lifeStatus) {
      lifeStatus.statusBase = 100 + character.constitution.base * 5;
      lifeStatus.statusCurrent = lifeStatus.statusBase;
    }
    if (manaStatus) {
      manaStatus.statusBase = 50 + character.intelligence.base * 3;
      manaStatus.statusCurrent = manaStatus.statusBase;
    }
    if (energyStatus) {
      const avgStat = (character.strength.base + character.dexterity.base + character.constitution.base) / 3;
      energyStatus.statusBase = 50 + Math.floor(avgStat * 2);
      energyStatus.statusCurrent = energyStatus.statusBase;
    }
  }
  // Reroll all (regenerate character)
  rerollAll() {
    this.generateCharacter();
  }
  // Save character
  saveCharacter() {
    if (this.generatedCharacter) {
      this.characterGenerated.emit(this.generatedCharacter);
    }
  }
  // Close modal
  closeModal() {
    this.close.emit();
  }
  // Helper methods for template
  getStatusValue(character, formulaType) {
    const status = character.statuses.find((s) => s.formulaType === formulaType);
    return status ? status.statusBase : 0;
  }
  // Export FormulaType for template use
  FormulaType = FormulaType;
  static \u0275fac = function CharacterGeneratorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CharacterGeneratorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CharacterGeneratorComponent, selectors: [["app-character-generator"]], outputs: { close: "close", characterGenerated: "characterGenerated" }, decls: 62, vars: 11, consts: [[1, "generator-overlay", 3, "click"], [1, "generator-modal", 3, "click"], [1, "modal-header"], [1, "app-icon", "i-effektivity"], [1, "close-btn", 3, "click"], [1, "modal-content"], [1, "parameters-panel"], [1, "param-group"], [1, "name-input-group"], ["type", "text", "placeholder", "Enter name...", 1, "name-input", 3, "ngModelChange", "ngModel"], ["title", "Random Name", 1, "random-btn", 3, "click"], [1, "app-icon", "i-dice"], ["type", "number", "min", "1", "max", "100", 1, "level-input", 3, "ngModelChange", "ngModel"], [1, "param-info"], ["type", "range", "min", "0", "max", "100", 1, "richness-slider", 3, "ngModelChange", "ngModel"], [1, "race-selector"], [1, "race-dropdown", 3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], [1, "random-btn", 3, "click"], [1, "compass-wrapper"], [3, "angleChange", "angle"], [1, "spider-wrapper"], [3, "distributionChange", "distribution", "maxPoints"], [1, "generate-btn", 3, "click"], [1, "preview-panel"], [1, "no-preview"], [1, "character-preview"], [1, "preview-section"], [1, "info-grid"], [1, "info-item"], [1, "info-label"], [1, "info-value"], [1, "stats-grid"], [1, "stat-preview"], [1, "currency-display"], [1, "currency-item"], [1, "skills-summary"], [1, "action-buttons"], [1, "reroll-btn", 3, "click"], [1, "save-btn", 3, "click"]], template: function CharacterGeneratorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0);
      \u0275\u0275listener("click", function CharacterGeneratorComponent_Template_div_click_0_listener() {
        return ctx.closeModal();
      });
      \u0275\u0275elementStart(1, "div", 1);
      \u0275\u0275listener("click", function CharacterGeneratorComponent_Template_div_click_1_listener($event) {
        return $event.stopPropagation();
      });
      \u0275\u0275elementStart(2, "div", 2)(3, "h2");
      \u0275\u0275element(4, "span", 3);
      \u0275\u0275text(5, " Character Generator");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "button", 4);
      \u0275\u0275listener("click", function CharacterGeneratorComponent_Template_button_click_6_listener() {
        return ctx.closeModal();
      });
      \u0275\u0275text(7, "\u2715");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "div", 5)(9, "div", 6)(10, "h3");
      \u0275\u0275text(11, "Generation Parameters");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "div", 7)(13, "label");
      \u0275\u0275text(14, "Character Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "div", 8)(16, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function CharacterGeneratorComponent_Template_input_ngModelChange_16_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.characterName, $event) || (ctx.characterName = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "button", 10);
      \u0275\u0275listener("click", function CharacterGeneratorComponent_Template_button_click_17_listener() {
        return ctx.generateRandomName();
      });
      \u0275\u0275element(18, "span", 11);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(19, "div", 7)(20, "label");
      \u0275\u0275text(21, "Level");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "input", 12);
      \u0275\u0275twoWayListener("ngModelChange", function CharacterGeneratorComponent_Template_input_ngModelChange_22_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.level, $event) || (ctx.level = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function CharacterGeneratorComponent_Template_input_ngModelChange_22_listener() {
        return ctx.onLevelChange();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "span", 13);
      \u0275\u0275text(24);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 7)(26, "label");
      \u0275\u0275text(27, "Richness");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "input", 14);
      \u0275\u0275twoWayListener("ngModelChange", function CharacterGeneratorComponent_Template_input_ngModelChange_28_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.richness, $event) || (ctx.richness = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "span", 13);
      \u0275\u0275text(30);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(31, "div", 7)(32, "label");
      \u0275\u0275text(33, "Race");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "div", 15)(35, "select", 16);
      \u0275\u0275twoWayListener("ngModelChange", function CharacterGeneratorComponent_Template_select_ngModelChange_35_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.selectedRaceId, $event) || (ctx.selectedRaceId = $event);
        return $event;
      });
      \u0275\u0275elementStart(36, "option", 17);
      \u0275\u0275text(37, "Select Race...");
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(38, CharacterGeneratorComponent_For_39_Template, 2, 2, "option", 18, _forTrack06);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "button", 19);
      \u0275\u0275listener("click", function CharacterGeneratorComponent_Template_button_click_40_listener() {
        return ctx.randomizeRace();
      });
      \u0275\u0275element(41, "span", 11);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(42, "div", 7)(43, "label");
      \u0275\u0275text(44, "Class Preference Direction");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "div", 20)(46, "app-compass-selector", 21);
      \u0275\u0275listener("angleChange", function CharacterGeneratorComponent_Template_app_compass_selector_angleChange_46_listener($event) {
        return ctx.onAngleChange($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(47, "span", 13);
      \u0275\u0275text(48, "Guides your advancement through the skill tree");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(49, "div", 7)(50, "label");
      \u0275\u0275text(51, "Stat Distribution");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "div", 22)(53, "app-spider-chart", 23);
      \u0275\u0275listener("distributionChange", function CharacterGeneratorComponent_Template_app_spider_chart_distributionChange_53_listener($event) {
        return ctx.onDistributionChange($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(54, "span", 13);
      \u0275\u0275text(55, "Drag points to shape your character's strengths");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(56, "button", 24);
      \u0275\u0275listener("click", function CharacterGeneratorComponent_Template_button_click_56_listener() {
        return ctx.generateCharacter();
      });
      \u0275\u0275element(57, "span", 11);
      \u0275\u0275text(58, " Generate Character ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(59, "div", 25);
      \u0275\u0275conditionalCreate(60, CharacterGeneratorComponent_Conditional_60_Template, 98, 22)(61, CharacterGeneratorComponent_Conditional_61_Template, 3, 0, "div", 26);
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(16);
      \u0275\u0275twoWayProperty("ngModel", ctx.characterName);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.level);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("FP: ", ctx.calculateTotalTalentPoints(ctx.level), " | Stat Punkte: ", ctx.statPoints);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.richness);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1("", ctx.richness, "%");
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.selectedRaceId);
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.races);
      \u0275\u0275advance(8);
      \u0275\u0275property("angle", ctx.compassAngle);
      \u0275\u0275advance(7);
      \u0275\u0275property("distribution", ctx.statDistribution)("maxPoints", 10);
      \u0275\u0275advance(7);
      \u0275\u0275conditional(ctx.generatedCharacter ? 60 : 61);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, RangeValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel, CompassSelectorComponent, SpiderChartComponent], styles: ["\n\n.generator-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 10000;\n  padding: 20px;\n}\n.generator-modal[_ngcontent-%COMP%] {\n  background: #1e1e1e;\n  border-radius: 8px;\n  width: 90%;\n  max-width: 1200px;\n  max-height: 90vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);\n  color: #e0e0e0;\n}\n.modal-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 20px 24px;\n  border-bottom: 1px solid #333;\n}\n.modal-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 24px;\n  color: #fff;\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 24px;\n  color: #999;\n  cursor: pointer;\n  padding: 0;\n  width: 32px;\n  height: 32px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  transition: all 0.2s;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  background: #333;\n  color: #fff;\n}\n.modal-content[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 400px 1fr;\n  gap: 24px;\n  padding: 24px;\n  overflow-y: auto;\n  flex: 1;\n}\n.parameters-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n.parameters-panel[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  font-size: 18px;\n  color: #fff;\n  border-bottom: 2px solid #4CAF50;\n  padding-bottom: 8px;\n}\n.param-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.param-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 14px;\n  color: #aaa;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.param-info[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #888;\n  font-style: italic;\n}\n.name-input-group[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.name-input[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 8px 12px;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  font-size: 16px;\n  font-weight: 500;\n}\n.level-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 8px 12px;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  font-size: 16px;\n}\n.level-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #4CAF50;\n}\n.richness-slider[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 8px;\n  border-radius: 4px;\n  background: #333;\n  outline: none;\n  -webkit-appearance: none;\n}\n.richness-slider[_ngcontent-%COMP%]::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #4CAF50;\n  cursor: pointer;\n}\n.richness-slider[_ngcontent-%COMP%]::-moz-range-thumb {\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #4CAF50;\n  cursor: pointer;\n  border: none;\n}\n.race-selector[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.race-dropdown[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 8px 12px;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  font-size: 14px;\n}\n.race-dropdown[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #4CAF50;\n}\n.random-btn[_ngcontent-%COMP%] {\n  padding: 8px 16px;\n  background: #3949AB;\n  border: none;\n  border-radius: 4px;\n  color: #fff;\n  cursor: pointer;\n  font-size: 18px;\n  transition: background 0.2s;\n}\n.random-btn[_ngcontent-%COMP%]:hover {\n  background: #4f5db8;\n}\n.compass-wrapper[_ngcontent-%COMP%], \n.spider-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 12px;\n  background: #0f0f0f;\n  border-radius: 8px;\n  border: 1px solid #333;\n}\n.generate-btn[_ngcontent-%COMP%] {\n  padding: 14px 24px;\n  background:\n    linear-gradient(\n      135deg,\n      #4CAF50,\n      #45a049);\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);\n  margin-top: auto;\n}\n.generate-btn[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);\n}\n.preview-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.preview-panel[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  font-size: 18px;\n  color: #fff;\n  border-bottom: 2px solid #2196F3;\n  padding-bottom: 8px;\n}\n.no-preview[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  text-align: center;\n  color: #666;\n  font-size: 16px;\n}\n.character-preview[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  flex: 1;\n  overflow-y: auto;\n  padding-right: 8px;\n}\n.preview-section[_ngcontent-%COMP%] {\n  background: #2a2a2a;\n  padding: 16px;\n  border-radius: 4px;\n  border-left: 3px solid #2196F3;\n}\n.preview-section[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0 0 12px 0;\n  font-size: 14px;\n  color: #aaa;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.info-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 8px;\n}\n.info-item[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n.info-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #888;\n  min-width: 80px;\n}\n.info-value[_ngcontent-%COMP%] {\n  color: #fff;\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.stat-preview[_ngcontent-%COMP%] {\n  background: #333;\n  padding: 8px 12px;\n  border-radius: 4px;\n  text-align: center;\n  font-weight: 600;\n  color: #4CAF50;\n}\n.currency-display[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.currency-item[_ngcontent-%COMP%] {\n  background: #333;\n  padding: 6px 12px;\n  border-radius: 4px;\n  font-weight: 600;\n  color: #FFD700;\n}\n.skills-summary[_ngcontent-%COMP%] {\n  color: #888;\n  font-style: italic;\n}\n.action-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  margin-top: auto;\n  padding-top: 16px;\n  border-top: 1px solid #333;\n}\n.reroll-btn[_ngcontent-%COMP%], \n.save-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 4px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.reroll-btn[_ngcontent-%COMP%] {\n  background: #FF9800;\n  color: #fff;\n}\n.reroll-btn[_ngcontent-%COMP%]:hover {\n  background: #FB8C00;\n  transform: translateY(-1px);\n}\n.save-btn[_ngcontent-%COMP%] {\n  background: #4CAF50;\n  color: #fff;\n}\n.save-btn[_ngcontent-%COMP%]:hover {\n  background: #45a049;\n  transform: translateY(-1px);\n}\n@media (max-width: 1024px) {\n  .modal-content[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n  .generator-modal[_ngcontent-%COMP%] {\n    width: 95%;\n    max-height: 95vh;\n  }\n}\n/*# sourceMappingURL=character-generator.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CharacterGeneratorComponent, [{
    type: Component,
    args: [{ selector: "app-character-generator", standalone: true, imports: [CommonModule, FormsModule, CompassSelectorComponent, SpiderChartComponent], template: `<div class="generator-overlay" (click)="closeModal()">\r
  <div class="generator-modal" (click)="$event.stopPropagation()">\r
    <div class="modal-header">\r
      <h2><span class="app-icon i-effektivity"></span> Character Generator</h2>\r
      <button class="close-btn" (click)="closeModal()">\u2715</button>\r
    </div>\r
\r
    <div class="modal-content">\r
      <!-- Left Panel: Generation Parameters -->\r
      <div class="parameters-panel">\r
        <h3>Generation Parameters</h3>\r
\r
        <!-- Character Name -->\r
        <div class="param-group">\r
          <label>Character Name</label>\r
          <div class="name-input-group">\r
            <input \r
              type="text" \r
              [(ngModel)]="characterName" \r
              placeholder="Enter name..."\r
              class="name-input"\r
            />\r
            <button (click)="generateRandomName()" class="random-btn" title="Random Name">\r
              <span class="app-icon i-dice"></span>\r
            </button>\r
          </div>\r
        </div>\r
\r
        <!-- Level Input -->\r
        <div class="param-group">\r
          <label>Level</label>\r
          <input \r
            type="number" \r
            [(ngModel)]="level" \r
            (ngModelChange)="onLevelChange()"\r
            min="1" \r
            max="100"\r
            class="level-input"\r
          />\r
          <span class="param-info">FP: {{ calculateTotalTalentPoints(level) }} | Stat Punkte: {{ statPoints }}</span>\r
        </div>\r
\r
        <!-- Richness Slider -->\r
        <div class="param-group">\r
          <label>Richness</label>\r
          <input \r
            type="range" \r
            [(ngModel)]="richness" \r
            min="0" \r
            max="100"\r
            class="richness-slider"\r
          />\r
          <span class="param-info">{{ richness }}%</span>\r
        </div>\r
\r
        <!-- Race Selection -->\r
        <div class="param-group">\r
          <label>Race</label>\r
          <div class="race-selector">\r
            <select [(ngModel)]="selectedRaceId" class="race-dropdown">\r
              <option value="">Select Race...</option>\r
              @for (race of races; track race.id) {\r
                <option [value]="race.id">{{ race.name }}</option>\r
              }\r
            </select>\r
            <button (click)="randomizeRace()" class="random-btn"><span class="app-icon i-dice"></span></button>\r
          </div>\r
        </div>\r
\r
        <!-- Compass Direction Selector -->\r
        <div class="param-group">\r
          <label>Class Preference Direction</label>\r
          <div class="compass-wrapper">\r
            <app-compass-selector\r
              [angle]="compassAngle"\r
              (angleChange)="onAngleChange($event)"\r
            />\r
          </div>\r
          <span class="param-info">Guides your advancement through the skill tree</span>\r
        </div>\r
\r
        <!-- Stat Distribution Spider Chart -->\r
        <div class="param-group">\r
          <label>Stat Distribution</label>\r
          <div class="spider-wrapper">\r
            <app-spider-chart\r
              [distribution]="statDistribution"\r
              [maxPoints]="10"\r
              (distributionChange)="onDistributionChange($event)"\r
            />\r
          </div>\r
          <span class="param-info">Drag points to shape your character's strengths</span>\r
        </div>\r
\r
        <!-- Generate Button -->\r
        <button (click)="generateCharacter()" class="generate-btn">\r
          <span class="app-icon i-dice"></span> Generate Character\r
        </button>\r
      </div>\r
\r
      <!-- Right Panel: Preview -->\r
      <div class="preview-panel">\r
        @if (generatedCharacter) {\r
          <h3>Generated Character</h3>\r
          \r
          <div class="character-preview">\r
            <div class="preview-section">\r
              <h4>Basic Info</h4>\r
              <div class="info-grid">\r
                <div class="info-item">\r
                  <span class="info-label">Name:</span>\r
                  <span class="info-value">{{ generatedCharacter.name }}</span>\r
                </div>\r
                <div class="info-item">\r
                  <span class="info-label">Race:</span>\r
                  <span class="info-value">{{ generatedCharacter.race }}</span>\r
                </div>\r
                <div class="info-item">\r
                  <span class="info-label">Level:</span>\r
                  <span class="info-value">{{ generatedCharacter.level }}</span>\r
                </div>\r
                <div class="info-item">\r
                  <span class="info-label">Age:</span>\r
                  <span class="info-value">{{ generatedCharacter.age }}</span>\r
                </div>\r
                <div class="info-item">\r
                  <span class="info-label">Height:</span>\r
                  <span class="info-value">{{ generatedCharacter.size }}cm</span>\r
                </div>\r
                <div class="info-item">\r
                  <span class="info-label">Alignment:</span>\r
                  <span class="info-value">{{ generatedCharacter.alignment }}</span>\r
                </div>\r
              </div>\r
            </div>\r
\r
            <div class="preview-section">\r
              <h4>Classes</h4>\r
              <div class="info-item">\r
                <span class="info-label">Primary:</span>\r
                <span class="info-value">{{ generatedCharacter.primary_class }}</span>\r
              </div>\r
              @if (generatedCharacter.secondary_class) {\r
                <div class="info-item">\r
                  <span class="info-label">Secondary:</span>\r
                  <span class="info-value">{{ generatedCharacter.secondary_class }}</span>\r
                </div>\r
              }\r
            </div>\r
\r
            <div class="preview-section">\r
              <h4>Stats</h4>\r
              <div class="stats-grid">\r
                <div class="stat-preview">STR: {{ generatedCharacter.strength.base }}</div>\r
                <div class="stat-preview">DEX: {{ generatedCharacter.dexterity.base }}</div>\r
                <div class="stat-preview">SPD: {{ generatedCharacter.speed.base }}</div>\r
                <div class="stat-preview">INT: {{ generatedCharacter.intelligence.base }}</div>\r
                <div class="stat-preview">WIL: {{ generatedCharacter.chill.base }}</div>\r
                <div class="stat-preview">CON: {{ generatedCharacter.constitution.base }}</div>\r
              </div>\r
            </div>\r
\r
            <div class="preview-section">\r
              <h4>Resources</h4>\r
              <div class="info-item">\r
                <span class="info-label">Health:</span>\r
                <span class="info-value">{{ getStatusValue(generatedCharacter, FormulaType.LIFE) }}</span>\r
              </div>\r
              <div class="info-item">\r
                <span class="info-label">Mana:</span>\r
                <span class="info-value">{{ getStatusValue(generatedCharacter, FormulaType.MANA) }}</span>\r
              </div>\r
              <div class="info-item">\r
                <span class="info-label">Energy:</span>\r
                <span class="info-value">{{ getStatusValue(generatedCharacter, FormulaType.ENERGY) }}</span>\r
              </div>\r
            </div>\r
\r
            <div class="preview-section">\r
              <h4>Wealth</h4>\r
              <div class="currency-display">\r
                @if (generatedCharacter.currency.platinum > 0) {\r
                  <span class="currency-item">{{ generatedCharacter.currency.platinum }}pp</span>\r
                }\r
                @if (generatedCharacter.currency.gold > 0) {\r
                  <span class="currency-item">{{ generatedCharacter.currency.gold }}gp</span>\r
                }\r
                @if (generatedCharacter.currency.silver > 0) {\r
                  <span class="currency-item">{{ generatedCharacter.currency.silver }}sp</span>\r
                }\r
                @if (generatedCharacter.currency.copper > 0) {\r
                  <span class="currency-item">{{ generatedCharacter.currency.copper }}cp</span>\r
                }\r
              </div>\r
            </div>\r
\r
            <div class="preview-section">\r
              <h4>Learned Skills</h4>\r
              <div class="skills-summary">\r
                {{ generatedCharacter.learnedSkillIds.length }} skills learned\r
              </div>\r
            </div>\r
          </div>\r
\r
          <!-- Action Buttons -->\r
          <div class="action-buttons">\r
            <button (click)="rerollAll()" class="reroll-btn">\r
              \u{1F504} Reroll All\r
            </button>\r
            <button (click)="saveCharacter()" class="save-btn">\r
              \u{1F4BE} Save Character\r
            </button>\r
          </div>\r
        } @else {\r
          <div class="no-preview">\r
            <p>\u{1F446} Configure parameters and click "Generate Character" to preview</p>\r
          </div>\r
        }\r
      </div>\r
    </div>\r
  </div>\r
</div>\r
`, styles: ["/* src/app/world/character-generator/character-generator.component.css */\n.generator-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0, 0, 0, 0.8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 10000;\n  padding: 20px;\n}\n.generator-modal {\n  background: #1e1e1e;\n  border-radius: 8px;\n  width: 90%;\n  max-width: 1200px;\n  max-height: 90vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);\n  color: #e0e0e0;\n}\n.modal-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 20px 24px;\n  border-bottom: 1px solid #333;\n}\n.modal-header h2 {\n  margin: 0;\n  font-size: 24px;\n  color: #fff;\n}\n.close-btn {\n  background: none;\n  border: none;\n  font-size: 24px;\n  color: #999;\n  cursor: pointer;\n  padding: 0;\n  width: 32px;\n  height: 32px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  transition: all 0.2s;\n}\n.close-btn:hover {\n  background: #333;\n  color: #fff;\n}\n.modal-content {\n  display: grid;\n  grid-template-columns: 400px 1fr;\n  gap: 24px;\n  padding: 24px;\n  overflow-y: auto;\n  flex: 1;\n}\n.parameters-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n.parameters-panel h3 {\n  margin: 0 0 12px 0;\n  font-size: 18px;\n  color: #fff;\n  border-bottom: 2px solid #4CAF50;\n  padding-bottom: 8px;\n}\n.param-group {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.param-group label {\n  font-weight: 600;\n  font-size: 14px;\n  color: #aaa;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.param-info {\n  font-size: 13px;\n  color: #888;\n  font-style: italic;\n}\n.name-input-group {\n  display: flex;\n  gap: 8px;\n}\n.name-input {\n  flex: 1;\n  padding: 8px 12px;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  font-size: 16px;\n  font-weight: 500;\n}\n.level-input {\n  width: 100%;\n  padding: 8px 12px;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  font-size: 16px;\n}\n.level-input:focus {\n  outline: none;\n  border-color: #4CAF50;\n}\n.richness-slider {\n  width: 100%;\n  height: 8px;\n  border-radius: 4px;\n  background: #333;\n  outline: none;\n  -webkit-appearance: none;\n}\n.richness-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #4CAF50;\n  cursor: pointer;\n}\n.richness-slider::-moz-range-thumb {\n  width: 20px;\n  height: 20px;\n  border-radius: 50%;\n  background: #4CAF50;\n  cursor: pointer;\n  border: none;\n}\n.race-selector {\n  display: flex;\n  gap: 8px;\n}\n.race-dropdown {\n  flex: 1;\n  padding: 8px 12px;\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  color: #fff;\n  font-size: 14px;\n}\n.race-dropdown:focus {\n  outline: none;\n  border-color: #4CAF50;\n}\n.random-btn {\n  padding: 8px 16px;\n  background: #3949AB;\n  border: none;\n  border-radius: 4px;\n  color: #fff;\n  cursor: pointer;\n  font-size: 18px;\n  transition: background 0.2s;\n}\n.random-btn:hover {\n  background: #4f5db8;\n}\n.compass-wrapper,\n.spider-wrapper {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 12px;\n  background: #0f0f0f;\n  border-radius: 8px;\n  border: 1px solid #333;\n}\n.generate-btn {\n  padding: 14px 24px;\n  background:\n    linear-gradient(\n      135deg,\n      #4CAF50,\n      #45a049);\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);\n  margin-top: auto;\n}\n.generate-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);\n}\n.preview-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n.preview-panel h3 {\n  margin: 0 0 12px 0;\n  font-size: 18px;\n  color: #fff;\n  border-bottom: 2px solid #2196F3;\n  padding-bottom: 8px;\n}\n.no-preview {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100%;\n  text-align: center;\n  color: #666;\n  font-size: 16px;\n}\n.character-preview {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  flex: 1;\n  overflow-y: auto;\n  padding-right: 8px;\n}\n.preview-section {\n  background: #2a2a2a;\n  padding: 16px;\n  border-radius: 4px;\n  border-left: 3px solid #2196F3;\n}\n.preview-section h4 {\n  margin: 0 0 12px 0;\n  font-size: 14px;\n  color: #aaa;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.info-grid {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 8px;\n}\n.info-item {\n  display: flex;\n  gap: 8px;\n}\n.info-label {\n  font-weight: 600;\n  color: #888;\n  min-width: 80px;\n}\n.info-value {\n  color: #fff;\n}\n.stats-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.stat-preview {\n  background: #333;\n  padding: 8px 12px;\n  border-radius: 4px;\n  text-align: center;\n  font-weight: 600;\n  color: #4CAF50;\n}\n.currency-display {\n  display: flex;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.currency-item {\n  background: #333;\n  padding: 6px 12px;\n  border-radius: 4px;\n  font-weight: 600;\n  color: #FFD700;\n}\n.skills-summary {\n  color: #888;\n  font-style: italic;\n}\n.action-buttons {\n  display: flex;\n  gap: 12px;\n  margin-top: auto;\n  padding-top: 16px;\n  border-top: 1px solid #333;\n}\n.reroll-btn,\n.save-btn {\n  flex: 1;\n  padding: 12px 24px;\n  border: none;\n  border-radius: 4px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.reroll-btn {\n  background: #FF9800;\n  color: #fff;\n}\n.reroll-btn:hover {\n  background: #FB8C00;\n  transform: translateY(-1px);\n}\n.save-btn {\n  background: #4CAF50;\n  color: #fff;\n}\n.save-btn:hover {\n  background: #45a049;\n  transform: translateY(-1px);\n}\n@media (max-width: 1024px) {\n  .modal-content {\n    grid-template-columns: 1fr;\n  }\n  .generator-modal {\n    width: 95%;\n    max-height: 95vh;\n  }\n}\n/*# sourceMappingURL=character-generator.component.css.map */\n"] }]
  }], null, { close: [{
    type: Output
  }], characterGenerated: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CharacterGeneratorComponent, { className: "CharacterGeneratorComponent", filePath: "app/world/character-generator/character-generator.component.ts", lineNumber: 20 });
})();

// src/app/world/world/world.component.ts
var _c04 = () => [];
var _forTrack07 = ($index, $item) => $item.id;
var _forTrack12 = ($index, $item) => $item.type;
var _forTrack22 = ($index, $item) => $item.statusEffectId + $item.appliedAt;
var _forTrack32 = ($index, $item) => $item.id ?? $item.name ?? $index;
var _forTrack42 = ($index, $item) => $item.material.id;
var _forTrack5 = ($index, $item) => $item.forgeTrait.id;
function WorldComponent_Conditional_0_For_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 11)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 14);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_For_18_Template_button_click_3_listener() {
      const \u0275$index_33_r3 = \u0275\u0275restoreView(_r2).$index;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.removeCharacter(\u0275$index_33_r3));
    });
    \u0275\u0275text(4, "Entfernen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const characterId_r5 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(characterId_r5);
  }
}
function WorldComponent_Conditional_0_For_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 18)(1, "span");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 14);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_For_31_Template_button_click_3_listener() {
      const \u0275$index_61_r7 = \u0275\u0275restoreView(_r6).$index;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.removeFromParty(\u0275$index_61_r7));
    });
    \u0275\u0275text(4, "Entfernen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const partyId_r8 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(partyId_r8);
  }
}
function WorldComponent_Conditional_0_For_37_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 44);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const characterId_r9 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("value", characterId_r9);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(characterId_r9);
  }
}
function WorldComponent_Conditional_0_For_37_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, WorldComponent_Conditional_0_For_37_Conditional_0_Template, 2, 2, "option", 44);
  }
  if (rf & 2) {
    const characterId_r9 = ctx.$implicit;
    const world_r10 = \u0275\u0275nextContext();
    \u0275\u0275conditional(!world_r10.partyIds.includes(characterId_r9) ? 0 : -1);
  }
}
function WorldComponent_Conditional_0_Conditional_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 22);
    \u0275\u0275text(1, "Keine Charaktere in der Partei. F\xFCge Charaktere hinzu um ihre Werte zu sehen.");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 48);
    \u0275\u0275element(1, "img", 73);
    \u0275\u0275pipe(2, "imageUrl");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const member_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("alt", \u0275\u0275interpolate(member_r12.sheet.name || member_r12.id))("src", \u0275\u0275pipeBind1(2, 3, member_r12.sheet.portrait), \u0275\u0275sanitizeUrl);
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 53);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const member_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(member_r12.sheet.primary_class);
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 54);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const member_r12 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(member_r12.sheet.secondary_class);
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_For_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 74);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const coin_r13 = ctx.$implicit;
    \u0275\u0275styleProp("--coin-color", coin_r13.color);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2(" ", coin_r13.amount, " ", coin_r13.symbol, " ");
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_For_42_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 77);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const active_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\xD7", active_r14.stacks);
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_For_42_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 78);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const active_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", active_r14.duration, "R");
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_For_42_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 75)(1, "span", 76);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, WorldComponent_Conditional_0_Conditional_44_For_2_For_42_Conditional_3_Template, 2, 1, "span", 77);
    \u0275\u0275conditionalCreate(4, WorldComponent_Conditional_0_Conditional_44_For_2_For_42_Conditional_4_Template, 2, 1, "span", 78);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const active_r14 = ctx.$implicit;
    const def_r15 = \u0275\u0275nextContext(4).getDashboardEffectDef(active_r14.statusEffectId);
    \u0275\u0275styleProp("--ec", (def_r15 == null ? null : def_r15.color) ?? "#8b5cf6");
    \u0275\u0275property("title", \u0275\u0275interpolate(active_r14.customName ?? (def_r15 == null ? null : def_r15.name) ?? active_r14.statusEffectId));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate((def_r15 == null ? null : def_r15.icon) ?? "\u2726");
    \u0275\u0275advance();
    \u0275\u0275conditional(active_r14.stacks && active_r14.stacks > 1 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(active_r14.duration !== void 0 && active_r14.duration !== null ? 4 : -1);
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 72);
    \u0275\u0275text(1, "\u2014");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_0_Conditional_44_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275listener("dragover", function WorldComponent_Conditional_0_Conditional_44_For_2_Template_div_dragover_0_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onDragOver($event));
    })("drop", function WorldComponent_Conditional_0_Conditional_44_For_2_Template_div_drop_0_listener($event) {
      const member_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.onDropOnCharacter($event, member_r12.id));
    })("dblclick", function WorldComponent_Conditional_0_Conditional_44_For_2_Template_div_dblclick_0_listener() {
      const member_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.openCharacterSheet(member_r12.id));
    })("contextmenu", function WorldComponent_Conditional_0_Conditional_44_For_2_Template_div_contextmenu_0_listener($event) {
      const member_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.handleCharacterRightClick($event, member_r12.id));
    });
    \u0275\u0275elementStart(1, "div", 47);
    \u0275\u0275conditionalCreate(2, WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_2_Template, 3, 5, "div", 48);
    \u0275\u0275elementStart(3, "div", 49)(4, "h3", 50);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 51)(7, "span", 52);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(9, WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_9_Template, 2, 1, "span", 53);
    \u0275\u0275conditionalCreate(10, WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_10_Template, 2, 1, "span", 54);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "div", 55)(12, "div", 56)(13, "span", 57);
    \u0275\u0275text(14, "Leben");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "div", 58);
    \u0275\u0275element(16, "div", 59);
    \u0275\u0275elementStart(17, "span", 60);
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(19, "div", 61)(20, "span", 57);
    \u0275\u0275text(21, "Ausdauer");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "div", 58);
    \u0275\u0275element(23, "div", 62);
    \u0275\u0275elementStart(24, "span", 60);
    \u0275\u0275text(25);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(26, "div", 63)(27, "span", 57);
    \u0275\u0275text(28, "Mana");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "div", 58);
    \u0275\u0275element(30, "div", 64);
    \u0275\u0275elementStart(31, "span", 60);
    \u0275\u0275text(32);
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(33, "div", 65);
    \u0275\u0275repeaterCreate(34, WorldComponent_Conditional_0_Conditional_44_For_2_For_35_Template, 2, 4, "span", 66, _forTrack12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "div", 67)(37, "div", 68)(38, "span", 69);
    \u0275\u0275text(39, "Effekte");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(40, "div", 70);
    \u0275\u0275repeaterCreate(41, WorldComponent_Conditional_0_Conditional_44_For_2_For_42_Template, 5, 7, "div", 71, _forTrack22);
    \u0275\u0275conditionalCreate(43, WorldComponent_Conditional_0_Conditional_44_For_2_Conditional_43_Template, 2, 0, "span", 72);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const member_r12 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(member_r12.sheet.portrait ? 2 : -1);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(member_r12.sheet.name || member_r12.id);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("Lvl ", member_r12.sheet.level || 1);
    \u0275\u0275advance();
    \u0275\u0275conditional(member_r12.sheet.primary_class ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(member_r12.sheet.secondary_class ? 10 : -1);
    \u0275\u0275advance(6);
    \u0275\u0275styleProp("width", ctx_r3.getResourcePercentage(member_r12.sheet, ctx_r3.FormulaType.LIFE), "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r3.getResourceCurrent(member_r12.sheet, ctx_r3.FormulaType.LIFE), " / ", ctx_r3.getResourceMax(member_r12.sheet, ctx_r3.FormulaType.LIFE));
    \u0275\u0275advance(5);
    \u0275\u0275styleProp("width", ctx_r3.getResourcePercentage(member_r12.sheet, ctx_r3.FormulaType.ENERGY), "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r3.getResourceCurrent(member_r12.sheet, ctx_r3.FormulaType.ENERGY), " / ", ctx_r3.getResourceMax(member_r12.sheet, ctx_r3.FormulaType.ENERGY));
    \u0275\u0275advance(5);
    \u0275\u0275styleProp("width", ctx_r3.getResourcePercentage(member_r12.sheet, ctx_r3.FormulaType.MANA), "%");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2("", ctx_r3.getResourceCurrent(member_r12.sheet, ctx_r3.FormulaType.MANA), " / ", ctx_r3.getResourceMax(member_r12.sheet, ctx_r3.FormulaType.MANA));
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.getCoinPartsForMember(member_r12.sheet));
    \u0275\u0275advance(7);
    \u0275\u0275repeater(ctx_r3.getDashboardActiveEffects(member_r12.id));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r3.getDashboardActiveEffects(member_r12.id).length === 0 ? 43 : -1);
  }
}
function WorldComponent_Conditional_0_Conditional_44_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 23);
    \u0275\u0275repeaterCreate(1, WorldComponent_Conditional_0_Conditional_44_For_2_Template, 44, 18, "div", 45, _forTrack07);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.getPartyCharacterArray());
  }
}
function WorldComponent_Conditional_0_Conditional_66_Template(rf, ctx) {
  if (rf & 1) {
    const _r16 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-item-editor", 79);
    \u0275\u0275listener("save", function WorldComponent_Conditional_0_Conditional_66_Template_app_item_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r16);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.createItem($event));
    })("cancel", function WorldComponent_Conditional_0_Conditional_66_Template_app_item_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r16);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.closeItemCreator());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const world_r10 = \u0275\u0275nextContext();
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("item", null)("sheet", ctx_r3.dummySheet)("librarySkills", world_r10.skillLibrary)("librarySpells", world_r10.spellLibrary)("showLibraryImport", true);
  }
}
function WorldComponent_Conditional_0_Conditional_67_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-item-editor", 80);
    \u0275\u0275listener("save", function WorldComponent_Conditional_0_Conditional_67_Template_app_item_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.updateItem(ctx_r3.editingItemIndex, { path: "", value: $event });
      return \u0275\u0275resetView(ctx_r3.closeItemEditor());
    })("cancel", function WorldComponent_Conditional_0_Conditional_67_Template_app_item_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.closeItemEditor());
    })("delete", function WorldComponent_Conditional_0_Conditional_67_Template_app_item_editor_delete_0_listener() {
      \u0275\u0275restoreView(_r17);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.removeItem(ctx_r3.editingItemIndex);
      return \u0275\u0275resetView(ctx_r3.closeItemEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const world_r10 = \u0275\u0275nextContext();
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("item", world_r10.itemLibrary[ctx_r3.editingItemIndex])("sheet", ctx_r3.dummySheet)("librarySkills", world_r10.skillLibrary)("librarySpells", world_r10.spellLibrary)("showLibraryImport", true);
  }
}
function WorldComponent_Conditional_0_Conditional_68_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-rune-editor", 81);
    \u0275\u0275listener("save", function WorldComponent_Conditional_0_Conditional_68_Template_app_rune_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.updateRune(ctx_r3.editingRuneIndex, { path: "", value: $event });
      return \u0275\u0275resetView(ctx_r3.closeRuneEditor());
    })("cancel", function WorldComponent_Conditional_0_Conditional_68_Template_app_rune_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r18);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.closeRuneEditor());
    })("delete", function WorldComponent_Conditional_0_Conditional_68_Template_app_rune_editor_delete_0_listener() {
      \u0275\u0275restoreView(_r18);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.removeRune(ctx_r3.editingRuneIndex);
      return \u0275\u0275resetView(ctx_r3.closeRuneEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const world_r10 = \u0275\u0275nextContext();
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("rune", world_r10.runeLibrary[ctx_r3.editingRuneIndex]);
  }
}
function WorldComponent_Conditional_0_Conditional_69_Template(rf, ctx) {
  if (rf & 1) {
    const _r19 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-skill-editor", 82);
    \u0275\u0275listener("save", function WorldComponent_Conditional_0_Conditional_69_Template_app_skill_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r19);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.updateSkill(ctx_r3.editingSkillIndex, { path: "", value: $event });
      return \u0275\u0275resetView(ctx_r3.closeSkillEditorDialog());
    })("cancel", function WorldComponent_Conditional_0_Conditional_69_Template_app_skill_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r19);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.closeSkillEditorDialog());
    })("delete", function WorldComponent_Conditional_0_Conditional_69_Template_app_skill_editor_delete_0_listener() {
      \u0275\u0275restoreView(_r19);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.removeSkill(ctx_r3.editingSkillIndex);
      return \u0275\u0275resetView(ctx_r3.closeSkillEditorDialog());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const world_r10 = \u0275\u0275nextContext();
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("skill", world_r10.skillLibrary[ctx_r3.editingSkillIndex]);
  }
}
function WorldComponent_Conditional_0_Conditional_70_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 89);
    \u0275\u0275text(1, "Papierkorb ist leer");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_0_Conditional_70_Conditional_12_For_2_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 96);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trashItem_r22 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", trashItem_r22.data.description, " ");
  }
}
function WorldComponent_Conditional_0_Conditional_70_Conditional_12_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 91)(1, "div", 92)(2, "div", 93)(3, "span", 94);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "strong");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 95);
    \u0275\u0275text(8);
    \u0275\u0275pipe(9, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(10, WorldComponent_Conditional_0_Conditional_70_Conditional_12_For_2_Conditional_10_Template, 2, 1, "div", 96);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 86)(12, "button", 97);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Conditional_70_Conditional_12_For_2_Template_button_click_12_listener() {
      const \u0275$index_275_r23 = \u0275\u0275restoreView(_r21).$index;
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.restoreFromTrash(\u0275$index_275_r23));
    });
    \u0275\u0275text(13, " Wiederherstellen ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "button", 98);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Conditional_70_Conditional_12_For_2_Template_button_click_14_listener() {
      const \u0275$index_275_r23 = \u0275\u0275restoreView(_r21).$index;
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.permanentlyDelete(\u0275$index_275_r23));
    });
    \u0275\u0275text(15, " Endg\xFCltig l\xF6schen ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const trashItem_r22 = ctx.$implicit;
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", trashItem_r22.type, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(trashItem_r22.data.name || "Unbenannt");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1(" Gel\xF6scht: ", \u0275\u0275pipeBind2(9, 4, trashItem_r22.deletedAt, "short"), " ");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(trashItem_r22.data.description ? 10 : -1);
  }
}
function WorldComponent_Conditional_0_Conditional_70_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 90);
    \u0275\u0275repeaterCreate(1, WorldComponent_Conditional_0_Conditional_70_Conditional_12_For_2_Template, 16, 7, "div", 91, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const world_r10 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275repeater(world_r10.trash);
  }
}
function WorldComponent_Conditional_0_Conditional_70_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 83);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Conditional_70_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.closeTrash());
    });
    \u0275\u0275elementStart(1, "div", 84);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Conditional_70_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r20);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 85)(3, "h2");
    \u0275\u0275element(4, "span", 35);
    \u0275\u0275text(5, " Papierkorb");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 86)(7, "button", 87);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Conditional_70_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.emptyTrash());
    });
    \u0275\u0275text(8, " Papierkorb leeren ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 88);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Conditional_70_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.closeTrash());
    });
    \u0275\u0275text(10, " Schlie\xDFen ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(11, WorldComponent_Conditional_0_Conditional_70_Conditional_11_Template, 2, 0, "p", 89)(12, WorldComponent_Conditional_0_Conditional_70_Conditional_12_Template, 3, 0, "div", 90);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const world_r10 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275property("disabled", !world_r10.trash || world_r10.trash.length === 0);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(!world_r10.trash || world_r10.trash.length === 0 ? 11 : 12);
  }
}
function WorldComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 3)(1, "div", 4)(2, "h1");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 5)(5, "a", 6);
    \u0275\u0275element(6, "span", 7);
    \u0275\u0275text(7, " Lobby");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "a", 6);
    \u0275\u0275element(9, "span", 8);
    \u0275\u0275text(10, " Weltkarte");
    \u0275\u0275elementEnd();
    \u0275\u0275element(11, "app-sound-volume-control");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "div", 9)(13, "app-card")(14, "h2");
    \u0275\u0275text(15, "Alle Charaktere");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "div", 10);
    \u0275\u0275repeaterCreate(17, WorldComponent_Conditional_0_For_18_Template, 5, 1, "div", 11, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "div", 12)(20, "input", 13);
    \u0275\u0275twoWayListener("ngModelChange", function WorldComponent_Conditional_0_Template_input_ngModelChange_20_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.newCharacterId, $event) || (ctx_r3.newCharacterId = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "button", 14);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.addCharacter());
    });
    \u0275\u0275text(22, "Charakter hinzuf\xFCgen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "button", 15);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Template_button_click_23_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openCharacterGenerator());
    });
    \u0275\u0275element(24, "span", 16);
    \u0275\u0275text(25, " Generate Character ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(26, "app-card")(27, "h2");
    \u0275\u0275text(28, "Aktive Partei");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "div", 17);
    \u0275\u0275repeaterCreate(30, WorldComponent_Conditional_0_For_31_Template, 5, 1, "div", 18, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "div", 12)(33, "select", 19);
    \u0275\u0275twoWayListener("ngModelChange", function WorldComponent_Conditional_0_Template_select_ngModelChange_33_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.selectedCharacterForParty, $event) || (ctx_r3.selectedCharacterForParty = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(34, "option", 20);
    \u0275\u0275text(35, "Charakter w\xE4hlen...");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(36, WorldComponent_Conditional_0_For_37_Template, 1, 1, null, null, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "button", 14);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Template_button_click_38_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.addToParty());
    });
    \u0275\u0275text(39, "Zur Partei hinzuf\xFCgen");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(40, "app-card", 21)(41, "h2");
    \u0275\u0275text(42, "Partei-\xDCbersicht");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(43, WorldComponent_Conditional_0_Conditional_43_Template, 2, 0, "p", 22)(44, WorldComponent_Conditional_0_Conditional_44_Template, 3, 0, "div", 23);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(45, "div", 24);
    \u0275\u0275element(46, "app-battle-tracker", 25);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "div", 26)(48, "app-card", 27)(49, "app-current-events-manager", 28);
    \u0275\u0275listener("eventAdded", function WorldComponent_Conditional_0_Template_app_current_events_manager_eventAdded_49_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onEventAdded($event));
    })("eventRemoved", function WorldComponent_Conditional_0_Template_app_current_events_manager_eventRemoved_49_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onEventRemoved($event));
    })("eventUpdated", function WorldComponent_Conditional_0_Template_app_current_events_manager_eventUpdated_49_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onEventUpdated($event));
    })("navigateToLibrary", function WorldComponent_Conditional_0_Template_app_current_events_manager_navigateToLibrary_49_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.navigateToLibrary($event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(50, "div", 29)(51, "div", 30)(52, "h2");
    \u0275\u0275text(53, "Bibliothek");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(54, "div", 31)(55, "button", 32);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Template_button_click_55_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openLibrarySelector());
    });
    \u0275\u0275element(56, "span", 33);
    \u0275\u0275text(57, " Bibliotheken ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(58, "button", 34);
    \u0275\u0275listener("click", function WorldComponent_Conditional_0_Template_button_click_58_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openTrash());
    });
    \u0275\u0275element(59, "span", 35);
    \u0275\u0275text(60);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(61, "p", 36);
    \u0275\u0275text(62, "Elemente auf Charaktere oder Kampfbeute ziehen. Rechtsklick f\xFCr Optionen.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(63, "app-asset-browser", 37);
    \u0275\u0275listener("openItemEditor", function WorldComponent_Conditional_0_Template_app_asset_browser_openItemEditor_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openItemEditor($event));
    })("openRuneEditor", function WorldComponent_Conditional_0_Template_app_asset_browser_openRuneEditor_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openRuneEditorDialog($event));
    })("openSpellEditor", function WorldComponent_Conditional_0_Template_app_asset_browser_openSpellEditor_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openSpellEditorDialog($event));
    })("openSkillEditor", function WorldComponent_Conditional_0_Template_app_asset_browser_openSkillEditor_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openSkillEditorDialog($event));
    })("openStatusEffectEditor", function WorldComponent_Conditional_0_Template_app_asset_browser_openStatusEffectEditor_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.openStatusEffectEditorDialog($event));
    })("updateItem", function WorldComponent_Conditional_0_Template_app_asset_browser_updateItem_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateItem($event.index, $event.patch));
    })("updateRune", function WorldComponent_Conditional_0_Template_app_asset_browser_updateRune_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateRune($event.index, $event.patch));
    })("updateSpell", function WorldComponent_Conditional_0_Template_app_asset_browser_updateSpell_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateSpell($event.index, $event.patch));
    })("updateSkill", function WorldComponent_Conditional_0_Template_app_asset_browser_updateSkill_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateSkill($event.index, $event.patch));
    })("updateStatusEffect", function WorldComponent_Conditional_0_Template_app_asset_browser_updateStatusEffect_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateStatusEffect($event.index, $event.patch));
    })("itemEditingChange", function WorldComponent_Conditional_0_Template_app_asset_browser_itemEditingChange_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onItemEditingChange($event));
    })("runeEditingChange", function WorldComponent_Conditional_0_Template_app_asset_browser_runeEditingChange_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onRuneEditingChange($event));
    })("spellEditingChange", function WorldComponent_Conditional_0_Template_app_asset_browser_spellEditingChange_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onSpellEditingChange($event));
    })("skillEditingChange", function WorldComponent_Conditional_0_Template_app_asset_browser_skillEditingChange_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onSkillEditingChange($event));
    })("statusEffectEditingChange", function WorldComponent_Conditional_0_Template_app_asset_browser_statusEffectEditingChange_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onStatusEffectEditingChange($event));
    })("dragStart", function WorldComponent_Conditional_0_Template_app_asset_browser_dragStart_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onDragStart($event.event, $event.type, $event.index));
    })("contextMenuRequest", function WorldComponent_Conditional_0_Template_app_asset_browser_contextMenuRequest_63_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onLibraryItemContextMenu($event));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(64, "div", 38);
    \u0275\u0275element(65, "app-damage-calculator", 39);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(66, WorldComponent_Conditional_0_Conditional_66_Template, 1, 5, "app-item-editor", 40);
    \u0275\u0275conditionalCreate(67, WorldComponent_Conditional_0_Conditional_67_Template, 1, 5, "app-item-editor", 40);
    \u0275\u0275conditionalCreate(68, WorldComponent_Conditional_0_Conditional_68_Template, 1, 1, "app-rune-editor", 41);
    \u0275\u0275conditionalCreate(69, WorldComponent_Conditional_0_Conditional_69_Template, 1, 1, "app-skill-editor", 42);
    \u0275\u0275conditionalCreate(70, WorldComponent_Conditional_0_Conditional_70_Template, 13, 2, "div", 43);
  }
  if (rf & 2) {
    const world_r10 = ctx;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", ctx_r3.worldName, " - GM Ansicht");
    \u0275\u0275advance(2);
    \u0275\u0275property("href", "/lobby/" + ctx_r3.worldName + "?gm=true", \u0275\u0275sanitizeUrl);
    \u0275\u0275advance(3);
    \u0275\u0275property("href", "/world-map/" + ctx_r3.worldName + "?gm=true", \u0275\u0275sanitizeUrl);
    \u0275\u0275advance(9);
    \u0275\u0275repeater(world_r10.characterIds);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.newCharacterId);
    \u0275\u0275advance(10);
    \u0275\u0275repeater(world_r10.partyIds);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.selectedCharacterForParty);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(world_r10.characterIds);
    \u0275\u0275advance(7);
    \u0275\u0275conditional(ctx_r3.getPartyCharacterArray().length === 0 ? 43 : 44);
    \u0275\u0275advance(3);
    \u0275\u0275property("engine", ctx_r3.battleEngine);
    \u0275\u0275advance(3);
    \u0275\u0275property("events", ctx_r3.currentEvents)("libraries", ctx_r3.loadedLibraries())("mergedItems", ctx_r3.mergedItems())("mergedRunes", ctx_r3.mergedRunes())("mergedSpells", ctx_r3.mergedSpells())("mergedSkills", ctx_r3.mergedSkills())("mergedStatusEffects", ctx_r3.mergedStatusEffects());
    \u0275\u0275advance(11);
    \u0275\u0275textInterpolate1(" Papierkorb (", (world_r10.trash || \u0275\u0275pureFunction0(37, _c04)).length, ") ");
    \u0275\u0275advance(3);
    \u0275\u0275property("items", ctx_r3.mergedItems())("runes", ctx_r3.mergedRunes())("spells", ctx_r3.mergedSpells())("skills", ctx_r3.mergedSkills())("statusEffects", ctx_r3.mergedStatusEffects())("shops", ctx_r3.mergedShops())("lootBundles", ctx_r3.mergedBundles())("materials", ctx_r3.allMaterials)("forgeTraits", ctx_r3.allForgeTraits)("dummySheet", ctx_r3.dummySheet)("editingItems", ctx_r3.editingItems)("editingRunes", ctx_r3.editingRunes)("editingSpells", ctx_r3.editingSpells)("editingSkills", ctx_r3.editingSkills)("editingStatusEffects", ctx_r3.editingStatusEffects)("readonly", true);
    \u0275\u0275advance(2);
    \u0275\u0275property("worldName", ctx_r3.worldName);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.showItemCreator ? 66 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.editingItemIndex !== null && world_r10.itemLibrary[ctx_r3.editingItemIndex] ? 67 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.editingRuneIndex !== null && world_r10.runeLibrary[ctx_r3.editingRuneIndex] ? 68 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.editingSkillIndex !== null && world_r10.skillLibrary[ctx_r3.editingSkillIndex] ? 69 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.showTrash ? 70 : -1);
  }
}
function WorldComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-spell-editor-overlay", 99);
    \u0275\u0275listener("save", function WorldComponent_Conditional_2_Template_app_spell_editor_overlay_save_0_listener($event) {
      \u0275\u0275restoreView(_r24);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.updateSpell(ctx_r3.editingSpellIndex, { path: "", value: $event }));
    })("cancel", function WorldComponent_Conditional_2_Template_app_spell_editor_overlay_cancel_0_listener() {
      \u0275\u0275restoreView(_r24);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeSpellEditorDialog());
    })("deleteSpell", function WorldComponent_Conditional_2_Template_app_spell_editor_overlay_deleteSpell_0_listener() {
      \u0275\u0275restoreView(_r24);
      const ctx_r3 = \u0275\u0275nextContext();
      ctx_r3.removeSpell(ctx_r3.editingSpellIndex);
      return \u0275\u0275resetView(ctx_r3.closeSpellEditorDialog());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275property("spell", ctx_r3.editingSpell)("availableRunes", ctx_r3.mergedRunes());
  }
}
function WorldComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-character-generator", 100);
    \u0275\u0275listener("close", function WorldComponent_Conditional_3_Template_app_character_generator_close_0_listener() {
      \u0275\u0275restoreView(_r25);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeCharacterGenerator());
    })("characterGenerated", function WorldComponent_Conditional_3_Template_app_character_generator_characterGenerated_0_listener($event) {
      \u0275\u0275restoreView(_r25);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.onCharacterGenerated($event));
    });
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-library-selector", 101);
    \u0275\u0275listener("librariesChanged", function WorldComponent_Conditional_4_Template_app_library_selector_librariesChanged_0_listener($event) {
      \u0275\u0275restoreView(_r26);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.handleLibrariesChanged($event));
    })("close", function WorldComponent_Conditional_4_Template_app_library_selector_close_0_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.showLibrarySelector = false);
    });
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_6_Conditional_10_For_5_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 120);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const active_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\xD7", active_r29.stacks);
  }
}
function WorldComponent_Conditional_6_Conditional_10_For_5_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 121);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const active_r29 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", active_r29.duration, "R");
  }
}
function WorldComponent_Conditional_6_Conditional_10_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 117)(1, "span", 118);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 119);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, WorldComponent_Conditional_6_Conditional_10_For_5_Conditional_5_Template, 2, 1, "span", 120);
    \u0275\u0275conditionalCreate(6, WorldComponent_Conditional_6_Conditional_10_For_5_Conditional_6_Template, 2, 1, "span", 121);
    \u0275\u0275elementStart(7, "button", 122);
    \u0275\u0275listener("click", function WorldComponent_Conditional_6_Conditional_10_For_5_Template_button_click_7_listener() {
      const active_r29 = \u0275\u0275restoreView(_r28).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.removeEffectFromManager(active_r29));
    });
    \u0275\u0275text(8, "\u2715");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const active_r29 = ctx.$implicit;
    const def_r30 = \u0275\u0275nextContext(3).getDashboardEffectDef(active_r29.statusEffectId);
    \u0275\u0275styleProp("--ec", (def_r30 == null ? null : def_r30.color) ?? "#8b5cf6");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate((def_r30 == null ? null : def_r30.icon) ?? "\u2726");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(active_r29.customName ?? (def_r30 == null ? null : def_r30.name) ?? active_r29.statusEffectId);
    \u0275\u0275advance();
    \u0275\u0275conditional(active_r29.stacks && active_r29.stacks > 1 ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(active_r29.duration !== void 0 && active_r29.duration !== null ? 6 : -1);
  }
}
function WorldComponent_Conditional_6_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 109)(1, "span", 114);
    \u0275\u0275text(2, "Aktive Effekte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 115);
    \u0275\u0275repeaterCreate(4, WorldComponent_Conditional_6_Conditional_10_For_5_Template, 9, 6, "div", 116, _forTrack22);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r3.getStatusManagerActiveEffects());
  }
}
function WorldComponent_Conditional_6_For_14_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 126);
    \u0275\u0275text(1, "Debuff");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_6_For_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 123);
    \u0275\u0275listener("click", function WorldComponent_Conditional_6_For_14_Template_button_click_0_listener() {
      const effect_r32 = \u0275\u0275restoreView(_r31).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.addEffectFromManager(effect_r32));
    });
    \u0275\u0275elementStart(1, "span", 124);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 125);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, WorldComponent_Conditional_6_For_14_Conditional_5_Template, 2, 0, "span", 126);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const effect_r32 = ctx.$implicit;
    \u0275\u0275styleProp("--ec", effect_r32.color || "#8b5cf6");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(effect_r32.icon || "\u2726");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(effect_r32.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(effect_r32.isDebuff ? 5 : -1);
  }
}
function WorldComponent_Conditional_6_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 113);
    \u0275\u0275text(1, "Keine Effekte gefunden.");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275listener("click", function WorldComponent_Conditional_6_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeStatusManager());
    });
    \u0275\u0275elementStart(1, "div", 103);
    \u0275\u0275listener("click", function WorldComponent_Conditional_6_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r27);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 104)(3, "span", 105);
    \u0275\u0275element(4, "span", 106);
    \u0275\u0275text(5, " Status verwalten");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 107);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 108);
    \u0275\u0275listener("click", function WorldComponent_Conditional_6_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeStatusManager());
    });
    \u0275\u0275text(9, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(10, WorldComponent_Conditional_6_Conditional_10_Template, 6, 0, "div", 109);
    \u0275\u0275elementStart(11, "input", 110);
    \u0275\u0275twoWayListener("ngModelChange", function WorldComponent_Conditional_6_Template_input_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r27);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.statusManagerSearch, $event) || (ctx_r3.statusManagerSearch = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 111);
    \u0275\u0275repeaterCreate(13, WorldComponent_Conditional_6_For_14_Template, 6, 5, "button", 112, _forTrack07);
    \u0275\u0275conditionalCreate(15, WorldComponent_Conditional_6_Conditional_15_Template, 2, 0, "p", 113);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_1_0;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate(((tmp_1_0 = ctx_r3.partyCharacters.get(ctx_r3.statusManagerFor)) == null ? null : tmp_1_0.name) || ctx_r3.statusManagerFor);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r3.getStatusManagerActiveEffects().length > 0 ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.statusManagerSearch);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.statusManagerEffects);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r3.statusManagerEffects.length === 0 ? 15 : -1);
  }
}
function WorldComponent_Conditional_7_For_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r34 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 130);
    \u0275\u0275listener("click", function WorldComponent_Conditional_7_For_12_Template_button_click_0_listener() {
      const item_r35 = \u0275\u0275restoreView(_r34).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.sendFromPicker(item_r35));
    });
    \u0275\u0275elementStart(1, "span", 131);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const item_r35 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r35.name);
  }
}
function WorldComponent_Conditional_7_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 113);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("Keine ", ctx_r3.sendPickerTypeLabel, "e gefunden.");
  }
}
function WorldComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275listener("click", function WorldComponent_Conditional_7_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r33);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeSendPicker());
    });
    \u0275\u0275elementStart(1, "div", 103);
    \u0275\u0275listener("click", function WorldComponent_Conditional_7_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r33);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 104)(3, "span", 105);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 107);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 108);
    \u0275\u0275listener("click", function WorldComponent_Conditional_7_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r33);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeSendPicker());
    });
    \u0275\u0275text(8, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "input", 127);
    \u0275\u0275twoWayListener("ngModelChange", function WorldComponent_Conditional_7_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r33);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.sendPickerSearch, $event) || (ctx_r3.sendPickerSearch = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "div", 128);
    \u0275\u0275repeaterCreate(11, WorldComponent_Conditional_7_For_12_Template, 3, 1, "button", 129, _forTrack32);
    \u0275\u0275conditionalCreate(13, WorldComponent_Conditional_7_Conditional_13_Template, 2, 1, "p", 113);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("\u{1F4E4} ", ctx_r3.sendPickerTypeLabel, " senden");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("An ", ((tmp_2_0 = ctx_r3.partyCharacters.get(ctx_r3.sendPickerFor)) == null ? null : tmp_2_0.name) || ctx_r3.sendPickerFor);
    \u0275\u0275advance(3);
    \u0275\u0275property("placeholder", \u0275\u0275interpolate1("", ctx_r3.sendPickerTypeLabel, " suchen..."));
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.sendPickerSearch);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.sendPickerItems);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r3.sendPickerItems.length === 0 ? 13 : -1);
  }
}
function WorldComponent_Conditional_8_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 105);
    \u0275\u0275text(1, "\u{1F4D6} Materialwissen");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_8_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 105);
    \u0275\u0275text(1, "\u{1F528} Schmiedewissen");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_8_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 133);
    \u0275\u0275element(1, "span", 134);
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "Wird geladen...");
    \u0275\u0275elementEnd()();
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 113);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r3.knowledgeManagerSearch ? "Keine passenden Materialien." : "Keine nicht-\xF6ffentlichen Materialien in der Bibliothek.", " ");
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 146);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const entry_r39 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(entry_r39.material.description);
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 148);
    \u0275\u0275text(1, "Waffe");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 149);
    \u0275\u0275text(1, "R\xFCstung");
    \u0275\u0275elementEnd();
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r38 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 142)(1, "input", 143);
    \u0275\u0275listener("change", function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Template_input_change_1_listener() {
      const entry_r39 = \u0275\u0275restoreView(_r38).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r3.toggleMaterialKnowledge(entry_r39));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 144)(3, "span", 145);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Conditional_5_Template, 2, 1, "span", 146);
    \u0275\u0275elementStart(6, "div", 147);
    \u0275\u0275conditionalCreate(7, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Conditional_7_Template, 2, 0, "span", 148);
    \u0275\u0275conditionalCreate(8, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Conditional_8_Template, 2, 0, "span", 149);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const entry_r39 = ctx.$implicit;
    \u0275\u0275classProp("km-known", entry_r39.known);
    \u0275\u0275advance();
    \u0275\u0275property("checked", entry_r39.known);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(entry_r39.material.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(entry_r39.material.description ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(entry_r39.material.canBeWeaponMaterial ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(entry_r39.material.canBeArmorMaterial ? 8 : -1);
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 137);
    \u0275\u0275repeaterCreate(1, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_For_2_Template, 9, 7, "label", 141, _forTrack42);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.filteredKnowledgeMaterials);
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r37 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p", 135);
    \u0275\u0275text(1, "\xD6ffentliche Materialien sind automatisch f\xFCr alle sichtbar. Hier kannst du nicht-\xF6ffentliche Materialien freigeben.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "input", 136);
    \u0275\u0275twoWayListener("ngModelChange", function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Template_input_ngModelChange_2_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.knowledgeManagerSearch, $event) || (ctx_r3.knowledgeManagerSearch = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_3_Template, 2, 1, "p", 113)(4, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Conditional_4_Template, 3, 0, "div", 137);
    \u0275\u0275elementStart(5, "div", 138)(6, "span", 139);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 140);
    \u0275\u0275listener("click", function WorldComponent_Conditional_8_Conditional_10_Conditional_0_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.saveKnowledgeManager());
    });
    \u0275\u0275text(9, "Speichern");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.knowledgeManagerSearch);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.filteredKnowledgeMaterials.length === 0 ? 3 : 4);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx_r3.knownMaterialCount, " von ", ctx_r3.knowledgeManagerMaterials.length, " bekannt");
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 113);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r3.knowledgeManagerSearch ? "Keine passenden Schmiedemerkmale." : "Keine nicht-\xF6ffentlichen Schmiedemerkmale in der Bibliothek.", " ");
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 146);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const entry_r42 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(entry_r42.forgeTrait.description);
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r41 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 142)(1, "input", 143);
    \u0275\u0275listener("change", function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_For_2_Template_input_change_1_listener() {
      const entry_r42 = \u0275\u0275restoreView(_r41).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r3.toggleForgeTraitKnowledge(entry_r42));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 144)(3, "span", 145);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(5, WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_For_2_Conditional_5_Template, 2, 1, "span", 146);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const entry_r42 = ctx.$implicit;
    \u0275\u0275classProp("km-known", entry_r42.known);
    \u0275\u0275advance();
    \u0275\u0275property("checked", entry_r42.known);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(entry_r42.forgeTrait.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(entry_r42.forgeTrait.description ? 5 : -1);
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 137);
    \u0275\u0275repeaterCreate(1, WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_For_2_Template, 6, 5, "label", 141, _forTrack5);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.filteredKnowledgeForgeTraits);
  }
}
function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r40 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p", 135);
    \u0275\u0275text(1, "\xD6ffentliche Schmiedemerkmale sind automatisch f\xFCr alle sichtbar. Hier kannst du nicht-\xF6ffentliche Schmiedemerkmale freigeben.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "input", 150);
    \u0275\u0275twoWayListener("ngModelChange", function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Template_input_ngModelChange_2_listener($event) {
      \u0275\u0275restoreView(_r40);
      const ctx_r3 = \u0275\u0275nextContext(3);
      \u0275\u0275twoWayBindingSet(ctx_r3.knowledgeManagerSearch, $event) || (ctx_r3.knowledgeManagerSearch = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_3_Template, 2, 1, "p", 113)(4, WorldComponent_Conditional_8_Conditional_10_Conditional_1_Conditional_4_Template, 3, 0, "div", 137);
    \u0275\u0275elementStart(5, "div", 138)(6, "span", 139);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 140);
    \u0275\u0275listener("click", function WorldComponent_Conditional_8_Conditional_10_Conditional_1_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r40);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.saveKnowledgeManager());
    });
    \u0275\u0275text(9, "Speichern");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.knowledgeManagerSearch);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.filteredKnowledgeForgeTraits.length === 0 ? 3 : 4);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx_r3.knownForgeTraitCount, " von ", ctx_r3.knowledgeManagerForgeTraits.length, " bekannt");
  }
}
function WorldComponent_Conditional_8_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, WorldComponent_Conditional_8_Conditional_10_Conditional_0_Template, 10, 4)(1, WorldComponent_Conditional_8_Conditional_10_Conditional_1_Template, 10, 4);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275conditional(ctx_r3.knowledgeManagerType === "material" ? 0 : 1);
  }
}
function WorldComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r36 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 102);
    \u0275\u0275listener("click", function WorldComponent_Conditional_8_Template_div_click_0_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeKnowledgeManager());
    });
    \u0275\u0275elementStart(1, "div", 132);
    \u0275\u0275listener("click", function WorldComponent_Conditional_8_Template_div_click_1_listener($event) {
      \u0275\u0275restoreView(_r36);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(2, "div", 104);
    \u0275\u0275conditionalCreate(3, WorldComponent_Conditional_8_Conditional_3_Template, 2, 0, "span", 105)(4, WorldComponent_Conditional_8_Conditional_4_Template, 2, 0, "span", 105);
    \u0275\u0275elementStart(5, "span", 107);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 108);
    \u0275\u0275listener("click", function WorldComponent_Conditional_8_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.closeKnowledgeManager());
    });
    \u0275\u0275text(8, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(9, WorldComponent_Conditional_8_Conditional_9_Template, 4, 0, "div", 133)(10, WorldComponent_Conditional_8_Conditional_10_Template, 2, 1);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r3.knowledgeManagerType === "material" ? 3 : 4);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(((tmp_2_0 = ctx_r3.partyCharacters.get(ctx_r3.knowledgeManagerFor)) == null ? null : tmp_2_0.name) || ctx_r3.knowledgeManagerFor);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r3.knowledgeManagerLoading ? 9 : 10);
  }
}
var WorldComponent = class _WorldComponent {
  route;
  worldName = "";
  contextMenu;
  librarySelector;
  // Services
  store = inject(WorldStoreService);
  worldSocket = inject(WorldSocketService);
  characterApi = inject(CharacterApiService);
  characterSocket = inject(CharacterSocketService);
  battleService = inject(BattleService);
  libraryService = inject(LibraryService);
  libraryStoreService = inject(LibraryStoreService);
  trashService = inject(TrashService);
  notification = inject(NotificationService);
  cdr = inject(ChangeDetectorRef);
  trueStats = inject(TrueStatsService);
  assetBrowserApi = inject(AssetBrowserApiService);
  router = inject(Router);
  // Character/party state
  newCharacterId = "";
  selectedCharacterForParty = "";
  partyCharacters = /* @__PURE__ */ new Map();
  characterPortraitsMap = /* @__PURE__ */ new Map();
  characterPatchSubscription;
  // Battle Engine
  battleEngine = new BattleTrackerEngine();
  // UI state
  dummySheet = createEmptySheet();
  showItemCreator = false;
  showTrash = false;
  showCharacterGenerator = false;
  showLibrarySelector = false;
  editingItemIndex = null;
  editingRuneIndex = null;
  editingSpellIndex = null;
  editingSpell = null;
  // stable ref kept across library updates
  isSpellEditorOpen = false;
  editingSkillIndex = null;
  editingStatusEffectIndex = null;
  editingItems = /* @__PURE__ */ new Set();
  editingRunes = /* @__PURE__ */ new Set();
  editingSpells = /* @__PURE__ */ new Set();
  editingSkills = /* @__PURE__ */ new Set();
  editingStatusEffects = /* @__PURE__ */ new Set();
  // Dashboard status effect management
  /** Character ID whose status effect picker is open, null = none */
  dashboardStatusPickerFor = null;
  /** Character ID whose status manager overlay is open */
  statusManagerFor = null;
  statusManagerSearch = "";
  /** Character ID + type for send-picker overlay */
  sendPickerFor = null;
  sendPickerType = null;
  sendPickerSearch = "";
  /** Character ID whose knowledge management overlay is open */
  knowledgeManagerFor = null;
  knowledgeManagerLoading = false;
  knowledgeManagerType = "material";
  knowledgeManagerMaterials = [];
  knowledgeManagerForgeTraits = [];
  knowledgeManagerSearch = "";
  // Asset browser knowledge data loaded from AssetBrowserApi
  allMaterials = [];
  allForgeTraits = [];
  knowledgeDataLoaded = false;
  // Drag state
  dragScrollInterval;
  isDragging = false;
  // Context menu state
  selectedCharacterForContextMenu = "";
  selectedLibraryItemType = null;
  selectedLibraryItemIndex = -1;
  // Loaded libraries signal for reactivity
  loadedLibraries = signal([], ...ngDevMode ? [{ debugName: "loadedLibraries" }] : []);
  constructor(route) {
    this.route = route;
    this.libraryStoreService.allLibraries$.subscribe((libs) => {
      console.log("[WORLD] Libraries loaded:", libs.length, "libraries");
      libs.forEach((lib) => {
        console.log(`  - ${lib.name}: ${lib.items?.length || 0} items, ${lib.spells?.length || 0} spells, ${lib.runes?.length || 0} runes, ${lib.skills?.length || 0} skills, ${lib.shops?.length || 0} shops, ${lib.lootBundles?.length || 0} bundles`);
      });
      this.loadedLibraries.set(libs);
      this.cdr.markForCheck();
    });
  }
  // Loot Bundles getter
  get lootBundleLibrary() {
    return this.store.worldValue?.lootBundleLibrary || [];
  }
  // Battle queue getter - delegates to service
  get battleQueue() {
    return this.battleService.getBattleQueue();
  }
  get availableCharactersForBattle() {
    return this.battleService.getAvailableCharactersForBattle(this.getPartyCharacterArray());
  }
  // Merged libraries (world's own + linked libraries)  
  mergedItems = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const items = [...world.itemLibrary || []];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    console.log("[WORLD] Merging items - World items:", items.length, "Linked libs:", linkedLibs.length, "Loaded libs:", loadedLibs.length);
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.items) {
        console.log(`  - Adding ${lib.items.length} items from library "${lib.name}"`);
        items.push(...lib.items);
      } else {
        console.log(`  - Library ${libId} not found or has no items`);
      }
    });
    console.log("[WORLD] Total merged items:", items.length);
    return items;
  }, ...ngDevMode ? [{ debugName: "mergedItems" }] : []);
  mergedRunes = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const runes = [...world.runeLibrary || []];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.runes) {
        runes.push(...lib.runes);
      }
    });
    return runes;
  }, ...ngDevMode ? [{ debugName: "mergedRunes" }] : []);
  mergedSpells = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const spells = [...world.spellLibrary || []];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.spells) {
        spells.push(...lib.spells);
      }
    });
    return spells;
  }, ...ngDevMode ? [{ debugName: "mergedSpells" }] : []);
  mergedSkills = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const skills = [...world.skillLibrary || []];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.skills) {
        skills.push(...lib.skills);
      }
    });
    return skills;
  }, ...ngDevMode ? [{ debugName: "mergedSkills" }] : []);
  mergedStatusEffects = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const statusEffects = [];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.statusEffects) {
        statusEffects.push(...lib.statusEffects);
      }
    });
    return statusEffects;
  }, ...ngDevMode ? [{ debugName: "mergedStatusEffects" }] : []);
  mergedShops = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const shops = [];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    console.log("[WORLD] Merging shops - Linked libs:", linkedLibs.length, "Loaded libs:", loadedLibs.length);
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.shops) {
        console.log(`  - Adding ${lib.shops.length} shops from library "${lib.name}"`);
        shops.push(...lib.shops);
      } else {
        console.log(`  - Library ${libId} not found or has no shops`);
      }
    });
    console.log("[WORLD] Total merged shops:", shops.length);
    return shops;
  }, ...ngDevMode ? [{ debugName: "mergedShops" }] : []);
  mergedBundles = computed(() => {
    const world = this.store.worldValue;
    if (!world)
      return [];
    const bundles = [];
    const linkedLibs = world.linkedLibraries || [];
    const loadedLibs = this.loadedLibraries();
    console.log("[WORLD] Merging bundles - Linked libs:", linkedLibs.length, "Loaded libs:", loadedLibs.length);
    linkedLibs.forEach((libId) => {
      const lib = loadedLibs.find((l) => l.id === libId);
      if (lib?.lootBundles) {
        console.log(`  - Adding ${lib.lootBundles.length} bundles from library "${lib.name}"`);
        bundles.push(...lib.lootBundles);
      } else {
        console.log(`  - Library ${libId} not found or has no bundles`);
      }
    });
    console.log("[WORLD] Total merged bundles:", bundles.length);
    return bundles;
  }, ...ngDevMode ? [{ debugName: "mergedBundles" }] : []);
  // Current Events helpers
  get currentEvents() {
    return this.store.worldValue?.currentEvents || [];
  }
  onEventAdded(event) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const events = [...world.currentEvents || [], event];
    this.store.applyPatch({ path: "currentEvents", value: events });
  }
  onEventRemoved(eventId) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const events = (world.currentEvents || []).filter((e) => e.id !== eventId);
    this.store.applyPatch({ path: "currentEvents", value: events });
  }
  onEventUpdated(event) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const events = (world.currentEvents || []).map((e) => e.id === event.id ? event : e);
    this.store.applyPatch({ path: "currentEvents", value: events });
  }
  navigateToLibrary(data) {
    this.router.navigate(["/library", data.libraryId], {
      queryParams: {
        tab: data.tab,
        highlightId: data.itemId
      }
    });
  }
  ngOnInit() {
    this.battleEngine.setWorldStore(this.store);
    this.libraryStoreService.loadAllLibraries();
    this.loadKnowledgeData();
    this.route.params.subscribe((params) => {
      this.worldName = params["worldName"];
      document.title = this.worldName;
      this.store.load(this.worldName);
    });
    this.characterSocket.connect();
    this.characterPatchSubscription = this.characterSocket.patches$.subscribe((data) => {
      const sheet = this.partyCharacters.get(data.characterId);
      if (sheet) {
        this.applyJsonPatch(sheet, data.patch);
        if (data.patch.path.includes("speed") || data.patch.path === "level") {
          this.battleService.refreshBattleSpeeds();
        }
        if (data.patch.path.includes("portrait")) {
          this.updateCharacterPortraits();
        }
        this.cdr.markForCheck();
      }
    });
    this.store.world$.subscribe(async (world) => {
      if (world) {
        await this.loadPartyCharacters(world.partyIds);
        this.battleEngine.syncFromWorldStore();
        this.cdr.markForCheck();
      }
    });
  }
  ngOnDestroy() {
    this.characterPatchSubscription?.unsubscribe();
  }
  // ==================== Party Management ====================
  async loadPartyCharacters(partyIds) {
    for (const characterId of partyIds) {
      if (!this.partyCharacters.has(characterId)) {
        try {
          const sheet = await this.characterApi.loadCharacter(characterId);
          if (sheet) {
            sheet.id = characterId;
            if (!sheet.currency) {
              sheet.currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
            }
            this.partyCharacters.set(characterId, sheet);
            this.characterSocket.joinCharacter(characterId);
            if (sheet.worldName !== this.worldName) {
              try {
                await this.characterApi.patchCharacter(characterId, {
                  path: "worldName",
                  value: this.worldName
                });
              } catch (error) {
                console.error(`Failed to auto-assign world to character ${characterId}:`, error);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to load character ${characterId}:`, err);
        }
      }
    }
    const currentPartyIds = new Set(partyIds);
    for (const characterId of this.partyCharacters.keys()) {
      if (!currentPartyIds.has(characterId)) {
        this.partyCharacters.delete(characterId);
      }
    }
    this.battleService.setPartyCharacters(this.partyCharacters);
    this.updateCharacterPortraits();
    this.battleEngine.setAvailableCharacters(Array.from(this.partyCharacters.entries()).map(([id, sheet]) => ({
      id,
      name: sheet.name || id,
      portrait: sheet.portrait,
      speed: this.battleService.calculateSpeed(sheet)
    })));
    this.battleEngine.syncFromWorldStore();
    this.cdr.detectChanges();
  }
  updateCharacterPortraits() {
    const map = /* @__PURE__ */ new Map();
    this.partyCharacters.forEach((sheet, id) => {
      if (sheet.portrait) {
        map.set(id, sheet.portrait);
      }
    });
    this.characterPortraitsMap = map;
  }
  getPartyCharacterArray() {
    return Array.from(this.partyCharacters.entries()).map(([id, sheet]) => ({ id, sheet }));
  }
  get partyMembersForLoot() {
    return this.getPartyCharacterArray().map((p) => ({
      id: p.id,
      name: p.sheet.name || p.id
    }));
  }
  addCharacter() {
    if (!this.newCharacterId.trim())
      return;
    const world = this.store.worldValue;
    if (world && !world.characterIds.includes(this.newCharacterId)) {
      this.store.applyPatch({
        path: "characterIds",
        value: [...world.characterIds, this.newCharacterId]
      });
      this.newCharacterId = "";
    }
  }
  removeCharacter(index) {
    const world = this.store.worldValue;
    if (world) {
      const newCharacterIds = [...world.characterIds];
      const removedId = newCharacterIds[index];
      newCharacterIds.splice(index, 1);
      const newPartyIds = world.partyIds.filter((id) => id !== removedId);
      this.store.applyPatch({
        path: "characterIds",
        value: newCharacterIds
      });
      if (newPartyIds.length !== world.partyIds.length) {
        this.store.applyPatch({
          path: "partyIds",
          value: newPartyIds
        });
      }
    }
  }
  async addToParty() {
    if (!this.selectedCharacterForParty)
      return;
    const world = this.store.worldValue;
    if (world && !world.partyIds.includes(this.selectedCharacterForParty)) {
      this.store.applyPatch({
        path: "partyIds",
        value: [...world.partyIds, this.selectedCharacterForParty]
      });
      try {
        await this.characterApi.patchCharacter(this.selectedCharacterForParty, {
          path: "worldName",
          value: world.name
        });
      } catch (error) {
        console.error("Failed to update character worldName:", error);
      }
      this.selectedCharacterForParty = "";
    }
  }
  removeFromParty(index) {
    const world = this.store.worldValue;
    if (world) {
      const newPartyIds = [...world.partyIds];
      newPartyIds.splice(index, 1);
      this.store.applyPatch({
        path: "partyIds",
        value: newPartyIds
      });
    }
  }
  // Character Generator methods
  openCharacterGenerator() {
    this.showCharacterGenerator = true;
    this.cdr.markForCheck();
  }
  closeCharacterGenerator() {
    this.showCharacterGenerator = false;
    this.cdr.markForCheck();
  }
  async onCharacterGenerated(character) {
    try {
      const sanitizedName = character.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
      const characterId = `${sanitizedName}_${Date.now()}`;
      await this.characterApi.saveCharacter(characterId, character);
      const world = this.store.worldValue;
      if (world) {
        this.store.applyPatch({
          path: "characterIds",
          value: [...world.characterIds, characterId]
        });
      }
      this.closeCharacterGenerator();
      console.log(`Character "${character.name}" created with ID: ${characterId}`);
      this.cdr.markForCheck();
    } catch (error) {
      console.error("Failed to save generated character:", error);
      alert("Failed to save character. Please try again.");
    }
  }
  // ==================== Library Management ====================
  openItemCreator() {
    this.showItemCreator = true;
  }
  closeItemCreator() {
    this.showItemCreator = false;
  }
  openItemEditor(index) {
    this.editingItemIndex = index;
  }
  closeItemEditor() {
    this.editingItemIndex = null;
  }
  openRuneEditorDialog(index) {
    this.editingRuneIndex = index;
  }
  closeRuneEditor() {
    this.editingRuneIndex = null;
  }
  openSpellEditorDialog(index) {
    this.editingSpellIndex = index;
    this.editingSpell = this.store.worldValue?.spellLibrary?.[index] ?? null;
    this.isSpellEditorOpen = true;
  }
  closeSpellEditorDialog() {
    this.isSpellEditorOpen = false;
    this.editingSpellIndex = null;
    this.editingSpell = null;
  }
  openSkillEditorDialog(index) {
    this.editingSkillIndex = index;
  }
  closeSkillEditorDialog() {
    this.editingSkillIndex = null;
  }
  createItem(item) {
    this.libraryService.createItem(item);
    this.closeItemCreator();
  }
  generateRandomWeapon() {
  }
  generateRandomArmor() {
  }
  updateItem(index, patch) {
    this.libraryService.updateItem(index, patch);
  }
  removeItem(index) {
    this.libraryService.removeItem(index);
    this.editingItems = this.shiftEditingSet(this.editingItems, index);
  }
  addRune() {
    this.libraryService.addRune();
  }
  updateRune(index, patch) {
    this.libraryService.updateRune(index, patch);
  }
  removeRune(index) {
    this.libraryService.removeRune(index);
    this.editingRunes = this.shiftEditingSet(this.editingRunes, index);
  }
  addSpell() {
    this.libraryService.addSpell();
  }
  updateSpell(index, patch) {
    this.libraryService.updateSpell(index, patch);
  }
  removeSpell(index) {
    this.libraryService.removeSpell(index);
  }
  addSkill() {
    this.libraryService.addSkill();
  }
  updateSkill(index, patch) {
    this.libraryService.updateSkill(index, patch);
  }
  removeSkill(index) {
    this.libraryService.removeSkill(index);
  }
  // Status Effect CRUD (store in world.statusEffectLibrary)
  addStatusEffect() {
    const newEffect = {
      id: `effect_${Date.now()}`,
      name: "Neuer Effekt",
      description: "",
      icon: "\u2728",
      defaultDuration: void 0
    };
    const world = this.store.worldValue;
    if (!world)
      return;
    const effects = [...world.statusEffectLibrary || [], newEffect];
    this.store.applyPatch({ path: "/statusEffectLibrary", value: effects });
  }
  updateStatusEffect(index, patch) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const effects = [...world.statusEffectLibrary || []];
    if (effects[index]) {
      const key = patch.path.split("/").pop() || "";
      effects[index][key] = patch.value;
      this.store.applyPatch({ path: "/statusEffectLibrary", value: effects });
    }
  }
  removeStatusEffect(index) {
    const world = this.store.worldValue;
    if (!world)
      return;
    const effects = [...world.statusEffectLibrary || []];
    effects.splice(index, 1);
    this.store.applyPatch({ path: "/statusEffectLibrary", value: effects });
    this.editingStatusEffects = this.shiftEditingSet(this.editingStatusEffects, index);
  }
  openStatusEffectEditorDialog(index) {
    this.editingStatusEffectIndex = index;
    console.log("Open status effect editor:", index);
  }
  // ---- Dashboard: assign status effects to party characters ----
  getCoinPartsForMember(sheet) {
    return getCoinParts(sheet.currency ?? { copper: 0, silver: 0, gold: 0, platinum: 0 });
  }
  toggleDashboardStatusPicker(characterId) {
    this.dashboardStatusPickerFor = this.dashboardStatusPickerFor === characterId ? null : characterId;
    this.cdr.markForCheck();
  }
  getDashboardActiveEffects(characterId) {
    const sheet = this.partyCharacters.get(characterId);
    return sheet?.activeStatusEffects ?? [];
  }
  getDashboardEffectDef(statusEffectId) {
    return this.mergedStatusEffects().find((e) => e.id === statusEffectId);
  }
  /** Called when GM picks an effect from the dashboard picker */
  addEffectFromDashboard(characterId, effect) {
    const libId = this.loadedLibraries().find((lib) => lib.statusEffects?.some((e) => e.id === effect.id))?.id ?? "";
    this.applyStatusEffectToCharacter(characterId, effect.id, libId);
    this.dashboardStatusPickerFor = null;
    this.cdr.markForCheck();
  }
  // ---- Status Manager overlay ----
  closeStatusManager() {
    this.statusManagerFor = null;
    this.statusManagerSearch = "";
    this.cdr.markForCheck();
  }
  get statusManagerEffects() {
    const search = this.statusManagerSearch.toLowerCase().trim();
    return this.mergedStatusEffects().filter((e) => {
      if (!search)
        return true;
      return e.name.toLowerCase().includes(search) || (e.tags ?? []).some((t) => t.toLowerCase().includes(search));
    });
  }
  getStatusManagerActiveEffects() {
    if (!this.statusManagerFor)
      return [];
    return this.getDashboardActiveEffects(this.statusManagerFor);
  }
  addEffectFromManager(effect) {
    if (!this.statusManagerFor)
      return;
    const libId = this.loadedLibraries().find((lib) => lib.statusEffects?.some((e) => e.id === effect.id))?.id ?? "";
    this.applyStatusEffectToCharacter(this.statusManagerFor, effect.id, libId);
    this.cdr.markForCheck();
  }
  removeEffectFromManager(active) {
    if (!this.statusManagerFor)
      return;
    this.removeStatusEffectFromCharacter(this.statusManagerFor, active.statusEffectId, active.appliedAt);
    this.cdr.markForCheck();
  }
  // ---- Send Picker overlay ----
  closeSendPicker() {
    this.sendPickerFor = null;
    this.sendPickerType = null;
    this.sendPickerSearch = "";
    this.cdr.markForCheck();
  }
  get sendPickerItems() {
    const search = this.sendPickerSearch.toLowerCase().trim();
    let items = [];
    switch (this.sendPickerType) {
      case "item":
        items = this.mergedItems();
        break;
      case "rune":
        items = this.mergedRunes();
        break;
      case "spell":
        items = this.mergedSpells();
        break;
      case "skill":
        items = this.mergedSkills();
        break;
    }
    if (!search)
      return items;
    return items.filter((i) => i.name?.toLowerCase().includes(search));
  }
  get sendPickerTypeLabel() {
    switch (this.sendPickerType) {
      case "item":
        return "Item";
      case "rune":
        return "Rune";
      case "spell":
        return "Zauber";
      case "skill":
        return "F\xE4higkeit";
      default:
        return "";
    }
  }
  sendFromPicker(item) {
    if (!this.sendPickerFor || !this.sendPickerType)
      return;
    const character = this.partyCharacters.get(this.sendPickerFor);
    if (!character)
      return;
    this.characterApi.loadCharacter(this.sendPickerFor).then((freshSheet) => {
      if (!freshSheet)
        return;
      this.giveItemToCharacter(this.sendPickerFor, this.sendPickerType, item, freshSheet);
      const typeName = this.sendPickerTypeLabel;
      this.notification.success(`${typeName} "${item.name}" wurde an ${character.name} gesendet.`, 2500);
      this.cdr.markForCheck();
    });
  }
  removeStatusEffectFromCharacter(characterId, statusEffectId, appliedAt) {
    const sheet = this.partyCharacters.get(characterId);
    if (!sheet)
      return;
    const activeEffects = (sheet.activeStatusEffects ?? []).filter((e) => !(e.statusEffectId === statusEffectId && e.appliedAt === appliedAt));
    this.characterSocket.sendPatch(characterId, { path: "/activeStatusEffects", value: activeEffects });
    sheet.activeStatusEffects = activeEffects;
    this.cdr.markForCheck();
  }
  // Editing state handlers
  onItemEditingChange({ index, isEditing }) {
    this.editingItems = this.updateEditingSet(this.editingItems, index, isEditing);
  }
  onRuneEditingChange({ index, isEditing }) {
    this.editingRunes = this.updateEditingSet(this.editingRunes, index, isEditing);
  }
  onSpellEditingChange({ index, isEditing }) {
    this.editingSpells = this.updateEditingSet(this.editingSpells, index, isEditing);
  }
  onSkillEditingChange({ index, isEditing }) {
    this.editingSkills = this.updateEditingSet(this.editingSkills, index, isEditing);
  }
  onStatusEffectEditingChange({ index, isEditing }) {
    this.editingStatusEffects = this.updateEditingSet(this.editingStatusEffects, index, isEditing);
  }
  isItemEditing(index) {
    return this.editingItems.has(index);
  }
  isRuneEditing(index) {
    return this.editingRunes.has(index);
  }
  isSpellEditing(index) {
    return this.editingSpells.has(index);
  }
  updateEditingSet(set, index, isEditing) {
    const newSet = new Set(set);
    if (isEditing)
      newSet.add(index);
    else
      newSet.delete(index);
    return newSet;
  }
  shiftEditingSet(set, removedIndex) {
    const newSet = /* @__PURE__ */ new Set();
    set.forEach((i) => {
      if (i < removedIndex)
        newSet.add(i);
      else if (i > removedIndex)
        newSet.add(i - 1);
    });
    return newSet;
  }
  trackByIndex(index) {
    return index;
  }
  // ==================== Battle Tracker ====================
  addToBattle(characterId) {
    this.battleService.addToBattle(characterId);
  }
  removeFromBattle(characterId) {
    this.battleService.removeFromBattle(characterId);
  }
  advanceTurn() {
    this.battleService.advanceTurn();
  }
  resetBattle() {
    this.battleService.resetBattle();
  }
  changeParticipantTeam(characterId, team) {
    this.battleService.changeParticipantTeam(characterId, team);
  }
  reorderParticipants(characterId, newIndex) {
    this.battleService.reorderParticipants(characterId, newIndex);
  }
  // ==================== Trash Management ====================
  openTrash() {
    this.showTrash = true;
  }
  closeTrash() {
    this.showTrash = false;
  }
  restoreFromTrash(index) {
    this.trashService.restoreFromTrash(index);
  }
  permanentlyDelete(index) {
    this.trashService.permanentlyDelete(index);
  }
  emptyTrash() {
    this.trashService.emptyTrash();
  }
  // ==================== Drag and Drop ====================
  onDragStart(event, type, index) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("lootType", type);
    event.dataTransfer.setData("lootIndex", index.toString());
    this.isDragging = true;
    this.startAutoScroll();
  }
  onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    this.updateAutoScroll(event.clientY);
  }
  startAutoScroll() {
    if (this.dragScrollInterval)
      clearInterval(this.dragScrollInterval);
    this.dragScrollInterval = window.setInterval(() => {
      if (!this.isDragging)
        this.stopAutoScroll();
    }, 16);
  }
  updateAutoScroll(mouseY) {
    const scrollSpeed = 10;
    const scrollThreshold = 100;
    const viewportHeight = window.innerHeight;
    if (mouseY < scrollThreshold)
      window.scrollBy(0, -scrollSpeed);
    else if (mouseY > viewportHeight - scrollThreshold)
      window.scrollBy(0, scrollSpeed);
  }
  stopAutoScroll() {
    if (this.dragScrollInterval) {
      clearInterval(this.dragScrollInterval);
      this.dragScrollInterval = void 0;
    }
    this.isDragging = false;
  }
  onDropOnCharacter(event, characterId) {
    event.preventDefault();
    this.stopAutoScroll();
    const type = event.dataTransfer.getData("lootType");
    const index = parseInt(event.dataTransfer.getData("lootIndex"));
    const world = this.store.worldValue;
    if (!world)
      return;
    if (type === "bundle") {
      const bundle = this.lootBundleLibrary[index];
      if (bundle) {
        this.characterApi.loadCharacter(characterId).then((freshSheet) => {
          if (!freshSheet)
            return;
          bundle.items.forEach((item) => this.giveItemToCharacter(characterId, "item", item, freshSheet));
          bundle.runes.forEach((rune) => this.giveItemToCharacter(characterId, "rune", rune, freshSheet));
          bundle.spells.forEach((spell) => this.giveItemToCharacter(characterId, "spell", spell, freshSheet));
          bundle.skills.forEach((skill) => this.giveItemToCharacter(characterId, "skill", skill, freshSheet));
        });
      }
      return;
    }
    let lootData;
    switch (type) {
      case "item":
        lootData = this.mergedItems()[index];
        break;
      case "rune":
        lootData = this.mergedRunes()[index];
        break;
      case "spell":
        lootData = this.mergedSpells()[index];
        break;
      case "skill":
        lootData = this.mergedSkills()[index];
        break;
    }
    if (lootData) {
      this.characterApi.loadCharacter(characterId).then((freshSheet) => {
        if (!freshSheet)
          return;
        this.giveItemToCharacter(characterId, type, lootData, freshSheet);
      });
    }
  }
  giveItemToCharacter(characterId, type, lootData, freshSheet) {
    let fieldPath;
    let currentArray;
    switch (type) {
      case "item":
        fieldPath = "inventory";
        currentArray = freshSheet.inventory || [];
        break;
      case "rune":
        fieldPath = "runes";
        currentArray = freshSheet.runes || [];
        break;
      case "spell":
        fieldPath = "spells";
        currentArray = freshSheet.spells || [];
        break;
      case "skill":
        fieldPath = "skills";
        currentArray = freshSheet.skills || [];
        break;
    }
    currentArray.push(__spreadValues({}, lootData));
    this.characterSocket.sendPatch(characterId, { path: fieldPath, value: currentArray });
    this.sendDirectLootNotification(characterId, type, lootData);
  }
  sendDirectLootNotification(characterId, type, data) {
    const lootItem = {
      id: `direct_${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      claimedBy: []
    };
    this.worldSocket.sendDirectLoot(characterId, lootItem);
  }
  // ==================== Loot Bundle Events ====================
  onBundleCreated(bundle) {
    const world = this.store.worldValue;
    if (world) {
      const currentBundles = world.lootBundleLibrary || [];
      const existingIndex = currentBundles.findIndex((b) => b.name === bundle.name);
      const newBundles = existingIndex >= 0 ? currentBundles.map((b, i) => i === existingIndex ? bundle : b) : [...currentBundles, bundle];
      this.store.applyPatch({ path: "lootBundleLibrary", value: newBundles });
    }
  }
  onBundleDeleted(index) {
    const world = this.store.worldValue;
    if (world) {
      const currentBundles = world.lootBundleLibrary || [];
      const newBundles = [...currentBundles];
      newBundles.splice(index, 1);
      this.store.applyPatch({ path: "lootBundleLibrary", value: newBundles });
    }
  }
  // ==================== Helpers ====================
  openCharacterSheet(characterId) {
    const url = `/characters/${characterId}`;
    window.open(url, "_blank");
  }
  // Get resource status block by formula type
  getResourceStatus(sheet, type) {
    return sheet.statuses?.find((s) => s.formulaType === type);
  }
  // Get current resource value
  getResourceCurrent(sheet, type) {
    const status = this.getResourceStatus(sheet, type);
    return status?.statusCurrent || 0;
  }
  // Get max resource value using the same formula as currentstat.component
  getResourceMax(sheet, type) {
    return this.trueStats.calculateResourceMax(sheet, type);
  }
  // Get resource percentage
  getResourcePercentage(sheet, type) {
    const max = this.getResourceMax(sheet, type);
    if (max === 0)
      return 0;
    const current = this.getResourceCurrent(sheet, type);
    return current / max * 100;
  }
  // Expose FormulaType enum to template
  FormulaType = FormulaType;
  // Library management
  openLibrarySelector() {
    this.showLibrarySelector = true;
    const world = this.store.worldValue;
    if (this.librarySelector && world) {
      this.librarySelector.setSelectedLibraries(world.linkedLibraries || []);
    }
    setTimeout(() => {
      if (this.librarySelector && world) {
        this.librarySelector.setSelectedLibraries(world.linkedLibraries || []);
      }
    }, 0);
    this.cdr.markForCheck();
  }
  handleLibrariesChanged(libraryIds) {
    const world = this.store.worldValue;
    if (world) {
      const withDependencies = this.resolveLibraryDependencies(libraryIds);
      world.linkedLibraries = withDependencies;
      this.store.save();
      console.log("[WORLD] Updated linked libraries (with dependencies):", withDependencies);
    }
    this.cdr.markForCheck();
  }
  /**
   * Resolve all library dependencies recursively
   * Returns array with libraries + all their dependencies (flattened, deduplicated)
   */
  resolveLibraryDependencies(libraryIds, visited = /* @__PURE__ */ new Set()) {
    const result = [];
    const allLibs = this.loadedLibraries();
    for (const id of libraryIds) {
      if (visited.has(id))
        continue;
      visited.add(id);
      if (!result.includes(id)) {
        result.push(id);
      }
      const lib = allLibs.find((l) => l.id === id);
      if (lib?.dependencies && lib.dependencies.length > 0) {
        const deps = this.resolveLibraryDependencies(lib.dependencies, visited);
        deps.forEach((depId) => {
          if (!result.includes(depId)) {
            result.push(depId);
          }
        });
      }
    }
    return result;
  }
  // Context menu for character interactions
  handleCharacterRightClick(event, characterId) {
    event.preventDefault();
    this.selectedCharacterForContextMenu = characterId;
    const character = this.partyCharacters.get(characterId);
    const charName = character?.name || characterId;
    const menuItems = [];
    menuItems.push({ icon: "\u{1F4CB}", label: `${charName} \xF6ffnen`, action: `open_sheet::${characterId}` });
    menuItems.push({ label: "", action: "", divider: true });
    menuItems.push({ icon: "\u{1F4E6}", label: "Item senden", action: `send_picker::item::${characterId}` });
    menuItems.push({ icon: "\u{1F52E}", label: "Zauber senden", action: `send_picker::spell::${characterId}` });
    menuItems.push({ icon: "\u{1F48E}", label: "Rune senden", action: `send_picker::rune::${characterId}` });
    menuItems.push({ icon: "\u2694", label: "F\xE4higkeit senden", action: `send_picker::skill::${characterId}` });
    menuItems.push({ label: "", action: "", divider: true });
    menuItems.push({ icon: "\u2728", label: "Status verwalten", action: `manage_status::${characterId}` });
    menuItems.push({ label: "", action: "", divider: true });
    menuItems.push({ icon: "\u{1F4D6}", label: "Materialwissen verwalten", action: `manage_knowledge::material::${characterId}` });
    menuItems.push({ icon: "\u{1F528}", label: "Schmiedewissen verwalten", action: `manage_knowledge::forge-trait::${characterId}` });
    this.contextMenu?.show(event.clientX, event.clientY, menuItems);
  }
  // ── Knowledge Management ─────────────────────────────────────────────────────
  async openKnowledgeManager(characterId, type = "material") {
    this.knowledgeManagerFor = characterId;
    this.knowledgeManagerType = type;
    this.knowledgeManagerSearch = "";
    this.knowledgeManagerLoading = true;
    this.cdr.markForCheck();
    try {
      const libraries = await firstValueFrom(this.assetBrowserApi.getAllLibraries());
      const character = this.partyCharacters.get(characterId);
      if (type === "material") {
        const materialFiles = [];
        for (const lib of libraries) {
          const mats = await firstValueFrom(this.assetBrowserApi.searchFiles(lib.id, "", ["material"]));
          materialFiles.push(...mats);
        }
        const knownIds = new Set(character?.knownMaterialIds ?? []);
        this.knowledgeManagerMaterials = materialFiles.map((f) => f.data).filter((m) => !m.isPublic).map((m) => ({ material: m, known: knownIds.has(m.id) }));
      } else {
        const forgeTraitFiles = [];
        for (const lib of libraries) {
          const traits = await firstValueFrom(this.assetBrowserApi.searchFiles(lib.id, "", ["forge-trait"]));
          forgeTraitFiles.push(...traits);
        }
        const knownIds = new Set(character?.knownForgeTraitIds ?? []);
        this.knowledgeManagerForgeTraits = forgeTraitFiles.map((f) => f.data).filter((t) => !t.isPublic).map((t) => ({ forgeTrait: t, known: knownIds.has(t.id) }));
      }
    } catch (e) {
      console.error("Knowledge manager: Fehler beim Laden", e);
    } finally {
      this.knowledgeManagerLoading = false;
      this.cdr.markForCheck();
    }
  }
  get filteredKnowledgeMaterials() {
    const q = this.knowledgeManagerSearch.toLowerCase();
    if (!q)
      return this.knowledgeManagerMaterials;
    return this.knowledgeManagerMaterials.filter((m) => m.material.name.toLowerCase().includes(q));
  }
  get filteredKnowledgeForgeTraits() {
    const q = this.knowledgeManagerSearch.toLowerCase();
    if (!q)
      return this.knowledgeManagerForgeTraits;
    return this.knowledgeManagerForgeTraits.filter((t) => t.forgeTrait.name.toLowerCase().includes(q));
  }
  toggleMaterialKnowledge(entry) {
    entry.known = !entry.known;
    this.cdr.markForCheck();
  }
  toggleForgeTraitKnowledge(entry) {
    entry.known = !entry.known;
    this.cdr.markForCheck();
  }
  saveKnowledgeManager() {
    if (!this.knowledgeManagerFor)
      return;
    const char = this.partyCharacters.get(this.knowledgeManagerFor);
    const name = char?.name ?? this.knowledgeManagerFor;
    if (this.knowledgeManagerType === "material") {
      const knownIds = this.knowledgeManagerMaterials.filter((e) => e.known).map((e) => e.material.id);
      this.characterSocket.sendPatch(this.knowledgeManagerFor, { path: "/knownMaterialIds", value: knownIds });
      this.notification.success(`Materialwissen f\xFCr ${name} gespeichert.`, 2e3);
    } else {
      const knownIds = this.knowledgeManagerForgeTraits.filter((e) => e.known).map((e) => e.forgeTrait.id);
      this.characterSocket.sendPatch(this.knowledgeManagerFor, { path: "/knownForgeTraitIds", value: knownIds });
      this.notification.success(`Schmiedewissen f\xFCr ${name} gespeichert.`, 2e3);
    }
    this.knowledgeManagerFor = null;
    this.cdr.markForCheck();
  }
  closeKnowledgeManager() {
    this.knowledgeManagerFor = null;
    this.cdr.markForCheck();
  }
  /** Loads all materials and forge traits from the asset browser API for the knowledge tab. */
  async loadKnowledgeData() {
    if (this.knowledgeDataLoaded)
      return;
    try {
      const libraries = await firstValueFrom(this.assetBrowserApi.getAllLibraries());
      const materials = [];
      const forgeTraits = [];
      for (const lib of libraries) {
        const mats = await firstValueFrom(this.assetBrowserApi.searchFiles(lib.id, "", ["material"]));
        materials.push(...mats.map((f) => f.data));
        const traits = await firstValueFrom(this.assetBrowserApi.searchFiles(lib.id, "", ["forge-trait"]));
        forgeTraits.push(...traits.map((f) => f.data));
      }
      this.allMaterials = materials;
      this.allForgeTraits = forgeTraits;
      this.knowledgeDataLoaded = true;
      this.cdr.markForCheck();
    } catch (e) {
      console.error("[WORLD] Fehler beim Laden der Wissensdaten", e);
    }
  }
  get knownMaterialCount() {
    return this.knowledgeManagerMaterials.filter((e) => e.known).length;
  }
  get knownForgeTraitCount() {
    return this.knowledgeManagerForgeTraits.filter((e) => e.known).length;
  }
  // Context menu for library items (send to player, edit)
  onLibraryItemContextMenu(eventData) {
    const { event, type, index } = eventData;
    event.preventDefault();
    this.selectedLibraryItemType = type;
    this.selectedLibraryItemIndex = index;
    const menuItems = [];
    this.partyCharacters.forEach((character, characterId) => {
      const charName = character.name || "Unknown";
      menuItems.push({
        icon: "\u{1F4E4}",
        label: `An ${charName} senden`,
        action: `send_to::${characterId}`
      });
    });
    if (this.partyCharacters.size === 0) {
      menuItems.push({
        icon: "\u2139\uFE0F",
        label: "Keine Charaktere in der Party",
        action: "none"
      });
    }
    menuItems.push({ label: "", action: "", divider: true });
    menuItems.push({
      icon: "\u270F\uFE0F",
      label: "Bearbeiten",
      action: `edit::${type}`
    });
    this.contextMenu?.show(event.clientX, event.clientY, menuItems);
  }
  handleContextMenuAction(action) {
    if (action === "none")
      return;
    const parts = action.split("::");
    const command = parts[0];
    switch (command) {
      case "open_sheet":
        this.openCharacterSheet(parts[1]);
        break;
      case "send_picker":
        this.sendPickerType = parts[1];
        this.sendPickerFor = parts[2];
        this.sendPickerSearch = "";
        this.cdr.markForCheck();
        break;
      case "manage_status":
        this.statusManagerFor = parts[1];
        this.statusManagerSearch = "";
        this.cdr.markForCheck();
        break;
      case "manage_knowledge":
        this.openKnowledgeManager(parts[2], parts[1]);
        break;
      case "remove_status": {
        const statusEffectId = parts[1];
        const appliedAt = parseInt(parts[2], 10);
        this.removeStatusEffectFromCharacter(this.selectedCharacterForContextMenu, statusEffectId, appliedAt);
        break;
      }
      case "send_to":
        this.sendItemToCharacter(parts[1]);
        break;
      case "edit":
        this.editSelectedLibraryItem();
        break;
    }
  }
  // Send the selected library item to a character
  sendItemToCharacter(characterId) {
    if (!this.selectedLibraryItemType || this.selectedLibraryItemIndex < 0)
      return;
    const character = this.partyCharacters.get(characterId);
    if (!character) {
      console.warn("Character not found:", characterId);
      return;
    }
    let itemData;
    let patchPath;
    switch (this.selectedLibraryItemType) {
      case "item":
        itemData = this.mergedItems()[this.selectedLibraryItemIndex];
        patchPath = "/inventory/-";
        break;
      case "rune":
        itemData = this.mergedRunes()[this.selectedLibraryItemIndex];
        patchPath = "/runes/-";
        break;
      case "spell":
        itemData = this.mergedSpells()[this.selectedLibraryItemIndex];
        patchPath = "/spells/-";
        break;
      case "skill":
        itemData = this.mergedSkills()[this.selectedLibraryItemIndex];
        patchPath = "/skills/-";
        break;
      default:
        return;
    }
    if (!itemData) {
      console.warn("Item not found at index:", this.selectedLibraryItemIndex);
      return;
    }
    const patch = {
      path: patchPath,
      value: __spreadValues({}, itemData)
      // Clone to avoid reference issues
    };
    this.characterSocket.sendPatch(characterId, patch);
    const typeName = this.selectedLibraryItemType === "item" ? "Gegenstand" : this.selectedLibraryItemType === "rune" ? "Rune" : this.selectedLibraryItemType === "spell" ? "Zauber" : "F\xE4higkeit";
    this.notification.success(`${typeName} "${itemData.name}" wurde an ${character.name} gesendet.`, 2500);
    this.cdr.detectChanges();
    console.log(`Sent ${this.selectedLibraryItemType} to character:`, character.name);
  }
  // Open editor for the selected library item
  editSelectedLibraryItem() {
    if (!this.selectedLibraryItemType || this.selectedLibraryItemIndex < 0)
      return;
    switch (this.selectedLibraryItemType) {
      case "item":
        this.openItemEditor(this.selectedLibraryItemIndex);
        break;
      case "rune":
        this.openRuneEditorDialog(this.selectedLibraryItemIndex);
        break;
      case "spell":
        this.openSpellEditorDialog(this.selectedLibraryItemIndex);
        break;
      case "skill":
        this.openSkillEditorDialog(this.selectedLibraryItemIndex);
        break;
    }
  }
  applyStatusEffectToCharacter(characterId, statusEffectId, libraryId) {
    const character = this.partyCharacters.get(characterId);
    if (!character)
      return;
    const effectDef = this.mergedStatusEffects().find((e) => e.id === statusEffectId);
    const existingIndex = (character.activeStatusEffects ?? []).findIndex((effect) => effect.statusEffectId === statusEffectId);
    if (!character.activeStatusEffects) {
      character.activeStatusEffects = [];
    }
    if (existingIndex !== -1) {
      const maxStacks = effectDef?.maxStacks || 1;
      const existing = character.activeStatusEffects[existingIndex];
      const currentStacks = existing.stacks || 1;
      if (currentStacks < maxStacks) {
        character.activeStatusEffects[existingIndex] = __spreadProps(__spreadValues({}, existing), { stacks: currentStacks + 1 });
      } else {
        console.log("Status effect already at max stacks");
        return;
      }
    } else {
      const activeEffect = {
        statusEffectId,
        sourceLibraryId: libraryId,
        appliedAt: Date.now(),
        duration: effectDef?.defaultDuration,
        stacks: 1
      };
      character.activeStatusEffects.push(activeEffect);
    }
    const seen = new Set(character.seenStatusEffectIds ?? []);
    seen.add(statusEffectId);
    character.seenStatusEffectIds = Array.from(seen);
    this.characterSocket.sendPatch(characterId, { path: "/activeStatusEffects", value: character.activeStatusEffects });
    this.characterSocket.sendPatch(characterId, { path: "/seenStatusEffectIds", value: character.seenStatusEffectIds });
    this.cdr.markForCheck();
  }
  applyJsonPatch(target, patch) {
    const keys = patch.path.startsWith("/") ? patch.path.substring(1).split("/") : patch.path.split(".");
    let current = target;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);
      if (!isNaN(index) && Array.isArray(current))
        current = current[index];
      else
        current = current[key] ??= {};
    }
    const finalKey = keys[keys.length - 1];
    if (finalKey === "-" && Array.isArray(current)) {
      current.push(patch.value);
      return;
    }
    const finalIndex = parseInt(finalKey, 10);
    if (!isNaN(finalIndex) && Array.isArray(current))
      current[finalIndex] = patch.value;
    else
      current[finalKey] = patch.value;
  }
  static \u0275fac = function WorldComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WorldComponent)(\u0275\u0275directiveInject(ActivatedRoute));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _WorldComponent, selectors: [["app-world"]], viewQuery: function WorldComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(ContextMenuComponent, 5)(LibrarySelectorComponent, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.contextMenu = _t.first);
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.librarySelector = _t.first);
    }
  }, decls: 9, vars: 9, consts: [[3, "spell", "availableRunes"], [3, "itemSelected"], [1, "sm-overlay"], [1, "world-container"], [1, "world-header"], [1, "world-header-links"], ["target", "_blank", "rel", "noopener", 3, "href"], [1, "app-icon", "i-lobby"], [1, "app-icon", "i-map"], [1, "management-grid"], [1, "character-list"], [1, "character-item"], [1, "add-section"], ["type", "text", "placeholder", "Charakter-ID", 3, "ngModelChange", "ngModel"], [3, "click"], [1, "generate-character-btn", 3, "click"], [1, "app-icon", "i-effektivity"], [1, "party-list"], [1, "party-item"], [3, "ngModelChange", "ngModel"], ["value", ""], [1, "party-dashboard-card"], [1, "dashboard-empty"], [1, "dashboard-grid"], [1, "battle-tracker-section"], [3, "engine"], [1, "content-grid"], [1, "battle-loot-card"], [3, "eventAdded", "eventRemoved", "eventUpdated", "navigateToLibrary", "events", "libraries", "mergedItems", "mergedRunes", "mergedSpells", "mergedSkills", "mergedStatusEffects"], [1, "library-card"], [1, "library-header"], [1, "library-header-actions"], ["title", "Verkn\xFCpfte Bibliotheken verwalten", 1, "header-btn", 3, "click"], [1, "app-icon", "i-folder"], ["title", "Papierkorb \xF6ffnen", 1, "header-btn", "secondary", 3, "click"], [1, "app-icon", "i-restore-trash"], [1, "drag-hint"], [3, "openItemEditor", "openRuneEditor", "openSpellEditor", "openSkillEditor", "openStatusEffectEditor", "updateItem", "updateRune", "updateSpell", "updateSkill", "updateStatusEffect", "itemEditingChange", "runeEditingChange", "spellEditingChange", "skillEditingChange", "statusEffectEditingChange", "dragStart", "contextMenuRequest", "items", "runes", "spells", "skills", "statusEffects", "shops", "lootBundles", "materials", "forgeTraits", "dummySheet", "editingItems", "editingRunes", "editingSpells", "editingSkills", "editingStatusEffects", "readonly"], [1, "damage-calc-section"], [3, "worldName"], [3, "item", "sheet", "librarySkills", "librarySpells", "showLibraryImport"], [3, "rune"], [3, "skill"], [1, "dialog-overlay"], [3, "value"], [1, "char-card", "drop-zone"], [1, "char-card", "drop-zone", 3, "dragover", "drop", "dblclick", "contextmenu"], [1, "cc-header"], [1, "cc-portrait"], [1, "cc-name-group"], [1, "cc-name"], [1, "cc-meta"], [1, "cc-level-badge"], [1, "cc-class-badge"], [1, "cc-class-badge", "secondary"], [1, "cc-resources"], ["data-resource", "health", 1, "cc-bar"], [1, "cc-bar-label"], [1, "cc-bar-track"], [1, "cc-bar-fill", "health"], [1, "cc-bar-value"], ["data-resource", "energy", 1, "cc-bar"], [1, "cc-bar-fill", "energy"], ["data-resource", "mana", 1, "cc-bar"], [1, "cc-bar-fill", "mana"], [1, "cc-currency"], [1, "cc-coin", 3, "--coin-color"], [1, "cc-effects"], [1, "cc-effects-header"], [1, "cc-effects-label"], [1, "cc-effect-list"], [1, "cc-effect-chip", 3, "--ec", "title"], [1, "cc-no-effects"], [3, "src", "alt"], [1, "cc-coin"], [1, "cc-effect-chip", 3, "title"], [1, "cc-effect-icon"], [1, "cc-effect-stack"], [1, "cc-effect-dur"], [3, "save", "cancel", "item", "sheet", "librarySkills", "librarySpells", "showLibraryImport"], [3, "save", "cancel", "delete", "item", "sheet", "librarySkills", "librarySpells", "showLibraryImport"], [3, "save", "cancel", "delete", "rune"], [3, "save", "cancel", "delete", "skill"], [1, "dialog-overlay", 3, "click"], [1, "dialog-content", "trash-dialog", 2, "max-width", "800px", "max-height", "80vh", "overflow-y", "auto", 3, "click"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "margin-bottom", "1rem"], [2, "display", "flex", "gap", "0.5rem"], [2, "background", "#d32f2f", "color", "white", "padding", "6px 12px", "border-radius", "4px", "cursor", "pointer", "border", "none", 3, "click", "disabled"], [2, "background", "#666", "color", "white", "padding", "6px 12px", "border-radius", "4px", "cursor", "pointer", "border", "none", 3, "click"], [2, "text-align", "center", "color", "#999", "padding", "2rem"], [2, "display", "flex", "flex-direction", "column", "gap", "0.5rem"], [2, "background", "var(--card-bg)", "border", "1px solid var(--border-color)", "border-radius", "4px", "padding", "1rem", "display", "flex", "justify-content", "space-between", "align-items", "center"], [2, "flex", "1"], [2, "display", "flex", "align-items", "center", "gap", "0.5rem"], [2, "background", "var(--accent)", "color", "white", "padding", "2px 8px", "border-radius", "3px", "font-size", "0.75rem", "text-transform", "uppercase"], [2, "color", "#999", "font-size", "0.85rem", "margin-top", "0.25rem"], [2, "color", "#ccc", "font-size", "0.9rem", "margin-top", "0.5rem", "max-width", "500px", "overflow", "hidden", "text-overflow", "ellipsis", "white-space", "nowrap"], [2, "background", "#4caf50", "color", "white", "padding", "6px 12px", "border-radius", "4px", "cursor", "pointer", "border", "none", 3, "click"], [2, "background", "#d32f2f", "color", "white", "padding", "6px 12px", "border-radius", "4px", "cursor", "pointer", "border", "none", 3, "click"], [3, "save", "cancel", "deleteSpell", "spell", "availableRunes"], [3, "close", "characterGenerated"], [3, "librariesChanged", "close"], [1, "sm-overlay", 3, "click"], [1, "sm-panel", 3, "click"], [1, "sm-header"], [1, "sm-title"], [1, "app-icon", "i-status-effect"], [1, "sm-subtitle"], [1, "sm-close", 3, "click"], [1, "sm-active-section"], ["type", "text", "placeholder", "Effekte suchen...", 1, "sm-search", 3, "ngModelChange", "ngModel"], [1, "sm-effect-grid"], [1, "sm-effect-card", 3, "--ec"], [1, "sm-empty"], [1, "sm-section-label"], [1, "sm-active-list"], [1, "sm-active-chip", 3, "--ec"], [1, "sm-active-chip"], [1, "sm-active-icon"], [1, "sm-active-name"], [1, "sm-active-stack"], [1, "sm-active-dur"], ["title", "Entfernen", 1, "sm-active-remove", 3, "click"], [1, "sm-effect-card", 3, "click"], [1, "sm-effect-icon"], [1, "sm-effect-name"], [1, "sm-effect-tag", "debuff"], ["type", "text", 1, "sm-search", 3, "ngModelChange", "ngModel", "placeholder"], [1, "sm-send-list"], [1, "sm-send-item"], [1, "sm-send-item", 3, "click"], [1, "sm-send-name"], [1, "sm-panel", "km-panel", 3, "click"], [1, "km-loading"], [1, "km-spinner"], [1, "km-hint"], ["type", "text", "placeholder", "Material suchen...", 1, "sm-search", 3, "ngModelChange", "ngModel"], [1, "km-list"], [1, "km-footer"], [1, "km-count"], [1, "km-save-btn", 3, "click"], [1, "km-item", 3, "km-known"], [1, "km-item"], ["type", "checkbox", 3, "change", "checked"], [1, "km-item-info"], [1, "km-item-name"], [1, "km-item-desc"], [1, "km-item-types"], [1, "km-type", "weapon"], [1, "km-type", "armor"], ["type", "text", "placeholder", "Schmiedemerkmal suchen...", 1, "sm-search", 3, "ngModelChange", "ngModel"]], template: function WorldComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275conditionalCreate(0, WorldComponent_Conditional_0_Template, 71, 38);
      \u0275\u0275pipe(1, "async");
      \u0275\u0275conditionalCreate(2, WorldComponent_Conditional_2_Template, 1, 2, "app-spell-editor-overlay", 0);
      \u0275\u0275conditionalCreate(3, WorldComponent_Conditional_3_Template, 1, 0, "app-character-generator");
      \u0275\u0275conditionalCreate(4, WorldComponent_Conditional_4_Template, 1, 0, "app-library-selector");
      \u0275\u0275elementStart(5, "app-context-menu", 1);
      \u0275\u0275listener("itemSelected", function WorldComponent_Template_app_context_menu_itemSelected_5_listener($event) {
        return ctx.handleContextMenuAction($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(6, WorldComponent_Conditional_6_Template, 16, 4, "div", 2);
      \u0275\u0275conditionalCreate(7, WorldComponent_Conditional_7_Template, 14, 6, "div", 2);
      \u0275\u0275conditionalCreate(8, WorldComponent_Conditional_8_Template, 11, 3, "div", 2);
    }
    if (rf & 2) {
      let tmp_0_0;
      \u0275\u0275conditional((tmp_0_0 = \u0275\u0275pipeBind1(1, 7, ctx.store.world$)) ? 0 : -1, tmp_0_0);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.isSpellEditorOpen && ctx.editingSpell !== null && ctx.editingSpellIndex !== null ? 2 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showCharacterGenerator ? 3 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showLibrarySelector ? 4 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.statusManagerFor ? 6 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.sendPickerFor && ctx.sendPickerType ? 7 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.knowledgeManagerFor ? 8 : -1);
    }
  }, dependencies: [CommonModule, CardComponent, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgModel, ItemEditorComponent, SkillEditorComponent, SpellEditorOverlayComponent, RuneEditorComponent, AssetBrowserComponent, LibrarySelectorComponent, ContextMenuComponent, BattleTracker, CurrentEventsManagerComponent, CharacterGeneratorComponent, DamageCalculatorComponent, SoundVolumeControlComponent, AsyncPipe, DatePipe, ImageUrlPipe], styles: ["\n\n[_nghost-%COMP%] {\n  display: block;\n  height: 100vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n.world-container[_ngcontent-%COMP%] {\n  padding: 1rem;\n  max-width: 1800px;\n  margin: 0 auto;\n}\n.world-header[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.world-header-links[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n}\n.world-header-links[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: var(--accent);\n  text-decoration: none;\n  font-weight: 500;\n}\n.world-header-links[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.world-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--accent);\n  font-size: 28px;\n  font-weight: 600;\n}\n.management-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr 2fr;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.content-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 1rem;\n  height: calc(100vh - 300px);\n  min-height: 700px;\n}\n.battle-loot-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n.library-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  padding: 14px;\n  box-sizing: border-box;\n}\n.party-dashboard-card[_ngcontent-%COMP%] {\n  grid-column: span 3;\n}\n.character-list[_ngcontent-%COMP%], \n.party-list[_ngcontent-%COMP%], \n.library-list[_ngcontent-%COMP%], \n.loot-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.character-item[_ngcontent-%COMP%], \n.party-item[_ngcontent-%COMP%], \n.loot-item[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.5rem;\n  background: var(--bg);\n  border-radius: 6px;\n  border: 1px solid var(--border);\n}\n.library-list[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\n  margin-bottom: 0.5rem;\n}\n.character-item[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.party-item[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \n.loot-item[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  flex: 1;\n  color: var(--text);\n}\n.character-item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], \n.party-item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], \n.loot-item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.75rem;\n  background: #ef4444;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.2s;\n}\n.character-item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover, \n.party-item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover, \n.loot-item[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #dc2626;\n}\n.add-section[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  margin-top: 0.5rem;\n}\n.add-section[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.add-section[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.5rem;\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  font-size: 14px;\n}\n.add-section[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], \napp-card[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 500;\n  transition: background 0.2s;\n}\n.add-section[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover, \napp-card[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: var(--accentdark);\n}\n.generate-character-btn[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #4CAF50,\n      #45a049) !important;\n  font-weight: 600 !important;\n  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);\n  transition: all 0.2s !important;\n}\n.generate-character-btn[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);\n}\n.dashboard-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1rem;\n}\n.dashboard-empty[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-style: italic;\n  text-align: center;\n  padding: 2rem 0;\n}\n.char-card[_ngcontent-%COMP%] {\n  background: #0f1829;\n  border: 1px solid var(--border);\n  border-left: 3px solid var(--accent);\n  border-radius: 8px;\n  padding: 14px;\n  transition: box-shadow 0.15s, transform 0.15s;\n  cursor: pointer;\n  position: relative;\n}\n.char-card[_ngcontent-%COMP%]:hover {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--accent);\n  transform: translateY(-1px);\n}\n.cc-header[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.cc-portrait[_ngcontent-%COMP%] {\n  width: 72px;\n  height: 72px;\n  flex-shrink: 0;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 2px solid var(--accent);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.cc-portrait[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.cc-name-group[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n.cc-name[_ngcontent-%COMP%] {\n  margin: 4px 0 0;\n  color: var(--text);\n  font-size: 1.05rem;\n  font-weight: 700;\n}\n.cc-meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 4px;\n  margin-top: 4px;\n}\n.cc-level-badge[_ngcontent-%COMP%], \n.cc-class-badge[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.08);\n  color: rgba(255, 255, 255, 0.55);\n  white-space: nowrap;\n}\n.cc-level-badge[_ngcontent-%COMP%] {\n  color: var(--accent);\n  font-weight: 600;\n}\n.cc-resources[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 10px;\n}\n.cc-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.cc-bar-label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--muted);\n  min-width: 52px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.cc-bar-track[_ngcontent-%COMP%] {\n  flex: 1;\n  height: 18px;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 4px;\n  overflow: hidden;\n  position: relative;\n  border: 1px solid rgba(255, 255, 255, 0.06);\n}\n.cc-bar-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.4s ease;\n}\n.cc-bar-fill.health[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #dc2626 0%,\n      #ef4444 100%);\n  box-shadow: inset 0 0 12px rgba(239, 68, 68, 0.5), 0 0 6px rgba(239, 68, 68, 0.3);\n}\n.cc-bar-fill.energy[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #16a34a 0%,\n      #22c55e 100%);\n  box-shadow: inset 0 0 12px rgba(34, 197, 94, 0.5), 0 0 6px rgba(34, 197, 94, 0.3);\n}\n.cc-bar-fill.mana[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      90deg,\n      #2563eb 0%,\n      #3b82f6 100%);\n  box-shadow: inset 0 0 12px rgba(59, 130, 246, 0.5), 0 0 6px rgba(59, 130, 246, 0.3);\n}\n.cc-bar-value[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.65rem;\n  font-weight: 700;\n  color: #fff;\n  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);\n}\n.cc-currency[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 5px;\n  flex-wrap: wrap;\n  margin-bottom: 10px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.cc-coin[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  padding: 2px 8px;\n  border-radius: 10px;\n  background: color-mix(in srgb, var(--coin-color) 25%, transparent);\n  color: var(--coin-color);\n  border: 1px solid color-mix(in srgb, var(--coin-color) 50%, transparent);\n  line-height: 1.5;\n}\n.cc-effects[_ngcontent-%COMP%] {\n  position: relative;\n}\n.cc-effects-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n.cc-effects-label[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.65rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  font-weight: 600;\n}\n.cc-effects-add[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px dashed rgba(255, 255, 255, 0.15);\n  color: var(--muted);\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.8rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  transition: all 0.15s;\n}\n.cc-effects-add[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: var(--accent);\n  color: var(--accent);\n}\n.cc-effect-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  min-height: 20px;\n}\n.cc-effect-chip[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: color-mix(in srgb, var(--ec, #8b5cf6) 14%, #0f1829);\n  border: 1px solid color-mix(in srgb, var(--ec, #8b5cf6) 40%, transparent);\n  border-radius: 8px;\n  padding: 3px 6px;\n  cursor: default;\n  transition: all 0.15s;\n}\n.cc-effect-chip[_ngcontent-%COMP%]:hover {\n  background: color-mix(in srgb, var(--ec, #8b5cf6) 25%, #0f1829);\n  border-color: color-mix(in srgb, var(--ec, #8b5cf6) 70%, transparent);\n}\n.cc-effect-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  line-height: 1;\n  color: var(--ec, #8b5cf6);\n  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--ec, #8b5cf6) 60%, transparent));\n}\n.cc-effect-stack[_ngcontent-%COMP%] {\n  font-size: 0.6rem;\n  font-weight: 800;\n  color: var(--ec, #8b5cf6);\n}\n.cc-effect-dur[_ngcontent-%COMP%] {\n  font-size: 0.55rem;\n  font-weight: 700;\n  color: color-mix(in srgb, var(--ec, #8b5cf6) 80%, var(--muted));\n  background: rgba(0, 0, 0, 0.4);\n  padding: 1px 3px;\n  border-radius: 3px;\n}\n.cc-no-effects[_ngcontent-%COMP%] {\n  color: rgba(255, 255, 255, 0.15);\n  font-size: 0.75rem;\n}\n.cc-picker-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n}\n.cc-picker[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  z-index: 100;\n  background: #1a1a1e;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  overflow: hidden;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);\n  margin-top: 4px;\n  animation: _ngcontent-%COMP%_ccPickerIn 0.15s ease-out;\n}\n@keyframes _ngcontent-%COMP%_ccPickerIn {\n  from {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.cc-picker-head[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 10px;\n  background: rgba(255, 255, 255, 0.03);\n  border-bottom: 1px solid var(--border);\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--muted);\n}\n.cc-picker-close[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  cursor: pointer;\n  font-size: 0.7rem;\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n.cc-picker-close[_ngcontent-%COMP%]:hover {\n  color: var(--text);\n  background: rgba(255, 255, 255, 0.08);\n}\n.cc-picker-empty[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.72rem;\n  font-style: italic;\n  padding: 12px;\n  text-align: center;\n  margin: 0;\n}\n.cc-picker-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  max-height: 200px;\n  overflow-y: auto;\n}\n.cc-picker-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 7px 10px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: var(--text);\n  font-size: 0.82rem;\n  font-weight: 500;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  transition: background 0.12s;\n}\n.cc-picker-item[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.15);\n}\n.cc-picker-item-icon[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  line-height: 1;\n}\n.cc-picker-item-name[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.cc-picker-list[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 4px;\n}\n.cc-picker-list[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: transparent;\n}\n.cc-picker-list[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 2px;\n}\n.draggable[_ngcontent-%COMP%] {\n  cursor: move;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.draggable[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.draggable[_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.drop-zone[_ngcontent-%COMP%] {\n  position: relative;\n  transition: background 0.2s, border 0.2s;\n}\n.drop-zone.drag-over[_ngcontent-%COMP%] {\n  background: #f3f4f6;\n  border: 2px dashed var(--accent);\n}\n.char-card.drop-zone[_ngcontent-%COMP%] {\n  border: 1px solid var(--border);\n  border-left: 3px solid var(--accent);\n}\n.char-card.drop-zone[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent);\n}\n.drop-hint[_ngcontent-%COMP%] {\n  display: none;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background: rgba(107, 70, 193, 0.95);\n  color: white;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-weight: 600;\n  font-size: 14px;\n  z-index: 10;\n  pointer-events: none;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}\n.drop-zone[_ngcontent-%COMP%]:hover   .drop-hint[_ngcontent-%COMP%] {\n  display: block;\n}\n.library-card[_ngcontent-%COMP%]   app-asset-browser[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  display: block;\n}\n.drag-hint[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--muted);\n  font-style: italic;\n  margin: 8px 0;\n}\n.library-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.library-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n}\n.library-header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n}\n.header-btn[_ngcontent-%COMP%] {\n  background: var(--accent);\n  color: white;\n  padding: 5px 10px;\n  border-radius: 4px;\n  border: none;\n  cursor: pointer;\n  font-size: 0.85rem;\n  white-space: nowrap;\n}\n.header-btn[_ngcontent-%COMP%]:hover {\n  opacity: 0.85;\n}\n.header-btn.secondary[_ngcontent-%COMP%] {\n  background: var(--card-bg);\n  color: var(--text-color);\n  border: 1px solid var(--border-color);\n}\n.empty-loot[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--muted);\n  font-style: italic;\n  padding: 2rem;\n  min-height: 100px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px dashed var(--border);\n  border-radius: 6px;\n  margin: 0;\n  background: var(--bg);\n}\n.claimed-count[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--muted);\n  background: var(--bg);\n  padding: 4px 8px;\n  border-radius: 6px;\n  margin-left: 8px;\n  font-weight: 500;\n}\n.reveal-loot-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-top: 1rem;\n  padding: 12px;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.reveal-loot-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent-hover);\n}\n.dialog-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, 0.5);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 1000;\n}\n.dialog-content[_ngcontent-%COMP%] {\n  background: var(--card);\n  padding: 2rem;\n  border-radius: 8px;\n  max-width: 600px;\n  width: 90%;\n  max-height: 90vh;\n  overflow-y: auto;\n}\n.dialog-content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin-top: 0;\n  color: var(--accent);\n}\n.empty-message[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--text-muted);\n  padding: 2rem;\n  font-style: italic;\n}\n.battle-tracker-section[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n}\n.damage-calc-section[_ngcontent-%COMP%] {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n  max-width: 720px;\n}\n.cdk-drag-animating[_ngcontent-%COMP%] {\n  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);\n}\n.cdk-drop-list-dragging[_ngcontent-%COMP%]   .cdk-drag[_ngcontent-%COMP%] {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n.sm-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.55);\n  -webkit-backdrop-filter: blur(3px);\n  backdrop-filter: blur(3px);\n  z-index: 15000;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1rem;\n  animation: _ngcontent-%COMP%_smFadeIn 0.2s ease-out;\n}\n@keyframes _ngcontent-%COMP%_smFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes _ngcontent-%COMP%_smPanelIn {\n  from {\n    opacity: 0;\n    transform: scale(0.95) translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.sm-panel[_ngcontent-%COMP%] {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 14px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);\n  min-width: 360px;\n  max-width: 520px;\n  width: 100%;\n  max-height: 80vh;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_smPanelIn 0.2s ease-out;\n}\n.sm-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 14px 18px 12px;\n  border-bottom: 1px solid var(--border);\n  flex-shrink: 0;\n}\n.sm-title[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text);\n}\n.sm-subtitle[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--muted);\n  flex: 1;\n}\n.sm-close[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  font-size: 1rem;\n  cursor: pointer;\n  padding: 4px 8px;\n  border-radius: 4px;\n  transition: all 0.15s;\n}\n.sm-close[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text);\n}\n.sm-active-section[_ngcontent-%COMP%] {\n  padding: 10px 16px;\n  border-bottom: 1px solid var(--border);\n  flex-shrink: 0;\n}\n.sm-section-label[_ngcontent-%COMP%] {\n  font-size: 0.65rem;\n  font-weight: 700;\n  color: var(--muted);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  display: block;\n  margin-bottom: 6px;\n}\n.sm-active-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.sm-active-chip[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 8px 4px 6px;\n  background: color-mix(in srgb, var(--ec, var(--accent)) 14%, var(--bg));\n  border: 1px solid color-mix(in srgb, var(--ec, var(--accent)) 40%, transparent);\n  border-radius: 8px;\n  font-size: 0.75rem;\n}\n.sm-active-icon[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n}\n.sm-active-name[_ngcontent-%COMP%] {\n  color: var(--text);\n  font-weight: 600;\n}\n.sm-active-stack[_ngcontent-%COMP%] {\n  color: var(--ec, var(--accent));\n  font-weight: 700;\n  font-size: 0.65rem;\n}\n.sm-active-dur[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.65rem;\n}\n.sm-active-remove[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  font-size: 0.7rem;\n  cursor: pointer;\n  padding: 2px 4px;\n  border-radius: 3px;\n  transition: all 0.15s;\n  margin-left: 2px;\n}\n.sm-active-remove[_ngcontent-%COMP%]:hover {\n  color: #f87171;\n  background: rgba(239, 68, 68, 0.15);\n}\n.sm-search[_ngcontent-%COMP%] {\n  width: 100%;\n  background: var(--bg);\n  border: none;\n  border-bottom: 1px solid var(--border);\n  color: var(--text);\n  padding: 10px 16px;\n  font-size: 0.85rem;\n  outline: none;\n  flex-shrink: 0;\n  box-sizing: border-box;\n}\n.sm-search[_ngcontent-%COMP%]::placeholder {\n  color: var(--muted);\n}\n.sm-effect-grid[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 12px;\n  overflow-y: auto;\n  flex: 1;\n}\n.sm-effect-card[_ngcontent-%COMP%] {\n  position: relative;\n  width: 72px;\n  min-height: 88px;\n  background: color-mix(in srgb, var(--ec, var(--accent)) 12%, var(--card));\n  border: 1px solid color-mix(in srgb, var(--ec, var(--accent)) 40%, transparent);\n  border-radius: 10px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-end;\n  padding: 6px 4px 5px;\n  gap: 3px;\n  cursor: pointer;\n  transition: all 0.15s;\n  color: inherit;\n}\n.sm-effect-card[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  background: color-mix(in srgb, var(--ec, var(--accent)) 22%, var(--card));\n  border-color: color-mix(in srgb, var(--ec, var(--accent)) 75%, transparent);\n  box-shadow: 0 4px 14px color-mix(in srgb, var(--ec, var(--accent)) 35%, transparent);\n}\n.sm-effect-icon[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  line-height: 1;\n  color: var(--ec, var(--accent));\n  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ec, var(--accent)) 60%, transparent));\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n}\n.sm-effect-name[_ngcontent-%COMP%] {\n  color: var(--text);\n  font-size: 0.6rem;\n  font-weight: 600;\n  text-align: center;\n  line-height: 1.25;\n  overflow: hidden;\n  display: -webkit-box;\n  line-clamp: 2;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  max-width: 100%;\n}\n.sm-effect-tag[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 3px;\n  right: 3px;\n  font-size: 0.48rem;\n  font-weight: 700;\n  padding: 1px 4px;\n  border-radius: 6px;\n}\n.sm-effect-tag.debuff[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.2);\n  color: #f87171;\n  border: 1px solid rgba(239, 68, 68, 0.35);\n}\n.sm-empty[_ngcontent-%COMP%] {\n  color: var(--muted);\n  font-size: 0.78rem;\n  padding: 24px 16px;\n  text-align: center;\n  font-style: italic;\n  width: 100%;\n}\n.sm-send-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  max-height: 50vh;\n}\n.sm-send-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  color: var(--text);\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n  text-align: left;\n}\n.sm-send-item[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.12);\n}\n.sm-send-name[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.sm-effect-grid[_ngcontent-%COMP%]::-webkit-scrollbar, \n.sm-send-list[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 5px;\n}\n.sm-effect-grid[_ngcontent-%COMP%]::-webkit-scrollbar-track, \n.sm-send-list[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: var(--card);\n}\n.sm-effect-grid[_ngcontent-%COMP%]::-webkit-scrollbar-thumb, \n.sm-send-list[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 3px;\n}\n.km-panel[_ngcontent-%COMP%] {\n  max-width: 560px;\n}\n.km-loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.75rem;\n  padding: 2.5rem;\n  color: var(--muted);\n  font-size: 0.88rem;\n}\n.km-spinner[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  border: 2px solid var(--border);\n  border-top-color: var(--accent);\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\n}\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.km-hint[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--muted);\n  padding: 8px 16px 0;\n  margin: 0;\n  line-height: 1.4;\n}\n.km-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  max-height: 45vh;\n  padding: 6px 0;\n}\n.km-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 9px 16px;\n  cursor: pointer;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  transition: background 0.15s;\n}\n.km-item[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.04);\n}\n.km-item.km-known[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.06);\n}\n.km-item[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  margin-top: 3px;\n  flex-shrink: 0;\n  accent-color: var(--accent);\n  width: 15px;\n  height: 15px;\n  cursor: pointer;\n}\n.km-item-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n  flex: 1;\n  min-width: 0;\n}\n.km-item-name[_ngcontent-%COMP%] {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: var(--text);\n}\n.km-item-desc[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--muted);\n}\n.km-item-types[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.35rem;\n  margin-top: 0.1rem;\n}\n.km-type[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  font-weight: 600;\n  padding: 0.1rem 0.45rem;\n  border-radius: 8px;\n  text-transform: uppercase;\n}\n.km-type.weapon[_ngcontent-%COMP%] {\n  background: rgba(251, 146, 60, 0.15);\n  color: #fb923c;\n}\n.km-type.armor[_ngcontent-%COMP%] {\n  background: rgba(96, 165, 250, 0.15);\n  color: #60a5fa;\n}\n.km-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px;\n  border-top: 1px solid var(--border);\n  flex-shrink: 0;\n}\n.km-count[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--muted);\n}\n.km-save-btn[_ngcontent-%COMP%] {\n  padding: 0.45rem 1.4rem;\n  background: var(--accent);\n  border: none;\n  border-radius: 6px;\n  color: white;\n  font-size: 0.85rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition: filter 0.2s;\n}\n.km-save-btn[_ngcontent-%COMP%]:hover {\n  filter: brightness(1.15);\n}\n/*# sourceMappingURL=world.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WorldComponent, [{
    type: Component,
    args: [{ selector: "app-world", standalone: true, imports: [CommonModule, CardComponent, FormsModule, ItemEditorComponent, SkillEditorComponent, SpellEditorOverlayComponent, RuneEditorComponent, AssetBrowserComponent, LibrarySelectorComponent, ContextMenuComponent, BattleTracker, CurrentEventsManagerComponent, ImageUrlPipe, CharacterGeneratorComponent, DamageCalculatorComponent, SoundVolumeControlComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `@if (store.world$ | async; as world) {\r
<div class="world-container">\r
  <div class="world-header">\r
    <h1>{{ worldName }} - GM Ansicht</h1>\r
    <div class="world-header-links">\r
      <a [href]="'/lobby/' + worldName + '?gm=true'" target="_blank" rel="noopener"><span class="app-icon i-lobby"></span> Lobby</a>\r
      <a [href]="'/world-map/' + worldName + '?gm=true'" target="_blank" rel="noopener"><span class="app-icon i-map"></span> Weltkarte</a>\r
      <!-- Sound effects volume (persisted per browser, shared with the lobby) -->\r
      <app-sound-volume-control></app-sound-volume-control>\r
    </div>\r
  </div>\r
\r
  <!-- Top Section: Character Management -->\r
  <div class="management-grid">\r
    <!-- All Characters -->\r
    <app-card>\r
      <h2>Alle Charaktere</h2>\r
      <div class="character-list">\r
        @for (characterId of world.characterIds; track characterId; let i = $index) {\r
          <div class="character-item">\r
            <span>{{ characterId }}</span>\r
            <button (click)="removeCharacter(i)">Entfernen</button>\r
          </div>\r
        }\r
      </div>\r
      <div class="add-section">\r
        <input\r
          type="text"\r
          [(ngModel)]="newCharacterId"\r
          placeholder="Charakter-ID"\r
        />\r
        <button (click)="addCharacter()">Charakter hinzuf\xFCgen</button>\r
        <button (click)="openCharacterGenerator()" class="generate-character-btn">\r
          <span class="app-icon i-effektivity"></span> Generate Character\r
        </button>\r
      </div>\r
    </app-card>\r
\r
    <!-- Active Party -->\r
    <app-card>\r
      <h2>Aktive Partei</h2>\r
      <div class="party-list">\r
        @for (partyId of world.partyIds; track partyId; let i = $index) {\r
          <div class="party-item">\r
            <span>{{ partyId }}</span>\r
            <button (click)="removeFromParty(i)">Entfernen</button>\r
          </div>\r
        }\r
      </div>\r
      <div class="add-section">\r
        <select [(ngModel)]="selectedCharacterForParty">\r
          <option value="">Charakter w\xE4hlen...</option>\r
          @for (characterId of world.characterIds; track characterId) {\r
            @if (!world.partyIds.includes(characterId)) {\r
              <option [value]="characterId">{{ characterId }}</option>\r
            }\r
          }\r
        </select>\r
        <button (click)="addToParty()">Zur Partei hinzuf\xFCgen</button>\r
      </div>\r
    </app-card>\r
\r
    <!-- Party Dashboard -->\r
    <app-card class="party-dashboard-card">\r
      <h2>Partei-\xDCbersicht</h2>\r
      @if (getPartyCharacterArray().length === 0) {\r
        <p class="dashboard-empty">Keine Charaktere in der Partei. F\xFCge Charaktere hinzu um ihre Werte zu sehen.</p>\r
      } @else {\r
        <div class="dashboard-grid">\r
          @for (member of getPartyCharacterArray(); track member.id) {\r
            <div class="char-card drop-zone"\r
                 (dragover)="onDragOver($event)"\r
                 (drop)="onDropOnCharacter($event, member.id)"\r
                 (dblclick)="openCharacterSheet(member.id)"\r
                 (contextmenu)="handleCharacterRightClick($event, member.id)">\r
\r
              <!-- Header: portrait + name -->\r
              <div class="cc-header">\r
                @if (member.sheet.portrait) {\r
                  <div class="cc-portrait">\r
                    <img [src]="member.sheet.portrait | imageUrl" alt="{{ member.sheet.name || member.id }}" />\r
                  </div>\r
                }\r
                <div class="cc-name-group">\r
                  <h3 class="cc-name">{{ member.sheet.name || member.id }}</h3>\r
                  <div class="cc-meta">\r
                    <span class="cc-level-badge">Lvl {{ member.sheet.level || 1 }}</span>\r
                    @if (member.sheet.primary_class) {\r
                      <span class="cc-class-badge">{{ member.sheet.primary_class }}</span>\r
                    }\r
                    @if (member.sheet.secondary_class) {\r
                      <span class="cc-class-badge secondary">{{ member.sheet.secondary_class }}</span>\r
                    }\r
                  </div>\r
                </div>\r
              </div>\r
\r
              <!-- Resource bars (skill-card style) -->\r
              <div class="cc-resources">\r
                <div class="cc-bar" data-resource="health">\r
                  <span class="cc-bar-label">Leben</span>\r
                  <div class="cc-bar-track">\r
                    <div class="cc-bar-fill health"\r
                         [style.width.%]="getResourcePercentage(member.sheet, FormulaType.LIFE)"></div>\r
                    <span class="cc-bar-value">{{ getResourceCurrent(member.sheet, FormulaType.LIFE) }} / {{ getResourceMax(member.sheet, FormulaType.LIFE) }}</span>\r
                  </div>\r
                </div>\r
                <div class="cc-bar" data-resource="energy">\r
                  <span class="cc-bar-label">Ausdauer</span>\r
                  <div class="cc-bar-track">\r
                    <div class="cc-bar-fill energy"\r
                         [style.width.%]="getResourcePercentage(member.sheet, FormulaType.ENERGY)"></div>\r
                    <span class="cc-bar-value">{{ getResourceCurrent(member.sheet, FormulaType.ENERGY) }} / {{ getResourceMax(member.sheet, FormulaType.ENERGY) }}</span>\r
                  </div>\r
                </div>\r
                <div class="cc-bar" data-resource="mana">\r
                  <span class="cc-bar-label">Mana</span>\r
                  <div class="cc-bar-track">\r
                    <div class="cc-bar-fill mana"\r
                         [style.width.%]="getResourcePercentage(member.sheet, FormulaType.MANA)"></div>\r
                    <span class="cc-bar-value">{{ getResourceCurrent(member.sheet, FormulaType.MANA) }} / {{ getResourceMax(member.sheet, FormulaType.MANA) }}</span>\r
                  </div>\r
                </div>\r
              </div>\r
\r
              <!-- Currency (coin pills) -->\r
              <div class="cc-currency">\r
                @for (coin of getCoinPartsForMember(member.sheet); track coin.type) {\r
                  <span class="cc-coin" [style.--coin-color]="coin.color">\r
                    {{ coin.amount }} {{ coin.symbol }}\r
                  </span>\r
                }\r
              </div>\r
\r
              <!-- Active Status Effects -->\r
              <div class="cc-effects">\r
                <div class="cc-effects-header">\r
                  <span class="cc-effects-label">Effekte</span>\r
                </div>\r
                <div class="cc-effect-list">\r
                  @for (active of getDashboardActiveEffects(member.id); track active.statusEffectId + active.appliedAt) {\r
                    @let def = getDashboardEffectDef(active.statusEffectId);\r
                    <div class="cc-effect-chip" [style.--ec]="def?.color ?? '#8b5cf6'"\r
                         title="{{ active.customName ?? def?.name ?? active.statusEffectId }}">\r
                      <span class="cc-effect-icon">{{ def?.icon ?? '\u2726' }}</span>\r
                      @if (active.stacks && active.stacks > 1) {\r
                        <span class="cc-effect-stack">\xD7{{ active.stacks }}</span>\r
                      }\r
                      @if (active.duration !== undefined && active.duration !== null) {\r
                        <span class="cc-effect-dur">{{ active.duration }}R</span>\r
                      }\r
                    </div>\r
                  }\r
                  @if (getDashboardActiveEffects(member.id).length === 0) {\r
                    <span class="cc-no-effects">\u2014</span>\r
                  }\r
                </div>\r
              </div>\r
            </div>\r
          }\r
        </div>\r
      }\r
    </app-card>\r
  </div>\r
\r
  <!-- Battle Tracker Section -->\r
  <div class="battle-tracker-section">\r
    <app-battle-tracker [engine]="battleEngine"></app-battle-tracker>\r
  </div>\r
\r
  <!-- Bottom Section: Current Events + Library -->\r
  <div class="content-grid">\r
    <!-- Current Events Section (Left) -->\r
    <app-card class="battle-loot-card">\r
      <app-current-events-manager\r
        [events]="currentEvents"\r
        [libraries]="loadedLibraries()"\r
        [mergedItems]="mergedItems()"\r
        [mergedRunes]="mergedRunes()"\r
        [mergedSpells]="mergedSpells()"\r
        [mergedSkills]="mergedSkills()"\r
        [mergedStatusEffects]="mergedStatusEffects()"\r
        (eventAdded)="onEventAdded($event)"\r
        (eventRemoved)="onEventRemoved($event)"\r
        (eventUpdated)="onEventUpdated($event)"\r
        (navigateToLibrary)="navigateToLibrary($event)">\r
      </app-current-events-manager>\r
    </app-card>\r
\r
    <!-- Asset Browser Section (Right) -->\r
    <div class="library-card">\r
      <div class="library-header">\r
        <h2>Bibliothek</h2>\r
        <div class="library-header-actions">\r
          <button (click)="openLibrarySelector()" class="header-btn" title="Verkn\xFCpfte Bibliotheken verwalten">\r
            <span class="app-icon i-folder"></span> Bibliotheken\r
          </button>\r
          <button (click)="openTrash()" class="header-btn secondary" title="Papierkorb \xF6ffnen">\r
            <span class="app-icon i-restore-trash"></span> Papierkorb ({{ (world.trash || []).length }})\r
          </button>\r
        </div>\r
      </div>\r
      <p class="drag-hint">Elemente auf Charaktere oder Kampfbeute ziehen. Rechtsklick f\xFCr Optionen.</p>\r
      <app-asset-browser\r
        [items]="mergedItems()"\r
        [runes]="mergedRunes()"\r
        [spells]="mergedSpells()"\r
        [skills]="mergedSkills()"\r
        [statusEffects]="mergedStatusEffects()"\r
        [shops]="mergedShops()"\r
        [lootBundles]="mergedBundles()"\r
        [materials]="allMaterials"\r
        [forgeTraits]="allForgeTraits"\r
        [dummySheet]="dummySheet"\r
        [editingItems]="editingItems"\r
        [editingRunes]="editingRunes"\r
        [editingSpells]="editingSpells"\r
        [editingSkills]="editingSkills"\r
        [editingStatusEffects]="editingStatusEffects"\r
        [readonly]="true"\r
        (openItemEditor)="openItemEditor($event)"\r
        (openRuneEditor)="openRuneEditorDialog($event)"\r
        (openSpellEditor)="openSpellEditorDialog($event)"\r
        (openSkillEditor)="openSkillEditorDialog($event)"\r
        (openStatusEffectEditor)="openStatusEffectEditorDialog($event)"\r
        (updateItem)="updateItem($event.index, $event.patch)"\r
        (updateRune)="updateRune($event.index, $event.patch)"\r
        (updateSpell)="updateSpell($event.index, $event.patch)"\r
        (updateSkill)="updateSkill($event.index, $event.patch)"\r
        (updateStatusEffect)="updateStatusEffect($event.index, $event.patch)"\r
        (itemEditingChange)="onItemEditingChange($event)"\r
        (runeEditingChange)="onRuneEditingChange($event)"\r
        (spellEditingChange)="onSpellEditingChange($event)"\r
        (skillEditingChange)="onSkillEditingChange($event)"\r
        (statusEffectEditingChange)="onStatusEffectEditingChange($event)"\r
        (dragStart)="onDragStart($event.event, $event.type, $event.index)"\r
        (contextMenuRequest)="onLibraryItemContextMenu($event)">\r
      </app-asset-browser>\r
    </div>\r
  </div>\r
\r
  <!-- Damage Calculator -->\r
  <div class="damage-calc-section">\r
    <app-damage-calculator [worldName]="worldName"></app-damage-calculator>\r
  </div>\r
</div>\r
\r
<!-- Item Creator Dialog -->\r
@if (showItemCreator) {\r
  <app-item-editor\r
    [item]="null"\r
    [sheet]="dummySheet"\r
    [librarySkills]="world.skillLibrary"\r
    [librarySpells]="world.spellLibrary"\r
    [showLibraryImport]="true"\r
    (save)="createItem($event)"\r
    (cancel)="closeItemCreator()">\r
  </app-item-editor>\r
}\r
\r
<!-- Item Editor Dialog -->\r
@if (editingItemIndex !== null && world.itemLibrary[editingItemIndex]) {\r
  <app-item-editor\r
    [item]="world.itemLibrary[editingItemIndex]"\r
    [sheet]="dummySheet"\r
    [librarySkills]="world.skillLibrary"\r
    [librarySpells]="world.spellLibrary"\r
    [showLibraryImport]="true"\r
    (save)="updateItem(editingItemIndex, { path: '', value: $event }); closeItemEditor()"\r
    (cancel)="closeItemEditor()"\r
    (delete)="removeItem(editingItemIndex); closeItemEditor()">\r
  </app-item-editor>\r
}\r
\r
<!-- Rune Editor Dialog -->\r
@if (editingRuneIndex !== null && world.runeLibrary[editingRuneIndex]) {\r
  <app-rune-editor\r
    [rune]="world.runeLibrary[editingRuneIndex]"\r
    (save)="updateRune(editingRuneIndex, { path: '', value: $event }); closeRuneEditor()"\r
    (cancel)="closeRuneEditor()"\r
    (delete)="removeRune(editingRuneIndex); closeRuneEditor()">\r
  </app-rune-editor>\r
}\r
\r
\r
\r
<!-- Skill Editor Dialog -->\r
@if (editingSkillIndex !== null && world.skillLibrary[editingSkillIndex]) {\r
  <app-skill-editor\r
    [skill]="world.skillLibrary[editingSkillIndex]"\r
    (save)="updateSkill(editingSkillIndex, { path: '', value: $event }); closeSkillEditorDialog()"\r
    (cancel)="closeSkillEditorDialog()"\r
    (delete)="removeSkill(editingSkillIndex); closeSkillEditorDialog()">\r
  </app-skill-editor>\r
}\r
\r
<!-- Trash Dialog -->\r
@if (showTrash) {\r
  <div class="dialog-overlay" (click)="closeTrash()">\r
    <div class="dialog-content trash-dialog" (click)="$event.stopPropagation()" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">\r
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">\r
        <h2><span class="app-icon i-restore-trash"></span> Papierkorb</h2>\r
        <div style="display: flex; gap: 0.5rem;">\r
          <button (click)="emptyTrash()" [disabled]="!world.trash || world.trash.length === 0" style="background: #d32f2f; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; border: none;">\r
            Papierkorb leeren\r
          </button>\r
          <button (click)="closeTrash()" style="background: #666; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; border: none;">\r
            Schlie\xDFen\r
          </button>\r
        </div>\r
      </div>\r
\r
      @if (!world.trash || world.trash.length === 0) {\r
        <p style="text-align: center; color: #999; padding: 2rem;">Papierkorb ist leer</p>\r
      } @else {\r
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">\r
          @for (trashItem of world.trash; track $index; let i = $index) {\r
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 4px; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">\r
              <div style="flex: 1;">\r
                <div style="display: flex; align-items: center; gap: 0.5rem;">\r
                  <span style="background: var(--accent); color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; text-transform: uppercase;">\r
                    {{ trashItem.type }}\r
                  </span>\r
                  <strong>{{ trashItem.data.name || 'Unbenannt' }}</strong>\r
                </div>\r
                <div style="color: #999; font-size: 0.85rem; margin-top: 0.25rem;">\r
                  Gel\xF6scht: {{ trashItem.deletedAt | date:'short' }}\r
                </div>\r
                @if (trashItem.data.description) {\r
                  <div style="color: #ccc; font-size: 0.9rem; margin-top: 0.5rem; max-width: 500px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\r
                    {{ trashItem.data.description }}\r
                  </div>\r
                }\r
              </div>\r
              <div style="display: flex; gap: 0.5rem;">\r
                <button (click)="restoreFromTrash(i)" style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; border: none;">\r
                  Wiederherstellen\r
                </button>\r
                <button (click)="permanentlyDelete(i)" style="background: #d32f2f; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; border: none;">\r
                  Endg\xFCltig l\xF6schen\r
                </button>\r
              </div>\r
            </div>\r
          }\r
        </div>\r
      }\r
    </div>\r
  </div>\r
}\r
}\r
\r
<!-- Spell Node Editor Dialog \u2014 outside world$ to prevent close-on-save -->\r
@if (isSpellEditorOpen && editingSpell !== null && editingSpellIndex !== null) {\r
  <app-spell-editor-overlay\r
    [spell]="editingSpell"\r
    [availableRunes]="mergedRunes()"\r
    (save)="updateSpell(editingSpellIndex, { path: '', value: $event })"\r
    (cancel)="closeSpellEditorDialog()"\r
    (deleteSpell)="removeSpell(editingSpellIndex); closeSpellEditorDialog()">\r
  </app-spell-editor-overlay>\r
}\r
\r
<!-- Character Generator Modal -->\r
@if (showCharacterGenerator) {\r
  <app-character-generator\r
    (close)="closeCharacterGenerator()"\r
    (characterGenerated)="onCharacterGenerated($event)"\r
  />\r
}\r
\r
<!-- Library Selector Modal -->\r
@if (showLibrarySelector) {\r
  <app-library-selector\r
    (librariesChanged)="handleLibrariesChanged($event)"\r
    (close)="showLibrarySelector = false"\r
  />\r
}\r
\r
<!-- Context Menu for Character Interactions -->\r
<app-context-menu (itemSelected)="handleContextMenuAction($event)" />\r
\r
<!-- Status Manager Overlay -->\r
@if (statusManagerFor) {\r
  <div class="sm-overlay" (click)="closeStatusManager()">\r
    <div class="sm-panel" (click)="$event.stopPropagation()">\r
      <div class="sm-header">\r
        <span class="sm-title"><span class="app-icon i-status-effect"></span> Status verwalten</span>\r
        <span class="sm-subtitle">{{ partyCharacters.get(statusManagerFor)?.name || statusManagerFor }}</span>\r
        <button class="sm-close" (click)="closeStatusManager()">\u2715</button>\r
      </div>\r
\r
      <!-- Active effects on character -->\r
      @if (getStatusManagerActiveEffects().length > 0) {\r
        <div class="sm-active-section">\r
          <span class="sm-section-label">Aktive Effekte</span>\r
          <div class="sm-active-list">\r
            @for (active of getStatusManagerActiveEffects(); track active.statusEffectId + active.appliedAt) {\r
              @let def = getDashboardEffectDef(active.statusEffectId);\r
              <div class="sm-active-chip" [style.--ec]="def?.color ?? '#8b5cf6'">\r
                <span class="sm-active-icon">{{ def?.icon ?? '\u2726' }}</span>\r
                <span class="sm-active-name">{{ active.customName ?? def?.name ?? active.statusEffectId }}</span>\r
                @if (active.stacks && active.stacks > 1) {\r
                  <span class="sm-active-stack">\xD7{{ active.stacks }}</span>\r
                }\r
                @if (active.duration !== undefined && active.duration !== null) {\r
                  <span class="sm-active-dur">{{ active.duration }}R</span>\r
                }\r
                <button class="sm-active-remove" (click)="removeEffectFromManager(active)" title="Entfernen">\u2715</button>\r
              </div>\r
            }\r
          </div>\r
        </div>\r
      }\r
\r
      <!-- Search + add effects -->\r
      <input\r
        class="sm-search"\r
        type="text"\r
        [(ngModel)]="statusManagerSearch"\r
        placeholder="Effekte suchen...">\r
\r
      <div class="sm-effect-grid">\r
        @for (effect of statusManagerEffects; track effect.id) {\r
          <button class="sm-effect-card" [style.--ec]="effect.color || '#8b5cf6'"\r
                  (click)="addEffectFromManager(effect)">\r
            <span class="sm-effect-icon">{{ effect.icon || '\u2726' }}</span>\r
            <span class="sm-effect-name">{{ effect.name }}</span>\r
            @if (effect.isDebuff) {\r
              <span class="sm-effect-tag debuff">Debuff</span>\r
            }\r
          </button>\r
        }\r
        @if (statusManagerEffects.length === 0) {\r
          <p class="sm-empty">Keine Effekte gefunden.</p>\r
        }\r
      </div>\r
    </div>\r
  </div>\r
}\r
\r
<!-- Send Picker Overlay -->\r
@if (sendPickerFor && sendPickerType) {\r
  <div class="sm-overlay" (click)="closeSendPicker()">\r
    <div class="sm-panel" (click)="$event.stopPropagation()">\r
      <div class="sm-header">\r
        <span class="sm-title">\u{1F4E4} {{ sendPickerTypeLabel }} senden</span>\r
        <span class="sm-subtitle">An {{ partyCharacters.get(sendPickerFor)?.name || sendPickerFor }}</span>\r
        <button class="sm-close" (click)="closeSendPicker()">\u2715</button>\r
      </div>\r
\r
      <input\r
        class="sm-search"\r
        type="text"\r
        [(ngModel)]="sendPickerSearch"\r
        placeholder="{{ sendPickerTypeLabel }} suchen...">\r
\r
      <div class="sm-send-list">\r
        @for (item of sendPickerItems; track item.id ?? item.name ?? $index) {\r
          <button class="sm-send-item" (click)="sendFromPicker(item)">\r
            <span class="sm-send-name">{{ item.name }}</span>\r
          </button>\r
        }\r
        @if (sendPickerItems.length === 0) {\r
          <p class="sm-empty">Keine {{ sendPickerTypeLabel }}e gefunden.</p>\r
        }\r
      </div>\r
    </div>\r
  </div>\r
}\r
\r
<!-- Knowledge Manager Overlay -->\r
@if (knowledgeManagerFor) {\r
  <div class="sm-overlay" (click)="closeKnowledgeManager()">\r
    <div class="sm-panel km-panel" (click)="$event.stopPropagation()">\r
      <div class="sm-header">\r
        @if (knowledgeManagerType === 'material') {\r
          <span class="sm-title">\u{1F4D6} Materialwissen</span>\r
        } @else {\r
          <span class="sm-title">\u{1F528} Schmiedewissen</span>\r
        }\r
        <span class="sm-subtitle">{{ partyCharacters.get(knowledgeManagerFor)?.name || knowledgeManagerFor }}</span>\r
        <button class="sm-close" (click)="closeKnowledgeManager()">\u2715</button>\r
      </div>\r
\r
      @if (knowledgeManagerLoading) {\r
        <div class="km-loading">\r
          <span class="km-spinner"></span>\r
          <span>Wird geladen...</span>\r
        </div>\r
      } @else {\r
        @if (knowledgeManagerType === 'material') {\r
          <p class="km-hint">\xD6ffentliche Materialien sind automatisch f\xFCr alle sichtbar. Hier kannst du nicht-\xF6ffentliche Materialien freigeben.</p>\r
\r
          <input\r
            class="sm-search"\r
            type="text"\r
            [(ngModel)]="knowledgeManagerSearch"\r
            placeholder="Material suchen...">\r
\r
          @if (filteredKnowledgeMaterials.length === 0) {\r
            <p class="sm-empty">\r
              {{ knowledgeManagerSearch ? 'Keine passenden Materialien.' : 'Keine nicht-\xF6ffentlichen Materialien in der Bibliothek.' }}\r
            </p>\r
          } @else {\r
            <div class="km-list">\r
              @for (entry of filteredKnowledgeMaterials; track entry.material.id) {\r
                <label class="km-item" [class.km-known]="entry.known">\r
                  <input type="checkbox" [checked]="entry.known" (change)="toggleMaterialKnowledge(entry)" />\r
                  <div class="km-item-info">\r
                    <span class="km-item-name">{{ entry.material.name }}</span>\r
                    @if (entry.material.description) {\r
                      <span class="km-item-desc">{{ entry.material.description }}</span>\r
                    }\r
                    <div class="km-item-types">\r
                      @if (entry.material.canBeWeaponMaterial) { <span class="km-type weapon">Waffe</span> }\r
                      @if (entry.material.canBeArmorMaterial) { <span class="km-type armor">R\xFCstung</span> }\r
                    </div>\r
                  </div>\r
                </label>\r
              }\r
            </div>\r
          }\r
\r
          <div class="km-footer">\r
            <span class="km-count">{{ knownMaterialCount }} von {{ knowledgeManagerMaterials.length }} bekannt</span>\r
            <button class="km-save-btn" (click)="saveKnowledgeManager()">Speichern</button>\r
          </div>\r
        } @else {\r
          <p class="km-hint">\xD6ffentliche Schmiedemerkmale sind automatisch f\xFCr alle sichtbar. Hier kannst du nicht-\xF6ffentliche Schmiedemerkmale freigeben.</p>\r
\r
          <input\r
            class="sm-search"\r
            type="text"\r
            [(ngModel)]="knowledgeManagerSearch"\r
            placeholder="Schmiedemerkmal suchen...">\r
\r
          @if (filteredKnowledgeForgeTraits.length === 0) {\r
            <p class="sm-empty">\r
              {{ knowledgeManagerSearch ? 'Keine passenden Schmiedemerkmale.' : 'Keine nicht-\xF6ffentlichen Schmiedemerkmale in der Bibliothek.' }}\r
            </p>\r
          } @else {\r
            <div class="km-list">\r
              @for (entry of filteredKnowledgeForgeTraits; track entry.forgeTrait.id) {\r
                <label class="km-item" [class.km-known]="entry.known">\r
                  <input type="checkbox" [checked]="entry.known" (change)="toggleForgeTraitKnowledge(entry)" />\r
                  <div class="km-item-info">\r
                    <span class="km-item-name">{{ entry.forgeTrait.name }}</span>\r
                    @if (entry.forgeTrait.description) {\r
                      <span class="km-item-desc">{{ entry.forgeTrait.description }}</span>\r
                    }\r
                  </div>\r
                </label>\r
              }\r
            </div>\r
          }\r
\r
          <div class="km-footer">\r
            <span class="km-count">{{ knownForgeTraitCount }} von {{ knowledgeManagerForgeTraits.length }} bekannt</span>\r
            <button class="km-save-btn" (click)="saveKnowledgeManager()">Speichern</button>\r
          </div>\r
        }\r
      }\r
    </div>\r
  </div>\r
}\r
`, styles: ["/* src/app/world/world/world.component.css */\n:host {\n  display: block;\n  height: 100vh;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n.world-container {\n  padding: 1rem;\n  max-width: 1800px;\n  margin: 0 auto;\n}\n.world-header {\n  margin-bottom: 2rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n}\n.world-header-links {\n  display: flex;\n  gap: 0.75rem;\n}\n.world-header-links a {\n  color: var(--accent);\n  text-decoration: none;\n  font-weight: 500;\n}\n.world-header-links a:hover {\n  text-decoration: underline;\n}\n.world-header h1 {\n  margin: 0;\n  color: var(--accent);\n  font-size: 28px;\n  font-weight: 600;\n}\n.management-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 2fr;\n  gap: 1rem;\n  margin-bottom: 1rem;\n}\n.content-grid {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n  gap: 1rem;\n  height: calc(100vh - 300px);\n  min-height: 700px;\n}\n.battle-loot-card {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n.library-card {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  padding: 14px;\n  box-sizing: border-box;\n}\n.party-dashboard-card {\n  grid-column: span 3;\n}\n.character-list,\n.party-list,\n.library-list,\n.loot-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.character-item,\n.party-item,\n.loot-item {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.5rem;\n  background: var(--bg);\n  border-radius: 6px;\n  border: 1px solid var(--border);\n}\n.library-list > * {\n  margin-bottom: 0.5rem;\n}\n.character-item span,\n.party-item span,\n.loot-item span {\n  flex: 1;\n  color: var(--text);\n}\n.character-item button,\n.party-item button,\n.loot-item button {\n  padding: 0.25rem 0.75rem;\n  background: #ef4444;\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.2s;\n}\n.character-item button:hover,\n.party-item button:hover,\n.loot-item button:hover {\n  background: #dc2626;\n}\n.add-section {\n  display: flex;\n  gap: 0.5rem;\n  margin-top: 0.5rem;\n}\n.add-section input,\n.add-section select {\n  flex: 1;\n  padding: 0.5rem;\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  font-size: 14px;\n}\n.add-section button,\napp-card button {\n  padding: 0.5rem 1rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  cursor: pointer;\n  font-weight: 500;\n  transition: background 0.2s;\n}\n.add-section button:hover,\napp-card button:hover {\n  background: var(--accentdark);\n}\n.generate-character-btn {\n  background:\n    linear-gradient(\n      135deg,\n      #4CAF50,\n      #45a049) !important;\n  font-weight: 600 !important;\n  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);\n  transition: all 0.2s !important;\n}\n.generate-character-btn:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);\n}\n.dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1rem;\n}\n.dashboard-empty {\n  color: var(--muted);\n  font-style: italic;\n  text-align: center;\n  padding: 2rem 0;\n}\n.char-card {\n  background: #0f1829;\n  border: 1px solid var(--border);\n  border-left: 3px solid var(--accent);\n  border-radius: 8px;\n  padding: 14px;\n  transition: box-shadow 0.15s, transform 0.15s;\n  cursor: pointer;\n  position: relative;\n}\n.char-card:hover {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--accent);\n  transform: translateY(-1px);\n}\n.cc-header {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n  margin-bottom: 12px;\n}\n.cc-portrait {\n  width: 72px;\n  height: 72px;\n  flex-shrink: 0;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 2px solid var(--accent);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);\n}\n.cc-portrait img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.cc-name-group {\n  flex: 1;\n  min-width: 0;\n}\n.cc-name {\n  margin: 4px 0 0;\n  color: var(--text);\n  font-size: 1.05rem;\n  font-weight: 700;\n}\n.cc-meta {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 4px;\n  margin-top: 4px;\n}\n.cc-level-badge,\n.cc-class-badge {\n  font-size: 0.68rem;\n  padding: 1px 6px;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.08);\n  color: rgba(255, 255, 255, 0.55);\n  white-space: nowrap;\n}\n.cc-level-badge {\n  color: var(--accent);\n  font-weight: 600;\n}\n.cc-resources {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-bottom: 10px;\n}\n.cc-bar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.cc-bar-label {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--muted);\n  min-width: 52px;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.cc-bar-track {\n  flex: 1;\n  height: 18px;\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 4px;\n  overflow: hidden;\n  position: relative;\n  border: 1px solid rgba(255, 255, 255, 0.06);\n}\n.cc-bar-fill {\n  height: 100%;\n  border-radius: 3px;\n  transition: width 0.4s ease;\n}\n.cc-bar-fill.health {\n  background:\n    linear-gradient(\n      90deg,\n      #dc2626 0%,\n      #ef4444 100%);\n  box-shadow: inset 0 0 12px rgba(239, 68, 68, 0.5), 0 0 6px rgba(239, 68, 68, 0.3);\n}\n.cc-bar-fill.energy {\n  background:\n    linear-gradient(\n      90deg,\n      #16a34a 0%,\n      #22c55e 100%);\n  box-shadow: inset 0 0 12px rgba(34, 197, 94, 0.5), 0 0 6px rgba(34, 197, 94, 0.3);\n}\n.cc-bar-fill.mana {\n  background:\n    linear-gradient(\n      90deg,\n      #2563eb 0%,\n      #3b82f6 100%);\n  box-shadow: inset 0 0 12px rgba(59, 130, 246, 0.5), 0 0 6px rgba(59, 130, 246, 0.3);\n}\n.cc-bar-value {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 0.65rem;\n  font-weight: 700;\n  color: #fff;\n  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);\n}\n.cc-currency {\n  display: flex;\n  gap: 5px;\n  flex-wrap: wrap;\n  margin-bottom: 10px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.06);\n}\n.cc-coin {\n  font-size: 0.72rem;\n  font-weight: 700;\n  padding: 2px 8px;\n  border-radius: 10px;\n  background: color-mix(in srgb, var(--coin-color) 25%, transparent);\n  color: var(--coin-color);\n  border: 1px solid color-mix(in srgb, var(--coin-color) 50%, transparent);\n  line-height: 1.5;\n}\n.cc-effects {\n  position: relative;\n}\n.cc-effects-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n.cc-effects-label {\n  color: var(--muted);\n  font-size: 0.65rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  font-weight: 600;\n}\n.cc-effects-add {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px dashed rgba(255, 255, 255, 0.15);\n  color: var(--muted);\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.8rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n  transition: all 0.15s;\n}\n.cc-effects-add:hover {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: var(--accent);\n  color: var(--accent);\n}\n.cc-effect-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  min-height: 20px;\n}\n.cc-effect-chip {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: color-mix(in srgb, var(--ec, #8b5cf6) 14%, #0f1829);\n  border: 1px solid color-mix(in srgb, var(--ec, #8b5cf6) 40%, transparent);\n  border-radius: 8px;\n  padding: 3px 6px;\n  cursor: default;\n  transition: all 0.15s;\n}\n.cc-effect-chip:hover {\n  background: color-mix(in srgb, var(--ec, #8b5cf6) 25%, #0f1829);\n  border-color: color-mix(in srgb, var(--ec, #8b5cf6) 70%, transparent);\n}\n.cc-effect-icon {\n  font-size: 0.85rem;\n  line-height: 1;\n  color: var(--ec, #8b5cf6);\n  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--ec, #8b5cf6) 60%, transparent));\n}\n.cc-effect-stack {\n  font-size: 0.6rem;\n  font-weight: 800;\n  color: var(--ec, #8b5cf6);\n}\n.cc-effect-dur {\n  font-size: 0.55rem;\n  font-weight: 700;\n  color: color-mix(in srgb, var(--ec, #8b5cf6) 80%, var(--muted));\n  background: rgba(0, 0, 0, 0.4);\n  padding: 1px 3px;\n  border-radius: 3px;\n}\n.cc-no-effects {\n  color: rgba(255, 255, 255, 0.15);\n  font-size: 0.75rem;\n}\n.cc-picker-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 99;\n}\n.cc-picker {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  z-index: 100;\n  background: #1a1a1e;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  overflow: hidden;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);\n  margin-top: 4px;\n  animation: ccPickerIn 0.15s ease-out;\n}\n@keyframes ccPickerIn {\n  from {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n.cc-picker-head {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 10px;\n  background: rgba(255, 255, 255, 0.03);\n  border-bottom: 1px solid var(--border);\n  font-size: 0.75rem;\n  font-weight: 600;\n  color: var(--muted);\n}\n.cc-picker-close {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  cursor: pointer;\n  font-size: 0.7rem;\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n.cc-picker-close:hover {\n  color: var(--text);\n  background: rgba(255, 255, 255, 0.08);\n}\n.cc-picker-empty {\n  color: var(--muted);\n  font-size: 0.72rem;\n  font-style: italic;\n  padding: 12px;\n  text-align: center;\n  margin: 0;\n}\n.cc-picker-list {\n  display: flex;\n  flex-direction: column;\n  max-height: 200px;\n  overflow-y: auto;\n}\n.cc-picker-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 7px 10px;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: var(--text);\n  font-size: 0.82rem;\n  font-weight: 500;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  transition: background 0.12s;\n}\n.cc-picker-item:hover {\n  background: rgba(139, 92, 246, 0.15);\n}\n.cc-picker-item-icon {\n  font-size: 1rem;\n  line-height: 1;\n}\n.cc-picker-item-name {\n  flex: 1;\n}\n.cc-picker-list::-webkit-scrollbar {\n  width: 4px;\n}\n.cc-picker-list::-webkit-scrollbar-track {\n  background: transparent;\n}\n.cc-picker-list::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 2px;\n}\n.draggable {\n  cursor: move;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.draggable:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.draggable:active {\n  cursor: grabbing;\n}\n.drop-zone {\n  position: relative;\n  transition: background 0.2s, border 0.2s;\n}\n.drop-zone.drag-over {\n  background: #f3f4f6;\n  border: 2px dashed var(--accent);\n}\n.char-card.drop-zone {\n  border: 1px solid var(--border);\n  border-left: 3px solid var(--accent);\n}\n.char-card.drop-zone:hover {\n  border-color: var(--accent);\n}\n.drop-hint {\n  display: none;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  background: rgba(107, 70, 193, 0.95);\n  color: white;\n  padding: 8px 16px;\n  border-radius: 6px;\n  font-weight: 600;\n  font-size: 14px;\n  z-index: 10;\n  pointer-events: none;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n}\n.drop-zone:hover .drop-hint {\n  display: block;\n}\n.library-card app-asset-browser {\n  flex: 1;\n  min-height: 0;\n  display: block;\n}\n.drag-hint {\n  font-size: 12px;\n  color: var(--muted);\n  font-style: italic;\n  margin: 8px 0;\n}\n.library-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n.library-header h2 {\n  margin: 0;\n}\n.library-header-actions {\n  display: flex;\n  gap: 0.5rem;\n}\n.header-btn {\n  background: var(--accent);\n  color: white;\n  padding: 5px 10px;\n  border-radius: 4px;\n  border: none;\n  cursor: pointer;\n  font-size: 0.85rem;\n  white-space: nowrap;\n}\n.header-btn:hover {\n  opacity: 0.85;\n}\n.header-btn.secondary {\n  background: var(--card-bg);\n  color: var(--text-color);\n  border: 1px solid var(--border-color);\n}\n.empty-loot {\n  text-align: center;\n  color: var(--muted);\n  font-style: italic;\n  padding: 2rem;\n  min-height: 100px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px dashed var(--border);\n  border-radius: 6px;\n  margin: 0;\n  background: var(--bg);\n}\n.claimed-count {\n  font-size: 11px;\n  color: var(--muted);\n  background: var(--bg);\n  padding: 4px 8px;\n  border-radius: 6px;\n  margin-left: 8px;\n  font-weight: 500;\n}\n.reveal-loot-btn {\n  width: 100%;\n  margin-top: 1rem;\n  padding: 12px;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  font-size: 14px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n.reveal-loot-btn:hover {\n  background: var(--accent-hover);\n}\n.dialog-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: rgba(0, 0, 0, 0.5);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 1000;\n}\n.dialog-content {\n  background: var(--card);\n  padding: 2rem;\n  border-radius: 8px;\n  max-width: 600px;\n  width: 90%;\n  max-height: 90vh;\n  overflow-y: auto;\n}\n.dialog-content h3 {\n  margin-top: 0;\n  color: var(--accent);\n}\n.empty-message {\n  text-align: center;\n  color: var(--text-muted);\n  padding: 2rem;\n  font-style: italic;\n}\n.battle-tracker-section {\n  margin-bottom: 1rem;\n}\n.damage-calc-section {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n  max-width: 720px;\n}\n.cdk-drag-animating {\n  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);\n}\n.cdk-drop-list-dragging .cdk-drag {\n  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);\n}\n.sm-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.55);\n  -webkit-backdrop-filter: blur(3px);\n  backdrop-filter: blur(3px);\n  z-index: 15000;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1rem;\n  animation: smFadeIn 0.2s ease-out;\n}\n@keyframes smFadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes smPanelIn {\n  from {\n    opacity: 0;\n    transform: scale(0.95) translateY(10px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n.sm-panel {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 14px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);\n  min-width: 360px;\n  max-width: 520px;\n  width: 100%;\n  max-height: 80vh;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  animation: smPanelIn 0.2s ease-out;\n}\n.sm-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 14px 18px 12px;\n  border-bottom: 1px solid var(--border);\n  flex-shrink: 0;\n}\n.sm-title {\n  font-size: 0.85rem;\n  font-weight: 700;\n  color: var(--text);\n}\n.sm-subtitle {\n  font-size: 0.75rem;\n  color: var(--muted);\n  flex: 1;\n}\n.sm-close {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  font-size: 1rem;\n  cursor: pointer;\n  padding: 4px 8px;\n  border-radius: 4px;\n  transition: all 0.15s;\n}\n.sm-close:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text);\n}\n.sm-active-section {\n  padding: 10px 16px;\n  border-bottom: 1px solid var(--border);\n  flex-shrink: 0;\n}\n.sm-section-label {\n  font-size: 0.65rem;\n  font-weight: 700;\n  color: var(--muted);\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  display: block;\n  margin-bottom: 6px;\n}\n.sm-active-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.sm-active-chip {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 8px 4px 6px;\n  background: color-mix(in srgb, var(--ec, var(--accent)) 14%, var(--bg));\n  border: 1px solid color-mix(in srgb, var(--ec, var(--accent)) 40%, transparent);\n  border-radius: 8px;\n  font-size: 0.75rem;\n}\n.sm-active-icon {\n  font-size: 0.85rem;\n}\n.sm-active-name {\n  color: var(--text);\n  font-weight: 600;\n}\n.sm-active-stack {\n  color: var(--ec, var(--accent));\n  font-weight: 700;\n  font-size: 0.65rem;\n}\n.sm-active-dur {\n  color: var(--muted);\n  font-size: 0.65rem;\n}\n.sm-active-remove {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  font-size: 0.7rem;\n  cursor: pointer;\n  padding: 2px 4px;\n  border-radius: 3px;\n  transition: all 0.15s;\n  margin-left: 2px;\n}\n.sm-active-remove:hover {\n  color: #f87171;\n  background: rgba(239, 68, 68, 0.15);\n}\n.sm-search {\n  width: 100%;\n  background: var(--bg);\n  border: none;\n  border-bottom: 1px solid var(--border);\n  color: var(--text);\n  padding: 10px 16px;\n  font-size: 0.85rem;\n  outline: none;\n  flex-shrink: 0;\n  box-sizing: border-box;\n}\n.sm-search::placeholder {\n  color: var(--muted);\n}\n.sm-effect-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 12px;\n  overflow-y: auto;\n  flex: 1;\n}\n.sm-effect-card {\n  position: relative;\n  width: 72px;\n  min-height: 88px;\n  background: color-mix(in srgb, var(--ec, var(--accent)) 12%, var(--card));\n  border: 1px solid color-mix(in srgb, var(--ec, var(--accent)) 40%, transparent);\n  border-radius: 10px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-end;\n  padding: 6px 4px 5px;\n  gap: 3px;\n  cursor: pointer;\n  transition: all 0.15s;\n  color: inherit;\n}\n.sm-effect-card:hover {\n  transform: translateY(-2px);\n  background: color-mix(in srgb, var(--ec, var(--accent)) 22%, var(--card));\n  border-color: color-mix(in srgb, var(--ec, var(--accent)) 75%, transparent);\n  box-shadow: 0 4px 14px color-mix(in srgb, var(--ec, var(--accent)) 35%, transparent);\n}\n.sm-effect-icon {\n  font-size: 2rem;\n  line-height: 1;\n  color: var(--ec, var(--accent));\n  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ec, var(--accent)) 60%, transparent));\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n}\n.sm-effect-name {\n  color: var(--text);\n  font-size: 0.6rem;\n  font-weight: 600;\n  text-align: center;\n  line-height: 1.25;\n  overflow: hidden;\n  display: -webkit-box;\n  line-clamp: 2;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  max-width: 100%;\n}\n.sm-effect-tag {\n  position: absolute;\n  top: 3px;\n  right: 3px;\n  font-size: 0.48rem;\n  font-weight: 700;\n  padding: 1px 4px;\n  border-radius: 6px;\n}\n.sm-effect-tag.debuff {\n  background: rgba(239, 68, 68, 0.2);\n  color: #f87171;\n  border: 1px solid rgba(239, 68, 68, 0.35);\n}\n.sm-empty {\n  color: var(--muted);\n  font-size: 0.78rem;\n  padding: 24px 16px;\n  text-align: center;\n  font-style: italic;\n  width: 100%;\n}\n.sm-send-list {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  max-height: 50vh;\n}\n.sm-send-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  background: transparent;\n  border: none;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  color: var(--text);\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n  text-align: left;\n}\n.sm-send-item:hover {\n  background: rgba(139, 92, 246, 0.12);\n}\n.sm-send-name {\n  flex: 1;\n}\n.sm-effect-grid::-webkit-scrollbar,\n.sm-send-list::-webkit-scrollbar {\n  width: 5px;\n}\n.sm-effect-grid::-webkit-scrollbar-track,\n.sm-send-list::-webkit-scrollbar-track {\n  background: var(--card);\n}\n.sm-effect-grid::-webkit-scrollbar-thumb,\n.sm-send-list::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 3px;\n}\n.km-panel {\n  max-width: 560px;\n}\n.km-loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.75rem;\n  padding: 2.5rem;\n  color: var(--muted);\n  font-size: 0.88rem;\n}\n.km-spinner {\n  width: 18px;\n  height: 18px;\n  border: 2px solid var(--border);\n  border-top-color: var(--accent);\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n}\n@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.km-hint {\n  font-size: 0.78rem;\n  color: var(--muted);\n  padding: 8px 16px 0;\n  margin: 0;\n  line-height: 1.4;\n}\n.km-list {\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  flex: 1;\n  max-height: 45vh;\n  padding: 6px 0;\n}\n.km-item {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  padding: 9px 16px;\n  cursor: pointer;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.04);\n  transition: background 0.15s;\n}\n.km-item:hover {\n  background: rgba(255, 255, 255, 0.04);\n}\n.km-item.km-known {\n  background: rgba(139, 92, 246, 0.06);\n}\n.km-item input[type=checkbox] {\n  margin-top: 3px;\n  flex-shrink: 0;\n  accent-color: var(--accent);\n  width: 15px;\n  height: 15px;\n  cursor: pointer;\n}\n.km-item-info {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n  flex: 1;\n  min-width: 0;\n}\n.km-item-name {\n  font-size: 0.88rem;\n  font-weight: 700;\n  color: var(--text);\n}\n.km-item-desc {\n  font-size: 0.75rem;\n  color: var(--muted);\n}\n.km-item-types {\n  display: flex;\n  gap: 0.35rem;\n  margin-top: 0.1rem;\n}\n.km-type {\n  font-size: 0.68rem;\n  font-weight: 600;\n  padding: 0.1rem 0.45rem;\n  border-radius: 8px;\n  text-transform: uppercase;\n}\n.km-type.weapon {\n  background: rgba(251, 146, 60, 0.15);\n  color: #fb923c;\n}\n.km-type.armor {\n  background: rgba(96, 165, 250, 0.15);\n  color: #60a5fa;\n}\n.km-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px;\n  border-top: 1px solid var(--border);\n  flex-shrink: 0;\n}\n.km-count {\n  font-size: 0.78rem;\n  color: var(--muted);\n}\n.km-save-btn {\n  padding: 0.45rem 1.4rem;\n  background: var(--accent);\n  border: none;\n  border-radius: 6px;\n  color: white;\n  font-size: 0.85rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition: filter 0.2s;\n}\n.km-save-btn:hover {\n  filter: brightness(1.15);\n}\n/*# sourceMappingURL=world.component.css.map */\n"] }]
  }], () => [{ type: ActivatedRoute }], { contextMenu: [{
    type: ViewChild,
    args: [ContextMenuComponent]
  }], librarySelector: [{
    type: ViewChild,
    args: [LibrarySelectorComponent]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(WorldComponent, { className: "WorldComponent", filePath: "app/world/world/world.component.ts", lineNumber: 56 });
})();
export {
  WorldComponent
};
//# sourceMappingURL=chunk-NPO3SDEF.js.map
