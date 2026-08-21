import {
  SummonEditorService
} from "./chunk-6AYMQH2Q.js";
import {
  NotificationService
} from "./chunk-DLR6HTDV.js";
import "./chunk-USZVCDDR.js";
import "./chunk-CBEKLTT4.js";
import {
  AuthService
} from "./chunk-GPFFHOI7.js";
import {
  identityHeaders
} from "./chunk-VMYLUGMS.js";
import {
  PreloadAllModules,
  RouterOutlet,
  provideRouter,
  withPreloading
} from "./chunk-V6FR55FP.js";
import {
  bootstrapApplication
} from "./chunk-YJYDFJW3.js";
import {
  CommonModule,
  provideHttpClient,
  withFetch,
  withInterceptors
} from "./chunk-FGI44Z6P.js";
import {
  Component,
  inject,
  provideBrowserGlobalErrorListeners,
  setClassMetadata,
  setClassMetadataAsync,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassMap,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefer,
  ɵɵdeferOnImmediate,
  ɵɵdefineComponent,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomListener,
  ɵɵdomTemplate,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-XJL25EXC.js";
import "./chunk-KWSTWQNB.js";

// src/app/app.routes.ts
var routes = [
  {
    path: "",
    loadComponent: () => import("./chunk-RGOFONIR.js").then((m) => m.HomeComponent),
    pathMatch: "full"
  },
  {
    path: "characters/:id",
    loadComponent: () => import("./chunk-NMPUXQX7.js").then((m) => m.SheetComponent)
  },
  {
    path: "game/:id",
    loadComponent: () => import("./chunk-7SJC4TQE.js").then((m) => m.SessionComponent)
  },
  {
    path: "world/:worldName",
    loadComponent: () => import("./chunk-NPO3SDEF.js").then((m) => m.WorldComponent)
  },
  {
    path: "lobby/:worldName",
    loadComponent: () => import("./chunk-VCTHYPGX.js").then((m) => m.LobbyComponent)
  },
  {
    path: "world-map/:worldName",
    loadComponent: () => import("./chunk-ZGMO3YHI.js").then((m) => m.WorldMapComponent)
  },
  {
    // Map editor (format v2). Takes over 'world-map' once it reaches parity in Phase 3.
    path: "map-editor/:worldName",
    loadComponent: () => import("./chunk-QCYA6C56.js").then((m) => m.MapEditorComponent)
  },
  {
    path: "library/:libraryId",
    loadComponent: () => import("./chunk-CGEREUAH.js").then((m) => m.LibraryEditorComponent)
  },
  {
    path: "rulebook",
    loadComponent: () => import("./chunk-TOQPYLCF.js").then((m) => m.RulebookComponent)
  },
  {
    path: "rulebook/:page",
    loadComponent: () => import("./chunk-TOQPYLCF.js").then((m) => m.RulebookComponent)
  },
  {
    path: "stress-test",
    loadComponent: () => import("./chunk-2TUMM6GT.js").then((m) => m.StressTestComponent)
  }
];

// src/app/services/identity.interceptor.ts
var identityInterceptor = (req, next) => {
  const headers = identityHeaders();
  if (!headers["x-user-id"])
    return next(req);
  return next(req.clone({ setHeaders: headers }));
};

// src/app/app.config.ts
var appConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([identityInterceptor]))
  ]
};

