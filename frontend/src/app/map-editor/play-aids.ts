/**
 * Pings, the ruler and tokens — the things that only exist while people are playing.
 *
 * Pings and ruler lines are *gestures, not edits*. They never enter the document: persisting
 * a ping would mean the map remembered where somebody pointed three sessions ago. They travel
 * on their own socket messages, are drawn here, and are forgotten. Tokens are the opposite —
 * where a figure stands survives the session — so those are ordinary map objects and only
 * their drawing lives here.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Bounds } from './map-camera';
import { MapToken } from './map-editor.model';
import { KM_PER_HEX, hexDistance, worldToHex } from './map-hex';

/** Dash pattern along a segment, in world units. */
export function dashSegments(
  a: { x: number; y: number },
  b: { x: number; y: number },
  dash: number,
  gap: number,
): { from: { x: number; y: number }; to: { x: number; y: number } }[] {
  const total = Math.hypot(b.x - a.x, b.y - a.y);
  const out: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
  if (total <= 0 || dash <= 0) return out;

  const ux = (b.x - a.x) / total;
  const uy = (b.y - a.y) / total;
  const step = dash + Math.max(0, gap);

  // Capped so a ruler dragged across a continent cannot emit tens of thousands of segments.
  const maxDashes = 2000;
  for (let i = 0, d = 0; d < total && i < maxDashes; i++, d += step) {
    const end = Math.min(d + dash, total);
    out.push({
      from: { x: a.x + ux * d, y: a.y + uy * d },
      to: { x: a.x + ux * end, y: a.y + uy * end },
    });
  }
  return out;
}

export interface MeasureLine {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  by: string;
}

/**
 * Distance in km, counted in **hex steps** rather than straight-line pixels.
 *
 * This is what the old map reported and what the table expects: movement happens hex by hex,
 * so "how far is that" means "how many hexes", and a euclidean answer disagrees with the
 * grid the party is counting on. Both ends are snapped to hex centres before this is called.
 */
export function measureKm(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return hexDistance(worldToHex(a.x, a.y), worldToHex(b.x, b.y)) * KM_PER_HEX;
}

export class PlayAidsView {
  readonly container = new Container();

  private tokenGfx = new Graphics();
  private measureGfx = new Graphics();
  private labels = new Container();

  private tokens = new Map<string, MapToken>();
  private labelPool: Text[] = [];
  private labelsUsed = 0;

  constructor() {
    this.container.addChild(this.tokenGfx, this.measureGfx, this.labels);
  }

  setTokens(tokens: readonly MapToken[]): void {
    this.tokens.clear();
    for (const t of tokens) this.tokens.set(t.id, t);
  }

  addToken(token: MapToken): void {
    this.tokens.set(token.id, token);
  }

  removeToken(id: string): void {
    this.tokens.delete(id);
  }

  getToken(id: string): MapToken | undefined {
    return this.tokens.get(id);
  }

  /** Token under a world point, topmost first — tokens overlap constantly in a scrum. */
  tokenAt(x: number, y: number): MapToken | null {
    let best: MapToken | null = null;
    for (const t of this.tokens.values()) {
      const r = t.size / 2;
      if (Math.hypot(t.x - x, t.y - y) <= r && (!best || t.y > best.y)) best = t;
    }
    return best;
  }

