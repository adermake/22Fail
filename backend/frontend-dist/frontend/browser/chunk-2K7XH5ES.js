import {
  ImageUrlPipe
} from "./chunk-6EXL6IWA.js";
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
  NumberValueAccessor
} from "./chunk-VMGRJE2Y.js";
import {
  CommonModule
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
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
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind1,
  ɵɵproperty,
  ɵɵqueryRefresh,
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
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty,
  ɵɵviewQuery
} from "./chunk-XJL25EXC.js";

// src/app/model/current-events.model.ts
function createEmptyShopEvent(name) {
  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: "shop",
    name,
    description: "",
    deals: [],
    claimedDeals: {},
    createdAt: Date.now()
  };
}
function createEmptyLootBundleEvent(name) {
  return {
    id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: "loot",
    name,
    description: "",
    items: [],
    createdAt: Date.now()
  };
}
function createEmptyShopDeal() {
  return {
    id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: "Neuer Deal",
    isNegotiable: false,
    sold: 0,
    isReverseDeal: false
  };
}
function convertToCopper(currency) {
  return currency.copper + currency.silver * 10 + currency.gold * 100 + currency.platinum * 1e3;
}
function copperToCurrency(copper) {
  const platinum = Math.floor(copper / 1e3);
  copper = copper % 1e3;
  const gold = Math.floor(copper / 100);
  copper = copper % 100;
  const silver = Math.floor(copper / 10);
  copper = copper % 10;
  return { copper, silver, gold, platinum };
}
function formatCurrency(currency) {
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
function formatCurrencyAsGold(currency) {
  const totalCopper = convertToCopper(currency);
  const gold = totalCopper / 100;
  return gold % 1 === 0 ? `${gold}g` : `${gold.toFixed(2)}g`;
}
function getCoinParts(currency) {
  const parts = [];
  if (currency.platinum > 0)
    parts.push({ amount: currency.platinum, type: "platinum", color: "#6ab2e5", symbol: "\u2B21" });
  if (currency.gold > 0)
    parts.push({ amount: currency.gold, type: "gold", color: "#ffd700", symbol: "\u2B21" });
  if (currency.silver > 0)
    parts.push({ amount: currency.silver, type: "silver", color: "#c0c0c0", symbol: "\u2B21" });
  if (currency.copper > 0)
    parts.push({ amount: currency.copper, type: "copper", color: "#b87333", symbol: "\u2B21" });
  return parts.length > 0 ? parts : [{ amount: 0, type: "copper", color: "#b87333", symbol: "\u2B21" }];
}

// src/app/model/rune-block.model.ts
var RUNE_GLOW_COLORS = [
  { name: "Lila", value: "#8b5cf6" },
  { name: "Blau", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Gr\xFCn", value: "#22c55e" },
  { name: "Gelb", value: "#eab308" },
  { name: "Orange", value: "#f97316" },
  { name: "Rot", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Wei\xDF", value: "#ffffff" }
];
var RUNE_DEFAULT_TAGS = [
  "Wasser",
  "Feuer",
  "Stein",
  "Seele",
  "Licht",
  "Dunkel",
  "Heilung"
];
var RUNE_TAG_OPTIONS = [
  "Wasser",
  "Feuer",
  "Stein",
  "Seele",
  "Licht",
  "Dunkel",
  "Heilung",
  "Schutz",
  "Angriff",
  "Verteidigung",
  "Buff",
  "Debuff",
  "Beschw\xF6rung",
  "Verzauberung",
  "Illusion",
  "Wind",
  "Blitz",
  "Eis"
];
var RUNE_TYPE_LABELS = {
  medium: "Medium",
  formung: "Formung",
  selektor: "Selektor",
  custom: "Custom"
};

// src/app/shared/rune-editor/rune-editor.component.ts
var _c0 = ["drawCanvas"];
var _c1 = ["fileInput"];
var _forTrack0 = ($index, $item) => $item.value;
function RuneEditorComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 56);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_9_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.deleteRune());
    });
    \u0275\u0275text(1, "\u{1F5D1} L\xF6schen");
    \u0275\u0275elementEnd();
  }
}
function RuneEditorComponent_Conditional_32_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 19)(1, "input", 20);
    \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Conditional_32_Template_input_ngModelChange_1_listener($event) {
      \u0275\u0275restoreView(_r4);
      const ctx_r2 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r2.editRune.learned, $event) || (ctx_r2.editRune.learned = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "Gelernt");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275twoWayProperty("ngModel", ctx_r2.editRune.learned);
  }
}
function RuneEditorComponent_Conditional_38_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 57);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_38_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r5);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.openDrawPanel());
    });
    \u0275\u0275text(1, "\u270F Zeichnen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "label", 58);
    \u0275\u0275text(3, "\u2B06 Hochladen");
    \u0275\u0275elementEnd();
  }
}
function RuneEditorComponent_Conditional_39_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 59);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_39_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r6);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.removeImage());
    });
    \u0275\u0275text(1, "\u2715 Entfernen");
    \u0275\u0275elementEnd();
  }
}
function RuneEditorComponent_Conditional_42_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 27);
    \u0275\u0275element(1, "img", 60);
    \u0275\u0275pipe(2, "imageUrl");
    \u0275\u0275elementStart(3, "button", 61);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_42_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r7);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.openDrawPanel());
    });
    \u0275\u0275text(4, "\u270F Bearbeiten");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("src", \u0275\u0275pipeBind1(2, 1, ctx_r2.editRune.drawing), \u0275\u0275sanitizeUrl);
  }
}
function RuneEditorComponent_Conditional_43_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 28)(1, "span", 62);
    \u0275\u0275text(2, "\u169B");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 63);
    \u0275\u0275text(4, "Kein Bild vorhanden");
    \u0275\u0275elementEnd()();
  }
}
function RuneEditorComponent_Conditional_44_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 75);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_44_For_3_Template_button_click_0_listener() {
      const c_r10 = \u0275\u0275restoreView(_r9).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.setGlowColor(c_r10.value));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const c_r10 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275styleProp("background", c_r10.value)("box-shadow", ctx_r2.editRune.glowColor === c_r10.value ? "0 0 0 2px #fff, 0 0 8px " + c_r10.value : "none");
    \u0275\u0275classProp("active-color", ctx_r2.editRune.glowColor === c_r10.value);
    \u0275\u0275property("title", c_r10.name);
  }
}
function RuneEditorComponent_Conditional_44_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 64)(1, "div", 65);
    \u0275\u0275repeaterCreate(2, RuneEditorComponent_Conditional_44_For_3_Template, 1, 7, "button", 66, _forTrack0);
    \u0275\u0275elementStart(4, "input", 67);
    \u0275\u0275listener("input", function RuneEditorComponent_Conditional_44_Template_input_input_4_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.setGlowColor($event.target.value));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 65)(6, "button", 68);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_44_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.setDraw());
    });
    \u0275\u0275text(7, "\u270F");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "button", 69);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_44_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleEraser());
    });
    \u0275\u0275text(9, "\u232B");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 70);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_44_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.undo());
    });
    \u0275\u0275text(11, "\u21A9");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 71);
    \u0275\u0275listener("click", function RuneEditorComponent_Conditional_44_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.clearCanvas());
    });
    \u0275\u0275text(13, "\u{1F5D1}");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "span", 72);
    \u0275\u0275text(15, "Strg+Z = R\xFCckg\xE4ngig");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "div", 73)(17, "canvas", 74, 1);
    \u0275\u0275listener("mousedown", function RuneEditorComponent_Conditional_44_Template_canvas_mousedown_17_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onCanvasMouseDown($event));
    })("mousemove", function RuneEditorComponent_Conditional_44_Template_canvas_mousemove_17_listener($event) {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onCanvasMouseMove($event));
    })("mouseup", function RuneEditorComponent_Conditional_44_Template_canvas_mouseup_17_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onCanvasMouseUp());
    })("mouseleave", function RuneEditorComponent_Conditional_44_Template_canvas_mouseleave_17_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.onCanvasMouseLeave());
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.glowColors);
    \u0275\u0275advance(2);
    \u0275\u0275property("value", ctx_r2.editRune.glowColor || "#06b6d4");
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", !ctx_r2.isErasing());
    \u0275\u0275advance(2);
    \u0275\u0275classProp("active", ctx_r2.isErasing());
    \u0275\u0275advance(9);
    \u0275\u0275classProp("eraser-cursor", ctx_r2.isErasing());
    \u0275\u0275property("width", ctx_r2.canvasWidth())("height", ctx_r2.canvasHeight());
  }
}
function RuneEditorComponent_For_50_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 76);
    \u0275\u0275listener("click", function RuneEditorComponent_For_50_Template_button_click_0_listener() {
      const tag_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleTag(tag_r12));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r12 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r2.isTagActive(tag_r12));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", tag_r12, " ");
  }
}
function RuneEditorComponent_For_56_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 76);
    \u0275\u0275listener("click", function RuneEditorComponent_For_56_Conditional_0_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r13);
      const tag_r14 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.toggleTag(tag_r14));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const tag_r14 = \u0275\u0275nextContext().$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r2.isTagActive(tag_r14));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", tag_r14, " ");
  }
}
function RuneEditorComponent_For_56_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, RuneEditorComponent_For_56_Conditional_0_Template, 2, 3, "button", 30);
  }
  if (rf & 2) {
    const tag_r14 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275conditional(!ctx_r2.defaultTags.includes(tag_r14) ? 0 : -1);
  }
}
function RuneEditorComponent_For_63_Template(rf, ctx) {
  if (rf & 1) {
    const _r15 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementStart(2, "button", 77);
    \u0275\u0275listener("click", function RuneEditorComponent_For_63_Template_button_click_2_listener() {
      const \u0275$index_169_r16 = \u0275\u0275restoreView(_r15).$index;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.removeTag(\u0275$index_169_r16));
    });
    \u0275\u0275text(3, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const tag_r17 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", tag_r17, " ");
  }
}
var RuneEditorComponent = class _RuneEditorComponent {
  rune = null;
  showLearnedToggle = false;
  // only shown in character sheet context
  save = new EventEmitter();
  cancel = new EventEmitter();
  delete = new EventEmitter();
  canvasRef;
  fileInputRef;
  imageService = inject(ImageService);
  cd = inject(ChangeDetectorRef);
  editRune;
  isNewRune = true;
  glowColors = RUNE_GLOW_COLORS;
  defaultTags = RUNE_DEFAULT_TAGS;
  allTagOptions = RUNE_TAG_OPTIONS;
  newTag = "";
  // Drawing state
  isDrawing = signal(false, ...ngDevMode ? [{ debugName: "isDrawing" }] : []);
  isErasing = signal(false, ...ngDevMode ? [{ debugName: "isErasing" }] : []);
  isSavingCanvas = signal(false, ...ngDevMode ? [{ debugName: "isSavingCanvas" }] : []);
  showDrawPanel = signal(false, ...ngDevMode ? [{ debugName: "showDrawPanel" }] : []);
  canvasWidth = signal(512, ...ngDevMode ? [{ debugName: "canvasWidth" }] : []);
  canvasHeight = signal(512, ...ngDevMode ? [{ debugName: "canvasHeight" }] : []);
  ctx;
  drawing = false;
  lastX = 0;
  lastY = 0;
  undoHistory = [];
  MAX_UNDO = 25;
  canvasReady = false;
  keyHandler = this.onKeyDown.bind(this);
  statKeys = [
    { key: "strength", label: "STR" },
    { key: "dexterity", label: "GES" },
    { key: "speed", label: "GES" },
    { key: "intelligence", label: "INT" },
    { key: "constitution", label: "KON" },
    { key: "chill", label: "WIL" }
  ];
  ngOnInit() {
    if (this.rune) {
      this.editRune = JSON.parse(JSON.stringify(this.rune));
      this.isNewRune = false;
    } else {
      this.editRune = {
        name: "",
        description: "",
        drawing: "",
        tags: [],
        glowColor: "#06b6d4",
        fokus: 0,
        fokusVerlust: 0,
        mana: 0,
        manaMult: 0,
        effektivitaet: 0,
        statRequirements: { strength: 0, dexterity: 0, speed: 0, intelligence: 0, constitution: 0, chill: 0 },
        identified: true,
        learned: false
      };
    }
    if (!this.editRune.statRequirements)
      this.editRune.statRequirements = {};
    if (!this.editRune.tags)
      this.editRune.tags = [];
    if (this.editRune.drawing)
      this.showDrawPanel.set(true);
    document.addEventListener("keydown", this.keyHandler);
    document.body.style.overflow = "hidden";
  }
  ngAfterViewInit() {
    if (this.showDrawPanel() && this.canvasRef) {
      this.initCanvas();
    }
  }
  ngOnDestroy() {
    document.removeEventListener("keydown", this.keyHandler);
    document.body.style.overflow = "";
  }
  onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !this.drawing) {
      e.preventDefault();
      this.undo();
    }
  }
  // ─── Canvas ──────────────────────────────────────────────────────────────
  openDrawPanel() {
    this.showDrawPanel.set(true);
    this.canvasReady = false;
    this.cd.detectChanges();
    setTimeout(() => this.initCanvas(), 0);
  }
  initCanvas() {
    if (!this.canvasRef)
      return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext("2d");
    this.applyCtxSettings();
    if (this.editRune.drawing) {
      this.loadDrawingFromId(this.editRune.drawing);
    } else {
      this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      this.saveHistory();
    }
    this.canvasReady = true;
  }
  applyCtxSettings() {
    const color = this.editRune.glowColor || "#06b6d4";
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 20;
  }
  fillBlack() {
    const c = this.canvasRef.nativeElement;
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, c.width, c.height);
  }
  loadDrawingFromId(imageId) {
    const url = this.imageService.getImageUrl(imageId);
    if (!url)
      return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (this.ctx) {
        const c = this.canvasRef.nativeElement;
        this.ctx.clearRect(0, 0, c.width, c.height);
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "transparent";
        this.ctx.drawImage(img, 0, 0, c.width, c.height);
        this.saveHistory();
      }
    };
    img.src = url;
  }
  onCanvasMouseDown(e) {
    if (e.button !== 0)
      return;
    this.drawing = true;
    const canvas = this.canvasRef.nativeElement;
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    this.lastX = e.offsetX * scaleX;
    this.lastY = e.offsetY * scaleY;
    this.saveHistory();
  }
  onCanvasMouseMove(e) {
    if (!this.drawing)
      return;
    const canvas = this.canvasRef.nativeElement;
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    const x = e.offsetX * scaleX;
    const y = e.offsetY * scaleY;
    this.stroke(x, y);
    this.lastX = x;
    this.lastY = y;
  }
  onCanvasMouseUp() {
    this.drawing = false;
  }
  onCanvasMouseLeave() {
    this.drawing = false;
  }
  stroke(x, y) {
    this.ctx.setLineDash([]);
    this.ctx.lineDashOffset = 0;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    if (this.isErasing()) {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = 32;
      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = "transparent";
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.lineWidth = 6;
    } else {
      const color = this.editRune.glowColor || "#06b6d4";
      this.ctx.globalCompositeOperation = "source-over";
      for (const [blur, width] of [[40, 9], [20, 7], [10, 6], [4, 6]]) {
        this.ctx.strokeStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = blur;
        this.ctx.lineWidth = width;
        this.ctx.setLineDash([]);
        this.ctx.lineDashOffset = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      }
      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = "transparent";
    }
  }
  setGlowColor(c) {
    this.editRune.glowColor = c;
    this.applyCtxSettings();
  }
  toggleEraser() {
    this.isErasing.set(!this.isErasing());
  }
  setDraw() {
    this.isErasing.set(false);
  }
  clearCanvas() {
    if (!this.ctx)
      return;
    const c = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, c.width, c.height);
    this.applyCtxSettings();
    this.undoHistory = [];
    this.saveHistory();
  }
  undo() {
    if (this.undoHistory.length <= 1)
      return;
    this.undoHistory.pop();
    const img = this.undoHistory[this.undoHistory.length - 1];
    if (this.ctx)
      this.ctx.putImageData(img, 0, 0);
  }
  saveHistory() {
    if (!this.ctx)
      return;
    const c = this.canvasRef.nativeElement;
    const snap = this.ctx.getImageData(0, 0, c.width, c.height);
    this.undoHistory.push(snap);
    if (this.undoHistory.length > this.MAX_UNDO)
      this.undoHistory.shift();
  }
  async uploadCanvasAsImage() {
    if (!this.canvasRef)
      return;
    this.isSavingCanvas.set(true);
    try {
      const canvas = this.canvasRef.nativeElement;
      const dataUrl = canvas.toDataURL("image/png");
      const id = await this.imageService.uploadImage(dataUrl);
      this.editRune.drawing = id;
    } finally {
      this.isSavingCanvas.set(false);
    }
  }
  // ─── File upload ─────────────────────────────────────────────────────────
  triggerFileUpload() {
    this.fileInputRef.nativeElement.click();
  }
  async onFileSelected(e) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file)
      return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onload = async () => {
        const tmp = document.createElement("canvas");
        tmp.width = tmp.height = 512;
        const tc = tmp.getContext("2d");
        tc.drawImage(img, 0, 0, 512, 512);
        const resized = tmp.toDataURL("image/png");
        const id = await this.imageService.uploadImage(resized);
        this.editRune.drawing = id;
        this.showDrawPanel.set(true);
        this.canvasReady = false;
        this.cd.detectChanges();
        setTimeout(() => this.initCanvas(), 0);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    input.value = "";
  }
  removeImage() {
    this.editRune.drawing = "";
    this.showDrawPanel.set(false);
    this.undoHistory = [];
    this.canvasReady = false;
  }
  // ─── Tags ─────────────────────────────────────────────────────────────────
  addTag() {
    const t = this.newTag.trim();
    if (t && !this.editRune.tags.includes(t)) {
      this.editRune.tags = [...this.editRune.tags, t];
    }
    this.newTag = "";
  }
  toggleTag(tag) {
    if (this.editRune.tags.includes(tag)) {
      this.editRune.tags = this.editRune.tags.filter((t) => t !== tag);
    } else {
      this.editRune.tags = [...this.editRune.tags, tag];
    }
  }
  removeTag(i) {
    this.editRune.tags = this.editRune.tags.filter((_, idx) => idx !== i);
  }
  isTagActive(tag) {
    return (this.editRune.tags ?? []).includes(tag);
  }
  // ─── Runentyp ──────────────────────────────────────────────
  setRuneType(type) {
    this.editRune.runeType = type;
  }
  // ─── Save / Cancel ────────────────────────────────────────────────────────
  async saveRune() {
    if (this.showDrawPanel() && this.ctx) {
      await this.uploadCanvasAsImage();
    }
    this.save.emit(this.editRune);
  }
  cancelEdit() {
    this.cancel.emit();
  }
  deleteRune() {
    if (confirm("Rune wirklich l\xF6schen?"))
      this.delete.emit();
  }
  static \u0275fac = function RuneEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _RuneEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _RuneEditorComponent, selectors: [["app-rune-editor"]], viewQuery: function RuneEditorComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c0, 5)(_c1, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.canvasRef = _t.first);
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.fileInputRef = _t.first);
    }
  }, inputs: { rune: "rune", showLearnedToggle: "showLearnedToggle" }, outputs: { save: "save", cancel: "cancel", delete: "delete" }, decls: 131, vars: 36, consts: [["fileInput", ""], ["drawCanvas", ""], [1, "rune-editor-overlay", 3, "click"], [1, "rune-editor-modal", 3, "click"], [1, "editor-header"], [1, "header-left"], [1, "header-rune-icon"], [1, "header-actions"], [1, "delete-btn"], [1, "cancel-btn", 3, "click"], [1, "save-btn", 3, "click", "disabled"], [1, "close-btn", 3, "click"], [1, "editor-body"], [1, "editor-col"], [1, "ed-section"], [1, "section-title"], [1, "form-group"], ["type", "text", "placeholder", "Runenname\u2026", 3, "ngModelChange", "ngModel"], [1, "toggle-row"], [1, "toggle-label"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], [1, "toggle-hint"], [1, "ed-section", "draw-section"], [1, "section-title-row"], [1, "image-action-btns"], [1, "sm-btn", "danger"], ["id", "runeFileInput", "type", "file", "accept", "image/*", 2, "display", "none", 3, "change"], [1, "image-preview-box"], [1, "image-placeholder"], [1, "preset-tags"], [1, "preset-tag", 3, "active"], [1, "more-tags-details"], [1, "preset-tags", "extra-tags"], [1, "tag-input-row"], ["type", "text", "placeholder", "Eigener Tag\u2026", 3, "ngModelChange", "keydown.enter", "ngModel"], [1, "add-tag-btn", 3, "click", "disabled"], [1, "tag-chips"], [1, "tag-chip"], ["rows", "3", "placeholder", "Beschreibung des Runeneffekts\u2026", 3, "ngModelChange", "ngModel"], [1, "cost-compact"], [1, "cc-lbl", "mana-label"], ["type", "number", "min", "0", "placeholder", "0", 1, "cc-input", 3, "ngModelChange", "ngModel"], [1, "cc-mult"], ["type", "number", "min", "0", "step", "0.1", "placeholder", "0", 1, "cc-input", 3, "ngModelChange", "ngModel"], [1, "cc-lbl", "fokus-label"], ["type", "number", "min", "0", "step", "0.1", "placeholder", "0", "title", "Fokus-Verlust pro ungenutztem Eingangsport", 1, "cc-input", 3, "ngModelChange", "ngModel"], [1, "cc-lbl", "eff-label"], [1, "req-compact"], [1, "req-ci"], [1, "req-lbl"], ["type", "number", "min", "0", "placeholder", "0", 1, "req-tiny", 3, "ngModelChange", "ngModel"], [1, "rt-type-row"], ["title", "Medium", 1, "rt-type-btn", 3, "click"], ["title", "Formung", 1, "rt-type-btn", 3, "click"], ["title", "Selektor", 1, "rt-type-btn", 3, "click"], ["title", "Benutzerdefiniert", 1, "rt-type-btn", 3, "click"], [1, "delete-btn", 3, "click"], [1, "sm-btn", 3, "click"], ["for", "runeFileInput", 1, "sm-btn"], [1, "sm-btn", "danger", 3, "click"], ["alt", "Rune", 1, "rune-preview-img", 3, "src"], [1, "img-edit-btn", 3, "click"], [1, "ph-icon"], [1, "ph-text"], [1, "draw-toolbar"], [1, "tool-group"], [1, "color-dot", 3, "background", "active-color", "box-shadow", "title"], ["type", "color", "title", "Benutzerdefinierte Farbe", 1, "color-input-native", 3, "input", "value"], ["title", "Zeichnen", 1, "tool-btn", 3, "click"], ["title", "Radierer", 1, "tool-btn", 3, "click"], ["title", "R\xFCckg\xE4ngig (Strg+Z)", 1, "tool-btn", 3, "click"], ["title", "Alles l\xF6schen", 1, "tool-btn", "danger", 3, "click"], [1, "toolbar-hint"], [1, "canvas-wrap"], [1, "rune-canvas", 3, "mousedown", "mousemove", "mouseup", "mouseleave", "width", "height"], [1, "color-dot", 3, "click", "title"], [1, "preset-tag", 3, "click"], [1, "tag-remove", 3, "click"]], template: function RuneEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 2);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_div_click_0_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.cancelEdit());
      });
      \u0275\u0275elementStart(1, "div", 3);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_div_click_1_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView($event.stopPropagation());
      });
      \u0275\u0275elementStart(2, "div", 4)(3, "div", 5)(4, "span", 6);
      \u0275\u0275text(5, "\u169B");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "h2");
      \u0275\u0275text(7);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(8, "div", 7);
      \u0275\u0275conditionalCreate(9, RuneEditorComponent_Conditional_9_Template, 2, 0, "button", 8);
      \u0275\u0275elementStart(10, "button", 9);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_10_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.cancelEdit());
      });
      \u0275\u0275text(11, "Abbrechen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(12, "button", 10);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_12_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.saveRune());
      });
      \u0275\u0275text(13);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "button", 11);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_14_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.cancelEdit());
      });
      \u0275\u0275text(15, "\xD7");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(16, "div", 12)(17, "div", 13)(18, "section", 14)(19, "h3", 15);
      \u0275\u0275text(20, "Grundlegendes");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(21, "div", 16)(22, "label");
      \u0275\u0275text(23, "Name *");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(24, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_24_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.name, $event) || (ctx.editRune.name = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 18)(26, "label", 19)(27, "input", 20);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_27_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.identified, $event) || (ctx.editRune.identified = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(28, "span");
      \u0275\u0275text(29, "Identifiziert");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(30, "span", 21);
      \u0275\u0275text(31);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(32, RuneEditorComponent_Conditional_32_Template, 4, 1, "label", 19);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(33, "section", 22)(34, "div", 23)(35, "h3", 15);
      \u0275\u0275text(36, "Runenbild");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(37, "div", 24);
      \u0275\u0275conditionalCreate(38, RuneEditorComponent_Conditional_38_Template, 4, 0)(39, RuneEditorComponent_Conditional_39_Template, 2, 0, "button", 25);
      \u0275\u0275elementStart(40, "input", 26, 0);
      \u0275\u0275listener("change", function RuneEditorComponent_Template_input_change_40_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onFileSelected($event));
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(42, RuneEditorComponent_Conditional_42_Template, 5, 3, "div", 27);
      \u0275\u0275conditionalCreate(43, RuneEditorComponent_Conditional_43_Template, 5, 0, "div", 28);
      \u0275\u0275conditionalCreate(44, RuneEditorComponent_Conditional_44_Template, 19, 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(45, "section", 14)(46, "h3", 15);
      \u0275\u0275text(47, "Tags");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(48, "div", 29);
      \u0275\u0275repeaterCreate(49, RuneEditorComponent_For_50_Template, 2, 3, "button", 30, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(51, "details", 31)(52, "summary");
      \u0275\u0275text(53, "Weitere Tags\u2026");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "div", 32);
      \u0275\u0275repeaterCreate(55, RuneEditorComponent_For_56_Template, 1, 1, null, null, \u0275\u0275repeaterTrackByIdentity);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(57, "div", 33)(58, "input", 34);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_58_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.newTag, $event) || (ctx.newTag = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275listener("keydown.enter", function RuneEditorComponent_Template_input_keydown_enter_58_listener($event) {
        \u0275\u0275restoreView(_r1);
        ctx.addTag();
        return \u0275\u0275resetView($event.preventDefault());
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(59, "button", 35);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_59_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.addTag());
      });
      \u0275\u0275text(60, "+");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(61, "div", 36);
      \u0275\u0275repeaterCreate(62, RuneEditorComponent_For_63_Template, 4, 1, "span", 37, \u0275\u0275repeaterTrackByIndex);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(64, "div", 13)(65, "section", 14)(66, "h3", 15);
      \u0275\u0275text(67, "Effektbeschreibung");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(68, "div", 16)(69, "textarea", 38);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_textarea_ngModelChange_69_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.description, $event) || (ctx.editRune.description = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(70, "section", 14)(71, "h3", 15);
      \u0275\u0275text(72, "Kosten & Werte");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(73, "div", 39)(74, "span", 40);
      \u0275\u0275text(75, "Mana");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(76, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_76_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.mana, $event) || (ctx.editRune.mana = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(77, "span", 42);
      \u0275\u0275text(78, "\xD7");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(79, "input", 43);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_79_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.manaMult, $event) || (ctx.editRune.manaMult = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(80, "span", 44);
      \u0275\u0275text(81, "Fokus");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(82, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_82_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.fokus, $event) || (ctx.editRune.fokus = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(83, "span", 42);
      \u0275\u0275text(84, "V");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(85, "input", 45);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_85_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.fokusVerlust, $event) || (ctx.editRune.fokusVerlust = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "span", 46);
      \u0275\u0275text(87, "Effekt.");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(88, "input", 41);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_88_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.effektivitaet, $event) || (ctx.editRune.effektivitaet = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd();
      \u0275\u0275element(89, "span")(90, "span");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(91, "section", 14)(92, "h3", 15);
      \u0275\u0275text(93, "Attributanforderungen");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(94, "div", 47)(95, "div", 48)(96, "span", 49);
      \u0275\u0275text(97, "STR");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(98, "input", 50);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_98_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.statRequirements.strength, $event) || (ctx.editRune.statRequirements.strength = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(99, "div", 48)(100, "span", 49);
      \u0275\u0275text(101, "GES");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(102, "input", 50);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_102_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.statRequirements.dexterity, $event) || (ctx.editRune.statRequirements.dexterity = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(103, "div", 48)(104, "span", 49);
      \u0275\u0275text(105, "SPD");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(106, "input", 50);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_106_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.statRequirements.speed, $event) || (ctx.editRune.statRequirements.speed = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(107, "div", 48)(108, "span", 49);
      \u0275\u0275text(109, "INT");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(110, "input", 50);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_110_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.statRequirements.intelligence, $event) || (ctx.editRune.statRequirements.intelligence = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(111, "div", 48)(112, "span", 49);
      \u0275\u0275text(113, "KON");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(114, "input", 50);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_114_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.statRequirements.constitution, $event) || (ctx.editRune.statRequirements.constitution = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(115, "div", 48)(116, "span", 49);
      \u0275\u0275text(117, "CHR");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(118, "input", 50);
      \u0275\u0275twoWayListener("ngModelChange", function RuneEditorComponent_Template_input_ngModelChange_118_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.editRune.statRequirements.chill, $event) || (ctx.editRune.statRequirements.chill = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()()()();
      \u0275\u0275elementStart(119, "section", 14)(120, "h3", 15);
      \u0275\u0275text(121, "Runentyp");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(122, "div", 51)(123, "button", 52);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_123_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setRuneType("medium"));
      });
      \u0275\u0275text(124, "M");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(125, "button", 53);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_125_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setRuneType("formung"));
      });
      \u0275\u0275text(126, "F");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(127, "button", 54);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_127_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setRuneType("selektor"));
      });
      \u0275\u0275text(128, "S");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(129, "button", 55);
      \u0275\u0275listener("click", function RuneEditorComponent_Template_button_click_129_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.setRuneType("custom"));
      });
      \u0275\u0275text(130, "?");
      \u0275\u0275elementEnd()()()()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(7);
      \u0275\u0275textInterpolate(ctx.isNewRune ? "Neue Rune erstellen" : "Rune bearbeiten");
      \u0275\u0275advance(2);
      \u0275\u0275conditional(!ctx.isNewRune ? 9 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275property("disabled", !ctx.editRune.name.trim() || ctx.isSavingCanvas());
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1(" ", ctx.isSavingCanvas() ? "Speichert\u2026" : ctx.isNewRune ? "Erstellen" : "Speichern", " ");
      \u0275\u0275advance(11);
      \u0275\u0275classProp("input-empty", !ctx.editRune.name.trim());
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.name);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.identified);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate(ctx.editRune.identified ? "Details sichtbar" : "Nur Bild sichtbar");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showLearnedToggle ? 32 : -1);
      \u0275\u0275advance(6);
      \u0275\u0275conditional(!ctx.showDrawPanel() ? 38 : 39);
      \u0275\u0275advance(4);
      \u0275\u0275conditional(!ctx.showDrawPanel() && ctx.editRune.drawing ? 42 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.showDrawPanel() && !ctx.editRune.drawing ? 43 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.showDrawPanel() ? 44 : -1);
      \u0275\u0275advance(5);
      \u0275\u0275repeater(ctx.defaultTags);
      \u0275\u0275advance(6);
      \u0275\u0275repeater(ctx.allTagOptions);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.newTag);
      \u0275\u0275advance();
      \u0275\u0275property("disabled", !ctx.newTag.trim());
      \u0275\u0275advance(3);
      \u0275\u0275repeater(ctx.editRune.tags);
      \u0275\u0275advance(7);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.description);
      \u0275\u0275advance(7);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.mana);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.manaMult);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.fokus);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.fokusVerlust);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.effektivitaet);
      \u0275\u0275advance(10);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.statRequirements.strength);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.statRequirements.dexterity);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.statRequirements.speed);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.statRequirements.intelligence);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.statRequirements.constitution);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.editRune.statRequirements.chill);
      \u0275\u0275advance(5);
      \u0275\u0275classProp("rtb-active", ctx.editRune.runeType === "medium");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("rtb-active", ctx.editRune.runeType === "formung");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("rtb-active", ctx.editRune.runeType === "selektor");
      \u0275\u0275advance(2);
      \u0275\u0275classProp("rtb-active", ctx.editRune.runeType === "custom" || !ctx.editRune.runeType);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, CheckboxControlValueAccessor, NgControlStatus, MinValidator, NgModel, ImageUrlPipe], styles: ["\n\n.rune-editor-overlay[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.75);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1100;\n  overflow: hidden;\n}\n.rune-editor-modal[_ngcontent-%COMP%] {\n  background: var(--card, #1e293b);\n  border-radius: 0;\n  width: 100vw;\n  max-width: 100vw;\n  height: 100vh;\n  max-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: none;\n  overflow: hidden;\n}\n.editor-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 16px;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n  background: rgba(139, 92, 246, 0.06);\n}\n.header-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.header-rune-icon[_ngcontent-%COMP%] {\n  font-size: 1.4rem;\n  color: var(--accent, #8b5cf6);\n}\n.editor-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 1rem;\n  color: var(--text, #e2e8f0);\n  font-weight: 600;\n}\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.close-btn[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 1.5rem;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  padding: 2px 8px;\n  transition: color 0.2s;\n  margin-left: 4px;\n}\n.close-btn[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e2e8f0);\n}\n.editor-body[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n.editor-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n  overflow: hidden;\n  padding: 8px 14px;\n}\n.editor-col[_ngcontent-%COMP%]:last-child {\n  overflow: hidden;\n}\n.editor-col[_ngcontent-%COMP%]:first-child {\n  border-right: 1px solid var(--border, #374151);\n}\n.ed-section[_ngcontent-%COMP%] {\n  padding-bottom: 6px;\n  margin-bottom: 6px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n}\n.ed-section[_ngcontent-%COMP%]:last-child {\n  border-bottom: none;\n  margin-bottom: 0;\n  padding-bottom: 0;\n}\n.ed-section.draw-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding-bottom: 4px;\n  margin-bottom: 4px;\n}\n.section-title[_ngcontent-%COMP%] {\n  margin: 0 0 6px;\n  font-size: 0.7rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: var(--accent, #8b5cf6);\n  font-weight: 700;\n}\n.section-title-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 5px;\n}\n.section-title-row[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%] {\n  margin-bottom: 0;\n}\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  margin-bottom: 6px;\n}\n.form-group[_ngcontent-%COMP%]:last-child {\n  margin-bottom: 0;\n}\n.form-group[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.form-group[_ngcontent-%COMP%]   input[type=text][_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   input[type=number][_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  padding: 5px 8px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.85rem;\n}\n.form-group[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, \n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);\n}\n.form-group[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  resize: none;\n  min-height: unset;\n  line-height: 1.4;\n}\n.input-empty[_ngcontent-%COMP%] {\n  border-color: #ef4444 !important;\n  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);\n}\n.toggle-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n  margin-bottom: 0;\n}\n.toggle-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  cursor: pointer;\n  font-size: 0.82rem;\n  color: var(--text, #e2e8f0);\n}\n.toggle-label[_ngcontent-%COMP%]   input[type=checkbox][_ngcontent-%COMP%] {\n  accent-color: var(--accent, #8b5cf6);\n}\n.toggle-hint[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n}\n.image-action-btns[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sm-btn[_ngcontent-%COMP%] {\n  padding: 4px 10px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.sm-btn[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e2e8f0);\n}\n.sm-btn.danger[_ngcontent-%COMP%] {\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #ef4444;\n}\n.sm-btn.danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.image-preview-box[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-block;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--border, #374151);\n}\n.rune-preview-img[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  max-height: 180px;\n  object-fit: contain;\n  background: #000;\n}\n.img-edit-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 6px;\n  right: 6px;\n  padding: 3px 8px;\n  background: rgba(0, 0, 0, 0.7);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text-muted);\n  font-size: 0.75rem;\n  cursor: pointer;\n}\n.img-edit-btn[_ngcontent-%COMP%]:hover {\n  color: var(--text, #e2e8f0);\n}\n.image-placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  height: 100px;\n  border: 1px dashed var(--border, #374151);\n  border-radius: 8px;\n  color: var(--text-muted, #9ca3af);\n}\n.ph-icon[_ngcontent-%COMP%] {\n  font-size: 1.8rem;\n  opacity: 0.4;\n}\n.ph-text[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n}\n.draw-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n  padding: 3px 0 6px;\n}\n.tool-group[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 6px;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 6px;\n  border: 1px solid var(--border, #374151);\n}\n.color-dot[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  cursor: pointer;\n  transition: transform 0.15s;\n  flex-shrink: 0;\n}\n.color-dot[_ngcontent-%COMP%]:hover {\n  transform: scale(1.15);\n}\n.color-dot.active-color[_ngcontent-%COMP%] {\n  border-color: #fff;\n}\n.color-input-native[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border: 2px solid var(--border, #374151);\n  border-radius: 6px;\n  cursor: pointer;\n  padding: 0;\n  background: none;\n  flex-shrink: 0;\n}\n.color-input-native[_ngcontent-%COMP%]::-webkit-color-swatch-wrapper {\n  padding: 2px;\n}\n.color-input-native[_ngcontent-%COMP%]::-webkit-color-swatch {\n  border: none;\n  border-radius: 4px;\n}\n.tool-btn[_ngcontent-%COMP%] {\n  padding: 4px 8px;\n  background: transparent;\n  border: 1px solid var(--border, #374151);\n  border-radius: 4px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.tool-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(139, 92, 246, 0.15);\n  color: var(--text, #e2e8f0);\n}\n.tool-btn.active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.25);\n  border-color: var(--accent, #8b5cf6);\n  color: #a78bfa;\n}\n.tool-btn.danger[_ngcontent-%COMP%] {\n  border-color: rgba(239, 68, 68, 0.3);\n  color: #ef4444;\n}\n.tool-btn.danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.toolbar-hint[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n  opacity: 0.7;\n  margin-left: auto;\n}\n.canvas-wrap[_ngcontent-%COMP%] {\n  aspect-ratio: 1 / 1;\n  width: 100%;\n  max-width: min(calc(100vh - 640px), 280px);\n  max-height: min(calc(100vh - 640px), 280px);\n  margin: 0 auto;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n}\n.rune-canvas[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  height: auto;\n  max-width: none;\n  cursor: crosshair;\n  touch-action: none;\n}\n.rune-canvas.eraser-cursor[_ngcontent-%COMP%] {\n  cursor: cell;\n}\n.preset-tags[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  margin-bottom: 3px;\n}\n.preset-tag[_ngcontent-%COMP%] {\n  padding: 2px 7px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 12px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.7rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.preset-tag[_ngcontent-%COMP%]:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e2e8f0);\n}\n.preset-tag.active[_ngcontent-%COMP%] {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: var(--accent, #8b5cf6);\n  color: #a78bfa;\n}\n.more-tags-details[_ngcontent-%COMP%] {\n  margin: 3px 0;\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n}\n.more-tags-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] {\n  cursor: pointer;\n  padding: 2px 0;\n}\n.extra-tags[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  max-height: 80px;\n  overflow-y: auto;\n  scrollbar-width: thin;\n}\n.tag-input-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 5px;\n  margin: 4px 0;\n}\n.tag-input-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  padding: 4px 8px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.82rem;\n}\n.tag-input-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.add-tag-btn[_ngcontent-%COMP%] {\n  padding: 6px 14px;\n  background: var(--accent, #8b5cf6);\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 700;\n}\n.add-tag-btn[_ngcontent-%COMP%]:disabled {\n  background: #374151;\n  cursor: not-allowed;\n}\n.tag-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  margin-top: 3px;\n}\n.tag-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  padding: 1px 6px;\n  background: rgba(139, 92, 246, 0.2);\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  color: #a78bfa;\n  border-radius: 10px;\n  font-size: 0.7rem;\n}\n.tag-remove[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: rgba(167, 139, 250, 0.6);\n  cursor: pointer;\n  font-size: 0.85rem;\n  padding: 0 1px;\n  line-height: 1;\n}\n.tag-remove[_ngcontent-%COMP%]:hover {\n  color: #ef4444;\n}\n.cancel-btn[_ngcontent-%COMP%] {\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.82rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.cancel-btn[_ngcontent-%COMP%]:hover {\n  background: var(--bg, #0f172a);\n  color: var(--text, #e2e8f0);\n}\n.delete-btn[_ngcontent-%COMP%] {\n  padding: 5px 10px;\n  background: transparent;\n  border: 1px solid rgba(239, 68, 68, 0.4);\n  border-radius: 6px;\n  color: #ef4444;\n  font-size: 0.82rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.delete-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.save-btn[_ngcontent-%COMP%] {\n  padding: 5px 16px;\n  background: #22c55e;\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.82rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.save-btn[_ngcontent-%COMP%]:hover {\n  background: #16a34a;\n}\n.save-btn[_ngcontent-%COMP%]:disabled {\n  background: #374151;\n  cursor: not-allowed;\n}\n.cost-compact[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: auto 1fr auto 1fr;\n  align-items: center;\n  gap: 4px 8px;\n}\n.cc-lbl[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  white-space: nowrap;\n  padding-right: 2px;\n}\n.mana-label[_ngcontent-%COMP%] {\n  color: #60a5fa;\n}\n.fokus-label[_ngcontent-%COMP%] {\n  color: #fb923c;\n}\n.eff-label[_ngcontent-%COMP%] {\n  color: #4ade80;\n}\n.cc-input[_ngcontent-%COMP%] {\n  padding: 4px 7px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 5px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.85rem;\n  width: 100%;\n  box-sizing: border-box;\n}\n.cc-input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.cc-mult[_ngcontent-%COMP%] {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  text-align: center;\n}\n.req-compact[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.req-ci[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.req-lbl[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  width: 26px;\n  flex-shrink: 0;\n}\n.req-tiny[_ngcontent-%COMP%] {\n  width: 52px;\n  padding: 4px 6px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 5px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.82rem;\n  text-align: center;\n  box-sizing: border-box;\n}\n.req-tiny[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.rt-type-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  margin-bottom: 8px;\n}\n.rt-type-btn[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n  border-radius: 5px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    background 0.12s,\n    color 0.12s;\n}\n.rt-type-btn[_ngcontent-%COMP%]:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.rt-type-btn.rtb-active[_ngcontent-%COMP%] {\n  background: #8b5cf6;\n  border-color: #8b5cf6;\n  color: #fff;\n}\ninput[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, \ninput[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\ninput[type=number][_ngcontent-%COMP%] {\n  -moz-appearance: textfield;\n}\n/*# sourceMappingURL=rune-editor.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RuneEditorComponent, [{
    type: Component,
    args: [{ selector: "app-rune-editor", standalone: true, imports: [CommonModule, FormsModule, ImageUrlPipe], template: `<div class="rune-editor-overlay" (click)="cancelEdit()">\r
  <div class="rune-editor-modal" (click)="$event.stopPropagation()">\r
\r
    <!-- \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="editor-header">\r
      <div class="header-left">\r
        <span class="header-rune-icon">\u169B</span>\r
        <h2>{{ isNewRune ? 'Neue Rune erstellen' : 'Rune bearbeiten' }}</h2>\r
      </div>\r
      <div class="header-actions">\r
        @if (!isNewRune) {\r
          <button class="delete-btn" (click)="deleteRune()">\u{1F5D1} L\xF6schen</button>\r
        }\r
        <button class="cancel-btn" (click)="cancelEdit()">Abbrechen</button>\r
        <button class="save-btn"\r
                (click)="saveRune()"\r
                [disabled]="!editRune.name.trim() || isSavingCanvas()">\r
          {{ isSavingCanvas() ? 'Speichert\u2026' : (isNewRune ? 'Erstellen' : 'Speichern') }}\r
        </button>\r
        <button class="close-btn" (click)="cancelEdit()">\xD7</button>\r
      </div>\r
    </div>\r
\r
    <!-- \u2500\u2500 Body: two columns \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
    <div class="editor-body">\r
\r
      <!-- LEFT COLUMN \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
      <div class="editor-col">\r
\r
        <!-- Basics -->\r
        <section class="ed-section">\r
          <h3 class="section-title">Grundlegendes</h3>\r
\r
          <div class="form-group">\r
            <label>Name *</label>\r
            <input type="text" [(ngModel)]="editRune.name"\r
                   [class.input-empty]="!editRune.name.trim()"\r
                   placeholder="Runenname\u2026">\r
          </div>\r
\r
          <div class="toggle-row">\r
            <label class="toggle-label">\r
              <input type="checkbox" [(ngModel)]="editRune.identified">\r
              <span>Identifiziert</span>\r
            </label>\r
            <span class="toggle-hint">{{ editRune.identified ? 'Details sichtbar' : 'Nur Bild sichtbar' }}</span>\r
            @if (showLearnedToggle) {\r
              <label class="toggle-label">\r
                <input type="checkbox" [(ngModel)]="editRune.learned">\r
                <span>Gelernt</span>\r
              </label>\r
            }\r
          </div>\r
        </section>\r
\r
        <!-- Drawing / Image \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
        <section class="ed-section draw-section">\r
          <div class="section-title-row">\r
            <h3 class="section-title">Runenbild</h3>\r
            <div class="image-action-btns">\r
              @if (!showDrawPanel()) {\r
                <button class="sm-btn" (click)="openDrawPanel()">\u270F Zeichnen</button>\r
                <label class="sm-btn" for="runeFileInput">\u2B06 Hochladen</label>\r
              } @else {\r
                <button class="sm-btn danger" (click)="removeImage()">\u2715 Entfernen</button>\r
              }\r
              <input id="runeFileInput" #fileInput type="file" accept="image/*" style="display:none"\r
                     (change)="onFileSelected($event)">\r
            </div>\r
          </div>\r
\r
          @if (!showDrawPanel() && editRune.drawing) {\r
            <div class="image-preview-box">\r
              <img [src]="editRune.drawing | imageUrl" alt="Rune" class="rune-preview-img">\r
              <button class="img-edit-btn" (click)="openDrawPanel()">\u270F Bearbeiten</button>\r
            </div>\r
          }\r
\r
          @if (!showDrawPanel() && !editRune.drawing) {\r
            <div class="image-placeholder">\r
              <span class="ph-icon">\u169B</span>\r
              <span class="ph-text">Kein Bild vorhanden</span>\r
            </div>\r
          }\r
\r
          @if (showDrawPanel()) {\r
            <!-- Toolbar -->\r
            <div class="draw-toolbar">\r
              <div class="tool-group">\r
                @for (c of glowColors; track c.value) {\r
                  <button class="color-dot"\r
                          [style.background]="c.value"\r
                          [class.active-color]="editRune.glowColor === c.value"\r
                          [style.box-shadow]="editRune.glowColor === c.value\r
                            ? '0 0 0 2px #fff, 0 0 8px ' + c.value\r
                            : 'none'"\r
                          (click)="setGlowColor(c.value)"\r
                          [title]="c.name">\r
                  </button>\r
                }\r
                <input type="color"\r
                       [value]="editRune.glowColor || '#06b6d4'"\r
                       (input)="setGlowColor($any($event.target).value)"\r
                       title="Benutzerdefinierte Farbe"\r
                       class="color-input-native">\r
              </div>\r
              <div class="tool-group">\r
                <button class="tool-btn" [class.active]="!isErasing()" (click)="setDraw()" title="Zeichnen">\u270F</button>\r
                <button class="tool-btn" [class.active]="isErasing()" (click)="toggleEraser()" title="Radierer">\u232B</button>\r
                <button class="tool-btn" (click)="undo()" title="R\xFCckg\xE4ngig (Strg+Z)">\u21A9</button>\r
                <button class="tool-btn danger" (click)="clearCanvas()" title="Alles l\xF6schen">\u{1F5D1}</button>\r
              </div>\r
              <span class="toolbar-hint">Strg+Z = R\xFCckg\xE4ngig</span>\r
            </div>\r
            <!-- Canvas -->\r
            <div class="canvas-wrap">\r
              <canvas #drawCanvas\r
                      [width]="canvasWidth()"\r
                      [height]="canvasHeight()"\r
                      class="rune-canvas"\r
                      [class.eraser-cursor]="isErasing()"\r
                      (mousedown)="onCanvasMouseDown($event)"\r
                      (mousemove)="onCanvasMouseMove($event)"\r
                      (mouseup)="onCanvasMouseUp()"\r
                      (mouseleave)="onCanvasMouseLeave()">\r
              </canvas>\r
            </div>\r
          }\r
        </section>\r
\r
        <!-- Tags \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
        <section class="ed-section">\r
          <h3 class="section-title">Tags</h3>\r
\r
          <div class="preset-tags">\r
            @for (tag of defaultTags; track tag) {\r
              <button class="preset-tag" [class.active]="isTagActive(tag)" (click)="toggleTag(tag)">\r
                {{ tag }}\r
              </button>\r
            }\r
          </div>\r
\r
          <details class="more-tags-details">\r
            <summary>Weitere Tags\u2026</summary>\r
            <div class="preset-tags extra-tags">\r
              @for (tag of allTagOptions; track tag) {\r
                @if (!defaultTags.includes(tag)) {\r
                  <button class="preset-tag" [class.active]="isTagActive(tag)" (click)="toggleTag(tag)">\r
                    {{ tag }}\r
                  </button>\r
                }\r
              }\r
            </div>\r
          </details>\r
\r
          <div class="tag-input-row">\r
            <input type="text" [(ngModel)]="newTag" placeholder="Eigener Tag\u2026"\r
                   (keydown.enter)="addTag(); $event.preventDefault()">\r
            <button class="add-tag-btn" (click)="addTag()" [disabled]="!newTag.trim()">+</button>\r
          </div>\r
\r
          <div class="tag-chips">\r
            @for (tag of editRune.tags; track $index; let i = $index) {\r
              <span class="tag-chip">\r
                {{ tag }}\r
                <button class="tag-remove" (click)="removeTag(i)">\xD7</button>\r
              </span>\r
            }\r
          </div>\r
        </section>\r
\r
      </div><!-- /left col -->\r
\r
      <!-- RIGHT COLUMN \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\r
      <div class="editor-col">\r
\r
        <!-- Effect Description -->\r
        <section class="ed-section">\r
          <h3 class="section-title">Effektbeschreibung</h3>\r
          <div class="form-group">\r
            <textarea [(ngModel)]="editRune.description" rows="3"\r
                      placeholder="Beschreibung des Runeneffekts\u2026"></textarea>\r
          </div>\r
        </section>\r
\r
        <!-- Costs & Values -->\r
        <section class="ed-section">\r
          <h3 class="section-title">Kosten &amp; Werte</h3>\r
          <div class="cost-compact">\r
            <span class="cc-lbl mana-label">Mana</span>\r
            <input type="number" [(ngModel)]="editRune.mana" min="0" class="cc-input" placeholder="0">\r
            <span class="cc-mult">&times;</span>\r
            <input type="number" [(ngModel)]="editRune.manaMult" min="0" step="0.1" class="cc-input" placeholder="0">\r
\r
            <span class="cc-lbl fokus-label">Fokus</span>\r
            <input type="number" [(ngModel)]="editRune.fokus" min="0" class="cc-input" placeholder="0">\r
            <span class="cc-mult">V</span>\r
            <input type="number" [(ngModel)]="editRune.fokusVerlust" min="0" step="0.1" class="cc-input" placeholder="0" title="Fokus-Verlust pro ungenutztem Eingangsport">\r
\r
            <span class="cc-lbl eff-label">Effekt.</span>\r
            <input type="number" [(ngModel)]="editRune.effektivitaet" min="0" class="cc-input" placeholder="0">\r
            <span></span><span></span>\r
          </div>\r
        </section>\r
\r
        <!-- Stat Requirements -->\r
        <section class="ed-section">\r
          <h3 class="section-title">Attributanforderungen</h3>\r
          <div class="req-compact">\r
            <div class="req-ci"><span class="req-lbl">STR</span><input type="number" [(ngModel)]="editRune.statRequirements!.strength" min="0" placeholder="0" class="req-tiny"></div>\r
            <div class="req-ci"><span class="req-lbl">GES</span><input type="number" [(ngModel)]="editRune.statRequirements!.dexterity" min="0" placeholder="0" class="req-tiny"></div>\r
            <div class="req-ci"><span class="req-lbl">SPD</span><input type="number" [(ngModel)]="editRune.statRequirements!.speed" min="0" placeholder="0" class="req-tiny"></div>\r
            <div class="req-ci"><span class="req-lbl">INT</span><input type="number" [(ngModel)]="editRune.statRequirements!.intelligence" min="0" placeholder="0" class="req-tiny"></div>\r
            <div class="req-ci"><span class="req-lbl">KON</span><input type="number" [(ngModel)]="editRune.statRequirements!.constitution" min="0" placeholder="0" class="req-tiny"></div>\r
            <div class="req-ci"><span class="req-lbl">CHR</span><input type="number" [(ngModel)]="editRune.statRequirements!.chill" min="0" placeholder="0" class="req-tiny"></div>\r
          </div>\r
        </section>\r
\r
        <!-- Runentyp -->\r
        <section class="ed-section">\r
          <h3 class="section-title">Runentyp</h3>\r
          <div class="rt-type-row">\r
            <button class="rt-type-btn" [class.rtb-active]="editRune.runeType === 'medium'"\r
                    (click)="setRuneType('medium')" title="Medium">M</button>\r
            <button class="rt-type-btn" [class.rtb-active]="editRune.runeType === 'formung'"\r
                    (click)="setRuneType('formung')" title="Formung">F</button>\r
            <button class="rt-type-btn" [class.rtb-active]="editRune.runeType === 'selektor'"\r
                    (click)="setRuneType('selektor')" title="Selektor">S</button>\r
            <button class="rt-type-btn" [class.rtb-active]="editRune.runeType === 'custom' || !editRune.runeType"\r
                    (click)="setRuneType('custom')" title="Benutzerdefiniert">?</button>\r
          </div>\r
        </section>\r
\r
      </div><!-- /right col -->\r
\r
    </div><!-- /editor-body -->\r
  </div><!-- /modal -->\r
</div><!-- /overlay -->\r
`, styles: ["/* src/app/shared/rune-editor/rune-editor.component.css */\n.rune-editor-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.75);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1100;\n  overflow: hidden;\n}\n.rune-editor-modal {\n  background: var(--card, #1e293b);\n  border-radius: 0;\n  width: 100vw;\n  max-width: 100vw;\n  height: 100vh;\n  max-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: none;\n  overflow: hidden;\n}\n.editor-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 16px;\n  border-bottom: 1px solid var(--border, #374151);\n  flex-shrink: 0;\n  background: rgba(139, 92, 246, 0.06);\n}\n.header-left {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.header-rune-icon {\n  font-size: 1.4rem;\n  color: var(--accent, #8b5cf6);\n}\n.editor-header h2 {\n  margin: 0;\n  font-size: 1rem;\n  color: var(--text, #e2e8f0);\n  font-weight: 600;\n}\n.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.close-btn {\n  background: none;\n  border: none;\n  font-size: 1.5rem;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n  padding: 2px 8px;\n  transition: color 0.2s;\n  margin-left: 4px;\n}\n.close-btn:hover {\n  color: var(--text, #e2e8f0);\n}\n.editor-body {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 0;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n.editor-col {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n  overflow: hidden;\n  padding: 8px 14px;\n}\n.editor-col:last-child {\n  overflow: hidden;\n}\n.editor-col:first-child {\n  border-right: 1px solid var(--border, #374151);\n}\n.ed-section {\n  padding-bottom: 6px;\n  margin-bottom: 6px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.05);\n}\n.ed-section:last-child {\n  border-bottom: none;\n  margin-bottom: 0;\n  padding-bottom: 0;\n}\n.ed-section.draw-section {\n  display: flex;\n  flex-direction: column;\n  padding-bottom: 4px;\n  margin-bottom: 4px;\n}\n.section-title {\n  margin: 0 0 6px;\n  font-size: 0.7rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: var(--accent, #8b5cf6);\n  font-weight: 700;\n}\n.section-title-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 5px;\n}\n.section-title-row .section-title {\n  margin-bottom: 0;\n}\n.form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  margin-bottom: 6px;\n}\n.form-group:last-child {\n  margin-bottom: 0;\n}\n.form-group label {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n}\n.form-group input[type=text],\n.form-group input[type=number],\n.form-group textarea {\n  padding: 5px 8px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.85rem;\n}\n.form-group input:focus,\n.form-group textarea:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);\n}\n.form-group textarea {\n  resize: none;\n  min-height: unset;\n  line-height: 1.4;\n}\n.input-empty {\n  border-color: #ef4444 !important;\n  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);\n}\n.toggle-row {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n  margin-bottom: 0;\n}\n.toggle-label {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  cursor: pointer;\n  font-size: 0.82rem;\n  color: var(--text, #e2e8f0);\n}\n.toggle-label input[type=checkbox] {\n  accent-color: var(--accent, #8b5cf6);\n}\n.toggle-hint {\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  font-style: italic;\n}\n.image-action-btns {\n  display: flex;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sm-btn {\n  padding: 4px 10px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.sm-btn:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e2e8f0);\n}\n.sm-btn.danger {\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #ef4444;\n}\n.sm-btn.danger:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.image-preview-box {\n  position: relative;\n  display: inline-block;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--border, #374151);\n}\n.rune-preview-img {\n  display: block;\n  width: 100%;\n  max-height: 180px;\n  object-fit: contain;\n  background: #000;\n}\n.img-edit-btn {\n  position: absolute;\n  bottom: 6px;\n  right: 6px;\n  padding: 3px 8px;\n  background: rgba(0, 0, 0, 0.7);\n  border: 1px solid var(--border);\n  border-radius: 4px;\n  color: var(--text-muted);\n  font-size: 0.75rem;\n  cursor: pointer;\n}\n.img-edit-btn:hover {\n  color: var(--text, #e2e8f0);\n}\n.image-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  height: 100px;\n  border: 1px dashed var(--border, #374151);\n  border-radius: 8px;\n  color: var(--text-muted, #9ca3af);\n}\n.ph-icon {\n  font-size: 1.8rem;\n  opacity: 0.4;\n}\n.ph-text {\n  font-size: 0.8rem;\n}\n.draw-toolbar {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n  padding: 3px 0 6px;\n}\n.tool-group {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 6px;\n  background: rgba(0, 0, 0, 0.3);\n  border-radius: 6px;\n  border: 1px solid var(--border, #374151);\n}\n.color-dot {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  border: 2px solid transparent;\n  cursor: pointer;\n  transition: transform 0.15s;\n  flex-shrink: 0;\n}\n.color-dot:hover {\n  transform: scale(1.15);\n}\n.color-dot.active-color {\n  border-color: #fff;\n}\n.color-input-native {\n  width: 28px;\n  height: 28px;\n  border: 2px solid var(--border, #374151);\n  border-radius: 6px;\n  cursor: pointer;\n  padding: 0;\n  background: none;\n  flex-shrink: 0;\n}\n.color-input-native::-webkit-color-swatch-wrapper {\n  padding: 2px;\n}\n.color-input-native::-webkit-color-swatch {\n  border: none;\n  border-radius: 4px;\n}\n.tool-btn {\n  padding: 4px 8px;\n  background: transparent;\n  border: 1px solid var(--border, #374151);\n  border-radius: 4px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.9rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.tool-btn:hover {\n  background: rgba(139, 92, 246, 0.15);\n  color: var(--text, #e2e8f0);\n}\n.tool-btn.active {\n  background: rgba(139, 92, 246, 0.25);\n  border-color: var(--accent, #8b5cf6);\n  color: #a78bfa;\n}\n.tool-btn.danger {\n  border-color: rgba(239, 68, 68, 0.3);\n  color: #ef4444;\n}\n.tool-btn.danger:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.toolbar-hint {\n  font-size: 0.7rem;\n  color: var(--text-muted, #9ca3af);\n  opacity: 0.7;\n  margin-left: auto;\n}\n.canvas-wrap {\n  aspect-ratio: 1 / 1;\n  width: 100%;\n  max-width: min(calc(100vh - 640px), 280px);\n  max-height: min(calc(100vh - 640px), 280px);\n  margin: 0 auto;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n}\n.rune-canvas {\n  display: block;\n  width: 100%;\n  height: auto;\n  max-width: none;\n  cursor: crosshair;\n  touch-action: none;\n}\n.rune-canvas.eraser-cursor {\n  cursor: cell;\n}\n.preset-tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  margin-bottom: 3px;\n}\n.preset-tag {\n  padding: 2px 7px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 12px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.7rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.preset-tag:hover {\n  border-color: var(--accent, #8b5cf6);\n  color: var(--text, #e2e8f0);\n}\n.preset-tag.active {\n  background: rgba(139, 92, 246, 0.2);\n  border-color: var(--accent, #8b5cf6);\n  color: #a78bfa;\n}\n.more-tags-details {\n  margin: 3px 0;\n  font-size: 0.75rem;\n  color: var(--text-muted, #9ca3af);\n  cursor: pointer;\n}\n.more-tags-details summary {\n  cursor: pointer;\n  padding: 2px 0;\n}\n.extra-tags {\n  margin-top: 4px;\n  max-height: 80px;\n  overflow-y: auto;\n  scrollbar-width: thin;\n}\n.tag-input-row {\n  display: flex;\n  gap: 5px;\n  margin: 4px 0;\n}\n.tag-input-row input {\n  flex: 1;\n  padding: 4px 8px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.82rem;\n}\n.tag-input-row input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.add-tag-btn {\n  padding: 6px 14px;\n  background: var(--accent, #8b5cf6);\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  cursor: pointer;\n  font-size: 1rem;\n  font-weight: 700;\n}\n.add-tag-btn:disabled {\n  background: #374151;\n  cursor: not-allowed;\n}\n.tag-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 3px;\n  margin-top: 3px;\n}\n.tag-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 3px;\n  padding: 1px 6px;\n  background: rgba(139, 92, 246, 0.2);\n  border: 1px solid rgba(139, 92, 246, 0.4);\n  color: #a78bfa;\n  border-radius: 10px;\n  font-size: 0.7rem;\n}\n.tag-remove {\n  background: none;\n  border: none;\n  color: rgba(167, 139, 250, 0.6);\n  cursor: pointer;\n  font-size: 0.85rem;\n  padding: 0 1px;\n  line-height: 1;\n}\n.tag-remove:hover {\n  color: #ef4444;\n}\n.cancel-btn {\n  padding: 5px 12px;\n  background: transparent;\n  border: 1px solid var(--border, #374151);\n  border-radius: 6px;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.82rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.cancel-btn:hover {\n  background: var(--bg, #0f172a);\n  color: var(--text, #e2e8f0);\n}\n.delete-btn {\n  padding: 5px 10px;\n  background: transparent;\n  border: 1px solid rgba(239, 68, 68, 0.4);\n  border-radius: 6px;\n  color: #ef4444;\n  font-size: 0.82rem;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n.delete-btn:hover {\n  background: rgba(239, 68, 68, 0.1);\n}\n.save-btn {\n  padding: 5px 16px;\n  background: #22c55e;\n  border: none;\n  border-radius: 6px;\n  color: #fff;\n  font-size: 0.82rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 0.15s;\n}\n.save-btn:hover {\n  background: #16a34a;\n}\n.save-btn:disabled {\n  background: #374151;\n  cursor: not-allowed;\n}\n.cost-compact {\n  display: grid;\n  grid-template-columns: auto 1fr auto 1fr;\n  align-items: center;\n  gap: 4px 8px;\n}\n.cc-lbl {\n  font-size: 0.72rem;\n  font-weight: 700;\n  white-space: nowrap;\n  padding-right: 2px;\n}\n.mana-label {\n  color: #60a5fa;\n}\n.fokus-label {\n  color: #fb923c;\n}\n.eff-label {\n  color: #4ade80;\n}\n.cc-input {\n  padding: 4px 7px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 5px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.85rem;\n  width: 100%;\n  box-sizing: border-box;\n}\n.cc-input:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.cc-mult {\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.78rem;\n  text-align: center;\n}\n.req-compact {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n.req-ci {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.req-lbl {\n  font-size: 0.68rem;\n  font-weight: 700;\n  color: var(--text-muted, #9ca3af);\n  text-transform: uppercase;\n  width: 26px;\n  flex-shrink: 0;\n}\n.req-tiny {\n  width: 52px;\n  padding: 4px 6px;\n  background: var(--bg, #0f172a);\n  border: 1px solid var(--border, #374151);\n  border-radius: 5px;\n  color: var(--text, #e2e8f0);\n  font-size: 0.82rem;\n  text-align: center;\n  box-sizing: border-box;\n}\n.req-tiny:focus {\n  outline: none;\n  border-color: var(--accent, #8b5cf6);\n}\n.rt-type-row {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  margin-bottom: 8px;\n}\n.rt-type-btn {\n  width: 26px;\n  height: 26px;\n  border-radius: 5px;\n  border: 1px solid var(--border, #374151);\n  background: transparent;\n  color: var(--text-muted, #9ca3af);\n  font-size: 0.75rem;\n  font-weight: 700;\n  cursor: pointer;\n  transition:\n    border-color 0.12s,\n    background 0.12s,\n    color 0.12s;\n}\n.rt-type-btn:hover {\n  border-color: #8b5cf6;\n  color: #a78bfa;\n}\n.rt-type-btn.rtb-active {\n  background: #8b5cf6;\n  border-color: #8b5cf6;\n  color: #fff;\n}\ninput[type=number]::-webkit-inner-spin-button,\ninput[type=number]::-webkit-outer-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}\ninput[type=number] {\n  -moz-appearance: textfield;\n}\n/*# sourceMappingURL=rune-editor.component.css.map */\n"] }]
  }], null, { rune: [{
    type: Input
  }], showLearnedToggle: [{
    type: Input
  }], save: [{
    type: Output
  }], cancel: [{
    type: Output
  }], delete: [{
    type: Output
  }], canvasRef: [{
    type: ViewChild,
    args: ["drawCanvas", { static: false }]
  }], fileInputRef: [{
    type: ViewChild,
    args: ["fileInput", { static: false }]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(RuneEditorComponent, { className: "RuneEditorComponent", filePath: "app/shared/rune-editor/rune-editor.component.ts", lineNumber: 18 });
})();

export {
  createEmptyShopEvent,
  createEmptyLootBundleEvent,
  createEmptyShopDeal,
  convertToCopper,
  copperToCurrency,
  formatCurrency,
  formatCurrencyAsGold,
  getCoinParts,
  RUNE_TYPE_LABELS,
  RuneEditorComponent
};
//# sourceMappingURL=chunk-2K7XH5ES.js.map
