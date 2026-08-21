import {
  createSummonStatblock
} from "./chunk-USZVCDDR.js";
import {
  createEmptyNpcStatblock
} from "./chunk-CBEKLTT4.js";
import {
  Injectable,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-XJL25EXC.js";

// src/app/services/summon-editor.service.ts
var SummonEditorService = class _SummonEditorService {
  requests = signal([], ...ngDevMode ? [{ debugName: "requests" }] : []);
  resolvers = /* @__PURE__ */ new Map();
  /** Open the summon editor; resolves with the built statblock, or null if cancelled. */
  open(soul, existing, assets) {
    const id = "sum_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const statblock = existing ? JSON.parse(JSON.stringify(existing)) : soul ? createSummonStatblock(soul) : createEmptyNpcStatblock();
    const a = assets ?? { items: [], skills: [], spells: [], runes: [] };
    return new Promise((resolve) => {
      this.resolvers.set(id, resolve);
      this.requests.update((r) => [...r, { id, soul, statblock, soulLocked: !!soul, assets: a }]);
    });
  }
  finish(id, statblock) {
    const res = this.resolvers.get(id);
    this.resolvers.delete(id);
    this.requests.update((r) => r.filter((x) => x.id !== id));
    res?.(statblock);
  }
  static \u0275fac = function SummonEditorService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SummonEditorService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SummonEditorService, factory: _SummonEditorService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SummonEditorService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  SummonEditorService
};
//# sourceMappingURL=chunk-6AYMQH2Q.js.map
