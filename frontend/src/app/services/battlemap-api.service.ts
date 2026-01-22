import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BattlemapData, createEmptyBattlemap } from '../model/battlemap.model';

@Injectable({ providedIn: 'root' })
export class BattleMapApiService {
  private http = inject(HttpClient);

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
