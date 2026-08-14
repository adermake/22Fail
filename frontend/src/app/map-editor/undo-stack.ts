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
import { LAYER_TEXELS, RasterLayer } from './map-editor.model';
import { ChunkManager, ChunkRecord } from './chunk-manager';

interface ChunkSnapshot {
  layer: RasterLayer;
  cx: number;
  cy: number;
  texture: Texture;
  bytes: number;
}

interface UndoEntry {
  label: string;
  before: ChunkSnapshot[];
  /** Captured lazily on first undo, so redo can step forward again. */
  after?: ChunkSnapshot[];
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

  constructor(private chunks: ChunkManager) {}

  private key(layer: RasterLayer, cx: number, cy: number): string {
    return `${layer}/${cx}/${cy}`;
  }

  private snapshotBytes(layer: RasterLayer): number {
    const t = LAYER_TEXELS[layer];
    return t * t * 4;
  }

  /** Begin recording a stroke. */
  begin(): void {
    this.releaseAll(this.pending);
    this.pending = [];
    this.pendingKeys.clear();
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

  /** Commit the recorded stroke as one undoable step. */
  commit(label: string): void {
    if (this.pending.length === 0) return;

    this.undoEntries.push({ label, before: this.pending });
    this.bytes += this.pending.reduce((a, s) => a + s.bytes, 0);

    this.pending = [];
    this.pendingKeys.clear();

    // A new edit invalidates any forward history.
    this.releaseEntries(this.redoEntries);
    this.redoEntries = [];

    this.trim();
  }

  /** Discard an in-progress recording (stroke cancelled). */
  abort(): void {
    this.releaseAll(this.pending);
    this.pending = [];
    this.pendingKeys.clear();
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

    this.redoEntries.push(entry);
    return entry.before;
  }

  redo(): ChunkSnapshot[] {
    const entry = this.redoEntries.pop();
    if (!entry || !entry.after) return [];

    for (const s of entry.after) this.chunks.restore(s.layer, s.cx, s.cy, s.texture);

    this.undoEntries.push(entry);
    return entry.after;
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
    this.pendingKeys.clear();
    this.bytes = 0;
  }
}
