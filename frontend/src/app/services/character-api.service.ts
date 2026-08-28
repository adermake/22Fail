import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CharacterSummary {
  id: string;
  name?: string;
  /** Image id (or a legacy data URL) — render it through the `imageUrl` pipe, never raw. */
  portrait?: string;
  worldName?: string;
  controllerUserIds?: string[];
  level?: number;
  primaryClass?: string;
  secondaryClass?: string;
  race?: string;
  /** File mtime — lets the homepage sort by "last played". */
  updatedAt?: number;
}

/** A soft-deleted character or world, restorable from the admin trash. */
export interface TrashEntry {
  kind: 'character' | 'world';
  id: string;
  name: string;
  deletedAt: number;
  deletedBy?: string;
}

@Injectable({ providedIn: 'root' })
export class CharacterApiService {
  constructor(private http: HttpClient) {}

  async loadCharacter(id: string): Promise<any> {
    const observable = this.http.get(`/api/characters/${id}`);
    return await firstValueFrom(observable);
  }

  async getAllCharacterIds(): Promise<string[]> {
    const observable = this.http.get<string[]>(`/api/characters`);
    return await firstValueFrom(observable);
  }

  async getCharacterSummaries(): Promise<CharacterSummary[]> {
    return await firstValueFrom(this.http.get<CharacterSummary[]>(`/api/character-summaries`));
  }

  /** Admin: set exactly which users control a character. */
  async setControllers(id: string, controllerUserIds: string[]): Promise<any> {
    return await firstValueFrom(this.http.put(`/api/characters/${id}/controllers`, { controllerUserIds }));
  }

  /** Admin: move a character into the trash (recoverable). */
  async deleteCharacter(id: string): Promise<any> {
    return await firstValueFrom(this.http.delete(`/api/characters/${id}`));
  }

  // ── Admin trash ──
  async listTrash(): Promise<TrashEntry[]> {
    return await firstValueFrom(this.http.get<TrashEntry[]>('/api/trash'));
  }

  async restoreFromTrash(kind: TrashEntry['kind'], id: string): Promise<any> {
    return await firstValueFrom(
      this.http.post(`/api/trash/${kind}/${encodeURIComponent(id)}/restore`, {}));
  }

  async purgeFromTrash(kind: TrashEntry['kind'], id: string): Promise<any> {
    return await firstValueFrom(this.http.delete(`/api/trash/${kind}/${encodeURIComponent(id)}`));
  }

  async saveCharacter(id: string, sheet: any): Promise<any> {
    const observable = this.http.post(`/api/characters/${id}`, sheet);
    return await firstValueFrom(observable);
  }

  async patchCharacter(id: string, patch: any): Promise<any> {
    const observable = this.http.patch(`/api/characters/${id}`, patch);
    return await firstValueFrom(observable);
  }

  async uploadPortrait(id: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('portrait', file);

    const observable = this.http.post(`/api/characters/${id}/portrait`, formData);
    await firstValueFrom(observable);
  }
}
