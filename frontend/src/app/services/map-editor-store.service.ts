import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { MapEditorApiService } from './map-editor-api.service';
import { MapEditorSocketService } from './map-editor-socket.service';
import {
  AnyMapObject,
  DetailTier,
  MapEditorData,
  MapOp,
  ObjectCollection,
  RasterLayer,
  applyMapOp,
  chunkKey,
  createEmptyMapEditorData,
} from '../map-editor/map-editor.model';

export interface ChunkInvalidation {
  layer: RasterLayer;
  tier: DetailTier;
  cx: number;
  cy: number;
  ver: number;
}

/** Chunks deleted on the server; receivers free them rather than refetching. */
export interface ChunkDrop {
  layer: RasterLayer;
  tier: DetailTier;
  cells: [number, number][];
}

/**
 * Authoritative client-side map document, kept in step with the server by ops.
 *
 * Two deliberate differences from `WorldMapStoreService` (v1):
 *
 *  - Ops carry a single object or a chunk reference, never a whole collection. v1's
 *    `patch('macroTiles', wholeArray)` would ship every symbol on the map for one brush
 *    click once the map has real content.
 *  - There is no echo-suppression bookkeeping. Every op in `applyMapOp` is idempotent
 *    (adds are id-guarded, updates and deletes converge, chunk ops just set a version), so
 *    re-applying our own broadcast is harmless. The one thing worth suppressing is
 *    refetching a chunk we just uploaded ourselves, which `ownChunkVersions` handles.
 */
@Injectable({ providedIn: 'root' })
export class MapEditorStoreService {
  private api = inject(MapEditorApiService);
  private socket = inject(MapEditorSocketService);

  readonly data = signal<MapEditorData | null>(null);
  /** Bumped on every applied op, so renderers can cheaply detect "something changed". */
  readonly revision = signal(0);

  worldName = '';

  /** Chunk versions this client produced — echoes of these need no refetch. */
  private ownChunkVersions = new Map<string, number>();

  private chunkInvalidationSubject = new Subject<ChunkInvalidation>();
  /** Chunks changed by *other* clients; the chunk manager refetches these. */
  chunkInvalidations$ = this.chunkInvalidationSubject.asObservable();

  private chunkDropSubject = new Subject<ChunkDrop>();
  /** Chunks deleted server-side; the chunk manager frees them instead of refetching. */
  chunkDrops$ = this.chunkDropSubject.asObservable();

  private objectOpSubject = new Subject<MapOp>();
  /**
   * Object ops after they have been applied, local and remote alike.
   *
   * Views keep their own indexes and sprite pools, so they need the individual change —
   * re-deriving from the whole collection on every edit is exactly what the op protocol
   * exists to avoid.
   */
  objectOps$ = this.objectOpSubject.asObservable();

  private opSub?: { unsubscribe(): void };

  async load(worldName: string): Promise<MapEditorData> {
    this.worldName = worldName;
    this.socket.connect(worldName);

    this.opSub?.unsubscribe();
    this.opSub = this.socket.ops$.subscribe(op => this.applyRemoteOp(op));

    const data = await this.api.load(worldName);
    data.worldName = worldName;
    this.data.set(data);
    this.revision.update(n => n + 1);
    return data;
  }

  destroy(): void {
    this.opSub?.unsubscribe();
    this.opSub = undefined;
    this.socket.disconnect();
    this.ownChunkVersions.clear();
    this.data.set(null);
    this.worldName = '';
  }

  // ── op plumbing ──

  private applyLocal(op: MapOp): void {
    const data = this.data();
    if (!data) return;
    applyMapOp(data, op);
    this.revision.update(n => n + 1);
    if (op.t === 'add' || op.t === 'upd' || op.t === 'del') this.objectOpSubject.next(op);
  }

  /** Apply optimistically, then broadcast. */
  private emit(op: MapOp): void {
    this.applyLocal(op);
    this.socket
      .ensureConnected()
      .then(() => this.socket.sendOp(op))
      .catch(() => {
        /* offline: local state stands, server reconciles on next load */
      });
  }

