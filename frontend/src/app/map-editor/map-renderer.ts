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
import { RASTER_LAYERS, RasterLayer } from './map-editor.model';
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

  private oceanBg = new Sprite(Texture.WHITE);
  layerContainers = {} as Record<RasterLayer, Container>;
  /** Vector content (regions, symbols, labels) lands here in later phases. */
  objectLayer = new Container();
  private gridLayer = new Graphics();

  private oceanColor = 0x3f6d8c;
  private showGrid = true;
  /** Grid rebuild key — avoids regenerating thousands of paths on every pan frame. */
  private gridKey = '';

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

    this.app.stage.addChild(this.worldRoot);

    this.oceanBg.tint = this.oceanColor;
    this.worldRoot.addChild(this.oceanBg);

    for (const layer of RASTER_LAYERS) {
      this.layerContainers[layer] = new Container();
    }

    // Order matters: water colour sits under land, land colour over it.
    this.worldRoot.addChild(this.layerContainers.waterColor);
    this.worldRoot.addChild(this.layerContainers.height);
    this.worldRoot.addChild(this.layerContainers.landColor);
    this.worldRoot.addChild(this.objectLayer);
    this.worldRoot.addChild(this.gridLayer);

    // Placeholder land readout: height chunks are white with alpha = height, so tinting
    // the container makes painted terrain legible before Phase 1's real compositing.
    this.layerContainers.height.tint = 0x7a8f5a;

    this.camera.setViewport(this.app.screen.width, this.app.screen.height);
  }

  get renderer(): Renderer {
    return this.app.renderer as Renderer;
  }

  setOceanColor(color: string): void {
    this.oceanColor = parseColor(color, 0x3f6d8c);
    this.oceanBg.tint = this.oceanColor;
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

    const b = this.camera.visibleBounds(0);
    this.oceanBg.position.set(b.minX, b.minY);
    this.oceanBg.width = b.maxX - b.minX;
    this.oceanBg.height = b.maxY - b.minY;

    this.updateGrid();
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
    this.gridLayer.destroy();
    this.oceanBg.destroy();
    this.app.destroy(true, { children: true });
  }
}

export function parseColor(color: string, fallback: number): number {
  if (!color) return fallback;
  const n = Number.parseInt(color.replace('#', ''), 16);
  return Number.isNaN(n) ? fallback : n;
}

export { HEX_Y_SPACING };
