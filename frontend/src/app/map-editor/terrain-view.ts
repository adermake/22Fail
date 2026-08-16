/**
 * Terrain compositing — one quad per chunk cell, shaded from the three raster layers.
 *
 * Land colour cannot simply be stacked over the height field: the coastline is a *threshold*
 * on height, and both colour layers have to be resolved against it in one pass. So instead
 * of three stacked sprite layers, each visible chunk cell gets a single mesh whose shader
 * samples height, land colour and water colour together and decides the final pixel.
 *
 * Phase 1 keeps the coastline to a tunable smoothstep band — clean anti-aliased edges, as
 * agreed. Phase 5 replaces `coastline()` below with the noise-warped domain distortion that
 * produces Wonderdraft's drippy look; nothing outside that function needs to change.
 */

import { Container, Geometry, GlProgram, Mesh, Shader, Texture, UniformGroup } from 'pixi.js';
import { RasterLayer, tileWorldSize } from './map-editor.model';
import { Bounds } from './map-camera';
import { ChunkManager } from './chunk-manager';

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

uniform sampler2D uHeight;
uniform sampler2D uLandColor;
uniform sampler2D uWaterColor;
uniform sampler2D uPaper;

uniform vec3 uLandDefault;
uniform vec3 uWaterDefault;
uniform float uEdge;          // half-width of the coastline band, in height units
uniform float uPaperOpacity;
uniform float uPaperScale;    // world px covered by one paper tile
uniform vec2 uChunkOrigin;    // world position of this tile's top-left corner
uniform float uTileSpan;      // world px this tile covers; varies by pyramid level

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

/**
 * Land/water mix.
 *
 * The drippy Wonderdraft edge comes from perturbing the *threshold* with world-space noise
 * rather than warping the sample position. Warping the lookup would push reads outside the
 * chunk's own texture near its borders, where clamping would straighten the coast into a
 * visible seam every 2048px. Evaluating the noise in world space instead is continuous
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
    float h = texture(uHeight, vUV).a;

    vec4 lc = texture(uLandColor, vUV);
    vec4 wc = texture(uWaterColor, vUV);

    // Colour is baked when terrain is drawn, so these fallbacks are constants rather than
    // adjustable "theme" colours: changing a global default would retroactively repaint
    // ground the user already coloured deliberately. Land falls back to white — a freshly
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
 * Ceiling on terrain meshes at any level.
 *
 * With the pyramid this is a safety net rather than a working limit: the level is chosen so
 * a screenful is always roughly the same number of tiles, whatever the zoom. Previously this
 * was the thing that cut the map off at the edges, because tile count grew as zoom⁻².
 */
const MAX_TERRAIN_CELLS = 160;



