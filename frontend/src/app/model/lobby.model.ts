/**
 * Lobby Model
 * 
 * Clean data structures for the lobby system.
 * A lobby is a virtual tabletop linked to a world.
 * 
 * URL: /lobby/:worldName links to /world/:worldName
 * 
 * Features:
 * - Multiple maps within a lobby
 * - Reusable image library
 * - Character tokens on hex grid
 * - Drawing layer
 * - Wall/obstacle system
 * - Real-time sync
 */

// ============================================
// Core Coordinates
// ============================================

/** Axial coordinate for hexagon positioning */
export interface HexCoord {
  q: number; // column
  r: number; // row
}

/** Canvas pixel coordinate */
export interface Point {
  x: number;
  y: number;
}

// ============================================
// Drawing Layer
// ============================================

/** A freehand drawing stroke */
export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  lineWidth: number;
  isEraser: boolean;
}

/** A texture stamp/brush stroke */
export interface TextureStroke {
  id: string;
  points: Point[];
  textureId: string;
  brushSize: number;
  textureScale?: number; // Tiling scale (default 1.0, 0.1 = 10x smaller tiles)
  isEraser?: boolean; // True if this stroke erases textures
  brushType?: 'hard' | 'soft'; // Hard edge or soft/airbrush edge
  colorBlend?: number; // 0-100: blend between texture and solid color
  blendColor?: string; // Color to blend with texture
  hueShift?: number; // -180 to 180 degrees hue rotation
}

// ============================================
// Tokens
// ============================================

/** A character token on the map */
export interface Token {
  id: string;
  characterId: string;
  name: string;
  portrait?: string; // Image ID or URL (NOT base64 - use ImageService)
  position: HexCoord;
  team?: string; // Team color for grouping
  isQuickToken?: boolean; // True if created on-the-fly (not from character list)
  movementSpeed?: number; // Movement speed in hexes
}

// ============================================
// Images
// ============================================

/** An image placed on the map (background layer) */
export interface MapImage {
  id: string;
  imageId: string; // Reference to ImageService image ID (NOT base64)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number; // layering order (higher = on top)
  layer?: 'background' | 'foreground'; // Super layer (default: background)
}

/** An image in the reusable library */
export interface LibraryImage {
  id: string;
  name: string;
  imageId: string; // Reference to ImageService image ID
  width: number; // Default width when placed
  height: number; // Default height when placed
  createdAt: number;
}

/** A tileable texture in the library (globally shared across all lobbies) */
export interface LibraryTexture {
  id: string;
  name: string;
  textureId: string; // Reference to texture image ID
  tileSize: number; // Size of one tile in pixels
  createdAt: number;
}

// ============================================
// Walls
// ============================================

/** A wall hex that blocks movement */
export interface WallHex {
  q: number;
  r: number;
}

// ============================================
// Measurement
// ============================================

/** A measurement line for distance tracking */
export interface MeasurementLine {
  id: string;
  start: Point;
  end: Point;
  createdBy: string;
}

// ============================================
// Map Data
// ============================================

/** A single map within a lobby */
export interface LobbyMap {
  id: string;
  name: string;
  tokens: Token[];
  strokes: Stroke[];
  textureStrokes: TextureStroke[];
  walls: WallHex[];
  measurementLines: MeasurementLine[];
  images: MapImage[];
  backgroundColor?: string; // Background color (default: #e5e7eb)
  createdAt: number;
  updatedAt: number;
}

// ============================================
// Lobby Data
// ============================================

/** The main lobby container - links to a world */
export interface LobbyData {
  id: string; // Same as worldName
  worldName: string;
  maps: { [mapId: string]: LobbyMap };
  activeMapId: string;
  imageLibrary: LibraryImage[];
  textureLibrary: LibraryTexture[]; // Global texture library
  createdAt: number;
  updatedAt: number;
}

// ============================================
// Factory Functions
// ============================================

/** Generate a unique ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/** Create an empty map */
export function createEmptyMap(id: string, name: string): LobbyMap {
  return {
    id,
    name,
    tokens: [],
    strokes: [],
    textureStrokes: [],
    walls: [],
    measurementLines: [],
    images: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Create an empty lobby */
export function createEmptyLobby(worldName: string): LobbyData {
  const defaultMap = createEmptyMap('default', 'Main Map');
  return {
    id: worldName,
    worldName,
    maps: { default: defaultMap },
    activeMapId: 'default',
    imageLibrary: [],
    textureLibrary: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ============================================
// Hexagon Math Utilities
// ============================================

/** Hexagon configuration - FLAT-TOP orientation */
export const HEX_SIZE = 32; // Radius in pixels

/**
 * Hex math utilities for flat-top hexagons.
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */
export const HexMath = {
  /** Convert axial coordinates to pixel center */
  hexToPixel(coord: HexCoord): Point {
    const x = HEX_SIZE * (3/2 * coord.q);
    const y = HEX_SIZE * (Math.sqrt(3)/2 * coord.q + Math.sqrt(3) * coord.r);
    return { x, y };
  },

  /** Convert pixel position to axial coordinates (rounded) */
  pixelToHex(point: Point): HexCoord {
    const q = (2/3 * point.x) / HEX_SIZE;
    const r = (-1/3 * point.x + Math.sqrt(3)/3 * point.y) / HEX_SIZE;
    return this.roundHex({ q, r });
  },

  /** Round floating-point hex coords to nearest hex */
  roundHex(coord: { q: number; r: number }): HexCoord {
    const s = -coord.q - coord.r;
    
    let rQ = Math.round(coord.q);
    let rR = Math.round(coord.r);
    const rS = Math.round(s);

    const qDiff = Math.abs(rQ - coord.q);
    const rDiff = Math.abs(rR - coord.r);
    const sDiff = Math.abs(rS - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rQ = -rR - rS;
    } else if (rDiff > sDiff) {
      rR = -rQ - rS;
    }

    return { q: rQ, r: rR };
  },

  /** Calculate distance between two hexes */
  hexDistance(a: HexCoord, b: HexCoord): number {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  },

  /** Get corner points for a flat-top hex at given center */
  getHexCorners(center: Point): Point[] {
    const corners: Point[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i);
      corners.push({
        x: center.x + HEX_SIZE * Math.cos(angle),
        y: center.y + HEX_SIZE * Math.sin(angle),
      });
    }
    return corners;
  },

  /** Get hex width (flat-top) */
  get hexWidth(): number {
    return HEX_SIZE * 2;
  },

  /** Get hex height (flat-top) */
  get hexHeight(): number {
    return HEX_SIZE * Math.sqrt(3);
  },
};
