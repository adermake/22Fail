import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { MapEditorApiService } from './map-editor-api.service';
import { MapEditorSocketService } from './map-editor-socket.service';
import {
  AnyMapObject,
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
  cx: number;
  cy: number;
  ver: number;
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

    applyMapOp(data, op);
    this.revision.update(n => n + 1);

    if (op.t === 'add' || op.t === 'upd' || op.t === 'del') {
      this.objectOpSubject.next(op);
      return;
    }

    if (op.t === 'chunk') {
      const key = chunkKey(op.layer, op.cx, op.cy);
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
  announceChunk(layer: RasterLayer, cx: number, cy: number, ver: number): void {
    this.ownChunkVersions.set(chunkKey(layer, cx, cy), ver);
    this.emit({ t: 'chunk', layer, cx, cy, ver });
  }

  chunkVersion(layer: RasterLayer, cx: number, cy: number): number {
    return this.data()?.chunkVersions[chunkKey(layer, cx, cy)] ?? 0;
  }

  /** Whether a chunk has ever been painted — unpainted chunks need no fetch at all. */
  chunkExists(layer: RasterLayer, cx: number, cy: number): boolean {
    return this.chunkVersion(layer, cx, cy) > 0;
  }

  /**
   * Whether any painted chunk falls inside a level-0 coordinate range.
   *
   * Derived tiles have no version record of their own, so they were fetched unconditionally
   * and answered 404 whenever nothing beneath them existed. For a layer nobody has painted
   * — water colour usually, since the water brushes stopped tinting automatically — that is
   * every tile, at every level, on every pan. The document already knows which chunks exist,
   * so the request can simply not be made.
   */
  hasPaintedChunkIn(
    layer: RasterLayer,
    minCx: number,
    minCy: number,
    maxCx: number,
    maxCy: number,
  ): boolean {
    const versions = this.data()?.chunkVersions;
    if (!versions) return false;

    const prefix = `${layer}/`;
    for (const key of Object.keys(versions)) {
      if (!key.startsWith(prefix)) continue;
      const parts = key.slice(prefix.length).split('/');
      const cx = Number(parts[0]);
      const cy = Number(parts[1]);
      if (cx >= minCx && cx <= maxCx && cy >= minCy && cy <= maxCy) return true;
    }
    return false;
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
