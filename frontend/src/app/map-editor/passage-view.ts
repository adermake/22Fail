/**
 * Passages — a way through a hex edge: a pass, a ford, a gate.
 *
 * Drawn as a line along the boundary with a circle at each end, `o—o`, so it reads as an
 * opening in the line rather than a mark on the ground. The line follows the edge exactly,
 * which is what makes it obvious *which* boundary is meant when three hexes meet.
 *
 * Everything lands in one `Graphics`. A map may carry hundreds of these along a mountain
 * range, and a display object each would be hundreds of draw calls for a pile of short
 * segments.
 *
 * Sizes are divided by the zoom so the line and the circles stay the same on screen at any
 * scale. In world units a passage would be a hairline when zoomed out to a continent — which
 * is exactly the view where you want to see where the passes are.
 */

import { Container, Graphics } from 'pixi.js';
import { MapPassage } from './map-editor.model';
import { Bounds } from './map-camera';
import { HEX_RADIUS, edgeEndpoints } from './map-hex';

/** Warm ink, readable over both parchment land and open water. */
const PASSAGE_COLOR = 0x3a2a18;
const PASSAGE_HALO = 0xf2e6cc;

export class PassageView {
  readonly container = new Container();
  private graphics = new Graphics();

  private passages = new Map<string, MapPassage>();
  /** Edge key → passage id, so a click can toggle without scanning the collection. */
  private byEdge = new Map<string, string>();
  private dirty = true;

  constructor() {
    this.container.addChild(this.graphics);
  }

  rebuild(passages: readonly MapPassage[]): void {
    this.passages.clear();
    this.byEdge.clear();
    for (const p of passages) this.insert(p);
    this.dirty = true;
  }

  add(passage: MapPassage): void {
    this.insert(passage);
    this.dirty = true;
  }

  remove(id: string): void {
    const existing = this.passages.get(id);
    if (existing) {
      this.passages.delete(id);
      // Only drop the edge entry if it still points at *this* passage; a duplicate that
      // arrived first must not be unregistered by a later one being removed.
      if (this.byEdge.get(existing.edge) === id) this.byEdge.delete(existing.edge);
    }
    this.dirty = true;
  }

  private insert(passage: MapPassage): void {
    this.passages.set(passage.id, passage);
    this.byEdge.set(passage.edge, passage.id);
  }

  /** The passage on an edge, if any — the lookup a toggling click needs. */
  atEdge(edge: string): MapPassage | undefined {
    const id = this.byEdge.get(edge);
    return id ? this.passages.get(id) : undefined;
  }

  get count(): number {
    return this.passages.size;
  }

  markDirty(): void {
    this.dirty = true;
  }

  /**
   * Redraw.
   *
   * Culled by the edge midpoint plus a hex radius, which is more than the half-edge a
   * passage can extend past it — so nothing pops in at the screen border.
   */
  render(bounds: Bounds, zoom: number): void {
    if (!this.dirty && zoom === this.lastZoom) return;
    this.dirty = false;
    this.lastZoom = zoom;

    const px = 1 / Math.max(zoom, 1e-6);
    const g = this.graphics;
    g.clear();

    for (const passage of this.passages.values()) {
      if (
        passage.x + HEX_RADIUS < bounds.minX ||
        passage.x - HEX_RADIUS > bounds.maxX ||
        passage.y + HEX_RADIUS < bounds.minY ||
        passage.y - HEX_RADIUS > bounds.maxY
      ) {
        continue;
      }

      const ends = edgeEndpoints(passage.edge);
      if (!ends) continue;

      const [a, b] = ends;
      // Pulled in from the corners so the circles sit inside the edge rather than on the
      // junction where three hexes meet, which would make them ambiguous.
      const inset = 0.18;
      const p0 = { x: a.x + (b.x - a.x) * inset, y: a.y + (b.y - a.y) * inset };
      const p1 = { x: b.x - (b.x - a.x) * inset, y: b.y - (b.y - a.y) * inset };

      // A pale halo under everything, so the mark survives dark terrain and the hex grid.
      g.moveTo(p0.x, p0.y);
      g.lineTo(p1.x, p1.y);
      g.stroke({ color: PASSAGE_HALO, width: 7 * px, alpha: 0.75, cap: 'round' });

      g.moveTo(p0.x, p0.y);
      g.lineTo(p1.x, p1.y);
      g.stroke({ color: PASSAGE_COLOR, width: 3 * px, alpha: 0.95, cap: 'round' });

      for (const end of [p0, p1]) {
        g.circle(end.x, end.y, 5.5 * px);
        g.fill({ color: PASSAGE_HALO, alpha: 0.95 });
        g.circle(end.x, end.y, 5.5 * px);
        g.stroke({ color: PASSAGE_COLOR, width: 2.5 * px, alpha: 1 });
      }
    }
  }

  private lastZoom = -1;

  destroy(): void {
    this.container.destroy({ children: true });
    this.passages.clear();
    this.byEdge.clear();
  }
}
