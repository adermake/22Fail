import {
  clearStoredIdentity,
  getStoredIdentity,
  setStoredIdentity
} from "./chunk-VMYLUGMS.js";
import {
  HttpClient
} from "./chunk-FGI44Z6P.js";
import {
  Injectable,
  computed,
  firstValueFrom,
  inject,
  setClassMetadata,
  signal,
  ɵɵdefineInjectable
} from "./chunk-XJL25EXC.js";

// src/app/services/user-api.service.ts
var UserApiService = class _UserApiService {
  http = inject(HttpClient);
  base = "/api/users";
  status() {
    return firstValueFrom(this.http.get(`${this.base}/status`));
  }
  bootstrap(name) {
    return firstValueFrom(this.http.post(`${this.base}/bootstrap`, { name }));
  }
  login(name, code) {
    return firstValueFrom(this.http.post(`${this.base}/login`, { name, code }));
  }
  /** Re-validate a stored device identity (id + code). */
  resolve(userId, code) {
    return firstValueFrom(this.http.post(`${this.base}/resolve`, { userId, code }));
  }
  // Admin
  list() {
    return firstValueFrom(this.http.get(this.base));
  }
  create(name, isAdmin = false) {
    return firstValueFrom(this.http.post(this.base, { name, isAdmin }));
  }
  update(id, patch) {
    return firstValueFrom(this.http.patch(`${this.base}/${id}`, patch));
  }
  remove(id) {
    return firstValueFrom(this.http.delete(`${this.base}/${id}`));
  }
  static \u0275fac = function UserApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _UserApiService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _UserApiService, factory: _UserApiService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(UserApiService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/services/auth.service.ts
var AuthService = class _AuthService {
  api = inject(UserApiService);
  currentUser = signal(null, ...ngDevMode ? [{ debugName: "currentUser" }] : []);
  /** True until the initial identity resolution completes (avoids a flash of the login screen). */
  loading = signal(true, ...ngDevMode ? [{ debugName: "loading" }] : []);
  isSignedIn = computed(() => this.currentUser() !== null, ...ngDevMode ? [{ debugName: "isSignedIn" }] : []);
  isAdmin = computed(() => this.currentUser()?.isAdmin === true, ...ngDevMode ? [{ debugName: "isAdmin" }] : []);
  userId = computed(() => this.currentUser()?.id ?? null, ...ngDevMode ? [{ debugName: "userId" }] : []);
  /** Resolve the stored device identity into a live user (called once at app start). */
  async init() {
    this.loading.set(true);
    const stored = getStoredIdentity();
    if (!stored) {
      this.currentUser.set(null);
      this.loading.set(false);
      return;
    }
    try {
      const user = await this.api.resolve(stored.userId, stored.code);
      this.currentUser.set(user);
    } catch {
      clearStoredIdentity();
      this.currentUser.set(null);
    } finally {
      this.loading.set(false);
    }
  }
  status() {
    return this.api.status();
  }
  async login(name, code) {
    const user = await this.api.login(name, code);
    setStoredIdentity({ userId: user.id, code: user.joinCode });
    this.currentUser.set(user);
    return user;
  }
  async bootstrapFirstAdmin(name) {
    const user = await this.api.bootstrap(name);
    setStoredIdentity({ userId: user.id, code: user.joinCode });
    this.currentUser.set(user);
    return user;
  }
  logout() {
    clearStoredIdentity();
    this.currentUser.set(null);
  }
  static \u0275fac = function AuthService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _AuthService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthService, factory: _AuthService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

export {
  UserApiService,
  AuthService
};
//# sourceMappingURL=chunk-GPFFHOI7.js.map
