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
import { worldToKm } from './map-hex';

/** How long a ping stays on screen. Long enough to look at, short enough not to litter. */
export const PING_MS = 2600;

export interface Ping {
  id: string;
  x: number;
  y: number;
  color: string;
  by: string;
  /** Local arrival time; pings expire on the viewer's clock, not the sender's. */
  at: number;
}

export interface MeasureLine {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  by: string;
}

/** Straight-line distance in km, via the hex pitch the map is built on. */
export function measureKm(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return worldToKm(Math.hypot(b.x - a.x, b.y - a.y));
}

export class PlayAidsView {
  readonly container = new Container();

  private tokenGfx = new Graphics();
  private measureGfx = new Graphics();
  private pingGfx = new Graphics();
  private labels = new Container();

  private tokens = new Map<string, MapToken>();
  private labelPool: Text[] = [];
  private labelsUsed = 0;

  constructor() {
    this.container.addChild(this.tokenGfx, this.measureGfx, this.pingGfx, this.labels);
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
   * One pass for all three because they share the label pool and all depend on zoom: outlines
   * and text are kept at a constant *screen* size, so a token does not become a hairline when
   * you zoom out to look at the whole continent.
   */
  render(
    bounds: Bounds,
    zoom: number,
    pings: readonly Ping[],
    lines: readonly MeasureLine[],
    selectedTokenId: string | null,
    now: number,
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

    this.measureGfx.clear();
    for (const line of lines) {
      this.measureGfx.moveTo(line.start.x, line.start.y);
      this.measureGfx.lineTo(line.end.x, line.end.y);
      this.measureGfx.stroke({ color: 0xffd166, width: 2 * px, alpha: 0.9 });

      this.measureGfx.circle(line.end.x, line.end.y, 4 * px);
      this.measureGfx.fill({ color: 0xffd166, alpha: 0.9 });

      const km = measureKm(line.start, line.end);
      this.label(
        `${km.toFixed(1)} km`,
        (line.start.x + line.end.x) / 2,
        (line.start.y + line.end.y) / 2,
        zoom,
        0xffd166,
      );
    }

    this.pingGfx.clear();
    for (const ping of pings) {
      const age = (now - ping.at) / PING_MS;
      if (age < 0 || age > 1) continue;

      // Three rings expanding out of the point, fading as they go.
      for (let i = 0; i < 3; i++) {
        const phase = age + i * 0.22;
        if (phase > 1) continue;
        this.pingGfx.circle(ping.x, ping.y, 10 * px + phase * 90 * px);
        this.pingGfx.stroke({ color: ping.color, width: 2.5 * px, alpha: (1 - phase) * 0.9 });
      }
      if (ping.by) this.label(ping.by, ping.x, ping.y - 26 * px, zoom, 0xffffff);
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
