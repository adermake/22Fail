import {
  Injectable,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-XJL25EXC.js";

// src/app/services/notification.service.ts
var NotificationService = class _NotificationService {
  notifications = signal([], ...ngDevMode ? [{ debugName: "notifications" }] : []);
  show(message, type = "info", duration = 4e3) {
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      duration
    };
    this.notifications.update((notifications) => [...notifications, notification]);
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }
  success(message, duration) {
    this.show(message, "success", duration);
  }
  error(message, duration) {
    this.show(message, "error", duration);
  }
  warning(message, duration) {
    this.show(message, "warning", duration);
  }
  info(message, duration) {
    this.show(message, "info", duration);
  }
  remove(id) {
    this.notifications.update((notifications) => notifications.filter((n) => n.id !== id));
  }
  static \u0275fac = function NotificationService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NotificationService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _NotificationService, factory: _NotificationService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NotificationService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

export {
  NotificationService
};
//# sourceMappingURL=chunk-DLR6HTDV.js.map
