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
  isOnTheFly?: boolean; // True if this is a quick-created token (not from character list)
  movementSpeed?: number; // Movement speed in hexes (only for character tokens)
}

// A wall hex that blocks movement
export interface WallHex {
  q: number;
  r: number;
}

// An image placed on the map (new layer below drawings)
export interface MapImage {
  id: string;
  src: string; // Base64 or URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number; // layering order
}

// Individual map data (formerly BattlemapData)
export interface MapData {
  id: string;
  name: string;
  
  // Tokens on the map
  tokens: BattlemapToken[];
  
  // Drawing strokes
  strokes: BattlemapStroke[];
  
  // Wall hexes that block movement
  walls: WallHex[];
  
  // Active measurement lines (synced in real-time)
  measurementLines: MeasurementLine[];
  
  // Background images layer
  images: MapImage[];
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Lobby containing multiple maps (formerly a single battlemap)
export interface LobbyData {
  id: string; // Same as worldName for linking
  worldName: string;
  
  // Multiple maps in this lobby
  maps: { [mapId: string]: MapData };
  
  // Currently active map ID
  activeMapId?: string;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Legacy alias for backwards compatibility
export interface BattlemapData extends MapData {
  worldName: string;
}

// Helper function to create an empty map
export function createEmptyMap(id: string, name: string): MapData {
  return {
    id,
    name,
    tokens: [],
    strokes: [],
    walls: [],
    measurementLines: [],
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Helper function to create an empty lobby
export function createEmptyLobby(worldName: string): LobbyData {
  const defaultMap = createEmptyMap('default', 'Main Map');
  return {
    id: worldName,
    worldName,
    maps: {
      'default': defaultMap
    },
    activeMapId: 'default',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// The main battlemap data structure (legacy - now part of MapData)
export interface OldBattlemapData {
  id: string;
  name: string;
  worldName: string;
  
  // Tokens on the map
  tokens: BattlemapToken[];
  
  // Drawing strokes
  strokes: BattlemapStroke[];
  
  // Wall hexes that block movement
  walls: WallHex[];
  
  // Active measurement lines (synced in real-time)
  measurementLines: MeasurementLine[];
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Helper function to create an empty battlemap (legacy - creates a lobby now)
export function createEmptyBattlemap(id: string, name: string, worldName: string): BattlemapData {
  return {
    id,
    name,
    worldName,
    tokens: [],
    strokes: [],
    walls: [],
    measurementLines: [],
    images: [],
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
    const directDist = HexMath.hexDistance(start, end);
    if (directDist > maxDistance) {
      return null; // Too far even in straight line
    }
    
    const wallSet = new Set(walls.map(w => HexMath.hexKey(w)));
    const startKey = HexMath.hexKey(start);
    const endKey = HexMath.hexKey(end);
    
    if (wallSet.has(endKey)) {
      return null; // Destination is a wall
    }
    
    // Early exit if start === end
    if (startKey === endKey) {
      return [start];
    }
    
    // A* pathfinding with parent pointers (avoids path copying)
    // Priority queue implemented as sorted array (for small hex grids this is efficient enough)
    const openList: { hex: HexCoord; g: number; f: number }[] = [
      { hex: start, g: 0, f: directDist }
    ];
    const gScore = new Map<string, number>([[startKey, 0]]);
    const parent = new Map<string, HexCoord>();
    const closedSet = new Set<string>();
    
    while (openList.length > 0) {
      // Get node with lowest f score
      let bestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[bestIdx].f) {
          bestIdx = i;
        }
      }
      const current = openList.splice(bestIdx, 1)[0];
      const currentKey = HexMath.hexKey(current.hex);
      
      if (currentKey === endKey) {
        // Reconstruct path
        const path: HexCoord[] = [];
        let node: HexCoord | undefined = current.hex;
        while (node) {
          path.unshift(node);
          node = parent.get(HexMath.hexKey(node));
        }
        return path;
      }
      
      if (current.g >= maxDistance) {
        continue; // Can't go further from this node
      }
      
      closedSet.add(currentKey);
      
      for (const neighbor of HexMath.getNeighbors(current.hex)) {
        const neighborKey = HexMath.hexKey(neighbor);
        
        if (closedSet.has(neighborKey) || wallSet.has(neighborKey)) {
          continue;
        }
        
        const tentativeG = current.g + 1;
        const existingG = gScore.get(neighborKey);
        
        if (existingG !== undefined && tentativeG >= existingG) {
          continue; // Not a better path
        }
        
        gScore.set(neighborKey, tentativeG);
        parent.set(neighborKey, current.hex);
        
        const h = HexMath.hexDistance(neighbor, end);
        const f = tentativeG + h;
        
        // Check if already in open list
        const existingIdx = openList.findIndex(n => HexMath.hexKey(n.hex) === neighborKey);
        if (existingIdx >= 0) {
          openList[existingIdx].g = tentativeG;
          openList[existingIdx].f = f;
        } else {
          openList.push({ hex: neighbor, g: tentativeG, f });
        }
      }
    }
    
    return null; // No path found
  }
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
