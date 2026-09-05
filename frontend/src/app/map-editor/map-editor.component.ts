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
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/** Which of a tier's three rasters the isolate inspector draws. */
type InspectLayer = 'all' | 'height' | 'landColor' | 'waterColor';
import { ActivatedRoute } from '@angular/router';
import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Subscription } from 'rxjs';

import { MapEditorStoreService } from '../services/map-editor-store.service';
import { MapEditorApiService } from '../services/map-editor-api.service';
import { AuthService } from '../services/auth.service';
import { MapRenderer } from './map-renderer';
import { ChunkManager, Sample, StampPass } from './chunk-manager';
import { CoastSettings, TerrainView, defaultCoast, hexToRgb } from './terrain-view';
import {
  BRUSH_TEXTURES,
  BrushEngine,
  BrushSettings,
  BrushTexture,
  TerrainTool,
  defaultBrush,
  parseHex,
  toolIsTierLocal,
  toolLayer,
} from './brush-engine';
import { Bounds } from './map-camera';
import { UndoStack, clone } from './undo-stack';
import { GroupMeta, MapAssets, PaperTextureMeta } from './map-assets';
import { SymbolView } from './symbol-view';
import {
  AnyMapObject,
  DetailTier,
  MapEditorData,
  MapOp,
  MapSecret,
  MapSymbol,
  MapToken,
  SketchStroke,
  OBJECT_COLLECTIONS,
  RasterLayer,
  TIERS,
  coarserTiers,
} from './map-editor.model';
import {
  ObjectRef,
  SecretSummary,
  dissolveOps,
  find,
  groupOps,
  membersOf,
  newSecretId,
  moveOps,
  pickTightest,
  refKey,
  revealOps,
  secretNameFor,
  secretsOf,
  summarize,
  ungroupOps,
} from './map-secrets';
import { FogView } from './fog-view';
import { ERASER_COLOR, SketchView } from './sketch-view';
import { MeasureLine, PlayAidsView } from './play-aids';

import { PingController } from '../shared/ping/ping-controller';
import { PingLayerComponent, RenderedPing } from '../shared/ping/ping-layer.component';
import { PingWheelComponent } from '../shared/ping/ping-wheel.component';
import {
  OverviewGroup,
  OverviewItem,
  SecretOverview,
  boundsOverlap,
} from './secret-overview';
import {
  IMPORT_CELL_WARN,
  LandmassPlacement,
  LandmassSource,
  buildLandmassMasks,
  edgeCells,
  fitScale,
  importCellCount,
  innerCellRect,
  loadLandmassImage,
  placementBounds,
  recommendedTier,
  worldPerTexel,
} from './landmass-import';
import { DiagEvent, mapDiag } from './map-diagnostics';
import { generateId } from '../model/lobby.model';
import {
  BRUSH_PROFILES,
  BRUSH_TEXTURE_DEFS,
  EditorTab,
  LABEL_TOOL_DEFS,
  LabelTool,
  DRAW_COLORS,
  FogMode,
  GameTool,
  PEN_SIZES,
  REGION_TOOL_DEFS,
  RegionTool,
  SYMBOL_TOOL_DEFS,
  SymbolTool,
  TAB_DEFS,
  autoVaries,
  iconUrl,
  isBrushTool,
  gameToolsFor,
  terrainToolsFor,
  usesLandPalette,
  usesWaterPalette,
} from './editor-tools';
import { RegionView, centroid, distanceToPath, pathBounds } from './region-view';
import { LabelView, defaultLabelStyle } from './label-view';
import { LabelPreset, LabelStyle, MapLabel, MapRegion, Point } from './map-editor.model';
import { MIN_ZOOM, MAX_ZOOM } from './map-camera';
import {
  KM_PER_HEX,
  hexCorners,
  hexKey,
  hexRangeForBounds,
  hexToWorld,
  hexesInRadius,
  worldToHex,
  worldToKm,
} from './map-hex';

