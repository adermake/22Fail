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
  private currentStrokePoints: Point[] = [];
  private lastMousePos: Point = { x: 0, y: 0 };

  // Measurement
  measureStart = signal<Point | null>(null);
  measureEnd = signal<Point | null>(null);
  measureDistance = signal(0);

  // Token dragging
  draggingToken: Token | null = null;
  dragGhostPosition = signal<Point | null>(null);
  dragHoverHex = signal<HexCoord | null>(null);
  dragStartHex = signal<HexCoord | null>(null);
  dragPath = signal<HexCoord[]>([]);

  // Image transform state
  private transformingImageId: string | null = null;
  private transformMode: 'move' | 'scale' | 'rotate' = 'move';
  private transformHandle: 'tl' | 'tr' | 'bl' | 'br' | 'rotate' | null = null;
  private transformAnchor: Point | null = null;
  private initialImageTransform: Partial<MapImage> | null = null;

  // Image selection
  selectedImages = signal<string[]>([]);
  private selectionBox = signal<{ start: Point; end: Point } | null>(null);
  private isBoxSelecting = false;
  private boxSelectionStart: Point | null = null;

  // Context menu
  showContextMenu = signal(false);
  contextMenuPosition = signal<Point>({ x: 0, y: 0 });
  contextMenuImageId = signal<string | null>(null);
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
    if (changes['map'] || changes['tokens']) {
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

    // Set configurable gray background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible area with extra padding for edge hexes
    const topLeft = this.screenToWorld(-50, -50);
    const bottomRight = this.screenToWorld(canvas.width / dpr + 50, canvas.height / dpr + 50);

    // Calculate hex bounds with much larger margin to ensure complete coverage
    const margin = Math.max(5, Math.ceil(10 / this.scale)); // More margin when zoomed out
    const minQ = Math.floor(topLeft.x / (HexMath.hexWidth * 0.75)) - margin;
    const maxQ = Math.ceil(bottomRight.x / (HexMath.hexWidth * 0.75)) + margin;
    const minR = Math.floor(topLeft.y / HexMath.hexHeight) - margin;
    const maxR = Math.ceil(bottomRight.y / HexMath.hexHeight) + margin;

    // Build lookup sets
    const walls = this.map?.walls || [];
    const wallSet = new Set(walls.map(w => `${w.q},${w.r}`));
    const pathSet = new Set(this.dragPath().map(p => `${p.q},${p.r}`));
    const hoverHex = this.dragHoverHex();

    // Performance: limit hex count when zoomed out
    const hexCount = (maxQ - minQ + 1) * (maxR - minR + 1);
    const shouldSimplify = hexCount > 2500 || this.scale < 0.2;

    if (shouldSimplify) {
      // Draw simplified grid lines instead of individual hexes
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.lineWidth = 1;
      
      // Draw vertical lines
      for (let q = minQ; q <= maxQ; q += 4) {
        const x = q * HexMath.hexWidth * 0.75;
        ctx.beginPath();
        ctx.moveTo(x, topLeft.y);
        ctx.lineTo(x, bottomRight.y);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let r = minR; r <= maxR; r += 4) {
        const y = r * HexMath.hexHeight;
        ctx.beginPath();
        ctx.moveTo(topLeft.x, y);
        ctx.lineTo(bottomRight.x, y);
        ctx.stroke();
      }
    } else {
      for (let q = minQ; q <= maxQ; q++) {
        for (let r = minR; r <= maxR; r++) {
          const hexKey = `${q},${r}`;
          const isHover = hoverHex && hoverHex.q === q && hoverHex.r === r;
          const isWall = wallSet.has(hexKey);
          const isInPath = pathSet.has(hexKey);
          this.drawHexagon(ctx, { q, r }, isHover || false, isWall, isInPath);
        }
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
      ctx.lineWidth = 1;
    } else {
      // Transparent with subtle outline
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 0.5;
    }
    ctx.stroke();
  }

  private renderImages(): void {
    if (!this.imageCtx || !this.map) return;

    const canvas = this.imageCanvas.nativeElement;
    const ctx = this.imageCtx;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
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

    ctx.strokeStyle = '#22c55e';
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

    // Check if we right-clicked on an image
    const clickedImage = this.findImageAtPoint(world);
    
    this.showContextMenu.set(true);
    this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
    this.contextMenuImageId.set(clickedImage?.id || null);
    this.contextMenuHex.set(hex);
  }

  // ============================================
  // Tool-specific handlers
  // ============================================

  private handleCursorDown(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (event.button !== 0) return; // Only left click

    // Check for image transform handles first
    if (this.selectedImageId) {
      const selectedImage = this.map?.images?.find(img => img.id === this.selectedImageId);
      if (selectedImage) {
        const handle = this.getTransformHandle(world, selectedImage);
        if (handle) {
          this.startImageTransform(selectedImage, handle, world);
          return;
        }
      }
    }

    // Check for image selection
    const clickedImage = this.findImageAtPoint(world);
    if (clickedImage) {
      this.imageSelect.emit(clickedImage.id);
      return;
    }

    // Check for token
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

    if (this.draggingToken) {
      this.updateTokenDrag(hex);
      return;
    }
  }

  private handleCursorUp(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (this.transformingImageId) {
      this.finishImageTransform();
      return;
    }

    if (this.draggingToken) {
      this.finishTokenDrag(hex);
      return;
    }
  }

  private handleDrawDown(event: MouseEvent, world: Point): void {
    if (event.button !== 0) return;

    this.isDrawing = true;
    this.currentStrokePoints = [world];
  }

  private handleDrawMove(event: MouseEvent, world: Point): void {
    if (!this.isDrawing) return;

    this.currentStrokePoints.push(world);
    
    // Preview the current stroke
    this.renderCurrentStroke(world);
  }

  private handleDrawUp(event: MouseEvent, world: Point): void {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    
    if (this.currentStrokePoints.length > 1) {
      const stroke: Stroke = {
        id: generateId(),
        points: [...this.currentStrokePoints],
        color: this.brushColor,
        lineWidth: this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize,
        isEraser: this.currentTool === 'erase',
      };
      
      this.store.addStroke(stroke);
    }

    this.currentStrokePoints = [];
    this.scheduleRender();
  }

  private handleWallDown(event: MouseEvent, hex: HexCoord): void {
    if (event.button !== 0) return;

    this.isWallDrawing = true;
    const walls = this.map?.walls || [];
    const hexKey = `${hex.q},${hex.r}`;
    const hasWall = walls.some(w => w.q === hex.q && w.r === hex.r);
    
    this.wallPaintMode = hasWall ? 'remove' : 'add';
    this.paintWall(hex);
  }

  private handleWallMove(event: MouseEvent, hex: HexCoord): void {
    if (!this.isWallDrawing) return;
    this.paintWall(hex);
  }

  private handleWallUp(event: MouseEvent, hex: HexCoord): void {
    this.isWallDrawing = false;
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
      this.placeImage.emit({
        imageId: pendingImageId,
        x: world.x,
        y: world.y,
        width: 100,
        height: 100,
      });
      
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
    const handleSize = 10 / this.scale;
    const hw = img.width / 2;
    const hh = img.height / 2;

    // Transform point to image-local coordinates
    const dx = point.x - img.x;
    const dy = point.y - img.y;
    const cos = Math.cos(-img.rotation * Math.PI / 180);
    const sin = Math.sin(-img.rotation * Math.PI / 180);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    // Check rotation handle
    const rotY = -hh - 25 / this.scale;
    if (Math.abs(localX) < 6 / this.scale && Math.abs(localY - rotY) < 6 / this.scale) {
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
      if (Math.abs(localX - corner.x) < handleSize / 2 && Math.abs(localY - corner.y) < handleSize / 2) {
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

  private startTokenDrag(token: Token, hex: HexCoord): void {
    this.draggingToken = token;
    this.dragStartHex.set(hex);
    this.dragHoverHex.set(hex);
    this.dragPath.set([]); // No path visualization for free movement
  }

  private updateTokenDrag(hex: HexCoord): void {
    if (!this.draggingToken) return;

    this.dragHoverHex.set(hex);
    // Free movement - no pathfinding, no path visualization
    this.dragPath.set([]);

    this.scheduleRender();
  }

  private finishTokenDrag(hex: HexCoord): void {
    if (!this.draggingToken) return;

    const startHex = this.dragStartHex();
    if (startHex && (startHex.q !== hex.q || startHex.r !== hex.r)) {
      this.tokenMove.emit({
        tokenId: this.draggingToken.id,
        position: hex,
      });
    }

    this.draggingToken = null;
    this.dragStartHex.set(null);
    this.dragHoverHex.set(null);
    this.dragPath.set([]);
    this.scheduleRender();
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

    const img = this.map?.images?.find(i => i.id === this.transformingImageId);
    if (!img) return;

    const dx = point.x - this.transformAnchor.x;
    const dy = point.y - this.transformAnchor.y;

    let transform: Partial<MapImage> = {};

    switch (this.transformHandle) {
      case 'rotate':
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        transform.rotation = this.initialImageTransform.rotation! + angle;
        break;
      case 'tl':
      case 'tr':
      case 'bl':
      case 'br':
        // Scale based on corner dragging
        const scale = Math.max(0.1, 1 + (Math.abs(dx) + Math.abs(dy)) / 100);
        transform.width = this.initialImageTransform.width! * scale;
        transform.height = this.initialImageTransform.height! * scale;
        break;
    }

    this.imageTransform.emit({ id: this.transformingImageId, transform });
  }

  private finishImageTransform(): void {
    this.transformingImageId = null;
    this.transformHandle = null;
    this.transformAnchor = null;
    this.initialImageTransform = null;
  }

  private paintWall(hex: HexCoord): void {
    const walls = this.map?.walls || [];
    const hasWall = walls.some(w => w.q === hex.q && w.r === hex.r);

    if (this.wallPaintMode === 'add' && !hasWall) {
      this.store.addWall(hex);
    } else if (this.wallPaintMode === 'remove' && hasWall) {
      this.store.removeWall(hex);
    }

    this.scheduleRender();
  }

  private renderCurrentStroke(currentPoint: Point): void {
    if (!this.overlayCtx || this.currentStrokePoints.length === 0) return;

    const canvas = this.overlayCanvas.nativeElement;
    const ctx = this.overlayCtx;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Draw current stroke preview (skip preview for eraser)
    if (this.currentStrokePoints.length > 0 && this.currentTool !== 'erase') {
      ctx.beginPath();
      ctx.moveTo(this.currentStrokePoints[0].x, this.currentStrokePoints[0].y);
      
      for (let i = 1; i < this.currentStrokePoints.length; i++) {
        ctx.lineTo(this.currentStrokePoints[i].x, this.currentStrokePoints[i].y);
      }
      
      ctx.lineTo(currentPoint.x, currentPoint.y);
      
      ctx.strokeStyle = this.brushColor;
      ctx.lineWidth = this.penBrushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.restore();
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
    
    // Handle library image drop
    const dataString = event.dataTransfer?.getData('text/plain');
    if (dataString) {
      try {
        const data = JSON.parse(dataString);
        if (data.type === 'library-image') {
          // Get drop position
          const rect = this.container.nativeElement.getBoundingClientRect();
          const screenX = event.clientX - rect.left;
          const screenY = event.clientY - rect.top;
          const world = this.screenToWorld(screenX, screenY);
          
          // Emit image placement event
          this.placeImage.emit({
            imageId: data.imageId,
            x: world.x,
            y: world.y,
            width: data.width || 100,
            height: data.height || 100
          });
          
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
    const center = HexMath.hexToPixel(token.position);
    return this.worldToScreen(center.x, center.y);
  }

  onTokenDragStart(token: Token, event: MouseEvent): void {
    // Only allow token interaction when cursor tool is active
    if (this.currentTool !== 'cursor') {
      return;
    }
    this.draggingToken = token;
    this.dragStartHex.set(token.position);
    const rect = this.container.nativeElement.getBoundingClientRect();
    const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    this.dragGhostPosition.set(world);
  }

  onTokenContextMenu(token: Token, event: MouseEvent): void {
    event.preventDefault();
    if (confirm(`Remove ${token.name} from the map?`)) {
      this.tokenRemove.emit(token.id);
    }
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
