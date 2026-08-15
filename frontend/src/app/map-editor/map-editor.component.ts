/**
 * Map Editor — the in-app replacement for drawing hex tiles in Wonderdraft.
 *
 * Layout follows the tool/settings split: the left rail holds tabs and their tools as
 * Wonderdraft's own icons, and the right panel shows settings for whichever tool is active.
 * That is why nothing here reads "show water colour while the land brush is selected" —
 * settings are derived from the tool, so irrelevant controls are simply absent.
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
import { Graphics, Sprite } from 'pixi.js';
import { Subscription } from 'rxjs';

import { MapEditorStoreService } from '../services/map-editor-store.service';
import { MapEditorApiService } from '../services/map-editor-api.service';
import { AuthService } from '../services/auth.service';
import { MapRenderer } from './map-renderer';
import { ChunkManager } from './chunk-manager';
import { TerrainView, hexToRgb } from './terrain-view';
import { BrushEngine, BrushSettings, TerrainTool, defaultBrush } from './brush-engine';
import { UndoStack } from './undo-stack';
import { GroupMeta, MapAssets, PaperTextureMeta } from './map-assets';
import { SymbolView } from './symbol-view';
import { MapSymbol } from './map-editor.model';
import { generateId } from '../model/lobby.model';
import {
  EditorTab,
  SYMBOL_TOOL_DEFS,
  SymbolTool,
  TAB_DEFS,
  TERRAIN_TOOL_DEFS,
  ToolDef,
  iconUrl,
  isBrushTool,
  usesLandPalette,
  usesWaterPalette,
} from './editor-tools';
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
  private terrain?: TerrainView;
  private brushes?: BrushEngine;
  private undoStack?: UndoStack;
  private assets = new MapAssets();
  private symbols?: SymbolView;
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

  // ── tabs & tools ──

  readonly tabs = TAB_DEFS;
  readonly terrainTools = TERRAIN_TOOL_DEFS;
  readonly symbolTools = SYMBOL_TOOL_DEFS;

  readonly tab = signal<EditorTab>('terrain');
  readonly terrainTool = signal<TerrainTool>('landBrush');
  readonly symbolTool = signal<SymbolTool>('trees');

  readonly icon = iconUrl;

  /** The tool actually driving the pointer, derived from the active tab. */
  readonly activeToolLabel = computed(() => {
    if (this.tab() === 'symbols') {
      return this.symbolTools.find(t => t.id === this.symbolTool())?.label ?? '';
    }
    return this.terrainTools.find(t => t.id === this.terrainTool())?.label ?? '';
  });

  // Settings visibility, derived so no irrelevant control is ever shown.
  readonly showBrushSettings = computed(
    () => this.tab() === 'terrain' && isBrushTool(this.terrainTool()),
  );
  readonly showLandPalette = computed(
    () => this.tab() === 'terrain' && usesLandPalette(this.terrainTool()),
  );
  readonly showWaterPalette = computed(
    () => this.tab() === 'terrain' && usesWaterPalette(this.terrainTool()),
  );
  readonly isPlacingSymbols = computed(
    () => this.tab() === 'symbols' && this.symbolTool() !== 'select',
  );
  readonly isSelecting = computed(
    () => this.tab() === 'symbols' && this.symbolTool() === 'select',
  );

  readonly brushSize = signal(120);
  readonly brushSoftness = signal(0.35);
  readonly brushStrength = signal(1);

  readonly landPalette = signal<string[]>([]);
  readonly waterPalette = signal<string[]>([]);
  readonly selectedLand = signal(0);
  readonly selectedWater = signal(0);

  /** Open sea's colour — the canvas nothing has been drawn on yet. */
  readonly waterBase = signal('#3f6d8c');

  readonly paperOptions = signal<PaperTextureMeta[]>([]);
  readonly paperTexture = signal('');
  readonly paperOpacity = signal(0.35);

  // ── symbols ──

  readonly groups = signal<GroupMeta[]>([]);
  readonly activeGroup = signal<string>('');
  readonly groupSprites = signal<string[]>([]);
  readonly currentSprite = signal<string>('');
  readonly symbolScale = signal(1);
  readonly placeSecret = signal(false);
  /** Auto-advance to another variation after each placement. */
  readonly autoVary = signal(true);
  readonly selectedIds = signal<string[]>([]);
  readonly assetsReady = signal(false);
  readonly assetsError = signal<string | null>(null);

  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly saving = signal(false);

  /** Rubber-band rectangle in screen space while box-selecting. */
  readonly marquee = signal<{ x: number; y: number; w: number; h: number } | null>(null);

  private isPanning = false;
  private isPainting = false;
  private lastPointer = { x: 0, y: 0 };
  private brushResize: { x: number; initial: number; scaling: 'brush' | 'symbol' } | null = null;
  private dragSymbols: { startWorld: { x: number; y: number }; moved: boolean } | null = null;
  private boxSelect: { startWorld: { x: number; y: number }; startScreen: { x: number; y: number } } | null =
    null;
  private streamScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private lakeSeed = Math.floor(Math.random() * 1e9);
  private cursorGraphic = new Graphics();
  private previewSprite = new Sprite();
  private lastWorld: { x: number; y: number } | null = null;

  async ngAfterViewInit(): Promise<void> {
    const host = this.pixiHost?.nativeElement;
    if (!host) return;

    const world = this.route.snapshot.paramMap.get('worldName') ?? '';
    this.worldName.set(world);

    await this.renderer.init(host);
    this.previewSprite.anchor.set(0.5);
    this.previewSprite.visible = false;
    this.renderer.cursorLayer.addChild(this.previewSprite, this.cursorGraphic);

    const data = await this.store.load(world);

    this.chunks = new ChunkManager(this.renderer.renderer, this.api, this.store, world);
    this.terrain = new TerrainView(this.chunks);
    this.renderer.terrainLayer.addChild(this.terrain.container);
    this.brushes = new BrushEngine(this.chunks, this.renderer.renderer);
    this.undoStack = new UndoStack(this.chunks);
    this.chunks.onBeforePaint = rec => this.undoStack?.capture(rec);

    this.landPalette.set(data.landPalette);
    this.waterPalette.set(data.waterPalette);
    this.waterBase.set(data.settings.waterBase ?? '#3f6d8c');
    this.terrain.setWaterDefault(hexToRgb(this.waterBase(), [0.25, 0.43, 0.55]));
    this.renderer.setShowGrid(data.settings.showGrid);
    this.showGrid.set(data.settings.showGrid);

    if (await this.assets.load()) {
      this.paperOptions.set(this.assets.paperTextures);
      this.assetsReady.set(true);

      this.symbols = new SymbolView(this.assets);
      this.renderer.objectLayer.addChild(this.symbols.container);
      this.symbols.rebuild(data.symbols);

      this.selectSymbolTool('trees');
    } else {
      this.assetsError.set(this.assets.lastError);
    }

    this.paperOpacity.set(data.settings.paperOpacity ?? 0.35);
    await this.applyPaper(data.settings.paperTexture ?? '');

    this.subs.push(
      this.store.chunkInvalidations$.subscribe(inv =>
        this.chunks?.invalidate(inv.layer, inv.cx, inv.cy),
      ),
      this.store.objectOps$.subscribe(op => {
        if (op.t !== 'add' && op.t !== 'upd' && op.t !== 'del') return;
        if (op.c !== 'symbols') return;

        if (op.t === 'add') this.symbols?.add(op.v as MapSymbol);
        else if (op.t === 'del') this.symbols?.remove(op.id);
        else {
          const sym = this.store.data()?.symbols.find(s => s.id === op.id);
          if (sym) this.symbols?.update(sym);
        }
        this.scheduleStream();
      }),
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

    void this.chunks?.flushDirty().finally(() => {
      this.undoStack?.destroy();
      this.symbols?.destroy();
      this.assets.destroy();
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
      this.chunks?.update(this.renderer.camera.visibleBounds(2048));
      this.terrain?.update(this.renderer.camera.visibleBounds(0));
      this.symbols?.render(
        this.renderer.camera.visibleBounds(0),
        this.renderer.camera.zoom,
        this.isGM(),
      );
    });
  }

  private brush(): BrushSettings {
    return {
      ...defaultBrush(),
      tool: this.terrainTool(),
      size: this.brushSize(),
      softness: this.brushSoftness(),
      strength: this.brushStrength(),
      color: this.activeBrushColor(),
    };
  }

  /** The palette colour the active tool paints with. */
  private activeBrushColor(): string {
    if (usesWaterPalette(this.terrainTool())) {
      return this.waterPalette()[this.selectedWater()] ?? '#3f6d8c';
    }
    // Land tools default to white so a new landmass starts blank.
    return this.landPalette()[this.selectedLand()] ?? '#ffffff';
  }

  // ── tabs & tool selection ──

  selectTab(tab: EditorTab): void {
    this.tab.set(tab);
    if (tab !== 'symbols') this.setSelection([]);
    this.redrawCursor();
  }

  selectTerrainTool(tool: TerrainTool): void {
    this.terrainTool.set(tool);
    this.redrawCursor();
  }

  selectSymbolTool(tool: SymbolTool): void {
    this.symbolTool.set(tool);
    if (tool === 'select') {
      this.previewSprite.visible = false;
    } else {
      const groups = this.assets.groupsIn(tool);
      this.groups.set(groups);
      if (groups.length) this.selectGroup(groups[0].id);
      this.setSelection([]);
    }
    this.redrawCursor();
  }

  selectGroup(id: string): void {
    this.activeGroup.set(id);
    const group = this.assets.group(id);
    this.groupSprites.set(group?.sprites ?? []);
    this.rollNextSprite();
  }

  /** Choose the sprite the next click places. */
  selectSprite(id: string): void {
    this.currentSprite.set(id);
    this.redrawCursor();
  }

  /** Thumbnail style for a picker cell, sliced out of the atlas page. */
  spriteThumb(id: string): Record<string, string> {
    return this.assets.thumbStyle(id, 44);
  }

  spriteName(id: string): string {
    return this.assets.meta(id)?.name ?? id;
  }

  private rollNextSprite(): void {
    const next = this.assets.randomInGroup(this.activeGroup());
    this.currentSprite.set(next ?? '');
    this.redrawCursor();
  }

  /** Step through the current group's sprites — bound to Shift+wheel. */
  private cycleSprite(delta: number): void {
    const list = this.groupSprites();
    if (list.length === 0) return;
    const i = list.indexOf(this.currentSprite());
    const next = (((i < 0 ? 0 : i + delta) % list.length) + list.length) % list.length;
    this.currentSprite.set(list[next]);
    this.redrawCursor();
  }

  // ── symbol placement ──

  private placeSymbol(world: { x: number; y: number }): void {
    const asset = this.currentSprite();
    if (!asset) return;

    const meta = this.assets.meta(asset);
    const symbol: MapSymbol = {
      id: generateId(),
      x: world.x,
      y: world.y,
      vis: this.placeSecret() ? 'secret' : 'public',
      asset,
      group: this.activeGroup(),
      scale: this.symbolScale(),
      rotation: 0,
    };

    // Colourable symbols take the colour of the ground actually beneath them, matching
    // Wonderdraft. Sampled once here rather than per frame — it is a GPU readback.
    if (meta?.colorable) {
      const ground = this.chunks?.sampleWorld('landColor', world.x, world.y);
      if (ground) symbol.tint = rgbToHex(ground.r, ground.g, ground.b);
    }

    this.store.addObject('symbols', symbol);
    if (this.autoVary()) this.rollNextSprite();
  }

  private eraseSymbolAt(world: { x: number; y: number }): void {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (hit) this.store.deleteObject('symbols', hit.id);
  }

  private selectSymbolAt(world: { x: number; y: number }, additive: boolean): boolean {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (!hit) {
      if (!additive) this.setSelection([]);
      return false;
    }
    const current = this.selectedIds();
    if (additive) {
      this.setSelection(
        current.includes(hit.id) ? current.filter(i => i !== hit.id) : [...current, hit.id],
      );
    } else if (!current.includes(hit.id)) {
      this.setSelection([hit.id]);
    }
    return true;
  }

  private setSelection(ids: string[]): void {
    this.selectedIds.set(ids);
    this.symbols?.setSelection(ids);
    this.scheduleStream();
  }

  deleteSelected(): void {
    for (const id of this.selectedIds()) this.store.deleteObject('symbols', id);
    this.setSelection([]);
  }

  toggleSelectedSecret(): void {
    const data = this.store.data();
    if (!data) return;
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (!sym) continue;
      this.store.updateObject('symbols', id, { vis: sym.vis === 'secret' ? 'public' : 'secret' });
    }
  }

  /** Rescale every selected symbol by a factor. */
  scaleSelected(factor: number): void {
    const data = this.store.data();
    if (!data) return;
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (!sym) continue;
      const scale = Math.max(0.05, Math.min(8, (sym.scale || 1) * factor));
      this.store.updateObject('symbols', id, { scale });
    }
  }

  setSymbolScale(value: string | number): void {
    this.symbolScale.set(Number(value));
    this.redrawCursor();
  }

  // ── cursor ──

  private redrawCursor(): void {
    if (this.lastWorld) this.drawCursor(this.lastWorld);
    else this.cursorGraphic.clear();
  }

  private drawCursor(world: { x: number; y: number }): void {
    const g = this.cursorGraphic;
    g.clear();
    if (!this.isGM()) {
      this.previewSprite.visible = false;
      return;
    }

    const zoom = this.renderer.camera.zoom;

    if (this.isPlacingSymbols()) {
      this.updateSymbolPreview(world);
      return;
    }
    this.previewSprite.visible = false;

    // The selector uses the OS cursor, so no ring is drawn for it.
    if (this.tab() !== 'terrain') return;

    if (this.terrainTool() === 'lakeStamp') {
      const outline = this.brushes?.lakeOutline(world.x, world.y, this.brushSize(), this.lakeSeed);
      if (outline?.length) {
        g.poly(outline).stroke({ width: 1.5 / zoom, color: 0x8fd0ff, alpha: 0.9 });
      }
      return;
    }

    g.circle(world.x, world.y, this.brushSize());
    g.stroke({ width: 1.5 / zoom, color: 0xffffff, alpha: 0.75 });

    const solid = this.brushSize() * (1 - Math.min(0.95, this.brushSoftness()));
    if (solid > 1) {
      g.circle(world.x, world.y, solid);
      g.stroke({ width: 1 / zoom, color: 0xffffff, alpha: 0.3 });
    }
  }

  private updateSymbolPreview(world: { x: number; y: number }): void {
    const sprite = this.previewSprite;
    const asset = this.currentSprite();
    const meta = asset ? this.assets.meta(asset) : null;
    const texture = asset ? this.assets.sprite(asset) : null;

    if (!meta || !texture) {
      sprite.visible = false;
      return;
    }

    const scale = this.symbolScale();
    sprite.texture = texture;
    sprite.position.set(world.x + meta.offsetX * scale, world.y + meta.offsetY * scale);
    sprite.scale.set(scale);
    sprite.tint = 0xffffff;
    sprite.alpha = 0.8;
    sprite.visible = true;
  }

  // ── painting ──

  private beginPaint(world: { x: number; y: number }): void {
    this.isPainting = true;
    this.undoStack?.begin();
    this.brushes?.beginStroke();

    if (this.terrainTool() === 'lakeStamp') {
      this.brushes?.stampLake(
        world.x,
        world.y,
        this.brushSize(),
        this.lakeSeed,
        this.activeBrushColor(),
      );
      this.lakeSeed = Math.floor(Math.random() * 1e9);
      this.lastWorld = world;
      this.endPaint();
      this.redrawCursor();
      return;
    }

    this.brushes?.stroke(world, this.brush());
  }

  private continuePaint(world: { x: number; y: number }): void {
    if (!this.isPainting || this.terrainTool() === 'lakeStamp') return;
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
    this.undoStack?.commit(this.terrainTool());
    this.refreshHistoryState();
    this.scheduleFlush();
  }

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

    if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      return;
    }
    if (!this.isGM()) return;

    // Shift-drag rescales, for brushes and symbols alike.
    if (e.shiftKey && (this.tab() === 'terrain' || this.isPlacingSymbols())) {
      e.preventDefault();
      this.brushResize = this.isPlacingSymbols()
        ? { x: e.clientX, initial: this.symbolScale(), scaling: 'symbol' }
        : { x: e.clientX, initial: this.brushSize(), scaling: 'brush' };
      return;
    }

    if (this.isPlacingSymbols()) {
      if (e.altKey) this.eraseSymbolAt(world);
      else this.placeSymbol(world);
      return;
    }

    if (this.isSelecting()) {
      const hit = this.selectSymbolAt(world, e.shiftKey);
      if (hit) {
        this.dragSymbols = { startWorld: world, moved: false };
      } else {
        // Empty space starts a rubber band rather than doing nothing.
        this.boxSelect = { startWorld: world, startScreen: p };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
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

    if (this.brushResize) {
      const dx = e.clientX - this.brushResize.x;
      if (this.brushResize.scaling === 'symbol') {
        // Multiplicative: a scale of 0.2 and one of 4 both need to feel controllable.
        const next = this.brushResize.initial * Math.pow(1.01, dx);
        this.symbolScale.set(Math.min(8, Math.max(0.05, Math.round(next * 100) / 100)));
      } else {
        const next = this.brushResize.initial + (dx * 0.3) / this.renderer.camera.zoom;
        this.brushSize.set(Math.round(Math.min(2000, Math.max(4, next))));
      }
      // The cursor keeps following the pointer while resizing, rather than freezing.
      this.drawCursor(world);
      return;
    }

    this.drawCursor(world);

    if (this.boxSelect) {
      const s = this.boxSelect.startScreen;
      this.marquee.set({
        x: Math.min(s.x, p.x),
        y: Math.min(s.y, p.y),
        w: Math.abs(p.x - s.x),
        h: Math.abs(p.y - s.y),
      });
      return;
    }

    if (this.dragSymbols) {
      this.dragSelection(world);
      return;
    }

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

    if (this.brushResize) {
      this.brushResize = null;
      this.redrawCursor();
      return;
    }

    if (this.boxSelect) {
      const start = this.boxSelect.startWorld;
      const end = this.lastWorld ?? start;
      const rect = {
        minX: Math.min(start.x, end.x),
        minY: Math.min(start.y, end.y),
        maxX: Math.max(start.x, end.x),
        maxY: Math.max(start.y, end.y),
      };
      const hits = this.symbols?.inRect(rect) ?? [];
      this.setSelection(hits.map(s => s.id));
      this.boxSelect = null;
      this.marquee.set(null);
      return;
    }

    if (this.dragSymbols) {
      if (this.dragSymbols.moved) this.commitSelectionMove();
      this.dragSymbols = null;
      return;
    }

    this.endPaint();
  };

  private dragSelection(world: { x: number; y: number }): void {
    const drag = this.dragSymbols;
    const data = this.store.data();
    if (!drag || !data) return;

    const dx = world.x - drag.startWorld.x;
    const dy = world.y - drag.startWorld.y;
    if (dx === 0 && dy === 0) return;
    drag.moved = true;
    drag.startWorld = world;

    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (!sym) continue;
      sym.x += dx;
      sym.y += dy;
      this.symbols?.update(sym);
    }
    this.scheduleStream();
  }

  private commitSelectionMove(): void {
    const data = this.store.data();
    if (!data) return;
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (sym) this.store.updateObject('symbols', id, { x: sym.x, y: sym.y });
    }
  }

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const p = this.localPoint(e);

    // Shift+wheel steps through the current group's symbols.
    if (e.shiftKey && this.isPlacingSymbols()) {
      this.cycleSprite(e.deltaY > 0 ? 1 : -1);
      return;
    }

    if (e.ctrlKey) {
      if (this.isPlacingSymbols()) {
        const next = this.symbolScale() * (e.deltaY > 0 ? 1 / 1.15 : 1.15);
        this.symbolScale.set(Math.min(8, Math.max(0.05, Math.round(next * 100) / 100)));
      } else {
        const next = this.brushSize() * (e.deltaY > 0 ? 1 / 1.15 : 1.15);
        this.brushSize.set(Math.round(Math.min(2000, Math.max(4, next))));
      }
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
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedIds().length) {
      e.preventDefault();
      this.deleteSelected();
    }
  };

  // ── palettes & map settings ──

  selectLandColor(i: number): void {
    this.selectedLand.set(i);
  }

  selectWaterColor(i: number): void {
    this.selectedWater.set(i);
  }

  addLandColor(color: string): void {
    const next = [...this.landPalette(), color];
    this.landPalette.set(next);
    this.selectedLand.set(next.length - 1);
    this.store.setPath('landPalette', next);
  }

  addWaterColor(color: string): void {
    const next = [...this.waterPalette(), color];
    this.waterPalette.set(next);
    this.selectedWater.set(next.length - 1);
    this.store.setPath('waterPalette', next);
  }

  editLandColor(i: number, color: string): void {
    const next = this.landPalette().map((c, idx) => (idx === i ? color : c));
    this.landPalette.set(next);
    this.store.setPath('landPalette', next);
  }

  editWaterColor(i: number, color: string): void {
    const next = this.waterPalette().map((c, idx) => (idx === i ? color : c));
    this.waterPalette.set(next);
    this.store.setPath('waterPalette', next);
  }

  removeLandColor(i: number): void {
    const next = this.landPalette().filter((_, idx) => idx !== i);
    this.landPalette.set(next);
    this.selectedLand.set(Math.max(0, Math.min(this.selectedLand(), next.length - 1)));
    this.store.setPath('landPalette', next);
  }

  removeWaterColor(i: number): void {
    const next = this.waterPalette().filter((_, idx) => idx !== i);
    this.waterPalette.set(next);
    this.selectedWater.set(Math.max(0, Math.min(this.selectedWater(), next.length - 1)));
    this.store.setPath('waterPalette', next);
  }

  setWaterBase(color: string): void {
    this.waterBase.set(color);
    this.store.setPath('settings.waterBase', color);
    this.terrain?.setWaterDefault(hexToRgb(color, [0.25, 0.43, 0.55]));
  }

  private async applyPaper(id: string): Promise<void> {
    this.paperTexture.set(id);
    const texture = id ? await this.assets.paper(id) : null;
    this.terrain?.setPaper(texture, this.paperOpacity(), 2048);
  }

  async selectPaper(id: string): Promise<void> {
    await this.applyPaper(id);
    this.store.setPath('settings.paperTexture', id);
  }

  async setPaperOpacity(value: string | number): Promise<void> {
    this.paperOpacity.set(Number(value));
    await this.applyPaper(this.paperTexture());
    this.store.setPath('settings.paperOpacity', this.paperOpacity());
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

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
