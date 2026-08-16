import { Injectable, Logger } from '@nestjs/common';
import {
  MAX_TILE_LEVEL,
  childrenOf,
  composeParent,
  parentOf,
} from './tile-pyramid';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Map Editor storage (format v2).
 *
 * Layout, per world:
 *   data/worlds/{world}/map-editor/
 *     map.json                       document: vector objects, palettes, settings, fog
 *     chunks/{layer}/{cx}_{cy}.png   painted raster chunks
 *
 * Chunks live as individual files rather than inside `map.json` for the reason the whole
 * rebuild exists: edits must be cheap and incremental. A brush stroke rewrites the two or
 * three chunk files it touched, and other clients refetch exactly those — no megabyte
 * document round-trip, and the map can grow far past what one JSON blob can hold.
 *
 * v1's `world-map.json` is left untouched; v2 is a parallel document so the old viewer keeps
 * working until it is removed in Phase 3.
 */

export type RasterLayer = 'height' | 'landColor' | 'waterColor';
const RASTER_LAYERS: RasterLayer[] = ['height', 'landColor', 'waterColor'];

export type ObjectCollection = 'symbols' | 'labels' | 'regions' | 'markers';
const OBJECT_COLLECTIONS: ObjectCollection[] = ['symbols', 'labels', 'regions', 'markers'];

