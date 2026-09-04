/**
 * Terrain compositing — one quad per chunk cell, shaded from the three raster layers across
 * the three detail tiers.
 *
 * Land colour cannot simply be stacked over the height field: the coastline is a *threshold*
 * on height, and both colour layers have to be resolved against it in one pass. So instead
 * of stacked sprite layers, each visible chunk cell gets a single mesh whose shader samples
 * height, land colour and water colour together and decides the final pixel.
 *
 * Each of those three layers is itself the alpha-over composite of the tiers, coarse under
 * fine. That is the whole read side of the authored-tier design: a fine stroke has already
 * written its blurred coarse version, so a coarse tier *is* the work rather than a stand-in
 * for it, and zooming out needs no finer chunks at all. Where a finer tier has nothing —
 * because it was never drawn, or is not resident, or is not sampled at this zoom — the
 * coarser one shows through, so there is no state where a cell has nothing to draw.
 *
 * Phase 1 keeps the coastline to a tunable smoothstep band — clean anti-aliased edges, as
 * agreed. Phase 5 replaces `coastline()` below with the noise-warped domain distortion that
 * produces Wonderdraft's drippy look; nothing outside that function needs to change.
 */

import {
  Container,
  Geometry,
  GlProgram,
  Graphics,
  Mesh,
  Shader,
  Text,
  Texture,
  UniformData,
  UniformGroup,
} from 'pixi.js';
import {
  ChunkCoord,
  DetailTier,
  RASTER_LAYERS,
  RasterLayer,
  TIERS,
  TIER_WORLD_SIZE,
  coarserTiers,
} from './map-editor.model';
import { Bounds } from './map-camera';
import { ChunkManager } from './chunk-manager';
import { mapDiag, tileLabel } from './map-diagnostics';

const vertex = /* glsl */ `
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
`;

