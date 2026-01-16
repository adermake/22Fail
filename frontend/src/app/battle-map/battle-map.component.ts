import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { BattleMapStoreService } from '../services/battlemap-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { CharacterApiService } from '../services/character-api.service';
import { Drawing, Token } from '../model/world.model';
import { CharacterSheet } from '../model/character-sheet-model';

interface Hex {
  q: number;
  r: number;
  s: number;
}

interface Point {
  x: number;
  y: number;
}

interface Layout {
  orientation: Orientation;
  size: Point;
  origin: Point;
}

interface Orientation {
  f0: number; f1: number; f2: number; f3: number;
  b0: number; b1: number; b2: number; b3: number;
  startAngle: number;
}

@Component({
  selector: 'app-battle-map',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './battle-map.component.html',
  styleUrls: ['./battle-map.component.css']
})
export class BattleMapComponent implements OnInit {
  public store = inject(BattleMapStoreService);
  private route = inject(ActivatedRoute);
  private worldStore = inject(WorldStoreService);
  private characterApi = inject(CharacterApiService);

  public hexagons: {id: string, points: string, hex: Hex}[] = [];
  public layout: Layout = {
    orientation: { // pointy top
      f0: Math.sqrt(3.0), f1: Math.sqrt(3.0) / 2.0, f2: 0.0, f3: 3.0 / 2.0,
      b0: Math.sqrt(3.0) / 3.0, b1: -1.0 / 3.0, b2: 0.0, b3: 2.0 / 3.0,
      startAngle: 0.5
    },
    size: { x: 50, y: 50 },
    origin: { x: 0, y: 0 }
  };

  // World and Tokens
  public currentWorldName = '';
  public worldCharacters: CharacterSheet[] = [];

  // Pan and Zoom
  public viewBox = '0 0 1920 1080';
  private zoomLevel = 1;
  private isPanning = false;
  private startPoint = { x: 0, y: 0 };
  private panOffset = { x: 0, y: 0 };

  // Modes
  public isGmMode = true;
  public isDrawingMode = false;
  public isDragMode = false;
  public isMeasuring = false;

  // Drawing
  public isDrawing = false;
  public currentDrawingPath = '';

  // Measurement
  public measurementStart: Point | null = null;
  public measurementEnd: Point = {x: 0, y: 0};
  public measurementDistance = 0;
  private measurementStartHex: Hex | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const worldName = params['worldName'];
      const id = params['id'];
      if (worldName && id) {
        this.currentWorldName = worldName;
        this.store.load(worldName, id);
        this.loadWorld(worldName);
      }
    });
    
    this.generateHexGrid();
    this.updateViewBox();
  }

  async loadWorld(worldName: string) {
    this.currentWorldName = worldName;
    await this.worldStore.load(worldName);
    const world = this.worldStore.worldValue;
    if (world) {
      const charSheets = await Promise.all(
        world.characterIds.map(async id => {
          const sheet = await this.characterApi.loadCharacter(id);
          if (sheet) {
            (sheet as any).id = id;
          }
          return sheet;
        })
      );
      this.worldCharacters = charSheets.filter(sheet => sheet !== null) as CharacterSheet[];
    }
  }
  
