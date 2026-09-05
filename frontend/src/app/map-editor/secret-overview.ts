/**
 * The secret overview — the eye tool in the Geheimnisse tab.
 *
 * Auditing secrets on a finished map is a counting problem, not a drawing one. With hundreds
 * of them the question is never "what does this one contain" but "which of these did I forget
 * to hide", and clicking through them one at a time to find out is hopeless. So the overview
 * answers it at a glance:
 *
 *  - the map behind is dimmed, so the marks are the only bright thing;
 *  - every secret group is framed in green, with each member ringed, so it is obvious what
 *    belongs to what — the grouping is otherwise invisible;
 *  - labels that are *not* secret are framed in red, because those are the misses, and a
 *    forgotten castle name gives the location away as surely as the castle icon would.
 *
 * Red marks only labels, not every public symbol: a map is mostly public forest and hills,
 * and ringing all of it in red would bury the handful of names that actually matter.
 *
 * Drawing is one `Graphics` per pass rather than a node per group. A map with 300 groups on
 * screen would otherwise mean thousands of display objects rebuilt on every pan.
 */

import { Container, Graphics } from 'pixi.js';
import { Bounds } from './map-camera';

/** One member of a group, in world space. */
export interface OverviewItem {
  bounds: Bounds;
}

export interface OverviewGroup {
  id: string;
  members: OverviewItem[];
  /** The group the panel is focused on, drawn brighter than the rest. */
  active: boolean;
}

const GREEN = 0x4ade80;
const RED = 0xf87171;
/** Selection. Deliberately neither of the audit colours, so it never reads as a verdict. */
const SELECT = 0xffffff;

/** Union of several boxes, or null for none. */
export function unionBounds(boxes: readonly Bounds[]): Bounds | null {
  if (!boxes.length) return null;
  let { minX, minY, maxX, maxY } = boxes[0];
  for (const b of boxes) {
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }
  return { minX, minY, maxX, maxY };
}

export function padBounds(b: Bounds, pad: number): Bounds {
  return { minX: b.minX - pad, minY: b.minY - pad, maxX: b.maxX + pad, maxY: b.maxY + pad };
}

export function boundsOverlap(a: Bounds, b: Bounds): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export class SecretOverview {
  readonly container = new Container();
  private frames = new Graphics();
  private selection = new Graphics();

  /**
   * The audit marks and the selection marks are separate passes on purpose.
   *
   * The overview is a view option, not a mode: you turn it on to find what you missed and
   * then fix it without turning it off again. So selection has to stay visible whether the
   * audit is on or not, which two `Graphics` give for free and one would not.
   */
  private auditOn = false;

  constructor() {
    this.container.addChild(this.frames, this.selection);
  }

  setAudit(on: boolean): void {
    this.auditOn = on;
    if (!on) this.frames.clear();
  }

  get auditVisible(): boolean {
    return this.auditOn;
  }

  /**
   * Outline whatever is selected, in any collection.
   *
   * Alpha alone could not do this job. A selected symbol was drawn at 0.65 and a secret one
   * at 0.5 — two barely different fades on artwork of every possible colour, which on a busy
   * map is no signal at all. A box does not depend on what is underneath it.
   */
  drawSelection(boxes: readonly Bounds[], zoom: number): void {
    const g = this.selection;
    g.clear();
    if (!boxes.length) return;

    const px = 1 / Math.max(zoom, 1e-6);
    for (const box of boxes) {
      const b = padBounds(box, 8 * px);
      g.rect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
      g.fill({ color: SELECT, alpha: 0.1 });
      // Dashes would be nicer but cost a path per segment; two weights read as a marquee.
      g.stroke({ color: SELECT, width: 2.5 * px, alpha: 0.95 });
    }
  }

  /**
   * Redraw the marks.
   *
   * `zoom` keeps every line one pixel wide on screen regardless of how far out the camera
   * is: a world-space stroke width would vanish when zoomed out, which is exactly the view
   * this tool exists for.
   */
  draw(groups: readonly OverviewGroup[], looseLabels: readonly Bounds[], zoom: number): void {
    const g = this.frames;
    g.clear();
    if (!this.auditOn) return;

    const px = 1 / Math.max(zoom, 1e-6);
    const pad = 12 * px;

    for (const box of looseLabels) {
      const b = padBounds(box, pad);
      g.rect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
      g.fill({ color: RED, alpha: 0.14 });
      g.stroke({ color: RED, width: 2 * px, alpha: 0.95 });
    }

    for (const group of groups) {
      // Each member ringed, so a group spread across a valley still reads as one thing.
      for (const m of group.members) {
        const b = padBounds(m.bounds, pad * 0.5);
        g.rect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
        g.stroke({ color: GREEN, width: 1.5 * px, alpha: 0.75 });
      }

      const box = unionBounds(group.members.map(m => m.bounds));
      if (!box) continue;

      const b = padBounds(box, pad * 2);
      g.rect(b.minX, b.minY, b.maxX - b.minX, b.maxY - b.minY);
      g.fill({ color: GREEN, alpha: group.active ? 0.2 : 0.1 });
      g.stroke({
        color: GREEN,
        width: (group.active ? 3.5 : 2) * px,
        alpha: group.active ? 1 : 0.8,
      });
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
