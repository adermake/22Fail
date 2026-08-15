/**
 * Undo for raster edits.
 *
 * Vector objects can be undone by inverting their op, but a brush stroke has no inverse —
 * it destroys the pixels it covers. So each stroke snapshots the chunks it is about to
 * touch, *before* the first dab lands, and undo blits those snapshots back.
 *
 * Snapshots are GPU textures, so the stack is bounded by VRAM rather than by entry count:
 * a wide brush over many chunks costs far more than a small one, and a fixed "50 steps"
 * limit would happily eat a gigabyte. Oldest entries are dropped once over budget.
 *
 * Undo is deliberately per-user and local, not shared. Two GMs painting at once should each
 * be able to take back their own work, and a global stack would let one of them silently
 * revert the other's.
 */

import { Texture } from 'pixi.js';
import { AnyMapObject, LAYER_TEXELS, ObjectCollection, RasterLayer } from './map-editor.model';
import { ChunkManager, ChunkRecord } from './chunk-manager';

interface ChunkSnapshot {
  layer: RasterLayer;
  cx: number;
  cy: number;
  texture: Texture;
  bytes: number;
}

/**
 * One object's state either side of an edit. `null` means "did not exist", which lets a
 * single shape describe adds, updates and deletes without a separate kind tag.
 */
export interface ObjectChange {
  c: ObjectCollection;
  id: string;
  before: AnyMapObject | null;
  after: AnyMapObject | null;
}

/**
 * How the stack replays object changes.
 *
 * Undo routes back through the store rather than mutating state directly, so undoing a
 * symbol placement emits a real delete op and disappears for everyone else too — an undo
 * that only took effect locally would silently desync a shared map.
 */
export interface ObjectApplier {
  add(c: ObjectCollection, obj: AnyMapObject): void;
  update(c: ObjectCollection, id: string, patch: Record<string, unknown>): void;
  remove(c: ObjectCollection, id: string): void;
}

interface UndoEntry {
  label: string;
  before: ChunkSnapshot[];
  /** Captured lazily on first undo, so redo can step forward again. */
  after?: ChunkSnapshot[];
  /** Object edits in this step, in the order they were made. */
  objects: ObjectChange[];
}

/** ~256 MB of snapshots. Generous enough for a long session, far short of exhausting VRAM. */
const MAX_BYTES = 256 * 1024 * 1024;

export class UndoStack {
  private undoEntries: UndoEntry[] = [];
  private redoEntries: UndoEntry[] = [];
  private bytes = 0;

  /** Chunks captured for the stroke currently in progress. */
  private pending: ChunkSnapshot[] = [];
  private pendingKeys = new Set<string>();
  /** Object edits recorded for the step currently in progress. */
  private pendingObjects: ObjectChange[] = [];

  constructor(
    private chunks: ChunkManager,
    private objects?: ObjectApplier,
  ) {}

  setObjectApplier(applier: ObjectApplier): void {
    this.objects = applier;
  }

  private key(layer: RasterLayer, cx: number, cy: number): string {
    return `${layer}/${cx}/${cy}`;
  }

  private snapshotBytes(layer: RasterLayer): number {
    const t = LAYER_TEXELS[layer];
    return t * t * 4;
  }

  /** Begin recording a step (a brush stroke, or a batch of object edits). */
  begin(): void {
    this.releaseAll(this.pending);
    this.pending = [];
    this.pendingKeys.clear();
    this.pendingObjects = [];
  }

  /**
   * Record an object edit. Pass deep copies — the live objects are mutated in place while
   * dragging, so a stored reference would quietly become the *current* state and undo to
   * nothing.
   */
  recordObject(change: ObjectChange): void {
    this.pendingObjects.push(change);
  }

  /**
   * Capture a chunk's pre-edit pixels, once per stroke.
   *
   * Must be called *before* the chunk is painted — the brush engine reports which chunks a
   * dab will cover, and this records each the first time it appears.
   */
  capture(rec: ChunkRecord): void {
    const key = this.key(rec.layer, rec.cx, rec.cy);
    if (this.pendingKeys.has(key)) return;
    this.pendingKeys.add(key);

    /*
     * Never snapshot a chunk whose pixels have not arrived.
     *
     * Painting over a chunk that is still fetching would capture the empty texture as its
     * "before" state, and undoing later would then blit that emptiness over terrain that
     * had since loaded — wiping real work permanently. Skipping the capture means undo
     * leaves this chunk as it is, which loses a step of history but never data.
     */
    if (!rec.loaded) return;

    const texture = this.chunks.snapshot(rec);
    if (!texture) return;

    this.pending.push({
      layer: rec.layer,
      cx: rec.cx,
      cy: rec.cy,
      texture,
      bytes: this.snapshotBytes(rec.layer),
    });
  }

