import { 
  Component, Input, Output, EventEmitter, ElementRef, ViewChild, 
  AfterViewInit, OnChanges, SimpleChanges, inject, signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattlemapData, BattlemapToken, BattlemapStroke, HexCoord, HexMath, WallHex, MeasurementLine, generateId } from '../../model/battlemap.model';
import { BattleMapStoreService } from '../../services/battlemap-store.service';
import { BattlemapTokenComponent } from '../battlemap-token/battlemap-token.component';

type ToolType = 'select' | 'cursor' | 'draw' | 'erase' | 'measure';
type DragMode = 'free' | 'enforced';

@Component({
  selector: 'app-battlemap-grid',
  standalone: true,
  imports: [CommonModule, BattlemapTokenComponent],
  templateUrl: './battlemap-grid.component.html',
  styleUrl: './battlemap-grid.component.css',
})
export class BattlemapGridComponent implements AfterViewInit, OnChanges {
  @ViewChild('gridCanvas') gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawCanvas') drawCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  @Input() battleMap: BattlemapData | null = null;
  @Input() currentTool: ToolType = 'select';
  @Input() brushColor = '#ef4444';
  @Input() penBrushSize = 4;
  @Input() eraserBrushSize = 12;
  @Input() isWallMode = false;
  @Input() dragMode: DragMode = 'free';
  @Input() currentTurnCharacterId: string | null = null;

  @Output() tokenDrop = new EventEmitter<{ characterId: string; position: HexCoord }>();
  @Output() tokenMove = new EventEmitter<{ tokenId: string; position: HexCoord }>();
  @Output() tokenRemove = new EventEmitter<string>();
  @Output() quickTokenDrop = new EventEmitter<{ name: string; portrait: string; position: HexCoord }>();

  private store = inject(BattleMapStoreService);

  // Canvas contexts
  private gridCtx: CanvasRenderingContext2D | null = null;
  private drawCtx: CanvasRenderingContext2D | null = null;

  // Pan and zoom state
  panX = 0;
  panY = 0;
  scale = 1;

  // Interaction state
  private isPanning = false;
  private isDrawing = false;
  private isWallDrawing = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private currentStrokePoints: { x: number; y: number }[] = [];
  private lastDrawTime = 0;
  private drawThrottle = 16; // ~60fps

  // Measurement
  measureStart = signal<{ x: number; y: number } | null>(null);
  measureEnd = signal<{ x: number; y: number } | null>(null);
  measureDistance = signal<number>(0);

  // Token dragging state (custom mouse-based, not native drag)
  draggingToken: BattlemapToken | null = null;
  dragGhostPosition = signal<{ x: number; y: number } | null>(null);
  dragHoverHex = signal<HexCoord | null>(null);
  dragPath = signal<HexCoord[]>([]); // Path for enforced movement visualization

  // Drag over from character list (native HTML drag for new tokens only)
  private dragOverHex: HexCoord | null = null;

