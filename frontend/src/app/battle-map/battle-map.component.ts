import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { BattleMapStoreService } from '../services/battlemap-store.service';
import { WorldStoreService } from '../services/world-store.service';
import { CharacterApiService } from '../services/character-api.service';
import { Drawing, Token, Hex } from '../model/world.model';
import { CharacterSheet } from '../model/character-sheet-model';

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

  // Clipping
  public hexClipPathPoints = '';

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
    this.calculateClipPath();
  }

  calculateClipPath() {
    const corners = this.getCenteredHexCorners(this.layout.size.x, this.layout.size.y, this.layout.size.x);
    this.hexClipPathPoints = corners.map(p => `${p.x},${p.y}`).join(' ');
  }

  private getCenteredHexCorners(center_x: number, center_y: number, radius: number): Point[] {
    const corners: Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i + 30; // Pointy top, start at 30 degrees
      const angle_rad = Math.PI / 180 * angle_deg;
      corners.push({ x: center_x + radius * Math.cos(angle_rad), y: center_y + radius * Math.sin(angle_rad) });
    }
    return corners;
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
    if (!this.isGmMode || !this.isDragMode) {
      return;
    }

    const droppedOnHex = this.getHexFromDropEvent(event);
    if (!droppedOnHex) {
      console.log('Drop rejected: Not on a valid hex.');
      return;
    }

    if (event.previousContainer.id === 'token-list-drop-list') {
      // New token from list
      const character = event.item.data as CharacterSheet;
      const newToken: Token = {
        characterId: character.id!,
        name: character.name,
        image: character.portrait,
        position: droppedOnHex
      };
      
      const currentTokens = this.store.battleMapValue?.tokens || [];
      this.store.applyPatch({
        path: `tokens.${currentTokens.length}`,
        value: newToken
      });

    } else if (event.previousContainer.id === 'grid-drop-list') {
      // Move existing token
      const token = event.item.data as Token;
      const tokenIndex = this.store.battleMapValue?.tokens.findIndex(t => t.characterId === token.characterId);

      if (tokenIndex !== -1) {
        this.store.applyPatch({
          path: `tokens.${tokenIndex}.position`,
          value: droppedOnHex
        });
      }
    }
  }

  private getHexFromDropEvent(event: CdkDragDrop<any>): Hex | null {
    const point = event.dropPoint;
    const svg = (event.container.element.nativeElement as HTMLElement).closest('svg')!;
    if (!svg) {
      console.error('Could not find SVG container for drop event.');
      return null;
    }
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    
    const transformedPoint = svgPoint.matrixTransform(svg.getScreenCTM()!.inverse());

    const hex = this.pixelToHex(transformedPoint);
    const foundHex = this.hexagons.find(h => this.hexDistance(h.hex, hex) < 0.1);
    return foundHex ? foundHex.hex : null;
  }

  private getHexFromMouseEvent(event: MouseEvent): Hex | null {
    const point = this.getTransformedPoint(event);
    const hex = this.pixelToHex(point);
    return this.hexagons.find(h => h.hex.q === hex.q && h.hex.r === hex.r)?.hex || null;
  }

  pixelToHex(hex: Hex): Point {
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