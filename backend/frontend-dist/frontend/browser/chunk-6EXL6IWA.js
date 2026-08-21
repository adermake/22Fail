import {
  ImageService
} from "./chunk-7RNBGZ3X.js";
import {
  Pipe,
  setClassMetadata,
  ɵɵdefinePipe,
  ɵɵdirectiveInject
} from "./chunk-XJL25EXC.js";

// src/app/shared/image-url.pipe.ts
var ImageUrlPipe = class _ImageUrlPipe {
  imageService;
  constructor(imageService) {
    this.imageService = imageService;
  }
  transform(imageIdOrData) {
    return this.imageService.getImageUrl(imageIdOrData);
  }
  static \u0275fac = function ImageUrlPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImageUrlPipe)(\u0275\u0275directiveInject(ImageService, 16));
  };
  static \u0275pipe = /* @__PURE__ */ \u0275\u0275definePipe({ name: "imageUrl", type: _ImageUrlPipe, pure: true });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ImageUrlPipe, [{
    type: Pipe,
    args: [{
      name: "imageUrl",
      standalone: true
    }]
  }], () => [{ type: ImageService }], null);
})();

export {
  ImageUrlPipe
};
//# sourceMappingURL=chunk-6EXL6IWA.js.map