  ngAfterViewInit() {
    this.initCanvases();
    this.centerView();
    this.render();
    this.setupResizeObserver();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['battleMap'] && this.gridCtx) {
      this.render();
    }
  }

  private initCanvases() {
    const gridEl = this.gridCanvas?.nativeElement;
    const drawEl = this.drawCanvas?.nativeElement;
    
    if (gridEl) {
      this.gridCtx = gridEl.getContext('2d');
      this.resizeCanvas(gridEl);
    }
    if (drawEl) {
      this.drawCtx = drawEl.getContext('2d');
      this.resizeCanvas(drawEl);
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
      if (gridEl) this.resizeCanvas(gridEl);
      if (drawEl) this.resizeCanvas(drawEl);
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
    this.renderMeasurement();
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
    
    // Render visible hexes
    for (let q = bounds.minQ; q <= bounds.maxQ; q++) {
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        const hex = { q, r };
        const isHover = hoverHex && hoverHex.q === q && hoverHex.r === r;
        this.drawHexagon(ctx, hex, isHover || false);
      }
    }

    ctx.restore();
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, hex: HexCoord, isHover = false) {
    const center = HexMath.hexToPixel(hex);
    const corners = HexMath.getHexCorners(center);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    // Check if this hex is a wall
    const isWall = this.battleMap?.walls?.some(w => w.q === hex.q && w.r === hex.r) ?? false;
    
    // Check if this hex is in the enforced drag path
    const isInPath = this.dragPath().some(p => p.q === hex.q && p.r === hex.r);

    // Fill with appropriate color
    if (isHover) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 1)';
      ctx.lineWidth = 3;
    } else if (isWall) {
      // Wall hexes are red-tinted
      ctx.fillStyle = 'rgba(220, 38, 38, 0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.lineWidth = 2;
    } else if (isInPath) {
      // Path hexes are highlighted green
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.lineWidth = 1;
    }
    ctx.stroke();
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
  }

  private renderMeasurement() {
    if (!this.gridCtx) return;
    
    const start = this.measureStart();
    const end = this.measureEnd();
    
    if (!start || !end) return;

    const ctx = this.gridCtx;
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

  // Mouse event handlers
  onMouseDown(event: MouseEvent) {
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
      case 'select':
        if (event.button === 0) {
          this.isPanning = true;
          this.lastMouseX = event.clientX;
          this.lastMouseY = event.clientY;
        }
        break;

      case 'cursor':
        // Cursor tool is for token movement only, handled by token component
        // Clicking on empty space does nothing
        break;

      case 'draw':
        if (this.isWallMode) {
          // Wall drawing mode - toggle wall on clicked hex
          this.isWallDrawing = true;
          const hex = HexMath.pixelToHex(world.x, world.y);
          this.store.toggleWall(hex);
        } else {
          // Normal drawing mode
          this.isDrawing = true;
          this.currentStrokePoints = [world];
        }
        break;
        
      case 'erase':
        this.isDrawing = true;
        this.currentStrokePoints = [world];
        break;

      case 'measure':
        // Snap to hex center
        const startHex = HexMath.pixelToHex(world.x, world.y);
        const startSnapped = HexMath.hexToPixel(startHex);
        this.measureStart.set(startSnapped);
        this.measureEnd.set(startSnapped);
        break;
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
        const maxMoves = this.draggingToken.movementSpeed || 100; // Default high if not set
        const path = HexMath.findPath(this.draggingToken.position, hoverHex, walls, maxMoves);
        
        // Limit path by movement speed
        if (path) {
          const limitedPath = path.slice(0, maxMoves + 1);
          this.dragPath.set(limitedPath);
        } else {
          this.dragPath.set([]);
        }
      } else {
        this.dragPath.set([]);
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
      this.renderLiveStroke();
      return;
    }
    
    // Wall drawing mode - continuous painting of walls while dragging
    if (this.isWallDrawing && this.currentTool === 'draw' && this.isWallMode) {
      const hex = HexMath.pixelToHex(world.x, world.y);
      this.store.addWall(hex);
      this.render();
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
    // Handle token drag end
    if (this.draggingToken) {
      const rect = this.container.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const world = this.screenToWorld(x, y);
      let targetHex = HexMath.pixelToHex(world.x, world.y);
      
      // Enforced movement mode: validate path and limit by movement speed
      if (this.dragMode === 'enforced' && !this.draggingToken.isOnTheFly) {
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
      
      // Emit move event
      this.tokenMove.emit({ tokenId: this.draggingToken.id, position: targetHex });
      
      // Clear drag state
      this.draggingToken = null;
      this.dragGhostPosition.set(null);
      this.dragHoverHex.set(null);
      this.dragPath.set([]);
      this.render();
      return;
    }
    
    // Stop wall drawing
    if (this.isWallDrawing) {
      this.isWallDrawing = false;
      this.render();
    }
    
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      // Save the stroke - use correct brush size based on tool
      const brushSize = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
      this.store.addStroke({
        points: this.currentStrokePoints,
        color: this.brushColor,
        lineWidth: brushSize,
        isEraser: this.currentTool === 'erase',
      });
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
      this.render();
    }
    
    // Stop wall drawing
    if (this.isWallDrawing) {
      this.isWallDrawing = false;
    }
    
    // Stop all interactions when mouse leaves canvas
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      const brushSize = this.currentTool === 'erase' ? this.eraserBrushSize : this.penBrushSize;
      this.store.addStroke({
        points: this.currentStrokePoints,
        color: this.brushColor,
        lineWidth: brushSize,
        isEraser: this.currentTool === 'erase',
      });
    }
    this.isPanning = false;
    this.isDrawing = false;
    this.currentStrokePoints = [];
    this.render();
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
  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
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
    this.dragOverHex = null;
    this.render();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
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

    ctx.strokeStyle = isErasing ? 'rgba(0,0,0,1)' : this.brushColor;
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
  
  // Get the size for the drag ghost (matches token size)
  get ghostSize(): number {
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
