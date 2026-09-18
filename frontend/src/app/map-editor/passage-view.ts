/**
 * Passages — a way through a hex edge: a pass, a ford, a gate.
 *
 * Drawn as a short `o—o` **across** the boundary, not along it: a circle in each hex joined
 * by a bar through the edge. Along the edge the same mark read as a wall, which is exactly
 * backwards — a line lying on a boundary says "here is the boundary", while one crossing it
 * says the two hexes are connected.
 *
 * ## Sized in world units, not screen units
 *
 * Everything here is a fixed number of world pixels, so a passage shrinks with the map as you
 * zoom out. The first version divided by the zoom to keep it constant on screen, which meant
 * that zoomed out to a continent the passages were the only thing still at full size — a
 * scatter of bright marks over a map that had faded to nothing. A passage is a feature of the
 * terrain and should recede with it.
 *
 * Everything lands in one `Graphics`. A map may carry hundreds of these along a mountain
 * range, and a display object each would be hundreds of draw calls for a pile of short
 * segments.
 */

import { Container, Graphics } from 'pixi.js';
import { MapPassage } from './map-editor.model';
import { Bounds } from './map-camera';
import { HEX_RADIUS, edgeCrossing } from './map-hex';

/** Warm ink, readable over both parchment land and open water. */
const PASSAGE_COLOR = 0x3a2a18;
const PASSAGE_HALO = 0xf2e6cc;

/**
 * How far the bar reaches across the boundary, in world pixels.
 *
 * A fifth of a hex's width — long enough that both circles sit clearly inside their own hex,
 * short enough that a row of passes along a mountain range does not turn into a hatched band.
 */
const CROSSING_LENGTH = HEX_RADIUS * 0.42;
const BAR_WIDTH = HEX_RADIUS * 0.035;
const HALO_WIDTH = BAR_WIDTH * 2.6;
const KNOB_RADIUS = HEX_RADIUS * 0.062;

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
    this.drawn = null;
  }

  /**
   * Redraw.
   *
   * Culled by the edge midpoint plus a hex radius, which is more than the crossing can reach
   * past it — so nothing pops in at the screen border.
   *
   * Independent of zoom, since every size here is in world units. That is also why the
   * redraw is keyed on a padded view: geometry only changes when a passage is added or
   * removed, or when the camera leaves what was last drawn.
   */
  render(bounds: Bounds): void {
    const fits =
      !this.dirty &&
      this.drawn !== null &&
      bounds.minX >= this.drawn.minX &&
      bounds.minY >= this.drawn.minY &&
      bounds.maxX <= this.drawn.maxX &&
      bounds.maxY <= this.drawn.maxY;
    if (fits) return;

    this.dirty = false;
    const padX = (bounds.maxX - bounds.minX) * 0.3;
    const padY = (bounds.maxY - bounds.minY) * 0.3;
    const area = {
      minX: bounds.minX - padX,
      minY: bounds.minY - padY,
      maxX: bounds.maxX + padX,
      maxY: bounds.maxY + padY,
    };
    this.drawn = area;

    const g = this.graphics;
    g.clear();

    for (const passage of this.passages.values()) {
      if (
        passage.x + HEX_RADIUS < area.minX ||
        passage.x - HEX_RADIUS > area.maxX ||
        passage.y + HEX_RADIUS < area.minY ||
        passage.y - HEX_RADIUS > area.maxY
      ) {
        continue;
      }

      const ends = edgeCrossing(passage.edge, CROSSING_LENGTH);
      if (!ends) continue;

      const [p0, p1] = ends;

      // A pale halo under everything, so the mark survives dark terrain and the hex grid.
      g.moveTo(p0.x, p0.y);
      g.lineTo(p1.x, p1.y);
      g.stroke({ color: PASSAGE_HALO, width: HALO_WIDTH, alpha: 0.75, cap: 'round' });

      g.moveTo(p0.x, p0.y);
      g.lineTo(p1.x, p1.y);
      g.stroke({ color: PASSAGE_COLOR, width: BAR_WIDTH, alpha: 0.95, cap: 'round' });

      for (const end of [p0, p1]) {
        g.circle(end.x, end.y, KNOB_RADIUS);
        g.fill({ color: PASSAGE_HALO, alpha: 0.95 });
        g.circle(end.x, end.y, KNOB_RADIUS);
        g.stroke({ color: PASSAGE_COLOR, width: BAR_WIDTH * 0.8, alpha: 1 });
      }
    }
  }

  /** The padded area the current drawing covers; null until the first render. */
  private drawn: Bounds | null = null;

  destroy(): void {
    this.container.destroy({ children: true });
    this.passages.clear();
    this.byEdge.clear();
  }
}
