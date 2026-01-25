import { 
  Component, Input, Output, EventEmitter, ElementRef, ViewChild, 
  AfterViewInit, OnChanges, SimpleChanges, inject, signal, HostListener, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattlemapData, BattlemapToken, BattlemapStroke, HexCoord, HexMath, WallHex, MeasurementLine, generateId } from '../../model/battlemap.model';
import { BattleMapStoreService } from '../../services/battlemap-store.service';
import { ComfyUIService } from '../../services/comfyui.service';
import { BattlemapTokenComponent } from '../battlemap-token/battlemap-token.component';

type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure' | 'ai-draw';
type DragMode = 'free' | 'enforced';

@Component({
  selector: 'app-battlemap-grid',
  standalone: true,
  imports: [CommonModule, BattlemapTokenComponent],
  templateUrl: './battlemap-grid.component.html',
  styleUrl: './battlemap-grid.component.css',
})
export class BattlemapGridComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('gridCanvas') gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas') drawCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('aiCanvas') aiCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  @Input() battleMap: BattlemapData | null = null;
  @Input() currentTool: ToolType = 'cursor';
  @Input() brushColor = '#ef4444';
  @Input() penBrushSize = 4;
  @Input() eraserBrushSize = 12;

  // Handle Ctrl+Z for undo
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      this.store.undoStroke();
    }
  }
  @Input() drawWithWalls = false;
  @Input() dragMode: DragMode = 'free';
  @Input() currentTurnCharacterId: string | null = null;
  @Input() battleParticipants: { characterId: string; team?: string }[] = [];
  @Input() drawLayerVisible = true;
  @Input() aiLayerVisible = true;
  @Input() aiDrawColor = '#22c55e'; // Default AI draw color (forest green)

  @Output() tokenDrop = new EventEmitter<{ characterId: string; position: HexCoord }>();
  @Output() tokenMove = new EventEmitter<{ tokenId: string; position: HexCoord }>();
  @Output() tokenRemove = new EventEmitter<string>();
  @Output() quickTokenDrop = new EventEmitter<{ name: string; portrait: string; position: HexCoord }>();
  @Output() brushSizeChange = new EventEmitter<number>(); // For shift+drag brush resize

  private store = inject(BattleMapStoreService);
  comfyUI = inject(ComfyUIService);

  // Canvas contexts
  private gridCtx: CanvasRenderingContext2D | null = null;
  private drawCtx: CanvasRenderingContext2D | null = null;
  private aiCtx: CanvasRenderingContext2D | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  // AI layer state
  // Removed - legacy single image tracking
  // Now using tile-based aiCanvas system
  aiLayerOpacity = signal<number>(0.7);

  // Pan and zoom state
  panX = 0;
  panY = 0;
  scale = 1;

  // Interaction state
  private isPanning = false;
  private isDrawing = false;
  private isWallDrawing = false;
  private wallPaintMode: 'add' | 'remove' = 'add'; // Track whether we're adding or removing walls
  private wallPaintedHexes = new Set<string>(); // Track hexes painted in current stroke
  private lastMouseX = 0;
  private lastMouseY = 0;
  private currentStrokePoints: { x: number; y: number }[] = [];
  private currentStrokeHexes = new Set<string>(); // Track hex keys for wall placement during draw
  private lastDrawTime = 0;
  private drawThrottle = 16; // ~60fps

  // Brush resize state (Krita-style shift+drag)
  private isResizingBrush = false;
  private brushResizeStartX = 0;
  private brushResizeStartSize = 0;
  brushResizePreview = signal<{ x: number; y: number; size: number } | null>(null);

  // Measurement
  measureStart = signal<{ x: number; y: number } | null>(null);
  measureEnd = signal<{ x: number; y: number } | null>(null);
  measureDistance = signal<number>(0);

  // Token dragging state (custom mouse-based, not native drag)
  draggingToken: BattlemapToken | null = null;
  dragGhostPosition = signal<{ x: number; y: number } | null>(null);
  dragHoverHex = signal<HexCoord | null>(null);
  dragPath = signal<HexCoord[]>([]); // Path for enforced movement visualization (last segment only)
  dragFullPath = signal<HexCoord[]>([]); // Complete path from start through all waypoints to current
  dragWaypoints = signal<HexCoord[]>([]); // Fixed waypoints set by right-click
  dragStartHex = signal<HexCoord | null>(null); // Starting hex for movement distance calc
  dragPathInvalid = signal<boolean>(false); // True if path is blocked or exceeds movement

  // Drag over from character list (native HTML drag for new tokens only)
  private dragOverHex: HexCoord | null = null;
  isExternalDragActive = false; // Flag to disable token pointer-events during external drag

  // Context menu state
  showContextMenu = signal<boolean>(false);
  contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  contextMenuHex = signal<HexCoord | null>(null);

  ngAfterViewInit() {
    this.initCanvases();
    this.centerView();
    this.render();
    this.setupResizeObserver();
    // Check ComfyUI availability on init
    this.comfyUI.checkAvailability();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['battleMap'] && this.gridCtx) {
      this.render();
      // Load persisted AI layer image if available
      this.loadPersistedAiLayer();
    }
    // React to layer visibility changes
    if (changes['drawLayerVisible'] || changes['aiLayerVisible']) {
      this.updateLayerVisibility();
    }
  }

  /**
   * Update canvas visibility based on layer toggle states
   */
  private updateLayerVisibility() {
    if (this.drawCanvas?.nativeElement) {
      this.drawCanvas.nativeElement.style.opacity = this.drawLayerVisible ? '1' : '0';
    }
    if (this.aiCanvas?.nativeElement) {
      this.aiCanvas.nativeElement.style.opacity = this.aiLayerVisible ? '1' : '0';
    }
  }

  /**
   * Load AI layer image from persisted battlemap data
   * Preload tile images for faster rendering
   */
  private loadPersistedAiLayer() {
    const tiles = this.battleMap?.aiCanvas?.tiles || [];
    console.log('[Grid] Loading persisted tiles:', tiles.length);
    // Preload all tile images
    for (const tile of tiles) {
      if (!tile.image) continue;
      if (!(tile as any).__imageElement) {
        const img = new Image();
        img.src = tile.image;
        img.onload = () => this.render(); // Re-render when image loads
        (tile as any).__imageElement = img;
      }
    }
  }

  private initCanvases() {
    const gridEl = this.gridCanvas?.nativeElement;
    const drawEl = this.drawCanvas?.nativeElement;
    const aiEl = this.aiCanvas?.nativeElement;
    const overlayEl = this.overlayCanvas?.nativeElement;
    
    if (gridEl) {
      this.gridCtx = gridEl.getContext('2d');
      this.resizeCanvas(gridEl);
    }
    if (drawEl) {
      this.drawCtx = drawEl.getContext('2d');
      this.resizeCanvas(drawEl);
    }
    if (aiEl) {
      this.aiCtx = aiEl.getContext('2d');
      this.resizeCanvas(aiEl);
    }
    if (overlayEl) {
      this.overlayCtx = overlayEl.getContext('2d');
      this.resizeCanvas(overlayEl);
    }
  }

  private resizeCanvas(canvas: HTMLCanvasElement) {
    const container = this.container?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  private setupResizeObserver() {
    const container = this.container?.nativeElement;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const gridEl = this.gridCanvas?.nativeElement;
      const drawEl = this.drawCanvas?.nativeElement;
      const aiEl = this.aiCanvas?.nativeElement;
      const overlayEl = this.overlayCanvas?.nativeElement;
      if (gridEl) this.resizeCanvas(gridEl);
      if (drawEl) this.resizeCanvas(drawEl);
      if (aiEl) this.resizeCanvas(aiEl);
      if (overlayEl) this.resizeCanvas(overlayEl);
      this.render();
    });
    observer.observe(container);
  }

  private centerView() {
    const container = this.container?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    this.panX = rect.width / 2;
    this.panY = rect.height / 2;
  }

  // Convert screen coordinates to world coordinates
  private screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.panX) / this.scale,
      y: (screenY - this.panY) / this.scale,
    };
  }

  // Convert world coordinates to screen coordinates
  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.scale + this.panX,
      y: worldY * this.scale + this.panY,
    };
  }

  // Main render function
  render() {
    this.renderGrid();
    this.renderStrokes();
    this.renderAiLayer();
    this.renderOverlay();
  }

  private renderGrid() {
    if (!this.gridCtx || !this.battleMap) return;

    const canvas = this.gridCanvas.nativeElement;
    const ctx = this.gridCtx;
    const dpr = window.devicePixelRatio || 1;
    
    // Clear using logical size
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Calculate visible area in world coordinates
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(canvas.width / dpr, canvas.height / dpr);
    
    // Use the helper to get proper hex bounds
    const bounds = HexMath.getVisibleHexBounds(
      topLeft.x, bottomRight.x,
      topLeft.y, bottomRight.y
    );
    
    // Get current hover hex for highlighting
    const hoverHex = this.dragHoverHex() || this.dragOverHex;
    
    // Build wall set for quick lookup
    const wallSet = new Set(this.battleMap.walls?.map(w => `${w.q},${w.r}`) || []);
    
    // Build path set for quick lookup - use full path for complete highlighting
    const fullPath = this.dragFullPath();
    const pathSet = new Set(fullPath.map(p => `${p.q},${p.r}`));
    
    // Render visible hexes
    for (let q = bounds.minQ; q <= bounds.maxQ; q++) {
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        const hex = { q, r };
        const isHover = hoverHex && hoverHex.q === q && hoverHex.r === r;
        const hexKey = `${q},${r}`;
        const isWall = wallSet.has(hexKey);
        const isInPath = pathSet.has(hexKey);
        this.drawHexagon(ctx, hex, isHover || false, isWall, isInPath);
      }
    }

    ctx.restore();
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, hex: HexCoord, isHover: boolean, isWall: boolean, isInPath: boolean) {
    const center = HexMath.hexToPixel(hex);
    const corners = HexMath.getHexCorners(center);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    // Fill with appropriate color
    if (isHover) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 1)';
      ctx.lineWidth = 3;
    } else if (isInPath) {
      // Path hexes are highlighted green
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2;
    } else if (isWall) {
      // Wall hexes are subtly darker with a border pattern
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
    } else {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = 1;
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
  }

  private renderStrokes() {
    if (!this.drawCtx || !this.battleMap) return;

    const canvas = this.drawCanvas.nativeElement;
    const ctx = this.drawCtx;
    const dpr = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Render all strokes
    for (const stroke of this.battleMap.strokes) {
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

    // Also render AI strokes on the draw canvas (as a preview overlay)
    this.renderAiStrokes(ctx);
  }

  /**
   * Render AI strokes as a semi-transparent overlay on the draw canvas
   */
  private renderAiStrokes(ctx: CanvasRenderingContext2D) {
    if (!this.battleMap?.aiStrokes || this.battleMap.aiStrokes.length === 0) return;

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Render AI strokes with slight transparency and a distinctive style
    for (const stroke of this.battleMap.aiStrokes) {
      if (stroke.points.length < 2) continue;
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = 1.0; // Full opacity - regions should be solid
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private renderAiLayer() {
    if (!this.aiCtx) return;

    const canvas = this.aiCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = this.aiCtx;
    const dpr = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    // Render all AI canvas tiles
    const tiles = this.battleMap?.aiCanvas?.tiles || [];
    if (tiles.length === 0) return;

    ctx.save();
    ctx.globalAlpha = this.aiLayerOpacity();
    ctx.globalCompositeOperation = 'source-over'; // Respect alpha channel for transparency
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);
    
    // Calculate visible world bounds for viewport culling
    const container = this.container?.nativeElement;
    if (!container) {
      ctx.restore();
      return;
    }
    
    const rect = container.getBoundingClientRect();
    const viewportMinX = -this.panX / this.scale;
    const viewportMinY = -this.panY / this.scale;
    const viewportMaxX = viewportMinX + rect.width / this.scale;
    const viewportMaxY = viewportMinY + rect.height / this.scale;
    
    // Draw each tile (only if visible in viewport for performance)
    let renderedCount = 0;
    for (const tile of tiles) {
      const bounds = tile.worldBounds;
      
      // Viewport culling: skip tiles outside visible area
      if (bounds.maxX < viewportMinX || bounds.minX > viewportMaxX ||
          bounds.maxY < viewportMinY || bounds.minY > viewportMaxY) {
        continue;
      }
      
      // Load and draw tile
      if (!tile.image) continue;
      
      // Create image element if not cached
      let img = (tile as any).__imageElement as HTMLImageElement;
      if (!img) {
        img = new Image();
        img.src = tile.image;
        (tile as any).__imageElement = img;
      }
      
      // Only draw if image is loaded
      if (img.complete) {
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        
        ctx.drawImage(
          img,
          bounds.minX,
          bounds.minY,
          width,
          height
        );
        renderedCount++;
      }
    }
    
    ctx.restore();
  }

  /**
   * Apply region-based cutoff mask - only keep pixels where strokes were painted
   */
  private async applyRegionCutoffMask(
    imageBlob: Blob,
    aiStrokes: BattlemapStroke[],
    worldBounds: { minX: number; minY: number; maxX: number; maxY: number }
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        
        // Draw the generated image
        ctx.drawImage(img, 0, 0);
        
        // Create region mask from strokes
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;
        
        // Calculate transform
        const worldWidth = worldBounds.maxX - worldBounds.minX;
        const worldHeight = worldBounds.maxY - worldBounds.minY;
        const scaleX = img.width / worldWidth;
        const scaleY = img.height / worldHeight;
        
        // Draw stroke regions on mask (black background, white strokes)
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, img.width, img.height);
        
        for (const stroke of aiStrokes) {
          if (stroke.points.length < 2) continue;
          
          maskCtx.beginPath();
          const firstPoint = stroke.points[0];
          maskCtx.moveTo(
            (firstPoint.x - worldBounds.minX) * scaleX,
            (firstPoint.y - worldBounds.minY) * scaleY
          );
          
          for (let i = 1; i < stroke.points.length; i++) {
            const point = stroke.points[i];
            maskCtx.lineTo(
              (point.x - worldBounds.minX) * scaleX,
              (point.y - worldBounds.minY) * scaleY
            );
          }
          
          maskCtx.strokeStyle = 'white';
          maskCtx.lineWidth = stroke.lineWidth * scaleX * 8; // Generous expansion
          maskCtx.lineCap = 'round';
          maskCtx.lineJoin = 'round';
          maskCtx.stroke();
        }
        
        // Simple binary cutoff based on stroke regions
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          const isInRegion = maskData.data[i] > 128; // White in mask
          if (!isInRegion) {
            imageData.data[i + 3] = 0; // Fully transparent outside regions
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create masked blob'));
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load generated image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Convert a Blob to base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Clear the AI layer
   */
  clearAiLayer() {
    if (this.aiCtx) {
      const canvas = this.aiCanvas?.nativeElement;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        this.aiCtx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
    // Clear from store (clears all tiles)
    this.store.clearAiCanvas();
  }

  /**
   * Generate AI image from AI strokes using regional prompting
   * Each color in the AI strokes gets its own prompt from the color-prompt mappings
   */
  async generateFromAiStrokes() {
    if (!this.battleMap || !this.comfyUI.isAvailable()) {
      console.warn('[Grid] Cannot generate: no battlemap or ComfyUI unavailable');
      return;
    }

    const aiStrokes = this.battleMap.aiStrokes || [];
    if (aiStrokes.length === 0) {
      console.warn('[Grid] No AI strokes to generate from');
      return;
    }

    const colorPrompts = this.battleMap.aiColorPrompts || [];
    if (colorPrompts.length === 0) {
      console.warn('[Grid] No color prompts defined');
      return;
    }

    console.log('[Grid] Generating from AI strokes with regional prompting...');
    console.log('[Grid] Using', colorPrompts.length, 'color prompts for', aiStrokes.length, 'strokes');

    // Calculate tight bounding box around all AI strokes in world coordinates
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const stroke of aiStrokes) {
      for (const point of stroke.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
    }

    // Add padding (10% on each side)
    const paddingX = (maxX - minX) * 0.1;
    const paddingY = (maxY - minY) * 0.1;
    minX -= paddingX;
    minY -= paddingY;
    maxX += paddingX;
    maxY += paddingY;

    const worldBounds = { minX, minY, maxX, maxY };
    console.log('[Grid] World bounds:', worldBounds);

    // Get prompts from battlemap settings
    const basePrompt = this.battleMap.aiPrompt || '';
    const generalRegionPrompt = this.battleMap.aiSettings?.generalRegionPrompt || 'detailed, high quality';
    const negativePrompt = this.battleMap.aiSettings?.negativePrompt || 'blurry, low quality, distorted, text, watermark, ugly';
    const gridScale = this.battleMap.aiSettings?.gridScale || 5; // feet per grid square

    // Calculate physical dimensions for scale reference
    const widthInSquares = (maxX - minX) / HexMath.WIDTH;
    const heightInSquares = (maxY - minY) / HexMath.HEIGHT;
    const widthInFeet = Math.round(widthInSquares * gridScale);
    const heightInFeet = Math.round(heightInSquares * gridScale);
    const scaleContext = `map scale: ${gridScale} feet per square, total area: ${widthInFeet}x${heightInFeet} feet`;

    const result = await this.comfyUI.generateFromAiStrokes(
      aiStrokes,
      colorPrompts,
      worldBounds,
      basePrompt,
      generalRegionPrompt,
      negativePrompt,
      scaleContext
    );

    if (result.success && result.imageBlob && result.worldBounds) {
      // Apply region-based cutoff masking to remove gray background
      const maskedBlob = await this.applyRegionCutoffMask(
        result.imageBlob,
        aiStrokes,
        worldBounds
      );
      
      // Convert blob to base64 for persistence
      const base64 = await this.blobToBase64(maskedBlob);
      
      // Add as a new tile to the canvas
      this.store.addAiCanvasTile(base64, result.worldBounds);
      
      // Clear AI strokes after generation
      this.store.clearAiStrokes();
      
      // Trigger re-render
      this.render();
      
      console.log('[Grid] Tile added successfully');
    } else {
      console.error('[Grid] AI generation failed:', result.error);
    }
  }

  private renderOverlay() {
    if (!this.overlayCtx) return;
    
    const ctx = this.overlayCtx;
    const canvas = this.overlayCanvas?.nativeElement;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    
    // Clear overlay canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Render measurement ruler
    this.renderMeasurementOnOverlay(ctx);
    
    // Render movement path
    this.renderMovementPathOnOverlay(ctx);
    
    ctx.restore();
  }

  private renderMeasurementOnOverlay(ctx: CanvasRenderingContext2D) {
    const start = this.measureStart();
    const end = this.measureEnd();
    
    if (!start || !end) return;

    ctx.save();

    const startScreen = this.worldToScreen(start.x, start.y);
    const endScreen = this.worldToScreen(end.x, end.y);

    // Draw measurement line
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.lineTo(endScreen.x, endScreen.y);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw endpoints
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(startScreen.x, startScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endScreen.x, endScreen.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw distance label
    const midX = (startScreen.x + endScreen.x) / 2;
    const midY = (startScreen.y + endScreen.y) / 2;
    
    const startHex = HexMath.pixelToHex(start.x, start.y);
    const endHex = HexMath.pixelToHex(end.x, end.y);
    const hexDistance = HexMath.hexDistance(startHex, endHex);
    const meters = hexDistance * 1.5; // 1.5 meters per hex
    
    this.measureDistance.set(meters);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(midX - 30, midY - 15, 60, 24);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${meters.toFixed(1)} m`, midX, midY);

    ctx.restore();
  }

  private renderMovementPathOnOverlay(ctx: CanvasRenderingContext2D) {
    const path = this.dragPath();
    const waypoints = this.dragWaypoints();
    const startHex = this.dragStartHex();
    const isInvalid = this.dragPathInvalid();
    const token = this.draggingToken;
    
    if (!startHex || path.length === 0) return;

    ctx.save();

    // Color based on path validity
    const pathColor = isInvalid ? '#ef4444' : '#22c55e'; // Red if invalid, green if valid

    // Build complete path: start -> waypoints -> current target
    const pathPoints: { x: number; y: number }[] = [];
    
    // Add start point
    const startCenter = HexMath.hexToPixel(startHex);
    pathPoints.push(this.worldToScreen(startCenter.x, startCenter.y));
    
    // Add waypoints
    for (const wp of waypoints) {
      const wpCenter = HexMath.hexToPixel(wp);
      pathPoints.push(this.worldToScreen(wpCenter.x, wpCenter.y));
    }
    
    // Add current position (end of path)
    if (path.length > 0) {
      const endHex = path[path.length - 1];
      const endCenter = HexMath.hexToPixel(endHex);
      pathPoints.push(this.worldToScreen(endCenter.x, endCenter.y));
    }

    if (pathPoints.length < 2) {
      ctx.restore();
      return;
    }

    // Draw path line
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw dashed outline for visibility
    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw waypoint markers
    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const wpCenter = HexMath.hexToPixel(wp);
      const screen = this.worldToScreen(wpCenter.x, wpCenter.y);
      
      // Draw waypoint circle
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = isInvalid ? '#f87171' : '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw waypoint number
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, screen.x, screen.y);
    }

    // Draw start point
    ctx.beginPath();
    ctx.arc(pathPoints[0].x, pathPoints[0].y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw end point
    const endPoint = pathPoints[pathPoints.length - 1];
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = pathColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Calculate total distance through all waypoints + path
    let totalHexDistance = 0;
    let lastHex = startHex;
    
    // Distance through waypoints
    for (const wp of waypoints) {
      totalHexDistance += HexMath.hexDistance(lastHex, wp);
      lastHex = wp;
    }
    
    // Distance for the final segment (path length - 1 because path includes start point)
    if (path.length > 1) {
      totalHexDistance += path.length - 1;
    } else if (path.length === 1) {
      // Direct line (blocked case) - use hex distance
      const endHex = path[path.length - 1];
      totalHexDistance += HexMath.hexDistance(lastHex, endHex);
    }
    
    const totalMeters = totalHexDistance * 1.5;
    const maxMoves = token?.movementSpeed || 100;
    const maxMeters = maxMoves * 1.5;

    // Draw distance at end point (above tokens - will be rendered last)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    const labelWidth = 80;
    ctx.fillRect(endPoint.x + 10, endPoint.y - 14, labelWidth, 28);
    ctx.fillStyle = pathColor;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${totalMeters.toFixed(1)}/${maxMeters}m`, endPoint.x + 10 + labelWidth / 2, endPoint.y);

    ctx.restore();
  }

  private renderMeasurement() {
    // Legacy - now handled by renderOverlay
  }

  // Mouse event handlers
  onMouseDown(event: MouseEvent) {
    // Close context menu on any click
    this.closeContextMenu();
    
    // Ignore if dragging a token (handled by token component)
    if (this.draggingToken) return;
    
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = this.screenToWorld(x, y);

    if (event.button === 1) {
      // Middle mouse button - always pan
      this.isPanning = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      event.preventDefault();
      return;
    }

    switch (this.currentTool) {
      case 'cursor':
        // Cursor tool: left click on empty space starts panning
        if (event.button === 0) {
          this.isPanning = true;
          this.lastMouseX = event.clientX;
          this.lastMouseY = event.clientY;
        }
        break;

      case 'draw': {
        // Normal drawing mode - optionally add walls if checkbox enabled
        this.isDrawing = true;
        this.currentStrokePoints = [world];
        this.currentStrokeHexes.clear();
        
        if (this.drawWithWalls) {
          const hex = HexMath.pixelToHex(world.x, world.y);
          const hexKey = `${hex.q},${hex.r}`;
          this.currentStrokeHexes.add(hexKey);
          this.store.addWall(hex);
        }
        break;
      }
        
      case 'erase': {
        this.isDrawing = true;
        this.currentStrokePoints = [world];
        this.currentStrokeHexes.clear();
        
        if (this.drawWithWalls) {
          const hex = HexMath.pixelToHex(world.x, world.y);
          const hexKey = `${hex.q},${hex.r}`;
          this.currentStrokeHexes.add(hexKey);
          this.store.removeWall(hex);
        }
        break;
      }

      case 'walls': {
        // Walls tool - determine if we're adding or removing based on first hex
        const hex = HexMath.pixelToHex(world.x, world.y);
        const hexKey = `${hex.q},${hex.r}`;
        const exists = this.battleMap?.walls?.some(w => w.q === hex.q && w.r === hex.r) ?? false;
        
        // Set paint mode based on whether first hex has a wall
        this.wallPaintMode = exists ? 'remove' : 'add';
        this.wallPaintedHexes.clear();
        this.wallPaintedHexes.add(hexKey);
        this.isWallDrawing = true;
        
        // Apply to first hex
        if (this.wallPaintMode === 'add') {
          this.store.addWall(hex);
        } else {
          this.store.removeWall(hex);
        }
        break;
      }

      case 'measure': {
        // Snap to hex center
        const startHex = HexMath.pixelToHex(world.x, world.y);
        const startSnapped = HexMath.hexToPixel(startHex);
        this.measureStart.set(startSnapped);
        this.measureEnd.set(startSnapped);
        break;
      }

      case 'ai-draw': {
        // AI drawing mode - draws to separate AI stroke layer
        this.isDrawing = true;
        this.currentStrokePoints = [world];
        this.currentStrokeHexes.clear();
        break;
      }
    }
  }

  onMouseMove(event: MouseEvent) {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = this.screenToWorld(x, y);

    // Handle token dragging (mouse-based, smooth)
    if (this.draggingToken) {
      // Update ghost position (screen coords for the overlay)
      this.dragGhostPosition.set({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      
      // Update hover hex for highlight
      const hoverHex = HexMath.pixelToHex(world.x, world.y);
      this.dragHoverHex.set(hoverHex);
      
      // Calculate path for enforced movement mode
      if (this.dragMode === 'enforced' && !this.draggingToken.isOnTheFly) {
        const walls = this.battleMap?.walls || [];
        const maxMoves = this.draggingToken.movementSpeed || 100;
        const waypoints = this.dragWaypoints();
        
        // Calculate paths for all waypoint segments and total distance
        const fullPath: HexCoord[] = [];
        let waypointDistance = 0;
        let lastPos = this.draggingToken.position;
        let waypointPathsValid = true;
        
        // Add starting position
        fullPath.push(lastPos);
        
        // Calculate path for each waypoint segment
        for (const wp of waypoints) {
          const segmentPath = HexMath.findPath(lastPos, wp, walls, maxMoves);
          if (segmentPath && segmentPath.length > 1) {
            // Add path excluding the start (already in fullPath)
            for (let i = 1; i < segmentPath.length; i++) {
              fullPath.push(segmentPath[i]);
            }
            waypointDistance += segmentPath.length - 1;
          } else {
            // Direct distance if no path found
            waypointDistance += HexMath.hexDistance(lastPos, wp);
            fullPath.push(wp);
            waypointPathsValid = false;
          }
          lastPos = wp;
        }
        
        // Find path from last waypoint (or start) to hover hex
        const startForPath = waypoints.length > 0 ? waypoints[waypoints.length - 1] : this.draggingToken.position;
        const remainingMoves = maxMoves - waypointDistance;
        
        // Try to find a valid path
        const path = remainingMoves > 0 
          ? HexMath.findPath(startForPath, hoverHex, walls, remainingMoves)
          : null;
        
        if (path && path.length > 0) {
          // Valid path found - check if total is too far
          const totalDistance = waypointDistance + path.length - 1; // -1 because path includes start
          const isTooFar = totalDistance > maxMoves;
          
          // Add final segment to full path (excluding start which is already there)
          for (let i = 1; i < path.length; i++) {
            fullPath.push(path[i]);
          }
          
          this.dragPathInvalid.set(isTooFar);
          this.dragPath.set(path);
          this.dragFullPath.set(fullPath);
        } else {
          // No valid path - show direct line in red
          this.dragPathInvalid.set(true);
          // Create a direct path for visualization (just start and end)
          this.dragPath.set([startForPath, hoverHex]);
          // Full path should still include waypoints plus the invalid end
          fullPath.push(hoverHex);
          this.dragFullPath.set(fullPath);
        }
      } else {
        this.dragPathInvalid.set(false);
        this.dragPath.set([]);
        this.dragFullPath.set([]);
      }
      
      this.render();
      return;
    }

    if (this.isPanning) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      this.panX += deltaX;
      this.panY += deltaY;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
      this.render();
      return;
    }

    if (this.isDrawing) {
      const now = performance.now();
      // Throttle drawing updates for better performance
      if (now - this.lastDrawTime < this.drawThrottle) {
        return;
      }
      this.lastDrawTime = now;
      
      this.currentStrokePoints.push(world);
      
      // Also add/remove walls while drawing if checkbox is enabled
      if (this.drawWithWalls) {
        const hex = HexMath.pixelToHex(world.x, world.y);
        const hexKey = `${hex.q},${hex.r}`;
        if (!this.currentStrokeHexes.has(hexKey)) {
          this.currentStrokeHexes.add(hexKey);
          if (this.currentTool === 'draw') {
            this.store.addWall(hex);
          } else if (this.currentTool === 'erase') {
            this.store.removeWall(hex);
          }
        }
      }
      
      this.renderLiveStroke();
      return;
    }
    
    // Walls tool - continuous painting of walls while dragging
    if (this.isWallDrawing && this.currentTool === 'walls') {
      const hex = HexMath.pixelToHex(world.x, world.y);
      const hexKey = `${hex.q},${hex.r}`;
      
      // Only process if this is a new hex we haven't painted in this stroke
      if (!this.wallPaintedHexes.has(hexKey)) {
        this.wallPaintedHexes.add(hexKey);
        
        if (this.wallPaintMode === 'add') {
          this.store.addWall(hex);
        } else {
          this.store.removeWall(hex);
        }
        this.render();
      }
      return;
    }

    if (this.currentTool === 'measure' && this.measureStart()) {
      // Snap to hex center
      const endHex = HexMath.pixelToHex(world.x, world.y);
      const endSnapped = HexMath.hexToPixel(endHex);
      this.measureEnd.set(endSnapped);
      this.render();
    }
  }

  onMouseUp(event: MouseEvent) {
    // Handle token drag end - only on left-click
    if (this.draggingToken && event.button === 0) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const world = this.screenToWorld(x, y);
      let targetHex = HexMath.pixelToHex(world.x, world.y);
      
      // Enforced movement mode: validate path and limit by movement speed
      if (this.dragMode === 'enforced' && !this.draggingToken.isOnTheFly) {
        // If path is invalid (red), snap back to original position
        if (this.dragPathInvalid()) {
          targetHex = this.draggingToken.position;
        } else {
          const path = this.dragPath();
          if (path.length > 0) {
            // Get the last reachable hex in the path
            const maxMoves = this.draggingToken.movementSpeed || Infinity;
            const reachableIndex = Math.min(path.length - 1, maxMoves);
            targetHex = path[reachableIndex];
          } else {
            // No valid path found, stay in place
            targetHex = this.draggingToken.position;
          }
        }
      }
      
      // Emit move event
      this.tokenMove.emit({ tokenId: this.draggingToken.id, position: targetHex });
      
      // Clear drag state
      this.draggingToken = null;
      this.dragGhostPosition.set(null);
      this.dragHoverHex.set(null);
      this.dragPath.set([]);
      this.dragFullPath.set([]);
      this.dragWaypoints.set([]);
      this.dragStartHex.set(null);
      this.render();
      return;
    }
    
    // Stop wall drawing and clean up
    if (this.isWallDrawing) {
      this.isWallDrawing = false;
      this.wallPaintedHexes.clear();
      this.render();
    }
    
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      // Save the stroke - use correct brush size based on tool
      const brushSize = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
      
      if (this.currentTool === 'ai-draw') {
        // AI drawing goes to separate stroke layer
        this.store.addAiStroke({
          points: this.currentStrokePoints,
          color: this.aiDrawColor,
          lineWidth: brushSize,
          isEraser: false,
        });
      } else {
        this.store.addStroke({
          points: this.currentStrokePoints,
          color: this.brushColor,
          lineWidth: brushSize,
          isEraser: this.currentTool === 'erase',
        });
        // Old auto-generation removed - use AI Draw tool instead
      }
    }

    this.isPanning = false;
    this.isDrawing = false;
    this.currentStrokePoints = [];

    // Clear ruler on mouse release
    if (this.currentTool === 'measure') {
      this.measureStart.set(null);
      this.measureEnd.set(null);
      this.measureDistance.set(0);
      this.render();
    }
  }

  onMouseLeave() {
    // Handle token drag if mouse leaves - cancel the drag
    if (this.draggingToken) {
      this.draggingToken = null;
      this.dragGhostPosition.set(null);
      this.dragHoverHex.set(null);
      this.dragPath.set([]);
      this.dragFullPath.set([]);
      this.dragWaypoints.set([]);
      this.dragStartHex.set(null);
      this.render();
    }
    
    // Stop wall drawing
    if (this.isWallDrawing) {
      this.isWallDrawing = false;
      this.wallPaintedHexes.clear();
    }
    
    // Stop all interactions when mouse leaves canvas
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      const brushSize = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
      
      if (this.currentTool === 'ai-draw') {
        this.store.addAiStroke({
          points: this.currentStrokePoints,
          color: this.aiDrawColor,
          lineWidth: brushSize,
          isEraser: false,
        });
      } else {
        this.store.addStroke({
          points: this.currentStrokePoints,
          color: this.brushColor,
          lineWidth: brushSize,
          isEraser: this.currentTool === 'erase',
        });
        // Old auto-generation removed - use AI Draw tool instead
      }
    }
    this.isPanning = false;
    this.isDrawing = false;
    this.currentStrokePoints = [];
    this.render();
  }

  // Pointer event handlers (for tablet/pen/touch support)
  onPointerDown(event: PointerEvent) {
    // Capture pointer to receive events even if pointer leaves element
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    
    // Shift+click for Krita-style brush resize (only for draw tools)
    if (event.shiftKey && (this.currentTool === 'draw' || this.currentTool === 'erase' || this.currentTool === 'ai-draw')) {
      this.isResizingBrush = true;
      this.brushResizeStartX = event.clientX;
      this.brushResizeStartSize = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
      
      const rect = this.container.nativeElement.getBoundingClientRect();
      this.brushResizePreview.set({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        size: this.brushResizeStartSize
      });
      event.preventDefault();
      return;
    }
    
    // For pen/tablet: barrel button (button 5) or eraser tip (button 5) should pan
    // The buttons property is a bitmask: 4 = barrel button pressed
    if (event.pointerType === 'pen' && (event.buttons & 4)) {
      // Barrel button pressed - treat as middle click for panning
      const fakeEvent = new MouseEvent('mousedown', {
        clientX: event.clientX,
        clientY: event.clientY,
        button: 1, // Middle button
        buttons: 4
      });
      Object.defineProperty(fakeEvent, 'button', { value: 1 });
      this.onMouseDown(fakeEvent);
      return;
    }
    
    this.onMouseDown(event);
  }

  onPointerMove(event: PointerEvent) {
    // Handle brush resize mode
    if (this.isResizingBrush) {
      const delta = event.clientX - this.brushResizeStartX;
      // Scale: 1 pixel = 0.5 brush size units
      const newSize = Math.max(1, Math.min(100, Math.round(this.brushResizeStartSize + delta * 0.5)));
      
      const rect = this.container.nativeElement.getBoundingClientRect();
      this.brushResizePreview.set({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        size: newSize
      });
      return;
    }
    
    this.onMouseMove(event);
  }

  onPointerUp(event: PointerEvent) {
    // Release pointer capture
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    
    // Finish brush resize
    if (this.isResizingBrush) {
      const preview = this.brushResizePreview();
      if (preview) {
        this.brushSizeChange.emit(preview.size);
      }
      this.isResizingBrush = false;
      this.brushResizePreview.set(null);
      return;
    }
    
    this.onMouseUp(event);
  }

  onPointerLeave(event: PointerEvent) {
    // Only trigger leave if we don't have pointer capture
    if (!(event.target as HTMLElement).hasPointerCapture(event.pointerId)) {
      // Cancel brush resize if active
      if (this.isResizingBrush) {
        this.isResizingBrush = false;
        this.brushResizePreview.set(null);
      }
      this.onMouseLeave();
    }
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // During enforced movement drag, right-click adds a waypoint
    if (this.draggingToken && this.dragMode === 'enforced' && !this.draggingToken.isOnTheFly) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const world = this.screenToWorld(x, y);
      const currentHex = HexMath.pixelToHex(world.x, world.y);
      
      // Don't add duplicate waypoints
      const waypoints = this.dragWaypoints();
      const alreadyExists = waypoints.some(wp => wp.q === currentHex.q && wp.r === currentHex.r);
      
      if (!alreadyExists) {
        // Add the current position as a waypoint
        this.dragWaypoints.set([...waypoints, currentHex]);
        this.render();
      }
      return;
    }
    
    // Show context menu on empty space (cursor tool only)
    if (this.currentTool === 'cursor' && !this.draggingToken) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const world = this.screenToWorld(x, y);
      const hex = HexMath.pixelToHex(world.x, world.y);
      
      // Check if there's a token at this hex
      const hasToken = this.battleMap?.tokens.some(t => t.position.q === hex.q && t.position.r === hex.r);
      
      if (!hasToken) {
        this.contextMenuPosition.set({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        this.contextMenuHex.set(hex);
        this.showContextMenu.set(true);
      }
    }
  }

  closeContextMenu() {
    this.showContextMenu.set(false);
    this.contextMenuHex.set(null);
  }

  onCreateQuickToken() {
    const hex = this.contextMenuHex();
    if (hex) {
      // Create an on-the-fly token with a placeholder name
      const tokenName = prompt('Enter token name:', 'Enemy');
      if (tokenName) {
        this.store.addToken({
          characterId: generateId(),
          characterName: tokenName,
          position: hex,
          team: 'red',
          isOnTheFly: true,
        });
      }
    }
    this.closeContextMenu();
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    
    const rect = this.container.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(3, this.scale * delta));

    // Zoom towards mouse position
    this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
    this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    this.scale = newScale;

    this.render();
  }

  // Drag and drop handlers (for NEW tokens from character list only)
  onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isExternalDragActive = true;
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Set flag to disable token pointer-events during external drag
    if (!this.isExternalDragActive) {
      this.isExternalDragActive = true;
    }
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    
    // Track hover hex for highlight
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = this.screenToWorld(x, y);
    const hex = HexMath.pixelToHex(world.x, world.y);
    
    if (!this.dragOverHex || this.dragOverHex.q !== hex.q || this.dragOverHex.r !== hex.r) {
      this.dragOverHex = hex;
      this.render();
    }
  }
  
  onDragLeave(event: DragEvent) {
    // Only deactivate if leaving the container entirely, not just entering a child
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.isExternalDragActive = false;
      this.dragOverHex = null;
      this.render();
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Reset external drag state
    this.isExternalDragActive = false;
    
    // Get character ID from text/plain (for new tokens from character list)
    const characterId = event.dataTransfer?.getData('text/plain');
    if (!characterId) {
      console.log('[BATTLEMAP GRID] Drop event has no characterId');
      return;
    }

    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = this.screenToWorld(x, y);
    const hex = HexMath.pixelToHex(world.x, world.y);

    console.log('[BATTLEMAP GRID] Dropping character', characterId, 'at hex', hex);
    this.dragOverHex = null;
    this.tokenDrop.emit({ characterId, position: hex });
    this.render();
  }

  // Token drag handlers (custom mouse-based, smooth drag)
  onTokenDragStart(token: BattlemapToken, event: MouseEvent) {
    this.draggingToken = token;
    
    // Initialize ghost position
    const rect = this.container.nativeElement.getBoundingClientRect();
    this.dragGhostPosition.set({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    
    // Set initial hover hex
    const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
    this.dragHoverHex.set(HexMath.pixelToHex(world.x, world.y));
    
    // Initialize waypoints for enforced movement
    this.dragWaypoints.set([]);
    this.dragStartHex.set(token.position);
  }

  onTokenDragMove(event: MouseEvent) {
    // This is handled by onMouseMove when draggingToken is set
  }

  onTokenDragEnd(event: MouseEvent, tokenId: string) {
    // This is handled by onMouseUp when draggingToken is set
    // The token component emits this but we handle it in onMouseUp
  }

  // Helper functions
  private renderLiveStroke() {
    if (!this.drawCtx || this.currentStrokePoints.length < 2) return;

    const ctx = this.drawCtx;
    const points = this.currentStrokePoints;
    
    // Clear and redraw all strokes plus live stroke
    this.renderStrokes();
    
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    const isErasing = this.currentTool === 'erase';
    const brushSize = isErasing ? this.eraserBrushSize : this.penBrushSize;
    
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : (this.currentTool === 'ai-draw' ? this.aiDrawColor : this.brushColor);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  // Get token screen position for rendering (returns world position, transform applied via CSS)
  getTokenScreenPosition(token: BattlemapToken): { x: number; y: number } {
    // The tokens-layer has a CSS transform applied, so we return world coordinates
    return HexMath.hexToPixel(token.position);
  }

  // Check if token is current turn
  isTokenCurrentTurn(token: BattlemapToken): boolean {
    return token.characterId === this.currentTurnCharacterId;
  }
  
  // Get the size for the drag ghost (matches token dimensions)
  get ghostWidth(): number {
    return HexMath.WIDTH * 0.9 * this.scale;
  }
  
  get ghostHeight(): number {
    return HexMath.HEIGHT * 0.9 * this.scale;
  }
  
  // Helper: Get initials from a name
  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  
  // Helper: Get synced team for a token from battleParticipants
  getSyncedTeam(token: BattlemapToken): string | undefined {
    // If it's an on-the-fly token, use its own team
    if (token.isOnTheFly) {
      return token.team;
    }
    // Look up team from battleParticipants
    const participant = this.battleParticipants.find(p => p.characterId === token.characterId);
    return participant?.team || token.team;
  }
  
  // Helper: Get team color
  getTeamColor(team: string | undefined): string {
    switch (team) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'purple': return '#a855f7';
      default: return '#60a5fa';
    }
  }
}