const fragment = /* glsl */ `
in vec2 vUV;
out vec4 finalColor;

/*
 * Three tiers × three layers.
 *
 * A tier this cell does not sample — one finer than the cell's own — is bound to a 1×1
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
 * A coarser chunk covers 8× or 64× this cell's span, so the cell reads a sub-rect of it.
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

/*
 * Inspector mode: 0 = the map, 1 = all rasters, 2 = height, 3 = land colour, 4 = water colour.
 *
 * The map view gates colour behind height - land colour only appears where the height field
 * says land. That is right for a map and wrong for an inspector: a tier holding plenty of
 * colour but no height rendered as open sea, so content that was plainly there could not be
 * found by isolating any tier. In inspect mode nothing is gated: each raster is drawn as what
 * it stores, over a checker that means "this tier holds nothing here".
 */
uniform float uInspect;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

/** Value noise with a smooth (cubic) interpolant — cheap and adequate for a coastline. */
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
 * "Over": the top layer composited onto the one under it, in premultiplied space.
 *
 * Alpha is coverage on every layer — and on the height layer it is the terrain height
 * itself — so one operator serves all three.
 *
 * The chunks are premultiplied, and this used to assume they were not. Pixi renders into a
 * RenderTexture with normal = [ONE, ONE_MINUS_SRC_ALPHA], which is the premultiplied
 * operator, so a texel's stored RGB is already colour x coverage. Weighting it by top.a a
 * second time darkened everything with partial coverage - that is, exactly the feathered edge
 * of every soft brush stroke, which came out as a dark band instead of a blend, on land and
 * water alike.
 *
 * In premultiplied space the operator is also simply cheaper: no divide, and no guard for
 * the fully-transparent case.
 */
vec4 over(vec4 under, vec4 top) {
    return vec4(top.rgb + under.rgb * (1.0 - top.a),
                top.a   + under.a   * (1.0 - top.a));
}

/** "Nothing stored here", as a checker - distinct from any colour a raster can hold. */
vec3 emptyChecker() {
    vec2 c = floor(vUV * 16.0);
    float m = mod(c.x + c.y, 2.0);
    return mix(vec3(0.13, 0.13, 0.16), vec3(0.18, 0.18, 0.22), m);
}

/**
 * Draw one raster as what it actually stores.
 *
 * Every layer is premultiplied, so compositing over the checker is an add, and a texel with
 * no coverage leaves the checker showing through untouched.
 */
vec3 inspect(vec4 hc, vec4 lc, vec4 wc) {
    vec3 bg = emptyChecker();

    if (uInspect < 1.5) {
        // Everything at once, colour last because that is usually what is being hunted.
        vec3 col = mix(bg, vec3(0.30 + hc.a * 0.55), hc.a);
        col = wc.rgb + col * (1.0 - wc.a);
        return lc.rgb + col * (1.0 - lc.a);
    }
    /*
     * Height carries three states, so the inspector shows three things: the checker where the
     * tier holds no opinion, blue where it authored water, pale where it authored land. A
     * single ramp off alpha would draw drawn-water and solid-land identically.
     */
    if (uInspect < 2.5) {
        float landness = hc.a > 0.0 ? hc.r / hc.a : 0.0;
        vec3 tone = mix(vec3(0.20, 0.42, 0.68), vec3(0.94, 0.94, 0.90), landness);
        return mix(bg, tone, hc.a);
    }
    if (uInspect < 3.5) return lc.rgb + bg * (1.0 - lc.a);
    return wc.rgb + bg * (1.0 - wc.a);
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
 * Because h has a gradient near the shore, shifting the threshold displaces the edge — the
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

    // Coarse under, fine on top — the read rule of the authored tiers. This runs *before*
    // the coastline logic, so everything below sees one resolved height and colour.
    vec4 hc = over(over(texture(uHeightLow, uvLow), texture(uHeightMed, uvMed)),
                   texture(uHeightHigh, uvHigh));
    vec4 lc = over(over(texture(uLandLow, uvLow), texture(uLandMed, uvMed)),
                   texture(uLandHigh, uvHigh));
    vec4 wc = over(over(texture(uWaterLow, uvLow), texture(uWaterMed, uvMed)),
                   texture(uWaterHigh, uvHigh));

    if (uInspect > 0.5) {
        finalColor = vec4(inspect(hc, lc, wc), 1.0);
        return;
    }

    /*
     * Land-ness lives in red; alpha only says whether this tier has an opinion at all.
     *
     * Three states, not two: alpha 0 is background water (nothing authored), red near alpha is
     * land, red near 0 with alpha up is water somebody drew. Reading alpha as the height — as
     * this did - made water the mere absence of land, and the over operator treats absence as
     * "no opinion", so a finer tier could never carve a channel through a coarser one's land.
     *
     * Every stored height chunk was written white, so red == alpha throughout the existing
     * data and this reads exactly as it always did.
     */
    float h = hc.r;

    // Colour is baked when terrain is drawn, so these fallbacks are constants rather than
    // adjustable "theme" colours: changing a global default would retroactively repaint
    // ground the user already coloured deliberately. Land falls back to parchment — a
    // freshly drawn landmass is blank paper to be coloured, not a preset green.
    // Premultiplied source, so the composite over the base colour is an add, not a mix:
    // lc.rgb already carries colour x coverage. mix() here treated it as a straight colour
    // and dimmed the result everywhere coverage was partial.
    vec3 land  = uLandDefault  * (1.0 - lc.a) + lc.rgb;
    vec3 water = uWaterDefault * (1.0 - wc.a) + wc.rgb;

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
`;

/**
 * Coastline appearance.
 *
 * These are taste settings, not derived constants — the point of exposing them is that the
 * Wonderdraft look is reached by dialling, not by computing.
 */
export interface CoastSettings {
  /** World px per noise cell. Small = fine crenulation, large = big sweeping bays. */
  noiseScale: number;
  /** How far the coastline wanders from the painted edge. 0 = clean outline. */
  noiseAmount: number;
  /** Width of the lightened band just inland. */
  shoreWidth: number;
  shoreLight: number;
  /** Width and strength of the shadow land casts onto adjacent water. */
  shadowWidth: number;
  shadowStrength: number;
}

export function defaultCoast(): CoastSettings {
  return {
    noiseScale: 1600,
    noiseAmount: 0.35,
    shoreWidth: 0.12,
    shoreLight: 0.18,
    shadowWidth: 0.22,
    shadowStrength: 0.35,
  };
}

