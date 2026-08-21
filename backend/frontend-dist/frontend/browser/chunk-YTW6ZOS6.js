import {
  HttpClient
} from "./chunk-FGI44Z6P.js";
import {
  Injectable,
  firstValueFrom,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-XJL25EXC.js";

// src/app/services/character-api.service.ts
var CharacterApiService = class _CharacterApiService {
  http;
  constructor(http) {
    this.http = http;
  }
  async loadCharacter(id) {
    const observable = this.http.get(`/api/characters/${id}`);
    return await firstValueFrom(observable);
  }
  async getAllCharacterIds() {
    const observable = this.http.get(`/api/characters`);
    return await firstValueFrom(observable);
  }
  async getCharacterSummaries() {
    return await firstValueFrom(this.http.get(`/api/character-summaries`));
  }
  /** Admin: set exactly which users control a character. */
  async setControllers(id, controllerUserIds) {
    return await firstValueFrom(this.http.put(`/api/characters/${id}/controllers`, { controllerUserIds }));
  }
  async saveCharacter(id, sheet) {
    const observable = this.http.post(`/api/characters/${id}`, sheet);
    return await firstValueFrom(observable);
  }
  async patchCharacter(id, patch) {
    const observable = this.http.patch(`/api/characters/${id}`, patch);
    return await firstValueFrom(observable);
  }
  async uploadPortrait(id, file) {
    const formData = new FormData();
    formData.append("portrait", file);
    const observable = this.http.post(`/api/characters/${id}/portrait`, formData);
    await firstValueFrom(observable);
  }
  static \u0275fac = function CharacterApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CharacterApiService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CharacterApiService, factory: _CharacterApiService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CharacterApiService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: HttpClient }], null);
})();

// src/app/services/world-api.service.ts
var WorldApiService = class _WorldApiService {
  http;
  constructor(http) {
    this.http = http;
  }
  async loadWorld(name) {
    const observable = this.http.get(`/api/worlds/${name}`);
    return await firstValueFrom(observable);
  }
  async listWorlds() {
    return await firstValueFrom(this.http.get("/api/worlds"));
  }
  async saveWorld(name, world) {
    const observable = this.http.post(`/api/worlds/${name}`, world);
    return await firstValueFrom(observable);
  }
  async migratePortraitsToImages() {
    const observable = this.http.post("/api/migrate/portraits-to-images", {});
    return await firstValueFrom(observable);
  }
  static \u0275fac = function WorldApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _WorldApiService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _WorldApiService, factory: _WorldApiService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(WorldApiService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: HttpClient }], null);
})();

export {
  CharacterApiService,
  WorldApiService
};
//# sourceMappingURL=chunk-YTW6ZOS6.js.map
