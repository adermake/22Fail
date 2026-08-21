import {
  CommonModule
} from "./chunk-FGI44Z6P.js";
import {
  Component,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵprojection,
  ɵɵprojectionDef
} from "./chunk-XJL25EXC.js";

// src/app/shared/card/card.component.ts
var _c0 = ["*"];
var CardComponent = class _CardComponent {
  static \u0275fac = function CardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CardComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CardComponent, selectors: [["app-card"]], ngContentSelectors: _c0, decls: 2, vars: 0, consts: [[1, "card"]], template: function CardComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275projectionDef();
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275projection(1);
      \u0275\u0275domElementEnd();
    }
  }, dependencies: [CommonModule], styles: ["\n\n.card[_ngcontent-%COMP%] {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  padding: 14px;\n  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);\n  overflow: visible;\n}\n/*# sourceMappingURL=card.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CardComponent, [{
    type: Component,
    args: [{ selector: "app-card", standalone: true, imports: [CommonModule], template: '<div class="card">\r\n    <ng-content />\r\n</div>', styles: ["/* src/app/shared/card/card.component.css */\n.card {\n  background: var(--card);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  padding: 14px;\n  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);\n  overflow: visible;\n}\n/*# sourceMappingURL=card.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CardComponent, { className: "CardComponent", filePath: "app/shared/card/card.component.ts", lineNumber: 11 });
})();

export {
  CardComponent
};
//# sourceMappingURL=chunk-OMKCU2ST.js.map