/**
 * Ceiling on terrain meshes at any tier.
 *
 * With an automatic tier this is a safety net: the tier is chosen so a screenful is always
 * roughly the same number of chunks, whatever the zoom.
 *
 * With a *pinned* tier it is the working limit, and it has to stay under the chunk manager's
 * `MAX_RESIDENT_CELLS`. A pin is now honoured at any zoom — showing fewer chunks of the tier
 * you asked for beats silently showing a different tier — so nothing else bounds how many
 * cells a zoomed-out pin would ask for. Above the residency budget every cell is marked
 * visible in the same frame, so none is evictable, and VRAM climbs until the context is lost.
 */
export const MAX_TERRAIN_CELLS = 100;

/** Program is compiled once and shared; only the per-cell resources differ. */
let sharedProgram: GlProgram | null = null;
function program(): GlProgram {
  sharedProgram ??= GlProgram.from({ vertex, fragment, name: 'map-terrain' });
  return sharedProgram;
}

/**
 * A 1×1 fully transparent texture, for tiers a cell does not sample.
 *
 * Every sampler must be bound to something, and this contributes nothing under `over()` —
 * which is what lets the shader treat "three tiers" as unconditional.
 */
let sharedEmpty: Texture | null = null;
function emptyTexture(): Texture {
  if (!sharedEmpty) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    // A fresh 2D canvas is transparent black, which is exactly the identity for `over`.
    canvas.getContext('2d');
    sharedEmpty = Texture.from(canvas);
  }
  return sharedEmpty;
}

/** Unit quad; the mesh's own transform scales and positions it into world space. */
function quad(): Geometry {
  return new Geometry({
    attributes: {
      aPosition: [0, 0, 1, 0, 1, 1, 0, 1],
      aUV: [0, 0, 1, 0, 1, 1, 0, 1],
    },
    indexBuffer: [0, 1, 2, 0, 2, 3],
  });
}

/** Mesh carrying our own geometry and shader rather than Pixi's textured-mesh defaults. */
type TerrainMesh = Mesh<Geometry, Shader>;

/** Sampler name suffix per layer, matching the uniforms above. */
const LAYER_UNIFORM: Record<RasterLayer, string> = {
  height: 'uHeight',
  landColor: 'uLand',
  waterColor: 'uWater',
};

/** Uniform name suffix per tier. */
const TIER_UNIFORM: Record<DetailTier, string> = {
  high: 'High',
  med: 'Med',
  low: 'Low',
};

interface Cell {
  cx: number;
  cy: number;
  /** Tier this cell represents on the map; also the finest tier it samples. */
  tier: DetailTier;
  /**
   * Chunk this cell reads from, per sampled tier.
   *
   * Kept so an eviction anywhere in the stack can be matched back to the cells that were
   * drawing from it — a coarse chunk is shared by many cells, and a shader left pointing at
   * a freed texture crashes the renderer rather than merely looking wrong.
   */
  refs: Partial<Record<DetailTier, ChunkCoord>>;
  mesh: TerrainMesh;
  uniforms: UniformGroup;
  /** Texture identity last bound per tier, so eviction and refetches can be detected. */
  bound: Partial<Record<DetailTier, Texture>>;
}

export class TerrainView {
  /** Parent this in the camera-transformed world container. */
  readonly container = new Container();
  /** Debug overlay: cell bounds and which tier each one is drawing at. */
  private debugLayer = new Container();
  private debugGraphics = new Graphics();
  private debugLabels: Text[] = [];
  debug = false;

  private cells = new Map<string, Cell>();
  private geometry = quad();

