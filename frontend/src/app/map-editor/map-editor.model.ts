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
 * Authored detail tiers.
 *
 * Not a pyramid: no tier is derived from another. Each is its own sparse chunk grid that
 * the brushes write directly, and a stroke writes its own tier *and every coarser one* in
 * the same pass (see `coarserTiers`). That is what keeps the tiers consistent — a fine
 * stroke has already published its blurred coarse version by the time anybody zooms out, so
 * nothing ever has to be derived after the fact.
 *
 * The reason this exists at all is authoring, not viewing. A brush that always wrote the
 * finest raster spanned ~300 chunks for one continent-scale stroke; each is a 3 MB texture
 * to create, paint, upload and hold resident, which no budget survives. Painting at the tier
 * you are actually looking at makes that stroke one or two chunks.
 *
 * Every tier keeps the same 512² textures and the same three layers, so a chunk costs the
 * same wherever it sits and the residency budget is untouched. Only the world area a chunk
 * covers changes.
 */
export type DetailTier = 'high' | 'med' | 'low';

/** Finest → coarsest. Order is load-bearing: `coarserTiers` and the tier chooser walk it. */
export const TIERS: readonly DetailTier[] = ['high', 'med', 'low'];

/**
 * World pixels one chunk covers, per tier — 8× apart, so `low` is 4096× the area of `high`.
 *
 * The steps are wide on purpose. Narrow steps would need many tiers to reach a whole-world
 * view, and every extra tier is another copy every fine stroke has to write.
 */
export const TIER_WORLD_SIZE: Record<DetailTier, number> = {
  high: 1024,
  med: 8192,
  low: 65536,
};

/**
 * World-pixel span of one `high` chunk, identical for every layer.
 *
 * Keeping the *world* size constant (rather than the texel count) means all layers share
 * one chunk grid, so dirty-tracking, streaming and eviction work off a single `cx,cy` —
 * layers just differ in how many texels they pack into that square.
 */
export const CHUNK_WORLD_SIZE = TIER_WORLD_SIZE.high;

/**
 * The tiers a stroke at `tier` must also write, coarsest last.
 *
 * Deliberately one-directional. Coarse edits never touch finer tiers: clearing the detail
 * under a `low` stroke would mean rewriting hundreds of `high` chunks, which is the exact
 * cost this design exists to avoid. The consequence — erasing at `low` leaves `high` detail
 * intact underneath, and it reappears when you zoom in — is the accepted trade.
 */
export function coarserTiers(tier: DetailTier): DetailTier[] {
  return TIERS.slice(TIERS.indexOf(tier) + 1);
}

/** Chunk coordinate containing a world point, at a tier. Floors, so negatives work. */
export function worldToTierChunk(x: number, y: number, tier: DetailTier): ChunkCoord {
  const span = TIER_WORLD_SIZE[tier];
  return { cx: Math.floor(x / span), cy: Math.floor(y / span) };
}

/**
 * Chunks a screenful should need.
 *
 * The tier is chosen to keep the count near this at *any* zoom — that constant is the whole
 * point of having tiers. A single grid only ever made distant chunks cheaper while their
 * number still grew as zoom⁻², which no budget could absorb.
 */
export const TARGET_CHUNKS_ON_SCREEN = 64;

/** Chunks of `tier` needed to cover a `w`×`h` world-space view, with a row of margin. */
export function chunksOnScreen(w: number, h: number, tier: DetailTier): number {
  const span = TIER_WORLD_SIZE[tier];
  return (Math.ceil(w / span) + 1) * (Math.ceil(h / span) + 1);
}