export type MapOp =
  | { t: 'add'; c: ObjectCollection; v: any }
  | { t: 'upd'; c: ObjectCollection; id: string; v: Record<string, unknown> }
  | { t: 'del'; c: ObjectCollection; id: string }
  | { t: 'chunk'; layer: RasterLayer; cx: number; cy: number; ver: number }
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
   * Path of a tile.
   *
   * Level 0 keeps the original flat layout so existing maps load unchanged; the derived
   * levels live in sibling folders. Coordinates are the only path-derived input and are
   * proven integers, so no traversal is reachable.
   */
  private chunkFile(
    worldName: string,
    layer: RasterLayer,
    cx: number,
    cy: number,
    level = 0,
  ): string | null {
    if (!RASTER_LAYERS.includes(layer)) return null;
    if (!Number.isInteger(cx) || !Number.isInteger(cy)) return null;
    if (!Number.isInteger(level) || level < 0 || level > MAX_TILE_LEVEL) return null;

    const dir = path.join(this.mapDir(worldName), 'chunks', layer);
    return level === 0
      ? path.join(dir, `${cx}_${cy}.png`)
      : path.join(dir, `L${level}`, `${cx}_${cy}.png`);
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
      doc = { ...base, ...doc, settings: { ...base.settings, ...(doc.settings ?? {}) } };
      for (const c of OBJECT_COLLECTIONS) if (!Array.isArray(doc[c])) doc[c] = [];
    } catch {
      doc = this.emptyDoc(worldName);
    }

    // The chunk files on disk are the ground truth for what has been painted; reconcile so
    // a document that predates them cannot hide terrain that actually exists.
    doc.chunkVersions = { ...this.scanChunkVersions(worldName), ...(doc.chunkVersions ?? {}) };

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
      const dir = path.join(this.mapDir(worldName), 'chunks', layer);
      let names: string[];
      try {
        names = fs.readdirSync(dir);
      } catch {
        continue; // layer never painted
      }
      for (const name of names) {
        const m = /^(-?\d+)_(-?\d+)\.png$/.exec(name);
        if (m) out[`${layer}/${m[1]}/${m[2]}`] = 1;
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
      merged[key] = Math.max(ver as number, (merged[key] as number) ?? 0);
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
      fs.writeFileSync(this.mapFile(worldName), JSON.stringify(doc, null, 2), 'utf-8');
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
        if (!list.some(o => o.id === op.v?.id)) list.push(op.v);
        break;
      }
      case 'upd': {
        if (!OBJECT_COLLECTIONS.includes(op.c)) return;
        const obj = (doc[op.c] as any[]).find(o => o.id === op.id);
        if (obj) Object.assign(obj, op.v);
        break;
      }
      case 'del': {
        if (!OBJECT_COLLECTIONS.includes(op.c)) return;
        const list = doc[op.c] as any[];
        const i = list.findIndex(o => o.id === op.id);
        if (i >= 0) list.splice(i, 1);
        break;
      }
      case 'chunk': {
        doc.chunkVersions[`${op.layer}/${op.cx}/${op.cy}`] = op.ver;
        break;
      }
      case 'set': {
        const parts = String(op.path).split('.').filter(Boolean);
        // Block prototype-poisoning paths — `path` arrives straight off the socket.
        if (parts.some(p => p === '__proto__' || p === 'constructor' || p === 'prototype')) return;
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
      filtered[c] = (doc[c] as any[]).filter(o => o?.vis !== 'secret');
    }
    return filtered;
  }

  /** Whether an op may be forwarded to players as-is. */
  isOpPublic(op: MapOp): boolean {
    if (op.t === 'add') return op.v?.vis !== 'secret';
    return true;
  }

  /** Look up an object's current visibility, to decide what players may be told. */
  getObjectVisibility(worldName: string, c: ObjectCollection, id: string): string | undefined {
    const doc = this.getMap(worldName);
    if (!OBJECT_COLLECTIONS.includes(c)) return undefined;
    return (doc[c] as any[]).find(o => o.id === id)?.vis;
  }

  getObject(worldName: string, c: ObjectCollection, id: string): any {
    const doc = this.getMap(worldName);
    if (!OBJECT_COLLECTIONS.includes(c)) return undefined;
    return (doc[c] as any[]).find(o => o.id === id);
  }

  // ── chunks ──

  readChunk(worldName: string, layer: RasterLayer, cx: number, cy: number): Buffer | null {
    return this.readTile(worldName, layer, cx, cy, 0);
  }

  /**
   * Read a tile, building it from its children if it does not exist yet.
   *
   * Parents are derived, never authored, so they are generated on demand and cached to disk
   * rather than rebuilt eagerly on every paint stroke — a broad stroke would otherwise cost
   * a rebuild of eleven ancestors before the editor could carry on.
   *
   * Returns null when nothing beneath this tile has ever been painted, which the client
   * treats as open sea.
   */
  readTile(
    worldName: string,
    layer: RasterLayer,
    cx: number,
    cy: number,
    level: number,
  ): Buffer | null {
    const file = this.chunkFile(worldName, layer, cx, cy, level);
    if (!file) return null;

    try {
      return fs.readFileSync(file);
    } catch {
      /* not built yet — fall through */
    }

    // Level 0 is authored; if its file is absent, that ground is simply unpainted.
    if (level === 0) return null;

    const children = childrenOf(cx, cy).map(c =>
      this.readTile(worldName, layer, c.cx, c.cy, level - 1),
    );

    const composed = composeParent(children);
    if (!composed) return null;

    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, composed);
    } catch (err) {
      // Serving it uncached is still correct, just slower next time.
      this.logger.warn(`Failed to cache tile ${layer}/L${level}/${cx}_${cy}: ${err}`);
    }
    return composed;
  }

  /**
   * Drop every cached ancestor of a level-0 chunk.
   *
   * Deleting rather than rebuilding keeps the write path cheap: the next reader rebuilds
   * exactly the levels it actually asks for, and a region nobody views never costs anything.
   */
  private invalidateAncestors(worldName: string, layer: RasterLayer, cx: number, cy: number): void {
    let p = parentOf(cx, cy);
    for (let level = 1; level <= MAX_TILE_LEVEL; level++) {
      const file = this.chunkFile(worldName, layer, p.cx, p.cy, level);
      if (file) {
        try {
          fs.unlinkSync(file);
        } catch {
          /* already absent */
        }
      }
      p = parentOf(p.cx, p.cy);
    }
  }

  /** Persist a chunk and bump its version. Returns the new version for broadcasting. */
  writeChunk(
    worldName: string,
    layer: RasterLayer,
    cx: number,
    cy: number,
    data: Buffer,
  ): number | null {
    const file = this.chunkFile(worldName, layer, cx, cy);
    if (!file) return null;
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, data);
    } catch (err) {
      this.logger.error(`Failed to write chunk ${layer}/${cx}_${cy}:`, err as Error);
      return null;
    }

    // Every derived tile above this one is now out of date.
    this.invalidateAncestors(worldName, layer, cx, cy);

    const doc = this.getMap(worldName);
    const key = `${layer}/${cx}/${cy}`;
    const ver = (doc.chunkVersions[key] ?? 0) + 1;
    doc.chunkVersions[key] = ver;
    doc.updatedAt = Date.now();
    this.scheduleSave(worldName);
    return ver;
  }
}
