/**
 * Battlemap Model
 * 
 * Defines the data structures for the hexagonal battlemap system.
 * Hexagons use axial coordinates (q, r) for efficient calculations.
 */

// Axial coordinate for hexagon positioning
export interface HexCoord {
  q: number; // column
  r: number; // row
}

// A drawing stroke on the canvas
export interface BattlemapStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  isEraser: boolean;
}

// A measurement line between two points
export interface MeasurementLine {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  createdBy: string; // Client identifier
}

// A character token on the battlemap
export interface BattlemapToken {
  id: string;
  characterId: string;
  characterName: string;
  portrait?: string; // Base64 or URL of character portrait
  position: HexCoord;
  team?: string; // Team color for grouping
}

// The main battlemap data structure
export interface BattlemapData {
  id: string;
  name: string;
  worldName: string;
  
  // Tokens on the map
  tokens: BattlemapToken[];
  
  // Drawing strokes
  strokes: BattlemapStroke[];
  
  // Active measurement lines (synced in real-time)
  measurementLines: MeasurementLine[];
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Helper function to create an empty battlemap
export function createEmptyBattlemap(id: string, name: string, worldName: string): BattlemapData {
  return {
    id,
    name,
    worldName,
    tokens: [],
    strokes: [],
    measurementLines: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Hexagon math utilities - FLAT-TOP hexagons
// Reference: https://www.redblobgames.com/grids/hexagons/
//
// FLAT-TOP hex orientation:
//    ____
//   /    \      <- flat edge on top
//  /      \
//  \      /
//   \____/
//
// For flat-top hexagons:
// - Width (point to point horizontally) = SIZE * 2
// - Height (flat edge to flat edge vertically) = sqrt(3) * SIZE
// - Horizontal spacing between columns = SIZE * 1.5 (3/4 of width)
// - Vertical offset for odd columns = HEIGHT / 2
//
export class HexMath {
  static readonly SIZE = 40; // Radius of hexagon (center to corner/point)
  
  // FLAT-TOP dimensions:
  // Width = 2 * SIZE (point to point, horizontal)
  // Height = sqrt(3) * SIZE (flat edge to flat edge, vertical)
  static readonly WIDTH = HexMath.SIZE * 2;
  static readonly HEIGHT = Math.sqrt(3) * HexMath.SIZE;
  
  // Horizontal distance between hex centers (columns)
  static readonly HORIZ = HexMath.SIZE * 1.5; // = WIDTH * 3/4
  // Vertical distance between hex centers (rows)  
  static readonly VERT = HexMath.HEIGHT;
  
  // Convert axial coordinates to pixel coordinates (FLAT-TOP hexagons)
  // For flat-top: x depends mainly on q, y depends on r with offset based on q
  static hexToPixel(hex: HexCoord): { x: number; y: number } {
    const x = HexMath.HORIZ * hex.q;
    const y = HexMath.HEIGHT * (hex.r + hex.q * 0.5);
    return { x, y };
  }
  
  // Convert pixel coordinates to axial coordinates (FLAT-TOP)
  static pixelToHex(x: number, y: number): HexCoord {
    // Inverse of hexToPixel:
    // x = HORIZ * q  =>  q = x / HORIZ
    // y = HEIGHT * (r + q * 0.5)  =>  r = y / HEIGHT - q * 0.5
    const q = x / HexMath.HORIZ;
    const r = y / HexMath.HEIGHT - q * 0.5;
    return HexMath.hexRound({ q, r });
  }
  
  // Round fractional hex coordinates to nearest hex using cube coordinates
  static hexRound(hex: { q: number; r: number }): HexCoord {
    // Convert axial to cube coordinates
    const s = -hex.q - hex.r;
    
    let rq = Math.round(hex.q);
    let rr = Math.round(hex.r);
    let rs = Math.round(s);
    
    const qDiff = Math.abs(rq - hex.q);
    const rDiff = Math.abs(rr - hex.r);
    const sDiff = Math.abs(rs - s);
    
    // Reset the component with largest rounding error
    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }
    // else: rs would be reset but we don't need it for axial
    
    return { q: rq, r: rr };
  }
  
  // Calculate distance between two hexes (in hex steps)
  static hexDistance(a: HexCoord, b: HexCoord): number {
    // Using cube coordinate distance formula
    const aq = a.q, ar = a.r, as = -a.q - a.r;
    const bq = b.q, br = b.r, bs = -b.q - b.r;
    return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
  }
  
  // Get the 6 corner points of a FLAT-TOP hexagon
  // Corners start at the RIGHT point and go counter-clockwise
  // For flat-top, first corner is at angle 0° (pointing right)
  static getHexCorners(center: { x: number; y: number }): { x: number; y: number }[] {
    const corners: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      // For FLAT-TOP: corners at 0°, 60°, 120°, 180°, 240°, 300°
      // This puts flat edges at top and bottom
      const angleDeg = 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      corners.push({
        x: center.x + HexMath.SIZE * Math.cos(angleRad),
        y: center.y + HexMath.SIZE * Math.sin(angleRad),
      });
    }
    return corners;
  }
  
  // Get hex neighbors (works the same for flat-top and pointy-top)
  static getNeighbors(hex: HexCoord): HexCoord[] {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
    ];
    return directions.map(d => ({ q: hex.q + d.q, r: hex.r + d.r }));
  }
  
  // Get bounding box for visible hex range
  static getVisibleHexBounds(
    minX: number, maxX: number, minY: number, maxY: number
  ): { minQ: number; maxQ: number; minR: number; maxR: number } {
    // Convert corners to hex coords and expand by 1 for safety
    const topLeft = HexMath.pixelToHex(minX, minY);
    const topRight = HexMath.pixelToHex(maxX, minY);
    const bottomLeft = HexMath.pixelToHex(minX, maxY);
    const bottomRight = HexMath.pixelToHex(maxX, maxY);
    
    return {
      minQ: Math.min(topLeft.q, topRight.q, bottomLeft.q, bottomRight.q) - 1,
      maxQ: Math.max(topLeft.q, topRight.q, bottomLeft.q, bottomRight.q) + 1,
      minR: Math.min(topLeft.r, topRight.r, bottomLeft.r, bottomRight.r) - 1,
      maxR: Math.max(topLeft.r, topRight.r, bottomLeft.r, bottomRight.r) + 1,
    };
  }
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
