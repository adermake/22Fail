import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorldMapApiService } from './world-map-api.service';
import { WorldMapSocketService } from './world-map-socket.service';
import {
  WorldMapData,
  MacroTile,
  WorldMapToken,
  SubHexRef,
  subHexKey,
  createEmptyWorldMap,
  createQuickToken,
} from '../model/world-map.model';
import { Stroke, generateId } from '../model/lobby.model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class WorldMapStoreService {
  private api = inject(WorldMapApiService);
  private socket = inject(WorldMapSocketService);

  private dataSubject = new BehaviorSubject<WorldMapData | null>(null);
  data$ = this.dataSubject.asObservable();

  worldName = '';
  private pendingPatchHashes = new Set<string>();
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  get data(): WorldMapData | null {
    return this.dataSubject.value;
  }

  async load(worldName: string): Promise<WorldMapData> {
    this.worldName = worldName;
    this.socket.connect(worldName);

    let data = await this.api.load(worldName);
    if (!data) {
      data = await this.api.create(worldName);
    }
    data.worldName = worldName;
    this.dataSubject.next(data);
    return data;
  }

  destroy(): void {
    this.socket.disconnect();
    this.dataSubject.next(null);
    this.worldName = '';
  }

  applyRemotePatch(patch: JsonPatch): void {
    const hash = this.hashPatch(patch);
    if (this.pendingPatchHashes.has(hash)) {
      this.pendingPatchHashes.delete(hash);
      return;
    }
    const data = this.data;
    if (!data) return;
    this.applyJsonPatch(data as unknown as Record<string, unknown>, patch);
    data.updatedAt = Date.now();
    this.dataSubject.next({ ...data });
  }

  private patch(path: string, value: unknown): void {
    const data = this.data;
    if (!data) return;

    const jsonPatch: JsonPatch = { path, value };
    const hash = this.hashPatch(jsonPatch);
    this.pendingPatchHashes.add(hash);
    setTimeout(() => this.pendingPatchHashes.delete(hash), 10000);

    this.applyJsonPatch(data as unknown as Record<string, unknown>, jsonPatch);
    data.updatedAt = Date.now();
    this.dataSubject.next({ ...data });

    this.scheduleSave();
    this.socket.ensureConnected().then(() => {
      this.socket.sendPatch(jsonPatch);
    }).catch(() => {});
  }

  private scheduleSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      const data = this.data;
      if (data && this.worldName) {
        this.api.save(this.worldName, data).catch(err =>
          console.error('[WorldMapStore] Save failed:', err)
        );
      }
    }, 500);
  }

  setMacroTiles(tiles: MacroTile[]): void {
    this.patch('macroTiles', tiles);
  }

  addMacroTile(tile: MacroTile): void {
    const tiles = [...(this.data?.macroTiles ?? []), tile];
    this.patch('macroTiles', tiles);
  }

  removeMacroTile(tileId: string): void {
    const tiles = (this.data?.macroTiles ?? []).filter(t => t.id !== tileId);
    this.patch('macroTiles', tiles);
  }

  updateMacroTile(tileId: string, updates: Partial<MacroTile>): void {
    const tiles = (this.data?.macroTiles ?? []).map(t =>
      t.id === tileId ? { ...t, ...updates } : t
    );
    this.patch('macroTiles', tiles);
  }

  revealSubHexes(refs: SubHexRef[]): void {
    const revealed = new Set(this.data?.revealedSubHexes ?? []);
    for (const ref of refs) revealed.add(subHexKey(ref));
    this.patch('revealedSubHexes', Array.from(revealed));
  }

  recoverSubHexes(refs: SubHexRef[]): void {
    const remove = new Set(refs.map(subHexKey));
    const revealed = (this.data?.revealedSubHexes ?? []).filter(k => !remove.has(k));
    this.patch('revealedSubHexes', revealed);
  }

  addStroke(stroke: Stroke): void {
    const strokes = [...(this.data?.strokes ?? []), stroke];
    this.patch('strokes', strokes);
  }

  undoStroke(): void {
    const strokes = this.data?.strokes ?? [];
    if (strokes.length === 0) return;
    this.patch('strokes', strokes.slice(0, -1));
  }

  setStrokes(strokes: Stroke[]): void {
    this.patch('strokes', strokes);
  }

  addToken(token: WorldMapToken): void {
    const tokens = [...(this.data?.tokens ?? []), token];
    this.patch('tokens', tokens);
  }

  moveToken(tokenId: string, ref: SubHexRef): void {
    const tokens = (this.data?.tokens ?? []).map(t =>
      t.id === tokenId
        ? { ...t, macroQ: ref.macroQ, macroR: ref.macroR, subQ: ref.subQ, subR: ref.subR }
        : t
    );
    this.patch('tokens', tokens);
  }

  removeToken(tokenId: string): void {
    const tokens = (this.data?.tokens ?? []).filter(t => t.id !== tokenId);
    this.patch('tokens', tokens);
  }

  createQuickTokenAt(ref: SubHexRef, name = 'Token'): WorldMapToken {
    const token = createQuickToken(ref, name);
    this.addToken(token);
    return token;
  }

  private applyJsonPatch(target: Record<string, unknown>, patch: JsonPatch): void {
    const parts = patch.path.split('.').filter(Boolean);
    if (parts.length === 0) return;
    let obj: any = target;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
      if (obj == null) return;
    }
    obj[parts[parts.length - 1]] = patch.value;
  }

  private hashPatch(patch: JsonPatch): string {
    return `${patch.path}:${JSON.stringify(patch.value)}`;
  }
}
