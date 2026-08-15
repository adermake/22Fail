/**
 * Terrain brushes.
 *
 * Terrain is a single scalar height field stored in the `height` layer's alpha, thresholded
 * at 0.5 for the coastline. That one representation is why the six requested tools collapse
 * into two operations with different falloffs — which is also how Wonderdraft behaves, and
 * what lets a river carve through land for free:
 *
 *   land brush / water eraser  → push alpha toward 1   (add blend)
 *   water brush / land eraser  → push alpha toward 0   (erase blend)
 *   heighten / lower           → the same, with the falloff broken up by fBm noise so the
 *                                edge comes out droopy instead of a clean circle
 *
 * Colour brushes paint into `landColor` / `waterColor` instead, where alpha is coverage.
 *
 * Stamps are drawn along the segment between pointer samples rather than at the pointer
 * position alone; without that, a fast drag leaves a dotted line instead of a stroke.
 */

import { Container, Graphics, Renderer, Sprite, Texture } from 'pixi.js';
import { RasterLayer } from './map-editor.model';
import { Bounds } from './map-camera';
import { ChunkManager, ChunkRecord } from './chunk-manager';

/**
 * There is deliberately no water eraser. Height is one field, so "remove water" and "add
 * land" are the same operation — offering both invites the state that is neither, where a
 * region has had its water taken away without any land put back.
 */
export type TerrainTool =
  | 'landBrush'
  | 'landEraser'
  | 'waterBrush'
  | 'heighten'
  | 'lower'
  | 'lakeStamp'
  | 'landPaint'
  | 'waterPaint';

export const TERRAIN_TOOLS: readonly TerrainTool[] = [
  'landBrush',
  'landEraser',
  'waterBrush',
  'heighten',
  'lower',
  'lakeStamp',
  'landPaint',
  'waterPaint',
];

/** Which raster a tool writes into. For multi-pass tools this is the primary one. */
export function toolLayer(tool: TerrainTool): RasterLayer {
  if (tool === 'landPaint') return 'landColor';
  if (tool === 'waterPaint') return 'waterColor';
  return 'height';
}

/** Whether a tool subtracts (erase blend) rather than adds. */
function toolErases(tool: TerrainTool): boolean {
  return tool === 'landEraser' || tool === 'waterBrush' || tool === 'lower' || tool === 'lakeStamp';
}

/** Mirror a stamp horizontally — bound to Alt while placing. */
export type StampMirror = boolean;

export interface PaintPass {
  layer: RasterLayer;
  erase: boolean;
  /** Tint for this pass; height passes are always white since only alpha is read. */
  tint: number;
}

/**
 * The raster passes a tool performs.
 *
 * Shape and colour are separate responsibilities. Drawing land only changes the *shape* of
 * the landmass and leaves it white — colouring it is the colour brush's job. Two reasons
 * this matters: new land should not silently inherit whatever swatch happens to be
 * selected, and painting water over water used to lay a differently-coloured patch down,
 * which showed up as a hard blue outline around every stroke and lake.
 */
export function paintPasses(tool: TerrainTool, color: number): PaintPass[] {
  switch (tool) {
    case 'landBrush':
      return [{ layer: 'height', erase: false, tint: 0xffffff }];
    case 'landEraser':
      // Removing land takes its colour with it, so re-drawing there starts blank again.
      return [
        { layer: 'height', erase: true, tint: 0xffffff },
        { layer: 'landColor', erase: true, tint: 0xffffff },
      ];
    case 'waterBrush':
      return [{ layer: 'height', erase: true, tint: 0xffffff }];
    case 'lakeStamp':
      return [{ layer: 'height', erase: true, tint: 0xffffff }];
    // Raise/lower reshape the coastline without touching colour already laid down.
    case 'heighten':
      return [{ layer: 'height', erase: false, tint: 0xffffff }];
    case 'lower':
      return [{ layer: 'height', erase: true, tint: 0xffffff }];
    case 'landPaint':
      return [{ layer: 'landColor', erase: false, tint: color }];
    case 'waterPaint':
      return [{ layer: 'waterColor', erase: false, tint: color }];
  }
}

