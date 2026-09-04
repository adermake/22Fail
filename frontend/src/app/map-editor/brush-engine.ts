/**
 * Terrain brushes.
 *
 * Terrain has **three** states, not two, and that is what the `height` layer encodes:
 *
 *   alpha = 0                → nothing authored here: *background* water
 *   alpha > 0, red ≈ alpha   → land
 *   alpha > 0, red ≈ 0       → *foreground* water, drawn on purpose
 *
 * so the coastline thresholds `red`, and `alpha` says merely "this tier has an opinion".
 *
 * Two states were not enough. Water used to be the *absence* of land, written by erasing
 * alpha — and the tier composite is `over`, under which a transparent finer tier means "no
 * opinion" and the coarser tier shows straight through. A fine tier therefore could not carve
 * anything out of a coarse one; erasing only worked because a stroke also erased every coarser
 * tier directly, and a thin cut diluted to a fraction of a coarse texel never crossed the
 * threshold there. A river narrower than ~530 m was invisible at *every* zoom, because Grob
 * kept its land and filled the channel back in.
 *
 * Making water something you *author* fixes that: a full-alpha water stroke wins the composite
 * outright, because it has an opinion and the coarser tier's land is weighted by `1 - alpha`.
 *
 * Land strokes keep writing white, which is what every stored chunk already contains — so
 * `red == alpha` throughout the existing data and it reads exactly as it always did. The
 * encoding cost nothing: the height layer's RGB was three unused channels.
 *
 *   land brush / heighten  → white, add blend    (authored land)
 *   water brush / lake     → black, add blend    (authored water)
 *   land eraser            → erase blend         (un-author: back to background water)
 *   lower                  → erase blend         (lower the terrain toward background water)
 *
 * Colour brushes paint into `landColor` / `waterColor` instead, where alpha is coverage.
 *
 * Stamps are drawn along the segment between pointer samples rather than at the pointer
 * position alone; without that, a fast drag leaves a dotted line instead of a stroke.
 */

import { Container, Graphics, Renderer, Sprite, Texture } from 'pixi.js';
import { DetailTier, RasterLayer } from './map-editor.model';
import { Bounds } from './map-camera';
import { ChunkManager, ChunkRecord } from './chunk-manager';

/**
 * `landEraser` and `waterEraser` differ in reach, not just in name.
 *
 * "There should be no land here" has to remove the land from *every* tier, or a coarser one
 * supplies it again — so the land eraser cascades. "This water I drew should not be here"
 * must do the opposite: withdraw only this tier's opinion, so whatever the coarser tier says
 * comes back. Cascading it would erase the land under the river along with the river.
 */
export type TerrainTool =
  | 'landBrush'
  | 'landEraser'
  | 'waterBrush'
  | 'heighten'
  | 'lower'
  | 'lakeStamp'
  | 'landPaint'
  | 'waterPaint'
  | 'waterEraser'
  | 'landColorEraser'
  | 'waterColorEraser'
  | 'tierEraser';

export const TERRAIN_TOOLS: readonly TerrainTool[] = [
  'landBrush',
  'landEraser',
  'waterBrush',
  'heighten',
  'lower',
  'lakeStamp',
  'landPaint',
  'waterPaint',
  'waterEraser',
  'landColorEraser',
  'waterColorEraser',
  'tierEraser',
];

