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
import { CoastSettings, TerrainView, defaultCoast, hexToRgb } from './terrain-view';
import { BrushEngine, BrushSettings, TerrainTool, defaultBrush, toolLayer } from './brush-engine';
import { Bounds } from './map-camera';
import { UndoStack, clone } from './undo-stack';
import { GroupMeta, MapAssets, PaperTextureMeta } from './map-assets';
import { SymbolView } from './symbol-view';
import { MapSymbol } from './map-editor.model';
import { generateId } from '../model/lobby.model';
import {
  EditorTab,
  LABEL_TOOL_DEFS,
  LabelTool,
  REGION_TOOL_DEFS,
  RegionTool,
  SYMBOL_TOOL_DEFS,
  SymbolTool,
  TAB_DEFS,
  autoVaries,
  iconUrl,
  isBrushTool,
  terrainToolsFor,
  usesLandPalette,
  usesWaterPalette,
} from './editor-tools';
import { RegionView, centroid, distanceToPath } from './region-view';
import { LabelView, defaultLabelStyle } from './label-view';
import { LabelPreset, LabelStyle, MapLabel, MapRegion, Point } from './map-editor.model';
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
  private regionView = new RegionView();
  private labelView = new LabelView();
  /** Vertex of the selected region currently being dragged. */
  private dragHandle: { index: number; before: MapRegion } | null = null;
  /** Labels currently being dragged, with their pre-drag copies for undo. */
  private dragLabel: {
    startWorld: Point;
    origins: Map<string, MapLabel>;
    moved: boolean;
  } | null = null;
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
  readonly symbolTools = SYMBOL_TOOL_DEFS;
  readonly regionTools = REGION_TOOL_DEFS;
  readonly labelTools = LABEL_TOOL_DEFS;

  readonly tab = signal<EditorTab>('land');
  readonly terrainTool = signal<TerrainTool>('landBrush');
  readonly symbolTool = signal<SymbolTool>('trees');
  readonly regionTool = signal<RegionTool>('draw');
  readonly labelTool = signal<LabelTool>('place');

  readonly icon = iconUrl;

  /** Icon tools shown under the active category. */
  readonly terrainTools = computed(() => terrainToolsFor(this.tab()));
  readonly isTerrainTab = computed(() => this.tab() === 'water' || this.tab() === 'land');

  /** The tool actually driving the pointer, derived from the active tab. */
  readonly activeToolLabel = computed(() => {
    if (this.tab() === 'symbols') {
      return this.symbolTools.find(t => t.id === this.symbolTool())?.label ?? '';
    }
    return this.terrainTools().find(t => t.id === this.terrainTool())?.label ?? '';
  });

  // Settings visibility, derived so no irrelevant control is ever shown.
  readonly showBrushSettings = computed(
    () => this.isTerrainTab() && isBrushTool(this.terrainTool()),
  );
  readonly showLandPalette = computed(
    () => this.isTerrainTab() && usesLandPalette(this.terrainTool()),
  );
  readonly showWaterPalette = computed(
    () => this.isTerrainTab() && usesWaterPalette(this.terrainTool()),
  );
  readonly isPlacingSymbols = computed(
    () => this.tab() === 'symbols' && this.symbolTool() !== 'select',
  );
  readonly isSelecting = computed(
    () => this.tab() === 'symbols' && this.symbolTool() === 'select',
  );
  /** Only bulk categories offer auto-variation; misc symbols stay as picked. */
  readonly symbolVaries = computed(() => {
    const t = this.symbolTool();
    return t !== 'select' && autoVaries(t);
  });

  readonly brushSize = signal(120);
  readonly brushSoftness = signal(0.35);
  readonly brushStrength = signal(1);
  /** Raggedness of the raise/lower brushes. */
  readonly brushNoise = signal(0.6);

  /** Only the terrain-reshaping brushes are noisy. */
  readonly showNoiseSetting = computed(
    () => this.terrainTool() === 'heighten' || this.terrainTool() === 'lower',
  );

  readonly landPalette = signal<string[]>([]);
  readonly waterPalette = signal<string[]>([]);
  readonly selectedLand = signal(0);
  readonly selectedWater = signal(0);

  /** Open sea's colour — the canvas nothing has been drawn on yet. */
  readonly waterBase = signal('#3f6d8c');

  readonly paperOptions = signal<PaperTextureMeta[]>([]);
  readonly paperTexture = signal('');
  readonly paperOpacity = signal(0.35);

  /** Coastline look — taste settings, tuned live and shared with everyone. */
  readonly coast = signal<CoastSettings>(defaultCoast());

  // ── symbols ──

  readonly activeGroup = signal<string>('');
  /** Every sprite in the active category, shown flat — no group navigation. */
  readonly categorySprites = signal<string[]>([]);
  readonly currentSprite = signal<string>('');
  /** Alt mirrors the stamp while held. */
  readonly mirrorStamp = signal(false);
  readonly symbolScale = signal(1);
  /** Random rotation spread, in degrees, applied per placement. */
  readonly rotationJitter = signal(0);
  /** Randomly mirror half the placements, so repeated symbols read less like clones. */
  readonly flipJitter = signal(false);
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

  // ── regions ──

  /** Vertices of the region being drawn; empty when not drawing. */
  readonly draftPoints = signal<Point[]>([]);
  readonly regionColor = signal('#c0392b');
  readonly regionThickness = signal(6);
  readonly regionDash = signal(28);
  readonly regionGap = signal(20);
  readonly regionFill = signal('#c0392b');
  readonly regionFillAlpha = signal(0.12);
  readonly selectedRegionId = signal<string | null>(null);

  // ── labels ──

  readonly labelStyle = signal<LabelStyle>(defaultLabelStyle());
  readonly labelText = signal('Neuer Name');
  readonly labelPresets = signal<LabelPreset[]>([]);
  readonly selectedLabelIds = signal<string[]>([]);
  /** Preset the panel is currently following, so it is visible which one is in use. */
  readonly activePresetId = signal<string | null>(null);

  readonly activePresetName = computed(
    () => this.labelPresets().find(p => p.id === this.activePresetId())?.name ?? null,
  );
  /** Single selection drives the text/style editors; multi-selection only moves. */
  readonly selectedLabelId = computed(() =>
    this.selectedLabelIds().length === 1 ? this.selectedLabelIds()[0] : null,
  );

  private isPanning = false;
  private isPainting = false;
  private lastPointer = { x: 0, y: 0 };
  private brushResize: { x: number; initial: number; scaling: 'brush' | 'symbol' } | null = null;
  private dragSymbols: {
    startWorld: { x: number; y: number };
    moved: boolean;
    /** Pre-drag copies, for the undo entry committed on release. */
    origins: Map<string, MapSymbol>;
  } | null = null;
  private boxSelect: { startWorld: { x: number; y: number }; startScreen: { x: number; y: number } } | null =
    null;
  private streamScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private lakeSeed = Math.floor(Math.random() * 1e9);
  /** World-space extent of the stroke in progress, for bounded post-stroke work. */
  private strokeBounds: Bounds | null = null;
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
    this.undoStack = new UndoStack(this.chunks, {
      // Undo replays through the store, so undoing a placement syncs as a real delete
      // rather than only vanishing on this screen.
      add: (c, obj) => this.store.addObject(c, obj),
      update: (c, id, patch) => this.store.updateObject(c, id, patch),
      remove: (c, id) => this.store.deleteObject(c, id),
    });
    this.chunks.onBeforePaint = rec => this.undoStack?.capture(rec);

    this.landPalette.set(data.landPalette);
    this.waterPalette.set(data.waterPalette);
    this.waterBase.set(data.settings.waterBase ?? '#3f6d8c');
    this.terrain.setWaterDefault(hexToRgb(this.waterBase(), [0.25, 0.43, 0.55]));

    const s = data.settings;
    const coast: CoastSettings = {
      noiseScale: s.coastNoiseScale ?? 260,
      noiseAmount: s.coastNoiseAmount ?? 0.35,
      shoreWidth: s.coastShoreWidth ?? 0.12,
      shoreLight: s.coastShoreLight ?? 0.18,
      shadowWidth: s.coastShadowWidth ?? 0.22,
      shadowStrength: s.coastShadowStrength ?? 0.35,
    };
    this.coast.set(coast);
    this.terrain.setCoast(coast);
    this.renderer.setShowGrid(data.settings.showGrid);
    this.showGrid.set(data.settings.showGrid);

    // Regions sit under symbols; labels sit on top of everything on the map.
    this.renderer.objectLayer.addChild(this.regionView.container);
    this.regionView.rebuild(data.regions);
    this.labelView.rebuild(data.labels);
    this.labelPresets.set(data.labelPresets ?? []);

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

    // Added last so labels draw above symbols regardless of asset availability.
    this.renderer.objectLayer.addChild(this.labelView.container);

    this.paperOpacity.set(data.settings.paperOpacity ?? 0.35);
    await this.applyPaper(data.settings.paperTexture ?? '');

    this.subs.push(
      this.store.chunkInvalidations$.subscribe(inv =>
        this.chunks?.invalidate(inv.layer, inv.cx, inv.cy),
      ),
      this.store.objectOps$.subscribe(op => {
        if (op.t !== 'add' && op.t !== 'upd' && op.t !== 'del') return;
        const data = this.store.data();

        if (op.c === 'symbols') {
          if (op.t === 'add') this.symbols?.add(op.v as MapSymbol);
          else if (op.t === 'del') this.symbols?.remove(op.id);
          else {
            const sym = data?.symbols.find(s => s.id === op.id);
            if (sym) this.symbols?.update(sym);
          }
        } else if (op.c === 'regions') {
          if (op.t === 'add') this.regionView.add(op.v as MapRegion);
          else if (op.t === 'del') this.regionView.remove(op.id);
          else {
            const r = data?.regions.find(x => x.id === op.id);
            if (r) this.regionView.update(r);
          }
        } else if (op.c === 'labels') {
          if (op.t === 'add') this.labelView.add(op.v as MapLabel);
          else if (op.t === 'del') this.labelView.remove(op.id);
          else {
            const l = data?.labels.find(x => x.id === op.id);
            if (l) this.labelView.update(l);
          }
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
      this.regionView.destroy();
      this.labelView.destroy();
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
      const view = this.renderer.camera.visibleBounds(0);
      const zoom = this.renderer.camera.zoom;
      this.symbols?.render(view, zoom, this.isGM());
      // Dash spacing and handle size are zoom-dependent, so regions redraw on view change.
      this.regionView.render(view, zoom, this.isGM(), true);
      // Zoom drives the selection outline's width, so it stays one screen pixel.
      this.labelView.render(view, this.isGM(), zoom);
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
      noise: this.brushNoise(),
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

    // Land and water own different tools, so entering a tab selects its first one.
    const tools = terrainToolsFor(tab);
    if (tools.length && !tools.some(t => t.id === this.terrainTool())) {
      this.terrainTool.set(tools[0].id);
    }
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
      // Whole category at once; groups still exist but are not navigated.
      const sprites = this.assets.spritesInCategory(tool);
      this.categorySprites.set(sprites);
      if (sprites.length) this.selectSprite(sprites[0]);
      this.setSelection([]);
    }
    this.redrawCursor();
  }

  /**
   * Choose the sprite the next click places.
   *
   * Picking a sprite also moves you into its group, which is what auto-variation draws
   * from — so choosing Inked Mountain 5 means later placements vary among inked mountains,
   * not across every mountain style on the map.
   */
  selectSprite(id: string): void {
    this.currentSprite.set(id);
    this.activeGroup.set(this.assets.groupOf(id));
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
    if (next) this.currentSprite.set(next);
    this.redrawCursor();
  }

  /** Step through the whole category — bound to Shift+wheel. */
  private cycleSprite(delta: number): void {
    const list = this.categorySprites();
    if (list.length === 0) return;
    const i = list.indexOf(this.currentSprite());
    const next = (((i < 0 ? 0 : i + delta) % list.length) + list.length) % list.length;
    this.selectSprite(list[next]);
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
      // Jitter keeps a forest from looking like one tree stamped in a grid.
      rotation: this.rotationJitter()
        ? ((Math.random() - 0.5) * this.rotationJitter() * Math.PI) / 180
        : 0,
      // Alt held mirrors deliberately; otherwise jitter may mirror at random.
      flipX: this.mirrorStamp() || (this.flipJitter() ? Math.random() < 0.5 : false),
    };

    // Colourable symbols take the colour of the ground actually beneath them, matching
    // Wonderdraft. Sampled once here rather than per frame — it is a GPU readback.
    if (meta?.colorable) {
      const ground = this.chunks?.sampleWorld('landColor', world.x, world.y);
      if (ground) symbol.tint = rgbToHex(ground.r, ground.g, ground.b);
    }

    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: 'symbols', id: symbol.id, before: null, after: clone(symbol) });
    this.store.addObject('symbols', symbol);
    this.undoStack?.commit('Symbol setzen');
    this.refreshHistoryState();

    // Only bulk categories re-roll; a town or castle stays exactly what was chosen.
    const cat = this.symbolTool();
    if (cat !== 'select' && autoVaries(cat) && this.autoVary()) this.rollNextSprite();
  }

  private eraseSymbolAt(world: { x: number; y: number }): void {
    const hit = this.symbols?.hitTest(world.x, world.y);
    if (!hit) return;

    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: 'symbols', id: hit.id, before: clone(hit), after: null });
    this.store.deleteObject('symbols', hit.id);
    this.undoStack?.commit('Symbol entfernen');
    this.refreshHistoryState();
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
    const data = this.store.data();
    if (!data) return;

    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (!sym) continue;
      this.undoStack?.recordObject({ c: 'symbols', id, before: clone(sym), after: null });
      this.store.deleteObject('symbols', id);
    }
    // One history step for the whole batch, so undo restores the lot.
    this.undoStack?.commit('Symbole löschen');
    this.refreshHistoryState();
    this.setSelection([]);
  }

  toggleSelectedSecret(): void {
    this.editSelected('Sichtbarkeit', sym => ({
      vis: sym.vis === 'secret' ? 'public' : 'secret',
    }));
  }

  /** Rescale every selected symbol by a factor. */
  scaleSelected(factor: number): void {
    this.editSelected('Symbolgröße', sym => ({
      scale: Math.max(0.05, Math.min(8, (sym.scale || 1) * factor)),
    }));
  }

  /** Rotate every selected symbol. */
  rotateSelected(radians: number): void {
    this.editSelected('Symbol drehen', sym => ({ rotation: (sym.rotation || 0) + radians }));
  }

  /** Mirror every selected symbol horizontally. */
  flipSelected(): void {
    this.editSelected('Symbol spiegeln', sym => ({ flipX: !sym.flipX }));
  }

  /** Apply a patch to the whole selection as a single undoable step. */
  private editSelected(
    label: string,
    patchFor: (sym: MapSymbol) => Record<string, unknown>,
  ): void {
    const data = this.store.data();
    if (!data) return;

    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      if (!sym) continue;
      const patch = patchFor(sym);
      this.undoStack?.recordObject({
        c: 'symbols',
        id,
        before: clone(sym),
        after: clone({ ...sym, ...patch }),
      });
      this.store.updateObject('symbols', id, patch);
    }
    this.undoStack?.commit(label);
    this.refreshHistoryState();
  }

  setSymbolScale(value: string | number): void {
    this.symbolScale.set(Number(value));
    this.redrawCursor();
  }

  // ── regions ──

  selectRegionTool(tool: RegionTool): void {
    this.regionTool.set(tool);
    if (tool !== 'draw') this.cancelDraft();
    this.redrawCursor();
  }

  /** Add a vertex to the region being drawn. */
  private addDraftPoint(world: Point): void {
    this.draftPoints.update(pts => [...pts, { x: world.x, y: world.y }]);
    this.redrawCursor();
  }

  /** Close the draft into a real region. */
  finishRegion(): void {
    const points = this.draftPoints();
    // Fewer than three vertices cannot enclose anything.
    if (points.length < 3) {
      this.cancelDraft();
      return;
    }

    const c = centroid(points);
    const region: MapRegion = {
      id: generateId(),
      x: c.x,
      y: c.y,
      vis: this.placeSecret() ? 'secret' : 'public',
      points,
      color: this.regionColor(),
      thickness: this.regionThickness(),
      dash: this.regionDash(),
      gap: this.regionGap(),
      fill: this.regionFill(),
      fillAlpha: this.regionFillAlpha(),
    };

    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: 'regions', id: region.id, before: null, after: clone(region) });
    this.store.addObject('regions', region);
    this.undoStack?.commit('Region');
    this.refreshHistoryState();

    this.draftPoints.set([]);
    this.redrawCursor();
  }

  cancelDraft(): void {
    if (this.draftPoints().length === 0) return;
    this.draftPoints.set([]);
    this.redrawCursor();
  }

  /** Remove the last placed vertex, for fixing a misclick mid-draw. */
  undoDraftPoint(): void {
    this.draftPoints.update(pts => pts.slice(0, -1));
    this.redrawCursor();
  }

  private selectRegionAt(world: Point): void {
    // Tolerance in world units, so clicking is equally forgiving at any zoom.
    const tol = 12 / this.renderer.camera.zoom;
    const hit = this.regionView.hitTest(world.x, world.y, tol);
    this.selectedRegionId.set(hit?.id ?? null);
    this.regionView.setSelected(hit?.id ?? null);
    this.scheduleStream();
  }

  /** Pick the selected region's vertices inside a rubber band. */
  private selectRegionPointsIn(rect: Bounds): void {
    this.regionView.setSelectedPoints(this.regionView.pointsInRect(rect));
    this.scheduleStream();
  }

  /** Pick every vertex, so dragging any one moves the whole region. */
  selectAllRegionPoints(): void {
    const region = this.regionView.selected;
    if (!region) return;
    this.regionView.setSelectedPoints(region.points.map((_, i) => i));
    this.scheduleStream();
  }

  deleteSelectedRegion(): void {
    const id = this.selectedRegionId();
    const region = id ? this.regionView.get(id) : undefined;
    if (!id || !region) return;

    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: 'regions', id, before: clone(region), after: null });
    this.store.deleteObject('regions', id);
    this.undoStack?.commit('Region löschen');
    this.refreshHistoryState();

    this.selectedRegionId.set(null);
    this.regionView.setSelected(null);
  }

  /** Apply the panel's styling to the selected region. */
  applyRegionStyle(): void {
    const id = this.selectedRegionId();
    const region = id ? this.regionView.get(id) : undefined;
    if (!id || !region) return;

    const patch = {
      color: this.regionColor(),
      thickness: this.regionThickness(),
      dash: this.regionDash(),
      gap: this.regionGap(),
      fill: this.regionFill(),
      fillAlpha: this.regionFillAlpha(),
    };
    this.undoStack?.begin();
    this.undoStack?.recordObject({
      c: 'regions',
      id,
      before: clone(region),
      after: clone({ ...region, ...patch }),
    });
    this.store.updateObject('regions', id, patch);
    this.undoStack?.commit('Regionstil');
    this.refreshHistoryState();
  }

  // ── labels ──

  selectLabelTool(tool: LabelTool): void {
    this.labelTool.set(tool);
    this.redrawCursor();
  }

  private placeLabel(world: Point): void {
    const label: MapLabel = {
      id: generateId(),
      x: world.x,
      y: world.y,
      vis: this.placeSecret() ? 'secret' : 'public',
      text: this.labelText() || 'Name',
      rotation: 0,
      style: { ...this.labelStyle() },
      presetId: this.activePresetId() ?? undefined,
    };

    this.undoStack?.begin();
    this.undoStack?.recordObject({ c: 'labels', id: label.id, before: null, after: clone(label) });
    this.store.addObject('labels', label);
    this.undoStack?.commit('Beschriftung');
    this.refreshHistoryState();

    this.setLabelSelection([label.id]);
  }

  private selectLabelAt(world: Point, additive: boolean): boolean {
    const hit = this.labelView.hitTest(world.x, world.y);
    if (!hit) {
      if (!additive) this.setLabelSelection([]);
      return false;
    }

    const current = this.selectedLabelIds();
    if (additive) {
      this.setLabelSelection(
        current.includes(hit.id) ? current.filter(i => i !== hit.id) : [...current, hit.id],
      );
    } else if (!current.includes(hit.id)) {
      this.setLabelSelection([hit.id]);
    }
    return true;
  }

  private setLabelSelection(ids: string[]): void {
    this.selectedLabelIds.set(ids);
    this.labelView.setSelection(ids);

    // A single selection loads into the editors so edits start from what is on screen.
    if (ids.length === 1) {
      const label = this.labelView.get(ids[0]);
      if (label) {
        this.labelStyle.set({ ...label.style });
        this.labelText.set(label.text);
        this.activePresetId.set(label.presetId ?? null);
      }
    }
    this.scheduleStream();
  }

  /** Push the panel's text and style onto the selected label. */
  applyLabelEdits(): void {
    const id = this.selectedLabelId();
    const label = id ? this.labelView.get(id) : undefined;
    if (!id || !label) return;

    const patch = { text: this.labelText(), style: { ...this.labelStyle() } };
    this.undoStack?.begin();
    this.undoStack?.recordObject({
      c: 'labels',
      id,
      before: clone(label),
      after: clone({ ...label, ...patch }),
    });
    this.store.updateObject('labels', id, patch);
    this.undoStack?.commit('Beschriftung ändern');
    this.refreshHistoryState();
  }

  /** Delete every selected label as one undoable step. */
  deleteSelectedLabel(): void {
    const ids = this.selectedLabelIds();
    if (ids.length === 0) return;

    this.undoStack?.begin();
    for (const id of ids) {
      const label = this.labelView.get(id);
      if (!label) continue;
      this.undoStack?.recordObject({ c: 'labels', id, before: clone(label), after: null });
      this.store.deleteObject('labels', id);
    }
    this.undoStack?.commit('Beschriftung löschen');
    this.refreshHistoryState();

    this.setLabelSelection([]);
  }

  setLabelStyle<K extends keyof LabelStyle>(key: K, value: LabelStyle[K]): void {
    this.labelStyle.update(s => ({ ...s, [key]: value }));
    // Live-apply while a label is selected, so the curvature slider shows its effect.
    if (this.selectedLabelId()) this.applyLabelEdits();
  }

  /**
   * Save the current style as a named preset.
   *
   * Re-saving under an existing name *overwrites* that preset and restyles every label
   * following it. That is the point of a preset: change "Stadtname" once and every city on
   * the map follows, rather than accumulating near-identical presets with the same name.
   */
  saveLabelPreset(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;

    const style = { ...this.labelStyle() };
    const existing = this.labelPresets().find(
      p => p.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      const next = this.labelPresets().map(p => (p.id === existing.id ? { ...p, style } : p));
      this.labelPresets.set(next);
      this.store.setPath('labelPresets', next);
      this.activePresetId.set(existing.id);
      this.restyleLabelsUsingPreset(existing.id, style);
      return;
    }

    const preset: LabelPreset = { id: generateId(), name: trimmed, style };
    const next = [...this.labelPresets(), preset];
    this.labelPresets.set(next);
    this.store.setPath('labelPresets', next);
    this.activePresetId.set(preset.id);

    // Adopt it for the current selection, so the label now follows this preset.
    const selected = this.selectedLabelId();
    if (selected) this.store.updateObject('labels', selected, { presetId: preset.id });
  }

  /** Push a preset's style onto every label that follows it. */
  private restyleLabelsUsingPreset(presetId: string, style: LabelStyle): void {
    const data = this.store.data();
    if (!data) return;

    const affected = data.labels.filter(l => l.presetId === presetId);
    if (affected.length === 0) return;

    this.undoStack?.begin();
    for (const label of affected) {
      this.undoStack?.recordObject({
        c: 'labels',
        id: label.id,
        before: clone(label),
        after: clone({ ...label, style }),
      });
      this.store.updateObject('labels', label.id, { style: { ...style } });
    }
    this.undoStack?.commit('Vorlage aktualisieren');
    this.refreshHistoryState();
  }

  applyLabelPreset(id: string): void {
    const preset = this.labelPresets().find(p => p.id === id);
    if (!preset) return;

    this.labelStyle.set({ ...preset.style });
    this.activePresetId.set(id);

    // Applying to a selection also binds it to the preset, so later edits carry through.
    const selected = this.selectedLabelId();
    if (selected) {
      this.store.updateObject('labels', selected, {
        style: { ...preset.style },
        presetId: id,
      });
      this.scheduleStream();
    }
  }

  removeLabelPreset(id: string): void {
    const next = this.labelPresets().filter(p => p.id !== id);
    this.labelPresets.set(next);
    this.store.setPath('labelPresets', next);
    if (this.activePresetId() === id) this.activePresetId.set(null);
    // Labels keep their inline style, so deleting a preset never changes the map.
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

    // Show the region taking shape, including the closing segment back to the start.
    if (this.tab() === 'regions' && this.regionTool() === 'draw') {
      const pts = this.draftPoints();
      if (pts.length > 0) {
        g.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
        g.lineTo(world.x, world.y);
        if (pts.length > 1) g.lineTo(pts[0].x, pts[0].y);
        g.stroke({ width: 2 / zoom, color: 0x8fd0ff, alpha: 0.9 });

        for (const p of pts) g.circle(p.x, p.y, 5 / zoom);
        g.fill({ color: 0x8fd0ff, alpha: 0.9 });
      }
      return;
    }

    // The selectors use the OS cursor, so no ring is drawn for them.
    if (!this.isTerrainTab()) return;

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

  /**
   * Ground colour under a point, throttled.
   *
   * Sampling is a GPU readback and stalls the pipeline, so the live preview must not do it
   * on every pointer move. Re-reading only when the pointer has travelled a little, or
   * enough time has passed, keeps the preview honest without the stall showing up as lag.
   */
  private groundTintAt(x: number, y: number): number {
    const now = performance.now();
    const moved = Math.hypot(x - this.tintCache.x, y - this.tintCache.y);
    if (moved < 24 && now - this.tintCache.at < 120) return this.tintCache.tint;

    const ground = this.chunks?.sampleWorld('landColor', x, y);
    const tint = ground ? (ground.r << 16) | (ground.g << 8) | ground.b : 0xffffff;
    this.tintCache = { x, y, at: now, tint };
    return tint;
  }

  private tintCache = { x: NaN, y: NaN, at: 0, tint: 0xffffff };

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
    // Negative x scale mirrors, so the preview shows the Alt state before committing.
    sprite.scale.set(this.mirrorStamp() ? -scale : scale, scale);

    sprite.tint = meta.colorable ? this.groundTintAt(world.x, world.y) : 0xffffff;

    sprite.alpha = 0.8;
    sprite.visible = true;
  }

  // ── painting ──

  /** Grow the stroke's recorded extent to include a dab at `world`. */
  private noteStrokeExtent(world: { x: number; y: number }): void {
    const r = this.brushSize() * 1.5;
    const b = this.strokeBounds;
    this.strokeBounds = b
      ? {
          minX: Math.min(b.minX, world.x - r),
          minY: Math.min(b.minY, world.y - r),
          maxX: Math.max(b.maxX, world.x + r),
          maxY: Math.max(b.maxY, world.y + r),
        }
      : { minX: world.x - r, minY: world.y - r, maxX: world.x + r, maxY: world.y + r };
  }

  private beginPaint(world: { x: number; y: number }): void {
    this.isPainting = true;
    this.strokeBounds = null;
    this.noteStrokeExtent(world);
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
    this.noteStrokeExtent(world);
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

    // Colourable symbols take the colour of the ground beneath them, so recolouring that
    // ground has to carry through to the symbols standing on it.
    if (toolLayer(this.terrainTool()) === 'landColor') this.resampleSymbolTints();

    this.refreshHistoryState();
    this.scheduleFlush();
  }

  /**
   * Re-read ground colour for colourable symbols the current stroke passed under.
   *
   * Bounded to the stroke's own area and run once at stroke end, because each sample is a
   * GPU readback. Symbols whose colour has not actually changed emit no op, so repainting
   * the same shade does not flood the network.
   */
  private resampleSymbolTints(): void {
    const data = this.store.data();
    if (!data || !this.symbols || !this.chunks) return;

    const bounds = this.strokeBounds;
    if (!bounds) return;

    const changed: { id: string; tint: string }[] = [];

    for (const sym of this.symbols.index.query(bounds)) {
      const meta = this.assets.meta(sym.asset);
      if (!meta?.colorable) continue;

      const ground = this.chunks.sampleWorld('landColor', sym.x, sym.y);
      const tint = ground ? rgbToHex(ground.r, ground.g, ground.b) : undefined;
      if (tint === sym.tint) continue;
      changed.push({ id: sym.id, tint: tint ?? '' });
    }

    if (changed.length === 0) return;

    this.undoStack?.begin();
    for (const c of changed) {
      const sym = data.symbols.find(s => s.id === c.id);
      if (!sym) continue;
      const patch = { tint: c.tint || undefined };
      this.undoStack?.recordObject({
        c: 'symbols',
        id: c.id,
        before: clone(sym),
        after: clone({ ...sym, ...patch }),
      });
      this.store.updateObject('symbols', c.id, patch);
    }
    this.undoStack?.commit('Symbolfarbe');
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
    // Alt is a held modifier, so its release matters as much as its press.
    window.addEventListener('keyup', this.onKeyUp);
  }

  private detachInput(host: HTMLElement): void {
    host.removeEventListener('pointerdown', this.onPointerDown);
    host.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    host.removeEventListener('wheel', this.onWheel);
    host.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private localPoint(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = (this.pixiHost!.nativeElement as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onContextMenu = (e: MouseEvent): void => e.preventDefault();

  private onPointerDown = (e: PointerEvent): void => {
    const p = this.localPoint(e);
    const world = this.renderer.camera.screenToWorld(p.x, p.y);

    // Right-click erases while placing symbols; Alt is reserved for mirroring the stamp.
    if (e.button === 2 && this.isGM() && this.isPlacingSymbols()) {
      this.eraseSymbolAt(world);
      return;
    }

    if (e.button === 1 || e.button === 2) {
      this.isPanning = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      return;
    }
    if (!this.isGM()) return;

    // Shift-drag rescales, for brushes and symbols alike.
    if (e.shiftKey && (this.isTerrainTab() || this.isPlacingSymbols())) {
      e.preventDefault();
      this.brushResize = this.isPlacingSymbols()
        ? { x: e.clientX, initial: this.symbolScale(), scaling: 'symbol' }
        : { x: e.clientX, initial: this.brushSize(), scaling: 'brush' };
      return;
    }

    if (this.tab() === 'regions') {
      if (this.regionTool() === 'draw') {
        this.addDraftPoint(world);
      } else {
        // Grab an existing vertex first; only fall through to picking a region if none.
        const tol = 10 / this.renderer.camera.zoom;
        const idx = this.regionView.hitHandle(world.x, world.y, tol);
        const current = this.regionView.selected;

        if (idx >= 0 && current) {
          // Dragging a vertex that is part of a multi-point selection moves the whole
          // selection, which is how a region gets repositioned or an edge nudged.
          const picked = this.regionView.selectedPoints;
          if (!picked.has(idx)) this.regionView.setSelectedPoints([idx]);
          this.dragHandle = { index: idx, before: clone(current) };
        } else if (this.regionView.hitTest(world.x, world.y, 12 / this.renderer.camera.zoom)) {
          this.selectRegionAt(world);
        } else if (this.regionView.selected) {
          // Empty space with a region already selected: rubber-band its vertices.
          this.boxSelect = { startWorld: world, startScreen: p };
          this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
        } else {
          this.selectRegionAt(world);
        }
      }
      return;
    }

    if (this.tab() === 'labels') {
      if (this.labelTool() === 'place') {
        this.placeLabel(world);
      } else if (this.selectLabelAt(world, e.shiftKey)) {
        const origins = new Map<string, MapLabel>();
        for (const id of this.selectedLabelIds()) {
          const l = this.labelView.get(id);
          if (l) origins.set(id, clone(l));
        }
        this.dragLabel = { startWorld: world, origins, moved: false };
      } else {
        // Empty space starts a rubber band, matching the symbol selector.
        this.boxSelect = { startWorld: world, startScreen: p };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      return;
    }

    if (this.isPlacingSymbols()) {
      this.placeSymbol(world);
      return;
    }

    if (this.isSelecting()) {
      const hit = this.selectSymbolAt(world, e.shiftKey);
      if (hit) {
        // Snapshot positions now: the drag mutates them in place, so capturing later
        // would record the already-moved state and undo to nothing.
        const data = this.store.data();
        const origins = new Map<string, MapSymbol>();
        for (const id of this.selectedIds()) {
          const sym = data?.symbols.find(s => s.id === id);
          if (sym) origins.set(id, clone(sym));
        }
        this.dragSymbols = { startWorld: world, moved: false, origins };
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

    if (this.dragHandle) {
      const region = this.regionView.selected;
      if (region) {
        const anchor = region.points[this.dragHandle.index];
        const dx = world.x - anchor.x;
        const dy = world.y - anchor.y;

        // Move every picked vertex by the same delta, so a boxed-up edge — or the whole
        // region — travels together instead of one point stretching away from the rest.
        for (const i of this.regionView.selectedPoints) {
          const p = region.points[i];
          if (p) {
            p.x += dx;
            p.y += dy;
          }
        }

        const c = centroid(region.points);
        region.x = c.x;
        region.y = c.y;
        this.regionView.update(region);
        this.scheduleStream();
      }
      return;
    }

    if (this.dragLabel) {
      const dx = world.x - this.dragLabel.startWorld.x;
      const dy = world.y - this.dragLabel.startWorld.y;
      this.dragLabel.startWorld = world;
      this.dragLabel.moved = true;

      for (const id of this.selectedLabelIds()) {
        const label = this.labelView.get(id);
        if (!label) continue;
        label.x += dx;
        label.y += dy;
        this.labelView.update(label);
      }
      this.scheduleStream();
      return;
    }

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

    if (this.dragHandle) {
      const region = this.regionView.selected;
      if (region) {
        this.undoStack?.begin();
        this.undoStack?.recordObject({
          c: 'regions',
          id: region.id,
          before: this.dragHandle.before,
          after: clone(region),
        });
        this.store.updateObject('regions', region.id, {
          points: region.points,
          x: region.x,
          y: region.y,
        });
        this.undoStack?.commit('Regionpunkt');
        this.refreshHistoryState();
      }
      this.dragHandle = null;
      return;
    }

    if (this.dragLabel) {
      if (this.dragLabel.moved) {
        this.undoStack?.begin();
        for (const [id, before] of this.dragLabel.origins) {
          const label = this.labelView.get(id);
          if (!label) continue;
          this.undoStack?.recordObject({ c: 'labels', id, before, after: clone(label) });
          this.store.updateObject('labels', id, { x: label.x, y: label.y });
        }
        this.undoStack?.commit('Beschriftung verschieben');
        this.refreshHistoryState();
      }
      this.dragLabel = null;
      return;
    }

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
      if (this.tab() === 'labels') {
        this.setLabelSelection(this.labelView.inRect(rect).map(l => l.id));
      } else if (this.tab() === 'regions') {
        // Select the region's vertices inside the box, so a whole edge can be dragged.
        this.selectRegionPointsIn(rect);
      } else {
        this.setSelection(this.symbols?.inRect(rect).map(s => s.id) ?? []);
      }

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
    const origins = this.dragSymbols?.origins;
    if (!data || !origins) return;

    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = data.symbols.find(s => s.id === id);
      const before = origins.get(id);
      if (!sym || !before) continue;
      this.undoStack?.recordObject({ c: 'symbols', id, before, after: clone(sym) });
      this.store.updateObject('symbols', id, { x: sym.x, y: sym.y });
    }
    this.undoStack?.commit('Symbole verschieben');
    this.refreshHistoryState();
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

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'Alt' && this.mirrorStamp()) {
      this.mirrorStamp.set(false);
      this.redrawCursor();
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

    if (e.key === 'Alt' && this.isPlacingSymbols()) {
      // Stop the browser stealing Alt for its menu bar while the stamp is mirrored.
      e.preventDefault();
      if (!this.mirrorStamp()) {
        this.mirrorStamp.set(true);
        this.redrawCursor();
      }
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
      return;
    }

    // Region drawing is modal, so it owns Enter/Escape/Backspace while a draft is open.
    if (this.tab() === 'regions' && this.regionTool() === 'draw' && this.draftPoints().length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.finishRegion();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelDraft();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        this.undoDraftPoint();
        return;
      }
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedIds().length) {
        e.preventDefault();
        this.deleteSelected();
      } else if (this.selectedRegionId()) {
        e.preventDefault();
        this.deleteSelectedRegion();
      } else if (this.selectedLabelId()) {
        e.preventDefault();
        this.deleteSelectedLabel();
      }
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

  /**
   * Tune one coastline parameter.
   *
   * Applied to the shader immediately for live feedback, but only synced on release —
   * dragging a slider would otherwise emit an op per pixel of travel.
   */
  setCoast<K extends keyof CoastSettings>(key: K, value: CoastSettings[K]): void {
    const next = { ...this.coast(), [key]: value };
    this.coast.set(next);
    this.terrain?.setCoast(next);
    this.scheduleStream();
  }

  /** Persist the coastline settings once a slider is released. */
  commitCoast(): void {
    const c = this.coast();
    this.store.setPath('settings.coastNoiseScale', c.noiseScale);
    this.store.setPath('settings.coastNoiseAmount', c.noiseAmount);
    this.store.setPath('settings.coastShoreWidth', c.shoreWidth);
    this.store.setPath('settings.coastShoreLight', c.shoreLight);
    this.store.setPath('settings.coastShadowWidth', c.shadowWidth);
    this.store.setPath('settings.coastShadowStrength', c.shadowStrength);
  }

  resetCoast(): void {
    const d = defaultCoast();
    this.coast.set(d);
    this.terrain?.setCoast(d);
    this.commitCoast();
    this.scheduleStream();
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
