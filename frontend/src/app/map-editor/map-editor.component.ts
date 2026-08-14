/**
 * Map Editor — the in-app replacement for drawing hex tiles in Wonderdraft.
 *
 * Phase 0 established the surface, camera, chunked rasters and live op sync. Phase 1 adds
 * terrain: the height-field brushes, colour painting from stored palettes, undo, and the
 * debounced chunk upload that makes edits visible to everyone else.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Graphics } from 'pixi.js';
import { Subscription } from 'rxjs';

import { MapEditorStoreService } from '../services/map-editor-store.service';
import { MapEditorApiService } from '../services/map-editor-api.service';
import { AuthService } from '../services/auth.service';
import { MapRenderer } from './map-renderer';
import { ChunkManager } from './chunk-manager';
import { TerrainView, hexToRgb } from './terrain-view';
import { BrushEngine, BrushSettings, TerrainTool, defaultBrush } from './brush-engine';
import { UndoStack } from './undo-stack';
import { MIN_ZOOM, MAX_ZOOM } from './map-camera';
import { KM_PER_HEX, worldToHex } from './map-hex';

/** Tool buttons, in toolbar order. */
interface ToolButton {
  tool: TerrainTool;
  label: string;
  title: string;
}

@Component({
  selector: 'app-map-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapEditorComponent implements AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private store = inject(MapEditorStoreService);
  private api = inject(MapEditorApiService);
  private auth = inject(AuthService);

  @ViewChild('pixiHost') pixiHost?: ElementRef<HTMLDivElement>;

  private renderer = new MapRenderer();
  private chunks?: ChunkManager;
  private terrain?: TerrainView;
  private brushes?: BrushEngine;
  private undoStack?: UndoStack;
  private subs: Subscription[] = [];
  private resizeObserver?: ResizeObserver;

  readonly worldName = signal('');
  readonly ready = signal(false);
  readonly isGM = computed(() => this.auth.isAdmin());

  readonly zoomPct = signal(25);
  readonly cursorWorld = signal({ x: 0, y: 0 });
  readonly cursorHex = signal({ q: 0, r: 0 });
  readonly showGrid = signal(true);
  readonly kmPerHex = KM_PER_HEX;

  // ── tools ──

  readonly tools: ToolButton[] = [
    { tool: 'landBrush', label: 'Land', title: 'Land malen' },
    { tool: 'landEraser', label: 'Land −', title: 'Land radieren' },
    { tool: 'waterBrush', label: 'Wasser', title: 'Wasser malen (Flüsse, Seen)' },
    { tool: 'waterEraser', label: 'Wasser −', title: 'Wasser radieren' },
    { tool: 'heighten', label: 'Anheben', title: 'Gelände anheben (rauer Rand)' },
    { tool: 'lower', label: 'Absenken', title: 'Gelände absenken (rauer Rand)' },
    { tool: 'lakeStamp', label: 'See', title: 'See stempeln — jeder Klick erzeugt eine neue Form' },
    { tool: 'landPaint', label: 'Landfarbe', title: 'Landfarbe malen' },
    { tool: 'waterPaint', label: 'Wasserfarbe', title: 'Wasserfarbe malen' },
  ];

  readonly activeTool = signal<TerrainTool>('landBrush');
  readonly brushSize = signal(120);
  readonly brushSoftness = signal(0.35);
  readonly brushStrength = signal(1);

  /** Selected palette entries. Colours are chosen from the stored lists, never free-form. */
  readonly landPalette = signal<string[]>([]);
  readonly waterPalette = signal<string[]>([]);
  readonly selectedLand = signal(0);
  readonly selectedWater = signal(0);

  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly saving = signal(false);

  /** Whether the active tool paints colour (and so uses a palette swatch). */
  readonly usesPalette = computed(
    () => this.activeTool() === 'landPaint' || this.activeTool() === 'waterPaint',
  );

  private isPanning = false;
  private isPainting = false;
  private lastPointer = { x: 0, y: 0 };
  private streamScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  /** Re-rolled after each lake placement so consecutive lakes differ. */
  private lakeSeed = Math.floor(Math.random() * 1e9);
  private cursorGraphic = new Graphics();
  /** Last pointer position in world space, so the cursor can be redrawn in place. */
  private lastWorld: { x: number; y: number } | null = null;

  async ngAfterViewInit(): Promise<void> {
    const host = this.pixiHost?.nativeElement;
    if (!host) return;

    const world = this.route.snapshot.paramMap.get('worldName') ?? '';
    this.worldName.set(world);

    await this.renderer.init(host);
    this.renderer.cursorLayer.addChild(this.cursorGraphic);

    const data = await this.store.load(world);

    this.chunks = new ChunkManager(this.renderer.renderer, this.api, this.store, world);
    this.terrain = new TerrainView(this.chunks);
    this.renderer.terrainLayer.addChild(this.terrain.container);
    this.brushes = new BrushEngine(this.chunks, this.renderer.renderer);
    this.undoStack = new UndoStack(this.chunks);

    // Snapshot pixels the instant before a brush overwrites them.
    this.chunks.onBeforePaint = rec => this.undoStack?.capture(rec);

    this.landPalette.set(data.landPalette);
    this.waterPalette.set(data.waterPalette);
    this.applyPaletteToTerrain();
    this.renderer.setShowGrid(data.settings.showGrid);
    this.showGrid.set(data.settings.showGrid);

    this.subs.push(
      this.store.chunkInvalidations$.subscribe(inv =>
        this.chunks?.invalidate(inv.layer, inv.cx, inv.cy),
      ),
    );

    this.attachInput(host);

    this.resizeObserver = new ResizeObserver(() => {
      this.renderer.resize();
      this.scheduleStream();
    });
    this.resizeObserver.observe(host);

    this.renderer.camera.restore({ x: 0, y: 0, zoom: 0.25 });
    this.applyView();

    this.ready.set(true);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.resizeObserver?.disconnect();
    if (this.flushTimer) clearTimeout(this.flushTimer);

    const host = this.pixiHost?.nativeElement;
    if (host) this.detachInput(host);

    // Persist anything painted but not yet uploaded before tearing GPU state down.
    void this.chunks?.flushDirty().finally(() => {
      this.undoStack?.destroy();
      this.brushes?.destroy();
      this.terrain?.destroy();
      this.chunks?.destroy();
      this.renderer.destroy();
    });
    this.store.destroy();
  }

  // ── view ──

  private applyView(): void {
    this.renderer.syncView();
    this.zoomPct.set(Math.round(this.renderer.camera.zoom * 100));
    this.scheduleStream();
  }

  private scheduleStream(): void {
    if (this.streamScheduled) return;
    this.streamScheduled = true;
    requestAnimationFrame(() => {
      this.streamScheduled = false;
      const bounds = this.renderer.camera.visibleBounds(2048);
      this.chunks?.update(bounds);
      // Terrain follows the streamed set, so meshes never reference an evicted texture.
      this.terrain?.update(this.renderer.camera.visibleBounds(0));
    });
  }

  private applyPaletteToTerrain(): void {
    const land = this.landPalette()[this.selectedLand()] ?? '#7a8f5a';
    const water = this.waterPalette()[this.selectedWater()] ?? '#3f6d8c';
    this.terrain?.setLandDefault(hexToRgb(land, [0.48, 0.56, 0.35]));
    this.terrain?.setWaterDefault(hexToRgb(water, [0.25, 0.43, 0.55]));
  }

  private brush(): BrushSettings {
    const paletteColor = this.usesPalette()
      ? this.activeTool() === 'landPaint'
        ? (this.landPalette()[this.selectedLand()] ?? '#7a8f5a')
        : (this.waterPalette()[this.selectedWater()] ?? '#3f6d8c')
      : '#ffffff';

    return {
      ...defaultBrush(),
      tool: this.activeTool(),
      size: this.brushSize(),
      softness: this.brushSoftness(),
      strength: this.brushStrength(),
      color: paletteColor,
    };
  }

  // ── painting ──

  private beginPaint(world: { x: number; y: number }): void {
    if (!this.isGM()) return;
    this.isPainting = true;
    this.undoStack?.begin();
    this.brushes?.beginStroke();

    if (this.activeTool() === 'lakeStamp') {
      this.brushes?.stampLake(world.x, world.y, this.brushSize(), this.lakeSeed);
      // A fresh seed means the next lake — and its preview — is a different shape.
      this.lakeSeed = Math.floor(Math.random() * 1e9);
      this.endPaint();
      return;
    }

    this.brushes?.stroke(world, this.brush());
  }

  private continuePaint(world: { x: number; y: number }): void {
    if (!this.isPainting || this.activeTool() === 'lakeStamp') return;
    this.brushes?.stroke(world, this.brush());
  }

  private endPaint(): void {
    if (!this.isPainting) return;
    this.isPainting = false;

    const touched = this.brushes?.endStroke() ?? [];
    if (touched.length === 0) {
      this.undoStack?.abort();
      return;
    }

    this.undoStack?.commit(this.activeTool());
    this.refreshHistoryState();
    this.scheduleFlush();
  }

  /**
   * Upload dirty chunks shortly after the stroke settles.
   *
   * PNG-encoding a chunk is far too costly to do per pointer move, and batching also means
   * a burst of quick strokes over the same area uploads once rather than repeatedly.
   */
  private scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.saving.set(true);
      void this.chunks?.flushDirty().finally(() => this.saving.set(false));
    }, 600);
  }

  private refreshHistoryState(): void {
    this.canUndo.set(this.undoStack?.canUndo() ?? false);
    this.canRedo.set(this.undoStack?.canRedo() ?? false);
  }

  // ── brush cursor ──

  /** Redraw the brush cursor where the pointer last was (after a tool or size change). */
  private redrawCursor(): void {
    if (this.lastWorld) this.drawCursor(this.lastWorld);
    else this.cursorGraphic.clear();
  }

  private drawCursor(world: { x: number; y: number }): void {
    const g = this.cursorGraphic;
    g.clear();
    if (!this.isGM()) return;

    const zoom = this.renderer.camera.zoom;

    if (this.activeTool() === 'lakeStamp') {
      // The exact shape the next click will carve, at the current seed. Outline only —
      // a filled preview would hide the terrain being placed on.
      const outline = this.brushes?.lakeOutline(world.x, world.y, this.brushSize(), this.lakeSeed);
      if (outline?.length) {
        g.poly(outline).stroke({ width: 1.5 / zoom, color: 0x8fd0ff, alpha: 0.9 });
      }
      return;
    }

    g.circle(world.x, world.y, this.brushSize());
    g.stroke({ width: 1.5 / zoom, color: 0xffffff, alpha: 0.75 });

    // Inner ring marks where the falloff starts, so softness is legible while dragging.
    const solid = this.brushSize() * (1 - Math.min(0.95, this.brushSoftness()));
    if (solid > 1) {
      g.circle(world.x, world.y, solid);
      g.stroke({ width: 1 / zoom, color: 0xffffff, alpha: 0.3 });
    }
  }

  // ── input ──

  private attachInput(host: HTMLElement): void {
    host.addEventListener('pointerdown', this.onPointerDown);
    host.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    host.addEventListener('wheel', this.onWheel, { passive: false });
    host.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private detachInput(host: HTMLElement): void {
    host.removeEventListener('pointerdown', this.onPointerDown);
    host.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    host.removeEventListener('wheel', this.onWheel);
    host.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private localPoint(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = (this.pixiHost!.nativeElement as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onContextMenu = (e: MouseEvent): void => e.preventDefault();

  private onPointerDown = (e: PointerEvent): void => {
    const p = this.localPoint(e);
    const world = this.renderer.camera.screenToWorld(p.x, p.y);

    // Middle and right drag always pan; left paints, so the brush keeps the primary button.
    if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      return;
    }

    this.beginPaint(world);
  };

  private onPointerMove = (e: PointerEvent): void => {
    const p = this.localPoint(e);
    const world = this.renderer.camera.screenToWorld(p.x, p.y);

    this.lastWorld = world;
    this.cursorWorld.set({ x: Math.round(world.x), y: Math.round(world.y) });
    this.cursorHex.set(worldToHex(world.x, world.y));
    this.drawCursor(world);

    if (this.isPanning) {
      this.renderer.camera.panByScreen(
        e.clientX - this.lastPointer.x,
        e.clientY - this.lastPointer.y,
      );
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.applyView();
      return;
    }

    this.continuePaint(world);
  };

  private onPointerUp = (): void => {
    this.isPanning = false;
    this.endPaint();
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const p = this.localPoint(e);

    // Ctrl+wheel resizes the brush, matching the lobby's fog-brush convention.
    if (e.ctrlKey) {
      const next = this.brushSize() * (e.deltaY > 0 ? 1 / 1.15 : 1.15);
      this.brushSize.set(Math.round(Math.min(2000, Math.max(4, next))));
      this.lastWorld = this.renderer.camera.screenToWorld(p.x, p.y);
      this.redrawCursor();
      return;
    }

    this.renderer.camera.zoomAt(p.x, p.y, e.deltaY > 0 ? 1 / 1.15 : 1.15);
    this.applyView();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
    }
  };

  // ── toolbar actions ──

  selectTool(tool: TerrainTool): void {
    this.activeTool.set(tool);
    this.redrawCursor();
  }

  setBrushSize(value: string | number): void {
    this.brushSize.set(Number(value));
    this.redrawCursor();
  }

  setSoftness(value: string | number): void {
    this.brushSoftness.set(Number(value));
    this.redrawCursor();
  }

  setStrength(value: string | number): void {
    this.brushStrength.set(Number(value));
  }

  selectLandColor(i: number): void {
    this.selectedLand.set(i);
    this.applyPaletteToTerrain();
  }

  selectWaterColor(i: number): void {
    this.selectedWater.set(i);
    this.applyPaletteToTerrain();
  }

  /** Palettes are shared map state, so additions sync to everyone. */
  addLandColor(): void {
    const next = [...this.landPalette(), randomEarthTone()];
    this.landPalette.set(next);
    this.store.setPath('landPalette', next);
  }

  addWaterColor(): void {
    const next = [...this.waterPalette(), randomWaterTone()];
    this.waterPalette.set(next);
    this.store.setPath('waterPalette', next);
  }

  removeLandColor(i: number): void {
    const next = this.landPalette().filter((_, idx) => idx !== i);
    this.landPalette.set(next);
    this.selectedLand.set(Math.max(0, Math.min(this.selectedLand(), next.length - 1)));
    this.store.setPath('landPalette', next);
    this.applyPaletteToTerrain();
  }

  removeWaterColor(i: number): void {
    const next = this.waterPalette().filter((_, idx) => idx !== i);
    this.waterPalette.set(next);
    this.selectedWater.set(Math.max(0, Math.min(this.selectedWater(), next.length - 1)));
    this.store.setPath('waterPalette', next);
    this.applyPaletteToTerrain();
  }

  undo(): void {
    if (!this.undoStack?.canUndo()) return;
    this.undoStack.undo();
    this.refreshHistoryState();
    this.scheduleFlush();
  }

  redo(): void {
    if (!this.undoStack?.canRedo()) return;
    this.undoStack.redo();
    this.refreshHistoryState();
    this.scheduleFlush();
  }

  toggleGrid(): void {
    const next = !this.showGrid();
    this.showGrid.set(next);
    this.renderer.setShowGrid(next);
    this.store.setPath('settings.showGrid', next);
    this.applyView();
  }

  resetView(): void {
    this.renderer.camera.restore({ x: 0, y: 0, zoom: 0.25 });
    this.applyView();
  }

  zoomBy(factor: number): void {
    const cam = this.renderer.camera;
    cam.zoomAt(cam.viewWidth / 2, cam.viewHeight / 2, factor);
    this.applyView();
  }

  readonly minZoomPct = Math.round(MIN_ZOOM * 100);
  readonly maxZoomPct = Math.round(MAX_ZOOM * 100);
}

function randomEarthTone(): string {
  const h = 60 + Math.random() * 60; // yellow-green through green
  const s = 20 + Math.random() * 25;
  const l = 35 + Math.random() * 25;
  return hslToHex(h, s, l);
}

function randomWaterTone(): string {
  const h = 185 + Math.random() * 40; // cyan through blue
  const s = 30 + Math.random() * 30;
  const l = 30 + Math.random() * 25;
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
