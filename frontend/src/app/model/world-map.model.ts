/**
 * World Map Model
 *
 * Large-scale hex world map linked to a world.
 * URL: /world-map/:worldName
 */

import { HexCoord, Point, Stroke, generateId } from './lobby.model';

export interface MacroTile {
  id: string;
  q: number;
  r: number;
  imageId: string;
  /** Manual X override in world pixel space */
  x?: number;
  /** Manual Y override in world pixel space */
  y?: number;
}

export interface WorldMapToken {
  id: string;
  name: string;
  macroQ: number;
  macroR: number;
  subQ: number;
  subR: number;
  color?: string;
  isQuickToken?: boolean;
}

export interface WorldMapData {
  worldName: string;
  macroTiles: MacroTile[];
  /** Keys "macroQ,macroR,subQ,subR" for revealed sub-hexes */
  revealedSubHexes: string[];
  strokes: Stroke[];
  tokens: WorldMapToken[];
  updatedAt: number;
}

export interface SubHexRef {
  macroQ: number;
  macroR: number;
  subQ: number;
  subR: number;
}

export function subHexKey(ref: SubHexRef): string {
  return `${ref.macroQ},${ref.macroR},${ref.subQ},${ref.subR}`;
}

export function parseSubHexKey(key: string): SubHexRef | null {
  const parts = key.split(',').map(Number);
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return null;
  return { macroQ: parts[0], macroR: parts[1], subQ: parts[2], subR: parts[3] };
}

export function createEmptyWorldMap(worldName: string): WorldMapData {
  return {
    worldName,
    macroTiles: [],
    revealedSubHexes: [],
    strokes: [],
    tokens: [],
    updatedAt: Date.now(),
  };
}

export function createQuickToken(ref: SubHexRef, name = 'Token'): WorldMapToken {
  return {
    id: generateId(),
    name,
    macroQ: ref.macroQ,
    macroR: ref.macroR,
    subQ: ref.subQ,
    subR: ref.subR,
    color: '#e74c3c',
    isQuickToken: true,
  };
}

export type WorldMapTool =
  | 'pan'
  | 'select'
  | 'reveal'
  | 'recover'
  | 'draw'
  | 'erase'
  | 'measure'
  | 'token'
  | 'tile';

/** Re-export for convenience */
export type { Point, Stroke, HexCoord };