  /**
   * Redraw everything transient.
   *
   * Tokens and the ruler share a label pool and both depend on zoom: outlines and text are
   * kept at a constant *screen* size, so a token does not become a hairline when you zoom out
   * to look at the whole continent.
   *
   * Pings are **not** here. They are drawn by the shared `app-ping-layer` overlay, the same
   * one the lobby and the old world map use, so they animate and sound identical everywhere.
   */
  render(
    bounds: Bounds,
    zoom: number,
    lines: readonly MeasureLine[],
    selectedTokenId: string | null,
  ): void {
    const px = 1 / Math.max(zoom, 1e-6);
    this.labelsUsed = 0;

    this.tokenGfx.clear();
    for (const t of this.tokens.values()) {
      const r = t.size / 2;
      if (t.x + r < bounds.minX || t.x - r > bounds.maxX) continue;
      if (t.y + r < bounds.minY || t.y - r > bounds.maxY) continue;

      this.tokenGfx.circle(t.x, t.y, r);
      this.tokenGfx.fill({ color: t.color, alpha: 0.9 });
      this.tokenGfx.circle(t.x, t.y, r);
      this.tokenGfx.stroke({
        color: t.id === selectedTokenId ? 0xffffff : 0x101014,
        width: (t.id === selectedTokenId ? 3 : 1.5) * px,
        alpha: 0.95,
      });

      // Names only once a token is big enough on screen to sit under one.
      if (r * zoom > 12) this.label(t.name, t.x, t.y + r + 8 * px, zoom, 0xffffff);
    }

    /*
     * The ruler's look is copied from the old map deliberately: a dark casing under a dashed
     * amber line, with ringed endpoints. Plain amber vanished over parchment and desert, and
     * the outline is what makes it readable over any terrain.
     */
    this.measureGfx.clear();
    for (const line of lines) {
      for (const seg of dashSegments(line.start, line.end, 10 * px, 5 * px)) {
        this.measureGfx.moveTo(seg.from.x, seg.from.y);
        this.measureGfx.lineTo(seg.to.x, seg.to.y);
      }
      this.measureGfx.stroke({ color: 0x0f172a, width: 7 * px, alpha: 0.85, cap: 'round' });

      for (const seg of dashSegments(line.start, line.end, 10 * px, 5 * px)) {
        this.measureGfx.moveTo(seg.from.x, seg.from.y);
        this.measureGfx.lineTo(seg.to.x, seg.to.y);
      }
      this.measureGfx.stroke({ color: 0xf59e0b, width: 3 * px, alpha: 1, cap: 'round' });

      for (const pt of [line.start, line.end]) {
        this.measureGfx.circle(pt.x, pt.y, 7 * px);
        this.measureGfx.fill({ color: 0x0f172a, alpha: 0.9 });
        this.measureGfx.circle(pt.x, pt.y, 5 * px);
        this.measureGfx.fill({ color: 0xf59e0b, alpha: 1 });
        this.measureGfx.circle(pt.x, pt.y, 5 * px);
        this.measureGfx.stroke({ color: 0xffffff, width: 1.5 * px, alpha: 1 });
      }

      const km = measureKm(line.start, line.end);
      this.label(
        `${km.toFixed(1)} km`,
        (line.start.x + line.end.x) / 2,
        (line.start.y + line.end.y) / 2 - 22 * px,
        zoom,
        0xfbbf24,
      );
    }

    // Retire labels this pass did not claim.
    for (let i = this.labelsUsed; i < this.labelPool.length; i++) {
      this.labelPool[i].visible = false;
    }
  }

  /**
   * Place a pooled text label.
   *
   * Pooled because `Text` allocates a texture per instance: creating them per frame for
   * tokens and rulers churned enough GPU memory to matter during a long session.
   */
  private label(text: string, x: number, y: number, zoom: number, color: number): void {
    let node = this.labelPool[this.labelsUsed];
    if (!node) {
      node = new Text({
        text,
        style: new TextStyle({ fontFamily: 'sans-serif', fontSize: 14, fill: color }),
      });
      node.anchor.set(0.5, 0);
      this.labelPool.push(node);
      this.labels.addChild(node);
    }
    this.labelsUsed++;

    if (node.text !== text) node.text = text;
    node.style.fill = color;
    node.visible = true;
    node.position.set(x, y);
    // Counter-scaled, so text stays the same size on screen at any zoom.
    node.scale.set(1 / Math.max(zoom, 1e-6));
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.tokens.clear();
    this.labelPool = [];
  }
}
