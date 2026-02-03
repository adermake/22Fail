import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BattlemapData, LobbyData, MapData, createEmptyBattlemap, createEmptyLobby } from '../model/battlemap.model';

@Injectable({ providedIn: 'root' })
export class BattleMapApiService {
  private http = inject(HttpClient);

  // Lobby operations
  async loadLobby(worldName: string): Promise<LobbyData | null> {
    const url = `/api/worlds/${worldName}/lobby`;
    try {
      const result = await firstValueFrom(this.http.get<LobbyData>(url));
      return result;
    } catch (err) {
      console.error(`[LOBBY API] Failed to load lobby for world ${worldName}:`, err);
      return null;
    }
  }

  async saveLobby(worldName: string, lobby: LobbyData): Promise<void> {
    const url = `/api/worlds/${worldName}/lobby`;
    try {
      await firstValueFrom(this.http.post(url, lobby));
    } catch (err) {
      console.error(`[LOBBY API] Failed to save lobby:`, err);
      throw err;
    }
  }

  async createLobby(worldName: string): Promise<LobbyData | null> {
    const url = `/api/worlds/${worldName}/lobby`;
    const newLobby = createEmptyLobby(worldName);
    try {
      return await firstValueFrom(this.http.post<LobbyData>(url, newLobby));
    } catch (err) {
      console.error(`[LOBBY API] Failed to create lobby for world ${worldName}:`, err);
      return null;
    }
  }

  // Map operations (lazy loading)
  async loadMap(worldName: string, mapId: string): Promise<MapData | null> {
    const url = `/api/worlds/${worldName}/lobby/maps/${mapId}`;
    try {
      const result = await firstValueFrom(this.http.get<MapData>(url));
      return result;
    } catch (err) {
      console.error(`[LOBBY API] Failed to load map ${mapId}:`, err);
      return null;
    }
  }

  async saveMap(worldName: string, mapId: string, map: MapData): Promise<void> {
    const url = `/api/worlds/${worldName}/lobby/maps/${mapId}`;
    try {
      await firstValueFrom(this.http.post(url, map));
    } catch (err) {
      console.error(`[LOBBY API] Failed to save map:`, err);
      throw err;
    }
  }

  // Legacy battlemap operations (for backward compatibility)
  async loadBattleMap(worldName: string, battleMapId: string): Promise<BattlemapData | null> {
    const url = `/api/worlds/${worldName}/battlemaps/${battleMapId}`;
    try {
      const result = await firstValueFrom(this.http.get<BattlemapData>(url));
      return result;
    } catch (err) {
      console.error(`[BATTLEMAP API] Failed to load battle map ${battleMapId}:`, err);
      return null;
    }
  }

  async saveBattleMap(worldName: string, battleMap: BattlemapData): Promise<void> {
    const url = `/api/worlds/${worldName}/battlemaps/${battleMap.id}`;
    try {
      await firstValueFrom(this.http.post(url, battleMap));
    } catch (err) {
      console.error(`[BATTLEMAP API] Failed to save battle map:`, err);
      throw err;
    }
  }

  async createBattleMap(worldName: string, battleMap: BattlemapData): Promise<BattlemapData | null> {
    const url = `/api/worlds/${worldName}/battlemaps`;
    try {
      return await firstValueFrom(this.http.post<BattlemapData>(url, battleMap));
    } catch (err) {
      console.error(`[BATTLEMAP API] Failed to create battle map in world ${worldName}:`, err);
      return null;
    }
  }

  async listBattleMaps(worldName: string): Promise<{ id: string; name: string }[]> {
    const url = `/api/worlds/${worldName}/battlemaps`;
    try {
      const result = await firstValueFrom(this.http.get<{ id: string; name: string }[]>(url));
      return result || [];
    } catch (err) {
      console.error(`[BATTLEMAP API] Failed to list battlemaps:`, err);
      return [];
    }
  }

  async deleteBattleMap(worldName: string, battleMapId: string): Promise<void> {
    const url = `/api/worlds/${worldName}/battlemaps/${battleMapId}`;
    try {
      await firstValueFrom(this.http.delete(url));
    } catch (err) {
      console.error(`[BATTLEMAP API] Failed to delete battlemap:`, err);
      throw err;
    }
  }
}
