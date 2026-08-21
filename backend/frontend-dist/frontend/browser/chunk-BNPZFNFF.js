import {
  FormulaType
} from "./chunk-SVTPZQLG.js";
import {
  DefaultValueAccessor,
  FormsModule,
  MinValidator,
  NgControlStatus,
  NgModel,
  NumberValueAccessor
} from "./chunk-VMGRJE2Y.js";
import {
  TALENT_DEFINITIONS
} from "./chunk-P2J6DNXL.js";
import {
  CommonModule,
  HttpClient,
  NgClass
} from "./chunk-FGI44Z6P.js";
import {
  BehaviorSubject,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
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
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
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

// src/app/services/asset-browser-api.service.ts
var AssetBrowserApiService = class _AssetBrowserApiService {
  http = inject(HttpClient);
  baseUrl = "/api/asset-browser";
  // ==================== LIBRARY OPERATIONS ====================
  getAllLibraries() {
    return this.http.get(`${this.baseUrl}/libraries`);
  }
  getLibrary(libraryId) {
    return this.http.get(`${this.baseUrl}/libraries/${libraryId}`);
  }
  createLibrary(name2, description) {
    return this.http.post(`${this.baseUrl}/libraries`, {
      name: name2,
      description
    });
  }
  updateLibrary(libraryId, updates) {
    return this.http.put(`${this.baseUrl}/libraries/${libraryId}`, updates);
  }
  deleteLibrary(libraryId) {
    return this.http.delete(`${this.baseUrl}/libraries/${libraryId}`);
  }
  // ==================== FOLDER OPERATIONS ====================
  getFolder(libraryId, folderId) {
    return this.http.get(`${this.baseUrl}/libraries/${libraryId}/folders/${folderId}`);
  }
  getFolderContents(libraryId, folderId) {
    return this.http.get(`${this.baseUrl}/libraries/${libraryId}/folders/${folderId}/contents`);
  }
  createFolder(libraryId, name2, parentId) {
    return this.http.post(`${this.baseUrl}/libraries/${libraryId}/folders`, { name: name2, parentId });
  }
  renameFolder(libraryId, folderId, name2) {
    return this.http.put(`${this.baseUrl}/libraries/${libraryId}/folders/${folderId}/rename`, { name: name2 });
  }
  moveFolder(libraryId, folderId, newParentId) {
    return this.http.put(`${this.baseUrl}/libraries/${libraryId}/folders/${folderId}/move`, { newParentId });
  }
  deleteFolder(libraryId, folderId) {
    return this.http.delete(`${this.baseUrl}/libraries/${libraryId}/folders/${folderId}`);
  }
  // ==================== FILE OPERATIONS ====================
  getFile(libraryId, fileId) {
    return this.http.get(`${this.baseUrl}/libraries/${libraryId}/files/${fileId}`);
  }
  createFile(libraryId, name2, type, folderId, data) {
    return this.http.post(`${this.baseUrl}/libraries/${libraryId}/files`, { name: name2, type, folderId, data });
  }
  updateFile(libraryId, fileId, updates) {
    return this.http.put(`${this.baseUrl}/libraries/${libraryId}/files/${fileId}`, updates);
  }
  moveFile(libraryId, fileId, newFolderId) {
    return this.http.put(`${this.baseUrl}/libraries/${libraryId}/files/${fileId}/move`, { newFolderId });
  }
  copyFile(libraryId, fileId, targetFolderId) {
    return this.http.post(`${this.baseUrl}/libraries/${libraryId}/files/${fileId}/copy`, { targetFolderId });
  }
  deleteFile(libraryId, fileId) {
    return this.http.delete(`${this.baseUrl}/libraries/${libraryId}/files/${fileId}`);
  }
  // ==================== BULK OPERATIONS ====================
  bulkCopy(libraryId, folderIds, fileIds, targetFolderId) {
    return this.http.post(`${this.baseUrl}/libraries/${libraryId}/bulk/copy`, { folderIds, fileIds, targetFolderId });
  }
  bulkMove(libraryId, folderIds, fileIds, targetFolderId) {
    return this.http.post(`${this.baseUrl}/libraries/${libraryId}/bulk/move`, { folderIds, fileIds, targetFolderId });
  }
  bulkDelete(libraryId, folderIds, fileIds) {
    return this.http.post(`${this.baseUrl}/libraries/${libraryId}/bulk/delete`, { folderIds, fileIds });
  }
  // ==================== SEARCH ====================
  searchFiles(libraryId, query, types2) {
    let url = `${this.baseUrl}/libraries/${libraryId}/search?query=${encodeURIComponent(query)}`;
    if (types2 && types2.length > 0) {
      url += `&types=${types2.join(",")}`;
    }
    return this.http.get(url);
  }
  static \u0275fac = function AssetBrowserApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AssetBrowserApiService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AssetBrowserApiService, factory: _AssetBrowserApiService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AssetBrowserApiService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/services/library-api.service.ts
var LibraryApiService = class _LibraryApiService {
  http = inject(HttpClient);
  baseUrl = "/api/library";
  /**
   * Get all libraries
   */
  getAllLibraries() {
    return this.http.get(this.baseUrl);
  }
  /**
   * Get libraries by tag
   */
  getLibrariesByTag(tag) {
    return this.http.get(`${this.baseUrl}?tag=${encodeURIComponent(tag)}`);
  }
  /**
   * Get public libraries
   */
  getPublicLibraries() {
    return this.http.get(`${this.baseUrl}?public=true`);
  }
  /**
   * Get a single library by ID
   */
  getLibrary(libraryId) {
    return this.http.get(`${this.baseUrl}/${libraryId}`);
  }
  /**
   * Create a new library
   */
  createLibrary(library) {
    return this.http.post(this.baseUrl, library);
  }
  /**
   * Update an existing library
   */
  updateLibrary(libraryId, updates) {
    return this.http.put(`${this.baseUrl}/${libraryId}`, updates);
  }
  /**
   * Delete a library
   */
  deleteLibrary(libraryId) {
    return this.http.delete(`${this.baseUrl}/${libraryId}`);
  }
  static \u0275fac = function LibraryApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LibraryApiService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _LibraryApiService, factory: _LibraryApiService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LibraryApiService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/services/library-store.service.ts
var LibraryStoreService = class _LibraryStoreService {
  api = inject(LibraryApiService);
  assetBrowserApi = inject(AssetBrowserApiService);
  // Current library being edited
  librarySubject = new BehaviorSubject(null);
  library$ = this.librarySubject.asObservable();
  // All available libraries (for selection/browsing)
  allLibrariesSubject = new BehaviorSubject([]);
  allLibraries$ = this.allLibrariesSubject.asObservable();
  // Loading state
  isLoading = signal(false, ...ngDevMode ? [{ debugName: "isLoading" }] : []);
  get currentLibrary() {
    return this.librarySubject.value;
  }
  get allLibraries() {
    return this.allLibrariesSubject.value;
  }
  /**
   * Load all libraries from the backend
   */
  async loadAllLibraries() {
    this.isLoading.set(true);
    try {
      this.api.getAllLibraries().subscribe({
        next: (libraries) => {
          this.allLibrariesSubject.next(libraries);
          console.log("[LIBRARY STORE] Loaded all libraries:", libraries.length);
        },
        error: (err) => {
          console.error("[LIBRARY STORE] Failed to load libraries:", err);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } catch (err) {
      console.error("[LIBRARY STORE] Error loading libraries:", err);
      this.isLoading.set(false);
    }
  }
  /**
   * Load a specific library by ID
   */
  async loadLibrary(libraryId) {
    this.isLoading.set(true);
    try {
      this.api.getLibrary(libraryId).subscribe({
        next: (library) => {
          this.librarySubject.next(library);
          console.log("[LIBRARY STORE] Loaded library:", library.name);
        },
        error: (err) => {
          console.error("[LIBRARY STORE] Failed to load library:", err);
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } catch (err) {
      console.error("[LIBRARY STORE] Error loading library:", err);
      this.isLoading.set(false);
    }
  }
  /**
   * Create a new library (using asset-browser API for consistency)
   */
  async createLibrary(name2) {
    return new Promise((resolve, reject) => {
      this.assetBrowserApi.createLibrary(name2).subscribe({
        next: (created) => {
          const library = __spreadProps(__spreadValues({}, created), {
            items: [],
            runes: [],
            spells: [],
            skills: [],
            statusEffects: [],
            macroActions: [],
            shops: [],
            lootBundles: [],
            dependencies: [],
            tags: created.tags || [],
            isPublic: created.isPublic || false
          });
          this.librarySubject.next(library);
          const all = this.allLibrariesSubject.value;
          this.allLibrariesSubject.next([...all, library]);
          console.log("[LIBRARY STORE] Created library:", library.name);
          resolve(library);
        },
        error: (err) => {
          console.error("[LIBRARY STORE] Failed to create library:", err);
          reject(err);
        }
      });
    });
  }
  /**
   * Update a status effect in whichever library owns it and persist that library (GM "global"
   * edit). Returns true if the effect was found and saved.
   */
  updateStatusEffectGlobally(effect) {
    const all = this.allLibrariesSubject.value;
    const lib = all.find((l) => (l.statusEffects ?? []).some((e) => e.id === effect.id));
    if (!lib)
      return Promise.resolve(false);
    const idx = lib.statusEffects.findIndex((e) => e.id === effect.id);
    lib.statusEffects[idx] = __spreadValues({}, effect);
    return new Promise((resolve, reject) => {
      this.api.updateLibrary(lib.id, lib).subscribe({
        next: (updated) => {
          const list = this.allLibrariesSubject.value;
          const i = list.findIndex((l) => l.id === updated.id);
          if (i >= 0) {
            list[i] = updated;
            this.allLibrariesSubject.next([...list]);
          }
          resolve(true);
        },
        error: (err) => reject(err)
      });
    });
  }
  /**
   * Save current library to backend
   */
  async saveLibrary() {
    const library = this.librarySubject.value;
    if (!library) {
      console.warn("[LIBRARY STORE] No library loaded, cannot save.");
      return;
    }
    return new Promise((resolve, reject) => {
      this.api.updateLibrary(library.id, library).subscribe({
        next: (updated) => {
          this.librarySubject.next(updated);
          const all = this.allLibrariesSubject.value;
          const index = all.findIndex((lib) => lib.id === updated.id);
          if (index >= 0) {
            all[index] = updated;
            this.allLibrariesSubject.next([...all]);
          }
          console.log("[LIBRARY STORE] Library saved successfully");
          resolve();
        },
        error: (err) => {
          console.error("[LIBRARY STORE] Failed to save library:", err);
          reject(err);
        }
      });
    });
  }
  /**
   * Delete a library
   */
  async deleteLibrary(libraryId) {
    return new Promise((resolve, reject) => {
      this.api.deleteLibrary(libraryId).subscribe({
        next: () => {
          const all = this.allLibrariesSubject.value;
          this.allLibrariesSubject.next(all.filter((lib) => lib.id !== libraryId));
          if (this.currentLibrary?.id === libraryId) {
            this.librarySubject.next(null);
          }
          console.log("[LIBRARY STORE] Library deleted");
          resolve();
        },
        error: (err) => {
          console.error("[LIBRARY STORE] Failed to delete library:", err);
          reject(err);
        }
      });
    });
  }
  /**
   * Add an item to current library
   */
  addItem(item) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    item.libraryOrigin = library.id;
    item.libraryOriginName = library.name;
    library.items.push(item);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  /**
   * Update an item in current library
   */
  updateItem(itemId, updates) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const index = library.items.findIndex((item) => item.id === itemId);
    if (index >= 0) {
      library.items[index] = __spreadValues(__spreadValues({}, library.items[index]), updates);
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  /**
   * Remove an item from current library
   */
  removeItem(itemId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.items = library.items.filter((item) => item.id !== itemId);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  // Similar methods for runes, spells, skills, status effects, and macro actions
  addRune(rune) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    rune.libraryOrigin = library.id;
    rune.libraryOriginName = library.name;
    library.runes.push(rune);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeRune(runeName) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.runes = library.runes.filter((rune) => rune.name !== runeName);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  addSpell(spell) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    spell.libraryOrigin = library.id;
    spell.libraryOriginName = library.name;
    library.spells.push(spell);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeSpell(spellName) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.spells = library.spells.filter((spell) => spell.name !== spellName);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  addSkill(skill) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    skill.libraryOrigin = library.id;
    skill.libraryOriginName = library.name;
    library.skills.push(skill);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeSkill(skillName) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.skills = library.skills.filter((skill) => skill.name !== skillName);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  addStatusEffect(statusEffect) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.statusEffects.push(statusEffect);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeStatusEffect(statusEffectId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.statusEffects = library.statusEffects.filter((se) => se.id !== statusEffectId);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  addMacroAction(macroAction) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.macroActions.push(macroAction);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeMacroAction(macroActionId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.macroActions = library.macroActions.filter((ma) => ma.id !== macroActionId);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  addShop(shop) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.shops.push(shop);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeShop(shopId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.shops = library.shops.filter((s) => s.id !== shopId);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  addLootBundle(bundle) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.lootBundles.push(bundle);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  removeLootBundle(bundleId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    library.lootBundles = library.lootBundles.filter((b) => b.id !== bundleId);
    library.updatedAt = Date.now();
    this.librarySubject.next(__spreadValues({}, library));
  }
  updateShop(shopId, field, value) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const shop = library.shops.find((s) => s.id === shopId);
    if (shop) {
      shop[field] = value;
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  addDealToShop(shopId, deal) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const shop = library.shops.find((s) => s.id === shopId);
    if (shop) {
      if (!shop.deals)
        shop.deals = [];
      shop.deals.push(deal);
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  removeDealFromShop(shopId, dealId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const shop = library.shops.find((s) => s.id === shopId);
    if (shop && shop.deals) {
      shop.deals = shop.deals.filter((d) => d.id !== dealId);
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  updateLootBundle(bundleId, field, value) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const bundle = library.lootBundles.find((b) => b.id === bundleId);
    if (bundle) {
      bundle[field] = value;
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  addLootItemToBundle(bundleId, item) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const bundle = library.lootBundles.find((b) => b.id === bundleId);
    if (bundle) {
      if (!bundle.items)
        bundle.items = [];
      bundle.items.push(item);
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  removeLootItemFromBundle(bundleId, itemId) {
    const library = this.librarySubject.value;
    if (!library)
      return;
    const bundle = library.lootBundles.find((b) => b.id === bundleId);
    if (bundle && bundle.items) {
      bundle.items = bundle.items.filter((i) => i.id !== itemId);
      library.updatedAt = Date.now();
      this.librarySubject.next(__spreadValues({}, library));
    }
  }
  /**
   * Clear current library
   */
  clearLibrary() {
    this.librarySubject.next(null);
  }
  static \u0275fac = function LibraryStoreService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _LibraryStoreService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _LibraryStoreService, factory: _LibraryStoreService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(LibraryStoreService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/data/skill-definitions.ts
var CLASS_DEFINITIONS = {
  // Tier 1
  "Magier": { tier: 1, angle: 90, children: [{ className: "Kampfzauberer", angle: 114 }, { className: "Heiler", angle: 67 }] },
  "K\xE4mpfer": { tier: 1, angle: -41, children: [{ className: "Krieger", angle: -14 }, { className: "Barbar", angle: -58 }] },
  "Techniker": { tier: 1, angle: -147, children: [{ className: "Sch\xFCtze", angle: -165 }, { className: "Dieb", angle: -125 }] },
  // Tier 2
  "Kampfzauberer": { tier: 2, angle: 114, children: [{ className: "Arkanist", angle: 123 }, { className: "H\xE4momant", angle: 90 }] },
  "Heiler": { tier: 2, angle: 67, children: [{ className: "Seelenformer", angle: 65 }, { className: "Paladin", angle: 26 }] },
  "Sch\xFCtze": { tier: 2, angle: -165, children: [{ className: "J\xE4ger", angle: -160 }, { className: "Schnellsch\xFCtze", angle: -179 }] },
  "Dieb": { tier: 2, angle: -125, children: [{ className: "Kampfakrobat", angle: -131 }, { className: "Assassine", angle: -151 }, { className: "Pl\xFCnderer", angle: -96 }] },
  "Krieger": { tier: 2, angle: -14, children: [{ className: "Ritter", angle: -1 }, { className: "M\xF6nch", angle: -35 }] },
  "Barbar": { tier: 2, angle: -58, children: [{ className: "Berserker", angle: -68 }, { className: "Pl\xFCnderer", angle: -96 }] },
  // Tier 3
  "Arkanist": { tier: 3, angle: 123, children: [{ className: "Formationsmagier", angle: 127 }, { className: "Phantom", angle: -174 }, { className: "Runenk\xFCnstler", angle: 104 }] },
  "H\xE4momant": { tier: 3, angle: 90, children: [{ className: "Nekromant", angle: 83 }] },
  "Seelenformer": { tier: 3, angle: 65, children: [{ className: "Gestaltenwandler", angle: 55 }, { className: "Mentalist", angle: 71 }] },
  "J\xE4ger": { tier: 3, angle: -160, children: [{ className: "Attent\xE4ter", angle: -155 }] },
  "Kampfakrobat": { tier: 3, angle: -131, children: [{ className: "Klingent\xE4nzer", angle: -136 }, { className: "Duellant", angle: -116 }, { className: "Phantom", angle: -174 }] },
  "Ritter": { tier: 3, angle: -1, children: [{ className: "Erzritter", angle: 14 }, { className: "Paladin", angle: 26 }, { className: "W\xE4chter", angle: -1 }] },
  "Berserker": { tier: 3, angle: -68, children: [{ className: "Kriegsherr", angle: -92 }, { className: "Omen", angle: -51 }] },
  "Pl\xFCnderer": { tier: 3, angle: -96, children: [{ className: "General", angle: -94 }] },
  "M\xF6nch": { tier: 3, angle: -35, children: [{ className: "Templer", angle: -42 }] },
  "Schnellsch\xFCtze": { tier: 3, angle: -179, children: [{ className: "T\xFCftler", angle: 157 }, { className: "Assassine", angle: -151 }] },
  // Tier 4
  "Phantom": { tier: 4, angle: -174, children: [] },
  "Gestaltenwandler": { tier: 4, angle: 55, children: [] },
  "Formationsmagier": { tier: 4, angle: 127, children: [{ className: "Manaf\xFCrst", angle: 118 }, { className: "T\xFCftler", angle: 157 }] },
  "Runenk\xFCnstler": { tier: 4, angle: 104, children: [{ className: "Manaf\xFCrst", angle: 118 }, { className: "Dunkler Ritter", angle: 24 }] },
  "Mentalist": { tier: 4, angle: 71, children: [{ className: "Orakel", angle: 67 }, { className: "Nekromant", angle: 83 }] },
  "Assassine": { tier: 4, angle: -151, children: [{ className: "Attent\xE4ter", angle: -155 }] },
  "Klingent\xE4nzer": { tier: 4, angle: -136, children: [{ className: "Waffenmeister", angle: -138 }] },
  "Erzritter": { tier: 4, angle: 14, children: [{ className: "W\xE4chter", angle: -1 }, { className: "Dunkler Ritter", angle: 24 }] },
  "General": { tier: 4, angle: -94, children: [{ className: "Kriegsherr", angle: -92 }] },
  "Paladin": { tier: 4, angle: 26, children: [] },
  "Templer": { tier: 4, angle: -42, children: [{ className: "Koloss", angle: -30 }, { className: "Omen", angle: -51 }] },
  // Tier 5
  "Manaf\xFCrst": { tier: 5, angle: 118, children: [] },
  "T\xFCftler": { tier: 5, angle: 157, children: [] },
  "Attent\xE4ter": { tier: 5, angle: -155, children: [] },
  "Duellant": { tier: 5, angle: -116, children: [] },
  "Waffenmeister": { tier: 5, angle: -138, children: [] },
  "Kriegsherr": { tier: 5, angle: -92, children: [] },
  "Omen": { tier: 5, angle: -51, children: [] },
  "Koloss": { tier: 5, angle: -30, children: [] },
  "W\xE4chter": { tier: 5, angle: -1, children: [] },
  "Dunkler Ritter": { tier: 5, angle: 24, children: [] },
  "Orakel": { tier: 5, angle: 67, children: [] },
  "Nekromant": { tier: 5, angle: 83, children: [] }
};
var SKILL_DEFINITIONS = [
  // ==================== TIER 1 ====================
  // ==================== KÄMPFER ====================
  {
    id: "kaempfer_staerke_1",
    name: "St\xE4rke+1",
    class: "K\xE4mpfer",
    type: "stat_bonus",
    description: "St\xE4rke+1",
    statBonus: { stat: "strength", amount: 1 }
  },
  {
    id: "kaempfer_konstitution_1",
    name: "Konstitution+1",
    class: "K\xE4mpfer",
    type: "stat_bonus",
    description: "Konstitution+1",
    statBonus: { stat: "constitution", amount: 1 }
  },
  {
    id: "kaempfer_schwere_waffen_werfen",
    name: "Schwere Waffen werfen+1",
    class: "K\xE4mpfer",
    type: "dice_bonus",
    description: "Schwere Waffen werfen+1"
  },
  {
    id: "kaempfer_backpacker",
    name: "Backpacker",
    class: "K\xE4mpfer",
    type: "passive",
    description: "+30 Inventarkapazit\xE4t"
  },
  {
    id: "kampfer_athletik_talent_1",
    name: "Athletik+1",
    class: "K\xE4mpfer",
    type: "talent_bonus",
    description: "Athletik+1",
    talentBonus: { talent: "athletik", amount: 1 }
  },
  // ==================== TECHNIKER ====================
  {
    id: "techniker_geschicklichkeit_1",
    name: "Geschicklichkeit+1",
    class: "Techniker",
    type: "stat_bonus",
    description: "Geschicklichkeit+1",
    statBonus: { stat: "dexterity", amount: 1 }
  },
  {
    id: "techniker_geschwindigkeit_1",
    name: "Geschwindigkeit+1",
    class: "Techniker",
    type: "stat_bonus",
    description: "Geschwindigkeit+1",
    statBonus: { stat: "speed", amount: 1 }
  },
  {
    id: "techniker_ausdauer_15",
    name: "Ausdauer+15",
    class: "Techniker",
    type: "stat_bonus",
    description: "Ausdauer+15",
    statBonus: { stat: "energy", amount: 15 }
  },
  {
    id: "techniker_akrobatik_talent_1",
    name: "Akrobatik+1",
    class: "Techniker",
    type: "talent_bonus",
    description: "Akrobatik+1",
    talentBonus: { talent: "akrobatik", amount: 1 }
  },
  {
    id: "techniker_leichte_waffen_werfen",
    name: "Leichte Waffen werfen-1",
    class: "Techniker",
    type: "dice_bonus",
    description: "Leichte Waffen werfen-1"
  },
  // ==================== MAGIER ====================
  {
    id: "magier_intelligenz_1",
    name: "Intelligenz+1",
    class: "Magier",
    type: "stat_bonus",
    description: "Intelligenz+1",
    statBonus: { stat: "intelligence", amount: 1 }
  },
  {
    id: "magier_mana_10",
    name: "Mana+10",
    class: "Magier",
    type: "stat_bonus",
    description: "Mana+10",
    statBonus: { stat: "mana", amount: 10 }
  },
  {
    id: "magier_fokus_1",
    name: "Fokus+1",
    class: "Magier",
    type: "stat_bonus",
    description: "Fokus+1",
    statBonus: { stat: "focus", amount: 1 }
  },
  {
    id: "magier_exzellenz",
    name: "Exzellenz",
    class: "Magier",
    type: "dice_bonus",
    description: "-2 auf Zauber mit voller Mana"
  },
  {
    id: "magier_zauberlehrling",
    name: "Zauberlehrling",
    class: "Magier",
    type: "passive",
    description: "+2 Effektivit\xE4t auf Zauber"
  },
  // ==================== TIER 2 ====================
  // ==================== KRIEGER ====================
  {
    id: "krieger_konstitution_2",
    name: "Konstitution+2",
    class: "Krieger",
    type: "stat_bonus",
    description: "Konstitution+2",
    statBonus: { stat: "constitution", amount: 2 }
  },
  {
    id: "krieger_statusresistenz",
    name: "Statusresistenz",
    class: "Krieger",
    type: "active",
    description: "W\xFCrfle mit einem D20+\xDCberlebensbonus. Die erw\xFCrfelte Zahl kann verwendet werden, um Statuseffekte zu entfernen",
    enlightened: true,
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  {
    id: "krieger_harter_bursche",
    name: "Harter Bursche",
    class: "Krieger",
    type: "passive",
    description: "Vorteil auf W\xFCrfe, um aus der Bewusstlosigkeit zu erwachen"
  },
  {
    id: "krieger_aetherkraft",
    name: "\xC4therkraft",
    class: "Krieger",
    type: "passive",
    description: "Kann erlittenen Schaden halbieren und die andere H\xE4lfte als Mana zahlen"
  },
  {
    id: "krieger_schwerer_schlag",
    name: "Schwerer Schlag",
    class: "Krieger",
    type: "active",
    description: "Angriff mit hoher St\xE4rke, dessen Schadensberechnung um eine Stufe aufsteigt (kann keinen t\xF6dlichen Treffer erhalten)",
    enlightened: true,
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "krieger_defensive_haltung",
    name: "Defensive Haltung",
    class: "Krieger",
    type: "active",
    description: "Erh\xF6ht Stabilit\xE4t gegen Fernkampfangriffe um Konstitution*2, kann aber nicht angreifen und kann nach einem Angriff nicht in dieser Runde aktiviert werden",
    cost: { type: "energy", amount: 20, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== BARBAR ====================
  {
    id: "barbar_staerke_2",
    name: "St\xE4rke+2",
    class: "Barbar",
    type: "stat_bonus",
    description: "St\xE4rke+2",
    statBonus: { stat: "strength", amount: 2 }
  },
  {
    id: "barbar_ruecksichtslos",
    name: "R\xFCcksichtslos",
    class: "Barbar",
    type: "passive",
    description: "St\xE4rke+4 bei weniger als 5 R\xFCstungsmalus"
  },
  {
    id: "barbar_blutlust",
    name: "Blutlust",
    class: "Barbar",
    type: "dice_bonus",
    description: "-1 auf Angriffe f\xFCr jeden get\xF6ten Gegner, h\xE4lt f\xFCr den Rest des Kampfes, maximal -3"
  },
  {
    id: "barbar_muskelprotz",
    name: "Muskelprotz",
    class: "Barbar",
    type: "dice_bonus",
    description: "-1 auf Angriffe mit schweren Waffen",
    enlightened: true
  },
  {
    id: "barbar_waffenweitwurf",
    name: "Waffenweitwurf",
    class: "Barbar",
    type: "active",
    description: "Wirft schwere Waffe bis zu 50m weit und ignoriert Mali, die schlecht werfbare Waffen erhalten",
    enlightened: true,
    cost: { type: "energy", amount: 25 },
    actionType: "Aktion"
  },
  {
    id: "barbar_kampfschrei",
    name: "Kampfschrei",
    class: "Barbar",
    type: "active",
    description: "Erh\xF6ht Bewegung aller Verb\xFCndeter um 3 in der N\xE4he f\xFCr einen Zug. Bonusaktion",
    cost: { type: "energy", amount: 10 },
    actionType: "Bonusaktion"
  },
  // ==================== DIEB ====================
  {
    id: "dieb_geschwindigkeit_2",
    name: "Geschwindigkeit+2",
    class: "Dieb",
    type: "stat_bonus",
    description: "Geschwindigkeit+2",
    statBonus: { stat: "speed", amount: 2 }
  },
  {
    id: "dieb_fingerfertigkeit_talent_2",
    name: "Fingerfertigkeit+2",
    class: "Dieb",
    type: "talent_bonus",
    description: "Fingerfertigkeit+2",
    talentBonus: { talent: "fingerfertigkeit", amount: 2 }
  },
  {
    id: "dieb_verstecken_talent_2",
    name: "Verstecken+2",
    class: "Dieb",
    type: "talent_bonus",
    description: "Verstecken+2",
    talentBonus: { talent: "verstecken", amount: 2 }
  },
  {
    id: "dieb_feinmotoriker",
    name: "Feinmotoriker",
    class: "Dieb",
    type: "dice_bonus",
    description: "-1 auf Angriffe mit leichten Waffen",
    enlightened: true
  },
  {
    id: "dieb_leichtfuessigkeit",
    name: "Leichtf\xFC\xDFigkeit",
    class: "Dieb",
    type: "passive",
    description: "Bewegung+2 bei weniger als 5 R\xFCstungsmalus",
    enlightened: true
  },
  {
    id: "dieb_auge_der_gier",
    name: "Auge der Gier",
    class: "Dieb",
    type: "dice_bonus",
    description: "-2 auf Wert absch\xE4tzen",
    enlightened: true
  },
  {
    id: "dieb_schleichen",
    name: "Schleichen",
    class: "Dieb",
    type: "active",
    description: "Fange an, zu schleichen. Deine Bewegung wird nicht mehr halbiert und dein Verstecken-Talent kann als W\xFCrfelbonus verwendet werden",
    enlightened: true,
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== SCHÜTZE ====================
  {
    id: "schutze_geschicklichkeit_2",
    name: "Geschicklichkeit+2",
    class: "Sch\xFCtze",
    type: "stat_bonus",
    description: "Geschicklichkeit+2",
    statBonus: { stat: "dexterity", amount: 2 }
  },
  {
    id: "schutze_reichweite_10",
    name: "Reichweite+10m",
    class: "Sch\xFCtze",
    type: "passive",
    description: "Reichweite+10m f\xFCr Fernkampfwaffen"
  },
  {
    id: "schutze_waffenwissen",
    name: "Waffenwissen",
    class: "Sch\xFCtze",
    type: "passive",
    description: "Waffenvorraussetzung-4 f\xFCr Fernkampfwaffen",
    enlightened: true
  },
  {
    id: "schutze_adlerauge",
    name: "Adlerauge",
    class: "Sch\xFCtze",
    type: "dice_bonus",
    description: "-1 im Fernkampf"
  },
  {
    id: "schutze_geschaerfte_sinne",
    name: "Gesch\xE4rfte Sinne",
    class: "Sch\xFCtze",
    type: "dice_bonus",
    description: "-2 auf alle Aktionen au\xDFerhalb von K\xE4mpfen, die gute Sehkraft vorraussetzen",
    enlightened: true
  },
  {
    id: "schutze_aetherfeuer",
    name: "\xC4therfeuer",
    class: "Sch\xFCtze",
    type: "active",
    description: "F\xFChre eine weitere Aktion aus. Bonusaktion",
    cost: { type: "mana", amount: 20 },
    actionType: "Bonusaktion"
  },
  {
    id: "schutze_zielschuss",
    name: "Zielschuss",
    class: "Sch\xFCtze",
    type: "active",
    description: "Fernkampfangriff dessen Schadensberechnung um eine Stufe aufsteigt (kann keinen t\xF6dlichen Treffer erhalten) und doppelte Reichweite erh\xE4lt",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  // ==================== KAMPFZAUBERER ====================
  {
    id: "kampfzauberer_intelligenz_2",
    name: "Intelligenz+2",
    class: "Kampfzauberer",
    type: "stat_bonus",
    description: "Intelligenz+2",
    statBonus: { stat: "intelligence", amount: 2 }
  },
  {
    id: "kampfzauberer_runenkunde_talent_2",
    name: "Runenkunde+2",
    class: "Kampfzauberer",
    type: "talent_bonus",
    description: "Runenkunde+2",
    talentBonus: { talent: "runenkunde", amount: 2 }
  },
  {
    id: "kampfzauberer_zauberladung",
    name: "Zauberladung",
    class: "Kampfzauberer",
    type: "passive",
    description: "+3 beim W\xFCrfeln f\xFCr Zaubercasts"
  },
  {
    id: "kampfzauberer_verinnerlichen",
    name: "Verinnerlichen",
    class: "Kampfzauberer",
    type: "passive",
    description: "Lerne einen Zauber auswendig, damit du ihn ohne Medium benutzen kannst. Zauber k\xF6nnen jederzeit gewechselt werden, brauchen aber mehrere Stunden.",
    enlightened: true
  },
  {
    id: "kampfzauberer_freies_wirken",
    name: "Freies Wirken",
    class: "Kampfzauberer",
    type: "passive",
    description: "Kann sich w\xE4hrend eines Zaubercasts bewegen"
  },
  {
    id: "kampfzauberer_manatransfer",
    name: "Manatransfer",
    class: "Kampfzauberer",
    type: "active",
    description: "Konvertiert 1x Ausdauer 0,8x Mana (wird gerundet)",
    enlightened: true,
    cost: { type: "energy", amount: 0 },
    actionType: "Bonusaktion"
  },
  {
    id: "kampfzauberer_manadisruption",
    name: "Manadisruption",
    class: "Kampfzauberer",
    type: "active",
    description: "Reduziere den Castwert des Spells eines Gegners im Umfeld (Intelligenz in m) um eine gew\xFCrfelte Anzahl. Boni f\xFCr Zaubercasts werden hier auch angewandt. Bonusaktion",
    enlightened: true,
    cost: { type: "energy", amount: 5 },
    actionType: "Bonusaktion"
  },
  // ==================== HEILER ====================
  {
    id: "heiler_mana_20",
    name: "Mana+20",
    class: "Heiler",
    type: "stat_bonus",
    description: "Mana+20",
    statBonus: { stat: "mana", amount: 20 }
  },
  {
    id: "heiler_heilkunde_talent_2",
    name: "Heilkunde+2",
    class: "Heilkunde",
    type: "talent_bonus",
    description: "Heilkunde+2",
    talentBonus: { talent: "heilkunde", amount: 2 }
  },
  {
    id: "heiler_notarzt",
    name: "Notarzt",
    class: "Heiler",
    type: "dice_bonus",
    description: "Vorteil auf alle Heilungsw\xFCrfe und Heilkundew\xFCrfe, wenn Ziel im kritischen Zustand ist",
    enlightened: true
  },
  {
    id: "heiler_alchemist",
    name: "Alchemist",
    class: "Heiler",
    type: "passive",
    description: "Verdoppelt erw\xFCrfelte Braupunkte beim Brauen von Tr\xE4nken mit ausschlie\xDFlich positivem Effekt",
    enlightened: true
  },
  {
    id: "heiler_regenbogen",
    name: "Regenbogen",
    class: "Heiler",
    type: "passive",
    description: "Manakosten -20% auf pure Heilzauber"
  },
  {
    id: "heiler_einfachheit",
    name: "Einfachheit",
    class: "Heiler",
    type: "passive",
    description: "-4 Voraussetzung auf Heilzauber"
  },
  {
    id: "heiler_gruppencast",
    name: "Gruppencast",
    class: "Heiler",
    type: "active",
    description: "Helfe einem Verb\xFCndeten beim Zaubercast, indem du f\xFCr seinen Castwert w\xFCrfelst. Boni f\xFCr Zaubercasts werden hier auch angewandt. 0",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  // ==================== TIER 3 ====================
  // ==================== RITTER ====================
  {
    id: "ritter_leben_30",
    name: "Leben+30",
    class: "Ritter",
    type: "stat_bonus",
    description: "Leben+30",
    statBonus: { stat: "life", amount: 30 }
  },
  {
    id: "ritter_mit_tieren_umgehen_3",
    name: "Mit Tieren umgehen+3",
    class: "Ritter",
    type: "talent_bonus",
    description: "Mit Tieren umgehen+3",
    talentBonus: { talent: "tiere", amount: 3 }
  },
  {
    id: "ritter_parieren",
    name: "Parieren-2",
    class: "Ritter",
    type: "dice_bonus",
    description: "Parieren-2"
  },
  {
    id: "ritter_ruestungsnegation_5",
    name: "R\xFCstungsnegation+5",
    class: "Ritter",
    type: "stat_bonus",
    description: "R\xFCstungsnegation+5"
  },
  {
    id: "ritter_ritterschwur",
    name: "Ritterschwur",
    class: "Ritter",
    type: "passive",
    description: "Erhalte pro Runde eine Reaktion auf Angriffe gegen Verb\xFCndete in 3m"
  },
  {
    id: "ritter_schwere_ruestung",
    name: "Schwere R\xFCstung",
    class: "Ritter",
    type: "active",
    description: "Reduziert Schaden um 90% und wandelt den Rest zu doppeltem R\xFCstungsschaden um",
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "ritter_schildstoss",
    name: "Schildsto\xDF",
    class: "Ritter",
    type: "active",
    description: "Angriff mit Schild, hoher R\xFCcksto\xDF",
    enlightened: true,
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  {
    id: "ritter_reitstoss",
    name: "Reitsto\xDF",
    class: "Ritter",
    type: "active",
    description: "Durchbohrender Angriff auf einem Reittier, dessen Effizienz um 50% der Bewegung des Reittiers erh\xF6ht wird",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  // ==================== MÖNCH ====================
  {
    id: "moench_konstitution_3",
    name: "Konstitution+3",
    class: "M\xF6nch",
    type: "stat_bonus",
    description: "Konstitution+3",
    statBonus: { stat: "constitution", amount: 3 }
  },
  {
    id: "moench_goettlicher_segen",
    name: "G\xF6ttlicher Segen",
    class: "M\xF6nch",
    type: "passive",
    description: "Pechresistenz"
  },
  {
    id: "moench_fokussierte_schlaege",
    name: "Fokussierte Schl\xE4ge",
    class: "M\xF6nch",
    type: "passive",
    description: "-3 bei Angriffen auf Gegenst\xE4nde"
  },
  {
    id: "moench_waffenloser_kampf",
    name: "Waffenloser Kampf",
    class: "M\xF6nch",
    type: "passive",
    description: "-2 im Kampf ohne Waffen(au\xDFer Handschuhen) und Effizienz+5 auf Angriffe mit der Hand"
  },
  {
    id: "moench_hartes_training",
    name: "Hartes Training",
    class: "M\xF6nch",
    type: "passive",
    description: "Reaktionswert+3 bei weniger als 5 R\xFCstungsmalus",
    enlightened: true
  },
  {
    id: "moench_chakra_blockade",
    name: "Chakra-Blockade",
    class: "M\xF6nch",
    type: "active",
    description: "Angriff, der gegnerische Extremit\xE4ten l\xE4hmt",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "moench_meditation",
    name: "Meditation",
    class: "M\xF6nch",
    type: "active",
    description: "Stellt 5 Mana her",
    enlightened: true,
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  // ==================== BERSERKER ====================
  {
    id: "berserker_staerke_2",
    name: "St\xE4rke+2",
    class: "Berserker",
    type: "stat_bonus",
    description: "St\xE4rke+2",
    statBonus: { stat: "strength", amount: 2 }
  },
  {
    id: "berserker_notfallstaerke",
    name: "Notfallst\xE4rke",
    class: "Berserker",
    type: "passive",
    description: "-1 auf Angriffe je 40 fehlende Leben, maximal -5",
    enlightened: true
  },
  {
    id: "berserker_kriegsschrei",
    name: "Kriegsschrei",
    class: "Berserker",
    type: "passive",
    description: 'Mit jedem get\xF6ten Gegner wird "Kampfschrei" ausgel\xF6st, ben\xF6tigt Kampfschrei',
    requiresSkill: "barbar_kampfschrei"
  },
  {
    id: "berserker_unsterblicher_krieger",
    name: "Unsterblicher Krieger",
    class: "Berserker",
    type: "passive",
    description: "Stellt Leben her, wenn Gegner get\xF6tet wird (3 x W\xFCrfel in H\xF6he des gegnerischen Levels)"
  },
  {
    id: "berserker_adrenalin",
    name: "Adrenalin",
    class: "Berserker",
    type: "passive",
    description: "Immun gegen negative Statuseffekte im Ragemodus, bestehende Effekte werden pausiert"
  },
  {
    id: "berserker_erbarmungslosigkeit",
    name: "Erbarmunglosigkeit",
    class: "Berserker",
    type: "passive",
    description: "F\xFCr Z\xFCge in denen angegriffen wurde muss kein Befreiungswurf f\xFCr den Ragemodus gew\xFCrfelt werden",
    enlightened: true
  },
  {
    id: "berserker_rage",
    name: "Rage",
    class: "Berserker",
    type: "active",
    description: "Wird in den Ragemodus versetzt. Bonusaktion",
    cost: { type: "energy", amount: 5 },
    actionType: "Bonusaktion"
  },
  {
    id: "berserker_wuetender_wurf",
    name: "W\xFCtender Wurf",
    class: "Berserker",
    type: "active",
    description: "Wirft einen Gegner bis zu 20m weit",
    enlightened: true,
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  // ==================== PLÜNDERER ====================
  {
    id: "pluenderer_wille_3",
    name: "Wille+3",
    class: "Pl\xFCnderer",
    type: "stat_bonus",
    description: "Wille+3",
    statBonus: { stat: "chill", amount: 3 }
  },
  {
    id: "pluenderer_ueberleben_3",
    name: "\xDCberleben+3",
    class: "Pl\xFCnderer",
    type: "talent_bonus",
    description: "\xDCberleben+3",
    talentBonus: { talent: "ueberleben", amount: 3 }
  },
  {
    id: "pluenderer_horter",
    name: "Horter",
    class: "Pl\xFCnderer",
    type: "passive",
    description: "Erh\xF6ht Inventarkapazit\xE4t um 50%",
    enlightened: true
  },
  {
    id: "pluenderer_reichtum",
    name: "Reichtum",
    class: "Pl\xFCnderer",
    type: "passive",
    description: "Erh\xE4lt 50% mehr Loot und kann versteckte Wertgegenst\xE4nde in der N\xE4he ersp\xFCren"
  },
  {
    id: "pluenderer_brandstifter",
    name: "Brandstifter",
    class: "Pl\xFCnderer",
    type: "passive",
    description: "Reduziert Schaden von normalem Feuer um 80%",
    enlightened: true
  },
  {
    id: "pluenderer_raeuberbande",
    name: "R\xE4uberbande",
    class: "Pl\xFCnderer",
    type: "dice_bonus",
    description: "-1 im Kampf f\xFCr alle Verb\xFCndeten, wenn deine Gruppe in \xDCberzahl ist",
    enlightened: true
  },
  {
    id: "pluenderer_pluendern",
    name: "Pl\xFCndern",
    class: "Pl\xFCnderer",
    type: "dice_bonus",
    description: "-5 auf T\xE4uschungsw\xFCrfe beim Kauf oder Verkauf"
  },
  {
    id: "pluenderer_ueberfall",
    name: "\xDCberfall",
    class: "Pl\xFCnderer",
    type: "active",
    description: "W\xE4hle einen Verb\xFCndeten aus, um bei dessen n\xE4chsten Angriff einen Synchronangriff mit ihm auszuf\xFChren",
    cost: { type: "energy", amount: 10 },
    actionType: "Bonusaktion"
  },
  // ==================== KAMPFAKROBAT ====================
  {
    id: "kampfakrobat_bewegung_3",
    name: "Bewegung+3",
    class: "Kampfakrobat",
    type: "stat_bonus",
    description: "Bewegung+3",
    statBonus: { stat: "movement", amount: 3 }
  },
  {
    id: "kampfakrobat_akrobatik_talent_3",
    name: "Akrobatik+3",
    class: "Kampfakrobat",
    type: "talent_bonus",
    description: "Akrobatik+3",
    talentBonus: { talent: "akrobatik", amount: 3 }
  },
  {
    id: "kampfakrobat_bonusaktion",
    name: "Bonusaktion",
    class: "Kampfakrobat",
    type: "passive",
    description: "Erhalte bei einem R\xFCstungsmalus von 0 eine zus\xE4tzliche Bonusaktion pro Zug"
  },
  {
    id: "kampfakrobat_sprungangriff",
    name: "Sprungangriff",
    class: "Kampfakrobat",
    type: "dice_bonus",
    description: "-2 auf Angriffe in der Luft"
  },
  {
    id: "kampfakrobat_sicherer_stand",
    name: "Sicherer Stand",
    class: "Kampfakrobat",
    type: "dice_bonus",
    description: "Kann garantiert auf instabilem/wackligem Grund stehen bleiben und erh\xE4lt w\xE4hrenddessen -1 im Kampf",
    enlightened: true
  },
  {
    id: "kampfakrobat_federfall",
    name: "Federfall",
    class: "Kampfakrobat",
    type: "passive",
    description: "Fallschaden um 75% reduziert",
    enlightened: true
  },
  {
    id: "kampfakrobat_opportunist",
    name: "Opportunist",
    class: "Kampfakrobat",
    type: "active",
    description: "Wenn du einem Angriff ausweichst, kontere mit einem simplen Waffenangriff",
    cost: { type: "energy", amount: 10 },
    actionType: "Reaktion"
  },
  {
    id: "kampfakrobat_bonusangriff",
    name: "Bonusangriff",
    class: "Kampfakrobat",
    type: "active",
    description: "Einfacher Angriff als Bonusaktion",
    enlightened: true,
    cost: { type: "energy", amount: 10 },
    actionType: "Bonusaktion"
  },
  // ==================== JÄGER ====================
  {
    id: "jaeger_geschicklichkeit_3",
    name: "Geschicklichkeit+3",
    class: "J\xE4ger",
    type: "stat_bonus",
    description: "Geschicklichkeit+3",
    statBonus: { stat: "dexterity", amount: 3 }
  },
  {
    id: "jaeger_naturwissen_3",
    name: "Naturwissen+3",
    class: "J\xE4ger",
    type: "talent_bonus",
    description: "Naturwissen+3",
    talentBonus: { talent: "naturwissen", amount: 3 }
  },
  {
    id: "jaeger_wahrnehmung_3",
    name: "Wahrnehmung+3",
    class: "J\xE4ger",
    type: "talent_bonus",
    description: "Wahrnehmung+3",
    talentBonus: { talent: "wahrnehmung", amount: 3 }
  },
  {
    id: "jaeger_basteln",
    name: "Basteln",
    class: "J\xE4ger",
    type: "passive",
    description: "Verdoppelt erw\xFCrfelte Schmiedepunkte beim Schmieden von Munition",
    enlightened: true
  },
  {
    id: "jaeger_spuren_lesen",
    name: "Spuren lesen",
    class: "J\xE4ger",
    type: "passive",
    description: "Kann Spuren von Tieren und Gegnern lesen und verfolgen",
    enlightened: true
  },
  {
    id: "jaeger_angedrehte_schuesse",
    name: "Angedrehte Sch\xFCsse",
    class: "J\xE4ger",
    type: "passive",
    description: "Fernkampfprojektile k\xF6nnen in der Luft die Richtung \xE4ndern"
  },
  {
    id: "jaeger_beute_markieren",
    name: "Beute markieren",
    class: "J\xE4ger",
    type: "active",
    description: "Markiere einen Gegner in Sichtweite. -5 auf ersten Angriff gegen ihn als einzelnes Ziel",
    cost: { type: "energy", amount: 30 },
    actionType: "Aktion"
  },
  // ==================== SCHNELLSCHÜTZE ====================
  {
    id: "schnellschuetze_bewegung_3",
    name: "Bewegung+3",
    class: "Schnellsch\xFCtze",
    type: "stat_bonus",
    description: "Bewegung+3",
    statBonus: { stat: "movement", amount: 3 }
  },
  {
    id: "schnellschuetze_dynamisches_schiessen",
    name: "Dynamisches Schie\xDFen",
    class: "Schnellsch\xFCtze",
    type: "passive",
    description: "Kann w\xE4hrend dem Laufen ohne Nachteil schie\xDFen",
    enlightened: true
  },
  {
    id: "schnellschuetze_sofortladung",
    name: "Sofortladung",
    class: "Schnellsch\xFCtze",
    type: "passive",
    description: "Waffen, die eine Aktion zum Nachladen ben\xF6tigen, brauchen nur noch eine Bonusaktion. Waffen, die nur eine Bonusaktion ben\xF6tigen verbrauchen keine Bonusaktion"
  },
  {
    id: "schnellschuetze_unberuehrt",
    name: "Unber\xFChrt",
    class: "Schnellsch\xFCtze",
    type: "passive",
    description: "+3 Bewegung, wenn du diese und letzte Runde keinen Schaden genommen hast",
    enlightened: true
  },
  {
    id: "schnellschuetze_folgeangriff",
    name: "Folgeangriff",
    class: "Schnellsch\xFCtze",
    type: "passive",
    description: "Erh\xE4lt sofort eine Extra-Aktion, wenn ein Gegner bewegungsunf\xE4hig wird, egal wer am Zug ist, maximal einmal zwischen Z\xFCgen m\xF6glich"
  },
  {
    id: "schnellschuetze_multischuss",
    name: "Multischuss",
    class: "Schnellsch\xFCtze",
    type: "active",
    description: "Kann bis zu 3 Projektile auf unterschiedliche Gegner auf einmal schie\xDFen",
    cost: { type: "energy", amount: 15 },
    actionType: "Aktion"
  },
  {
    id: "schnellschuetze_runde_2",
    name: "Runde 2",
    class: "Schnellsch\xFCtze",
    type: "active",
    description: "Erhalte eine Extra-Aktion, wenn du das n\xE4chste mal am Zug bist",
    enlightened: true,
    cost: { type: "energy", amount: 5 },
    actionType: "Aktion"
  },
  // ==================== ARKANIST ====================
  {
    id: "arkanist_mana_30",
    name: "Mana+30",
    class: "Arkanist",
    type: "stat_bonus",
    description: "Mana+30",
    statBonus: { stat: "mana", amount: 30 }
  },
  {
    id: "arkanist_zauberradius_1",
    name: "Zauberradius+1m",
    class: "Arkanist",
    type: "stat_bonus",
    description: "Zauberradius+1m",
    enlightened: true,
    statBonus: { stat: "spellRadius", amount: 1 }
  },
  {
    id: "arkanist_managespuer",
    name: "Managesp\xFCr",
    class: "Arkanist",
    type: "passive",
    description: "Kann pures Mana sp\xFCren",
    enlightened: true
  },
  {
    id: "arkanist_verinnererlichen",
    name: "Verinnererlichen",
    class: "Arkanist",
    type: "passive",
    description: "Besetze je 5 Fokus, um einen zus\xE4tzlichen Zauber auswendig zu lernen. Ben\xF6tigt Verinnerlichen(p)",
    enlightened: true,
    requiresSkill: "kampfzauberer_verinnerlichen"
  },
  {
    id: "arkanist_schmagied",
    name: "Schmagied",
    class: "Arkanist",
    type: "passive",
    description: "Halbiert Vorraussetzungen von selbst gebauten Zaubern."
  },
  {
    id: "arkanist_zauberbrecher",
    name: "Zauberbrecher",
    class: "Arkanist",
    type: "active",
    description: "Annulliert einen Zauber im Zauberradius, Ausdauerkosten entsprechen den halben Manakosten des Zaubers und kann Ausdauer ins Negative bringen. Erh\xE4lt M\xF6glichkeit, diese F\xE4higkeit zu nutzen, wenn ein Zauber den Zauberradius betritt",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "arkanist_ueberladen",
    name: "\xDCberladen",
    class: "Arkanist",
    type: "active",
    description: "Nutze den n\xE4chsten Zauber mit verdoppelter Vorraussetzung und Effektivit\xE4t",
    cost: { type: "energy", amount: 10 },
    actionType: "Bonusaktion"
  },
  // ==================== HÄMOMANT ====================
  {
    id: "haemomant_leben_30",
    name: "Leben+30",
    class: "H\xE4momant",
    type: "stat_bonus",
    description: "Leben+30",
    statBonus: { stat: "life", amount: 30 }
  },
  {
    id: "haemomant_magisches_blut",
    name: "Magisches Blut",
    class: "H\xE4momant",
    type: "passive",
    description: "Kann eigenes Blut als Startpunkt f\xFCr Zauber benutzen"
  },
  {
    id: "haemomant_kaltbluetig",
    name: "Kaltbl\xFCtig",
    class: "H\xE4momant",
    type: "passive",
    description: "-1 im Kampf gegen blutende Gegner",
    enlightened: true
  },
  {
    id: "haemomant_transfusion",
    name: "Transfusion",
    class: "H\xE4momant",
    type: "active",
    description: "Absorbiere umliegendes Blut und heile dich um den gew\xFCrfelten Betrag (D8)",
    cost: { type: "energy", amount: 0 },
    actionType: "Bonusaktion"
  },
  {
    id: "haemomant_blutecho",
    name: "Blutecho",
    class: "H\xE4momant",
    type: "active",
    description: "Absorbiert eine genannte F\xE4higkeit aus gegnerischem Blut und verwende ihn direkt ohne Kosten. Sollte die genannte F\xE4higkeit nicht existieren, wird eine zuf\xE4llige F\xE4higkeit ausgew\xE4hlt. Nur einmal pro Person m\xF6glich",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "haemomant_hypertonie",
    name: "Hypertonie",
    class: "H\xE4momant",
    type: "active",
    description: "-4 im Kampf",
    cost: { type: "life", amount: 20, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "haemomant_aderlass",
    name: "Aderlass",
    class: "H\xE4momant",
    type: "active",
    description: "Konvertiert 1x Leben zu 0,8x Mana (wird abgerundet)",
    enlightened: true,
    cost: { type: "life", amount: 0 },
    actionType: "Bonusaktion"
  },
  // ==================== SEELENFORMER ====================
  {
    id: "seelenformer_fokus_4",
    name: "Fokus+4",
    class: "Seelenformer",
    type: "stat_bonus",
    description: "Fokus+4",
    statBonus: { stat: "focus", amount: 4 }
  },
  {
    id: "seelenformer_runenkonvergenz",
    name: "Runenkonvergenz",
    class: "Seelenformer",
    type: "passive",
    description: "-1 auf Nutzung von Zaubern die eine Elementarrune beinhalten, die f\xFCr eine aktive Beschw\xF6rung benutzt wurde"
  },
  {
    id: "seelenformer_hausgemacht",
    name: "Hausgemacht",
    class: "Seelenformer",
    type: "passive",
    description: "Senkt Fokuskosten f\xFCr selbst kreierte Seelenrunen in Beschw\xF6rungszaubern um 20% und erm\xF6glicht es, diese Seelenrunen in diesen Zaubern frei auszutauschen"
  },
  {
    id: "seelenformer_seelenwacht",
    name: "Seelenwacht",
    class: "Seelenformer",
    type: "active",
    description: "Kann Seelen von Tieren analysieren, um sie als Rune zu speichern. Ben\xF6tigt mehrere Tage intensiver Inspektion",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "seelenformer_erweitertes_bewusstsein",
    name: "Erweitertes Bewusstsein",
    class: "Seelenformer",
    type: "active",
    description: "Reduziert Ausdauer auf 0, um den maximalen Fokus zu verdreifachen. Muss deaktiviert werden, um Ausdauer zu regenerieren. Bonusaktion",
    cost: { type: "energy", amount: 30 },
    actionType: "Bonusaktion"
  },
  {
    id: "seelenformer_adlerauge",
    name: "Adlerauge",
    class: "Seelenformer",
    type: "active",
    description: "Nutze die Wahrnehmung einer deiner Beschw\xF6rungen als deine eigene",
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Aktion"
  },
  {
    id: "seelenformer_sanktum",
    name: "Sanktum",
    class: "Seelenformer",
    type: "active",
    description: "Festige die Seele eines Verb\xFCndeten, was ihn f\xFCr die Dauer der F\xE4higkeit immun gegen psychische Angriffe macht",
    enlightened: true,
    cost: { type: "energy", amount: 5, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== TIER 4 ====================
  // ==================== ERZRITTER ====================
  {
    id: "erzritter_konstitution_4",
    name: "Konstitution+4",
    class: "Erzritter",
    type: "stat_bonus",
    description: "Konstitution+4",
    statBonus: { stat: "constitution", amount: 4 }
  },
  {
    id: "erzritter_waffenkenner",
    name: "Waffenkenner",
    class: "Erzritter",
    type: "passive",
    description: "Waffenvorraussetzung-8 f\xFCr schwere Waffen",
    enlightened: true
  },
  {
    id: "erzritter_rittmeister",
    name: "Rittmeister",
    class: "Erzritter",
    type: "dice_bonus",
    description: "-2 auf Angriffe wenn auf einem Reittier"
  },
  {
    id: "erzritter_unzerbrechliche_ruestung",
    name: "Unzerbrechliche R\xFCstung",
    class: "Erzritter",
    type: "passive",
    description: "Halbiert R\xFCstungsschaden und erh\xF6ht Stabilit\xE4t von getragener R\xFCstung um 20%"
  },
  {
    id: "erzritter_ruestungsschmied",
    name: "R\xFCstungsschmied",
    class: "Erzritter",
    type: "passive",
    description: "Verdreifacht erw\xFCrfelte Schmiedepunkte beim Schmieden von R\xFCstung"
  },
  {
    id: "erzritter_volle_wucht",
    name: "Volle Wucht",
    class: "Erzritter",
    type: "active",
    description: "Rammangriff, der mit R\xFCstungsmalus (RM*5) skaliert",
    enlightened: true,
    cost: { type: "energy", amount: 15 },
    actionType: "Aktion"
  },
  {
    id: "erzritter_schwerer_panzer",
    name: "Schwerer Panzer",
    class: "Erzritter",
    type: "active",
    description: '"Schwere R\xFCstung" kostet keine Ausdauer. Ben\xF6tigt Schwere R\xFCstung',
    requiresSkill: "ritter_schwere_ruestung",
    actionType: "Aktion"
  },
  {
    id: "erzritter_magische_ausruestung",
    name: "Magische Ausr\xFCstung",
    class: "Erzritter",
    type: "active",
    description: "R\xFCstung wird magisch an- und ausger\xFCstet. Bonusaktion",
    cost: { type: "mana", amount: 5 },
    actionType: "Bonusaktion"
  },
  // ==================== TEMPLER ====================
  {
    id: "templer_geschwindigkeit_4",
    name: "Geschwindigkeit+4",
    class: "Templer",
    type: "stat_bonus",
    description: "Geschwindigkeit+4",
    statBonus: { stat: "speed", amount: 4 }
  },
  {
    id: "templer_verlaengerter_arm",
    name: "Verl\xE4ngerter Arm",
    class: "Templer",
    type: "passive",
    description: 'Leichte Wuchtwaffen z\xE4hlen f\xFCr "Waffenloser Kampf" und k\xF6nnen fast alle Aktionen vollf\xFChren, die mit der Hand ausgef\xFChrt werden k\xF6nnen. Ben\xF6tigt Waffenloser Kampf',
    requiresSkill: "moench_waffenloser_kampf"
  },
  {
    id: "templer_staehlerne_haut",
    name: "St\xE4hlerne Haut",
    class: "Templer",
    type: "passive",
    description: "Erh\xE4lt Stabilit\xE4t entsprechend seines Willens",
    enlightened: true
  },
  {
    id: "templer_mentale_ruestung",
    name: "Mentale R\xFCstung",
    class: "Templer",
    type: "passive",
    description: "Kann bei Schaden anstatt Leben 150% des Schadens als Ausdauer verlieren.",
    enlightened: true
  },
  {
    id: "templer_chakrawissen",
    name: "Chakrawissen",
    class: "Templer",
    type: "active",
    description: '"Chakra-Blockade" kann f\xFCr jeden Angriff ohne Kosten aktiviert werden',
    requiresSkill: "moench_chakra_blockade",
    cost: { type: "energy", amount: 0 },
    actionType: "Keine Aktion"
  },
  {
    id: "templer_laehmung",
    name: "L\xE4hmung",
    class: "Templer",
    type: "active",
    description: "Angriff, der Gegner komplett l\xE4hmt",
    cost: { type: "energy", amount: 30 },
    actionType: "Aktion"
  },
  {
    id: "templer_absolute_kontrolle",
    name: "Absolute Kontrolle",
    class: "Templer",
    type: "active",
    description: "Kann jeden Gegner in Reichweite mit Nahkampfwaffe einmal pro Runde angreifen, +1 je Angriff nach dem Ersten",
    enlightened: true,
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "templer_kraft_aus_dem_inneren",
    name: "Kraft aus dem Inneren",
    class: "Templer",
    type: "active",
    description: "Meditiere, um jede Runde Statuseffekte zu entfernen (D20+\xDCberlebensbonus). Erhalte nach Kanalisierung D20 HP Heilung pro Zug und Bewegung+5 f\xFCr so viele Runden, wie meditiert wurde. Meditation wird bei Bewegung abgebrochen",
    enlightened: true,
    cost: { type: "energy", amount: 15, perRound: true },
    actionType: "Aktion"
  },
  // ==================== GENERAL ====================
  {
    id: "general_staerke_4",
    name: "St\xE4rke+4",
    class: "General",
    type: "stat_bonus",
    description: "St\xE4rke+4",
    statBonus: { stat: "strength", amount: 4 }
  },
  {
    id: "general_ueberzeugen_4",
    name: "\xDCberzeugen+4",
    class: "General",
    type: "talent_bonus",
    description: "\xDCberzeugen+4",
    talentBonus: { talent: "ueberzeugen", amount: 4 }
  },
  {
    id: "general_meisterstratege",
    name: "Meisterstratege",
    class: "General",
    type: "passive",
    description: "Kann die Strategie des Gegners mit Blick auf das Schlachtfeld erkennen",
    enlightened: true
  },
  {
    id: "general_leibwaechter",
    name: "Leibw\xE4chter",
    class: "General",
    type: "passive",
    description: "Kann bei gegnerischen Angriffen einen Verb\xFCndeten in 3m Reichweite ausw\xE4hlen, der ebenfalls auf den Angriff reagieren kann. Jeder Verb\xFCndete kann nur einmal pro Zug ausgew\xE4hlt werden",
    enlightened: true
  },
  {
    id: "general_angriffsbefehl",
    name: "Angriffsbefehl",
    class: "General",
    type: "active",
    description: "Schenkt einem Verb\xFCndeten einen Extrazug. Kann nicht in einem Extrazug verwendet werden",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "general_schutzbefehl",
    name: "Schutzbefehl",
    class: "General",
    type: "active",
    description: "Ein Verb\xFCndeter erh\xE4lt -8 auf den Reaktionswert des n\xE4chsten Angriffs",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "general_standbefehl",
    name: "Standbefehl",
    class: "General",
    type: "active",
    description: "Zieht eine Linie (Anzahl Felder entspricht Wille, Felder m\xFCssen verbunden sein), auf der alle Verb\xFCndeten f\xFCr den Rest des Kampfes im Kampf -2 und Immunit\xE4t gegen schwieriges Terrain erhalten",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "general_befehlskette",
    name: "Befehlskette",
    class: "General",
    type: "active",
    description: "Kann diese Runde unendlich viele Befehle ausgeben f\xFCr doppelte Ausdauerkosten",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  // ==================== KLINGENTÄNZER ====================
  {
    id: "klingentaenzer_geschwindigkeit_4",
    name: "Geschwindigkeit+4",
    class: "Klingent\xE4nzer",
    type: "stat_bonus",
    description: "Geschwindigkeit+4",
    statBonus: { stat: "speed", amount: 4 }
  },
  {
    id: "klingentaenzer_waffen_werfen",
    name: "Waffen werfen-2",
    class: "Klingent\xE4nzer",
    type: "dice_bonus",
    description: "Waffen werfen-2"
  },
  {
    id: "klingentaenzer_waffengelehrter",
    name: "Waffengelehrter",
    class: "Klingent\xE4nzer",
    type: "passive",
    description: "Waffenvorraussetzung-8 f\xFCr leichte Waffen",
    enlightened: true
  },
  {
    id: "klingentaenzer_waffentanz",
    name: "Waffentanz",
    class: "Klingent\xE4nzer",
    type: "dice_bonus",
    description: "-1 auf den ersten Angriff mit einer Waffe. Erneuert sich, wenn Waffe in dieser Runde aufgehoben oder gefangen wurde. Dieser Vorgang kostet zus\xE4tzlich keine Aktion"
  },
  {
    id: "klingentaenzer_blitzgriff",
    name: "Blitzgriff",
    class: "Klingent\xE4nzer",
    type: "passive",
    description: "+3 Bewegung auf Waffen zu, die momentan niemand h\xE4lt"
  },
  {
    id: "klingentaenzer_unantastbar",
    name: "Unantastbar",
    class: "Klingent\xE4nzer",
    type: "dice_bonus",
    description: "-20 auf Ausweichen in der Runde nach einer Killbeteiligung",
    enlightened: true
  },
  {
    id: "klingentaenzer_fliegender_kick",
    name: "Fliegender Kick",
    class: "Klingent\xE4nzer",
    type: "active",
    description: "Leichte Waffen, die sich in der Luft befinden, k\xF6nnen auf Gegner gekickt werden",
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  {
    id: "klingentaenzer_klingenwirbel",
    name: "Klingenwirbel",
    class: "Klingent\xE4nzer",
    type: "active",
    description: "Wirf eine leichte Waffe mit so viel Drall, dass sie n\xE4chste Runde zur\xFCckkehrt",
    enlightened: true,
    cost: { type: "energy", amount: 5 },
    actionType: "Aktion"
  },
  // ==================== ASSASSINE ====================
  {
    id: "assassine_ausdauer_40",
    name: "Ausdauer+40",
    class: "Assassine",
    type: "stat_bonus",
    description: "Ausdauer+40",
    statBonus: { stat: "energy", amount: 40 }
  },
  {
    id: "assassine_taeuschen_4",
    name: "T\xE4uschen+4",
    class: "Assassine",
    type: "talent_bonus",
    description: "T\xE4uschen+4",
    talentBonus: { talent: "taeuschen", amount: 4 }
  },
  {
    id: "assassine_gnadenstoss",
    name: "Gnadensto\xDF",
    class: "Assassine",
    type: "passive",
    description: "-2 auf Angriffe gegen vergiftete Gegner",
    enlightened: true
  },
  {
    id: "assassine_exitus",
    name: "Exitus",
    class: "Assassine",
    type: "passive",
    description: "Erhalte einen zus\xE4tzlichen Schadensw\xFCrfel bei kritischen und t\xF6dlichen Treffern"
  },
  {
    id: "assassine_hinterhalt",
    name: "Hinterhalt",
    class: "Assassine",
    type: "passive",
    description: "-2, wenn Gegner von hinten angegriffen wird"
  },
  {
    id: "assassine_infiltration",
    name: "Infiltration",
    class: "Assassine",
    type: "passive",
    description: "Erhalte Bewegung+X, wenn deine Gruppe in Unterzahl ist. X entspricht der Gegnerzahl - Verb\xFCndetenzahl ",
    enlightened: true
  },
  {
    id: "assassine_gift_mischen",
    name: "Gift mischen",
    class: "Assassine",
    type: "passive",
    description: "Verdreifacht erw\xFCrfelte Braupunkte beim Brauen von Tr\xE4nken mit ausschlie\xDFlich positivem Effekt",
    enlightened: true
  },
  {
    id: "assassine_phantomschnitt",
    name: "Phantomschnitt",
    class: "Assassine",
    type: "active",
    description: "Greift Gegner an, der erst nach bis zu einer Minute Schaden nimmt",
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  // ==================== PHANTOM ====================
  {
    id: "phantom_ausdauer_30",
    name: "Ausdauer+30",
    class: "Phantom",
    type: "stat_bonus",
    description: "Ausdauer+30",
    statBonus: { stat: "energy", amount: 30 },
    infiniteLevel: true
  },
  {
    id: "phantom_nachternte",
    name: "Nachternte",
    class: "Phantom",
    type: "passive",
    description: "Stellt Mana her, wenn Gegner get\xF6tet wird (4 x W\xFCrfel in H\xF6he des gegnerischen Levels)"
  },
  {
    id: "phantom_hoehenvorteil",
    name: "H\xF6henvorteil",
    class: "Phantom",
    type: "passive",
    description: "-2 auf Angriffe, die aus mindestens 10m H\xF6he \xFCber dem Gegner ausgef\xFChrt werden",
    enlightened: true
  },
  {
    id: "phantom_spiegelversteck",
    name: "Spiegelversteck",
    class: "Phantom",
    type: "active",
    description: "Kann sich in der Reflektion eines Spiegels verbergen. Kann von Spiegel zu Spiegel in Sichtfeld springen. Wird beendet, wenn dieser zerst\xF6rt oder unklar wird",
    cost: { type: "energy", amount: 5, perRound: true },
    actionType: "Bonusaktion",
    enlightened: true
  },
  {
    id: "phantom_schattenform",
    name: "Schattenform",
    class: "Phantom",
    type: "active",
    description: "Mache deinen K\xF6rper durchl\xE4ssig und schwebend, wodurch du dich durch Objekte bewegen kannst und nicht von nichtmagischen Angriffen getroffen werden kannst, aber auch nur mit Magie angreifen kannst",
    cost: { type: "energy", amount: 20, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "phantom_schrei_todesfee",
    name: "Schrei der Todesfee",
    class: "Phantom",
    type: "active",
    description: "W\xE4hle eine F\xE4higkeit aus, der f\xFCr alle Gegner in H\xF6rreichweite blockiert wird, wenn sie einen Willenswurf verlieren. Kostet 10x die Rundendauer",
    actionType: "Aktion"
  },
  {
    id: "phantom_dunkler_begleiter",
    name: "Dunkler Begleiter",
    class: "Phantom",
    type: "active",
    description: "Verschwinde im K\xF6rper eines Verb\xFCndeten. In diesem Zustand k\xF6nnen alle F\xE4higkeiten des Verb\xFCndeten verwendet werden (auf eigene Kosten). Bei Angriffen erhalten beide Schaden",
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Aktion"
  },
  // ==================== FORMATIONSMAGIER ====================
  {
    id: "formationsmagier_fokus_5",
    name: "Fokus+5",
    class: "Formationsmagier",
    type: "stat_bonus",
    description: "Fokus+5",
    statBonus: { stat: "focus", amount: 5 }
  },
  {
    id: "formationsmagier_max_castwert",
    name: "Maximaler Castwert+200",
    class: "Formationsmagier",
    type: "stat_bonus",
    description: "Maximaler Castwert+200",
    enlightened: true,
    statBonus: { stat: "maxCastValue", amount: 200 }
  },
  {
    id: "formationsmagier_zauberarchitekt",
    name: "Zauberarchitekt",
    class: "Formationsmagier",
    type: "passive",
    description: "Wenn ein Zauber bei 0 Fokus verwendet wird, erh\xF6ht sich dein maximaler Fokus um 20% der Manakosten, solange dieser Zauber aktiv ist"
  },
  {
    id: "formationsmagier_magische_rueckkopplung",
    name: "Magische R\xFCckkopplung",
    class: "Formationsmagier",
    type: "passive",
    description: "Kann objektgebundene Zauber als Bonusaktion verwenden, verbraucht aber x10 Haltbarkeit.",
    enlightened: true
  },
  {
    id: "formationsmagier_arkane_resonanz",
    name: "Arkane Resonanz",
    class: "Formationsmagier",
    type: "passive",
    description: "Muss bei Formationen(gro\xDFen Spells) nur 50% der zus\xE4tzlichen Manakosten zahlen."
  },
  {
    id: "formationsmagier_vorbereiten",
    name: "Vorbereiten",
    class: "Formationsmagier",
    type: "passive",
    description: "Erhalte 10% vom Castwert als Castbonus"
  },
  {
    id: "formationsmagier_dunkles_siegel",
    name: "Dunkles Siegel",
    class: "Formationsmagier",
    type: "active",
    description: "-10 auf den n\xE4chsten Zauber (-5 f\xFCr Dauerzauber), danach kann einen Tag keine Magie mehr benutzt werden",
    cost: { type: "energy", amount: 10 },
    actionType: "Bonusaktion"
  },
  // ==================== RUNENKÜNSTLER ====================
  {
    id: "runenkuenstler_mana_40",
    name: "Mana+40",
    class: "Runenk\xFCnstler",
    type: "stat_bonus",
    description: "Mana+40",
    statBonus: { stat: "mana", amount: 40 }
  },
  {
    id: "runenkuenstler_verinnerstlichen",
    name: "Verinnerstlichen",
    class: "Runenk\xFCnstler",
    type: "passive",
    description: "Kann unendlich viele Zauber sofort auswendig lernen",
    enlightened: true,
    requiresSkill: "kampfzauberer_verinnerlichen"
  },
  {
    id: "runenkuenstler_zauberecho",
    name: "Zauberecho",
    class: "Runenk\xFCnstler",
    type: "active",
    description: "Kann den in dieser Aktion genutzten Zauber nochmal benutzen",
    cost: { type: "energy", amount: 20 },
    actionType: "Bonusaktion"
  },
  {
    id: "runenkuenstler_runenmeister",
    name: "Runenmeister",
    class: "Runenk\xFCnstler",
    type: "dice_bonus",
    description: "Vorteil auf W\xFCrfe f\xFCr Runenkunde",
    enlightened: true
  },
  {
    id: "runenkuenstler_zauberhast",
    name: "Zauberhast",
    class: "Runenk\xFCnstler",
    type: "passive",
    description: "+10 Bewegung, wenn du in dieser Runde durch einen Zauber als Reaktion Schaden entgehen konntest"
  },
  {
    id: "runenkuenstler_runenblick",
    name: "Runenblick",
    class: "Runenk\xFCnstler",
    type: "active",
    description: "Analysiert die Struktur eines unbekannten Spells im Sichtfeld und lernt dessen Struktur auswendig (Schwierigkeitsgrad = 20 - Fokus), Kosten entsprechen Fokuskosten des Zaubers*2",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "runenkuenstler_brennender_fokus",
    name: "Brennender Fokus",
    class: "Runenk\xFCnstler",
    type: "active",
    description: "Halbiert Fokus solange aktiv und erh\xF6ht Effektivit\xE4t von allen Zaubern um 50%. Bonusaktion",
    cost: { type: "energy", amount: 5, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== MENTALIST ====================
  {
    id: "mentalist_intelligenz_4",
    name: "Intelligenz+4",
    class: "Mentalist",
    type: "stat_bonus",
    description: "Intelligenz+4",
    statBonus: { stat: "intelligence", amount: 4 }
  },
  {
    id: "mentalist_durchschauen_4",
    name: "Durchschauen+4",
    class: "Mentalist",
    type: "talent_bonus",
    description: "Durchschauen+4",
    talentBonus: { talent: "durchschauen", amount: 4 }
  },
  {
    id: "mentalist_traumcaster",
    name: "Traumcaster",
    class: "Mentalist",
    type: "passive",
    description: "Kann Zauber bei Bewusstlosigkeit casten"
  },
  {
    id: "mentalist_aluhut",
    name: "Aluhut",
    class: "Mentalist",
    type: "dice_bonus",
    description: "Vorteil auf alle defensiven Willensw\xFCrfe",
    enlightened: true
  },
  {
    id: "mentalist_telepathie",
    name: "Telepathie",
    class: "Mentalist",
    type: "passive",
    description: "Kann mit Verb\xFCndeten in [Intelligenz*5]m Entfernung telepathisch kommunizieren (mit deren Einverst\xE4ndnis)",
    enlightened: true
  },
  {
    id: "mentalist_manipulator",
    name: "Manipulator",
    class: "Mentalist",
    type: "passive",
    description: "Verdoppelt Effizienz von Runen, die den Verstand des Ziels beeinflussen."
  },
  {
    id: "mentalist_invasion",
    name: "Invasion",
    class: "Mentalist",
    type: "active",
    description: "\xDCbernimmt Kontrolle \xFCber Kreatur bei erfolgreichem Wurf (Intelligenz vs. Wille), gegnerischer Wille*2 pro Runde, min. 10",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "mentalist_abbild",
    name: "Abbild",
    class: "Mentalist",
    type: "active",
    description: "Kopiere einen Aktive F\xE4higkeit einer Person und \xFCbertrage ihn zu einer anderen Person, die F\xE4higkeit kann einmalig verwendet werden und ist auf 1 pro Person limitiert",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  // ==================== GESTALTENWANDLER ====================
  {
    id: "gestaltenwandler_wille_3",
    name: "Wille+3",
    class: "Gestaltenwandler",
    type: "stat_bonus",
    description: "Wille+3",
    statBonus: { stat: "chill", amount: 3 },
    infiniteLevel: true
  },
  {
    id: "gestaltenwandler_botschafter",
    name: "Botschafter",
    class: "Gestaltenwandler",
    type: "dice_bonus",
    description: "-3 auf W\xFCrfe f\xFCr Unterhaltung, T\xE4uschen und \xDCberzeugen mit Personen derselben Rasse",
    enlightened: true
  },
  {
    id: "gestaltenwandler_formwechsel",
    name: "Formwechsel",
    class: "Gestaltenwandler",
    type: "passive",
    description: "Kann bei K\xF6rperkontakt Objekte in Beschw\xF6rungen verwandeln, das Objekt bleibt in der Beschw\xF6rung, solange diese besteht",
    enlightened: true
  },
  {
    id: "gestaltenwandler_transformieren",
    name: "Transformieren",
    class: "Gestaltenwandler",
    type: "active",
    description: "Verwandelt sich in ein Lebewesen, dessen Seelenrune sich im Besitz des Anwenders befindet. Jede Verwandlung hat einen eigenen Lebensbalken und verschwindet wenn dieser aufgebraucht ist",
    cost: { type: "energy", amount: 30 },
    actionType: "Aktion"
  },
  {
    id: "gestaltenwandler_imitation",
    name: "Imitation",
    class: "Gestaltenwandler",
    type: "active",
    description: "Verwandelt sich in ein anderes Lebewesen, wenn K\xF6rperkontakt besteht. Endet wenn Schaden erlitten wird. \xDCbernimmt keine F\xE4higkeiten oder Stats",
    enlightened: true,
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "gestaltenwandler_doppelgaenger",
    name: "Doppelg\xE4nger",
    class: "Gestaltenwandler",
    type: "active",
    description: "Beschw\xF6rt einen Doppelg\xE4nger mit identischem Aussehen und teilt Leben, Mana, Ausdauer und Fokus zwischen beiden auf. Stirbt das Original, lebt der Doppelg\xE4nger mit halbierten Stats weiter, auf einen gleichzeitig begrenzt",
    cost: { type: "energy", amount: 50 },
    actionType: "Aktion"
  },
  {
    id: "gestaltenwandler_seelenmeister",
    name: "Seelenmeister",
    class: "Gestaltenwandler",
    type: "active",
    description: "Erweitert Seelenwacht auf menschliche Ziele. Kopiert deren F\xE4higkeiten. Ben\xF6tigt Seelenwacht",
    requiresSkill: "seelenformer_seelenwacht",
    actionType: "Aktion"
  },
  // ==================== PALADIN ====================
  {
    id: "paladin_konstitution_wille_2",
    name: "Konstitution&Wille+2",
    class: "Paladin",
    type: "stat_bonus",
    description: "Konstitution&Wille+2",
    statBonuses: [{ stat: "constitution", amount: 2 }, { stat: "chill", amount: 2 }],
    infiniteLevel: true
  },
  {
    id: "paladin_fixer_fixer",
    name: "Fixer Fixer",
    class: "Paladin",
    type: "passive",
    description: "Kann pure Unterst\xFCtzungszauber als Bonusaktion verwenden"
  },
  {
    id: "paladin_schnelle_hilfe",
    name: "Schnelle Hilfe",
    class: "Paladin",
    type: "passive",
    description: "Verb\xFCndete, die von einem puren Unterst\xFCtzungszauber getroffen werden, erhalten in ihrem n\xE4chsten Zug eine zus\xE4tzliche Bonusaktion (Dauerzauber z\xE4hlen nur im ersten Zug)"
  },
  {
    id: "paladin_inspiration",
    name: "Inspiration",
    class: "Paladin",
    type: "passive",
    description: "Nach einem guten Wurf (1-8nat) kann ein Verb\xFCndeter ausgew\xE4hlt werden, der -1 auf einen Wurf im n\xE4chsten Zug erh\xE4lt",
    enlightened: true
  },
  {
    id: "paladin_gleissendes_licht",
    name: "Glei\xDFendes Licht",
    class: "Paladin",
    type: "passive",
    description: "Halbiert Manakosten von Lichtrunen",
    enlightened: true
  },
  {
    id: "paladin_heroischer_auftritt",
    name: "Heroischer Auftritt",
    class: "Paladin",
    type: "dice_bonus",
    description: "Wenn ein Verb\xFCndeter in kritischem Zustand ist, erhalte Vorteil auf alle Aktionen, um diesen Verb\xFCndeten zu besch\xFCtzen oder zu heilen"
  },
  {
    id: "paladin_erneuerung",
    name: "Erneuerung",
    class: "Paladin",
    type: "active",
    description: "Verleiht einem ausgew\xE4hlten Gegenstand in der N\xE4he f\xFCr die Dauer des Kampfes 3 D20 Haltbarkeit",
    enlightened: true,
    cost: { type: "energy", amount: 20 },
    actionType: "Bonusaktion"
  },
  {
    id: "paladin_heiliger_sprint",
    name: "Heiliger Sprint",
    class: "Paladin",
    type: "active",
    description: "Erhalte x4 Bewegung auf Verb\xFCndete im kritischen Zustand",
    enlightened: true,
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  // ==================== TIER 5 ====================
  // ==================== WÄCHTER ====================
  {
    id: "waechter_konstitution_4",
    name: "Konstitution+4",
    class: "W\xE4chter",
    type: "stat_bonus",
    description: "Konstitution+4",
    statBonus: { stat: "constitution", amount: 4 },
    infiniteLevel: true
  },
  {
    id: "waechter_leibwache",
    name: "Leibwache",
    class: "W\xE4chter",
    type: "passive",
    description: "Die Anzahl der Reaktionen von Ritterschwur wird auf 3 erh\xF6ht und die Reichweite erh\xF6ht sich auf 5m. Ben\xF6tigt Ritterschwur",
    requiresSkill: "ritter_ritterschwur"
  },
  {
    id: "waechter_kenne_deinen_feind",
    name: "Kenne deinen Feind",
    class: "W\xE4chter",
    type: "dice_bonus",
    description: "Nach jedem erfolgreichen Block erh\xE4lst du -1 auf alle Angriffe und Blocks gegen diesen Gegner, maximal -3",
    enlightened: true
  },
  {
    id: "waechter_schildmeister",
    name: "Schildmeister",
    class: "W\xE4chter",
    type: "passive",
    description: "-2 auf Angriffe und Blocks mit Schild",
    enlightened: true
  },
  {
    id: "waechter_edles_opfer",
    name: "Edles Opfer",
    class: "W\xE4chter",
    type: "passive",
    description: "Wenn du in den kritischen Zustand f\xE4llst, erhalten alle Verb\xFCndeten in der N\xE4he einmal pro Kampf eine Heilung, die der H\xE4lfte deiner maximalen Leben entspricht"
  },
  {
    id: "waechter_beschuetzerinstinkt",
    name: "Besch\xFCtzerinstinkt",
    class: "W\xE4chter",
    type: "active",
    description: "Sp\xFCrt alle Gefahren in der Umgebung auf, Kosten entsprechen dem Aufsp\xFCrradius in m",
    enlightened: true,
    actionType: "Aktion"
  },
  {
    id: "waechter_vergeltungsschlag",
    name: "Vergeltungsschlag",
    class: "W\xE4chter",
    type: "active",
    description: "Geht in eine defensive Position f\xFCr die Dauer der F\xE4higkeit, was Bewegung halbiert und nur defensive Aktionen erlaubt. Wird die F\xE4higkeit beendet, wird ein Schlag ausgef\xFChrt, dessen St\xE4rke mit dem eingesteckten Schaden skaliert (Effizienz + Schaden/4)",
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== KOLOSS ====================
  {
    id: "koloss_konstitution_staerke_2",
    name: "Konstitution&St\xE4rke+2",
    class: "Koloss",
    type: "stat_bonus",
    description: "Konstitution&St\xE4rke+2",
    statBonuses: [{ stat: "constitution", amount: 2 }, { stat: "strength", amount: 2 }],
    infiniteLevel: true
  },
  {
    id: "koloss_athletik_5",
    name: "Athletik+5",
    class: "Koloss",
    type: "talent_bonus",
    description: "Athletik+5",
    talentBonus: { talent: "athletik", amount: 5 }
  },
  {
    id: "koloss_weg_des_eroberers",
    name: "Weg des Eroberers",
    class: "Koloss",
    type: "passive",
    description: "Kann nicht von gegnerischen Angriffen bewegt werden",
    enlightened: true
  },
  {
    id: "koloss_unaufhaltsam",
    name: "Unaufhaltsam",
    class: "Koloss",
    type: "passive",
    description: "Reduziert Schaden aus allen Quellen um 10, kann nicht unter 1 fallen",
    enlightened: true
  },
  {
    id: "koloss_provokante_praesenz",
    name: "Provokante Pr\xE4senz",
    class: "Koloss",
    type: "active",
    description: "Zieht Aufmerksamkeit der Gegner f\xFCr ihre n\xE4chste Runde auf sich, W\xFCrfelbonus passt sich an die genaue Aktion an, die die Aufmerksamkeit erregt",
    enlightened: true,
    cost: { type: "energy", amount: 5 },
    actionType: "Bonusaktion"
  },
  {
    id: "koloss_erdbeben",
    name: "Erdbeben",
    class: "Koloss",
    type: "active",
    description: "Erzeugt Beben im Umkreis was je nach St\xE4rke sogar Steinh\xE4user oder \xE4hnliche Konstrukte zerst\xF6ren kann und Gegnern leichten Schaden zuf\xFCgt (Effizienz/5), Kosten entsprechen der H\xE4lfte des Radius",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "koloss_wahre_groesse",
    name: "Wahre Gr\xF6\xDFe",
    class: "Koloss",
    type: "active",
    description: "Wird f\xFCr kurze Zeit viel gr\xF6\xDFer und erh\xF6ht Effizienz von Handangriffen um denselben Wert, Bonusaktion, Kosten entsprechen Gr\xF6\xDFenskalierung*10 pro Runde",
    cost: { type: "energy", amount: 0, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "koloss_kolossaler_schlag",
    name: "Kolossaler Schlag",
    class: "Koloss",
    type: "active",
    description: "Angriff mit hoher St\xE4rke und R\xFCcksto\xDF, dessen Schadensberechnung um eine Stufe aufsteigt (kann keinen t\xF6dlichen Treffer erhalten) und auch noch leichten Schaden zuf\xFCgt, wenn der Gegner ausweicht/blockt",
    enlightened: true,
    cost: { type: "energy", amount: 30 },
    actionType: "Aktion"
  },
  // ==================== OMEN ====================
  {
    id: "omen_leben_40",
    name: "Leben+40",
    class: "Omen",
    type: "stat_bonus",
    description: "Leben+40",
    statBonus: { stat: "life", amount: 40 },
    infiniteLevel: true
  },
  {
    id: "omen_bedroher",
    name: "Bedroher",
    class: "Omen",
    type: "passive",
    description: "Vorteil auf Einsch\xFCchterungsw\xFCrfe",
    enlightened: true
  },
  {
    id: "omen_finstere_aura",
    name: "Finstere Aura",
    class: "Omen",
    type: "passive",
    description: "Gegner, die ihm Schaden zuf\xFCgen, werden mit geringer Wahrscheinlichkeit ver\xE4ngstigt (gegnerischer Angriffswurf + 10 als Willenswurf)",
    enlightened: true
  },
  {
    id: "omen_vorwarnung",
    name: "Vorwarnung",
    class: "Omen",
    type: "active",
    description: "Kann eine bereits bekannte Person verfluchen, nach einem Tag wird diese Person von Pech verfolgt. Dieser Effekt wird st\xE4rker, je n\xE4her der Nutzer zum verfluchten Ziel ist. Kostet 1/4 der gegn. HP",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "omen_kraftraub",
    name: "Kraftraub",
    class: "Omen",
    type: "active",
    description: "Stiehlt die Ausdauer (D20) einer anderen Person in unmittelbarer N\xE4he und regeneriert den selben Betrag beim Nutzer",
    enlightened: true,
    cost: { type: "energy", amount: 0 },
    actionType: "Bonusaktion"
  },
  {
    id: "omen_schlachtschwur",
    name: "Schlachtschwur",
    class: "Omen",
    type: "active",
    description: "Solange die F\xE4higkeit aktiv ist, wird der Schaden gegen den Anwender gespeichert. Wenn er einen Gegner t\xF6tet, wird der gespeicherte Schaden wieder geheilt",
    cost: { type: "energy", amount: 20, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "omen_unheilvoller_auftritt",
    name: "Unheilvoller Auftritt",
    class: "Omen",
    type: "active",
    description: "Bereitet f\xFCr 3 Runden ein finsteres Ritual an einem Ort in seinem Sichtfeld vor, w\xE4hrend denen der Nutzer nichts anderes tun kann. Danach h\xFCllt er diesen Ort in Finsternis und fliegt in sein Zentrum. Alle Gegner im Umkreis von 10m werden entweder gel\xE4hmt, ver\xE4ngstigt, oder verstummt (Einsch\xFCchterungswurf gegen Willenswurf: schwacher Treffer = gel\xE4hmt, normaler Treffer = ver\xE4ngstigt, starker Treffer = verstummt)",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "omen_fluchruestung",
    name: "Fluchr\xFCstung",
    class: "Omen",
    type: "active",
    description: "\xDCbernimmt alle gew\xE4hlten negative Effekte aller Personen im Umkreis von 10m. Erh\xE4lt R\xFCstung mit Stabilit\xE4t abh\xE4ngig von der Anzahl und St\xE4rke der absorbierten Effekte f\xFCr 3 Runden",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  // ==================== KRIEGSHERR ====================
  {
    id: "kriegsherr_staerke_4",
    name: "St\xE4rke+4",
    class: "Kriegsherr",
    type: "stat_bonus",
    description: "St\xE4rke+4",
    statBonus: { stat: "strength", amount: 4 },
    infiniteLevel: true
  },
  {
    id: "kriegsherr_blutrausch",
    name: "Blutrausch",
    class: "Kriegsherr",
    type: "passive",
    description: "Erhalte eine Extra-Aktion, wenn du diese Runde einen Gegner t\xF6test"
  },
  {
    id: "kriegsherr_wutbewaeltigung",
    name: "Wutbew\xE4ltigung",
    class: "Kriegsherr",
    type: "passive",
    description: "Negative Effekte von Rage werden aufgehoben",
    enlightened: true
  },
  {
    id: "kriegsherr_vorreiter",
    name: "Vorreiter",
    class: "Kriegsherr",
    type: "passive",
    description: "Wenn du den ersten Treffer im Kampf austeilst oder einsteckst, erhalten alle Verb\xFCndeten eine Extra-Aktion f\xFCr ihren n\xE4chsten Zug"
  },
  {
    id: "kriegsherr_lebensmuede",
    name: "Lebensm\xFCde",
    class: "Kriegsherr",
    type: "active",
    description: "-3 auf Nahkampfangriffe, +2 gegen Angriffe",
    enlightened: true,
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "kriegsherr_todeswirbel",
    name: "Todeswirbel",
    class: "Kriegsherr",
    type: "active",
    description: "Greife jeden Gegner in einem Feld um dich herum an, -1 f\xFCr jeden Gegner in Reichweite",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "kriegsherr_masochist",
    name: "Masochist",
    class: "Kriegsherr",
    type: "active",
    description: "Setzt Leben auf 1, erhalte eine Aktion und eine Bonusaktion pro 30 geopferten Leben",
    cost: { type: "energy", amount: 0 },
    actionType: "Bonusaktion"
  },
  {
    id: "kriegsherr_maechtiger_stoss",
    name: "M\xE4chtiger Sto\xDF",
    class: "Kriegsherr",
    type: "active",
    description: "Gegner, die von Nahkampfangriffen getroffen werden, fliegen bis zu 20m weg",
    enlightened: true,
    cost: { type: "energy", amount: 0 },
    actionType: "Keine Aktion"
  },
  // ==================== DUELLANT ====================
  {
    id: "duellant_geschicklichkeit_4",
    name: "Geschicklichkeit+4",
    class: "Duellant",
    type: "stat_bonus",
    description: "Geschicklichkeit+4",
    statBonus: { stat: "dexterity", amount: 4 },
    infiniteLevel: true
  },
  {
    id: "duellant_perfektion",
    name: "Perfektion",
    class: "Duellant",
    type: "dice_bonus",
    description: "Wenn Leben voll, -2 im Kampf"
  },
  {
    id: "duellant_furie",
    name: "Furie",
    class: "Duellant",
    type: "dice_bonus",
    description: "-1 auf diesen Gegner mit jedem kontinuierlichen Treffer, maximal -5",
    enlightened: true
  },
  {
    id: "duellant_herausfordern",
    name: "Duell",
    class: "Herausfordern",
    type: "active",
    description: "Markiere einen Gegner in Sichtweite f\xFCr diese Runde. Erhalte doppelte Bewegung auf ihn zu",
    cost: { type: "energy", amount: 10 },
    actionType: "Bonusaktion"
  },
  {
    id: "duellant_uebertakten",
    name: "\xDCbertakten",
    class: "Duellant",
    type: "active",
    description: "Greift Gegner an, kann nach einem Treffer eine Extra-Aktion ausf\xFChren, Kosten erh\xF6hen sich um 15 mit jeder Wiederholung",
    enlightened: true,
    cost: { type: "energy", amount: 15 },
    actionType: "Aktion"
  },
  {
    id: "duellant_konter",
    name: "Konter",
    class: "Duellant",
    type: "active",
    description: "Blockt und reflektiert physischen Angriff mit doppelter St\xE4rke, gekonterte Angriffe sind immer normale Treffer",
    cost: { type: "energy", amount: 20 },
    actionType: "Reaktion"
  },
  {
    id: "duellant_schwachstellen_aufdecken",
    name: "Schwachstellen aufdecken",
    class: "Duellant",
    type: "active",
    description: "Kann R\xFCstung mit n\xE4chstem Angriff ignorieren",
    enlightened: true,
    cost: { type: "energy", amount: 15 },
    actionType: "Bonusaktion"
  },
  // ==================== WAFFENMEISTER ====================
  {
    id: "waffenmeister_geschicklichkeit_staerke_2",
    name: "Geschicklichkeit&St\xE4rke+2",
    class: "Waffenmeister",
    type: "stat_bonus",
    description: "Geschicklichkeit&St\xE4rke+2",
    statBonuses: [{ stat: "dexterity", amount: 2 }, { stat: "strength", amount: 2 }],
    infiniteLevel: true
  },
  {
    id: "waffenmeister_waffenmeister",
    name: "Waffenmeister",
    class: "Waffenmeister",
    type: "passive",
    description: 'Waffenvorraussetzungen werden aufgehoben, ben\xF6tigt "Waffenwissen","Waffenkenner" und "Waffengelehrter"',
    enlightened: true,
    requiresSkill: ["schutze_waffenwissen", "erzritter_waffenkenner", "klingentaenzer_waffengelehrter"]
  },
  {
    id: "waffenmeister_wandelndes_arsenal",
    name: "Wandelndes Arsenal",
    class: "Waffenmeister",
    type: "dice_bonus",
    description: "-2 auf jeden Angriff nach Waffenwechsel, Waffenwechsel kosten keine Bonusaktion",
    enlightened: true
  },
  {
    id: "waffenmeister_waffenschmied",
    name: "Waffenschmied",
    class: "Waffenmeister",
    type: "passive",
    description: "Verdreifacht erw\xFCrfelte Schmiedepunkte beim Schmieden von Waffen"
  },
  {
    id: "waffenmeister_ultimativer_stoss",
    name: "Ultimativer Sto\xDF",
    class: "Waffenmeister",
    type: "active",
    description: "Getroffener Gegner wird zur\xFCckgeworfen, Distanz in Metern entspricht Schaden, nur f\xFCr Wuchtwaffen",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "waffenmeister_sturmschnitt",
    name: "Sturmschnitt",
    class: "Waffenmeister",
    type: "active",
    description: "Erzeugt Schockwelle in einer geraden Linie, die getroffenen Gegnern Schnittwunden zuf\xFCgt und bei schweren oder st\xE4rkeren Treffern Gegner durchdringt, maximale Distanz entspricht St\xE4rke+Geschicklichkeit, nur f\xFCr Schnittwaffen",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "waffenmeister_panzerbrecher",
    name: "Panzerbrecher",
    class: "Waffenmeister",
    type: "active",
    description: "Stich, der gegnerische Stabilit\xE4t f\xFCr 5 Runden halbiert, nur f\xFCr Stichwaffen",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  // ==================== ATTENTÄTER ====================
  {
    id: "attentaeter_geschicklichkeit_geschwindigkeit_2",
    name: "Geschicklichkeit&Geschwindigkeit+2",
    class: "Attent\xE4ter",
    type: "stat_bonus",
    description: "Geschicklichkeit&Geschwindigkeit+2",
    statBonuses: [{ stat: "dexterity", amount: 2 }, { stat: "speed", amount: 2 }],
    infiniteLevel: true
  },
  {
    id: "attentaeter_reichweite_50",
    name: "Reichweite+50m",
    class: "Attent\xE4ter",
    type: "stat_bonus",
    description: "Reichweite+50m f\xFCr Fernkampfwaffen"
  },
  {
    id: "attentaeter_verstecken_5",
    name: "Verstecken+5",
    class: "Attent\xE4ter",
    type: "talent_bonus",
    description: "Verstecken+5",
    talentBonus: { talent: "verstecken", amount: 5 }
  },
  {
    id: "attentaeter_schattenlaeufer",
    name: "Schattenl\xE4ufer",
    class: "Attent\xE4ter",
    type: "passive",
    description: 'Kann "Schleichen" ohne Ausdauerkosten benutzen, ben\xF6tigt Schleichen',
    enlightened: true,
    requiresSkill: "dieb_schleichen"
  },
  {
    id: "attentaeter_verstuemmeln",
    name: "Verst\xFCmmeln",
    class: "Attent\xE4ter",
    type: "passive",
    description: "Wird ein Gegner von einem \xDCberraschungsangriff getroffen, erh\xE4lt er +1 auf alle Aktionen bis zum Ende des Kampfes, nicht stapelbar"
  },
  {
    id: "attentaeter_erfrischender_mord",
    name: "Erfrischender Mord",
    class: "Attent\xE4ter",
    type: "passive",
    description: "Stellt Ausdauer her, wenn Gegner get\xF6tet wird (5 x W\xFCrfel in H\xF6he des gegnerischen Levels)"
  },
  {
    id: "attentaeter_ueberwachung",
    name: "\xDCberwachung",
    class: "Attent\xE4ter",
    type: "active",
    description: "Kann bei K\xF6rperkontakt andere Person markieren. Der Anwender kann die Markierung orten, solange sie aktiv ist. Die Markierung kann leicht zerst\xF6rt werden und ist auf eine gleichzeitig limitiert",
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  {
    id: "attentaeter_blitzschritt",
    name: "Blitzschritt",
    class: "Attent\xE4ter",
    type: "active",
    description: "Verdoppelt Bewegung und ignoriert Gelegenheitsangriffe. Keine Aktion",
    cost: { type: "energy", amount: 45 },
    actionType: "Keine Aktion"
  },
  // ==================== TÜFTLER ====================
  {
    id: "tueftler_intelligenz_geschicklichkeit_2",
    name: "Intelligenz+Geschicklichkeit+2",
    class: "T\xFCftler",
    type: "stat_bonus",
    description: "Intelligenz+Geschicklichkeit+2",
    statBonuses: [{ stat: "intelligence", amount: 2 }, { stat: "dexterity", amount: 2 }],
    infiniteLevel: true
  },
  {
    id: "tueftler_fingerfertigkeit_5",
    name: "Fingerfertigkeit+5",
    class: "T\xFCftler",
    type: "talent_bonus",
    description: "Fingerfertigkeit+5",
    talentBonus: { talent: "fingerfertigkeit", amount: 5 }
  },
  {
    id: "tueftler_mechaniker",
    name: "Mechaniker",
    class: "T\xFCftler",
    type: "passive",
    description: "Verdreifacht erw\xFCrfelte Schmiedepunkte beim Schmieden von Konstrukten"
  },
  {
    id: "tueftler_kalibrierte_geschosse",
    name: "Kalibrierte Geschosse",
    class: "T\xFCftler",
    type: "passive",
    description: "Verdoppelt Effizienz von selbst hergestellter Munition, inklusive Zauber"
  },
  {
    id: "tueftler_runenchirurg",
    name: "Runenchirurg",
    class: "T\xFCftler",
    type: "passive",
    description: "Verkleinerte Zauber verlieren nur halb so viel Effizienz"
  },
  {
    id: "tueftler_raffiniert",
    name: "Raffiniert",
    class: "T\xFCftler",
    type: "passive",
    description: "Vorteil auf Zerst\xF6rungswurf von eigener Ausr\xFCstung und Zauber und setzt Haltbarkeit von beiden nach K\xE4mpfen auf 100 zur\xFCck, wenn es im Kampf unter diesen Wert gefallen ist",
    enlightened: true
  },
  {
    id: "tueftler_zweiter_atem",
    name: "Zweiter Atem",
    class: "T\xFCftler",
    type: "active",
    description: "Erh\xE4lt eine zus\xE4tzliche Bonusaktion f\xFCr diese Runde. Keine Aktion",
    enlightened: true,
    cost: { type: "energy", amount: 15 },
    actionType: "Keine Aktion"
  },
  {
    id: "tueftler_zauberschmiede",
    name: "Zauberschmiede",
    class: "T\xFCftler",
    type: "active",
    description: "Verarbeite Materialien in eine gew\xFCnschte Form, kann zum Schmieden benutzt werden",
    cost: { type: "energy", amount: 10 },
    actionType: "Aktion"
  },
  // ==================== MANAFÜRST ====================
  {
    id: "manafuerst_mana_40",
    name: "Mana+40",
    class: "Manaf\xFCrst",
    type: "stat_bonus",
    description: "Mana+40",
    statBonus: { stat: "mana", amount: 40 },
    infiniteLevel: true
  },
  {
    id: "manafuerst_zauberradius_5",
    name: "Zauberradius+5m",
    class: "Manaf\xFCrst",
    type: "stat_bonus",
    description: "Zauberradius+5m",
    enlightened: true,
    statBonus: { stat: "spellRadius", amount: 5 }
  },
  {
    id: "manafuerst_runenschmied",
    name: "Runenschmied",
    class: "Manaf\xFCrst",
    type: "passive",
    description: "Verwende einen Talentpunkt, um die Effizienz einer Rune in deinem Besitz dauerhaft um 1 D10 zu erh\xF6hen",
    enlightened: true
  },
  {
    id: "manafuerst_energiewandler",
    name: "Energiewandler",
    class: "Manaf\xFCrst",
    type: "passive",
    description: "10% der verwendeten Mana werden in latente Energie umgewandelt, die entweder zu Leben, Ausdauer oder Mana f\xFCr einen Verb\xFCndeten konvertiert werden kann. Kann \xFCber mehrere Runden gespeichert werden aber verf\xE4llt nach dem Kampf",
    enlightened: true
  },
  {
    id: "manafuerst_arkaner_speicher",
    name: "Arkaner Speicher",
    class: "Manaf\xFCrst",
    type: "passive",
    description: "Kann einen Zaubercast speichern, um ihn sp\xE4ter zu benutzen, solange das Medium f\xFCr die Benutzung in der N\xE4he ist"
  },
  {
    id: "manafuerst_magieherrschaft",
    name: "Magieherrschaft",
    class: "Manaf\xFCrst",
    type: "passive",
    description: "Gegner im Zauberradius erhalten den Nachteil f\xFCr Zauber zus\xE4tzlich auf ihre F\xE4higkeiten"
  },
  {
    id: "manafuerst_zauberautoritaet",
    name: "Zauberauthorit\xE4t",
    class: "Manaf\xFCrst",
    type: "active",
    description: 'Erweitert "Zauberbrecher", sodass schwache Zauber (Effizienz < Intelligenz/2) absorbiert werden und deine Mana um die H\xE4lfte der Manakosten aufgef\xFCllt wird. Halbiert zus\xE4tzlich Ausdauerkosten',
    requiresSkill: "arkanist_zauberbrecher",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "manafuerst_herrschaftsgebiet",
    name: "Herrschaftsgebiet",
    class: "Manaf\xFCrst",
    type: "active",
    description: "Verdreifacht Zauberradius",
    cost: { type: "energy", amount: 30, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== NEKROMANT ====================
  {
    id: "nekromant_fokus_5",
    name: "Fokus+5",
    class: "Nekromant",
    type: "stat_bonus",
    description: "Fokus+5",
    statBonus: { stat: "focus", amount: 5 },
    infiniteLevel: true
  },
  {
    id: "nekromant_geschichte_5",
    name: "Geschichte+5",
    class: "Nekromant",
    type: "talent_bonus",
    description: "Geschichte+5",
    talentBonus: { talent: "geschichte", amount: 5 }
  },
  {
    id: "nekromant_totenbeschworer",
    name: "Totenbeschw\xF6rer",
    class: "Nekromant",
    type: "passive",
    description: "Tote Lebewesen hinterlassen eine Wahre Seelenrunen, die einmalig beschworen werden k\xF6nnen."
  },
  {
    id: "nekromant_seelenverbindung",
    name: "Seelenverbindung",
    class: "Nekromant",
    type: "passive",
    description: "Von dir beschworene Kreaturen in 50m Radius kopieren deinen Zauberradius und z\xE4hlen als Teil von deinem Zauberradius, kann \xFCber mehrere beschworene Kreaturen verkettet werden, um Reichweite zu erh\xF6hen",
    enlightened: true
  },
  {
    id: "nekromant_seelenfusion",
    name: "Seelenfusion",
    class: "Nekromant",
    type: "passive",
    description: "Entfernt Nachteil und -5 bei Infusion einer Seele in einen lebendigen K\xF6rper"
  },
  {
    id: "nekromant_gestohlene_macht",
    name: "Gestohlene Macht",
    class: "Nekromant",
    type: "passive",
    description: 'Solange eine Seele mit "Totenbeschw\xF6rer" beschworen ist, wird die H\xE4lfte ihres Fokus dem Anwender gutgeschrieben (kann maximal den Fokuskosten der Seelenrune entsprechen), ben\xF6tigt Totenbeschw\xF6rer',
    requiresSkill: "nekromant_totenbeschworer"
  },
  {
    id: "nekromant_unheiliges_ritual",
    name: "Unheiliges Ritual",
    class: "Nekromant",
    type: "active",
    description: "Zerst\xF6re Seelenrune f\xFCr Mana, kann Rune danach nicht mehr benutzen. Stellt Mana in H\xF6he der Effizienz der Rune her",
    enlightened: true,
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "nekromant_maertyrer",
    name: "M\xE4rtyrer",
    class: "Nekromant",
    type: "active",
    description: "Solange die F\xE4higkeit aktiv ist, werden Verletzungen auf Beschw\xF6rungen in bis zu 10m Entfernung transferiert",
    cost: { type: "energy", amount: 20, perRound: true },
    actionType: "Bonusaktion"
  },
  // ==================== ORAKEL ====================
  {
    id: "orakel_intelligenz_4",
    name: "Intelligenz+4",
    class: "Orakel",
    type: "stat_bonus",
    description: "Intelligenz+4",
    statBonus: { stat: "intelligence", amount: 4 },
    infiniteLevel: true
  },
  {
    id: "orakel_adaptiver_geist",
    name: "Adaptiver Geist",
    class: "Orakel",
    type: "passive",
    description: "Kann F\xE4higkeiten mit Mana anstatt Ausdauer ausl\xF6sen, kostet 20% mehr",
    enlightened: true
  },
  {
    id: "orakel_vorschuss",
    name: "Vorschuss",
    class: "Orakel",
    type: "passive",
    description: "Kann Zauber mit Castzeit sofort ausf\xFChren, muss den Cast aber nach Abschluss des Zaubers abarbeiten und kann bis dahin keine weiteren Zauber verwenden"
  },
  {
    id: "orakel_identifizieren",
    name: "Identifizieren",
    class: "Orakel",
    type: "passive",
    description: "Kann alle Stats von Items sofort erkennen und erh\xE4lt manchmal Visionen aus deren Vergangenheit",
    enlightened: true
  },
  {
    id: "orakel_ueberreaktion",
    name: "\xDCberreaktion",
    class: "Orakel",
    type: "active",
    description: "-5 auf Reaktionswert und -2 auf alle volle Reaktionen. +5 auf alle Panikreaktionen",
    cost: { type: "energy", amount: 10, perRound: true },
    actionType: "Bonusaktion",
    enlightened: true
  },
  {
    id: "orakel_glueckstraehne",
    name: "Gl\xFCcksstr\xE4hne",
    class: "Orakel",
    type: "active",
    description: "W\xE4hle eine Zahl zwischen 1 und 20. Wenn du im Verlauf diesen Kampfes diese Zahl w\xFCrfelst(ohne Boni), erhalte Vorteil auf alle Aktionen f\xFCr eine zus\xE4tzliche Runde pro 20 Ausdauer investiert",
    cost: { type: "energy", amount: 20 },
    actionType: "Aktion"
  },
  {
    id: "orakel_schicksal",
    name: "Schicksal",
    class: "Orakel",
    type: "active",
    description: "Kann ein W\xFCrfelergebnis f\xFCr Verb\xFCndete zur\xFCcksetzen und neu w\xFCrfeln lassen oder das eigene W\xFCrfelergebnis zur\xFCcksetzen und den Zug neu starten (Ausdauerkosten dieser F\xE4higkeit bleiben bestehen)",
    cost: { type: "energy", amount: 30 },
    actionType: "Keine Aktion"
  },
  {
    id: "orakel_prophezeiung",
    name: "Prophezeiung",
    class: "Orakel",
    type: "active",
    description: "Sieh einen zuf\xE4lligen Moment in bis zu einem Tag in der Zukunft. Nur einmal pro Tag",
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  // ==================== DUNKLER RITTER ====================
  {
    id: "dunkler_ritter_staerke_intelligenz_2",
    name: "St\xE4rke&Intelligenz+2",
    class: "Dunkler Ritter",
    type: "stat_bonus",
    description: "St\xE4rke&Intelligenz+2",
    statBonuses: [{ stat: "strength", amount: 2 }, { stat: "intelligence", amount: 2 }],
    infiniteLevel: true
  },
  {
    id: "dunkler_ritter_absolute_dunkelheit",
    name: "Absolute Dunkelheit",
    class: "Dunkler Ritter",
    type: "passive",
    description: "Halbiert Manakosten und Vorausssetzung von Schattenrunen",
    enlightened: true
  },
  {
    id: "dunkler_ritter_nachtaktiv",
    name: "Nachtaktiv",
    class: "Dunkler Ritter",
    type: "dice_bonus",
    description: "-2, wenn es dunkel ist",
    enlightened: true
  },
  {
    id: "dunkler_ritter_arkane_ausstattung",
    name: "Arkane Ausstattung",
    class: "Dunkler Ritter",
    type: "passive",
    description: "Erh\xF6ht Effizienz von Zaubern, die \xFCber Ausr\xFCstung oder Waffen als Medium genutzt werden, um 50%"
  },
  {
    id: "dunkler_ritter_konzentration",
    name: "Konzentration",
    class: "Dunkler Ritter",
    type: "passive",
    description: "Kann F\xE4higkeiten ohne Ausdauerkosten benutzen, indem die H\xE4lfte seines Fokus f\xFCr 3 Runden besetzt wird"
  },
  {
    id: "dunkler_ritter_schattenruestung",
    name: "Schattenr\xFCstung",
    class: "Dunkler Ritter",
    type: "active",
    description: "Alle Geschwindgkeitsmali von R\xFCstungen werden aufgehoben, addiert die H\xE4lfte der R\xFCstungsnegation auf den Geschwindigkeitswert",
    cost: { type: "energy", amount: 15, perRound: true },
    actionType: "Bonusaktion"
  },
  {
    id: "dunkler_ritter_dunkler_schnitt",
    name: "Dunkler Schnitt",
    class: "Dunkler Ritter",
    type: "active",
    description: "Schnitt, der fast alle Waffen und R\xFCstungen ignoriert, verbraucht 300 Waffenhaltbarkeit",
    enlightened: true,
    cost: { type: "energy", amount: 0 },
    actionType: "Aktion"
  },
  {
    id: "dunkler_ritter_tiefer_fokus",
    name: "Tiefer Fokus",
    class: "Dunkler Ritter",
    type: "active",
    description: "Verdoppelt Fokus",
    cost: { type: "life", amount: 20, perRound: true },
    actionType: "Bonusaktion"
  }
];
function getSkillsForClass(skillsOrClassName, className) {
  if (typeof skillsOrClassName === "string") {
    return SKILL_DEFINITIONS.filter((s) => s.class === skillsOrClassName);
  }
  return skillsOrClassName.filter((s) => s.class === className);
}
function getSkillById(skillId) {
  return SKILL_DEFINITIONS.find((s) => s.id === skillId);
}

// src/app/utils/skill-talent-bonus.utils.ts
function resolveSkillDefinition(skill) {
  if (skill.skillId)
    return SKILL_DEFINITIONS.find((s) => s.id === skill.skillId);
  return SKILL_DEFINITIONS.find((s) => s.name === skill.name && s.class === skill.class) ?? SKILL_DEFINITIONS.find((s) => s.name === skill.name);
}
function computeSkillTalentBonuses(sheet) {
  const totals = /* @__PURE__ */ new Map();
  for (const skill of sheet.skills ?? []) {
    if (skill.disabled)
      continue;
    const def = resolveSkillDefinition(skill);
    if (!def || def.type !== "talent_bonus")
      continue;
    const level = skill.level ?? 1;
    if (def.talentBonus) {
      const talentId = def.talentBonus.talent;
      totals.set(talentId, (totals.get(talentId) ?? 0) + def.talentBonus.amount * level);
    }
    if (def.talentBonuses) {
      for (const bonus of def.talentBonuses) {
        totals.set(bonus.talent, (totals.get(bonus.talent) ?? 0) + bonus.amount * level);
      }
    }
  }
  return totals;
}
function computeSkillTalentBonusBreakdown(sheet) {
  const breakdown = /* @__PURE__ */ new Map();
  for (const skill of sheet.skills ?? []) {
    if (skill.disabled)
      continue;
    const def = resolveSkillDefinition(skill);
    if (!def || def.type !== "talent_bonus")
      continue;
    const level = skill.level ?? 1;
    const entries = [];
    if (def.talentBonus)
      entries.push({ talent: def.talentBonus.talent, amount: def.talentBonus.amount });
    if (def.talentBonuses) {
      for (const bonus of def.talentBonuses) {
        entries.push({ talent: bonus.talent, amount: bonus.amount });
      }
    }
    for (const entry of entries) {
      const amount = entry.amount * level;
      const existing = breakdown.get(entry.talent) ?? { total: 0, sources: [] };
      existing.total += amount;
      existing.sources.push({ skillName: skill.name, amount });
      breakdown.set(entry.talent, existing);
    }
  }
  return breakdown;
}

// src/app/scripting/character-context.ts
var ATTR_TO_STATKEY = {
  strength: "strength",
  dexterity: "dexterity",
  speed: "speed",
  intelligence: "intelligence",
  constitution: "constitution",
  wille: "chill"
};
function createPlayerContext(sheet, trueStats, runtime) {
  const resourceCurrent = (ft) => sheet.statuses?.find((s) => s.formulaType === ft)?.statusCurrent ?? 0;
  const scalars = {
    // Attributes
    strength: () => trueStats.calculateStrength(sheet),
    dexterity: () => trueStats.calculateDexterity(sheet),
    speed: () => trueStats.calculateSpeed(sheet),
    intelligence: () => trueStats.calculateIntelligence(sheet),
    constitution: () => trueStats.calculateConstitution(sheet),
    wille: () => trueStats.calculateWille(sheet),
    // Level / class
    level: () => sheet.level || 1,
    primaryClass: () => sheet.primary_class ?? "",
    secondaryClass: () => sheet.secondary_class ?? "",
    // Resources
    health: () => resourceCurrent(FormulaType.LIFE),
    healthMax: () => trueStats.calculateResourceMax(sheet, FormulaType.LIFE),
    energy: () => resourceCurrent(FormulaType.ENERGY),
    energyMax: () => trueStats.calculateResourceMax(sheet, FormulaType.ENERGY),
    mana: () => resourceCurrent(FormulaType.MANA),
    manaMax: () => trueStats.calculateResourceMax(sheet, FormulaType.MANA),
    fokus: () => trueStats.calculateFokusMax(sheet),
    fokusMax: () => trueStats.calculateFokusMax(sheet),
    // Derived
    movement: () => trueStats.calculateMovementSpeed(sheet),
    grundbonus: () => trueStats.calculateGrundbonus(sheet),
    reaktion: () => trueStats.calculateReaktionswert(sheet),
    stability: () => trueStats.calculateTotalStability(sheet),
    armorMalus: () => trueStats.calculateTotalSpeedMalus(sheet),
    armorNegation: () => trueStats.calculateSpeedPenaltyNegation(sheet),
    effectiveSpeed: () => trueStats.calculateEffectiveSpeed(sheet),
    baseSpeed: () => trueStats.calculateSpeed(sheet),
    totalArmorDebuff: () => trueStats.calculateTotalArmorDebuff(sheet),
    speedPenaltyNegation: () => trueStats.calculateSpeedPenaltyNegation(sheet),
    encumbrancePercent: () => Math.round(trueStats.getEncumbrancePercentage(sheet)),
    totalWeight: () => trueStats.getTotalWeight(sheet),
    maxCapacity: () => trueStats.getMaxCapacity(sheet),
    // Currency
    copper: () => sheet.currency?.copper ?? 0,
    silver: () => sheet.currency?.silver ?? 0,
    gold: () => sheet.currency?.gold ?? 0,
    platinum: () => sheet.currency?.platinum ?? 0,
    // Runtime context of the current effect/execution
    stacks: () => runtime.stacks,
    turn: () => runtime.turn,
    duration: () => runtime.duration,
    effectStrength: () => runtime.effectStrength
  };
  return {
    rng: runtime.rng ?? Math.random,
    inCombat: () => runtime.inCombat,
    readScalar: (name2) => scalars[name2]?.() ?? 0,
    readAttributeMember: (attr, prop) => {
      const key = ATTR_TO_STATKEY[attr];
      if (!key)
        return 0;
      switch (prop) {
        case "modifier":
          return trueStats.calculateStatModifier(sheet, key);
        case "diceModifier":
          return trueStats.calculateStatDiceModifier(sheet, key);
        case "base":
          return sheet[key]?.base ?? 0;
        case "current":
          return trueStats.calculateStat(sheet, sheet[key], key);
        default:
          return 0;
      }
    },
    readTalent: (id) => {
      const def = TALENT_DEFINITIONS.find((t2) => t2.id === id);
      if (!def)
        return 0;
      const statMod = trueStats.calculateStatModifier(sheet, def.stat);
      const rank = (sheet.talentRanks ?? {})[id] ?? 0;
      const skillBonus = computeSkillTalentBonusBreakdown(sheet).get(id)?.total ?? 0;
      const statusBonus = trueStats.getStatusTalentBonus(sheet, id);
      return -(statMod + rank + skillBonus + statusBonus);
    },
    hasSkill: (name2) => (sheet.skills ?? []).some((s) => s.name === name2 || s.skillId === name2) || (sheet.learnedSkillIds ?? []).includes(name2)
  };
}

// src/app/scripting/symbols.ts
var STYLE_NAMES = /* @__PURE__ */ new Set(["good", "bad", "neutral", "info"]);
var ATTRIBUTE_MEMBERS = {
  modifier: "D&D-Modifikator: (Wert\u221210)/2",
  diceModifier: "W\xFCrfel-Modifikator (niedriger = besser)",
  base: "Basiswert",
  current: "Aktueller Gesamtwert"
};
var RESOURCE_NAMES = /* @__PURE__ */ new Set(["health", "energy", "mana", "fokus"]);
var RESOURCE_INFO = {
  health: "Leben",
  energy: "Ausdauer",
  mana: "Mana",
  fokus: "Fokus"
};
var POLARITY_NAMES = /* @__PURE__ */ new Set(["buff", "debuff"]);
var POLARITY_INFO = {
  buff: "Positiver Effekt (isDebuff = false)",
  debuff: "Negativer Effekt (isDebuff = true)"
};
var ICON_CHOICES = [
  { icon: "\u{1F40C}", label: "Verlangsamt" },
  { icon: "\u2744\uFE0F", label: "K\xE4lte / Gefroren" },
  { icon: "\u{1F525}", label: "Feuer / Brennen" },
  { icon: "\u2620\uFE0F", label: "Gift" },
  { icon: "\u{1FA78}", label: "Blutung" },
  { icon: "\u{1F4A4}", label: "Schlaf / Bet\xE4ubt" },
  { icon: "\u{1F578}\uFE0F", label: "Gefangen" },
  { icon: "\u{1F4AB}", label: "Benommen" },
  { icon: "\u{1F6E1}\uFE0F", label: "Schutz" },
  { icon: "\u2694\uFE0F", label: "Angriffsbonus" },
  { icon: "\u26A1", label: "Hast / Blitz" },
  { icon: "\u2728", label: "Segen" },
  { icon: "\u{1F311}", label: "Fluch" },
  { icon: "\u{1F4AA}", label: "St\xE4rke" },
  { icon: "\u{1F9E0}", label: "Geist" },
  { icon: "\u{1F441}\uFE0F", label: "Sicht" },
  { icon: "\u{1F9B6}", label: "Bewegung" },
  { icon: "\u{1F49A}", label: "Regeneration" },
  { icon: "\u{1F480}", label: "Todesnah" },
  { icon: "\u2B50", label: "Allgemein" }
];
var ACTION_TYPE_NAMES = /* @__PURE__ */ new Set(["Aktion", "Bonusaktion", "KeineAktion", "Reaktion"]);
var ACTION_TYPE_MAP = {
  Aktion: "Aktion",
  Bonusaktion: "Bonusaktion",
  KeineAktion: "Keine Aktion",
  Reaktion: "Reaktion"
};
var ACTION_TYPE_INFO = {
  Aktion: "Kostet eine Aktion",
  Bonusaktion: "Kostet eine Bonusaktion",
  KeineAktion: "Keine Aktion n\xF6tig",
  Reaktion: "Reaktion"
};
var A = (name2, target, description) => ({ name: name2, category: "attribute", type: "number", description, assignable: true, modifierTarget: target });
var SYMBOLS = [
  // Attributes (true totals via TrueStatsService)
  A("strength", "strength", "St\xE4rke (Gesamtwert)"),
  A("dexterity", "dexterity", "Geschicklichkeit (Gesamtwert)"),
  A("speed", "speed", "Geschwindigkeit (Gesamtwert)"),
  A("intelligence", "intelligence", "Intelligenz (Gesamtwert)"),
  A("constitution", "constitution", "Konstitution (Gesamtwert)"),
  A("wille", "chill", "Wille (Gesamtwert)"),
  // Level / class
  { name: "level", category: "level", type: "number", description: "Charakterstufe" },
  { name: "primaryClass", category: "class", type: "string", description: "Prim\xE4re Klasse" },
  { name: "secondaryClass", category: "class", type: "string", description: "Sekund\xE4re Klasse" },
  // Resources (current + max) — read-only; change via loseResource/gainResource
  { name: "health", category: "resource", type: "number", description: "Aktuelles Leben" },
  { name: "healthMax", category: "resource", type: "number", description: "Maximales Leben" },
  { name: "energy", category: "resource", type: "number", description: "Aktuelle Ausdauer" },
  { name: "energyMax", category: "resource", type: "number", description: "Maximale Ausdauer" },
  { name: "mana", category: "resource", type: "number", description: "Aktuelles Mana" },
  { name: "manaMax", category: "resource", type: "number", description: "Maximales Mana" },
  { name: "fokus", category: "resource", type: "number", description: "Verf\xFCgbarer Fokus" },
  { name: "fokusMax", category: "resource", type: "number", description: "Maximaler Fokus" },
  // Derived values
  { name: "movement", category: "derived", type: "number", description: "Bewegung in Hex-Schritten", assignable: true, modifierTarget: "bewegung" },
  { name: "grundbonus", category: "derived", type: "number", description: "Grundbonus", assignable: true, modifierTarget: "grundbonus" },
  { name: "reaktion", category: "derived", type: "number", description: "Reaktionswert", assignable: true, modifierTarget: "reaktion" },
  { name: "stability", category: "derived", type: "number", description: "Stabilit\xE4t (Verteidigung gegen Schaden)", assignable: true, modifierTarget: "stability" },
  { name: "armorMalus", category: "derived", type: "number", description: "R\xFCstungsmalus (Geschw.)", assignable: true, modifierTarget: "armorMalus" },
  { name: "armorNegation", category: "derived", type: "number", description: "R\xFCstungsnegation", assignable: true, modifierTarget: "armorNegation" },
  { name: "effectiveSpeed", category: "derived", type: "number", description: "Effektive Geschwindigkeit (nach Malus)" },
  { name: "baseSpeed", category: "derived", type: "number", description: "Basis-Geschwindigkeit (ohne Malus)" },
  { name: "totalArmorDebuff", category: "derived", type: "number", description: "R\xFCstungs-Geschw.-Malus (Items)" },
  { name: "speedPenaltyNegation", category: "derived", type: "number", description: "Geschw.-Malus-Negation" },
  { name: "encumbrancePercent", category: "derived", type: "number", description: "Beladung in %" },
  { name: "totalWeight", category: "derived", type: "number", description: "Getragenes Gewicht" },
  { name: "maxCapacity", category: "derived", type: "number", description: "Maximale Tragkraft" },
  // Currency
  { name: "copper", category: "currency", type: "number", description: "Kupfer" },
  { name: "silver", category: "currency", type: "number", description: "Silber" },
  { name: "gold", category: "currency", type: "number", description: "Gold" },
  { name: "platinum", category: "currency", type: "number", description: "Platin" },
  // Runtime context (of the current effect/execution)
  { name: "stacks", category: "runtime", type: "number", description: "Stapelanzahl des aktuellen Effekts (Code verarbeitet Stapel selbst)" },
  { name: "turn", category: "runtime", type: "number", description: "Aktuelle Zugnummer (0 au\xDFerhalb des Kampfes)" },
  { name: "duration", category: "runtime", type: "number", description: "Verbleibende Dauer des Effekts in Runden" },
  { name: "effectStrength", category: "runtime", type: "number", description: "St\xE4rke des aktuellen Status-Effekts" },
  // Namespace
  { name: "talent", category: "namespace", type: "namespace", description: "Talent-W\xFCrfelboni: talent.<name>" }
];
var SYMBOL_MAP = new Map(SYMBOLS.map((s) => [s.name, s]));
var TALENT_IDS = new Set(TALENT_DEFINITIONS.map((t2) => t2.id));
var TALENT_INFO = TALENT_DEFINITIONS.map((t2) => ({ id: t2.id, name: t2.name, statLabel: t2.statLabel, description: t2.description }));
var BUILTINS = [
  { name: "display", signature: "display(text, style?)", description: "Zeigt Text an (style: good/bad/neutral/info)", minArgs: 1, maxArgs: 2, styleArgIndex: 1 },
  { name: "stat", signature: "stat(label, value, style?)", description: "Zeigt einen Wert als Chip: label | value", minArgs: 2, maxArgs: 3, styleArgIndex: 2 },
  { name: "banner", signature: "banner(text, style?)", description: "Gro\xDFe \xDCberschrift", minArgs: 1, maxArgs: 2, styleArgIndex: 1 },
  { name: "box", signature: "box(text, style?)", description: "Wert als Kasten: [text]", minArgs: 1, maxArgs: 2, styleArgIndex: 1 },
  { name: "roll", signature: "roll(dice) oder roll(count, sides)", description: "W\xFCrfelt und liefert das Ergebnis", minArgs: 1, maxArgs: 2 },
  { name: "loseResource", signature: "loseResource(resource, amount)", description: "Verliert dauerhaft Ressource (health/energy/mana/fokus)", minArgs: 2, maxArgs: 2, resourceFirstArg: true },
  { name: "gainResource", signature: "gainResource(resource, amount)", description: "Gewinnt dauerhaft Ressource", minArgs: 2, maxArgs: 2, resourceFirstArg: true },
  { name: "applyStatus", signature: "applyStatus(id, stacks?)", description: "Wendet einen Status-Effekt an", minArgs: 1, maxArgs: 2 },
  { name: "removeStatus", signature: "removeStatus(id)", description: "Entfernt einen Status-Effekt", minArgs: 1, maxArgs: 1 },
  { name: "hasSkill", signature: "hasSkill(name)", description: "Ob eine F\xE4higkeit vorhanden ist (true/false)", minArgs: 1, maxArgs: 1 },
  { name: "min", signature: "min(a, b, \u2026)", description: "Kleinster Wert", minArgs: 1, maxArgs: 99 },
  { name: "max", signature: "max(a, b, \u2026)", description: "Gr\xF6\xDFter Wert", minArgs: 1, maxArgs: 99 },
  { name: "floor", signature: "floor(x)", description: "Abrunden", minArgs: 1, maxArgs: 1 },
  { name: "ceil", signature: "ceil(x)", description: "Aufrunden", minArgs: 1, maxArgs: 1 },
  { name: "round", signature: "round(x)", description: "Runden", minArgs: 1, maxArgs: 1 },
  { name: "abs", signature: "abs(x)", description: "Betrag", minArgs: 1, maxArgs: 1 }
];
var BUILTIN_MAP = new Map(BUILTINS.map((f) => [f.name, f]));
var KEYWORD_INFO = [
  { name: "var", description: "Lokale Variable deklarieren", snippet: "var name = 0" },
  { name: "if", description: "Bedingung", snippet: "if (bedingung) {\n	\n}" },
  { name: "else", description: "Sonst-Zweig" },
  { name: "effectActive", description: "Wirkt, solange der Effekt aktiv ist: Stat-Modifikatoren (speed += 2, speed *= 2 \u2026) und grantSkill. Wird beim Entfernen des Effekts automatisch r\xFCckg\xE4ngig gemacht.", snippet: "effectActive {\n	\n}" },
  { name: "untilNextTurn", description: "Veraltet \u2014 Alias f\xFCr effectActive.", snippet: "effectActive {\n	\n}" },
  { name: "grantSkill", description: "Effektgebundene F\xE4higkeit (nur in effectActive): grantSkill(Name, Beschreibung, Aktionstyp, Mana, Ausdauer, Leben)", snippet: 'grantSkill("Name", "Beschreibung", Aktion, 0, 0, 0) {\n	\n}' },
  { name: "onTrigger", description: "Manuell ausl\xF6sbare Aktion (kein periodischer Effekt). Wird im Effekt-Men\xFC als Knopf gelistet.", snippet: 'onTrigger("Ausl\xF6ser-Name") {\n	\n}' },
  { name: "giveStatus", description: "Erzeugt und wendet einen neuen Status-Effekt an: giveStatus(Name, Beschreibung, Stapel, Dauer, Icon, buff/debuff) { effectActive { \u2026 } }", snippet: 'giveStatus("Name", "Beschreibung", 1, 1, "\u2B50", debuff) {\n	effectActive {\n		\n	}\n}' },
  { name: "action", description: "Benannter Aktionsblock", snippet: "action name {\n	\n}" },
  { name: "repeat", description: "Wiederhole n-mal", snippet: "repeat(n) {\n	\n}" },
  { name: "while", description: "Solange Bedingung wahr", snippet: "while (bedingung) {\n	\n}" },
  { name: "true", description: "Wahr" },
  { name: "false", description: "Falsch" }
];

// src/app/scripting/lexer.ts
var KEYWORDS = /* @__PURE__ */ new Set([
  "var",
  "if",
  "else",
  "true",
  "false",
  "effectActive",
  "untilNextTurn",
  "grantSkill",
  "giveStatus",
  "onTrigger",
  "action",
  "repeat",
  "while"
]);
var PUNCT = [
  "&&",
  "||",
  "==",
  "!=",
  "<=",
  ">=",
  "+=",
  "-=",
  "*=",
  "/=",
  "(",
  ")",
  "{",
  "}",
  ",",
  ";",
  ".",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "=",
  "!"
];
var isDigit = (c) => c >= "0" && c <= "9";
var isIdentStart = (c) => c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
var isIdentPart = (c) => isIdentStart(c) || isDigit(c);
function lex(src) {
  const tokens = [];
  const diagnostics = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === " " || c === "	" || c === "\r" || c === "\n") {
      i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < n && src[i] !== "\n")
        i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/"))
        i++;
      if (i >= n) {
        diagnostics.push({ from: start, to: n, severity: "error", message: "Unbeendeter Blockkommentar" });
      } else
        i += 2;
      continue;
    }
    if (c === '"') {
      const start = i;
      i++;
      let value = "";
      let closed = false;
      while (i < n) {
        const ch = src[i];
        if (ch === "\\" && i + 1 < n) {
          value += src[i + 1];
          i += 2;
          continue;
        }
        if (ch === '"') {
          i++;
          closed = true;
          break;
        }
        if (ch === "\n")
          break;
        value += ch;
        i++;
      }
      if (!closed)
        diagnostics.push({ from: start, to: i, severity: "error", message: 'Unbeendeter Text (fehlendes ")' });
      tokens.push({ type: "string", value, from: start, to: i });
      continue;
    }
    if (isDigit(c)) {
      const start = i;
      while (i < n && isDigit(src[i]))
        i++;
      if (src[i] === "d" && isDigit(src[i + 1])) {
        const count = parseInt(src.slice(start, i), 10);
        i++;
        const sidesStart = i;
        while (i < n && isDigit(src[i]))
          i++;
        const sides = parseInt(src.slice(sidesStart, i), 10);
        tokens.push({ type: "dice", value: src.slice(start, i), from: start, to: i, diceCount: count, diceSides: sides });
        continue;
      }
      if (src[i] === "." && isDigit(src[i + 1])) {
        i++;
        while (i < n && isDigit(src[i]))
          i++;
      }
      tokens.push({ type: "number", value: src.slice(start, i), from: start, to: i });
      continue;
    }
    if (isIdentStart(c)) {
      const start = i;
      while (i < n && isIdentPart(src[i]))
        i++;
      const value = src.slice(start, i);
      tokens.push({ type: KEYWORDS.has(value) ? "keyword" : "identifier", value, from: start, to: i });
      continue;
    }
    let matched = null;
    for (const p of PUNCT) {
      if (src.startsWith(p, i)) {
        matched = p;
        break;
      }
    }
    if (matched) {
      tokens.push({ type: "punct", value: matched, from: i, to: i + matched.length });
      i += matched.length;
      continue;
    }
    diagnostics.push({ from: i, to: i + 1, severity: "error", message: `Unerwartetes Zeichen: '${c}'` });
    i++;
  }
  tokens.push({ type: "eof", value: "", from: n, to: n });
  return { tokens, diagnostics };
}

// src/app/scripting/parser.ts
var ASSIGN_OPS = /* @__PURE__ */ new Set(["=", "+=", "-=", "*=", "/="]);
function parse(src) {
  const { tokens, diagnostics } = lex(src);
  return new Parser(tokens, diagnostics, src.length).parseProgram();
}
var Parser = class {
  tokens;
  diagnostics;
  srcLen;
  pos = 0;
  constructor(tokens, diagnostics, srcLen) {
    this.tokens = tokens;
    this.diagnostics = diagnostics;
    this.srcLen = srcLen;
  }
  peek(o = 0) {
    return this.tokens[Math.min(this.pos + o, this.tokens.length - 1)];
  }
  atEof() {
    return this.peek().type === "eof";
  }
  next() {
    const t2 = this.peek();
    if (!this.atEof())
      this.pos++;
    return t2;
  }
  isPunct(v, o = 0) {
    const t2 = this.peek(o);
    return t2.type === "punct" && t2.value === v;
  }
  isKeyword(v, o = 0) {
    const t2 = this.peek(o);
    return t2.type === "keyword" && t2.value === v;
  }
  error(t2, message) {
    this.diagnostics.push({ from: t2.from, to: Math.max(t2.to, t2.from + 1), severity: "error", message });
  }
  expectPunct(v) {
    if (this.isPunct(v))
      return this.next();
    this.error(this.peek(), `Erwartet '${v}'`);
    return this.peek();
  }
  parseProgram() {
    const body = [];
    while (!this.atEof()) {
      const before = this.pos;
      const stmt = this.parseStatement();
      if (stmt)
        body.push(stmt);
      if (this.pos === before)
        this.next();
    }
    return {
      program: { kind: "Program", body, from: 0, to: this.srcLen },
      diagnostics: this.diagnostics
    };
  }
  // ── Statements ──
  parseStatement() {
    if (this.isPunct(";")) {
      this.next();
      return null;
    }
    if (this.isKeyword("var"))
      return this.parseVarDecl();
    if (this.isKeyword("if"))
      return this.parseIf();
    if (this.isKeyword("repeat"))
      return this.parseRepeat();
    if (this.isKeyword("while"))
      return this.parseWhile();
    if (this.isKeyword("effectActive") || this.isKeyword("untilNextTurn"))
      return this.parseLifecycle();
    if (this.isKeyword("grantSkill"))
      return this.parseGrantSkill();
    if (this.isKeyword("giveStatus"))
      return this.parseGiveStatus();
    if (this.isKeyword("onTrigger"))
      return this.parseTrigger();
    if (this.isKeyword("action"))
      return this.parseActionDecl();
    if (this.isPunct("{"))
      return this.parseBlock();
    return this.parseAssignOrExpr();
  }
  parseVarDecl() {
    const kw = this.next();
    const nameTok = this.peek();
    if (nameTok.type !== "identifier") {
      this.error(nameTok, "Variablenname erwartet");
    } else
      this.next();
    this.expectPunct("=");
    const value = this.parseExpr();
    this.consumeOptionalSemicolon();
    return {
      kind: "VarDecl",
      name: nameTok.value,
      nameSpan: { from: nameTok.from, to: nameTok.to },
      value,
      from: kw.from,
      to: value.to
    };
  }
  parseIf() {
    const kw = this.next();
    this.expectPunct("(");
    const test = this.parseExpr();
    this.expectPunct(")");
    const then = this.parseBlock();
    let elseBranch;
    if (this.isKeyword("else")) {
      this.next();
      elseBranch = this.isKeyword("if") ? this.parseIf() : this.parseBlock();
    }
    return { kind: "If", test, then, else: elseBranch, from: kw.from, to: (elseBranch ?? then).to };
  }
  parseRepeat() {
    const kw = this.next();
    this.expectPunct("(");
    const count = this.parseExpr();
    this.expectPunct(")");
    const body = this.parseBlock();
    return { kind: "Repeat", keywordSpan: { from: kw.from, to: kw.to }, count, body, from: kw.from, to: body.to };
  }
  parseWhile() {
    const kw = this.next();
    this.expectPunct("(");
    const test = this.parseExpr();
    this.expectPunct(")");
    const body = this.parseBlock();
    return { kind: "While", keywordSpan: { from: kw.from, to: kw.to }, test, body, from: kw.from, to: body.to };
  }
  parseLifecycle() {
    const kw = this.next();
    const body = this.parseBlock();
    return {
      kind: "Lifecycle",
      lifecycle: kw.value === "untilNextTurn" ? "untilNextTurn" : "effectActive",
      keywordSpan: { from: kw.from, to: kw.to },
      body,
      from: kw.from,
      to: body.to
    };
  }
  parseGrantSkill() {
    const kw = this.next();
    this.expectPunct("(");
    const args = this.parseArgList();
    this.expectPunct(")");
    const body = this.parseBlock();
    return { kind: "GrantSkill", keywordSpan: { from: kw.from, to: kw.to }, args, body, from: kw.from, to: body.to };
  }
  parseGiveStatus() {
    const kw = this.next();
    this.expectPunct("(");
    const args = this.parseArgList();
    this.expectPunct(")");
    const body = this.parseBlock();
    return { kind: "GiveStatus", keywordSpan: { from: kw.from, to: kw.to }, args, body, from: kw.from, to: body.to };
  }
  parseTrigger() {
    const kw = this.next();
    this.expectPunct("(");
    const nameTok = this.peek();
    let name2 = "";
    if (nameTok.type === "string" || nameTok.type === "identifier") {
      name2 = nameTok.value;
      this.next();
    } else
      this.error(nameTok, "Trigger-Name erwartet (Text oder Bezeichner)");
    this.expectPunct(")");
    const body = this.parseBlock();
    return {
      kind: "TriggerDecl",
      name: name2,
      nameSpan: { from: nameTok.from, to: nameTok.to },
      keywordSpan: { from: kw.from, to: kw.to },
      body,
      from: kw.from,
      to: body.to
    };
  }
  parseActionDecl() {
    const kw = this.next();
    const nameTok = this.peek();
    if (nameTok.type !== "identifier")
      this.error(nameTok, "Aktionsname erwartet");
    else
      this.next();
    const body = this.parseBlock();
    return {
      kind: "ActionDecl",
      name: nameTok.value,
      nameSpan: { from: nameTok.from, to: nameTok.to },
      body,
      from: kw.from,
      to: body.to
    };
  }
  parseBlock() {
    const open = this.expectPunct("{");
    const body = [];
    while (!this.atEof() && !this.isPunct("}")) {
      const before = this.pos;
      const stmt = this.parseStatement();
      if (stmt)
        body.push(stmt);
      if (this.pos === before)
        this.next();
    }
    const close = this.expectPunct("}");
    return { kind: "Block", body, from: open.from, to: close.to };
  }
  parseAssignOrExpr() {
    const expr = this.parseExpr();
    if (this.peek().type === "punct" && ASSIGN_OPS.has(this.peek().value)) {
      const opTok = this.next();
      const value = this.parseExpr();
      this.consumeOptionalSemicolon();
      if (expr.kind !== "Identifier" && expr.kind !== "Member") {
        this.error(opTok, "Ung\xFCltiges Zuweisungsziel");
      }
      return {
        kind: "Assign",
        target: expr,
        op: opTok.value,
        value,
        from: expr.from,
        to: value.to
      };
    }
    this.consumeOptionalSemicolon();
    return { kind: "ExprStmt", expr, from: expr.from, to: expr.to };
  }
  consumeOptionalSemicolon() {
    if (this.isPunct(";"))
      this.next();
  }
  // ── Expressions (precedence climbing) ──
  parseExpr() {
    return this.parseLogicalOr();
  }
  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    while (this.isPunct("||")) {
      const op = this.next().value;
      const right = this.parseLogicalAnd();
      left = { kind: "Logical", op, left, right, from: left.from, to: right.to };
    }
    return left;
  }
  parseLogicalAnd() {
    let left = this.parseEquality();
    while (this.isPunct("&&")) {
      const op = this.next().value;
      const right = this.parseEquality();
      left = { kind: "Logical", op, left, right, from: left.from, to: right.to };
    }
    return left;
  }
  parseEquality() {
    let left = this.parseComparison();
    while (this.isPunct("==") || this.isPunct("!=")) {
      const op = this.next().value;
      const right = this.parseComparison();
      left = { kind: "Binary", op, left, right, from: left.from, to: right.to };
    }
    return left;
  }
  parseComparison() {
    let left = this.parseAddition();
    while (this.isPunct("<") || this.isPunct(">") || this.isPunct("<=") || this.isPunct(">=")) {
      const op = this.next().value;
      const right = this.parseAddition();
      left = { kind: "Binary", op, left, right, from: left.from, to: right.to };
    }
    return left;
  }
  parseAddition() {
    let left = this.parseMultiplication();
    while (this.isPunct("+") || this.isPunct("-")) {
      const op = this.next().value;
      const right = this.parseMultiplication();
      left = { kind: "Binary", op, left, right, from: left.from, to: right.to };
    }
    return left;
  }
  parseMultiplication() {
    let left = this.parseUnary();
    while (this.isPunct("*") || this.isPunct("/") || this.isPunct("%")) {
      const op = this.next().value;
      const right = this.parseUnary();
      left = { kind: "Binary", op, left, right, from: left.from, to: right.to };
    }
    return left;
  }
  parseUnary() {
    if (this.isPunct("-") || this.isPunct("!")) {
      const opTok = this.next();
      const operand = this.parseUnary();
      return { kind: "Unary", op: opTok.value, operand, from: opTok.from, to: operand.to };
    }
    return this.parsePostfix();
  }
  parsePostfix() {
    let expr = this.parsePrimary();
    for (; ; ) {
      if (this.isPunct("(") && expr.kind === "Identifier") {
        this.next();
        const args = this.parseArgList();
        const close = this.expectPunct(")");
        const call = { kind: "Call", callee: expr, args, from: expr.from, to: close.to };
        expr = call;
      } else if (this.isPunct(".")) {
        this.next();
        const propTok = this.peek();
        if (propTok.type !== "identifier") {
          this.error(propTok, "Eigenschaftsname erwartet");
          break;
        }
        this.next();
        const member = {
          kind: "Member",
          object: expr,
          property: propTok.value,
          propertySpan: { from: propTok.from, to: propTok.to },
          from: expr.from,
          to: propTok.to
        };
        expr = member;
      } else {
        break;
      }
    }
    return expr;
  }
  parseArgList() {
    const args = [];
    if (this.isPunct(")"))
      return args;
    args.push(this.parseExpr());
    while (this.isPunct(",")) {
      this.next();
      if (this.isPunct(")"))
        break;
      args.push(this.parseExpr());
    }
    return args;
  }
  parsePrimary() {
    const t2 = this.peek();
    switch (t2.type) {
      case "number":
        this.next();
        return { kind: "Number", value: parseFloat(t2.value), from: t2.from, to: t2.to };
      case "dice":
        this.next();
        return { kind: "Dice", count: t2.diceCount ?? 0, sides: t2.diceSides ?? 0, from: t2.from, to: t2.to };
      case "string":
        this.next();
        return { kind: "String", value: t2.value, from: t2.from, to: t2.to };
      case "identifier":
        this.next();
        return { kind: "Identifier", name: t2.value, from: t2.from, to: t2.to };
      case "keyword":
        if (t2.value === "true" || t2.value === "false") {
          this.next();
          return { kind: "Bool", value: t2.value === "true", from: t2.from, to: t2.to };
        }
        this.error(t2, `Unerwartetes Schl\xFCsselwort '${t2.value}'`);
        return { kind: "Number", value: 0, from: t2.from, to: t2.to };
      case "punct":
        if (t2.value === "(") {
          this.next();
          const e = this.parseExpr();
          this.expectPunct(")");
          return e;
        }
        this.error(t2, `Unerwartetes Zeichen '${t2.value}'`);
        return { kind: "Number", value: 0, from: t2.from, to: t2.to };
      default:
        this.error(t2, "Ausdruck erwartet");
        return { kind: "Number", value: 0, from: t2.from, to: t2.to };
    }
  }
};

// src/app/scripting/checker.ts
function compileScript(src) {
  const { program, diagnostics } = parse(src);
  new Checker(diagnostics).checkProgram(program);
  const ok = !diagnostics.some((d) => d.severity === "error");
  return { program, diagnostics, ok };
}
var Scope = class {
  parent;
  vars = /* @__PURE__ */ new Set();
  actions = /* @__PURE__ */ new Set();
  constructor(parent) {
    this.parent = parent;
  }
  hasVar(name2) {
    return this.vars.has(name2) || (this.parent?.hasVar(name2) ?? false);
  }
  hasAction(name2) {
    return this.actions.has(name2) || (this.parent?.hasAction(name2) ?? false);
  }
};
var IMPURE_IN_EFFECT_ACTIVE = /* @__PURE__ */ new Set([
  "display",
  "stat",
  "banner",
  "box",
  "loseResource",
  "gainResource",
  "applyStatus",
  "removeStatus",
  "roll"
]);
var Checker = class {
  diagnostics;
  /** Depth of enclosing effectActive blocks (a grantSkill body resets it to 0). */
  lifecycleDepth = 0;
  /** True only while checking statements directly at program top level. */
  atTopLevel = false;
  constructor(diagnostics) {
    this.diagnostics = diagnostics;
  }
  err(from, to, message) {
    this.diagnostics.push({ from, to: Math.max(to, from + 1), severity: "error", message });
  }
  warn(from, to, message) {
    this.diagnostics.push({ from, to: Math.max(to, from + 1), severity: "warning", message });
  }
  checkProgram(program) {
    const scope = new Scope(null);
    for (const s of program.body)
      if (s.kind === "ActionDecl")
        scope.actions.add(s.name);
    this.atTopLevel = true;
    for (const s of program.body)
      this.checkStmt(s, scope);
    this.atTopLevel = false;
  }
  checkBlock(block, parent, freshLifecycle) {
    const scope = new Scope(parent);
    for (const s of block.body)
      if (s.kind === "ActionDecl")
        scope.actions.add(s.name);
    const savedLifecycle = this.lifecycleDepth;
    const savedTop = this.atTopLevel;
    this.atTopLevel = false;
    if (freshLifecycle !== void 0)
      this.lifecycleDepth = freshLifecycle;
    for (const s of block.body)
      this.checkStmt(s, scope);
    this.lifecycleDepth = savedLifecycle;
    this.atTopLevel = savedTop;
  }
  checkStmt(stmt, scope) {
    switch (stmt.kind) {
      case "VarDecl":
        this.checkExpr(stmt.value, scope);
        scope.vars.add(stmt.name);
        break;
      case "Assign":
        this.checkAssign(stmt, scope);
        break;
      case "ExprStmt":
        this.checkExpr(stmt.expr, scope);
        break;
      case "If":
        this.checkExpr(stmt.test, scope);
        this.checkBlock(stmt.then, scope);
        if (stmt.else) {
          if (stmt.else.kind === "Block")
            this.checkBlock(stmt.else, scope);
          else
            this.checkStmt(stmt.else, scope);
        }
        break;
      case "Block":
        this.checkBlock(stmt, scope);
        break;
      case "Repeat":
        this.checkExpr(stmt.count, scope);
        this.checkBlock(stmt.body, scope);
        break;
      case "While":
        this.checkExpr(stmt.test, scope);
        this.checkBlock(stmt.body, scope);
        break;
      case "Lifecycle":
        this.checkBlock(stmt.body, scope, this.lifecycleDepth + 1);
        break;
      case "GrantSkill":
        if (this.lifecycleDepth === 0) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to, "'grantSkill' ist nur in 'effectActive { \u2026 }' erlaubt (sonst Skill-Leak). So verschwindet die F\xE4higkeit, sobald der Effekt endet.");
        }
        if (stmt.args.length === 0) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to, "grantSkill(Name, Beschreibung?, Aktionstyp?, Mana?, Ausdauer?, Leben?) { \u2026 }");
        }
        stmt.args.forEach((arg, i) => {
          if (i === 2) {
            if (arg.kind !== "Identifier" || !ACTION_TYPE_NAMES.has(arg.name)) {
              this.err(arg.from, arg.to, `Aktionstyp erwartet: ${[...ACTION_TYPE_NAMES].join(", ")}`);
            }
            return;
          }
          this.checkExpr(arg, scope);
        });
        this.checkBlock(stmt.body, scope, 0);
        break;
      case "GiveStatus":
        if (stmt.args.length < 1) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to, "giveStatus(Name, Beschreibung?, Stapel?, Dauer?, Icon?, buff/debuff?) { \u2026 }");
        }
        stmt.args.forEach((arg, i) => {
          if (i === 5) {
            if (arg.kind !== "Identifier" || !POLARITY_NAMES.has(arg.name)) {
              this.err(arg.from, arg.to, `Erwartet: ${[...POLARITY_NAMES].join(" oder ")}`);
            }
            return;
          }
          this.checkExpr(arg, scope);
        });
        this.checkBlock(stmt.body, scope, 0);
        break;
      case "TriggerDecl":
        if (!this.atTopLevel) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to, "'onTrigger' ist nur auf oberster Ebene erlaubt (nicht verschachtelt).");
        }
        if (!stmt.name) {
          this.err(stmt.keywordSpan.from, stmt.keywordSpan.to, "onTrigger braucht einen Namen.");
        }
        this.checkBlock(stmt.body, scope, 0);
        break;
      case "ActionDecl":
        this.checkBlock(stmt.body, scope, 0);
        break;
    }
  }
  checkAssign(stmt, scope) {
    this.checkExpr(stmt.value, scope);
    const target = stmt.target;
    if (target.kind === "Member") {
      this.err(target.from, target.to, "Zuweisung an Eigenschaften ist nicht erlaubt (nur lesen).");
      return;
    }
    const name2 = target.name;
    if (scope.hasVar(name2))
      return;
    const sym = SYMBOL_MAP.get(name2);
    if (!sym) {
      this.err(target.from, target.to, `Unbekanntes Symbol '${name2}'. Deklariere lokale Variablen mit 'var'.`);
      return;
    }
    if (!sym.assignable) {
      const hint = sym.category === "resource" ? " Nutze loseResource()/gainResource()." : "";
      this.err(target.from, target.to, `'${name2}' ist schreibgesch\xFCtzt und kann nicht zugewiesen werden.${hint}`);
      return;
    }
    if (this.lifecycleDepth === 0) {
      this.err(stmt.from, stmt.to, `Direkte \xC4nderung von '${name2}' ist nicht erlaubt (Stat-Leak). Verwende 'effectActive { ${name2} += \u2026 }' \u2014 der Modifikator gilt, solange der Effekt aktiv ist.`);
    }
  }
  checkExpr(expr, scope) {
    switch (expr.kind) {
      case "Number":
      case "String":
      case "Bool":
        break;
      case "Dice":
        if (expr.count <= 0 || expr.sides <= 0)
          this.warn(expr.from, expr.to, "W\xFCrfel ohne Wirkung");
        if (this.lifecycleDepth > 0) {
          this.err(expr.from, expr.to, "W\xFCrfel sind in effectActive nicht erlaubt (muss deterministisch sein).");
        }
        break;
      case "Identifier": {
        const name2 = expr.name;
        if (scope.hasVar(name2) || scope.hasAction(name2))
          break;
        const sym = SYMBOL_MAP.get(name2);
        if (sym) {
          if (sym.category === "namespace") {
            this.err(expr.from, expr.to, `'${name2}' muss mit einer Eigenschaft verwendet werden, z.B. ${name2}.athletik`);
          }
          break;
        }
        if (BUILTIN_MAP.has(name2)) {
          this.err(expr.from, expr.to, `Funktion '${name2}' muss aufgerufen werden: ${name2}(\u2026)`);
          break;
        }
        this.err(expr.from, expr.to, `Unbekanntes Symbol '${name2}'`);
        break;
      }
      case "Member":
        this.checkMember(expr, scope);
        break;
      case "Unary":
        this.checkExpr(expr.operand, scope);
        break;
      case "Binary":
      case "Logical":
        this.checkExpr(expr.left, scope);
        this.checkExpr(expr.right, scope);
        break;
      case "Call":
        this.checkCall(expr, scope);
        break;
    }
  }
  checkMember(expr, scope) {
    const obj = expr.object;
    if (obj.kind === "Identifier") {
      if (obj.name === "talent") {
        if (!TALENT_IDS.has(expr.property)) {
          this.err(expr.propertySpan.from, expr.propertySpan.to, `Unbekanntes Talent '${expr.property}'`);
        }
        return;
      }
      const sym = SYMBOL_MAP.get(obj.name);
      if (sym && sym.category === "attribute") {
        if (!ATTRIBUTE_MEMBERS[expr.property]) {
          this.err(expr.propertySpan.from, expr.propertySpan.to, `Unbekannte Eigenschaft '${expr.property}' (erlaubt: ${Object.keys(ATTRIBUTE_MEMBERS).join(", ")})`);
        }
        return;
      }
    }
    this.err(expr.from, expr.to, "Nicht unterst\xFCtzter Eigenschaftszugriff");
  }
  checkCall(expr, scope) {
    const name2 = expr.callee.name;
    if (scope.hasAction(name2)) {
      if (expr.args.length > 0)
        this.err(expr.from, expr.to, `Aktion '${name2}' nimmt keine Argumente`);
      return;
    }
    const fn = BUILTIN_MAP.get(name2);
    if (!fn) {
      this.err(expr.callee.from, expr.callee.to, `Unbekannte Funktion '${name2}'`);
      for (const a of expr.args)
        this.checkExpr(a, scope);
      return;
    }
    if (this.lifecycleDepth > 0 && IMPURE_IN_EFFECT_ACTIVE.has(name2)) {
      this.err(expr.callee.from, expr.callee.to, `'${name2}' ist in effectActive nicht erlaubt. Hier sind nur Stat-Zuweisungen (speed += 2, speed *= 2, \u2026), grantSkill und reine Berechnungen erlaubt.`);
    }
    if (expr.args.length < fn.minArgs || expr.args.length > fn.maxArgs) {
      this.err(expr.from, expr.to, `'${name2}' erwartet ${fn.signature}`);
    }
    if (fn.resourceFirstArg && expr.args.length >= 1) {
      const first = expr.args[0];
      if (first.kind !== "Identifier" || !RESOURCE_NAMES.has(first.name)) {
        this.err(first.from, first.to, `Erwartet eine Ressource: ${[...RESOURCE_NAMES].join(", ")}`);
      }
    }
    if (fn.styleArgIndex !== void 0 && expr.args.length > fn.styleArgIndex) {
      const styleArg = expr.args[fn.styleArgIndex];
      if (styleArg.kind !== "Identifier" || !STYLE_NAMES.has(styleArg.name)) {
        this.err(styleArg.from, styleArg.to, `Stil erwartet: ${[...STYLE_NAMES].join(", ")}`);
      }
    }
    for (let k = 0; k < expr.args.length; k++) {
      if (fn.resourceFirstArg && k === 0)
        continue;
      if (fn.styleArgIndex === k)
        continue;
      this.checkExpr(expr.args[k], scope);
    }
  }
};

// src/app/scripting/dice.ts
function rollDice(count, sides, rng = Math.random) {
  const c = Math.max(0, Math.min(1e3, Math.floor(count)));
  const s = Math.max(1, Math.min(1e3, Math.floor(sides)));
  const rolls = [];
  let total = 0;
  for (let k = 0; k < c; k++) {
    const r = Math.floor(rng() * s) + 1;
    rolls.push(r);
    total += r;
  }
  return { count: c, sides: s, rolls, total, formula: `${c}d${s}` };
}

// src/app/scripting/interpreter.ts
function opFromAssign(op) {
  switch (op) {
    case "=":
      return "set";
    case "+=":
      return "add";
    case "-=":
      return "sub";
    case "*=":
      return "mul";
    case "/=":
      return "div";
  }
}
var ScriptError = class extends Error {
};
function runScript(src, ctx, opts = {}) {
  const result = {
    ok: false,
    displays: [],
    rolls: [],
    resourceChanges: [],
    modifiers: [],
    grantedSkills: [],
    statusOps: [],
    givenStatuses: [],
    errors: []
  };
  const compiled = compileScript(src);
  if (!compiled.ok) {
    result.errors = compiled.diagnostics.filter((d) => d.severity === "error").map((d) => d.message);
    return result;
  }
  try {
    new Interpreter(src, ctx, result, !!opts.collect, opts.trigger ?? null).runProgram(compiled.program);
    result.ok = true;
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e));
  }
  return result;
}
function listTriggers(src) {
  const out = [];
  for (const s of compileScript(src).program.body) {
    if (s.kind === "TriggerDecl" && s.name)
      out.push({ name: s.name });
  }
  return out;
}
function hasBaseAction(src) {
  return compileScript(src).program.body.some((s) => s.kind !== "TriggerDecl" && s.kind !== "Lifecycle");
}
var Interpreter = class _Interpreter {
  src;
  ctx;
  result;
  collect;
  triggerName;
  rng;
  /** True while executing an effectActive block (so stat assignments become modifiers). */
  inEffectActive = false;
  /** Per-loop cap and a global iteration budget to prevent runaway scripts. */
  LOOP_CAP = 1e4;
  TOTAL_BUDGET = 2e5;
  totalIterations = 0;
  /**
   * Two execution modes:
   *  - trigger (collect=false): the effect just fired. Run top-level side effects (dice,
   *    display, resource changes). `effectActive` blocks are skipped — they are continuous,
   *    not one-shot.
   *  - collect (collect=true): derive the effect's continuous contribution. Side-effect
   *    built-ins are no-ops and dice are deterministic; only `effectActive` blocks do work,
   *    yielding stat modifiers + granted skills.
   */
  constructor(src, ctx, result, collect, triggerName) {
    this.src = src;
    this.ctx = ctx;
    this.result = result;
    this.collect = collect;
    this.triggerName = triggerName;
    this.rng = ctx.rng ?? Math.random;
  }
  tick() {
    if (++this.totalIterations > this.TOTAL_BUDGET) {
      throw new ScriptError("Iterationslimit \xFCberschritten");
    }
  }
  runProgram(program) {
    const frame = { vars: /* @__PURE__ */ new Map(), parent: null };
    if (this.triggerName !== null) {
      for (const s of program.body) {
        if (s.kind === "TriggerDecl" && s.name === this.triggerName)
          this.execBlock(s.body, frame);
      }
      return;
    }
    for (const s of program.body)
      this.execStmt(s, frame);
  }
  // ── Statements ──
  execStmt(stmt, frame) {
    switch (stmt.kind) {
      case "VarDecl":
        frame.vars.set(stmt.name, this.evalExpr(stmt.value, frame));
        break;
      case "Assign":
        this.execAssign(stmt, frame);
        break;
      case "ExprStmt":
        this.evalExpr(stmt.expr, frame);
        break;
      case "If":
        if (truthy(this.evalExpr(stmt.test, frame)))
          this.execBlock(stmt.then, frame);
        else if (stmt.else) {
          if (stmt.else.kind === "Block")
            this.execBlock(stmt.else, frame);
          else
            this.execStmt(stmt.else, frame);
        }
        break;
      case "Block":
        this.execBlock(stmt, frame);
        break;
      case "Repeat": {
        const n = Math.max(0, Math.min(this.LOOP_CAP, Math.floor(toNum(this.evalExpr(stmt.count, frame)))));
        for (let k = 0; k < n; k++) {
          this.tick();
          this.execBlock(stmt.body, frame);
        }
        break;
      }
      case "While": {
        let guard = 0;
        while (truthy(this.evalExpr(stmt.test, frame))) {
          this.tick();
          if (++guard > this.LOOP_CAP)
            throw new ScriptError("Schleifenlimit \xFCberschritten (m\xF6gliche Endlosschleife)");
          this.execBlock(stmt.body, frame);
        }
        break;
      }
      case "Lifecycle":
        this.execLifecycle(stmt, frame);
        break;
      case "GrantSkill":
        this.execGrantSkill(stmt, frame);
        break;
      case "GiveStatus":
        this.execGiveStatus(stmt, frame);
        break;
      case "TriggerDecl":
        break;
      case "ActionDecl":
        break;
    }
  }
  execBlock(block, parent) {
    const frame = { vars: /* @__PURE__ */ new Map(), parent };
    for (const s of block.body)
      this.execStmt(s, frame);
  }
  execLifecycle(stmt, parent) {
    if (!this.collect)
      return;
    const outer = this.inEffectActive;
    this.inEffectActive = true;
    const frame = { vars: /* @__PURE__ */ new Map(), parent };
    for (const s of stmt.body.body)
      this.execStmt(s, frame);
    this.inEffectActive = outer;
  }
  execGrantSkill(stmt, frame) {
    if (!this.collect || !this.inEffectActive)
      return;
    const a = stmt.args;
    const name2 = String(this.evalExpr(a[0], frame));
    const description = a[1] ? String(this.evalExpr(a[1], frame)) : "";
    const actionType = a[2]?.kind === "Identifier" ? ACTION_TYPE_MAP[a[2].name] : void 0;
    const manaCost = a[3] ? toNum(this.evalExpr(a[3], frame)) : 0;
    const energyCost = a[4] ? toNum(this.evalExpr(a[4], frame)) : 0;
    const lifeCost = a[5] ? toNum(this.evalExpr(a[5], frame)) : 0;
    const script = this.src.slice(stmt.body.from + 1, stmt.body.to - 1).trim();
    this.result.grantedSkills.push({ name: name2, description, actionType, manaCost, energyCost, lifeCost, script });
  }
  execGiveStatus(stmt, frame) {
    if (this.collect)
      return;
    const a = stmt.args;
    const name2 = String(this.evalExpr(a[0], frame));
    const description = a[1] ? String(this.evalExpr(a[1], frame)) : "";
    const stacks = a[2] ? Math.max(1, Math.floor(toNum(this.evalExpr(a[2], frame)))) : 1;
    const duration = a[3] ? toNum(this.evalExpr(a[3], frame)) : void 0;
    const icon = a[4] ? String(this.evalExpr(a[4], frame)) : void 0;
    const isDebuff = a[5]?.kind === "Identifier" ? a[5].name === "debuff" : true;
    const script = this.src.slice(stmt.body.from + 1, stmt.body.to - 1).trim();
    this.result.givenStatuses.push({ name: name2, description, stacks, duration, icon, isDebuff, script });
  }
  execAssign(stmt, frame) {
    const rhs = this.evalExpr(stmt.value, frame);
    const target = stmt.target;
    if (target.kind !== "Identifier")
      throw new ScriptError("Ung\xFCltiges Zuweisungsziel");
    const name2 = target.name;
    const declaringFrame = this.findVarFrame(frame, name2);
    if (declaringFrame) {
      declaringFrame.vars.set(name2, this.applyAssignOp(stmt.op, declaringFrame.vars.get(name2), rhs));
      return;
    }
    const sym = SYMBOL_MAP.get(name2);
    if (sym?.assignable && sym.modifierTarget && this.inEffectActive) {
      this.result.modifiers.push({ target: sym.modifierTarget, op: opFromAssign(stmt.op), amount: toNum(rhs) });
      return;
    }
    throw new ScriptError(`'${name2}' kann hier nicht zugewiesen werden`);
  }
  applyAssignOp(op, current, rhs) {
    if (op === "=")
      return rhs;
    const a = toNum(current ?? 0);
    const b = toNum(rhs);
    switch (op) {
      case "+=":
        return typeof current === "string" || typeof rhs === "string" ? String(current ?? "") + String(rhs) : a + b;
      case "-=":
        return a - b;
      case "*=":
        return a * b;
      case "/=":
        return b === 0 ? 0 : a / b;
    }
  }
  findVarFrame(frame, name2) {
    for (let f = frame; f; f = f.parent)
      if (f.vars.has(name2))
        return f;
    return null;
  }
  // ── Expressions ──
  evalExpr(expr, frame) {
    switch (expr.kind) {
      case "Number":
        return expr.value;
      case "String":
        return expr.value;
      case "Bool":
        return expr.value;
      case "Dice":
        return this.doRoll(expr.count, expr.sides, `${expr.count}d${expr.sides}`);
      case "Identifier":
        return this.readIdentifier(expr.name, frame);
      case "Member":
        return this.readMember(expr, frame);
      case "Unary": {
        const v = this.evalExpr(expr.operand, frame);
        return expr.op === "-" ? -toNum(v) : !truthy(v);
      }
      case "Logical": {
        const l = this.evalExpr(expr.left, frame);
        if (expr.op === "&&")
          return truthy(l) ? this.evalExpr(expr.right, frame) : l;
        return truthy(l) ? l : this.evalExpr(expr.right, frame);
      }
      case "Binary":
        return this.evalBinary(expr, frame);
      case "Call":
        return this.evalCall(expr, frame);
    }
  }
  readIdentifier(name2, frame) {
    const f = this.findVarFrame(frame, name2);
    if (f)
      return f.vars.get(name2);
    if (SYMBOL_MAP.has(name2))
      return this.ctx.readScalar(name2);
    throw new ScriptError(`Unbekanntes Symbol '${name2}'`);
  }
  readMember(expr, _frame) {
    if (expr.object.kind === "Identifier") {
      if (expr.object.name === "talent")
        return this.ctx.readTalent(expr.property);
      return this.ctx.readAttributeMember(expr.object.name, expr.property);
    }
    throw new ScriptError("Nicht unterst\xFCtzter Eigenschaftszugriff");
  }
  evalBinary(expr, frame) {
    const l = this.evalExpr(expr.left, frame);
    const r = this.evalExpr(expr.right, frame);
    switch (expr.op) {
      case "+":
        return typeof l === "string" || typeof r === "string" ? String(l) + String(r) : toNum(l) + toNum(r);
      case "-":
        return toNum(l) - toNum(r);
      case "*":
        return toNum(l) * toNum(r);
      case "/":
        return toNum(r) === 0 ? 0 : toNum(l) / toNum(r);
      case "%":
        return toNum(r) === 0 ? 0 : toNum(l) % toNum(r);
      case "<":
        return toNum(l) < toNum(r);
      case ">":
        return toNum(l) > toNum(r);
      case "<=":
        return toNum(l) <= toNum(r);
      case ">=":
        return toNum(l) >= toNum(r);
      case "==":
        return l === r;
      case "!=":
        return l !== r;
    }
  }
  /** Side-effect built-ins do nothing during a collect run (only effectActive matters then). */
  static SIDE_EFFECTS = /* @__PURE__ */ new Set([
    "display",
    "stat",
    "banner",
    "box",
    "loseResource",
    "gainResource",
    "applyStatus",
    "removeStatus"
  ]);
  evalCall(expr, frame) {
    const name2 = expr.callee.name;
    const args = expr.args;
    if (this.collect && _Interpreter.SIDE_EFFECTS.has(name2)) {
      for (const a of args)
        if (a.kind !== "Identifier")
          this.evalExpr(a, frame);
      return 0;
    }
    switch (name2) {
      case "display":
        this.result.displays.push({ type: "text", text: String(this.evalExpr(args[0], frame)), style: styleOf(args[1]) });
        return 0;
      case "stat":
        this.result.displays.push({ type: "stat", label: String(this.evalExpr(args[0], frame)), value: String(this.evalExpr(args[1], frame)), style: styleOf(args[2]) });
        return 0;
      case "banner":
        this.result.displays.push({ type: "banner", text: String(this.evalExpr(args[0], frame)), style: styleOf(args[1]) });
        return 0;
      case "box":
        this.result.displays.push({ type: "box", text: String(this.evalExpr(args[0], frame)), style: styleOf(args[1]) });
        return 0;
      case "roll": {
        if (args.length === 1 && args[0].kind === "Dice") {
          return this.doRoll(args[0].count, args[0].sides, `${args[0].count}d${args[0].sides}`);
        }
        const count = toNum(this.evalExpr(args[0], frame));
        const sides = args[1] ? toNum(this.evalExpr(args[1], frame)) : 20;
        return this.doRoll(count, sides, `${Math.floor(count)}d${Math.floor(sides)}`);
      }
      case "loseResource":
      case "gainResource": {
        const res = args[0].name;
        if (!res || !RESOURCE_NAMES.has(res))
          throw new ScriptError("Unbekannte Ressource");
        const amt = toNum(this.evalExpr(args[1], frame));
        this.result.resourceChanges.push({ resource: res, amount: name2 === "loseResource" ? -amt : amt });
        return 0;
      }
      case "applyStatus":
        this.result.statusOps.push({ op: "apply", id: String(this.evalExpr(args[0], frame)), stacks: args[1] ? toNum(this.evalExpr(args[1], frame)) : 1 });
        return 0;
      case "removeStatus":
        this.result.statusOps.push({ op: "remove", id: String(this.evalExpr(args[0], frame)) });
        return 0;
      case "hasSkill":
        return this.ctx.hasSkill(String(this.evalExpr(args[0], frame)));
      case "min":
        return Math.min(...args.map((a) => toNum(this.evalExpr(a, frame))));
      case "max":
        return Math.max(...args.map((a) => toNum(this.evalExpr(a, frame))));
      case "floor":
        return Math.floor(toNum(this.evalExpr(args[0], frame)));
      case "ceil":
        return Math.ceil(toNum(this.evalExpr(args[0], frame)));
      case "round":
        return Math.round(toNum(this.evalExpr(args[0], frame)));
      case "abs":
        return Math.abs(toNum(this.evalExpr(args[0], frame)));
      default:
        throw new ScriptError(`Unbekannte Funktion '${name2}'`);
    }
  }
  doRoll(count, sides, formula) {
    if (this.collect) {
      const c = Math.max(0, Math.floor(count)), s = Math.max(0, Math.floor(sides));
      return Math.round(c * (s + 1) / 2);
    }
    const roll = rollDice(count, sides, this.rng);
    this.result.rolls.push({ name: formula, formula: roll.formula, rolls: roll.rolls, total: roll.total });
    return roll.total;
  }
};
function toNum(v) {
  if (typeof v === "number")
    return v;
  if (typeof v === "boolean")
    return v ? 1 : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
function truthy(v) {
  if (typeof v === "boolean")
    return v;
  if (typeof v === "number")
    return v !== 0;
  if (typeof v === "string")
    return v.length > 0;
  return false;
}
function styleOf(arg) {
  if (arg && arg.kind === "Identifier" && (arg.name === "good" || arg.name === "bad" || arg.name === "info" || arg.name === "neutral")) {
    return arg.name;
  }
  return "neutral";
}

// src/app/services/true-stats.service.ts
var EMPTY_DERIVED = { fp: "", mods: [], skills: [] };
function applyOp(acc, op, amount) {
  switch (op) {
    case "add":
      return acc + amount;
    case "sub":
      return acc - amount;
    case "mul":
      return acc * amount;
    case "div":
      return amount === 0 ? acc : acc / amount;
    case "set":
      return amount;
  }
}
var TrueStatsService = class _TrueStatsService {
  libraryStore = inject(LibraryStoreService);
  // ── effectActive pipeline ──────────────────────────────────────────────────
  // Active effects can carry an `effectActive { … }` script whose stat assignments become
  // ordered modifiers (add/sub/mul/div/set) applied on top of the core value, and whose
  // grantSkill(s) become effect-bound derived skills. Nothing is ever mutated: stats are
  // recomputed from the core + the currently-active effects, so removing an effect makes its
  // contribution vanish automatically. Modifiers are applied in ascending effect `priority`.
  /** Guards against recursion: while collecting, calculators return their pre-pipeline value. */
  collectingEffectActive = false;
  /** Per-sheet memo of derived modifiers/skills, keyed by a cheap fingerprint of the effects. */
  derivedCache = /* @__PURE__ */ new WeakMap();
  /** Bumped to force all derived caches to recompute (e.g. after a library effect is edited). */
  cacheVersion = 0;
  /** Invalidate every sheet's effectActive cache — call after a library effect definition changes. */
  bumpDerivedCache() {
    this.cacheVersion++;
  }
  /** Ordered stat modifiers derived from all active `effectActive` blocks (cached). */
  getEffectActiveModifiers(sheet) {
    return this.getDerived(sheet).mods;
  }
  /** Effect-bound skills granted by active `effectActive` blocks (cached). */
  getDerivedSkills(sheet) {
    return this.getDerived(sheet).skills;
  }
  /** Derived skills as usable SkillBlocks (read-only, effect-bound). Shared by all skill lists. */
  getDerivedSkillBlocks(sheet) {
    return this.getDerivedSkills(sheet).map((g) => ({
      name: g.name,
      class: `Effekt: ${g.source}`,
      description: g.description || "Effektgebundene F\xE4higkeit",
      type: "active",
      enlightened: false,
      script: g.script,
      derived: true,
      actionType: g.actionType,
      cost: g.manaCost ? { type: "mana", amount: g.manaCost } : g.energyCost ? { type: "energy", amount: g.energyCost } : g.lifeCost ? { type: "life", amount: g.lifeCost } : void 0
    }));
  }
  // ── Item-granted abilities ──────────────────────────────────────────────────
  // Items can carry embedded skills/spells (item editor). They were stored but never surfaced
  // anywhere, so an enchanted sword's ability never reached the Fähigkeiten/Zauber tabs. Like
  // effect-granted skills these are DERIVED (never written into sheet.skills): unequip the item
  // and they vanish on their own.
  /** Equipped, non-lost items — the only ones whose abilities count. */
  grantingItems(sheet) {
    return (sheet.equipment ?? []).filter((i) => i && !i.lost);
  }
  /** Skills granted by equipped items, tagged read-only and labelled with the item name. */
  getItemSkillBlocks(sheet) {
    const out = [];
    for (const item of this.grantingItems(sheet)) {
      for (const skill of item.embeddedSkills ?? []) {
        out.push(__spreadProps(__spreadValues({}, skill), {
          class: skill.class || `Gegenstand: ${item.name}`,
          skillSource: skill.skillSource ?? "custom",
          isItemBased: true,
          derived: true
        }));
      }
    }
    return out;
  }
  /** Spells granted by equipped items, tagged read-only and labelled with the item name. */
  getItemSpellBlocks(sheet) {
    const out = [];
    for (const item of this.grantingItems(sheet)) {
      for (const spell of item.embeddedSpells ?? []) {
        out.push(__spreadProps(__spreadValues({}, spell), { itemOrigin: item.name, derived: true }));
      }
    }
    return out;
  }
  getDerived(sheet) {
    if (this.collectingEffectActive)
      return EMPTY_DERIVED;
    const fp = this.effectFingerprint(sheet);
    const cached = this.derivedCache.get(sheet);
    if (cached && cached.fp === fp)
      return cached;
    const { mods, skills } = this.collectEffectActive(sheet);
    const entry = { fp, mods, skills };
    this.derivedCache.set(sheet, entry);
    return entry;
  }
  /** Invalidation key: which effects are active, their stacks/duration/level, and the RESOLVED
   * script + priority of each (so library effects, per-instance overrides, and effects whose
   * definition resolves only after the library finishes loading all re-derive correctly). */
  effectFingerprint(sheet) {
    let s = `V${this.cacheVersion}L${sheet.level ?? 1}`;
    for (const e of sheet.activeStatusEffects ?? []) {
      const eff = this.resolveStatusEffect(e.statusEffectId, e.customEffect);
      s += `|${e.statusEffectId}:${e.stacks ?? 1}:${e.duration ?? ""}#${eff?.priority ?? 0}#${eff?.script ?? ""}`;
    }
    const activeNames = sheet.activeSkillNames ?? [];
    for (const skill of sheet.skills ?? []) {
      if (skill.script && (skill.type === "passive" || activeNames.includes(skill.name))) {
        s += `|SK:${skill.name}#${skill.script}`;
      }
    }
    const activeSpells = (sheet.castingSpells ?? []).filter((c) => (c.remainingCast ?? 1) <= 0).map((c) => c.spellName);
    for (const spell of sheet.spells ?? []) {
      if (spell.script && activeSpells.includes(spell.name))
        s += `|SP:${spell.name}#${spell.script}`;
    }
    return s;
  }
  collectEffectActive(sheet) {
    const mods = [];
    const skills = [];
    this.collectingEffectActive = true;
    try {
      for (const active of sheet.activeStatusEffects ?? []) {
        const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        const src = effect?.script;
        if (!src || !src.includes("effectActive") && !src.includes("untilNextTurn"))
          continue;
        const ctx = createPlayerContext(sheet, this, {
          inCombat: true,
          stacks: active.stacks || 1,
          turn: 0,
          duration: active.duration ?? 0,
          effectStrength: effect?.strength ?? 0,
          rng: Math.random
        });
        const res = runScript(src, ctx, { collect: true });
        const priority = effect?.priority ?? 0;
        const source = active.customName ?? effect?.name ?? active.statusEffectId;
        for (const m of res.modifiers)
          mods.push(__spreadProps(__spreadValues({}, m), { priority, source }));
        for (const g of res.grantedSkills)
          skills.push(__spreadProps(__spreadValues({}, g), { source }));
      }
      const runCollect = (src, source) => {
        if (!src.includes("effectActive") && !src.includes("untilNextTurn"))
          return;
        const ctx = createPlayerContext(sheet, this, {
          inCombat: true,
          stacks: 1,
          turn: 0,
          duration: 0,
          effectStrength: 0,
          rng: Math.random
        });
        const res = runScript(src, ctx, { collect: true });
        for (const m of res.modifiers)
          mods.push(__spreadProps(__spreadValues({}, m), { priority: 0, source }));
        for (const g of res.grantedSkills)
          skills.push(__spreadProps(__spreadValues({}, g), { source }));
      };
      const activeNames = sheet.activeSkillNames ?? [];
      for (const skill of sheet.skills ?? []) {
        if (!skill.script)
          continue;
        if (skill.type === "passive" || activeNames.includes(skill.name))
          runCollect(skill.script, skill.name);
      }
      const activeSpells = new Set((sheet.castingSpells ?? []).filter((c) => (c.remainingCast ?? 1) <= 0).map((c) => c.spellName));
      for (const spell of sheet.spells ?? []) {
        if (spell.script && activeSpells.has(spell.name))
          runCollect(spell.script, spell.name);
      }
    } finally {
      this.collectingEffectActive = false;
    }
    return { mods, skills };
  }
  /** Apply the derived modifiers for `target` (sorted by priority) on top of `base`. */
  applyEffectPipeline(sheet, target, base2) {
    if (this.collectingEffectActive)
      return base2;
    const mods = this.getEffectActiveModifiers(sheet);
    if (mods.length === 0)
      return base2;
    const relevant = mods.map((m, i) => ({ m, i })).filter((x) => x.m.target === target).sort((a, b) => a.m.priority - b.m.priority || a.i - b.i);
    let acc = base2;
    for (const { m } of relevant)
      acc = applyOp(acc, m.op, m.amount);
    return acc;
  }
  /**
   * Additive modifiers for a DERIVED target (bewegung/grundbonus/reaktion/armor*) from skills
   * (× skill level) and equipped items. Base attributes are handled by calculateEffectBonus;
   * without this, a skill or item could only ever buff a base stat, never movement et al.
   *
   * Skill/item modifiers spell some targets differently than StatusModifierTarget
   * ('movement' → 'bewegung', 'focus' → 'fokus'), so they are normalised here.
   */
  getSkillItemModifierTotal(sheet, target) {
    const normalise = (stat) => stat === "movement" ? "bewegung" : stat === "focus" ? "fokus" : stat;
    let total = 0;
    for (const skill of sheet.skills ?? []) {
      for (const mod of skill.statModifiers ?? []) {
        if (normalise(mod.stat) === target)
          total += mod.amount * (skill.level || 1);
      }
    }
    for (const item of sheet.equipment ?? []) {
      for (const mod of item.statModifiers ?? []) {
        if (normalise(mod.stat) === target)
          total += mod.amount;
      }
    }
    return total;
  }
  /** Static modifiers for a derived target (status + skills + items), then the effectActive pipeline. */
  /** Additive modifiers for a derived target (status effects + skills + items). NO pipeline. */
  statusTargetTotal(sheet, target) {
    return this.getStatusModifierTotal(sheet, target) + this.getSkillItemModifierTotal(sheet, target);
  }
  /**
   * Final value of a derived stat: the caller's own base, plus the additive modifiers, and THEN the
   * ordered effectActive pipeline (`=`, `*=`, `/=` …) on the complete number.
   *
   * The pipeline used to run on the modifier subtotal alone, which was then added to the base —
   * so `effectActive { movespeed = 30 }` set the *modifier* to 30 and yielded base + 30 instead of
   * 30, and `*= 2` doubled a subtotal that is usually 0, doing nothing at all.
   */
  derivedTotal(sheet, target, base2) {
    return this.applyEffectPipeline(sheet, target, base2 + this.statusTargetTotal(sheet, target));
  }
  /**
   * Defensive stability (used to mitigate incoming damage on the DEFENDER). Base is the sum of
   * equipped items' stability ÷ 5; status effects, skills and effectActive scripts can modify
   * the 'stability' target on top, so macros affect it. Never negative.
   */
  calculateTotalStability(sheet) {
    const equip = (sheet.equipment ?? []).filter((i) => !i.lost).reduce((sum, i) => sum + (i.stability ?? 0), 0);
    const core = Math.floor(equip / 5) + this.getStatusModifierTotal(sheet, "stability") + this.getSkillItemModifierTotal(sheet, "stability");
    return Math.max(0, Math.round(this.applyEffectPipeline(sheet, "stability", core)));
  }
  /** Public: apply the effectActive pipeline for `target` on top of a caller-computed core. */
  applyEffectActivePipeline(sheet, target, core) {
    return this.applyEffectPipeline(sheet, target, core);
  }
  /** Public: derived modifiers for one target, in applied order (for a core → … → total view). */
  getEffectPipelineFor(sheet, target) {
    return this.getEffectActiveModifiers(sheet).map((m, i) => ({ m, i })).filter((x) => x.m.target === target).sort((a, b) => a.m.priority - b.m.priority || a.i - b.i).map((x) => x.m);
  }
  /**
   * Calculate the effect bonus for a specific stat from skills and equipment.
   * This matches the logic in stat.component.ts effectBonus getter.
   *
   * @param sheet The character sheet
   * @param statKey The stat to calculate ('strength', 'dexterity', etc.)
   * @returns The total effect bonus from all sources
   */
  calculateEffectBonus(sheet, statKey) {
    let total = 0;
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              total += modifier.amount * multiplier;
            }
          }
        }
      }
    }
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              total += modifier.amount;
            }
          }
        }
      }
    }
    if (sheet.activeStatusEffects) {
      for (const active of sheet.activeStatusEffects) {
        const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        if (effect?.statModifiers) {
          for (const modifier of effect.statModifiers) {
            if (modifier.stat === statKey) {
              const stacks = active.stacks || 1;
              total += modifier.amount * stacks;
            }
          }
        }
      }
    }
    return total;
  }
  /**
   * Sum every active status effect's modifier for a given target (× stacks). This is the
   * single entry point derived-stat calculations use so status effects are always folded
   * in — Fokus, Rüstungsmalus/-negation, Grundbonus, Reaktion, Bewegung, resources, etc.
   */
  getStatusModifierTotal(sheet, target) {
    let total = 0;
    for (const active of sheet.activeStatusEffects || []) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (!effect?.statModifiers)
        continue;
      for (const mod of effect.statModifiers) {
        if (mod.stat === target)
          total += mod.amount * (active.stacks || 1);
      }
    }
    return total;
  }
  /** Total modifier a status effect adds to a specific Talent's Würfelbonus (× stacks). */
  getStatusTalentBonus(sheet, talentId) {
    let total = 0;
    for (const active of sheet.activeStatusEffects || []) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (!effect?.talentModifiers)
        continue;
      for (const mod of effect.talentModifiers) {
        if (mod.talentId === talentId)
          total += mod.amount * (active.stacks || 1);
      }
    }
    return total;
  }
  /** Per-source breakdown of the status effects modifying a talent (for tooltips). */
  getStatusTalentBonusSources(sheet, talentId) {
    const sources = [];
    for (const active of sheet.activeStatusEffects || []) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (!effect?.talentModifiers)
        continue;
      for (const mod of effect.talentModifiers) {
        if (mod.talentId !== talentId)
          continue;
        sources.push({
          name: active.customName ?? effect.name ?? active.statusEffectId,
          amount: mod.amount * (active.stacks || 1)
        });
      }
    }
    return sources;
  }
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
  /**
   * Get all sources contributing to a stat's effect bonus.
   * Useful for displaying tooltips showing where bonuses come from.
   *
   * @param sheet The character sheet
   * @param statKey The stat to get sources for
   * @returns Array of modifier sources with their names and amounts
   */
  getEffectBonusSources(sheet, statKey) {
    const sources = [];
    if (sheet.skills) {
      for (const skill of sheet.skills) {
        if (skill.statModifiers) {
          for (const modifier of skill.statModifiers) {
            if (modifier.stat === statKey) {
              const multiplier = skill.level || 1;
              const amount = modifier.amount * multiplier;
              sources.push({
                name: skill.name,
                amount,
                type: "skill"
              });
            }
          }
        }
      }
    }
    if (sheet.equipment) {
      for (const item of sheet.equipment) {
        if (item.statModifiers) {
          for (const modifier of item.statModifiers) {
            if (modifier.stat === statKey) {
              sources.push({
                name: item.name,
                amount: modifier.amount,
                type: "equipment"
              });
            }
          }
        }
      }
    }
    if (sheet.activeStatusEffects) {
      for (const active of sheet.activeStatusEffects) {
        const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
        if (effect?.statModifiers) {
          for (const modifier of effect.statModifiers) {
            if (modifier.stat === statKey) {
              const stacks = active.stacks || 1;
              sources.push({
                name: active.customName ?? effect.name ?? active.statusEffectId,
                amount: modifier.amount * stacks,
                type: "status_effect"
              });
            }
          }
        }
      }
    }
    return sources;
  }
  /**
   * Calculate a single stat's true value.
   * Formula: (base + bonus + free + effectBonus + (gain * level)) | 0
   *
   * @param sheet The character sheet
   * @param stat The stat block to calculate
   * @param statKey The stat key for effect bonus lookup
   * @returns The calculated stat value
   */
  calculateStat(sheet, stat, statKey) {
    if (!stat)
      return 10;
    const base2 = stat.base || 0;
    const bonus = stat.bonus || 0;
    const free = stat.free || 0;
    const gain = stat.gain || 0;
    const level = sheet.level || 1;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    const core = base2 + bonus + free + effectBonus + gain * level;
    return this.applyEffectPipeline(sheet, statKey, core) | 0;
  }
  /**
   * Calculate a stat with full breakdown details.
   * Useful for debugging or displaying detailed stat information.
   *
   * @param sheet The character sheet
   * @param stat The stat block to calculate
   * @param statKey The stat key for effect bonus lookup
   * @returns Detailed breakdown of the calculation
   */
  calculateStatDetails(sheet, stat, statKey) {
    const base2 = stat?.base || 0;
    const bonus = stat?.bonus || 0;
    const free = stat?.free || 0;
    const gain = stat?.gain || 0;
    const level = sheet.level || 1;
    const levelBonus = gain * level;
    const effectBonus = this.calculateEffectBonus(sheet, statKey);
    const total = base2 + bonus + free + effectBonus + levelBonus | 0;
    return { base: base2, bonus, gain, level, levelBonus, effectBonus, total };
  }
  /**
   * Get all calculated stats for a character.
   *
   * @param sheet The character sheet
   * @returns All six stats calculated
   */
  getAllStats(sheet) {
    return {
      strength: this.calculateStat(sheet, sheet.strength, "strength"),
      dexterity: this.calculateStat(sheet, sheet.dexterity, "dexterity"),
      speed: this.calculateStat(sheet, sheet.speed, "speed"),
      intelligence: this.calculateStat(sheet, sheet.intelligence, "intelligence"),
      constitution: this.calculateStat(sheet, sheet.constitution, "constitution"),
      wille: this.calculateStat(sheet, sheet.chill, "chill")
    };
  }
  /**
   * Calculate speed for battle/movement purposes.
   * This is the most commonly needed stat calculation.
   * IMPORTANT: This returns base speed WITHOUT penalties.
   * For actual movement speed, use calculateEffectiveSpeed()
   *
   * @param sheet The character sheet
   * @returns The calculated base speed value
   */
  calculateSpeed(sheet) {
    return this.calculateStat(sheet, sheet.speed, "speed");
  }
  /**
   * Calculate strength.
   */
  calculateStrength(sheet) {
    return this.calculateStat(sheet, sheet.strength, "strength");
  }
  /**
   * Calculate dexterity.
   */
  calculateDexterity(sheet) {
    return this.calculateStat(sheet, sheet.dexterity, "dexterity");
  }
  /**
   * Calculate intelligence.
   */
  calculateIntelligence(sheet) {
    return this.calculateStat(sheet, sheet.intelligence, "intelligence");
  }
  /**
   * Calculate constitution.
   */
  calculateConstitution(sheet) {
    return this.calculateStat(sheet, sheet.constitution, "constitution");
  }
  /**
   * Calculate wille (formerly chill).
   */
  calculateWille(sheet) {
    return this.calculateStat(sheet, sheet.chill, "chill");
  }
  /**
   * Calculate the D&D-style modifier for a stat.
   * Formula: (total − 10) / 4 | 0  (neutral at 10)
   *
   * This gives:
   * - Stat 10 = +0 modifier
   * - Stat 14 = +1 modifier
   * - Stat 6  = −1 modifier
   *
   * @param sheet The character sheet
   * @param statKey The stat to calculate modifier for
   * @returns The dice roll modifier
   */
  calculateStatModifier(sheet, statKey) {
    const statBlock = sheet[statKey];
    const total = this.calculateStat(sheet, statBlock, statKey);
    return (total - 10) / 4 | 0;
  }
  /** Dice roll modifier (inverted — lower is better). Matches stat card display. */
  calculateStatDiceModifier(sheet, statKey) {
    const statBlock = sheet[statKey];
    const total = this.calculateStat(sheet, statBlock, statKey);
    return (10 - total) / 4 | 0;
  }
  /** ⌊Level / 8⌋ — base portion that shifts from Reaktion to Grundbonus. */
  calculateGrundbonusBaseFromLevel(sheet) {
    return Math.floor((sheet.level || 1) / 8);
  }
  /** ⌊Wille / 8⌋ — Wille bonus added to Grundbonus. */
  calculateWilleBonus(sheet) {
    return Math.floor(this.calculateWille(sheet) / 8);
  }
  /** Grundbonus = ⌊Level/8⌋ + ⌊Wille/8⌋ + Bonus (+ status effects). */
  calculateGrundbonus(sheet) {
    const base2 = this.calculateGrundbonusBaseFromLevel(sheet) + this.calculateWilleBonus(sheet) + (sheet.grundbonusBonus || 0);
    return this.derivedTotal(sheet, "grundbonus", base2);
  }
  /** Reaktion = 5 − ⌊Wille/8⌋ − ⌊Level/8⌋ + Bonus (+ status effects). */
  calculateReaktionswert(sheet) {
    const base2 = 5 - this.calculateWilleBonus(sheet) - this.calculateGrundbonusBaseFromLevel(sheet) + (sheet.reaktionswertBonus || 0);
    return this.derivedTotal(sheet, "reaktion", base2);
  }
  /** Speed-penalty negation from the sheet plus any status effects (Rüstungsnegation). */
  calculateSpeedPenaltyNegation(sheet) {
    return this.derivedTotal(sheet, "armorNegation", sheet.speedPenaltyNegation || 0);
  }
  /** Total speed malus before negation (armor + encumbrance + status Rüstungsmalus). */
  calculateTotalSpeedMalus(sheet) {
    const baseSpeed = this.calculateSpeed(sheet);
    const base2 = this.calculateTotalArmorDebuff(sheet) + this.calculateEncumbrancePenalty(sheet, baseSpeed);
    return this.derivedTotal(sheet, "armorMalus", base2);
  }
  getGrundbonusFormulaTooltip(sheet) {
    const levelBase = this.calculateGrundbonusBaseFromLevel(sheet);
    const willeBonus = this.calculateWilleBonus(sheet);
    const extra = sheet.grundbonusBonus || 0;
    let line = `= ${levelBase} + ${willeBonus}`;
    if (extra)
      line += ` + ${extra}`;
    line += ` = ${this.calculateGrundbonus(sheet)}`;
    return `\u230ALevel / 8\u230B + \u230AWille / 8\u230B + Bonus
${line}`;
  }
  getReaktionswertFormulaTooltip(sheet) {
    const levelBase = this.calculateGrundbonusBaseFromLevel(sheet);
    const willeBonus = this.calculateWilleBonus(sheet);
    const extra = sheet.reaktionswertBonus || 0;
    let line = `= 5 \u2212 ${willeBonus} \u2212 ${levelBase}`;
    if (extra)
      line += ` + ${extra}`;
    line += ` = ${this.calculateReaktionswert(sheet)}`;
    return `5 \u2212 \u230AWille / 8\u230B \u2212 \u230ALevel / 8\u230B + Bonus
${line}`;
  }
  getMovementFormulaTooltip(sheet) {
    const eff = this.calculateEffectiveSpeed(sheet);
    const mov = this.calculateMovementSpeed(sheet);
    const bewegung = this.getStatusModifierTotal(sheet, "bewegung");
    const base2 = `\u230A8 + Effektive Geschw. / 4\u230B
Effektive Geschw.: ${eff}
= \u230A8 + ${eff} / 4\u230B`;
    if (bewegung) {
      const sign = bewegung > 0 ? "+" : "\u2212";
      return `${base2} ${sign} ${Math.abs(bewegung)} (Bewegung) = ${mov}`;
    }
    return `${base2} = ${mov}`;
  }
  getFokusFormulaTooltip(sheet) {
    const int = this.calculateIntelligence(sheet);
    const intHalf = Math.floor(int / 2);
    const fb = sheet.fokusBonus || 0;
    const fm = sheet.fokusMultiplier || 1;
    const inner = fb ? `${intHalf} + 5 + ${fb}` : `${intHalf} + 5`;
    return `(\u230AINT / 2\u230B + 5 + Bonus) \xD7 Multiplikator
= (${inner}) \xD7 ${fm} = ${this.calculateFokusMax(sheet)}`;
  }
  getArmorNegationFormulaTooltip(sheet) {
    const malus = this.calculateTotalSpeedMalus(sheet);
    const neg = this.calculateSpeedPenaltyNegation(sheet);
    const after = Math.max(0, malus - neg);
    return `1 Punkt negiert 1 Malus-Punkt (R\xFCstung + Belastung)
Malus gesamt: ${malus}, Negation: ${neg}
Verbleibender Malus: ${after}`;
  }
  /** Stack-aware item weight (weight × amount when stackable). */
  getItemStackWeight(item) {
    if (!item)
      return 0;
    const w = item.weight || 0;
    const qty = item.stackable && (item.amount ?? 1) > 1 ? item.amount ?? 1 : 1;
    return w * qty;
  }
  /** Max spell fokus pool from calculated intelligence + sheet bonuses + status effects. */
  calculateFokusMax(sheet) {
    const intelligence = this.calculateIntelligence(sheet);
    const base2 = Math.floor(intelligence / 2) + 5;
    const bonus = (sheet.fokusBonus || 0) + this.getStatusModifierTotal(sheet, "fokus");
    return Math.floor((base2 + bonus) * (sheet.fokusMultiplier || 1));
  }
  /** Clamp resource current; life may go negative, others floor at 0. */
  clampResourceCurrent(formulaType, current, max) {
    if (formulaType === FormulaType.LIFE) {
      return Math.min(max, current);
    }
    return Math.max(0, Math.min(max, current));
  }
  /**
   * Calculate effective speed after all penalties.
   * Takes into account:
   * - Armor debuff from equipped items
   * - Encumbrance penalty from inventory weight
   * - Speed penalty negation (reduces both penalties)
   *
   * Rules:
   * - Armor: Each equipped item may have armorDebuff field
   * - Encumbrance: 80-99% = half speed, 100%+ = speed becomes 0
   * - Negation: speedPenaltyNegation reduces total penalty (but can't make speed higher than base)
   *
   * @param sheet The character sheet
   * @returns Speed after all penalties
   */
  calculateEffectiveSpeed(sheet) {
    const baseSpeed = this.calculateSpeed(sheet);
    const armorDebuff = this.calculateTotalArmorDebuff(sheet);
    const encumbrancePenalty = this.calculateEncumbrancePenalty(sheet, baseSpeed);
    const totalPenalty = this.derivedTotal(sheet, "armorMalus", armorDebuff + encumbrancePenalty);
    const negation = this.calculateSpeedPenaltyNegation(sheet);
    const finalPenalty = Math.max(0, totalPenalty - negation);
    return Math.max(0, baseSpeed - finalPenalty);
  }
  /**
   * Movement speed in hex steps: ⌊5 + effective speed / 4⌋, then the status "Bewegung"
   * modifier is added flatly on top (it bypasses the speed→movement conversion; speed
   * itself is unaffected).
   */
  calculateMovementSpeed(sheet) {
    const spd = this.calculateEffectiveSpeed(sheet);
    return Math.max(0, this.derivedTotal(sheet, "bewegung", Math.floor(8 + spd / 4)));
  }
  /**
   * Calculate encumbrance penalty from inventory weight.
   *
   * Rules:
   * - < 80% capacity: No penalty
   * - 80-99% capacity: Half of current speed
   * - >= 100% capacity: All speed (becomes 0)
   *
   * @param sheet The character sheet
   * @param currentSpeed The current base speed (before encumbrance)
   * @returns Speed penalty from being over-encumbered
   */
  calculateEncumbrancePenalty(sheet, currentSpeed) {
    const percentage = this.getEncumbrancePercentage(sheet);
    if (percentage < 80) {
      return 0;
    } else if (percentage < 100) {
      return Math.floor(currentSpeed / 2);
    } else {
      return currentSpeed;
    }
  }
  /**
   * Calculate encumbrance percentage.
   *
   * @param sheet The character sheet
   * @returns Percentage of max capacity being used (0-100+)
   */
  getEncumbrancePercentage(sheet) {
    const totalWeight = this.getTotalWeight(sheet);
    const maxCapacity = this.getMaxCapacity(sheet);
    if (maxCapacity === 0)
      return 100;
    return totalWeight / maxCapacity * 100;
  }
  /**
   * Calculate total inventory weight including currency.
   *
   * @param sheet The character sheet
   * @returns Total weight in pounds/kg
   */
  getTotalWeight(sheet) {
    const itemWeight = sheet.inventory?.reduce((sum, item) => sum + this.getItemStackWeight(item), 0) || 0;
    const equipmentWeight = sheet.equipment?.reduce((sum, item) => sum + this.getItemStackWeight(item), 0) || 0;
    const COIN_WEIGHT = 0.02;
    const currencyWeight = sheet.currency ? ((sheet.currency.copper || 0) + (sheet.currency.silver || 0) + (sheet.currency.gold || 0) + (sheet.currency.platinum || 0)) * COIN_WEIGHT : 0;
    return Math.floor(itemWeight + equipmentWeight + currencyWeight);
  }
  /**
   * Calculate maximum carry capacity.
   * Formula: (strength * 8) * multiplier + bonus
   *
   * @param sheet The character sheet
   * @returns Maximum carry capacity
   */
  getMaxCapacity(sheet) {
    const strength = this.calculateStrength(sheet);
    const baseCapacity = strength * 8;
    const multiplier = sheet.carryCapacityMultiplier || 1;
    const bonus = sheet.carryCapacityBonus || 0;
    return Math.floor(baseCapacity * multiplier + bonus);
  }
  /**
   * Raw armor speed malus points (before Rüstungsnegation).
   * Each 5 armor debuff = 1 malus; broken armor adds +5 malus.
   */
  calculateTotalArmorDebuff(sheet) {
    if (!sheet.equipment)
      return 0;
    let sumOfArmorDebuffs = 0;
    let brokenPenalty = 0;
    for (const item of sheet.equipment) {
      sumOfArmorDebuffs += item.armorDebuff || 0;
      if (item.broken && item.itemType === "armor") {
        brokenPenalty += 5;
      }
    }
    return Math.round(sumOfArmorDebuffs / 5) + brokenPenalty;
  }
  /**
   * Check if a character meets the stat requirements for an item.
   *
   * @param sheet The character sheet
   * @param requirements Object with stat requirements
   * @returns True if all requirements are met
   */
  meetsRequirements(sheet, requirements) {
    for (const [statKey, required] of Object.entries(requirements)) {
      if (required) {
        const statBlock = sheet[statKey];
        const current = this.calculateStat(sheet, statBlock, statKey);
        if (current < required) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Update the .current property on all stat blocks.
   * Call this after making changes to ensure cached values are fresh.
   *
   * @param sheet The character sheet to update
   */
  updateCurrentValues(sheet) {
    const stats = this.getAllStats(sheet);
    if (sheet.strength)
      sheet.strength.current = stats.strength;
    if (sheet.dexterity)
      sheet.dexterity.current = stats.dexterity;
    if (sheet.speed)
      sheet.speed.current = stats.speed;
    if (sheet.intelligence)
      sheet.intelligence.current = stats.intelligence;
    if (sheet.constitution)
      sheet.constitution.current = stats.constitution;
    if (sheet.chill)
      sheet.chill.current = stats.wille;
  }
  /**
   * Check if the character has the Naturtalent skill (Human racial skill).
   * Naturtalent grants a free stat point every 2 levels instead of every 3.
   *
   * @param sheet The character sheet
   * @returns True if the character has Naturtalent
   */
  hasNaturtalent(sheet) {
    return sheet.learnedSkillIds?.includes("race_menschen_naturtalent") || sheet.skills?.some((skill) => skill.name === "Naturtalent") || false;
  }
  /**
   * Calculate total free stat points earned at a given level.
   * Formula: 1 point every 3 levels (or every 2 levels with Naturtalent)
   *
   * @param sheet The character sheet
   * @returns Total free stat points earned
   */
  calculateTotalFreeStatPoints(sheet) {
    const level = sheet.level || 1;
    const hasNaturtalent = this.hasNaturtalent(sheet);
    const interval = hasNaturtalent ? 2 : 3;
    return Math.floor(level / interval);
  }
  /**
   * Calculate total free stat points spent.
   *
   * @param sheet The character sheet
   * @returns Total free stat points allocated to stats
   */
  calculateSpentFreeStatPoints(sheet) {
    const stats = [
      sheet.strength,
      sheet.dexterity,
      sheet.speed,
      sheet.intelligence,
      sheet.constitution,
      sheet.chill
      // wille
    ];
    return stats.reduce((sum, stat) => sum + (stat?.free || 0), 0);
  }
  /**
   * Calculate available free stat points.
   *
   * @param sheet The character sheet
   * @returns Available free stat points to spend
   */
  calculateAvailableFreeStatPoints(sheet) {
    const total = this.calculateTotalFreeStatPoints(sheet);
    const spent = this.calculateSpentFreeStatPoints(sheet);
    const stored = sheet.freeStatPoints || 0;
    const bonus = sheet.freeStatPointsBonus || 0;
    return total - spent + stored + bonus;
  }
  /**
   * Calculate the maximum value of a resource (life/energy/mana).
   * Mirrors the formula in currentstat.component.ts:
   *   max = statusBase + statusBonus + effectBonus + stat * 5
   */
  calculateResourceMax(sheet, formulaType) {
    const status = sheet.statuses?.find((s) => s.formulaType === formulaType);
    if (!status)
      return 0;
    const base2 = status.statusBase || 0;
    const bonus = status.statusBonus || 0;
    const effectBonus = this.calculateResourceEffectBonus(sheet, formulaType);
    let statBonus = 0;
    switch (formulaType) {
      case FormulaType.LIFE:
        statBonus = this.calculateConstitution(sheet) * 5;
        break;
      case FormulaType.ENERGY:
        statBonus = this.calculateDexterity(sheet) * 5;
        break;
      case FormulaType.MANA:
        statBonus = this.calculateIntelligence(sheet) * 5;
        break;
    }
    return base2 + bonus + effectBonus + statBonus;
  }
  calculateResourceEffectBonus(sheet, formulaType) {
    const statKey = formulaType === FormulaType.LIFE ? "life" : formulaType === FormulaType.ENERGY ? "energy" : "mana";
    let total = 0;
    for (const skill of sheet.skills || []) {
      if (skill.statModifiers) {
        for (const mod of skill.statModifiers) {
          if (mod.stat === statKey)
            total += mod.amount * (skill.level || 1);
        }
      }
    }
    for (const item of sheet.equipment || []) {
      if (item?.statModifiers) {
        for (const mod of item.statModifiers) {
          if (mod.stat === statKey)
            total += mod.amount;
        }
      }
    }
    for (const active of sheet.activeStatusEffects || []) {
      const effect = this.resolveStatusEffect(active.statusEffectId, active.customEffect);
      if (effect?.statModifiers) {
        for (const mod of effect.statModifiers) {
          if (mod.stat === statKey)
            total += mod.amount * (active.stacks || 1);
        }
      }
    }
    return total;
  }
  static \u0275fac = function TrueStatsService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _TrueStatsService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _TrueStatsService, factory: _TrueStatsService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(TrueStatsService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// src/app/shared/spell-node-editor/spell-node.model.ts
var NEUTRAL_RUNE_ID = "__neutral__";
var SUMMON_RUNE_ID = "__summon__";
var FLOW_COLOR = "#ffffff";
function buildRunePorts(_rune) {
  if (_rune.name === NEUTRAL_RUNE_ID) {
    return [
      { id: "neutral-in", kind: "flow-in", name: "Eingang" },
      { id: "neutral-out", kind: "flow-out", name: "Ausgang" }
    ];
  }
  return [
    { id: "flow-in", kind: "flow-in", name: "Fluss" },
    { id: "flow-out", kind: "flow-out", name: "Fluss" }
  ];
}

// node_modules/@marijn/find-cluster-break/src/index.js
var rangeFrom = [];
var rangeTo = [];
(() => {
  let numbers = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
  for (let i = 0, n = 0; i < numbers.length; i++)
    (i % 2 ? rangeTo : rangeFrom).push(n = n + numbers[i]);
})();
function isExtendingChar(code) {
  if (code < 768) return false;
  for (let from = 0, to = rangeFrom.length; ; ) {
    let mid = from + to >> 1;
    if (code < rangeFrom[mid]) to = mid;
    else if (code >= rangeTo[mid]) from = mid + 1;
    else return true;
    if (from == to) return false;
  }
}
function isRegionalIndicator(code) {
  return code >= 127462 && code <= 127487;
}
var ZWJ = 8205;
function findClusterBreak(str2, pos, forward = true, includeExtending = true) {
  return (forward ? nextClusterBreak : prevClusterBreak)(str2, pos, includeExtending);
}
function nextClusterBreak(str2, pos, includeExtending) {
  if (pos == str2.length) return pos;
  if (pos && surrogateLow(str2.charCodeAt(pos)) && surrogateHigh(str2.charCodeAt(pos - 1))) pos--;
  let prev = codePointAt(str2, pos);
  pos += codePointSize(prev);
  while (pos < str2.length) {
    let next = codePointAt(str2, pos);
    if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
      pos += codePointSize(next);
      prev = next;
    } else if (isRegionalIndicator(next)) {
      let countBefore = 0, i = pos - 2;
      while (i >= 0 && isRegionalIndicator(codePointAt(str2, i))) {
        countBefore++;
        i -= 2;
      }
      if (countBefore % 2 == 0) break;
      else pos += 2;
    } else {
      break;
    }
  }
  return pos;
}
function prevClusterBreak(str2, pos, includeExtending) {
  while (pos > 1) {
    let found = nextClusterBreak(str2, pos - 2, includeExtending);
    if (found < pos) return found;
    pos--;
  }
  return 0;
}
function codePointAt(str2, pos) {
  let code0 = str2.charCodeAt(pos);
  if (!surrogateHigh(code0) || pos + 1 == str2.length) return code0;
  let code1 = str2.charCodeAt(pos + 1);
  if (!surrogateLow(code1)) return code0;
  return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
}
function surrogateLow(ch) {
  return ch >= 56320 && ch < 57344;
}
function surrogateHigh(ch) {
  return ch >= 55296 && ch < 56320;
}
function codePointSize(code) {
  return code < 65536 ? 1 : 2;
}

// node_modules/@codemirror/state/dist/index.js
var Text = class _Text {
  /**
  Get the line description around the given position.
  */
  lineAt(pos) {
    if (pos < 0 || pos > this.length)
      throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
    return this.lineInner(pos, false, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(n) {
    if (n < 1 || n > this.lines)
      throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
    return this.lineInner(n, true, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(from, to, text) {
    [from, to] = clip(this, from, to);
    let parts = [];
    this.decompose(
      0,
      from,
      parts,
      2
      /* Open.To */
    );
    if (text.length)
      text.decompose(
        0,
        text.length,
        parts,
        1 | 2
        /* Open.To */
      );
    this.decompose(
      to,
      this.length,
      parts,
      1
      /* Open.From */
    );
    return TextNode.from(parts, this.length - (to - from) + text.length);
  }
  /**
  Append another document to this one.
  */
  append(other) {
    return this.replace(this.length, this.length, other);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(from, to = this.length) {
    [from, to] = clip(this, from, to);
    let parts = [];
    this.decompose(from, to, parts, 0);
    return TextNode.from(parts, to - from);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(other) {
    if (other == this)
      return true;
    if (other.length != this.length || other.lines != this.lines)
      return false;
    let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
    let a = new RawTextCursor(this), b = new RawTextCursor(other);
    for (let skip = start, pos = start; ; ) {
      a.next(skip);
      b.next(skip);
      skip = 0;
      if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
        return false;
      pos += a.value.length;
      if (a.done || pos >= end)
        return true;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(dir = 1) {
    return new RawTextCursor(this, dir);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(from, to = this.length) {
    return new PartialTextCursor(this, from, to);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(from, to) {
    let inner;
    if (from == null) {
      inner = this.iter();
    } else {
      if (to == null)
        to = this.lines + 1;
      let start = this.line(from).from;
      inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
    }
    return new LineCursor(inner);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let lines = [];
    this.flatten(lines);
    return lines;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(text) {
    if (text.length == 0)
      throw new RangeError("A document must have at least one line");
    if (text.length == 1 && !text[0])
      return _Text.empty;
    return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
  }
};
var TextLeaf = class _TextLeaf extends Text {
  constructor(text, length = textLength(text)) {
    super();
    this.text = text;
    this.length = length;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let string2 = this.text[i], end = offset + string2.length;
      if ((isLine ? line : end) >= target)
        return new Line(offset, end, line, string2);
      offset = end + 1;
      line++;
    }
  }
  decompose(from, to, target, open) {
    let text = from <= 0 && to >= this.length ? this : new _TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
    if (open & 1) {
      let prev = target.pop();
      let joined = appendText(text.text, prev.text.slice(), 0, text.length);
      if (joined.length <= 32) {
        target.push(new _TextLeaf(joined, prev.length + text.length));
      } else {
        let mid = joined.length >> 1;
        target.push(new _TextLeaf(joined.slice(0, mid)), new _TextLeaf(joined.slice(mid)));
      }
    } else {
      target.push(text);
    }
  }
  replace(from, to, text) {
    if (!(text instanceof _TextLeaf))
      return super.replace(from, to, text);
    [from, to] = clip(this, from, to);
    let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
    let newLen = this.length + text.length - (to - from);
    if (lines.length <= 32)
      return new _TextLeaf(lines, newLen);
    return TextNode.from(_TextLeaf.split(lines, []), newLen);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    [from, to] = clip(this, from, to);
    let result = "";
    for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
      let line = this.text[i], end = pos + line.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += line.slice(Math.max(0, from - pos), to - pos);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let line of this.text)
      target.push(line);
  }
  scanIdentical() {
    return 0;
  }
  static split(text, target) {
    let part = [], len = -1;
    for (let line of text) {
      part.push(line);
      len += line.length + 1;
      if (part.length == 32) {
        target.push(new _TextLeaf(part, len));
        part = [];
        len = -1;
      }
    }
    if (len > -1)
      target.push(new _TextLeaf(part, len));
    return target;
  }
};
var TextNode = class _TextNode extends Text {
  constructor(children, length) {
    super();
    this.children = children;
    this.length = length;
    this.lines = 0;
    for (let child of children)
      this.lines += child.lines;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
      if ((isLine ? endLine : end) >= target)
        return child.lineInner(target, isLine, line, offset);
      offset = end + 1;
      line = endLine + 1;
    }
  }
  decompose(from, to, target, open) {
    for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (from <= end && to >= pos) {
        let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
        if (pos >= from && end <= to && !childOpen)
          target.push(child);
        else
          child.decompose(from - pos, to - pos, target, childOpen);
      }
      pos = end + 1;
    }
  }
  replace(from, to, text) {
    [from, to] = clip(this, from, to);
    if (text.lines < this.lines)
      for (let i = 0, pos = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from >= pos && to <= end) {
          let updated = child.replace(from - pos, to - pos, text);
          let totalLines = this.lines - child.lines + updated.lines;
          if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
            let copy = this.children.slice();
            copy[i] = updated;
            return new _TextNode(copy, this.length - (to - from) + text.length);
          }
          return super.replace(pos, end, updated);
        }
        pos = end + 1;
      }
    return super.replace(from, to, text);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    [from, to] = clip(this, from, to);
    let result = "";
    for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += child.sliceString(from - pos, to - pos, lineSep);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let child of this.children)
      child.flatten(target);
  }
  scanIdentical(other, dir) {
    if (!(other instanceof _TextNode))
      return 0;
    let length = 0;
    let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length] : [this.children.length - 1, other.children.length - 1, -1, -1];
    for (; ; iA += dir, iB += dir) {
      if (iA == eA || iB == eB)
        return length;
      let chA = this.children[iA], chB = other.children[iB];
      if (chA != chB)
        return length + chA.scanIdentical(chB, dir);
      length += chA.length + 1;
    }
  }
  static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
    let lines = 0;
    for (let ch of children)
      lines += ch.lines;
    if (lines < 32) {
      let flat = [];
      for (let ch of children)
        ch.flatten(flat);
      return new TextLeaf(flat, length);
    }
    let chunk = Math.max(
      32,
      lines >> 5
      /* Tree.BranchShift */
    ), maxChunk = chunk << 1, minChunk = chunk >> 1;
    let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
    function add2(child) {
      let last;
      if (child.lines > maxChunk && child instanceof _TextNode) {
        for (let node of child.children)
          add2(node);
      } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
        flush();
        chunked.push(child);
      } else if (child instanceof TextLeaf && currentLines && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last.lines <= 32) {
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
      } else {
        if (currentLines + child.lines > chunk)
          flush();
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk.push(child);
      }
    }
    function flush() {
      if (currentLines == 0)
        return;
      chunked.push(currentChunk.length == 1 ? currentChunk[0] : _TextNode.from(currentChunk, currentLen));
      currentLen = -1;
      currentLines = currentChunk.length = 0;
    }
    for (let child of children)
      add2(child);
    flush();
    return chunked.length == 1 ? chunked[0] : new _TextNode(chunked, length);
  }
};
Text.empty = /* @__PURE__ */ new TextLeaf([""], 0);
function textLength(text) {
  let length = -1;
  for (let line of text)
    length += line.length + 1;
  return length;
}
function appendText(text, target, from = 0, to = 1e9) {
  for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
    let line = text[i], end = pos + line.length;
    if (end >= from) {
      if (end > to)
        line = line.slice(0, to - pos);
      if (pos < from)
        line = line.slice(from - pos);
      if (first) {
        target[target.length - 1] += line;
        first = false;
      } else
        target.push(line);
    }
    pos = end + 1;
  }
  return target;
}
function sliceText(text, from, to) {
  return appendText(text, [""], from, to);
}
var RawTextCursor = class {
  constructor(text, dir = 1) {
    this.dir = dir;
    this.done = false;
    this.lineBreak = false;
    this.value = "";
    this.nodes = [text];
    this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
  }
  nextInner(skip, dir) {
    this.done = this.lineBreak = false;
    for (; ; ) {
      let last = this.nodes.length - 1;
      let top2 = this.nodes[last], offsetValue = this.offsets[last], offset = offsetValue >> 1;
      let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
      if (offset == (dir > 0 ? size : 0)) {
        if (last == 0) {
          this.done = true;
          this.value = "";
          return this;
        }
        if (dir > 0)
          this.offsets[last - 1]++;
        this.nodes.pop();
        this.offsets.pop();
      } else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
        this.offsets[last] += dir;
        if (skip == 0) {
          this.lineBreak = true;
          this.value = "\n";
          return this;
        }
        skip--;
      } else if (top2 instanceof TextLeaf) {
        let next = top2.text[offset + (dir < 0 ? -1 : 0)];
        this.offsets[last] += dir;
        if (next.length > Math.max(0, skip)) {
          this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
          return this;
        }
        skip -= next.length;
      } else {
        let next = top2.children[offset + (dir < 0 ? -1 : 0)];
        if (skip > next.length) {
          skip -= next.length;
          this.offsets[last] += dir;
        } else {
          if (dir < 0)
            this.offsets[last]--;
          this.nodes.push(next);
          this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
        }
      }
    }
  }
  next(skip = 0) {
    if (skip < 0) {
      this.nextInner(-skip, -this.dir);
      skip = this.value.length;
    }
    return this.nextInner(skip, this.dir);
  }
};
var PartialTextCursor = class {
  constructor(text, start, end) {
    this.value = "";
    this.done = false;
    this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
    this.pos = start > end ? text.length : 0;
    this.from = Math.min(start, end);
    this.to = Math.max(start, end);
  }
  nextInner(skip, dir) {
    if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
      this.value = "";
      this.done = true;
      return this;
    }
    skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
    let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
    if (skip > limit)
      skip = limit;
    limit -= skip;
    let { value } = this.cursor.next(skip);
    this.pos += (value.length + skip) * dir;
    this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
    this.done = !this.value;
    return this;
  }
  next(skip = 0) {
    if (skip < 0)
      skip = Math.max(skip, this.from - this.pos);
    else if (skip > 0)
      skip = Math.min(skip, this.to - this.pos);
    return this.nextInner(skip, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
};
var LineCursor = class {
  constructor(inner) {
    this.inner = inner;
    this.afterBreak = true;
    this.value = "";
    this.done = false;
  }
  next(skip = 0) {
    let { done, lineBreak, value } = this.inner.next(skip);
    if (done && this.afterBreak) {
      this.value = "";
      this.afterBreak = false;
    } else if (done) {
      this.done = true;
      this.value = "";
    } else if (lineBreak) {
      if (this.afterBreak) {
        this.value = "";
      } else {
        this.afterBreak = true;
        this.next();
      }
    } else {
      this.value = value;
      this.afterBreak = false;
    }
    return this;
  }
  get lineBreak() {
    return false;
  }
};
if (typeof Symbol != "undefined") {
  Text.prototype[Symbol.iterator] = function() {
    return this.iter();
  };
  RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] = LineCursor.prototype[Symbol.iterator] = function() {
    return this;
  };
}
var Line = class {
  /**
  @internal
  */
  constructor(from, to, number2, text) {
    this.from = from;
    this.to = to;
    this.number = number2;
    this.text = text;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
};
function clip(text, from, to) {
  from = Math.max(0, Math.min(text.length, from));
  return [from, Math.max(from, Math.min(text.length, to))];
}
function findClusterBreak2(str2, pos, forward = true, includeExtending = true) {
  return findClusterBreak(str2, pos, forward, includeExtending);
}
function surrogateLow2(ch) {
  return ch >= 56320 && ch < 57344;
}
function surrogateHigh2(ch) {
  return ch >= 55296 && ch < 56320;
}
function codePointAt2(str2, pos) {
  let code0 = str2.charCodeAt(pos);
  if (!surrogateHigh2(code0) || pos + 1 == str2.length)
    return code0;
  let code1 = str2.charCodeAt(pos + 1);
  if (!surrogateLow2(code1))
    return code0;
  return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
}
function fromCodePoint(code) {
  if (code <= 65535)
    return String.fromCharCode(code);
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
function codePointSize2(code) {
  return code < 65536 ? 1 : 2;
}
var DefaultSplit = /\r\n?|\n/;
var MapMode = /* @__PURE__ */ (function(MapMode2) {
  MapMode2[MapMode2["Simple"] = 0] = "Simple";
  MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
  MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
  MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
  return MapMode2;
})(MapMode || (MapMode = {}));
var ChangeDesc = class _ChangeDesc {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(sections) {
    this.sections = sections;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2)
      result += this.sections[i];
    return result;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2) {
      let ins = this.sections[i + 1];
      result += ins < 0 ? this.sections[i] : ins;
    }
    return result;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(f) {
    for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0) {
        f(posA, posB, len);
        posB += len;
      } else {
        posB += ins;
      }
      posA += len;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let sections = [];
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0)
        sections.push(len, ins);
      else
        sections.push(ins, len);
    }
    return new _ChangeDesc(sections);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(other, before = false) {
    return other.empty ? this : mapSet(this, other, before);
  }
  mapPos(pos, assoc = -1, mode = MapMode.Simple) {
    let posA = 0, posB = 0;
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
      if (ins < 0) {
        if (endA > pos)
          return posB + (pos - posA);
        posB += len;
      } else {
        if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
          return null;
        if (endA > pos || endA == pos && assoc < 0 && !len)
          return pos == posA || assoc < 0 ? posB : posB + ins;
        posB += ins;
      }
      posA = endA;
    }
    if (pos > posA)
      throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
    return posB;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(from, to = from) {
    for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
      let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
      if (ins >= 0 && pos <= to && end >= from)
        return pos < from && end > to ? "cover" : true;
      pos = end;
    }
    return false;
  }
  /**
  @internal
  */
  toString() {
    let result = "";
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
    }
    return result;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(json) {
    if (!Array.isArray(json) || json.length % 2 || json.some((a) => typeof a != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new _ChangeDesc(json);
  }
  /**
  @internal
  */
  static create(sections) {
    return new _ChangeDesc(sections);
  }
};
var ChangeSet = class _ChangeSet extends ChangeDesc {
  constructor(sections, inserted) {
    super(sections);
    this.inserted = inserted;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(doc2) {
    if (this.length != doc2.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
    return doc2;
  }
  mapDesc(other, before = false) {
    return mapSet(this, other, before, true);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(doc2) {
    let sections = this.sections.slice(), inserted = [];
    for (let i = 0, pos = 0; i < sections.length; i += 2) {
      let len = sections[i], ins = sections[i + 1];
      if (ins >= 0) {
        sections[i] = ins;
        sections[i + 1] = len;
        let index = i >> 1;
        while (inserted.length < index)
          inserted.push(Text.empty);
        inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
      }
      pos += len;
    }
    return new _ChangeSet(sections, inserted);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other, true);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(other, before = false) {
    return other.empty ? this : mapSet(this, other, before, true);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return ChangeDesc.create(this.sections);
  }
  /**
  @internal
  */
  filter(ranges) {
    let resultSections = [], resultInserted = [], filteredSections = [];
    let iter = new SectionIter(this);
    done: for (let i = 0, pos = 0; ; ) {
      let next = i == ranges.length ? 1e9 : ranges[i++];
      while (pos < next || pos == next && iter.len == 0) {
        if (iter.done)
          break done;
        let len = Math.min(iter.len, next - pos);
        addSection(filteredSections, len, -1);
        let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
        addSection(resultSections, len, ins);
        if (ins > 0)
          addInsert(resultInserted, resultSections, iter.text);
        iter.forward(len);
        pos += len;
      }
      let end = ranges[i++];
      while (pos < end) {
        if (iter.done)
          break done;
        let len = Math.min(iter.len, end - pos);
        addSection(resultSections, len, -1);
        addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
        iter.forward(len);
        pos += len;
      }
    }
    return {
      changes: new _ChangeSet(resultSections, resultInserted),
      filtered: ChangeDesc.create(filteredSections)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let parts = [];
    for (let i = 0; i < this.sections.length; i += 2) {
      let len = this.sections[i], ins = this.sections[i + 1];
      if (ins < 0)
        parts.push(len);
      else if (ins == 0)
        parts.push([len]);
      else
        parts.push([len].concat(this.inserted[i >> 1].toJSON()));
    }
    return parts;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(changes, length, lineSep) {
    let sections = [], inserted = [], pos = 0;
    let total = null;
    function flush(force = false) {
      if (!force && !sections.length)
        return;
      if (pos < length)
        addSection(sections, length - pos, -1);
      let set = new _ChangeSet(sections, inserted);
      total = total ? total.compose(set.map(total)) : set;
      sections = [];
      inserted = [];
      pos = 0;
    }
    function process(spec) {
      if (Array.isArray(spec)) {
        for (let sub of spec)
          process(sub);
      } else if (spec instanceof _ChangeSet) {
        if (spec.length != length)
          throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
        flush();
        total = total ? total.compose(spec.map(total)) : spec;
      } else {
        let { from, to = from, insert: insert2 } = spec;
        if (from > to || from < 0 || to > length)
          throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
        let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
        let insLen = insText.length;
        if (from == to && insLen == 0)
          return;
        if (from < pos)
          flush();
        if (from > pos)
          addSection(sections, from - pos, -1);
        addSection(sections, to - from, insLen);
        addInsert(inserted, sections, insText);
        pos = to;
      }
    }
    process(changes);
    flush(!total);
    return total;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(length) {
    return new _ChangeSet(length ? [length, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(json) {
    if (!Array.isArray(json))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let sections = [], inserted = [];
    for (let i = 0; i < json.length; i++) {
      let part = json[i];
      if (typeof part == "number") {
        sections.push(part, -1);
      } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
        throw new RangeError("Invalid JSON representation of ChangeSet");
      } else if (part.length == 1) {
        sections.push(part[0], 0);
      } else {
        while (inserted.length < i)
          inserted.push(Text.empty);
        inserted[i] = Text.of(part.slice(1));
        sections.push(part[0], inserted[i].length);
      }
    }
    return new _ChangeSet(sections, inserted);
  }
  /**
  @internal
  */
  static createSet(sections, inserted) {
    return new _ChangeSet(sections, inserted);
  }
};
function addSection(sections, len, ins, forceJoin = false) {
  if (len == 0 && ins <= 0)
    return;
  let last = sections.length - 2;
  if (last >= 0 && ins <= 0 && ins == sections[last + 1])
    sections[last] += len;
  else if (last >= 0 && len == 0 && sections[last] == 0)
    sections[last + 1] += ins;
  else if (forceJoin) {
    sections[last] += len;
    sections[last + 1] += ins;
  } else
    sections.push(len, ins);
}
function addInsert(values, sections, value) {
  if (value.length == 0)
    return;
  let index = sections.length - 2 >> 1;
  if (index < values.length) {
    values[values.length - 1] = values[values.length - 1].append(value);
  } else {
    while (values.length < index)
      values.push(Text.empty);
    values.push(value);
  }
}
function iterChanges(desc, f, individual) {
  let inserted = desc.inserted;
  for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
    let len = desc.sections[i++], ins = desc.sections[i++];
    if (ins < 0) {
      posA += len;
      posB += len;
    } else {
      let endA = posA, endB = posB, text = Text.empty;
      for (; ; ) {
        endA += len;
        endB += ins;
        if (ins && inserted)
          text = text.append(inserted[i - 2 >> 1]);
        if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
          break;
        len = desc.sections[i++];
        ins = desc.sections[i++];
      }
      f(posA, endA, posB, endB, text);
      posA = endA;
      posB = endB;
    }
  }
}
function mapSet(setA, setB, before, mkSet = false) {
  let sections = [], insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let inserted = -1; ; ) {
    if (a.done && b.len || b.done && a.len) {
      throw new Error("Mismatched change set lengths");
    } else if (a.ins == -1 && b.ins == -1) {
      let len = Math.min(a.len, b.len);
      addSection(sections, len, -1);
      a.forward(len);
      b.forward(len);
    } else if (b.ins >= 0 && (a.ins < 0 || inserted == a.i || a.off == 0 && (b.len < a.len || b.len == a.len && !before))) {
      let len = b.len;
      addSection(sections, b.ins, -1);
      while (len) {
        let piece = Math.min(a.len, len);
        if (a.ins >= 0 && inserted < a.i && a.len <= piece) {
          addSection(sections, 0, a.ins);
          if (insert2)
            addInsert(insert2, sections, a.text);
          inserted = a.i;
        }
        a.forward(piece);
        len -= piece;
      }
      b.next();
    } else if (a.ins >= 0) {
      let len = 0, left = a.len;
      while (left) {
        if (b.ins == -1) {
          let piece = Math.min(left, b.len);
          len += piece;
          left -= piece;
          b.forward(piece);
        } else if (b.ins == 0 && b.len < left) {
          left -= b.len;
          b.next();
        } else {
          break;
        }
      }
      addSection(sections, len, inserted < a.i ? a.ins : 0);
      if (insert2 && inserted < a.i)
        addInsert(insert2, sections, a.text);
      inserted = a.i;
      a.forward(a.len - left);
    } else if (a.done && b.done) {
      return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
    } else {
      throw new Error("Mismatched change set lengths");
    }
  }
}
function composeSets(setA, setB, mkSet = false) {
  let sections = [];
  let insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let open = false; ; ) {
    if (a.done && b.done) {
      return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
    } else if (a.ins == 0) {
      addSection(sections, a.len, 0, open);
      a.next();
    } else if (b.len == 0 && !b.done) {
      addSection(sections, 0, b.ins, open);
      if (insert2)
        addInsert(insert2, sections, b.text);
      b.next();
    } else if (a.done || b.done) {
      throw new Error("Mismatched change set lengths");
    } else {
      let len = Math.min(a.len2, b.len), sectionLen = sections.length;
      if (a.ins == -1) {
        let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
        addSection(sections, len, insB, open);
        if (insert2 && insB)
          addInsert(insert2, sections, b.text);
      } else if (b.ins == -1) {
        addSection(sections, a.off ? 0 : a.len, len, open);
        if (insert2)
          addInsert(insert2, sections, a.textBit(len));
      } else {
        addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
        if (insert2 && !b.off)
          addInsert(insert2, sections, b.text);
      }
      open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
      a.forward2(len);
      b.forward(len);
    }
  }
}
var SectionIter = class {
  constructor(set) {
    this.set = set;
    this.i = 0;
    this.next();
  }
  next() {
    let { sections } = this.set;
    if (this.i < sections.length) {
      this.len = sections[this.i++];
      this.ins = sections[this.i++];
    } else {
      this.len = 0;
      this.ins = -2;
    }
    this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted } = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length ? Text.empty : inserted[index];
  }
  textBit(len) {
    let { inserted } = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
  }
  forward(len) {
    if (len == this.len)
      this.next();
    else {
      this.len -= len;
      this.off += len;
    }
  }
  forward2(len) {
    if (this.ins == -1)
      this.forward(len);
    else if (len == this.ins)
      this.next();
    else {
      this.ins -= len;
      this.off += len;
    }
  }
};
var SelectionRange = class _SelectionRange {
  constructor(from, to, flags, goalColumn) {
    this.from = from;
    this.to = to;
    this.flags = flags;
    this.goalColumn = goalColumn;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  A flag that, when set, makes some selection-extending commands
  treat the range's head and anchor as exchangeable, so that for
  example Shift-ArrowUp will make the lower side of the selection
  the anchor, even if that was the head before. Used to implement
  MacOS-style undirectional selections.
  */
  get undirectional() {
    return (this.flags & 64) > 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let level = this.flags & 7;
    return level == 7 ? null : level;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(change, assoc = -1) {
    let from, to;
    if (this.empty) {
      from = to = change.mapPos(this.from, assoc);
    } else {
      from = change.mapPos(this.from, 1);
      to = change.mapPos(this.to, -1);
    }
    return from == this.from && to == this.to ? this : new _SelectionRange(from, to, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(from, to = from, assoc = 0) {
    if (from <= this.anchor && to >= this.anchor)
      return EditorSelection.range(from, to, void 0, void 0, assoc);
    let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
    return EditorSelection.range(this.anchor, head, void 0, void 0, assoc);
  }
  /**
  Compare this range to another range.
  */
  eq(other, includeAssoc = false) {
    return this.anchor == other.anchor && this.head == other.head && this.goalColumn == other.goalColumn && (!includeAssoc || !this.empty || this.assoc == other.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(json) {
    if (!json || typeof json.anchor != "number" || typeof json.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return EditorSelection.range(json.anchor, json.head);
  }
  /**
  @internal
  */
  static create(from, to, flags, goalColumn) {
    return new _SelectionRange(from, to, flags, goalColumn);
  }
};
var EditorSelection = class _EditorSelection {
  constructor(ranges, mainIndex) {
    this.ranges = ranges;
    this.mainIndex = mainIndex;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(change, assoc = -1) {
    if (change.empty)
      return this;
    return _EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(other, includeAssoc = false) {
    if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
      return false;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(other.ranges[i], includeAssoc))
        return false;
    return true;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new _EditorSelection([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(range, main = true) {
    return _EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(range, which = this.mainIndex) {
    let ranges = this.ranges.slice();
    ranges[which] = range;
    return _EditorSelection.create(ranges, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(json) {
    if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new _EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(anchor, head = anchor) {
    return new _EditorSelection([_EditorSelection.range(anchor, head)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(ranges, mainIndex = 0) {
    if (ranges.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let pos = 0, i = 0; i < ranges.length; i++) {
      let range = ranges[i];
      if (range.empty ? range.from <= pos : range.from < pos)
        return _EditorSelection.normalized(ranges.slice(), mainIndex);
      pos = range.to;
    }
    return new _EditorSelection(ranges, mainIndex);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
    return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 8 : 16) | (bidiLevel == null ? 7 : Math.min(6, bidiLevel)), goalColumn);
  }
  /**
  Create a selection range.
  */
  static range(anchor, head, goalColumn, bidiLevel, assoc) {
    let flags = bidiLevel == null ? 7 : Math.min(6, bidiLevel);
    if (!assoc && anchor != head)
      assoc = head < anchor ? 1 : -1;
    if (assoc)
      flags |= assoc < 0 ? 8 : 16;
    return head < anchor ? SelectionRange.create(head, anchor, flags | 32, goalColumn) : SelectionRange.create(anchor, head, flags, goalColumn);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(from, to) {
    return SelectionRange.create(from, to, 64, void 0);
  }
  /**
  @internal
  */
  static normalized(ranges, mainIndex = 0) {
    let main = ranges[mainIndex];
    ranges.sort((a, b) => a.from - b.from);
    mainIndex = ranges.indexOf(main);
    for (let i = 1; i < ranges.length; i++) {
      let range = ranges[i], prev = ranges[i - 1];
      if (range.empty ? range.from <= prev.to : range.from < prev.to) {
        let from = prev.from, to = Math.max(range.to, prev.to);
        if (i <= mainIndex)
          mainIndex--;
        ranges.splice(--i, 2, range.anchor > range.head ? _EditorSelection.range(to, from) : _EditorSelection.range(from, to));
      }
    }
    return new _EditorSelection(ranges, mainIndex);
  }
};
function checkSelection(selection, docLength) {
  for (let range of selection.ranges)
    if (range.to > docLength)
      throw new RangeError("Selection points outside of document");
}
var nextID = 0;
var Facet = class _Facet {
  constructor(combine, compareInput, compare2, isStatic, enables) {
    this.combine = combine;
    this.compareInput = compareInput;
    this.compare = compare2;
    this.isStatic = isStatic;
    this.id = nextID++;
    this.default = combine([]);
    this.extensions = typeof enables == "function" ? enables(this) : enables;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(config2 = {}) {
    return new _Facet(config2.combine || ((a) => a), config2.compareInput || ((a, b) => a === b), config2.compare || (!config2.combine ? sameArray : (a, b) => a === b), !!config2.static, config2.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(value) {
    return new FacetProvider([], this, 0, value);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 1, get);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 2, get);
  }
  from(field, get) {
    if (!get)
      get = (x) => x;
    return this.compute([field], (state) => get(state.field(field)));
  }
};
function sameArray(a, b) {
  return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
}
var FacetProvider = class {
  constructor(dependencies, facet, type, value) {
    this.dependencies = dependencies;
    this.facet = facet;
    this.type = type;
    this.value = value;
    this.id = nextID++;
  }
  dynamicSlot(addresses) {
    var _a2;
    let getter = this.value;
    let compare2 = this.facet.compareInput;
    let id = this.id, idx = addresses[id] >> 1, multi = this.type == 2;
    let depDoc = false, depSel = false, depAddrs = [];
    for (let dep of this.dependencies) {
      if (dep == "doc")
        depDoc = true;
      else if (dep == "selection")
        depSel = true;
      else if ((((_a2 = addresses[dep.id]) !== null && _a2 !== void 0 ? _a2 : 1) & 1) == 0)
        depAddrs.push(addresses[dep.id]);
    }
    return {
      create(state) {
        state.values[idx] = getter(state);
        return 1;
      },
      update(state, tr) {
        if (depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || ensureAll(state, depAddrs)) {
          let newVal = getter(state);
          if (multi ? !compareArray(newVal, state.values[idx], compare2) : !compare2(newVal, state.values[idx])) {
            state.values[idx] = newVal;
            return 1;
          }
        }
        return 0;
      },
      reconfigure: (state, oldState) => {
        let newVal, oldAddr = oldState.config.address[id];
        if (oldAddr != null) {
          let oldVal = getAddr(oldState, oldAddr);
          if (this.dependencies.every((dep) => {
            return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) : dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
          }) || (multi ? compareArray(newVal = getter(state), oldVal, compare2) : compare2(newVal = getter(state), oldVal))) {
            state.values[idx] = oldVal;
            return 0;
          }
        } else {
          newVal = getter(state);
        }
        state.values[idx] = newVal;
        return 1;
      }
    };
  }
  get extension() {
    return this;
  }
};
function compareArray(a, b, compare2) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!compare2(a[i], b[i]))
      return false;
  return true;
}
function ensureAll(state, addrs) {
  let changed = false;
  for (let addr of addrs)
    if (ensureAddr(state, addr) & 1)
      changed = true;
  return changed;
}
function dynamicFacetSlot(addresses, facet, providers) {
  let providerAddrs = providers.map((p) => addresses[p.id]);
  let providerTypes = providers.map((p) => p.type);
  let dynamic = providerAddrs.filter((p) => !(p & 1));
  let idx = addresses[facet.id] >> 1;
  function get(state) {
    let values = [];
    for (let i = 0; i < providerAddrs.length; i++) {
      let value = getAddr(state, providerAddrs[i]);
      if (providerTypes[i] == 2)
        for (let val of value)
          values.push(val);
      else
        values.push(value);
    }
    return facet.combine(values);
  }
  return {
    create(state) {
      for (let addr of providerAddrs)
        ensureAddr(state, addr);
      state.values[idx] = get(state);
      return 1;
    },
    update(state, tr) {
      if (!ensureAll(state, dynamic))
        return 0;
      let value = get(state);
      if (facet.compare(value, state.values[idx]))
        return 0;
      state.values[idx] = value;
      return 1;
    },
    reconfigure(state, oldState) {
      let depChanged = ensureAll(state, providerAddrs);
      let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
      if (oldProviders && !depChanged && sameArray(providers, oldProviders)) {
        state.values[idx] = oldValue;
        return 0;
      }
      let value = get(state);
      if (facet.compare(value, oldValue)) {
        state.values[idx] = oldValue;
        return 0;
      }
      state.values[idx] = value;
      return 1;
    }
  };
}
var initField = /* @__PURE__ */ Facet.define({ static: true });
var StateField = class _StateField {
  constructor(id, createF, updateF, compareF, spec) {
    this.id = id;
    this.createF = createF;
    this.updateF = updateF;
    this.compareF = compareF;
    this.spec = spec;
    this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(config2) {
    let field = new _StateField(nextID++, config2.create, config2.update, config2.compare || ((a, b) => a === b), config2);
    if (config2.provide)
      field.provides = config2.provide(field);
    return field;
  }
  create(state) {
    let init = state.facet(initField).find((i) => i.field == this);
    return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
  }
  /**
  @internal
  */
  slot(addresses) {
    let idx = addresses[this.id] >> 1;
    return {
      create: (state) => {
        state.values[idx] = this.create(state);
        return 1;
      },
      update: (state, tr) => {
        let oldVal = state.values[idx];
        let value = this.updateF(oldVal, tr);
        if (this.compareF(oldVal, value))
          return 0;
        state.values[idx] = value;
        return 1;
      },
      reconfigure: (state, oldState) => {
        let init = state.facet(initField), oldInit = oldState.facet(initField), reInit;
        if ((reInit = init.find((i) => i.field == this)) && reInit != oldInit.find((i) => i.field == this)) {
          state.values[idx] = reInit.create(state);
          return 1;
        }
        if (oldState.config.address[this.id] != null) {
          state.values[idx] = oldState.field(this);
          return 0;
        }
        state.values[idx] = this.create(state);
        return 1;
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(create) {
    return [this, initField.of({ field: this, create })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
};
var Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function prec(value) {
  return (ext) => new PrecExtension(ext, value);
}
var Prec = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ prec(Prec_.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ prec(Prec_.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ prec(Prec_.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ prec(Prec_.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ prec(Prec_.lowest)
};
var PrecExtension = class {
  constructor(inner, prec2) {
    this.inner = inner;
    this.prec = prec2;
  }
  get extension() {
    return this;
  }
};
var Compartment = class _Compartment {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(ext) {
    return new CompartmentInstance(this, ext);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(content2) {
    return _Compartment.reconfigure.of({ compartment: this, extension: content2 });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(state) {
    return state.config.compartments.get(this);
  }
};
var CompartmentInstance = class {
  constructor(compartment, inner) {
    this.compartment = compartment;
    this.inner = inner;
  }
  get extension() {
    return this;
  }
};
var Configuration = class _Configuration {
  constructor(base2, compartments, dynamicSlots, address, staticValues, facets) {
    this.base = base2;
    this.compartments = compartments;
    this.dynamicSlots = dynamicSlots;
    this.address = address;
    this.staticValues = staticValues;
    this.facets = facets;
    this.statusTemplate = [];
    while (this.statusTemplate.length < dynamicSlots.length)
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(facet) {
    let addr = this.address[facet.id];
    return addr == null ? facet.default : this.staticValues[addr >> 1];
  }
  static resolve(base2, compartments, oldState) {
    let fields = [];
    let facets = /* @__PURE__ */ Object.create(null);
    let newCompartments = /* @__PURE__ */ new Map();
    for (let ext of flatten(base2, compartments, newCompartments)) {
      if (ext instanceof StateField)
        fields.push(ext);
      else
        (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
    }
    let address = /* @__PURE__ */ Object.create(null);
    let staticValues = [];
    let dynamicSlots = [];
    for (let field of fields) {
      address[field.id] = dynamicSlots.length << 1;
      dynamicSlots.push((a) => field.slot(a));
    }
    let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
    for (let id in facets) {
      let providers = facets[id], facet = providers[0].facet;
      let oldProviders = oldFacets && oldFacets[id] || [];
      if (providers.every(
        (p) => p.type == 0
        /* Provider.Static */
      )) {
        address[facet.id] = staticValues.length << 1 | 1;
        if (sameArray(oldProviders, providers)) {
          staticValues.push(oldState.facet(facet));
        } else {
          let value = facet.combine(providers.map((p) => p.value));
          staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value);
        }
      } else {
        for (let p of providers) {
          if (p.type == 0) {
            address[p.id] = staticValues.length << 1 | 1;
            staticValues.push(p.value);
          } else {
            address[p.id] = dynamicSlots.length << 1;
            dynamicSlots.push((a) => p.dynamicSlot(a));
          }
        }
        address[facet.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
      }
    }
    let dynamic = dynamicSlots.map((f) => f(address));
    return new _Configuration(base2, newCompartments, dynamic, address, staticValues, facets);
  }
};
function flatten(extension, compartments, newCompartments) {
  let result = [[], [], [], [], []];
  let seen = /* @__PURE__ */ new Map();
  function inner(ext, prec2) {
    let known = seen.get(ext);
    if (known != null) {
      if (known <= prec2)
        return;
      let found = result[known].indexOf(ext);
      if (found > -1)
        result[known].splice(found, 1);
      if (ext instanceof CompartmentInstance)
        newCompartments.delete(ext.compartment);
    }
    seen.set(ext, prec2);
    if (Array.isArray(ext)) {
      for (let e of ext)
        inner(e, prec2);
    } else if (ext instanceof CompartmentInstance) {
      if (newCompartments.has(ext.compartment))
        throw new RangeError(`Duplicate use of compartment in extensions`);
      let content2 = compartments.get(ext.compartment) || ext.inner;
      newCompartments.set(ext.compartment, content2);
      inner(content2, prec2);
    } else if (ext instanceof PrecExtension) {
      inner(ext.inner, ext.prec);
    } else if (ext instanceof StateField) {
      result[prec2].push(ext);
      if (ext.provides)
        inner(ext.provides, prec2);
    } else if (ext instanceof FacetProvider) {
      result[prec2].push(ext);
      if (ext.facet.extensions)
        inner(ext.facet.extensions, Prec_.default);
    } else {
      let content2 = ext.extension;
      if (!content2)
        throw new Error(`Unrecognized extension value in extension set (${ext}).`);
      if (content2 == ext)
        throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      inner(content2, prec2);
    }
  }
  inner(extension, Prec_.default);
  return result.reduce((a, b) => a.concat(b));
}
function ensureAddr(state, addr) {
  if (addr & 1)
    return 2;
  let idx = addr >> 1;
  let status = state.status[idx];
  if (status == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (status & 2)
    return status;
  state.status[idx] = 4;
  let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
  return state.status[idx] = 2 | changed;
}
function getAddr(state, addr) {
  return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
}
var languageData = /* @__PURE__ */ Facet.define();
var allowMultipleSelections = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((v) => v),
  static: true
});
var lineSeparator = /* @__PURE__ */ Facet.define({
  combine: (values) => values.length ? values[0] : void 0,
  static: true
});
var changeFilter = /* @__PURE__ */ Facet.define();
var transactionFilter = /* @__PURE__ */ Facet.define();
var transactionExtender = /* @__PURE__ */ Facet.define();
var readOnly = /* @__PURE__ */ Facet.define({
  combine: (values) => values.length ? values[0] : false
});
var Annotation = class {
  /**
  @internal
  */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new AnnotationType();
  }
};
var AnnotationType = class {
  /**
  Create an instance of this annotation.
  */
  of(value) {
    return new Annotation(this, value);
  }
};
var StateEffectType = class {
  /**
  @internal
  */
  constructor(map) {
    this.map = map;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(value) {
    return new StateEffect(this, value);
  }
};
var StateEffect = class _StateEffect {
  /**
  @internal
  */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(mapping) {
    let mapped = this.type.map(this.value, mapping);
    return mapped === void 0 ? void 0 : mapped == this.value ? this : new _StateEffect(this.type, mapped);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(type) {
    return this.type == type;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(spec = {}) {
    return new StateEffectType(spec.map || ((v) => v));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(effects, mapping) {
    if (!effects.length)
      return effects;
    let result = [];
    for (let effect of effects) {
      let mapped = effect.map(mapping);
      if (mapped)
        result.push(mapped);
    }
    return result;
  }
};
StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
var Transaction = class _Transaction {
  constructor(startState, changes, selection, effects, annotations, scrollIntoView3) {
    this.startState = startState;
    this.changes = changes;
    this.selection = selection;
    this.effects = effects;
    this.annotations = annotations;
    this.scrollIntoView = scrollIntoView3;
    this._doc = null;
    this._state = null;
    if (selection)
      checkSelection(selection, changes.newLength);
    if (!annotations.some((a) => a.type == _Transaction.time))
      this.annotations = annotations.concat(_Transaction.time.of(Date.now()));
  }
  /**
  @internal
  */
  static create(startState, changes, selection, effects, annotations, scrollIntoView3) {
    return new _Transaction(startState, changes, selection, effects, annotations, scrollIntoView3);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    if (!this._state)
      this.startState.applyTransaction(this);
    return this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(type) {
    for (let ann of this.annotations)
      if (ann.type == type)
        return ann.value;
    return void 0;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(event) {
    let e = this.annotation(_Transaction.userEvent);
    return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
  }
};
Transaction.time = /* @__PURE__ */ Annotation.define();
Transaction.userEvent = /* @__PURE__ */ Annotation.define();
Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
Transaction.remote = /* @__PURE__ */ Annotation.define();
function joinRanges(a, b) {
  let result = [];
  for (let iA = 0, iB = 0; ; ) {
    let from, to;
    if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
      from = a[iA++];
      to = a[iA++];
    } else if (iB < b.length) {
      from = b[iB++];
      to = b[iB++];
    } else
      return result;
    if (!result.length || result[result.length - 1] < from)
      result.push(from, to);
    else if (result[result.length - 1] < to)
      result[result.length - 1] = to;
  }
}
function mergeTransaction(a, b, sequential) {
  var _a2;
  let mapForA, mapForB, changes;
  if (sequential) {
    mapForA = b.changes;
    mapForB = ChangeSet.empty(b.changes.length);
    changes = a.changes.compose(b.changes);
  } else {
    mapForA = b.changes.map(a.changes);
    mapForB = a.changes.mapDesc(b.changes, true);
    changes = a.changes.compose(mapForA);
  }
  return {
    changes,
    selection: b.selection ? b.selection.map(mapForB) : (_a2 = a.selection) === null || _a2 === void 0 ? void 0 : _a2.map(mapForA),
    effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
    annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
    scrollIntoView: a.scrollIntoView || b.scrollIntoView
  };
}
function resolveTransactionInner(state, spec, docSize) {
  let sel = spec.selection, annotations = asArray(spec.annotations);
  if (spec.userEvent)
    annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
  return {
    changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
    selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
    effects: asArray(spec.effects),
    annotations,
    scrollIntoView: !!spec.scrollIntoView
  };
}
function resolveTransaction(state, specs, filter) {
  let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
  if (specs.length && specs[0].filter === false)
    filter = false;
  for (let i = 1; i < specs.length; i++) {
    if (specs[i].filter === false)
      filter = false;
    let seq = !!specs[i].sequential;
    s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
  }
  let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
  return extendTransaction(filter ? filterTransaction(tr) : tr);
}
function filterTransaction(tr) {
  let state = tr.startState;
  let result = true;
  for (let filter of state.facet(changeFilter)) {
    let value = filter(tr);
    if (value === false) {
      result = false;
      break;
    }
    if (Array.isArray(value))
      result = result === true ? value : joinRanges(result, value);
  }
  if (result !== true) {
    let changes, back;
    if (result === false) {
      back = tr.changes.invertedDesc;
      changes = ChangeSet.empty(state.doc.length);
    } else {
      let filtered = tr.changes.filter(result);
      changes = filtered.changes;
      back = filtered.filtered.mapDesc(filtered.changes).invertedDesc;
    }
    tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
  }
  let filters = state.facet(transactionFilter);
  for (let i = filters.length - 1; i >= 0; i--) {
    let filtered = filters[i](tr);
    if (filtered instanceof Transaction)
      tr = filtered;
    else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
      tr = filtered[0];
    else
      tr = resolveTransaction(state, asArray(filtered), false);
  }
  return tr;
}
function extendTransaction(tr) {
  let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
  for (let i = extenders.length - 1; i >= 0; i--) {
    let extension = extenders[i](tr);
    if (extension && Object.keys(extension).length)
      spec = mergeTransaction(spec, resolveTransactionInner(state, extension, tr.changes.newLength), true);
  }
  return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
}
var none = [];
function asArray(value) {
  return value == null ? none : Array.isArray(value) ? value : [value];
}
var CharCategory = /* @__PURE__ */ (function(CharCategory2) {
  CharCategory2[CharCategory2["Word"] = 0] = "Word";
  CharCategory2[CharCategory2["Space"] = 1] = "Space";
  CharCategory2[CharCategory2["Other"] = 2] = "Other";
  return CharCategory2;
})(CharCategory || (CharCategory = {}));
var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
var wordChar;
try {
  wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch (_) {
}
function hasWordChar(str2) {
  if (wordChar)
    return wordChar.test(str2);
  for (let i = 0; i < str2.length; i++) {
    let ch = str2[i];
    if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
      return true;
  }
  return false;
}
function makeCategorizer(wordChars) {
  return (char) => {
    if (!/\S/.test(char))
      return CharCategory.Space;
    if (hasWordChar(char))
      return CharCategory.Word;
    for (let i = 0; i < wordChars.length; i++)
      if (char.indexOf(wordChars[i]) > -1)
        return CharCategory.Word;
    return CharCategory.Other;
  };
}
var EditorState = class _EditorState {
  constructor(config2, doc2, selection, values, computeSlot, tr) {
    this.config = config2;
    this.doc = doc2;
    this.selection = selection;
    this.values = values;
    this.status = config2.statusTemplate.slice();
    this.computeSlot = computeSlot;
    if (tr)
      tr._state = this;
    for (let i = 0; i < this.config.dynamicSlots.length; i++)
      ensureAddr(this, i << 1);
    this.computeSlot = null;
  }
  field(field, require2 = true) {
    let addr = this.config.address[field.id];
    if (addr == null) {
      if (require2)
        throw new RangeError("Field is not present in this state");
      return void 0;
    }
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...specs) {
    return resolveTransaction(this, specs, true);
  }
  /**
  @internal
  */
  applyTransaction(tr) {
    let conf = this.config, { base: base2, compartments } = conf;
    for (let effect of tr.effects) {
      if (effect.is(Compartment.reconfigure)) {
        if (conf) {
          compartments = /* @__PURE__ */ new Map();
          conf.compartments.forEach((val, key) => compartments.set(key, val));
          conf = null;
        }
        compartments.set(effect.value.compartment, effect.value.extension);
      } else if (effect.is(StateEffect.reconfigure)) {
        conf = null;
        base2 = effect.value;
      } else if (effect.is(StateEffect.appendConfig)) {
        conf = null;
        base2 = asArray(base2).concat(effect.value);
      }
    }
    let startValues;
    if (!conf) {
      conf = Configuration.resolve(base2, compartments, this);
      let intermediateState = new _EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
      startValues = intermediateState.values;
    } else {
      startValues = tr.startState.values.slice();
    }
    let selection = tr.startState.facet(allowMultipleSelections) ? tr.newSelection : tr.newSelection.asSingle();
    new _EditorState(conf, tr.newDoc, selection, startValues, (state, slot) => slot.update(state, tr), tr);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(text) {
    if (typeof text == "string")
      text = this.toText(text);
    return this.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + text.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(f) {
    let sel = this.selection;
    let result1 = f(sel.ranges[0]);
    let changes = this.changes(result1.changes), ranges = [result1.range];
    let effects = asArray(result1.effects);
    for (let i = 1; i < sel.ranges.length; i++) {
      let result = f(sel.ranges[i]);
      let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
      for (let j = 0; j < i; j++)
        ranges[j] = ranges[j].map(newMapped);
      let mapBy = changes.mapDesc(newChanges, true);
      ranges.push(result.range.map(mapBy));
      changes = changes.compose(newMapped);
      effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
    }
    return {
      changes,
      selection: EditorSelection.create(ranges, sel.mainIndex),
      effects
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(spec = []) {
    if (spec instanceof ChangeSet)
      return spec;
    return ChangeSet.of(spec, this.doc.length, this.facet(_EditorState.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(string2) {
    return Text.of(string2.split(this.facet(_EditorState.lineSeparator) || DefaultSplit));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(from = 0, to = this.doc.length) {
    return this.doc.sliceString(from, to, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(facet) {
    let addr = this.config.address[facet.id];
    if (addr == null)
      return facet.default;
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(fields) {
    let result = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (fields)
      for (let prop in fields) {
        let value = fields[prop];
        if (value instanceof StateField && this.config.address[value.id] != null)
          result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
      }
    return result;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(json, config2 = {}, fields) {
    if (!json || typeof json.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let fieldInit = [];
    if (fields)
      for (let prop in fields) {
        if (Object.prototype.hasOwnProperty.call(json, prop)) {
          let field = fields[prop], value = json[prop];
          fieldInit.push(field.init((state) => field.spec.fromJSON(value, state)));
        }
      }
    return _EditorState.create({
      doc: json.doc,
      selection: EditorSelection.fromJSON(json.selection),
      extensions: config2.extensions ? fieldInit.concat([config2.extensions]) : fieldInit
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(config2 = {}) {
    let configuration = Configuration.resolve(config2.extensions || [], /* @__PURE__ */ new Map());
    let doc2 = config2.doc instanceof Text ? config2.doc : Text.of((config2.doc || "").split(configuration.staticFacet(_EditorState.lineSeparator) || DefaultSplit));
    let selection = !config2.selection ? EditorSelection.single(0) : config2.selection instanceof EditorSelection ? config2.selection : EditorSelection.single(config2.selection.anchor, config2.selection.head);
    checkSelection(selection, doc2.length);
    if (!configuration.staticFacet(allowMultipleSelections))
      selection = selection.asSingle();
    return new _EditorState(configuration, doc2, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(_EditorState.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(_EditorState.lineSeparator) || "\n";
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(readOnly);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(phrase, ...insert2) {
    for (let map of this.facet(_EditorState.phrases))
      if (Object.prototype.hasOwnProperty.call(map, phrase)) {
        phrase = map[phrase];
        break;
      }
    if (insert2.length)
      phrase = phrase.replace(/\$(\$|\d*)/g, (m, i) => {
        if (i == "$")
          return "$";
        let n = +(i || 1);
        return !n || n > insert2.length ? m : insert2[n - 1];
      });
    return phrase;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(name2, pos, side = -1) {
    let values = [];
    for (let provider of this.facet(languageData)) {
      for (let result of provider(this, pos, side)) {
        if (Object.prototype.hasOwnProperty.call(result, name2))
          values.push(result[name2]);
      }
    }
    return values;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(at) {
    let chars = this.languageDataAt("wordChars", at);
    return makeCategorizer(chars.length ? chars[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(pos) {
    let { text, from, length } = this.doc.lineAt(pos);
    let cat = this.charCategorizer(pos);
    let start = pos - from, end = pos - from;
    while (start > 0) {
      let prev = findClusterBreak2(text, start, false);
      if (cat(text.slice(prev, start)) != CharCategory.Word)
        break;
      start = prev;
    }
    while (end < length) {
      let next = findClusterBreak2(text, end);
      if (cat(text.slice(end, next)) != CharCategory.Word)
        break;
      end = next;
    }
    return start == end ? null : EditorSelection.range(start + from, end + from);
  }
};
EditorState.allowMultipleSelections = allowMultipleSelections;
EditorState.tabSize = /* @__PURE__ */ Facet.define({
  combine: (values) => values.length ? values[0] : 4
});
EditorState.lineSeparator = lineSeparator;
EditorState.readOnly = readOnly;
EditorState.phrases = /* @__PURE__ */ Facet.define({
  compare(a, b) {
    let kA = Object.keys(a), kB = Object.keys(b);
    return kA.length == kB.length && kA.every((k) => a[k] == b[k]);
  }
});
EditorState.languageData = languageData;
EditorState.changeFilter = changeFilter;
EditorState.transactionFilter = transactionFilter;
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
function combineConfig(configs, defaults2, combine = {}) {
  let result = {};
  for (let config2 of configs)
    for (let key of Object.keys(config2)) {
      let value = config2[key], current = result[key];
      if (current === void 0)
        result[key] = value;
      else if (current === value || value === void 0) ;
      else if (Object.hasOwnProperty.call(combine, key))
        result[key] = combine[key](current, value);
      else
        throw new Error("Config merge conflict for field " + key);
    }
  for (let key in defaults2)
    if (result[key] === void 0)
      result[key] = defaults2[key];
  return result;
}
var RangeValue = class {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(other) {
    return this == other;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(from, to = from) {
    return Range.create(from, to, this);
  }
};
RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
RangeValue.prototype.point = false;
RangeValue.prototype.mapMode = MapMode.TrackDel;
function cmpVal(a, b) {
  return a == b || a.constructor == b.constructor && a.eq(b);
}
var Range = class _Range {
  constructor(from, to, value) {
    this.from = from;
    this.to = to;
    this.value = value;
  }
  /**
  @internal
  */
  static create(from, to, value) {
    return new _Range(from, to, value);
  }
};
function cmpRange(a, b) {
  return a.from - b.from || a.value.startSide - b.value.startSide;
}
var Chunk = class _Chunk {
  constructor(from, to, value, maxPoint) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.maxPoint = maxPoint;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(pos, side, end, startAt = 0) {
    let arr = end ? this.to : this.from;
    for (let lo = startAt, hi = arr.length; ; ) {
      if (lo == hi)
        return lo;
      let mid = lo + hi >> 1;
      let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
      if (mid == lo)
        return diff >= 0 ? lo : hi;
      if (diff >= 0)
        hi = mid;
      else
        lo = mid + 1;
    }
  }
  between(offset, from, to, f) {
    for (let i = this.findIndex(from, -1e9, true), e = this.findIndex(to, 1e9, false, i); i < e; i++)
      if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
        return false;
  }
  map(offset, changes) {
    let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
    for (let i = 0; i < this.value.length; i++) {
      let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
      if (curFrom == curTo) {
        let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
        if (mapped == null)
          continue;
        newFrom = newTo = mapped;
        if (val.startSide != val.endSide) {
          newTo = changes.mapPos(curFrom, val.endSide);
          if (newTo < newFrom)
            continue;
        }
      } else {
        newFrom = changes.mapPos(curFrom, val.startSide);
        newTo = changes.mapPos(curTo, val.endSide);
        if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
          continue;
      }
      if ((newTo - newFrom || val.endSide - val.startSide) < 0)
        continue;
      if (newPos < 0)
        newPos = newFrom;
      if (val.point)
        maxPoint = Math.max(maxPoint, newTo - newFrom);
      value.push(val);
      from.push(newFrom - newPos);
      to.push(newTo - newPos);
    }
    return { mapped: value.length ? new _Chunk(from, to, value, maxPoint) : null, pos: newPos };
  }
};
var RangeSet = class _RangeSet {
  constructor(chunkPos, chunk, nextLayer, maxPoint) {
    this.chunkPos = chunkPos;
    this.chunk = chunk;
    this.nextLayer = nextLayer;
    this.maxPoint = maxPoint;
  }
  /**
  @internal
  */
  static create(chunkPos, chunk, nextLayer, maxPoint) {
    return new _RangeSet(chunkPos, chunk, nextLayer, maxPoint);
  }
  /**
  @internal
  */
  get length() {
    let last = this.chunk.length - 1;
    return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let size = this.nextLayer.size;
    for (let chunk of this.chunk)
      size += chunk.value.length;
    return size;
  }
  /**
  @internal
  */
  chunkEnd(index) {
    return this.chunkPos[index] + this.chunk[index].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(updateSpec) {
    let { add: add2 = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
    let filter = updateSpec.filter;
    if (add2.length == 0 && !filter)
      return this;
    if (sort)
      add2 = add2.slice().sort(cmpRange);
    if (this.isEmpty)
      return add2.length ? _RangeSet.of(add2) : this;
    let cur2 = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
    let builder = new RangeSetBuilder();
    while (cur2.value || i < add2.length) {
      if (i < add2.length && (cur2.from - add2[i].from || cur2.startSide - add2[i].value.startSide) >= 0) {
        let range = add2[i++];
        if (!builder.addInner(range.from, range.to, range.value))
          spill.push(range);
      } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i == add2.length || this.chunkEnd(cur2.chunkIndex) < add2[i].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
        cur2.nextChunk();
      } else {
        if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
          if (!builder.addInner(cur2.from, cur2.to, cur2.value))
            spill.push(Range.create(cur2.from, cur2.to, cur2.value));
        }
        cur2.next();
      }
    }
    return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? _RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(changes) {
    if (changes.empty || this.isEmpty)
      return this;
    let chunks = [], chunkPos = [], maxPoint = -1;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      let touch = changes.touchesRange(start, start + chunk.length);
      if (touch === false) {
        maxPoint = Math.max(maxPoint, chunk.maxPoint);
        chunks.push(chunk);
        chunkPos.push(changes.mapPos(start));
      } else if (touch === true) {
        let { mapped, pos } = chunk.map(start, changes);
        if (mapped) {
          maxPoint = Math.max(maxPoint, mapped.maxPoint);
          chunks.push(mapped);
          chunkPos.push(pos);
        }
      }
    }
    let next = this.nextLayer.map(changes);
    return chunks.length == 0 ? next : new _RangeSet(chunkPos, chunks, next || _RangeSet.empty, maxPoint);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(from, to, f) {
    if (this.isEmpty)
      return;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
        return;
    }
    this.nextLayer.between(from, to, f);
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(from = 0) {
    return HeapCursor.from([this]).goto(from);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(sets, from = 0) {
    return HeapCursor.from(sets).goto(from);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
    let a = oldSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
    let b = newSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
    let sharedChunks = findSharedChunks(a, b, textDiff);
    let sideA = new SpanCursor(a, sharedChunks, minPointSize);
    let sideB = new SpanCursor(b, sharedChunks, minPointSize);
    textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
    if (textDiff.empty && textDiff.length == 0)
      compare(sideA, 0, sideB, 0, 0, comparator);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(oldSets, newSets, from = 0, to) {
    if (to == null)
      to = 1e9 - 1;
    let a = oldSets.filter((set) => !set.isEmpty && newSets.indexOf(set) < 0);
    let b = newSets.filter((set) => !set.isEmpty && oldSets.indexOf(set) < 0);
    if (a.length != b.length)
      return false;
    if (!a.length)
      return true;
    let sharedChunks = findSharedChunks(a, b);
    let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
    for (; ; ) {
      if (sideA.to != sideB.to || !sameValues(sideA.active, sideB.active) || sideA.point && (!sideB.point || !cmpVal(sideA.point, sideB.point)))
        return false;
      if (sideA.to > to)
        return true;
      sideA.next();
      sideB.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(sets, from, to, iterator, minPointSize = -1) {
    let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
    let openRanges = cursor.openStart;
    for (; ; ) {
      let curTo = Math.min(cursor.to, to);
      if (cursor.point) {
        let active = cursor.activeForPoint(cursor.to);
        let openCount = cursor.pointFrom < from ? active.length + 1 : cursor.point.startSide < 0 ? active.length : Math.min(active.length, openRanges);
        iterator.point(pos, curTo, cursor.point, active, openCount, cursor.pointRank);
        openRanges = Math.min(cursor.openEnd(curTo), active.length);
      } else if (curTo > pos) {
        iterator.span(pos, curTo, cursor.active, openRanges);
        openRanges = cursor.openEnd(curTo);
      }
      if (cursor.to > to)
        return openRanges + (cursor.point && cursor.to > to ? 1 : 0);
      pos = cursor.to;
      cursor.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(ranges, sort = false) {
    let build = new RangeSetBuilder();
    for (let range of ranges instanceof Range ? [ranges] : sort ? lazySort(ranges) : ranges)
      build.add(range.from, range.to, range.value);
    return build.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(sets) {
    if (!sets.length)
      return _RangeSet.empty;
    let result = sets[sets.length - 1];
    for (let i = sets.length - 2; i >= 0; i--) {
      for (let layer = sets[i]; layer != _RangeSet.empty; layer = layer.nextLayer)
        result = new _RangeSet(layer.chunkPos, layer.chunk, result, Math.max(layer.maxPoint, result.maxPoint));
    }
    return result;
  }
};
RangeSet.empty = /* @__PURE__ */ new RangeSet([], [], null, -1);
function lazySort(ranges) {
  if (ranges.length > 1)
    for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
      let cur2 = ranges[i];
      if (cmpRange(prev, cur2) > 0)
        return ranges.slice().sort(cmpRange);
      prev = cur2;
    }
  return ranges;
}
RangeSet.empty.nextLayer = RangeSet.empty;
var RangeSetBuilder = class _RangeSetBuilder {
  finishChunk(newArrays) {
    this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
    this.chunkPos.push(this.chunkStart);
    this.chunkStart = -1;
    this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
    this.maxPoint = -1;
    if (newArrays) {
      this.from = [];
      this.to = [];
      this.value = [];
    }
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [];
    this.chunkPos = [];
    this.chunkStart = -1;
    this.last = null;
    this.lastFrom = -1e9;
    this.lastTo = -1e9;
    this.from = [];
    this.to = [];
    this.value = [];
    this.maxPoint = -1;
    this.setMaxPoint = -1;
    this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(from, to, value) {
    if (!this.addInner(from, to, value))
      (this.nextLayer || (this.nextLayer = new _RangeSetBuilder())).add(from, to, value);
  }
  /**
  @internal
  */
  addInner(from, to, value) {
    let diff = from - this.lastTo || value.startSide - this.last.endSide;
    if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    if (diff < 0)
      return false;
    if (this.from.length == 250)
      this.finishChunk(true);
    if (this.chunkStart < 0)
      this.chunkStart = from;
    this.from.push(from - this.chunkStart);
    this.to.push(to - this.chunkStart);
    this.last = value;
    this.lastFrom = from;
    this.lastTo = to;
    this.value.push(value);
    if (value.point)
      this.maxPoint = Math.max(this.maxPoint, to - from);
    return true;
  }
  /**
  @internal
  */
  addChunk(from, chunk) {
    if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
      return false;
    if (this.from.length)
      this.finishChunk(true);
    this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
    this.chunks.push(chunk);
    this.chunkPos.push(from);
    let last = chunk.value.length - 1;
    this.last = chunk.value[last];
    this.lastFrom = chunk.from[last] + from;
    this.lastTo = chunk.to[last] + from;
    return true;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(RangeSet.empty);
  }
  /**
  @internal
  */
  finishInner(next) {
    if (this.from.length)
      this.finishChunk(false);
    if (this.chunks.length == 0)
      return next;
    let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
    this.from = null;
    return result;
  }
};
function findSharedChunks(a, b, textDiff) {
  let inA = /* @__PURE__ */ new Map();
  for (let set of a)
    for (let i = 0; i < set.chunk.length; i++)
      if (set.chunk[i].maxPoint <= 0)
        inA.set(set.chunk[i], set.chunkPos[i]);
  let shared = /* @__PURE__ */ new Set();
  for (let set of b)
    for (let i = 0; i < set.chunk.length; i++) {
      let known = inA.get(set.chunk[i]);
      if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i] && !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set.chunk[i].length)))
        shared.add(set.chunk[i]);
    }
  return shared;
}
var LayerCursor = class {
  constructor(layer, skip, minPoint, rank = 0) {
    this.layer = layer;
    this.skip = skip;
    this.minPoint = minPoint;
    this.rank = rank;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(pos, side = -1e9) {
    this.chunkIndex = this.rangeIndex = 0;
    this.gotoInner(pos, side, false);
    return this;
  }
  gotoInner(pos, side, forward) {
    while (this.chunkIndex < this.layer.chunk.length) {
      let next = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
        break;
      this.chunkIndex++;
      forward = false;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
      if (!forward || this.rangeIndex < rangeIndex)
        this.setRangeIndex(rangeIndex);
    }
    this.next();
  }
  forward(pos, side) {
    if ((this.to - pos || this.endSide - side) < 0)
      this.gotoInner(pos, side, true);
  }
  next() {
    for (; ; ) {
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9;
        this.value = null;
        break;
      } else {
        let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
        let from = chunkPos + chunk.from[this.rangeIndex];
        this.from = from;
        this.to = chunkPos + chunk.to[this.rangeIndex];
        this.value = chunk.value[this.rangeIndex];
        this.setRangeIndex(this.rangeIndex + 1);
        if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
    }
  }
  setRangeIndex(index) {
    if (index == this.layer.chunk[this.chunkIndex].value.length) {
      this.chunkIndex++;
      if (this.skip) {
        while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
          this.chunkIndex++;
      }
      this.rangeIndex = 0;
    } else {
      this.rangeIndex = index;
    }
  }
  nextChunk() {
    this.chunkIndex++;
    this.rangeIndex = 0;
    this.next();
  }
  compare(other) {
    return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank || this.to - other.to || this.endSide - other.endSide;
  }
};
var HeapCursor = class _HeapCursor {
  constructor(heap) {
    this.heap = heap;
  }
  static from(sets, skip = null, minPoint = -1) {
    let heap = [];
    for (let i = 0; i < sets.length; i++) {
      for (let cur2 = sets[i]; !cur2.isEmpty; cur2 = cur2.nextLayer) {
        if (cur2.maxPoint >= minPoint)
          heap.push(new LayerCursor(cur2, skip, minPoint, i));
      }
    }
    return heap.length == 1 ? heap[0] : new _HeapCursor(heap);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(pos, side = -1e9) {
    for (let cur2 of this.heap)
      cur2.goto(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    this.next();
    return this;
  }
  forward(pos, side) {
    for (let cur2 of this.heap)
      cur2.forward(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    if ((this.to - pos || this.value.endSide - side) < 0)
      this.next();
  }
  next() {
    if (this.heap.length == 0) {
      this.from = this.to = 1e9;
      this.value = null;
      this.rank = -1;
    } else {
      let top2 = this.heap[0];
      this.from = top2.from;
      this.to = top2.to;
      this.value = top2.value;
      this.rank = top2.rank;
      if (top2.value)
        top2.next();
      heapBubble(this.heap, 0);
    }
  }
};
function heapBubble(heap, index) {
  for (let cur2 = heap[index]; ; ) {
    let childIndex = (index << 1) + 1;
    if (childIndex >= heap.length)
      break;
    let child = heap[childIndex];
    if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
      child = heap[childIndex + 1];
      childIndex++;
    }
    if (cur2.compare(child) < 0)
      break;
    heap[childIndex] = cur2;
    heap[index] = child;
    index = childIndex;
  }
}
var SpanCursor = class {
  constructor(sets, skip, minPoint) {
    this.minPoint = minPoint;
    this.active = [];
    this.activeTo = [];
    this.activeRank = [];
    this.minActive = -1;
    this.point = null;
    this.pointFrom = 0;
    this.pointRank = 0;
    this.to = -1e9;
    this.endSide = 0;
    this.openStart = -1;
    this.cursor = HeapCursor.from(sets, skip, minPoint);
  }
  goto(pos, side = -1e9) {
    this.cursor.goto(pos, side);
    this.active.length = this.activeTo.length = this.activeRank.length = 0;
    this.minActive = -1;
    this.to = pos;
    this.endSide = side;
    this.openStart = -1;
    this.next();
    return this;
  }
  forward(pos, side) {
    while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
      this.removeActive(this.minActive);
    this.cursor.forward(pos, side);
  }
  removeActive(index) {
    remove(this.active, index);
    remove(this.activeTo, index);
    remove(this.activeRank, index);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  addActive(trackOpen) {
    let i = 0, { value, to, rank } = this.cursor;
    while (i < this.activeRank.length && (rank - this.activeRank[i] || to - this.activeTo[i]) > 0)
      i++;
    insert(this.active, i, value);
    insert(this.activeTo, i, to);
    insert(this.activeRank, i, rank);
    if (trackOpen)
      insert(trackOpen, i, this.cursor.from);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let from = this.to, wasPoint = this.point;
    this.point = null;
    let trackOpen = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let a = this.minActive;
      if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[a] > from) {
          this.to = this.activeTo[a];
          this.endSide = this.active[a].endSide;
          break;
        }
        this.removeActive(a);
        if (trackOpen)
          remove(trackOpen, a);
      } else if (!this.cursor.value) {
        this.to = this.endSide = 1e9;
        break;
      } else if (this.cursor.from > from) {
        this.to = this.cursor.from;
        this.endSide = this.cursor.startSide;
        break;
      } else {
        let nextVal = this.cursor.value;
        if (!nextVal.point) {
          this.addActive(trackOpen);
          this.cursor.next();
        } else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
          this.cursor.next();
        } else {
          this.point = nextVal;
          this.pointFrom = this.cursor.from;
          this.pointRank = this.cursor.rank;
          this.to = this.cursor.to;
          this.endSide = nextVal.endSide;
          this.cursor.next();
          this.forward(this.to, this.endSide);
          break;
        }
      }
    }
    if (trackOpen) {
      this.openStart = 0;
      for (let i = trackOpen.length - 1; i >= 0 && trackOpen[i] < from; i--)
        this.openStart++;
    }
  }
  activeForPoint(to) {
    if (!this.active.length)
      return this.active;
    let active = [];
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.activeRank[i] < this.pointRank)
        break;
      if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide >= this.point.endSide)
        active.push(this.active[i]);
    }
    return active.reverse();
  }
  openEnd(to) {
    let open = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to; i--)
      open++;
    return open;
  }
};
function compare(a, startA, b, startB, length, comparator) {
  a.goto(startA);
  b.goto(startB);
  let endB = startB + length;
  let pos = startB, dPos = startB - startA;
  let bounds = !!comparator.boundChange;
  for (let boundChange = false; ; ) {
    let dEnd = a.to + dPos - b.to, diff = dEnd || a.endSide - b.endSide;
    let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
    let point = a.point || b.point;
    if (point) {
      if (!(a.point && b.point && cmpVal(a.point, b.point) && sameValues(a.activeForPoint(a.to), b.activeForPoint(b.to))))
        comparator.comparePoint(pos, clipEnd, a.point, b.point);
      boundChange = false;
    } else {
      if (boundChange)
        comparator.boundChange(pos);
      if (clipEnd > pos && !sameValues(a.active, b.active))
        comparator.compareRange(pos, clipEnd, a.active, b.active);
      if (bounds && clipEnd < endB && (dEnd || a.openEnd(end) != b.openEnd(end)))
        boundChange = true;
    }
    if (end > endB)
      break;
    pos = end;
    if (diff <= 0)
      a.next();
    if (diff >= 0)
      b.next();
  }
}
function sameValues(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (a[i] != b[i] && !cmpVal(a[i], b[i]))
      return false;
  return true;
}
function remove(array, index) {
  for (let i = index, e = array.length - 1; i < e; i++)
    array[i] = array[i + 1];
  array.pop();
}
function insert(array, index, value) {
  for (let i = array.length - 1; i >= index; i--)
    array[i + 1] = array[i];
  array[index] = value;
}
function findMinIndex(value, array) {
  let found = -1, foundPos = 1e9;
  for (let i = 0; i < array.length; i++)
    if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
      found = i;
      foundPos = array[i];
    }
  return found;
}
function countColumn(string2, tabSize, to = string2.length) {
  let n = 0;
  for (let i = 0; i < to && i < string2.length; ) {
    if (string2.charCodeAt(i) == 9) {
      n += tabSize - n % tabSize;
      i++;
    } else {
      n++;
      i = findClusterBreak2(string2, i);
    }
  }
  return n;
}
function findColumn(string2, col, tabSize, strict) {
  for (let i = 0, n = 0; ; ) {
    if (n >= col)
      return i;
    if (i == string2.length)
      break;
    n += string2.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
    i = findClusterBreak2(string2, i);
  }
  return strict === true ? -1 : string2.length;
}

// node_modules/style-mod/src/style-mod.js
var C = "\u037C";
var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
var StyleModule = class {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(spec, options) {
    this.rules = [];
    let { finish } = options || {};
    function splitSelector(selector) {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
    }
    function render(selectors, spec2, target, isKeyframes) {
      let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
      if (isAt && spec2 == null) return target.push(selectors[0] + ";");
      for (let prop in spec2) {
        let value = spec2[prop];
        if (/&/.test(prop)) {
          render(
            prop.split(/,\s*/).map((part) => selectors.map((sel) => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)),
            value,
            target
          );
        } else if (value && typeof value == "object") {
          if (!isAt) throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
          render(splitSelector(prop), value, local, keyframes);
        } else if (value != null) {
          local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
        }
      }
      if (local.length || keyframes) {
        target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
      }
    }
    for (let prop in spec) render(splitSelector(prop), spec[prop], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join("\n");
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let id = top[COUNT] || 1;
    top[COUNT] = id + 1;
    return C + id.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(root, modules, options) {
    let set = root[SET], nonce = options && options.nonce;
    if (!set) set = new StyleSet(root, nonce);
    else if (nonce) set.setNonce(nonce);
    set.mount(Array.isArray(modules) ? modules : [modules], root);
  }
};
var adoptedSet = /* @__PURE__ */ new Map();
var StyleSet = class {
  constructor(root, nonce) {
    let doc2 = root.ownerDocument || root, win = doc2.defaultView;
    if (!root.head && root.adoptedStyleSheets && win.CSSStyleSheet) {
      let adopted = adoptedSet.get(doc2);
      if (adopted) return root[SET] = adopted;
      this.sheet = new win.CSSStyleSheet();
      adoptedSet.set(doc2, this);
    } else {
      this.styleTag = doc2.createElement("style");
      if (nonce) this.styleTag.setAttribute("nonce", nonce);
    }
    this.modules = [];
    root[SET] = this;
  }
  mount(modules, root) {
    let sheet = this.sheet;
    let pos = 0, j = 0;
    for (let i = 0; i < modules.length; i++) {
      let mod = modules[i], index = this.modules.indexOf(mod);
      if (index < j && index > -1) {
        this.modules.splice(index, 1);
        j--;
        index = -1;
      }
      if (index == -1) {
        this.modules.splice(j++, 0, mod);
        if (sheet) for (let k = 0; k < mod.rules.length; k++)
          sheet.insertRule(mod.rules[k], pos++);
      } else {
        while (j < index) pos += this.modules[j++].rules.length;
        pos += mod.rules.length;
        j++;
      }
    }
    if (sheet) {
      if (root.adoptedStyleSheets.indexOf(this.sheet) < 0)
        root.adoptedStyleSheets = [this.sheet, ...root.adoptedStyleSheets];
    } else {
      let text = "";
      for (let i = 0; i < this.modules.length; i++)
        text += this.modules[i].getRules() + "\n";
      this.styleTag.textContent = text;
      let target = root.head || root;
      if (this.styleTag.parentNode != target)
        target.insertBefore(this.styleTag, target.firstChild);
    }
  }
  setNonce(nonce) {
    if (this.styleTag && this.styleTag.getAttribute("nonce") != nonce)
      this.styleTag.setAttribute("nonce", nonce);
  }
};

// node_modules/w3c-keyname/index.js
var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
};
var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
};
var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);
var i;
for (i = 1; i <= 24; i++) base[i + 111] = "F" + i;
var i;
for (i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32);
  shift[i] = String.fromCharCode(i);
}
var i;
for (code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code];
var code;
function keyName(event) {
  var ignoreKey = mac && event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey || ie && event.shiftKey && event.key && event.key.length == 1 || event.key == "Unidentified";
  var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
  if (name2 == "Esc") name2 = "Escape";
  if (name2 == "Del") name2 = "Delete";
  if (name2 == "Left") name2 = "ArrowLeft";
  if (name2 == "Up") name2 = "ArrowUp";
  if (name2 == "Right") name2 = "ArrowRight";
  if (name2 == "Down") name2 = "ArrowDown";
  return name2;
}

// node_modules/crelt/index.js
function crelt() {
  var elt = arguments[0];
  if (typeof elt == "string") elt = document.createElement(elt);
  var i = 1, next = arguments[1];
  if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
    for (var name2 in next) if (Object.prototype.hasOwnProperty.call(next, name2)) {
      var value = next[name2];
      if (typeof value == "string") elt.setAttribute(name2, value);
      else if (value != null) elt[name2] = value;
    }
    i++;
  }
  for (; i < arguments.length; i++) add(elt, arguments[i]);
  return elt;
}
function add(elt, child) {
  if (typeof child == "string") {
    elt.appendChild(document.createTextNode(child));
  } else if (child == null) {
  } else if (child.nodeType != null) {
    elt.appendChild(child);
  } else if (Array.isArray(child)) {
    for (var i = 0; i < child.length; i++) add(elt, child[i]);
  } else {
    throw new RangeError("Unsupported child node: " + child);
  }
}

// node_modules/@codemirror/view/dist/index.js
var nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
var doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
var ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
var ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
var ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
var gecko = !ie2 && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
var chrome = !ie2 && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
var webkit = "webkitFontSmoothing" in doc.documentElement.style;
var safari = !ie2 && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
var ios = safari && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
var browser = {
  mac: ios || /* @__PURE__ */ /Mac/.test(nav.platform),
  windows: /* @__PURE__ */ /Win/.test(nav.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(nav.platform),
  ie: ie2,
  ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
  gecko,
  gecko_version: gecko ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
  chrome: !!chrome,
  chrome_version: chrome ? +chrome[1] : 0,
  ios,
  android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
  webkit,
  webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
  safari,
  safari_version: safari ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(nav.userAgent) || [0, 0])[1] : 0,
  tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function combineAttrs(source, target) {
  for (let name2 in source) {
    if (name2 == "class" && target.class)
      target.class += " " + source.class;
    else if (name2 == "style" && target.style)
      target.style += ";" + source.style;
    else
      target[name2] = source[name2];
  }
  return target;
}
var noAttrs = /* @__PURE__ */ Object.create(null);
function attrsEq(a, b, ignore) {
  if (a == b)
    return true;
  if (!a)
    a = noAttrs;
  if (!b)
    b = noAttrs;
  let keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length - (ignore && keysA.indexOf(ignore) > -1 ? 1 : 0) != keysB.length - (ignore && keysB.indexOf(ignore) > -1 ? 1 : 0))
    return false;
  for (let key of keysA) {
    if (key != ignore && (keysB.indexOf(key) == -1 || a[key] !== b[key]))
      return false;
  }
  return true;
}
function setAttrs(dom, attrs) {
  for (let i = dom.attributes.length - 1; i >= 0; i--) {
    let name2 = dom.attributes[i].name;
    if (attrs[name2] == null)
      dom.removeAttribute(name2);
  }
  for (let name2 in attrs) {
    let value = attrs[name2];
    if (name2 == "style")
      dom.style.cssText = value;
    else if (dom.getAttribute(name2) != value)
      dom.setAttribute(name2, value);
  }
}
function updateAttrs(dom, prev, attrs) {
  let changed = false;
  if (prev) {
    for (let name2 in prev)
      if (!(attrs && name2 in attrs)) {
        changed = true;
        if (name2 == "style")
          dom.style.cssText = "";
        else
          dom.removeAttribute(name2);
      }
  }
  if (attrs) {
    for (let name2 in attrs)
      if (!(prev && prev[name2] == attrs[name2])) {
        changed = true;
        if (name2 == "style")
          dom.style.cssText = attrs[name2];
        else
          dom.setAttribute(name2, attrs[name2]);
      }
  }
  return changed;
}
function getAttrs(dom) {
  let attrs = /* @__PURE__ */ Object.create(null);
  for (let i = 0; i < dom.attributes.length; i++) {
    let attr = dom.attributes[i];
    attrs[attr.name] = attr.value;
  }
  return attrs;
}
var WidgetType = class {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(widget) {
    return false;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(dom, view, from) {
    return false;
  }
  /**
  @internal
  */
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(event) {
    return true;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(dom, pos, side) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return false;
  }
  /**
  @internal
  */
  get editable() {
    return false;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(dom) {
  }
};
var BlockType = /* @__PURE__ */ (function(BlockType2) {
  BlockType2[BlockType2["Text"] = 0] = "Text";
  BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
  BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
  BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
  return BlockType2;
})(BlockType || (BlockType = {}));
var Decoration = class extends RangeValue {
  constructor(startSide, endSide, widget, spec) {
    super();
    this.startSide = startSide;
    this.endSide = endSide;
    this.widget = widget;
    this.spec = spec;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return false;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(spec) {
    return new MarkDecoration(spec);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(spec) {
    let side = Math.max(-1e4, Math.min(1e4, spec.side || 0)), block = !!spec.block;
    side += block && !spec.inlineOrder ? side > 0 ? 3e8 : -4e8 : side > 0 ? 1e8 : -1e8;
    return new PointDecoration(spec, side, side, block, spec.widget || null, false);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(spec) {
    let block = !!spec.block, startSide, endSide;
    if (spec.isBlockGap) {
      startSide = -5e8;
      endSide = 4e8;
    } else {
      let { start, end } = getInclusive(spec, block);
      startSide = (start ? block ? -3e8 : -1 : 5e8) - 1;
      endSide = (end ? block ? 2e8 : 1 : -6e8) + 1;
    }
    return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(spec) {
    return new LineDecoration(spec);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(of, sort = false) {
    return RangeSet.of(of, sort);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : false;
  }
};
Decoration.none = RangeSet.empty;
var MarkDecoration = class _MarkDecoration extends Decoration {
  constructor(spec) {
    let { start, end } = getInclusive(spec);
    super(start ? -1 : 5e8, end ? 1 : -6e8, null, spec);
    this.tagName = spec.tagName || "span";
    this.attrs = spec.class && spec.attributes ? combineAttrs(spec.attributes, { class: spec.class }) : spec.class ? { class: spec.class } : spec.attributes || noAttrs;
  }
  eq(other) {
    return this == other || other instanceof _MarkDecoration && this.tagName == other.tagName && attrsEq(this.attrs, other.attrs);
  }
  range(from, to = from) {
    if (from >= to)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(from, to);
  }
};
MarkDecoration.prototype.point = false;
var LineDecoration = class _LineDecoration extends Decoration {
  constructor(spec) {
    super(-2e8, -2e8, null, spec);
  }
  eq(other) {
    return other instanceof _LineDecoration && this.spec.class == other.spec.class && attrsEq(this.spec.attributes, other.spec.attributes);
  }
  range(from, to = from) {
    if (to != from)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(from, to);
  }
};
LineDecoration.prototype.mapMode = MapMode.TrackBefore;
LineDecoration.prototype.point = true;
var PointDecoration = class _PointDecoration extends Decoration {
  constructor(spec, startSide, endSide, block, widget, isReplace) {
    super(startSide, endSide, widget, spec);
    this.block = block;
    this.isReplace = isReplace;
    this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? BlockType.WidgetRange : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(other) {
    return other instanceof _PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
  }
  range(from, to = from) {
    if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && to != from)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(from, to);
  }
};
PointDecoration.prototype.point = true;
function getInclusive(spec, block = false) {
  let { inclusiveStart: start, inclusiveEnd: end } = spec;
  if (start == null)
    start = spec.inclusive;
  if (end == null)
    end = spec.inclusive;
  return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
}
function widgetsEq(a, b) {
  return a == b || !!(a && b && a.compare(b));
}
function addRange(from, to, ranges, margin = 0) {
  let last = ranges.length - 1;
  if (last >= 0 && ranges[last] + margin >= from)
    ranges[last] = Math.max(ranges[last], to);
  else
    ranges.push(from, to);
}
var BlockWrapper = class _BlockWrapper extends RangeValue {
  constructor(tagName, attributes, rank) {
    super();
    this.tagName = tagName;
    this.attributes = attributes;
    this.rank = rank;
  }
  eq(other) {
    return other == this || other instanceof _BlockWrapper && this.tagName == other.tagName && attrsEq(this.attributes, other.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(spec) {
    return new _BlockWrapper(spec.tagName, spec.attributes || noAttrs, spec.rank == null ? 50 : Math.max(0, Math.min(spec.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(of, sort = false) {
    return RangeSet.of(of, sort);
  }
};
BlockWrapper.prototype.startSide = BlockWrapper.prototype.endSide = -1;
function getSelection(root) {
  let target;
  if (root.nodeType == 11) {
    target = root.getSelection ? root : root.ownerDocument;
  } else {
    target = root;
  }
  return target.getSelection();
}
function contains(dom, node) {
  return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
}
function hasSelection(dom, selection) {
  if (!selection.anchorNode)
    return false;
  try {
    return contains(dom, selection.anchorNode);
  } catch (_) {
    return false;
  }
}
function clientRectsFor(dom) {
  if (dom.nodeType == 3)
    return textRange(dom, 0, dom.nodeValue.length).getClientRects();
  else if (dom.nodeType == 1)
    return dom.getClientRects();
  else
    return [];
}
function isEquivalentPosition(node, off, targetNode, targetOff) {
  return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
}
function domIndex(node) {
  for (var index = 0; ; index++) {
    node = node.previousSibling;
    if (!node)
      return index;
  }
}
function isBlockElement(node) {
  return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
}
function scanFor(node, off, targetNode, targetOff, dir) {
  for (; ; ) {
    if (node == targetNode && off == targetOff)
      return true;
    if (off == (dir < 0 ? 0 : maxOffset(node))) {
      if (node.nodeName == "DIV")
        return false;
      let parent = node.parentNode;
      if (!parent || parent.nodeType != 1)
        return false;
      off = domIndex(node) + (dir < 0 ? 0 : 1);
      node = parent;
    } else if (node.nodeType == 1) {
      node = node.childNodes[off + (dir < 0 ? -1 : 0)];
      if (node.nodeType == 1 && node.contentEditable == "false")
        return false;
      off = dir < 0 ? maxOffset(node) : 0;
    } else {
      return false;
    }
  }
}
function maxOffset(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
function flattenRect(rect, toLeft) {
  let { left, right } = rect;
  if (left == right)
    return rect;
  let x = toLeft ? left : right;
  return { left: x, right: x, top: rect.top, bottom: rect.bottom };
}
function windowRect(win) {
  let vp = win.visualViewport;
  if (vp)
    return {
      left: 0,
      right: vp.width,
      top: 0,
      bottom: vp.height
    };
  return {
    left: 0,
    right: win.innerWidth,
    top: 0,
    bottom: win.innerHeight
  };
}
function getScale(elt, rect) {
  let scaleX = rect.width / elt.offsetWidth;
  let scaleY = rect.height / elt.offsetHeight;
  if (scaleX > 0.995 && scaleX < 1.005 || !isFinite(scaleX) || Math.abs(rect.width - elt.offsetWidth) < 1)
    scaleX = 1;
  if (scaleY > 0.995 && scaleY < 1.005 || !isFinite(scaleY) || Math.abs(rect.height - elt.offsetHeight) < 1)
    scaleY = 1;
  return { scaleX, scaleY };
}
function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
  let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
  for (let cur2 = dom, stop = false; cur2 && !stop; ) {
    if (cur2.nodeType == 1) {
      let bounding, top2 = cur2 == doc2.body;
      let scaleX = 1, scaleY = 1;
      if (top2) {
        bounding = windowRect(win);
      } else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(cur2).position))
          stop = true;
        if (cur2.scrollHeight <= cur2.clientHeight && cur2.scrollWidth <= cur2.clientWidth) {
          cur2 = cur2.assignedSlot || cur2.parentNode;
          continue;
        }
        let rect2 = cur2.getBoundingClientRect();
        ({ scaleX, scaleY } = getScale(cur2, rect2));
        bounding = {
          left: rect2.left,
          right: rect2.left + cur2.clientWidth * scaleX,
          top: rect2.top,
          bottom: rect2.top + cur2.clientHeight * scaleY
        };
      }
      let moveX = 0, moveY = 0;
      if (y == "nearest") {
        if (rect.top < bounding.top + yMargin) {
          moveY = rect.top - (bounding.top + yMargin);
          if (side > 0 && rect.bottom > bounding.bottom + moveY)
            moveY = rect.bottom - bounding.bottom + yMargin;
        } else if (rect.bottom > bounding.bottom - yMargin) {
          moveY = rect.bottom - bounding.bottom + yMargin;
          if (side < 0 && rect.top - moveY < bounding.top)
            moveY = rect.top - (bounding.top + yMargin);
        }
      } else {
        let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
        let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 : y == "start" || y == "center" && side < 0 ? rect.top - yMargin : rect.bottom - boundingHeight + yMargin;
        moveY = targetTop - bounding.top;
      }
      if (x == "nearest") {
        if (rect.left < bounding.left + xMargin) {
          moveX = rect.left - (bounding.left + xMargin);
          if (side > 0 && rect.right > bounding.right + moveX)
            moveX = rect.right - bounding.right + xMargin;
        } else if (rect.right > bounding.right - xMargin) {
          moveX = rect.right - bounding.right + xMargin;
          if (side < 0 && rect.left < bounding.left + moveX)
            moveX = rect.left - (bounding.left + xMargin);
        }
      } else {
        let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 : x == "start" == ltr ? rect.left - xMargin : rect.right - (bounding.right - bounding.left) + xMargin;
        moveX = targetLeft - bounding.left;
      }
      if (moveX || moveY) {
        if (top2) {
          win.scrollBy(moveX, moveY);
        } else {
          let movedX = 0, movedY = 0;
          if (moveY) {
            let start = cur2.scrollTop;
            cur2.scrollTop += moveY / scaleY;
            movedY = (cur2.scrollTop - start) * scaleY;
          }
          if (moveX) {
            let start = cur2.scrollLeft;
            cur2.scrollLeft += moveX / scaleX;
            movedX = (cur2.scrollLeft - start) * scaleX;
          }
          rect = {
            left: rect.left - movedX,
            top: rect.top - movedY,
            right: rect.right - movedX,
            bottom: rect.bottom - movedY
          };
          if (movedX && Math.abs(movedX - moveX) < 1)
            x = "nearest";
          if (movedY && Math.abs(movedY - moveY) < 1)
            y = "nearest";
        }
      }
      if (top2)
        break;
      if (rect.top < bounding.top || rect.bottom > bounding.bottom || rect.left < bounding.left || rect.right > bounding.right)
        rect = {
          left: Math.max(rect.left, bounding.left),
          right: Math.min(rect.right, bounding.right),
          top: Math.max(rect.top, bounding.top),
          bottom: Math.min(rect.bottom, bounding.bottom)
        };
      cur2 = cur2.assignedSlot || cur2.parentNode;
    } else if (cur2.nodeType == 11) {
      cur2 = cur2.host;
    } else {
      break;
    }
  }
}
function scrollableParents(dom, getX = true) {
  let doc2 = dom.ownerDocument, x = null, y = null;
  for (let cur2 = dom.parentNode; cur2; ) {
    if (cur2 == doc2.body || (!getX || x) && y) {
      break;
    } else if (cur2.nodeType == 1) {
      if (!y && cur2.scrollHeight > cur2.clientHeight)
        y = cur2;
      if (getX && !x && cur2.scrollWidth > cur2.clientWidth)
        x = cur2;
      cur2 = cur2.assignedSlot || cur2.parentNode;
    } else if (cur2.nodeType == 11) {
      cur2 = cur2.host;
    } else {
      break;
    }
  }
  return { x, y };
}
var DOMSelectionState = class {
  constructor() {
    this.anchorNode = null;
    this.anchorOffset = 0;
    this.focusNode = null;
    this.focusOffset = 0;
  }
  eq(domSel) {
    return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
  }
  setRange(range) {
    let { anchorNode, focusNode } = range;
    this.set(anchorNode, Math.min(range.anchorOffset, anchorNode ? maxOffset(anchorNode) : 0), focusNode, Math.min(range.focusOffset, focusNode ? maxOffset(focusNode) : 0));
  }
  set(anchorNode, anchorOffset, focusNode, focusOffset) {
    this.anchorNode = anchorNode;
    this.anchorOffset = anchorOffset;
    this.focusNode = focusNode;
    this.focusOffset = focusOffset;
  }
};
var preventScrollSupported = null;
if (browser.safari && browser.safari_version >= 26)
  preventScrollSupported = false;
function focusPreventScroll(dom) {
  if (dom.setActive)
    return dom.setActive();
  if (preventScrollSupported)
    return dom.focus(preventScrollSupported);
  let stack = [];
  for (let cur2 = dom; cur2; cur2 = cur2.parentNode) {
    stack.push(cur2, cur2.scrollTop, cur2.scrollLeft);
    if (cur2 == cur2.ownerDocument)
      break;
  }
  dom.focus(preventScrollSupported == null ? {
    get preventScroll() {
      preventScrollSupported = { preventScroll: true };
      return true;
    }
  } : void 0);
  if (!preventScrollSupported) {
    preventScrollSupported = false;
    for (let i = 0; i < stack.length; ) {
      let elt = stack[i++], top2 = stack[i++], left = stack[i++];
      if (elt.scrollTop != top2)
        elt.scrollTop = top2;
      if (elt.scrollLeft != left)
        elt.scrollLeft = left;
    }
  }
}
var scratchRange;
function textRange(node, from, to = from) {
  let range = scratchRange || (scratchRange = document.createRange());
  range.setEnd(node, to);
  range.setStart(node, from);
  return range;
}
function dispatchKey(elt, name2, code, mods) {
  let options = { key: name2, code: name2, keyCode: code, which: code, cancelable: true };
  if (mods)
    ({ altKey: options.altKey, ctrlKey: options.ctrlKey, shiftKey: options.shiftKey, metaKey: options.metaKey } = mods);
  let down = new KeyboardEvent("keydown", options);
  down.synthetic = true;
  elt.dispatchEvent(down);
  let up = new KeyboardEvent("keyup", options);
  up.synthetic = true;
  elt.dispatchEvent(up);
  return down.defaultPrevented || up.defaultPrevented;
}
function getRoot(node) {
  while (node) {
    if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
      return node;
    node = node.assignedSlot || node.parentNode;
  }
  return null;
}
function atElementStart(doc2, selection) {
  let node = selection.focusNode, offset = selection.focusOffset;
  if (!node || selection.anchorNode != node || selection.anchorOffset != offset)
    return false;
  offset = Math.min(offset, maxOffset(node));
  for (; ; ) {
    if (offset) {
      if (node.nodeType != 1)
        return false;
      let prev = node.childNodes[offset - 1];
      if (prev.contentEditable == "false")
        offset--;
      else {
        node = prev;
        offset = maxOffset(node);
      }
    } else if (node == doc2) {
      return true;
    } else {
      offset = domIndex(node);
      node = node.parentNode;
    }
  }
}
function isScrolledToBottom(elt) {
  if (elt instanceof Window)
    return elt.pageYOffset > Math.max(0, elt.document.documentElement.scrollHeight - elt.innerHeight - 4);
  return elt.scrollTop > Math.max(1, elt.scrollHeight - elt.clientHeight - 4);
}
function textNodeBefore(startNode, startOffset) {
  for (let node = startNode, offset = startOffset; ; ) {
    if (node.nodeType == 3 && offset > 0) {
      return { node, offset };
    } else if (node.nodeType == 1 && offset > 0) {
      if (node.contentEditable == "false")
        return null;
      node = node.childNodes[offset - 1];
      offset = maxOffset(node);
    } else if (node.parentNode && !isBlockElement(node)) {
      offset = domIndex(node);
      node = node.parentNode;
    } else {
      return null;
    }
  }
}
function textNodeAfter(startNode, startOffset) {
  for (let node = startNode, offset = startOffset; ; ) {
    if (node.nodeType == 3 && offset < node.nodeValue.length) {
      return { node, offset };
    } else if (node.nodeType == 1 && offset < node.childNodes.length) {
      if (node.contentEditable == "false")
        return null;
      node = node.childNodes[offset];
      offset = 0;
    } else if (node.parentNode && !isBlockElement(node)) {
      offset = domIndex(node) + 1;
      node = node.parentNode;
    } else {
      return null;
    }
  }
}
var DOMPos = class _DOMPos {
  constructor(node, offset, precise = true) {
    this.node = node;
    this.offset = offset;
    this.precise = precise;
  }
  static before(dom, precise) {
    return new _DOMPos(dom.parentNode, domIndex(dom), precise);
  }
  static after(dom, precise) {
    return new _DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
  }
};
var Direction = /* @__PURE__ */ (function(Direction2) {
  Direction2[Direction2["LTR"] = 0] = "LTR";
  Direction2[Direction2["RTL"] = 1] = "RTL";
  return Direction2;
})(Direction || (Direction = {}));
var LTR = Direction.LTR;
var RTL = Direction.RTL;
function dec(str2) {
  let result = [];
  for (let i = 0; i < str2.length; i++)
    result.push(1 << +str2[i]);
  return result;
}
var LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
var ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
var Brackets = /* @__PURE__ */ Object.create(null);
var BracketStack = [];
for (let p of ["()", "[]", "{}"]) {
  let l = /* @__PURE__ */ p.charCodeAt(0), r = /* @__PURE__ */ p.charCodeAt(1);
  Brackets[l] = r;
  Brackets[r] = -l;
}
function charType(ch) {
  return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8204 ? 256 : 64336 <= ch && ch <= 65023 ? 4 : 1;
}
var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
var BidiSpan = class {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? RTL : LTR;
  }
  /**
  @internal
  */
  constructor(from, to, level) {
    this.from = from;
    this.to = to;
    this.level = level;
  }
  /**
  @internal
  */
  side(end, dir) {
    return this.dir == dir == end ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(forward, dir) {
    return forward == (this.dir == dir);
  }
  /**
  @internal
  */
  static find(order, index, level, assoc) {
    let maybe = -1;
    for (let i = 0; i < order.length; i++) {
      let span = order[i];
      if (span.from <= index && span.to >= index) {
        if (span.level == level)
          return i;
        if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe].level > span.level))
          maybe = i;
      }
    }
    if (maybe < 0)
      throw new RangeError("Index out of range");
    return maybe;
  }
};
function isolatesEq(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    let iA = a[i], iB = b[i];
    if (iA.from != iB.from || iA.to != iB.to || iA.direction != iB.direction || !isolatesEq(iA.inner, iB.inner))
      return false;
  }
  return true;
}
var types = [];
function computeCharTypes(line, rFrom, rTo, isolates, outerType) {
  for (let iI = 0; iI <= isolates.length; iI++) {
    let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
    let prevType = iI ? 256 : outerType;
    for (let i = from, prev = prevType, prevStrong = prevType; i < to; i++) {
      let type = charType(line.charCodeAt(i));
      if (type == 512)
        type = prev;
      else if (type == 8 && prevStrong == 4)
        type = 16;
      types[i] = type == 4 ? 2 : type;
      if (type & 7)
        prevStrong = type;
      prev = type;
    }
    for (let i = from, prev = prevType, prevStrong = prevType; i < to; i++) {
      let type = types[i];
      if (type == 128) {
        if (i < to - 1 && prev == types[i + 1] && prev & 24)
          type = types[i] = prev;
        else
          types[i] = 256;
      } else if (type == 64) {
        let end = i + 1;
        while (end < to && types[end] == 64)
          end++;
        let replace2 = i && prev == 8 || end < rTo && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
        for (let j = i; j < end; j++)
          types[j] = replace2;
        i = end - 1;
      } else if (type == 8 && prevStrong == 1) {
        types[i] = 1;
      }
      prev = type;
      if (type & 7)
        prevStrong = type;
    }
  }
}
function processBracketPairs(line, rFrom, rTo, isolates, outerType) {
  let oppositeType = outerType == 1 ? 2 : 1;
  for (let iI = 0, sI = 0, context = 0; iI <= isolates.length; iI++) {
    let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
    for (let i = from, ch, br, type; i < to; i++) {
      if (br = Brackets[ch = line.charCodeAt(i)]) {
        if (br < 0) {
          for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
            if (BracketStack[sJ + 1] == -br) {
              let flags = BracketStack[sJ + 2];
              let type2 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
              if (type2)
                types[i] = types[BracketStack[sJ]] = type2;
              sI = sJ;
              break;
            }
          }
        } else if (BracketStack.length == 189) {
          break;
        } else {
          BracketStack[sI++] = i;
          BracketStack[sI++] = ch;
          BracketStack[sI++] = context;
        }
      } else if ((type = types[i]) == 2 || type == 1) {
        let embed = type == outerType;
        context = embed ? 0 : 1;
        for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
          let cur2 = BracketStack[sJ + 2];
          if (cur2 & 2)
            break;
          if (embed) {
            BracketStack[sJ + 2] |= 2;
          } else {
            if (cur2 & 4)
              break;
            BracketStack[sJ + 2] |= 4;
          }
        }
      }
    }
  }
}
function processNeutrals(rFrom, rTo, isolates, outerType) {
  for (let iI = 0, prev = outerType; iI <= isolates.length; iI++) {
    let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
    for (let i = from; i < to; ) {
      let type = types[i];
      if (type == 256) {
        let end = i + 1;
        for (; ; ) {
          if (end == to) {
            if (iI == isolates.length)
              break;
            end = isolates[iI++].to;
            to = iI < isolates.length ? isolates[iI].from : rTo;
          } else if (types[end] == 256) {
            end++;
          } else {
            break;
          }
        }
        let beforeL = prev == 1;
        let afterL = (end < rTo ? types[end] : outerType) == 1;
        let replace2 = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
        for (let j = end, jI = iI, fromJ = jI ? isolates[jI - 1].to : rFrom; j > i; ) {
          if (j == fromJ) {
            j = isolates[--jI].from;
            fromJ = jI ? isolates[jI - 1].to : rFrom;
          }
          types[--j] = replace2;
        }
        i = end;
      } else {
        prev = type;
        i++;
      }
    }
  }
}
function emitSpans(line, from, to, level, baseLevel, isolates, order) {
  let ourType = level % 2 ? 2 : 1;
  if (level % 2 == baseLevel % 2) {
    for (let iCh = from, iI = 0; iCh < to; ) {
      let sameDir = true, isNum = false;
      if (iI == isolates.length || iCh < isolates[iI].from) {
        let next = types[iCh];
        if (next != ourType) {
          sameDir = false;
          isNum = next == 16;
        }
      }
      let recurse = !sameDir && ourType == 1 ? [] : null;
      let localLevel = sameDir ? level : level + 1;
      let iScan = iCh;
      run: for (; ; ) {
        if (iI < isolates.length && iScan == isolates[iI].from) {
          if (isNum)
            break run;
          let iso = isolates[iI];
          if (!sameDir)
            for (let upto = iso.to, jI = iI + 1; ; ) {
              if (upto == to)
                break run;
              if (jI < isolates.length && isolates[jI].from == upto)
                upto = isolates[jI++].to;
              else if (types[upto] == ourType)
                break run;
              else
                break;
            }
          iI++;
          if (recurse) {
            recurse.push(iso);
          } else {
            if (iso.from > iCh)
              order.push(new BidiSpan(iCh, iso.from, localLevel));
            let dirSwap = iso.direction == LTR != !(localLevel % 2);
            computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
            iCh = iso.to;
          }
          iScan = iso.to;
        } else if (iScan == to || (sameDir ? types[iScan] != ourType : types[iScan] == ourType)) {
          break;
        } else {
          iScan++;
        }
      }
      if (recurse)
        emitSpans(line, iCh, iScan, level + 1, baseLevel, recurse, order);
      else if (iCh < iScan)
        order.push(new BidiSpan(iCh, iScan, localLevel));
      iCh = iScan;
    }
  } else {
    for (let iCh = to, iI = isolates.length; iCh > from; ) {
      let sameDir = true, isNum = false;
      if (!iI || iCh > isolates[iI - 1].to) {
        let next = types[iCh - 1];
        if (next != ourType) {
          sameDir = false;
          isNum = next == 16;
        }
      }
      let recurse = !sameDir && ourType == 1 ? [] : null;
      let localLevel = sameDir ? level : level + 1;
      let iScan = iCh;
      run: for (; ; ) {
        if (iI && iScan == isolates[iI - 1].to) {
          if (isNum)
            break run;
          let iso = isolates[--iI];
          if (!sameDir)
            for (let upto = iso.from, jI = iI; ; ) {
              if (upto == from)
                break run;
              if (jI && isolates[jI - 1].to == upto)
                upto = isolates[--jI].from;
              else if (types[upto - 1] == ourType)
                break run;
              else
                break;
            }
          if (recurse) {
            recurse.push(iso);
          } else {
            if (iso.to < iCh)
              order.push(new BidiSpan(iso.to, iCh, localLevel));
            let dirSwap = iso.direction == LTR != !(localLevel % 2);
            computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
            iCh = iso.from;
          }
          iScan = iso.from;
        } else if (iScan == from || (sameDir ? types[iScan - 1] != ourType : types[iScan - 1] == ourType)) {
          break;
        } else {
          iScan--;
        }
      }
      if (recurse)
        emitSpans(line, iScan, iCh, level + 1, baseLevel, recurse, order);
      else if (iScan < iCh)
        order.push(new BidiSpan(iScan, iCh, localLevel));
      iCh = iScan;
    }
  }
}
function computeSectionOrder(line, level, baseLevel, isolates, from, to, order) {
  let outerType = level % 2 ? 2 : 1;
  computeCharTypes(line, from, to, isolates, outerType);
  processBracketPairs(line, from, to, isolates, outerType);
  processNeutrals(from, to, isolates, outerType);
  emitSpans(line, from, to, level, baseLevel, isolates, order);
}
function computeOrder(line, direction, isolates) {
  if (!line)
    return [new BidiSpan(0, 0, direction == RTL ? 1 : 0)];
  if (direction == LTR && !isolates.length && !BidiRE.test(line))
    return trivialOrder(line.length);
  if (isolates.length)
    while (line.length > types.length)
      types[types.length] = 256;
  let order = [], level = direction == LTR ? 0 : 1;
  computeSectionOrder(line, level, level, isolates, 0, line.length, order);
  return order;
}
function trivialOrder(length) {
  return [new BidiSpan(0, length, 0)];
}
var movedOver = "";
function moveVisually(line, order, dir, start, forward) {
  var _a2;
  let startIndex = start.head - line.from;
  let spanI = BidiSpan.find(order, startIndex, (_a2 = start.bidiLevel) !== null && _a2 !== void 0 ? _a2 : -1, start.assoc);
  let span = order[spanI], spanEnd = span.side(forward, dir);
  if (startIndex == spanEnd) {
    let nextI = spanI += forward ? 1 : -1;
    if (nextI < 0 || nextI >= order.length)
      return null;
    span = order[spanI = nextI];
    startIndex = span.side(!forward, dir);
    spanEnd = span.side(forward, dir);
  }
  let nextIndex = findClusterBreak2(line.text, startIndex, span.forward(forward, dir));
  if (nextIndex < span.from || nextIndex > span.to)
    nextIndex = spanEnd;
  movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
  let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
  if (nextSpan && nextIndex == spanEnd && nextSpan.level + (forward ? 0 : 1) < span.level)
    return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, nextSpan.forward(forward, dir) ? 1 : -1, nextSpan.level);
  return EditorSelection.cursor(nextIndex + line.from, span.forward(forward, dir) ? -1 : 1, span.level);
}
function autoDirection(text, from, to) {
  for (let i = from; i < to; i++) {
    let type = charType(text.charCodeAt(i));
    if (type == 1)
      return LTR;
    if (type == 2 || type == 4)
      return RTL;
  }
  return LTR;
}
var clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
var dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
var mouseSelectionStyle = /* @__PURE__ */ Facet.define();
var exceptionSink = /* @__PURE__ */ Facet.define();
var updateListener = /* @__PURE__ */ Facet.define();
var inputHandler = /* @__PURE__ */ Facet.define();
var focusChangeEffect = /* @__PURE__ */ Facet.define();
var clipboardInputFilter = /* @__PURE__ */ Facet.define();
var clipboardOutputFilter = /* @__PURE__ */ Facet.define();
var perLineTextDirection = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((x) => x)
});
var nativeSelectionHidden = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((x) => x)
});
var scrollHandler = /* @__PURE__ */ Facet.define();
var ScrollTarget = class _ScrollTarget {
  constructor(range, y, x, yMargin, xMargin, isSnapshot = false) {
    this.range = range;
    this.y = y;
    this.x = x;
    this.yMargin = yMargin;
    this.xMargin = xMargin;
    this.isSnapshot = isSnapshot;
  }
  map(changes) {
    return changes.empty ? this : new _ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(state) {
    return this.range.to <= state.doc.length ? this : new _ScrollTarget(EditorSelection.cursor(state.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
};
var scrollIntoView = /* @__PURE__ */ StateEffect.define({ map: (t2, ch) => t2.map(ch) });
var setEditContextFormatting = /* @__PURE__ */ StateEffect.define();
function logException(state, exception, context) {
  let handler = state.facet(exceptionSink);
  if (handler.length)
    handler[0](exception);
  else if (window.onerror && window.onerror(String(exception), context, void 0, void 0, exception)) ;
  else if (context)
    console.error(context + ":", exception);
  else
    console.error(exception);
}
var editable = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : true });
var nextPluginID = 0;
var viewPlugin = /* @__PURE__ */ Facet.define({
  combine(plugins) {
    return plugins.filter((p, i) => {
      for (let j = 0; j < i; j++)
        if (plugins[j].plugin == p.plugin)
          return false;
      return true;
    });
  }
});
var ViewPlugin = class _ViewPlugin {
  constructor(id, create, domEventHandlers, domEventObservers, buildExtensions) {
    this.id = id;
    this.create = create;
    this.domEventHandlers = domEventHandlers;
    this.domEventObservers = domEventObservers;
    this.baseExtensions = buildExtensions(this);
    this.extension = this.baseExtensions.concat(viewPlugin.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(arg) {
    return this.baseExtensions.concat(viewPlugin.of({ plugin: this, arg }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(create, spec) {
    const { eventHandlers, eventObservers, provide, decorations: deco } = spec || {};
    return new _ViewPlugin(nextPluginID++, create, eventHandlers, eventObservers, (plugin) => {
      let ext = [];
      if (deco)
        ext.push(decorations.of((view) => {
          let pluginInst = view.plugin(plugin);
          return pluginInst ? deco(pluginInst) : Decoration.none;
        }));
      if (provide)
        ext.push(provide(plugin));
      return ext;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(cls, spec) {
    return _ViewPlugin.define((view, arg) => new cls(view, arg), spec);
  }
};
var PluginInstance = class {
  constructor(spec) {
    this.spec = spec;
    this.mustUpdate = null;
    this.value = null;
  }
  get plugin() {
    return this.spec && this.spec.plugin;
  }
  update(view) {
    if (!this.value) {
      if (this.spec) {
        try {
          this.value = this.spec.plugin.create(view, this.spec.arg);
        } catch (e) {
          logException(view.state, e, "CodeMirror plugin crashed");
          this.deactivate();
        }
      }
    } else if (this.mustUpdate) {
      let update = this.mustUpdate;
      this.mustUpdate = null;
      if (this.value.update) {
        try {
          this.value.update(update);
        } catch (e) {
          logException(update.state, e, "CodeMirror plugin crashed");
          if (this.value.destroy)
            try {
              this.value.destroy();
            } catch (_) {
            }
          this.deactivate();
        }
      }
    }
    return this;
  }
  destroy(view) {
    var _a2;
    if ((_a2 = this.value) === null || _a2 === void 0 ? void 0 : _a2.destroy) {
      try {
        this.value.destroy();
      } catch (e) {
        logException(view.state, e, "CodeMirror plugin crashed");
      }
    }
  }
  deactivate() {
    this.spec = this.value = null;
  }
};
var editorAttributes = /* @__PURE__ */ Facet.define();
var contentAttributes = /* @__PURE__ */ Facet.define();
var decorations = /* @__PURE__ */ Facet.define();
var blockWrappers = /* @__PURE__ */ Facet.define();
var outerDecorations = /* @__PURE__ */ Facet.define();
var atomicRanges = /* @__PURE__ */ Facet.define();
var bidiIsolatedRanges = /* @__PURE__ */ Facet.define();
function getIsolatedRanges(view, line) {
  let isolates = view.state.facet(bidiIsolatedRanges);
  if (!isolates.length)
    return isolates;
  let sets = isolates.map((i) => i instanceof Function ? i(view) : i);
  let result = [];
  RangeSet.spans(sets, line.from, line.to, {
    point() {
    },
    span(fromDoc, toDoc, active, open) {
      let from = fromDoc - line.from, to = toDoc - line.from;
      let level = result;
      for (let i = active.length - 1; i >= 0; i--, open--) {
        let direction = active[i].spec.bidiIsolate, update;
        if (direction == null)
          direction = autoDirection(line.text, from, to);
        if (open > 0 && level.length && (update = level[level.length - 1]).to == from && update.direction == direction) {
          update.to = to;
          level = update.inner;
        } else {
          let add2 = { from, to, direction, inner: [] };
          level.push(add2);
          level = add2.inner;
        }
      }
    }
  });
  return result;
}
var scrollMargins = /* @__PURE__ */ Facet.define();
function getScrollMargins(view) {
  let left = 0, right = 0, top2 = 0, bottom = 0;
  for (let source of view.state.facet(scrollMargins)) {
    let m = source(view);
    if (m) {
      if (m.left != null)
        left = Math.max(left, m.left);
      if (m.right != null)
        right = Math.max(right, m.right);
      if (m.top != null)
        top2 = Math.max(top2, m.top);
      if (m.bottom != null)
        bottom = Math.max(bottom, m.bottom);
    }
  }
  return { left, right, top: top2, bottom };
}
var styleModule = /* @__PURE__ */ Facet.define();
var ChangedRange = class _ChangedRange {
  constructor(fromA, toA, fromB, toB) {
    this.fromA = fromA;
    this.toA = toA;
    this.fromB = fromB;
    this.toB = toB;
  }
  join(other) {
    return new _ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
  }
  addToSet(set) {
    let i = set.length, me = this;
    for (; i > 0; i--) {
      let range = set[i - 1];
      if (range.fromA > me.toA)
        continue;
      if (range.toA < me.fromA)
        break;
      me = me.join(range);
      set.splice(i - 1, 1);
    }
    set.splice(i, 0, me);
    return set;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(diff, ranges) {
    if (ranges.length == 0)
      return diff;
    let result = [];
    for (let dI = 0, rI = 0, off = 0; ; ) {
      let nextD = dI < diff.length ? diff[dI].fromB : 1e9;
      let nextR = rI < ranges.length ? ranges[rI] : 1e9;
      let fromB = Math.min(nextD, nextR);
      if (fromB == 1e9)
        break;
      let fromA = fromB + off, toB = fromB, toA = fromA;
      for (; ; ) {
        if (rI < ranges.length && ranges[rI] <= toB) {
          let end = ranges[rI + 1];
          rI += 2;
          toB = Math.max(toB, end);
          for (let i = dI; i < diff.length && diff[i].fromB <= toB; i++)
            off = diff[i].toA - diff[i].toB;
          toA = Math.max(toA, end + off);
        } else if (dI < diff.length && diff[dI].fromB <= toB) {
          let next = diff[dI++];
          toB = Math.max(toB, next.toB);
          toA = Math.max(toA, next.toA);
          off = next.toA - next.toB;
        } else {
          break;
        }
      }
      result.push(new _ChangedRange(fromA, toA, fromB, toB));
    }
    return result;
  }
};
var ViewUpdate = class _ViewUpdate {
  constructor(view, state, transactions) {
    this.view = view;
    this.state = state;
    this.transactions = transactions;
    this.flags = 0;
    this.startState = view.state;
    this.changes = ChangeSet.empty(this.startState.doc.length);
    for (let tr of transactions)
      this.changes = this.changes.compose(tr.changes);
    let changedRanges = [];
    this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
    this.changedRanges = changedRanges;
  }
  /**
  @internal
  */
  static create(view, state, transactions) {
    return new _ViewUpdate(view, state, transactions);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Returns true when
  [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
  and the viewport change is not just the result of mapping it in
  response to document changes.
  */
  get viewportMoved() {
    return (this.flags & 8) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & (16 | 2)) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((tr) => tr.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
};
var noChildren = [];
var Tile = class {
  constructor(dom, length, flags = 0) {
    this.dom = dom;
    this.length = length;
    this.flags = flags;
    this.parent = null;
    dom.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return noChildren;
  }
  isWidget() {
    return false;
  }
  get isHidden() {
    return false;
  }
  isComposite() {
    return false;
  }
  isLine() {
    return false;
  }
  isText() {
    return false;
  }
  isBlock() {
    return false;
  }
  get domAttrs() {
    return null;
  }
  sync(track) {
    this.flags |= 2;
    if (this.flags & 4) {
      this.flags &= ~4;
      let attrs = this.domAttrs;
      if (attrs)
        setAttrs(this.dom, attrs);
    }
  }
  toString() {
    return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
  }
  destroy() {
    this.parent = null;
  }
  setDOM(dom) {
    this.dom = dom;
    dom.cmTile = this;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(tile, start = this.posAtStart) {
    let pos = start;
    for (let child of this.children) {
      if (child == tile)
        return pos;
      pos += child.length + child.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(tile) {
    return this.posBefore(tile) + tile.length;
  }
  covers(side) {
    return true;
  }
  coordsIn(pos, side, rtl) {
    return null;
  }
  domPosFor(off, side) {
    let index = domIndex(this.dom);
    let after = this.length ? off > 0 : side > 0;
    return new DOMPos(this.parent.dom, index + (after ? 1 : 0), off == 0 || off == this.length);
  }
  markDirty(attrs) {
    this.flags &= ~2;
    if (attrs)
      this.flags |= 4;
    if (this.parent && this.parent.flags & 2)
      this.parent.markDirty(false);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let t2 = this; t2; t2 = t2.parent)
      if (t2 instanceof DocTile)
        return t2;
    return null;
  }
  static get(dom) {
    return dom.cmTile;
  }
};
var CompositeTile = class extends Tile {
  constructor(dom) {
    super(dom, 0);
    this._children = [];
  }
  isComposite() {
    return true;
  }
  get children() {
    return this._children;
  }
  get lastChild() {
    return this.children.length ? this.children[this.children.length - 1] : null;
  }
  append(child) {
    this.children.push(child);
    child.parent = this;
  }
  sync(track) {
    if (this.flags & 2)
      return;
    super.sync(track);
    let parent = this.dom, prev = null, next;
    let tracking = (track === null || track === void 0 ? void 0 : track.node) == parent ? track : null;
    let length = 0;
    for (let child of this.children) {
      child.sync(track);
      length += child.length + child.breakAfter;
      next = prev ? prev.nextSibling : parent.firstChild;
      if (tracking && next != child.dom)
        tracking.written = true;
      if (child.dom.parentNode == parent) {
        while (next && next != child.dom)
          next = rm$1(next);
      } else {
        parent.insertBefore(child.dom, next);
      }
      prev = child.dom;
    }
    next = prev ? prev.nextSibling : parent.firstChild;
    if (tracking && next)
      tracking.written = true;
    while (next)
      next = rm$1(next);
    this.length = length;
  }
};
function rm$1(dom) {
  let next = dom.nextSibling;
  dom.parentNode.removeChild(dom);
  return next;
}
var DocTile = class extends CompositeTile {
  constructor(view, dom) {
    super(dom);
    this.view = view;
  }
  owns(tile) {
    for (; tile; tile = tile.parent)
      if (tile == this)
        return true;
    return false;
  }
  isBlock() {
    return true;
  }
  nearest(dom) {
    for (; ; ) {
      if (!dom)
        return null;
      let tile = Tile.get(dom);
      if (tile && this.owns(tile))
        return tile;
      dom = dom.parentNode;
    }
  }
  blockTiles(f) {
    for (let stack = [], cur2 = this, i = 0, pos = 0; ; ) {
      if (i == cur2.children.length) {
        if (!stack.length)
          return;
        cur2 = cur2.parent;
        if (cur2.breakAfter)
          pos++;
        i = stack.pop();
      } else {
        let next = cur2.children[i++];
        if (next instanceof BlockWrapperTile) {
          stack.push(i);
          cur2 = next;
          i = 0;
        } else {
          let end = pos + next.length;
          let result = f(next, pos);
          if (result !== void 0)
            return result;
          pos = end + next.breakAfter;
        }
      }
    }
  }
  // Find the block at the given position. If side < -1, make sure to
  // stay before block widgets at that position, if side > 1, after
  // such widgets (used for selection drawing, which needs to be able
  // to get coordinates for positions that aren't valid cursor positions).
  resolveBlock(pos, side) {
    let before, beforeOff = -1, after, afterOff = -1;
    this.blockTiles((tile, off) => {
      let end = off + tile.length;
      if (pos >= off && pos <= end) {
        if (tile.isWidget() && side >= -1 && side <= 1) {
          if (tile.flags & 32)
            return true;
          if (tile.flags & 16)
            before = void 0;
        }
        if ((off < pos || pos == end && (side < -1 ? tile.length : tile.covers(1))) && (!before || !tile.isWidget() && before.isWidget())) {
          before = tile;
          beforeOff = pos - off;
        }
        if ((end > pos || pos == off && (side > 1 ? tile.length : tile.covers(-1))) && (!after || !tile.isWidget() && after.isWidget())) {
          after = tile;
          afterOff = pos - off;
        }
      }
    });
    if (!before && !after)
      throw new Error("No tile at position " + pos);
    return before && side < 0 || !after ? { tile: before, offset: beforeOff } : { tile: after, offset: afterOff };
  }
};
var BlockWrapperTile = class _BlockWrapperTile extends CompositeTile {
  constructor(dom, wrapper) {
    super(dom);
    this.wrapper = wrapper;
  }
  isBlock() {
    return true;
  }
  covers(side) {
    if (!this.children.length)
      return false;
    return side < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1);
  }
  get domAttrs() {
    return this.wrapper.attributes;
  }
  static of(wrapper, dom) {
    let tile = new _BlockWrapperTile(dom || document.createElement(wrapper.tagName), wrapper);
    if (!dom)
      tile.flags |= 4;
    return tile;
  }
};
var LineTile = class _LineTile extends CompositeTile {
  constructor(dom, attrs) {
    super(dom);
    this.attrs = attrs;
  }
  isLine() {
    return true;
  }
  static start(attrs, dom, keepAttrs) {
    let line = new _LineTile(dom || document.createElement("div"), attrs);
    if (!dom || !keepAttrs)
      line.flags |= 4;
    return line;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  resolveInline(pos, side, forCoords) {
    let before = null, beforeOff = -1, after = null, afterOff = -1;
    function scan(tile, pos2) {
      for (let i = 0, off = 0; i < tile.children.length && off <= pos2; i++) {
        let child = tile.children[i], end = off + child.length;
        if (end >= pos2) {
          if (child.isComposite()) {
            scan(child, pos2 - off);
          } else if ((!after || after.isHidden && (side > 0 && !(after.flags & 32) || forCoords && onSameLine(after, child))) && (end > pos2 || child.flags & 32)) {
            after = child;
            afterOff = pos2 - off;
          } else if (off < pos2 || child.flags & 16 && !child.isHidden) {
            before = child;
            beforeOff = pos2 - off;
          }
        }
        off = end;
      }
    }
    scan(this, pos);
    let target = (side < 0 ? before : after) || before || after;
    return target ? { tile: target, offset: target == before ? beforeOff : afterOff } : null;
  }
  coordsIn(pos, side, rtl) {
    let found = this.resolveInline(pos, side, true);
    if (!found)
      return fallbackRect(this);
    return found.tile.coordsIn(Math.max(0, found.offset), side, rtl);
  }
  domIn(pos, side) {
    let found = this.resolveInline(pos, side);
    if (found) {
      let { tile, offset } = found;
      if (this.dom.contains(tile.dom)) {
        if (tile.isText())
          return new DOMPos(tile.dom, Math.min(tile.dom.nodeValue.length, offset));
        return tile.domPosFor(offset, tile.flags & 16 ? 1 : tile.flags & 32 ? -1 : side);
      }
      let parent = found.tile.parent, saw = false;
      for (let ch of parent.children) {
        if (saw)
          return new DOMPos(ch.dom, 0);
        if (ch == found.tile) {
          saw = true;
        }
      }
    }
    return new DOMPos(this.dom, 0);
  }
};
function fallbackRect(tile) {
  let last = tile.dom.lastChild;
  if (!last)
    return tile.dom.getBoundingClientRect();
  let rects = clientRectsFor(last);
  return rects[rects.length - 1] || null;
}
function onSameLine(a, b) {
  let posA = a.coordsIn(0, 1), posB = b.coordsIn(0, 1);
  return posA && posB && posB.top < posA.bottom;
}
var MarkTile = class _MarkTile extends CompositeTile {
  constructor(dom, mark) {
    super(dom);
    this.mark = mark;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(mark, dom) {
    let tile = new _MarkTile(dom || document.createElement(mark.tagName), mark);
    if (!dom)
      tile.flags |= 4;
    return tile;
  }
};
var TextTile = class _TextTile extends Tile {
  constructor(dom, text) {
    super(dom, text.length);
    this.text = text;
  }
  sync(track) {
    if (this.flags & 2)
      return;
    super.sync(track);
    if (this.dom.nodeValue != this.text) {
      if (track && track.node == this.dom)
        track.written = true;
      this.dom.nodeValue = this.text;
    }
  }
  isText() {
    return true;
  }
  toString() {
    return JSON.stringify(this.text);
  }
  coordsIn(pos, side, rtl) {
    let length = this.dom.nodeValue.length;
    if (pos > length)
      pos = length;
    let from = pos, to = pos, flatten2 = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
      if (!(browser.chrome || browser.gecko)) {
        if (pos) {
          from--;
          flatten2 = 1;
        } else if (to < length) {
          to++;
          flatten2 = -1;
        }
      }
    } else {
      if (side < 0)
        from--;
      else if (to < length)
        to++;
    }
    let rects = textRange(this.dom, from, to).getClientRects();
    if (!rects.length)
      return null;
    let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
    if (browser.safari && !flatten2 && rect.width == 0)
      rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
    return rtl == null ? rect : flattenRect(rect, (flatten2 ? flatten2 > 0 : side < 0) == rtl);
  }
  static of(text, dom) {
    let tile = new _TextTile(dom || document.createTextNode(text), text);
    if (!dom)
      tile.flags |= 2;
    return tile;
  }
};
var WidgetTile = class _WidgetTile extends Tile {
  constructor(dom, length, widget, flags) {
    super(dom, length, flags);
    this.widget = widget;
  }
  isWidget() {
    return true;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  covers(side) {
    if (this.flags & 48)
      return false;
    return (this.flags & (side < 0 ? 64 : 128)) > 0;
  }
  coordsIn(pos, side) {
    return this.coordsInWidget(pos, side, false);
  }
  coordsInWidget(pos, side, block) {
    let custom = this.widget.coordsAt(this.dom, pos, side);
    if (custom)
      return custom;
    if (block) {
      return flattenRect(this.dom.getBoundingClientRect(), this.length ? pos == 0 : side <= 0);
    } else {
      let rects = this.dom.getClientRects(), rect = null;
      if (!rects.length)
        return null;
      let fromBack = this.flags & 16 ? true : this.flags & 32 ? false : pos > 0;
      for (let i = fromBack ? rects.length - 1 : 0; ; i += fromBack ? -1 : 1) {
        rect = rects[i];
        if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
          break;
      }
      return flattenRect(rect, !fromBack);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return Text.empty;
    let { root } = this;
    if (!root)
      return Text.empty;
    let start = this.posAtStart;
    return root.view.state.doc.slice(start, start + this.length);
  }
  destroy() {
    super.destroy();
    this.widget.destroy(this.dom);
  }
  static of(widget, view, length, flags, dom) {
    if (!dom) {
      dom = widget.toDOM(view);
      if (!widget.editable)
        dom.contentEditable = "false";
    }
    return new _WidgetTile(dom, length, widget, flags);
  }
};
var WidgetBufferTile = class extends Tile {
  constructor(flags) {
    let img = document.createElement("img");
    img.className = "cm-widgetBuffer";
    img.setAttribute("aria-hidden", "true");
    super(img, 0, flags);
  }
  get isHidden() {
    return true;
  }
  get overrideDOMText() {
    return Text.empty;
  }
  coordsIn(pos, side, rtl) {
    let rect = this.dom.getBoundingClientRect();
    return rtl == null ? rect : flattenRect(rect, side > 0 == rtl);
  }
};
var TilePointer = class {
  constructor(top2) {
    this.index = 0;
    this.beforeBreak = false;
    this.parents = [];
    this.tile = top2;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(dist2, side, walker) {
    let { tile, index, beforeBreak, parents } = this;
    while (dist2 || side > 0) {
      if (!tile.isComposite()) {
        if (index == tile.length) {
          beforeBreak = !!tile.breakAfter;
          ({ tile, index } = parents.pop());
          index++;
        } else if (!dist2) {
          break;
        } else {
          let take = Math.min(dist2, tile.length - index);
          if (walker)
            walker.skip(tile, index, index + take);
          dist2 -= take;
          index += take;
        }
      } else if (beforeBreak) {
        if (!dist2)
          break;
        if (walker)
          walker.break();
        dist2--;
        beforeBreak = false;
      } else if (index == tile.children.length) {
        if (!dist2 && !parents.length)
          break;
        if (walker)
          walker.leave(tile);
        beforeBreak = !!tile.breakAfter;
        ({ tile, index } = parents.pop());
        index++;
      } else {
        let next = tile.children[index], brk = next.breakAfter;
        if ((side > 0 ? next.length <= dist2 : next.length < dist2) && (!walker || walker.skip(next, 0, next.length) !== false || !next.isComposite)) {
          beforeBreak = !!brk;
          index++;
          dist2 -= next.length;
        } else {
          parents.push({ tile, index });
          tile = next;
          index = 0;
          if (walker && next.isComposite())
            walker.enter(next);
        }
      }
    }
    this.tile = tile;
    this.index = index;
    this.beforeBreak = beforeBreak;
    return this;
  }
  get root() {
    return this.parents.length ? this.parents[0].tile : this.tile;
  }
};
var OpenWrapper = class {
  constructor(from, to, wrapper, rank) {
    this.from = from;
    this.to = to;
    this.wrapper = wrapper;
    this.rank = rank;
  }
};
var TileBuilder = class {
  constructor(cache, root, blockWrappers2) {
    this.cache = cache;
    this.root = root;
    this.blockWrappers = blockWrappers2;
    this.curLine = null;
    this.lastBlock = null;
    this.afterWidget = null;
    this.pos = 0;
    this.wrappers = [];
    this.wrapperPos = 0;
  }
  addText(text, marks2, openStart, tile) {
    var _a2;
    this.flushBuffer();
    let parent = this.ensureMarks(marks2, openStart);
    let prev = parent.lastChild;
    if (prev && prev.isText() && !(prev.flags & 8) && prev.length + text.length < 512) {
      this.cache.reused.set(
        prev,
        2
        /* Reused.DOM */
      );
      let tile2 = parent.children[parent.children.length - 1] = new TextTile(prev.dom, prev.text + text);
      tile2.parent = parent;
    } else {
      parent.append(tile || TextTile.of(text, (_a2 = this.cache.find(TextTile)) === null || _a2 === void 0 ? void 0 : _a2.dom));
    }
    this.pos += text.length;
    this.afterWidget = null;
  }
  addComposition(composition, context) {
    let line = this.curLine;
    if (line.dom != context.line.dom) {
      line.setDOM(this.cache.reused.has(context.line) ? freeNode(context.line.dom) : context.line.dom);
      this.cache.reused.set(
        context.line,
        2
        /* Reused.DOM */
      );
    }
    let head = line;
    for (let i = context.marks.length - 1; i >= 0; i--) {
      let mark = context.marks[i];
      let last = head.lastChild;
      if (last instanceof MarkTile && last.mark.eq(mark.mark)) {
        if (last.dom != mark.dom)
          last.setDOM(freeNode(mark.dom));
        head = last;
      } else {
        if (this.cache.reused.get(mark)) {
          let tile = Tile.get(mark.dom);
          if (tile)
            tile.setDOM(freeNode(mark.dom));
        }
        let nw = MarkTile.of(mark.mark, mark.dom);
        head.append(nw);
        head = nw;
      }
      this.cache.reused.set(
        mark,
        2
        /* Reused.DOM */
      );
    }
    let oldTile = Tile.get(composition.text);
    if (oldTile)
      this.cache.reused.set(
        oldTile,
        2
        /* Reused.DOM */
      );
    let text = new TextTile(composition.text, composition.text.nodeValue);
    text.flags |= 8;
    this.pos = composition.range.toB;
    head.append(text);
  }
  addInlineWidget(widget, marks2, openStart) {
    let noSpace = this.afterWidget && widget.flags & 48 && (this.afterWidget.flags & 48) == (widget.flags & 48);
    if (!noSpace)
      this.flushBuffer();
    let parent = this.ensureMarks(marks2, openStart);
    if (!noSpace && !(widget.flags & 16))
      parent.append(this.getBuffer(1));
    parent.append(widget);
    this.pos += widget.length;
    this.afterWidget = widget;
  }
  addMark(tile, marks2, openStart) {
    this.flushBuffer();
    let parent = this.ensureMarks(marks2, openStart);
    parent.append(tile);
    this.pos += tile.length;
    this.afterWidget = null;
  }
  addBlockWidget(widget) {
    this.getBlockPos().append(widget);
    this.pos += widget.length;
    this.lastBlock = widget;
    this.endLine();
  }
  continueWidget(length) {
    let widget = this.afterWidget || this.lastBlock;
    widget.length += length;
    this.pos += length;
  }
  addLineStart(attrs, dom) {
    var _a2;
    if (!attrs)
      attrs = lineBaseAttrs;
    let tile = LineTile.start(attrs, dom || ((_a2 = this.cache.find(LineTile)) === null || _a2 === void 0 ? void 0 : _a2.dom), !!dom);
    this.getBlockPos().append(this.lastBlock = this.curLine = tile);
  }
  addLine(tile) {
    this.getBlockPos().append(tile);
    this.pos += tile.length;
    this.lastBlock = tile;
    this.endLine();
  }
  addBreak() {
    this.lastBlock.flags |= 1;
    this.endLine();
    this.pos++;
  }
  addLineStartIfNotCovered(attrs) {
    if (!this.blockPosCovered())
      this.addLineStart(attrs);
  }
  ensureLine(attrs) {
    if (!this.curLine)
      this.addLineStart(attrs);
  }
  ensureMarks(marks2, openStart) {
    var _a2;
    let parent = this.curLine;
    for (let i = marks2.length - 1; i >= 0; i--) {
      let mark = marks2[i], last;
      if (openStart > 0 && (last = parent.lastChild) && last instanceof MarkTile && last.mark.eq(mark)) {
        parent = last;
        openStart--;
      } else {
        let tile = MarkTile.of(mark, (_a2 = this.cache.find(MarkTile, (m) => m.mark.eq(mark))) === null || _a2 === void 0 ? void 0 : _a2.dom);
        parent.append(tile);
        parent = tile;
        openStart = 0;
      }
    }
    return parent;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let last = this.curLine.lastChild;
      if (!last || !hasContent(this.curLine, false) || last.dom.nodeName != "BR" && last.isWidget() && !(browser.ios && hasContent(this.curLine, true)))
        this.curLine.append(this.cache.findWidget(
          BreakWidget,
          0,
          32
          /* TileFlag.After */
        ) || new WidgetTile(
          BreakWidget.toDOM(),
          0,
          BreakWidget,
          32
          /* TileFlag.After */
        ));
      this.curLine = this.afterWidget = null;
    }
  }
  updateBlockWrappers() {
    if (this.wrapperPos > this.pos + 1e4) {
      this.blockWrappers.goto(this.pos);
      this.wrappers.length = 0;
    }
    for (let i = this.wrappers.length - 1; i >= 0; i--)
      if (this.wrappers[i].to < this.pos)
        this.wrappers.splice(i, 1);
    for (let cur2 = this.blockWrappers; cur2.value && cur2.from <= this.pos; cur2.next())
      if (cur2.to >= this.pos) {
        let rank = cur2.rank * 102 + cur2.value.rank;
        let wrap = new OpenWrapper(cur2.from, cur2.to, cur2.value, rank), i = this.wrappers.length;
        while (i > 0 && (this.wrappers[i - 1].rank - wrap.rank || this.wrappers[i - 1].to - wrap.to) < 0)
          i--;
        this.wrappers.splice(i, 0, wrap);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var _a2;
    this.updateBlockWrappers();
    let parent = this.root;
    for (let wrap of this.wrappers) {
      let last = parent.lastChild;
      if (wrap.from < this.pos && last instanceof BlockWrapperTile && last.wrapper.eq(wrap.wrapper)) {
        parent = last;
      } else {
        let tile = BlockWrapperTile.of(wrap.wrapper, (_a2 = this.cache.find(BlockWrapperTile, (t2) => t2.wrapper.eq(wrap.wrapper))) === null || _a2 === void 0 ? void 0 : _a2.dom);
        parent.append(tile);
        parent = tile;
      }
    }
    return parent;
  }
  blockPosCovered() {
    let last = this.lastBlock;
    return last != null && !last.breakAfter && (!last.isWidget() || (last.flags & (32 | 128)) > 0);
  }
  getBuffer(side) {
    let flags = 2 | (side < 0 ? 16 : 32);
    let found = this.cache.find(
      WidgetBufferTile,
      void 0,
      1
      /* Reused.Full */
    );
    if (found)
      found.flags = flags;
    return found || new WidgetBufferTile(flags);
  }
  flushBuffer() {
    if (this.afterWidget && !(this.afterWidget.flags & 32)) {
      this.afterWidget.parent.append(this.getBuffer(-1));
      this.afterWidget = null;
    }
  }
};
var TextStream = class {
  constructor(doc2) {
    this.skipCount = 0;
    this.text = "";
    this.textOff = 0;
    this.cursor = doc2.iter();
  }
  skip(len) {
    if (this.textOff + len <= this.text.length) {
      this.textOff += len;
    } else {
      this.skipCount += len - (this.text.length - this.textOff);
      this.text = "";
      this.textOff = 0;
    }
  }
  next(maxLen) {
    if (this.textOff == this.text.length) {
      let { value, lineBreak, done } = this.cursor.next(this.skipCount);
      this.skipCount = 0;
      if (done)
        throw new Error("Ran out of text content when drawing inline views");
      this.text = value;
      let len = this.textOff = Math.min(maxLen, value.length);
      return lineBreak ? null : value.slice(0, len);
    }
    let end = Math.min(this.text.length, this.textOff + maxLen);
    let chars = this.text.slice(this.textOff, end);
    this.textOff = end;
    return chars;
  }
};
var buckets = [WidgetTile, LineTile, TextTile, MarkTile, WidgetBufferTile, BlockWrapperTile, DocTile];
for (let i = 0; i < buckets.length; i++)
  buckets[i].bucket = i;
var TileCache = class {
  constructor(view) {
    this.view = view;
    this.buckets = buckets.map(() => []);
    this.index = buckets.map(() => 0);
    this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(tile) {
    let i = tile.constructor.bucket, bucket = this.buckets[i];
    if (bucket.length < 6)
      bucket.push(tile);
    else
      bucket[
        this.index[i] = (this.index[i] + 1) % 6
        /* C.Bucket */
      ] = tile;
  }
  find(cls, test, type = 2) {
    let i = cls.bucket;
    let bucket = this.buckets[i], off = this.index[i];
    for (let j = 0; j < bucket.length; j++) {
      let index = (j + off) % bucket.length, tile = bucket[index];
      if ((!test || test(tile)) && !this.reused.has(tile)) {
        bucket.splice(index, 1);
        if (index < off)
          this.index[i]--;
        this.reused.set(tile, type);
        return tile;
      }
    }
    return null;
  }
  findWidget(widget, length, flags) {
    let widgets = this.buckets[0];
    if (widgets.length)
      for (let i = 0, pass = 0; ; i++) {
        if (i == widgets.length) {
          if (pass)
            return null;
          pass = 1;
          i = 0;
        }
        let tile = widgets[i];
        if (!this.reused.has(tile) && (pass == 0 ? tile.widget.compare(widget) : tile.widget.constructor == widget.constructor && widget.updateDOM(tile.dom, this.view, tile.widget))) {
          widgets.splice(i, 1);
          if (i < this.index[0])
            this.index[0]--;
          if (tile.widget == widget && tile.length == length && (tile.flags & (496 | 1)) == flags) {
            this.reused.set(
              tile,
              1
              /* Reused.Full */
            );
            return tile;
          } else {
            this.reused.set(
              tile,
              2
              /* Reused.DOM */
            );
            return new WidgetTile(tile.dom, length, widget, tile.flags & ~(496 | 1) | flags);
          }
        }
      }
  }
  reuse(tile) {
    this.reused.set(
      tile,
      1
      /* Reused.Full */
    );
    return tile;
  }
  maybeReuse(tile, type = 2) {
    if (this.reused.has(tile))
      return void 0;
    this.reused.set(tile, type);
    return tile.dom;
  }
  clear() {
    for (let i = 0; i < this.buckets.length; i++)
      this.buckets[i].length = this.index[i] = 0;
  }
};
var TileUpdate = class {
  constructor(view, old, blockWrappers2, decorations2, disallowBlockEffectsFor) {
    this.view = view;
    this.decorations = decorations2;
    this.disallowBlockEffectsFor = disallowBlockEffectsFor;
    this.openWidget = false;
    this.openMarks = 0;
    this.cache = new TileCache(view);
    this.text = new TextStream(view.state.doc);
    this.builder = new TileBuilder(this.cache, new DocTile(view, view.contentDOM), RangeSet.iter(blockWrappers2));
    this.cache.reused.set(
      old,
      2
      /* Reused.DOM */
    );
    this.old = new TilePointer(old);
    this.reuseWalker = {
      skip: (tile, from, to) => {
        this.cache.add(tile);
        if (tile.isComposite())
          return false;
      },
      enter: (tile) => this.cache.add(tile),
      leave: () => {
      },
      break: () => {
      }
    };
  }
  run(changes, composition) {
    let compositionContext = composition && this.getCompositionContext(composition.text);
    for (let posA = 0, posB = 0, i = 0; ; ) {
      let next = i < changes.length ? changes[i++] : null;
      let skipA = next ? next.fromA : this.old.root.length;
      if (skipA > posA) {
        let len = skipA - posA;
        this.preserve(len, !i, !next);
        posA = skipA;
        posB += len;
      }
      if (!next)
        break;
      if (composition && next.fromA <= composition.range.fromA && next.toA >= composition.range.toA) {
        this.forward(next.fromA, composition.range.fromA, composition.range.fromA < composition.range.toA ? 1 : -1);
        this.emit(posB, composition.range.fromB);
        this.builder.flushBuffer();
        this.cache.clear();
        this.builder.addComposition(composition, compositionContext);
        this.text.skip(composition.range.toB - composition.range.fromB);
        this.forward(composition.range.fromA, next.toA);
        this.emit(composition.range.toB, next.toB);
      } else {
        this.forward(next.fromA, next.toA);
        this.emit(posB, next.toB);
      }
      posB = next.toB;
      posA = next.toA;
    }
    if (this.builder.curLine)
      this.builder.endLine();
    return this.builder.root;
  }
  preserve(length, incStart, incEnd) {
    let activeMarks = getMarks(this.old), openMarks = this.openMarks;
    this.old.advance(length, incEnd ? 1 : -1, {
      skip: (tile, from, to) => {
        if (tile.isWidget()) {
          if (this.openWidget) {
            this.builder.continueWidget(to - from);
          } else {
            let widget = to > 0 || from < tile.length ? WidgetTile.of(tile.widget, this.view, to - from, tile.flags & 496, this.cache.maybeReuse(tile)) : this.cache.reuse(tile);
            if (widget.flags & 256) {
              widget.flags &= ~1;
              this.builder.addBlockWidget(widget);
            } else {
              this.builder.ensureLine(null);
              this.builder.addInlineWidget(widget, activeMarks, openMarks);
              openMarks = activeMarks.length;
            }
          }
        } else if (tile.isText()) {
          this.builder.ensureLine(null);
          if (!from && to == tile.length && !this.cache.reused.has(tile)) {
            this.builder.addText(tile.text, activeMarks, openMarks, this.cache.reuse(tile));
          } else {
            this.cache.add(tile);
            this.builder.addText(tile.text.slice(from, to), activeMarks, openMarks);
          }
          openMarks = activeMarks.length;
        } else if (tile.isLine()) {
          tile.flags &= ~1;
          this.cache.reused.set(
            tile,
            1
            /* Reused.Full */
          );
          this.builder.addLine(tile);
        } else if (tile instanceof WidgetBufferTile) {
          this.cache.add(tile);
        } else if (tile instanceof MarkTile) {
          this.builder.ensureLine(null);
          this.builder.addMark(tile, activeMarks, openMarks);
          this.cache.reused.set(
            tile,
            1
            /* Reused.Full */
          );
          openMarks = activeMarks.length;
        } else {
          return false;
        }
        this.openWidget = false;
      },
      enter: (tile) => {
        if (tile.isLine()) {
          this.builder.addLineStart(tile.attrs, this.cache.maybeReuse(tile));
        } else {
          this.cache.add(tile);
          if (tile instanceof MarkTile)
            activeMarks.unshift(tile.mark);
        }
        this.openWidget = false;
      },
      leave: (tile) => {
        if (tile.isLine()) {
          if (activeMarks.length)
            activeMarks.length = openMarks = 0;
        } else if (tile instanceof MarkTile) {
          activeMarks.shift();
          openMarks = Math.min(openMarks, activeMarks.length);
        }
      },
      break: () => {
        this.builder.addBreak();
        this.openWidget = false;
      }
    });
    this.text.skip(length);
  }
  emit(from, to) {
    let pendingLineAttrs = null;
    let b = this.builder, markCount = -1;
    let openEnd = RangeSet.spans(this.decorations, from, to, {
      point: (from2, to2, deco, active, openStart, index) => {
        if (deco instanceof PointDecoration) {
          if (this.disallowBlockEffectsFor[index]) {
            if (deco.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (to2 > this.view.state.doc.lineAt(from2).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          markCount = active.length;
          if (openStart > active.length) {
            b.continueWidget(to2 - from2);
          } else {
            let widget = deco.widget || (deco.block ? NullWidget.block : NullWidget.inline);
            let flags = widgetFlags(deco);
            let tile = this.cache.findWidget(widget, to2 - from2, flags) || WidgetTile.of(widget, this.view, to2 - from2, flags);
            if (deco.block) {
              if (deco.startSide > 0)
                b.addLineStartIfNotCovered(pendingLineAttrs);
              b.addBlockWidget(tile);
            } else {
              b.ensureLine(pendingLineAttrs);
              b.addInlineWidget(tile, active, openStart);
            }
          }
          pendingLineAttrs = null;
        } else {
          pendingLineAttrs = addLineDeco(pendingLineAttrs, deco);
        }
        if (to2 > from2)
          this.text.skip(to2 - from2);
      },
      span: (from2, to2, active, openStart) => {
        for (let pos = from2; pos < to2; ) {
          let chars = this.text.next(Math.min(512, to2 - pos));
          if (chars == null) {
            b.addLineStartIfNotCovered(pendingLineAttrs);
            b.addBreak();
            pos++;
          } else {
            b.ensureLine(pendingLineAttrs);
            b.addText(chars, active, pos == from2 ? openStart : active.length);
            pos += chars.length;
          }
          pendingLineAttrs = null;
        }
        markCount = active.length;
      }
    });
    if (markCount > -1)
      this.openWidget = openEnd > markCount;
    if (!this.openWidget)
      b.addLineStartIfNotCovered(pendingLineAttrs);
    this.openMarks = openEnd;
  }
  forward(from, to, side = 1) {
    if (to - from <= 10) {
      this.old.advance(to - from, side, this.reuseWalker);
    } else {
      this.old.advance(5, -1, this.reuseWalker);
      this.old.advance(to - from - 10, -1);
      this.old.advance(5, side, this.reuseWalker);
    }
  }
  getCompositionContext(text) {
    let marks2 = [], line = null;
    for (let parent = text.parentNode; ; parent = parent.parentNode) {
      let tile = Tile.get(parent);
      if (parent == this.view.contentDOM)
        break;
      if (tile instanceof MarkTile)
        marks2.push(tile);
      else if (tile === null || tile === void 0 ? void 0 : tile.isLine())
        line = tile;
      else if (tile instanceof BlockWrapperTile) ;
      else if (parent.nodeName == "DIV" && !line && parent != this.view.contentDOM)
        line = new LineTile(parent, lineBaseAttrs);
      else if (!line)
        marks2.push(MarkTile.of(new MarkDecoration({ tagName: parent.nodeName.toLowerCase(), attributes: getAttrs(parent) }), parent));
    }
    return { line, marks: marks2 };
  }
};
function hasContent(tile, requireText) {
  let scan = (tile2) => {
    for (let ch of tile2.children)
      if ((requireText ? ch.isText() : ch.length) || scan(ch))
        return true;
    return false;
  };
  return scan(tile);
}
function widgetFlags(deco) {
  let flags = deco.isReplace ? (deco.startSide < 0 ? 64 : 0) | (deco.endSide > 0 ? 128 : 0) : deco.startSide > 0 ? 32 : 16;
  if (deco.block)
    flags |= 256;
  return flags;
}
var lineBaseAttrs = { class: "cm-line" };
function addLineDeco(value, deco) {
  let attrs = deco.spec.attributes, cls = deco.spec.class;
  if (!attrs && !cls)
    return value;
  if (!value)
    value = { class: "cm-line" };
  if (attrs)
    combineAttrs(attrs, value);
  if (cls)
    value.class += " " + cls;
  return value;
}
function getMarks(ptr) {
  let found = [];
  for (let i = ptr.parents.length; i > 1; i--) {
    let tile = i == ptr.parents.length ? ptr.tile : ptr.parents[i].tile;
    if (tile instanceof MarkTile)
      found.push(tile.mark);
  }
  return found;
}
function freeNode(node) {
  let tile = Tile.get(node);
  if (tile)
    tile.setDOM(node.cloneNode());
  return node;
}
var NullWidget = class extends WidgetType {
  constructor(tag) {
    super();
    this.tag = tag;
  }
  eq(other) {
    return other.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(elt) {
    return elt.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return true;
  }
};
NullWidget.inline = /* @__PURE__ */ new NullWidget("span");
NullWidget.block = /* @__PURE__ */ new NullWidget("div");
var BreakWidget = /* @__PURE__ */ new class extends WidgetType {
  toDOM() {
    return document.createElement("br");
  }
  get isHidden() {
    return true;
  }
  get editable() {
    return true;
  }
}();
var DocView = class {
  constructor(view) {
    this.view = view;
    this.decorations = [];
    this.blockWrappers = [];
    this.dynamicDecorationMap = [false];
    this.domChanged = null;
    this.hasComposition = null;
    this.editContextFormatting = Decoration.none;
    this.lastCompositionAfterCursor = false;
    this.minWidth = 0;
    this.minWidthFrom = 0;
    this.minWidthTo = 0;
    this.impreciseAnchor = null;
    this.impreciseHead = null;
    this.forceSelection = false;
    this.lastUpdate = Date.now();
    this.updateDeco();
    this.tile = new DocTile(view, view.contentDOM);
    this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(update) {
    var _a2;
    let changedRanges = update.changedRanges;
    if (this.minWidth > 0 && changedRanges.length) {
      if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
        this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
      } else {
        this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
        this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
      }
    }
    this.updateEditContextFormatting(update);
    let readCompositionAt = -1;
    if (this.view.inputState.composing >= 0 && !this.view.observer.editContext) {
      if ((_a2 = this.domChanged) === null || _a2 === void 0 ? void 0 : _a2.newSel)
        readCompositionAt = this.domChanged.newSel.head;
      else if (!touchesComposition(update.changes, this.hasComposition) && !update.selectionSet)
        readCompositionAt = update.state.selection.main.head;
    }
    let composition = readCompositionAt > -1 ? findCompositionRange(this.view, update.changes, readCompositionAt) : null;
    this.domChanged = null;
    if (this.hasComposition) {
      let { from, to } = this.hasComposition;
      changedRanges = new ChangedRange(from, to, update.changes.mapPos(from, -1), update.changes.mapPos(to, 1)).addToSet(changedRanges.slice());
    }
    this.hasComposition = composition ? { from: composition.range.fromB, to: composition.range.toB } : null;
    if ((browser.ie || browser.chrome) && !composition && update && update.state.doc.lines != update.startState.doc.lines)
      this.forceSelection = true;
    let prevDeco = this.decorations, prevWrappers = this.blockWrappers;
    this.updateDeco();
    let decoDiff = findChangedDeco(prevDeco, this.decorations, update.changes);
    if (decoDiff.length)
      changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
    let blockDiff = findChangedWrappers(prevWrappers, this.blockWrappers, update.changes);
    if (blockDiff.length)
      changedRanges = ChangedRange.extendWithRanges(changedRanges, blockDiff);
    if (composition && !changedRanges.some((r) => r.fromA <= composition.range.fromA && r.toA >= composition.range.toA))
      changedRanges = composition.range.addToSet(changedRanges.slice());
    if (this.tile.flags & 2 && changedRanges.length == 0) {
      return false;
    } else {
      this.updateInner(changedRanges, composition);
      if (update.transactions.length)
        this.lastUpdate = Date.now();
      return true;
    }
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(changes, composition) {
    this.view.viewState.mustMeasureContent = true;
    let { observer } = this.view;
    observer.ignore(() => {
      if (composition || changes.length) {
        let oldTile = this.tile;
        let builder = new TileUpdate(this.view, oldTile, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        if (composition && Tile.get(composition.text))
          builder.cache.reused.set(
            Tile.get(composition.text),
            2
            /* Reused.DOM */
          );
        this.tile = builder.run(changes, composition);
        destroyDropped(oldTile, builder.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px";
      this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : void 0;
      this.tile.sync(track);
      if (track && (track.written || observer.selectionRange.focusNode != track.node || !this.tile.dom.contains(track.node)))
        this.forceSelection = true;
      this.tile.dom.style.height = "";
    });
    let gaps = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length) {
      for (let child of this.tile.children)
        if (child.isWidget() && child.widget instanceof BlockGapWidget)
          gaps.push(child.dom);
    }
    observer.updateGaps(gaps);
  }
  updateEditContextFormatting(update) {
    this.editContextFormatting = this.editContextFormatting.map(update.changes);
    for (let tr of update.transactions)
      for (let effect of tr.effects)
        if (effect.is(setEditContextFormatting)) {
          this.editContextFormatting = effect.value;
        }
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(mustRead = false, fromPointer = false) {
    if (mustRead || !this.view.observer.selectionRange.focusNode)
      this.view.observer.readSelectionRange();
    let { dom } = this.tile;
    let activeElt = this.view.root.activeElement, focused = activeElt == dom;
    let selectionNotFocus = !focused && !(this.view.state.facet(editable) || dom.tabIndex > -1) && hasSelection(dom, this.view.observer.selectionRange) && !(activeElt && dom.contains(activeElt));
    if (!(focused || fromPointer || selectionNotFocus))
      return;
    let force = this.forceSelection;
    this.forceSelection = false;
    let main = this.view.state.selection.main, anchor, head;
    if (main.empty) {
      head = anchor = this.inlineDOMNearPos(main.anchor, main.assoc || 1);
    } else {
      head = this.inlineDOMNearPos(main.head, main.head == main.from ? 1 : -1);
      anchor = this.inlineDOMNearPos(main.anchor, main.anchor == main.from ? 1 : -1);
    }
    if (browser.gecko && main.empty && !this.hasComposition && betweenUneditable(anchor)) {
      let dummy = document.createTextNode("");
      this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
      anchor = head = new DOMPos(dummy, 0);
      force = true;
    }
    let domSel = this.view.observer.selectionRange;
    if (force || !domSel.focusNode || (!isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) && !this.suppressWidgetCursorChange(domSel, main)) {
      this.view.observer.ignore(() => {
        if (browser.android && browser.chrome && dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, dom)) {
          dom.blur();
          dom.focus({ preventScroll: true });
        }
        let rawSel = getSelection(this.view.root);
        if (!rawSel) ;
        else if (main.empty) {
          if (browser.gecko) {
            let nextTo = nextToUneditable(anchor.node, anchor.offset);
            if (nextTo && nextTo != (1 | 2)) {
              let text = (nextTo == 1 ? textNodeBefore : textNodeAfter)(anchor.node, anchor.offset);
              if (text)
                anchor = new DOMPos(text.node, text.offset);
            }
          }
          rawSel.collapse(anchor.node, anchor.offset);
          if (main.bidiLevel != null && rawSel.caretBidiLevel !== void 0)
            rawSel.caretBidiLevel = main.bidiLevel;
        } else if (rawSel.extend) {
          rawSel.collapse(anchor.node, anchor.offset);
          try {
            rawSel.extend(head.node, head.offset);
          } catch (_) {
          }
        } else {
          let range = document.createRange();
          if (main.anchor > main.head)
            [anchor, head] = [head, anchor];
          range.setEnd(head.node, head.offset);
          range.setStart(anchor.node, anchor.offset);
          rawSel.removeAllRanges();
          rawSel.addRange(range);
        }
        if (selectionNotFocus && this.view.root.activeElement == dom) {
          dom.blur();
          if (activeElt)
            activeElt.focus();
        }
      });
      this.view.observer.setSelectionRange(anchor, head);
    }
    this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
    this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(sel, cursor) {
    return this.hasComposition && cursor.empty && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset) && this.posFromDOM(sel.focusNode, sel.focusOffset) == cursor.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view } = this, cursor = view.state.selection.main;
    let sel = getSelection(view.root);
    let { anchorNode, anchorOffset } = view.observer.selectionRange;
    if (!sel || !cursor.empty || !cursor.assoc || !sel.modify)
      return;
    let line = this.lineAt(cursor.head, cursor.assoc);
    if (!line)
      return;
    let lineStart = line.posAtStart;
    if (cursor.head == lineStart || cursor.head == lineStart + line.length)
      return;
    let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
    if (!before || !after || before.bottom > after.top)
      return;
    let dom = this.domAtPos(cursor.head + cursor.assoc, cursor.assoc);
    sel.collapse(dom.node, dom.offset);
    sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    view.observer.readSelectionRange();
    let newRange = view.observer.selectionRange;
    if (view.docView.posFromDOM(newRange.anchorNode, newRange.anchorOffset) != cursor.from)
      sel.collapse(anchorNode, anchorOffset);
  }
  posFromDOM(node, offset) {
    let tile = this.tile.nearest(node);
    if (!tile)
      return this.tile.dom.compareDocumentPosition(node) & 2 ? 0 : this.view.state.doc.length;
    let start = tile.posAtStart;
    if (tile.isComposite()) {
      let after;
      if (node == tile.dom) {
        after = tile.dom.childNodes[offset];
      } else {
        let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
        for (; ; ) {
          let parent = node.parentNode;
          if (parent == tile.dom)
            break;
          if (bias == 0 && parent.firstChild != parent.lastChild) {
            if (node == parent.firstChild)
              bias = -1;
            else
              bias = 1;
          }
          node = parent;
        }
        if (bias < 0)
          after = node;
        else
          after = node.nextSibling;
      }
      if (after == tile.dom.firstChild)
        return start;
      while (after && !Tile.get(after))
        after = after.nextSibling;
      if (!after)
        return start + tile.length;
      for (let i = 0, pos = start; ; i++) {
        let child = tile.children[i];
        if (child.dom == after)
          return pos;
        pos += child.length + child.breakAfter;
      }
    } else if (tile.isText()) {
      return node == tile.dom ? start + offset : start + (offset ? tile.length : 0);
    } else {
      return start;
    }
  }
  domAtPos(pos, side) {
    let { tile, offset } = this.tile.resolveBlock(pos, side);
    if (tile.isWidget())
      return tile.domPosFor(offset, side);
    return tile.domIn(offset, side);
  }
  inlineDOMNearPos(pos, side) {
    let before, beforeOff = -1, beforeBad = false;
    let after, afterOff = -1, afterBad = false;
    this.tile.blockTiles((tile, off) => {
      if (tile.isWidget()) {
        if (tile.flags & 32 && off >= pos)
          return true;
        if (tile.flags & 16)
          beforeBad = true;
      } else {
        let end = off + tile.length;
        if (off <= pos) {
          before = tile;
          beforeOff = pos - off;
          beforeBad = end < pos;
        }
        if (end >= pos && !after) {
          after = tile;
          afterOff = pos - off;
          afterBad = off > pos;
        }
        if (off > pos && after)
          return true;
      }
    });
    if (!before && !after)
      return this.domAtPos(pos, side);
    if (beforeBad && after)
      before = null;
    else if (afterBad && before)
      after = null;
    return before && side < 0 || !after ? before.domIn(beforeOff, side) : after.domIn(afterOff, side);
  }
  // Get the coord of the element at the given side of the given
  // position. If rtl is given, flatten it using that text direction.
  coordsAt(pos, side, rtl) {
    let { tile, offset } = this.tile.resolveBlock(pos, side);
    if (tile.isWidget()) {
      if (tile.widget instanceof BlockGapWidget)
        return null;
      return tile.coordsInWidget(offset, side, true);
    }
    return tile.coordsIn(offset, side, rtl);
  }
  lineAt(pos, side) {
    let { tile } = this.tile.resolveBlock(pos, side);
    return tile.isLine() ? tile : null;
  }
  coordsForChar(pos) {
    let { tile, offset } = this.tile.resolveBlock(pos, 1);
    if (!tile.isLine())
      return null;
    function scan(tile2, offset2) {
      if (tile2.isComposite()) {
        for (let ch of tile2.children) {
          if (ch.length >= offset2) {
            let found = scan(ch, offset2);
            if (found)
              return found;
          }
          offset2 -= ch.length;
          if (offset2 < 0)
            break;
        }
      } else if (tile2.isText() && offset2 < tile2.length) {
        let end = findClusterBreak2(tile2.text, offset2);
        if (end == offset2)
          return null;
        let rects = textRange(tile2.dom, offset2, end).getClientRects();
        for (let i = 0; i < rects.length; i++) {
          let rect = rects[i];
          if (i == rects.length - 1 || rect.top < rect.bottom && rect.left < rect.right)
            return rect;
        }
      }
      return null;
    }
    return scan(tile, offset);
  }
  measureVisibleLineHeights(viewport) {
    let result = [], { from, to } = viewport;
    let contentWidth = this.view.contentDOM.clientWidth;
    let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
    let widest = -1, ltr = this.view.textDirection == Direction.LTR;
    let spaceAbove = 0;
    let scan = (tile, pos, measureBounds) => {
      for (let i = 0; i < tile.children.length; i++) {
        if (pos > to)
          break;
        let child = tile.children[i], end = pos + child.length;
        let childRect = child.dom.getBoundingClientRect(), { height } = childRect;
        if (measureBounds && !i)
          spaceAbove += childRect.top - measureBounds.top;
        if (child instanceof BlockWrapperTile) {
          if (end > from)
            scan(child, pos, childRect);
        } else if (pos >= from) {
          if (spaceAbove > 0)
            result.push(-spaceAbove);
          result.push(height + spaceAbove);
          spaceAbove = 0;
          if (isWider) {
            let last = child.dom.lastChild;
            let rects = last ? clientRectsFor(last) : [];
            if (rects.length) {
              let rect = rects[rects.length - 1];
              let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
              if (width > widest) {
                widest = width;
                this.minWidth = contentWidth;
                this.minWidthFrom = pos;
                this.minWidthTo = end;
              }
            }
          }
        }
        if (measureBounds && i == tile.children.length - 1)
          spaceAbove += measureBounds.bottom - childRect.bottom;
        pos = end + child.breakAfter;
      }
    };
    scan(this.tile, 0, null);
    return result;
  }
  textDirectionAt(pos) {
    let { tile } = this.tile.resolveBlock(pos, 1);
    return getComputedStyle(tile.dom).direction == "rtl" ? Direction.RTL : Direction.LTR;
  }
  measureTextSize() {
    let lineMeasure = this.tile.blockTiles((tile) => {
      if (tile.isLine() && tile.children.length && tile.length <= 20) {
        let totalWidth = 0, textHeight2;
        for (let child of tile.children) {
          if (!child.isText() || /[^ -~]/.test(child.text))
            return void 0;
          let rects = clientRectsFor(child.dom);
          if (rects.length != 1)
            return void 0;
          totalWidth += rects[0].width;
          textHeight2 = rects[0].height;
        }
        if (totalWidth)
          return {
            lineHeight: tile.dom.getBoundingClientRect().height,
            charWidth: totalWidth / tile.length,
            textHeight: textHeight2
          };
      }
    });
    if (lineMeasure)
      return lineMeasure;
    let dummy = document.createElement("div"), lineHeight, charWidth, textHeight;
    dummy.className = "cm-line";
    dummy.style.width = "99999px";
    dummy.style.position = "absolute";
    dummy.textContent = "abc def ghi jkl mno pqr stu";
    this.view.observer.ignore(() => {
      this.tile.dom.appendChild(dummy);
      let rect = clientRectsFor(dummy.firstChild)[0];
      lineHeight = dummy.getBoundingClientRect().height;
      charWidth = rect && rect.width ? rect.width / 27 : 7;
      textHeight = rect && rect.height ? rect.height : lineHeight;
      dummy.remove();
    });
    return { lineHeight, charWidth, textHeight };
  }
  computeBlockGapDeco() {
    let deco = [], vs = this.view.viewState;
    for (let pos = 0, i = 0; ; i++) {
      let next = i == vs.viewports.length ? null : vs.viewports[i];
      let end = next ? next.from - 1 : this.view.state.doc.length;
      if (end > pos) {
        let height = (vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top) / this.view.scaleY;
        deco.push(Decoration.replace({
          widget: new BlockGapWidget(height),
          block: true,
          inclusive: true,
          isBlockGap: true
        }).range(pos, end));
      }
      if (!next)
        break;
      pos = next.to + 1;
    }
    return Decoration.set(deco);
  }
  updateDeco() {
    let i = 1;
    let allDeco = this.view.state.facet(decorations).map((d) => {
      let dynamic = this.dynamicDecorationMap[i++] = typeof d == "function";
      return dynamic ? d(this.view) : d;
    });
    let dynamicOuter = false, outerDeco = this.view.state.facet(outerDecorations).map((d, i2) => {
      let dynamic = typeof d == "function";
      if (dynamic)
        dynamicOuter = true;
      return dynamic ? d(this.view) : d;
    });
    if (outerDeco.length) {
      this.dynamicDecorationMap[i++] = dynamicOuter;
      allDeco.push(RangeSet.join(outerDeco));
    }
    this.decorations = [
      this.editContextFormatting,
      ...allDeco,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ];
    while (i < this.decorations.length)
      this.dynamicDecorationMap[i++] = false;
    this.blockWrappers = this.view.state.facet(blockWrappers).map((v) => typeof v == "function" ? v(this.view) : v);
  }
  scrollIntoView(target) {
    if (target.isSnapshot) {
      let ref = this.view.viewState.lineBlockAt(target.range.head);
      this.view.scrollDOM.scrollTop = ref.top - target.yMargin;
      this.view.scrollDOM.scrollLeft = target.xMargin;
      return;
    }
    for (let handler of this.view.state.facet(scrollHandler)) {
      try {
        if (handler(this.view, target.range, target))
          return true;
      } catch (e) {
        logException(this.view.state, e, "scroll handler");
      }
    }
    let { range } = target;
    let rect = this.coordsAt(range.head, range.assoc || (range.head > range.anchor ? -1 : 1)), other;
    if (!rect)
      return;
    if (!range.empty && (other = this.coordsAt(range.anchor, range.anchor > range.head ? -1 : 1)))
      rect = {
        left: Math.min(rect.left, other.left),
        top: Math.min(rect.top, other.top),
        right: Math.max(rect.right, other.right),
        bottom: Math.max(rect.bottom, other.bottom)
      };
    let margins = getScrollMargins(this.view);
    let targetRect = {
      left: rect.left - margins.left,
      top: rect.top - margins.top,
      right: rect.right + margins.right,
      bottom: rect.bottom + margins.bottom
    };
    let { offsetWidth, offsetHeight } = this.view.scrollDOM;
    scrollRectIntoView(this.view.scrollDOM, targetRect, range.head < range.anchor ? -1 : 1, target.x, target.y, Math.max(Math.min(target.xMargin, offsetWidth), -offsetWidth), Math.max(Math.min(target.yMargin, offsetHeight), -offsetHeight), this.view.textDirection == Direction.LTR);
    if (window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (rect.top > window.pageYOffset + window.visualViewport.offsetTop + window.visualViewport.height || rect.bottom < window.pageYOffset + window.visualViewport.offsetTop)) {
      let line = this.view.docView.lineAt(range.head, 1);
      if (line)
        line.dom.scrollIntoView({ block: "nearest" });
    }
  }
  lineHasWidget(pos) {
    let scan = (child) => child.isWidget() || child.children.some(scan);
    return scan(this.tile.resolveBlock(pos, 1).tile);
  }
  destroy() {
    destroyDropped(this.tile);
  }
};
function destroyDropped(tile, reused) {
  let r = reused === null || reused === void 0 ? void 0 : reused.get(tile);
  if (r != 1) {
    if (r == null)
      tile.destroy();
    for (let ch of tile.children)
      destroyDropped(ch, reused);
  }
}
function betweenUneditable(pos) {
  return pos.node.nodeType == 1 && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
}
function findCompositionNode(view, headPos) {
  let sel = view.observer.selectionRange;
  if (!sel.focusNode)
    return null;
  let textBefore = textNodeBefore(sel.focusNode, sel.focusOffset);
  let textAfter = textNodeAfter(sel.focusNode, sel.focusOffset);
  let textNode = textBefore || textAfter;
  if (textAfter && textBefore && textAfter.node != textBefore.node) {
    let tileAfter = Tile.get(textAfter.node);
    if (!tileAfter || tileAfter.isText() && tileAfter.text != textAfter.node.nodeValue) {
      textNode = textAfter;
    } else if (view.docView.lastCompositionAfterCursor) {
      let tileBefore = Tile.get(textBefore.node);
      if (!(!tileBefore || tileBefore.isText() && tileBefore.text != textBefore.node.nodeValue))
        textNode = textAfter;
    }
  }
  view.docView.lastCompositionAfterCursor = textNode != textBefore;
  if (!textNode)
    return null;
  let from = headPos - textNode.offset;
  return { from, to: from + textNode.node.nodeValue.length, node: textNode.node };
}
function findCompositionRange(view, changes, headPos) {
  let found = findCompositionNode(view, headPos);
  if (!found)
    return null;
  let { node: textNode, from, to } = found, text = textNode.nodeValue;
  if (/[\n\r]/.test(text))
    return null;
  if (view.state.doc.sliceString(found.from, found.to) != text)
    return null;
  let inv = changes.invertedDesc;
  return { range: new ChangedRange(inv.mapPos(from), inv.mapPos(to), from, to), text: textNode };
}
function nextToUneditable(node, offset) {
  if (node.nodeType != 1)
    return 0;
  return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
}
var DecorationComparator$1 = class DecorationComparator {
  constructor() {
    this.changes = [];
  }
  compareRange(from, to) {
    addRange(from, to, this.changes);
  }
  comparePoint(from, to) {
    addRange(from, to, this.changes);
  }
  boundChange(pos) {
    addRange(pos, pos, this.changes);
  }
};
function findChangedDeco(a, b, diff) {
  let comp = new DecorationComparator$1();
  RangeSet.compare(a, b, diff, comp);
  return comp.changes;
}
var WrapperComparator = class {
  constructor() {
    this.changes = [];
  }
  compareRange(from, to) {
    addRange(from, to, this.changes);
  }
  comparePoint() {
  }
  boundChange(pos) {
    addRange(pos, pos, this.changes);
  }
};
function findChangedWrappers(a, b, diff) {
  let comp = new WrapperComparator();
  RangeSet.compare(a, b, diff, comp);
  return comp.changes;
}
function inUneditable(node, inside) {
  for (let cur2 = node; cur2 && cur2 != inside; cur2 = cur2.assignedSlot || cur2.parentNode) {
    if (cur2.nodeType == 1 && cur2.contentEditable == "false") {
      return true;
    }
  }
  return false;
}
function touchesComposition(changes, composition) {
  let touched = false;
  if (composition)
    changes.iterChangedRanges((from, to) => {
      if (from < composition.to && to > composition.from)
        touched = true;
    });
  return touched;
}
var BlockGapWidget = class extends WidgetType {
  constructor(height) {
    super();
    this.height = height;
  }
  toDOM() {
    let elt = document.createElement("div");
    elt.className = "cm-gap";
    this.updateDOM(elt);
    return elt;
  }
  eq(other) {
    return other.height == this.height;
  }
  updateDOM(elt) {
    elt.style.height = this.height + "px";
    return true;
  }
  get editable() {
    return true;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return false;
  }
};
function groupAt(state, pos, bias = 1) {
  let categorize = state.charCategorizer(pos);
  let line = state.doc.lineAt(pos), linePos = pos - line.from;
  if (line.length == 0)
    return EditorSelection.cursor(pos);
  if (linePos == 0)
    bias = 1;
  else if (linePos == line.length)
    bias = -1;
  let from = linePos, to = linePos;
  if (bias < 0)
    from = findClusterBreak2(line.text, linePos, false);
  else
    to = findClusterBreak2(line.text, linePos);
  let cat = categorize(line.text.slice(from, to));
  while (from > 0) {
    let prev = findClusterBreak2(line.text, from, false);
    if (categorize(line.text.slice(prev, from)) != cat)
      break;
    from = prev;
  }
  while (to < line.length) {
    let next = findClusterBreak2(line.text, to);
    if (categorize(line.text.slice(to, next)) != cat)
      break;
    to = next;
  }
  return EditorSelection.undirectionalRange(from + line.from, to + line.from);
}
function posAtCoordsImprecise(view, contentRect, block, x, y) {
  let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
  if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
    let textHeight = view.viewState.heightOracle.textHeight;
    let line = Math.floor((y - block.top - (view.defaultLineHeight - textHeight) * 0.5) / textHeight);
    into += line * view.viewState.heightOracle.lineLength;
  }
  let content2 = view.state.sliceDoc(block.from, block.to);
  return block.from + findColumn(content2, into, view.state.tabSize);
}
function blockAt(view, pos, side) {
  let line = view.lineBlockAt(pos);
  if (Array.isArray(line.type)) {
    let best;
    for (let l of line.type) {
      if (l.from > pos)
        break;
      if (l.to < pos)
        continue;
      if (l.from < pos && l.to > pos)
        return l;
      if (!best || l.type == BlockType.Text && (best.type != l.type || (side < 0 ? l.from < pos : l.to > pos)))
        best = l;
    }
    return best || line;
  }
  return line;
}
function moveToLineBoundary(view, start, forward, includeWrap) {
  let line = blockAt(view, start.head, start.assoc || -1);
  let coords = !includeWrap || line.type != BlockType.Text || !(view.lineWrapping || line.widgetLineBreaks) ? null : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
  if (coords) {
    let editorRect = view.dom.getBoundingClientRect();
    let direction = view.textDirectionAt(line.from);
    let pos = view.posAtCoords({
      x: forward == (direction == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
      y: (coords.top + coords.bottom) / 2
    });
    if (pos != null)
      return EditorSelection.cursor(pos, forward ? -1 : 1);
  }
  return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1);
}
function moveByChar(view, start, forward, by) {
  let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
  let direction = view.textDirectionAt(line.from);
  for (let cur2 = start, check = null; ; ) {
    let next = moveVisually(line, spans, direction, cur2, forward), char = movedOver;
    if (!next) {
      if (line.number == (forward ? view.state.doc.lines : 1))
        return cur2;
      char = "\n";
      line = view.state.doc.line(line.number + (forward ? 1 : -1));
      spans = view.bidiSpans(line);
      next = view.visualLineSide(line, !forward);
    }
    if (!check) {
      if (!by)
        return next;
      check = by(char);
    } else if (!check(char)) {
      return cur2;
    }
    cur2 = next;
  }
}
function byGroup(view, pos, start) {
  let categorize = view.state.charCategorizer(pos);
  let cat = categorize(start);
  return (next) => {
    let nextCat = categorize(next);
    if (cat == CharCategory.Space)
      cat = nextCat;
    return cat == nextCat;
  };
}
function moveVertically(view, start, forward, distance) {
  let startPos = start.head, dir = forward ? 1 : -1;
  if (startPos == (forward ? view.state.doc.length : 0))
    return EditorSelection.cursor(startPos, start.assoc);
  let goal = start.goalColumn, startY;
  let rect = view.contentDOM.getBoundingClientRect();
  let startCoords = view.coordsAtPos(startPos, start.assoc || ((start.empty ? forward : start.head == start.from) ? 1 : -1));
  let docTop = view.documentTop;
  if (startCoords) {
    if (goal == null)
      goal = startCoords.left - rect.left;
    startY = dir < 0 ? startCoords.top : startCoords.bottom;
  } else {
    let line = view.viewState.lineBlockAt(startPos);
    if (goal == null)
      goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
    startY = (dir < 0 ? line.top : line.bottom) + docTop;
  }
  let resolvedGoal = rect.left + goal;
  let halfText = view.viewState.heightOracle.textHeight >> 1, dist2 = distance !== null && distance !== void 0 ? distance : halfText;
  for (let scan = 0; ; scan += halfText) {
    let y = startY + (dist2 + scan) * dir;
    let pos = posAtCoords(view, { x: resolvedGoal, y }, false, dir);
    if (forward ? y > rect.bottom : y < rect.top)
      return EditorSelection.cursor(pos.pos, pos.assoc);
    let posCoords = view.coordsAtPos(pos.pos, pos.assoc), mid = posCoords ? (posCoords.top + posCoords.bottom) / 2 : 0;
    if (!posCoords || (forward ? mid > startY : mid < startY))
      return EditorSelection.cursor(pos.pos, pos.assoc, void 0, goal);
  }
}
function skipAtomicRanges(atoms, pos, bias) {
  for (; ; ) {
    let moved = 0;
    for (let set of atoms) {
      set.between(pos - 1, pos + 1, (from, to, value) => {
        if (pos > from && pos < to) {
          let side = moved || bias || (pos - from < to - pos ? -1 : 1);
          pos = side < 0 ? from : to;
          moved = side;
        }
      });
    }
    if (!moved)
      return pos;
  }
}
function skipAtomsForSelection(atoms, sel) {
  let ranges = null;
  for (let i = 0; i < sel.ranges.length; i++) {
    let range = sel.ranges[i], updated = null;
    if (range.empty) {
      let pos = skipAtomicRanges(atoms, range.from, 0);
      if (pos != range.from)
        updated = EditorSelection.cursor(pos, -1);
    } else {
      let from = skipAtomicRanges(atoms, range.from, -1);
      let to = skipAtomicRanges(atoms, range.to, 1);
      if (from != range.from || to != range.to) {
        if (range.undirectional)
          updated = EditorSelection.undirectionalRange(range.from, range.to);
        else
          updated = EditorSelection.range(range.from == range.anchor ? from : to, range.from == range.head ? from : to);
      }
    }
    if (updated) {
      if (!ranges)
        ranges = sel.ranges.slice();
      ranges[i] = updated;
    }
  }
  return ranges ? EditorSelection.create(ranges, sel.mainIndex) : sel;
}
function skipAtoms(view, oldPos, pos) {
  let newPos = skipAtomicRanges(view.state.facet(atomicRanges).map((f) => f(view)), pos.from, oldPos.head > pos.from ? -1 : 1);
  return newPos == pos.from ? pos : EditorSelection.cursor(newPos, newPos < pos.from ? 1 : -1);
}
var PosAssoc = class {
  constructor(pos, assoc) {
    this.pos = pos;
    this.assoc = assoc;
  }
};
function posAtCoords(view, coords, precise, scanY) {
  let content2 = view.contentDOM.getBoundingClientRect(), docTop = content2.top + view.viewState.paddingTop;
  let { x, y } = coords, yOffset = y - docTop, block;
  for (; ; ) {
    if (yOffset < 0)
      return new PosAssoc(0, 1);
    if (yOffset > view.viewState.docHeight)
      return new PosAssoc(view.state.doc.length, -1);
    block = view.elementAtHeight(yOffset);
    if (scanY == null)
      break;
    if (block.type == BlockType.Text) {
      if (scanY < 0 ? block.to < view.viewport.from : block.from > view.viewport.to)
        break;
      let rect = view.docView.coordsAt(scanY < 0 ? block.from : block.to, scanY > 0 ? -1 : 1);
      if (rect && (scanY < 0 ? rect.top <= yOffset + docTop : rect.bottom >= yOffset + docTop))
        break;
    }
    let halfLine = view.viewState.heightOracle.textHeight / 2;
    yOffset = scanY > 0 ? block.bottom + halfLine : block.top - halfLine;
  }
  if (view.viewport.from >= block.to || view.viewport.to <= block.from) {
    if (precise)
      return null;
    if (block.type == BlockType.Text) {
      let pos = posAtCoordsImprecise(view, content2, block, x, y);
      return new PosAssoc(pos, pos == block.from ? 1 : -1);
    }
  }
  if (block.type != BlockType.Text)
    return yOffset < (block.top + block.bottom) / 2 ? new PosAssoc(block.from, 1) : new PosAssoc(block.to, -1);
  let line = view.docView.lineAt(block.from, 2);
  if (!line || line.length != block.length)
    line = view.docView.lineAt(block.from, -2);
  return new InlineCoordsScan(view, x, y, view.textDirectionAt(block.from)).scanTile(line, block.from);
}
var InlineCoordsScan = class {
  constructor(view, x, y, baseDir) {
    this.view = view;
    this.x = x;
    this.y = y;
    this.baseDir = baseDir;
    this.line = null;
    this.spans = null;
  }
  bidiSpansAt(pos) {
    if (!this.line || this.line.from > pos || this.line.to < pos) {
      this.line = this.view.state.doc.lineAt(pos);
      this.spans = this.view.bidiSpans(this.line);
    }
    return this;
  }
  baseDirAt(pos, side) {
    let { line, spans } = this.bidiSpansAt(pos);
    let level = spans[BidiSpan.find(spans, pos - line.from, -1, side)].level;
    return level == this.baseDir;
  }
  dirAt(pos, side) {
    let { line, spans } = this.bidiSpansAt(pos);
    return spans[BidiSpan.find(spans, pos - line.from, -1, side)].dir;
  }
  // Used to short-circuit bidi tests for content with a uniform direction
  bidiIn(from, to) {
    let { spans, line } = this.bidiSpansAt(from);
    return spans.length > 1 || spans.length && (spans[0].level != this.baseDir || spans[0].to + line.from < to);
  }
  // Scan through the rectangles for the content of a tile with inline
  // content, looking for one that overlaps the queried position
  // vertically and is closest horizontally. The caller is responsible
  // for dividing its content into N pieces, and pass an array with
  // N+1 positions (including the position after the last piece). For
  // a text tile, these will be character clusters, for a composite
  // tile, these will be child tiles.
  scan(positions, getRects, recursed = false) {
    let lo = 0, hi = positions.length - 1, seen = /* @__PURE__ */ new Set();
    let bidi = this.bidiIn(positions[0], positions[hi]);
    let above, below;
    let closestI = -1, closestDx = 1e9, closestRect;
    search: while (lo < hi) {
      let dist2 = hi - lo, mid = lo + hi >> 1;
      adjust: if (seen.has(mid)) {
        let scan = lo + Math.floor(Math.random() * dist2);
        for (let i = 0; i < dist2; i++) {
          if (!seen.has(scan)) {
            mid = scan;
            break adjust;
          }
          scan++;
          if (scan == hi)
            scan = lo;
        }
        break search;
      }
      seen.add(mid);
      let rects = getRects(mid);
      if (rects)
        for (let i = 0; i < rects.length; i++) {
          let rect = rects[i], side = 0;
          if (rect.width == 0 && rects.length > 1)
            continue;
          if (rect.bottom < this.y) {
            if (!above || above.bottom < rect.bottom)
              above = rect;
            side = 1;
          } else if (rect.top > this.y) {
            if (!below || below.top > rect.top)
              below = rect;
            side = -1;
          } else {
            let off = rect.left > this.x ? this.x - rect.left : rect.right < this.x ? this.x - rect.right : 0;
            let dx = Math.abs(off);
            if (dx < closestDx) {
              closestI = mid;
              closestDx = dx;
              closestRect = rect;
            }
            if (off)
              side = off < 0 == (this.baseDir == Direction.LTR) ? -1 : 1;
          }
          if (side == -1 && (!bidi || this.baseDirAt(positions[mid], 1)))
            hi = mid;
          else if (side == 1 && (!bidi || this.baseDirAt(positions[mid + 1], -1)))
            lo = mid + 1;
        }
    }
    if (!closestRect) {
      if (!below && !above)
        return { i: positions[0], after: false };
      let side = above && (!below || this.y - above.bottom < below.top - this.y) ? above : below;
      this.y = (side.top + side.bottom) / 2;
      return this.scan(positions, getRects, true);
    }
    if (closestDx && !recursed) {
      let { top: top2, bottom } = closestRect;
      if (above && above.bottom > (top2 + top2 + bottom) / 3) {
        this.y = above.bottom - 1;
        return this.scan(positions, getRects, true);
      }
      if (below && below.top < (top2 + bottom + bottom) / 3) {
        this.y = below.top + 1;
        return this.scan(positions, getRects, true);
      }
    }
    let ltr = (bidi ? this.dirAt(positions[closestI], 1) : this.baseDir) == Direction.LTR;
    return {
      i: closestI,
      // Test whether x is closes to the start or end of this element
      after: this.x > (closestRect.left + closestRect.right) / 2 == ltr
    };
  }
  scanText(tile, offset) {
    let positions = [];
    for (let i = 0; i < tile.length; i = findClusterBreak2(tile.text, i))
      positions.push(offset + i);
    positions.push(offset + tile.length);
    let scan = this.scan(positions, (i) => {
      let off = positions[i] - offset, end = positions[i + 1] - offset;
      return textRange(tile.dom, off, end).getClientRects();
    });
    return scan.after ? new PosAssoc(positions[scan.i + 1], -1) : new PosAssoc(positions[scan.i], 1);
  }
  scanTile(tile, offset) {
    if (!tile.length)
      return new PosAssoc(offset, 1);
    if (tile.children.length == 1) {
      let child2 = tile.children[0];
      if (child2.isText())
        return this.scanText(child2, offset);
      else if (child2.isComposite())
        return this.scanTile(child2, offset);
    }
    let positions = [offset];
    for (let i = 0, pos2 = offset; i < tile.children.length; i++)
      positions.push(pos2 += tile.children[i].length);
    let scan = this.scan(positions, (i) => {
      let child2 = tile.children[i];
      if (child2.flags & 48)
        return null;
      return (child2.dom.nodeType == 1 ? child2.dom : textRange(child2.dom, 0, child2.length)).getClientRects();
    });
    let child = tile.children[scan.i], pos = positions[scan.i];
    if (child.isText())
      return this.scanText(child, pos);
    if (child.isComposite())
      return this.scanTile(child, pos);
    return scan.after ? new PosAssoc(positions[scan.i + 1], -1) : new PosAssoc(pos, 1);
  }
};
var LineBreakPlaceholder = "\uFFFF";
var DOMReader = class {
  constructor(points, view) {
    this.points = points;
    this.view = view;
    this.text = "";
    this.lineSeparator = view.state.facet(EditorState.lineSeparator);
  }
  append(text) {
    this.text += text;
  }
  lineBreak() {
    this.text += LineBreakPlaceholder;
  }
  readRange(start, end) {
    if (!start)
      return this;
    let parent = start.parentNode;
    for (let cur2 = start; ; ) {
      this.findPointBefore(parent, cur2);
      let oldLen = this.text.length;
      this.readNode(cur2);
      let tile = Tile.get(cur2), next = cur2.nextSibling;
      if (next == end) {
        if ((tile === null || tile === void 0 ? void 0 : tile.breakAfter) && !next && parent != this.view.contentDOM)
          this.lineBreak();
        break;
      }
      let nextTile = Tile.get(next);
      if ((tile && nextTile ? tile.breakAfter : (tile ? tile.breakAfter : isBlockElement(cur2)) || isBlockElement(next) && (cur2.nodeName != "BR" || (tile === null || tile === void 0 ? void 0 : tile.isWidget())) && this.text.length > oldLen) && !isEmptyToEnd(next, end))
        this.lineBreak();
      cur2 = next;
    }
    this.findPointBefore(parent, end);
    return this;
  }
  readTextNode(node) {
    let text = node.nodeValue;
    for (let point of this.points)
      if (point.node == node)
        point.pos = this.text.length + Math.min(point.offset, text.length);
    for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let nextBreak = -1, breakSize = 1, m;
      if (this.lineSeparator) {
        nextBreak = text.indexOf(this.lineSeparator, off);
        breakSize = this.lineSeparator.length;
      } else if (m = re.exec(text)) {
        nextBreak = m.index;
        breakSize = m[0].length;
      }
      this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
      if (nextBreak < 0)
        break;
      this.lineBreak();
      if (breakSize > 1) {
        for (let point of this.points)
          if (point.node == node && point.pos > this.text.length)
            point.pos -= breakSize - 1;
      }
      off = nextBreak + breakSize;
    }
  }
  readNode(node) {
    let tile = Tile.get(node);
    let fromView = tile && tile.overrideDOMText;
    if (fromView != null) {
      this.findPointInside(node, fromView.length);
      for (let i = fromView.iter(); !i.next().done; ) {
        if (i.lineBreak)
          this.lineBreak();
        else
          this.append(i.value);
      }
    } else if (node.nodeType == 3) {
      this.readTextNode(node);
    } else if (node.nodeName == "BR") {
      if (node.nextSibling)
        this.lineBreak();
    } else if (node.nodeType == 1) {
      this.readRange(node.firstChild, null);
    }
  }
  findPointBefore(node, next) {
    for (let point of this.points)
      if (point.node == node && node.childNodes[point.offset] == next)
        point.pos = this.text.length;
  }
  findPointInside(node, length) {
    for (let point of this.points)
      if (node.nodeType == 3 ? point.node == node : node.contains(point.node))
        point.pos = this.text.length + (isAtEnd(node, point.node, point.offset) ? length : 0);
  }
};
function isAtEnd(parent, node, offset) {
  for (; ; ) {
    if (!node || offset < maxOffset(node))
      return false;
    if (node == parent)
      return true;
    offset = domIndex(node) + 1;
    node = node.parentNode;
  }
}
function isEmptyToEnd(node, end) {
  let widgets;
  for (; ; node = node.nextSibling) {
    if (node == end || !node)
      break;
    let view = Tile.get(node);
    if (!(view === null || view === void 0 ? void 0 : view.isWidget()))
      return false;
    if (view)
      (widgets || (widgets = [])).push(view);
  }
  if (widgets)
    for (let w of widgets) {
      let override = w.overrideDOMText;
      if (override === null || override === void 0 ? void 0 : override.length)
        return false;
    }
  return true;
}
var DOMPoint = class {
  constructor(node, offset) {
    this.node = node;
    this.offset = offset;
    this.pos = -1;
  }
};
var DOMChange = class {
  constructor(view, start, end, typeOver) {
    this.typeOver = typeOver;
    this.bounds = null;
    this.text = "";
    this.domChanged = start > -1;
    let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView, curSel = view.state.selection;
    if (view.state.readOnly && start > -1) {
      this.newSel = null;
    } else if (start > -1 && (this.bounds = domBoundsAround(view.docView.tile, start, end, 0))) {
      let selPoints = iHead || iAnchor ? [] : selectionPoints(view);
      let reader = new DOMReader(selPoints, view);
      reader.readRange(this.bounds.startDOM, this.bounds.endDOM);
      this.text = reader.text;
      this.newSel = selectionFromPoints(selPoints, this.bounds.from);
    } else {
      let domSel = view.observer.selectionRange;
      let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view.contentDOM, domSel.focusNode) ? curSel.main.head : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
      let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view.contentDOM, domSel.anchorNode) ? curSel.main.anchor : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      let vp = view.viewport;
      if ((browser.ios || browser.chrome) && head != anchor && Math.min(head, anchor) <= curSel.main.from && Math.max(head, anchor) >= curSel.main.to && (vp.from > 0 || vp.to < view.state.doc.length)) {
        let from = Math.min(head, anchor), to = Math.max(head, anchor);
        let offFrom = vp.from - from, offTo = vp.to - to;
        if ((offFrom == 0 || offFrom == 1 || from == 0) && (offTo == 0 || offTo == -1 || to == view.state.doc.length)) {
          head = 0;
          anchor = view.state.doc.length;
        }
      }
      if (view.inputState.composing > -1 && curSel.ranges.length > 1) {
        this.newSel = curSel.replaceRange(EditorSelection.range(anchor, head));
      } else if (view.lineWrapping && anchor == head && !(curSel.main.empty && curSel.main.head == head) && view.inputState.lastTouchTime > Date.now() - 100) {
        let before = view.coordsAtPos(head, -1), assoc = 0;
        if (before)
          assoc = view.inputState.lastTouchY <= before.bottom ? -1 : 1;
        this.newSel = EditorSelection.create([EditorSelection.cursor(head, assoc)]);
      } else {
        this.newSel = EditorSelection.single(anchor, head);
      }
    }
  }
};
function domBoundsAround(tile, from, to, offset) {
  if (tile.isComposite()) {
    let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
    for (let i = 0, pos = offset, prevEnd = offset; i < tile.children.length; i++) {
      let child = tile.children[i], end = pos + child.length;
      if (pos < from && end > to)
        return domBoundsAround(child, from, to, pos);
      if (end >= from && fromI == -1) {
        fromI = i;
        fromStart = pos;
      }
      if (pos > to && child.dom.parentNode == tile.dom) {
        toI = i;
        toEnd = prevEnd;
        break;
      }
      prevEnd = end;
      pos = end + child.breakAfter;
    }
    return {
      from: fromStart,
      to: toEnd < 0 ? offset + tile.length : toEnd,
      startDOM: (fromI ? tile.children[fromI - 1].dom.nextSibling : null) || tile.dom.firstChild,
      endDOM: toI < tile.children.length && toI >= 0 ? tile.children[toI].dom : null
    };
  } else if (tile.isText()) {
    return { from: offset, to: offset + tile.length, startDOM: tile.dom, endDOM: tile.dom.nextSibling };
  } else {
    return null;
  }
}
function applyDOMChange(view, domChange) {
  let change;
  let { newSel } = domChange, { state } = view, sel = state.selection.main;
  let lastKey = view.inputState.lastKeyTime > Date.now() - 100 ? view.inputState.lastKeyCode : -1;
  if (domChange.bounds) {
    let { from, to } = domChange.bounds;
    let preferredPos = sel.from, preferredSide = null;
    if (lastKey === 8 || browser.android && domChange.text.length < to - from) {
      preferredPos = sel.to;
      preferredSide = "end";
    }
    let cmp = state.doc.sliceString(from, to, LineBreakPlaceholder), selEnd, diff;
    if (!sel.empty && sel.from >= from && sel.to <= to && (domChange.typeOver || cmp != domChange.text) && cmp.slice(0, sel.from - from) == domChange.text.slice(0, sel.from - from) && cmp.slice(sel.to - from) == domChange.text.slice(selEnd = domChange.text.length - (cmp.length - (sel.to - from)))) {
      change = {
        from: sel.from,
        to: sel.to,
        insert: Text.of(domChange.text.slice(sel.from - from, selEnd).split(LineBreakPlaceholder))
      };
    } else if (diff = findDiff(cmp, domChange.text, preferredPos - from, preferredSide)) {
      if (browser.chrome && lastKey == 13 && diff.toB == diff.from + 2 && domChange.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
        diff.toB--;
      change = {
        from: from + diff.from,
        to: from + diff.toA,
        insert: Text.of(domChange.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder))
      };
    }
  } else if (newSel && (!view.hasFocus && state.facet(editable) || sameSelPos(newSel, sel))) {
    newSel = null;
  }
  if (!change && !newSel)
    return false;
  if ((browser.mac || browser.android) && change && change.from == change.to && change.from == sel.head - 1 && /^\. ?$/.test(change.insert.toString()) && view.contentDOM.getAttribute("autocorrect") == "off") {
    if (newSel && change.insert.length == 2)
      newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
    change = { from: change.from, to: change.to, insert: Text.of([change.insert.toString().replace(".", " ")]) };
  } else if (state.doc.lineAt(sel.from).to < sel.to && view.docView.lineHasWidget(sel.to) && view.inputState.insertingTextAt > Date.now() - 50) {
    change = {
      from: sel.from,
      to: sel.to,
      insert: state.toText(view.inputState.insertingText)
    };
  } else if (browser.chrome && change && change.from == change.to && change.from == sel.head && change.insert.toString() == "\n " && view.lineWrapping) {
    if (newSel)
      newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
    change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
  }
  if (change) {
    return applyDOMChangeInner(view, change, newSel, lastKey);
  } else if (newSel && !sameSelPos(newSel, sel)) {
    let scrollIntoView3 = false, userEvent = "select";
    if (view.inputState.lastSelectionTime > Date.now() - 50) {
      if (view.inputState.lastSelectionOrigin == "select")
        scrollIntoView3 = true;
      userEvent = view.inputState.lastSelectionOrigin;
      if (userEvent == "select.pointer")
        newSel = skipAtomsForSelection(state.facet(atomicRanges).map((f) => f(view)), newSel);
    }
    view.dispatch({ selection: newSel, scrollIntoView: scrollIntoView3, userEvent });
    return true;
  } else {
    return false;
  }
}
function applyDOMChangeInner(view, change, newSel, lastKey = -1) {
  if (browser.ios && view.inputState.flushIOSKey(change))
    return true;
  let sel = view.state.selection.main;
  if (browser.android && (change.to == sel.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (change.from == sel.from || change.from == sel.from - 1 && view.state.sliceDoc(change.from, sel.from) == " ") && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view.contentDOM, "Enter", 13) || (change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 || lastKey == 8 && change.insert.length < change.to - change.from && change.to > sel.head) && dispatchKey(view.contentDOM, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view.contentDOM, "Delete", 46)))
    return true;
  let text = change.insert.toString();
  if (view.inputState.composing >= 0)
    view.inputState.composing++;
  let defaultTr;
  let defaultInsert = () => defaultTr || (defaultTr = applyDefaultInsert(view, change, newSel));
  if (!view.state.facet(inputHandler).some((h) => h(view, change.from, change.to, text, defaultInsert)))
    view.dispatch(defaultInsert());
  return true;
}
function applyDefaultInsert(view, change, newSel) {
  let tr, startState = view.state, sel = startState.selection.main, inAtomic = -1;
  if (change.from == change.to && change.from < sel.from || change.from > sel.to) {
    let side = change.from < sel.from ? -1 : 1, pos = side < 0 ? sel.from : sel.to;
    let moved = skipAtomicRanges(startState.facet(atomicRanges).map((f) => f(view)), pos, side);
    if (change.from == moved)
      inAtomic = moved;
  }
  if (inAtomic > -1) {
    tr = {
      changes: change,
      selection: EditorSelection.cursor(change.from + change.insert.length, -1)
    };
  } else if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) && view.inputState.composing < 0) {
    let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
    let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
    tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, void 0, view.state.lineBreak) + after));
  } else {
    let changes = startState.changes(change);
    let mainSel = newSel && newSel.main.to <= changes.newLength ? newSel.main : void 0;
    if (startState.selection.ranges.length > 1 && (view.inputState.composing >= 0 || view.inputState.compositionPendingChange) && change.to <= sel.to + 10 && change.to >= sel.to - 10) {
      let replaced = view.state.sliceDoc(change.from, change.to);
      let compositionRange, composition = newSel && findCompositionNode(view, newSel.main.head);
      if (composition) {
        let dLen = change.insert.length - (change.to - change.from);
        compositionRange = { from: composition.from, to: composition.to - dLen };
      } else {
        compositionRange = view.state.doc.lineAt(sel.head);
      }
      let offset = sel.to - change.to;
      tr = startState.changeByRange((range) => {
        if (range.from == sel.from && range.to == sel.to)
          return { changes, range: mainSel || range.map(changes) };
        let to = range.to - offset, from = to - replaced.length;
        if (view.state.sliceDoc(from, to) != replaced || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        to >= compositionRange.from && from <= compositionRange.to)
          return { range };
        let rangeChanges = startState.changes({ from, to, insert: change.insert }), selOff = range.to - sel.to;
        return {
          changes: rangeChanges,
          range: !mainSel ? range.map(rangeChanges) : EditorSelection.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
        };
      });
    } else {
      tr = {
        changes,
        selection: mainSel && startState.selection.replaceRange(mainSel)
      };
    }
  }
  let userEvent = "input.type";
  if (view.composing || view.inputState.compositionPendingChange && view.inputState.compositionEndedAt > Date.now() - 50) {
    view.inputState.compositionPendingChange = false;
    userEvent += ".compose";
    if (view.inputState.compositionFirstChange) {
      userEvent += ".start";
      view.inputState.compositionFirstChange = false;
    }
  }
  return startState.update(tr, { userEvent, scrollIntoView: true });
}
function findDiff(a, b, preferredPos, preferredSide) {
  let minLen = Math.min(a.length, b.length);
  let from = 0;
  while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
    from++;
  if (from == minLen && a.length == b.length)
    return null;
  let toA = a.length, toB = b.length;
  while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
    toA--;
    toB--;
  }
  if (preferredSide == "end") {
    let adjust = Math.max(0, from - Math.min(toA, toB));
    preferredPos -= toA + adjust - from;
  }
  if (toA < from && a.length < b.length) {
    let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
    from -= move;
    toB = from + (toB - toA);
    toA = from;
  } else if (toB < from) {
    let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
    from -= move;
    toA = from + (toA - toB);
    toB = from;
  }
  return { from, toA, toB };
}
function selectionPoints(view) {
  let result = [];
  if (view.root.activeElement != view.contentDOM)
    return result;
  let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
  if (anchorNode) {
    result.push(new DOMPoint(anchorNode, anchorOffset));
    if (focusNode != anchorNode || focusOffset != anchorOffset)
      result.push(new DOMPoint(focusNode, focusOffset));
  }
  return result;
}
function selectionFromPoints(points, base2) {
  if (points.length == 0)
    return null;
  let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
  return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
}
function sameSelPos(selection, range) {
  return range.head == selection.main.head && range.anchor == selection.main.anchor;
}
var InputState = class {
  setSelectionOrigin(origin) {
    this.lastSelectionOrigin = origin;
    this.lastSelectionTime = Date.now();
  }
  constructor(view) {
    this.view = view;
    this.lastKeyCode = 0;
    this.lastKeyTime = 0;
    this.touchActive = false;
    this.lastTouchTime = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastFocusTime = 0;
    this.lastScrollTop = 0;
    this.lastScrollLeft = 0;
    this.lastWheelEvent = 0;
    this.pendingIOSKey = void 0;
    this.lastIOSMomentumScroll = 0;
    this.tabFocusMode = -1;
    this.lastSelectionOrigin = null;
    this.lastSelectionTime = 0;
    this.lastContextMenu = 0;
    this.scrollHandlers = [];
    this.handlers = /* @__PURE__ */ Object.create(null);
    this.composing = -1;
    this.compositionFirstChange = null;
    this.compositionEndedAt = 0;
    this.compositionPendingKey = false;
    this.compositionPendingChange = false;
    this.insertingText = "";
    this.insertingTextAt = 0;
    this.mouseSelection = null;
    this.draggedContent = null;
    this.handleEvent = this.handleEvent.bind(this);
    this.notifiedFocused = view.hasFocus;
    if (browser.safari)
      view.contentDOM.addEventListener("input", () => null);
    if (browser.gecko)
      firefoxCopyCutHack(view.contentDOM.ownerDocument);
  }
  handleEvent(event) {
    if (!eventBelongsToEditor(this.view, event) || this.ignoreDuringComposition(event))
      return;
    if (event.type == "keydown" && this.keydown(event))
      return;
    if (this.view.updateState != 0)
      Promise.resolve().then(() => this.runHandlers(event.type, event));
    else
      this.runHandlers(event.type, event);
  }
  runHandlers(type, event) {
    let handlers2 = this.handlers[type];
    if (handlers2) {
      for (let observer of handlers2.observers)
        observer(this.view, event);
      for (let handler of handlers2.handlers) {
        if (event.defaultPrevented)
          break;
        if (handler(this.view, event)) {
          event.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(plugins) {
    let handlers2 = computeHandlers(plugins), prev = this.handlers, dom = this.view.contentDOM;
    for (let type in handlers2)
      if (type != "scroll") {
        let passive = !handlers2[type].handlers.length;
        let exists = prev[type];
        if (exists && passive != !exists.handlers.length) {
          dom.removeEventListener(type, this.handleEvent);
          exists = null;
        }
        if (!exists)
          dom.addEventListener(type, this.handleEvent, { passive });
      }
    for (let type in prev)
      if (type != "scroll" && !handlers2[type])
        dom.removeEventListener(type, this.handleEvent);
    this.handlers = handlers2;
  }
  keydown(event) {
    this.lastKeyCode = event.keyCode;
    this.lastKeyTime = Date.now();
    if (event.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return true;
    if (this.tabFocusMode > 0 && event.keyCode != 27 && modifierCodes.indexOf(event.keyCode) < 0)
      this.tabFocusMode = -1;
    if (browser.android && browser.chrome && !event.synthetic && (event.keyCode == 13 || event.keyCode == 8)) {
      this.view.observer.delayAndroidKey(event.key, event.keyCode);
      return true;
    }
    if (browser.ios && !event.synthetic && !event.altKey && !event.metaKey && (PendingKeys.some((key) => key.keyCode == event.keyCode) && !event.ctrlKey || EmacsyPendingKeys.indexOf(event.key) > -1 && event.ctrlKey)) {
      let mods = { ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey, shiftKey: event.shiftKey };
      if (mods.shiftKey && browser.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && iosVirtualKeyboardOpen(this.view.win))
        mods.shiftKey = false;
      this.pendingIOSKey = { key: event.key, keyCode: event.keyCode, mods };
      setTimeout(() => this.flushIOSKey(), 250);
      return true;
    }
    if (event.keyCode != 229)
      this.view.observer.forceFlush();
    return false;
  }
  flushIOSKey(change) {
    let key = this.pendingIOSKey;
    if (!key)
      return false;
    if (key.key == "Enter" && change && change.from < change.to && /^\S+$/.test(change.insert.toString()))
      return false;
    this.pendingIOSKey = void 0;
    return dispatchKey(this.view.contentDOM, key.key, key.keyCode, key.mods);
  }
  ignoreDuringComposition(event) {
    if (!/^key/.test(event.type) || event.synthetic)
      return false;
    if (this.composing > 0)
      return true;
    if (browser.safari && !browser.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100) {
      this.compositionPendingKey = false;
      return true;
    }
    return false;
  }
  startMouseSelection(mouseSelection) {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
    this.mouseSelection = mouseSelection;
  }
  update(update) {
    this.view.observer.update(update);
    if (this.mouseSelection)
      this.mouseSelection.update(update);
    if (this.draggedContent && update.docChanged)
      this.draggedContent = this.draggedContent.map(update.changes);
    if (update.transactions.length)
      this.lastKeyCode = this.lastSelectionTime = 0;
  }
  destroy() {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
  }
};
function iosVirtualKeyboardOpen(win) {
  if (!win.visualViewport)
    return false;
  return win.visualViewport.height * win.visualViewport.scale / win.document.documentElement.clientHeight < 0.85;
}
function bindHandler(plugin, handler) {
  return (view, event) => {
    try {
      return handler.call(plugin, event, view);
    } catch (e) {
      logException(view.state, e);
    }
  };
}
function computeHandlers(plugins) {
  let result = /* @__PURE__ */ Object.create(null);
  function record(type) {
    return result[type] || (result[type] = { observers: [], handlers: [] });
  }
  for (let plugin of plugins) {
    let spec = plugin.spec, handlers2 = spec && spec.plugin.domEventHandlers, observers2 = spec && spec.plugin.domEventObservers;
    if (handlers2)
      for (let type in handlers2) {
        let f = handlers2[type];
        if (f)
          record(type).handlers.push(bindHandler(plugin.value, f));
      }
    if (observers2)
      for (let type in observers2) {
        let f = observers2[type];
        if (f)
          record(type).observers.push(bindHandler(plugin.value, f));
      }
  }
  for (let type in handlers)
    record(type).handlers.push(handlers[type]);
  for (let type in observers)
    record(type).observers.push(observers[type]);
  return result;
}
var PendingKeys = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
];
var EmacsyPendingKeys = "dthko";
var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
var dragScrollMargin = 6;
function dragScrollSpeed(dist2) {
  return Math.max(0, dist2) * 0.7 + 8;
}
function dist(a, b) {
  return Math.max(Math.abs(a.clientX - b.clientX), Math.abs(a.clientY - b.clientY));
}
var MouseSelection = class {
  constructor(view, startEvent, style, mustSelect) {
    this.view = view;
    this.startEvent = startEvent;
    this.style = style;
    this.mustSelect = mustSelect;
    this.scrollSpeed = { x: 0, y: 0 };
    this.scrolling = -1;
    this.lastEvent = startEvent;
    this.scrollParents = scrollableParents(view.contentDOM);
    this.atoms = view.state.facet(atomicRanges).map((f) => f(view));
    let doc2 = view.contentDOM.ownerDocument;
    doc2.addEventListener("mousemove", this.move = this.move.bind(this));
    doc2.addEventListener("mouseup", this.up = this.up.bind(this));
    this.extend = startEvent.shiftKey;
    this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
    this.dragging = isInPrimarySelection(view, startEvent) && getClickType(startEvent) == 1 ? null : false;
  }
  start(event) {
    if (this.dragging === false)
      this.select(event);
  }
  move(event) {
    if (event.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && dist(this.startEvent, event) < 10)
      return;
    this.select(this.lastEvent = event);
    let sx = 0, sy = 0;
    let left = 0, top2 = 0, right = this.view.win.innerWidth, bottom = this.view.win.innerHeight;
    if (this.scrollParents.x)
      ({ left, right } = this.scrollParents.x.getBoundingClientRect());
    if (this.scrollParents.y)
      ({ top: top2, bottom } = this.scrollParents.y.getBoundingClientRect());
    let margins = getScrollMargins(this.view);
    if (event.clientX - margins.left <= left + dragScrollMargin)
      sx = -dragScrollSpeed(left - event.clientX);
    else if (event.clientX + margins.right >= right - dragScrollMargin)
      sx = dragScrollSpeed(event.clientX - right);
    if (event.clientY - margins.top <= top2 + dragScrollMargin)
      sy = -dragScrollSpeed(top2 - event.clientY);
    else if (event.clientY + margins.bottom >= bottom - dragScrollMargin)
      sy = dragScrollSpeed(event.clientY - bottom);
    this.setScrollSpeed(sx, sy);
  }
  up(event) {
    if (this.dragging == null)
      this.select(this.lastEvent);
    if (!this.dragging)
      event.preventDefault();
    this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let doc2 = this.view.contentDOM.ownerDocument;
    doc2.removeEventListener("mousemove", this.move);
    doc2.removeEventListener("mouseup", this.up);
    this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(sx, sy) {
    this.scrollSpeed = { x: sx, y: sy };
    if (sx || sy) {
      if (this.scrolling < 0)
        this.scrolling = setInterval(() => this.scroll(), 50);
    } else if (this.scrolling > -1) {
      clearInterval(this.scrolling);
      this.scrolling = -1;
    }
  }
  scroll() {
    let { x, y } = this.scrollSpeed;
    if (x && this.scrollParents.x) {
      this.scrollParents.x.scrollLeft += x;
      x = 0;
    }
    if (y && this.scrollParents.y) {
      this.scrollParents.y.scrollTop += y;
      y = 0;
    }
    if (x || y)
      this.view.win.scrollBy(x, y);
    if (this.dragging === false)
      this.select(this.lastEvent);
  }
  select(event) {
    let { view } = this, selection = skipAtomsForSelection(this.atoms, this.style.get(event, this.extend, this.multiple));
    if (this.mustSelect || !selection.eq(view.state.selection, this.dragging === false))
      this.view.dispatch({
        selection,
        userEvent: "select.pointer"
      });
    this.mustSelect = false;
  }
  update(update) {
    if (update.transactions.some((tr) => tr.isUserEvent("input.type")))
      this.destroy();
    else if (this.style.update(update))
      setTimeout(() => this.select(this.lastEvent), 20);
  }
};
function addsSelectionRange(view, event) {
  let facet = view.state.facet(clickAddsSelectionRange);
  return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
}
function dragMovesSelection(view, event) {
  let facet = view.state.facet(dragMovesSelection$1);
  return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
}
function isInPrimarySelection(view, event) {
  let { main } = view.state.selection;
  if (main.empty)
    return false;
  let sel = getSelection(view.root);
  if (!sel || sel.rangeCount == 0)
    return true;
  let rects = sel.getRangeAt(0).getClientRects();
  for (let i = 0; i < rects.length; i++) {
    let rect = rects[i];
    if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
      return true;
  }
  return false;
}
function eventBelongsToEditor(view, event) {
  if (!event.bubbles)
    return true;
  if (event.defaultPrevented)
    return false;
  for (let node = event.target, tile; node != view.contentDOM; node = node.parentNode)
    if (!node || node.nodeType == 11 || (tile = Tile.get(node)) && tile.isWidget() && !tile.isHidden && tile.widget.ignoreEvent(event))
      return false;
  return true;
}
var handlers = /* @__PURE__ */ Object.create(null);
var observers = /* @__PURE__ */ Object.create(null);
var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
function capturePaste(view) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.focus();
  setTimeout(() => {
    view.focus();
    target.remove();
    doPaste(view, target.value);
  }, 50);
}
function textFilter(state, facet, text) {
  for (let filter of state.facet(facet))
    text = filter(text, state);
  return text;
}
function doPaste(view, input) {
  input = textFilter(view.state, clipboardInputFilter, input);
  let { state } = view, changes, i = 1, text = state.toText(input);
  let byLine = text.lines == state.selection.ranges.length;
  let linewise = lastLinewiseCopy != null && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
  if (linewise) {
    let lastLine = -1;
    changes = state.changeByRange((range) => {
      let line = state.doc.lineAt(range.from);
      if (line.from == lastLine)
        return { range };
      lastLine = line.from;
      let insert2 = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
      return {
        changes: { from: line.from, insert: insert2 },
        range: EditorSelection.cursor(range.from + insert2.length)
      };
    });
  } else if (byLine) {
    changes = state.changeByRange((range) => {
      let line = text.line(i++);
      return {
        changes: { from: range.from, to: range.to, insert: line.text },
        range: EditorSelection.cursor(range.from + line.length)
      };
    });
  } else {
    changes = state.replaceSelection(text);
  }
  view.dispatch(changes, {
    userEvent: "input.paste",
    scrollIntoView: true
  });
}
observers.scroll = (view) => {
  let iState = view.inputState;
  iState.lastScrollTop = view.scrollDOM.scrollTop;
  iState.lastScrollLeft = view.scrollDOM.scrollLeft;
  if (browser.ios && !iState.touchActive)
    iState.lastIOSMomentumScroll = Date.now();
};
observers.wheel = observers.mousewheel = (view) => {
  view.inputState.lastWheelEvent = Date.now();
};
handlers.keydown = (view, event) => {
  view.inputState.setSelectionOrigin("select");
  if (event.keyCode == 27 && view.inputState.tabFocusMode != 0)
    view.inputState.tabFocusMode = Date.now() + 2e3;
  return false;
};
observers.touchstart = (view, e) => {
  let iState = view.inputState, touch = e.targetTouches[0];
  iState.touchActive = true;
  iState.lastTouchTime = Date.now();
  if (touch) {
    iState.lastTouchX = touch.clientX;
    iState.lastTouchY = touch.clientY;
  }
  iState.setSelectionOrigin("select.pointer");
};
observers.touchmove = (view) => {
  view.inputState.setSelectionOrigin("select.pointer");
};
observers.touchend = (view, e) => {
  view.inputState.touchActive = false;
};
handlers.mousedown = (view, event) => {
  view.observer.flush();
  if (view.inputState.lastTouchTime > Date.now() - 2e3)
    return false;
  let style = null;
  for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
    style = makeStyle(view, event);
    if (style)
      break;
  }
  if (!style && event.button == 0)
    style = basicMouseSelection(view, event);
  if (style) {
    let mustFocus = !view.hasFocus;
    view.inputState.startMouseSelection(new MouseSelection(view, event, style, mustFocus));
    if (mustFocus)
      view.observer.ignore(() => {
        focusPreventScroll(view.contentDOM);
        let active = view.root.activeElement;
        if (active && !active.contains(view.contentDOM))
          active.blur();
      });
    let mouseSel = view.inputState.mouseSelection;
    if (mouseSel) {
      mouseSel.start(event);
      return mouseSel.dragging === false;
    }
  } else {
    view.inputState.setSelectionOrigin("select.pointer");
  }
  return false;
};
function rangeForClick(view, pos, bias, type) {
  if (type == 1) {
    return EditorSelection.cursor(pos, bias);
  } else if (type == 2) {
    return groupAt(view.state, pos, bias);
  } else {
    let visual = view.docView.lineAt(pos, bias), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
    let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
    if (to < view.state.doc.length && to == line.to)
      to++;
    return EditorSelection.undirectionalRange(from, to);
  }
}
var BadMouseDetail = browser.ie && browser.ie_version <= 11;
var lastMouseDown = null;
var lastMouseDownCount = 0;
var lastMouseDownTime = 0;
function getClickType(event) {
  if (!BadMouseDetail)
    return event.detail;
  let last = lastMouseDown, lastTime = lastMouseDownTime;
  lastMouseDown = event;
  lastMouseDownTime = Date.now();
  return lastMouseDownCount = !last || lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
}
function basicMouseSelection(view, event) {
  let start = view.posAndSideAtCoords({ x: event.clientX, y: event.clientY }, false), type = getClickType(event);
  let startSel = view.state.selection;
  return {
    update(update) {
      if (update.docChanged) {
        start.pos = update.changes.mapPos(start.pos);
        startSel = startSel.map(update.changes);
      }
    },
    get(event2, extend, multiple) {
      let cur2 = view.posAndSideAtCoords({ x: event2.clientX, y: event2.clientY }, false), removed;
      let range = rangeForClick(view, cur2.pos, cur2.assoc, type);
      if (start.pos != cur2.pos && !extend) {
        let startRange = rangeForClick(view, start.pos, start.assoc, type);
        let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
        range = from < range.from ? EditorSelection.range(from, to, range.assoc) : EditorSelection.range(to, from, range.assoc);
      }
      if (extend)
        return startSel.replaceRange(startSel.main.extend(range.from, range.to, range.assoc));
      else if (multiple && type == 1 && startSel.ranges.length > 1 && (removed = removeRangeAround(startSel, cur2.pos)))
        return removed;
      else if (multiple)
        return startSel.addRange(range);
      else
        return EditorSelection.create([range]);
    }
  };
}
function removeRangeAround(sel, pos) {
  for (let i = 0; i < sel.ranges.length; i++) {
    let { from, to } = sel.ranges[i];
    if (from <= pos && to >= pos)
      return EditorSelection.create(sel.ranges.slice(0, i).concat(sel.ranges.slice(i + 1)), sel.mainIndex == i ? 0 : sel.mainIndex - (sel.mainIndex > i ? 1 : 0));
  }
  return null;
}
handlers.dragstart = (view, event) => {
  let { selection: { main: range } } = view.state;
  if (event.target.draggable) {
    let tile = view.docView.tile.nearest(event.target);
    if (tile && tile.isWidget()) {
      let from = tile.posAtStart, to = from + tile.length;
      if (from >= range.to || to <= range.from)
        range = EditorSelection.undirectionalRange(from, to);
    }
  }
  let { inputState } = view;
  if (inputState.mouseSelection)
    inputState.mouseSelection.dragging = true;
  inputState.draggedContent = range;
  if (event.dataTransfer) {
    event.dataTransfer.setData("Text", textFilter(view.state, clipboardOutputFilter, view.state.sliceDoc(range.from, range.to)));
    event.dataTransfer.effectAllowed = "copyMove";
  }
  return false;
};
handlers.dragend = (view) => {
  view.inputState.draggedContent = null;
  return false;
};
function dropText(view, event, text, direct) {
  text = textFilter(view.state, clipboardInputFilter, text);
  if (!text)
    return;
  let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
  let { draggedContent } = view.inputState;
  let del = direct && draggedContent && dragMovesSelection(view, event) ? { from: draggedContent.from, to: draggedContent.to } : null;
  let ins = { from: dropPos, insert: text };
  let changes = view.state.changes(del ? [del, ins] : ins);
  view.focus();
  view.dispatch({
    changes,
    selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
    userEvent: del ? "move.drop" : "input.drop"
  });
  view.inputState.draggedContent = null;
}
handlers.drop = (view, event) => {
  if (!event.dataTransfer)
    return false;
  if (view.state.readOnly)
    return true;
  let files = event.dataTransfer.files;
  if (files && files.length) {
    let text = Array(files.length), read = 0;
    let finishFile = () => {
      if (++read == files.length)
        dropText(view, event, text.filter((s) => s != null).join(view.state.lineBreak), false);
    };
    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      reader.onerror = finishFile;
      reader.onload = () => {
        if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
          text[i] = reader.result;
        finishFile();
      };
      reader.readAsText(files[i]);
    }
    return true;
  } else {
    let text = event.dataTransfer.getData("Text");
    if (text) {
      dropText(view, event, text, true);
      return true;
    }
  }
  return false;
};
handlers.paste = (view, event) => {
  if (view.state.readOnly)
    return true;
  view.observer.flush();
  let data = brokenClipboardAPI ? null : event.clipboardData;
  if (data) {
    doPaste(view, data.getData("text/plain") || data.getData("text/uri-list"));
    return true;
  } else {
    capturePaste(view);
    return false;
  }
};
function captureCopy(view, text) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.value = text;
  target.focus();
  target.selectionEnd = text.length;
  target.selectionStart = 0;
  setTimeout(() => {
    target.remove();
    view.focus();
  }, 50);
}
function copiedRange(state) {
  let content2 = [], ranges = [], linewise = false;
  for (let range of state.selection.ranges)
    if (!range.empty) {
      content2.push(state.sliceDoc(range.from, range.to));
      ranges.push(range);
    }
  if (!content2.length) {
    let upto = -1;
    for (let { from } of state.selection.ranges) {
      let line = state.doc.lineAt(from);
      if (line.number > upto) {
        content2.push(line.text);
        ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
      }
      upto = line.number;
    }
    linewise = true;
  }
  return { text: textFilter(state, clipboardOutputFilter, content2.join(state.lineBreak)), ranges, linewise };
}
var lastLinewiseCopy = null;
handlers.copy = handlers.cut = (view, event) => {
  if (!hasSelection(view.contentDOM, view.observer.selectionRange))
    return false;
  let { text, ranges, linewise } = copiedRange(view.state);
  if (!text && !linewise)
    return false;
  lastLinewiseCopy = linewise ? text : null;
  if (event.type == "cut" && !view.state.readOnly)
    view.dispatch({
      changes: ranges,
      scrollIntoView: true,
      userEvent: "delete.cut"
    });
  let data = brokenClipboardAPI ? null : event.clipboardData;
  if (data) {
    data.clearData();
    data.setData("text/plain", text);
    return true;
  } else {
    captureCopy(view, text);
    return false;
  }
};
var isFocusChange = /* @__PURE__ */ Annotation.define();
function focusChangeTransaction(state, focus) {
  let effects = [];
  for (let getEffect of state.facet(focusChangeEffect)) {
    let effect = getEffect(state, focus);
    if (effect)
      effects.push(effect);
  }
  return effects.length ? state.update({ effects, annotations: isFocusChange.of(true) }) : null;
}
function updateForFocusChange(view) {
  setTimeout(() => {
    let focus = view.hasFocus;
    if (focus != view.inputState.notifiedFocused) {
      let tr = focusChangeTransaction(view.state, focus);
      if (tr)
        view.dispatch(tr);
      else
        view.update([]);
    }
  }, 10);
}
observers.focus = (view) => {
  view.inputState.lastFocusTime = Date.now();
  if (!view.scrollDOM.scrollTop && (view.inputState.lastScrollTop || view.inputState.lastScrollLeft)) {
    view.scrollDOM.scrollTop = view.inputState.lastScrollTop;
    view.scrollDOM.scrollLeft = view.inputState.lastScrollLeft;
  }
  updateForFocusChange(view);
};
observers.blur = (view) => {
  view.observer.clearSelectionRange();
  updateForFocusChange(view);
};
observers.compositionstart = observers.compositionupdate = (view) => {
  if (view.observer.editContext)
    return;
  if (view.inputState.compositionFirstChange == null)
    view.inputState.compositionFirstChange = true;
  if (view.inputState.composing < 0) {
    view.inputState.composing = 0;
  }
};
observers.compositionend = (view) => {
  if (view.observer.editContext)
    return;
  view.inputState.composing = -1;
  view.inputState.compositionEndedAt = Date.now();
  view.inputState.compositionPendingKey = true;
  view.inputState.compositionPendingChange = view.observer.pendingRecords().length > 0;
  view.inputState.compositionFirstChange = null;
  if (browser.chrome && browser.android) {
    view.observer.flushSoon();
  } else if (view.inputState.compositionPendingChange) {
    Promise.resolve().then(() => view.observer.flush());
  } else {
    setTimeout(() => {
      if (view.inputState.composing < 0 && view.docView.hasComposition)
        view.update([]);
    }, 50);
  }
};
observers.contextmenu = (view) => {
  view.inputState.lastContextMenu = Date.now();
};
handlers.beforeinput = (view, event) => {
  var _a2, _b;
  if (event.inputType == "insertText" || event.inputType == "insertCompositionText") {
    view.inputState.insertingText = event.data;
    view.inputState.insertingTextAt = Date.now();
  }
  if (event.inputType == "insertReplacementText" && view.observer.editContext) {
    let text = (_a2 = event.dataTransfer) === null || _a2 === void 0 ? void 0 : _a2.getData("text/plain"), ranges = event.getTargetRanges();
    if (text && ranges.length) {
      let r = ranges[0];
      let from = view.posAtDOM(r.startContainer, r.startOffset), to = view.posAtDOM(r.endContainer, r.endOffset);
      applyDOMChangeInner(view, { from, to, insert: view.state.toText(text) }, null);
      return true;
    }
  }
  let pending;
  if (browser.chrome && browser.android && (pending = PendingKeys.find((key) => key.inputType == event.inputType))) {
    view.observer.delayAndroidKey(pending.key, pending.keyCode);
    if (pending.key == "Backspace" || pending.key == "Delete") {
      let startViewHeight = ((_b = window.visualViewport) === null || _b === void 0 ? void 0 : _b.height) || 0;
      setTimeout(() => {
        var _a3;
        if ((((_a3 = window.visualViewport) === null || _a3 === void 0 ? void 0 : _a3.height) || 0) > startViewHeight + 10 && view.hasFocus) {
          view.contentDOM.blur();
          view.focus();
        }
      }, 100);
    }
  }
  if (browser.ios && event.inputType == "deleteContentForward") {
    view.observer.flushSoon();
  }
  if (browser.safari && event.inputType == "insertText" && view.inputState.composing >= 0) {
    setTimeout(() => observers.compositionend(view, event), 20);
  }
  return false;
};
var appliedFirefoxHack = /* @__PURE__ */ new Set();
function firefoxCopyCutHack(doc2) {
  if (!appliedFirefoxHack.has(doc2)) {
    appliedFirefoxHack.add(doc2);
    doc2.addEventListener("copy", () => {
    });
    doc2.addEventListener("cut", () => {
    });
  }
}
var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
var heightChangeFlag = false;
function clearHeightChangeFlag() {
  heightChangeFlag = false;
}
var HeightOracle = class {
  constructor(lineWrapping) {
    this.lineWrapping = lineWrapping;
    this.doc = Text.empty;
    this.heightSamples = {};
    this.lineHeight = 14;
    this.charWidth = 7;
    this.textHeight = 14;
    this.lineLength = 30;
  }
  heightForGap(from, to) {
    let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
    if (this.lineWrapping)
      lines += Math.max(0, Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength));
    return this.lineHeight * lines;
  }
  heightForLine(length) {
    if (!this.lineWrapping)
      return this.lineHeight;
    let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / Math.max(1, this.lineLength - 5)));
    return lines * this.lineHeight;
  }
  setDoc(doc2) {
    this.doc = doc2;
    return this;
  }
  mustRefreshForWrapping(whiteSpace) {
    return wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(lineHeights) {
    let newHeight = false;
    for (let i = 0; i < lineHeights.length; i++) {
      let h = lineHeights[i];
      if (h < 0) {
        i++;
      } else if (!this.heightSamples[Math.floor(h * 10)]) {
        newHeight = true;
        this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return newHeight;
  }
  refresh(whiteSpace, lineHeight, charWidth, textHeight, lineLength, knownHeights) {
    let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
    let changed = Math.abs(lineHeight - this.lineHeight) > 0.3 || this.lineWrapping != lineWrapping;
    this.lineWrapping = lineWrapping;
    this.lineHeight = lineHeight;
    this.charWidth = charWidth;
    this.textHeight = textHeight;
    this.lineLength = lineLength;
    if (changed) {
      this.heightSamples = {};
      for (let i = 0; i < knownHeights.length; i++) {
        let h = knownHeights[i];
        if (h < 0)
          i++;
        else
          this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return changed;
  }
};
var MeasuredHeights = class {
  constructor(from, heights) {
    this.from = from;
    this.heights = heights;
    this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
};
var BlockInfo = class _BlockInfo {
  /**
  @internal
  */
  constructor(from, length, top2, height, _content) {
    this.from = from;
    this.length = length;
    this.top = top2;
    this.height = height;
    this._content = _content;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? BlockType.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof PointDecoration ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(other) {
    let content2 = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(other._content) ? other._content : [other]);
    return new _BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, content2);
  }
};
var QueryType = /* @__PURE__ */ (function(QueryType2) {
  QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
  QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
  QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
  return QueryType2;
})(QueryType || (QueryType = {}));
var Epsilon = 1e-3;
var HeightMap = class _HeightMap {
  constructor(length, height, flags = 2) {
    this.length = length;
    this.height = height;
    this.flags = flags;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(value) {
    this.flags = (value ? 2 : 0) | this.flags & ~2;
  }
  setHeight(height) {
    if (this.height != height) {
      if (Math.abs(this.height - height) > Epsilon)
        heightChangeFlag = true;
      this.height = height;
    }
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(_from, _to, nodes) {
    return _HeightMap.of(nodes);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(_to, result) {
    result.push(this);
  }
  decomposeRight(_from, result) {
    result.push(this);
  }
  applyChanges(decorations2, oldDoc, oracle, changes) {
    let me = this, doc2 = oracle.doc;
    for (let i = changes.length - 1; i >= 0; i--) {
      let { fromA, toA, fromB, toB } = changes[i];
      let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle.setDoc(oldDoc), 0, 0);
      let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oracle, 0, 0);
      toB += end.to - toA;
      toA = end.to;
      while (i > 0 && start.from <= changes[i - 1].toA) {
        fromA = changes[i - 1].fromA;
        fromB = changes[i - 1].fromB;
        i--;
        if (fromA < start.from)
          start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle, 0, 0);
      }
      fromB += start.from - fromA;
      fromA = start.from;
      let nodes = NodeBuilder.build(oracle.setDoc(doc2), decorations2, fromB, toB);
      me = replace(me, me.replace(fromA, toA, nodes));
    }
    return me.updateHeight(oracle, 0);
  }
  static empty() {
    return new HeightMapText(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(nodes) {
    if (nodes.length == 1)
      return nodes[0];
    let i = 0, j = nodes.length, before = 0, after = 0;
    for (; ; ) {
      if (i == j) {
        if (before > after * 2) {
          let split = nodes[i - 1];
          if (split.break)
            nodes.splice(--i, 1, split.left, null, split.right);
          else
            nodes.splice(--i, 1, split.left, split.right);
          j += 1 + split.break;
          before -= split.size;
        } else if (after > before * 2) {
          let split = nodes[j];
          if (split.break)
            nodes.splice(j, 1, split.left, null, split.right);
          else
            nodes.splice(j, 1, split.left, split.right);
          j += 2 + split.break;
          after -= split.size;
        } else {
          break;
        }
      } else if (before < after) {
        let next = nodes[i++];
        if (next)
          before += next.size;
      } else {
        let next = nodes[--j];
        if (next)
          after += next.size;
      }
    }
    let brk = 0;
    if (nodes[i - 1] == null) {
      brk = 1;
      i--;
    } else if (nodes[i] == null) {
      brk = 1;
      j++;
    }
    return new HeightMapBranch(_HeightMap.of(nodes.slice(0, i)), brk, _HeightMap.of(nodes.slice(j)));
  }
};
function replace(old, val) {
  if (old == val)
    return old;
  if (old.constructor != val.constructor)
    heightChangeFlag = true;
  return val;
}
HeightMap.prototype.size = 1;
var SpaceDeco = /* @__PURE__ */ Decoration.replace({});
var HeightMapBlock = class extends HeightMap {
  constructor(length, height, deco) {
    super(length, height);
    this.deco = deco;
    this.spaceAbove = 0;
  }
  mainBlock(top2, offset) {
    return new BlockInfo(offset, this.length, top2 + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(height, _oracle, top2, offset) {
    return this.spaceAbove && height < top2 + this.spaceAbove ? new BlockInfo(offset, 0, top2, this.spaceAbove, SpaceDeco) : this.mainBlock(top2, offset);
  }
  lineAt(_value, _type, oracle, top2, offset) {
    let main = this.mainBlock(top2, offset);
    return this.spaceAbove ? this.blockAt(0, oracle, top2, offset).join(main) : main;
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    if (from <= offset + this.length && to >= offset)
      f(this.lineAt(0, QueryType.ByPos, oracle, top2, offset));
  }
  setMeasuredHeight(measured) {
    let next = measured.heights[measured.index++];
    if (next < 0) {
      this.spaceAbove = -next;
      next = measured.heights[measured.index++];
    } else {
      this.spaceAbove = 0;
    }
    this.setHeight(next);
  }
  updateHeight(oracle, offset = 0, _force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setMeasuredHeight(measured);
    this.outdated = false;
    return this;
  }
  toString() {
    return `block(${this.length})`;
  }
};
var HeightMapText = class _HeightMapText extends HeightMapBlock {
  constructor(length, height, above) {
    super(length, height, null);
    this.collapsed = 0;
    this.widgetHeight = 0;
    this.breaks = 0;
    this.spaceAbove = above;
  }
  mainBlock(top2, offset) {
    return new BlockInfo(offset, this.length, top2 + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(_from, _to, nodes) {
    let node = nodes[0];
    if (nodes.length == 1 && (node instanceof _HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
      if (node instanceof HeightMapGap)
        node = new _HeightMapText(node.length, this.height, this.spaceAbove);
      else
        node.height = this.height;
      if (!this.outdated)
        node.outdated = false;
      return node;
    } else {
      return HeightMap.of(nodes);
    }
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    if (measured && measured.from <= offset && measured.more) {
      this.setMeasuredHeight(measured);
    } else if (force || this.outdated) {
      this.spaceAbove = 0;
      this.setHeight(Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)) + this.breaks * oracle.lineHeight);
    }
    this.outdated = false;
    return this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
};
var HeightMapGap = class _HeightMapGap extends HeightMap {
  constructor(length) {
    super(length, 0);
  }
  heightMetrics(oracle, offset) {
    let firstLine = oracle.doc.lineAt(offset).number, lastLine = oracle.doc.lineAt(offset + this.length).number;
    let lines = lastLine - firstLine + 1;
    let perLine, perChar = 0;
    if (oracle.lineWrapping) {
      let totalPerLine = Math.min(this.height, oracle.lineHeight * lines);
      perLine = totalPerLine / lines;
      if (this.length > lines + 1)
        perChar = (this.height - totalPerLine) / (this.length - lines - 1);
    } else {
      perLine = this.height / lines;
    }
    return { firstLine, lastLine, perLine, perChar };
  }
  blockAt(height, oracle, top2, offset) {
    let { firstLine, lastLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    if (oracle.lineWrapping) {
      let guess = offset + (height < oracle.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (height - top2) / this.height)) * this.length));
      let line = oracle.doc.lineAt(guess), lineHeight = perLine + line.length * perChar;
      let lineTop = Math.max(top2, height - lineHeight / 2);
      return new BlockInfo(line.from, line.length, lineTop, lineHeight, 0);
    } else {
      let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / perLine)));
      let { from, length } = oracle.doc.line(firstLine + line);
      return new BlockInfo(from, length, top2 + perLine * line, perLine, 0);
    }
  }
  lineAt(value, type, oracle, top2, offset) {
    if (type == QueryType.ByHeight)
      return this.blockAt(value, oracle, top2, offset);
    if (type == QueryType.ByPosNoHeight) {
      let { from, to } = oracle.doc.lineAt(value);
      return new BlockInfo(from, to - from, 0, 0, 0);
    }
    let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    let line = oracle.doc.lineAt(value), lineHeight = perLine + line.length * perChar;
    let linesAbove = line.number - firstLine;
    let lineTop = top2 + perLine * linesAbove + perChar * (line.from - offset - linesAbove);
    return new BlockInfo(line.from, line.length, Math.max(top2, Math.min(lineTop, top2 + this.height - lineHeight)), lineHeight, 0);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    from = Math.max(from, offset);
    to = Math.min(to, offset + this.length);
    let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    for (let pos = from, lineTop = top2; pos <= to; ) {
      let line = oracle.doc.lineAt(pos);
      if (pos == from) {
        let linesAbove = line.number - firstLine;
        lineTop += perLine * linesAbove + perChar * (from - offset - linesAbove);
      }
      let lineHeight = perLine + perChar * line.length;
      f(new BlockInfo(line.from, line.length, lineTop, lineHeight, 0));
      lineTop += lineHeight;
      pos = line.to + 1;
    }
  }
  replace(from, to, nodes) {
    let after = this.length - to;
    if (after > 0) {
      let last = nodes[nodes.length - 1];
      if (last instanceof _HeightMapGap)
        nodes[nodes.length - 1] = new _HeightMapGap(last.length + after);
      else
        nodes.push(null, new _HeightMapGap(after - 1));
    }
    if (from > 0) {
      let first = nodes[0];
      if (first instanceof _HeightMapGap)
        nodes[0] = new _HeightMapGap(from + first.length);
      else
        nodes.unshift(new _HeightMapGap(from - 1), null);
    }
    return HeightMap.of(nodes);
  }
  decomposeLeft(to, result) {
    result.push(new _HeightMapGap(to - 1), null);
  }
  decomposeRight(from, result) {
    result.push(null, new _HeightMapGap(this.length - from - 1));
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let end = offset + this.length;
    if (measured && measured.from <= offset + this.length && measured.more) {
      let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
      if (measured.from > offset)
        nodes.push(new _HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
      while (pos <= end && measured.more) {
        let len = oracle.doc.lineAt(pos).length;
        if (nodes.length)
          nodes.push(null);
        let height = measured.heights[measured.index++], above = 0;
        if (height < 0) {
          above = -height;
          height = measured.heights[measured.index++];
        }
        if (singleHeight == -1)
          singleHeight = height;
        else if (Math.abs(height - singleHeight) >= Epsilon)
          singleHeight = -2;
        let line = new HeightMapText(len, height, above);
        line.outdated = false;
        nodes.push(line);
        pos += len + 1;
      }
      if (pos <= end)
        nodes.push(null, new _HeightMapGap(end - pos).updateHeight(oracle, pos));
      let result = HeightMap.of(nodes);
      if (singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon || Math.abs(singleHeight - this.heightMetrics(oracle, offset).perLine) >= Epsilon)
        heightChangeFlag = true;
      return replace(this, result);
    } else if (force || this.outdated) {
      this.setHeight(oracle.heightForGap(offset, offset + this.length));
      this.outdated = false;
    }
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
};
var HeightMapBranch = class extends HeightMap {
  constructor(left, brk, right) {
    super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
    this.left = left;
    this.right = right;
    this.size = left.size + right.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(height, oracle, top2, offset) {
    let mid = top2 + this.left.height;
    return height < mid ? this.left.blockAt(height, oracle, top2, offset) : this.right.blockAt(height, oracle, mid, offset + this.left.length + this.break);
  }
  lineAt(value, type, oracle, top2, offset) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    let left = type == QueryType.ByHeight ? value < rightTop : value < rightOffset;
    let base2 = left ? this.left.lineAt(value, type, oracle, top2, offset) : this.right.lineAt(value, type, oracle, rightTop, rightOffset);
    if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
      return base2;
    let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
    if (left)
      return base2.join(this.right.lineAt(rightOffset, subQuery, oracle, rightTop, rightOffset));
    else
      return this.left.lineAt(rightOffset, subQuery, oracle, top2, offset).join(base2);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    if (this.break) {
      if (from < rightOffset)
        this.left.forEachLine(from, to, oracle, top2, offset, f);
      if (to >= rightOffset)
        this.right.forEachLine(from, to, oracle, rightTop, rightOffset, f);
    } else {
      let mid = this.lineAt(rightOffset, QueryType.ByPos, oracle, top2, offset);
      if (from < mid.from)
        this.left.forEachLine(from, mid.from - 1, oracle, top2, offset, f);
      if (mid.to >= from && mid.from <= to)
        f(mid);
      if (to > mid.to)
        this.right.forEachLine(mid.to + 1, to, oracle, rightTop, rightOffset, f);
    }
  }
  replace(from, to, nodes) {
    let rightStart = this.left.length + this.break;
    if (to < rightStart)
      return this.balanced(this.left.replace(from, to, nodes), this.right);
    if (from > this.left.length)
      return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
    let result = [];
    if (from > 0)
      this.decomposeLeft(from, result);
    let left = result.length;
    for (let node of nodes)
      result.push(node);
    if (from > 0)
      mergeGaps(result, left - 1);
    if (to < this.length) {
      let right = result.length;
      this.decomposeRight(to, result);
      mergeGaps(result, right);
    }
    return HeightMap.of(result);
  }
  decomposeLeft(to, result) {
    let left = this.left.length;
    if (to <= left)
      return this.left.decomposeLeft(to, result);
    result.push(this.left);
    if (this.break) {
      left++;
      if (to >= left)
        result.push(null);
    }
    if (to > left)
      this.right.decomposeLeft(to - left, result);
  }
  decomposeRight(from, result) {
    let left = this.left.length, right = left + this.break;
    if (from >= right)
      return this.right.decomposeRight(from - right, result);
    if (from < left)
      this.left.decomposeRight(from, result);
    if (this.break && from < right)
      result.push(null);
    result.push(this.right);
  }
  balanced(left, right) {
    if (left.size > 2 * right.size || right.size > 2 * left.size)
      return HeightMap.of(this.break ? [left, null, right] : [left, right]);
    this.left = replace(this.left, left);
    this.right = replace(this.right, right);
    this.setHeight(left.height + right.height);
    this.outdated = left.outdated || right.outdated;
    this.size = left.size + right.size;
    this.length = left.length + this.break + right.length;
    return this;
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
    if (measured && measured.from <= offset + left.length && measured.more)
      rebalance = left = left.updateHeight(oracle, offset, force, measured);
    else
      left.updateHeight(oracle, offset, force);
    if (measured && measured.from <= rightStart + right.length && measured.more)
      rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
    else
      right.updateHeight(oracle, rightStart, force);
    if (rebalance)
      return this.balanced(left, right);
    this.height = this.left.height + this.right.height;
    this.outdated = false;
    return this;
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
};
function mergeGaps(nodes, around) {
  let before, after;
  if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
    nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
}
var relevantWidgetHeight = 5;
var NodeBuilder = class _NodeBuilder {
  constructor(pos, oracle) {
    this.pos = pos;
    this.oracle = oracle;
    this.nodes = [];
    this.lineStart = -1;
    this.lineEnd = -1;
    this.covering = null;
    this.writtenTo = pos;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(_from, to) {
    if (this.lineStart > -1) {
      let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
      if (last instanceof HeightMapText)
        last.length += end - this.pos;
      else if (end > this.pos || !this.isCovered)
        this.nodes.push(new HeightMapText(end - this.pos, -1, 0));
      this.writtenTo = end;
      if (to > end) {
        this.nodes.push(null);
        this.writtenTo++;
        this.lineStart = -1;
      }
    }
    this.pos = to;
  }
  point(from, to, deco) {
    if (from < to || deco.heightRelevant) {
      let height = deco.widget ? deco.widget.estimatedHeight : 0;
      let breaks = deco.widget ? deco.widget.lineBreaks : 0;
      if (height < 0)
        height = this.oracle.lineHeight;
      let len = to - from;
      if (deco.block) {
        this.addBlock(new HeightMapBlock(len, height, deco));
      } else if (len || breaks || height >= relevantWidgetHeight) {
        this.addLineDeco(height, breaks, len);
      }
    } else if (to > from) {
      this.span(from, to);
    }
    if (this.lineEnd > -1 && this.lineEnd < this.pos)
      this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from, to } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = from;
    this.lineEnd = to;
    if (this.writtenTo < from) {
      if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
        this.nodes.push(this.blankContent(this.writtenTo, from - 1));
      this.nodes.push(null);
    }
    if (this.pos > from)
      this.nodes.push(new HeightMapText(this.pos - from, -1, 0));
    this.writtenTo = this.pos;
  }
  blankContent(from, to) {
    let gap = new HeightMapGap(to - from);
    if (this.oracle.doc.lineAt(from).to == to)
      gap.flags |= 4;
    return gap;
  }
  ensureLine() {
    this.enterLine();
    let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (last instanceof HeightMapText)
      return last;
    let line = new HeightMapText(0, -1, 0);
    this.nodes.push(line);
    return line;
  }
  addBlock(block) {
    this.enterLine();
    let deco = block.deco;
    if (deco && deco.startSide > 0 && !this.isCovered)
      this.ensureLine();
    this.nodes.push(block);
    this.writtenTo = this.pos = this.pos + block.length;
    if (deco && deco.endSide > 0)
      this.covering = block;
  }
  addLineDeco(height, breaks, length) {
    let line = this.ensureLine();
    line.length += length;
    line.collapsed += length;
    line.widgetHeight = Math.max(line.widgetHeight, height);
    line.breaks += breaks;
    this.writtenTo = this.pos = this.pos + length;
  }
  finish(from) {
    let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
      this.nodes.push(new HeightMapText(0, -1, 0));
    else if (this.writtenTo < this.pos || last == null)
      this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let pos = from;
    for (let node of this.nodes) {
      if (node instanceof HeightMapText)
        node.updateHeight(this.oracle, pos);
      pos += node ? node.length : 1;
    }
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(oracle, decorations2, from, to) {
    let builder = new _NodeBuilder(from, oracle);
    RangeSet.spans(decorations2, from, to, builder, 0);
    return builder.finish(from);
  }
};
function heightRelevantDecoChanges(a, b, diff) {
  let comp = new DecorationComparator2();
  RangeSet.compare(a, b, diff, comp, 0);
  return comp.changes;
}
var DecorationComparator2 = class {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(from, to, a, b) {
    if (from < to || a && a.heightRelevant || b && b.heightRelevant)
      addRange(from, to, this.changes, 5);
  }
};
function visiblePixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
  let left = Math.max(0, rect.left), right = Math.min(win.innerWidth, rect.right);
  let top2 = Math.max(0, rect.top), bottom = Math.min(win.innerHeight, rect.bottom);
  for (let parent = dom.parentNode; parent && parent != doc2.body; ) {
    if (parent.nodeType == 1) {
      let elt = parent;
      let style = window.getComputedStyle(elt);
      if ((elt.scrollHeight > elt.clientHeight || elt.scrollWidth > elt.clientWidth) && style.overflow != "visible") {
        let parentRect = elt.getBoundingClientRect();
        left = Math.max(left, parentRect.left);
        right = Math.min(right, parentRect.right);
        top2 = Math.max(top2, parentRect.top);
        bottom = Math.min(parent == dom.parentNode ? win.innerHeight : bottom, parentRect.bottom);
      }
      parent = style.position == "absolute" || style.position == "fixed" ? elt.offsetParent : elt.parentNode;
    } else if (parent.nodeType == 11) {
      parent = parent.host;
    } else {
      break;
    }
  }
  return {
    left: left - rect.left,
    right: Math.max(left, right) - rect.left,
    top: top2 - (rect.top + paddingTop),
    bottom: Math.max(top2, bottom) - (rect.top + paddingTop)
  };
}
function inWindow(elt) {
  let rect = elt.getBoundingClientRect(), win = elt.ownerDocument.defaultView || window;
  return rect.left < win.innerWidth && rect.right > 0 && rect.top < win.innerHeight && rect.bottom > 0;
}
function fullPixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  return {
    left: 0,
    right: rect.right - rect.left,
    top: paddingTop,
    bottom: rect.bottom - (rect.top + paddingTop)
  };
}
var LineGap = class {
  constructor(from, to, size, displaySize) {
    this.from = from;
    this.to = to;
    this.size = size;
    this.displaySize = displaySize;
  }
  static same(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      let gA = a[i], gB = b[i];
      if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
        return false;
    }
    return true;
  }
  draw(viewState, wrapping) {
    return Decoration.replace({
      widget: new LineGapWidget(this.displaySize * (wrapping ? viewState.scaleY : viewState.scaleX), wrapping)
    }).range(this.from, this.to);
  }
};
var LineGapWidget = class extends WidgetType {
  constructor(size, vertical) {
    super();
    this.size = size;
    this.vertical = vertical;
  }
  eq(other) {
    return other.size == this.size && other.vertical == this.vertical;
  }
  toDOM() {
    let elt = document.createElement("div");
    if (this.vertical) {
      elt.style.height = this.size + "px";
    } else {
      elt.style.width = this.size + "px";
      elt.style.height = "2px";
      elt.style.display = "inline-block";
    }
    return elt;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
};
var ViewState = class {
  constructor(view, state) {
    this.view = view;
    this.state = state;
    this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
    this.inView = true;
    this.paddingTop = 0;
    this.paddingBottom = 0;
    this.contentDOMWidth = 0;
    this.contentDOMHeight = 0;
    this.editorHeight = 0;
    this.editorWidth = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scrollOffset = 0;
    this.scrolledToBottom = false;
    this.scrollAnchorPos = 0;
    this.scrollAnchorHeight = -1;
    this.scaler = IdScaler;
    this.scrollTarget = null;
    this.printing = false;
    this.mustMeasureContent = true;
    this.defaultTextDirection = Direction.LTR;
    this.visibleRanges = [];
    this.mustEnforceCursorAssoc = false;
    let guessWrapping = state.facet(contentAttributes).some((v) => typeof v != "function" && v.class == "cm-lineWrapping");
    this.heightOracle = new HeightOracle(guessWrapping);
    this.stateDeco = staticDeco(state);
    this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
    for (let i = 0; i < 2; i++) {
      this.viewport = this.getViewport(0, null);
      if (!this.updateForViewport())
        break;
    }
    this.updateViewportLines();
    this.lineGaps = this.ensureLineGaps([]);
    this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(this, false)));
    this.scrollParent = view.scrollDOM;
    this.computeVisibleRanges();
  }
  updateForViewport() {
    let viewports = [this.viewport], { main } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let pos = i ? main.head : main.anchor;
      if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
        let { from, to } = this.lineBlockAt(pos);
        viewports.push(new Viewport(from, to));
      }
    }
    this.viewports = viewports.sort((a, b) => a.from - b.from);
    return this.updateScaler();
  }
  updateScaler() {
    let scaler = this.scaler;
    this.scaler = this.heightMap.height <= 7e6 ? IdScaler : new BigScaler(this.heightOracle, this.heightMap, this.viewports);
    return scaler.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [];
    this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (block) => {
      this.viewportLines.push(scaleBlock(block, this.scaler));
    });
  }
  update(update, scrollTarget = null) {
    this.state = update.state;
    let prevDeco = this.stateDeco;
    this.stateDeco = staticDeco(this.state);
    let contentChanges = update.changedRanges;
    let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
    let prevHeight = this.heightMap.height;
    let scrollAnchor = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    clearHeightChangeFlag();
    this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
    if (this.heightMap.height != prevHeight || heightChangeFlag)
      update.flags |= 2;
    if (scrollAnchor) {
      this.scrollAnchorPos = update.changes.mapPos(scrollAnchor.from, -1);
      this.scrollAnchorHeight = scrollAnchor.top;
    } else {
      this.scrollAnchorPos = -1;
      this.scrollAnchorHeight = prevHeight;
    }
    let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
    if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) || !this.viewportIsAppropriate(viewport))
      viewport = this.getViewport(0, scrollTarget);
    let viewportChange = viewport.from != this.viewport.from || viewport.to != this.viewport.to;
    this.viewport = viewport;
    update.flags |= this.updateForViewport();
    if (viewportChange || !update.changes.empty || update.flags & 2)
      this.updateViewportLines();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
      this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
    update.flags |= this.computeVisibleRanges(update.changes);
    if (scrollTarget)
      this.scrollTarget = scrollTarget;
    if (!this.mustEnforceCursorAssoc && (update.selectionSet || update.focusChanged) && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc && !update.state.facet(nativeSelectionHidden))
      this.mustEnforceCursorAssoc = true;
  }
  measure() {
    let { view } = this, dom = view.contentDOM, style = window.getComputedStyle(dom);
    let oracle = this.heightOracle;
    let whiteSpace = style.whiteSpace;
    this.defaultTextDirection = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
    let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace) || this.mustMeasureContent === "refresh";
    let domRect = dom.getBoundingClientRect();
    let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != domRect.height;
    this.contentDOMHeight = domRect.height;
    this.mustMeasureContent = false;
    let result = 0, bias = 0;
    if (domRect.width && domRect.height) {
      let { scaleX, scaleY } = getScale(dom, domRect);
      if (scaleX > 5e-3 && Math.abs(this.scaleX - scaleX) > 5e-3 || scaleY > 5e-3 && Math.abs(this.scaleY - scaleY) > 5e-3) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        result |= 16;
        refresh = measureContent = true;
      }
    }
    let paddingTop = (parseInt(style.paddingTop) || 0) * this.scaleY;
    let paddingBottom = (parseInt(style.paddingBottom) || 0) * this.scaleY;
    if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
      this.paddingTop = paddingTop;
      this.paddingBottom = paddingBottom;
      result |= 16 | 2;
    }
    if (this.editorWidth != view.scrollDOM.clientWidth) {
      if (oracle.lineWrapping)
        measureContent = true;
      this.editorWidth = view.scrollDOM.clientWidth;
      result |= 16;
    }
    let scrollParent = scrollableParents(this.view.contentDOM, false).y;
    if (scrollParent != this.scrollParent) {
      this.scrollParent = scrollParent;
      this.scrollAnchorHeight = -1;
      this.scrollOffset = 0;
    }
    let scrollOffset = this.getScrollOffset();
    if (this.scrollOffset != scrollOffset) {
      this.scrollAnchorHeight = -1;
      this.scrollOffset = scrollOffset;
    }
    this.scrolledToBottom = isScrolledToBottom(this.scrollParent || view.win);
    let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
    let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
    this.pixelViewport = pixelViewport;
    let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (inView != this.inView) {
      this.inView = inView;
      if (inView)
        measureContent = true;
    }
    if (!this.inView && !this.scrollTarget && !inWindow(view.dom))
      return 0;
    let contentWidth = domRect.width;
    if (this.contentDOMWidth != contentWidth || this.editorHeight != view.scrollDOM.clientHeight) {
      this.contentDOMWidth = domRect.width;
      this.editorHeight = view.scrollDOM.clientHeight;
      result |= 16;
    }
    if (measureContent) {
      let lineHeights = view.docView.measureVisibleLineHeights(this.viewport);
      if (oracle.mustRefreshForHeights(lineHeights))
        refresh = true;
      if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
        let { lineHeight, charWidth, textHeight } = view.docView.measureTextSize();
        refresh = lineHeight > 0 && oracle.refresh(whiteSpace, lineHeight, charWidth, textHeight, Math.max(5, contentWidth / charWidth), lineHeights);
        if (refresh) {
          view.docView.minWidth = 0;
          result |= 16;
        }
      }
      if (dTop > 0 && dBottom > 0)
        bias = Math.max(dTop, dBottom);
      else if (dTop < 0 && dBottom < 0)
        bias = Math.min(dTop, dBottom);
      clearHeightChangeFlag();
      for (let vp of this.viewports) {
        let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
        this.heightMap = (refresh ? HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle, [new ChangedRange(0, 0, 0, view.state.doc.length)]) : this.heightMap).updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
      }
      if (heightChangeFlag)
        result |= 2;
    }
    let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    if (viewportChange) {
      if (result & 2)
        result |= this.updateScaler();
      this.viewport = this.getViewport(bias, this.scrollTarget);
      result |= this.updateForViewport();
    }
    if (result & 2 || viewportChange)
      this.updateViewportLines();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
      this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps, view));
    result |= this.computeVisibleRanges();
    if (this.mustEnforceCursorAssoc) {
      this.mustEnforceCursorAssoc = false;
      view.docView.enforceCursorAssoc();
    }
    return result;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(bias, scrollTarget) {
    let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
    let map = this.heightMap, oracle = this.heightOracle;
    let { visibleTop, visibleBottom } = this;
    let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType.ByHeight, oracle, 0, 0).to);
    if (scrollTarget) {
      let { head } = scrollTarget.range;
      if (head < viewport.from || head > viewport.to) {
        let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
        let block = map.lineAt(head, QueryType.ByPos, oracle, 0, 0), topPos;
        if (scrollTarget.y == "center")
          topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
        else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
          topPos = block.top;
        else
          topPos = block.bottom - viewHeight;
        viewport = new Viewport(map.lineAt(topPos - 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(topPos + viewHeight + 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).to);
      }
    }
    return viewport;
  }
  mapViewport(viewport, changes) {
    let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
    return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from, to }, bias = 0) {
    if (!this.inView)
      return true;
    let { top: top2 } = this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0);
    let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0);
    let { visibleTop, visibleBottom } = this;
    return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(
      -bias,
      250
      /* VP.MaxCoverMargin */
    ))) && (to == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(
      bias,
      250
      /* VP.MaxCoverMargin */
    ))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
  }
  mapLineGaps(gaps, changes) {
    if (!gaps.length || changes.empty)
      return gaps;
    let mapped = [];
    for (let gap of gaps)
      if (!changes.touchesRange(gap.from, gap.to))
        mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size, gap.displaySize));
    return mapped;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(current, mayMeasure) {
    let wrapping = this.heightOracle.lineWrapping;
    let margin = wrapping ? 1e4 : 2e3, halfMargin = margin >> 1, doubleMargin = margin << 1;
    if (this.defaultTextDirection != Direction.LTR && !wrapping)
      return [];
    let gaps = [];
    let addGap = (from, to, line, structure) => {
      if (to - from < halfMargin)
        return;
      let sel = this.state.selection.main, avoid = [sel.from];
      if (!sel.empty)
        avoid.push(sel.to);
      for (let pos of avoid) {
        if (pos > from && pos < to) {
          addGap(from, pos - 10, line, structure);
          addGap(pos + 10, to, line, structure);
          return;
        }
      }
      let gap = find(current, (gap2) => gap2.from >= line.from && gap2.to <= line.to && Math.abs(gap2.from - from) < halfMargin && Math.abs(gap2.to - to) < halfMargin && !avoid.some((pos) => gap2.from < pos && gap2.to > pos));
      if (!gap) {
        if (to < line.to && mayMeasure && wrapping && mayMeasure.visibleRanges.some((r) => r.from <= to && r.to >= to)) {
          let lineStart = mayMeasure.moveToLineBoundary(EditorSelection.cursor(to), false, true).head;
          if (lineStart > from)
            to = lineStart;
        }
        let size = this.gapSize(line, from, to, structure);
        let displaySize = wrapping || size < 2e6 ? size : 2e6;
        gap = new LineGap(from, to, size, displaySize);
      }
      gaps.push(gap);
    };
    let checkLine = (line) => {
      if (line.length < doubleMargin || line.type != BlockType.Text)
        return;
      let structure = lineStructure(line.from, line.to, this.stateDeco);
      if (structure.total < doubleMargin)
        return;
      let target = this.scrollTarget ? this.scrollTarget.range.head : null;
      let viewFrom, viewTo;
      if (wrapping) {
        let marginHeight = margin / this.heightOracle.lineLength * this.heightOracle.lineHeight;
        let top2, bot;
        if (target != null) {
          let targetFrac = findFraction(structure, target);
          let spaceFrac = ((this.visibleBottom - this.visibleTop) / 2 + marginHeight) / line.height;
          top2 = targetFrac - spaceFrac;
          bot = targetFrac + spaceFrac;
        } else {
          top2 = (this.visibleTop - line.top - marginHeight) / line.height;
          bot = (this.visibleBottom - line.top + marginHeight) / line.height;
        }
        viewFrom = findPosition(structure, top2);
        viewTo = findPosition(structure, bot);
      } else {
        let totalWidth = structure.total * this.heightOracle.charWidth;
        let marginWidth = margin * this.heightOracle.charWidth;
        let horizOffset = 0;
        if (totalWidth > 2e6)
          for (let old of current) {
            if (old.from >= line.from && old.from < line.to && old.size != old.displaySize && old.from * this.heightOracle.charWidth + horizOffset < this.pixelViewport.left)
              horizOffset = old.size - old.displaySize;
          }
        let pxLeft = this.pixelViewport.left + horizOffset, pxRight = this.pixelViewport.right + horizOffset;
        let left, right;
        if (target != null) {
          let targetFrac = findFraction(structure, target);
          let spaceFrac = ((pxRight - pxLeft) / 2 + marginWidth) / totalWidth;
          left = targetFrac - spaceFrac;
          right = targetFrac + spaceFrac;
        } else {
          left = (pxLeft - marginWidth) / totalWidth;
          right = (pxRight + marginWidth) / totalWidth;
        }
        viewFrom = findPosition(structure, left);
        viewTo = findPosition(structure, right);
      }
      if (viewFrom > line.from)
        addGap(line.from, viewFrom, line, structure);
      if (viewTo < line.to)
        addGap(viewTo, line.to, line, structure);
    };
    for (let line of this.viewportLines) {
      if (Array.isArray(line.type))
        line.type.forEach(checkLine);
      else
        checkLine(line);
    }
    return gaps;
  }
  gapSize(line, from, to, structure) {
    let fraction = findFraction(structure, to) - findFraction(structure, from);
    if (this.heightOracle.lineWrapping) {
      return line.height * fraction;
    } else {
      return structure.total * this.heightOracle.charWidth * fraction;
    }
  }
  updateLineGaps(gaps) {
    if (!LineGap.same(gaps, this.lineGaps)) {
      this.lineGaps = gaps;
      this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this, this.heightOracle.lineWrapping)));
    }
  }
  computeVisibleRanges(changes) {
    let deco = this.stateDeco;
    if (this.lineGaps.length)
      deco = deco.concat(this.lineGapDeco);
    let ranges = [];
    RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
      span(from, to) {
        ranges.push({ from, to });
      },
      point() {
      }
    }, 20);
    let changed = 0;
    if (ranges.length != this.visibleRanges.length) {
      changed = 8 | 4;
    } else {
      for (let i = 0; i < ranges.length && !(changed & 8); i++) {
        let old = this.visibleRanges[i], nw = ranges[i];
        if (old.from != nw.from || old.to != nw.to) {
          changed |= 4;
          if (!(changes && changes.mapPos(old.from, -1) == nw.from && changes.mapPos(old.to, 1) == nw.to))
            changed |= 8;
        }
      }
    }
    this.visibleRanges = ranges;
    return changed;
  }
  lineBlockAt(pos) {
    return pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find((b) => b.from <= pos && b.to >= pos) || scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(height) {
    return height >= this.viewportLines[0].top && height <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((l) => l.top <= height && l.bottom >= height) || scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    let base2 = this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
    return base2 * this.scaleY;
  }
  scrollAnchorAt(scrollOffset) {
    let block = this.lineBlockAtHeight(scrollOffset + 8);
    return block.from >= this.viewport.from || this.viewportLines[0].top - scrollOffset > 200 ? block : this.viewportLines[0];
  }
  elementAtHeight(height) {
    return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
};
var Viewport = class {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
};
function lineStructure(from, to, stateDeco) {
  let ranges = [], pos = from, total = 0;
  RangeSet.spans(stateDeco, from, to, {
    span() {
    },
    point(from2, to2) {
      if (from2 > pos) {
        ranges.push({ from: pos, to: from2 });
        total += from2 - pos;
      }
      pos = to2;
    }
  }, 20);
  if (pos < to) {
    ranges.push({ from: pos, to });
    total += to - pos;
  }
  return { total, ranges };
}
function findPosition({ total, ranges }, ratio) {
  if (ratio <= 0)
    return ranges[0].from;
  if (ratio >= 1)
    return ranges[ranges.length - 1].to;
  let dist2 = Math.floor(total * ratio);
  for (let i = 0; ; i++) {
    let { from, to } = ranges[i], size = to - from;
    if (dist2 <= size)
      return from + dist2;
    dist2 -= size;
  }
}
function findFraction(structure, pos) {
  let counted = 0;
  for (let { from, to } of structure.ranges) {
    if (pos <= to) {
      counted += pos - from;
      break;
    }
    counted += to - from;
  }
  return counted / structure.total;
}
function find(array, f) {
  for (let val of array)
    if (f(val))
      return val;
  return void 0;
}
var IdScaler = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1,
  eq(other) {
    return other == this;
  }
};
function staticDeco(state) {
  let deco = state.facet(decorations).filter((d) => typeof d != "function");
  let outer = state.facet(outerDecorations).filter((d) => typeof d != "function");
  if (outer.length)
    deco.push(RangeSet.join(outer));
  return deco;
}
var BigScaler = class _BigScaler {
  constructor(oracle, heightMap, viewports) {
    let vpHeight = 0, base2 = 0, domBase = 0;
    this.viewports = viewports.map(({ from, to }) => {
      let top2 = heightMap.lineAt(from, QueryType.ByPos, oracle, 0, 0).top;
      let bottom = heightMap.lineAt(to, QueryType.ByPos, oracle, 0, 0).bottom;
      vpHeight += bottom - top2;
      return { from, to, top: top2, bottom, domTop: 0, domBottom: 0 };
    });
    this.scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
    for (let obj of this.viewports) {
      obj.domTop = domBase + (obj.top - base2) * this.scale;
      domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
      base2 = obj.bottom;
    }
  }
  toDOM(n) {
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.top)
        return domBase + (n - base2) * this.scale;
      if (n <= vp.bottom)
        return vp.domTop + (n - vp.top);
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
  fromDOM(n) {
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.domTop)
        return base2 + (n - domBase) / this.scale;
      if (n <= vp.domBottom)
        return vp.top + (n - vp.domTop);
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
  eq(other) {
    if (!(other instanceof _BigScaler))
      return false;
    return this.scale == other.scale && this.viewports.length == other.viewports.length && this.viewports.every((vp, i) => vp.from == other.viewports[i].from && vp.to == other.viewports[i].to);
  }
};
function scaleBlock(block, scaler) {
  if (scaler.scale == 1)
    return block;
  let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
  return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block._content) ? block._content.map((b) => scaleBlock(b, scaler)) : block._content);
}
var theme = /* @__PURE__ */ Facet.define({ combine: (strs) => strs.join(" ") });
var darkTheme = /* @__PURE__ */ Facet.define({ combine: (values) => values.indexOf(true) > -1 });
var baseThemeID = /* @__PURE__ */ StyleModule.newName();
var baseLightID = /* @__PURE__ */ StyleModule.newName();
var baseDarkID = /* @__PURE__ */ StyleModule.newName();
var lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
function buildTheme(main, spec, scopes) {
  return new StyleModule(spec, {
    finish(sel) {
      return /&/.test(sel) ? sel.replace(/&\w*/, (m) => {
        if (m == "&")
          return main;
        if (!scopes || !scopes[m])
          throw new RangeError(`Unsupported selector: ${m}`);
        return scopes[m];
      }) : main + " " + sel;
    }
  });
}
var baseTheme$1 = /* @__PURE__ */ buildTheme("." + baseThemeID, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // Issue #456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    userSelect: "none",
    // #1708
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#ddd"
  },
  ".cm-selectionHandle": {
    backgroundColor: "currentColor",
    width: "1.5px"
  },
  ".cm-selectionHandle-start::before, .cm-selectionHandle-end::before": {
    content: '""',
    backgroundColor: "inherit",
    borderRadius: "50%",
    width: "8px",
    height: "8px",
    position: "absolute",
    left: "-3.25px"
  },
  ".cm-selectionHandle-start::before": { top: "-8px" },
  ".cm-selectionHandle-end::before": { bottom: "-8px" },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    zIndex: 200
  },
  ".cm-gutters-before": { insetInlineStart: 0 },
  ".cm-gutters-after": { insetInlineEnd: 0 },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    border: "0px solid #ddd",
    "&.cm-gutters-before": { borderRightWidth: "1px" },
    "&.cm-gutters-after": { borderLeftWidth: "1px" }
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-dialog": {
    padding: "2px 19px 4px 6px",
    position: "relative",
    "& label": { fontSize: "80%" }
  },
  ".cm-dialog-close": {
    position: "absolute",
    top: "3px",
    right: "4px",
    backgroundColor: "inherit",
    border: "none",
    font: "inherit",
    fontSize: "14px",
    padding: "0"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top",
    userSelect: "none"
  },
  ".cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 5%)",
    backgroundPosition: "center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, lightDarkIDs);
var observeOptions = {
  childList: true,
  characterData: true,
  subtree: true,
  attributes: true,
  characterDataOldValue: true
};
var useCharData = browser.ie && browser.ie_version <= 11;
var DOMObserver = class {
  constructor(view) {
    this.view = view;
    this.active = false;
    this.editContext = null;
    this.selectionRange = new DOMSelectionState();
    this.selectionChanged = false;
    this.delayedFlush = -1;
    this.resizeTimeout = -1;
    this.queue = [];
    this.delayedAndroidKey = null;
    this.flushingAndroidKey = -1;
    this.lastChange = 0;
    this.scrollTargets = [];
    this.intersection = null;
    this.resizeScroll = null;
    this.intersecting = false;
    this.gapIntersection = null;
    this.gaps = [];
    this.printQuery = null;
    this.parentCheck = -1;
    this.dom = view.contentDOM;
    this.observer = new MutationObserver((mutations) => {
      for (let mut of mutations)
        this.queue.push(mut);
      if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
        this.flushSoon();
      else
        this.flush();
    });
    if (window.EditContext && browser.android && view.constructor.EDIT_CONTEXT !== false && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(browser.chrome && browser.chrome_version < 126)) {
      this.editContext = new EditContextManager(view);
      if (view.state.facet(editable))
        view.contentDOM.editContext = this.editContext.editContext;
    }
    if (useCharData)
      this.onCharData = (event) => {
        this.queue.push({
          target: event.target,
          type: "characterData",
          oldValue: event.prevValue
        });
        this.flushSoon();
      };
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPrint = this.onPrint.bind(this);
    this.onScroll = this.onScroll.bind(this);
    if (window.matchMedia)
      this.printQuery = window.matchMedia("print");
    if (typeof ResizeObserver == "function") {
      this.resizeScroll = new ResizeObserver(() => {
        var _a2;
        if (((_a2 = this.view.docView) === null || _a2 === void 0 ? void 0 : _a2.lastUpdate) < Date.now() - 75)
          this.onResize();
      });
      this.resizeScroll.observe(view.scrollDOM);
    }
    this.addWindowListeners(this.win = view.win);
    this.start();
    if (typeof IntersectionObserver == "function") {
      this.intersection = new IntersectionObserver((entries) => {
        if (this.parentCheck < 0)
          this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
        if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
          this.intersecting = !this.intersecting;
          if (this.intersecting != this.view.inView)
            this.onScrollChanged(document.createEvent("Event"));
        }
      }, { threshold: [0, 1e-3] });
      this.intersection.observe(this.dom);
      this.gapIntersection = new IntersectionObserver((entries) => {
        if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
          this.onScrollChanged(document.createEvent("Event"));
      }, {});
    }
    this.listenForScroll();
    this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e);
    if (this.intersecting)
      this.view.measure();
  }
  onScroll(e) {
    if (this.intersecting)
      this.flush(false);
    if (this.editContext)
      this.view.requestMeasure(this.editContext.measureReq);
    this.onScrollChanged(e);
  }
  onResize() {
    if (this.resizeTimeout < 0)
      this.resizeTimeout = setTimeout(() => {
        this.resizeTimeout = -1;
        this.view.requestMeasure();
      }, 50);
  }
  onPrint(event) {
    if ((event.type == "change" || !event.type) && !event.matches)
      return;
    this.view.viewState.printing = true;
    this.view.measure();
    setTimeout(() => {
      this.view.viewState.printing = false;
      this.view.requestMeasure();
    }, 500);
  }
  updateGaps(gaps) {
    if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i) => g != gaps[i]))) {
      this.gapIntersection.disconnect();
      for (let gap of gaps)
        this.gapIntersection.observe(gap);
      this.gaps = gaps;
    }
  }
  onSelectionChange(event) {
    let wasChanged = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view } = this, sel = this.selectionRange;
    if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(this.dom, sel))
      return;
    let context = sel.anchorNode && view.docView.tile.nearest(sel.anchorNode);
    if (context && context.isWidget() && context.widget.ignoreEvent(event)) {
      if (!wasChanged)
        this.selectionChanged = false;
      return;
    }
    if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
      this.flushSoon();
    else
      this.flush(false);
  }
  readSelectionRange() {
    let { view } = this;
    let selection = getSelection(view.root);
    if (!selection)
      return false;
    let range = browser.safari && view.root.nodeType == 11 && view.root.activeElement == this.dom && safariSelectionRangeHack(this.view, selection) || selection;
    if (!range || this.selectionRange.eq(range))
      return false;
    let local = hasSelection(this.dom, range);
    if (local && !this.selectionChanged && view.inputState.lastFocusTime > Date.now() - 200 && view.inputState.lastTouchTime < Date.now() - 300 && atElementStart(this.dom, range)) {
      this.view.inputState.lastFocusTime = 0;
      view.docView.updateSelection();
      return false;
    }
    this.selectionRange.setRange(range);
    if (local)
      this.selectionChanged = true;
    return true;
  }
  setSelectionRange(anchor, head) {
    this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
    this.selectionChanged = false;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let i = 0, changed = null;
    for (let dom = this.dom; dom; ) {
      if (dom.nodeType == 1) {
        if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
          i++;
        else if (!changed)
          changed = this.scrollTargets.slice(0, i);
        if (changed)
          changed.push(dom);
        dom = dom.assignedSlot || dom.parentNode;
      } else if (dom.nodeType == 11) {
        dom = dom.host;
      } else {
        break;
      }
    }
    if (i < this.scrollTargets.length && !changed)
      changed = this.scrollTargets.slice(0, i);
    if (changed) {
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      for (let dom of this.scrollTargets = changed)
        dom.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(f) {
    if (!this.active)
      return f();
    try {
      this.stop();
      return f();
    } finally {
      this.start();
      this.clear();
    }
  }
  start() {
    if (this.active)
      return;
    this.observer.observe(this.dom, observeOptions);
    if (useCharData)
      this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
    this.active = true;
  }
  stop() {
    if (!this.active)
      return;
    this.active = false;
    this.observer.disconnect();
    if (useCharData)
      this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
  }
  // Throw away any pending changes
  clear() {
    this.processRecords();
    this.queue.length = 0;
    this.selectionChanged = false;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(key, keyCode) {
    var _a2;
    if (!this.delayedAndroidKey) {
      let flush = () => {
        let key2 = this.delayedAndroidKey;
        if (key2) {
          this.clearDelayedAndroidKey();
          this.view.inputState.lastKeyCode = key2.keyCode;
          this.view.inputState.lastKeyTime = Date.now();
          let flushed = this.flush();
          if (!flushed && key2.force)
            dispatchKey(this.dom, key2.key, key2.keyCode);
        }
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(flush);
    }
    if (!this.delayedAndroidKey || key == "Enter")
      this.delayedAndroidKey = {
        key,
        keyCode,
        // Only run the key handler when no changes are detected if
        // this isn't coming right after another change, in which case
        // it is probably part of a weird chain of updates, and should
        // be ignored if it returns the DOM to its previous state.
        force: this.lastChange < Date.now() - 50 || !!((_a2 = this.delayedAndroidKey) === null || _a2 === void 0 ? void 0 : _a2.force)
      };
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey);
    this.delayedAndroidKey = null;
    this.flushingAndroidKey = -1;
  }
  flushSoon() {
    if (this.delayedFlush < 0)
      this.delayedFlush = this.view.win.requestAnimationFrame(() => {
        this.delayedFlush = -1;
        this.flush();
      });
  }
  forceFlush() {
    if (this.delayedFlush >= 0) {
      this.view.win.cancelAnimationFrame(this.delayedFlush);
      this.delayedFlush = -1;
    }
    this.flush();
  }
  pendingRecords() {
    for (let mut of this.observer.takeRecords())
      this.queue.push(mut);
    return this.queue;
  }
  processRecords() {
    let records = this.pendingRecords();
    if (records.length)
      this.queue = [];
    let from = -1, to = -1, typeOver = false;
    for (let record of records) {
      let range = this.readMutation(record);
      if (!range)
        continue;
      if (range.typeOver)
        typeOver = true;
      if (from == -1) {
        ({ from, to } = range);
      } else {
        from = Math.min(range.from, from);
        to = Math.max(range.to, to);
      }
    }
    return { from, to, typeOver };
  }
  readChange() {
    let { from, to, typeOver } = this.processRecords();
    let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
    if (from < 0 && !newSel)
      return null;
    if (from > -1)
      this.lastChange = Date.now();
    this.view.inputState.lastFocusTime = 0;
    this.selectionChanged = false;
    let change = new DOMChange(this.view, from, to, typeOver);
    this.view.docView.domChanged = { newSel: change.newSel ? change.newSel.main : null };
    return change;
  }
  // Apply pending changes, if any
  flush(readSelection = true) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return false;
    if (readSelection)
      this.readSelectionRange();
    let domChange = this.readChange();
    if (!domChange) {
      this.view.requestMeasure();
      return false;
    }
    let startState = this.view.state;
    let handled = applyDOMChange(this.view, domChange);
    if (this.view.state == startState && (domChange.domChanged || domChange.newSel && !sameSelPos(this.view.state.selection, domChange.newSel.main)))
      this.view.update([]);
    return handled;
  }
  readMutation(rec) {
    let tile = this.view.docView.tile.nearest(rec.target);
    if (!tile || tile.isWidget())
      return null;
    tile.markDirty(rec.type == "attributes");
    if (rec.type == "childList") {
      let childBefore = findChild(tile, rec.previousSibling || rec.target.previousSibling, -1);
      let childAfter = findChild(tile, rec.nextSibling || rec.target.nextSibling, 1);
      return {
        from: childBefore ? tile.posAfter(childBefore) : tile.posAtStart,
        to: childAfter ? tile.posBefore(childAfter) : tile.posAtEnd,
        typeOver: false
      };
    } else if (rec.type == "characterData") {
      return { from: tile.posAtStart, to: tile.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
    } else {
      return null;
    }
  }
  setWindow(win) {
    if (win != this.win) {
      this.removeWindowListeners(this.win);
      this.win = win;
      this.addWindowListeners(this.win);
    }
  }
  addWindowListeners(win) {
    win.addEventListener("resize", this.onResize);
    if (this.printQuery) {
      if (this.printQuery.addEventListener)
        this.printQuery.addEventListener("change", this.onPrint);
      else
        this.printQuery.addListener(this.onPrint);
    } else
      win.addEventListener("beforeprint", this.onPrint);
    win.addEventListener("scroll", this.onScroll);
    win.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(win) {
    win.removeEventListener("scroll", this.onScroll);
    win.removeEventListener("resize", this.onResize);
    if (this.printQuery) {
      if (this.printQuery.removeEventListener)
        this.printQuery.removeEventListener("change", this.onPrint);
      else
        this.printQuery.removeListener(this.onPrint);
    } else
      win.removeEventListener("beforeprint", this.onPrint);
    win.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(update) {
    if (this.editContext) {
      this.editContext.update(update);
      if (update.startState.facet(editable) != update.state.facet(editable))
        update.view.contentDOM.editContext = update.state.facet(editable) ? this.editContext.editContext : null;
    }
  }
  destroy() {
    var _a2, _b, _c;
    this.stop();
    (_a2 = this.intersection) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
    (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
    (_c = this.resizeScroll) === null || _c === void 0 ? void 0 : _c.disconnect();
    for (let dom of this.scrollTargets)
      dom.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win);
    clearTimeout(this.parentCheck);
    clearTimeout(this.resizeTimeout);
    this.win.cancelAnimationFrame(this.delayedFlush);
    this.win.cancelAnimationFrame(this.flushingAndroidKey);
    if (this.editContext) {
      this.view.contentDOM.editContext = null;
      this.editContext.destroy();
    }
  }
};
function findChild(tile, dom, dir) {
  while (dom) {
    let curTile = Tile.get(dom);
    if (curTile && curTile.parent == tile)
      return curTile;
    let parent = dom.parentNode;
    dom = parent != tile.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
  }
  return null;
}
function buildSelectionRangeFromRange(view, range) {
  let anchorNode = range.startContainer, anchorOffset = range.startOffset;
  let focusNode = range.endContainer, focusOffset = range.endOffset;
  let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor, 1);
  if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
    [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
  return { anchorNode, anchorOffset, focusNode, focusOffset };
}
function safariSelectionRangeHack(view, selection) {
  if (selection.getComposedRanges) {
    let range = selection.getComposedRanges(view.root)[0];
    if (range)
      return buildSelectionRangeFromRange(view, range);
  }
  let found = null;
  function read(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    found = event.getTargetRanges()[0];
  }
  view.contentDOM.addEventListener("beforeinput", read, true);
  view.dom.ownerDocument.execCommand("indent");
  view.contentDOM.removeEventListener("beforeinput", read, true);
  return found ? buildSelectionRangeFromRange(view, found) : null;
}
var EditContextManager = class {
  constructor(view) {
    this.from = 0;
    this.to = 0;
    this.pendingContextChange = null;
    this.handlers = /* @__PURE__ */ Object.create(null);
    this.composing = null;
    this.resetRange(view.state);
    let context = this.editContext = new window.EditContext({
      text: view.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, view.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(view.state.selection.main.head)
    });
    this.handlers.textupdate = (e) => {
      let main = view.state.selection.main, { anchor, head } = main;
      let from = this.toEditorPos(e.updateRangeStart), to = this.toEditorPos(e.updateRangeEnd);
      if (view.inputState.composing >= 0 && !this.composing)
        this.composing = { contextBase: e.updateRangeStart, editorBase: from, drifted: false };
      let deletes = to - from > e.text.length;
      if (from == this.from && anchor < this.from)
        from = anchor;
      else if (to == this.to && anchor > this.to)
        to = anchor;
      let diff = findDiff(view.state.sliceDoc(from, to), e.text, (deletes ? main.from : main.to) - from, deletes ? "end" : null);
      if (!diff) {
        let newSel = EditorSelection.single(this.toEditorPos(e.selectionStart), this.toEditorPos(e.selectionEnd));
        if (!sameSelPos(newSel, main))
          view.dispatch({ selection: newSel, userEvent: "select" });
        return;
      }
      let change = {
        from: diff.from + from,
        to: diff.toA + from,
        insert: Text.of(e.text.slice(diff.from, diff.toB).split("\n"))
      };
      if ((browser.mac || browser.android) && change.from == head - 1 && /^\. ?$/.test(e.text) && view.contentDOM.getAttribute("autocorrect") == "off")
        change = { from, to, insert: Text.of([e.text.replace(".", " ")]) };
      this.pendingContextChange = change;
      if (!view.state.readOnly) {
        let newLen = this.to - this.from + (change.to - change.from + change.insert.length);
        applyDOMChangeInner(view, change, EditorSelection.single(this.toEditorPos(e.selectionStart, newLen), this.toEditorPos(e.selectionEnd, newLen)));
      }
      if (this.pendingContextChange) {
        this.revertPending(view.state);
        this.setSelection(view.state);
      }
      if (change.from < change.to && !change.insert.length && view.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(context.text.slice(Math.max(0, e.updateRangeStart - 1), Math.min(context.text.length, e.updateRangeStart + 1))))
        this.handlers.compositionend(e);
    };
    this.handlers.characterboundsupdate = (e) => {
      let rects = [], prev = null;
      for (let i = this.toEditorPos(e.rangeStart), end = this.toEditorPos(e.rangeEnd); i < end; i++) {
        let rect = view.coordsForChar(i);
        prev = rect && new DOMRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top) || prev || new DOMRect();
        rects.push(prev);
      }
      context.updateCharacterBounds(e.rangeStart, rects);
    };
    this.handlers.textformatupdate = (e) => {
      let deco = [];
      for (let format of e.getTextFormats()) {
        let lineStyle = format.underlineStyle, thickness = format.underlineThickness;
        if (!/none/i.test(lineStyle) && !/none/i.test(thickness)) {
          let from = this.toEditorPos(format.rangeStart), to = this.toEditorPos(format.rangeEnd);
          if (from < to) {
            let style = `text-decoration: underline ${/^[a-z]/.test(lineStyle) ? lineStyle + " " : lineStyle == "Dashed" ? "dashed " : lineStyle == "Squiggle" ? "wavy " : ""}${/thin/i.test(thickness) ? 1 : 2}px`;
            deco.push(Decoration.mark({ attributes: { style } }).range(from, to));
          }
        }
      }
      view.dispatch({ effects: setEditContextFormatting.of(Decoration.set(deco)) });
    };
    this.handlers.compositionstart = () => {
      if (view.inputState.composing < 0) {
        view.inputState.composing = 0;
        view.inputState.compositionFirstChange = true;
      }
    };
    this.handlers.compositionend = () => {
      view.inputState.composing = -1;
      view.inputState.compositionFirstChange = null;
      if (this.composing) {
        let { drifted } = this.composing;
        this.composing = null;
        if (drifted)
          this.reset(view.state);
      }
    };
    for (let event in this.handlers)
      context.addEventListener(event, this.handlers[event]);
    this.measureReq = { read: (view2) => {
      let sel = getSelection(view2.root);
      if (sel && sel.rangeCount)
        this.editContext.updateSelectionBounds(sel.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(update) {
    let off = 0, abort = false, pending = this.pendingContextChange;
    update.changes.iterChanges((fromA, toA, _fromB, _toB, insert2) => {
      if (abort)
        return;
      let dLen = insert2.length - (toA - fromA);
      if (pending && toA >= pending.to) {
        if (pending.from == fromA && pending.to == toA && pending.insert.eq(insert2)) {
          pending = this.pendingContextChange = null;
          off += dLen;
          this.to += dLen;
          return;
        } else {
          pending = null;
          this.revertPending(update.state);
        }
      }
      fromA += off;
      toA += off;
      if (toA <= this.from) {
        this.from += dLen;
        this.to += dLen;
      } else if (fromA < this.to) {
        if (fromA < this.from || toA > this.to || this.to - this.from + insert2.length > 3e4) {
          abort = true;
          return;
        }
        this.editContext.updateText(this.toContextPos(fromA), this.toContextPos(toA), insert2.toString());
        this.to += dLen;
      }
      off += dLen;
    });
    if (pending && !abort)
      this.revertPending(update.state);
    return !abort;
  }
  update(update) {
    let reverted = this.pendingContextChange, startSel = update.startState.selection.main;
    if (this.composing && (this.composing.drifted || !update.changes.touchesRange(startSel.from, startSel.to) && update.transactions.some((tr) => !tr.isUserEvent("input.type") && tr.changes.touchesRange(this.from, this.to)))) {
      this.composing.drifted = true;
      this.composing.editorBase = update.changes.mapPos(this.composing.editorBase);
    } else if (!this.applyEdits(update) || !this.rangeIsValid(update.state)) {
      this.pendingContextChange = null;
      this.reset(update.state);
    } else if (update.docChanged || update.selectionSet || reverted) {
      this.setSelection(update.state);
    }
    if (update.geometryChanged || update.docChanged || update.selectionSet)
      update.view.requestMeasure(this.measureReq);
  }
  resetRange(state) {
    let { head } = state.selection.main;
    this.from = Math.max(
      0,
      head - 1e4
      /* CxVp.Margin */
    );
    this.to = Math.min(
      state.doc.length,
      head + 1e4
      /* CxVp.Margin */
    );
  }
  reset(state) {
    this.resetRange(state);
    this.editContext.updateText(0, this.editContext.text.length, state.doc.sliceString(this.from, this.to));
    this.setSelection(state);
  }
  revertPending(state) {
    let pending = this.pendingContextChange;
    this.pendingContextChange = null;
    this.editContext.updateText(this.toContextPos(pending.from), this.toContextPos(pending.from + pending.insert.length), state.doc.sliceString(pending.from, pending.to));
  }
  setSelection(state) {
    let { main } = state.selection;
    let start = this.toContextPos(Math.max(this.from, Math.min(this.to, main.anchor)));
    let end = this.toContextPos(main.head);
    if (this.editContext.selectionStart != start || this.editContext.selectionEnd != end)
      this.editContext.updateSelection(start, end);
  }
  rangeIsValid(state) {
    let { head } = state.selection.main;
    return !(this.from > 0 && head - this.from < 500 || this.to < state.doc.length && this.to - head < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(contextPos, clipLen = this.to - this.from) {
    contextPos = Math.min(contextPos, clipLen);
    let c = this.composing;
    return c && c.drifted ? c.editorBase + (contextPos - c.contextBase) : contextPos + this.from;
  }
  toContextPos(editorPos) {
    let c = this.composing;
    return c && c.drifted ? c.contextBase + (editorPos - c.editorBase) : editorPos - this.from;
  }
  destroy() {
    for (let event in this.handlers)
      this.editContext.removeEventListener(event, this.handlers[event]);
  }
};
var EditorView = class _EditorView {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return !!this.inputState && this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return !!this.inputState && this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(config2 = {}) {
    var _a2;
    this.plugins = [];
    this.pluginMap = /* @__PURE__ */ new Map();
    this.editorAttrs = {};
    this.contentAttrs = {};
    this.bidiCache = [];
    this.destroyed = false;
    this.updateState = 2;
    this.measureScheduled = -1;
    this.measureRequests = [];
    this.contentDOM = document.createElement("div");
    this.scrollDOM = document.createElement("div");
    this.scrollDOM.tabIndex = -1;
    this.scrollDOM.className = "cm-scroller";
    this.scrollDOM.appendChild(this.contentDOM);
    this.announceDOM = document.createElement("div");
    this.announceDOM.className = "cm-announced";
    this.announceDOM.setAttribute("aria-live", "polite");
    this.dom = document.createElement("div");
    this.dom.appendChild(this.announceDOM);
    this.dom.appendChild(this.scrollDOM);
    if (config2.parent)
      config2.parent.appendChild(this.dom);
    let { dispatch } = config2;
    this.dispatchTransactions = config2.dispatchTransactions || dispatch && ((trs) => trs.forEach((tr) => dispatch(tr, this))) || ((trs) => this.update(trs));
    this.dispatch = this.dispatch.bind(this);
    this._root = config2.root || getRoot(config2.parent) || document;
    this.viewState = new ViewState(this, config2.state || EditorState.create(config2));
    if (config2.scrollTo && config2.scrollTo.is(scrollIntoView))
      this.viewState.scrollTarget = config2.scrollTo.value.clip(this.viewState.state);
    this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec));
    for (let plugin of this.plugins)
      plugin.update(this);
    this.observer = new DOMObserver(this);
    this.inputState = new InputState(this);
    this.inputState.ensureHandlers(this.plugins);
    this.docView = new DocView(this);
    this.mountStyles();
    this.updateAttrs();
    this.updateState = 0;
    this.requestMeasure();
    if ((_a2 = document.fonts) === null || _a2 === void 0 ? void 0 : _a2.ready)
      document.fonts.ready.then(() => {
        this.viewState.mustMeasureContent = "refresh";
        this.requestMeasure();
      });
  }
  dispatch(...input) {
    let trs = input.length == 1 && input[0] instanceof Transaction ? input : input.length == 1 && Array.isArray(input[0]) ? input[0] : [this.state.update(...input)];
    this.dispatchTransactions(trs, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(transactions) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let redrawn = false, attrsChanged = false, update;
    let state = this.state;
    for (let tr of transactions) {
      if (tr.startState != state)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      state = tr.state;
    }
    if (this.destroyed) {
      this.viewState.state = state;
      return;
    }
    let focus = this.hasFocus, focusFlag = 0, dispatchFocus = null;
    if (transactions.some((tr) => tr.annotation(isFocusChange))) {
      this.inputState.notifiedFocused = focus;
      focusFlag = 1;
    } else if (focus != this.inputState.notifiedFocused) {
      this.inputState.notifiedFocused = focus;
      dispatchFocus = focusChangeTransaction(state, focus);
      if (!dispatchFocus)
        focusFlag = 1;
    }
    let pendingKey = this.observer.delayedAndroidKey, domChange = null;
    if (pendingKey) {
      this.observer.clearDelayedAndroidKey();
      domChange = this.observer.readChange();
      if (domChange && !this.state.doc.eq(state.doc) || !this.state.selection.eq(state.selection))
        domChange = null;
    } else {
      this.observer.clear();
    }
    if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
      return this.setState(state);
    update = ViewUpdate.create(this, state, transactions);
    update.flags |= focusFlag;
    let scrollTarget = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let tr of transactions) {
        if (scrollTarget)
          scrollTarget = scrollTarget.map(tr.changes);
        if (tr.scrollIntoView) {
          let { main } = tr.state.selection;
          let { x, y } = this.state.facet(_EditorView.cursorScrollMargin);
          scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1), "nearest", "nearest", y, x);
        }
        for (let e of tr.effects)
          if (e.is(scrollIntoView))
            scrollTarget = e.value.clip(this.state);
      }
      this.viewState.update(update, scrollTarget);
      this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
      if (!update.empty) {
        this.updatePlugins(update);
        this.inputState.update(update);
      }
      redrawn = this.docView.update(update);
      if (this.state.facet(styleModule) != this.styleModules)
        this.mountStyles();
      attrsChanged = this.updateAttrs();
      this.showAnnouncements(transactions);
      this.docView.updateSelection(redrawn, transactions.some((tr) => tr.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (update.startState.facet(theme) != update.state.facet(theme))
      this.viewState.mustMeasureContent = true;
    if (redrawn || attrsChanged || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
      this.requestMeasure();
    if (redrawn)
      this.docViewUpdate();
    if (!update.empty)
      for (let listener of this.state.facet(updateListener)) {
        try {
          listener(update);
        } catch (e) {
          logException(this.state, e, "update listener");
        }
      }
    if (dispatchFocus || domChange)
      Promise.resolve().then(() => {
        if (dispatchFocus && this.state == dispatchFocus.startState)
          this.dispatch(dispatchFocus);
        if (domChange) {
          if (!applyDOMChange(this, domChange) && pendingKey.force)
            dispatchKey(this.contentDOM, pendingKey.key, pendingKey.keyCode);
        }
      });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(newState) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = newState;
      return;
    }
    this.updateState = 2;
    let hadFocus = this.hasFocus;
    try {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.viewState = new ViewState(this, newState);
      this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec));
      this.pluginMap.clear();
      for (let plugin of this.plugins)
        plugin.update(this);
      this.docView.destroy();
      this.docView = new DocView(this);
      this.inputState.ensureHandlers(this.plugins);
      this.mountStyles();
      this.updateAttrs();
      this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    if (hadFocus)
      this.focus();
    this.requestMeasure();
  }
  updatePlugins(update) {
    let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
    if (prevSpecs != specs) {
      let newPlugins = [];
      for (let spec of specs) {
        let found = prevSpecs.indexOf(spec);
        if (found < 0) {
          newPlugins.push(new PluginInstance(spec));
        } else {
          let plugin = this.plugins[found];
          plugin.mustUpdate = update;
          newPlugins.push(plugin);
        }
      }
      for (let plugin of this.plugins)
        if (plugin.mustUpdate != update)
          plugin.destroy(this);
      this.plugins = newPlugins;
      this.pluginMap.clear();
    } else {
      for (let p of this.plugins)
        p.mustUpdate = update;
    }
    for (let i = 0; i < this.plugins.length; i++)
      this.plugins[i].update(this);
    if (prevSpecs != specs)
      this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let plugin of this.plugins) {
      let val = plugin.value;
      if (val && val.docViewUpdate) {
        try {
          val.docViewUpdate(this);
        } catch (e) {
          logException(this.state, e, "doc view update listener");
        }
      }
    }
  }
  /**
  @internal
  */
  measure(flush = true) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1)
      this.win.cancelAnimationFrame(this.measureScheduled);
    if (this.observer.delayedAndroidKey) {
      this.measureScheduled = -1;
      this.requestMeasure();
      return;
    }
    this.measureScheduled = 0;
    if (flush)
      this.observer.forceFlush();
    let updated = null;
    let scroll = this.viewState.scrollParent, scrollOffset = this.viewState.getScrollOffset();
    let { scrollAnchorPos, scrollAnchorHeight } = this.viewState;
    if (Math.abs(scrollOffset - this.viewState.scrollOffset) > 1)
      scrollAnchorHeight = -1;
    this.viewState.scrollAnchorHeight = -1;
    try {
      for (let i = 0; ; i++) {
        if (scrollAnchorHeight < 0) {
          if (isScrolledToBottom(scroll || this.win)) {
            scrollAnchorPos = -1;
            scrollAnchorHeight = this.viewState.heightMap.height;
          } else {
            let block = this.viewState.scrollAnchorAt(scrollOffset);
            scrollAnchorPos = block.from;
            scrollAnchorHeight = block.top;
          }
        }
        this.updateState = 1;
        let changed = this.viewState.measure();
        if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (i > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let measuring = [];
        if (!(changed & 4))
          [this.measureRequests, measuring] = [measuring, this.measureRequests];
        let measured = measuring.map((m) => {
          try {
            return m.read(this);
          } catch (e) {
            logException(this.state, e);
            return BadMeasure;
          }
        });
        let update = ViewUpdate.create(this, this.state, []), redrawn = false;
        update.flags |= changed;
        if (!updated)
          updated = update;
        else
          updated.flags |= changed;
        this.updateState = 2;
        if (!update.empty) {
          this.updatePlugins(update);
          this.inputState.update(update);
          this.updateAttrs();
          redrawn = this.docView.update(update);
          if (redrawn)
            this.docViewUpdate();
        }
        for (let i2 = 0; i2 < measuring.length; i2++)
          if (measured[i2] != BadMeasure) {
            try {
              let m = measuring[i2];
              if (m.write)
                m.write(measured[i2], this);
            } catch (e) {
              logException(this.state, e);
            }
          }
        if (redrawn)
          this.docView.updateSelection(true);
        if (!update.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight) {
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget);
              this.viewState.scrollTarget = null;
              scrollAnchorHeight = -1;
              continue;
            } else {
              let newAnchorHeight = scrollAnchorPos < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(scrollAnchorPos).top;
              let diff = (newAnchorHeight - scrollAnchorHeight) / this.scaleY;
              if ((diff > 1 || diff < -1) && !(browser.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (scroll == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                scrollOffset = scrollOffset + diff;
                if (scroll)
                  scroll.scrollTop += diff;
                else
                  this.win.scrollBy(0, diff);
                scrollAnchorHeight = -1;
                continue;
              }
            }
          }
          break;
        }
      }
    } finally {
      this.updateState = 0;
      this.measureScheduled = -1;
    }
    if (updated && !updated.empty)
      for (let listener of this.state.facet(updateListener))
        listener(updated);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
  }
  updateAttrs() {
    let editorAttrs = attrsFromFacet(this, editorAttributes, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    });
    let contentAttrs = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: !this.state.facet(editable) ? "false" : "true",
      class: "cm-content",
      style: `${browser.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    if (this.state.readOnly)
      contentAttrs["aria-readonly"] = "true";
    attrsFromFacet(this, contentAttributes, contentAttrs);
    let changed = this.observer.ignore(() => {
      let changedContent = updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
      let changedEditor = updateAttrs(this.dom, this.editorAttrs, editorAttrs);
      return changedContent || changedEditor;
    });
    this.editorAttrs = editorAttrs;
    this.contentAttrs = contentAttrs;
    return changed;
  }
  showAnnouncements(trs) {
    let first = true;
    for (let tr of trs)
      for (let effect of tr.effects)
        if (effect.is(_EditorView.announce)) {
          if (first)
            this.announceDOM.textContent = "";
          first = false;
          let div = this.announceDOM.appendChild(document.createElement("div"));
          div.textContent = effect.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(styleModule);
    let nonce = this.state.facet(_EditorView.cspNonce);
    StyleModule.mount(this.root, this.styleModules.concat(baseTheme$1).reverse(), nonce ? { nonce } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    if (this.updateState == 0 && this.measureScheduled > -1)
      this.measure(false);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(request) {
    if (this.measureScheduled < 0)
      this.measureScheduled = this.win.requestAnimationFrame(() => this.measure());
    if (request) {
      if (this.measureRequests.indexOf(request) > -1)
        return;
      if (request.key != null)
        for (let i = 0; i < this.measureRequests.length; i++) {
          if (this.measureRequests[i].key === request.key) {
            this.measureRequests[i] = request;
            return;
          }
        }
      this.measureRequests.push(request);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(plugin) {
    let known = this.pluginMap.get(plugin);
    if (known === void 0 || known && known.plugin != plugin)
      this.pluginMap.set(plugin, known = this.plugins.find((p) => p.plugin == plugin) || null);
    return known && known.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(height) {
    this.readMeasured();
    return this.viewState.elementAtHeight(height);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(height) {
    this.readMeasured();
    return this.viewState.lineBlockAtHeight(height);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(pos) {
    return this.viewState.lineBlockAt(pos);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(start, forward, by) {
    return skipAtoms(this, start, moveByChar(this, start, forward, by));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(start, forward) {
    return skipAtoms(this, start, moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial)));
  }
  /**
  Get the cursor position visually at the start or end of a line.
  Note that this may differ from the _logical_ position at its
  start or end (which is simply at `line.from`/`line.to`) if text
  at the start or end goes against the line's base text direction.
  */
  visualLineSide(line, end) {
    let order = this.bidiSpans(line), dir = this.textDirectionAt(line.from);
    let span = order[end ? order.length - 1 : 0];
    return EditorSelection.cursor(span.side(end, dir) + line.from, span.forward(!end, dir) ? 1 : -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(start, forward, includeWrap = true) {
    return moveToLineBoundary(this, start, forward, includeWrap);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(start, forward, distance) {
    return skipAtoms(this, start, moveVertically(this, start, forward, distance));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(pos, side = 1) {
    return this.docView.domAtPos(pos, side);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(node, offset = 0) {
    return this.docView.posFromDOM(node, offset);
  }
  posAtCoords(coords, precise = true) {
    this.readMeasured();
    let found = posAtCoords(this, coords, precise);
    return found && found.pos;
  }
  posAndSideAtCoords(coords, precise = true) {
    this.readMeasured();
    return posAtCoords(this, coords, precise);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(pos, side = 1) {
    this.readMeasured();
    let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
    let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
    return this.docView.coordsAt(pos, side, span.dir == Direction.RTL);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(pos) {
    this.readMeasured();
    return this.docView.coordsForChar(pos);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(pos) {
    let perLine = this.state.facet(perLineTextDirection);
    if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
      return this.textDirection;
    this.readMeasured();
    return this.docView.textDirectionAt(pos);
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(line) {
    if (line.length > MaxBidiLine)
      return trivialOrder(line.length);
    let dir = this.textDirectionAt(line.from), isolates;
    for (let entry of this.bidiCache) {
      if (entry.from == line.from && entry.dir == dir && (entry.fresh || isolatesEq(entry.isolates, isolates = getIsolatedRanges(this, line))))
        return entry.order;
    }
    if (!isolates)
      isolates = getIsolatedRanges(this, line);
    let order = computeOrder(line.text, dir, isolates);
    this.bidiCache.push(new CachedOrder(line.from, line.to, dir, isolates, true, order));
    return order;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var _a2;
    return (this.dom.ownerDocument.hasFocus() || browser.safari && ((_a2 = this.inputState) === null || _a2 === void 0 ? void 0 : _a2.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      focusPreventScroll(this.contentDOM);
      this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(root) {
    if (this._root != root) {
      this._root = root;
      this.observer.setWindow((root.nodeType == 9 ? root : root.ownerDocument).defaultView || window);
      this.mountStyles();
    }
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    if (this.root.activeElement == this.contentDOM)
      this.contentDOM.blur();
    for (let plugin of this.plugins)
      plugin.destroy(this);
    this.plugins = [];
    this.inputState.destroy();
    this.docView.destroy();
    this.dom.remove();
    this.observer.destroy();
    if (this.measureScheduled > -1)
      this.win.cancelAnimationFrame(this.measureScheduled);
    this.destroyed = true;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(pos, options = {}) {
    var _a2, _b, _c, _d;
    return scrollIntoView.of(new ScrollTarget(typeof pos == "number" ? EditorSelection.cursor(pos) : pos, (_a2 = options.y) !== null && _a2 !== void 0 ? _a2 : "nearest", (_b = options.x) !== null && _b !== void 0 ? _b : "nearest", (_c = options.yMargin) !== null && _c !== void 0 ? _c : 5, (_d = options.xMargin) !== null && _d !== void 0 ? _d : 5));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop, scrollLeft } = this.scrollDOM;
    let ref = this.viewState.scrollAnchorAt(scrollTop);
    return scrollIntoView.of(new ScrollTarget(EditorSelection.cursor(ref.from), "start", "start", ref.top - scrollTop, scrollLeft, true));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(to) {
    if (to == null)
      this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1;
    else if (typeof to == "boolean")
      this.inputState.tabFocusMode = to ? 0 : -1;
    else if (this.inputState.tabFocusMode != 0)
      this.inputState.tabFocusMode = Date.now() + to;
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(handlers2) {
    return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(observers2) {
    return ViewPlugin.define(() => ({}), { eventObservers: observers2 });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(spec, options) {
    let prefix = StyleModule.newName();
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
    if (options && options.dark)
      result.push(darkTheme.of(true));
    return result;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(spec) {
    return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(dom) {
    var _a2;
    let content2 = dom.querySelector(".cm-content");
    let tile = content2 && Tile.get(content2) || Tile.get(dom);
    return ((_a2 = tile === null || tile === void 0 ? void 0 : tile.root) === null || _a2 === void 0 ? void 0 : _a2.view) || null;
  }
};
EditorView.styleModule = styleModule;
EditorView.inputHandler = inputHandler;
EditorView.clipboardInputFilter = clipboardInputFilter;
EditorView.clipboardOutputFilter = clipboardOutputFilter;
EditorView.scrollHandler = scrollHandler;
EditorView.focusChangeEffect = focusChangeEffect;
EditorView.perLineTextDirection = perLineTextDirection;
EditorView.exceptionSink = exceptionSink;
EditorView.updateListener = updateListener;
EditorView.editable = editable;
EditorView.mouseSelectionStyle = mouseSelectionStyle;
EditorView.dragMovesSelection = dragMovesSelection$1;
EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
EditorView.decorations = decorations;
EditorView.blockWrappers = blockWrappers;
EditorView.outerDecorations = outerDecorations;
EditorView.atomicRanges = atomicRanges;
EditorView.bidiIsolatedRanges = bidiIsolatedRanges;
EditorView.cursorScrollMargin = /* @__PURE__ */ Facet.define({
  combine: (inputs) => {
    let x = 5, y = 5;
    for (let i of inputs) {
      if (typeof i == "number")
        x = y = i;
      else
        ({ x, y } = i);
    }
    return { x, y };
  }
});
EditorView.scrollMargins = scrollMargins;
EditorView.darkTheme = darkTheme;
EditorView.cspNonce = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : "" });
EditorView.contentAttributes = contentAttributes;
EditorView.editorAttributes = editorAttributes;
EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
EditorView.announce = /* @__PURE__ */ StateEffect.define();
var MaxBidiLine = 4096;
var BadMeasure = {};
var CachedOrder = class _CachedOrder {
  constructor(from, to, dir, isolates, fresh, order) {
    this.from = from;
    this.to = to;
    this.dir = dir;
    this.isolates = isolates;
    this.fresh = fresh;
    this.order = order;
  }
  static update(cache, changes) {
    if (changes.empty && !cache.some((c) => c.fresh))
      return cache;
    let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
    for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
      let entry = cache[i];
      if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
        result.push(new _CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.isolates, false, entry.order));
    }
    return result;
  }
};
function attrsFromFacet(view, facet, base2) {
  for (let sources = view.state.facet(facet), i = sources.length - 1; i >= 0; i--) {
    let source = sources[i], value = typeof source == "function" ? source(view) : source;
    if (value)
      combineAttrs(value, base2);
  }
  return base2;
}
var currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
function normalizeKeyName(name2, platform) {
  const parts = name2.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result == "Space")
    result = " ";
  let alt, ctrl, shift2, meta2;
  for (let i = 0; i < parts.length - 1; ++i) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod))
      meta2 = true;
    else if (/^a(lt)?$/i.test(mod))
      alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod))
      ctrl = true;
    else if (/^s(hift)?$/i.test(mod))
      shift2 = true;
    else if (/^mod$/i.test(mod)) {
      if (platform == "mac")
        meta2 = true;
      else
        ctrl = true;
    } else
      throw new Error("Unrecognized modifier name: " + mod);
  }
  if (alt)
    result = "Alt-" + result;
  if (ctrl)
    result = "Ctrl-" + result;
  if (meta2)
    result = "Meta-" + result;
  if (shift2)
    result = "Shift-" + result;
  return result;
}
function modifiers(name2, event, shift2) {
  if (event.altKey)
    name2 = "Alt-" + name2;
  if (event.ctrlKey)
    name2 = "Ctrl-" + name2;
  if (event.metaKey)
    name2 = "Meta-" + name2;
  if (shift2 !== false && event.shiftKey)
    name2 = "Shift-" + name2;
  return name2;
}
var handleKeyEvents = /* @__PURE__ */ Prec.default(/* @__PURE__ */ EditorView.domEventHandlers({
  keydown(event, view) {
    return runHandlers(getKeymap(view.state), event, view, "editor");
  }
}));
var keymap = /* @__PURE__ */ Facet.define({ enables: handleKeyEvents });
var Keymaps = /* @__PURE__ */ new WeakMap();
function getKeymap(state) {
  let bindings = state.facet(keymap);
  let map = Keymaps.get(bindings);
  if (!map)
    Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
  return map;
}
var storedPrefix = null;
var PrefixTimeout = 4e3;
function buildKeymap(bindings, platform = currentPlatform) {
  let bound = /* @__PURE__ */ Object.create(null);
  let isPrefix = /* @__PURE__ */ Object.create(null);
  let checkPrefix = (name2, is) => {
    let current = isPrefix[name2];
    if (current == null)
      isPrefix[name2] = is;
    else if (current != is)
      throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
  };
  let add2 = (scope, key, command2, preventDefault, stopPropagation) => {
    var _a2, _b;
    let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
    let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
    for (let i = 1; i < parts.length; i++) {
      let prefix = parts.slice(0, i).join(" ");
      checkPrefix(prefix, true);
      if (!scopeObj[prefix])
        scopeObj[prefix] = {
          preventDefault: true,
          stopPropagation: false,
          run: [(view) => {
            let ourObj = storedPrefix = { view, prefix, scope };
            setTimeout(() => {
              if (storedPrefix == ourObj)
                storedPrefix = null;
            }, PrefixTimeout);
            return true;
          }]
        };
    }
    let full = parts.join(" ");
    checkPrefix(full, false);
    let binding = scopeObj[full] || (scopeObj[full] = {
      preventDefault: false,
      stopPropagation: false,
      run: ((_b = (_a2 = scopeObj._any) === null || _a2 === void 0 ? void 0 : _a2.run) === null || _b === void 0 ? void 0 : _b.slice()) || []
    });
    if (command2)
      binding.run.push(command2);
    if (preventDefault)
      binding.preventDefault = true;
    if (stopPropagation)
      binding.stopPropagation = true;
  };
  for (let b of bindings) {
    let scopes = b.scope ? b.scope.split(" ") : ["editor"];
    if (b.any)
      for (let scope of scopes) {
        let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
        if (!scopeObj._any)
          scopeObj._any = { preventDefault: false, stopPropagation: false, run: [] };
        let { any } = b;
        for (let key in scopeObj)
          scopeObj[key].run.push((view) => any(view, currentKeyEvent));
      }
    let name2 = b[platform] || b.key;
    if (!name2)
      continue;
    for (let scope of scopes) {
      add2(scope, name2, b.run, b.preventDefault, b.stopPropagation);
      if (b.shift)
        add2(scope, "Shift-" + name2, b.shift, b.preventDefault, b.stopPropagation);
    }
  }
  return bound;
}
var currentKeyEvent = null;
function runHandlers(map, event, view, scope) {
  currentKeyEvent = event;
  let name2 = keyName(event);
  let charCode = codePointAt2(name2, 0), isChar = codePointSize2(charCode) == name2.length && name2 != " ";
  let prefix = "", handled = false, prevented = false, stopPropagation = false;
  if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
    prefix = storedPrefix.prefix + " ";
    if (modifierCodes.indexOf(event.keyCode) < 0) {
      prevented = true;
      storedPrefix = null;
    }
  }
  let ran = /* @__PURE__ */ new Set();
  let runFor = (binding) => {
    if (binding) {
      for (let cmd2 of binding.run)
        if (!ran.has(cmd2)) {
          ran.add(cmd2);
          if (cmd2(view)) {
            if (binding.stopPropagation)
              stopPropagation = true;
            return true;
          }
        }
      if (binding.preventDefault) {
        if (binding.stopPropagation)
          stopPropagation = true;
        prevented = true;
      }
    }
    return false;
  };
  let scopeObj = map[scope], baseName, shiftName;
  if (scopeObj) {
    if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)])) {
      handled = true;
    } else if (isChar && (event.altKey || event.metaKey || event.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
    !(browser.windows && event.ctrlKey && event.altKey) && // Alt-combinations on macOS tend to be typed characters
    !(browser.mac && event.altKey && !(event.ctrlKey || event.metaKey)) && (baseName = base[event.keyCode]) && baseName != name2) {
      if (runFor(scopeObj[prefix + modifiers(baseName, event, true)])) {
        handled = true;
      } else if (event.shiftKey && (shiftName = shift[event.keyCode]) != name2 && shiftName != baseName && runFor(scopeObj[prefix + modifiers(shiftName, event, false)])) {
        handled = true;
      }
    } else if (isChar && event.shiftKey && runFor(scopeObj[prefix + modifiers(name2, event, true)])) {
      handled = true;
    }
    if (!handled && runFor(scopeObj._any))
      handled = true;
  }
  if (prevented)
    handled = true;
  if (handled && stopPropagation)
    event.stopPropagation();
  currentKeyEvent = null;
  return handled;
}
var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
function highlightActiveLine() {
  return activeLineHighlighter;
}
var lineDeco = /* @__PURE__ */ Decoration.line({ class: "cm-activeLine" });
var activeLineHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.getDeco(view);
  }
  update(update) {
    if (update.docChanged || update.selectionSet)
      this.decorations = this.getDeco(update.view);
  }
  getDeco(view) {
    let lastLineStart = -1, deco = [];
    for (let r of view.state.selection.ranges) {
      let line = view.lineBlockAt(r.head);
      if (line.from > lastLineStart) {
        deco.push(lineDeco.range(line.from));
        lastLineStart = line.from;
      }
    }
    return Decoration.set(deco);
  }
}, {
  decorations: (v) => v.decorations
});
var Placeholder = class extends WidgetType {
  constructor(content2) {
    super();
    this.content = content2;
  }
  toDOM(view) {
    let wrap = document.createElement("span");
    wrap.className = "cm-placeholder";
    wrap.style.pointerEvents = "none";
    wrap.appendChild(typeof this.content == "string" ? document.createTextNode(this.content) : typeof this.content == "function" ? this.content(view) : this.content.cloneNode(true));
    wrap.setAttribute("aria-hidden", "true");
    return wrap;
  }
  coordsAt(dom) {
    let rects = dom.firstChild ? clientRectsFor(dom.firstChild) : [];
    if (!rects.length)
      return null;
    let style = window.getComputedStyle(dom.parentNode);
    let rect = flattenRect(rects[0], style.direction != "rtl");
    let lineHeight = parseInt(style.lineHeight);
    if (rect.bottom - rect.top > lineHeight * 1.5)
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.top + lineHeight };
    return rect;
  }
  ignoreEvent() {
    return false;
  }
};
function placeholder(content2) {
  let plugin = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.placeholder = content2 ? Decoration.set([Decoration.widget({ widget: new Placeholder(content2), side: 1 }).range(0)]) : Decoration.none;
    }
    get decorations() {
      return this.view.state.doc.length ? Decoration.none : this.placeholder;
    }
  }, { decorations: (v) => v.decorations });
  return typeof content2 == "string" ? [
    plugin,
    EditorView.contentAttributes.of({ "aria-placeholder": content2 })
  ] : plugin;
}
var Outside = "-10000px";
var TooltipViewManager = class {
  constructor(view, facet, createTooltipView, removeTooltipView) {
    this.facet = facet;
    this.createTooltipView = createTooltipView;
    this.removeTooltipView = removeTooltipView;
    this.input = view.state.facet(facet);
    this.tooltips = this.input.filter((t2) => t2);
    let prev = null;
    this.tooltipViews = this.tooltips.map((t2) => prev = createTooltipView(t2, prev));
  }
  update(update, above) {
    var _a2;
    let input = update.state.facet(this.facet);
    let tooltips = input.filter((x) => x);
    if (input === this.input) {
      for (let t2 of this.tooltipViews)
        if (t2.update)
          t2.update(update);
      return false;
    }
    let tooltipViews = [], newAbove = above ? [] : null;
    for (let i = 0; i < tooltips.length; i++) {
      let tip = tooltips[i], known = -1;
      if (!tip)
        continue;
      for (let i2 = 0; i2 < this.tooltips.length; i2++) {
        let other = this.tooltips[i2];
        if (other && other.create == tip.create)
          known = i2;
      }
      if (known < 0) {
        tooltipViews[i] = this.createTooltipView(tip, i ? tooltipViews[i - 1] : null);
        if (newAbove)
          newAbove[i] = !!tip.above;
      } else {
        let tooltipView = tooltipViews[i] = this.tooltipViews[known];
        if (newAbove)
          newAbove[i] = above[known];
        if (tooltipView.update)
          tooltipView.update(update);
      }
    }
    for (let t2 of this.tooltipViews)
      if (tooltipViews.indexOf(t2) < 0) {
        this.removeTooltipView(t2);
        (_a2 = t2.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(t2);
      }
    if (above) {
      newAbove.forEach((val, i) => above[i] = val);
      above.length = newAbove.length;
    }
    this.input = input;
    this.tooltips = tooltips;
    this.tooltipViews = tooltipViews;
    return true;
  }
};
function windowSpace(view) {
  let docElt = view.dom.ownerDocument.documentElement;
  return { top: 0, left: 0, bottom: docElt.clientHeight, right: docElt.clientWidth };
}
var tooltipConfig = /* @__PURE__ */ Facet.define({
  combine: (values) => {
    var _a2, _b, _c;
    return {
      position: browser.ios ? "absolute" : ((_a2 = values.find((conf) => conf.position)) === null || _a2 === void 0 ? void 0 : _a2.position) || "fixed",
      parent: ((_b = values.find((conf) => conf.parent)) === null || _b === void 0 ? void 0 : _b.parent) || null,
      tooltipSpace: ((_c = values.find((conf) => conf.tooltipSpace)) === null || _c === void 0 ? void 0 : _c.tooltipSpace) || windowSpace
    };
  }
});
var knownHeight = /* @__PURE__ */ new WeakMap();
var tooltipPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.above = [];
    this.inView = true;
    this.madeAbsolute = false;
    this.lastTransaction = 0;
    this.measureTimeout = -1;
    let config2 = view.state.facet(tooltipConfig);
    this.position = config2.position;
    this.parent = config2.parent;
    this.classes = view.themeClasses;
    this.createContainer();
    this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
    this.resizeObserver = typeof ResizeObserver == "function" ? new ResizeObserver(() => this.measureSoon()) : null;
    this.manager = new TooltipViewManager(view, showTooltip, (t2, p) => this.createTooltip(t2, p), (t2) => {
      if (this.resizeObserver)
        this.resizeObserver.unobserve(t2.dom);
      t2.dom.remove();
    });
    this.above = this.manager.tooltips.map((t2) => !!t2.above);
    this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((entries) => {
      if (Date.now() > this.lastTransaction - 50 && entries.length > 0 && entries[entries.length - 1].intersectionRatio < 1)
        this.measureSoon();
    }, { threshold: [1] }) : null;
    this.observeIntersection();
    view.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this));
    this.maybeMeasure();
  }
  createContainer() {
    if (this.parent) {
      this.container = document.createElement("div");
      this.container.style.position = "relative";
      this.container.className = this.view.themeClasses;
      this.parent.appendChild(this.container);
    } else {
      this.container = this.view.dom;
    }
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let tooltip of this.manager.tooltipViews)
        this.intersectionObserver.observe(tooltip.dom);
    }
  }
  measureSoon() {
    if (this.measureTimeout < 0)
      this.measureTimeout = setTimeout(() => {
        this.measureTimeout = -1;
        this.maybeMeasure();
      }, 50);
  }
  update(update) {
    if (update.transactions.length)
      this.lastTransaction = Date.now();
    let updated = this.manager.update(update, this.above);
    if (updated)
      this.observeIntersection();
    let shouldMeasure = updated || update.geometryChanged;
    let newConfig = update.state.facet(tooltipConfig);
    if (newConfig.position != this.position && !this.madeAbsolute) {
      this.position = newConfig.position;
      for (let t2 of this.manager.tooltipViews)
        t2.dom.style.position = this.position;
      shouldMeasure = true;
    }
    if (newConfig.parent != this.parent) {
      if (this.parent)
        this.container.remove();
      this.parent = newConfig.parent;
      this.createContainer();
      for (let t2 of this.manager.tooltipViews)
        this.container.appendChild(t2.dom);
      shouldMeasure = true;
    } else if (this.parent && this.view.themeClasses != this.classes) {
      this.classes = this.container.className = this.view.themeClasses;
    }
    if (shouldMeasure)
      this.maybeMeasure();
  }
  createTooltip(tooltip, prev) {
    let tooltipView = tooltip.create(this.view);
    let before = prev ? prev.dom : null;
    tooltipView.dom.classList.add("cm-tooltip");
    if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let arrow = document.createElement("div");
      arrow.className = "cm-tooltip-arrow";
      tooltipView.dom.appendChild(arrow);
    }
    tooltipView.dom.style.position = this.position;
    tooltipView.dom.style.top = Outside;
    tooltipView.dom.style.left = "0px";
    this.container.insertBefore(tooltipView.dom, before);
    if (tooltipView.mount)
      tooltipView.mount(this.view);
    if (this.resizeObserver)
      this.resizeObserver.observe(tooltipView.dom);
    return tooltipView;
  }
  destroy() {
    var _a2, _b, _c;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let tooltipView of this.manager.tooltipViews) {
      tooltipView.dom.remove();
      (_a2 = tooltipView.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(tooltipView);
    }
    if (this.parent)
      this.container.remove();
    (_b = this.resizeObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
    (_c = this.intersectionObserver) === null || _c === void 0 ? void 0 : _c.disconnect();
    clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let scaleX = 1, scaleY = 1, makeAbsolute = false;
    if (this.position == "fixed" && this.manager.tooltipViews.length) {
      let { dom } = this.manager.tooltipViews[0];
      if (browser.safari) {
        let rect = dom.getBoundingClientRect();
        makeAbsolute = Math.abs(rect.top + 1e4) > 1 || Math.abs(rect.left) > 1;
      } else {
        makeAbsolute = !!dom.offsetParent && dom.offsetParent != this.container.ownerDocument.body;
      }
    }
    if (makeAbsolute || this.position == "absolute") {
      if (this.parent) {
        let rect = this.parent.getBoundingClientRect();
        if (rect.width && rect.height) {
          scaleX = rect.width / this.parent.offsetWidth;
          scaleY = rect.height / this.parent.offsetHeight;
        }
      } else {
        ({ scaleX, scaleY } = this.view.viewState);
      }
    }
    let visible = this.view.scrollDOM.getBoundingClientRect(), margins = getScrollMargins(this.view);
    return {
      visible: {
        left: visible.left + margins.left,
        top: visible.top + margins.top,
        right: visible.right - margins.right,
        bottom: visible.bottom - margins.bottom
      },
      parent: this.parent ? this.container.getBoundingClientRect() : this.view.dom.getBoundingClientRect(),
      pos: this.manager.tooltips.map((t2, i) => {
        let tv = this.manager.tooltipViews[i];
        return tv.getCoords ? tv.getCoords(t2.pos) : this.view.coordsAtPos(t2.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
      space: this.view.state.facet(tooltipConfig).tooltipSpace(this.view),
      scaleX,
      scaleY,
      makeAbsolute
    };
  }
  writeMeasure(measured) {
    var _a2;
    if (measured.makeAbsolute) {
      this.madeAbsolute = true;
      this.position = "absolute";
      for (let t2 of this.manager.tooltipViews)
        t2.dom.style.position = "absolute";
    }
    let { visible, space, scaleX, scaleY } = measured;
    let others = [];
    for (let i = 0; i < this.manager.tooltips.length; i++) {
      let tooltip = this.manager.tooltips[i], tView = this.manager.tooltipViews[i], { dom } = tView;
      let pos = measured.pos[i], size = measured.size[i];
      if (!pos || tooltip.clip !== false && (pos.bottom <= Math.max(visible.top, space.top) || pos.top >= Math.min(visible.bottom, space.bottom) || pos.right < Math.max(visible.left, space.left) - 0.1 || pos.left > Math.min(visible.right, space.right) + 0.1)) {
        dom.style.top = Outside;
        continue;
      }
      let arrow = tooltip.arrow ? tView.dom.querySelector(".cm-tooltip-arrow") : null;
      let arrowHeight = arrow ? 7 : 0;
      let width = size.right - size.left, height = (_a2 = knownHeight.get(tView)) !== null && _a2 !== void 0 ? _a2 : size.bottom - size.top;
      let offset = tView.offset || noOffset, ltr = this.view.textDirection == Direction.LTR;
      let left = size.width > space.right - space.left ? ltr ? space.left : space.right - size.width : ltr ? Math.max(space.left, Math.min(pos.left - (arrow ? 14 : 0) + offset.x, space.right - width)) : Math.min(Math.max(space.left, pos.left - width + (arrow ? 14 : 0) - offset.x), space.right - width);
      let above = this.above[i];
      if (!tooltip.strictSide && (above ? pos.top - height - arrowHeight - offset.y < space.top : pos.bottom + height + arrowHeight + offset.y > space.bottom) && above == space.bottom - pos.bottom > pos.top - space.top)
        above = this.above[i] = !above;
      let spaceVert = (above ? pos.top - space.top : space.bottom - pos.bottom) - arrowHeight;
      if (spaceVert < height && tView.resize !== false) {
        if (spaceVert < this.view.defaultLineHeight) {
          dom.style.top = Outside;
          continue;
        }
        knownHeight.set(tView, height);
        dom.style.height = (height = spaceVert) / scaleY + "px";
      } else if (dom.style.height) {
        dom.style.height = "";
      }
      let top2 = above ? pos.top - height - arrowHeight - offset.y : pos.bottom + arrowHeight + offset.y;
      let right = left + width;
      if (tView.overlap !== true) {
        for (let r of others)
          if (r.left < right && r.right > left && r.top < top2 + height && r.bottom > top2)
            top2 = above ? r.top - height - 2 - arrowHeight : r.bottom + arrowHeight + 2;
      }
      if (this.position == "absolute") {
        dom.style.top = (top2 - measured.parent.top) / scaleY + "px";
        setLeftStyle(dom, (left - measured.parent.left) / scaleX);
      } else {
        dom.style.top = top2 / scaleY + "px";
        setLeftStyle(dom, left / scaleX);
      }
      if (arrow) {
        let arrowLeft = pos.left + (ltr ? offset.x : -offset.x) - (left + 14 - 7);
        arrow.style.left = arrowLeft / scaleX + "px";
      }
      if (tView.overlap !== true)
        others.push({ left, top: top2, right, bottom: top2 + height });
      dom.classList.toggle("cm-tooltip-above", above);
      dom.classList.toggle("cm-tooltip-below", !above);
      if (tView.positioned)
        tView.positioned(measured.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length) {
      if (this.view.inView)
        this.view.requestMeasure(this.measureReq);
      if (this.inView != this.view.inView) {
        this.inView = this.view.inView;
        if (!this.inView)
          for (let tv of this.manager.tooltipViews)
            tv.dom.style.top = Outside;
      }
    }
  }
}, {
  eventObservers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
function setLeftStyle(elt, value) {
  let current = parseInt(elt.style.left, 10);
  if (isNaN(current) || Math.abs(value - current) > 1)
    elt.style.left = value + "px";
}
var baseTheme = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip": {
    zIndex: 500,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: `${7}px`,
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: `${7}px solid transparent`,
      borderRight: `${7}px solid transparent`
    },
    ".cm-tooltip-above &": {
      bottom: `-${7}px`,
      "&:before": {
        borderTop: `${7}px solid #bbb`
      },
      "&:after": {
        borderTop: `${7}px solid #f5f5f5`,
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: `-${7}px`,
      "&:before": {
        borderBottom: `${7}px solid #bbb`
      },
      "&:after": {
        borderBottom: `${7}px solid #f5f5f5`,
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
});
var noOffset = { x: 0, y: 0 };
var showTooltip = /* @__PURE__ */ Facet.define({
  enables: [tooltipPlugin, baseTheme]
});
var showHoverTooltip = /* @__PURE__ */ Facet.define({
  combine: (inputs) => inputs.reduce((a, i) => a.concat(i), [])
});
var HoverTooltipHost = class _HoverTooltipHost {
  // Needs to be static so that host tooltip instances always match
  static create(view) {
    return new _HoverTooltipHost(view);
  }
  constructor(view) {
    this.view = view;
    this.mounted = false;
    this.dom = document.createElement("div");
    this.dom.classList.add("cm-tooltip-hover");
    this.manager = new TooltipViewManager(view, showHoverTooltip, (t2, p) => this.createHostedView(t2, p), (t2) => t2.dom.remove());
  }
  createHostedView(tooltip, prev) {
    let hostedView = tooltip.create(this.view);
    hostedView.dom.classList.add("cm-tooltip-section");
    this.dom.insertBefore(hostedView.dom, prev ? prev.dom.nextSibling : this.dom.firstChild);
    if (this.mounted && hostedView.mount)
      hostedView.mount(this.view);
    return hostedView;
  }
  mount(view) {
    for (let hostedView of this.manager.tooltipViews) {
      if (hostedView.mount)
        hostedView.mount(view);
    }
    this.mounted = true;
  }
  positioned(space) {
    for (let hostedView of this.manager.tooltipViews) {
      if (hostedView.positioned)
        hostedView.positioned(space);
    }
  }
  update(update) {
    this.manager.update(update);
  }
  destroy() {
    var _a2;
    for (let t2 of this.manager.tooltipViews)
      (_a2 = t2.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(t2);
  }
  passProp(name2) {
    let value = void 0;
    for (let view of this.manager.tooltipViews) {
      let given = view[name2];
      if (given !== void 0) {
        if (value === void 0)
          value = given;
        else if (value !== given)
          return void 0;
      }
    }
    return value;
  }
  get offset() {
    return this.passProp("offset");
  }
  get getCoords() {
    return this.passProp("getCoords");
  }
  get overlap() {
    return this.passProp("overlap");
  }
  get resize() {
    return this.passProp("resize");
  }
};
var showHoverTooltipHost = /* @__PURE__ */ showTooltip.compute([showHoverTooltip], (state) => {
  let tooltips = state.facet(showHoverTooltip);
  if (tooltips.length === 0)
    return null;
  return {
    pos: Math.min(...tooltips.map((t2) => t2.pos)),
    end: Math.max(...tooltips.map((t2) => {
      var _a2;
      return (_a2 = t2.end) !== null && _a2 !== void 0 ? _a2 : t2.pos;
    })),
    create: HoverTooltipHost.create,
    above: tooltips[0].above,
    arrow: tooltips.some((t2) => t2.arrow)
  };
});
var hoverPlugin = /* @__PURE__ */ Facet.define();
var HoverPlugin = class {
  constructor(view, source, field, locked, setHover, hoverTime) {
    this.view = view;
    this.source = source;
    this.field = field;
    this.locked = locked;
    this.setHover = setHover;
    this.hoverTime = hoverTime;
    this.hoverTimeout = -1;
    this.restartTimeout = -1;
    this.pending = null;
    this.lastMove = { x: 0, y: 0, target: view.dom, time: 0 };
    this.checkHover = this.checkHover.bind(this);
    view.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
    view.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
  }
  update(update) {
    if (this.pending) {
      this.pending = null;
      clearTimeout(this.restartTimeout);
      this.restartTimeout = setTimeout(() => this.startHover(), 20);
    }
  }
  get active() {
    return this.view.state.field(this.field);
  }
  checkHover() {
    this.hoverTimeout = -1;
    if (this.active.length)
      return;
    let hovered = Date.now() - this.lastMove.time;
    if (hovered < this.hoverTime)
      this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - hovered);
    else
      this.startHover();
  }
  startHover() {
    clearTimeout(this.restartTimeout);
    let { view, lastMove } = this;
    let tile = view.docView.tile.nearest(lastMove.target);
    if (!tile)
      return;
    let pos, side = 1;
    if (tile.isWidget()) {
      pos = tile.posAtStart;
    } else {
      pos = view.posAtCoords(lastMove);
      if (pos == null)
        return;
      let posCoords = view.coordsAtPos(pos);
      if (!posCoords || lastMove.y < posCoords.top || lastMove.y > posCoords.bottom || lastMove.x < posCoords.left - view.defaultCharacterWidth || lastMove.x > posCoords.right + view.defaultCharacterWidth)
        return;
      let bidi = view.bidiSpans(view.state.doc.lineAt(pos)).find((s) => s.from <= pos && s.to >= pos);
      let rtl = bidi && bidi.dir == Direction.RTL ? -1 : 1;
      side = lastMove.x < posCoords.left ? -rtl : rtl;
    }
    this.activateHover(view, pos, side);
  }
  activateHover(view, pos, side, locked) {
    let open = this.source(view, pos, side);
    let done = (value) => {
      if (value && !(Array.isArray(value) && !value.length)) {
        let tooltips = Array.isArray(value) ? value : [value];
        if (locked)
          this.locked.set(tooltips, locked);
        view.dispatch({ effects: this.setHover.of(tooltips) });
      }
    };
    if (open && "then" in open) {
      let pending = this.pending = { pos };
      open.then((result) => {
        if (this.pending == pending) {
          this.pending = null;
          done(result);
        }
      }, (e) => logException(view.state, e, "hover tooltip"));
    } else {
      done(open);
    }
  }
  get tooltip() {
    let plugin = this.view.plugin(tooltipPlugin);
    let index = plugin ? plugin.manager.tooltips.findIndex((t2) => t2.create == HoverTooltipHost.create) : -1;
    return index > -1 ? plugin.manager.tooltipViews[index] : null;
  }
  mousemove(event) {
    var _a2, _b;
    this.lastMove = { x: event.clientX, y: event.clientY, target: event.target, time: Date.now() };
    if (this.hoverTimeout < 0)
      this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime);
    let { active, tooltip } = this;
    if (active.length && !this.locked.has(active) && tooltip && !isInTooltip(tooltip.dom, event) || this.pending) {
      let { pos } = active[0] || this.pending, end = (_b = (_a2 = active[0]) === null || _a2 === void 0 ? void 0 : _a2.end) !== null && _b !== void 0 ? _b : pos;
      if (pos == end ? this.view.posAtCoords(this.lastMove) != pos : !isOverRange(this.view, pos, end, event.clientX, event.clientY)) {
        this.view.dispatch({ effects: this.setHover.of([]) });
        this.pending = null;
      }
    }
  }
  mouseleave(event) {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = -1;
    let { active } = this;
    if (active.length && !this.locked.has(active)) {
      let { tooltip } = this;
      let inTooltip = tooltip && tooltip.dom.contains(event.relatedTarget);
      if (!inTooltip)
        this.view.dispatch({ effects: this.setHover.of([]) });
      else
        this.watchTooltipLeave(tooltip.dom);
    }
  }
  watchTooltipLeave(tooltip) {
    let watch = (event) => {
      tooltip.removeEventListener("mouseleave", watch);
      let { active } = this;
      if (active.length && !this.locked.has(active) && !this.view.dom.contains(event.relatedTarget))
        this.view.dispatch({ effects: this.setHover.of([]) });
    };
    tooltip.addEventListener("mouseleave", watch);
  }
  destroy() {
    clearTimeout(this.hoverTimeout);
    clearTimeout(this.restartTimeout);
    this.view.dom.removeEventListener("mouseleave", this.mouseleave);
    this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
};
var tooltipMargin = 4;
function isInTooltip(tooltip, event) {
  let { left, right, top: top2, bottom } = tooltip.getBoundingClientRect(), arrow;
  if (arrow = tooltip.querySelector(".cm-tooltip-arrow")) {
    let arrowRect = arrow.getBoundingClientRect();
    top2 = Math.min(arrowRect.top, top2);
    bottom = Math.max(arrowRect.bottom, bottom);
  }
  return event.clientX >= left - tooltipMargin && event.clientX <= right + tooltipMargin && event.clientY >= top2 - tooltipMargin && event.clientY <= bottom + tooltipMargin;
}
function isOverRange(view, from, to, x, y, margin) {
  let rect = view.scrollDOM.getBoundingClientRect();
  let docBottom = view.documentTop + view.documentPadding.top + view.contentHeight;
  if (rect.left > x || rect.right < x || rect.top > y || Math.min(rect.bottom, docBottom) < y)
    return false;
  let pos = view.posAtCoords({ x, y }, false);
  return pos >= from && pos <= to;
}
function hoverTooltip(source, options = {}) {
  let setHover = StateEffect.define();
  let locked = /* @__PURE__ */ new WeakMap();
  let hoverState = StateField.define({
    create() {
      return [];
    },
    update(value, tr) {
      let lock = locked.get(value);
      if (value.length) {
        if (options.hideOnChange && (tr.docChanged || tr.selection))
          value = [];
        else if (lock && lock(tr))
          value = [];
        else if (options.hideOn)
          value = value.filter((v) => !options.hideOn(tr, v));
      }
      if (tr.docChanged && value.length) {
        let mapped = [];
        for (let tooltip of value) {
          let newPos = tr.changes.mapPos(tooltip.pos, -1, MapMode.TrackDel);
          if (newPos != null) {
            let copy = Object.assign(/* @__PURE__ */ Object.create(null), tooltip);
            copy.pos = newPos;
            if (copy.end != null)
              copy.end = tr.changes.mapPos(copy.end);
            mapped.push(copy);
          }
        }
        value = mapped;
      }
      for (let effect of tr.effects) {
        if (effect.is(setHover)) {
          value = effect.value;
          lock = void 0;
        }
        if (effect.is(closeHoverTooltipEffect) && !effect.value || effect.value == hoverState)
          value = [];
      }
      if (value.length && lock)
        locked.set(value, lock);
      return value;
    },
    provide: (f) => showHoverTooltip.from(f)
  });
  const plugin = ViewPlugin.define((view) => new HoverPlugin(
    view,
    source,
    hoverState,
    locked,
    setHover,
    options.hoverTime || 300
    /* Hover.Time */
  ));
  return {
    active: hoverState,
    extension: [
      hoverState,
      plugin,
      hoverPlugin.of(plugin),
      showHoverTooltipHost
    ]
  };
}
function getTooltip(view, tooltip) {
  let plugin = view.plugin(tooltipPlugin);
  if (!plugin)
    return null;
  let found = plugin.manager.tooltips.indexOf(tooltip);
  return found < 0 ? null : plugin.manager.tooltipViews[found];
}
var closeHoverTooltipEffect = /* @__PURE__ */ StateEffect.define();
var panelConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    let topContainer, bottomContainer;
    for (let c of configs) {
      topContainer = topContainer || c.topContainer;
      bottomContainer = bottomContainer || c.bottomContainer;
    }
    return { topContainer, bottomContainer };
  }
});
var panelPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.input = view.state.facet(showPanel);
    this.specs = this.input.filter((s) => s);
    this.panels = this.specs.map((spec) => spec(view));
    let conf = view.state.facet(panelConfig);
    this.top = new PanelGroup(view, true, conf.topContainer);
    this.bottom = new PanelGroup(view, false, conf.bottomContainer);
    this.top.sync(this.panels.filter((p) => p.top));
    this.bottom.sync(this.panels.filter((p) => !p.top));
    for (let p of this.panels) {
      p.dom.classList.add("cm-panel");
      if (p.mount)
        p.mount();
    }
  }
  update(update) {
    let conf = update.state.facet(panelConfig);
    if (this.top.container != conf.topContainer) {
      this.top.sync([]);
      this.top = new PanelGroup(update.view, true, conf.topContainer);
    }
    if (this.bottom.container != conf.bottomContainer) {
      this.bottom.sync([]);
      this.bottom = new PanelGroup(update.view, false, conf.bottomContainer);
    }
    this.top.syncClasses();
    this.bottom.syncClasses();
    let input = update.state.facet(showPanel);
    if (input != this.input) {
      let specs = input.filter((x) => x);
      let panels = [], top2 = [], bottom = [], mount = [];
      for (let spec of specs) {
        let known = this.specs.indexOf(spec), panel;
        if (known < 0) {
          panel = spec(update.view);
          mount.push(panel);
        } else {
          panel = this.panels[known];
          if (panel.update)
            panel.update(update);
        }
        panels.push(panel);
        (panel.top ? top2 : bottom).push(panel);
      }
      this.specs = specs;
      this.panels = panels;
      this.top.sync(top2);
      this.bottom.sync(bottom);
      for (let p of mount) {
        p.dom.classList.add("cm-panel");
        if (p.mount)
          p.mount();
      }
    } else {
      for (let p of this.panels)
        if (p.update)
          p.update(update);
    }
  }
  destroy() {
    this.top.sync([]);
    this.bottom.sync([]);
  }
}, {
  provide: (plugin) => EditorView.scrollMargins.of((view) => {
    let value = view.plugin(plugin);
    return value && { top: value.top.scrollMargin(), bottom: value.bottom.scrollMargin() };
  })
});
var PanelGroup = class {
  constructor(view, top2, container) {
    this.view = view;
    this.top = top2;
    this.container = container;
    this.dom = void 0;
    this.classes = "";
    this.panels = [];
    this.syncClasses();
  }
  sync(panels) {
    for (let p of this.panels)
      if (p.destroy && panels.indexOf(p) < 0)
        p.destroy();
    this.panels = panels;
    this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      if (this.dom) {
        this.dom.remove();
        this.dom = void 0;
      }
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div");
      this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom";
      this.dom.style[this.top ? "top" : "bottom"] = "0";
      let parent = this.container || this.view.dom;
      parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
    }
    let curDOM = this.dom.firstChild;
    for (let panel of this.panels) {
      if (panel.dom.parentNode == this.dom) {
        while (curDOM != panel.dom)
          curDOM = rm(curDOM);
        curDOM = curDOM.nextSibling;
      } else {
        this.dom.insertBefore(panel.dom, curDOM);
      }
    }
    while (curDOM)
      curDOM = rm(curDOM);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!this.container || this.classes == this.view.themeClasses)
      return;
    for (let cls of this.classes.split(" "))
      if (cls)
        this.container.classList.remove(cls);
    for (let cls of (this.classes = this.view.themeClasses).split(" "))
      if (cls)
        this.container.classList.add(cls);
  }
};
function rm(node) {
  let next = node.nextSibling;
  node.remove();
  return next;
}
var showPanel = /* @__PURE__ */ Facet.define({
  enables: panelPlugin
});
var GutterMarker = class extends RangeValue {
  /**
  @internal
  */
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(other) {
    return false;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(dom) {
  }
};
GutterMarker.prototype.elementClass = "";
GutterMarker.prototype.toDOM = void 0;
GutterMarker.prototype.mapMode = MapMode.TrackBefore;
GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
GutterMarker.prototype.point = true;
var gutterLineClass = /* @__PURE__ */ Facet.define();
var gutterWidgetClass = /* @__PURE__ */ Facet.define();
var activeGutters = /* @__PURE__ */ Facet.define();
var unfixGutters = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((x) => x)
});
function gutters(config2) {
  let result = [
    gutterView
  ];
  if (config2 && config2.fixed === false)
    result.push(unfixGutters.of(true));
  return result;
}
var gutterView = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.domAfter = null;
    this.prevViewport = view.viewport;
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutters cm-gutters-before";
    this.dom.setAttribute("aria-hidden", "true");
    this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px";
    this.gutters = view.state.facet(activeGutters).map((conf) => new SingleGutterView(view, conf));
    this.fixed = !view.state.facet(unfixGutters);
    for (let gutter2 of this.gutters) {
      if (gutter2.config.side == "after")
        this.getDOMAfter().appendChild(gutter2.dom);
      else
        this.dom.appendChild(gutter2.dom);
    }
    if (this.fixed) {
      this.dom.style.position = "sticky";
    }
    this.syncGutters(false);
    view.scrollDOM.insertBefore(this.dom, view.contentDOM);
  }
  getDOMAfter() {
    if (!this.domAfter) {
      this.domAfter = document.createElement("div");
      this.domAfter.className = "cm-gutters cm-gutters-after";
      this.domAfter.setAttribute("aria-hidden", "true");
      this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px";
      this.domAfter.style.position = this.fixed ? "sticky" : "";
      this.view.scrollDOM.appendChild(this.domAfter);
    }
    return this.domAfter;
  }
  update(update) {
    if (this.updateGutters(update)) {
      let vpA = this.prevViewport, vpB = update.view.viewport;
      let vpOverlap = Math.min(vpA.to, vpB.to) - Math.max(vpA.from, vpB.from);
      this.syncGutters(vpOverlap < (vpB.to - vpB.from) * 0.8);
    }
    if (update.geometryChanged) {
      let min = this.view.contentHeight / this.view.scaleY + "px";
      this.dom.style.minHeight = min;
      if (this.domAfter)
        this.domAfter.style.minHeight = min;
    }
    if (this.view.state.facet(unfixGutters) != !this.fixed) {
      this.fixed = !this.fixed;
      this.dom.style.position = this.fixed ? "sticky" : "";
      if (this.domAfter)
        this.domAfter.style.position = this.fixed ? "sticky" : "";
    }
    this.prevViewport = update.view.viewport;
  }
  syncGutters(detach) {
    let after = this.dom.nextSibling;
    if (detach) {
      this.dom.remove();
      if (this.domAfter)
        this.domAfter.remove();
    }
    let lineClasses = RangeSet.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from);
    let classSet = [];
    let contexts = this.gutters.map((gutter2) => new UpdateContext(gutter2, this.view.viewport, -this.view.documentPadding.top));
    for (let line of this.view.viewportLineBlocks) {
      if (classSet.length)
        classSet = [];
      if (Array.isArray(line.type)) {
        let first = true;
        for (let b of line.type) {
          if (b.type == BlockType.Text && first) {
            advanceCursor(lineClasses, classSet, b.from);
            for (let cx of contexts)
              cx.line(this.view, b, classSet);
            first = false;
          } else if (b.widget) {
            for (let cx of contexts)
              cx.widget(this.view, b);
          }
        }
      } else if (line.type == BlockType.Text) {
        advanceCursor(lineClasses, classSet, line.from);
        for (let cx of contexts)
          cx.line(this.view, line, classSet);
      } else if (line.widget) {
        for (let cx of contexts)
          cx.widget(this.view, line);
      }
    }
    for (let cx of contexts)
      cx.finish();
    if (detach) {
      this.view.scrollDOM.insertBefore(this.dom, after);
      if (this.domAfter)
        this.view.scrollDOM.appendChild(this.domAfter);
    }
  }
  updateGutters(update) {
    let prev = update.startState.facet(activeGutters), cur2 = update.state.facet(activeGutters);
    let change = update.docChanged || update.heightChanged || update.viewportChanged || !RangeSet.eq(update.startState.facet(gutterLineClass), update.state.facet(gutterLineClass), update.view.viewport.from, update.view.viewport.to);
    if (prev == cur2) {
      for (let gutter2 of this.gutters)
        if (gutter2.update(update))
          change = true;
    } else {
      change = true;
      let gutters2 = [];
      for (let conf of cur2) {
        let known = prev.indexOf(conf);
        if (known < 0) {
          gutters2.push(new SingleGutterView(this.view, conf));
        } else {
          this.gutters[known].update(update);
          gutters2.push(this.gutters[known]);
        }
      }
      for (let g of this.gutters) {
        g.dom.remove();
        if (gutters2.indexOf(g) < 0)
          g.destroy();
      }
      for (let g of gutters2) {
        if (g.config.side == "after")
          this.getDOMAfter().appendChild(g.dom);
        else
          this.dom.appendChild(g.dom);
      }
      this.gutters = gutters2;
    }
    return change;
  }
  destroy() {
    for (let view of this.gutters)
      view.destroy();
    this.dom.remove();
    if (this.domAfter)
      this.domAfter.remove();
  }
}, {
  provide: (plugin) => EditorView.scrollMargins.of((view) => {
    let value = view.plugin(plugin);
    if (!value || value.gutters.length == 0 || !value.fixed)
      return null;
    let before = value.dom.offsetWidth * view.scaleX, after = value.domAfter ? value.domAfter.offsetWidth * view.scaleX : 0;
    return view.textDirection == Direction.LTR ? { left: before, right: after } : { right: before, left: after };
  })
});
function asArray2(val) {
  return Array.isArray(val) ? val : [val];
}
function advanceCursor(cursor, collect, pos) {
  while (cursor.value && cursor.from <= pos) {
    if (cursor.from == pos)
      collect.push(cursor.value);
    cursor.next();
  }
}
var UpdateContext = class {
  constructor(gutter2, viewport, height) {
    this.gutter = gutter2;
    this.height = height;
    this.i = 0;
    this.cursor = RangeSet.iter(gutter2.markers, viewport.from);
  }
  addElement(view, block, markers) {
    let { gutter: gutter2 } = this, above = (block.top - this.height) / view.scaleY, height = block.height / view.scaleY;
    if (this.i == gutter2.elements.length) {
      let newElt = new GutterElement(view, height, above, markers);
      gutter2.elements.push(newElt);
      gutter2.dom.appendChild(newElt.dom);
    } else {
      gutter2.elements[this.i].update(view, height, above, markers);
    }
    this.height = block.bottom;
    this.i++;
  }
  line(view, line, extraMarkers) {
    let localMarkers = [];
    advanceCursor(this.cursor, localMarkers, line.from);
    if (extraMarkers.length)
      localMarkers = localMarkers.concat(extraMarkers);
    let forLine = this.gutter.config.lineMarker(view, line, localMarkers);
    if (forLine)
      localMarkers.unshift(forLine);
    let gutter2 = this.gutter;
    if (localMarkers.length == 0 && !gutter2.config.renderEmptyElements)
      return;
    this.addElement(view, line, localMarkers);
  }
  widget(view, block) {
    let marker = this.gutter.config.widgetMarker(view, block.widget, block), markers = marker ? [marker] : null;
    for (let cls of view.state.facet(gutterWidgetClass)) {
      let marker2 = cls(view, block.widget, block);
      if (marker2)
        (markers || (markers = [])).push(marker2);
    }
    if (markers)
      this.addElement(view, block, markers);
  }
  finish() {
    let gutter2 = this.gutter;
    while (gutter2.elements.length > this.i) {
      let last = gutter2.elements.pop();
      gutter2.dom.removeChild(last.dom);
      last.destroy();
    }
  }
};
var SingleGutterView = class {
  constructor(view, config2) {
    this.view = view;
    this.config = config2;
    this.elements = [];
    this.spacer = null;
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let prop in config2.domEventHandlers) {
      this.dom.addEventListener(prop, (event) => {
        let target = event.target, y;
        if (target != this.dom && this.dom.contains(target)) {
          while (target.parentNode != this.dom)
            target = target.parentNode;
          let rect = target.getBoundingClientRect();
          y = (rect.top + rect.bottom) / 2;
        } else {
          y = event.clientY;
        }
        let line = view.lineBlockAtHeight(y - view.documentTop);
        if (config2.domEventHandlers[prop](view, line, event))
          event.preventDefault();
      });
    }
    this.markers = asArray2(config2.markers(view));
    if (config2.initialSpacer) {
      this.spacer = new GutterElement(view, 0, 0, [config2.initialSpacer(view)]);
      this.dom.appendChild(this.spacer.dom);
      this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
    }
  }
  update(update) {
    let prevMarkers = this.markers;
    this.markers = asArray2(this.config.markers(update.view));
    if (this.spacer && this.config.updateSpacer) {
      let updated = this.config.updateSpacer(this.spacer.markers[0], update);
      if (updated != this.spacer.markers[0])
        this.spacer.update(update.view, 0, 0, [updated]);
    }
    let vp = update.view.viewport;
    return !RangeSet.eq(this.markers, prevMarkers, vp.from, vp.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(update) : false);
  }
  destroy() {
    for (let elt of this.elements)
      elt.destroy();
  }
};
var GutterElement = class {
  constructor(view, height, above, markers) {
    this.height = -1;
    this.above = 0;
    this.markers = [];
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutterElement";
    this.update(view, height, above, markers);
  }
  update(view, height, above, markers) {
    if (this.height != height) {
      this.height = height;
      this.dom.style.height = height + "px";
    }
    if (this.above != above)
      this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
    if (!sameMarkers(this.markers, markers))
      this.setMarkers(view, markers);
  }
  setMarkers(view, markers) {
    let cls = "cm-gutterElement", domPos = this.dom.firstChild;
    for (let iNew = 0, iOld = 0; ; ) {
      let skipTo = iOld, marker = iNew < markers.length ? markers[iNew++] : null, matched = false;
      if (marker) {
        let c = marker.elementClass;
        if (c)
          cls += " " + c;
        for (let i = iOld; i < this.markers.length; i++)
          if (this.markers[i].compare(marker)) {
            skipTo = i;
            matched = true;
            break;
          }
      } else {
        skipTo = this.markers.length;
      }
      while (iOld < skipTo) {
        let next = this.markers[iOld++];
        if (next.toDOM) {
          next.destroy(domPos);
          let after = domPos.nextSibling;
          domPos.remove();
          domPos = after;
        }
      }
      if (!marker)
        break;
      if (marker.toDOM) {
        if (matched)
          domPos = domPos.nextSibling;
        else
          this.dom.insertBefore(marker.toDOM(view), domPos);
      }
      if (matched)
        iOld++;
    }
    this.dom.className = cls;
    this.markers = markers;
  }
  destroy() {
    this.setMarkers(null, []);
  }
};
function sameMarkers(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!a[i].compare(b[i]))
      return false;
  return true;
}
var lineNumberMarkers = /* @__PURE__ */ Facet.define();
var lineNumberWidgetMarker = /* @__PURE__ */ Facet.define();
var lineNumberConfig = /* @__PURE__ */ Facet.define({
  combine(values) {
    return combineConfig(values, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(a, b) {
        let result = Object.assign({}, a);
        for (let event in b) {
          let exists = result[event], add2 = b[event];
          result[event] = exists ? (view, line, event2) => exists(view, line, event2) || add2(view, line, event2) : add2;
        }
        return result;
      }
    });
  }
});
var NumberMarker = class extends GutterMarker {
  constructor(number2) {
    super();
    this.number = number2;
  }
  eq(other) {
    return this.number == other.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
};
function formatNumber(view, number2) {
  return view.state.facet(lineNumberConfig).formatNumber(number2, view.state);
}
var lineNumberGutter = /* @__PURE__ */ activeGutters.compute([lineNumberConfig], (state) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: false,
  markers(view) {
    return view.state.facet(lineNumberMarkers);
  },
  lineMarker(view, line, others) {
    if (others.some((m) => m.toDOM))
      return null;
    return new NumberMarker(formatNumber(view, view.state.doc.lineAt(line.from).number));
  },
  widgetMarker: (view, widget, block) => {
    for (let m of view.state.facet(lineNumberWidgetMarker)) {
      let result = m(view, widget, block);
      if (result)
        return result;
    }
    return null;
  },
  lineMarkerChange: (update) => update.startState.facet(lineNumberConfig) != update.state.facet(lineNumberConfig),
  initialSpacer(view) {
    return new NumberMarker(formatNumber(view, maxLineNumber(view.state.doc.lines)));
  },
  updateSpacer(spacer, update) {
    let max = formatNumber(update.view, maxLineNumber(update.view.state.doc.lines));
    return max == spacer.number ? spacer : new NumberMarker(max);
  },
  domEventHandlers: state.facet(lineNumberConfig).domEventHandlers,
  side: "before"
}));
function lineNumbers(config2 = {}) {
  return [
    lineNumberConfig.of(config2),
    gutters(),
    lineNumberGutter
  ];
}
function maxLineNumber(lines) {
  let last = 9;
  while (last < lines)
    last = last * 10 + 9;
  return last;
}
var activeLineGutterMarker = /* @__PURE__ */ new class extends GutterMarker {
  constructor() {
    super(...arguments);
    this.elementClass = "cm-activeLineGutter";
  }
}();
var activeLineGutterHighlighter = /* @__PURE__ */ gutterLineClass.compute(["selection"], (state) => {
  let marks2 = [], last = -1;
  for (let range of state.selection.ranges) {
    let linePos = state.doc.lineAt(range.head).from;
    if (linePos > last) {
      last = linePos;
      marks2.push(activeLineGutterMarker.range(linePos));
    }
  }
  return RangeSet.of(marks2);
});
function highlightActiveLineGutter() {
  return activeLineGutterHighlighter;
}

// node_modules/@lezer/common/dist/index.js
var DefaultBufferLength = 1024;
var nextPropID = 0;
var Range2 = class {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
};
var NodeProp = class {
  /**
  Create a new node prop type.
  */
  constructor(config2 = {}) {
    this.id = nextPropID++;
    this.perNode = !!config2.perNode;
    this.deserialize = config2.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
    this.combine = config2.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(match) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    if (typeof match != "function")
      match = NodeType.match(match);
    return (type) => {
      let result = match(type);
      return result === void 0 ? null : [this, result];
    };
  }
};
NodeProp.closedBy = new NodeProp({ deserialize: (str2) => str2.split(" ") });
NodeProp.openedBy = new NodeProp({ deserialize: (str2) => str2.split(" ") });
NodeProp.group = new NodeProp({ deserialize: (str2) => str2.split(" ") });
NodeProp.isolate = new NodeProp({ deserialize: (value) => {
  if (value && value != "rtl" && value != "ltr" && value != "auto")
    throw new RangeError("Invalid value for isolate: " + value);
  return value || "auto";
} });
NodeProp.contextHash = new NodeProp({ perNode: true });
NodeProp.lookAhead = new NodeProp({ perNode: true });
NodeProp.mounted = new NodeProp({ perNode: true });
var MountedTree = class {
  constructor(tree, overlay, parser, bracketed = false) {
    this.tree = tree;
    this.overlay = overlay;
    this.parser = parser;
    this.bracketed = bracketed;
  }
  /**
  @internal
  */
  static get(tree) {
    return tree && tree.props && tree.props[NodeProp.mounted.id];
  }
};
var noProps = /* @__PURE__ */ Object.create(null);
var NodeType = class _NodeType {
  /**
  @internal
  */
  constructor(name2, props, id, flags = 0) {
    this.name = name2;
    this.props = props;
    this.id = id;
    this.flags = flags;
  }
  /**
  Define a node type.
  */
  static define(spec) {
    let props = spec.props && spec.props.length ? /* @__PURE__ */ Object.create(null) : noProps;
    let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
    let type = new _NodeType(spec.name || "", props, spec.id, flags);
    if (spec.props)
      for (let src of spec.props) {
        if (!Array.isArray(src))
          src = src(type);
        if (src) {
          if (src[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          props[src[0].id] = src[1];
        }
      }
    return type;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(prop) {
    return this.props[prop.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(name2) {
    if (typeof name2 == "string") {
      if (this.name == name2)
        return true;
      let group = this.prop(NodeProp.group);
      return group ? group.indexOf(name2) > -1 : false;
    }
    return this.id == name2;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(map) {
    let direct = /* @__PURE__ */ Object.create(null);
    for (let prop in map)
      for (let name2 of prop.split(" "))
        direct[name2] = map[prop];
    return (node) => {
      for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
        let found = direct[i < 0 ? node.name : groups[i]];
        if (found)
          return found;
      }
    };
  }
};
NodeType.none = new NodeType(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
var NodeSet = class _NodeSet {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(types2) {
    this.types = types2;
    for (let i = 0; i < types2.length; i++)
      if (types2[i].id != i)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...props) {
    let newTypes = [];
    for (let type of this.types) {
      let newProps = null;
      for (let source of props) {
        let add2 = source(type);
        if (add2) {
          if (!newProps)
            newProps = Object.assign({}, type.props);
          let value = add2[1], prop = add2[0];
          if (prop.combine && prop.id in newProps)
            value = prop.combine(newProps[prop.id], value);
          newProps[prop.id] = value;
        }
      }
      newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
    }
    return new _NodeSet(newTypes);
  }
};
var CachedNode = /* @__PURE__ */ new WeakMap();
var CachedInnerNode = /* @__PURE__ */ new WeakMap();
var IterMode;
(function(IterMode2) {
  IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
  IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
  IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
  IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
  IterMode2[IterMode2["EnterBracketed"] = 16] = "EnterBracketed";
})(IterMode || (IterMode = {}));
var Tree = class _Tree {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(type, children, positions, length, props) {
    this.type = type;
    this.children = children;
    this.positions = positions;
    this.length = length;
    this.props = null;
    if (props && props.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [prop, value] of props)
        this.props[typeof prop == "number" ? prop : prop.id] = value;
    }
  }
  /**
  @internal
  */
  toString() {
    let mounted = MountedTree.get(this);
    if (mounted && !mounted.overlay)
      return mounted.tree.toString();
    let children = "";
    for (let ch of this.children) {
      let str2 = ch.toString();
      if (str2) {
        if (children)
          children += ",";
        children += str2;
      }
    }
    return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(mode = 0) {
    return new TreeCursor(this.topNode, mode);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(pos, side = 0, mode = 0) {
    let scope = CachedNode.get(this) || this.topNode;
    let cursor = new TreeCursor(scope);
    cursor.moveTo(pos, side);
    CachedNode.set(this, cursor._tree);
    return cursor;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new TreeNode(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(pos, side = 0) {
    let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
    CachedNode.set(this, node);
    return node;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(pos, side = 0) {
    let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
    CachedInnerNode.set(this, node);
    return node;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(pos, side = 0) {
    return stackIterator(this, pos, side);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(spec) {
    let { enter, leave, from = 0, to = this.length } = spec;
    let mode = spec.mode || 0, anon = (mode & IterMode.IncludeAnonymous) > 0;
    for (let c = this.cursor(mode | IterMode.IncludeAnonymous); ; ) {
      let entered = false;
      if (c.from <= to && c.to >= from && (!anon && c.type.isAnonymous || enter(c) !== false)) {
        if (c.firstChild())
          continue;
        entered = true;
      }
      for (; ; ) {
        if (entered && leave && (anon || !c.type.isAnonymous))
          leave(c);
        if (c.nextSibling())
          break;
        if (!c.parent())
          return;
        entered = true;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(prop) {
    return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let result = [];
    if (this.props)
      for (let id in this.props)
        result.push([+id, this.props[id]]);
    return result;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(config2 = {}) {
    return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new _Tree(this.type, children, positions, length, this.propValues), config2.makeTree || ((children, positions, length) => new _Tree(NodeType.none, children, positions, length)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(data) {
    return buildTree(data);
  }
};
Tree.empty = new Tree(NodeType.none, [], [], 0);
var FlatBufferCursor = class _FlatBufferCursor {
  constructor(buffer, index) {
    this.buffer = buffer;
    this.index = index;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new _FlatBufferCursor(this.buffer, this.index);
  }
};
var TreeBuffer = class _TreeBuffer {
  /**
  Create a tree buffer.
  */
  constructor(buffer, length, set) {
    this.buffer = buffer;
    this.length = length;
    this.set = set;
  }
  /**
  @internal
  */
  get type() {
    return NodeType.none;
  }
  /**
  @internal
  */
  toString() {
    let result = [];
    for (let index = 0; index < this.buffer.length; ) {
      result.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result.join(",");
  }
  /**
  @internal
  */
  childString(index) {
    let id = this.buffer[index], endIndex = this.buffer[index + 3];
    let type = this.set.types[id], result = type.name;
    if (/\W/.test(result) && !type.isError)
      result = JSON.stringify(result);
    index += 4;
    if (endIndex == index)
      return result;
    let children = [];
    while (index < endIndex) {
      children.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result + "(" + children.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(startIndex, endIndex, dir, pos, side) {
    let { buffer } = this, pick = -1;
    for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
      if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
        pick = i;
        if (dir > 0)
          break;
      }
    }
    return pick;
  }
  /**
  @internal
  */
  slice(startI, endI, from) {
    let b = this.buffer;
    let copy = new Uint16Array(endI - startI), len = 0;
    for (let i = startI, j = 0; i < endI; ) {
      copy[j++] = b[i++];
      copy[j++] = b[i++] - from;
      let to = copy[j++] = b[i++] - from;
      copy[j++] = b[i++] - startI;
      len = Math.max(len, to);
    }
    return new _TreeBuffer(copy, len, this.set);
  }
};
function checkSide(side, pos, from, to) {
  switch (side) {
    case -2:
      return from < pos;
    case -1:
      return to >= pos && from < pos;
    case 0:
      return from < pos && to > pos;
    case 1:
      return from <= pos && to > pos;
    case 2:
      return to > pos;
    case 4:
      return true;
  }
}
function resolveNode(node, pos, side, overlays) {
  var _a2;
  while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
    let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
    if (!parent)
      return node;
    node = parent;
  }
  let mode = overlays ? 0 : IterMode.IgnoreOverlays;
  if (overlays)
    for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
      if (scan instanceof TreeNode && scan.index < 0 && ((_a2 = parent.enter(pos, side, mode)) === null || _a2 === void 0 ? void 0 : _a2.from) != scan.from)
        node = parent;
    }
  for (; ; ) {
    let inner = node.enter(pos, side, mode);
    if (!inner)
      return node;
    node = inner;
  }
}
var BaseNode = class {
  cursor(mode = 0) {
    return new TreeCursor(this, mode);
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
  resolve(pos, side = 0) {
    return resolveNode(this, pos, side, false);
  }
  resolveInner(pos, side = 0) {
    return resolveNode(this, pos, side, true);
  }
  matchContext(context) {
    return matchNodeContext(this.parent, context);
  }
  enterUnfinishedNodesBefore(pos) {
    let scan = this.childBefore(pos), node = this;
    while (scan) {
      let last = scan.lastChild;
      if (!last || last.to != scan.to)
        break;
      if (last.type.isError && last.from == last.to) {
        node = scan;
        scan = last.prevSibling;
      } else {
        scan = last;
      }
    }
    return node;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
};
var TreeNode = class _TreeNode extends BaseNode {
  constructor(_tree, from, index, _parent) {
    super();
    this._tree = _tree;
    this.from = from;
    this.index = index;
    this._parent = _parent;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(i, dir, pos, side, mode = 0) {
    for (let parent = this; ; ) {
      for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
        let next = children[i], start = positions[i] + parent.from, mounted;
        if (!(mode & IterMode.EnterBracketed && next instanceof Tree && (mounted = MountedTree.get(next)) && !mounted.overlay && mounted.bracketed && pos >= start && pos <= start + next.length) && !checkSide(side, pos, start, start + next.length))
          continue;
        if (next instanceof TreeBuffer) {
          if (mode & IterMode.ExcludeBuffers)
            continue;
          let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
          if (index > -1)
            return new BufferNode(new BufferContext(parent, next, i, start), null, index);
        } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
          let mounted2;
          if (!(mode & IterMode.IgnoreMounts) && (mounted2 = MountedTree.get(next)) && !mounted2.overlay)
            return new _TreeNode(mounted2.tree, start, i, parent);
          let inner = new _TreeNode(next, start, i, parent);
          return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side, mode);
        }
      }
      if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
        return null;
      if (parent.index >= 0)
        i = parent.index + dir;
      else
        i = dir < 0 ? -1 : parent._parent._tree.children.length;
      parent = parent._parent;
      if (!parent)
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(pos) {
    return this.nextChild(
      0,
      1,
      pos,
      2
      /* Side.After */
    );
  }
  childBefore(pos) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  prop(prop) {
    return this._tree.prop(prop);
  }
  enter(pos, side, mode = 0) {
    let mounted;
    if (!(mode & IterMode.IgnoreOverlays) && (mounted = MountedTree.get(this._tree)) && mounted.overlay) {
      let rPos = pos - this.from, enterBracketed = mode & IterMode.EnterBracketed && mounted.bracketed;
      for (let { from, to } of mounted.overlay) {
        if ((side > 0 || enterBracketed ? from <= rPos : from < rPos) && (side < 0 || enterBracketed ? to >= rPos : to > rPos))
          return new _TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
      }
    }
    return this.nextChild(0, 1, pos, side, mode);
  }
  nextSignificantParent() {
    let val = this;
    while (val.type.isAnonymous && val._parent)
      val = val._parent;
    return val;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
};
function getChildren(node, type, before, after) {
  let cur2 = node.cursor(), result = [];
  if (!cur2.firstChild())
    return result;
  if (before != null)
    for (let found = false; !found; ) {
      found = cur2.type.is(before);
      if (!cur2.nextSibling())
        return result;
    }
  for (; ; ) {
    if (after != null && cur2.type.is(after))
      return result;
    if (cur2.type.is(type))
      result.push(cur2.node);
    if (!cur2.nextSibling())
      return after == null ? result : [];
  }
}
function matchNodeContext(node, context, i = context.length - 1) {
  for (let p = node; i >= 0; p = p.parent) {
    if (!p)
      return false;
    if (!p.type.isAnonymous) {
      if (context[i] && context[i] != p.name)
        return false;
      i--;
    }
  }
  return true;
}
var BufferContext = class {
  constructor(parent, buffer, index, start) {
    this.parent = parent;
    this.buffer = buffer;
    this.index = index;
    this.start = start;
  }
};
var BufferNode = class _BufferNode extends BaseNode {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(context, _parent, index) {
    super();
    this.context = context;
    this._parent = _parent;
    this.index = index;
    this.type = context.buffer.set.types[context.buffer.buffer[index]];
  }
  child(dir, pos, side) {
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
    return index < 0 ? null : new _BufferNode(this.context, this, index);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(pos) {
    return this.child(
      1,
      pos,
      2
      /* Side.After */
    );
  }
  childBefore(pos) {
    return this.child(
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  prop(prop) {
    return this.type.prop(prop);
  }
  enter(pos, side, mode = 0) {
    if (mode & IterMode.ExcludeBuffers)
      return null;
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
    return index < 0 ? null : new _BufferNode(this.context, this, index);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(dir) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + dir,
      dir,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer } = this.context;
    let after = buffer.buffer[this.index + 3];
    if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
      return new _BufferNode(this.context, this._parent, after);
    return this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer } = this.context;
    let parentStart = this._parent ? this._parent.index + 4 : 0;
    if (this.index == parentStart)
      return this.externalSibling(-1);
    return new _BufferNode(this.context, this._parent, buffer.findChild(
      parentStart,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let children = [], positions = [];
    let { buffer } = this.context;
    let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
    if (endI > startI) {
      let from = buffer.buffer[this.index + 1];
      children.push(buffer.slice(startI, endI, from));
      positions.push(0);
    }
    return new Tree(this.type, children, positions, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
};
function iterStack(heads) {
  if (!heads.length)
    return null;
  let pick = 0, picked = heads[0];
  for (let i = 1; i < heads.length; i++) {
    let node = heads[i];
    if (node.from > picked.from || node.to < picked.to) {
      picked = node;
      pick = i;
    }
  }
  let next = picked instanceof TreeNode && picked.index < 0 ? null : picked.parent;
  let newHeads = heads.slice();
  if (next)
    newHeads[pick] = next;
  else
    newHeads.splice(pick, 1);
  return new StackIterator(newHeads, picked);
}
var StackIterator = class {
  constructor(heads, node) {
    this.heads = heads;
    this.node = node;
  }
  get next() {
    return iterStack(this.heads);
  }
};
function stackIterator(tree, pos, side) {
  let inner = tree.resolveInner(pos, side), layers = null;
  for (let scan = inner instanceof TreeNode ? inner : inner.context.parent; scan; scan = scan.parent) {
    if (scan.index < 0) {
      let parent = scan.parent;
      (layers || (layers = [inner])).push(parent.resolve(pos, side));
      scan = parent;
    } else {
      let mount = MountedTree.get(scan.tree);
      if (mount && mount.overlay && mount.overlay[0].from <= pos && mount.overlay[mount.overlay.length - 1].to >= pos) {
        let root = new TreeNode(mount.tree, mount.overlay[0].from + scan.from, -1, scan);
        (layers || (layers = [inner])).push(resolveNode(root, pos, side, false));
      }
    }
  }
  return layers ? iterStack(layers) : inner;
}
var TreeCursor = class {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(node, mode = 0) {
    this.buffer = null;
    this.stack = [];
    this.index = 0;
    this.bufferNode = null;
    this.mode = mode & ~IterMode.EnterBracketed;
    if (node instanceof TreeNode) {
      this.yieldNode(node);
    } else {
      this._tree = node.context.parent;
      this.buffer = node.context;
      for (let n = node._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = node;
      this.yieldBuf(node.index);
    }
  }
  yieldNode(node) {
    if (!node)
      return false;
    this._tree = node;
    this.type = node.type;
    this.from = node.from;
    this.to = node.to;
    return true;
  }
  yieldBuf(index, type) {
    this.index = index;
    let { start, buffer } = this.buffer;
    this.type = type || buffer.set.types[buffer.buffer[index]];
    this.from = start + buffer.buffer[index + 1];
    this.to = start + buffer.buffer[index + 2];
    return true;
  }
  /**
  @internal
  */
  yield(node) {
    if (!node)
      return false;
    if (node instanceof TreeNode) {
      this.buffer = null;
      return this.yieldNode(node);
    }
    this.buffer = node.context;
    return this.yieldBuf(node.index, node.type);
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(dir, pos, side) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
    let { buffer } = this.buffer;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
    if (index < 0)
      return false;
    this.stack.push(this.index);
    return this.yieldBuf(index);
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(pos) {
    return this.enterChild(
      1,
      pos,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(pos) {
    return this.enterChild(
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(pos, side, mode = this.mode) {
    if (!this.buffer)
      return this.yield(this._tree.enter(pos, side, mode));
    return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    this.buffer = null;
    return this.yieldNode(parent);
  }
  /**
  @internal
  */
  sibling(dir) {
    if (!this.buffer)
      return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
    let { buffer } = this.buffer, d = this.stack.length - 1;
    if (dir < 0) {
      let parentStart = d < 0 ? 0 : this.stack[d] + 4;
      if (this.index != parentStart)
        return this.yieldBuf(buffer.findChild(
          parentStart,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let after = buffer.buffer[this.index + 3];
      if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
        return this.yieldBuf(after);
    }
    return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(dir) {
    let index, parent, { buffer } = this;
    if (buffer) {
      if (dir > 0) {
        if (this.index < buffer.buffer.buffer.length)
          return false;
      } else {
        for (let i = 0; i < this.index; i++)
          if (buffer.buffer.buffer[i + 3] < this.index)
            return false;
      }
      ({ index, parent } = buffer);
    } else {
      ({ index, _parent: parent } = this._tree);
    }
    for (; parent; { index, _parent: parent } = parent) {
      if (index > -1)
        for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
          let child = parent._tree.children[i];
          if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
            return false;
        }
    }
    return true;
  }
  move(dir, enter) {
    if (enter && this.enterChild(
      dir,
      0,
      4
      /* Side.DontCare */
    ))
      return true;
    for (; ; ) {
      if (this.sibling(dir))
        return true;
      if (this.atLastNode(dir) || !this.parent())
        return false;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(enter = true) {
    return this.move(1, enter);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(enter = true) {
    return this.move(-1, enter);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(pos, side = 0) {
    while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
      if (!this.parent())
        break;
    while (this.enterChild(1, pos, side)) {
    }
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let cache = this.bufferNode, result = null, depth = 0;
    if (cache && cache.context == this.buffer) {
      scan: for (let index = this.index, d = this.stack.length; d >= 0; ) {
        for (let c = cache; c; c = c._parent)
          if (c.index == index) {
            if (index == this.index)
              return c;
            result = c;
            depth = d + 1;
            break scan;
          }
        index = this.stack[--d];
      }
    }
    for (let i = depth; i < this.stack.length; i++)
      result = new BufferNode(this.buffer, result, this.stack[i]);
    return this.bufferNode = new BufferNode(this.buffer, result, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(enter, leave) {
    for (let depth = 0; ; ) {
      let mustLeave = false;
      if (this.type.isAnonymous || enter(this) !== false) {
        if (this.firstChild()) {
          depth++;
          continue;
        }
        if (!this.type.isAnonymous)
          mustLeave = true;
      }
      for (; ; ) {
        if (mustLeave && leave)
          leave(this);
        mustLeave = this.type.isAnonymous;
        if (!depth)
          return;
        if (this.nextSibling())
          break;
        this.parent();
        depth--;
        mustLeave = true;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(context) {
    if (!this.buffer)
      return matchNodeContext(this.node.parent, context);
    let { buffer } = this.buffer, { types: types2 } = buffer.set;
    for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
      if (d < 0)
        return matchNodeContext(this._tree, context, i);
      let type = types2[buffer.buffer[this.stack[d]]];
      if (!type.isAnonymous) {
        if (context[i] && context[i] != type.name)
          return false;
        i--;
      }
    }
    return true;
  }
};
function hasChild(tree) {
  return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
}
function buildTree(data) {
  var _a2;
  let { buffer, nodeSet: nodeSet2, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet2.types.length } = data;
  let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
  let types2 = nodeSet2.types;
  let contextHash = 0, lookAhead = 0;
  function takeNode(parentStart, minPos, children2, positions2, inRepeat, depth) {
    let { id, start, end, size } = cursor;
    let lookAheadAtStart = lookAhead, contextAtStart = contextHash;
    if (size < 0) {
      cursor.next();
      if (size == -1) {
        let node2 = reused[id];
        children2.push(node2);
        positions2.push(start - parentStart);
        return;
      } else if (size == -3) {
        contextHash = id;
        return;
      } else if (size == -4) {
        lookAhead = id;
        return;
      } else {
        throw new RangeError(`Unrecognized record size: ${size}`);
      }
    }
    let type = types2[id], node, buffer2;
    let startPos = start - parentStart;
    if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
      let data2 = new Uint16Array(buffer2.size - buffer2.skip);
      let endPos = cursor.pos - buffer2.size, index = data2.length;
      while (cursor.pos > endPos)
        index = copyToBuffer(buffer2.start, data2, index);
      node = new TreeBuffer(data2, end - buffer2.start, nodeSet2);
      startPos = buffer2.start - parentStart;
    } else {
      let endPos = cursor.pos - size;
      cursor.next();
      let localChildren = [], localPositions = [];
      let localInRepeat = id >= minRepeatType ? id : -1;
      let lastGroup = 0, lastEnd = end;
      while (cursor.pos > endPos) {
        if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
          if (cursor.end <= lastEnd - maxBufferLength) {
            makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart, contextAtStart);
            lastGroup = localChildren.length;
            lastEnd = cursor.end;
          }
          cursor.next();
        } else if (depth > 2500) {
          takeFlatNode(start, endPos, localChildren, localPositions);
        } else {
          takeNode(start, endPos, localChildren, localPositions, localInRepeat, depth + 1);
        }
      }
      if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
        makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart, contextAtStart);
      localChildren.reverse();
      localPositions.reverse();
      if (localInRepeat > -1 && lastGroup > 0) {
        let make = makeBalanced(type, contextAtStart);
        node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
      } else {
        node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end, contextAtStart);
      }
    }
    children2.push(node);
    positions2.push(startPos);
  }
  function takeFlatNode(parentStart, minPos, children2, positions2) {
    let nodes = [];
    let nodeCount = 0, stopAt = -1;
    while (cursor.pos > minPos) {
      let { id, start, end, size } = cursor;
      if (size > 4) {
        cursor.next();
      } else if (stopAt > -1 && start < stopAt) {
        break;
      } else {
        if (stopAt < 0)
          stopAt = end - maxBufferLength;
        nodes.push(id, start, end);
        nodeCount++;
        cursor.next();
      }
    }
    if (nodeCount) {
      let buffer2 = new Uint16Array(nodeCount * 4);
      let start = nodes[nodes.length - 2];
      for (let i = nodes.length - 3, j = 0; i >= 0; i -= 3) {
        buffer2[j++] = nodes[i];
        buffer2[j++] = nodes[i + 1] - start;
        buffer2[j++] = nodes[i + 2] - start;
        buffer2[j++] = j;
      }
      children2.push(new TreeBuffer(buffer2, nodes[2] - start, nodeSet2));
      positions2.push(start - parentStart);
    }
  }
  function makeBalanced(type, contextHash2) {
    return (children2, positions2, length2) => {
      let lookAhead2 = 0, lastI = children2.length - 1, last, lookAheadProp;
      if (lastI >= 0 && (last = children2[lastI]) instanceof Tree) {
        if (!lastI && last.type == type && last.length == length2)
          return last;
        if (lookAheadProp = last.prop(NodeProp.lookAhead))
          lookAhead2 = positions2[lastI] + last.length + lookAheadProp;
      }
      return makeTree(type, children2, positions2, length2, lookAhead2, contextHash2);
    };
  }
  function makeRepeatLeaf(children2, positions2, base2, i, from, to, type, lookAhead2, contextHash2) {
    let localChildren = [], localPositions = [];
    while (children2.length > i) {
      localChildren.push(children2.pop());
      localPositions.push(positions2.pop() + base2 - from);
    }
    children2.push(makeTree(nodeSet2.types[type], localChildren, localPositions, to - from, lookAhead2 - to, contextHash2));
    positions2.push(from - base2);
  }
  function makeTree(type, children2, positions2, length2, lookAhead2, contextHash2, props) {
    if (contextHash2) {
      let pair = [NodeProp.contextHash, contextHash2];
      props = props ? [pair].concat(props) : [pair];
    }
    if (lookAhead2 > 25) {
      let pair = [NodeProp.lookAhead, lookAhead2];
      props = props ? [pair].concat(props) : [pair];
    }
    return new Tree(type, children2, positions2, length2, props);
  }
  function findBufferSize(maxSize, inRepeat) {
    let fork = cursor.fork();
    let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
    let result = { size: 0, start: 0, skip: 0 };
    scan: for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
      let nodeSize2 = fork.size;
      if (fork.id == inRepeat && nodeSize2 >= 0) {
        result.size = size;
        result.start = start;
        result.skip = skip;
        skip += 4;
        size += 4;
        fork.next();
        continue;
      }
      let startPos = fork.pos - nodeSize2;
      if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
        break;
      let localSkipped = fork.id >= minRepeatType ? 4 : 0;
      let nodeStart2 = fork.start;
      fork.next();
      while (fork.pos > startPos) {
        if (fork.size < 0) {
          if (fork.size == -3 || fork.size == -4)
            localSkipped += 4;
          else
            break scan;
        } else if (fork.id >= minRepeatType) {
          localSkipped += 4;
        }
        fork.next();
      }
      start = nodeStart2;
      size += nodeSize2;
      skip += localSkipped;
    }
    if (inRepeat < 0 || size == maxSize) {
      result.size = size;
      result.start = start;
      result.skip = skip;
    }
    return result.size > 4 ? result : void 0;
  }
  function copyToBuffer(bufferStart, buffer2, index) {
    let { id, start, end, size } = cursor;
    cursor.next();
    if (size >= 0 && id < minRepeatType) {
      let startIndex = index;
      if (size > 4) {
        let endPos = cursor.pos - (size - 4);
        while (cursor.pos > endPos)
          index = copyToBuffer(bufferStart, buffer2, index);
      }
      buffer2[--index] = startIndex;
      buffer2[--index] = end - bufferStart;
      buffer2[--index] = start - bufferStart;
      buffer2[--index] = id;
    } else if (size == -3) {
      contextHash = id;
    } else if (size == -4) {
      lookAhead = id;
    }
    return index;
  }
  let children = [], positions = [];
  while (cursor.pos > 0)
    takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1, 0);
  let length = (_a2 = data.length) !== null && _a2 !== void 0 ? _a2 : children.length ? positions[0] + children[0].length : 0;
  return new Tree(types2[data.topID], children.reverse(), positions.reverse(), length);
}
var nodeSizeCache = /* @__PURE__ */ new WeakMap();
function nodeSize(balanceType, node) {
  if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
    return 1;
  let size = nodeSizeCache.get(node);
  if (size == null) {
    size = 1;
    for (let child of node.children) {
      if (child.type != balanceType || !(child instanceof Tree)) {
        size = 1;
        break;
      }
      size += nodeSize(balanceType, child);
    }
    nodeSizeCache.set(node, size);
  }
  return size;
}
function balanceRange(balanceType, children, positions, from, to, start, length, mkTop, mkTree) {
  let total = 0;
  for (let i = from; i < to; i++)
    total += nodeSize(balanceType, children[i]);
  let maxChild = Math.ceil(
    total * 1.5 / 8
    /* Balance.BranchFactor */
  );
  let localChildren = [], localPositions = [];
  function divide(children2, positions2, from2, to2, offset) {
    for (let i = from2; i < to2; ) {
      let groupFrom = i, groupStart = positions2[i], groupSize = nodeSize(balanceType, children2[i]);
      i++;
      for (; i < to2; i++) {
        let nextSize = nodeSize(balanceType, children2[i]);
        if (groupSize + nextSize >= maxChild)
          break;
        groupSize += nextSize;
      }
      if (i == groupFrom + 1) {
        if (groupSize > maxChild) {
          let only = children2[groupFrom];
          divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
          continue;
        }
        localChildren.push(children2[groupFrom]);
      } else {
        let length2 = positions2[i - 1] + children2[i - 1].length - groupStart;
        localChildren.push(balanceRange(balanceType, children2, positions2, groupFrom, i, groupStart, length2, null, mkTree));
      }
      localPositions.push(groupStart + offset - start);
    }
  }
  divide(children, positions, from, to, 0);
  return (mkTop || mkTree)(localChildren, localPositions, length);
}
var TreeFragment = class _TreeFragment {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(from, to, tree, offset, openStart = false, openEnd = false) {
    this.from = from;
    this.to = to;
    this.tree = tree;
    this.offset = offset;
    this.open = (openStart ? 1 : 0) | (openEnd ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(tree, fragments = [], partial = false) {
    let result = [new _TreeFragment(0, tree.length, tree, 0, false, partial)];
    for (let f of fragments)
      if (f.to > tree.length)
        result.push(f);
    return result;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(fragments, changes, minGap = 128) {
    if (!changes.length)
      return fragments;
    let result = [];
    let fI = 1, nextF = fragments.length ? fragments[0] : null;
    for (let cI = 0, pos = 0, off = 0; ; cI++) {
      let nextC = cI < changes.length ? changes[cI] : null;
      let nextPos = nextC ? nextC.fromA : 1e9;
      if (nextPos - pos >= minGap)
        while (nextF && nextF.from < nextPos) {
          let cut = nextF;
          if (pos >= cut.from || nextPos <= cut.to || off) {
            let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
            cut = fFrom >= fTo ? null : new _TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
          }
          if (cut)
            result.push(cut);
          if (nextF.to > nextPos)
            break;
          nextF = fI < fragments.length ? fragments[fI++] : null;
        }
      if (!nextC)
        break;
      pos = nextC.toA;
      off = nextC.toA - nextC.toB;
    }
    return result;
  }
};
var Parser2 = class {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(input, fragments, ranges) {
    if (typeof input == "string")
      input = new StringInput(input);
    ranges = !ranges ? [new Range2(0, input.length)] : ranges.length ? ranges.map((r) => new Range2(r.from, r.to)) : [new Range2(0, 0)];
    return this.createParse(input, fragments || [], ranges);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(input, fragments, ranges) {
    let parse2 = this.startParse(input, fragments, ranges);
    for (; ; ) {
      let done = parse2.advance();
      if (done)
        return done;
    }
  }
};
var StringInput = class {
  constructor(string2) {
    this.string = string2;
  }
  get length() {
    return this.string.length;
  }
  chunk(from) {
    return this.string.slice(from);
  }
  get lineChunks() {
    return false;
  }
  read(from, to) {
    return this.string.slice(from, to);
  }
};
var stoppedInner = new NodeProp({ perNode: true });

// node_modules/@lezer/highlight/dist/index.js
var nextTagID = 0;
var Tag = class _Tag {
  /**
  @internal
  */
  constructor(name2, set, base2, modified) {
    this.name = name2;
    this.set = set;
    this.base = base2;
    this.modified = modified;
    this.id = nextTagID++;
  }
  toString() {
    let { name: name2 } = this;
    for (let mod of this.modified)
      if (mod.name)
        name2 = `${mod.name}(${name2})`;
    return name2;
  }
  static define(nameOrParent, parent) {
    let name2 = typeof nameOrParent == "string" ? nameOrParent : "?";
    if (nameOrParent instanceof _Tag)
      parent = nameOrParent;
    if (parent === null || parent === void 0 ? void 0 : parent.base)
      throw new Error("Can not derive from a modified tag");
    let tag = new _Tag(name2, [], null, []);
    tag.set.push(tag);
    if (parent)
      for (let t2 of parent.set)
        tag.set.push(t2);
    return tag;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(name2) {
    let mod = new Modifier(name2);
    return (tag) => {
      if (tag.modified.indexOf(mod) > -1)
        return tag;
      return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
    };
  }
};
var nextModifierID = 0;
var Modifier = class _Modifier {
  constructor(name2) {
    this.name = name2;
    this.instances = [];
    this.id = nextModifierID++;
  }
  static get(base2, mods) {
    if (!mods.length)
      return base2;
    let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
    if (exists)
      return exists;
    let set = [], tag = new Tag(base2.name, set, base2, mods);
    for (let m of mods)
      m.instances.push(tag);
    let configs = powerSet(mods);
    for (let parent of base2.set)
      if (!parent.modified.length)
        for (let config2 of configs)
          set.push(_Modifier.get(parent, config2));
    return tag;
  }
};
function sameArray2(a, b) {
  return a.length == b.length && a.every((x, i) => x == b[i]);
}
function powerSet(array) {
  let sets = [[]];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0, e = sets.length; j < e; j++) {
      sets.push(sets[j].concat(array[i]));
    }
  }
  return sets.sort((a, b) => b.length - a.length);
}
function styleTags(spec) {
  let byName = /* @__PURE__ */ Object.create(null);
  for (let prop in spec) {
    let tags2 = spec[prop];
    if (!Array.isArray(tags2))
      tags2 = [tags2];
    for (let part of prop.split(" "))
      if (part) {
        let pieces = [], mode = 2, rest = part;
        for (let pos = 0; ; ) {
          if (rest == "..." && pos > 0 && pos + 3 == part.length) {
            mode = 1;
            break;
          }
          let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
          if (!m)
            throw new RangeError("Invalid path: " + part);
          pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
          pos += m[0].length;
          if (pos == part.length)
            break;
          let next = part[pos++];
          if (pos == part.length && next == "!") {
            mode = 0;
            break;
          }
          if (next != "/")
            throw new RangeError("Invalid path: " + part);
          rest = part.slice(pos);
        }
        let last = pieces.length - 1, inner = pieces[last];
        if (!inner)
          throw new RangeError("Invalid path: " + part);
        let rule = new Rule(tags2, mode, last > 0 ? pieces.slice(0, last) : null);
        byName[inner] = rule.sort(byName[inner]);
      }
  }
  return ruleNodeProp.add(byName);
}
var ruleNodeProp = new NodeProp({
  combine(a, b) {
    let cur2, root, take;
    while (a || b) {
      if (!a || b && a.depth >= b.depth) {
        take = b;
        b = b.next;
      } else {
        take = a;
        a = a.next;
      }
      if (cur2 && cur2.mode == take.mode && !take.context && !cur2.context)
        continue;
      let copy = new Rule(take.tags, take.mode, take.context);
      if (cur2)
        cur2.next = copy;
      else
        root = copy;
      cur2 = copy;
    }
    return root;
  }
});
var Rule = class {
  constructor(tags2, mode, context, next) {
    this.tags = tags2;
    this.mode = mode;
    this.context = context;
    this.next = next;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(other) {
    if (!other || other.depth < this.depth) {
      this.next = other;
      return this;
    }
    other.next = this.sort(other.next);
    return other;
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
};
Rule.empty = new Rule([], 2, null);
function tagHighlighter(tags2, options) {
  let map = /* @__PURE__ */ Object.create(null);
  for (let style of tags2) {
    if (!Array.isArray(style.tag))
      map[style.tag.id] = style.class;
    else
      for (let tag of style.tag)
        map[tag.id] = style.class;
  }
  let { scope, all = null } = options || {};
  return {
    style: (tags3) => {
      let cls = all;
      for (let tag of tags3) {
        for (let sub of tag.set) {
          let tagClass = map[sub.id];
          if (tagClass) {
            cls = cls ? cls + " " + tagClass : tagClass;
            break;
          }
        }
      }
      return cls;
    },
    scope
  };
}
function highlightTags(highlighters, tags2) {
  let result = null;
  for (let highlighter of highlighters) {
    let value = highlighter.style(tags2);
    if (value)
      result = result ? result + " " + value : value;
  }
  return result;
}
function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
  let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
  builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
  builder.flush(to);
}
var HighlightBuilder = class {
  constructor(at, highlighters, span) {
    this.at = at;
    this.highlighters = highlighters;
    this.span = span;
    this.class = "";
  }
  startSpan(at, cls) {
    if (cls != this.class) {
      this.flush(at);
      if (at > this.at)
        this.at = at;
      this.class = cls;
    }
  }
  flush(to) {
    if (to > this.at && this.class)
      this.span(this.at, to, this.class);
  }
  highlightRange(cursor, from, to, inheritedClass, highlighters) {
    let { type, from: start, to: end } = cursor;
    if (start >= to || end <= from)
      return;
    if (type.isTop)
      highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type));
    let cls = inheritedClass;
    let rule = getStyleTags(cursor) || Rule.empty;
    let tagCls = highlightTags(highlighters, rule.tags);
    if (tagCls) {
      if (cls)
        cls += " ";
      cls += tagCls;
      if (rule.mode == 1)
        inheritedClass += (inheritedClass ? " " : "") + tagCls;
    }
    this.startSpan(Math.max(from, start), cls);
    if (rule.opaque)
      return;
    let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
    if (mounted && mounted.overlay) {
      let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
      let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
      let hasChild2 = cursor.firstChild();
      for (let i = 0, pos = start; ; i++) {
        let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
        let nextPos = next ? next.from + start : end;
        let rangeFrom2 = Math.max(from, pos), rangeTo2 = Math.min(to, nextPos);
        if (rangeFrom2 < rangeTo2 && hasChild2) {
          while (cursor.from < rangeTo2) {
            this.highlightRange(cursor, rangeFrom2, rangeTo2, inheritedClass, highlighters);
            this.startSpan(Math.min(rangeTo2, cursor.to), cls);
            if (cursor.to >= nextPos || !cursor.nextSibling())
              break;
          }
        }
        if (!next || nextPos > to)
          break;
        pos = next.to + start;
        if (pos > from) {
          this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), "", innerHighlighters);
          this.startSpan(Math.min(to, pos), cls);
        }
      }
      if (hasChild2)
        cursor.parent();
    } else if (cursor.firstChild()) {
      if (mounted)
        inheritedClass = "";
      do {
        if (cursor.to <= from)
          continue;
        if (cursor.from >= to)
          break;
        this.highlightRange(cursor, from, to, inheritedClass, highlighters);
        this.startSpan(Math.min(to, cursor.to), cls);
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }
};
function getStyleTags(node) {
  let rule = node.type.prop(ruleNodeProp);
  while (rule && rule.context && !node.matchContext(rule.context))
    rule = rule.next;
  return rule || null;
}
var t = Tag.define;
var comment = t();
var name = t();
var typeName = t(name);
var propertyName = t(name);
var literal = t();
var string = t(literal);
var number = t(literal);
var content = t();
var heading = t(content);
var keyword = t();
var operator = t();
var punctuation = t();
var bracket = t(punctuation);
var meta = t();
var tags = {
  /**
  A comment.
  */
  comment,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: t(comment),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: t(comment),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: t(comment),
  /**
  Any kind of identifier.
  */
  name,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: t(name),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: t(typeName),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: t(propertyName),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: t(name),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: t(name),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: t(name),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: t(name),
  /**
  A literal value.
  */
  literal,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: t(string),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: t(string),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: t(string),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: t(number),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: t(number),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: t(literal),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: t(literal),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: t(literal),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: t(literal),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: t(literal),
  /**
  A language keyword.
  */
  keyword,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: t(keyword),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: t(keyword),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: t(keyword),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: t(keyword),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: t(keyword),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: t(keyword),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: t(keyword),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: t(keyword),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: t(keyword),
  /**
  An operator.
  */
  operator,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: t(operator),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: t(operator),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: t(operator),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: t(operator),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: t(operator),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: t(operator),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: t(operator),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: t(operator),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: t(operator),
  /**
  Program or markup punctuation.
  */
  punctuation,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: t(punctuation),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: t(bracket),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: t(bracket),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: t(bracket),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: t(bracket),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: t(heading),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: t(heading),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: t(heading),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: t(heading),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: t(heading),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: t(heading),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: t(content),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: t(content),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: t(content),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: t(content),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: t(content),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: t(content),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: t(content),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: t(content),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: t(),
  /**
  Deleted text.
  */
  deleted: t(),
  /**
  Changed text.
  */
  changed: t(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: t(),
  /**
  Metadata or meta-instruction.
  */
  meta,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: t(meta),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: t(meta),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: t(meta),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Tag.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Tag.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Tag.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Tag.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Tag.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Tag.defineModifier("special")
};
for (let name2 in tags) {
  let val = tags[name2];
  if (val instanceof Tag)
    val.name = name2;
}
var classHighlighter = tagHighlighter([
  { tag: tags.link, class: "tok-link" },
  { tag: tags.heading, class: "tok-heading" },
  { tag: tags.emphasis, class: "tok-emphasis" },
  { tag: tags.strong, class: "tok-strong" },
  { tag: tags.keyword, class: "tok-keyword" },
  { tag: tags.atom, class: "tok-atom" },
  { tag: tags.bool, class: "tok-bool" },
  { tag: tags.url, class: "tok-url" },
  { tag: tags.labelName, class: "tok-labelName" },
  { tag: tags.inserted, class: "tok-inserted" },
  { tag: tags.deleted, class: "tok-deleted" },
  { tag: tags.literal, class: "tok-literal" },
  { tag: tags.string, class: "tok-string" },
  { tag: tags.number, class: "tok-number" },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
  { tag: tags.variableName, class: "tok-variableName" },
  { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
  { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
  { tag: tags.special(tags.variableName), class: "tok-variableName2" },
  { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
  { tag: tags.typeName, class: "tok-typeName" },
  { tag: tags.namespace, class: "tok-namespace" },
  { tag: tags.className, class: "tok-className" },
  { tag: tags.macroName, class: "tok-macroName" },
  { tag: tags.propertyName, class: "tok-propertyName" },
  { tag: tags.operator, class: "tok-operator" },
  { tag: tags.comment, class: "tok-comment" },
  { tag: tags.meta, class: "tok-meta" },
  { tag: tags.invalid, class: "tok-invalid" },
  { tag: tags.punctuation, class: "tok-punctuation" }
]);

// node_modules/@codemirror/language/dist/index.js
var _a;
var languageDataProp = /* @__PURE__ */ new NodeProp();
function defineLanguageFacet(baseData) {
  return Facet.define({
    combine: baseData ? (values) => values.concat(baseData) : void 0
  });
}
var sublanguageProp = /* @__PURE__ */ new NodeProp();
var Language = class {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(data, parser, extraExtensions = [], name2 = "") {
    this.data = data;
    this.name = name2;
    if (!EditorState.prototype.hasOwnProperty("tree"))
      Object.defineProperty(EditorState.prototype, "tree", { get() {
        return syntaxTree(this);
      } });
    this.parser = parser;
    this.extension = [
      language.of(this),
      EditorState.languageData.of((state, pos, side) => {
        let top2 = topNodeAt(state, pos, side), data2 = top2.type.prop(languageDataProp);
        if (!data2)
          return [];
        let base2 = state.facet(data2), sub = top2.type.prop(sublanguageProp);
        if (sub) {
          let innerNode = top2.resolve(pos - top2.from, side);
          for (let sublang of sub)
            if (sublang.test(innerNode, state)) {
              let data3 = state.facet(sublang.facet);
              return sublang.type == "replace" ? data3 : data3.concat(base2);
            }
        }
        return base2;
      })
    ].concat(extraExtensions);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(state, pos, side = -1) {
    return topNodeAt(state, pos, side).type.prop(languageDataProp) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(state) {
    let lang = state.facet(language);
    if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
      return [{ from: 0, to: state.doc.length }];
    if (!lang || !lang.allowsNesting)
      return [];
    let result = [];
    let explore = (tree, from) => {
      if (tree.prop(languageDataProp) == this.data) {
        result.push({ from, to: from + tree.length });
        return;
      }
      let mount = tree.prop(NodeProp.mounted);
      if (mount) {
        if (mount.tree.prop(languageDataProp) == this.data) {
          if (mount.overlay)
            for (let r of mount.overlay)
              result.push({ from: r.from + from, to: r.to + from });
          else
            result.push({ from, to: from + tree.length });
          return;
        } else if (mount.overlay) {
          let size = result.length;
          explore(mount.tree, mount.overlay[0].from + from);
          if (result.length > size)
            return;
        }
      }
      for (let i = 0; i < tree.children.length; i++) {
        let ch = tree.children[i];
        if (ch instanceof Tree)
          explore(ch, tree.positions[i] + from);
      }
    };
    explore(syntaxTree(state), 0);
    return result;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return true;
  }
};
Language.setState = /* @__PURE__ */ StateEffect.define();
function topNodeAt(state, pos, side) {
  let topLang = state.facet(language), tree = syntaxTree(state).topNode;
  if (!topLang || topLang.allowsNesting) {
    for (let node = tree; node; node = node.enter(pos, side, IterMode.ExcludeBuffers | IterMode.EnterBracketed))
      if (node.type.isTop)
        tree = node;
  }
  return tree;
}
function syntaxTree(state) {
  let field = state.field(Language.state, false);
  return field ? field.tree : Tree.empty;
}
var DocInput = class {
  /**
  Create an input object for the given document.
  */
  constructor(doc2) {
    this.doc = doc2;
    this.cursorPos = 0;
    this.string = "";
    this.cursor = doc2.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(pos) {
    this.string = this.cursor.next(pos - this.cursorPos).value;
    this.cursorPos = pos + this.string.length;
    return this.cursorPos - this.string.length;
  }
  chunk(pos) {
    this.syncTo(pos);
    return this.string;
  }
  get lineChunks() {
    return true;
  }
  read(from, to) {
    let stringStart = this.cursorPos - this.string.length;
    if (from < stringStart || to >= this.cursorPos)
      return this.doc.sliceString(from, to);
    else
      return this.string.slice(from - stringStart, to - stringStart);
  }
};
var currentContext = null;
var ParseContext = class _ParseContext {
  constructor(parser, state, fragments = [], tree, treeLen, viewport, skipped, scheduleOn) {
    this.parser = parser;
    this.state = state;
    this.fragments = fragments;
    this.tree = tree;
    this.treeLen = treeLen;
    this.viewport = viewport;
    this.skipped = skipped;
    this.scheduleOn = scheduleOn;
    this.parse = null;
    this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(parser, state, viewport) {
    return new _ParseContext(parser, state, [], Tree.empty, 0, viewport, [], null);
  }
  startParse() {
    return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(until, upto) {
    if (upto != null && upto >= this.state.doc.length)
      upto = void 0;
    if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
      this.takeTree();
      return true;
    }
    return this.withContext(() => {
      var _a2;
      if (typeof until == "number") {
        let endTime = Date.now() + until;
        until = () => Date.now() > endTime;
      }
      if (!this.parse)
        this.parse = this.startParse();
      if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) && upto < this.state.doc.length)
        this.parse.stopAt(upto);
      for (; ; ) {
        let done = this.parse.advance();
        if (done) {
          this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
          this.treeLen = (_a2 = this.parse.stoppedAt) !== null && _a2 !== void 0 ? _a2 : this.state.doc.length;
          this.tree = done;
          this.parse = null;
          if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
            this.parse = this.startParse();
          else
            return true;
        }
        if (until())
          return false;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let pos, tree;
    if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
      if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
        this.parse.stopAt(pos);
      this.withContext(() => {
        while (!(tree = this.parse.advance())) {
        }
      });
      this.treeLen = pos;
      this.tree = tree;
      this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
      this.parse = null;
    }
  }
  withContext(f) {
    let prev = currentContext;
    currentContext = this;
    try {
      return f();
    } finally {
      currentContext = prev;
    }
  }
  withoutTempSkipped(fragments) {
    for (let r; r = this.tempSkipped.pop(); )
      fragments = cutFragments(fragments, r.from, r.to);
    return fragments;
  }
  /**
  @internal
  */
  changes(changes, newState) {
    let { fragments, tree, treeLen, viewport, skipped } = this;
    this.takeTree();
    if (!changes.empty) {
      let ranges = [];
      changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
      fragments = TreeFragment.applyChanges(fragments, ranges);
      tree = Tree.empty;
      treeLen = 0;
      viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
      if (this.skipped.length) {
        skipped = [];
        for (let r of this.skipped) {
          let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
          if (from < to)
            skipped.push({ from, to });
        }
      }
    }
    return new _ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(viewport) {
    if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
      return false;
    this.viewport = viewport;
    let startLen = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from, to } = this.skipped[i];
      if (from < viewport.to && to > viewport.from) {
        this.fragments = cutFragments(this.fragments, from, to);
        this.skipped.splice(i--, 1);
      }
    }
    if (this.skipped.length >= startLen)
      return false;
    this.reset();
    return true;
  }
  /**
  @internal
  */
  reset() {
    if (this.parse) {
      this.takeTree();
      this.parse = null;
    }
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(from, to) {
    this.skipped.push({ from, to });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(until) {
    return new class extends Parser2 {
      createParse(input, fragments, ranges) {
        let from = ranges[0].from, to = ranges[ranges.length - 1].to;
        let parser = {
          parsedPos: from,
          advance() {
            let cx = currentContext;
            if (cx) {
              for (let r of ranges)
                cx.tempSkipped.push(r);
              if (until)
                cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
            }
            this.parsedPos = to;
            return new Tree(NodeType.none, [], [], to - from);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
        return parser;
      }
    }();
  }
  /**
  @internal
  */
  isDone(upto) {
    upto = Math.min(upto, this.state.doc.length);
    let frags = this.fragments;
    return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return currentContext;
  }
};
function cutFragments(fragments, from, to) {
  return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
}
var LanguageState = class _LanguageState {
  constructor(context) {
    this.context = context;
    this.tree = context.tree;
  }
  apply(tr) {
    if (!tr.docChanged && this.tree == this.context.tree)
      return this;
    let newCx = this.context.changes(tr.changes, tr.state);
    let upto = this.context.treeLen == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
    if (!newCx.work(20, upto))
      newCx.takeTree();
    return new _LanguageState(newCx);
  }
  static init(state) {
    let vpTo = Math.min(3e3, state.doc.length);
    let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
    if (!parseState.work(20, vpTo))
      parseState.takeTree();
    return new _LanguageState(parseState);
  }
};
Language.state = /* @__PURE__ */ StateField.define({
  create: LanguageState.init,
  update(value, tr) {
    for (let e of tr.effects)
      if (e.is(Language.setState))
        return e.value;
    if (tr.startState.facet(language) != tr.state.facet(language))
      return LanguageState.init(tr.state);
    return value.apply(tr);
  }
});
var requestIdle = (callback) => {
  let timeout = setTimeout(
    () => callback(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(timeout);
};
if (typeof requestIdleCallback != "undefined")
  requestIdle = (callback) => {
    let idle = -1, timeout = setTimeout(
      () => {
        idle = requestIdleCallback(callback, {
          timeout: 500 - 100
          /* Work.MinPause */
        });
      },
      100
      /* Work.MinPause */
    );
    return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
  };
var isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending) ? () => navigator.scheduling.isInputPending() : null;
var parseWorker = /* @__PURE__ */ ViewPlugin.fromClass(class ParseWorker {
  constructor(view) {
    this.view = view;
    this.working = null;
    this.workScheduled = 0;
    this.chunkEnd = -1;
    this.chunkBudget = -1;
    this.work = this.work.bind(this);
    this.scheduleWork();
  }
  update(update) {
    let cx = this.view.state.field(Language.state).context;
    if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
      this.scheduleWork();
    if (update.docChanged || update.selectionSet) {
      if (this.view.hasFocus)
        this.chunkBudget += 50;
      this.scheduleWork();
    }
    this.checkAsyncSchedule(cx);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state } = this.view, field = state.field(Language.state);
    if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
      this.working = requestIdle(this.work);
  }
  work(deadline) {
    this.working = null;
    let now = Date.now();
    if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
      this.chunkEnd = now + 3e4;
      this.chunkBudget = 3e3;
    }
    if (this.chunkBudget <= 0)
      return;
    let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
    if (field.tree == field.context.tree && field.context.isDone(
      vpTo + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let endTime = Date.now() + Math.min(this.chunkBudget, 100, deadline && !isInputPending ? Math.max(25, deadline.timeRemaining() - 5) : 1e9);
    let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1e3;
    let done = field.context.work(() => {
      return isInputPending && isInputPending() || Date.now() > endTime;
    }, vpTo + (viewportFirst ? 0 : 1e5));
    this.chunkBudget -= Date.now() - now;
    if (done || this.chunkBudget <= 0) {
      field.context.takeTree();
      this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
    }
    if (this.chunkBudget > 0 && !(done && !viewportFirst))
      this.scheduleWork();
    this.checkAsyncSchedule(field.context);
  }
  checkAsyncSchedule(cx) {
    if (cx.scheduleOn) {
      this.workScheduled++;
      cx.scheduleOn.then(() => this.scheduleWork()).catch((err) => logException(this.view.state, err)).then(() => this.workScheduled--);
      cx.scheduleOn = null;
    }
  }
  destroy() {
    if (this.working)
      this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
});
var language = /* @__PURE__ */ Facet.define({
  combine(languages) {
    return languages.length ? languages[0] : null;
  },
  enables: (language2) => [
    Language.state,
    parseWorker,
    EditorView.contentAttributes.compute([language2], (state) => {
      let lang = state.facet(language2);
      return lang && lang.name ? { "data-language": lang.name } : {};
    })
  ]
});
var indentService = /* @__PURE__ */ Facet.define();
var indentUnit = /* @__PURE__ */ Facet.define({
  combine: (values) => {
    if (!values.length)
      return "  ";
    let unit = values[0];
    if (!unit || /\S/.test(unit) || Array.from(unit).some((e) => e != unit[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
    return unit;
  }
});
function getIndentUnit(state) {
  let unit = state.facet(indentUnit);
  return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
}
function indentString(state, cols) {
  let result = "", ts = state.tabSize, ch = state.facet(indentUnit)[0];
  if (ch == "	") {
    while (cols >= ts) {
      result += "	";
      cols -= ts;
    }
    ch = " ";
  }
  for (let i = 0; i < cols; i++)
    result += ch;
  return result;
}
function getIndentation(context, pos) {
  if (context instanceof EditorState)
    context = new IndentContext(context);
  for (let service of context.state.facet(indentService)) {
    let result = service(context, pos);
    if (result !== void 0)
      return result;
  }
  let tree = syntaxTree(context.state);
  return tree.length >= pos ? syntaxIndentation(context, tree, pos) : null;
}
var IndentContext = class {
  /**
  Create an indent context.
  */
  constructor(state, options = {}) {
    this.state = state;
    this.options = options;
    this.unit = getIndentUnit(state);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(pos, bias = 1) {
    let line = this.state.doc.lineAt(pos);
    let { simulateBreak, simulateDoubleBreak } = this.options;
    if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
      if (simulateDoubleBreak && simulateBreak == pos)
        return { text: "", from: pos };
      else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
        return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
      else
        return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
    }
    return line;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(pos, bias = 1) {
    if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
      return "";
    let { text, from } = this.lineAt(pos, bias);
    return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
  }
  /**
  Find the column for the given position.
  */
  column(pos, bias = 1) {
    let { text, from } = this.lineAt(pos, bias);
    let result = this.countColumn(text, pos - from);
    let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
    if (override > -1)
      result += override - this.countColumn(text, text.search(/\S|$/));
    return result;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(line, pos = line.length) {
    return countColumn(line, this.state.tabSize, pos);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(pos, bias = 1) {
    let { text, from } = this.lineAt(pos, bias);
    let override = this.options.overrideIndentation;
    if (override) {
      let overriden = override(from);
      if (overriden > -1)
        return overriden;
    }
    return this.countColumn(text, text.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
};
var indentNodeProp = /* @__PURE__ */ new NodeProp();
function syntaxIndentation(cx, ast, pos) {
  let stack = ast.resolveStack(pos);
  let inner = ast.resolveInner(pos, -1).resolve(pos, 0).enterUnfinishedNodesBefore(pos);
  if (inner != stack.node) {
    let add2 = [];
    for (let cur2 = inner; cur2 && !(cur2.from < stack.node.from || cur2.to > stack.node.to || cur2.from == stack.node.from && cur2.type == stack.node.type); cur2 = cur2.parent)
      add2.push(cur2);
    for (let i = add2.length - 1; i >= 0; i--)
      stack = { node: add2[i], next: stack };
  }
  return indentFor(stack, cx, pos);
}
function indentFor(stack, cx, pos) {
  for (let cur2 = stack; cur2; cur2 = cur2.next) {
    let strategy = indentStrategy(cur2.node);
    if (strategy)
      return strategy(TreeIndentContext.create(cx, pos, cur2));
  }
  return 0;
}
function ignoreClosed(cx) {
  return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
}
function indentStrategy(tree) {
  let strategy = tree.type.prop(indentNodeProp);
  if (strategy)
    return strategy;
  let first = tree.firstChild, close;
  if (first && (close = first.type.prop(NodeProp.closedBy))) {
    let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
    return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
  }
  return tree.parent == null ? topIndent : null;
}
function topIndent() {
  return 0;
}
var TreeIndentContext = class _TreeIndentContext extends IndentContext {
  constructor(base2, pos, context) {
    super(base2.state, base2.options);
    this.base = base2;
    this.pos = pos;
    this.context = context;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(base2, pos, context) {
    return new _TreeIndentContext(base2, pos, context);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(node) {
    let line = this.state.doc.lineAt(node.from);
    for (; ; ) {
      let atBreak = node.resolve(line.from);
      while (atBreak.parent && atBreak.parent.from == atBreak.from)
        atBreak = atBreak.parent;
      if (isParent(atBreak, node))
        break;
      line = this.state.doc.lineAt(atBreak.from);
    }
    return this.lineIndent(line.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return indentFor(this.context.next, this.base, this.pos);
  }
};
function isParent(parent, of) {
  for (let cur2 = of; cur2; cur2 = cur2.parent)
    if (parent == cur2)
      return true;
  return false;
}
function bracketedAligned(context) {
  let tree = context.node;
  let openToken = tree.childAfter(tree.from), last = tree.lastChild;
  if (!openToken)
    return null;
  let sim = context.options.simulateBreak;
  let openLine = context.state.doc.lineAt(openToken.from);
  let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
  for (let pos = openToken.to; ; ) {
    let next = tree.childAfter(pos);
    if (!next || next == last)
      return null;
    if (!next.type.isSkipped) {
      if (next.from >= lineEnd)
        return null;
      let space = /^ */.exec(openLine.text.slice(openToken.to - openLine.from))[0].length;
      return { from: openToken.from, to: openToken.to + space };
    }
    pos = next.to;
  }
}
function delimitedStrategy(context, align, units, closing2, closedAt) {
  let after = context.textAfter, space = after.match(/^\s*/)[0].length;
  let closed = closing2 && after.slice(space, space + closing2.length) == closing2 || closedAt == context.pos + space;
  let aligned = align ? bracketedAligned(context) : null;
  if (aligned)
    return closed ? context.column(aligned.from) : context.column(aligned.to);
  return context.baseIndent + (closed ? 0 : context.unit * units);
}
var DontIndentBeyond = 200;
function indentOnInput() {
  return EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged || !tr.isUserEvent("input.type") && !tr.isUserEvent("input.complete"))
      return tr;
    let rules = tr.startState.languageDataAt("indentOnInput", tr.startState.selection.main.head);
    if (!rules.length)
      return tr;
    let doc2 = tr.newDoc, { head } = tr.newSelection.main, line = doc2.lineAt(head);
    if (head > line.from + DontIndentBeyond)
      return tr;
    let lineStart = doc2.sliceString(line.from, head);
    if (!rules.some((r) => r.test(lineStart)))
      return tr;
    let { state } = tr, last = -1, changes = [];
    for (let { head: head2 } of state.selection.ranges) {
      let line2 = state.doc.lineAt(head2);
      if (line2.from == last)
        continue;
      last = line2.from;
      let indent = getIndentation(state, line2.from);
      if (indent == null)
        continue;
      let cur2 = /^\s*/.exec(line2.text)[0];
      let norm = indentString(state, indent);
      if (cur2 != norm)
        changes.push({ from: line2.from, to: line2.from + cur2.length, insert: norm });
    }
    return changes.length ? [tr, { changes, sequential: true }] : tr;
  });
}
var HighlightStyle = class _HighlightStyle {
  constructor(specs, options) {
    this.specs = specs;
    let modSpec;
    function def(spec) {
      let cls = StyleModule.newName();
      (modSpec || (modSpec = /* @__PURE__ */ Object.create(null)))["." + cls] = spec;
      return cls;
    }
    const all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : void 0;
    const scopeOpt = options.scope;
    this.scope = scopeOpt instanceof Language ? (type) => type.prop(languageDataProp) == scopeOpt.data : scopeOpt ? (type) => type == scopeOpt : void 0;
    this.style = tagHighlighter(specs.map((style) => ({
      tag: style.tag,
      class: style.class || def(Object.assign({}, style, { tag: null }))
    })), {
      all
    }).style;
    this.module = modSpec ? new StyleModule(modSpec) : null;
    this.themeType = options.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(specs, options) {
    return new _HighlightStyle(specs, options || {});
  }
};
var highlighterFacet = /* @__PURE__ */ Facet.define();
var fallbackHighlighter = /* @__PURE__ */ Facet.define({
  combine(values) {
    return values.length ? [values[0]] : null;
  }
});
function getHighlighters(state) {
  let main = state.facet(highlighterFacet);
  return main.length ? main : state.facet(fallbackHighlighter);
}
function syntaxHighlighting(highlighter, options) {
  let ext = [treeHighlighter], themeType;
  if (highlighter instanceof HighlightStyle) {
    if (highlighter.module)
      ext.push(EditorView.styleModule.of(highlighter.module));
    themeType = highlighter.themeType;
  }
  if (options === null || options === void 0 ? void 0 : options.fallback)
    ext.push(fallbackHighlighter.of(highlighter));
  else if (themeType)
    ext.push(highlighterFacet.computeN([EditorView.darkTheme], (state) => {
      return state.facet(EditorView.darkTheme) == (themeType == "dark") ? [highlighter] : [];
    }));
  else
    ext.push(highlighterFacet.of(highlighter));
  return ext;
}
var TreeHighlighter = class {
  constructor(view) {
    this.markCache = /* @__PURE__ */ Object.create(null);
    this.tree = syntaxTree(view.state);
    this.decorations = this.buildDeco(view, getHighlighters(view.state));
    this.decoratedTo = view.viewport.to;
  }
  update(update) {
    let tree = syntaxTree(update.state), highlighters = getHighlighters(update.state);
    let styleChange = highlighters != getHighlighters(update.startState);
    let { viewport } = update.view, decoratedToMapped = update.changes.mapPos(this.decoratedTo, 1);
    if (tree.length < viewport.to && !styleChange && tree.type == this.tree.type && decoratedToMapped >= viewport.to) {
      this.decorations = this.decorations.map(update.changes);
      this.decoratedTo = decoratedToMapped;
    } else if (tree != this.tree || update.viewportChanged || styleChange) {
      this.tree = tree;
      this.decorations = this.buildDeco(update.view, highlighters);
      this.decoratedTo = viewport.to;
    }
  }
  buildDeco(view, highlighters) {
    if (!highlighters || !this.tree.length)
      return Decoration.none;
    let builder = new RangeSetBuilder();
    for (let { from, to } of view.visibleRanges) {
      highlightTree(this.tree, highlighters, (from2, to2, style) => {
        builder.add(from2, to2, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
      }, from, to);
    }
    return builder.finish();
  }
};
var treeHighlighter = /* @__PURE__ */ Prec.high(/* @__PURE__ */ ViewPlugin.fromClass(TreeHighlighter, {
  decorations: (v) => v.decorations
}));
var defaultHighlightStyle = /* @__PURE__ */ HighlightStyle.define([
  {
    tag: tags.meta,
    color: "#404740"
  },
  {
    tag: tags.link,
    textDecoration: "underline"
  },
  {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic"
  },
  {
    tag: tags.strong,
    fontWeight: "bold"
  },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: tags.keyword,
    color: "#708"
  },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: "#219"
  },
  {
    tag: [tags.literal, tags.inserted],
    color: "#164"
  },
  {
    tag: [tags.string, tags.deleted],
    color: "#a11"
  },
  {
    tag: [tags.regexp, tags.escape, /* @__PURE__ */ tags.special(tags.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ tags.definition(tags.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ tags.local(tags.variableName),
    color: "#30a"
  },
  {
    tag: [tags.typeName, tags.namespace],
    color: "#085"
  },
  {
    tag: tags.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ tags.special(tags.variableName), tags.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ tags.definition(tags.propertyName),
    color: "#00c"
  },
  {
    tag: tags.comment,
    color: "#940"
  },
  {
    tag: tags.invalid,
    color: "#f00"
  }
]);
var baseTheme2 = /* @__PURE__ */ EditorView.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
});
var DefaultScanDist = 1e4;
var DefaultBrackets = "()[]{}";
var bracketMatchingConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      afterCursor: true,
      brackets: DefaultBrackets,
      maxScanDistance: DefaultScanDist,
      renderMatch: defaultRenderMatch
    });
  }
});
var matchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-matchingBracket" });
var nonmatchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-nonmatchingBracket" });
function defaultRenderMatch(match) {
  let decorations2 = [];
  let mark = match.matched ? matchingMark : nonmatchingMark;
  decorations2.push(mark.range(match.start.from, match.start.to));
  if (match.end)
    decorations2.push(mark.range(match.end.from, match.end.to));
  return decorations2;
}
function bracketDeco(state) {
  let decorations2 = [];
  let config2 = state.facet(bracketMatchingConfig);
  for (let range of state.selection.ranges) {
    if (!range.empty)
      continue;
    let match = matchBrackets(state, range.head, -1, config2) || range.head > 0 && matchBrackets(state, range.head - 1, 1, config2) || config2.afterCursor && (matchBrackets(state, range.head, 1, config2) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1, config2));
    if (match)
      decorations2 = decorations2.concat(config2.renderMatch(match, state));
  }
  return Decoration.set(decorations2, true);
}
var bracketMatcher = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.paused = false;
    this.decorations = bracketDeco(view.state);
  }
  update(update) {
    if (update.docChanged || update.selectionSet || this.paused) {
      if (update.view.composing) {
        this.decorations = this.decorations.map(update.changes);
        this.paused = true;
      } else {
        this.decorations = bracketDeco(update.state);
        this.paused = false;
      }
    }
  }
}, {
  decorations: (v) => v.decorations
});
var bracketMatchingUnique = [
  bracketMatcher,
  baseTheme2
];
function bracketMatching(config2 = {}) {
  return [bracketMatchingConfig.of(config2), bracketMatchingUnique];
}
var bracketMatchingHandle = /* @__PURE__ */ new NodeProp();
function matchingNodes(node, dir, brackets) {
  let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
  if (byProp)
    return byProp;
  if (node.name.length == 1) {
    let index = brackets.indexOf(node.name);
    if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
      return [brackets[index + dir]];
  }
  return null;
}
function findHandle(node) {
  let hasHandle = node.type.prop(bracketMatchingHandle);
  return hasHandle ? hasHandle(node.node) : node;
}
function matchBrackets(state, pos, dir, config2 = {}) {
  let maxScanDistance = config2.maxScanDistance || DefaultScanDist, brackets = config2.brackets || DefaultBrackets;
  let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
  for (let cur2 = node; cur2; cur2 = cur2.parent) {
    let matches = matchingNodes(cur2.type, dir, brackets);
    if (matches && cur2.from < cur2.to) {
      let handle = findHandle(cur2);
      if (handle && (dir > 0 ? pos >= handle.from && pos < handle.to : pos > handle.from && pos <= handle.to))
        return matchMarkedBrackets(state, pos, dir, cur2, handle, matches, brackets);
    }
  }
  return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
}
function matchMarkedBrackets(_state, _pos, dir, token, handle, matching, brackets) {
  let parent = token.parent, firstToken = { from: handle.from, to: handle.to };
  let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
  if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
    do {
      if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
        if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
          let endHandle = findHandle(cursor);
          return { start: firstToken, end: endHandle ? { from: endHandle.from, to: endHandle.to } : void 0, matched: true };
        } else if (matchingNodes(cursor.type, dir, brackets)) {
          depth++;
        } else if (matchingNodes(cursor.type, -dir, brackets)) {
          if (depth == 0) {
            let endHandle = findHandle(cursor);
            return {
              start: firstToken,
              end: endHandle && endHandle.from < endHandle.to ? { from: endHandle.from, to: endHandle.to } : void 0,
              matched: false
            };
          }
          depth--;
        }
      }
    } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
  return { start: firstToken, matched: false };
}
function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
  if (dir < 0 ? !pos : pos == state.doc.length)
    return null;
  let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
  let bracket2 = brackets.indexOf(startCh);
  if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
    return null;
  let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
  let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
  for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
    let text = iter.value;
    if (dir < 0)
      distance += text.length;
    let basePos = pos + distance * dir;
    for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
      let found = brackets.indexOf(text[pos2]);
      if (found < 0 || tree.resolveInner(basePos + pos2, 1).type != tokenType)
        continue;
      if (found % 2 == 0 == dir > 0) {
        depth++;
      } else if (depth == 1) {
        return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
      } else {
        depth--;
      }
    }
    if (dir > 0)
      distance += text.length;
  }
  return iter.done ? { start: startToken, matched: false } : null;
}
function countCol(string2, end, tabSize, startIndex = 0, startValue = 0) {
  if (end == null) {
    end = string2.search(/[^\s\u00a0]/);
    if (end == -1)
      end = string2.length;
  }
  let n = startValue;
  for (let i = startIndex; i < end; i++) {
    if (string2.charCodeAt(i) == 9)
      n += tabSize - n % tabSize;
    else
      n++;
  }
  return n;
}
var StringStream = class {
  /**
  Create a stream.
  */
  constructor(string2, tabSize, indentUnit2, overrideIndent) {
    this.string = string2;
    this.tabSize = tabSize;
    this.indentUnit = indentUnit2;
    this.overrideIndent = overrideIndent;
    this.pos = 0;
    this.start = 0;
    this.lastColumnPos = 0;
    this.lastColumnValue = 0;
  }
  /**
  True if we are at the end of the line.
  */
  eol() {
    return this.pos >= this.string.length;
  }
  /**
  True if we are at the start of the line.
  */
  sol() {
    return this.pos == 0;
  }
  /**
  Get the next code unit after the current position, or undefined
  if we're at the end of the line.
  */
  peek() {
    return this.string.charAt(this.pos) || void 0;
  }
  /**
  Read the next code unit and advance `this.pos`.
  */
  next() {
    if (this.pos < this.string.length)
      return this.string.charAt(this.pos++);
  }
  /**
  Match the next character against the given string, regular
  expression, or predicate. Consume and return it if it matches.
  */
  eat(match) {
    let ch = this.string.charAt(this.pos);
    let ok;
    if (typeof match == "string")
      ok = ch == match;
    else
      ok = ch && (match instanceof RegExp ? match.test(ch) : match(ch));
    if (ok) {
      ++this.pos;
      return ch;
    }
  }
  /**
  Continue matching characters that match the given string,
  regular expression, or predicate function. Return true if any
  characters were consumed.
  */
  eatWhile(match) {
    let start = this.pos;
    while (this.eat(match)) {
    }
    return this.pos > start;
  }
  /**
  Consume whitespace ahead of `this.pos`. Return true if any was
  found.
  */
  eatSpace() {
    let start = this.pos;
    while (/[\s\u00a0]/.test(this.string.charAt(this.pos)))
      ++this.pos;
    return this.pos > start;
  }
  /**
  Move to the end of the line.
  */
  skipToEnd() {
    this.pos = this.string.length;
  }
  /**
  Move to directly before the given character, if found on the
  current line.
  */
  skipTo(ch) {
    let found = this.string.indexOf(ch, this.pos);
    if (found > -1) {
      this.pos = found;
      return true;
    }
  }
  /**
  Move back `n` characters.
  */
  backUp(n) {
    this.pos -= n;
  }
  /**
  Get the column position at `this.pos`.
  */
  column() {
    if (this.lastColumnPos < this.start) {
      this.lastColumnValue = countCol(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
      this.lastColumnPos = this.start;
    }
    return this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var _a2;
    return (_a2 = this.overrideIndent) !== null && _a2 !== void 0 ? _a2 : countCol(this.string, null, this.tabSize);
  }
  /**
  Match the input against the given string or regular expression
  (which should start with a `^`). Return true or the regexp match
  if it matches.
  
  Unless `consume` is set to `false`, this will move `this.pos`
  past the matched text.
  
  When matching a string `caseInsensitive` can be set to true to
  make the match case-insensitive.
  */
  match(pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      let cased = (str2) => caseInsensitive ? str2.toLowerCase() : str2;
      let substr = this.string.substr(this.pos, pattern.length);
      if (cased(substr) == cased(pattern)) {
        if (consume !== false)
          this.pos += pattern.length;
        return true;
      } else
        return null;
    } else {
      let match = this.string.slice(this.pos).match(pattern);
      if (match && match.index > 0)
        return null;
      if (match && consume !== false)
        this.pos += match[0].length;
      return match;
    }
  }
  /**
  Get the current token.
  */
  current() {
    return this.string.slice(this.start, this.pos);
  }
};
function fullParser(spec) {
  return {
    name: spec.name || "",
    token: spec.token,
    blankLine: spec.blankLine || (() => {
    }),
    startState: spec.startState || (() => true),
    copyState: spec.copyState || defaultCopyState,
    indent: spec.indent || (() => null),
    languageData: spec.languageData || {},
    tokenTable: spec.tokenTable || noTokens,
    mergeTokens: spec.mergeTokens !== false
  };
}
function defaultCopyState(state) {
  if (typeof state != "object")
    return state;
  let newState = {};
  for (let prop in state) {
    let val = state[prop];
    newState[prop] = val instanceof Array ? val.slice() : val;
  }
  return newState;
}
var IndentedFrom = /* @__PURE__ */ new WeakMap();
var StreamLanguage = class _StreamLanguage extends Language {
  constructor(parser) {
    let data = defineLanguageFacet(parser.languageData);
    let p = fullParser(parser), self;
    let impl = new class extends Parser2 {
      createParse(input, fragments, ranges) {
        return new Parse(self, input, fragments, ranges);
      }
    }();
    super(data, impl, [], parser.name);
    this.topNode = docID(data, this);
    self = this;
    this.streamParser = p;
    this.stateAfter = new NodeProp({ perNode: true });
    this.tokenTable = parser.tokenTable ? new TokenTable(p.tokenTable) : defaultTokenTable;
  }
  /**
  Define a stream language.
  */
  static define(spec) {
    return new _StreamLanguage(spec);
  }
  /**
  @internal
  */
  getIndent(cx) {
    let from = void 0;
    let { overrideIndentation } = cx.options;
    if (overrideIndentation) {
      from = IndentedFrom.get(cx.state);
      if (from != null && from < cx.pos - 1e4)
        from = void 0;
    }
    let start = findState(this, cx.node.tree, cx.node.from, cx.node.from, from !== null && from !== void 0 ? from : cx.pos), statePos, state;
    if (start) {
      state = start.state;
      statePos = start.pos + 1;
    } else {
      state = this.streamParser.startState(cx.unit);
      statePos = cx.node.from;
    }
    if (cx.pos - statePos > 1e4)
      return null;
    while (statePos < cx.pos) {
      let line2 = cx.state.doc.lineAt(statePos), end = Math.min(cx.pos, line2.to);
      if (line2.length) {
        let indentation = overrideIndentation ? overrideIndentation(line2.from) : -1;
        let stream = new StringStream(line2.text, cx.state.tabSize, cx.unit, indentation < 0 ? void 0 : indentation);
        while (stream.pos < end - line2.from)
          readToken(this.streamParser.token, stream, state);
      } else {
        this.streamParser.blankLine(state, cx.unit);
      }
      if (end == cx.pos)
        break;
      statePos = line2.to + 1;
    }
    let line = cx.lineAt(cx.pos);
    if (overrideIndentation && from == null)
      IndentedFrom.set(cx.state, line.from);
    return this.streamParser.indent(state, /^\s*(.*)/.exec(line.text)[1], cx);
  }
  get allowsNesting() {
    return false;
  }
};
function findState(lang, tree, off, startPos, before) {
  let state = off >= startPos && off + tree.length <= before && tree.prop(lang.stateAfter);
  if (state)
    return { state: lang.streamParser.copyState(state), pos: off + tree.length };
  for (let i = tree.children.length - 1; i >= 0; i--) {
    let child = tree.children[i], pos = off + tree.positions[i];
    let found = child instanceof Tree && pos < before && findState(lang, child, pos, startPos, before);
    if (found)
      return found;
  }
  return null;
}
function cutTree(lang, tree, from, to, inside) {
  if (inside && from <= 0 && to >= tree.length)
    return tree;
  if (!inside && from == 0 && tree.type == lang.topNode)
    inside = true;
  for (let i = tree.children.length - 1; i >= 0; i--) {
    let pos = tree.positions[i], child = tree.children[i], inner;
    if (pos < to && child instanceof Tree) {
      if (!(inner = cutTree(lang, child, from - pos, to - pos, inside)))
        break;
      return !inside ? inner : new Tree(tree.type, tree.children.slice(0, i).concat(inner), tree.positions.slice(0, i + 1), pos + inner.length);
    }
  }
  return null;
}
function findStartInFragments(lang, fragments, startPos, endPos, editorState) {
  for (let f of fragments) {
    let from = f.from + (f.openStart ? 25 : 0), to = f.to - (f.openEnd ? 25 : 0);
    let found = from <= startPos && to > startPos && findState(lang, f.tree, 0 - f.offset, startPos, to), tree;
    if (found && found.pos <= endPos && (tree = cutTree(lang, f.tree, startPos + f.offset, found.pos + f.offset, false)))
      return { state: found.state, tree };
  }
  return { state: lang.streamParser.startState(editorState ? getIndentUnit(editorState) : 4), tree: Tree.empty };
}
var Parse = class {
  constructor(lang, input, fragments, ranges) {
    this.lang = lang;
    this.input = input;
    this.fragments = fragments;
    this.ranges = ranges;
    this.stoppedAt = null;
    this.chunks = [];
    this.chunkPos = [];
    this.chunk = [];
    this.chunkReused = void 0;
    this.rangeIndex = 0;
    this.to = ranges[ranges.length - 1].to;
    let context = ParseContext.get(), from = ranges[0].from;
    let { state, tree } = findStartInFragments(lang, fragments, from, this.to, context === null || context === void 0 ? void 0 : context.state);
    this.state = state;
    this.parsedPos = this.chunkStart = from + tree.length;
    for (let i = 0; i < tree.children.length; i++) {
      this.chunks.push(tree.children[i]);
      this.chunkPos.push(tree.positions[i]);
    }
    if (context && this.parsedPos < context.viewport.from - 1e5 && ranges.some((r) => r.from <= context.viewport.from && r.to >= context.viewport.from)) {
      this.state = this.lang.streamParser.startState(getIndentUnit(context.state));
      context.skipUntilInView(this.parsedPos, context.viewport.from);
      this.parsedPos = context.viewport.from;
    }
    this.moveRangeIndex();
  }
  advance() {
    let context = ParseContext.get();
    let parseEnd = this.stoppedAt == null ? this.to : Math.min(this.to, this.stoppedAt);
    let end = Math.min(
      parseEnd,
      this.chunkStart + 512
      /* C.ChunkSize */
    );
    if (context)
      end = Math.min(end, context.viewport.to);
    while (this.parsedPos < end)
      this.parseLine(context);
    if (this.chunkStart < this.parsedPos)
      this.finishChunk();
    if (this.parsedPos >= parseEnd)
      return this.finish();
    if (context && this.parsedPos >= context.viewport.to) {
      context.skipUntilInView(this.parsedPos, parseEnd);
      return this.finish();
    }
    return null;
  }
  stopAt(pos) {
    this.stoppedAt = pos;
  }
  lineAfter(pos) {
    let chunk = this.input.chunk(pos);
    if (!this.input.lineChunks) {
      let eol = chunk.indexOf("\n");
      if (eol > -1)
        chunk = chunk.slice(0, eol);
    } else if (chunk == "\n") {
      chunk = "";
    }
    return pos + chunk.length <= this.to ? chunk : chunk.slice(0, this.to - pos);
  }
  nextLine() {
    let from = this.parsedPos, line = this.lineAfter(from), end = from + line.length;
    for (let index = this.rangeIndex; ; ) {
      let rangeEnd2 = this.ranges[index].to;
      if (rangeEnd2 >= end)
        break;
      line = line.slice(0, rangeEnd2 - (end - line.length));
      index++;
      if (index == this.ranges.length)
        break;
      let rangeStart = this.ranges[index].from;
      let after = this.lineAfter(rangeStart);
      line += after;
      end = rangeStart + after.length;
    }
    return { line, end };
  }
  skipGapsTo(pos, offset, side) {
    for (; ; ) {
      let end = this.ranges[this.rangeIndex].to, offPos = pos + offset;
      if (side > 0 ? end > offPos : end >= offPos)
        break;
      let start = this.ranges[++this.rangeIndex].from;
      offset += start - end;
    }
    return offset;
  }
  moveRangeIndex() {
    while (this.ranges[this.rangeIndex].to < this.parsedPos)
      this.rangeIndex++;
  }
  emitToken(id, from, to, offset) {
    let size = 4;
    if (this.ranges.length > 1) {
      offset = this.skipGapsTo(from, offset, 1);
      from += offset;
      let len0 = this.chunk.length;
      offset = this.skipGapsTo(to, offset, -1);
      to += offset;
      size += this.chunk.length - len0;
    }
    let last = this.chunk.length - 4;
    if (this.lang.streamParser.mergeTokens && size == 4 && last >= 0 && this.chunk[last] == id && this.chunk[last + 2] == from)
      this.chunk[last + 2] = to;
    else
      this.chunk.push(id, from, to, size);
    return offset;
  }
  parseLine(context) {
    let { line, end } = this.nextLine(), offset = 0, { streamParser } = this.lang;
    let stream = new StringStream(line, context ? context.state.tabSize : 4, context ? getIndentUnit(context.state) : 2);
    if (stream.eol()) {
      streamParser.blankLine(this.state, stream.indentUnit);
    } else {
      while (!stream.eol()) {
        let token = readToken(streamParser.token, stream, this.state);
        if (token)
          offset = this.emitToken(this.lang.tokenTable.resolve(token), this.parsedPos + stream.start, this.parsedPos + stream.pos, offset);
        if (stream.start > 1e4)
          break;
      }
    }
    this.parsedPos = end;
    this.moveRangeIndex();
    if (this.parsedPos < this.to)
      this.parsedPos++;
  }
  finishChunk() {
    let tree = Tree.build({
      buffer: this.chunk,
      start: this.chunkStart,
      length: this.parsedPos - this.chunkStart,
      nodeSet,
      topID: 0,
      maxBufferLength: 512,
      reused: this.chunkReused
    });
    tree = new Tree(tree.type, tree.children, tree.positions, tree.length, [[this.lang.stateAfter, this.lang.streamParser.copyState(this.state)]]);
    this.chunks.push(tree);
    this.chunkPos.push(this.chunkStart - this.ranges[0].from);
    this.chunk = [];
    this.chunkReused = void 0;
    this.chunkStart = this.parsedPos;
  }
  finish() {
    return new Tree(this.lang.topNode, this.chunks, this.chunkPos, this.parsedPos - this.ranges[0].from).balance();
  }
};
function readToken(token, stream, state) {
  stream.start = stream.pos;
  for (let i = 0; i < 10; i++) {
    let result = token(stream, state);
    if (stream.pos > stream.start)
      return result;
  }
  throw new Error("Stream parser failed to advance stream.");
}
var noTokens = /* @__PURE__ */ Object.create(null);
var typeArray = [NodeType.none];
var nodeSet = /* @__PURE__ */ new NodeSet(typeArray);
var warned = [];
var byTag = /* @__PURE__ */ Object.create(null);
var defaultTable = /* @__PURE__ */ Object.create(null);
for (let [legacyName, name2] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  defaultTable[legacyName] = /* @__PURE__ */ createTokenType(noTokens, name2);
var TokenTable = class {
  constructor(extra) {
    this.extra = extra;
    this.table = Object.assign(/* @__PURE__ */ Object.create(null), defaultTable);
  }
  resolve(tag) {
    return !tag ? 0 : this.table[tag] || (this.table[tag] = createTokenType(this.extra, tag));
  }
};
var defaultTokenTable = /* @__PURE__ */ new TokenTable(noTokens);
function warnForPart(part, msg) {
  if (warned.indexOf(part) > -1)
    return;
  warned.push(part);
  console.warn(msg);
}
function createTokenType(extra, tagStr) {
  let tags$1 = [];
  for (let name3 of tagStr.split(" ")) {
    let found = [];
    for (let part of name3.split(".")) {
      let value = extra[part] || tags[part];
      if (!value) {
        warnForPart(part, `Unknown highlighting tag ${part}`);
      } else if (typeof value == "function") {
        if (!found.length)
          warnForPart(part, `Modifier ${part} used at start of tag`);
        else
          found = found.map(value);
      } else {
        if (found.length)
          warnForPart(part, `Tag ${part} used as modifier`);
        else
          found = Array.isArray(value) ? value : [value];
      }
    }
    for (let tag of found)
      tags$1.push(tag);
  }
  if (!tags$1.length)
    return 0;
  let name2 = tagStr.replace(/ /g, "_"), key = name2 + " " + tags$1.map((t2) => t2.id);
  let known = byTag[key];
  if (known)
    return known.id;
  let type = byTag[key] = NodeType.define({
    id: typeArray.length,
    name: name2,
    props: [styleTags({ [name2]: tags$1 })]
  });
  typeArray.push(type);
  return type.id;
}
function docID(data, lang) {
  let type = NodeType.define({ id: typeArray.length, name: "Document", props: [
    languageDataProp.add(() => data),
    indentNodeProp.add(() => (cx) => lang.getIndent(cx))
  ], top: true });
  typeArray.push(type);
  return type;
}
var marks = {
  rtl: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "rtl" }, bidiIsolate: Direction.RTL }),
  ltr: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "ltr" }, bidiIsolate: Direction.LTR }),
  auto: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "auto" }, bidiIsolate: null })
};

// node_modules/@codemirror/commands/dist/index.js
var toggleComment = (target) => {
  let { state } = target, line = state.doc.lineAt(state.selection.main.from), config2 = getConfig(target.state, line.from);
  return config2.line ? toggleLineComment(target) : config2.block ? toggleBlockCommentByLine(target) : false;
};
function command(f, option) {
  return ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let tr = f(option, state);
    if (!tr)
      return false;
    dispatch(state.update(tr));
    return true;
  };
}
var toggleLineComment = /* @__PURE__ */ command(
  changeLineComment,
  0
  /* CommentOption.Toggle */
);
var toggleBlockComment = /* @__PURE__ */ command(
  changeBlockComment,
  0
  /* CommentOption.Toggle */
);
var toggleBlockCommentByLine = /* @__PURE__ */ command(
  (o, s) => changeBlockComment(o, s, selectedLineRanges(s)),
  0
  /* CommentOption.Toggle */
);
function getConfig(state, pos) {
  let data = state.languageDataAt("commentTokens", pos, 1);
  return data.length ? data[0] : {};
}
var SearchMargin = 50;
function findBlockComment(state, { open, close }, from, to) {
  let textBefore = state.sliceDoc(from - SearchMargin, from);
  let textAfter = state.sliceDoc(to, to + SearchMargin);
  let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
  let beforeOff = textBefore.length - spaceBefore;
  if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
    return {
      open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
      close: { pos: to + spaceAfter, margin: spaceAfter && 1 }
    };
  }
  let startText, endText;
  if (to - from <= 2 * SearchMargin) {
    startText = endText = state.sliceDoc(from, to);
  } else {
    startText = state.sliceDoc(from, from + SearchMargin);
    endText = state.sliceDoc(to - SearchMargin, to);
  }
  let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
  let endOff = endText.length - endSpace - close.length;
  if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
    return {
      open: {
        pos: from + startSpace + open.length,
        margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
      },
      close: {
        pos: to - endSpace - close.length,
        margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
      }
    };
  }
  return null;
}
function selectedLineRanges(state) {
  let ranges = [];
  for (let r of state.selection.ranges) {
    let fromLine = state.doc.lineAt(r.from);
    let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
    if (toLine.from > fromLine.from && toLine.from == r.to)
      toLine = r.to == fromLine.to + 1 ? fromLine : state.doc.lineAt(r.to - 1);
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last].to > fromLine.from)
      ranges[last].to = toLine.to;
    else
      ranges.push({ from: fromLine.from + /^\s*/.exec(fromLine.text)[0].length, to: toLine.to });
  }
  return ranges;
}
function changeBlockComment(option, state, ranges = state.selection.ranges) {
  let tokens = ranges.map((r) => getConfig(state, r.from).block);
  if (!tokens.every((c) => c))
    return null;
  let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
  if (option != 2 && !comments.every((c) => c)) {
    return { changes: state.changes(ranges.map((range, i) => {
      if (comments[i])
        return [];
      return [{ from: range.from, insert: tokens[i].open + " " }, { from: range.to, insert: " " + tokens[i].close }];
    })) };
  } else if (option != 1 && comments.some((c) => c)) {
    let changes = [];
    for (let i = 0, comment2; i < comments.length; i++)
      if (comment2 = comments[i]) {
        let token = tokens[i], { open, close } = comment2;
        changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
      }
    return { changes };
  }
  return null;
}
function changeLineComment(option, state, ranges = state.selection.ranges) {
  let lines = [];
  let prevLine = -1;
  ranges: for (let { from, to } of ranges) {
    let startI = lines.length, minIndent = 1e9, token;
    for (let pos = from; pos <= to; ) {
      let line = state.doc.lineAt(pos);
      if (token == void 0) {
        token = getConfig(state, line.from).line;
        if (!token)
          continue ranges;
      }
      if (line.from > prevLine && (from == to || to > line.from)) {
        prevLine = line.from;
        let indent = /^\s*/.exec(line.text)[0].length;
        let empty = indent == line.length;
        let comment2 = line.text.slice(indent, indent + token.length) == token ? indent : -1;
        if (indent < line.text.length && indent < minIndent)
          minIndent = indent;
        lines.push({ line, comment: comment2, token, indent, empty, single: false });
      }
      pos = line.to + 1;
    }
    if (minIndent < 1e9) {
      for (let i = startI; i < lines.length; i++)
        if (lines[i].indent < lines[i].line.text.length)
          lines[i].indent = minIndent;
    }
    if (lines.length == startI + 1)
      lines[startI].single = true;
  }
  if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
    let changes = [];
    for (let { line, token, indent, empty, single } of lines)
      if (single || !empty)
        changes.push({ from: line.from + indent, insert: token + " " });
    let changeSet = state.changes(changes);
    return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
  } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
    let changes = [];
    for (let { line, comment: comment2, token } of lines)
      if (comment2 >= 0) {
        let from = line.from + comment2, to = from + token.length;
        if (line.text[to - line.from] == " ")
          to++;
        changes.push({ from, to });
      }
    return { changes };
  }
  return null;
}
var fromHistory = /* @__PURE__ */ Annotation.define();
var isolateHistory = /* @__PURE__ */ Annotation.define();
var invertedEffects = /* @__PURE__ */ Facet.define();
var historyConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (_t, isAdjacent2) => isAdjacent2
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (a, b) => (tr, adj) => a(tr, adj) || b(tr, adj)
    });
  }
});
var historyField_ = /* @__PURE__ */ StateField.define({
  create() {
    return HistoryState.empty;
  },
  update(state, tr) {
    let config2 = tr.state.facet(historyConfig);
    let fromHist = tr.annotation(fromHistory);
    if (fromHist) {
      let item = HistEvent.fromTransaction(tr, fromHist.selection), from = fromHist.side;
      let other = from == 0 ? state.undone : state.done;
      if (item)
        other = updateBranch(other, other.length, config2.minDepth, item);
      else
        other = addSelection(other, tr.startState.selection);
      return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
    }
    let isolate = tr.annotation(isolateHistory);
    if (isolate == "full" || isolate == "before")
      state = state.isolate();
    if (tr.annotation(Transaction.addToHistory) === false)
      return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
    let event = HistEvent.fromTransaction(tr);
    let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
    if (event)
      state = state.addChanges(event, time, userEvent, config2, tr);
    else if (tr.selection)
      state = state.addSelection(tr.startState.selection, time, userEvent, config2.newGroupDelay);
    if (isolate == "full" || isolate == "after")
      state = state.isolate();
    return state;
  },
  toJSON(value) {
    return { done: value.done.map((e) => e.toJSON()), undone: value.undone.map((e) => e.toJSON()) };
  },
  fromJSON(json) {
    return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
  }
});
function history(config2 = {}) {
  return [
    historyField_,
    historyConfig.of(config2),
    EditorView.domEventHandlers({
      beforeinput(e, view) {
        let command2 = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
        if (!command2)
          return false;
        e.preventDefault();
        return command2(view);
      }
    })
  ];
}
function cmd(side, selection) {
  return function({ state, dispatch }) {
    if (!selection && state.readOnly)
      return false;
    let historyState = state.field(historyField_, false);
    if (!historyState)
      return false;
    let tr = historyState.pop(side, state, selection);
    if (!tr)
      return false;
    dispatch(tr);
    return true;
  };
}
var undo = /* @__PURE__ */ cmd(0, false);
var redo = /* @__PURE__ */ cmd(1, false);
var undoSelection = /* @__PURE__ */ cmd(0, true);
var redoSelection = /* @__PURE__ */ cmd(1, true);
var HistEvent = class _HistEvent {
  constructor(changes, effects, mapped, startSelection, selectionsAfter) {
    this.changes = changes;
    this.effects = effects;
    this.mapped = mapped;
    this.startSelection = startSelection;
    this.selectionsAfter = selectionsAfter;
  }
  setSelAfter(after) {
    return new _HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
  }
  toJSON() {
    var _a2, _b, _c;
    return {
      changes: (_a2 = this.changes) === null || _a2 === void 0 ? void 0 : _a2.toJSON(),
      mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
      startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(json) {
    return new _HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(tr, selection) {
    let effects = none2;
    for (let invert of tr.startState.facet(invertedEffects)) {
      let result = invert(tr);
      if (result.length)
        effects = effects.concat(result);
    }
    if (!effects.length && tr.changes.empty)
      return null;
    return new _HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection || tr.startState.selection, none2);
  }
  static selection(selections) {
    return new _HistEvent(void 0, none2, void 0, void 0, selections);
  }
};
function updateBranch(branch, to, maxLen, newEvent) {
  let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
  let newBranch = branch.slice(start, to);
  newBranch.push(newEvent);
  return newBranch;
}
function isAdjacent(a, b) {
  let ranges = [], isAdjacent2 = false;
  a.iterChangedRanges((f, t2) => ranges.push(f, t2));
  b.iterChangedRanges((_f, _t, f, t2) => {
    for (let i = 0; i < ranges.length; ) {
      let from = ranges[i++], to = ranges[i++];
      if (t2 >= from && f <= to)
        isAdjacent2 = true;
    }
  });
  return isAdjacent2;
}
function eqSelectionShape(a, b) {
  return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
  return !a.length ? b : !b.length ? a : a.concat(b);
}
var none2 = [];
var MaxSelectionsPerEvent = 200;
function addSelection(branch, selection) {
  if (!branch.length) {
    return [HistEvent.selection([selection])];
  } else {
    let lastEvent = branch[branch.length - 1];
    let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
    if (sels.length && sels[sels.length - 1].eq(selection))
      return branch;
    sels.push(selection);
    return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
  }
}
function popSelection(branch) {
  let last = branch[branch.length - 1];
  let newBranch = branch.slice();
  newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
  return newBranch;
}
function addMappingToBranch(branch, mapping) {
  if (!branch.length)
    return branch;
  let length = branch.length, selections = none2;
  while (length) {
    let event = mapEvent(branch[length - 1], mapping, selections);
    if (event.changes && !event.changes.empty || event.effects.length) {
      let result = branch.slice(0, length);
      result[length - 1] = event;
      return result;
    } else {
      mapping = event.mapped;
      length--;
      selections = event.selectionsAfter;
    }
  }
  return selections.length ? [HistEvent.selection(selections)] : none2;
}
function mapEvent(event, mapping, extraSelections) {
  let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none2, extraSelections);
  if (!event.changes)
    return HistEvent.selection(selections);
  let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
  let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
  return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
var joinableUserEvent = /^(input\.type|delete)($|\.)/;
var HistoryState = class _HistoryState {
  constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
    this.done = done;
    this.undone = undone;
    this.prevTime = prevTime;
    this.prevUserEvent = prevUserEvent;
  }
  isolate() {
    return this.prevTime ? new _HistoryState(this.done, this.undone) : this;
  }
  addChanges(event, time, userEvent, config2, tr) {
    let done = this.done, lastEvent = done[done.length - 1];
    if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < config2.newGroupDelay && config2.joinToEvent(tr, isAdjacent(lastEvent.changes, event.changes)) || // For compose (but not compose.start) events, always join with previous event
    userEvent == "input.type.compose")) {
      done = updateBranch(done, done.length - 1, config2.minDepth, new HistEvent(event.changes.compose(lastEvent.changes), conc(StateEffect.mapEffects(event.effects, lastEvent.changes), lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none2));
    } else {
      done = updateBranch(done, done.length, config2.minDepth, event);
    }
    return new _HistoryState(done, none2, time, userEvent);
  }
  addSelection(selection, time, userEvent, newGroupDelay) {
    let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none2;
    if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last[last.length - 1], selection))
      return this;
    return new _HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
  }
  addMapping(mapping) {
    return new _HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
  }
  pop(side, state, onlySelection) {
    let branch = side == 0 ? this.done : this.undone;
    if (branch.length == 0)
      return null;
    let event = branch[branch.length - 1], selection = event.selectionsAfter[0] || (event.startSelection ? event.startSelection.map(event.changes.invertedDesc, 1) : state.selection);
    if (onlySelection && event.selectionsAfter.length) {
      return state.update({
        selection: event.selectionsAfter[event.selectionsAfter.length - 1],
        annotations: fromHistory.of({ side, rest: popSelection(branch), selection }),
        userEvent: side == 0 ? "select.undo" : "select.redo",
        scrollIntoView: true
      });
    } else if (!event.changes) {
      return null;
    } else {
      let rest = branch.length == 1 ? none2 : branch.slice(0, branch.length - 1);
      if (event.mapped)
        rest = addMappingToBranch(rest, event.mapped);
      return state.update({
        changes: event.changes,
        selection: event.startSelection,
        effects: event.effects,
        annotations: fromHistory.of({ side, rest, selection }),
        filter: false,
        userEvent: side == 0 ? "undo" : "redo",
        scrollIntoView: true
      });
    }
  }
};
HistoryState.empty = /* @__PURE__ */ new HistoryState(none2, none2);
var historyKeymap = [
  { key: "Mod-z", run: undo, preventDefault: true },
  { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
  { linux: "Ctrl-Shift-z", run: redo, preventDefault: true },
  { key: "Mod-u", run: undoSelection, preventDefault: true },
  { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
];
function updateSel(sel, by) {
  return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
  return state.update({ selection, scrollIntoView: true, userEvent: "select" });
}
function moveSel({ state, dispatch }, how) {
  let selection = updateSel(state.selection, how);
  if (selection.eq(state.selection, true))
    return false;
  dispatch(setSel(state, selection));
  return true;
}
function rangeEnd(range, forward) {
  return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
function ltrAtCursor(view) {
  return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
}
var cursorCharLeft = (view) => cursorByChar(view, !ltrAtCursor(view));
var cursorCharRight = (view) => cursorByChar(view, ltrAtCursor(view));
function cursorByGroup(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
var cursorGroupLeft = (view) => cursorByGroup(view, !ltrAtCursor(view));
var cursorGroupRight = (view) => cursorByGroup(view, ltrAtCursor(view));
var segmenter = typeof Intl != "undefined" && Intl.Segmenter ? /* @__PURE__ */ new Intl.Segmenter(void 0, { granularity: "word" }) : null;
function interestingNode(state, node, bracketProp) {
  if (node.type.prop(bracketProp))
    return true;
  let len = node.to - node.from;
  return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
  let pos = syntaxTree(state).resolveInner(start.head);
  let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
  for (let at = start.head; ; ) {
    let next = forward ? pos.childAfter(at) : pos.childBefore(at);
    if (!next)
      break;
    if (interestingNode(state, next, bracketProp))
      pos = next;
    else
      at = forward ? next.to : next.from;
  }
  let bracket2 = pos.type.prop(bracketProp), match, newPos;
  if (bracket2 && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
    newPos = forward ? match.end.to : match.end.from;
  else
    newPos = forward ? pos.to : pos.from;
  return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
var cursorSyntaxLeft = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
var cursorSyntaxRight = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function cursorByLine(view, forward) {
  return moveSel(view, (range) => {
    if (!range.empty)
      return rangeEnd(range, forward);
    let moved = view.moveVertically(range, forward);
    return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
  });
}
var cursorLineUp = (view) => cursorByLine(view, false);
var cursorLineDown = (view) => cursorByLine(view, true);
function pageInfo(view) {
  let selfScroll = view.scrollDOM.clientHeight < view.scrollDOM.scrollHeight - 2;
  let marginTop = 0, marginBottom = 0, height;
  if (selfScroll) {
    for (let source of view.state.facet(EditorView.scrollMargins)) {
      let margins = source(view);
      if (margins === null || margins === void 0 ? void 0 : margins.top)
        marginTop = Math.max(margins === null || margins === void 0 ? void 0 : margins.top, marginTop);
      if (margins === null || margins === void 0 ? void 0 : margins.bottom)
        marginBottom = Math.max(margins === null || margins === void 0 ? void 0 : margins.bottom, marginBottom);
    }
    height = view.scrollDOM.clientHeight - marginTop - marginBottom;
  } else {
    height = (view.dom.ownerDocument.defaultView || window).innerHeight;
  }
  return {
    marginTop,
    marginBottom,
    selfScroll,
    height: Math.max(view.defaultLineHeight, height - 5)
  };
}
function cursorByPage(view, forward) {
  let page = pageInfo(view);
  let { state } = view, selection = updateSel(state.selection, (range) => {
    return range.empty ? view.moveVertically(range, forward, page.height) : rangeEnd(range, forward);
  });
  if (selection.eq(state.selection))
    return false;
  let effect;
  if (page.selfScroll) {
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let scrollTop = scrollRect.top + page.marginTop, scrollBottom = scrollRect.bottom - page.marginBottom;
    if (startPos && startPos.top > scrollTop && startPos.bottom < scrollBottom)
      effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollTop });
  }
  view.dispatch(setSel(state, selection), { effects: effect });
  return true;
}
var cursorPageUp = (view) => cursorByPage(view, false);
var cursorPageDown = (view) => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
  let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
  if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
    moved = view.moveToLineBoundary(start, forward, false);
  if (!forward && moved.head == line.from && line.length) {
    let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
    if (space && start.head != line.from + space)
      moved = EditorSelection.cursor(line.from + space);
  }
  return moved;
}
var cursorLineBoundaryForward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, true));
var cursorLineBoundaryBackward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, false));
var cursorLineBoundaryLeft = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
var cursorLineBoundaryRight = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
var cursorLineStart = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from, 1));
var cursorLineEnd = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend) {
  let found = false, selection = updateSel(state.selection, (range) => {
    let matching = matchBrackets(state, range.head, -1) || matchBrackets(state, range.head, 1) || range.head > 0 && matchBrackets(state, range.head - 1, 1) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1);
    if (!matching || !matching.end)
      return range;
    found = true;
    let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
    return extend ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
  });
  if (!found)
    return false;
  dispatch(setSel(state, selection));
  return true;
}
var cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
function extendSel(target, forward, how) {
  let selection = updateSel(target.state.selection, (range) => {
    if (range.undirectional && range.head >= range.anchor != forward)
      range = EditorSelection.range(range.head, range.anchor);
    let head = how(range);
    return EditorSelection.range(range.anchor, head.head, head.goalColumn, head.bidiLevel || void 0, head.assoc);
  });
  if (selection.eq(target.state.selection))
    return false;
  target.dispatch(setSel(target.state, selection));
  return true;
}
function selectByChar(view, forward) {
  return extendSel(view, forward, (range) => view.moveByChar(range, forward));
}
var selectCharLeft = (view) => selectByChar(view, !ltrAtCursor(view));
var selectCharRight = (view) => selectByChar(view, ltrAtCursor(view));
function selectByGroup(view, forward) {
  return extendSel(view, forward, (range) => view.moveByGroup(range, forward));
}
var selectGroupLeft = (view) => selectByGroup(view, !ltrAtCursor(view));
var selectGroupRight = (view) => selectByGroup(view, ltrAtCursor(view));
var selectSyntaxLeft = (view) => {
  let forward = !ltrAtCursor(view);
  return extendSel(view, forward, (range) => moveBySyntax(view.state, range, forward));
};
var selectSyntaxRight = (view) => {
  let forward = ltrAtCursor(view);
  return extendSel(view, forward, (range) => moveBySyntax(view.state, range, forward));
};
function selectByLine(view, forward) {
  return extendSel(view, forward, (range) => view.moveVertically(range, forward));
}
var selectLineUp = (view) => selectByLine(view, false);
var selectLineDown = (view) => selectByLine(view, true);
function selectByPage(view, forward) {
  return extendSel(view, forward, (range) => view.moveVertically(range, forward, pageInfo(view).height));
}
var selectPageUp = (view) => selectByPage(view, false);
var selectPageDown = (view) => selectByPage(view, true);
var selectLineBoundaryForward = (view) => extendSel(view, true, (range) => moveByLineBoundary(view, range, true));
var selectLineBoundaryBackward = (view) => extendSel(view, false, (range) => moveByLineBoundary(view, range, false));
var selectLineBoundaryLeft = (view) => {
  let forward = !ltrAtCursor(view);
  return extendSel(view, forward, (range) => moveByLineBoundary(view, range, forward));
};
var selectLineBoundaryRight = (view) => {
  let forward = ltrAtCursor(view);
  return extendSel(view, forward, (range) => moveByLineBoundary(view, range, forward));
};
var selectLineStart = (view) => extendSel(view, false, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from));
var selectLineEnd = (view) => extendSel(view, true, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to));
var cursorDocStart = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: 0 }));
  return true;
};
var cursorDocEnd = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.doc.length }));
  return true;
};
var selectDocStart = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
  return true;
};
var selectDocEnd = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
  return true;
};
var selectAll = ({ state, dispatch }) => {
  dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
  return true;
};
var selectLine = ({ state, dispatch }) => {
  let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
  dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
  return true;
};
var selectParentSyntax = ({ state, dispatch }) => {
  let selection = updateSel(state.selection, (range) => {
    let tree = syntaxTree(state), stack = tree.resolveStack(range.from, 1);
    if (range.empty) {
      let stackBefore = tree.resolveStack(range.from, -1);
      if (stackBefore.node.from >= stack.node.from && stackBefore.node.to <= stack.node.to)
        stack = stackBefore;
    }
    for (let cur2 = stack; cur2; cur2 = cur2.next) {
      let { node } = cur2;
      if ((node.from < range.from && node.to >= range.to || node.to > range.to && node.from <= range.from) && cur2.next)
        return EditorSelection.range(node.to, node.from);
    }
    return range;
  });
  if (selection.eq(state.selection))
    return false;
  dispatch(setSel(state, selection));
  return true;
};
function addCursorVertically(view, forward) {
  let { state } = view, sel = state.selection, ranges = state.selection.ranges.slice();
  for (let range of state.selection.ranges) {
    let line = state.doc.lineAt(range.head);
    if (forward ? line.to < view.state.doc.length : line.from > 0)
      for (let cur2 = range; ; ) {
        let next = view.moveVertically(cur2, forward);
        if (next.head < line.from || next.head > line.to) {
          if (!ranges.some((r) => r.head == next.head))
            ranges.push(next);
          break;
        } else if (next.head == cur2.head) {
          break;
        } else {
          cur2 = next;
        }
      }
  }
  if (ranges.length == sel.ranges.length)
    return false;
  view.dispatch(setSel(state, EditorSelection.create(ranges, ranges.length - 1)));
  return true;
}
var addCursorAbove = (view) => addCursorVertically(view, false);
var addCursorBelow = (view) => addCursorVertically(view, true);
var simplifySelection = ({ state, dispatch }) => {
  let cur2 = state.selection, selection = null;
  if (cur2.ranges.length > 1)
    selection = EditorSelection.create([cur2.main]);
  else if (!cur2.main.empty)
    selection = EditorSelection.create([EditorSelection.cursor(cur2.main.head)]);
  if (!selection)
    return false;
  dispatch(setSel(state, selection));
  return true;
};
function deleteBy(target, by) {
  if (target.state.readOnly)
    return false;
  let event = "delete.selection", { state } = target;
  let changes = state.changeByRange((range) => {
    let { from, to } = range;
    if (from == to) {
      let towards = by(range);
      if (towards < from) {
        event = "delete.backward";
        towards = skipAtomic(target, towards, false);
      } else if (towards > from) {
        event = "delete.forward";
        towards = skipAtomic(target, towards, true);
      }
      from = Math.min(from, towards);
      to = Math.max(to, towards);
    } else {
      from = skipAtomic(target, from, false);
      to = skipAtomic(target, to, true);
    }
    return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from, from < range.head ? -1 : 1) };
  });
  if (changes.changes.empty)
    return false;
  target.dispatch(state.update(changes, {
    scrollIntoView: true,
    userEvent: event,
    effects: event == "delete.selection" ? EditorView.announce.of(state.phrase("Selection deleted")) : void 0
  }));
  return true;
}
function skipAtomic(target, pos, forward) {
  if (target instanceof EditorView)
    for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target)))
      ranges.between(pos, pos, (from, to) => {
        if (from < pos && to > pos)
          pos = forward ? to : from;
      });
  return pos;
}
var deleteByChar = (target, forward, byIndentUnit) => deleteBy(target, (range) => {
  let pos = range.from, { state } = target, line = state.doc.lineAt(pos), before, targetPos;
  if (byIndentUnit && !forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
    if (before[before.length - 1] == "	")
      return pos - 1;
    let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
    for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
      pos--;
    targetPos = pos;
  } else {
    targetPos = findClusterBreak2(line.text, pos - line.from, forward, forward) + line.from;
    if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
      targetPos += forward ? 1 : -1;
    else if (!forward && /[\ufe00-\ufe0f]/.test(line.text.slice(targetPos - line.from, pos - line.from)))
      targetPos = findClusterBreak2(line.text, targetPos - line.from, false, false) + line.from;
  }
  return targetPos;
});
var deleteCharBackward = (view) => deleteByChar(view, false, true);
var deleteCharForward = (view) => deleteByChar(view, true, false);
var deleteByGroup = (target, forward) => deleteBy(target, (range) => {
  let pos = range.head, { state } = target, line = state.doc.lineAt(pos);
  let categorize = state.charCategorizer(pos);
  for (let cat = null; ; ) {
    if (pos == (forward ? line.to : line.from)) {
      if (pos == range.head && line.number != (forward ? state.doc.lines : 1))
        pos += forward ? 1 : -1;
      break;
    }
    let next = findClusterBreak2(line.text, pos - line.from, forward) + line.from;
    let nextChar2 = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
    let nextCat = categorize(nextChar2);
    if (cat != null && nextCat != cat)
      break;
    if (nextChar2 != " " || pos != range.head)
      cat = nextCat;
    pos = next;
  }
  return pos;
});
var deleteGroupBackward = (target) => deleteByGroup(target, false);
var deleteGroupForward = (target) => deleteByGroup(target, true);
var deleteToLineEnd = (view) => deleteBy(view, (range) => {
  let lineEnd = view.lineBlockAt(range.head).to;
  return range.head < lineEnd ? lineEnd : Math.min(view.state.doc.length, range.head + 1);
});
var deleteLineBoundaryBackward = (view) => deleteBy(view, (range) => {
  let lineStart = view.moveToLineBoundary(range, false).head;
  return range.head > lineStart ? lineStart : Math.max(0, range.head - 1);
});
var deleteLineBoundaryForward = (view) => deleteBy(view, (range) => {
  let lineStart = view.moveToLineBoundary(range, true).head;
  return range.head < lineStart ? lineStart : Math.min(view.state.doc.length, range.head + 1);
});
var splitLine = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let changes = state.changeByRange((range) => {
    return {
      changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
      range: EditorSelection.cursor(range.from)
    };
  });
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
  return true;
};
var transposeChars = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let changes = state.changeByRange((range) => {
    if (!range.empty || range.from == 0 || range.from == state.doc.length)
      return { range };
    let pos = range.from, line = state.doc.lineAt(pos);
    let from = pos == line.from ? pos - 1 : findClusterBreak2(line.text, pos - line.from, false) + line.from;
    let to = pos == line.to ? pos + 1 : findClusterBreak2(line.text, pos - line.from, true) + line.from;
    return {
      changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
      range: EditorSelection.cursor(to)
    };
  });
  if (changes.changes.empty)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
  return true;
};
function selectedLineBlocks(state) {
  let blocks = [], upto = -1;
  for (let range of state.selection.ranges) {
    let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
    if (!range.empty && range.to == endLine.from)
      endLine = state.doc.lineAt(range.to - 1);
    if (upto >= startLine.number) {
      let prev = blocks[blocks.length - 1];
      prev.to = endLine.to;
      prev.ranges.push(range);
    } else {
      blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
    }
    upto = endLine.number + 1;
  }
  return blocks;
}
function moveLine(state, dispatch, forward) {
  if (state.readOnly)
    return false;
  let changes = [], ranges = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward ? block.to == state.doc.length : block.from == 0)
      continue;
    let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
    let size = nextLine.length + 1;
    if (forward) {
      changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
      for (let r of block.ranges)
        ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
    } else {
      changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
      for (let r of block.ranges)
        ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
    }
  }
  if (!changes.length)
    return false;
  dispatch(state.update({
    changes,
    scrollIntoView: true,
    selection: EditorSelection.create(ranges, state.selection.mainIndex),
    userEvent: "move.line"
  }));
  return true;
}
var moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
var moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
  if (state.readOnly)
    return false;
  let changes = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward)
      changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
    else
      changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
  }
  let changeSet = state.changes(changes);
  dispatch(state.update({
    changes: changeSet,
    selection: state.selection.map(changeSet, forward ? 1 : -1),
    scrollIntoView: true,
    userEvent: "input.copyline"
  }));
  return true;
}
var copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
var copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
var deleteLine = (view) => {
  if (view.state.readOnly)
    return false;
  let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
    if (from > 0)
      from--;
    else if (to < state.doc.length)
      to++;
    return { from, to };
  }));
  let selection = updateSel(state.selection, (range) => {
    let dist2 = void 0;
    if (view.lineWrapping) {
      let block = view.lineBlockAt(range.head), pos = view.coordsAtPos(range.head, range.assoc || 1);
      if (pos)
        dist2 = block.bottom + view.documentTop - pos.bottom + view.defaultLineHeight / 2;
    }
    return view.moveVertically(range, true, dist2);
  }).map(changes);
  view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
  return true;
};
function isBetweenBrackets(state, pos) {
  if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
    return { from: pos, to: pos };
  let context = syntaxTree(state).resolveInner(pos);
  let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
  if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from && !/\S/.test(state.sliceDoc(before.to, after.from)))
    return { from: before.to, to: after.from };
  return null;
}
var insertNewlineAndIndent = /* @__PURE__ */ newlineAndIndent(false);
var insertBlankLine = /* @__PURE__ */ newlineAndIndent(true);
function newlineAndIndent(atEof) {
  return ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range) => {
      let { from, to } = range, line = state.doc.lineAt(from);
      let explode = !atEof && from == to && isBetweenBrackets(state, from);
      if (atEof)
        from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
      let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
      let indent = getIndentation(cx, from);
      if (indent == null)
        indent = countColumn(/^\s*/.exec(state.doc.lineAt(from).text)[0], state.tabSize);
      while (to < line.to && /\s/.test(line.text[to - line.from]))
        to++;
      if (explode)
        ({ from, to } = explode);
      else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
        from = line.from;
      let insert2 = ["", indentString(state, indent)];
      if (explode)
        insert2.push(indentString(state, cx.lineIndent(line.from, -1)));
      return {
        changes: { from, to, insert: Text.of(insert2) },
        range: EditorSelection.cursor(from + 1 + insert2[1].length)
      };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
  };
}
function changeBySelectedLine(state, f) {
  let atLine = -1;
  return state.changeByRange((range) => {
    let changes = [];
    for (let pos = range.from; pos <= range.to; ) {
      let line = state.doc.lineAt(pos);
      if (line.number > atLine && (range.empty || range.to > line.from)) {
        f(line, changes, range);
        atLine = line.number;
      }
      pos = line.to + 1;
    }
    let changeSet = state.changes(changes);
    return {
      changes,
      range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
    };
  });
}
var indentSelection = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let updated = /* @__PURE__ */ Object.create(null);
  let context = new IndentContext(state, { overrideIndentation: (start) => {
    let found = updated[start];
    return found == null ? -1 : found;
  } });
  let changes = changeBySelectedLine(state, (line, changes2, range) => {
    let indent = getIndentation(context, line.from);
    if (indent == null)
      return;
    if (!/\S/.test(line.text))
      indent = 0;
    let cur2 = /^\s*/.exec(line.text)[0];
    let norm = indentString(state, indent);
    if (cur2 != norm || range.from < line.from + cur2.length) {
      updated[line.from] = indent;
      changes2.push({ from: line.from, to: line.from + cur2.length, insert: norm });
    }
  });
  if (!changes.changes.empty)
    dispatch(state.update(changes, { userEvent: "indent" }));
  return true;
};
var indentMore = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    changes.push({ from: line.from, insert: state.facet(indentUnit) });
  }), { userEvent: "input.indent" }));
  return true;
};
var indentLess = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    let space = /^\s*/.exec(line.text)[0];
    if (!space)
      return;
    let col = countColumn(space, state.tabSize), keep = 0;
    let insert2 = indentString(state, Math.max(0, col - getIndentUnit(state)));
    while (keep < space.length && keep < insert2.length && space.charCodeAt(keep) == insert2.charCodeAt(keep))
      keep++;
    changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert2.slice(keep) });
  }), { userEvent: "delete.dedent" }));
  return true;
};
var toggleTabFocusMode = (view) => {
  view.setTabFocusMode();
  return true;
};
var emacsStyleKeymap = [
  { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
  { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
  { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
  { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
  { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
  { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
  { key: "Ctrl-d", run: deleteCharForward },
  { key: "Ctrl-h", run: deleteCharBackward },
  { key: "Ctrl-k", run: deleteToLineEnd },
  { key: "Ctrl-Alt-h", run: deleteGroupBackward },
  { key: "Ctrl-o", run: splitLine },
  { key: "Ctrl-t", run: transposeChars },
  { key: "Ctrl-v", run: cursorPageDown }
];
var standardKeymap = /* @__PURE__ */ [
  { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft, preventDefault: true },
  { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryLeft, shift: selectLineBoundaryLeft, preventDefault: true },
  { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight, preventDefault: true },
  { mac: "Cmd-ArrowRight", run: cursorLineBoundaryRight, shift: selectLineBoundaryRight, preventDefault: true },
  { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
  { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
  { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
  { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
  { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
  { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
  { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
  { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
  { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
  { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
  { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
  { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
  { key: "Enter", run: insertNewlineAndIndent, shift: insertNewlineAndIndent },
  { key: "Mod-a", run: selectAll },
  { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward, preventDefault: true },
  { key: "Delete", run: deleteCharForward, preventDefault: true },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward, preventDefault: true },
  { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward, preventDefault: true },
  { mac: "Mod-Backspace", run: deleteLineBoundaryBackward, preventDefault: true },
  { mac: "Mod-Delete", run: deleteLineBoundaryForward, preventDefault: true }
].concat(/* @__PURE__ */ emacsStyleKeymap.map((b) => ({ mac: b.key, run: b.run, shift: b.shift })));
var defaultKeymap = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
  { key: "Alt-ArrowUp", run: moveLineUp },
  { key: "Shift-Alt-ArrowUp", run: copyLineUp },
  { key: "Alt-ArrowDown", run: moveLineDown },
  { key: "Shift-Alt-ArrowDown", run: copyLineDown },
  { key: "Mod-Alt-ArrowUp", run: addCursorAbove },
  { key: "Mod-Alt-ArrowDown", run: addCursorBelow },
  { key: "Escape", run: simplifySelection },
  { key: "Mod-Enter", run: insertBlankLine },
  { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
  { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
  { key: "Mod-[", run: indentLess },
  { key: "Mod-]", run: indentMore },
  { key: "Mod-Alt-\\", run: indentSelection },
  { key: "Shift-Mod-k", run: deleteLine },
  { key: "Shift-Mod-\\", run: cursorMatchingBracket },
  { key: "Mod-/", run: toggleComment },
  { key: "Alt-A", run: toggleBlockComment },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: toggleTabFocusMode }
].concat(standardKeymap);
var indentWithTab = { key: "Tab", run: indentMore, shift: indentLess };

// node_modules/@codemirror/autocomplete/dist/index.js
var CompletionContext = class {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(state, pos, explicit, view) {
    this.state = state;
    this.pos = pos;
    this.explicit = explicit;
    this.view = view;
    this.abortListeners = [];
    this.abortOnDocChange = false;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(types2) {
    let token = syntaxTree(this.state).resolveInner(this.pos, -1);
    while (token && types2.indexOf(token.name) < 0)
      token = token.parent;
    return token ? {
      from: token.from,
      to: this.pos,
      text: this.state.sliceDoc(token.from, this.pos),
      type: token.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(expr) {
    let line = this.state.doc.lineAt(this.pos);
    let start = Math.max(line.from, this.pos - 250);
    let str2 = line.text.slice(start - line.from, this.pos - line.from);
    let found = str2.search(ensureAnchor(expr, false));
    return found < 0 ? null : { from: start + found, to: this.pos, text: str2.slice(found) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(type, listener, options) {
    if (type == "abort" && this.abortListeners) {
      this.abortListeners.push(listener);
      if (options && options.onDocChange)
        this.abortOnDocChange = true;
    }
  }
};
function toSet(chars) {
  let flat = Object.keys(chars).join("");
  let words = /\w/.test(flat);
  if (words)
    flat = flat.replace(/\w/g, "");
  return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
  let first = /* @__PURE__ */ Object.create(null), rest = /* @__PURE__ */ Object.create(null);
  for (let { label } of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++)
      rest[label[i]] = true;
  }
  let source = toSet(first) + toSet(rest) + "*$";
  return [new RegExp("^" + source), new RegExp(source)];
}
function completeFromList(list) {
  let options = list.map((o) => typeof o == "string" ? { label: o } : o);
  let [validFor, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
  return (context) => {
    let token = context.matchBefore(match);
    return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
  };
}
var Option = class {
  constructor(completion, source, match, score2) {
    this.completion = completion;
    this.source = source;
    this.match = match;
    this.score = score2;
  }
};
function cur(state) {
  return state.selection.main.from;
}
function ensureAnchor(expr, start) {
  var _a2;
  let { source } = expr;
  let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
  if (!addStart && !addEnd)
    return expr;
  return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a2 = expr.flags) !== null && _a2 !== void 0 ? _a2 : expr.ignoreCase ? "i" : "");
}
var pickedCompletion = /* @__PURE__ */ Annotation.define();
function insertCompletionText(state, text, from, to) {
  let { main } = state.selection, fromOff = from - main.from, toOff = to - main.from;
  return __spreadProps(__spreadValues({}, state.changeByRange((range) => {
    if (range != main && from != to && state.sliceDoc(range.from + fromOff, range.from + toOff) != state.sliceDoc(from, to))
      return { range };
    let lines = state.toText(text);
    return {
      changes: { from: range.from + fromOff, to: to == main.from ? range.to : range.from + toOff, insert: lines },
      range: EditorSelection.cursor(range.from + fromOff + lines.length)
    };
  })), {
    scrollIntoView: true,
    userEvent: "input.complete"
  });
}
var SourceCache = /* @__PURE__ */ new WeakMap();
function asSource(source) {
  if (!Array.isArray(source))
    return source;
  let known = SourceCache.get(source);
  if (!known)
    SourceCache.set(source, known = completeFromList(source));
  return known;
}
var startCompletionEffect = /* @__PURE__ */ StateEffect.define();
var closeCompletionEffect = /* @__PURE__ */ StateEffect.define();
var FuzzyMatcher = class {
  constructor(pattern) {
    this.pattern = pattern;
    this.chars = [];
    this.folded = [];
    this.any = [];
    this.precise = [];
    this.byWord = [];
    this.score = 0;
    this.matched = [];
    for (let p = 0; p < pattern.length; ) {
      let char = codePointAt2(pattern, p), size = codePointSize2(char);
      this.chars.push(char);
      let part = pattern.slice(p, p + size), upper = part.toUpperCase();
      this.folded.push(codePointAt2(upper == part ? part.toLowerCase() : upper, 0));
      p += size;
    }
    this.astral = pattern.length != this.chars.length;
  }
  ret(score2, matched) {
    this.score = score2;
    this.matched = matched;
    return this;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return a boolean indicating whether there was a match and,
  // on success, set `this.score` to the score, `this.matched` to an
  // array of `from, to` pairs indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(word) {
    if (this.pattern.length == 0)
      return this.ret(-100, []);
    if (word.length < this.pattern.length)
      return null;
    let { chars, folded, any, precise, byWord } = this;
    if (chars.length == 1) {
      let first = codePointAt2(word, 0), firstSize = codePointSize2(first);
      let score2 = firstSize == word.length ? 0 : -100;
      if (first == chars[0]) ;
      else if (first == folded[0])
        score2 += -200;
      else
        return null;
      return this.ret(score2, [0, firstSize]);
    }
    let direct = word.indexOf(this.pattern);
    if (direct == 0)
      return this.ret(word.length == this.pattern.length ? 0 : -100, [0, this.pattern.length]);
    let len = chars.length, anyTo = 0;
    if (direct < 0) {
      for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
        let next = codePointAt2(word, i);
        if (next == chars[anyTo] || next == folded[anyTo])
          any[anyTo++] = i;
        i += codePointSize2(next);
      }
      if (anyTo < len)
        return null;
    }
    let preciseTo = 0;
    let byWordTo = 0, byWordFolded = false;
    let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
    let hasLower = /[a-z]/.test(word), wordAdjacent = true;
    for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
      let next = codePointAt2(word, i);
      if (direct < 0) {
        if (preciseTo < len && next == chars[preciseTo])
          precise[preciseTo++] = i;
        if (adjacentTo < len) {
          if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
            if (adjacentTo == 0)
              adjacentStart = i;
            adjacentEnd = i + 1;
            adjacentTo++;
          } else {
            adjacentTo = 0;
          }
        }
      }
      let ch, type = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
      if (!i || type == 1 && hasLower || prevType == 0 && type != 0) {
        if (chars[byWordTo] == next || folded[byWordTo] == next && (byWordFolded = true))
          byWord[byWordTo++] = i;
        else if (byWord.length)
          wordAdjacent = false;
      }
      prevType = type;
      i += codePointSize2(next);
    }
    if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
      return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
    if (adjacentTo == len && adjacentStart == 0)
      return this.ret(-200 - word.length + (adjacentEnd == word.length ? 0 : -100), [0, adjacentEnd]);
    if (direct > -1)
      return this.ret(-700 - word.length, [direct, direct + this.pattern.length]);
    if (adjacentTo == len)
      return this.ret(-200 + -700 - word.length, [adjacentStart, adjacentEnd]);
    if (byWordTo == len)
      return this.result(-100 + (byWordFolded ? -200 : 0) + -700 + (wordAdjacent ? 0 : -1100), byWord, word);
    return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
  }
  result(score2, positions, word) {
    let result = [], i = 0;
    for (let pos of positions) {
      let to = pos + (this.astral ? codePointSize2(codePointAt2(word, pos)) : 1);
      if (i && result[i - 1] == pos)
        result[i - 1] = to;
      else {
        result[i++] = pos;
        result[i++] = to;
      }
    }
    return this.ret(score2 - word.length, result);
  }
};
var StrictMatcher = class {
  constructor(pattern) {
    this.pattern = pattern;
    this.matched = [];
    this.score = 0;
    this.folded = pattern.toLowerCase();
  }
  match(word) {
    if (word.length < this.pattern.length)
      return null;
    let start = word.slice(0, this.pattern.length);
    let match = start == this.pattern ? 0 : start.toLowerCase() == this.folded ? -200 : null;
    if (match == null)
      return null;
    this.matched = [0, start.length];
    this.score = match + (word.length == this.pattern.length ? 0 : -100);
    return this;
  }
};
var completionConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      activateOnTyping: true,
      activateOnCompletion: () => false,
      activateOnTypingDelay: 100,
      selectOnOpen: true,
      override: null,
      closeOnBlur: true,
      maxRenderedOptions: 100,
      defaultKeymap: true,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: false,
      icons: true,
      addToOptions: [],
      positionInfo: defaultPositionInfo,
      filterStrict: false,
      compareCompletions: (a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label),
      interactionDelay: 75,
      updateSyncTime: 100
    }, {
      defaultKeymap: (a, b) => a && b,
      closeOnBlur: (a, b) => a && b,
      icons: (a, b) => a && b,
      tooltipClass: (a, b) => (c) => joinClass(a(c), b(c)),
      optionClass: (a, b) => (c) => joinClass(a(c), b(c)),
      addToOptions: (a, b) => a.concat(b),
      filterStrict: (a, b) => a || b
    });
  }
});
function joinClass(a, b) {
  return a ? b ? a + " " + b : a : b;
}
function defaultPositionInfo(view, list, option, info, space, tooltip) {
  let rtl = view.textDirection == Direction.RTL, left = rtl, narrow = false;
  let side = "top", offset, maxWidth;
  let spaceLeft = list.left - space.left, spaceRight = space.right - list.right;
  let infoWidth = info.right - info.left, infoHeight = info.bottom - info.top;
  if (left && spaceLeft < Math.min(infoWidth, spaceRight))
    left = false;
  else if (!left && spaceRight < Math.min(infoWidth, spaceLeft))
    left = true;
  if (infoWidth <= (left ? spaceLeft : spaceRight)) {
    offset = Math.max(space.top, Math.min(option.top, space.bottom - infoHeight)) - list.top;
    maxWidth = Math.min(400, left ? spaceLeft : spaceRight);
  } else {
    narrow = true;
    maxWidth = Math.min(
      400,
      (rtl ? list.right : space.right - list.left) - 30
      /* Info.Margin */
    );
    let spaceBelow = space.bottom - list.bottom;
    if (spaceBelow >= infoHeight || spaceBelow > list.top) {
      offset = option.bottom - list.top;
    } else {
      side = "bottom";
      offset = list.bottom - option.top;
    }
  }
  let scaleY = (list.bottom - list.top) / tooltip.offsetHeight;
  let scaleX = (list.right - list.left) / tooltip.offsetWidth;
  return {
    style: `${side}: ${offset / scaleY}px; max-width: ${maxWidth / scaleX}px`,
    class: "cm-completionInfo-" + (narrow ? rtl ? "left-narrow" : "right-narrow" : left ? "left" : "right")
  };
}
var setSelectedEffect = /* @__PURE__ */ StateEffect.define();
function optionContent(config2) {
  let content2 = config2.addToOptions.slice();
  if (config2.icons)
    content2.push({
      render(completion) {
        let icon = document.createElement("div");
        icon.classList.add("cm-completionIcon");
        if (completion.type)
          icon.classList.add(...completion.type.split(/\s+/g).map((cls) => "cm-completionIcon-" + cls));
        icon.setAttribute("aria-hidden", "true");
        return icon;
      },
      position: 20
    });
  content2.push({
    render(completion, _s, _v, match) {
      let labelElt = document.createElement("span");
      labelElt.className = "cm-completionLabel";
      let label = completion.displayLabel || completion.label, off = 0;
      for (let j = 0; j < match.length; ) {
        let from = match[j++], to = match[j++];
        if (from > off)
          labelElt.appendChild(document.createTextNode(label.slice(off, from)));
        let span = labelElt.appendChild(document.createElement("span"));
        span.appendChild(document.createTextNode(label.slice(from, to)));
        span.className = "cm-completionMatchedText";
        off = to;
      }
      if (off < label.length)
        labelElt.appendChild(document.createTextNode(label.slice(off)));
      return labelElt;
    },
    position: 50
  }, {
    render(completion) {
      if (!completion.detail)
        return null;
      let detailElt = document.createElement("span");
      detailElt.className = "cm-completionDetail";
      detailElt.textContent = completion.detail;
      return detailElt;
    },
    position: 80
  });
  return content2.sort((a, b) => a.position - b.position).map((a) => a.render);
}
function rangeAroundSelected(total, selected, max) {
  if (total <= max)
    return { from: 0, to: total };
  if (selected < 0)
    selected = 0;
  if (selected <= total >> 1) {
    let off2 = Math.floor(selected / max);
    return { from: off2 * max, to: (off2 + 1) * max };
  }
  let off = Math.ceil((total - selected) / max);
  return { from: total - off * max, to: total - (off - 1) * max };
}
var CompletionTooltip = class {
  constructor(view, stateField, applyCompletion2) {
    this.view = view;
    this.stateField = stateField;
    this.applyCompletion = applyCompletion2;
    this.info = null;
    this.infoDestroy = null;
    this.placeInfoReq = {
      read: () => this.measureInfo(),
      write: (pos) => this.placeInfo(pos),
      key: this
    };
    this.space = null;
    this.currentClass = "";
    let cState = view.state.field(stateField);
    let { options, selected } = cState.open;
    let config2 = view.state.facet(completionConfig);
    this.optionContent = optionContent(config2);
    this.optionClass = config2.optionClass;
    this.tooltipClass = config2.tooltipClass;
    this.range = rangeAroundSelected(options.length, selected, config2.maxRenderedOptions);
    this.dom = document.createElement("div");
    this.dom.className = "cm-tooltip-autocomplete";
    this.updateTooltipClass(view.state);
    this.dom.addEventListener("mousedown", (e) => {
      let { options: options2 } = view.state.field(stateField).open;
      for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
        if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options2.length) {
          this.applyCompletion(view, options2[+match[1]]);
          e.preventDefault();
          return;
        }
      }
      if (e.target == this.list) {
        let move = this.list.classList.contains("cm-completionListIncompleteTop") && e.clientY < this.list.firstChild.getBoundingClientRect().top ? this.range.from - 1 : this.list.classList.contains("cm-completionListIncompleteBottom") && e.clientY > this.list.lastChild.getBoundingClientRect().bottom ? this.range.to : null;
        if (move != null) {
          view.dispatch({ effects: setSelectedEffect.of(move) });
          e.preventDefault();
        }
      }
    });
    this.dom.addEventListener("focusout", (e) => {
      let state = view.state.field(this.stateField, false);
      if (state && state.tooltip && view.state.facet(completionConfig).closeOnBlur && e.relatedTarget != view.contentDOM)
        view.dispatch({ effects: closeCompletionEffect.of(null) });
    });
    this.showOptions(options, cState.id);
  }
  mount() {
    this.updateSel();
  }
  showOptions(options, id) {
    if (this.list)
      this.list.remove();
    this.list = this.dom.appendChild(this.createListBox(options, id, this.range));
    this.list.addEventListener("scroll", () => {
      if (this.info)
        this.view.requestMeasure(this.placeInfoReq);
    });
  }
  update(update) {
    var _a2;
    let cState = update.state.field(this.stateField);
    let prevState = update.startState.field(this.stateField);
    this.updateTooltipClass(update.state);
    if (cState != prevState) {
      let { options, selected, disabled } = cState.open;
      if (!prevState.open || prevState.open.options != options) {
        this.range = rangeAroundSelected(options.length, selected, update.state.facet(completionConfig).maxRenderedOptions);
        this.showOptions(options, cState.id);
      }
      this.updateSel();
      if (disabled != ((_a2 = prevState.open) === null || _a2 === void 0 ? void 0 : _a2.disabled))
        this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!disabled);
    }
  }
  updateTooltipClass(state) {
    let cls = this.tooltipClass(state);
    if (cls != this.currentClass) {
      for (let c of this.currentClass.split(" "))
        if (c)
          this.dom.classList.remove(c);
      for (let c of cls.split(" "))
        if (c)
          this.dom.classList.add(c);
      this.currentClass = cls;
    }
  }
  positioned(space) {
    this.space = space;
    if (this.info)
      this.view.requestMeasure(this.placeInfoReq);
  }
  updateSel() {
    let cState = this.view.state.field(this.stateField), open = cState.open;
    if (open.selected > -1 && open.selected < this.range.from || open.selected >= this.range.to) {
      this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
      this.showOptions(open.options, cState.id);
    }
    let newSel = this.updateSelectedOption(open.selected);
    if (newSel) {
      this.destroyInfo();
      let { completion } = open.options[open.selected];
      let { info } = completion;
      if (!info)
        return;
      let infoResult = typeof info === "string" ? document.createTextNode(info) : info(completion);
      if (!infoResult)
        return;
      if ("then" in infoResult) {
        infoResult.then((obj) => {
          if (obj && this.view.state.field(this.stateField, false) == cState)
            this.addInfoPane(obj, completion);
        }).catch((e) => logException(this.view.state, e, "completion info"));
      } else {
        this.addInfoPane(infoResult, completion);
        newSel.setAttribute("aria-describedby", this.info.id);
      }
    }
  }
  addInfoPane(content2, completion) {
    this.destroyInfo();
    let wrap = this.info = document.createElement("div");
    wrap.className = "cm-tooltip cm-completionInfo";
    wrap.id = "cm-completionInfo-" + Math.floor(Math.random() * 65535).toString(16);
    if (content2.nodeType != null) {
      wrap.appendChild(content2);
      this.infoDestroy = null;
    } else {
      let { dom, destroy } = content2;
      wrap.appendChild(dom);
      this.infoDestroy = destroy || null;
    }
    this.dom.appendChild(wrap);
    this.view.requestMeasure(this.placeInfoReq);
  }
  updateSelectedOption(selected) {
    let set = null;
    for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
      if (opt.nodeName != "LI" || !opt.id) {
        i--;
      } else if (i == selected) {
        if (!opt.hasAttribute("aria-selected")) {
          opt.setAttribute("aria-selected", "true");
          set = opt;
        }
      } else {
        if (opt.hasAttribute("aria-selected")) {
          opt.removeAttribute("aria-selected");
          opt.removeAttribute("aria-describedby");
        }
      }
    }
    if (set)
      scrollIntoView2(this.list, set);
    return set;
  }
  measureInfo() {
    let sel = this.dom.querySelector("[aria-selected]");
    if (!sel || !this.info)
      return null;
    let listRect = this.dom.getBoundingClientRect();
    let infoRect = this.info.getBoundingClientRect();
    let selRect = sel.getBoundingClientRect();
    let space = this.space;
    if (!space) {
      let docElt = this.dom.ownerDocument.documentElement;
      space = { left: 0, top: 0, right: docElt.clientWidth, bottom: docElt.clientHeight };
    }
    if (selRect.top > Math.min(space.bottom, listRect.bottom) - 10 || selRect.bottom < Math.max(space.top, listRect.top) + 10)
      return null;
    return this.view.state.facet(completionConfig).positionInfo(this.view, listRect, selRect, infoRect, space, this.dom);
  }
  placeInfo(pos) {
    if (this.info) {
      if (pos) {
        if (pos.style)
          this.info.style.cssText = pos.style;
        this.info.className = "cm-tooltip cm-completionInfo " + (pos.class || "");
      } else {
        this.info.style.cssText = "top: -1e6px";
      }
    }
  }
  createListBox(options, id, range) {
    const ul = document.createElement("ul");
    ul.id = id;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    ul.setAttribute("aria-label", this.view.state.phrase("Completions"));
    ul.addEventListener("mousedown", (e) => {
      if (e.target == ul)
        e.preventDefault();
    });
    let curSection = null;
    for (let i = range.from; i < range.to; i++) {
      let { completion, match } = options[i], { section } = completion;
      if (section) {
        let name2 = typeof section == "string" ? section : section.name;
        if (name2 != curSection && (i > range.from || range.from == 0)) {
          curSection = name2;
          if (typeof section != "string" && section.header) {
            ul.appendChild(section.header(section));
          } else {
            let header = ul.appendChild(document.createElement("completion-section"));
            header.textContent = name2;
          }
        }
      }
      const li = ul.appendChild(document.createElement("li"));
      li.id = id + "-" + i;
      li.setAttribute("role", "option");
      let cls = this.optionClass(completion);
      if (cls)
        li.className = cls;
      for (let source of this.optionContent) {
        let node = source(completion, this.view.state, this.view, match);
        if (node)
          li.appendChild(node);
      }
    }
    if (range.from)
      ul.classList.add("cm-completionListIncompleteTop");
    if (range.to < options.length)
      ul.classList.add("cm-completionListIncompleteBottom");
    return ul;
  }
  destroyInfo() {
    if (this.info) {
      if (this.infoDestroy)
        this.infoDestroy();
      this.info.remove();
      this.info = null;
    }
  }
  destroy() {
    this.destroyInfo();
  }
};
function completionTooltip(stateField, applyCompletion2) {
  return (view) => new CompletionTooltip(view, stateField, applyCompletion2);
}
function scrollIntoView2(container, element) {
  let parent = container.getBoundingClientRect();
  let self = element.getBoundingClientRect();
  let scaleY = parent.height / container.offsetHeight;
  if (self.top < parent.top)
    container.scrollTop -= (parent.top - self.top) / scaleY;
  else if (self.bottom > parent.bottom)
    container.scrollTop += (self.bottom - parent.bottom) / scaleY;
}
function score(option) {
  return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) + (option.type ? 1 : 0);
}
function sortOptions(active, state) {
  let options = [];
  let sections = null, dynamicSectionScore = null;
  let addOption = (option) => {
    options.push(option);
    let { section } = option.completion;
    if (section) {
      if (!sections)
        sections = [];
      let name2 = typeof section == "string" ? section : section.name;
      if (!sections.some((s) => s.name == name2))
        sections.push(typeof section == "string" ? { name: name2 } : section);
    }
  };
  let conf = state.facet(completionConfig);
  for (let a of active)
    if (a.hasResult()) {
      let getMatch = a.result.getMatch;
      if (a.result.filter === false) {
        for (let option of a.result.options) {
          addOption(new Option(option, a.source, getMatch ? getMatch(option) : [], 1e9 - options.length));
        }
      } else {
        let pattern = state.sliceDoc(a.from, a.to), match;
        let matcher = conf.filterStrict ? new StrictMatcher(pattern) : new FuzzyMatcher(pattern);
        for (let option of a.result.options)
          if (match = matcher.match(option.label)) {
            let matched = !option.displayLabel ? match.matched : getMatch ? getMatch(option, match.matched) : [];
            let score2 = match.score + (option.boost || 0);
            addOption(new Option(option, a.source, matched, score2));
            if (typeof option.section == "object" && option.section.rank === "dynamic") {
              let { name: name2 } = option.section;
              if (!dynamicSectionScore)
                dynamicSectionScore = /* @__PURE__ */ Object.create(null);
              dynamicSectionScore[name2] = Math.max(score2, dynamicSectionScore[name2] || -1e9);
            }
          }
      }
    }
  if (sections) {
    let sectionOrder = /* @__PURE__ */ Object.create(null), pos = 0;
    let cmp = (a, b) => {
      return (a.rank === "dynamic" && b.rank === "dynamic" ? dynamicSectionScore[b.name] - dynamicSectionScore[a.name] : 0) || (typeof a.rank == "number" ? a.rank : 1e9) - (typeof b.rank == "number" ? b.rank : 1e9) || (a.name < b.name ? -1 : 1);
    };
    for (let s of sections.sort(cmp)) {
      pos -= 1e5;
      sectionOrder[s.name] = pos;
    }
    for (let option of options) {
      let { section } = option.completion;
      if (section)
        option.score += sectionOrder[typeof section == "string" ? section : section.name];
    }
  }
  let result = [], prev = null;
  let compare2 = conf.compareCompletions;
  for (let opt of options.sort((a, b) => b.score - a.score || compare2(a.completion, b.completion))) {
    let cur2 = opt.completion;
    if (!prev || prev.label != cur2.label || prev.detail != cur2.detail || prev.type != null && cur2.type != null && prev.type != cur2.type || prev.apply != cur2.apply || prev.boost != cur2.boost)
      result.push(opt);
    else if (score(opt.completion) > score(prev))
      result[result.length - 1] = opt;
    prev = opt.completion;
  }
  return result;
}
var CompletionDialog = class _CompletionDialog {
  constructor(options, attrs, tooltip, timestamp, selected, disabled) {
    this.options = options;
    this.attrs = attrs;
    this.tooltip = tooltip;
    this.timestamp = timestamp;
    this.selected = selected;
    this.disabled = disabled;
  }
  setSelected(selected, id) {
    return selected == this.selected || selected >= this.options.length ? this : new _CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected, this.disabled);
  }
  static build(active, state, id, prev, conf, didSetActive) {
    if (prev && !didSetActive && active.some((s) => s.isPending))
      return prev.setDisabled();
    let options = sortOptions(active, state);
    if (!options.length)
      return prev && active.some((a) => a.isPending) ? prev.setDisabled() : null;
    let selected = state.facet(completionConfig).selectOnOpen ? 0 : -1;
    if (prev && prev.selected != selected && prev.selected != -1) {
      let selectedValue = prev.options[prev.selected].completion;
      for (let i = 0; i < options.length; i++)
        if (options[i].completion == selectedValue) {
          selected = i;
          break;
        }
    }
    return new _CompletionDialog(options, makeAttrs(id, selected), {
      pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
      create: createTooltip,
      above: conf.aboveCursor
    }, prev ? prev.timestamp : Date.now(), selected, false);
  }
  map(changes) {
    return new _CompletionDialog(this.options, this.attrs, __spreadProps(__spreadValues({}, this.tooltip), { pos: changes.mapPos(this.tooltip.pos) }), this.timestamp, this.selected, this.disabled);
  }
  setDisabled() {
    return new _CompletionDialog(this.options, this.attrs, this.tooltip, this.timestamp, this.selected, true);
  }
};
var CompletionState = class _CompletionState {
  constructor(active, id, open) {
    this.active = active;
    this.id = id;
    this.open = open;
  }
  static start() {
    return new _CompletionState(none3, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(tr) {
    let { state } = tr, conf = state.facet(completionConfig);
    let sources = conf.override || state.languageDataAt("autocomplete", cur(state)).map(asSource);
    let active = sources.map((source) => {
      let value = this.active.find((s) => s.source == source) || new ActiveSource(
        source,
        this.active.some(
          (a) => a.state != 0
          /* State.Inactive */
        ) ? 1 : 0
        /* State.Inactive */
      );
      return value.update(tr, conf);
    });
    if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
      active = this.active;
    let open = this.open, didSet = tr.effects.some((e) => e.is(setActiveEffect));
    if (open && tr.docChanged)
      open = open.map(tr.changes);
    if (tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active) || didSet)
      open = CompletionDialog.build(active, state, this.id, open, conf, didSet);
    else if (open && open.disabled && !active.some((a) => a.isPending))
      open = null;
    if (!open && active.every((a) => !a.isPending) && active.some((a) => a.hasResult()))
      active = active.map((a) => a.hasResult() ? new ActiveSource(
        a.source,
        0
        /* State.Inactive */
      ) : a);
    for (let effect of tr.effects)
      if (effect.is(setSelectedEffect))
        open = open && open.setSelected(effect.value, this.id);
    return active == this.active && open == this.open ? this : new _CompletionState(active, this.id, open);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : this.active.length ? baseAttrs : noAttrs2;
  }
};
function sameResults(a, b) {
  if (a == b)
    return true;
  for (let iA = 0, iB = 0; ; ) {
    while (iA < a.length && !a[iA].hasResult())
      iA++;
    while (iB < b.length && !b[iB].hasResult())
      iB++;
    let endA = iA == a.length, endB = iB == b.length;
    if (endA || endB)
      return endA == endB;
    if (a[iA++].result != b[iB++].result)
      return false;
  }
}
var baseAttrs = {
  "aria-autocomplete": "list"
};
var noAttrs2 = {};
function makeAttrs(id, selected) {
  let result = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": id
  };
  if (selected > -1)
    result["aria-activedescendant"] = id + "-" + selected;
  return result;
}
var none3 = [];
function getUpdateType(tr, conf) {
  if (tr.isUserEvent("input.complete")) {
    let completion = tr.annotation(pickedCompletion);
    if (completion && conf.activateOnCompletion(completion))
      return 4 | 8;
  }
  let typing = tr.isUserEvent("input.type");
  return typing && conf.activateOnTyping ? 4 | 1 : typing ? 1 : tr.isUserEvent("delete.backward") ? 2 : tr.selection ? 8 : tr.docChanged ? 16 : 0;
}
var ActiveSource = class _ActiveSource {
  constructor(source, state, explicit = false) {
    this.source = source;
    this.state = state;
    this.explicit = explicit;
  }
  hasResult() {
    return false;
  }
  get isPending() {
    return this.state == 1;
  }
  update(tr, conf) {
    let type = getUpdateType(tr, conf), value = this;
    if (type & 8 || type & 16 && this.touches(tr))
      value = new _ActiveSource(
        value.source,
        0
        /* State.Inactive */
      );
    if (type & 4 && value.state == 0)
      value = new _ActiveSource(
        this.source,
        1
        /* State.Pending */
      );
    value = value.updateFor(tr, type);
    for (let effect of tr.effects) {
      if (effect.is(startCompletionEffect))
        value = new _ActiveSource(value.source, 1, effect.value);
      else if (effect.is(closeCompletionEffect))
        value = new _ActiveSource(
          value.source,
          0
          /* State.Inactive */
        );
      else if (effect.is(setActiveEffect)) {
        for (let active of effect.value)
          if (active.source == value.source)
            value = active;
      }
    }
    return value;
  }
  updateFor(tr, type) {
    return this.map(tr.changes);
  }
  map(changes) {
    return this;
  }
  touches(tr) {
    return tr.changes.touchesRange(cur(tr.state));
  }
};
var ActiveResult = class _ActiveResult extends ActiveSource {
  constructor(source, explicit, limit, result, from, to) {
    super(source, 3, explicit);
    this.limit = limit;
    this.result = result;
    this.from = from;
    this.to = to;
  }
  hasResult() {
    return true;
  }
  updateFor(tr, type) {
    var _a2;
    if (!(type & 3))
      return this.map(tr.changes);
    let result = this.result;
    if (result.map && !tr.changes.empty)
      result = result.map(result, tr.changes);
    let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
    let pos = cur(tr.state);
    if (pos > to || !result || type & 2 && (cur(tr.startState) == this.from || pos < this.limit))
      return new ActiveSource(
        this.source,
        type & 4 ? 1 : 0
        /* State.Inactive */
      );
    let limit = tr.changes.mapPos(this.limit);
    if (checkValid(result.validFor, tr.state, from, to))
      return new _ActiveResult(this.source, this.explicit, limit, result, from, to);
    if (result.update && (result = result.update(result, from, to, new CompletionContext(tr.state, pos, false))))
      return new _ActiveResult(this.source, this.explicit, limit, result, result.from, (_a2 = result.to) !== null && _a2 !== void 0 ? _a2 : cur(tr.state));
    return new ActiveSource(this.source, 1, this.explicit);
  }
  map(mapping) {
    if (mapping.empty)
      return this;
    let result = this.result.map ? this.result.map(this.result, mapping) : this.result;
    if (!result)
      return new ActiveSource(
        this.source,
        0
        /* State.Inactive */
      );
    return new _ActiveResult(this.source, this.explicit, mapping.mapPos(this.limit), result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
  }
  touches(tr) {
    return tr.changes.touchesRange(this.from, this.to);
  }
};
function checkValid(validFor, state, from, to) {
  if (!validFor)
    return false;
  let text = state.sliceDoc(from, to);
  return typeof validFor == "function" ? validFor(text, from, to, state) : ensureAnchor(validFor, true).test(text);
}
var setActiveEffect = /* @__PURE__ */ StateEffect.define({
  map(sources, mapping) {
    return sources.map((s) => s.map(mapping));
  }
});
var completionState = /* @__PURE__ */ StateField.define({
  create() {
    return CompletionState.start();
  },
  update(value, tr) {
    return value.update(tr);
  },
  provide: (f) => [
    showTooltip.from(f, (val) => val.tooltip),
    EditorView.contentAttributes.from(f, (state) => state.attrs)
  ]
});
function applyCompletion(view, option) {
  const apply = option.completion.apply || option.completion.label;
  let result = view.state.field(completionState).active.find((a) => a.source == option.source);
  if (!(result instanceof ActiveResult))
    return false;
  if (typeof apply == "string")
    view.dispatch(__spreadProps(__spreadValues({}, insertCompletionText(view.state, apply, result.from, result.to)), {
      annotations: pickedCompletion.of(option.completion)
    }));
  else
    apply(view, option.completion, result.from, result.to);
  return true;
}
var createTooltip = /* @__PURE__ */ completionTooltip(completionState, applyCompletion);
function moveCompletionSelection(forward, by = "option") {
  return (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.open || cState.open.disabled || Date.now() - cState.open.timestamp < view.state.facet(completionConfig).interactionDelay)
      return false;
    let step = 1, tooltip;
    if (by == "page" && (tooltip = getTooltip(view, cState.open.tooltip)))
      step = Math.max(2, Math.floor(tooltip.dom.offsetHeight / tooltip.dom.querySelector("li").offsetHeight) - 1);
    let { length } = cState.open.options;
    let selected = cState.open.selected > -1 ? cState.open.selected + step * (forward ? 1 : -1) : forward ? 0 : length - 1;
    if (selected < 0)
      selected = by == "page" ? 0 : length - 1;
    else if (selected >= length)
      selected = by == "page" ? length - 1 : 0;
    view.dispatch({ effects: setSelectedEffect.of(selected) });
    return true;
  };
}
var acceptCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (view.state.readOnly || !cState || !cState.open || cState.open.selected < 0 || cState.open.disabled || Date.now() - cState.open.timestamp < view.state.facet(completionConfig).interactionDelay)
    return false;
  return applyCompletion(view, cState.open.options[cState.open.selected]);
};
var startCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState)
    return false;
  view.dispatch({ effects: startCompletionEffect.of(true) });
  return true;
};
var closeCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState || !cState.active.some(
    (a) => a.state != 0
    /* State.Inactive */
  ))
    return false;
  view.dispatch({ effects: closeCompletionEffect.of(null) });
  return true;
};
var RunningQuery = class {
  constructor(active, context) {
    this.active = active;
    this.context = context;
    this.time = Date.now();
    this.updates = [];
    this.done = void 0;
  }
};
var MaxUpdateCount = 50;
var MinAbortTime = 1e3;
var completionPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.debounceUpdate = -1;
    this.running = [];
    this.debounceAccept = -1;
    this.pendingStart = false;
    this.composing = 0;
    for (let active of view.state.field(completionState).active)
      if (active.isPending)
        this.startQuery(active);
  }
  update(update) {
    let cState = update.state.field(completionState);
    let conf = update.state.facet(completionConfig);
    if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
      return;
    let doesReset = update.transactions.some((tr) => {
      let type = getUpdateType(tr, conf);
      return type & 8 || (tr.selection || tr.docChanged) && !(type & 3);
    });
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (doesReset || query.context.abortOnDocChange && update.docChanged || query.updates.length + update.transactions.length > MaxUpdateCount && Date.now() - query.time > MinAbortTime) {
        for (let handler of query.context.abortListeners) {
          try {
            handler();
          } catch (e) {
            logException(this.view.state, e);
          }
        }
        query.context.abortListeners = null;
        this.running.splice(i--, 1);
      } else {
        query.updates.push(...update.transactions);
      }
    }
    if (this.debounceUpdate > -1)
      clearTimeout(this.debounceUpdate);
    if (update.transactions.some((tr) => tr.effects.some((e) => e.is(startCompletionEffect))))
      this.pendingStart = true;
    let delay = this.pendingStart ? 50 : conf.activateOnTypingDelay;
    this.debounceUpdate = cState.active.some((a) => a.isPending && !this.running.some((q) => q.active.source == a.source)) ? setTimeout(() => this.startUpdate(), delay) : -1;
    if (this.composing != 0)
      for (let tr of update.transactions) {
        if (tr.isUserEvent("input.type"))
          this.composing = 2;
        else if (this.composing == 2 && tr.selection)
          this.composing = 3;
      }
  }
  startUpdate() {
    this.debounceUpdate = -1;
    this.pendingStart = false;
    let { state } = this.view, cState = state.field(completionState);
    for (let active of cState.active) {
      if (active.isPending && !this.running.some((r) => r.active.source == active.source))
        this.startQuery(active);
    }
    if (this.running.length && cState.open && cState.open.disabled)
      this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(completionConfig).updateSyncTime);
  }
  startQuery(active) {
    let { state } = this.view, pos = cur(state);
    let context = new CompletionContext(state, pos, active.explicit, this.view);
    let pending = new RunningQuery(active, context);
    this.running.push(pending);
    Promise.resolve(active.source(context)).then((result) => {
      if (!pending.context.aborted) {
        pending.done = result || null;
        this.scheduleAccept();
      }
    }, (err) => {
      this.view.dispatch({ effects: closeCompletionEffect.of(null) });
      logException(this.view.state, err);
    });
  }
  scheduleAccept() {
    if (this.running.every((q) => q.done !== void 0))
      this.accept();
    else if (this.debounceAccept < 0)
      this.debounceAccept = setTimeout(() => this.accept(), this.view.state.facet(completionConfig).updateSyncTime);
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var _a2;
    if (this.debounceAccept > -1)
      clearTimeout(this.debounceAccept);
    this.debounceAccept = -1;
    let updated = [];
    let conf = this.view.state.facet(completionConfig), cState = this.view.state.field(completionState);
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (query.done === void 0)
        continue;
      this.running.splice(i--, 1);
      if (query.done) {
        let pos = cur(query.updates.length ? query.updates[0].startState : this.view.state);
        let limit = Math.min(pos, query.done.from + (query.active.explicit ? 0 : 1));
        let active = new ActiveResult(query.active.source, query.active.explicit, limit, query.done, query.done.from, (_a2 = query.done.to) !== null && _a2 !== void 0 ? _a2 : pos);
        for (let tr of query.updates)
          active = active.update(tr, conf);
        if (active.hasResult()) {
          updated.push(active);
          continue;
        }
      }
      let current = cState.active.find((a) => a.source == query.active.source);
      if (current && current.isPending) {
        if (query.done == null) {
          let active = new ActiveSource(
            query.active.source,
            0
            /* State.Inactive */
          );
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (!active.isPending)
            updated.push(active);
        } else {
          this.startQuery(current);
        }
      }
    }
    if (updated.length || cState.open && cState.open.disabled)
      this.view.dispatch({ effects: setActiveEffect.of(updated) });
  }
}, {
  eventHandlers: {
    blur(event) {
      let state = this.view.state.field(completionState, false);
      if (state && state.tooltip && this.view.state.facet(completionConfig).closeOnBlur) {
        let dialog = state.open && getTooltip(this.view, state.open.tooltip);
        if (!dialog || !dialog.dom.contains(event.relatedTarget))
          setTimeout(() => this.view.dispatch({ effects: closeCompletionEffect.of(null) }), 10);
      }
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      if (this.composing == 3) {
        setTimeout(() => this.view.dispatch({ effects: startCompletionEffect.of(false) }), 20);
      }
      this.composing = 0;
    }
  }
});
var windows = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform);
var commitCharacters = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ EditorView.domEventHandlers({
  keydown(event, view) {
    let field = view.state.field(completionState, false);
    if (!field || !field.open || field.open.disabled || field.open.selected < 0 || event.key.length > 1 || event.ctrlKey && !(windows && event.altKey) || event.metaKey)
      return false;
    let option = field.open.options[field.open.selected];
    let result = field.active.find((a) => a.source == option.source);
    let commitChars = option.completion.commitCharacters || result.result.commitCharacters;
    if (commitChars && commitChars.indexOf(event.key) > -1)
      applyCompletion(view, option);
    return false;
  }
}));
var baseTheme3 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"\xB7\xB7\xB7"',
    opacity: 0.5,
    display: "block",
    textAlign: "center",
    cursor: "pointer"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: `${400}px`,
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: `${30}px` },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: `${30}px` },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'\u0192'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'\u25CB'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'\u25CC'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'\u{1D465}'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'\u{1D436}'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'\u{1D461}'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'\u222A'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'\u25A1'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'\u{1F511}\uFE0E'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'\u25A2'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
var FieldPos = class {
  constructor(field, line, from, to) {
    this.field = field;
    this.line = line;
    this.from = from;
    this.to = to;
  }
};
var FieldRange = class _FieldRange {
  constructor(field, from, to) {
    this.field = field;
    this.from = from;
    this.to = to;
  }
  map(changes) {
    let from = changes.mapPos(this.from, -1, MapMode.TrackDel);
    let to = changes.mapPos(this.to, 1, MapMode.TrackDel);
    return from == null || to == null ? null : new _FieldRange(this.field, from, to);
  }
};
var Snippet = class _Snippet {
  constructor(lines, fieldPositions) {
    this.lines = lines;
    this.fieldPositions = fieldPositions;
  }
  instantiate(state, pos) {
    let text = [], lineStart = [pos];
    let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
    for (let line of this.lines) {
      if (text.length) {
        let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
        for (let i = 0; i < tabs; i++)
          indent += state.facet(indentUnit);
        lineStart.push(pos + indent.length - tabs);
        line = indent + line.slice(tabs);
      }
      text.push(line);
      pos += line.length + 1;
    }
    let ranges = this.fieldPositions.map((pos2) => new FieldRange(pos2.field, lineStart[pos2.line] + pos2.from, lineStart[pos2.line] + pos2.to));
    return { text, ranges };
  }
  static parse(template) {
    let fields = [];
    let lines = [], positions = [], m;
    for (let line of template.split(/\r\n?|\n/)) {
      while (m = /[#$]\{(?:(\d+)(?::([^{}]*))?|((?:\\[{}]|[^{}])*))\}/.exec(line)) {
        let seq = m[1] ? +m[1] : null, rawName = m[2] || m[3] || "", found = -1;
        if (seq === 0)
          seq = 1e9;
        let name2 = rawName.replace(/\\[{}]/g, (m2) => m2[1]);
        for (let i = 0; i < fields.length; i++) {
          if (seq != null ? fields[i].seq == seq : name2 ? fields[i].name == name2 : false)
            found = i;
        }
        if (found < 0) {
          let i = 0;
          while (i < fields.length && (seq == null || fields[i].seq != null && fields[i].seq < seq))
            i++;
          fields.splice(i, 0, { seq, name: name2 });
          found = i;
          for (let pos of positions)
            if (pos.field >= found)
              pos.field++;
        }
        for (let pos of positions)
          if (pos.line == lines.length && pos.from > m.index) {
            let snip = m[2] ? 3 + (m[1] || "").length : 2;
            pos.from -= snip;
            pos.to -= snip;
          }
        positions.push(new FieldPos(found, lines.length, m.index, m.index + name2.length));
        line = line.slice(0, m.index) + rawName + line.slice(m.index + m[0].length);
      }
      line = line.replace(/\\([{}])/g, (_, brace, index) => {
        for (let pos of positions)
          if (pos.line == lines.length && pos.from > index) {
            pos.from--;
            pos.to--;
          }
        return brace;
      });
      lines.push(line);
    }
    return new _Snippet(lines, positions);
  }
};
var fieldMarker = /* @__PURE__ */ Decoration.widget({ widget: /* @__PURE__ */ new class extends WidgetType {
  toDOM() {
    let span = document.createElement("span");
    span.className = "cm-snippetFieldPosition";
    return span;
  }
  ignoreEvent() {
    return false;
  }
}() });
var fieldRange = /* @__PURE__ */ Decoration.mark({ class: "cm-snippetField" });
var ActiveSnippet = class _ActiveSnippet {
  constructor(ranges, active) {
    this.ranges = ranges;
    this.active = active;
    this.deco = Decoration.set(ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)), true);
  }
  map(changes) {
    let ranges = [];
    for (let r of this.ranges) {
      let mapped = r.map(changes);
      if (!mapped)
        return null;
      ranges.push(mapped);
    }
    return new _ActiveSnippet(ranges, this.active);
  }
  selectionInsideField(sel) {
    return sel.ranges.every((range) => this.ranges.some((r) => r.field == this.active && r.from <= range.from && r.to >= range.to));
  }
};
var setActive = /* @__PURE__ */ StateEffect.define({
  map(value, changes) {
    return value && value.map(changes);
  }
});
var moveToField = /* @__PURE__ */ StateEffect.define();
var snippetState = /* @__PURE__ */ StateField.define({
  create() {
    return null;
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setActive))
        return effect.value;
      if (effect.is(moveToField) && value)
        return new ActiveSnippet(value.ranges, effect.value);
    }
    if (value && tr.docChanged)
      value = value.map(tr.changes);
    if (value && tr.selection && !value.selectionInsideField(tr.selection))
      value = null;
    return value;
  },
  provide: (f) => EditorView.decorations.from(f, (val) => val ? val.deco : Decoration.none)
});
function fieldSelection(ranges, field) {
  return EditorSelection.create(ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to)));
}
function snippet(template) {
  let snippet2 = Snippet.parse(template);
  return (editor, completion, from, to) => {
    let { text, ranges } = snippet2.instantiate(editor.state, from);
    let { main } = editor.state.selection;
    let spec = {
      changes: { from, to: to == main.from ? main.to : to, insert: Text.of(text) },
      scrollIntoView: true,
      annotations: completion ? [pickedCompletion.of(completion), Transaction.userEvent.of("input.complete")] : void 0
    };
    if (ranges.length)
      spec.selection = fieldSelection(ranges, 0);
    if (ranges.some((r) => r.field > 0)) {
      let active = new ActiveSnippet(ranges, 0);
      let effects = spec.effects = [setActive.of(active)];
      if (editor.state.field(snippetState, false) === void 0)
        effects.push(StateEffect.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, baseTheme3]));
    }
    editor.dispatch(editor.state.update(spec));
  };
}
function moveField(dir) {
  return ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active || dir < 0 && active.active == 0)
      return false;
    let next = active.active + dir, last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
    dispatch(state.update({
      selection: fieldSelection(active.ranges, next),
      effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next)),
      scrollIntoView: true
    }));
    return true;
  };
}
var clearSnippet = ({ state, dispatch }) => {
  let active = state.field(snippetState, false);
  if (!active)
    return false;
  dispatch(state.update({ effects: setActive.of(null) }));
  return true;
};
var nextSnippetField = /* @__PURE__ */ moveField(1);
var prevSnippetField = /* @__PURE__ */ moveField(-1);
var defaultSnippetKeymap = [
  { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
  { key: "Escape", run: clearSnippet }
];
var snippetKeymap = /* @__PURE__ */ Facet.define({
  combine(maps) {
    return maps.length ? maps[0] : defaultSnippetKeymap;
  }
});
var addSnippetKeymap = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.compute([snippetKeymap], (state) => state.facet(snippetKeymap)));
function snippetCompletion(template, completion) {
  return __spreadProps(__spreadValues({}, completion), { apply: snippet(template) });
}
var snippetPointerHandler = /* @__PURE__ */ EditorView.domEventHandlers({
  mousedown(event, view) {
    let active = view.state.field(snippetState, false), pos;
    if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
      return false;
    let match = active.ranges.find((r) => r.from <= pos && r.to >= pos);
    if (!match || match.field == active.active)
      return false;
    view.dispatch({
      selection: fieldSelection(active.ranges, match.field),
      effects: setActive.of(active.ranges.some((r) => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null),
      scrollIntoView: true
    });
    return true;
  }
});
var defaults = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>",
  stringPrefixes: []
};
var closeBracketEffect = /* @__PURE__ */ StateEffect.define({
  map(value, mapping) {
    let mapped = mapping.mapPos(value, -1, MapMode.TrackAfter);
    return mapped == null ? void 0 : mapped;
  }
});
var closedBracket = /* @__PURE__ */ new class extends RangeValue {
}();
closedBracket.startSide = 1;
closedBracket.endSide = -1;
var bracketState = /* @__PURE__ */ StateField.define({
  create() {
    return RangeSet.empty;
  },
  update(value, tr) {
    value = value.map(tr.changes);
    if (tr.selection) {
      let line = tr.state.doc.lineAt(tr.selection.main.head);
      value = value.update({ filter: (from) => from >= line.from && from <= line.to });
    }
    for (let effect of tr.effects)
      if (effect.is(closeBracketEffect))
        value = value.update({ add: [closedBracket.range(effect.value, effect.value + 1)] });
    return value;
  }
});
function closeBrackets() {
  return [inputHandler2, bracketState];
}
var definedClosing = "()[]{}<>\xAB\xBB\xBB\xAB\uFF3B\uFF3D\uFF5B\uFF5D";
function closing(ch) {
  for (let i = 0; i < definedClosing.length; i += 2)
    if (definedClosing.charCodeAt(i) == ch)
      return definedClosing.charAt(i + 1);
  return fromCodePoint(ch < 128 ? ch : ch + 1);
}
function config(state, pos) {
  return state.languageDataAt("closeBrackets", pos)[0] || defaults;
}
var android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
var inputHandler2 = /* @__PURE__ */ EditorView.inputHandler.of((view, from, to, insert2) => {
  if ((android ? view.composing : view.compositionStarted) || view.state.readOnly)
    return false;
  let sel = view.state.selection.main;
  if (insert2.length > 2 || insert2.length == 2 && codePointSize2(codePointAt2(insert2, 0)) == 1 || from != sel.from || to != sel.to)
    return false;
  let tr = insertBracket(view.state, insert2);
  if (!tr)
    return false;
  view.dispatch(tr);
  return true;
});
var deleteBracketPair = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let conf = config(state, state.selection.main.head);
  let tokens = conf.brackets || defaults.brackets;
  let dont = null, changes = state.changeByRange((range) => {
    if (range.empty) {
      let before = prevChar(state.doc, range.head);
      for (let token of tokens) {
        if (token == before && nextChar(state.doc, range.head) == closing(codePointAt2(token, 0)))
          return {
            changes: { from: range.head - token.length, to: range.head + token.length },
            range: EditorSelection.cursor(range.head - token.length)
          };
      }
    }
    return { range: dont = range };
  });
  if (!dont)
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "delete.backward" }));
  return !dont;
};
var closeBracketsKeymap = [
  { key: "Backspace", run: deleteBracketPair }
];
function insertBracket(state, bracket2) {
  let conf = config(state, state.selection.main.head);
  let tokens = conf.brackets || defaults.brackets;
  for (let tok of tokens) {
    let closed = closing(codePointAt2(tok, 0));
    if (bracket2 == tok)
      return closed == tok ? handleSame(state, tok, tokens.indexOf(tok + tok + tok) > -1, conf) : handleOpen(state, tok, closed, conf.before || defaults.before);
    if (bracket2 == closed && closedBracketAt(state, state.selection.main.from))
      return handleClose(state, tok, closed);
  }
  return null;
}
function closedBracketAt(state, pos) {
  let found = false;
  state.field(bracketState).between(0, state.doc.length, (from) => {
    if (from == pos)
      found = true;
  });
  return found;
}
function nextChar(doc2, pos) {
  let next = doc2.sliceString(pos, pos + 2);
  return next.slice(0, codePointSize2(codePointAt2(next, 0)));
}
function prevChar(doc2, pos) {
  let prev = doc2.sliceString(pos - 2, pos);
  return codePointSize2(codePointAt2(prev, 0)) == prev.length ? prev : prev.slice(1);
}
function handleOpen(state, open, close, closeBefore) {
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty)
      return {
        changes: [{ insert: open, from: range.from }, { insert: close, from: range.to }],
        effects: closeBracketEffect.of(range.to + open.length),
        range: EditorSelection.range(range.anchor + open.length, range.head + open.length)
      };
    let next = nextChar(state.doc, range.head);
    if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
      return {
        changes: { insert: open + close, from: range.head },
        effects: closeBracketEffect.of(range.head + open.length),
        range: EditorSelection.cursor(range.head + open.length)
      };
    return { range: dont = range };
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    userEvent: "input.type"
  });
}
function handleClose(state, _open, close) {
  let dont = null, changes = state.changeByRange((range) => {
    if (range.empty && nextChar(state.doc, range.head) == close)
      return {
        changes: { from: range.head, to: range.head + close.length, insert: close },
        range: EditorSelection.cursor(range.head + close.length)
      };
    return dont = { range };
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    userEvent: "input.type"
  });
}
function handleSame(state, token, allowTriple, config2) {
  let stringPrefixes = config2.stringPrefixes || defaults.stringPrefixes;
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty)
      return {
        changes: [{ insert: token, from: range.from }, { insert: token, from: range.to }],
        effects: closeBracketEffect.of(range.to + token.length),
        range: EditorSelection.range(range.anchor + token.length, range.head + token.length)
      };
    let pos = range.head, next = nextChar(state.doc, pos), start;
    if (next == token) {
      if (nodeStart(state, pos)) {
        return {
          changes: { insert: token + token, from: pos },
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
      } else if (closedBracketAt(state, pos)) {
        let isTriple = allowTriple && state.sliceDoc(pos, pos + token.length * 3) == token + token + token;
        let content2 = isTriple ? token + token + token : token;
        return {
          changes: { from: pos, to: pos + content2.length, insert: content2 },
          range: EditorSelection.cursor(pos + content2.length)
        };
      }
    } else if (allowTriple && state.sliceDoc(pos - 2 * token.length, pos) == token + token && (start = canStartStringAt(state, pos - 2 * token.length, stringPrefixes)) > -1 && nodeStart(state, start)) {
      return {
        changes: { insert: token + token + token + token, from: pos },
        effects: closeBracketEffect.of(pos + token.length),
        range: EditorSelection.cursor(pos + token.length)
      };
    } else if (state.charCategorizer(pos)(next) != CharCategory.Word) {
      if (canStartStringAt(state, pos, stringPrefixes) > -1 && !probablyInString(state, pos, token, stringPrefixes))
        return {
          changes: { insert: token + token, from: pos },
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
    }
    return { range: dont = range };
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    userEvent: "input.type"
  });
}
function nodeStart(state, pos) {
  let tree = syntaxTree(state).resolveInner(pos + 1);
  return tree.parent && tree.from == pos;
}
function probablyInString(state, pos, quoteToken, prefixes) {
  let node = syntaxTree(state).resolveInner(pos, -1);
  let maxPrefix = prefixes.reduce((m, p) => Math.max(m, p.length), 0);
  for (let i = 0; i < 5; i++) {
    let start = state.sliceDoc(node.from, Math.min(node.to, node.from + quoteToken.length + maxPrefix));
    let quotePos = start.indexOf(quoteToken);
    if (!quotePos || quotePos > -1 && prefixes.indexOf(start.slice(0, quotePos)) > -1) {
      let first = node.firstChild;
      while (first && first.from == node.from && first.to - first.from > quoteToken.length + quotePos) {
        if (state.sliceDoc(first.to - quoteToken.length, first.to) == quoteToken)
          return false;
        first = first.firstChild;
      }
      return true;
    }
    let parent = node.to == pos && node.parent;
    if (!parent)
      break;
    node = parent;
  }
  return false;
}
function canStartStringAt(state, pos, prefixes) {
  let charCat = state.charCategorizer(pos);
  if (charCat(state.sliceDoc(pos - 1, pos)) != CharCategory.Word)
    return pos;
  for (let prefix of prefixes) {
    let start = pos - prefix.length;
    if (state.sliceDoc(start, pos) == prefix && charCat(state.sliceDoc(start - 1, start)) != CharCategory.Word)
      return start;
  }
  return -1;
}
function autocompletion(config2 = {}) {
  return [
    commitCharacters,
    completionState,
    completionConfig.of(config2),
    completionPlugin,
    completionKeymapExt,
    baseTheme3
  ];
}
var completionKeymap = [
  { key: "Ctrl-Space", run: startCompletion },
  { mac: "Alt-`", run: startCompletion },
  { mac: "Alt-i", run: startCompletion },
  { key: "Escape", run: closeCompletion },
  { key: "ArrowDown", run: /* @__PURE__ */ moveCompletionSelection(true) },
  { key: "ArrowUp", run: /* @__PURE__ */ moveCompletionSelection(false) },
  { key: "PageDown", run: /* @__PURE__ */ moveCompletionSelection(true, "page") },
  { key: "PageUp", run: /* @__PURE__ */ moveCompletionSelection(false, "page") },
  { key: "Enter", run: acceptCompletion }
];
var completionKeymapExt = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.computeN([completionConfig], (state) => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));

// node_modules/@codemirror/lint/dist/index.js
var SelectedDiagnostic = class {
  constructor(from, to, diagnostic) {
    this.from = from;
    this.to = to;
    this.diagnostic = diagnostic;
  }
};
var LintState = class _LintState {
  constructor(diagnostics, panel, selected) {
    this.diagnostics = diagnostics;
    this.panel = panel;
    this.selected = selected;
  }
  static init(diagnostics, panel, state) {
    let diagnosticFilter = state.facet(lintConfig).markerFilter;
    if (diagnosticFilter)
      diagnostics = diagnosticFilter(diagnostics, state);
    let sorted = diagnostics.slice().sort((a, b) => a.from - b.from || a.to - b.to);
    let deco = new RangeSetBuilder(), active = [], pos = 0;
    let scan = state.doc.iter(), scanPos = 0, docLen = state.doc.length;
    for (let i = 0; ; ) {
      let next = i == sorted.length ? null : sorted[i];
      if (!next && !active.length)
        break;
      let from, to;
      if (active.length) {
        from = pos;
        to = active.reduce((p, d) => Math.min(p, d.to), next && next.from > from ? next.from : 1e8);
      } else {
        from = next.from;
        if (from > docLen)
          break;
        to = next.to;
        active.push(next);
        i++;
      }
      while (i < sorted.length) {
        let next2 = sorted[i];
        if (next2.from == from && (next2.to > next2.from || next2.to == from)) {
          active.push(next2);
          i++;
          to = Math.min(next2.to, to);
        } else {
          to = Math.min(next2.from, to);
          break;
        }
      }
      to = Math.min(to, docLen);
      let widget = false;
      if (active.some((d) => d.from == from && (d.to == to || to == docLen))) {
        widget = from == to;
        if (!widget && to - from < 10) {
          let behind = from - (scanPos + scan.value.length);
          if (behind > 0) {
            scan.next(behind);
            scanPos = from;
          }
          for (let check = from; ; ) {
            if (check >= to) {
              widget = true;
              break;
            }
            if (!scan.lineBreak && scanPos + scan.value.length > check)
              break;
            check = scanPos + scan.value.length;
            scanPos += scan.value.length;
            scan.next();
          }
        }
      }
      let sev = maxSeverity(active);
      if (widget) {
        deco.add(from, from, Decoration.widget({
          widget: new DiagnosticWidget(sev),
          diagnostics: active.slice()
        }));
      } else {
        let markClass = active.reduce((c, d) => d.markClass ? c + " " + d.markClass : c, "");
        deco.add(from, to, Decoration.mark({
          class: "cm-lintRange cm-lintRange-" + sev + markClass,
          diagnostics: active.slice(),
          inclusiveEnd: active.some((a) => a.to > to)
        }));
      }
      pos = to;
      if (pos == docLen)
        break;
      for (let i2 = 0; i2 < active.length; i2++)
        if (active[i2].to <= pos)
          active.splice(i2--, 1);
    }
    let set = deco.finish();
    return new _LintState(set, panel, findDiagnostic(set));
  }
};
function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
  let found = null;
  diagnostics.between(after, 1e9, (from, to, { spec }) => {
    if (diagnostic && spec.diagnostics.indexOf(diagnostic) < 0)
      return;
    if (!found)
      found = new SelectedDiagnostic(from, to, diagnostic || spec.diagnostics[0]);
    else if (spec.diagnostics.indexOf(found.diagnostic) < 0)
      return false;
    else
      found = new SelectedDiagnostic(found.from, to, found.diagnostic);
  });
  return found;
}
function hideTooltip(tr, tooltip) {
  let from = tooltip.pos, to = tooltip.end || from;
  let result = tr.state.facet(lintConfig).hideOn(tr, from, to);
  if (result != null)
    return result;
  let line = tr.startState.doc.lineAt(tooltip.pos);
  return !!(tr.effects.some((e) => e.is(setDiagnosticsEffect)) || tr.changes.touchesRange(line.from, Math.max(line.to, to)));
}
function maybeEnableLint(state, effects) {
  return state.field(lintState, false) ? effects : effects.concat(StateEffect.appendConfig.of(lintExtensions));
}
function setDiagnostics(state, diagnostics) {
  return {
    effects: maybeEnableLint(state, [setDiagnosticsEffect.of(diagnostics)])
  };
}
var setDiagnosticsEffect = /* @__PURE__ */ StateEffect.define();
var togglePanel = /* @__PURE__ */ StateEffect.define();
var movePanelSelection = /* @__PURE__ */ StateEffect.define();
var lintState = /* @__PURE__ */ StateField.define({
  create() {
    return new LintState(Decoration.none, null, null);
  },
  update(value, tr) {
    if (tr.docChanged && value.diagnostics.size) {
      let mapped = value.diagnostics.map(tr.changes), selected = null, panel = value.panel;
      if (value.selected) {
        let selPos = tr.changes.mapPos(value.selected.from, 1);
        selected = findDiagnostic(mapped, value.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
      }
      if (!mapped.size && panel && tr.state.facet(lintConfig).autoPanel)
        panel = null;
      value = new LintState(mapped, panel, selected);
    }
    for (let effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        let panel = !tr.state.facet(lintConfig).autoPanel ? value.panel : effect.value.length ? LintPanel.open : null;
        value = LintState.init(effect.value, panel, tr.state);
      } else if (effect.is(togglePanel)) {
        value = new LintState(value.diagnostics, effect.value ? LintPanel.open : null, value.selected);
      } else if (effect.is(movePanelSelection)) {
        value = new LintState(value.diagnostics, value.panel, effect.value);
      }
    }
    return value;
  },
  provide: (f) => [
    showPanel.from(f, (val) => val.panel),
    EditorView.decorations.from(f, (s) => s.diagnostics)
  ]
});
var activeMark = /* @__PURE__ */ Decoration.mark({ class: "cm-lintRange cm-lintRange-active" });
function lintTooltip(view, pos, side) {
  let { diagnostics } = view.state.field(lintState);
  let found, start = -1, end = -1;
  diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to, { spec }) => {
    if (pos >= from && pos <= to && (from == to || (pos > from || side > 0) && (pos < to || side < 0))) {
      found = spec.diagnostics;
      start = from;
      end = to;
      return false;
    }
  });
  let diagnosticFilter = view.state.facet(lintConfig).tooltipFilter;
  if (found && diagnosticFilter)
    found = diagnosticFilter(found, view.state);
  if (!found)
    return null;
  return {
    pos: start,
    end,
    above: true,
    create() {
      return { dom: diagnosticsTooltip(view, found) };
    }
  };
}
function diagnosticsTooltip(view, diagnostics) {
  return crelt("ul", { class: "cm-tooltip-lint" }, diagnostics.map((d) => renderDiagnostic(view, d, false)));
}
var closeLintPanel = (view) => {
  let field = view.state.field(lintState, false);
  if (!field || !field.panel)
    return false;
  view.dispatch({ effects: togglePanel.of(false) });
  return true;
};
var lintPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.timeout = -1;
    this.set = true;
    let { delay } = view.state.facet(lintConfig);
    this.lintTime = Date.now() + delay;
    this.run = this.run.bind(this);
    this.timeout = setTimeout(this.run, delay);
  }
  run() {
    clearTimeout(this.timeout);
    let now = Date.now();
    if (now < this.lintTime - 10) {
      this.timeout = setTimeout(this.run, this.lintTime - now);
    } else {
      this.set = false;
      let { state } = this.view, { sources } = state.facet(lintConfig);
      if (sources.length)
        batchResults(sources.map((s) => Promise.resolve(s(this.view))), (annotations) => {
          if (this.view.state.doc == state.doc)
            this.view.dispatch(setDiagnostics(this.view.state, annotations.reduce((a, b) => a.concat(b))));
        }, (error) => {
          logException(this.view.state, error);
        });
    }
  }
  update(update) {
    let config2 = update.state.facet(lintConfig);
    if (update.docChanged || config2 != update.startState.facet(lintConfig) || config2.needsRefresh && config2.needsRefresh(update)) {
      this.lintTime = Date.now() + config2.delay;
      if (!this.set) {
        this.set = true;
        this.timeout = setTimeout(this.run, config2.delay);
      }
    }
  }
  force() {
    if (this.set) {
      this.lintTime = Date.now();
      this.run();
    }
  }
  destroy() {
    clearTimeout(this.timeout);
  }
});
function batchResults(promises, sink, error) {
  let collected = [], timeout = -1;
  for (let p of promises)
    p.then((value) => {
      collected.push(value);
      clearTimeout(timeout);
      if (collected.length == promises.length)
        sink(collected);
      else
        timeout = setTimeout(() => sink(collected), 200);
    }, error);
}
var lintConfig = /* @__PURE__ */ Facet.define({
  combine(input) {
    return __spreadValues({
      sources: input.map((i) => i.source).filter((x) => x != null)
    }, combineConfig(input.map((i) => i.config), {
      delay: 750,
      markerFilter: null,
      tooltipFilter: null,
      needsRefresh: null,
      hideOn: () => null
    }, {
      delay: Math.max,
      markerFilter: combineFilter,
      tooltipFilter: combineFilter,
      needsRefresh: (a, b) => !a ? b : !b ? a : (u) => a(u) || b(u),
      hideOn: (a, b) => !a ? b : !b ? a : (t2, x, y) => a(t2, x, y) || b(t2, x, y),
      autoPanel: (a, b) => a || b
    }));
  }
});
function combineFilter(a, b) {
  return !a ? b : !b ? a : (d, s) => b(a(d, s), s);
}
function linter(source, config2 = {}) {
  return [
    lintConfig.of({ source, config: config2 }),
    lintPlugin,
    lintExtensions
  ];
}
function assignKeys(actions) {
  let assigned = [];
  if (actions)
    actions: for (let { name: name2 } of actions) {
      for (let i = 0; i < name2.length; i++) {
        let ch = name2[i];
        if (/[a-zA-Z]/.test(ch) && !assigned.some((c) => c.toLowerCase() == ch.toLowerCase())) {
          assigned.push(ch);
          continue actions;
        }
      }
      assigned.push("");
    }
  return assigned;
}
function renderDiagnostic(view, diagnostic, inPanel) {
  var _a2;
  let keys = inPanel ? assignKeys(diagnostic.actions) : [];
  return crelt("li", { class: "cm-diagnostic cm-diagnostic-" + diagnostic.severity }, crelt("span", { class: "cm-diagnosticText" }, diagnostic.renderMessage ? diagnostic.renderMessage(view) : diagnostic.message), (_a2 = diagnostic.actions) === null || _a2 === void 0 ? void 0 : _a2.map((action, i) => {
    let fired = false, click = (e) => {
      e.preventDefault();
      if (fired)
        return;
      fired = true;
      let found = findDiagnostic(view.state.field(lintState).diagnostics, diagnostic);
      if (found)
        action.apply(view, found.from, found.to);
    };
    let { name: name2 } = action, keyIndex = keys[i] ? name2.indexOf(keys[i]) : -1;
    let nameElt = keyIndex < 0 ? name2 : [
      name2.slice(0, keyIndex),
      crelt("u", name2.slice(keyIndex, keyIndex + 1)),
      name2.slice(keyIndex + 1)
    ];
    let markClass = action.markClass ? " " + action.markClass : "";
    return crelt("button", {
      type: "button",
      class: "cm-diagnosticAction" + markClass,
      onclick: click,
      onmousedown: click,
      "aria-label": ` Action: ${name2}${keyIndex < 0 ? "" : ` (access key "${keys[i]})"`}.`
    }, nameElt);
  }), diagnostic.source && crelt("div", { class: "cm-diagnosticSource" }, diagnostic.source));
}
var DiagnosticWidget = class extends WidgetType {
  constructor(sev) {
    super();
    this.sev = sev;
  }
  eq(other) {
    return other.sev == this.sev;
  }
  toDOM() {
    return crelt("span", { class: "cm-lintPoint cm-lintPoint-" + this.sev });
  }
};
var PanelItem = class {
  constructor(view, diagnostic) {
    this.diagnostic = diagnostic;
    this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
    this.dom = renderDiagnostic(view, diagnostic, true);
    this.dom.id = this.id;
    this.dom.setAttribute("role", "option");
  }
};
var LintPanel = class _LintPanel {
  constructor(view) {
    this.view = view;
    this.items = [];
    let onkeydown = (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey)
        return;
      if (event.keyCode == 27) {
        closeLintPanel(this.view);
        this.view.focus();
      } else if (event.keyCode == 38 || event.keyCode == 33) {
        this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
      } else if (event.keyCode == 40 || event.keyCode == 34) {
        this.moveSelection((this.selectedIndex + 1) % this.items.length);
      } else if (event.keyCode == 36) {
        this.moveSelection(0);
      } else if (event.keyCode == 35) {
        this.moveSelection(this.items.length - 1);
      } else if (event.keyCode == 13) {
        this.view.focus();
      } else if (event.keyCode >= 65 && event.keyCode <= 90 && this.selectedIndex >= 0) {
        let { diagnostic } = this.items[this.selectedIndex], keys = assignKeys(diagnostic.actions);
        for (let i = 0; i < keys.length; i++)
          if (keys[i].toUpperCase().charCodeAt(0) == event.keyCode) {
            let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
            if (found)
              diagnostic.actions[i].apply(view, found.from, found.to);
          }
      } else {
        return;
      }
      event.preventDefault();
    };
    let onclick = (event) => {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].dom.contains(event.target))
          this.moveSelection(i);
      }
    };
    this.list = crelt("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown,
      onclick
    });
    this.dom = crelt("div", { class: "cm-panel-lint" }, this.list, crelt("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => closeLintPanel(this.view)
    }, "\xD7"));
    this.update();
  }
  get selectedIndex() {
    let selected = this.view.state.field(lintState).selected;
    if (!selected)
      return -1;
    for (let i = 0; i < this.items.length; i++)
      if (this.items[i].diagnostic == selected.diagnostic)
        return i;
    return -1;
  }
  update() {
    let { diagnostics, selected } = this.view.state.field(lintState);
    let i = 0, needsSync = false, newSelectedItem = null;
    let seen = /* @__PURE__ */ new Set();
    diagnostics.between(0, this.view.state.doc.length, (_start, _end, { spec }) => {
      for (let diagnostic of spec.diagnostics) {
        if (seen.has(diagnostic))
          continue;
        seen.add(diagnostic);
        let found = -1, item;
        for (let j = i; j < this.items.length; j++)
          if (this.items[j].diagnostic == diagnostic) {
            found = j;
            break;
          }
        if (found < 0) {
          item = new PanelItem(this.view, diagnostic);
          this.items.splice(i, 0, item);
          needsSync = true;
        } else {
          item = this.items[found];
          if (found > i) {
            this.items.splice(i, found - i);
            needsSync = true;
          }
        }
        if (selected && item.diagnostic == selected.diagnostic) {
          if (!item.dom.hasAttribute("aria-selected")) {
            item.dom.setAttribute("aria-selected", "true");
            newSelectedItem = item;
          }
        } else if (item.dom.hasAttribute("aria-selected")) {
          item.dom.removeAttribute("aria-selected");
        }
        i++;
      }
    });
    while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
      needsSync = true;
      this.items.pop();
    }
    if (this.items.length == 0) {
      this.items.push(new PanelItem(this.view, {
        from: -1,
        to: -1,
        severity: "info",
        message: this.view.state.phrase("No diagnostics")
      }));
      needsSync = true;
    }
    if (newSelectedItem) {
      this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
      this.view.requestMeasure({
        key: this,
        read: () => ({ sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
        write: ({ sel, panel }) => {
          let scaleY = panel.height / this.list.offsetHeight;
          if (sel.top < panel.top)
            this.list.scrollTop -= (panel.top - sel.top) / scaleY;
          else if (sel.bottom > panel.bottom)
            this.list.scrollTop += (sel.bottom - panel.bottom) / scaleY;
        }
      });
    } else if (this.selectedIndex < 0) {
      this.list.removeAttribute("aria-activedescendant");
    }
    if (needsSync)
      this.sync();
  }
  sync() {
    let domPos = this.list.firstChild;
    function rm2() {
      let prev = domPos;
      domPos = prev.nextSibling;
      prev.remove();
    }
    for (let item of this.items) {
      if (item.dom.parentNode == this.list) {
        while (domPos != item.dom)
          rm2();
        domPos = item.dom.nextSibling;
      } else {
        this.list.insertBefore(item.dom, domPos);
      }
    }
    while (domPos)
      rm2();
  }
  moveSelection(selectedIndex) {
    if (this.selectedIndex < 0)
      return;
    let field = this.view.state.field(lintState);
    let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
    if (!selection)
      return;
    this.view.dispatch({
      selection: { anchor: selection.from, head: selection.to },
      scrollIntoView: true,
      effects: movePanelSelection.of(selection)
    });
  }
  static open(view) {
    return new _LintPanel(view);
  }
};
function svg(content2, attrs = `viewBox="0 0 40 40"`) {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content2)}</svg>')`;
}
function underline(color) {
  return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`, `width="6" height="3"`);
}
var baseTheme4 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-diagnostic": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap"
  },
  ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
  ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
  ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
  ".cm-diagnostic-hint": { borderLeft: "5px solid #66d" },
  ".cm-diagnosticAction": {
    font: "inherit",
    border: "none",
    padding: "2px 4px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "3px",
    marginLeft: "8px",
    cursor: "pointer"
  },
  ".cm-diagnosticSource": {
    fontSize: "70%",
    opacity: 0.7
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px"
  },
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ underline("#f11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ underline("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ underline("#999") },
  ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ underline("#66d") },
  ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
  ".cm-tooltip-lint": {
    padding: 0,
    margin: 0
  },
  ".cm-lintPoint": {
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "-2px",
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderBottom: "4px solid #d11"
    }
  },
  ".cm-lintPoint-warning": {
    "&:after": { borderBottomColor: "orange" }
  },
  ".cm-lintPoint-info": {
    "&:after": { borderBottomColor: "#999" }
  },
  ".cm-lintPoint-hint": {
    "&:after": { borderBottomColor: "#66d" }
  },
  ".cm-panel.cm-panel-lint": {
    position: "relative",
    "& ul": {
      maxHeight: "100px",
      overflowY: "auto",
      "& [aria-selected]": {
        backgroundColor: "#ddd",
        "& u": { textDecoration: "underline" }
      },
      "&:focus [aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      },
      "& u": { textDecoration: "none" },
      padding: 0,
      margin: 0
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "2px",
      background: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    }
  },
  "&dark .cm-lintRange-active": { backgroundColor: "#86714a80" },
  "&dark .cm-panel.cm-panel-lint ul": {
    "& [aria-selected]": {
      backgroundColor: "#2e343e"
    }
  }
});
function severityWeight(sev) {
  return sev == "error" ? 4 : sev == "warning" ? 3 : sev == "info" ? 2 : 1;
}
function maxSeverity(diagnostics) {
  let sev = "hint", weight = 1;
  for (let d of diagnostics) {
    let w = severityWeight(d.severity);
    if (w > weight) {
      weight = w;
      sev = d.severity;
    }
  }
  return sev;
}
var lintHover = /* @__PURE__ */ hoverTooltip(lintTooltip, { hideOn: hideTooltip });
var lintExtensions = [
  lintState,
  /* @__PURE__ */ EditorView.decorations.compute([lintState], (state) => {
    let { selected, panel } = state.field(lintState);
    return !selected || !panel || selected.from == selected.to ? Decoration.none : Decoration.set([
      activeMark.range(selected.from, selected.to)
    ]);
  }),
  lintHover,
  baseTheme4
];

// src/app/scripting/script-editor/failscript-cm.ts
var failscriptStream = StreamLanguage.define({
  startState: () => ({ inComment: false }),
  token(stream, state) {
    if (state.inComment) {
      if (stream.match(/^.*?\*\//))
        state.inComment = false;
      else
        stream.skipToEnd();
      return "comment";
    }
    if (stream.eatSpace())
      return null;
    if (stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }
    if (stream.match("/*")) {
      if (!stream.match(/^.*?\*\//)) {
        state.inComment = true;
        stream.skipToEnd();
      }
      return "comment";
    }
    if (stream.match(/^"(?:[^"\\]|\\.)*"?/))
      return "string";
    if (stream.match(/^\d+d\d+/))
      return "dice";
    if (stream.match(/^\d+(?:\.\d+)?/))
      return "number";
    const word = stream.match(/^[A-Za-z_]\w*/);
    if (word) {
      const w = word[0];
      if (KEYWORDS.has(w))
        return "keyword";
      if (BUILTINS.some((f) => f.name === w))
        return "function";
      if (SYMBOL_MAP.has(w))
        return "symbol";
      return "variable";
    }
    if (stream.match(/^(?:&&|\|\||[+\-*/%<>=!]=?)/))
      return "operator";
    stream.next();
    return null;
  },
  tokenTable: {
    keyword: tags.keyword,
    comment: tags.comment,
    string: tags.string,
    number: tags.number,
    dice: tags.atom,
    function: tags.function(tags.variableName),
    symbol: tags.propertyName,
    variable: tags.variableName,
    operator: tags.operator
  }
});
var highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c792ea", fontWeight: "bold" },
  { tag: tags.comment, color: "#6b7280", fontStyle: "italic" },
  { tag: tags.string, color: "#c3e88d" },
  { tag: tags.number, color: "#f78c6c" },
  { tag: tags.atom, color: "#ffcb6b", fontWeight: "bold" },
  // dice literals
  { tag: tags.function(tags.variableName), color: "#82aaff" },
  { tag: tags.propertyName, color: "#89ddff" },
  // game symbols
  { tag: tags.variableName, color: "#e5e7eb" },
  { tag: tags.operator, color: "#89ddff" }
]);
var STYLE_INFO = {
  good: "Gr\xFCn \u2014 positiv",
  bad: "Rot \u2014 negativ",
  neutral: "Grau \u2014 neutral",
  info: "Blau \u2014 Info"
};
function enclosingCall(text) {
  let depth = 0;
  let commas = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const c = text[i];
    if (c === ")")
      depth++;
    else if (c === "(") {
      if (depth === 0) {
        const m = text.slice(0, i).match(/([A-Za-z_]\w*)\s*$/);
        return m ? { name: m[1], argIndex: commas } : null;
      }
      depth--;
    } else if (c === "," && depth === 0) {
      commas++;
    }
  }
  return null;
}
function argChoiceOptions(call) {
  if (call.name === "grantSkill") {
    if (call.argIndex === 2) {
      return [...ACTION_TYPE_NAMES].map((a) => ({ label: a, type: "enum", detail: "Aktionstyp", info: ACTION_TYPE_INFO[a], boost: 80 }));
    }
    return null;
  }
  if (call.name === "giveStatus") {
    if (call.argIndex === 4) {
      return ICON_CHOICES.map((c) => ({
        label: `${c.icon} ${c.label}`,
        type: "enum",
        detail: "Icon",
        apply: `"${c.icon}"`,
        boost: 80
      }));
    }
    if (call.argIndex === 5) {
      return [...POLARITY_NAMES].map((p) => ({ label: p, type: "enum", detail: "Art", info: POLARITY_INFO[p], boost: 80 }));
    }
    return null;
  }
  const fn = BUILTIN_MAP.get(call.name);
  if (!fn)
    return null;
  if (fn.resourceFirstArg && call.argIndex === 0) {
    return [...RESOURCE_NAMES].map((r) => ({ label: r, type: "enum", detail: "Ressource", info: RESOURCE_INFO[r], boost: 80 }));
  }
  if (fn.styleArgIndex === call.argIndex) {
    return [...STYLE_NAMES].map((s) => ({ label: s, type: "enum", detail: "Stil", info: STYLE_INFO[s], boost: 80 }));
  }
  return null;
}
function localVarNames(doc2) {
  const names = /* @__PURE__ */ new Set();
  const re = /\bvar\s+([A-Za-z_]\w*)/g;
  let m;
  while (m = re.exec(doc2))
    names.add(m[1]);
  return [...names];
}
function completions(context) {
  const before = context.matchBefore(/[A-Za-z_][\w.]*/);
  const textBefore = context.state.doc.sliceString(0, context.pos);
  const call = enclosingCall(textBefore);
  const argChoices = call ? argChoiceOptions(call) : null;
  if (argChoices && (before || /[(,]\s*$/.test(textBefore) || context.explicit)) {
    return { from: before ? before.from : context.pos, options: argChoices, validFor: /^\w*$/ };
  }
  if (!before && !context.explicit)
    return null;
  const text = before ? before.text : "";
  const dot = text.lastIndexOf(".");
  if (dot >= 0) {
    const objName = text.slice(0, dot);
    const from2 = before.from + dot + 1;
    if (objName === "talent") {
      return { from: from2, options: TALENT_INFO.map((tl) => ({ label: tl.id, type: "property", detail: tl.statLabel, info: `${tl.name} \u2014 ${tl.description}` })) };
    }
    if (SYMBOL_MAP.get(objName)?.category === "attribute") {
      return { from: from2, options: Object.entries(ATTRIBUTE_MEMBERS).map(([k, v]) => ({ label: k, type: "property", info: v })) };
    }
    return null;
  }
  const from = before ? before.from : context.pos;
  const options = [
    ...KEYWORD_INFO.map((k) => k.snippet ? snippetCompletion(k.snippet, { label: k.name, type: "keyword", info: k.description }) : { label: k.name, type: "keyword", info: k.description }),
    ...BUILTINS.map((f) => snippetCompletion(`${f.name}(${"${}"})`, { label: f.name, type: "function", detail: f.signature, info: f.description })),
    ...SYMBOLS.filter((s) => s.category !== "namespace").map((s) => ({ label: s.name, type: "variable", detail: s.category, info: s.description })),
    { label: "talent", type: "namespace", info: "Talent-W\xFCrfelboni: talent.<name>" },
    ...localVarNames(context.state.doc.toString()).map((n) => ({ label: n, type: "variable", detail: "lokal" }))
  ];
  return { from, options, validFor: /^[\w]*$/ };
}
var failscriptLinter = linter((view) => {
  const doc2 = view.state.doc.toString();
  const len = doc2.length;
  return compileScript(doc2).diagnostics.map((d) => ({
    from: Math.min(d.from, len),
    to: Math.min(Math.max(d.to, d.from + 1), len),
    severity: d.severity,
    message: d.message
  }));
}, { delay: 300 });
var failscriptHover = hoverTooltip((view, pos) => {
  const { text, from } = view.state.doc.lineAt(pos);
  const rel = pos - from;
  const re = /[A-Za-z_]\w*/g;
  let m;
  while (m = re.exec(text)) {
    const start = m.index, end = m.index + m[0].length;
    if (rel >= start && rel <= end) {
      const word = m[0];
      const info = describeSymbol(word);
      if (!info)
        return null;
      return {
        pos: from + start,
        end: from + end,
        above: true,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "fs-hover";
          dom.textContent = info;
          return { dom };
        }
      };
    }
  }
  return null;
});
function describeSymbol(word) {
  const sym = SYMBOL_MAP.get(word);
  if (sym)
    return `${word} \u2014 ${sym.description}`;
  const fn = BUILTINS.find((f) => f.name === word);
  if (fn)
    return `${fn.signature} \u2014 ${fn.description}`;
  const kw = KEYWORD_INFO.find((k) => k.name === word);
  if (kw)
    return `${word} \u2014 ${kw.description}`;
  if (STYLE_INFO[word])
    return `${word} (Stil) \u2014 ${STYLE_INFO[word]}`;
  return null;
}
var editorTheme = EditorView.theme({
  "&": { fontSize: "13px", height: "100%", color: "#e5e7eb", backgroundColor: "#0f172a" },
  "&.cm-focused": { outline: "none" },
  ".cm-content": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-gutters": { backgroundColor: "#0b1220", color: "#4b5563", border: "none", borderRight: "1px solid #1f2937" },
  ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.03)" },
  ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.05)" },
  ".cm-tooltip": { backgroundColor: "#1f2937", border: "1px solid #374151", color: "#e5e7eb", borderRadius: "6px" },
  ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "#3b82f6", color: "#fff" },
  ".fs-hover": { padding: "4px 8px", maxWidth: "320px", font: "12px/1.4 sans-serif" }
}, { dark: true });
function formatFailScript(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let depth = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      out.push("");
      continue;
    }
    const lead = line.match(/^\}+/)?.[0].length ?? 0;
    const thisDepth = Math.max(0, depth - lead);
    out.push("  ".repeat(thisDepth) + line);
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    depth = Math.max(0, depth + opens - closes);
  }
  return out.join("\n");
}
var autoOpenArgChoices = EditorView.updateListener.of((update) => {
  if (!update.docChanged)
    return;
  let trigger = false;
  update.changes.iterChanges((_fa, _ta, _fb, _tb, inserted) => {
    const t2 = inserted.toString();
    if (t2 === "(" || t2 === ",")
      trigger = true;
  });
  if (!trigger)
    return;
  const pos = update.state.selection.main.head;
  const call = enclosingCall(update.state.doc.sliceString(0, pos));
  if (call && argChoiceOptions(call)) {
    setTimeout(() => startCompletion(update.view), 0);
  }
});
function failscriptExtensions() {
  return [
    failscriptStream,
    syntaxHighlighting(highlightStyle),
    autocompletion({ override: [completions], activateOnTyping: true }),
    autoOpenArgChoices,
    failscriptLinter,
    failscriptHover,
    editorTheme
  ];
}

// src/app/scripting/script-editor/script-editor.component.ts
var _c0 = ["host"];
var _forTrack0 = ($index, $item) => $item.title;
var _forTrack1 = ($index, $item) => $item.label;
function ScriptEditorComponent_Conditional_15_Conditional_6_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 15);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const e_r4 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u26A0 ", e_r4);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, ScriptEditorComponent_Conditional_15_Conditional_6_For_1_Template, 2, 1, "div", 15, \u0275\u0275repeaterTrackByIndex);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r2.testResult.errors);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 16);
    \u0275\u0275text(1, "L\xE4uft \u2014 keine sichtbare Ausgabe.");
    \u0275\u0275elementEnd();
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_0_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 20);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("ngClass", "ds-" + d_r5.style);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(d_r5.text);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21)(1, "span", 24);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 25);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const d_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("ngClass", "ds-" + d_r5.style);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(d_r5.label);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(d_r5.value);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22)(1, "span", 26);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const d_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275property("ngClass", "ds-" + d_r5.style);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(d_r5.text);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 23);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const d_r5 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("ngClass", "ds-" + d_r5.style);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(d_r5.text);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_0_Template, 2, 2, "div", 20)(1, ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_1_Template, 5, 3, "div", 21)(2, ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_2_Template, 3, 2, "div", 22)(3, ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Case_3_Template, 2, 2, "div", 23);
  }
  if (rf & 2) {
    let tmp_13_0;
    const d_r5 = ctx.$implicit;
    \u0275\u0275conditional((tmp_13_0 = d_r5.type) === "banner" ? 0 : tmp_13_0 === "stat" ? 1 : tmp_13_0 === "box" ? 2 : 3);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 27);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const rc_r6 = ctx.$implicit;
    \u0275\u0275classProp("gain", rc_r6.amount > 0)("loss", rc_r6.amount < 0);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3("", rc_r6.resource, ": ", rc_r6.amount > 0 ? "+" : "", "", rc_r6.amount);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_5_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementStart(2, "b");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const r_r7 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", r_r7.formula, "=");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(r_r7.total);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 18);
    \u0275\u0275text(1, "\u{1F3B2} ");
    \u0275\u0275repeaterCreate(2, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_5_For_3_Template, 4, 2, "span", null, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.testResult.rolls);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 28);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const m_r8 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(4);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate3("\u27F3 ", m_r8.target, " ", ctx_r2.opSign(m_r8.op), " ", m_r8.amount);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_For_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const g_r9 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\u271A ", g_r9.name);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_For_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const o_r10 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate2("", o_r10.op === "apply" ? "\uFF0B" : "\uFF0D", " ", o_r10.id);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19);
    \u0275\u0275repeaterCreate(1, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_For_2_Template, 2, 3, "span", 28, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275repeaterCreate(3, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_For_4_Template, 2, 1, "span", null, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275repeaterCreate(5, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_For_6_Template, 2, 2, "span", null, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.testResult.modifiers);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.testResult.grantedSkills);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.testResult.statusOps);
  }
}
function ScriptEditorComponent_Conditional_15_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275conditionalCreate(0, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_0_Template, 2, 0, "div", 16);
    \u0275\u0275repeaterCreate(1, ScriptEditorComponent_Conditional_15_Conditional_7_For_2_Template, 4, 1, null, null, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275repeaterCreate(3, ScriptEditorComponent_Conditional_15_Conditional_7_For_4_Template, 2, 7, "div", 17, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275conditionalCreate(5, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_5_Template, 4, 0, "div", 18);
    \u0275\u0275conditionalCreate(6, ScriptEditorComponent_Conditional_15_Conditional_7_Conditional_6_Template, 7, 0, "div", 19);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275conditional(!ctx_r2.testResult.displays.length && !ctx_r2.testResult.resourceChanges.length && !ctx_r2.testResult.rolls.length ? 0 : -1);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.testResult.displays);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r2.testResult.resourceChanges);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r2.testResult.rolls.length ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r2.testResult.modifiers.length || ctx_r2.testResult.grantedSkills.length || ctx_r2.testResult.statusOps.length ? 6 : -1);
  }
}
function ScriptEditorComponent_Conditional_15_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 9)(1, "div", 13)(2, "span");
    \u0275\u0275text(3, "Testlauf (Dummy-Charakter)");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 14);
    \u0275\u0275listener("click", function ScriptEditorComponent_Conditional_15_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r2);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.testResult = null);
    });
    \u0275\u0275text(5, "\u2715");
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(6, ScriptEditorComponent_Conditional_15_Conditional_6_Template, 2, 0)(7, ScriptEditorComponent_Conditional_15_Conditional_7_Template, 7, 3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance(6);
    \u0275\u0275conditional(ctx_r2.testResult.errors.length ? 6 : 7);
  }
}
function ScriptEditorComponent_Conditional_19_For_3_For_4_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 35);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r13 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(item_r13.detail);
  }
}
function ScriptEditorComponent_Conditional_19_For_3_For_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r12 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 33);
    \u0275\u0275listener("click", function ScriptEditorComponent_Conditional_19_For_3_For_4_Template_button_click_0_listener() {
      const item_r13 = \u0275\u0275restoreView(_r12).$implicit;
      const ctx_r2 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r2.insert(item_r13.insert));
    });
    \u0275\u0275elementStart(1, "span", 34);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, ScriptEditorComponent_Conditional_19_For_3_For_4_Conditional_3_Template, 2, 1, "span", 35);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const item_r13 = ctx.$implicit;
    \u0275\u0275property("title", item_r13.info || "");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(item_r13.label);
    \u0275\u0275advance();
    \u0275\u0275conditional(item_r13.detail ? 3 : -1);
  }
}
function ScriptEditorComponent_Conditional_19_For_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 30)(1, "div", 31);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(3, ScriptEditorComponent_Conditional_19_For_3_For_4_Template, 4, 3, "button", 32, _forTrack1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const group_r14 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(group_r14.title);
    \u0275\u0275advance();
    \u0275\u0275repeater(group_r14.items);
  }
}
function ScriptEditorComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 12)(1, "input", 29);
    \u0275\u0275listener("input", function ScriptEditorComponent_Conditional_19_Template_input_input_1_listener($event) {
      \u0275\u0275restoreView(_r11);
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.search.set($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(2, ScriptEditorComponent_Conditional_19_For_3_Template, 5, 1, "div", 30, _forTrack0);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("value", ctx_r2.search());
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.filteredGroups());
  }
}
var ScriptEditorComponent = class _ScriptEditorComponent {
  value = "";
  placeholder = "// Skript \u2026 Tippe f\xFCr Autovervollst\xE4ndigung";
  valueChange = new EventEmitter();
  host;
  view;
  refOpen = signal(true, ...ngDevMode ? [{ debugName: "refOpen" }] : []);
  search = signal("", ...ngDevMode ? [{ debugName: "search" }] : []);
  // Test-run against a dummy character.
  testStacks = 1;
  testDuration = 3;
  testResult = null;
  /** Run the current script against a dummy character to preview behaviour + look. */
  runTest() {
    const src = this.view?.state.doc.toString() ?? this.value ?? "";
    const dummy = {
      health: 50,
      healthMax: 50,
      energy: 40,
      energyMax: 40,
      mana: 30,
      manaMax: 30,
      fokus: 10,
      fokusMax: 10,
      strength: 12,
      dexterity: 10,
      speed: 14,
      intelligence: 12,
      constitution: 11,
      wille: 10,
      level: 5,
      movement: 8,
      grundbonus: 1,
      reaktion: 9,
      effectiveSpeed: 14,
      baseSpeed: 14,
      totalArmorDebuff: 0,
      speedPenaltyNegation: 0,
      armorMalus: 0,
      armorNegation: 0,
      encumbrancePercent: 40,
      totalWeight: 20,
      maxCapacity: 96,
      copper: 10,
      silver: 5,
      gold: 1,
      platinum: 0,
      stacks: this.testStacks || 0,
      turn: 1,
      duration: this.testDuration || 0,
      effectStrength: 5
    };
    const ctx = {
      readScalar: (n) => dummy[n] ?? 0,
      readAttributeMember: (a, p) => p === "modifier" ? Math.floor(((dummy[a] ?? 10) - 10) / 2) : dummy[a] ?? 0,
      readTalent: () => 0,
      hasSkill: () => true,
      inCombat: () => true,
      rng: Math.random
    };
    const trigger = runScript(src, ctx);
    const collected = runScript(src, ctx, { collect: true });
    trigger.modifiers = collected.modifiers;
    trigger.grantedSkills = collected.grantedSkills;
    this.testResult = trigger;
  }
  opSign(op) {
    return op === "add" ? "+" : op === "sub" ? "\u2212" : op === "mul" ? "\xD7" : op === "div" ? "\xF7" : "=";
  }
  groups = this.buildGroups();
  ngAfterViewInit() {
    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      placeholder(this.placeholder),
      ...failscriptExtensions(),
      keymap.of([
        { key: "Tab", run: acceptCompletion },
        {
          key: "Mod-Shift-f",
          preventDefault: true,
          run: (v) => {
            const formatted = formatFailScript(v.state.doc.toString());
            const sel = v.state.selection.main.head;
            v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: formatted }, selection: { anchor: Math.min(sel, formatted.length) } });
            return true;
          }
        },
        indentWithTab,
        ...closeBracketsKeymap,
        ...completionKeymap,
        ...historyKeymap,
        ...defaultKeymap
      ]),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) {
          const doc2 = u.state.doc.toString();
          if (doc2 !== this.value) {
            this.value = doc2;
            this.valueChange.emit(doc2);
          }
        }
      })
    ];
    this.view = new EditorView({
      state: EditorState.create({ doc: this.value ?? "", extensions }),
      parent: this.host.nativeElement
    });
  }
  ngOnChanges(changes) {
    if (changes["value"] && this.view) {
      const current = this.view.state.doc.toString();
      if (this.value !== current) {
        this.view.dispatch({ changes: { from: 0, to: current.length, insert: this.value ?? "" } });
      }
    }
  }
  ngOnDestroy() {
    this.view?.destroy();
  }
  insert(text) {
    const view = this.view;
    if (!view)
      return;
    const pos = view.state.selection.main.head;
    view.dispatch({ changes: { from: pos, insert: text }, selection: { anchor: pos + text.length } });
    view.focus();
  }
  filteredGroups() {
    const q = this.search().toLowerCase().trim();
    if (!q)
      return this.groups;
    return this.groups.map((g) => ({ title: g.title, items: g.items.filter((i) => i.label.toLowerCase().includes(q) || (i.info ?? "").toLowerCase().includes(q)) })).filter((g) => g.items.length > 0);
  }
  buildGroups() {
    const byCat = (cat) => SYMBOLS.filter((s) => s.category === cat).map((s) => ({ label: s.name, detail: void 0, info: s.description, insert: s.name }));
    return [
      { title: "Attribute", items: SYMBOLS.filter((s) => s.category === "attribute").map((s) => ({ label: s.name, info: s.description, insert: s.name })) },
      { title: "Ressourcen", items: byCat("resource") },
      { title: "Abgeleitet", items: byCat("derived") },
      { title: "Stufe/Klasse", items: [...byCat("level"), ...byCat("class")] },
      { title: "W\xE4hrung", items: byCat("currency") },
      { title: "Talente", items: TALENT_INFO.map((t2) => ({ label: `talent.${t2.id}`, detail: t2.statLabel, info: `${t2.name} \u2014 ${t2.description}`, insert: `talent.${t2.id}` })) },
      { title: "Anzeige", items: [
        { label: "display", detail: "text, style?", info: "Textzeile. Stil optional: good/bad/neutral/info", insert: 'display("Text", bad)' },
        { label: "banner", detail: "text, style?", info: "Gro\xDFe \xDCberschrift", insert: 'banner("Titel", good)' },
        { label: "stat", detail: "label, value, style?", info: "Wert als Chip: label | value", insert: 'stat("HP", health, bad)' },
        { label: "box", detail: "text, style?", info: "Wert als Kasten: [text]", insert: 'box("Leben: -5", bad)' }
      ] },
      { title: "Stile", items: [
        { label: "good", detail: "gr\xFCn", info: "Positiv (gr\xFCn)", insert: "good" },
        { label: "bad", detail: "rot", info: "Negativ (rot)", insert: "bad" },
        { label: "neutral", detail: "grau", info: "Neutral (grau)", insert: "neutral" },
        { label: "info", detail: "blau", info: "Info (blau)", insert: "info" }
      ] },
      { title: "Funktionen", items: BUILTINS.filter((f) => !["display", "stat", "banner", "box"].includes(f.name)).map((f) => ({ label: f.name, detail: void 0, info: `${f.signature} \u2014 ${f.description}`, insert: `${f.name}(` })) },
      { title: "Schl\xFCsselw\xF6rter", items: KEYWORD_INFO.map((k) => ({ label: k.name, info: k.description, insert: k.snippet ? k.snippet.replace(/\$\{?\}?/g, "").replace(/\t/g, "  ") : k.name })) },
      { title: "W\xFCrfel", items: [{ label: "2d8", info: "W\xFCrfel-Literal: Anzahl d Seiten", insert: "2d8" }, { label: "roll(count, sides)", info: "Dynamischer Wurf", insert: "roll(" }] }
    ];
  }
  static \u0275fac = function ScriptEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ScriptEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ScriptEditorComponent, selectors: [["app-script-editor"]], viewQuery: function ScriptEditorComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c0, 7);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.host = _t.first);
    }
  }, inputs: { value: "value", placeholder: "placeholder" }, outputs: { valueChange: "valueChange" }, features: [\u0275\u0275NgOnChangesFeature], decls: 20, vars: 7, consts: [["host", ""], [1, "se-wrap", 3, "keydown", "copy", "cut", "paste"], [1, "se-main"], [1, "se-editor"], [1, "se-toolbar"], ["type", "button", 1, "se-test-btn", 3, "click"], [1, "se-num"], ["type", "number", "min", "0", 3, "ngModelChange", "ngModel"], [1, "se-hint"], [1, "se-test-result"], [1, "se-ref"], ["type", "button", 1, "se-ref-toggle", 3, "click"], [1, "se-ref-body"], [1, "se-test-head"], ["type", "button", 3, "click"], [1, "se-test-err"], [1, "se-test-empty"], [1, "se-test-res", 3, "gain", "loss"], [1, "se-test-rolls"], [1, "se-test-extra"], [1, "ds-banner", 3, "ngClass"], [1, "ds-stat", 3, "ngClass"], [1, "ds-boxrow"], [1, "ds-text", 3, "ngClass"], [1, "ds-lbl"], [1, "ds-val"], [1, "ds-box", 3, "ngClass"], [1, "se-test-res"], ["title", "Wirkt, solange der Effekt aktiv ist"], ["type", "text", "placeholder", "Suchen\u2026", 1, "se-ref-search", 3, "input", "value"], [1, "se-ref-group"], [1, "se-ref-group-title"], ["type", "button", 1, "se-ref-item", 3, "title"], ["type", "button", 1, "se-ref-item", 3, "click", "title"], [1, "se-ref-label"], [1, "se-ref-detail"]], template: function ScriptEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 1);
      \u0275\u0275listener("keydown", function ScriptEditorComponent_Template_div_keydown_0_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView($event.stopPropagation());
      })("copy", function ScriptEditorComponent_Template_div_copy_0_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView($event.stopPropagation());
      })("cut", function ScriptEditorComponent_Template_div_cut_0_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView($event.stopPropagation());
      })("paste", function ScriptEditorComponent_Template_div_paste_0_listener($event) {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView($event.stopPropagation());
      });
      \u0275\u0275elementStart(1, "div", 2);
      \u0275\u0275element(2, "div", 3, 0);
      \u0275\u0275elementStart(4, "div", 4)(5, "button", 5);
      \u0275\u0275listener("click", function ScriptEditorComponent_Template_button_click_5_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.runTest());
      });
      \u0275\u0275text(6, "\u25B6 Testlauf");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "label", 6);
      \u0275\u0275text(8, "Stapel ");
      \u0275\u0275elementStart(9, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function ScriptEditorComponent_Template_input_ngModelChange_9_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.testStacks, $event) || (ctx.testStacks = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(10, "label", 6);
      \u0275\u0275text(11, "Dauer ");
      \u0275\u0275elementStart(12, "input", 7);
      \u0275\u0275twoWayListener("ngModelChange", function ScriptEditorComponent_Template_input_ngModelChange_12_listener($event) {
        \u0275\u0275restoreView(_r1);
        \u0275\u0275twoWayBindingSet(ctx.testDuration, $event) || (ctx.testDuration = $event);
        return \u0275\u0275resetView($event);
      });
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(13, "span", 8);
      \u0275\u0275text(14, "Tab: Vervollst\xE4ndigen \xB7 Strg+Shift+F: Formatieren");
      \u0275\u0275elementEnd()();
      \u0275\u0275conditionalCreate(15, ScriptEditorComponent_Conditional_15_Template, 8, 1, "div", 9);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "div", 10)(17, "button", 11);
      \u0275\u0275listener("click", function ScriptEditorComponent_Template_button_click_17_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.refOpen.set(!ctx.refOpen()));
      });
      \u0275\u0275text(18);
      \u0275\u0275elementEnd();
      \u0275\u0275conditionalCreate(19, ScriptEditorComponent_Conditional_19_Template, 4, 1, "div", 12);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      \u0275\u0275advance(9);
      \u0275\u0275twoWayProperty("ngModel", ctx.testStacks);
      \u0275\u0275advance(3);
      \u0275\u0275twoWayProperty("ngModel", ctx.testDuration);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.testResult ? 15 : -1);
      \u0275\u0275advance();
      \u0275\u0275classProp("collapsed", !ctx.refOpen());
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1(" ", ctx.refOpen() ? "\u203A" : "\u2039", " Hilfe ");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.refOpen() ? 19 : -1);
    }
  }, dependencies: [CommonModule, NgClass, FormsModule, DefaultValueAccessor, NumberValueAccessor, NgControlStatus, MinValidator, NgModel], styles: ["\n\n.se-wrap[_ngcontent-%COMP%] {\n  display: flex;\n  height: 100%;\n  min-height: 260px;\n  border: 1px solid var(--border, #374151);\n  border-radius: 8px;\n  overflow: hidden;\n  background: #0f172a;\n}\n.se-main[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n}\n.se-editor[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n}\n.se-toolbar[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 8px;\n  background: #0b1220;\n  border-top: 1px solid #1f2937;\n}\n.se-test-btn[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.15);\n  border: 1px solid rgba(34, 197, 94, 0.4);\n  color: #86efac;\n  font-weight: 700;\n  font-size: 0.72rem;\n  padding: 3px 12px;\n  border-radius: 6px;\n  cursor: pointer;\n}\n.se-test-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(34, 197, 94, 0.28);\n}\n.se-num[_ngcontent-%COMP%] {\n  font-size: 0.68rem;\n  color: #94a3b8;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.se-num[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 46px;\n  background: #111827;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #e5e7eb;\n  padding: 2px 4px;\n  font-size: 0.72rem;\n}\n.se-hint[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  font-size: 0.66rem;\n  color: #6b7280;\n  margin-left: auto;\n}\n.se-test-result[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  max-height: 40%;\n  overflow-y: auto;\n  padding: 6px 8px;\n  background: #0f172a;\n  border-top: 1px solid #1f2937;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.se-test-head[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  font-size: 0.62rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: #6b7280;\n}\n.se-test-head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #6b7280;\n  cursor: pointer;\n}\n.se-test-err[_ngcontent-%COMP%] {\n  font-size: 0.74rem;\n  color: #fca5a5;\n}\n.se-test-empty[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  color: #6b7280;\n  font-style: italic;\n}\n.se-test-res[_ngcontent-%COMP%] {\n  font-size: 0.74rem;\n}\n.se-test-res.gain[_ngcontent-%COMP%] {\n  color: #22c55e;\n}\n.se-test-res.loss[_ngcontent-%COMP%] {\n  color: #ef4444;\n}\n.se-test-rolls[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #fbbf24;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.se-test-extra[_ngcontent-%COMP%] {\n  font-size: 0.7rem;\n  color: #93c5fd;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.ds-text[_ngcontent-%COMP%] {\n  font-size: 0.78rem;\n  padding: 4px 8px;\n  border-radius: 6px;\n  border-left: 3px solid;\n}\n.ds-banner[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  font-weight: 800;\n  text-align: center;\n  padding: 6px 8px;\n  border-radius: 6px;\n}\n.ds-stat[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 0.78rem;\n  padding: 4px 8px;\n  border-radius: 6px;\n  border-left: 3px solid;\n}\n.ds-stat[_ngcontent-%COMP%]   .ds-val[_ngcontent-%COMP%] {\n  font-weight: 800;\n}\n.ds-boxrow[_ngcontent-%COMP%] {\n  display: flex;\n}\n.ds-box[_ngcontent-%COMP%] {\n  display: inline-block;\n  font-weight: 800;\n  padding: 3px 12px;\n  border-radius: 6px;\n  border: 2px solid;\n}\n.ds-good[_ngcontent-%COMP%] {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: #22c55e;\n  color: #86efac;\n}\n.ds-bad[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.14);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.ds-info[_ngcontent-%COMP%] {\n  background: rgba(59, 130, 246, 0.14);\n  border-color: #3b82f6;\n  color: #93c5fd;\n}\n.ds-neutral[_ngcontent-%COMP%] {\n  background: rgba(148, 163, 184, 0.12);\n  border-color: #94a3b8;\n  color: #e5e7eb;\n}\n.se-ref[_ngcontent-%COMP%] {\n  width: 240px;\n  flex-shrink: 0;\n  border-left: 1px solid var(--border, #374151);\n  background: #111827;\n  display: flex;\n  flex-direction: column;\n}\n.se-ref.collapsed[_ngcontent-%COMP%] {\n  width: 64px;\n}\n.se-ref-toggle[_ngcontent-%COMP%] {\n  background: #1f2937;\n  color: #e5e7eb;\n  border: none;\n  border-bottom: 1px solid #374151;\n  padding: 6px 8px;\n  cursor: pointer;\n  text-align: left;\n  font-size: 0.75rem;\n}\n.se-ref-body[_ngcontent-%COMP%] {\n  overflow-y: auto;\n  padding: 6px;\n}\n.se-ref-search[_ngcontent-%COMP%] {\n  width: 100%;\n  box-sizing: border-box;\n  margin-bottom: 6px;\n  padding: 4px 6px;\n  background: #0b1220;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #e5e7eb;\n  font-size: 0.72rem;\n}\n.se-ref-group[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n.se-ref-group-title[_ngcontent-%COMP%] {\n  font-size: 0.62rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: #6b7280;\n  margin: 4px 0 2px;\n}\n.se-ref-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 6px;\n  width: 100%;\n  text-align: left;\n  background: none;\n  border: none;\n  color: #cbd5e1;\n  padding: 3px 5px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.72rem;\n  font-family: ui-monospace, monospace;\n}\n.se-ref-item[_ngcontent-%COMP%]:hover {\n  background: #1f2937;\n  color: #fff;\n}\n.se-ref-label[_ngcontent-%COMP%] {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.se-ref-detail[_ngcontent-%COMP%] {\n  color: #6b7280;\n  font-size: 0.62rem;\n  flex-shrink: 0;\n}\n/*# sourceMappingURL=script-editor.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ScriptEditorComponent, [{
    type: Component,
    args: [{ selector: "app-script-editor", standalone: true, imports: [CommonModule, FormsModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="se-wrap" (keydown)="$event.stopPropagation()" (copy)="$event.stopPropagation()" (cut)="$event.stopPropagation()" (paste)="$event.stopPropagation()">
      <div class="se-main">
        <div class="se-editor" #host></div>
        <div class="se-toolbar">
          <button class="se-test-btn" type="button" (click)="runTest()">\u25B6 Testlauf</button>
          <label class="se-num">Stapel <input type="number" min="0" [(ngModel)]="testStacks"></label>
          <label class="se-num">Dauer <input type="number" min="0" [(ngModel)]="testDuration"></label>
          <span class="se-hint">Tab: Vervollst\xE4ndigen \xB7 Strg+Shift+F: Formatieren</span>
        </div>
        @if (testResult) {
          <div class="se-test-result">
            <div class="se-test-head">
              <span>Testlauf (Dummy-Charakter)</span>
              <button type="button" (click)="testResult = null">\u2715</button>
            </div>
            @if (testResult.errors.length) {
              @for (e of testResult.errors; track $index) { <div class="se-test-err">\u26A0 {{ e }}</div> }
            } @else {
              @if (!testResult.displays.length && !testResult.resourceChanges.length && !testResult.rolls.length) {
                <div class="se-test-empty">L\xE4uft \u2014 keine sichtbare Ausgabe.</div>
              }
              @for (d of testResult.displays; track $index) {
                @switch (d.type) {
                  @case ('banner') { <div class="ds-banner" [ngClass]="'ds-' + d.style">{{ d.text }}</div> }
                  @case ('stat') { <div class="ds-stat" [ngClass]="'ds-' + d.style"><span class="ds-lbl">{{ d.label }}</span><span class="ds-val">{{ d.value }}</span></div> }
                  @case ('box') { <div class="ds-boxrow"><span class="ds-box" [ngClass]="'ds-' + d.style">{{ d.text }}</span></div> }
                  @default { <div class="ds-text" [ngClass]="'ds-' + d.style">{{ d.text }}</div> }
                }
              }
              @for (rc of testResult.resourceChanges; track $index) {
                <div class="se-test-res" [class.gain]="rc.amount > 0" [class.loss]="rc.amount < 0">{{ rc.resource }}: {{ rc.amount > 0 ? '+' : '' }}{{ rc.amount }}</div>
              }
              @if (testResult.rolls.length) {
                <div class="se-test-rolls">\u{1F3B2} @for (r of testResult.rolls; track $index) { <span>{{ r.formula }}=<b>{{ r.total }}</b></span> }</div>
              }
              @if (testResult.modifiers.length || testResult.grantedSkills.length || testResult.statusOps.length) {
                <div class="se-test-extra">
                  @for (m of testResult.modifiers; track $index) { <span title="Wirkt, solange der Effekt aktiv ist">\u27F3 {{ m.target }} {{ opSign(m.op) }} {{ m.amount }}</span> }
                  @for (g of testResult.grantedSkills; track $index) { <span>\u271A {{ g.name }}</span> }
                  @for (o of testResult.statusOps; track $index) { <span>{{ o.op === 'apply' ? '\uFF0B' : '\uFF0D' }} {{ o.id }}</span> }
                </div>
              }
            }
          </div>
        }
      </div>
      <div class="se-ref" [class.collapsed]="!refOpen()">
        <button class="se-ref-toggle" (click)="refOpen.set(!refOpen())" type="button">
          {{ refOpen() ? '\u203A' : '\u2039' }} Hilfe
        </button>
        @if (refOpen()) {
          <div class="se-ref-body">
            <input class="se-ref-search" type="text" placeholder="Suchen\u2026"
                   [value]="search()" (input)="search.set($any($event.target).value)" />
            @for (group of filteredGroups(); track group.title) {
              <div class="se-ref-group">
                <div class="se-ref-group-title">{{ group.title }}</div>
                @for (item of group.items; track item.label) {
                  <button class="se-ref-item" type="button" (click)="insert(item.insert)"
                          [title]="item.info || ''">
                    <span class="se-ref-label">{{ item.label }}</span>
                    @if (item.detail) { <span class="se-ref-detail">{{ item.detail }}</span> }
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `, styles: ["/* angular:styles/component:css;cbb21718523a082e3b54d9d31d44ef2737e647f08a756f274907ca25c79dc1f3;C:/Users/adermake/Documents/22FailApp/frontend/src/app/scripting/script-editor/script-editor.component.ts */\n.se-wrap {\n  display: flex;\n  height: 100%;\n  min-height: 260px;\n  border: 1px solid var(--border, #374151);\n  border-radius: 8px;\n  overflow: hidden;\n  background: #0f172a;\n}\n.se-main {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n}\n.se-editor {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n}\n.se-toolbar {\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 4px 8px;\n  background: #0b1220;\n  border-top: 1px solid #1f2937;\n}\n.se-test-btn {\n  background: rgba(34, 197, 94, 0.15);\n  border: 1px solid rgba(34, 197, 94, 0.4);\n  color: #86efac;\n  font-weight: 700;\n  font-size: 0.72rem;\n  padding: 3px 12px;\n  border-radius: 6px;\n  cursor: pointer;\n}\n.se-test-btn:hover {\n  background: rgba(34, 197, 94, 0.28);\n}\n.se-num {\n  font-size: 0.68rem;\n  color: #94a3b8;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.se-num input {\n  width: 46px;\n  background: #111827;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #e5e7eb;\n  padding: 2px 4px;\n  font-size: 0.72rem;\n}\n.se-hint {\n  flex-shrink: 0;\n  font-size: 0.66rem;\n  color: #6b7280;\n  margin-left: auto;\n}\n.se-test-result {\n  flex-shrink: 0;\n  max-height: 40%;\n  overflow-y: auto;\n  padding: 6px 8px;\n  background: #0f172a;\n  border-top: 1px solid #1f2937;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n.se-test-head {\n  display: flex;\n  justify-content: space-between;\n  font-size: 0.62rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: #6b7280;\n}\n.se-test-head button {\n  background: none;\n  border: none;\n  color: #6b7280;\n  cursor: pointer;\n}\n.se-test-err {\n  font-size: 0.74rem;\n  color: #fca5a5;\n}\n.se-test-empty {\n  font-size: 0.72rem;\n  color: #6b7280;\n  font-style: italic;\n}\n.se-test-res {\n  font-size: 0.74rem;\n}\n.se-test-res.gain {\n  color: #22c55e;\n}\n.se-test-res.loss {\n  color: #ef4444;\n}\n.se-test-rolls {\n  font-size: 0.7rem;\n  color: #fbbf24;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.se-test-extra {\n  font-size: 0.7rem;\n  color: #93c5fd;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.ds-text {\n  font-size: 0.78rem;\n  padding: 4px 8px;\n  border-radius: 6px;\n  border-left: 3px solid;\n}\n.ds-banner {\n  font-size: 0.9rem;\n  font-weight: 800;\n  text-align: center;\n  padding: 6px 8px;\n  border-radius: 6px;\n}\n.ds-stat {\n  display: flex;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 0.78rem;\n  padding: 4px 8px;\n  border-radius: 6px;\n  border-left: 3px solid;\n}\n.ds-stat .ds-val {\n  font-weight: 800;\n}\n.ds-boxrow {\n  display: flex;\n}\n.ds-box {\n  display: inline-block;\n  font-weight: 800;\n  padding: 3px 12px;\n  border-radius: 6px;\n  border: 2px solid;\n}\n.ds-good {\n  background: rgba(34, 197, 94, 0.14);\n  border-color: #22c55e;\n  color: #86efac;\n}\n.ds-bad {\n  background: rgba(239, 68, 68, 0.14);\n  border-color: #ef4444;\n  color: #fca5a5;\n}\n.ds-info {\n  background: rgba(59, 130, 246, 0.14);\n  border-color: #3b82f6;\n  color: #93c5fd;\n}\n.ds-neutral {\n  background: rgba(148, 163, 184, 0.12);\n  border-color: #94a3b8;\n  color: #e5e7eb;\n}\n.se-ref {\n  width: 240px;\n  flex-shrink: 0;\n  border-left: 1px solid var(--border, #374151);\n  background: #111827;\n  display: flex;\n  flex-direction: column;\n}\n.se-ref.collapsed {\n  width: 64px;\n}\n.se-ref-toggle {\n  background: #1f2937;\n  color: #e5e7eb;\n  border: none;\n  border-bottom: 1px solid #374151;\n  padding: 6px 8px;\n  cursor: pointer;\n  text-align: left;\n  font-size: 0.75rem;\n}\n.se-ref-body {\n  overflow-y: auto;\n  padding: 6px;\n}\n.se-ref-search {\n  width: 100%;\n  box-sizing: border-box;\n  margin-bottom: 6px;\n  padding: 4px 6px;\n  background: #0b1220;\n  border: 1px solid #374151;\n  border-radius: 5px;\n  color: #e5e7eb;\n  font-size: 0.72rem;\n}\n.se-ref-group {\n  margin-bottom: 8px;\n}\n.se-ref-group-title {\n  font-size: 0.62rem;\n  text-transform: uppercase;\n  letter-spacing: 0.04em;\n  color: #6b7280;\n  margin: 4px 0 2px;\n}\n.se-ref-item {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 6px;\n  width: 100%;\n  text-align: left;\n  background: none;\n  border: none;\n  color: #cbd5e1;\n  padding: 3px 5px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 0.72rem;\n  font-family: ui-monospace, monospace;\n}\n.se-ref-item:hover {\n  background: #1f2937;\n  color: #fff;\n}\n.se-ref-label {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.se-ref-detail {\n  color: #6b7280;\n  font-size: 0.62rem;\n  flex-shrink: 0;\n}\n/*# sourceMappingURL=script-editor.component.css.map */\n"] }]
  }], null, { value: [{
    type: Input
  }], placeholder: [{
    type: Input
  }], valueChange: [{
    type: Output
  }], host: [{
    type: ViewChild,
    args: ["host", { static: true }]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ScriptEditorComponent, { className: "ScriptEditorComponent", filePath: "app/scripting/script-editor/script-editor.component.ts", lineNumber: 145 });
})();

// src/app/scripting/decompiler.ts
function statName(s) {
  return s === "chill" ? "wille" : s;
}
function escapeStr(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function str(s) {
  return `"${escapeStr(s)}"`;
}
function legacyFormulaToExpr(formula, fallback = 0) {
  const f = (formula ?? "").trim();
  if (!f)
    return String(fallback);
  const m = f.match(/^(\d+)d(\d+)\s*([+-]\s*\d+)?$/i);
  if (m) {
    const dice = `${m[1]}d${m[2]}`;
    if (m[3]) {
      const k = m[3].replace(/\s+/g, "");
      return `${dice} ${k[0]} ${k.slice(1)}`;
    }
    return dice;
  }
  const n = parseFloat(f);
  return isNaN(n) ? String(fallback) : String(n);
}
function conditionExpr(c) {
  if (c.type === "skill" && c.skillName)
    return `hasSkill(${str(c.skillName)})`;
  let left = "0";
  if (c.type === "resource" && c.resource)
    left = c.resource;
  else if (c.type === "stat" && c.stat)
    left = statName(c.stat);
  let right = String(c.value ?? 0);
  if (c.valueType === "currentResource" && c.compareToResource)
    right = c.compareToResource;
  else if (c.valueType === "maxResource" && c.compareToResource)
    right = `${c.compareToResource}Max`;
  else if (c.valueType === "stat" && c.compareToStat)
    right = statName(c.compareToStat);
  return `${left} ${c.operator} ${right}`;
}
function consequenceStmt(c) {
  const expr = legacyFormulaToExpr(c.diceFormula, c.amount ?? 0);
  switch (c.type) {
    case "dice_roll":
      return `stat(${str(c.rollName || "Wurf")}, ${expr})`;
    case "spend_resource":
      return c.resource ? `loseResource(${c.resource}, ${expr})` : "// spend_resource ohne Ressource";
    case "gain_resource":
      return c.resource ? `gainResource(${c.resource}, ${expr})` : "// gain_resource ohne Ressource";
    case "apply_bonus":
      return `// apply_bonus wird nicht mehr unterst\xFCtzt${c.bonusName ? ` (${c.bonusName})` : ""}`;
    default:
      return "// unbekannte Konsequenz";
  }
}
function actionMacroToScript(m) {
  const body = (m.consequences ?? []).map(consequenceStmt).join("\n");
  if (m.conditions && m.conditions.length > 0) {
    const cond = m.conditions.map((c) => `(${conditionExpr(c)})`).join(" && ");
    const indented = body.split("\n").map((l) => l ? "  " + l : l).join("\n");
    return `if (${cond}) {
${indented}
} else {
  display("Bedingung nicht erf\xFCllt", bad)
}`;
  }
  return body;
}
function macroActionToScript(a) {
  const p = a.parameters || {};
  switch (a.actionType) {
    case "dice_roll":
      return `stat(${str(p.rollName || a.name || "Wurf")}, ${legacyFormulaToExpr(p.diceFormula, 0)})`;
    case "apply_damage":
      return `loseResource(health, ${legacyFormulaToExpr(p.diceAmount, p.amount ?? 0)})`;
    case "apply_healing":
      return `gainResource(health, ${legacyFormulaToExpr(p.diceAmount, p.amount ?? 0)})`;
    case "modify_resource":
      return p.resource ? `gainResource(${p.resource}, ${legacyFormulaToExpr(p.resourceDiceAmount, p.resourceAmount ?? 0)})` : "// modify_resource ohne Ressource";
    case "modify_stat":
      return p.stat ? `untilNextTurn {
  ${statName(p.stat)} += ${p.statModifier ?? 0}
}` : "// modify_stat ohne Stat";
    case "apply_status":
      return p.statusEffectId ? `applyStatus(${str(p.statusEffectId)})` : "// apply_status ohne id";
    case "remove_status":
      return p.statusEffectId ? `removeStatus(${str(p.statusEffectId)})` : "// remove_status ohne id";
    case "custom_message":
      return `display(${str(p.message || "")})`;
    default:
      return "// unbekannte Aktion";
  }
}

// src/app/utils/equip-slot.utils.ts
function getEquipSlot(item) {
  if (item.armorType)
    return item.armorType;
  return item.itemType === "weapon" ? "weapon" : "extra";
}
function isWieldedWeapon(item) {
  return item.itemType === "weapon" && !item.lost && getEquipSlot(item) === "weapon";
}

// src/app/sheet/keyword-enhancer.ts
var KeywordEnhancer = class {
  static styles = [
    // Resouces types
    {
      keywords: ["kosten", "bedingung", "bedingungen", "voraussetzung", "voraussetzungen", "effektivit\xE4t", "effekt"],
      className: "keyword-bold",
      color: "#A9A9A9"
      // DarkGray - neutral but visible
    },
    {
      keywords: ["leben", "trefferpunkte"],
      className: "keyword-life",
      color: "#FF6B6B"
      // Bright Red
    },
    {
      keywords: ["ausdauer"],
      className: "keyword-energy",
      color: "#4ECDC4"
      // Teal
    },
    {
      keywords: ["mana"],
      className: "keyword-mana",
      color: "#45A1FF"
      // Bright Blue
    },
    {
      keywords: ["fokus"],
      className: "keyword-fokus",
      color: "#9D6BFF"
      // Vibrant Purple
    },
    // Stats
    {
      keywords: ["st\xE4rke", "str"],
      className: "keyword-stat",
      color: "#FF9F6B"
      // Orange
    },
    {
      keywords: ["geschicklichkeit", "dex"],
      className: "keyword-stat",
      color: "#26D0B3"
      // Bright Teal
    },
    {
      keywords: ["intelligenz", "int"],
      className: "keyword-stat",
      color: "#54A0FF"
      // Bright Blue
    },
    {
      keywords: ["konstitution", "con", "hp", "health"],
      className: "keyword-stat",
      color: "#FF7675"
      // Soft Red
    }
  ];
  /**
   * Enhance text with keyword highlighting
   * @param text The original text
   * @returns HTML string with highlighted keywords
   */
  static enhance(text) {
    if (!text)
      return "";
    let result = text;
    const replacements = [];
    for (const style of this.styles) {
      for (const keyword2 of style.keywords) {
        const regex = new RegExp(`\\b${this.escapeRegex(keyword2)}\\b`, "gi");
        let match;
        while ((match = regex.exec(text)) !== null) {
          const start = match.index;
          const end = start + match[0].length;
          const overlaps = replacements.some((r) => start >= r.start && start < r.end || end > r.start && end <= r.end);
          if (!overlaps) {
            const replacement = `<span class="${style.className}" style="color: ${style.color}; font-weight: 700;">${match[0]}</span>`;
            replacements.push({ start, end, replacement });
          }
        }
      }
    }
    replacements.sort((a, b) => b.start - a.start);
    for (const { start, end, replacement } of replacements) {
      result = result.substring(0, start) + replacement + result.substring(end);
    }
    result = result.replace(/\bE:(\d+(?:\.\d+)?)\b/g, '<span class="inline-eff">\u2694 $1</span>').replace(/\bS:(\d+(?:\.\d+)?)\b/g, '<span class="inline-stab">\u{1F6E1} $1</span>').replace(/\bR:(\d+(?:\.\d+)?)\b/g, '<span class="inline-range">\u2194 $1m</span>');
    return result;
  }
  /**
   * Escape special regex characters
   */
  static escapeRegex(str2) {
    return str2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  /**
   * Add custom keyword style
   */
  static addKeywordStyle(style) {
    this.styles.push(style);
  }
  /**
   * Get all keyword styles
   */
  static getStyles() {
    return this.styles;
  }
};

// src/app/model/spell-block-model.ts
function generateSpellId() {
  return "spell_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
}
var SPELL_GLOW_COLORS = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "White", value: "#ffffff" }
];
var SPELL_TAG_OPTIONS = [
  "Feuer",
  "Wasser",
  "Erde",
  "Luft",
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
  "Weissagung",
  "Verwandlung",
  "Nekromantie"
];
var SPELL_ICON_SYMBOLS = [
  // Stars & Sparkles
  "\u2726",
  "\u2727",
  "\u2736",
  "\u2737",
  "\u2738",
  "\u2739",
  "\u273A",
  "\u273B",
  "\u273C",
  "\u273D",
  "\u2605",
  "\u2606",
  "\u2729",
  "\u272A",
  "\u272B",
  "\u272C",
  "\u272D",
  "\u272E",
  "\u272F",
  "\u2730",
  "\u274B",
  "\u2731",
  "\u2732",
  "\u2733",
  "\u2734",
  "\u2735",
  "\u2042",
  // Elder Futhark Runes
  "\u16A0",
  "\u16A2",
  "\u16A6",
  "\u16A8",
  "\u16B1",
  "\u16B2",
  "\u16B7",
  "\u16B9",
  "\u16BE",
  "\u16C1",
  "\u16C3",
  "\u16C7",
  "\u16C8",
  "\u16C9",
  "\u16CA",
  "\u16CF",
  "\u16D2",
  "\u16D6",
  "\u16D7",
  "\u16DA",
  "\u16DC",
  "\u16DE",
  "\u16DF",
  // Geometric
  "\u25C6",
  "\u25C7",
  "\u25C8",
  "\u25C9",
  "\u25CE",
  "\u25CC",
  "\u25CA",
  "\u25A0",
  "\u25A1",
  "\u25B2",
  "\u25B3",
  "\u25BD",
  "\u25BC",
  "\u25C1",
  "\u25B7",
  "\u2B21",
  "\u2B22",
  "\u2B1F",
  // Celestial & Arcane
  "\u263D",
  "\u263E",
  "\u2638",
  "\u221E",
  "\u2295",
  "\u2297",
  "\u2299",
  "\u229B",
  "\u229C",
  "\u229D",
  // Planetary / Alchemical
  "\u2641",
  "\u2643",
  "\u2644",
  "\u2645",
  "\u2646",
  "\u2647",
  "\u263F",
  "\u2640",
  "\u2642",
  // Cross / Faith symbols
  "\u271D",
  "\u271E",
  "\u271F",
  "\u2720",
  "\u262C",
  "\u262F",
  "\u2630",
  "\u2637",
  // Heraldic & Misc
  "\u269C",
  "\u271A",
  "\u2719",
  "\u2625",
  "\u26E4",
  "\u26E7"
];

// src/app/shared/spell-node-editor/spell-cost-calculator.ts
function calculateSpellCost(graph, availableRunes) {
  const runeByName = new Map(availableRunes.map((r) => [r.name, r]));
  const visitCount = /* @__PURE__ */ new Map();
  function maxVisits(nodeId) {
    const incoming = graph.connections.find((c) => c.toNodeId === nodeId && c.passthroughEnabled);
    return incoming?.maxPassthrough ?? 1;
  }
  const queue = ["start"];
  while (queue.length > 0) {
    const cur2 = queue.shift();
    const curVisits = (visitCount.get(cur2) ?? 0) + 1;
    visitCount.set(cur2, curVisits);
    const cap = cur2 === "start" ? 1 : maxVisits(cur2);
    if (curVisits > cap)
      continue;
    for (const conn of graph.connections) {
      if (conn.fromNodeId !== cur2)
        continue;
      queue.push(conn.toNodeId);
    }
  }
  let totalMana = 0;
  let totalFokus = 0;
  let totalEffektivitaet = 0;
  let nodeCount = 0;
  const statReqs = {};
  const statKeys = ["strength", "dexterity", "speed", "intelligence", "constitution", "chill"];
  for (const [nodeId, visits] of visitCount) {
    if (nodeId === "start")
      continue;
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node)
      continue;
    const rune = runeByName.get(node.runeId);
    if (!rune)
      continue;
    nodeCount++;
    const mana = (rune.mana ?? 0) * (rune.manaMult ?? 1);
    const fokus = rune.fokus ?? 0;
    const eff = rune.effektivitaet ?? 0;
    totalMana += mana * visits;
    totalFokus += fokus * visits;
    totalEffektivitaet += eff * visits;
    if (rune.statRequirements) {
      for (const key of statKeys) {
        const val = rune.statRequirements[key];
        if (val && val > 0) {
          statReqs[key] = (statReqs[key] ?? 0) + val * visits;
        }
      }
    }
  }
  return {
    mana: Math.round(totalMana * 100) / 100,
    fokus: Math.round(totalFokus * 100) / 100,
    effektivitaet: Math.round(totalEffektivitaet * 100) / 100,
    nodeCount,
    statRequirements: statReqs
  };
}

// src/app/model/action-macro.model.ts
function createEmptyActionMacro() {
  return {
    id: `macro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: "Neue Aktion",
    description: "",
    icon: "\u26A1",
    color: "#f59e0b",
    conditions: [],
    consequences: [],
    referencedSkillNames: [],
    isValid: true,
    order: 0,
    createdAt: /* @__PURE__ */ new Date(),
    modifiedAt: /* @__PURE__ */ new Date()
  };
}
function createEmptyCondition() {
  return {
    id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "resource",
    resource: "health",
    operator: ">",
    value: 0,
    valueType: "fixed"
  };
}
function createEmptyConsequence() {
  return {
    id: `cons-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "dice_roll",
    diceType: 20,
    diceCount: 1,
    bonuses: []
  };
}

export {
  AssetBrowserApiService,
  LibraryStoreService,
  CLASS_DEFINITIONS,
  SKILL_DEFINITIONS,
  getSkillsForClass,
  getSkillById,
  computeSkillTalentBonuses,
  computeSkillTalentBonusBreakdown,
  createPlayerContext,
  runScript,
  listTriggers,
  hasBaseAction,
  TrueStatsService,
  ScriptEditorComponent,
  actionMacroToScript,
  macroActionToScript,
  getEquipSlot,
  isWieldedWeapon,
  KeywordEnhancer,
  generateSpellId,
  SPELL_GLOW_COLORS,
  SPELL_TAG_OPTIONS,
  SPELL_ICON_SYMBOLS,
  NEUTRAL_RUNE_ID,
  SUMMON_RUNE_ID,
  FLOW_COLOR,
  buildRunePorts,
  calculateSpellCost,
  createEmptyActionMacro,
  createEmptyCondition,
  createEmptyConsequence
};
//# sourceMappingURL=chunk-BNPZFNFF.js.map
