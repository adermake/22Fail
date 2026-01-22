import { 
  Component, Input, Output, EventEmitter, ElementRef, ViewChild, 
  AfterViewInit, OnChanges, SimpleChanges, inject, signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattlemapData, BattlemapToken, BattlemapStroke, HexCoord, HexMath, MeasurementLine, generateId } from '../../model/battlemap.model';
import { BattleMapStoreService } from '../../services/battlemap-store.service';
import { BattlemapTokenComponent } from '../battlemap-token/battlemap-token.component';

type ToolType = 'select' | 'draw' | 'erase' | 'measure';

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
  @Input() brushSize = 4;
  @Input() currentTurnCharacterId: string | null = null;

  @Output() tokenDrop = new EventEmitter<{ characterId: string; position: HexCoord }>();
  @Output() tokenMove = new EventEmitter<{ tokenId: string; position: HexCoord }>();
  @Output() tokenRemove = new EventEmitter<string>();

  private store = inject(BattleMapStoreService);

  // Canvas contexts
  private gridCtx: CanvasRenderingContext2D | null = null;
  private drawCtx: CanvasRenderingContext2D | null = null;

  // Pan and zoom
  panX = 0;
  panY = 0;
  scale = 1;

  // Interaction state
  private isPanning = false;
  private isDrawing = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private currentStrokePoints: { x: number; y: number }[] = [];
  private lastDrawTime = 0;
  private drawThrottle = 16; // ~60fps

  // Measurement
  measureStart = signal<{ x: number; y: number } | null>(null);
  measureEnd = signal<{ x: number; y: number } | null>(null);
  measureDistance = signal<number>(0);

  // Drag state for tokens
  draggedTokenId: string | null = null;
  draggedCharacterId: string | null = null;

  // Hex grid rendering
  private hexSize = HexMath.SIZE;

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
    canvas.width = rect.width;
    canvas.height = rect.height;
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
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    const bounds = this.battleMap.gridBounds;
    
    // Draw hexagons
    for (let q = bounds.minQ; q <= bounds.maxQ; q++) {
      for (let r = bounds.minR; r <= bounds.maxR; r++) {
        this.drawHexagon(ctx, { q, r });
      }
    }

    ctx.restore();
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, hex: HexCoord) {
    const center = HexMath.hexToPixel(hex);
    const corners = HexMath.getHexCorners(center);

    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();

    // Fill with subtle color
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.fill();

    // Stroke border
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private renderStrokes() {
    if (!this.drawCtx || !this.battleMap) return;

    const canvas = this.drawCanvas.nativeElement;
    const ctx = this.drawCtx;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    const feet = hexDistance * 5; // 5 feet per hex
    
    this.measureDistance.set(feet);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(midX - 30, midY - 15, 60, 24);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${feet} ft`, midX, midY);

    ctx.restore();
  }

  // Mouse event handlers
  onMouseDown(event: MouseEvent) {
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

      case 'draw':
      case 'erase':
        this.isDrawing = true;
        this.currentStrokePoints = [world];
        break;

      case 'measure':
        this.measureStart.set(world);
        this.measureEnd.set(world);
        break;
    }
  }

  onMouseMove(event: MouseEvent) {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = this.screenToWorld(x, y);

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
      
      // Expand grid if drawing outside bounds
      const hex = HexMath.pixelToHex(world.x, world.y);
      this.expandGridIfNeeded(hex);
      return;
    }

    if (this.currentTool === 'measure' && this.measureStart()) {
      this.measureEnd.set(world);
      this.render();
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      // Save the stroke
      this.store.addStroke({
        points: this.currentStrokePoints,
        color: this.brushColor,
        lineWidth: this.brushSize,
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
    // Stop all interactions when mouse leaves canvas
    if (this.isDrawing && this.currentStrokePoints.length > 1) {
      this.store.addStroke({
        points: this.currentStrokePoints,
        color: this.brushColor,
        lineWidth: this.brushSize,
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

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const characterId = event.dataTransfer?.getData('characterId');
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
    this.tokenDrop.emit({ characterId, position: hex });
  }

  // Token interaction
  onTokenDragStart(tokenId: string) {
    this.draggedTokenId = tokenId;
  }

  onTokenDragEnd(event: DragEvent, tokenId: string) {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const world = this.screenToWorld(x, y);
    const hex = HexMath.pixelToHex(world.x, world.y);

    this.tokenMove.emit({ tokenId, position: hex });
    this.draggedTokenId = null;
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

    ctx.globalCompositeOperation = this.currentTool === 'erase' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.strokeStyle = this.currentTool === 'erase' ? 'rgba(0,0,0,1)' : this.brushColor;
    ctx.lineWidth = this.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  private expandGridIfNeeded(hex: HexCoord) {
    if (!this.battleMap) return;
    
    const bounds = this.battleMap.gridBounds;
    const expandRadius = 10; // Larger expand radius for circular feel
    let needsExpand = false;

    // Check if hex is near the edge
    const margin = 3;
    if (hex.q <= bounds.minQ + margin || hex.q >= bounds.maxQ - margin ||
        hex.r <= bounds.minR + margin || hex.r >= bounds.maxR - margin) {
      needsExpand = true;
    }

    if (needsExpand) {
      // Calculate new bounds as a circle around current bounds center
      const centerQ = (bounds.minQ + bounds.maxQ) / 2;
      const centerR = (bounds.minR + bounds.maxR) / 2;
      const currentRadiusQ = (bounds.maxQ - bounds.minQ) / 2;
      const currentRadiusR = (bounds.maxR - bounds.minR) / 2;
      const newRadiusQ = currentRadiusQ + expandRadius;
      const newRadiusR = currentRadiusR + expandRadius;
      
      const newBounds = {
        minQ: Math.floor(centerQ - newRadiusQ),
        maxQ: Math.ceil(centerQ + newRadiusQ),
        minR: Math.floor(centerR - newRadiusR),
        maxR: Math.ceil(centerR + newRadiusR),
      };
      this.store.applyPatch({ path: 'gridBounds', value: newBounds });
    }
  }

  // Get token screen position for rendering
  getTokenScreenPosition(token: BattlemapToken): { x: number; y: number } {
    const worldPos = HexMath.hexToPixel(token.position);
    return this.worldToScreen(worldPos.x, worldPos.y);
  }

  // Check if token is current turn
  isTokenCurrentTurn(token: BattlemapToken): boolean {
    return token.characterId === this.currentTurnCharacterId;
  }
}
