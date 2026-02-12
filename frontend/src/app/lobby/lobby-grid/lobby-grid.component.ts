/**
 * Lobby Grid Component
 * 
 * Main canvas rendering for the virtual tabletop.
 * Handles:
 * - Hexagon grid rendering (transparent, with subtle outlines)
 * - Background images layer
 * - Drawing strokes layer  
 * - Token placement
 * - Pan/zoom navigation
 * - Wall placement
 * - Measurement
 * - Image transforms
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ViewChild, 
  ElementRef,
  AfterViewInit, 
  OnChanges, 
  OnDestroy,
  SimpleChanges,
  inject,
  signal,
  effect,
  untracked,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyMap, Token, Stroke, MapImage, HexCoord, HexMath, Point, generateId, TextureStroke, LibraryTexture } from '../../model/lobby.model';
import { LobbyStoreService } from '../../services/lobby-store.service';
import { ImageService } from '../../services/image.service';
import { TextureService } from '../../services/texture.service';
import { LobbyTokenComponent } from '../lobby-token/lobby-token.component';
import { ToolType, DragMode } from '../lobby.component';

// Texture palette entry interface
interface TexturePaletteEntry {
  textureId: string;
  name: string;
  brushStrength: number;
  brushType: 'hard' | 'soft';
  textureScale: number;
  textureHue: number;
  textureColorBlend: number;
  textureBlendColor: string;
  layer: 'background' | 'foreground';
  previewUrl?: string; // Cached colored preview
}

@Component({
  selector: 'app-lobby-grid',
  standalone: true,
  imports: [CommonModule, LobbyTokenComponent],
  templateUrl: './lobby-grid.component.html',
  styleUrls: ['./lobby-grid.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyGridComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Canvas elements
  @ViewChild('gridCanvas') gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageCanvas') imageCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('textureCanvas') textureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('foregroundCanvas') foregroundCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas') drawCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  // Inputs
  @Input() map: LobbyMap | null = null;
  @Input() tokens: Token[] = [];
  @Input() currentTool: ToolType = 'cursor';
  @Input() brushColor = '#000000';
  @Input() penBrushSize = 4;
  @Input() eraserBrushSize = 12;
  @Input() textureBrushSize = 30;
  @Input() textureBrushStrength = 1.0; // 0-1
  @Input() textureScale = 1.0; // Tiling scale for textures
  @Input() textureBrushType: 'hard' | 'soft' = 'soft'; // Default to soft brush
  @Input() textureColorBlend = 0; // 0-100: 0 = pure texture, 100 = pure color
  @Input() textureHue = 0; // -180 to 180 degrees hue shift
  @Input() textureBlendColor = '#ffffff'; // Color to blend with texture
  @Input() drawWithWalls = false;
  @Input() dragMode: DragMode = 'free';
  @Input() drawLayerVisible = true;
  @Input() imageLayerVisible = true;
  @Input() selectedImageId: string | null = null;
  @Input() selectedTextureId: string | null = null;
  @Input() isGM = false;
  @Input() isEraserMode = false; // E key toggles this
  @Input() textureLayer: 'background' | 'foreground' = 'background';

  // Outputs
  @Output() tokenDrop = new EventEmitter<{ characterId: string; position: HexCoord }>();
  @Output() tokenMove = new EventEmitter<{ tokenId: string; position: HexCoord }>();
  @Output() tokenRemove = new EventEmitter<string>();
  @Output() quickTokenDrop = new EventEmitter<{ name: string; portrait: string; position: HexCoord }>();
  @Output() imageSelect = new EventEmitter<string | null>();
  @Output() imageTransform = new EventEmitter<{ id: string; transform: Partial<MapImage> }>();
  @Output() imageDelete = new EventEmitter<string>();
  @Output() placeImage = new EventEmitter<{ imageId: string; x: number; y: number; width: number; height: number }>();
  @Output() toolAutoSelect = new EventEmitter<string>();
  @Output() textureBrushSizeChange = new EventEmitter<number>();
  @Output() textureBrushStrengthChange = new EventEmitter<number>();
  @Output() textureBrushTypeChange = new EventEmitter<'hard' | 'soft'>();
  @Output() textureScaleChange = new EventEmitter<number>();
  @Output() textureHueChange = new EventEmitter<number>();
  @Output() textureColorBlendChange = new EventEmitter<number>();
  @Output() textureBlendColorChange = new EventEmitter<string>();
  @Output() selectedTextureIdChange = new EventEmitter<string>();
  @Output() textureLayerChange = new EventEmitter<'background' | 'foreground'>();

  // Services
  private store = inject(LobbyStoreService);
  private imageService = inject(ImageService);
  private textureService = inject(TextureService);
  private cdr = inject(ChangeDetectorRef);

  // Document-level listeners for continuous tracking outside container
  private documentMouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private documentMouseUpListener: ((e: MouseEvent) => void) | null = null;

  // Tile-based texture rendering system
  private textureTiles = new Map<string, HTMLCanvasElement>(); // Key: "x,y"
  private tileDataVersions = new Map<string, string>(); // Track tile imageId to prevent unnecessary reloads
  private textureTileSize = 512; // pixels per tile
  private dirtyTiles = new Set<string>(); // Tiles that need to be persisted
  private savingTiles = new Set<string>(); // Tiles currently being saved (to avoid duplicate saves)
  private tileSaveTimeout: any = null; // Debounce timer for tile saves (NO LONGER USED - saves immediately now)
  private tileSaveQueue: string[] = []; // Queue of tiles waiting to be saved
  private isSavingBatch = false; // Flag to prevent concurrent batch saves
  private lastRenderTime = 0;
  private renderThrottleMs = 16; // ~60fps
  private currentDrawingTiles = new Set<string>(); // Tiles being drawn to in current stroke
  
  // Stroke canvas for single-pass drawing (prevents accumulation/pulsing)
  private strokeCanvas: HTMLCanvasElement | null = null;
  private strokeCtx: CanvasRenderingContext2D | null = null;
  private strokeBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  private strokeCanvasOrigin = { x: 0, y: 0 }; // What world position canvas (0,0) represents
  private lastPaintedPoint: Point | null = null; // Track last drawn position for spacing
  
  // Cache processed texture during stroke to prevent lag
  private cachedProcessedTexture: HTMLCanvasElement | null = null;
  private cachedTextureId: string | null = null;
  private isLoadingTexture = false; // Prevent concurrent texture loads
  
  // Reusable temp canvases for soft brush (prevents GC pressure)
  private softBrushTempCanvas: HTMLCanvasElement | null = null;
  private softBrushTempCtx: CanvasRenderingContext2D | null = null;
  private lastSoftBrushSize = 0; // Track size to know when to resize
  
  // Mouse event throttling to prevent lag
  private isProcessingMouseMove = false;

  // Canvas contexts
  private gridCtx: CanvasRenderingContext2D | null = null;
  private imageCtx: CanvasRenderingContext2D | null = null;
  private foregroundCtx: CanvasRenderingContext2D | null = null;
  private textureCtx: CanvasRenderingContext2D | null = null;
  private drawCtx: CanvasRenderingContext2D | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  // Image cache
  private imageCache = new Map<string, HTMLImageElement>();
  private textureCache = new Map<string, HTMLImageElement>();

  // Render optimization
  private renderPending = false;
  private resizeObserver: ResizeObserver | null = null;

  // Pan and zoom
  panX = 0;
  panY = 0;
  scale = 1;
  private zoomStartPoint: { x: number; y: number } | null = null; // Track where CTRL+zoom started

  // Interaction state
  private isPanning = false;
  private isZooming = false; // CTRL+middle-mouse zoom
  private isDrawing = false;
  private isDrawingTexture = false; // For texture brush
  private isErasingTexture = false; // For texture eraser
  private isWallDrawing = false;
  private isAdjustingTextureBrushSize = false; // Shift+drag for texture brush size
  private wallPaintMode: 'add' | 'remove' = 'add';
  private pendingWallChanges: { hex: HexCoord; action: 'add' | 'remove' }[] = []; // Batch wall changes
  private currentStrokePoints: Point[] = [];
  private currentTexturePoints: Point[] = []; // For texture brush
  private lastMousePos: Point = { x: 0, y: 0 };
  private erasedStrokeIds = new Set<string>(); // Track strokes erased during current drag
  private isAdjustingBrushSize = false; // Shift+drag to adjust brush size
  private brushSizeAdjustStart: { x: number; y: number; initialSize: number } | null = null;

  // Measurement
  measureStart = signal<Point | null>(null);
  measureEnd = signal<Point | null>(null);
  measureDistance = signal(0);

  // Brush size adjustment visual
  brushSizeCircle = signal<{ pos: Point; size: number } | null>(null);

  // Token dragging
  draggingToken: Token | null = null;
  dragGhostPosition = signal<Point | null>(null);
  dragCurrentPosition = signal<Point | null>(null); // Current position of dragged token in world coords
  dragHoverHex = signal<HexCoord | null>(null);
  dragStartHex = signal<HexCoord | null>(null);
  dragPath = signal<HexCoord[]>([]);
  dragWaypoints = signal<HexCoord[]>([]); // Waypoints for enforced mode
  dragPathExceedsSpeed = signal<boolean>(false); // Is the path too long?
  dragPathIsBlocked = signal<boolean>(false); // Is the destination blocked by walls?
  private pathfindingCache = new Map<string, HexCoord[]>(); // Cache for pathfinding results

  // Image transform state
  private transformingImageIds: string[] = []; // For group transforms
  private transformingImageId: string | null = null;
  private transformMode: 'move' | 'scale' | 'rotate' = 'move';
  private transformHandle: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'rotate' | null = null;
  private transformAnchor: Point | null = null;
  private initialImageTransform: Partial<MapImage> | null = null;
  private initialGroupTransforms: Map<string, Partial<MapImage>> = new Map(); // For group transforms
  private groupBoundingBox: { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number } | null = null;
  private previewImageTransform = signal<{ id: string; transform: Partial<MapImage> } | null>(null); // Preview during transform
  private previewGroupTransforms = signal<Map<string, Partial<MapImage>> | null>(null); // Preview for group transforms
  private draggingImageId: string | null = null; // For image dragging
  private draggingImageIds: string[] = []; // For group dragging
  private imageDragStart: Point | null = null;
  private previewImageDrag = signal<{ id: string; position: Point } | null>(null); // Preview during drag
  private previewGroupDrags = signal<Map<string, Point> | null>(null); // Preview for group drags

  // Image selection
  selectedImages = signal<string[]>([]);
  private selectionBox = signal<{ start: Point; end: Point } | null>(null);
  private isBoxSelecting = false;
  private boxSelectionStart: Point | null = null;

  // Context menu
  showContextMenu = signal(false);
  contextMenuPosition = signal<Point>({ x: 0, y: 0 });
  contextMenuImageId = signal<string | null>(null);
  contextMenuTokenId = signal<string | null>(null);
  contextMenuHex = signal<HexCoord | null>(null);

  // Texture Palette (15 slots, stored locally)
  texturePalette = signal<(TexturePaletteEntry | null)[]>(Array(15).fill(null));
  currentPaletteSlot = signal<number | null>(null); // Track which slot is currently active
  private readonly PALETTE_STORAGE_KEY = 'lobby-texture-palette';
  private paletteUpdateTimeout: any = null; // Debounce palette updates
  private isLoadingFromPalette = false; // Flag to prevent circular updates when clicking slots

  constructor() {
    // Note: Effect removed - palette updates now handled in ngOnChanges
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Ignore shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // D key for Draw tool
    if (event.key === 'd' || event.key === 'D') {
      event.preventDefault();
      this.toolAutoSelect.emit('draw');
      return;
    }

    // B key for Texture Brush tool
    if (event.key === 'b' || event.key === 'B') {
      event.preventDefault();
      this.toolAutoSelect.emit('texture');
      return;
    }

    // Ctrl+Z for undo
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.store.undoStroke();
    }
    
    // Number keys 1-9 for palette slots (0 = slot 10)
    if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
      const key = event.key;
      if (key >= '1' && key <= '9') {
        event.preventDefault();
        const slotIndex = parseInt(key) - 1; // 1 -> slot 0, 9 -> slot 8
        const entry = this.texturePalette()[slotIndex];
        if (entry) {
          this.onPaletteSlotClick(slotIndex);
        }
        return;
      }
      if (key === '0') {
        event.preventDefault();
        const slotIndex = 9; // 0 -> slot 9
        const entry = this.texturePalette()[slotIndex];
        if (entry) {
          this.onPaletteSlotClick(slotIndex);
        }
        return;
      }
    }
    
    // Delete key to delete selected images (supports multi-select)
    if (event.key === 'Delete') {
      const selected = this.selectedImages();
      if (selected.length > 0) {
        event.preventDefault();
        for (const imageId of selected) {
          this.imageDelete.emit(imageId);
        }
        this.selectedImages.set([]);
        this.imageSelect.emit(null);
      } else if (this.selectedImageId) {
        event.preventDefault();
        this.imageDelete.emit(this.selectedImageId);
        this.imageSelect.emit(null);
      }
    }
  }

  // ============================================
  // Lifecycle
  // ============================================

  ngAfterViewInit(): void {
    this.initCanvases();
    this.centerView();
    this.scheduleRender();
    this.setupResizeObserver();
    this.loadPalette(); // Load saved palette from localStorage
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Preload texture when inputs change
    if (changes['selectedTextureId'] || changes['textureColorBlend'] || changes['textureHue']) {
      // Preload texture when selected to prevent lag when drawing starts
      if (changes['selectedTextureId']) {
        this.cacheProcessedTexture();
        
        // Mutual exclusion: clear palette selection when library texture is selected
        const newTextureId = changes['selectedTextureId'].currentValue;
        const currentSlot = this.currentPaletteSlot();
        if (currentSlot !== null && newTextureId) {
          const paletteEntry = this.texturePalette()[currentSlot];
          // Clear palette slot if selected texture doesn't match the active palette entry
          if (!paletteEntry || paletteEntry.textureId !== newTextureId) {
            console.log('[Palette] Clearing slot - library texture selected');
            this.currentPaletteSlot.set(null);
          }
        }
      }
    }
    
    if (changes['map'] || changes['tokens'] || changes['selectedImageId']) {
      this.scheduleRender();
    }
    if (changes['drawLayerVisible']) {
      this.updateLayerVisibility();
    }
    if (changes['imageLayerVisible']) {
      this.updateLayerVisibility();
    }

    // Update active palette slot when texture settings change
    // BUT skip if we're loading FROM a palette slot (prevent circular update)
    const currentSlot = this.currentPaletteSlot();
    if (currentSlot !== null && !this.isLoadingFromPalette && (
      changes['textureHue'] || 
      changes['textureColorBlend'] || 
      changes['textureScale'] || 
      changes['textureBlendColor'] ||
      changes['textureBrushStrength'] ||
      changes['textureBrushType']
    )) {
      console.log('[Palette] Settings changed, will update slot', currentSlot, 'after 300ms debounce');
      // Debounce rapid changes (e.g., slider dragging)
      if (this.paletteUpdateTimeout) clearTimeout(this.paletteUpdateTimeout);
      this.paletteUpdateTimeout = setTimeout(() => {
        this.updateCurrentPaletteSlot(
          currentSlot, 
          this.textureHue, 
          this.textureColorBlend, 
          this.textureScale, 
          this.textureBlendColor,
          this.textureBrushStrength,
          this.textureBrushType
        );
      }, 300);
    }

    // Load texture tiles when map changes
    if (changes['map']) {
      // Save any pending tiles from previous map before switching
      if (this.tileSaveTimeout) {
        clearTimeout(this.tileSaveTimeout);
        this.tileSaveTimeout = null;
      }
      if (this.dirtyTiles.size > 0) {
        this.saveDirtyTiles();
      }
      this.loadTextureTiles();
    }
  }

  ngOnDestroy(): void {
    // Save any pending tiles immediately before cleanup
    if (this.tileSaveTimeout) {
      clearTimeout(this.tileSaveTimeout);
      this.tileSaveTimeout = null;
    }
    if (this.dirtyTiles.size > 0) {
      // Synchronous save before cleanup
      this.saveDirtyTiles();
    }
    
    // Clean up resources
    this.resizeObserver?.disconnect();
    this.removeDocumentListeners();
    this.textureTiles.clear();
    this.tileDataVersions.clear();
    this.dirtyTiles.clear();
    this.currentDrawingTiles.clear();
    this.strokeCanvas = null;
    this.strokeCtx = null;
    this.cachedProcessedTexture = null;
  }

  // ============================================
  // Canvas Setup
  // ============================================

  private initCanvases(): void {
    const canvases = [
      { el: this.gridCanvas?.nativeElement, name: 'grid' },
      { el: this.imageCanvas?.nativeElement, name: 'image' },
      { el: this.foregroundCanvas?.nativeElement, name: 'foreground' },
      { el: this.textureCanvas?.nativeElement, name: 'texture' },
      { el: this.drawCanvas?.nativeElement, name: 'draw' },
      { el: this.overlayCanvas?.nativeElement, name: 'overlay' },
    ];

    for (const { el, name } of canvases) {
      if (el) {
        const ctx = el.getContext('2d');
        if (name === 'grid') this.gridCtx = ctx;
        if (name === 'image') this.imageCtx = ctx;
        if (name === 'foreground') this.foregroundCtx = ctx;
        if (name === 'texture') this.textureCtx = ctx;
        if (name === 'draw') this.drawCtx = ctx;
        if (name === 'overlay') this.overlayCtx = ctx;
        this.resizeCanvas(el);
      }
    }
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const container = this.container?.nativeElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  private setupResizeObserver(): void {
    const container = this.container?.nativeElement;
    if (!container) return;

    this.resizeObserver = new ResizeObserver(() => {
      [this.gridCanvas, this.imageCanvas, this.textureCanvas, this.drawCanvas, this.overlayCanvas].forEach(ref => {
        if (ref?.nativeElement) {
          this.resizeCanvas(ref.nativeElement);
        }
      });
      this.scheduleRender();
    });
    this.resizeObserver.observe(container);
  }

  private centerView(): void {
    const container = this.container?.nativeElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    this.panX = rect.width / 2;
    this.panY = rect.height / 2;
  }

  private updateLayerVisibility(): void {
    // Draw eye only controls normal drawing strokes, not textures
    if (this.drawCanvas?.nativeElement) {
      this.drawCanvas.nativeElement.style.opacity = this.drawLayerVisible ? '1' : '0';
    }
    if (this.imageCanvas?.nativeElement) {
      this.imageCanvas.nativeElement.style.opacity = this.imageLayerVisible ? '1' : '0';
    }
  }

  // ============================================
  // Coordinate Transforms
  // ============================================

  private screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: (screenX - this.panX) / this.scale,
      y: (screenY - this.panY) / this.scale,
    };
  }

  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: worldX * this.scale + this.panX,
      y: worldY * this.scale + this.panY,
    };
  }

  // ============================================
  // Rendering
  // ============================================

  private scheduleRender(): void {
    if (this.renderPending) return;
    this.renderPending = true;
    requestAnimationFrame(() => {
      this.renderPending = false;
      this.render();
    });
  }

  private render(): void {
    // New layer-based rendering system
    // 1. Render background color on image layer
    // 2. Render layers in zIndex order (lowest = bottom, highest = top)
    // 3. Render grid
    // 4. Render overlay (tokens, etc.)
    // 5. Render strokes (drawing layer - always on top)

    const map = this.map;
    if (!map) return;

    // Clear all canvases first
    this.clearAllCanvases();

    // Start with background color
    this.renderBackground();

    // Check if map has layers defined
    if (map.layers && map.layers.length > 0) {
      // New layer system: render layers in zIndex order
      const sortedLayers = [...map.layers].sort((a, b) => a.zIndex - b.zIndex);
      
      for (const layer of sortedLayers) {
        if (!layer.visible) continue; // Skip hidden layers
        
        if (layer.type === 'image') {
          this.renderLayerImages(layer.id);
        } else if (layer.type === 'texture') {
          this.renderLayerTextures(layer.id);
        }
      }
    } else {
      // Legacy rendering for maps without layers
      this.renderImages();       // Background images
      this.renderTextureStrokes(); // Textures above background images
      this.renderForegroundImages(); // Foreground images above textures
    }

    this.renderGrid();          // Grid above all layers
    this.renderOverlay();       // Tokens + overlays above grid
    this.renderStrokes();       // Drawing strokes always on top
  }

  private clearAllCanvases(): void {
    const dpr = window.devicePixelRatio || 1;
    
    // Clear image canvas
    if (this.imageCtx && this.imageCanvas) {
      const canvas = this.imageCanvas.nativeElement;
      this.imageCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
    
    // Clear texture canvas
    if (this.textureCtx && this.textureCanvas) {
      const canvas = this.textureCanvas.nativeElement;
      this.textureCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
    
    // Clear foreground canvas
    if (this.foregroundCtx && this.foregroundCanvas) {
      const canvas = this.foregroundCanvas.nativeElement;
      this.foregroundCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
    
    // Clear grid canvas
    if (this.gridCtx && this.gridCanvas) {
      const canvas = this.gridCanvas.nativeElement;
      this.gridCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
    
    // Clear overlay canvas
    if (this.overlayCtx && this.overlayCanvas) {
      const canvas = this.overlayCanvas.nativeElement;
      this.overlayCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
    
    // Clear draw canvas
    if (this.drawCtx && this.drawCanvas) {
      const canvas = this.drawCanvas.nativeElement;
      this.drawCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    }
  }

  private renderBackground(): void {
    if (!this.imageCtx || !this.map) return;

    const canvas = this.imageCanvas.nativeElement;
    const ctx = this.imageCtx;
    const dpr = window.devicePixelRatio || 1;

    ctx.fillStyle = this.map?.backgroundColor || '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }

  private renderLayerImages(layerId: string): void {
    if (!this.imageCtx || !this.map) return;

    const canvas = this.imageCanvas.nativeElement;
    const ctx = this.imageCtx;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible viewport bounds
    const viewportBounds = {
      minX: this.screenToWorld(0, 0).x - 500,
      minY: this.screenToWorld(0, 0).y - 500,
      maxX: this.screenToWorld(canvas.width / dpr, canvas.height / dpr).x + 500,
      maxY: this.screenToWorld(canvas.width / dpr, canvas.height / dpr).y + 500
    };

    // Filter and sort images for this layer
    const layerImages = [...(this.map.images || [])]
      .filter(img => img.layerId === layerId)
      .filter(img => {
        // Viewport culling
        const halfW = img.width / 2;
        const halfH = img.height / 2;
        return !(img.x + halfW < viewportBounds.minX || 
                 img.x - halfW > viewportBounds.maxX ||
                 img.y + halfH < viewportBounds.minY ||
                 img.y - halfH > viewportBounds.maxY);
      })
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const img of layerImages) {
      this.renderImage(ctx, img);
    }

    // Render selection box if images on this layer are selected
    const selectedIds = this.selectedImages();
    if (selectedIds.length > 0) {
      const layerSelectedIds = selectedIds.filter(id => {
        const img = this.map?.images.find(i => i.id === id);
        return img?.layerId === layerId;
      });
      if (layerSelectedIds.length > 1) {
        this.renderGroupBoundingBox(ctx, layerSelectedIds);
      }
    }

    ctx.restore();
  }

  private renderLayerTextures(layerId: string): void {
    if (!this.textureCtx || !this.map) return;

    const canvas = this.textureCanvas.nativeElement;
    const ctx = this.textureCtx;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible tile range
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(canvas.width / dpr, canvas.height / dpr);

    const minTileX = Math.floor(topLeft.x / this.textureTileSize);
    const maxTileX = Math.ceil(bottomRight.x / this.textureTileSize);
    const minTileY = Math.floor(topLeft.y / this.textureTileSize);
    const maxTileY = Math.ceil(bottomRight.y / this.textureTileSize);

    // Disable image smoothing for crisp textures
    ctx.imageSmoothingEnabled = false;

    // Render only tiles for this layer
    const tiles = this.map.textureTiles || [];
    const layerTileKeys = new Set(
      tiles.filter(t => t.layerId === layerId).map(t => `${t.x},${t.y}`)
    );

    for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
      for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
        const tileKey = `${tileX},${tileY}`;
        
        if (layerTileKeys.has(tileKey)) {
          const tile = this.textureTiles.get(tileKey);
          
          if (tile) {
            const worldX = tileX * this.textureTileSize;
            const worldY = tileY * this.textureTileSize;
            
            ctx.drawImage(
              tile,
              0, 0, this.textureTileSize, this.textureTileSize,
              worldX - 0.5, worldY - 0.5, this.textureTileSize + 1, this.textureTileSize + 1
            );
          }
        }
      }
    }

    // Render current in-progress stroke if on active texture layer
    const activeLayerId = this.map.activeLayerId;
    if (activeLayerId === layerId && (this.isDrawingTexture || this.isErasingTexture) && this.strokeCanvas) {
      ctx.drawImage(
        this.strokeCanvas,
        this.strokeCanvasOrigin.x,
        this.strokeCanvasOrigin.y
      );
    }

    ctx.restore();
  }

  private renderGrid(): void {
    if (!this.gridCtx) return;

    const canvas = this.gridCanvas.nativeElement;
    const ctx = this.gridCtx;
    const dpr = window.devicePixelRatio || 1;

    // Clear grid canvas (background is now on image layer)
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible area with extra padding for edge hexes
    const topLeft = this.screenToWorld(-50, -50);
    const bottomRight = this.screenToWorld(canvas.width / dpr + 50, canvas.height / dpr + 50);

    // Use proper pixelToHex conversion for bounds (accounts for axial coordinate skew)
    const hexTL = HexMath.pixelToHex(topLeft);
    const hexBR = HexMath.pixelToHex(bottomRight);
    const hexTR = HexMath.pixelToHex({ x: bottomRight.x, y: topLeft.y });
    const hexBL = HexMath.pixelToHex({ x: topLeft.x, y: bottomRight.y });

    // Find the actual bounds across all four corners (axial coords are skewed)
    const margin = 3;
    const minQ = Math.min(hexTL.q, hexBR.q, hexTR.q, hexBL.q) - margin;
    const maxQ = Math.max(hexTL.q, hexBR.q, hexTR.q, hexBL.q) + margin;
    const minR = Math.min(hexTL.r, hexBR.r, hexTR.r, hexBL.r) - margin;
    const maxR = Math.max(hexTL.r, hexBR.r, hexTR.r, hexBL.r) + margin;

    // Build lookup sets
    const walls = this.map?.walls || [];
    const wallSet = new Set(walls.map(w => `${w.q},${w.r}`));
    const pathSet = new Set(this.dragPath().map(p => `${p.q},${p.r}`));
    const hoverHex = this.dragHoverHex();
    const pathIsInvalid = this.dragPathIsBlocked() || this.dragPathExceedsSpeed(); // Check if path is blocked OR too long

    // Performance: skip grid lines when zoomed way out but always render walls
    const hexCount = (maxQ - minQ + 1) * (maxR - minR + 1);
    const shouldSkipGrid = hexCount > 10000 || this.scale < 0.15; // Raised limit for better visibility

    // Always render all hexes (grid or walls)
    for (let q = minQ; q <= maxQ; q++) {
      for (let r = minR; r <= maxR; r++) {
        const hexKey = `${q},${r}`;
        const isHover = hoverHex && hoverHex.q === q && hoverHex.r === r;
        const isWall = wallSet.has(hexKey);
        const isInPath = pathSet.has(hexKey);
        
        // Skip non-wall hexes when zoomed out (but always show walls, hover, and path)
        if (shouldSkipGrid && !isWall && !isHover && !isInPath) {
          continue;
        }
        
        this.drawHexagon(ctx, { q, r }, isHover || false, isWall, isInPath, pathIsInvalid);
      }
    }

    ctx.restore();
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, hex: HexCoord, isHover: boolean, isWall: boolean, isInPath: boolean, pathIsInvalid: boolean): void {
    const center = HexMath.hexToPixel(hex);
    const corners = HexMath.getHexCorners(center);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    // Style based on state
    if (isHover) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 1)';
      ctx.lineWidth = 3;
    } else if (isInPath) {
      // Red if path is invalid (blocked OR exceeds speed), green otherwise
      if (pathIsInvalid) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      } else {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      }
      ctx.lineWidth = 2;
    } else if (isWall) {
      // Use adaptive color for walls based on pixel under hex center
      const wallColor = this.getComplementaryWallColor(center);
      ctx.fillStyle = wallColor.fill;
      ctx.fill();
      ctx.strokeStyle = wallColor.stroke;
      ctx.lineWidth = Math.max(1, 1.5 / this.scale); // More visible wall lines
    } else {
      // Smart grid color based on pixel under hex center
      const gridColor = this.getComplementaryGridColor(center);
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = Math.max(0.8, 1.5 / this.scale); // Thicker lines
    }
    ctx.stroke();
  }

  /**
   * Sample the pixel color under a hex center from rendered layers
   * Returns RGB array [r, g, b]
   */
  private samplePixelColor(worldPos: Point): [number, number, number] {
    // Convert world position to screen position
    const screenPos = this.worldToScreen(worldPos.x, worldPos.y);
    
    // Sample from texture canvas first (has actual texture content), fallback to image canvas
    const textureCanvas = this.textureCanvas?.nativeElement;
    const imageCanvas = this.imageCanvas?.nativeElement;
    
    if (!textureCanvas || !imageCanvas) {
      // Fallback to map background color if canvases not available
      return this.parseHexColor(this.map?.backgroundColor || '#e5e7eb');
    }

    // Canvas coordinates are in logical pixels (already DPR-scaled by context.scale() in resizeCanvas)
    const x = Math.floor(screenPos.x);
    const y = Math.floor(screenPos.y);

    // Check bounds to avoid errors
    if (x < 0 || y < 0 || x >= textureCanvas.width || y >= textureCanvas.height) {
      return this.parseHexColor(this.map?.backgroundColor || '#e5e7eb');
    }

    // Try texture canvas first
    try {
      const textureCtx = textureCanvas.getContext('2d', { willReadFrequently: true });
      if (textureCtx) {
        const pixel = textureCtx.getImageData(x, y, 1, 1).data;
        // If texture pixel has content (not fully transparent), use it
        if (pixel[3] > 10) {
          return [pixel[0], pixel[1], pixel[2]];
        }
      }
    } catch (e) {
      // Ignore errors from cross-origin canvas access
    }

    // Fallback to image canvas (background)
    try {
      const imageCtx = imageCanvas.getContext('2d', { willReadFrequently: true });
      if (imageCtx) {
        const pixel = imageCtx.getImageData(x, y, 1, 1).data;
        // Check if we got actual pixel data (not transparent background)
        if (pixel[3] > 0) {
          return [pixel[0], pixel[1], pixel[2]];
        }
      }
    } catch (e) {
      // Ignore errors
    }

    // Final fallback to background color
    return this.parseHexColor(this.map?.backgroundColor || '#e5e7eb');
  }

  /**
   * Parse hex color string to RGB array
   */
  private parseHexColor(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return [r, g, b];
  }

  /**
   * Calculate complementary color for grid lines based on sampled pixel
   */
  private getComplementaryGridColor(worldPos: Point): string {
    const [r, g, b] = this.samplePixelColor(worldPos);
    
    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // SUBTLE: Very low opacity for unobtrusive grid
    // Slightly darker than background (if light) or slightly lighter (if dark)
    const adjustment = luminance < 128 ? 25 : -25;
    const newLuminance = Math.max(0, Math.min(255, luminance + adjustment));
    return `rgba(${newLuminance}, ${newLuminance}, ${newLuminance}, 0.15)`; // Very subtle
  }

  /**
   * Calculate complementary color for walls based on sampled pixel
   */
  private getComplementaryWallColor(worldPos: Point): { fill: string; stroke: string } {
    const [r, g, b] = this.samplePixelColor(worldPos);
    
    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Walls should be more prominent than grid
    if (luminance < 128) {
      // Dark background: lighter walls with more opacity
      const lightness = Math.min(255, luminance + 120);
      return {
        fill: `rgba(${lightness}, ${lightness}, ${lightness}, 0.4)`,
        stroke: `rgba(${lightness}, ${lightness}, ${lightness}, 0.7)`
      };
    } else {
      // Light background: darker walls
      const darkness = Math.max(0, luminance - 120);
      return {
        fill: `rgba(${darkness}, ${darkness}, ${darkness}, 0.4)`,
        stroke: `rgba(${darkness}, ${darkness}, ${darkness}, 0.7)`
      };
    }
  }

  private renderImages(): void {
    if (!this.imageCtx || !this.map) return;

    const canvas = this.imageCanvas.nativeElement;
    const ctx = this.imageCtx;
    const dpr = window.devicePixelRatio || 1;

    // Render background color first
    ctx.fillStyle = this.map?.backgroundColor || '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible viewport bounds in world coordinates for culling
    const viewportBounds = {
      minX: this.screenToWorld(0, 0).x - 500, // Extra padding
      minY: this.screenToWorld(0, 0).y - 500,
      maxX: this.screenToWorld(canvas.width / dpr, canvas.height / dpr).x + 500,
      maxY: this.screenToWorld(canvas.width / dpr, canvas.height / dpr).y + 500
    };

    // Filter and sort background layer images only (default layer is background)
    const backgroundImages = [...(this.map.images || [])]
      .filter(img => !img.layer || img.layer === 'background')
      .filter(img => {
        // Viewport culling: skip images outside visible area
        const halfW = img.width / 2;
        const halfH = img.height / 2;
        return !(img.x + halfW < viewportBounds.minX || 
                 img.x - halfW > viewportBounds.maxX ||
                 img.y + halfH < viewportBounds.minY ||
                 img.y - halfH > viewportBounds.maxY);
      })
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const img of backgroundImages) {
      this.renderImage(ctx, img);
    }

    // Render group bounding box if multiple images are selected (only for background layer)
    const selectedIds = this.selectedImages();
    if (selectedIds.length > 1) {
      const allBackground = selectedIds.every(id => {
        const img = this.map?.images.find(i => i.id === id);
        return !img?.layer || img.layer === 'background';
      });
      if (allBackground) {
        this.renderGroupBoundingBox(ctx, selectedIds);
      }
    }

    ctx.restore();
  }

  private renderForegroundImages(): void {
    if (!this.foregroundCtx || !this.map) return;

    const canvas = this.foregroundCanvas.nativeElement;
    const ctx = this.foregroundCtx;
    const dpr = window.devicePixelRatio || 1;

    // Clear foreground canvas
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible viewport bounds in world coordinates for culling
    const viewportBounds = {
      minX: this.screenToWorld(0, 0).x - 500,
      minY: this.screenToWorld(0, 0).y - 500,
      maxX: this.screenToWorld(canvas.width / dpr, canvas.height / dpr).x + 500,
      maxY: this.screenToWorld(canvas.width / dpr, canvas.height / dpr).y + 500
    };

    // Filter and sort foreground layer images only
    const foregroundImages = [...(this.map.images || [])]
      .filter(img => img.layer === 'foreground')
      .filter(img => {
        // Viewport culling: skip images outside visible area
        const halfW = img.width / 2;
        const halfH = img.height / 2;
        return !(img.x + halfW < viewportBounds.minX || 
                 img.x - halfW > viewportBounds.maxX ||
                 img.y + halfH < viewportBounds.minY ||
                 img.y - halfH > viewportBounds.maxY);
      })
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const img of foregroundImages) {
      this.renderImage(ctx, img);
    }

    // Render group bounding box if multiple foreground images are selected
    const selectedIds = this.selectedImages();
    if (selectedIds.length > 1) {
      const allForeground = selectedIds.every(id => {
        const img = this.map?.images.find(i => i.id === id);
        return img?.layer === 'foreground';
      });
      if (allForeground) {
        this.renderGroupBoundingBox(ctx, selectedIds);
      }
    }

    ctx.restore();
  }

  private renderImage(ctx: CanvasRenderingContext2D, imgData: MapImage): void {
    // Skip if imageId is missing or undefined
    if (!imgData.imageId) {
      return; // Silent skip
    }
    
    // Apply preview transformations if this image is being transformed or dragged
    let effectiveImgData = imgData;
    
    // Check for group transforms/drags first
    const groupTransforms = this.previewGroupTransforms();
    const groupDrags = this.previewGroupDrags();
    
    if (groupTransforms && groupTransforms.has(imgData.id)) {
      effectiveImgData = { ...imgData, ...groupTransforms.get(imgData.id)! };
    } else if (groupDrags && groupDrags.has(imgData.id)) {
      const pos = groupDrags.get(imgData.id)!;
      effectiveImgData = { ...imgData, x: pos.x, y: pos.y };
    } else {
      // Fallback to single image preview
      const previewTransform = this.previewImageTransform();
      const previewDrag = this.previewImageDrag();
      
      if (previewTransform && previewTransform.id === imgData.id) {
        effectiveImgData = { ...imgData, ...previewTransform.transform };
      } else if (previewDrag && previewDrag.id === imgData.id) {
        effectiveImgData = { ...imgData, x: previewDrag.position.x, y: previewDrag.position.y };
      }
    }
    
    const imageUrl = `/api/images/${imgData.imageId}`;
    let image = this.imageCache.get(imageUrl);

    if (!image) {
      image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;
      this.imageCache.set(imageUrl, image);

      image.onload = () => {
        // Image loaded successfully - silent
        this.scheduleRender();
      };
      
      image.onerror = () => {
        // Remove broken image to prevent repeated errors
        this.store.deleteImage(imgData.id);
        return;
      };

      if (!image.complete) return;
    }

    // Check for broken image
    if (!image.naturalWidth || !image.naturalHeight) {
      this.store.deleteImage(imgData.id);
      return;
    }

    ctx.save();
    ctx.translate(effectiveImgData.x, effectiveImgData.y);
    ctx.rotate((effectiveImgData.rotation * Math.PI) / 180);

    // Draw image centered
    ctx.drawImage(image, -effectiveImgData.width / 2, -effectiveImgData.height / 2, effectiveImgData.width, effectiveImgData.height);

    ctx.restore();

    // Draw selection handles (only for individual images in single selection mode)
    const selectedIds = this.selectedImages();
    if (selectedIds.length === 1 && selectedIds.includes(imgData.id)) {
      this.renderImageHandles(ctx, effectiveImgData);
    } else if (this.selectedImageId === imgData.id && selectedIds.length === 0) {
      this.renderImageHandles(ctx, effectiveImgData);
    }
  }

  private renderImageHandles(ctx: CanvasRenderingContext2D, imgData: MapImage): void {
    ctx.save();
    ctx.translate(imgData.x, imgData.y);
    ctx.rotate((imgData.rotation * Math.PI) / 180);

    const hw = imgData.width / 2;
    const hh = imgData.height / 2;
    const handleSize = 10 / this.scale;

    // Selection border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 / this.scale;
    ctx.setLineDash([8 / this.scale, 4 / this.scale]);
    ctx.strokeRect(-hw, -hh, imgData.width, imgData.height);
    ctx.setLineDash([]);

    // Corner handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 / this.scale;

    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
    ];

    for (const c of corners) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }

    // Rotation handle
    const rotY = -hh - 25 / this.scale;
    const rotR = 6 / this.scale;

    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(0, rotY);
    ctx.strokeStyle = '#3b82f6';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, rotY, rotR, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  private renderGroupBoundingBox(ctx: CanvasRenderingContext2D, imageIds: string[]): void {
    // Calculate bounding box with potential preview transforms applied
    const box = this.calculateGroupBoundingBox(imageIds);
    if (!box) return;

    const handleSize = 10 / this.scale;

    // Selection border (dotted)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3 / this.scale;
    ctx.setLineDash([12 / this.scale, 6 / this.scale]);
    ctx.strokeRect(box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY);
    ctx.setLineDash([]);

    // Corner handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 / this.scale;

    const corners = [
      { x: box.minX, y: box.minY },
      { x: box.maxX, y: box.minY },
      { x: box.maxX, y: box.maxY },
      { x: box.minX, y: box.maxY },
    ];

    for (const c of corners) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }

    // Edge handles (midpoints)
    const edges = [
      { x: box.centerX, y: box.minY },
      { x: box.centerX, y: box.maxY },
      { x: box.minX, y: box.centerY },
      { x: box.maxX, y: box.centerY },
    ];

    for (const e of edges) {
      ctx.fillRect(e.x - handleSize / 2, e.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(e.x - handleSize / 2, e.y - handleSize / 2, handleSize, handleSize);
    }

    // Rotation handle (above the box)
    const rotY = box.minY - 25 / this.scale;
    const rotR = 6 / this.scale;

    ctx.beginPath();
    ctx.moveTo(box.centerX, box.minY);
    ctx.lineTo(box.centerX, rotY);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2 / this.scale;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(box.centerX, rotY, rotR, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 / this.scale;
    ctx.stroke();
  }

  private renderStrokes(): void {
    if (!this.drawCtx || !this.map) return;

    const canvas = this.drawCanvas.nativeElement;
    const ctx = this.drawCtx;
    const dpr = window.devicePixelRatio || 1;

    // Clear draw canvas (normal strokes only)
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    for (const stroke of this.map.strokes || []) {
      if (stroke.points.length < 2) continue;

      ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Render current in-progress stroke for live preview
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      const isEraser = this.isEraserMode;
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(this.currentStrokePoints[0].x, this.currentStrokePoints[0].y);

      for (let i = 1; i < this.currentStrokePoints.length; i++) {
        ctx.lineTo(this.currentStrokePoints[i].x, this.currentStrokePoints[i].y);
      }

      ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : this.brushColor;
      ctx.lineWidth = isEraser ? this.eraserBrushSize : this.penBrushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  private async renderTextureStrokes(): Promise<void> {
    if (!this.textureCtx || !this.map) return;

    const canvas = this.textureCanvas.nativeElement;
    const ctx = this.textureCtx;
    const dpr = window.devicePixelRatio || 1;

    // Clear texture canvas
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible tile range
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(canvas.width / dpr, canvas.height / dpr);

    const minTileX = Math.floor(topLeft.x / this.textureTileSize);
    const maxTileX = Math.ceil(bottomRight.x / this.textureTileSize);
    const minTileY = Math.floor(topLeft.y / this.textureTileSize);
    const maxTileY = Math.ceil(bottomRight.y / this.textureTileSize);

    // CRITICAL: Disable image smoothing for crisp texture rendering
    // Image smoothing causes blurriness - textures should be pixel-perfect
    ctx.imageSmoothingEnabled = false;

    // Render only visible tiles with 1px overlap to eliminate seams
    for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
      for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
        const tileKey = `${tileX},${tileY}`;
        const tile = this.textureTiles.get(tileKey);
        
        if (tile) {
          const worldX = tileX * this.textureTileSize;
          const worldY = tileY * this.textureTileSize;
          
          // Draw with slight overlap on all edges to eliminate seams
          ctx.drawImage(
            tile,
            0, 0, this.textureTileSize, this.textureTileSize, // Source
            worldX - 0.5, worldY - 0.5, this.textureTileSize + 1, this.textureTileSize + 1 // Dest with overlap
          );
        }
      }
    }

    // Render current in-progress stroke from stroke canvas
    // strokeCanvasOrigin = what world position canvas (0,0) represents (updated when canvas resizes)
    if ((this.isDrawingTexture || this.isErasingTexture) && this.strokeCanvas) {
      ctx.drawImage(
        this.strokeCanvas,
        this.strokeCanvasOrigin.x,
        this.strokeCanvasOrigin.y
      );
    }

    ctx.restore();
  }

  // ============================================
  // Tile-Based Texture System
  // ============================================

  private getTileKey(tileX: number, tileY: number): string {
    return `${tileX},${tileY}`;
  }

  private worldToTile(worldX: number, worldY: number): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(worldX / this.textureTileSize),
      tileY: Math.floor(worldY / this.textureTileSize)
    };
  }

  private getTileAtWorld(worldX: number, worldY: number): HTMLCanvasElement | null {
    const { tileX, tileY } = this.worldToTile(worldX, worldY);
    return this.textureTiles.get(this.getTileKey(tileX, tileY)) || null;
  }

  private getOrCreateTile(tileX: number, tileY: number): HTMLCanvasElement {
    const key = this.getTileKey(tileX, tileY);
    let tile = this.textureTiles.get(key);
    
    if (!tile) {
      tile = document.createElement('canvas');
      tile.width = this.textureTileSize;
      tile.height = this.textureTileSize;
      this.textureTiles.set(key, tile);
    }
    
    return tile;
  }

  private loadTextureTiles(): void {
    if (!this.map?.textureTiles) {
      // Clear tiles if map has no tiles
      this.textureTiles.clear();
      this.tileDataVersions.clear();
      this.dirtyTiles.clear();
      return;
    }

    // Track which tiles exist in new data
    const newTileKeys = new Set<string>();

    // Load tiles from saved data - only reload if imageId changed
    for (const tileData of this.map.textureTiles) {
      const key = this.getTileKey(tileData.x, tileData.y);
      newTileKeys.add(key);
      
      // CRITICAL: Skip tiles that are dirty or being saved (prevents overwriting local changes)
      if (this.dirtyTiles.has(key) || this.savingTiles.has(key)) {
        console.log('[Tiles] Skipping reload of', key, '(dirty or saving)');
        continue;
      }
      
      const existingVersion = this.tileDataVersions.get(key);
      
      // Skip reload if tile imageId hasn't changed (prevents flickering)
      if (existingVersion === tileData.imageId && this.textureTiles.has(key)) {
        continue;
      }
      
      // Update version tracking
      this.tileDataVersions.set(key, tileData.imageId);
      
      const tile = document.createElement('canvas');
      tile.width = this.textureTileSize;
      tile.height = this.textureTileSize;
      
      // Fetch tile from backend
      const imageUrl = this.imageService.getImageUrl(tileData.imageId);
      if (!imageUrl) {
        console.error('[Tiles] No URL for tile:', key, tileData.imageId);
        continue;
      }

      const img = new Image();
      img.onload = () => {
        // Double-check tile isn't now dirty (race condition protection)
        if (this.dirtyTiles.has(key) || this.savingTiles.has(key)) {
          console.log('[Tiles] Tile became dirty during load, discarding:', key);
          return;
        }
        
        const ctx = tile.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          this.textureTiles.set(key, tile);
          this.scheduleRender();
        }
      };
      img.onerror = () => {
        // Suppress console spam for old/missing tiles - just create empty tile
        this.textureTiles.set(key, tile);
      };
      img.src = imageUrl;
    }

    // Remove tiles that no longer exist (but preserve dirty/saving tiles)
    for (const key of this.textureTiles.keys()) {
      if (!newTileKeys.has(key) && !this.dirtyTiles.has(key) && !this.savingTiles.has(key)) {
        this.textureTiles.delete(key);
        this.tileDataVersions.delete(key);
      }
    }
  }

  private async saveDirtyTiles(): Promise<void> {
    if (this.dirtyTiles.size === 0 || !this.map) return;

    // Add dirty tiles to queue (avoiding duplicates) and mark as saving IMMEDIATELY
    for (const key of this.dirtyTiles) {
      if (!this.savingTiles.has(key) && !this.tileSaveQueue.includes(key)) {
        this.tileSaveQueue.push(key);
        // CRITICAL: Add to savingTiles NOW to prevent race condition
        // If we don't do this, loadTextureTiles can reload the tile between
        // clearing dirtyTiles and processTileSaveQueue adding it to savingTiles
        this.savingTiles.add(key);
      }
    }
    this.dirtyTiles.clear();

    // Start batch processing if not already running
    if (!this.isSavingBatch) {
      this.processTileSaveQueue();
    }
  }

  /**
   * Process tile save queue - uploads tiles to backend and stores imageIds.
   * OPTIMIZED: PNG with transparency support, batch sending to prevent race conditions
   */
  private async processTileSaveQueue(): Promise<void> {
    if (this.isSavingBatch || this.tileSaveQueue.length === 0) return;
    
    this.isSavingBatch = true;
    const totalToSave = this.tileSaveQueue.length;
    console.log(`[Texture] 💾 Uploading ${totalToSave} tiles...`);

    // Upload all tiles in parallel (fast), but send update ONCE at end (prevents race conditions)
    const uploadPromises = this.tileSaveQueue.map(async (key) => {
      this.savingTiles.add(key);
      const [x, y] = key.split(',').map(Number);
      const tile = this.textureTiles.get(key);
      
      if (!tile) {
        this.savingTiles.delete(key);
        return null;
      }
      
      try {
        // PNG required for transparency (eraser needs alpha channel)
        const dataUrl = tile.toDataURL('image/png');
        const imageId = await this.imageService.uploadImage(dataUrl);
        this.savingTiles.delete(key);
        this.tileDataVersions.set(key, imageId);
        console.log(`[Texture] ✅ Uploaded tile ${key}`);
        return { x, y, imageId, key };
      } catch (e) {
        console.error('[Tiles] Failed to upload tile:', key, e);
        this.savingTiles.delete(key);
        return null;
      }
    });

    // Clear queue immediately (tiles are now being uploaded)
    this.tileSaveQueue = [];

    // Wait for ALL uploads
    const results = await Promise.all(uploadPromises);
    const uploaded = results.filter(r => r !== null) as { x: number; y: number; imageId: string }[];

    // Send single update with all tiles
    if (uploaded.length > 0 && this.map) {
      const currentMap = this.map;
      const existingTiles = currentMap.textureTiles || [];
      const tileMap = new Map(existingTiles.map(t => [`${t.x},${t.y}`, t]));
      
      // Get active layer ID for new tiles (find first texture layer if not set)
      let activeLayerId = currentMap.activeLayerId;
      if (!activeLayerId && currentMap.layers && currentMap.layers.length > 0) {
        const textureLayer = currentMap.layers.find(l => l.type === 'texture');
        activeLayerId = textureLayer?.id;
      }
      
      for (const tile of uploaded) {
        tileMap.set(`${tile.x},${tile.y}`, { 
          x: tile.x, 
          y: tile.y, 
          imageId: tile.imageId,
          layerId: activeLayerId || undefined
        });
      }

      currentMap.textureTiles = Array.from(tileMap.values());
      this.store.updateMapTiles(currentMap.textureTiles);
      console.log(`[Texture] 📤 Synced ${uploaded.length}/${totalToSave} tiles`);
    }

    this.isSavingBatch = false;
  }

  /**
   * Schedule a debounced tile save to prevent overwhelming WebSocket.
   * Batches tile saves and sends after 2 seconds of inactivity.
   */
  private scheduleTileSave(): void {
    // Clear existing timeout
    if (this.tileSaveTimeout) {
      clearTimeout(this.tileSaveTimeout);
    }

    // Schedule new save after delay
    this.tileSaveTimeout = setTimeout(async () => {
      if (this.dirtyTiles.size > 0) {
        await this.saveDirtyTiles();
      }
      this.tileSaveTimeout = null;
    }, 10000); // 10 second debounce to prevent disconnects (increased from 5s)
  }

  private async renderLiveTexturePreview(ctx: CanvasRenderingContext2D): Promise<void> {
    if (!this.selectedTextureId || this.currentTexturePoints.length < 2) return;

    const textureUrl = this.getTextureUrl(this.selectedTextureId);
    if (!textureUrl) return;

    // Load texture
    const img = await this.loadImage(textureUrl);
    const scaledSize = img.width * this.textureScale;
    
    // Process texture with effects
    const processedTexture = this.processTexture(img, scaledSize);

    // Draw stroke segments
    for (let i = 0; i < this.currentTexturePoints.length - 1; i++) {
      const prevPoint = this.currentTexturePoints[i];
      const currentPoint = this.currentTexturePoints[i + 1];
      
      // Interpolate for smooth preview
      const dx = currentPoint.x - prevPoint.x;
      const dy = currentPoint.y - prevPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(distance / 5));
      
      for (let j = 0; j <= steps; j++) {
        const t = j / steps;
        const x = prevPoint.x + dx * t;
        const y = prevPoint.y + dy * t;
        
        if (this.textureBrushType === 'soft') {
          this.drawSoftBrush(ctx, processedTexture, x, y, scaledSize);
        } else {
          this.drawHardBrush(ctx, processedTexture, x, y, scaledSize);
        }
      }
    }
  }

  private async renderLiveEraserPreview(ctx: CanvasRenderingContext2D): Promise<void> {
    if (this.currentTexturePoints.length < 2) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';

    for (const point of this.currentTexturePoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.textureBrushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connect points
    if (this.currentTexturePoints.length > 1) {
      for (let i = 0; i < this.currentTexturePoints.length - 1; i++) {
        const p1 = this.currentTexturePoints[i];
        const p2 = this.currentTexturePoints[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        ctx.save();
        ctx.translate(p1.x, p1.y);
        ctx.rotate(angle);
        ctx.fillRect(0, -this.textureBrushSize / 2, distance, this.textureBrushSize);
        ctx.restore();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Initialize stroke canvas for single-pass drawing
   * Prevents texture accumulation/pulsing
   */
  private initStrokeCanvas(startPoint: Point): void {
    const radius = this.textureBrushSize / 2;
    this.strokeBounds = {
      minX: startPoint.x - radius,
      minY: startPoint.y - radius,
      maxX: startPoint.x + radius,
      maxY: startPoint.y + radius
    };
    
    // Canvas (0,0) will represent world (strokeBounds.min)
    this.strokeCanvasOrigin = {
      x: this.strokeBounds.minX,
      y: this.strokeBounds.minY
    };
    
    console.log('[Texture] Init stroke canvas:', {
      startPoint,
      origin: this.strokeCanvasOrigin,
      bounds: this.strokeBounds
    });
    
    // Reset last painted point for new stroke
    this.lastPaintedPoint = null;
    
    // Don't create canvas yet - we'll expand bounds as needed
    this.strokeCanvas = null;
    this.strokeCtx = null;
  }

  /**
   * Draw to stroke canvas (non-blocking, single-pass)
   * Pixels can only be modified once per stroke
   */
  private drawToStrokeCanvas(prevPoint: Point, currentPoint: Point): void {
    const radius = this.textureBrushSize / 2;
    
    // Store old canvas origin
    const oldCanvasOriginX = this.strokeCanvasOrigin.x;
    const oldCanvasOriginY = this.strokeCanvasOrigin.y;
    
    // Expand bounds (minX/minY can become less than canvas origin)
    this.strokeBounds.minX = Math.min(this.strokeBounds.minX, prevPoint.x - radius, currentPoint.x - radius);
    this.strokeBounds.minY = Math.min(this.strokeBounds.minY, prevPoint.y - radius, currentPoint.y - radius);
    this.strokeBounds.maxX = Math.max(this.strokeBounds.maxX, prevPoint.x + radius, currentPoint.x + radius);
    this.strokeBounds.maxY = Math.max(this.strokeBounds.maxY, prevPoint.y + radius, currentPoint.y + radius);
    
    // Check if we need to expand left/up (negative direction from current origin)
    const needsLeftExpand = this.strokeBounds.minX < this.strokeCanvasOrigin.x;
    const needsUpExpand = this.strokeBounds.minY < this.strokeCanvasOrigin.y;
    
    // Calculate required canvas size from CURRENT origin
    const canvasWidth = Math.ceil(this.strokeBounds.maxX - this.strokeCanvasOrigin.x);
    const canvasHeight = Math.ceil(this.strokeBounds.maxY - this.strokeCanvasOrigin.y);
    
    // Need resize if: expanding left/up OR canvas too small for right/down expansion
    const needsResize = needsLeftExpand || needsUpExpand || 
      !this.strokeCanvas || 
      this.strokeCanvas.width < canvasWidth || 
      this.strokeCanvas.height < canvasHeight;
    
    if (needsResize) {
      // Calculate new origin (only update when actually resizing)
      const newOriginX = needsLeftExpand ? this.strokeBounds.minX : this.strokeCanvasOrigin.x;
      const newOriginY = needsUpExpand ? this.strokeBounds.minY : this.strokeCanvasOrigin.y;
      
      // Recalculate dimensions with new origin
      const newWidth = Math.ceil(this.strokeBounds.maxX - newOriginX);
      const newHeight = Math.ceil(this.strokeBounds.maxY - newOriginY);
      
      const newCanvas = document.createElement('canvas');
      newCanvas.width = newWidth + 100; // Add padding for growth
      newCanvas.height = newHeight + 100;
      const newCtx = newCanvas.getContext('2d', { willReadFrequently: false })!;
      
      // Copy existing content with offset
      // Old canvas (0,0) was at world (oldCanvasOriginX, oldCanvasOriginY)
      // New canvas (0,0) is at world (newOriginX, newOriginY)
      if (this.strokeCanvas && this.strokeCtx) {
        const offsetX = oldCanvasOriginX - newOriginX;
        const offsetY = oldCanvasOriginY - newOriginY;
        newCtx.drawImage(this.strokeCanvas, offsetX, offsetY);
      }
      
      // Update origin ONLY when resizing (keeping it in sync with actual canvas content)
      this.strokeCanvasOrigin.x = newOriginX;
      this.strokeCanvasOrigin.y = newOriginY;
      
      this.strokeCanvas = newCanvas;
      this.strokeCtx = newCtx;
    }

    if (!this.strokeCtx) return;
    
    const ctx = this.strokeCtx;
    const scaledSize = this.cachedProcessedTexture?.width || 100;
    
    // Brush spacing: distance between stamps (% of brush size)
    // Smaller spacing = smoother but heavier, larger = faster but gaps
    const spacing = this.textureBrushSize * 0.25; // 25% of brush size
    
    // Use world coordinates for distance calculation
    const startPoint = this.lastPaintedPoint || prevPoint;
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only draw if we've moved enough distance
    if (distance < spacing && this.lastPaintedPoint !== null) {
      return; // Not enough movement to warrant new stamp
    }
    
    // Calculate how many stamps to place along the path
    const stamps = Math.max(1, Math.floor(distance / spacing));
    
    for (let i = 0; i <= stamps; i++) {
      const t = i / Math.max(1, stamps);
      const worldX = startPoint.x + dx * t;
      const worldY = startPoint.y + dy * t;
      
      // Convert to canvas coordinates (relative to strokeCanvasOrigin)
      const x = worldX - this.strokeCanvasOrigin.x;
      const y = worldY - this.strokeCanvasOrigin.y;
      
      if (this.isErasingTexture) {
        // Eraser mode
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      } else {
        // Texture drawing mode - pass both canvas and world coords for proper tiling
        // Skip this stamp if texture not yet loaded (but continue processing remaining stamps)
        if (!this.cachedProcessedTexture) {
          continue; // Skip this stamp, but don't abort the whole operation
        }
        if (this.textureBrushType === 'soft') {
          this.drawSoftBrushToCanvas(ctx, this.cachedProcessedTexture, x, y, worldX, worldY, scaledSize);
        } else {
          this.drawHardBrushToCanvas(ctx, this.cachedProcessedTexture, x, y, worldX, worldY, scaledSize);
        }
      }
    }
    
    // Update last painted point to current position
    this.lastPaintedPoint = { x: currentPoint.x, y: currentPoint.y };
  }

  /**
   * Cache processed texture to prevent lag during drawing
   */
  private async cacheProcessedTexture(): Promise<void> {
    if (!this.selectedTextureId) return;
    
    // Check if already cached
    if (this.cachedTextureId === this.selectedTextureId && this.cachedProcessedTexture) {
      return;
    }
    
    // Wait if another load is in progress for the same texture
    if (this.isLoadingTexture && this.cachedTextureId === this.selectedTextureId) {
      // Wait for the current load to complete
      while (this.isLoadingTexture) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return;
    }
    
    this.isLoadingTexture = true;
    const textureUrl = this.getTextureUrl(this.selectedTextureId);
    if (!textureUrl) {
      this.isLoadingTexture = false;
      return;
    }
    
    try {
      const img = await this.loadImage(textureUrl);
      const scaledSize = img.width * this.textureScale;
      this.cachedProcessedTexture = this.processTexture(img, scaledSize);
      this.cachedTextureId = this.selectedTextureId;
    } catch (e) {
      console.error('[Texture] Failed to cache texture:', e);
    } finally {
      this.isLoadingTexture = false;
    }
  }

  /**
   * Commit stroke canvas to tiles (single-pass)
   */
  private async commitStrokeToTiles(): Promise<void> {
    if (!this.strokeCanvas || !this.strokeCtx) return;
    
    const minTile = this.worldToTile(this.strokeBounds.minX, this.strokeBounds.minY);
    const maxTile = this.worldToTile(this.strokeBounds.maxX, this.strokeBounds.maxY);
    
    console.log('[Texture] Committing stroke to tiles:', {
      strokeOrigin: this.strokeCanvasOrigin,
      strokeBounds: this.strokeBounds,
      canvasSize: { w: this.strokeCanvas.width, h: this.strokeCanvas.height },
      tileRange: { minTile, maxTile }
    });
    
    // Copy stroke canvas to affected tiles
    for (let tileY = minTile.tileY; tileY <= maxTile.tileY; tileY++) {
      for (let tileX = minTile.tileX; tileX <= maxTile.tileX; tileX++) {
        const tile = this.getOrCreateTile(tileX, tileY);
        const ctx = tile.getContext('2d')!;
        const tileKey = this.getTileKey(tileX, tileY);
        
        // Mark tile as dirty
        this.dirtyTiles.add(tileKey);
        this.currentDrawingTiles.add(tileKey);
        
        // Calculate coordinates
        const tileWorldX = tileX * this.textureTileSize;
        const tileWorldY = tileY * this.textureTileSize;
        
        // Calculate source position in stroke canvas
        const srcX = tileWorldX - this.strokeCanvasOrigin.x;
        const srcY = tileWorldY - this.strokeCanvasOrigin.y;
        
        // Bounds check - skip if completely outside canvas
        if (srcX + this.textureTileSize < 0 || srcY + this.textureTileSize < 0 ||
            srcX >= this.strokeCanvas.width || srcY >= this.strokeCanvas.height) {
          console.warn('[Texture] Tile outside stroke canvas bounds, skipping:', tileKey);
          continue;
        }
        
        // Calculate actual copy region (handle partial overlaps)
        const copyX = Math.max(0, srcX);
        const copyY = Math.max(0, srcY);
        const copyW = Math.min(this.textureTileSize, this.strokeCanvas.width - srcX);
        const copyH = Math.min(this.textureTileSize, this.strokeCanvas.height - srcY);
        
        // Destination offset if source was clipped
        const destX = Math.max(0, -srcX);
        const destY = Math.max(0, -srcY);
        
        // Copy from stroke canvas to tile
        if (copyW > 0 && copyH > 0) {
          ctx.drawImage(
            this.strokeCanvas,
            copyX, copyY, copyW, copyH, // Source
            destX, destY, copyW, copyH  // Dest
          );
        }
      }
    }
    
    console.log('[Texture] Committed to', this.dirtyTiles.size, 'tiles');
    
    // Clear stroke canvas
    this.strokeCanvas = null;
    this.strokeCtx = null;
  }

  /**
   * Draw soft brush to canvas (for stroke canvas)
   * OPTIMIZED: Reuses temp canvas to prevent GC pressure
   */
  private drawSoftBrushToCanvas(
    ctx: CanvasRenderingContext2D,
    texture: HTMLCanvasElement,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
    scaledSize: number
  ): void {
    const radius = this.textureBrushSize / 2;
    const diameter = Math.ceil(radius * 2);
    
    // Reuse temp canvas if size matches, otherwise create/resize
    if (!this.softBrushTempCanvas || this.lastSoftBrushSize !== diameter) {
      this.softBrushTempCanvas = document.createElement('canvas');
      this.softBrushTempCanvas.width = diameter;
      this.softBrushTempCanvas.height = diameter;
      this.softBrushTempCtx = this.softBrushTempCanvas.getContext('2d')!;
      this.lastSoftBrushSize = diameter;
    }
    
    const tempCtx = this.softBrushTempCtx!;
    
    // Clear previous content
    tempCtx.clearRect(0, 0, diameter, diameter);
    
    // Draw texture pattern aligned to world coordinates for proper tiling
    const pattern = tempCtx.createPattern(texture, 'repeat')!;
    tempCtx.fillStyle = pattern;
    // Use world coordinates for UV calculation to maintain consistent tiling
    const offset = Math.floor(worldX % scaledSize);
    const offsetY = Math.floor(worldY % scaledSize);
    tempCtx.save();
    tempCtx.translate(-offset, -offsetY);
    tempCtx.fillRect(offset, offsetY, diameter, diameter);
    tempCtx.restore();
    
    // Apply radial gradient mask
    tempCtx.globalCompositeOperation = 'destination-in';
    const gradient = tempCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, `rgba(0,0,0,${this.textureBrushStrength})`);
    gradient.addColorStop(0.7, `rgba(0,0,0,${this.textureBrushStrength * 0.5})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, diameter, diameter);
    tempCtx.globalCompositeOperation = 'source-over';
    
    // Draw to canvas
    ctx.drawImage(this.softBrushTempCanvas, x - radius, y - radius);
  }

  /**
   * Draw hard brush to canvas (for stroke canvas)
   */
  private drawHardBrushToCanvas(
    ctx: CanvasRenderingContext2D,
    texture: HTMLCanvasElement,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
    scaledSize: number
  ): void {
    const radius = this.textureBrushSize / 2;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    
    ctx.globalAlpha = this.textureBrushStrength;
    const pattern = ctx.createPattern(texture, 'repeat')!;
    ctx.fillStyle = pattern;
    // Use world coordinates for UV calculation to maintain consistent tiling
    const offset = Math.floor(worldX % scaledSize);
    const offsetY = Math.floor(worldY % scaledSize);
    // Position pattern based on canvas coords but aligned to world grid
    ctx.translate(x - (worldX - Math.floor(worldX / scaledSize) * scaledSize), y - (worldY - Math.floor(worldY / scaledSize) * scaledSize));
    ctx.fillRect(-radius, -radius, radius * 2 + scaledSize, radius * 2 + scaledSize);
    
    ctx.restore();
  }

  // Old tile-based drawing (now unused, kept for reference)
  /**
   * Draw texture between two points directly to tiles
   * Implements soft brush/airbrush for better blending
   */
  private async drawTextureToTiles(prevPoint: Point, currentPoint: Point): Promise<void> {
    const radius = this.textureBrushSize / 2;
    
    // Calculate which tiles are affected by this stroke segment
    const minX = Math.min(prevPoint.x, currentPoint.x) - radius;
    const maxX = Math.max(prevPoint.x, currentPoint.x) + radius;
    const minY = Math.min(prevPoint.y, currentPoint.y) - radius;
    const maxY = Math.max(prevPoint.y, currentPoint.y) + radius;
    
    const minTile = this.worldToTile(minX, minY);
    const maxTile = this.worldToTile(maxX, maxY);
    
    // Process each affected tile
    for (let tileY = minTile.tileY; tileY <= maxTile.tileY; tileY++) {
      for (let tileX = minTile.tileX; tileX <= maxTile.tileX; tileX++) {
        const tile = this.getOrCreateTile(tileX, tileY);
        const ctx = tile.getContext('2d')!;
        const tileKey = this.getTileKey(tileX, tileY);
        
        // Mark tile as dirty for later save
        this.dirtyTiles.add(tileKey);
        this.currentDrawingTiles.add(tileKey);
        
        // Calculate tile-local coordinates
        const tileWorldX = tileX * this.textureTileSize;
        const tileWorldY = tileY * this.textureTileSize;
        
        // Draw depending on mode
        if (this.isErasingTexture) {
          // Eraser mode
          this.drawEraserToTile(ctx, prevPoint, currentPoint, tileWorldX, tileWorldY);
        } else {
          // Texture drawing mode
          await this.drawTextureToTile(ctx, prevPoint, currentPoint, tileWorldX, tileWorldY);
        }
      }
    }
  }

  /**
   * Draw eraser stroke segment to a single tile
   */
  private drawEraserToTile(
    ctx: CanvasRenderingContext2D,
    prevPoint: Point,
    currentPoint: Point,
    tileWorldX: number,
    tileWorldY: number
  ): void {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    
    // Convert to tile-local coordinates
    const prevLocal = { x: prevPoint.x - tileWorldX, y: prevPoint.y - tileWorldY };
    const currentLocal = { x: currentPoint.x - tileWorldX, y: currentPoint.y - tileWorldY };
    
    // Draw circle at current point
    ctx.beginPath();
    ctx.arc(currentLocal.x, currentLocal.y, this.textureBrushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Connect previous point to current point
    const dx = currentLocal.x - prevLocal.x;
    const dy = currentLocal.y - prevLocal.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const angle = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(prevLocal.x, prevLocal.y);
      ctx.rotate(angle);
      ctx.fillRect(0, -this.textureBrushSize / 2, distance, this.textureBrushSize);
      ctx.restore();
    }
    
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Draw textured brush stroke segment to a single tile
   * Supports soft brush with alpha gradient for better blending
   */
  private async drawTextureToTile(
    ctx: CanvasRenderingContext2D,
    prevPoint: Point,
    currentPoint: Point,
    tileWorldX: number,
    tileWorldY: number
  ): Promise<void> {
    if (!this.selectedTextureId) return;
    
    const textureUrl = this.getTextureUrl(this.selectedTextureId);
    if (!textureUrl) return;
    
    // Load texture image
    const img = await this.loadImage(textureUrl);
    const scaledSize = img.width * this.textureScale;
    
    // Apply hue shift and color blend
    const processedTexture = this.processTexture(img, scaledSize);
    
    // Convert to tile-local coordinates
    const prevLocal = { x: prevPoint.x - tileWorldX, y: prevPoint.y - tileWorldY };
    const currentLocal = { x: currentPoint.x - tileWorldX, y: currentPoint.y - tileWorldY };
    
    // Interpolate points for smooth brush
    const dx = currentLocal.x - prevLocal.x;
    const dy = currentLocal.y - prevLocal.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(distance / 5)); // Paint every 5 pixels
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = prevLocal.x + dx * t;
      const y = prevLocal.y + dy * t;
      
      if (this.textureBrushType === 'soft') {
        // Soft brush with radial gradient for better blending
        this.drawSoftBrush(ctx, processedTexture, x, y, scaledSize);
      } else {
        // Hard brush
        this.drawHardBrush(ctx, processedTexture, x, y, scaledSize);
      }
    }
  }

  /**
   * Draw soft brush with alpha gradient - "better airbrush for blending"
   * 100% opacity in center, fading to 0% at edges
   */
  private drawSoftBrush(
    ctx: CanvasRenderingContext2D,
    texture: HTMLCanvasElement,
    x: number,
    y: number,
    scaledSize: number
  ): void {
    const radius = this.textureBrushSize / 2;
    
    // Create temporary canvas for gradient mask
    const tempCanvas = document.createElement('canvas');
    const diameter = Math.ceil(radius * 2);
    tempCanvas.width = diameter;
    tempCanvas.height = diameter;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Draw texture pattern
    const pattern = tempCtx.createPattern(texture, 'repeat')!;
    tempCtx.fillStyle = pattern;
    const offset = Math.floor(x % scaledSize);
    const offsetY = Math.floor(y % scaledSize);
    tempCtx.translate(-offset, -offsetY);
    tempCtx.fillRect(offset, offsetY, diameter, diameter);
    tempCtx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Apply radial gradient mask - 100% center to 0% edge
    tempCtx.globalCompositeOperation = 'destination-in';
    const gradient = tempCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, `rgba(0,0,0,${this.textureBrushStrength})`); // 100% in center (scaled by strength)
    gradient.addColorStop(0.7, `rgba(0,0,0,${this.textureBrushStrength * 0.5})`); // 50% at 70%
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); // 0% at edge
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, diameter, diameter);
    
    // Draw masked texture to main canvas
    ctx.drawImage(tempCanvas, x - radius, y - radius);
  }

  /**
   * Draw hard brush with sharp edges
   */
  private drawHardBrush(
    ctx: CanvasRenderingContext2D,
    texture: HTMLCanvasElement,
    x: number,
    y: number,
    scaledSize: number
  ): void {
    const radius = this.textureBrushSize / 2;
    
    ctx.save();
    
    // Circular clip
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Apply brush strength
    ctx.globalAlpha = this.textureBrushStrength;
    
    // Draw texture pattern
    const pattern = ctx.createPattern(texture, 'repeat')!;
    ctx.fillStyle = pattern;
    const offset = Math.floor(x % scaledSize);
    const offsetY = Math.floor(y % scaledSize);
    ctx.translate(x - offset, y - offsetY);
    ctx.fillRect(-radius, -radius, radius * 2 + scaledSize, radius * 2 + scaledSize);
    
    ctx.restore();
  }

  /**
   * Process texture: apply hue shift and color blend
   */
  private processTexture(img: HTMLImageElement, scaledSize: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = scaledSize;
    canvas.height = scaledSize;
    const ctx = canvas.getContext('2d')!;
    
    // Draw scaled texture
    ctx.drawImage(img, 0, 0, scaledSize, scaledSize);
    
    // Apply hue shift if needed
    if (this.textureHue !== 0) {
      const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to HSL
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const l = (max + min) / 2;
        
        let h = 0;
        let s = 0;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          if (max === r / 255) h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
          else if (max === g / 255) h = ((b / 255 - r / 255) / d + 2) / 6;
          else h = ((r / 255 - g / 255) / d + 4) / 6;
        }
        
        // Apply hue shift
        h = (h + this.textureHue / 360) % 1;
        
        // Convert back to RGB
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        
        let nr, ng, nb;
        if (s === 0) {
          nr = ng = nb = l;
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          nr = hue2rgb(p, q, h + 1/3);
          ng = hue2rgb(p, q, h);
          nb = hue2rgb(p, q, h - 1/3);
        }
        
        data[i] = nr * 255;
        data[i + 1] = ng * 255;
        data[i + 2] = nb * 255;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Apply color blend if needed  
    if (this.textureColorBlend > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = this.textureColorBlend / 100;
      ctx.fillStyle = this.textureBlendColor;
      ctx.fillRect(0, 0, scaledSize, scaledSize);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    
    return canvas;
  }

  // Note: scheduleCacheRebuild(), rebuildTextureCache(), and addStrokeToCache() methods
  // were removed in favor of the tile-based texture rendering system.

  private async renderSingleTextureStroke(
    ctx: CanvasRenderingContext2D, 
    points: Point[], 
    textureId: string, 
    brushSize: number,
    textureScale: number = 0.1,
    isEraser: boolean = false,
    brushType: 'hard' | 'soft' = 'hard',
    colorBlend: number = 0,
    blendColor: string = '#ffffff',
    hueShift: number = 0
  ): Promise<void> {
    if (points.length < 2) return;

    // For eraser mode, use destination-out composite
    ctx.save();
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)'; // Full opacity eraser
      
      // Hard edge for eraser
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        ctx.moveTo(point.x + brushSize / 2, point.y);
        ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
      }
      
      // Connect points
      if (points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          ctx.save();
          ctx.translate(p1.x, p1.y);
          ctx.rotate(angle);
          ctx.rect(0, -brushSize / 2, distance, brushSize);
          ctx.restore();
        }
      }
      
      ctx.fill();
      ctx.restore();
      return;
    }

    // Non-eraser texture rendering
    ctx.globalCompositeOperation = 'source-over';

    // Load texture image
    let textureImg = this.textureCache.get(textureId);
    
    if (!textureImg) {
      const textureUrl = this.textureService.getTextureUrl(textureId);
      if (!textureUrl) {
        ctx.restore();
        return;
      }

      textureImg = new Image();
      textureImg.src = textureUrl;
      
      if (!textureImg.complete) {
        await new Promise<void>((resolve, reject) => {
          textureImg!.onload = () => resolve();
          textureImg!.onerror = () => reject();
        }).catch(() => {
          console.error('Failed to load texture:', textureId);
          ctx.restore();
          return;
        });
      }
      
      this.textureCache.set(textureId, textureImg);
    }

    // Create pattern canvas with effects applied
    const patternCanvas = document.createElement('canvas');
    const scaledWidth = textureImg.width * textureScale;
    const scaledHeight = textureImg.height * textureScale;
    patternCanvas.width = scaledWidth;
    patternCanvas.height = scaledHeight;
    const patternCtx = patternCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!patternCtx) {
      ctx.restore();
      return;
    }

    // Draw scaled texture
    patternCtx.drawImage(textureImg, 0, 0, scaledWidth, scaledHeight);

    // Apply hue shift if needed
    if (hueShift !== 0) {
      const imageData = patternCtx.getImageData(0, 0, scaledWidth, scaledHeight);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to HSL
        const [h, s, l] = this.rgbToHsl(r, g, b);
        
        // Shift hue
        const newH = (h + hueShift / 360) % 1;
        
        // Convert back to RGB
        const [newR, newG, newB] = this.hslToRgb(newH, s, l);
        
        data[i] = newR;
        data[i + 1] = newG;
        data[i + 2] = newB;
      }
      
      patternCtx.putImageData(imageData, 0, 0);
    }

    // Apply color blend if needed
    if (colorBlend > 0) {
      patternCtx.globalCompositeOperation = 'source-atop';
      patternCtx.globalAlpha = colorBlend / 100;
      patternCtx.fillStyle = blendColor;
      patternCtx.fillRect(0, 0, scaledWidth, scaledHeight);
      patternCtx.globalCompositeOperation = 'source-over';
      patternCtx.globalAlpha = 1;
    }

    // Create pattern
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (!pattern) {
      ctx.restore();
      return;
    }

    // Calculate stroke bounds
    const minX = Math.min(...points.map(p => p.x)) - brushSize;
    const minY = Math.min(...points.map(p => p.y)) - brushSize;
    const maxX = Math.max(...points.map(p => p.x)) + brushSize;
    const maxY = Math.max(...points.map(p => p.y)) + brushSize;

    if (brushType === 'soft') {
      // Soft brush: use radial gradients for each point
      ctx.fillStyle = pattern;
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
        ctx.clip();
        
        // Create radial gradient mask
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, brushSize / 2);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(0.7, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.15; // Build up gradually for soft effect
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
        ctx.restore();
      }
      
      // Connect points with soft rectangles
      if (points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          ctx.save();
          ctx.translate(p1.x, p1.y);
          ctx.rotate(angle);
          ctx.globalAlpha = 0.15;
          ctx.fillRect(0, -brushSize / 2, distance, brushSize);
          ctx.restore();
        }
      }
    } else {
      // Hard brush: use clipping path
      ctx.beginPath();
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        ctx.moveTo(point.x + brushSize / 2, point.y);
        ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
      }
      
      // Connect consecutive points
      if (points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          ctx.save();
          ctx.translate(p1.x, p1.y);
          ctx.rotate(angle);
          ctx.rect(0, -brushSize / 2, distance, brushSize);
          ctx.restore();
        }
      }
      
      ctx.clip();
      ctx.fillStyle = pattern;
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    }

    ctx.restore();
  }

  // Helper functions for HSL conversion
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return [h, s, l];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Get texture URL by ID
   */
  getTextureUrl(textureId: string): string | null {
    return this.textureService.getTextureUrl(textureId);
  }

  /**
   * Load image from URL and return promise
   */
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  // ============================================
  // Texture Palette Management
  // ============================================

  private loadPalette(): void {
    try {
      const saved = localStorage.getItem(this.PALETTE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.texturePalette.set(parsed);
        console.log('[Palette] Loaded', parsed.filter((e: any) => e !== null).length, 'entries');
        
        // Regenerate previews for all entries
        parsed.forEach(async (entry: TexturePaletteEntry | null, index: number) => {
          if (entry) {
            const previewUrl = await this.generateTexturePreview(entry);
            if (previewUrl) {
              const palette = [...this.texturePalette()];
              palette[index] = { ...entry, previewUrl };
              this.texturePalette.set(palette);
              this.cdr.markForCheck();
            }
          }
        });
      }
    } catch (e) {
      console.error('[Palette] Failed to load:', e);
    }
  }

  private savePalette(): void {
    try {
      localStorage.setItem(this.PALETTE_STORAGE_KEY, JSON.stringify(this.texturePalette()));
      console.log('[Palette] Saved', this.texturePalette().filter(e => e !== null).length, 'entries');
    } catch (e) {
      console.error('[Palette] Failed to save:', e);
    }
  }

  /**
   * Prevent palette slot mousedown from triggering texture drawing
   */
  onPaletteSlotMouseDown(event: MouseEvent): void {
    event.stopPropagation();
  }

  onPaletteSlotClick(index: number): void {
    const entry = this.texturePalette()[index];
    if (!entry) return;

    // CRITICAL: Set flag to prevent ngOnChanges from updating the palette
    // This prevents the circular logic: click slot → emit → ngOnChanges → update wrong slot
    this.isLoadingFromPalette = true;

    // Apply all settings locally AND emit changes to parent
    this.selectedTextureId = entry.textureId;
    this.textureBrushStrength = entry.brushStrength;
    this.textureBrushType = entry.brushType;
    this.textureScale = entry.textureScale;
    this.textureHue = entry.textureHue;
    this.textureColorBlend = entry.textureColorBlend;
    this.textureBlendColor = entry.textureBlendColor;
    this.textureLayer = entry.layer;

    // Set current palette slot (for tracking changes)
    this.currentPaletteSlot.set(index);

    // Emit to parent component (but NOT selectedTextureIdChange to avoid sidebar selection)
    this.textureBrushStrengthChange.emit(entry.brushStrength);
    this.textureBrushTypeChange.emit(entry.brushType);
    this.textureScaleChange.emit(entry.textureScale);
    this.textureHueChange.emit(entry.textureHue);
    this.textureColorBlendChange.emit(entry.textureColorBlend);
    this.textureBlendColorChange.emit(entry.textureBlendColor);
    this.textureLayerChange.emit(entry.layer);

    // Clear flag after a microtask (after ngOnChanges completes)
    setTimeout(() => {
      this.isLoadingFromPalette = false;
    }, 0);

    // Auto-switch to texture tool
    this.toolAutoSelect.emit('texture');
    this.cdr.markForCheck();
    console.log('[Palette] Applied slot', index, entry.name);
  }

  onPaletteSlotRightClick(event: MouseEvent, index: number): void {
    event.preventDefault();
    const palette = [...this.texturePalette()];
    palette[index] = null;
    this.texturePalette.set(palette);
    this.savePalette();
    console.log('[Palette] Cleared slot', index);
  }

  onPaletteSlotDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    const textureId = event.dataTransfer?.getData('textureId');
    const textureName = event.dataTransfer?.getData('textureName');
    
    if (!textureId || !textureName) return;

    // Save current brush settings to palette (NO brushSize)
    const entry: TexturePaletteEntry = {
      textureId,
      name: textureName,
      brushStrength: this.textureBrushStrength,
      brushType: this.textureBrushType,
      textureScale: this.textureScale,
      textureHue: this.textureHue,
      textureColorBlend: this.textureColorBlend,
      textureBlendColor: this.textureBlendColor,
      layer: this.textureLayer,
    };

    // CRITICAL: Set current palette slot so adjustments will update this slot
    this.currentPaletteSlot.set(index);
    console.log('[Palette] Set active slot to', index, '- future adjustments will update this slot');

    // Generate colored preview immediately
    this.generateTexturePreview(entry).then(previewUrl => {
      entry.previewUrl = previewUrl;
      const palette = [...this.texturePalette()];
      palette[index] = entry;
      this.texturePalette.set(palette);
      this.savePalette();
      this.cdr.markForCheck();
      console.log('[Palette] Saved to slot', index, entry.name, 'with preview');
    }).catch(err => {
      console.error('[Palette] Preview generation failed:', err);
      // Still save the entry even if preview fails
      const palette = [...this.texturePalette()];
      palette[index] = entry;
      this.texturePalette.set(palette);
      this.savePalette();
      this.cdr.markForCheck();
    });
  }

  onPaletteSlotDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  /**
   * Update the preview for a specific palette slot with current settings
   */
  async updateCurrentPalettePreview(index: number): Promise<void> {
    const palette = this.texturePalette();
    const entry = palette[index];
    if (!entry) return;

    // Create updated entry with current settings
    const updatedEntry: TexturePaletteEntry = {
      ...entry,
      brushStrength: this.textureBrushStrength,
      brushType: this.textureBrushType,
      textureScale: this.textureScale,
      textureHue: this.textureHue,
      textureColorBlend: this.textureColorBlend,
      textureBlendColor: this.textureBlendColor,
      layer: this.textureLayer,
    };

    // Regenerate preview
    try {
      const previewUrl = await this.generateTexturePreview(updatedEntry);
      updatedEntry.previewUrl = previewUrl;
      const newPalette = [...palette];
      newPalette[index] = updatedEntry;
      this.texturePalette.set(newPalette);
      this.savePalette();
      this.cdr.markForCheck();
      console.log('[Palette] Updated slot', index, 'with new preview');
    } catch (err) {
      console.error('[Palette] Preview update failed:', err);
    }
  }

  /**
   * Update the current active palette slot with new settings and regenerate preview
   */
  private async updateCurrentPaletteSlot(
    slotIndex: number, 
    hue: number, 
    blend: number, 
    scale: number, 
    blendColor: string,
    brushStrength?: number,
    brushType?: 'hard' | 'soft'
  ): Promise<void> {
    const palette = [...this.texturePalette()];
    const entry = palette[slotIndex];
    if (!entry) {
      console.warn('[Palette] Cannot update slot', slotIndex, '- slot is empty');
      return;
    }

    console.log('[Palette] Updating slot', slotIndex, 'with new settings:', {
      hue, blend, scale, brushStrength, brushType
    });

    // Update all settings
    entry.textureHue = hue;
    entry.textureColorBlend = blend;
    entry.textureScale = scale;
    entry.textureBlendColor = blendColor;
    if (brushStrength !== undefined) entry.brushStrength = brushStrength;
    if (brushType !== undefined) entry.brushType = brushType;

    // Regenerate preview with new settings
    try {
      entry.previewUrl = await this.generateTexturePreview(entry);
      palette[slotIndex] = entry;
      this.texturePalette.set(palette);
      this.savePalette();
      console.log('[Palette] Updated slot', slotIndex, 'with new settings');
    } catch (err) {
      console.error('[Palette] Failed to update preview:', err);
    }
  }

  /**
   * Generate a colored preview of a texture with effects applied
   */
  private async generateTexturePreview(entry: TexturePaletteEntry): Promise<string> {
    const textureUrl = this.getTextureUrl(entry.textureId);
    if (!textureUrl) return '';

    try {
      const img = await this.loadImage(textureUrl);
      const size = 48; // Preview size
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      // Draw texture scaled to preview size
      ctx.drawImage(img, 0, 0, size, size);

      // Apply hue shift if needed
      if (entry.textureHue !== 0) {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        const hueShift = entry.textureHue;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Convert RGB to HSL
          const max = Math.max(r, g, b) / 255;
          const min = Math.min(r, g, b) / 255;
          const l = (max + min) / 2;
          let h = 0;
          let s = 0;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            if (max === r / 255) h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g / 255) h = ((b / 255 - r / 255) / d + 2) / 6;
            else h = ((r / 255 - g / 255) / d + 4) / 6;
          }

          // Shift hue
          h = (h + hueShift / 360 + 1) % 1;

          // Convert back to RGB
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };

          if (s === 0) {
            data[i] = data[i + 1] = data[i + 2] = l * 255;
          } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            data[i] = hue2rgb(p, q, h + 1/3) * 255;
            data[i + 1] = hue2rgb(p, q, h) * 255;
            data[i + 2] = hue2rgb(p, q, h - 1/3) * 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      // Apply color blend if needed
      if (entry.textureColorBlend > 0) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.globalAlpha = entry.textureColorBlend / 100;
        ctx.fillStyle = entry.textureBlendColor;
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      return canvas.toDataURL();
    } catch (error) {
      console.error('[Palette] Failed to generate preview:', error);
      return '';
    }
  }

  private renderOverlay(): void {
    if (!this.overlayCtx) return;

    const canvas = this.overlayCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = this.overlayCtx;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    this.renderMeasurement(ctx);
    this.renderDragPath(ctx);
    this.renderSelectionBox(ctx);
    this.renderBrushSizeCircle(ctx);
  }

  private renderMeasurement(ctx: CanvasRenderingContext2D): void {
    const start = this.measureStart();
    const end = this.measureEnd();
    if (!start || !end) return;

    const startScreen = this.worldToScreen(start.x, start.y);
    const endScreen = this.worldToScreen(end.x, end.y);

    // Draw line with glow effect
    ctx.save();
    
    // Glow layer (draw first, underneath)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.lineTo(endScreen.x, endScreen.y);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    
    // Solid line (draw second, on top)
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.lineTo(endScreen.x, endScreen.y);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();

    // Endpoints with glow
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#fbbf24';
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(startScreen.x, startScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endScreen.x, endScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Distance label
    const midX = (startScreen.x + endScreen.x) / 2;
    const midY = (startScreen.y + endScreen.y) / 2;
    const distance = this.measureDistance();

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${distance.toFixed(1)}m`, midX, midY - 5);
  }

  private renderDragPath(ctx: CanvasRenderingContext2D): void {
    const path = this.dragPath();
    if (path.length < 2) return;

    // Red if exceeds speed OR blocked by walls, green otherwise
    ctx.strokeStyle = (this.dragPathExceedsSpeed() || this.dragPathIsBlocked()) ? '#ef4444' : '#22c55e';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i < path.length - 1; i++) {
      const start = HexMath.hexToPixel(path[i]);
      const end = HexMath.hexToPixel(path[i + 1]);
      const startScreen = this.worldToScreen(start.x, start.y);
      const endScreen = this.worldToScreen(end.x, end.y);

      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(endScreen.x, endScreen.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Draw waypoint markers
    const waypoints = this.dragWaypoints();
    ctx.fillStyle = '#3b82f6';
    for (const wp of waypoints) {
      const center = HexMath.hexToPixel(wp);
      const screen = this.worldToScreen(center.x, center.y);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderSelectionBox(ctx: CanvasRenderingContext2D): void {
    const box = this.selectionBox();
    if (!box) return;

    const startScreen = this.worldToScreen(box.start.x, box.start.y);
    const endScreen = this.worldToScreen(box.end.x, box.end.y);

    const x = Math.min(startScreen.x, endScreen.x);
    const y = Math.min(startScreen.y, endScreen.y);
    const width = Math.abs(endScreen.x - startScreen.x);
    const height = Math.abs(endScreen.y - startScreen.y);

    // Selection box fill
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(x, y, width, height);

    // Selection box border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  }

  private renderBrushSizeCircle(ctx: CanvasRenderingContext2D): void {
    const circle = this.brushSizeCircle();
    if (!circle) return;

    const screen = this.worldToScreen(circle.pos.x, circle.pos.y);
    const radius = circle.size / 2;

    // Circle outline
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Size label
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${circle.size}px`, screen.x, screen.y);
  }

  // ============================================
  // Mouse Event Handlers
  // ============================================

  onMouseDown(event: MouseEvent): void {
    if (event.button === 1) {
      // Middle mouse - zoom if CTRL, otherwise pan
      event.preventDefault();
      if (event.ctrlKey) {
        this.isZooming = true;
        // Store zoom start point (screen coordinates)
        const rect = this.container.nativeElement.getBoundingClientRect();
        this.zoomStartPoint = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      } else {
        this.isPanning = true;
      }
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      this.addDocumentListeners();
      return;
    }

    // Left-click closes context menu
    if (event.button === 0) {
      this.showContextMenu.set(false);
      this.contextMenuPosition.set({ x: 0, y: 0 });
      this.contextMenuImageId.set(null);
      this.contextMenuTokenId.set(null);
      this.addDocumentListeners(); // Track all mouse movements for transforms
    }

    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);

    switch (this.currentTool) {
      case 'cursor':
        this.handleCursorDown(event, world, hex);
        break;
      case 'draw':
      case 'erase':
        this.handleDrawDown(event, world);
        break;
      case 'walls':
        this.handleWallDown(event, hex);
        break;
      case 'measure':
        this.handleMeasureDown(event, world, hex);
        break;
      case 'image':
        this.handleImageDown(event, world);
        break;
      case 'texture':
        this.handleTextureDown(event, world);
        break;
    }
  }

  private handleTextureBrushSizeAdjust(event: MouseEvent, world: Point): void {
    if (this.isAdjustingTextureBrushSize && this.brushSizeAdjustStart) {
      const dx = event.clientX - this.brushSizeAdjustStart.x;
      const newSize = Math.max(10, Math.min(600, this.brushSizeAdjustStart.initialSize + dx * 0.3));
      this.textureBrushSize = Math.round(newSize);
      this.brushSizeCircle.set({ pos: world, size: Math.round(newSize) });
      this.scheduleRender();
    }
  }

  onMouseMove(event: MouseEvent): void {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);

    if (this.isZooming) {
      // CTRL+middle-mouse drag to zoom (both horizontal and vertical movement)
      const dx = event.clientX - this.lastMousePos.x;
      const dy = event.clientY - this.lastMousePos.y;
      // Up/Right = zoom in, Down/Left = zoom out
      // dy is negative when moving up, so -dy makes up contribute positively
      const zoomAmount = (dx - dy) * 0.005; // Half speed (was 0.01)
      const newScale = Math.max(0.1, Math.min(5, this.scale * (1 + zoomAmount)));
      
      // Zoom towards starting point (where CTRL was first pressed)
      const zoomPoint = this.zoomStartPoint || { x: 0, y: 0 };
      const worldBefore = this.screenToWorld(zoomPoint.x, zoomPoint.y);
      this.scale = newScale;
      const worldAfter = this.screenToWorld(zoomPoint.x, zoomPoint.y);
      
      this.panX += (worldAfter.x - worldBefore.x) * this.scale;
      this.panY += (worldAfter.y - worldBefore.y) * this.scale;
      
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      this.scheduleRender();
      return;
    }
    
    if (this.isPanning) {
      const dx = event.clientX - this.lastMousePos.x;
      const dy = event.clientY - this.lastMousePos.y;
      this.panX += dx;
      this.panY += dy;
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      this.scheduleRender();
      return;
    }

    switch (this.currentTool) {
      case 'cursor':
        this.handleCursorMove(event, world, hex);
        break;
      case 'draw':
      case 'erase':
        this.handleDrawMove(event, world);
        break;
      case 'walls':
        this.handleWallMove(event, hex);
        break;
      case 'measure':
        this.handleMeasureMove(event, world, hex);
        break;
      case 'image':
        this.handleImageMove(event, world);
        break;
      case 'texture':
        this.handleTextureMove(event, world);
        break;
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (this.isZooming) {
      this.isZooming = false;
      this.zoomStartPoint = null;
      return;
    }
    
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    // Don't finish token drag on right-click (used for waypoints in enforced mode)
    if (event.button === 2 && this.draggingToken) {
      return;
    }

    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);

    switch (this.currentTool) {
      case 'cursor':
        this.handleCursorUp(event, world, hex);
        break;
      case 'draw':
      case 'erase':
        this.handleDrawUp(event, world);
        break;
      case 'walls':
        this.handleWallUp(event, hex);
        break;
      case 'measure':
        this.handleMeasureUp(event, world, hex);
        break;
      case 'image':
        this.handleImageUp(event, world);
        break;
      case 'texture':
        this.handleTextureUp(event, world);
        break;
    }
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    const rect = this.container.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, this.scale * zoomFactor));

    // Zoom towards mouse position
    const worldBefore = this.screenToWorld(mouseX, mouseY);
    this.scale = newScale;
    const worldAfter = this.screenToWorld(mouseX, mouseY);

    this.panX += (worldAfter.x - worldBefore.x) * this.scale;
    this.panY += (worldAfter.y - worldBefore.y) * this.scale;

    this.scheduleRender();
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);

    // If dragging in enforced mode, add waypoint
    if (this.draggingToken && this.dragMode === 'enforced') {
      const currentWaypoints = this.dragWaypoints();
      this.dragWaypoints.set([...currentWaypoints, hex]);
      this.updateTokenDrag(world); // Recalculate path from new waypoint
      return;
    }

    // Check if we right-clicked on a token (not during drag)
    if (!this.draggingToken && this.currentTool === 'cursor') {
      const token = this.findTokenAtHex(hex);
      if (token) {
        this.showContextMenu.set(true);
        this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
        this.contextMenuImageId.set(null);
        this.contextMenuTokenId.set(token.id);
        this.contextMenuHex.set(null);
        return;
      }
    }

    // Check if we right-clicked on an image
    const clickedImage = this.findImageAtPoint(world);
    
    this.showContextMenu.set(true);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
    this.contextMenuImageId.set(clickedImage?.id || null);
    this.contextMenuTokenId.set(null);
    this.contextMenuHex.set(clickedImage ? null : hex);
  }

  onMouseLeave(event: MouseEvent): void {
    // Stop panning and drawing/wall operations when leaving the container
    if (this.isPanning) {
      this.isPanning = false;
    }
    if (this.isDrawing) {
      // Commit the current stroke
      this.handleDrawUp(event, this.screenToWorld(event.clientX, event.clientY));
    }
    if (this.isWallDrawing) {
      this.isWallDrawing = false;
      this.lastWallPaintHex = null;
    }
    // Do NOT cancel token drags or image transforms - user may return
  }

  // ============================================
  // Document-level event tracking (for continuous tracking outside container)
  // ============================================

  private addDocumentListeners(): void {
    if (this.documentMouseMoveListener) return; // Already added

    this.documentMouseMoveListener = (e: MouseEvent) => {
      this.onDocumentMouseMove(e);
    };
    this.documentMouseUpListener = (e: MouseEvent) => {
      this.onDocumentMouseUp(e);
    };

    document.addEventListener('mousemove', this.documentMouseMoveListener);
    document.addEventListener('mouseup', this.documentMouseUpListener);
  }

  private removeDocumentListeners(): void {
    if (this.documentMouseMoveListener) {
      document.removeEventListener('mousemove', this.documentMouseMoveListener);
      this.documentMouseMoveListener = null;
    }
    if (this.documentMouseUpListener) {
      document.removeEventListener('mouseup', this.documentMouseUpListener);
      this.documentMouseUpListener = null;
    }
  }

  private onDocumentMouseMove(event: MouseEvent): void {
    // Continue tracking for active operations even when cursor leaves container
    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    // Let the normal onMouseMove handler process it
    this.onMouseMove(event);
  }

  private onDocumentMouseUp(event: MouseEvent): void {
    // Clean up zoom/pan state
    if (this.isZooming) {
      this.isZooming = false;
    }
    if (this.isPanning) {
      this.isPanning = false;
    }
    
    // Clean up document listeners when mouse released
    this.removeDocumentListeners();
    
    // Let the normal onMouseUp handler process it
    this.onMouseUp(event);
  }

  // ============================================
  // Tool-specific handlers
  // ============================================

  private handleCursorDown(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (event.button !== 0) return; // Only left click

    // Cursor tool is ONLY for tokens - no image interaction
    const token = this.findTokenAtHex(hex);
    if (token) {
      this.startTokenDrag(token, hex);
      return;
    }
  }

  private handleCursorMove(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (this.draggingToken) {
      this.updateTokenDrag(world);
      return;
    }
  }

  private handleCursorUp(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (this.draggingToken) {
      this.finishTokenDrag(hex);
      return;
    }
  }

  private handleDrawDown(event: MouseEvent, world: Point): void {
    if (event.button !== 0) return;

    // Shift+drag = adjust brush size
    if (event.shiftKey) {
      this.isAdjustingBrushSize = true;
      const initialSize = this.isEraserMode ? this.eraserBrushSize : this.penBrushSize;
      this.brushSizeAdjustStart = { x: event.clientX, y: event.clientY, initialSize };
      return;
    }

    this.isDrawing = true;
    this.currentStrokePoints = [world];
    
    // Reset erased strokes tracking when starting new eraser stroke
    if (this.isEraserMode) {
      this.erasedStrokeIds.clear();
    }
  }

  private handleDrawMove(event: MouseEvent, world: Point): void {
    // Shift+drag = adjust brush size
    if (this.isAdjustingBrushSize && this.brushSizeAdjustStart) {
      const dx = event.clientX - this.brushSizeAdjustStart.x;
      const newSize = Math.max(1, Math.min(300, this.brushSizeAdjustStart.initialSize + dx * 0.3));
      
      if (this.isEraserMode) {
        this.eraserBrushSize = Math.round(newSize);
      } else {
        this.penBrushSize = Math.round(newSize);
      }
      
      // Show visual circle at cursor position
      this.brushSizeCircle.set({ pos: world, size: Math.round(newSize) });
      this.scheduleRender();
      return;
    }

    if (!this.isDrawing) return;

    this.currentStrokePoints.push(world);
    
    // Throttle render calls during drawing - only render every 16ms (60fps)
    const now = performance.now();
    if (now - this.lastRenderTime >= this.renderThrottleMs) {
      this.lastRenderTime = now;
      this.scheduleRender();
    }
  }

  private handleDrawUp(event: MouseEvent, world: Point): void {
    // End brush size adjustment
    if (this.isAdjustingBrushSize) {
      this.isAdjustingBrushSize = false;
      this.brushSizeAdjustStart = null;
      this.brushSizeCircle.set(null);
      this.scheduleRender();
      return;
    }

    if (!this.isDrawing) return;

    this.isDrawing = false;
    
    // Create stroke (for both pen and eraser)
    if (this.currentStrokePoints.length > 1) {
      const stroke: Stroke = {
        id: generateId(),
        points: [...this.currentStrokePoints],
        color: this.isEraserMode ? '#FFFFFF' : this.brushColor,
        lineWidth: this.isEraserMode ? this.eraserBrushSize : this.penBrushSize,
        isEraser: this.isEraserMode,
      };
      
      this.store.addStroke(stroke);
    }

    this.currentStrokePoints = [];
    this.erasedStrokeIds.clear();
    this.lastRenderTime = 0; // Reset throttle
    this.scheduleRender();
  }

  private async handleTextureDown(event: MouseEvent, world: Point): Promise<void> {
    if (event.button !== 0) return;
    
    // Shift+drag = adjust brush size
    if (event.shiftKey) {
      this.isAdjustingTextureBrushSize = true;
      this.brushSizeAdjustStart = { x: event.clientX, y: event.clientY, initialSize: this.textureBrushSize };
      return;
    }
    
    // Allow eraser without texture selected
    if (!this.isEraserMode && !this.selectedTextureId) return;

    if (this.isEraserMode) {
      this.isErasingTexture = true;
      this.isDrawingTexture = false;
    } else {
      this.isDrawingTexture = true;
      this.isErasingTexture = false;
    }
    
    this.currentTexturePoints = [world];
    this.currentDrawingTiles.clear();
    
    // Initialize stroke canvas for single-pass drawing
    this.initStrokeCanvas(world);
    
    // Cache processed texture to prevent lag (only for texture mode)
    if (this.isDrawingTexture && this.selectedTextureId) {
      await this.cacheProcessedTexture();
      // If texture still not loaded, abort drawing
      if (!this.cachedProcessedTexture) {
        console.warn('[Texture] Failed to load texture, aborting draw');
        this.isDrawingTexture = false;
        return;
      }
    } else if (this.isErasingTexture) {
      // For eraser, create a dummy black texture
      this.cachedProcessedTexture = document.createElement('canvas');
      this.cachedProcessedTexture.width = 1;
      this.cachedProcessedTexture.height = 1;
    }
    
    // Start drawing to stroke canvas
    this.drawToStrokeCanvas(world, world);
    
    // Immediately render to show stroke start
    this.scheduleRender();
  }

  private handleTextureMove(event: MouseEvent, world: Point): void {
    // Shift+drag = adjust brush size
    if (this.isAdjustingTextureBrushSize && this.brushSizeAdjustStart) {
      const dx = event.clientX - this.brushSizeAdjustStart.x;
      const newSize = Math.max(10, Math.min(600, this.brushSizeAdjustStart.initialSize + dx * 0.3));
      this.textureBrushSize = Math.round(newSize);
      this.brushSizeCircle.set({ pos: world, size: Math.round(newSize) });
      this.scheduleRender();
      return;
    }
    
    if (!this.isDrawingTexture && !this.isErasingTexture) return;

    // THROTTLE: Skip if still processing previous mouse event (prevents lag and catch-up)
    if (this.isProcessingMouseMove) {
      return;
    }
    
    this.isProcessingMouseMove = true;
    
    try {
      const prevPoint = this.currentTexturePoints[this.currentTexturePoints.length - 1];
      this.currentTexturePoints.push(world);
      
      // Draw to stroke canvas (non-blocking, single-pass)
      this.drawToStrokeCanvas(prevPoint, world);
      
      // Always render immediately during texture drawing for smooth feedback
      this.scheduleRender();
    } finally {
      // Reset flag immediately (synchronous processing)
      this.isProcessingMouseMove = false;
    }
  }

  private async handleTextureUp(event: MouseEvent, world: Point): Promise<void> {
    // End brush size adjustment
    if (this.isAdjustingTextureBrushSize) {
      this.isAdjustingTextureBrushSize = false;
      this.brushSizeAdjustStart = null;
      this.brushSizeCircle.set(null);
      return;
    }
    
    if (!this.isDrawingTexture && !this.isErasingTexture) return;

    const wasDrawing = this.isDrawingTexture;
    const wasErasing = this.isErasingTexture;
    
    this.isDrawingTexture = false;
    this.isErasingTexture = false;
    
    // NOTE: Removed textureStroke sync - tiles are the source of truth
    // Syncing stroke data was redundant (tiles already sync via updateMapTiles)
    // and added significant bandwidth overhead for no benefit
    
    // Copy stroke canvas to tiles (single commit)
    await this.commitStrokeToTiles();
    
    // Clear cache
    this.cachedProcessedTexture = null;
    this.cachedTextureId = null;
    
    // Save immediately after stroke ends (no debounce - prevents socket disconnect)
    if (this.dirtyTiles.size > 0) {
      await this.saveDirtyTiles();
    }

    this.currentTexturePoints = [];
    this.currentDrawingTiles.clear();
    this.lastRenderTime = 0; // Reset throttle
    this.scheduleRender();
  }

  private handleWallDown(event: MouseEvent, hex: HexCoord): void {
    if (event.button !== 0) return;

    this.isWallDrawing = true;
    this.pendingWallChanges = [];
    const walls = this.map?.walls || [];
    const hasWall = walls.some(w => w.q === hex.q && w.r === hex.r);
    
    this.wallPaintMode = hasWall ? 'remove' : 'add';
    this.paintWall(hex);
  }

  private handleWallMove(event: MouseEvent, hex: HexCoord): void {
    if (!this.isWallDrawing) return;
    this.paintWall(hex);
  }

  private handleWallUp(event: MouseEvent, hex: HexCoord): void {
    if (this.isWallDrawing && this.pendingWallChanges.length > 0) {
      // Commit all batched wall changes at once
      this.store.applyWallBatch(this.pendingWallChanges);
      this.pendingWallChanges = [];
    }
    this.isWallDrawing = false;
    this.lastWallPaintHex = null;
  }

  private handleMeasureDown(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (event.button !== 0) return;

    // Snap to hex center
    const hexCenter = HexMath.hexToPixel(hex);
    this.measureStart.set(hexCenter);
    this.measureEnd.set(hexCenter);
    this.measureDistance.set(0);
  }

  private handleMeasureMove(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (!this.measureStart()) return;

    // Snap to hex center
    const hexCenter = HexMath.hexToPixel(hex);
    this.measureEnd.set(hexCenter);
    const start = this.measureStart()!;
    
    // Calculate hex distance and convert to meters (1.5m per hex)
    const startHex = HexMath.pixelToHex(start);
    const endHex = HexMath.pixelToHex(hexCenter);
    const hexDistance = HexMath.hexDistance(startHex, endHex);
    const meters = hexDistance * 1.5;
    this.measureDistance.set(meters);
    this.scheduleRender();
  }

  private handleMeasureUp(event: MouseEvent, world: Point, hex: HexCoord): void {
    // Clear measurement on mouse up
    this.measureStart.set(null);
    this.measureEnd.set(null);
    this.measureDistance.set(0);
    this.scheduleRender();
  }

  private handleImageDown(event: MouseEvent, world: Point): void {
    if (event.button !== 0) return;

    const selected = this.selectedImages();
    
    // Check for transform handles on selected images (group or single)
    if (selected.length > 0) {
      const groupBox = this.calculateGroupBoundingBox(selected);
      if (groupBox) {
        const handle = this.getGroupTransformHandle(world, groupBox);
        if (handle) {
          this.startGroupTransform(selected, handle, world, groupBox);
          return;
        }
        // Click inside any selected image = start group drag
        for (const imageId of selected) {
          const img = this.map?.images?.find(i => i.id === imageId);
          if (img && this.isPointInImage(world, img)) {
            this.startGroupDrag(selected, world);
            return;
          }
        }
      }
    } else if (this.selectedImageId) {
      // Fallback to single image selection
      const selectedImage = this.map?.images?.find(img => img.id === this.selectedImageId);
      if (selectedImage) {
        const handle = this.getTransformHandle(world, selectedImage);
        if (handle) {
          this.startImageTransform(selectedImage, handle, world);
          return;
        }
        if (this.isPointInImage(world, selectedImage)) {
          this.startImageDrag(selectedImage, world);
          return;
        }
      }
    }

    // Auto-place image when in image tool mode with pending image from sidebar
    const pendingImageId = this.getPendingImageId();
    if (pendingImageId) {
      // Load the actual image to get its dimensions and preserve aspect ratio
      const imageUrl = `/api/images/${pendingImageId}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Preserve aspect ratio, scale to max 200px on longest side
        const maxSize = 200;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        
        if (width > height) {
          if (width > maxSize) {
            width = maxSize;
            height = maxSize / aspectRatio;
          }
        } else {
          if (height > maxSize) {
            height = maxSize;
            width = maxSize * aspectRatio;
          }
        }
        
        this.placeImage.emit({
          imageId: pendingImageId,
          x: world.x,
          y: world.y,
          width: Math.round(width),
          height: Math.round(height),
        });
      };
      img.onerror = () => {
        // Fallback to square if image fails to load
        this.placeImage.emit({
          imageId: pendingImageId,
          x: world.x,
          y: world.y,
          width: 100,
          height: 100,
        });
      };
      img.src = imageUrl;
      
      // Auto-select cursor tool after placing image
      this.toolAutoSelect.emit('cursor');
      return;
    }

    // Check if clicking on an existing image
    const clickedImage = this.findImageAtPoint(world);
    if (clickedImage) {
      // Ctrl/Shift click = toggle selection (multi-select)
      if (event.ctrlKey || event.shiftKey) {
        const selected = this.selectedImages();
        if (selected.includes(clickedImage.id)) {
          // Deselect
          this.selectedImages.set(selected.filter(id => id !== clickedImage.id));
        } else {
          // Add to selection
          this.selectedImages.set([...selected, clickedImage.id]);
        }
        return;
      }
      
      // Normal click = select single image
      if (this.selectedImages().includes(clickedImage.id)) {
        return; // Already selected
      }
      this.selectedImages.set([clickedImage.id]);
      this.imageSelect.emit(clickedImage.id);
      return;
    }

    // Start box selection
    this.isBoxSelecting = true;
    this.boxSelectionStart = world;
    this.selectionBox.set({ start: world, end: world });
  }

  private handleImageMove(event: MouseEvent, world: Point): void {
    // Update cursor based on position
    this.updateCursor(world);

    // Handle group transform
    if (this.transformingImageIds.length > 0 && this.transformHandle) {
      this.updateGroupTransform(world);
      return;
    }

    // Handle group drag
    if (this.draggingImageIds.length > 0) {
      this.updateGroupDrag(world);
      return;
    }

    // Handle image transform/drag (single)
    if (this.transformingImageId && this.transformHandle) {
      this.updateImageTransform(world);
      return;
    }

    if (this.draggingImageId) {
      this.updateImageDrag(world);
      return;
    }

    // Handle box selection
    if (this.isBoxSelecting && this.boxSelectionStart) {
      this.selectionBox.set({ start: this.boxSelectionStart, end: world });
      this.scheduleRender();
    }
  }

  private handleImageUp(event: MouseEvent, world: Point): void {
    // Finish group transform
    if (this.transformingImageIds.length > 0) {
      this.finishGroupTransform();
      return;
    }

    // Finish group drag
    if (this.draggingImageIds.length > 0) {
      this.finishGroupDrag();
      return;
    }

    // Finish image transform/drag (single)
    if (this.transformingImageId) {
      this.finishImageTransform();
      return;
    }

    if (this.draggingImageId) {
      this.finishImageDrag();
      return;
    }

    // Finish box selection
    if (this.isBoxSelecting && this.boxSelectionStart) {
      // Finalize box selection
      const box = this.selectionBox();
      if (box) {
        const selectedIds = this.findImagesInBox(box.start, box.end);
        
        if (selectedIds.length === 0) {
          // No images in box - clear selection
          this.selectedImages.set([]);
          this.imageSelect.emit(null);
        } else if (selectedIds.length === 1) {
          // Single image - use normal selection
          this.selectedImages.set([selectedIds[0]]);
          this.imageSelect.emit(selectedIds[0]);
        } else {
          // Multiple images selected
          this.selectedImages.set(selectedIds);
          // Emit first image as primary selection
          this.imageSelect.emit(selectedIds[0]);
        }
      }
      
      // Reset box selection state
      this.isBoxSelecting = false;
      this.boxSelectionStart = null;
      this.selectionBox.set(null);
      this.scheduleRender();
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private findImageAtPoint(point: Point): MapImage | null {
    if (!this.map?.images) return null;

    // Check in reverse order (top to bottom)
    const images = [...this.map.images].sort((a, b) => b.zIndex - a.zIndex);
    
    for (const img of images) {
      if (this.isPointInImage(point, img)) {
        return img;
      }
    }
    
    return null;
  }

  private isPointInImage(point: Point, img: MapImage): boolean {
    // Transform point to image-local coordinates
    const dx = point.x - img.x;
    const dy = point.y - img.y;
    
    // Rotate point around image center
    const cos = Math.cos(-img.rotation * Math.PI / 180);
    const sin = Math.sin(-img.rotation * Math.PI / 180);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    
    // Check if point is within image bounds
    return Math.abs(localX) <= img.width / 2 && Math.abs(localY) <= img.height / 2;
  }

  private findTokenAtHex(hex: HexCoord): Token | null {
    return this.tokens.find(token => token.position.q === hex.q && token.position.r === hex.r) || null;
  }

  private getTransformHandle(point: Point, img: MapImage): 'tl' | 'tr' | 'bl' | 'br' | 'rotate' | null {
    const handleHitSize = 20 / this.scale; // Generous hit area for easier grabbing
    const hw = img.width / 2;
    const hh = img.height / 2;

    // Transform point to image-local coordinates
    const dx = point.x - img.x;
    const dy = point.y - img.y;
    const cos = Math.cos(-img.rotation * Math.PI / 180);
    const sin = Math.sin(-img.rotation * Math.PI / 180);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // Check rotation handle (above the image)
    const rotY = -hh - 25 / this.scale;
    if (Math.abs(localX) < 12 / this.scale && Math.abs(localY - rotY) < 12 / this.scale) {
      return 'rotate';
    }

    // Check corner handles
    const corners = [
      { x: -hw, y: -hh, handle: 'tl' as const },
      { x: hw, y: -hh, handle: 'tr' as const },
      { x: hw, y: hh, handle: 'br' as const },
      { x: -hw, y: hh, handle: 'bl' as const },
    ];

    for (const corner of corners) {
      if (Math.abs(localX - corner.x) < handleHitSize && Math.abs(localY - corner.y) < handleHitSize) {
        return corner.handle;
      }
    }

    return null;
  }

  private updateCursor(point: Point): void {
    const container = this.container?.nativeElement;
    if (!container) return;

    let cursor = 'default';

    // Check group selection first
    const selectedIds = this.selectedImages();
    if (selectedIds.length > 1) {
      const groupBox = this.calculateGroupBoundingBox(selectedIds);
      if (groupBox) {
        const handle = this.getGroupTransformHandle(point, groupBox);
        if (handle === 'rotate') {
          cursor = 'crosshair';
        } else if (handle === 'tl' || handle === 'br') {
          cursor = 'nw-resize';
        } else if (handle === 'tr' || handle === 'bl') {
          cursor = 'ne-resize';
        } else if (handle === 't' || handle === 'b') {
          cursor = 'ns-resize';
        } else if (handle === 'l' || handle === 'r') {
          cursor = 'ew-resize';
        } else {
          // Check if inside any selected image
          for (const imageId of selectedIds) {
            const img = this.map?.images?.find(i => i.id === imageId);
            if (img && this.isPointInImage(point, img)) {
              cursor = 'move';
              break;
            }
          }
        }
      }
    } else if (this.selectedImageId) {
      const selectedImage = this.map?.images?.find(img => img.id === this.selectedImageId);
      if (selectedImage) {
        const handle = this.getTransformHandle(point, selectedImage);
        if (handle === 'rotate') {
          cursor = 'crosshair';
        } else if (handle === 'tl' || handle === 'br') {
          cursor = 'nw-resize';
        } else if (handle === 'tr' || handle === 'bl') {
          cursor = 'ne-resize';
        } else if (this.isPointInImage(point, selectedImage)) {
          cursor = 'move';
        }
      }
    }

    if (!this.selectedImageId && selectedIds.length === 0) {
      const imageAtPoint = this.findImageAtPoint(point);
      if (imageAtPoint) {
        cursor = 'pointer';
      }
    }

    container.style.cursor = cursor;
  }

  private findPath(start: HexCoord, end: HexCoord): HexCoord[] {
    // Check cache first
    const cacheKey = `${start.q},${start.r}->${end.q},${end.r}`;
    if (this.pathfindingCache.has(cacheKey)) {
      return this.pathfindingCache.get(cacheKey)!;
    }
    
    // A* pathfinding that avoids walls
    const walls = this.map?.walls || [];
    const wallSet = new Set(walls.map(w => `${w.q},${w.r}`));
    
    const getKey = (hex: HexCoord) => `${hex.q},${hex.r}`;
    const getNeighbors = (hex: HexCoord): HexCoord[] => [
      { q: hex.q + 1, r: hex.r },
      { q: hex.q - 1, r: hex.r },
      { q: hex.q, r: hex.r + 1 },
      { q: hex.q, r: hex.r - 1 },
      { q: hex.q + 1, r: hex.r - 1 },
      { q: hex.q - 1, r: hex.r + 1 },
    ].filter(h => !wallSet.has(getKey(h)));
    
    const heuristic = (a: HexCoord, b: HexCoord): number => {
      // Use Euclidean distance to prefer straighter paths
      const aPixel = HexMath.hexToPixel(a);
      const bPixel = HexMath.hexToPixel(b);
      const dx = bPixel.x - aPixel.x;
      const dy = bPixel.y - aPixel.y;
      return Math.sqrt(dx * dx + dy * dy) / 50; // Normalize to roughly match step cost
    };
    
    const openSet = [start];
    const cameFrom = new Map<string, HexCoord>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    
    gScore.set(getKey(start), 0);
    fScore.set(getKey(start), heuristic(start, end));
    
    let iterations = 0;
    const maxIterations = 300; // Reduced from 500 for better performance
    
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Get node with lowest fScore
      openSet.sort((a, b) => (fScore.get(getKey(a)) || Infinity) - (fScore.get(getKey(b)) || Infinity));
      const current = openSet.shift()!;
      
      if (current.q === end.q && current.r === end.r) {
        // Reconstruct path
        const path: HexCoord[] = [current];
        let temp = current;
        while (cameFrom.has(getKey(temp))) {
          temp = cameFrom.get(getKey(temp))!;
          path.unshift(temp);
        }
        this.pathfindingCache.set(cacheKey, path); // Cache result
        return path;
      }
      
      for (const neighbor of getNeighbors(current)) {
        const tentativeGScore = (gScore.get(getKey(current)) || 0) + 1;
        
        if (!gScore.has(getKey(neighbor)) || tentativeGScore < gScore.get(getKey(neighbor))!) {
          cameFrom.set(getKey(neighbor), current);
          gScore.set(getKey(neighbor), tentativeGScore);
          fScore.set(getKey(neighbor), tentativeGScore + heuristic(neighbor, end));
          
          if (!openSet.some(h => h.q === neighbor.q && h.r === neighbor.r)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    
    // No path found - check if destination is blocked
    const endKey = getKey(end);
    if (wallSet.has(endKey)) {
      // Destination itself is a wall - return empty to indicate blocked
      const blocked: HexCoord[] = [];
      this.pathfindingCache.set(cacheKey, blocked);
      return blocked;
    }
    
    // Return straight line but caller should check if this passes through walls
    const fallback = [start, end];
    this.pathfindingCache.set(cacheKey, fallback);
    return fallback;
  }

  private startTokenDrag(token: Token, hex: HexCoord): void {
    this.draggingToken = token;
    this.dragStartHex.set(hex);
    this.dragHoverHex.set(hex);
    this.dragPath.set([]); // No path visualization for free movement
    this.dragWaypoints.set([]);
    this.dragPathExceedsSpeed.set(false);
    this.dragPathIsBlocked.set(false);
    this.pathfindingCache.clear(); // Clear pathfinding cache for new drag
  }

  private updateTokenDrag(world: Point): void {
    if (!this.draggingToken) return;

    // Always follow cursor position smoothly
    this.dragCurrentPosition.set(world);
    
    const hex = HexMath.pixelToHex(world);
    this.dragHoverHex.set(hex);
    
    // In enforced mode, calculate path with walls and speed limits
    if (this.dragMode === 'enforced') {
      const startHex = this.dragStartHex();
      const waypoints = this.dragWaypoints();
      
      if (startHex) {
        // Build full path: start → wp1 → wp2 → ... → current hex
        let fullPath: HexCoord[] = [startHex];
        let from = startHex;
        
        // Add path segments through each waypoint
        for (const wp of waypoints) {
          const segment = this.findPath(from, wp);
          fullPath.push(...segment.slice(1)); // Skip first (already in path)
          from = wp;
        }
        
        // Add final segment from last waypoint (or start) to current hex
        const finalSegment = this.findPath(from, hex);
        fullPath.push(...finalSegment.slice(1));
        
        // Check if path is blocked
        const isBlocked = finalSegment.length === 0 || waypoints.some(wp => {
          const segment = this.findPath(from, wp);
          return segment.length === 0;
        });
        this.dragPathIsBlocked.set(isBlocked);
        
        const maxDistance = this.draggingToken?.movementSpeed || 6;
        const pathLength = fullPath.length - 1; // Number of steps
        this.dragPathExceedsSpeed.set(pathLength > maxDistance);
        this.dragPath.set(fullPath);
      }
    } else {
      // Free movement - no pathfinding, no restrictions
      this.dragPath.set([]);
      this.dragPathExceedsSpeed.set(false);
    }

    this.scheduleRender();
  }

  private finishTokenDrag(hex: HexCoord): void {
    if (!this.draggingToken) return;

    const startHex = this.dragStartHex();
    
    // In enforced mode, if path exceeds speed OR is blocked, snap back to start
    if (this.dragMode === 'enforced' && (this.dragPathExceedsSpeed() || this.dragPathIsBlocked())) {
      // Don't move - just cancel
      this.draggingToken = null;
      this.dragStartHex.set(null);
      this.dragHoverHex.set(null);
      this.dragPath.set([]);
      this.dragWaypoints.set([]);
      this.dragPathExceedsSpeed.set(false);
      this.dragPathIsBlocked.set(false);
      this.dragGhostPosition.set(null);
      this.dragCurrentPosition.set(null);
      this.scheduleRender();
      return;
    }
    
    const targetHex = hex;
    
    if (startHex && targetHex && (startHex.q !== targetHex.q || startHex.r !== targetHex.r)) {
      this.tokenMove.emit({
        tokenId: this.draggingToken.id,
        position: targetHex,
      });
    }

    this.draggingToken = null;
    this.dragStartHex.set(null);
    this.dragHoverHex.set(null);
    this.dragPath.set([]);
    this.dragWaypoints.set([]);
    this.dragPathExceedsSpeed.set(false);
    this.dragPathIsBlocked.set(false);
    this.dragGhostPosition.set(null);
    this.dragCurrentPosition.set(null);
    this.scheduleRender();
  }

  private startImageDrag(img: MapImage, point: Point): void {
    this.draggingImageId = img.id;
    this.imageDragStart = point;
    this.initialImageTransform = {
      x: img.x,
      y: img.y,
    };
  }

  private updateImageDrag(point: Point): void {
    if (!this.draggingImageId || !this.imageDragStart || !this.initialImageTransform) {
      return;
    }

    const dx = point.x - this.imageDragStart.x;
    const dy = point.y - this.imageDragStart.y;

    const transform: Partial<MapImage> = {
      x: this.initialImageTransform.x! + dx,
      y: this.initialImageTransform.y! + dy,
    };

    // Store preview locally instead of emitting - reduces backend round-trips and flickering
    this.previewImageDrag.set({ id: this.draggingImageId, position: { x: transform.x!, y: transform.y! } });
    this.scheduleRender();
  }

  private finishImageDrag(): void {
    // Emit the final transform to save to backend
    const preview = this.previewImageDrag();
    if (preview && this.initialImageTransform) {
      const transform = {
        x: preview.position.x,
        y: preview.position.y,
      };
      this.imageTransform.emit({ id: preview.id, transform });
    }
    
    this.draggingImageId = null;
    this.imageDragStart = null;
    this.initialImageTransform = null;
    this.previewImageDrag.set(null);
  }

  private startImageTransform(img: MapImage, handle: string, point: Point): void {
    this.transformingImageId = img.id;
    this.transformHandle = handle as any;
    this.transformAnchor = point;
    this.initialImageTransform = {
      x: img.x,
      y: img.y,
      width: img.width,
      height: img.height,
      rotation: img.rotation,
    };
  }

  private updateImageTransform(point: Point): void {
    if (!this.transformingImageId || !this.transformHandle || !this.transformAnchor || !this.initialImageTransform) {
      return;
    }

    // Use initialImageTransform for all calculations to avoid stale data from OnPush
    const initial = this.initialImageTransform;

    const dx = point.x - this.transformAnchor.x;
    const dy = point.y - this.transformAnchor.y;

    let transform: Partial<MapImage> = {};

    switch (this.transformHandle) {
      case 'rotate':
        // Calculate angle from center to current point
        const centerToCurrent = Math.atan2(point.y - initial.y!, point.x - initial.x!) * 180 / Math.PI;
        const centerToAnchor = Math.atan2(this.transformAnchor.y - initial.y!, this.transformAnchor.x - initial.x!) * 180 / Math.PI;
        transform.rotation = initial.rotation! + (centerToCurrent - centerToAnchor);
        break;
      case 'tl':
      case 'tr':
      case 'bl':
      case 'br':
        // Calculate scale based on distance change from center
        const initialDist = Math.sqrt(
          Math.pow(this.transformAnchor.x - initial.x!, 2) + 
          Math.pow(this.transformAnchor.y - initial.y!, 2)
        );
        const currentDist = Math.sqrt(
          Math.pow(point.x - initial.x!, 2) + 
          Math.pow(point.y - initial.y!, 2)
        );
        const scale = Math.max(0.1, currentDist / initialDist);
        transform.width = initial.width! * scale;
        transform.height = initial.height! * scale;
        break;
    }

    // Store preview locally instead of emitting - reduces backend round-trips and flickering
    this.previewImageTransform.set({ id: this.transformingImageId, transform });
    this.scheduleRender();
  }

  private finishImageTransform(): void {
    // Emit the final transform to save to backend
    const preview = this.previewImageTransform();
    if (preview) {
      this.imageTransform.emit(preview);
    }
    
    this.transformingImageId = null;
    this.transformHandle = null;
    this.transformAnchor = null;
    this.initialImageTransform = null;
    this.previewImageTransform.set(null);
  }

  // ============================================
  // Group Transform Methods
  // ============================================

  private calculateGroupBoundingBox(imageIds: string[]): { minX: number, minY: number, maxX: number, maxY: number, centerX: number, centerY: number } | null {
    if (!this.map?.images || imageIds.length === 0) return null;

    const images = this.map.images.filter(img => imageIds.includes(img.id));
    if (images.length === 0) return null;

    // Check for preview transforms
    const groupTransforms = this.previewGroupTransforms();
    const groupDrags = this.previewGroupDrags();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const img of images) {
      // Apply preview transforms if available
      let effectiveImg = img;
      if (groupTransforms && groupTransforms.has(img.id)) {
        effectiveImg = { ...img, ...groupTransforms.get(img.id)! };
      } else if (groupDrags && groupDrags.has(img.id)) {
        const pos = groupDrags.get(img.id)!;
        effectiveImg = { ...img, x: pos.x, y: pos.y };
      }

      // Calculate rotated bounding box corners
      const hw = effectiveImg.width / 2;
      const hh = effectiveImg.height / 2;
      const cos = Math.cos(effectiveImg.rotation * Math.PI / 180);
      const sin = Math.sin(effectiveImg.rotation * Math.PI / 180);

      const corners = [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh },
      ];

      for (const corner of corners) {
        const worldX = effectiveImg.x + corner.x * cos - corner.y * sin;
        const worldY = effectiveImg.y + corner.x * sin + corner.y * cos;
        minX = Math.min(minX, worldX);
        minY = Math.min(minY, worldY);
        maxX = Math.max(maxX, worldX);
        maxY = Math.max(maxY, worldY);
      }
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return { minX, minY, maxX, maxY, centerX, centerY };
  }

  private getGroupTransformHandle(point: Point, box: { minX: number, minY: number, maxX: number, maxY: number, centerX: number, centerY: number }): 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'rotate' | null {
    const handleHitSize = 20 / this.scale;
    
    // Check rotation handle (above the bounding box)
    const rotY = box.minY - 25 / this.scale;
    if (Math.abs(point.x - box.centerX) < 12 / this.scale && Math.abs(point.y - rotY) < 12 / this.scale) {
      return 'rotate';
    }

    // Check corner handles
    const corners = [
      { x: box.minX, y: box.minY, handle: 'tl' as const },
      { x: box.maxX, y: box.minY, handle: 'tr' as const },
      { x: box.maxX, y: box.maxY, handle: 'br' as const },
      { x: box.minX, y: box.maxY, handle: 'bl' as const },
    ];

    for (const corner of corners) {
      if (Math.abs(point.x - corner.x) < handleHitSize && Math.abs(point.y - corner.y) < handleHitSize) {
        return corner.handle;
      }
    }

    // Check edge handles
    const edges = [
      { x: box.centerX, y: box.minY, handle: 't' as const },
      { x: box.centerX, y: box.maxY, handle: 'b' as const },
      { x: box.minX, y: box.centerY, handle: 'l' as const },
      { x: box.maxX, y: box.centerY, handle: 'r' as const },
    ];

    for (const edge of edges) {
      if (Math.abs(point.x - edge.x) < handleHitSize && Math.abs(point.y - edge.y) < handleHitSize) {
        return edge.handle;
      }
    }

    return null;
  }

  private startGroupTransform(imageIds: string[], handle: string, point: Point, box: { minX: number, minY: number, maxX: number, maxY: number, centerX: number, centerY: number }): void {
    this.transformingImageIds = imageIds;
    this.transformHandle = handle as any;
    this.transformAnchor = point;
    this.groupBoundingBox = box;
    
    // Store initial state for all images
    this.initialGroupTransforms.clear();
    if (this.map?.images) {
      for (const imageId of imageIds) {
        const img = this.map.images.find(i => i.id === imageId);
        if (img) {
          this.initialGroupTransforms.set(imageId, {
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height,
            rotation: img.rotation,
          });
        }
      }
    }
  }

  private updateGroupTransform(point: Point): void {
    if (this.transformingImageIds.length === 0 || !this.transformHandle || !this.transformAnchor || !this.groupBoundingBox) {
      return;
    }

    const box = this.groupBoundingBox;
    const centerX = box.centerX;
    const centerY = box.centerY;

    const transforms = new Map<string, Partial<MapImage>>();

    switch (this.transformHandle) {
      case 'rotate':
        // Rotate entire group around center
        const centerToCurrent = Math.atan2(point.y - centerY, point.x - centerX) * 180 / Math.PI;
        const centerToAnchor = Math.atan2(this.transformAnchor.y - centerY, this.transformAnchor.x - centerX) * 180 / Math.PI;
        const rotationDelta = centerToCurrent - centerToAnchor;

        for (const [imageId, initial] of this.initialGroupTransforms) {
          // Rotate image position around group center
          const dx = initial.x! - centerX;
          const dy = initial.y! - centerY;
          const rad = rotationDelta * Math.PI / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const newX = centerX + dx * cos - dy * sin;
          const newY = centerY + dx * sin + dy * cos;

          transforms.set(imageId, {
            x: newX,
            y: newY,
            rotation: initial.rotation! + rotationDelta,
          });
        }
        break;

      case 'tl':
      case 'tr':
      case 'bl':
      case 'br':
      case 't':
      case 'b':
      case 'l':
      case 'r':
        // Scale group from center
        const initialDist = Math.sqrt(
          Math.pow(this.transformAnchor.x - centerX, 2) + 
          Math.pow(this.transformAnchor.y - centerY, 2)
        );
        const currentDist = Math.sqrt(
          Math.pow(point.x - centerX, 2) + 
          Math.pow(point.y - centerY, 2)
        );
        const scaleFactor = Math.max(0.1, currentDist / initialDist);

        for (const [imageId, initial] of this.initialGroupTransforms) {
          // Scale position relative to group center
          const dx = initial.x! - centerX;
          const dy = initial.y! - centerY;
          const newX = centerX + dx * scaleFactor;
          const newY = centerY + dy * scaleFactor;

          transforms.set(imageId, {
            x: newX,
            y: newY,
            width: initial.width! * scaleFactor,
            height: initial.height! * scaleFactor,
          });
        }
        break;
    }

    this.previewGroupTransforms.set(transforms);
    this.scheduleRender();
  }

  private finishGroupTransform(): void {
    // Emit all transforms to backend
    const transforms = this.previewGroupTransforms();
    if (transforms) {
      for (const [imageId, transform] of transforms) {
        this.imageTransform.emit({ id: imageId, transform });
      }
    }

    this.transformingImageIds = [];
    this.transformHandle = null;
    this.transformAnchor = null;
    this.groupBoundingBox = null;
    this.initialGroupTransforms.clear();
    this.previewGroupTransforms.set(null);
  }

  private startGroupDrag(imageIds: string[], point: Point): void {
    this.draggingImageIds = imageIds;
    this.imageDragStart = point;

    // Store initial positions
    this.initialGroupTransforms.clear();
    if (this.map?.images) {
      for (const imageId of imageIds) {
        const img = this.map.images.find(i => i.id === imageId);
        if (img) {
          this.initialGroupTransforms.set(imageId, {
            x: img.x,
            y: img.y,
          });
        }
      }
    }
  }

  private updateGroupDrag(point: Point): void {
    if (this.draggingImageIds.length === 0 || !this.imageDragStart) {
      return;
    }

    const dx = point.x - this.imageDragStart.x;
    const dy = point.y - this.imageDragStart.y;

    const drags = new Map<string, { x: number, y: number }>();
    for (const [imageId, initial] of this.initialGroupTransforms) {
      drags.set(imageId, {
        x: initial.x! + dx,
        y: initial.y! + dy,
      });
    }

    this.previewGroupDrags.set(drags);
    this.scheduleRender();
  }

  private finishGroupDrag(): void {
    // Emit all position updates
    const drags = this.previewGroupDrags();
    if (drags) {
      for (const [imageId, position] of drags) {
        this.imageTransform.emit({
          id: imageId,
          transform: { x: position.x, y: position.y },
        });
      }
    }

    this.draggingImageIds = [];
    this.imageDragStart = null;
    this.initialGroupTransforms.clear();
    this.previewGroupDrags.set(null);
  }

  private lastWallPaintHex: string | null = null;

  private paintWall(hex: HexCoord): void {
    const hexKey = `${hex.q},${hex.r}`;
    
    // Skip if we just painted this hex (prevent duplicate updates)
    if (this.lastWallPaintHex === hexKey) return;
    this.lastWallPaintHex = hexKey;
    
    // Check if this hex already has a pending change
    const alreadyPending = this.pendingWallChanges.some(
      c => c.hex.q === hex.q && c.hex.r === hex.r
    );
    if (alreadyPending) return;
    
    const walls = this.map?.walls || [];
    const hasWall = walls.some(w => w.q === hex.q && w.r === hex.r);

    if (this.wallPaintMode === 'add' && !hasWall) {
      this.pendingWallChanges.push({ hex: { q: hex.q, r: hex.r }, action: 'add' });
      // Optimistically add to local map for immediate visual feedback
      if (this.map) {
        this.map.walls = [...(this.map.walls || []), { q: hex.q, r: hex.r }];
      }
    } else if (this.wallPaintMode === 'remove' && hasWall) {
      this.pendingWallChanges.push({ hex: { q: hex.q, r: hex.r }, action: 'remove' });
      // Optimistically remove from local map for immediate visual feedback
      if (this.map) {
        this.map.walls = (this.map.walls || []).filter(w => !(w.q === hex.q && w.r === hex.r));
      }
    }
    
    // Re-render grid immediately for visual feedback (no server call)
    this.scheduleRender();
  }

  private getPendingImageId(): string | null {
    // This would typically come from a service or parent component
    // For now, return null to indicate no pending image
    return null;
  }

  // ============================================
  // Token Dropping
  // ============================================

  onTokenDrop(event: DragEvent): void {
    event.preventDefault();
    
    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);

    const data = event.dataTransfer?.getData('application/json');
    if (data) {
      const dropData = JSON.parse(data);
      
      if (dropData.type === 'character') {
        this.tokenDrop.emit({
          characterId: dropData.characterId,
          position: hex,
        });
      } else if (dropData.type === 'quickToken') {
        this.quickTokenDrop.emit({
          name: dropData.name,
          portrait: dropData.portrait,
          position: hex,
        });
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDragLeave(event: DragEvent): void {
    // Handle drag leave if needed
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    
    // Get drop position
    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);
    
    // Handle character or library image drop
    const dataString = event.dataTransfer?.getData('text/plain');
    if (dataString) {
      try {
        const data = JSON.parse(dataString);
        
        if (data.type === 'character') {
          // Character token drop
          this.tokenDrop.emit({
            characterId: data.characterId,
            position: hex
          });
          return;
        }
        
        if (data.type === 'library-image') {
          // Library image drop - load actual dimensions
          const imageUrl = `/api/images/${data.imageId}`;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Preserve aspect ratio, scale to max 200px on longest side
            const maxSize = 200;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            
            if (width > height) {
              if (width > maxSize) {
                width = maxSize;
                height = maxSize / aspectRatio;
              }
            } else {
              if (height > maxSize) {
                height = maxSize;
                width = maxSize * aspectRatio;
              }
            }
            
            this.placeImage.emit({
              imageId: data.imageId,
              x: world.x,
              y: world.y,
              width: Math.round(width),
              height: Math.round(height)
            });
          };
          img.onerror = () => {
            // Fallback
            this.placeImage.emit({
              imageId: data.imageId,
              x: world.x,
              y: world.y,
              width: data.width || 100,
              height: data.height || 100
            });
          };
          img.src = imageUrl;
          
          // Auto-select cursor tool after dropping image
          this.toolAutoSelect.emit('cursor');
          return;
        }
      } catch (e) {
        // Not JSON data, continue to file handling
      }
    }
    
    // Handle file drop
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Handle file drop if needed
        this.toolAutoSelect.emit();
      }
    }
  }

  getTokenScreenPosition(token: Token): Point {
    // If this token is being dragged, use the current drag position
    if (this.draggingToken && this.draggingToken.id === token.id && this.dragCurrentPosition()) {
      return this.worldToScreen(this.dragCurrentPosition()!.x, this.dragCurrentPosition()!.y);
    }
    // Otherwise use the token's actual position
    const center = HexMath.hexToPixel(token.position);
    return this.worldToScreen(center.x, center.y);
  }

  getDragDistance(): number {
    if (!this.draggingToken) return 0;
    const start = this.dragStartHex();
    const hover = this.dragHoverHex();
    if (!start || !hover) return 0;
    if (start.q === hover.q && start.r === hover.r) return 0;
    
    if (this.dragMode === 'enforced') {
      const path = this.dragPath();
      return Math.max(0, path.length - 1);
    }
    return HexMath.hexDistance(start, hover);
  }

  getGhostPortraitUrl(): string {
    if (!this.draggingToken?.portrait) return '';
    return this.imageService.getImageUrl(this.draggingToken.portrait) || '';
  }

  onTokenDragStart(token: Token, event: MouseEvent): void {
    // Only allow token interaction when cursor tool is active
    if (this.currentTool !== 'cursor') {
      return;
    }
    this.draggingToken = token;
    this.dragStartHex.set(token.position);
    
    // Set ghost at the token's start position
    const startCenter = HexMath.hexToPixel(token.position);
    this.dragGhostPosition.set(startCenter);
    
    // Set current drag position to start
    this.dragCurrentPosition.set(startCenter);
  }

  onTokenContextMenu(token: Token, event: MouseEvent): void {
    // Context menu is now handled in onContextMenu handler
    // This is just a passthrough
  }

  onRemoveToken(): void {
    const tokenId = this.contextMenuTokenId();
    if (tokenId && confirm('Remove this token from the map?')) {
      this.tokenRemove.emit(tokenId);
    }
    this.showContextMenu.set(false);
  }

  onMoveImageForward(): void {
    const id = this.contextMenuImageId();
    if (id) {
      this.store.moveImageForward(id);
    }
    this.closeContextMenu();
  }

  onMoveImageBackward(): void {
    const id = this.contextMenuImageId();
    if (id) {
      this.store.moveImageBackward(id);
    }
    this.closeContextMenu();
  }

  onMoveImageToFront(): void {
    const id = this.contextMenuImageId();
    console.log('[CONTEXT_MENU] Move to front:', id);
    if (id) {
      this.store.moveImageToFront(id);
      console.log('[CONTEXT_MENU] Called moveImageToFront on store');
    }
    this.closeContextMenu();
  }

  onMoveImageToBack(): void {
    const id = this.contextMenuImageId();
    console.log('[CONTEXT_MENU] Move to back:', id);
    if (id) {
      this.store.moveImageToBack(id);
      console.log('[CONTEXT_MENU] Called moveImageToBack on store');
    }
    this.closeContextMenu();
  }

  onDeleteSelectedImage(): void {
    const id = this.contextMenuImageId();
    if (id) {
      this.store.removeImage(id);
      // Also clear selection if this was the selected image
      if (this.selectedImageId === id) {
        this.imageSelect.emit(null);
      }
    }
    this.closeContextMenu();
  }

  onToggleImageLayer(): void {
    const id = this.contextMenuImageId();
    if (id) {
      this.store.toggleImageLayer(id);
    }
    this.closeContextMenu();
  }

  getImageLayerLabel(): string {
    const id = this.contextMenuImageId();
    if (!id) return 'Toggle Layer';
    
    const image = this.map?.images.find(img => img.id === id);
    const currentLayer = image?.layer || 'background';
    
    return currentLayer === 'background' 
      ? '↑ Move to Foreground' 
      : '↓ Move to Background';
  }

  onCreateQuickToken(): void {
    // Implementation for quick token creation
    const rect = this.contextMenuPos();
    if (rect) {
      const world = this.screenToWorld(rect.x, rect.y);
      const hex = HexMath.pixelToHex(world);
      // Emit event to create token at this hex position
      // This would need to be wired up to the parent component
    }
    this.closeContextMenu();
  }

  private getHexNeighbors(hex: HexCoord): HexCoord[] {
    const directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 }
    ];
    return directions.map(dir => ({
      q: hex.q + dir.q,
      r: hex.r + dir.r
    }));
  }

  private closeContextMenu(): void {
    // Close the context menu by resetting all state
    this.showContextMenu.set(false);
    this.contextMenuPosition.set({ x: 0, y: 0 });
    this.contextMenuImageId.set(null);
    this.contextMenuTokenId.set(null);
    this.contextMenuHex.set(null);
  }

  private contextMenuPos(): Point | null {
    const pos = this.contextMenuPosition();
    return pos.x === 0 && pos.y === 0 ? null : pos;
  }

  private findImagesInBox(start: Point, end: Point): string[] {
    if (!this.map?.images) return [];

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const selectedIds: string[] = [];

    for (const img of this.map.images) {
      // Check if image center is within box
      if (img.x >= minX && img.x <= maxX && img.y >= minY && img.y <= maxY) {
        selectedIds.push(img.id);
      }
    }

    return selectedIds;
  }
}