  /**
   * Colour of land nothing has painted yet — `settings.landBase`, parchment by default.
   *
   * Only ever visible where colour coverage is zero, so changing it cannot disturb ground
   * that was coloured on purpose. That is what makes it safe as a *setting* rather than
   * something that has to be painted, and painting it is what used to bury base colour in a
   * detail tier where a coarser edit could no longer reach it.
   */
  private landDefault: [number, number, number] = [0.894, 0.835, 0.718];
  /** Open sea still needs *a* colour — it is the canvas nothing has been drawn on yet. */
  private waterDefault: [number, number, number] = [0.25, 0.43, 0.55];
  private paper: Texture = Texture.WHITE;
  private paperOpacity = 0;
  private paperScale = 1024;
  private edge = 0.08;
  /** Draw only the viewing tier, not the composite. See `setIsolate`. */
  private isolate = false;
  /** Inspector raster: 0 map, 1 all, 2 height, 3 land colour, 4 water colour. */
  private inspect = 0;

  /** Coastline character. Defaults are a starting point; the Karte tab tunes them. */
  private coast: CoastSettings = defaultCoast();

  constructor(private chunks: ChunkManager) {
    this.debugLayer.addChild(this.debugGraphics);
    this.container.addChild(this.debugLayer);
    this.debugLayer.visible = false;

    /*
     * A refetched or restored chunk keeps its RenderTexture identity, so the mesh already
     * points at the right pixels — but an evicted one does not.
     *
     * The tier is part of the identity: `cx,cy` names a different patch of world at every
     * tier, so ignoring it meant evicting one chunk deleted an unrelated cell somewhere else
     * on the map, which then rebuilt on the next frame — terrain blinking out and back while
     * drawing, nowhere near whatever was actually evicted.
     */
    this.chunks.onChunkDisposed = (_layer, tier, cx, cy) => this.dropReferencing(tier, cx, cy);
  }

  // ── appearance ──

  setLandDefault(rgb: [number, number, number]): void {
    this.landDefault = rgb;
    this.refreshUniforms();
  }

  setWaterDefault(rgb: [number, number, number]): void {
    this.waterDefault = rgb;
    this.refreshUniforms();
  }

  setPaper(texture: Texture | null, opacity: number, scale: number): void {
    this.paper = texture ?? Texture.WHITE;
    this.paperOpacity = texture ? opacity : 0;
    this.paperScale = Math.max(1, scale);
    // The sampler is a resource rather than a uniform, so cells must be rebuilt.
    for (const key of [...this.cells.keys()]) {
      const c = this.cells.get(key)!;
      this.destroyCell(c);
      this.cells.delete(key);
    }
  }

  setEdgeSoftness(edge: number): void {
    this.edge = Math.max(0.001, edge);
    this.refreshUniforms();
  }

  /**
   * Show one tier alone instead of the coarse-under-fine composite.
   *
   * The normal view answers "what does the map look like", which is the wrong question while
   * hand-editing tiers: content can sit in a tier and be permanently invisible under a finer
   * one, and there is otherwise no way to see that from inside the editor. Isolating answers
   * "what is actually stored here" — a tier with nothing in it reads as open sea, which is
   * the truth about that tier even where the map plainly has land.
   *
   * Which tiers a cell samples is baked into its shader's resources, so every cell has to be
   * rebuilt — same as a paper-texture change.
   */
  setIsolate(isolate: boolean): void {
    if (this.isolate === isolate) return;
    this.isolate = isolate;
    for (const key of [...this.cells.keys()]) {
      const c = this.cells.get(key)!;
      this.destroyCell(c);
      this.cells.delete(key);
    }
  }

  get isolating(): boolean {
    return this.isolate;
  }

  /**
   * Choose what the inspector draws, or 0 to render the map normally.
   *
   * A plain uniform, so this costs a frame rather than a rebuild of every cell — unlike
   * `setIsolate`, which changes which textures a cell is bound to.
   */
  setInspect(mode: number): void {
    if (this.inspect === mode) return;
    this.inspect = mode;
    this.refreshUniforms();
  }

  setCoast(coast: Partial<CoastSettings>): void {
    this.coast = { ...this.coast, ...coast };
    this.refreshUniforms();
  }

  get coastSettings(): CoastSettings {
    return { ...this.coast };
  }

