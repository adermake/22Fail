import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattleMapApiService } from './battlemap-api.service';
import { BattleMapSocketService } from './battlemap-socket.service';
import { BattleMap } from '../model/world.model';
import { JsonPatch } from '../model/json-patch.model';
import { v4 as uuidv4 } from 'uuid';

export function createEmptyBattleMap(id: string, name: string): BattleMap {
    return {
        id,
        name,
        drawings: [],
        tokens: [],
    };
}

@Injectable({ providedIn: 'root' })
export class BattleMapStoreService {
    private battleMapSubject = new BehaviorSubject<BattleMap | null>(null);
    battleMap$ = this.battleMapSubject.asObservable();

    worldName!: string;
    battleMapId!: string;

    get battleMapValue(): BattleMap | null {
        return this.battleMapSubject.value;
    }

    constructor(private api: BattleMapApiService, private socket: BattleMapSocketService) {
        this.socket.patches$.subscribe((patch) => {
            const battleMap = this.battleMapSubject.value;
            if (!battleMap) return;
            this.applyJsonPatch(battleMap, patch);
            this.battleMapSubject.next({ ...battleMap });
        });
    }

    async load(worldName: string, battleMapId: string) {
        this.worldName = worldName;
        this.battleMapId = battleMapId;
        let battleMap = await this.api.loadBattleMap(worldName, battleMapId);

        if (!battleMap) {
            console.log('Creating empty battle map');
            const newId = battleMapId;
            const newName = 'New Battle Map'; // You might want a better way to name this
            battleMap = createEmptyBattleMap(newId, newName);
            this.battleMapSubject.next(battleMap);
            await this.api.createBattleMap(worldName, battleMap);
        } else {
            console.log('Using existing battle map');
            this.battleMapSubject.next(battleMap);
        }

        this.socket.connect();
        this.socket.joinBattleMap(worldName, battleMapId);
    }

    applyPatch(patch: JsonPatch) {
        // Apply optimistically
        const battleMap = this.battleMapSubject.value;
        if (battleMap) {
            this.applyJsonPatch(battleMap, patch);
            this.battleMapSubject.next({ ...battleMap });
        }
        this.socket.sendPatch(this.worldName, this.battleMapId, patch);
    }

    private applyJsonPatch(target: any, patch: JsonPatch) {
        const keys = patch.path.split('.');
        let current = target;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const index = parseInt(key, 10);

            if (!isNaN(index) && Array.isArray(current)) {
                current = current[index];
            } else {
                current = current[key] ??= {};
            }
        }

        const finalKey = keys[keys.length - 1];
        const finalIndex = parseInt(finalKey, 10);

        if (!isNaN(finalIndex) && Array.isArray(current)) {
            current[finalIndex] = patch.value;
        } else {
            current[finalKey] = patch.value;
        }
    }
}