@Component({
  selector: 'app-map-editor',
  standalone: true,
  imports: [CommonModule, PingLayerComponent, PingWheelComponent],
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapEditorComponent implements AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private store = inject(MapEditorStoreService);
  private api = inject(MapEditorApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('pixiHost') pixiHost?: ElementRef<HTMLDivElement>;

  private renderer = new MapRenderer();
  private chunks?: ChunkManager;
  private terrain?: TerrainView;
  private brushes?: BrushEngine;
  private undoStack?: UndoStack;
  private assets = new MapAssets();
  private symbols?: SymbolView;
  private secretOverview?: SecretOverview;
  private fogView?: FogView;
  private sketchView?: SketchView;
  private playAids?: PlayAidsView;
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

  readonly brushSize = signal(400);
  readonly brushSoftness = signal(0.35);
  readonly brushStrength = signal(1);
  /** Raggedness of the raise/lower brushes. */
  readonly brushNoise = signal(0.6);
  /** Stamp character. Softness alone made every brush the same circle. */
  readonly brushTexture = signal<BrushTexture>('smooth');
  readonly brushTextures = BRUSH_TEXTURE_DEFS;

  setBrushTexture(id: BrushTexture): void {
    this.brushTexture.set(id);
    this.saveBrushPrefs();
    this.redrawCursor();
  }

  /** Only the terrain-reshaping brushes are noisy. */
  readonly showNoiseSetting = computed(() =>
    ['heighten', 'lower', 'lakeStamp'].includes(this.terrainTool()),
  );

  readonly brushProfiles = BRUSH_PROFILES;
  readonly activeProfile = signal<string>('soft');

  /** Load a brush profile; the sliders stay available for fine-tuning afterwards. */
  applyBrushProfile(id: string): void {
    const p = this.brushProfiles.find(x => x.id === id);
    if (!p) return;
    this.activeProfile.set(id);
    this.brushSoftness.set(p.softness);
    this.brushStrength.set(p.strength);
    this.brushNoise.set(p.noise);
    this.brushTexture.set(p.texture);
    this.saveBrushPrefs();
    this.redrawCursor();
  }

  /**
   * Brush settings survive a reload.
   *
   * They are a working preference, not map data — two GMs editing the same world should keep
   * their own feel — so they live in `localStorage` rather than in the document. Re-picking
   * size, softness and profile after every refresh is pure friction.
   */
  private static readonly BRUSH_PREFS_KEY = 'map-editor.brush.v1';

  private saveBrushPrefs(): void {
    try {
      localStorage.setItem(
        MapEditorComponent.BRUSH_PREFS_KEY,
        JSON.stringify({
          size: this.brushSize(),
          softness: this.brushSoftness(),
          strength: this.brushStrength(),
          noise: this.brushNoise(),
          texture: this.brushTexture(),
          profile: this.activeProfile(),
          symbolTint: this.symbolTint(),
          // `null` is Auto and is a real choice, so it is stored rather than left absent —
          // absent means "never chosen" and falls back to the Mittel default.
          tierPin: this.tierPin(),
          secretOverview: this.overviewOn(),
          mode: this.mode(),
        }),
      );
    } catch {
      // Private mode, or storage full. A lost preference is not worth an error.
    }
  }

  private loadBrushPrefs(): void {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(MapEditorComponent.BRUSH_PREFS_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    try {
      const p = JSON.parse(raw) as Record<string, unknown>;
      // Each value is range-checked: stored preferences outlive the code that wrote them.
      const num = (v: unknown, lo: number, hi: number, fallback: number) =>
        typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback;

      this.brushSize.set(num(p['size'], 4, 3000, this.brushSize()));
      this.brushSoftness.set(num(p['softness'], 0, 1, this.brushSoftness()));
      this.brushStrength.set(num(p['strength'], 0.01, 1, this.brushStrength()));
      this.brushNoise.set(num(p['noise'], 0, 1, this.brushNoise()));

      const texture = p['texture'];
      if (BRUSH_TEXTURES.includes(texture as BrushTexture)) {
        this.brushTexture.set(texture as BrushTexture);
      }
      const profile = p['profile'];
      if (this.brushProfiles.some(x => x.id === profile)) this.activeProfile.set(profile as string);

      const tint = p['symbolTint'];
      if (typeof tint === 'string' && /^#[0-9a-f]{6}$/i.test(tint)) this.symbolTint.set(tint);

      if (typeof p['secretOverview'] === 'boolean') this.overviewOn.set(p['secretOverview']);
      if (p['mode'] === 'game' || p['mode'] === 'edit') this.mode.set(p['mode']);

      // Only `in` distinguishes a stored Auto (null) from a preference never expressed.
      if ('tierPin' in p) {
        const pin = p['tierPin'];
        if (pin === null) this.tierPin.set(null);
        else if (pin === 'low' || pin === 'med' || pin === 'high') this.tierPin.set(pin);
      }
    } catch {
      // Corrupt entry; the defaults already stand.
    }
  }

  readonly landPalette = signal<string[]>([]);
  readonly waterPalette = signal<string[]>([]);
  readonly selectedLand = signal(0);
  readonly selectedWater = signal(0);

  /** Open sea's colour — the canvas nothing has been drawn on yet. */
  readonly waterBase = signal('#3f6d8c');
  /**
   * Bare ground's colour — land that has been raised but never coloured.
   *
   * The way to restyle a whole map's ground: it shows only where colour coverage is zero, so
   * it repaints nothing deliberate, and it applies at every tier at once instead of being
   * baked into whichever one happened to be active.
   */
  readonly landBase = signal('#e4d5b7');

  readonly paperOptions = signal<PaperTextureMeta[]>([]);
  readonly paperTexture = signal('');
  readonly paperOpacity = signal(0.35);

  /** Coastline look — taste settings, tuned live and shared with everyone. */
  readonly coast = signal<CoastSettings>(defaultCoast());

  // ── symbols ──

  readonly activeGroup = signal<string>('');
  /** Every sprite in the active category, shown flat — no group navigation. */
  readonly categorySprites = signal<string[]>([]);
  readonly symbolQuery = signal('');
  /** What the picker shows: the category, narrowed by the search box. */
  readonly visibleSprites = computed(() =>
    this.assets.search(this.categorySprites(), this.symbolQuery()),
  );
  readonly currentSprite = signal<string>('');
  /** Alt mirrors the stamp while held. */
  readonly mirrorStamp = signal(false);
  readonly symbolScale = signal(2);
  /** Random rotation spread, in degrees, applied per placement. */
  readonly rotationJitter = signal(0);
  /** Randomly mirror half the placements, so repeated symbols read less like clones. */
  readonly flipJitter = signal(false);
  readonly placeSecret = signal(false);
  /** Auto-advance to another variation after each placement. */
  readonly autoVary = signal(true);
  /**
   * Colour for tintable symbols — Wonderdraft's multi-slot markers, flattened to silhouettes.
   *
   * Separate from the land palette: those swatches colour *ground*, while this colours a
   * marker that has to read against it. Applied at placement and stored on the symbol, so
   * two towns can differ.
   */
  readonly symbolTint = signal('#4a3524');

  /** Whether the sprite about to be placed takes a chosen colour. */
  readonly symbolIsTintable = computed(
    () => !!this.assets.meta(this.currentSprite())?.tintable,
  );

  setSymbolTint(color: string): void {
    this.symbolTint.set(color);
    this.saveBrushPrefs();
    this.redrawCursor();

    // Recolour anything selected, so the picker doubles as "change these".
    const ids = this.selectedIds().filter(id => {
      const sym = this.symbolById(id);
      return sym && this.assets.meta(sym.asset)?.tintable;
    });
    if (!ids.length) return;

    this.undoStack?.begin();
    for (const id of ids) {
      const sym = this.symbolById(id);
      if (!sym) continue;
      this.undoStack?.recordObject({
        c: 'symbols',
        id,
        before: clone(sym),
        after: clone({ ...sym, tint: color }),
      });
      sym.tint = color;
      this.symbols?.update(sym);
      this.store.updateObject('symbols', id, { tint: color });
    }
    this.undoStack?.commit('Symbolfarbe');
    this.refreshHistoryState();
    this.scheduleStream();
  }

  readonly selectedIds = signal<string[]>([]);
  readonly assetsReady = signal(false);
  readonly assetsError = signal<string | null>(null);

  readonly canUndo = signal(false);
  readonly canRedo = signal(false);
  readonly saving = signal(false);
  /** Set when the GPU context is lost — the map is blank until the page reloads. */
  readonly contextLost = signal(false);
  /**
   * Detail tier the next stroke will land on.
   *
   * Shown in the status bar because it is now the single most important thing to know before
   * drawing: a stroke writes this tier and every coarser one, and never a finer one, so which
   * tier is active decides what the stroke can later be refined against.
   */
  readonly detailTier = signal<DetailTier>('high');

  readonly detailTierLabel = computed(
    () => ({ high: 'Hoch', med: 'Mittel', low: 'Grob' })[this.detailTier()],
  );

  // ── working tier ──

  /**
   * Tier the GM has pinned, or null to follow the zoom.
   *
   * The tier decides what a stroke *writes*, not merely what is drawn, so following the zoom
   * alone leaves one job impossible: correcting the coarse base while zoomed in far enough to
   * see what you are matching it against.
   *
   * Starts on `med` rather than Auto. Auto silently changes what a stroke writes as you zoom,
   * so the same brush at the same place lands in a different tier depending on how close you
   * happened to be — and the discrepancy only shows up later, on a zoom that samples the tier
   * you did not write. Mittel is where most work happens, and a fixed tier is predictable.
   * `tierIsolate` stays off: this pins what is *written*, while the view keeps compositing
   * coarse under fine as usual.
   */
  readonly tierPin = signal<DetailTier | null>('med');
  /** Draw only the pinned tier instead of the coarse-under-fine composite. */
  readonly tierIsolate = signal(false);

  /**
   * Which raster the inspector draws while isolating.
   *
   * There are nine independent grids — three rasters across three tiers — and the map view
   * shows their *combination*, with land colour gated behind the height field. That gating is
   * what made a tier full of colour but empty of height render as open sea, so content that
   * was plainly visible unlocked could not be found by isolating any tier. Picking one raster
   * removes the ambiguity: what is drawn is that grid, and nothing else.
   *
   * Defaults to land colour, which is what is usually being hunted.
   */
  readonly inspectLayer = signal<InspectLayer>('landColor');

  readonly inspectLayers: { id: InspectLayer; label: string }[] = [
    { id: 'all', label: 'Alles' },
    { id: 'height', label: 'Höhe' },
    { id: 'landColor', label: 'Landfarbe' },
    { id: 'waterColor', label: 'Wasserfarbe' },
  ];

  setInspectLayer(id: InspectLayer): void {
    this.inspectLayer.set(id);
    this.applyInspect();
  }

  /**
   * Push the inspector state onto the renderer.
   *
   * The backdrop stops being sea while inspecting. Ground nothing was drawn on and ground
   * that simply is not loaded are both blue in the map view — fine there, useless here, since
   * open water is legitimate content and telling it apart from a chunk that never arrived is
   * the whole point of the mode. Inspecting paints the backdrop near-black, so anything not
   * drawn is obviously absent, while a loaded-but-empty cell shows the shader's checker.
   */
  private applyInspect(): void {
    const isolating = this.tierIsolate();
    const mode = isolating
      ? { all: 1, height: 2, landColor: 3, waterColor: 4 }[this.inspectLayer()]
      : 0;
    this.terrain?.setInspect(mode);
    this.renderer.setOceanColor(
      isolating ? [0.05, 0.05, 0.07] : hexToRgb(this.waterBase(), [0.25, 0.43, 0.55]),
    );
    this.scheduleStream();
  }

  readonly tierOptions: { id: DetailTier | null; label: string }[] = [
    { id: null, label: 'Auto' },
    { id: 'low', label: 'Grob' },
    { id: 'med', label: 'Mittel' },
    { id: 'high', label: 'Hoch' },
  ];

  /**
   * Whether brushes write this tier alone.
   *
   * Tied to isolation rather than to the pin. Pinning is also just a way to look at a tier,
   * and silently changing what every brush writes the moment you pin would be a trap;
   * isolating is the explicit "I am hand-managing tiers" mode, so it is the honest place for
   * the rule to change.
   */
  readonly onlyTier = computed(() => this.tierPin() !== null && this.tierIsolate());

  setTierPin(tier: DetailTier | null): void {
    this.tierPin.set(tier);
    if (this.chunks) this.chunks.tierPin = tier;
    // Isolating without a pin would mean isolating whatever tier the zoom lands on, which
    // changes under you as you move — the opposite of a stable thing to edit.
    if (tier === null) this.setTierIsolate(false);
    this.saveBrushPrefs();
    this.applyView();
  }

  setTierIsolate(on: boolean): void {
    this.tierIsolate.set(on);
    this.terrain?.setIsolate(on);
    /*
     * Symbols, labels and regions come off with it.
     *
     * They are vector objects with no tier at all — one list for the whole map — so drawing
     * them over an isolated tier says nothing about what that tier holds and actively misleads:
     * a mountain range standing over open sea reads as terrain that failed to load rather than
     * as a tier that legitimately stores nothing there.
     */
    this.renderer.objectLayer.visible = !on;
    this.applyInspect();
  }

  // ── diagnostics ──

  readonly diagOn = signal(false);
  readonly diagSummary = signal<{ label: string; value: string }[]>([]);
  readonly diagEvents = signal<DiagEvent[]>([]);
  private diagTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Turn the streaming instrumentation on.
   *
   * Off by default and inert when off: the instrumented paths are the hot ones, and a
   * diagnostic that costs frames changes the thing it is meant to measure.
   */
  toggleDiagnostics(): void {
    const on = !this.diagOn();
    this.diagOn.set(on);
    mapDiag.enabled = on;
    this.terrain?.setDebug(on);

    if (this.diagTimer) clearInterval(this.diagTimer);
    this.diagTimer = null;

    if (on) {
      mapDiag.reset();
      // Polled rather than pushed: an event-driven panel would re-render mid-stroke and
      // add its own cost to exactly the frames under investigation.
      this.diagTimer = setInterval(() => {
        this.diagSummary.set(mapDiag.summary);
        this.diagEvents.set(mapDiag.recent(26).reverse());
      }, 400);
    } else {
      this.diagSummary.set([]);
      this.diagEvents.set([]);
    }
    this.scheduleStream();
  }

  resetDiagnostics(): void {
    mapDiag.reset();
    this.diagSummary.set(mapDiag.summary);
    this.diagEvents.set([]);
  }

  /** Print the full timeline to the console, for pasting into a bug report. */
  dumpDiagnostics(): void {
    mapDiag.dump();
  }

  /** Rubber-band rectangle in screen space while box-selecting. */
  readonly marquee = signal<{ x: number; y: number; w: number; h: number } | null>(null);

  // ── regions ──

  /** Vertices of the region being drawn; empty when not drawing. */
  readonly draftPoints = signal<Point[]>([]);
  readonly regionColor = signal('#c0392b');
  readonly regionThickness = signal(24);
  readonly regionDash = signal(110);
  readonly regionGap = signal(80);
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

  // ── game mode ──

  /**
   * Editing or playing.
   *
   * A local preference, never synced. What the GM has on screen is not part of the map, and
   * pushing it would mean one GM switching to game mode changed what another was doing.
   * Players are always in game mode: the editing tools are not theirs, and the switch simply
   * is not shown to them.
   */
  readonly mode = signal<'edit' | 'game'>('edit');
  readonly gameTool = signal<GameTool>('cursor');
  readonly gameTools = computed(() => gameToolsFor(this.isGM()));
  readonly inGame = computed(() => !this.isGM() || this.mode() === 'game');

  /**
   * Fog painting state — a mode on the cursor tool, not a tool of its own.
   *
   * V flips reveal/hide, D steps back to neutral, exactly as on the old map. Keeping it a
   * mode means covering ground and moving a figure are one keystroke apart rather than a
   * round trip through the toolbar, which is what a GM actually does during a session.
   */
  readonly fogMode = signal<FogMode>('neutral');
  readonly eraserMode = signal(false);

  setMode(mode: 'edit' | 'game'): void {
    if (!this.isGM()) return;
    this.mode.set(mode);
    this.saveBrushPrefs();
    this.applyMode();
  }

  readonly gameToolLabel = computed(
    () => this.gameTools().find(t => t.id === this.gameTool())?.label ?? '',
  );

  setFogMode(mode: FogMode): void {
    if (!this.isGM()) return;
    // Fog rides on the cursor tool, so arming it switches to the tool that can paint it.
    if (mode !== 'neutral') this.gameTool.set('cursor');
    this.fogMode.set(mode);
    this.redrawCursor();
  }

  selectGameTool(tool: GameTool): void {
    this.gameTool.set(tool);
    this.endMeasure();
    this.redrawCursor();
  }

  /** Fog brush radius, in hexes. */
  readonly fogRadius = signal(2);

  readonly sketchColor = signal('#ef4444');
  /** Pen and eraser keep separate widths, as they did on the old map. */
  readonly penSize = signal(8);
  readonly eraserSize = signal(24);
  readonly penSizes = PEN_SIZES;
  readonly drawColors = DRAW_COLORS;

  /** World-px width of the active drawing tool, scaled off the pen preset. */
  private strokeWidth(): number {
    return (this.eraserMode() ? this.eraserSize() : this.penSize()) * 4;
  }

  readonly tokenName = signal('Figur');
  readonly tokenColor = signal('#c0392b');
  readonly tokenSize = signal(180);
  readonly selectedTokenId = signal<string | null>(null);

  /**
   * Revealed hexes as a Set.
   *
   * The document stores an array because JSON has no sets, but every lookup here is a
   * membership test during a brush drag — linear scans over tens of thousands of keys would
   * make the fog brush quadratic in what has already been explored.
   */
  private revealedSet = new Set<string>();
  /** Bumped whenever `revealedSet` changes, so the fog texture knows to redraw. */
  private fogRevision = 0;

  /**
   * Pings reuse the shared subsystem the lobby and the old world map already use —
   * `PingController` for the G-chord state machine, `app-ping-layer` for the animation,
   * `app-ping-wheel` for the radial selector, and its sounds. Rebuilding any of that would
   * have produced a second kind of ping that looked and sounded wrong next to the first.
   */
  readonly pingCtl = new PingController(
    () => this.cdr.markForCheck(),
    broadcast => this.store.sendPing(broadcast),
    () => this.auth.currentUser()?.name ?? 'unbekannt',
  );

  /** Pings mapped into screen space for the overlay, recomputed as the camera moves. */
  readonly renderedPings = computed<RenderedPing[]>(() => {
    void this.viewEpoch();
    return this.pingCtl.activePings.map(p => {
      const s = this.renderer.camera.worldToScreen(p.worldX, p.worldY);
      return { id: p.id, type: p.type, x: s.x, y: s.y };
    });
  });

  /** Bumped on every camera change, so screen-space overlays follow pan and zoom. */
  private readonly viewEpoch = signal(0);

  private measureLines: MeasureLine[] = [];
  /** This client's ruler, while it is being dragged. */
  private measureDrag: { start: Point; end: Point } | null = null;

  readonly sketchCount = signal(0);

  /** Push mode-derived state onto the views. */
  private applyMode(): void {
    this.fogView?.setEnabled(this.inGame());
    this.fogView?.invalidate();

    // Editing overlays have no business on screen during play, and vice versa.
    this.secretOverview?.setAudit(this.overviewActive());
    this.renderer.setDim(this.overviewActive() ? 0.62 : 0);
    this.scheduleStream();
    this.redrawCursor();
  }

  /**
   * Every ruler line to draw: everyone else's, plus this client's own drag.
   *
   * The local one is merged in rather than waiting for the server's echo — a ruler that lags
   * the pointer by a round trip is unusable for the thing it exists to do.
   */
  private allMeasureLines(): MeasureLine[] {
    const mine = this.measureDrag;
    if (!mine) return this.measureLines;
    const id = this.store.socketId ?? 'local';
    return [
      ...this.measureLines.filter(l => l.id !== id),
      { id, start: mine.start, end: mine.end, by: '' },
    ];
  }

  // ── fog ──

  /**
   * Paint fog under the pointer.
   *
   * Sends a delta per dab rather than accumulating over the drag: the ops are tiny, and a GM
   * revealing ground during play wants the party to see it as it happens, not when the mouse
   * comes up.
   */
  private paintFog(world: Point): void {
    if (!this.isGM()) return;

    const centre = worldToHex(world.x, world.y);
    const keys = hexesInRadius(centre.q, centre.r, this.fogRadius()).map(h => hexKey(h.q, h.r));

    const reveal = this.fogMode() !== 'hide';
    const changed = keys.filter(k => this.revealedSet.has(k) !== reveal);
    if (!changed.length) return;

    for (const key of changed) {
      if (reveal) this.revealedSet.add(key);
      else this.revealedSet.delete(key);
    }
    this.fogRevision++;
    this.fogView?.invalidate();

    this.store.setFog(reveal ? changed : [], reveal ? [] : changed);
    this.scheduleStream();
  }

  /** Reveal or cover the whole map. The blunt instrument, behind a confirmation. */
  fogAll(reveal: boolean): void {
    if (!this.isGM()) return;
    const data = this.store.data();
    if (!data) return;

    if (reveal) {
      // "Reveal everything" over an unbounded world is not expressible as a hex list, so it
      // covers the visible area generously instead — enough for "show them the region".
      const view = this.renderer.camera.visibleBounds(0);
      const range = hexRangeForBounds(view.minX, view.minY, view.maxX, view.maxY);
      const add: string[] = [];
      for (let q = range.minQ; q <= range.maxQ; q++) {
        for (let r = range.minR; r <= range.maxR; r++) {
          const key = hexKey(q, r);
          if (!this.revealedSet.has(key)) add.push(key);
        }
      }
      if (!add.length) return;
      for (const key of add) this.revealedSet.add(key);
      this.store.setFog(add, []);
    } else {
      const remove = [...this.revealedSet];
      if (!remove.length) return;
      this.revealedSet.clear();
      this.store.setFog([], remove);
    }

    this.fogRevision++;
    this.fogView?.invalidate();
    this.scheduleStream();
  }

  readonly revealedCount = computed(() => {
    this.store.revision();
    return this.store.data()?.fog?.revealed.length ?? 0;
  });

  // ── sketch ──

  private sketchDraft: Point[] | null = null;

  private beginSketch(world: Point): void {
    this.sketchDraft = [{ x: world.x, y: world.y }];
    this.sketchView?.drawLive(this.sketchDraft, this.strokeColor(), this.strokeWidth());
  }

  /**
   * The colour a stroke is laid down in.
   *
   * The eraser is a *rubbing-out* stroke, not a coloured one — `SketchView` draws it with
   * destination-out blending so it takes previous lines away instead of painting over them
   * in the background colour, which would leave a smear the moment the map behind changed.
   */
  private strokeColor(): string {
    return this.eraserMode() ? ERASER_COLOR : this.sketchColor();
  }

  private continueSketch(world: Point): void {
    const draft = this.sketchDraft;
    if (!draft) return;

    // Thin the trail: raw pointer moves put points a pixel apart, which is a hundred times
    // more geometry than the line needs and all of it gets synced.
    const last = draft[draft.length - 1];
    const minStep = this.strokeWidth() * 0.35;
    if (Math.hypot(world.x - last.x, world.y - last.y) < minStep) return;

    draft.push({ x: world.x, y: world.y });
    this.sketchView?.drawLive(draft, this.strokeColor(), this.strokeWidth());
  }

  private endSketch(): void {
    const draft = this.sketchDraft;
    this.sketchDraft = null;
    this.sketchView?.endLive();
    if (!draft || draft.length === 0) return;

    const stroke: SketchStroke = {
      id: generateId(),
      x: draft[0].x,
      y: draft[0].y,
      // Never secret: a sketch is a gesture everyone at the table is meant to see, and the
      // server refuses a secret one from a player anyway.
      vis: 'public',
      points: draft,
      color: this.strokeColor(),
      width: this.strokeWidth(),
      erase: this.eraserMode(),
      author: this.auth.currentUser()?.name ?? '',
    };

    this.sketchView?.add(stroke);
    this.sketchCount.set(this.sketchView?.count ?? 0);
    this.store.addObject('sketch', stroke);
    this.scheduleStream();
  }

  /**
   * Take back the last line this client drew.
   *
   * Own lines only, and not through the map's undo stack: during play the sketch is the only
   * thing being added, and reaching into the edit history — or into somebody else's
   * scribbles — would be a nasty surprise.
   */
  undoLastSketch(): void {
    const mine = this.auth.currentUser()?.name ?? '';
    const ids = this.sketchView?.idsBy(mine) ?? [];
    const last = ids[ids.length - 1];
    if (!last) return;

    this.sketchView?.remove(last);
    this.sketchCount.set(this.sketchView?.count ?? 0);
    this.store.deleteObject('sketch', last);
    this.scheduleStream();
  }

  /**
   * Wipe sketch lines.
   *
   * The GM clears everyone's; a player clears their own. Not undoable and deliberately not
   * routed through the undo stack — a scribble is transient by nature, and mixing session
   * gestures into the map's edit history would make Ctrl+Z during play unpredictable.
   */
  clearSketch(): void {
    const mine = this.auth.currentUser()?.name ?? '';
    const ids = this.isGM() ? this.sketchView?.allIds() : this.sketchView?.idsBy(mine);
    for (const id of ids ?? []) {
      this.sketchView?.remove(id);
      this.store.deleteObject('sketch', id);
    }
    this.sketchCount.set(this.sketchView?.count ?? 0);
    this.scheduleStream();
  }

  // ── tokens ──

  private dragToken: { id: string; before: MapToken } | null = null;

  private placeToken(world: Point): void {
    if (!this.isGM()) return;

    // Snapped to the hex centre: the grid is what distances are measured in, so a figure
    // between two hexes has no answer to "how far can it move".
    const centre = hexToWorld(worldToHex(world.x, world.y));
    const token: MapToken = {
      id: generateId(),
      x: centre.x,
      y: centre.y,
      vis: 'public',
      name: this.tokenName() || 'Figur',
      color: this.tokenColor(),
      size: this.tokenSize(),
    };

    this.playAids?.addToken(token);
    this.store.addObject('tokens', token);
    this.selectedTokenId.set(token.id);
    this.scheduleStream();
  }

  deleteSelectedToken(): void {
    const id = this.selectedTokenId();
    if (!id || !this.isGM()) return;
    this.playAids?.removeToken(id);
    this.store.deleteObject('tokens', id);
    this.selectedTokenId.set(null);
    this.scheduleStream();
  }

  // ── secrets ──

  /**
   * The cross-category selection.
   *
   * Every other selector in the editor is scoped to its tab, and each keeps its own list of
   * ids. That works because a symbol edit only ever concerns symbols. A secret does not
   * respect the split — "the bandit camp" is a label, some tents and an outline — so this one
   * carries the collection alongside the id and is stored separately from the per-tab
   * selections rather than trying to be all of them at once.
   */
  readonly secretSelection = signal<ObjectRef[]>([]);

  /** Group the panel has focused, so its members can be highlighted and its buttons act. */
  readonly activeSecretId = signal<string | null>(null);

  /**
   * How many groups exist, and how many are still hidden.
   *
   * Only the count — deliberately not the list. A finished map is expected to carry several
   * hundred secrets, and a panel that renders all of them is both unusable and a needless
   * re-render of hundreds of rows on every single edit. The map itself is the index: click a
   * thing to open its group.
   */
  readonly secretStats = computed(() => {
    this.store.revision();
    const data = this.store.data();
    if (!data) return { total: 0, revealed: 0 };
    const all = summarize(data);
    return { total: all.length, revealed: all.filter(g => g.revealed).length };
  });

  /** The focused group, resolved to its name and membership. */
  readonly activeSecret = computed<SecretSummary | null>(() => {
    this.store.revision();
    const data = this.store.data();
    const id = this.activeSecretId();
    if (!data || !id) return null;
    const secret = secretsOf(data).find(x => x.id === id);
    if (!secret) return null;
    const members = membersOf(data, id);
    return { secret, members, revealed: members.length > 0 && members.every(m => isMemberPublic(data, m)) };
  });

  /** Breakdown of the focused group's membership, for the panel. */
  readonly activeSecretLabel = computed(() => {
    const group = this.activeSecret();
    return group ? countLabel(group.members) : '';
  });

  readonly secretSelectionCount = computed(() => this.secretSelection().length);

  /**
   * Whether the audit view is switched on.
   *
   * A remembered preference rather than a tool. It was a second tool at first, which forced
   * a choice between looking and fixing: the moment the overview showed a label with no
   * secret, the only way to act on it was to leave the view that had just pointed it out.
   * As a toggle it is a way of *seeing*, and selection keeps working underneath.
   */
  readonly overviewOn = signal(false);

  toggleOverview(): void {
    this.overviewOn.update(on => !on);
    this.saveBrushPrefs();
    this.applyOverview();
  }

  readonly overviewActive = computed(
    () => !this.inGame() && this.tab() === 'secrets' && this.overviewOn(),
  );

  /**
   * Turn the audit view on or off.
   *
   * The terrain goes behind a veil and the marks go above the objects; both are pushed here
   * rather than being recomputed per frame, because only a tool change can flip the mode.
   */
  private applyOverview(): void {
    const on = this.overviewActive();
    this.renderer.setDim(on ? 0.62 : 0);
    this.secretOverview?.setAudit(on);
    this.drawOverview();
  }

  /**
   * World box of any object, whatever collection it is in.
   *
   * The three views each know their own geometry — a symbol's drawn circle, a label's baked
   * extents, a region's path — so this asks them rather than re-deriving it and drifting.
   */
  private boundsOfRef(data: MapEditorData, ref: ObjectRef): Bounds | null {
    const obj = find(data, ref);
    if (!obj) return null;
    if (ref.c === 'labels') return this.labelView.worldBounds(obj as MapLabel);
    if (ref.c === 'symbols') return this.symbols?.boundsOf(obj as MapSymbol) ?? null;
    if (ref.c === 'regions') return pathBounds((obj as MapRegion).points);
    return null;
  }

  /** Outline the current selection, so what is picked is obvious in every collection. */
  private drawSecretSelection(): void {
    if (!this.secretOverview) return;
    if (this.tab() !== 'secrets') {
      this.secretOverview.drawSelection([], 1);
      return;
    }

    const data = this.store.data();
    if (!data) return;

    const boxes: Bounds[] = [];
    for (const ref of this.secretSelection()) {
      const box = this.boundsOfRef(data, ref);
      if (box) boxes.push(box);
    }
    this.secretOverview.drawSelection(boxes, this.renderer.camera.zoom);
  }

  /**
   * Redraw the audit marks for what is on screen.
   *
   * Culled to the viewport: 300 groups is the case this exists for, and framing every one of
   * them on every pan would cost more than the map underneath. Groups are cheap to test
   * because their members' boxes come straight from the views that already drew them.
   */
  private drawOverview(): void {
    this.drawSecretSelection();
    if (!this.secretOverview?.auditVisible) return;

    const data = this.store.data();
    if (!data) return;

    const view = this.renderer.camera.visibleBounds();
    const active = this.activeSecretId();

    // One pass over each collection, bucketed by group — a scan per group would be
    // quadratic, which at 300 groups on a full map is exactly the wrong shape.
    const byGroup = new Map<string, OverviewItem[]>();
    const looseLabels: Bounds[] = [];

    for (const label of data.labels) {
      const bounds = this.labelView.worldBounds(label);
      if (!boundsOverlap(bounds, view)) continue;
      if (label.secret) push(byGroup, label.secret, { bounds });
      // A public name is the miss the red frames are for; a public tree is not.
      else if (label.vis !== 'secret') looseLabels.push(bounds);
    }

    for (const sym of data.symbols) {
      if (!sym.secret) continue;
      const bounds = this.symbols?.boundsOf(sym);
      if (!bounds || !boundsOverlap(bounds, view)) continue;
      push(byGroup, sym.secret, { bounds });
    }

    for (const region of data.regions) {
      if (!region.secret) continue;
      const bounds = pathBounds(region.points);
      if (!boundsOverlap(bounds, view)) continue;
      push(byGroup, region.secret, { bounds });
    }

    const groups: OverviewGroup[] = [];
    for (const [id, members] of byGroup) {
      groups.push({ id, members, active: id === active });
    }

    this.secretOverview.draw(groups, looseLabels, this.renderer.camera.zoom);
  }

  /**
   * Move every selected object by one delta, as a single undoable step.
   *
   * A secret is a place: the camp's name, its tents and its outline have to keep their
   * arrangement, so the whole set travels together rather than being reassembled by hand.
   */
  private commitSecretMove(): void {
    const drag = this.dragSecret;
    if (!drag || !drag.moved) return;

    const refs = this.secretSelection();
    this.undoStack?.begin();
    this.runSecretOps(moveOps(refs, drag.origins, drag.dx, drag.dy));
    this.undoStack?.commit('Geheimnis verschieben');
    this.refreshHistoryState();
  }

  /** Human-readable breakdown of a selection that spans collections. */
  readonly secretSelectionLabel = computed(() => countLabel(this.secretSelection()));

  /**
   * Push the cross-category selection into the per-view highlighters.
   *
   * Each view already knows how to draw its own selection, so this splits the list by
   * collection and hands each view its share. A second highlighting mechanism would have to
   * be kept in step with three existing ones for no gain.
   */
  private setSecretSelection(refs: ObjectRef[]): void {
    this.secretSelection.set(refs);
    this.symbols?.setSelection(refs.filter(r => r.c === 'symbols').map(r => r.id));
    this.labelView.setSelection(refs.filter(r => r.c === 'labels').map(r => r.id));

    // Regions highlight one at a time — `RegionView` tracks a single `selected` — so the
    // first region in the selection is the one that shows.
    const region = refs.find(r => r.c === 'regions');
    this.regionView.setSelected(region ? region.id : null);
    this.scheduleStream();
  }

  /**
   * Object under a point, across collections.
   *
   * Picks the *tightest* hit rather than the topmost one. A fixed priority made symbols
   * unselectable: a label's reach is its whole box, so a name stretched across a valley
   * claimed every icon under it and the arrow could only ever grab the label. Comparing how
   * deep the click falls inside each candidate — 0 at the centre, 1 at the edge — means
   * clicking a castle gets the castle, and clicking the lettering next to it gets the name.
   *
   * Ties go to what is drawn on top: label, then symbol, then region.
   */
  private secretHitTest(world: Point): ObjectRef | null {
    const label = this.labelView.hitTestScored(world.x, world.y);
    const symbol = this.symbols?.hitTestScored(world.x, world.y) ?? null;

    const tol = 12 / this.renderer.camera.zoom;
    const region = this.regionView.hitTest(world.x, world.y, tol);
    const regionScore = region
      ? distanceToPath(region.points, world.x, world.y) / tol
      : Infinity;

    // Listed in draw order, top first, which is how `pickTightest` breaks ties.
    return pickTightest([
      label ? { c: 'labels', id: label.label.id, score: label.score } : null,
      symbol ? { c: 'symbols', id: symbol.sym.id, score: symbol.score } : null,
      region ? { c: 'regions', id: region.id, score: regionScore } : null,
    ]);
  }

  /**
   * Click-select across collections. Returns whether anything was hit.
   *
   * Clicking an object that belongs to a group also focuses that group. With hundreds of
   * secrets there is no list to find one in — pointing at something on the map *is* how a
   * group gets opened, and the panel then shows that one and nothing else.
   */
  private secretSelectAt(world: Point, additive: boolean): boolean {
    const hit = this.secretHitTest(world);
    if (!hit) {
      if (!additive) {
        this.setSecretSelection([]);
        this.activeSecretId.set(null);
      }
      return false;
    }

    const data = this.store.data();
    const group = data ? (find(data, hit)?.secret ?? '') : '';

    const current = this.secretSelection();
    const has = current.some(r => r.c === hit.c && r.id === hit.id);
    if (additive) {
      this.setSecretSelection(
        has ? current.filter(r => !(r.c === hit.c && r.id === hit.id)) : [...current, hit],
      );
    } else if (has) {
      // Already part of the selection: leave it alone so a drag moves the whole set.
    } else if (group && data) {
      // Clicking one member opens the whole group — that is what you were pointing at.
      this.activeSecretId.set(group);
      this.setSecretSelection(membersOf(data, group));
    } else {
      this.activeSecretId.set(null);
      this.setSecretSelection([hit]);
    }
    return true;
  }

  /** Rubber-band select across collections. */
  private secretSelectInRect(rect: Bounds, additive: boolean): void {
    const found: ObjectRef[] = [
      ...this.labelView.inRect(rect).map(l => ({ c: 'labels' as const, id: l.id })),
      ...(this.symbols?.inRect(rect) ?? []).map(s => ({ c: 'symbols' as const, id: s.id })),
      ...this.regionView.inRect(rect).map(r => ({ c: 'regions' as const, id: r.id })),
    ];
    this.setSecretSelection(additive ? [...this.secretSelection(), ...found] : found);
  }

  /** Select every member of a group, so the GM can see what a name covers. */
  selectSecretGroup(id: string): void {
    const data = this.store.data();
    if (!data) return;
    this.activeSecretId.set(id);
    this.setSecretSelection(membersOf(data, id));
  }

  /**
   * Bundle the current selection into a new group and hide it.
   *
   * One undo step for the whole thing: grouping is a single decision, and undoing it halfway
   * would leave part of a secret on the players' screens.
   */
  groupAsSecret(): void {
    const data = this.store.data();
    const refs = this.secretSelection();
    if (!data || !refs.length) return;

    const existing = secretsOf(data);
    const secret: MapSecret = { id: newSecretId(), name: secretNameFor(data, refs, existing) };

    this.undoStack?.begin();
    this.runSecretOps([
      { t: 'set', path: 'secrets', value: [...existing, secret] },
      ...groupOps(refs, secret.id),
    ]);
    this.undoStack?.commit('Als Geheimnis gruppieren');
    this.refreshHistoryState();

    this.activeSecretId.set(secret.id);
  }

  /**
   * Pull the selected objects out of whatever groups they are in.
   *
   * Visibility is untouched, same as dissolving: this is for correcting a mis-click while
   * bundling, not for showing anything to the players.
   */
  ungroupSelection(): void {
    const refs = this.secretSelection();
    if (!refs.length) return;

    this.undoStack?.begin();
    this.runSecretOps(ungroupOps(refs));
    this.undoStack?.commit('Aus Gruppe lösen');
    this.refreshHistoryState();
  }

  /** Add the current selection to the focused group, without creating a new one. */
  addSelectionToSecret(): void {
    const id = this.activeSecretId();
    const refs = this.secretSelection();
    if (!id || !refs.length) return;

    this.undoStack?.begin();
    this.runSecretOps(groupOps(refs, id));
    this.undoStack?.commit('Zum Geheimnis hinzufügen');
    this.refreshHistoryState();

    const data = this.store.data();
    if (data) this.setSecretSelection(membersOf(data, id));
  }

  /** Take the group apart. Visibility is deliberately left exactly as it stands. */
  dissolveSecret(id: string): void {
    const data = this.store.data();
    if (!data) return;

    this.undoStack?.begin();
    this.runSecretOps(dissolveOps(data, id));
    this.undoStack?.commit('Geheimnis auflösen');
    this.refreshHistoryState();

    if (this.activeSecretId() === id) this.activeSecretId.set(null);
    this.setSecretSelection([]);
  }

  renameSecret(id: string, name: string): void {
    const data = this.store.data();
    if (!data) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    this.store.setPath(
      'secrets',
      secretsOf(data).map(s => (s.id === id ? { ...s, name: trimmed } : s)),
    );
  }

  /**
   * Send a batch of secret ops, recording each object change for undo.
   *
   * `set` ops carry no per-object before/after, so the secrets list itself is not undoable —
   * an undo restores membership and visibility, and a group left behind with no members is
   * visible in the panel and removable by hand. Inventing a snapshot mechanism for one small
   * array would cost more than it saves.
   */
  private runSecretOps(ops: MapOp[]): void {
    const data = this.store.data();
    if (!data) return;

    for (const op of ops) {
      if (op.t === 'set') {
        this.store.setPath(op.path, op.value);
        continue;
      }
      if (op.t !== 'upd') continue;

      const before = find(data, { c: op.c, id: op.id });
      if (!before) continue;
      const snapshot = clone(before);
      this.undoStack?.recordObject({
        c: op.c,
        id: op.id,
        before: snapshot,
        after: clone({ ...before, ...op.v } as AnyMapObject),
      });
      this.store.updateObject(op.c, op.id, op.v);
    }
    this.scheduleStream();
  }

  // ── maintenance: wipe one raster at one tier ──

  /**
   * Clearing a whole layer of a whole tier, across the entire map.
   *
   * The import can only ever clean up inside its own rectangle, and it writes colour to one
   * tier. Neither reaches content stranded in *another* tier — an older import that wrote its
   * colour at Mittel keeps overriding the Grob colour a newer one lays down, everywhere, and
   * no amount of re-importing removes it. That is a map-wide problem and needs a map-wide
   * tool.
   *
   * Deletes files rather than painting transparency, so it costs the same whatever the map
   * size. Not undoable — hence the count shown first and the confirmation.
   */
  readonly maintLayers: { id: RasterLayer; label: string }[] = [
    { id: 'height', label: 'Höhe' },
    { id: 'landColor', label: 'Landfarbe' },
    { id: 'waterColor', label: 'Wasserfarbe' },
  ];

  readonly maintLayer = signal<RasterLayer>('landColor');
  readonly maintTier = signal<DetailTier>('med');
  readonly maintCount = signal<number | null>(null);
  readonly maintBusy = signal(false);

  /** Chunk coordinates are integers; this is comfortably past any real map. */
  private readonly WHOLE_MAP = { minCx: -1000000, minCy: -1000000, maxCx: 1000000, maxCy: 1000000 };

  setMaintLayer(id: RasterLayer): void {
    this.maintLayer.set(id);
    this.maintCount.set(null);
  }

  setMaintTier(tier: DetailTier): void {
    this.maintTier.set(tier);
    this.maintCount.set(null);
  }

  /** How many chunks the wipe would remove — asked before offering to remove them. */
  async countMaintChunks(): Promise<void> {
    this.maintBusy.set(true);
    try {
      const cells = await this.api.listChunks(
        this.worldName(),
        this.maintLayer(),
        this.maintTier(),
        this.WHOLE_MAP,
      );
      this.maintCount.set(cells.length);
    } finally {
      this.maintBusy.set(false);
    }
  }

  async wipeMaintTier(): Promise<void> {
    const layer = this.maintLayer();
    const tier = this.maintTier();
    const label = this.maintLayers.find(l => l.id === layer)?.label ?? layer;
    const tierLabel = ({ high: 'Hoch', med: 'Mittel', low: 'Grob' } as const)[tier];

    const count = this.maintCount();
    const ok = confirm(
      `„${label}" auf Stufe „${tierLabel}" wird auf der GANZEN Karte gelöscht` +
        (count === null ? '' : ` (${count} Kacheln)`) +
        '. Das lässt sich nicht rückgängig machen. Fortfahren?',
    );
    if (!ok) return;

    this.maintBusy.set(true);
    // Same reason as the import: this rewrites chunks nothing captured, so any snapshot of
    // them is stale and would restore a whole chunk of deleted map.
    this.undoStack?.clear();
    this.refreshHistoryState();
    try {
      const cells = await this.store.clearChunks(layer, tier, this.WHOLE_MAP);
      if (cells === null) {
        this.importError.set('Löschen abgelehnt — nur der GM darf das.');
        return;
      }
      this.chunks?.dropChunks(layer, tier, cells);
      this.maintCount.set(0);
      this.scheduleStream();
    } finally {
      this.maintBusy.set(false);
    }
  }

  // ── landmass import ──

  /**
   * Bringing a finished map in from another tool.
   *
   * The map that already exists on paper is the one the group knows, and retracing its
   * coastline by hand is the single largest piece of work in moving to this editor. The
   * import deliberately does not try to reproduce the artwork — only the landmass, which is
   * the part that cannot be redrawn quickly. Symbols, labels and colouring are still done
   * here, which is the whole reason for switching tools.
   *
   * It lives in the Karte tab rather than among the land tools because it is a whole-map
   * operation with its own placement gesture, not something dragged across the canvas.
   */
  private importSource: LandmassSource | null = null;
  /** On-map preview, parented to the renderer's overlay layer while an image is loaded. */
  private importSprite: Sprite | null = null;
  /** Set by the pointer handler while the overlay is being dragged into position. */
  private importDrag: { startWorld: Point; origin: Point } | null = null;
  /** Checked between batches, so a long import can be called off. */
  private importCancel = { cancelled: false };

  readonly importName = signal<string | null>(null);
  readonly importPlacement = signal<LandmassPlacement>({ x: 0, y: 0, scale: 1 });
  /** Preview opacity — the point of the overlay is to be seen *against* what is drawn. */
  readonly importOpacity = signal(0.65);
  /** Source alpha at or above which a pixel counts as land. */
  readonly importThreshold = signal(0.5);
  readonly importWithColor = signal(true);
  /** Whether the covered rectangle is cleared first, so the image replaces what was there. */
  readonly importReplace = signal(true);
  /**
   * Whether symbols, labels and regions inside the rectangle go too.
   *
   * Separate from `importReplace`, and off by default, because they are a different kind of
   * thing: the rasters being replaced are a traced copy of the source image, while symbols are
   * placed by hand and are usually the work worth keeping. Clearing the rasters alone does
   * leave the old map's mountains standing over the new coastline, though, so replacing a map
   * wholesale needs this — which is why it is offered rather than assumed.
   */
  readonly importReplaceObjects = signal(false);
  readonly importTier = signal<DetailTier>('med');
  /**
   * Tier the imported *colour* lands on, independently of the shape.
   *
   * Coarse by default, and that is the whole point. Colour composites fine-over-coarse, so
   * colour written into a detail tier permanently outranks every coarser one — which is what
   * made a base colour, imported across a whole continent, impossible to change afterwards:
   * the edit went in at Grob and the import's copy at Hoch kept winning on zoom.
   *
   * Grob costs almost nothing in fidelity here. A landmass export runs about 8 px per hex and
   * Grob resolves ~4 texels per hex, so the source barely out-resolves it — while the finer
   * tiers stay empty and free for colour work that really is detail.
   */
  readonly importColorTier = signal<DetailTier>('low');
  readonly importBusy = signal(false);
  readonly importProgress = signal({ done: 0, total: 0 });
  readonly importError = signal<string | null>(null);

  readonly hasImport = computed(() => this.importName() !== null);

  /** Cells each tier would write, so the cost of the choice is visible before making it. */
  readonly importTierOptions = computed(() => {
    const src = this.importSource;
    const placement = this.importPlacement();
    const labels: Record<DetailTier, string> = { high: 'Hoch', med: 'Mittel', low: 'Grob' };
    return TIERS.map(id => ({
      id,
      label: labels[id],
      cells: src ? importCellCount(placementBounds(src, placement), id) : 0,
    }));
  });

  readonly importCells = computed(
    () => this.importTierOptions().find(o => o.id === this.importTier())?.cells ?? 0,
  );
  readonly importTooLarge = computed(() => this.importCells() > IMPORT_CELL_WARN);
  readonly importWarnLimit = IMPORT_CELL_WARN;

  readonly importPercent = computed(() => {
    const { done, total } = this.importProgress();
    return total > 0 ? Math.round((done / total) * 100) : 0;
  });

  /** Size the placed image covers in map terms, so the alignment can be sanity-checked. */
  readonly importSizeLabel = computed(() => {
    const src = this.importSource;
    if (!src) return '';
    const p = this.importPlacement();
    // Same conversion as the ruler. It used to divide by the column pitch, which is only
    // 3/4 of a hex's width and not the distance between neighbours, so every imported map
    // was reported about 15% larger than it is.
    const km = (worldPx: number) => Math.round(worldToKm(worldPx));
    return `${km(src.width * p.scale)} × ${km(src.height * p.scale)} km`;
  });

  async pickImportImage(files: FileList | null): Promise<void> {
    const file = files?.[0];
    if (!file) return;

    this.importError.set(null);
    try {
      const src = await loadLandmassImage(file);
      this.clearImportSprite();
      this.importSource = src;
      this.importName.set(src.fileName);

      // Land on screen at a usable size straight away: an image placed at scale 1 on a map
      // this large is a speck, and hunting for it is the worst possible first step.
      this.fitImportToView();

      this.importSprite = new Sprite(Texture.from(src.bitmap));
      this.importSprite.anchor.set(0.5);
      this.renderer.overlayLayer.addChild(this.importSprite);
      this.syncImportSprite();
    } catch {
      this.importError.set('Bild konnte nicht gelesen werden.');
    }
  }

  /** Centre the image on the current view and scale it to fit without cropping. */
  fitImportToView(): void {
    const src = this.importSource;
    if (!src) return;
    const view = this.renderer.camera.visibleBounds(0);
    const placement: LandmassPlacement = {
      x: (view.minX + view.maxX) / 2,
      y: (view.minY + view.maxY) / 2,
      // A little inside the view, so the image and its edges are both visible.
      scale: fitScale(src, view) * 0.9,
    };
    this.importPlacement.set(placement);
    this.importTier.set(recommendedTier(src, placement));
    this.syncImportSprite();
  }

  setImportScale(value: string | number): void {
    if (!this.importSource) return;
    const scale = Number(value);
    // A half-typed or cleared field reads as NaN; keep the last good scale rather than
    // collapsing the overlay to nothing.
    if (!Number.isFinite(scale)) return;
    this.importPlacement.update(p => ({ ...p, scale: Math.max(0.001, scale) }));
    this.syncImportSprite();
  }

  /**
   * The size slider runs on a log scale.
   *
   * A useful scale spans three orders of magnitude — a 500 px sketch and a 8000 px poster
   * both have to reach the same world size — and a linear slider spends nearly all of its
   * travel above the range anyone wants.
   */
  readonly importScaleLog = computed(() => Math.log10(this.importPlacement().scale));

  setImportScaleLog(value: string | number): void {
    this.setImportScale(Math.pow(10, Number(value)));
  }

  /**
   * The scale as text for the number field beside the slider.
   *
   * Rounded to four significant figures and back through `Number`, so a scale that is
   * exactly 8 shows as "8" rather than "8.000" — the field is there to be *read* as much as
   * typed into, and trailing zeros make an exact value look like a rounded one. Significant
   * figures rather than decimals because the scale spans 0.001 to 1000, where a fixed
   * decimal count is either useless at one end or noise at the other.
   */
  readonly importScaleText = computed(() => String(Number(this.importPlacement().scale.toPrecision(4))));

  /** Zoom the overlay about its own centre; steps are relative, so any scale stays usable. */
  scaleImportBy(factor: number): void {
    if (!this.importSource) return;
    this.importPlacement.update(p => ({ ...p, scale: Math.max(0.001, p.scale * factor) }));
    this.syncImportSprite();
  }

  setImportOpacity(value: string | number): void {
    this.importOpacity.set(Number(value));
    this.syncImportSprite();
  }

  setImportThreshold(value: string | number): void {
    this.importThreshold.set(Number(value));
  }

  setImportTier(tier: DetailTier): void {
    this.importTier.set(tier);
  }

  clearImport(): void {
    this.clearImportSprite();
    this.importSource = null;
    this.importName.set(null);
    this.importError.set(null);
    this.importProgress.set({ done: 0, total: 0 });
    this.scheduleStream();
  }

  private clearImportSprite(): void {
    if (!this.importSprite) return;
    this.renderer.overlayLayer.removeChild(this.importSprite);
    // The texture wraps the decoded bitmap and nothing else shares it, so it goes too —
    // otherwise every image tried out during alignment stays in VRAM for the session.
    this.importSprite.destroy({ texture: true, textureSource: true });
    this.importSprite = null;
  }

  /** Push placement and opacity onto the preview sprite. */
  private syncImportSprite(): void {
    const src = this.importSource;
    const sprite = this.importSprite;
    if (!src || !sprite) return;
    const p = this.importPlacement();
    sprite.position.set(p.x, p.y);
    sprite.width = src.width * p.scale;
    sprite.height = src.height * p.scale;
    sprite.alpha = this.importOpacity();
    this.scheduleStream();
  }

  cancelImport(): void {
    this.importCancel.cancelled = true;
  }

  /**
   * Burn the placed image into the terrain rasters.
   *
   * Shape and colour go in as **two separate stamps at two tiers**, both cut from the same
   * mask so they cannot disagree about where land is. Shape wants the finer tier — that is
   * what a coastline is — while colour belongs on Grob, because the composite reads fine over
   * coarse and colour left in a detail tier can never be overridden from a coarser one again.
   *
   * There is no undo. The chunk manager streams the area a few cells at a time precisely so
   * an import far larger than VRAM is possible at all, and snapshotting every touched chunk
   * for the undo stack would put the whole thing back in memory. Hence the confirmation.
   */
  async stampImport(): Promise<void> {
    const src = this.importSource;
    if (!src || !this.chunks || this.importBusy()) return;

    const tier = this.importTier();
    const colorTier = this.importColorTier();
    const withColor = this.importWithColor();
    const bounds = placementBounds(src, this.importPlacement());

    const total =
      importCellCount(bounds, tier) + (withColor ? importCellCount(bounds, colorTier) : 0);
    const label = (t: DetailTier) => this.importTierOptions().find(o => o.id === t)?.label ?? t;

    const ok = confirm(
      `Das Bild wird fest in die Karte gestempelt (${total} Kacheln; Form ab „${label(tier)}“` +
        (withColor ? `, Farbe ab „${label(colorTier)}“` : ', ohne Farbe') +
        (this.importReplace()
          ? ', vorhandener Inhalt im Bereich wird auf allen Stufen gelöscht'
          : '') +
        (this.importReplaceObjects() ? ', Symbole im Bereich werden gelöscht' : '') +
        '). Das lässt sich nicht rückgängig machen. Fortfahren?',
    );
    if (!ok) return;

    this.importError.set(null);
    this.importBusy.set(true);
    this.importCancel = { cancelled: false };
    this.importProgress.set({ done: 0, total });

    /*
     * The history has to go, not just be skipped.
     *
     * The stamp rewrites chunks without capturing them, which makes it non-undoable — but
     * every snapshot an *earlier* stroke took of those same chunks is now stale, and
     * `restore` blits a whole chunk. Undoing across an import therefore dropped a
     * chunk-shaped square of the pre-import map back in and uploaded it, minutes later, with
     * nothing to connect it to the import.
     */
    this.undoStack?.clear();
    this.refreshHistoryState();

    // Nodes are built once and reused for every chunk the stamp walks — see `StampPass`.
    const nodes: Container[] = [];
    try {
      if (this.importReplace()) await this.clearImportArea(bounds);
      if (this.importReplaceObjects()) this.clearImportObjects(bounds);
      if (this.importCancel.cancelled) return;

      // Progress spans both stamps, so each run's own count is offset by what came before.
      let done = 0;
      const report = (n: number, runTotal: number) => {
        this.importProgress.set({ done: done + n, total: Math.max(total, done + runTotal) });
      };

      await this.stampMask(src, bounds, tier, 'height', false, nodes, report);
      done += importCellCount(bounds, tier);

      if (withColor && !this.importCancel.cancelled) {
        await this.stampMask(src, bounds, colorTier, 'landColor', true, nodes, report);
      }
    } catch (err) {
      console.error('[MapEditor] Landmassen-Import fehlgeschlagen', err);
      this.importError.set('Import fehlgeschlagen — Details in der Konsole.');
    } finally {
      // The mask textures own their working canvases, so they are freed with the nodes.
      for (const node of nodes) {
        node.destroy({ children: true, texture: true, textureSource: true });
      }
      this.importBusy.set(false);
    }

    /*
     * Symbols take the colour of the ground beneath them, and the stamp just replaced that
     * ground — so they have to be re-sampled or the previous map's tints stay scattered over
     * the new one. Only worth doing when land colour can actually have changed: the colour
     * pass wrote it, or "replace" cleared it back to the base colour.
     */
    if (!this.importCancel.cancelled && !this.importError() && (withColor || this.importReplace())) {
      await this.resampleStampedTints(bounds, withColor ? colorTier : 'low');
    }

    // A cancelled or failed run keeps the overlay, so the placement is not lost.
    if (!this.importCancel.cancelled && !this.importError()) this.clearImport();
    // The stamp saves as it goes; this only picks up chunks whose upload failed and were
    // left dirty, which would otherwise sit unsaved until the editor is closed.
    this.scheduleFlush();
    this.scheduleStream();
  }

  /**
   * One layer of the import, at its own tier.
   *
   * The mask is rebuilt per run rather than shared, because its working resolution is derived
   * from the target tier's texel density — the same canvas serving both would be wasteful at
   * Grob and blurry at Hoch.
   */
  private async stampMask(
    src: LandmassSource,
    bounds: Bounds,
    tier: DetailTier,
    layer: 'height' | 'landColor',
    color: boolean,
    nodes: Container[],
    report: (done: number, total: number) => void,
  ): Promise<void> {
    const masks = buildLandmassMasks(src.bitmap, {
      threshold: this.importThreshold(),
      withColor: color,
      worldPerTexel: worldPerTexel(tier),
      worldWidth: bounds.maxX - bounds.minX,
    });

    const canvas = color ? masks.colorCanvas : masks.heightCanvas;
    if (!canvas) return;

    await this.chunks!.stampRegion(
      [{ layer, node: this.maskNode(canvas, bounds, nodes) }],
      bounds,
      tier,
      report,
      this.importCancel,
    );
  }

  /**
   * Clear the import rectangle on **every** tier before stamping.
   *
   * The old erase pass only covered the write tier and coarser, which made "Bereich ersetzen"
   * a half-truth: re-importing at Mittel left the previous import's Hoch content untouched, so
   * the map reverted to it the moment you zoomed in — the exact failure this whole change is
   * about. Finer tiers have to go too, or a re-import cannot repair anything.
   *
   * Done by deleting chunk *files* on the server rather than by rendering transparency into
   * them. Rendering would be thousands of readbacks and uploads to produce emptiness; deleting
   * is a handful of requests whatever the area, which is the only reason clearing Hoch across
   * a continent is affordable at all.
   *
   * Chunk-aligned, and deliberately conservative: only chunks lying wholly inside the
   * rectangle are dropped, since a partly-covered one still holds map that must survive. The
   * consequence is a chunk-wide fringe at the rectangle's edge where older fine-tier content
   * can remain.
   */
  /**
   * Remove symbols, labels, regions and markers standing inside the import rectangle.
   *
   * A separate pass from `clearImportArea` because these are not rasters and share nothing
   * with the tier machinery: they are one flat list for the whole map, which is why clearing
   * every tier still left the previous map's mountains sitting over the new coastline.
   *
   * Deleted through ordinary object ops, so other sessions see them go one at a time, exactly
   * as if they had been selected and deleted by hand. Not put on the undo stack — the import
   * it belongs to is not undoable either, and half-undoable would be worse than neither.
   */
  private clearImportObjects(bounds: Bounds): void {
    const data = this.store.data();
    if (!data) return;

    const inside = (o: { x: number; y: number }) =>
      o.x >= bounds.minX && o.x <= bounds.maxX && o.y >= bounds.minY && o.y <= bounds.maxY;

    for (const collection of OBJECT_COLLECTIONS) {
      // Snapshotted before deleting: the ops mutate the very arrays being walked.
      const doomed = (data[collection] as AnyMapObject[]).filter(inside).map(o => o.id);
      for (const id of doomed) this.store.deleteObject(collection, id);
    }

    this.setSelection([]);
    this.setLabelSelection([]);
  }

  private async clearImportArea(bounds: Bounds): Promise<void> {
    const edgeNodes: Container[] = [];
    try {
      for (const tier of TIERS) {
        if (this.importCancel.cancelled) return;

        // Wholly inside: delete the files. Free whatever the area.
        const inner = innerCellRect(bounds, tier);
        if (inner) {
          for (const layer of ['height', 'landColor'] as const) {
            const cells = await this.store.clearChunks(layer, tier, inner);
            if (cells === null) {
              throw new Error(
                `Chunks konnten nicht gelöscht werden (${layer}/${tier}) — Import abgebrochen, ` +
                  'damit nichts halb Ersetztes zurückbleibt.',
              );
            }
            this.chunks?.dropChunks(layer, tier, cells);
          }
        }

        /*
         * Crossed by the edge: erase the rectangle out of them.
         *
         * These cannot be deleted — they hold map outside the region too — and they cannot be
         * skipped either, which is what the first version did. One chunk spans 23 hexes at
         * `med` and 182 at `low`, so leaving them is not a fringe artifact but a band of the
         * old map straight across the new one, composited over it at every zoom.
         *
         * `skipEmpty` keeps the cost honest: only cells that actually hold something are
         * touched, so an import onto empty ocean does no work here at all.
         */
        /*
         * Crossed by the edge: erase the rectangle out of them.
         *
         * These cannot be deleted — they hold map outside the region too — and they cannot be
         * skipped either. One chunk spans 23 hexes at `med` and 182 at `low`, so leaving them
         * is not a fringe artifact but a band of the old map straight across the new one.
         *
         * Which of them actually hold anything is **the server's** answer, not this client's.
         * Deciding it from the local `chunkVersions` — a cache that can lose entries — skipped
         * chunks that really did hold content: the old pixels stayed, and the next stamp wrote
         * a partly transparent image over them and republished the lot. That is a square of
         * previously deleted map reappearing, which is exactly what it looked like.
         */
        const ring = edgeCells(bounds, tier);
        if (!ring.length) continue;

        const bound = {
          minCx: Math.min(...ring.map(c => c.cx)),
          minCy: Math.min(...ring.map(c => c.cy)),
          maxCx: Math.max(...ring.map(c => c.cx)),
          maxCy: Math.max(...ring.map(c => c.cy)),
        };

        for (const layer of ['height', 'landColor'] as const) {
          const stored = await this.api.listChunks(this.worldName(), layer, tier, bound);
          const live = new Set(stored.map(([cx, cy]) => `${cx}/${cy}`));

          // Unioned with local work the server cannot know about yet.
          const cells = ring.filter(
            c =>
              live.has(`${c.cx}/${c.cy}`) ||
              this.chunks!.hasUnsavedPaint(layer, tier, c.cx, c.cy),
          );
          if (!cells.length) continue;

          const rect = new Container();
          rect.addChild(
            new Graphics()
              .rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)
              .fill({ color: 0xffffff }),
          );
          edgeNodes.push(rect);

          await this.chunks?.stampCells([{ layer, node: rect, erase: true }], cells, tier, {
            cancel: this.importCancel,
          });
        }
      }
    } finally {
      for (const node of edgeNodes) node.destroy({ children: true });
    }
  }

  /**
   * Wrap a mask canvas as a world-positioned node for the stamp.
   *
   * Linear filtering rather than nearest: the mask is binary, so the interpolation across
   * its edge is exactly the antialiasing the coastline wants, and without it every source
   * pixel shows as a square along the shore.
   */
  private maskNode(canvas: HTMLCanvasElement, bounds: Bounds, own: Container[]): Container {
    const texture = Texture.from(canvas);
    texture.source.scaleMode = 'linear';
    const sprite = new Sprite(texture);
    sprite.position.set(bounds.minX, bounds.minY);
    sprite.width = bounds.maxX - bounds.minX;
    sprite.height = bounds.maxY - bounds.minY;

    const node = new Container();
    node.addChild(sprite);
    own.push(node);
    return node;
  }

  private isPanning = false;
  private isPainting = false;
  private lastPointer = { x: 0, y: 0 };
  private brushResize: { x: number; initial: number; scaling: 'brush' | 'symbol' | 'game' } | null =
    null;
  private dragSymbols: {
    startWorld: { x: number; y: number };
    moved: boolean;
    /** Pre-drag copies, for the undo entry committed on release. */
    origins: Map<string, MapSymbol>;
  } | null = null;
  /**
   * An in-progress drag of a whole secret group.
   *
   * `dx/dy` are carried rather than recomputed on release: the objects themselves are moved
   * optimistically as the pointer travels, so by the time the button comes up their current
   * positions are the *result*, and subtracting them would yield zero.
   */
  private dragSecret: {
    startWorld: { x: number; y: number };
    origins: Map<string, AnyMapObject>;
    dx: number;
    dy: number;
    moved: boolean;
  } | null = null;

  /**
   * `additive` is captured here rather than read on release: the pointer-up handler takes no
   * event, and a shift released mid-drag should not turn an add into a replace anyway.
   */
  private boxSelect: {
    startWorld: { x: number; y: number };
    startScreen: { x: number; y: number };
    additive: boolean;
  } | null = null;
  private streamScheduled = false;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private lakeSeed = Math.floor(Math.random() * 1e9);
  /** World-space extent of the stroke in progress, for bounded post-stroke work. */
  private strokeBounds: Bounds | null = null;
  /**
   * Detail tier the stroke in progress writes to.
   *
   * Fixed at stroke start rather than read per dab: a tier switch halfway through would
   * leave the first half of one stroke in a different grid from the second.
   */
  /** Bare-ground colour for untinted symbols; set before `SymbolView` exists. */
  private symbolLandColor = 0xe4d5b7;
  private strokeTier: DetailTier = 'high';
  /** Whether the stroke in progress writes its tier alone. Fixed with `strokeTier`. */
  private strokeOnlyTier = false;
  private cursorGraphic = new Graphics();
  private previewSprite = new Sprite();
  private lastWorld: { x: number; y: number } | null = null;

  async ngAfterViewInit(): Promise<void> {
    const host = this.pixiHost?.nativeElement;
    if (!host) return;

    const world = this.route.snapshot.paramMap.get('worldName') ?? '';
    this.worldName.set(world);

    await this.renderer.init(host);
    this.renderer.onContextLost = () => this.contextLost.set(true);
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
    // Terrain only draws cells whose layers have all arrived, so a finished load is what
    // tells the view there is something new it can show.
    this.chunks.onChunkUpdated = () => this.scheduleStream();

    this.landPalette.set(data.landPalette);
    this.waterPalette.set(data.waterPalette);
    this.waterBase.set(data.settings.waterBase ?? '#3f6d8c');
    const waterRgb = hexToRgb(this.waterBase(), [0.25, 0.43, 0.55]);
    this.terrain.setWaterDefault(waterRgb);
    this.renderer.setOceanColor(waterRgb);

    // Maps written before `landBase` existed fall back to the parchment the shader used as
    // a constant, so they look identical after the upgrade.
    this.landBase.set(data.settings.landBase ?? '#e4d5b7');
    this.terrain.setLandDefault(hexToRgb(this.landBase(), [0.894, 0.835, 0.718]));
    this.symbolLandColor = parseHex(this.landBase());

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
      this.symbols.setLandColor(this.symbolLandColor);
      this.renderer.objectLayer.addChild(this.symbols.container);
      this.symbols.rebuild(data.symbols);

      this.selectSymbolTool('trees');
    } else {
      this.assetsError.set(this.assets.lastError);
    }

    // Added last so labels draw above symbols regardless of asset availability.
    this.renderer.objectLayer.addChild(this.labelView.container);

    // Above the objects it frames, below the grid and cursor — the marks are annotations on
    // the map, not part of it.
    this.secretOverview = new SecretOverview();
    this.renderer.overlayLayer.addChild(this.secretOverview.container);

    /*
     * Play layers, in the order they have to stack.
     *
     * Fog first, so it hides the map and everything drawn on it. Sketch and tokens above the
     * fog: a route traced across unexplored ground still has to be visible, and a token you
     * cannot see is a token you cannot move.
     */
    this.fogView = new FogView();
    this.sketchView = new SketchView();
    this.playAids = new PlayAidsView();
    this.renderer.overlayLayer.addChild(
      this.fogView.container,
      this.sketchView.container,
      this.playAids.container,
    );

    this.revealedSet = new Set(data.fog?.revealed ?? []);
    this.sketchView.rebuild(data.sketch ?? []);
    this.sketchCount.set(this.sketchView.count);
    this.playAids.setTokens(data.tokens ?? []);

    this.subs.push(
      // The controller dedupes our own echo by id and plays the sound once.
      this.store.pings$.subscribe(ping => this.pingCtl.addRemotePing(ping)),
      this.store.measurements$.subscribe(lines => {
        this.measureLines = lines;
        this.scheduleStream();
      }),
    );

    this.paperOpacity.set(data.settings.paperOpacity ?? 0.35);
    await this.applyPaper(data.settings.paperTexture ?? '');

    this.subs.push(
      this.store.chunkInvalidations$.subscribe(inv =>
        this.chunks?.invalidate(inv.layer, inv.tier, inv.cx, inv.cy),
      ),
      // Another session cleared ground: free it rather than refetching, since there is
      // nothing left on the server to fetch.
      this.store.chunkDrops$.subscribe(drop => {
        // Loud on purpose: terrain disappearing because *another* session deleted it is
        // otherwise indistinguishable from it disappearing for no reason at all.
        console.warn(
          `[MapEditor] ${drop.cells.length} chunk(s) of ${drop.layer}/${drop.tier} dropped ` +
            'by another session',
          drop.cells,
        );
        this.chunks?.dropChunks(drop.layer, drop.tier, drop.cells);
        this.scheduleStream();
      }),
      this.store.objectOps$.subscribe(op => {
        if (op.t === 'fog') {
          // Somebody else moved the fog. Rebuild the lookup set from the document, which the
          // store has already updated, rather than replaying the delta a second time.
          this.revealedSet = new Set(this.store.data()?.fog?.revealed ?? []);
          this.fogRevision++;
          this.fogView?.invalidate();
          this.scheduleStream();
          return;
        }
        if (op.t !== 'add' && op.t !== 'upd' && op.t !== 'del') return;
        const data = this.store.data();

        if (op.c === 'symbols') {
          if (op.t === 'add') this.symbols?.add(op.v as MapSymbol);
          else if (op.t === 'del') this.symbols?.remove(op.id);
          else {
            const sym = this.symbolById(op.id);
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
        } else if (op.c === 'tokens') {
          if (op.t === 'add') this.playAids?.addToken(op.v as MapToken);
          else if (op.t === 'del') this.playAids?.removeToken(op.id);
          else this.playAids?.setTokens(data?.tokens ?? []);
        } else if (op.c === 'sketch') {
          if (op.t === 'add') this.sketchView?.add(op.v as SketchStroke);
          else if (op.t === 'del') this.sketchView?.remove(op.id);
          else this.sketchView?.rebuild(data?.sketch ?? []);
          this.sketchCount.set(this.sketchView?.count ?? 0);
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
    // Brush feel is a per-user preference, restored before the first stroke. It carries the
    // working tier too, so this has to run before the pin is pushed onto the chunk manager.
    this.loadBrushPrefs();
    this.setTierPin(this.tierPin());
    // After the views exist: the mode decides whether the fog is drawn at all.
    this.applyMode();
    this.ready.set(true);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.pingCtl.destroy();
    // Withdraw our ruler, or it stays on everyone else's map with nobody able to clear it.
    this.store.sendMeasure(null);
    if (this.diagTimer) clearInterval(this.diagTimer);
    mapDiag.enabled = false;
    this.resizeObserver?.disconnect();
    if (this.flushTimer) clearTimeout(this.flushTimer);

    const host = this.pixiHost?.nativeElement;
    if (host) this.detachInput(host);

    // A stamp in flight holds the chunk manager; stop it before anything is torn down.
    this.importCancel.cancelled = true;
    this.clearImportSprite();

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
      const zoom = this.renderer.camera.zoom;
      const view = this.renderer.camera.visibleBounds(0);

      /*
       * Everything gets the plain visible rectangle and adds its own lead.
       *
       * The lead has to be measured in chunks of whichever tier the streamer picks, and only
       * the streamer knows that — so passing a pre-padded rectangle in meant one margin
       * (a `high` chunk) being applied at every zoom, which at `low` is a rounding error.
       */
      this.chunks?.update(view);
      const tier = this.chunks?.detailTier ?? 'high';
      if (tier !== this.detailTier()) this.detailTier.set(tier);

      // The tier is whatever the streamer settled on, so the two never disagree about what
      // is loaded, and the view's shorter lead stays inside the streamer's.
      this.terrain?.update(view, tier, zoom);

      this.symbols?.render(view, zoom, this.isGM());
      // Dash spacing and handle size are zoom-dependent, so regions redraw on view change.
      this.regionView.render(view, zoom, this.isGM(), true);
      // Zoom drives the selection outline's width, so it stays one screen pixel.
      this.labelView.render(view, this.isGM(), zoom);

      // Last: the marks frame boxes the views above have just recomputed, so drawing them
      // any earlier would frame where things were on the previous frame.
      this.drawOverview();

      this.fogView?.update(view, this.revealedSet, this.isGM(), this.fogRevision);
      this.sketchView?.render(view);
      this.playAids?.render(view, zoom, this.allMeasureLines(), this.selectedTokenId());
      // Screen-space overlays (pings, the wheel) follow the camera through this.
      this.viewEpoch.update(n => n + 1);
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
      texture: this.brushTexture(),
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
    const previous = this.tab();
    this.tab.set(tab);
    if (tab !== 'symbols') this.setSelection([]);
    // The cross-category selection drives three views at once, so leaving the tab has to hand
    // each of them back its own idea of what is selected rather than leaving ours behind.
    if (previous === 'secrets' && tab !== 'secrets') {
      this.setSecretSelection([]);
      this.labelView.setSelection(this.selectedLabelIds());
      this.regionView.setSelected(this.selectedRegionId());
    }
    // Both directions: leaving with the eye still active would strand the map behind a veil
    // in a tab that has no way to lift it.
    this.applyOverview();

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
    // Tintable sprites are white silhouettes; show them in the colour they will be placed in.
    return this.assets.thumbStyle(id, 44, this.symbolTint());
  }

  spriteName(id: string): string {
    return this.assets.meta(id)?.name ?? id;
  }

  private rollNextSprite(): void {
    const next = this.assets.randomInGroup(this.activeGroup());
    if (next) this.currentSprite.set(next);
    this.redrawCursor();
  }

  /** Step through what the picker is showing — bound to Shift+wheel. */
  private cycleSprite(delta: number): void {
    const list = this.visibleSprites();
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
      const tint = this.groundTintHex(this.chunks?.sampleWorld('landColor', world.x, world.y) ?? null);
      if (tint) symbol.tint = tint;
    } else if (meta?.tintable) {
      // A chosen colour, not the ground: these are markers meant to stand out against it.
      symbol.tint = this.symbolTint();
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
      const sym = this.symbolById(id);
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
      const sym = this.symbolById(id);
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

  /**
   * Live text editing.
   *
   * The label follows every keystroke locally so the map reads as a direct preview, but the
   * synced op is debounced — one op per typed character would flood the channel and fill
   * the undo history with single letters.
   */
  onLabelTextInput(text: string): void {
    this.labelText.set(text);

    const id = this.selectedLabelId();
    const label = id ? this.labelView.get(id) : undefined;
    if (!id || !label) return;

    label.text = text;
    this.labelView.update(label);
    this.scheduleStream();

    if (this.labelTextTimer) clearTimeout(this.labelTextTimer);
    this.labelTextTimer = setTimeout(() => {
      this.labelTextTimer = null;
      this.store.updateObject('labels', id, { text });
    }, 400);
  }

  private labelTextTimer: ReturnType<typeof setTimeout> | null = null;

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

    /*
     * Game mode has its own cursors, and none of the editing ones apply — showing a terrain
     * brush outline while the ruler is active would advertise a tool that is not reachable.
     * The fog brush is the one that needs an outline, since its radius is otherwise invisible
     * until you have already painted with it.
     */
    if (this.inGame()) {
      this.previewSprite.visible = false;
      if (this.gameTool() === 'cursor' && this.fogMode() !== 'neutral') {
        const centreHex = worldToHex(world.x, world.y);
        for (const hex of hexesInRadius(centreHex.q, centreHex.r, this.fogRadius())) {
          const centre = hexToWorld(hex);
          const corners = hexCorners(centre.x, centre.y);
          g.moveTo(corners[0].x, corners[0].y);
          for (let i = 1; i < corners.length; i++) g.lineTo(corners[i].x, corners[i].y);
          g.closePath();
        }
        g.stroke({
          color: this.fogMode() === 'reveal' ? 0x8fd0ff : 0xf87171,
          width: 1.5 / zoom,
          alpha: 0.9,
        });
      }
      return;
    }

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
      const outline = this.brushes?.lakeOutline(
        world.x,
        world.y,
        this.brushSize(),
        this.lakeSeed,
        this.brushNoise(),
      );
      if (outline?.length) {
        g.poly(outline).stroke({ width: 1.5 / zoom, color: 0x8fd0ff, alpha: 0.9 });
        // The satellites are seeded separately, so the preview shows the body only.
        g.circle(world.x, world.y, this.brushSize() * 1.9);
        g.stroke({ width: 1 / zoom, color: 0x8fd0ff, alpha: 0.25 });
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

    const hex = this.groundTintHex(this.chunks?.sampleWorld('landColor', x, y) ?? null);
    const tint = hex ? parseHex(hex) : parseHex(this.landBase());
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

    if (meta.colorable) sprite.tint = this.groundTintAt(world.x, world.y);
    else if (meta.tintable) sprite.tint = parseHex(this.symbolTint());
    else sprite.tint = 0xffffff;

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
    /*
     * The stroke lands on whatever tier the view settled on.
     *
     * This is what makes continent-scale drawing possible at all: a brush that always wrote
     * the finest grid spanned ~300 chunks for one wide stroke, each a 3 MB texture to create,
     * paint, upload and hold resident. The streamer thrashed — a chunk was measured uploaded
     * and evicted 41 ms later. Painting the tier you are actually looking at makes the same
     * stroke one or two chunks, plus its coarse copies.
     */
    this.strokeTier = this.chunks?.detailTier ?? 'high';
    // Fixed at stroke start alongside the tier, for the same reason: toggling isolation
    // mid-drag would put the first half of one stroke in a different set of tiers.
    this.strokeOnlyTier = this.onlyTier() || toolIsTierLocal(this.terrainTool());
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
        this.strokeTier,
        this.onlyTier(),
        this.brushNoise(),
      );
      this.lakeSeed = Math.floor(Math.random() * 1e9);
      this.lastWorld = world;
      // The stamp reaches well past the brush radius; cover it all for the overview.
      const r = this.brushSize() * 2.4;
      this.noteStrokeExtent({ x: world.x - r, y: world.y - r });
      this.noteStrokeExtent({ x: world.x + r, y: world.y + r });
      this.endPaint();
      this.redrawCursor();
      this.scheduleStream();
      return;
    }

    this.brushes?.stroke(world, this.brush(), this.strokeTier, this.strokeOnlyTier);
    this.scheduleStream();
  }

  private continuePaint(world: { x: number; y: number }): void {
    if (!this.isPainting || this.terrainTool() === 'lakeStamp') return;
    this.noteStrokeExtent(world);
    this.brushes?.stroke(world, this.brush(), this.strokeTier, this.strokeOnlyTier);

    /*
     * A stroke can create ground that had no terrain cell at all.
     *
     * The view skips cells over ground nothing has been drawn on — most of a map — so the
     * first dab on virgin ocean has no mesh to show up in until the streamer runs again.
     * Rate-limited to one pass per frame by `scheduleStream` itself, so this costs nothing
     * per dab.
     */
    this.scheduleStream();

    /*
     * Re-tint symbols as the colour goes down, not only when the stroke ends.
     *
     * Watching symbols snap to their new colour on mouse-up is jarring — you cannot judge
     * a colour while the thing standing on it still shows the old one. Throttled, because
     * each symbol costs a GPU readback, and applied locally during the drag: the ops are
     * emitted once at stroke end so the network sees one update per symbol, not one per
     * pointer move.
     */
    if (toolLayer(this.terrainTool()) === 'landColor') this.livePreviewSymbolTints();
  }

  /**
   * The ground colour a symbol should take, as seen.
   *
   * The sampler returns the texel premultiplied — Pixi's readback never unpremultiplies — so
   * resolving it means the same composite the shader performs: base colour where coverage is
   * missing, plus the stored (already weighted) paint. Using the raw RGB instead is what made
   * symbols along the feathered edge of a stroke come out black, since at 3% coverage the
   * stored colour *is* 3% brightness.
   *
   * Returns undefined where no chunk could be read, so a symbol keeps whatever tint it had
   * rather than being repainted from ground nobody has loaded.
   */
  private groundTintHex(sample: Sample | null): string | undefined {
    if (!sample) return undefined;
    const base = hexToRgb(this.landBase(), [0.894, 0.835, 0.718]);
    const k = 1 - sample.a / 255;
    return rgbToHex(
      Math.round(base[0] * 255 * k + sample.r),
      Math.round(base[1] * 255 * k + sample.g),
      Math.round(base[2] * 255 * k + sample.b),
    );
  }

  /** Locally re-tint symbols under the brush while painting. No ops, no undo entries. */
  private livePreviewSymbolTints(): void {
    const now = performance.now();
    if (now - this.lastLiveTintAt < 90) return;
    this.lastLiveTintAt = now;

    const b = this.brushSize() * 1.5;
    const world = this.lastWorld;
    if (!world || !this.symbols || !this.chunks) return;

    const near = this.symbols.index.query({
      minX: world.x - b,
      minY: world.y - b,
      maxX: world.x + b,
      maxY: world.y + b,
    });

    // One batched readback for the whole brush, not one per symbol. Sampling individually
    // meant a GPU stall per symbol per tick, which is what made painting over a forest crawl.
    const colorable = near.filter(sym => this.assets.meta(sym.asset)?.colorable);
    if (colorable.length === 0) return;

    const ground = this.chunks.sampleWorldMany('landColor', colorable);

    let touched = false;
    colorable.forEach((sym, i) => {
      const tint = this.groundTintHex(ground[i]);
      if (tint === sym.tint) return;
      sym.tint = tint;
      this.symbols?.update(sym);
      touched = true;
    });
    if (touched) this.scheduleStream();
  }

  private lastLiveTintAt = 0;

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
    const bounds = this.strokeBounds;
    if (!bounds || !this.symbols || !this.chunks) return;

    const colorable = this.colorableIn(bounds);
    if (!colorable.length) return;

    // Batched for the same reason as the live preview: a wide stroke can pass over hundreds
    // of symbols, and one readback each would stall the frame that ends the stroke.
    this.applyTints(colorable, this.chunks.sampleWorldMany('landColor', colorable));
  }

  /** Colourable symbols whose base falls in a region. */
  private colorableIn(bounds: Bounds): MapSymbol[] {
    return (this.symbols?.index.query(bounds) ?? []).filter(
      sym => this.assets.meta(sym.asset)?.colorable,
    );
  }

  /**
   * Commit re-sampled tints as ops, skipping the ones that did not actually change.
   *
   * Repainting the same shade must emit nothing: a stroke over a dense forest would otherwise
   * put one update per symbol on the wire for no visible difference.
   */
  private applyTints(
    symbols: MapSymbol[],
    samples: (Sample | null)[],
    undoable = true,
  ): void {
    const changed: { sym: MapSymbol; tint: string | undefined }[] = [];
    symbols.forEach((sym, i) => {
      const tint = this.groundTintHex(samples[i]);
      if (tint !== sym.tint) changed.push({ sym, tint });
    });
    if (!changed.length) return;

    /*
     * An import's re-tint is deliberately *not* undoable.
     *
     * The stamp itself cannot be undone, so recording only its tint changes would make Ctrl+Z
     * revert the symbol colours and nothing else — leaving the previous map's tints over the
     * new ground while looking like the import had been undone. A stroke's re-tint is
     * recorded, because the stroke it belongs to is.
     */
    if (undoable) this.undoStack?.begin();
    for (const { sym, tint } of changed) {
      const patch = { tint };
      if (undoable) {
        this.undoStack?.recordObject({
          c: 'symbols',
          id: sym.id,
          before: clone(sym),
          after: clone({ ...sym, ...patch }),
        });
      }
      this.store.updateObject('symbols', sym.id, patch);
    }
    if (undoable) this.undoStack?.commit('Symbolfarbe');
  }

  /**
   * Re-tint every colourable symbol under a stamped region.
   *
   * The stamp changes the ground a symbol is standing on, so a symbol that samples its colour
   * from the ground has to follow — otherwise an import leaves the previous map's tints
   * scattered over the new one.
   *
   * Streams rather than reading what is resident: after an import almost none of the affected
   * map is on screen, so the ordinary sampler would skip everything but the current view.
   * Only the tiers the import actually wrote colour into are read, which is a handful of
   * chunks at `low` or `med`.
   */
  private async resampleStampedTints(bounds: Bounds, colorTier: DetailTier): Promise<void> {
    if (!this.symbols || !this.chunks) return;

    const colorable = this.colorableIn(bounds);
    if (!colorable.length) return;

    // Coarsest first, matching how the sampler composites tiers.
    const tiers = [...TIERS.filter(t => t === colorTier || coarserTiers(colorTier).includes(t))]
      .reverse();

    const samples = await this.chunks.sampleWorldStreaming('landColor', colorable, tiers, {
      cancel: this.importCancel,
    });
    this.applyTints(colorable, samples, false);
    this.scheduleStream();
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
    // Alt and G are held modifiers, so their release matters as much as their press.
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

    // Game mode owns the pointer entirely: none of the editing tools are reachable while
    // playing, which is the point of having a mode at all.
    if (this.inGame()) {
      this.gamePointerDown(world, p, e);
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
          this.boxSelect = { startWorld: world, startScreen: p, additive: e.shiftKey };
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
        this.boxSelect = { startWorld: world, startScreen: p, additive: e.shiftKey };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      return;
    }

    if (this.tab() === 'secrets') {
      if (this.secretSelectAt(world, e.shiftKey)) {
        // Snapshot before the drag, not during: the move mutates the objects in place, so
        // capturing later would record the already-moved state and undo to nothing.
        const data = this.store.data();
        const origins = new Map<string, AnyMapObject>();
        if (data) {
          for (const ref of this.secretSelection()) {
            const obj = find(data, ref);
            if (obj) origins.set(refKey(ref), clone(obj));
          }
        }
        this.dragSecret = { startWorld: world, origins, dx: 0, dy: 0, moved: false };
      } else {
        // Empty space starts a rubber band, matching every other selector.
        this.boxSelect = { startWorld: world, startScreen: p, additive: e.shiftKey };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      return;
    }

    if (this.isPlacingSymbols()) {
      this.placeSymbol(world);
      return;
    }

    /*
     * The Karte tab owns no brush, so a click there must not paint.
     *
     * It used to fall straight through to `beginPaint`, which meant adjusting the coastline
     * sliders and then clicking on the map laid down land with whichever brush the Land tab
     * happened to have selected. With the landmass overlay the same click now has a real
     * job — dragging the image into alignment — so the fall-through has to stop here either
     * way.
     */
    if (this.tab() === 'map') {
      if (this.hasImport() && !this.importBusy()) {
        const p = this.importPlacement();
        this.importDrag = { startWorld: world, origin: { x: p.x, y: p.y } };
      }
      return;
    }

    if (this.isSelecting()) {
      const hit = this.selectSymbolAt(world, e.shiftKey);
      if (hit) {
        // Snapshot positions now: the drag mutates them in place, so capturing later
        // would record the already-moved state and undo to nothing.
        const origins = new Map<string, MapSymbol>();
        for (const id of this.selectedIds()) {
          const sym = this.symbolById(id);
          if (sym) origins.set(id, clone(sym));
        }
        this.dragSymbols = { startWorld: world, moved: false, origins };
      } else {
        // Empty space starts a rubber band rather than doing nothing.
        this.boxSelect = { startWorld: world, startScreen: p, additive: e.shiftKey };
        this.marquee.set({ x: p.x, y: p.y, w: 0, h: 0 });
      }
      return;
    }

    this.beginPaint(world);
  };

  /**
   * Pointer-down while playing.
   *
   * Every branch is guarded by what the tool is, and the GM-only ones are guarded again in
   * the methods themselves — the tool list is filtered for players, but a filtered list is a
   * UI convenience, not a permission.
   */
  private gamePointerDown(world: Point, screen: Point, e: PointerEvent): void {
    // G + left-drag opens the radial ping wheel, whatever tool is active. A ping is
    // something you do *while* doing something else, so it cannot be a mode you leave.
    if (this.pingCtl.gDown) {
      if (this.pingCtl.beginWheel(screen.x, screen.y, world.x, world.y)) {
        e.preventDefault();
        return;
      }
    }

    // Shift-drag resizes whichever brush is live — the same gesture the terrain brushes use
    // in edit mode, so there is one way to resize a brush in the whole editor.
    if (e.shiftKey && this.resizableBrush()) {
      e.preventDefault();
      this.brushResize = {
        x: e.clientX,
        initial: this.activeGameBrushSize(),
        scaling: 'game',
      };
      return;
    }

    switch (this.gameTool()) {
      case 'measure': {
        // Snapped to hex centres: distances are counted in hexes, so a ruler that started
        // half a hex off would disagree with the number it prints.
        const snapped = hexToWorld(worldToHex(world.x, world.y));
        this.measureDrag = { start: snapped, end: snapped };
        break;
      }

      case 'draw':
        this.beginSketch(world);
        break;

      case 'reveal':
        this.revealSecretAt(world);
        break;

      case 'cursor': {
        // Fog first: while a fog mode is armed the cursor paints instead of grabbing.
        if (this.isGM() && this.fogMode() !== 'neutral') {
          this.fogPainting = true;
          this.paintFog(world);
          break;
        }
        const hit = this.playAids?.tokenAt(world.x, world.y) ?? null;
        if (hit) {
          this.selectedTokenId.set(hit.id);
          if (this.isGM()) this.dragToken = { id: hit.id, before: clone(hit) };
        } else if (this.isGM() && e.altKey) {
          // Alt to place, so an ordinary click on empty map deselects instead of littering
          // the board with figures nobody asked for.
          this.placeToken(world);
        } else {
          this.selectedTokenId.set(null);
        }
        break;
      }
    }
    this.scheduleStream();
  }

  private fogPainting = false;

  /** Whether shift-drag has a brush to resize right now. */
  private resizableBrush(): boolean {
    if (this.gameTool() === 'draw') return true;
    return this.isGM() && this.gameTool() === 'cursor' && this.fogMode() !== 'neutral';
  }

  private activeGameBrushSize(): number {
    if (this.gameTool() === 'draw') {
      return this.eraserMode() ? this.eraserSize() : this.penSize();
    }
    return this.fogRadius();
  }

  private setActiveGameBrushSize(value: number): void {
    if (this.gameTool() === 'draw') {
      if (this.eraserMode()) this.eraserSize.set(Math.round(Math.min(60, Math.max(2, value))));
      else this.penSize.set(Math.round(Math.min(60, Math.max(1, value))));
    } else {
      this.fogRadius.set(Math.round(Math.min(20, Math.max(0, value))));
    }
    this.redrawCursor();
  }

  /**
   * Reveal whatever secret the clicked object belongs to.
   *
   * This is the tool the plan always meant to exist, and it lives here rather than in the
   * editor: revealing is something that happens at the table, with the players looking at
   * their own screens. Clicking any member reveals the whole group.
   */
  private revealSecretAt(world: Point): void {
    if (!this.isGM()) return;

    const hit = this.secretHitTest(world);
    const data = this.store.data();
    if (!hit || !data) return;

    const obj = find(data, hit);
    if (!obj) return;

    // A loose secret object with no group still reveals — otherwise the tool would silently
    // do nothing on exactly the objects that were hidden before groups existed.
    if (!obj.secret) {
      if (obj.vis !== 'secret') return;
      this.store.updateObject(hit.c, hit.id, { vis: 'public' });
      this.scheduleStream();
      return;
    }

    const ops = revealOps(data, obj.secret);
    if (!ops.length) return;
    this.activeSecretId.set(obj.secret);
    this.runSecretOps(ops);
  }

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

    if (this.importDrag) {
      // Anchored to the grab point rather than accumulated per move, so the image never
      // drifts away from the cursor over a long drag.
      const { startWorld, origin } = this.importDrag;
      this.importPlacement.update(p => ({
        ...p,
        x: origin.x + (world.x - startWorld.x),
        y: origin.y + (world.y - startWorld.y),
      }));
      this.syncImportSprite();
      return;
    }

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

    /*
     * Panning is checked before anything mode-specific.
     *
     * It used to be the other way round, and middle-drag simply did not pan during play:
     * the game branch returned first, so the pan handler below was unreachable. Panning is
     * not a tool — it has to work whatever else is going on.
     */
    if (this.isPanning) {
      this.renderer.camera.panByScreen(
        e.clientX - this.lastPointer.x,
        e.clientY - this.lastPointer.y,
      );
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.applyView();
      return;
    }

    if (this.inGame()) {
      this.gamePointerMove(world, p, e);
      return;
    }

    if (this.dragSecret) {
      this.dragSecretBy(world);
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

  /** Pointer-drag while playing. Panning is handled before this is reached. */
  private gamePointerMove(world: Point, screen: Point, e: PointerEvent): void {
    if (this.pingCtl.wheelOpen) {
      this.pingCtl.updateWheel(screen.x, screen.y);
      return;
    }

    if (this.brushResize?.scaling === 'game') {
      const delta = (e.clientX - this.brushResize.x) / 6;
      this.setActiveGameBrushSize(this.brushResize.initial + delta);
      return;
    }

    if (this.measureDrag) {
      // Both ends snap, so the printed hex count and the drawn line always agree.
      this.measureDrag.end = hexToWorld(worldToHex(world.x, world.y));
      // Everyone else's screen follows the drag; the local line is drawn without waiting.
      this.store.sendMeasure(this.measureDrag);
      this.scheduleStream();
      return;
    }
    if (this.sketchDraft) {
      this.continueSketch(world);
      return;
    }
    if (this.fogPainting) {
      this.paintFog(world);
      this.redrawCursor();
      return;
    }
    if (this.dragToken) {
      const token = this.playAids?.getToken(this.dragToken.id);
      if (!token) return;
      const centre = hexToWorld(worldToHex(world.x, world.y));
      if (token.x === centre.x && token.y === centre.y) return;
      token.x = centre.x;
      token.y = centre.y;
      this.scheduleStream();
    }
  }

  /** Finish whatever play gesture was in progress. */
  private gamePointerUp(): void {
    if (this.pingCtl.wheelOpen) {
      this.pingCtl.endWheel();
      return;
    }
    if (this.brushResize?.scaling === 'game') {
      this.brushResize = null;
      return;
    }
    if (this.measureDrag) {
      this.endMeasure();
      return;
    }
    if (this.sketchDraft) {
      this.endSketch();
      return;
    }
    if (this.fogPainting) {
      this.fogPainting = false;
      return;
    }
    if (this.dragToken) {
      const token = this.playAids?.getToken(this.dragToken.id);
      const before = this.dragToken.before;
      this.dragToken = null;
      // One op at the end, not one per hex crossed while dragging across the map.
      if (token && (token.x !== before.x || token.y !== before.y)) {
        this.store.updateObject('tokens', token.id, { x: token.x, y: token.y });
      }
    }
  }

  /** Withdraw this client's ruler line from everyone's map. */
  private endMeasure(): void {
    if (!this.measureDrag) return;
    this.measureDrag = null;
    this.store.sendMeasure(null);
    this.scheduleStream();
  }

  private onPointerUp = (): void => {
    this.isPanning = false;

    if (this.inGame()) {
      this.gamePointerUp();
      return;
    }

    if (this.importDrag) {
      this.importDrag = null;
      return;
    }

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
      if (this.tab() === 'secrets') {
        this.secretSelectInRect(rect, this.boxSelect.additive);
      } else if (this.tab() === 'labels') {
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

    if (this.dragSecret) {
      this.commitSecretMove();
      this.dragSecret = null;
      return;
    }

    if (this.dragSymbols) {
      if (this.dragSymbols.moved) this.commitSelectionMove();
      this.dragSymbols = null;
      return;
    }

    this.endPaint();
  };

  /**
   * The symbol with this id.
   *
   * Goes through the spatial index rather than scanning `data.symbols`. The index keys
   * objects by id already and holds the very same instances the document array does, so
   * mutating through either is the same act — but the scan was O(total) per lookup, and the
   * selection drag below performs one per selected symbol per pointer move. On a map with
   * tens of thousands of symbols that is the difference between a smooth drag and a stall.
   */
  private symbolById(id: string): MapSymbol | undefined {
    return this.symbols?.index.get(id);
  }

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
      const sym = this.symbolById(id);
      if (!sym) continue;
      sym.x += dx;
      sym.y += dy;
      this.symbols?.update(sym);
    }
    this.scheduleStream();
  }

  /**
   * Move the whole secret selection with the pointer.
   *
   * Applied straight onto the live objects and their views so the drag reads as direct
   * manipulation; the ops are only sent on release, since one op per mouse move would flood
   * the socket and fill the undo history with pixels.
   */
  private dragSecretBy(world: { x: number; y: number }): void {
    const drag = this.dragSecret;
    const data = this.store.data();
    if (!drag || !data) return;

    const dx = world.x - drag.startWorld.x;
    const dy = world.y - drag.startWorld.y;
    if (dx === 0 && dy === 0) return;
    drag.startWorld = world;
    drag.dx += dx;
    drag.dy += dy;
    drag.moved = true;

    for (const ref of this.secretSelection()) {
      const obj = find(data, ref);
      if (!obj) continue;
      obj.x += dx;
      obj.y += dy;

      if (ref.c === 'regions') {
        const region = obj as MapRegion;
        // The outline is the region; shifting only the cached centroid would leave the
        // shape behind and quietly desynchronise the spatial index from what is drawn.
        for (const pt of region.points) {
          pt.x += dx;
          pt.y += dy;
        }
        this.regionView.update(region);
      } else if (ref.c === 'symbols') {
        this.symbols?.update(obj as MapSymbol);
      } else if (ref.c === 'labels') {
        this.labelView.update(obj as MapLabel);
      }
    }
    this.drawOverview();
    this.scheduleStream();
  }

  private commitSelectionMove(): void {
    const data = this.store.data();
    const origins = this.dragSymbols?.origins;
    if (!data || !origins) return;

    this.undoStack?.begin();
    for (const id of this.selectedIds()) {
      const sym = this.symbolById(id);
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
      // Ctrl+wheel already means "resize the thing you are placing"; on the Karte tab the
      // thing being placed is the landmass overlay.
      if (this.tab() === 'map' && this.hasImport()) {
        this.scaleImportBy(e.deltaY > 0 ? 1 / 1.1 : 1.1);
        return;
      }
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

  /** Held modifiers: Alt mirrors the symbol stamp, G arms the ping wheel. */
  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'Alt' && this.mirrorStamp()) {
      this.mirrorStamp.set(false);
      this.redrawCursor();
    }
    if (e.key.toLowerCase() === 'g') this.pingCtl.setGDown(false);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

    /*
     * Game-mode shortcuts.
     *
     * The same letters the old world map used, because they are what everyone at the table
     * already has in their fingers: S cursor, B draw, M measure, E eraser, V flips the fog
     * mode, D leaves it, G held arms the ping wheel.
     *
     * Editing keys are deliberately unreachable here. The editing selections survive the
     * switch to game mode, so Delete would quietly remove a symbol picked before the session
     * started — live, on everyone's screen.
     */
    if (this.inGame()) {
      const key = e.key.toLowerCase();

      if (key === 'g') {
        this.pingCtl.setGDown(true);
        return;
      }

      if (e.ctrlKey && key === 'z') {
        // Undo the last line, not the last map edit: during play the sketch is the only
        // thing being added, and reaching into the map's history would be a nasty surprise.
        if (this.gameTool() === 'draw') {
          e.preventDefault();
          this.undoLastSketch();
        }
        return;
      }

      switch (key) {
        case 's':
          e.preventDefault();
          this.selectGameTool('cursor');
          return;
        case 'b':
          e.preventDefault();
          this.selectGameTool('draw');
          this.eraserMode.set(false);
          return;
        case 'm':
          e.preventDefault();
          this.selectGameTool('measure');
          return;
        case 'e':
          if (this.gameTool() === 'draw') {
            e.preventDefault();
            this.eraserMode.update(v => !v);
            this.redrawCursor();
          }
          return;
        case 'v':
          if (this.isGM()) {
            e.preventDefault();
            this.selectGameTool('cursor');
            this.fogMode.update(m => (m === 'reveal' ? 'hide' : 'reveal'));
            this.redrawCursor();
          }
          return;
        case 'd':
          if (this.isGM()) {
            e.preventDefault();
            this.fogMode.set('neutral');
            this.redrawCursor();
          }
          return;
        case 'escape':
          this.endMeasure();
          this.selectedTokenId.set(null);
          return;
        case 'delete':
        case 'backspace':
          if (this.selectedTokenId()) {
            e.preventDefault();
            this.deleteSelectedToken();
          }
          return;
      }
      return;
    }

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

    if (this.tab() === 'secrets') {
      /*
       * The secrets tab deletes nothing.
       *
       * Its selection spans collections and is held separately, so the per-tab selection
       * signals still carry whatever was picked before switching here — a label selected in
       * the Beschriftung tab would be silently deleted by a Delete pressed over an entirely
       * different object. Grouping is not a destructive mode; the key stays inert.
       */
      if (e.key === 'Escape') {
        e.preventDefault();
        this.setSecretSelection([]);
        this.activeSecretId.set(null);
      }
      return;
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
    const rgb = hexToRgb(color, [0.25, 0.43, 0.55]);
    this.terrain?.setWaterDefault(rgb);
    // The backdrop is the same water, so it has to follow or the seam becomes visible —
    // unless the inspector has claimed it, in which case it stays "no data" black.
    if (!this.tierIsolate()) this.renderer.setOceanColor(rgb);
  }

  setLandBase(color: string): void {
    this.landBase.set(color);
    this.store.setPath('settings.landBase', color);
    // A uniform, so every cell picks it up on the next frame — no chunks are rewritten and
    // nothing has to be re-uploaded. That is the whole point of it being a setting.
    this.terrain?.setLandDefault(hexToRgb(color, [0.894, 0.835, 0.718]));
    // Untinted symbols stand on bare ground, so they follow it.
    this.symbols?.setLandColor(parseHex(color));
    this.scheduleStream();
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
    this.saveBrushPrefs();
    this.redrawCursor();
  }

  setSoftness(value: string | number): void {
    this.brushSoftness.set(Number(value));
    this.saveBrushPrefs();
    this.redrawCursor();
  }

  setStrength(value: string | number): void {
    this.brushStrength.set(Number(value));
    this.saveBrushPrefs();
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

/** Append into a keyed bucket, creating it on first use. */
function push<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

/** "2 Beschriftungen, 3 Symbole" — the same phrasing wherever a set is summarised. */
function countLabel(refs: readonly ObjectRef[]): string {
  const counts: Record<string, number> = { labels: 0, symbols: 0, regions: 0 };
  for (const ref of refs) counts[ref.c] = (counts[ref.c] ?? 0) + 1;

  const parts: string[] = [];
  if (counts['labels']) parts.push(`${counts['labels']} Beschriftung(en)`);
  if (counts['symbols']) parts.push(`${counts['symbols']} Symbol(e)`);
  if (counts['regions']) parts.push(`${counts['regions']} Region(en)`);
  return parts.join(', ');
}

function isMemberPublic(data: MapEditorData, ref: ObjectRef): boolean {
  return find(data, ref)?.vis !== 'secret';
}
