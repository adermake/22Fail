/**
 * Pixi scene graph, camera wiring and overlays for the map editor.
 *
 * The camera transform lives on a single `worldRoot` container, so every layer works in
 * plain world coordinates and nothing downstream has to know about pan or zoom.
 *
 * Phase 0 draws the raster layers directly (tinted by coverage) purely so the chunk
 * pipeline is visible end-to-end. Phase 1 replaces that with the real terrain compositing,
 * and Phase 5 with the noise-warped coastline shader.
 */

import { Application, Container, Graphics, Renderer, Sprite, Texture } from 'pixi.js';
import { MapCamera } from './map-camera';
import {
  HEX_RADIUS,
  HEX_X_SPACING,
  HEX_Y_SPACING,
  hexCorners,
  hexRangeForBounds,
  hexToWorld,
} from './map-hex';

/** Below this on-screen hex size the grid reads as noise, so it is hidden entirely. */
const MIN_HEX_SCREEN_PX = 9;

/** Hard ceiling on grid hexes per rebuild, so a pathological zoom cannot stall a frame. */
const MAX_GRID_HEXES = 20000;

export class MapRenderer {
  app = new Application();
  camera = new MapCamera();

  /** Camera transform applied here; children are all in world coordinates. */
  worldRoot = new Container();

  /**
   * Open sea behind everything.
   *
   * Terrain only exists where a chunk mesh does, so any area without one showed the page
   * background instead — which is why zooming out flashed grey at the edges before the new
   * cells caught up. A backdrop in the water colour means uncovered map reads as ocean,
   * which is what it actually is, and the catch-up becomes invisible.
   */
  private oceanBackdrop = new Sprite(Texture.WHITE);

  /** Terrain meshes are parented here by `TerrainView`. */
  terrainLayer = new Container();
  /**
   * A flat veil over the finished terrain, used by the secret overview.
   *
   * Between terrain and objects on purpose: the point of that mode is to push the *map* back
   * so the marks stand out, while symbols and labels stay legible enough to recognise what is
   * being marked. A veil over everything would hide the very things being audited.
   */
  private dimVeil = Object.assign(new Sprite(Texture.WHITE), { visible: false });
  /** Vector content (regions, symbols, labels) lands here in later phases. */
  objectLayer = new Container();
  private gridLayer = new Graphics();
  /**
   * Alignment overlays drawn over the finished map — currently the landmass image waiting
   * to be stamped.
   *
   * Above the terrain and its objects because the point of it is to be lined up against
   * them, and under the grid and cursor because those are the tools you line it up *with*.
   */
  overlayLayer = new Container();
  /** Brush outline / lake preview, drawn in world space above everything. */
  cursorLayer = new Container();

  private showGrid = true;
  /** Grid rebuild key — avoids regenerating thousands of paths on every pan frame. */
  private gridKey = '';

  /** True once the GPU context is gone; nothing will render again until a reload. */
  contextLost = false;
  onContextLost?: () => void;

