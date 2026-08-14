/**
 * Map Editor — data model (format v2).
 *
 * The v1 world map stored the map as uploaded Wonderdraft PNGs (`MacroTile`), which made
 * secrets impossible to hide (fog was the only visibility mechanism) and every edit a
 * round-trip through an external tool. v2 stores the map as *data*: chunked raster layers
 * for terrain, and id'd vector objects for everything placed on top.
 *
 * Two consequences shape this file:
 *  - Every vector object carries `vis`, so a secret can live on the map without being
 *    revealed by fog. The server strips `vis: 'secret'` objects from non-GM payloads —
 *    hiding them client-side only would leave them readable in devtools.
 *  - Rasters are chunked, so a huge map never has to be resident (or synced) in full.
 */

import { Point } from '../model/lobby.model';

export const MAP_FORMAT_VERSION = 2;

// ============================================
// Raster layers
// ============================================

export type RasterLayer = 'height' | 'landColor' | 'waterColor';

export const RASTER_LAYERS: readonly RasterLayer[] = ['height', 'landColor', 'waterColor'];

/**
 * World-pixel span of one chunk, identical for every layer.
 *
 * Keeping the *world* size constant (rather than the texel count) means all layers share
 * one chunk grid, so dirty-tracking, streaming and eviction work off a single `cx,cy` —
 * layers just differ in how many texels they pack into that square.
 */
export const CHUNK_WORLD_SIZE = 2048;

/** Texels per chunk side, per layer. Colour layers are coarse — they hold broad washes. */
export const LAYER_TEXELS: Record<RasterLayer, number> = {
  height: 512, // 4 world px per texel — coastline detail comes from the shader, not texels
  landColor: 256, // 8 world px per texel
  waterColor: 256,
};

/** World pixels per texel, per layer. */
export function layerScale(layer: RasterLayer): number {
  return CHUNK_WORLD_SIZE / LAYER_TEXELS[layer];
}

export interface ChunkCoord {
  cx: number;
  cy: number;
}

export function chunkKey(layer: RasterLayer, cx: number, cy: number): string {
  return `${layer}/${cx}/${cy}`;
}

export function parseChunkKey(key: string): { layer: RasterLayer; cx: number; cy: number } | null {
  const parts = key.split('/');
  if (parts.length !== 3) return null;
  const layer = parts[0] as RasterLayer;
  if (!RASTER_LAYERS.includes(layer)) return null;
  const cx = Number(parts[1]);
  const cy = Number(parts[2]);
  if (Number.isNaN(cx) || Number.isNaN(cy)) return null;
  return { layer, cx, cy };
}

/** Chunk containing a world point (floor division — correct for negative coords). */
export function worldToChunk(x: number, y: number): ChunkCoord {
  return {
    cx: Math.floor(x / CHUNK_WORLD_SIZE),
    cy: Math.floor(y / CHUNK_WORLD_SIZE),
  };
}

/** Top-left world position of a chunk. */
export function chunkOrigin(cx: number, cy: number): Point {
  return { x: cx * CHUNK_WORLD_SIZE, y: cy * CHUNK_WORLD_SIZE };
}

// ============================================
// Vector objects
// ============================================

/**
 * `secret` objects are GM-only until revealed. Revealing flips this to `public` on the
 * server, which then broadcasts the object to players for the first time.
 */
export type Visibility = 'public' | 'secret';

export type ObjectCollection = 'symbols' | 'labels' | 'regions' | 'markers';

export const OBJECT_COLLECTIONS: readonly ObjectCollection[] = [
  'symbols',
  'labels',
  'regions',
  'markers',
];

export interface MapObjectBase {
  id: string;
  /** World position. For regions this is the centroid, cached for the spatial index. */
  x: number;
  y: number;
  vis: Visibility;
}

export interface MapSymbol extends MapObjectBase {
  /** Manifest sprite key, e.g. `trees/oak/oak_03`. */
  asset: string;
  /** Variation group (the containing folder), e.g. `trees/oak`. Used to re-roll variations. */
  group: string;
  scale: number;
  rotation: number;
  flipX?: boolean;
  /** Only meaningful for `colorable` sprites; others keep their baked colour. */
  tint?: string;
}

export interface LabelStyle {
  fontFamily: string;
  fontSize: number;
  fill: string;
  outline: string;
  outlineWidth: number;
  /** Arc bend, -1 (bow down) … 0 (straight) … 1 (bow up). */
  curvature: number;
  letterSpacing: number;
}

export interface LabelPreset {
  id: string;
  name: string;
  style: LabelStyle;
}

export interface MapLabel extends MapObjectBase {
  text: string;
  rotation: number;
  style: LabelStyle;
}

