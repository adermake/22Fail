import "./chunk-SAEWRC2J.js";
import {
  LoaderParserPriority,
  Resolver,
  VideoSource,
  copySearchParams,
  detectVideoAlphaMode,
  getPo2TextureFromSource,
  isSingleItem,
  path
} from "./chunk-5MWFKSP5.js";
import "./chunk-M4DNIF5Y.js";
import "./chunk-R2EZ263S.js";
import "./chunk-FEZ7UBPY.js";
import {
  Graphics
} from "./chunk-63XQKXED.js";
import {
  AbstractRenderer,
  ApplicationInitHook,
  BatchableSprite,
  RenderTexture,
  color32BitToUniform
} from "./chunk-PYFMMMK4.js";
import {
  Container,
  ObservablePoint,
  Sprite,
  State,
  TexturePool,
  Ticker,
  UPDATE_PRIORITY,
  ViewContainer,
  updateQuadBounds
} from "./chunk-S6DPH2MO.js";
import {
  CanvasTextMetrics,
  TextStyle,
  fontStringFromTextStyle,
  getCanvasFillStyle
} from "./chunk-5SA2GSD2.js";
import {
  Cache,
  convertToList
} from "./chunk-WDCBB5HS.js";
import {
  CanvasPool
} from "./chunk-MJ6HN5ZI.js";
import {
  GraphicsContext
} from "./chunk-N53IB7JL.js";
import {
  ImageSource
} from "./chunk-3JCEIXSU.js";
import "./chunk-QPMDZYBZ.js";
import {
  GCManagedHash,
  getAdjustedBlendModeBlend
} from "./chunk-I5ESPBNU.js";
import {
  BindGroup,
  Buffer,
  BufferUsage,
  Color,
  DOMAdapter,
  ExtensionType,
  Geometry,
  GlProgram,
  Matrix,
  Rectangle,
  Shader,
  Texture,
  TextureSource,
  TextureStyle,
  UniformGroup,
  deprecation,
  extensions,
  nextPow2,
  v8_0_0,
  warn
} from "./chunk-5ZGFVOTG.js";
import {
  generateId
} from "./chunk-OVLXAWKG.js";
import {
  AuthService
} from "./chunk-GPFFHOI7.js";
import {
  lookup
} from "./chunk-J3D7AX2Y.js";
import {
  identityAuth,
  identityHeaders
} from "./chunk-VMYLUGMS.js";
import {
  ActivatedRoute
} from "./chunk-V6FR55FP.js";
import "./chunk-YJYDFJW3.js";
import {
  CommonModule,
  HttpClient,
  NgStyle
} from "./chunk-FGI44Z6P.js";
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  Subject,
  ViewChild,
  computed,
  firstValueFrom,
  inject,
  setClassMetadata,
  signal,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵrepeaterTrackByIndex,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵviewQuery
} from "./chunk-XJL25EXC.js";
import {
  __objRest,
  __spreadProps,
  __spreadValues
} from "./chunk-KWSTWQNB.js";

// node_modules/pixi.js/lib/environment-browser/browserExt.mjs
var browserExt = {
  extension: {
    type: ExtensionType.Environment,
    name: "browser",
    priority: -1
  },
  test: () => true,
  load: async () => {
    await import("./chunk-W2ZKHBVV.js");
  }
};

// node_modules/pixi.js/lib/environment-webworker/webworkerExt.mjs
var webworkerExt = {
  extension: {
    type: ExtensionType.Environment,
    name: "webworker",
    priority: 0
  },
  test: () => typeof self !== "undefined" && self.WorkerGlobalScope !== void 0,
  load: async () => {
    await import("./chunk-EOY4N5MV.js");
  }
};

// node_modules/pixi.js/lib/utils/browser/isWebGLSupported.mjs
var _isWebGLSupported;
function isWebGLSupported(failIfMajorPerformanceCaveat) {
  if (_isWebGLSupported !== void 0) return _isWebGLSupported;
  _isWebGLSupported = (() => {
    const contextOptions = {
      stencil: true,
      failIfMajorPerformanceCaveat: failIfMajorPerformanceCaveat ?? AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat
    };
    try {
      if (!DOMAdapter.get().getWebGLRenderingContext()) {
        return false;
      }
      const canvas = DOMAdapter.get().createCanvas();
      let gl = canvas.getContext("webgl", contextOptions);
      const success = !!gl?.getContextAttributes()?.stencil;
      if (gl) {
        const loseContext = gl.getExtension("WEBGL_lose_context");
        if (loseContext) {
          loseContext.loseContext();
        }
      }
      gl = null;
      return success;
    } catch (_e) {
      return false;
    }
  })();
  return _isWebGLSupported;
}

// node_modules/pixi.js/lib/utils/browser/isWebGPUSupported.mjs
var _isWebGPUSupported;
async function isWebGPUSupported(options = {}) {
  if (_isWebGPUSupported !== void 0) return _isWebGPUSupported;
  _isWebGPUSupported = await (async () => {
    const gpu = DOMAdapter.get().getNavigator().gpu;
    if (!gpu) {
      return false;
    }
    try {
      const adapter = await gpu.requestAdapter(options);
      await adapter.requestDevice();
      return true;
    } catch (_e) {
      return false;
    }
  })();
  return _isWebGPUSupported;
}

// node_modules/pixi.js/lib/rendering/renderers/autoDetectRenderer.mjs
var renderPriority = ["webgl", "webgpu", "canvas"];
async function autoDetectRenderer(options) {
  let preferredOrder = [];
  if (options.preference) {
    if (Array.isArray(options.preference)) {
      preferredOrder = options.preference.slice();
    } else {
      preferredOrder.push(options.preference);
      renderPriority.forEach((item) => {
        if (item !== options.preference) {
          preferredOrder.push(item);
        }
      });
    }
  } else {
    preferredOrder = renderPriority.slice();
  }
  let RendererClass;
  let finalOptions = {};
  for (let i = 0; i < preferredOrder.length; i++) {
    const rendererType = preferredOrder[i];
    if (rendererType === "webgpu" && await isWebGPUSupported()) {
      const { WebGPURenderer } = await import("./chunk-V2XU5KS5.js");
      RendererClass = WebGPURenderer;
      finalOptions = __spreadValues(__spreadValues({}, options), options.webgpu);
      break;
    } else if (rendererType === "webgl" && isWebGLSupported(
      options.failIfMajorPerformanceCaveat ?? AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat
    )) {
      const { WebGLRenderer } = await import("./chunk-BJHL2WT6.js");
      RendererClass = WebGLRenderer;
      finalOptions = __spreadValues(__spreadValues({}, options), options.webgl);
      break;
    } else if (rendererType === "canvas") {
      const { CanvasRenderer } = await import("./chunk-ZXS5YUUH.js");
      RendererClass = CanvasRenderer;
      finalOptions = __spreadValues(__spreadValues({}, options), options.canvasOptions);
      break;
    }
  }
  delete finalOptions.webgpu;
  delete finalOptions.webgl;
  delete finalOptions.canvasOptions;
  if (!RendererClass) {
    throw new Error("No available renderer for the current environment");
  }
  const renderer = new RendererClass();
  await renderer.init(finalOptions);
  return renderer;
}

// node_modules/pixi.js/lib/app/ResizePlugin.mjs
var ResizePlugin = class {
  /**
   * Initialize the plugin with scope of application instance
   * @private
   * @param {object} [options] - See application options
   */
  static init(options) {
    Object.defineProperty(
      this,
      "resizeTo",
      {
        configurable: true,
        set(dom) {
          globalThis.removeEventListener("resize", this.queueResize);
          this._resizeTo = dom;
          if (dom) {
            globalThis.addEventListener("resize", this.queueResize);
            this.resize();
          }
        },
        get() {
          return this._resizeTo;
        }
      }
    );
    this.queueResize = () => {
      if (!this._resizeTo) {
        return;
      }
      this._cancelResize();
      this._resizeId = requestAnimationFrame(() => this.resize());
    };
    this._cancelResize = () => {
      if (this._resizeId) {
        cancelAnimationFrame(this._resizeId);
        this._resizeId = null;
      }
    };
    this.resize = () => {
      if (!this._resizeTo) {
        return;
      }
      this._cancelResize();
      let width;
      let height;
      if (this._resizeTo === globalThis.window) {
        width = globalThis.innerWidth;
        height = globalThis.innerHeight;
      } else {
        const { clientWidth, clientHeight } = this._resizeTo;
        width = clientWidth;
        height = clientHeight;
      }
      this.renderer.resize(width, height);
      this.render();
    };
    this._resizeId = null;
    this._resizeTo = null;
    this.resizeTo = options.resizeTo || null;
  }
  /**
   * Clean up the ticker, scoped to application
   * @private
   */
  static destroy() {
    globalThis.removeEventListener("resize", this.queueResize);
    this._cancelResize();
    this._cancelResize = null;
    this.queueResize = null;
    this.resizeTo = null;
    this.resize = null;
  }
};
ResizePlugin.extension = ExtensionType.Application;

// node_modules/pixi.js/lib/app/TickerPlugin.mjs
var TickerPlugin = class {
  /**
   * Initialize the plugin with scope of application instance
   * @private
   * @param {object} [options] - See application options
   */
  static init(options) {
    options = Object.assign({
      autoStart: true,
      sharedTicker: false
    }, options);
    Object.defineProperty(
      this,
      "ticker",
      {
        configurable: true,
        set(ticker) {
          if (this._ticker) {
            this._ticker.remove(this.render, this);
          }
          this._ticker = ticker;
          if (ticker) {
            ticker.add(this.render, this, UPDATE_PRIORITY.LOW);
          }
        },
        get() {
          return this._ticker;
        }
      }
    );
    this.stop = () => {
      this._ticker.stop();
    };
    this.start = () => {
      this._ticker.start();
    };
    this._ticker = null;
    this.ticker = options.sharedTicker ? Ticker.shared : new Ticker();
    if (options.autoStart) {
      this.start();
    }
  }
  /**
   * Clean up the ticker, scoped to application.
   * @private
   */
  static destroy() {
    if (this._ticker) {
      const oldTicker = this._ticker;
      this.ticker = null;
      oldTicker.destroy();
    }
  }
};
TickerPlugin.extension = ExtensionType.Application;

// node_modules/pixi.js/lib/app/init.mjs
extensions.add(ResizePlugin);
extensions.add(TickerPlugin);

// node_modules/pixi.js/lib/app/Application.mjs
var _Application = class _Application2 {
  constructor(...args) {
    this.stage = new Container();
    if (args[0] !== void 0) {
      deprecation(v8_0_0, "Application constructor options are deprecated, please use Application.init() instead.");
    }
  }
  /**
   * Initializes the PixiJS application with the specified options.
   *
   * This method must be called after creating a new Application instance.
   * @param options - Configuration options for the application and renderer
   * @returns A promise that resolves when initialization is complete
   * @example
   * ```js
   * const app = new Application();
   *
   * // Initialize with custom options
   * await app.init({
   *     width: 800,
   *     height: 600,
   *     backgroundColor: 0x1099bb,
   *     preference: 'webgl', // or 'webgpu'
   * });
   * ```
   */
  async init(options) {
    options = __spreadValues({}, options);
    this.stage || (this.stage = new Container());
    this.renderer = await autoDetectRenderer(options);
    _Application2._plugins.forEach((plugin) => {
      plugin.init.call(this, options);
    });
  }
  /**
   * Renders the current stage to the screen.
   *
   * When using the default setup with {@link TickerPlugin} (enabled by default), you typically don't need to call
   * this method directly as rendering is handled automatically.
   *
   * Only use this method if you've disabled the {@link TickerPlugin} or need custom
   * render timing control.
   * @example
   * ```js
   * // Example 1: Default setup (TickerPlugin handles rendering)
   * const app = new Application();
   * await app.init();
   * // No need to call render() - TickerPlugin handles it
   *
   * // Example 2: Custom rendering loop (if TickerPlugin is disabled)
   * const app = new Application();
   * await app.init({ autoStart: false }); // Disable automatic rendering
   *
   * function animate() {
   *     app.render();
   *     requestAnimationFrame(animate);
   * }
   * animate();
   * ```
   */
  render() {
    this.renderer.render({ container: this.stage });
  }
  /**
   * Reference to the renderer's canvas element. This is the HTML element
   * that displays your application's graphics.
   * @readonly
   * @type {HTMLCanvasElement}
   * @example
   * ```js
   * // Create a new application
   * const app = new Application();
   * // Initialize the application
   * await app.init({...});
   * // Add canvas to the page
   * document.body.appendChild(app.canvas);
   *
   * // Access the canvas directly
   * console.log(app.canvas); // HTMLCanvasElement
   * ```
   */
  get canvas() {
    return this.renderer.canvas;
  }
  /**
   * Reference to the renderer's canvas element.
   * @type {HTMLCanvasElement}
   * @deprecated since 8.0.0
   * @see {@link Application#canvas}
   */
  get view() {
    deprecation(v8_0_0, "Application.view is deprecated, please use Application.canvas instead.");
    return this.renderer.canvas;
  }
  /**
   * Reference to the renderer's screen rectangle. This represents the visible area of your application.
   *
   * It's commonly used for:
   * - Setting filter areas for full-screen effects
   * - Defining hit areas for screen-wide interaction
   * - Determining the visible bounds of your application
   * @readonly
   * @example
   * ```js
   * // Use as filter area for a full-screen effect
   * const blurFilter = new BlurFilter();
   * sprite.filterArea = app.screen;
   *
   * // Use as hit area for screen-wide interaction
   * const screenSprite = new Sprite();
   * screenSprite.hitArea = app.screen;
   *
   * // Get screen dimensions
   * console.log(app.screen.width, app.screen.height);
   * ```
   * @see {@link Rectangle} For all available properties and methods
   */
  get screen() {
    return this.renderer.screen;
  }
  /**
   * Get the html div element that holds all DOM Container elements.
   * @readonly
   * @type {HTMLDivElement}
   */
  get domContainerRoot() {
    return this.renderer.renderPipes.dom?._domElement;
  }
  /**
   * Destroys the application and all of its resources.
   *
   * This method should be called when you want to completely
   * clean up the application and free all associated memory.
   * @param rendererDestroyOptions - Options for destroying the renderer:
   *  - `false` or `undefined`: Preserves the canvas element (default)
   *  - `true`: Removes the canvas element
   *  - `{ removeView: boolean }`: Object with removeView property to control canvas removal
   * @param options - Options for destroying the application:
   *  - `false` or `undefined`: Basic cleanup (default)
   *  - `true`: Complete cleanup including children
   *  - Detailed options object:
   *    - `children`: Remove children
   *    - `texture`: Destroy textures
   *    - `textureSource`: Destroy texture sources
   *    - `context`: Destroy WebGL context
   * @example
   * ```js
   * // Basic cleanup
   * app.destroy();
   *
   * // Remove canvas and do complete cleanup
   * app.destroy(true, true);
   *
   * // Remove canvas with explicit options
   * app.destroy({ removeView: true }, true);
   *
   * // Detailed cleanup with specific options
   * app.destroy(
   *     { removeView: true },
   *     {
   *         children: true,
   *         texture: true,
   *         textureSource: true,
   *         context: true
   *     }
   * );
   * ```
   * > [!WARNING] After calling destroy, the application instance should no longer be used.
   * > All properties will be null and further operations will throw errors.
   */
  destroy(rendererDestroyOptions = false, options = false) {
    const plugins = _Application2._plugins.slice(0);
    plugins.reverse();
    plugins.forEach((plugin) => {
      plugin.destroy.call(this);
    });
    this.stage.destroy(options);
    this.stage = null;
    this.renderer.destroy(rendererDestroyOptions);
    this.renderer = null;
  }
};
_Application._plugins = [];
var Application = _Application;
extensions.handleByList(ExtensionType.Application, Application._plugins);
extensions.add(ApplicationInitHook);

// node_modules/pixi.js/lib/scene/text-bitmap/asset/bitmapFontTextParser.mjs
var bitmapFontTextParser = {
  test(data) {
    return typeof data === "string" && data.startsWith("info face=");
  },
  parse(txt) {
    const items = txt.match(/^[a-z]+\s+.+$/gm);
    const rawData = {
      info: [],
      common: [],
      page: [],
      char: [],
      chars: [],
      kerning: [],
      kernings: [],
      distanceField: []
    };
    for (const i in items) {
      const name = items[i].match(/^[a-z]+/gm)[0];
      const attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);
      const itemData = {};
      for (const i2 in attributeList) {
        const split = attributeList[i2].split("=");
        const key = split[0];
        const strValue = split[1].replace(/"/gm, "");
        const floatValue = parseFloat(strValue);
        const value = isNaN(floatValue) ? strValue : floatValue;
        itemData[key] = value;
      }
      rawData[name].push(itemData);
    }
    const font = {
      chars: {},
      pages: [],
      lineHeight: 0,
      fontSize: 0,
      fontFamily: "",
      distanceField: null,
      baseLineOffset: 0
    };
    const [info] = rawData.info;
    const [common] = rawData.common;
    const [distanceField] = rawData.distanceField ?? [];
    if (distanceField) {
      font.distanceField = {
        range: parseInt(distanceField.distanceRange, 10),
        type: distanceField.fieldType
      };
    }
    font.fontSize = parseInt(info.size, 10);
    font.fontFamily = info.face;
    font.lineHeight = parseInt(common.lineHeight, 10);
    const page = rawData.page;
    for (let i = 0; i < page.length; i++) {
      font.pages.push({
        id: parseInt(page[i].id, 10) || 0,
        file: page[i].file
      });
    }
    const map = {};
    font.baseLineOffset = font.lineHeight - parseInt(common.base, 10);
    const char = rawData.char;
    for (let i = 0; i < char.length; i++) {
      const charNode = char[i];
      const id = parseInt(charNode.id, 10);
      let letter = charNode.letter ?? charNode.char ?? String.fromCharCode(id);
      if (letter === "space") letter = " ";
      map[id] = letter;
      font.chars[letter] = {
        id,
        // texture deets..
        page: parseInt(charNode.page, 10) || 0,
        x: parseInt(charNode.x, 10),
        y: parseInt(charNode.y, 10),
        width: parseInt(charNode.width, 10),
        height: parseInt(charNode.height, 10),
        xOffset: parseInt(charNode.xoffset, 10),
        yOffset: parseInt(charNode.yoffset, 10),
        xAdvance: parseInt(charNode.xadvance, 10),
        kerning: {}
      };
    }
    const kerning = rawData.kerning || [];
    for (let i = 0; i < kerning.length; i++) {
      const first = parseInt(kerning[i].first, 10);
      const second = parseInt(kerning[i].second, 10);
      const amount = parseInt(kerning[i].amount, 10);
      if (font.chars[map[second]]) font.chars[map[second]].kerning[map[first]] = amount;
    }
    return font;
  }
};

// node_modules/pixi.js/lib/scene/text-bitmap/asset/bitmapFontXMLParser.mjs
var bitmapFontXMLParser = {
  test(data) {
    const xml = data;
    return typeof xml !== "string" && "getElementsByTagName" in xml && xml.getElementsByTagName("page").length && xml.getElementsByTagName("info")[0].getAttribute("face") !== null;
  },
  parse(xml) {
    const data = {
      chars: {},
      pages: [],
      lineHeight: 0,
      fontSize: 0,
      fontFamily: "",
      distanceField: null,
      baseLineOffset: 0
    };
    const info = xml.getElementsByTagName("info")[0];
    const common = xml.getElementsByTagName("common")[0];
    const distanceField = xml.getElementsByTagName("distanceField")[0];
    if (distanceField) {
      data.distanceField = {
        type: distanceField.getAttribute("fieldType"),
        range: parseInt(distanceField.getAttribute("distanceRange"), 10)
      };
    }
    const page = xml.getElementsByTagName("page");
    const char = xml.getElementsByTagName("char");
    const kerning = xml.getElementsByTagName("kerning");
    data.fontSize = parseInt(info.getAttribute("size"), 10);
    data.fontFamily = info.getAttribute("face");
    data.lineHeight = parseInt(common.getAttribute("lineHeight"), 10);
    for (let i = 0; i < page.length; i++) {
      data.pages.push({
        id: parseInt(page[i].getAttribute("id"), 10) || 0,
        file: page[i].getAttribute("file")
      });
    }
    const map = {};
    data.baseLineOffset = data.lineHeight - parseInt(common.getAttribute("base"), 10);
    for (let i = 0; i < char.length; i++) {
      const charNode = char[i];
      const id = parseInt(charNode.getAttribute("id"), 10);
      let letter = charNode.getAttribute("letter") ?? charNode.getAttribute("char") ?? String.fromCharCode(id);
      if (letter === "space") letter = " ";
      map[id] = letter;
      data.chars[letter] = {
        id,
        // texture deets..
        page: parseInt(charNode.getAttribute("page"), 10) || 0,
        x: parseInt(charNode.getAttribute("x"), 10),
        y: parseInt(charNode.getAttribute("y"), 10),
        width: parseInt(charNode.getAttribute("width"), 10),
        height: parseInt(charNode.getAttribute("height"), 10),
        // render deets..
        xOffset: parseInt(charNode.getAttribute("xoffset"), 10),
        yOffset: parseInt(charNode.getAttribute("yoffset"), 10),
        // + baseLineOffset,
        xAdvance: parseInt(charNode.getAttribute("xadvance"), 10),
        kerning: {}
      };
    }
    for (let i = 0; i < kerning.length; i++) {
      const first = parseInt(kerning[i].getAttribute("first"), 10);
      const second = parseInt(kerning[i].getAttribute("second"), 10);
      const amount = parseInt(kerning[i].getAttribute("amount"), 10);
      if (data.chars[map[second]]) data.chars[map[second]].kerning[map[first]] = amount;
    }
    return data;
  }
};

// node_modules/pixi.js/lib/scene/text-bitmap/asset/bitmapFontXMLStringParser.mjs
var bitmapFontXMLStringParser = {
  test(data) {
    if (typeof data === "string" && data.match(/<font(\s|>)/)) {
      return bitmapFontXMLParser.test(DOMAdapter.get().parseXML(data));
    }
    return false;
  },
  parse(data) {
    return bitmapFontXMLParser.parse(DOMAdapter.get().parseXML(data));
  }
};

// node_modules/pixi.js/lib/scene/text-bitmap/asset/loadBitmapFont.mjs
var validExtensions = [".xml", ".fnt"];
var bitmapFontCachePlugin = {
  extension: {
    type: ExtensionType.CacheParser,
    name: "cacheBitmapFont"
  },
  test: (asset) => !!asset?.pages && !!asset?.chars && typeof asset?.fontFamily === "string" && asset.fontFamily !== "",
  getCacheableAssets(keys, asset) {
    const out = {};
    keys.forEach((key) => {
      out[key] = asset;
      out[`${key}-bitmap`] = asset;
    });
    out[`${asset.fontFamily}-bitmap`] = asset;
    return out;
  }
};
var loadBitmapFont = {
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.Normal
  },
  /** used for deprecation purposes */
  name: "loadBitmapFont",
  id: "bitmap-font",
  test(url) {
    return validExtensions.includes(path.extname(url).toLowerCase());
  },
  async testParse(data) {
    return bitmapFontTextParser.test(data) || bitmapFontXMLStringParser.test(data);
  },
  async parse(asset, data, loader) {
    const bitmapFontData = bitmapFontTextParser.test(asset) ? bitmapFontTextParser.parse(asset) : bitmapFontXMLStringParser.parse(asset);
    const { src } = data;
    const { pages } = bitmapFontData;
    const textureUrls = [];
    const textureOptions = bitmapFontData.distanceField ? {
      scaleMode: "linear",
      alphaMode: "premultiply-alpha-on-upload",
      autoGenerateMipmaps: false,
      resolution: 1
    } : {};
    for (let i = 0; i < pages.length; ++i) {
      const pageFile = pages[i].file;
      let imagePath = path.join(path.dirname(src), pageFile);
      imagePath = copySearchParams(imagePath, src);
      textureUrls.push({
        src: imagePath,
        data: textureOptions
      });
    }
    const [loadedTextures, { BitmapFont }] = await Promise.all([
      loader.load(textureUrls),
      import("./chunk-OJT7X5BO.js")
    ]);
    const textures = textureUrls.map((url) => loadedTextures[url.src]);
    const bitmapFont = new BitmapFont({
      data: bitmapFontData,
      textures
    }, src);
    return bitmapFont;
  },
  async load(url, _options) {
    const response = await DOMAdapter.get().fetch(url);
    return await response.text();
  },
  async unload(bitmapFont, _resolvedAsset, loader) {
    await Promise.all(bitmapFont.pages.map((page) => loader.unload(page.texture.source._sourceOrigin)));
    bitmapFont.destroy();
  }
};

// node_modules/pixi.js/lib/assets/BackgroundLoader.mjs
var BackgroundLoader = class {
  /**
   * @param loader
   * @param verbose - should the loader log to the console
   */
  constructor(loader, verbose = false) {
    this._loader = loader;
    this._assetList = [];
    this._isLoading = false;
    this._maxConcurrent = 1;
    this.verbose = verbose;
  }
  /**
   * Adds assets to the background loading queue. Assets are loaded one at a time to minimize
   * performance impact.
   * @param assetUrls - Array of resolved assets to load in the background
   * @example
   * ```ts
   * // Add assets to background load queue
   * backgroundLoader.add([
   *     { src: 'images/level1/bg.png' },
   *     { src: 'images/level1/characters.json' }
   * ]);
   *
   * // Assets will load sequentially in the background
   * // The loader automatically pauses when high-priority loads occur
   * // e.g. Assets.load() is called
   * ```
   * @remarks
   * - Assets are loaded one at a time to minimize performance impact
   * - Loading automatically pauses when Assets.load() is called
   * - No progress tracking is available for background loading
   * - Assets are cached as they complete loading
   * @internal
   */
  add(assetUrls) {
    assetUrls.forEach((a) => {
      this._assetList.push(a);
    });
    if (this.verbose) {
      console.log("[BackgroundLoader] assets: ", this._assetList);
    }
    if (this._isActive && !this._isLoading) {
      void this._next();
    }
  }
  /**
   * Loads the next set of assets. Will try to load as many assets as it can at the same time.
   *
   * The max assets it will try to load at one time will be 4.
   */
  async _next() {
    if (this._assetList.length && this._isActive) {
      this._isLoading = true;
      const toLoad = [];
      const toLoadAmount = Math.min(this._assetList.length, this._maxConcurrent);
      for (let i = 0; i < toLoadAmount; i++) {
        toLoad.push(this._assetList.pop());
      }
      await this._loader.load(toLoad);
      this._isLoading = false;
      void this._next();
    }
  }
  /**
   * Controls the active state of the background loader. When active, the loader will
   * continue processing its queue. When inactive, loading is paused.
   * @returns Whether the background loader is currently active
   * @example
   * ```ts
   * // Pause background loading
   * backgroundLoader.active = false;
   *
   * // Resume background loading
   * backgroundLoader.active = true;
   *
   * // Check current state
   * console.log(backgroundLoader.active); // true/false
   *
   * // Common use case: Pause during intensive operations
   * backgroundLoader.active = false;  // Pause background loading
   * ... // Perform high-priority tasks
   * backgroundLoader.active = true;   // Resume background loading
   * ```
   * @remarks
   * - Setting to true resumes loading immediately
   * - Setting to false pauses after current asset completes
   * - Background loading is automatically paused during `Assets.load()`
   * - Assets already being loaded will complete even when set to false
   */
  get active() {
    return this._isActive;
  }
  set active(value) {
    if (this._isActive === value) return;
    this._isActive = value;
    if (value && !this._isLoading) {
      void this._next();
    }
  }
};

// node_modules/pixi.js/lib/assets/cache/parsers/cacheTextureArray.mjs
var cacheTextureArray = {
  extension: {
    type: ExtensionType.CacheParser,
    name: "cacheTextureArray"
  },
  test: (asset) => Array.isArray(asset) && asset.every((t) => t instanceof Texture),
  getCacheableAssets: (keys, asset) => {
    const out = {};
    keys.forEach((key) => {
      asset.forEach((item, i) => {
        out[key + (i === 0 ? "" : i + 1)] = item;
      });
    });
    return out;
  }
};

// node_modules/pixi.js/lib/assets/detections/utils/testImageFormat.mjs
async function testImageFormat(imageData) {
  if ("Image" in globalThis) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        resolve(true);
      };
      image.onerror = () => {
        resolve(false);
      };
      image.src = imageData;
    });
  }
  if ("createImageBitmap" in globalThis && "fetch" in globalThis) {
    try {
      const blob = await (await fetch(imageData)).blob();
      await createImageBitmap(blob);
    } catch (_e) {
      return false;
    }
    return true;
  }
  return false;
}

// node_modules/pixi.js/lib/assets/detections/parsers/detectAvif.mjs
var detectAvif = {
  extension: {
    type: ExtensionType.DetectionParser,
    priority: 1
  },
  test: async () => testImageFormat(
    // eslint-disable-next-line max-len
    "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A="
  ),
  add: async (formats) => [...formats, "avif"],
  remove: async (formats) => formats.filter((f) => f !== "avif")
};

// node_modules/pixi.js/lib/assets/detections/parsers/detectDefaults.mjs
var imageFormats = ["png", "jpg", "jpeg"];
var detectDefaults = {
  extension: {
    type: ExtensionType.DetectionParser,
    priority: -1
  },
  test: () => Promise.resolve(true),
  add: async (formats) => [...formats, ...imageFormats],
  remove: async (formats) => formats.filter((f) => !imageFormats.includes(f))
};

// node_modules/pixi.js/lib/assets/detections/utils/testVideoFormat.mjs
var inWorker = "WorkerGlobalScope" in globalThis && globalThis instanceof globalThis.WorkerGlobalScope;
function testVideoFormat(mimeType) {
  if (inWorker) {
    return false;
  }
  const video = document.createElement("video");
  return video.canPlayType(mimeType) !== "";
}

// node_modules/pixi.js/lib/assets/detections/parsers/detectMp4.mjs
var detectMp4 = {
  extension: {
    type: ExtensionType.DetectionParser,
    priority: 0
  },
  test: async () => testVideoFormat("video/mp4"),
  add: async (formats) => [...formats, "mp4", "m4v"],
  remove: async (formats) => formats.filter((f) => f !== "mp4" && f !== "m4v")
};

// node_modules/pixi.js/lib/assets/detections/parsers/detectOgv.mjs
var detectOgv = {
  extension: {
    type: ExtensionType.DetectionParser,
    priority: 0
  },
  test: async () => testVideoFormat("video/ogg"),
  add: async (formats) => [...formats, "ogv"],
  remove: async (formats) => formats.filter((f) => f !== "ogv")
};

// node_modules/pixi.js/lib/assets/detections/parsers/detectWebm.mjs
var detectWebm = {
  extension: {
    type: ExtensionType.DetectionParser,
    priority: 0
  },
  test: async () => testVideoFormat("video/webm"),
  add: async (formats) => [...formats, "webm"],
  remove: async (formats) => formats.filter((f) => f !== "webm")
};

// node_modules/pixi.js/lib/assets/detections/parsers/detectWebp.mjs
var detectWebp = {
  extension: {
    type: ExtensionType.DetectionParser,
    priority: 0
  },
  test: async () => testImageFormat(
    "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
  ),
  add: async (formats) => [...formats, "webp"],
  remove: async (formats) => formats.filter((f) => f !== "webp")
};

// node_modules/pixi.js/lib/assets/loader/Loader.mjs
var _Loader = class _Loader2 {
  constructor() {
    this.loadOptions = __spreadValues({}, _Loader2.defaultOptions);
    this._parsers = [];
    this._parsersValidated = false;
    this.parsers = new Proxy(this._parsers, {
      set: (target, key, value) => {
        this._parsersValidated = false;
        target[key] = value;
        return true;
      }
    });
    this.promiseCache = {};
  }
  /** function used for testing */
  reset() {
    this._parsersValidated = false;
    this.promiseCache = {};
  }
  /**
   * Used internally to generate a promise for the asset to be loaded.
   * @param url - The URL to be loaded
   * @param data - any custom additional information relevant to the asset being loaded
   * @returns - a promise that will resolve to an Asset for example a Texture of a JSON object
   */
  _getLoadPromiseAndParser(url, data) {
    const result = {
      promise: null,
      parser: null
    };
    result.promise = (async () => {
      let asset = null;
      let parser = null;
      if (data.parser || data.loadParser) {
        parser = this._parserHash[data.parser || data.loadParser];
        if (data.loadParser) {
          warn(
            `[Assets] "loadParser" is deprecated, use "parser" instead for ${url}`
          );
        }
        if (!parser) {
          warn(
            `[Assets] specified load parser "${data.parser || data.loadParser}" not found while loading ${url}`
          );
        }
      }
      if (!parser) {
        for (let i = 0; i < this.parsers.length; i++) {
          const parserX = this.parsers[i];
          if (parserX.load && parserX.test?.(url, data, this)) {
            parser = parserX;
            break;
          }
        }
        if (!parser) {
          warn(`[Assets] ${url} could not be loaded as we don't know how to parse it, ensure the correct parser has been added`);
          return null;
        }
      }
      asset = await parser.load(url, data, this);
      result.parser = parser;
      for (let i = 0; i < this.parsers.length; i++) {
        const parser2 = this.parsers[i];
        if (parser2.parse) {
          if (parser2.parse && await parser2.testParse?.(asset, data, this)) {
            asset = await parser2.parse(asset, data, this) || asset;
            result.parser = parser2;
          }
        }
      }
      return asset;
    })();
    return result;
  }
  async load(assetsToLoadIn, onProgressOrOptions) {
    if (!this._parsersValidated) {
      this._validateParsers();
    }
    const options = typeof onProgressOrOptions === "function" ? __spreadProps(__spreadValues(__spreadValues({}, _Loader2.defaultOptions), this.loadOptions), { onProgress: onProgressOrOptions }) : __spreadValues(__spreadValues(__spreadValues({}, _Loader2.defaultOptions), this.loadOptions), onProgressOrOptions || {});
    const { onProgress, onError, strategy, retryCount, retryDelay } = options;
    let count = 0;
    const assets = {};
    const singleAsset = isSingleItem(assetsToLoadIn);
    const assetsToLoad = convertToList(assetsToLoadIn, (item) => ({
      alias: [item],
      src: item,
      data: {}
    }));
    const total = assetsToLoad.reduce((sum, asset) => sum + (asset.progressSize || 1), 0);
    const promises = assetsToLoad.map(async (asset) => {
      const url = path.toAbsolute(asset.src);
      if (assets[asset.src]) return;
      await this._loadAssetWithRetry(url, asset, { onProgress, onError, strategy, retryCount, retryDelay }, assets);
      count += asset.progressSize || 1;
      if (onProgress) onProgress(count / total);
    });
    await Promise.all(promises);
    return singleAsset ? assets[assetsToLoad[0].src] : assets;
  }
  /**
   * Unloads one or more assets. Any unloaded assets will be destroyed, freeing up memory for your app.
   * The parser that created the asset, will be the one that unloads it.
   * @example
   * // Single asset:
   * const asset = await Loader.load('cool.png');
   *
   * await Loader.unload('cool.png');
   *
   * console.log(asset.destroyed); // true
   * @param assetsToUnloadIn - urls that you want to unload, or a single one!
   */
  async unload(assetsToUnloadIn) {
    const assetsToUnload = convertToList(assetsToUnloadIn, (item) => ({
      alias: [item],
      src: item
    }));
    const promises = assetsToUnload.map(async (asset) => {
      const url = path.toAbsolute(asset.src);
      const loadPromise = this.promiseCache[url];
      if (loadPromise) {
        const loadedAsset = await loadPromise.promise;
        delete this.promiseCache[url];
        await loadPromise.parser?.unload?.(loadedAsset, asset, this);
      }
    });
    await Promise.all(promises);
  }
  /** validates our parsers, right now it only checks for name conflicts but we can add more here as required! */
  _validateParsers() {
    this._parsersValidated = true;
    this._parserHash = this._parsers.filter((parser) => parser.name || parser.id).reduce((hash, parser) => {
      if (!parser.name && !parser.id) {
        warn(`[Assets] parser should have an id`);
      } else if (hash[parser.name] || hash[parser.id]) {
        warn(`[Assets] parser id conflict "${parser.id}"`);
      }
      hash[parser.name] = parser;
      if (parser.id) hash[parser.id] = parser;
      return hash;
    }, {});
  }
  async _loadAssetWithRetry(url, asset, options, assets) {
    let attempt = 0;
    const { onError, strategy, retryCount, retryDelay } = options;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    while (true) {
      try {
        if (!this.promiseCache[url]) {
          this.promiseCache[url] = this._getLoadPromiseAndParser(url, asset);
        }
        assets[asset.src] = await this.promiseCache[url].promise;
        return;
      } catch (e) {
        delete this.promiseCache[url];
        delete assets[asset.src];
        attempt++;
        const isLast = strategy !== "retry" || attempt > retryCount;
        if (strategy === "retry" && !isLast) {
          if (onError) onError(e, asset);
          await wait(retryDelay);
          continue;
        }
        if (strategy === "skip") {
          if (onError) onError(e, asset);
          return;
        }
        if (onError) onError(e, asset);
        const error = new Error(`[Loader.load] Failed to load ${url}.
${e}`);
        if (e instanceof Error && e.stack) {
          error.stack = e.stack;
        }
        throw error;
      }
    }
  }
};
_Loader.defaultOptions = {
  onProgress: void 0,
  onError: void 0,
  strategy: "throw",
  retryCount: 3,
  retryDelay: 250
};
var Loader = _Loader;

// node_modules/pixi.js/lib/assets/utils/checkDataUrl.mjs
function checkDataUrl(url, mimes) {
  if (Array.isArray(mimes)) {
    for (const mime of mimes) {
      if (url.startsWith(`data:${mime}`)) return true;
    }
    return false;
  }
  return url.startsWith(`data:${mimes}`);
}

// node_modules/pixi.js/lib/assets/utils/checkExtension.mjs
function checkExtension(url, extension) {
  const tempURL = url.split("?")[0];
  const ext = path.extname(tempURL).toLowerCase();
  if (Array.isArray(extension)) {
    return extension.includes(ext);
  }
  return ext === extension;
}

// node_modules/pixi.js/lib/assets/loader/parsers/loadJson.mjs
var validJSONExtension = ".json";
var validJSONMIME = "application/json";
var loadJson = {
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.Low
  },
  /** used for deprecation purposes */
  name: "loadJson",
  id: "json",
  test(url) {
    return checkDataUrl(url, validJSONMIME) || checkExtension(url, validJSONExtension);
  },
  async load(url) {
    const response = await DOMAdapter.get().fetch(url);
    const json = await response.json();
    return json;
  }
};

// node_modules/pixi.js/lib/assets/loader/parsers/loadTxt.mjs
var validTXTExtension = ".txt";
var validTXTMIME = "text/plain";
var loadTxt = {
  /** used for deprecation purposes */
  name: "loadTxt",
  id: "text",
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.Low,
    name: "loadTxt"
  },
  test(url) {
    return checkDataUrl(url, validTXTMIME) || checkExtension(url, validTXTExtension);
  },
  async load(url) {
    const response = await DOMAdapter.get().fetch(url);
    const txt = await response.text();
    return txt;
  }
};

// node_modules/pixi.js/lib/assets/loader/parsers/loadWebFont.mjs
var validWeights = [
  "normal",
  "bold",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900"
];
var validFontExtensions = [".ttf", ".otf", ".woff", ".woff2"];
var validFontMIMEs = [
  "font/ttf",
  "font/otf",
  "font/woff",
  "font/woff2"
];
var CSS_IDENT_TOKEN_REGEX = /^(--|-?[A-Z_])[0-9A-Z_-]*$/i;
function getFontFamilyName(url) {
  const ext = path.extname(url);
  const name = path.basename(url, ext);
  const nameWithSpaces = name.replace(/(-|_)/g, " ");
  const nameTokens = nameWithSpaces.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  let valid = nameTokens.length > 0;
  for (const token of nameTokens) {
    if (!token.match(CSS_IDENT_TOKEN_REGEX)) {
      valid = false;
      break;
    }
  }
  let fontFamilyName = nameTokens.join(" ");
  if (!valid) {
    fontFamilyName = `"${fontFamilyName.replace(/[\\"]/g, "\\$&")}"`;
  }
  return fontFamilyName;
}
var validURICharactersRegex = /^[0-9A-Za-z%:/?#\[\]@!\$&'()\*\+,;=\-._~]*$/;
function encodeURIWhenNeeded(uri) {
  if (validURICharactersRegex.test(uri)) {
    return uri;
  }
  return encodeURI(uri);
}
var loadWebFont = {
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.Low
  },
  /** used for deprecation purposes */
  name: "loadWebFont",
  id: "web-font",
  test(url) {
    return checkDataUrl(url, validFontMIMEs) || checkExtension(url, validFontExtensions);
  },
  async load(url, options) {
    const fonts = DOMAdapter.get().getFontFaceSet();
    if (fonts) {
      const fontFaces = [];
      const name = options.data?.family ?? getFontFamilyName(url);
      const weights = options.data?.weights?.filter((weight) => validWeights.includes(weight)) ?? ["normal"];
      const data = options.data ?? {};
      for (let i = 0; i < weights.length; i++) {
        const weight = weights[i];
        const font = new FontFace(name, `url('${encodeURIWhenNeeded(url)}')`, __spreadProps(__spreadValues({}, data), {
          weight
        }));
        await font.load();
        fonts.add(font);
        fontFaces.push(font);
      }
      if (Cache.has(`${name}-and-url`)) {
        const cached = Cache.get(`${name}-and-url`);
        cached.entries.push({ url, faces: fontFaces });
      } else {
        Cache.set(`${name}-and-url`, {
          entries: [{ url, faces: fontFaces }]
        });
      }
      return fontFaces.length === 1 ? fontFaces[0] : fontFaces;
    }
    warn("[loadWebFont] FontFace API is not supported. Skipping loading font");
    return null;
  },
  unload(font) {
    const fonts = Array.isArray(font) ? font : [font];
    const fontFamily = fonts[0].family;
    const cached = Cache.get(`${fontFamily}-and-url`);
    const entry = cached.entries.find((f) => f.faces.some((t) => fonts.indexOf(t) !== -1));
    entry.faces = entry.faces.filter((f) => fonts.indexOf(f) === -1);
    if (entry.faces.length === 0) {
      cached.entries = cached.entries.filter((f) => f !== entry);
    }
    fonts.forEach((t) => {
      DOMAdapter.get().getFontFaceSet().delete(t);
    });
    if (cached.entries.length === 0) {
      Cache.remove(`${fontFamily}-and-url`);
    }
  }
};

// node_modules/pixi.js/lib/utils/network/getResolutionOfUrl.mjs
function getResolutionOfUrl(url, defaultValue = 1) {
  const resolution = Resolver.RETINA_PREFIX?.exec(url);
  if (resolution) {
    return parseFloat(resolution[1]);
  }
  return defaultValue;
}

// node_modules/pixi.js/lib/assets/loader/parsers/textures/utils/createTexture.mjs
function createTexture(source, loader, url) {
  source.label = url;
  source._sourceOrigin = url;
  const texture = new Texture({
    source,
    label: url
  });
  const unload = () => {
    delete loader.promiseCache[url];
    if (Cache.has(url)) {
      Cache.remove(url);
    }
  };
  texture.source.once("destroy", () => {
    if (loader.promiseCache[url]) {
      warn("[Assets] A TextureSource managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the TextureSource.");
      unload();
    }
  });
  texture.once("destroy", () => {
    if (!source.destroyed) {
      warn("[Assets] A Texture managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the Texture.");
      unload();
    }
  });
  return texture;
}

// node_modules/pixi.js/lib/assets/loader/parsers/textures/loadSVG.mjs
var validSVGExtension = ".svg";
var validSVGMIME = "image/svg+xml";
var loadSvg = {
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.Low,
    name: "loadSVG"
  },
  /** used for deprecation purposes */
  name: "loadSVG",
  id: "svg",
  config: {
    crossOrigin: "anonymous",
    parseAsGraphicsContext: false
  },
  test(url) {
    return checkDataUrl(url, validSVGMIME) || checkExtension(url, validSVGExtension);
  },
  async load(url, asset, loader) {
    if (asset.data?.parseAsGraphicsContext ?? this.config.parseAsGraphicsContext) {
      return loadAsGraphics(url);
    }
    return loadAsTexture(url, asset, loader, this.config.crossOrigin);
  },
  unload(asset) {
    asset.destroy(true);
  }
};
async function loadAsTexture(url, asset, loader, crossOrigin2) {
  const response = await DOMAdapter.get().fetch(url);
  const image = DOMAdapter.get().createImage();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await response.text())}`;
  image.crossOrigin = crossOrigin2;
  await image.decode();
  const width = asset.data?.width ?? image.width;
  const height = asset.data?.height ?? image.height;
  const resolution = asset.data?.resolution || getResolutionOfUrl(url);
  const canvasWidth = Math.ceil(width * resolution);
  const canvasHeight = Math.ceil(height * resolution);
  const canvas = DOMAdapter.get().createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width * resolution, height * resolution);
  const _a = asset.data ?? {}, { parseAsGraphicsContext: _p } = _a, rest = __objRest(_a, ["parseAsGraphicsContext"]);
  const base = new ImageSource(__spreadValues({
    resource: canvas,
    alphaMode: "premultiply-alpha-on-upload",
    resolution
  }, rest));
  return createTexture(base, loader, url);
}
async function loadAsGraphics(url) {
  const response = await DOMAdapter.get().fetch(url);
  const svgSource = await response.text();
  const context = new GraphicsContext();
  context.svg(svgSource);
  return context;
}

// node_modules/pixi.js/lib/_virtual/checkImageBitmap.worker.mjs
var WORKER_CODE = `(function () {
    'use strict';

    const WHITE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
    async function checkImageBitmap() {
      try {
        if (typeof createImageBitmap !== "function") return false;
        const response = await fetch(WHITE_PNG);
        const imageBlob = await response.blob();
        const imageBitmap = await createImageBitmap(imageBlob);
        return imageBitmap.width === 1 && imageBitmap.height === 1;
      } catch (_e) {
        return false;
      }
    }
    void checkImageBitmap().then((result) => {
      self.postMessage(result);
    });

})();
`;
var WORKER_URL = null;
var WorkerInstance = class {
  constructor() {
    if (!WORKER_URL) {
      WORKER_URL = URL.createObjectURL(new Blob([WORKER_CODE], { type: "application/javascript" }));
    }
    this.worker = new Worker(WORKER_URL);
  }
};
WorkerInstance.revokeObjectURL = function revokeObjectURL() {
  if (WORKER_URL) {
    URL.revokeObjectURL(WORKER_URL);
    WORKER_URL = null;
  }
};

// node_modules/pixi.js/lib/_virtual/loadImageBitmap.worker.mjs
var WORKER_CODE2 = '(function () {\n    \'use strict\';\n\n    async function loadImageBitmap(url, alphaMode) {\n      const response = await fetch(url);\n      if (!response.ok) {\n        throw new Error(`[WorkerManager.loadImageBitmap] Failed to fetch ${url}: ${response.status} ${response.statusText}`);\n      }\n      const imageBlob = await response.blob();\n      return alphaMode === "premultiplied-alpha" ? createImageBitmap(imageBlob, { premultiplyAlpha: "none" }) : createImageBitmap(imageBlob);\n    }\n    self.onmessage = async (event) => {\n      try {\n        const imageBitmap = await loadImageBitmap(event.data.data[0], event.data.data[1]);\n        self.postMessage({\n          data: imageBitmap,\n          uuid: event.data.uuid,\n          id: event.data.id\n        }, [imageBitmap]);\n      } catch (e) {\n        self.postMessage({\n          error: e,\n          uuid: event.data.uuid,\n          id: event.data.id\n        });\n      }\n    };\n\n})();\n';
var WORKER_URL2 = null;
var WorkerInstance2 = class {
  constructor() {
    if (!WORKER_URL2) {
      WORKER_URL2 = URL.createObjectURL(new Blob([WORKER_CODE2], { type: "application/javascript" }));
    }
    this.worker = new Worker(WORKER_URL2);
  }
};
WorkerInstance2.revokeObjectURL = function revokeObjectURL2() {
  if (WORKER_URL2) {
    URL.revokeObjectURL(WORKER_URL2);
    WORKER_URL2 = null;
  }
};

// node_modules/pixi.js/lib/assets/loader/workers/WorkerManager.mjs
var UUID = 0;
var MAX_WORKERS;
var WorkerManagerClass = class {
  constructor() {
    this._initialized = false;
    this._createdWorkers = 0;
    this._workerPool = [];
    this._queue = [];
    this._resolveHash = {};
  }
  /**
   * Checks if ImageBitmap is supported in the current environment.
   *
   * This method uses a dedicated worker to test ImageBitmap support
   * and caches the result for subsequent calls.
   * @returns Promise that resolves to true if ImageBitmap is supported, false otherwise
   */
  isImageBitmapSupported() {
    if (this._isImageBitmapSupported !== void 0) return this._isImageBitmapSupported;
    this._isImageBitmapSupported = new Promise((resolve) => {
      const { worker } = new WorkerInstance();
      worker.addEventListener("message", (event) => {
        worker.terminate();
        WorkerInstance.revokeObjectURL();
        resolve(event.data);
      });
    });
    return this._isImageBitmapSupported;
  }
  /**
   * Loads an image as an ImageBitmap using a web worker.
   * @param src - The source URL or path of the image to load
   * @param asset - Optional resolved asset containing additional texture source options
   * @returns Promise that resolves to the loaded ImageBitmap
   * @example
   * ```typescript
   * const bitmap = await WorkerManager.loadImageBitmap('image.png');
   * const bitmapWithOptions = await WorkerManager.loadImageBitmap('image.png', asset);
   * ```
   */
  loadImageBitmap(src, asset) {
    return this._run("loadImageBitmap", [src, asset?.data?.alphaMode]);
  }
  /**
   * Initializes the worker pool if not already initialized.
   * Currently a no-op but reserved for future initialization logic.
   */
  async _initWorkers() {
    if (this._initialized) return;
    this._initialized = true;
  }
  /**
   * Gets an available worker from the pool or creates a new one if needed.
   *
   * Workers are created up to the MAX_WORKERS limit (based on navigator.hardwareConcurrency).
   * Each worker is configured with a message handler for processing results.
   * @returns Available worker or undefined if pool is at capacity and no workers are free
   */
  _getWorker() {
    if (MAX_WORKERS === void 0) {
      MAX_WORKERS = navigator.hardwareConcurrency || 4;
    }
    let worker = this._workerPool.pop();
    if (!worker && this._createdWorkers < MAX_WORKERS) {
      this._createdWorkers++;
      worker = new WorkerInstance2().worker;
      worker.addEventListener("message", (event) => {
        this._complete(event.data);
        this._returnWorker(event.target);
        this._next();
      });
    }
    return worker;
  }
  /**
   * Returns a worker to the pool after completing a task.
   * @param worker - The worker to return to the pool
   */
  _returnWorker(worker) {
    this._workerPool.push(worker);
  }
  /**
   * Handles completion of a worker task by resolving or rejecting the corresponding promise.
   * @param data - Result data from the worker containing uuid, data, and optional error
   */
  _complete(data) {
    if (!this._resolveHash[data.uuid]) {
      return;
    }
    if (data.error !== void 0) {
      this._resolveHash[data.uuid].reject(data.error);
    } else {
      this._resolveHash[data.uuid].resolve(data.data);
    }
    delete this._resolveHash[data.uuid];
  }
  /**
   * Executes a task using the worker pool system.
   *
   * Queues the task and processes it when a worker becomes available.
   * @param id - Identifier for the type of task to run
   * @param args - Arguments to pass to the worker
   * @returns Promise that resolves with the worker's result
   */
  async _run(id, args) {
    await this._initWorkers();
    const promise = new Promise((resolve, reject) => {
      this._queue.push({ id, arguments: args, resolve, reject });
    });
    this._next();
    return promise;
  }
  /**
   * Processes the next item in the queue if workers are available.
   *
   * This method is called after worker initialization and when workers
   * complete tasks to continue processing the queue.
   */
  _next() {
    if (!this._queue.length) return;
    const worker = this._getWorker();
    if (!worker) {
      return;
    }
    const toDo = this._queue.pop();
    const id = toDo.id;
    this._resolveHash[UUID] = { resolve: toDo.resolve, reject: toDo.reject };
    worker.postMessage({
      data: toDo.arguments,
      uuid: UUID++,
      id
    });
  }
  /**
   * Resets the worker manager, terminating all workers and clearing the queue.
   *
   * This method:
   * - Terminates all active workers
   * - Rejects all pending promises with an error
   * - Clears all internal state
   * - Resets initialization flags
   *
   * This should be called when the worker manager is no longer needed
   * to prevent memory leaks and ensure proper cleanup.
   * @example
   * ```typescript
   * // Clean up when shutting down
   * WorkerManager.reset();
   * ```
   */
  reset() {
    this._workerPool.forEach((worker) => worker.terminate());
    this._workerPool.length = 0;
    Object.values(this._resolveHash).forEach(({ reject }) => {
      reject?.(new Error("WorkerManager has been reset before completion"));
    });
    this._resolveHash = {};
    this._queue.length = 0;
    this._initialized = false;
    this._createdWorkers = 0;
  }
};
var WorkerManager = new WorkerManagerClass();

// node_modules/pixi.js/lib/assets/loader/parsers/textures/loadTextures.mjs
var validImageExtensions = [".jpeg", ".jpg", ".png", ".webp", ".avif"];
var validImageMIMEs = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
];
async function loadImageBitmap(url, asset) {
  const response = await DOMAdapter.get().fetch(url);
  if (!response.ok) {
    throw new Error(`[loadImageBitmap] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const imageBlob = await response.blob();
  return asset?.data?.alphaMode === "premultiplied-alpha" ? createImageBitmap(imageBlob, { premultiplyAlpha: "none" }) : createImageBitmap(imageBlob);
}
var loadTextures = {
  /** used for deprecation purposes */
  name: "loadTextures",
  id: "texture",
  extension: {
    type: ExtensionType.LoadParser,
    priority: LoaderParserPriority.High,
    name: "loadTextures"
  },
  config: {
    preferWorkers: true,
    preferCreateImageBitmap: true,
    crossOrigin: "anonymous"
  },
  test(url) {
    return checkDataUrl(url, validImageMIMEs) || checkExtension(url, validImageExtensions);
  },
  async load(url, asset, loader) {
    let src = null;
    if (globalThis.createImageBitmap && this.config.preferCreateImageBitmap) {
      if (this.config.preferWorkers && await WorkerManager.isImageBitmapSupported()) {
        src = await WorkerManager.loadImageBitmap(url, asset);
      } else {
        src = await loadImageBitmap(url, asset);
      }
    } else {
      src = await new Promise((resolve, reject) => {
        src = DOMAdapter.get().createImage();
        src.crossOrigin = this.config.crossOrigin;
        src.src = url;
        if (src.complete) {
          resolve(src);
        } else {
          src.onload = () => {
            resolve(src);
          };
          src.onerror = reject;
        }
      });
    }
    const base = new ImageSource(__spreadValues({
      resource: src,
      alphaMode: "premultiply-alpha-on-upload",
      resolution: asset.data?.resolution || getResolutionOfUrl(url)
    }, asset.data));
    return createTexture(base, loader, url);
  },
  unload(texture) {
    texture.destroy(true);
  }
};

// node_modules/pixi.js/lib/assets/loader/parsers/textures/loadVideoTextures.mjs
var potentialVideoExtensions = [".mp4", ".m4v", ".webm", ".ogg", ".ogv", ".h264", ".avi", ".mov"];
var validVideoExtensions;
var validVideoMIMEs;
function crossOrigin(element, url, crossorigin) {
  if (crossorigin === void 0 && !url.startsWith("data:")) {
    element.crossOrigin = determineCrossOrigin(url);
  } else if (crossorigin !== false) {
    element.crossOrigin = typeof crossorigin === "string" ? crossorigin : "anonymous";
  }
}
function preloadVideo(element) {
  return new Promise((resolve, reject) => {
    element.addEventListener("canplaythrough", loaded);
    element.addEventListener("error", error);
    element.load();
    function loaded() {
      cleanup();
      resolve();
    }
    function error(err) {
      cleanup();
      reject(err);
    }
    function cleanup() {
      element.removeEventListener("canplaythrough", loaded);
      element.removeEventListener("error", error);
    }
  });
}
function determineCrossOrigin(url, loc = globalThis.location) {
  if (url.startsWith("data:")) {
    return "";
  }
  loc || (loc = globalThis.location);
  const parsedUrl = new URL(url, document.baseURI);
  if (parsedUrl.hostname !== loc.hostname || parsedUrl.port !== loc.port || parsedUrl.protocol !== loc.protocol) {
    return "anonymous";
  }
  return "";
}
function getBrowserSupportedVideoExtensions() {
  const supportedExtensions = [];
  const supportedMimes = [];
  for (const ext of potentialVideoExtensions) {
    const mimeType = VideoSource.MIME_TYPES[ext.substring(1)] || `video/${ext.substring(1)}`;
    if (testVideoFormat(mimeType)) {
      supportedExtensions.push(ext);
      if (!supportedMimes.includes(mimeType)) {
        supportedMimes.push(mimeType);
      }
    }
  }
  return {
    validVideoExtensions: supportedExtensions,
    validVideoMime: supportedMimes
  };
}
var loadVideoTextures = {
  /** used for deprecation purposes */
  name: "loadVideo",
  id: "video",
  extension: {
    type: ExtensionType.LoadParser,
    name: "loadVideo"
  },
  test(url) {
    if (!validVideoExtensions || !validVideoMIMEs) {
      const { validVideoExtensions: ve, validVideoMime: vm } = getBrowserSupportedVideoExtensions();
      validVideoExtensions = ve;
      validVideoMIMEs = vm;
    }
    const isValidDataUrl = checkDataUrl(url, validVideoMIMEs);
    const isValidExtension = checkExtension(url, validVideoExtensions);
    return isValidDataUrl || isValidExtension;
  },
  async load(url, asset, loader) {
    const options = __spreadValues(__spreadProps(__spreadValues({}, VideoSource.defaultOptions), {
      resolution: asset.data?.resolution || getResolutionOfUrl(url),
      alphaMode: asset.data?.alphaMode || await detectVideoAlphaMode()
    }), asset.data);
    const videoElement = document.createElement("video");
    const attributeMap = {
      preload: options.autoLoad !== false ? "auto" : void 0,
      "webkit-playsinline": options.playsinline !== false ? "" : void 0,
      playsinline: options.playsinline !== false ? "" : void 0,
      muted: options.muted === true ? "" : void 0,
      loop: options.loop === true ? "" : void 0,
      autoplay: options.autoPlay !== false ? "" : void 0
    };
    Object.keys(attributeMap).forEach((key) => {
      const value = attributeMap[key];
      if (value !== void 0) videoElement.setAttribute(key, value);
    });
    if (options.muted === true) {
      videoElement.muted = true;
    }
    crossOrigin(videoElement, url, options.crossorigin);
    const sourceElement = document.createElement("source");
    let mime;
    if (options.mime) {
      mime = options.mime;
    } else if (url.startsWith("data:")) {
      mime = url.slice(5, url.indexOf(";"));
    } else if (!url.startsWith("blob:")) {
      const ext = url.split("?")[0].slice(url.lastIndexOf(".") + 1).toLowerCase();
      mime = VideoSource.MIME_TYPES[ext] || `video/${ext}`;
    }
    sourceElement.src = url;
    if (mime) {
      sourceElement.type = mime;
    }
    return new Promise((resolve, reject) => {
      if (options.preload && !options.autoPlay) {
        videoElement.load();
      }
      videoElement.addEventListener("canplay", onCanPlay);
      videoElement.addEventListener("error", onError);
      sourceElement.addEventListener("error", onError);
      videoElement.appendChild(sourceElement);
      async function onCanPlay() {
        const base = new VideoSource(__spreadProps(__spreadValues({}, options), { resource: videoElement }));
        cleanup();
        if (asset.data.preload) {
          await preloadVideo(videoElement);
        }
        resolve(createTexture(base, loader, url));
      }
      function onError(event) {
        cleanup();
        reject(event);
      }
      function cleanup() {
        videoElement.removeEventListener("canplay", onCanPlay);
        videoElement.removeEventListener("error", onError);
        sourceElement.removeEventListener("error", onError);
      }
    });
  },
  unload(texture) {
    texture.destroy(true);
  }
};

// node_modules/pixi.js/lib/assets/resolver/parsers/resolveTextureUrl.mjs
var resolveTextureUrl = {
  extension: {
    type: ExtensionType.ResolveParser,
    name: "resolveTexture"
  },
  test: loadTextures.test,
  parse: (value) => ({
    resolution: parseFloat(Resolver.RETINA_PREFIX.exec(value)?.[1] ?? "1"),
    format: value.split(".").pop(),
    src: value
  })
};

// node_modules/pixi.js/lib/assets/resolver/parsers/resolveJsonUrl.mjs
var resolveJsonUrl = {
  extension: {
    type: ExtensionType.ResolveParser,
    priority: -2,
    name: "resolveJson"
  },
  test: (value) => Resolver.RETINA_PREFIX.test(value) && value.endsWith(".json"),
  parse: resolveTextureUrl.parse
};

// node_modules/pixi.js/lib/assets/Assets.mjs
var AssetsClass = class {
  constructor() {
    this._detections = [];
    this._initialized = false;
    this.resolver = new Resolver();
    this.loader = new Loader();
    this.cache = Cache;
    this._backgroundLoader = new BackgroundLoader(this.loader);
    this._backgroundLoader.active = true;
    this.reset();
  }
  /**
   * Initializes the Assets class with configuration options. While not required,
   * calling this before loading assets is recommended to set up default behaviors.
   * @param options - Configuration options for the Assets system
   * @example
   * ```ts
   * // Basic initialization (optional as Assets.load will call this automatically)
   * await Assets.init();
   *
   * // With CDN configuration
   * await Assets.init({
   *     basePath: 'https://my-cdn.com/assets/',
   *     defaultSearchParams: { version: '1.0.0' }
   * });
   *
   * // With manifest and preferences
   * await Assets.init({
   *     manifest: {
   *         bundles: [{
   *             name: 'game-screen',
   *             assets: [
   *                 {
   *                     alias: 'hero',
   *                     src: 'hero.{png,webp}',
   *                     data: { scaleMode: SCALE_MODES.NEAREST }
   *                 },
   *                 {
   *                     alias: 'map',
   *                     src: 'map.json'
   *                 }
   *             ]
   *         }]
   *     },
   *     // Optimize for device capabilities
   *     texturePreference: {
   *         resolution: window.devicePixelRatio,
   *         format: ['webp', 'png']
   *     },
   *     // Set global preferences
   *     preferences: {
   *         crossOrigin: 'anonymous',
   *     }
   * });
   *
   * // Load assets after initialization
   * const heroTexture = await Assets.load('hero');
   * ```
   * @remarks
   * - Can be called only once; subsequent calls will be ignored with a warning
   * - Format detection runs automatically unless `skipDetections` is true
   * - The manifest can be a URL to a JSON file or an inline object
   * @see {@link AssetInitOptions} For all available initialization options
   * @see {@link AssetsManifest} For manifest format details
   */
  async init(options = {}) {
    if (this._initialized) {
      warn("[Assets]AssetManager already initialized, did you load before calling this Assets.init()?");
      return;
    }
    this._initialized = true;
    if (options.defaultSearchParams) {
      this.resolver.setDefaultSearchParams(options.defaultSearchParams);
    }
    if (options.basePath) {
      this.resolver.basePath = options.basePath;
    }
    if (options.bundleIdentifier) {
      this.resolver.setBundleIdentifier(options.bundleIdentifier);
    }
    if (options.manifest) {
      let manifest = options.manifest;
      if (typeof manifest === "string") {
        manifest = await this.load(manifest);
      }
      this.resolver.addManifest(manifest);
    }
    const resolutionPref = options.texturePreference?.resolution ?? 1;
    const resolution = typeof resolutionPref === "number" ? [resolutionPref] : resolutionPref;
    const formats = await this._detectFormats({
      preferredFormats: options.texturePreference?.format,
      skipDetections: options.skipDetections,
      detections: this._detections
    });
    this.resolver.prefer({
      params: {
        format: formats,
        resolution
      }
    });
    if (options.preferences) {
      this.setPreferences(options.preferences);
    }
    if (options.loadOptions) {
      this.loader.loadOptions = __spreadValues(__spreadValues({}, this.loader.loadOptions), options.loadOptions);
    }
  }
  /**
   * Registers assets with the Assets resolver. This method maps keys (aliases) to asset sources,
   * allowing you to load assets using friendly names instead of direct URLs.
   * @param assets - The unresolved assets to add to the resolver
   * @example
   * ```ts
   * // Basic usage - single asset
   * Assets.add({
   *     alias: 'myTexture',
   *     src: 'assets/texture.png'
   * });
   * const texture = await Assets.load('myTexture');
   *
   * // Multiple aliases for the same asset
   * Assets.add({
   *     alias: ['hero', 'player'],
   *     src: 'hero.png'
   * });
   * const hero1 = await Assets.load('hero');
   * const hero2 = await Assets.load('player'); // Same texture
   *
   * // Multiple format support
   * Assets.add({
   *     alias: 'character',
   *     src: 'character.{webp,png}' // Will choose best format
   * });
   * Assets.add({
   *     alias: 'character',
   *     src: ['character.webp', 'character.png'], // Explicitly specify formats
   * });
   *
   * // With texture options
   * Assets.add({
   *     alias: 'sprite',
   *     src: 'sprite.png',
   *     data: { scaleMode: 'nearest' }
   * });
   *
   * // Multiple assets at once
   * Assets.add([
   *     { alias: 'bg', src: 'background.png' },
   *     { alias: 'music', src: 'music.mp3' },
   *     { alias: 'spritesheet', src: 'sheet.json', data: { ignoreMultiPack: false } }
   * ]);
   * ```
   * @remarks
   * - Assets are resolved when loaded, not when added
   * - Multiple formats use the best available format for the browser
   * - Adding with same alias overwrites previous definition
   * - The `data` property is passed to the asset loader
   * @see {@link Resolver} For details on asset resolution
   * @see {@link LoaderParser} For asset-specific data options
   * @advanced
   */
  add(assets) {
    this.resolver.add(assets);
  }
  async load(urls, onProgress) {
    if (!this._initialized) {
      await this.init();
    }
    const singleAsset = isSingleItem(urls);
    const urlArray = convertToList(urls).map((url) => {
      if (typeof url !== "string") {
        const aliases = this.resolver.getAlias(url);
        if (aliases.some((alias) => !this.resolver.hasKey(alias))) {
          this.add(url);
        }
        return Array.isArray(aliases) ? aliases[0] : aliases;
      }
      if (!this.resolver.hasKey(url)) this.add({ alias: url, src: url });
      return url;
    });
    const resolveResults = this.resolver.resolve(urlArray);
    const out = await this._mapLoadToResolve(resolveResults, onProgress);
    return singleAsset ? out[urlArray[0]] : out;
  }
  /**
   * Registers a bundle of assets that can be loaded as a group. Bundles are useful for organizing
   * assets into logical groups, such as game levels or UI screens.
   * @param bundleId - Unique identifier for the bundle
   * @param assets - Assets to include in the bundle
   * @example
   * ```ts
   * // Add a bundle using array format
   * Assets.addBundle('animals', [
   *     { alias: 'bunny', src: 'bunny.png' },
   *     { alias: 'chicken', src: 'chicken.png' },
   *     { alias: 'thumper', src: 'thumper.png' },
   * ]);
   *
   * // Add a bundle using object format
   * Assets.addBundle('animals', {
   *     bunny: 'bunny.png',
   *     chicken: 'chicken.png',
   *     thumper: 'thumper.png',
   * });
   *
   * // Add a bundle with advanced options
   * Assets.addBundle('ui', [
   *     {
   *         alias: 'button',
   *         src: 'button.{webp,png}',
   *         data: { scaleMode: 'nearest' }
   *     },
   *     {
   *         alias: ['logo', 'brand'],  // Multiple aliases
   *         src: 'logo.svg',
   *         data: { resolution: 2 }
   *     }
   * ]);
   *
   * // Load the bundle
   * await Assets.loadBundle('animals');
   *
   * // Use the loaded assets
   * const bunny = Sprite.from('bunny');
   * const chicken = Sprite.from('chicken');
   * ```
   * @remarks
   * - Bundle IDs must be unique
   * - Assets in bundles are not loaded until `loadBundle` is called
   * - Bundles can be background loaded using `backgroundLoadBundle`
   * - Assets in bundles can be loaded individually using their aliases
   * @see {@link Assets.loadBundle} For loading bundles
   * @see {@link Assets.backgroundLoadBundle} For background loading bundles
   * @see {@link Assets.unloadBundle} For unloading bundles
   * @see {@link AssetsManifest} For manifest format details
   */
  addBundle(bundleId, assets) {
    this.resolver.addBundle(bundleId, assets);
  }
  /**
   * Loads a bundle or multiple bundles of assets. Bundles are collections of related assets
   * that can be loaded together.
   * @param bundleIds - Single bundle ID or array of bundle IDs to load
   * @param onProgress - Optional callback for load progress (0.0 to 1.0)
   * @returns Promise that resolves with the loaded bundle assets
   * @example
   * ```ts
   * // Define bundles in your manifest
   * const manifest = {
   *     bundles: [
   *         {
   *             name: 'load-screen',
   *             assets: [
   *                 {
   *                     alias: 'background',
   *                     src: 'sunset.png',
   *                 },
   *                 {
   *                     alias: 'bar',
   *                     src: 'load-bar.{png,webp}', // use an array of individual assets
   *                 },
   *             ],
   *         },
   *         {
   *             name: 'game-screen',
   *             assets: [
   *                 {
   *                     alias: 'character',
   *                     src: 'robot.png',
   *                 },
   *                 {
   *                     alias: 'enemy',
   *                     src: 'bad-guy.png',
   *                 },
   *             ],
   *         },
   *     ]
   * };
   *
   * // Initialize with manifest
   * await Assets.init({ manifest });
   *
   * // Or add bundles programmatically
   * Assets.addBundle('load-screen', [...]);
   * Assets.loadBundle('load-screen');
   *
   * // Load a single bundle
   * await Assets.loadBundle('load-screen');
   * const bg = Sprite.from('background'); // Uses alias from bundle
   *
   * // Load multiple bundles
   * await Assets.loadBundle([
   *     'load-screen',
   *     'game-screen'
   * ]);
   *
   * // Load with progress tracking
   * await Assets.loadBundle('game-screen', (progress) => {
   *     console.log(`Loading: ${Math.round(progress * 100)}%`);
   * });
   * ```
   * @remarks
   * - Bundle assets are cached automatically
   * - Bundles can be pre-loaded using `backgroundLoadBundle`
   * - Assets in bundles can be accessed by their aliases
   * - Progress callback receives values from 0.0 to 1.0
   * @throws {Error} If the bundle ID doesn't exist in the manifest
   * @see {@link Assets.addBundle} For adding bundles programmatically
   * @see {@link Assets.backgroundLoadBundle} For background loading bundles
   * @see {@link Assets.unloadBundle} For unloading bundles
   * @see {@link AssetsManifest} For manifest format details
   */
  async loadBundle(bundleIds, onProgress) {
    if (!this._initialized) {
      await this.init();
    }
    let singleAsset = false;
    if (typeof bundleIds === "string") {
      singleAsset = true;
      bundleIds = [bundleIds];
    }
    const resolveResults = this.resolver.resolveBundle(bundleIds);
    const out = {};
    const keys = Object.keys(resolveResults);
    let total = 0;
    const counts = [];
    const _onProgress = () => {
      onProgress?.(counts.reduce((a, b) => a + b, 0) / total);
    };
    const promises = keys.map((bundleId, i) => {
      const resolveResult = resolveResults[bundleId];
      const values = Object.values(resolveResult);
      const totalAssetsToLoad = [...new Set(values.flat())];
      const progressSize = totalAssetsToLoad.reduce((sum, asset) => sum + (asset.progressSize || 1), 0);
      counts.push(0);
      total += progressSize;
      return this._mapLoadToResolve(resolveResult, (e) => {
        counts[i] = e * progressSize;
        _onProgress();
      }).then((resolveResult2) => {
        out[bundleId] = resolveResult2;
      });
    });
    await Promise.all(promises);
    return singleAsset ? out[bundleIds[0]] : out;
  }
  /**
   * Initiates background loading of assets. This allows assets to be loaded passively while other operations
   * continue, making them instantly available when needed later.
   *
   * Background loading is useful for:
   * - Preloading game levels while in a menu
   * - Loading non-critical assets during gameplay
   * - Reducing visible loading screens
   * @param urls - Single URL/alias or array of URLs/aliases to load in the background
   * @example
   * ```ts
   * // Basic background loading
   * Assets.backgroundLoad('images/level2-assets.png');
   *
   * // Background load multiple assets
   * Assets.backgroundLoad([
   *     'images/sprite1.png',
   *     'images/sprite2.png',
   *     'images/background.png'
   * ]);
   *
   * // Later, when you need the assets
   * const textures = await Assets.load([
   *     'images/sprite1.png',
   *     'images/sprite2.png'
   * ]); // Resolves immediately if background loading completed
   * ```
   * @remarks
   * - Background loading happens one asset at a time to avoid blocking the main thread
   * - Loading can be interrupted safely by calling `Assets.load()`
   * - Assets are cached as they complete loading
   * - No progress tracking is available for background loading
   */
  async backgroundLoad(urls) {
    if (!this._initialized) {
      await this.init();
    }
    if (typeof urls === "string") {
      urls = [urls];
    }
    const resolveResults = this.resolver.resolve(urls);
    this._backgroundLoader.add(Object.values(resolveResults));
  }
  /**
   * Initiates background loading of asset bundles. Similar to backgroundLoad but works with
   * predefined bundles of assets.
   *
   * Perfect for:
   * - Preloading level bundles during gameplay
   * - Loading UI assets during splash screens
   * - Preparing assets for upcoming game states
   * @param bundleIds - Single bundle ID or array of bundle IDs to load in the background
   * @example
   * ```ts
   * // Define bundles in your manifest
   * await Assets.init({
   *     manifest: {
   *         bundles: [
   *             {
   *               name: 'home',
   *               assets: [
   *                 {
   *                     alias: 'background',
   *                     src: 'images/home-bg.png',
   *                 },
   *                 {
   *                     alias: 'logo',
   *                     src: 'images/logo.png',
   *                 }
   *              ]
   *            },
   *            {
   *             name: 'level-1',
   *             assets: [
   *                 {
   *                     alias: 'background',
   *                     src: 'images/level1/bg.png',
   *                 },
   *                 {
   *                     alias: 'sprites',
   *                     src: 'images/level1/sprites.json'
   *                 }
   *             ]
   *         }]
   *     }
   * });
   *
   * // Load the home screen assets right away
   * await Assets.loadBundle('home');
   * showHomeScreen();
   *
   * // Start background loading while showing home screen
   * Assets.backgroundLoadBundle('level-1');
   *
   * // When player starts level, load completes faster
   * await Assets.loadBundle('level-1');
   * hideHomeScreen();
   * startLevel();
   * ```
   * @remarks
   * - Bundle assets are loaded one at a time
   * - Loading can be interrupted safely by calling `Assets.loadBundle()`
   * - Assets are cached as they complete loading
   * - Requires bundles to be registered via manifest or `addBundle`
   * @see {@link Assets.addBundle} For adding bundles programmatically
   * @see {@link Assets.loadBundle} For immediate bundle loading
   * @see {@link AssetsManifest} For manifest format details
   */
  async backgroundLoadBundle(bundleIds) {
    if (!this._initialized) {
      await this.init();
    }
    if (typeof bundleIds === "string") {
      bundleIds = [bundleIds];
    }
    const resolveResults = this.resolver.resolveBundle(bundleIds);
    Object.values(resolveResults).forEach((resolveResult) => {
      this._backgroundLoader.add(Object.values(resolveResult));
    });
  }
  /**
   * Only intended for development purposes.
   * This will wipe the resolver and caches.
   * You will need to reinitialize the Asset
   * @internal
   */
  reset() {
    this.resolver.reset();
    this.loader.reset();
    this.cache.reset();
    this._initialized = false;
  }
  get(keys) {
    if (typeof keys === "string") {
      return Cache.get(keys);
    }
    const assets = {};
    for (let i = 0; i < keys.length; i++) {
      assets[i] = Cache.get(keys[i]);
    }
    return assets;
  }
  /**
   * helper function to map resolved assets back to loaded assets
   * @param resolveResults - the resolve results from the resolver
   * @param progressOrLoadOptions - the progress callback or load options
   */
  async _mapLoadToResolve(resolveResults, progressOrLoadOptions) {
    const resolveArray = [...new Set(Object.values(resolveResults))];
    this._backgroundLoader.active = false;
    const loadedAssets = await this.loader.load(resolveArray, progressOrLoadOptions);
    this._backgroundLoader.active = true;
    const out = {};
    resolveArray.forEach((resolveResult) => {
      const asset = loadedAssets[resolveResult.src];
      const keys = [resolveResult.src];
      if (resolveResult.alias) {
        keys.push(...resolveResult.alias);
      }
      keys.forEach((key) => {
        out[key] = asset;
      });
      Cache.set(keys, asset);
    });
    return out;
  }
  /**
   * Unloads assets and releases them from memory. This method ensures proper cleanup of
   * loaded assets when they're no longer needed.
   * @param urls - Single URL/alias or array of URLs/aliases to unload
   * @example
   * ```ts
   * // Unload a single asset
   * await Assets.unload('images/sprite.png');
   *
   * // Unload using an alias
   * await Assets.unload('hero'); // Unloads the asset registered with 'hero' alias
   *
   * // Unload multiple assets
   * await Assets.unload([
   *     'images/background.png',
   *     'images/character.png',
   *     'hero'
   * ]);
   *
   * // Unload and handle creation of new instances
   * await Assets.unload('hero');
   * const newHero = await Assets.load('hero'); // Will load fresh from source
   * ```
   * @remarks
   * > [!WARNING]
   * > Make sure assets aren't being used before unloading:
   * > - Remove sprites using the texture
   * > - Clear any references to the asset
   * > - Textures will be destroyed and can't be used after unloading
   * @throws {Error} If the asset is not found in cache
   */
  async unload(urls) {
    if (!this._initialized) {
      await this.init();
    }
    const urlArray = convertToList(urls).map((url) => typeof url !== "string" ? url.src : url);
    const resolveResults = this.resolver.resolve(urlArray);
    await this._unloadFromResolved(resolveResults);
  }
  /**
   * Unloads all assets in a bundle. Use this to free memory when a bundle's assets
   * are no longer needed, such as when switching game levels.
   * @param bundleIds - Single bundle ID or array of bundle IDs to unload
   * @example
   * ```ts
   * // Define and load a bundle
   * Assets.addBundle('level-1', {
   *     background: 'level1/bg.png',
   *     sprites: 'level1/sprites.json',
   *     music: 'level1/music.mp3'
   * });
   *
   * // Load the bundle
   * const level1 = await Assets.loadBundle('level-1');
   *
   * // Use the assets
   * const background = Sprite.from(level1.background);
   *
   * // When done with the level, unload everything
   * await Assets.unloadBundle('level-1');
   * // background sprite is now invalid!
   *
   * // Unload multiple bundles
   * await Assets.unloadBundle([
   *     'level-1',
   *     'level-2',
   *     'ui-elements'
   * ]);
   * ```
   * @remarks
   * > [!WARNING]
   * > - All assets in the bundle will be destroyed
   * > - Bundle needs to be reloaded to use assets again
   * > - Make sure no sprites or other objects are using the assets
   * @throws {Error} If the bundle is not found
   * @see {@link Assets.addBundle} For adding bundles
   * @see {@link Assets.loadBundle} For loading bundles
   */
  async unloadBundle(bundleIds) {
    if (!this._initialized) {
      await this.init();
    }
    bundleIds = convertToList(bundleIds);
    const resolveResults = this.resolver.resolveBundle(bundleIds);
    const promises = Object.keys(resolveResults).map((bundleId) => this._unloadFromResolved(resolveResults[bundleId]));
    await Promise.all(promises);
  }
  async _unloadFromResolved(resolveResult) {
    const resolveArray = Object.values(resolveResult);
    resolveArray.forEach((resolveResult2) => {
      Cache.remove(resolveResult2.src);
    });
    await this.loader.unload(resolveArray);
  }
  /**
   * Detects the supported formats for the browser, and returns an array of supported formats, respecting
   * the users preferred formats order.
   * @param options - the options to use when detecting formats
   * @param options.preferredFormats - the preferred formats to use
   * @param options.skipDetections - if we should skip the detections altogether
   * @param options.detections - the detections to use
   * @returns - the detected formats
   */
  async _detectFormats(options) {
    let formats = [];
    if (options.preferredFormats) {
      formats = Array.isArray(options.preferredFormats) ? options.preferredFormats : [options.preferredFormats];
    }
    for (const detection of options.detections) {
      if (options.skipDetections || await detection.test()) {
        formats = await detection.add(formats);
      } else if (!options.skipDetections) {
        formats = await detection.remove(formats);
      }
    }
    formats = formats.filter((format, index) => formats.indexOf(format) === index);
    return formats;
  }
  /**
   * All the detection parsers currently added to the Assets class.
   * @advanced
   */
  get detections() {
    return this._detections;
  }
  /**
   * Sets global preferences for asset loading behavior. This method configures how assets
   * are loaded and processed across all parsers.
   * @param preferences - Asset loading preferences
   * @example
   * ```ts
   * // Basic preferences
   * Assets.setPreferences({
   *     crossOrigin: 'anonymous',
   *     parseAsGraphicsContext: false
   * });
   * ```
   * @remarks
   * Preferences are applied to all compatible parsers and affect future asset loading.
   * Common preferences include:
   * - `crossOrigin`: CORS setting for loaded assets
   * - `preferWorkers`: Whether to use web workers for loading textures
   * - `preferCreateImageBitmap`: Use `createImageBitmap` for texture creation. Turning this off will use the `Image` constructor instead.
   * @see {@link AssetsPreferences} For all available preferences
   */
  setPreferences(preferences) {
    this.loader.parsers.forEach((parser) => {
      if (!parser.config) return;
      Object.keys(parser.config).filter((key) => key in preferences).forEach((key) => {
        parser.config[key] = preferences[key];
      });
    });
  }
};
var Assets = new AssetsClass();
extensions.handleByList(ExtensionType.LoadParser, Assets.loader.parsers).handleByList(ExtensionType.ResolveParser, Assets.resolver.parsers).handleByList(ExtensionType.CacheParser, Assets.cache.parsers).handleByList(ExtensionType.DetectionParser, Assets.detections);
extensions.add(
  cacheTextureArray,
  detectDefaults,
  detectAvif,
  detectWebp,
  detectMp4,
  detectOgv,
  detectWebm,
  loadJson,
  loadTxt,
  loadWebFont,
  loadSvg,
  loadTextures,
  loadVideoTextures,
  loadBitmapFont,
  bitmapFontCachePlugin,
  resolveTextureUrl,
  resolveJsonUrl
);
var assetKeyMap = {
  loader: ExtensionType.LoadParser,
  resolver: ExtensionType.ResolveParser,
  cache: ExtensionType.CacheParser,
  detection: ExtensionType.DetectionParser
};
extensions.handle(ExtensionType.Asset, (extension) => {
  const ref = extension.ref;
  Object.entries(assetKeyMap).filter(([key]) => !!ref[key]).forEach(([key, type]) => extensions.add(Object.assign(
    ref[key],
    // Allow the function to optionally define it's own
    // ExtensionMetadata, the use cases here is priority for LoaderParsers
    { extension: ref[key].extension ?? type }
  )));
}, (extension) => {
  const ref = extension.ref;
  Object.keys(assetKeyMap).filter((key) => !!ref[key]).forEach((key) => extensions.remove(ref[key]));
});

// node_modules/pixi.js/lib/maths/point/pointInTriangle.mjs
function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
  const v2x = x3 - x1;
  const v2y = y3 - y1;
  const v1x = x2 - x1;
  const v1y = y2 - y1;
  const v0x = px - x1;
  const v0y = py - y1;
  const dot00 = v2x * v2x + v2y * v2y;
  const dot01 = v2x * v1x + v2y * v1y;
  const dot02 = v2x * v0x + v2y * v0y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v0x + v1y * v0y;
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return u >= 0 && v >= 0 && u + v < 1;
}

// node_modules/pixi.js/lib/scene/mesh/shared/MeshGeometry.mjs
var _MeshGeometry = class _MeshGeometry2 extends Geometry {
  constructor(...args) {
    let options = args[0] ?? {};
    if (options instanceof Float32Array) {
      deprecation(v8_0_0, "use new MeshGeometry({ positions, uvs, indices }) instead");
      options = {
        positions: options,
        uvs: args[1],
        indices: args[2]
      };
    }
    options = __spreadValues(__spreadValues({}, _MeshGeometry2.defaultOptions), options);
    const positions = options.positions || new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
    let uvs = options.uvs;
    if (!uvs) {
      if (options.positions) {
        uvs = new Float32Array(positions.length);
      } else {
        uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
      }
    }
    const indices = options.indices || new Uint32Array([0, 1, 2, 0, 2, 3]);
    const shrinkToFit = options.shrinkBuffersToFit;
    const positionBuffer = new Buffer({
      data: positions,
      label: "attribute-mesh-positions",
      shrinkToFit,
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST
    });
    const uvBuffer = new Buffer({
      data: uvs,
      label: "attribute-mesh-uvs",
      shrinkToFit,
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST
    });
    const indexBuffer = new Buffer({
      data: indices,
      label: "index-mesh-buffer",
      shrinkToFit,
      usage: BufferUsage.INDEX | BufferUsage.COPY_DST
    });
    super({
      attributes: {
        aPosition: {
          buffer: positionBuffer,
          format: "float32x2",
          stride: 2 * 4,
          offset: 0
        },
        aUV: {
          buffer: uvBuffer,
          format: "float32x2",
          stride: 2 * 4,
          offset: 0
        }
      },
      indexBuffer,
      topology: options.topology
    });
    this.batchMode = "auto";
  }
  /** The positions of the mesh. */
  get positions() {
    return this.attributes.aPosition.buffer.data;
  }
  /**
   * Set the positions of the mesh.
   * When setting the positions, its important that the uvs array is at least as long as the positions array.
   * otherwise the geometry will not be valid.
   * @param {Float32Array} value - The positions of the mesh.
   */
  set positions(value) {
    this.attributes.aPosition.buffer.data = value;
  }
  /** The UVs of the mesh. */
  get uvs() {
    return this.attributes.aUV.buffer.data;
  }
  /**
   * Set the UVs of the mesh.
   * Its important that the uvs array you set is at least as long as the positions array.
   * otherwise the geometry will not be valid.
   * @param {Float32Array} value - The UVs of the mesh.
   */
  set uvs(value) {
    this.attributes.aUV.buffer.data = value;
  }
  /** The indices of the mesh. */
  get indices() {
    return this.indexBuffer.data;
  }
  set indices(value) {
    this.indexBuffer.data = value;
  }
};
_MeshGeometry.defaultOptions = {
  topology: "triangle-list",
  shrinkBuffersToFit: false
};
var MeshGeometry = _MeshGeometry;

// node_modules/pixi.js/lib/scene/mesh/shared/BatchableMesh.mjs
var BatchableMesh = class {
  constructor() {
    this.batcherName = "default";
    this.packAsQuad = false;
    this.indexOffset = 0;
    this.attributeOffset = 0;
    this.roundPixels = 0;
    this._batcher = null;
    this._batch = null;
    this._textureMatrixUpdateId = -1;
    this._uvUpdateId = -1;
  }
  get blendMode() {
    return this.renderable.groupBlendMode;
  }
  get topology() {
    return this._topology || this.geometry.topology;
  }
  set topology(value) {
    this._topology = value;
  }
  reset() {
    this.renderable = null;
    this.texture = null;
    this._batcher = null;
    this._batch = null;
    this.geometry = null;
    this._uvUpdateId = -1;
    this._textureMatrixUpdateId = -1;
  }
  /**
   * Sets the texture for the batchable mesh.
   * As it does so, it resets the texture matrix update ID.
   * this is to ensure that the texture matrix is recalculated when the uvs are referenced
   * @param value - The texture to set.
   */
  setTexture(value) {
    if (this.texture === value) return;
    this.texture = value;
    this._textureMatrixUpdateId = -1;
  }
  get uvs() {
    const geometry = this.geometry;
    const uvBuffer = geometry.getBuffer("aUV");
    const uvs = uvBuffer.data;
    let transformedUvs = uvs;
    const textureMatrix = this.texture.textureMatrix;
    if (!textureMatrix.isSimple) {
      transformedUvs = this._transformedUvs;
      if (this._textureMatrixUpdateId !== textureMatrix._updateID || this._uvUpdateId !== uvBuffer._updateID) {
        if (!transformedUvs || transformedUvs.length < uvs.length) {
          transformedUvs = this._transformedUvs = new Float32Array(uvs.length);
        }
        this._textureMatrixUpdateId = textureMatrix._updateID;
        this._uvUpdateId = uvBuffer._updateID;
        textureMatrix.multiplyUvs(uvs, transformedUvs);
      }
    }
    return transformedUvs;
  }
  get positions() {
    return this.geometry.positions;
  }
  get indices() {
    return this.geometry.indices;
  }
  get color() {
    return this.renderable.groupColorAlpha;
  }
  get groupTransform() {
    return this.renderable.groupTransform;
  }
  get attributeSize() {
    return this.geometry.positions.length / 2;
  }
  get indexSize() {
    return this.geometry.indices.length;
  }
};

// node_modules/pixi.js/lib/scene/mesh/shared/MeshPipe.mjs
var MeshGpuData = class {
  destroy() {
  }
};
var MeshPipe = class {
  constructor(renderer, adaptor) {
    this.localUniforms = new UniformGroup({
      uTransformMatrix: { value: new Matrix(), type: "mat3x3<f32>" },
      uColor: { value: new Float32Array([1, 1, 1, 1]), type: "vec4<f32>" },
      uRound: { value: 0, type: "f32" }
    });
    this.localUniformsBindGroup = new BindGroup({
      0: this.localUniforms
    });
    this.renderer = renderer;
    this._adaptor = adaptor;
    this._adaptor.init();
  }
  validateRenderable(mesh) {
    const meshData = this._getMeshData(mesh);
    const wasBatched = meshData.batched;
    const isBatched = mesh.batched;
    meshData.batched = isBatched;
    if (wasBatched !== isBatched) {
      return true;
    } else if (isBatched) {
      const geometry = mesh._geometry;
      if (geometry.indices.length !== meshData.indexSize || geometry.positions.length !== meshData.vertexSize) {
        meshData.indexSize = geometry.indices.length;
        meshData.vertexSize = geometry.positions.length;
        return true;
      }
      const batchableMesh = this._getBatchableMesh(mesh);
      if (batchableMesh.texture.uid !== mesh._texture.uid) {
        batchableMesh._textureMatrixUpdateId = -1;
      }
      return !batchableMesh._batcher.checkAndUpdateTexture(
        batchableMesh,
        mesh._texture
      );
    }
    return false;
  }
  addRenderable(mesh, instructionSet) {
    const batcher = this.renderer.renderPipes.batch;
    const meshData = this._getMeshData(mesh);
    if (mesh.didViewUpdate) {
      meshData.indexSize = mesh._geometry.indices?.length;
      meshData.vertexSize = mesh._geometry.positions?.length;
    }
    if (meshData.batched) {
      const gpuBatchableMesh = this._getBatchableMesh(mesh);
      gpuBatchableMesh.setTexture(mesh._texture);
      gpuBatchableMesh.geometry = mesh._geometry;
      batcher.addToBatch(gpuBatchableMesh, instructionSet);
    } else {
      batcher.break(instructionSet);
      instructionSet.add(mesh);
    }
  }
  updateRenderable(mesh) {
    if (mesh.batched) {
      const gpuBatchableMesh = this._getBatchableMesh(mesh);
      gpuBatchableMesh.setTexture(mesh._texture);
      gpuBatchableMesh.geometry = mesh._geometry;
      gpuBatchableMesh._batcher.updateElement(gpuBatchableMesh);
    }
  }
  execute(mesh) {
    if (!mesh.isRenderable) return;
    mesh.state.blendMode = getAdjustedBlendModeBlend(mesh.groupBlendMode, mesh.texture._source);
    const localUniforms = this.localUniforms;
    localUniforms.uniforms.uTransformMatrix = mesh.groupTransform;
    localUniforms.uniforms.uRound = this.renderer._roundPixels | mesh._roundPixels;
    localUniforms.update();
    color32BitToUniform(
      mesh.groupColorAlpha,
      localUniforms.uniforms.uColor,
      0
    );
    this._adaptor.execute(this, mesh);
  }
  _getMeshData(mesh) {
    var _a, _b;
    (_a = mesh._gpuData)[_b = this.renderer.uid] || (_a[_b] = new MeshGpuData());
    return mesh._gpuData[this.renderer.uid].meshData || this._initMeshData(mesh);
  }
  _initMeshData(mesh) {
    mesh._gpuData[this.renderer.uid].meshData = {
      batched: mesh.batched,
      indexSize: 0,
      vertexSize: 0
    };
    return mesh._gpuData[this.renderer.uid].meshData;
  }
  _getBatchableMesh(mesh) {
    var _a, _b;
    (_a = mesh._gpuData)[_b = this.renderer.uid] || (_a[_b] = new MeshGpuData());
    return mesh._gpuData[this.renderer.uid].batchableMesh || this._initBatchableMesh(mesh);
  }
  _initBatchableMesh(mesh) {
    const gpuMesh = new BatchableMesh();
    gpuMesh.renderable = mesh;
    gpuMesh.setTexture(mesh._texture);
    gpuMesh.transform = mesh.groupTransform;
    gpuMesh.roundPixels = this.renderer._roundPixels | mesh._roundPixels;
    mesh._gpuData[this.renderer.uid].batchableMesh = gpuMesh;
    return gpuMesh;
  }
  destroy() {
    this.localUniforms = null;
    this.localUniformsBindGroup = null;
    this._adaptor.destroy();
    this._adaptor = null;
    this.renderer = null;
  }
};
MeshPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes
  ],
  name: "mesh"
};

// node_modules/pixi.js/lib/scene/mesh/init.mjs
extensions.add(MeshPipe);

// node_modules/pixi.js/lib/scene/mesh/shared/Mesh.mjs
var Mesh = class extends ViewContainer {
  constructor(...args) {
    let options = args[0];
    if (options instanceof Geometry) {
      deprecation(v8_0_0, "Mesh: use new Mesh({ geometry, shader }) instead");
      options = {
        geometry: options,
        shader: args[1]
      };
      if (args[3]) {
        deprecation(v8_0_0, "Mesh: drawMode argument has been removed, use geometry.topology instead");
        options.geometry.topology = args[3];
      }
    }
    const _a = options, { geometry, shader, texture, roundPixels, state } = _a, rest = __objRest(_a, ["geometry", "shader", "texture", "roundPixels", "state"]);
    super(__spreadValues({
      label: "Mesh"
    }, rest));
    this.renderPipeId = "mesh";
    this._shader = null;
    this.allowChildren = false;
    this.shader = shader ?? null;
    this.texture = texture ?? shader?.texture ?? Texture.WHITE;
    this.state = state ?? State.for2d();
    this._geometry = geometry;
    this._geometry.on("update", this.onViewUpdate, this);
    this.roundPixels = roundPixels ?? false;
  }
  /** Alias for {@link Mesh#shader}. */
  get material() {
    deprecation(v8_0_0, "mesh.material property has been removed, use mesh.shader instead");
    return this._shader;
  }
  /**
   * Represents the vertex and fragment shaders that processes the geometry and runs on the GPU.
   * Can be shared between multiple Mesh objects.
   */
  set shader(value) {
    if (this._shader === value) return;
    this._shader = value;
    this.onViewUpdate();
  }
  get shader() {
    return this._shader;
  }
  /**
   * Includes vertex positions, face indices, colors, UVs, and
   * custom attributes within buffers, reducing the cost of passing all
   * this data to the GPU. Can be shared between multiple Mesh objects.
   */
  set geometry(value) {
    if (this._geometry === value) return;
    this._geometry?.off("update", this.onViewUpdate, this);
    value.on("update", this.onViewUpdate, this);
    this._geometry = value;
    this.onViewUpdate();
  }
  get geometry() {
    return this._geometry;
  }
  /** The texture that the Mesh uses. Null for non-MeshMaterial shaders */
  set texture(value) {
    value || (value = Texture.EMPTY);
    const currentTexture = this._texture;
    if (currentTexture === value) return;
    if (currentTexture && currentTexture.dynamic) currentTexture.off("update", this.onViewUpdate, this);
    if (value.dynamic) value.on("update", this.onViewUpdate, this);
    if (this.shader) {
      this.shader.texture = value;
    }
    this._texture = value;
    this.onViewUpdate();
  }
  get texture() {
    return this._texture;
  }
  get batched() {
    if (this._shader) return false;
    if ((this.state.data & 12) !== 0) return false;
    if (this._geometry instanceof MeshGeometry) {
      if (this._geometry.batchMode === "auto") {
        return this._geometry.positions.length / 2 <= 100;
      }
      return this._geometry.batchMode === "batch";
    }
    return false;
  }
  /**
   * The local bounds of the mesh.
   * @type {Bounds}
   */
  get bounds() {
    return this._geometry.bounds;
  }
  /**
   * Update local bounds of the mesh.
   * @private
   */
  updateBounds() {
    this._bounds = this._geometry.bounds;
  }
  /**
   * Checks if the object contains the given point.
   * @param point - The point to check
   */
  containsPoint(point) {
    const { x, y } = point;
    if (!this.bounds.containsPoint(x, y)) return false;
    const vertices = this.geometry.getBuffer("aPosition").data;
    const step = this.geometry.topology === "triangle-strip" ? 3 : 1;
    if (this.geometry.getIndex()) {
      const indices = this.geometry.getIndex().data;
      const len = indices.length;
      for (let i = 0; i + 2 < len; i += step) {
        const ind0 = indices[i] * 2;
        const ind1 = indices[i + 1] * 2;
        const ind2 = indices[i + 2] * 2;
        if (pointInTriangle(
          x,
          y,
          vertices[ind0],
          vertices[ind0 + 1],
          vertices[ind1],
          vertices[ind1 + 1],
          vertices[ind2],
          vertices[ind2 + 1]
        )) {
          return true;
        }
      }
    } else {
      const len = vertices.length / 2;
      for (let i = 0; i + 2 < len; i += step) {
        const ind0 = i * 2;
        const ind1 = (i + 1) * 2;
        const ind2 = (i + 2) * 2;
        if (pointInTriangle(
          x,
          y,
          vertices[ind0],
          vertices[ind0 + 1],
          vertices[ind1],
          vertices[ind1 + 1],
          vertices[ind2],
          vertices[ind2 + 1]
        )) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Destroys this sprite renderable and optionally its texture.
   * @param options - Options parameter. A boolean will act as if all options
   *  have been set to that value
   * @example
   * mesh.destroy();
   * mesh.destroy(true);
   * mesh.destroy({ texture: true, textureSource: true });
   */
  destroy(options) {
    super.destroy(options);
    const destroyTexture = typeof options === "boolean" ? options : options?.texture;
    if (destroyTexture) {
      const destroyTextureSource = typeof options === "boolean" ? options : options?.textureSource;
      this._texture.destroy(destroyTextureSource);
    }
    this._geometry?.off("update", this.onViewUpdate, this);
    this._texture = null;
    this._geometry = null;
    this._shader = null;
  }
};

// node_modules/pixi.js/lib/scene/text/AbstractText.mjs
var AbstractText = class extends ViewContainer {
  constructor(options, styleClass) {
    const _a = options, { text, resolution, style, anchor, width, height, roundPixels } = _a, rest = __objRest(_a, ["text", "resolution", "style", "anchor", "width", "height", "roundPixels"]);
    super(__spreadValues({}, rest));
    this.batched = true;
    this._resolution = null;
    this._autoResolution = true;
    this._didTextUpdate = true;
    this._styleClass = styleClass;
    this.text = text ?? "";
    this.style = style;
    this.resolution = resolution ?? null;
    this.allowChildren = false;
    this._anchor = new ObservablePoint(
      {
        _onUpdate: () => {
          this.onViewUpdate();
        }
      }
    );
    if (anchor) this.anchor = anchor;
    this.roundPixels = roundPixels ?? false;
    if (width !== void 0) this.width = width;
    if (height !== void 0) this.height = height;
  }
  /**
   * The anchor point of the text that controls the origin point for positioning and rotation.
   * Can be a number (same value for x/y) or a PointData object.
   * - (0,0) is top-left
   * - (0.5,0.5) is center
   * - (1,1) is bottom-right
   * ```ts
   * // Set anchor to center
   * const text = new Text({
   *     text: 'Hello Pixi!',
   *     anchor: 0.5 // Same as { x: 0.5, y: 0.5 }
   * });
   * // Set anchor to top-left
   * const text2 = new Text({
   *     text: 'Hello Pixi!',
   *     anchor: { x: 0, y: 0 } // Top-left corner
   * });
   * // Set anchor to bottom-right
   * const text3 = new Text({
   *     text: 'Hello Pixi!',
   *     anchor: { x: 1, y: 1 } // Bottom-right corner
   * });
   * ```
   * @default { x: 0, y: 0 }
   */
  get anchor() {
    return this._anchor;
  }
  set anchor(value) {
    typeof value === "number" ? this._anchor.set(value) : this._anchor.copyFrom(value);
  }
  /**
   * The text content to display. Use '\n' for line breaks.
   * Accepts strings, numbers, or objects with toString() method.
   * @example
   * ```ts
   * const text = new Text({
   *     text: 'Hello Pixi!',
   * });
   * const multilineText = new Text({
   *     text: 'Line 1\nLine 2\nLine 3',
   * });
   * const numberText = new Text({
   *     text: 12345, // Will be converted to '12345'
   * });
   * const objectText = new Text({
   *     text: { toString: () => 'Object Text' }, // Custom toString
   * });
   *
   * // Update text dynamically
   * text.text = 'Updated Text'; // Re-renders with new text
   * text.text = 67890; // Updates to '67890'
   * text.text = { toString: () => 'Dynamic Text' }; // Uses custom toString method
   * // Clear text
   * text.text = ''; // Clears the text
   * ```
   * @default ''
   */
  set text(value) {
    value = value.toString();
    if (this._text === value) return;
    this._text = value;
    this.onViewUpdate();
  }
  get text() {
    return this._text;
  }
  /**
   * The resolution/device pixel ratio for rendering.
   * Higher values result in sharper text at the cost of performance.
   * Set to null for auto-resolution based on device.
   * @example
   * ```ts
   * const text = new Text({
   *     text: 'Hello Pixi!',
   *     resolution: 2 // High DPI for sharper text
   * });
   * const autoResText = new Text({
   *     text: 'Auto Resolution',
   *     resolution: null // Use device's pixel ratio
   * });
   * ```
   * @default null
   */
  set resolution(value) {
    this._autoResolution = value === null;
    this._resolution = value;
    this.onViewUpdate();
  }
  get resolution() {
    return this._resolution;
  }
  get style() {
    return this._style;
  }
  /**
   * The style configuration for the text.
   * Can be a TextStyle instance or a configuration object.
   * Supports canvas text styles, HTML text styles, and bitmap text styles.
   * @example
   * ```ts
   * const text = new Text({
   *     text: 'Styled Text',
   *     style: {
   *         fontSize: 24,
   *         fill: 0xff1010, // Red color
   *         fontFamily: 'Arial',
   *         align: 'center', // Center alignment
   *         stroke: { color: '#4a1850', width: 5 }, // Purple stroke
   *         dropShadow: {
   *             color: '#000000', // Black shadow
   *             blur: 4, // Shadow blur
   *             distance: 6 // Shadow distance
   *         }
   *     }
   * });
   * const htmlText = new HTMLText({
   *     text: 'HTML Styled Text',
   *     style: {
   *         fontSize: '20px',
   *         fill: 'blue',
   *         fontFamily: 'Verdana',
   *     }
   * });
   * const bitmapText = new BitmapText({
   *     text: 'Bitmap Styled Text',
   *     style: {
   *         fontName: 'Arial',
   *         fontSize: 32,
   *     }
   * })
   *
   * // Update style dynamically
   * text.style = {
   *     fontSize: 30, // Change font size
   *     fill: 0x00ff00, // Change color to green
   *     align: 'right', // Change alignment to right
   *     stroke: { color: '#000000', width: 2 }, // Add black stroke
   * }
   */
  set style(style) {
    style || (style = {});
    this._style?.off("update", this.onViewUpdate, this);
    if (style instanceof this._styleClass) {
      this._style = style;
    } else {
      this._style = new this._styleClass(style);
    }
    this._style.on("update", this.onViewUpdate, this);
    this.onViewUpdate();
  }
  /**
   * The width of the sprite, setting this will actually modify the scale to achieve the value set.
   * @example
   * ```ts
   * // Set width directly
   * texture.width = 200;
   * console.log(texture.scale.x); // Scale adjusted to match width
   *
   * // For better performance when setting both width and height
   * texture.setSize(300, 400); // Avoids recalculating bounds twice
   * ```
   */
  get width() {
    return Math.abs(this.scale.x) * this.bounds.width;
  }
  set width(value) {
    this._setWidth(value, this.bounds.width);
  }
  /**
   * The height of the sprite, setting this will actually modify the scale to achieve the value set.
   * @example
   * ```ts
   * // Set height directly
   * texture.height = 200;
   * console.log(texture.scale.y); // Scale adjusted to match height
   *
   * // For better performance when setting both width and height
   * texture.setSize(300, 400); // Avoids recalculating bounds twice
   * ```
   */
  get height() {
    return Math.abs(this.scale.y) * this.bounds.height;
  }
  set height(value) {
    this._setHeight(value, this.bounds.height);
  }
  /**
   * Retrieves the size of the Text as a [Size]{@link Size} object based on the texture dimensions and scale.
   * This is faster than getting width and height separately as it only calculates the bounds once.
   * @example
   * ```ts
   * // Basic size retrieval
   * const text = new Text({
   *     text: 'Hello Pixi!',
   *     style: { fontSize: 24 }
   * });
   * const size = text.getSize();
   * console.log(`Size: ${size.width}x${size.height}`);
   *
   * // Reuse existing size object
   * const reuseSize = { width: 0, height: 0 };
   * text.getSize(reuseSize);
   * ```
   * @param out - Optional object to store the size in, to avoid allocating a new object
   * @returns The size of the Sprite
   * @see {@link Text#width} For getting just the width
   * @see {@link Text#height} For getting just the height
   * @see {@link Text#setSize} For setting both width and height
   */
  getSize(out) {
    out || (out = {});
    out.width = Math.abs(this.scale.x) * this.bounds.width;
    out.height = Math.abs(this.scale.y) * this.bounds.height;
    return out;
  }
  /**
   * Sets the size of the Text to the specified width and height.
   * This is faster than setting width and height separately as it only recalculates bounds once.
   * @example
   * ```ts
   * // Basic size setting
   * const text = new Text({
   *    text: 'Hello Pixi!',
   *    style: { fontSize: 24 }
   * });
   * text.setSize(100, 200); // Width: 100, Height: 200
   *
   * // Set uniform size
   * text.setSize(100); // Sets both width and height to 100
   *
   * // Set size with object
   * text.setSize({
   *     width: 200,
   *     height: 300
   * });
   * ```
   * @param value - This can be either a number or a {@link Size} object
   * @param height - The height to set. Defaults to the value of `width` if not provided
   * @see {@link Text#width} For setting width only
   * @see {@link Text#height} For setting height only
   */
  setSize(value, height) {
    if (typeof value === "object") {
      height = value.height ?? value.width;
      value = value.width;
    } else {
      height ?? (height = value);
    }
    value !== void 0 && this._setWidth(value, this.bounds.width);
    height !== void 0 && this._setHeight(height, this.bounds.height);
  }
  /**
   * Checks if the object contains the given point in local coordinates.
   * Uses the text's bounds for hit testing.
   * @example
   * ```ts
   * // Basic point check
   * const localPoint = { x: 50, y: 25 };
   * const contains = text.containsPoint(localPoint);
   * console.log('Point is inside:', contains);
   * ```
   * @param point - The point to check in local coordinates
   * @returns True if the point is within the text's bounds
   * @see {@link Container#toLocal} For converting global coordinates to local
   */
  containsPoint(point) {
    const width = this.bounds.width;
    const height = this.bounds.height;
    const x1 = -width * this.anchor.x;
    let y1 = 0;
    if (point.x >= x1 && point.x <= x1 + width) {
      y1 = -height * this.anchor.y;
      if (point.y >= y1 && point.y <= y1 + height) return true;
    }
    return false;
  }
  /** @internal */
  onViewUpdate() {
    if (!this.didViewUpdate) this._didTextUpdate = true;
    super.onViewUpdate();
  }
  /**
   * Destroys this text renderable and optionally its style texture.
   * @param options - Options parameter. A boolean will act as if all options
   *  have been set to that value
   * @example
   * // Destroys the text and its style
   * text.destroy({ style: true, texture: true, textureSource: true });
   * text.destroy(true);
   * text.destroy() // Destroys the text, but not its style
   */
  destroy(options = false) {
    super.destroy(options);
    this.owner = null;
    this._bounds = null;
    this._anchor = null;
    if (typeof options === "boolean" ? options : options?.style) {
      this._style.destroy(options);
    }
    this._style = null;
    this._text = null;
  }
  /**
   * Returns a unique key for this instance.
   * This key is used for caching.
   * @returns {string} Unique key for the instance
   */
  get styleKey() {
    return `${this._text}:${this._style.styleKey}:${this._resolution}`;
  }
};
function ensureTextOptions(args, name) {
  let options = args[0] ?? {};
  if (typeof options === "string" || args[1]) {
    deprecation(v8_0_0, `use new ${name}({ text: "hi!", style }) instead`);
    options = {
      text: options,
      style: args[1]
    };
  }
  return options;
}

// node_modules/pixi.js/lib/utils/canvas/getCanvasBoundingBox.mjs
var _internalCanvas = null;
var _internalContext = null;
function ensureInternalCanvas(width, height) {
  if (!_internalCanvas) {
    _internalCanvas = DOMAdapter.get().createCanvas(256, 128);
    _internalContext = _internalCanvas.getContext("2d", { willReadFrequently: true });
    _internalContext.globalCompositeOperation = "copy";
    _internalContext.globalAlpha = 1;
  }
  if (_internalCanvas.width < width || _internalCanvas.height < height) {
    _internalCanvas.width = nextPow2(width);
    _internalCanvas.height = nextPow2(height);
  }
}
function checkRow(data, width, y) {
  for (let x = 0, index = 4 * y * width; x < width; ++x, index += 4) {
    if (data[index + 3] !== 0) return false;
  }
  return true;
}
function checkColumn(data, width, x, top, bottom) {
  const stride = 4 * width;
  for (let y = top, index = top * stride + 4 * x; y <= bottom; ++y, index += stride) {
    if (data[index + 3] !== 0) return false;
  }
  return true;
}
function getCanvasBoundingBox(...args) {
  let options = args[0];
  if (!options.canvas) {
    options = { canvas: args[0], resolution: args[1] };
  }
  const { canvas } = options;
  const resolution = Math.min(options.resolution ?? 1, 1);
  const width = options.width ?? canvas.width;
  const height = options.height ?? canvas.height;
  let output = options.output;
  ensureInternalCanvas(width, height);
  if (!_internalContext) {
    throw new TypeError("Failed to get canvas 2D context");
  }
  _internalContext.drawImage(
    canvas,
    0,
    0,
    width,
    height,
    0,
    0,
    width * resolution,
    height * resolution
  );
  const imageData = _internalContext.getImageData(0, 0, width, height);
  const data = imageData.data;
  let left = 0;
  let top = 0;
  let right = width - 1;
  let bottom = height - 1;
  while (top < height && checkRow(data, width, top)) ++top;
  if (top === height) return Rectangle.EMPTY;
  while (checkRow(data, width, bottom)) --bottom;
  while (checkColumn(data, width, left, top, bottom)) ++left;
  while (checkColumn(data, width, right, top, bottom)) --right;
  ++right;
  ++bottom;
  _internalContext.globalCompositeOperation = "source-over";
  _internalContext.strokeRect(left, top, right - left, bottom - top);
  _internalContext.globalCompositeOperation = "copy";
  output ?? (output = new Rectangle());
  output.set(left / resolution, top / resolution, (right - left) / resolution, (bottom - top) / resolution);
  return output;
}

// node_modules/pixi.js/lib/scene/text/canvas/CanvasTextGenerator.mjs
var tempRect = new Rectangle();
function countSpaces(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 32) count++;
  }
  return count;
}
var CanvasTextGeneratorClass = class {
  /**
   * Creates a canvas with the specified text rendered to it.
   *
   * Generates a canvas of appropriate size, renders the text with the provided style,
   * and returns both the canvas/context and a Rectangle representing the text bounds.
   *
   * When trim is enabled in the style, the frame will represent the bounds of the
   * non-transparent pixels, which can be smaller than the full canvas.
   * @param options - The options for generating the text canvas
   * @param options.text - The text to render
   * @param options.style - The style to apply to the text
   * @param options.resolution - The resolution of the canvas (defaults to 1)
   * @param options.padding
   * @returns An object containing the canvas/context and the frame (bounds) of the text
   */
  getCanvasAndContext(options) {
    const { text, style, resolution = 1 } = options;
    const padding = style._getFinalPadding();
    const measured = CanvasTextMetrics.measureText(text || " ", style);
    const width = Math.ceil(Math.ceil(Math.max(1, measured.width) + padding * 2) * resolution);
    const height = Math.ceil(Math.ceil(Math.max(1, measured.height) + padding * 2) * resolution);
    const canvasAndContext = CanvasPool.getOptimalCanvasAndContext(width, height);
    this._renderTextToCanvas(style, padding, resolution, canvasAndContext, measured);
    const frame = style.trim ? getCanvasBoundingBox({ canvas: canvasAndContext.canvas, width, height, resolution: 1, output: tempRect }) : tempRect.set(0, 0, width, height);
    return {
      canvasAndContext,
      frame
    };
  }
  /**
   * Returns a canvas and context to the pool.
   *
   * This should be called when you're done with the canvas to allow reuse
   * and prevent memory leaks.
   * @param canvasAndContext - The canvas and context to return to the pool
   */
  returnCanvasAndContext(canvasAndContext) {
    CanvasPool.returnCanvasAndContext(canvasAndContext);
  }
  /**
   * Renders text to its canvas, and updates its texture.
   * @param style - The style of the text
   * @param padding - The padding of the text
   * @param resolution - The resolution of the text
   * @param canvasAndContext - The canvas and context to render the text to
   * @param measured - Pre-measured text metrics to avoid duplicate measurement
   */
  _renderTextToCanvas(style, padding, resolution, canvasAndContext, measured) {
    if (measured.runsByLine && measured.runsByLine.length > 0) {
      this._renderTaggedTextToCanvas(measured, style, padding, resolution, canvasAndContext);
      return;
    }
    const { canvas, context } = canvasAndContext;
    const font = fontStringFromTextStyle(style);
    const lines = measured.lines;
    const lineHeight = measured.lineHeight;
    const lineWidths = measured.lineWidths;
    const maxLineWidth = measured.maxLineWidth;
    const fontProperties = measured.fontProperties;
    const height = canvas.height;
    context.resetTransform();
    context.scale(resolution, resolution);
    context.textBaseline = style.textBaseline;
    if (style._stroke?.width) {
      const strokeStyle = style._stroke;
      context.lineWidth = strokeStyle.width;
      context.miterLimit = strokeStyle.miterLimit;
      context.lineJoin = strokeStyle.join;
      context.lineCap = strokeStyle.cap;
    }
    context.font = font;
    let linePositionX;
    let linePositionY;
    const passesCount = style.dropShadow ? 2 : 1;
    const strokeWidth = style._stroke?.width ?? 0;
    const halfStroke = strokeWidth / 2;
    let linePositionYShift = (lineHeight - fontProperties.fontSize) / 2;
    if (lineHeight - fontProperties.fontSize < 0) {
      linePositionYShift = 0;
    }
    for (let i = 0; i < passesCount; ++i) {
      const isShadowPass = style.dropShadow && i === 0;
      const dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + padding * 2) : 0;
      const dsOffsetShadow = dsOffsetText * resolution;
      if (isShadowPass) {
        this._setupDropShadow(context, style, resolution, dsOffsetShadow);
      } else {
        const gradientBounds = style._gradientBounds;
        const gradientOffset = style._gradientOffset;
        if (gradientBounds) {
          const gradientMetrics = {
            width: gradientBounds.width,
            height: gradientBounds.height,
            lineHeight: gradientBounds.height,
            lines: measured.lines
          };
          this._setFillAndStrokeStyles(
            context,
            style,
            gradientMetrics,
            padding,
            halfStroke,
            gradientOffset?.x ?? 0,
            gradientOffset?.y ?? 0
          );
        } else if (gradientOffset) {
          this._setFillAndStrokeStyles(
            context,
            style,
            measured,
            padding,
            halfStroke,
            gradientOffset.x,
            gradientOffset.y
          );
        } else {
          this._setFillAndStrokeStyles(context, style, measured, padding, halfStroke);
        }
        context.shadowColor = "rgba(0,0,0,0)";
      }
      for (let j = 0; j < lines.length; j++) {
        linePositionX = halfStroke;
        linePositionY = halfStroke + j * lineHeight + fontProperties.ascent + linePositionYShift;
        linePositionX += this._getAlignmentOffset(lineWidths[j], maxLineWidth, style.align);
        let wordSpacing = 0;
        if (style.align === "justify" && style.wordWrap && j < lines.length - 1) {
          const spaces = countSpaces(lines[j]);
          if (spaces > 0) {
            wordSpacing = (maxLineWidth - lineWidths[j]) / spaces;
          }
        }
        if (style._stroke?.width) {
          this._drawLetterSpacing(
            lines[j],
            style,
            canvasAndContext,
            linePositionX + padding,
            linePositionY + padding - dsOffsetText,
            true,
            wordSpacing
          );
        }
        if (style._fill !== void 0) {
          this._drawLetterSpacing(
            lines[j],
            style,
            canvasAndContext,
            linePositionX + padding,
            linePositionY + padding - dsOffsetText,
            false,
            wordSpacing
          );
        }
      }
    }
  }
  /**
   * Renders tagged text (with per-run styles) to canvas.
   * @param measured - The measured text metrics containing runsByLine
   * @param style - The base text style
   * @param padding - The padding of the text
   * @param resolution - The resolution of the text
   * @param canvasAndContext - The canvas and context to render to
   */
  _renderTaggedTextToCanvas(measured, style, padding, resolution, canvasAndContext) {
    const { canvas, context } = canvasAndContext;
    const { runsByLine, lineWidths, maxLineWidth, lineAscents, lineHeights, hasDropShadow } = measured;
    const height = canvas.height;
    context.resetTransform();
    context.scale(resolution, resolution);
    context.textBaseline = style.textBaseline;
    const passesCount = hasDropShadow ? 2 : 1;
    let maxStrokeWidth = style._stroke?.width ?? 0;
    for (const lineRuns of runsByLine) {
      for (const run of lineRuns) {
        const w = run.style._stroke?.width ?? 0;
        if (w > maxStrokeWidth) maxStrokeWidth = w;
      }
    }
    const halfStroke = maxStrokeWidth / 2;
    const runDataByLine = [];
    for (let lineIndex = 0; lineIndex < runsByLine.length; lineIndex++) {
      const lineRuns = runsByLine[lineIndex];
      const runData = [];
      for (const run of lineRuns) {
        const font = fontStringFromTextStyle(run.style);
        context.font = font;
        runData.push({
          width: CanvasTextMetrics._measureText(run.text, run.style.letterSpacing, context),
          font
        });
      }
      runDataByLine.push(runData);
    }
    for (let pass = 0; pass < passesCount; ++pass) {
      const isShadowPass = hasDropShadow && pass === 0;
      const dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + padding * 2) : 0;
      const dsOffsetShadow = dsOffsetText * resolution;
      if (!isShadowPass) {
        context.shadowColor = "rgba(0,0,0,0)";
      }
      let currentY = halfStroke;
      for (let lineIndex = 0; lineIndex < runsByLine.length; lineIndex++) {
        const lineRuns = runsByLine[lineIndex];
        const lineWidth = lineWidths[lineIndex];
        const lineAscent = lineAscents[lineIndex];
        const currentLineHeight = lineHeights[lineIndex];
        const lineRunData = runDataByLine[lineIndex];
        let linePositionX = halfStroke;
        linePositionX += this._getAlignmentOffset(lineWidth, maxLineWidth, style.align);
        let wordSpacing = 0;
        if (style.align === "justify" && style.wordWrap && lineIndex < runsByLine.length - 1) {
          let totalSpaces = 0;
          for (const run of lineRuns) {
            totalSpaces += countSpaces(run.text);
          }
          if (totalSpaces > 0) {
            wordSpacing = (maxLineWidth - lineWidth) / totalSpaces;
          }
        }
        const linePositionY = currentY + lineAscent;
        let runX = linePositionX + padding;
        for (let runIndex = 0; runIndex < lineRuns.length; runIndex++) {
          const run = lineRuns[runIndex];
          const { width: runWidth, font: runFont } = lineRunData[runIndex];
          context.font = runFont;
          context.textBaseline = run.style.textBaseline;
          if (run.style._stroke?.width) {
            const runStroke = run.style._stroke;
            context.lineWidth = runStroke.width;
            context.miterLimit = runStroke.miterLimit;
            context.lineJoin = runStroke.join;
            context.lineCap = runStroke.cap;
            if (isShadowPass) {
              if (run.style.dropShadow) {
                this._setupDropShadow(
                  context,
                  run.style,
                  resolution,
                  dsOffsetShadow
                );
              } else {
                const spacesSkipped = countSpaces(run.text);
                runX += runWidth + spacesSkipped * wordSpacing;
                continue;
              }
            } else {
              const runFontProps = CanvasTextMetrics.measureFont(runFont);
              const runHeight = run.style.lineHeight || runFontProps.fontSize;
              const runMetrics = {
                width: runWidth,
                height: runHeight,
                lineHeight: runHeight,
                lines: [run.text]
              };
              context.strokeStyle = getCanvasFillStyle(
                runStroke,
                context,
                runMetrics,
                padding * 2,
                runX - padding,
                currentY
              );
            }
            this._drawLetterSpacing(
              run.text,
              run.style,
              canvasAndContext,
              runX,
              linePositionY + padding - dsOffsetText,
              true,
              wordSpacing
            );
          }
          const spacesInRun = countSpaces(run.text);
          runX += runWidth + spacesInRun * wordSpacing;
        }
        runX = linePositionX + padding;
        for (let runIndex = 0; runIndex < lineRuns.length; runIndex++) {
          const run = lineRuns[runIndex];
          const { width: runWidth, font: runFont } = lineRunData[runIndex];
          context.font = runFont;
          context.textBaseline = run.style.textBaseline;
          if (run.style._fill !== void 0) {
            if (isShadowPass) {
              if (run.style.dropShadow) {
                this._setupDropShadow(
                  context,
                  run.style,
                  resolution,
                  dsOffsetShadow
                );
              } else {
                const spacesSkipped = countSpaces(run.text);
                runX += runWidth + spacesSkipped * wordSpacing;
                continue;
              }
            } else {
              const runFontProps = CanvasTextMetrics.measureFont(runFont);
              const runHeight = run.style.lineHeight || runFontProps.fontSize;
              const runMetrics = {
                width: runWidth,
                height: runHeight,
                lineHeight: runHeight,
                lines: [run.text]
              };
              context.fillStyle = getCanvasFillStyle(
                run.style._fill,
                context,
                runMetrics,
                padding * 2,
                runX - padding,
                currentY
              );
            }
            this._drawLetterSpacing(
              run.text,
              run.style,
              canvasAndContext,
              runX,
              linePositionY + padding - dsOffsetText,
              false,
              wordSpacing
            );
          }
          const spacesInFillRun = countSpaces(run.text);
          runX += runWidth + spacesInFillRun * wordSpacing;
        }
        currentY += currentLineHeight;
      }
    }
  }
  /**
   * Sets fill and stroke styles on the canvas context for text rendering.
   * @param context - The canvas context
   * @param style - The text style
   * @param metrics - The text metrics for gradient calculation
   * @param padding - The padding value
   * @param halfStroke - Half the stroke width
   * @param offsetX - X offset for gradient positioning
   * @param offsetY - Y offset for gradient positioning
   */
  _setFillAndStrokeStyles(context, style, metrics, padding, halfStroke, offsetX = 0, offsetY = 0) {
    context.fillStyle = style._fill ? getCanvasFillStyle(style._fill, context, metrics, padding * 2, offsetX, offsetY) : null;
    if (style._stroke?.width) {
      const strokePadding = halfStroke + padding * 2;
      context.strokeStyle = getCanvasFillStyle(
        style._stroke,
        context,
        metrics,
        strokePadding,
        offsetX,
        offsetY
      );
    }
  }
  /**
   * Sets up the canvas context for drop shadow rendering.
   * @param context - The canvas context
   * @param style - The text style containing drop shadow options
   * @param resolution - The resolution multiplier
   * @param dsOffsetShadow - The shadow Y offset
   */
  _setupDropShadow(context, style, resolution, dsOffsetShadow) {
    context.fillStyle = "black";
    context.strokeStyle = "black";
    const shadowOptions = style.dropShadow;
    const dropShadowColor = shadowOptions.color;
    const dropShadowAlpha = shadowOptions.alpha;
    context.shadowColor = Color.shared.setValue(dropShadowColor).setAlpha(dropShadowAlpha).toRgbaString();
    const dropShadowBlur = shadowOptions.blur * resolution;
    const dropShadowDistance = shadowOptions.distance * resolution;
    context.shadowBlur = dropShadowBlur;
    context.shadowOffsetX = Math.cos(shadowOptions.angle) * dropShadowDistance;
    context.shadowOffsetY = Math.sin(shadowOptions.angle) * dropShadowDistance + dsOffsetShadow;
  }
  /**
   * Calculates the X offset for text alignment.
   * @param lineWidth - The width of the current line
   * @param alignWidth - The width to align against
   * @param align - The text alignment
   * @returns The X offset for this line
   */
  _getAlignmentOffset(lineWidth, alignWidth, align) {
    if (align === "right") {
      return alignWidth - lineWidth;
    } else if (align === "center") {
      return (alignWidth - lineWidth) / 2;
    }
    return 0;
  }
  /**
   * Render the text with letter-spacing.
   *
   * This method handles rendering text with the correct letter spacing, using either:
   * 1. Native letter spacing if supported by the browser
   * 2. Manual letter spacing calculation if not natively supported
   *
   * For manual letter spacing, it calculates the position of each character
   * based on its width and the desired spacing.
   * @param text - The text to draw
   * @param style - The text style to apply
   * @param canvasAndContext - The canvas and context to draw to
   * @param x - Horizontal position to draw the text
   * @param y - Vertical position to draw the text
   * @param isStroke - Whether to render the stroke (true) or fill (false)
   * @param wordSpacing - Extra spacing to add between words (for justify alignment)
   * @private
   */
  _drawLetterSpacing(text, style, canvasAndContext, x, y, isStroke = false, wordSpacing = 0) {
    const { context } = canvasAndContext;
    const letterSpacing = style.letterSpacing;
    let useExperimentalLetterSpacing = false;
    if (CanvasTextMetrics.experimentalLetterSpacingSupported) {
      if (CanvasTextMetrics.experimentalLetterSpacing) {
        context.letterSpacing = `${letterSpacing}px`;
        context.textLetterSpacing = `${letterSpacing}px`;
        useExperimentalLetterSpacing = true;
      } else {
        context.letterSpacing = "0px";
        context.textLetterSpacing = "0px";
      }
    }
    if ((letterSpacing === 0 || useExperimentalLetterSpacing) && wordSpacing === 0) {
      if (isStroke) {
        context.strokeText(text, x, y);
      } else {
        context.fillText(text, x, y);
      }
      return;
    }
    if (wordSpacing !== 0 && (letterSpacing === 0 || useExperimentalLetterSpacing)) {
      const words = text.split(" ");
      let currentPosition2 = x;
      const spaceWidth = context.measureText(" ").width;
      for (let i = 0; i < words.length; i++) {
        if (isStroke) {
          context.strokeText(words[i], currentPosition2, y);
        } else {
          context.fillText(words[i], currentPosition2, y);
        }
        currentPosition2 += context.measureText(words[i]).width + spaceWidth + wordSpacing;
      }
      return;
    }
    let currentPosition = x;
    const stringArray = CanvasTextMetrics.graphemeSegmenter(text);
    let previousWidth = context.measureText(text).width;
    let currentWidth = 0;
    for (let i = 0; i < stringArray.length; ++i) {
      const currentChar = stringArray[i];
      if (isStroke) {
        context.strokeText(currentChar, currentPosition, y);
      } else {
        context.fillText(currentChar, currentPosition, y);
      }
      let textStr = "";
      for (let j = i + 1; j < stringArray.length; ++j) {
        textStr += stringArray[j];
      }
      currentWidth = context.measureText(textStr).width;
      currentPosition += previousWidth - currentWidth + letterSpacing;
      if (currentChar === " ") currentPosition += wordSpacing;
      previousWidth = currentWidth;
    }
  }
};
var CanvasTextGenerator = new CanvasTextGeneratorClass();

// node_modules/pixi.js/lib/scene/text/utils/updateTextBounds.mjs
function updateTextBounds(batchableSprite, text) {
  const { texture, bounds } = batchableSprite;
  const padding = text._style._getFinalPadding();
  updateQuadBounds(bounds, text._anchor, texture);
  const paddingOffset = text._anchor._x * padding * 2;
  const paddingOffsetY = text._anchor._y * padding * 2;
  bounds.minX -= padding - paddingOffset;
  bounds.minY -= padding - paddingOffsetY;
  bounds.maxX -= padding - paddingOffset;
  bounds.maxY -= padding - paddingOffsetY;
}

// node_modules/pixi.js/lib/scene/text/canvas/BatchableText.mjs
var BatchableText = class extends BatchableSprite {
};

// node_modules/pixi.js/lib/scene/text/canvas/CanvasTextPipe.mjs
var CanvasTextPipe = class {
  constructor(renderer) {
    this._renderer = renderer;
    renderer.runners.resolutionChange.add(this);
    this._managedTexts = new GCManagedHash({
      renderer,
      type: "renderable",
      onUnload: this.onTextUnload.bind(this),
      name: "canvasText"
    });
  }
  resolutionChange() {
    for (const key in this._managedTexts.items) {
      const text = this._managedTexts.items[key];
      if (text?._autoResolution) text.onViewUpdate();
    }
  }
  validateRenderable(text) {
    const gpuText = this._getGpuText(text);
    const newKey = text.styleKey;
    if (gpuText.currentKey !== newKey) return true;
    return text._didTextUpdate;
  }
  addRenderable(text, instructionSet) {
    const batchableText = this._getGpuText(text);
    if (text._didTextUpdate) {
      const resolution = text._autoResolution ? this._renderer.resolution : text.resolution;
      if (batchableText.currentKey !== text.styleKey || text._resolution !== resolution) {
        this._updateGpuText(text);
      }
      text._didTextUpdate = false;
      updateTextBounds(batchableText, text);
    }
    this._renderer.renderPipes.batch.addToBatch(batchableText, instructionSet);
  }
  updateRenderable(text) {
    const batchableText = this._getGpuText(text);
    batchableText._batcher.updateElement(batchableText);
  }
  _updateGpuText(text) {
    const batchableText = this._getGpuText(text);
    if (batchableText.texture) {
      this._renderer.canvasText.decreaseReferenceCount(batchableText.currentKey);
    }
    text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;
    batchableText.texture = this._renderer.canvasText.getManagedTexture(text);
    batchableText.currentKey = text.styleKey;
  }
  _getGpuText(text) {
    return text._gpuData[this._renderer.uid] || this.initGpuText(text);
  }
  initGpuText(text) {
    const batchableText = new BatchableText();
    batchableText.currentKey = "--";
    batchableText.renderable = text;
    batchableText.transform = text.groupTransform;
    batchableText.bounds = { minX: 0, maxX: 1, minY: 0, maxY: 0 };
    batchableText.roundPixels = this._renderer._roundPixels | text._roundPixels;
    text._gpuData[this._renderer.uid] = batchableText;
    this._managedTexts.add(text);
    return batchableText;
  }
  onTextUnload(text) {
    const gpuData = text._gpuData[this._renderer.uid];
    if (!gpuData) return;
    const { canvasText } = this._renderer;
    const refCount = canvasText.getReferenceCount(gpuData.currentKey);
    if (refCount > 0) {
      canvasText.decreaseReferenceCount(gpuData.currentKey);
    } else if (gpuData.texture) {
      canvasText.returnTexture(gpuData.texture);
    }
  }
  destroy() {
    this._managedTexts.destroy();
    this._renderer = null;
  }
};
CanvasTextPipe.extension = {
  type: [
    ExtensionType.WebGLPipes,
    ExtensionType.WebGPUPipes,
    ExtensionType.CanvasPipes
  ],
  name: "text"
};

// node_modules/pixi.js/lib/scene/text/shared/AbstractTextSystem.mjs
var AbstractTextSystem = class {
  constructor(renderer, retainCanvasContext) {
    this._activeTextures = {};
    this._renderer = renderer;
    this._retainCanvasContext = retainCanvasContext;
  }
  getTexture(options, _resolution, _style, _textKey) {
    if (typeof options === "string") {
      deprecation("8.0.0", "CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments");
      options = {
        text: options,
        style: _style,
        resolution: _resolution
      };
    }
    if (!(options.style instanceof TextStyle)) {
      options.style = new TextStyle(options.style);
    }
    if (!(options.textureStyle instanceof TextureStyle)) {
      options.textureStyle = new TextureStyle(options.textureStyle);
    }
    if (typeof options.text !== "string") {
      options.text = options.text.toString();
    }
    const { text, style, textureStyle, autoGenerateMipmaps } = options;
    const resolution = options.resolution ?? this._renderer.resolution;
    const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
      text,
      style,
      resolution
    });
    const texture = getPo2TextureFromSource(
      canvasAndContext.canvas,
      frame.width,
      frame.height,
      resolution,
      autoGenerateMipmaps
    );
    if (textureStyle) texture.source.style = textureStyle;
    if (style.trim) {
      frame.pad(style.padding);
      texture.frame.copyFrom(frame);
      texture.frame.scale(1 / resolution);
      texture.updateUvs();
    }
    if (style.filters) {
      const filteredTexture = this._applyFilters(texture, style.filters);
      this.returnTexture(texture);
      CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);
      return filteredTexture;
    }
    this._renderer.texture.initSource(texture._source);
    if (!this._retainCanvasContext) {
      CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);
    }
    return texture;
  }
  /**
   * Returns a texture that was created wit the above `getTexture` function.
   * Handy if you are done with a texture and want to return it to the pool.
   * @param texture - The texture to be returned.
   */
  returnTexture(texture) {
    const source = texture.source;
    const resource = source.resource;
    if (this._retainCanvasContext && resource?.getContext) {
      const context = resource.getContext("2d");
      if (context) {
        CanvasTextGenerator.returnCanvasAndContext({ canvas: resource, context });
      }
    }
    source.resource = null;
    source.uploadMethodId = "unknown";
    source.alphaMode = "no-premultiply-alpha";
    TexturePool.returnTexture(texture, true);
  }
  /**
   * Renders text to its canvas, and updates its texture.
   * @deprecated since 8.10.0
   */
  renderTextToCanvas() {
    deprecation(
      "8.10.0",
      "CanvasTextSystem.renderTextToCanvas: no longer supported, use CanvasTextSystem.getTexture instead"
    );
  }
  /**
   * Gets or creates a managed texture for a Text object. This method handles texture reuse and reference counting.
   * @param text - The Text object that needs a texture
   * @returns A Texture instance that represents the rendered text
   * @remarks
   * This method performs the following:
   * 1. Sets the appropriate resolution based on auto-resolution settings
   * 2. Checks if a texture already exists for the text's style
   * 3. Creates a new texture if needed or returns an existing one
   * 4. Manages reference counting for texture reuse
   */
  getManagedTexture(text) {
    text._resolution = text._autoResolution ? this._renderer.resolution : text.resolution;
    const textKey = text.styleKey;
    if (this._activeTextures[textKey]) {
      this._increaseReferenceCount(textKey);
      return this._activeTextures[textKey].texture;
    }
    const texture = this.getTexture({
      text: text.text,
      style: text.style,
      resolution: text._resolution,
      textureStyle: text.textureStyle,
      autoGenerateMipmaps: text.autoGenerateMipmaps
    });
    this._activeTextures[textKey] = {
      texture,
      usageCount: 1
    };
    return texture;
  }
  /**
   * Decreases the reference count for a texture associated with a text key.
   * When the reference count reaches zero, the texture is returned to the pool.
   * @param textKey - The unique key identifying the text style configuration
   * @remarks
   * This method is crucial for memory management, ensuring textures are properly
   * cleaned up when they are no longer needed by any Text instances.
   */
  decreaseReferenceCount(textKey) {
    const activeTexture = this._activeTextures[textKey];
    if (!activeTexture) return;
    activeTexture.usageCount--;
    if (activeTexture.usageCount === 0) {
      this.returnTexture(activeTexture.texture);
      this._activeTextures[textKey] = null;
    }
  }
  /**
   * Gets the current reference count for a texture associated with a text key.
   * @param textKey - The unique key identifying the text style configuration
   * @returns The number of Text instances currently using this texture
   */
  getReferenceCount(textKey) {
    return this._activeTextures[textKey]?.usageCount ?? 0;
  }
  _increaseReferenceCount(textKey) {
    this._activeTextures[textKey].usageCount++;
  }
  /**
   * Applies the specified filters to the given texture.
   *
   * This method takes a texture and a list of filters, applies the filters to the texture,
   * and returns the resulting texture. It also ensures that the alpha mode of the resulting
   * texture is set to 'premultiplied-alpha'.
   * @param {Texture} texture - The texture to which the filters will be applied.
   * @param {Filter[]} filters - The filters to apply to the texture.
   * @returns {Texture} The resulting texture after all filters have been applied.
   */
  _applyFilters(texture, filters) {
    const currentRenderTarget = this._renderer.renderTarget.renderTarget;
    const resultTexture = this._renderer.filter.generateFilteredTexture({
      texture,
      filters
    });
    this._renderer.renderTarget.bind(currentRenderTarget, false);
    return resultTexture;
  }
  destroy() {
    this._renderer = null;
    for (const key in this._activeTextures) {
      if (this._activeTextures[key]) this.returnTexture(this._activeTextures[key].texture);
    }
    this._activeTextures = null;
  }
};

// node_modules/pixi.js/lib/scene/text/canvas/CanvasTextSystem.mjs
var CanvasRendererTextSystem = class extends AbstractTextSystem {
  constructor(renderer) {
    super(renderer, true);
  }
};
CanvasRendererTextSystem.extension = {
  type: [
    ExtensionType.CanvasSystem
  ],
  name: "canvasText"
};

// node_modules/pixi.js/lib/scene/text/shared/GpuTextSystem.mjs
var CanvasTextSystem = class extends AbstractTextSystem {
  constructor(renderer) {
    super(renderer, false);
  }
};
CanvasTextSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem
  ],
  name: "canvasText"
};

// node_modules/pixi.js/lib/scene/text/init.mjs
extensions.add(CanvasRendererTextSystem);
extensions.add(CanvasTextSystem);
extensions.add(CanvasTextPipe);

// node_modules/pixi.js/lib/scene/text/Text.mjs
var Text = class extends AbstractText {
  constructor(...args) {
    const options = ensureTextOptions(args, "Text");
    super(options, TextStyle);
    this.renderPipeId = "text";
    if (options.textureStyle) {
      this.textureStyle = options.textureStyle instanceof TextureStyle ? options.textureStyle : new TextureStyle(options.textureStyle);
    }
    this.autoGenerateMipmaps = options.autoGenerateMipmaps ?? TextureSource.defaultOptions.autoGenerateMipmaps;
  }
  /** @private */
  updateBounds() {
    const bounds = this._bounds;
    const anchor = this._anchor;
    let width = 0;
    let height = 0;
    if (this._style.trim) {
      const { frame, canvasAndContext } = CanvasTextGenerator.getCanvasAndContext({
        text: this.text,
        style: this._style,
        resolution: 1
      });
      CanvasTextGenerator.returnCanvasAndContext(canvasAndContext);
      width = frame.width;
      height = frame.height;
    } else {
      const canvasMeasurement = CanvasTextMetrics.measureText(
        this._text,
        this._style
      );
      width = canvasMeasurement.width;
      height = canvasMeasurement.height;
    }
    bounds.minX = -anchor._x * width;
    bounds.maxX = bounds.minX + width;
    bounds.minY = -anchor._y * height;
    bounds.maxY = bounds.minY + height;
  }
};

// node_modules/pixi.js/lib/index.mjs
extensions.add(browserExt, webworkerExt);

// src/app/map-editor/map-editor.model.ts
var MAP_FORMAT_VERSION = 2;
var RASTER_LAYERS = ["height", "landColor", "waterColor"];
var TIERS = ["high", "med", "low"];
var TIER_WORLD_SIZE = {
  high: 1024,
  med: 8192,
  low: 65536
};
var CHUNK_WORLD_SIZE = TIER_WORLD_SIZE.high;
function coarserTiers(tier) {
  return TIERS.slice(TIERS.indexOf(tier) + 1);
}
var TARGET_CHUNKS_ON_SCREEN = 64;
function chunksOnScreen(w, h, tier) {
  const span = TIER_WORLD_SIZE[tier];
  return (Math.ceil(w / span) + 1) * (Math.ceil(h / span) + 1);
}
function chooseTier(current, w, h) {
  const index = TIERS.indexOf(current);
  if (chunksOnScreen(w, h, current) > TARGET_CHUNKS_ON_SCREEN) {
    for (let i = index + 1; i < TIERS.length; i++) {
      if (chunksOnScreen(w, h, TIERS[i]) <= TARGET_CHUNKS_ON_SCREEN)
        return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }
  for (let i = 0; i < index; i++) {
    if (chunksOnScreen(w, h, TIERS[i]) <= TARGET_CHUNKS_ON_SCREEN * 0.6)
      return TIERS[i];
  }
  return current;
}
var LAYER_TEXELS = {
  height: 512,
  landColor: 512,
  waterColor: 512
};
function chunkKey(layer, tier, cx, cy) {
  return `${layer}/${tier}/${cx}/${cy}`;
}
function defaultSettings() {
  return {
    waterBase: "#3f6d8c",
    paperTexture: "",
    paperOpacity: 0.35,
    coastNoiseScale: 260,
    coastNoiseAmount: 0.35,
    coastShoreWidth: 0.12,
    coastShoreLight: 0.18,
    coastShadowWidth: 0.22,
    coastShadowStrength: 0.35,
    showGrid: true
  };
}
function createEmptyMapEditorData(worldName) {
  return {
    formatVersion: MAP_FORMAT_VERSION,
    worldName,
    symbols: [],
    labels: [],
    regions: [],
    markers: [],
    labelPresets: [],
    landPalette: ["#7a8f5a", "#8fa06b", "#a8b581", "#c2c79a", "#6b7d4e"],
    waterPalette: ["#3f6d8c", "#4f7f9e", "#6394b0", "#2e5670"],
    settings: defaultSettings(),
    fog: { revealed: [] },
    chunkVersions: {},
    updatedAt: Date.now()
  };
}
function applyMapOp(data, op) {
  switch (op.t) {
    case "add": {
      const list = data[op.c];
      if (!list.some((o) => o.id === op.v.id))
        list.push(op.v);
      break;
    }
    case "upd": {
      const list = data[op.c];
      const obj = list.find((o) => o.id === op.id);
      if (obj)
        Object.assign(obj, op.v);
      break;
    }
    case "del": {
      const list = data[op.c];
      const i = list.findIndex((o) => o.id === op.id);
      if (i >= 0)
        list.splice(i, 1);
      break;
    }
    case "chunk": {
      data.chunkVersions[chunkKey(op.layer, op.tier, op.cx, op.cy)] = op.ver;
      break;
    }
    case "set": {
      const parts = op.path.split(".").filter(Boolean);
      if (parts.length === 0)
        return;
      let obj = data;
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
        if (obj == null)
          return;
      }
      obj[parts[parts.length - 1]] = op.value;
      break;
    }
  }
  data.updatedAt = Date.now();
}

// src/app/services/map-editor-api.service.ts
var MapEditorApiService = class _MapEditorApiService {
  http = inject(HttpClient);
  base(worldName) {
    return `/api/worlds/${encodeURIComponent(worldName)}/map-editor`;
  }
  async load(worldName) {
    try {
      const data = await firstValueFrom(this.http.get(this.base(worldName)));
      return data ?? createEmptyMapEditorData(worldName);
    } catch (err) {
      console.error("[MapEditorAPI] Failed to load:", err);
      return createEmptyMapEditorData(worldName);
    }
  }
  async save(worldName, data) {
    await firstValueFrom(this.http.post(this.base(worldName), data));
  }
  /**
   * One URL shape for every tier. All three are authored the same way and stored the same
   * way, so nothing here needs to know which is which.
   */
  chunkUrl(worldName, layer, tier, cx, cy) {
    return `${this.base(worldName)}/chunks/${layer}/${tier}/${cx}/${cy}`;
  }
  /**
   * Fetch a painted chunk. Resolves `null` for a chunk that has never been painted, which
   * is the common case over most of a large map and not an error.
   *
   * `ver` busts the cache; the bytes at a given version are immutable, so the response is
   * cached aggressively by the server.
   */
  async fetchChunk(worldName, layer, tier, cx, cy, ver) {
    const url = `${this.chunkUrl(worldName, layer, tier, cx, cy)}?v=${ver}`;
    try {
      const res = await fetch(url, { headers: identityHeaders() });
      if (!res.ok)
        return null;
      return await res.blob();
    } catch {
      return null;
    }
  }
  /** Upload a painted chunk; resolves the new server-side version. */
  async putChunk(worldName, layer, tier, cx, cy, blob) {
    try {
      const res = await fetch(this.chunkUrl(worldName, layer, tier, cx, cy), {
        method: "PUT",
        headers: __spreadValues({ "Content-Type": "image/png" }, identityHeaders()),
        body: blob
      });
      if (!res.ok)
        return null;
      const json = await res.json();
      return json.success ? json.ver ?? null : null;
    } catch (err) {
      console.error("[MapEditorAPI] Chunk upload failed:", err);
      return null;
    }
  }
  static \u0275fac = function MapEditorApiService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MapEditorApiService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MapEditorApiService, factory: _MapEditorApiService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapEditorApiService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/services/map-editor-socket.service.ts
var MapEditorSocketService = class _MapEditorSocketService {
  socket;
  worldName = "";
  opSubject = new Subject();
  readySubject = new Subject();
  ops$ = this.opSubject.asObservable();
  connectionReady$ = this.readySubject.asObservable();
  connect(worldName) {
    this.worldName = worldName;
    if (this.socket?.connected) {
      this.socket.emit("joinMapEditor", { worldName });
      return;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = void 0;
    }
    this.socket = lookup(window.location.origin, {
      path: "/socket.io",
      // The server reads GM status from this to decide which room the client joins.
      auth: identityAuth(),
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1e3,
      timeout: 1e4,
      forceNew: true
    });
    this.socket.on("connect", () => {
      this.socket?.emit("joinMapEditor", { worldName: this.worldName });
      this.readySubject.next();
    });
    this.socket.on("mapEditorOp", (op) => this.opSubject.next(op));
  }
  disconnect() {
    if (this.socket?.connected && this.worldName) {
      this.socket.emit("leaveMapEditor", { worldName: this.worldName });
    }
    this.socket?.disconnect();
    this.socket = void 0;
    this.worldName = "";
  }
  async ensureConnected() {
    if (this.socket?.connected)
      return;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Socket timeout")), 1e4);
      const sub = this.connectionReady$.subscribe(() => {
        clearTimeout(timeout);
        sub.unsubscribe();
        resolve();
      });
    });
  }
  sendOp(op) {
    if (!this.socket?.connected || !this.worldName)
      return;
    this.socket.emit("mapEditorOp", { worldName: this.worldName, op });
  }
  get socketId() {
    return this.socket?.id;
  }
  static \u0275fac = function MapEditorSocketService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MapEditorSocketService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MapEditorSocketService, factory: _MapEditorSocketService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapEditorSocketService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/services/map-editor-store.service.ts
var MapEditorStoreService = class _MapEditorStoreService {
  api = inject(MapEditorApiService);
  socket = inject(MapEditorSocketService);
  data = signal(null, ...ngDevMode ? [{ debugName: "data" }] : []);
  /** Bumped on every applied op, so renderers can cheaply detect "something changed". */
  revision = signal(0, ...ngDevMode ? [{ debugName: "revision" }] : []);
  worldName = "";
  /** Chunk versions this client produced — echoes of these need no refetch. */
  ownChunkVersions = /* @__PURE__ */ new Map();
  chunkInvalidationSubject = new Subject();
  /** Chunks changed by *other* clients; the chunk manager refetches these. */
  chunkInvalidations$ = this.chunkInvalidationSubject.asObservable();
  objectOpSubject = new Subject();
  /**
   * Object ops after they have been applied, local and remote alike.
   *
   * Views keep their own indexes and sprite pools, so they need the individual change —
   * re-deriving from the whole collection on every edit is exactly what the op protocol
   * exists to avoid.
   */
  objectOps$ = this.objectOpSubject.asObservable();
  opSub;
  async load(worldName) {
    this.worldName = worldName;
    this.socket.connect(worldName);
    this.opSub?.unsubscribe();
    this.opSub = this.socket.ops$.subscribe((op) => this.applyRemoteOp(op));
    const data = await this.api.load(worldName);
    data.worldName = worldName;
    this.data.set(data);
    this.revision.update((n) => n + 1);
    return data;
  }
  destroy() {
    this.opSub?.unsubscribe();
    this.opSub = void 0;
    this.socket.disconnect();
    this.ownChunkVersions.clear();
    this.data.set(null);
    this.worldName = "";
  }
  // ── op plumbing ──
  applyLocal(op) {
    const data = this.data();
    if (!data)
      return;
    applyMapOp(data, op);
    this.revision.update((n) => n + 1);
    if (op.t === "add" || op.t === "upd" || op.t === "del")
      this.objectOpSubject.next(op);
  }
  /** Apply optimistically, then broadcast. */
  emit(op) {
    this.applyLocal(op);
    this.socket.ensureConnected().then(() => this.socket.sendOp(op)).catch(() => {
    });
  }
  applyRemoteOp(op) {
    const data = this.data();
    if (!data)
      return;
    applyMapOp(data, op);
    this.revision.update((n) => n + 1);
    if (op.t === "add" || op.t === "upd" || op.t === "del") {
      this.objectOpSubject.next(op);
      return;
    }
    if (op.t === "chunk") {
      const key = chunkKey(op.layer, op.tier, op.cx, op.cy);
      const own = this.ownChunkVersions.get(key);
      if (own !== void 0 && op.ver <= own)
        return;
      this.chunkInvalidationSubject.next({
        layer: op.layer,
        tier: op.tier,
        cx: op.cx,
        cy: op.cy,
        ver: op.ver
      });
    }
  }
  // ── object mutations ──
  addObject(c, obj) {
    this.emit({ t: "add", c, v: obj });
  }
  updateObject(c, id, changes) {
    this.emit({ t: "upd", c, id, v: changes });
  }
  deleteObject(c, id) {
    this.emit({ t: "del", c, id });
  }
  /** Flip a secret object to visible. The server decides what players are then told. */
  revealObject(c, id) {
    this.updateObject(c, id, { vis: "public" });
  }
  // ── shared scalar state (palettes, settings, fog, presets) ──
  setPath(path2, value) {
    this.emit({ t: "set", path: path2, value });
  }
  // ── chunks ──
  /**
   * Announce a chunk we just uploaded. Records the version first so the echo of our own
   * broadcast does not trigger a pointless refetch of pixels we already have.
   */
  announceChunk(layer, tier, cx, cy, ver) {
    this.ownChunkVersions.set(chunkKey(layer, tier, cx, cy), ver);
    this.emit({ t: "chunk", layer, tier, cx, cy, ver });
  }
  chunkVersion(layer, tier, cx, cy) {
    return this.data()?.chunkVersions[chunkKey(layer, tier, cx, cy)] ?? 0;
  }
  /**
   * Whether a chunk has ever been painted — unpainted chunks need no fetch at all.
   *
   * Every tier is authored and versioned in its own right, so this is an exact answer at any
   * tier. That matters more than it sounds: fetching unconditionally meant a 404 per layer
   * per chunk on every pan, and for a layer nobody has painted — water colour usually — that
   * is every chunk on screen.
   */
  chunkExists(layer, tier, cx, cy) {
    return this.chunkVersion(layer, tier, cx, cy) > 0;
  }
  /** Full-document save. For imports and recovery; ops cover ordinary editing. */
  async saveFull() {
    const data = this.data();
    if (!data || !this.worldName)
      return;
    await this.api.save(this.worldName, data);
  }
  snapshotOrEmpty() {
    return this.data() ?? createEmptyMapEditorData(this.worldName);
  }
  static \u0275fac = function MapEditorStoreService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MapEditorStoreService)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _MapEditorStoreService, factory: _MapEditorStoreService.\u0275fac, providedIn: "root" });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapEditorStoreService, [{
    type: Injectable,
    args: [{ providedIn: "root" }]
  }], null, null);
})();

// src/app/map-editor/map-camera.ts
var MIN_ZOOM = 0.02;
var MAX_ZOOM = 8;
var MapCamera = class {
  x = 0;
  y = 0;
  zoom = 0.25;
  /** Viewport size in CSS px. */
  viewWidth = 1;
  viewHeight = 1;
  setViewport(width, height) {
    this.viewWidth = Math.max(1, width);
    this.viewHeight = Math.max(1, height);
  }
  worldToScreen(wx, wy) {
    return {
      x: (wx - this.x) * this.zoom + this.viewWidth / 2,
      y: (wy - this.y) * this.zoom + this.viewHeight / 2
    };
  }
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.viewWidth / 2) / this.zoom + this.x,
      y: (sy - this.viewHeight / 2) / this.zoom + this.y
    };
  }
  /** Pan by a screen-pixel delta (drag), converting to world units. */
  panByScreen(dxScreen, dyScreen) {
    this.x -= dxScreen / this.zoom;
    this.y -= dyScreen / this.zoom;
  }
  /**
   * Zoom about a screen anchor, keeping the world point under the cursor pinned there —
   * without this, wheel-zoom slides the map out from under the pointer.
   */
  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.zoom = clamp(this.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    const after = this.screenToWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }
  /** World-space rectangle currently on screen, optionally grown by a world-px margin. */
  visibleBounds(margin = 0) {
    const halfW = this.viewWidth / 2 / this.zoom;
    const halfH = this.viewHeight / 2 / this.zoom;
    return {
      minX: this.x - halfW - margin,
      minY: this.y - halfH - margin,
      maxX: this.x + halfW + margin,
      maxY: this.y + halfH + margin
    };
  }
  /** Frame a world rectangle, leaving a little breathing room. */
  fitBounds(b, padding = 1.1) {
    const w = Math.max(1, b.maxX - b.minX);
    const h = Math.max(1, b.maxY - b.minY);
    this.x = (b.minX + b.maxX) / 2;
    this.y = (b.minY + b.maxY) / 2;
    this.zoom = clamp(Math.min(this.viewWidth / (w * padding), this.viewHeight / (h * padding)), MIN_ZOOM, MAX_ZOOM);
  }
  snapshot() {
    return { x: this.x, y: this.y, zoom: this.zoom };
  }
  restore(s) {
    this.x = s.x;
    this.y = s.y;
    this.zoom = clamp(s.zoom, MIN_ZOOM, MAX_ZOOM);
  }
};
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// src/app/map-editor/map-hex.ts
var HEX_RADIUS = 240;
var HEX_WIDTH = 2 * HEX_RADIUS;
var HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;
var HEX_X_SPACING = HEX_WIDTH * 0.75;
var HEX_Y_SPACING = HEX_HEIGHT;
var KM_PER_HEX = 4;
function hexToWorld(hex) {
  return {
    x: hex.q * HEX_X_SPACING,
    y: hex.r * HEX_Y_SPACING + (hex.q & 1) * (HEX_Y_SPACING / 2)
  };
}
function worldToHex(x, y) {
  const qf = 2 / 3 * x / HEX_RADIUS;
  const rf = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / HEX_RADIUS;
  const { q, r } = cubeRound(qf, rf);
  return { q, r: r + (q - (q & 1)) / 2 };
}
function cubeRound(qf, rf) {
  const sf = -qf - rf;
  let q = Math.round(qf);
  let r = Math.round(rf);
  const s = Math.round(sf);
  const dq = Math.abs(q - qf);
  const dr = Math.abs(r - rf);
  const ds = Math.abs(s - sf);
  if (dq > dr && dq > ds)
    q = -r - s;
  else if (dr > ds)
    r = -q - s;
  return { q, r };
}
function hexCorners(cx, cy, r = HEX_RADIUS) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}
function hexRangeForBounds(minX, minY, maxX, maxY) {
  return {
    minQ: Math.floor(minX / HEX_X_SPACING) - 1,
    maxQ: Math.ceil(maxX / HEX_X_SPACING) + 1,
    minR: Math.floor(minY / HEX_Y_SPACING) - 1,
    maxR: Math.ceil(maxY / HEX_Y_SPACING) + 1
  };
}

// src/app/map-editor/map-renderer.ts
var MIN_HEX_SCREEN_PX = 9;
var MAX_GRID_HEXES = 2e4;
var MapRenderer = class {
  app = new Application();
  camera = new MapCamera();
  /** Camera transform applied here; children are all in world coordinates. */
  worldRoot = new Container();
  /**
   * Open sea behind everything.
   *
   * Terrain only exists where a chunk mesh does, so any area without one showed the page
   * background instead — which is why zooming out flashed grey at the edges before the new
   * cells caught up. A backdrop in the water colour means uncovered map reads as ocean,
   * which is what it actually is, and the catch-up becomes invisible.
   */
  oceanBackdrop = new Sprite(Texture.WHITE);
  /** Terrain meshes are parented here by `TerrainView`. */
  terrainLayer = new Container();
  /** Vector content (regions, symbols, labels) lands here in later phases. */
  objectLayer = new Container();
  gridLayer = new Graphics();
  /** Brush outline / lake preview, drawn in world space above everything. */
  cursorLayer = new Container();
  showGrid = true;
  /** Grid rebuild key — avoids regenerating thousands of paths on every pan frame. */
  gridKey = "";
  /** True once the GPU context is gone; nothing will render again until a reload. */
  contextLost = false;
  onContextLost;
  async init(host, background = 1776415) {
    await this.app.init({
      resizeTo: host,
      background,
      antialias: true,
      // Painting reads back from render textures; without this the GPU cannot be trusted
      // to have preserved the drawing buffer.
      preserveDrawingBuffer: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1
    });
    host.appendChild(this.app.canvas);
    this.app.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      this.contextLost = true;
      console.error("[MapRenderer] WebGL context lost \u2014 the map cannot render until the page is reloaded.");
      this.onContextLost?.();
    });
    this.app.canvas.addEventListener("webglcontextrestored", () => {
      console.warn("[MapRenderer] WebGL context restored; reload for a clean state.");
    });
    this.app.stage.addChild(this.worldRoot);
    this.worldRoot.addChild(this.oceanBackdrop);
    this.worldRoot.addChild(this.terrainLayer);
    this.worldRoot.addChild(this.objectLayer);
    this.worldRoot.addChild(this.gridLayer);
    this.worldRoot.addChild(this.cursorLayer);
    this.camera.setViewport(this.app.screen.width, this.app.screen.height);
  }
  get renderer() {
    return this.app.renderer;
  }
  setShowGrid(show) {
    this.showGrid = show;
    this.gridLayer.visible = show;
    this.gridKey = "";
  }
  resize() {
    this.camera.setViewport(this.app.screen.width, this.app.screen.height);
  }
  /** Push camera state into the scene graph and refresh viewport-dependent overlays. */
  syncView() {
    const { zoom } = this.camera;
    this.worldRoot.scale.set(zoom);
    this.worldRoot.position.set(this.camera.viewWidth / 2 - this.camera.x * zoom, this.camera.viewHeight / 2 - this.camera.y * zoom);
    const b = this.camera.visibleBounds(this.camera.viewWidth / zoom);
    this.oceanBackdrop.position.set(b.minX, b.minY);
    this.oceanBackdrop.width = b.maxX - b.minX;
    this.oceanBackdrop.height = b.maxY - b.minY;
    this.updateGrid();
  }
  /** Keep the backdrop in step with the map's open-water colour. */
  setOceanColor(rgb) {
    this.oceanBackdrop.tint = Math.round(rgb[0] * 255) << 16 | Math.round(rgb[1] * 255) << 8 | Math.round(rgb[2] * 255);
  }
  /**
   * Rebuild the hex overlay only when the visible hex range or zoom actually changed —
   * regenerating tens of thousands of paths on every pan frame is the obvious way to make
   * this the slowest thing on screen.
   */
  updateGrid() {
    if (!this.showGrid)
      return;
    const zoom = this.camera.zoom;
    if (HEX_X_SPACING * zoom < MIN_HEX_SCREEN_PX) {
      this.gridLayer.clear();
      this.gridKey = "hidden";
      return;
    }
    const b = this.camera.visibleBounds(HEX_RADIUS * 2);
    const range = hexRangeForBounds(b.minX, b.minY, b.maxX, b.maxY);
    const key = `${range.minQ},${range.maxQ},${range.minR},${range.maxR}`;
    if (key === this.gridKey)
      return;
    this.gridKey = key;
    const count = (range.maxQ - range.minQ + 1) * (range.maxR - range.minR + 1);
    this.gridLayer.clear();
    if (count > MAX_GRID_HEXES)
      return;
    for (let q = range.minQ; q <= range.maxQ; q++) {
      for (let r = range.minR; r <= range.maxR; r++) {
        const c = hexToWorld({ q, r });
        const pts = hexCorners(c.x, c.y);
        this.gridLayer.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 6; i++)
          this.gridLayer.lineTo(pts[i].x, pts[i].y);
        this.gridLayer.closePath();
      }
    }
    this.gridLayer.stroke({ width: 1 / zoom, color: 16777215, alpha: 0.14 });
  }
  destroy() {
    this.oceanBackdrop.destroy();
    this.gridLayer.destroy();
    this.cursorLayer.destroy({ children: true });
    this.app.destroy(true, { children: true });
  }
};

// src/app/map-editor/map-diagnostics.ts
var MAX_EVENTS = 600;
var MapDiagnostics = class {
  enabled = false;
  events = [];
  started = performance.now();
  counts = /* @__PURE__ */ new Map();
  /** Per-tile fetch tally — the cheapest way to see a tile being pulled over and over. */
  fetchesPerTile = /* @__PURE__ */ new Map();
  inFlight = 0;
  log(kind, tile, detail = "") {
    if (!this.enabled)
      return;
    this.events.push({ t: Math.round(performance.now() - this.started), kind, tile, detail });
    if (this.events.length > MAX_EVENTS)
      this.events.splice(0, this.events.length - MAX_EVENTS);
    this.counts.set(kind, (this.counts.get(kind) ?? 0) + 1);
    if (kind === "fetch:start") {
      this.inFlight++;
      this.fetchesPerTile.set(tile, (this.fetchesPerTile.get(tile) ?? 0) + 1);
    } else if (kind === "fetch:done" || kind === "fetch:empty" || kind === "fetch:error") {
      this.inFlight = Math.max(0, this.inFlight - 1);
    }
  }
  /** Most recent events, newest last. */
  recent(n = 40) {
    return this.events.slice(-n);
  }
  get summary() {
    const c = (k) => this.counts.get(k) ?? 0;
    let worstTile = "";
    let worstCount = 0;
    for (const [tile, n] of this.fetchesPerTile) {
      if (n > worstCount) {
        worstCount = n;
        worstTile = tile;
      }
    }
    return [
      { label: "in flight", value: String(this.inFlight) },
      { label: "fetches", value: `${c("fetch:start")} (${c("fetch:empty")} empty)` },
      { label: "skipped (dirty)", value: String(c("fetch:skip-dirty")) },
      { label: "errors", value: String(c("fetch:error")) },
      { label: "uploads", value: `${c("upload:done")} ok / ${c("upload:fail")} fail` },
      { label: "chunks made", value: String(c("tile:create")) },
      { label: "evictions", value: String(c("tile:evict")) },
      { label: "painted", value: `${c("paint:chunk")} + ${c("paint:coarse")} coarse` },
      { label: "cells built", value: String(c("cell:build")) },
      { label: "tier changes", value: String(c("tier:change")) },
      { label: "most-fetched", value: worstCount > 1 ? `${worstTile} \xD7${worstCount}` : "\u2014" }
    ];
  }
  reset() {
    this.events = [];
    this.counts.clear();
    this.fetchesPerTile.clear();
    this.inFlight = 0;
    this.started = performance.now();
  }
  /** Dump the log to the console, for pasting somewhere readable. */
  dump() {
    const lines = this.events.map((e) => `${String(e.t).padStart(6)}ms ${e.kind.padEnd(16)} ${e.tile.padEnd(24)} ${e.detail}`);
    console.log(`[map-diag] ${this.events.length} events
${lines.join("\n")}`);
    console.table(this.summary);
  }
};
var mapDiag = new MapDiagnostics();
function tileLabel(layer, tier, cx, cy) {
  return `${layer} ${tier} ${cx},${cy}`;
}

// src/app/map-editor/chunk-manager.ts
var BYTES_PER_CELL_MB = 3;
var MAX_RESIDENT_CELLS = 124;
var MAX_STREAM_CELLS = 100;
var ChunkManager = class _ChunkManager {
  renderer;
  api;
  store;
  worldName;
  chunks = /* @__PURE__ */ new Map();
  frame = 0;
  /** Scratch container reused for every stamp, so painting allocates nothing per stroke. */
  stampHost = new Container();
  /** Raised when a chunk's pixels change from a fetch, so the view can refresh. */
  onChunkUpdated;
  /**
   * Raised when a chunk is evicted, so the view can drop anything referencing it.
   *
   * The tier is part of the identity: `cx,cy` alone names a different patch of world at
   * every tier, so a listener without it cannot tell which chunk actually went away.
   */
  onChunkDisposed;
  /**
   * Raised immediately before a chunk is painted into. The undo stack hangs off this — a
   * brush destroys the pixels it covers, so they have to be captured while they still exist.
   */
  onBeforePaint;
  constructor(renderer, api, store, worldName) {
    this.renderer = renderer;
    this.api = api;
    this.store = store;
    this.worldName = worldName;
  }
  // ── residency ──
  /** Records are keyed by tier too, so one position can hold every tier at once. */
  recKey(layer, tier, cx, cy) {
    return chunkKey(layer, tier, cx, cy);
  }
  /** Every tier is the same texture size; only the world area it covers changes. */
  texelsFor(layer) {
    return LAYER_TEXELS[layer];
  }
  /**
   * Finest tier that still fills the screen with roughly `TARGET_CHUNKS_ON_SCREEN` chunks.
   *
   * The choice — including its hysteresis, which is what stops the tier flipping on a hair
   * of zoom and rebuilding every cell — lives in the model as a pure function, so it can be
   * swept across a range of zooms in a unit test without a GPU.
   */
  tierFor(bounds) {
    return chooseTier(this.tier, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  }
  create(layer, tier, cx, cy) {
    const texels = this.texelsFor(layer);
    const texture = RenderTexture.create({
      width: texels,
      height: texels,
      scaleMode: "linear"
    });
    this.renderer.render({
      container: this.stampHost,
      target: texture,
      clear: true,
      clearColor: [0, 0, 0, 0]
    });
    const rec = {
      layer,
      cx,
      cy,
      tier,
      texture,
      loaded: false,
      dirty: false,
      uploading: false,
      lastSeen: this.frame
    };
    this.chunks.set(this.recKey(layer, tier, cx, cy), rec);
    mapDiag.log("tile:create", tileLabel(layer, tier, cx, cy));
    if (this.store.chunkExists(layer, tier, cx, cy))
      void this.fetchInto(rec);
    else
      rec.loaded = true;
    return rec;
  }
  /** Resident record for a chunk, creating and queueing a load if absent. */
  get(layer, tier, cx, cy) {
    const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
    if (rec) {
      rec.lastSeen = this.frame;
      return rec;
    }
    return this.create(layer, tier, cx, cy);
  }
  /**
   * Whether anything has ever been drawn in the stack of tiers a cell at `tier` composites.
   *
   * The terrain view uses this to skip open sea, which is most of a map: a cell there would
   * composite three transparent tiers into the ocean colour the backdrop already draws.
   *
   * Unsaved local paint counts. Checking only the document's version record would leave a
   * stroke on virgin ground invisible until its upload landed — the brush would appear to do
   * nothing for a second, on exactly the ground where you can least afford to doubt it.
   */
  hasContentUnder(tier, cx, cy) {
    const span = TIER_WORLD_SIZE[tier];
    for (const source of [tier, ...coarserTiers(tier)]) {
      const srcSpan = TIER_WORLD_SIZE[source];
      const sx = Math.floor(cx * span / srcSpan);
      const sy = Math.floor(cy * span / srcSpan);
      for (const layer of RASTER_LAYERS) {
        if (this.store.chunkExists(layer, source, sx, sy))
          return true;
        const rec = this.chunks.get(this.recKey(layer, source, sx, sy));
        if (rec && (rec.dirty || rec.uploading))
          return true;
      }
    }
    return false;
  }
  async fetchInto(rec) {
    const inflightKey = this.recKey(rec.layer, rec.tier, rec.cx, rec.cy);
    if (this.fetching.has(inflightKey))
      return;
    this.fetching.add(inflightKey);
    try {
      await this.fetchIntoInner(rec);
    } finally {
      this.fetching.delete(inflightKey);
    }
  }
  async fetchIntoInner(rec) {
    const label = tileLabel(rec.layer, rec.tier, rec.cx, rec.cy);
    const startedAt = performance.now();
    const ver = this.store.chunkVersion(rec.layer, rec.tier, rec.cx, rec.cy);
    mapDiag.log("fetch:start", label, `v${ver}`);
    const blob = await this.api.fetchChunk(this.worldName, rec.layer, rec.tier, rec.cx, rec.cy, ver);
    if (rec.dirty || rec.uploading) {
      mapDiag.log("fetch:skip-dirty", label, rec.dirty ? "painted mid-flight" : "uploading");
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
      return;
    }
    if (!blob) {
      mapDiag.log("fetch:empty", label, `${Math.round(performance.now() - startedAt)}ms`);
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
      return;
    }
    if (this.chunks.get(this.recKey(rec.layer, rec.tier, rec.cx, rec.cy)) !== rec)
      return;
    if (!this.isUsable(rec))
      return;
    try {
      const bitmap = await createImageBitmap(blob);
      const tex = Texture.from(bitmap);
      const sprite = new Sprite(tex);
      const size = this.texelsFor(rec.layer);
      sprite.setSize(size, size);
      this.stampHost.removeChildren();
      this.stampHost.blendMode = "normal";
      this.stampHost.addChild(sprite);
      this.renderer.render({
        container: this.stampHost,
        target: rec.texture,
        clear: true,
        clearColor: [0, 0, 0, 0]
      });
      this.stampHost.removeChildren();
      sprite.destroy();
      tex.destroy(true);
      rec.loaded = true;
      mapDiag.log("fetch:done", label, `${Math.round(performance.now() - startedAt)}ms`);
      this.onChunkUpdated?.(rec);
    } catch (err) {
      mapDiag.log("fetch:error", label, String(err));
      console.error("[ChunkManager] Failed to decode chunk", rec.layer, rec.tier, rec.cx, rec.cy, err);
      rec.loaded = true;
      this.onChunkUpdated?.(rec);
    }
  }
  /**
   * Ensure chunks covering the view are resident and evict distant ones.
   * Call once per frame with the camera's *unmargined* visible bounds.
   *
   * The lead is added here rather than by the caller because it has to be measured in chunks
   * of the tier this call chooses, and only this call knows which that is — the terrain view
   * then takes half as much, so what it draws is always a subset of what is streamed.
   */
  update(view) {
    this.frame++;
    const prevTier = this.tier;
    this.tier = this.tierFor(view);
    if (prevTier !== this.tier) {
      mapDiag.log("tier:change", "", `${prevTier} -> ${this.tier}`);
    }
    const margin = TIER_WORLD_SIZE[this.tier];
    const bounds = {
      minX: view.minX - margin,
      minY: view.minY - margin,
      maxX: view.maxX + margin,
      maxY: view.maxY + margin
    };
    for (const tier of [this.tier, ...coarserTiers(this.tier)]) {
      this.streamTier(tier, bounds);
    }
    this.evict();
  }
  streamTier(tier, bounds) {
    const span = TIER_WORLD_SIZE[tier];
    const minCx = Math.floor(bounds.minX / span);
    const maxCx = Math.floor(bounds.maxX / span);
    const minCy = Math.floor(bounds.minY / span);
    const maxCy = Math.floor(bounds.maxY / span);
    const wantedCells = (maxCx - minCx + 1) * (maxCy - minCy + 1);
    if (wantedCells > MAX_STREAM_CELLS) {
      for (const rec of this.chunks.values()) {
        if (rec.tier === tier && rec.cx >= minCx && rec.cx <= maxCx && rec.cy >= minCy && rec.cy <= maxCy) {
          rec.lastSeen = this.frame;
        }
      }
      return;
    }
    for (const layer of RASTER_LAYERS) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
          if (rec)
            rec.lastSeen = this.frame;
          else
            this.create(layer, tier, cx, cy);
        }
      }
    }
  }
  /**
   * Cells painted recently, and the frame they were last touched.
   *
   * A stroke can create chunks the view is not currently showing — the coarse copies it
   * writes on the way — and nothing else marks those as visible. Once a stroke flushed they
   * lost their dirty pin, were evicted immediately, and the next stroke had to re-fetch every
   * one of them, which is exactly the stutter and the chunks vanishing and coming back that
   * appears when drawing. Keeping them hot for a while means working in one area stays
   * resident regardless of what is on screen.
   *
   * The entries expire. A pin that never lifted would make every chunk ever painted in a
   * session permanently unevictable, which is the same unbounded growth the budget exists to
   * stop — just with a nicer name.
   */
  hotCells = /* @__PURE__ */ new Map();
  /** How long a painted cell stays pinned, in streamed frames. */
  static HOT_FRAMES = 600;
  /**
   * Chunks with a fetch already in flight.
   *
   * Overlapping flushes were each requesting the same chunk, so one could be pulled several
   * times in the same millisecond.
   */
  fetching = /* @__PURE__ */ new Set();
  /** Detail tier the last `update` settled on. */
  get detailTier() {
    return this.tier;
  }
  tier = "high";
  /**
   * Drop the least recently seen *cells* once over budget. Never drops unsaved work.
   *
   * Eviction is per cell rather than per texture because the terrain shader needs all three
   * layers of a position together. Ranking individual textures let a cell lose, say, its
   * land colour while keeping its height — painting height refreshes only that layer's
   * recency, so the colour aged out first — and the map then showed correctly-shaped land
   * with its colour cut off along a dead-straight chunk border.
   */
  evict() {
    const tiers = /* @__PURE__ */ new Set([this.tier]);
    for (const rec of this.chunks.values())
      tiers.add(rec.tier);
    for (const tier of tiers)
      this.evictTier(tier, MAX_RESIDENT_CELLS);
  }
  /** Enforce one tier's cell budget without disturbing the others'. */
  evictTier(tier, maxCells) {
    const budget = maxCells * RASTER_LAYERS.length;
    const ofTier = [...this.chunks.values()].filter((r) => r.tier === tier);
    if (ofTier.length <= budget)
      return;
    const cells = /* @__PURE__ */ new Map();
    for (const rec of ofTier) {
      const key = `${rec.cx}/${rec.cy}`;
      const cell = cells.get(key);
      const hot = this.isHot(rec.tier, rec.cx, rec.cy);
      const pinned = hot || rec.dirty || rec.uploading || rec.lastSeen === this.frame;
      if (cell) {
        cell.recs.push(rec);
        cell.lastSeen = Math.max(cell.lastSeen, rec.lastSeen);
        cell.pinned ||= pinned;
      } else {
        cells.set(key, { recs: [rec], lastSeen: rec.lastSeen, pinned });
      }
    }
    const candidates = [...cells.values()].filter((c) => !c.pinned).sort((a, b) => a.lastSeen - b.lastSeen);
    let excess = ofTier.length - budget;
    for (const cell of candidates) {
      if (excess <= 0)
        break;
      for (const rec of cell.recs) {
        this.dispose(rec);
        excess--;
      }
    }
    if (excess > 0 && !this.warnedOverBudget) {
      this.warnedOverBudget = true;
      console.warn(`[ChunkManager] over residency budget at tier ${tier}: ${ofTier.length} chunks (~${Math.round(ofTier.length / RASTER_LAYERS.length * BYTES_PER_CELL_MB)} MB) and none evictable. Lower MAX_STREAM_CELLS or the layer resolution.`);
    }
  }
  warnedOverBudget = false;
  hotKey(tier, cx, cy) {
    return `${tier}/${cx}/${cy}`;
  }
  /** Whether a cell was painted recently enough to still be pinned; forgets it if not. */
  isHot(tier, cx, cy) {
    const key = this.hotKey(tier, cx, cy);
    const at = this.hotCells.get(key);
    if (at === void 0)
      return false;
    if (this.frame - at <= _ChunkManager.HOT_FRAMES)
      return true;
    this.hotCells.delete(key);
    return false;
  }
  dispose(rec) {
    this.chunks.delete(this.recKey(rec.layer, rec.tier, rec.cx, rec.cy));
    mapDiag.log("tile:evict", tileLabel(rec.layer, rec.tier, rec.cx, rec.cy));
    this.onChunkDisposed?.(rec.layer, rec.tier, rec.cx, rec.cy);
    rec.destroyed = true;
    rec.texture.destroy(true);
  }
  /**
   * Whether a chunk's texture can still be read.
   *
   * A destroyed texture — or one whose backing source vanished with a lost WebGL context —
   * leaves `source` null, and every read path then throws deep inside the renderer. Checking
   * here turns that into a skipped operation instead of a crash that takes the editor down.
   */
  isUsable(rec) {
    return !rec.destroyed && !!rec.texture?.source;
  }
  // ── painting ──
  /**
   * Stamp a world-positioned display object into `tier` and every coarser tier it covers.
   *
   * `node` is expressed in world coordinates; `stamp` applies each target chunk's own
   * transform into its texel space, so the same brush lands correctly at every tier and
   * callers never deal with chunk math. Set `node.blendMode` to `'erase'` to subtract.
   *
   * Writing the coarse copies here, in the stroke, is the whole design: it is what makes the
   * tiers consistent by construction, so zooming out needs no derived tiles and the server
   * never rebuilds anything. Finer tiers are deliberately *not* touched — see `coarserTiers`.
   */
  paintWorld(layer, node, bounds, tier) {
    const touched = [];
    this.stampHost.removeChildren();
    this.stampHost.addChild(node);
    for (const target of [tier, ...coarserTiers(tier)]) {
      const span = TIER_WORLD_SIZE[target];
      const minCx = Math.floor(bounds.minX / span);
      const maxCx = Math.floor(bounds.maxX / span);
      const minCy = Math.floor(bounds.minY / span);
      const maxCy = Math.floor(bounds.maxY / span);
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const rec = this.get(layer, target, cx, cy);
          this.onBeforePaint?.(rec);
          this.stamp(rec);
          rec.dirty = true;
          touched.push(rec);
          this.hotCells.set(this.hotKey(target, cx, cy), this.frame);
          mapDiag.log(target === tier ? "paint:chunk" : "paint:coarse", tileLabel(layer, target, cx, cy));
        }
      }
    }
    this.stampHost.removeChildren();
    return touched;
  }
  /** Render the current stamp host into one chunk, in that chunk's own texel space. */
  stamp(rec) {
    const span = TIER_WORLD_SIZE[rec.tier];
    const s = this.texelsFor(rec.layer) / span;
    const m = new Matrix(s, 0, 0, s, -rec.cx * span * s, -rec.cy * span * s);
    this.renderer.render({
      container: this.stampHost,
      target: rec.texture,
      clear: false,
      transform: m
    });
  }
  /**
   * Read a single texel of a layer at a world position.
   *
   * Used to colour `sample_color` symbols from the ground actually beneath them, which is
   * what Wonderdraft does — taking a global land colour instead would be visibly wrong
   * wherever the map has been painted more than one shade.
   *
   * Takes the finest tier that is actually resident here, which is normally `high`. The
   * fallback matters now that terrain can be *drawn* zoomed out: a continent painted at
   * `low` has no `high` chunks at all, and without this every symbol placed on it would come
   * back unpainted and fall through to white.
   *
   * This is a GPU readback and therefore a stall, so it must stay on discrete actions
   * (placing or moving a symbol), never anything per-frame.
   *
   * Returns null where nothing has been painted, so callers can fall back.
   */
  sampleWorld(layer, x, y) {
    for (const tier of TIERS) {
      const hit = this.sampleTier(layer, tier, x, y);
      if (hit)
        return hit;
    }
    return null;
  }
  sampleTier(layer, tier, x, y) {
    const span = TIER_WORLD_SIZE[tier];
    const cx = Math.floor(x / span);
    const cy = Math.floor(y / span);
    const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
    if (!rec || !rec.loaded || !this.isUsable(rec))
      return null;
    const texels = LAYER_TEXELS[layer];
    const s = texels / span;
    const tx = Math.floor((x - cx * span) * s);
    const ty = Math.floor((y - cy * span) * s);
    if (tx < 0 || ty < 0 || tx >= texels || ty >= texels)
      return null;
    try {
      const out = this.renderer.extract.pixels({
        target: rec.texture,
        frame: new Rectangle(tx, ty, 1, 1)
      });
      const pixels = out?.pixels;
      if (!pixels)
        return null;
      const w = out.width || 1;
      const i = w === 1 ? 0 : (ty * w + tx) * 4;
      if (i + 3 >= pixels.length)
        return null;
      if (pixels[i + 3] < 8)
        return null;
      return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
    } catch (err) {
      console.error("[ChunkManager] sampleWorld failed", err);
      return null;
    }
  }
  /**
   * Copy a chunk's pixels into an independent texture, for the undo stack.
   *
   * Deliberately not `extract.texture()`: given a Texture that returns *the same object*
   * back rather than a copy. The undo stack then held the live chunk, so restoring blitted
   * a texture into itself — the "feedback loop between framebuffer and active texture" GL
   * error — and its memory trim destroyed live map chunks, cutting holes in the map.
   *
   * Rendering through a fresh RenderTexture is the only way to be sure the pixels are
   * genuinely detached from the chunk they came from.
   */
  snapshot(rec) {
    if (!this.isUsable(rec))
      return null;
    const texels = LAYER_TEXELS[rec.layer];
    let copy = null;
    try {
      copy = RenderTexture.create({ width: texels, height: texels, scaleMode: "linear" });
      const sprite = new Sprite(rec.texture);
      sprite.setSize(texels, texels);
      this.stampHost.removeChildren();
      this.stampHost.blendMode = "normal";
      this.stampHost.addChild(sprite);
      this.renderer.render({
        container: this.stampHost,
        target: copy,
        clear: true,
        clearColor: [0, 0, 0, 0]
      });
      this.stampHost.removeChildren();
      sprite.destroy();
      return copy;
    } catch (err) {
      console.error("[ChunkManager] snapshot failed", err);
      copy?.destroy(true);
      return null;
    }
  }
  /** Restore a snapshot taken by `snapshot`, marking the chunk dirty for re-upload. */
  restore(layer, tier, cx, cy, snap) {
    const rec = this.get(layer, tier, cx, cy);
    if (!this.isUsable(rec) || !snap?.source)
      return;
    if (snap.source === rec.texture.source)
      return;
    const sprite = new Sprite(snap);
    sprite.setSize(LAYER_TEXELS[layer], LAYER_TEXELS[layer]);
    this.stampHost.removeChildren();
    this.stampHost.blendMode = "normal";
    this.stampHost.addChild(sprite);
    this.renderer.render({
      container: this.stampHost,
      target: rec.texture,
      clear: true,
      clearColor: [0, 0, 0, 0]
    });
    this.stampHost.removeChildren();
    sprite.destroy();
    rec.dirty = true;
    this.onChunkUpdated?.(rec);
  }
  // ── persistence ──
  /**
   * Upload every dirty chunk and announce the new versions.
   *
   * Callers debounce this to stroke end — encoding a PNG per chunk is far too expensive to
   * do per pointer move.
   */
  async flushDirty() {
    if (this.flushing) {
      this.flushAgain = true;
      return;
    }
    this.flushing = true;
    try {
      await this.flushOnce();
    } finally {
      this.flushing = false;
    }
    if (this.flushAgain) {
      this.flushAgain = false;
      await this.flushDirty();
    }
  }
  flushing = false;
  flushAgain = false;
  async flushOnce() {
    const dirty = [...this.chunks.values()].filter((r) => r.dirty && !r.uploading);
    if (dirty.length === 0)
      return;
    const BATCH = 3;
    for (let i = 0; i < dirty.length; i += BATCH) {
      await Promise.all(dirty.slice(i, i + BATCH).map((rec) => this.uploadChunk(rec)));
      if (i + BATCH < dirty.length)
        await new Promise((r) => setTimeout(r, 0));
    }
  }
  async uploadChunk(rec) {
    if (!rec.dirty || rec.uploading || !this.isUsable(rec))
      return;
    const label = tileLabel(rec.layer, rec.tier, rec.cx, rec.cy);
    mapDiag.log("upload:start", label);
    rec.uploading = true;
    rec.dirty = false;
    try {
      const blob = await this.toBlob(rec);
      if (!blob) {
        rec.dirty = true;
        return;
      }
      const ver = await this.api.putChunk(this.worldName, rec.layer, rec.tier, rec.cx, rec.cy, blob);
      if (ver == null) {
        rec.dirty = true;
        return;
      }
      mapDiag.log("upload:done", label, `v${ver}`);
      this.store.announceChunk(rec.layer, rec.tier, rec.cx, rec.cy, ver);
    } catch (err) {
      mapDiag.log("upload:fail", label, String(err));
      console.error("[ChunkManager] Chunk flush failed", rec.layer, rec.tier, rec.cx, rec.cy, err);
      rec.dirty = true;
    } finally {
      rec.uploading = false;
    }
  }
  async toBlob(rec) {
    if (!this.isUsable(rec))
      return null;
    const canvas = this.renderer.extract.canvas({ target: rec.texture });
    if (typeof canvas.convertToBlob === "function") {
      return canvas.convertToBlob({ type: "image/png" });
    }
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  }
  /**
   * Another client changed this chunk — refetch it if we have it resident.
   *
   * Exactly one chunk, at one tier. There is no ancestry to walk: the other client's stroke
   * wrote its own coarse copies and announced each of them separately, so every affected
   * chunk arrives here on its own.
   */
  invalidate(layer, tier, cx, cy) {
    const rec = this.chunks.get(this.recKey(layer, tier, cx, cy));
    if (rec && !rec.dirty && !rec.uploading)
      void this.fetchInto(rec);
  }
  hasPendingWork() {
    return [...this.chunks.values()].some((r) => r.dirty || r.uploading);
  }
  destroy() {
    for (const rec of [...this.chunks.values()])
      this.dispose(rec);
    this.chunks.clear();
    this.hotCells.clear();
    this.stampHost.destroy();
  }
};

// src/app/map-editor/terrain-view.ts
var vertex = (
  /* glsl */
  `
in vec2 aPosition;
in vec2 aUV;

out vec2 vUV;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {
    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
    vUV = aUV;
}
`
);
var fragment = (
  /* glsl */
  `
in vec2 vUV;
out vec4 finalColor;

/*
 * Three tiers \xD7 three layers.
 *
 * A tier this cell does not sample \u2014 one finer than the cell's own \u2014 is bound to a 1\xD71
 * transparent texture and contributes nothing to the composite, so the shader needs no
 * branch for "how many tiers are live".
 */
uniform sampler2D uHeightHigh;
uniform sampler2D uHeightMed;
uniform sampler2D uHeightLow;
uniform sampler2D uLandHigh;
uniform sampler2D uLandMed;
uniform sampler2D uLandLow;
uniform sampler2D uWaterHigh;
uniform sampler2D uWaterMed;
uniform sampler2D uWaterLow;

uniform sampler2D uPaper;

uniform vec3 uLandDefault;
uniform vec3 uWaterDefault;
uniform float uEdge;          // half-width of the coastline band, in height units
uniform float uPaperOpacity;
uniform float uPaperScale;    // world px covered by one paper tile
uniform vec2 uChunkOrigin;    // world position of this cell's top-left corner
uniform float uTileSpan;      // world px this cell covers; varies by tier

/*
 * Where this cell sits inside each tier's chunk texture: (offsetX, offsetY, scale).
 *
 * A coarser chunk covers 8\xD7 or 64\xD7 this cell's span, so the cell reads a sub-rect of it.
 * The cell's own tier is always (0, 0, 1).
 */
uniform vec3 uUVHigh;
uniform vec3 uUVMed;
uniform vec3 uUVLow;

uniform float uNoiseScale;    // world px per noise cell
uniform float uNoiseAmount;   // how far the coastline wanders
uniform float uShoreWidth;    // inland band lightened along the coast
uniform float uShoreLight;    // strength of that lightening
uniform float uShadowWidth;   // offshore band darkened beneath land
uniform float uShadowStrength;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

/** Value noise with a smooth (cubic) interpolant \u2014 cheap and adequate for a coastline. */
float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/** Four octaves: big bays from the low ones, fine crenulation from the high ones. */
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

/** Position inside one tier's chunk texture. */
vec2 tierUV(vec3 rect) {
    return rect.xy + vUV * rect.z;
}

/**
 * Straight-alpha "over": the top layer composited onto the one under it.
 *
 * Alpha is coverage on every layer \u2014 and on the height layer it is the terrain height
 * itself \u2014 so one operator serves all three. RGB is weighted by coverage and taken in
 * premultiplied space, because mixing a transparent texel's stale colour in unweighted would
 * drag fringes of arbitrary colour along every coastline.
 */
vec4 over(vec4 under, vec4 top) {
    float a = top.a + under.a * (1.0 - top.a);
    if (a <= 0.0) return vec4(0.0);
    vec3 rgb = (top.rgb * top.a + under.rgb * under.a * (1.0 - top.a)) / a;
    return vec4(rgb, a);
}

/**
 * Land/water mix.
 *
 * The drippy Wonderdraft edge comes from perturbing the *threshold* with world-space noise
 * rather than warping the sample position. Warping the lookup would push reads outside the
 * chunk's own texture near its borders, where clamping would straighten the coast into a
 * visible seam every chunk. Evaluating the noise in world space instead is continuous
 * across chunks by construction, so the coastline wanders freely with no seams at all.
 *
 * Because h has a gradient near the shore, shifting the threshold displaces the edge \u2014 the
 * visual result is close to domain warping, without its boundary problem.
 */
float coastline(float h, vec2 worldPos, out float shore) {
    float n = fbm(worldPos / max(1.0, uNoiseScale)) - 0.5;
    float th = 0.5 + n * uNoiseAmount;

    shore = smoothstep(th, th + uShoreWidth, h);
    return smoothstep(th - uEdge, th + uEdge, h);
}

void main() {
    vec2 uvHigh = tierUV(uUVHigh);
    vec2 uvMed  = tierUV(uUVMed);
    vec2 uvLow  = tierUV(uUVLow);

    // Coarse under, fine on top \u2014 the read rule of the authored tiers. This runs *before*
    // the coastline logic, so everything below sees one resolved height and colour.
    vec4 hc = over(over(texture(uHeightLow, uvLow), texture(uHeightMed, uvMed)),
                   texture(uHeightHigh, uvHigh));
    vec4 lc = over(over(texture(uLandLow, uvLow), texture(uLandMed, uvMed)),
                   texture(uLandHigh, uvHigh));
    vec4 wc = over(over(texture(uWaterLow, uvLow), texture(uWaterMed, uvMed)),
                   texture(uWaterHigh, uvHigh));

    float h = hc.a;

    // Colour is baked when terrain is drawn, so these fallbacks are constants rather than
    // adjustable "theme" colours: changing a global default would retroactively repaint
    // ground the user already coloured deliberately. Land falls back to white \u2014 a freshly
    // drawn landmass is blank paper to be coloured, not a preset green.
    vec3 land  = mix(uLandDefault,  lc.rgb, lc.a);
    vec3 water = mix(uWaterDefault, wc.rgb, wc.a);

    vec2 worldPos = uChunkOrigin + vUV * uTileSpan;

    float shore;
    float isLand = coastline(h, worldPos, shore);

    // A lighter rim just inland reads as the sand/shelf line along the coast.
    land = mix(land * (1.0 + uShoreLight), land, shore);

    // Land casts a soft shadow onto the water it sits in.
    float shadow = smoothstep(0.5 - uShadowWidth, 0.5, h) * (1.0 - isLand);
    water *= 1.0 - shadow * uShadowStrength;

    vec3 col = mix(water, land, isLand);

    // Paper grain is sampled in world space so it stays seamless across chunk borders.
    vec3 paper = texture(uPaper, worldPos / uPaperScale).rgb;
    col *= mix(vec3(1.0), paper, uPaperOpacity);

    finalColor = vec4(col, 1.0);
}
`
);
function defaultCoast() {
  return {
    noiseScale: 1600,
    noiseAmount: 0.35,
    shoreWidth: 0.12,
    shoreLight: 0.18,
    shadowWidth: 0.22,
    shadowStrength: 0.35
  };
}
var MAX_TERRAIN_CELLS = 160;
var sharedProgram = null;
function program() {
  sharedProgram ??= GlProgram.from({ vertex, fragment, name: "map-terrain" });
  return sharedProgram;
}
var sharedEmpty = null;
function emptyTexture() {
  if (!sharedEmpty) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext("2d");
    sharedEmpty = Texture.from(canvas);
  }
  return sharedEmpty;
}
function quad() {
  return new Geometry({
    attributes: {
      aPosition: [0, 0, 1, 0, 1, 1, 0, 1],
      aUV: [0, 0, 1, 0, 1, 1, 0, 1]
    },
    indexBuffer: [0, 1, 2, 0, 2, 3]
  });
}
var LAYER_UNIFORM = {
  height: "uHeight",
  landColor: "uLand",
  waterColor: "uWater"
};
var TIER_UNIFORM = {
  high: "High",
  med: "Med",
  low: "Low"
};
var TerrainView = class {
  chunks;
  /** Parent this in the camera-transformed world container. */
  container = new Container();
  /** Debug overlay: cell bounds and which tier each one is drawing at. */
  debugLayer = new Container();
  debugGraphics = new Graphics();
  debugLabels = [];
  debug = false;
  cells = /* @__PURE__ */ new Map();
  geometry = quad();
  /** Freshly drawn land is white; the land brush bakes real colour as it paints. */
  landDefault = [1, 1, 1];
  /** Open sea still needs *a* colour — it is the canvas nothing has been drawn on yet. */
  waterDefault = [0.25, 0.43, 0.55];
  paper = Texture.WHITE;
  paperOpacity = 0;
  paperScale = 1024;
  edge = 0.08;
  /** Coastline character. Defaults are a starting point; the Karte tab tunes them. */
  coast = defaultCoast();
  constructor(chunks) {
    this.chunks = chunks;
    this.debugLayer.addChild(this.debugGraphics);
    this.container.addChild(this.debugLayer);
    this.debugLayer.visible = false;
    this.chunks.onChunkDisposed = (_layer, tier, cx, cy) => this.dropReferencing(tier, cx, cy);
  }
  // ── appearance ──
  setLandDefault(rgb) {
    this.landDefault = rgb;
    this.refreshUniforms();
  }
  setWaterDefault(rgb) {
    this.waterDefault = rgb;
    this.refreshUniforms();
  }
  setPaper(texture, opacity, scale) {
    this.paper = texture ?? Texture.WHITE;
    this.paperOpacity = texture ? opacity : 0;
    this.paperScale = Math.max(1, scale);
    for (const key of [...this.cells.keys()]) {
      const c = this.cells.get(key);
      this.destroyCell(c);
      this.cells.delete(key);
    }
  }
  setEdgeSoftness(edge) {
    this.edge = Math.max(1e-3, edge);
    this.refreshUniforms();
  }
  setCoast(coast) {
    this.coast = __spreadValues(__spreadValues({}, this.coast), coast);
    this.refreshUniforms();
  }
  get coastSettings() {
    return __spreadValues({}, this.coast);
  }
  refreshUniforms() {
    for (const cell of this.cells.values()) {
      const u = cell.uniforms.uniforms;
      u["uLandDefault"] = this.landDefault;
      u["uWaterDefault"] = this.waterDefault;
      u["uEdge"] = this.edge;
      u["uPaperOpacity"] = this.paperOpacity;
      u["uPaperScale"] = this.paperScale;
      u["uNoiseScale"] = this.coast.noiseScale;
      u["uNoiseAmount"] = this.coast.noiseAmount;
      u["uShoreWidth"] = this.coast.shoreWidth;
      u["uShoreLight"] = this.coast.shoreLight;
      u["uShadowWidth"] = this.coast.shadowWidth;
      u["uShadowStrength"] = this.coast.shadowStrength;
    }
  }
  // ── cells ──
  key(tier, cx, cy) {
    return `${tier}/${cx}/${cy}`;
  }
  /** Chunk of `tier` containing this cell, and where the cell sits inside its texture. */
  placement(cx, cy, tier, source) {
    const span = TIER_WORLD_SIZE[tier];
    const srcSpan = TIER_WORLD_SIZE[source];
    const ref = {
      cx: Math.floor(cx * span / srcSpan),
      cy: Math.floor(cy * span / srcSpan)
    };
    return {
      ref,
      uv: [
        (cx * span - ref.cx * srcSpan) / srcSpan,
        (cy * span - ref.cy * srcSpan) / srcSpan,
        span / srcSpan
      ]
    };
  }
  build(cx, cy, tier) {
    const span = TIER_WORLD_SIZE[tier];
    const sampled = [tier, ...coarserTiers(tier)];
    const uniformValues = {
      uLandDefault: { value: this.landDefault, type: "vec3<f32>" },
      uWaterDefault: { value: this.waterDefault, type: "vec3<f32>" },
      uEdge: { value: this.edge, type: "f32" },
      uPaperOpacity: { value: this.paperOpacity, type: "f32" },
      uPaperScale: { value: this.paperScale, type: "f32" },
      uChunkOrigin: { value: [cx * span, cy * span], type: "vec2<f32>" },
      uTileSpan: { value: span, type: "f32" },
      uNoiseScale: { value: this.coast.noiseScale, type: "f32" },
      uNoiseAmount: { value: this.coast.noiseAmount, type: "f32" },
      uShoreWidth: { value: this.coast.shoreWidth, type: "f32" },
      uShoreLight: { value: this.coast.shoreLight, type: "f32" },
      uShadowWidth: { value: this.coast.shadowWidth, type: "f32" },
      uShadowStrength: { value: this.coast.shadowStrength, type: "f32" }
    };
    const resources = {
      uPaper: this.paper.source,
      uPaperSampler: this.paper.source.style
    };
    const refs = {};
    const bound = {};
    for (const source of TIERS) {
      const suffix = TIER_UNIFORM[source];
      if (!sampled.includes(source)) {
        uniformValues[`uUV${suffix}`] = { value: [0, 0, 1], type: "vec3<f32>" };
        for (const layer of RASTER_LAYERS) {
          const empty = emptyTexture();
          resources[`${LAYER_UNIFORM[layer]}${suffix}`] = empty.source;
          resources[`${LAYER_UNIFORM[layer]}${suffix}Sampler`] = empty.source.style;
        }
        continue;
      }
      const { ref, uv } = this.placement(cx, cy, tier, source);
      uniformValues[`uUV${suffix}`] = { value: uv, type: "vec3<f32>" };
      refs[source] = ref;
      for (const layer of RASTER_LAYERS) {
        const texture = this.chunks.get(layer, source, ref.cx, ref.cy).texture;
        resources[`${LAYER_UNIFORM[layer]}${suffix}`] = texture.source;
        resources[`${LAYER_UNIFORM[layer]}${suffix}Sampler`] = texture.source.style;
        if (layer === "height")
          bound[source] = texture;
      }
    }
    const uniforms = new UniformGroup(uniformValues);
    resources["terrainUniforms"] = uniforms;
    const shader = new Shader({ glProgram: program(), resources });
    const mesh = new Mesh({ geometry: this.geometry, shader });
    mesh.position.set(cx * span, cy * span);
    mesh.scale.set(span);
    const cell = { cx, cy, tier, refs, mesh, uniforms, bound };
    this.container.addChild(mesh);
    this.cells.set(this.key(tier, cx, cy), cell);
    mapDiag.log("cell:build", tileLabel("terrain", tier, cx, cy));
    return cell;
  }
  destroyCell(cell) {
    this.container.removeChild(cell.mesh);
    const shader = cell.mesh.shader;
    cell.mesh.destroy({ children: true });
    shader?.destroy(false);
  }
  /**
   * Forget every cell drawing from a chunk that was just evicted.
   *
   * A coarse chunk backs many cells at once — one `low` chunk covers 4096 `high` cells — so
   * this cannot simply address the cell of the same coordinates. Each cell records which
   * chunk it reads at each tier, and all the matches go.
   */
  dropReferencing(tier, cx, cy) {
    for (const [key, cell] of [...this.cells]) {
      const ref = cell.refs[tier];
      if (!ref || ref.cx !== cx || ref.cy !== cy)
        continue;
      mapDiag.log("cell:drop", tileLabel("terrain", cell.tier, cell.cx, cell.cy));
      this.destroyCell(cell);
      this.cells.delete(key);
    }
  }
  /**
   * Rebuild the visible set of cells. Call once per frame with the camera bounds.
   *
   * Every cell is a mesh with its own shader binding ten textures, so the count has to be
   * bounded: zoomed far out the view can span hundreds of cells, and building all of them
   * is what made a wide zoom crawl. Past the cap only the cells nearest the middle of the
   * screen are drawn, which is where the eye is, and the ocean backdrop covers the rest.
   *
   * Takes the camera's *unmargined* bounds and adds half a chunk of lead itself, so a cell
   * exists just before it scrolls into view. Half, deliberately: the streamer's lead is a
   * whole chunk, and drawing must never reach past what has been streamed.
   */
  update(view, tier = "high", zoom = 1) {
    const span = TIER_WORLD_SIZE[tier];
    const lead = span * 0.5;
    const minCx = Math.floor((view.minX - lead) / span);
    const maxCx = Math.floor((view.maxX + lead) / span);
    const minCy = Math.floor((view.minY - lead) / span);
    const maxCy = Math.floor((view.maxY + lead) / span);
    const spanX = maxCx - minCx + 1;
    const spanY = maxCy - minCy + 1;
    const cap = MAX_TERRAIN_CELLS;
    let wanted = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++)
        wanted.push({ cx, cy });
    }
    if (spanX * spanY > cap) {
      const midX = (minCx + maxCx) / 2;
      const midY = (minCy + maxCy) / 2;
      wanted.sort((a, b) => (a.cx - midX) ** 2 + (a.cy - midY) ** 2 - ((b.cx - midX) ** 2 + (b.cy - midY) ** 2));
      wanted = wanted.slice(0, cap);
    }
    const live = /* @__PURE__ */ new Set();
    for (const { cx, cy } of wanted) {
      if (!this.chunks.hasContentUnder(tier, cx, cy))
        continue;
      const key = this.key(tier, cx, cy);
      live.add(key);
      const cell = this.cells.get(key);
      if (!cell) {
        this.build(cx, cy, tier);
        continue;
      }
      let stale = false;
      for (const [source, ref] of Object.entries(cell.refs)) {
        const texture = this.chunks.get("height", source, ref.cx, ref.cy).texture;
        if (cell.bound[source] !== texture)
          stale = true;
      }
      if (stale) {
        this.destroyCell(cell);
        this.cells.delete(key);
        this.build(cx, cy, tier);
      }
    }
    for (const [key, cell] of [...this.cells]) {
      if (live.has(key))
        continue;
      this.destroyCell(cell);
      this.cells.delete(key);
    }
    if (this.debug)
      this.drawDebug(zoom);
  }
  /**
   * Outline every live cell and label the tier it is drawing at.
   *
   * Seeing the active tier directly is the difference between "a square looked wrong" and
   * "that stroke went into `med` while the view is on `high`" — the second is a bug report,
   * the first is a guess.
   */
  drawDebug(zoom) {
    const g = this.debugGraphics;
    g.clear();
    let i = 0;
    for (const cell of this.cells.values()) {
      const span = TIER_WORLD_SIZE[cell.tier];
      const x = cell.cx * span;
      const y = cell.cy * span;
      g.rect(x, y, span, span);
      g.stroke({ width: 2 / zoom, color: 4247648, alpha: 0.9 });
      const label = this.debugLabels[i] ?? this.makeLabel();
      this.debugLabels[i] = label;
      label.text = `${cell.tier}  ${cell.cx},${cell.cy}`;
      label.style.fill = "#40d060";
      label.position.set(x + 8 / zoom, y + 8 / zoom);
      label.scale.set(1 / zoom);
      label.visible = true;
      i++;
    }
    for (let k = i; k < this.debugLabels.length; k++)
      this.debugLabels[k].visible = false;
  }
  makeLabel() {
    const t = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 16, fill: "#fff" } });
    this.debugLayer.addChild(t);
    return t;
  }
  setDebug(on) {
    this.debug = on;
    this.debugLayer.visible = on;
    if (!on) {
      this.debugGraphics.clear();
      for (const l of this.debugLabels)
        l.visible = false;
    }
  }
  destroy() {
    for (const cell of this.cells.values())
      this.destroyCell(cell);
    this.cells.clear();
    for (const l of this.debugLabels)
      l.destroy();
    this.debugLabels = [];
    this.geometry.destroy();
    this.container.destroy();
  }
};
function hexToRgb(hex, fallback) {
  const n = Number.parseInt((hex || "").replace("#", ""), 16);
  if (Number.isNaN(n))
    return fallback;
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}

// src/app/map-editor/brush-engine.ts
function toolLayer(tool) {
  if (tool === "landPaint")
    return "landColor";
  if (tool === "waterPaint")
    return "waterColor";
  return "height";
}
function paintPasses(tool, color) {
  switch (tool) {
    case "landBrush":
      return [{ layer: "height", erase: false, tint: 16777215 }];
    case "landEraser":
      return [
        { layer: "height", erase: true, tint: 16777215 },
        { layer: "landColor", erase: true, tint: 16777215 }
      ];
    case "waterBrush":
      return [{ layer: "height", erase: true, tint: 16777215 }];
    case "lakeStamp":
      return [{ layer: "height", erase: true, tint: 16777215 }];
    // Raise/lower reshape the coastline without touching colour already laid down.
    case "heighten":
      return [{ layer: "height", erase: false, tint: 16777215 }];
    case "lower":
      return [{ layer: "height", erase: true, tint: 16777215 }];
    case "landPaint":
      return [{ layer: "landColor", erase: false, tint: color }];
    case "waterPaint":
      return [{ layer: "waterColor", erase: false, tint: color }];
  }
}
function toolIsNoisy(tool) {
  return tool === "heighten" || tool === "lower";
}
var DAB_TEXELS = 256;
var DabCache = class {
  renderer;
  cache = /* @__PURE__ */ new Map();
  constructor(renderer) {
    this.renderer = renderer;
  }
  get(softness) {
    const key = softness.toFixed(2);
    const hit = this.cache.get(key);
    if (hit)
      return hit;
    const r = DAB_TEXELS / 2;
    const g = new Graphics();
    const steps = 24;
    const solid = 1 - Math.min(0.95, Math.max(0, softness));
    for (let i = steps; i >= 1; i--) {
      const t = i / steps;
      const a = t <= solid ? 1 : 1 - (t - solid) / Math.max(1e-3, 1 - solid);
      g.circle(r, r, r * t).fill({ color: 16777215, alpha: a * a });
    }
    const texture = this.renderer.generateTexture({ target: g, resolution: 1 });
    g.destroy();
    this.cache.set(key, texture);
    return texture;
  }
  destroy() {
    for (const t of this.cache.values())
      t.destroy(true);
    this.cache.clear();
  }
};
function defaultBrush() {
  return {
    tool: "landBrush",
    size: 400,
    softness: 0.35,
    strength: 1,
    color: "#ffffff",
    noise: 0.6
  };
}
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967295;
  };
}
var BrushEngine = class {
  chunks;
  dabs;
  /** Reused stamp host, so a stroke allocates nothing per sample. */
  host = new Container();
  /** Sprite pool for stamps; the noisy brushes need several per dab. */
  pool = [];
  lastPoint = null;
  /** Chunks touched by the current stroke, for the undo snapshot and the flush. */
  strokeTouched = /* @__PURE__ */ new Set();
  constructor(chunks, renderer) {
    this.chunks = chunks;
    this.dabs = new DabCache(renderer);
  }
  /** Borrow a pooled stamp sprite, growing the pool only as far as a dab actually needs. */
  take(index, texture) {
    let s = this.pool[index];
    if (!s) {
      s = new Sprite();
      s.anchor.set(0.5);
      this.pool[index] = s;
    }
    s.texture = texture;
    this.host.addChild(s);
    return s;
  }
  beginStroke() {
    this.lastPoint = null;
    this.strokeTouched.clear();
  }
  /** Chunks the just-finished stroke wrote to. */
  endStroke() {
    const touched = [...this.strokeTouched];
    this.lastPoint = null;
    this.strokeTouched.clear();
    return touched;
  }
  /**
   * Apply the brush from the last sample to this one.
   *
   * Spacing is a quarter of the brush radius: dense enough that overlapping dabs read as a
   * continuous stroke, sparse enough not to stack alpha into a hard-edged blob.
   *
   * `tier` is the detail tier the stroke lands on — normally whatever the view settled on,
   * so a continent drawn zoomed out costs one or two chunks instead of three hundred. The
   * chunk manager writes the coarser tiers from the same node; nothing here has to know.
   */
  stroke(p, brush, tier) {
    const from = this.lastPoint ?? p;
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const dist = Math.hypot(dx, dy);
    const spacing = Math.max(1, brush.size * 0.25);
    const steps = Math.max(1, Math.ceil(dist / spacing));
    for (let i = 1; i <= steps; i++) {
      const t = steps === 0 ? 1 : i / steps;
      this.dab({ x: from.x + dx * t, y: from.y + dy * t }, brush, tier);
    }
    this.lastPoint = p;
  }
  /** Single stamp at a point, applying every raster pass the tool performs. */
  dab(p, brush, tier) {
    const color = parseHex(brush.color);
    const r = brush.size;
    const bounds = { minX: p.x - r, minY: p.y - r, maxX: p.x + r, maxY: p.y + r };
    for (const pass of paintPasses(brush.tool, color)) {
      this.host.removeChildren();
      if (toolIsNoisy(brush.tool)) {
        this.buildNoisyDab(p, brush, pass.tint);
      } else {
        const s = this.take(0, this.dabs.get(brush.softness));
        s.position.set(p.x, p.y);
        s.scale.set(brush.size * 2 / DAB_TEXELS);
        s.alpha = brush.strength;
        s.tint = pass.tint;
      }
      this.host.blendMode = pass.erase ? "erase" : "normal";
      for (const rec of this.chunks.paintWorld(pass.layer, this.host, bounds, tier)) {
        this.strokeTouched.add(rec);
      }
    }
    this.host.removeChildren();
  }
  /**
   * Heighten/lower dab: a cluster of smaller offset dabs rather than one clean circle.
   *
   * Wonderdraft's raise/lower tools produce a ragged, droopy edge. Perturbing the stamp
   * itself gets most of that character now; Phase 5's coastline shader supplies the rest.
   */
  buildNoisyDab(p, brush, tint) {
    const rand = seeded(Math.round(p.x) * 73856093 ^ Math.round(p.y) * 19349663);
    const texture = this.dabs.get(Math.max(0.4, brush.softness));
    const noise = Math.max(0, Math.min(1, brush.noise ?? 0.6));
    const blobs = Math.max(1, Math.round(4 + noise * 14));
    const scatter = 0.2 + noise * 1.15;
    const minSize = 0.75 - noise * 0.6;
    for (let i = 0; i < blobs; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * brush.size * scatter;
      const size = brush.size * (minSize + rand() * (1 - minSize));
      const s = this.take(i, texture);
      s.position.set(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist);
      s.scale.set(size * 2 / DAB_TEXELS);
      s.alpha = brush.strength * 0.9 / Math.sqrt(blobs);
      s.tint = tint;
    }
  }
  /** See `lakeOutline`. Exposed on the engine so the cursor preview can call it directly. */
  lakeOutline(cx, cy, radius, seed) {
    return lakeOutline(cx, cy, radius, seed);
  }
  /**
   * Carve a lake into the height field.
   *
   * Two things make this read as water rather than as a cut-out shape:
   *
   * The edge is *feathered*. A single filled polygon lands as a hard alpha step, which the
   * coastline shader then renders as a suspiciously exact, smoothed-voxel border — nothing
   * like the soft edge a brush produces, so lakes clashed with everything drawn by hand.
   * Filling the outline repeatedly at shrinking scales with low alpha builds a gradient
   * instead, so a lake meets its shore the way a painted one does.
   *
   * And a lake is not one body. Real water leaves ponds and cut-off arms nearby, so a few
   * smaller satellites are scattered around the main outline.
   */
  stampLake(cx, cy, radius, seed, _color, tier) {
    const rand = seeded(seed ^ 2654435769);
    const reach = radius * 2.2;
    const bounds = {
      minX: cx - reach,
      minY: cy - reach,
      maxX: cx + reach,
      maxY: cy + reach
    };
    const g = new Graphics();
    this.appendFeathered(g, this.lakeOutline(cx, cy, radius, seed));
    const satellites = 1 + Math.floor(rand() * 4);
    for (let i = 0; i < satellites; i++) {
      const a = rand() * Math.PI * 2;
      const dist = radius * (0.75 + rand() * 0.9);
      const sr = radius * (0.12 + rand() * 0.28);
      this.appendFeathered(g, this.lakeOutline(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, sr, seed + i * 7717));
    }
    this.host.removeChildren();
    this.host.blendMode = "erase";
    this.host.addChild(g);
    const touched = this.chunks.paintWorld("height", this.host, bounds, tier);
    this.host.removeChildren();
    g.destroy();
    for (const rec of touched)
      this.strokeTouched.add(rec);
    return touched;
  }
  /**
   * Fill an outline as a soft-edged blob.
   *
   * Concentric fills from slightly outside the outline down to its core; the overlapping
   * low-alpha layers accumulate into a ramp, which is the closest Pixi's flat fills get to
   * a feathered edge.
   */
  appendFeathered(g, outline) {
    const steps = 10;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < outline.length; i += 2) {
      cx += outline[i];
      cy += outline[i + 1];
    }
    const n = outline.length / 2;
    cx /= n;
    cy /= n;
    for (let s = 0; s < steps; s++) {
      const t = 1.12 - s / (steps - 1) * 0.57;
      const pts = [];
      for (let i = 0; i < outline.length; i += 2) {
        pts.push(cx + (outline[i] - cx) * t, cy + (outline[i + 1] - cy) * t);
      }
      g.poly(pts).fill({ color: 16777215, alpha: 0.16 });
    }
  }
  destroy() {
    this.dabs.destroy();
    this.host.removeChildren();
    for (const s of this.pool)
      s.destroy();
    this.pool = [];
    this.host.destroy();
  }
};
var LAKE_STEPS = 256;
function lakeOutline(cx, cy, radius, seed) {
  const rand = seeded(seed);
  const lobeCount = 3 + Math.floor(rand() * 4);
  const heading = rand() * Math.PI * 2;
  const bend = (rand() - 0.5) * 1.4;
  const spread = 0.35 + rand() * 0.45;
  const lobes = [];
  let px = 0;
  let py = 0;
  let dir = heading;
  for (let i = 0; i < lobeCount; i++) {
    const t = i / Math.max(1, lobeCount - 1);
    const taper = 0.55 + 0.45 * Math.sin(Math.PI * t);
    lobes.push({ x: px, y: py, r: radius * taper * (0.55 + rand() * 0.3) });
    dir += bend * (0.4 + rand() * 0.6);
    const step = radius * spread * (0.7 + rand() * 0.6);
    px += Math.cos(dir) * step;
    py += Math.sin(dir) * step;
  }
  let ax = 0;
  let ay = 0;
  for (const l of lobes) {
    ax += l.x;
    ay += l.y;
  }
  ax /= lobes.length;
  ay /= lobes.length;
  const crenFreq = 5 + Math.floor(rand() * 7);
  const crenPhase = rand() * Math.PI * 2;
  const crenAmp = 0.04 + rand() * 0.05;
  const points = [];
  let maxReach = 0;
  for (let i = 0; i < LAKE_STEPS; i++) {
    const a = i / LAKE_STEPS * Math.PI * 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    let reach = 0;
    for (const l of lobes) {
      const ox = l.x - ax;
      const oy = l.y - ay;
      const proj = ox * ux + oy * uy;
      const perpSq = ox * ox + oy * oy - proj * proj;
      if (perpSq > l.r * l.r)
        continue;
      reach = Math.max(reach, proj + Math.sqrt(l.r * l.r - perpSq));
    }
    if (reach <= 0)
      reach = radius * 0.25;
    reach *= 1 + crenAmp * Math.sin(a * crenFreq + crenPhase);
    maxReach = Math.max(maxReach, reach);
    points.push(reach * ux, reach * uy);
  }
  const scale = maxReach > 0 ? Math.min(1, radius * 1.3 / maxReach) : 1;
  for (let i = 0; i < points.length; i += 2) {
    points[i] = cx + points[i] * scale;
    points[i + 1] = cy + points[i + 1] * scale;
  }
  return points;
}
function parseHex(hex) {
  const n = Number.parseInt((hex || "").replace("#", ""), 16);
  return Number.isNaN(n) ? 16777215 : n;
}

// src/app/map-editor/undo-stack.ts
var MAX_BYTES = 256 * 1024 * 1024;
var UndoStack = class {
  chunks;
  objects;
  undoEntries = [];
  redoEntries = [];
  bytes = 0;
  /** Chunks captured for the stroke currently in progress. */
  pending = [];
  pendingKeys = /* @__PURE__ */ new Set();
  /** Object edits recorded for the step currently in progress. */
  pendingObjects = [];
  constructor(chunks, objects) {
    this.chunks = chunks;
    this.objects = objects;
  }
  setObjectApplier(applier) {
    this.objects = applier;
  }
  key(layer, tier, cx, cy) {
    return `${layer}/${tier}/${cx}/${cy}`;
  }
  snapshotBytes(layer) {
    const t = LAYER_TEXELS[layer];
    return t * t * 4;
  }
  /** Begin recording a step (a brush stroke, or a batch of object edits). */
  begin() {
    this.releaseAll(this.pending);
    this.pending = [];
    this.pendingKeys.clear();
    this.pendingObjects = [];
  }
  /**
   * Record an object edit. Pass deep copies — the live objects are mutated in place while
   * dragging, so a stored reference would quietly become the *current* state and undo to
   * nothing.
   */
  recordObject(change) {
    this.pendingObjects.push(change);
  }
  /**
   * Capture a chunk's pre-edit pixels, once per stroke.
   *
   * Must be called *before* the chunk is painted — the brush engine reports which chunks a
   * dab will cover, and this records each the first time it appears.
   */
  capture(rec) {
    const key = this.key(rec.layer, rec.tier, rec.cx, rec.cy);
    if (this.pendingKeys.has(key))
      return;
    this.pendingKeys.add(key);
    if (!rec.loaded)
      return;
    const texture = this.chunks.snapshot(rec);
    if (!texture)
      return;
    this.pending.push({
      layer: rec.layer,
      tier: rec.tier,
      cx: rec.cx,
      cy: rec.cy,
      texture,
      bytes: this.snapshotBytes(rec.layer)
    });
  }
  /** Commit the recorded step. Raster and object edits share one history. */
  commit(label) {
    if (this.pending.length === 0 && this.pendingObjects.length === 0)
      return;
    this.undoEntries.push({ label, before: this.pending, objects: this.pendingObjects });
    this.bytes += this.pending.reduce((a, s) => a + s.bytes, 0);
    this.pending = [];
    this.pendingKeys.clear();
    this.pendingObjects = [];
    this.releaseEntries(this.redoEntries);
    this.redoEntries = [];
    this.trim();
  }
  /** Discard an in-progress recording (step cancelled). */
  abort() {
    this.releaseAll(this.pending);
    this.pending = [];
    this.pendingKeys.clear();
    this.pendingObjects = [];
  }
  canUndo() {
    return this.undoEntries.length > 0;
  }
  canRedo() {
    return this.redoEntries.length > 0;
  }
  /** Returns the chunks restored, so the caller can schedule an upload. */
  undo() {
    const entry = this.undoEntries.pop();
    if (!entry)
      return [];
    entry.after ??= entry.before.map((s) => this.captureCurrent(s));
    for (const s of entry.before)
      this.chunks.restore(s.layer, s.tier, s.cx, s.cy, s.texture);
    for (let i = entry.objects.length - 1; i >= 0; i--)
      this.applyChange(entry.objects[i], true);
    this.redoEntries.push(entry);
    return entry.before;
  }
  redo() {
    const entry = this.redoEntries.pop();
    if (!entry)
      return [];
    for (const s of entry.after ?? [])
      this.chunks.restore(s.layer, s.tier, s.cx, s.cy, s.texture);
    for (const change of entry.objects)
      this.applyChange(change, false);
    this.undoEntries.push(entry);
    return entry.after ?? [];
  }
  /** Replay one object change in either direction. */
  applyChange(change, backwards) {
    if (!this.objects)
      return;
    const target = backwards ? change.before : change.after;
    const other = backwards ? change.after : change.before;
    if (target === null) {
      if (other !== null)
        this.objects.remove(change.c, change.id);
      return;
    }
    if (other === null) {
      this.objects.add(change.c, clone(target));
      return;
    }
    this.objects.update(change.c, change.id, clone(target));
  }
  captureCurrent(ref) {
    const rec = this.chunks.get(ref.layer, ref.tier, ref.cx, ref.cy);
    const texture = this.chunks.snapshot(rec);
    const bytes = this.snapshotBytes(ref.layer);
    this.bytes += bytes;
    return {
      layer: ref.layer,
      tier: ref.tier,
      cx: ref.cx,
      cy: ref.cy,
      texture: texture ?? ref.texture,
      bytes
    };
  }
  /** Drop the oldest history until back inside the memory budget. */
  trim() {
    while (this.bytes > MAX_BYTES && this.undoEntries.length > 1) {
      const dropped = this.undoEntries.shift();
      if (!dropped)
        break;
      this.bytes -= this.releaseEntry(dropped);
    }
  }
  releaseEntry(entry) {
    let freed = 0;
    for (const s of entry.before) {
      s.texture.destroy(true);
      freed += s.bytes;
    }
    for (const s of entry.after ?? []) {
      s.texture.destroy(true);
      freed += s.bytes;
    }
    return freed;
  }
  releaseEntries(entries) {
    for (const e of entries)
      this.bytes -= this.releaseEntry(e);
  }
  releaseAll(snaps) {
    for (const s of snaps)
      s.texture.destroy(true);
  }
  destroy() {
    this.releaseEntries(this.undoEntries);
    this.releaseEntries(this.redoEntries);
    this.releaseAll(this.pending);
    this.undoEntries = [];
    this.redoEntries = [];
    this.pending = [];
    this.pendingObjects = [];
    this.pendingKeys.clear();
    this.bytes = 0;
  }
};
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// src/app/map-editor/map-assets.ts
var BASE = "/mapassets";
var MapAssets = class {
  manifest = null;
  pages = [];
  spriteTextures = /* @__PURE__ */ new Map();
  paperCache = /* @__PURE__ */ new Map();
  get available() {
    return !!this.manifest && this.pages.length > 0;
  }
  /** Why loading failed, surfaced in the UI so the cause is not left to guesswork. */
  lastError = null;
  /** Fetch the manifest and atlas pages. Safe to call when the library is not built. */
  async load() {
    this.lastError = null;
    try {
      const res = await fetch(`${BASE}/manifest.json`);
      if (!res.ok) {
        this.lastError = res.status === 404 ? 'Symbol-Atlas nicht gefunden. "npm run map:atlas" ausf\xFChren und den Dev-Server neu starten.' : `Manifest konnte nicht geladen werden (HTTP ${res.status}).`;
        console.warn("[MapAssets]", this.lastError);
        return false;
      }
      this.manifest = await res.json();
    } catch (err) {
      this.lastError = "Symbol-Atlas nicht erreichbar.";
      console.warn("[MapAssets] Manifest fetch failed:", err);
      return false;
    }
    try {
      this.pages = await Promise.all(this.manifest.pages.map((p) => Assets.load(`${BASE}/${p.file}`)));
    } catch (err) {
      this.lastError = "Atlas-Seiten konnten nicht geladen werden.";
      console.error("[MapAssets] Failed to load atlas pages:", err);
      this.manifest = null;
      return false;
    }
    if (this.pages.length === 0) {
      this.lastError = "Atlas enth\xE4lt keine Seiten.";
      return false;
    }
    return true;
  }
  /**
   * Texture for one sprite, cut from its atlas page.
   *
   * Sub-textures share the page's GPU texture, which is the whole point — a thousand
   * symbols drawn from two pages batch into two draw calls rather than a thousand.
   */
  sprite(id) {
    const hit = this.spriteTextures.get(id);
    if (hit)
      return hit;
    const meta = this.manifest?.sprites[id];
    if (!meta)
      return null;
    const page = this.pages[meta.page];
    if (!page)
      return null;
    const texture = new Texture({
      source: page.source,
      frame: new Rectangle(meta.x, meta.y, meta.w, meta.h)
    });
    this.spriteTextures.set(id, texture);
    return texture;
  }
  meta(id) {
    return this.manifest?.sprites[id] ?? null;
  }
  /**
   * CSS for a sprite thumbnail, cut from its atlas page with background-position.
   *
   * The picker has to show the actual artwork — a list of names like `house_small` is
   * unusable for choosing a symbol. Slicing the atlas in CSS means no second set of
   * thumbnail files to generate, ship or keep in sync.
   */
  thumbStyle(id, box) {
    const meta = this.manifest?.sprites[id];
    const page = meta ? this.manifest?.pages[meta.page] : null;
    if (!meta || !page)
      return {};
    const scale = Math.min(box / Math.max(meta.w, meta.h), 1);
    const w = meta.w * scale;
    const h = meta.h * scale;
    return {
      "background-image": `url(${BASE}/${page.file})`,
      "background-size": `${page.width * scale}px ${page.height * scale}px`,
      "background-position": `${-meta.x * scale}px ${-meta.y * scale}px`,
      "background-repeat": "no-repeat",
      width: `${w}px`,
      height: `${h}px`,
      // Centre the (usually smaller) sprite inside its cell.
      margin: `${(box - h) / 2}px ${(box - w) / 2}px`
    };
  }
  group(id) {
    return this.manifest?.groups[id] ?? null;
  }
  groupsIn(category) {
    const ids = this.manifest?.categories[category] ?? [];
    return ids.map((id) => this.manifest.groups[id]).filter(Boolean);
  }
  /**
   * Every sprite in a category, flattened in group order.
   *
   * The picker shows the whole category at once rather than making you choose a group name
   * first: browsing thirteen "Inked Mountains" and then backing out to try "Penned
   * Mountains" is guesswork through a list of words. Groups still exist — they drive which
   * sprites auto-variation may pick from — they are just not something you navigate.
   */
  spritesInCategory(category) {
    const out = [];
    for (const group of this.groupsIn(category))
      out.push(...group.sprites);
    return out;
  }
  /** The group a sprite belongs to, so selecting one also selects its variation set. */
  groupOf(spriteId) {
    const slash = spriteId.lastIndexOf("/");
    return slash < 0 ? "" : spriteId.slice(0, slash);
  }
  /**
   * Filter a sprite list by a free-text query.
   *
   * Matches the sprite's own name, its id, and its group's name, so "burg" finds castles
   * whether the word is on the sprite or only on the group it lives in. Terms are ANDed,
   * which makes narrowing ("inked oak") work the way people expect from a search box.
   */
  search(ids, query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0)
      return ids;
    return ids.filter((id) => {
      const meta = this.manifest?.sprites[id];
      const group = this.manifest?.groups[this.groupOf(id)];
      const haystack = `${id} ${meta?.name ?? ""} ${group?.name ?? ""}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }
  /** A random member of a group — placing a symbol rolls the next variation. */
  randomInGroup(groupId) {
    const g = this.group(groupId);
    if (!g || g.sprites.length === 0)
      return null;
    return g.sprites[Math.floor(Math.random() * g.sprites.length)];
  }
  get paperTextures() {
    return this.manifest?.paperTextures ?? [];
  }
  /**
   * Load a paper texture, set to repeat so it tiles seamlessly across the whole map —
   * the terrain shader samples it in world space, well outside 0..1.
   */
  async paper(id) {
    if (!id)
      return null;
    const hit = this.paperCache.get(id);
    if (hit)
      return hit;
    const meta = this.paperTextures.find((p) => p.id === id);
    if (!meta)
      return null;
    try {
      const texture = await Assets.load(`${BASE}/${meta.file}`);
      texture.source.addressMode = "repeat";
      this.paperCache.set(id, texture);
      return texture;
    } catch (err) {
      console.error("[MapAssets] Failed to load paper texture", id, err);
      return null;
    }
  }
  destroy() {
    for (const t of this.spriteTextures.values())
      t.destroy();
    this.spriteTextures.clear();
    this.paperCache.clear();
    this.pages = [];
    this.manifest = null;
  }
};

// src/app/map-editor/spatial-index.ts
var CELL_SIZE = 4096;
var SpatialIndex = class {
  cells = /* @__PURE__ */ new Map();
  /** Where each object currently sits, so a move can leave its old cell. */
  placement = /* @__PURE__ */ new Map();
  key(cx, cy) {
    return `${cx},${cy}`;
  }
  cellFor(x, y) {
    return this.key(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE));
  }
  insert(obj) {
    const key = this.cellFor(obj.x, obj.y);
    const prev = this.placement.get(obj.id);
    if (prev === key) {
      this.cells.get(key)?.set(obj.id, obj);
      return;
    }
    if (prev !== void 0)
      this.removeFrom(prev, obj.id);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = /* @__PURE__ */ new Map();
      this.cells.set(key, bucket);
    }
    bucket.set(obj.id, obj);
    this.placement.set(obj.id, key);
  }
  /** Re-file an object after its position changed. */
  update(obj) {
    this.insert(obj);
  }
  remove(id) {
    const key = this.placement.get(id);
    if (key === void 0)
      return;
    this.removeFrom(key, id);
    this.placement.delete(id);
  }
  removeFrom(key, id) {
    const bucket = this.cells.get(key);
    if (!bucket)
      return;
    bucket.delete(id);
    if (bucket.size === 0)
      this.cells.delete(key);
  }
  clear() {
    this.cells.clear();
    this.placement.clear();
  }
  /** Rebuild from scratch — used when the document is replaced wholesale. */
  rebuild(objects) {
    this.clear();
    for (const o of objects)
      this.insert(o);
  }
  get size() {
    return this.placement.size;
  }
  /**
   * Objects in cells overlapping `bounds`.
   *
   * Returns whole buckets, so results can lie slightly outside the query — callers that
   * need exactness (hit-testing) must still check individually. For culling that is fine
   * and cheaper than filtering twice.
   */
  query(bounds) {
    const minCx = Math.floor(bounds.minX / CELL_SIZE);
    const maxCx = Math.floor(bounds.maxX / CELL_SIZE);
    const minCy = Math.floor(bounds.minY / CELL_SIZE);
    const maxCy = Math.floor(bounds.maxY / CELL_SIZE);
    const out = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket)
          continue;
        for (const obj of bucket.values())
          out.push(obj);
      }
    }
    return out;
  }
  /**
   * Nearest object to a point within `radius`, or null.
   *
   * Used for click hit-testing; the radius query is expanded to whole cells, so a symbol
   * just across a bucket boundary is still found.
   */
  nearest(x, y, radius) {
    const candidates = this.query({
      minX: x - radius,
      minY: y - radius,
      maxX: x + radius,
      maxY: y + radius
    });
    let best = null;
    let bestDist = radius * radius;
    for (const obj of candidates) {
      const dx = obj.x - x;
      const dy = obj.y - y;
      const d = dx * dx + dy * dy;
      if (d <= bestDist) {
        bestDist = d;
        best = obj;
      }
    }
    return best;
  }
};

// src/app/map-editor/symbol-view.ts
var MIN_SCREEN_PX = 3;
var MAX_VISIBLE = 12e3;
var SymbolView = class {
  assets;
  container = new Container();
  index = new SpatialIndex();
  /** Sprites currently on screen, keyed by symbol id. */
  active = /* @__PURE__ */ new Map();
  pool = [];
  /**
   * Fallback for `sample_color` symbols placed where no land colour was painted.
   *
   * White, matching blank land — each symbol otherwise carries a `tint` sampled from the
   * ground beneath it at placement, so this is only the unpainted case.
   */
  landColor = 16777215;
  selected = /* @__PURE__ */ new Set();
  constructor(assets) {
    this.assets = assets;
    this.container.sortableChildren = true;
  }
  forceRefresh = false;
  setLandColor(color) {
    this.landColor = color;
    this.forceRefresh = true;
  }
  setSelection(ids) {
    this.selected = new Set(ids);
    this.forceRefresh = true;
  }
  /** Replace the indexed set (document load, or a remote change). */
  rebuild(symbols) {
    this.index.rebuild(symbols);
    this.forceRefresh = true;
  }
  add(symbol) {
    this.index.insert(symbol);
    this.forceRefresh = true;
  }
  update(symbol) {
    this.index.update(symbol);
    this.forceRefresh = true;
  }
  remove(id) {
    this.index.remove(id);
    const sprite = this.active.get(id);
    if (sprite) {
      this.release(id, sprite);
    }
    this.forceRefresh = true;
  }
  take() {
    const s = this.pool.pop() ?? new Sprite();
    s.anchor.set(0.5);
    s.visible = true;
    return s;
  }
  release(id, sprite) {
    this.container.removeChild(sprite);
    sprite.visible = false;
    this.active.delete(id);
    this.pool.push(sprite);
  }
  /**
   * Sync the visible sprite set to the viewport.
   *
   * `zoom` is needed for the size cull — a symbol's on-screen size is what decides whether
   * it is worth drawing, not its world size.
   */
  render(bounds, zoom, showSecrets) {
    const visible = this.index.query({
      minX: bounds.minX - 256,
      minY: bounds.minY - 256,
      maxX: bounds.maxX + 256,
      maxY: bounds.maxY + 256
    });
    const wanted = /* @__PURE__ */ new Set();
    let count = 0;
    for (const sym of visible) {
      if (count >= MAX_VISIBLE)
        break;
      if (sym.vis === "secret" && !showSecrets)
        continue;
      const meta = this.assets.meta(sym.asset);
      if (!meta)
        continue;
      const scale = sym.scale || 1;
      if (Math.max(meta.w, meta.h) * scale * zoom < MIN_SCREEN_PX)
        continue;
      const texture = this.assets.sprite(sym.asset);
      if (!texture)
        continue;
      wanted.add(sym.id);
      count++;
      let sprite = this.active.get(sym.id);
      if (!sprite) {
        sprite = this.take();
        this.active.set(sym.id, sprite);
        this.container.addChild(sprite);
      }
      sprite.texture = texture;
      sprite.position.set(sym.x + meta.offsetX * scale, sym.y + meta.offsetY * scale);
      sprite.scale.set(sym.flipX ? -scale : scale, scale);
      sprite.rotation = sym.rotation || 0;
      sprite.zIndex = sym.y;
      sprite.tint = meta.colorable ? parseTint(sym.tint) ?? this.landColor : 16777215;
      if (this.selected.has(sym.id))
        sprite.alpha = 0.65;
      else if (sym.vis === "secret")
        sprite.alpha = 0.85;
      else
        sprite.alpha = 1;
    }
    for (const [id, sprite] of [...this.active]) {
      if (!wanted.has(id))
        this.release(id, sprite);
    }
    this.forceRefresh = false;
  }
  /** True if something changed since the last render and a re-sync is due. */
  get needsRefresh() {
    return this.forceRefresh;
  }
  /**
   * Symbol under a world point.
   *
   * Hit radius comes from the sidecar's `radius` scaled by placement, so a big mountain is
   * easier to grab than a small shrub — matching what is visually under the cursor.
   */
  hitTest(x, y) {
    const candidates = this.index.query({
      minX: x - 256,
      minY: y - 256,
      maxX: x + 256,
      maxY: y + 256
    });
    let best = null;
    let bestDist = Infinity;
    for (const sym of candidates) {
      const meta = this.assets.meta(sym.asset);
      if (!meta)
        continue;
      const scale = sym.scale || 1;
      const cx = sym.x + meta.offsetX * scale;
      const cy = sym.y + meta.offsetY * scale;
      const r = Math.max(8, meta.radius * scale);
      const d = Math.hypot(cx - x, cy - y);
      if (d <= r && (best === null || sym.y > best.y || d < bestDist)) {
        best = sym;
        bestDist = d;
      }
    }
    return best;
  }
  /** Symbols whose base falls inside a world rectangle. */
  inRect(rect) {
    return this.index.query(rect).filter((s) => s.x >= rect.minX && s.x <= rect.maxX && s.y >= rect.minY && s.y <= rect.maxY);
  }
  destroy() {
    for (const [, sprite] of this.active)
      sprite.destroy();
    for (const sprite of this.pool)
      sprite.destroy();
    this.active.clear();
    this.pool = [];
    this.index.clear();
    this.container.destroy({ children: true });
  }
};
function parseTint(hex) {
  if (!hex)
    return null;
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return Number.isNaN(n) ? null : n;
}

// src/app/map-editor/editor-tools.ts
var TAB_DEFS = [
  { id: "water", label: "Wasser" },
  { id: "land", label: "Land" },
  { id: "symbols", label: "Symbole" },
  { id: "regions", label: "Regionen" },
  { id: "labels", label: "Beschriftung" },
  { id: "map", label: "Karte" }
];
var REGION_TOOL_DEFS = [
  { id: "draw", icon: "territory_tool_64", label: "Region zeichnen" },
  { id: "select", icon: "symbol_move_tool_64", label: "Region ausw\xE4hlen" }
];
var LABEL_TOOL_DEFS = [
  { id: "place", icon: "label_tool_64", label: "Beschriftung setzen" },
  { id: "select", icon: "symbol_move_tool_64", label: "Beschriftung ausw\xE4hlen" }
];
var WATER_TOOL_DEFS = [
  { id: "waterBrush", icon: "freshwater_brush_64", label: "Wasser" },
  { id: "lakeStamp", icon: "lake_tool_64", label: "See" },
  { id: "waterPaint", icon: "color_brush", label: "Wasserfarbe" }
];
var LAND_TOOL_DEFS = [
  { id: "landBrush", icon: "landmass_brush_64", label: "Land" },
  { id: "landEraser", icon: "landmass_eraser_64", label: "Land radieren" },
  { id: "heighten", icon: "raise_landmass_tool_64", label: "Anheben" },
  { id: "lower", icon: "lower_landmass_tool_64", label: "Absenken" },
  { id: "landPaint", icon: "ground_color_normal", label: "Landfarbe" }
];
var SYMBOL_TOOL_DEFS = [
  { id: "trees", icon: "tree_brush_64", label: "B\xE4ume" },
  { id: "mountains", icon: "mountain_brush_64", label: "Berge" },
  { id: "misc", icon: "symbol_tool_64", label: "Symbole" },
  { id: "select", icon: "symbol_move_tool_64", label: "Auswahl" }
];
function terrainToolsFor(tab) {
  if (tab === "water")
    return WATER_TOOL_DEFS;
  if (tab === "land")
    return LAND_TOOL_DEFS;
  return [];
}
function isBrushTool(tool) {
  return tool !== "lakeStamp";
}
function usesLandPalette(tool) {
  return tool === "landBrush" || tool === "landPaint";
}
function usesWaterPalette(tool) {
  return tool === "waterBrush" || tool === "waterPaint" || tool === "lakeStamp";
}
function autoVaries(category) {
  return category === "trees" || category === "mountains";
}
function iconUrl(name) {
  return `/mapassets/icons/${name}.png`;
}
var BRUSH_PROFILES = [
  // The blending workhorse: maximum feather, minimum flow, so colour builds up gradually.
  { id: "blend", label: "Verlauf", softness: 1, strength: 0.1, noise: 0 },
  { id: "soft", label: "Weich", softness: 0.7, strength: 0.4, noise: 0 },
  { id: "hard", label: "Hart", softness: 0.05, strength: 1, noise: 0 },
  { id: "noisy", label: "Rau", softness: 0.8, strength: 0.5, noise: 0.85 },
  { id: "grain", label: "K\xF6rnig", softness: 0.35, strength: 0.25, noise: 1 }
];

// src/app/map-editor/region-view.ts
var HANDLE_SCREEN_PX = 7;
function dashedSegments(points, dash, gap) {
  const out = [];
  if (points.length < 2)
    return out;
  const period = Math.max(0.01, dash + gap);
  let travelled = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6)
      continue;
    const ux = dx / len;
    const uy = dy / len;
    let pos = 0;
    while (pos < len) {
      const phase = (travelled + pos) % period;
      if (phase < dash) {
        const run = Math.min(dash - phase, len - pos);
        out.push({
          from: { x: a.x + ux * pos, y: a.y + uy * pos },
          to: { x: a.x + ux * (pos + run), y: a.y + uy * (pos + run) }
        });
        pos += run;
      } else {
        pos += Math.min(period - phase, len - pos);
      }
    }
    travelled += len;
  }
  return out;
}
function centroid(points) {
  if (points.length === 0)
    return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}
function distanceToPath(points, x, y) {
  if (points.length === 0)
    return Infinity;
  if (points.length === 1)
    return Math.hypot(points[0].x - x, points[0].y - y);
  let best = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    best = Math.min(best, distanceToSegment(a, b, x, y));
  }
  return best;
}
function distanceToSegment(a, b, x, y) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-9)
    return Math.hypot(a.x - x, a.y - y);
  let t = ((x - a.x) * dx + (y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(a.x + t * dx - x, a.y + t * dy - y);
}
var RegionView = class {
  container = new Container();
  index = new SpatialIndex();
  graphics = new Graphics();
  handles = new Graphics();
  regions = /* @__PURE__ */ new Map();
  selectedId = null;
  /** Vertices of the selected region that are picked, so several can move together. */
  picked = /* @__PURE__ */ new Set();
  dirty = true;
  constructor() {
    this.container.addChild(this.graphics, this.handles);
  }
  rebuild(regions) {
    this.regions.clear();
    for (const r of regions)
      this.regions.set(r.id, r);
    this.index.rebuild(regions);
    this.dirty = true;
  }
  add(region) {
    this.regions.set(region.id, region);
    this.index.insert(region);
    this.dirty = true;
  }
  update(region) {
    this.regions.set(region.id, region);
    this.index.update(region);
    this.dirty = true;
  }
  remove(id) {
    this.regions.delete(id);
    this.index.remove(id);
    if (this.selectedId === id)
      this.selectedId = null;
    this.dirty = true;
  }
  get(id) {
    return this.regions.get(id);
  }
  setSelected(id) {
    this.selectedId = id;
    this.picked.clear();
    this.dirty = true;
  }
  setSelectedPoints(indices) {
    this.picked = new Set(indices);
    this.dirty = true;
  }
  get selectedPoints() {
    return this.picked;
  }
  get selected() {
    return this.selectedId ? this.regions.get(this.selectedId) : void 0;
  }
  markDirty() {
    this.dirty = true;
  }
  /**
   * Redraw regions.
   *
   * Everything lands in two Graphics objects rather than one per region: a map may hold
   * hundreds of borders, and a Graphics each would mean hundreds of draw calls for what is
   * ultimately a pile of line segments.
   */
  render(bounds, zoom, showSecrets, force = false) {
    if (!this.dirty && !force)
      return;
    this.dirty = false;
    const g = this.graphics;
    g.clear();
    for (const region of this.index.query({
      minX: bounds.minX - 4096,
      minY: bounds.minY - 4096,
      maxX: bounds.maxX + 4096,
      maxY: bounds.maxY + 4096
    })) {
      if (region.vis === "secret" && !showSecrets)
        continue;
      if (region.points.length < 2)
        continue;
      if (region.fill && (region.fillAlpha ?? 0) > 0) {
        g.poly(region.points.flatMap((p) => [p.x, p.y]));
        g.fill({ color: parseColor(region.fill), alpha: region.fillAlpha ?? 0.2 });
      }
      for (const seg of dashedSegments(region.points, region.dash, region.gap)) {
        g.moveTo(seg.from.x, seg.from.y);
        g.lineTo(seg.to.x, seg.to.y);
      }
      g.stroke({
        width: region.thickness,
        color: parseColor(region.color),
        alpha: region.vis === "secret" ? 0.7 : 1,
        cap: "round"
      });
    }
    this.renderHandles(zoom);
  }
  /** Draw draggable vertices for the selected region. */
  renderHandles(zoom) {
    const h = this.handles;
    h.clear();
    const region = this.selected;
    if (!region)
      return;
    const r = HANDLE_SCREEN_PX / zoom;
    for (let i = 0; i < region.points.length; i++) {
      if (this.picked.has(i))
        continue;
      h.circle(region.points[i].x, region.points[i].y, r);
    }
    h.fill({ color: 9425151, alpha: 0.9 });
    h.stroke({ width: 1 / zoom, color: 1056816, alpha: 0.8 });
    if (this.picked.size === 0)
      return;
    for (const i of this.picked) {
      const p = region.points[i];
      if (p)
        h.circle(p.x, p.y, r * 1.25);
    }
    h.fill({ color: 16766073, alpha: 0.95 });
    h.stroke({ width: 1.5 / zoom, color: 3811840, alpha: 0.9 });
  }
  /** Indices of the selected region's vertices inside a world rectangle. */
  pointsInRect(rect) {
    const region = this.selected;
    if (!region)
      return [];
    const out = [];
    for (let i = 0; i < region.points.length; i++) {
      const p = region.points[i];
      if (p.x >= rect.minX && p.x <= rect.maxX && p.y >= rect.minY && p.y <= rect.maxY) {
        out.push(i);
      }
    }
    return out;
  }
  /** Region whose outline passes near a world point. */
  hitTest(x, y, tolerance) {
    let best = null;
    let bestDist = tolerance;
    for (const region of this.index.query({
      minX: x - 4096,
      minY: y - 4096,
      maxX: x + 4096,
      maxY: y + 4096
    })) {
      const d = distanceToPath(region.points, x, y);
      if (d <= bestDist) {
        bestDist = d;
        best = region;
      }
    }
    return best;
  }
  /** Index of the selected region's vertex near a point, or -1. */
  hitHandle(x, y, tolerance) {
    const region = this.selected;
    if (!region)
      return -1;
    for (let i = 0; i < region.points.length; i++) {
      if (Math.hypot(region.points[i].x - x, region.points[i].y - y) <= tolerance)
        return i;
    }
    return -1;
  }
  destroy() {
    this.container.destroy({ children: true });
    this.index.clear();
    this.regions.clear();
  }
};
function parseColor(hex) {
  const n = Number.parseInt((hex || "").replace("#", ""), 16);
  return Number.isNaN(n) ? 16777215 : n;
}

// src/app/map-editor/label-view.ts
function defaultLabelStyle() {
  return {
    fontFamily: "Georgia, serif",
    fontSize: 220,
    fill: "#2b2b2b",
    outline: "#f5f0e6",
    outlineWidth: 20,
    curvature: 0,
    letterSpacing: 8
  };
}
function signatureOf(label) {
  const s = label.style;
  return [
    label.text,
    s.fontFamily,
    s.fontSize,
    s.fill,
    s.outline,
    s.outlineWidth,
    s.curvature,
    s.letterSpacing
  ].join("|");
}
function layoutGlyphs(glyphs, totalWidth, curvature) {
  const bend = Math.max(-1, Math.min(1, curvature));
  if (Math.abs(bend) < 1e-3) {
    let x = -totalWidth / 2;
    for (const g of glyphs) {
      g.text.position.set(x + g.width / 2, 0);
      g.text.rotation = 0;
      x += g.width;
    }
    return;
  }
  const sweepMag = Math.abs(bend) * Math.PI * 0.9;
  const radius = totalWidth / sweepMag;
  const up = bend < 0;
  let travelled = 0;
  for (const g of glyphs) {
    const centre = travelled + g.width / 2;
    const angle = (centre / totalWidth - 0.5) * sweepMag;
    const sag = radius - Math.cos(angle) * radius;
    g.text.position.set(Math.sin(angle) * radius, up ? -sag : sag);
    g.text.rotation = up ? -angle : angle;
    travelled += g.width;
  }
}
var LabelView = class {
  container = new Container();
  index = new SpatialIndex();
  nodes = /* @__PURE__ */ new Map();
  labels = /* @__PURE__ */ new Map();
  selected = /* @__PURE__ */ new Set();
  dirty = true;
  /** Selection outlines. Without one, a selected label is indistinguishable from any other. */
  highlight = new Graphics();
  constructor() {
    this.container.addChild(this.highlight);
  }
  /** Bounding box of a rendered label, for the selection outline and box-select. */
  boundsOf(id) {
    const label = this.labels.get(id);
    const node = this.nodes.get(id);
    if (!label)
      return null;
    const w = node ? node.container.width : label.text.length * label.style.fontSize * 0.6;
    const h = node ? node.container.height : label.style.fontSize;
    return { x: label.x - w / 2, y: label.y - h / 2, w, h };
  }
  rebuild(labels) {
    for (const node of this.nodes.values())
      node.container.destroy({ children: true });
    this.nodes.clear();
    this.labels.clear();
    for (const l of labels)
      this.labels.set(l.id, l);
    this.index.rebuild(labels);
    this.dirty = true;
  }
  add(label) {
    this.labels.set(label.id, label);
    this.index.insert(label);
    this.dirty = true;
  }
  update(label) {
    this.labels.set(label.id, label);
    this.index.update(label);
    this.dirty = true;
  }
  remove(id) {
    this.labels.delete(id);
    this.index.remove(id);
    const node = this.nodes.get(id);
    if (node) {
      node.container.destroy({ children: true });
      this.nodes.delete(id);
    }
    this.dirty = true;
  }
  get(id) {
    return this.labels.get(id);
  }
  setSelection(ids) {
    this.selected = new Set(ids);
    this.dirty = true;
  }
  markDirty() {
    this.dirty = true;
  }
  build(label, zoom) {
    const holder = new Container();
    const s = label.style;
    const target = Math.max(1, Math.min(6, zoom));
    const style = new TextStyle({
      fontFamily: s.fontFamily,
      fontSize: s.fontSize * target,
      fill: s.fill,
      stroke: s.outlineWidth > 0 ? { color: s.outline, width: s.outlineWidth * target, join: "round" } : void 0
    });
    const glyphs = [];
    let total = 0;
    for (const ch of [...label.text]) {
      const t = new Text({ text: ch, style });
      t.anchor.set(0.5);
      const w = (ch === " " ? s.fontSize * target * 0.3 : t.width) + s.letterSpacing * target;
      glyphs.push({ text: t, width: w });
      total += w;
      holder.addChild(t);
    }
    layoutGlyphs(glyphs, total, s.curvature);
    holder.cacheAsTexture(true);
    const wrapper = new Container();
    wrapper.addChild(holder);
    wrapper.scale.set(1 / target);
    return { container: wrapper, signature: signatureOf(label), bakedAt: target };
  }
  /** Sync visible labels. Only rebuilds nodes whose text or style changed. */
  render(bounds, showSecrets, zoom = 1) {
    const visible = this.index.query({
      minX: bounds.minX - 2048,
      minY: bounds.minY - 2048,
      maxX: bounds.maxX + 2048,
      maxY: bounds.maxY + 2048
    });
    const wanted = /* @__PURE__ */ new Set();
    for (const label of visible) {
      if (label.vis === "secret" && !showSecrets)
        continue;
      if (!label.text)
        continue;
      wanted.add(label.id);
      let node = this.nodes.get(label.id);
      const wantScale = Math.max(1, Math.min(6, zoom));
      const stale = !node || node.signature !== signatureOf(label) || wantScale > node.bakedAt * 1.6 || wantScale < node.bakedAt / 2.5;
      if (stale || !node) {
        node?.container.destroy({ children: true });
        node = this.build(label, zoom);
        this.nodes.set(label.id, node);
        this.container.addChild(node.container);
      }
      node.container.position.set(label.x, label.y);
      node.container.rotation = label.rotation || 0;
      node.container.alpha = label.vis === "secret" ? 0.85 : 1;
      node.container.visible = true;
    }
    for (const [id, node] of [...this.nodes]) {
      if (wanted.has(id))
        continue;
      node.container.destroy({ children: true });
      this.nodes.delete(id);
    }
    this.drawHighlight(zoom);
    this.dirty = false;
  }
  drawHighlight(zoom) {
    const g = this.highlight;
    g.clear();
    if (this.selected.size === 0)
      return;
    const pad = 6 / zoom;
    for (const id of this.selected) {
      const b = this.boundsOf(id);
      if (!b)
        continue;
      g.rect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
    }
    g.stroke({ width: 1.5 / zoom, color: 9425151, alpha: 0.95 });
    this.container.setChildIndex(g, this.container.children.length - 1);
  }
  get needsRefresh() {
    return this.dirty;
  }
  /** Label near a world point, using its baked bounds. */
  hitTest(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const label of this.index.query({
      minX: x - 2048,
      minY: y - 2048,
      maxX: x + 2048,
      maxY: y + 2048
    })) {
      const node = this.nodes.get(label.id);
      const reach = node ? Math.max(node.container.width, node.container.height) / 2 : label.style.fontSize;
      const d = Math.hypot(label.x - x, label.y - y);
      if (d <= reach && d < bestDist) {
        bestDist = d;
        best = label;
      }
    }
    return best;
  }
  inRect(rect) {
    return this.index.query(rect).filter((l) => l.x >= rect.minX && l.x <= rect.maxX && l.y >= rect.minY && l.y <= rect.maxY);
  }
  destroy() {
    for (const node of this.nodes.values())
      node.container.destroy({ children: true });
    this.nodes.clear();
    this.labels.clear();
    this.index.clear();
    this.container.destroy({ children: true });
  }
};

// src/app/map-editor/map-editor.component.ts
var _c0 = ["pixiHost"];
var _forTrack0 = ($index, $item) => $item.id;
var _forTrack1 = ($index, $item) => $item.label;
function MapEditorComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 17);
    \u0275\u0275text(1, "Speichert \u2026");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 18);
    \u0275\u0275text(1, "GM");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 19);
    \u0275\u0275text(1, "Spieler");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_27_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 35);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_27_For_3_Template_button_click_0_listener() {
      const t_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.selectTab(t_r3.id));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r3 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275classProp("active", ctx_r3.tab() === t_r3.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", t_r3.label, " ");
  }
}
function MapEditorComponent_Conditional_27_Conditional_6_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 37);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_27_Conditional_6_For_1_Template_button_click_0_listener() {
      const t_r6 = \u0275\u0275restoreView(_r5).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectTerrainTool(t_r6.id));
    });
    \u0275\u0275element(1, "img", 38);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r6 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.terrainTool() === t_r6.id);
    \u0275\u0275property("title", t_r6.label);
    \u0275\u0275advance();
    \u0275\u0275property("src", ctx_r3.icon(t_r6.icon), \u0275\u0275sanitizeUrl)("alt", t_r6.label);
  }
}
function MapEditorComponent_Conditional_27_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, MapEditorComponent_Conditional_27_Conditional_6_For_1_Template, 2, 5, "button", 36, _forTrack0);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r3.terrainTools());
  }
}
function MapEditorComponent_Conditional_27_Conditional_7_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 40);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_27_Conditional_7_For_1_Template_button_click_0_listener() {
      const t_r8 = \u0275\u0275restoreView(_r7).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectSymbolTool(t_r8.id));
    });
    \u0275\u0275element(1, "img", 38);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r8 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.symbolTool() === t_r8.id);
    \u0275\u0275property("disabled", !ctx_r3.assetsReady())("title", t_r8.label);
    \u0275\u0275advance();
    \u0275\u0275property("src", ctx_r3.icon(t_r8.icon), \u0275\u0275sanitizeUrl)("alt", t_r8.label);
  }
}
function MapEditorComponent_Conditional_27_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, MapEditorComponent_Conditional_27_Conditional_7_For_1_Template, 2, 6, "button", 39, _forTrack0);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r3.symbolTools);
  }
}
function MapEditorComponent_Conditional_27_Conditional_8_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 37);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_27_Conditional_8_For_1_Template_button_click_0_listener() {
      const t_r10 = \u0275\u0275restoreView(_r9).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectRegionTool(t_r10.id));
    });
    \u0275\u0275element(1, "img", 38);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r10 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.regionTool() === t_r10.id);
    \u0275\u0275property("title", t_r10.label);
    \u0275\u0275advance();
    \u0275\u0275property("src", ctx_r3.icon(t_r10.icon), \u0275\u0275sanitizeUrl)("alt", t_r10.label);
  }
}
function MapEditorComponent_Conditional_27_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, MapEditorComponent_Conditional_27_Conditional_8_For_1_Template, 2, 5, "button", 36, _forTrack0);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r3.regionTools);
  }
}
function MapEditorComponent_Conditional_27_Conditional_9_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 37);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_27_Conditional_9_For_1_Template_button_click_0_listener() {
      const t_r12 = \u0275\u0275restoreView(_r11).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectLabelTool(t_r12.id));
    });
    \u0275\u0275element(1, "img", 38);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const t_r12 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.labelTool() === t_r12.id);
    \u0275\u0275property("title", t_r12.label);
    \u0275\u0275advance();
    \u0275\u0275property("src", ctx_r3.icon(t_r12.icon), \u0275\u0275sanitizeUrl)("alt", t_r12.label);
  }
}
function MapEditorComponent_Conditional_27_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, MapEditorComponent_Conditional_27_Conditional_9_For_1_Template, 2, 5, "button", 36, _forTrack0);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r3.labelTools);
  }
}
function MapEditorComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "aside", 21)(1, "div", 31);
    \u0275\u0275repeaterCreate(2, MapEditorComponent_Conditional_27_For_3_Template, 2, 3, "button", 32, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275element(4, "div", 33);
    \u0275\u0275elementStart(5, "div", 34);
    \u0275\u0275conditionalCreate(6, MapEditorComponent_Conditional_27_Conditional_6_Template, 2, 0);
    \u0275\u0275conditionalCreate(7, MapEditorComponent_Conditional_27_Conditional_7_Template, 2, 0);
    \u0275\u0275conditionalCreate(8, MapEditorComponent_Conditional_27_Conditional_8_Template, 2, 0);
    \u0275\u0275conditionalCreate(9, MapEditorComponent_Conditional_27_Conditional_9_Template, 2, 0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.tabs);
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r3.isTerrainTab() ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.tab() === "symbols" ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.tab() === "regions" ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.tab() === "labels" ? 9 : -1);
  }
}
function MapEditorComponent_Conditional_31_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 41);
  }
  if (rf & 2) {
    const m_r13 = ctx;
    \u0275\u0275styleProp("left", m_r13.x, "px")("top", m_r13.y, "px")("width", m_r13.w, "px")("height", m_r13.h, "px");
  }
}
function MapEditorComponent_Conditional_32_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 25);
    \u0275\u0275text(1, "Karte wird geladen \u2026");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_33_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 26)(1, "div")(2, "strong");
    \u0275\u0275text(3, "Grafikkontext verloren.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "p");
    \u0275\u0275text(5, "Die Karte kann nicht mehr gezeichnet werden. Bitte die Seite neu laden.");
    \u0275\u0275elementEnd()()();
  }
}
function MapEditorComponent_Conditional_34_For_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 44)(1, "em");
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const s_r15 = ctx.$implicit;
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(s_r15.label);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(s_r15.value);
  }
}
function MapEditorComponent_Conditional_34_For_13_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 47)(1, "span", 48);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "span", 49);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span", 50);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "span", 51);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const e_r16 = ctx.$implicit;
    \u0275\u0275classProp("warn", e_r16.kind.startsWith("fetch:err") || e_r16.kind === "upload:fail");
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(e_r16.t);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(e_r16.kind);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(e_r16.tile);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(e_r16.detail);
  }
}
function MapEditorComponent_Conditional_34_Template(rf, ctx) {
  if (rf & 1) {
    const _r14 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 27)(1, "div", 42)(2, "strong");
    \u0275\u0275text(3, "Streaming");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_34_Template_button_click_4_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.resetDiagnostics());
    });
    \u0275\u0275text(5, "Reset");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_34_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r14);
      const ctx_r3 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r3.dumpDiagnostics());
    });
    \u0275\u0275text(7, "Konsole");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 43);
    \u0275\u0275repeaterCreate(9, MapEditorComponent_Conditional_34_For_10_Template, 4, 2, "span", 44, _forTrack1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "div", 45);
    \u0275\u0275repeaterCreate(12, MapEditorComponent_Conditional_34_For_13_Template, 9, 6, "div", 46, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(9);
    \u0275\u0275repeater(ctx_r3.diagSummary());
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r3.diagEvents());
  }
}
function MapEditorComponent_Conditional_46_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 53);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(ctx_r3.assetsError());
  }
}
function MapEditorComponent_Conditional_46_Conditional_4_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r18 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 64);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_4_For_5_Template_button_click_0_listener() {
      const p_r19 = \u0275\u0275restoreView(_r18).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.applyBrushProfile(p_r19.id));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const p_r19 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.activeProfile() === p_r19.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", p_r19.label, " ");
  }
}
function MapEditorComponent_Conditional_46_Conditional_4_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    const _r20 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 62)(1, "span");
    \u0275\u0275text(2, "Rauschen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 60);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_4_Conditional_25_Template_input_input_3_listener($event) {
      \u0275\u0275restoreView(_r20);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.brushNoise.set(+$event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "em");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r3.brushNoise());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.brushNoise() * 100).toFixed(0), "%");
  }
}
function MapEditorComponent_Conditional_46_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Profil");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 56);
    \u0275\u0275repeaterCreate(4, MapEditorComponent_Conditional_46_Conditional_4_For_5_Template, 2, 3, "button", 57, _forTrack0);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 54)(7, "label", 58)(8, "span");
    \u0275\u0275text(9, "Gr\xF6\xDFe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 59);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_4_Template_input_input_10_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setBrushSize($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "em");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "label", 58)(14, "span");
    \u0275\u0275text(15, "Weichheit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "input", 60);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_4_Template_input_input_16_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setSoftness($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "em");
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "label", 58)(20, "span");
    \u0275\u0275text(21, "St\xE4rke");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "input", 61);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_4_Template_input_input_22_listener($event) {
      \u0275\u0275restoreView(_r17);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setStrength($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "em");
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(25, MapEditorComponent_Conditional_46_Conditional_4_Conditional_25_Template, 6, 2, "label", 62);
    \u0275\u0275elementStart(26, "p", 63);
    \u0275\u0275text(27, "Shift + ziehen oder Strg + Mausrad \xE4ndert die Gr\xF6\xDFe.");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r3.brushProfiles);
    \u0275\u0275advance(6);
    \u0275\u0275property("value", ctx_r3.brushSize());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.brushSize());
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.brushSoftness());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.brushSoftness() * 100).toFixed(0), "%");
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.brushStrength());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.brushStrength() * 100).toFixed(0), "%");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.showNoiseSetting() ? 25 : -1);
  }
}
function MapEditorComponent_Conditional_46_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r21 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "label", 58)(2, "span");
    \u0275\u0275text(3, "Gr\xF6\xDFe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "input", 65);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_5_Template_input_input_4_listener($event) {
      \u0275\u0275restoreView(_r21);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setBrushSize($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "em");
    \u0275\u0275text(6);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "p", 63);
    \u0275\u0275text(8, "Jeder Klick erzeugt eine neue Form.");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.brushSize());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.brushSize());
  }
}
function MapEditorComponent_Conditional_46_Conditional_6_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r23 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 67)(1, "button", 70);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_6_For_5_Template_button_click_1_listener() {
      const $index_r24 = \u0275\u0275restoreView(_r23).$index;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectLandColor($index_r24));
    })("dblclick", function MapEditorComponent_Conditional_46_Conditional_6_For_5_Template_button_dblclick_1_listener() {
      \u0275\u0275restoreView(_r23);
      const landEdit_r25 = \u0275\u0275reference(3);
      return \u0275\u0275resetView(landEdit_r25.click());
    })("contextmenu", function MapEditorComponent_Conditional_46_Conditional_6_For_5_Template_button_contextmenu_1_listener($event) {
      const $index_r24 = \u0275\u0275restoreView(_r23).$index;
      const ctx_r3 = \u0275\u0275nextContext(3);
      ctx_r3.removeLandColor($index_r24);
      return \u0275\u0275resetView($event.preventDefault());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "input", 71, 1);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_6_For_5_Template_input_input_2_listener($event) {
      const $index_r24 = \u0275\u0275restoreView(_r23).$index;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.editLandColor($index_r24, $event.target.value));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const c_r26 = ctx.$implicit;
    const $index_r24 = ctx.$index;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", c_r26);
    \u0275\u0275classProp("active", ctx_r3.selectedLand() === $index_r24);
    \u0275\u0275property("title", c_r26 + " \u2014 Rechtsklick entfernt, Doppelklick \xE4ndert");
    \u0275\u0275advance();
    \u0275\u0275property("value", c_r26);
  }
}
function MapEditorComponent_Conditional_46_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    const _r22 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Landfarbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 66);
    \u0275\u0275repeaterCreate(4, MapEditorComponent_Conditional_46_Conditional_6_For_5_Template, 4, 6, "span", 67, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementStart(6, "label", 68);
    \u0275\u0275text(7, " + ");
    \u0275\u0275elementStart(8, "input", 69);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_6_Template_input_change_8_listener($event) {
      \u0275\u0275restoreView(_r22);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.addLandColor($event.target.value));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(9, "p", 63);
    \u0275\u0275text(10, "Ohne Auswahl wird neues Land wei\xDF gezeichnet.");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r3.landPalette());
  }
}
function MapEditorComponent_Conditional_46_Conditional_7_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r28 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "span", 67)(1, "button", 70);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_7_For_5_Template_button_click_1_listener() {
      const $index_r29 = \u0275\u0275restoreView(_r28).$index;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectWaterColor($index_r29));
    })("dblclick", function MapEditorComponent_Conditional_46_Conditional_7_For_5_Template_button_dblclick_1_listener() {
      \u0275\u0275restoreView(_r28);
      const waterEdit_r30 = \u0275\u0275reference(3);
      return \u0275\u0275resetView(waterEdit_r30.click());
    })("contextmenu", function MapEditorComponent_Conditional_46_Conditional_7_For_5_Template_button_contextmenu_1_listener($event) {
      const $index_r29 = \u0275\u0275restoreView(_r28).$index;
      const ctx_r3 = \u0275\u0275nextContext(3);
      ctx_r3.removeWaterColor($index_r29);
      return \u0275\u0275resetView($event.preventDefault());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "input", 71, 2);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_7_For_5_Template_input_input_2_listener($event) {
      const $index_r29 = \u0275\u0275restoreView(_r28).$index;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.editWaterColor($index_r29, $event.target.value));
    });
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const c_r31 = ctx.$implicit;
    const $index_r29 = ctx.$index;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", c_r31);
    \u0275\u0275classProp("active", ctx_r3.selectedWater() === $index_r29);
    \u0275\u0275property("title", c_r31 + " \u2014 Rechtsklick entfernt, Doppelklick \xE4ndert");
    \u0275\u0275advance();
    \u0275\u0275property("value", c_r31);
  }
}
function MapEditorComponent_Conditional_46_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r27 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Wasserfarbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "div", 66);
    \u0275\u0275repeaterCreate(4, MapEditorComponent_Conditional_46_Conditional_7_For_5_Template, 4, 6, "span", 67, \u0275\u0275repeaterTrackByIndex);
    \u0275\u0275elementStart(6, "label", 68);
    \u0275\u0275text(7, " + ");
    \u0275\u0275elementStart(8, "input", 72);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_7_Template_input_change_8_listener($event) {
      \u0275\u0275restoreView(_r27);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.addWaterColor($event.target.value));
    });
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(4);
    \u0275\u0275repeater(ctx_r3.waterPalette());
  }
}
function MapEditorComponent_Conditional_46_Conditional_8_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r3.visibleSprites().length, " Treffer");
  }
}
function MapEditorComponent_Conditional_46_Conditional_8_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r33 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 83);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_8_For_5_Template_button_click_0_listener() {
      const s_r34 = \u0275\u0275restoreView(_r33).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectSprite(s_r34));
    });
    \u0275\u0275element(1, "span", 84);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const s_r34 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275classProp("active", ctx_r3.currentSprite() === s_r34);
    \u0275\u0275property("title", ctx_r3.spriteName(s_r34));
    \u0275\u0275advance();
    \u0275\u0275property("ngStyle", ctx_r3.spriteThumb(s_r34));
  }
}
function MapEditorComponent_Conditional_46_Conditional_8_Conditional_21_Template(rf, ctx) {
  if (rf & 1) {
    const _r35 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 79)(1, "input", 81);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_8_Conditional_21_Template_input_change_1_listener($event) {
      \u0275\u0275restoreView(_r35);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.autoVary.set($event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "Nach dem Setzen variieren");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r3.autoVary());
  }
}
function MapEditorComponent_Conditional_46_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r32 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "input", 73);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_8_Template_input_input_1_listener($event) {
      \u0275\u0275restoreView(_r32);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.symbolQuery.set($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(2, MapEditorComponent_Conditional_46_Conditional_8_Conditional_2_Template, 2, 1, "p", 63);
    \u0275\u0275elementStart(3, "div", 74);
    \u0275\u0275repeaterCreate(4, MapEditorComponent_Conditional_46_Conditional_8_For_5_Template, 2, 4, "button", 75, \u0275\u0275repeaterTrackByIdentity);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "p", 63);
    \u0275\u0275text(7, "Shift + Mausrad wechselt zum n\xE4chsten Symbol.");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(8, "div", 54)(9, "label", 58)(10, "span");
    \u0275\u0275text(11, "Gr\xF6\xDFe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "input", 76);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_8_Template_input_input_12_listener($event) {
      \u0275\u0275restoreView(_r32);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setSymbolScale($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "em");
    \u0275\u0275text(14);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(15, "label", 77)(16, "span");
    \u0275\u0275text(17, "Drehung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(18, "input", 78);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_8_Template_input_input_18_listener($event) {
      \u0275\u0275restoreView(_r32);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.rotationJitter.set(+$event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "em");
    \u0275\u0275text(20);
    \u0275\u0275elementEnd()();
    \u0275\u0275conditionalCreate(21, MapEditorComponent_Conditional_46_Conditional_8_Conditional_21_Template, 4, 1, "label", 79);
    \u0275\u0275elementStart(22, "label", 80)(23, "input", 81);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_8_Template_input_change_23_listener($event) {
      \u0275\u0275restoreView(_r32);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.flipJitter.set($event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(24, "span");
    \u0275\u0275text(25, "Zuf\xE4llig spiegeln");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(26, "label", 82)(27, "input", 81);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_8_Template_input_change_27_listener($event) {
      \u0275\u0275restoreView(_r32);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.placeSecret.set($event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "span");
    \u0275\u0275text(29, "Als Geheimnis platzieren");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(30, "p", 63);
    \u0275\u0275text(31, "Shift + ziehen skaliert \xB7 Alt + Klick entfernt");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275property("value", ctx_r3.symbolQuery());
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.symbolQuery() ? 2 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275repeater(ctx_r3.visibleSprites());
    \u0275\u0275advance(8);
    \u0275\u0275property("value", ctx_r3.symbolScale());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", ctx_r3.symbolScale().toFixed(2), "\xD7");
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.rotationJitter());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("\xB1", ctx_r3.rotationJitter(), "\xB0");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.symbolVaries() ? 21 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("checked", ctx_r3.flipJitter());
    \u0275\u0275advance(4);
    \u0275\u0275property("checked", ctx_r3.placeSecret());
  }
}
function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r36 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 85)(3, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.scaleSelected(1 / 1.2));
    });
    \u0275\u0275text(4, "Kleiner");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.scaleSelected(1.2));
    });
    \u0275\u0275text(6, "Gr\xF6\xDFer");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "div", 85)(8, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_8_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.rotateSelected(-0.2618));
    });
    \u0275\u0275text(9, "\u21BA");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_10_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.rotateSelected(0.2618));
    });
    \u0275\u0275text(11, "\u21BB");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(12, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_12_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.flipSelected());
    });
    \u0275\u0275text(13, "Spiegeln");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(14, "div", 85)(15, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_15_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.toggleSelectedSecret());
    });
    \u0275\u0275text(16, "Geheim umschalten");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(17, "div", 85)(18, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template_button_click_18_listener() {
      \u0275\u0275restoreView(_r36);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.deleteSelected());
    });
    \u0275\u0275text(19, "L\xF6schen (Entf)");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("", ctx_r3.selectedIds().length, " ausgew\xE4hlt");
  }
}
function MapEditorComponent_Conditional_46_Conditional_9_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1, " Symbol anklicken oder Rahmen ziehen \xB7 Shift f\xFCr Mehrfachauswahl \xB7 ziehen zum Verschieben ");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_46_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 54);
    \u0275\u0275conditionalCreate(1, MapEditorComponent_Conditional_46_Conditional_9_Conditional_1_Template, 20, 1)(2, MapEditorComponent_Conditional_46_Conditional_9_Conditional_2_Template, 2, 0, "p", 63);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.selectedIds().length ? 1 : 2);
  }
}
function MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r39 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 85)(1, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Conditional_3_Template_button_click_1_listener() {
      \u0275\u0275restoreView(_r39);
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.finishRegion());
    });
    \u0275\u0275text(2, "Schlie\xDFen");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Conditional_3_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r39);
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.cancelDraft());
    });
    \u0275\u0275text(4, "Abbrechen");
    \u0275\u0275elementEnd()();
  }
}
function MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Template(rf, ctx) {
  if (rf & 1) {
    const _r38 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "p", 63);
    \u0275\u0275text(2, " Klicken setzt Punkte \xB7 Enter schlie\xDFt die Region \xB7 R\xFCcktaste nimmt den letzten Punkt zur\xFCck \xB7 Esc bricht ab ");
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Conditional_3_Template, 5, 0, "div", 85);
    \u0275\u0275elementStart(4, "label", 82)(5, "input", 81);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Template_input_change_5_listener($event) {
      \u0275\u0275restoreView(_r38);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.placeSecret.set($event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "span");
    \u0275\u0275text(7, "Als Geheimnis");
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275conditional(ctx_r3.draftPoints().length ? 3 : -1);
    \u0275\u0275advance(2);
    \u0275\u0275property("checked", ctx_r3.placeSecret());
  }
}
function MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r40 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1, " Punkte ziehen zum Bearbeiten \xB7 Rahmen im leeren Bereich w\xE4hlt mehrere Punkte \xB7 einen gew\xE4hlten Punkt ziehen verschiebt alle ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 85)(3, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Conditional_1_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r40);
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.selectAllRegionPoints());
    });
    \u0275\u0275text(4, "Alle Punkte");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(5, "div", 85)(6, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Conditional_1_Template_button_click_6_listener() {
      \u0275\u0275restoreView(_r40);
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.deleteSelectedRegion());
    });
    \u0275\u0275text(7, "L\xF6schen (Entf)");
    \u0275\u0275elementEnd()();
  }
}
function MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1, "Auf eine Regionslinie klicken.");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 54);
    \u0275\u0275conditionalCreate(1, MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Conditional_1_Template, 8, 0)(2, MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Conditional_2_Template, 2, 0, "p", 63);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.selectedRegionId() ? 1 : 2);
  }
}
function MapEditorComponent_Conditional_46_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    const _r37 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Stil");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "label", 86)(4, "span");
    \u0275\u0275text(5, "Linie");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 87);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_10_Template_input_input_6_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.regionColor.set($event.target.value);
      return \u0275\u0275resetView(ctx_r3.applyRegionStyle());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "label", 58)(8, "span");
    \u0275\u0275text(9, "Dicke");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 88);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_10_Template_input_input_10_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.regionThickness.set(+$event.target.value);
      return \u0275\u0275resetView(ctx_r3.applyRegionStyle());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "em");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "label", 58)(14, "span");
    \u0275\u0275text(15, "Strich");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "input", 89);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_10_Template_input_input_16_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.regionDash.set(+$event.target.value);
      return \u0275\u0275resetView(ctx_r3.applyRegionStyle());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "em");
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "label", 58)(20, "span");
    \u0275\u0275text(21, "L\xFCcke");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "input", 90);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_10_Template_input_input_22_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.regionGap.set(+$event.target.value);
      return \u0275\u0275resetView(ctx_r3.applyRegionStyle());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "em");
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "label", 86)(26, "span");
    \u0275\u0275text(27, "F\xFCllung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "input", 87);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_10_Template_input_input_28_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.regionFill.set($event.target.value);
      return \u0275\u0275resetView(ctx_r3.applyRegionStyle());
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "label", 58)(30, "span");
    \u0275\u0275text(31, "Deckkraft");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "input", 91);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_10_Template_input_input_32_listener($event) {
      \u0275\u0275restoreView(_r37);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.regionFillAlpha.set(+$event.target.value);
      return \u0275\u0275resetView(ctx_r3.applyRegionStyle());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(33, "em");
    \u0275\u0275text(34);
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(35, MapEditorComponent_Conditional_46_Conditional_10_Conditional_35_Template, 8, 2, "div", 54)(36, MapEditorComponent_Conditional_46_Conditional_10_Conditional_36_Template, 3, 1, "div", 54);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275property("value", ctx_r3.regionColor());
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.regionThickness());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.regionThickness());
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.regionDash());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.regionDash());
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.regionGap());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.regionGap());
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.regionFill());
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.regionFillAlpha());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.regionFillAlpha() * 100).toFixed(0), "%");
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.regionTool() === "draw" ? 35 : 36);
  }
}
function MapEditorComponent_Conditional_46_Conditional_11_Conditional_42_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span", 98);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("\xB7 ", ctx);
  }
}
function MapEditorComponent_Conditional_46_Conditional_11_For_44_Template(rf, ctx) {
  if (rf & 1) {
    const _r42 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 85)(1, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_11_For_44_Template_button_click_1_listener() {
      const p_r43 = \u0275\u0275restoreView(_r42).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.applyLabelPreset(p_r43.id));
    });
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "button", 100);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_11_For_44_Template_button_click_3_listener() {
      const p_r43 = \u0275\u0275restoreView(_r42).$implicit;
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.removeLabelPreset(p_r43.id));
    });
    \u0275\u0275text(4, "\xD7");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const p_r43 = ctx.$implicit;
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275classProp("active-preset", ctx_r3.activePresetId() === p_r43.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", p_r43.name, " ");
  }
}
function MapEditorComponent_Conditional_46_Conditional_11_Conditional_53_Template(rf, ctx) {
  if (rf & 1) {
    const _r45 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 82)(1, "input", 81);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_11_Conditional_53_Template_input_change_1_listener($event) {
      \u0275\u0275restoreView(_r45);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.placeSecret.set($event.target.checked));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "span");
    \u0275\u0275text(3, "Als Geheimnis");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "p", 63);
    \u0275\u0275text(5, "Klicken setzt die Beschriftung.");
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275property("checked", ctx_r3.placeSecret());
  }
}
function MapEditorComponent_Conditional_46_Conditional_11_Conditional_54_Template(rf, ctx) {
  if (rf & 1) {
    const _r46 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(2, "div", 85)(3, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_11_Conditional_54_Template_button_click_3_listener() {
      \u0275\u0275restoreView(_r46);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.deleteSelectedLabel());
    });
    \u0275\u0275text(4, "L\xF6schen (Entf)");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r3.selectedLabelIds().length, " ausgew\xE4hlt \xB7 ziehen zum Verschieben ");
  }
}
function MapEditorComponent_Conditional_46_Conditional_11_Conditional_55_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 63);
    \u0275\u0275text(1, " Auf eine Beschriftung klicken \xB7 Shift f\xFCr Mehrfachauswahl \xB7 Rahmen ziehen ");
    \u0275\u0275elementEnd();
  }
}
function MapEditorComponent_Conditional_46_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    const _r41 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Text");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 92);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_3_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.onLabelTextInput($event.target.value));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 54)(5, "div", 55);
    \u0275\u0275text(6, "Stil");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "label", 58)(8, "span");
    \u0275\u0275text(9, "Gr\xF6\xDFe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "input", 93);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_10_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setLabelStyle("fontSize", +$event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(11, "em");
    \u0275\u0275text(12);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(13, "label", 94)(14, "span");
    \u0275\u0275text(15, "Kr\xFCmmung");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(16, "input", 95);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_16_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setLabelStyle("curvature", +$event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "em");
    \u0275\u0275text(18);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(19, "label", 58)(20, "span");
    \u0275\u0275text(21, "Abstand");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "input", 96);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_22_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setLabelStyle("letterSpacing", +$event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(23, "em");
    \u0275\u0275text(24);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(25, "label", 86)(26, "span");
    \u0275\u0275text(27, "F\xFCllfarbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(28, "input", 87);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_28_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setLabelStyle("fill", $event.target.value));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(29, "label", 86)(30, "span");
    \u0275\u0275text(31, "Kontur");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "input", 87);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_32_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setLabelStyle("outline", $event.target.value));
    });
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "label", 58)(34, "span");
    \u0275\u0275text(35, "Konturbr.");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(36, "input", 97);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_input_36_listener($event) {
      \u0275\u0275restoreView(_r41);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setLabelStyle("outlineWidth", +$event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "em");
    \u0275\u0275text(38);
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(39, "div", 54)(40, "div", 55);
    \u0275\u0275text(41, " Vorlagen ");
    \u0275\u0275conditionalCreate(42, MapEditorComponent_Conditional_46_Conditional_11_Conditional_42_Template, 2, 1, "span", 98);
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(43, MapEditorComponent_Conditional_46_Conditional_11_For_44_Template, 5, 3, "div", 85, _forTrack0);
    \u0275\u0275elementStart(45, "p", 63);
    \u0275\u0275text(46, " Gleicher Name \xFCberschreibt die Vorlage und \xE4ndert alle Beschriftungen, die sie nutzen. ");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(47, "div", 85)(48, "input", 99, 3);
    \u0275\u0275listener("keydown.enter", function MapEditorComponent_Conditional_46_Conditional_11_Template_input_keydown_enter_48_listener() {
      \u0275\u0275restoreView(_r41);
      const presetName_r44 = \u0275\u0275reference(49);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.saveLabelPreset(presetName_r44.value);
      return \u0275\u0275resetView(presetName_r44.value = "");
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(50, "button", 100);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_11_Template_button_click_50_listener() {
      \u0275\u0275restoreView(_r41);
      const presetName_r44 = \u0275\u0275reference(49);
      const ctx_r3 = \u0275\u0275nextContext(2);
      ctx_r3.saveLabelPreset(presetName_r44.value);
      return \u0275\u0275resetView(presetName_r44.value = "");
    });
    \u0275\u0275text(51, " + ");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(52, "div", 54);
    \u0275\u0275conditionalCreate(53, MapEditorComponent_Conditional_46_Conditional_11_Conditional_53_Template, 6, 1)(54, MapEditorComponent_Conditional_46_Conditional_11_Conditional_54_Template, 5, 1)(55, MapEditorComponent_Conditional_46_Conditional_11_Conditional_55_Template, 2, 0, "p", 63);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    let tmp_15_0;
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r3.labelText());
    \u0275\u0275advance(7);
    \u0275\u0275property("value", ctx_r3.labelStyle().fontSize);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.labelStyle().fontSize);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.labelStyle().curvature);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.labelStyle().curvature.toFixed(2));
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.labelStyle().letterSpacing);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.labelStyle().letterSpacing);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.labelStyle().fill);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.labelStyle().outline);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.labelStyle().outlineWidth);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.labelStyle().outlineWidth);
    \u0275\u0275advance(4);
    \u0275\u0275conditional((tmp_15_0 = ctx_r3.activePresetName()) ? 42 : -1, tmp_15_0);
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r3.labelPresets());
    \u0275\u0275advance(10);
    \u0275\u0275conditional(ctx_r3.labelTool() === "place" ? 53 : ctx_r3.selectedLabelIds().length ? 54 : 55);
  }
}
function MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_For_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 111);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const p_r49 = ctx.$implicit;
    \u0275\u0275property("value", p_r49.id);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(p_r49.name);
  }
}
function MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_Conditional_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r50 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "label", 58)(1, "span");
    \u0275\u0275text(2, "St\xE4rke");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "input", 60);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_Conditional_8_Template_input_input_3_listener($event) {
      \u0275\u0275restoreView(_r50);
      const ctx_r3 = \u0275\u0275nextContext(4);
      return \u0275\u0275resetView(ctx_r3.setPaperOpacity($event.target.value));
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "em");
    \u0275\u0275text(5);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(4);
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r3.paperOpacity());
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.paperOpacity() * 100).toFixed(0), "%");
  }
}
function MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_Template(rf, ctx) {
  if (rf & 1) {
    const _r48 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Papierstruktur");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "select", 109);
    \u0275\u0275listener("change", function MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_Template_select_change_3_listener($event) {
      \u0275\u0275restoreView(_r48);
      const ctx_r3 = \u0275\u0275nextContext(3);
      return \u0275\u0275resetView(ctx_r3.selectPaper($event.target.value));
    });
    \u0275\u0275elementStart(4, "option", 110);
    \u0275\u0275text(5, "Keine");
    \u0275\u0275elementEnd();
    \u0275\u0275repeaterCreate(6, MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_For_7_Template, 2, 2, "option", 111, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(8, MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_Conditional_8_Template, 6, 2, "label", 58);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(3);
    \u0275\u0275property("value", ctx_r3.paperTexture());
    \u0275\u0275advance(3);
    \u0275\u0275repeater(ctx_r3.paperOptions());
    \u0275\u0275advance(2);
    \u0275\u0275conditional(ctx_r3.paperTexture() ? 8 : -1);
  }
}
function MapEditorComponent_Conditional_46_Conditional_12_Template(rf, ctx) {
  if (rf & 1) {
    const _r47 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 54)(1, "div", 55);
    \u0275\u0275text(2, "Meerfarbe");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "label", 101)(4, "span");
    \u0275\u0275text(5, "Offenes Wasser");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(6, "input", 87);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_6_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setWaterBase($event.target.value));
    });
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(7, "div", 54)(8, "div", 55);
    \u0275\u0275text(9, "K\xFCstenlinie");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(10, "label", 102)(11, "span");
    \u0275\u0275text(12, "Grobheit");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "input", 103);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_13_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setCoast("noiseScale", +$event.target.value));
    })("change", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_change_13_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.commitCoast());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(14, "em");
    \u0275\u0275text(15);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(16, "label", 104)(17, "span");
    \u0275\u0275text(18, "Zerfranst");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(19, "input", 105);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_19_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setCoast("noiseAmount", +$event.target.value));
    })("change", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_change_19_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.commitCoast());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(20, "em");
    \u0275\u0275text(21);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(22, "label", 58)(23, "span");
    \u0275\u0275text(24, "Uferband");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(25, "input", 106);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_25_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setCoast("shoreWidth", +$event.target.value));
    })("change", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_change_25_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.commitCoast());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(26, "em");
    \u0275\u0275text(27);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(28, "label", 58)(29, "span");
    \u0275\u0275text(30, "Ufer hell");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(31, "input", 107);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_31_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setCoast("shoreLight", +$event.target.value));
    })("change", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_change_31_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.commitCoast());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(32, "em");
    \u0275\u0275text(33);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(34, "label", 58)(35, "span");
    \u0275\u0275text(36, "Schatten");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(37, "input", 105);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_37_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setCoast("shadowStrength", +$event.target.value));
    })("change", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_change_37_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.commitCoast());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(38, "em");
    \u0275\u0275text(39);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(40, "label", 58)(41, "span");
    \u0275\u0275text(42, "Sch.-breite");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "input", 108);
    \u0275\u0275listener("input", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_input_43_listener($event) {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.setCoast("shadowWidth", +$event.target.value));
    })("change", function MapEditorComponent_Conditional_46_Conditional_12_Template_input_change_43_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.commitCoast());
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(44, "em");
    \u0275\u0275text(45);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(46, "div", 85)(47, "button", 12);
    \u0275\u0275listener("click", function MapEditorComponent_Conditional_46_Conditional_12_Template_button_click_47_listener() {
      \u0275\u0275restoreView(_r47);
      const ctx_r3 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r3.resetCoast());
    });
    \u0275\u0275text(48, "Zur\xFCcksetzen");
    \u0275\u0275elementEnd()()();
    \u0275\u0275conditionalCreate(49, MapEditorComponent_Conditional_46_Conditional_12_Conditional_49_Template, 9, 2, "div", 54);
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext(2);
    \u0275\u0275advance(6);
    \u0275\u0275property("value", ctx_r3.waterBase());
    \u0275\u0275advance(7);
    \u0275\u0275property("value", ctx_r3.coast().noiseScale);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.coast().noiseScale);
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.coast().noiseAmount);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.coast().noiseAmount * 100).toFixed(0), "%");
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.coast().shoreWidth);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate((ctx_r3.coast().shoreWidth * 100).toFixed(0));
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.coast().shoreLight);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.coast().shoreLight * 100).toFixed(0), "%");
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.coast().shadowStrength);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate1("", (ctx_r3.coast().shadowStrength * 100).toFixed(0), "%");
    \u0275\u0275advance(4);
    \u0275\u0275property("value", ctx_r3.coast().shadowWidth);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate((ctx_r3.coast().shadowWidth * 100).toFixed(0));
    \u0275\u0275advance(4);
    \u0275\u0275conditional(ctx_r3.paperOptions().length ? 49 : -1);
  }
}
function MapEditorComponent_Conditional_46_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "aside", 30)(1, "div", 52);
    \u0275\u0275text(2);
    \u0275\u0275elementEnd();
    \u0275\u0275conditionalCreate(3, MapEditorComponent_Conditional_46_Conditional_3_Template, 2, 1, "p", 53);
    \u0275\u0275conditionalCreate(4, MapEditorComponent_Conditional_46_Conditional_4_Template, 28, 7);
    \u0275\u0275conditionalCreate(5, MapEditorComponent_Conditional_46_Conditional_5_Template, 9, 2, "div", 54);
    \u0275\u0275conditionalCreate(6, MapEditorComponent_Conditional_46_Conditional_6_Template, 11, 0, "div", 54);
    \u0275\u0275conditionalCreate(7, MapEditorComponent_Conditional_46_Conditional_7_Template, 9, 0, "div", 54);
    \u0275\u0275conditionalCreate(8, MapEditorComponent_Conditional_46_Conditional_8_Template, 32, 9);
    \u0275\u0275conditionalCreate(9, MapEditorComponent_Conditional_46_Conditional_9_Template, 3, 1, "div", 54);
    \u0275\u0275conditionalCreate(10, MapEditorComponent_Conditional_46_Conditional_10_Template, 37, 11);
    \u0275\u0275conditionalCreate(11, MapEditorComponent_Conditional_46_Conditional_11_Template, 56, 13);
    \u0275\u0275conditionalCreate(12, MapEditorComponent_Conditional_46_Conditional_12_Template, 50, 14);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r3 = \u0275\u0275nextContext();
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r3.activeToolLabel());
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.assetsError() ? 3 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.showBrushSettings() ? 4 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.isTerrainTab() && ctx_r3.terrainTool() === "lakeStamp" ? 5 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.showLandPalette() ? 6 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.showWaterPalette() ? 7 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.isPlacingSymbols() ? 8 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.isSelecting() ? 9 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.tab() === "regions" ? 10 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.tab() === "labels" ? 11 : -1);
    \u0275\u0275advance();
    \u0275\u0275conditional(ctx_r3.tab() === "map" ? 12 : -1);
  }
}
var MapEditorComponent = class _MapEditorComponent {
  route = inject(ActivatedRoute);
  store = inject(MapEditorStoreService);
  api = inject(MapEditorApiService);
  auth = inject(AuthService);
  pixiHost;
  renderer = new MapRenderer();
  chunks;
  terrain;
  brushes;
  undoStack;
  assets = new MapAssets();
  symbols;
  regionView = new RegionView();
  labelView = new LabelView();
  /** Vertex of the selected region currently being dragged. */
  dragHandle = null;
  /** Labels currently being dragged, with their pre-drag copies for undo. */
  dragLabel = null;
  subs = [];
  resizeObserver;
  worldName = signal("", ...ngDevMode ? [{ debugName: "worldName" }] : []);
  ready = signal(false, ...ngDevMode ? [{ debugName: "ready" }] : []);
  isGM = computed(() => this.auth.isAdmin(), ...ngDevMode ? [{ debugName: "isGM" }] : []);
  zoomPct = signal(25, ...ngDevMode ? [{ debugName: "zoomPct" }] : []);
  cursorWorld = signal({ x: 0, y: 0 }, ...ngDevMode ? [{ debugName: "cursorWorld" }] : []);
  cursorHex = signal({ q: 0, r: 0 }, ...ngDevMode ? [{ debugName: "cursorHex" }] : []);
  showGrid = signal(true, ...ngDevMode ? [{ debugName: "showGrid" }] : []);
  kmPerHex = KM_PER_HEX;
  // ── tabs & tools ──
  tabs = TAB_DEFS;
  symbolTools = SYMBOL_TOOL_DEFS;
  regionTools = REGION_TOOL_DEFS;
  labelTools = LABEL_TOOL_DEFS;
  tab = signal("land", ...ngDevMode ? [{ debugName: "tab" }] : []);
  terrainTool = signal("landBrush", ...ngDevMode ? [{ debugName: "terrainTool" }] : []);
  symbolTool = signal("trees", ...ngDevMode ? [{ debugName: "symbolTool" }] : []);
  regionTool = signal("draw", ...ngDevMode ? [{ debugName: "regionTool" }] : []);
  labelTool = signal("place", ...ngDevMode ? [{ debugName: "labelTool" }] : []);
  icon = iconUrl;
  /** Icon tools shown under the active category. */
  terrainTools = computed(() => terrainToolsFor(this.tab()), ...ngDevMode ? [{ debugName: "terrainTools" }] : []);
  isTerrainTab = computed(() => this.tab() === "water" || this.tab() === "land", ...ngDevMode ? [{ debugName: "isTerrainTab" }] : []);
  /** The tool actually driving the pointer, derived from the active tab. */
  activeToolLabel = computed(() => {
    if (this.tab() === "symbols") {
      return this.symbolTools.find((t) => t.id === this.symbolTool())?.label ?? "";
    }
    return this.terrainTools().find((t) => t.id === this.terrainTool())?.label ?? "";
  }, ...ngDevMode ? [{ debugName: "activeToolLabel" }] : []);
  // Settings visibility, derived so no irrelevant control is ever shown.
  showBrushSettings = computed(() => this.isTerrainTab() && isBrushTool(this.terrainTool()), ...ngDevMode ? [{ debugName: "showBrushSettings" }] : []);
  showLandPalette = computed(() => this.isTerrainTab() && usesLandPalette(this.terrainTool()), ...ngDevMode ? [{ debugName: "showLandPalette" }] : []);
  showWaterPalette = computed(() => this.isTerrainTab() && usesWaterPalette(this.terrainTool()), ...ngDevMode ? [{ debugName: "showWaterPalette" }] : []);
  isPlacingSymbols = computed(() => this.tab() === "symbols" && this.symbolTool() !== "select", ...ngDevMode ? [{ debugName: "isPlacingSymbols" }] : []);
  isSelecting = computed(() => this.tab() === "symbols" && this.symbolTool() === "select", ...ngDevMode ? [{ debugName: "isSelecting" }] : []);
  /** Only bulk categories offer auto-variation; misc symbols stay as picked. */
  symbolVaries = computed(() => {
    const t = this.symbolTool();
    return t !== "select" && autoVaries(t);
  }, ...ngDevMode ? [{ debugName: "symbolVaries" }] : []);
  brushSize = signal(400, ...ngDevMode ? [{ debugName: "brushSize" }] : []);
  brushSoftness = signal(0.35, ...ngDevMode ? [{ debugName: "brushSoftness" }] : []);
  brushStrength = signal(1, ...ngDevMode ? [{ debugName: "brushStrength" }] : []);
  /** Raggedness of the raise/lower brushes. */
  brushNoise = signal(0.6, ...ngDevMode ? [{ debugName: "brushNoise" }] : []);
  /** Only the terrain-reshaping brushes are noisy. */
  showNoiseSetting = computed(() => this.terrainTool() === "heighten" || this.terrainTool() === "lower", ...ngDevMode ? [{ debugName: "showNoiseSetting" }] : []);
  brushProfiles = BRUSH_PROFILES;
  activeProfile = signal("soft", ...ngDevMode ? [{ debugName: "activeProfile" }] : []);
  /** Load a brush profile; the sliders stay available for fine-tuning afterwards. */
  applyBrushProfile(id) {
    const p = this.brushProfiles.find((x) => x.id === id);
    if (!p)
      return;
    this.activeProfile.set(id);
    this.brushSoftness.set(p.softness);
    this.brushStrength.set(p.strength);
    this.brushNoise.set(p.noise);
    this.redrawCursor();
  }
  landPalette = signal([], ...ngDevMode ? [{ debugName: "landPalette" }] : []);
  waterPalette = signal([], ...ngDevMode ? [{ debugName: "waterPalette" }] : []);
  selectedLand = signal(0, ...ngDevMode ? [{ debugName: "selectedLand" }] : []);
  selectedWater = signal(0, ...ngDevMode ? [{ debugName: "selectedWater" }] : []);
  /** Open sea's colour — the canvas nothing has been drawn on yet. */
  waterBase = signal("#3f6d8c", ...ngDevMode ? [{ debugName: "waterBase" }] : []);
  paperOptions = signal([], ...ngDevMode ? [{ debugName: "paperOptions" }] : []);
  paperTexture = signal("", ...ngDevMode ? [{ debugName: "paperTexture" }] : []);
  paperOpacity = signal(0.35, ...ngDevMode ? [{ debugName: "paperOpacity" }] : []);
  /** Coastline look — taste settings, tuned live and shared with everyone. */
  coast = signal(defaultCoast(), ...ngDevMode ? [{ debugName: "coast" }] : []);
  // ── symbols ──
  activeGroup = signal("", ...ngDevMode ? [{ debugName: "activeGroup" }] : []);
  /** Every sprite in the active category, shown flat — no group navigation. */
  categorySprites = signal([], ...ngDevMode ? [{ debugName: "categorySprites" }] : []);
  symbolQuery = signal("", ...ngDevMode ? [{ debugName: "symbolQuery" }] : []);
  /** What the picker shows: the category, narrowed by the search box. */
  visibleSprites = computed(() => this.assets.search(this.categorySprites(), this.symbolQuery()), ...ngDevMode ? [{ debugName: "visibleSprites" }] : []);
  currentSprite = signal("", ...ngDevMode ? [{ debugName: "currentSprite" }] : []);
  /** Alt mirrors the stamp while held. */
  mirrorStamp = signal(false, ...ngDevMode ? [{ debugName: "mirrorStamp" }] : []);
  symbolScale = signal(2, ...ngDevMode ? [{ debugName: "symbolScale" }] : []);
  /** Random rotation spread, in degrees, applied per placement. */
  rotationJitter = signal(0, ...ngDevMode ? [{ debugName: "rotationJitter" }] : []);
  /** Randomly mirror half the placements, so repeated symbols read less like clones. */
  flipJitter = signal(false, ...ngDevMode ? [{ debugName: "flipJitter" }] : []);
  placeSecret = signal(false, ...ngDevMode ? [{ debugName: "placeSecret" }] : []);
  /** Auto-advance to another variation after each placement. */
  autoVary = signal(true, ...ngDevMode ? [{ debugName: "autoVary" }] : []);
  selectedIds = signal([], ...ngDevMode ? [{ debugName: "selectedIds" }] : []);
  assetsReady = signal(false, ...ngDevMode ? [{ debugName: "assetsReady" }] : []);
  assetsError = signal(null, ...ngDevMode ? [{ debugName: "assetsError" }] : []);
  canUndo = signal(false, ...ngDevMode ? [{ debugName: "canUndo" }] : []);
  canRedo = signal(false, ...ngDevMode ? [{ debugName: "canRedo" }] : []);
  saving = signal(false, ...ngDevMode ? [{ debugName: "saving" }] : []);
  /** Set when the GPU context is lost — the map is blank until the page reloads. */
  contextLost = signal(false, ...ngDevMode ? [{ debugName: "contextLost" }] : []);
  /**
   * Detail tier the next stroke will land on.
   *
   * Shown in the status bar because it is now the single most important thing to know before
   * drawing: a stroke writes this tier and every coarser one, and never a finer one, so which
   * tier is active decides what the stroke can later be refined against.
   */
  detailTier = signal("high", ...ngDevMode ? [{ debugName: "detailTier" }] : []);
  detailTierLabel = computed(() => ({ high: "Hoch", med: "Mittel", low: "Grob" })[this.detailTier()], ...ngDevMode ? [{ debugName: "detailTierLabel" }] : []);
  // ── diagnostics ──
  diagOn = signal(false, ...ngDevMode ? [{ debugName: "diagOn" }] : []);
  diagSummary = signal([], ...ngDevMode ? [{ debugName: "diagSummary" }] : []);
  diagEvents = signal([], ...ngDevMode ? [{ debugName: "diagEvents" }] : []);
  diagTimer = null;
  /**
   * Turn the streaming instrumentation on.
   *
   * Off by default and inert when off: the instrumented paths are the hot ones, and a
   * diagnostic that costs frames changes the thing it is meant to measure.
   */
  toggleDiagnostics() {
    const on = !this.diagOn();
    this.diagOn.set(on);
    mapDiag.enabled = on;
    this.terrain?.setDebug(on);
    if (this.diagTimer)
      clearInterval(this.diagTimer);
    this.diagTimer = null;
    if (on) {
      mapDiag.reset();
      this.diagTimer = setInterval(() => {
        this.diagSummary.set(mapDiag.summary);
        this.diagEvents.set(mapDiag.recent(26).reverse());
      }, 400);
    } else {
      this.diagSummary.set([]);
      this.diagEvents.set([]);
    }
    this.scheduleStream();
  }
  resetDiagnostics() {
    mapDiag.reset();
    this.diagSummary.set(mapDiag.summary);
    this.diagEvents.set([]);
  }
  /** Print the full timeline to the console, for pasting into a bug report. */
  dumpDiagnostics() {
    mapDiag.dump();
  }
  /** Rubber-band rectangle in screen space while box-selecting. */
  marquee = signal(null, ...ngDevMode ? [{ debugName: "marquee" }] : []);
  // ── regions ──
  /** Vertices of the region being drawn; empty when not drawing. */
  draftPoints = signal([], ...ngDevMode ? [{ debugName: "draftPoints" }] : []);
  regionColor = signal("#c0392b", ...ngDevMode ? [{ debugName: "regionColor" }] : []);
  regionThickness = signal(24, ...ngDevMode ? [{ debugName: "regionThickness" }] : []);
  regionDash = signal(110, ...ngDevMode ? [{ debugName: "regionDash" }] : []);
  regionGap = signal(80, ...ngDevMode ? [{ debugName: "regionGap" }] : []);
  regionFill = signal("#c0392b", ...ngDevMode ? [{ debugName: "regionFill" }] : []);
  regionFillAlpha = signal(0.12, ...ngDevMode ? [{ debugName: "regionFillAlpha" }] : []);
  selectedRegionId = signal(null, ...ngDevMode ? [{ debugName: "selectedRegionId" }] : []);
  // ── labels ──
  labelStyle = signal(defaultLabelStyle(), ...ngDevMode ? [{ debugName: "labelStyle" }] : []);
  labelText = signal("Neuer Name", ...ngDevMode ? [{ debugName: "labelText" }] : []);
  labelPresets = signal([], ...ngDevMode ? [{ debugName: "labelPresets" }] : []);
  selectedLabelIds = signal([], ...ngDevMode ? [{ debugName: "selectedLabelIds" }] : []);
  /** Preset the panel is currently following, so it is visible which one is in use. */
  activePresetId = signal(null, ...ngDevMode ? [{ debugName: "activePresetId" }] : []);
  activePresetName = computed(() => this.labelPresets().find((p) => p.id === this.activePresetId())?.name ?? null, ...ngDevMode ? [{ debugName: "activePresetName" }] : []);
  /** Single selection drives the text/style editors; multi-selection only moves. */
  selectedLabelId = computed(() => this.selectedLabelIds().length === 1 ? this.selectedLabelIds()[0] : null, ...ngDevMode ? [{ debugName: "selectedLabelId" }] : []);
  isPanning = false;
  isPainting = false;
  lastPointer = { x: 0, y: 0 };
  brushResize = null;
  dragSymbols = null;
  boxSelect = null;
  streamScheduled = false;
  flushTimer = null;
  lakeSeed = Math.floor(Math.random() * 1e9);
  /** World-space extent of the stroke in progress, for bounded post-stroke work. */
  strokeBounds = null;
  /**
   * Detail tier the stroke in progress writes to.
   *
   * Fixed at stroke start rather than read per dab: a tier switch halfway through would
   * leave the first half of one stroke in a different grid from the second.
   */
  strokeTier = "high";
  cursorGraphic = new Graphics();
  previewSprite = new Sprite();
  lastWorld = null;
  async ngAfterViewInit() {
    const host = this.pixiHost?.nativeElement;
    if (!host)
      return;
    const world = this.route.snapshot.paramMap.get("worldName") ?? "";
    this.worldName.set(world);
    await this.renderer.init(host);
    this.renderer.onContextLost = () => this.contextLost.set(true);
    this.previewSprite.anchor.set(0.5);
    this.previewSprite.visible = false;
    this.renderer.cursorLayer.addChild(this.previewSprite, this.cursorGraphic);
    const data = await this.store.load(world);
    this.chunks = new ChunkManager(this.renderer.renderer, this.api, this.store, world);
    this.terrain = new TerrainView(this.chunks);
    this.renderer.terrainLayer.addChild(this.terrain.container);
    this.brushes = new BrushEngine(this.chunks, this.renderer.renderer);
    this.undoStack = new UndoStack(this.chunks, {
      // Undo replays through the store, so undoing a placement syncs as a real delete
      // rather than only vanishing on this screen.
      add: (c, obj) => this.store.addObject(c, obj),
      update: (c, id, patch) => this.store.updateObject(c, id, patch),
      remove: (c, id) => this.store.deleteObject(c, id)
    });
    this.chunks.onBeforePaint = (rec) => this.undoStack?.capture(rec);
    this.chunks.onChunkUpdated = () => this.scheduleStream();
    this.landPalette.set(data.landPalette);
    this.waterPalette.set(data.waterPalette);
    this.waterBase.set(data.settings.waterBase ?? "#3f6d8c");
    const waterRgb = hexToRgb(this.waterBase(), [0.25, 0.43, 0.55]);
    this.terrain.setWaterDefault(waterRgb);
    this.renderer.setOceanColor(waterRgb);
    const s = data.settings;
    const coast = {
      noiseScale: s.coastNoiseScale ?? 260,
      noiseAmount: s.coastNoiseAmount ?? 0.35,
      shoreWidth: s.coastShoreWidth ?? 0.12,
      shoreLight: s.coastShoreLight ?? 0.18,
      shadowWidth: s.coastShadowWidth ?? 0.22,
      shadowStrength: s.coastShadowStrength ?? 0.35
    };
    this.coast.set(coast);
    this.terrain.setCoast(coast);
    this.renderer.setShowGrid(data.settings.showGrid);
    this.showGrid.set(data.settings.showGrid);
    this.renderer.objectLayer.addChild(this.regionView.container);
    this.regionView.rebuild(data.regions);
    this.labelView.rebuild(data.labels);
    this.labelPresets.set(data.labelPresets ?? []);
    if (await this.assets.load()) {
      this.paperOptions.set(this.assets.paperTextures);
      this.assetsReady.set(true);
      this.symbols = new SymbolView(this.assets);
      this.renderer.objectLayer.addChild(this.symbols.container);
      this.symbols.rebuild(data.symbols);
      this.selectSymbolTool("trees");
    } else {
      this.assetsError.set(this.assets.lastError);
    }
    this.renderer.objectLayer.addChild(this.labelView.container);
    this.paperOpacity.set(data.settings.paperOpacity ?? 0.35);
    await this.applyPaper(data.settings.paperTexture ?? "");
    this.subs.push(this.store.chunkInvalidations$.subscribe((inv) => this.chunks?.invalidate(inv.layer, inv.tier, inv.cx, inv.cy)), this.store.objectOps$.subscribe((op) => {
      if (op.t !== "add" && op.t !== "upd" && op.t !== "del")
        return;
      const data2 = this.store.data();
      if (op.c === "symbols") {
        if (op.t === "add")
          this.symbols?.add(op.v);
        else if (op.t === "del")
          this.symbols?.remove(op.id);
        else {
          const sym = data2?.symbols.find((s2) => s2.id === op.id);
          if (sym)
            this.symbols?.update(sym);
        }
      } else if (op.c === "regions") {
        if (op.t === "add")
          this.regionView.add(op.v);
        else if (op.t === "del")
          this.regionView.remove(op.id);
        else {
          const r = data2?.regions.find((x) => x.id === op.id);
          if (r)
            this.regionView.update(r);
        }
      } else if (op.c === "labels") {
        if (op.t === "add")
          this.labelView.add(op.v);
        else if (op.t === "del")
          this.labelView.remove(op.id);
        else {
          const l = data2?.labels.find((x) => x.id === op.id);
          if (l)
            this.labelView.update(l);
        }
      }
      this.scheduleStream();
    }));
    this.attachInput(host);
    this.resizeObserver = new ResizeObserver(() => {
      this.renderer.resize();
      this.scheduleStream();
    });
    this.resizeObserver.observe(host);
    this.renderer.camera.restore({ x: 0, y: 0, zoom: 0.25 });
    this.applyView();
    this.ready.set(true);
  }
  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.diagTimer)
      clearInterval(this.diagTimer);
    mapDiag.enabled = false;
    this.resizeObserver?.disconnect();
    if (this.flushTimer)
      clearTimeout(this.flushTimer);
    const host = this.pixiHost?.nativeElement;
    if (host)
      this.detachInput(host);
    void this.chunks?.flushDirty().finally(() => {
      this.undoStack?.destroy();
      this.symbols?.destroy();
      this.regionView.destroy();
      this.labelView.destroy();
      this.assets.destroy();
      this.brushes?.destroy();
      this.terrain?.destroy();
      this.chunks?.destroy();
      this.renderer.destroy();
    });
    this.store.destroy();
  }
  // ── view ──
  applyView() {
    this.renderer.syncView();
    this.zoomPct.set(Math.round(this.renderer.camera.zoom * 100));
    this.scheduleStream();
  }
  scheduleStream() {
    if (this.streamScheduled)
      return;
    this.streamScheduled = true;
    requestAnimationFrame(() => {
      this.streamScheduled = false;
      const zoom = this.renderer.camera.zoom;
      const view = this.renderer.camera.visibleBounds(0);
      this.chunks?.update(view);
      const tier = this.chunks?.detailTier ?? "high";
      if (tier !== this.detailTier())
        this.detailTier.set(tier);
      this.terrain?.update(view, tier, zoom);
      this.symbols?.render(view, zoom, this.isGM());
      this.regionView.render(view, zoom, this.isGM(), true);
      this.labelView.render(view, this.isGM(), zoom);
    });
  }
  brush() {
    return __spreadProps(__spreadValues({}, defaultBrush()), {
      tool: this.terrainTool(),
      size: this.brushSize(),
      softness: this.brushSoftness(),
      strength: this.brushStrength(),
      color: this.activeBrushColor(),
      noise: this.brushNoise()
    });
  }
  /** The palette colour the active tool paints with. */
  activeBrushColor() {
    if (usesWaterPalette(this.terrainTool())) {
      return this.waterPalette()[this.selectedWater()] ?? "#3f6d8c";
    }
    return this.landPalette()[this.selectedLand()] ?? "#ffffff";
  }
  // ── tabs & tool selection ──
  selectTab(tab) {
    this.tab.set(tab);
    if (tab !== "symbols")
      this.setSelection([]);
    const tools = terrainToolsFor(tab);
    if (tools.length && !tools.some((t) => t.id === this.terrainTool())) {
      this.terrainTool.set(tools[0].id);
    }
    this.redrawCursor();
  }
  selectTerrainTool(tool) {
    this.terrainTool.set(tool);
    this.redrawCursor();
  }
  selectSymbolTool(tool) {
    this.symbolTool.set(tool);
    if (tool === "select") {
      this.previewSprite.visible = false;
    } else {
      const sprites = this.assets.spritesInCategory(tool);
      this.categorySprites.set(sprites);
      if (sprites.length)
        this.selectSprite(sprites[0]);
      this.setSelection([]);
    }
    this.redrawCursor();
  }
  /**
   * Choose the sprite the next click places.
   *
   * Picking a sprite also moves you into its group, which is what auto-variation draws
   * from — so choosing Inked Mountain 5 means later placements vary among inked mountains,
   * not across every mountain style on the map.
   */
  selectSprite(id) {
    this.currentSprite.set(id);
    this.activeGroup.set(this.assets.groupOf(id));
    this.redrawCursor();
  }
  /** Thumbnail style for a picker cell, sliced out of the atlas page. */
  spriteThumb(id) {
    return this.assets.thumbStyle(id, 44);
  }
  spriteName(id) {
    return this.assets.meta(id)?.name ?? id;
  }
  rollNextSprite() {
    const next = this.assets.randomInGroup(this.activeGroup());
    if (next)
      this.currentSprite.set(next);
    this.redrawCursor();
  }
  /** Step through what the picker is showing — bound to Shift+wheel. */
  cycleSprite(delta) {
    const list = this.visibleSprites();
    if (list.length === 0)
      return;
    const i = list.indexOf(this.currentSprite());
    const next = ((i < 0 ? 0 : i + delta) % list.length + list.length) % list.length;
    this.selectSprite(list[next]);
  }
  // ── symbol placement ──
  placeSymbol(world) {
    const asset = this.currentSprite();
    if (!asset)
      return;
    const meta = this.assets.meta(asset);
    const symbol = {
      id: generateId(),
      x: world.x,
      y: world.y,
      vis: this.placeSecret() ? "secret" : "public",
      asset,
      group: this.activeGroup(),
      scale: this.symbolScale(),
      // Jitter keeps a forest from looking like one tree stamped in a grid.
      rotation: this.rotationJitter() ? (Math.random() - 0.5) * this.rotationJitter() * Math.PI / 180 : 0,
      // Alt held mirrors deliberately; otherwise jitter may mirror at random.
      flipX: this.mirrorStamp() || (this.flipJitter() ? Math.random() < 0.5 : false)
    };
    if (meta?.colorable) {
      const ground = this.chunks?.sampleWorld("landColor", world.x, world.y);
      if (ground)
        symbol.tint = rgbToHex(ground.r, ground.g, ground.b);
    }
    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: "symbols", id: symbol.id, before: null, after: clone(symbol) });
    this.store.addObject("symbols", symbol);
    this.undoStack?.commit("Symbol setzen");
    this.refreshHistoryState();
    const cat = this.symbolTool();
    if (cat !== "select" && autoVaries(cat) && this.autoVary())
      this.rollNextSprite();
  }
  eraseSymbolAt(world) {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (!hit)
      return;
    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: "symbols", id: hit.id, before: clone(hit), after: null });
    this.store.deleteObject("symbols", hit.id);
    this.undoStack?.commit("Symbol entfernen");
    this.refreshHistoryState();
  }
  selectSymbolAt(world, additive) {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (!hit) {
      if (!additive)
        this.setSelection([]);
      return false;
    }
    const current = this.selectedIds();
    if (additive) {
      this.setSelection(current.includes(hit.id) ? current.filter((i) => i !== hit.id) : [...current, hit.id]);
    } else if (!current.includes(hit.id)) {
      this.setSelection([hit.id]);
    }
    return true;
  }
  setSelection(ids) {
    this.selectedIds.set(ids);
    this.symbols?.setSelection(ids);
    this.scheduleStream();
  }
  deleteSelected() {
    const data = this.store.data();
    if (!data)
      return;
    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find((s) => s.id === id);
      if (!sym)
        continue;
      this.undoStack?.recordObject({ c: "symbols", id, before: clone(sym), after: null });
      this.store.deleteObject("symbols", id);
    }
    this.undoStack?.commit("Symbole l\xF6schen");
    this.refreshHistoryState();
    this.setSelection([]);
  }
  toggleSelectedSecret() {
    this.editSelected("Sichtbarkeit", (sym) => ({
      vis: sym.vis === "secret" ? "public" : "secret"
    }));
  }
  /** Rescale every selected symbol by a factor. */
  scaleSelected(factor) {
    this.editSelected("Symbolgr\xF6\xDFe", (sym) => ({
      scale: Math.max(0.05, Math.min(8, (sym.scale || 1) * factor))
    }));
  }
  /** Rotate every selected symbol. */
  rotateSelected(radians) {
    this.editSelected("Symbol drehen", (sym) => ({ rotation: (sym.rotation || 0) + radians }));
  }
  /** Mirror every selected symbol horizontally. */
  flipSelected() {
    this.editSelected("Symbol spiegeln", (sym) => ({ flipX: !sym.flipX }));
  }
  /** Apply a patch to the whole selection as a single undoable step. */
  editSelected(label, patchFor) {
    const data = this.store.data();
    if (!data)
      return;
    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find((s) => s.id === id);
      if (!sym)
        continue;
      const patch = patchFor(sym);
      this.undoStack?.recordObject({
        c: "symbols",
        id,
        before: clone(sym),
        after: clone(__spreadValues(__spreadValues({}, sym), patch))
      });
      this.store.updateObject("symbols", id, patch);
    }
    this.undoStack?.commit(label);
    this.refreshHistoryState();
  }
  setSymbolScale(value) {
    this.symbolScale.set(Number(value));
    this.redrawCursor();
  }
  // ── regions ──
  selectRegionTool(tool) {
    this.regionTool.set(tool);
    if (tool !== "draw")
      this.cancelDraft();
    this.redrawCursor();
  }
  /** Add a vertex to the region being drawn. */
  addDraftPoint(world) {
    this.draftPoints.update((pts) => [...pts, { x: world.x, y: world.y }]);
    this.redrawCursor();
  }
  /** Close the draft into a real region. */
  finishRegion() {
    const points = this.draftPoints();
    if (points.length < 3) {
      this.cancelDraft();
      return;
    }
    const c = centroid(points);
    const region = {
      id: generateId(),
      x: c.x,
      y: c.y,
      vis: this.placeSecret() ? "secret" : "public",
      points,
      color: this.regionColor(),
      thickness: this.regionThickness(),
      dash: this.regionDash(),
      gap: this.regionGap(),
      fill: this.regionFill(),
      fillAlpha: this.regionFillAlpha()
    };
    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: "regions", id: region.id, before: null, after: clone(region) });
    this.store.addObject("regions", region);
    this.undoStack?.commit("Region");
    this.refreshHistoryState();
    this.draftPoints.set([]);
    this.redrawCursor();
  }
  cancelDraft() {
    if (this.draftPoints().length === 0)
      return;
    this.draftPoints.set([]);
    this.redrawCursor();
  }
  /** Remove the last placed vertex, for fixing a misclick mid-draw. */
  undoDraftPoint() {
    this.draftPoints.update((pts) => pts.slice(0, -1));
    this.redrawCursor();
  }
  selectRegionAt(world) {
    const tol = 12 / this.renderer.camera.zoom;
    const hit = this.regionView.hitTest(world.x, world.y, tol);
    this.selectedRegionId.set(hit?.id ?? null);
    this.regionView.setSelected(hit?.id ?? null);
    this.scheduleStream();
  }
  /** Pick the selected region's vertices inside a rubber band. */
  selectRegionPointsIn(rect) {
    this.regionView.setSelectedPoints(this.regionView.pointsInRect(rect));
    this.scheduleStream();
  }
  /** Pick every vertex, so dragging any one moves the whole region. */
  selectAllRegionPoints() {
    const region = this.regionView.selected;
    if (!region)
      return;
    this.regionView.setSelectedPoints(region.points.map((_, i) => i));
    this.scheduleStream();
  }
  deleteSelectedRegion() {
    const id = this.selectedRegionId();
    const region = id ? this.regionView.get(id) : void 0;
    if (!id || !region)
      return;
    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: "regions", id, before: clone(region), after: null });
    this.store.deleteObject("regions", id);
    this.undoStack?.commit("Region l\xF6schen");
    this.refreshHistoryState();
    this.selectedRegionId.set(null);
    this.regionView.setSelected(null);
  }
  /** Apply the panel's styling to the selected region. */
  applyRegionStyle() {
    const id = this.selectedRegionId();
    const region = id ? this.regionView.get(id) : void 0;
    if (!id || !region)
      return;
    const patch = {
      color: this.regionColor(),
      thickness: this.regionThickness(),
      dash: this.regionDash(),
      gap: this.regionGap(),
      fill: this.regionFill(),
      fillAlpha: this.regionFillAlpha()
    };
    this.undoStack?.begin();
    this.undoStack?.recordObject({
      c: "regions",
      id,
      before: clone(region),
      after: clone(__spreadValues(__spreadValues({}, region), patch))
    });
    this.store.updateObject("regions", id, patch);
    this.undoStack?.commit("Regionstil");
    this.refreshHistoryState();
  }
  // ── labels ──
  selectLabelTool(tool) {
    this.labelTool.set(tool);
    this.redrawCursor();
  }
  placeLabel(world) {
    const label = {
      id: generateId(),
      x: world.x,
      y: world.y,
      vis: this.placeSecret() ? "secret" : "public",
      text: this.labelText() || "Name",
      rotation: 0,
      style: __spreadValues({}, this.labelStyle()),
      presetId: this.activePresetId() ?? void 0
    };
    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: "labels", id: label.id, before: null, after: clone(label) });
    this.store.addObject("labels", label);
    this.undoStack?.commit("Beschriftung");
    this.refreshHistoryState();
    this.setLabelSelection([label.id]);
  }
  selectLabelAt(world, additive) {
    const hit = this.labelView.hitTest(world.x, world.y);
    if (!hit) {
      if (!additive)
        this.setLabelSelection([]);
      return false;
    }
    const current = this.selectedLabelIds();
    if (additive) {
      this.setLabelSelection(current.includes(hit.id) ? current.filter((i) => i !== hit.id) : [...current, hit.id]);
    } else if (!current.includes(hit.id)) {
      this.setLabelSelection([hit.id]);
    }
    return true;
  }
  setLabelSelection(ids) {
    this.selectedLabelIds.set(ids);
    this.labelView.setSelection(ids);
    if (ids.length === 1) {
      const label = this.labelView.get(ids[0]);
      if (label) {
        this.labelStyle.set(__spreadValues({}, label.style));
        this.labelText.set(label.text);
        this.activePresetId.set(label.presetId ?? null);
      }
    }
    this.scheduleStream();
  }
  /**
   * Live text editing.
   *
   * The label follows every keystroke locally so the map reads as a direct preview, but the
   * synced op is debounced — one op per typed character would flood the channel and fill
   * the undo history with single letters.
   */
  onLabelTextInput(text) {
    this.labelText.set(text);
    const id = this.selectedLabelId();
    const label = id ? this.labelView.get(id) : void 0;
    if (!id || !label)
      return;
    label.text = text;
    this.labelView.update(label);
    this.scheduleStream();
    if (this.labelTextTimer)
      clearTimeout(this.labelTextTimer);
    this.labelTextTimer = setTimeout(() => {
      this.labelTextTimer = null;
      this.store.updateObject("labels", id, { text });
    }, 400);
  }
  labelTextTimer = null;
  /** Push the panel's text and style onto the selected label. */
  applyLabelEdits() {
    const id = this.selectedLabelId();
    const label = id ? this.labelView.get(id) : void 0;
    if (!id || !label)
      return;
    const patch = { text: this.labelText(), style: __spreadValues({}, this.labelStyle()) };
    this.undoStack?.begin();
    this.undoStack?.recordObject({
      c: "labels",
      id,
      before: clone(label),
      after: clone(__spreadValues(__spreadValues({}, label), patch))
    });
    this.store.updateObject("labels", id, patch);
    this.undoStack?.commit("Beschriftung \xE4ndern");
    this.refreshHistoryState();
  }
  /** Delete every selected label as one undoable step. */
  deleteSelectedLabel() {
    const ids = this.selectedLabelIds();
    if (ids.length === 0)
      return;
    this.undoStack?.begin();
    for (const id of ids) {
      const label = this.labelView.get(id);
      if (!label)
        continue;
      this.undoStack?.recordObject({ c: "labels", id, before: clone(label), after: null });
      this.store.deleteObject("labels", id);
    }
    this.undoStack?.commit("Beschriftung l\xF6schen");
    this.refreshHistoryState();
    this.setLabelSelection([]);
  }
  setLabelStyle(key, value) {
    this.labelStyle.update((s) => __spreadProps(__spreadValues({}, s), { [key]: value }));
    if (this.selectedLabelId())
      this.applyLabelEdits();
  }
  /**
   * Save the current style as a named preset.
   *
   * Re-saving under an existing name *overwrites* that preset and restyles every label
   * following it. That is the point of a preset: change "Stadtname" once and every city on
   * the map follows, rather than accumulating near-identical presets with the same name.
   */
  saveLabelPreset(name) {
    const trimmed = name.trim();
    if (!trimmed)
      return;
    const style = __spreadValues({}, this.labelStyle());
    const existing = this.labelPresets().find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      const next2 = this.labelPresets().map((p) => p.id === existing.id ? __spreadProps(__spreadValues({}, p), { style }) : p);
      this.labelPresets.set(next2);
      this.store.setPath("labelPresets", next2);
      this.activePresetId.set(existing.id);
      this.restyleLabelsUsingPreset(existing.id, style);
      return;
    }
    const preset = { id: generateId(), name: trimmed, style };
    const next = [...this.labelPresets(), preset];
    this.labelPresets.set(next);
    this.store.setPath("labelPresets", next);
    this.activePresetId.set(preset.id);
    const selected = this.selectedLabelId();
    if (selected)
      this.store.updateObject("labels", selected, { presetId: preset.id });
  }
  /** Push a preset's style onto every label that follows it. */
  restyleLabelsUsingPreset(presetId, style) {
    const data = this.store.data();
    if (!data)
      return;
    const affected = data.labels.filter((l) => l.presetId === presetId);
    if (affected.length === 0)
      return;
    this.undoStack?.begin();
    for (const label of affected) {
      this.undoStack?.recordObject({
        c: "labels",
        id: label.id,
        before: clone(label),
        after: clone(__spreadProps(__spreadValues({}, label), { style }))
      });
      this.store.updateObject("labels", label.id, { style: __spreadValues({}, style) });
    }
    this.undoStack?.commit("Vorlage aktualisieren");
    this.refreshHistoryState();
  }
  applyLabelPreset(id) {
    const preset = this.labelPresets().find((p) => p.id === id);
    if (!preset)
      return;
    this.labelStyle.set(__spreadValues({}, preset.style));
    this.activePresetId.set(id);
    const selected = this.selectedLabelId();
    if (selected) {
      this.store.updateObject("labels", selected, {
        style: __spreadValues({}, preset.style),
        presetId: id
      });
      this.scheduleStream();
    }
  }
  removeLabelPreset(id) {
    const next = this.labelPresets().filter((p) => p.id !== id);
    this.labelPresets.set(next);
    this.store.setPath("labelPresets", next);
    if (this.activePresetId() === id)
      this.activePresetId.set(null);
  }
  // ── cursor ──
  redrawCursor() {
    if (this.lastWorld)
      this.drawCursor(this.lastWorld);
    else
      this.cursorGraphic.clear();
  }
  drawCursor(world) {
    const g = this.cursorGraphic;
    g.clear();
    if (!this.isGM()) {
      this.previewSprite.visible = false;
      return;
    }
    const zoom = this.renderer.camera.zoom;
    if (this.isPlacingSymbols()) {
      this.updateSymbolPreview(world);
      return;
    }
    this.previewSprite.visible = false;
    if (this.tab() === "regions" && this.regionTool() === "draw") {
      const pts = this.draftPoints();
      if (pts.length > 0) {
        g.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++)
          g.lineTo(pts[i].x, pts[i].y);
        g.lineTo(world.x, world.y);
        if (pts.length > 1)
          g.lineTo(pts[0].x, pts[0].y);
        g.stroke({ width: 2 / zoom, color: 9425151, alpha: 0.9 });
        for (const p of pts)
          g.circle(p.x, p.y, 5 / zoom);
        g.fill({ color: 9425151, alpha: 0.9 });
      }
      return;
    }
    if (!this.isTerrainTab())
      return;
    if (this.terrainTool() === "lakeStamp") {
      const outline = this.brushes?.lakeOutline(world.x, world.y, this.brushSize(), this.lakeSeed);
      if (outline?.length) {
        g.poly(outline).stroke({ width: 1.5 / zoom, color: 9425151, alpha: 0.9 });
        g.circle(world.x, world.y, this.brushSize() * 1.9);
        g.stroke({ width: 1 / zoom, color: 9425151, alpha: 0.25 });
      }
      return;
    }
    g.circle(world.x, world.y, this.brushSize());
    g.stroke({ width: 1.5 / zoom, color: 16777215, alpha: 0.75 });
    const solid = this.brushSize() * (1 - Math.min(0.95, this.brushSoftness()));
    if (solid > 1) {
      g.circle(world.x, world.y, solid);
      g.stroke({ width: 1 / zoom, color: 16777215, alpha: 0.3 });
    }
  }
  /**
   * Ground colour under a point, throttled.
   *
   * Sampling is a GPU readback and stalls the pipeline, so the live preview must not do it
   * on every pointer move. Re-reading only when the pointer has travelled a little, or
   * enough time has passed, keeps the preview honest without the stall showing up as lag.
   */
  groundTintAt(x, y) {
    const now = performance.now();
    const moved = Math.hypot(x - this.tintCache.x, y - this.tintCache.y);
    if (moved < 24 && now - this.tintCache.at < 120)
      return this.tintCache.tint;
    const ground = this.chunks?.sampleWorld("landColor", x, y);
    const tint = ground ? ground.r << 16 | ground.g << 8 | ground.b : 16777215;
    this.tintCache = { x, y, at: now, tint };
    return tint;
  }
  tintCache = { x: NaN, y: NaN, at: 0, tint: 16777215 };
  updateSymbolPreview(world) {
    const sprite = this.previewSprite;
    const asset = this.currentSprite();
    const meta = asset ? this.assets.meta(asset) : null;
    const texture = asset ? this.assets.sprite(asset) : null;
    if (!meta || !texture) {
      sprite.visible = false;
      return;
    }
    const scale = this.symbolScale();
    sprite.texture = texture;
    sprite.position.set(world.x + meta.offsetX * scale, world.y + meta.offsetY * scale);
    sprite.scale.set(this.mirrorStamp() ? -scale : scale, scale);
    sprite.tint = meta.colorable ? this.groundTintAt(world.x, world.y) : 16777215;
    sprite.alpha = 0.8;
    sprite.visible = true;
  }
  // ── painting ──
  /** Grow the stroke's recorded extent to include a dab at `world`. */
  noteStrokeExtent(world) {
    const r = this.brushSize() * 1.5;
    const b = this.strokeBounds;
    this.strokeBounds = b ? {
      minX: Math.min(b.minX, world.x - r),
      minY: Math.min(b.minY, world.y - r),
      maxX: Math.max(b.maxX, world.x + r),
      maxY: Math.max(b.maxY, world.y + r)
    } : { minX: world.x - r, minY: world.y - r, maxX: world.x + r, maxY: world.y + r };
  }
  beginPaint(world) {
    this.isPainting = true;
    this.strokeBounds = null;
    this.strokeTier = this.chunks?.detailTier ?? "high";
    this.noteStrokeExtent(world);
    this.undoStack?.begin();
    this.brushes?.beginStroke();
    if (this.terrainTool() === "lakeStamp") {
      this.brushes?.stampLake(world.x, world.y, this.brushSize(), this.lakeSeed, this.activeBrushColor(), this.strokeTier);
      this.lakeSeed = Math.floor(Math.random() * 1e9);
      this.lastWorld = world;
      const r = this.brushSize() * 2.4;
      this.noteStrokeExtent({ x: world.x - r, y: world.y - r });
      this.noteStrokeExtent({ x: world.x + r, y: world.y + r });
      this.endPaint();
      this.redrawCursor();
      this.scheduleStream();
      return;
    }
    this.brushes?.stroke(world, this.brush(), this.strokeTier);
    this.scheduleStream();
  }
  continuePaint(world) {
    if (!this.isPainting || this.terrainTool() === "lakeStamp")
      return;
    this.noteStrokeExtent(world);
    this.brushes?.stroke(world, this.brush(), this.strokeTier);
    this.scheduleStream();
    if (toolLayer(this.terrainTool()) === "landColor")
      this.livePreviewSymbolTints();
  }
  /** Locally re-tint symbols under the brush while painting. No ops, no undo entries. */
  livePreviewSymbolTints() {
    const now = performance.now();
    if (now - this.lastLiveTintAt < 90)
      return;
    this.lastLiveTintAt = now;
    const b = this.brushSize() * 1.5;
    const world = this.lastWorld;
    if (!world || !this.symbols || !this.chunks)
      return;
    const near = this.symbols.index.query({
      minX: world.x - b,
      minY: world.y - b,
      maxX: world.x + b,
      maxY: world.y + b
    });
    let touched = false;
    for (const sym of near) {
      if (!this.assets.meta(sym.asset)?.colorable)
        continue;
      const ground = this.chunks.sampleWorld("landColor", sym.x, sym.y);
      const tint = ground ? rgbToHex(ground.r, ground.g, ground.b) : void 0;
      if (tint === sym.tint)
        continue;
      sym.tint = tint;
      this.symbols.update(sym);
      touched = true;
    }
    if (touched)
      this.scheduleStream();
  }
  lastLiveTintAt = 0;
  endPaint() {
    if (!this.isPainting)
      return;
    this.isPainting = false;
    const touched = this.brushes?.endStroke() ?? [];
    if (touched.length === 0) {
      this.undoStack?.abort();
      return;
    }
    this.undoStack?.commit(this.terrainTool());
    if (toolLayer(this.terrainTool()) === "landColor")
      this.resampleSymbolTints();
    this.refreshHistoryState();
    this.scheduleFlush();
  }
  /**
   * Re-read ground colour for colourable symbols the current stroke passed under.
   *
   * Bounded to the stroke's own area and run once at stroke end, because each sample is a
   * GPU readback. Symbols whose colour has not actually changed emit no op, so repainting
   * the same shade does not flood the network.
   */
  resampleSymbolTints() {
    const data = this.store.data();
    if (!data || !this.symbols || !this.chunks)
      return;
    const bounds = this.strokeBounds;
    if (!bounds)
      return;
    const changed = [];
    for (const sym of this.symbols.index.query(bounds)) {
      const meta = this.assets.meta(sym.asset);
      if (!meta?.colorable)
        continue;
      const ground = this.chunks.sampleWorld("landColor", sym.x, sym.y);
      const tint = ground ? rgbToHex(ground.r, ground.g, ground.b) : void 0;
      if (tint === sym.tint)
        continue;
      changed.push({ id: sym.id, tint: tint ?? "" });
    }
    if (changed.length === 0)
      return;
    this.undoStack?.begin();
    for (const c of changed) {
      const sym = data.symbols.find((s) => s.id === c.id);
      if (!sym)
        continue;
      const patch = { tint: c.tint || void 0 };
      this.undoStack?.recordObject({
        c: "symbols",
        id: c.id,
        before: clone(sym),
        after: clone(__spreadValues(__spreadValues({}, sym), patch))
      });
      this.store.updateObject("symbols", c.id, patch);
    }
    this.undoStack?.commit("Symbolfarbe");
  }
  scheduleFlush() {
    if (this.flushTimer)
      clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.saving.set(true);
      void this.chunks?.flushDirty().finally(() => this.saving.set(false));
    }, 600);
  }
  refreshHistoryState() {
    this.canUndo.set(this.undoStack?.canUndo() ?? false);
    this.canRedo.set(this.undoStack?.canRedo() ?? false);
  }
  // ── input ──
  attachInput(host) {
    host.addEventListener("pointerdown", this.onPointerDown);
    host.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    host.addEventListener("wheel", this.onWheel, { passive: false });
    host.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }
  detachInput(host) {
    host.removeEventListener("pointerdown", this.onPointerDown);
    host.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    host.removeEventListener("wheel", this.onWheel);
    host.removeEventListener("contextmenu", this.onContextMenu);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
  localPoint(e) {
    const rect = this.pixiHost.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  onContextMenu = (e) => e.preventDefault();
  onPointerDown = (e) => {
    const p = this.localPoint(e);
    const world = this.renderer.camera.screenToWorld(p.x, p.y);
    if (e.button === 2 && this.isGM() && this.isPlacingSymbols()) {
      this.eraseSymbolAt(world);
      return;
    }
    if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      return;
    }
    if (!this.isGM())
      return;
    if (e.shiftKey && (this.isTerrainTab() || this.isPlacingSymbols())) {
      e.preventDefault();
      this.brushResize = this.isPlacingSymbols() ? { x: e.clientX, initial: this.symbolScale(), scaling: "symbol" } : { x: e.clientX, initial: this.brushSize(), scaling: "brush" };
      return;
    }
    if (this.tab() === "regions") {
      if (this.regionTool() === "draw") {
        this.addDraftPoint(world);
      } else {
        const tol = 10 / this.renderer.camera.zoom;
        const idx = this.regionView.hitHandle(world.x, world.y, tol);
        const current = this.regionView.selected;
        if (idx >= 0 && current) {
          const picked = this.regionView.selectedPoints;
          if (!picked.has(idx))
            this.regionView.setSelectedPoints([idx]);
          this.dragHandle = { index: idx, before: clone(current) };
        } else if (this.regionView.hitTest(world.x, world.y, 12 / this.renderer.camera.zoom)) {
          this.selectRegionAt(world);
        } else if (this.regionView.selected) {
          this.boxSelect = { startWorld: world, startScreen: p };
          this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
        } else {
          this.selectRegionAt(world);
        }
      }
      return;
    }
    if (this.tab() === "labels") {
      if (this.labelTool() === "place") {
        this.placeLabel(world);
      } else if (this.selectLabelAt(world, e.shiftKey)) {
        const origins = /* @__PURE__ */ new Map();
        for (const id of this.selectedLabelIds()) {
          const l = this.labelView.get(id);
          if (l)
            origins.set(id, clone(l));
        }
        this.dragLabel = { startWorld: world, origins, moved: false };
      } else {
        this.boxSelect = { startWorld: world, startScreen: p };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      return;
    }
    if (this.isPlacingSymbols()) {
      this.placeSymbol(world);
      return;
    }
    if (this.isSelecting()) {
      const hit = this.selectSymbolAt(world, e.shiftKey);
      if (hit) {
        const data = this.store.data();
        const origins = /* @__PURE__ */ new Map();
        for (const id of this.selectedIds()) {
          const sym = data?.symbols.find((s) => s.id === id);
          if (sym)
            origins.set(id, clone(sym));
        }
        this.dragSymbols = { startWorld: world, moved: false, origins };
      } else {
        this.boxSelect = { startWorld: world, startScreen: p };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      return;
    }
    this.beginPaint(world);
  };
  onPointerMove = (e) => {
    const p = this.localPoint(e);
    const world = this.renderer.camera.screenToWorld(p.x, p.y);
    this.lastWorld = world;
    this.cursorWorld.set({ x: Math.round(world.x), y: Math.round(world.y) });
    this.cursorHex.set(worldToHex(world.x, world.y));
    if (this.brushResize) {
      const dx = e.clientX - this.brushResize.x;
      if (this.brushResize.scaling === "symbol") {
        const next = this.brushResize.initial * Math.pow(1.01, dx);
        this.symbolScale.set(Math.min(8, Math.max(0.05, Math.round(next * 100) / 100)));
      } else {
        const next = this.brushResize.initial + dx * 0.3 / this.renderer.camera.zoom;
        this.brushSize.set(Math.round(Math.min(2e3, Math.max(4, next))));
      }
      this.drawCursor(world);
      return;
    }
    this.drawCursor(world);
    if (this.dragHandle) {
      const region = this.regionView.selected;
      if (region) {
        const anchor = region.points[this.dragHandle.index];
        const dx = world.x - anchor.x;
        const dy = world.y - anchor.y;
        for (const i of this.regionView.selectedPoints) {
          const p2 = region.points[i];
          if (p2) {
            p2.x += dx;
            p2.y += dy;
          }
        }
        const c = centroid(region.points);
        region.x = c.x;
        region.y = c.y;
        this.regionView.update(region);
        this.scheduleStream();
      }
      return;
    }
    if (this.dragLabel) {
      const dx = world.x - this.dragLabel.startWorld.x;
      const dy = world.y - this.dragLabel.startWorld.y;
      this.dragLabel.startWorld = world;
      this.dragLabel.moved = true;
      for (const id of this.selectedLabelIds()) {
        const label = this.labelView.get(id);
        if (!label)
          continue;
        label.x += dx;
        label.y += dy;
        this.labelView.update(label);
      }
      this.scheduleStream();
      return;
    }
    if (this.boxSelect) {
      const s = this.boxSelect.startScreen;
      this.marquee.set({
        x: Math.min(s.x, p.x),
        y: Math.min(s.y, p.y),
        w: Math.abs(p.x - s.x),
        h: Math.abs(p.y - s.y)
      });
      return;
    }
    if (this.dragSymbols) {
      this.dragSelection(world);
      return;
    }
    if (this.isPanning) {
      this.renderer.camera.panByScreen(e.clientX - this.lastPointer.x, e.clientY - this.lastPointer.y);
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.applyView();
      return;
    }
    this.continuePaint(world);
  };
  onPointerUp = () => {
    this.isPanning = false;
    if (this.dragHandle) {
      const region = this.regionView.selected;
      if (region) {
        this.undoStack?.begin();
        this.undoStack?.recordObject({
          c: "regions",
          id: region.id,
          before: this.dragHandle.before,
          after: clone(region)
        });
        this.store.updateObject("regions", region.id, {
          points: region.points,
          x: region.x,
          y: region.y
        });
        this.undoStack?.commit("Regionpunkt");
        this.refreshHistoryState();
      }
      this.dragHandle = null;
      return;
    }
    if (this.dragLabel) {
      if (this.dragLabel.moved) {
        this.undoStack?.begin();
        for (const [id, before] of this.dragLabel.origins) {
          const label = this.labelView.get(id);
          if (!label)
            continue;
          this.undoStack?.recordObject({ c: "labels", id, before, after: clone(label) });
          this.store.updateObject("labels", id, { x: label.x, y: label.y });
        }
        this.undoStack?.commit("Beschriftung verschieben");
        this.refreshHistoryState();
      }
      this.dragLabel = null;
      return;
    }
    if (this.brushResize) {
      this.brushResize = null;
      this.redrawCursor();
      return;
    }
    if (this.boxSelect) {
      const start = this.boxSelect.startWorld;
      const end = this.lastWorld ?? start;
      const rect = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y)
      };
      if (this.tab() === "labels") {
        this.setLabelSelection(this.labelView.inRect(rect).map((l) => l.id));
      } else if (this.tab() === "regions") {
        this.selectRegionPointsIn(rect);
      } else {
        this.setSelection(this.symbols?.inRect(rect).map((s) => s.id) ?? []);
      }
      this.boxSelect = null;
      this.marquee.set(null);
      return;
    }
    if (this.dragSymbols) {
      if (this.dragSymbols.moved)
        this.commitSelectionMove();
      this.dragSymbols = null;
      return;
    }
    this.endPaint();
  };
  dragSelection(world) {
    const drag = this.dragSymbols;
    const data = this.store.data();
    if (!drag || !data)
      return;
    const dx = world.x - drag.startWorld.x;
    const dy = world.y - drag.startWorld.y;
    if (dx === 0 && dy === 0)
      return;
    drag.moved = true;
    drag.startWorld = world;
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find((s) => s.id === id);
      if (!sym)
        continue;
      sym.x += dx;
      sym.y += dy;
      this.symbols?.update(sym);
    }
    this.scheduleStream();
  }
  commitSelectionMove() {
    const data = this.store.data();
    const origins = this.dragSymbols?.origins;
    if (!data || !origins)
      return;
    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find((s) => s.id === id);
      const before = origins.get(id);
      if (!sym || !before)
        continue;
      this.undoStack?.recordObject({ c: "symbols", id, before, after: clone(sym) });
      this.store.updateObject("symbols", id, { x: sym.x, y: sym.y });
    }
    this.undoStack?.commit("Symbole verschieben");
    this.refreshHistoryState();
  }
  onWheel = (e) => {
    e.preventDefault();
    const p = this.localPoint(e);
    if (e.shiftKey && this.isPlacingSymbols()) {
      this.cycleSprite(e.deltaY > 0 ? 1 : -1);
      return;
    }
    if (e.ctrlKey) {
      if (this.isPlacingSymbols()) {
        const next = this.symbolScale() * (e.deltaY > 0 ? 1 / 1.15 : 1.15);
        this.symbolScale.set(Math.min(8, Math.max(0.05, Math.round(next * 100) / 100)));
      } else {
        const next = this.brushSize() * (e.deltaY > 0 ? 1 / 1.15 : 1.15);
        this.brushSize.set(Math.round(Math.min(2e3, Math.max(4, next))));
      }
      this.lastWorld = this.renderer.camera.screenToWorld(p.x, p.y);
      this.redrawCursor();
      return;
    }
    this.renderer.camera.zoomAt(p.x, p.y, e.deltaY > 0 ? 1 / 1.15 : 1.15);
    this.applyView();
  };
  onKeyUp = (e) => {
    if (e.key === "Alt" && this.mirrorStamp()) {
      this.mirrorStamp.set(false);
      this.redrawCursor();
    }
  };
  onKeyDown = (e) => {
    const target = e.target;
    if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA")
      return;
    if (e.key === "Alt" && this.isPlacingSymbols()) {
      e.preventDefault();
      if (!this.mirrorStamp()) {
        this.mirrorStamp.set(true);
        this.redrawCursor();
      }
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey)
        this.redo();
      else
        this.undo();
      return;
    }
    if (this.tab() === "regions" && this.regionTool() === "draw" && this.draftPoints().length) {
      if (e.key === "Enter") {
        e.preventDefault();
        this.finishRegion();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        this.cancelDraft();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        this.undoDraftPoint();
        return;
      }
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (this.selectedIds().length) {
        e.preventDefault();
        this.deleteSelected();
      } else if (this.selectedRegionId()) {
        e.preventDefault();
        this.deleteSelectedRegion();
      } else if (this.selectedLabelId()) {
        e.preventDefault();
        this.deleteSelectedLabel();
      }
    }
  };
  // ── palettes & map settings ──
  selectLandColor(i) {
    this.selectedLand.set(i);
  }
  selectWaterColor(i) {
    this.selectedWater.set(i);
  }
  addLandColor(color) {
    const next = [...this.landPalette(), color];
    this.landPalette.set(next);
    this.selectedLand.set(next.length - 1);
    this.store.setPath("landPalette", next);
  }
  addWaterColor(color) {
    const next = [...this.waterPalette(), color];
    this.waterPalette.set(next);
    this.selectedWater.set(next.length - 1);
    this.store.setPath("waterPalette", next);
  }
  editLandColor(i, color) {
    const next = this.landPalette().map((c, idx) => idx === i ? color : c);
    this.landPalette.set(next);
    this.store.setPath("landPalette", next);
  }
  editWaterColor(i, color) {
    const next = this.waterPalette().map((c, idx) => idx === i ? color : c);
    this.waterPalette.set(next);
    this.store.setPath("waterPalette", next);
  }
  removeLandColor(i) {
    const next = this.landPalette().filter((_, idx) => idx !== i);
    this.landPalette.set(next);
    this.selectedLand.set(Math.max(0, Math.min(this.selectedLand(), next.length - 1)));
    this.store.setPath("landPalette", next);
  }
  removeWaterColor(i) {
    const next = this.waterPalette().filter((_, idx) => idx !== i);
    this.waterPalette.set(next);
    this.selectedWater.set(Math.max(0, Math.min(this.selectedWater(), next.length - 1)));
    this.store.setPath("waterPalette", next);
  }
  /**
   * Tune one coastline parameter.
   *
   * Applied to the shader immediately for live feedback, but only synced on release —
   * dragging a slider would otherwise emit an op per pixel of travel.
   */
  setCoast(key, value) {
    const next = __spreadProps(__spreadValues({}, this.coast()), { [key]: value });
    this.coast.set(next);
    this.terrain?.setCoast(next);
    this.scheduleStream();
  }
  /** Persist the coastline settings once a slider is released. */
  commitCoast() {
    const c = this.coast();
    this.store.setPath("settings.coastNoiseScale", c.noiseScale);
    this.store.setPath("settings.coastNoiseAmount", c.noiseAmount);
    this.store.setPath("settings.coastShoreWidth", c.shoreWidth);
    this.store.setPath("settings.coastShoreLight", c.shoreLight);
    this.store.setPath("settings.coastShadowWidth", c.shadowWidth);
    this.store.setPath("settings.coastShadowStrength", c.shadowStrength);
  }
  resetCoast() {
    const d = defaultCoast();
    this.coast.set(d);
    this.terrain?.setCoast(d);
    this.commitCoast();
    this.scheduleStream();
  }
  setWaterBase(color) {
    this.waterBase.set(color);
    this.store.setPath("settings.waterBase", color);
    const rgb = hexToRgb(color, [0.25, 0.43, 0.55]);
    this.terrain?.setWaterDefault(rgb);
    this.renderer.setOceanColor(rgb);
  }
  async applyPaper(id) {
    this.paperTexture.set(id);
    const texture = id ? await this.assets.paper(id) : null;
    this.terrain?.setPaper(texture, this.paperOpacity(), 2048);
  }
  async selectPaper(id) {
    await this.applyPaper(id);
    this.store.setPath("settings.paperTexture", id);
  }
  async setPaperOpacity(value) {
    this.paperOpacity.set(Number(value));
    await this.applyPaper(this.paperTexture());
    this.store.setPath("settings.paperOpacity", this.paperOpacity());
  }
  setBrushSize(value) {
    this.brushSize.set(Number(value));
    this.redrawCursor();
  }
  setSoftness(value) {
    this.brushSoftness.set(Number(value));
    this.redrawCursor();
  }
  setStrength(value) {
    this.brushStrength.set(Number(value));
  }
  undo() {
    if (!this.undoStack?.canUndo())
      return;
    this.undoStack.undo();
    this.refreshHistoryState();
    this.scheduleFlush();
  }
  redo() {
    if (!this.undoStack?.canRedo())
      return;
    this.undoStack.redo();
    this.refreshHistoryState();
    this.scheduleFlush();
  }
  toggleGrid() {
    const next = !this.showGrid();
    this.showGrid.set(next);
    this.renderer.setShowGrid(next);
    this.store.setPath("settings.showGrid", next);
    this.applyView();
  }
  resetView() {
    this.renderer.camera.restore({ x: 0, y: 0, zoom: 0.25 });
    this.applyView();
  }
  zoomBy(factor) {
    const cam = this.renderer.camera;
    cam.zoomAt(cam.viewWidth / 2, cam.viewHeight / 2, factor);
    this.applyView();
  }
  minZoomPct = Math.round(MIN_ZOOM * 100);
  maxZoomPct = Math.round(MAX_ZOOM * 100);
  static \u0275fac = function MapEditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _MapEditorComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _MapEditorComponent, selectors: [["app-map-editor"]], viewQuery: function MapEditorComponent_Query(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275viewQuery(_c0, 5);
    }
    if (rf & 2) {
      let _t;
      \u0275\u0275queryRefresh(_t = \u0275\u0275loadQuery()) && (ctx.pixiHost = _t.first);
    }
  }, decls: 47, vars: 29, consts: [["pixiHost", ""], ["landEdit", ""], ["waterEdit", ""], ["presetName", ""], [1, "map-editor-page"], [1, "editor-toolbar"], [1, "world-name"], [1, "sep"], ["type", "button", "title", "Herauszoomen", 3, "click"], [1, "zoom-readout"], ["type", "button", "title", "Hineinzoomen", 3, "click"], ["type", "button", "title", "Ansicht zur\xFCcksetzen", 3, "click"], ["type", "button", 3, "click"], ["type", "button", "title", "Kachel-Diagnose: zeigt Detailstufe, Chunk-Raster und Streaming-Ereignisse", 3, "click"], ["type", "button", "title", "Strg+Z", 3, "click", "disabled"], ["type", "button", "title", "Strg+Shift+Z", 3, "click", "disabled"], [1, "spacer"], [1, "badge", "saving"], [1, "badge", "gm"], [1, "badge"], [1, "editor-body"], [1, "tool-rail"], [1, "viewer-wrap"], [1, "pixi-host"], [1, "marquee", 3, "left", "top", "width", "height"], [1, "loading-overlay"], [1, "loading-overlay", "context-lost"], [1, "diag-panel"], [1, "status-bar"], [1, "status-tier"], [1, "settings-panel"], [1, "tab-strip"], ["type", "button", 1, "tab-btn", 3, "active"], [1, "rail-divider"], [1, "tool-icons"], ["type", "button", 1, "tab-btn", 3, "click"], ["type", "button", 1, "rail-btn", 3, "active", "title"], ["type", "button", 1, "rail-btn", 3, "click", "title"], [3, "src", "alt"], ["type", "button", 1, "rail-btn", 3, "active", "disabled", "title"], ["type", "button", 1, "rail-btn", 3, "click", "disabled", "title"], [1, "marquee"], [1, "diag-head"], [1, "diag-stats"], [1, "diag-stat"], [1, "diag-events"], [1, "diag-event", 3, "warn"], [1, "diag-event"], [1, "diag-t"], [1, "diag-kind"], [1, "diag-tile"], [1, "diag-detail"], [1, "settings-title"], [1, "asset-error"], [1, "panel-section"], [1, "panel-title"], [1, "profile-row"], ["type", "button", 1, "profile-btn", 3, "active"], [1, "slider-row"], ["type", "range", "min", "16", "max", "3000", "step", "1", 3, "input", "value"], ["type", "range", "min", "0", "max", "1", "step", "0.05", 3, "input", "value"], ["type", "range", "min", "0.05", "max", "1", "step", "0.05", 3, "input", "value"], ["title", "Wie zerrissen der Rand des Pinsels ist", 1, "slider-row"], [1, "hint"], ["type", "button", 1, "profile-btn", 3, "click"], ["type", "range", "min", "80", "max", "4000", "step", "1", 3, "input", "value"], [1, "swatches"], [1, "swatch-wrap"], ["title", "Farbe w\xE4hlen und hinzuf\xFCgen", 1, "swatch", "add"], ["type", "color", "value", "#7a8f5a", 1, "hidden-color", 3, "change"], ["type", "button", 1, "swatch", 3, "click", "dblclick", "contextmenu", "title"], ["type", "color", 1, "hidden-color", 3, "input", "value"], ["type", "color", "value", "#3f6d8c", 1, "hidden-color", 3, "change"], ["type", "search", "placeholder", "Symbole suchen \u2026", 1, "text-input", "search-input", 3, "input", "value"], [1, "sprite-grid"], ["type", "button", 1, "sprite-cell", 3, "active", "title"], ["type", "range", "min", "0.05", "max", "8", "step", "0.05", 3, "input", "value"], ["title", "Zuf\xE4llige Drehung pro Platzierung", 1, "slider-row"], ["type", "range", "min", "0", "max", "180", "step", "5", 3, "input", "value"], [1, "check-row"], ["title", "Zuf\xE4llig gespiegelt platzieren", 1, "check-row"], ["type", "checkbox", 3, "change", "checked"], ["title", "Nur f\xFCr den GM sichtbar, bis aufgedeckt", 1, "check-row"], ["type", "button", 1, "sprite-cell", 3, "click", "title"], [1, "sprite-thumb", 3, "ngStyle"], [1, "history-row"], [1, "base-row"], ["type", "color", 3, "input", "value"], ["type", "range", "min", "2", "max", "160", "step", "1", 3, "input", "value"], ["type", "range", "min", "8", "max", "500", "step", "1", 3, "input", "value"], ["type", "range", "min", "0", "max", "500", "step", "1", 3, "input", "value"], ["type", "range", "min", "0", "max", "0.8", "step", "0.02", 3, "input", "value"], ["type", "text", 1, "text-input", 3, "input", "value"], ["type", "range", "min", "24", "max", "1200", "step", "1", 3, "input", "value"], ["title", "Biegung des Textes", 1, "slider-row"], ["type", "range", "min", "-1", "max", "1", "step", "0.02", 3, "input", "value"], ["type", "range", "min", "-40", "max", "160", "step", "1", 3, "input", "value"], ["type", "range", "min", "0", "max", "90", "step", "1", 3, "input", "value"], [1, "preset-current"], ["type", "text", "placeholder", "z. B. Stadtname", 1, "text-input", 3, "keydown.enter"], ["type", "button", 1, "narrow", 3, "click"], ["title", "Farbe von offenem Wasser", 1, "base-row"], ["title", "Gro\xDFe Werte geben weite Buchten, kleine feine Zacken", 1, "slider-row"], ["type", "range", "min", "200", "max", "6000", "step", "10", 3, "input", "change", "value"], ["title", "Wie stark die K\xFCste vom gemalten Rand abweicht", 1, "slider-row"], ["type", "range", "min", "0", "max", "1", "step", "0.02", 3, "input", "change", "value"], ["type", "range", "min", "0", "max", "0.5", "step", "0.01", 3, "input", "change", "value"], ["type", "range", "min", "0", "max", "0.6", "step", "0.02", 3, "input", "change", "value"], ["type", "range", "min", "0.02", "max", "0.5", "step", "0.01", 3, "input", "change", "value"], [1, "paper-select", 3, "change", "value"], ["value", ""], [3, "value"]], template: function MapEditorComponent_Template(rf, ctx) {
    if (rf & 1) {
      const _r1 = \u0275\u0275getCurrentView();
      \u0275\u0275elementStart(0, "div", 4)(1, "div", 5)(2, "span", 6);
      \u0275\u0275text(3);
      \u0275\u0275elementEnd();
      \u0275\u0275element(4, "span", 7);
      \u0275\u0275elementStart(5, "button", 8);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_5_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.zoomBy(1 / 1.4));
      });
      \u0275\u0275text(6, "\u2212");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(7, "span", 9);
      \u0275\u0275text(8);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(9, "button", 10);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_9_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.zoomBy(1.4));
      });
      \u0275\u0275text(10, "+");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(11, "button", 11);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_11_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.resetView());
      });
      \u0275\u0275text(12, "Ansicht");
      \u0275\u0275elementEnd();
      \u0275\u0275element(13, "span", 7);
      \u0275\u0275elementStart(14, "button", 12);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_14_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.toggleGrid());
      });
      \u0275\u0275text(15, "Hexgitter");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(16, "button", 13);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_16_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.toggleDiagnostics());
      });
      \u0275\u0275text(17, " Diagnose ");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(18, "button", 14);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_18_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.undo());
      });
      \u0275\u0275text(19, "\u21B6");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "button", 15);
      \u0275\u0275listener("click", function MapEditorComponent_Template_button_click_20_listener() {
        \u0275\u0275restoreView(_r1);
        return \u0275\u0275resetView(ctx.redo());
      });
      \u0275\u0275text(21, "\u21B7");
      \u0275\u0275elementEnd();
      \u0275\u0275element(22, "span", 16);
      \u0275\u0275conditionalCreate(23, MapEditorComponent_Conditional_23_Template, 2, 0, "span", 17);
      \u0275\u0275conditionalCreate(24, MapEditorComponent_Conditional_24_Template, 2, 0, "span", 18)(25, MapEditorComponent_Conditional_25_Template, 2, 0, "span", 19);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(26, "div", 20);
      \u0275\u0275conditionalCreate(27, MapEditorComponent_Conditional_27_Template, 10, 4, "aside", 21);
      \u0275\u0275elementStart(28, "div", 22);
      \u0275\u0275element(29, "div", 23, 0);
      \u0275\u0275conditionalCreate(31, MapEditorComponent_Conditional_31_Template, 1, 8, "div", 24);
      \u0275\u0275conditionalCreate(32, MapEditorComponent_Conditional_32_Template, 2, 0, "div", 25);
      \u0275\u0275conditionalCreate(33, MapEditorComponent_Conditional_33_Template, 6, 0, "div", 26);
      \u0275\u0275conditionalCreate(34, MapEditorComponent_Conditional_34_Template, 14, 0, "div", 27);
      \u0275\u0275elementStart(35, "div", 28)(36, "span");
      \u0275\u0275text(37);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(38, "span", 29);
      \u0275\u0275text(39);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(40, "span");
      \u0275\u0275text(41);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(42, "span");
      \u0275\u0275text(43);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(44, "span");
      \u0275\u0275text(45);
      \u0275\u0275elementEnd()()();
      \u0275\u0275conditionalCreate(46, MapEditorComponent_Conditional_46_Template, 13, 11, "aside", 30);
      \u0275\u0275elementEnd()();
    }
    if (rf & 2) {
      let tmp_12_0;
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.worldName());
      \u0275\u0275advance(5);
      \u0275\u0275textInterpolate1("", ctx.zoomPct(), "%");
      \u0275\u0275advance(6);
      \u0275\u0275classProp("active", ctx.showGrid());
      \u0275\u0275advance(2);
      \u0275\u0275classProp("active", ctx.diagOn());
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", !ctx.canUndo());
      \u0275\u0275advance(2);
      \u0275\u0275property("disabled", !ctx.canRedo());
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.saving() ? 23 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.isGM() ? 24 : 25);
      \u0275\u0275advance(3);
      \u0275\u0275conditional(ctx.isGM() ? 27 : -1);
      \u0275\u0275advance(2);
      \u0275\u0275classProp("brush-cursor", ctx.isGM() && ctx.isTerrainTab())("place-cursor", ctx.isPlacingSymbols());
      \u0275\u0275advance(2);
      \u0275\u0275conditional((tmp_12_0 = ctx.marquee()) ? 31 : -1, tmp_12_0);
      \u0275\u0275advance();
      \u0275\u0275conditional(!ctx.ready() ? 32 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.contextLost() ? 33 : -1);
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.diagOn() ? 34 : -1);
      \u0275\u0275advance(3);
      \u0275\u0275textInterpolate(ctx.activeToolLabel());
      \u0275\u0275advance();
      \u0275\u0275classProp("coarse", ctx.detailTier() !== "high");
      \u0275\u0275advance();
      \u0275\u0275textInterpolate1("Detail: ", ctx.detailTierLabel());
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("x ", ctx.cursorWorld().x, " \xB7 y ", ctx.cursorWorld().y);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate2("Hex ", ctx.cursorHex().q, ",", ctx.cursorHex().r);
      \u0275\u0275advance(2);
      \u0275\u0275textInterpolate1("", ctx.kmPerHex, " km / Hex");
      \u0275\u0275advance();
      \u0275\u0275conditional(ctx.isGM() ? 46 : -1);
    }
  }, dependencies: [CommonModule, NgStyle], styles: ["\n\n.map-editor-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  overflow: hidden;\n  background: #16161a;\n  color: #e6e6ea;\n}\n.editor-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 12px;\n  background: #1f1f25;\n  border-bottom: 1px solid #2e2e37;\n  flex: 0 0 auto;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.editor-toolbar[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 4px 10px;\n  font-size: 13px;\n  cursor: pointer;\n}\n.editor-toolbar[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #343440;\n}\n.editor-toolbar[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] {\n  background: #3d5a80;\n  border-color: #4f7fb0;\n}\n.editor-toolbar[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled {\n  opacity: 0.35;\n  cursor: default;\n}\n.world-name[_ngcontent-%COMP%] {\n  font-weight: 600;\n  font-size: 14px;\n}\n.zoom-readout[_ngcontent-%COMP%] {\n  min-width: 52px;\n  text-align: center;\n  font-variant-numeric: tabular-nums;\n  font-size: 13px;\n  opacity: 0.85;\n}\n.sep[_ngcontent-%COMP%] {\n  width: 1px;\n  height: 20px;\n  background: #33333d;\n  margin: 0 4px;\n}\n.spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.badge[_ngcontent-%COMP%] {\n  font-size: 11px;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: #2a2a33;\n  border: 1px solid #3a3a46;\n}\n.badge.gm[_ngcontent-%COMP%] {\n  background: #4a3a6b;\n  border-color: #6b5696;\n}\n.badge.saving[_ngcontent-%COMP%] {\n  background: #3d5a80;\n  border-color: #4f7fb0;\n}\n.editor-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1 1 auto;\n  min-height: 0;\n}\n.tool-rail[_ngcontent-%COMP%] {\n  flex: 0 0 104px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 8px 6px;\n  background: #1c1c22;\n  border-right: 1px solid #2e2e37;\n  overflow-y: auto;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.tab-strip[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.tab-btn[_ngcontent-%COMP%] {\n  background: #24242c;\n  color: #d6d6de;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 7px 8px;\n  font-size: 13px;\n  text-align: left;\n  cursor: pointer;\n}\n.tab-btn[_ngcontent-%COMP%]:hover {\n  background: #303039;\n}\n.tab-btn.active[_ngcontent-%COMP%] {\n  background: #4a3a6b;\n  border-color: #8a6fc0;\n  color: #fff;\n  font-weight: 600;\n}\n.rail-divider[_ngcontent-%COMP%] {\n  flex: 0 0 auto;\n  height: 2px;\n  margin: 8px -6px;\n  background: #0f0f13;\n  border-top: 1px solid #2e2e37;\n  border-bottom: 1px solid #26262e;\n}\n.tool-icons[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  align-content: flex-start;\n}\n.rail-btn[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #2a2a33;\n  border: 1px solid #3a3a46;\n  border-radius: 6px;\n  cursor: pointer;\n  padding: 0;\n}\n.rail-btn[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  object-fit: contain;\n  pointer-events: none;\n}\n.rail-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: #343440;\n}\n.rail-btn.active[_ngcontent-%COMP%] {\n  background: #3d5a80;\n  border-color: #6d9fd0;\n}\n.rail-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n.settings-panel[_ngcontent-%COMP%] {\n  flex: 0 0 300px;\n  overflow-y: auto;\n  background: #1c1c22;\n  border-left: 1px solid #2e2e37;\n  padding: 10px;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.settings-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  margin-bottom: 10px;\n  padding-bottom: 6px;\n  border-bottom: 1px solid #2e2e37;\n}\n.panel-section[_ngcontent-%COMP%] {\n  margin-bottom: 16px;\n}\n.panel-title[_ngcontent-%COMP%] {\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  opacity: 0.55;\n  margin-bottom: 6px;\n}\n.slider-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 58px 1fr 44px;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  margin-bottom: 6px;\n}\n.slider-row[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.slider-row[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  font-style: normal;\n  opacity: 0.7;\n  text-align: right;\n  font-variant-numeric: tabular-nums;\n}\n.check-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  margin-top: 6px;\n  cursor: pointer;\n}\n.hint[_ngcontent-%COMP%] {\n  font-size: 11px;\n  opacity: 0.45;\n  margin: 6px 0 0;\n  line-height: 1.4;\n}\n.asset-error[_ngcontent-%COMP%] {\n  margin: 0 0 12px;\n  padding: 7px 8px;\n  border-radius: 5px;\n  background: #4a2a2a;\n  border: 1px solid #7a4444;\n  font-size: 11px;\n  line-height: 1.4;\n}\n.base-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 12px;\n}\n.base-row[_ngcontent-%COMP%]   input[type=color][_ngcontent-%COMP%] {\n  width: 42px;\n  height: 24px;\n  padding: 0;\n  border: 1px solid #3a3a46;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n}\n.swatches[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.swatch-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: inline-flex;\n}\n.hidden-color[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  inset: 0;\n  opacity: 0;\n  pointer-events: none;\n  border: 0;\n  padding: 0;\n}\n.swatch[_ngcontent-%COMP%] {\n  width: 26px;\n  height: 26px;\n  border-radius: 5px;\n  border: 2px solid #3a3a46;\n  cursor: pointer;\n  padding: 0;\n}\n.swatch.active[_ngcontent-%COMP%] {\n  border-color: #ffffff;\n  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);\n}\n.swatch.add[_ngcontent-%COMP%] {\n  position: relative;\n  background: #2a2a33;\n  color: #9a9aa8;\n  font-size: 15px;\n  line-height: 1;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n.swatch.add[_ngcontent-%COMP%]   .hidden-color[_ngcontent-%COMP%] {\n  pointer-events: auto;\n  cursor: pointer;\n}\n.sprite-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));\n  gap: 4px;\n  max-height: 52vh;\n  overflow-y: auto;\n  padding-right: 2px;\n}\n.sprite-cell[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #24242c;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  cursor: pointer;\n  padding: 0;\n  overflow: hidden;\n}\n.sprite-cell[_ngcontent-%COMP%]:hover {\n  background: #343440;\n}\n.sprite-cell.active[_ngcontent-%COMP%] {\n  border-color: #6d9fd0;\n  background: #3d5a80;\n}\n.sprite-thumb[_ngcontent-%COMP%] {\n  display: block;\n}\n.history-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 5px;\n  margin-bottom: 5px;\n}\n.history-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  flex: 1;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px 4px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.history-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  background: #343440;\n}\n.profile-row[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.profile-btn[_ngcontent-%COMP%] {\n  flex: 1 1 auto;\n  min-width: 56px;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px 6px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.profile-btn[_ngcontent-%COMP%]:hover {\n  background: #343440;\n}\n.profile-btn.active[_ngcontent-%COMP%] {\n  background: #3d5a80;\n  border-color: #6d9fd0;\n}\n.search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-bottom: 6px;\n}\n.preset-current[_ngcontent-%COMP%] {\n  text-transform: none;\n  letter-spacing: 0;\n  opacity: 0.9;\n  color: #8fd0ff;\n}\n.history-row[_ngcontent-%COMP%]   button.active-preset[_ngcontent-%COMP%] {\n  background: #3d5a80;\n  border-color: #6d9fd0;\n}\n.text-input[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px 7px;\n  font-size: 12px;\n}\n.history-row[_ngcontent-%COMP%]   button.narrow[_ngcontent-%COMP%] {\n  flex: 0 0 30px;\n}\n.paper-select[_ngcontent-%COMP%] {\n  width: 100%;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px;\n  font-size: 12px;\n  margin-bottom: 6px;\n}\n.viewer-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  flex: 1 1 auto;\n  min-width: 0;\n}\n.pixi-host[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  touch-action: none;\n  cursor: default;\n}\n.pixi-host.brush-cursor[_ngcontent-%COMP%], \n.pixi-host.place-cursor[_ngcontent-%COMP%] {\n  cursor: none;\n}\n.pixi-host[_ngcontent-%COMP%]   canvas[_ngcontent-%COMP%] {\n  display: block;\n}\n.marquee[_ngcontent-%COMP%] {\n  position: absolute;\n  border: 1px solid #8fd0ff;\n  background: rgba(143, 208, 255, 0.14);\n  pointer-events: none;\n}\n.loading-overlay[_ngcontent-%COMP%] {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(22, 22, 26, 0.85);\n  font-size: 14px;\n  pointer-events: none;\n}\n.loading-overlay.context-lost[_ngcontent-%COMP%] {\n  background: rgba(60, 22, 22, 0.92);\n  text-align: center;\n  line-height: 1.5;\n  pointer-events: auto;\n}\n.status-bar[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 10px;\n  bottom: 10px;\n  display: flex;\n  gap: 14px;\n  padding: 4px 10px;\n  border-radius: 6px;\n  background: rgba(20, 20, 24, 0.72);\n  border: 1px solid #2e2e37;\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  opacity: 0.9;\n  pointer-events: none;\n}\n.diag-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  width: 430px;\n  max-height: 72vh;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 8px;\n  border-radius: 6px;\n  background: rgba(14, 14, 18, 0.92);\n  border: 1px solid #3a3a46;\n  font-size: 11px;\n  font-family: monospace;\n  pointer-events: none;\n}\n.diag-head[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  pointer-events: auto;\n}\n.diag-head[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  flex: 1;\n  font-family: inherit;\n}\n.diag-head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 4px;\n  padding: 2px 7px;\n  font-size: 11px;\n  cursor: pointer;\n}\n.diag-stats[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1px 10px;\n}\n.diag-stat[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 6px;\n}\n.diag-stat[_ngcontent-%COMP%]   em[_ngcontent-%COMP%] {\n  font-style: normal;\n  opacity: 0.5;\n}\n.diag-events[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  border-top: 1px solid #2e2e37;\n  padding-top: 4px;\n  pointer-events: auto;\n}\n.diag-event[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 46px 96px 1fr;\n  gap: 6px;\n  opacity: 0.85;\n  white-space: nowrap;\n}\n.diag-event.warn[_ngcontent-%COMP%] {\n  color: #ff8f8f;\n  opacity: 1;\n}\n.diag-t[_ngcontent-%COMP%] {\n  text-align: right;\n  opacity: 0.45;\n}\n.diag-kind[_ngcontent-%COMP%] {\n  color: #8fd0ff;\n}\n.diag-detail[_ngcontent-%COMP%] {\n  opacity: 0.55;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.status-tier.coarse[_ngcontent-%COMP%] {\n  color: #ffc46b;\n}\n/*# sourceMappingURL=map-editor.component.css.map */"], changeDetection: 0 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MapEditorComponent, [{
    type: Component,
    args: [{ selector: "app-map-editor", standalone: true, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `<div class="map-editor-page">\r
  <div class="editor-toolbar">\r
    <span class="world-name">{{ worldName() }}</span>\r
\r
    <span class="sep"></span>\r
\r
    <button type="button" (click)="zoomBy(1 / 1.4)" title="Herauszoomen">\u2212</button>\r
    <span class="zoom-readout">{{ zoomPct() }}%</span>\r
    <button type="button" (click)="zoomBy(1.4)" title="Hineinzoomen">+</button>\r
    <button type="button" (click)="resetView()" title="Ansicht zur\xFCcksetzen">Ansicht</button>\r
\r
    <span class="sep"></span>\r
\r
    <button type="button" [class.active]="showGrid()" (click)="toggleGrid()">Hexgitter</button>\r
    <button\r
      type="button"\r
      [class.active]="diagOn()"\r
      title="Kachel-Diagnose: zeigt Detailstufe, Chunk-Raster und Streaming-Ereignisse"\r
      (click)="toggleDiagnostics()"\r
    >\r
      Diagnose\r
    </button>\r
    <button type="button" [disabled]="!canUndo()" (click)="undo()" title="Strg+Z">\u21B6</button>\r
    <button type="button" [disabled]="!canRedo()" (click)="redo()" title="Strg+Shift+Z">\u21B7</button>\r
\r
    <span class="spacer"></span>\r
\r
    @if (saving()) {\r
      <span class="badge saving">Speichert \u2026</span>\r
    }\r
    @if (isGM()) {\r
      <span class="badge gm">GM</span>\r
    } @else {\r
      <span class="badge">Spieler</span>\r
    }\r
  </div>\r
\r
  <div class="editor-body">\r
    @if (isGM()) {\r
      <!-- LEFT: tabs and their tools, as icons only. -->\r
      <aside class="tool-rail">\r
        <!-- Categories as text; the tools inside them are the icons. -->\r
        <div class="tab-strip">\r
          @for (t of tabs; track t.id) {\r
            <button\r
              type="button"\r
              class="tab-btn"\r
              [class.active]="tab() === t.id"\r
              (click)="selectTab(t.id)"\r
            >\r
              {{ t.label }}\r
            </button>\r
          }\r
        </div>\r
\r
        <div class="rail-divider"></div>\r
\r
        <div class="tool-icons">\r
          @if (isTerrainTab()) {\r
            @for (t of terrainTools(); track t.id) {\r
              <button\r
                type="button"\r
                class="rail-btn"\r
                [class.active]="terrainTool() === t.id"\r
                [title]="t.label"\r
                (click)="selectTerrainTool(t.id)"\r
              >\r
                <img [src]="icon(t.icon)" [alt]="t.label" />\r
              </button>\r
            }\r
          }\r
\r
          @if (tab() === 'symbols') {\r
            @for (t of symbolTools; track t.id) {\r
              <button\r
                type="button"\r
                class="rail-btn"\r
                [class.active]="symbolTool() === t.id"\r
                [disabled]="!assetsReady()"\r
                [title]="t.label"\r
                (click)="selectSymbolTool(t.id)"\r
              >\r
                <img [src]="icon(t.icon)" [alt]="t.label" />\r
              </button>\r
            }\r
          }\r
\r
          @if (tab() === 'regions') {\r
            @for (t of regionTools; track t.id) {\r
              <button\r
                type="button"\r
                class="rail-btn"\r
                [class.active]="regionTool() === t.id"\r
                [title]="t.label"\r
                (click)="selectRegionTool(t.id)"\r
              >\r
                <img [src]="icon(t.icon)" [alt]="t.label" />\r
              </button>\r
            }\r
          }\r
\r
          @if (tab() === 'labels') {\r
            @for (t of labelTools; track t.id) {\r
              <button\r
                type="button"\r
                class="rail-btn"\r
                [class.active]="labelTool() === t.id"\r
                [title]="t.label"\r
                (click)="selectLabelTool(t.id)"\r
              >\r
                <img [src]="icon(t.icon)" [alt]="t.label" />\r
              </button>\r
            }\r
          }\r
        </div>\r
      </aside>\r
    }\r
\r
    <div class="viewer-wrap">\r
      <div\r
        #pixiHost\r
        class="pixi-host"\r
        [class.brush-cursor]="isGM() && isTerrainTab()"\r
        [class.place-cursor]="isPlacingSymbols()"\r
      ></div>\r
\r
      @if (marquee(); as m) {\r
        <div\r
          class="marquee"\r
          [style.left.px]="m.x"\r
          [style.top.px]="m.y"\r
          [style.width.px]="m.w"\r
          [style.height.px]="m.h"\r
        ></div>\r
      }\r
\r
      @if (!ready()) {\r
        <div class="loading-overlay">Karte wird geladen \u2026</div>\r
      }\r
\r
      @if (contextLost()) {\r
        <div class="loading-overlay context-lost">\r
          <div>\r
            <strong>Grafikkontext verloren.</strong>\r
            <p>Die Karte kann nicht mehr gezeichnet werden. Bitte die Seite neu laden.</p>\r
          </div>\r
        </div>\r
      }\r
\r
      @if (diagOn()) {\r
        <div class="diag-panel">\r
          <div class="diag-head">\r
            <strong>Streaming</strong>\r
            <button type="button" (click)="resetDiagnostics()">Reset</button>\r
            <button type="button" (click)="dumpDiagnostics()">Konsole</button>\r
          </div>\r
\r
          <div class="diag-stats">\r
            @for (s of diagSummary(); track s.label) {\r
              <span class="diag-stat"><em>{{ s.label }}</em>{{ s.value }}</span>\r
            }\r
          </div>\r
\r
          <div class="diag-events">\r
            @for (e of diagEvents(); track $index) {\r
              <div class="diag-event" [class.warn]="e.kind.startsWith('fetch:err') || e.kind === 'upload:fail'">\r
                <span class="diag-t">{{ e.t }}</span>\r
                <span class="diag-kind">{{ e.kind }}</span>\r
                <span class="diag-tile">{{ e.tile }}</span>\r
                <span class="diag-detail">{{ e.detail }}</span>\r
              </div>\r
            }\r
          </div>\r
        </div>\r
      }\r
\r
      <div class="status-bar">\r
        <span>{{ activeToolLabel() }}</span>\r
        <span class="status-tier" [class.coarse]="detailTier() !== 'high'"\r
          >Detail: {{ detailTierLabel() }}</span\r
        >\r
        <span>x {{ cursorWorld().x }} \xB7 y {{ cursorWorld().y }}</span>\r
        <span>Hex {{ cursorHex().q }},{{ cursorHex().r }}</span>\r
        <span>{{ kmPerHex }} km / Hex</span>\r
      </div>\r
    </div>\r
\r
    @if (isGM()) {\r
      <!-- RIGHT: settings for the active tool only. -->\r
      <aside class="settings-panel">\r
        <div class="settings-title">{{ activeToolLabel() }}</div>\r
\r
        @if (assetsError()) {\r
          <p class="asset-error">{{ assetsError() }}</p>\r
        }\r
\r
        @if (showBrushSettings()) {\r
          <div class="panel-section">\r
            <div class="panel-title">Profil</div>\r
            <div class="profile-row">\r
              @for (p of brushProfiles; track p.id) {\r
                <button\r
                  type="button"\r
                  class="profile-btn"\r
                  [class.active]="activeProfile() === p.id"\r
                  (click)="applyBrushProfile(p.id)"\r
                >\r
                  {{ p.label }}\r
                </button>\r
              }\r
            </div>\r
          </div>\r
\r
          <div class="panel-section">\r
            <label class="slider-row">\r
              <span>Gr\xF6\xDFe</span>\r
              <input\r
                type="range"\r
                min="16"\r
                max="3000"\r
                step="1"\r
                [value]="brushSize()"\r
                (input)="setBrushSize($any($event.target).value)"\r
              />\r
              <em>{{ brushSize() }}</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Weichheit</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="1"\r
                step="0.05"\r
                [value]="brushSoftness()"\r
                (input)="setSoftness($any($event.target).value)"\r
              />\r
              <em>{{ (brushSoftness() * 100).toFixed(0) }}%</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>St\xE4rke</span>\r
              <input\r
                type="range"\r
                min="0.05"\r
                max="1"\r
                step="0.05"\r
                [value]="brushStrength()"\r
                (input)="setStrength($any($event.target).value)"\r
              />\r
              <em>{{ (brushStrength() * 100).toFixed(0) }}%</em>\r
            </label>\r
\r
            @if (showNoiseSetting()) {\r
              <label class="slider-row" title="Wie zerrissen der Rand des Pinsels ist">\r
                <span>Rauschen</span>\r
                <input\r
                  type="range"\r
                  min="0"\r
                  max="1"\r
                  step="0.05"\r
                  [value]="brushNoise()"\r
                  (input)="brushNoise.set(+$any($event.target).value)"\r
                />\r
                <em>{{ (brushNoise() * 100).toFixed(0) }}%</em>\r
              </label>\r
            }\r
\r
            <p class="hint">Shift + ziehen oder Strg + Mausrad \xE4ndert die Gr\xF6\xDFe.</p>\r
          </div>\r
        }\r
\r
        @if (isTerrainTab() && terrainTool() === 'lakeStamp') {\r
          <div class="panel-section">\r
            <label class="slider-row">\r
              <span>Gr\xF6\xDFe</span>\r
              <input\r
                type="range"\r
                min="80"\r
                max="4000"\r
                step="1"\r
                [value]="brushSize()"\r
                (input)="setBrushSize($any($event.target).value)"\r
              />\r
              <em>{{ brushSize() }}</em>\r
            </label>\r
            <p class="hint">Jeder Klick erzeugt eine neue Form.</p>\r
          </div>\r
        }\r
\r
        @if (showLandPalette()) {\r
          <div class="panel-section">\r
            <div class="panel-title">Landfarbe</div>\r
            <div class="swatches">\r
              @for (c of landPalette(); track $index) {\r
                <span class="swatch-wrap">\r
                  <button\r
                    type="button"\r
                    class="swatch"\r
                    [class.active]="selectedLand() === $index"\r
                    [style.background]="c"\r
                    [title]="c + ' \u2014 Rechtsklick entfernt, Doppelklick \xE4ndert'"\r
                    (click)="selectLandColor($index)"\r
                    (dblclick)="landEdit.click()"\r
                    (contextmenu)="removeLandColor($index); $event.preventDefault()"\r
                  ></button>\r
                  <input\r
                    #landEdit\r
                    type="color"\r
                    class="hidden-color"\r
                    [value]="c"\r
                    (input)="editLandColor($index, $any($event.target).value)"\r
                  />\r
                </span>\r
              }\r
              <label class="swatch add" title="Farbe w\xE4hlen und hinzuf\xFCgen">\r
                +\r
                <input\r
                  type="color"\r
                  class="hidden-color"\r
                  value="#7a8f5a"\r
                  (change)="addLandColor($any($event.target).value)"\r
                />\r
              </label>\r
            </div>\r
            <p class="hint">Ohne Auswahl wird neues Land wei\xDF gezeichnet.</p>\r
          </div>\r
        }\r
\r
        @if (showWaterPalette()) {\r
          <div class="panel-section">\r
            <div class="panel-title">Wasserfarbe</div>\r
            <div class="swatches">\r
              @for (c of waterPalette(); track $index) {\r
                <span class="swatch-wrap">\r
                  <button\r
                    type="button"\r
                    class="swatch"\r
                    [class.active]="selectedWater() === $index"\r
                    [style.background]="c"\r
                    [title]="c + ' \u2014 Rechtsklick entfernt, Doppelklick \xE4ndert'"\r
                    (click)="selectWaterColor($index)"\r
                    (dblclick)="waterEdit.click()"\r
                    (contextmenu)="removeWaterColor($index); $event.preventDefault()"\r
                  ></button>\r
                  <input\r
                    #waterEdit\r
                    type="color"\r
                    class="hidden-color"\r
                    [value]="c"\r
                    (input)="editWaterColor($index, $any($event.target).value)"\r
                  />\r
                </span>\r
              }\r
              <label class="swatch add" title="Farbe w\xE4hlen und hinzuf\xFCgen">\r
                +\r
                <input\r
                  type="color"\r
                  class="hidden-color"\r
                  value="#3f6d8c"\r
                  (change)="addWaterColor($any($event.target).value)"\r
                />\r
              </label>\r
            </div>\r
          </div>\r
        }\r
\r
        @if (isPlacingSymbols()) {\r
          <!-- The whole category at once: browsing group names to find one mountain was\r
               guesswork through a list of words. -->\r
          <div class="panel-section">\r
            <input\r
              type="search"\r
              class="text-input search-input"\r
              placeholder="Symbole suchen \u2026"\r
              [value]="symbolQuery()"\r
              (input)="symbolQuery.set($any($event.target).value)"\r
            />\r
            @if (symbolQuery()) {\r
              <p class="hint">{{ visibleSprites().length }} Treffer</p>\r
            }\r
\r
            <div class="sprite-grid">\r
              @for (s of visibleSprites(); track s) {\r
                <button\r
                  type="button"\r
                  class="sprite-cell"\r
                  [class.active]="currentSprite() === s"\r
                  [title]="spriteName(s)"\r
                  (click)="selectSprite(s)"\r
                >\r
                  <span class="sprite-thumb" [ngStyle]="spriteThumb(s)"></span>\r
                </button>\r
              }\r
            </div>\r
            <p class="hint">Shift + Mausrad wechselt zum n\xE4chsten Symbol.</p>\r
          </div>\r
\r
          <div class="panel-section">\r
            <label class="slider-row">\r
              <span>Gr\xF6\xDFe</span>\r
              <input\r
                type="range"\r
                min="0.05"\r
                max="8"\r
                step="0.05"\r
                [value]="symbolScale()"\r
                (input)="setSymbolScale($any($event.target).value)"\r
              />\r
              <em>{{ symbolScale().toFixed(2) }}\xD7</em>\r
            </label>\r
\r
            <label class="slider-row" title="Zuf\xE4llige Drehung pro Platzierung">\r
              <span>Drehung</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="180"\r
                step="5"\r
                [value]="rotationJitter()"\r
                (input)="rotationJitter.set(+$any($event.target).value)"\r
              />\r
              <em>\xB1{{ rotationJitter() }}\xB0</em>\r
            </label>\r
\r
            @if (symbolVaries()) {\r
              <label class="check-row">\r
                <input\r
                  type="checkbox"\r
                  [checked]="autoVary()"\r
                  (change)="autoVary.set($any($event.target).checked)"\r
                />\r
                <span>Nach dem Setzen variieren</span>\r
              </label>\r
            }\r
\r
            <label class="check-row" title="Zuf\xE4llig gespiegelt platzieren">\r
              <input\r
                type="checkbox"\r
                [checked]="flipJitter()"\r
                (change)="flipJitter.set($any($event.target).checked)"\r
              />\r
              <span>Zuf\xE4llig spiegeln</span>\r
            </label>\r
\r
            <label class="check-row" title="Nur f\xFCr den GM sichtbar, bis aufgedeckt">\r
              <input\r
                type="checkbox"\r
                [checked]="placeSecret()"\r
                (change)="placeSecret.set($any($event.target).checked)"\r
              />\r
              <span>Als Geheimnis platzieren</span>\r
            </label>\r
\r
            <p class="hint">Shift + ziehen skaliert \xB7 Alt + Klick entfernt</p>\r
          </div>\r
        }\r
\r
        @if (isSelecting()) {\r
          <div class="panel-section">\r
            @if (selectedIds().length) {\r
              <p class="hint">{{ selectedIds().length }} ausgew\xE4hlt</p>\r
              <div class="history-row">\r
                <button type="button" (click)="scaleSelected(1 / 1.2)">Kleiner</button>\r
                <button type="button" (click)="scaleSelected(1.2)">Gr\xF6\xDFer</button>\r
              </div>\r
              <div class="history-row">\r
                <button type="button" (click)="rotateSelected(-0.2618)">\u21BA</button>\r
                <button type="button" (click)="rotateSelected(0.2618)">\u21BB</button>\r
                <button type="button" (click)="flipSelected()">Spiegeln</button>\r
              </div>\r
              <div class="history-row">\r
                <button type="button" (click)="toggleSelectedSecret()">Geheim umschalten</button>\r
              </div>\r
              <div class="history-row">\r
                <button type="button" (click)="deleteSelected()">L\xF6schen (Entf)</button>\r
              </div>\r
            } @else {\r
              <p class="hint">\r
                Symbol anklicken oder Rahmen ziehen \xB7 Shift f\xFCr Mehrfachauswahl \xB7 ziehen zum\r
                Verschieben\r
              </p>\r
            }\r
          </div>\r
        }\r
\r
        @if (tab() === 'regions') {\r
          <div class="panel-section">\r
            <div class="panel-title">Stil</div>\r
\r
            <label class="base-row">\r
              <span>Linie</span>\r
              <input\r
                type="color"\r
                [value]="regionColor()"\r
                (input)="regionColor.set($any($event.target).value); applyRegionStyle()"\r
              />\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Dicke</span>\r
              <input\r
                type="range"\r
                min="2"\r
                max="160"\r
                step="1"\r
                [value]="regionThickness()"\r
                (input)="regionThickness.set(+$any($event.target).value); applyRegionStyle()"\r
              />\r
              <em>{{ regionThickness() }}</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Strich</span>\r
              <input\r
                type="range"\r
                min="8"\r
                max="500"\r
                step="1"\r
                [value]="regionDash()"\r
                (input)="regionDash.set(+$any($event.target).value); applyRegionStyle()"\r
              />\r
              <em>{{ regionDash() }}</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>L\xFCcke</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="500"\r
                step="1"\r
                [value]="regionGap()"\r
                (input)="regionGap.set(+$any($event.target).value); applyRegionStyle()"\r
              />\r
              <em>{{ regionGap() }}</em>\r
            </label>\r
\r
            <label class="base-row">\r
              <span>F\xFCllung</span>\r
              <input\r
                type="color"\r
                [value]="regionFill()"\r
                (input)="regionFill.set($any($event.target).value); applyRegionStyle()"\r
              />\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Deckkraft</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="0.8"\r
                step="0.02"\r
                [value]="regionFillAlpha()"\r
                (input)="regionFillAlpha.set(+$any($event.target).value); applyRegionStyle()"\r
              />\r
              <em>{{ (regionFillAlpha() * 100).toFixed(0) }}%</em>\r
            </label>\r
          </div>\r
\r
          @if (regionTool() === 'draw') {\r
            <div class="panel-section">\r
              <p class="hint">\r
                Klicken setzt Punkte \xB7 Enter schlie\xDFt die Region \xB7 R\xFCcktaste nimmt den letzten\r
                Punkt zur\xFCck \xB7 Esc bricht ab\r
              </p>\r
              @if (draftPoints().length) {\r
                <div class="history-row">\r
                  <button type="button" (click)="finishRegion()">Schlie\xDFen</button>\r
                  <button type="button" (click)="cancelDraft()">Abbrechen</button>\r
                </div>\r
              }\r
\r
              <label class="check-row" title="Nur f\xFCr den GM sichtbar, bis aufgedeckt">\r
                <input\r
                  type="checkbox"\r
                  [checked]="placeSecret()"\r
                  (change)="placeSecret.set($any($event.target).checked)"\r
                />\r
                <span>Als Geheimnis</span>\r
              </label>\r
            </div>\r
          } @else {\r
            <div class="panel-section">\r
              @if (selectedRegionId()) {\r
                <p class="hint">\r
                  Punkte ziehen zum Bearbeiten \xB7 Rahmen im leeren Bereich w\xE4hlt mehrere Punkte \xB7\r
                  einen gew\xE4hlten Punkt ziehen verschiebt alle\r
                </p>\r
                <div class="history-row">\r
                  <button type="button" (click)="selectAllRegionPoints()">Alle Punkte</button>\r
                </div>\r
                <div class="history-row">\r
                  <button type="button" (click)="deleteSelectedRegion()">L\xF6schen (Entf)</button>\r
                </div>\r
              } @else {\r
                <p class="hint">Auf eine Regionslinie klicken.</p>\r
              }\r
            </div>\r
          }\r
        }\r
\r
        @if (tab() === 'labels') {\r
          <div class="panel-section">\r
            <div class="panel-title">Text</div>\r
            <!-- Applies as you type; waiting for Enter made the map feel unresponsive. -->\r
            <input\r
              type="text"\r
              class="text-input"\r
              [value]="labelText()"\r
              (input)="onLabelTextInput($any($event.target).value)"\r
            />\r
          </div>\r
\r
          <div class="panel-section">\r
            <div class="panel-title">Stil</div>\r
\r
            <label class="slider-row">\r
              <span>Gr\xF6\xDFe</span>\r
              <input\r
                type="range"\r
                min="24"\r
                max="1200"\r
                step="1"\r
                [value]="labelStyle().fontSize"\r
                (input)="setLabelStyle('fontSize', +$any($event.target).value)"\r
              />\r
              <em>{{ labelStyle().fontSize }}</em>\r
            </label>\r
\r
            <label class="slider-row" title="Biegung des Textes">\r
              <span>Kr\xFCmmung</span>\r
              <input\r
                type="range"\r
                min="-1"\r
                max="1"\r
                step="0.02"\r
                [value]="labelStyle().curvature"\r
                (input)="setLabelStyle('curvature', +$any($event.target).value)"\r
              />\r
              <em>{{ labelStyle().curvature.toFixed(2) }}</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Abstand</span>\r
              <input\r
                type="range"\r
                min="-40"\r
                max="160"\r
                step="1"\r
                [value]="labelStyle().letterSpacing"\r
                (input)="setLabelStyle('letterSpacing', +$any($event.target).value)"\r
              />\r
              <em>{{ labelStyle().letterSpacing }}</em>\r
            </label>\r
\r
            <label class="base-row">\r
              <span>F\xFCllfarbe</span>\r
              <input\r
                type="color"\r
                [value]="labelStyle().fill"\r
                (input)="setLabelStyle('fill', $any($event.target).value)"\r
              />\r
            </label>\r
\r
            <label class="base-row">\r
              <span>Kontur</span>\r
              <input\r
                type="color"\r
                [value]="labelStyle().outline"\r
                (input)="setLabelStyle('outline', $any($event.target).value)"\r
              />\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Konturbr.</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="90"\r
                step="1"\r
                [value]="labelStyle().outlineWidth"\r
                (input)="setLabelStyle('outlineWidth', +$any($event.target).value)"\r
              />\r
              <em>{{ labelStyle().outlineWidth }}</em>\r
            </label>\r
          </div>\r
\r
          <div class="panel-section">\r
            <div class="panel-title">\r
              Vorlagen\r
              @if (activePresetName(); as n) {\r
                <span class="preset-current">\xB7 {{ n }}</span>\r
              }\r
            </div>\r
            @for (p of labelPresets(); track p.id) {\r
              <div class="history-row">\r
                <button\r
                  type="button"\r
                  [class.active-preset]="activePresetId() === p.id"\r
                  (click)="applyLabelPreset(p.id)"\r
                >\r
                  {{ p.name }}\r
                </button>\r
                <button type="button" class="narrow" (click)="removeLabelPreset(p.id)">\xD7</button>\r
              </div>\r
            }\r
            <p class="hint">\r
              Gleicher Name \xFCberschreibt die Vorlage und \xE4ndert alle Beschriftungen, die sie\r
              nutzen.\r
            </p>\r
            <div class="history-row">\r
              <input\r
                #presetName\r
                type="text"\r
                class="text-input"\r
                placeholder="z. B. Stadtname"\r
                (keydown.enter)="saveLabelPreset(presetName.value); presetName.value = ''"\r
              />\r
              <button\r
                type="button"\r
                class="narrow"\r
                (click)="saveLabelPreset(presetName.value); presetName.value = ''"\r
              >\r
                +\r
              </button>\r
            </div>\r
          </div>\r
\r
          <div class="panel-section">\r
            @if (labelTool() === 'place') {\r
              <label class="check-row" title="Nur f\xFCr den GM sichtbar, bis aufgedeckt">\r
                <input\r
                  type="checkbox"\r
                  [checked]="placeSecret()"\r
                  (change)="placeSecret.set($any($event.target).checked)"\r
                />\r
                <span>Als Geheimnis</span>\r
              </label>\r
              <p class="hint">Klicken setzt die Beschriftung.</p>\r
            } @else if (selectedLabelIds().length) {\r
              <p class="hint">\r
                {{ selectedLabelIds().length }} ausgew\xE4hlt \xB7 ziehen zum Verschieben\r
              </p>\r
              <div class="history-row">\r
                <button type="button" (click)="deleteSelectedLabel()">L\xF6schen (Entf)</button>\r
              </div>\r
            } @else {\r
              <p class="hint">\r
                Auf eine Beschriftung klicken \xB7 Shift f\xFCr Mehrfachauswahl \xB7 Rahmen ziehen\r
              </p>\r
            }\r
          </div>\r
        }\r
\r
        @if (tab() === 'map') {\r
          <div class="panel-section">\r
            <div class="panel-title">Meerfarbe</div>\r
            <label class="base-row" title="Farbe von offenem Wasser">\r
              <span>Offenes Wasser</span>\r
              <input\r
                type="color"\r
                [value]="waterBase()"\r
                (input)="setWaterBase($any($event.target).value)"\r
              />\r
            </label>\r
          </div>\r
\r
          <div class="panel-section">\r
            <div class="panel-title">K\xFCstenlinie</div>\r
\r
            <label class="slider-row" title="Gro\xDFe Werte geben weite Buchten, kleine feine Zacken">\r
              <span>Grobheit</span>\r
              <input\r
                type="range"\r
                min="200"\r
                max="6000"\r
                step="10"\r
                [value]="coast().noiseScale"\r
                (input)="setCoast('noiseScale', +$any($event.target).value)"\r
                (change)="commitCoast()"\r
              />\r
              <em>{{ coast().noiseScale }}</em>\r
            </label>\r
\r
            <label class="slider-row" title="Wie stark die K\xFCste vom gemalten Rand abweicht">\r
              <span>Zerfranst</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="1"\r
                step="0.02"\r
                [value]="coast().noiseAmount"\r
                (input)="setCoast('noiseAmount', +$any($event.target).value)"\r
                (change)="commitCoast()"\r
              />\r
              <em>{{ (coast().noiseAmount * 100).toFixed(0) }}%</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Uferband</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="0.5"\r
                step="0.01"\r
                [value]="coast().shoreWidth"\r
                (input)="setCoast('shoreWidth', +$any($event.target).value)"\r
                (change)="commitCoast()"\r
              />\r
              <em>{{ (coast().shoreWidth * 100).toFixed(0) }}</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Ufer hell</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="0.6"\r
                step="0.02"\r
                [value]="coast().shoreLight"\r
                (input)="setCoast('shoreLight', +$any($event.target).value)"\r
                (change)="commitCoast()"\r
              />\r
              <em>{{ (coast().shoreLight * 100).toFixed(0) }}%</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Schatten</span>\r
              <input\r
                type="range"\r
                min="0"\r
                max="1"\r
                step="0.02"\r
                [value]="coast().shadowStrength"\r
                (input)="setCoast('shadowStrength', +$any($event.target).value)"\r
                (change)="commitCoast()"\r
              />\r
              <em>{{ (coast().shadowStrength * 100).toFixed(0) }}%</em>\r
            </label>\r
\r
            <label class="slider-row">\r
              <span>Sch.-breite</span>\r
              <input\r
                type="range"\r
                min="0.02"\r
                max="0.5"\r
                step="0.01"\r
                [value]="coast().shadowWidth"\r
                (input)="setCoast('shadowWidth', +$any($event.target).value)"\r
                (change)="commitCoast()"\r
              />\r
              <em>{{ (coast().shadowWidth * 100).toFixed(0) }}</em>\r
            </label>\r
\r
            <div class="history-row">\r
              <button type="button" (click)="resetCoast()">Zur\xFCcksetzen</button>\r
            </div>\r
          </div>\r
\r
          @if (paperOptions().length) {\r
            <div class="panel-section">\r
              <div class="panel-title">Papierstruktur</div>\r
              <select\r
                class="paper-select"\r
                [value]="paperTexture()"\r
                (change)="selectPaper($any($event.target).value)"\r
              >\r
                <option value="">Keine</option>\r
                @for (p of paperOptions(); track p.id) {\r
                  <option [value]="p.id">{{ p.name }}</option>\r
                }\r
              </select>\r
\r
              @if (paperTexture()) {\r
                <label class="slider-row">\r
                  <span>St\xE4rke</span>\r
                  <input\r
                    type="range"\r
                    min="0"\r
                    max="1"\r
                    step="0.05"\r
                    [value]="paperOpacity()"\r
                    (input)="setPaperOpacity($any($event.target).value)"\r
                  />\r
                  <em>{{ (paperOpacity() * 100).toFixed(0) }}%</em>\r
                </label>\r
              }\r
            </div>\r
          }\r
        }\r
      </aside>\r
    }\r
  </div>\r
</div>\r
`, styles: ["/* src/app/map-editor/map-editor.component.css */\n.map-editor-page {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  overflow: hidden;\n  background: #16161a;\n  color: #e6e6ea;\n}\n.editor-toolbar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 12px;\n  background: #1f1f25;\n  border-bottom: 1px solid #2e2e37;\n  flex: 0 0 auto;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.editor-toolbar button {\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 4px 10px;\n  font-size: 13px;\n  cursor: pointer;\n}\n.editor-toolbar button:hover:not(:disabled) {\n  background: #343440;\n}\n.editor-toolbar button.active {\n  background: #3d5a80;\n  border-color: #4f7fb0;\n}\n.editor-toolbar button:disabled {\n  opacity: 0.35;\n  cursor: default;\n}\n.world-name {\n  font-weight: 600;\n  font-size: 14px;\n}\n.zoom-readout {\n  min-width: 52px;\n  text-align: center;\n  font-variant-numeric: tabular-nums;\n  font-size: 13px;\n  opacity: 0.85;\n}\n.sep {\n  width: 1px;\n  height: 20px;\n  background: #33333d;\n  margin: 0 4px;\n}\n.spacer {\n  flex: 1;\n}\n.badge {\n  font-size: 11px;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: #2a2a33;\n  border: 1px solid #3a3a46;\n}\n.badge.gm {\n  background: #4a3a6b;\n  border-color: #6b5696;\n}\n.badge.saving {\n  background: #3d5a80;\n  border-color: #4f7fb0;\n}\n.editor-body {\n  display: flex;\n  flex: 1 1 auto;\n  min-height: 0;\n}\n.tool-rail {\n  flex: 0 0 104px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 8px 6px;\n  background: #1c1c22;\n  border-right: 1px solid #2e2e37;\n  overflow-y: auto;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.tab-strip {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n.tab-btn {\n  background: #24242c;\n  color: #d6d6de;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 7px 8px;\n  font-size: 13px;\n  text-align: left;\n  cursor: pointer;\n}\n.tab-btn:hover {\n  background: #303039;\n}\n.tab-btn.active {\n  background: #4a3a6b;\n  border-color: #8a6fc0;\n  color: #fff;\n  font-weight: 600;\n}\n.rail-divider {\n  flex: 0 0 auto;\n  height: 2px;\n  margin: 8px -6px;\n  background: #0f0f13;\n  border-top: 1px solid #2e2e37;\n  border-bottom: 1px solid #26262e;\n}\n.tool-icons {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  align-content: flex-start;\n}\n.rail-btn {\n  width: 40px;\n  height: 40px;\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #2a2a33;\n  border: 1px solid #3a3a46;\n  border-radius: 6px;\n  cursor: pointer;\n  padding: 0;\n}\n.rail-btn img {\n  width: 28px;\n  height: 28px;\n  object-fit: contain;\n  pointer-events: none;\n}\n.rail-btn:hover:not(:disabled) {\n  background: #343440;\n}\n.rail-btn.active {\n  background: #3d5a80;\n  border-color: #6d9fd0;\n}\n.rail-btn:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n.settings-panel {\n  flex: 0 0 300px;\n  overflow-y: auto;\n  background: #1c1c22;\n  border-left: 1px solid #2e2e37;\n  padding: 10px;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.settings-title {\n  font-size: 13px;\n  font-weight: 600;\n  margin-bottom: 10px;\n  padding-bottom: 6px;\n  border-bottom: 1px solid #2e2e37;\n}\n.panel-section {\n  margin-bottom: 16px;\n}\n.panel-title {\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n  opacity: 0.55;\n  margin-bottom: 6px;\n}\n.slider-row {\n  display: grid;\n  grid-template-columns: 58px 1fr 44px;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  margin-bottom: 6px;\n}\n.slider-row input {\n  width: 100%;\n}\n.slider-row em {\n  font-style: normal;\n  opacity: 0.7;\n  text-align: right;\n  font-variant-numeric: tabular-nums;\n}\n.check-row {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  margin-top: 6px;\n  cursor: pointer;\n}\n.hint {\n  font-size: 11px;\n  opacity: 0.45;\n  margin: 6px 0 0;\n  line-height: 1.4;\n}\n.asset-error {\n  margin: 0 0 12px;\n  padding: 7px 8px;\n  border-radius: 5px;\n  background: #4a2a2a;\n  border: 1px solid #7a4444;\n  font-size: 11px;\n  line-height: 1.4;\n}\n.base-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  font-size: 12px;\n}\n.base-row input[type=color] {\n  width: 42px;\n  height: 24px;\n  padding: 0;\n  border: 1px solid #3a3a46;\n  border-radius: 4px;\n  background: none;\n  cursor: pointer;\n}\n.swatches {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 5px;\n}\n.swatch-wrap {\n  position: relative;\n  display: inline-flex;\n}\n.hidden-color {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  inset: 0;\n  opacity: 0;\n  pointer-events: none;\n  border: 0;\n  padding: 0;\n}\n.swatch {\n  width: 26px;\n  height: 26px;\n  border-radius: 5px;\n  border: 2px solid #3a3a46;\n  cursor: pointer;\n  padding: 0;\n}\n.swatch.active {\n  border-color: #ffffff;\n  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);\n}\n.swatch.add {\n  position: relative;\n  background: #2a2a33;\n  color: #9a9aa8;\n  font-size: 15px;\n  line-height: 1;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n.swatch.add .hidden-color {\n  pointer-events: auto;\n  cursor: pointer;\n}\n.sprite-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));\n  gap: 4px;\n  max-height: 52vh;\n  overflow-y: auto;\n  padding-right: 2px;\n}\n.sprite-cell {\n  width: 48px;\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #24242c;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  cursor: pointer;\n  padding: 0;\n  overflow: hidden;\n}\n.sprite-cell:hover {\n  background: #343440;\n}\n.sprite-cell.active {\n  border-color: #6d9fd0;\n  background: #3d5a80;\n}\n.sprite-thumb {\n  display: block;\n}\n.history-row {\n  display: flex;\n  gap: 5px;\n  margin-bottom: 5px;\n}\n.history-row button {\n  flex: 1;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px 4px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.history-row button:hover {\n  background: #343440;\n}\n.profile-row {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n.profile-btn {\n  flex: 1 1 auto;\n  min-width: 56px;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px 6px;\n  font-size: 12px;\n  cursor: pointer;\n}\n.profile-btn:hover {\n  background: #343440;\n}\n.profile-btn.active {\n  background: #3d5a80;\n  border-color: #6d9fd0;\n}\n.search-input {\n  width: 100%;\n  margin-bottom: 6px;\n}\n.preset-current {\n  text-transform: none;\n  letter-spacing: 0;\n  opacity: 0.9;\n  color: #8fd0ff;\n}\n.history-row button.active-preset {\n  background: #3d5a80;\n  border-color: #6d9fd0;\n}\n.text-input {\n  flex: 1;\n  min-width: 0;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px 7px;\n  font-size: 12px;\n}\n.history-row button.narrow {\n  flex: 0 0 30px;\n}\n.paper-select {\n  width: 100%;\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 5px;\n  padding: 5px;\n  font-size: 12px;\n  margin-bottom: 6px;\n}\n.viewer-wrap {\n  position: relative;\n  flex: 1 1 auto;\n  min-width: 0;\n}\n.pixi-host {\n  position: absolute;\n  inset: 0;\n  touch-action: none;\n  cursor: default;\n}\n.pixi-host.brush-cursor,\n.pixi-host.place-cursor {\n  cursor: none;\n}\n.pixi-host canvas {\n  display: block;\n}\n.marquee {\n  position: absolute;\n  border: 1px solid #8fd0ff;\n  background: rgba(143, 208, 255, 0.14);\n  pointer-events: none;\n}\n.loading-overlay {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(22, 22, 26, 0.85);\n  font-size: 14px;\n  pointer-events: none;\n}\n.loading-overlay.context-lost {\n  background: rgba(60, 22, 22, 0.92);\n  text-align: center;\n  line-height: 1.5;\n  pointer-events: auto;\n}\n.status-bar {\n  position: absolute;\n  left: 10px;\n  bottom: 10px;\n  display: flex;\n  gap: 14px;\n  padding: 4px 10px;\n  border-radius: 6px;\n  background: rgba(20, 20, 24, 0.72);\n  border: 1px solid #2e2e37;\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  opacity: 0.9;\n  pointer-events: none;\n}\n.diag-panel {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  width: 430px;\n  max-height: 72vh;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  padding: 8px;\n  border-radius: 6px;\n  background: rgba(14, 14, 18, 0.92);\n  border: 1px solid #3a3a46;\n  font-size: 11px;\n  font-family: monospace;\n  pointer-events: none;\n}\n.diag-head {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  pointer-events: auto;\n}\n.diag-head strong {\n  flex: 1;\n  font-family: inherit;\n}\n.diag-head button {\n  background: #2a2a33;\n  color: #e6e6ea;\n  border: 1px solid #3a3a46;\n  border-radius: 4px;\n  padding: 2px 7px;\n  font-size: 11px;\n  cursor: pointer;\n}\n.diag-stats {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1px 10px;\n}\n.diag-stat {\n  display: flex;\n  justify-content: space-between;\n  gap: 6px;\n}\n.diag-stat em {\n  font-style: normal;\n  opacity: 0.5;\n}\n.diag-events {\n  flex: 1;\n  min-height: 0;\n  overflow-y: auto;\n  border-top: 1px solid #2e2e37;\n  padding-top: 4px;\n  pointer-events: auto;\n}\n.diag-event {\n  display: grid;\n  grid-template-columns: 46px 96px 1fr;\n  gap: 6px;\n  opacity: 0.85;\n  white-space: nowrap;\n}\n.diag-event.warn {\n  color: #ff8f8f;\n  opacity: 1;\n}\n.diag-t {\n  text-align: right;\n  opacity: 0.45;\n}\n.diag-kind {\n  color: #8fd0ff;\n}\n.diag-detail {\n  opacity: 0.55;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.status-tier.coarse {\n  color: #ffc46b;\n}\n/*# sourceMappingURL=map-editor.component.css.map */\n"] }]
  }], null, { pixiHost: [{
    type: ViewChild,
    args: ["pixiHost"]
  }] });
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(MapEditorComponent, { className: "MapEditorComponent", filePath: "app/map-editor/map-editor.component.ts", lineNumber: 71 });
})();
function rgbToHex(r, g, b) {
  const h = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
export {
  MapEditorComponent
};
//# sourceMappingURL=chunk-QCYA6C56.js.map