  private applyRemoteOp(op: MapOp): void {
    const data = this.data();
    if (!data) return;

    /*
     * Drops are filtered *before* being applied, unlike every other op.
     *
     * A drop is the one op that can arrive after it has already been superseded. An import
     * clears an area and then immediately repaints it, and the clear's own echo travels back
     * over the socket while the repaint is uploading over HTTP — two channels with no
     * ordering between them. Applied blindly, that echo deletes the version records of
     * chunks the stamp had already published and frees their textures, leaving part of a
     * freshly stamped region wiped with a hard boundary wherever the echo happened to land.
     *
     * `ownChunkVersions` is the discriminator: `clearChunks` removes the entry for every
     * dropped cell, so an entry existing again means this client has uploaded that cell
     * since the drop was issued, and the newer content wins.
     */
    if (op.t === 'chunkDrop') {
      const stale: [number, number][] = [];
      for (const [cx, cy] of op.cells) {
        const key = chunkKey(op.layer, op.tier, cx, cy);
        if (this.ownChunkVersions.has(key)) continue;
        delete data.chunkVersions[key];
        stale.push([cx, cy]);
      }
      this.revision.update(n => n + 1);

      /*
       * Not routed through `chunkInvalidations$`.
       *
       * An invalidation means "refetch this"; a dropped chunk has nothing to fetch, and a
       * fetch that comes back empty deliberately leaves the existing texture alone (that is
       * what stops a late 404 wiping fresh paint). So a drop has to be its own signal, or
       * deleted ground would keep showing its old pixels until it happened to be evicted.
       */
      if (stale.length) {
        this.chunkDropSubject.next({ layer: op.layer, tier: op.tier, cells: stale });
      }
      return;
    }

    applyMapOp(data, op);
    this.revision.update(n => n + 1);

    if (op.t === 'add' || op.t === 'upd' || op.t === 'del') {
      this.objectOpSubject.next(op);
      return;
    }

    if (op.t === 'chunk') {
      const key = chunkKey(op.layer, op.tier, op.cx, op.cy);
      /*
       * Our own upload echoing back — the pixels are already on screen.
       *
       * Compared with `<=` rather than `===` because echoes can arrive out of order, or
       * late, after we have already published a newer version. An exact match treated those
       * stragglers as somebody else's edit and refetched a chunk we had just painted.
       */
      const own = this.ownChunkVersions.get(key);
      if (own !== undefined && op.ver <= own) return;
      this.chunkInvalidationSubject.next({
        layer: op.layer,
        tier: op.tier,
        cx: op.cx,
        cy: op.cy,
        ver: op.ver,
      });
    }
  }

  // ── object mutations ──

  addObject(c: ObjectCollection, obj: AnyMapObject): void {
    this.emit({ t: 'add', c, v: obj });
  }

  updateObject(c: ObjectCollection, id: string, changes: Record<string, unknown>): void {
    this.emit({ t: 'upd', c, id, v: changes });
  }

  deleteObject(c: ObjectCollection, id: string): void {
    this.emit({ t: 'del', c, id });
  }

  /** Flip a secret object to visible. The server decides what players are then told. */
  revealObject(c: ObjectCollection, id: string): void {
    this.updateObject(c, id, { vis: 'public' });
  }

  // ── shared scalar state (palettes, settings, fog, presets) ──

  setPath(path: string, value: unknown): void {
    this.emit({ t: 'set', path, value });
  }

  // ── chunks ──

  /**
   * Announce a chunk we just uploaded. Records the version first so the echo of our own
   * broadcast does not trigger a pointless refetch of pixels we already have.
   */
  announceChunk(
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
    ver: number,
  ): void {
    this.ownChunkVersions.set(chunkKey(layer, tier, cx, cy), ver);
    this.emit({ t: 'chunk', layer, tier, cx, cy, ver });
  }

  /**
   * Delete stored chunks of a layer and tier over a chunk-coordinate rectangle.
   *
   * The server deletes the files and reports back which cells actually held one, and only
   * those are broadcast — over an unpainted region that is usually none at all.
   *
   * The REST call comes first, unlike every other mutation here: deletion is the one thing
   * that cannot be applied optimistically and reconciled later, because a failed request
   * would leave every other session with ground this one had already thrown away.
   */
  async clearChunks(
    layer: RasterLayer,
    tier: DetailTier,
    rect: { minCx: number; minCy: number; maxCx: number; maxCy: number },
  ): Promise<[number, number][] | null> {
    const cells = await this.api.clearChunks(this.worldName, layer, tier, rect);
    // null means the server refused or the request failed — never silently treat that as
    // "there was nothing to delete", or the files survive and reappear on the next rescan.
    if (cells === null) return null;
    if (!cells.length) return cells;

    // Our own upload records would otherwise keep suppressing refetches of ground that has
    // since been deleted and repainted by somebody else.
    for (const [cx, cy] of cells) this.ownChunkVersions.delete(chunkKey(layer, tier, cx, cy));

    this.emit({ t: 'chunkDrop', layer, tier, cells });
    return cells;
  }

  chunkVersion(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): number {
    return this.data()?.chunkVersions[chunkKey(layer, tier, cx, cy)] ?? 0;
  }

  /**
   * Whether a chunk has ever been painted — unpainted chunks need no fetch at all.
   *
   * Every tier is authored and versioned in its own right, so this is an exact answer at any
   * tier. That matters more than it sounds: fetching unconditionally meant a 404 per layer
   * per chunk on every pan, and for a layer nobody has painted — water colour usually — that
   * is every chunk on screen.
   */
  chunkExists(layer: RasterLayer, tier: DetailTier, cx: number, cy: number): boolean {
    return this.chunkVersion(layer, tier, cx, cy) > 0;
  }

  /** Full-document save. For imports and recovery; ops cover ordinary editing. */
  async saveFull(): Promise<void> {
    const data = this.data();
    if (!data || !this.worldName) return;
    await this.api.save(this.worldName, data);
  }

  snapshotOrEmpty(): MapEditorData {
    return this.data() ?? createEmptyMapEditorData(this.worldName);
  }
}