  async init(host: HTMLElement, background = 0x1b1b1f): Promise<void> {
    await this.app.init({
      resizeTo: host,
      background,
      antialias: true,
      // Painting reads back from render textures; without this the GPU cannot be trusted
      // to have preserved the drawing buffer.
      preserveDrawingBuffer: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    host.appendChild(this.app.canvas);

    /*
     * A lost context is what a blank grey canvas that stops responding actually is: every
     * GPU resource is gone and nothing will draw again without a full rebuild. It is
     * otherwise indistinguishable from a hang, so report it loudly and tell the user the
     * one thing that helps.
     */
    this.app.canvas.addEventListener('webglcontextlost', (e: Event) => {
      e.preventDefault();
      this.contextLost = true;
      console.error(
        '[MapRenderer] WebGL context lost — the map cannot render until the page is reloaded.',
      );
      this.onContextLost?.();
    });

    this.app.canvas.addEventListener('webglcontextrestored', () => {
      console.warn('[MapRenderer] WebGL context restored; reload for a clean state.');
    });

    this.app.stage.addChild(this.worldRoot);

    this.worldRoot.addChild(this.oceanBackdrop);
    this.worldRoot.addChild(this.terrainLayer);
    this.worldRoot.addChild(this.dimVeil);
    this.worldRoot.addChild(this.objectLayer);
    this.worldRoot.addChild(this.overlayLayer);
    this.worldRoot.addChild(this.gridLayer);
    this.worldRoot.addChild(this.cursorLayer);

    this.camera.setViewport(this.app.screen.width, this.app.screen.height);
  }

  get renderer(): Renderer {
    return this.app.renderer as Renderer;
  }

  setShowGrid(show: boolean): void {
    this.showGrid = show;
    this.gridLayer.visible = show;
    this.gridKey = ''; // force a rebuild when it comes back
  }

  resize(): void {
    this.camera.setViewport(this.app.screen.width, this.app.screen.height);
  }

  /** Push camera state into the scene graph and refresh viewport-dependent overlays. */
  syncView(): void {
    const { zoom } = this.camera;
    this.worldRoot.scale.set(zoom);
    this.worldRoot.position.set(
      this.camera.viewWidth / 2 - this.camera.x * zoom,
      this.camera.viewHeight / 2 - this.camera.y * zoom,
    );

    // Cover the view generously, so a fast pan cannot outrun the backdrop either.
    const b = this.camera.visibleBounds(this.camera.viewWidth / zoom);
    this.oceanBackdrop.position.set(b.minX, b.minY);
    this.oceanBackdrop.width = b.maxX - b.minX;
    this.oceanBackdrop.height = b.maxY - b.minY;

    // Tracks the backdrop exactly; it is the same rectangle in a different colour.
    this.dimVeil.position.set(b.minX, b.minY);
    this.dimVeil.width = b.maxX - b.minX;
    this.dimVeil.height = b.maxY - b.minY;

    this.updateGrid();
  }

  /** Push the terrain back behind a dark veil, for the secret overview. */
  setDim(alpha: number): void {
    this.dimVeil.tint = 0x000000;
    this.dimVeil.alpha = alpha;
    this.dimVeil.visible = alpha > 0;
  }

  /** Keep the backdrop in step with the map's open-water colour. */
  setOceanColor(rgb: [number, number, number]): void {
    this.oceanBackdrop.tint =
      (Math.round(rgb[0] * 255) << 16) | (Math.round(rgb[1] * 255) << 8) | Math.round(rgb[2] * 255);
  }

  /**
   * Rebuild the hex overlay only when the visible hex range or zoom actually changed —
   * regenerating tens of thousands of paths on every pan frame is the obvious way to make
   * this the slowest thing on screen.
   */
  private updateGrid(): void {
    if (!this.showGrid) return;

    const zoom = this.camera.zoom;
    if (HEX_X_SPACING * zoom < MIN_HEX_SCREEN_PX) {
      this.gridLayer.clear();
      this.gridKey = 'hidden';
      return;
    }

    const b = this.camera.visibleBounds(HEX_RADIUS * 2);
    const range = hexRangeForBounds(b.minX, b.minY, b.maxX, b.maxY);
    const key = `${range.minQ},${range.maxQ},${range.minR},${range.maxR}`;
    if (key === this.gridKey) return;
    this.gridKey = key;

    const count = (range.maxQ - range.minQ + 1) * (range.maxR - range.minR + 1);
    this.gridLayer.clear();
    if (count > MAX_GRID_HEXES) return;

    for (let q = range.minQ; q <= range.maxQ; q++) {
      for (let r = range.minR; r <= range.maxR; r++) {
        const c = hexToWorld({ q, r });
        const pts = hexCorners(c.x, c.y);
        this.gridLayer.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 6; i++) this.gridLayer.lineTo(pts[i].x, pts[i].y);
        this.gridLayer.closePath();
      }
    }

    // Width is in world units, so divide by zoom to keep the line one screen pixel.
    this.gridLayer.stroke({ width: 1 / zoom, color: 0xffffff, alpha: 0.14 });
  }

  destroy(): void {
    this.oceanBackdrop.destroy();
    this.gridLayer.destroy();
    this.overlayLayer.destroy({ children: true });
    this.cursorLayer.destroy({ children: true });
    this.app.destroy(true, { children: true });
  }
}

export function parseColor(color: string, fallback: number): number {
  if (!color) return fallback;
  const n = Number.parseInt(color.replace('#', ''), 16);
  return Number.isNaN(n) ? fallback : n;
}

export { HEX_Y_SPACING };
