import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Map Storage Service (Frontend)
 * 
 * Handles persistent file-based map storage via backend API.
 */
@Injectable({ providedIn: 'root' })
export class MapStorageService {
  private readonly apiUrl = '/api/maps';

  constructor(private http: HttpClient) {}

  /**
   * Save a map to persistent storage
   */
  async saveMap(worldName: string, mapName: string, mapData: any): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(`${this.apiUrl}/save`, {
          worldName,
          mapName,
          mapData,
        })
      );
      return response.success;
    } catch (error) {
      console.error('[MapStorage] Failed to save map:', error);
      return false;
    }
  }

  /**
   * Load a map from persistent storage
   */
  async loadMap(worldName: string, mapName: string): Promise<any | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; mapData?: any; error?: string }>(
          `${this.apiUrl}/load/${worldName}/${mapName}`
        )
      );
      
      if (response.success && response.mapData) {
        return response.mapData;
      }
      
      return null;
    } catch (error) {
      console.error('[MapStorage] Failed to load map:', error);
      return null;
    }
  }

  /**
   * Create a backup of the current map
   */
  async backupMap(worldName: string, mapName: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(
          `${this.apiUrl}/backup/${worldName}/${mapName}`,
          {}
        )
      );
      return response.success;
    } catch (error) {
      console.error('[MapStorage] Failed to backup map:', error);
      return false;
    }
  }

  /**
   * List all maps for a world
   */
  async listMaps(worldName: string): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; maps: string[] }>(
          `${this.apiUrl}/list/${worldName}`
        )
      );
      return response.maps || [];
    } catch (error) {
      console.error('[MapStorage] Failed to list maps:', error);
      return [];
    }
  }

  /**
   * Delete a map (moves to trash)
   */
  async deleteMap(worldName: string, mapName: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.delete<{ success: boolean }>(
          `${this.apiUrl}/${worldName}/${mapName}`
        )
      );
      return response.success;
    } catch (error) {
      console.error('[MapStorage] Failed to delete map:', error);
      return false;
    }
  }

  /**
   * Check if a map exists
   */
  async mapExists(worldName: string, mapName: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ exists: boolean }>(
          `${this.apiUrl}/exists/${worldName}/${mapName}`
        )
      );
      return response.exists;
    } catch (error) {
      console.error('[MapStorage] Failed to check map existence:', error);
      return false;
    }
  }
}
