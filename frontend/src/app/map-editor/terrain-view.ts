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

import {
  Container,
  Geometry,
  GlProgram,
  Matrix,
  Mesh,
  Rectangle,
  Renderer,
  RenderTexture,
  Shader,
  Sprite,
  Texture,
  UniformGroup,
} from 'pixi.js';
import { CHUNK_WORLD_SIZE, RasterLayer } from './map-editor.model';
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
uniform vec2 uChunkOrigin;    // world position of this chunk's top-left corner

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

    vec2 worldPos = uChunkOrigin + vUV * ${CHUNK_WORLD_SIZE.toFixed(1)};

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
 * Ceiling on full-detail terrain meshes.
 *
 * Kept just under the chunk manager's resident-cell budget, so the view never asks for
 * terrain the streamer has already evicted. Everything past this is drawn from the
 * thumbnail atlas instead.
 */
const MAX_TERRAIN_CELLS = 80;

/**
 * Low-resolution overview of terrain already seen.
 *
 * Chunk textures are evicted under a VRAM budget, so zoomed out, land simply stopped
 * existing past the resident set and vanished in chunk-sized squares as you panned. Raising
 * the budget only moves that edge further out.
 *
 * Instead every cell is baked once into a slot of a single atlas at 32×32. A slot is 4 KB,
 * the whole atlas is a fixed 16 MB, and — because every thumbnail shares one texture — the
 * hundreds of sprites needed for a wide view batch into a draw call or two. The baked copy
 * outlives the full-resolution chunk, so panning while zoomed out shows the map rather than
 * holes.
 */
const THUMB_TEXELS = 32;
const THUMB_ATLAS_TEXELS = 2048;
const THUMB_COLS = THUMB_ATLAS_TEXELS / THUMB_TEXELS; // 64 → 4096 slots

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
  mesh: TerrainMesh;
  uniforms: UniformGroup;
  /** Texture identity last bound, so eviction and refetches can be detected. */
  bound: Record<RasterLayer, Texture | null>;
}

export class TerrainView {
  /** Parent this in the camera-transformed world container. */
  readonly container = new Container();
  /** Thumbnails draw beneath the full-detail meshes, so detail always wins where present. */
  private thumbLayer = new Container();
  private meshLayer = new Container();

  private cells = new Map<string, Cell>();
  private geometry = quad();

  /** Baked overview: one atlas, one slot per cell, plus the sprites that show it. */
  private thumbAtlas: RenderTexture | null = null;
  private thumbSlots = new Map<string, number>();
  private thumbTextures = new Map<string, Texture>();
  private thumbSprites = new Map<string, Sprite>();
  private thumbPool: Sprite[] = [];
  private thumbLru: string[] = [];
  private thumbHost = new Container();

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

  constructor(
    private chunks: ChunkManager,
    private renderer?: Renderer,
  ) {
    this.container.addChild(this.thumbLayer, this.meshLayer);

    // A refetched or restored chunk keeps its RenderTexture identity, so the mesh already
    // points at the right pixels — but an evicted one does not, hence the drop below.
    // The cell is re-baked first, so the overview keeps what the full chunk is losing.
    this.chunks.onChunkDisposed = (_layer, cx, cy) => {
      this.bakeThumb(cx, cy);
      this.drop(cx, cy);
    };
    this.chunks.onChunkUpdated = rec => this.invalidateThumb(rec.cx, rec.cy);
  }

  /** Atlas rectangle for a cell, allocating (and recycling) a slot on demand. */
  private slotFor(key: string): { index: number; x: number; y: number } | null {
    let index = this.thumbSlots.get(key);

    if (index === undefined) {
      if (this.thumbSlots.size < THUMB_COLS * THUMB_COLS) {
        index = this.thumbSlots.size;
      } else {
        // Full: recycle the least recently baked cell's slot.
        const victim = this.thumbLru.shift();
        if (victim === undefined) return null;
        index = this.thumbSlots.get(victim)!;
        this.thumbSlots.delete(victim);
        this.thumbTextures.get(victim)?.destroy();
        this.thumbTextures.delete(victim);
      }
      this.thumbSlots.set(key, index);
    }

    // Refresh recency.
    const at = this.thumbLru.indexOf(key);
    if (at >= 0) this.thumbLru.splice(at, 1);
    this.thumbLru.push(key);

    return {
      index,
      x: (index % THUMB_COLS) * THUMB_TEXELS,
      y: Math.floor(index / THUMB_COLS) * THUMB_TEXELS,
    };
  }

