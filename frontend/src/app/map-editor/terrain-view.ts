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
  Mesh,
  Shader,
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

/**
 * Land/water mix factor. Phase 5 swaps this for noise-warped sampling to get the drippy
 * Wonderdraft coastline; the rest of the shader is agnostic to how the edge is decided.
 */
float coastline(float h) {
    return smoothstep(0.5 - uEdge, 0.5 + uEdge, h);
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

    vec3 col = mix(water, land, coastline(h));

    // Paper grain is sampled in world space so it stays seamless across chunk borders.
    vec2 worldPos = uChunkOrigin + vUV * ${CHUNK_WORLD_SIZE.toFixed(1)};
    vec3 paper = texture(uPaper, worldPos / uPaperScale).rgb;
    col *= mix(vec3(1.0), paper, uPaperOpacity);

    finalColor = vec4(col, 1.0);
}
`;

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

  private refreshUniforms(): void {
    for (const cell of this.cells.values()) {
      const u = cell.uniforms.uniforms;
      u['uLandDefault'] = this.landDefault;
      u['uWaterDefault'] = this.waterDefault;
      u['uEdge'] = this.edge;
      u['uPaperOpacity'] = this.paperOpacity;
      u['uPaperScale'] = this.paperScale;
    }
  }

  // ── cells ──

  private key(cx: number, cy: number): string {
    return `${cx}/${cy}`;
  }

  private build(cx: number, cy: number): Cell {
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
    this.container.addChild(mesh);

    const cell: Cell = {
      cx,
      cy,
      mesh,
      uniforms,
      bound: { height, landColor, waterColor },
    };
    this.cells.set(this.key(cx, cy), cell);
    return cell;
  }

  private destroyCell(cell: Cell): void {
    this.container.removeChild(cell.mesh);
    // The geometry is shared across every cell, so it must outlive them.
    cell.mesh.destroy({ children: true });
  }

  private drop(cx: number, cy: number): void {
    const cell = this.cells.get(this.key(cx, cy));
    if (!cell) return;
    this.destroyCell(cell);
    this.cells.delete(this.key(cx, cy));
  }

  /** Rebuild the visible set of cells. Call once per frame with the camera bounds. */
  update(bounds: Bounds): void {
    const minCx = Math.floor(bounds.minX / CHUNK_WORLD_SIZE);
    const maxCx = Math.floor(bounds.maxX / CHUNK_WORLD_SIZE);
    const minCy = Math.floor(bounds.minY / CHUNK_WORLD_SIZE);
    const maxCy = Math.floor(bounds.maxY / CHUNK_WORLD_SIZE);

    const live = new Set<string>();

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const key = this.key(cx, cy);
        live.add(key);

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
