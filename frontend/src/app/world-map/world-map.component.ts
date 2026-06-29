/**
 * World Map — large hex world with OpenSeadragon, fog of war, drawing, tokens.
 * URL: /world-map/:worldName?gm=true
 */

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import OpenSeadragon from 'openseadragon';
import { Subscription } from 'rxjs';

import { WorldMapStoreService } from '../services/world-map-store.service';
import { WorldMapSocketService, WorldMapMeasurement } from '../services/world-map-socket.service';
import { ImageService } from '../services/image.service';
import {
  WorldMapData,
  WorldMapTool,
  MacroTile,
  SubHexRef,
  subHexKey,
  parseSubHexKey,
} from '../model/world-map.model';
import { Stroke, Point, generateId } from '../model/lobby.model';
import { drawStrokeOnContext } from '../lobby/draw-layer.utils';
import {
  HEX_WIDTH,
  HEX_HEIGHT,
  SUB_HEX_RADIUS,
  KM_PER_SUB_HEX,
  parseHexFilename,
  getMacroTilePosition,
  pickSubHexAtWorldPixel,
  subHexToWorldPixel,
  findMacroTileAtWorldPixel,
  drawFlatHexPath,
  MACRO_SUB_HEXES,
  subHexWorldDistance,
  macroTilePosition,
} from './world-map-hex.utils';