/**
 * Finest tier that still fills a `w`×`h` view with roughly `TARGET_CHUNKS_ON_SCREEN` chunks.
 *
 * **Hysteresis, and it matters more here than anywhere else.** Every tier change rebuilds
 * every cell on screen, so a boundary that flips on a hair of zoom makes the whole map tear
 * down and reassemble — which is exactly what a log of `high -> med` then `med -> high`
 * within a second, with fifty rebuilds each way, was showing.
 *
 * So the two directions are deliberately asymmetric. Going coarser happens as soon as
 * `current` no longer fits, because staying would blow the budget. Coming back to a finer
 * tier waits until it fits with room to spare, so drifting across the threshold cannot
 * ping-pong.
 */
export function chooseTier(current: DetailTier, w: number, h: number): DetailTier {
  const index = TIERS.indexOf(current);

  if (chunksOnScreen(w, h, current) > TARGET_CHUNKS_ON_SCREEN) {
    for (let i = index + 1; i < TIERS.length; i++) {
      if (chunksOnScreen(w, h, TIERS[i]) <= TARGET_CHUNKS_ON_SCREEN) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  }

  for (let i = 0; i < index; i++) {
    if (chunksOnScreen(w, h, TIERS[i]) <= TARGET_CHUNKS_ON_SCREEN * 0.6) return TIERS[i];
  }
  return current;
}

/**
 * Texels per chunk side, per layer — all 512, i.e. **2 world px per texel** across a
 * 1024-world-px chunk.
 *
 * Every layer stays 1 MB of VRAM, so a cell is 3 MB and the residency budget is unchanged.
 * Density was doubled by shrinking the chunk rather than by enlarging the texture: a 1024²
 * texture would have put a cell at 6 MB, which is what exhausted the GPU and lost the WebGL
 * context mid-stroke. Same memory, four times the detail per unit area.
 *
 * Combined with the larger `HEX_RADIUS`, a hex is now ~240 texels across instead of ~15.
 */
export const LAYER_TEXELS: Record<RasterLayer, number> = {
  height: 512,
  landColor: 512,
  waterColor: 512,
};

/** World pixels per texel, per layer. */
export function layerScale(layer: RasterLayer): number {
  return CHUNK_WORLD_SIZE / LAYER_TEXELS[layer];
}

export interface ChunkCoord {
  cx: number;
  cy: number;
}

/**
 * Identity of a stored chunk. The tier is part of it — `2,3` names a different patch of
 * world at every tier, so a key without it would collide across tiers.
 */
export function chunkKey(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): string {
  return `${layer}/${tier}/${cx}/${cy}`;
}

export function parseChunkKey(
  key: string,
): { layer: RasterLayer; tier: DetailTier; cx: number; cy: number } | null {
  const parts = key.split('/');
  if (parts.length !== 4) return null;
  const layer = parts[0] as RasterLayer;
  if (!RASTER_LAYERS.includes(layer)) return null;
  const tier = parts[1] as DetailTier;
  if (!TIERS.includes(tier)) return null;
  const cx = Number(parts[2]);
  const cy = Number(parts[3]);
  if (Number.isNaN(cx) || Number.isNaN(cy)) return null;
  return { layer, tier, cx, cy };
}

/** `high` chunk containing a world point (floor division — correct for negative coords). */
export function worldToChunk(x: number, y: number): ChunkCoord {
  return worldToTierChunk(x, y, 'high');
}

/** Top-left world position of a chunk, at a tier. */
export function chunkOrigin(cx: number, cy: number, tier: DetailTier = 'high'): Point {
  const span = TIER_WORLD_SIZE[tier];
  return { x: cx * span, y: cy * span };
}

// ============================================
// Vector objects
// ============================================

/**
 * `secret` objects are GM-only until revealed. Revealing flips this to `public` on the
 * server, which then broadcasts the object to players for the first time.
 */
export type Visibility = 'public' | 'secret';

/**
 * `tokens` and `sketch` belong to game mode, but are ordinary object collections so they
 * inherit the whole add/upd/del pipeline — optimistic apply, one op per change, and the
 * server's secret filtering — instead of growing a second sync mechanism beside it.
 */
export type ObjectCollection =
  | 'symbols'
  | 'labels'
  | 'regions'
  | 'markers'
  | 'tokens'
  | 'sketch';

export const OBJECT_COLLECTIONS: readonly ObjectCollection[] = [
  'symbols',
  'labels',
  'regions',
  'markers',
  'tokens',
  'sketch',
];

export interface MapObjectBase {
  id: string;
  /** World position. For regions this is the centroid, cached for the spatial index. */
  x: number;
  y: number;
  vis: Visibility;
  /**
   * Id of the secret group this belongs to, `''`/absent for none.
   *
   * Purely a grouping handle: `vis` alone still decides what the server hands out, so a group
   * inherits the existing stripping in `viewFor` and the reveal-as-`add` broadcast in the
   * gateway rather than introducing a second visibility mechanism that could disagree with it.
   *
   * Cleared with `''`, never `undefined` — an `upd` op crosses the socket as JSON, and
   * `JSON.stringify` drops undefined-valued keys, so the sender would see the object leave the
   * group while every other client and the file on disk kept it.
   */
  secret?: string;
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
  /**
   * Preset this label follows, if any.
   *
   * Kept so that re-saving a preset under the same name can restyle every label using it —
   * which is the point of a preset. The style is still stored inline, so a label keeps
   * working if its preset is deleted.
   */
  presetId?: string;
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

/**
 * A named bundle of objects the GM hides and reveals as one thing.
 *
 * Holds no membership list of its own — objects point at the group through `secret`. One
 * direction only, so an object cannot be listed in a group it does not itself claim, which is
 * the state a two-sided model drifts into as soon as a delete misses one side.
 */
export interface MapSecret {
  id: string;
  name: string;
}

/**
 * A figure on the map during play.
 *
 * Position is plain world coordinates like every other object, snapped to a hex centre when
 * dropped. Storing the hex instead would have been the v1 shape (`WorldMapToken` carries
 * `macroQ/macroR/subQ/subR`), and it ties the token to a grid that only exists because the
 * ruler needs one — a token nudged half a hex off a road could then never sit there.
 */
export interface MapToken extends MapObjectBase {
  name: string;
  color: string;
  /** Diameter in world px. A hex is `HEX_WIDTH` across, so this is usually a fraction of it. */
  size: number;
  portrait?: string;
  /** Set when the token stands for a character sheet rather than being drawn on the spot. */
  characterId?: string;
}

/**
 * A freehand line drawn over the map during play — "we go along this valley".
 *
 * Deliberately **not** terrain. It is a vector object on a layer above the map, so it never
 * touches a chunk, never writes a detail tier, and can be wiped without the map remembering
 * it was ever there. Painting it into the rasters would make an off-hand gesture during a
 * session permanent and, worse, indistinguishable from the map itself.
 */
export interface SketchStroke extends MapObjectBase {
  points: Point[];
  color: string;
  width: number;
  /** User id that drew it: a player may clear their own lines, the GM may clear everyone's. */
  author: string;
}

export type AnyMapObject = MapSymbol | MapLabel | MapRegion | MapMarker | MapToken | SketchStroke;

// ============================================
// Settings & document
// ============================================

export interface MapSettings {
  /** Colour of open sea — the canvas nothing has been drawn on yet. */
  waterBase: string;
  /**
   * Colour of land nothing has painted yet.
   *
   * This was long left out on the theory that a global land base would retroactively repaint
   * ground the user had coloured on purpose. It cannot: the shader resolves land as
   * `mix(uLandDefault, lc.rgb, lc.a)`, so the base only ever shows through where colour
   * coverage is zero. Painted ground is untouched by definition.
   *
   * Its absence was the real problem. Wanting to restyle the whole map's ground meant
   * *painting* every part of it, which buries base colour in whichever detail tier happened
   * to be active — and a finer tier occludes every coarser one, so the change then reverted
   * on zoom. A setting changes the ground everywhere, at every tier, for free.
   */
  landBase: string;
  /** Paper texture asset key, multiplied over the whole terrain stack. */
  paperTexture: string;
  paperOpacity: number;

  /**
   * Coastline appearance. Shared map state rather than a local preference — the look of the
   * coast is part of the map, so every viewer must see the same shoreline.
   */
  coastNoiseScale: number;
  coastNoiseAmount: number;
  coastShoreWidth: number;
  coastShoreLight: number;
  coastShadowWidth: number;
  coastShadowStrength: number;
  /** Sub-hex grid overlay visibility (GM preference, shared). */
  showGrid: boolean;
}

export function defaultSettings(): MapSettings {
  return {
    waterBase: '#3f6d8c',
    // Parchment. On a paper map bare ground is the paper; pure white read as a hole punched
    // in the map wherever land had been raised but not yet coloured.
    landBase: '#e4d5b7',
    paperTexture: '',
    paperOpacity: 0.35,
    coastNoiseScale: 260,
    coastNoiseAmount: 0.35,
    coastShoreWidth: 0.12,
    coastShoreLight: 0.18,
    coastShadowWidth: 0.22,
    coastShadowStrength: 0.35,
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
  tokens: MapToken[];
  sketch: SketchStroke[];

  labelPresets: LabelPreset[];
  /** Secret groups. Membership lives on the objects (`secret`), not here. */
  secrets: MapSecret[];
  /** Stored colours the brushes pick from — no free-form colour picking while drawing. */
  landPalette: string[];
  waterPalette: string[];

  settings: MapSettings;

  /**
   * Revealed hexes as global `q,r` keys (v1's macro-relative 4-tuple is gone).
   *
   * Revealed, not hidden: a fresh world is entirely fogged, which is what a campaign map
   * wants — the party has been nowhere yet. Storing the hidden set instead would mean
   * writing down every hex of an unexplored continent.
   */
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
    tokens: [],
    sketch: [],
    labelPresets: [],
    secrets: [],
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
  | { t: 'chunk'; layer: RasterLayer; tier: DetailTier; cx: number; cy: number; ver: number }
  /**
   * Chunks deleted outright on the server — the bulk counterpart to `chunk`.
   *
   * Carries the cells rather than a rectangle because the server clears only the positions
   * that actually held a file, which over an unpainted region is a tiny fraction of the
   * rectangle asked for. Sending what was really removed keeps receivers from invalidating
   * ground that never had anything on it.
   */
  | { t: 'chunkDrop'; layer: RasterLayer; tier: DetailTier; cells: [number, number][] }
  /** Small scalar state: palettes, settings, presets. Dot path into `MapEditorData`. */
  | { t: 'set'; path: string; value: unknown }
  /**
   * Fog changes as a delta, not the whole set.
   *
   * A `set` on `fog.revealed` would ship the entire revealed list on every brush dab — tens
   * of thousands of keys once a campaign is under way, for a change of a dozen hexes. Same
   * reasoning as `chunk`: send what changed, not what the state now is.
   */
  | { t: 'fog'; add?: string[]; remove?: string[] };

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
      data.chunkVersions[chunkKey(op.layer, op.tier, op.cx, op.cy)] = op.ver;
      break;
    }
    case 'chunkDrop': {
      // Removed rather than set to 0. Both read as "unpainted" through `chunkExists`, but
      // the server rebuilds this map by scanning the chunk directory, so a key with no file
      // behind it is a fiction that would reappear as a difference on every load.
      for (const [cx, cy] of op.cells) {
        delete data.chunkVersions[chunkKey(op.layer, op.tier, cx, cy)];
      }
      break;
    }
    case 'fog': {
      // Rebuilt through a Set so a hex revealed twice is stored once, and so removing one
      // never has to scan the array per key.
      const set = new Set(data.fog.revealed);
      for (const key of op.remove ?? []) set.delete(key);
      for (const key of op.add ?? []) set.add(key);
      data.fog.revealed = [...set];
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
