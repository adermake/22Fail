import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BattleMap } from '../model/world.model';

@Injectable({ providedIn: 'root' })
export class BattleMapApiService {
    constructor(private http: HttpClient) {}

    async loadBattleMap(worldName: string, battleMapId: string): Promise<BattleMap | null> {
        const url = `/api/worlds/${worldName}/battlemaps/${battleMapId}`;
        try {
            return await firstValueFrom(this.http.get<BattleMap>(url));
        } catch (err) {
            console.error(`Failed to load battle map ${battleMapId} from world ${worldName}:`, err);
            return null;
        }
    }

    async createBattleMap(worldName: string, battleMap: BattleMap): Promise<any> {
        const url = `/api/worlds/${worldName}/battlemaps`;
        try {
            return await firstValueFrom(this.http.post(url, battleMap));
        } catch (err) {
            console.error(`Failed to create battle map in world ${worldName}:`, err);
            return null;
        }
    }
}