/** Whether a tool's falloff is broken up by noise. */
function toolIsNoisy(tool: TerrainTool): boolean {
  return tool === 'heighten' || tool === 'lower';
}

/** Resolution of a cached dab. Scaled per use, so one texture serves every brush size. */
const DAB_TEXELS = 256;

/**
 * Cache of radial falloff stamps, as textures.
 *
 * Two reasons this is a texture rather than a reusable `Graphics`. A display object can
 * only be in one place at a time, so the noisy brushes — which stamp several offset blobs
 * per dab — cannot share one instance. And the falloff *shape* depends only on softness,
 * so a single texture scaled to the brush radius covers every size, instead of rebuilding
 * a ring stack whenever the size slider moves.
 *
 * The stack is concentric rings because Pixi has no radial-gradient fill; 24 steps is past
 * the point where banding survives filtering.
 */
class DabCache {
  private cache = new Map<string, Texture>();

  constructor(private renderer: Renderer) {}

  get(softness: number): Texture {
    const key = softness.toFixed(2);
    const hit = this.cache.get(key);
    if (hit) return hit;

    const r = DAB_TEXELS / 2;
    const g = new Graphics();
    const steps = 24;
    const solid = 1 - Math.min(0.95, Math.max(0, softness));

    for (let i = steps; i >= 1; i--) {
      const t = i / steps;
      const a = t <= solid ? 1 : 1 - (t - solid) / Math.max(0.001, 1 - solid);
      g.circle(r, r, r * t).fill({ color: 0xffffff, alpha: a * a });
    }

    const texture = this.renderer.generateTexture({ target: g, resolution: 1 });
    g.destroy();

    this.cache.set(key, texture);
    return texture;
  }

  destroy(): void {
    for (const t of this.cache.values()) t.destroy(true);
    this.cache.clear();
  }
}

export interface BrushSettings {
  tool: TerrainTool;
  /** World-pixel radius. */
  size: number;
  /** 0 = hard edge, 1 = fully feathered. */
  softness: number;
  /** Flow per stamp, 0..1. */
  strength: number;
  /** Colour for the paint tools. */
  color: string;
  /** How ragged the raise/lower brushes are. 0 = a clean round dab. */
  noise: number;
}

export function defaultBrush(): BrushSettings {
  // White: freshly drawn land is blank, not a preset green.
  return {
    tool: 'landBrush',
    size: 120,
    softness: 0.35,
    strength: 1,
    color: '#ffffff',
    noise: 0.6,
  };
}

