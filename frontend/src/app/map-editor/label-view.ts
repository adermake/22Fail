/**
 * Label rendering — curved map text with outline.
 *
 * Curvature is the reason each glyph is its own `Text`: laying text along an arc means
 * positioning and rotating characters individually, which no single text object can do.
 * That is expensive, so a finished label is baked with `cacheAsTexture` and only re-baked
 * when its text or style actually changes — panning past a hundred labels then costs a
 * hundred cached sprites rather than a thousand live glyphs.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { LabelStyle, MapLabel } from './map-editor.model';
import { Bounds } from './map-camera';
import { SpatialIndex } from './spatial-index';

export function defaultLabelStyle(): LabelStyle {
  return {
    fontFamily: 'Georgia, serif',
    fontSize: 220,
    fill: '#2b2b2b',
    outline: '#f5f0e6',
    outlineWidth: 20,
    curvature: 0,
    letterSpacing: 8,
  };
}

interface LabelNode {
  container: Container;
  /** What the node was built from, so it is only rebuilt on real change. */
  signature: string;
  /** Oversampling factor used for the bake, so a big zoom change can trigger a re-bake. */
  bakedAt: number;
}

/** Everything that affects the baked glyphs. Position and visibility are applied live. */
function signatureOf(label: MapLabel): string {
  const s = label.style;
  return [
    label.text,
    s.fontFamily,
    s.fontSize,
    s.fill,
    s.outline,
    s.outlineWidth,
    s.curvature,
    s.letterSpacing,
  ].join('|');
}

/**
 * Lay out glyphs along a circular arc.
 *
 * `curvature` runs -1 … 1. Zero is a straight baseline; the sign decides which way the arc
 * bows. The radius is derived from the text's own width so a given curvature looks the same
 * on a short name and a long one — a fixed radius would bend "Ur" into a circle while
 * leaving "Kingdom of the Broken Coast" nearly flat.
 */
function layoutGlyphs(
  glyphs: { text: Text; width: number }[],
  totalWidth: number,
  curvature: number,
): void {
  const bend = Math.max(-1, Math.min(1, curvature));

  if (Math.abs(bend) < 0.001) {
    let x = -totalWidth / 2;
    for (const g of glyphs) {
      g.text.position.set(x + g.width / 2, 0);
      g.text.rotation = 0;
      x += g.width;
    }
    return;
  }

  // Total sweep grows with curvature; radius follows from arc length = radius × angle.
  const sweepMag = Math.abs(bend) * Math.PI * 0.9;
  const radius = totalWidth / sweepMag;
  const up = bend < 0;

  let travelled = 0;
  for (const g of glyphs) {
    const centre = travelled + g.width / 2;
    const angle = (centre / totalWidth - 0.5) * sweepMag;

    /*
     * The arc centre sits on the opposite side from the bow, and *both* the offset and the
     * glyph rotation have to flip with it. Flipping only the offset — as the first version
     * did — left every glyph tilted the wrong way on an upward bow, so the text appeared to
     * twist as it rose.
     */
    const sag = radius - Math.cos(angle) * radius;
    g.text.position.set(Math.sin(angle) * radius, up ? -sag : sag);
    g.text.rotation = up ? -angle : angle;

    travelled += g.width;
  }
}

export class LabelView {
  readonly container = new Container();
  readonly index = new SpatialIndex<MapLabel>();

  private nodes = new Map<string, LabelNode>();
  private labels = new Map<string, MapLabel>();
  private selected = new Set<string>();
  private dirty = true;
  /** Selection outlines. Without one, a selected label is indistinguishable from any other. */
  private highlight = new Graphics();

  constructor() {
    this.container.addChild(this.highlight);
  }

  /** Bounding box of a rendered label, for the selection outline and box-select. */
  boundsOf(id: string): { x: number; y: number; w: number; h: number } | null {
    const label = this.labels.get(id);
    if (!label) return null;

    // Derived from `halfExtents` so the outline, the hit test and the secret overview all
    // agree on how big a label is; they drifted when each measured it its own way.
    const { rx, ry } = this.halfExtents(label);
    return { x: label.x - rx, y: label.y - ry, w: rx * 2, h: ry * 2 };
  }