onDrop(event: CdkDragDrop<any>) {
    console.log('onDrop event:', event);
    if (!this.isGmMode || !this.isDragMode) {
      console.log('Drop rejected: Not in GM or Drag mode.');
      return;
    }

    const droppedOnHex = this.getHexFromDropEvent(event);
    if (!droppedOnHex) {
      console.log('Drop rejected: Not on a valid hex.');
      return;
    }
    
    console.log('Dropped on hex:', droppedOnHex);

    if (event.previousContainer.id === 'token-list-drop-list') {
      console.log('Drop from token list.');
      // New token from list
      const character = event.item.data as CharacterSheet;
      const newToken: Token = {
        characterId: character.id!,
        name: character.name,
        image: character.portrait,
        position: { q: droppedOnHex.q, r: droppedOnHex.r }
      };
      
      const currentTokens = this.store.battleMapValue?.tokens || [];
      this.store.applyPatch({
        path: `tokens.${currentTokens.length}`,
        value: newToken
      });
      console.log('New token patch sent:', newToken);

    } else if (event.previousContainer.id === 'grid-drop-list') {
      console.log('Drop from grid (moving token).');
      // Move existing token
      const token = event.item.data as Token;
      const tokenIndex = this.store.battleMapValue?.tokens.findIndex(t => t.characterId === token.characterId);

      if (tokenIndex !== -1) {
        this.store.applyPatch({
          path: `tokens.${tokenIndex}.position`,
          value: { q: droppedOnHex.q, r: droppedOnHex.r }
        });
        console.log('Move token patch sent:', token.characterId, droppedOnHex);
      }
    }
  }

  private getHexFromDropEvent(event: CdkDragDrop<any>): Hex | null {
    const point = event.dropPoint;
    const svg = (event.container.element.nativeElement as HTMLElement).closest('svg')!;
    if (!svg) return null;
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    const transformedPoint = svgPoint.matrixTransform(svg.getScreenCTM()!.inverse());

    const hex = this.pixelToHex(transformedPoint);
    return this.hexagons.find(h => h.hex.q === hex.q && h.hex.r === hex.r)?.hex || null;
  }

  private getHexFromMouseEvent(event: MouseEvent): Hex | null {
    const point = this.getTransformedPoint(event);
    const hex = this.pixelToHex(point);
    return this.hexagons.find(h => h.hex.q === hex.q && h.hex.r === hex.r)?.hex || null;
  }

  pixelToHex(point: Point): Hex {
    const M = this.layout.orientation;
    const size = this.layout.size;
    const origin = this.layout.origin;
    const pt = { x: (point.x - origin.x) / size.x, y: (point.y - origin.y) / size.y };
    const q = M.b0 * pt.x + M.b1 * pt.y;
    const r = M.b2 * pt.x + M.b3 * pt.y;
    return this.hexRound({ q, r, s: -q - r });
  }

  hexRound(h: Hex): Hex {
    let q = Math.round(h.q);
    let r = Math.round(h.r);
    let s = Math.round(h.s);
    const qDiff = Math.abs(q - h.q);
    const rDiff = Math.abs(r - h.r);
    const sDiff = Math.abs(s - h.s);
    if (qDiff > rDiff && qDiff > sDiff) {
      q = -r - s;
    } else if (rDiff > sDiff) {
      r = -q - s;
    } else {
      s = -q - r;
    }
    return { q, r, s };
  }

  hexDistance(a: Hex, b: Hex): number {
    return (Math.abs(a.q - b.q) 
          + Math.abs(a.q + a.r - b.q - b.r) 
          + Math.abs(a.r - b.r)) / 2;
  }

  private updateViewBox() {
    const viewboxWidth = 1920 * this.zoomLevel;
    const viewboxHeight = 1080 * this.zoomLevel;
    this.viewBox = `${this.panOffset.x} ${this.panOffset.y} ${viewboxWidth} ${viewboxHeight}`;
  }

  private getTransformedPoint(event: MouseEvent): Point {
    const svg = (event.target as HTMLElement).closest('svg');
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: transformedPoint.x, y: transformedPoint.y };
  }
  
  toggleGmMode() {
    this.isGmMode = !this.isGmMode;
    if (!this.isGmMode) {
      this.isDrawingMode = false;
      this.isDragMode = false;
      this.isMeasuring = false;
    }
  }

  toggleDrawingMode() {
    if (!this.isGmMode) return;
    this.isDrawingMode = !this.isDrawingMode;
    if (this.isDrawingMode) {
      this.isDragMode = false;
      this.isMeasuring = false;
    }
  }

  toggleDragMode() {
    if (!this.isGmMode) return;
    this.isDragMode = !this.isDragMode;
    if (this.isDragMode) {
      this.isDrawingMode = false;
      this.isMeasuring = false;
    }
  }

  toggleMeasureMode() {
    if (!this.isGmMode) return;
    this.isMeasuring = !this.isMeasuring;
    if (this.isMeasuring) {
      this.isDrawingMode = false;
      this.isDragMode = false;
    }
    this.measurementStart = null;
    this.measurementStartHex = null;
  }

  onWheel(event: WheelEvent) {
    if (this.isDrawingMode || this.isDragMode || this.isMeasuring) return;
    event.preventDefault();
    const zoomFactor = 1.1;
    if (event.deltaY < 0) {
      this.zoomLevel /= zoomFactor;
    } else {
      this.zoomLevel *= zoomFactor;
    }
    this.updateViewBox();
  }

  onMouseDown(event: MouseEvent) {
    if (this.isDragMode && this.isGmMode) return;
    
    if (this.isGmMode && this.isMeasuring) {
      const hex = this.getHexFromMouseEvent(event);
      if (hex) {
        if (!this.measurementStartHex) {
          this.measurementStartHex = hex;
          this.measurementStart = this.hexToPixel(hex);
          this.measurementEnd = this.hexToPixel(hex);
          this.measurementDistance = 0;
        } else {
          this.measurementStart = null;
          this.measurementStartHex = null;
        }
      }
    } else if (this.isGmMode && this.isDrawingMode) {
      this.isDrawing = true;
      const point = this.getTransformedPoint(event);
      this.currentDrawingPath = `M ${point.x} ${point.y}`;
    } else {
      this.isPanning = true;
      this.startPoint = { x: event.clientX, y: event.clientY };
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isGmMode && this.isMeasuring && this.measurementStartHex) {
      const hex = this.getHexFromMouseEvent(event);
      if (hex) {
        this.measurementEnd = this.hexToPixel(hex);
        this.measurementDistance = this.hexDistance(this.measurementStartHex, hex);
      }
    } else if (this.isGmMode && this.isDrawing && this.isDrawingMode) {
      const point = this.getTransformedPoint(event);
      this.currentDrawingPath += ` L ${point.x} ${point.y}`;
    } else if (this.isPanning) {
      const endPoint = { x: event.clientX, y: event.clientY };
      const dx = endPoint.x - this.startPoint.x;
      const dy = endPoint.y - this.startPoint.y;
      
      const svg = (event.target as HTMLElement).closest('svg')!;
      const viewboxWidth = svg.viewBox.baseVal.width;

      this.panOffset.x -= dx * (viewboxWidth / svg.clientWidth);
      this.panOffset.y -= dy * (viewboxWidth / svg.clientWidth);

      this.startPoint = endPoint;
      this.updateViewBox();
    }
  }

  onMouseUp() {
    if (this.isDrawing && this.isDrawingMode) {
      this.isDrawing = false;
      const newDrawing: Drawing = {
        path: this.currentDrawingPath,
        color: '#FF0000',
        lineWidth: 5,
      };

      const currentDrawings = this.store.battleMapValue?.drawings || [];
      this.store.applyPatch({
        path: `drawings.${currentDrawings.length}`,
        value: newDrawing
      });

      this.currentDrawingPath = '';
    }
    if (this.isPanning) {
      this.isPanning = false;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUpGlobal(event: MouseEvent) {
    if (this.isDrawing || this.isPanning) {
      this.onMouseUp();
    }
  }

  hexToPixel(hex: Hex): Point {
    const M = this.layout.orientation;
    const size = this.layout.size;
    const origin = this.layout.origin;
    const x = (M.f0 * hex.q + M.f1 * hex.r) * size.x;
    const y = (M.f2 * hex.q + M.f3 * hex.r) * size.y;
    return { x: x + origin.x, y: y + origin.y };
  }

  hexCornerOffset(corner: number): Point {
    const M = this.layout.orientation;
    const size = this.layout.size;
    const angle = 2.0 * Math.PI * (M.startAngle - corner) / 6.0;
    return { x: size.x * Math.cos(angle), y: size.y * Math.sin(angle) };
  }

  polygonCorners(hex: Hex): Point[] {
    const corners: Point[] = [];
    const center = this.hexToPixel(hex);
    for (let i = 0; i < 6; i++) {
      const offset = this.hexCornerOffset(i);
      corners.push({ x: center.x + offset.x, y: center.y + offset.y });
    }
    return corners;
  }

  generateHexGrid() {
    const grid: {id: string, points: string, hex: Hex}[] = [];
    const mapRadius = 15;
    for (let q = -mapRadius; q <= mapRadius; q++) {
      const r1 = Math.max(-mapRadius, -q - mapRadius);
      const r2 = Math.min(mapRadius, -q + mapRadius);
      for (let r = r1; r <= r2; r++) {
        const hex = { q, r, s: -q - r };
        const corners = this.polygonCorners(hex);
        const points = corners.map(p => `${p.x},${p.y}`).join(' ');
        grid.push({ id: `${q},${r}`, points, hex });
      }
    }
    this.hexagons = grid;
  }
}
