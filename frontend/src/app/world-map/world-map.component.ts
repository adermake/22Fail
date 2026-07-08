/**
 * World Map — OpenSeadragon hex world with lobby-like UX.
 */

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import OpenSeadragon from 'openseadragon';
import { Subscription } from 'rxjs';

import { WorldMapStoreService } from '../services/world-map-store.service';
import { WorldMapSocketService, WorldMapMeasurement } from '../services/world-map-socket.service';
import { ImageService } from '../services/image.service';
import {
  WorldMapData,
  WorldMapTool,
  FogMode,
  MacroTile,
  WorldMapToken,
  SubHexRef,
  subHexKey,
} from '../model/world-map.model';
import { Stroke, Point, generateId } from '../model/lobby.model';
import { drawStrokeOnContext } from '../lobby/draw-layer.utils';
import { prepareWorldMapTileForUpload } from '../shared/image-upload.utils';
import { applyMacroStencilToFile } from './world-map-stencil.utils';
import {
  HEX_WIDTH,
  SUB_HEX_RADIUS,
  KM_PER_SUB_HEX,
  parseHexFilename,
  getMacroTilePosition,
  pickSubHexAtWorldPixel,
  subHexToWorldPixel,
  findMacroTileAtWorldPixel,
  drawFlatHexPath,
  MACRO_SUB_HEXES,
  oddqHexDistance,
  worldPixelToSubHex,
  macroTilePosition,
  isInsideMacroTileHex,
  subHexToPixel,
  appendFlatHexPath,
  subHexesInOddqRadius,
} from './world-map-hex.utils';
import { WorldMapToolbarComponent } from './world-map-toolbar/world-map-toolbar.component';
import { LobbyTokenComponent } from '../lobby/lobby-token/lobby-token.component';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule, WorldMapToolbarComponent, LobbyTokenComponent],
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  store = inject(WorldMapStoreService);
  private socket = inject(WorldMapSocketService);
  private imageService = inject(ImageService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('viewerHost') viewerHost?: ElementRef<HTMLDivElement>;
  @ViewChild('viewerWrap') viewerWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('overlayCanvas') overlayCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fogCanvas') fogCanvas?: ElementRef<HTMLCanvasElement>;

  private viewer?: OpenSeadragon.Viewer;
  private osdTiles = new Map<string, OpenSeadragon.TiledImage>();
  private osdTileState = new Map<string, { x: number; y: number; imageId: string }>();
  private subs: Subscription[] = [];
  private overlayCtx?: CanvasRenderingContext2D;
  private fogCtx?: CanvasRenderingContext2D;
  private currentStroke: Stroke | null = null;
  private currentStrokePoints: Point[] = [];
  private isDrawing = false;
  private isPanning = false;
  private lastPanMouse = { x: 0, y: 0 };
  private isAdjustingBrushSize = false;
  private brushSizeAdjustStart: { x: number; y: number; initialSize: number } | null = null;
  private measureStartWorld: Point | null = null;
  private measureEndWorld: Point | null = null;
  private remoteMeasurements: WorldMapMeasurement[] = [];
  private documentMoveListener: ((e: MouseEvent) => void) | null = null;
  private documentUpListener: ((e: MouseEvent) => void) | null = null;
  private fogRenderRaf = 0;
  private fogOffscreen?: HTMLCanvasElement;

  worldName = signal('');
  isGM = signal(false);
  mapData = signal<WorldMapData | null>(null);
  currentTool = signal<WorldMapTool>('cursor');
  fogMode = signal<FogMode>('neutral');
  fogBrushRadius = signal(0);
  isEraserMode = signal(false);
  brushColor = signal('#ef4444');
  penBrushSize = signal(4);
  eraserBrushSize = signal(12);
  selectedMacroTileId = signal<string | null>(null);
  selectedTokenId = signal<string | null>(null);
  draggingTokenId = signal<string | null>(null);
  hoverSubHex = signal<(SubHexRef & { worldX: number; worldY: number }) | null>(null);
  tokenScale = signal(1);
  quickTokenName = signal('');
  showContextMenu = signal(false);
  contextMenuPos = signal({ x: 0, y: 0 });
  contextMenuHex = signal<SubHexRef | null>(null);
  contextMenuTokenId = signal<string | null>(null);
  brushSizeCircle = signal<{ screenX: number; screenY: number; radius: number } | null>(null);
  /** Bumped on every pan/zoom so token positions refresh. */
  viewEpoch = signal(0);

  visibleTokens = computed(() => {
    const data = this.mapData();
    if (!data) return [];
    if (this.isGM()) return data.tokens;
    const revealed = new Set(data.revealedSubHexes);
    return data.tokens.filter(t => revealed.has(subHexKey(t)));
  });

  ngOnInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName') ?? '';
    const gmParam = this.route.snapshot.queryParamMap.get('gm');
    this.worldName.set(worldName);
    this.isGM.set(gmParam === 'true' || gmParam === '1');

    this.store.load(worldName).then(data => {
      this.mapData.set(data);
      this.syncOsdTiles(data.macroTiles);
      this.cdr.markForCheck();
    });

    this.subs.push(
      this.store.data$.subscribe(data => {
        if (!data) return;
        const prev = this.mapData();
        this.mapData.set(data);
        if (!prev || prev.macroTiles !== data.macroTiles) {
          this.syncOsdTiles(data.macroTiles);
        }
        if (!prev || prev.revealedSubHexes !== data.revealedSubHexes || prev.macroTiles !== data.macroTiles) {
          this.renderFog();
        }
        this.renderOverlay();
        this.cdr.markForCheck();
      }),
      this.socket.patches$.subscribe(patch => this.store.applyRemotePatch(patch)),
      this.socket.measurements$.subscribe(m => {
        const ownId = this.socket.socketId;
        this.remoteMeasurements = ownId ? m.filter(x => x.id !== ownId) : m;
        this.renderCanvases();
        this.cdr.markForCheck();
      }),
    );
  }

  ngAfterViewInit(): void {
    if (!this.viewerHost) return;

    this.viewer = OpenSeadragon({
      element: this.viewerHost.nativeElement,
      prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@5/build/openseadragon/images/',
      showNavigator: true,
      maxZoomPixelRatio: 6,
      gestureSettingsMouse: {
        clickToZoom: false,
        scrollToZoom: true,
        dblClickToZoom: false,
      },
      animationTime: 0.3,
    });
    this.viewer.setMouseNavEnabled(false);

    this.viewer.addHandler('viewport-change', () => this.syncViewOverlays());

    const overlay = this.overlayCanvas?.nativeElement;
    const fog = this.fogCanvas?.nativeElement;
    if (overlay) {
      this.overlayCtx = overlay.getContext('2d') ?? undefined;
    }
    if (fog) {
      this.fogCtx = fog.getContext('2d') ?? undefined;
    }
    this.resizeCanvases();
    window.addEventListener('resize', this.onResize);

    const wrap = this.viewerWrap?.nativeElement;
    wrap?.addEventListener('mousedown', this.onWrapMouseDown);
    wrap?.addEventListener('mousemove', this.onWrapMouseMove);
    wrap?.addEventListener('mouseup', this.onWrapMouseUp);
    wrap?.addEventListener('mouseleave', this.onWrapMouseLeave);
    wrap?.addEventListener('contextmenu', this.onContextMenu);
    wrap?.addEventListener('auxclick', this.onAuxClick);
    wrap?.addEventListener('wheel', this.onWheel, { passive: false });

    this.updateInteractionMode();
  }

  ngOnDestroy(): void {
    if (this.fogRenderRaf) cancelAnimationFrame(this.fogRenderRaf);
    window.removeEventListener('resize', this.onResize);
    this.removeDocumentListeners();
    const wrap = this.viewerWrap?.nativeElement;
    wrap?.removeEventListener('mousedown', this.onWrapMouseDown);
    wrap?.removeEventListener('mousemove', this.onWrapMouseMove);
    wrap?.removeEventListener('mouseup', this.onWrapMouseUp);
    wrap?.removeEventListener('mouseleave', this.onWrapMouseLeave);
    wrap?.removeEventListener('contextmenu', this.onContextMenu);
    wrap?.removeEventListener('auxclick', this.onAuxClick);
    wrap?.removeEventListener('wheel', this.onWheel);
    this.subs.forEach(s => s.unsubscribe());
    this.viewer?.destroy();
    this.store.destroy();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    const key = event.key.toLowerCase();

    if (event.ctrlKey && key === 'z') {
      if (this.currentTool() === 'draw') {
        event.preventDefault();
        this.store.undoStroke();
      }
      return;
    }

    if (key === 'e' && this.currentTool() === 'draw') {
      event.preventDefault();
      this.isEraserMode.update(v => !v);
      this.cdr.markForCheck();
      return;
    }

    if (key === 'b') {
      event.preventDefault();
      this.onToolChange('draw');
      this.isEraserMode.set(false);
      return;
    }

    if (key === 's') {
      event.preventDefault();
      this.onToolChange('cursor');
      this.isEraserMode.set(false);
      return;
    }

    if (key === 'm') {
      event.preventDefault();
      this.onToolChange('measure');
      return;
    }

    if (key === 'v' && this.isGM()) {
      event.preventDefault();
      this.fogMode.update(m => (m === 'reveal' ? 'hide' : 'reveal'));
      this.updateInteractionMode();
      this.cdr.markForCheck();
      return;
    }

    if (key === 'd' && this.isGM()) {
      event.preventDefault();
      this.fogMode.set('neutral');
      this.updateInteractionMode();
      this.cdr.markForCheck();
      return;
    }

    if (key === 'delete' || key === 'backspace') {
      if (this.selectedTokenId()) {
        event.preventDefault();
        this.store.removeToken(this.selectedTokenId()!);
        this.selectedTokenId.set(null);
      } else if (this.selectedMacroTileId()) {
        event.preventDefault();
        this.removeSelectedMacroTile();
      }
    }
  }

  onToolChange(tool: WorldMapTool): void {
    this.currentTool.set(tool);
    this.showContextMenu.set(false);
    this.updateInteractionMode();
    this.renderCanvases();
    this.cdr.markForCheck();
  }

  private updateInteractionMode(): void {
    // Input is always on viewer-wrap; overlay canvases stay pointer-events: none.
  }

  /** Keep tokens, strokes, and fog aligned with the OpenSeadragon viewport. */
  private syncViewOverlays(): void {
    this.updateTokenScale();
    this.renderOverlay();
    this.scheduleFogRender();
    this.viewEpoch.update(n => n + 1);
    this.cdr.markForCheck();
  }

  private scheduleFogRender(): void {
    if (this.fogRenderRaf) return;
    this.fogRenderRaf = requestAnimationFrame(() => {
      this.fogRenderRaf = 0;
      this.renderFog();
    });
  }

  private onWheel = (e: WheelEvent): void => {
    if (!this.viewer || !this.viewerHost) return;

    if (this.isGM() && e.ctrlKey && this.fogMode() !== 'neutral') {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -1 : 1;
      this.fogBrushRadius.update(r => Math.max(0, Math.min(6, r + delta)));
      this.renderOverlay();
      this.cdr.markForCheck();
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const rect = this.viewerHost.nativeElement.getBoundingClientRect();
    const pixel = new OpenSeadragon.Point(e.clientX - rect.left, e.clientY - rect.top);
    const factor = e.deltaY > 0 ? 1 / 1.15 : 1.15;
    this.viewer.viewport.zoomBy(
      factor,
      this.viewer.viewport.pointFromPixel(pixel),
      true,
    );
  };

  private updateTokenScale(): void {
    const data = this.mapData();
    const tile = data?.macroTiles[0];
    if (!tile) return;
    const osd = this.osdTiles.get(tile.id);
    if (!osd || !this.viewer) return;
    const p1 = osd.imageToViewportCoordinates(0, 0);
    const p2 = osd.imageToViewportCoordinates(SUB_HEX_RADIUS * 2, 0);
    const s1 = this.viewer.viewport.pixelFromPoint(p1);
    const s2 = this.viewer.viewport.pixelFromPoint(p2);
    this.tokenScale.set((Math.abs(s2.x - s1.x) / (SUB_HEX_RADIUS * 2)) * 0.5);
  }

  private onResize = (): void => {
    this.resizeCanvases();
    this.renderOverlay();
    this.renderFog();
  };

  private resizeCanvases(): void {
    const host = this.viewerHost?.nativeElement;
    if (!host) return;
    for (const canvas of [this.overlayCanvas?.nativeElement, this.fogCanvas?.nativeElement]) {
      if (canvas) {
        canvas.width = host.clientWidth;
        canvas.height = host.clientHeight;
      }
    }
  }

  // ── OpenSeadragon tiles ──

  private syncOsdTiles(tiles: MacroTile[]): void {
    if (!this.viewer) return;
    const ids = new Set(tiles.map(t => t.id));

    for (const [id, item] of this.osdTiles) {
      if (!ids.has(id)) {
        this.viewer.world.removeItem(item);
        this.osdTiles.delete(id);
        this.osdTileState.delete(id);
      }
    }

    for (const tile of tiles) {
      const pos = getMacroTilePosition(tile);
      const prev = this.osdTileState.get(tile.id);
      const changed =
        !prev || prev.x !== pos.x || prev.y !== pos.y || prev.imageId !== tile.imageId;

      if (this.osdTiles.has(tile.id)) {
        if (changed) this.refreshTilePosition(tile.id, pos.x, pos.y, tile.imageId);
        continue;
      }

      const url = this.imageService.getImageUrl(tile.imageId);
      if (!url) continue;
      this.viewer.addSimpleImage({
        url,
        x: pos.x,
        y: pos.y,
        width: HEX_WIDTH,
        success: (event: Event) => {
          const item = (event as any).item as OpenSeadragon.TiledImage;
          if (item) {
            this.osdTiles.set(tile.id, item);
            this.osdTileState.set(tile.id, { x: pos.x, y: pos.y, imageId: tile.imageId });
          }
          this.updateTokenScale();
          this.renderCanvases();
        },
      });
    }
  }

  private refreshTilePosition(
    tileId: string,
    x: number,
    y: number,
    imageId?: string,
  ): void {
    const viewer = this.viewer;
    const item = this.osdTiles.get(tileId);
    const data = this.mapData();
    if (!viewer || !item || !data) return;
    const tile = data.macroTiles.find(t => t.id === tileId);
    if (!tile) return;
    const resolvedImageId = imageId ?? tile.imageId;
    const url = this.imageService.getImageUrl(resolvedImageId);
    if (!url) return;

    viewer.world.removeItem(item);
    this.osdTiles.delete(tileId);
    viewer.addSimpleImage({
      url,
      x,
      y,
      width: HEX_WIDTH,
      success: (event: Event) => {
        const newItem = (event as any).item as OpenSeadragon.TiledImage;
        if (newItem) {
          this.osdTiles.set(tileId, newItem);
          this.osdTileState.set(tileId, { x, y, imageId: resolvedImageId });
        }
        this.renderCanvases();
      },
    });
  }

  // ── Coordinates ──

  private screenToWorld(clientX: number, clientY: number): Point | null {
    const viewer = this.viewer;
    const host = this.viewerHost?.nativeElement;
    const data = this.mapData();
    if (!viewer || !host || !data) return null;

    const rect = host.getBoundingClientRect();
    const pixel = new OpenSeadragon.Point(clientX - rect.left, clientY - rect.top);
    const vp = viewer.viewport.pointFromPixel(pixel);

    for (const tile of data.macroTiles) {
      const osdItem = this.osdTiles.get(tile.id);
      if (!osdItem) continue;
      const bounds = osdItem.getBounds();
      if (
        vp.x >= bounds.x &&
        vp.x <= bounds.x + bounds.width &&
        vp.y >= bounds.y &&
        vp.y <= bounds.y + bounds.height
      ) {
        const img = osdItem.viewportToImageCoordinates(vp);
        const pos = getMacroTilePosition(tile);
        return { x: pos.x + img.x, y: pos.y + img.y };
      }
    }
    return null;
  }

  private worldToScreen(wx: number, wy: number): Point | null {
    const viewer = this.viewer;
    const data = this.mapData();
    if (!viewer || !data) return null;
    const hit = findMacroTileAtWorldPixel(data.macroTiles, wx, wy);
    if (!hit) return null;
    const osdItem = this.osdTiles.get(hit.tile.id);
    if (!osdItem) return null;
    const vp = osdItem.imageToViewportCoordinates(hit.localX, hit.localY);
    const screen = viewer.viewport.pixelFromPoint(vp);
    return { x: screen.x, y: screen.y };
  }

  private imageSizeToScreen(size: number, tileId: string): number {
    const viewer = this.viewer;
    const item = this.osdTiles.get(tileId);
    if (!viewer || !item) return size;
    const p1 = item.imageToViewportCoordinates(0, 0);
    const p2 = item.imageToViewportCoordinates(size, 0);
    const s1 = viewer.viewport.pixelFromPoint(p1);
    const s2 = viewer.viewport.pixelFromPoint(p2);
    return Math.abs(s2.x - s1.x);
  }

  private snapPick(clientX: number, clientY: number): (SubHexRef & { worldX: number; worldY: number }) | null {
    const world = this.screenToWorld(clientX, clientY);
    const data = this.mapData();
    if (!world || !data) return null;
    return pickSubHexAtWorldPixel(data.macroTiles, world.x, world.y);
  }

  getTokenScreenPosition(token: WorldMapToken): Point {
    // viewEpoch forces template refresh when the viewport pans/zooms
    void this.viewEpoch();
    const data = this.mapData();
    if (!data) return { x: 0, y: 0 };
    const tile = data.macroTiles.find(t => t.q === token.macroQ && t.r === token.macroR);
    if (!tile) return { x: 0, y: 0 };
    const center = subHexToWorldPixel(tile, token.subQ, token.subR);
    const screen = this.worldToScreen(center.x, center.y);
    return screen ?? { x: 0, y: 0 };
  }

  // ── Mouse / pan ──

  private onAuxClick = (e: MouseEvent): void => {
    if (e.button === 1) e.preventDefault();
  };

  private onWrapMouseDown = (e: MouseEvent): void => {
    if (e.button === 1) {
      e.preventDefault();
      this.isPanning = true;
      this.lastPanMouse = { x: e.clientX, y: e.clientY };
      this.viewerWrap?.nativeElement.classList.add('panning');
      this.addDocumentListeners();
      return;
    }

    if (e.button !== 0) return;
    this.showContextMenu.set(false);

    const pick = this.snapPick(e.clientX, e.clientY);
    const tool = this.currentTool();

    if (this.isGM() && e.shiftKey && pick) {
      const data = this.mapData();
      const hit = data ? findMacroTileAtWorldPixel(data.macroTiles, pick.worldX, pick.worldY) : null;
      if (hit) {
        this.selectedMacroTileId.set(hit.tile.id);
        this.cdr.markForCheck();
        return;
      }
    }

    if (tool === 'measure') {
      if (!pick) return;
      this.measureStartWorld = { x: pick.worldX, y: pick.worldY };
      this.measureEndWorld = { x: pick.worldX, y: pick.worldY };
      this.addDocumentListeners();
      this.renderCanvases();
      return;
    }

    if (tool === 'draw') {
      if (e.shiftKey) {
        e.preventDefault();
        this.isAdjustingBrushSize = true;
        const host = this.viewerHost?.nativeElement;
        const rect = host?.getBoundingClientRect();
        this.brushSizeAdjustStart = {
          x: e.clientX,
          y: e.clientY,
          initialSize: this.isEraserMode() ? this.eraserBrushSize() : this.penBrushSize(),
        };
        if (rect) {
          const radius = this.isEraserMode() ? this.eraserBrushSize() : this.penBrushSize();
          this.brushSizeCircle.set({
            screenX: e.clientX - rect.left,
            screenY: e.clientY - rect.top,
            radius,
          });
        }
        this.addDocumentListeners();
        this.renderCanvases();
        return;
      }
      const world = this.screenToWorld(e.clientX, e.clientY);
      if (!world) return;
      this.isDrawing = true;
      this.currentStrokePoints = [world];
      this.addDocumentListeners();
      return;
    }

    if (tool === 'cursor') {
      if (this.isGM() && pick && this.applyFogAtPick(pick)) return;

      if (!pick) return;
      const data = this.mapData();
      const token = data?.tokens.find(
        t =>
          t.macroQ === pick.macroQ &&
          t.macroR === pick.macroR &&
          t.subQ === pick.subQ &&
          t.subR === pick.subR,
      );
      if (token) {
        this.selectedTokenId.set(token.id);
        this.draggingTokenId.set(token.id);
        this.addDocumentListeners();
        this.cdr.markForCheck();
        return;
      }
      if (this.selectedTokenId()) {
        this.store.moveToken(this.selectedTokenId()!, pick);
        this.selectedTokenId.set(null);
        this.cdr.markForCheck();
      }
      return;
    }

    if (this.isGM() && pick && this.applyFogAtPick(pick)) return;
  };

  /** GM fog reveal/hide while in cursor mode (V/D hotkeys). */
  private applyFogAtPick(pick: SubHexRef & { worldX: number; worldY: number }): boolean {
    const mode = this.fogMode();
    const refs = this.getFogBrushHexRefs(pick);
    if (refs.length === 0) return false;
    if (mode === 'reveal') {
      this.store.revealSubHexes(refs);
      return true;
    }
    if (mode === 'hide') {
      this.store.recoverSubHexes(refs);
      return true;
    }
    return false;
  }

  private getFogBrushHexRefs(
    pick: SubHexRef & { worldX?: number; worldY?: number },
  ): SubHexRef[] {
    const radius = this.fogBrushRadius();
    const coords = subHexesInOddqRadius(pick.subQ, pick.subR, radius);
    const refs: SubHexRef[] = [];
    for (const coord of coords) {
      const local = subHexToPixel(coord);
      if (!isInsideMacroTileHex(local.x, local.y)) continue;
      refs.push({
        macroQ: pick.macroQ,
        macroR: pick.macroR,
        subQ: coord.q,
        subR: coord.r,
      });
    }
    return refs;
  }

  private onWrapMouseMove = (e: MouseEvent): void => {
    if (this.isPanning && this.viewer) {
      const dx = e.clientX - this.lastPanMouse.x;
      const dy = e.clientY - this.lastPanMouse.y;
      this.lastPanMouse = { x: e.clientX, y: e.clientY };
      const delta = this.viewer.viewport.deltaPointsFromPixels(
        new OpenSeadragon.Point(dx, dy),
      );
      // Negate so the map follows the cursor (grab-pan).
      this.viewer.viewport.panBy(delta.negate(), true);
      this.syncViewOverlays();
      return;
    }

    const pick = this.snapPick(e.clientX, e.clientY);
    const tool = this.currentTool();

    if (this.isAdjustingBrushSize && this.brushSizeAdjustStart) {
      const dx = e.clientX - this.brushSizeAdjustStart.x;
      const newSize = Math.max(1, Math.min(300, this.brushSizeAdjustStart.initialSize + dx * 0.3));
      if (this.isEraserMode()) this.eraserBrushSize.set(Math.round(newSize));
      else this.penBrushSize.set(Math.round(newSize));
      const host = this.viewerHost?.nativeElement;
      const rect = host?.getBoundingClientRect();
      if (rect) {
        this.brushSizeCircle.set({
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
          radius: Math.round(newSize),
        });
      }
      this.renderCanvases();
      this.cdr.markForCheck();
      return;
    }

    if (this.isDrawing) {
      const world = this.screenToWorld(e.clientX, e.clientY);
      if (world) {
        this.currentStrokePoints.push(world);
        this.renderCanvases();
      }
      return;
    }

    if (tool === 'measure' && this.measureStartWorld && pick) {
      this.measureEndWorld = { x: pick.worldX, y: pick.worldY };
      this.socket.sendMeasurement({
        id: this.socket.socketId ?? 'local',
        start: this.measureStartWorld,
        end: this.measureEndWorld,
        createdBy: this.socket.socketId ?? 'local',
      });
      this.renderCanvases();
      return;
    }

    if (tool !== 'draw' && tool !== 'measure') {
      this.hoverSubHex.set(pick);
      this.renderOverlay();
    }
  };

  private onWrapMouseUp = (e: MouseEvent): void => {
    if (this.isPanning) {
      this.isPanning = false;
      this.viewerWrap?.nativeElement.classList.remove('panning');
      this.removeDocumentListeners();
      return;
    }

    if (this.isAdjustingBrushSize) {
      this.isAdjustingBrushSize = false;
      this.brushSizeAdjustStart = null;
      this.brushSizeCircle.set(null);
      this.removeDocumentListeners();
      this.renderCanvases();
      return;
    }

    if (this.isDrawing) {
      this.isDrawing = false;
      if (this.currentStrokePoints.length >= 2) {
        this.store.addStroke({
          id: generateId(),
          points: [...this.currentStrokePoints],
          color: this.isEraserMode() ? '#ffffff' : this.brushColor(),
          lineWidth: this.isEraserMode() ? this.eraserBrushSize() : this.penBrushSize(),
          isEraser: this.isEraserMode(),
        });
      }
      this.currentStrokePoints = [];
      this.removeDocumentListeners();
      this.renderCanvases();
      return;
    }

    if (this.currentTool() === 'measure') {
      this.measureStartWorld = null;
      this.measureEndWorld = null;
      this.socket.sendMeasurement(null);
      this.removeDocumentListeners();
      this.renderCanvases();
      return;
    }

    if (this.draggingTokenId()) {
      const pick = this.snapPick(e.clientX, e.clientY);
      if (pick && this.draggingTokenId()) {
        this.store.moveToken(this.draggingTokenId()!, pick);
      }
      this.draggingTokenId.set(null);
      this.removeDocumentListeners();
      this.cdr.markForCheck();
    }
  };

  private onWrapMouseLeave = (): void => {
    if (!this.isPanning && !this.isDrawing) {
      this.hoverSubHex.set(null);
      this.renderCanvases();
    }
  };

  private onContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    const pick = this.snapPick(e.clientX, e.clientY);
    const data = this.mapData();
    if (!pick || !data) return;

    const token = data.tokens.find(
      t =>
        t.macroQ === pick.macroQ &&
        t.macroR === pick.macroR &&
        t.subQ === pick.subQ &&
        t.subR === pick.subR,
    );

    this.contextMenuPos.set({ x: e.clientX, y: e.clientY });
    this.contextMenuHex.set(token ? null : pick);
    this.contextMenuTokenId.set(token?.id ?? null);
    this.showContextMenu.set(true);
    this.cdr.markForCheck();
  };

  onTokenDragStart(token: WorldMapToken, event: MouseEvent): void {
    if (this.currentTool() !== 'cursor') return;
    this.selectedTokenId.set(token.id);
    this.draggingTokenId.set(token.id);
    this.addDocumentListeners();
    this.cdr.markForCheck();
  }

  createQuickTokenFromMenu(): void {
    const hex = this.contextMenuHex();
    if (!hex) return;
    this.store.createQuickTokenAt(hex, this.quickTokenName() || 'Quick Token');
    this.quickTokenName.set('');
    this.showContextMenu.set(false);
    this.cdr.markForCheck();
  }

  removeContextToken(): void {
    const id = this.contextMenuTokenId();
    if (id) this.store.removeToken(id);
    this.showContextMenu.set(false);
    this.cdr.markForCheck();
  }

  clearDrawings(): void {
    if (!this.isGM()) return;
    this.store.setStrokes([]);
  }

  private addDocumentListeners(): void {
    if (this.documentMoveListener) return;
    this.documentMoveListener = e => this.onWrapMouseMove(e);
    this.documentUpListener = e => this.onWrapMouseUp(e);
    document.addEventListener('mousemove', this.documentMoveListener);
    document.addEventListener('mouseup', this.documentUpListener);
  }

  private removeDocumentListeners(): void {
    if (this.documentMoveListener) {
      document.removeEventListener('mousemove', this.documentMoveListener);
      this.documentMoveListener = null;
    }
    if (this.documentUpListener) {
      document.removeEventListener('mouseup', this.documentUpListener);
      this.documentUpListener = null;
    }
  }

  // ── Tile upload ──

  async onTileFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      try {
        const masked = await applyMacroStencilToFile(file);
        const prepared = await prepareWorldMapTileForUpload(masked);
        const imageId = await this.imageService.uploadImageFile(prepared, prepared.name);
        const coords = parseHexFilename(file.name);
        if (!coords) continue;

        const existing = this.mapData()?.macroTiles.find(t => t.q === coords.q && t.r === coords.r);
        if (existing) {
          this.store.updateMacroTile(existing.id, { imageId });
        } else {
          const pos = macroTilePosition(coords.q, coords.r);
          this.store.addMacroTile({
            id: generateId(),
            q: coords.q,
            r: coords.r,
            imageId,
            x: pos.x,
            y: pos.y,
          });
        }
      } catch (err) {
        console.error('Tile upload failed:', err);
      }
    }
    input.value = '';
    this.cdr.markForCheck();
  }

  removeSelectedMacroTile(): void {
    const id = this.selectedMacroTileId();
    if (!id) return;
    this.store.removeMacroTile(id);
    const item = this.osdTiles.get(id);
    if (item && this.viewer) {
      this.viewer.world.removeItem(item);
      this.osdTiles.delete(id);
      this.osdTileState.delete(id);
    }
    this.selectedMacroTileId.set(null);
    this.cdr.markForCheck();
  }

  // ── Rendering ──

  private renderCanvases(): void {
    this.renderOverlay();
    this.renderFog();
  }

  private renderOverlay(): void {
    const ctx = this.overlayCtx;
    const canvas = this.overlayCanvas?.nativeElement;
    const data = this.mapData();
    if (!ctx || !canvas || !data) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawStrokes(ctx, data);

    if (this.isDrawing && this.currentStrokePoints.length >= 2) {
      this.drawStrokeWorld(ctx, {
        id: 'preview',
        points: this.currentStrokePoints,
        color: this.isEraserMode() ? '#ffffff' : this.brushColor(),
        lineWidth: this.isEraserMode() ? this.eraserBrushSize() : this.penBrushSize(),
        isEraser: this.isEraserMode(),
      });
    }

    this.drawMeasurements(ctx);
    this.drawHover(ctx);
    this.drawBrushCircle(ctx);
  }

  private renderFog(): void {
    const ctx = this.fogCtx;
    const canvas = this.fogCanvas?.nativeElement;
    const data = this.mapData();
    if (!ctx || !canvas || !data || data.macroTiles.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;
    if (!this.fogOffscreen || this.fogOffscreen.width !== w || this.fogOffscreen.height !== h) {
      this.fogOffscreen = document.createElement('canvas');
      this.fogOffscreen.width = w;
      this.fogOffscreen.height = h;
    }
    const off = this.fogOffscreen;
    const octx = off.getContext('2d');
    if (!octx) return;

    octx.clearRect(0, 0, w, h);
    const revealed = new Set(data.revealedSubHexes);
    const pad = SUB_HEX_RADIUS * 3;

    octx.fillStyle = '#000000';
    octx.beginPath();

    for (const tile of data.macroTiles) {
      for (const sub of MACRO_SUB_HEXES) {
        const local = subHexToPixel({ q: sub.q, r: sub.r });
        if (!isInsideMacroTileHex(local.x, local.y)) continue;

        const key = subHexKey({ macroQ: tile.q, macroR: tile.r, subQ: sub.q, subR: sub.r });
        if (revealed.has(key)) continue;

        const center = subHexToWorldPixel(tile, sub.q, sub.r);
        const screen = this.worldToScreen(center.x, center.y);
        if (!screen) continue;
        if (screen.x < -pad || screen.y < -pad || screen.x > w + pad || screen.y > h + pad) {
          continue;
        }

        const r = this.imageSizeToScreen(SUB_HEX_RADIUS * 1.06, tile.id);
        appendFlatHexPath(octx, screen.x, screen.y, r);
      }
    }

    octx.fill();

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = this.isGM() ? 0.45 : 1;
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  }

  private drawStrokes(ctx: CanvasRenderingContext2D, data: WorldMapData): void {
    for (const stroke of data.strokes) {
      this.drawStrokeWorld(ctx, stroke);
    }
  }

  private drawStrokeWorld(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
    if (stroke.points.length < 2) return;
    const screenPts: Point[] = [];
    const data = this.mapData();
    const tile = data?.macroTiles[0];
    let scale = 1;
    if (tile) {
      scale = this.imageSizeToScreen(1, tile.id);
    }
    for (const p of stroke.points) {
      const s = this.worldToScreen(p.x, p.y);
      if (s) screenPts.push(s);
    }
    if (screenPts.length < 2) return;
    drawStrokeOnContext(ctx, {
      ...stroke,
      points: screenPts,
      lineWidth: stroke.lineWidth * scale,
    });
  }

  private drawMeasurements(ctx: CanvasRenderingContext2D): void {
    const all: { start: Point; end: Point }[] = [];
    if (this.measureStartWorld && this.measureEndWorld) {
      all.push({ start: this.measureStartWorld, end: this.measureEndWorld });
    }
    for (const m of this.remoteMeasurements) {
      all.push({ start: m.start, end: m.end });
    }

    for (const m of all) {
      const s = this.worldToScreen(m.start.x, m.start.y);
      const e = this.worldToScreen(m.end.x, m.end.y);
      if (!s || !e) continue;

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const ha = worldPixelToSubHex(m.start.x, m.start.y);
      const hb = worldPixelToSubHex(m.end.x, m.end.y);
      const km = oddqHexDistance(ha, hb) * KM_PER_SUB_HEX;
      const midX = (s.x + e.x) / 2;
      const midY = (s.y + e.y) / 2;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText(`${km.toFixed(1)} km`, midX, midY - 8);
      ctx.textAlign = 'start';
    }
  }

  private drawHover(ctx: CanvasRenderingContext2D): void {
    const tool = this.currentTool();
    if (tool === 'draw' || tool === 'measure') return;

    const hover = this.hoverSubHex();
    if (!hover) return;
    const tile = this.mapData()?.macroTiles.find(t => t.q === hover.macroQ && t.r === hover.macroR);
    if (!tile) return;
    const r = this.imageSizeToScreen(SUB_HEX_RADIUS, tile.id);

    const brushHexes =
      this.isGM() && this.fogMode() !== 'neutral'
        ? this.getFogBrushHexRefs(hover)
        : [hover];

    const mode = this.fogMode();
    let strokeStyle = 'rgba(148, 163, 184, 0.6)';
    let fillStyle = 'transparent';
    if (this.isGM()) {
      if (mode === 'reveal') {
        strokeStyle = 'rgba(34, 197, 94, 0.95)';
        fillStyle = 'rgba(34, 197, 94, 0.15)';
      } else if (mode === 'hide') {
        strokeStyle = 'rgba(239, 68, 68, 0.95)';
        fillStyle = 'rgba(239, 68, 68, 0.15)';
      } else {
        strokeStyle = 'rgba(59, 130, 246, 0.85)';
        fillStyle = 'rgba(59, 130, 246, 0.1)';
      }
    }

    ctx.beginPath();
    for (const hex of brushHexes) {
      const center = subHexToWorldPixel(tile, hex.subQ, hex.subR);
      const screen = this.worldToScreen(center.x, center.y);
      if (!screen) continue;
      appendFlatHexPath(ctx, screen.x, screen.y, r);
    }
    if (fillStyle !== 'transparent') {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = this.isGM() ? Math.max(2, r * 0.12) : Math.max(1, r * 0.08);
    ctx.stroke();
  }

  private drawBrushCircle(ctx: CanvasRenderingContext2D): void {
    const circle = this.brushSizeCircle();
    if (!circle) return;
    const tile = this.mapData()?.macroTiles[0];
    const screenRadius = tile
      ? this.imageSizeToScreen(circle.radius, tile.id) / 2
      : circle.radius / 2;
    ctx.beginPath();
    ctx.arc(circle.screenX, circle.screenY, screenRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
