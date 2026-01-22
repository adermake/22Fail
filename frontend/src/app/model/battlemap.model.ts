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
  
  // Grid bounds - auto-expands as content is added
  gridBounds: {
    minQ: number;
    maxQ: number;
    minR: number;
    maxR: number;
  };
  
  // Tokens on the map
  tokens: BattlemapToken[];
  
  // Drawing strokes
  strokes: BattlemapStroke[];
  
  // Active measurement lines (synced in real-time)
  measurementLines: MeasurementLine[];
  
  // Pan and zoom state (per-user, not synced)
  // viewState is handled locally
  
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
    gridBounds: {
      minQ: -5,
      maxQ: 5,
      minR: -5,
      maxR: 5,
    },
    tokens: [],
    strokes: [],
    measurementLines: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Hexagon math utilities
export class HexMath {
  static readonly SIZE = 40; // Radius of hexagon (center to corner)
  static readonly WIDTH = HexMath.SIZE * 2;
  static readonly HEIGHT = Math.sqrt(3) * HexMath.SIZE;
  
  // Convert axial coordinates to pixel coordinates (flat-top hexagons)
  static hexToPixel(hex: HexCoord): { x: number; y: number } {
    const x = HexMath.SIZE * (Math.sqrt(3) * hex.q + Math.sqrt(3)/2 * hex.r);
    const y = HexMath.SIZE * (3/2 * hex.r);
    return { x, y };
  }
  
  // Convert pixel coordinates to axial coordinates
  static pixelToHex(x: number, y: number): HexCoord {
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / HexMath.SIZE;
    const r = (2/3 * y) / HexMath.SIZE;
    return HexMath.hexRound({ q, r });
  }
  
  // Round fractional hex coordinates to nearest hex
  static hexRound(hex: { q: number; r: number }): HexCoord {
    const s = -hex.q - hex.r;
    
    let rq = Math.round(hex.q);
    let rr = Math.round(hex.r);
    const rs = Math.round(s);
    
    const qDiff = Math.abs(rq - hex.q);
    const rDiff = Math.abs(rr - hex.r);
    const sDiff = Math.abs(rs - s);
    
    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }
    
    return { q: rq, r: rr };
  }
  
  // Calculate distance between two hexes
  static hexDistance(a: HexCoord, b: HexCoord): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  }
  
  // Get the 6 corner points of a hexagon (flat-top)
  static getHexCorners(center: { x: number; y: number }): { x: number; y: number }[] {
    const corners: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = 60 * i; // No offset for flat-top
      const angleRad = (Math.PI / 180) * angleDeg;
      corners.push({
        x: center.x + HexMath.SIZE * Math.cos(angleRad),
        y: center.y + HexMath.SIZE * Math.sin(angleRad),
      });
    }
    return corners;
  }
  
  // Get hex neighbors
  static getNeighbors(hex: HexCoord): HexCoord[] {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
    ];
    return directions.map(d => ({ q: hex.q + d.q, r: hex.r + d.r }));
  }
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
