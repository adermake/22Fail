import "./chunk-SN2M2YSQ.js";
import {
  AccessibilitySystem,
  DOMPipe,
  EventSystem,
  FederatedContainer,
  accessibilityTarget
} from "./chunk-SAEWRC2J.js";
import "./chunk-5MWFKSP5.js";
import {
  Container
} from "./chunk-S6DPH2MO.js";
import "./chunk-WDCBB5HS.js";
import "./chunk-MJ6HN5ZI.js";
import "./chunk-3JCEIXSU.js";
import {
  extensions
} from "./chunk-5ZGFVOTG.js";
import "./chunk-KWSTWQNB.js";

// node_modules/pixi.js/lib/accessibility/init.mjs
extensions.add(AccessibilitySystem);
extensions.mixin(Container, accessibilityTarget);

// node_modules/pixi.js/lib/dom/init.mjs
extensions.add(DOMPipe);

// node_modules/pixi.js/lib/events/init.mjs
extensions.add(EventSystem);
extensions.mixin(Container, FederatedContainer);
//# sourceMappingURL=chunk-W2ZKHBVV.js.map
