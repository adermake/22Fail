/**
 * Label rendering — curved map text with outline.
 *
 * Curvature is the reason each glyph is its own `Text`: laying text along an arc means
 * positioning and rotating characters individually, which no single text object can do.
 * That is expensive, so a finished label is baked with `cacheAsTexture` and only re-baked
 * when its text or style actually changes — panning past a hundred labels then costs a
 * hundred cached sprites rather than a thousand live glyphs.
 */

import { Container, Text, TextStyle } from 'pixi.js';
import { LabelStyle, MapLabel } from './map-editor.model';
import { Bounds } from './map-camera';
import { SpatialIndex } from './spatial-index';

export function defaultLabelStyle(): LabelStyle {
  return {
    fontFamily: 'Georgia, serif',
    fontSize: 64,
    fill: '#2b2b2b',
    outline: '#f5f0e6',
    outlineWidth: 6,
    curvature: 0,
    letterSpacing: 2,
  };
}

interface LabelNode {
  container: Container;
  /** What the node was built from, so it is only rebuilt on real change. */
  signature: string;
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
  const sweep = bend * Math.PI * 0.9;
  const radius = totalWidth / Math.abs(sweep);

  let travelled = 0;
  for (const g of glyphs) {
    const centre = travelled + g.width / 2;
    const angle = (centre / totalWidth - 0.5) * sweep;

    // Bowing up puts the arc centre below the text, and vice versa.
    const dir = Math.sign(sweep);
    g.text.position.set(Math.sin(angle) * radius, dir * (radius - Math.cos(angle) * radius));
    g.text.rotation = angle;
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

  private build(label: MapLabel): LabelNode {
    const holder = new Container();
    const s = label.style;

    const style = new TextStyle({
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fill: s.fill,
      stroke: s.outlineWidth > 0 ? { color: s.outline, width: s.outlineWidth, join: 'round' } : undefined,
    });

    const glyphs: { text: Text; width: number }[] = [];
    let total = 0;

    for (const ch of [...label.text]) {
      const t = new Text({ text: ch, style });
      t.anchor.set(0.5);
      const w = (ch === ' ' ? s.fontSize * 0.3 : t.width) + s.letterSpacing;
      glyphs.push({ text: t, width: w });
      total += w;
      holder.addChild(t);
    }

    layoutGlyphs(glyphs, total, s.curvature);

    // Bake to a single texture; the glyph containers behind it never render again.
    holder.cacheAsTexture(true);

    return { container: holder, signature: signatureOf(label) };
  }

  /** Sync visible labels. Only rebuilds nodes whose text or style changed. */
  render(bounds: Bounds, showSecrets: boolean): void {
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
      if (!node || node.signature !== signatureOf(label)) {
        node?.container.destroy({ children: true });
        node = this.build(label);
        this.nodes.set(label.id, node);
        this.container.addChild(node.container);
      }

      node.container.position.set(label.x, label.y);
      node.container.rotation = label.rotation || 0;
      node.container.alpha = this.selected.has(label.id) ? 0.6 : label.vis === 'secret' ? 0.85 : 1;
      node.container.visible = true;
    }

    for (const [id, node] of [...this.nodes]) {
      if (wanted.has(id)) continue;
      node.container.destroy({ children: true });
      this.nodes.delete(id);
    }

    this.dirty = false;
  }

  get needsRefresh(): boolean {
    return this.dirty;
  }

  /** Label near a world point, using its baked bounds. */
  hitTest(x: number, y: number): MapLabel | null {
    let best: MapLabel | null = null;
    let bestDist = Infinity;

    for (const label of this.index.query({
      minX: x - 2048,
      minY: y - 2048,
      maxX: x + 2048,
      maxY: y + 2048,
    })) {
      const node = this.nodes.get(label.id);
      // Half the baked size is a good enough radius, and needs no per-glyph maths.
      const reach = node
        ? Math.max(node.container.width, node.container.height) / 2
        : label.style.fontSize;

      const d = Math.hypot(label.x - x, label.y - y);
      if (d <= reach && d < bestDist) {
        bestDist = d;
        best = label;
      }
    }
    return best;
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
