import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Map Editor storage (format v2).
 *
 * Layout, per world:
 *   data/worlds/{world}/map-editor/
 *     map.json                              document: vector objects, palettes, settings, fog
 *     chunks/{layer}/{tier}/{cx}_{cy}.png   painted raster chunks
 *
 * Chunks live as individual files rather than inside `map.json` for the reason the whole
 * rebuild exists: edits must be cheap and incremental. A brush stroke rewrites the two or
 * three chunk files it touched, and other clients refetch exactly those — no megabyte
 * document round-trip, and the map can grow far past what one JSON blob can hold.
 *
 * **The server derives nothing.** All three detail tiers are authored by the client, which
 * writes the tier it is drawing at and every coarser one in the same stroke. The previous
 * design had the server downscale a pyramid on demand, and writing one chunk invalidated a
 * chain that had to be rebuilt from up to 256 children — measured at three to ten seconds
 * per tile, and obsolete again before it finished. Here a write is a file write.
 *
 * v1's `world-map.json` is left untouched; v2 is a parallel document so the old viewer keeps
 * working until it is removed in Phase 3.
 */

export type RasterLayer = 'height' | 'landColor' | 'waterColor';
const RASTER_LAYERS: RasterLayer[] = ['height', 'landColor', 'waterColor'];

/**
 * Authored detail tiers, finest first. Mirrors the client's `TIERS`.
 *
 * Storage treats them identically — same path shape, same versioning, no special case for
 * any of them. That uniformity is the point: nothing here has to know that a `low` chunk
 * covers 4096× the area of a `high` one.
 */
export type DetailTier = 'high' | 'med' | 'low';
const TIERS: DetailTier[] = ['high', 'med', 'low'];

export type ObjectCollection = 'symbols' | 'labels' | 'regions' | 'markers';
const OBJECT_COLLECTIONS: ObjectCollection[] = [
  'symbols',
  'labels',
  'regions',
  'markers',
];

export type MapOp =
  | { t: 'add'; c: ObjectCollection; v: any }
  | { t: 'upd'; c: ObjectCollection; id: string; v: Record<string, unknown> }
  | { t: 'del'; c: ObjectCollection; id: string }
  | {
      t: 'chunk';
      layer: RasterLayer;
      tier: DetailTier;
      cx: number;
      cy: number;
      ver: number;
    }
  | { t: 'set'; path: string; value: unknown };

const MAP_FORMAT_VERSION = 2;

@Injectable()
export class MapEditorService {
  private readonly logger = new Logger(MapEditorService.name);
  /** Matches DataService's layout so both write under the same `data/worlds` tree. */
  private readonly worldsDir = path.join(__dirname, '../../../data', 'worlds');

  /** In-memory documents, so op application does not hit disk per stroke. */
  private cache = new Map<string, any>();
  private saveTimers = new Map<string, NodeJS.Timeout>();

  // ── paths ──

