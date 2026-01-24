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

// AI Color-to-Prompt mapping for regional generation
export interface AiColorPrompt {
  id: string;
  color: string;      // Hex color like '#22c55e'
  name: string;       // Display name like 'Forest'
  prompt: string;     // What to generate for this color, e.g., 'dense forest with tall pine trees'
}

// Global AI generation settings (stored in localStorage)
export interface GlobalAiSettings {
  colorPrompts: AiColorPrompt[]; // User's custom color palette
  basePrompt: string; // Base prompt for all D&D maps
  generalRegionPrompt: string; // Added to every region (e.g., "best quality, detailed")
  negativePrompt: string; // Negative prompt for all generations
  steps: number;
  cfg: number;
  denoise: number;
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
  isOnTheFly?: boolean; // True if this is a quick-created token (not from character list)
  movementSpeed?: number; // Movement speed in hexes (only for character tokens)
}

// A wall hex that blocks movement
export interface WallHex {
  q: number;
  r: number;
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
  
  // AI Drawing strokes (separate from regular drawing)
  aiStrokes: BattlemapStroke[];
  
  // AI Color-to-Prompt mappings for regional generation
  aiColorPrompts: AiColorPrompt[];
  
  // Wall hexes that block movement
  walls: WallHex[];
  
  // Active measurement lines (synced in real-time)
  measurementLines: MeasurementLine[];
  
  // AI Layer settings
  aiPrompt?: string; // Custom prompt for AI generation
  aiSettings?: { // AI generation settings
    seed?: number; // -1 for random
    steps?: number;
    cfg?: number;
    denoise?: number;
    generalRegionPrompt?: string; // Added to every region
    negativePrompt?: string; // Negative prompt for generation
  };
  
  // Legacy AI layer (single image) - kept for backwards compat
  aiLayerImage?: string; // Base64 encoded AI generated image
  aiLayerBounds?: { // World coordinates where the AI image was captured
    centerX: number;
    centerY: number;
    worldSize: number; // Size in world units that the 1024x1024 image covers
  };
  
  // AI Canvas - persistent accumulated generations (tiles composited together)
  // TODO: Migrate to this system fully
  aiCanvas?: {
    tiles: Array<{
      id: string;
      image: string; // Base64 encoded
      worldBounds: { // Exact world coordinates this tile covers
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
      };
      generatedAt: number;
    }>;
  };
  
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
    aiStrokes: [],
    aiColorPrompts: getDefaultAiColorPrompts(),
    aiCanvas: { tiles: [] },
    walls: [],
    measurementLines: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Default AI color-prompt mappings for new battlemaps
export function getDefaultAiColorPrompts(): AiColorPrompt[] {
  return [
    { id: 'forest', color: '#22c55e', name: 'Forest', prompt: 'dense forest with tall trees and undergrowth' },
    { id: 'water', color: '#3b82f6', name: 'Water', prompt: 'clear blue water, river or lake' },
    { id: 'path', color: '#a16207', name: 'Path', prompt: 'dirt path or cobblestone road' },
    { id: 'building', color: '#dc2626', name: 'Building', prompt: 'medieval wooden building with thatched roof' },
    { id: 'stone', color: '#6b7280', name: 'Stone', prompt: 'gray stone walls or rocky terrain' },
    { id: 'grass', color: '#86efac', name: 'Grass', prompt: 'open grassy field or meadow' },
    { id: 'sand', color: '#fcd34d', name: 'Sand', prompt: 'sandy beach or desert terrain' },
    { id: 'mountain', color: '#78716c', name: 'Mountain', prompt: 'rocky mountain or cliff face' },
  ];
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
  
  // Get a line of hexes between two points (for movement path)
  static hexLineDraw(a: HexCoord, b: HexCoord): HexCoord[] {
    const N = HexMath.hexDistance(a, b);
    if (N === 0) return [a];
    
    const results: HexCoord[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const q = a.q + (b.q - a.q) * t;
      const r = a.r + (b.r - a.r) * t;
      results.push(HexMath.hexRound({ q, r }));
    }
    return results;
  }
  
  // Check if a hex is in a wall set
  static isWall(hex: HexCoord, walls: WallHex[]): boolean {
    return walls.some(w => w.q === hex.q && w.r === hex.r);
  }
  
  // Get hex key for use in Sets/Maps
  static hexKey(hex: HexCoord): string {
    return `${hex.q},${hex.r}`;
  }
  
  // Parse hex key back to coordinates
  static parseHexKey(key: string): HexCoord {
    const [q, r] = key.split(',').map(Number);
    return { q, r };
  }
  
  // Find path avoiding walls using BFS (returns null if no path exists within maxDistance)
  static findPath(
    start: HexCoord, 
    end: HexCoord, 
    walls: WallHex[], 
    maxDistance: number
  ): HexCoord[] | null {
    if (HexMath.hexDistance(start, end) > maxDistance) {
      return null; // Too far even in straight line
    }
    
    const wallSet = new Set(walls.map(w => HexMath.hexKey(w)));
    const startKey = HexMath.hexKey(start);
    const endKey = HexMath.hexKey(end);
    
    if (wallSet.has(endKey)) {
      return null; // Destination is a wall
    }
    
    // BFS
    const queue: { hex: HexCoord; path: HexCoord[]; distance: number }[] = [
      { hex: start, path: [start], distance: 0 }
    ];
    const visited = new Set<string>([startKey]);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (HexMath.hexKey(current.hex) === endKey) {
        return current.path;
      }
      
      if (current.distance >= maxDistance) {
        continue; // Can't go further
      }
      
      for (const neighbor of HexMath.getNeighbors(current.hex)) {
        const neighborKey = HexMath.hexKey(neighbor);
        
        if (visited.has(neighborKey) || wallSet.has(neighborKey)) {
          continue;
        }
        
        visited.add(neighborKey);
        queue.push({
          hex: neighbor,
          path: [...current.path, neighbor],
          distance: current.distance + 1
        });
      }
    }
    
    return null; // No path found
  }
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