interface ToolDef {
  id: WorldMapTool;
  icon: string;
  label: string;
  gmOnly?: boolean;
}

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  @ViewChild('overlayCanvas') overlayCanvas?: ElementRef<HTMLCanvasElement>;

  private viewer?: OpenSeadragon.Viewer;
  private osdTiles = new Map<string, OpenSeadragon.TiledImage>();
  private osdTileState = new Map<string, { x: number; y: number; imageId: string }>();
  private subs: Subscription[] = [];
  private overlayCtx?: CanvasRenderingContext2D;
  private currentStroke: Stroke | null = null;
  private isDrawing = false;
  private isDraggingTile = false;
  private tileDragPreview: Point | null = null;
  private tileDragStart: Point | null = null;
  private tileDragOrigin: Point | null = null;
  private measureStartWorld: Point | null = null;
  private measureEndWorld: Point | null = null;
  private remoteMeasurements: WorldMapMeasurement[] = [];

  worldName = signal('');
  isGM = signal(false);
  mapData = signal<WorldMapData | null>(null);
  currentTool = signal<WorldMapTool>('pan');
  brushColor = signal('#ff0000');
  brushSize = signal(6);
  selectedSubHexes = signal<Set<string>>(new Set());
  selectedMacroTileId = signal<string | null>(null);
  selectedTokenId = signal<string | null>(null);
  hoverSubHex = signal<(SubHexRef & { worldX: number; worldY: number }) | null>(null);
  statusText = signal('');

  private readonly allTools: ToolDef[] = [
    { id: 'pan', icon: '✋', label: 'Pan (H)' },
    { id: 'select', icon: '⬡', label: 'Auswahl' },
    { id: 'reveal', icon: '👁', label: 'Aufdecken', gmOnly: true },
    { id: 'recover', icon: '🌫', label: 'Verbergen', gmOnly: true },
    { id: 'draw', icon: '✏️', label: 'Zeichnen' },
    { id: 'erase', icon: '🧹', label: 'Radieren' },
    { id: 'measure', icon: '📏', label: 'Lineal (R)' },
    { id: 'token', icon: '🎯', label: 'Token', gmOnly: true },
    { id: 'tile', icon: '🗺', label: 'Kachel', gmOnly: true },
  ];

  visibleTools = computed(() =>
    this.allTools.filter(t => !t.gmOnly || this.isGM())
  );

  ngOnInit(): void {
    const worldName = this.route.snapshot.paramMap.get('worldName') ?? '';
    const gmParam = this.route.snapshot.queryParamMap.get('gm');
    this.worldName.set(worldName);
    this.isGM.set(gmParam === 'true' || gmParam === '1');
    this.currentTool.set(this.isGM() ? 'pan' : 'select');

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
        this.renderOverlay();
        this.cdr.markForCheck();
      }),
      this.socket.patches$.subscribe(patch => {
        this.store.applyRemotePatch(patch);
      }),
      this.socket.measurements$.subscribe(m => {
        const ownId = this.socket.socketId;
        this.remoteMeasurements = ownId ? m.filter(x => x.id !== ownId) : m;
        this.renderOverlay();
        this.cdr.markForCheck();
      })
    );
  }

  ngAfterViewInit(): void {
    if (!this.viewerHost) return;
    this.viewer = OpenSeadragon({
      element: this.viewerHost.nativeElement,
      prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@5/build/openseadragon/images/',
      showNavigator: true,
      maxZoomPixelRatio: 6,
      gestureSettingsMouse: { clickToZoom: false },
      animationTime: 0.3,
    });

    this.viewer.addHandler('viewport-change', () => this.renderOverlay());
    this.viewer.addHandler('open', () => this.renderOverlay());

    const canvas = this.overlayCanvas?.nativeElement;
    if (canvas) {
      this.overlayCtx = canvas.getContext('2d') ?? undefined;
      this.resizeOverlay();
      window.addEventListener('resize', this.onResize);
      canvas.addEventListener('mousedown', this.onPointerDown);
      canvas.addEventListener('mousemove', this.onPointerMove);
      canvas.addEventListener('mouseup', this.onPointerUp);
      canvas.addEventListener('mouseleave', this.onPointerLeave);
    }
    this.updateOverlayInteraction();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.subs.forEach(s => s.unsubscribe());
    this.viewer?.destroy();
    this.viewer = undefined;
    this.store.destroy();
  }

  private onResize = (): void => {
    this.resizeOverlay();
    this.renderOverlay();
  };

  setTool(tool: WorldMapTool): void {
    this.currentTool.set(tool);
    this.updateOverlayInteraction();
    this.cdr.markForCheck();
  }

  private updateOverlayInteraction(): void {
    const wrap = this.viewerHost?.nativeElement.parentElement;
    if (!wrap) return;
    const tool = this.currentTool();
    wrap.classList.toggle('interactive', tool !== 'pan');
    wrap.classList.toggle('pan-mode', tool === 'pan');
    if (this.viewer) {
      this.viewer.setMouseNavEnabled(tool === 'pan');
    }
  }

  private resizeOverlay(): void {
    const canvas = this.overlayCanvas?.nativeElement;
    const host = this.viewerHost?.nativeElement;
    if (!canvas || !host) return;
    canvas.width = host.clientWidth;
    canvas.height = host.clientHeight;
  }

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
        !prev ||
        prev.x !== pos.x ||
        prev.y !== pos.y ||
        prev.imageId !== tile.imageId;

      if (this.osdTiles.has(tile.id)) {
        if (changed) {
          this.refreshTilePosition(tile.id, pos.x, pos.y, tile.imageId);
        }
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
            this.osdTileState.set(tile.id, {
              x: pos.x,
              y: pos.y,
              imageId: tile.imageId,
            });
          }
          this.renderOverlay();
        },
      });
    }
  }

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

  private onPointerDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    const tool = this.currentTool();
    const world = this.screenToWorld(e.clientX, e.clientY);
    const data = this.mapData();
    if (!world || !data) return;

    if (tool === 'tile' && this.isGM()) {
      const hit = findMacroTileAtWorldPixel(data.macroTiles, world.x, world.y);
      if (hit) {
        this.selectedMacroTileId.set(hit.tile.id);
        this.isDraggingTile = true;
        this.tileDragStart = world;
        this.tileDragOrigin = getMacroTilePosition(hit.tile);
        this.tileDragPreview = this.tileDragOrigin;
        this.cdr.markForCheck();
      }
      return;
    }

    if (tool === 'measure') {
      this.measureStartWorld = world;
      this.measureEndWorld = world;
      this.renderOverlay();
      return;
    }

    if (tool === 'draw' || tool === 'erase') {
      this.isDrawing = true;
      this.currentStroke = {
        id: generateId(),
        points: [world],
        color: this.brushColor(),
        lineWidth: this.brushSize(),
        isEraser: tool === 'erase',
      };
      return;
    }

    const pick = pickSubHexAtWorldPixel(data.macroTiles, world.x, world.y);
    if (!pick) return;

    if (tool === 'token') {
      if (this.isGM() && !this.selectedTokenId()) {
        this.store.createQuickTokenAt(pick);
        this.statusText.set(`Token auf ${pick.macroQ},${pick.macroR}`);
      }
      return;
    }

    const token = data.tokens.find(
      t =>
        t.macroQ === pick.macroQ &&
        t.macroR === pick.macroR &&
        t.subQ === pick.subQ &&
        t.subR === pick.subR
    );
    if (token) {
      this.selectedTokenId.set(token.id);
      this.cdr.markForCheck();
      return;
    }

    if (this.selectedTokenId()) {
      this.store.moveToken(this.selectedTokenId()!, pick);
      this.selectedTokenId.set(null);
      this.cdr.markForCheck();
      return;
    }

    if (tool === 'reveal' && this.isGM()) {
      this.store.revealSubHexes([pick]);
      return;
    }
    if (tool === 'recover' && this.isGM()) {
      this.store.recoverSubHexes([pick]);
      return;
    }

    if (tool === 'select') {
      const key = subHexKey(pick);
      const next = new Set(this.selectedSubHexes());
      if (e.shiftKey) {
        if (next.has(key)) next.delete(key);
        else next.add(key);
      } else {
        next.clear();
        next.add(key);
      }
      this.selectedSubHexes.set(next);
      this.cdr.markForCheck();
    }
  };

  private onPointerMove = (e: MouseEvent): void => {
    const world = this.screenToWorld(e.clientX, e.clientY);
    const data = this.mapData();

    if (this.isDraggingTile && this.tileDragStart && this.tileDragOrigin && this.selectedMacroTileId()) {
      if (!world) return;
      const dx = world.x - this.tileDragStart.x;
      const dy = world.y - this.tileDragStart.y;
      this.tileDragPreview = {
        x: this.tileDragOrigin.x + dx,
        y: this.tileDragOrigin.y + dy,
      };
      this.renderOverlay();
      return;
    }

    if (this.isDrawing && this.currentStroke && world) {
      this.currentStroke.points.push(world);
      this.renderOverlay();
      return;
    }

    if (this.currentTool() === 'measure' && this.measureStartWorld && world) {
      this.measureEndWorld = world;
      this.socket.sendMeasurement({
        id: this.socket.socketId ?? 'local',
        start: this.measureStartWorld,
        end: world,
        createdBy: this.socket.socketId ?? 'local',
      });
      this.renderOverlay();
    }

    if (data && world) {
      const pick = pickSubHexAtWorldPixel(data.macroTiles, world.x, world.y);
      this.hoverSubHex.set(pick);
      this.renderOverlay();
    } else {
      this.hoverSubHex.set(null);
      this.renderOverlay();
    }
  };

  private onPointerUp = (): void => {
    if (this.isDraggingTile) {
      if (this.tileDragPreview && this.selectedMacroTileId()) {
        this.store.updateMacroTile(this.selectedMacroTileId()!, {
          x: this.tileDragPreview.x,
          y: this.tileDragPreview.y,
        });
        this.refreshTilePosition(
          this.selectedMacroTileId()!,
          this.tileDragPreview.x,
          this.tileDragPreview.y
        );
      }
      this.isDraggingTile = false;
      this.tileDragStart = null;
      this.tileDragOrigin = null;
      this.tileDragPreview = null;
      return;
    }

    if (this.isDrawing && this.currentStroke) {
      if (this.currentStroke.points.length >= 2) {
        this.store.addStroke(this.currentStroke);
      }
      this.currentStroke = null;
      this.isDrawing = false;
      this.renderOverlay();
      return;
    }

    if (this.currentTool() === 'measure') {
      this.socket.sendMeasurement(null);
    }
  };

  private onPointerLeave = (): void => {
    this.hoverSubHex.set(null);
    this.renderOverlay();
  };

  private refreshTilePosition(
    tileId: string,
    x: number,
    y: number,
    imageId?: string
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
        this.renderOverlay();
      },
    });
  }

  async onTileFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      try {
        const imageId = await this.imageService.uploadImageFile(file, file.name);
        const coords = parseHexFilename(file.name);
        if (!coords) {
          this.statusText.set(`Keine hex_q_r Koordinaten in "${file.name}" — übersprungen`);
          continue;
        }
        const existing = this.mapData()?.macroTiles.find(
          t => t.q === coords.q && t.r === coords.r
        );
        if (existing) {
          this.store.updateMacroTile(existing.id, { imageId });
        } else {
          const pos = macroTilePosition(coords.q, coords.r);
          const tile: MacroTile = {
            id: generateId(),
            q: coords.q,
            r: coords.r,
            imageId,
            x: pos.x,
            y: pos.y,
          };
          this.store.addMacroTile(tile);
        }
        this.statusText.set(`Kachel ${coords.q},${coords.r} geladen`);
      } catch (err) {
        console.error('Tile upload failed:', err);
        this.statusText.set('Upload fehlgeschlagen');
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

  revealSelection(): void {
    const refs: SubHexRef[] = [];
    for (const key of this.selectedSubHexes()) {
      const ref = parseSubHexKey(key);
      if (ref) refs.push(ref);
    }
    if (refs.length) this.store.revealSubHexes(refs);
  }

  recoverSelection(): void {
    const refs: SubHexRef[] = [];
    for (const key of this.selectedSubHexes()) {
      const ref = parseSubHexKey(key);
      if (ref) refs.push(ref);
    }
    if (refs.length) this.store.recoverSubHexes(refs);
  }

  removeSelectedToken(): void {
    const id = this.selectedTokenId();
    if (!id) return;
    this.store.removeToken(id);
    this.selectedTokenId.set(null);
    this.cdr.markForCheck();
  }

  private renderOverlay(): void {
    const ctx = this.overlayCtx;
    const canvas = this.overlayCanvas?.nativeElement;
    const data = this.mapData();
    if (!ctx || !canvas || !data) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const revealed = new Set(data.revealedSubHexes);

    if (!this.isGM()) {
      this.drawFog(ctx, data, revealed);
    }

    this.drawStrokes(ctx, data);
    if (this.currentStroke) {
      this.drawStrokeWorld(ctx, this.currentStroke);
    }

    this.drawMeasurements(ctx);
    this.drawTokens(ctx, data);
    this.drawSelection(ctx, data, revealed);
    this.drawHover(ctx);
  }

  private drawFog(
    ctx: CanvasRenderingContext2D,
    data: WorldMapData,
    revealed: Set<string>
  ): void {
    for (const tile of data.macroTiles) {
      for (const sub of MACRO_SUB_HEXES) {
        const key = subHexKey({
          macroQ: tile.q,
          macroR: tile.r,
          subQ: sub.q,
          subR: sub.r,
        });
        if (revealed.has(key)) continue;
        const center = subHexToWorldPixel(tile, sub.q, sub.r);
        const screen = this.worldToScreen(center.x, center.y);
        if (!screen) continue;
        const r = this.imageSizeToScreen(SUB_HEX_RADIUS, tile.id);
        drawFlatHexPath(ctx, screen.x, screen.y, r);
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fill();
      }
    }
  }

  private drawStrokes(ctx: CanvasRenderingContext2D, data: WorldMapData): void {
    for (const stroke of data.strokes) {
      this.drawStrokeWorld(ctx, stroke);
    }
  }

  private drawStrokeWorld(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
    if (stroke.points.length < 2) return;
    // Convert world points to screen and draw
    const screenPts: Point[] = [];
    for (const p of stroke.points) {
      const s = this.worldToScreen(p.x, p.y);
      if (s) screenPts.push(s);
    }
    if (screenPts.length < 2) return;
    drawStrokeOnContext(ctx, { ...stroke, points: screenPts });
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
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const dist = subHexWorldDistance(m.start, m.end);
      const km = dist * KM_PER_SUB_HEX;
      const midX = (s.x + e.x) / 2;
      const midY = (s.y + e.y) / 2;
      ctx.fillStyle = '#ffcc00';
      ctx.font = '14px sans-serif';
      ctx.fillText(`${km.toFixed(1)} km`, midX + 6, midY - 6);
    }
  }

  private drawTokens(ctx: CanvasRenderingContext2D, data: WorldMapData): void {
    for (const token of data.tokens) {
      const tile = data.macroTiles.find(t => t.q === token.macroQ && t.r === token.macroR);
      if (!tile) continue;
      const center = subHexToWorldPixel(tile, token.subQ, token.subR);
      const screen = this.worldToScreen(center.x, center.y);
      if (!screen) continue;
      const r = this.imageSizeToScreen(SUB_HEX_RADIUS * 0.7, tile.id);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
      ctx.fillStyle = token.color ?? '#e74c3c';
      ctx.fill();
      ctx.strokeStyle = token.id === this.selectedTokenId() ? '#fff' : '#222';
      ctx.lineWidth = token.id === this.selectedTokenId() ? 3 : 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(10, r * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token.name.charAt(0).toUpperCase(), screen.x, screen.y);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
  }

  private drawSelection(
    ctx: CanvasRenderingContext2D,
    data: WorldMapData,
    revealed: Set<string>
  ): void {
    for (const key of this.selectedSubHexes()) {
      const ref = parseSubHexKey(key);
      if (!ref) continue;
      const tile = data.macroTiles.find(t => t.q === ref.macroQ && t.r === ref.macroR);
      if (!tile) continue;
      const center = subHexToWorldPixel(tile, ref.subQ, ref.subR);
      const screen = this.worldToScreen(center.x, center.y);
      if (!screen) continue;
      const r = this.imageSizeToScreen(SUB_HEX_RADIUS, tile.id);
      drawFlatHexPath(ctx, screen.x, screen.y, r);
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.95)';
      ctx.lineWidth = Math.max(2, r * 0.12);
      ctx.stroke();
    }

    if (this.isGM()) {
      for (const key of revealed) {
        const ref = parseSubHexKey(key);
        if (!ref) continue;
        const tile = data.macroTiles.find(t => t.q === ref.macroQ && t.r === ref.macroR);
        if (!tile) continue;
        const center = subHexToWorldPixel(tile, ref.subQ, ref.subR);
        const screen = this.worldToScreen(center.x, center.y);
        if (!screen) continue;
        const r = this.imageSizeToScreen(SUB_HEX_RADIUS, tile.id);
        drawFlatHexPath(ctx, screen.x, screen.y, r);
        ctx.strokeStyle = 'rgba(100, 255, 100, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const macroId = this.selectedMacroTileId();
    if (macroId && this.isGM()) {
      const tile = data.macroTiles.find(t => t.id === macroId);
      if (tile) {
        const pos = this.tileDragPreview ?? getMacroTilePosition(tile);
        const tl = this.worldToScreen(pos.x, pos.y);
        const br = this.worldToScreen(pos.x + HEX_WIDTH, pos.y + HEX_HEIGHT);
        if (tl && br) {
          ctx.strokeStyle = '#ff9900';
          ctx.lineWidth = 3;
          ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        }
      }
    }
  }

  private drawHover(ctx: CanvasRenderingContext2D): void {
    const hover = this.hoverSubHex();
    if (!hover) return;
    const data = this.mapData();
    if (!data) return;
    const tile = data.macroTiles.find(t => t.q === hover.macroQ && t.r === hover.macroR);
    if (!tile) return;
    const screen = this.worldToScreen(hover.worldX, hover.worldY);
    if (!screen) return;
    const r = this.imageSizeToScreen(SUB_HEX_RADIUS, tile.id);
    drawFlatHexPath(ctx, screen.x, screen.y, r);
    ctx.strokeStyle = 'rgba(0,255,255,0.7)';
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.stroke();
  }
}
