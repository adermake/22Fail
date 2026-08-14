/**
 * Map Editor camera — world ↔ screen transforms and the visible-bounds query.
 *
 * Deliberately free of Pixi and Angular: it is plain arithmetic that the renderer, the
 * input handlers, the chunk streamer and the culler all have to agree on, so it is worth
 * being independently testable.
 *
 * `x`/`y` are the world coordinates under the *centre* of the viewport, which keeps
 * zoom-to-cursor and window resizes from drifting.
 */

import { Point } from '../model/lobby.model';

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 8;

export class MapCamera {
  x = 0;
  y = 0;
  zoom = 0.25;

  /** Viewport size in CSS px. */
  viewWidth = 1;
  viewHeight = 1;

  setViewport(width: number, height: number): void {
    this.viewWidth = Math.max(1, width);
    this.viewHeight = Math.max(1, height);
  }

  worldToScreen(wx: number, wy: number): Point {
    return {
      x: (wx - this.x) * this.zoom + this.viewWidth / 2,
      y: (wy - this.y) * this.zoom + this.viewHeight / 2,
    };
  }

  screenToWorld(sx: number, sy: number): Point {
    return {
      x: (sx - this.viewWidth / 2) / this.zoom + this.x,
      y: (sy - this.viewHeight / 2) / this.zoom + this.y,
    };
  }

  /** Pan by a screen-pixel delta (drag), converting to world units. */
  panByScreen(dxScreen: number, dyScreen: number): void {
    this.x -= dxScreen / this.zoom;
    this.y -= dyScreen / this.zoom;
  }

  /**
   * Zoom about a screen anchor, keeping the world point under the cursor pinned there —
   * without this, wheel-zoom slides the map out from under the pointer.
   */
  zoomAt(sx: number, sy: number, factor: number): void {
    const before = this.screenToWorld(sx, sy);
    this.zoom = clamp(this.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    const after = this.screenToWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  /** World-space rectangle currently on screen, optionally grown by a world-px margin. */
  visibleBounds(margin = 0): Bounds {
    const halfW = this.viewWidth / 2 / this.zoom;
    const halfH = this.viewHeight / 2 / this.zoom;
    return {
      minX: this.x - halfW - margin,
      minY: this.y - halfH - margin,
      maxX: this.x + halfW + margin,
      maxY: this.y + halfH + margin,
    };
  }

  /** Frame a world rectangle, leaving a little breathing room. */
  fitBounds(b: Bounds, padding = 1.1): void {
    const w = Math.max(1, b.maxX - b.minX);
    const h = Math.max(1, b.maxY - b.minY);
    this.x = (b.minX + b.maxX) / 2;
    this.y = (b.minY + b.maxY) / 2;
    this.zoom = clamp(
      Math.min(this.viewWidth / (w * padding), this.viewHeight / (h * padding)),
      MIN_ZOOM,
      MAX_ZOOM,
    );
  }

  snapshot(): { x: number; y: number; zoom: number } {
    return { x: this.x, y: this.y, zoom: this.zoom };
  }

  restore(s: { x: number; y: number; zoom: number }): void {
    this.x = s.x;
    this.y = s.y;
    this.zoom = clamp(s.zoom, MIN_ZOOM, MAX_ZOOM);
  }
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}
