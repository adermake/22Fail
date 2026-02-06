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
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyMap, Token, Stroke, MapImage, HexCoord, HexMath, Point, generateId } from '../../model/lobby.model';
import { LobbyStoreService } from '../../services/lobby-store.service';
import { ImageService } from '../../services/image.service';
import { LobbyTokenComponent } from '../lobby-token/lobby-token.component';
import { ToolType, DragMode } from '../lobby.component';

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
  @Input() drawWithWalls = false;
  @Input() dragMode: DragMode = 'free';
  @Input() drawLayerVisible = true;
  @Input() imageLayerVisible = true;
  @Input() selectedImageId: string | null = null;
  @Input() isGM = false;

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

  // Services
  private store = inject(LobbyStoreService);
  private imageService = inject(ImageService);
  private cdr = inject(ChangeDetectorRef);

  // Canvas contexts
  private gridCtx: CanvasRenderingContext2D | null = null;
  private imageCtx: CanvasRenderingContext2D | null = null;
  private drawCtx: CanvasRenderingContext2D | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  // Image cache
  private imageCache = new Map<string, HTMLImageElement>();

  // Render optimization
  private renderPending = false;
  private resizeObserver: ResizeObserver | null = null;

  // Pan and zoom
  panX = 0;
  panY = 0;
  scale = 1;

  // Interaction state
  private isPanning = false;
  private isDrawing = false;
  private isWallDrawing = false;
  private wallPaintMode: 'add' | 'remove' = 'add';
  private pendingWallChanges: { hex: HexCoord; action: 'add' | 'remove' }[] = []; // Batch wall changes
  private currentStrokePoints: Point[] = [];
  private lastMousePos: Point = { x: 0, y: 0 };
  private erasedStrokeIds = new Set<string>(); // Track strokes erased during current drag
  private isAdjustingBrushSize = false; // Shift+drag to adjust brush size
  private brushSizeAdjustStart: { x: number; y: number; initialSize: number } | null = null;

  // Measurement
  measureStart = signal<Point | null>(null);
  measureEnd = signal<Point | null>(null);
  measureDistance = signal(0);

  // Token dragging
  draggingToken: Token | null = null;
  dragGhostPosition = signal<Point | null>(null);
  dragCurrentPosition = signal<Point | null>(null); // Current position of dragged token in world coords
  dragHoverHex = signal<HexCoord | null>(null);
  dragStartHex = signal<HexCoord | null>(null);
  dragPath = signal<HexCoord[]>([]);
  dragWaypoints = signal<HexCoord[]>([]); // Waypoints for enforced mode
  dragPathExceedsSpeed = signal<boolean>(false); // Is the path too long?
  private pathfindingCache = new Map<string, HexCoord[]>(); // Cache for pathfinding results

  // Image transform state
  private transformingImageId: string | null = null;
  private transformMode: 'move' | 'scale' | 'rotate' = 'move';
  private transformHandle: 'tl' | 'tr' | 'bl' | 'br' | 'rotate' | null = null;
  private transformAnchor: Point | null = null;
  private initialImageTransform: Partial<MapImage> | null = null;
  private draggingImageId: string | null = null; // For image dragging
  private imageDragStart: Point | null = null;

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

  // Ctrl+Z for undo
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.store.undoStroke();
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['map'] || changes['tokens'] || changes['selectedImageId']) {
      this.scheduleRender();
    }
    if (changes['drawLayerVisible']) {
      this.updateLayerVisibility();
    }
    if (changes['imageLayerVisible']) {
      this.updateLayerVisibility();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // ============================================
  // Canvas Setup
  // ============================================

  private initCanvases(): void {
    const canvases = [
      { el: this.gridCanvas?.nativeElement, name: 'grid' },
      { el: this.imageCanvas?.nativeElement, name: 'image' },
      { el: this.drawCanvas?.nativeElement, name: 'draw' },
      { el: this.overlayCanvas?.nativeElement, name: 'overlay' },
    ];

    for (const { el, name } of canvases) {
      if (el) {
        const ctx = el.getContext('2d');
        if (name === 'grid') this.gridCtx = ctx;
        if (name === 'image') this.imageCtx = ctx;
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
      [this.gridCanvas, this.imageCanvas, this.drawCanvas, this.overlayCanvas].forEach(ref => {
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
    this.renderGrid();
    this.renderImages();
    this.renderStrokes();
    this.renderOverlay();
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

    // Performance: skip grid lines when zoomed way out but always render walls
    const hexCount = (maxQ - minQ + 1) * (maxR - minR + 1);
    const shouldSkipGrid = hexCount > 3000 || this.scale < 0.2; // Made grid visible from further (was 0.3)

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
        
        this.drawHexagon(ctx, { q, r }, isHover || false, isWall, isInPath);
      }
    }

    ctx.restore();
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, hex: HexCoord, isHover: boolean, isWall: boolean, isInPath: boolean): void {
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
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2;
    } else if (isWall) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.3)'; // Dark gray wall fill
      ctx.fill();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)'; // Dark gray wall border
      ctx.lineWidth = Math.max(0.8, 1 / this.scale); // Scale wall lines with zoom
    } else {
      // More prominent grid outline - scale with zoom
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = Math.max(0.5, 1 / this.scale); // Scale grid lines inversely with zoom
    }
    ctx.stroke();
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

    // Sort by zIndex
    const images = [...(this.map.images || [])].sort((a, b) => a.zIndex - b.zIndex);

    for (const img of images) {
      this.renderImage(ctx, img);
    }

    ctx.restore();
  }

  private renderImage(ctx: CanvasRenderingContext2D, imgData: MapImage): void {
    // Skip if imageId is missing or undefined
    if (!imgData.imageId) {
      return; // Silent skip
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
    ctx.translate(imgData.x, imgData.y);
    ctx.rotate((imgData.rotation * Math.PI) / 180);

    // Draw image centered
    ctx.drawImage(image, -imgData.width / 2, -imgData.height / 2, imgData.width, imgData.height);

    ctx.restore();

    // Draw selection handles (for single selected or multiple selected images)
    const selectedIds = this.selectedImages();
    if (this.selectedImageId === imgData.id || selectedIds.includes(imgData.id)) {
      this.renderImageHandles(ctx, imgData);
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

  private renderStrokes(): void {
    if (!this.drawCtx || !this.map) return;

    const canvas = this.drawCanvas.nativeElement;
    const ctx = this.drawCtx;
    const dpr = window.devicePixelRatio || 1;

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
      const isEraser = this.currentTool === 'erase';
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
  }

  private renderMeasurement(ctx: CanvasRenderingContext2D): void {
    const start = this.measureStart();
    const end = this.measureEnd();
    if (!start || !end) return;

    const startScreen = this.worldToScreen(start.x, start.y);
    const endScreen = this.worldToScreen(end.x, end.y);

    // Line
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.lineTo(endScreen.x, endScreen.y);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Endpoints
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(startScreen.x, startScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endScreen.x, endScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();

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

    // Red if exceeds speed, green otherwise
    ctx.strokeStyle = this.dragPathExceedsSpeed() ? '#ef4444' : '#22c55e';
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

  // ============================================
  // Mouse Event Handlers
  // ============================================

  onMouseDown(event: MouseEvent): void {
    if (event.button === 1) {
      // Middle mouse - pan
      event.preventDefault();
      this.isPanning = true;
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      return;
    }

    // Left-click closes context menu
    if (event.button === 0) {
      this.showContextMenu.set(false);
      this.contextMenuPosition.set({ x: 0, y: 0 });
      this.contextMenuImageId.set(null);
      this.contextMenuTokenId.set(null);
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
    }
  }

  onMouseMove(event: MouseEvent): void {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const world = this.screenToWorld(screenX, screenY);
    const hex = HexMath.pixelToHex(world);

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
    }
  }

  onMouseUp(event: MouseEvent): void {
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
  // Tool-specific handlers
  // ============================================

  private handleCursorDown(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (event.button !== 0) return; // Only left click

    // Check for transform handles on selected image FIRST
    // Handles extend outside image bounds (rotation handle is above, corners overshoot)
    // so we must check them independently of findImageAtPoint
    if (this.selectedImageId) {
      const selectedImage = this.map?.images?.find(img => img.id === this.selectedImageId);
      if (selectedImage) {
        const handle = this.getTransformHandle(world, selectedImage);
        if (handle) {
          this.startImageTransform(selectedImage, handle, world);
          return;
        }
        // Click on selected image body = start drag
        if (this.isPointInImage(world, selectedImage)) {
          this.startImageDrag(selectedImage, world);
          return;
        }
      }
    }

    // Check if clicking on any other image
    const clickedImage = this.findImageAtPoint(world);
    if (clickedImage) {
      this.imageSelect.emit(clickedImage.id);
      return;
    }

    // Check for token (only if no image clicked)
    const token = this.findTokenAtHex(hex);
    if (token) {
      this.startTokenDrag(token, hex);
      return;
    }

    // Clear selection
    this.imageSelect.emit(null);
  }

  private handleCursorMove(event: MouseEvent, world: Point, hex: HexCoord): void {
    // Update cursor style based on what's under the mouse
    this.updateCursor(world);

    if (this.transformingImageId && this.transformHandle) {
      this.updateImageTransform(world);
      return;
    }

    if (this.draggingImageId) {
      this.updateImageDrag(world);
      return;
    }

    if (this.draggingToken) {
      this.updateTokenDrag(world);
      return;
    }
  }

  private handleCursorUp(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (this.transformingImageId) {
      this.finishImageTransform();
      return;
    }

    if (this.draggingImageId) {
      this.finishImageDrag();
      return;
    }

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
      const initialSize = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
      this.brushSizeAdjustStart = { x: event.clientX, y: event.clientY, initialSize };
      return;
    }

    this.isDrawing = true;
    this.currentStrokePoints = [world];
    
    // Reset erased strokes tracking when starting new eraser stroke
    if (this.currentTool === 'erase') {
      this.erasedStrokeIds.clear();
    }
  }

  private handleDrawMove(event: MouseEvent, world: Point): void {
    // Shift+drag = adjust brush size
    if (this.isAdjustingBrushSize && this.brushSizeAdjustStart) {
      const dx = event.clientX - this.brushSizeAdjustStart.x;
      const newSize = Math.max(1, Math.min(50, this.brushSizeAdjustStart.initialSize + dx * 0.2));
      
      if (this.currentTool === 'erase') {
        this.eraserBrushSize = Math.round(newSize);
      } else {
        this.penBrushSize = Math.round(newSize);
      }
      return;
    }

    if (!this.isDrawing) return;

    this.currentStrokePoints.push(world);
    
    // For both pen and eraser, preview the current stroke immediately
    this.scheduleRender();
  }

  private handleDrawUp(event: MouseEvent, world: Point): void {
    // End brush size adjustment
    if (this.isAdjustingBrushSize) {
      this.isAdjustingBrushSize = false;
      this.brushSizeAdjustStart = null;
      return;
    }

    if (!this.isDrawing) return;

    this.isDrawing = false;
    
    // Create stroke (for both pen and eraser)
    if (this.currentStrokePoints.length > 1) {
      const stroke: Stroke = {
        id: generateId(),
        points: [...this.currentStrokePoints],
        color: this.currentTool === 'erase' ? '#FFFFFF' : this.brushColor,
        lineWidth: this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize,
        isEraser: this.currentTool === 'erase',
      };
      
      this.store.addStroke(stroke);
    }

    this.currentStrokePoints = [];
    this.erasedStrokeIds.clear();
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

    // Auto-place image when in image tool mode
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
      // If clicking on already selected image, don't start box selection
      if (this.selectedImages().includes(clickedImage.id)) {
        return;
      }
      // Select single image
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
    if (this.isBoxSelecting && this.boxSelectionStart) {
      // Update selection box
      this.selectionBox.set({ start: this.boxSelectionStart, end: world });
      this.scheduleRender();
    }
  }

  private handleImageUp(event: MouseEvent, world: Point): void {
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

    if (this.selectedImageId) {
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

    if (!this.selectedImageId) {
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
    
    // No path found - return straight line to target
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
    
    // In enforced mode, if path exceeds speed, snap back to start
    if (this.dragMode === 'enforced' && this.dragPathExceedsSpeed()) {
      // Don't move - just cancel
      this.draggingToken = null;
      this.dragStartHex.set(null);
      this.dragHoverHex.set(null);
      this.dragPath.set([]);
      this.dragWaypoints.set([]);
      this.dragPathExceedsSpeed.set(false);
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

    this.imageTransform.emit({ id: this.draggingImageId, transform });
    this.scheduleRender();
  }

  private finishImageDrag(): void {
    this.draggingImageId = null;
    this.imageDragStart = null;
    this.initialImageTransform = null;
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

    this.imageTransform.emit({ id: this.transformingImageId, transform });
    this.scheduleRender();
  }

  private finishImageTransform(): void {
    this.transformingImageId = null;
    this.transformHandle = null;
    this.transformAnchor = null;
    this.initialImageTransform = null;
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
          
          // Auto-select image tool
          this.toolAutoSelect.emit();
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
    if (id) {
      this.store.moveImageToFront(id);
    }
    this.closeContextMenu();
  }

  onMoveImageToBack(): void {
    const id = this.contextMenuImageId();
    if (id) {
      this.store.moveImageToBack(id);
    }
    this.closeContextMenu();
  }

  onDeleteSelectedImage(): void {
    const id = this.contextMenuImageId();
    if (id) {
      this.imageDelete.emit(id);
    }
    this.closeContextMenu();
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
    // Close the context menu by resetting the position
    this.contextMenuPosition.set({ x: 0, y: 0 });
    this.contextMenuImageId.set(null);
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
