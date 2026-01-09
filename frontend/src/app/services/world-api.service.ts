import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WorldData } from '../model/world.model';

@Injectable({ providedIn: 'root' })
export class WorldApiService {
  constructor(private http: HttpClient) {}

  async loadWorld(name: string): Promise<WorldData | null> {
    const observable = this.http.get(`/api/worlds/${name}`);
    return await firstValueFrom(observable) as WorldData | null;
  }

  async saveWorld(name: string, world: WorldData): Promise<any> {
    const observable = this.http.post(`/api/worlds/${name}`, world);
    return await firstValueFrom(observable);
  }
}
