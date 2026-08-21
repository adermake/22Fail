import {
  CardComponent
} from "./chunk-OMKCU2ST.js";
import {
  ImageService
} from "./chunk-7RNBGZ3X.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MaxValidator,
  MinValidator,
  NgControlStatus,
  NgModel,
  NumberValueAccessor
} from "./chunk-VMGRJE2Y.js";
import {
  CommonModule,
  HttpClient
} from "./chunk-FGI44Z6P.js";
import {
  Component,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
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
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-XJL25EXC.js";
import {
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// src/app/stress-test/stress-test.component.ts
function StressTestComponent_Conditional_18_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 26);
    \u0275\u0275element(1, "img", 27);
    \u0275\u0275elementStart(2, "button", 28);
    \u0275\u0275listener("click", function StressTestComponent_Conditional_18_For_5_Template_button_click_2_listener() {
      const \u0275$index_37_r4 = \u0275\u0275restoreView(_r3).$index;
      const ctx_r4 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r4.removeImage(\u0275$index_37_r4));
    });
    \u0275\u0275text(3, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const imageId_r6 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("src", "/api/images/" + imageId_r6, \u0275\u0275sanitizeUrl);
  }
}
function StressTestComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8)(1, "h3");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 25);
    \u0275\u0275repeaterCreate(4, StressTestComponent_Conditional_18_For_5_Template, 4, 1, "div", 26, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r4 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("Uploaded: ", ctx_r4.uploadedImages().length, " images");
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r4.uploadedImages());
  }
}
function StressTestComponent_Conditional_76_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u23F3 Generating... ");
  }
}
function StressTestComponent_Conditional_77_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u{1F3B2} Generate Test Data ");
  }
}
function StressTestComponent_Conditional_79_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u23F3 Cleaning... ");
  }
}
function StressTestComponent_Conditional_80_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u{1F5D1}\uFE0F Cleanup Test Data ");
  }
}
function StressTestComponent_Conditional_81_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r4 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r4.generationProgress());
  }
}
function StressTestComponent_Conditional_82_For_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "li")(1, "a", 37);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const worldName_r7 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("href", "/world/" + worldName_r7, \u0275\u0275sanitizeUrl);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(worldName_r7);
  }
}
function StressTestComponent_Conditional_82_For_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "code");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const charId_r8 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(charId_r8);
  }
}
function StressTestComponent_Conditional_82_For_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "img", 36);
  }
  if (rf & 2) {
    const imageId_r9 = ctx.$implicit;
    \u0275\u0275property("src", "/api/images/" + imageId_r9, \u0275\u0275sanitizeUrl)("alt", imageId_r9);
  }
}
function StressTestComponent_Conditional_82_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22)(1, "h2");
    \u0275\u0275text(2, "\u2705 Generation Results");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 29)(4, "div", 30)(5, "div", 31);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 32);
    \u0275\u0275text(8, "Characters");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "div", 30)(10, "div", 31);
    \u0275\u0275text(11);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "div", 32);
    \u0275\u0275text(13, "Worlds");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 30)(15, "div", 31);
    \u0275\u0275text(16);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "div", 32);
    \u0275\u0275text(18, "Images");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(19, "div", 33)(20, "h3");
    \u0275\u0275text(21, "Generated Worlds:");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "ul");
    \u0275\u0275repeaterCreate(23, StressTestComponent_Conditional_82_For_24_Template, 3, 2, "li", null, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "details")(26, "summary");
    \u0275\u0275text(27);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "div", 34);
    \u0275\u0275repeaterCreate(29, StressTestComponent_Conditional_82_For_30_Template, 2, 1, "code", null, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(31, "details")(32, "summary");
    \u0275\u0275text(33);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(34, "div", 35);
    \u0275\u0275repeaterCreate(35, StressTestComponent_Conditional_82_For_36_Template, 1, 2, "img", 36, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r4 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275textInterpolate(ctx_r4.lastResult().created.characters);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r4.lastResult().created.worlds);
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(ctx_r4.lastResult().created.images);
    \u0275\u0275advance(7);
    \u0275\u0275repeater(ctx_r4.lastResult().worldNames);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Character IDs (", ctx_r4.lastResult().characterIds.length, ")");
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r4.lastResult().characterIds);
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate1("Image IDs (", ctx_r4.lastResult().imageIds.length, ")");
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r4.lastResult().imageIds);
  }
}
var StressTestComponent = class _StressTestComponent {
  http = inject(HttpClient);
  imageService = inject(ImageService);
  // Configuration
  config = {
    characters: 100,
    worlds: 5,
    items: 50,
    spells: 30,
    runes: 20,
    skills: 15,
    battlemaps: 10
  };
  // Upload state
  uploadedImages = signal([], ...ngDevMode ? [{ debugName: "uploadedImages" }] : []);
  uploadProgress = signal("", ...ngDevMode ? [{ debugName: "uploadProgress" }] : []);
  // Generation state
  isGenerating = signal(false, ...ngDevMode ? [{ debugName: "isGenerating" }] : []);
  generationProgress = signal("", ...ngDevMode ? [{ debugName: "generationProgress" }] : []);
  lastResult = signal(null, ...ngDevMode ? [{ debugName: "lastResult" }] : []);
  // Cleanup state
  isCleaningUp = signal(false, ...ngDevMode ? [{ debugName: "isCleaningUp" }] : []);
  // File input handler
  async onFileSelected(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0)
      return;
    this.uploadProgress.set("Uploading images...");
    const files = Array.from(input.files);
    const imageIds = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.uploadProgress.set(`Uploading ${i + 1}/${files.length}: ${file.name}`);
      try {
        const base64 = await this.fileToBase64(file);
        const imageId = await this.imageService.uploadImage(base64);
        imageIds.push(imageId);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
    this.uploadedImages.set([...this.uploadedImages(), ...imageIds]);
    this.uploadProgress.set(`Uploaded ${imageIds.length} images`);
    input.value = "";
  }
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  removeImage(index) {
    const images = [...this.uploadedImages()];
    images.splice(index, 1);
    this.uploadedImages.set(images);
  }
  async generateTestData() {
    if (this.isGenerating())
      return;
    this.isGenerating.set(true);
    this.generationProgress.set("Starting generation...");
    this.lastResult.set(null);
    try {
      const body = __spreadValues({}, this.config);
      if (this.uploadedImages().length > 0) {
        body.imageIds = this.uploadedImages();
      }
      this.generationProgress.set("Generating characters, worlds, and items...");
      const result = await this.http.post("/api/stress-test/generate", body).toPromise();
      if (result) {
        this.lastResult.set(result);
        this.generationProgress.set("\u2705 Generation complete!");
      }
    } catch (error) {
      console.error("Stress test generation failed:", error);
      this.generationProgress.set("\u274C Generation failed - check console");
    } finally {
      this.isGenerating.set(false);
    }
  }
  async cleanupTestData() {
    if (this.isCleaningUp() || !confirm("This will delete all stress test data (characters starting with stress_char_ and worlds starting with StressWorld_). Continue?")) {
      return;
    }
    this.isCleaningUp.set(true);
    this.generationProgress.set("Cleaning up test data...");
    try {
      const result = await this.http.delete("/api/stress-test/cleanup").toPromise();
      if (result) {
        this.generationProgress.set(`\u2705 Deleted ${result.deleted.characters} characters, ${result.deleted.worlds} worlds`);
        this.lastResult.set(null);
      }
    } catch (error) {
      console.error("Cleanup failed:", error);
      this.generationProgress.set("\u274C Cleanup failed - check console");
    } finally {
      this.isCleaningUp.set(false);
    }
  }
  // Preset configurations
  loadPresetSmall() {
    this.config = {
      characters: 10,
      worlds: 1,
      items: 20,
      spells: 10,
      runes: 10,
      skills: 5,
      battlemaps: 2
    };
  }
  loadPresetMedium() {
    this.config = {
      characters: 100,
      worlds: 5,
      items: 50,
      spells: 30,
      runes: 20,
      skills: 15,
      battlemaps: 10
    };
  }
  loadPresetLarge() {
    this.config = {
      characters: 500,
      worlds: 20,
      items: 200,
      spells: 100,
      runes: 80,
      skills: 50,
      battlemaps: 30
    };
  }
  loadPresetExtreme() {
    this.config = {
      characters: 2e3,
      worlds: 50,
      items: 500,
      spells: 300,
      runes: 200,
      skills: 150,
      battlemaps: 100
    };
  }
  get estimatedDataSize() {
    const charSize = 5;
    const worldBaseSize = 10;
    const itemSize = 0.5;
    const spellSize = 0.5;
    const runeSize = 0.5;
    const skillSize = 0.3;
    const battlemapSize = 2;
    const totalKB = this.config.characters * charSize + this.config.worlds * (worldBaseSize + this.config.items * itemSize + this.config.spells * spellSize + this.config.runes * runeSize + this.config.skills * skillSize + this.config.battlemaps * battlemapSize);
    if (totalKB < 1024)
      return `~${Math.round(totalKB)} KB`;
    return `~${(totalKB / 1024).toFixed(1)} MB`;
  }
  get totalEntities() {
    return this.config.characters + this.config.worlds + this.config.worlds * (this.config.items + this.config.spells + this.config.runes + this.config.skills + this.config.battlemaps);
  }
  static \u0275fac = function StressTestComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _StressTestComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _StressTestComponent, selectors: [["app-stress-test"]], decls: 103, vars: 17, consts: [["fileInput", ""], [1, "stress-test-container"], [1, "subtitle"], [1, "section"], [1, "upload-area"], ["type", "file", "id", "imageUpload", "accept", "image/*", "multiple", "", 2, "display", "none", 3, "change"], [1, "btn", "btn-primary", 3, "click"], [1, "upload-status"], [1, "uploaded-images"], [1, "preset-buttons"], [1, "btn", 3, "click"], [1, "btn", "btn-danger", 3, "click"], [1, "config-grid"], [1, "config-item"], ["type", "number", "min", "0", "max", "10000", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "max", "100", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "max", "1000", 3, "ngModelChange", "ngModel"], ["type", "number", "min", "0", "max", "500", 3, "ngModelChange", "ngModel"], [1, "stats"], [1, "btn", "btn-success", "btn-large", 3, "click", "disabled"], [1, "btn", "btn-danger", "btn-large", 3, "click", "disabled"], [1, "progress-message"], [1, "section", "results"], [1, "section", "instructions"], [1, "warning"], [1, "image-list"], [1, "image-item"], ["alt", "Test image", 3, "src"], [1, "btn-remove", 3, "click"], [1, "result-grid"], [1, "result-item"], [1, "result-number"], [1, "result-label"], [1, "result-details"], [1, "character-ids"], [1, "image-ids"], [3, "src", "alt"], ["target", "_blank", 3, "href"]], template: function StressTestComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 1)(1, "app-card")(2, "h1");
      \u0275\u0275text(3, "\u{1F525} Performance Stress Test Generator");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(4, "p", 2);
      \u0275\u0275text(5, "Generate massive amounts of test data to stress test the entire system");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(6, "div", 3)(7, "h2");
      \u0275\u0275text(8, "\u{1F4F8} Test Images (Optional)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "p");
      \u0275\u0275text(10, "Upload images to use for character portraits, spells, runes, and battlemap tokens. If none provided, system will use default colored pixels.");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "div", 4)(12, "input", 5, 0);
      \u0275\u0275listener("change", function StressTestComponent_Template_input_change_12_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.onFileSelected($event));
      });
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(14, "button", 6);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_14_listener() {
        \u0275\u0275restoreView(_r1);
        const fileInput_r2 = \u0275\u0275reference(13);
        return \u0275\u0275resetView(fileInput_r2.click());
      });
      \u0275\u0275text(15, " \u{1F4E4} Upload Images ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "span", 7);
      \u0275\u0275text(17);
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(18, StressTestComponent_Conditional_18_Template, 6, 1, "div", 8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(19, "div", 3)(20, "h2");
      \u0275\u0275text(21, "\u26A1 Quick Presets");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(22, "div", 9)(23, "button", 10);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_23_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.loadPresetSmall());
      });
      \u0275\u0275text(24, "Small (10 chars)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(25, "button", 10);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_25_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.loadPresetMedium());
      });
      \u0275\u0275text(26, "Medium (100 chars)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "button", 10);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_27_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.loadPresetLarge());
      });
      \u0275\u0275text(28, "Large (500 chars)");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(29, "button", 11);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_29_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.loadPresetExtreme());
      });
      \u0275\u0275text(30, "\u{1F525} Extreme (2000 chars)");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(31, "div", 3)(32, "h2");
      \u0275\u0275text(33, "\u2699\uFE0F Configuration");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(34, "div", 12)(35, "div", 13)(36, "label");
      \u0275\u0275text(37, "Characters:");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "input", 14);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_38_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.characters, $event) || (ctx.config.characters = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(39, "div", 13)(40, "label");
      \u0275\u0275text(41, "Worlds:");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "input", 15);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_42_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.worlds, $event) || (ctx.config.worlds = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(43, "div", 13)(44, "label");
      \u0275\u0275text(45, "Items (per world):");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(46, "input", 16);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_46_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.items, $event) || (ctx.config.items = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(47, "div", 13)(48, "label");
      \u0275\u0275text(49, "Spells (per world):");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(50, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_50_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.spells, $event) || (ctx.config.spells = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(51, "div", 13)(52, "label");
      \u0275\u0275text(53, "Runes (per world):");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(54, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_54_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.runes, $event) || (ctx.config.runes = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(55, "div", 13)(56, "label");
      \u0275\u0275text(57, "Skills (per world):");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(58, "input", 17);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_58_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.skills, $event) || (ctx.config.skills = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(59, "div", 13)(60, "label");
      \u0275\u0275text(61, "Battlemaps (per world):");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(62, "input", 15);
      \u0275\u0275twoWayListener("ngModelChange", function StressTestComponent_Template_input_ngModelChange_62_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.config.battlemaps, $event) || (ctx.config.battlemaps = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(63, "div", 18)(64, "p")(65, "strong");
      \u0275\u0275text(66, "Total Entities:");
      \u0275\u0275elementEnd();
      \u0275\u0275text(67);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(68, "p")(69, "strong");
      \u0275\u0275text(70, "Estimated Size:");
      \u0275\u0275elementEnd();
      \u0275\u0275text(71);
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(72, "div", 3)(73, "h2");
      \u0275\u0275text(74, "\u{1F680} Actions");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(75, "button", 19);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_75_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.generateTestData());
      });
      \u0275\u0275conditionalCreate(76, StressTestComponent_Conditional_76_Template, 1, 0)(77, StressTestComponent_Conditional_77_Template, 1, 0);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(78, "button", 20);
      \u0275\u0275listener("click", function StressTestComponent_Template_button_click_78_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.cleanupTestData());
      });
      \u0275\u0275conditionalCreate(79, StressTestComponent_Conditional_79_Template, 1, 0)(80, StressTestComponent_Conditional_80_Template, 1, 0);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(81, StressTestComponent_Conditional_81_Template, 2, 1, "div", 21);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(82, StressTestComponent_Conditional_82_Template, 37, 5, "div", 22);
      \u0275\u0275elementStart(83, "div", 23)(84, "h2");
      \u0275\u0275text(85, "\u{1F4D6} How to Use");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(86, "ol")(87, "li")(88, "strong");
      \u0275\u0275text(89, "Optional:");
      \u0275\u0275elementEnd();
      \u0275\u0275text(90, " Upload custom images to use for portraits and drawings");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(91, "li");
      \u0275\u0275text(92, "Choose a preset or configure custom entity counts");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(93, "li");
      \u0275\u0275text(94, 'Click "Generate Test Data" to create all entities');
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(95, "li");
      \u0275\u0275text(96, "Navigate to generated worlds to test performance");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(97, "li");
      \u0275\u0275text(98, 'Click "Cleanup Test Data" when done to remove all test entities');
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(99, "div", 24)(100, "strong");
      \u0275\u0275text(101, "\u26A0\uFE0F Warning:");
      \u0275\u0275elementEnd();
      \u0275\u0275text(102, ' The "Extreme" preset generates 2000+ characters and massive amounts of data. This may take several minutes and could impact performance during generation. ');
      \u0275\u0275elementEnd()()()();
    }
    if (rf & 2) {
      \u0275\u0275advance(17);
      \u0275\u0275textInterpolate(ctx.uploadProgress());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.uploadedImages().length > 0 ? 18 : -1);
      \u0275\u0275advance(20);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.characters);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.worlds);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.items);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.spells);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.runes);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.skills);
      \u0275\u0275advance(4);
      \u0275\u0275twoWayProperty("ngModel", ctx.config.battlemaps);
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1(" ", ctx.totalEntities);
      \u0275\u0275advance(4);
      \u0275\u0275textInterpolate1(" ", ctx.estimatedDataSize);
      \u0275\u0275advance(4);
      \u0275\u0275property("disabled", ctx.isGenerating());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.isGenerating() ? 76 : 77);
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", ctx.isCleaningUp() || ctx.isGenerating());
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.isCleaningUp() ? 79 : 80);
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.generationProgress() ? 81 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.lastResult() ? 82 : -1);
    }
  }, dependencies: [CommonModule, FormsModule, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, MinValidator, MaxValidator, NgModel, CardComponent], styles: ["\n\n.stress-test-container[_ngcontent-%COMP%] {\n  padding: 20px;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n.subtitle[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 14px;\n  margin-top: -10px;\n}\n.section[_ngcontent-%COMP%] {\n  margin: 30px 0;\n  padding: 20px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}\n.section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\n  margin-top: 0;\n  color: #333;\n}\n.upload-area[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 15px;\n  align-items: center;\n  margin: 15px 0;\n}\n.upload-status[_ngcontent-%COMP%] {\n  color: #666;\n  font-size: 14px;\n}\n.uploaded-images[_ngcontent-%COMP%] {\n  margin-top: 20px;\n}\n.image-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n  margin-top: 10px;\n}\n.image-item[_ngcontent-%COMP%] {\n  position: relative;\n  width: 80px;\n  height: 80px;\n  border: 2px solid #ddd;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.image-item[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.btn-remove[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  background: rgba(255, 0, 0, 0.8);\n  color: white;\n  border: none;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  cursor: pointer;\n  font-size: 18px;\n  line-height: 1;\n  padding: 0;\n}\n.btn-remove[_ngcontent-%COMP%]:hover {\n  background: rgba(255, 0, 0, 1);\n}\n.preset-buttons[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.config-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 15px;\n  margin: 20px 0;\n}\n.config-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.config-item[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #555;\n}\n.config-item[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 16px;\n}\n.config-item[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\n  outline: none;\n  border-color: #007bff;\n}\n.stats[_ngcontent-%COMP%] {\n  margin-top: 20px;\n  padding: 15px;\n  background: white;\n  border-radius: 4px;\n  border-left: 4px solid #007bff;\n}\n.stats[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 5px 0;\n}\n.btn[_ngcontent-%COMP%] {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n.btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n}\n.btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background: #007bff;\n  color: white;\n}\n.btn-primary[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #0056b3;\n}\n.btn-success[_ngcontent-%COMP%] {\n  background: #28a745;\n  color: white;\n}\n.btn-success[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #218838;\n}\n.btn-danger[_ngcontent-%COMP%] {\n  background: #dc3545;\n  color: white;\n}\n.btn-danger[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #c82333;\n}\n.btn-large[_ngcontent-%COMP%] {\n  padding: 15px 30px;\n  font-size: 16px;\n  margin-right: 15px;\n  margin-bottom: 15px;\n}\n.progress-message[_ngcontent-%COMP%] {\n  margin-top: 15px;\n  padding: 15px;\n  background: #e9ecef;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 16px;\n}\n.results[_ngcontent-%COMP%] {\n  background: #d4edda;\n  border-left: 4px solid #28a745;\n}\n.result-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: 20px;\n  margin: 20px 0;\n}\n.result-item[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 20px;\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.result-number[_ngcontent-%COMP%] {\n  font-size: 48px;\n  font-weight: bold;\n  color: #28a745;\n}\n.result-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: #666;\n  margin-top: 5px;\n}\n.result-details[_ngcontent-%COMP%] {\n  margin-top: 20px;\n}\n.result-details[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\n  margin-bottom: 10px;\n}\n.result-details[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] {\n  list-style: none;\n  padding: 0;\n}\n.result-details[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  padding: 5px 0;\n}\n.result-details[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #007bff;\n  text-decoration: none;\n}\n.result-details[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.result-details[_ngcontent-%COMP%]   details[_ngcontent-%COMP%] {\n  margin-top: 15px;\n  padding: 10px;\n  background: white;\n  border-radius: 4px;\n}\n.result-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] {\n  cursor: pointer;\n  font-weight: 600;\n  padding: 5px;\n}\n.result-details[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]:hover {\n  background: #f8f9fa;\n}\n.character-ids[_ngcontent-%COMP%], \n.image-ids[_ngcontent-%COMP%] {\n  margin-top: 10px;\n  padding: 10px;\n  background: #f8f9fa;\n  border-radius: 4px;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.character-ids[_ngcontent-%COMP%]   code[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin: 5px;\n  padding: 5px 10px;\n  background: white;\n  border: 1px solid #ddd;\n  border-radius: 3px;\n  font-size: 12px;\n}\n.image-ids[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n}\n.image-ids[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 60px;\n  height: 60px;\n  object-fit: cover;\n  border: 2px solid #ddd;\n  border-radius: 4px;\n}\n.instructions[_ngcontent-%COMP%] {\n  background: #fff3cd;\n  border-left: 4px solid #ffc107;\n}\n.instructions[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%] {\n  padding-left: 20px;\n}\n.instructions[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n  margin: 10px 0;\n}\n.warning[_ngcontent-%COMP%] {\n  margin-top: 20px;\n  padding: 15px;\n  background: #f8d7da;\n  border: 1px solid #f5c6cb;\n  border-radius: 4px;\n  color: #721c24;\n}\n/*# sourceMappingURL=stress-test.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(StressTestComponent, [{
    type: Component,
    args: [{ selector: "app-stress-test", standalone: true, imports: [CommonModule, FormsModule, CardComponent], template: `<div class="stress-test-container">\r
  <app-card>\r
    <h1>\u{1F525} Performance Stress Test Generator</h1>\r
    <p class="subtitle">Generate massive amounts of test data to stress test the entire system</p>\r
\r
    <!-- Image Upload Section -->\r
    <div class="section">\r
      <h2>\u{1F4F8} Test Images (Optional)</h2>\r
      <p>Upload images to use for character portraits, spells, runes, and battlemap tokens. If none provided, system will use default colored pixels.</p>\r
      \r
      <div class="upload-area">\r
        <input \r
          type="file" \r
          id="imageUpload" \r
          accept="image/*" \r
          multiple \r
          (change)="onFileSelected($event)"\r
          style="display: none"\r
          #fileInput\r
        />\r
        <button class="btn btn-primary" (click)="fileInput.click()">\r
          \u{1F4E4} Upload Images\r
        </button>\r
        <span class="upload-status">{{ uploadProgress() }}</span>\r
      </div>\r
\r
      @if (uploadedImages().length > 0) {\r
        <div class="uploaded-images">\r
          <h3>Uploaded: {{ uploadedImages().length }} images</h3>\r
          <div class="image-list">\r
            @for (imageId of uploadedImages(); track imageId; let i = $index) {\r
              <div class="image-item">\r
                <img [src]="'/api/images/' + imageId" alt="Test image" />\r
                <button class="btn-remove" (click)="removeImage(i)">\xD7</button>\r
              </div>\r
            }\r
          </div>\r
        </div>\r
      }\r
    </div>\r
\r
    <!-- Presets -->\r
    <div class="section">\r
      <h2>\u26A1 Quick Presets</h2>\r
      <div class="preset-buttons">\r
        <button class="btn" (click)="loadPresetSmall()">Small (10 chars)</button>\r
        <button class="btn" (click)="loadPresetMedium()">Medium (100 chars)</button>\r
        <button class="btn" (click)="loadPresetLarge()">Large (500 chars)</button>\r
        <button class="btn btn-danger" (click)="loadPresetExtreme()">\u{1F525} Extreme (2000 chars)</button>\r
      </div>\r
    </div>\r
\r
    <!-- Configuration Form -->\r
    <div class="section">\r
      <h2>\u2699\uFE0F Configuration</h2>\r
      \r
      <div class="config-grid">\r
        <div class="config-item">\r
          <label>Characters:</label>\r
          <input type="number" [(ngModel)]="config.characters" min="0" max="10000" />\r
        </div>\r
\r
        <div class="config-item">\r
          <label>Worlds:</label>\r
          <input type="number" [(ngModel)]="config.worlds" min="0" max="100" />\r
        </div>\r
\r
        <div class="config-item">\r
          <label>Items (per world):</label>\r
          <input type="number" [(ngModel)]="config.items" min="0" max="1000" />\r
        </div>\r
\r
        <div class="config-item">\r
          <label>Spells (per world):</label>\r
          <input type="number" [(ngModel)]="config.spells" min="0" max="500" />\r
        </div>\r
\r
        <div class="config-item">\r
          <label>Runes (per world):</label>\r
          <input type="number" [(ngModel)]="config.runes" min="0" max="500" />\r
        </div>\r
\r
        <div class="config-item">\r
          <label>Skills (per world):</label>\r
          <input type="number" [(ngModel)]="config.skills" min="0" max="500" />\r
        </div>\r
\r
        <div class="config-item">\r
          <label>Battlemaps (per world):</label>\r
          <input type="number" [(ngModel)]="config.battlemaps" min="0" max="100" />\r
        </div>\r
      </div>\r
\r
      <div class="stats">\r
        <p><strong>Total Entities:</strong> {{ totalEntities }}</p>\r
        <p><strong>Estimated Size:</strong> {{ estimatedDataSize }}</p>\r
      </div>\r
    </div>\r
\r
    <!-- Actions -->\r
    <div class="section">\r
      <h2>\u{1F680} Actions</h2>\r
      \r
      <button \r
        class="btn btn-success btn-large" \r
        (click)="generateTestData()"\r
        [disabled]="isGenerating()"\r
      >\r
        @if (isGenerating()) {\r
          \u23F3 Generating...\r
        } @else {\r
          \u{1F3B2} Generate Test Data\r
        }\r
      </button>\r
\r
      <button \r
        class="btn btn-danger btn-large" \r
        (click)="cleanupTestData()"\r
        [disabled]="isCleaningUp() || isGenerating()"\r
      >\r
        @if (isCleaningUp()) {\r
          \u23F3 Cleaning...\r
        } @else {\r
          \u{1F5D1}\uFE0F Cleanup Test Data\r
        }\r
      </button>\r
\r
      @if (generationProgress()) {\r
        <div class="progress-message">{{ generationProgress() }}</div>\r
      }\r
    </div>\r
\r
    <!-- Results -->\r
    @if (lastResult()) {\r
      <div class="section results">\r
        <h2>\u2705 Generation Results</h2>\r
        \r
        <div class="result-grid">\r
          <div class="result-item">\r
            <div class="result-number">{{ lastResult()!.created.characters }}</div>\r
            <div class="result-label">Characters</div>\r
          </div>\r
          \r
          <div class="result-item">\r
            <div class="result-number">{{ lastResult()!.created.worlds }}</div>\r
            <div class="result-label">Worlds</div>\r
          </div>\r
          \r
          <div class="result-item">\r
            <div class="result-number">{{ lastResult()!.created.images }}</div>\r
            <div class="result-label">Images</div>\r
          </div>\r
        </div>\r
\r
        <div class="result-details">\r
          <h3>Generated Worlds:</h3>\r
          <ul>\r
            @for (worldName of lastResult()!.worldNames; track worldName) {\r
              <li>\r
                <a [href]="'/world/' + worldName" target="_blank">{{ worldName }}</a>\r
              </li>\r
            }\r
          </ul>\r
\r
          <details>\r
            <summary>Character IDs ({{ lastResult()!.characterIds.length }})</summary>\r
            <div class="character-ids">\r
              @for (charId of lastResult()!.characterIds; track charId) {\r
                <code>{{ charId }}</code>\r
              }\r
            </div>\r
          </details>\r
\r
          <details>\r
            <summary>Image IDs ({{ lastResult()!.imageIds.length }})</summary>\r
            <div class="image-ids">\r
              @for (imageId of lastResult()!.imageIds; track imageId) {\r
                <img [src]="'/api/images/' + imageId" [alt]="imageId" />\r
              }\r
            </div>\r
          </details>\r
        </div>\r
      </div>\r
    }\r
\r
    <!-- Instructions -->\r
    <div class="section instructions">\r
      <h2>\u{1F4D6} How to Use</h2>\r
      <ol>\r
        <li><strong>Optional:</strong> Upload custom images to use for portraits and drawings</li>\r
        <li>Choose a preset or configure custom entity counts</li>\r
        <li>Click "Generate Test Data" to create all entities</li>\r
        <li>Navigate to generated worlds to test performance</li>\r
        <li>Click "Cleanup Test Data" when done to remove all test entities</li>\r
      </ol>\r
\r
      <div class="warning">\r
        <strong>\u26A0\uFE0F Warning:</strong> The "Extreme" preset generates 2000+ characters and massive amounts of data. \r
        This may take several minutes and could impact performance during generation.\r
      </div>\r
    </div>\r
  </app-card>\r
</div>\r
`, styles: ["/* src/app/stress-test/stress-test.component.css */\n.stress-test-container {\n  padding: 20px;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n.subtitle {\n  color: #666;\n  font-size: 14px;\n  margin-top: -10px;\n}\n.section {\n  margin: 30px 0;\n  padding: 20px;\n  background: #f8f9fa;\n  border-radius: 8px;\n}\n.section h2 {\n  margin-top: 0;\n  color: #333;\n}\n.upload-area {\n  display: flex;\n  gap: 15px;\n  align-items: center;\n  margin: 15px 0;\n}\n.upload-status {\n  color: #666;\n  font-size: 14px;\n}\n.uploaded-images {\n  margin-top: 20px;\n}\n.image-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n  margin-top: 10px;\n}\n.image-item {\n  position: relative;\n  width: 80px;\n  height: 80px;\n  border: 2px solid #ddd;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.image-item img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.btn-remove {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  background: rgba(255, 0, 0, 0.8);\n  color: white;\n  border: none;\n  border-radius: 50%;\n  width: 24px;\n  height: 24px;\n  cursor: pointer;\n  font-size: 18px;\n  line-height: 1;\n  padding: 0;\n}\n.btn-remove:hover {\n  background: rgba(255, 0, 0, 1);\n}\n.preset-buttons {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n}\n.config-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 15px;\n  margin: 20px 0;\n}\n.config-item {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.config-item label {\n  font-weight: 600;\n  color: #555;\n}\n.config-item input {\n  padding: 8px 12px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 16px;\n}\n.config-item input:focus {\n  outline: none;\n  border-color: #007bff;\n}\n.stats {\n  margin-top: 20px;\n  padding: 15px;\n  background: white;\n  border-radius: 4px;\n  border-left: 4px solid #007bff;\n}\n.stats p {\n  margin: 5px 0;\n}\n.btn {\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  font-weight: 600;\n  transition: all 0.2s;\n}\n.btn:hover:not(:disabled) {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n}\n.btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.btn-primary {\n  background: #007bff;\n  color: white;\n}\n.btn-primary:hover:not(:disabled) {\n  background: #0056b3;\n}\n.btn-success {\n  background: #28a745;\n  color: white;\n}\n.btn-success:hover:not(:disabled) {\n  background: #218838;\n}\n.btn-danger {\n  background: #dc3545;\n  color: white;\n}\n.btn-danger:hover:not(:disabled) {\n  background: #c82333;\n}\n.btn-large {\n  padding: 15px 30px;\n  font-size: 16px;\n  margin-right: 15px;\n  margin-bottom: 15px;\n}\n.progress-message {\n  margin-top: 15px;\n  padding: 15px;\n  background: #e9ecef;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 16px;\n}\n.results {\n  background: #d4edda;\n  border-left: 4px solid #28a745;\n}\n.result-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: 20px;\n  margin: 20px 0;\n}\n.result-item {\n  text-align: center;\n  padding: 20px;\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n}\n.result-number {\n  font-size: 48px;\n  font-weight: bold;\n  color: #28a745;\n}\n.result-label {\n  font-size: 14px;\n  color: #666;\n  margin-top: 5px;\n}\n.result-details {\n  margin-top: 20px;\n}\n.result-details h3 {\n  margin-bottom: 10px;\n}\n.result-details ul {\n  list-style: none;\n  padding: 0;\n}\n.result-details li {\n  padding: 5px 0;\n}\n.result-details a {\n  color: #007bff;\n  text-decoration: none;\n}\n.result-details a:hover {\n  text-decoration: underline;\n}\n.result-details details {\n  margin-top: 15px;\n  padding: 10px;\n  background: white;\n  border-radius: 4px;\n}\n.result-details summary {\n  cursor: pointer;\n  font-weight: 600;\n  padding: 5px;\n}\n.result-details summary:hover {\n  background: #f8f9fa;\n}\n.character-ids,\n.image-ids {\n  margin-top: 10px;\n  padding: 10px;\n  background: #f8f9fa;\n  border-radius: 4px;\n  max-height: 300px;\n  overflow-y: auto;\n}\n.character-ids code {\n  display: inline-block;\n  margin: 5px;\n  padding: 5px 10px;\n  background: white;\n  border: 1px solid #ddd;\n  border-radius: 3px;\n  font-size: 12px;\n}\n.image-ids {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n}\n.image-ids img {\n  width: 60px;\n  height: 60px;\n  object-fit: cover;\n  border: 2px solid #ddd;\n  border-radius: 4px;\n}\n.instructions {\n  background: #fff3cd;\n  border-left: 4px solid #ffc107;\n}\n.instructions ol {\n  padding-left: 20px;\n}\n.instructions li {\n  margin: 10px 0;\n}\n.warning {\n  margin-top: 20px;\n  padding: 15px;\n  background: #f8d7da;\n  border: 1px solid #f5c6cb;\n  border-radius: 4px;\n  color: #721c24;\n}\n/*# sourceMappingURL=stress-test.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(StressTestComponent, { className: "StressTestComponent", filePath: "app/stress-test/stress-test.component.ts", lineNumber: 37 });
})();
export {
  StressTestComponent
};
//# sourceMappingURL=chunk-2TUMM6GT.js.map
