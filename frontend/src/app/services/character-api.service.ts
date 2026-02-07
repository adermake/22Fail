import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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