  /** The same box as `Bounds`, which is what the overview and box-select speak. */
  worldBounds(label: MapLabel): Bounds {
    const { rx, ry } = this.halfExtents(label);
    return { minX: label.x - rx, minY: label.y - ry, maxX: label.x + rx, maxY: label.y + ry };
  }

  rebuild(labels: MapLabel[]): void {
    for (const node of this.nodes.values()) node.container.destroy({ children: true });
    this.nodes.clear();
    this.labels.clear();
    for (const l of labels) this.labels.set(l.id, l);
    this.index.rebuild(labels);
    this.dirty = true;
  }

  add(label: MapLabel): void {
    this.labels.set(label.id, label);
    this.index.insert(label);
    this.dirty = true;
  }

  update(label: MapLabel): void {
    this.labels.set(label.id, label);
    this.index.update(label);
    this.dirty = true;
  }

  remove(id: string): void {
    this.labels.delete(id);
    this.index.remove(id);
    const node = this.nodes.get(id);
    if (node) {
      node.container.destroy({ children: true });
      this.nodes.delete(id);
    }
    this.dirty = true;
  }

  get(id: string): MapLabel | undefined {
    return this.labels.get(id);
  }

  setSelection(ids: Iterable<string>): void {
    this.selected = new Set(ids);
    this.dirty = true;
  }

  markDirty(): void {
    this.dirty = true;
  }

  private build(label: MapLabel, zoom: number): LabelNode {
    const holder = new Container();
    const s = label.style;

    /*
     * Glyphs are rasterised at the size they will occupy *on screen*, then scaled back down
     * into world units. Baking at world size and letting the camera magnify the result is
     * what made labels look soft and pixelated — the texture was rendered once at, say, 64px
     * and then blown up. Clamped so a deep zoom cannot ask for a 4000px glyph atlas.
     */
    const target = Math.max(1, Math.min(6, zoom));
    const style = new TextStyle({
      fontFamily: s.fontFamily,
      fontSize: s.fontSize * target,
      fill: s.fill,
      stroke:
        s.outlineWidth > 0
          ? { color: s.outline, width: s.outlineWidth * target, join: 'round' }
          : undefined,
    });

    const glyphs: { text: Text; width: number }[] = [];
    let total = 0;

    for (const ch of [...label.text]) {
      const t = new Text({ text: ch, style });
      t.anchor.set(0.5);
      const w = (ch === ' ' ? s.fontSize * target * 0.3 : t.width) + s.letterSpacing * target;
      glyphs.push({ text: t, width: w });
      total += w;
      holder.addChild(t);
    }

    layoutGlyphs(glyphs, total, s.curvature);

    // Bake to a single texture; the glyph containers behind it never render again.
    holder.cacheAsTexture(true);

    // Scale the oversampled bake back into world units.
    const wrapper = new Container();
    wrapper.addChild(holder);
    wrapper.scale.set(1 / target);

    return { container: wrapper, signature: signatureOf(label), bakedAt: target };
  }

