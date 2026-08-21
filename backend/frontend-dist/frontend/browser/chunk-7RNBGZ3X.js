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

// src/app/services/image.service.ts
var ImageService = class _ImageService {
  http;
  cache = /* @__PURE__ */ new Map();
  constructor(http) {
    this.http = http;
  }
  /**
   * Upload a base64 image and get back an image ID
   * @param base64Data The base64 data URL (e.g., "data:image/png;base64,...")
   * @returns The unique image ID
   */
  async uploadImage(base64Data) {
    const response = await firstValueFrom(this.http.post("/api/images", { data: base64Data }));
    return response.imageId;
  }
  /** Upload raw image bytes (multipart — no base64 overhead). Prefer for large lobby images. */
  async uploadImageFile(file, filename = "image.jpg") {
    const form = new FormData();
    form.append("file", file, filename);
    try {
      const response = await firstValueFrom(this.http.post("/api/images/upload", form));
      return response.imageId;
    } catch (err) {
      const status = err?.status ?? err?.error?.statusCode;
      if (status === 413) {
        throw new Error("Upload abgelehnt (413): Der Webserver blockiert die Datei \u2014 bei ~10 MB ist nginx fast sicher noch auf dem Standard 1m (nicht 100m). Auf dem VPS pr\xFCfen: sudo nginx -T | grep client_max_body_size");
      }
      throw err;
    }
  }
  /**
   * Get the URL for an image by its ID
   * For images stored in the new system, this returns /api/images/{id}
   * For legacy base64 data URLs, this returns them as-is
   * @param imageIdOrData Either an image ID or a legacy base64 data URL
   * @returns The image URL
   */
  getImageUrl(imageIdOrData) {
    if (!imageIdOrData) {
      return null;
    }
    if (imageIdOrData.startsWith("data:image")) {
      return imageIdOrData;
    }
    return `/api/images/${imageIdOrData}`;
  }
  /**
   * Preload an image into browser cache
   * @param imageId The image ID
   */
  async preloadImage(imageId) {
    if (this.cache.has(imageId)) {
      return;
    }
    const url = this.getImageUrl(imageId);
    if (!url)
      return;
    const img = new Image();
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = () => {
        this.cache.set(imageId, url);
        resolve();
      };
      img.onerror = reject;
    });
  }
  /**
   * Delete an image by its ID
   * @param imageId The image ID
   */
  async deleteImage(imageId) {
    const response = await firstValueFrom(this.http.delete(`/api/images/${imageId}`));
    this.cache.delete(imageId);
    return response.success;
  }
  static \u0275fac = function ImageService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImageService)(\u0275\u0275inject(HttpClient));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ImageService, factory: _ImageService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ImageService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], () => [{ type: HttpClient }], null);
})();

export {
  ImageService
};
//# sourceMappingURL=chunk-7RNBGZ3X.js.map
