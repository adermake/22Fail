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

    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible area with extra padding for edge hexes
    const topLeft = this.screenToWorld(-50, -50);
    const bottomRight = this.screenToWorld(canvas.width / dpr + 50, canvas.height / dpr + 50);

    // Calculate hex bounds with extra margin
    const minQ = Math.floor(topLeft.x / (HexMath.hexWidth * 0.75)) - 3;
    const maxQ = Math.ceil(bottomRight.x / (HexMath.hexWidth * 0.75)) + 3;
    const minR = Math.floor(topLeft.y / HexMath.hexHeight) - 3;
    const maxR = Math.ceil(bottomRight.y / HexMath.hexHeight) + 3;

    // Build lookup sets
    const walls = this.map?.walls || [];
    const wallSet = new Set(walls.map(w => `${w.q},${w.r}`));
    const pathSet = new Set(this.dragPath().map(p => `${p.q},${p.r}`));
    const hoverHex = this.dragHoverHex();

    // Performance: limit hex count when zoomed out - but don't change background
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
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
      ctx.lineWidth = 2;
    } else {
      // Transparent with subtle outline
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
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
      console.warn('[LobbyGrid] Skipping image with missing imageId:', imgData.id);
      return;
    }
    
    const imageUrl = `/api/images/${imgData.imageId}`;
    let image = this.imageCache.get(imageUrl);

    if (!image) {
      image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;
      this.imageCache.set(imageUrl, image);

      image.onload = () => this.scheduleRender();
      image.onerror = (e) => console.error('[LobbyGrid] Image load error:', imgData.id, e);

      if (!image.complete) return;
    }

    // Check for broken image
    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    ctx.save();
    ctx.translate(imgData.x, imgData.y);
    ctx.rotate((imgData.rotation * Math.PI) / 180);

    // Draw image centered
    ctx.drawImage(image, -imgData.width / 2, -imgData.height / 2, imgData.width, imgData.height);

    ctx.restore();

    // Draw selection handles
    if (this.selectedImageId === imgData.id) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.renderMeasurement(ctx);
    this.renderDragPath(ctx);
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
    ctx.fillText(`${distance} hex`, midX, midY - 8);
  }

  private renderDragPath(ctx: CanvasRenderingContext2D): void {
    const path = this.dragPath();
    if (path.length < 2) return;

    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const center = HexMath.hexToPixel(path[i]);
      const screen = this.worldToScreen(center.x, center.y);
      if (i === 0) {
        ctx.moveTo(screen.x, screen.y);
      } else {
        ctx.lineTo(screen.x, screen.y);
      }
    }
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
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

    this.lastMousePos = { x: event.clientX, y: event.clientY };
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
        this.handleDrawUp(event);
        break;
      case 'walls':
        this.handleWallUp(event);
        break;
      case 'measure':
        this.handleMeasureUp(event);
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
    
    // Check if right-clicking on an image
    const clickedImage = this.getImageAtPoint(world);
    if (clickedImage) {
      this.imageSelect.emit(clickedImage.id);
      this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
      this.contextMenuImageId.set(clickedImage.id);
      this.contextMenuHex.set(null);
      this.showContextMenu.set(true);
      return;
    }
    
    // Right-click on empty space - show create token menu
    if (this.currentTool === 'cursor' || this.currentTool === 'image') {
      this.contextMenuPosition.set({ x: event.clientX, y: event.clientY });
      this.contextMenuImageId.set(null);
      this.contextMenuHex.set(hex);
      this.showContextMenu.set(true);
    }
  }

  // ============================================
  // Tool Handlers - Cursor
  // ============================================

  private handleCursorDown(event: MouseEvent, world: Point, hex: HexCoord): void {
    // Check if clicking on an image first (cursor can also select/move images)
    const clickedImage = this.getImageAtPoint(world);
    
    if (clickedImage) {
      this.imageSelect.emit(clickedImage.id);
      
      // Check if clicking on a handle
      const handle = this.getClickedHandle(world, clickedImage);
      if (handle) {
        this.transformingImageId = clickedImage.id;
        this.transformHandle = handle;
        this.transformMode = handle === 'rotate' ? 'rotate' : 'scale';
        this.transformAnchor = world;
        this.initialImageTransform = {
          x: clickedImage.x,
          y: clickedImage.y,
          width: clickedImage.width,
          height: clickedImage.height,
          rotation: clickedImage.rotation,
        };
        return;
      } else {
        // Start move
        this.transformingImageId = clickedImage.id;
        this.transformMode = 'move';
        this.transformAnchor = world;
        this.initialImageTransform = {
          x: clickedImage.x,
          y: clickedImage.y,
          width: clickedImage.width,
          height: clickedImage.height,
          rotation: clickedImage.rotation,
        };
        return;
      }
    } else {
      // Deselect image if clicking on empty space
      if (this.selectedImageId) {
        this.imageSelect.emit(null);
      }
    }
  }

  private handleCursorMove(event: MouseEvent, world: Point, hex: HexCoord): void {
    // Handle image transform in cursor mode
    if (this.transformingImageId && this.transformAnchor && this.initialImageTransform) {
      this.performImageTransform(world);
      return;
    }
    
    if (this.draggingToken) {
      this.dragGhostPosition.set(world);
      this.dragHoverHex.set(hex);
      this.scheduleRender();
    }
  }

  private handleCursorUp(event: MouseEvent, world: Point, hex: HexCoord): void {
    // End image transform
    if (this.transformingImageId) {
      this.transformingImageId = null;
      this.transformAnchor = null;
      this.transformHandle = null;
      this.initialImageTransform = null;
      return;
    }
    
    if (this.draggingToken) {
      this.tokenMove.emit({ tokenId: this.draggingToken.id, position: hex });
      this.draggingToken = null;
      this.dragGhostPosition.set(null);
      this.dragHoverHex.set(null);
      this.dragPath.set([]);
      this.scheduleRender();
    }
  }

  // ============================================
  // Tool Handlers - Draw
  // ============================================

  private handleDrawDown(event: MouseEvent, world: Point): void {
    if (event.button !== 0) return;
    this.isDrawing = true;
    this.currentStrokePoints = [world];
  }

  private handleDrawMove(event: MouseEvent, world: Point): void {
    if (!this.isDrawing) return;
    this.currentStrokePoints.push(world);
    this.renderCurrentStroke();
  }

  private handleDrawUp(event: MouseEvent): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentStrokePoints.length >= 2) {
      this.store.addStroke({
        points: this.currentStrokePoints,
        color: this.brushColor,
        lineWidth: this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize,
        isEraser: this.currentTool === 'erase',
      });
    }

    this.currentStrokePoints = [];
    this.scheduleRender();
  }

  private renderCurrentStroke(): void {
    if (!this.drawCtx || this.currentStrokePoints.length < 2) return;

    const ctx = this.drawCtx;
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    ctx.beginPath();
    ctx.moveTo(this.currentStrokePoints[0].x, this.currentStrokePoints[0].y);
    for (let i = 1; i < this.currentStrokePoints.length; i++) {
      ctx.lineTo(this.currentStrokePoints[i].x, this.currentStrokePoints[i].y);
    }

    ctx.strokeStyle = this.currentTool === 'erase' ? 'rgba(128,128,128,0.5)' : this.brushColor;
    ctx.lineWidth = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.restore();
  }

  // ============================================
  // Tool Handlers - Walls
  // ============================================

  private handleWallDown(event: MouseEvent, hex: HexCoord): void {
    if (!this.isGM || event.button !== 0) return;
    
    this.isWallDrawing = true;
    const exists = (this.map?.walls || []).some(w => w.q === hex.q && w.r === hex.r);
    this.wallPaintMode = exists ? 'remove' : 'add';
    
    this.store.toggleWall(hex);
  }

  private handleWallMove(event: MouseEvent, hex: HexCoord): void {
    if (!this.isWallDrawing) return;

    const exists = (this.map?.walls || []).some(w => w.q === hex.q && w.r === hex.r);
    if (this.wallPaintMode === 'add' && !exists) {
      this.store.addWall(hex);
    } else if (this.wallPaintMode === 'remove' && exists) {
      this.store.removeWall(hex);
    }
  }

  private handleWallUp(event: MouseEvent): void {
    this.isWallDrawing = false;
  }

  // ============================================
  // Tool Handlers - Measure
  // ============================================

  private handleMeasureDown(event: MouseEvent, world: Point, hex: HexCoord): void {
    // Snap to hex center
    const hexCenter = HexMath.hexToPixel(hex);
    this.measureStart.set(hexCenter);
    this.measureEnd.set(hexCenter);
    this.measureDistance.set(0);
    this.dragStartHex.set(hex);
  }

  private handleMeasureMove(event: MouseEvent, world: Point, hex: HexCoord): void {
    if (!this.measureStart()) return;
    
    // Snap to hex center
    const hexCenter = HexMath.hexToPixel(hex);
    this.measureEnd.set(hexCenter);
    
    const startHex = this.dragStartHex();
    if (startHex) {
      this.measureDistance.set(HexMath.hexDistance(startHex, hex));
    }
    this.scheduleRender();
  }

  private handleMeasureUp(event: MouseEvent): void {
    // Clear measurement on mouse up
    this.measureStart.set(null);
    this.measureEnd.set(null);
    this.measureDistance.set(0);
    this.dragStartHex.set(null);
    this.scheduleRender();
  }

  // ============================================
  // Image Transform Helper
  // ============================================

  private performImageTransform(world: Point): void {
    if (!this.transformingImageId || !this.transformAnchor || !this.initialImageTransform) return;

    const dx = world.x - this.transformAnchor.x;
    const dy = world.y - this.transformAnchor.y;

    if (this.transformMode === 'move') {
      this.imageTransform.emit({
        id: this.transformingImageId,
        transform: {
          x: (this.initialImageTransform.x || 0) + dx,
          y: (this.initialImageTransform.y || 0) + dy,
        },
      });
    } else if (this.transformMode === 'scale' && this.transformHandle) {
      // Keep aspect ratio while scaling
      const initialWidth = this.initialImageTransform.width || 200;
      const initialHeight = this.initialImageTransform.height || 200;
      const aspectRatio = initialWidth / initialHeight;
      
      // Use diagonal distance for uniform scaling
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.max(0.1, 1 + distance / 100 * Math.sign(dx + dy));
      const newWidth = Math.max(20, Math.round(initialWidth * scale));
      const newHeight = Math.max(20, Math.round(newWidth / aspectRatio));
      
      this.imageTransform.emit({
        id: this.transformingImageId,
        transform: {
          width: newWidth,
          height: newHeight,
        },
      });
    } else if (this.transformMode === 'rotate') {
      const centerX = this.initialImageTransform.x || 0;
      const centerY = this.initialImageTransform.y || 0;
      const startAngle = Math.atan2(this.transformAnchor.y - centerY, this.transformAnchor.x - centerX);
      const currentAngle = Math.atan2(world.y - centerY, world.x - centerX);
      const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
      
      this.imageTransform.emit({
        id: this.transformingImageId,
        transform: {
          rotation: (this.initialImageTransform.rotation || 0) + deltaAngle,
        },
      });
    }

    this.scheduleRender();
  }

  // ============================================
  // Tool Handlers - Image
  // ============================================

  private handleImageDown(event: MouseEvent, world: Point): void {
    // Check if clicking on an image
    const clickedImage = this.getImageAtPoint(world);
    
    if (clickedImage) {
      this.imageSelect.emit(clickedImage.id);
      
      // Check if clicking on a handle
      const handle = this.getClickedHandle(world, clickedImage);
      if (handle) {
        this.transformingImageId = clickedImage.id;
        this.transformHandle = handle;
        this.transformMode = handle === 'rotate' ? 'rotate' : 'scale';
        this.transformAnchor = world;
        this.initialImageTransform = {
          x: clickedImage.x,
          y: clickedImage.y,
          width: clickedImage.width,
          height: clickedImage.height,
          rotation: clickedImage.rotation,
        };
      } else {
        // Start move
        this.transformingImageId = clickedImage.id;
        this.transformMode = 'move';
        this.transformAnchor = world;
        this.initialImageTransform = {
          x: clickedImage.x,
          y: clickedImage.y,
          width: clickedImage.width,
          height: clickedImage.height,
          rotation: clickedImage.rotation,
        };
      }
    } else {
      // Deselect
      this.imageSelect.emit(null);
    }
  }

  private handleImageMove(event: MouseEvent, world: Point): void {
    this.performImageTransform(world);
  }

  private handleImageUp(event: MouseEvent, world: Point): void {
    this.transformingImageId = null;
    this.transformAnchor = null;
    this.transformHandle = null;
    this.initialImageTransform = null;
  }

  private getImageAtPoint(world: Point): MapImage | null {
    const images = [...(this.map?.images || [])].sort((a, b) => b.zIndex - a.zIndex);
    
    for (const img of images) {
      // Transform point to image space
      const dx = world.x - img.x;
      const dy = world.y - img.y;
      const rad = -(img.rotation * Math.PI) / 180;
      const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

      const hw = img.width / 2;
      const hh = img.height / 2;

      if (localX >= -hw && localX <= hw && localY >= -hh && localY <= hh) {
        return img;
      }
    }
    return null;
  }

  private getClickedHandle(world: Point, img: MapImage): 'tl' | 'tr' | 'bl' | 'br' | 'rotate' | null {
    const dx = world.x - img.x;
    const dy = world.y - img.y;
    const rad = -(img.rotation * Math.PI) / 180;
    const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

    const hw = img.width / 2;
    const hh = img.height / 2;
    const handleSize = 15 / this.scale;

    // Check rotation handle
    const rotY = -hh - 25 / this.scale;
    if (Math.abs(localX) < handleSize && Math.abs(localY - rotY) < handleSize) {
      return 'rotate';
    }

    // Check corner handles
    const corners: { handle: 'tl' | 'tr' | 'bl' | 'br'; x: number; y: number }[] = [
      { handle: 'tl', x: -hw, y: -hh },
      { handle: 'tr', x: hw, y: -hh },
      { handle: 'br', x: hw, y: hh },
      { handle: 'bl', x: -hw, y: hh },
    ];

    for (const c of corners) {
      if (Math.abs(localX - c.x) < handleSize && Math.abs(localY - c.y) < handleSize) {
        return c.handle;
      }
    }

    return null;
  }

  // ============================================
  // Drag and Drop (External - from sidebar)
  // ============================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';

    const rect = this.container.nativeElement.getBoundingClientRect();
    const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    const hex = HexMath.pixelToHex(world);
    this.dragHoverHex.set(hex);
    this.scheduleRender();
  }

  onDragLeave(event: DragEvent): void {
    this.dragHoverHex.set(null);
    this.scheduleRender();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    
    const rect = this.container.nativeElement.getBoundingClientRect();
    const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    const hex = HexMath.pixelToHex(world);

    const data = event.dataTransfer?.getData('text/plain');
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type === 'character') {
        this.tokenDrop.emit({ characterId: parsed.characterId, position: hex });
      } else if (parsed.type === 'library-image') {
        this.placeImage.emit({
          imageId: parsed.imageId,
          x: world.x,
          y: world.y,
          width: parsed.width || 200,
          height: parsed.height || 200,
        });
      }
    } catch (e) {
      console.error('[LobbyGrid] Invalid drop data:', e);
    }

    this.dragHoverHex.set(null);
    this.scheduleRender();
  }

  // ============================================
  // Context Menu Actions
  // ============================================

  closeContextMenu(): void {
    this.showContextMenu.set(false);
    this.contextMenuImageId.set(null);
    this.contextMenuHex.set(null);
  }

  onCreateQuickToken(): void {
    const hex = this.contextMenuHex();
    if (hex) {
      const name = prompt('Token name:');
      if (name) {
        this.quickTokenDrop.emit({ name, portrait: '', position: hex });
      }
    }
    this.closeContextMenu();
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

  // ============================================
  // Token Events (from child component)
  // ============================================

  onTokenDragStart(token: Token, event: MouseEvent): void {
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

  // ============================================
  // Token Positioning Helper
  // ============================================

  getTokenScreenPosition(token: Token): Point {
    const center = HexMath.hexToPixel(token.position);
    return this.worldToScreen(center.x, center.y);
  }
}
