import {
  NpcEditorComponent
} from "./chunk-FLX2T2TN.js";
import {
  BREW_SLOT_LABELS,
  createEmptyBrewTrait,
  createEmptyExtractorBlock,
  createEmptyIngredientBlock,
  createEmptyIngredientEffect
} from "./chunk-KXQ5CMKV.js";
import {
  WEAPON_TYPES,
  computeForgedStats,
  createEmptyForgeTrait,
  createEmptyMaterialBlock,
  formatTraitEffect,
  totalForgeSPSpent
} from "./chunk-X6OBBNZ2.js";
import {
  ItemBlock
} from "./chunk-WK44VEJK.js";
import {
  RuneEditorComponent,
  createEmptyShopDeal
} from "./chunk-2K7XH5ES.js";
import {
  ItemEditorComponent,
  SkillEditorComponent,
  SpellEditorOverlayComponent
} from "./chunk-SJFL75AL.js";
import {
  StatusEffectEditorComponent
} from "./chunk-VCDOFVI7.js";
import {
  createEmptyNpcStatblock
} from "./chunk-CBEKLTT4.js";
import {
  AssetBrowserApiService
} from "./chunk-BNPZFNFF.js";
import {
  ImageUrlPipe
} from "./chunk-6EXL6IWA.js";
import {
  ImageService
} from "./chunk-7RNBGZ3X.js";
import {
  createEmptySheet
} from "./chunk-U6IPOXKZ.js";
import "./chunk-SVTPZQLG.js";
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
  SelectControlValueAccessor,
  SelectMultipleControlValueAccessor,
  ɵNgSelectMultipleOption
} from "./chunk-VMGRJE2Y.js";
import "./chunk-P2J6DNXL.js";
import {
  ActivatedRoute,
  Router
} from "./chunk-V6FR55FP.js";
import "./chunk-YJYDFJW3.js";
import {
  CommonModule,
  DecimalPipe,
  Location,
  NgTemplateOutlet
} from "./chunk-FGI44Z6P.js";
import {
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
  firstValueFrom,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinterpolate1,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵresolveDocument,
  ɵɵresolveWindow,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
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

// src/app/services/asset-clipboard.service.ts
var AssetClipboardService = class _AssetClipboardService {
  // Clipboard state
  clipboardData = signal(null, ...ngDevMode ? [{ debugName: "clipboardData" }] : []);
  // Computed properties
  hasData = computed(() => this.clipboardData() !== null, ...ngDevMode ? [{ debugName: "hasData" }] : []);
  isCut = computed(() => this.clipboardData()?.operation === "cut", ...ngDevMode ? [{ debugName: "isCut" }] : []);
  isCopy = computed(() => this.clipboardData()?.operation === "copy", ...ngDevMode ? [{ debugName: "isCopy" }] : []);
  itemCount = computed(() => this.clipboardData()?.items.length ?? 0, ...ngDevMode ? [{ debugName: "itemCount" }] : []);
  /**
   * Get current clipboard data
   */
  getData() {
    return this.clipboardData();
  }
  /**
   * Copy items to clipboard
   */
  copy(libraryId, items) {
    this.clipboardData.set({
      operation: "copy",
      items,
      sourceLibraryId: libraryId
    });
    console.log("[CLIPBOARD] Copied", items.length, "items");
  }
  /**
   * Cut items to clipboard
   */
  cut(libraryId, items) {
    this.clipboardData.set({
      operation: "cut",
      items,
      sourceLibraryId: libraryId
    });
    console.log("[CLIPBOARD] Cut", items.length, "items");
  }
  /**
   * Clear clipboard
   */
  clear() {
    this.clipboardData.set(null);
    console.log("[CLIPBOARD] Cleared");
  }
  /**
   * Check if clipboard has items that can be pasted
   */
  canPaste() {
    return this.clipboardData() !== null && this.clipboardData().items.length > 0;
  }
  /**
   * Get clipboard info for display
   */
  getInfo() {
    const data = this.clipboardData();
    if (!data || data.items.length === 0) {
      return "";
    }
    const folderCount = data.items.filter((i) => i.type === "folder").length;
    const fileCount = data.items.filter((i) => i.type === "file").length;
    const parts = [];
    if (folderCount > 0) {
      parts.push(`${folderCount} Ordner`);
    }
    if (fileCount > 0) {
      parts.push(`${fileCount} Datei${fileCount > 1 ? "en" : ""}`);
    }
    const operation = data.operation === "cut" ? "Ausgeschnitten" : "Kopiert";
    return `${operation}: ${parts.join(", ")}`;
  }
  /**
   * Extract folder and file IDs from clipboard
   */
  getItemsByType() {
    const data = this.clipboardData();
    if (!data) {
      return { folderIds: [], fileIds: [] };
    }
    const folderIds = data.items.filter((i) => i.type === "folder").map((i) => i.id);
    const fileIds = data.items.filter((i) => i.type === "file").map((i) => i.id);
    return { folderIds, fileIds };
  }
  static \u0275fac = function AssetClipboardService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AssetClipboardService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AssetClipboardService, factory: _AssetClipboardService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AssetClipboardService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/model/asset-browser.model.ts
function getAssetTypeIcon(type) {
  switch (type) {
    case "item":
      return "\u{1F4E6}";
    case "spell":
      return "\u{1F4D6}";
    case "rune":
      return "\u2728";
    case "skill":
      return "\u2694\uFE0F";
    case "macro":
      return "\u26A1";
    case "status-effect":
      return "\u{1F3AD}";
    case "shop":
      return "\u{1F3EA}";
    case "loot-bundle":
      return "\u{1F4B0}";
    case "material":
      return "\u2699\uFE0F";
    case "forge-trait":
      return "\u{1F525}";
    case "statblock":
      return "\u{1F464}";
    case "ingredient":
      return "\u{1F33F}";
    case "extractor":
      return "\u{1F9EA}";
    case "brew-trait":
      return "\u2697\uFE0F";
    default:
      return "\u{1F4C4}";
  }
}
function getAssetTypeName(type) {
  switch (type) {
    case "item":
      return "Item";
    case "spell":
      return "Zauber";
    case "rune":
      return "Rune";
    case "skill":
      return "Talent";
    case "macro":
      return "Makro";
    case "status-effect":
      return "Status-Effekt";
    case "shop":
      return "Handel";
    case "loot-bundle":
      return "Beute";
    case "material":
      return "Material";
    case "forge-trait":
      return "Schmiedemerkmal";
    case "statblock":
      return "NSC-Statblock";
    case "ingredient":
      return "Wirkstoff";
    case "extractor":
      return "Extraktor";
    case "brew-trait":
      return "Braumerkmal";
    default:
      return "Unbekannt";
  }
}

// src/app/model/status-effect.model.ts
function createEmptyStatusEffect() {
  return {
    id: `status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: "New Status Effect",
    description: "",
    diceBonuses: [],
    statModifiers: [],
    tags: [],
    isDebuff: false,
    maxStacks: 1,
    public: false
  };
}

// src/app/model/macro-action.model.ts
function createEmptyMacroAction() {
  return {
    id: `macro_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: "New Macro",
    description: "",
    actionType: "custom_message",
    parameters: {
      message: "Macro triggered!"
    },
    tags: [],
    createdAt: Date.now(),
    modifiedAt: Date.now()
  };
}

// src/app/shared/macro-editor/macro-editor.component.ts
function MacroEditorComponent_Case_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "label");
    \u0275\u0275text(2, "Nachricht");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "textarea", 16);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_25_Template_textarea_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.message, $event) || (ctx_r1.editMacro.parameters.message = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 1)(5, "label");
    \u0275\u0275text(6, "Farbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 17);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_25_Template_input_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.messageColor, $event) || (ctx_r1.editMacro.parameters.messageColor = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.message);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.messageColor);
  }
}
function MacroEditorComponent_Case_26_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "label");
    \u0275\u0275text(2, "W\xFCrfelformel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 18);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_26_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.diceFormula, $event) || (ctx_r1.editMacro.parameters.diceFormula = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 1)(5, "label");
    \u0275\u0275text(6, "W\xFCrfelname");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 19);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_26_Template_input_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.rollName, $event) || (ctx_r1.editMacro.parameters.rollName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 1)(9, "label");
    \u0275\u0275text(10, "Farbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "input", 20);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_26_Template_input_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.rollColor, $event) || (ctx_r1.editMacro.parameters.rollColor = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.diceFormula);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.rollName);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.rollColor);
  }
}
function MacroEditorComponent_Case_27_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "label");
    \u0275\u0275text(2, "Schadensformel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 21);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_27_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.diceAmount, $event) || (ctx_r1.editMacro.parameters.diceAmount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 22)(5, "div", 1)(6, "label");
    \u0275\u0275text(7, "Oder fester Wert");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 23);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_27_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.amount, $event) || (ctx_r1.editMacro.parameters.amount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.diceAmount);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.amount);
  }
}
function MacroEditorComponent_Case_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "label");
    \u0275\u0275text(2, "Heilungsformel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 24);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_28_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.diceAmount, $event) || (ctx_r1.editMacro.parameters.diceAmount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 22)(5, "div", 1)(6, "label");
    \u0275\u0275text(7, "Oder fester Wert");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 23);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_28_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.amount, $event) || (ctx_r1.editMacro.parameters.amount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.diceAmount);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.amount);
  }
}
function MacroEditorComponent_Case_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "label");
    \u0275\u0275text(2, "Ressource");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 25);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_29_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.resource, $event) || (ctx_r1.editMacro.parameters.resource = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(4, "option", 26);
    \u0275\u0275text(5, "Leben");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "option", 27);
    \u0275\u0275text(7, "Mana");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "option", 28);
    \u0275\u0275text(9, "Energie");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "option", 29);
    \u0275\u0275text(11, "Fokus");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "div", 1)(13, "label");
    \u0275\u0275text(14, "Menge (negativ = abziehen)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "input", 23);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_29_Template_input_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.resourceAmount, $event) || (ctx_r1.editMacro.parameters.resourceAmount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.resource);
    \u0275\u0275advance(12);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.resourceAmount);
  }
}
function MacroEditorComponent_Case_30_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 1)(1, "label");
    \u0275\u0275text(2, "Stat");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 25);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_30_Template_select_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.stat, $event) || (ctx_r1.editMacro.parameters.stat = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(4, "option", 30);
    \u0275\u0275text(5, "St\xE4rke");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "option", 31);
    \u0275\u0275text(7, "Geschick");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "option", 32);
    \u0275\u0275text(9, "Tempo");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "option", 33);
    \u0275\u0275text(11, "Intelligenz");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "option", 34);
    \u0275\u0275text(13, "Konstitution");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "option", 35);
    \u0275\u0275text(15, "Wille");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "div", 22)(17, "div", 1)(18, "label");
    \u0275\u0275text(19, "Modifikator");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "input", 23);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_30_Template_input_ngModelChange_20_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.statModifier, $event) || (ctx_r1.editMacro.parameters.statModifier = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "div", 1)(22, "label");
    \u0275\u0275text(23, "Dauer (Runden)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Case_30_Template_input_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.editMacro.parameters.duration, $event) || (ctx_r1.editMacro.parameters.duration = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.stat);
    \u0275\u0275advance(17);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.statModifier);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.editMacro.parameters.duration);
  }
}
var MacroEditorComponent = class _MacroEditorComponent {
  macro;
  save = new EventEmitter();
  cancel = new EventEmitter();
  editMacro;
  ngOnInit() {
    this.editMacro = JSON.parse(JSON.stringify(this.macro));
    if (!this.editMacro.parameters) {
      this.editMacro.parameters = {};
    }
  }
  onActionTypeChange() {
    this.editMacro.parameters = {};
    switch (this.editMacro.actionType) {
      case "custom_message":
        this.editMacro.parameters.message = "Makro ausgel\xF6st!";
        break;
      case "dice_roll":
        this.editMacro.parameters.diceFormula = "1d20";
        break;
      case "modify_resource":
        this.editMacro.parameters.resource = "health";
        this.editMacro.parameters.resourceAmount = 0;
        break;
      case "modify_stat":
        this.editMacro.parameters.stat = "strength";
        this.editMacro.parameters.statModifier = 0;
        this.editMacro.parameters.duration = 1;
        break;
    }
  }
  onSave() {
    this.editMacro.modifiedAt = Date.now();
    this.save.emit(this.editMacro);
  }
  static \u0275fac = function MacroEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MacroEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MacroEditorComponent, selectors: [["app-macro-editor"]], inputs: { macro: "macro" }, outputs: { save: "save", cancel: "cancel" }, decls: 44, vars: 7, consts: [[1, "macro-editor"], [1, "form-group"], ["type", "text", "placeholder", "Makro-Name", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Beschreibung...", 3, "ngModelChange", "ngModel"], [3, "ngModelChange", "change", "ngModel"], ["value", "custom_message"], ["value", "dice_roll"], ["value", "apply_damage"], ["value", "apply_healing"], ["value", "modify_resource"], ["value", "modify_stat"], ["type", "text", "placeholder", "z.B. \u26A1", 3, "ngModelChange", "ngModel"], ["type", "color", 3, "ngModelChange", "ngModel", "value"], [1, "editor-actions"], [1, "cancel-btn", 3, "click"], [1, "save-btn", 3, "click"], ["rows", "3", "placeholder", "Nachricht...", 3, "ngModelChange", "ngModel"], ["type", "color", "value", "#ffffff", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. 2d6+3", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. Angriff", 3, "ngModelChange", "ngModel"], ["type", "color", "value", "#4caf50", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. 1d8+5", 3, "ngModelChange", "ngModel"], [1, "form-row"], ["type", "number", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. 2d8+3", 3, "ngModelChange", "ngModel"], [3, "ngModelChange", "ngModel"], ["value", "health"], ["value", "mana"], ["value", "energy"], ["value", "fokus"], ["value", "strength"], ["value", "dexterity"], ["value", "speed"], ["value", "intelligence"], ["value", "constitution"], ["value", "chill"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"]], template: function MacroEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "label");
      \u0275\u0275text(3, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "input", 2);
      \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Template_input_ngModelChange_4_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.name, $event) || (ctx.editMacro.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(5, "div", 1)(6, "label");
      \u0275\u0275text(7, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "textarea", 3);
      \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Template_textarea_ngModelChange_8_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.description, $event) || (ctx.editMacro.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 1)(10, "label");
      \u0275\u0275text(11, "Aktion");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "select", 4);
      \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Template_select_ngModelChange_12_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.actionType, $event) || (ctx.editMacro.actionType = $event);
        return $event;
      });
      \u0275\u0275listener("change", function MacroEditorComponent_Template_select_change_12_listener() {
        return ctx.onActionTypeChange();
      });
      \u0275\u0275elementStart(13, "option", 5);
      \u0275\u0275text(14, "Nachricht anzeigen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(15, "option", 6);
      \u0275\u0275text(16, "W\xFCrfeln");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(17, "option", 7);
      \u0275\u0275text(18, "Schaden zuf\xFCgen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "option", 8);
      \u0275\u0275text(20, "Heilen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "option", 9);
      \u0275\u0275text(22, "Ressource \xE4ndern");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "option", 10);
      \u0275\u0275text(24, "Stat \xE4ndern");
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(25, MacroEditorComponent_Case_25_Template, 8, 2)(26, MacroEditorComponent_Case_26_Template, 12, 3)(27, MacroEditorComponent_Case_27_Template, 9, 2)(28, MacroEditorComponent_Case_28_Template, 9, 2)(29, MacroEditorComponent_Case_29_Template, 16, 2)(30, MacroEditorComponent_Case_30_Template, 25, 3);
      \u0275\u0275elementStart(31, "div", 1)(32, "label");
      \u0275\u0275text(33, "Icon");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "input", 11);
      \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Template_input_ngModelChange_34_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.icon, $event) || (ctx.editMacro.icon = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(35, "div", 1)(36, "label");
      \u0275\u0275text(37, "Farbe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "input", 12);
      \u0275\u0275twoWayListener("ngModelChange", function MacroEditorComponent_Template_input_ngModelChange_38_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.editMacro.color, $event) || (ctx.editMacro.color = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(39, "div", 13)(40, "button", 14);
      \u0275\u0275listener("click", function MacroEditorComponent_Template_button_click_40_listener() {
        return ctx.cancel.emit();
      });
      \u0275\u0275text(41, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "button", 15);
      \u0275\u0275listener("click", function MacroEditorComponent_Template_button_click_42_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(43, "Speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      let tmp_3_0;
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.description);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.actionType);
      \u0275\u0275advance(13);
      \u0275\u0275conditional((tmp_3_0 = ctx.editMacro.actionType) === "custom_message" ? 25 : tmp_3_0 === "dice_roll" ? 26 : tmp_3_0 === "apply_damage" ? 27 : tmp_3_0 === "apply_healing" ? 28 : tmp_3_0 === "modify_resource" ? 29 : tmp_3_0 === "modify_stat" ? 30 : -1);
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.icon);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editMacro.color);
      \u0275\u0275property("value", ctx.editMacro.color || "#4caf50");
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel], styles: ["\n\n.macro-editor[_ngcontent-%COMP%] {\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: var(--muted);\n  font-size: 0.85rem;\n  text-transform: uppercase;\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.9rem;\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.form-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n}\n.form-row[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.editor-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.5rem;\n  margin-top: 1rem;\n  padding-top: 1rem;\n  border-top: 1px solid var(--border);\n}\n.save-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-weight: 600;\n}\n.save-btn[_ngcontent-%COMP%]:hover {\n  background: var(--accent-dark);\n}\n.cancel-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: transparent;\n  color: var(--muted);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n}\n.cancel-btn[_ngcontent-%COMP%]:hover {\n  border-color: var(--text);\n  color: var(--text);\n}\ninput[type=color][_ngcontent-%COMP%] {\n  height: 2rem;\n  padding: 2px;\n  cursor: pointer;\n}\n/*# sourceMappingURL=macro-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MacroEditorComponent, [{
    type: Component,
    args: [{ selector: "app-macro-editor", standalone: true, imports: [CommonModule, FormsModule], template: `
    <div class="macro-editor">
      <div class="form-group">
        <label>Name</label>
        <input type="text" [(ngModel)]="editMacro.name" placeholder="Makro-Name">
      </div>
      
      <div class="form-group">
        <label>Beschreibung</label>
        <textarea [(ngModel)]="editMacro.description" rows="2" placeholder="Beschreibung..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Aktion</label>
        <select [(ngModel)]="editMacro.actionType" (change)="onActionTypeChange()">
          <option value="custom_message">Nachricht anzeigen</option>
          <option value="dice_roll">W\xFCrfeln</option>
          <option value="apply_damage">Schaden zuf\xFCgen</option>
          <option value="apply_healing">Heilen</option>
          <option value="modify_resource">Ressource \xE4ndern</option>
          <option value="modify_stat">Stat \xE4ndern</option>
        </select>
      </div>
      
      <!-- Action-specific parameters -->
      @switch (editMacro.actionType) {
        @case ('custom_message') {
          <div class="form-group">
            <label>Nachricht</label>
            <textarea [(ngModel)]="editMacro.parameters.message" rows="3" placeholder="Nachricht..."></textarea>
          </div>
          <div class="form-group">
            <label>Farbe</label>
            <input type="color" [(ngModel)]="editMacro.parameters.messageColor" value="#ffffff">
          </div>
        }
        
        @case ('dice_roll') {
          <div class="form-group">
            <label>W\xFCrfelformel</label>
            <input type="text" [(ngModel)]="editMacro.parameters.diceFormula" placeholder="z.B. 2d6+3">
          </div>
          <div class="form-group">
            <label>W\xFCrfelname</label>
            <input type="text" [(ngModel)]="editMacro.parameters.rollName" placeholder="z.B. Angriff">
          </div>
          <div class="form-group">
            <label>Farbe</label>
            <input type="color" [(ngModel)]="editMacro.parameters.rollColor" value="#4caf50">
          </div>
        }
        
        @case ('apply_damage') {
          <div class="form-group">
            <label>Schadensformel</label>
            <input type="text" [(ngModel)]="editMacro.parameters.diceAmount" placeholder="z.B. 1d8+5">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Oder fester Wert</label>
              <input type="number" [(ngModel)]="editMacro.parameters.amount">
            </div>
          </div>
        }
        
        @case ('apply_healing') {
          <div class="form-group">
            <label>Heilungsformel</label>
            <input type="text" [(ngModel)]="editMacro.parameters.diceAmount" placeholder="z.B. 2d8+3">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Oder fester Wert</label>
              <input type="number" [(ngModel)]="editMacro.parameters.amount">
            </div>
          </div>
        }
        
        @case ('modify_resource') {
          <div class="form-group">
            <label>Ressource</label>
            <select [(ngModel)]="editMacro.parameters.resource">
              <option value="health">Leben</option>
              <option value="mana">Mana</option>
              <option value="energy">Energie</option>
              <option value="fokus">Fokus</option>
            </select>
          </div>
          <div class="form-group">
            <label>Menge (negativ = abziehen)</label>
            <input type="number" [(ngModel)]="editMacro.parameters.resourceAmount">
          </div>
        }
        
        @case ('modify_stat') {
          <div class="form-group">
            <label>Stat</label>
            <select [(ngModel)]="editMacro.parameters.stat">
              <option value="strength">St\xE4rke</option>
              <option value="dexterity">Geschick</option>
              <option value="speed">Tempo</option>
              <option value="intelligence">Intelligenz</option>
              <option value="constitution">Konstitution</option>
              <option value="chill">Wille</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Modifikator</label>
              <input type="number" [(ngModel)]="editMacro.parameters.statModifier">
            </div>
            <div class="form-group">
              <label>Dauer (Runden)</label>
              <input type="number" [(ngModel)]="editMacro.parameters.duration" min="1">
            </div>
          </div>
        }
      }
      
      <div class="form-group">
        <label>Icon</label>
        <input type="text" [(ngModel)]="editMacro.icon" placeholder="z.B. \u26A1">
      </div>
      
      <div class="form-group">
        <label>Farbe</label>
        <input type="color" [(ngModel)]="editMacro.color" [value]="editMacro.color || '#4caf50'">
      </div>
      
      <div class="editor-actions">
        <button class="cancel-btn" (click)="cancel.emit()">Abbrechen</button>
        <button class="save-btn" (click)="onSave()">Speichern</button>
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;178073e221e03fec9fecd0c75cd0137f2085cc59d006542c01dc5e9a9acc0785;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/macro-editor/macro-editor.component.ts */\n.macro-editor {\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.form-group label {\n  font-weight: 600;\n  color: var(--muted);\n  font-size: 0.85rem;\n  text-transform: uppercase;\n}\n.form-group input,\n.form-group select,\n.form-group textarea {\n  padding: 0.5rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.9rem;\n}\n.form-group input:focus,\n.form-group select:focus,\n.form-group textarea:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.form-row {\n  display: flex;\n  gap: 1rem;\n}\n.form-row .form-group {\n  flex: 1;\n}\n.editor-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.5rem;\n  margin-top: 1rem;\n  padding-top: 1rem;\n  border-top: 1px solid var(--border);\n}\n.save-btn {\n  padding: 0.5rem 1rem;\n  background: var(--accent);\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-weight: 600;\n}\n.save-btn:hover {\n  background: var(--accent-dark);\n}\n.cancel-btn {\n  padding: 0.5rem 1rem;\n  background: transparent;\n  color: var(--muted);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  cursor: pointer;\n}\n.cancel-btn:hover {\n  border-color: var(--text);\n  color: var(--text);\n}\ninput[type=color] {\n  height: 2rem;\n  padding: 2px;\n  cursor: pointer;\n}\n/*# sourceMappingURL=macro-editor.component.css.map */\n"] }]
  }], null, { macro: [{
    type: Input,
    args: [{ required: true }]
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MacroEditorComponent, { className: "MacroEditorComponent", filePath: "app/shared/macro-editor/macro-editor.component.ts", lineNumber: 237 });
})();

// src/app/shared/material-editor/material-editor.component.ts
var _c0 = () => [];
function MaterialEditorComponent_Conditional_34_For_4_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 27);
    \u0275\u0275listener("click", function MaterialEditorComponent_Conditional_34_For_4_Conditional_4_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const \u0275$index_65_r3 = \u0275\u0275nextContext().$index;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.removeStackLevel(\u0275$index_65_r3));
    });
    \u0275\u0275text(1, "\u2715");
    \u0275\u0275elementEnd();
  }
}
function MaterialEditorComponent_Conditional_34_For_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 22)(1, "span", 24);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 25);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_34_For_4_Template_input_ngModelChange_3_listener($event) {
      const \u0275$index_65_r3 = \u0275\u0275restoreView(_r2).$index;
      const ctx_r3 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.stackLevels[\u0275$index_65_r3], $event) || (ctx_r3.edit.stackLevels[\u0275$index_65_r3] = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, MaterialEditorComponent_Conditional_34_For_4_Conditional_4_Template, 2, 0, "button", 26);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const \u0275$index_65_r3 = ctx.$index;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Stufe ", \u0275$index_65_r3 + 1);
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.stackLevels[\u0275$index_65_r3]);
    \u0275\u0275property("placeholder", "Beschreibung Stufe " + (\u0275$index_65_r3 + 1));
    \u0275\u0275advance();
    \u0275\u0275conditional(\u0275$index_65_r3 > 0 ? 4 : -1);
  }
}
function MaterialEditorComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 15)(1, "div", 21);
    \u0275\u0275text(2, "Stapel-Effekte");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(3, MaterialEditorComponent_Conditional_34_For_4_Template, 5, 4, "div", 22, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementStart(5, "button", 23);
    \u0275\u0275listener("click", function MaterialEditorComponent_Conditional_34_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.addStackLevel());
    });
    \u0275\u0275text(6, "+ Stufe");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r3.edit.stackLevels ?? \u0275\u0275pureFunction0(0, _c0));
  }
}
function MaterialEditorComponent_Conditional_35_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 30);
    \u0275\u0275text(1, "Effekt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "input", 33);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Conditional_25_Template_input_ngModelChange_2_listener($event) {
      \u0275\u0275restoreView(_r7);
      const ctx_r3 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.extraEffect, $event) || (ctx_r3.edit.weaponStats.extraEffect = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.extraEffect);
  }
}
function MaterialEditorComponent_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 16)(1, "div", 28);
    \u0275\u0275text(2, "\u2694 Waffenwerte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 29)(4, "span", 30);
    \u0275\u0275text(5, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.haltbarkeit, $event) || (ctx_r3.edit.weaponStats.haltbarkeit = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 30);
    \u0275\u0275text(8, "+/S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.haltbarkeitSkalierung, $event) || (ctx_r3.edit.weaponStats.haltbarkeitSkalierung = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 30);
    \u0275\u0275text(11, "\u2694");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.effektivitaet, $event) || (ctx_r3.edit.weaponStats.effektivitaet = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 30);
    \u0275\u0275text(14, "+/S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.effektivitaetSkalierung, $event) || (ctx_r3.edit.weaponStats.effektivitaetSkalierung = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 30);
    \u0275\u0275text(17, "\u2696");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "input", 32);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_18_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.weight, $event) || (ctx_r3.edit.weaponStats.weight = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 30);
    \u0275\u0275text(20, "Anf");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_21_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.reqBase, $event) || (ctx_r3.edit.weaponStats.reqBase = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "span", 30);
    \u0275\u0275text(23, "+/S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_35_Template_input_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.weaponStats.reqScaling, $event) || (ctx_r3.edit.weaponStats.reqScaling = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(25, MaterialEditorComponent_Conditional_35_Conditional_25_Template, 3, 1);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.haltbarkeit);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.haltbarkeitSkalierung);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.effektivitaet);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.effektivitaetSkalierung);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.weight);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.reqBase);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.weaponStats.reqScaling);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r3.edit.stackable ? 25 : -1);
  }
}
function MaterialEditorComponent_Conditional_36_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 30);
    \u0275\u0275text(1, "Effekt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "input", 35);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Conditional_28_Template_input_ngModelChange_2_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r3 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.extraEffect, $event) || (ctx_r3.edit.armorStats.extraEffect = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.extraEffect);
  }
}
function MaterialEditorComponent_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 17)(1, "div", 28);
    \u0275\u0275text(2, "\u26CA R\xFCstungswerte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 29)(4, "span", 30);
    \u0275\u0275text(5, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_6_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.haltbarkeit, $event) || (ctx_r3.edit.armorStats.haltbarkeit = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 30);
    \u0275\u0275text(8, "+/S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_9_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.haltbarkeitSkalierung, $event) || (ctx_r3.edit.armorStats.haltbarkeitSkalierung = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "span", 30);
    \u0275\u0275text(11, "\u26CA");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.effektivitaet, $event) || (ctx_r3.edit.armorStats.effektivitaet = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "span", 30);
    \u0275\u0275text(14, "+/S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_15_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.effektivitaetSkalierung, $event) || (ctx_r3.edit.armorStats.effektivitaetSkalierung = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 30);
    \u0275\u0275text(17, "\u2696");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "input", 34);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_18_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.weight, $event) || (ctx_r3.edit.armorStats.weight = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 30);
    \u0275\u0275text(20, "Mal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_21_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.ruestungsmalus, $event) || (ctx_r3.edit.armorStats.ruestungsmalus = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "span", 30);
    \u0275\u0275text(23, "Anf");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_24_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.reqBase, $event) || (ctx_r3.edit.armorStats.reqBase = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "span", 30);
    \u0275\u0275text(26, "+/S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "input", 31);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Conditional_36_Template_input_ngModelChange_27_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r3 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r3.edit.armorStats.reqScaling, $event) || (ctx_r3.edit.armorStats.reqScaling = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(28, MaterialEditorComponent_Conditional_36_Conditional_28_Template, 3, 1);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.haltbarkeit);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.haltbarkeitSkalierung);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.effektivitaet);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.effektivitaetSkalierung);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.weight);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.ruestungsmalus);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.reqBase);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r3.edit.armorStats.reqScaling);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r3.edit.stackable ? 28 : -1);
  }
}
var MaterialEditorComponent = class _MaterialEditorComponent {
  material = createEmptyMaterialBlock();
  save = new EventEmitter();
  cancel = new EventEmitter();
  edit = createEmptyMaterialBlock();
  ngOnInit() {
    this.edit = JSON.parse(JSON.stringify(this.material));
    this.ensureStats();
    this.ensureDefaults();
  }
  ensureStats() {
    if (!this.edit.weaponStats) {
      this.edit.weaponStats = this.emptyWeaponStats();
    }
    if (!this.edit.armorStats) {
      this.edit.armorStats = this.emptyArmorStats();
    }
  }
  ensureDefaults() {
    if (!this.edit.rarity)
      this.edit.rarity = "COMMON";
    if (this.edit.stackable === void 0)
      this.edit.stackable = false;
    if (!this.edit.stackLevels)
      this.edit.stackLevels = [];
  }
  emptyWeaponStats() {
    return { haltbarkeit: 50, haltbarkeitSkalierung: 10, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: "", weight: 1, reqBase: 0, reqScaling: 0 };
  }
  emptyArmorStats() {
    return { haltbarkeit: 80, haltbarkeitSkalierung: 15, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: "", weight: 2, ruestungsmalus: 0, reqBase: 0, reqScaling: 0 };
  }
  onWeaponToggle() {
    if (this.edit.canBeWeaponMaterial && !this.edit.weaponStats) {
      this.edit.weaponStats = this.emptyWeaponStats();
    }
  }
  onArmorToggle() {
    if (this.edit.canBeArmorMaterial && !this.edit.armorStats) {
      this.edit.armorStats = this.emptyArmorStats();
    }
  }
  onStackableChange() {
    if (this.edit.stackable && (!this.edit.stackLevels || this.edit.stackLevels.length === 0)) {
      this.edit.stackLevels = [""];
    }
  }
  addStackLevel() {
    if (!this.edit.stackLevels)
      this.edit.stackLevels = [];
    this.edit.stackLevels.push("");
  }
  removeStackLevel(index) {
    if (!this.edit.stackLevels || index <= 0)
      return;
    this.edit.stackLevels.splice(index, 1);
  }
  onSave() {
    if (!this.edit.name?.trim())
      return;
    this.save.emit(this.edit);
  }
  onCancel() {
    this.cancel.emit();
  }
  static \u0275fac = function MaterialEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MaterialEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MaterialEditorComponent, selectors: [["app-material-editor"]], inputs: { material: "material" }, outputs: { save: "save", cancel: "cancel" }, decls: 42, vars: 12, consts: [[1, "mat-editor"], [1, "me-top-row"], [1, "me-field", "me-name-field"], ["type", "text", "placeholder", "Materialname", 3, "ngModelChange", "ngModel"], [1, "me-field", "me-rarity-field"], [3, "ngModelChange", "ngModel"], ["value", "COMMON"], ["value", "RARE"], ["value", "LEGENDARY"], [1, "me-field", "me-cost-field"], ["type", "number", "min", "0", "placeholder", "0", 3, "ngModelChange", "ngModel"], [1, "me-flags-row"], [1, "me-toggle"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Optionale Beschreibung...", 1, "me-desc", 3, "ngModelChange", "ngModel"], [1, "me-stack-section"], [1, "me-stats-block", "me-stats-weapon"], [1, "me-stats-block", "me-stats-armor"], [1, "me-actions"], [1, "btn-cancel", 3, "click"], [1, "btn-save", 3, "click", "disabled"], [1, "me-stack-header"], [1, "me-stack-row"], [1, "me-stack-add", 3, "click"], [1, "me-stack-lbl"], ["type", "text", 1, "me-stack-input", 3, "ngModelChange", "ngModel", "placeholder"], ["title", "Entfernen", 1, "me-stack-del"], ["title", "Entfernen", 1, "me-stack-del", 3, "click"], [1, "me-stats-ttl"], [1, "me-stats-grid"], [1, "me-lbl"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "step", "0.1", 1, "me-span3", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. +1 Reichweite", 1, "me-span3", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "step", "0.1", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. Feuerschutz +1", 1, "me-span3", 3, "ngModelChange", "ngModel"]], template: function MaterialEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "label");
      \u0275\u0275text(4, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "input", 3);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_5_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.name, $event) || (ctx.edit.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 4)(7, "label");
      \u0275\u0275text(8, "Rarit\xE4t");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "select", 5);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_select_ngModelChange_9_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.rarity, $event) || (ctx.edit.rarity = $event);
        return $event;
      });
      \u0275\u0275elementStart(10, "option", 6);
      \u0275\u0275text(11, "Gew\xF6hnlich");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "option", 7);
      \u0275\u0275text(13, "Selten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "option", 8);
      \u0275\u0275text(15, "Legend\xE4r");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "div", 9)(17, "label");
      \u0275\u0275text(18, "\u{1F4B0} Kosten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "input", 10);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_19_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.cost, $event) || (ctx.edit.cost = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(20, "div", 11)(21, "label", 12)(22, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_22_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.isPublic, $event) || (ctx.edit.isPublic = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(23, " \xD6ffentlich");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "label", 12)(25, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_25_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.canBeWeaponMaterial, $event) || (ctx.edit.canBeWeaponMaterial = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_25_listener() {
        return ctx.onWeaponToggle();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(26, " Waffe");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "label", 12)(28, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_28_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.canBeArmorMaterial, $event) || (ctx.edit.canBeArmorMaterial = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_28_listener() {
        return ctx.onArmorToggle();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(29, " R\xFCstung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(30, "label", 12)(31, "input", 13);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_31_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.stackable, $event) || (ctx.edit.stackable = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function MaterialEditorComponent_Template_input_ngModelChange_31_listener() {
        return ctx.onStackableChange();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(32, " Stapelbar");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "textarea", 14);
      \u0275\u0275twoWayListener("ngModelChange", function MaterialEditorComponent_Template_textarea_ngModelChange_33_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.description, $event) || (ctx.edit.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(34, MaterialEditorComponent_Conditional_34_Template, 7, 1, "div", 15);
      \u0275\u0275conditionalCreate(35, MaterialEditorComponent_Conditional_35_Template, 26, 8, "div", 16);
      \u0275\u0275conditionalCreate(36, MaterialEditorComponent_Conditional_36_Template, 29, 9, "div", 17);
      \u0275\u0275elementStart(37, "div", 18)(38, "button", 19);
      \u0275\u0275listener("click", function MaterialEditorComponent_Template_button_click_38_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(39, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "button", 20);
      \u0275\u0275listener("click", function MaterialEditorComponent_Template_button_click_40_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(41, "Speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.rarity);
      \u0275\u0275advance(10);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.cost);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.isPublic);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.canBeWeaponMaterial);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.canBeArmorMaterial);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.stackable);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.description);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.edit.stackable ? 34 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.edit.canBeWeaponMaterial && ctx.edit.weaponStats ? 35 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.edit.canBeArmorMaterial && ctx.edit.armorStats ? 36 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", !ctx.edit.name.trim());
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel], styles: ["\n\n.mat-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n  padding: 0.25rem 0;\n  font-size: 0.82rem;\n  color: var(--text, #e5e7eb);\n}\n.me-top-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.5rem;\n  align-items: flex-end;\n}\n.me-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.me-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.me-name-field[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.me-rarity-field[_ngcontent-%COMP%] {\n  width: 120px;\n}\n.me-cost-field[_ngcontent-%COMP%] {\n  width: 90px;\n}\n.me-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.me-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  padding: 0.3rem 0.45rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.82rem;\n}\n.me-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.me-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-flags-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.6rem 1.1rem;\n  align-items: center;\n  padding: 0.3rem 0.55rem;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n}\n.me-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  font-size: 0.81rem;\n  font-weight: 500;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.me-toggle[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 13px;\n  height: 13px;\n  accent-color: var(--accent, #8b5cf6);\n  cursor: pointer;\n  flex-shrink: 0;\n}\n.me-desc[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.3rem 0.45rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.81rem;\n  resize: vertical;\n  font-family: inherit;\n}\n.me-desc[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-stack-section[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-left: 3px solid var(--accent, #8b5cf6);\n  border-radius: 5px;\n  padding: 0.4rem 0.55rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.me-stack-header[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 0.1rem;\n}\n.me-stack-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n.me-stack-lbl[_ngcontent-%COMP%] {\n  font-size: 0.73rem;\n  color: var(--text-muted, #9ca3af);\n  min-width: 48px;\n  flex-shrink: 0;\n}\n.me-stack-input[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 0.25rem 0.4rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.81rem;\n}\n.me-stack-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-stack-del[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #6b7280;\n  border-radius: 3px;\n  color: #6b7280;\n  font-size: 0.7rem;\n  padding: 0.1rem 0.3rem;\n  cursor: pointer;\n  line-height: 1;\n}\n.me-stack-del[_ngcontent-%COMP%]:hover {\n  color: #f87171;\n  border-color: #f87171;\n}\n.me-stack-add[_ngcontent-%COMP%] {\n  align-self: flex-start;\n  background: transparent;\n  border: 1px dashed var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  padding: 0.2rem 0.6rem;\n  cursor: pointer;\n  margin-top: 0.1rem;\n}\n.me-stack-add[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.me-stats-block[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  padding: 0.4rem 0.55rem;\n}\n.me-stats-weapon[_ngcontent-%COMP%] {\n  border-left: 3px solid #f97316;\n}\n.me-stats-armor[_ngcontent-%COMP%] {\n  border-left: 3px solid #60a5fa;\n}\n.me-stats-ttl[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 0.35rem;\n}\n.me-stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 26px 68px 34px 68px;\n  gap: 0.22rem 0.3rem;\n  align-items: center;\n}\n.me-lbl[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  text-align: right;\n  white-space: nowrap;\n}\n.me-stats-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  padding: 0.22rem 0.35rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.80rem;\n  width: 100%;\n  box-sizing: border-box;\n  -moz-appearance: textfield;\n  appearance: textfield;\n}\n.me-stats-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::-webkit-inner-spin-button, \n.me-stats-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.me-stats-grid[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%] {\n  -moz-appearance: initial;\n  appearance: initial;\n}\n.me-stats-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-span3[_ngcontent-%COMP%] {\n  grid-column: span 3;\n}\n.me-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.6rem;\n  padding-top: 0.15rem;\n}\n.btn-cancel[_ngcontent-%COMP%] {\n  padding: 0.32rem 0.9rem;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.83rem;\n  cursor: pointer;\n}\n.btn-cancel[_ngcontent-%COMP%]:hover {\n  border-color: var(--text-muted, #9ca3af);\n  color: var(--text, #e5e7eb);\n}\n.btn-save[_ngcontent-%COMP%] {\n  padding: 0.32rem 1.1rem;\n  border: none;\n  border-radius: 5px;\n  background: var(--accent, #8b5cf6);\n  color: white;\n  font-size: 0.83rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.btn-save[_ngcontent-%COMP%]:hover:not(:disabled) {\n  opacity: 0.85;\n}\n.btn-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=material-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MaterialEditorComponent, [{
    type: Component,
    args: [{ selector: "app-material-editor", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="mat-editor">\r
\r
  <!-- Row 1: Name + Rarit\xE4t + Kosten -->\r
  <div class="me-top-row">\r
    <div class="me-field me-name-field">\r
      <label>Name</label>\r
      <input type="text" [(ngModel)]="edit.name" placeholder="Materialname" />\r
    </div>\r
    <div class="me-field me-rarity-field">\r
      <label>Rarit&#xE4;t</label>\r
      <select [(ngModel)]="edit.rarity">\r
        <option value="COMMON">Gew&#xF6;hnlich</option>\r
        <option value="RARE">Selten</option>\r
        <option value="LEGENDARY">Legend&#xE4;r</option>\r
      </select>\r
    </div>\r
    <div class="me-field me-cost-field">\r
      <label>&#x1F4B0; Kosten</label>\r
      <input type="number" [(ngModel)]="edit.cost" min="0" placeholder="0" />\r
    </div>\r
  </div>\r
\r
  <!-- Row 2: Flags -->\r
  <div class="me-flags-row">\r
    <label class="me-toggle"><input type="checkbox" [(ngModel)]="edit.isPublic" /> &#xD6;ffentlich</label>\r
    <label class="me-toggle"><input type="checkbox" [(ngModel)]="edit.canBeWeaponMaterial" (ngModelChange)="onWeaponToggle()" /> Waffe</label>\r
    <label class="me-toggle"><input type="checkbox" [(ngModel)]="edit.canBeArmorMaterial" (ngModelChange)="onArmorToggle()" /> R&#xFC;stung</label>\r
    <label class="me-toggle"><input type="checkbox" [(ngModel)]="edit.stackable" (ngModelChange)="onStackableChange()" /> Stapelbar</label>\r
  </div>\r
\r
  <!-- Description -->\r
  <textarea class="me-desc" [(ngModel)]="edit.description" rows="2" placeholder="Optionale Beschreibung..."></textarea>\r
\r
  <!-- Stack levels (only when stackable) -->\r
  @if (edit.stackable) {\r
    <div class="me-stack-section">\r
      <div class="me-stack-header">Stapel-Effekte</div>\r
      @for (lvl of (edit.stackLevels ?? []); track $index; let i = $index) {\r
        <div class="me-stack-row">\r
          <span class="me-stack-lbl">Stufe {{ i + 1 }}</span>\r
          <input type="text" [(ngModel)]="edit.stackLevels![i]" [placeholder]="'Beschreibung Stufe ' + (i + 1)" class="me-stack-input" />\r
          @if (i > 0) {\r
            <button class="me-stack-del" (click)="removeStackLevel(i)" title="Entfernen">&#x2715;</button>\r
          }\r
        </div>\r
      }\r
      <button class="me-stack-add" (click)="addStackLevel()">+ Stufe</button>\r
    </div>\r
  }\r
\r
  <!-- Weapon Stats -->\r
  @if (edit.canBeWeaponMaterial && edit.weaponStats) {\r
    <div class="me-stats-block me-stats-weapon">\r
      <div class="me-stats-ttl">&#x2694; Waffenwerte</div>\r
      <div class="me-stats-grid">\r
        <span class="me-lbl">&#x2390;</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.haltbarkeit" min="0" />\r
        <span class="me-lbl">+/S</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.haltbarkeitSkalierung" min="0" />\r
\r
        <span class="me-lbl">&#x2694;</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.effektivitaet" min="0" />\r
        <span class="me-lbl">+/S</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.effektivitaetSkalierung" min="0" />\r
\r
        <span class="me-lbl">&#x2696;</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.weight" min="0" step="0.1" class="me-span3" />\r
\r
        <span class="me-lbl">Anf</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.reqBase" min="0" />\r
        <span class="me-lbl">+/S</span>\r
        <input type="number" [(ngModel)]="edit.weaponStats.reqScaling" min="0" />\r
\r
        @if (!edit.stackable) {\r
          <span class="me-lbl">Effekt</span>\r
          <input type="text" [(ngModel)]="edit.weaponStats.extraEffect" placeholder="z.B. +1 Reichweite" class="me-span3" />\r
        }\r
      </div>\r
    </div>\r
  }\r
\r
  <!-- Armor Stats -->\r
  @if (edit.canBeArmorMaterial && edit.armorStats) {\r
    <div class="me-stats-block me-stats-armor">\r
      <div class="me-stats-ttl">&#x26CA; R&#xFC;stungswerte</div>\r
      <div class="me-stats-grid">\r
        <span class="me-lbl">&#x2390;</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.haltbarkeit" min="0" />\r
        <span class="me-lbl">+/S</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.haltbarkeitSkalierung" min="0" />\r
\r
        <span class="me-lbl">&#x26CA;</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.effektivitaet" min="0" />\r
        <span class="me-lbl">+/S</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.effektivitaetSkalierung" min="0" />\r
\r
        <span class="me-lbl">&#x2696;</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.weight" min="0" step="0.1" />\r
        <span class="me-lbl">Mal</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.ruestungsmalus" min="0" />\r
\r
        <span class="me-lbl">Anf</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.reqBase" min="0" />\r
        <span class="me-lbl">+/S</span>\r
        <input type="number" [(ngModel)]="edit.armorStats.reqScaling" min="0" />\r
\r
        @if (!edit.stackable) {\r
          <span class="me-lbl">Effekt</span>\r
          <input type="text" [(ngModel)]="edit.armorStats.extraEffect" placeholder="z.B. Feuerschutz +1" class="me-span3" />\r
        }\r
      </div>\r
    </div>\r
  }\r
\r
  <!-- Actions -->\r
  <div class="me-actions">\r
    <button class="btn-cancel" (click)="onCancel()">Abbrechen</button>\r
    <button class="btn-save" (click)="onSave()" [disabled]="!edit.name.trim()">Speichern</button>\r
  </div>\r
</div>\r
`, styles: ["/* src/app/shared/material-editor/material-editor.component.css */\n.mat-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 0.45rem;\n  padding: 0.25rem 0;\n  font-size: 0.82rem;\n  color: var(--text, #e5e7eb);\n}\n.me-top-row {\n  display: flex;\n  gap: 0.5rem;\n  align-items: flex-end;\n}\n.me-field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.me-field label {\n  font-size: 0.72rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.me-name-field {\n  flex: 1;\n}\n.me-rarity-field {\n  width: 120px;\n}\n.me-cost-field {\n  width: 90px;\n}\n.me-field input,\n.me-field select {\n  padding: 0.3rem 0.45rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.82rem;\n}\n.me-field input:focus,\n.me-field select:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-flags-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.6rem 1.1rem;\n  align-items: center;\n  padding: 0.3rem 0.55rem;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n}\n.me-toggle {\n  display: flex;\n  align-items: center;\n  gap: 0.3rem;\n  font-size: 0.81rem;\n  font-weight: 500;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.me-toggle input[type=checkbox] {\n  width: 13px;\n  height: 13px;\n  accent-color: var(--accent, #8b5cf6);\n  cursor: pointer;\n  flex-shrink: 0;\n}\n.me-desc {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 0.3rem 0.45rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.81rem;\n  resize: vertical;\n  font-family: inherit;\n}\n.me-desc:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-stack-section {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-left: 3px solid var(--accent, #8b5cf6);\n  border-radius: 5px;\n  padding: 0.4rem 0.55rem;\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.me-stack-header {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--accent, #8b5cf6);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 0.1rem;\n}\n.me-stack-row {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n.me-stack-lbl {\n  font-size: 0.73rem;\n  color: var(--text-muted, #9ca3af);\n  min-width: 48px;\n  flex-shrink: 0;\n}\n.me-stack-input {\n  flex: 1;\n  padding: 0.25rem 0.4rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.81rem;\n}\n.me-stack-input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-stack-del {\n  background: transparent;\n  border: 1px solid #6b7280;\n  border-radius: 3px;\n  color: #6b7280;\n  font-size: 0.7rem;\n  padding: 0.1rem 0.3rem;\n  cursor: pointer;\n  line-height: 1;\n}\n.me-stack-del:hover {\n  color: #f87171;\n  border-color: #f87171;\n}\n.me-stack-add {\n  align-self: flex-start;\n  background: transparent;\n  border: 1px dashed var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  padding: 0.2rem 0.6rem;\n  cursor: pointer;\n  margin-top: 0.1rem;\n}\n.me-stack-add:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.me-stats-block {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  padding: 0.4rem 0.55rem;\n}\n.me-stats-weapon {\n  border-left: 3px solid #f97316;\n}\n.me-stats-armor {\n  border-left: 3px solid #60a5fa;\n}\n.me-stats-ttl {\n  font-size: 0.72rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 0.35rem;\n}\n.me-stats-grid {\n  display: grid;\n  grid-template-columns: 26px 68px 34px 68px;\n  gap: 0.22rem 0.3rem;\n  align-items: center;\n}\n.me-lbl {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  text-align: right;\n  white-space: nowrap;\n}\n.me-stats-grid input {\n  padding: 0.22rem 0.35rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 4px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.80rem;\n  width: 100%;\n  box-sizing: border-box;\n  -moz-appearance: textfield;\n  appearance: textfield;\n}\n.me-stats-grid input::-webkit-inner-spin-button,\n.me-stats-grid input::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.me-stats-grid input[type=text] {\n  -moz-appearance: initial;\n  appearance: initial;\n}\n.me-stats-grid input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.me-span3 {\n  grid-column: span 3;\n}\n.me-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.6rem;\n  padding-top: 0.15rem;\n}\n.btn-cancel {\n  padding: 0.32rem 0.9rem;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.83rem;\n  cursor: pointer;\n}\n.btn-cancel:hover {\n  border-color: var(--text-muted, #9ca3af);\n  color: var(--text, #e5e7eb);\n}\n.btn-save {\n  padding: 0.32rem 1.1rem;\n  border: none;\n  border-radius: 5px;\n  background: var(--accent, #8b5cf6);\n  color: white;\n  font-size: 0.83rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.btn-save:hover:not(:disabled) {\n  opacity: 0.85;\n}\n.btn-save:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=material-editor.component.css.map */\n"] }]
  }], null, { material: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MaterialEditorComponent, { className: "MaterialEditorComponent", filePath: "app/shared/material-editor/material-editor.component.ts", lineNumber: 13 });
})();

// src/app/shared/forge-trait-editor/forge-trait-editor.component.ts
function ForgeTraitEditorComponent_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 12)(1, "label");
    \u0275\u0275text(2, "Max. Stufe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 19);
    \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Conditional_31_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.edit.maxLevel, $event) || (ctx_r1.edit.maxLevel = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.edit.maxLevel);
  }
}
function ForgeTraitEditorComponent_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 13);
    \u0275\u0275text(1, " \u2014 Nutze ");
    \u0275\u0275elementStart(2, "code");
    \u0275\u0275text(3, "[L]");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4, " als Platzhalter f\xFCr die Stufe");
    \u0275\u0275elementEnd();
  }
}
function ForgeTraitEditorComponent_Conditional_37_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 15)(1, "span", 20);
    \u0275\u0275text(2, "Vorschau (Stufe 1):");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 21);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.previewEffect);
  }
}
var ForgeTraitEditorComponent = class _ForgeTraitEditorComponent {
  trait = createEmptyForgeTrait();
  save = new EventEmitter();
  cancel = new EventEmitter();
  edit = createEmptyForgeTrait();
  /** Live preview of the effect at level 1 */
  get previewEffect() {
    if (!this.edit.scalable)
      return this.edit.effect;
    return this.edit.effect.replace(/\[L\]/g, "1");
  }
  ngOnInit() {
    this.edit = JSON.parse(JSON.stringify(this.trait));
    if (this.edit.maxLevel == null)
      this.edit.maxLevel = 1;
    if (!this.edit.appliesTo)
      this.edit.appliesTo = "all";
  }
  onScalableChange() {
    if (!this.edit.scalable) {
      this.edit.maxLevel = 1;
    }
  }
  onSave() {
    if (!this.edit.name?.trim())
      return;
    this.save.emit(this.edit);
  }
  onCancel() {
    this.cancel.emit();
  }
  static \u0275fac = function ForgeTraitEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ForgeTraitEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ForgeTraitEditorComponent, selectors: [["app-forge-trait-editor"]], inputs: { trait: "trait" }, outputs: { save: "save", cancel: "cancel" }, decls: 43, vars: 12, consts: [[1, "trait-editor"], [1, "form-row"], ["type", "text", "placeholder", "z.B. Werfen", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Optionale Beschreibung...", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"], [1, "toggle-row"], [1, "toggle-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [3, "ngModelChange", "ngModel"], ["value", "all"], ["value", "weapon"], ["value", "armor"], [1, "inline-field"], [1, "hint"], ["type", "text", 3, "ngModelChange", "ngModel", "placeholder"], [1, "preview-box"], [1, "editor-actions"], [1, "btn-cancel", 3, "click"], [1, "btn-save", 3, "click", "disabled"], ["type", "number", "min", "2", "max", "99", 1, "small-input", 3, "ngModelChange", "ngModel"], [1, "preview-label"], [1, "preview-text"]], template: function ForgeTraitEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "label");
      \u0275\u0275text(3, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "input", 2);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_input_ngModelChange_4_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.name, $event) || (ctx.edit.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(5, "div", 1)(6, "label");
      \u0275\u0275text(7, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "textarea", 3);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_textarea_ngModelChange_8_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.description, $event) || (ctx.edit.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 1)(10, "label");
      \u0275\u0275text(11, "Schmiedepunkte-Kosten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "input", 4);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_input_ngModelChange_12_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.schmiedepunktKosten, $event) || (ctx.edit.schmiedepunktKosten = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "div", 5)(14, "label", 6)(15, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_input_ngModelChange_15_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.isPublic, $event) || (ctx.edit.isPublic = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(16, " \xD6ffentlich (f\xFCr alle Spieler im Wissen-Tab sichtbar) ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "div", 1)(18, "label");
      \u0275\u0275text(19, "Anwendbar auf");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "select", 8);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_select_ngModelChange_20_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.appliesTo, $event) || (ctx.edit.appliesTo = $event);
        return $event;
      });
      \u0275\u0275elementStart(21, "option", 9);
      \u0275\u0275text(22, "Alle (Waffen & R\xFCstungen)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(23, "option", 10);
      \u0275\u0275text(24, "Nur Waffen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "option", 11);
      \u0275\u0275text(26, "Nur R\xFCstungen");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(27, "div", 5)(28, "label", 6)(29, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_input_ngModelChange_29_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.scalable, $event) || (ctx.edit.scalable = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function ForgeTraitEditorComponent_Template_input_ngModelChange_29_listener() {
        return ctx.onScalableChange();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(30, " Skalierbar (mehrfach hinzuf\xFCgbar) ");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(31, ForgeTraitEditorComponent_Conditional_31_Template, 4, 1, "div", 12);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "div", 1)(33, "label");
      \u0275\u0275text(34, " Effekttext ");
      \u0275\u0275conditionalCreate(35, ForgeTraitEditorComponent_Conditional_35_Template, 5, 0, "span", 13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "input", 14);
      \u0275\u0275twoWayListener("ngModelChange", function ForgeTraitEditorComponent_Template_input_ngModelChange_36_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.effect, $event) || (ctx.edit.effect = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(37, ForgeTraitEditorComponent_Conditional_37_Template, 5, 1, "div", 15);
      \u0275\u0275elementStart(38, "div", 16)(39, "button", 17);
      \u0275\u0275listener("click", function ForgeTraitEditorComponent_Template_button_click_39_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(40, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(41, "button", 18);
      \u0275\u0275listener("click", function ForgeTraitEditorComponent_Template_button_click_41_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(42, "Speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.description);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.schmiedepunktKosten);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.isPublic);
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.appliesTo);
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.scalable);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.edit.scalable ? 31 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.edit.scalable ? 35 : -1);
      \u0275\u0275advance();
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.effect);
      \u0275\u0275property("placeholder", ctx.edit.scalable ? "z.B. Werfen + [L]" : "z.B. Werfen + 1");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.edit.scalable && ctx.edit.effect ? 37 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", !ctx.edit.name.trim());
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel], styles: ["\n\n.trait-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 0.25rem 0;\n  font-family: sans-serif;\n}\n.form-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.form-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.form-row[_ngcontent-%COMP%]   .hint[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: none;\n  letter-spacing: 0;\n  font-weight: 400;\n}\n.form-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.75rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  resize: vertical;\n}\n.form-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);\n}\ncode[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  padding: 0.1em 0.3em;\n  border-radius: 3px;\n  font-size: 0.85em;\n  color: var(--accent, #8b5cf6);\n}\n.toggle-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1.5rem;\n  flex-wrap: wrap;\n}\n.toggle-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n}\n.toggle-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.inline-field[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.85rem;\n  color: var(--text-muted, #9ca3af);\n}\n.small-input[_ngcontent-%COMP%] {\n  width: 70px;\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.preview-box[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 6px;\n  padding: 0.6rem 0.9rem;\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.preview-label[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  white-space: nowrap;\n}\n.preview-text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.editor-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.75rem;\n  padding-top: 0.5rem;\n}\n.btn-cancel[_ngcontent-%COMP%] {\n  padding: 0.5rem 1.25rem;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-cancel[_ngcontent-%COMP%]:hover {\n  border-color: var(--text-muted, #9ca3af);\n  color: var(--text, #e5e7eb);\n}\n.btn-save[_ngcontent-%COMP%] {\n  padding: 0.5rem 1.5rem;\n  border: none;\n  border-radius: 6px;\n  background: var(--accent, #8b5cf6);\n  color: white;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-save[_ngcontent-%COMP%]:hover:not(:disabled) {\n  filter: brightness(1.15);\n}\n.btn-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=forge-trait-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ForgeTraitEditorComponent, [{
    type: Component,
    args: [{ selector: "app-forge-trait-editor", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="trait-editor">\r
  <!-- Name -->\r
  <div class="form-row">\r
    <label>Name</label>\r
    <input type="text" [(ngModel)]="edit.name" placeholder="z.B. Werfen" />\r
  </div>\r
\r
  <!-- Description -->\r
  <div class="form-row">\r
    <label>Beschreibung</label>\r
    <textarea [(ngModel)]="edit.description" rows="2" placeholder="Optionale Beschreibung..."></textarea>\r
  </div>\r
\r
  <!-- SP cost -->\r
  <div class="form-row">\r
    <label>Schmiedepunkte-Kosten</label>\r
    <input type="number" [(ngModel)]="edit.schmiedepunktKosten" min="1" />\r
  </div>\r
\r
  <!-- Public -->\r
  <div class="toggle-row">\r
    <label class="toggle-label">\r
      <input type="checkbox" [(ngModel)]="edit.isPublic" />\r
      \xD6ffentlich (f\xFCr alle Spieler im Wissen-Tab sichtbar)\r
    </label>\r
  </div>\r
\r
  <!-- Applies to -->\r
  <div class="form-row">\r
    <label>Anwendbar auf</label>\r
    <select [(ngModel)]="edit.appliesTo">\r
      <option value="all">Alle (Waffen & R\xFCstungen)</option>\r
      <option value="weapon">Nur Waffen</option>\r
      <option value="armor">Nur R\xFCstungen</option>\r
    </select>\r
  </div>\r
\r
  <!-- Scalable toggle -->\r
  <div class="toggle-row">\r
    <label class="toggle-label">\r
      <input type="checkbox" [(ngModel)]="edit.scalable" (ngModelChange)="onScalableChange()" />\r
      Skalierbar (mehrfach hinzuf\xFCgbar)\r
    </label>\r
    @if (edit.scalable) {\r
      <div class="inline-field">\r
        <label>Max. Stufe</label>\r
        <input type="number" [(ngModel)]="edit.maxLevel" min="2" max="99" class="small-input" />\r
      </div>\r
    }\r
  </div>\r
\r
  <!-- Effect -->\r
  <div class="form-row">\r
    <label>\r
      Effekttext\r
      @if (edit.scalable) {\r
        <span class="hint"> \u2014 Nutze <code>[L]</code> als Platzhalter f\xFCr die Stufe</span>\r
      }\r
    </label>\r
    <input type="text" [(ngModel)]="edit.effect" [placeholder]="edit.scalable ? 'z.B. Werfen + [L]' : 'z.B. Werfen + 1'" />\r
  </div>\r
\r
  <!-- Live preview -->\r
  @if (edit.scalable && edit.effect) {\r
    <div class="preview-box">\r
      <span class="preview-label">Vorschau (Stufe 1):</span>\r
      <span class="preview-text">{{ previewEffect }}</span>\r
    </div>\r
  }\r
\r
  <!-- Actions -->\r
  <div class="editor-actions">\r
    <button class="btn-cancel" (click)="onCancel()">Abbrechen</button>\r
    <button class="btn-save" (click)="onSave()" [disabled]="!edit.name.trim()">Speichern</button>\r
  </div>\r
</div>\r
`, styles: ["/* src/app/shared/forge-trait-editor/forge-trait-editor.component.css */\n.trait-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 0.25rem 0;\n  font-family: sans-serif;\n}\n.form-row {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.form-row label {\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.form-row .hint {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: none;\n  letter-spacing: 0;\n  font-weight: 400;\n}\n.form-row input,\n.form-row textarea {\n  padding: 0.5rem 0.75rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  resize: vertical;\n}\n.form-row input:focus,\n.form-row textarea:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);\n}\ncode {\n  background: rgba(139, 92, 246, 0.15);\n  padding: 0.1em 0.3em;\n  border-radius: 3px;\n  font-size: 0.85em;\n  color: var(--accent, #8b5cf6);\n}\n.toggle-row {\n  display: flex;\n  align-items: center;\n  gap: 1.5rem;\n  flex-wrap: wrap;\n}\n.toggle-label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n}\n.toggle-label input[type=checkbox] {\n  width: 16px;\n  height: 16px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.inline-field {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.85rem;\n  color: var(--text-muted, #9ca3af);\n}\n.small-input {\n  width: 70px;\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.preview-box {\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 6px;\n  padding: 0.6rem 0.9rem;\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.preview-label {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  white-space: nowrap;\n}\n.preview-text {\n  font-size: 0.9rem;\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.editor-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.75rem;\n  padding-top: 0.5rem;\n}\n.btn-cancel {\n  padding: 0.5rem 1.25rem;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-cancel:hover {\n  border-color: var(--text-muted, #9ca3af);\n  color: var(--text, #e5e7eb);\n}\n.btn-save {\n  padding: 0.5rem 1.5rem;\n  border: none;\n  border-radius: 6px;\n  background: var(--accent, #8b5cf6);\n  color: white;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-save:hover:not(:disabled) {\n  filter: brightness(1.15);\n}\n.btn-save:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=forge-trait-editor.component.css.map */\n"] }]
  }], null, { trait: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ForgeTraitEditorComponent, { className: "ForgeTraitEditorComponent", filePath: "app/shared/forge-trait-editor/forge-trait-editor.component.ts", lineNumber: 13 });
})();

// src/app/shared/brew-trait-editor/brew-trait-editor.component.ts
function BrewTraitEditorComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 9)(1, "label");
    \u0275\u0275text(2, "Max. Stufe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 15);
    \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Conditional_23_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.edit.maxLevel, $event) || (ctx_r1.edit.maxLevel = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.edit.maxLevel);
  }
}
function BrewTraitEditorComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 4);
    \u0275\u0275text(1, " \u2014 Nutze ");
    \u0275\u0275elementStart(2, "code");
    \u0275\u0275text(3, "[L]");
    \u0275\u0275elementEnd();
    \u0275\u0275text(4, " als Platzhalter f\xFCr die Stufe");
    \u0275\u0275elementEnd();
  }
}
function BrewTraitEditorComponent_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11)(1, "span", 16);
    \u0275\u0275text(2, "Vorschau (Stufe 1):");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 17);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.previewEffect);
  }
}
var BrewTraitEditorComponent = class _BrewTraitEditorComponent {
  trait = createEmptyBrewTrait();
  save = new EventEmitter();
  cancel = new EventEmitter();
  edit = createEmptyBrewTrait();
  /** Live preview of the effect at level 1 */
  get previewEffect() {
    if (!this.edit.scalable)
      return this.edit.effect;
    return this.edit.effect.replace(/\[L\]/g, "1");
  }
  ngOnInit() {
    this.edit = JSON.parse(JSON.stringify(this.trait));
    if (this.edit.maxLevel == null)
      this.edit.maxLevel = 1;
    if (this.edit.braupunktKosten == null)
      this.edit.braupunktKosten = 1;
  }
  onScalableChange() {
    if (!this.edit.scalable)
      this.edit.maxLevel = 1;
  }
  onSave() {
    if (!this.edit.name?.trim())
      return;
    this.save.emit(this.edit);
  }
  onCancel() {
    this.cancel.emit();
  }
  static \u0275fac = function BrewTraitEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrewTraitEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BrewTraitEditorComponent, selectors: [["app-brew-trait-editor"]], inputs: { trait: "trait" }, outputs: { save: "save", cancel: "cancel" }, decls: 35, vars: 11, consts: [[1, "trait-editor"], [1, "form-row"], ["type", "text", "placeholder", "z.B. Langanhaltend", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Optionale Beschreibung...", 3, "ngModelChange", "ngModel"], [1, "hint"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], [1, "toggle-row"], [1, "toggle-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "inline-field"], ["type", "text", 3, "ngModelChange", "ngModel", "placeholder"], [1, "preview-box"], [1, "editor-actions"], [1, "btn-cancel", 3, "click"], [1, "btn-save", 3, "click", "disabled"], ["type", "number", "min", "2", "max", "99", 1, "small-input", 3, "ngModelChange", "ngModel"], [1, "preview-label"], [1, "preview-text"]], template: function BrewTraitEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "label");
      \u0275\u0275text(3, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "input", 2);
      \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Template_input_ngModelChange_4_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.name, $event) || (ctx.edit.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(5, "div", 1)(6, "label");
      \u0275\u0275text(7, "Beschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(8, "textarea", 3);
      \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Template_textarea_ngModelChange_8_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.description, $event) || (ctx.edit.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 1)(10, "label");
      \u0275\u0275text(11, " Braupunkte-Kosten ");
      \u0275\u0275elementStart(12, "span", 4);
      \u0275\u0275text(13, " \u2014 pro Anwendung, steigt nicht an");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(14, "input", 5);
      \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Template_input_ngModelChange_14_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.braupunktKosten, $event) || (ctx.edit.braupunktKosten = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(15, "div", 6)(16, "label", 7)(17, "input", 8);
      \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Template_input_ngModelChange_17_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.isPublic, $event) || (ctx.edit.isPublic = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(18, " \xD6ffentlich (f\xFCr alle Spieler im Wissen-Tab sichtbar) ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(19, "div", 6)(20, "label", 7)(21, "input", 8);
      \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Template_input_ngModelChange_21_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.scalable, $event) || (ctx.edit.scalable = $event);
        return $event;
      });
      \u0275\u0275listener("ngModelChange", function BrewTraitEditorComponent_Template_input_ngModelChange_21_listener() {
        return ctx.onScalableChange();
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(22, " Skalierbar (mehrfach hinzuf\xFCgbar) ");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(23, BrewTraitEditorComponent_Conditional_23_Template, 4, 1, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "div", 1)(25, "label");
      \u0275\u0275text(26, " Effekttext ");
      \u0275\u0275conditionalCreate(27, BrewTraitEditorComponent_Conditional_27_Template, 5, 0, "span", 4);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "input", 10);
      \u0275\u0275twoWayListener("ngModelChange", function BrewTraitEditorComponent_Template_input_ngModelChange_28_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.effect, $event) || (ctx.edit.effect = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(29, BrewTraitEditorComponent_Conditional_29_Template, 5, 1, "div", 11);
      \u0275\u0275elementStart(30, "div", 12)(31, "button", 13);
      \u0275\u0275listener("click", function BrewTraitEditorComponent_Template_button_click_31_listener() {
        return ctx.onCancel();
      });
      \u0275\u0275text(32, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "button", 14);
      \u0275\u0275listener("click", function BrewTraitEditorComponent_Template_button_click_33_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(34, "Speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.description);
      \u0275\u0275advance(6);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.braupunktKosten);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.isPublic);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.scalable);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.edit.scalable ? 23 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(ctx.edit.scalable ? 27 : -1);
      \u0275\u0275advance();
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.effect);
      \u0275\u0275property("placeholder", ctx.edit.scalable ? "z.B. Wirkungsdauer + [L] Runden" : "z.B. Wirkungsdauer + 1 Runde");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.edit.scalable && ctx.edit.effect ? 29 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", !ctx.edit.name.trim());
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel], styles: ["\n\n.trait-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 0.25rem 0;\n  font-family: sans-serif;\n}\n.form-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.form-row[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.form-row[_ngcontent-%COMP%]   .hint[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: none;\n  letter-spacing: 0;\n  font-weight: 400;\n}\n.form-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 0.5rem 0.75rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  resize: vertical;\n}\n.form-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-row[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);\n}\ncode[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  padding: 0.1em 0.3em;\n  border-radius: 3px;\n  font-size: 0.85em;\n  color: var(--accent, #8b5cf6);\n}\n.toggle-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1.5rem;\n  flex-wrap: wrap;\n}\n.toggle-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n}\n.toggle-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 16px;\n  height: 16px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.inline-field[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.85rem;\n  color: var(--text-muted, #9ca3af);\n}\n.small-input[_ngcontent-%COMP%] {\n  width: 70px;\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.preview-box[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 6px;\n  padding: 0.6rem 0.9rem;\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.preview-label[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  white-space: nowrap;\n}\n.preview-text[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.editor-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.75rem;\n  padding-top: 0.5rem;\n}\n.btn-cancel[_ngcontent-%COMP%] {\n  padding: 0.5rem 1.25rem;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-cancel[_ngcontent-%COMP%]:hover {\n  border-color: var(--text-muted, #9ca3af);\n  color: var(--text, #e5e7eb);\n}\n.btn-save[_ngcontent-%COMP%] {\n  padding: 0.5rem 1.5rem;\n  border: none;\n  border-radius: 6px;\n  background: var(--accent, #8b5cf6);\n  color: white;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-save[_ngcontent-%COMP%]:hover:not(:disabled) {\n  filter: brightness(1.15);\n}\n.btn-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=brew-trait-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrewTraitEditorComponent, [{
    type: Component,
    args: [{ selector: "app-brew-trait-editor", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="trait-editor">
  <!-- Name -->
  <div class="form-row">
    <label>Name</label>
    <input type="text" [(ngModel)]="edit.name" placeholder="z.B. Langanhaltend" />
  </div>

  <!-- Description -->
  <div class="form-row">
    <label>Beschreibung</label>
    <textarea [(ngModel)]="edit.description" rows="2" placeholder="Optionale Beschreibung..."></textarea>
  </div>

  <!-- BP cost (flat per application) -->
  <div class="form-row">
    <label>
      Braupunkte-Kosten
      <span class="hint"> \u2014 pro Anwendung, steigt nicht an</span>
    </label>
    <input type="number" [(ngModel)]="edit.braupunktKosten" min="0" />
  </div>

  <!-- Public -->
  <div class="toggle-row">
    <label class="toggle-label">
      <input type="checkbox" [(ngModel)]="edit.isPublic" />
      \xD6ffentlich (f\xFCr alle Spieler im Wissen-Tab sichtbar)
    </label>
  </div>

  <!-- Scalable toggle -->
  <div class="toggle-row">
    <label class="toggle-label">
      <input type="checkbox" [(ngModel)]="edit.scalable" (ngModelChange)="onScalableChange()" />
      Skalierbar (mehrfach hinzuf\xFCgbar)
    </label>
    @if (edit.scalable) {
      <div class="inline-field">
        <label>Max. Stufe</label>
        <input type="number" [(ngModel)]="edit.maxLevel" min="2" max="99" class="small-input" />
      </div>
    }
  </div>

  <!-- Effect -->
  <div class="form-row">
    <label>
      Effekttext
      @if (edit.scalable) {
        <span class="hint"> \u2014 Nutze <code>[L]</code> als Platzhalter f\xFCr die Stufe</span>
      }
    </label>
    <input type="text" [(ngModel)]="edit.effect"
           [placeholder]="edit.scalable ? 'z.B. Wirkungsdauer + [L] Runden' : 'z.B. Wirkungsdauer + 1 Runde'" />
  </div>

  <!-- Live preview -->
  @if (edit.scalable && edit.effect) {
    <div class="preview-box">
      <span class="preview-label">Vorschau (Stufe 1):</span>
      <span class="preview-text">{{ previewEffect }}</span>
    </div>
  }

  <!-- Actions -->
  <div class="editor-actions">
    <button class="btn-cancel" (click)="onCancel()">Abbrechen</button>
    <button class="btn-save" (click)="onSave()" [disabled]="!edit.name.trim()">Speichern</button>
  </div>
</div>
`, styles: ["/* src/app/shared/brew-trait-editor/brew-trait-editor.component.css */\n.trait-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 0.25rem 0;\n  font-family: sans-serif;\n}\n.form-row {\n  display: flex;\n  flex-direction: column;\n  gap: 0.3rem;\n}\n.form-row label {\n  font-size: 0.8rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.form-row .hint {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  text-transform: none;\n  letter-spacing: 0;\n  font-weight: 400;\n}\n.form-row input,\n.form-row textarea {\n  padding: 0.5rem 0.75rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.9rem;\n  resize: vertical;\n}\n.form-row input:focus,\n.form-row textarea:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);\n}\ncode {\n  background: rgba(139, 92, 246, 0.15);\n  padding: 0.1em 0.3em;\n  border-radius: 3px;\n  font-size: 0.85em;\n  color: var(--accent, #8b5cf6);\n}\n.toggle-row {\n  display: flex;\n  align-items: center;\n  gap: 1.5rem;\n  flex-wrap: wrap;\n}\n.toggle-label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  cursor: pointer;\n}\n.toggle-label input[type=checkbox] {\n  width: 16px;\n  height: 16px;\n  accent-color: var(--accent, #8b5cf6);\n}\n.inline-field {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-size: 0.85rem;\n  color: var(--text-muted, #9ca3af);\n}\n.small-input {\n  width: 70px;\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.preview-box {\n  background: rgba(139, 92, 246, 0.08);\n  border: 1px solid rgba(139, 92, 246, 0.25);\n  border-radius: 6px;\n  padding: 0.6rem 0.9rem;\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n}\n.preview-label {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  white-space: nowrap;\n}\n.preview-text {\n  font-size: 0.9rem;\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n}\n.editor-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.75rem;\n  padding-top: 0.5rem;\n}\n.btn-cancel {\n  padding: 0.5rem 1.25rem;\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 6px;\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-cancel:hover {\n  border-color: var(--text-muted, #9ca3af);\n  color: var(--text, #e5e7eb);\n}\n.btn-save {\n  padding: 0.5rem 1.5rem;\n  border: none;\n  border-radius: 6px;\n  background: var(--accent, #8b5cf6);\n  color: white;\n  font-size: 0.9rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn-save:hover:not(:disabled) {\n  filter: brightness(1.15);\n}\n.btn-save:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=brew-trait-editor.component.css.map */\n"] }]
  }], null, { trait: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BrewTraitEditorComponent, { className: "BrewTraitEditorComponent", filePath: "app/shared/brew-trait-editor/brew-trait-editor.component.ts", lineNumber: 17 });
})();

// src/app/shared/ingredient-editor/ingredient-editor.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function IngredientEditorComponent_For_25_For_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const se_r4 = ctx.$implicit;
    \u0275\u0275property("value", se_r4.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(se_r4.name);
  }
}
function IngredientEditorComponent_For_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 13)(1, "div", 17);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 18)(4, "label");
    \u0275\u0275text(5, "Status-Effekt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "select", 5);
    \u0275\u0275listener("ngModelChange", function IngredientEditorComponent_For_25_Template_select_ngModelChange_6_listener($event) {
      const slot_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onStatusPick(slot_r2, $event));
    });
    \u0275\u0275elementStart(7, "option", 19);
    \u0275\u0275text(8, "\u2013 Keiner \u2013");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(9, IngredientEditorComponent_For_25_For_10_Template, 2, 2, "option", 20, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "label");
    \u0275\u0275text(12, "Stapelung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "select", 5);
    \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_For_25_Template_select_ngModelChange_13_listener($event) {
      const slot_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r2.effect(slot_r2).mode, $event) || (ctx_r2.effect(slot_r2).mode = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementStart(14, "option", 21);
    \u0275\u0275text(15, "Stacks");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "option", 22);
    \u0275\u0275text(17, "Dauer");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "label");
    \u0275\u0275text(19);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "input", 23);
    \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_For_25_Template_input_ngModelChange_20_listener($event) {
      const slot_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r2.effect(slot_r2).amount, $event) || (ctx_r2.effect(slot_r2).amount = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "label");
    \u0275\u0275text(22, "Braukosten");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "input", 23);
    \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_For_25_Template_input_ngModelChange_23_listener($event) {
      const slot_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r2.effect(slot_r2).cost, $event) || (ctx_r2.effect(slot_r2).cost = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const slot_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275attribute("data-slot", slot_r2);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r2.slotLabels[slot_r2], "-Effekt");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", ctx_r2.effect(slot_r2).statusEffectId);
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r2.statusEffects);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.effect(slot_r2).mode);
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r2.effect(slot_r2).mode === "STACK" ? "Stacks" : "Dauer (Runden)");
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.effect(slot_r2).amount);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.effect(slot_r2).cost);
  }
}
var IngredientEditorComponent = class _IngredientEditorComponent {
  ingredient = createEmptyIngredientBlock();
  save = new EventEmitter();
  cancel = new EventEmitter();
  api = inject(AssetBrowserApiService);
  edit = createEmptyIngredientBlock();
  statusEffects = [];
  slots = ["primary", "secondary", "tertiary"];
  slotLabels = BREW_SLOT_LABELS;
  async ngOnInit() {
    this.edit = JSON.parse(JSON.stringify(this.ingredient));
    for (const slot of this.slots) {
      if (!this.edit[slot])
        this.edit[slot] = createEmptyIngredientEffect();
    }
    if (!this.edit.rarity)
      this.edit.rarity = "COMMON";
    await this.loadStatusEffects();
  }
  async loadStatusEffects() {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const all = [];
      for (const lib of libraries) {
        const files = await firstValueFrom(this.api.searchFiles(lib.id, "", ["status-effect"]));
        for (const f of files) {
          const se = f.data;
          if (se?.id)
            all.push(__spreadValues({}, se));
        }
      }
      this.statusEffects = all.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
      console.error("IngredientEditor: status effects load failed", e);
    }
  }
  effect(slot) {
    return this.edit[slot];
  }
  onStatusPick(slot, statusEffectId) {
    const se = this.statusEffects.find((s) => s.id === statusEffectId);
    const eff = this.edit[slot];
    eff.statusEffectId = statusEffectId;
    eff.statusEffectName = se?.name ?? "";
  }
  onSave() {
    if (!this.edit.name?.trim())
      return;
    this.save.emit(this.edit);
  }
  static \u0275fac = function IngredientEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _IngredientEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _IngredientEditorComponent, selectors: [["app-ingredient-editor"]], inputs: { ingredient: "ingredient" }, outputs: { save: "save", cancel: "cancel" }, decls: 31, vars: 6, consts: [[1, "ing-editor"], [1, "ie-top-row"], [1, "ie-field", "ie-name-field"], ["type", "text", "placeholder", "Wirkstoffname", 3, "ngModelChange", "ngModel"], [1, "ie-field"], [3, "ngModelChange", "ngModel"], ["value", "COMMON"], ["value", "RARE"], ["value", "LEGENDARY"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], [1, "ie-toggle"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Beschreibung...", 1, "ie-desc", 3, "ngModelChange", "ngModel"], [1, "ie-effect-block"], [1, "ie-actions"], ["type", "button", 1, "ie-cancel", 3, "click"], ["type", "button", 1, "ie-save", 3, "click", "disabled"], [1, "ie-effect-ttl"], [1, "ie-effect-grid"], ["value", ""], [3, "value"], ["value", "STACK"], ["value", "DURATION"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"]], template: function IngredientEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "label");
      \u0275\u0275text(4, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "input", 3);
      \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_Template_input_ngModelChange_5_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.name, $event) || (ctx.edit.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 4)(7, "label");
      \u0275\u0275text(8, "Rarit\xE4t");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "select", 5);
      \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_Template_select_ngModelChange_9_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.rarity, $event) || (ctx.edit.rarity = $event);
        return $event;
      });
      \u0275\u0275elementStart(10, "option", 6);
      \u0275\u0275text(11, "Gew\xF6hnlich");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "option", 7);
      \u0275\u0275text(13, "Selten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "option", 8);
      \u0275\u0275text(15, "Legend\xE4r");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "div", 4)(17, "label");
      \u0275\u0275text(18, "Kosten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_Template_input_ngModelChange_19_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.cost, $event) || (ctx.edit.cost = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "label", 10)(21, "input", 11);
      \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_Template_input_ngModelChange_21_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.isPublic, $event) || (ctx.edit.isPublic = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(22, " \xD6ffentlich");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(23, "textarea", 12);
      \u0275\u0275twoWayListener("ngModelChange", function IngredientEditorComponent_Template_textarea_ngModelChange_23_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.description, $event) || (ctx.edit.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275repeaterCreate(24, IngredientEditorComponent_For_25_Template, 24, 7, "div", 13, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementStart(26, "div", 14)(27, "button", 15);
      \u0275\u0275listener("click", function IngredientEditorComponent_Template_button_click_27_listener() {
        return ctx.cancel.emit();
      });
      \u0275\u0275text(28, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "button", 16);
      \u0275\u0275listener("click", function IngredientEditorComponent_Template_button_click_29_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(30, "Speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.rarity);
      \u0275\u0275advance(10);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.cost);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.isPublic);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.description);
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.slots);
      \u0275\u0275advance(5);
      \u0275\u0275property("disabled", !(ctx.edit.name == null ? null : ctx.edit.name.trim()));
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel], styles: ["\n\n.ing-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.65rem;\n  padding: 0.25rem 0;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ie-top-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: flex-end;\n}\n.ie-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.ie-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%], \n.ie-effect-grid[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.ie-name-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 160px;\n}\n.ie-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.ie-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.ie-effect-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.ie-effect-grid[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.ie-desc[_ngcontent-%COMP%] {\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ie-desc[_ngcontent-%COMP%] {\n  width: 100%;\n  resize: vertical;\n  box-sizing: border-box;\n}\n.ie-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  font-size: 0.8rem;\n  padding-bottom: 0.35rem;\n  cursor: pointer;\n}\n.ie-effect-block[_ngcontent-%COMP%] {\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 0.65rem 0.75rem;\n  background: rgba(0, 0, 0, 0.15);\n}\n.ie-effect-block[data-slot=primary][_ngcontent-%COMP%] {\n  border-left: 3px solid #34d399;\n}\n.ie-effect-block[data-slot=secondary][_ngcontent-%COMP%] {\n  border-left: 3px solid #60a5fa;\n}\n.ie-effect-block[data-slot=tertiary][_ngcontent-%COMP%] {\n  border-left: 3px solid #fb923c;\n}\n.ie-effect-ttl[_ngcontent-%COMP%] {\n  font-weight: 700;\n  margin-bottom: 0.45rem;\n  font-size: 0.9rem;\n}\n.ie-effect-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: auto 1fr auto 1fr;\n  gap: 0.4rem 0.6rem;\n  align-items: center;\n}\n.ie-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.5rem;\n  margin-top: 0.25rem;\n}\n.ie-cancel[_ngcontent-%COMP%], \n.ie-save[_ngcontent-%COMP%] {\n  padding: 0.4rem 0.9rem;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  cursor: pointer;\n  font-weight: 600;\n}\n.ie-cancel[_ngcontent-%COMP%] {\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n}\n.ie-save[_ngcontent-%COMP%] {\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border-color: transparent;\n}\n.ie-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: default;\n}\n/*# sourceMappingURL=ingredient-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IngredientEditorComponent, [{
    type: Component,
    args: [{ selector: "app-ingredient-editor", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="ing-editor">
  <div class="ie-top-row">
    <div class="ie-field ie-name-field">
      <label>Name</label>
      <input type="text" [(ngModel)]="edit.name" placeholder="Wirkstoffname" />
    </div>
    <div class="ie-field">
      <label>Rarit&#xE4;t</label>
      <select [(ngModel)]="edit.rarity">
        <option value="COMMON">Gew&#xF6;hnlich</option>
        <option value="RARE">Selten</option>
        <option value="LEGENDARY">Legend&#xE4;r</option>
      </select>
    </div>
    <div class="ie-field">
      <label>Kosten</label>
      <input type="number" [(ngModel)]="edit.cost" min="0" />
    </div>
    <label class="ie-toggle"><input type="checkbox" [(ngModel)]="edit.isPublic" /> &#xD6;ffentlich</label>
  </div>

  <textarea class="ie-desc" [(ngModel)]="edit.description" rows="2" placeholder="Beschreibung..."></textarea>

  @for (slot of slots; track slot) {
    <div class="ie-effect-block" [attr.data-slot]="slot">
      <div class="ie-effect-ttl">{{ slotLabels[slot] }}-Effekt</div>
      <div class="ie-effect-grid">
        <label>Status-Effekt</label>
        <select [ngModel]="effect(slot).statusEffectId" (ngModelChange)="onStatusPick(slot, $event)">
          <option value="">\u2013 Keiner \u2013</option>
          @for (se of statusEffects; track se.id) {
            <option [value]="se.id">{{ se.name }}</option>
          }
        </select>

        <label>Stapelung</label>
        <select [(ngModel)]="effect(slot).mode">
          <option value="STACK">Stacks</option>
          <option value="DURATION">Dauer</option>
        </select>

        <label>{{ effect(slot).mode === 'STACK' ? 'Stacks' : 'Dauer (Runden)' }}</label>
        <input type="number" [(ngModel)]="effect(slot).amount" min="1" />

        <label>Braukosten</label>
        <input type="number" [(ngModel)]="effect(slot).cost" min="1" />
      </div>
    </div>
  }

  <div class="ie-actions">
    <button class="ie-cancel" type="button" (click)="cancel.emit()">Abbrechen</button>
    <button class="ie-save" type="button" (click)="onSave()" [disabled]="!edit.name?.trim()">Speichern</button>
  </div>
</div>
`, styles: ["/* src/app/shared/ingredient-editor/ingredient-editor.component.css */\n.ing-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 0.65rem;\n  padding: 0.25rem 0;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ie-top-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: flex-end;\n}\n.ie-field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.ie-field label,\n.ie-effect-grid label {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.ie-name-field {\n  flex: 1;\n  min-width: 160px;\n}\n.ie-field input,\n.ie-field select,\n.ie-effect-grid input,\n.ie-effect-grid select,\n.ie-desc {\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ie-desc {\n  width: 100%;\n  resize: vertical;\n  box-sizing: border-box;\n}\n.ie-toggle {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  font-size: 0.8rem;\n  padding-bottom: 0.35rem;\n  cursor: pointer;\n}\n.ie-effect-block {\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 0.65rem 0.75rem;\n  background: rgba(0, 0, 0, 0.15);\n}\n.ie-effect-block[data-slot=primary] {\n  border-left: 3px solid #34d399;\n}\n.ie-effect-block[data-slot=secondary] {\n  border-left: 3px solid #60a5fa;\n}\n.ie-effect-block[data-slot=tertiary] {\n  border-left: 3px solid #fb923c;\n}\n.ie-effect-ttl {\n  font-weight: 700;\n  margin-bottom: 0.45rem;\n  font-size: 0.9rem;\n}\n.ie-effect-grid {\n  display: grid;\n  grid-template-columns: auto 1fr auto 1fr;\n  gap: 0.4rem 0.6rem;\n  align-items: center;\n}\n.ie-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.5rem;\n  margin-top: 0.25rem;\n}\n.ie-cancel,\n.ie-save {\n  padding: 0.4rem 0.9rem;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  cursor: pointer;\n  font-weight: 600;\n}\n.ie-cancel {\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n}\n.ie-save {\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border-color: transparent;\n}\n.ie-save:disabled {\n  opacity: 0.45;\n  cursor: default;\n}\n/*# sourceMappingURL=ingredient-editor.component.css.map */\n"] }]
  }], null, { ingredient: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(IngredientEditorComponent, { className: "IngredientEditorComponent", filePath: "app/shared/ingredient-editor/ingredient-editor.component.ts", lineNumber: 19 });
})();

// src/app/shared/extractor-editor/extractor-editor.component.ts
var ExtractorEditorComponent = class _ExtractorEditorComponent {
  extractor = createEmptyExtractorBlock();
  save = new EventEmitter();
  cancel = new EventEmitter();
  edit = createEmptyExtractorBlock();
  ngOnInit() {
    this.edit = JSON.parse(JSON.stringify(this.extractor));
    if (!this.edit.rarity)
      this.edit.rarity = "COMMON";
  }
  onSave() {
    if (!this.edit.name?.trim())
      return;
    this.edit.primaryReductionPercent = Math.min(100, Math.max(0, this.edit.primaryReductionPercent || 0));
    this.edit.secondaryReductionPercent = Math.min(100, Math.max(0, this.edit.secondaryReductionPercent || 0));
    this.edit.tertiaryReductionPercent = Math.min(100, Math.max(0, this.edit.tertiaryReductionPercent || 0));
    this.save.emit(this.edit);
  }
  static \u0275fac = function ExtractorEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ExtractorEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ExtractorEditorComponent, selectors: [["app-extractor-editor"]], inputs: { extractor: "extractor" }, outputs: { save: "save", cancel: "cancel" }, decls: 44, vars: 9, consts: [[1, "ext-editor"], [1, "ee-top-row"], [1, "ee-field", "ee-name-field"], ["type", "text", "placeholder", "Extraktorname", 3, "ngModelChange", "ngModel"], [1, "ee-field"], [3, "ngModelChange", "ngModel"], ["value", "COMMON"], ["value", "RARE"], ["value", "LEGENDARY"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], [1, "ee-toggle"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], ["rows", "2", "placeholder", "Beschreibung...", 1, "ee-desc", 3, "ngModelChange", "ngModel"], [1, "ee-reduce-block"], [1, "ee-ttl"], [1, "ee-hint"], [1, "ee-reduce-grid"], ["type", "number", "min", "0", "max", "100", 3, "ngModelChange", "ngModel"], [1, "ee-actions"], ["type", "button", 1, "ee-cancel", 3, "click"], ["type", "button", 1, "ee-save", 3, "click", "disabled"]], template: function ExtractorEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "label");
      \u0275\u0275text(4, "Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "input", 3);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_input_ngModelChange_5_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.name, $event) || (ctx.edit.name = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(6, "div", 4)(7, "label");
      \u0275\u0275text(8, "Rarit\xE4t");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "select", 5);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_select_ngModelChange_9_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.rarity, $event) || (ctx.edit.rarity = $event);
        return $event;
      });
      \u0275\u0275elementStart(10, "option", 6);
      \u0275\u0275text(11, "Gew\xF6hnlich");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "option", 7);
      \u0275\u0275text(13, "Selten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "option", 8);
      \u0275\u0275text(15, "Legend\xE4r");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "div", 4)(17, "label");
      \u0275\u0275text(18, "Kosten");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "input", 9);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_input_ngModelChange_19_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.cost, $event) || (ctx.edit.cost = $event);
        return $event;
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(20, "label", 10)(21, "input", 11);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_input_ngModelChange_21_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.isPublic, $event) || (ctx.edit.isPublic = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275text(22, " \xD6ffentlich");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(23, "textarea", 12);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_textarea_ngModelChange_23_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.description, $event) || (ctx.edit.description = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "div", 13)(25, "div", 14);
      \u0275\u0275text(26, "Kostensenkung (%)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "p", 15);
      \u0275\u0275text(28, "Reduziert Braukosten f\xFCr den jeweiligen Slot. Mehrere Extraktoren werden addiert (max. 95%).");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "div", 16)(30, "label");
      \u0275\u0275text(31, "Prim\xE4r");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(32, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_input_ngModelChange_32_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.primaryReductionPercent, $event) || (ctx.edit.primaryReductionPercent = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(33, "label");
      \u0275\u0275text(34, "Sekund\xE4r");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(35, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_input_ngModelChange_35_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.secondaryReductionPercent, $event) || (ctx.edit.secondaryReductionPercent = $event);
        return $event;
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(36, "label");
      \u0275\u0275text(37, "Terti\xE4r");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function ExtractorEditorComponent_Template_input_ngModelChange_38_listener($event) {
        \u0275\u0275twoWayBindingSet(ctx.edit.tertiaryReductionPercent, $event) || (ctx.edit.tertiaryReductionPercent = $event);
        return $event;
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(39, "div", 18)(40, "button", 19);
      \u0275\u0275listener("click", function ExtractorEditorComponent_Template_button_click_40_listener() {
        return ctx.cancel.emit();
      });
      \u0275\u0275text(41, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "button", 20);
      \u0275\u0275listener("click", function ExtractorEditorComponent_Template_button_click_42_listener() {
        return ctx.onSave();
      });
      \u0275\u0275text(43, "Speichern");
      \u0275\u0275elementEnd()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.name);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.rarity);
      \u0275\u0275advance(10);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.cost);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.isPublic);
      \u0275\u0275advance(2);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.description);
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.primaryReductionPercent);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.secondaryReductionPercent);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.edit.tertiaryReductionPercent);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", !(ctx.edit.name == null ? null : ctx.edit.name.trim()));
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel], styles: ["\n\n.ext-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.65rem;\n  padding: 0.25rem 0;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ee-top-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: flex-end;\n}\n.ee-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.ee-field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.ee-name-field[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 160px;\n}\n.ee-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.ee-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.ee-desc[_ngcontent-%COMP%], \n.ee-reduce-grid[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ee-desc[_ngcontent-%COMP%] {\n  width: 100%;\n  resize: vertical;\n  box-sizing: border-box;\n}\n.ee-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  font-size: 0.8rem;\n  padding-bottom: 0.35rem;\n  cursor: pointer;\n}\n.ee-reduce-block[_ngcontent-%COMP%] {\n  border: 1px solid var(--border, #4a5568);\n  border-left: 3px solid #a78bfa;\n  border-radius: 8px;\n  padding: 0.65rem 0.75rem;\n  background: rgba(0, 0, 0, 0.15);\n}\n.ee-ttl[_ngcontent-%COMP%] {\n  font-weight: 700;\n  margin-bottom: 0.25rem;\n}\n.ee-hint[_ngcontent-%COMP%] {\n  margin: 0 0 0.55rem;\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.ee-reduce-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: auto 80px auto 80px auto 80px;\n  gap: 0.4rem 0.55rem;\n  align-items: center;\n}\n.ee-reduce-grid[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.ee-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.5rem;\n}\n.ee-cancel[_ngcontent-%COMP%], \n.ee-save[_ngcontent-%COMP%] {\n  padding: 0.4rem 0.9rem;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  cursor: pointer;\n  font-weight: 600;\n}\n.ee-cancel[_ngcontent-%COMP%] {\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n}\n.ee-save[_ngcontent-%COMP%] {\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border-color: transparent;\n}\n.ee-save[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: default;\n}\n/*# sourceMappingURL=extractor-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ExtractorEditorComponent, [{
    type: Component,
    args: [{ selector: "app-extractor-editor", standalone: true, imports: [CommonModule, FormsModule], template: '<div class="ext-editor">\n  <div class="ee-top-row">\n    <div class="ee-field ee-name-field">\n      <label>Name</label>\n      <input type="text" [(ngModel)]="edit.name" placeholder="Extraktorname" />\n    </div>\n    <div class="ee-field">\n      <label>Rarit&#xE4;t</label>\n      <select [(ngModel)]="edit.rarity">\n        <option value="COMMON">Gew&#xF6;hnlich</option>\n        <option value="RARE">Selten</option>\n        <option value="LEGENDARY">Legend&#xE4;r</option>\n      </select>\n    </div>\n    <div class="ee-field">\n      <label>Kosten</label>\n      <input type="number" [(ngModel)]="edit.cost" min="0" />\n    </div>\n    <label class="ee-toggle"><input type="checkbox" [(ngModel)]="edit.isPublic" /> &#xD6;ffentlich</label>\n  </div>\n\n  <textarea class="ee-desc" [(ngModel)]="edit.description" rows="2" placeholder="Beschreibung..."></textarea>\n\n  <div class="ee-reduce-block">\n    <div class="ee-ttl">Kostensenkung (%)</div>\n    <p class="ee-hint">Reduziert Braukosten f&#xFC;r den jeweiligen Slot. Mehrere Extraktoren werden addiert (max. 95%).</p>\n    <div class="ee-reduce-grid">\n      <label>Prim&#xE4;r</label>\n      <input type="number" [(ngModel)]="edit.primaryReductionPercent" min="0" max="100" />\n      <label>Sekund&#xE4;r</label>\n      <input type="number" [(ngModel)]="edit.secondaryReductionPercent" min="0" max="100" />\n      <label>Terti&#xE4;r</label>\n      <input type="number" [(ngModel)]="edit.tertiaryReductionPercent" min="0" max="100" />\n    </div>\n  </div>\n\n  <div class="ee-actions">\n    <button class="ee-cancel" type="button" (click)="cancel.emit()">Abbrechen</button>\n    <button class="ee-save" type="button" (click)="onSave()" [disabled]="!edit.name?.trim()">Speichern</button>\n  </div>\n</div>\n', styles: ["/* src/app/shared/extractor-editor/extractor-editor.component.css */\n.ext-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 0.65rem;\n  padding: 0.25rem 0;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ee-top-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: flex-end;\n}\n.ee-field {\n  display: flex;\n  flex-direction: column;\n  gap: 0.15rem;\n}\n.ee-field label {\n  font-size: 0.7rem;\n  font-weight: 600;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.ee-name-field {\n  flex: 1;\n  min-width: 160px;\n}\n.ee-field input,\n.ee-field select,\n.ee-desc,\n.ee-reduce-grid input {\n  padding: 0.35rem 0.5rem;\n  background: var(--card, #2d3748);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 0.85rem;\n}\n.ee-desc {\n  width: 100%;\n  resize: vertical;\n  box-sizing: border-box;\n}\n.ee-toggle {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n  font-size: 0.8rem;\n  padding-bottom: 0.35rem;\n  cursor: pointer;\n}\n.ee-reduce-block {\n  border: 1px solid var(--border, #4a5568);\n  border-left: 3px solid #a78bfa;\n  border-radius: 8px;\n  padding: 0.65rem 0.75rem;\n  background: rgba(0, 0, 0, 0.15);\n}\n.ee-ttl {\n  font-weight: 700;\n  margin-bottom: 0.25rem;\n}\n.ee-hint {\n  margin: 0 0 0.55rem;\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.ee-reduce-grid {\n  display: grid;\n  grid-template-columns: auto 80px auto 80px auto 80px;\n  gap: 0.4rem 0.55rem;\n  align-items: center;\n}\n.ee-reduce-grid label {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n}\n.ee-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 0.5rem;\n}\n.ee-cancel,\n.ee-save {\n  padding: 0.4rem 0.9rem;\n  border-radius: 6px;\n  border: 1px solid var(--border, #4a5568);\n  cursor: pointer;\n  font-weight: 600;\n}\n.ee-cancel {\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n}\n.ee-save {\n  background: var(--accent, #8b5cf6);\n  color: #fff;\n  border-color: transparent;\n}\n.ee-save:disabled {\n  opacity: 0.45;\n  cursor: default;\n}\n/*# sourceMappingURL=extractor-editor.component.css.map */\n"] }]
  }], null, { extractor: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ExtractorEditorComponent, { className: "ExtractorEditorComponent", filePath: "app/shared/extractor-editor/extractor-editor.component.ts", lineNumber: 13 });
})();

// src/app/services/weapon-generator.service.ts
var WeaponGeneratorService = class _WeaponGeneratorService {
  /**
   * Try to generate a random weapon up to maxAttempts times.
   * Returns null if no valid result could be found (e.g. constraints too strict).
   */
  generate(params, allMaterials, allTraits, materialFilters, traitFilters, maxAttempts = 30) {
    const availMaterials = this.applyFilters(allMaterials.filter((m) => m.canBeWeaponMaterial), materialFilters);
    const availTraits = this.applyFilters(allTraits, traitFilters);
    if (availMaterials.length === 0)
      return null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = this.tryGenerate(params, availMaterials, availTraits);
      if (!result)
        continue;
      if (params.minHaltbarkeit != null && result.finalHaltbarkeit < params.minHaltbarkeit)
        continue;
      if (params.minEffektivitaet != null && result.finalEffektivitaet < params.minEffektivitaet)
        continue;
      if (params.maxWeight != null && result.finalWeight > params.maxWeight)
        continue;
      if (params.minBudget > 0 && result.totalCost < params.minBudget)
        continue;
      return result;
    }
    return null;
  }
  tryGenerate(params, availMaterials, availTraits) {
    const weaponType = params.weaponTypeName ? WEAPON_TYPES.find((w) => w.name === params.weaponTypeName) ?? this.pick(WEAPON_TYPES) : this.pick(WEAPON_TYPES);
    const weaponSize = params.weaponSize ?? this.pick(["LIGHT", "MEDIUM", "HEAVY"]);
    const sizeMult = { LIGHT: 0.8, MEDIUM: 1, HEAVY: 1.2 }[weaponSize];
    const primaryMat = this.pick(availMaterials);
    const secPool = availMaterials.filter((m) => m.stackable || m.id !== primaryMat.id);
    const secMat = this.pick(secPool.length > 0 ? secPool : availMaterials);
    const bonusMat = this.pick(availMaterials);
    const materialGoldCost = (primaryMat.cost ?? 0) + Math.ceil((secMat.cost ?? 0) / 2) + Math.ceil((bonusMat.cost ?? 0) / 4);
    if (params.budget > 0 && materialGoldCost > params.budget)
      return null;
    const goldForForging = params.budget > 0 ? params.budget - materialGoldCost : Number.MAX_SAFE_INTEGER;
    const spFromGold = params.costPerSP > 0 && goldForForging < Number.MAX_SAFE_INTEGER ? Math.floor(goldForForging / params.costPerSP) : Number.MAX_SAFE_INTEGER;
    const spBudget = Math.min(params.maxSP, spFromGold);
    const ratio = Math.max(0, Math.min(100, params.forgingRatio ?? 50)) / 100;
    let spForForging = Math.round(spBudget * ratio);
    let spForTraits = spBudget - spForForging;
    const primaryEntry = { material: primaryMat, forgeCount: 0 };
    this.forgeMaterial(primaryEntry, spForForging);
    spForForging -= totalForgeSPSpent(primaryEntry.forgeCount);
    const secondaryEntry = { material: secMat, forgeCount: 0 };
    this.forgeMaterial(secondaryEntry, spForForging);
    spForForging -= totalForgeSPSpent(secondaryEntry.forgeCount);
    spForTraits += spForForging;
    const bonusEntry = { material: bonusMat, forgeCount: 0 };
    let remainingSP = spForTraits;
    const appliedTraits = [];
    if (availTraits.length > 0 && remainingSP > 0) {
      const shuffled = [...availTraits].sort(() => Math.random() - 0.5);
      let idx = 0;
      let skipped = 0;
      while (remainingSP > 0 && skipped < shuffled.length) {
        const trait = shuffled[idx % shuffled.length];
        idx++;
        if (trait.schmiedepunktKosten > remainingSP) {
          skipped++;
          continue;
        }
        const existing = appliedTraits.find((t) => t.trait.id === trait.id);
        if (existing && existing.level < trait.maxLevel) {
          existing.level++;
          remainingSP -= trait.schmiedepunktKosten;
          skipped = 0;
        } else if (!existing) {
          appliedTraits.push({ trait, level: 1 });
          remainingSP -= trait.schmiedepunktKosten;
          skipped = 0;
        } else {
          skipped++;
        }
      }
    }
    const primarySlot = { entries: [primaryEntry] };
    const secondarySlot = { entries: [secondaryEntry] };
    const bonusSlot = { entries: [bonusEntry] };
    const pri = this.aggregateSlot(primarySlot);
    const secRaw = this.aggregateSlot(secondarySlot);
    const sec = secRaw ? __spreadProps(__spreadValues({}, secRaw), {
      haltbarkeit: Math.floor(secRaw.haltbarkeit / 2),
      effektivitaet: Math.floor(secRaw.effektivitaet / 2),
      weight: secRaw.weight / 2
    }) : null;
    const bon = this.aggregateSlot(bonusSlot);
    const finalHaltbarkeit = Math.round(((pri?.haltbarkeit ?? 0) + (sec?.haltbarkeit ?? 0)) * sizeMult);
    const finalEffektivitaet = Math.round(((pri?.effektivitaet ?? 0) + (sec?.effektivitaet ?? 0)) * sizeMult);
    const finalWeight = Math.round(((pri?.weight ?? 0) + (sec?.weight ?? 0)) * sizeMult * 10) / 10;
    const finalStatRequirement = (pri?.statRequirement ?? 0) + (secRaw?.statRequirement ?? 0);
    const spentSP = spBudget - remainingSP;
    const totalCost = materialGoldCost + spentSP * params.costPerSP;
    const allExtraEffects = [];
    for (const preview of [pri, sec, bon]) {
      if (!preview?.extraEffect)
        continue;
      for (const eff of preview.extraEffect.split(",").map((s) => s.trim()).filter(Boolean)) {
        if (!allExtraEffects.includes(eff))
          allExtraEffects.push(eff);
      }
    }
    const allTraitEffects = appliedTraits.map((t) => formatTraitEffect(t.trait, t.level));
    return {
      weaponType,
      weaponSize,
      primarySlot,
      secondarySlot,
      bonusSlot,
      appliedTraits,
      spentSP,
      maxSP: spBudget,
      totalCost,
      finalHaltbarkeit,
      finalEffektivitaet,
      finalWeight,
      finalStatRequirement,
      allExtraEffects,
      allTraitEffects
    };
  }
  /**
   * Aggregates the stats of all entries in a slot.
   * Delegates per-entry computation to computeForgedStats from forging.model.ts.
   */
  aggregateSlot(slot) {
    if (slot.entries.length === 0)
      return null;
    let h = 0, e = 0, w = 0, req = 0;
    const effectParts = [];
    const seenMats = /* @__PURE__ */ new Set();
    const stackCounts = /* @__PURE__ */ new Map();
    for (const entry of slot.entries) {
      stackCounts.set(entry.material.id, (stackCounts.get(entry.material.id) ?? 0) + 1);
    }
    for (const entry of slot.entries) {
      const preview = computeForgedStats(entry.material, entry.forgeCount, true);
      if (!preview)
        continue;
      h += preview.haltbarkeit;
      e += preview.effektivitaet;
      w += preview.weight;
      req += preview.statRequirement;
      if (!seenMats.has(entry.material.id)) {
        seenMats.add(entry.material.id);
        const mat = entry.material;
        const count = stackCounts.get(mat.id) ?? 1;
        if (mat.stackable && mat.stackLevels && mat.stackLevels.length > 0) {
          const idx = Math.min(count - 1, mat.stackLevels.length - 1);
          if (mat.stackLevels[idx])
            effectParts.push(mat.stackLevels[idx]);
        } else if (preview.extraEffect) {
          effectParts.push(preview.extraEffect);
        }
      }
    }
    return { haltbarkeit: h, effektivitaet: e, weight: w, extraEffect: effectParts.join(", "), statRequirement: req };
  }
  /**
   * Forge a material entry as many times as possible within spBudget.
   * Uses totalForgeSPSpent from forging.model.ts to track SP cost.
   */
  forgeMaterial(entry, spBudget) {
    while (totalForgeSPSpent(entry.forgeCount + 1) <= spBudget) {
      entry.forgeCount++;
    }
  }
  applyFilters(items, filters) {
    const hasWhitelist = Object.values(filters).some((v) => v === "whitelist");
    return items.filter((item) => {
      const state = filters[item.id] ?? "neutral";
      if (state === "blacklist")
        return false;
      if (hasWhitelist && state !== "whitelist")
        return false;
      return true;
    });
  }
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  /** Build a complete ItemBlock from a generated weapon result. */
  buildItem(result, itemName) {
    const item = new ItemBlock();
    item.id = `forged_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    item.name = itemName.trim() || result.weaponType.name;
    item.itemType = "weapon";
    item.armorType = "weapon";
    item.weaponTypeName = result.weaponType.name;
    item.damageType = result.weaponType.damageType;
    item.range = result.weaponType.range;
    item.weight = result.finalWeight;
    item.hasDurability = true;
    item.durability = result.finalHaltbarkeit;
    item.maxDurability = result.finalHaltbarkeit;
    item.efficiency = result.finalEffektivitaet;
    item.lost = false;
    item.broken = false;
    item.isIdentified = true;
    item.requirements = {};
    if (result.finalStatRequirement > 0) {
      item.requirements = { strength: result.finalStatRequirement };
    }
    item.primaryEffect = result.allExtraEffects.join(" | ") || void 0;
    item.secondaryEffect = result.allTraitEffects.join("\n") || void 0;
    const sizeLabel = { LIGHT: "Leicht", MEDIUM: "Mittel", HEAVY: "Schwer" }[result.weaponSize];
    const entryLabel = (entry) => `${entry.material.name}${entry.forgeCount > 0 ? ` (+${entry.forgeCount}\xD7)` : ""}`;
    const lines = [
      `Typ: ${result.weaponType.name}  \xB7  ${result.weaponType.damageType}  \xB7  ${result.weaponType.range}`,
      `Gr\xF6\xDFe: ${sizeLabel}`
    ];
    if (result.primarySlot.entries.length > 0) {
      lines.push(`Prim\xE4r: ${result.primarySlot.entries.map(entryLabel).join(", ")}`);
    }
    if (result.secondarySlot.entries.length > 0) {
      lines.push(`Sekund\xE4r: ${result.secondarySlot.entries.map(entryLabel).join(", ")}`);
    }
    if (result.bonusSlot.entries.length > 0) {
      lines.push(`Zusatz: ${result.bonusSlot.entries.map(entryLabel).join(", ")}`);
    }
    item.description = lines.join("\n");
    return item;
  }
  static \u0275fac = function WeaponGeneratorService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WeaponGeneratorService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _WeaponGeneratorService, factory: _WeaponGeneratorService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WeaponGeneratorService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/shared/weapon-generator/weapon-generator.component.ts
var _forTrack02 = ($index, $item) => $item.name;
var _forTrack1 = ($index, $item) => $item.id;
var _forTrack2 = ($index, $item) => $item.trait.id;
function WeaponGeneratorComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5);
    \u0275\u0275text(1, "Lade Bibliotheksdaten\u2026");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_For_33_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 38);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const wt_r3 = ctx.$implicit;
    \u0275\u0275property("value", wt_r3.name);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3("", wt_r3.name, " (", wt_r3.damageType, ", ", wt_r3.range, ")");
  }
}
function WeaponGeneratorComponent_Conditional_9_For_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "optgroup", 21);
    \u0275\u0275repeaterCreate(1, WeaponGeneratorComponent_Conditional_9_For_33_For_2_Template, 2, 4, "option", 38, _forTrack02);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const cat_r4 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275property("label", ctx_r1.categoryLabels[cat_r4]);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.getWeaponTypesForCategory(cat_r4));
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_49_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.whitelistedMaterialCount);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_50_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 28);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2013", ctx_r1.blacklistedMaterialCount);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_53_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("+", ctx_r1.whitelistedTraitCount);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_54_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 28);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u2013", ctx_r1.blacklistedTraitCount);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_57_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 39);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Conditional_57_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.resetFilters());
    });
    \u0275\u0275text(1, "\u2715 Filter");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_58_For_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 49);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Conditional_58_For_13_Template_button_click_0_listener() {
      const mat_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.cycleMatFilter(mat_r8.id));
    });
    \u0275\u0275elementStart(1, "span", 50);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const mat_r8 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("wg-state-whitelist", ctx_r1.getMatFilter(mat_r8.id) === "whitelist")("wg-state-blacklist", ctx_r1.getMatFilter(mat_r8.id) === "blacklist");
    \u0275\u0275property("title", mat_r8.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getMatFilter(mat_r8.id) === "whitelist" ? "\u25C9" : ctx_r1.getMatFilter(mat_r8.id) === "blacklist" ? "\u2297" : "\u25C8");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", mat_r8.name, " ");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_58_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 48);
    \u0275\u0275text(1, "Keine Materialien gefunden.");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_58_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "div", 40)(2, "span", 41);
    \u0275\u0275text(3, "\u25C8 Neutral");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 42);
    \u0275\u0275text(5, "\u25C9 Nur diese");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 43);
    \u0275\u0275text(7, "\u2297 Ausschlie\xDFen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 44);
    \u0275\u0275text(9, "(Klicken zum Wechseln)");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Conditional_58_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r6);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.matFilterSearch, $event) || (ctx_r1.matFilterSearch = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 46);
    \u0275\u0275repeaterCreate(12, WeaponGeneratorComponent_Conditional_9_Conditional_58_For_13_Template, 4, 7, "button", 47, _forTrack1);
    \u0275\u0275conditionalCreate(14, WeaponGeneratorComponent_Conditional_9_Conditional_58_Conditional_14_Template, 2, 0, "span", 48);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.matFilterSearch);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.filteredMaterials);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredMaterials.length === 0 ? 14 : -1);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_59_For_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 49);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Conditional_59_For_13_Template_button_click_0_listener() {
      const trait_r11 = \u0275\u0275restoreView(_r10).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r1.cycleTraitFilter(trait_r11.id));
    });
    \u0275\u0275elementStart(1, "span", 50);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const trait_r11 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("wg-state-whitelist", ctx_r1.getTraitFilter(trait_r11.id) === "whitelist")("wg-state-blacklist", ctx_r1.getTraitFilter(trait_r11.id) === "blacklist");
    \u0275\u0275property("title", trait_r11.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.getTraitFilter(trait_r11.id) === "whitelist" ? "\u25C9" : ctx_r1.getTraitFilter(trait_r11.id) === "blacklist" ? "\u2297" : "\u25C8");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", trait_r11.name, " ");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_59_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 48);
    \u0275\u0275text(1, "Keine Merkmale gefunden.");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_59_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "div", 40)(2, "span", 41);
    \u0275\u0275text(3, "\u25C8 Neutral");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span", 42);
    \u0275\u0275text(5, "\u25C9 Nur diese");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 43);
    \u0275\u0275text(7, "\u2297 Ausschlie\xDFen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 44);
    \u0275\u0275text(9, "(Klicken zum Wechseln)");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "input", 45);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Conditional_59_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r9);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.traitFilterSearch, $event) || (ctx_r1.traitFilterSearch = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 46);
    \u0275\u0275repeaterCreate(12, WeaponGeneratorComponent_Conditional_9_Conditional_59_For_13_Template, 4, 7, "button", 47, _forTrack1);
    \u0275\u0275conditionalCreate(14, WeaponGeneratorComponent_Conditional_9_Conditional_59_Conditional_14_Template, 2, 0, "span", 48);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(10);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.traitFilterSearch);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.filteredTraits);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.filteredTraits.length === 0 ? 14 : -1);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_60_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 31)(1, "label", 7)(2, "span");
    \u0275\u0275text(3, "Min \u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 51);
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Conditional_60_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.params.minHaltbarkeit = $event || null;
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "label", 7)(6, "span");
    \u0275\u0275text(7, "Min \u2694");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 51);
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Conditional_60_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.params.minEffektivitaet = $event || null;
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "label", 7)(10, "span");
    \u0275\u0275text(11, "Max \u2696 (kg)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 52);
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Conditional_60_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r12);
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.params.maxWeight = $event || null;
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", ctx_r1.params.minHaltbarkeit);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", ctx_r1.params.minEffektivitaet);
    \u0275\u0275advance(4);
    \u0275\u0275property("ngModel", ctx_r1.params.maxWeight);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_65_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275textInterpolate1(" Min: ", ctx_r1.params.minBudget, " GP \xB7 ");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_65_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275textInterpolate2(" Max: ", ctx_r1.params.budget, " GP \xF7 ", ctx_r1.params.costPerSP, " GP/SP ");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_65_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 33);
    \u0275\u0275text(1, "( ");
    \u0275\u0275conditionalCreate(2, WeaponGeneratorComponent_Conditional_9_Conditional_65_Conditional_2_Template, 1, 1);
    \u0275\u0275conditionalCreate(3, WeaponGeneratorComponent_Conditional_9_Conditional_65_Conditional_3_Template, 1, 2);
    \u0275\u0275text(4, " )");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.params.minBudget > 0 ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.params.budget > 0 ? 3 : -1);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_67_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Generiere\u2026 ");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_68_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u{1F3B2} Neu w\xFCrfeln ");
    \u0275\u0275elementStart(1, "span", 53);
    \u0275\u0275text(2, "[R]");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_69_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 35);
    \u0275\u0275text(1, "Keine Waffenmaterialien in Bibliotheken gefunden.");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_70_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 36);
    \u0275\u0275text(1, " Keine g\xFCltige Waffe gefunden. Bitte Einschr\xE4nkungen lockern oder Filter anpassen. ");
    \u0275\u0275elementEnd();
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 59)(1, "span", 60);
    \u0275\u0275text(2, "Anf");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r1.result.finalStatRequirement);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62)(1, "span", 69);
    \u0275\u0275text(2, "Prim\xE4r");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.slotLabel(ctx_r1.result.primarySlot));
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62)(1, "span", 69);
    \u0275\u0275text(2, "Sekund\xE4r");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.slotLabel(ctx_r1.result.secondarySlot));
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 62)(1, "span", 69);
    \u0275\u0275text(2, "Zusatz");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.slotLabel(ctx_r1.result.bonusSlot));
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_28_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const t_r14 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275textInterpolate1(" Lv.", t_r14.level);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_28_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 70);
    \u0275\u0275text(1);
    \u0275\u0275conditionalCreate(2, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_28_For_2_Conditional_2_Template, 1, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r14 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(t_r14.trait.name);
    \u0275\u0275advance();
    \u0275\u0275conditional(t_r14.level > 1 ? 2 : -1);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 63);
    \u0275\u0275repeaterCreate(1, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_28_For_2_Template, 3, 2, "span", 70, _forTrack2);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r1.result.appliedTraits);
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 64)(1, "span", 71);
    \u0275\u0275text(2, "Effekte:");
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" ", ctx_r1.result.allExtraEffects.join(" \xB7 "), " ");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Kosten: ");
    \u0275\u0275elementStart(2, "strong");
    \u0275\u0275text(3);
    \u0275\u0275pipe(4, "number");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("", \u0275\u0275pipeBind2(4, 1, ctx_r1.result.totalCost, "1.0-0"), " GP");
  }
}
function WeaponGeneratorComponent_Conditional_9_Conditional_71_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 37)(1, "div", 54)(2, "span", 55);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "span");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span", 56);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 57);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "div", 58)(11, "span", 59)(12, "span", 60);
    \u0275\u0275text(13, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275text(14);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span", 59)(16, "span", 60);
    \u0275\u0275text(17, "\u2694");
    \u0275\u0275elementEnd();
    \u0275\u0275text(18);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "span", 59)(20, "span", 60);
    \u0275\u0275text(21, "\u2696");
    \u0275\u0275elementEnd();
    \u0275\u0275text(22);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(23, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_23_Template, 4, 1, "span", 59);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "div", 61);
    \u0275\u0275conditionalCreate(25, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_25_Template, 5, 1, "div", 62);
    \u0275\u0275conditionalCreate(26, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_26_Template, 5, 1, "div", 62);
    \u0275\u0275conditionalCreate(27, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_27_Template, 5, 1, "div", 62);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(28, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_28_Template, 3, 0, "div", 63);
    \u0275\u0275conditionalCreate(29, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_29_Template, 4, 1, "div", 64);
    \u0275\u0275elementStart(30, "div", 65)(31, "span");
    \u0275\u0275text(32, "SP: ");
    \u0275\u0275elementStart(33, "strong");
    \u0275\u0275text(34);
    \u0275\u0275elementEnd();
    \u0275\u0275text(35);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(36, WeaponGeneratorComponent_Conditional_9_Conditional_71_Conditional_36_Template, 5, 4, "span");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "div", 66)(38, "input", 67);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Conditional_71_Template_input_ngModelChange_38_listener($event) {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r1.resultName, $event) || (ctx_r1.resultName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keyup.enter", function WeaponGeneratorComponent_Conditional_9_Conditional_71_Template_input_keyup_enter_38_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.confirmItem());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "button", 68);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Conditional_71_Template_button_click_39_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.confirmItem());
    });
    \u0275\u0275text(40, " + In Bibliothek ");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r1.result.weaponType.name);
    \u0275\u0275advance();
    \u0275\u0275classMap(\u0275\u0275interpolate1("wg-damage-badge wg-damage-", ctx_r1.result.weaponType.damageType.toLowerCase()));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.result.weaponType.damageType, " ");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.resultSizeBadge);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.result.weaponType.range);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", ctx_r1.result.finalHaltbarkeit);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r1.result.finalEffektivitaet);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1(" ", ctx_r1.result.finalWeight, " kg");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.result.finalStatRequirement > 0 ? 23 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.result.primarySlot.entries.length > 0 ? 25 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.result.secondarySlot.entries.length > 0 ? 26 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.result.bonusSlot.entries.length > 0 ? 27 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.result.appliedTraits.length > 0 ? 28 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.result.allExtraEffects.length > 0 ? 29 : -1);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r1.result.spentSP);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" / ", ctx_r1.result.maxSP);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.params.costPerSP > 0 ? 36 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.resultName);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.resultName.trim());
  }
}
function WeaponGeneratorComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 6)(1, "label", 7)(2, "span");
    \u0275\u0275text(3, "SP");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 8);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.maxSP, $event) || (ctx_r1.params.maxSP = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_4_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "label", 7)(6, "span");
    \u0275\u0275text(7, "GP/SP");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 9);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.costPerSP, $event) || (ctx_r1.params.costPerSP = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_8_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "label", 7)(10, "span");
    \u0275\u0275text(11, "Min. Budget (GP)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 10);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.minBudget, $event) || (ctx_r1.params.minBudget = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_12_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "label", 7)(14, "span");
    \u0275\u0275text(15, "Max. Budget (GP)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "input", 11);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_16_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.budget, $event) || (ctx_r1.params.budget = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_16_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(17, "div", 12)(18, "span", 13);
    \u0275\u0275text(19, "Schmieden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "input", 14);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_20_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.forgingRatio, $event) || (ctx_r1.params.forgingRatio = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_input_ngModelChange_20_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "span", 15);
    \u0275\u0275text(22, "Eigenschaften");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "span", 16);
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "div", 17)(26, "label", 18)(27, "span");
    \u0275\u0275text(28, "Waffentyp");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "select", 19);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_select_ngModelChange_29_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.weaponTypeName, $event) || (ctx_r1.params.weaponTypeName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_select_ngModelChange_29_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementStart(30, "option", 20);
    \u0275\u0275text(31, "Zuf\xE4llig");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(32, WeaponGeneratorComponent_Conditional_9_For_33_Template, 3, 1, "optgroup", 21, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "label", 7)(35, "span");
    \u0275\u0275text(36, "Waffengr\xF6\xDFe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "select", 19);
    \u0275\u0275twoWayListener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_select_ngModelChange_37_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.params.weaponSize, $event) || (ctx_r1.params.weaponSize = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function WeaponGeneratorComponent_Conditional_9_Template_select_ngModelChange_37_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.saveToStorage());
    });
    \u0275\u0275elementStart(38, "option", 20);
    \u0275\u0275text(39, "Zuf\xE4llig");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "option", 22);
    \u0275\u0275text(41, "Leicht (\xD70.8)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(42, "option", 23);
    \u0275\u0275text(43, "Mittel (\xD71.0)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(44, "option", 24);
    \u0275\u0275text(45, "Schwer (\xD71.2)");
    \u0275\u0275elementEnd()()()();
    \u0275\u0275elementStart(46, "div", 25)(47, "button", 26);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Template_button_click_47_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.showMaterialFilters = !ctx_r1.showMaterialFilters);
    });
    \u0275\u0275text(48, " Materialien ");
    \u0275\u0275conditionalCreate(49, WeaponGeneratorComponent_Conditional_9_Conditional_49_Template, 2, 1, "span", 27);
    \u0275\u0275conditionalCreate(50, WeaponGeneratorComponent_Conditional_9_Conditional_50_Template, 2, 1, "span", 28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(51, "button", 26);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Template_button_click_51_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.showTraitFilters = !ctx_r1.showTraitFilters);
    });
    \u0275\u0275text(52, " Merkmale ");
    \u0275\u0275conditionalCreate(53, WeaponGeneratorComponent_Conditional_9_Conditional_53_Template, 2, 1, "span", 27);
    \u0275\u0275conditionalCreate(54, WeaponGeneratorComponent_Conditional_9_Conditional_54_Template, 2, 1, "span", 28);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(55, "button", 26);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Template_button_click_55_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.showMetricFilters = !ctx_r1.showMetricFilters);
    });
    \u0275\u0275text(56, " Einschr\xE4nkungen ");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(57, WeaponGeneratorComponent_Conditional_9_Conditional_57_Template, 2, 0, "button", 29);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(58, WeaponGeneratorComponent_Conditional_9_Conditional_58_Template, 15, 2, "div", 30);
    \u0275\u0275conditionalCreate(59, WeaponGeneratorComponent_Conditional_9_Conditional_59_Template, 15, 2, "div", 30);
    \u0275\u0275conditionalCreate(60, WeaponGeneratorComponent_Conditional_9_Conditional_60_Template, 13, 3, "div", 31);
    \u0275\u0275elementStart(61, "div", 32);
    \u0275\u0275text(62, " Effektives SP-Budget: ");
    \u0275\u0275elementStart(63, "strong");
    \u0275\u0275text(64);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(65, WeaponGeneratorComponent_Conditional_9_Conditional_65_Template, 5, 2, "span", 33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(66, "button", 34);
    \u0275\u0275listener("click", function WeaponGeneratorComponent_Conditional_9_Template_button_click_66_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.reroll());
    });
    \u0275\u0275conditionalCreate(67, WeaponGeneratorComponent_Conditional_9_Conditional_67_Template, 1, 0)(68, WeaponGeneratorComponent_Conditional_9_Conditional_68_Template, 3, 0);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(69, WeaponGeneratorComponent_Conditional_9_Conditional_69_Template, 2, 0, "div", 35);
    \u0275\u0275conditionalCreate(70, WeaponGeneratorComponent_Conditional_9_Conditional_70_Template, 2, 0, "div", 36);
    \u0275\u0275conditionalCreate(71, WeaponGeneratorComponent_Conditional_9_Conditional_71_Template, 41, 21, "div", 37);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.maxSP);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.costPerSP);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.minBudget);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.budget);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.forgingRatio);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx_r1.params.forgingRatio, "% / ", 100 - ctx_r1.params.forgingRatio, "%");
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.weaponTypeName);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", null);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r1.weaponCategories);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.params.weaponSize);
    \u0275\u0275advance();
    \u0275\u0275property("ngValue", null);
    \u0275\u0275advance(9);
    \u0275\u0275classProp("wg-toggle-active", ctx_r1.showMaterialFilters);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.whitelistedMaterialCount > 0 ? 49 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.blacklistedMaterialCount > 0 ? 50 : -1);
    \u0275\u0275advance();
    \u0275\u0275classProp("wg-toggle-active", ctx_r1.showTraitFilters);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.whitelistedTraitCount > 0 ? 53 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.blacklistedTraitCount > 0 ? 54 : -1);
    \u0275\u0275advance();
    \u0275\u0275classProp("wg-toggle-active", ctx_r1.showMetricFilters);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.activeFilterCount > 0 ? 57 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showMaterialFilters ? 58 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showTraitFilters ? 59 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.showMetricFilters ? 60 : -1);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r1.effectiveSPBudget);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.params.costPerSP > 0 && (ctx_r1.params.minBudget > 0 || ctx_r1.params.budget > 0) ? 65 : -1);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r1.isGenerating || ctx_r1.allMaterials.length === 0);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.isGenerating ? 67 : 68);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r1.allMaterials.length === 0 && !ctx_r1.isLoading ? 69 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.noResultFound ? 70 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r1.result ? 71 : -1);
  }
}
var LS_PARAMS_KEY = "wg_params";
var LS_MAT_FILTERS_KEY = "wg_mat_filters";
var LS_TRAIT_FILTERS_KEY = "wg_trait_filters";
var defaultParams = () => ({
  maxSP: 100,
  costPerSP: 5,
  minBudget: 0,
  budget: 0,
  forgingRatio: 50,
  weaponTypeName: null,
  weaponSize: null,
  minHaltbarkeit: null,
  minEffektivitaet: null,
  maxWeight: null
});
var WeaponGeneratorComponent = class _WeaponGeneratorComponent {
  itemCreated = new EventEmitter();
  closePanel = new EventEmitter();
  api = inject(AssetBrowserApiService);
  svc = inject(WeaponGeneratorService);
  cdr = inject(ChangeDetectorRef);
  // ── Library data ─────────────────────────────────────────────────────────
  allMaterials = [];
  allTraits = [];
  isLoading = false;
  // ── Params ────────────────────────────────────────────────────────────────
  params = defaultParams();
  // ── Filters ───────────────────────────────────────────────────────────────
  materialFilters = {};
  traitFilters = {};
  // ── UI state ──────────────────────────────────────────────────────────────
  showMaterialFilters = false;
  showTraitFilters = false;
  showMetricFilters = false;
  matFilterSearch = "";
  traitFilterSearch = "";
  // ── Result ────────────────────────────────────────────────────────────────
  result = null;
  resultName = "";
  noResultFound = false;
  isGenerating = false;
  // ── Weapon type helpers ───────────────────────────────────────────────────
  weaponTypes = WEAPON_TYPES;
  weaponCategories = ["LEICHT", "FERNKAMPF", "SCHWER"];
  categoryLabels = {
    LEICHT: "Leicht",
    FERNKAMPF: "Fernkampf",
    SCHWER: "Schwer"
  };
  sizeLabels = { LIGHT: "Leicht (\xD70.8)", MEDIUM: "Mittel (\xD71.0)", HEAVY: "Schwer (\xD71.2)" };
  // ── Lifecycle ─────────────────────────────────────────────────────────────
  async ngOnInit() {
    this.loadFromStorage();
    await this.loadLibraryData();
  }
  ngOnDestroy() {
    this.saveToStorage();
  }
  onKey(e) {
    if (e.key === "r" || e.key === "R") {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select")
        return;
      e.preventDefault();
      this.reroll();
    }
  }
  loadFromStorage() {
    try {
      const p = localStorage.getItem(LS_PARAMS_KEY);
      if (p)
        this.params = __spreadValues(__spreadValues({}, defaultParams()), JSON.parse(p));
      const mf = localStorage.getItem(LS_MAT_FILTERS_KEY);
      if (mf)
        this.materialFilters = JSON.parse(mf);
      const tf = localStorage.getItem(LS_TRAIT_FILTERS_KEY);
      if (tf)
        this.traitFilters = JSON.parse(tf);
    } catch {
    }
  }
  saveToStorage() {
    try {
      localStorage.setItem(LS_PARAMS_KEY, JSON.stringify(this.params));
      localStorage.setItem(LS_MAT_FILTERS_KEY, JSON.stringify(this.materialFilters));
      localStorage.setItem(LS_TRAIT_FILTERS_KEY, JSON.stringify(this.traitFilters));
    } catch {
    }
  }
  async loadLibraryData() {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const matFiles = [];
      const traitFiles = [];
      for (const lib of libraries) {
        const [mats, traits] = await Promise.all([
          firstValueFrom(this.api.searchFiles(lib.id, "", ["material"])),
          firstValueFrom(this.api.searchFiles(lib.id, "", ["forge-trait"]))
        ]);
        matFiles.push(...mats);
        traitFiles.push(...traits);
      }
      this.allMaterials = matFiles.map((f) => f.data);
      this.allTraits = traitFiles.map((f) => f.data);
    } catch (e) {
      console.error("Waffengenerator: Fehler beim Laden", e);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
  // ── Generation ────────────────────────────────────────────────────────────
  reroll() {
    this.saveToStorage();
    this.isGenerating = true;
    this.noResultFound = false;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.result = this.svc.generate(this.params, this.allMaterials, this.allTraits, this.materialFilters, this.traitFilters);
      this.noResultFound = this.result === null;
      if (this.result && !this.resultName) {
        this.resultName = this.result.weaponType.name;
      }
      this.isGenerating = false;
      this.cdr.markForCheck();
    }, 10);
  }
  confirmItem() {
    if (!this.result)
      return;
    const item = this.svc.buildItem(this.result, this.resultName);
    this.itemCreated.emit(item);
    this.result = null;
    this.resultName = "";
    this.cdr.markForCheck();
  }
  // ── Filter helpers ────────────────────────────────────────────────────────
  getMatFilter(id) {
    return this.materialFilters[id] ?? "neutral";
  }
  cycleMatFilter(id) {
    const cur = this.getMatFilter(id);
    if (cur === "neutral")
      this.materialFilters[id] = "whitelist";
    else if (cur === "whitelist")
      this.materialFilters[id] = "blacklist";
    else
      delete this.materialFilters[id];
    this.saveToStorage();
    this.cdr.markForCheck();
  }
  getTraitFilter(id) {
    return this.traitFilters[id] ?? "neutral";
  }
  cycleTraitFilter(id) {
    const cur = this.getTraitFilter(id);
    if (cur === "neutral")
      this.traitFilters[id] = "whitelist";
    else if (cur === "whitelist")
      this.traitFilters[id] = "blacklist";
    else
      delete this.traitFilters[id];
    this.saveToStorage();
    this.cdr.markForCheck();
  }
  resetFilters() {
    this.materialFilters = {};
    this.traitFilters = {};
    this.saveToStorage();
    this.cdr.markForCheck();
  }
  resetParams() {
    this.params = defaultParams();
    this.saveToStorage();
    this.cdr.markForCheck();
  }
  get filteredMaterials() {
    const q = this.matFilterSearch.toLowerCase();
    return q ? this.allMaterials.filter((m) => m.name.toLowerCase().includes(q)) : this.allMaterials;
  }
  get filteredTraits() {
    const q = this.traitFilterSearch.toLowerCase();
    return q ? this.allTraits.filter((t) => t.name.toLowerCase().includes(q)) : this.allTraits;
  }
  get whitelistedMaterialCount() {
    return Object.values(this.materialFilters).filter((v) => v === "whitelist").length;
  }
  get blacklistedMaterialCount() {
    return Object.values(this.materialFilters).filter((v) => v === "blacklist").length;
  }
  get whitelistedTraitCount() {
    return Object.values(this.traitFilters).filter((v) => v === "whitelist").length;
  }
  get blacklistedTraitCount() {
    return Object.values(this.traitFilters).filter((v) => v === "blacklist").length;
  }
  get activeFilterCount() {
    return Object.values(this.materialFilters).filter((v) => v !== "neutral").length + Object.values(this.traitFilters).filter((v) => v !== "neutral").length;
  }
  // ── Display helpers ───────────────────────────────────────────────────────
  entryLabel(entry) {
    return entry.forgeCount > 0 ? `${entry.material.name} +${entry.forgeCount}\xD7` : entry.material.name;
  }
  slotLabel(slot) {
    return slot.entries.map((e) => this.entryLabel(e)).join(", ");
  }
  getWeaponTypesForCategory(cat) {
    return WEAPON_TYPES.filter((w) => w.category === cat);
  }
  get effectiveSPBudget() {
    if (this.params.budget > 0 && this.params.costPerSP > 0) {
      return Math.min(this.params.maxSP, Math.floor(this.params.budget / this.params.costPerSP));
    }
    return this.params.maxSP;
  }
  get resultSizeBadge() {
    if (!this.result)
      return "";
    return { LIGHT: "Leicht", MEDIUM: "Mittel", HEAVY: "Schwer" }[this.result.weaponSize];
  }
  static \u0275fac = function WeaponGeneratorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WeaponGeneratorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _WeaponGeneratorComponent, selectors: [["app-weapon-generator"]], hostBindings: function WeaponGeneratorComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown", function WeaponGeneratorComponent_keydown_HostBindingHandler($event) {
        return ctx.onKey($event);
      }, \u0275\u0275resolveDocument);
    }
  }, outputs: { itemCreated: "itemCreated", closePanel: "closePanel" }, decls: 10, vars: 1, consts: [[1, "wg-panel"], [1, "wg-header"], [1, "wg-title"], [1, "wg-hint"], ["title", "Schlie\xDFen", 1, "wg-close-btn", 3, "click"], [1, "wg-loading"], [1, "wg-config-grid"], [1, "wg-field"], ["type", "number", "min", "1", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "placeholder", "0=\u2013", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "placeholder", "0=\u221E", 3, "ngModelChange", "ngModel"], [1, "wg-ratio-row"], [1, "wg-ratio-label"], ["type", "range", "min", "0", "max", "100", "step", "5", 1, "wg-ratio-slider", 3, "ngModelChange", "ngModel"], [1, "wg-ratio-label", "wg-ratio-label-right"], [1, "wg-ratio-value"], [1, "wg-type-row"], [1, "wg-field", "wg-field-grow"], [3, "ngModelChange", "ngModel"], [3, "ngValue"], [3, "label"], ["value", "LIGHT"], ["value", "MEDIUM"], ["value", "HEAVY"], [1, "wg-filter-toggles"], [1, "wg-toggle-btn", 3, "click"], [1, "wg-badge", "wg-badge-white"], [1, "wg-badge", "wg-badge-black"], ["title", "Alle Filter zur\xFCcksetzen", 1, "wg-reset-btn"], [1, "wg-filter-panel"], [1, "wg-metric-grid"], [1, "wg-budget-info"], [1, "wg-muted"], [1, "wg-reroll-btn", 3, "click", "disabled"], [1, "wg-warn"], [1, "wg-no-result"], [1, "wg-result"], [3, "value"], ["title", "Alle Filter zur\xFCcksetzen", 1, "wg-reset-btn", 3, "click"], [1, "wg-filter-legend"], [1, "wg-legend-item", "wg-state-neutral"], [1, "wg-legend-item", "wg-state-whitelist"], [1, "wg-legend-item", "wg-state-blacklist"], [1, "wg-legend-hint"], ["type", "text", "placeholder", "Suche\u2026", 1, "wg-filter-search", 3, "ngModelChange", "ngModel"], [1, "wg-filter-chips"], [1, "wg-filter-chip", 3, "wg-state-whitelist", "wg-state-blacklist", "title"], [1, "wg-empty"], [1, "wg-filter-chip", 3, "click", "title"], [1, "wg-chip-icon"], ["type", "number", "min", "0", "placeholder", "\u2013", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "step", "0.1", "placeholder", "\u2013", 3, "ngModelChange", "ngModel"], [1, "wg-key-hint"], [1, "wg-result-header"], [1, "wg-result-type"], [1, "wg-size-badge"], [1, "wg-range-badge"], [1, "wg-result-stats"], [1, "wg-stat"], [1, "wg-stat-icon"], [1, "wg-result-slots"], [1, "wg-slot-row"], [1, "wg-result-traits"], [1, "wg-result-effects"], [1, "wg-result-cost"], [1, "wg-result-save"], ["type", "text", "placeholder", "Item-Name\u2026", 1, "wg-name-input", 3, "ngModelChange", "keyup.enter", "ngModel"], [1, "wg-confirm-btn", 3, "click", "disabled"], [1, "wg-slot-label"], [1, "wg-trait-chip"], [1, "wg-effects-label"]], template: function WeaponGeneratorComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "span", 2);
      \u0275\u0275text(3, "\u2697 Waffengenerator");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "span", 3);
      \u0275\u0275text(5, "R = Neu w\xFCrfeln");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "button", 4);
      \u0275\u0275listener("click", function WeaponGeneratorComponent_Template_button_click_6_listener() {
        return ctx.closePanel.emit();
      });
      \u0275\u0275text(7, "\u2715");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(8, WeaponGeneratorComponent_Conditional_8_Template, 2, 0, "div", 5)(9, WeaponGeneratorComponent_Conditional_9_Template, 72, 32);
      \u0275\u0275elementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance(8);
      \u0275\u0275conditional(ctx.isLoading ? 8 : 9);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, RangeValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel, DecimalPipe], styles: ["\n\n.wg-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  width: 380px;\n  min-width: 340px;\n  max-width: 420px;\n  background: var(--card, #2d3748);\n  border-left: 1px solid var(--border, #4a5568);\n  padding: 14px;\n  overflow-y: auto;\n  height: 100%;\n  box-sizing: border-box;\n}\n.wg-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  padding-bottom: 10px;\n}\n.wg-title[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n}\n.wg-hint[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--text-muted, #9ca3af);\n}\n.wg-close-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  font-size: 14px;\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n.wg-close-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.08);\n  color: var(--text, #e5e7eb);\n}\n.wg-loading[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 13px;\n  text-align: center;\n  padding: 20px 0;\n}\n.wg-field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.wg-field[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 500;\n}\n.wg-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.wg-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 13px;\n  padding: 4px 6px;\n  width: 100%;\n  box-sizing: border-box;\n}\n.wg-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.wg-field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.wg-field-grow[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.wg-config-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr 1fr;\n  gap: 8px;\n}\n.wg-ratio-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.wg-ratio-label[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n  min-width: 70px;\n}\n.wg-ratio-label-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n.wg-ratio-slider[_ngcontent-%COMP%] {\n  flex: 1;\n  accent-color: var(--accent, #8b5cf6);\n  cursor: pointer;\n}\n.wg-ratio-value[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n  min-width: 72px;\n  text-align: right;\n}\n.wg-type-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n}\n.wg-filter-toggles[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  align-items: center;\n}\n.wg-toggle-btn[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 16px;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 3px 10px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n.wg-toggle-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text, #e5e7eb);\n}\n.wg-toggle-btn.wg-toggle-active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.wg-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  border-radius: 8px;\n  padding: 0 5px;\n  font-weight: 700;\n}\n.wg-badge-white[_ngcontent-%COMP%] {\n  background: rgba(74, 222, 128, 0.15);\n  color: #4ade80;\n}\n.wg-badge-black[_ngcontent-%COMP%] {\n  background: rgba(248, 113, 113, 0.15);\n  color: #f87171;\n}\n.wg-reset-btn[_ngcontent-%COMP%] {\n  background: rgba(248, 113, 113, 0.1);\n  border: 1px solid rgba(248, 113, 113, 0.3);\n  border-radius: 12px;\n  color: #f87171;\n  cursor: pointer;\n  font-size: 11px;\n  padding: 3px 8px;\n  margin-left: auto;\n}\n.wg-reset-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(248, 113, 113, 0.2);\n}\n.wg-filter-panel[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.wg-filter-legend[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  font-size: 11px;\n}\n.wg-legend-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 3px;\n}\n.wg-legend-hint[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 10px;\n  margin-left: auto;\n}\n.wg-filter-search[_ngcontent-%COMP%] {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 12px;\n  padding: 4px 8px;\n}\n.wg-filter-search[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.wg-filter-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  max-height: 160px;\n  overflow-y: auto;\n}\n.wg-filter-chip[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 12px;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  font-size: 11px;\n  padding: 3px 8px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  transition:\n    background 0.1s,\n    color 0.1s,\n    border-color 0.1s;\n}\n.wg-filter-chip[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text, #e5e7eb);\n}\n.wg-filter-chip.wg-state-whitelist[_ngcontent-%COMP%] {\n  background: rgba(74, 222, 128, 0.12);\n  border-color: #4ade80;\n  color: #4ade80;\n}\n.wg-filter-chip.wg-state-blacklist[_ngcontent-%COMP%] {\n  background: rgba(248, 113, 113, 0.12);\n  border-color: #f87171;\n  color: #f87171;\n  text-decoration: line-through;\n}\n.wg-chip-icon[_ngcontent-%COMP%] {\n  font-size: 10px;\n}\n.wg-state-neutral[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n}\n.wg-state-whitelist[_ngcontent-%COMP%] {\n  color: #4ade80;\n}\n.wg-state-blacklist[_ngcontent-%COMP%] {\n  color: #f87171;\n}\n.wg-empty[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 12px;\n  padding: 4px 0;\n}\n.wg-metric-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 8px;\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 10px;\n}\n.wg-budget-info[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-muted, #9ca3af);\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.wg-budget-info[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text, #e5e7eb);\n}\n.wg-muted[_ngcontent-%COMP%] {\n  opacity: 0.6;\n}\n.wg-reroll-btn[_ngcontent-%COMP%] {\n  background: var(--accent, #8b5cf6);\n  border: none;\n  border-radius: 8px;\n  color: #fff;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 700;\n  padding: 10px 16px;\n  width: 100%;\n  transition: opacity 0.15s, transform 0.1s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.wg-reroll-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  opacity: 0.88;\n  transform: translateY(-1px);\n}\n.wg-reroll-btn[_ngcontent-%COMP%]:active:not(:disabled) {\n  transform: translateY(0);\n}\n.wg-reroll-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.wg-key-hint[_ngcontent-%COMP%] {\n  font-size: 11px;\n  opacity: 0.7;\n  font-weight: 400;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 4px;\n  padding: 1px 5px;\n}\n.wg-warn[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #fbbf24;\n  background: rgba(251, 191, 36, 0.1);\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  border-radius: 6px;\n  padding: 8px 10px;\n  text-align: center;\n}\n.wg-no-result[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #f87171;\n  background: rgba(248, 113, 113, 0.08);\n  border: 1px solid rgba(248, 113, 113, 0.25);\n  border-radius: 6px;\n  padding: 8px 10px;\n  text-align: center;\n}\n.wg-result[_ngcontent-%COMP%] {\n  background: rgba(0, 0, 0, 0.25);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.wg-result-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.wg-result-type[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1 1 auto;\n}\n.wg-damage-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  font-weight: 700;\n  border-radius: 8px;\n  padding: 2px 7px;\n}\n.wg-damage-schnitt[_ngcontent-%COMP%] {\n  background: rgba(248, 113, 113, 0.15);\n  color: #f87171;\n  border: 1px solid rgba(248, 113, 113, 0.35);\n}\n.wg-damage-stich[_ngcontent-%COMP%] {\n  background: rgba(251, 191, 36, 0.15);\n  color: #fbbf24;\n  border: 1px solid rgba(251, 191, 36, 0.35);\n}\n.wg-damage-wucht[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.15);\n  color: #a78bfa;\n  border: 1px solid rgba(139, 92, 246, 0.35);\n}\n.wg-size-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  color: var(--text-muted, #9ca3af);\n  padding: 2px 7px;\n}\n.wg-range-badge[_ngcontent-%COMP%] {\n  font-size: 10px;\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 2px 7px;\n}\n.wg-result-stats[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.wg-stat[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n}\n.wg-stat-icon[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--text-muted, #9ca3af);\n}\n.wg-result-slots[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.wg-slot-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  gap: 6px;\n  font-size: 12px;\n  color: var(--text, #e5e7eb);\n}\n.wg-slot-label[_ngcontent-%COMP%] {\n  font-size: 10px;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  min-width: 52px;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.wg-result-traits[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.wg-trait-chip[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.12);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  border-radius: 10px;\n  color: #c4b5fd;\n  font-size: 11px;\n  padding: 2px 8px;\n}\n.wg-result-effects[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n}\n.wg-effects-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #93c5fd;\n  margin-right: 4px;\n  font-style: normal;\n}\n.wg-result-cost[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 16px;\n  font-size: 12px;\n  color: var(--text-muted, #9ca3af);\n  border-top: 1px solid rgba(255, 255, 255, 0.07);\n  padding-top: 6px;\n}\n.wg-result-cost[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--text, #e5e7eb);\n}\n.wg-result-save[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n}\n.wg-name-input[_ngcontent-%COMP%] {\n  flex: 1;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 13px;\n  padding: 5px 8px;\n}\n.wg-name-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.wg-confirm-btn[_ngcontent-%COMP%] {\n  background: #4ade80;\n  border: none;\n  border-radius: 6px;\n  color: #0f172a;\n  cursor: pointer;\n  font-size: 12px;\n  font-weight: 700;\n  padding: 5px 12px;\n  white-space: nowrap;\n  transition: opacity 0.15s;\n}\n.wg-confirm-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  opacity: 0.85;\n}\n.wg-confirm-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=weapon-generator.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WeaponGeneratorComponent, [{
    type: Component,
    args: [{ selector: "app-weapon-generator", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="wg-panel">\r
\r
  <!-- Header -->\r
  <div class="wg-header">\r
    <span class="wg-title">\u2697 Waffengenerator</span>\r
    <span class="wg-hint">R = Neu w\xFCrfeln</span>\r
    <button class="wg-close-btn" (click)="closePanel.emit()" title="Schlie\xDFen">\u2715</button>\r
  </div>\r
\r
  @if (isLoading) {\r
    <div class="wg-loading">Lade Bibliotheksdaten\u2026</div>\r
  } @else {\r
\r
    <!-- \u2500\u2500 Config row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="wg-config-grid">\r
      <label class="wg-field">\r
        <span>SP</span>\r
        <input type="number" min="1" [(ngModel)]="params.maxSP" (ngModelChange)="saveToStorage()" />\r
      </label>\r
      <label class="wg-field">\r
        <span>GP/SP</span>\r
        <input type="number" min="0" [(ngModel)]="params.costPerSP" (ngModelChange)="saveToStorage()" />\r
      </label>\r
      <label class="wg-field">\r
        <span>Min. Budget (GP)</span>\r
        <input type="number" min="0" [(ngModel)]="params.minBudget" (ngModelChange)="saveToStorage()" placeholder="0=\u2013" />\r
      </label>\r
      <label class="wg-field">\r
        <span>Max. Budget (GP)</span>\r
        <input type="number" min="0" [(ngModel)]="params.budget" (ngModelChange)="saveToStorage()" placeholder="0=\u221E" />\r
      </label>\r
    </div>\r
\r
    <!-- \u2500\u2500 Forging vs. Eigenschaften slider \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="wg-ratio-row">\r
      <span class="wg-ratio-label">Schmieden</span>\r
      <input\r
        type="range" min="0" max="100" step="5"\r
        [(ngModel)]="params.forgingRatio"\r
        (ngModelChange)="saveToStorage()"\r
        class="wg-ratio-slider"\r
      />\r
      <span class="wg-ratio-label wg-ratio-label-right">Eigenschaften</span>\r
      <span class="wg-ratio-value">{{ params.forgingRatio }}% / {{ 100 - params.forgingRatio }}%</span>\r
    </div>\r
\r
    <!-- \u2500\u2500 Weapon type + size row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="wg-type-row">\r
      <label class="wg-field wg-field-grow">\r
        <span>Waffentyp</span>\r
        <select [(ngModel)]="params.weaponTypeName" (ngModelChange)="saveToStorage()">\r
          <option [ngValue]="null">Zuf\xE4llig</option>\r
          @for (cat of weaponCategories; track cat) {\r
            <optgroup [label]="categoryLabels[cat]">\r
              @for (wt of getWeaponTypesForCategory(cat); track wt.name) {\r
                <option [value]="wt.name">{{ wt.name }} ({{ wt.damageType }}, {{ wt.range }})</option>\r
              }\r
            </optgroup>\r
          }\r
        </select>\r
      </label>\r
      <label class="wg-field">\r
        <span>Waffengr\xF6\xDFe</span>\r
        <select [(ngModel)]="params.weaponSize" (ngModelChange)="saveToStorage()">\r
          <option [ngValue]="null">Zuf\xE4llig</option>\r
          <option value="LIGHT">Leicht (\xD70.8)</option>\r
          <option value="MEDIUM">Mittel (\xD71.0)</option>\r
          <option value="HEAVY">Schwer (\xD71.2)</option>\r
        </select>\r
      </label>\r
    </div>\r
\r
    <!-- \u2500\u2500 Filter toggles \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="wg-filter-toggles">\r
      <button class="wg-toggle-btn" [class.wg-toggle-active]="showMaterialFilters" (click)="showMaterialFilters = !showMaterialFilters">\r
        Materialien\r
        @if (whitelistedMaterialCount > 0) { <span class="wg-badge wg-badge-white">+{{ whitelistedMaterialCount }}</span> }\r
        @if (blacklistedMaterialCount > 0) { <span class="wg-badge wg-badge-black">\u2013{{ blacklistedMaterialCount }}</span> }\r
      </button>\r
      <button class="wg-toggle-btn" [class.wg-toggle-active]="showTraitFilters" (click)="showTraitFilters = !showTraitFilters">\r
        Merkmale\r
        @if (whitelistedTraitCount > 0) { <span class="wg-badge wg-badge-white">+{{ whitelistedTraitCount }}</span> }\r
        @if (blacklistedTraitCount > 0) { <span class="wg-badge wg-badge-black">\u2013{{ blacklistedTraitCount }}</span> }\r
      </button>\r
      <button class="wg-toggle-btn" [class.wg-toggle-active]="showMetricFilters" (click)="showMetricFilters = !showMetricFilters">\r
        Einschr\xE4nkungen\r
      </button>\r
      @if (activeFilterCount > 0) {\r
        <button class="wg-reset-btn" (click)="resetFilters()" title="Alle Filter zur\xFCcksetzen">\u2715 Filter</button>\r
      }\r
    </div>\r
\r
    <!-- \u2500\u2500 Material filter panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    @if (showMaterialFilters) {\r
      <div class="wg-filter-panel">\r
        <div class="wg-filter-legend">\r
          <span class="wg-legend-item wg-state-neutral">\u25C8 Neutral</span>\r
          <span class="wg-legend-item wg-state-whitelist">\u25C9 Nur diese</span>\r
          <span class="wg-legend-item wg-state-blacklist">\u2297 Ausschlie\xDFen</span>\r
          <span class="wg-legend-hint">(Klicken zum Wechseln)</span>\r
        </div>\r
        <input class="wg-filter-search" type="text" placeholder="Suche\u2026" [(ngModel)]="matFilterSearch" />\r
        <div class="wg-filter-chips">\r
          @for (mat of filteredMaterials; track mat.id) {\r
            <button\r
              class="wg-filter-chip"\r
              [class.wg-state-whitelist]="getMatFilter(mat.id) === 'whitelist'"\r
              [class.wg-state-blacklist]="getMatFilter(mat.id) === 'blacklist'"\r
              (click)="cycleMatFilter(mat.id)"\r
              [title]="mat.name"\r
            >\r
              <span class="wg-chip-icon">{{ getMatFilter(mat.id) === 'whitelist' ? '\u25C9' : getMatFilter(mat.id) === 'blacklist' ? '\u2297' : '\u25C8' }}</span>\r
              {{ mat.name }}\r
            </button>\r
          }\r
          @if (filteredMaterials.length === 0) {\r
            <span class="wg-empty">Keine Materialien gefunden.</span>\r
          }\r
        </div>\r
      </div>\r
    }\r
\r
    <!-- \u2500\u2500 Trait filter panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    @if (showTraitFilters) {\r
      <div class="wg-filter-panel">\r
        <div class="wg-filter-legend">\r
          <span class="wg-legend-item wg-state-neutral">\u25C8 Neutral</span>\r
          <span class="wg-legend-item wg-state-whitelist">\u25C9 Nur diese</span>\r
          <span class="wg-legend-item wg-state-blacklist">\u2297 Ausschlie\xDFen</span>\r
          <span class="wg-legend-hint">(Klicken zum Wechseln)</span>\r
        </div>\r
        <input class="wg-filter-search" type="text" placeholder="Suche\u2026" [(ngModel)]="traitFilterSearch" />\r
        <div class="wg-filter-chips">\r
          @for (trait of filteredTraits; track trait.id) {\r
            <button\r
              class="wg-filter-chip"\r
              [class.wg-state-whitelist]="getTraitFilter(trait.id) === 'whitelist'"\r
              [class.wg-state-blacklist]="getTraitFilter(trait.id) === 'blacklist'"\r
              (click)="cycleTraitFilter(trait.id)"\r
              [title]="trait.name"\r
            >\r
              <span class="wg-chip-icon">{{ getTraitFilter(trait.id) === 'whitelist' ? '\u25C9' : getTraitFilter(trait.id) === 'blacklist' ? '\u2297' : '\u25C8' }}</span>\r
              {{ trait.name }}\r
            </button>\r
          }\r
          @if (filteredTraits.length === 0) {\r
            <span class="wg-empty">Keine Merkmale gefunden.</span>\r
          }\r
        </div>\r
      </div>\r
    }\r
\r
    <!-- \u2500\u2500 Metric filters \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    @if (showMetricFilters) {\r
      <div class="wg-metric-grid">\r
        <label class="wg-field">\r
          <span>Min \u2390</span>\r
          <input type="number" min="0" [ngModel]="params.minHaltbarkeit" (ngModelChange)="params.minHaltbarkeit = $event || null; saveToStorage()" placeholder="\u2013" />\r
        </label>\r
        <label class="wg-field">\r
          <span>Min \u2694</span>\r
          <input type="number" min="0" [ngModel]="params.minEffektivitaet" (ngModelChange)="params.minEffektivitaet = $event || null; saveToStorage()" placeholder="\u2013" />\r
        </label>\r
        <label class="wg-field">\r
          <span>Max \u2696 (kg)</span>\r
          <input type="number" min="0" step="0.1" [ngModel]="params.maxWeight" (ngModelChange)="params.maxWeight = $event || null; saveToStorage()" placeholder="\u2013" />\r
        </label>\r
      </div>\r
    }\r
\r
    <!-- \u2500\u2500 Effective budget info \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="wg-budget-info">\r
      Effektives SP-Budget: <strong>{{ effectiveSPBudget }}</strong>\r
      @if (params.costPerSP > 0 && (params.minBudget > 0 || params.budget > 0)) {\r
        <span class="wg-muted">(\r
          @if (params.minBudget > 0) { Min: {{ params.minBudget }} GP \xB7 }\r
          @if (params.budget > 0) { Max: {{ params.budget }} GP \xF7 {{ params.costPerSP }} GP/SP }\r
        )</span>\r
      }\r
    </div>\r
\r
    <!-- \u2500\u2500 Reroll button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <button class="wg-reroll-btn" (click)="reroll()" [disabled]="isGenerating || allMaterials.length === 0">\r
      @if (isGenerating) { Generiere\u2026 } @else { \u{1F3B2} Neu w\xFCrfeln <span class="wg-key-hint">[R]</span> }\r
    </button>\r
\r
    @if (allMaterials.length === 0 && !isLoading) {\r
      <div class="wg-warn">Keine Waffenmaterialien in Bibliotheken gefunden.</div>\r
    }\r
\r
    <!-- \u2500\u2500 No result \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    @if (noResultFound) {\r
      <div class="wg-no-result">\r
        Keine g\xFCltige Waffe gefunden. Bitte Einschr\xE4nkungen lockern oder Filter anpassen.\r
      </div>\r
    }\r
\r
    <!-- \u2500\u2500 Result card \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    @if (result) {\r
      <div class="wg-result">\r
        <div class="wg-result-header">\r
          <span class="wg-result-type">{{ result.weaponType.name }}</span>\r
          <span class="wg-damage-badge wg-damage-{{ result.weaponType.damageType.toLowerCase() }}">\r
            {{ result.weaponType.damageType }}\r
          </span>\r
          <span class="wg-size-badge">{{ resultSizeBadge }}</span>\r
          <span class="wg-range-badge">{{ result.weaponType.range }}</span>\r
        </div>\r
\r
        <div class="wg-result-stats">\r
          <span class="wg-stat"><span class="wg-stat-icon">\u2390</span> {{ result.finalHaltbarkeit }}</span>\r
          <span class="wg-stat"><span class="wg-stat-icon">\u2694</span> {{ result.finalEffektivitaet }}</span>\r
          <span class="wg-stat"><span class="wg-stat-icon">\u2696</span> {{ result.finalWeight }} kg</span>\r
          @if (result.finalStatRequirement > 0) {\r
            <span class="wg-stat"><span class="wg-stat-icon">Anf</span> {{ result.finalStatRequirement }}</span>\r
          }\r
        </div>\r
\r
        <div class="wg-result-slots">\r
          @if (result.primarySlot.entries.length > 0) {\r
            <div class="wg-slot-row">\r
              <span class="wg-slot-label">Prim\xE4r</span>\r
              <span>{{ slotLabel(result.primarySlot) }}</span>\r
            </div>\r
          }\r
          @if (result.secondarySlot.entries.length > 0) {\r
            <div class="wg-slot-row">\r
              <span class="wg-slot-label">Sekund\xE4r</span>\r
              <span>{{ slotLabel(result.secondarySlot) }}</span>\r
            </div>\r
          }\r
          @if (result.bonusSlot.entries.length > 0) {\r
            <div class="wg-slot-row">\r
              <span class="wg-slot-label">Zusatz</span>\r
              <span>{{ slotLabel(result.bonusSlot) }}</span>\r
            </div>\r
          }\r
        </div>\r
\r
        @if (result.appliedTraits.length > 0) {\r
          <div class="wg-result-traits">\r
            @for (t of result.appliedTraits; track t.trait.id) {\r
              <span class="wg-trait-chip">{{ t.trait.name }}@if(t.level > 1){ Lv.{{ t.level }}}</span>\r
            }\r
          </div>\r
        }\r
\r
        @if (result.allExtraEffects.length > 0) {\r
          <div class="wg-result-effects">\r
            <span class="wg-effects-label">Effekte:</span>\r
            {{ result.allExtraEffects.join(' \xB7 ') }}\r
          </div>\r
        }\r
\r
        <div class="wg-result-cost">\r
          <span>SP: <strong>{{ result.spentSP }}</strong> / {{ result.maxSP }}</span>\r
          @if (params.costPerSP > 0) {\r
            <span>Kosten: <strong>{{ result.totalCost | number:'1.0-0' }} GP</strong></span>\r
          }\r
        </div>\r
\r
        <div class="wg-result-save">\r
          <input\r
            class="wg-name-input"\r
            type="text"\r
            placeholder="Item-Name\u2026"\r
            [(ngModel)]="resultName"\r
            (keyup.enter)="confirmItem()"\r
          />\r
          <button class="wg-confirm-btn" (click)="confirmItem()" [disabled]="!resultName.trim()">\r
            + In Bibliothek\r
          </button>\r
        </div>\r
      </div>\r
    }\r
\r
  }\r
</div>\r
`, styles: ["/* src/app/shared/weapon-generator/weapon-generator.component.css */\n.wg-panel {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  width: 380px;\n  min-width: 340px;\n  max-width: 420px;\n  background: var(--card, #2d3748);\n  border-left: 1px solid var(--border, #4a5568);\n  padding: 14px;\n  overflow-y: auto;\n  height: 100%;\n  box-sizing: border-box;\n}\n.wg-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  border-bottom: 1px solid var(--border, #4a5568);\n  padding-bottom: 10px;\n}\n.wg-title {\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n  flex: 1;\n}\n.wg-hint {\n  font-size: 11px;\n  color: var(--text-muted, #9ca3af);\n}\n.wg-close-btn {\n  background: none;\n  border: none;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  font-size: 14px;\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n.wg-close-btn:hover {\n  background: rgba(255, 255, 255, 0.08);\n  color: var(--text, #e5e7eb);\n}\n.wg-loading {\n  color: var(--text-muted, #9ca3af);\n  font-size: 13px;\n  text-align: center;\n  padding: 20px 0;\n}\n.wg-field {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.wg-field span {\n  font-size: 11px;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 500;\n}\n.wg-field input,\n.wg-field select {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 13px;\n  padding: 4px 6px;\n  width: 100%;\n  box-sizing: border-box;\n}\n.wg-field input:focus,\n.wg-field select:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.wg-field-grow {\n  flex: 1;\n}\n.wg-config-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr 1fr;\n  gap: 8px;\n}\n.wg-ratio-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.wg-ratio-label {\n  font-size: 0.78rem;\n  color: var(--text-muted, #9ca3af);\n  white-space: nowrap;\n  min-width: 70px;\n}\n.wg-ratio-label-right {\n  text-align: right;\n}\n.wg-ratio-slider {\n  flex: 1;\n  accent-color: var(--accent, #8b5cf6);\n  cursor: pointer;\n}\n.wg-ratio-value {\n  font-size: 0.78rem;\n  color: var(--accent, #8b5cf6);\n  font-weight: 600;\n  min-width: 72px;\n  text-align: right;\n}\n.wg-type-row {\n  display: flex;\n  gap: 8px;\n  align-items: flex-end;\n}\n.wg-filter-toggles {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  align-items: center;\n}\n.wg-toggle-btn {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 16px;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 3px 10px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  transition: background 0.15s, color 0.15s;\n}\n.wg-toggle-btn:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text, #e5e7eb);\n}\n.wg-toggle-btn.wg-toggle-active {\n  background: rgba(139, 92, 246, 0.15);\n  border-color: var(--accent, #8b5cf6);\n  color: var(--accent, #8b5cf6);\n}\n.wg-badge {\n  font-size: 10px;\n  border-radius: 8px;\n  padding: 0 5px;\n  font-weight: 700;\n}\n.wg-badge-white {\n  background: rgba(74, 222, 128, 0.15);\n  color: #4ade80;\n}\n.wg-badge-black {\n  background: rgba(248, 113, 113, 0.15);\n  color: #f87171;\n}\n.wg-reset-btn {\n  background: rgba(248, 113, 113, 0.1);\n  border: 1px solid rgba(248, 113, 113, 0.3);\n  border-radius: 12px;\n  color: #f87171;\n  cursor: pointer;\n  font-size: 11px;\n  padding: 3px 8px;\n  margin-left: auto;\n}\n.wg-reset-btn:hover {\n  background: rgba(248, 113, 113, 0.2);\n}\n.wg-filter-panel {\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 10px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.wg-filter-legend {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  font-size: 11px;\n}\n.wg-legend-item {\n  display: flex;\n  align-items: center;\n  gap: 3px;\n}\n.wg-legend-hint {\n  color: var(--text-muted, #9ca3af);\n  font-size: 10px;\n  margin-left: auto;\n}\n.wg-filter-search {\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 12px;\n  padding: 4px 8px;\n}\n.wg-filter-search:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.wg-filter-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n  max-height: 160px;\n  overflow-y: auto;\n}\n.wg-filter-chip {\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 12px;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  font-size: 11px;\n  padding: 3px 8px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  transition:\n    background 0.1s,\n    color 0.1s,\n    border-color 0.1s;\n}\n.wg-filter-chip:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text, #e5e7eb);\n}\n.wg-filter-chip.wg-state-whitelist {\n  background: rgba(74, 222, 128, 0.12);\n  border-color: #4ade80;\n  color: #4ade80;\n}\n.wg-filter-chip.wg-state-blacklist {\n  background: rgba(248, 113, 113, 0.12);\n  border-color: #f87171;\n  color: #f87171;\n  text-decoration: line-through;\n}\n.wg-chip-icon {\n  font-size: 10px;\n}\n.wg-state-neutral {\n  color: var(--text-muted, #9ca3af);\n}\n.wg-state-whitelist {\n  color: #4ade80;\n}\n.wg-state-blacklist {\n  color: #f87171;\n}\n.wg-empty {\n  color: var(--text-muted, #9ca3af);\n  font-size: 12px;\n  padding: 4px 0;\n}\n.wg-metric-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 8px;\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 10px;\n}\n.wg-budget-info {\n  font-size: 12px;\n  color: var(--text-muted, #9ca3af);\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.wg-budget-info strong {\n  color: var(--text, #e5e7eb);\n}\n.wg-muted {\n  opacity: 0.6;\n}\n.wg-reroll-btn {\n  background: var(--accent, #8b5cf6);\n  border: none;\n  border-radius: 8px;\n  color: #fff;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 700;\n  padding: 10px 16px;\n  width: 100%;\n  transition: opacity 0.15s, transform 0.1s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.wg-reroll-btn:hover:not(:disabled) {\n  opacity: 0.88;\n  transform: translateY(-1px);\n}\n.wg-reroll-btn:active:not(:disabled) {\n  transform: translateY(0);\n}\n.wg-reroll-btn:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n.wg-key-hint {\n  font-size: 11px;\n  opacity: 0.7;\n  font-weight: 400;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 4px;\n  padding: 1px 5px;\n}\n.wg-warn {\n  font-size: 12px;\n  color: #fbbf24;\n  background: rgba(251, 191, 36, 0.1);\n  border: 1px solid rgba(251, 191, 36, 0.3);\n  border-radius: 6px;\n  padding: 8px 10px;\n  text-align: center;\n}\n.wg-no-result {\n  font-size: 12px;\n  color: #f87171;\n  background: rgba(248, 113, 113, 0.08);\n  border: 1px solid rgba(248, 113, 113, 0.25);\n  border-radius: 6px;\n  padding: 8px 10px;\n  text-align: center;\n}\n.wg-result {\n  background: rgba(0, 0, 0, 0.25);\n  border: 1px solid var(--accent, #8b5cf6);\n  border-radius: 8px;\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.wg-result-header {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.wg-result-type {\n  font-size: 15px;\n  font-weight: 700;\n  color: var(--text, #e5e7eb);\n  flex: 1 1 auto;\n}\n.wg-damage-badge {\n  font-size: 10px;\n  font-weight: 700;\n  border-radius: 8px;\n  padding: 2px 7px;\n}\n.wg-damage-schnitt {\n  background: rgba(248, 113, 113, 0.15);\n  color: #f87171;\n  border: 1px solid rgba(248, 113, 113, 0.35);\n}\n.wg-damage-stich {\n  background: rgba(251, 191, 36, 0.15);\n  color: #fbbf24;\n  border: 1px solid rgba(251, 191, 36, 0.35);\n}\n.wg-damage-wucht {\n  background: rgba(139, 92, 246, 0.15);\n  color: #a78bfa;\n  border: 1px solid rgba(139, 92, 246, 0.35);\n}\n.wg-size-badge {\n  font-size: 10px;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  color: var(--text-muted, #9ca3af);\n  padding: 2px 7px;\n}\n.wg-range-badge {\n  font-size: 10px;\n  color: var(--text-muted, #9ca3af);\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 8px;\n  padding: 2px 7px;\n}\n.wg-result-stats {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.wg-stat {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--text, #e5e7eb);\n}\n.wg-stat-icon {\n  font-size: 11px;\n  color: var(--text-muted, #9ca3af);\n}\n.wg-result-slots {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.wg-slot-row {\n  display: flex;\n  align-items: baseline;\n  gap: 6px;\n  font-size: 12px;\n  color: var(--text, #e5e7eb);\n}\n.wg-slot-label {\n  font-size: 10px;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  min-width: 52px;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n.wg-result-traits {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.wg-trait-chip {\n  background: rgba(139, 92, 246, 0.12);\n  border: 1px solid rgba(139, 92, 246, 0.35);\n  border-radius: 10px;\n  color: #c4b5fd;\n  font-size: 11px;\n  padding: 2px 8px;\n}\n.wg-result-effects {\n  font-size: 12px;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n}\n.wg-effects-label {\n  font-weight: 600;\n  color: #93c5fd;\n  margin-right: 4px;\n  font-style: normal;\n}\n.wg-result-cost {\n  display: flex;\n  gap: 16px;\n  font-size: 12px;\n  color: var(--text-muted, #9ca3af);\n  border-top: 1px solid rgba(255, 255, 255, 0.07);\n  padding-top: 6px;\n}\n.wg-result-cost strong {\n  color: var(--text, #e5e7eb);\n}\n.wg-result-save {\n  display: flex;\n  gap: 6px;\n}\n.wg-name-input {\n  flex: 1;\n  background: var(--bg, #1e293b);\n  border: 1px solid var(--border, #4a5568);\n  border-radius: 5px;\n  color: var(--text, #e5e7eb);\n  font-size: 13px;\n  padding: 5px 8px;\n}\n.wg-name-input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.wg-confirm-btn {\n  background: #4ade80;\n  border: none;\n  border-radius: 6px;\n  color: #0f172a;\n  cursor: pointer;\n  font-size: 12px;\n  font-weight: 700;\n  padding: 5px 12px;\n  white-space: nowrap;\n  transition: opacity 0.15s;\n}\n.wg-confirm-btn:hover:not(:disabled) {\n  opacity: 0.85;\n}\n.wg-confirm-btn:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n/*# sourceMappingURL=weapon-generator.component.css.map */\n"] }]
  }], null, { itemCreated: [{
    type: Output
  }], closePanel: [{
    type: Output
  }], onKey: [{
    type: HostListener,
    args: ["document:keydown", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(WeaponGeneratorComponent, { className: "WeaponGeneratorComponent", filePath: "app/shared/weapon-generator/weapon-generator.component.ts", lineNumber: 45 });
})();

// src/app/library-editor/rune-table/rune-table.component.ts
var _c02 = ["uploadInput"];
var _forTrack03 = ($index, $item) => $item.id;
function RuneTableComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 10);
    \u0275\u0275text(1, "Wird geladen\u2026");
    \u0275\u0275elementEnd();
  }
}
function RuneTableComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 11);
    \u0275\u0275text(1, ' Keine Runen in diesem Ordner. Klicke auf \u201ERunen hochladen" um Bilder als Runen zu importieren. ');
    \u0275\u0275elementEnd();
  }
}
function RuneTableComponent_Conditional_16_For_38_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 31);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const file_r3 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 1, file_r3.data.drawing), \u0275\u0275sanitizeUrl);
  }
}
function RuneTableComponent_Conditional_16_For_38_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 32);
    \u0275\u0275text(1, "\u2728");
    \u0275\u0275elementEnd();
  }
}
function RuneTableComponent_Conditional_16_For_38_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td", 13);
    \u0275\u0275conditionalCreate(2, RuneTableComponent_Conditional_16_For_38_Conditional_2_Template, 2, 3, "img", 31)(3, RuneTableComponent_Conditional_16_For_38_Conditional_3_Template, 2, 0, "div", 32);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "td", 14)(5, "input", 33);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_5_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.name, $event) || (file_r3.data.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_5_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "td", 34)(7, "input", 35);
    \u0275\u0275listener("input", function RuneTableComponent_Conditional_16_For_38_Template_input_input_7_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      file_r3.data.glowColor = $event.target.value;
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "td")(9, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_9_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.fokus, $event) || (file_r3.data.fokus = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_9_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "td")(11, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_11_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.fokusVerlust, $event) || (file_r3.data.fokusVerlust = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_11_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(12, "td")(13, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_13_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.mana, $event) || (file_r3.data.mana = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_13_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "td")(15, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_15_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.manaMult, $event) || (file_r3.data.manaMult = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_15_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "td")(17, "input", 36);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_17_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.effektivitaet, $event) || (file_r3.data.effektivitaet = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_17_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(18, "td")(19, "input", 37);
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_19_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setReq(file_r3, "strength", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "td")(21, "input", 37);
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_21_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setReq(file_r3, "dexterity", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "td")(23, "input", 37);
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_23_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setReq(file_r3, "intelligence", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(24, "td")(25, "input", 37);
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_25_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setReq(file_r3, "constitution", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "td")(27, "input", 37);
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_27_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setReq(file_r3, "chill", $event));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(28, "td", 26)(29, "input", 38);
    \u0275\u0275listener("change", function RuneTableComponent_Conditional_16_For_38_Template_input_change_29_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setTags(file_r3, $event.target.value));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "td", 27)(31, "input", 39);
    \u0275\u0275twoWayListener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_31_listener($event) {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      \u0275\u0275twoWayBindingSet(file_r3.data.description, $event) || (file_r3.data.description = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("ngModelChange", function RuneTableComponent_Conditional_16_For_38_Template_input_ngModelChange_31_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onFieldChange(file_r3));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(32, "td", 40)(33, "div", 41)(34, "button", 42);
    \u0275\u0275listener("click", function RuneTableComponent_Conditional_16_For_38_Template_button_click_34_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setRuneType(file_r3, "medium"));
    });
    \u0275\u0275text(35, "M");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "button", 43);
    \u0275\u0275listener("click", function RuneTableComponent_Conditional_16_For_38_Template_button_click_36_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setRuneType(file_r3, "formung"));
    });
    \u0275\u0275text(37, "F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "button", 44);
    \u0275\u0275listener("click", function RuneTableComponent_Conditional_16_For_38_Template_button_click_38_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setRuneType(file_r3, "selektor"));
    });
    \u0275\u0275text(39, "S");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "button", 45);
    \u0275\u0275listener("click", function RuneTableComponent_Conditional_16_For_38_Template_button_click_40_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setRuneType(file_r3, "custom"));
    });
    \u0275\u0275text(41, "?");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(42, "td", 29)(43, "button", 46);
    \u0275\u0275listener("click", function RuneTableComponent_Conditional_16_For_38_Template_button_click_43_listener() {
      const file_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.deleteRune(file_r3));
    });
    \u0275\u0275text(44, "\xD7");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const file_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("rt-saving", ctx_r3.savingIds().has(file_r3.id));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(file_r3.data.drawing ? 2 : 3);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.name);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", file_r3.data.glowColor || "#8b5cf6");
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.fokus);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.fokusVerlust);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.mana);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.manaMult);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.effektivitaet);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r3.reqVal(file_r3, "strength"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r3.reqVal(file_r3, "dexterity"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r3.reqVal(file_r3, "intelligence"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r3.reqVal(file_r3, "constitution"));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r3.reqVal(file_r3, "chill"));
    \u0275\u0275advance(2);
    \u0275\u0275property("value", ctx_r3.tagsStr(file_r3));
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", file_r3.data.description);
    \u0275\u0275advance(3);
    \u0275\u0275classProp("rtb-active", ctx_r3.getRuneType(file_r3) === "medium");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("rtb-active", ctx_r3.getRuneType(file_r3) === "formung");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("rtb-active", ctx_r3.getRuneType(file_r3) === "selektor");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("rtb-active", !ctx_r3.getRuneType(file_r3) || ctx_r3.getRuneType(file_r3) === "custom");
  }
}
function RuneTableComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "table", 12)(1, "thead")(2, "tr")(3, "th", 13);
    \u0275\u0275text(4, "Bild");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "th", 14);
    \u0275\u0275text(6, "Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th", 15);
    \u0275\u0275text(8, "Farbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "th", 16);
    \u0275\u0275text(10, "Fok");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "th", 17);
    \u0275\u0275text(12, "\xD7F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "th", 18);
    \u0275\u0275text(14, "Man");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "th", 19);
    \u0275\u0275text(16, "\xD7M");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "th", 20);
    \u0275\u0275text(18, "Eff");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "th", 21);
    \u0275\u0275text(20, "STR");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "th", 22);
    \u0275\u0275text(22, "GES");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "th", 23);
    \u0275\u0275text(24, "INT");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "th", 24);
    \u0275\u0275text(26, "KON");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "th", 25);
    \u0275\u0275text(28, "WIL");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "th", 26);
    \u0275\u0275text(30, "Tags");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "th", 27);
    \u0275\u0275text(32, "Beschreibung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "th", 28);
    \u0275\u0275text(34, "Typ");
    \u0275\u0275elementEnd();
    \u0275\u0275element(35, "th", 29);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(36, "tbody");
    \u0275\u0275repeaterCreate(37, RuneTableComponent_Conditional_16_For_38_Template, 45, 25, "tr", 30, _forTrack03);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(37);
    \u0275\u0275repeater(ctx_r3.runeFiles);
  }
}
var RuneTableComponent = class _RuneTableComponent {
  libraryId;
  folderId;
  close = new EventEmitter();
  filesChanged = new EventEmitter();
  uploadInput;
  api = inject(AssetBrowserApiService);
  imageService = inject(ImageService);
  cdr = inject(ChangeDetectorRef);
  runeFiles = [];
  isLoading = signal(false, ...ngDevMode ? [{ debugName: "isLoading" }] : []);
  uploading = signal(false, ...ngDevMode ? [{ debugName: "uploading" }] : []);
  savingIds = signal(/* @__PURE__ */ new Set(), ...ngDevMode ? [{ debugName: "savingIds" }] : []);
  /** Per-file save timer ids */
  saveTimers = /* @__PURE__ */ new Map();
  ngOnInit() {
    this.loadRunes();
  }
  ngOnDestroy() {
    for (const t of this.saveTimers.values())
      clearTimeout(t);
  }
  async loadRunes() {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(this.api.getFolderContents(this.libraryId, this.folderId));
      this.runeFiles = (contents.files ?? []).filter((f) => f.type === "rune");
      this.ensureRuneDefaults();
    } catch (e) {
      console.error("[RuneTable] Failed to load runes", e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
  ensureRuneDefaults() {
    for (const f of this.runeFiles) {
      const d = f.data;
      if (!d.statRequirements)
        d.statRequirements = {};
      if (!d.tags)
        d.tags = [];
      d.fokus ??= 0;
      d.fokusVerlust ??= 0;
      d.mana ??= 0;
      d.manaMult ??= 0;
      d.effektivitaet ??= 0;
    }
  }
  // ─── Auto-save ────────────────────────────────────────────────────────────
  onFieldChange(file) {
    const prev = this.saveTimers.get(file.id);
    if (prev)
      clearTimeout(prev);
    this.saveTimers.set(file.id, setTimeout(() => this.saveRune(file), 650));
  }
  async saveRune(file) {
    const saving = new Set(this.savingIds());
    saving.add(file.id);
    this.savingIds.set(saving);
    this.cdr.markForCheck();
    try {
      await firstValueFrom(this.api.updateFile(this.libraryId, file.id, {
        data: file.data,
        name: file.data.name || file.name
      }));
    } catch (e) {
      console.error("[RuneTable] Save failed", e);
    } finally {
      const s2 = new Set(this.savingIds());
      s2.delete(file.id);
      this.savingIds.set(s2);
      this.cdr.markForCheck();
    }
  }
  // ─── Stat requirements helpers ────────────────────────────────────────────
  reqVal(file, key) {
    return file.data.statRequirements?.[key] ?? 0;
  }
  setReq(file, key, value) {
    const rune = file.data;
    if (!rune.statRequirements)
      rune.statRequirements = {};
    rune.statRequirements[key] = value || 0;
    this.onFieldChange(file);
  }
  // ─── Tags ─────────────────────────────────────────────────────────────────
  tagsStr(file) {
    return (file.data.tags ?? []).join(", ");
  }
  setTags(file, raw) {
    file.data.tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
    this.onFieldChange(file);
  }
  // ─── Upload ───────────────────────────────────────────────────────────────
  triggerUpload() {
    this.uploadInput.nativeElement.value = "";
    this.uploadInput.nativeElement.click();
  }
  async uploadRunes(event) {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    if (!files.length)
      return;
    this.uploading.set(true);
    this.cdr.markForCheck();
    for (const file of files) {
      try {
        const base64 = await this.readFileAsBase64(file);
        const imageId = await this.imageService.uploadImage(base64);
        const extStripped = file.name.replace(/\.[^.]+$/, "");
        let runeName = extStripped;
        let detectedType;
        const typeMatch = extStripped.match(/^(.+)-([mfsaMFSA])$/);
        if (typeMatch) {
          runeName = typeMatch[1].trim();
          const tag = typeMatch[2].toLowerCase();
          if (tag === "m")
            detectedType = "medium";
          else if (tag === "f")
            detectedType = "formung";
          else if (tag === "s")
            detectedType = "selektor";
        }
        const newRune = {
          name: runeName,
          description: "",
          drawing: imageId,
          tags: [],
          glowColor: "#ffffff",
          fokus: 0,
          fokusVerlust: 0,
          mana: 0,
          manaMult: 0,
          effektivitaet: 0,
          statRequirements: {},
          identified: true,
          learned: false,
          runeType: detectedType
        };
        const assetFile = await firstValueFrom(this.api.createFile(this.libraryId, runeName, "rune", this.folderId, newRune));
        if (!assetFile.data.statRequirements)
          assetFile.data.statRequirements = {};
        this.runeFiles = [...this.runeFiles, assetFile];
        this.filesChanged.emit();
      } catch (e) {
        console.error("[RuneTable] Upload failed for", file.name, e);
      }
    }
    this.uploading.set(false);
    this.cdr.markForCheck();
  }
  readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  // ─── Delete ───────────────────────────────────────────────────────────────
  async deleteRune(file) {
    if (!confirm(`Rune "${file.data.name || file.name}" wirklich l\xF6schen?`))
      return;
    try {
      await firstValueFrom(this.api.deleteFile(this.libraryId, file.id));
      this.runeFiles = this.runeFiles.filter((f) => f.id !== file.id);
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error("[RuneTable] Delete failed", e);
    }
  }
  // ─── Rune type ─────────────────────────────────────────────────
  getRuneType(file) {
    return file.data.runeType;
  }
  setRuneType(file, type) {
    file.data.runeType = type;
    this.onFieldChange(file);
  }
  static \u0275fac = function RuneTableComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RuneTableComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _RuneTableComponent, selectors: [["app-rune-table"]], viewQuery: function RuneTableComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c02, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.uploadInput = _t.first);
    }
  }, inputs: { libraryId: "libraryId", folderId: "folderId" }, outputs: { close: "close", filesChanged: "filesChanged" }, decls: 17, vars: 4, consts: [["uploadInput", ""], [1, "rt-overlay"], [1, "rt-header"], [1, "rt-title"], [1, "rt-count"], [1, "rt-spacer"], [1, "rt-upload-btn", 3, "click", "disabled"], ["type", "file", "multiple", "", "accept", "image/*", 2, "display", "none", 3, "change"], [1, "rt-close-btn", 3, "click"], [1, "rt-scroll"], [1, "rt-loading"], [1, "rt-empty"], [1, "rt-table"], [1, "c-img"], [1, "c-name"], ["title", "Leuchtfarbe", 1, "c-color"], ["title", "Fokus-Basis", 1, "c-num"], ["title", "Fokus-Multiplikator", 1, "c-num"], ["title", "Mana-Basis", 1, "c-num"], ["title", "Mana-Multiplikator", 1, "c-num"], ["title", "Effektivit\xE4t", 1, "c-num"], ["title", "St\xE4rke", 1, "c-stat"], ["title", "Geschick", 1, "c-stat"], ["title", "Intelligenz", 1, "c-stat"], ["title", "Konstitution", 1, "c-stat"], ["title", "Wille", 1, "c-stat"], [1, "c-tags"], [1, "c-desc"], ["title", "Runentyp", 1, "c-type"], [1, "c-del"], [3, "rt-saving"], ["alt", "", 1, "rt-thumb", 3, "src"], [1, "rt-thumb-empty"], ["type", "text", "placeholder", "Name\u2026", 1, "rt-input", 3, "ngModelChange", "ngModel"], [1, "c-color"], ["type", "color", "title", "Leuchtfarbe", 1, "rt-color-pick", 3, "input", "value"], ["type", "number", "min", "0", 1, "rt-num", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", 1, "rt-stat", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "tag1, tag2\u2026", 1, "rt-input", 3, "change", "value"], ["type", "text", "placeholder", "Beschreibung\u2026", 1, "rt-input", 3, "ngModelChange", "ngModel"], [1, "c-type"], [1, "rt-type-btns"], ["title", "Medium", 1, "rt-tb", 3, "click"], ["title", "Formung", 1, "rt-tb", 3, "click"], ["title", "Selektor", 1, "rt-tb", 3, "click"], ["title", "Benutzerdefiniert", 1, "rt-tb", 3, "click"], ["title", "Rune l\xF6schen", 1, "rt-del-btn", 3, "click"]], template: function RuneTableComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "span", 3);
      \u0275\u0275text(3, "Rune-Tabelle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "span", 4);
      \u0275\u0275text(5);
      \u0275\u0275elementEnd();
      \u0275\u0275element(6, "div", 5);
      \u0275\u0275elementStart(7, "button", 6);
      \u0275\u0275listener("click", function RuneTableComponent_Template_button_click_7_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.triggerUpload());
      });
      \u0275\u0275text(8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "input", 7, 0);
      \u0275\u0275listener("change", function RuneTableComponent_Template_input_change_9_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.uploadRunes($event));
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "button", 8);
      \u0275\u0275listener("click", function RuneTableComponent_Template_button_click_11_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.close.emit());
      });
      \u0275\u0275text(12, "\u2715 Schlie\xDFen");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "div", 9);
      \u0275\u0275conditionalCreate(14, RuneTableComponent_Conditional_14_Template, 2, 0, "div", 10)(15, RuneTableComponent_Conditional_15_Template, 2, 0, "div", 11)(16, RuneTableComponent_Conditional_16_Template, 39, 0, "table", 12);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("", ctx.runeFiles.length, " Runen");
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", ctx.uploading());
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.uploading() ? "L\xE4dt hoch\u2026" : "\u2191 Runen hochladen", " ");
      \u0275\u0275advance(6);
      \u0275\u0275conditional(ctx.isLoading() ? 14 : ctx.runeFiles.length === 0 ? 15 : 16);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, MinValidator, NgModel, ImageUrlPipe], styles: ["\n\n.rt-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 1200;\n  background: #0f1117;\n  display: flex;\n  flex-direction: column;\n  font-size: 0.82rem;\n  color: #d1d5db;\n}\n.rt-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 16px;\n  background: #161b26;\n  border-bottom: 1px solid #2d3748;\n  flex-shrink: 0;\n}\n.rt-title[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.95rem;\n  color: #e2e8f0;\n  letter-spacing: 0.03em;\n}\n.rt-count[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #6b7280;\n  background: rgba(255, 255, 255, 0.06);\n  padding: 1px 7px;\n  border-radius: 8px;\n}\n.rt-spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.rt-upload-btn[_ngcontent-%COMP%] {\n  padding: 5px 13px;\n  background: #8b5cf6;\n  color: white;\n  border: none;\n  border-radius: 5px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.rt-upload-btn[_ngcontent-%COMP%]:hover {\n  background: #7c3aed;\n}\n.rt-upload-btn[_ngcontent-%COMP%]:disabled {\n  background: #374151;\n  color: #6b7280;\n  cursor: not-allowed;\n}\n.rt-close-btn[_ngcontent-%COMP%] {\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #9ca3af;\n  font-size: 0.8rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.rt-close-btn[_ngcontent-%COMP%]:hover {\n  border-color: #9ca3af;\n  color: #e2e8f0;\n}\n.rt-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow: auto;\n}\n.rt-loading[_ngcontent-%COMP%], \n.rt-empty[_ngcontent-%COMP%] {\n  padding: 40px;\n  text-align: center;\n  color: #6b7280;\n  font-size: 0.9rem;\n}\n.rt-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n.rt-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background: #161b26;\n}\n.rt-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 5px 4px;\n  text-align: center;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6b7280;\n  border-bottom: 1px solid #2d3748;\n  -webkit-user-select: none;\n  user-select: none;\n  white-space: nowrap;\n  overflow: hidden;\n}\n.rt-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 2px 3px;\n  border-bottom: 1px solid #1e2535;\n  vertical-align: middle;\n}\n.rt-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.03);\n}\n.rt-table[_ngcontent-%COMP%]   tr.rt-saving[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.06);\n}\n.c-img[_ngcontent-%COMP%] {\n  width: 48px;\n  text-align: center;\n}\n.c-name[_ngcontent-%COMP%] {\n  width: 130px;\n}\n.c-color[_ngcontent-%COMP%] {\n  width: 38px;\n  text-align: center;\n}\n.c-num[_ngcontent-%COMP%] {\n  width: 52px;\n  text-align: center;\n}\n.c-stat[_ngcontent-%COMP%] {\n  width: 40px;\n  text-align: center;\n}\n.c-tags[_ngcontent-%COMP%] {\n  width: 120px;\n}\n.c-desc[_ngcontent-%COMP%] {\n  width: auto;\n  min-width: 160px;\n}\n.c-type[_ngcontent-%COMP%] {\n  width: 92px;\n  text-align: center;\n}\n.c-del[_ngcontent-%COMP%] {\n  width: 30px;\n  text-align: center;\n}\n.rt-thumb[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  object-fit: contain;\n  display: block;\n  margin: 0 auto;\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-thumb-empty[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.1rem;\n  margin: 0 auto;\n  opacity: 0.4;\n}\n.rt-input[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #d1d5db;\n  font-size: 0.8rem;\n  padding: 2px 5px;\n  height: 28px;\n  transition: border-color 0.1s, background 0.1s;\n  outline: none;\n}\n.rt-input[_ngcontent-%COMP%]:hover {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-input[_ngcontent-%COMP%]:focus {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.rt-num[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #a5b4fc;\n  font-size: 0.78rem;\n  text-align: center;\n  padding: 2px 3px;\n  height: 28px;\n  outline: none;\n}\n.rt-num[_ngcontent-%COMP%]:hover {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-num[_ngcontent-%COMP%]:focus {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.rt-num[_ngcontent-%COMP%]::-webkit-inner-spin-button, \n.rt-num[_ngcontent-%COMP%]::-webkit-outer-spin-button, \n.rt-stat[_ngcontent-%COMP%]::-webkit-inner-spin-button, \n.rt-stat[_ngcontent-%COMP%]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.rt-num[_ngcontent-%COMP%], \n.rt-stat[_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\n.rt-stat[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #86efac;\n  font-size: 0.75rem;\n  text-align: center;\n  padding: 2px 2px;\n  height: 28px;\n  outline: none;\n}\n.rt-stat[_ngcontent-%COMP%]:hover {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-stat[_ngcontent-%COMP%]:focus {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.08);\n}\n.rt-color-pick[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  padding: 1px;\n  border: 1px solid #374151;\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  display: block;\n  margin: 0 auto;\n}\n.rt-color-pick[_ngcontent-%COMP%]:hover {\n  border-color: #6b7280;\n}\n.rt-del-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 3px;\n  color: #6b7280;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.12s;\n}\n.rt-del-btn[_ngcontent-%COMP%]:hover {\n  border-color: #ef4444;\n  color: #ef4444;\n  background: rgba(239, 68, 68, 0.1);\n}\n.rt-ports[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  align-items: center;\n  padding: 2px 0;\n}\n.rt-port-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  padding: 1px 4px 1px 3px;\n  border: 1px solid #6b7280;\n  border-radius: 12px;\n  background: rgba(255, 255, 255, 0.04);\n  font-size: 0.68rem;\n  color: #d1d5db;\n  white-space: nowrap;\n}\n.rt-port-dot[_ngcontent-%COMP%] {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.rt-port-rm[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #6b7280;\n  font-size: 0.85rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 1px;\n  margin-left: 1px;\n  transition: color 0.1s;\n}\n.rt-port-rm[_ngcontent-%COMP%]:hover {\n  color: #ef4444;\n}\n.rt-port-add[_ngcontent-%COMP%] {\n  height: 20px;\n  padding: 0 4px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px dashed #374151;\n  border-radius: 4px;\n  color: #6b7280;\n  font-size: 0.72rem;\n  cursor: pointer;\n  outline: none;\n  transition: border-color 0.12s, color 0.12s;\n}\n.rt-port-add[_ngcontent-%COMP%]:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.rt-type-btns[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 3px;\n  justify-content: center;\n}\n.rt-tb[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  border: 1px solid #374151;\n  background: transparent;\n  color: #6b7280;\n  font-size: 0.7rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    background 0.12s,\n    color 0.12s;\n  padding: 0;\n}\n.rt-tb[_ngcontent-%COMP%]:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.rt-tb.rtb-active[_ngcontent-%COMP%] {\n  background: #8b5cf6;\n  border-color: #8b5cf6;\n  color: #fff;\n}\n/*# sourceMappingURL=rune-table.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RuneTableComponent, [{
    type: Component,
    args: [{ selector: "app-rune-table", standalone: true, imports: [CommonModule, FormsModule, ImageUrlPipe], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="rt-overlay">\r
  <!-- Header bar -->\r
  <div class="rt-header">\r
    <span class="rt-title">Rune-Tabelle</span>\r
    <span class="rt-count">{{ runeFiles.length }} Runen</span>\r
    <div class="rt-spacer"></div>\r
    <button class="rt-upload-btn"\r
            [disabled]="uploading()"\r
            (click)="triggerUpload()">\r
      {{ uploading() ? 'L\xE4dt hoch\u2026' : '\u2191 Runen hochladen' }}\r
    </button>\r
    <input #uploadInput type="file" multiple accept="image/*"\r
           (change)="uploadRunes($event)" style="display:none">\r
    <button class="rt-close-btn" (click)="close.emit()">\u2715 Schlie\xDFen</button>\r
  </div>\r
\r
  <!-- Table wrapper -->\r
  <div class="rt-scroll">\r
    @if (isLoading()) {\r
      <div class="rt-loading">Wird geladen\u2026</div>\r
    } @else if (runeFiles.length === 0) {\r
      <div class="rt-empty">\r
        Keine Runen in diesem Ordner. Klicke auf \u201ERunen hochladen" um Bilder als Runen zu importieren.\r
      </div>\r
    } @else {\r
      <table class="rt-table">\r
        <thead>\r
          <tr>\r
            <th class="c-img">Bild</th>\r
            <th class="c-name">Name</th>\r
            <th class="c-color" title="Leuchtfarbe">Farbe</th>\r
            <th class="c-num" title="Fokus-Basis">Fok</th>\r
            <th class="c-num" title="Fokus-Multiplikator">\xD7F</th>\r
            <th class="c-num" title="Mana-Basis">Man</th>\r
            <th class="c-num" title="Mana-Multiplikator">\xD7M</th>\r
            <th class="c-num" title="Effektivit\xE4t">Eff</th>\r
            <th class="c-stat" title="St\xE4rke">STR</th>\r
            <th class="c-stat" title="Geschick">GES</th>\r
            <th class="c-stat" title="Intelligenz">INT</th>\r
            <th class="c-stat" title="Konstitution">KON</th>\r
            <th class="c-stat" title="Wille">WIL</th>\r
            <th class="c-tags">Tags</th>\r
            <th class="c-desc">Beschreibung</th>\r
            <th class="c-type" title="Runentyp">Typ</th>\r
            <th class="c-del"></th>\r
          </tr>\r
        </thead>\r
        <tbody>\r
          @for (file of runeFiles; track file.id) {\r
            <tr [class.rt-saving]="savingIds().has(file.id)">\r
              <!-- Bild -->\r
              <td class="c-img">\r
                @if (file.data.drawing) {\r
                  <img [src]="file.data.drawing | imageUrl" alt="" class="rt-thumb">\r
                } @else {\r
                  <div class="rt-thumb-empty">\u2728</div>\r
                }\r
              </td>\r
\r
              <!-- Name -->\r
              <td class="c-name">\r
                <input type="text" class="rt-input"\r
                       [(ngModel)]="file.data.name"\r
                       (ngModelChange)="onFieldChange(file)"\r
                       placeholder="Name\u2026">\r
              </td>\r
\r
              <!-- Leuchtfarbe -->\r
              <td class="c-color">\r
                <input type="color"\r
                       [value]="file.data.glowColor || '#8b5cf6'"\r
                       (input)="file.data.glowColor = $any($event.target).value; onFieldChange(file)"\r
                       class="rt-color-pick"\r
                       title="Leuchtfarbe">\r
              </td>\r
\r
              <!-- Fokus -->\r
              <td><input type="number" class="rt-num"\r
                         [(ngModel)]="file.data.fokus"\r
                         (ngModelChange)="onFieldChange(file)" min="0"></td>\r
              <td><input type="number" class="rt-num"\r
                         [(ngModel)]="file.data.fokusVerlust"\r
                         (ngModelChange)="onFieldChange(file)" min="0"></td>\r
\r
              <!-- Mana -->\r
              <td><input type="number" class="rt-num"\r
                         [(ngModel)]="file.data.mana"\r
                         (ngModelChange)="onFieldChange(file)" min="0"></td>\r
              <td><input type="number" class="rt-num"\r
                         [(ngModel)]="file.data.manaMult"\r
                         (ngModelChange)="onFieldChange(file)" min="0"></td>\r
\r
              <!-- Effektivit\xE4t -->\r
              <td><input type="number" class="rt-num"\r
                         [(ngModel)]="file.data.effektivitaet"\r
                         (ngModelChange)="onFieldChange(file)" min="0"></td>\r
\r
              <!-- Stat-Anforderungen -->\r
              <td><input type="number" class="rt-stat"\r
                         [ngModel]="reqVal(file, 'strength')"\r
                         (ngModelChange)="setReq(file, 'strength', $event)" min="0"></td>\r
              <td><input type="number" class="rt-stat"\r
                         [ngModel]="reqVal(file, 'dexterity')"\r
                         (ngModelChange)="setReq(file, 'dexterity', $event)" min="0"></td>\r
              <td><input type="number" class="rt-stat"\r
                         [ngModel]="reqVal(file, 'intelligence')"\r
                         (ngModelChange)="setReq(file, 'intelligence', $event)" min="0"></td>\r
              <td><input type="number" class="rt-stat"\r
                         [ngModel]="reqVal(file, 'constitution')"\r
                         (ngModelChange)="setReq(file, 'constitution', $event)" min="0"></td>\r
              <td><input type="number" class="rt-stat"\r
                         [ngModel]="reqVal(file, 'chill')"\r
                         (ngModelChange)="setReq(file, 'chill', $event)" min="0"></td>\r
\r
              <!-- Tags (comma-separated) -->\r
              <td class="c-tags">\r
                <input type="text" class="rt-input"\r
                       [value]="tagsStr(file)"\r
                       (change)="setTags(file, $any($event.target).value)"\r
                       placeholder="tag1, tag2\u2026">\r
              </td>\r
\r
              <!-- Beschreibung -->\r
              <td class="c-desc">\r
                <input type="text" class="rt-input"\r
                       [(ngModel)]="file.data.description"\r
                       (ngModelChange)="onFieldChange(file)"\r
                       placeholder="Beschreibung\u2026">\r
              </td>\r
\r
              <!-- Runentyp -->\r
              <td class="c-type">\r
                <div class="rt-type-btns">\r
                  <button class="rt-tb" [class.rtb-active]="getRuneType(file) === 'medium'"\r
                          (click)="setRuneType(file, 'medium')" title="Medium">M</button>\r
                  <button class="rt-tb" [class.rtb-active]="getRuneType(file) === 'formung'"\r
                          (click)="setRuneType(file, 'formung')" title="Formung">F</button>\r
                  <button class="rt-tb" [class.rtb-active]="getRuneType(file) === 'selektor'"\r
                          (click)="setRuneType(file, 'selektor')" title="Selektor">S</button>\r
                  <button class="rt-tb" [class.rtb-active]="!getRuneType(file) || getRuneType(file) === 'custom'"\r
                          (click)="setRuneType(file, 'custom')" title="Benutzerdefiniert">?</button>\r
                </div>\r
              </td>\r
\r
              <!-- L\xF6schen -->\r
              <td class="c-del">\r
                <button class="rt-del-btn" (click)="deleteRune(file)" title="Rune l\xF6schen">\xD7</button>\r
              </td>\r
            </tr>\r
          }\r
        </tbody>\r
      </table>\r
    }\r
  </div>\r
</div>\r
`, styles: ["/* src/app/library-editor/rune-table/rune-table.component.css */\n.rt-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1200;\n  background: #0f1117;\n  display: flex;\n  flex-direction: column;\n  font-size: 0.82rem;\n  color: #d1d5db;\n}\n.rt-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 16px;\n  background: #161b26;\n  border-bottom: 1px solid #2d3748;\n  flex-shrink: 0;\n}\n.rt-title {\n  font-weight: 700;\n  font-size: 0.95rem;\n  color: #e2e8f0;\n  letter-spacing: 0.03em;\n}\n.rt-count {\n  font-size: 0.75rem;\n  color: #6b7280;\n  background: rgba(255, 255, 255, 0.06);\n  padding: 1px 7px;\n  border-radius: 8px;\n}\n.rt-spacer {\n  flex: 1;\n}\n.rt-upload-btn {\n  padding: 5px 13px;\n  background: #8b5cf6;\n  color: white;\n  border: none;\n  border-radius: 5px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.rt-upload-btn:hover {\n  background: #7c3aed;\n}\n.rt-upload-btn:disabled {\n  background: #374151;\n  color: #6b7280;\n  cursor: not-allowed;\n}\n.rt-close-btn {\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #9ca3af;\n  font-size: 0.8rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.rt-close-btn:hover {\n  border-color: #9ca3af;\n  color: #e2e8f0;\n}\n.rt-scroll {\n  flex: 1;\n  overflow: auto;\n}\n.rt-loading,\n.rt-empty {\n  padding: 40px;\n  text-align: center;\n  color: #6b7280;\n  font-size: 0.9rem;\n}\n.rt-table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n.rt-table thead {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background: #161b26;\n}\n.rt-table th {\n  padding: 5px 4px;\n  text-align: center;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6b7280;\n  border-bottom: 1px solid #2d3748;\n  -webkit-user-select: none;\n  user-select: none;\n  white-space: nowrap;\n  overflow: hidden;\n}\n.rt-table td {\n  padding: 2px 3px;\n  border-bottom: 1px solid #1e2535;\n  vertical-align: middle;\n}\n.rt-table tr:hover td {\n  background: rgba(255, 255, 255, 0.03);\n}\n.rt-table tr.rt-saving td {\n  background: rgba(139, 92, 246, 0.06);\n}\n.c-img {\n  width: 48px;\n  text-align: center;\n}\n.c-name {\n  width: 130px;\n}\n.c-color {\n  width: 38px;\n  text-align: center;\n}\n.c-num {\n  width: 52px;\n  text-align: center;\n}\n.c-stat {\n  width: 40px;\n  text-align: center;\n}\n.c-tags {\n  width: 120px;\n}\n.c-desc {\n  width: auto;\n  min-width: 160px;\n}\n.c-type {\n  width: 92px;\n  text-align: center;\n}\n.c-del {\n  width: 30px;\n  text-align: center;\n}\n.rt-thumb {\n  width: 36px;\n  height: 36px;\n  object-fit: contain;\n  display: block;\n  margin: 0 auto;\n  border-radius: 3px;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-thumb-empty {\n  width: 36px;\n  height: 36px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 1.1rem;\n  margin: 0 auto;\n  opacity: 0.4;\n}\n.rt-input {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #d1d5db;\n  font-size: 0.8rem;\n  padding: 2px 5px;\n  height: 28px;\n  transition: border-color 0.1s, background 0.1s;\n  outline: none;\n}\n.rt-input:hover {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-input:focus {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.rt-num {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #a5b4fc;\n  font-size: 0.78rem;\n  text-align: center;\n  padding: 2px 3px;\n  height: 28px;\n  outline: none;\n}\n.rt-num:hover {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-num:focus {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.rt-num::-webkit-inner-spin-button,\n.rt-num::-webkit-outer-spin-button,\n.rt-stat::-webkit-inner-spin-button,\n.rt-stat::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.rt-num,\n.rt-stat {\n  -moz-appearance: textfield;\n}\n.rt-stat {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #86efac;\n  font-size: 0.75rem;\n  text-align: center;\n  padding: 2px 2px;\n  height: 28px;\n  outline: none;\n}\n.rt-stat:hover {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.rt-stat:focus {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.08);\n}\n.rt-color-pick {\n  width: 28px;\n  height: 28px;\n  padding: 1px;\n  border: 1px solid #374151;\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  display: block;\n  margin: 0 auto;\n}\n.rt-color-pick:hover {\n  border-color: #6b7280;\n}\n.rt-del-btn {\n  width: 22px;\n  height: 22px;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 3px;\n  color: #6b7280;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.12s;\n}\n.rt-del-btn:hover {\n  border-color: #ef4444;\n  color: #ef4444;\n  background: rgba(239, 68, 68, 0.1);\n}\n.rt-ports {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  align-items: center;\n  padding: 2px 0;\n}\n.rt-port-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  padding: 1px 4px 1px 3px;\n  border: 1px solid #6b7280;\n  border-radius: 12px;\n  background: rgba(255, 255, 255, 0.04);\n  font-size: 0.68rem;\n  color: #d1d5db;\n  white-space: nowrap;\n}\n.rt-port-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  flex-shrink: 0;\n}\n.rt-port-rm {\n  background: none;\n  border: none;\n  color: #6b7280;\n  font-size: 0.85rem;\n  line-height: 1;\n  cursor: pointer;\n  padding: 0 1px;\n  margin-left: 1px;\n  transition: color 0.1s;\n}\n.rt-port-rm:hover {\n  color: #ef4444;\n}\n.rt-port-add {\n  height: 20px;\n  padding: 0 4px;\n  background: rgba(255, 255, 255, 0.05);\n  border: 1px dashed #374151;\n  border-radius: 4px;\n  color: #6b7280;\n  font-size: 0.72rem;\n  cursor: pointer;\n  outline: none;\n  transition: border-color 0.12s, color 0.12s;\n}\n.rt-port-add:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.rt-type-btns {\n  display: flex;\n  gap: 3px;\n  justify-content: center;\n}\n.rt-tb {\n  width: 20px;\n  height: 20px;\n  border-radius: 4px;\n  border: 1px solid #374151;\n  background: transparent;\n  color: #6b7280;\n  font-size: 0.7rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    background 0.12s,\n    color 0.12s;\n  padding: 0;\n}\n.rt-tb:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.rt-tb.rtb-active {\n  background: #8b5cf6;\n  border-color: #8b5cf6;\n  color: #fff;\n}\n/*# sourceMappingURL=rune-table.component.css.map */\n"] }]
  }], null, { libraryId: [{
    type: Input
  }], folderId: [{
    type: Input
  }], close: [{
    type: Output
  }], filesChanged: [{
    type: Output
  }], uploadInput: [{
    type: ViewChild,
    args: ["uploadInput"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(RuneTableComponent, { className: "RuneTableComponent", filePath: "app/library-editor/rune-table/rune-table.component.ts", lineNumber: 23 });
})();

// src/app/library-editor/material-table/material-table.component.ts
var _forTrack04 = ($index, $item) => $item.id;
function MaterialTableComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 11);
    \u0275\u0275twoWayListener("ngModelChange", function MaterialTableComponent_Conditional_7_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.newName, $event) || (ctx_r1.newName = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275listener("keyup.enter", function MaterialTableComponent_Conditional_7_Template_input_keyup_enter_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.confirmAdd());
    })("keyup.escape", function MaterialTableComponent_Conditional_7_Template_input_keyup_escape_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelAdding());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(1, "button", 12);
    \u0275\u0275listener("click", function MaterialTableComponent_Conditional_7_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.confirmAdd());
    });
    \u0275\u0275text(2, "\u2713 Hinzuf\xFCgen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 13);
    \u0275\u0275listener("click", function MaterialTableComponent_Conditional_7_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.cancelAdding());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.newName);
  }
}
function MaterialTableComponent_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 14);
    \u0275\u0275listener("click", function MaterialTableComponent_Conditional_8_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r3);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.startAdding());
    });
    \u0275\u0275text(1, "+ Neues Material");
    \u0275\u0275elementEnd();
  }
}
function MaterialTableComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275text(1, "Wird geladen\u2026");
    \u0275\u0275elementEnd();
  }
}
function MaterialTableComponent_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 9);
    \u0275\u0275text(1, 'Keine Materialien in diesem Ordner. Klicke auf \u201E+ Neues Material" um anzufangen.');
    \u0275\u0275elementEnd();
  }
}
function MaterialTableComponent_Conditional_14_For_60_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "tr")(1, "td", 20)(2, "input", 43);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_2_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.mat(file_r5).name = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(3, "td", 44)(4, "input", 45);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_4_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.mat(file_r5).isPublic = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "td", 44)(6, "input", 45);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_6_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.mat(file_r5).canBeWeaponMaterial = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "td", 44)(8, "input", 45);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_8_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.mat(file_r5).canBeArmorMaterial = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "td", 46)(10, "input", 47);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_10_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.mat(file_r5).cost = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(11, "td", 48)(12, "select", 49);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_select_ngModelChange_12_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.mat(file_r5).rarity = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementStart(13, "option", 50);
    \u0275\u0275text(14, "Gew.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "option", 51);
    \u0275\u0275text(16, "Selten");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "option", 52);
    \u0275\u0275text(18, "Leg\xE4r");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(19, "td", 46)(20, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_20_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).haltbarkeit = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(21, "td", 46)(22, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_22_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).haltbarkeitSkalierung = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(23, "td", 46)(24, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_24_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).effektivitaet = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "td", 46)(26, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_26_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).effektivitaetSkalierung = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "td", 46)(28, "input", 54);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_28_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).weight = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "td", 46)(30, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_30_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).reqBase = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "td", 46)(32, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_32_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).reqScaling = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "td", 55)(34, "input", 56);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_34_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.ws(file_r5).extraEffect = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "td", 46)(36, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_36_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).haltbarkeit = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(37, "td", 46)(38, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_38_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).haltbarkeitSkalierung = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(39, "td", 46)(40, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_40_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).effektivitaet = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(41, "td", 46)(42, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_42_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).effektivitaetSkalierung = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(43, "td", 46)(44, "input", 54);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_44_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).weight = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(45, "td", 46)(46, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_46_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).ruestungsmalus = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(47, "td", 46)(48, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_48_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).reqBase = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(49, "td", 46)(50, "input", 53);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_50_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).reqScaling = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(51, "td", 55)(52, "input", 57);
    \u0275\u0275listener("ngModelChange", function MaterialTableComponent_Conditional_14_For_60_Template_input_ngModelChange_52_listener($event) {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      ctx_r1.aStats(file_r5).extraEffect = $event;
      return \u0275\u0275resetView(ctx_r1.onFieldChange(file_r5));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(53, "td", 41)(54, "button", 58);
    \u0275\u0275listener("click", function MaterialTableComponent_Conditional_14_For_60_Template_button_click_54_listener() {
      const file_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.deleteMaterial(file_r5));
    });
    \u0275\u0275text(55, "\u2715");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const file_r5 = ctx.$implicit;
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("mt-saving", ctx_r1.savingIds().has(file_r5.id));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r1.mat(file_r5).name);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r1.mat(file_r5).isPublic);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngModel", ctx_r1.mat(file_r5).cost ?? 0);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("rarity-rare", ctx_r1.mat(file_r5).rarity === "RARE")("rarity-legendary", ctx_r1.mat(file_r5).rarity === "LEGENDARY");
    \u0275\u0275property("ngModel", ctx_r1.mat(file_r5).rarity ?? "COMMON");
    \u0275\u0275advance(7);
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).haltbarkeit);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).haltbarkeitSkalierung);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).effektivitaet);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).effektivitaetSkalierung);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).weight);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).reqBase ?? 0);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).reqScaling ?? 0);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeWeaponMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeWeaponMaterial)("ngModel", ctx_r1.ws(file_r5).extraEffect);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).haltbarkeit);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).haltbarkeitSkalierung);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).effektivitaet);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).effektivitaetSkalierung);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).weight);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).ruestungsmalus ?? 0);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).reqBase ?? 0);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).reqScaling ?? 0);
    \u0275\u0275advance();
    \u0275\u0275classProp("mt-dim", !ctx_r1.mat(file_r5).canBeArmorMaterial);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.mat(file_r5).canBeArmorMaterial)("ngModel", ctx_r1.aStats(file_r5).extraEffect);
  }
}
function MaterialTableComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "table", 10)(1, "thead")(2, "tr", 15)(3, "th", 16);
    \u0275\u0275text(4, "Basis");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "th", 17);
    \u0275\u0275text(6, "\u2694\uFE0E Waffenwerte");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "th", 18);
    \u0275\u0275text(8, "\u26CA R\xFCstungswerte");
    \u0275\u0275elementEnd();
    \u0275\u0275element(9, "th", 19);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "tr")(11, "th", 20);
    \u0275\u0275text(12, "Name");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "th", 21);
    \u0275\u0275text(14, "\xD6ff");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "th", 22);
    \u0275\u0275text(16, "Waffe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "th", 23);
    \u0275\u0275text(18, "R\xFCst");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "th", 24);
    \u0275\u0275text(20, "\u{1F4B0}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "th", 25);
    \u0275\u0275text(22, "Rart.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "th", 26);
    \u0275\u0275text(24, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "th", 27);
    \u0275\u0275text(26, "+\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "th", 28);
    \u0275\u0275text(28, "\u2694");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "th", 29);
    \u0275\u0275text(30, "+\u2694");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "th", 30);
    \u0275\u0275text(32, "\u2696");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "th", 31);
    \u0275\u0275text(34, "AnfB");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(35, "th", 32);
    \u0275\u0275text(36, "Anf+");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "th", 33);
    \u0275\u0275text(38, "Eff.W");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "th", 34);
    \u0275\u0275text(40, "\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(41, "th", 35);
    \u0275\u0275text(42, "+\u2390");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "th", 36);
    \u0275\u0275text(44, "\u26CA");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(45, "th", 37);
    \u0275\u0275text(46, "+\u26CA");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "th", 38);
    \u0275\u0275text(48, "\u2696");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(49, "th", 39);
    \u0275\u0275text(50, "Mal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(51, "th", 31);
    \u0275\u0275text(52, "AnfB");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(53, "th", 32);
    \u0275\u0275text(54, "Anf+");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(55, "th", 40);
    \u0275\u0275text(56, "Eff.R");
    \u0275\u0275elementEnd();
    \u0275\u0275element(57, "th", 41);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(58, "tbody");
    \u0275\u0275repeaterCreate(59, MaterialTableComponent_Conditional_14_For_60_Template, 56, 80, "tr", 42, _forTrack04);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(59);
    \u0275\u0275repeater(ctx_r1.materialFiles);
  }
}
var MaterialTableComponent = class _MaterialTableComponent {
  libraryId;
  folderId;
  close = new EventEmitter();
  filesChanged = new EventEmitter();
  api = inject(AssetBrowserApiService);
  cdr = inject(ChangeDetectorRef);
  materialFiles = [];
  isLoading = signal(false, ...ngDevMode ? [{ debugName: "isLoading" }] : []);
  savingIds = signal(/* @__PURE__ */ new Set(), ...ngDevMode ? [{ debugName: "savingIds" }] : []);
  addingNew = signal(false, ...ngDevMode ? [{ debugName: "addingNew" }] : []);
  newName = "";
  saveTimers = /* @__PURE__ */ new Map();
  ngOnInit() {
    this.loadMaterials();
  }
  ngOnDestroy() {
    for (const t of this.saveTimers.values())
      clearTimeout(t);
  }
  async loadMaterials() {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(this.api.getFolderContents(this.libraryId, this.folderId));
      this.materialFiles = (contents.files ?? []).filter((f) => f.type === "material");
      this.ensureDefaults();
    } catch (e) {
      console.error("[MaterialTable] Failed to load materials", e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
  ensureDefaults() {
    for (const f of this.materialFiles) {
      const d = f.data;
      d.isPublic ??= false;
      d.canBeWeaponMaterial ??= false;
      d.canBeArmorMaterial ??= false;
      if (d.canBeWeaponMaterial && !d.weaponStats)
        d.weaponStats = this.defaultWeaponStats();
      if (d.canBeArmorMaterial && !d.armorStats)
        d.armorStats = this.defaultArmorStats();
      if (!d.weaponStats)
        d.weaponStats = this.defaultWeaponStats();
      if (!d.armorStats)
        d.armorStats = this.defaultArmorStats();
    }
  }
  defaultWeaponStats() {
    return { haltbarkeit: 50, haltbarkeitSkalierung: 10, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: "", weight: 1, reqBase: 0, reqScaling: 0 };
  }
  defaultArmorStats() {
    return { haltbarkeit: 80, haltbarkeitSkalierung: 15, effektivitaet: 5, effektivitaetSkalierung: 2, extraEffect: "", weight: 2, ruestungsmalus: 0, reqBase: 0, reqScaling: 0 };
  }
  // ─── Auto-save ────────────────────────────────────────────────────────────
  onFieldChange(file) {
    const prev = this.saveTimers.get(file.id);
    if (prev)
      clearTimeout(prev);
    this.saveTimers.set(file.id, setTimeout(() => this.saveMaterial(file), 650));
  }
  async saveMaterial(file) {
    const saving = new Set(this.savingIds());
    saving.add(file.id);
    this.savingIds.set(saving);
    this.cdr.markForCheck();
    try {
      await firstValueFrom(this.api.updateFile(this.libraryId, file.id, {
        data: file.data,
        name: file.data.name || file.name
      }));
    } catch (e) {
      console.error("[MaterialTable] Save failed", e);
    } finally {
      const s2 = new Set(this.savingIds());
      s2.delete(file.id);
      this.savingIds.set(s2);
      this.cdr.markForCheck();
    }
  }
  // ─── Add new material ─────────────────────────────────────────────────────
  startAdding() {
    this.newName = "";
    this.addingNew.set(true);
    this.cdr.markForCheck();
  }
  cancelAdding() {
    this.addingNew.set(false);
    this.newName = "";
  }
  async confirmAdd() {
    const name = this.newName.trim() || "Neues Material";
    this.addingNew.set(false);
    const block = createEmptyMaterialBlock();
    block.name = name;
    try {
      const file = await firstValueFrom(this.api.createFile(this.libraryId, name, "material", this.folderId, block));
      if (!file.data.weaponStats)
        file.data.weaponStats = this.defaultWeaponStats();
      if (!file.data.armorStats)
        file.data.armorStats = this.defaultArmorStats();
      this.materialFiles = [...this.materialFiles, file];
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error("[MaterialTable] Create failed", e);
    }
  }
  // ─── Delete ───────────────────────────────────────────────────────────────
  async deleteMaterial(file) {
    if (!confirm(`Material "${file.data.name}" l\xF6schen?`))
      return;
    try {
      await firstValueFrom(this.api.deleteFile(this.libraryId, file.id));
      this.materialFiles = this.materialFiles.filter((f) => f.id !== file.id);
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error("[MaterialTable] Delete failed", e);
    }
  }
  // ─── Helpers ──────────────────────────────────────────────────────────────
  mat(file) {
    return file.data;
  }
  ws(file) {
    return file.data.weaponStats;
  }
  aStats(file) {
    return file.data.armorStats;
  }
  static \u0275fac = function MaterialTableComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MaterialTableComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MaterialTableComponent, selectors: [["app-material-table"]], inputs: { libraryId: "libraryId", folderId: "folderId" }, outputs: { close: "close", filesChanged: "filesChanged" }, decls: 15, vars: 3, consts: [[1, "mt-overlay"], [1, "mt-header"], [1, "mt-title"], [1, "mt-count"], [1, "mt-spacer"], [1, "mt-add-btn"], [1, "mt-close-btn", 3, "click"], [1, "mt-scroll"], [1, "mt-loading"], [1, "mt-empty"], [1, "mt-table"], ["type", "text", "placeholder", "Materialname...", "autofocus", "", 1, "mt-new-input", 3, "ngModelChange", "keyup.enter", "keyup.escape", "ngModel"], [1, "mt-confirm-btn", 3, "click"], [1, "mt-cancel-btn", 3, "click"], [1, "mt-add-btn", 3, "click"], [1, "thead-groups"], ["colspan", "6", 1, "grp-base"], ["colspan", "8", 1, "grp-weapon"], ["colspan", "9", 1, "grp-armor"], ["colspan", "1", 1, "grp-del"], [1, "c-name"], ["title", "\xD6ffentlich", 1, "c-cb"], ["title", "Kann als Waffen-Material genutzt werden", 1, "c-cb"], ["title", "Kann als R\xFCstungs-Material genutzt werden", 1, "c-cb"], ["title", "Kosten", 1, "c-num"], ["title", "Rarit\xE4t", 1, "c-rarity"], ["title", "Haltbarkeit (Waffe)", 1, "c-num"], ["title", "Haltbarkeit Skalierung (Waffe)", 1, "c-num"], ["title", "Effektivit\xE4t", 1, "c-num"], ["title", "Effektivit\xE4t Skalierung", 1, "c-num"], ["title", "Gewicht (Waffe, kg)", 1, "c-num"], ["title", "Anforderung Basis", 1, "c-num"], ["title", "Anforderung Skalierung", 1, "c-num"], ["title", "Extraeffekt (Waffe)", 1, "c-eff"], ["title", "Haltbarkeit (R\xFCstung)", 1, "c-num"], ["title", "Haltbarkeit Skalierung (R\xFCstung)", 1, "c-num"], ["title", "Stabilit\xE4t", 1, "c-num"], ["title", "Stabilit\xE4t Skalierung", 1, "c-num"], ["title", "Gewicht (R\xFCstung, kg)", 1, "c-num"], ["title", "R\xFCstungsmalus", 1, "c-num"], ["title", "Extraeffekt (R\xFCstung)", 1, "c-eff"], [1, "c-del"], [3, "mt-saving"], ["type", "text", "placeholder", "Name\u2026", 1, "mt-input", 3, "ngModelChange", "ngModel"], [1, "c-cb"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "c-num"], ["type", "number", "min", "0", 1, "mt-num", 3, "ngModelChange", "ngModel"], [1, "c-rarity"], [1, "mt-rarity-sel", 3, "ngModelChange", "ngModel"], ["value", "COMMON"], ["value", "RARE"], ["value", "LEGENDARY"], ["type", "number", "min", "0", 1, "mt-num", 3, "ngModelChange", "disabled", "ngModel"], ["type", "number", "min", "0", "step", "0.1", 1, "mt-num", 3, "ngModelChange", "disabled", "ngModel"], [1, "c-eff"], ["type", "text", "placeholder", "z.B. +1 Reichweite", 1, "mt-input", 3, "ngModelChange", "disabled", "ngModel"], ["type", "text", "placeholder", "z.B. Feuerschutz +1", 1, "mt-input", 3, "ngModelChange", "disabled", "ngModel"], ["title", "L\xF6schen", 1, "mt-del-btn", 3, "click"]], template: function MaterialTableComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "span", 2);
      \u0275\u0275text(3, "Material-Tabelle");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "span", 3);
      \u0275\u0275text(5);
      \u0275\u0275elementEnd();
      \u0275\u0275element(6, "div", 4);
      \u0275\u0275conditionalCreate(7, MaterialTableComponent_Conditional_7_Template, 5, 1)(8, MaterialTableComponent_Conditional_8_Template, 2, 0, "button", 5);
      \u0275\u0275elementStart(9, "button", 6);
      \u0275\u0275listener("click", function MaterialTableComponent_Template_button_click_9_listener() {
        return ctx.close.emit();
      });
      \u0275\u0275text(10, "\u2715 Schlie\xDFen");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "div", 7);
      \u0275\u0275conditionalCreate(12, MaterialTableComponent_Conditional_12_Template, 2, 0, "div", 8)(13, MaterialTableComponent_Conditional_13_Template, 2, 0, "div", 9)(14, MaterialTableComponent_Conditional_14_Template, 61, 0, "table", 10);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("", ctx.materialFiles.length, " Materialien");
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.addingNew() ? 7 : 8);
      \u0275\u0275advance(5);
      \u0275\u0275conditional(ctx.isLoading() ? 12 : ctx.materialFiles.length === 0 ? 13 : 14);
    }
  }, dependencies: [CommonModule, FormsModule, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, SelectControlValueAccessor, NgControlStatus, MinValidator, NgModel], styles: ["\n\n.mt-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 1200;\n  background: #0f1117;\n  display: flex;\n  flex-direction: column;\n  font-size: 0.82rem;\n  color: #d1d5db;\n}\n.mt-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 16px;\n  background: #161b26;\n  border-bottom: 1px solid #2d3748;\n  flex-shrink: 0;\n}\n.mt-title[_ngcontent-%COMP%] {\n  font-weight: 700;\n  font-size: 0.95rem;\n  color: #e2e8f0;\n  letter-spacing: 0.03em;\n}\n.mt-count[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: #6b7280;\n  background: rgba(255, 255, 255, 0.06);\n  padding: 1px 7px;\n  border-radius: 8px;\n}\n.mt-spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.mt-new-input[_ngcontent-%COMP%] {\n  height: 30px;\n  padding: 0 8px;\n  background: #1e293b;\n  border: 1px solid #6366f1;\n  border-radius: 4px;\n  color: #e2e8f0;\n  font-size: 0.82rem;\n  outline: none;\n  width: 200px;\n}\n.mt-add-btn[_ngcontent-%COMP%] {\n  padding: 5px 13px;\n  background: #8b5cf6;\n  color: white;\n  border: none;\n  border-radius: 5px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.mt-add-btn[_ngcontent-%COMP%]:hover {\n  background: #7c3aed;\n}\n.mt-confirm-btn[_ngcontent-%COMP%] {\n  padding: 4px 12px;\n  background: #059669;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.mt-confirm-btn[_ngcontent-%COMP%]:hover {\n  background: #047857;\n}\n.mt-cancel-btn[_ngcontent-%COMP%] {\n  padding: 4px 9px;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 4px;\n  color: #9ca3af;\n  font-size: 0.8rem;\n  cursor: pointer;\n}\n.mt-cancel-btn[_ngcontent-%COMP%]:hover {\n  border-color: #9ca3af;\n  color: #e2e8f0;\n}\n.mt-close-btn[_ngcontent-%COMP%] {\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #9ca3af;\n  font-size: 0.8rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.mt-close-btn[_ngcontent-%COMP%]:hover {\n  border-color: #9ca3af;\n  color: #e2e8f0;\n}\n.mt-scroll[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow: auto;\n}\n.mt-loading[_ngcontent-%COMP%], \n.mt-empty[_ngcontent-%COMP%] {\n  padding: 40px;\n  text-align: center;\n  color: #6b7280;\n  font-size: 0.9rem;\n}\n.mt-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n.mt-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background: #161b26;\n}\n.thead-groups[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 4px 4px 2px;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6b7280;\n  border-bottom: none;\n  text-align: center;\n  white-space: nowrap;\n}\n.grp-base[_ngcontent-%COMP%] {\n  color: #9ca3af;\n  border-right: 1px solid #2d3748;\n}\n.grp-weapon[_ngcontent-%COMP%] {\n  color: #60a5fa;\n  background: rgba(96, 165, 250, 0.05);\n  border-right: 1px solid #2d3748;\n}\n.grp-armor[_ngcontent-%COMP%] {\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.05);\n  border-right: 1px solid #2d3748;\n}\n.mt-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 4px 3px;\n  text-align: center;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6b7280;\n  border-bottom: 2px solid #2d3748;\n  -webkit-user-select: none;\n  user-select: none;\n  white-space: nowrap;\n  overflow: hidden;\n}\n.mt-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 2px 3px;\n  border-bottom: 1px solid #1e2535;\n  vertical-align: middle;\n}\n.mt-table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover   td[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.025);\n}\n.mt-table[_ngcontent-%COMP%]   tr.mt-saving[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.07);\n}\n.mt-dim[_ngcontent-%COMP%] {\n  opacity: 0.28;\n}\n.mt-dim[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  pointer-events: none;\n}\n.c-name[_ngcontent-%COMP%] {\n  width: 150px;\n}\n.c-cb[_ngcontent-%COMP%] {\n  width: 36px;\n  text-align: center;\n}\n.c-num[_ngcontent-%COMP%] {\n  width: 50px;\n  text-align: center;\n}\n.c-rarity[_ngcontent-%COMP%] {\n  width: 80px;\n  text-align: center;\n}\n.c-eff[_ngcontent-%COMP%] {\n  width: 130px;\n  min-width: 100px;\n}\n.c-del[_ngcontent-%COMP%] {\n  width: 30px;\n  text-align: center;\n}\n.mt-rarity-sel[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  color: var(--text, #e5e7eb);\n  font-size: 0.78rem;\n  padding: 0.1rem 0.15rem;\n  cursor: pointer;\n}\n.mt-rarity-sel[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.mt-rarity-sel.rarity-rare[_ngcontent-%COMP%] {\n  color: #60a5fa;\n}\n.mt-rarity-sel.rarity-legendary[_ngcontent-%COMP%] {\n  color: #fbbf24;\n}\n.mt-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(6), \n.mt-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(6) {\n  border-right: 2px solid #1e3a5f;\n}\n.mt-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:nth-child(14), \n.mt-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(14) {\n  border-right: 2px solid #2d1b69;\n}\n.mt-input[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #d1d5db;\n  font-size: 0.8rem;\n  padding: 2px 5px;\n  height: 28px;\n  outline: none;\n  transition: border-color 0.1s, background 0.1s;\n}\n.mt-input[_ngcontent-%COMP%]:hover:not(:disabled) {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.mt-input[_ngcontent-%COMP%]:focus:not(:disabled) {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.mt-num[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #a5b4fc;\n  font-size: 0.8rem;\n  text-align: center;\n  padding: 2px 2px;\n  height: 28px;\n  outline: none;\n  -moz-appearance: textfield;\n  appearance: textfield;\n  transition: border-color 0.1s, background 0.1s;\n}\n.mt-num[_ngcontent-%COMP%]::-webkit-inner-spin-button, \n.mt-num[_ngcontent-%COMP%]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.mt-num[_ngcontent-%COMP%]:hover:not(:disabled) {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.mt-num[_ngcontent-%COMP%]:focus:not(:disabled) {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.c-cb[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 15px;\n  height: 15px;\n  accent-color: #8b5cf6;\n  cursor: pointer;\n  display: block;\n  margin: 0 auto;\n}\n.mt-del-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #6b7280;\n  font-size: 0.75rem;\n  cursor: pointer;\n  padding: 2px 4px;\n  border-radius: 3px;\n  transition: color 0.1s, background 0.1s;\n}\n.mt-del-btn[_ngcontent-%COMP%]:hover {\n  color: #f87171;\n  background: rgba(248, 113, 113, 0.12);\n}\n/*# sourceMappingURL=material-table.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MaterialTableComponent, [{
    type: Component,
    args: [{ selector: "app-material-table", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="mt-overlay">\r
  <!-- Header -->\r
  <div class="mt-header">\r
    <span class="mt-title">Material-Tabelle</span>\r
    <span class="mt-count">{{ materialFiles.length }} Materialien</span>\r
    <div class="mt-spacer"></div>\r
    @if (addingNew()) {\r
      <input\r
        class="mt-new-input"\r
        type="text"\r
        [(ngModel)]="newName"\r
        placeholder="Materialname..."\r
        (keyup.enter)="confirmAdd()"\r
        (keyup.escape)="cancelAdding()"\r
        autofocus\r
      />\r
      <button class="mt-confirm-btn" (click)="confirmAdd()">\u2713 Hinzuf\xFCgen</button>\r
      <button class="mt-cancel-btn" (click)="cancelAdding()">\u2715</button>\r
    } @else {\r
      <button class="mt-add-btn" (click)="startAdding()">+ Neues Material</button>\r
    }\r
    <button class="mt-close-btn" (click)="close.emit()">\u2715 Schlie\xDFen</button>\r
  </div>\r
\r
  <!-- Table -->\r
  <div class="mt-scroll">\r
    @if (isLoading()) {\r
      <div class="mt-loading">Wird geladen\u2026</div>\r
    } @else if (materialFiles.length === 0) {\r
      <div class="mt-empty">Keine Materialien in diesem Ordner. Klicke auf \u201E+ Neues Material" um anzufangen.</div>\r
    } @else {\r
      <table class="mt-table">\r
        <thead>\r
          <tr class="thead-groups">\r
            <th colspan="6" class="grp-base">Basis</th>\r
            <th colspan="8" class="grp-weapon">\u2694\uFE0E Waffenwerte</th>\r
            <th colspan="9" class="grp-armor">\u26CA R\xFCstungswerte</th>\r
            <th colspan="1" class="grp-del"></th>\r
          </tr>\r
          <tr>\r
            <th class="c-name">Name</th>\r
            <th class="c-cb" title="\xD6ffentlich">\xD6ff</th>\r
            <th class="c-cb" title="Kann als Waffen-Material genutzt werden">Waffe</th>\r
            <th class="c-cb" title="Kann als R\xFCstungs-Material genutzt werden">R\xFCst</th>\r
            <th class="c-num" title="Kosten">\u{1F4B0}</th>\r
            <th class="c-rarity" title="Rarit\xE4t">Rart.</th>\r
            <!-- Weapon -->\r
            <th class="c-num" title="Haltbarkeit (Waffe)">\u2390</th>\r
            <th class="c-num" title="Haltbarkeit Skalierung (Waffe)">+\u2390</th>\r
            <th class="c-num" title="Effektivit\xE4t">\u2694</th>\r
            <th class="c-num" title="Effektivit\xE4t Skalierung">+\u2694</th>\r
            <th class="c-num" title="Gewicht (Waffe, kg)">\u2696</th>\r
            <th class="c-num" title="Anforderung Basis">AnfB</th>\r
            <th class="c-num" title="Anforderung Skalierung">Anf+</th>\r
            <th class="c-eff" title="Extraeffekt (Waffe)">Eff.W</th>\r
            <!-- Armor -->\r
            <th class="c-num" title="Haltbarkeit (R\xFCstung)">\u2390</th>\r
            <th class="c-num" title="Haltbarkeit Skalierung (R\xFCstung)">+\u2390</th>\r
            <th class="c-num" title="Stabilit\xE4t">\u26CA</th>\r
            <th class="c-num" title="Stabilit\xE4t Skalierung">+\u26CA</th>\r
            <th class="c-num" title="Gewicht (R\xFCstung, kg)">\u2696</th>\r
            <th class="c-num" title="R\xFCstungsmalus">Mal</th>\r
            <th class="c-num" title="Anforderung Basis">AnfB</th>\r
            <th class="c-num" title="Anforderung Skalierung">Anf+</th>\r
            <th class="c-eff" title="Extraeffekt (R\xFCstung)">Eff.R</th>\r
            <th class="c-del"></th>\r
          </tr>\r
        </thead>\r
        <tbody>\r
          @for (file of materialFiles; track file.id) {\r
            <tr [class.mt-saving]="savingIds().has(file.id)">\r
              <!-- Name -->\r
              <td class="c-name">\r
                <input class="mt-input"\r
                       type="text"\r
                       [ngModel]="mat(file).name"\r
                       (ngModelChange)="mat(file).name = $event; onFieldChange(file)"\r
                       placeholder="Name\u2026" />\r
              </td>\r
              <!-- \xD6ffentlich -->\r
              <td class="c-cb">\r
                <input type="checkbox"\r
                       [ngModel]="mat(file).isPublic"\r
                       (ngModelChange)="mat(file).isPublic = $event; onFieldChange(file)" />\r
              </td>\r
              <!-- Waffe toggle -->\r
              <td class="c-cb">\r
                <input type="checkbox"\r
                       [ngModel]="mat(file).canBeWeaponMaterial"\r
                       (ngModelChange)="mat(file).canBeWeaponMaterial = $event; onFieldChange(file)" />\r
              </td>\r
              <!-- R\xFCstung toggle -->\r
              <td class="c-cb">\r
                <input type="checkbox"\r
                       [ngModel]="mat(file).canBeArmorMaterial"\r
                       (ngModelChange)="mat(file).canBeArmorMaterial = $event; onFieldChange(file)" />\r
              </td>\r
              <!-- Kosten -->\r
              <td class="c-num">\r
                <input class="mt-num" type="number" min="0"\r
                       [ngModel]="mat(file).cost ?? 0"\r
                       (ngModelChange)="mat(file).cost = $event; onFieldChange(file)" />\r
              </td>\r
              <!-- Rarit\xE4t -->\r
              <td class="c-rarity">\r
                <select class="mt-rarity-sel"\r
                        [class.rarity-rare]="mat(file).rarity === 'RARE'"\r
                        [class.rarity-legendary]="mat(file).rarity === 'LEGENDARY'"\r
                        [ngModel]="mat(file).rarity ?? 'COMMON'"\r
                        (ngModelChange)="mat(file).rarity = $event; onFieldChange(file)">\r
                  <option value="COMMON">Gew.</option>\r
                  <option value="RARE">Selten</option>\r
                  <option value="LEGENDARY">Leg\xE4r</option>\r
                </select>\r
              </td>\r
\r
              <!-- \u2500\u2500 Weapon stats \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).haltbarkeit"\r
                       (ngModelChange)="ws(file).haltbarkeit = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).haltbarkeitSkalierung"\r
                       (ngModelChange)="ws(file).haltbarkeitSkalierung = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).effektivitaet"\r
                       (ngModelChange)="ws(file).effektivitaet = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).effektivitaetSkalierung"\r
                       (ngModelChange)="ws(file).effektivitaetSkalierung = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0" step="0.1"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).weight"\r
                       (ngModelChange)="ws(file).weight = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).reqBase ?? 0"\r
                       (ngModelChange)="ws(file).reqBase = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).reqScaling ?? 0"\r
                       (ngModelChange)="ws(file).reqScaling = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-eff" [class.mt-dim]="!mat(file).canBeWeaponMaterial">\r
                <input class="mt-input"\r
                       type="text"\r
                       [disabled]="!mat(file).canBeWeaponMaterial"\r
                       [ngModel]="ws(file).extraEffect"\r
                       (ngModelChange)="ws(file).extraEffect = $event; onFieldChange(file)"\r
                       placeholder="z.B. +1 Reichweite" />\r
              </td>\r
\r
              <!-- \u2500\u2500 Armor stats \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).haltbarkeit"\r
                       (ngModelChange)="aStats(file).haltbarkeit = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).haltbarkeitSkalierung"\r
                       (ngModelChange)="aStats(file).haltbarkeitSkalierung = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).effektivitaet"\r
                       (ngModelChange)="aStats(file).effektivitaet = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).effektivitaetSkalierung"\r
                       (ngModelChange)="aStats(file).effektivitaetSkalierung = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0" step="0.1"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).weight"\r
                       (ngModelChange)="aStats(file).weight = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).ruestungsmalus ?? 0"\r
                       (ngModelChange)="aStats(file).ruestungsmalus = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).reqBase ?? 0"\r
                       (ngModelChange)="aStats(file).reqBase = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-num" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-num" type="number" min="0"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).reqScaling ?? 0"\r
                       (ngModelChange)="aStats(file).reqScaling = $event; onFieldChange(file)" />\r
              </td>\r
              <td class="c-eff" [class.mt-dim]="!mat(file).canBeArmorMaterial">\r
                <input class="mt-input"\r
                       type="text"\r
                       [disabled]="!mat(file).canBeArmorMaterial"\r
                       [ngModel]="aStats(file).extraEffect"\r
                       (ngModelChange)="aStats(file).extraEffect = $event; onFieldChange(file)"\r
                       placeholder="z.B. Feuerschutz +1" />\r
              </td>\r
\r
              <!-- Delete -->\r
              <td class="c-del">\r
                <button class="mt-del-btn" (click)="deleteMaterial(file)" title="L\xF6schen">\u2715</button>\r
              </td>\r
            </tr>\r
          }\r
        </tbody>\r
      </table>\r
    }\r
  </div>\r
</div>\r
`, styles: ["/* src/app/library-editor/material-table/material-table.component.css */\n.mt-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 1200;\n  background: #0f1117;\n  display: flex;\n  flex-direction: column;\n  font-size: 0.82rem;\n  color: #d1d5db;\n}\n.mt-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 16px;\n  background: #161b26;\n  border-bottom: 1px solid #2d3748;\n  flex-shrink: 0;\n}\n.mt-title {\n  font-weight: 700;\n  font-size: 0.95rem;\n  color: #e2e8f0;\n  letter-spacing: 0.03em;\n}\n.mt-count {\n  font-size: 0.75rem;\n  color: #6b7280;\n  background: rgba(255, 255, 255, 0.06);\n  padding: 1px 7px;\n  border-radius: 8px;\n}\n.mt-spacer {\n  flex: 1;\n}\n.mt-new-input {\n  height: 30px;\n  padding: 0 8px;\n  background: #1e293b;\n  border: 1px solid #6366f1;\n  border-radius: 4px;\n  color: #e2e8f0;\n  font-size: 0.82rem;\n  outline: none;\n  width: 200px;\n}\n.mt-add-btn {\n  padding: 5px 13px;\n  background: #8b5cf6;\n  color: white;\n  border: none;\n  border-radius: 5px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.mt-add-btn:hover {\n  background: #7c3aed;\n}\n.mt-confirm-btn {\n  padding: 4px 12px;\n  background: #059669;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  font-size: 0.8rem;\n  font-weight: 600;\n  cursor: pointer;\n}\n.mt-confirm-btn:hover {\n  background: #047857;\n}\n.mt-cancel-btn {\n  padding: 4px 9px;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 4px;\n  color: #9ca3af;\n  font-size: 0.8rem;\n  cursor: pointer;\n}\n.mt-cancel-btn:hover {\n  border-color: #9ca3af;\n  color: #e2e8f0;\n}\n.mt-close-btn {\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #9ca3af;\n  font-size: 0.8rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.mt-close-btn:hover {\n  border-color: #9ca3af;\n  color: #e2e8f0;\n}\n.mt-scroll {\n  flex: 1;\n  overflow: auto;\n}\n.mt-loading,\n.mt-empty {\n  padding: 40px;\n  text-align: center;\n  color: #6b7280;\n  font-size: 0.9rem;\n}\n.mt-table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n.mt-table thead {\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  background: #161b26;\n}\n.thead-groups th {\n  padding: 4px 4px 2px;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6b7280;\n  border-bottom: none;\n  text-align: center;\n  white-space: nowrap;\n}\n.grp-base {\n  color: #9ca3af;\n  border-right: 1px solid #2d3748;\n}\n.grp-weapon {\n  color: #60a5fa;\n  background: rgba(96, 165, 250, 0.05);\n  border-right: 1px solid #2d3748;\n}\n.grp-armor {\n  color: #a78bfa;\n  background: rgba(167, 139, 250, 0.05);\n  border-right: 1px solid #2d3748;\n}\n.mt-table th {\n  padding: 4px 3px;\n  text-align: center;\n  font-size: 0.68rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  color: #6b7280;\n  border-bottom: 2px solid #2d3748;\n  -webkit-user-select: none;\n  user-select: none;\n  white-space: nowrap;\n  overflow: hidden;\n}\n.mt-table td {\n  padding: 2px 3px;\n  border-bottom: 1px solid #1e2535;\n  vertical-align: middle;\n}\n.mt-table tr:hover td {\n  background: rgba(255, 255, 255, 0.025);\n}\n.mt-table tr.mt-saving td {\n  background: rgba(139, 92, 246, 0.07);\n}\n.mt-dim {\n  opacity: 0.28;\n}\n.mt-dim input {\n  pointer-events: none;\n}\n.c-name {\n  width: 150px;\n}\n.c-cb {\n  width: 36px;\n  text-align: center;\n}\n.c-num {\n  width: 50px;\n  text-align: center;\n}\n.c-rarity {\n  width: 80px;\n  text-align: center;\n}\n.c-eff {\n  width: 130px;\n  min-width: 100px;\n}\n.c-del {\n  width: 30px;\n  text-align: center;\n}\n.mt-rarity-sel {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  color: var(--text, #e5e7eb);\n  font-size: 0.78rem;\n  padding: 0.1rem 0.15rem;\n  cursor: pointer;\n}\n.mt-rarity-sel:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.mt-rarity-sel.rarity-rare {\n  color: #60a5fa;\n}\n.mt-rarity-sel.rarity-legendary {\n  color: #fbbf24;\n}\n.mt-table td:nth-child(6),\n.mt-table th:nth-child(6) {\n  border-right: 2px solid #1e3a5f;\n}\n.mt-table td:nth-child(14),\n.mt-table th:nth-child(14) {\n  border-right: 2px solid #2d1b69;\n}\n.mt-input {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #d1d5db;\n  font-size: 0.8rem;\n  padding: 2px 5px;\n  height: 28px;\n  outline: none;\n  transition: border-color 0.1s, background 0.1s;\n}\n.mt-input:hover:not(:disabled) {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.mt-input:focus:not(:disabled) {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.mt-num {\n  width: 100%;\n  box-sizing: border-box;\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  color: #a5b4fc;\n  font-size: 0.8rem;\n  text-align: center;\n  padding: 2px 2px;\n  height: 28px;\n  outline: none;\n  -moz-appearance: textfield;\n  appearance: textfield;\n  transition: border-color 0.1s, background 0.1s;\n}\n.mt-num::-webkit-inner-spin-button,\n.mt-num::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\n.mt-num:hover:not(:disabled) {\n  border-color: #374151;\n  background: rgba(255, 255, 255, 0.04);\n}\n.mt-num:focus:not(:disabled) {\n  border-color: #6366f1;\n  background: rgba(99, 102, 241, 0.08);\n}\n.c-cb input[type=checkbox] {\n  width: 15px;\n  height: 15px;\n  accent-color: #8b5cf6;\n  cursor: pointer;\n  display: block;\n  margin: 0 auto;\n}\n.mt-del-btn {\n  background: transparent;\n  border: none;\n  color: #6b7280;\n  font-size: 0.75rem;\n  cursor: pointer;\n  padding: 2px 4px;\n  border-radius: 3px;\n  transition: color 0.1s, background 0.1s;\n}\n.mt-del-btn:hover {\n  color: #f87171;\n  background: rgba(248, 113, 113, 0.12);\n}\n/*# sourceMappingURL=material-table.component.css.map */\n"] }]
  }], null, { libraryId: [{
    type: Input
  }], folderId: [{
    type: Input
  }], close: [{
    type: Output
  }], filesChanged: [{
    type: Output
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MaterialTableComponent, { className: "MaterialTableComponent", filePath: "app/library-editor/material-table/material-table.component.ts", lineNumber: 20 });
})();

// src/app/library-editor/library-editor.component.ts
var _c03 = ["fileInput"];
var _c1 = (a0) => ({ folder: a0, depth: 0 });
var _c2 = (a0, a1) => ({ folder: a0, depth: a1 });
var _forTrack05 = ($index, $item) => $item.id;
function LibraryEditorComponent_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 42);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_12_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.clearSearch());
    });
    \u0275\u0275text(1, "\u2715");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_22_For_17_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 56);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const otherLib_r6 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("value", otherLib_r6.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(otherLib_r6.name);
  }
}
function LibraryEditorComponent_Conditional_22_For_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, LibraryEditorComponent_Conditional_22_For_17_Conditional_0_Template, 2, 2, "option", 56);
  }
  if (rf & 2) {
    const otherLib_r6 = ctx.$implicit;
    const lib_r5 = \u0275\u0275nextContext();
    \u0275\u0275conditional(otherLib_r6.id !== lib_r5.id ? 0 : -1);
  }
}
function LibraryEditorComponent_Conditional_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 15)(1, "div", 43)(2, "div", 44)(3, "div", 45)(4, "label");
    \u0275\u0275text(5, "Beschreibung:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 46);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_22_Template_input_ngModelChange_6_listener($event) {
      const lib_r5 = \u0275\u0275restoreView(_r4);
      \u0275\u0275twoWayBindingSet(lib_r5.description, $event) || (lib_r5.description = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 45)(8, "label");
    \u0275\u0275text(9, "Tags:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 47);
    \u0275\u0275listener("change", function LibraryEditorComponent_Conditional_22_Template_input_change_10_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.updateLibraryTags($event.target.value));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "div", 44)(12, "div", 45)(13, "label");
    \u0275\u0275text(14, "\u{1F517} Abh\xE4ngigkeiten (Dependencies):");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "select", 48);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_22_Template_select_ngModelChange_15_listener($event) {
      const lib_r5 = \u0275\u0275restoreView(_r4);
      \u0275\u0275twoWayBindingSet(lib_r5.dependencies, $event) || (lib_r5.dependencies = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275repeaterCreate(16, LibraryEditorComponent_Conditional_22_For_17_Template, 1, 1, null, null, _forTrack05);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 49);
    \u0275\u0275text(19);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(20, "div", 50)(21, "label")(22, "input", 51);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_22_Template_input_ngModelChange_22_listener($event) {
      const lib_r5 = \u0275\u0275restoreView(_r4);
      \u0275\u0275twoWayBindingSet(lib_r5.isPublic, $event) || (lib_r5.isPublic = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(23, " \xD6ffentliche Bibliothek ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(24, "div", 52)(25, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_22_Template_button_click_25_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.saveLibrarySettings();
      return \u0275\u0275resetView(ctx_r2.toggleLibrarySettings());
    });
    \u0275\u0275text(26, "\u2713 Speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "button", 54);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_22_Template_button_click_27_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.loadDependencyItems());
    });
    \u0275\u0275text(28, "\u21BA Abh\xE4ngigkeiten neu laden");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_22_Template_button_click_29_listener() {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleLibrarySettings());
    });
    \u0275\u0275text(30, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const lib_r5 = ctx;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275twoWayProperty("ngModel", lib_r5.description);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", (lib_r5.tags == null ? null : lib_r5.tags.join(", ")) || "");
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", lib_r5.dependencies);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.allLibraries());
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("Halte Strg/Cmd um mehrere Bibliotheken auszuw\xE4hlen. Diese Bibliothek kann Items von ausgew\xE4hlten Bibliotheken verwenden. Geladene Items: ", ctx_r2.availableItems().length + ctx_r2.availableRunes().length + ctx_r2.availableSpells().length + ctx_r2.availableSkills().length + ctx_r2.availableStatusEffects().length);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", lib_r5.isPublic);
  }
}
function LibraryEditorComponent_For_30_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function LibraryEditorComponent_For_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, LibraryEditorComponent_For_30_ng_container_0_Template, 1, 0, "ng-container", 57);
  }
  if (rf & 2) {
    const folder_r7 = ctx.$implicit;
    \u0275\u0275nextContext();
    const folderNode_r8 = \u0275\u0275reference(65);
    \u0275\u0275property("ngTemplateOutlet", folderNode_r8)("ngTemplateOutletContext", \u0275\u0275pureFunction1(2, _c1, folder_r7));
  }
}
function LibraryEditorComponent_For_36_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 59);
    \u0275\u0275text(1, "/");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_For_36_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 58);
    \u0275\u0275listener("click", function LibraryEditorComponent_For_36_Template_button_click_0_listener() {
      const crumb_r10 = \u0275\u0275restoreView(_r9).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.navigateToFolder(crumb_r10.id));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(2, LibraryEditorComponent_For_36_Conditional_2_Template, 2, 0, "span", 59);
  }
  if (rf & 2) {
    const crumb_r10 = ctx.$implicit;
    const \u0275$index_120_r11 = ctx.$index;
    const \u0275$count_120_r12 = ctx.$count;
    \u0275\u0275classProp("current", \u0275$index_120_r11 === \u0275$count_120_r12 - 1);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", crumb_r10.name, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(!(\u0275$index_120_r11 === \u0275$count_120_r12 - 1) ? 2 : -1);
  }
}
function LibraryEditorComponent_Conditional_45_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 60);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r13);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementStart(1, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFolder());
    });
    \u0275\u0275text(2, "\u{1F4C1} Neuer Ordner");
    \u0275\u0275elementEnd();
    \u0275\u0275element(3, "hr");
    \u0275\u0275elementStart(4, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("item"));
    });
    \u0275\u0275text(5, "\u{1F4E6} Neues Item");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("spell"));
    });
    \u0275\u0275text(7, "\u{1F4D6} Neuer Zauber");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("rune"));
    });
    \u0275\u0275text(9, "\u2728 Neue Rune");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("skill"));
    });
    \u0275\u0275text(11, "\u2694\uFE0F Neue F\xE4higkeit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("status-effect"));
    });
    \u0275\u0275text(13, "\u{1F3AD} Neuer Status-Effekt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_14_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("macro"));
    });
    \u0275\u0275text(15, "\u26A1 Neues Makro");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_16_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("material"));
    });
    \u0275\u0275text(17, "\u2699\uFE0F Neues Material");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_18_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("forge-trait"));
    });
    \u0275\u0275text(19, "\u{1F525} Neues Schmiedemerkmal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_20_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("brew-trait"));
    });
    \u0275\u0275text(21, "\u2697\uFE0F Neues Braumerkmal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_22_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("ingredient"));
    });
    \u0275\u0275text(23, "\u{1F33F} Neuer Wirkstoff");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_24_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("extractor"));
    });
    \u0275\u0275text(25, "\u{1F9EA} Neuer Extraktor");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_45_Template_button_click_26_listener() {
      \u0275\u0275restoreView(_r13);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.createFile("statblock"));
    });
    \u0275\u0275text(27, "\u{1F464} Neues NSC-Statblock");
    \u0275\u0275elementEnd()();
  }
}
function LibraryEditorComponent_Conditional_46_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 30);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.clipboard.getInfo());
  }
}
function LibraryEditorComponent_Conditional_56_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 36);
    \u0275\u0275element(1, "div", 62);
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_57_For_8_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 69);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const file_r16 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 1, file_r16.data.drawing), \u0275\u0275sanitizeUrl);
  }
}
function LibraryEditorComponent_Conditional_57_For_8_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const file_r16 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275textInterpolate1(" ", file_r16.icon || ctx_r2.getAssetIcon(file_r16.type), " ");
  }
}
function LibraryEditorComponent_Conditional_57_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 67);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_57_For_8_Template_div_click_0_listener($event) {
      const file_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.selectItem(file_r16.id, false, $event));
    })("dblclick", function LibraryEditorComponent_Conditional_57_For_8_Template_div_dblclick_0_listener($event) {
      const file_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onDoubleClick(file_r16.id, false, $event));
    })("contextmenu", function LibraryEditorComponent_Conditional_57_For_8_Template_div_contextmenu_0_listener($event) {
      const file_r16 = \u0275\u0275restoreView(_r15).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.onContextMenu($event, "file", file_r16.id));
    });
    \u0275\u0275elementStart(1, "div", 68);
    \u0275\u0275conditionalCreate(2, LibraryEditorComponent_Conditional_57_For_8_Conditional_2_Template, 2, 3, "img", 69)(3, LibraryEditorComponent_Conditional_57_For_8_Conditional_3_Template, 1, 1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 70);
    \u0275\u0275text(5);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "div", 71);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const file_r16 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("selected", ctx_r2.isSelected(file_r16.id));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(file_r16.type === "rune" && (file_r16.data == null ? null : file_r16.data.drawing) ? 2 : 3);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(file_r16.name);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(file_r16.path);
  }
}
function LibraryEditorComponent_Conditional_57_ForEmpty_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 66);
    \u0275\u0275text(1, "Keine Ergebnisse gefunden");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_57_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 37)(1, "div", 63)(2, "span");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_57_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.clearSearch());
    });
    \u0275\u0275text(5, "Zur\xFCcksetzen");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 64);
    \u0275\u0275repeaterCreate(7, LibraryEditorComponent_Conditional_57_For_8_Template, 8, 5, "div", 65, _forTrack05, false, LibraryEditorComponent_Conditional_57_ForEmpty_9_Template, 2, 0, "div", 66);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1("Suchergebnisse (", ctx_r2.searchResults().length, ")");
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r2.searchResults());
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 75);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("left", ctx_r2.marqueeRect().left, "px")("top", ctx_r2.marqueeRect().top, "px")("width", ctx_r2.marqueeRect().width, "px")("height", ctx_r2.marqueeRect().height, "px");
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 84);
    \u0275\u0275listener("ngModelChange", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r20);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.renameValue.set($event));
    })("keyup.enter", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template_input_keyup_enter_0_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.confirmRename());
    })("keyup.escape", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template_input_keyup_escape_0_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelRename());
    })("blur", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template_input_blur_0_listener() {
      \u0275\u0275restoreView(_r20);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.confirmRename());
    })("click", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template_input_click_0_listener($event) {
      \u0275\u0275restoreView(_r20);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275property("ngModel", ctx_r2.renameValue());
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 82);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const folder_r19 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(folder_r19.name);
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 83);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const folder_r19 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.formatDate(folder_r19.updatedAt));
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 79);
    \u0275\u0275listener("dragstart", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_dragstart_0_listener($event) {
      const folder_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDragStart($event, folder_r19.id, true));
    })("dragend", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_dragend_0_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDragEnd($event));
    })("dragover", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_dragover_0_listener($event) {
      const folder_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDragOver($event, folder_r19.id));
    })("dragleave", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_dragleave_0_listener($event) {
      \u0275\u0275restoreView(_r18);
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDragLeave($event));
    })("drop", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_drop_0_listener($event) {
      const folder_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDrop($event, folder_r19.id));
    })("click", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_click_0_listener($event) {
      const folder_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.selectItem(folder_r19.id, true, $event));
    })("dblclick", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_dblclick_0_listener($event) {
      const folder_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDoubleClick(folder_r19.id, true, $event));
    })("contextmenu", function LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template_div_contextmenu_0_listener($event) {
      const folder_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onContextMenu($event, "folder", folder_r19.id));
    });
    \u0275\u0275elementStart(1, "div", 80);
    \u0275\u0275text(2, "\u{1F4C1}");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_3_Template, 1, 1, "input", 81)(4, LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_4_Template, 2, 1, "div", 82);
    \u0275\u0275conditionalCreate(5, LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Conditional_5_Template, 2, 1, "div", 83);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const folder_r19 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("selected", ctx_r2.isSelected(folder_r19.id))("cut", ctx_r2.isCutItem(folder_r19.id))("drag-over", ctx_r2.dragOverFolderId() === folder_r19.id)("dragging", ctx_r2.draggedIds().has(folder_r19.id));
    \u0275\u0275attribute("data-id", folder_r19.id)("data-type", "folder");
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r2.isRenaming() === folder_r19.id ? 3 : 4);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.viewMode() === "list" ? 5 : -1);
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76);
    \u0275\u0275text(1, "Ordner");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 77);
    \u0275\u0275repeaterCreate(3, LibraryEditorComponent_Conditional_58_Conditional_2_For_4_Template, 6, 12, "div", 78, _forTrack05);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("list-mode", ctx_r2.viewMode() === "list");
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.subfolders());
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 69);
    \u0275\u0275pipe(1, "imageUrl");
  }
  if (rf & 2) {
    const file_r22 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("src", \u0275\u0275pipeBind1(1, 1, file_r22.data.drawing), \u0275\u0275sanitizeUrl);
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0);
  }
  if (rf & 2) {
    const file_r22 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275textInterpolate1(" ", file_r22.icon || ctx_r2.getAssetIcon(file_r22.type), " ");
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "input", 84);
    \u0275\u0275listener("ngModelChange", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template_input_ngModelChange_0_listener($event) {
      \u0275\u0275restoreView(_r23);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.renameValue.set($event));
    })("keyup.enter", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template_input_keyup_enter_0_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.confirmRename());
    })("keyup.escape", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template_input_keyup_escape_0_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelRename());
    })("blur", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template_input_blur_0_listener() {
      \u0275\u0275restoreView(_r23);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.confirmRename());
    })("click", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template_input_click_0_listener($event) {
      \u0275\u0275restoreView(_r23);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275property("ngModel", ctx_r2.renameValue());
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 70);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const file_r22 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(file_r22.name);
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 83);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const file_r22 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.formatDate(file_r22.updatedAt));
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 86);
    \u0275\u0275listener("dragstart", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template_div_dragstart_0_listener($event) {
      const file_r22 = \u0275\u0275restoreView(_r21).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDragStart($event, file_r22.id, false));
    })("dragend", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template_div_dragend_0_listener($event) {
      \u0275\u0275restoreView(_r21);
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDragEnd($event));
    })("click", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template_div_click_0_listener($event) {
      const file_r22 = \u0275\u0275restoreView(_r21).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.selectItem(file_r22.id, false, $event));
    })("dblclick", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template_div_dblclick_0_listener($event) {
      const file_r22 = \u0275\u0275restoreView(_r21).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onDoubleClick(file_r22.id, false, $event));
    })("contextmenu", function LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template_div_contextmenu_0_listener($event) {
      const file_r22 = \u0275\u0275restoreView(_r21).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.onContextMenu($event, "file", file_r22.id));
    });
    \u0275\u0275elementStart(1, "div", 68);
    \u0275\u0275conditionalCreate(2, LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_2_Template, 2, 3, "img", 69)(3, LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_3_Template, 1, 1);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(4, LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_4_Template, 1, 1, "input", 81)(5, LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_5_Template, 2, 1, "div", 70);
    \u0275\u0275elementStart(6, "div", 87);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Conditional_8_Template, 2, 1, "div", 83);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const file_r22 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("selected", ctx_r2.isSelected(file_r22.id))("cut", ctx_r2.isCutItem(file_r22.id))("dragging", ctx_r2.draggedIds().has(file_r22.id));
    \u0275\u0275attribute("data-id", file_r22.id)("data-type", "file");
    \u0275\u0275advance(2);
    \u0275\u0275conditional(file_r22.type === "rune" && (file_r22.data == null ? null : file_r22.data.drawing) ? 2 : 3);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.isRenaming() === file_r22.id ? 4 : 5);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.getAssetTypeName(file_r22.type));
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.viewMode() === "list" ? 8 : -1);
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 76);
    \u0275\u0275text(1, "Dateien");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 64);
    \u0275\u0275repeaterCreate(3, LibraryEditorComponent_Conditional_58_Conditional_3_For_4_Template, 9, 12, "div", 85, _forTrack05);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(2);
    \u0275\u0275classProp("list-mode", ctx_r2.viewMode() === "list");
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.files());
  }
}
function LibraryEditorComponent_Conditional_58_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 74)(1, "div", 88);
    \u0275\u0275text(2, "\u{1F4C2}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 89);
    \u0275\u0275text(4, "Dieser Ordner ist leer");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 90);
    \u0275\u0275text(6, 'Klicke "Neu" um Inhalte hinzuzuf\xFCgen');
    \u0275\u0275elementEnd()();
  }
}
function LibraryEditorComponent_Conditional_58_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 72);
    \u0275\u0275listener("mousedown", function LibraryEditorComponent_Conditional_58_Template_div_mousedown_0_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onContentAreaMouseDown($event));
    });
    \u0275\u0275conditionalCreate(1, LibraryEditorComponent_Conditional_58_Conditional_1_Template, 1, 8, "div", 73);
    \u0275\u0275conditionalCreate(2, LibraryEditorComponent_Conditional_58_Conditional_2_Template, 5, 2);
    \u0275\u0275conditionalCreate(3, LibraryEditorComponent_Conditional_58_Conditional_3_Template, 5, 2);
    \u0275\u0275conditionalCreate(4, LibraryEditorComponent_Conditional_58_Conditional_4_Template, 7, 0, "div", 74);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("list-view", ctx_r2.viewMode() === "list");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.isMarqueeSelecting() && ctx_r2.marqueeRect() ? 1 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.subfolders().length > 0 ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.files().length > 0 ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.subfolders().length === 0 && ctx_r2.files().length === 0 ? 4 : -1);
  }
}
function LibraryEditorComponent_Conditional_59_Template(rf, ctx) {
  if (rf & 1) {
    const _r24 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-weapon-generator", 91);
    \u0275\u0275listener("itemCreated", function LibraryEditorComponent_Conditional_59_Template_app_weapon_generator_itemCreated_0_listener($event) {
      \u0275\u0275restoreView(_r24);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onGeneratedItemCreated($event));
    })("closePanel", function LibraryEditorComponent_Conditional_59_Template_app_weapon_generator_closePanel_0_listener() {
      \u0275\u0275restoreView(_r24);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.showWeaponGenerator.set(false));
    });
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_60_Conditional_1_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_1_Conditional_9_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r27);
      const ctx_r2 = \u0275\u0275nextContext(3);
      ctx_r2.paste();
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(1, "\u{1F4E5} Einf\xFCgen (Strg+V)");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_60_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r26 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_1_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.openItem(ctx_r2.contextMenuTarget().id);
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_1_Template_button_click_2_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.startRename(ctx_r2.contextMenuTarget().id);
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(3, "\u{1F4DD} Umbenennen");
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "hr");
    \u0275\u0275elementStart(5, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_1_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.copySelected();
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(6, "\u{1F4CB} Kopieren (Strg+C)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_1_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.cutSelected();
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(8, "\u2702\uFE0F Ausschneiden (Strg+X)");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(9, LibraryEditorComponent_Conditional_60_Conditional_1_Conditional_9_Template, 2, 0, "button");
    \u0275\u0275element(10, "hr");
    \u0275\u0275elementStart(11, "button", 93);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_1_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r26);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.deleteSelected();
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(12, "\u{1F5D1}\uFE0F L\xF6schen");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r2.contextMenuTarget().type === "folder" ? "\u{1F4C2} \xD6ffnen" : "\u270F\uFE0F Bearbeiten", " ");
    \u0275\u0275advance(8);
    \u0275\u0275conditional(ctx_r2.clipboard.canPaste() ? 9 : -1);
  }
}
function LibraryEditorComponent_Conditional_60_Conditional_2_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r29 = \u0275\u0275getCurrentView();
    \u0275\u0275element(0, "hr");
    \u0275\u0275elementStart(1, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Conditional_31_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r29);
      const ctx_r2 = \u0275\u0275nextContext(3);
      ctx_r2.paste();
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(2, "\u{1F4E5} Einf\xFCgen (Strg+V)");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_60_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFolder();
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(1, "\u{1F4C1} Neuer Ordner");
    \u0275\u0275elementEnd();
    \u0275\u0275element(2, "hr");
    \u0275\u0275elementStart(3, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("item");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(4, "\u{1F4E6} Neues Item");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("spell");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(6, "\u{1F4D6} Neuer Zauber");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("rune");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(8, "\u2728 Neue Rune");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_9_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("skill");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(10, "\u2694\uFE0F Neue F\xE4higkeit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_11_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("status-effect");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(12, "\u{1F3AD} Neuer Status-Effekt");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("macro");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(14, "\u26A1 Neues Makro");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_15_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("material");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(16, "\u2699\uFE0F Neues Material");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_17_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("forge-trait");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(18, "\u{1F525} Neues Schmiedemerkmal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("brew-trait");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(20, "\u2697\uFE0F Neues Braumerkmal");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("ingredient");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(22, "\u{1F33F} Neuer Wirkstoff");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_23_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("extractor");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(24, "\u{1F9EA} Neuer Extraktor");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_25_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("shop");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(26, "\u{1F3EA} Neuer Handel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(27, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_27_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("loot-bundle");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(28, "\u{1F4B0} Neue Beute");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "button", 61);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Conditional_2_Template_button_click_29_listener() {
      \u0275\u0275restoreView(_r28);
      const ctx_r2 = \u0275\u0275nextContext(2);
      ctx_r2.createFile("statblock");
      return \u0275\u0275resetView(ctx_r2.closeContextMenu());
    });
    \u0275\u0275text(30, "\u{1F464} Neues NSC-Statblock");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(31, LibraryEditorComponent_Conditional_60_Conditional_2_Conditional_31_Template, 3, 0);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(31);
    \u0275\u0275conditional(ctx_r2.clipboard.canPaste() ? 31 : -1);
  }
}
function LibraryEditorComponent_Conditional_60_Template(rf, ctx) {
  if (rf & 1) {
    const _r25 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 92);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_60_Template_div_click_0_listener($event) {
      \u0275\u0275restoreView(_r25);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275conditionalCreate(1, LibraryEditorComponent_Conditional_60_Conditional_1_Template, 13, 2)(2, LibraryEditorComponent_Conditional_60_Conditional_2_Template, 32, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("left", ctx_r2.contextMenuPosition().x, "px")("top", ctx_r2.contextMenuPosition().y, "px");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.contextMenuTarget() ? 1 : 2);
  }
}
function LibraryEditorComponent_Conditional_61_Case_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r31 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-item-editor", 111);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_8_Template_app_item_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r31);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_8_Template_app_item_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r31);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("item", ctx_r2.editingFile().data)("sheet", ctx_r2.dummySheet);
  }
}
function LibraryEditorComponent_Conditional_61_Case_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r32 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-rune-editor", 112);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_9_Template_app_rune_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r32);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_9_Template_app_rune_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r32);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("rune", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-spell-editor-overlay", 113);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_10_Template_app_spell_editor_overlay_save_0_listener($event) {
      \u0275\u0275restoreView(_r33);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event, false));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_10_Template_app_spell_editor_overlay_cancel_0_listener() {
      \u0275\u0275restoreView(_r33);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    })("deleteSpell", function LibraryEditorComponent_Conditional_61_Case_10_Template_app_spell_editor_overlay_deleteSpell_0_listener() {
      \u0275\u0275restoreView(_r33);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("spell", ctx_r2.editingFile().data)("availableRunes", ctx_r2.availableRunesAsBlocks);
  }
}
function LibraryEditorComponent_Conditional_61_Case_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r34 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-skill-editor", 114);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_11_Template_app_skill_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r34);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_11_Template_app_skill_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r34);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("skill", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r35 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-status-effect-editor", 115);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_12_Template_app_status_effect_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_12_Template_app_status_effect_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r35);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("statusEffect", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_13_Template(rf, ctx) {
  if (rf & 1) {
    const _r36 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-macro-editor", 116);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_13_Template_app_macro_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r36);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_13_Template_app_macro_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("macro", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r37 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-material-editor", 117);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_14_Template_app_material_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_14_Template_app_material_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r37);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("material", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r38 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-forge-trait-editor", 118);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_15_Template_app_forge_trait_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r38);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_15_Template_app_forge_trait_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r38);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("trait", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r39 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-brew-trait-editor", 118);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_16_Template_app_brew_trait_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r39);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_16_Template_app_brew_trait_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r39);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("trait", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_17_Template(rf, ctx) {
  if (rf & 1) {
    const _r40 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-ingredient-editor", 119);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_17_Template_app_ingredient_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r40);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_17_Template_app_ingredient_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r40);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("ingredient", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r41 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-extractor-editor", 120);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_18_Template_app_extractor_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_18_Template_app_extractor_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r41);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("extractor", ctx_r2.editingFile().data);
  }
}
function LibraryEditorComponent_Conditional_61_Case_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r42 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-npc-editor", 121);
    \u0275\u0275listener("save", function LibraryEditorComponent_Conditional_61_Case_19_Template_app_npc_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r42);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor($event));
    })("cancel", function LibraryEditorComponent_Conditional_61_Case_19_Template_app_npc_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r42);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275property("statblock", ctx_r2.editingFile().data)("availableSpells", ctx_r2.availableSpells())("availableItems", ctx_r2.availableItems())("availableSkills", ctx_r2.availableSkills())("availableRunes", ctx_r2.availableRunesAsBlocks)("availableMaterials", ctx_r2.availableMaterials())("availableForgeTraits", ctx_r2.availableForgeTraits());
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r44 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 129)(1, "h5");
    \u0275\u0275text(2, "W\xE4hle Deal-Modus");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_1_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r44);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingDeal());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 130)(6, "button", 131);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_1_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r44);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealMode("sell"));
    });
    \u0275\u0275elementStart(7, "span", 132);
    \u0275\u0275text(8, "\u{1F6CD}\uFE0F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span", 133);
    \u0275\u0275text(10, "Handel Verkauft");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span", 134);
    \u0275\u0275text(12, "Spieler kauft vom Handel");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "button", 135);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_1_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r44);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealMode("buy"));
    });
    \u0275\u0275elementStart(14, "span", 132);
    \u0275\u0275text(15, "\u{1F4B0}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "span", 133);
    \u0275\u0275text(17, "Handel Kauft An");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "span", 134);
    \u0275\u0275text(19, "Spieler verkauft an Handel");
    \u0275\u0275elementEnd()()();
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r45 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 129)(1, "h5");
    \u0275\u0275text(2, "W\xE4hle Item-Typ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingDeal());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 136)(6, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealItemType("item"));
    });
    \u0275\u0275text(7, "\u{1F4E6} Item");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealItemType("rune"));
    });
    \u0275\u0275text(9, "\u2728 Rune");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealItemType("spell"));
    });
    \u0275\u0275text(11, "\u{1F4D6} Zauber");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealItemType("skill"));
    });
    \u0275\u0275text(13, "\u2694\uFE0F Talent");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template_button_click_14_listener() {
      \u0275\u0275restoreView(_r45);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectDealItemType("status-effect"));
    });
    \u0275\u0275text(15, "\u{1F3AD} Status");
    \u0275\u0275elementEnd()();
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_11_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r47 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275property("selected", ctx_r2.selectedDealItemId() === item_r47.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r47.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_11_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275repeater(ctx_r2.availableItems());
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_12_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r48 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275property("selected", ctx_r2.selectedDealItemId() === rune_r48.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(rune_r48.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_12_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275repeater(ctx_r2.availableRunes());
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_13_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r49 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275property("selected", ctx_r2.selectedDealItemId() === spell_r49.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(spell_r49.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_13_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275repeater(ctx_r2.availableSpells());
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_14_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r50 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275property("selected", ctx_r2.selectedDealItemId() === skill_r50.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(skill_r50.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_14_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275repeater(ctx_r2.availableSkills());
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_15_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const status_r51 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275property("selected", ctx_r2.selectedDealItemId() === status_r51.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(status_r51.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_15_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275repeater(ctx_r2.availableStatusEffects());
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r52 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 122)(1, "label");
    \u0275\u0275text(2, "Deal Name:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 141);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_3_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().name, $event) || (ctx_r2.editingDealData().name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 122)(5, "label");
    \u0275\u0275text(6, "Preis:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 142)(8, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.platinum, $event) || (ctx_r2.editingDealData().price.platinum = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(9, "span");
    \u0275\u0275text(10, "p");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_11_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.gold, $event) || (ctx_r2.editingDealData().price.gold = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "span");
    \u0275\u0275text(13, "g");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_14_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.silver, $event) || (ctx_r2.editingDealData().price.silver = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "span");
    \u0275\u0275text(16, "s");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_17_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.copper, $event) || (ctx_r2.editingDealData().price.copper = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "span");
    \u0275\u0275text(19, "c");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(20, "div", 144)(21, "label")(22, "input", 51);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_22_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().isNegotiable, $event) || (ctx_r2.editingDealData().isNegotiable = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(23, " Verhandelbar");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "label")(25, "input", 145);
    \u0275\u0275listener("change", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_change_25_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r2.editingDealData().identified = $event.target.checked);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(26, " Identifiziert (Spieler sehen Details)");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(27, "div", 122)(28, "label");
    \u0275\u0275text(29, "Bestand (leer = unbegrenzt):");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(30, "input", 146);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_input_ngModelChange_30_listener($event) {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().quantity, $event) || (ctx_r2.editingDealData().quantity = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "div", 128)(32, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_button_click_32_listener() {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r2.saveDealToShop());
    });
    \u0275\u0275text(33, "\u{1F4BE} Deal speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template_button_click_34_listener() {
      \u0275\u0275restoreView(_r52);
      const ctx_r2 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r2.cancelAddingDeal());
    });
    \u0275\u0275text(35, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().name);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.platinum);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.gold);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.silver);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.copper);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().isNegotiable);
    \u0275\u0275advance(3);
    \u0275\u0275property("checked", ctx_r2.editingDealData().identified !== false);
    \u0275\u0275advance(5);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().quantity);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r46 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 129)(1, "h5");
    \u0275\u0275text(2, "Deal konfigurieren (Verkauf)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r46);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingDeal());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 122)(6, "label");
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "select", 138);
    \u0275\u0275listener("change", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Template_select_change_8_listener($event) {
      \u0275\u0275restoreView(_r46);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.onDealItemSelected($event));
    });
    \u0275\u0275elementStart(9, "option", 139);
    \u0275\u0275text(10, "-- Ausw\xE4hlen --");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(11, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_11_Template, 2, 0);
    \u0275\u0275conditionalCreate(12, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_12_Template, 2, 0);
    \u0275\u0275conditionalCreate(13, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_13_Template, 2, 0);
    \u0275\u0275conditionalCreate(14, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_14_Template, 2, 0);
    \u0275\u0275conditionalCreate(15, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_15_Template, 2, 0);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(16, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Conditional_16_Template, 36, 8);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(7);
    \u0275\u0275textInterpolate1("", ctx_r2.selectedDealItemType() === "item" ? "Item" : ctx_r2.selectedDealItemType() === "rune" ? "Rune" : ctx_r2.selectedDealItemType() === "spell" ? "Zauber" : ctx_r2.selectedDealItemType() === "skill" ? "Fertigkeit" : "Status-Effekt", " ausw\xE4hlen:");
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r2.selectedDealItemType() === "item" ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedDealItemType() === "rune" ? 12 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedDealItemType() === "spell" ? 13 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedDealItemType() === "skill" ? 14 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedDealItemType() === "status-effect" ? 15 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedDealItemId() ? 16 : -1);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r53 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 129)(1, "h5");
    \u0275\u0275text(2, "Ankauf konfigurieren");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingDeal());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 122)(6, "label");
    \u0275\u0275text(7, "Ankauf-Titel:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "input", 147);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_input_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().name, $event) || (ctx_r2.editingDealData().name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 122)(10, "label");
    \u0275\u0275text(11, "Beschreibung (was der Shop ankauft):");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "textarea", 148);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_textarea_ngModelChange_12_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().reverseDescription, $event) || (ctx_r2.editingDealData().reverseDescription = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "small", 149);
    \u0275\u0275text(14, "Diese Beschreibung sehen Spieler. Sei vage oder spezifisch nach Bedarf.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "div", 122)(16, "label");
    \u0275\u0275text(17, "Ankaufspreis:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 142)(19, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_input_ngModelChange_19_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.platinum, $event) || (ctx_r2.editingDealData().price.platinum = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "span");
    \u0275\u0275text(21, "p");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_input_ngModelChange_22_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.gold, $event) || (ctx_r2.editingDealData().price.gold = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "span");
    \u0275\u0275text(24, "g");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_input_ngModelChange_25_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.silver, $event) || (ctx_r2.editingDealData().price.silver = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "span");
    \u0275\u0275text(27, "s");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_input_ngModelChange_28_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().price.copper, $event) || (ctx_r2.editingDealData().price.copper = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(29, "span");
    \u0275\u0275text(30, "c");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "small", 149);
    \u0275\u0275text(32, "Preis, den der Shop pro St\xFCck zahlt.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "div", 144)(34, "label")(35, "input", 51);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_input_ngModelChange_35_listener($event) {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingDealData().isNegotiable, $event) || (ctx_r2.editingDealData().isNegotiable = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(36, " Verhandelbar");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(37, "div", 128)(38, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_button_click_38_listener() {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.saveDealToShop());
    });
    \u0275\u0275text(39, "\u{1F4BE} Ankauf speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(40, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template_button_click_40_listener() {
      \u0275\u0275restoreView(_r53);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingDeal());
    });
    \u0275\u0275text(41, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(8);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().name);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().reverseDescription);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.platinum);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.gold);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.silver);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().price.copper);
    \u0275\u0275advance(7);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingDealData().isNegotiable);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 127);
    \u0275\u0275conditionalCreate(1, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_1_Template, 20, 0)(2, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_2_Template, 16, 0)(3, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_3_Template, 17, 7)(4, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Conditional_4_Template, 42, 7);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.dealMode() ? 1 : ctx_r2.dealMode() === "sell" && !ctx_r2.editingDealData() ? 2 : ctx_r2.dealMode() === "sell" && ctx_r2.editingDealData() ? 3 : ctx_r2.dealMode() === "buy" ? 4 : -1);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 161);
    \u0275\u0275text(1, "\u{1F4AC} Verhandelbar");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 162);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const deal_r56 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r2.formatCurrency(deal_r56.price));
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 163);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const deal_r56 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u{1F4E6} ", deal_r56.quantity);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 164);
    \u0275\u0275text(1, "\u2B05 Ankauf");
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r55 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 155)(1, "div", 156)(2, "span", 157);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 158)(5, "span", 159);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 160);
    \u0275\u0275conditionalCreate(8, LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_8_Template, 2, 0, "span", 161)(9, LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_9_Template, 2, 1, "span", 162);
    \u0275\u0275conditionalCreate(10, LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_10_Template, 2, 1, "span", 163);
    \u0275\u0275conditionalCreate(11, LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Conditional_11_Template, 2, 0, "span", 164);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(12, "button", 165);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Template_button_click_12_listener() {
      const deal_r56 = \u0275\u0275restoreView(_r55).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.removeDealFromShop(deal_r56.id));
    });
    \u0275\u0275text(13, "\u2715");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const deal_r56 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275classProp("reverse", deal_r56.isReverseDeal);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.getDealItemIcon(deal_r56));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.getDealItemName(deal_r56));
    \u0275\u0275advance(2);
    \u0275\u0275conditional(deal_r56.isNegotiable ? 8 : deal_r56.price ? 9 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(deal_r56.quantity !== void 0 ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(deal_r56.isReverseDeal ? 11 : -1);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    const _r54 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 150)(1, "span", 151);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "label", 152)(4, "input", 145);
    \u0275\u0275listener("change", function LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_Template_input_change_4_listener($event) {
      \u0275\u0275restoreView(_r54);
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.setAllDealsIdentified($event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275text(5, " Alle identifiziert ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 153);
    \u0275\u0275repeaterCreate(7, LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_For_8_Template, 14, 7, "div", 154, _forTrack05);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r2.editingFile().data.deals.length, " Deal(s)");
    \u0275\u0275advance(2);
    \u0275\u0275property("checked", ctx_r2.allDealsIdentified());
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r2.editingFile().data.deals);
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 90);
    \u0275\u0275text(1, 'Keine Deals vorhanden. Klicke auf "+ Deal" um einen hinzuzuf\xFCgen.');
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_61_Case_20_Template(rf, ctx) {
  if (rf & 1) {
    const _r43 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 109)(1, "div", 122)(2, "label");
    \u0275\u0275text(3, "Shop Name:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 123);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r43);
      const ctx_r2 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingFile().data.name, $event) || (ctx_r2.editingFile().data.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 122)(6, "label");
    \u0275\u0275text(7, "Beschreibung:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "textarea", 124);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_20_Template_textarea_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r43);
      const ctx_r2 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingFile().data.description, $event) || (ctx_r2.editingFile().data.description = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 125)(10, "div", 76)(11, "h4");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "button", 126);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r43);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.startAddingDealToShop());
    });
    \u0275\u0275text(14, "+ Deal");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(15, LibraryEditorComponent_Conditional_61_Case_20_Conditional_15_Template, 5, 1, "div", 127);
    \u0275\u0275conditionalCreate(16, LibraryEditorComponent_Conditional_61_Case_20_Conditional_16_Template, 9, 2)(17, LibraryEditorComponent_Conditional_61_Case_20_Conditional_17_Template, 2, 0, "p", 90);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 128)(19, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r43);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor(ctx_r2.editingFile().data));
    });
    \u0275\u0275text(20, "\u2713 Speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_20_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r43);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275text(22, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_5_0;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingFile().data.name);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingFile().data.description);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Deals (", ((tmp_5_0 = ctx_r2.editingFile().data.deals) == null ? null : tmp_5_0.length) || 0, ")");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r2.addingDealToShop());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.addingDealToShop() ? 15 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.editingFile().data.deals && ctx_r2.editingFile().data.deals.length > 0 ? 16 : !ctx_r2.addingDealToShop() ? 17 : -1);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r58 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 129)(1, "h5");
    \u0275\u0275text(2, "W\xE4hle Item-Typ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingLootItem());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 136)(6, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectLootItemType("item"));
    });
    \u0275\u0275text(7, "\u{1F4E6} Item");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectLootItemType("rune"));
    });
    \u0275\u0275text(9, "\u2728 Rune");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectLootItemType("spell"));
    });
    \u0275\u0275text(11, "\u{1F4D6} Zauber");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectLootItemType("skill"));
    });
    \u0275\u0275text(13, "\u2694\uFE0F Talent");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_14_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectLootItemType("status-effect"));
    });
    \u0275\u0275text(15, "\u{1F3AD} Status");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "button", 137);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template_button_click_16_listener() {
      \u0275\u0275restoreView(_r58);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.selectLootItemType("currency"));
    });
    \u0275\u0275text(17, "\u{1F4B0} W\xE4hrung");
    \u0275\u0275elementEnd()();
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r60 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 122)(1, "label");
    \u0275\u0275text(2, "W\xE4hrung:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 142)(4, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r60);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingLootItemData().data.platinum, $event) || (ctx_r2.editingLootItemData().data.platinum = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6, "p");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template_input_ngModelChange_7_listener($event) {
      \u0275\u0275restoreView(_r60);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingLootItemData().data.gold, $event) || (ctx_r2.editingLootItemData().data.gold = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span");
    \u0275\u0275text(9, "g");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template_input_ngModelChange_10_listener($event) {
      \u0275\u0275restoreView(_r60);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingLootItemData().data.silver, $event) || (ctx_r2.editingLootItemData().data.silver = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "span");
    \u0275\u0275text(12, "s");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "input", 143);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template_input_ngModelChange_13_listener($event) {
      \u0275\u0275restoreView(_r60);
      const ctx_r2 = \u0275\u0275nextContext(5);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingLootItemData().data.copper, $event) || (ctx_r2.editingLootItemData().data.copper = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "span");
    \u0275\u0275text(15, "c");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(16, "div", 128)(17, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template_button_click_17_listener() {
      \u0275\u0275restoreView(_r60);
      const ctx_r2 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r2.saveLootItemToBundle());
    });
    \u0275\u0275text(18, "\u{1F4BE} Item hinzuf\xFCgen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r60);
      const ctx_r2 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r2.cancelAddingLootItem());
    });
    \u0275\u0275text(20, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingLootItemData().data.platinum);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingLootItemData().data.gold);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingLootItemData().data.silver);
    \u0275\u0275advance(3);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingLootItemData().data.copper);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_6_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r62 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(7);
    \u0275\u0275property("selected", ctx_r2.selectedLootItemId() === item_r62.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r62.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_6_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275repeater(ctx_r2.availableItems());
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_7_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rune_r63 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(7);
    \u0275\u0275property("selected", ctx_r2.selectedLootItemId() === rune_r63.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(rune_r63.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_7_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275repeater(ctx_r2.availableRunes());
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_8_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const spell_r64 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(7);
    \u0275\u0275property("selected", ctx_r2.selectedLootItemId() === spell_r64.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(spell_r64.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_8_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275repeater(ctx_r2.availableSpells());
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_9_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const skill_r65 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(7);
    \u0275\u0275property("selected", ctx_r2.selectedLootItemId() === skill_r65.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(skill_r65.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_9_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275repeater(ctx_r2.availableSkills());
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_10_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 140);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const status_r66 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(7);
    \u0275\u0275property("selected", ctx_r2.selectedLootItemId() === status_r66.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(status_r66.name);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_10_For_1_Template, 2, 2, "option", 140, _forTrack05);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(6);
    \u0275\u0275repeater(ctx_r2.availableStatusEffects());
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r67 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 128)(1, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_11_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r67);
      const ctx_r2 = \u0275\u0275nextContext(6);
      return \u0275\u0275resetView(ctx_r2.saveLootItemToBundle());
    });
    \u0275\u0275text(2, "\u{1F4BE} Item hinzuf\xFCgen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_11_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r67);
      const ctx_r2 = \u0275\u0275nextContext(6);
      return \u0275\u0275resetView(ctx_r2.cancelAddingLootItem());
    });
    \u0275\u0275text(4, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()();
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r61 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 122)(1, "label");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 138);
    \u0275\u0275listener("change", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Template_select_change_3_listener($event) {
      \u0275\u0275restoreView(_r61);
      const ctx_r2 = \u0275\u0275nextContext(5);
      return \u0275\u0275resetView(ctx_r2.onLootItemSelected($event));
    });
    \u0275\u0275elementStart(4, "option", 139);
    \u0275\u0275text(5, "-- Ausw\xE4hlen --");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(6, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_6_Template, 2, 0);
    \u0275\u0275conditionalCreate(7, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_7_Template, 2, 0);
    \u0275\u0275conditionalCreate(8, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_8_Template, 2, 0);
    \u0275\u0275conditionalCreate(9, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_9_Template, 2, 0);
    \u0275\u0275conditionalCreate(10, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_10_Template, 2, 0);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(11, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Conditional_11_Template, 5, 0, "div", 128);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(5);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r2.selectedLootItemType() === "item" ? "Item" : ctx_r2.selectedLootItemType() === "rune" ? "Rune" : ctx_r2.selectedLootItemType() === "spell" ? "Zauber" : ctx_r2.selectedLootItemType() === "skill" ? "Fertigkeit" : "Status-Effekt", " ausw\xE4hlen:");
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r2.selectedLootItemType() === "item" ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedLootItemType() === "rune" ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedLootItemType() === "spell" ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedLootItemType() === "skill" ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedLootItemType() === "status-effect" ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.selectedLootItemId() ? 11 : -1);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r59 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 129)(1, "h5");
    \u0275\u0275text(2, "Loot Item konfigurieren");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r59);
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.cancelAddingLootItem());
    });
    \u0275\u0275text(4, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(5, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_5_Template, 21, 4)(6, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Conditional_6_Template, 12, 7);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(5);
    \u0275\u0275conditional(ctx_r2.selectedLootItemType() === "currency" ? 5 : 6);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 169);
    \u0275\u0275conditionalCreate(1, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_1_Template, 18, 0)(2, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Conditional_2_Template, 7, 1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275conditional(!ctx_r2.editingLootItemData() ? 1 : 2);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_16_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r68 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 171)(1, "div", 172)(2, "span", 173);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "div", 174)(5, "span", 175);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 176);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "button", 165);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Conditional_16_For_2_Template_button_click_9_listener() {
      const lootItem_r69 = \u0275\u0275restoreView(_r68).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r2.removeLootItemFromBundle(lootItem_r69.id));
    });
    \u0275\u0275text(10, "\u2715");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const lootItem_r69 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.getLootItemIcon(lootItem_r69));
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(ctx_r2.getLootItemName(lootItem_r69));
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(lootItem_r69.type);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 170);
    \u0275\u0275repeaterCreate(1, LibraryEditorComponent_Conditional_61_Case_21_Conditional_16_For_2_Template, 11, 3, "div", 171, _forTrack05);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.editingFile().data.items);
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 90);
    \u0275\u0275text(1, 'Keine Items vorhanden. Klicke auf "+ Item" um eines hinzuzuf\xFCgen.');
    \u0275\u0275elementEnd();
  }
}
function LibraryEditorComponent_Conditional_61_Case_21_Template(rf, ctx) {
  if (rf & 1) {
    const _r57 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 110)(1, "div", 122)(2, "label");
    \u0275\u0275text(3, "Bundle Name:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 166);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_21_Template_input_ngModelChange_4_listener($event) {
      \u0275\u0275restoreView(_r57);
      const ctx_r2 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingFile().data.name, $event) || (ctx_r2.editingFile().data.name = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 122)(6, "label");
    \u0275\u0275text(7, "Beschreibung:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "textarea", 167);
    \u0275\u0275twoWayListener("ngModelChange", function LibraryEditorComponent_Conditional_61_Case_21_Template_textarea_ngModelChange_8_listener($event) {
      \u0275\u0275restoreView(_r57);
      const ctx_r2 = \u0275\u0275nextContext(2);
      \u0275\u0275twoWayBindingSet(ctx_r2.editingFile().data.description, $event) || (ctx_r2.editingFile().data.description = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 168)(10, "div", 76)(11, "h4");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "button", 126);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Template_button_click_13_listener() {
      \u0275\u0275restoreView(_r57);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.startAddingLootToBundle());
    });
    \u0275\u0275text(14, "+ Item");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(15, LibraryEditorComponent_Conditional_61_Case_21_Conditional_15_Template, 3, 1, "div", 169);
    \u0275\u0275conditionalCreate(16, LibraryEditorComponent_Conditional_61_Case_21_Conditional_16_Template, 3, 0, "div", 170)(17, LibraryEditorComponent_Conditional_61_Case_21_Conditional_17_Template, 2, 0, "p", 90);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "div", 128)(19, "button", 53);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Template_button_click_19_listener() {
      \u0275\u0275restoreView(_r57);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.saveEditor(ctx_r2.editingFile().data));
    });
    \u0275\u0275text(20, "\u2713 Speichern");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(21, "button", 55);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Case_21_Template_button_click_21_listener() {
      \u0275\u0275restoreView(_r57);
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275text(22, "\u2715 Abbrechen");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_5_0;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingFile().data.name);
    \u0275\u0275advance(4);
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editingFile().data.description);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Loot Items (", ((tmp_5_0 = ctx_r2.editingFile().data.items) == null ? null : tmp_5_0.length) || 0, ")");
    \u0275\u0275advance();
    \u0275\u0275property("disabled", ctx_r2.addingLootToBundle());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.addingLootToBundle() ? 15 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.editingFile().data.items && ctx_r2.editingFile().data.items.length > 0 ? 16 : !ctx_r2.addingLootToBundle() ? 17 : -1);
  }
}
function LibraryEditorComponent_Conditional_61_Template(rf, ctx) {
  if (rf & 1) {
    const _r30 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 40)(1, "div", 94)(2, "div", 95)(3, "span");
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 96);
    \u0275\u0275listener("click", function LibraryEditorComponent_Conditional_61_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r30);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.closeEditor());
    });
    \u0275\u0275text(6, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 97);
    \u0275\u0275conditionalCreate(8, LibraryEditorComponent_Conditional_61_Case_8_Template, 1, 2, "app-item-editor", 98)(9, LibraryEditorComponent_Conditional_61_Case_9_Template, 1, 1, "app-rune-editor", 99)(10, LibraryEditorComponent_Conditional_61_Case_10_Template, 1, 2, "app-spell-editor-overlay", 100)(11, LibraryEditorComponent_Conditional_61_Case_11_Template, 1, 1, "app-skill-editor", 101)(12, LibraryEditorComponent_Conditional_61_Case_12_Template, 1, 1, "app-status-effect-editor", 102)(13, LibraryEditorComponent_Conditional_61_Case_13_Template, 1, 1, "app-macro-editor", 103)(14, LibraryEditorComponent_Conditional_61_Case_14_Template, 1, 1, "app-material-editor", 104)(15, LibraryEditorComponent_Conditional_61_Case_15_Template, 1, 1, "app-forge-trait-editor", 105)(16, LibraryEditorComponent_Conditional_61_Case_16_Template, 1, 1, "app-brew-trait-editor", 105)(17, LibraryEditorComponent_Conditional_61_Case_17_Template, 1, 1, "app-ingredient-editor", 106)(18, LibraryEditorComponent_Conditional_61_Case_18_Template, 1, 1, "app-extractor-editor", 107)(19, LibraryEditorComponent_Conditional_61_Case_19_Template, 1, 7, "app-npc-editor", 108)(20, LibraryEditorComponent_Conditional_61_Case_20_Template, 23, 6, "div", 109)(21, LibraryEditorComponent_Conditional_61_Case_21_Template, 23, 6, "div", 110);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    let tmp_3_0;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate2("", ctx_r2.getAssetIcon(ctx_r2.editingType()), " ", ctx_r2.getAssetTypeName(ctx_r2.editingType()), " bearbeiten");
    \u0275\u0275advance(4);
    \u0275\u0275conditional((tmp_3_0 = ctx_r2.editingType()) === "item" ? 8 : tmp_3_0 === "rune" ? 9 : tmp_3_0 === "spell" ? 10 : tmp_3_0 === "skill" ? 11 : tmp_3_0 === "status-effect" ? 12 : tmp_3_0 === "macro" ? 13 : tmp_3_0 === "material" ? 14 : tmp_3_0 === "forge-trait" ? 15 : tmp_3_0 === "brew-trait" ? 16 : tmp_3_0 === "ingredient" ? 17 : tmp_3_0 === "extractor" ? 18 : tmp_3_0 === "statblock" ? 19 : tmp_3_0 === "shop" ? 20 : tmp_3_0 === "loot-bundle" ? 21 : -1);
  }
}
function LibraryEditorComponent_Conditional_62_Template(rf, ctx) {
  if (rf & 1) {
    const _r70 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-rune-table", 177);
    \u0275\u0275listener("close", function LibraryEditorComponent_Conditional_62_Template_app_rune_table_close_0_listener() {
      \u0275\u0275restoreView(_r70);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.showRuneTable.set(false));
    })("filesChanged", function LibraryEditorComponent_Conditional_62_Template_app_rune_table_filesChanged_0_listener() {
      \u0275\u0275restoreView(_r70);
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.loadFolderContents();
      return \u0275\u0275resetView(ctx_r2.loadDependencyItems());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("libraryId", ctx_r2.libraryId())("folderId", ctx_r2.currentFolderId());
  }
}
function LibraryEditorComponent_Conditional_63_Template(rf, ctx) {
  if (rf & 1) {
    const _r71 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-material-table", 177);
    \u0275\u0275listener("close", function LibraryEditorComponent_Conditional_63_Template_app_material_table_close_0_listener() {
      \u0275\u0275restoreView(_r71);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.showMaterialTable.set(false));
    })("filesChanged", function LibraryEditorComponent_Conditional_63_Template_app_material_table_filesChanged_0_listener() {
      \u0275\u0275restoreView(_r71);
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.loadFolderContents();
      return \u0275\u0275resetView(ctx_r2.loadDependencyItems());
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275property("libraryId", ctx_r2.libraryId())("folderId", ctx_r2.currentFolderId());
  }
}
function LibraryEditorComponent_ng_template_64_Conditional_7_For_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainer(0);
  }
}
function LibraryEditorComponent_ng_template_64_Conditional_7_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275template(0, LibraryEditorComponent_ng_template_64_Conditional_7_For_1_ng_container_0_Template, 1, 0, "ng-container", 57);
  }
  if (rf & 2) {
    const child_r74 = ctx.$implicit;
    const depth_r75 = \u0275\u0275nextContext(2).depth;
    \u0275\u0275nextContext();
    const folderNode_r8 = \u0275\u0275reference(65);
    \u0275\u0275property("ngTemplateOutlet", folderNode_r8)("ngTemplateOutletContext", \u0275\u0275pureFunction2(2, _c2, child_r74, depth_r75 + 1));
  }
}
function LibraryEditorComponent_ng_template_64_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, LibraryEditorComponent_ng_template_64_Conditional_7_For_1_Template, 1, 5, "ng-container", null, _forTrack05);
  }
  if (rf & 2) {
    const folder_r73 = \u0275\u0275nextContext().folder;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275repeater(ctx_r2.getChildFolders(folder_r73.id));
  }
}
function LibraryEditorComponent_ng_template_64_Template(rf, ctx) {
  if (rf & 1) {
    const _r72 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 178)(1, "button", 179);
    \u0275\u0275listener("click", function LibraryEditorComponent_ng_template_64_Template_button_click_1_listener($event) {
      const folder_r73 = \u0275\u0275restoreView(_r72).folder;
      const ctx_r2 = \u0275\u0275nextContext();
      ctx_r2.toggleFolderExpand(folder_r73.id);
      return \u0275\u0275resetView($event.stopPropagation());
    });
    \u0275\u0275text(2, " \u25B6 ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 180);
    \u0275\u0275text(4, "\u{1F4C1}");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 181);
    \u0275\u0275listener("click", function LibraryEditorComponent_ng_template_64_Template_span_click_5_listener() {
      const folder_r73 = \u0275\u0275restoreView(_r72).folder;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.navigateToFolder(folder_r73.id));
    });
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(7, LibraryEditorComponent_ng_template_64_Conditional_7_Template, 2, 0);
  }
  if (rf & 2) {
    const folder_r73 = ctx.folder;
    const depth_r75 = ctx.depth;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275styleProp("padding-left", depth_r75 * 16 + 8, "px");
    \u0275\u0275classProp("selected", ctx_r2.currentFolderId() === folder_r73.id);
    \u0275\u0275advance();
    \u0275\u0275classProp("expanded", ctx_r2.isFolderExpanded(folder_r73.id))("hidden", ctx_r2.getChildFolders(folder_r73.id).length === 0);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate1(" ", folder_r73.name, " ");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.isFolderExpanded(folder_r73.id) ? 7 : -1);
  }
}
var LibraryEditorComponent = class _LibraryEditorComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  api = inject(AssetBrowserApiService);
  clipboard = inject(AssetClipboardService);
  fileInput;
  // Library state
  libraryId = signal("", ...ngDevMode ? [{ debugName: "libraryId" }] : []);
  library = signal(null, ...ngDevMode ? [{ debugName: "library" }] : []);
  // Navigation state
  currentFolderId = signal("root", ...ngDevMode ? [{ debugName: "currentFolderId" }] : []);
  folderContents = signal(null, ...ngDevMode ? [{ debugName: "folderContents" }] : []);
  breadcrumbs = computed(() => this.folderContents()?.breadcrumbs ?? [], ...ngDevMode ? [{ debugName: "breadcrumbs" }] : []);
  subfolders = computed(() => {
    const contents = this.folderContents();
    if (!contents)
      return [];
    return this.sortItems(contents.subfolders, "folder");
  }, ...ngDevMode ? [{ debugName: "subfolders" }] : []);
  files = computed(() => {
    const contents = this.folderContents();
    if (!contents)
      return [];
    return this.sortItems(contents.files, "file");
  }, ...ngDevMode ? [{ debugName: "files" }] : []);
  // Selection state
  selectedIds = signal(/* @__PURE__ */ new Set(), ...ngDevMode ? [{ debugName: "selectedIds" }] : []);
  lastSelectedId = signal(null, ...ngDevMode ? [{ debugName: "lastSelectedId" }] : []);
  isSelectionFolder = signal(false, ...ngDevMode ? [{ debugName: "isSelectionFolder" }] : []);
  // View options
  viewMode = signal("grid", ...ngDevMode ? [{ debugName: "viewMode" }] : []);
  sortOptions = signal({ field: "name", direction: "asc" }, ...ngDevMode ? [{ debugName: "sortOptions" }] : []);
  searchQuery = signal("", ...ngDevMode ? [{ debugName: "searchQuery" }] : []);
  searchResults = signal(null, ...ngDevMode ? [{ debugName: "searchResults" }] : []);
  isSearching = computed(() => this.searchQuery().length > 0, ...ngDevMode ? [{ debugName: "isSearching" }] : []);
  // UI state
  isLoading = signal(false, ...ngDevMode ? [{ debugName: "isLoading" }] : []);
  isRenaming = signal(null, ...ngDevMode ? [{ debugName: "isRenaming" }] : []);
  renameValue = signal("", ...ngDevMode ? [{ debugName: "renameValue" }] : []);
  showCreateMenu = signal(false, ...ngDevMode ? [{ debugName: "showCreateMenu" }] : []);
  contextMenuPosition = signal(null, ...ngDevMode ? [{ debugName: "contextMenuPosition" }] : []);
  contextMenuTarget = signal(null, ...ngDevMode ? [{ debugName: "contextMenuTarget" }] : []);
  // Editor state
  editingFile = signal(null, ...ngDevMode ? [{ debugName: "editingFile" }] : []);
  editingType = signal(null, ...ngDevMode ? [{ debugName: "editingType" }] : []);
  showRuneTable = signal(false, ...ngDevMode ? [{ debugName: "showRuneTable" }] : []);
  showMaterialTable = signal(false, ...ngDevMode ? [{ debugName: "showMaterialTable" }] : []);
  showWeaponGenerator = signal(false, ...ngDevMode ? [{ debugName: "showWeaponGenerator" }] : []);
  // Library settings state
  showLibrarySettings = signal(false, ...ngDevMode ? [{ debugName: "showLibrarySettings" }] : []);
  allLibraries = signal([], ...ngDevMode ? [{ debugName: "allLibraries" }] : []);
  // Shop/Deal editing state
  addingDealToShop = signal(null, ...ngDevMode ? [{ debugName: "addingDealToShop" }] : []);
  // shopId currently adding deal to
  dealMode = signal(null, ...ngDevMode ? [{ debugName: "dealMode" }] : []);
  // 'sell' = shop sells to player, 'buy' = shop buys from player
  editingDealData = signal(null, ...ngDevMode ? [{ debugName: "editingDealData" }] : []);
  selectedDealItemType = signal(null, ...ngDevMode ? [{ debugName: "selectedDealItemType" }] : []);
  selectedDealItemId = signal(null, ...ngDevMode ? [{ debugName: "selectedDealItemId" }] : []);
  // Loot Bundle editing state
  addingLootToBundle = signal(null, ...ngDevMode ? [{ debugName: "addingLootToBundle" }] : []);
  // bundleId currently adding loot to
  editingLootItemData = signal(null, ...ngDevMode ? [{ debugName: "editingLootItemData" }] : []);
  selectedLootItemType = signal(null, ...ngDevMode ? [{ debugName: "selectedLootItemType" }] : []);
  selectedLootItemId = signal(null, ...ngDevMode ? [{ debugName: "selectedLootItemId" }] : []);
  // Drag and drop state
  isDragging = signal(false, ...ngDevMode ? [{ debugName: "isDragging" }] : []);
  draggedIds = signal(/* @__PURE__ */ new Set(), ...ngDevMode ? [{ debugName: "draggedIds" }] : []);
  dragOverFolderId = signal(null, ...ngDevMode ? [{ debugName: "dragOverFolderId" }] : []);
  // Marquee selection state
  isMarqueeSelecting = signal(false, ...ngDevMode ? [{ debugName: "isMarqueeSelecting" }] : []);
  marqueeStart = signal(null, ...ngDevMode ? [{ debugName: "marqueeStart" }] : []);
  marqueeEnd = signal(null, ...ngDevMode ? [{ debugName: "marqueeEnd" }] : []);
  marqueeRect = signal(null, ...ngDevMode ? [{ debugName: "marqueeRect" }] : []);
  // Dummy sheet for item rendering
  dummySheet = createEmptySheet();
  // Tree state for folder tree
  expandedFolders = signal(/* @__PURE__ */ new Set(["root"]), ...ngDevMode ? [{ debugName: "expandedFolders" }] : []);
  allFolders = signal([], ...ngDevMode ? [{ debugName: "allFolders" }] : []);
  ngOnInit() {
    this.loadAllLibraries();
    this.route.params.subscribe(async (params) => {
      const id = params["libraryId"];
      if (id) {
        this.libraryId.set(id);
        await this.loadLibrary();
        await this.loadDependencyItems();
        await this.loadFolderContents();
        await this.loadAllFolders();
      }
    });
  }
  ngOnDestroy() {
  }
  // ==================== KEYBOARD SHORTCUTS ====================
  handleKeydown(event) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    const hasSelection = this.selectedIds().size > 0;
    if ((event.ctrlKey || event.metaKey) && event.key === "c" && hasSelection) {
      event.preventDefault();
      this.copySelected();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "x" && hasSelection) {
      event.preventDefault();
      this.cutSelected();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "v" && this.clipboard.canPaste()) {
      event.preventDefault();
      this.paste();
    }
    if (event.key === "Delete" && hasSelection && this.editingFile()?.type !== "spell") {
      event.preventDefault();
      this.deleteSelected();
    }
    if (event.key === "F2" && this.selectedIds().size === 1) {
      event.preventDefault();
      this.startRename(Array.from(this.selectedIds())[0]);
    }
    if (event.key === "Enter" && this.selectedIds().size === 1) {
      event.preventDefault();
      const id = Array.from(this.selectedIds())[0];
      this.openItem(id);
    }
    if (event.key === "Escape") {
      if (this.contextMenuPosition()) {
        this.closeContextMenu();
      } else if (this.isRenaming()) {
        this.cancelRename();
      } else {
        this.clearSelection();
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "a") {
      event.preventDefault();
      this.selectAll();
    }
  }
  // ==================== DATA LOADING ====================
  async loadLibrary() {
    try {
      const library = await firstValueFrom(this.api.getLibrary(this.libraryId()));
      if (!library.dependencies) {
        library.dependencies = [];
      }
      this.library.set(library);
      document.title = library.name;
    } catch (error) {
      console.error("Failed to load library:", error);
    }
  }
  async loadAllLibraries() {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      this.allLibraries.set(libraries);
    } catch (error) {
      console.error("Failed to load all libraries:", error);
    }
  }
  toggleLibrarySettings() {
    this.showLibrarySettings.set(!this.showLibrarySettings());
  }
  async saveLibrarySettings() {
    const lib = this.library();
    if (!lib)
      return;
    try {
      const updated = await firstValueFrom(this.api.updateLibrary(lib.id, {
        name: lib.name,
        description: lib.description,
        tags: lib.tags,
        isPublic: lib.isPublic,
        dependencies: lib.dependencies
      }));
      this.library.set(updated);
      await this.loadDependencyItems();
      console.log("Library settings saved successfully");
    } catch (error) {
      console.error("Failed to save library settings:", error);
      alert("Fehler beim Speichern der Bibliothekseinstellungen");
    }
  }
  updateLibraryTags(value) {
    const lib = this.library();
    if (!lib)
      return;
    lib.tags = value.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }
  // ==================== DEPENDENCY ITEM LOADING ====================
  dependencyLibraries = computed(() => {
    const lib = this.library();
    const allLibs = this.allLibraries();
    if (!lib || !lib.dependencies || lib.dependencies.length === 0)
      return [];
    return allLibs.filter((l) => lib.dependencies.includes(l.id));
  }, ...ngDevMode ? [{ debugName: "dependencyLibraries" }] : []);
  availableItems = signal([], ...ngDevMode ? [{ debugName: "availableItems" }] : []);
  availableRunes = signal([], ...ngDevMode ? [{ debugName: "availableRunes" }] : []);
  availableSpells = signal([], ...ngDevMode ? [{ debugName: "availableSpells" }] : []);
  availableSkills = signal([], ...ngDevMode ? [{ debugName: "availableSkills" }] : []);
  availableStatusEffects = signal([], ...ngDevMode ? [{ debugName: "availableStatusEffects" }] : []);
  availableMaterials = signal([], ...ngDevMode ? [{ debugName: "availableMaterials" }] : []);
  availableForgeTraits = signal([], ...ngDevMode ? [{ debugName: "availableForgeTraits" }] : []);
  /** Computed RuneBlock array for the spell-node-editor */
  get availableRunesAsBlocks() {
    return this.availableRunes().map((f) => f.data);
  }
  async loadDependencyItems() {
    const lib = this.library();
    if (!lib)
      return;
    try {
      const libraryIds = [lib.id, ...lib.dependencies || []];
      console.log("Loading items from library IDs:", libraryIds);
      const [items, runes, spells, skills, statusEffects, materials, forgeTraits] = await Promise.all([
        this.loadItemsByType(libraryIds, "item"),
        this.loadItemsByType(libraryIds, "rune"),
        this.loadItemsByType(libraryIds, "spell"),
        this.loadItemsByType(libraryIds, "skill"),
        this.loadItemsByType(libraryIds, "status-effect"),
        this.loadItemsByType(libraryIds, "material"),
        this.loadItemsByType(libraryIds, "forge-trait")
      ]);
      this.availableItems.set(items);
      this.availableRunes.set(runes);
      this.availableSpells.set(spells);
      this.availableSkills.set(skills);
      this.availableStatusEffects.set(statusEffects);
      this.availableMaterials.set(materials);
      this.availableForgeTraits.set(forgeTraits);
    } catch (error) {
      console.error("Failed to load dependency items:", error);
    }
  }
  async loadItemsByType(libraryIds, type) {
    const results = [];
    for (const libId of libraryIds) {
      try {
        const files = await firstValueFrom(this.api.searchFiles(libId, "", [type]));
        results.push(...files);
      } catch (error) {
        console.error(`Failed to load ${type} from library ${libId}:`, error);
      }
    }
    return results;
  }
  async loadFolderContents() {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(this.api.getFolderContents(this.libraryId(), this.currentFolderId()));
      this.folderContents.set(contents);
      this.clearSelection();
    } catch (error) {
      console.error("Failed to load folder contents:", error);
    } finally {
      this.isLoading.set(false);
    }
  }
  async loadAllFolders() {
    try {
      const rootContents = await firstValueFrom(this.api.getFolderContents(this.libraryId(), "root"));
      const folders = [];
      if (rootContents.folder) {
        folders.push(rootContents.folder);
      }
      await this.loadFoldersRecursive(folders, "root");
      this.allFolders.set(folders);
    } catch (error) {
      console.error("Failed to load folder tree:", error);
    }
  }
  async loadFoldersRecursive(folders, parentId) {
    try {
      const contents = await firstValueFrom(this.api.getFolderContents(this.libraryId(), parentId));
      for (const subfolder of contents.subfolders) {
        folders.push(subfolder);
        await this.loadFoldersRecursive(folders, subfolder.id);
      }
    } catch (error) {
    }
  }
  // ==================== NAVIGATION ====================
  navigateToFolder(folderId) {
    this.currentFolderId.set(folderId);
    this.loadFolderContents();
  }
  navigateUp() {
    const parent = this.folderContents()?.folder?.parentId;
    if (parent) {
      this.navigateToFolder(parent);
    }
  }
  location = inject(Location);
  goBack() {
    this.location.back();
  }
  // ==================== SELECTION ====================
  selectItem(id, isFolder, event) {
    event.stopPropagation();
    if (event.ctrlKey || event.metaKey) {
      const current = new Set(this.selectedIds());
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }
      this.selectedIds.set(current);
    } else if (event.shiftKey && this.lastSelectedId()) {
      this.selectRange(this.lastSelectedId(), id, isFolder);
    } else {
      this.selectedIds.set(/* @__PURE__ */ new Set([id]));
      this.isSelectionFolder.set(isFolder);
    }
    this.lastSelectedId.set(id);
  }
  selectRange(startId, endId, isFolder) {
    const items = isFolder ? this.subfolders() : this.files();
    const ids = items.map((item) => item.id);
    const startIndex = ids.indexOf(startId);
    const endIndex = ids.indexOf(endId);
    if (startIndex === -1 || endIndex === -1)
      return;
    const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    const rangeIds = ids.slice(from, to + 1);
    this.selectedIds.set(new Set(rangeIds));
  }
  selectAll() {
    const allIds = [
      ...this.subfolders().map((f) => f.id),
      ...this.files().map((f) => f.id)
    ];
    this.selectedIds.set(new Set(allIds));
  }
  clearSelection() {
    this.selectedIds.set(/* @__PURE__ */ new Set());
    this.lastSelectedId.set(null);
  }
  isSelected(id) {
    return this.selectedIds().has(id);
  }
  /**
   * Check if an item is in the cut clipboard (should show faded)
   */
  isCutItem(id) {
    const data = this.clipboard.getData();
    if (!data || data.operation !== "cut")
      return false;
    return data.items.some((item) => item.id === id);
  }
  // ==================== CLIPBOARD OPERATIONS ====================
  copySelected() {
    const items = this.getSelectedClipboardItems();
    this.clipboard.copy(this.libraryId(), items);
  }
  cutSelected() {
    const items = this.getSelectedClipboardItems();
    this.clipboard.cut(this.libraryId(), items);
  }
  getSelectedClipboardItems() {
    const items = [];
    for (const id of this.selectedIds()) {
      const folder = this.subfolders().find((f) => f.id === id);
      if (folder) {
        items.push({ type: "folder", id: folder.id, path: folder.path });
        continue;
      }
      const file = this.files().find((f) => f.id === id);
      if (file) {
        items.push({ type: "file", id: file.id, path: file.path });
      }
    }
    return items;
  }
  async paste() {
    const data = this.clipboard.getData();
    if (!data)
      return;
    const { folderIds, fileIds } = this.clipboard.getItemsByType();
    const targetFolderId = this.currentFolderId();
    try {
      this.isLoading.set(true);
      if (data.operation === "copy") {
        await firstValueFrom(this.api.bulkCopy(this.libraryId(), folderIds, fileIds, targetFolderId));
      } else {
        await firstValueFrom(this.api.bulkMove(this.libraryId(), folderIds, fileIds, targetFolderId));
        this.clipboard.clear();
      }
      await this.loadFolderContents();
      await this.loadAllFolders();
    } catch (error) {
      console.error("Paste failed:", error);
    } finally {
      this.isLoading.set(false);
    }
  }
  // ==================== CREATE OPERATIONS ====================
  async createFolder() {
    const defaultName = "Neuer Ordner";
    try {
      this.isLoading.set(true);
      const folder = await firstValueFrom(this.api.createFolder(this.libraryId(), defaultName, this.currentFolderId()));
      await this.loadFolderContents();
      await this.loadAllFolders();
      this.startRename(folder.id);
    } catch (error) {
      console.error("Failed to create folder:", error);
      const message = error?.error?.message || error?.message || "Ordner erstellen fehlgeschlagen";
      alert(message);
    } finally {
      this.isLoading.set(false);
      this.showCreateMenu.set(false);
    }
  }
  async createFile(type) {
    const baseName = `Neu ${getAssetTypeName(type)}`;
    const defaultName = this.generateUniqueName(baseName);
    const data = this.getEmptyDataForType(type, defaultName);
    try {
      this.isLoading.set(true);
      const file = await firstValueFrom(this.api.createFile(this.libraryId(), defaultName, type, this.currentFolderId(), data));
      await this.loadFolderContents();
      this.startRename(file.id);
    } catch (error) {
      console.error("Failed to create file:", error);
      const message = error?.error?.message || error?.message || "Datei erstellen fehlgeschlagen";
      alert(message);
    } finally {
      this.isLoading.set(false);
      this.showCreateMenu.set(false);
    }
  }
  /**
   * Generate unique name by appending number if name already exists
   */
  generateUniqueName(baseName) {
    const existingFiles = this.files();
    const existingNames = new Set(existingFiles.map((f) => f.name.toLowerCase()));
    if (!existingNames.has(baseName.toLowerCase())) {
      return baseName;
    }
    let counter = 2;
    let uniqueName = `${baseName} ${counter}`;
    while (existingNames.has(uniqueName.toLowerCase())) {
      counter++;
      uniqueName = `${baseName} ${counter}`;
    }
    return uniqueName;
  }
  getEmptyDataForType(type, name) {
    switch (type) {
      case "item":
        return {
          name,
          description: "",
          weight: 0,
          lost: false,
          broken: false,
          itemType: "other",
          requirements: {}
        };
      case "spell":
        return { name, description: "", tags: [], binding: { type: "learned" } };
      case "rune":
        return { name, description: "" };
      case "skill":
        return {
          name,
          description: "",
          class: "",
          type: "active",
          enlightened: false
        };
      case "status-effect":
        return __spreadProps(__spreadValues({}, createEmptyStatusEffect()), { name });
      case "macro":
        return __spreadProps(__spreadValues({}, createEmptyMacroAction()), { name });
      case "material":
        return __spreadProps(__spreadValues({}, createEmptyMaterialBlock()), { name });
      case "forge-trait":
        return __spreadProps(__spreadValues({}, createEmptyForgeTrait()), { name });
      case "brew-trait":
        return __spreadProps(__spreadValues({}, createEmptyBrewTrait()), { name });
      case "ingredient":
        return __spreadProps(__spreadValues({}, createEmptyIngredientBlock(name)), { name });
      case "extractor":
        return __spreadProps(__spreadValues({}, createEmptyExtractorBlock(name)), { name });
      case "shop":
        return {
          id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: "shop",
          name,
          description: "",
          deals: [],
          claimedDeals: {},
          createdAt: Date.now()
        };
      case "loot-bundle":
        return {
          id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: "loot",
          name,
          description: "",
          items: [],
          createdAt: Date.now()
        };
      case "statblock":
        return __spreadProps(__spreadValues({}, createEmptyNpcStatblock()), { name });
      default:
        return { name };
    }
  }
  toggleCreateMenu() {
    this.showCreateMenu.set(!this.showCreateMenu());
  }
  // ==================== RENAME OPERATIONS ====================
  startRename(id) {
    const folder = this.subfolders().find((f) => f.id === id);
    const file = this.files().find((f) => f.id === id);
    const name = folder?.name || file?.name || "";
    this.isRenaming.set(id);
    this.renameValue.set(name);
    setTimeout(() => {
      const input = document.querySelector(".rename-input");
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }
  cancelRename() {
    this.isRenaming.set(null);
    this.renameValue.set("");
  }
  async confirmRename() {
    const id = this.isRenaming();
    const newName = this.renameValue().trim();
    if (!id || !newName) {
      this.cancelRename();
      return;
    }
    try {
      this.isLoading.set(true);
      const folder = this.subfolders().find((f) => f.id === id);
      if (folder) {
        await firstValueFrom(this.api.renameFolder(this.libraryId(), id, newName));
        await this.loadAllFolders();
      } else {
        const file = this.files().find((f) => f.id === id);
        if (file) {
          const updatedData = __spreadProps(__spreadValues({}, file.data), { name: newName });
          await firstValueFrom(this.api.updateFile(this.libraryId(), id, {
            name: newName,
            data: updatedData
          }));
        } else {
          await firstValueFrom(this.api.updateFile(this.libraryId(), id, { name: newName }));
        }
      }
      await this.loadFolderContents();
    } catch (error) {
      console.error("Rename failed:", error);
      const message = error?.error?.message || error?.message || "Umbenennen fehlgeschlagen";
      alert(message);
      return;
    } finally {
      this.isLoading.set(false);
      this.cancelRename();
    }
  }
  // ==================== DELETE OPERATIONS ====================
  async deleteSelected() {
    const count = this.selectedIds().size;
    if (count === 0)
      return;
    const confirmed = confirm(`Delete ${count} item${count > 1 ? "s" : ""}?`);
    if (!confirmed)
      return;
    const folderIds = [];
    const fileIds = [];
    for (const id of this.selectedIds()) {
      if (this.subfolders().some((f) => f.id === id)) {
        folderIds.push(id);
      } else {
        fileIds.push(id);
      }
    }
    try {
      this.isLoading.set(true);
      await firstValueFrom(this.api.bulkDelete(this.libraryId(), folderIds, fileIds));
      await this.loadFolderContents();
      await this.loadAllFolders();
      this.clearSelection();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      this.isLoading.set(false);
    }
  }
  // ==================== OPEN/EDIT OPERATIONS ====================
  openItem(id) {
    const folder = this.subfolders().find((f) => f.id === id);
    if (folder) {
      this.navigateToFolder(folder.id);
      return;
    }
    const file = this.files().find((f) => f.id === id);
    if (file) {
      this.openEditor(file);
    }
  }
  onDoubleClick(id, isFolder, event) {
    event.stopPropagation();
    this.openItem(id);
  }
  openEditor(file) {
    this.editingFile.set(file);
    this.editingType.set(file.type);
  }
  closeEditor() {
    this.editingFile.set(null);
    this.editingType.set(null);
  }
  async saveEditor(data, closeAfterSave = true) {
    const file = this.editingFile();
    if (!file)
      return;
    try {
      const payload = __spreadProps(__spreadValues({}, data), { id: data?.id || file.id });
      await firstValueFrom(this.api.updateFile(this.libraryId(), file.id, {
        data: payload,
        name: payload.name || file.name
      }));
      await this.loadFolderContents();
      if (closeAfterSave) {
        this.closeEditor();
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  }
  // ==================== SHOP DEAL MANAGEMENT ====================
  startAddingDealToShop() {
    const file = this.editingFile();
    if (!file || file.type !== "shop")
      return;
    this.addingDealToShop.set(file.id);
    this.dealMode.set(null);
    this.editingDealData.set(null);
    this.selectedDealItemType.set(null);
    this.selectedDealItemId.set(null);
  }
  selectDealMode(mode) {
    this.dealMode.set(mode);
    if (mode === "buy") {
      this.editingDealData.set(__spreadProps(__spreadValues({}, createEmptyShopDeal()), {
        isReverseDeal: true,
        name: "",
        reverseDescription: "",
        price: { copper: 0, silver: 0, gold: 0, platinum: 0 }
      }));
      this.selectedDealItemType.set(null);
      this.selectedDealItemId.set(null);
    } else {
      this.editingDealData.set(null);
      this.selectedDealItemType.set(null);
      this.selectedDealItemId.set(null);
    }
  }
  selectDealItemType(type) {
    this.selectedDealItemType.set(type);
    this.selectedDealItemId.set(null);
    console.log(`Selected type: ${type}`, {
      items: this.availableItems().length,
      runes: this.availableRunes().length,
      spells: this.availableSpells().length,
      skills: this.availableSkills().length,
      statusEffects: this.availableStatusEffects().length
    });
    switch (type) {
      case "item":
        console.log("Available items:", this.availableItems().map((i) => ({ id: i.id, name: i.name })));
        break;
      case "spell":
        console.log("Available spells:", this.availableSpells().map((s) => ({ id: s.id, name: s.name })));
        break;
      case "skill":
        console.log("Available skills:", this.availableSkills().map((s) => ({ id: s.id, name: s.name })));
        break;
    }
    this.editingDealData.set(__spreadProps(__spreadValues({}, createEmptyShopDeal()), {
      isReverseDeal: false,
      name: "Neuer Deal",
      price: { copper: 0, silver: 0, gold: 0, platinum: 0 }
    }));
  }
  selectDealItem(itemFile) {
    this.selectedDealItemId.set(itemFile.id);
    const deal = this.editingDealData();
    if (!deal)
      return;
    const type = this.selectedDealItemType();
    switch (type) {
      case "item":
        deal.item = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case "rune":
        deal.rune = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case "spell":
        deal.spell = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case "skill":
        deal.skill = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
      case "status-effect":
        deal.statusEffect = itemFile.data;
        deal.name = itemFile.data.name || itemFile.name;
        break;
    }
    this.editingDealData.set(__spreadValues({}, deal));
  }
  onDealItemSelected(event) {
    const selectElement = event.target;
    const selectedIndex = selectElement.selectedIndex - 1;
    if (selectedIndex < 0)
      return;
    const type = this.selectedDealItemType();
    let itemFile;
    switch (type) {
      case "item":
        itemFile = this.availableItems()[selectedIndex];
        break;
      case "rune":
        itemFile = this.availableRunes()[selectedIndex];
        break;
      case "spell":
        itemFile = this.availableSpells()[selectedIndex];
        break;
      case "skill":
        itemFile = this.availableSkills()[selectedIndex];
        break;
      case "status-effect":
        itemFile = this.availableStatusEffects()[selectedIndex];
        break;
    }
    if (itemFile) {
      this.selectDealItem(itemFile);
    }
  }
  async saveDealToShop() {
    const file = this.editingFile();
    const deal = this.editingDealData();
    if (!file || !deal || file.type !== "shop")
      return;
    const shopData = file.data;
    if (!shopData.deals)
      shopData.deals = [];
    if (!deal.id) {
      deal.id = `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    shopData.deals.push(deal);
    await this.saveEditor(shopData, false);
    this.cancelAddingDeal();
  }
  async removeDealFromShop(dealId) {
    const file = this.editingFile();
    if (!file || file.type !== "shop")
      return;
    const shopData = file.data;
    shopData.deals = shopData.deals.filter((d) => d.id !== dealId);
    await this.saveEditor(shopData, false);
  }
  setAllDealsIdentified(identified) {
    const file = this.editingFile();
    if (!file || file.type !== "shop")
      return;
    const shopData = file.data;
    if (!shopData.deals)
      return;
    shopData.deals.forEach((d) => d.identified = identified);
  }
  allDealsIdentified() {
    const file = this.editingFile();
    if (!file || file.type !== "shop")
      return true;
    const shopData = file.data;
    if (!shopData.deals || shopData.deals.length === 0)
      return true;
    return shopData.deals.every((d) => d.identified !== false);
  }
  cancelAddingDeal() {
    this.addingDealToShop.set(null);
    this.dealMode.set(null);
    this.editingDealData.set(null);
    this.selectedDealItemType.set(null);
    this.selectedDealItemId.set(null);
  }
  getDealItemName(deal) {
    return deal.item?.name || deal.rune?.name || deal.spell?.name || deal.skill?.name || deal.statusEffect?.name || deal.name;
  }
  getDealItemIcon(deal) {
    if (deal.isReverseDeal)
      return "\u{1F4B0}";
    if (deal.item)
      return getAssetTypeIcon("item");
    if (deal.rune)
      return getAssetTypeIcon("rune");
    if (deal.spell)
      return getAssetTypeIcon("spell");
    if (deal.skill)
      return getAssetTypeIcon("skill");
    if (deal.statusEffect)
      return getAssetTypeIcon("status-effect");
    return "\u{1F4BC}";
  }
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
  // ==================== LOOT BUNDLE MANAGEMENT ====================
  startAddingLootToBundle() {
    const file = this.editingFile();
    if (!file || file.type !== "loot-bundle")
      return;
    this.addingLootToBundle.set(file.id);
    this.editingLootItemData.set(null);
    this.selectedLootItemType.set(null);
    this.selectedLootItemId.set(null);
  }
  selectLootItemType(type) {
    this.selectedLootItemType.set(type);
    this.selectedLootItemId.set(null);
    console.log(`Selected loot type: ${type}`, {
      items: this.availableItems().length,
      runes: this.availableRunes().length,
      spells: this.availableSpells().length,
      skills: this.availableSkills().length,
      statusEffects: this.availableStatusEffects().length
    });
    if (type === "currency") {
      this.editingLootItemData.set({
        id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: "currency",
        data: { copper: 0, silver: 0, gold: 0, platinum: 0 }
      });
    } else {
      this.editingLootItemData.set({
        id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type
      });
    }
  }
  selectLootItem(itemFile) {
    this.selectedLootItemId.set(itemFile.id);
    const lootItem = this.editingLootItemData();
    if (!lootItem)
      return;
    lootItem.data = itemFile.data;
    this.editingLootItemData.set(__spreadValues({}, lootItem));
  }
  onLootItemSelected(event) {
    const selectElement = event.target;
    const selectedIndex = selectElement.selectedIndex - 1;
    if (selectedIndex < 0)
      return;
    const type = this.selectedLootItemType();
    let itemFile;
    switch (type) {
      case "item":
        itemFile = this.availableItems()[selectedIndex];
        break;
      case "rune":
        itemFile = this.availableRunes()[selectedIndex];
        break;
      case "spell":
        itemFile = this.availableSpells()[selectedIndex];
        break;
      case "skill":
        itemFile = this.availableSkills()[selectedIndex];
        break;
      case "status-effect":
        itemFile = this.availableStatusEffects()[selectedIndex];
        break;
    }
    if (itemFile) {
      this.selectLootItem(itemFile);
    }
  }
  async saveLootItemToBundle() {
    const file = this.editingFile();
    const lootItem = this.editingLootItemData();
    if (!file || !lootItem || file.type !== "loot-bundle")
      return;
    const bundleData = file.data;
    if (!bundleData.items)
      bundleData.items = [];
    bundleData.items.push(lootItem);
    await this.saveEditor(bundleData, false);
    this.cancelAddingLootItem();
  }
  async removeLootItemFromBundle(lootItemId) {
    const file = this.editingFile();
    if (!file || file.type !== "loot-bundle")
      return;
    const bundleData = file.data;
    bundleData.items = bundleData.items.filter((i) => i.id !== lootItemId);
    await this.saveEditor(bundleData, false);
  }
  cancelAddingLootItem() {
    this.addingLootToBundle.set(null);
    this.editingLootItemData.set(null);
    this.selectedLootItemType.set(null);
    this.selectedLootItemId.set(null);
  }
  getLootItemName(lootItem) {
    if (lootItem.type === "currency") {
      return this.formatCurrency(lootItem.data);
    }
    return lootItem.data?.name || "Unnamed";
  }
  getLootItemIcon(lootItem) {
    switch (lootItem.type) {
      case "item":
        return getAssetTypeIcon("item");
      case "rune":
        return getAssetTypeIcon("rune");
      case "spell":
        return getAssetTypeIcon("spell");
      case "skill":
        return getAssetTypeIcon("skill");
      case "status-effect":
        return getAssetTypeIcon("status-effect");
      case "currency":
        return "\u{1F4B0}";
      default:
        return "\u2753";
    }
  }
  // ==================== CONTEXT MENU ====================
  onContextMenu(event, type, id) {
    event.preventDefault();
    event.stopPropagation();
    if (type !== "background" && id) {
      if (!this.selectedIds().has(id)) {
        this.selectedIds.set(/* @__PURE__ */ new Set([id]));
        this.isSelectionFolder.set(type === "folder");
      }
      this.contextMenuTarget.set({ type, id });
    } else {
      this.contextMenuTarget.set(null);
    }
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
  }
  closeContextMenu() {
    this.contextMenuPosition.set(null);
    this.contextMenuTarget.set(null);
  }
  // ==================== SORTING ====================
  sortItems(items, type) {
    const { field, direction } = this.sortOptions();
    const multiplier = direction === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "type":
          if (type === "file") {
            comparison = (a.type || "").localeCompare(b.type || "");
          }
          break;
        case "createdAt":
          comparison = a.createdAt - b.createdAt;
          break;
        case "updatedAt":
          comparison = a.updatedAt - b.updatedAt;
          break;
      }
      return comparison * multiplier;
    });
  }
  setSortField(field) {
    const current = this.sortOptions();
    if (current.field === field) {
      this.sortOptions.set({
        field,
        direction: current.direction === "asc" ? "desc" : "asc"
      });
    } else {
      this.sortOptions.set({ field, direction: "asc" });
    }
  }
  // ==================== SEARCH ====================
  async search() {
    const query = this.searchQuery().trim();
    if (!query) {
      this.searchResults.set(null);
      return;
    }
    try {
      const results = await firstValueFrom(this.api.searchFiles(this.libraryId(), query));
      this.searchResults.set(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }
  clearSearch() {
    this.searchQuery.set("");
    this.searchResults.set(null);
  }
  // ==================== FOLDER TREE ====================
  toggleFolderExpand(folderId) {
    const expanded = new Set(this.expandedFolders());
    if (expanded.has(folderId)) {
      expanded.delete(folderId);
    } else {
      expanded.add(folderId);
    }
    this.expandedFolders.set(expanded);
  }
  isFolderExpanded(folderId) {
    return this.expandedFolders().has(folderId);
  }
  getChildFolders(parentId) {
    return this.allFolders().filter((f) => f.parentId === parentId);
  }
  getRootFolders() {
    return this.allFolders().filter((f) => f.parentId === null);
  }
  // ==================== VIEW MODE ====================
  setViewMode(mode) {
    this.viewMode.set(mode);
  }
  // ==================== DRAG AND DROP ====================
  onDragStart(event, id, isFolder) {
    if (!this.selectedIds().has(id)) {
      this.selectedIds.set(/* @__PURE__ */ new Set([id]));
      this.isSelectionFolder.set(isFolder);
    }
    this.isDragging.set(true);
    this.draggedIds.set(new Set(this.selectedIds()));
    const dragData = {
      ids: Array.from(this.selectedIds()),
      isFolder,
      libraryId: this.libraryId()
    };
    event.dataTransfer.setData("application/json", JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = "move";
    if (this.selectedIds().size > 1) {
      const dragGhost = document.createElement("div");
      dragGhost.className = "drag-ghost";
      dragGhost.textContent = `${this.selectedIds().size} Elemente`;
      dragGhost.style.cssText = "position: absolute; top: -1000px; padding: 8px 16px; background: #0078d4; color: white; border-radius: 4px; font-size: 14px;";
      document.body.appendChild(dragGhost);
      event.dataTransfer.setDragImage(dragGhost, 0, 0);
      setTimeout(() => dragGhost.remove(), 0);
    }
  }
  onDragEnd(event) {
    this.isDragging.set(false);
    this.draggedIds.set(/* @__PURE__ */ new Set());
    this.dragOverFolderId.set(null);
  }
  onDragOver(event, folderId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (!this.draggedIds().has(folderId)) {
      this.dragOverFolderId.set(folderId);
    }
  }
  onDragLeave(event) {
    this.dragOverFolderId.set(null);
  }
  async onDrop(event, targetFolderId) {
    event.preventDefault();
    this.dragOverFolderId.set(null);
    this.isDragging.set(false);
    const data = event.dataTransfer?.getData("application/json");
    if (!data)
      return;
    try {
      const dragData = JSON.parse(data);
      const ids = dragData.ids;
      if (ids.includes(targetFolderId))
        return;
      const folderIds = ids.filter((id) => this.subfolders().some((f) => f.id === id) || this.allFolders().some((f) => f.id === id));
      const fileIds = ids.filter((id) => this.files().some((f) => f.id === id) || this.searchResults()?.some((f) => f.id === id));
      if (folderIds.length > 0 || fileIds.length > 0) {
        this.isLoading.set(true);
        try {
          await firstValueFrom(this.api.bulkMove(this.libraryId(), folderIds, fileIds, targetFolderId));
          await this.loadFolderContents();
          await this.loadAllFolders();
          this.clearSelection();
        } catch (error) {
          console.error("Failed to move items:", error);
        } finally {
          this.isLoading.set(false);
        }
      }
    } catch (error) {
      console.error("Failed to parse drag data:", error);
    }
  }
  // Handle drop on breadcrumb
  async onBreadcrumbDrop(event, folderId) {
    await this.onDrop(event, folderId);
  }
  // Handle drop on tree node
  async onTreeNodeDrop(event, folderId) {
    await this.onDrop(event, folderId);
  }
  // ==================== MARQUEE SELECTION ====================
  onContentAreaMouseDown(event) {
    if (event.button !== 0)
      return;
    if (event.target.closest(".folder-item, .file-item"))
      return;
    if (event.target.closest(".folder-tree"))
      return;
    if (event.target.closest(".content-toolbar"))
      return;
    const contentArea = event.target.closest(".folder-contents");
    if (!contentArea)
      return;
    const rect = contentArea.getBoundingClientRect();
    const x = event.clientX - rect.left + contentArea.scrollLeft;
    const y = event.clientY - rect.top + contentArea.scrollTop;
    this.isMarqueeSelecting.set(true);
    this.marqueeStart.set({ x, y });
    this.marqueeEnd.set({ x, y });
    if (!event.ctrlKey && !event.metaKey) {
      this.clearSelection();
    }
  }
  onMouseMove(event) {
    if (!this.isMarqueeSelecting())
      return;
    const contentArea = document.querySelector(".folder-contents");
    if (!contentArea)
      return;
    const rect = contentArea.getBoundingClientRect();
    const x = Math.max(0, event.clientX - rect.left + contentArea.scrollLeft);
    const y = Math.max(0, event.clientY - rect.top + contentArea.scrollTop);
    this.marqueeEnd.set({ x, y });
    const start = this.marqueeStart();
    const left = Math.min(start.x, x);
    const top = Math.min(start.y, y);
    const width = Math.abs(x - start.x);
    const height = Math.abs(y - start.y);
    this.marqueeRect.set({ left, top, width, height });
    this.updateMarqueeSelection(rect);
  }
  onMouseUp(event) {
    if (this.isMarqueeSelecting()) {
      this.isMarqueeSelecting.set(false);
      this.marqueeRect.set(null);
    }
  }
  updateMarqueeSelection(contentRect) {
    const rect = this.marqueeRect();
    if (!rect || rect.width < 5 && rect.height < 5)
      return;
    const contentArea = document.querySelector(".folder-contents");
    if (!contentArea)
      return;
    const selected = /* @__PURE__ */ new Set();
    const items = contentArea.querySelectorAll("[data-id]");
    items.forEach((el) => {
      const id = el.getAttribute("data-id");
      if (id && this.isElementInMarquee(el, contentArea, rect)) {
        selected.add(id);
      }
    });
    this.selectedIds.set(selected);
  }
  isElementInMarquee(el, container, rect) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const elLeft = elRect.left - containerRect.left + container.scrollLeft;
    const elTop = elRect.top - containerRect.top + container.scrollTop;
    const elRight = elLeft + elRect.width;
    const elBottom = elTop + elRect.height;
    const mRight = rect.left + rect.width;
    const mBottom = rect.top + rect.height;
    return !(elRight < rect.left || elLeft > mRight || elBottom < rect.top || elTop > mBottom);
  }
  // ==================== HELPERS ====================
  getAssetIcon(type) {
    return getAssetTypeIcon(type);
  }
  getAssetTypeName(type) {
    return getAssetTypeName(type);
  }
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }
  trackById(index, item) {
    return item.id;
  }
  // ── Weapon Generator ──────────────────────────────────────────────────────
  toggleWeaponGenerator() {
    this.showWeaponGenerator.update((v) => !v);
  }
  async onGeneratedItemCreated(item) {
    const libId = this.libraryId();
    const folderId = this.currentFolderId();
    if (!libId)
      return;
    try {
      await firstValueFrom(this.api.createFile(libId, item.name, "item", folderId ?? "root", item));
      await this.loadFolderContents();
    } catch (e) {
      console.error("Waffengenerator: Fehler beim Speichern", e);
    }
  }
  static \u0275fac = function LibraryEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LibraryEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LibraryEditorComponent, selectors: [["app-library-editor"]], viewQuery: function LibraryEditorComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c03, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.fileInput = _t.first);
    }
  }, hostBindings: function LibraryEditorComponent_HostBindings(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275listener("keydown", function LibraryEditorComponent_keydown_HostBindingHandler($event) {
        return ctx.handleKeydown($event);
      }, \u0275\u0275resolveWindow)("mousemove", function LibraryEditorComponent_mousemove_HostBindingHandler($event) {
        return ctx.onMouseMove($event);
      }, \u0275\u0275resolveWindow)("mouseup", function LibraryEditorComponent_mouseup_HostBindingHandler($event) {
        return ctx.onMouseUp($event);
      }, \u0275\u0275resolveWindow);
    }
  }, decls: 66, vars: 19, consts: [["folderNode", ""], [1, "library-editor", 3, "click", "contextmenu"], [1, "browser-header"], [1, "header-left"], [1, "back-btn", 3, "click"], [1, "settings-btn", 3, "click"], [1, "header-right"], [1, "search-box"], ["type", "text", "placeholder", "Suche...", 3, "ngModelChange", "keyup.enter", "ngModel"], [1, "clear-search"], [1, "search-btn", 3, "click"], [1, "view-toggle"], ["title", "Grid View", 3, "click"], ["title", "List View", 3, "click"], ["title", "Zufallswaffe generieren", 1, "generator-btn", 3, "click"], [1, "library-settings-panel"], [1, "browser-body"], [1, "folder-tree"], [1, "tree-header"], [1, "tree-content"], [1, "content-area"], [1, "content-toolbar"], [1, "toolbar-left"], [1, "breadcrumbs"], [1, "toolbar-right"], ["title", "Alle Runen in Tabellenansicht bearbeiten", 1, "rune-table-btn", 3, "click"], ["title", "Alle Materialien in Tabellenansicht bearbeiten", 1, "rune-table-btn", "material-table-btn", 3, "click"], [1, "create-dropdown"], [1, "create-btn", 3, "click"], [1, "create-menu"], [1, "clipboard-info"], [1, "sort-select", 3, "change"], ["value", "name"], ["value", "type"], ["value", "createdAt"], ["value", "updatedAt"], [1, "loading-overlay"], [1, "search-results"], [1, "folder-contents", 3, "list-view"], [1, "context-menu", 3, "left", "top"], [1, "editor-overlay"], [3, "libraryId", "folderId"], [1, "clear-search", 3, "click"], [1, "settings-content"], [1, "settings-row"], [1, "settings-group"], ["type", "text", "placeholder", "Bibliotheksbeschreibung...", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "tag1, tag2, tag3", 3, "change", "value"], ["multiple", "", "size", "4", 1, "dependencies-select", 3, "ngModelChange", "ngModel"], [1, "dependencies-help"], [1, "settings-group", "checkbox-group"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "settings-actions"], [1, "save-btn", 3, "click"], ["title", "Abh\xE4ngigkeiten neu laden", 1, "reload-deps-btn", 3, "click"], [1, "cancel-btn", 3, "click"], [3, "value"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "crumb", 3, "click"], [1, "separator"], [1, "create-menu", 3, "click"], [3, "click"], [1, "spinner"], [1, "results-header"], [1, "files-grid"], [1, "file-item", 3, "selected"], [1, "empty-message"], [1, "file-item", 3, "click", "dblclick", "contextmenu"], [1, "file-icon"], ["alt", "", 1, "rune-file-icon-img", 3, "src"], [1, "file-name"], [1, "file-path"], [1, "folder-contents", 3, "mousedown"], [1, "marquee-selection", 3, "left", "top", "width", "height"], [1, "empty-state"], [1, "marquee-selection"], [1, "section-header"], [1, "folders-grid"], ["draggable", "true", 1, "folder-item", 3, "selected", "cut", "drag-over", "dragging"], ["draggable", "true", 1, "folder-item", 3, "dragstart", "dragend", "dragover", "dragleave", "drop", "click", "dblclick", "contextmenu"], [1, "folder-icon"], ["type", "text", "autofocus", "", 1, "rename-input", 3, "ngModel"], [1, "folder-name"], [1, "item-date"], ["type", "text", "autofocus", "", 1, "rename-input", 3, "ngModelChange", "keyup.enter", "keyup.escape", "blur", "click", "ngModel"], ["draggable", "true", 1, "file-item", 3, "selected", "cut", "dragging"], ["draggable", "true", 1, "file-item", 3, "dragstart", "dragend", "click", "dblclick", "contextmenu"], [1, "file-type"], [1, "empty-icon"], [1, "empty-text"], [1, "empty-hint"], [3, "itemCreated", "closePanel"], [1, "context-menu", 3, "click"], [1, "danger", 3, "click"], [1, "editor-modal"], [1, "editor-header"], [1, "close-btn", 3, "click"], [1, "editor-content"], [3, "item", "sheet"], [3, "rune"], [3, "spell", "availableRunes"], [3, "skill"], [3, "statusEffect"], [3, "macro"], [3, "material"], [3, "trait"], [3, "ingredient"], [3, "extractor"], [3, "statblock", "availableSpells", "availableItems", "availableSkills", "availableRunes", "availableMaterials", "availableForgeTraits"], [1, "shop-editor"], [1, "loot-bundle-editor"], [3, "save", "cancel", "item", "sheet"], [3, "save", "cancel", "rune"], [3, "save", "cancel", "deleteSpell", "spell", "availableRunes"], [3, "save", "cancel", "skill"], [3, "save", "cancel", "statusEffect"], [3, "save", "cancel", "macro"], [3, "save", "cancel", "material"], [3, "save", "cancel", "trait"], [3, "save", "cancel", "ingredient"], [3, "save", "cancel", "extractor"], [3, "save", "cancel", "statblock", "availableSpells", "availableItems", "availableSkills", "availableRunes", "availableMaterials", "availableForgeTraits"], [1, "form-group"], ["type", "text", "placeholder", "z.B. H\xE4ndler des Vertrauens", 3, "ngModelChange", "ngModel"], ["rows", "3", "placeholder", "Beschreibe den Shop...", 3, "ngModelChange", "ngModel"], [1, "deals-section"], [1, "add-btn", 3, "click", "disabled"], [1, "deal-creator"], [1, "editor-actions"], [1, "creator-header"], [1, "mode-selector"], [1, "mode-btn", "sell", 3, "click"], [1, "mode-icon"], [1, "mode-title"], [1, "mode-desc"], [1, "mode-btn", "buy", 3, "click"], [1, "type-selector"], [1, "type-btn", 3, "click"], [1, "item-selector", 3, "change"], ["value", ""], [3, "selected"], ["type", "text", "placeholder", "z.B. Schwert +1", 3, "ngModelChange", "ngModel"], [1, "currency-inputs"], ["type", "number", "min", "0", "placeholder", "0", 3, "ngModelChange", "ngModel"], [1, "form-group", "checkboxes"], ["type", "checkbox", 3, "change", "checked"], ["type", "number", "min", "1", "placeholder", "Unbegrenzt", 3, "ngModelChange", "ngModel"], ["type", "text", "placeholder", "z.B. Schwerter verschiedener Art", 3, "ngModelChange", "ngModel"], ["rows", "3", "placeholder", "z.B. Beliebige Schwerter, egal welcher Qualit\xE4t. Auch verzauberte Klingen.", 3, "ngModelChange", "ngModel"], [1, "hint"], [1, "deals-list-header"], [1, "deals-count"], [1, "identify-all-label"], [1, "deals-list"], [1, "deal-card", 3, "reverse"], [1, "deal-card"], [1, "deal-info"], [1, "deal-icon"], [1, "deal-details"], [1, "deal-name"], [1, "deal-meta"], [1, "deal-badge", "negotiable"], [1, "deal-price"], [1, "deal-stock"], [1, "deal-badge", "reverse"], ["title", "Entfernen", 1, "icon-btn", "delete", 3, "click"], ["type", "text", "placeholder", "z.B. Schatztruhe des Drachen", 3, "ngModelChange", "ngModel"], ["rows", "3", "placeholder", "Beschreibe das Loot-B\xFCndel...", 3, "ngModelChange", "ngModel"], [1, "loot-items-section"], [1, "loot-creator"], [1, "loot-list"], [1, "loot-item-card"], [1, "loot-item-info"], [1, "loot-icon"], [1, "loot-details"], [1, "loot-name"], [1, "loot-type"], [3, "close", "filesChanged", "libraryId", "folderId"], [1, "tree-node"], [1, "expand-btn", 3, "click"], [1, "node-icon"], [1, "node-name", 3, "click"]], template: function LibraryEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 1);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_div_click_0_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.closeContextMenu());
      })("contextmenu", function LibraryEditorComponent_Template_div_contextmenu_0_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onContextMenu($event, "background"));
      });
      \u0275\u0275elementStart(1, "header", 2)(2, "div", 3)(3, "button", 4);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_3_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.goBack());
      });
      \u0275\u0275text(4, "\u2190 Zur\xFCck");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "h1");
      \u0275\u0275text(6);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "button", 5);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_7_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.toggleLibrarySettings());
      });
      \u0275\u0275text(8, "\u2699\uFE0F Bibliothekseinstellungen");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(9, "div", 6)(10, "div", 7)(11, "input", 8);
      \u0275\u0275listener("ngModelChange", function LibraryEditorComponent_Template_input_ngModelChange_11_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.searchQuery.set($event));
      })("keyup.enter", function LibraryEditorComponent_Template_input_keyup_enter_11_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.search());
      });
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(12, LibraryEditorComponent_Conditional_12_Template, 2, 0, "button", 9);
      \u0275\u0275elementStart(13, "button", 10);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_13_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.search());
      });
      \u0275\u0275text(14, "\u{1F50D}");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(15, "div", 11)(16, "button", 12);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_16_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setViewMode("grid"));
      });
      \u0275\u0275text(17, " \u25A6 ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "button", 13);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_18_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setViewMode("list"));
      });
      \u0275\u0275text(19, " \u2630 ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "button", 14);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_20_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.toggleWeaponGenerator());
      });
      \u0275\u0275text(21, " \u2697 ");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275conditionalCreate(22, LibraryEditorComponent_Conditional_22_Template, 31, 5, "div", 15);
      \u0275\u0275elementStart(23, "div", 16)(24, "aside", 17)(25, "div", 18)(26, "span");
      \u0275\u0275text(27, "Ordner");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(28, "div", 19);
      \u0275\u0275repeaterCreate(29, LibraryEditorComponent_For_30_Template, 1, 4, "ng-container", null, _forTrack05);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(31, "main", 20)(32, "div", 21)(33, "div", 22)(34, "nav", 23);
      \u0275\u0275repeaterCreate(35, LibraryEditorComponent_For_36_Template, 3, 4, null, null, _forTrack05);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(37, "div", 24)(38, "button", 25);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_38_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.showRuneTable.set(true));
      });
      \u0275\u0275text(39, " \u2728 Rune-Tabelle ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "button", 26);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_40_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.showMaterialTable.set(true));
      });
      \u0275\u0275text(41, " \u2699\uFE0F Material-Tabelle ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "div", 27)(43, "button", 28);
      \u0275\u0275listener("click", function LibraryEditorComponent_Template_button_click_43_listener($event) {
        \u0275\u0275restoreView(_r1);
        ctx.toggleCreateMenu();
        return \u0275\u0275resetView($event.stopPropagation());
      });
      \u0275\u0275text(44, " + Neu ");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(45, LibraryEditorComponent_Conditional_45_Template, 28, 0, "div", 29);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(46, LibraryEditorComponent_Conditional_46_Template, 2, 1, "span", 30);
      \u0275\u0275elementStart(47, "select", 31);
      \u0275\u0275listener("change", function LibraryEditorComponent_Template_select_change_47_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setSortField($event.target.value));
      });
      \u0275\u0275elementStart(48, "option", 32);
      \u0275\u0275text(49, "Nach Name");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "option", 33);
      \u0275\u0275text(51, "Nach Typ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(52, "option", 34);
      \u0275\u0275text(53, "Nach Erstellt");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "option", 35);
      \u0275\u0275text(55, "Nach Ge\xE4ndert");
      \u0275\u0275elementEnd()()()();
      \u0275\u0275conditionalCreate(56, LibraryEditorComponent_Conditional_56_Template, 2, 0, "div", 36);
      \u0275\u0275conditionalCreate(57, LibraryEditorComponent_Conditional_57_Template, 10, 2, "div", 37)(58, LibraryEditorComponent_Conditional_58_Template, 5, 6, "div", 38);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(59, LibraryEditorComponent_Conditional_59_Template, 1, 0, "app-weapon-generator");
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(60, LibraryEditorComponent_Conditional_60_Template, 3, 5, "div", 39);
      \u0275\u0275conditionalCreate(61, LibraryEditorComponent_Conditional_61_Template, 22, 3, "div", 40);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(62, LibraryEditorComponent_Conditional_62_Template, 1, 2, "app-rune-table", 41);
      \u0275\u0275conditionalCreate(63, LibraryEditorComponent_Conditional_63_Template, 1, 2, "app-material-table", 41);
      \u0275\u0275template(64, LibraryEditorComponent_ng_template_64_Template, 8, 10, "ng-template", null, 0, \u0275\u0275templateRefExtractor);
    }
    if (rf & 2) {
      let tmp_1_0;
      let tmp_7_0;
      \u0275\u0275advance(6);
      \u0275\u0275textInterpolate(((tmp_1_0 = ctx.library()) == null ? null : tmp_1_0.name) || "Bibliothek");
      \u0275\u0275advance(5);
      \u0275\u0275property("ngModel", ctx.searchQuery());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.searchQuery() ? 12 : -1);
      \u0275\u0275advance(4);
      \u0275\u0275classProp("active", ctx.viewMode() === "grid");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.viewMode() === "list");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.showWeaponGenerator());
      \u0275\u0275advance(2);
      \u0275\u0275conditional((tmp_7_0 = ctx.showLibrarySettings() && ctx.library()) ? 22 : -1, tmp_7_0);
      \u0275\u0275advance(7);
      \u0275\u0275repeater(ctx.getRootFolders());
      \u0275\u0275advance(6);
      \u0275\u0275repeater(ctx.breadcrumbs());
      \u0275\u0275advance(10);
      \u0275\u0275conditional(ctx.showCreateMenu() ? 45 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.clipboard.hasData() ? 46 : -1);
      \u0275\u0275advance(10);
      \u0275\u0275conditional(ctx.isLoading() ? 56 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.searchResults() ? 57 : 58);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.showWeaponGenerator() ? 59 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.contextMenuPosition() ? 60 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.editingFile() && ctx.editingType() ? 61 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showRuneTable() ? 62 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showMaterialTable() ? 63 : -1);
    }
  }, dependencies: [
    CommonModule,
    NgTemplateOutlet,
    FormsModule,
    NgSelectOption,
    \u0275NgSelectMultipleOption,
    DefaultValueAccessor,
    NumberValueAccessor,
    CheckboxControlValueAccessor,
    SelectMultipleControlValueAccessor,
    NgControlStatus,
    MinValidator,
    NgModel,
    ItemEditorComponent,
    RuneEditorComponent,
    RuneTableComponent,
    SpellEditorOverlayComponent,
    SkillEditorComponent,
    StatusEffectEditorComponent,
    MacroEditorComponent,
    MaterialEditorComponent,
    ForgeTraitEditorComponent,
    BrewTraitEditorComponent,
    IngredientEditorComponent,
    ExtractorEditorComponent,
    MaterialTableComponent,
    WeaponGeneratorComponent,
    NpcEditorComponent,
    ImageUrlPipe
  ], styles: ['\n\n.library-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  background: #1e1e1e;\n  color: #e0e0e0;\n  font-family:\n    "Segoe UI",\n    Tahoma,\n    Geneva,\n    Verdana,\n    sans-serif;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.browser-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 20px;\n  background: #2d2d2d;\n  border-bottom: 1px solid #3d3d3d;\n}\n.header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.back-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #555;\n  color: #ccc;\n  padding: 6px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.back-btn[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n  border-color: #666;\n}\n.browser-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 500;\n  color: #fff;\n}\n.settings-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #555;\n  color: #ccc;\n  padding: 6px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-size: 0.9rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.settings-btn[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n  border-color: #0078d4;\n  color: #fff;\n}\n.header-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.search-box[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  background: #3d3d3d;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.search-box[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #e0e0e0;\n  padding: 8px 12px;\n  width: 200px;\n  outline: none;\n}\n.search-box[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\n  color: #888;\n}\n.clear-search[_ngcontent-%COMP%], \n.search-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 8px;\n  cursor: pointer;\n}\n.clear-search[_ngcontent-%COMP%]:hover, \n.search-btn[_ngcontent-%COMP%]:hover {\n  color: #fff;\n}\n.view-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  background: #3d3d3d;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.view-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 8px 12px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.view-toggle[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  color: #fff;\n}\n.view-toggle[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {\n  background: #0078d4;\n  color: #fff;\n}\n.generator-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  border-left: 1px solid #4a4a4a;\n  color: #888;\n  padding: 8px 12px;\n  cursor: pointer;\n  font-size: 16px;\n  transition: all 0.15s;\n}\n.generator-btn[_ngcontent-%COMP%]:hover {\n  color: #fff;\n}\n.generator-btn.active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  color: #a78bfa;\n}\n.library-settings-panel[_ngcontent-%COMP%] {\n  background: #2a2a2a;\n  border-bottom: 1px solid #3d3d3d;\n  padding: 1.5rem;\n  animation: _ngcontent-%COMP%_slideDown 0.2s ease-out;\n}\n@keyframes _ngcontent-%COMP%_slideDown {\n  from {\n    max-height: 0;\n    opacity: 0;\n  }\n  to {\n    max-height: 500px;\n    opacity: 1;\n  }\n}\n.settings-content[_ngcontent-%COMP%] {\n  max-width: 1200px;\n  margin: 0 auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.settings-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1.5rem;\n}\n.settings-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.settings-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  color: #94a3b8;\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.settings-group[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%], \n.settings-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  background: #1e1e1e;\n  border: 1px solid #3d3d3d;\n  border-radius: 4px;\n  color: #e0e0e0;\n  font-size: 0.95rem;\n}\n.settings-group[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%]:focus, \n.settings-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #0078d4;\n}\n.dependencies-select[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n  background: #1e1e1e;\n  border: 1px solid #3d3d3d;\n  border-radius: 4px;\n  color: #e0e0e0;\n  font-size: 0.9rem;\n  min-height: 100px;\n}\n.dependencies-select[_ngcontent-%COMP%]   option[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n  background: #2a2a2a;\n  color: #e0e0e0;\n}\n.dependencies-select[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]:checked {\n  background: #0078d4;\n  color: white;\n}\n.dependencies-help[_ngcontent-%COMP%] {\n  color: #94a3b8;\n  font-size: 0.8rem;\n  font-style: italic;\n  margin-top: 0.25rem;\n}\n.checkbox-group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding-top: 1.5rem;\n}\n.checkbox-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  color: #e0e0e0;\n  font-size: 0.95rem;\n}\n.checkbox-group[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n}\n.settings-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  justify-content: flex-end;\n  padding-top: 1rem;\n  border-top: 1px solid #3d3d3d;\n}\n.settings-actions[_ngcontent-%COMP%]   .save-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: #0078d4;\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.settings-actions[_ngcontent-%COMP%]   .save-btn[_ngcontent-%COMP%]:hover {\n  background: #0056b3;\n}\n.settings-actions[_ngcontent-%COMP%]   .cancel-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: #3d3d3d;\n  border: 1px solid #555;\n  border-radius: 4px;\n  color: #e0e0e0;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.settings-actions[_ngcontent-%COMP%]   .cancel-btn[_ngcontent-%COMP%]:hover {\n  background: #4d4d4d;\n}\n.settings-actions[_ngcontent-%COMP%]   .reload-deps-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.25rem;\n  background: rgba(107, 70, 193, 0.18);\n  border: 1px solid rgba(107, 70, 193, 0.45);\n  border-radius: 4px;\n  color: #c4b5fd;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.settings-actions[_ngcontent-%COMP%]   .reload-deps-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(107, 70, 193, 0.35);\n}\n.browser-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  overflow: hidden;\n}\n.folder-tree[_ngcontent-%COMP%] {\n  width: 240px;\n  background: #252525;\n  border-right: 1px solid #3d3d3d;\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n}\n.tree-header[_ngcontent-%COMP%] {\n  padding: 12px 16px;\n  background: #2d2d2d;\n  border-bottom: 1px solid #3d3d3d;\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #888;\n}\n.tree-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n.tree-node[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 6px 8px;\n  cursor: pointer;\n  transition: background 0.1s;\n}\n.tree-node[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n}\n.tree-node.selected[_ngcontent-%COMP%] {\n  background: #0078d4;\n}\n.expand-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 2px 4px;\n  cursor: pointer;\n  font-size: 10px;\n  transition: transform 0.15s;\n  width: 16px;\n}\n.expand-btn.expanded[_ngcontent-%COMP%] {\n  transform: rotate(90deg);\n}\n.expand-btn.hidden[_ngcontent-%COMP%] {\n  visibility: hidden;\n}\n.node-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n}\n.node-name[_ngcontent-%COMP%] {\n  font-size: 13px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex: 1;\n}\n.content-area[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  position: relative;\n}\n.content-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 16px;\n  background: #2d2d2d;\n  border-bottom: 1px solid #3d3d3d;\n  gap: 16px;\n}\n.toolbar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  flex: 1;\n  min-width: 0;\n}\n.toolbar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.breadcrumbs[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  overflow-x: auto;\n  white-space: nowrap;\n}\n.crumb[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 4px 8px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 0.15s;\n}\n.crumb[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n  color: #fff;\n}\n.crumb.current[_ngcontent-%COMP%] {\n  color: #fff;\n  font-weight: 500;\n}\n.separator[_ngcontent-%COMP%] {\n  color: #555;\n  font-size: 12px;\n}\n.rune-table-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #4c3d8a;\n  color: #a78bfa;\n  padding: 7px 13px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.82rem;\n  font-weight: 600;\n  transition: background 0.15s, border-color 0.15s;\n}\n.rune-table-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.12);\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.rune-table-btn.material-table-btn[_ngcontent-%COMP%] {\n  border-color: #1f5c52;\n  color: #34d399;\n}\n.rune-table-btn.material-table-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(52, 211, 153, 0.1);\n  border-color: #34d399;\n  color: #6ee7b7;\n}\n.create-dropdown[_ngcontent-%COMP%] {\n  position: relative;\n}\n.create-btn[_ngcontent-%COMP%] {\n  background: #0078d4;\n  border: none;\n  color: #fff;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-weight: 500;\n  transition: background 0.15s;\n}\n.create-btn[_ngcontent-%COMP%]:hover {\n  background: #1084d8;\n}\n.create-menu[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 100%;\n  right: 0;\n  margin-top: 4px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  padding: 4px 0;\n  z-index: 100;\n  min-width: 180px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.create-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  text-align: left;\n  background: transparent;\n  border: none;\n  color: #e0e0e0;\n  padding: 10px 16px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.1s;\n}\n.create-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n}\n.create-menu[_ngcontent-%COMP%]   hr[_ngcontent-%COMP%] {\n  border: none;\n  border-top: 1px solid #3d3d3d;\n  margin: 4px 0;\n}\n.clipboard-info[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #888;\n  background: #3d3d3d;\n  padding: 4px 8px;\n  border-radius: 4px;\n}\n.sort-select[_ngcontent-%COMP%] {\n  background: #3d3d3d;\n  border: none;\n  color: #e0e0e0;\n  padding: 8px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 13px;\n}\n.loading-overlay[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  background: rgba(30, 30, 30, 0.8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 50;\n}\n.spinner[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  border: 3px solid #3d3d3d;\n  border-top-color: #0078d4;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n@keyframes _ngcontent-%COMP%_spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.folder-contents[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n}\n.section-header[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #888;\n  margin-bottom: 12px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #3d3d3d;\n}\n.folders-grid[_ngcontent-%COMP%]    + .section-header[_ngcontent-%COMP%], \n.files-grid[_ngcontent-%COMP%]    + .section-header[_ngcontent-%COMP%] {\n  margin-top: 24px;\n}\n.folders-grid[_ngcontent-%COMP%], \n.files-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));\n  gap: 12px;\n}\n.folder-item[_ngcontent-%COMP%], \n.file-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 16px 12px;\n  background: #2d2d2d;\n  border: 1px solid transparent;\n  border-radius: 6px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.folder-item[_ngcontent-%COMP%]:hover, \n.file-item[_ngcontent-%COMP%]:hover {\n  background: #353535;\n  border-color: #555;\n}\n.folder-item.selected[_ngcontent-%COMP%], \n.file-item.selected[_ngcontent-%COMP%] {\n  background: #0078d4;\n  border-color: #0078d4;\n}\n.folder-item.cut[_ngcontent-%COMP%], \n.file-item.cut[_ngcontent-%COMP%] {\n  opacity: 0.5;\n}\n.folder-icon[_ngcontent-%COMP%], \n.file-icon[_ngcontent-%COMP%] {\n  font-size: 48px;\n  margin-bottom: 8px;\n  width: 56px;\n  height: 56px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.rune-file-icon-img[_ngcontent-%COMP%] {\n  width: 56px;\n  height: 56px;\n  object-fit: contain;\n  border-radius: 6px;\n  background: #0a0d14;\n}\n.folder-name[_ngcontent-%COMP%], \n.file-name[_ngcontent-%COMP%] {\n  font-size: 13px;\n  text-align: center;\n  word-break: break-word;\n  line-height: 1.3;\n  max-height: 2.6em;\n  overflow: hidden;\n}\n.file-type[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: #888;\n  margin-top: 4px;\n}\n.file-path[_ngcontent-%COMP%] {\n  font-size: 10px;\n  color: #666;\n  margin-top: 4px;\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.list-view[_ngcontent-%COMP%]   .folders-grid[_ngcontent-%COMP%], \n.list-view[_ngcontent-%COMP%]   .files-grid[_ngcontent-%COMP%], \n.folders-grid.list-mode[_ngcontent-%COMP%], \n.files-grid.list-mode[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.list-mode[_ngcontent-%COMP%]   .folder-item[_ngcontent-%COMP%], \n.list-mode[_ngcontent-%COMP%]   .file-item[_ngcontent-%COMP%] {\n  flex-direction: row;\n  padding: 8px 12px;\n  gap: 12px;\n}\n.list-mode[_ngcontent-%COMP%]   .folder-icon[_ngcontent-%COMP%], \n.list-mode[_ngcontent-%COMP%]   .file-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  margin: 0;\n}\n.list-mode[_ngcontent-%COMP%]   .folder-name[_ngcontent-%COMP%], \n.list-mode[_ngcontent-%COMP%]   .file-name[_ngcontent-%COMP%] {\n  flex: 1;\n  text-align: left;\n}\n.list-mode[_ngcontent-%COMP%]   .file-type[_ngcontent-%COMP%] {\n  width: 100px;\n  margin: 0;\n}\n.item-date[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #888;\n  width: 100px;\n  text-align: right;\n}\n.rename-input[_ngcontent-%COMP%] {\n  background: #1e1e1e;\n  border: 1px solid #0078d4;\n  color: #fff;\n  padding: 4px 8px;\n  border-radius: 4px;\n  font-size: 13px;\n  width: 100%;\n  max-width: 120px;\n  text-align: center;\n  outline: none;\n}\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  color: #666;\n}\n.empty-icon[_ngcontent-%COMP%] {\n  font-size: 64px;\n  opacity: 0.5;\n  margin-bottom: 16px;\n}\n.empty-text[_ngcontent-%COMP%] {\n  font-size: 18px;\n  margin-bottom: 8px;\n}\n.empty-hint[_ngcontent-%COMP%] {\n  font-size: 14px;\n}\n.search-results[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n}\n.results-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.results-header[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: #888;\n}\n.results-header[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid #555;\n  color: #888;\n  padding: 4px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.results-header[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n  color: #fff;\n}\n.empty-message[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #666;\n  padding: 40px;\n}\n.context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  padding: 4px 0;\n  z-index: 1000;\n  min-width: 180px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);\n}\n.context-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  text-align: left;\n  background: transparent;\n  border: none;\n  color: #e0e0e0;\n  padding: 10px 16px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.1s;\n}\n.context-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #3d3d3d;\n}\n.context-menu[_ngcontent-%COMP%]   button.danger[_ngcontent-%COMP%] {\n  color: #f44336;\n}\n.context-menu[_ngcontent-%COMP%]   button.danger[_ngcontent-%COMP%]:hover {\n  background: #3d2828;\n}\n.context-menu[_ngcontent-%COMP%]   hr[_ngcontent-%COMP%] {\n  border: none;\n  border-top: 1px solid #3d3d3d;\n  margin: 4px 0;\n}\n.editor-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n}\n.editor-modal[_ngcontent-%COMP%] {\n  background: #2d2d2d;\n  width: 100%;\n  height: 100%;\n  max-width: 100vw;\n  max-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: none;\n  overflow: hidden;\n  border-radius: 0;\n}\n.editor-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n  background: #252525;\n  border-bottom: 1px solid #3d3d3d;\n}\n.editor-header[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 500;\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: #888;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 4px 8px;\n  transition: color 0.15s;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  color: #fff;\n}\n.editor-content[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px;\n}\n.placeholder-editor[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 40px;\n}\n.placeholder-editor[_ngcontent-%COMP%]   pre[_ngcontent-%COMP%] {\n  text-align: left;\n  background: #1e1e1e;\n  padding: 16px;\n  border-radius: 4px;\n  margin: 16px 0;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.placeholder-editor[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: #0078d4;\n  border: none;\n  color: #fff;\n  padding: 10px 24px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n}\n.simple-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n}\n.simple-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.simple-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  color: var(--text);\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.simple-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.simple-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.95rem;\n  font-family: inherit;\n}\n.simple-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.simple-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.editor-note[_ngcontent-%COMP%] {\n  padding: 1rem;\n  background: rgba(0, 120, 212, 0.1);\n  border: 1px solid rgba(0, 120, 212, 0.3);\n  border-radius: 4px;\n  color: #94a3b8;\n  font-size: 0.9rem;\n  text-align: center;\n}\n.editor-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  justify-content: flex-end;\n  padding-top: 1rem;\n  border-top: 1px solid var(--border);\n}\n.editor-actions[_ngcontent-%COMP%]   .save-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: var(--accent);\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.editor-actions[_ngcontent-%COMP%]   .save-btn[_ngcontent-%COMP%]:hover {\n  background: #0056b3;\n  transform: scale(1.05);\n}\n.editor-actions[_ngcontent-%COMP%]   .cancel-btn[_ngcontent-%COMP%] {\n  padding: 0.75rem 1.5rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.editor-actions[_ngcontent-%COMP%]   .cancel-btn[_ngcontent-%COMP%]:hover {\n  background: var(--bg);\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar-track {\n  background: #1e1e1e;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar-thumb {\n  background: #3d3d3d;\n  border-radius: 4px;\n}\n[_ngcontent-%COMP%]::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n@media (max-width: 768px) {\n  .folder-tree[_ngcontent-%COMP%] {\n    width: 180px;\n  }\n  .search-box[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n    width: 150px;\n  }\n  .folders-grid[_ngcontent-%COMP%], \n   .files-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));\n  }\n}\n.folder-item.drag-over[_ngcontent-%COMP%], \n.file-item.drag-over[_ngcontent-%COMP%] {\n  background: rgba(0, 120, 212, 0.3);\n  border: 2px dashed #0078d4;\n  box-shadow: 0 0 8px rgba(0, 120, 212, 0.5);\n}\n.folder-item.dragging[_ngcontent-%COMP%], \n.file-item.dragging[_ngcontent-%COMP%] {\n  opacity: 0.5;\n  transform: scale(0.95);\n}\n.folder-item[draggable=true][_ngcontent-%COMP%], \n.file-item[draggable=true][_ngcontent-%COMP%] {\n  cursor: grab;\n}\n.folder-item[draggable=true][_ngcontent-%COMP%]:active, \n.file-item[draggable=true][_ngcontent-%COMP%]:active {\n  cursor: grabbing;\n}\n.folder-contents[_ngcontent-%COMP%] {\n  position: relative;\n}\n.marquee-selection[_ngcontent-%COMP%] {\n  position: absolute;\n  background: rgba(0, 120, 212, 0.2);\n  border: 1px solid #0078d4;\n  pointer-events: none;\n  z-index: 10;\n}\n.deal-creator[_ngcontent-%COMP%] {\n  background: #252525;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  padding: 20px;\n  margin-bottom: 20px;\n}\n.creator-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.creator-header[_ngcontent-%COMP%]   h5[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 500;\n  color: #fff;\n}\n.mode-selector[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n  margin-top: 16px;\n}\n.mode-btn[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background: #2d2d2d;\n  border: 2px solid #3d3d3d;\n  border-radius: 8px;\n  color: #e0e0e0;\n  cursor: pointer;\n  transition: all 0.2s;\n  min-height: 120px;\n}\n.mode-btn[_ngcontent-%COMP%]:hover {\n  background: #353535;\n  border-color: #0078d4;\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.mode-btn.sell[_ngcontent-%COMP%]:hover {\n  border-color: #28a745;\n}\n.mode-btn.buy[_ngcontent-%COMP%]:hover {\n  border-color: #0078d4;\n}\n.mode-icon[_ngcontent-%COMP%] {\n  font-size: 42px;\n  margin-bottom: 12px;\n}\n.mode-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 600;\n  color: #fff;\n  margin-bottom: 6px;\n}\n.mode-desc[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #999;\n}\n.type-selector[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  margin-top: 16px;\n}\n.type-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 120px;\n  padding: 16px;\n  background: #2d2d2d;\n  border: 2px solid #3d3d3d;\n  border-radius: 6px;\n  color: #e0e0e0;\n  cursor: pointer;\n  transition: all 0.2s;\n  font-size: 14px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n}\n.type-btn[_ngcontent-%COMP%]:hover {\n  background: #353535;\n  border-color: #0078d4;\n  transform: translateY(-2px);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n}\n.hint[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 6px;\n  font-size: 12px;\n  color: #888;\n  font-style: italic;\n}\n.deals-list-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 4px 4px;\n  margin-top: 16px;\n}\n.deals-count[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #888;\n}\n.identify-all-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  color: #aaa;\n  cursor: pointer;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.identify-all-label[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n.identify-all-label[_ngcontent-%COMP%]:hover {\n  color: #ddd;\n}\n.deals-list[_ngcontent-%COMP%], \n.loot-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 16px;\n}\n.deal-card[_ngcontent-%COMP%], \n.loot-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  transition: all 0.2s;\n}\n.deal-card[_ngcontent-%COMP%]:hover, \n.loot-card[_ngcontent-%COMP%]:hover {\n  background: #353535;\n  border-color: #4d4d4d;\n}\n.deal-card.reverse[_ngcontent-%COMP%] {\n  border-left: 3px solid #0078d4;\n}\n.deal-info[_ngcontent-%COMP%], \n.loot-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex: 1;\n}\n.deal-icon[_ngcontent-%COMP%], \n.loot-icon[_ngcontent-%COMP%] {\n  font-size: 24px;\n}\n.deal-details[_ngcontent-%COMP%], \n.loot-details[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.deal-name[_ngcontent-%COMP%], \n.loot-name[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n  color: #fff;\n}\n.deal-meta[_ngcontent-%COMP%], \n.loot-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.deal-price[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: #ffd700;\n  font-weight: 500;\n}\n.deal-badge[_ngcontent-%COMP%] {\n  font-size: 12px;\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-weight: 500;\n}\n.deal-badge.negotiable[_ngcontent-%COMP%] {\n  background: rgba(255, 193, 7, 0.2);\n  color: #ffc107;\n  border: 1px solid rgba(255, 193, 7, 0.3);\n}\n.deal-badge.reverse[_ngcontent-%COMP%] {\n  background: rgba(0, 120, 212, 0.2);\n  color: #0078d4;\n  border: 1px solid rgba(0, 120, 212, 0.3);\n}\n.deal-stock[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #999;\n}\n/*# sourceMappingURL=library-editor.component.css.map */', "\n\n.shop-editor[_ngcontent-%COMP%], \n.loot-bundle-editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n  padding: 1.5rem;\n  max-height: 80vh;\n  overflow-y: auto;\n}\n.shop-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%], \n.loot-bundle-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.shop-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%], \n.loot-bundle-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  color: var(--text);\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.shop-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.shop-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%], \n.loot-bundle-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], \n.loot-bundle-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.95rem;\n  font-family: inherit;\n}\n.shop-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.shop-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus, \n.loot-bundle-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.loot-bundle-editor[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.deals-section[_ngcontent-%COMP%], \n.loot-items-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n.section-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-bottom: 0.75rem;\n  border-bottom: 2px solid var(--border);\n}\n.section-header[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text);\n  font-size: 1.1rem;\n}\n.add-btn[_ngcontent-%COMP%] {\n  padding: 0.5rem 1rem;\n  background: var(--accent);\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.add-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #0056b3;\n  transform: scale(1.05);\n}\n.add-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.deal-creator[_ngcontent-%COMP%], \n.loot-creator[_ngcontent-%COMP%] {\n  padding: 1rem;\n  background: var(--card);\n  border: 2px solid var(--accent);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.creator-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-bottom: 0.75rem;\n  border-bottom: 1px solid var(--border);\n}\n.creator-header[_ngcontent-%COMP%]   h5[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--text);\n  font-size: 1rem;\n}\n.creator-header[_ngcontent-%COMP%]   .cancel-btn[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.5rem;\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.creator-header[_ngcontent-%COMP%]   .cancel-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 0, 0, 0.1);\n  border-color: #ff4444;\n  color: #ff4444;\n}\n.type-selector[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.type-btn[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 120px;\n  padding: 1rem;\n  background: var(--card);\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  color: var(--text);\n  font-size: 1rem;\n  cursor: pointer;\n  transition: all 0.2s;\n  text-align: center;\n}\n.type-btn[_ngcontent-%COMP%]:hover {\n  background: var(--bg);\n  border-color: var(--accent);\n  transform: translateY(-2px);\n}\n.type-btn.active[_ngcontent-%COMP%] {\n  background: var(--accent);\n  border-color: var(--accent);\n  color: white;\n}\n.item-selector[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.95rem;\n  cursor: pointer;\n}\n.item-selector[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.currency-inputs[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.currency-inputs[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 80px;\n  padding: 0.5rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  text-align: center;\n}\n.currency-inputs[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--text-dim);\n  font-weight: 600;\n}\n.checkboxes[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  flex-direction: row !important;\n}\n.checkboxes[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.deals-list[_ngcontent-%COMP%], \n.loot-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  max-height: 400px;\n  overflow-y: auto;\n}\n.deal-card[_ngcontent-%COMP%], \n.loot-item-card[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  transition: all 0.2s;\n}\n.deal-card[_ngcontent-%COMP%]:hover, \n.loot-item-card[_ngcontent-%COMP%]:hover {\n  background: var(--bg);\n  border-color: var(--accent);\n}\n.deal-card.reverse[_ngcontent-%COMP%] {\n  border-left: 4px solid #ff9800;\n}\n.deal-info[_ngcontent-%COMP%], \n.loot-item-info[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  flex: 1;\n}\n.deal-icon[_ngcontent-%COMP%], \n.loot-icon[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n}\n.deal-details[_ngcontent-%COMP%], \n.loot-details[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.deal-name[_ngcontent-%COMP%], \n.loot-name[_ngcontent-%COMP%] {\n  color: var(--text);\n  font-weight: 600;\n}\n.loot-type[_ngcontent-%COMP%] {\n  color: var(--text-dim);\n  font-size: 0.85rem;\n}\n.deal-meta[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n.deal-price[_ngcontent-%COMP%] {\n  color: #ffd700;\n  font-weight: 600;\n}\n.deal-badge[_ngcontent-%COMP%] {\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.8rem;\n  font-weight: 600;\n}\n.deal-badge.negotiable[_ngcontent-%COMP%] {\n  background: rgba(76, 175, 80, 0.2);\n  color: #4caf50;\n}\n.deal-badge.reverse[_ngcontent-%COMP%] {\n  background: rgba(255, 152, 0, 0.2);\n  color: #ff9800;\n}\n.deal-stock[_ngcontent-%COMP%] {\n  color: var(--text-dim);\n  font-size: 0.9rem;\n}\n.icon-btn.delete[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text-dim);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.icon-btn.delete[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 0, 0, 0.1);\n  border-color: #ff4444;\n  color: #ff4444;\n}\n.empty-hint[_ngcontent-%COMP%] {\n  padding: 2rem;\n  text-align: center;\n  color: var(--text-dim);\n  font-style: italic;\n}\n/*# sourceMappingURL=library-editor-shop-bundle-editors.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LibraryEditorComponent, [{
    type: Component,
    args: [{ selector: "app-library-editor", standalone: true, imports: [
      CommonModule,
      FormsModule,
      ImageUrlPipe,
      ItemEditorComponent,
      RuneEditorComponent,
      RuneTableComponent,
      SpellEditorOverlayComponent,
      SkillEditorComponent,
      StatusEffectEditorComponent,
      MacroEditorComponent,
      MaterialEditorComponent,
      ForgeTraitEditorComponent,
      BrewTraitEditorComponent,
      IngredientEditorComponent,
      ExtractorEditorComponent,
      MaterialTableComponent,
      WeaponGeneratorComponent,
      NpcEditorComponent
    ], template: `<div class="library-editor" (click)="closeContextMenu()" (contextmenu)="onContextMenu($event, 'background')">
  <!-- Header -->
  <header class="browser-header">
    <div class="header-left">
      <button class="back-btn" (click)="goBack()">\u2190 Zur\xFCck</button>
      <h1>{{ library()?.name || 'Bibliothek' }}</h1>
      <button class="settings-btn" (click)="toggleLibrarySettings()">\u2699\uFE0F Bibliothekseinstellungen</button>
    </div>
    <div class="header-right">
      <div class="search-box">
        <input
          type="text"
          placeholder="Suche..."
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          (keyup.enter)="search()"
        />
        @if (searchQuery()) {
          <button class="clear-search" (click)="clearSearch()">\u2715</button>
        }
        <button class="search-btn" (click)="search()">\u{1F50D}</button>
      </div>
      <div class="view-toggle">
        <button
          [class.active]="viewMode() === 'grid'"
          (click)="setViewMode('grid')"
          title="Grid View"
        >
          \u25A6
        </button>
        <button
          [class.active]="viewMode() === 'list'"
          (click)="setViewMode('list')"
          title="List View"
        >
          \u2630
        </button>
        <button
          class="generator-btn"
          [class.active]="showWeaponGenerator()"
          (click)="toggleWeaponGenerator()"
          title="Zufallswaffe generieren"
        >
          \u2697
        </button>
      </div>
    </div>
  </header>

  <!-- Library Settings Panel -->
  @if (showLibrarySettings() && library(); as lib) {
    <div class="library-settings-panel">
      <div class="settings-content">
        <div class="settings-row">
          <div class="settings-group">
            <label>Beschreibung:</label>
            <input type="text" [(ngModel)]="lib.description" placeholder="Bibliotheksbeschreibung..." />
          </div>
          <div class="settings-group">
            <label>Tags:</label>
            <input 
              type="text" 
              [value]="lib.tags?.join(', ') || ''" 
              (change)="updateLibraryTags($any($event.target).value)" 
              placeholder="tag1, tag2, tag3" 
            />
          </div>
        </div>
        
        <div class="settings-row">
          <div class="settings-group">
            <label>\u{1F517} Abh\xE4ngigkeiten (Dependencies):</label>
            <select multiple [(ngModel)]="lib.dependencies" size="4" class="dependencies-select">
              @for (otherLib of allLibraries(); track otherLib.id) {
                @if (otherLib.id !== lib.id) {
                  <option [value]="otherLib.id">{{ otherLib.name }}</option>
                }
              }
            </select>
            <div class="dependencies-help">Halte Strg/Cmd um mehrere Bibliotheken auszuw\xE4hlen. Diese Bibliothek kann Items von ausgew\xE4hlten Bibliotheken verwenden. Geladene Items: {{ availableItems().length + availableRunes().length + availableSpells().length + availableSkills().length + availableStatusEffects().length }}</div>
          </div>
          
          <div class="settings-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="lib.isPublic" />
              \xD6ffentliche Bibliothek
            </label>
          </div>
        </div>
        
        <div class="settings-actions">
          <button class="save-btn" (click)="saveLibrarySettings(); toggleLibrarySettings()">\u2713 Speichern</button>
          <button class="reload-deps-btn" (click)="loadDependencyItems()" title="Abh\xE4ngigkeiten neu laden">\u21BA Abh\xE4ngigkeiten neu laden</button>
          <button class="cancel-btn" (click)="toggleLibrarySettings()">\u2715 Abbrechen</button>
        </div>
      </div>
    </div>
  }

  <div class="browser-body">
    <!-- Sidebar: Folder Tree -->
    <aside class="folder-tree">
      <div class="tree-header">
        <span>Ordner</span>
      </div>
      <div class="tree-content">
        @for (folder of getRootFolders(); track folder.id) {
          <ng-container *ngTemplateOutlet="folderNode; context: { folder: folder, depth: 0 }"></ng-container>
        }
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content-area">
      <!-- Toolbar -->
      <div class="content-toolbar">
        <div class="toolbar-left">
          <!-- Breadcrumbs -->
          <nav class="breadcrumbs">
            @for (crumb of breadcrumbs(); track crumb.id; let last = $last) {
              <button
                class="crumb"
                [class.current]="last"
                (click)="navigateToFolder(crumb.id)"
              >
                {{ crumb.name }}
              </button>
              @if (!last) {
                <span class="separator">/</span>
              }
            }
          </nav>
        </div>
        <div class="toolbar-right">
          <!-- Rune Table Button -->
          <button class="rune-table-btn" (click)="showRuneTable.set(true)"
                  title="Alle Runen in Tabellenansicht bearbeiten">
            \u2728 Rune-Tabelle
          </button>
          <!-- Material Table Button -->
          <button class="rune-table-btn material-table-btn" (click)="showMaterialTable.set(true)"
                  title="Alle Materialien in Tabellenansicht bearbeiten">
            \u2699\uFE0F Material-Tabelle
          </button>

          <!-- Create Button -->
          <div class="create-dropdown">
            <button class="create-btn" (click)="toggleCreateMenu(); $event.stopPropagation()">
              + Neu
            </button>
            @if (showCreateMenu()) {
              <div class="create-menu" (click)="$event.stopPropagation()">
                <button (click)="createFolder()">\u{1F4C1} Neuer Ordner</button>
                <hr />
                <button (click)="createFile('item')">\u{1F4E6} Neues Item</button>
                <button (click)="createFile('spell')">\u{1F4D6} Neuer Zauber</button>
                <button (click)="createFile('rune')">\u2728 Neue Rune</button>
                <button (click)="createFile('skill')">\u2694\uFE0F Neue F\xE4higkeit</button>
                <button (click)="createFile('status-effect')">\u{1F3AD} Neuer Status-Effekt</button>
                <button (click)="createFile('macro')">\u26A1 Neues Makro</button>
                <button (click)="createFile('material')">\u2699\uFE0F Neues Material</button>
                <button (click)="createFile('forge-trait')">\u{1F525} Neues Schmiedemerkmal</button>
                <button (click)="createFile('brew-trait')">\u2697\uFE0F Neues Braumerkmal</button>
                <button (click)="createFile('ingredient')">\u{1F33F} Neuer Wirkstoff</button>
                <button (click)="createFile('extractor')">\u{1F9EA} Neuer Extraktor</button>
                <button (click)="createFile('statblock')">\u{1F464} Neues NSC-Statblock</button>
              </div>
            }
          </div>

          <!-- Clipboard Info -->
          @if (clipboard.hasData()) {
            <span class="clipboard-info">{{ clipboard.getInfo() }}</span>
          }

          <!-- Sort Dropdown -->
          <select class="sort-select" (change)="setSortField($any($event.target).value)">
            <option value="name">Nach Name</option>
            <option value="type">Nach Typ</option>
            <option value="createdAt">Nach Erstellt</option>
            <option value="updatedAt">Nach Ge\xE4ndert</option>
          </select>
        </div>
      </div>

      <!-- Loading Indicator -->
      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      }

      <!-- Search Results -->
      @if (searchResults()) {
        <div class="search-results">
          <div class="results-header">
            <span>Suchergebnisse ({{ searchResults()!.length }})</span>
            <button (click)="clearSearch()">Zur\xFCcksetzen</button>
          </div>
          <div class="files-grid">
            @for (file of searchResults(); track file.id) {
              <div
                class="file-item"
                [class.selected]="isSelected(file.id)"
                (click)="selectItem(file.id, false, $event)"
                (dblclick)="onDoubleClick(file.id, false, $event)"
                (contextmenu)="onContextMenu($event, 'file', file.id)"
              >
                <div class="file-icon">
                  @if (file.type === 'rune' && file.data?.drawing) {
                    <img [src]="file.data.drawing | imageUrl" class="rune-file-icon-img" alt="">
                  } @else {
                    {{ file.icon || getAssetIcon(file.type) }}
                  }
                </div>
                <div class="file-name">{{ file.name }}</div>
                <div class="file-path">{{ file.path }}</div>
              </div>
            } @empty {
              <div class="empty-message">Keine Ergebnisse gefunden</div>
            }
          </div>
        </div>
      } @else {
        <!-- Normal Folder Contents -->
        <div class="folder-contents" [class.list-view]="viewMode() === 'list'" (mousedown)="onContentAreaMouseDown($event)">
          <!-- Marquee Selection Overlay -->
          @if (isMarqueeSelecting() && marqueeRect()) {
            <div class="marquee-selection" [style.left.px]="marqueeRect()!.left" [style.top.px]="marqueeRect()!.top" [style.width.px]="marqueeRect()!.width" [style.height.px]="marqueeRect()!.height"></div>
          }
          <!-- Folders -->
          @if (subfolders().length > 0) {
            <div class="section-header">Ordner</div>
            <div class="folders-grid" [class.list-mode]="viewMode() === 'list'">
              @for (folder of subfolders(); track folder.id) {
                <div
                  class="folder-item"
                  [attr.data-id]="folder.id"
                  [attr.data-type]="'folder'"
                  [class.selected]="isSelected(folder.id)"
                  [class.cut]="isCutItem(folder.id)"
                  [class.drag-over]="dragOverFolderId() === folder.id"
                  [class.dragging]="draggedIds().has(folder.id)"
                  draggable="true"
                  (dragstart)="onDragStart($event, folder.id, true)"
                  (dragend)="onDragEnd($event)"
                  (dragover)="onDragOver($event, folder.id)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event, folder.id)"
                  (click)="selectItem(folder.id, true, $event)"
                  (dblclick)="onDoubleClick(folder.id, true, $event)"
                  (contextmenu)="onContextMenu($event, 'folder', folder.id)"
                >
                  <div class="folder-icon">\u{1F4C1}</div>
                  @if (isRenaming() === folder.id) {
                    <input
                      type="text"
                      class="rename-input"
                      [ngModel]="renameValue()"
                      (ngModelChange)="renameValue.set($event)"
                      (keyup.enter)="confirmRename()"
                      (keyup.escape)="cancelRename()"
                      (blur)="confirmRename()"
                      (click)="$event.stopPropagation()"
                      autofocus
                    />
                  } @else {
                    <div class="folder-name">{{ folder.name }}</div>
                  }
                  @if (viewMode() === 'list') {
                    <div class="item-date">{{ formatDate(folder.updatedAt) }}</div>
                  }
                </div>
              }
            </div>
          }

          <!-- Files -->
          @if (files().length > 0) {
            <div class="section-header">Dateien</div>
            <div class="files-grid" [class.list-mode]="viewMode() === 'list'">
              @for (file of files(); track file.id) {
                <div
                  class="file-item"
                  [attr.data-id]="file.id"
                  [attr.data-type]="'file'"
                  [class.selected]="isSelected(file.id)"
                  [class.cut]="isCutItem(file.id)"
                  [class.dragging]="draggedIds().has(file.id)"
                  draggable="true"
                  (dragstart)="onDragStart($event, file.id, false)"
                  (dragend)="onDragEnd($event)"
                  (click)="selectItem(file.id, false, $event)"
                  (dblclick)="onDoubleClick(file.id, false, $event)"
                  (contextmenu)="onContextMenu($event, 'file', file.id)"
                >
                  <div class="file-icon">
                    @if (file.type === 'rune' && file.data?.drawing) {
                      <img [src]="file.data.drawing | imageUrl" class="rune-file-icon-img" alt="">
                    } @else {
                      {{ file.icon || getAssetIcon(file.type) }}
                    }
                  </div>
                  @if (isRenaming() === file.id) {
                    <input
                      type="text"
                      class="rename-input"
                      [ngModel]="renameValue()"
                      (ngModelChange)="renameValue.set($event)"
                      (keyup.enter)="confirmRename()"
                      (keyup.escape)="cancelRename()"
                      (blur)="confirmRename()"
                      (click)="$event.stopPropagation()"
                      autofocus
                    />
                  } @else {
                    <div class="file-name">{{ file.name }}</div>
                  }
                  <div class="file-type">{{ getAssetTypeName(file.type) }}</div>
                  @if (viewMode() === 'list') {
                    <div class="item-date">{{ formatDate(file.updatedAt) }}</div>
                  }
                </div>
              }
            </div>
          }

          <!-- Empty State -->
          @if (subfolders().length === 0 && files().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">\u{1F4C2}</div>
              <div class="empty-text">Dieser Ordner ist leer</div>
              <div class="empty-hint">Klicke "Neu" um Inhalte hinzuzuf\xFCgen</div>
            </div>
          }
        </div>
      }
    </main>

    <!-- Weapon Generator Side Panel -->
    @if (showWeaponGenerator()) {
      <app-weapon-generator
        (itemCreated)="onGeneratedItemCreated($event)"
        (closePanel)="showWeaponGenerator.set(false)"
      ></app-weapon-generator>
    }
  </div>

  <!-- Context Menu -->
  @if (contextMenuPosition()) {
    <div
      class="context-menu"
      [style.left.px]="contextMenuPosition()!.x"
      [style.top.px]="contextMenuPosition()!.y"
      (click)="$event.stopPropagation()"
    >
      @if (contextMenuTarget()) {
        <button (click)="openItem(contextMenuTarget()!.id); closeContextMenu()">
          {{ contextMenuTarget()!.type === 'folder' ? '\u{1F4C2} \xD6ffnen' : '\u270F\uFE0F Bearbeiten' }}
        </button>
        <button (click)="startRename(contextMenuTarget()!.id); closeContextMenu()">\u{1F4DD} Umbenennen</button>
        <hr />
        <button (click)="copySelected(); closeContextMenu()">\u{1F4CB} Kopieren (Strg+C)</button>
        <button (click)="cutSelected(); closeContextMenu()">\u2702\uFE0F Ausschneiden (Strg+X)</button>
        @if (clipboard.canPaste()) {
          <button (click)="paste(); closeContextMenu()">\u{1F4E5} Einf\xFCgen (Strg+V)</button>
        }
        <hr />
        <button class="danger" (click)="deleteSelected(); closeContextMenu()">\u{1F5D1}\uFE0F L\xF6schen</button>
      } @else {
        <button (click)="createFolder(); closeContextMenu()">\u{1F4C1} Neuer Ordner</button>
        <hr />
        <button (click)="createFile('item'); closeContextMenu()">\u{1F4E6} Neues Item</button>
        <button (click)="createFile('spell'); closeContextMenu()">\u{1F4D6} Neuer Zauber</button>
        <button (click)="createFile('rune'); closeContextMenu()">\u2728 Neue Rune</button>
        <button (click)="createFile('skill'); closeContextMenu()">\u2694\uFE0F Neue F\xE4higkeit</button>
        <button (click)="createFile('status-effect'); closeContextMenu()">\u{1F3AD} Neuer Status-Effekt</button>
        <button (click)="createFile('macro'); closeContextMenu()">\u26A1 Neues Makro</button>
        <button (click)="createFile('material'); closeContextMenu()">\u2699\uFE0F Neues Material</button>
        <button (click)="createFile('forge-trait'); closeContextMenu()">\u{1F525} Neues Schmiedemerkmal</button>
        <button (click)="createFile('brew-trait'); closeContextMenu()">\u2697\uFE0F Neues Braumerkmal</button>
        <button (click)="createFile('ingredient'); closeContextMenu()">\u{1F33F} Neuer Wirkstoff</button>
        <button (click)="createFile('extractor'); closeContextMenu()">\u{1F9EA} Neuer Extraktor</button>
        <button (click)="createFile('shop'); closeContextMenu()">\u{1F3EA} Neuer Handel</button>
        <button (click)="createFile('loot-bundle'); closeContextMenu()">\u{1F4B0} Neue Beute</button>
        <button (click)="createFile('statblock'); closeContextMenu()">\u{1F464} Neues NSC-Statblock</button>
        @if (clipboard.canPaste()) {
          <hr />
          <button (click)="paste(); closeContextMenu()">\u{1F4E5} Einf\xFCgen (Strg+V)</button>
        }
      }
    </div>
  }

  <!-- Editor Modals -->
  @if (editingFile() && editingType()) {
    <div class="editor-overlay">
      <div class="editor-modal">
        <div class="editor-header">
          <span>{{ getAssetIcon(editingType()!) }} {{ getAssetTypeName(editingType()!) }} bearbeiten</span>
          <button class="close-btn" (click)="closeEditor()">\u2715</button>
        </div>
        <div class="editor-content">
          @switch (editingType()) {
            @case ('item') {
              <app-item-editor
                [item]="editingFile()!.data"
                [sheet]="dummySheet"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('rune') {
              <app-rune-editor
                [rune]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('spell') {
              <app-spell-editor-overlay
                [spell]="editingFile()!.data"
                [availableRunes]="availableRunesAsBlocks"
                (save)="saveEditor($event, false)"
                (cancel)="closeEditor()"
                (deleteSpell)="closeEditor()">
              </app-spell-editor-overlay>
            }
            @case ('skill') {
              <app-skill-editor
                [skill]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('status-effect') {
              <app-status-effect-editor
                [statusEffect]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('macro') {
              <app-macro-editor
                [macro]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('material') {
              <app-material-editor
                [material]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('forge-trait') {
              <app-forge-trait-editor
                [trait]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('brew-trait') {
              <app-brew-trait-editor
                [trait]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('ingredient') {
              <app-ingredient-editor
                [ingredient]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('extractor') {
              <app-extractor-editor
                [extractor]="editingFile()!.data"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('statblock') {
              <app-npc-editor
                [statblock]="editingFile()!.data"
                [availableSpells]="availableSpells()"
                [availableItems]="availableItems()"
                [availableSkills]="availableSkills()"
                [availableRunes]="availableRunesAsBlocks"
                [availableMaterials]="availableMaterials()"
                [availableForgeTraits]="availableForgeTraits()"
                (save)="saveEditor($event)"
                (cancel)="closeEditor()"
              />
            }
            @case ('shop') {
              <div class="shop-editor">
                <div class="form-group">
                  <label>Shop Name:</label>
                  <input type="text" [(ngModel)]="editingFile()!.data.name" placeholder="z.B. H\xE4ndler des Vertrauens" />
                </div>
                <div class="form-group">
                  <label>Beschreibung:</label>
                  <textarea [(ngModel)]="editingFile()!.data.description" rows="3" placeholder="Beschreibe den Shop..."></textarea>
                </div>

                <!-- Deals Section -->
                <div class="deals-section">
                  <div class="section-header">
                    <h4>Deals ({{ editingFile()!.data.deals?.length || 0 }})</h4>
                    <button class="add-btn" (click)="startAddingDealToShop()" [disabled]="addingDealToShop()">+ Deal</button>
                  </div>

                  <!-- Add Deal UI -->
                  @if (addingDealToShop()) {
                    <div class="deal-creator">
                      @if (!dealMode()) {
                        <!-- Step 0: Select Deal Mode -->
                        <div class="creator-header">
                          <h5>W\xE4hle Deal-Modus</h5>
                          <button class="cancel-btn" (click)="cancelAddingDeal()">\u2715</button>
                        </div>
                        <div class="mode-selector">
                          <button class="mode-btn sell" (click)="selectDealMode('sell')">
                            <span class="mode-icon">\u{1F6CD}\uFE0F</span>
                            <span class="mode-title">Handel Verkauft</span>
                            <span class="mode-desc">Spieler kauft vom Handel</span>
                          </button>
                          <button class="mode-btn buy" (click)="selectDealMode('buy')">
                            <span class="mode-icon">\u{1F4B0}</span>
                            <span class="mode-title">Handel Kauft An</span>
                            <span class="mode-desc">Spieler verkauft an Handel</span>
                          </button>
                        </div>
                      } @else if (dealMode() === 'sell' && !editingDealData()) {
                        <!-- Step 1: Select Item Type (for sell mode) -->
                        <div class="creator-header">
                          <h5>W\xE4hle Item-Typ</h5>
                          <button class="cancel-btn" (click)="cancelAddingDeal()">\u2715</button>
                        </div>
                        <div class="type-selector">
                          <button class="type-btn" (click)="selectDealItemType('item')">\u{1F4E6} Item</button>
                          <button class="type-btn" (click)="selectDealItemType('rune')">\u2728 Rune</button>
                          <button class="type-btn" (click)="selectDealItemType('spell')">\u{1F4D6} Zauber</button>
                          <button class="type-btn" (click)="selectDealItemType('skill')">\u2694\uFE0F Talent</button>
                          <button class="type-btn" (click)="selectDealItemType('status-effect')">\u{1F3AD} Status</button>
                        </div>
                      } @else if (dealMode() === 'sell' && editingDealData()) {
                        <!-- Step 2: Select Item & Configure Deal (sell mode) -->
                        <div class="creator-header">
                          <h5>Deal konfigurieren (Verkauf)</h5>
                          <button class="cancel-btn" (click)="cancelAddingDeal()">\u2715</button>
                        </div>

                        <!-- Item Selection -->
                        <div class="form-group">
                          <label>{{ selectedDealItemType() === 'item' ? 'Item' : selectedDealItemType() === 'rune' ? 'Rune' : selectedDealItemType() === 'spell' ? 'Zauber' : selectedDealItemType() === 'skill' ? 'Fertigkeit' : 'Status-Effekt' }} ausw\xE4hlen:</label>
                          <select class="item-selector" (change)="onDealItemSelected($event)">
                            <option value="">-- Ausw\xE4hlen --</option>
                            @if (selectedDealItemType() === 'item') {
                              @for (item of availableItems(); track item.id) {
                                <option [selected]="selectedDealItemId() === item.id">{{ item.name }}</option>
                              }
                            }
                            @if (selectedDealItemType() === 'rune') {
                              @for (rune of availableRunes(); track rune.id) {
                                <option [selected]="selectedDealItemId() === rune.id">{{ rune.name }}</option>
                              }
                            }
                            @if (selectedDealItemType() === 'spell') {
                              @for (spell of availableSpells(); track spell.id) {
                                <option [selected]="selectedDealItemId() === spell.id">{{ spell.name }}</option>
                              }
                            }
                            @if (selectedDealItemType() === 'skill') {
                              @for (skill of availableSkills(); track skill.id) {
                                <option [selected]="selectedDealItemId() === skill.id">{{ skill.name }}</option>
                              }
                            }
                            @if (selectedDealItemType() === 'status-effect') {
                              @for (status of availableStatusEffects(); track status.id) {
                                <option [selected]="selectedDealItemId() === status.id">{{ status.name }}</option>
                              }
                            }
                          </select>
                        </div>

                        @if (selectedDealItemId()) {
                          <!-- Deal Configuration -->
                          <div class="form-group">
                            <label>Deal Name:</label>
                            <input type="text" [(ngModel)]="editingDealData()!.name" placeholder="z.B. Schwert +1" />
                          </div>

                          <div class="form-group">
                            <label>Preis:</label>
                            <div class="currency-inputs">
                              <input type="number" [(ngModel)]="editingDealData()!.price!.platinum" min="0" placeholder="0" />
                              <span>p</span>
                              <input type="number" [(ngModel)]="editingDealData()!.price!.gold" min="0" placeholder="0" />
                              <span>g</span>
                              <input type="number" [(ngModel)]="editingDealData()!.price!.silver" min="0" placeholder="0" />
                              <span>s</span>
                              <input type="number" [(ngModel)]="editingDealData()!.price!.copper" min="0" placeholder="0" />
                              <span>c</span>
                            </div>
                          </div>

                          <div class="form-group checkboxes">
                            <label><input type="checkbox" [(ngModel)]="editingDealData()!.isNegotiable" /> Verhandelbar</label>
                            <label><input type="checkbox" [checked]="editingDealData()!.identified !== false" (change)="editingDealData()!.identified = $any($event.target).checked" /> Identifiziert (Spieler sehen Details)</label>
                          </div>

                          <div class="form-group">
                            <label>Bestand (leer = unbegrenzt):</label>
                            <input type="number" [(ngModel)]="editingDealData()!.quantity" min="1" placeholder="Unbegrenzt" />
                          </div>

                          <div class="editor-actions">
                            <button class="save-btn" (click)="saveDealToShop()">\u{1F4BE} Deal speichern</button>
                            <button class="cancel-btn" (click)="cancelAddingDeal()">\u2715 Abbrechen</button>
                          </div>
                        }
                      } @else if (dealMode() === 'buy') {
                        <!-- Step 2: Configure Reverse Deal (buy mode) -->
                        <div class="creator-header">
                          <h5>Ankauf konfigurieren</h5>
                          <button class="cancel-btn" (click)="cancelAddingDeal()">\u2715</button>
                        </div>

                        <div class="form-group">
                          <label>Ankauf-Titel:</label>
                          <input type="text" [(ngModel)]="editingDealData()!.name" placeholder="z.B. Schwerter verschiedener Art" />
                        </div>

                        <div class="form-group">
                          <label>Beschreibung (was der Shop ankauft):</label>
                          <textarea 
                            [(ngModel)]="editingDealData()!.reverseDescription" 
                            rows="3" 
                            placeholder="z.B. Beliebige Schwerter, egal welcher Qualit\xE4t. Auch verzauberte Klingen."></textarea>
                          <small class="hint">Diese Beschreibung sehen Spieler. Sei vage oder spezifisch nach Bedarf.</small>
                        </div>

                        <div class="form-group">
                          <label>Ankaufspreis:</label>
                          <div class="currency-inputs">
                            <input type="number" [(ngModel)]="editingDealData()!.price!.platinum" min="0" placeholder="0" />
                            <span>p</span>
                            <input type="number" [(ngModel)]="editingDealData()!.price!.gold" min="0" placeholder="0" />
                            <span>g</span>
                            <input type="number" [(ngModel)]="editingDealData()!.price!.silver" min="0" placeholder="0" />
                            <span>s</span>
                            <input type="number" [(ngModel)]="editingDealData()!.price!.copper" min="0" placeholder="0" />
                            <span>c</span>
                          </div>
                          <small class="hint">Preis, den der Shop pro St\xFCck zahlt.</small>
                        </div>

                        <div class="form-group checkboxes">
                          <label><input type="checkbox" [(ngModel)]="editingDealData()!.isNegotiable" /> Verhandelbar</label>
                        </div>

                        <div class="editor-actions">
                          <button class="save-btn" (click)="saveDealToShop()">\u{1F4BE} Ankauf speichern</button>
                          <button class="cancel-btn" (click)="cancelAddingDeal()">\u2715 Abbrechen</button>
                        </div>
                      }
                    </div>
                  }

                  <!-- Existing Deals List -->
                  @if (editingFile()!.data.deals && editingFile()!.data.deals.length > 0) {
                    <div class="deals-list-header">
                      <span class="deals-count">{{ editingFile()!.data.deals.length }} Deal(s)</span>
                      <label class="identify-all-label">
                        <input type="checkbox"
                               [checked]="allDealsIdentified()"
                               (change)="setAllDealsIdentified($any($event.target).checked)" />
                        Alle identifiziert
                      </label>
                    </div>
                    <div class="deals-list">
                      @for (deal of editingFile()!.data.deals; track deal.id) {
                        <div class="deal-card" [class.reverse]="deal.isReverseDeal">
                          <div class="deal-info">
                            <span class="deal-icon">{{ getDealItemIcon(deal) }}</span>
                            <div class="deal-details">
                              <span class="deal-name">{{ getDealItemName(deal) }}</span>
                              <div class="deal-meta">
                                @if (deal.isNegotiable) {
                                  <span class="deal-badge negotiable">\u{1F4AC} Verhandelbar</span>
                                } @else if (deal.price) {
                                  <span class="deal-price">{{ formatCurrency(deal.price) }}</span>
                                }
                                @if (deal.quantity !== undefined) {
                                  <span class="deal-stock">\u{1F4E6} {{ deal.quantity }}</span>
                                }
                                @if (deal.isReverseDeal) {
                                  <span class="deal-badge reverse">\u2B05 Ankauf</span>
                                }
                              </div>
                            </div>
                          </div>
                          <button class="icon-btn delete" (click)="removeDealFromShop(deal.id)" title="Entfernen">\u2715</button>
                        </div>
                      }
                    </div>
                  } @else if (!addingDealToShop()) {
                    <p class="empty-hint">Keine Deals vorhanden. Klicke auf "+ Deal" um einen hinzuzuf\xFCgen.</p>
                  }
                </div>

                <div class="editor-actions">
                  <button class="save-btn" (click)="saveEditor(editingFile()!.data)">\u2713 Speichern</button>
                  <button class="cancel-btn" (click)="closeEditor()">\u2715 Abbrechen</button>
                </div>
              </div>
            }
            @case ('loot-bundle') {
              <div class="loot-bundle-editor">
                <div class="form-group">
                  <label>Bundle Name:</label>
                  <input type="text" [(ngModel)]="editingFile()!.data.name" placeholder="z.B. Schatztruhe des Drachen" />
                </div>
                <div class="form-group">
                  <label>Beschreibung:</label>
                  <textarea [(ngModel)]="editingFile()!.data.description" rows="3" placeholder="Beschreibe das Loot-B\xFCndel..."></textarea>
                </div>

                <!-- Loot Items Section -->
                <div class="loot-items-section">
                  <div class="section-header">
                    <h4>Loot Items ({{ editingFile()!.data.items?.length || 0 }})</h4>
                    <button class="add-btn" (click)="startAddingLootToBundle()" [disabled]="addingLootToBundle()">+ Item</button>
                  </div>

                  <!-- Add Loot Item UI -->
                  @if (addingLootToBundle()) {
                    <div class="loot-creator">
                      @if (!editingLootItemData()) {
                        <!-- Step 1: Select Item Type -->
                        <div class="creator-header">
                          <h5>W\xE4hle Item-Typ</h5>
                          <button class="cancel-btn" (click)="cancelAddingLootItem()">\u2715</button>
                        </div>
                        <div class="type-selector">
                          <button class="type-btn" (click)="selectLootItemType('item')">\u{1F4E6} Item</button>
                          <button class="type-btn" (click)="selectLootItemType('rune')">\u2728 Rune</button>
                          <button class="type-btn" (click)="selectLootItemType('spell')">\u{1F4D6} Zauber</button>
                          <button class="type-btn" (click)="selectLootItemType('skill')">\u2694\uFE0F Talent</button>
                          <button class="type-btn" (click)="selectLootItemType('status-effect')">\u{1F3AD} Status</button>
                          <button class="type-btn" (click)="selectLootItemType('currency')">\u{1F4B0} W\xE4hrung</button>
                        </div>
                      } @else {
                        <!-- Step 2: Select Item or Configure Currency -->
                        <div class="creator-header">
                          <h5>Loot Item konfigurieren</h5>
                          <button class="cancel-btn" (click)="cancelAddingLootItem()">\u2715</button>
                        </div>

                        @if (selectedLootItemType() === 'currency') {
                          <!-- Currency Configuration -->
                          <div class="form-group">
                            <label>W\xE4hrung:</label>
                            <div class="currency-inputs">
                              <input type="number" [(ngModel)]="$any(editingLootItemData()!.data).platinum" min="0" placeholder="0" />
                              <span>p</span>
                              <input type="number" [(ngModel)]="$any(editingLootItemData()!.data).gold" min="0" placeholder="0" />
                              <span>g</span>
                              <input type="number" [(ngModel)]="$any(editingLootItemData()!.data).silver" min="0" placeholder="0" />
                              <span>s</span>
                              <input type="number" [(ngModel)]="$any(editingLootItemData()!.data).copper" min="0" placeholder="0" />
                              <span>c</span>
                            </div>
                          </div>

                          <div class="editor-actions">
                            <button class="save-btn" (click)="saveLootItemToBundle()">\u{1F4BE} Item hinzuf\xFCgen</button>
                            <button class="cancel-btn" (click)="cancelAddingLootItem()">\u2715 Abbrechen</button>
                          </div>
                        } @else {
                          <!-- Item Selection -->
                          <div class="form-group">
                            <label>{{ selectedLootItemType() === 'item' ? 'Item' : selectedLootItemType() === 'rune' ? 'Rune' : selectedLootItemType() === 'spell' ? 'Zauber' : selectedLootItemType() === 'skill' ? 'Fertigkeit' : 'Status-Effekt' }} ausw\xE4hlen:</label>
                            <select class="item-selector" (change)="onLootItemSelected($event)">
                              <option value="">-- Ausw\xE4hlen --</option>
                              @if (selectedLootItemType() === 'item') {
                                @for (item of availableItems(); track item.id) {
                                  <option [selected]="selectedLootItemId() === item.id">{{ item.name }}</option>
                                }
                              }
                              @if (selectedLootItemType() === 'rune') {
                                @for (rune of availableRunes(); track rune.id) {
                                  <option [selected]="selectedLootItemId() === rune.id">{{ rune.name }}</option>
                                }
                              }
                              @if (selectedLootItemType() === 'spell') {
                                @for (spell of availableSpells(); track spell.id) {
                                  <option [selected]="selectedLootItemId() === spell.id">{{ spell.name }}</option>
                                }
                              }
                              @if (selectedLootItemType() === 'skill') {
                                @for (skill of availableSkills(); track skill.id) {
                                  <option [selected]="selectedLootItemId() === skill.id">{{ skill.name }}</option>
                                }
                              }
                              @if (selectedLootItemType() === 'status-effect') {
                                @for (status of availableStatusEffects(); track status.id) {
                                  <option [selected]="selectedLootItemId() === status.id">{{ status.name }}</option>
                                }
                              }
                            </select>
                          </div>

                          @if (selectedLootItemId()) {
                            <div class="editor-actions">
                              <button class="save-btn" (click)="saveLootItemToBundle()">\u{1F4BE} Item hinzuf\xFCgen</button>
                              <button class="cancel-btn" (click)="cancelAddingLootItem()">\u2715 Abbrechen</button>
                            </div>
                          }
                        }
                      }
                    </div>
                  }

                  <!-- Existing Loot Items List -->
                  @if (editingFile()!.data.items && editingFile()!.data.items.length > 0) {
                    <div class="loot-list">
                      @for (lootItem of editingFile()!.data.items; track lootItem.id) {
                        <div class="loot-item-card">
                          <div class="loot-item-info">
                            <span class="loot-icon">{{ getLootItemIcon(lootItem) }}</span>
                            <div class="loot-details">
                              <span class="loot-name">{{ getLootItemName(lootItem) }}</span>
                              <span class="loot-type">{{ lootItem.type }}</span>
                            </div>
                          </div>
                          <button class="icon-btn delete" (click)="removeLootItemFromBundle(lootItem.id)" title="Entfernen">\u2715</button>
                        </div>
                      }
                    </div>
                  } @else if (!addingLootToBundle()) {
                    <p class="empty-hint">Keine Items vorhanden. Klicke auf "+ Item" um eines hinzuzuf\xFCgen.</p>
                  }
                </div>

                <div class="editor-actions">
                  <button class="save-btn" (click)="saveEditor(editingFile()!.data)">\u2713 Speichern</button>
                  <button class="cancel-btn" (click)="closeEditor()">\u2715 Abbrechen</button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  }
</div>

<!-- Rune Table Overlay -->
@if (showRuneTable()) {
  <app-rune-table
    [libraryId]="libraryId()"
    [folderId]="currentFolderId()"
    (close)="showRuneTable.set(false)"
    (filesChanged)="loadFolderContents(); loadDependencyItems()">
  </app-rune-table>
}

<!-- Material Table Overlay -->
@if (showMaterialTable()) {
  <app-material-table
    [libraryId]="libraryId()"
    [folderId]="currentFolderId()"
    (close)="showMaterialTable.set(false)"
    (filesChanged)="loadFolderContents(); loadDependencyItems()">
  </app-material-table>
}

<!-- Folder Tree Node Template -->
<ng-template #folderNode let-folder="folder" let-depth="depth">
  <div
    class="tree-node"
    [style.paddingLeft.px]="depth * 16 + 8"
    [class.selected]="currentFolderId() === folder.id"
  >
    <button
      class="expand-btn"
      [class.expanded]="isFolderExpanded(folder.id)"
      [class.hidden]="getChildFolders(folder.id).length === 0"
      (click)="toggleFolderExpand(folder.id); $event.stopPropagation()"
    >
      \u25B6
    </button>
    <span class="node-icon">\u{1F4C1}</span>
    <span
      class="node-name"
      (click)="navigateToFolder(folder.id)"
    >
      {{ folder.name }}
    </span>
  </div>
  @if (isFolderExpanded(folder.id)) {
    @for (child of getChildFolders(folder.id); track child.id) {
      <ng-container *ngTemplateOutlet="folderNode; context: { folder: child, depth: depth + 1 }"></ng-container>
    }
  }
</ng-template>
`, styles: ['/* src/app/library-editor/library-editor.component.css */\n.library-editor {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  background: #1e1e1e;\n  color: #e0e0e0;\n  font-family:\n    "Segoe UI",\n    Tahoma,\n    Geneva,\n    Verdana,\n    sans-serif;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.browser-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 20px;\n  background: #2d2d2d;\n  border-bottom: 1px solid #3d3d3d;\n}\n.header-left {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n}\n.back-btn {\n  background: transparent;\n  border: 1px solid #555;\n  color: #ccc;\n  padding: 6px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.back-btn:hover {\n  background: #3d3d3d;\n  border-color: #666;\n}\n.browser-header h1 {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 500;\n  color: #fff;\n}\n.settings-btn {\n  background: transparent;\n  border: 1px solid #555;\n  color: #ccc;\n  padding: 6px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-size: 0.9rem;\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.settings-btn:hover {\n  background: #3d3d3d;\n  border-color: #0078d4;\n  color: #fff;\n}\n.header-right {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.search-box {\n  display: flex;\n  align-items: center;\n  background: #3d3d3d;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.search-box input {\n  background: transparent;\n  border: none;\n  color: #e0e0e0;\n  padding: 8px 12px;\n  width: 200px;\n  outline: none;\n}\n.search-box input::placeholder {\n  color: #888;\n}\n.clear-search,\n.search-btn {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 8px;\n  cursor: pointer;\n}\n.clear-search:hover,\n.search-btn:hover {\n  color: #fff;\n}\n.view-toggle {\n  display: flex;\n  background: #3d3d3d;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.view-toggle button {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 8px 12px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.view-toggle button:hover {\n  color: #fff;\n}\n.view-toggle button.active {\n  background: #0078d4;\n  color: #fff;\n}\n.generator-btn {\n  background: transparent;\n  border: none;\n  border-left: 1px solid #4a4a4a;\n  color: #888;\n  padding: 8px 12px;\n  cursor: pointer;\n  font-size: 16px;\n  transition: all 0.15s;\n}\n.generator-btn:hover {\n  color: #fff;\n}\n.generator-btn.active {\n  background: rgba(139, 92, 246, 0.2);\n  color: #a78bfa;\n}\n.library-settings-panel {\n  background: #2a2a2a;\n  border-bottom: 1px solid #3d3d3d;\n  padding: 1.5rem;\n  animation: slideDown 0.2s ease-out;\n}\n@keyframes slideDown {\n  from {\n    max-height: 0;\n    opacity: 0;\n  }\n  to {\n    max-height: 500px;\n    opacity: 1;\n  }\n}\n.settings-content {\n  max-width: 1200px;\n  margin: 0 auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n.settings-row {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1.5rem;\n}\n.settings-group {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.settings-group label {\n  color: #94a3b8;\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.settings-group input[type=text],\n.settings-group textarea {\n  padding: 0.75rem;\n  background: #1e1e1e;\n  border: 1px solid #3d3d3d;\n  border-radius: 4px;\n  color: #e0e0e0;\n  font-size: 0.95rem;\n}\n.settings-group input[type=text]:focus,\n.settings-group textarea:focus {\n  outline: none;\n  border-color: #0078d4;\n}\n.dependencies-select {\n  padding: 0.5rem;\n  background: #1e1e1e;\n  border: 1px solid #3d3d3d;\n  border-radius: 4px;\n  color: #e0e0e0;\n  font-size: 0.9rem;\n  min-height: 100px;\n}\n.dependencies-select option {\n  padding: 0.5rem;\n  background: #2a2a2a;\n  color: #e0e0e0;\n}\n.dependencies-select option:checked {\n  background: #0078d4;\n  color: white;\n}\n.dependencies-help {\n  color: #94a3b8;\n  font-size: 0.8rem;\n  font-style: italic;\n  margin-top: 0.25rem;\n}\n.checkbox-group {\n  display: flex;\n  align-items: center;\n  padding-top: 1.5rem;\n}\n.checkbox-group label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  color: #e0e0e0;\n  font-size: 0.95rem;\n}\n.checkbox-group input[type=checkbox] {\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n}\n.settings-actions {\n  display: flex;\n  gap: 0.75rem;\n  justify-content: flex-end;\n  padding-top: 1rem;\n  border-top: 1px solid #3d3d3d;\n}\n.settings-actions .save-btn {\n  padding: 0.75rem 1.5rem;\n  background: #0078d4;\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.settings-actions .save-btn:hover {\n  background: #0056b3;\n}\n.settings-actions .cancel-btn {\n  padding: 0.75rem 1.5rem;\n  background: #3d3d3d;\n  border: 1px solid #555;\n  border-radius: 4px;\n  color: #e0e0e0;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.settings-actions .cancel-btn:hover {\n  background: #4d4d4d;\n}\n.settings-actions .reload-deps-btn {\n  padding: 0.75rem 1.25rem;\n  background: rgba(107, 70, 193, 0.18);\n  border: 1px solid rgba(107, 70, 193, 0.45);\n  border-radius: 4px;\n  color: #c4b5fd;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.settings-actions .reload-deps-btn:hover {\n  background: rgba(107, 70, 193, 0.35);\n}\n.browser-body {\n  display: flex;\n  flex: 1;\n  overflow: hidden;\n}\n.folder-tree {\n  width: 240px;\n  background: #252525;\n  border-right: 1px solid #3d3d3d;\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n}\n.tree-header {\n  padding: 12px 16px;\n  background: #2d2d2d;\n  border-bottom: 1px solid #3d3d3d;\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #888;\n}\n.tree-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n.tree-node {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 6px 8px;\n  cursor: pointer;\n  transition: background 0.1s;\n}\n.tree-node:hover {\n  background: #3d3d3d;\n}\n.tree-node.selected {\n  background: #0078d4;\n}\n.expand-btn {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 2px 4px;\n  cursor: pointer;\n  font-size: 10px;\n  transition: transform 0.15s;\n  width: 16px;\n}\n.expand-btn.expanded {\n  transform: rotate(90deg);\n}\n.expand-btn.hidden {\n  visibility: hidden;\n}\n.node-icon {\n  font-size: 14px;\n}\n.node-name {\n  font-size: 13px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex: 1;\n}\n.content-area {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  position: relative;\n}\n.content-toolbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 16px;\n  background: #2d2d2d;\n  border-bottom: 1px solid #3d3d3d;\n  gap: 16px;\n}\n.toolbar-left {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  flex: 1;\n  min-width: 0;\n}\n.toolbar-right {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n.breadcrumbs {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  overflow-x: auto;\n  white-space: nowrap;\n}\n.crumb {\n  background: transparent;\n  border: none;\n  color: #888;\n  padding: 4px 8px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 0.15s;\n}\n.crumb:hover {\n  background: #3d3d3d;\n  color: #fff;\n}\n.crumb.current {\n  color: #fff;\n  font-weight: 500;\n}\n.separator {\n  color: #555;\n  font-size: 12px;\n}\n.rune-table-btn {\n  background: transparent;\n  border: 1px solid #4c3d8a;\n  color: #a78bfa;\n  padding: 7px 13px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.82rem;\n  font-weight: 600;\n  transition: background 0.15s, border-color 0.15s;\n}\n.rune-table-btn:hover {\n  background: rgba(139, 92, 246, 0.12);\n  border-color: #8b5cf6;\n  color: #c4b5fd;\n}\n.rune-table-btn.material-table-btn {\n  border-color: #1f5c52;\n  color: #34d399;\n}\n.rune-table-btn.material-table-btn:hover {\n  background: rgba(52, 211, 153, 0.1);\n  border-color: #34d399;\n  color: #6ee7b7;\n}\n.create-dropdown {\n  position: relative;\n}\n.create-btn {\n  background: #0078d4;\n  border: none;\n  color: #fff;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-weight: 500;\n  transition: background 0.15s;\n}\n.create-btn:hover {\n  background: #1084d8;\n}\n.create-menu {\n  position: absolute;\n  top: 100%;\n  right: 0;\n  margin-top: 4px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  padding: 4px 0;\n  z-index: 100;\n  min-width: 180px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.create-menu button {\n  display: block;\n  width: 100%;\n  text-align: left;\n  background: transparent;\n  border: none;\n  color: #e0e0e0;\n  padding: 10px 16px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.1s;\n}\n.create-menu button:hover {\n  background: #3d3d3d;\n}\n.create-menu hr {\n  border: none;\n  border-top: 1px solid #3d3d3d;\n  margin: 4px 0;\n}\n.clipboard-info {\n  font-size: 12px;\n  color: #888;\n  background: #3d3d3d;\n  padding: 4px 8px;\n  border-radius: 4px;\n}\n.sort-select {\n  background: #3d3d3d;\n  border: none;\n  color: #e0e0e0;\n  padding: 8px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 13px;\n}\n.loading-overlay {\n  position: absolute;\n  inset: 0;\n  background: rgba(30, 30, 30, 0.8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 50;\n}\n.spinner {\n  width: 40px;\n  height: 40px;\n  border: 3px solid #3d3d3d;\n  border-top-color: #0078d4;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}\n@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.folder-contents {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n}\n.section-header {\n  font-size: 12px;\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #888;\n  margin-bottom: 12px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid #3d3d3d;\n}\n.folders-grid + .section-header,\n.files-grid + .section-header {\n  margin-top: 24px;\n}\n.folders-grid,\n.files-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));\n  gap: 12px;\n}\n.folder-item,\n.file-item {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 16px 12px;\n  background: #2d2d2d;\n  border: 1px solid transparent;\n  border-radius: 6px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.folder-item:hover,\n.file-item:hover {\n  background: #353535;\n  border-color: #555;\n}\n.folder-item.selected,\n.file-item.selected {\n  background: #0078d4;\n  border-color: #0078d4;\n}\n.folder-item.cut,\n.file-item.cut {\n  opacity: 0.5;\n}\n.folder-icon,\n.file-icon {\n  font-size: 48px;\n  margin-bottom: 8px;\n  width: 56px;\n  height: 56px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.rune-file-icon-img {\n  width: 56px;\n  height: 56px;\n  object-fit: contain;\n  border-radius: 6px;\n  background: #0a0d14;\n}\n.folder-name,\n.file-name {\n  font-size: 13px;\n  text-align: center;\n  word-break: break-word;\n  line-height: 1.3;\n  max-height: 2.6em;\n  overflow: hidden;\n}\n.file-type {\n  font-size: 11px;\n  color: #888;\n  margin-top: 4px;\n}\n.file-path {\n  font-size: 10px;\n  color: #666;\n  margin-top: 4px;\n  max-width: 100%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.list-view .folders-grid,\n.list-view .files-grid,\n.folders-grid.list-mode,\n.files-grid.list-mode {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.list-mode .folder-item,\n.list-mode .file-item {\n  flex-direction: row;\n  padding: 8px 12px;\n  gap: 12px;\n}\n.list-mode .folder-icon,\n.list-mode .file-icon {\n  font-size: 20px;\n  margin: 0;\n}\n.list-mode .folder-name,\n.list-mode .file-name {\n  flex: 1;\n  text-align: left;\n}\n.list-mode .file-type {\n  width: 100px;\n  margin: 0;\n}\n.item-date {\n  font-size: 12px;\n  color: #888;\n  width: 100px;\n  text-align: right;\n}\n.rename-input {\n  background: #1e1e1e;\n  border: 1px solid #0078d4;\n  color: #fff;\n  padding: 4px 8px;\n  border-radius: 4px;\n  font-size: 13px;\n  width: 100%;\n  max-width: 120px;\n  text-align: center;\n  outline: none;\n}\n.empty-state {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 60px 20px;\n  color: #666;\n}\n.empty-icon {\n  font-size: 64px;\n  opacity: 0.5;\n  margin-bottom: 16px;\n}\n.empty-text {\n  font-size: 18px;\n  margin-bottom: 8px;\n}\n.empty-hint {\n  font-size: 14px;\n}\n.search-results {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n}\n.results-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.results-header span {\n  font-size: 14px;\n  color: #888;\n}\n.results-header button {\n  background: transparent;\n  border: 1px solid #555;\n  color: #888;\n  padding: 4px 12px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n.results-header button:hover {\n  background: #3d3d3d;\n  color: #fff;\n}\n.empty-message {\n  text-align: center;\n  color: #666;\n  padding: 40px;\n}\n.context-menu {\n  position: fixed;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  padding: 4px 0;\n  z-index: 1000;\n  min-width: 180px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);\n}\n.context-menu button {\n  display: block;\n  width: 100%;\n  text-align: left;\n  background: transparent;\n  border: none;\n  color: #e0e0e0;\n  padding: 10px 16px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: background 0.1s;\n}\n.context-menu button:hover {\n  background: #3d3d3d;\n}\n.context-menu button.danger {\n  color: #f44336;\n}\n.context-menu button.danger:hover {\n  background: #3d2828;\n}\n.context-menu hr {\n  border: none;\n  border-top: 1px solid #3d3d3d;\n  margin: 4px 0;\n}\n.editor-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.7);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n}\n.editor-modal {\n  background: #2d2d2d;\n  width: 100%;\n  height: 100%;\n  max-width: 100vw;\n  max-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: none;\n  overflow: hidden;\n  border-radius: 0;\n}\n.editor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n  background: #252525;\n  border-bottom: 1px solid #3d3d3d;\n}\n.editor-header span {\n  font-size: 16px;\n  font-weight: 500;\n}\n.close-btn {\n  background: transparent;\n  border: none;\n  color: #888;\n  font-size: 20px;\n  cursor: pointer;\n  padding: 4px 8px;\n  transition: color 0.15s;\n}\n.close-btn:hover {\n  color: #fff;\n}\n.editor-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 20px;\n}\n.placeholder-editor {\n  text-align: center;\n  padding: 40px;\n}\n.placeholder-editor pre {\n  text-align: left;\n  background: #1e1e1e;\n  padding: 16px;\n  border-radius: 4px;\n  margin: 16px 0;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.placeholder-editor button {\n  background: #0078d4;\n  border: none;\n  color: #fff;\n  padding: 10px 24px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n}\n.simple-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n}\n.simple-editor .form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.simple-editor .form-group label {\n  color: var(--text);\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.simple-editor .form-group input,\n.simple-editor .form-group textarea {\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.95rem;\n  font-family: inherit;\n}\n.simple-editor .form-group input:focus,\n.simple-editor .form-group textarea:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.editor-note {\n  padding: 1rem;\n  background: rgba(0, 120, 212, 0.1);\n  border: 1px solid rgba(0, 120, 212, 0.3);\n  border-radius: 4px;\n  color: #94a3b8;\n  font-size: 0.9rem;\n  text-align: center;\n}\n.editor-actions {\n  display: flex;\n  gap: 0.75rem;\n  justify-content: flex-end;\n  padding-top: 1rem;\n  border-top: 1px solid var(--border);\n}\n.editor-actions .save-btn {\n  padding: 0.75rem 1.5rem;\n  background: var(--accent);\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.editor-actions .save-btn:hover {\n  background: #0056b3;\n  transform: scale(1.05);\n}\n.editor-actions .cancel-btn {\n  padding: 0.75rem 1.5rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.editor-actions .cancel-btn:hover {\n  background: var(--bg);\n}\n::-webkit-scrollbar {\n  width: 8px;\n  height: 8px;\n}\n::-webkit-scrollbar-track {\n  background: #1e1e1e;\n}\n::-webkit-scrollbar-thumb {\n  background: #3d3d3d;\n  border-radius: 4px;\n}\n::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n@media (max-width: 768px) {\n  .folder-tree {\n    width: 180px;\n  }\n  .search-box input {\n    width: 150px;\n  }\n  .folders-grid,\n  .files-grid {\n    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));\n  }\n}\n.folder-item.drag-over,\n.file-item.drag-over {\n  background: rgba(0, 120, 212, 0.3);\n  border: 2px dashed #0078d4;\n  box-shadow: 0 0 8px rgba(0, 120, 212, 0.5);\n}\n.folder-item.dragging,\n.file-item.dragging {\n  opacity: 0.5;\n  transform: scale(0.95);\n}\n.folder-item[draggable=true],\n.file-item[draggable=true] {\n  cursor: grab;\n}\n.folder-item[draggable=true]:active,\n.file-item[draggable=true]:active {\n  cursor: grabbing;\n}\n.folder-contents {\n  position: relative;\n}\n.marquee-selection {\n  position: absolute;\n  background: rgba(0, 120, 212, 0.2);\n  border: 1px solid #0078d4;\n  pointer-events: none;\n  z-index: 10;\n}\n.deal-creator {\n  background: #252525;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  padding: 20px;\n  margin-bottom: 20px;\n}\n.creator-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 16px;\n}\n.creator-header h5 {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 500;\n  color: #fff;\n}\n.mode-selector {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 16px;\n  margin-top: 16px;\n}\n.mode-btn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background: #2d2d2d;\n  border: 2px solid #3d3d3d;\n  border-radius: 8px;\n  color: #e0e0e0;\n  cursor: pointer;\n  transition: all 0.2s;\n  min-height: 120px;\n}\n.mode-btn:hover {\n  background: #353535;\n  border-color: #0078d4;\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n}\n.mode-btn.sell:hover {\n  border-color: #28a745;\n}\n.mode-btn.buy:hover {\n  border-color: #0078d4;\n}\n.mode-icon {\n  font-size: 42px;\n  margin-bottom: 12px;\n}\n.mode-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: #fff;\n  margin-bottom: 6px;\n}\n.mode-desc {\n  font-size: 13px;\n  color: #999;\n}\n.type-selector {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n  margin-top: 16px;\n}\n.type-btn {\n  flex: 1;\n  min-width: 120px;\n  padding: 16px;\n  background: #2d2d2d;\n  border: 2px solid #3d3d3d;\n  border-radius: 6px;\n  color: #e0e0e0;\n  cursor: pointer;\n  transition: all 0.2s;\n  font-size: 14px;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n}\n.type-btn:hover {\n  background: #353535;\n  border-color: #0078d4;\n  transform: translateY(-2px);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n}\n.hint {\n  display: block;\n  margin-top: 6px;\n  font-size: 12px;\n  color: #888;\n  font-style: italic;\n}\n.deals-list-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 4px 4px;\n  margin-top: 16px;\n}\n.deals-count {\n  font-size: 12px;\n  color: #888;\n}\n.identify-all-label {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 13px;\n  color: #aaa;\n  cursor: pointer;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.identify-all-label input {\n  cursor: pointer;\n}\n.identify-all-label:hover {\n  color: #ddd;\n}\n.deals-list,\n.loot-list {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 16px;\n}\n.deal-card,\n.loot-card {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px;\n  background: #2d2d2d;\n  border: 1px solid #3d3d3d;\n  border-radius: 6px;\n  transition: all 0.2s;\n}\n.deal-card:hover,\n.loot-card:hover {\n  background: #353535;\n  border-color: #4d4d4d;\n}\n.deal-card.reverse {\n  border-left: 3px solid #0078d4;\n}\n.deal-info,\n.loot-info {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex: 1;\n}\n.deal-icon,\n.loot-icon {\n  font-size: 24px;\n}\n.deal-details,\n.loot-details {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.deal-name,\n.loot-name {\n  font-size: 14px;\n  font-weight: 500;\n  color: #fff;\n}\n.deal-meta,\n.loot-meta {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.deal-price {\n  font-size: 13px;\n  color: #ffd700;\n  font-weight: 500;\n}\n.deal-badge {\n  font-size: 12px;\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-weight: 500;\n}\n.deal-badge.negotiable {\n  background: rgba(255, 193, 7, 0.2);\n  color: #ffc107;\n  border: 1px solid rgba(255, 193, 7, 0.3);\n}\n.deal-badge.reverse {\n  background: rgba(0, 120, 212, 0.2);\n  color: #0078d4;\n  border: 1px solid rgba(0, 120, 212, 0.3);\n}\n.deal-stock {\n  font-size: 12px;\n  color: #999;\n}\n/*# sourceMappingURL=library-editor.component.css.map */\n', "/* src/app/library-editor/library-editor-shop-bundle-editors.css */\n.shop-editor,\n.loot-bundle-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n  padding: 1.5rem;\n  max-height: 80vh;\n  overflow-y: auto;\n}\n.shop-editor .form-group,\n.loot-bundle-editor .form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n.shop-editor .form-group label,\n.loot-bundle-editor .form-group label {\n  color: var(--text);\n  font-weight: 600;\n  font-size: 0.9rem;\n}\n.shop-editor .form-group input,\n.shop-editor .form-group textarea,\n.loot-bundle-editor .form-group input,\n.loot-bundle-editor .form-group textarea {\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.95rem;\n  font-family: inherit;\n}\n.shop-editor .form-group input:focus,\n.shop-editor .form-group textarea:focus,\n.loot-bundle-editor .form-group input:focus,\n.loot-bundle-editor .form-group textarea:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.deals-section,\n.loot-items-section {\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n  padding: 1rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n.section-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-bottom: 0.75rem;\n  border-bottom: 2px solid var(--border);\n}\n.section-header h4 {\n  margin: 0;\n  color: var(--text);\n  font-size: 1.1rem;\n}\n.add-btn {\n  padding: 0.5rem 1rem;\n  background: var(--accent);\n  border: none;\n  border-radius: 4px;\n  color: white;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.add-btn:hover:not(:disabled) {\n  background: #0056b3;\n  transform: scale(1.05);\n}\n.add-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.deal-creator,\n.loot-creator {\n  padding: 1rem;\n  background: var(--card);\n  border: 2px solid var(--accent);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n.creator-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding-bottom: 0.75rem;\n  border-bottom: 1px solid var(--border);\n}\n.creator-header h5 {\n  margin: 0;\n  color: var(--text);\n  font-size: 1rem;\n}\n.creator-header .cancel-btn {\n  padding: 0.25rem 0.5rem;\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.creator-header .cancel-btn:hover {\n  background: rgba(255, 0, 0, 0.1);\n  border-color: #ff4444;\n  color: #ff4444;\n}\n.type-selector {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n.type-btn {\n  flex: 1;\n  min-width: 120px;\n  padding: 1rem;\n  background: var(--card);\n  border: 2px solid var(--border);\n  border-radius: 8px;\n  color: var(--text);\n  font-size: 1rem;\n  cursor: pointer;\n  transition: all 0.2s;\n  text-align: center;\n}\n.type-btn:hover {\n  background: var(--bg);\n  border-color: var(--accent);\n  transform: translateY(-2px);\n}\n.type-btn.active {\n  background: var(--accent);\n  border-color: var(--accent);\n  color: white;\n}\n.item-selector {\n  padding: 0.75rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  font-size: 0.95rem;\n  cursor: pointer;\n}\n.item-selector:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.currency-inputs {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.currency-inputs input {\n  width: 80px;\n  padding: 0.5rem;\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text);\n  text-align: center;\n}\n.currency-inputs span {\n  color: var(--text-dim);\n  font-weight: 600;\n}\n.checkboxes {\n  display: flex;\n  gap: 1rem;\n  flex-direction: row !important;\n}\n.checkboxes label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n.deals-list,\n.loot-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  max-height: 400px;\n  overflow-y: auto;\n}\n.deal-card,\n.loot-item-card {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  transition: all 0.2s;\n}\n.deal-card:hover,\n.loot-item-card:hover {\n  background: var(--bg);\n  border-color: var(--accent);\n}\n.deal-card.reverse {\n  border-left: 4px solid #ff9800;\n}\n.deal-info,\n.loot-item-info {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  flex: 1;\n}\n.deal-icon,\n.loot-icon {\n  font-size: 1.5rem;\n}\n.deal-details,\n.loot-details {\n  display: flex;\n  flex-direction: column;\n  gap: 0.25rem;\n}\n.deal-name,\n.loot-name {\n  color: var(--text);\n  font-weight: 600;\n}\n.loot-type {\n  color: var(--text-dim);\n  font-size: 0.85rem;\n}\n.deal-meta {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n.deal-price {\n  color: #ffd700;\n  font-weight: 600;\n}\n.deal-badge {\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.8rem;\n  font-weight: 600;\n}\n.deal-badge.negotiable {\n  background: rgba(76, 175, 80, 0.2);\n  color: #4caf50;\n}\n.deal-badge.reverse {\n  background: rgba(255, 152, 0, 0.2);\n  color: #ff9800;\n}\n.deal-stock {\n  color: var(--text-dim);\n  font-size: 0.9rem;\n}\n.icon-btn.delete {\n  padding: 0.5rem;\n  background: transparent;\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text-dim);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.icon-btn.delete:hover {\n  background: rgba(255, 0, 0, 0.1);\n  border-color: #ff4444;\n  color: #ff4444;\n}\n.empty-hint {\n  padding: 2rem;\n  text-align: center;\n  color: var(--text-dim);\n  font-style: italic;\n}\n/*# sourceMappingURL=library-editor-shop-bundle-editors.css.map */\n"] }]
  }], null, { fileInput: [{
    type: ViewChild,
    args: ["fileInput"]
  }], handleKeydown: [{
    type: HostListener,
    args: ["window:keydown", ["$event"]]
  }], onMouseMove: [{
    type: HostListener,
    args: ["window:mousemove", ["$event"]]
  }], onMouseUp: [{
    type: HostListener,
    args: ["window:mouseup", ["$event"]]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LibraryEditorComponent, { className: "LibraryEditorComponent", filePath: "app/library-editor/library-editor.component.ts", lineNumber: 110 });
})();
export {
  LibraryEditorComponent
};
//# sourceMappingURL=chunk-CGEREUAH.js.map