// src/app/shared/notification/notification.component.ts
var _forTrack0 = ($index, $item) => $item.id;
function NotificationComponent_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u2713 ");
  }
}
function NotificationComponent_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u2715 ");
  }
}
function NotificationComponent_For_2_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u26A0 ");
  }
}
function NotificationComponent_For_2_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " \u2139 ");
  }
}
function NotificationComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275domElementStart(0, "div", 2)(1, "span", 3);
    \u0275\u0275conditionalCreate(2, NotificationComponent_For_2_Conditional_2_Template, 1, 0);
    \u0275\u0275conditionalCreate(3, NotificationComponent_For_2_Conditional_3_Template, 1, 0);
    \u0275\u0275conditionalCreate(4, NotificationComponent_For_2_Conditional_4_Template, 1, 0);
    \u0275\u0275conditionalCreate(5, NotificationComponent_For_2_Conditional_5_Template, 1, 0);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(6, "span", 4);
    \u0275\u0275text(7);
    \u0275\u0275domElementEnd();
    \u0275\u0275domElementStart(8, "button", 5);
    \u0275\u0275domListener("click", function NotificationComponent_For_2_Template_button_click_8_listener() {
      const notification_r2 = \u0275\u0275restoreView(_r1).$implicit;
      const ctx_r2 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r2.notificationService.remove(notification_r2.id));
    });
    \u0275\u0275text(9, "\xD7");
    \u0275\u0275domElementEnd()();
  }
  if (rf & 2) {
    const notification_r2 = ctx.$implicit;
    \u0275\u0275classMap("notification-" + notification_r2.type);
    \u0275\u0275advance(2);
    \u0275\u0275conditional(notification_r2.type === "success" ? 2 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(notification_r2.type === "error" ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(notification_r2.type === "warning" ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(notification_r2.type === "info" ? 5 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(notification_r2.message);
  }
}
var NotificationComponent = class _NotificationComponent {
  notificationService = inject(NotificationService);
  static \u0275fac = function NotificationComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NotificationComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _NotificationComponent, selectors: [["app-notification"]], decls: 3, vars: 0, consts: [[1, "notification-container"], [1, "notification", 3, "class"], [1, "notification"], [1, "notification-icon"], [1, "notification-message"], [1, "notification-close", 3, "click"]], template: function NotificationComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275domElementStart(0, "div", 0);
      \u0275\u0275repeaterCreate(1, NotificationComponent_For_2_Template, 10, 7, "div", 1, _forTrack0);
      \u0275\u0275domElementEnd();
    }
    if (rf & 2) {
      \u0275\u0275advance();
      \u0275\u0275repeater(ctx.notificationService.notifications());
    }
  }, dependencies: [CommonModule], styles: ["\n\n.notification-container[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  z-index: 10000;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  pointer-events: none;\n}\n.notification[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n  min-width: 300px;\n  max-width: 500px;\n  pointer-events: all;\n  animation: _ngcontent-%COMP%_slideIn 0.3s ease-out;\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n}\n@keyframes _ngcontent-%COMP%_slideIn {\n  from {\n    transform: translateX(400px);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n.notification-success[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(34, 197, 94, 0.95),\n      rgba(22, 163, 74, 0.95));\n  border: 1px solid #22c55e;\n  color: white;\n}\n.notification-error[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(239, 68, 68, 0.95),\n      rgba(220, 38, 38, 0.95));\n  border: 1px solid #ef4444;\n  color: white;\n}\n.notification-warning[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(251, 191, 36, 0.95),\n      rgba(245, 158, 11, 0.95));\n  border: 1px solid #fbbf24;\n  color: #1a1a1a;\n}\n.notification-info[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(59, 130, 246, 0.95),\n      rgba(37, 99, 235, 0.95));\n  border: 1px solid #3b82f6;\n  color: white;\n}\n.notification-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  font-weight: bold;\n  flex-shrink: 0;\n}\n.notification-message[_ngcontent-%COMP%] {\n  flex: 1;\n  font-size: 14px;\n  line-height: 1.4;\n  font-weight: 500;\n}\n.notification-close[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  color: inherit;\n  font-size: 24px;\n  cursor: pointer;\n  padding: 0;\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0.7;\n  transition: opacity 0.2s;\n  flex-shrink: 0;\n}\n.notification-close[_ngcontent-%COMP%]:hover {\n  opacity: 1;\n}\n/*# sourceMappingURL=notification.component.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NotificationComponent, [{
    type: Component,
    args: [{ selector: "app-notification", standalone: true, imports: [CommonModule], template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div class="notification" [class]="'notification-' + notification.type">
          <span class="notification-icon">
            @if (notification.type === 'success') { \u2713 }
            @if (notification.type === 'error') { \u2715 }
            @if (notification.type === 'warning') { \u26A0 }
            @if (notification.type === 'info') { \u2139 }
          </span>
          <span class="notification-message">{{ notification.message }}</span>
          <button class="notification-close" (click)="notificationService.remove(notification.id)">\xD7</button>
        </div>
      }
    </div>
  `, styles: ["/* angular:styles/component:css;c12def389fd536a2c20635a229cebcf302d521e5a14cee7666f87267974f26cd;C:/Users/adermake/Documents/22FailApp/frontend/src/app/shared/notification/notification.component.ts */\n.notification-container {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  z-index: 10000;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  pointer-events: none;\n}\n.notification {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n  min-width: 300px;\n  max-width: 500px;\n  pointer-events: all;\n  animation: slideIn 0.3s ease-out;\n  -webkit-backdrop-filter: blur(8px);\n  backdrop-filter: blur(8px);\n}\n@keyframes slideIn {\n  from {\n    transform: translateX(400px);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n.notification-success {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(34, 197, 94, 0.95),\n      rgba(22, 163, 74, 0.95));\n  border: 1px solid #22c55e;\n  color: white;\n}\n.notification-error {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(239, 68, 68, 0.95),\n      rgba(220, 38, 38, 0.95));\n  border: 1px solid #ef4444;\n  color: white;\n}\n.notification-warning {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(251, 191, 36, 0.95),\n      rgba(245, 158, 11, 0.95));\n  border: 1px solid #fbbf24;\n  color: #1a1a1a;\n}\n.notification-info {\n  background:\n    linear-gradient(\n      135deg,\n      rgba(59, 130, 246, 0.95),\n      rgba(37, 99, 235, 0.95));\n  border: 1px solid #3b82f6;\n  color: white;\n}\n.notification-icon {\n  font-size: 20px;\n  font-weight: bold;\n  flex-shrink: 0;\n}\n.notification-message {\n  flex: 1;\n  font-size: 14px;\n  line-height: 1.4;\n  font-weight: 500;\n}\n.notification-close {\n  background: transparent;\n  border: none;\n  color: inherit;\n  font-size: 24px;\n  cursor: pointer;\n  padding: 0;\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0.7;\n  transition: opacity 0.2s;\n  flex-shrink: 0;\n}\n.notification-close:hover {\n  opacity: 1;\n}\n/*# sourceMappingURL=notification.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(NotificationComponent, { className: "NotificationComponent", filePath: "app/shared/notification/notification.component.ts", lineNumber: 121 });
})();

// src/app/app.ts
var App_Conditional_2_For_2_Defer_1_DepsFn = () => [import("./chunk-ROAXQF5Q.js").then((m) => m.NpcEditorComponent)];
var _forTrack02 = ($index, $item) => $item.id;
function App_Conditional_2_For_2_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "app-npc-editor", 1);
    \u0275\u0275listener("save", function App_Conditional_2_For_2_Defer_0_Template_app_npc_editor_save_0_listener($event) {
      \u0275\u0275restoreView(_r1);
      const req_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.summonEditor.finish(req_r2.id, $event));
    })("cancel", function App_Conditional_2_For_2_Defer_0_Template_app_npc_editor_cancel_0_listener() {
      \u0275\u0275restoreView(_r1);
      const req_r2 = \u0275\u0275nextContext().$implicit;
      const ctx_r2 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r2.summonEditor.finish(req_r2.id, null));
    });
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const req_r2 = \u0275\u0275nextContext().$implicit;
    \u0275\u0275property("statblock", req_r2.statblock)("soulLocked", req_r2.soulLocked)("availableItems", req_r2.assets.items)("availableSkills", req_r2.assets.skills)("availableSpells", req_r2.assets.spells)("availableRunes", req_r2.assets.runes);
  }
}
function App_Conditional_2_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275domTemplate(0, App_Conditional_2_For_2_Defer_0_Template, 1, 6);
    \u0275\u0275defer(1, 0, App_Conditional_2_For_2_Defer_1_DepsFn);
    \u0275\u0275deferOnImmediate();
  }
}
function App_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 0);
    \u0275\u0275repeaterCreate(1, App_Conditional_2_For_2_Template, 3, 0, null, null, _forTrack02);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.summonEditor.requests());
  }
}
var App = class _App {
  title = signal("frontend", ...ngDevMode ? [{ debugName: "title" }] : []);
  /** App-root outlet for summon (NPC) editors — see SummonEditorService (recursion-safe, no cycles). */
  summonEditor = inject(SummonEditorService);
  constructor() {
    void inject(AuthService).init();
  }
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], decls: 3, vars: 1, consts: [[1, "summon-editor-host"], [3, "save", "cancel", "statblock", "soulLocked", "availableItems", "availableSkills", "availableSpells", "availableRunes"]], template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet")(1, "app-notification");
      \u0275\u0275conditionalCreate(2, App_Conditional_2_Template, 3, 0, "div", 0);
    }
    if (rf & 2) {
      \u0275\u0275advance(2);
      \u0275\u0275conditional(ctx.summonEditor.requests().length ? 2 : -1);
    }
  }, dependencies: [RouterOutlet, NotificationComponent], styles: ["\n\n.summon-editor-host[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 3000;\n}\n/*# sourceMappingURL=app.css.map */"] });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadataAsync(App, () => [import("./chunk-ROAXQF5Q.js").then((m) => m.NpcEditorComponent)], (NpcEditorComponent) => {
    setClassMetadata(App, [{
      type: Component,
      args: [{ selector: "app-root", imports: [RouterOutlet, NotificationComponent, NpcEditorComponent], template: `<router-outlet></router-outlet>\r
<app-notification></app-notification>\r
\r
<!-- Summon (NPC) editor outlet \u2014 stacks for summon-inside-summon recursion.\r
     @defer keeps the heavy NPC editor out of the initial bundle (loaded only when a summon opens).\r
     The wrapper's z-index gives its fixed overlay a stacking context ABOVE the rune-flow editor (1700). -->\r
@if (summonEditor.requests().length) {\r
  <div class="summon-editor-host">\r
    @for (req of summonEditor.requests(); track req.id) {\r
      @defer (on immediate) {\r
        <app-npc-editor\r
          [statblock]="req.statblock"\r
          [soulLocked]="req.soulLocked"\r
          [availableItems]="req.assets.items"\r
          [availableSkills]="req.assets.skills"\r
          [availableSpells]="req.assets.spells"\r
          [availableRunes]="req.assets.runes"\r
          (save)="summonEditor.finish(req.id, $event)"\r
          (cancel)="summonEditor.finish(req.id, null)">\r
        </app-npc-editor>\r
      }\r
    }\r
  </div>\r
}\r
`, styles: ["/* src/app/app.css */\n.summon-editor-host {\n  position: relative;\n  z-index: 3000;\n}\n/*# sourceMappingURL=app.css.map */\n"] }]
    }], () => [], null);
  });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "app/app.ts", lineNumber: 14 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
