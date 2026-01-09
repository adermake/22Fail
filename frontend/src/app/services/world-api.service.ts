import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorldApiService {
  constructor(private http: HttpClient) {}

  async getWorld(name: string): Promise<any> {
    const obs = this.http.get(`/api/worlds/${name}`);
    return await firstValueFrom(obs);
  }

  async saveWorld(name: string, world: any): Promise<any> {
    const obs = this.http.post(`/api/worlds/${name}`, world);
    return await firstValueFrom(obs);
  }

  async listWorlds(): Promise<string[]> {
    const obs = this.http.get(`/api/worlds`);
    return await firstValueFrom(obs) as string[];
  }

  async listCharacters(): Promise<any> {
    const obs = this.http.get(`/api/characters`);
    return await firstValueFrom(obs);
  }
}
