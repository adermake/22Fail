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

export type TerrainTool =
  | 'landBrush'
  | 'landEraser'
  | 'waterBrush'
  | 'waterEraser'
  | 'heighten'
  | 'lower'
  | 'lakeStamp'
  | 'landPaint'
  | 'waterPaint';

export const TERRAIN_TOOLS: readonly TerrainTool[] = [
  'landBrush',
  'landEraser',
  'waterBrush',
  'waterEraser',
  'heighten',
  'lower',
  'lakeStamp',
  'landPaint',
  'waterPaint',
];

/** Which raster a tool writes into. */
export function toolLayer(tool: TerrainTool): RasterLayer {
  if (tool === 'landPaint') return 'landColor';
  if (tool === 'waterPaint') return 'waterColor';
  return 'height';
}

/** Whether a tool subtracts (erase blend) rather than adds. */
function toolErases(tool: TerrainTool): boolean {
  return tool === 'landEraser' || tool === 'waterBrush' || tool === 'lower' || tool === 'lakeStamp';
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
}

export function defaultBrush(): BrushSettings {
  return { tool: 'landBrush', size: 120, softness: 0.35, strength: 1, color: '#7a8f5a' };
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

  /** Single stamp at a point. */
  dab(p: { x: number; y: number }, brush: BrushSettings): void {
    const layer = toolLayer(brush.tool);
    const erase = toolErases(brush.tool);

    this.host.removeChildren();

    // Paint tools carry colour; height tools only ever write alpha, so white is right.
    const tint = layer === 'height' ? 0xffffff : parseHex(brush.color);

    if (toolIsNoisy(brush.tool)) {
      this.buildNoisyDab(p, brush, tint);
    } else {
      const s = this.take(0, this.dabs.get(brush.softness));
      s.position.set(p.x, p.y);
      s.scale.set((brush.size * 2) / DAB_TEXELS);
      s.alpha = brush.strength;
      s.tint = tint;
    }

    this.host.blendMode = erase ? 'erase' : 'normal';

    const r = brush.size;
    const bounds: Bounds = {
      minX: p.x - r,
      minY: p.y - r,
      maxX: p.x + r,
      maxY: p.y + r,
    };

    for (const rec of this.chunks.paintWorld(layer, this.host, bounds)) {
      this.strokeTouched.add(rec);
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
    const blobs = 7;

    for (let i = 0; i < blobs; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * brush.size * 0.5;
      const size = brush.size * (0.4 + rand() * 0.45);

      const s = this.take(i, texture);
      s.position.set(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist);
      s.scale.set((size * 2) / DAB_TEXELS);
      s.alpha = brush.strength * 0.5;
      s.tint = tint;
    }
  }

  /** See `lakeOutline`. Exposed on the engine so the cursor preview can call it directly. */
  lakeOutline(cx: number, cy: number, radius: number, seed: number): number[] {
    return lakeOutline(cx, cy, radius, seed);
  }

  /** Carve a lake into the height field. Returns the chunks it touched. */
  stampLake(cx: number, cy: number, radius: number, seed: number): ChunkRecord[] {
    const g = new Graphics()
      .poly(this.lakeOutline(cx, cy, radius, seed))
      .fill({ color: 0xffffff, alpha: 1 });

    this.host.removeChildren();
    this.host.blendMode = 'erase';
    this.host.addChild(g);

    const r = radius * 1.4; // the wobble can push past the nominal radius
    const touched = this.chunks.paintWorld('height', this.host, {
      minX: cx - r,
      minY: cy - r,
      maxX: cx + r,
      maxY: cy + r,
    });

    this.host.removeChildren();
    g.destroy();

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
const LAKE_STEPS = 192;
/** Octaves of radial wobble. One or two look like a wavy circle, not like a lake. */
const LAKE_OCTAVES = 5;

/**
 * Outline of the lake a given seed produces, as a flat x,y point list.
 *
 * Shared by the stamp and the cursor preview so what you see before clicking is exactly the
 * shape you get — previewing a plain circle would be a lie, since the whole point of the
 * tool is that every lake comes out different.
 *
 * The radius is modulated by several octaves of sine noise with independently randomised
 * frequency, phase and amplitude. An earlier two-octave version with a frequency picked from
 * three values produced shapes so alike they looked like the same lake toggling between a
 * couple of states, and at 48 vertices the facets were visible as straight edges.
 */
export function lakeOutline(cx: number, cy: number, radius: number, seed: number): number[] {
  const rand = seeded(seed);

  // Low frequencies give the overall lopsided body, higher ones the ragged shoreline.
  const octaves: { freq: number; phase: number; amp: number }[] = [];
  let amp = 0.28;
  for (let o = 0; o < LAKE_OCTAVES; o++) {
    octaves.push({
      freq: Math.max(1, Math.round(1 + rand() * 2) + o * 2),
      phase: rand() * Math.PI * 2,
      amp: amp * (0.6 + rand() * 0.8),
    });
    amp *= 0.55;
  }

  const points: number[] = [];
  for (let i = 0; i < LAKE_STEPS; i++) {
    const a = (i / LAKE_STEPS) * Math.PI * 2;
    let wobble = 1;
    for (const o of octaves) wobble += o.amp * Math.sin(a * o.freq + o.phase);
    // Keep the outline inside the region `stampLake` dirties, and stop it collapsing.
    wobble = Math.min(1.35, Math.max(0.35, wobble));
    points.push(cx + Math.cos(a) * radius * wobble, cy + Math.sin(a) * radius * wobble);
  }
  return points;
}

export function parseHex(hex: string): number {
  const n = Number.parseInt((hex || '').replace('#', ''), 16);
  return Number.isNaN(n) ? 0xffffff : n;
}
