/**
 * Hex math for the world map (macro tiles + sub-hex grid).
 * Ported from the OpenSeadragon HexMap prototype.
 */

import { MacroTile, SubHexRef } from '../model/world-map.model';
import { HexCoord, Point } from '../model/lobby.model';

export const HEX_WIDTH = 3128;
export const HEX_HEIGHT = 3620;
export const X_SPACING = HEX_WIDTH;
export const Y_SPACING = HEX_HEIGHT * 0.75;
export const X_OFFSET = HEX_WIDTH / 2;
export const X_DOCK = 21.5;
export const Y_DOCK = 25;

export const SUB_HEX_RADIUS = 30;
export const SUB_HEX_WIDTH = 2 * SUB_HEX_RADIUS;
export const SUB_HEX_HEIGHT = Math.sqrt(3) * SUB_HEX_RADIUS;
export const SUB_X_SPACING = SUB_HEX_WIDTH * 0.75;
export const SUB_Y_SPACING = SUB_HEX_HEIGHT;
export const SUB_HEX_CENTER_X = SUB_HEX_WIDTH / 2 + 4;
export const SUB_HEX_CENTER_Y = SUB_HEX_HEIGHT / 2 + 4;

/** 4 km per sub-hex for the ruler */
export const KM_PER_SUB_HEX = 4;

/** Parse hex coordinates from filenames like hex_1_0.png */
export function parseHexFilename(name: string): { q: number; r: number } | null {
  const base = name.replace(/\.[^.]+$/, '');
  const match = base.match(/hex[_-]?(-?\d+)[_-](-?\d+)/i);
  if (!match) return null;
  return { q: parseInt(match[1], 10), r: parseInt(match[2], 10) };
}

export function macroTilePosition(q: number, r: number, override?: { x?: number; y?: number }): Point {
  if (override?.x != null && override?.y != null) {
    return { x: override.x, y: override.y };
  }
  const y = q * Y_SPACING + (r % 2) * Y_DOCK + (q % 2) * -Y_DOCK * 0.5;
  const x = r * (X_SPACING - X_DOCK) + (q % 2) * (X_OFFSET - X_DOCK * 1.5);
  return { x, y };
}

export function getMacroTilePosition(tile: MacroTile): Point {
  return macroTilePosition(tile.q, tile.r, { x: tile.x, y: tile.y });
}

export function subPixelToHex(x: number, y: number): HexCoord {
  x -= SUB_HEX_CENTER_X;
  y -= SUB_HEX_CENTER_Y;
  const q = Math.round(x / SUB_X_SPACING);
  const r = Math.round((y - (q & 1) * (SUB_Y_SPACING / 2)) / SUB_Y_SPACING);
  return { q, r };
}

export function subHexToPixel(hex: HexCoord): Point {
  return {
    x: hex.q * SUB_X_SPACING + SUB_HEX_CENTER_X,
    y: hex.r * SUB_Y_SPACING + (hex.q & 1) * (SUB_Y_SPACING / 2) + SUB_HEX_CENTER_Y,
  };
}

export function subHexToWorldPixel(tile: MacroTile, subQ: number, subR: number): Point {
  const pos = getMacroTilePosition(tile);
  const local = subHexToPixel({ q: subQ, r: subR });
  return { x: pos.x + local.x, y: pos.y + local.y };
}

export function worldPixelToSubHex(globalX: number, globalY: number): HexCoord {
  return subPixelToHex(globalX, globalY);
}

export function oddqHexDistance(a: HexCoord, b: HexCoord): number {
  const toAxial = (h: HexCoord) => ({
    q: h.q,
    r: h.r - (h.q - (h.q & 1)) / 2,
  });
  const ac = toAxial(a);
  const bc = toAxial(b);
  return (
    (Math.abs(ac.q - bc.q) +
      Math.abs(ac.q + ac.r - bc.q - bc.r) +
      Math.abs(ac.r - bc.r)) /
    2
  );
}

export function subHexWorldDistance(a: Point, b: Point): number {
  const ha = worldPixelToSubHex(a.x, a.y);
  const hb = worldPixelToSubHex(b.x, b.y);
  return oddqHexDistance(ha, hb);
}

export function drawFlatHexPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Sub-hexes visible inside a macro tile (approximate grid bounds) */
export function getSubHexesInMacroTile(): HexCoord[] {
  const cols = Math.ceil((HEX_WIDTH - SUB_HEX_CENTER_X) / SUB_X_SPACING) + 2;
  const rows = Math.ceil((HEX_HEIGHT - SUB_HEX_CENTER_Y) / SUB_Y_SPACING) + 2;
  const hexes: HexCoord[] = [];
  for (let q = -1; q <= cols; q++) {
    for (let r = -1; r <= rows; r++) {
      const center = subHexToPixel({ q, r });
      if (
        center.x >= -SUB_HEX_RADIUS &&
        center.x <= HEX_WIDTH + SUB_HEX_RADIUS &&
        center.y >= -SUB_HEX_RADIUS &&
        center.y <= HEX_HEIGHT + SUB_HEX_RADIUS
      ) {
        hexes.push({ q, r });
      }
    }
  }
  return hexes;
}

export const MACRO_SUB_HEXES = getSubHexesInMacroTile();

export function findMacroTileAtWorldPixel(
  tiles: MacroTile[],
  wx: number,
  wy: number
): { tile: MacroTile; localX: number; localY: number } | null {
  for (const tile of tiles) {
    const pos = getMacroTilePosition(tile);
    if (
      wx >= pos.x &&
      wx <= pos.x + HEX_WIDTH &&
      wy >= pos.y &&
      wy <= pos.y + HEX_HEIGHT
    ) {
      return { tile, localX: wx - pos.x, localY: wy - pos.y };
    }
  }
  return null;
}

export function pickSubHexAtWorldPixel(
  tiles: MacroTile[],
  wx: number,
  wy: number
): (SubHexRef & { worldX: number; worldY: number }) | null {
  const hit = findMacroTileAtWorldPixel(tiles, wx, wy);
  if (!hit) return null;
  const sub = subPixelToHex(hit.localX, hit.localY);
  const center = subHexToWorldPixel(hit.tile, sub.q, sub.r);
  return {
    macroQ: hit.tile.q,
    macroR: hit.tile.r,
    subQ: sub.q,
    subR: sub.r,
    worldX: center.x,
    worldY: center.y,
  };
}