/** Which raster a tool writes into. For multi-pass tools this is the primary one. */
export function toolLayer(tool: TerrainTool): RasterLayer {
  if (tool === 'landPaint' || tool === 'landColorEraser') return 'landColor';
  if (tool === 'waterPaint' || tool === 'waterColorEraser') return 'waterColor';
  return 'height';
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
    /*
     * Water is authored, not subtracted: black adds coverage with no land-ness, so the stroke
     * carries an opinion the tier composite will respect. Erasing instead removed the opinion,
     * which a coarser tier then supplied again.
     */
    case 'waterBrush':
      return [{ layer: 'height', erase: false, tint: 0x000000 }];
    case 'lakeStamp':
      return [{ layer: 'height', erase: false, tint: 0x000000 }];
    /*
     * Take back drawn water without touching the land underneath.
     *
     * Erasing withdraws this tier's opinion, so the composite falls through to the coarser
     * tier — a river carved at Mittel over a Grob landmass gives the land back. Tier-local for
     * exactly that reason: cascading would erase the landmass too.
     */
    case 'waterEraser':
      return [{ layer: 'height', erase: true, tint: 0xffffff }];
    // Raise/lower reshape the coastline without touching colour already laid down. `lower`
    // stays subtractive: it lowers terrain toward background water rather than drawing water.
    case 'heighten':
      return [{ layer: 'height', erase: false, tint: 0xffffff }];
    case 'lower':
      return [{ layer: 'height', erase: true, tint: 0xffffff }];
    case 'landPaint':
      return [{ layer: 'landColor', erase: false, tint: color }];
    case 'waterPaint':
      return [{ layer: 'waterColor', erase: false, tint: color }];
    /*
     * Colour erasers take paint off without touching the land it sits on.
     *
     * `landEraser` removes both, which is right for "this landmass should not be here", but
     * useless for "this ground should go back to the base colour" — and that second job is
     * the only way to hand a coarser tier back control of an area a finer one has painted
     * over, since the composite reads fine paint over coarse.
     */
    case 'landColorEraser':
      return [{ layer: 'landColor', erase: true, tint: 0xffffff }];
    case 'waterColorEraser':
      return [{ layer: 'waterColor', erase: true, tint: 0xffffff }];
    /*
     * Every raster at once — the tier's own "make this spot hold nothing".
     *
     * Distinct from `landEraser`, which means "there should be no land here" and therefore
     * *writes* sea into the height field. This writes no opinion at all: the tier goes fully
     * transparent, so the composite falls through to whatever coarser tier is underneath.
     * That is the only way to hand an area back after a finer tier has claimed it, and it is
     * meaningless without knowing which tier you are on — hence its home next to the tier pin.
     */
    case 'tierEraser':
      return [
        { layer: 'height', erase: true, tint: 0xffffff },
        { layer: 'landColor', erase: true, tint: 0xffffff },
        { layer: 'waterColor', erase: true, tint: 0xffffff },
      ];
  }
}

/**
 * Tools that write their own tier and never the coarser ones, whatever mode is active.
 *
 * For `tierEraser` this is not a preference but its meaning: cascading would clear the very
 * tiers it exists to expose, so "erase this tier" would erase everything underneath and show
 * open sea instead of the coarse version. Ordinary brushes cascade by default and only stop
 * when isolating.
 */
