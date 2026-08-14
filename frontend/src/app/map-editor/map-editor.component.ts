/**
 * Map Editor — the in-app replacement for drawing hex tiles in Wonderdraft.
 *
 * Phase 0 establishes the foundation everything else sits on: the Pixi surface, the camera,
 * the chunked raster pipeline and live op sync. Terrain brushes (Phase 1), symbols (2),
 * secrets and fog (3), labels and regions (4) build on top without changing this shell.
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
import { Subscription } from 'rxjs';

import { MapEditorStoreService } from '../services/map-editor-store.service';
import { MapEditorApiService } from '../services/map-editor-api.service';
import { AuthService } from '../services/auth.service';
import { MapRenderer } from './map-renderer';
import { ChunkManager } from './chunk-manager';
import { MIN_ZOOM, MAX_ZOOM } from './map-camera';
import { KM_PER_HEX, worldToHex } from './map-hex';

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
  private subs: Subscription[] = [];
  private resizeObserver?: ResizeObserver;

  readonly worldName = signal('');
  readonly ready = signal(false);
  readonly isGM = computed(() => this.auth.isAdmin());

  /** Readouts, useful on their own and a cheap check that the transforms are right. */
  readonly zoomPct = signal(25);
  readonly cursorWorld = signal({ x: 0, y: 0 });
  readonly cursorHex = signal({ q: 0, r: 0 });
  readonly showGrid = signal(true);

  readonly kmPerHex = KM_PER_HEX;

  private isPanning = false;
  private lastPointer = { x: 0, y: 0 };
  /** Coalesces chunk streaming to one pass per frame. */
  private streamScheduled = false;

  async ngAfterViewInit(): Promise<void> {
    const host = this.pixiHost?.nativeElement;
    if (!host) return;

    const world = this.route.snapshot.paramMap.get('worldName') ?? '';
    this.worldName.set(world);

    await this.renderer.init(host);

    const data = await this.store.load(world);
    this.renderer.setOceanColor(data.settings.oceanColor);
    this.renderer.setShowGrid(data.settings.showGrid);
    this.showGrid.set(data.settings.showGrid);

    this.chunks = new ChunkManager(
      this.renderer.renderer,
      this.api,
      this.store,
      world,
      this.renderer.layerContainers,
    );

    // Another client painted — refetch just that chunk.
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

    // Start framed on the origin, where a fresh map's first strokes will land.
    this.renderer.camera.restore({ x: 0, y: 0, zoom: 0.25 });
    this.applyView();

    this.ready.set(true);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.resizeObserver?.disconnect();
    const host = this.pixiHost?.nativeElement;
    if (host) this.detachInput(host);

    // Persist anything painted but not yet uploaded before tearing the GPU state down.
    void this.chunks?.flushDirty().finally(() => {
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

  /** Streaming touches the network, so it runs once per frame rather than per event. */
  private scheduleStream(): void {
    if (this.streamScheduled) return;
    this.streamScheduled = true;
    requestAnimationFrame(() => {
      this.streamScheduled = false;
      // One chunk of margin keeps the edge of the view loaded before it scrolls in.
      this.chunks?.update(this.renderer.camera.visibleBounds(2048));
    });
  }

  // ── input ──

  private attachInput(host: HTMLElement): void {
    host.addEventListener('pointerdown', this.onPointerDown);
    host.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    host.addEventListener('wheel', this.onWheel, { passive: false });
    host.addEventListener('contextmenu', this.onContextMenu);
  }

  private detachInput(host: HTMLElement): void {
    host.removeEventListener('pointerdown', this.onPointerDown);
    host.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    host.removeEventListener('wheel', this.onWheel);
    host.removeEventListener('contextmenu', this.onContextMenu);
  }

  private localPoint(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = (this.pixiHost!.nativeElement as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onContextMenu = (e: MouseEvent): void => e.preventDefault();

  private onPointerDown = (e: PointerEvent): void => {
    // Left, middle and right all pan in Phase 0; Phase 1 claims left for the brushes.
    this.isPanning = true;
    this.lastPointer = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent): void => {
    const p = this.localPoint(e);
    const w = this.renderer.camera.screenToWorld(p.x, p.y);
    this.cursorWorld.set({ x: Math.round(w.x), y: Math.round(w.y) });
    this.cursorHex.set(worldToHex(w.x, w.y));

    if (!this.isPanning) return;
    this.renderer.camera.panByScreen(e.clientX - this.lastPointer.x, e.clientY - this.lastPointer.y);
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.applyView();
  };

  private onPointerUp = (): void => {
    this.isPanning = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const p = this.localPoint(e);
    // Fixed ratio per notch keeps zoom steps even across mice and trackpads.
    this.renderer.camera.zoomAt(p.x, p.y, e.deltaY > 0 ? 1 / 1.15 : 1.15);
    this.applyView();
  };

  // ── toolbar ──

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
