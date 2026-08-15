/**
 * Uniform-grid spatial index for map objects.
 *
 * The map is meant to hold tens of thousands of symbols, so nothing may walk the full list
 * per frame. Bucketing by a coarse grid turns "what is on screen" into reading the handful
 * of cells the viewport covers, and keeps insert/move/remove O(1).
 *
 * A grid rather than a quadtree deliberately: symbols are roughly uniformly scattered over
 * a map and are constantly added and moved while editing, which is the case where a grid's
 * cheap incremental updates beat a tree's better worst-case query.
 */

import { Bounds } from './map-camera';

/** World span of one bucket. Large enough that a viewport spans few cells. */
export const CELL_SIZE = 4096;

export interface IndexedObject {
  id: string;
  x: number;
  y: number;
}

export class SpatialIndex<T extends IndexedObject> {
  private cells = new Map<string, Map<string, T>>();
  /** Where each object currently sits, so a move can leave its old cell. */
  private placement = new Map<string, string>();

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  private cellFor(x: number, y: number): string {
    return this.key(Math.floor(x / CELL_SIZE), Math.floor(y / CELL_SIZE));
  }

  insert(obj: T): void {
    const key = this.cellFor(obj.x, obj.y);
    const prev = this.placement.get(obj.id);

    if (prev === key) {
      // Same bucket — just refresh the stored reference (position may still have changed).
      this.cells.get(key)?.set(obj.id, obj);
      return;
    }
    if (prev !== undefined) this.removeFrom(prev, obj.id);

    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = new Map();
      this.cells.set(key, bucket);
    }
    bucket.set(obj.id, obj);
    this.placement.set(obj.id, key);
  }

  /** Re-file an object after its position changed. */
  update(obj: T): void {
    this.insert(obj);
  }

  remove(id: string): void {
    const key = this.placement.get(id);
    if (key === undefined) return;
    this.removeFrom(key, id);
    this.placement.delete(id);
  }

  private removeFrom(key: string, id: string): void {
    const bucket = this.cells.get(key);
    if (!bucket) return;
    bucket.delete(id);
    if (bucket.size === 0) this.cells.delete(key);
  }

  clear(): void {
    this.cells.clear();
    this.placement.clear();
  }

  /** Rebuild from scratch — used when the document is replaced wholesale. */
  rebuild(objects: Iterable<T>): void {
    this.clear();
    for (const o of objects) this.insert(o);
  }

  get size(): number {
    return this.placement.size;
  }

  /**
   * Objects in cells overlapping `bounds`.
   *
   * Returns whole buckets, so results can lie slightly outside the query — callers that
   * need exactness (hit-testing) must still check individually. For culling that is fine
   * and cheaper than filtering twice.
   */
  query(bounds: Bounds): T[] {
    const minCx = Math.floor(bounds.minX / CELL_SIZE);
    const maxCx = Math.floor(bounds.maxX / CELL_SIZE);
    const minCy = Math.floor(bounds.minY / CELL_SIZE);
    const maxCy = Math.floor(bounds.maxY / CELL_SIZE);

    const out: T[] = [];
    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket) continue;
        for (const obj of bucket.values()) out.push(obj);
      }
    }
    return out;
  }

  /**
   * Nearest object to a point within `radius`, or null.
   *
   * Used for click hit-testing; the radius query is expanded to whole cells, so a symbol
   * just across a bucket boundary is still found.
   */
  nearest(x: number, y: number, radius: number): T | null {
    const candidates = this.query({
      minX: x - radius,
      minY: y - radius,
      maxX: x + radius,
      maxY: y + radius,
    });

    let best: T | null = null;
    let bestDist = radius * radius;

    for (const obj of candidates) {
      const dx = obj.x - x;
      const dy = obj.y - y;
      const d = dx * dx + dy * dy;
      if (d <= bestDist) {
        bestDist = d;
        best = obj;
      }
    }
    return best;
  }
}