export interface MapRegion extends MapObjectBase {
  /** World-space path. Implicitly closed. */
  points: Point[];
  color: string;
  thickness: number;
  /** Dash pattern in world px. */
  dash: number;
  gap: number;
  fill?: string;
  fillAlpha?: number;
}

/** A GM note pinned to a spot — "secret hole here" without needing a symbol. */
export interface MapMarker extends MapObjectBase {
  note: string;
}

export type AnyMapObject = MapSymbol | MapLabel | MapRegion | MapMarker;

// ============================================
// Settings & document
// ============================================

export interface MapSettings {
  /**
   * Base colours for unpainted terrain.
   *
   * Deliberately separate from the palettes: the palettes are *brush* colours, so selecting
   * a swatch loads the brush without repainting the whole map. Changing a base here is the
   * only thing that recolours untouched terrain.
   */
  landBase: string;
  waterBase: string;
  /** Paper texture asset key, multiplied over the whole terrain stack. */
  paperTexture: string;
  paperOpacity: number;
  /** Sub-hex grid overlay visibility (GM preference, shared). */
  showGrid: boolean;
}

export function defaultSettings(): MapSettings {
  return {
    landBase: '#7a8f5a',
    waterBase: '#3f6d8c',
    paperTexture: '',
    paperOpacity: 0.35,
    showGrid: true,
  };
}

export interface MapEditorData {
  formatVersion: number;
  worldName: string;

  symbols: MapSymbol[];
  labels: MapLabel[];
  regions: MapRegion[];
  markers: MapMarker[];

  labelPresets: LabelPreset[];
  /** Stored colours the brushes pick from — no free-form colour picking while drawing. */
  landPalette: string[];
  waterPalette: string[];

  settings: MapSettings;

  /** Revealed sub-hexes as global `q,r` keys (v1's macro-relative 4-tuple is gone). */
  fog: { revealed: string[] };

  /**
   * `chunkKey` → version. Tells a joining client which chunks exist, and lets a
   * `chunk` op invalidate one cache entry instead of shipping pixels over the socket.
   */
  chunkVersions: Record<string, number>;

  updatedAt: number;
}

export function createEmptyMapEditorData(worldName: string): MapEditorData {
  return {
    formatVersion: MAP_FORMAT_VERSION,
    worldName,
    symbols: [],
    labels: [],
    regions: [],
    markers: [],
    labelPresets: [],
    landPalette: ['#7a8f5a', '#8fa06b', '#a8b581', '#c2c79a', '#6b7d4e'],
    waterPalette: ['#3f6d8c', '#4f7f9e', '#6394b0', '#2e5670'],
    settings: defaultSettings(),
    fog: { revealed: [] },
    chunkVersions: {},
    updatedAt: Date.now(),
  };
}

// ============================================
// Sync ops
// ============================================

/**
 * Op-based sync. v1 patched whole arrays (`patch('macroTiles', tiles)`), which would ship
 * the entire symbol collection on every brush click once the map has real content.
 *
 * `chunk` ops deliberately carry no pixels — just coordinates and a version, so receivers
 * refetch that one chunk over HTTP instead of pushing megabytes through the socket.
 */
export type MapOp =
  | { t: 'add'; c: ObjectCollection; v: AnyMapObject }
  | { t: 'upd'; c: ObjectCollection; id: string; v: Record<string, unknown> }
  | { t: 'del'; c: ObjectCollection; id: string }
  | { t: 'chunk'; layer: RasterLayer; cx: number; cy: number; ver: number }
  /** Small scalar state: palettes, settings, fog, presets. Dot path into `MapEditorData`. */
  | { t: 'set'; path: string; value: unknown };

/** Apply an op in place. Shared by the client store and the backend, so they cannot drift. */
export function applyMapOp(data: MapEditorData, op: MapOp): void {
  switch (op.t) {
    case 'add': {
      const list = data[op.c] as AnyMapObject[];
      if (!list.some(o => o.id === op.v.id)) list.push(op.v);
      break;
    }
    case 'upd': {
      const list = data[op.c] as AnyMapObject[];
      const obj = list.find(o => o.id === op.id);
      if (obj) Object.assign(obj, op.v);
      break;
    }
    case 'del': {
      const list = data[op.c] as AnyMapObject[];
      const i = list.findIndex(o => o.id === op.id);
      if (i >= 0) list.splice(i, 1);
      break;
    }
    case 'chunk': {
      data.chunkVersions[chunkKey(op.layer, op.cx, op.cy)] = op.ver;
      break;
    }
    case 'set': {
      const parts = op.path.split('.').filter(Boolean);
      if (parts.length === 0) return;
      let obj: any = data;
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
        if (obj == null) return;
      }
      obj[parts[parts.length - 1]] = op.value;
      break;
    }
  }
  data.updatedAt = Date.now();
}

export type { Point };