  /**
   * Render a cell's composited terrain into its atlas slot.
   *
   * Uses the same shader as the full-detail mesh, so the overview matches what it stands in
   * for rather than being a separate approximation that drifts.
   */
  private bakeThumb(cx: number, cy: number): void {
    if (!this.renderer) return;

    const key = this.key(cx, cy);
    const slot = this.slotFor(key);
    if (!slot) return;

    this.thumbAtlas ??= RenderTexture.create({
      width: THUMB_ATLAS_TEXELS,
      height: THUMB_ATLAS_TEXELS,
      scaleMode: 'linear',
    });

    // Reuse the live cell's shader when it exists, otherwise build a throwaway one.
    const existing = this.cells.get(key);
    const cell = existing ?? this.build(cx, cy, false);

    const m = new Matrix(THUMB_TEXELS, 0, 0, THUMB_TEXELS, slot.x, slot.y);

    this.thumbHost.removeChildren();
    this.thumbHost.addChild(cell.mesh);
    // The mesh carries a world transform; the unit quad is what maps onto the slot.
    const px = cell.mesh.x;
    const py = cell.mesh.y;
    const ps = cell.mesh.scale.x;
    cell.mesh.position.set(0, 0);
    cell.mesh.scale.set(1);

    this.renderer.render({
      container: this.thumbHost,
      target: this.thumbAtlas,
      clear: false,
      transform: m,
    });

    cell.mesh.position.set(px, py);
    cell.mesh.scale.set(ps);
    this.thumbHost.removeChildren();

    if (existing) this.meshLayer.addChild(cell.mesh);
    else this.destroyCell(cell);

    // Point the thumbnail sprite at the freshly baked slot.
    this.thumbTextures.get(key)?.destroy();
    this.thumbTextures.set(
      key,
      new Texture({
        source: this.thumbAtlas.source,
        frame: new Rectangle(slot.x, slot.y, THUMB_TEXELS, THUMB_TEXELS),
      }),
    );
  }

  /** Re-bake a cell whose pixels changed. */
  private invalidateThumb(cx: number, cy: number): void {
    if (this.cells.has(this.key(cx, cy))) this.bakeThumb(cx, cy);
  }

