import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
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
  | {
      t: 'chunkDrop';
      layer: RasterLayer;
      tier: DetailTier;
      cells: [number, number][];
    }
  | { t: 'set'; path: string; value: unknown };

const MAP_FORMAT_VERSION = 2;

@Injectable()
export class MapEditorService implements OnModuleDestroy {
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
  async saveMap(worldName: string, doc: any): Promise<any> {
    const known = this.getMap(worldName).chunkVersions ?? {};
    const incoming = doc?.chunkVersions ?? {};

    const merged: Record<string, number> = { ...incoming };
    for (const [key, ver] of Object.entries(known)) {
      merged[key] = Math.max(ver as number, merged[key] ?? 0);
    }
    doc.chunkVersions = merged;

    this.cache.set(worldName, doc);
    // Awaited, unlike the debounced op path: this is the explicit "save the whole document"
    // route used for imports and recovery, where the caller is entitled to assume that a
    // successful response means it is on disk.
    await this.flushAsync(worldName);
    return doc;
  }

  /**
   * Write out everything still owed before the process goes away.
   *
   * A save is debounced by a second, so at any moment up to a second of edits exists only in
   * `cache`. That was survivable while writes were synchronous and rare; with a debounce it
   * means an ordinary restart during editing silently drops the last symbols placed. Nest
   * awaits this hook, so the writes actually complete.
   */
  async onModuleDestroy(): Promise<void> {
    const owed = new Set([...this.saveTimers.keys(), ...this.writing.keys()]);

    for (const [worldName, timer] of this.saveTimers) {
      clearTimeout(timer);
      this.saveTimers.delete(worldName);
    }

    // `flushAsync` resolves only once nothing further is owed for that world, so this covers
    // both the debounced saves just cancelled and any write already in flight.
    await Promise.all([...owed].map(w => this.flushAsync(w)));
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

  /** Worlds with a write in flight, so a second flush queues instead of interleaving. */
  private writing = new Map<string, Promise<void>>();
  /** Worlds edited while their write was in flight, and so still owed one. */
  private writeAgain = new Set<string>();

  /**
   * Persist a world's document.
   *
   * **Asynchronous and atomic**, and both matter more than they look on a map with a lot of
   * symbols. The document holds every symbol on the map in one array, so serialising and
   * writing it is ~70 ms at 50k symbols and ~250 ms at 200k. Doing that synchronously blocked
   * the entire Node event loop — not just the map editor, but every socket client on the
   * process: the lobby, character sheets, dice, all of it froze for that long, once a second,
   * the whole time somebody was placing symbols.
   *
   * Atomic because the alternative risks the map itself. Writing in place truncates the file
   * first, so a crash, a full disk or a container stop mid-write leaves a half-written
   * `map.json` — and that is the entire world's symbols, labels and regions, unrecoverable.
   * Writing a temp file and renaming means the old document stays intact until a complete new
   * one exists; `rename` within a directory is atomic, so a reader sees one or the other and
   * never a fragment.
   */
  private flush(worldName: string): void {
    void this.flushAsync(worldName);
  }

  private flushAsync(worldName: string): Promise<void> {
    /*
     * One write at a time per world, and the returned promise covers *all* of the writes
     * still owed — not merely the one already running.
     *
     * Two overlapping writes race on the same temp path, and the loser can rename a stale
     * document over a newer one. Queueing instead means the follow-up picks up the cache as
     * it stands when it runs, which is by definition at least as new.
     *
     * The loop matters for shutdown. A version of this that queued the follow-up as
     * fire-and-forget resolved as soon as the *first* write finished, so `onModuleDestroy`
     * returned while the write holding the newest edits was still in flight — which is the
     * exact data loss the hook exists to prevent.
     */
    const inFlight = this.writing.get(worldName);
    if (inFlight) {
      this.writeAgain.add(worldName);
      return inFlight;
    }

    const run = (async () => {
      try {
        do {
          // Cleared before the write, so edits arriving *during* it re-arm the flag.
          this.writeAgain.delete(worldName);
          await this.writeDoc(worldName);
          // No await between this check and the `finally` below, so a save requested here
          // cannot slip through the gap between "nothing owed" and "no longer writing".
        } while (this.writeAgain.has(worldName));
      } finally {
        this.writing.delete(worldName);
      }
    })();

    this.writing.set(worldName, run);
    return run;
  }

  private async writeDoc(worldName: string): Promise<void> {
    const doc = this.cache.get(worldName);
    if (!doc) return;

    const file = this.mapFile(worldName);
    // Same directory as the target: `rename` is only atomic within one filesystem.
    const temp = `${file}.tmp`;

    try {
      await fs.promises.mkdir(this.mapDir(worldName), { recursive: true });
      /*
       * Serialised without indentation.
       *
       * Nothing reads this by eye — it is machine-written and machine-read — and the padding
       * is a third of the file: 12.7 MB against 8.4 MB at 50k symbols, on every save and every
       * join. Any editor or `jq` will format it if it ever needs reading.
       */
      await fs.promises.writeFile(temp, JSON.stringify(doc), 'utf-8');
      await fs.promises.rename(temp, file);
    } catch (err) {
      this.logger.error(`Failed to write map for ${worldName}:`, err as Error);
      // Leave no partial temp file behind to be mistaken for anything later.
      await fs.promises.rm(temp, { force: true }).catch(() => undefined);
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
      case 'chunkDrop': {
        /*
         * Pure relay — deliberately changes nothing here.
         *
         * The deletion already happened, authoritatively, in `clearChunks` via the REST
         * route (which is also where the GM check lives). Re-applying it on arrival would be
         * worse than redundant: this op travels over the socket while the client that sent it
         * repaints the same area over HTTP, and the two channels have no ordering between
         * them. A drop landing after a `PUT` would delete the version of a chunk whose file
         * is on disk and current, so the map would report that ground as never painted until
         * the next `scanChunkVersions` on load contradicted it.
         *
         * Forwarding it unchanged is the whole job: other sessions need to know what went
         * away, and the document is already right.
         */
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

  /**
   * Persist a chunk and bump its version. Returns the new version for broadcasting.
   *
   * Asynchronous for the same reason the document write is: a landmass import PUTs hundreds
   * of chunks back to back, and a synchronous write per chunk turns that into hundreds of
   * event-loop stalls while every other client waits.
   */
  async writeChunk(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
    data: Buffer,
  ): Promise<number | null> {
    const file = this.chunkFile(worldName, layer, tier, cx, cy);
    if (!file) return null;
    try {
      await fs.promises.mkdir(path.dirname(file), { recursive: true });
      await fs.promises.writeFile(file, data);
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

  /**
   * Delete every stored chunk of one layer and tier inside a chunk-coordinate rectangle.
   *
   * Erasing a large area the other way round — render a transparent rect into each chunk and
   * PUT it back — is thousands of GPU readbacks and PNG encodes for a result that is, by
   * definition, "nothing". Because a chunk is a plain file and `scanChunkVersions` rebuilds
   * the version map from disk, deleting the files *is* the erase, and it costs a few
   * milliseconds however much map it covers.
   *
   * That is what makes "replace this region" affordable across every tier at once: an import
   * can clear the fine detail it is about to supersede without ever paying to render it.
   *
   * Returns the cells actually removed, so the caller can tell other sessions precisely what
   * to drop rather than making them reload the map.
   */
  /**
   * Chunks of one layer and tier stored inside a chunk-coordinate rectangle.
   *
   * Authoritative, which is the entire point of exposing it. `chunkVersions` here is
   * reconciled against the files actually on disk when the document loads, whereas a client's
   * copy is a cache that can silently lose entries. A client deciding "there is nothing here,
   * so nothing to erase" from its own copy will skip a chunk that really does hold content,
   * leave the old pixels in place, and then republish them on the next stamp.
   *
   * Driven by the version map rather than by the rectangle: the rectangle can span millions of
   * `high` positions while only a few hundred were ever painted.
   */
  listChunks(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    minCx: number,
    minCy: number,
    maxCx: number,
    maxCy: number,
  ): [number, number][] {
    if (!RASTER_LAYERS.includes(layer)) return [];
    if (!TIERS.includes(tier)) return [];
    for (const n of [minCx, minCy, maxCx, maxCy]) {
      if (!Number.isInteger(n)) return [];
    }

    const doc = this.getMap(worldName) as { chunkVersions: Record<string, number> };
    const found: [number, number][] = [];

    for (const key of Object.keys(doc.chunkVersions)) {
      const parts = key.split('/');
      if (parts.length !== 4) continue;
      if (parts[0] !== layer || parts[1] !== tier) continue;

      const cx = Number(parts[2]);
      const cy = Number(parts[3]);
      if (!Number.isInteger(cx) || !Number.isInteger(cy)) continue;
      if (cx < minCx || cx > maxCx || cy < minCy || cy > maxCy) continue;
      found.push([cx, cy]);
    }
    return found;
  }

  clearChunks(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    minCx: number,
    minCy: number,
    maxCx: number,
    maxCy: number,
  ): [number, number][] {
    // `getMap` is untyped like the rest of the document, but everything touched here is
    // known, so naming it locally keeps this method off the file's `any` treadmill.
    const doc = this.getMap(worldName) as {
      chunkVersions: Record<string, number>;
      updatedAt: number;
    };
    const removed: [number, number][] = [];

    for (const [cx, cy] of this.listChunks(
      worldName,
      layer,
      tier,
      minCx,
      minCy,
      maxCx,
      maxCy,
    )) {
      const key = `${layer}/${tier}/${cx}/${cy}`;
      const file = this.chunkFile(worldName, layer, tier, cx, cy);
      if (file) {
        try {
          fs.rmSync(file, { force: true });
        } catch (err) {
          this.logger.error(
            `Failed to delete chunk ${layer}/${tier}/${cx}_${cy}:`,
            err as Error,
          );
          // Leave the version entry in place: the file may still be readable, and claiming
          // it is gone would leave clients showing empty ground over real stored pixels.
          continue;
        }
      }

      delete doc.chunkVersions[key];
      removed.push([cx, cy]);
    }

    if (removed.length) {
      doc.updatedAt = Date.now();
      this.scheduleSave(worldName);
    }
    return removed;
  }
}