  /** Sync visible labels. Only rebuilds nodes whose text or style changed. */
  render(bounds: Bounds, showSecrets: boolean, zoom = 1): void {
    const visible = this.index.query({
      minX: bounds.minX - 2048,
      minY: bounds.minY - 2048,
      maxX: bounds.maxX + 2048,
      maxY: bounds.maxY + 2048,
    });

    const wanted = new Set<string>();

    for (const label of visible) {
      if (label.vis === 'secret' && !showSecrets) continue;
      if (!label.text) continue;
      wanted.add(label.id);

      let node = this.nodes.get(label.id);

      // Re-bake when the text or style changed, or when the zoom has moved far enough that
      // the existing bake would visibly soften. The threshold keeps this off the hot path
      // during ordinary panning and small zoom steps.
      const wantScale = Math.max(1, Math.min(6, zoom));
      const stale =
        !node ||
        node.signature !== signatureOf(label) ||
        wantScale > node.bakedAt * 1.6 ||
        wantScale < node.bakedAt / 2.5;

      if (stale || !node) {
        node?.container.destroy({ children: true });
        node = this.build(label, zoom);
        this.nodes.set(label.id, node);
        this.container.addChild(node.container);
      }

      node.container.position.set(label.x, label.y);
      node.container.rotation = label.rotation || 0;
      node.container.alpha = label.vis === 'secret' ? 0.85 : 1;
      node.container.visible = true;
    }

    for (const [id, node] of [...this.nodes]) {
      if (wanted.has(id)) continue;
      node.container.destroy({ children: true });
      this.nodes.delete(id);
    }

    this.drawHighlight(zoom);
    this.dirty = false;
  }

  private drawHighlight(zoom: number): void {
    const g = this.highlight;
    g.clear();
    if (this.selected.size === 0) return;

    const pad = 6 / zoom;
    for (const id of this.selected) {
      const b = this.boundsOf(id);
      if (!b) continue;
      g.rect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
    }
    g.stroke({ width: 1.5 / zoom, color: 0x8fd0ff, alpha: 0.95 });

    // Keep the outline above the glyphs it frames.
    this.container.setChildIndex(g, this.container.children.length - 1);
  }

  get needsRefresh(): boolean {
    return this.dirty;
  }

  /**
   * Half-extents of a label's baked box, or a font-size guess before it has been drawn.
   *
   * Separate from the hit test because the secret overview frames labels with the same box
   * it picks them by; two independent notions of "how big is this label" would drift.
   */
  halfExtents(label: MapLabel): { rx: number; ry: number } {
    const node = this.nodes.get(label.id);
    // A minimum keeps a tiny label from becoming unclickable at low zoom.
    const rx = Math.max(node ? node.container.width / 2 : label.text.length * label.style.fontSize * 0.3, 8);
    const ry = Math.max(node ? node.container.height / 2 : label.style.fontSize, 8);
    return { rx, ry };
  }

  /**
   * Label near a world point, with how deep inside its box the point falls (0 = dead centre,
   * 1 = right on the edge). The score lets a caller weigh this hit against a symbol's.
   *
   * The reach is an *ellipse* over the baked box, not a circle of half its longest side. A
   * circle meant a wide label like "Das Nördliche Königreich" claimed a radius of half its
   * width in every direction, including straight up and down where no glyph comes near —
   * so it swallowed every symbol around it and nothing else could be picked.
   */
  hitTestScored(x: number, y: number): { label: MapLabel; score: number } | null {
    let best: MapLabel | null = null;
    let bestScore = Infinity;

    for (const label of this.index.query({
      minX: x - 2048,
      minY: y - 2048,
      maxX: x + 2048,
      maxY: y + 2048,
    })) {
      const { rx, ry } = this.halfExtents(label);
      const dx = (label.x - x) / rx;
      const dy = (label.y - y) / ry;
      const score = Math.hypot(dx, dy);
      if (score <= 1 && score < bestScore) {
        bestScore = score;
        best = label;
      }
    }
    return best ? { label: best, score: bestScore } : null;
  }

  /** Label near a world point, using its baked bounds. */
  hitTest(x: number, y: number): MapLabel | null {
    return this.hitTestScored(x, y)?.label ?? null;
  }

  inRect(rect: Bounds): MapLabel[] {
    return this.index
      .query(rect)
      .filter(l => l.x >= rect.minX && l.x <= rect.maxX && l.y >= rect.minY && l.y <= rect.maxY);
  }

  destroy(): void {
    for (const node of this.nodes.values()) node.container.destroy({ children: true });
    this.nodes.clear();
    this.labels.clear();
    this.index.clear();
    this.container.destroy({ children: true });
  }
}
