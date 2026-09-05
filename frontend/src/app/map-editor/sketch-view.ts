/**
 * The sketch layer — freehand lines drawn over the map during play.
 *
 * **This never touches the map.** Strokes are vectors in their own container above the
 * terrain and its objects; nothing here writes a chunk, a detail tier or a raster of any
 * kind. That separation is the whole point: pointing at a route mid-session is a gesture, and
 * a gesture baked into the terrain would be permanent, indistinguishable from the map itself,
 * and would drag the tier machinery into what should be a scribble.
 *
 * Players draw here too — it is the one thing they may write to the document — so a stroke
 * records who drew it and the server checks that before it stores or deletes anything.
 */

import { Container, Graphics } from 'pixi.js';
import { SketchStroke } from './map-editor.model';
import { Bounds } from './map-camera';

/**
 * Colour an eraser stroke is drawn in.
 *
 * Irrelevant to what is seen — the blend mode discards the colour and keeps only coverage —
 * but it has to be *something*, and white keeps the live preview legible while dragging.
 */
export const ERASER_COLOR = '#ffffff';

export class SketchView {
  readonly container = new Container();

  private finished = new Graphics();
  /** Rubbing-out strokes, blended to remove rather than cover. */
  private erased = new Graphics();
  /** The line currently under the pointer, redrawn every move; kept apart so the rest is not. */
  private live = new Graphics();

  private strokes = new Map<string, SketchStroke>();
  private dirty = true;

  constructor() {
    this.erased.blendMode = 'erase';
    this.container.addChild(this.finished, this.erased, this.live);
  }

  rebuild(strokes: readonly SketchStroke[]): void {
    this.strokes.clear();
    for (const s of strokes) this.strokes.set(s.id, s);
    this.dirty = true;
  }

  add(stroke: SketchStroke): void {
    this.strokes.set(stroke.id, stroke);
    this.dirty = true;
  }

  remove(id: string): void {
    this.strokes.delete(id);
    this.dirty = true;
  }

  clear(): void {
    this.strokes.clear();
    this.dirty = true;
  }

  get count(): number {
    return this.strokes.size;
  }

  allIds(): string[] {
    return [...this.strokes.keys()];
  }

  /** Ids drawn by one author, for "clear my own lines". */
  idsBy(author: string): string[] {
    const out: string[] = [];
    for (const [id, s] of this.strokes) if (s.author === author) out.push(id);
    return out;
  }

  /**
   * Draw the line in progress.
   *
   * Separate from the committed strokes so a drag redraws a handful of segments rather than
   * every line on the map — a session's worth of scribbling would otherwise get slower the
   * longer it went on.
   */
  drawLive(points: readonly { x: number; y: number }[], color: string, width: number): void {
    this.live.clear();
    strokePath(this.live, points, color, width);
  }

  /**
   * Rebuild committed strokes into the layer.
   *
   * Erasing needs the whole sketch to be its own render target: `destination-out` only
   * removes what is already drawn *in the same target*, so with the strokes going straight
   * onto the stage an eraser would punch a hole through the map itself.
   */
  private ensureRenderGroup(): void {
    if (!this.container.isRenderGroup) this.container.enableRenderGroup();
  }

  endLive(): void {
    this.live.clear();
  }

  /**
   * Redraw committed strokes.
   *
   * Everything lands in one `Graphics`: these are short polylines, and a display object each
   * would mean a draw call per scribble for no gain.
   */
  render(bounds: Bounds): void {
    if (!this.dirty) return;
    this.dirty = false;

    this.ensureRenderGroup();
    this.finished.clear();

    /*
     * Erasers are drawn in their own pass, after everything else.
     *
     * One `Graphics` cannot mix blend modes, and order matters anyway: an eraser only has
     * meaning against the lines already down, so replaying strokes strictly in draw order
     * would need a Graphics per switch between drawing and erasing. Two passes give the
     * right result for the only case that matters — rubbing out what is already there.
     */
    for (const stroke of this.strokes.values()) {
      if (stroke.erase || !overlapsStroke(stroke, bounds)) continue;
      strokePath(this.finished, stroke.points, stroke.color, stroke.width);
    }

    this.erased.clear();
    for (const stroke of this.strokes.values()) {
      if (!stroke.erase || !overlapsStroke(stroke, bounds)) continue;
      strokePath(this.erased, stroke.points, ERASER_COLOR, stroke.width);
    }
  }

  markDirty(): void {
    this.dirty = true;
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.strokes.clear();
  }
}

function strokePath(
  g: Graphics,
  points: readonly { x: number; y: number }[],
  color: string,
  width: number,
): void {
  if (points.length === 0) return;

  // A single tap should still leave a mark, or a click that does not travel looks broken.
  if (points.length === 1) {
    g.circle(points[0].x, points[0].y, width / 2);
    g.fill({ color, alpha: 0.9 });
    return;
  }

  g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
  g.stroke({ color, width, alpha: 0.9, cap: 'round', join: 'round' });
}

/** Cheap viewport test over a stroke's own extent. */
function overlapsStroke(stroke: SketchStroke, b: Bounds): boolean {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of stroke.points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = stroke.width;
  return minX - pad <= b.maxX && maxX + pad >= b.minX && minY - pad <= b.maxY && maxY + pad >= b.minY;
}