  private refreshUniforms(): void {
    for (const cell of this.cells.values()) {
      const u = cell.uniforms.uniforms;
      u['uLandDefault'] = this.landDefault;
      u['uWaterDefault'] = this.waterDefault;
      u['uInspect'] = this.inspect;
      u['uEdge'] = this.edge;
      u['uPaperOpacity'] = this.paperOpacity;
      u['uPaperScale'] = this.paperScale;
      u['uNoiseScale'] = this.coast.noiseScale;
      u['uNoiseAmount'] = this.coast.noiseAmount;
      u['uShoreWidth'] = this.coast.shoreWidth;
      u['uShoreLight'] = this.coast.shoreLight;
      u['uShadowWidth'] = this.coast.shadowWidth;
      u['uShadowStrength'] = this.coast.shadowStrength;
    }
  }

  // ── cells ──

  private key(tier: DetailTier, cx: number, cy: number): string {
    return `${tier}/${cx}/${cy}`;
  }

  /** Chunk of `tier` containing this cell, and where the cell sits inside its texture. */
  private placement(
    cx: number,
    cy: number,
    tier: DetailTier,
    source: DetailTier,
  ): { ref: ChunkCoord; uv: [number, number, number] } {
    const span = TIER_WORLD_SIZE[tier];
    const srcSpan = TIER_WORLD_SIZE[source];
    // Floor division, so a cell left of the origin lands in chunk -1 rather than sampling
    // its neighbour's pixels.
    const ref = {
      cx: Math.floor((cx * span) / srcSpan),
      cy: Math.floor((cy * span) / srcSpan),
    };
    return {
      ref,
      uv: [
        (cx * span - ref.cx * srcSpan) / srcSpan,
        (cy * span - ref.cy * srcSpan) / srcSpan,
        span / srcSpan,
      ],
    };
  }

  private build(cx: number, cy: number, tier: DetailTier): Cell {
    const span = TIER_WORLD_SIZE[tier];
    // Isolating drops the coarser tiers from the composite, so what shows is exactly what
    // this tier stores — including, importantly, nothing where it stores nothing.
    const sampled = this.isolate ? [tier] : [tier, ...coarserTiers(tier)];

    const uniformValues: Record<string, UniformData> = {
      uLandDefault: { value: this.landDefault, type: 'vec3<f32>' },
      uWaterDefault: { value: this.waterDefault, type: 'vec3<f32>' },
      uEdge: { value: this.edge, type: 'f32' },
      uPaperOpacity: { value: this.paperOpacity, type: 'f32' },
      uPaperScale: { value: this.paperScale, type: 'f32' },
      uChunkOrigin: { value: [cx * span, cy * span], type: 'vec2<f32>' },
      uTileSpan: { value: span, type: 'f32' },
      uNoiseScale: { value: this.coast.noiseScale, type: 'f32' },
      uNoiseAmount: { value: this.coast.noiseAmount, type: 'f32' },
      uShoreWidth: { value: this.coast.shoreWidth, type: 'f32' },
      uShoreLight: { value: this.coast.shoreLight, type: 'f32' },
      uShadowWidth: { value: this.coast.shadowWidth, type: 'f32' },
      uShadowStrength: { value: this.coast.shadowStrength, type: 'f32' },
      uInspect: { value: this.inspect, type: 'f32' },
    };

    const resources: Record<string, unknown> = {
      uPaper: this.paper.source,
      uPaperSampler: this.paper.source.style,
    };

    const refs: Partial<Record<DetailTier, ChunkCoord>> = {};
    const bound: Partial<Record<DetailTier, Texture>> = {};

    for (const source of TIERS) {
      const suffix = TIER_UNIFORM[source];

      if (!sampled.includes(source)) {
        // Finer than this cell — nothing to read, and nothing that needs reading: the stroke
        // that made it also wrote this cell's own tier.
        uniformValues[`uUV${suffix}`] = { value: [0, 0, 1], type: 'vec3<f32>' };
        for (const layer of RASTER_LAYERS) {
          const empty = emptyTexture();
          resources[`${LAYER_UNIFORM[layer]}${suffix}`] = empty.source;
          resources[`${LAYER_UNIFORM[layer]}${suffix}Sampler`] = empty.source.style;
        }
        continue;
      }

      const { ref, uv } = this.placement(cx, cy, tier, source);
      uniformValues[`uUV${suffix}`] = { value: uv, type: 'vec3<f32>' };
      refs[source] = ref;

      for (const layer of RASTER_LAYERS) {
        const texture = this.chunks.get(layer, source, ref.cx, ref.cy).texture;
        resources[`${LAYER_UNIFORM[layer]}${suffix}`] = texture.source;
        resources[`${LAYER_UNIFORM[layer]}${suffix}Sampler`] = texture.source.style;
        // Height stands for the cell: eviction frees all three layers of a position together.
        if (layer === 'height') bound[source] = texture;
      }
    }

    const uniforms = new UniformGroup(uniformValues);
    resources['terrainUniforms'] = uniforms;

    const shader = new Shader({ glProgram: program(), resources });

    const mesh: TerrainMesh = new Mesh<Geometry, Shader>({ geometry: this.geometry, shader });
    mesh.position.set(cx * span, cy * span);
    mesh.scale.set(span);

    const cell: Cell = { cx, cy, tier, refs, mesh, uniforms, bound };

    this.container.addChild(mesh);
    this.cells.set(this.key(tier, cx, cy), cell);

    mapDiag.log('cell:build', tileLabel('terrain', tier, cx, cy));
    return cell;
  }

