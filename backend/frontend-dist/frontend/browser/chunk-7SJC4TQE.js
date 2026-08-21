import {
  Component,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵtext
} from "./chunk-XJL25EXC.js";
import "./chunk-KWSTWQNB.js";

// src/app/session/session.component.ts
var SessionComponent = class _SessionComponent {
  static \u0275fac = function SessionComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SessionComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _SessionComponent, selectors: [["app-session"]], decls: 2, vars: 0, template: function SessionComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "p");
      \u0275\u0275text(1, "session works!");
      \u0275\u0275domElementEnd();
    }
  }, encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SessionComponent, [{
    type: Component,
    args: [{ selector: "app-session", imports: [], template: "<p>session works!</p>\r\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(SessionComponent, { className: "SessionComponent", filePath: "app/session/session.component.ts", lineNumber: 9 });
})();
export {
  SessionComponent
};
//# sourceMappingURL=chunk-7SJC4TQE.js.map