export function toolIsTierLocal(tool: TerrainTool): boolean {
  return tool === 'tierEraser' || tool === 'waterEraser';
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
    size: 400,
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
   *
   * `tier` is the detail tier the stroke lands on — normally whatever the view settled on,
   * so a continent drawn zoomed out costs one or two chunks instead of three hundred. The
   * chunk manager writes the coarser tiers from the same node; nothing here has to know.
   */
  stroke(
    p: { x: number; y: number },
    brush: BrushSettings,
    tier: DetailTier,
    onlyTier = false,
  ): void {
    const from = this.lastPoint ?? p;
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const dist = Math.hypot(dx, dy);

    const spacing = Math.max(1, brush.size * 0.25);
    const steps = Math.max(1, Math.ceil(dist / spacing));

    for (let i = 1; i <= steps; i++) {
      const t = steps === 0 ? 1 : i / steps;
      this.dab({ x: from.x + dx * t, y: from.y + dy * t }, brush, tier, onlyTier);
    }

    this.lastPoint = p;
  }

  /** Single stamp at a point, applying every raster pass the tool performs. */
  dab(p: { x: number; y: number }, brush: BrushSettings, tier: DetailTier, onlyTier = false): void {
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

      for (const rec of this.chunks.paintWorld(pass.layer, this.host, bounds, tier, onlyTier)) {
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

    /*
     * The knob runs from a nearly round dab to a genuinely torn one.
     *
     * The first attempt kept every blob centred within half a radius and never smaller than
     * 40% of the brush, so the union was always a slightly lumpy circle — at maximum noise
     * it still read as a circular brush. Blobs now scatter past the nominal radius and
     * shrink much further, so the silhouette actually breaks up, and a few outliers are
     * flung clear to leave detached specks along the edge.
     */
    const noise = Math.max(0, Math.min(1, brush.noise ?? 0.6));
    const blobs = Math.max(1, Math.round(4 + noise * 14));
    const scatter = 0.2 + noise * 1.15;
    const minSize = 0.75 - noise * 0.6;

    for (let i = 0; i < blobs; i++) {
      const angle = rand() * Math.PI * 2;
      // Square-rooted so blobs spread over the area rather than clumping at the centre.
      const dist = Math.sqrt(rand()) * brush.size * scatter;
      const size = brush.size * (minSize + rand() * (1 - minSize));

      const s = this.take(i, texture);
      s.position.set(p.x + Math.cos(angle) * dist, p.y + Math.sin(angle) * dist);
      s.scale.set((size * 2) / DAB_TEXELS);
      // Split the flow across the blobs so total coverage stays near the set strength.
      s.alpha = (brush.strength * 0.9) / Math.sqrt(blobs);
      s.tint = tint;
    }
  }

  /** See `lakeOutline`. Exposed on the engine so the cursor preview can call it directly. */
  lakeOutline(cx: number, cy: number, radius: number, seed: number, noise = 0.6): number[] {
    return lakeOutline(cx, cy, radius, seed, noise);
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
  stampLake(
    cx: number,
    cy: number,
    radius: number,
    seed: number,
    _color: string,
    tier: DetailTier,
    onlyTier = false,
    noise = 0.6,
  ): ChunkRecord[] {
    const rand = seeded(seed ^ 0x9e3779b9);
    const reach = radius * 2.2; // satellites and feathering push well past the main body
    const bounds: Bounds = {
      minX: cx - reach,
      minY: cy - reach,
      maxX: cx + reach,
      maxY: cy + reach,
    };

    const g = new Graphics();

    // Main body, feathered from the outside in.
    this.appendFeathered(g, this.lakeOutline(cx, cy, radius, seed, noise));

    // Satellites: smaller pools offset from the main body, a few of them just detached.
    const satellites = 1 + Math.floor(rand() * 4);
    for (let i = 0; i < satellites; i++) {
      const a = rand() * Math.PI * 2;
      const dist = radius * (0.75 + rand() * 0.9);
      const sr = radius * (0.12 + rand() * 0.28);
      this.appendFeathered(
        g,
        this.lakeOutline(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, sr, seed + i * 7717, noise),
      );
    }

    this.host.removeChildren();
    // Authored water, like the water brush: black adds coverage with no land-ness, so the
    // lake wins the tier composite instead of merely withdrawing this tier's opinion.
    this.host.blendMode = 'normal';
    this.host.addChild(g);

    const touched = this.chunks.paintWorld('height', this.host, bounds, tier, onlyTier);

    this.host.removeChildren();
    g.destroy();

    for (const rec of touched) this.strokeTouched.add(rec);
    return touched;
  }

  /**
   * Fill an outline as a soft-edged blob.
   *
   * Concentric fills from slightly outside the outline down to its core; the overlapping
   * low-alpha layers accumulate into a ramp, which is the closest Pixi's flat fills get to
   * a feathered edge.
   */
  private appendFeathered(g: Graphics, outline: number[]): void {
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

    /*
     * Outside in, with the alpha *rising* toward the middle.
     *
     * Ten flat 0.16 fills relied on every one of them compositing against the last to reach
     * water, which makes the whole lake hostage to how the renderer batches identical fills:
     * merge them and the result is a single 16% wash that never crosses the coastline
     * threshold, and no lake appears. Ramping to a solid core means the middle is
     * unambiguously water however the fills are drawn, and the rings only shape the shore.
     */
    for (let s = 0; s < steps; s++) {
      // 1.12 → 0.55 of the outline, so the softest ring sits outside the nominal edge.
      const t = 1.12 - (s / (steps - 1)) * 0.57;
      const alpha = 0.12 + (s / (steps - 1)) * 0.88;
      const pts: number[] = [];
      for (let i = 0; i < outline.length; i += 2) {
        pts.push(cx + (outline[i] - cx) * t, cy + (outline[i + 1] - cy) * t);
      }
      g.poly(pts).fill({ color: 0x000000, alpha });
    }
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
export function lakeOutline(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  noise = 0.6,
): number[] {
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

  /*
   * Shoreline crenulation, as stacked octaves rather than one sine.
   *
   * A single sine wave is a *regular* wobble — the silhouette reads as a slightly squashed
   * circle however the amplitude is tuned, because every bay is the same size and evenly
   * spaced. Four octaves at roughly doubling frequency give large bays with smaller inlets cut
   * into them, which is what makes a shoreline look unplanned.
   *
   * Frequencies stay whole numbers so the outline closes seamlessly at the wrap-around; a
   * fractional one leaves a visible notch where the last vertex meets the first.
   */
  const octaves: { freq: number; phase: number; amp: number }[] = [];
  for (let i = 0; i < 4; i++) {
    octaves.push({
      freq: (2 + Math.floor(rand() * 4)) * Math.pow(2, i),
      phase: rand() * Math.PI * 2,
      // Halving per octave, and the knob scales the lot. Even at 0 the shore is not a circle.
      amp: (0.11 / Math.pow(1.9, i)) * (0.35 + Math.max(0, Math.min(1, noise)) * 1.65),
    });
  }

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

    let wobble = 0;
    for (const o of octaves) wobble += o.amp * Math.sin(a * o.freq + o.phase);
    // Clamped so a loud setting cannot fold the outline through its own centre.
    reach *= Math.max(0.25, 1 + wobble);
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