/** Program is compiled once and shared; only the per-cell resources differ. */
let sharedProgram: GlProgram | null = null;
function program(): GlProgram {
  sharedProgram ??= GlProgram.from({ vertex, fragment, name: 'map-terrain' });
  return sharedProgram;
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

interface Cell {
  cx: number;
  cy: number;
  /** Pyramid level the mesh was built at; a level change rebuilds it. */
  level: number;
  mesh: TerrainMesh;
  uniforms: UniformGroup;
  /** Texture identity last bound, so eviction and refetches can be detected. */
  bound: Record<RasterLayer, Texture | null>;
}

export class TerrainView {
  /** Parent this in the camera-transformed world container. */
  readonly container = new Container();
  private cells = new Map<string, Cell>();
  private geometry = quad();

  /** Freshly drawn land is white; the land brush bakes real colour as it paints. */
  private landDefault: [number, number, number] = [1, 1, 1];
  /** Open sea still needs *a* colour — it is the canvas nothing has been drawn on yet. */
  private waterDefault: [number, number, number] = [0.25, 0.43, 0.55];
  private paper: Texture = Texture.WHITE;
  private paperOpacity = 0;
  private paperScale = 1024;
  private edge = 0.08;

  /** Coastline character. Defaults are a starting point; the Karte tab tunes them. */
  private coast: CoastSettings = defaultCoast();

  constructor(private chunks: ChunkManager) {
    // A refetched or restored chunk keeps its RenderTexture identity, so the mesh already
    // points at the right pixels — but an evicted one does not, hence the drop below.
    this.chunks.onChunkDisposed = (_layer, cx, cy) => this.drop(cx, cy);
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

  private key(cx: number, cy: number, level = 0): string {
    return `${level}/${cx}/${cy}`;
  }

  private build(cx: number, cy: number, level: number): Cell {
    const uniforms = new UniformGroup({
      uLandDefault: { value: this.landDefault, type: 'vec3<f32>' },
      uWaterDefault: { value: this.waterDefault, type: 'vec3<f32>' },
      uEdge: { value: this.edge, type: 'f32' },
      uPaperOpacity: { value: this.paperOpacity, type: 'f32' },
      uPaperScale: { value: this.paperScale, type: 'f32' },
      uChunkOrigin: {
        value: [cx * tileWorldSize(level), cy * tileWorldSize(level)],
        type: 'vec2<f32>',
      },
      uTileSpan: { value: tileWorldSize(level), type: 'f32' },
      uNoiseScale: { value: this.coast.noiseScale, type: 'f32' },
      uNoiseAmount: { value: this.coast.noiseAmount, type: 'f32' },
      uShoreWidth: { value: this.coast.shoreWidth, type: 'f32' },
      uShoreLight: { value: this.coast.shoreLight, type: 'f32' },
      uShadowWidth: { value: this.coast.shadowWidth, type: 'f32' },
      uShadowStrength: { value: this.coast.shadowStrength, type: 'f32' },
    });

    const height = this.chunks.get('height', cx, cy, level).texture;
    const landColor = this.chunks.get('landColor', cx, cy, level).texture;
    const waterColor = this.chunks.get('waterColor', cx, cy, level).texture;

    const shader = new Shader({
      glProgram: program(),
      resources: {
        uHeight: height.source,
        uHeightSampler: height.source.style,
        uLandColor: landColor.source,
        uLandColorSampler: landColor.source.style,
        uWaterColor: waterColor.source,
        uWaterColorSampler: waterColor.source.style,
        uPaper: this.paper.source,
        uPaperSampler: this.paper.source.style,
        terrainUniforms: uniforms,
      },
    });

    const mesh: TerrainMesh = new Mesh<Geometry, Shader>({ geometry: this.geometry, shader });
    const span = tileWorldSize(level);
    mesh.position.set(cx * span, cy * span);
    mesh.scale.set(span);

    const cell: Cell = {
      cx,
      cy,
      level,
      mesh,
      uniforms,
      bound: { height, landColor, waterColor },
    };

    this.container.addChild(mesh);
    this.cells.set(this.key(cx, cy, level), cell);
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

  /** Forget a cell whose chunk textures were evicted; its shader now points at nothing. */
  private drop(cx: number, cy: number): void {
    // A disposed chunk is level 0; higher levels have their own textures.
    const key = this.key(cx, cy, 0);
    const cell = this.cells.get(key);
    if (!cell) return;
    this.destroyCell(cell);
    this.cells.delete(key);
  }

  /**
   * Rebuild the visible set of cells. Call once per frame with the camera bounds.
   *
   * Every cell is a mesh with its own shader binding four textures, so the count has to be
   * bounded: zoomed far out the view can span hundreds of cells, and building all of them
   * is what made a wide zoom crawl. Past the cap only the cells nearest the middle of the
   * screen are drawn, which is where the eye is, and the ocean backdrop covers the rest.
   */
  update(bounds: Bounds, level = 0): void {
    const span = tileWorldSize(level);
    const minCx = Math.floor(bounds.minX / span);
    const maxCx = Math.floor(bounds.maxX / span);
    const minCy = Math.floor(bounds.minY / span);
    const maxCy = Math.floor(bounds.maxY / span);

    const spanX = maxCx - minCx + 1;
    const spanY = maxCy - minCy + 1;
    const cap = MAX_TERRAIN_CELLS;

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
      const key = this.key(cx, cy, level);
      live.add(key);

      const cell = this.cells.get(key);

      /*
       * Only move a cell to the requested level once that level has *all* its layers.
       *
       * The streamer starts loading the new level as soon as the zoom crosses, but the
       * fetches take a moment. Swapping immediately meant showing empty textures until they
       * landed — chunks flashing white and blocks of colour disappearing mid-zoom. Holding
       * the level already on screen until its replacement is genuinely ready makes the
       * transition invisible instead.
       */
      const ready = this.chunks.isCellReady(cx, cy, level);
      const useLevel: number = ready ? level : (cell?.level ?? level);

      if (!cell) {
        // A cell that has never been drawn waits until it is complete. Ocean briefly, then
        // finished terrain, beats a white block that fills in its colour a moment later.
        if (ready) this.build(cx, cy, useLevel);
        continue;
      }

      // Rebuild when the level changed, or when eviction handed back a different
      // RenderTexture — either way the shader is pointing at the wrong pixels.
      const h = this.chunks.get('height', cx, cy, useLevel).texture;
      if (cell.level !== useLevel || cell.bound.height !== h) {
        this.destroyCell(cell);
        this.cells.delete(key);
        this.build(cx, cy, useLevel);
      }
    }

    for (const [key, cell] of [...this.cells]) {
      if (live.has(key)) continue;
      this.destroyCell(cell);
      this.cells.delete(key);
    }

  }

  destroy(): void {
    for (const cell of this.cells.values()) this.destroyCell(cell);
    this.cells.clear();

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