  /**
   * Re-bake the overview across a world region.
   *
   * Painting writes straight into chunk textures without going through the chunk manager's
   * update hooks, so the overview would otherwise keep showing the terrain as it was before
   * the stroke. Called once when a stroke settles, not per dab.
   */
  refreshThumbs(bounds: Bounds): void {
    const minCx = Math.floor(bounds.minX / CHUNK_WORLD_SIZE);
    const maxCx = Math.floor(bounds.maxX / CHUNK_WORLD_SIZE);
    const minCy = Math.floor(bounds.minY / CHUNK_WORLD_SIZE);
    const maxCy = Math.floor(bounds.maxY / CHUNK_WORLD_SIZE);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) this.invalidateThumb(cx, cy);
    }
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

  private key(cx: number, cy: number): string {
    return `${cx}/${cy}`;
  }

  private build(cx: number, cy: number, register = true): Cell {
    const uniforms = new UniformGroup({
      uLandDefault: { value: this.landDefault, type: 'vec3<f32>' },
      uWaterDefault: { value: this.waterDefault, type: 'vec3<f32>' },
      uEdge: { value: this.edge, type: 'f32' },
      uPaperOpacity: { value: this.paperOpacity, type: 'f32' },
      uPaperScale: { value: this.paperScale, type: 'f32' },
      uChunkOrigin: {
        value: [cx * CHUNK_WORLD_SIZE, cy * CHUNK_WORLD_SIZE],
        type: 'vec2<f32>',
      },
      uNoiseScale: { value: this.coast.noiseScale, type: 'f32' },
      uNoiseAmount: { value: this.coast.noiseAmount, type: 'f32' },
      uShoreWidth: { value: this.coast.shoreWidth, type: 'f32' },
      uShoreLight: { value: this.coast.shoreLight, type: 'f32' },
      uShadowWidth: { value: this.coast.shadowWidth, type: 'f32' },
      uShadowStrength: { value: this.coast.shadowStrength, type: 'f32' },
    });

    const height = this.chunks.get('height', cx, cy).texture;
    const landColor = this.chunks.get('landColor', cx, cy).texture;
    const waterColor = this.chunks.get('waterColor', cx, cy).texture;

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
    mesh.position.set(cx * CHUNK_WORLD_SIZE, cy * CHUNK_WORLD_SIZE);
    mesh.scale.set(CHUNK_WORLD_SIZE);

    const cell: Cell = {
      cx,
      cy,
      mesh,
      uniforms,
      bound: { height, landColor, waterColor },
    };

    // A throwaway cell built only to bake a thumbnail must not join the scene or the map.
    if (register) {
      this.meshLayer.addChild(mesh);
      this.cells.set(this.key(cx, cy), cell);
      this.bakeThumb(cx, cy);
    }
    return cell;
  }

  private destroyCell(cell: Cell): void {
    this.meshLayer.removeChild(cell.mesh);
    // The geometry is shared across every cell, so it must outlive them.
    cell.mesh.destroy({ children: true });
  }

  /** Show or hide the baked thumbnail for a cell. */
  private setThumbVisible(cx: number, cy: number, visible: boolean): void {
    const key = this.key(cx, cy);
    const existing = this.thumbSprites.get(key);

    if (!visible) {
      if (existing) {
        this.thumbLayer.removeChild(existing);
        existing.visible = false;
        this.thumbSprites.delete(key);
        this.thumbPool.push(existing);
      }
      return;
    }

    const texture = this.thumbTextures.get(key);
    if (!texture) return;

    const sprite = existing ?? this.thumbPool.pop() ?? new Sprite();
    sprite.texture = texture;
    sprite.position.set(cx * CHUNK_WORLD_SIZE, cy * CHUNK_WORLD_SIZE);
    sprite.setSize(CHUNK_WORLD_SIZE, CHUNK_WORLD_SIZE);
    sprite.visible = true;

    if (!existing) {
      this.thumbLayer.addChild(sprite);
      this.thumbSprites.set(key, sprite);
    }
  }

  private drop(cx: number, cy: number): void {
    const cell = this.cells.get(this.key(cx, cy));
    if (!cell) return;
    this.destroyCell(cell);
    this.cells.delete(this.key(cx, cy));
  }

  /**
   * Rebuild the visible set of cells. Call once per frame with the camera bounds.
   *
   * Every cell is a mesh with its own shader binding four textures, so the count has to be
   * bounded: zoomed far out the view can span hundreds of cells, and building all of them
   * is what made a wide zoom crawl. Past the cap only the cells nearest the middle of the
   * screen are drawn, which is where the eye is, and the ocean backdrop covers the rest.
   */
  update(bounds: Bounds): void {
    const minCx = Math.floor(bounds.minX / CHUNK_WORLD_SIZE);
    const maxCx = Math.floor(bounds.maxX / CHUNK_WORLD_SIZE);
    const minCy = Math.floor(bounds.minY / CHUNK_WORLD_SIZE);
    const maxCy = Math.floor(bounds.maxY / CHUNK_WORLD_SIZE);

    const spanX = maxCx - minCx + 1;
    const spanY = maxCy - minCy + 1;

    let wanted: { cx: number; cy: number }[] = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) wanted.push({ cx, cy });
    }

    if (spanX * spanY > MAX_TERRAIN_CELLS) {
      const midX = (minCx + maxCx) / 2;
      const midY = (minCy + maxCy) / 2;
      wanted.sort(
        (a, b) =>
          (a.cx - midX) ** 2 + (a.cy - midY) ** 2 - ((b.cx - midX) ** 2 + (b.cy - midY) ** 2),
      );
      wanted = wanted.slice(0, MAX_TERRAIN_CELLS);
    }

    const live = new Set<string>();
    const detailed = new Set<string>();

    for (const { cx, cy } of wanted) {
      const key = this.key(cx, cy);
      live.add(key);
      detailed.add(key);

      const cell = this.cells.get(key);
      if (!cell) {
        this.build(cx, cy);
        continue;
      }

      // If eviction handed back a different RenderTexture, the shader is stale.
      const h = this.chunks.get('height', cx, cy).texture;
      if (cell.bound.height !== h) {
        this.destroyCell(cell);
        this.cells.delete(key);
        this.build(cx, cy);
      }
    }

    for (const [key, cell] of [...this.cells]) {
      if (live.has(key)) continue;
      this.destroyCell(cell);
      this.cells.delete(key);
    }

    /*
     * Fill everything else in view from the baked overview. This is the difference between
     * land ending in a hard square at the edge of the resident set and the map simply
     * continuing, softer, as far as it has ever been visited.
     */
    const shown = new Set<string>();
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const key = this.key(cx, cy);
        // Detail wins where it exists; a thumbnail underneath it would only be overdraw.
        if (detailed.has(key)) continue;
        if (!this.thumbTextures.has(key)) continue;
        shown.add(key);
        this.setThumbVisible(cx, cy, true);
      }
    }

    for (const key of [...this.thumbSprites.keys()]) {
      if (shown.has(key)) continue;
      const [cx, cy] = key.split('/').map(Number);
      this.setThumbVisible(cx, cy, false);
    }
  }

  destroy(): void {
    for (const cell of this.cells.values()) this.destroyCell(cell);
    this.cells.clear();

    for (const t of this.thumbTextures.values()) t.destroy();
    this.thumbTextures.clear();
    this.thumbSlots.clear();
    this.thumbLru = [];
    for (const s of this.thumbSprites.values()) s.destroy();
    for (const s of this.thumbPool) s.destroy();
    this.thumbSprites.clear();
    this.thumbPool = [];
    this.thumbHost.destroy();
    this.thumbAtlas?.destroy(true);
    this.thumbAtlas = null;

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