  /** Same rules as `DataService.sanitizeFileName`, so a world resolves to one directory. */
  private safeName(name: string): string {
    return String(name)
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/\.+/g, '_')
      .substring(0, 200);
  }

  private mapDir(worldName: string): string {
    return path.join(this.worldsDir, this.safeName(worldName), 'map-editor');
  }

  private mapFile(worldName: string): string {
    return path.join(this.mapDir(worldName), 'map.json');
  }

  /**
   * Path of a chunk.
   *
   * One shape for every tier — no legacy flat layout for `high`. Existing map data is
   * disposable and was deliberately not migrated, so old un-tiered files are simply ignored;
   * tolerating them would have been the only irregularity left in the storage layer.
   *
   * `layer` and `tier` are checked against their fixed sets and the coordinates are proven
   * integers, so no traversal is reachable through any path-derived input.
   */
  private chunkFile(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
  ): string | null {
    if (!RASTER_LAYERS.includes(layer)) return null;
    if (!TIERS.includes(tier)) return null;
    if (!Number.isInteger(cx) || !Number.isInteger(cy)) return null;

    return path.join(
      this.mapDir(worldName),
      'chunks',
      layer,
      tier,
      `${cx}_${cy}.png`,
    );
  }

  // ── document ──

  private emptyDoc(worldName: string): any {
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
      settings: {
        // Colour of open sea. There is no land equivalent: land colour is baked as terrain
        // is drawn, so nothing can retroactively repaint ground the user already coloured.
        waterBase: '#3f6d8c',
        paperTexture: '',
        paperOpacity: 0.35,
        // Coastline look is part of the map, so it is shared rather than per-viewer.
        coastNoiseScale: 260,
        coastNoiseAmount: 0.35,
        coastShoreWidth: 0.12,
        coastShoreLight: 0.18,
        coastShadowWidth: 0.22,
        coastShadowStrength: 0.35,
        showGrid: true,
      },
      fog: { revealed: [] },
      chunkVersions: {},
      updatedAt: Date.now(),
    };
  }

  /** Load the document, creating an empty one on first access. */
  getMap(worldName: string): any {
    const cached = this.cache.get(worldName);
    if (cached) return cached;

    const file = this.mapFile(worldName);
    let doc: any;
    try {
      doc = JSON.parse(fs.readFileSync(file, 'utf-8'));
      // Tolerate documents written before a field existed.
      const base = this.emptyDoc(worldName);
      doc = {
        ...base,
        ...doc,
        settings: { ...base.settings, ...(doc.settings ?? {}) },
      };
      for (const c of OBJECT_COLLECTIONS)
        if (!Array.isArray(doc[c])) doc[c] = [];
    } catch {
      doc = this.emptyDoc(worldName);
    }

    // The chunk files on disk are the ground truth for what has been painted; reconcile so
    // a document that predates them cannot hide terrain that actually exists.
    const versions = {
      ...this.scanChunkVersions(worldName),
      ...(doc.chunkVersions ?? {}),
    };

    /*
     * Drop keys that are not `{layer}/{tier}/{cx}/{cy}`.
     *
     * Documents written before the detail tiers keyed chunks as `{layer}/{cx}/{cy}`, and
     * those entries now name nothing at all — the files they referred to are ignored. Left
     * in, they would ride along in every payload to every client forever, growing the
     * document with records no lookup can ever match.
     */
    doc.chunkVersions = Object.fromEntries(
      Object.entries(versions).filter(([key]) => {
        const parts = key.split('/');
        return (
          parts.length === 4 &&
          RASTER_LAYERS.includes(parts[0] as RasterLayer) &&
          TIERS.includes(parts[1] as DetailTier)
        );
      }),
    );

    this.cache.set(worldName, doc);
    return doc;
  }

  /**
   * Enumerate painted chunks from disk.
   *
   * `chunkVersions` is what tells a client a chunk is worth fetching, so if the document
   * and the filesystem ever disagree the terrain silently disappears for everyone. Deriving
   * it from the files makes that class of loss unreachable.
   */
  private scanChunkVersions(worldName: string): Record<string, number> {
    const out: Record<string, number> = {};
    for (const layer of RASTER_LAYERS) {
      for (const tier of TIERS) {
        const dir = path.join(this.mapDir(worldName), 'chunks', layer, tier);
        let names: string[];
        try {
          names = fs.readdirSync(dir);
        } catch {
          continue; // this layer/tier never painted
        }
        for (const name of names) {
          const m = /^(-?\d+)_(-?\d+)\.png$/.exec(name);
          if (m) out[`${layer}/${tier}/${m[1]}/${m[2]}`] = 1;
        }
      }
    }
    return out;
  }

  /**
   * Wholesale document replacement (imports, recovery).
   *
   * Chunk versions are deliberately *not* taken from the client: they describe files the
   * server owns, and accepting a stale copy would orphan painted terrain.
   */
  saveMap(worldName: string, doc: any): any {
    const known = this.getMap(worldName).chunkVersions ?? {};
    const incoming = doc?.chunkVersions ?? {};

    const merged: Record<string, number> = { ...incoming };
    for (const [key, ver] of Object.entries(known)) {
      merged[key] = Math.max(ver as number, merged[key] ?? 0);
    }
    doc.chunkVersions = merged;

    this.cache.set(worldName, doc);
    this.flush(worldName);
    return doc;
  }

  /** Debounced write — brush strokes emit ops far faster than disk should be touched. */
  private scheduleSave(worldName: string): void {
    const existing = this.saveTimers.get(worldName);
    if (existing) clearTimeout(existing);
    this.saveTimers.set(
      worldName,
      setTimeout(() => {
        this.saveTimers.delete(worldName);
        this.flush(worldName);
      }, 1000),
    );
  }

  private flush(worldName: string): void {
    const doc = this.cache.get(worldName);
    if (!doc) return;
    try {
      fs.mkdirSync(this.mapDir(worldName), { recursive: true });
      fs.writeFileSync(
        this.mapFile(worldName),
        JSON.stringify(doc, null, 2),
        'utf-8',
      );
    } catch (err) {
      this.logger.error(`Failed to write map for ${worldName}:`, err as Error);
    }
  }

  // ── ops ──

  /**
   * Apply an op to the stored document. Mirrors `applyMapOp` in the frontend model —
   * the two must stay in step, since the server is the authority players read from.
   */
  applyOp(worldName: string, op: MapOp): void {
    const doc = this.getMap(worldName);

    switch (op.t) {
      case 'add': {
        if (!OBJECT_COLLECTIONS.includes(op.c)) return;
        const list = doc[op.c] as any[];
        if (!list.some((o) => o.id === op.v?.id)) list.push(op.v);
        break;
      }
      case 'upd': {
        if (!OBJECT_COLLECTIONS.includes(op.c)) return;
        const obj = (doc[op.c] as any[]).find((o) => o.id === op.id);
        if (obj) Object.assign(obj, op.v);
        break;
      }
      case 'del': {
        if (!OBJECT_COLLECTIONS.includes(op.c)) return;
        const list = doc[op.c] as any[];
        const i = list.findIndex((o) => o.id === op.id);
        if (i >= 0) list.splice(i, 1);
        break;
      }
      case 'chunk': {
        if (!TIERS.includes(op.tier)) return;
        doc.chunkVersions[`${op.layer}/${op.tier}/${op.cx}/${op.cy}`] = op.ver;
        break;
      }
      case 'set': {
        const parts = String(op.path).split('.').filter(Boolean);
        // Block prototype-poisoning paths — `path` arrives straight off the socket.
        if (
          parts.some(
            (p) =>
              p === '__proto__' || p === 'constructor' || p === 'prototype',
          )
        )
          return;
        if (parts.length === 0) return;
        let obj: any = doc;
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
          if (obj == null) return;
        }
        obj[parts[parts.length - 1]] = op.value;
        break;
      }
      default:
        return;
    }

    doc.updatedAt = Date.now();
    this.scheduleSave(worldName);
  }

  // ── secret filtering ──

  /**
   * Strip GM-only content for player payloads.
   *
   * This is the whole point of the rebuild: hiding secrets in the UI alone would leave
   * them sitting in the network response for anyone who opens devtools, which is exactly
   * the leak the old fog-only workflow had. Secrets must never reach a player's wire.
   */
  viewFor(worldName: string, isGM: boolean): any {
    const doc = this.getMap(worldName);
    if (isGM) return doc;

    const filtered: any = { ...doc };
    for (const c of OBJECT_COLLECTIONS) {
      filtered[c] = (doc[c] as any[]).filter((o) => o?.vis !== 'secret');
    }
    return filtered;
  }

  /** Whether an op may be forwarded to players as-is. */
  isOpPublic(op: MapOp): boolean {
    if (op.t === 'add') return op.v?.vis !== 'secret';
    return true;
  }

  /** Look up an object's current visibility, to decide what players may be told. */
  getObjectVisibility(
    worldName: string,
    c: ObjectCollection,
    id: string,
  ): string | undefined {
    const doc = this.getMap(worldName);
    if (!OBJECT_COLLECTIONS.includes(c)) return undefined;
    return (doc[c] as any[]).find((o) => o.id === id)?.vis;
  }

  getObject(worldName: string, c: ObjectCollection, id: string): any {
    const doc = this.getMap(worldName);
    if (!OBJECT_COLLECTIONS.includes(c)) return undefined;
    return (doc[c] as any[]).find((o) => o.id === id);
  }

  // ── chunks ──

  /**
   * Read a chunk. Returns null when that ground has never been painted at this tier, which
   * is the normal case over most of a map and not an error.
   *
   * Nothing is built here. Every tier is authored, so a chunk either exists on disk or that
   * ground is empty at that tier and the client's composite falls through to a coarser one.
   */
  readChunk(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
  ): Buffer | null {
    const file = this.chunkFile(worldName, layer, tier, cx, cy);
    if (!file) return null;
    try {
      return fs.readFileSync(file);
    } catch {
      return null;
    }
  }

  /** Persist a chunk and bump its version. Returns the new version for broadcasting. */
  writeChunk(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
    data: Buffer,
  ): number | null {
    const file = this.chunkFile(worldName, layer, tier, cx, cy);
    if (!file) return null;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, data);
    } catch (err) {
      this.logger.error(
        `Failed to write chunk ${layer}/${tier}/${cx}_${cy}:`,
        err as Error,
      );
      return null;
    }

    /*
     * Nothing to invalidate.
     *
     * The client wrote the coarser tiers itself, in the same stroke, and PUTs each of them
     * through this same method. No derived state exists anywhere that could now be stale —
     * which is the whole reason the tiers are authored rather than computed.
     */
    const doc = this.getMap(worldName);
    const key = `${layer}/${tier}/${cx}/${cy}`;
    const ver = (doc.chunkVersions[key] ?? 0) + 1;
    doc.chunkVersions[key] = ver;
    doc.updatedAt = Date.now();
    this.scheduleSave(worldName);
    return ver;
  }
}
