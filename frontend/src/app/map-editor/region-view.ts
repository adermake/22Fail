/**
 * Region rendering — dotted boundary paths with optional fill.
 *
 * Pixi has no dashed-stroke primitive, so the dash pattern is walked manually along the
 * path. Doing it in world units (rather than screen units) means a region's dashes keep
 * their spacing relative to the map as you zoom, which is what makes them read as a border
 * drawn *on* the map rather than an overlay floating above it.
 */

import { Container, Graphics } from 'pixi.js';
import { MapRegion, Point } from './map-editor.model';
import { Bounds } from './map-camera';
import { SpatialIndex } from './spatial-index';

/** Handle size for point editing, in screen px (converted by the caller's zoom). */
export const HANDLE_SCREEN_PX = 7;

/**
 * Split a closed path into dash segments.
 *
 * Walks the perimeter accumulating distance, emitting a segment whenever inside a dash and
 * skipping while inside a gap. Segments can span corners, so the pattern stays even instead
 * of restarting at every vertex.
 */
export function dashedSegments(
  points: Point[],
  dash: number,
  gap: number,
): { from: Point; to: Point }[] {
  const out: { from: Point; to: Point }[] = [];
  if (points.length < 2) return out;

  const period = Math.max(0.01, dash + gap);
  let travelled = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length]; // closed
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) continue;

    const ux = dx / len;
    const uy = dy / len;

    let pos = 0;
    while (pos < len) {
      const phase = (travelled + pos) % period;
      if (phase < dash) {
        // Inside a dash: emit up to its end or the end of this edge.
        const run = Math.min(dash - phase, len - pos);
        out.push({
          from: { x: a.x + ux * pos, y: a.y + uy * pos },
          to: { x: a.x + ux * (pos + run), y: a.y + uy * (pos + run) },
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

/** Centroid of a path, cached on the region for spatial indexing. */
export function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

/** Shortest distance from a point to a closed path. */
export function distanceToPath(points: Point[], x: number, y: number): number {
  if (points.length === 0) return Infinity;
  if (points.length === 1) return Math.hypot(points[0].x - x, points[0].y - y);

  let best = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    best = Math.min(best, distanceToSegment(a, b, x, y));
  }
  return best;
}

function distanceToSegment(a: Point, b: Point, x: number, y: number): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-9) return Math.hypot(a.x - x, a.y - y);

  // Project onto the segment and clamp, so endpoints are handled correctly.
  let t = ((x - a.x) * dx + (y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(a.x + t * dx - x, a.y + t * dy - y);
}

/** World-space bounding box of a path. */
export function pathBounds(points: Point[]): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

export class RegionView {
  readonly container = new Container();
  readonly index = new SpatialIndex<MapRegion>();

  private graphics = new Graphics();
  private handles = new Graphics();
  private regions = new Map<string, MapRegion>();
  private selectedId: string | null = null;
  private dirty = true;

  constructor() {
    this.container.addChild(this.graphics, this.handles);
  }

  rebuild(regions: MapRegion[]): void {
    this.regions.clear();
    for (const r of regions) this.regions.set(r.id, r);
    this.index.rebuild(regions);
    this.dirty = true;
  }

  add(region: MapRegion): void {
    this.regions.set(region.id, region);
    this.index.insert(region);
    this.dirty = true;
  }

  update(region: MapRegion): void {
    this.regions.set(region.id, region);
    this.index.update(region);
    this.dirty = true;
  }

  remove(id: string): void {
    this.regions.delete(id);
    this.index.remove(id);
    if (this.selectedId === id) this.selectedId = null;
    this.dirty = true;
  }

  get(id: string): MapRegion | undefined {
    return this.regions.get(id);
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
    this.dirty = true;
  }

  get selected(): MapRegion | undefined {
    return this.selectedId ? this.regions.get(this.selectedId) : undefined;
  }

  markDirty(): void {
    this.dirty = true;
  }

  /**
   * Redraw regions.
   *
   * Everything lands in two Graphics objects rather than one per region: a map may hold
   * hundreds of borders, and a Graphics each would mean hundreds of draw calls for what is
   * ultimately a pile of line segments.
   */
  render(bounds: Bounds, zoom: number, showSecrets: boolean, force = false): void {
    if (!this.dirty && !force) return;
    this.dirty = false;

    const g = this.graphics;
    g.clear();

    for (const region of this.index.query({
      minX: bounds.minX - 4096,
      minY: bounds.minY - 4096,
      maxX: bounds.maxX + 4096,
      maxY: bounds.maxY + 4096,
    })) {
      if (region.vis === 'secret' && !showSecrets) continue;
      if (region.points.length < 2) continue;

      if (region.fill && (region.fillAlpha ?? 0) > 0) {
        g.poly(region.points.flatMap(p => [p.x, p.y]));
        g.fill({ color: parseColor(region.fill), alpha: region.fillAlpha ?? 0.2 });
      }

      for (const seg of dashedSegments(region.points, region.dash, region.gap)) {
        g.moveTo(seg.from.x, seg.from.y);
        g.lineTo(seg.to.x, seg.to.y);
      }
      g.stroke({
        width: region.thickness,
        color: parseColor(region.color),
        alpha: region.vis === 'secret' ? 0.7 : 1,
        cap: 'round',
      });
    }

    this.renderHandles(zoom);
  }

  /** Draw draggable vertices for the selected region. */
  private renderHandles(zoom: number): void {
    const h = this.handles;
    h.clear();

    const region = this.selected;
    if (!region) return;

    const r = HANDLE_SCREEN_PX / zoom;
    for (const p of region.points) {
      h.circle(p.x, p.y, r);
    }
    h.fill({ color: 0x8fd0ff, alpha: 0.9 });
    h.stroke({ width: 1 / zoom, color: 0x102030, alpha: 0.8 });
  }

  /** Region whose outline passes near a world point. */
  hitTest(x: number, y: number, tolerance: number): MapRegion | null {
    let best: MapRegion | null = null;
    let bestDist = tolerance;

    for (const region of this.index.query({
      minX: x - 4096,
      minY: y - 4096,
      maxX: x + 4096,
      maxY: y + 4096,
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
  hitHandle(x: number, y: number, tolerance: number): number {
    const region = this.selected;
    if (!region) return -1;
    for (let i = 0; i < region.points.length; i++) {
      if (Math.hypot(region.points[i].x - x, region.points[i].y - y) <= tolerance) return i;
    }
    return -1;
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.index.clear();
    this.regions.clear();
  }
}

export function parseColor(hex: string): number {
  const n = Number.parseInt((hex || '').replace('#', ''), 16);
  return Number.isNaN(n) ? 0xffffff : n;
}
