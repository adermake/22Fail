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
import { GroupMeta, MapAssets, PaperTextureMeta, SymbolCategory } from './map-assets';
import { SymbolView } from './symbol-view';
import { MapSymbol } from './map-editor.model';
import { generateId } from '../model/lobby.model';
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

  /** Editor mode: terrain brushes, symbol placement, or symbol selection. */
  readonly mode = signal<'terrain' | 'symbols' | 'select'>('terrain');

  readonly activeTool = signal<TerrainTool>('landBrush');

  // ── symbols ──

  readonly categories: { id: SymbolCategory; label: string }[] = [
    { id: 'trees', label: 'Bäume' },
    { id: 'mountains', label: 'Berge' },
    { id: 'misc', label: 'Sonstiges' },
  ];

  readonly activeCategory = signal<SymbolCategory>('trees');
  readonly groups = signal<GroupMeta[]>([]);
  readonly activeGroup = signal<string>('');
  readonly symbolScale = signal(1);
  readonly placeSecret = signal(false);
  readonly selectedIds = signal<string[]>([]);
  readonly assetsReady = signal(false);
  /** Shown in place of the symbol panel when the atlas could not be loaded. */
  readonly assetsError = signal<string | null>(null);

  /** The variation the next click will place. Re-rolled after each placement. */
  private nextAsset: string | null = null;
  readonly brushSize = signal(120);
  readonly brushSoftness = signal(0.35);
  readonly brushStrength = signal(1);

  /**
   * Brush colours, chosen from the stored lists rather than free-form while drawing.
   * Selecting one only loads the brush — it does not recolour terrain already on the map.
   */
  readonly landPalette = signal<string[]>([]);
  readonly waterPalette = signal<string[]>([]);
  readonly selectedLand = signal(0);
  readonly selectedWater = signal(0);

  /** Base colours for *unpainted* terrain. Changing these is what recolours the map. */
  readonly landBase = signal('#7a8f5a');
  readonly waterBase = signal('#3f6d8c');

  /** Paper grain multiplied over the whole terrain stack. */
  readonly paperOptions = signal<PaperTextureMeta[]>([]);
  readonly paperTexture = signal('');
  readonly paperOpacity = signal(0.35);

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
  /**
   * Shift-drag brush resize, same gesture and feel as the lobby draw tools
   * (`world-map.component.ts`): the ring stays anchored where the drag began while
   * horizontal movement scales it.
   */
  private brushResize: { x: number; initialSize: number; world: { x: number; y: number } } | null =
    null;
  /** Active drag of the current symbol selection. */
  private dragSymbols: { startWorld: { x: number; y: number }; moved: boolean } | null = null;
  private streamScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  /** Re-rolled after each lake placement so consecutive lakes differ. */
  private lakeSeed = Math.floor(Math.random() * 1e9);
  private cursorGraphic = new Graphics();
  /** Faded preview of the next symbol to be placed. */
  private previewSprite = new Sprite();
  /** Last pointer position in world space, so the cursor can be redrawn in place. */
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

    // Snapshot pixels the instant before a brush overwrites them.
    this.chunks.onBeforePaint = rec => this.undoStack?.capture(rec);

    this.landPalette.set(data.landPalette);
    this.waterPalette.set(data.waterPalette);
    this.landBase.set(data.settings.landBase ?? '#7a8f5a');
    this.waterBase.set(data.settings.waterBase ?? '#3f6d8c');
    this.applyBaseColors();

    // The asset library is optional — a checkout without the Wonderdraft extract still runs.
    if (await this.assets.load()) {
      this.paperOptions.set(this.assets.paperTextures);
      this.assetsReady.set(true);

      this.symbols = new SymbolView(this.assets);
      this.renderer.objectLayer.addChild(this.symbols.container);
      this.symbols.rebuild(data.symbols);
      this.symbols.setLandColor(parseHexColor(this.landBase(), 0x7a8f5a));

      this.selectCategory('trees');
    } else {
      this.assetsError.set(this.assets.lastError);
    }
    this.paperOpacity.set(data.settings.paperOpacity ?? 0.35);
    await this.applyPaper(data.settings.paperTexture ?? '');
    this.renderer.setShowGrid(data.settings.showGrid);
    this.showGrid.set(data.settings.showGrid);

    this.subs.push(
      this.store.chunkInvalidations$.subscribe(inv =>
        this.chunks?.invalidate(inv.layer, inv.cx, inv.cy),
      ),
      // Keep the symbol index in step with local *and* remote edits.
      this.store.objectOps$.subscribe(op => {
        if (op.t !== 'add' && op.t !== 'upd' && op.t !== 'del') return;
        if (op.c !== 'symbols') return;

        if (op.t === 'add') {
          this.symbols?.add(op.v as MapSymbol);
        } else if (op.t === 'del') {
          this.symbols?.remove(op.id);
        } else {
          // The op carries only the changed fields; re-index from the merged object.
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

    // Persist anything painted but not yet uploaded before tearing GPU state down.
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
      const bounds = this.renderer.camera.visibleBounds(2048);
      this.chunks?.update(bounds);
      // Terrain follows the streamed set, so meshes never reference an evicted texture.
      this.terrain?.update(this.renderer.camera.visibleBounds(0));
      this.symbols?.render(
        this.renderer.camera.visibleBounds(0),
        this.renderer.camera.zoom,
        this.isGM(),
      );
    });
  }

  /** Push the *base* colours to the shader. Palette selection deliberately does not. */
  private applyBaseColors(): void {
    this.terrain?.setLandDefault(hexToRgb(this.landBase(), [0.48, 0.56, 0.35]));
    this.terrain?.setWaterDefault(hexToRgb(this.waterBase(), [0.25, 0.43, 0.55]));
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
      // A fresh seed means the next lake is a different shape. Redraw immediately so the
      // preview shows that next shape without waiting for the pointer to move.
      this.lakeSeed = Math.floor(Math.random() * 1e9);
      this.lastWorld = world;
      this.endPaint();
      this.redrawCursor();
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

  // ── symbols ──

  selectCategory(cat: SymbolCategory): void {
    this.activeCategory.set(cat);
    const groups = this.assets.groupsIn(cat);
    this.groups.set(groups);
    if (groups.length) this.selectGroup(groups[0].id);
  }

  selectGroup(id: string): void {
    this.activeGroup.set(id);
    this.rollNextAsset();
  }

  /** Pick the variation the next click will place, so the preview can show it. */
  private rollNextAsset(): void {
    this.nextAsset = this.assets.randomInGroup(this.activeGroup());
    this.redrawCursor();
  }

  private placeSymbol(world: { x: number; y: number }): void {
    if (!this.nextAsset) return;

    const symbol: MapSymbol = {
      id: generateId(),
      x: world.x,
      y: world.y,
      vis: this.placeSecret() ? 'secret' : 'public',
      asset: this.nextAsset,
      group: this.activeGroup(),
      scale: this.symbolScale(),
      rotation: 0,
    };

    this.store.addObject('symbols', symbol);
    // Re-roll so repeated clicks lay down varied symbols rather than a row of clones.
    this.rollNextAsset();
  }

  private eraseSymbolAt(world: { x: number; y: number }): void {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (hit) this.store.deleteObject('symbols', hit.id);
  }

  private selectSymbolAt(world: { x: number; y: number }, additive: boolean): void {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (!hit) {
      if (!additive) this.setSelection([]);
      return;
    }
    const current = this.selectedIds();
    if (additive) {
      this.setSelection(
        current.includes(hit.id) ? current.filter(i => i !== hit.id) : [...current, hit.id],
      );
    } else {
      this.setSelection([hit.id]);
    }
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

  /** Flip the selected symbols between GM-only and visible to players. */
  toggleSelectedSecret(): void {
    const data = this.store.data();
    if (!data) return;
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (!sym) continue;
      this.store.updateObject('symbols', id, { vis: sym.vis === 'secret' ? 'public' : 'secret' });
    }
  }

  setSymbolScale(value: string | number): void {
    this.symbolScale.set(Number(value));
    this.redrawCursor();
  }

  setMode(mode: 'terrain' | 'symbols' | 'select'): void {
    this.mode.set(mode);
    if (mode !== 'select') this.setSelection([]);
    this.redrawCursor();
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
    if (!this.isGM()) {
      this.previewSprite.visible = false;
      return;
    }

    const zoom = this.renderer.camera.zoom;

    // Symbol mode previews the actual next variation, faded, so you can see what a click
    // will drop and where it will sit before committing to it.
    if (this.mode() === 'symbols') {
      this.updateSymbolPreview(world);
      return;
    }
    this.previewSprite.visible = false;

    if (this.mode() === 'select') return;

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

  private updateSymbolPreview(world: { x: number; y: number }): void {
    const sprite = this.previewSprite;
    const meta = this.nextAsset ? this.assets.meta(this.nextAsset) : null;
    const texture = this.nextAsset ? this.assets.sprite(this.nextAsset) : null;

    if (!meta || !texture) {
      sprite.visible = false;
      return;
    }

    const scale = this.symbolScale();
    sprite.texture = texture;
    // Same base-anchored placement the real symbol will use, so the preview is truthful.
    sprite.position.set(world.x + meta.offsetX * scale, world.y + meta.offsetY * scale);
    sprite.scale.set(scale);
    sprite.tint = meta.colorable ? parseHexColor(this.landBase(), 0x7a8f5a) : 0xffffff;
    sprite.alpha = 0.8;
    sprite.visible = true;
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

    if (!this.isGM()) return;

    // Shift-drag resizes instead of painting — the lobby's brush gesture.
    if (e.shiftKey && this.mode() === 'terrain') {
      e.preventDefault();
      this.brushResize = { x: e.clientX, initialSize: this.brushSize(), world };
      this.lastWorld = world;
      this.redrawCursor();
      return;
    }

    switch (this.mode()) {
      case 'symbols':
        // Alt turns the placement tool into an eraser, so switching modes is not needed
        // just to remove a symbol that landed wrong.
        if (e.altKey) this.eraseSymbolAt(world);
        else this.placeSymbol(world);
        return;

      case 'select':
        this.selectSymbolAt(world, e.shiftKey);
        this.dragSymbols = this.selectedIds().length
          ? { startWorld: world, moved: false }
          : null;
        return;

      default:
        this.beginPaint(world);
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    const p = this.localPoint(e);
    const world = this.renderer.camera.screenToWorld(p.x, p.y);

    this.cursorWorld.set({ x: Math.round(world.x), y: Math.round(world.y) });
    this.cursorHex.set(worldToHex(world.x, world.y));

    if (this.brushResize) {
      // Scale in *world* units so the gesture feels the same at any zoom.
      const dx = e.clientX - this.brushResize.x;
      const next = this.brushResize.initialSize + (dx * 0.3) / this.renderer.camera.zoom;
      this.brushSize.set(Math.round(Math.min(2000, Math.max(4, next))));
      // Ring stays where the drag started, so it scales around a fixed point.
      this.drawCursor(this.brushResize.world);
      return;
    }

    this.lastWorld = world;
    this.drawCursor(world);

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
    if (this.dragSymbols) {
      // Positions were only moved locally during the drag; commit them once on release
      // rather than emitting an op per pointer move.
      if (this.dragSymbols.moved) this.commitSelectionMove();
      this.dragSymbols = null;
      return;
    }
    this.endPaint();
  };

  /** Move the selection locally while dragging, without touching the network. */
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
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedIds().length) {
      e.preventDefault();
      this.deleteSelected();
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

  /** Selecting a swatch only loads the brush — terrain already on the map is untouched. */
  selectLandColor(i: number): void {
    this.selectedLand.set(i);
  }

  selectWaterColor(i: number): void {
    this.selectedWater.set(i);
  }

  /**
   * Apply a paper texture by id ('' = none).
   *
   * `paperScale` is the world span of one tile. Wonderdraft's grain reads at roughly map
   * scale rather than pixel scale, so one tile covers a chunk-ish span instead of being
   * stretched over the whole world or repeating into moiré.
   */
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

  /** Base colour of unpainted land. This *is* the setting that recolours the map. */
  setLandBase(color: string): void {
    this.landBase.set(color);
    this.store.setPath('settings.landBase', color);
    this.applyBaseColors();
    // Colourable symbols are drawn in the land colour, so they follow it.
    this.symbols?.setLandColor(parseHexColor(color, 0x7a8f5a));
    this.scheduleStream();
  }

  setWaterBase(color: string): void {
    this.waterBase.set(color);
    this.store.setPath('settings.waterBase', color);
    this.applyBaseColors();
  }

  /** Palettes are shared map state, so additions sync to everyone. */
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

  /** Recolour an existing swatch in place, keeping its position in the palette. */
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

/** '#rrggbb' → 0xrrggbb, falling back rather than producing NaN tints. */
function parseHexColor(hex: string, fallback: number): number {
  const n = Number.parseInt((hex || '').replace('#', ''), 16);
  return Number.isNaN(n) ? fallback : n;
}