  private destroyCell(cell: Cell): void {
    this.container.removeChild(cell.mesh);

    /*
     * `Mesh.destroy` only nulls its shader reference — it does not free it. Every cell owns
     * a Shader (with its own uniform group and bind groups), and cells are created and torn
     * down constantly while panning, so leaving them to the collector leaked GL resources by
     * the hundred and eventually produced garbage geometry on screen.
     *
     * `false` keeps the GlProgram: that one *is* shared across every cell.
     */
    const shader = cell.mesh.shader;
    // The geometry is shared across every cell, so it must outlive them.
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
  private dropReferencing(tier: DetailTier, cx: number, cy: number): void {
    for (const [key, cell] of [...this.cells]) {
      const ref = cell.refs[tier];
      if (!ref || ref.cx !== cx || ref.cy !== cy) continue;
      mapDiag.log('cell:drop', tileLabel('terrain', cell.tier, cell.cx, cell.cy));
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
  update(view: Bounds, tier: DetailTier = 'high', zoom = 1): void {
    const span = TIER_WORLD_SIZE[tier];
    const lead = span * 0.5;
    const cap = MAX_TERRAIN_CELLS;

    let minCx = Math.floor((view.minX - lead) / span);
    let maxCx = Math.floor((view.maxX + lead) / span);
    let minCy = Math.floor((view.minY - lead) / span);
    let maxCy = Math.floor((view.maxY + lead) / span);

    /*
     * Clamp the *range* before enumerating it, not just the list afterwards.
     *
     * A pinned tier is honoured at any zoom, so `high` pinned while zoomed out to the whole
     * world spans millions of cell positions. Listing them all to sort and then keep a hundred
     * would allocate and sort that whole array every frame — the enumeration itself becomes
     * the stall. Only a window around the view centre can survive the cap anyway, so that is
     * all that is walked.
     */
    if ((maxCx - minCx + 1) * (maxCy - minCy + 1) > cap) {
      const half = Math.ceil(Math.sqrt(cap));
      const midCx = Math.floor((view.minX + view.maxX) / 2 / span);
      const midCy = Math.floor((view.minY + view.maxY) / 2 / span);
      minCx = Math.max(minCx, midCx - half);
      maxCx = Math.min(maxCx, midCx + half);
      minCy = Math.max(minCy, midCy - half);
      maxCy = Math.min(maxCy, midCy + half);
    }

    const spanX = maxCx - minCx + 1;
    const spanY = maxCy - minCy + 1;

    let wanted: { cx: number; cy: number }[] = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) wanted.push({ cx, cy });
    }

    if (spanX * spanY > cap) {
      const midX = (minCx + maxCx) / 2;
      const midY = (minCy + maxCy) / 2;
      wanted.sort(
        (a, b) =>
          (a.cx - midX) ** 2 + (a.cy - midY) ** 2 - ((b.cx - midX) ** 2 + (b.cy - midY) ** 2),
      );
      wanted = wanted.slice(0, cap);
    }

    const live = new Set<string>();

    for (const { cx, cy } of wanted) {
      /*
       * Skip ground nothing has ever been drawn on.
       *
       * Over open sea — most of a map — a cell would composite three transparent tiers into
       * the ocean colour the backdrop already shows, so building a mesh and shader for it is
       * pure cost. Anything painted at *any* sampled tier, including a stroke that has not
       * been uploaded yet, counts as content.
       */
      if (!this.chunks.hasContentUnder(tier, cx, cy, this.isolate)) continue;

      const key = this.key(tier, cx, cy);
      live.add(key);

      const cell = this.cells.get(key);
      if (!cell) {
        this.build(cx, cy, tier);
        continue;
      }

      /*
       * Rebuild when eviction handed back a different RenderTexture at any sampled tier —
       * the shader would otherwise be pointing at freed pixels.
       *
       * `get` is what marks these chunks as still in use, so this doubles as the thing that
       * keeps a cell's coarse tiers from being evicted out from under it.
       */
      let stale = false;
      for (const [source, ref] of Object.entries(cell.refs) as [DetailTier, ChunkCoord][]) {
        const texture = this.chunks.get('height', source, ref.cx, ref.cy).texture;
        if (cell.bound[source] !== texture) stale = true;
      }
      if (stale) {
        this.destroyCell(cell);
        this.cells.delete(key);
        this.build(cx, cy, tier);
      }
    }

    /*
     * Retire anything no longer wanted.
     *
     * No special case for a tier change: the coarse tiers are composited into every cell, so
     * an incoming tier always has something to draw, and holding the outgoing one back would
     * just stack two meshes over the same ground.
     */
    for (const [key, cell] of [...this.cells]) {
      if (live.has(key)) continue;
      this.destroyCell(cell);
      this.cells.delete(key);
    }

    if (this.debug) this.drawDebug(zoom);
  }

  /**
   * Outline every live cell and label the tier it is drawing at.
   *
   * Seeing the active tier directly is the difference between "a square looked wrong" and
   * "that stroke went into `med` while the view is on `high`" — the second is a bug report,
   * the first is a guess.
   */
  private drawDebug(zoom: number): void {
    const g = this.debugGraphics;
    g.clear();

    let i = 0;
    for (const cell of this.cells.values()) {
      const span = TIER_WORLD_SIZE[cell.tier];
      const x = cell.cx * span;
      const y = cell.cy * span;

      g.rect(x, y, span, span);
      g.stroke({ width: 2 / zoom, color: 0x40d060, alpha: 0.9 });

      const label = this.debugLabels[i] ?? this.makeLabel();
      this.debugLabels[i] = label;
      label.text = `${cell.tier}  ${cell.cx},${cell.cy}`;
      label.style.fill = '#40d060';
      label.position.set(x + 8 / zoom, y + 8 / zoom);
      // Text is authored at a fixed size, so undo the camera to keep it readable.
      label.scale.set(1 / zoom);
      label.visible = true;
      i++;
    }

    for (let k = i; k < this.debugLabels.length; k++) this.debugLabels[k].visible = false;
  }

  private makeLabel(): Text {
    const t = new Text({ text: '', style: { fontFamily: 'monospace', fontSize: 16, fill: '#fff' } });
    this.debugLayer.addChild(t);
    return t;
  }

  setDebug(on: boolean): void {
    this.debug = on;
    this.debugLayer.visible = on;
    if (!on) {
      this.debugGraphics.clear();
      for (const l of this.debugLabels) l.visible = false;
    }
  }

  destroy(): void {
    for (const cell of this.cells.values()) this.destroyCell(cell);
    this.cells.clear();

    for (const l of this.debugLabels) l.destroy();
    this.debugLabels = [];
    this.geometry.destroy();
    this.container.destroy();
  }
}

/** '#rrggbb' → normalised RGB, for shader uniforms. */
export function hexToRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const n = Number.parseInt((hex || '').replace('#', ''), 16);
  if (Number.isNaN(n)) return fallback;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