  /** Commit the recorded step. Raster and object edits share one history. */
  commit(label: string): void {
    if (this.pending.length === 0 && this.pendingObjects.length === 0) return;

    this.undoEntries.push({ label, before: this.pending, objects: this.pendingObjects });
    this.bytes += this.pending.reduce((a, s) => a + s.bytes, 0);

    this.pending = [];
    this.pendingKeys.clear();
    this.pendingObjects = [];

    // A new edit invalidates any forward history.
    this.releaseEntries(this.redoEntries);
    this.redoEntries = [];

    this.trim();
  }

  /** Discard an in-progress recording (step cancelled). */
  abort(): void {
    this.releaseAll(this.pending);
    this.pending = [];
    this.pendingKeys.clear();
    this.pendingObjects = [];
  }

  canUndo(): boolean {
    return this.undoEntries.length > 0;
  }

  canRedo(): boolean {
    return this.redoEntries.length > 0;
  }

  /** Returns the chunks restored, so the caller can schedule an upload. */
  undo(): ChunkSnapshot[] {
    const entry = this.undoEntries.pop();
    if (!entry) return [];

    // Capture the current state first, or there would be nothing to redo forward into.
    entry.after ??= entry.before.map(s => this.captureCurrent(s));

    for (const s of entry.before) this.chunks.restore(s.layer, s.cx, s.cy, s.texture);
    // Reverse order, so edits that touched the same object unwind correctly.
    for (let i = entry.objects.length - 1; i >= 0; i--) this.applyChange(entry.objects[i], true);

    this.redoEntries.push(entry);
    return entry.before;
  }

  redo(): ChunkSnapshot[] {
    const entry = this.redoEntries.pop();
    if (!entry) return [];

    for (const s of entry.after ?? []) this.chunks.restore(s.layer, s.cx, s.cy, s.texture);
    for (const change of entry.objects) this.applyChange(change, false);

    this.undoEntries.push(entry);
    return entry.after ?? [];
  }

  /** Replay one object change in either direction. */
  private applyChange(change: ObjectChange, backwards: boolean): void {
    if (!this.objects) return;
    const target = backwards ? change.before : change.after;
    const other = backwards ? change.after : change.before;

    if (target === null) {
      // It should not exist in this direction.
      if (other !== null) this.objects.remove(change.c, change.id);
      return;
    }
    if (other === null) {
      this.objects.add(change.c, clone(target));
      return;
    }
    this.objects.update(change.c, change.id, clone(target) as unknown as Record<string, unknown>);
  }

  private captureCurrent(ref: ChunkSnapshot): ChunkSnapshot {
    const rec = this.chunks.get(ref.layer, ref.cx, ref.cy);
    const texture = this.chunks.snapshot(rec);
    const bytes = this.snapshotBytes(ref.layer);
    this.bytes += bytes;
    return { layer: ref.layer, cx: ref.cx, cy: ref.cy, texture: texture ?? ref.texture, bytes };
  }

  /** Drop the oldest history until back inside the memory budget. */
  private trim(): void {
    while (this.bytes > MAX_BYTES && this.undoEntries.length > 1) {
      const dropped = this.undoEntries.shift();
      if (!dropped) break;
      this.bytes -= this.releaseEntry(dropped);
    }
  }

  private releaseEntry(entry: UndoEntry): number {
    let freed = 0;
    for (const s of entry.before) {
      s.texture.destroy(true);
      freed += s.bytes;
    }
    for (const s of entry.after ?? []) {
      s.texture.destroy(true);
      freed += s.bytes;
    }
    return freed;
  }

  private releaseEntries(entries: UndoEntry[]): void {
    for (const e of entries) this.bytes -= this.releaseEntry(e);
  }

  private releaseAll(snaps: ChunkSnapshot[]): void {
    for (const s of snaps) s.texture.destroy(true);
  }

  destroy(): void {
    this.releaseEntries(this.undoEntries);
    this.releaseEntries(this.redoEntries);
    this.releaseAll(this.pending);
    this.undoEntries = [];
    this.redoEntries = [];
    this.pending = [];
    this.pendingObjects = [];
    this.pendingKeys.clear();
    this.bytes = 0;
  }
}

/** Deep copy of a map object, so history never aliases live, mutated state. */
export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
