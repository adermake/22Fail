/**
 * World Map Model
 */

import { HexCoord, Point, Stroke, Token, generateId } from './lobby.model';

export interface MacroTile {
  id: string;
  q: number;
  r: number;
  imageId: string;
  x?: number;
  y?: number;
}

/** Token on the world map (extends lobby Token with macro/sub hex location). */
export interface WorldMapToken extends Token {
  macroQ: number;
  macroR: number;
  subQ: number;
  subR: number;
}

export interface WorldMapData {
  worldName: string;
  macroTiles: MacroTile[];
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

export type WorldMapTool = 'cursor' | 'draw' | 'measure';

export type FogMode = 'neutral' | 'reveal' | 'hide';

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

export function createQuickToken(ref: SubHexRef, name = 'Quick Token'): WorldMapToken {
  return {
    id: generateId(),
    name,
    characterId: '',
    position: { q: ref.subQ, r: ref.subR },
    macroQ: ref.macroQ,
    macroR: ref.macroR,
    subQ: ref.subQ,
    subR: ref.subR,
    isQuickToken: true,
  };
}

export type { Point, Stroke, HexCoord, Token };
