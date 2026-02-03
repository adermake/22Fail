/**
 * Lobby API Service
 * 
 * HTTP communication for lobby persistence.
 * Uses /api/worlds/:worldName/lobby endpoints.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LobbyData, LobbyMap, createEmptyLobby } from '../model/lobby.model';

@Injectable({ providedIn: 'root' })
export class LobbyApiService {
  private http = inject(HttpClient);

  /**
   * Load lobby for a world. Returns null if not found.
   */
  async loadLobby(worldName: string): Promise<LobbyData | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<LobbyData>(`/api/worlds/${worldName}/lobby`)
      );
      return result;
    } catch (err: any) {
      if (err.status === 404) {
        return null;
      }
      console.error('[LobbyAPI] Failed to load lobby:', err);
      return null;
    }
  }

  /**
   * Save entire lobby data.
   */
  async saveLobby(worldName: string, lobby: LobbyData): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`/api/worlds/${worldName}/lobby`, lobby)
      );
    } catch (err) {
      console.error('[LobbyAPI] Failed to save lobby:', err);
      throw err;
    }
  }

  /**
   * Create a new lobby (when none exists).
   */
  async createLobby(worldName: string): Promise<LobbyData> {
    const newLobby = createEmptyLobby(worldName);
    try {
      const result = await firstValueFrom(
        this.http.post<LobbyData>(`/api/worlds/${worldName}/lobby`, newLobby)
      );
      return result || newLobby;
    } catch (err) {
      console.error('[LobbyAPI] Failed to create lobby:', err);
      throw err;
    }
  }
}
