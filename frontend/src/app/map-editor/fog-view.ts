/**
 * Fog of war.
 *
 * ## Why this is a canvas and not a pile of hexes
 *
 * The obvious implementation — draw a dark hex over every unrevealed hex in view — does not
 * survive being zoomed out. A hex is 360 world px across, so at the zoom where one is still
 * three screen pixels wide a 1920px viewport spans about 640 of them across and 400 down:
 * a quarter of a million paths, rebuilt on every pan. And a campaign map is *mostly* fog,
 * so that is the normal case, not the pathological one.
 *
 * Turning it around fixes the scaling. Fog is a filled rectangle over the viewport with the
 * *revealed* hexes punched out of it, so the cost follows what the party has explored rather
 * than how much world is on screen. Punching holes needs `destination-out`, which a canvas
 * gives directly and Pixi 8 does not — it has no inverse mask, and erase blending needs its
 * own render target. So the fog is drawn into a canvas, uploaded as one texture, and stretched
 * over the visible bounds.
 *
 * Resolution is fixed rather than following the viewport: fog is a soft edge, nobody reads it
 * for detail, and pinning it means the upload cost cannot grow with the window.
 *
 * ## Two audiences
 *
 * Players get opaque fog — it has to actually hide. The GM gets the same shape at a fraction
 * of the opacity, so they can see what the party cannot while still knowing exactly where the
 * edge is. Drawing nothing for the GM would be the alternative, and it is worse: the whole
 * job of revealing fog is impossible if you cannot see it.
 */

import { Container, Sprite, Texture } from 'pixi.js';
import { Bounds } from './map-camera';
import { HEX_RADIUS, hexCorners, hexToWorld, parseHexKey } from './map-hex';

/** Canvas size for the fog texture. Ample for a soft edge, and independent of the window. */
const TEX_W = 1024;
const TEX_H = 768;

/**
 * Revealed hexes drawn per update.
 *
 * Beyond this the visible area is so thoroughly explored that fog has nothing left to hide,
 * and drawing a hundred thousand holes would cost more than the map underneath. Bailing out
 * to "no fog here" is both cheaper and, at that point, accurate.
 */
const MAX_HOLES = 20000;

export const FOG_COLOR = '#0b0d14';
/** Player opacity. Not 1.0: a hint of the coastline underneath keeps the map readable. */
export const FOG_ALPHA_PLAYER = 0.97;
/** GM opacity — enough to see the fog's edge, little enough to work through it. */
export const FOG_ALPHA_GM = 0.42;

export class FogView {
  readonly container = new Container();

  private canvas = document.createElement('canvas');
  private ctx = this.canvas.getContext('2d');
  private sprite = new Sprite();
  /**
   * One texture for the life of the view.
   *
   * Built once and re-uploaded in place. Creating a `Texture` per redraw — which is per pan —
   * churns a GPU allocation every frame the camera moves, and destroying the old one each
   * time makes the churn invisible until the map stutters.
   */
  private texture: Texture;

  /** What the last draw was for, so panning a pixel does not re-upload a texture. */
  private key = '';
  private enabled = false;

  constructor() {
    this.canvas.width = TEX_W;
    this.canvas.height = TEX_H;
    this.texture = Texture.from(this.canvas);
    this.sprite.texture = this.texture;
    this.container.addChild(this.sprite);
    this.container.visible = false;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    this.container.visible = on;
    if (!on) this.key = '';
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Force the next `update` to redraw, after the revealed set changed. */
  invalidate(): void {
    this.key = '';
  }

  /**
   * Redraw for the current view.
   *
   * `revision` is what makes a fog edit show up: the revealed set is a live object whose
   * contents change without its identity doing so, so the caller bumps a counter instead.
   */
  update(bounds: Bounds, revealed: ReadonlySet<string>, gm: boolean, revision: number): void {
    if (!this.enabled || !this.ctx) return;

    // Quantised so a slow pan does not redraw every frame for a sub-pixel shift.
    const q = (v: number) => Math.round(v / 64);
    const next = `${q(bounds.minX)},${q(bounds.minY)},${q(bounds.maxX)},${q(bounds.maxY)}:${gm}:${revision}`;
    if (next === this.key) return;
    this.key = next;

    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    if (w <= 0 || h <= 0) return;

    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, TEX_W, TEX_H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = gm ? FOG_ALPHA_GM : FOG_ALPHA_PLAYER;
    ctx.fillStyle = FOG_COLOR;
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    // World → canvas. One scale per axis, since the viewport is rarely 4:3.
    const sx = TEX_W / w;
    const sy = TEX_H / h;

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';

    let holes = 0;
    let overflowed = false;
    for (const key of revealed) {
      const hex = parseHexKey(key);
      if (!hex) continue;

      const centre = hexToWorld(hex);
      // Cheap reject before any trigonometry; the radius covers the hex's own extent.
      if (
        centre.x + HEX_RADIUS < bounds.minX ||
        centre.x - HEX_RADIUS > bounds.maxX ||
        centre.y + HEX_RADIUS < bounds.minY ||
        centre.y - HEX_RADIUS > bounds.maxY
      ) {
        continue;
      }

      if (++holes > MAX_HOLES) {
        overflowed = true;
        break;
      }

      // Slightly oversized, so neighbouring revealed hexes leave no seam between them.
      const corners = hexCorners(centre.x, centre.y, HEX_RADIUS * 1.02);
      ctx.beginPath();
      for (let i = 0; i < corners.length; i++) {
        const px = (corners[i].x - bounds.minX) * sx;
        const py = (corners[i].y - bounds.minY) * sy;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    if (overflowed) {
      // Everything in sight is explored; fog here would be noise, not concealment.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, TEX_W, TEX_H);
    }

    // The canvas is reused, so Pixi has to be told its pixels changed.
    this.texture.source.update();

    this.sprite.position.set(bounds.minX, bounds.minY);
    this.sprite.width = w;
    this.sprite.height = h;
  }

  destroy(): void {
    this.texture.destroy(true);
    this.container.destroy({ children: true });
  }
}