/** Deterministic value noise, so a lake shape is reproducible from its seed. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export class BrushEngine {
  private dabs: DabCache;
  /** Reused stamp host, so a stroke allocates nothing per sample. */
  private host = new Container();
  /** Sprite pool for stamps; the noisy brushes need several per dab. */
  private pool: Sprite[] = [];
  private lastPoint: { x: number; y: number } | null = null;

  /** Chunks touched by the current stroke, for the undo snapshot and the flush. */
  private strokeTouched = new Set<ChunkRecord>();

  constructor(
    private chunks: ChunkManager,
    renderer: Renderer,
  ) {
    this.dabs = new DabCache(renderer);
  }

  /** Borrow a pooled stamp sprite, growing the pool only as far as a dab actually needs. */
  private take(index: number, texture: Texture): Sprite {
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

  beginStroke(): void {
    this.lastPoint = null;
    this.strokeTouched.clear();
  }

  /** Chunks the just-finished stroke wrote to. */
  endStroke(): ChunkRecord[] {
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
   */
  stroke(p: { x: number; y: number }, brush: BrushSettings): void {
    const from = this.lastPoint ?? p;
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const dist = Math.hypot(dx, dy);

    const spacing = Math.max(1, brush.size * 0.25);
    const steps = Math.max(1, Math.ceil(dist / spacing));

    for (let i = 1; i <= steps; i++) {
      const t = steps === 0 ? 1 : i / steps;
      this.dab({ x: from.x + dx * t, y: from.y + dy * t }, brush);
    }

    this.lastPoint = p;
  }

  /** Single stamp at a point, applying every raster pass the tool performs. */
  dab(p: { x: number; y: number }, brush: BrushSettings): void {
    const color = parseHex(brush.color);
    const r = brush.size;
    const bounds: Bounds = { minX: p.x - r, minY: p.y - r, maxX: p.x + r, maxY: p.y + r };

    for (const pass of paintPasses(brush.tool, color)) {
      this.host.removeChildren();

      if (toolIsNoisy(brush.tool)) {
        this.buildNoisyDab(p, brush, pass.tint);
      } else {
        const s = this.take(0, this.dabs.get(brush.softness));
        s.position.set(p.x, p.y);
        s.scale.set((brush.size * 2) / DAB_TEXELS);
        s.alpha = brush.strength;
        s.tint = pass.tint;
      }

      this.host.blendMode = pass.erase ? 'erase' : 'normal';

      for (const rec of this.chunks.paintWorld(pass.layer, this.host, bounds)) {
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
  private buildNoisyDab(p: { x: number; y: number }, brush: BrushSettings, tint: number): void {
    // Seeded from the position, so dragging back over the same spot reproduces the same
    // ragged edge instead of accumulating a different blob each pass.
    const rand = seeded((Math.round(p.x) * 73856093) ^ (Math.round(p.y) * 19349663));
    const texture = this.dabs.get(Math.max(0.4, brush.softness));

    // More noise means more, smaller, further-flung blobs — the knob runs from a nearly
    // round dab to a torn, scattered one.
    const noise = Math.max(0, Math.min(1, brush.noise ?? 0.6));
    const blobs = Math.max(1, Math.round(3 + noise * 9));
    const scatter = 0.15 + noise * 0.75;
    const sizeSpread = 0.15 + noise * 0.6;

    for (let i = 0; i < blobs; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * brush.size * scatter;
      const size = brush.size * (1 - sizeSpread * rand());

      const s = this.take(i, texture);
      s.position.set(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist);
      s.scale.set((size * 2) / DAB_TEXELS);
      // Split the flow across the blobs so total coverage stays near the set strength.
      s.alpha = (brush.strength * 0.9) / Math.sqrt(blobs);
      s.tint = tint;
    }
  }

  /** See `lakeOutline`. Exposed on the engine so the cursor preview can call it directly. */
  lakeOutline(cx: number, cy: number, radius: number, seed: number): number[] {
    return lakeOutline(cx, cy, radius, seed);
  }

  /** Carve a lake into the height field and colour its water. */
  stampLake(cx: number, cy: number, radius: number, seed: number, color: string): ChunkRecord[] {
    const outline = this.lakeOutline(cx, cy, radius, seed);
    const r = radius * 1.4; // the wobble can push past the nominal radius
    const bounds: Bounds = { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r };
    const touched: ChunkRecord[] = [];

    for (const pass of paintPasses('lakeStamp', parseHex(color))) {
      const g = new Graphics().poly(outline).fill({ color: pass.tint, alpha: 1 });

      this.host.removeChildren();
      this.host.blendMode = pass.erase ? 'erase' : 'normal';
      this.host.addChild(g);

      touched.push(...this.chunks.paintWorld(pass.layer, this.host, bounds));

      this.host.removeChildren();
      g.destroy();
    }

    for (const rec of touched) this.strokeTouched.add(rec);
    return touched;
  }

  destroy(): void {
    this.dabs.destroy();
    this.host.removeChildren();
    for (const s of this.pool) s.destroy();
    this.pool = [];
    this.host.destroy();
  }
}

/** Vertices around a lake outline. Low counts read as a visibly faceted polygon. */
const LAKE_STEPS = 256;

/**
 * Outline of the lake a given seed produces, as a flat x,y point list.
 *
 * Shared by the stamp and the cursor preview so what you see before clicking is exactly the
 * shape you get — previewing a plain circle would be a lie, since the whole point of the
 * tool is that every lake comes out different.
 *
 * Real lakes are not wobbled circles. They sit in valleys, so they are elongated, bent, and
 * lobed, with arms reaching off the main body. Modulating one radius — however many noise
 * octaves are stacked on it — can only ever produce a blob, because every outline point is
 * still measured from a single centre.
 *
 * So the shape is built from a *spine*: a short wandering path with several overlapping
 * lobes of varying size along it. The outline is then the furthest lobe surface in each
 * direction, which naturally yields inlets where two lobes meet and a long axis that
 * follows the spine.
 */
export function lakeOutline(cx: number, cy: number, radius: number, seed: number): number[] {
  const rand = seeded(seed);

  // Spine: a gently curving walk, so the lake has a long axis instead of a centre.
  const lobeCount = 3 + Math.floor(rand() * 4);
  const heading = rand() * Math.PI * 2;
  const bend = (rand() - 0.5) * 1.4;
  const spread = 0.35 + rand() * 0.45;

  const lobes: { x: number; y: number; r: number }[] = [];
  let px = 0;
  let py = 0;
  let dir = heading;

  for (let i = 0; i < lobeCount; i++) {
    // Lobes shrink towards the ends, giving a fat middle and tapered arms.
    const t = i / Math.max(1, lobeCount - 1);
    const taper = 0.55 + 0.45 * Math.sin(Math.PI * t);
    lobes.push({ x: px, y: py, r: radius * taper * (0.55 + rand() * 0.3) });

    dir += bend * (0.4 + rand() * 0.6);
    const step = radius * spread * (0.7 + rand() * 0.6);
    px += Math.cos(dir) * step;
    py += Math.sin(dir) * step;
  }

  // Recentre so the lake lands where the user clicked rather than drifting off the cursor.
  let ax = 0;
  let ay = 0;
  for (const l of lobes) {
    ax += l.x;
    ay += l.y;
  }
  ax /= lobes.length;
  ay /= lobes.length;

  // Fine shoreline crenulation on top of the lobe silhouette.
  const crenFreq = 5 + Math.floor(rand() * 7);
  const crenPhase = rand() * Math.PI * 2;
  const crenAmp = 0.04 + rand() * 0.05;

  const points: number[] = [];
  let maxReach = 0;

  for (let i = 0; i < LAKE_STEPS; i++) {
    const a = (i / LAKE_STEPS) * Math.PI * 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);

    // Furthest lobe surface along this ray, measured from the recentred origin.
    let reach = 0;
    for (const l of lobes) {
      const ox = l.x - ax;
      const oy = l.y - ay;
      // Distance from origin to where the ray exits this lobe's circle.
      const proj = ox * ux + oy * uy;
      const perpSq = ox * ox + oy * oy - proj * proj;
      if (perpSq > l.r * l.r) continue; // ray misses this lobe entirely
      reach = Math.max(reach, proj + Math.sqrt(l.r * l.r - perpSq));
    }
    if (reach <= 0) reach = radius * 0.25;

    reach *= 1 + crenAmp * Math.sin(a * crenFreq + crenPhase);
    maxReach = Math.max(maxReach, reach);
    points.push(reach * ux, reach * uy);
  }

  // Normalise so `radius` means the same thing whatever shape came out, and keep the
  // outline inside the region `stampLake` dirties.
  const scale = maxReach > 0 ? Math.min(1, (radius * 1.3) / maxReach) : 1;
  for (let i = 0; i < points.length; i += 2) {
    points[i] = cx + points[i] * scale;
    points[i + 1] = cy + points[i + 1] * scale;
  }
  return points;
}

export function parseHex(hex: string): number {
  const n = Number.parseInt((hex || '').replace('#', ''), 16);
  return Number.isNaN(n) ? 0xffffff : n;
}
