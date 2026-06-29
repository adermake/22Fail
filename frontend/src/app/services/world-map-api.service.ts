import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WorldMapData, createEmptyWorldMap } from '../model/world-map.model';

@Injectable({ providedIn: 'root' })
export class WorldMapApiService {
  private http = inject(HttpClient);

  async load(worldName: string): Promise<WorldMapData | null> {
    try {
      return await firstValueFrom(
        this.http.get<WorldMapData>(`/api/worlds/${worldName}/world-map`)
      );
    } catch (err: any) {
      if (err.status === 404) return null;
      console.error('[WorldMapAPI] Failed to load:', err);
      return null;
    }
  }

  async save(worldName: string, data: WorldMapData): Promise<void> {
    await firstValueFrom(
      this.http.post(`/api/worlds/${worldName}/world-map`, data)
    );
  }

  async create(worldName: string): Promise<WorldMapData> {
    const data = createEmptyWorldMap(worldName);
    await this.save(worldName, data);
    return data;
  }
}
