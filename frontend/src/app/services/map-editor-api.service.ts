import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  DetailTier,
  MapEditorData,
  RasterLayer,
  createEmptyMapEditorData,
} from '../map-editor/map-editor.model';
import { identityHeaders } from './identity';

/**
 * REST access for the map editor (format v2).
 *
 * The document arrives already filtered to the caller's visibility — the server drops
 * secret objects for players, so this service never has to be trusted to hide anything.
 *
 * Chunks move as raw PNG bytes rather than base64-in-JSON: a painted chunk is on the order
 * of a hundred KB, and base64 would inflate every terrain edit by a third for no gain.
 */
@Injectable({ providedIn: 'root' })
export class MapEditorApiService {
  private http = inject(HttpClient);

  private base(worldName: string): string {
    return `/api/worlds/${encodeURIComponent(worldName)}/map-editor`;
  }

  async load(worldName: string): Promise<MapEditorData> {
    try {
      const data = await firstValueFrom(
        this.http.get<MapEditorData>(this.base(worldName)),
      );
      return data ?? createEmptyMapEditorData(worldName);
    } catch (err) {
      console.error('[MapEditorAPI] Failed to load:', err);
      return createEmptyMapEditorData(worldName);
    }
  }

  async save(worldName: string, data: MapEditorData): Promise<void> {
    await firstValueFrom(this.http.post(this.base(worldName), data));
  }

  /**
   * One URL shape for every tier. All three are authored the same way and stored the same
   * way, so nothing here needs to know which is which.
   */
  private chunkUrl(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
  ): string {
    return `${this.base(worldName)}/chunks/${layer}/${tier}/${cx}/${cy}`;
  }

  /**
   * Fetch a painted chunk. Resolves `null` for a chunk that has never been painted, which
   * is the common case over most of a large map and not an error.
   *
   * `ver` busts the cache; the bytes at a given version are immutable, so the response is
   * cached aggressively by the server.
   */
  async fetchChunk(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
    ver: number,
  ): Promise<Blob | null> {
    const url = `${this.chunkUrl(worldName, layer, tier, cx, cy)}?v=${ver}`;
    try {
      // Raw fetch bypasses Angular's identity interceptor, so attach the headers by hand.
      const res = await fetch(url, { headers: identityHeaders() });
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  }

  /** Upload a painted chunk; resolves the new server-side version. */
  async putChunk(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    cx: number,
    cy: number,
    blob: Blob,
  ): Promise<number | null> {
    try {
      const res = await fetch(this.chunkUrl(worldName, layer, tier, cx, cy), {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png', ...identityHeaders() },
        body: blob,
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { success: boolean; ver?: number };
      return json.success ? (json.ver ?? null) : null;
    } catch (err) {
      console.error('[MapEditorAPI] Chunk upload failed:', err);
      return null;
    }
  }

  /**
   * Which chunks of a layer and tier the server actually holds inside a rectangle.
   *
   * Asked before any bulk erase. The local `chunkVersions` is a cache and can lose entries;
   * skipping an erase because it says "nothing here" leaves real pixels in place, which the
   * next stamp then republishes — a square of deleted map coming back.
   */
  async listChunks(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    rect: { minCx: number; minCy: number; maxCx: number; maxCy: number },
  ): Promise<[number, number][]> {
    const query =
      `minCx=${rect.minCx}&minCy=${rect.minCy}` + `&maxCx=${rect.maxCx}&maxCy=${rect.maxCy}`;
    try {
      const res = await fetch(`${this.base(worldName)}/chunks/${layer}/${tier}?${query}`, {
        headers: identityHeaders(),
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { cells?: [number, number][] };
      return json.cells ?? [];
    } catch (err) {
      console.error('[MapEditorAPI] Chunk list failed:', err);
      return [];
    }
  }

  /**
   * Delete every stored chunk of a layer and tier inside a chunk-coordinate rectangle.
   *
   * Resolves the cells the server actually removed — usually far fewer than the rectangle,
   * because most of a map has never been painted. Callers broadcast exactly those, so other
   * sessions drop only ground that really changed.
   */
  async clearChunks(
    worldName: string,
    layer: RasterLayer,
    tier: DetailTier,
    rect: { minCx: number; minCy: number; maxCx: number; maxCy: number },
  ): Promise<[number, number][] | null> {
    const query =
      `minCx=${rect.minCx}&minCy=${rect.minCy}` + `&maxCx=${rect.maxCx}&maxCy=${rect.maxCy}`;
    try {
      const res = await fetch(`${this.base(worldName)}/chunks/${layer}/${tier}?${query}`, {
        method: 'DELETE',
        headers: identityHeaders(),
      });
      /*
       * `null` for refused or failed, `[]` for "succeeded, nothing was stored there".
       *
       * Collapsing those two into an empty array made a clear that did nothing at all look
       * exactly like one that had nothing to do — so a deletion could silently not happen,
       * the files stayed on disk, and the next time the server rescanned the directory the
       * content came back. A failure has to be loud.
       */
      if (!res.ok) {
        console.error('[MapEditorAPI] Chunk clear rejected:', res.status);
        return null;
      }
      const json = (await res.json()) as { success: boolean; cells?: [number, number][] };
      if (!json.success) {
        console.error('[MapEditorAPI] Chunk clear refused by the server (GM only).');
        return null;
      }
      return json.cells ?? [];
    } catch (err) {
      console.error('[MapEditorAPI] Chunk clear failed:', err);
      return null;
    }
  }
}
