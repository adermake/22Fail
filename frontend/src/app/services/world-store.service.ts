import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorldApiService } from './world-api.service';
import { WorldSocketService } from './world-socket.service';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class WorldStoreService {
  private worldSubject = new BehaviorSubject<any | null>(null);
  world$ = this.worldSubject.asObservable();

  worldName!: string;

  constructor(private api: WorldApiService, private socket: WorldSocketService) {
    this.socket.patches$.subscribe((patch) => {
      const world = this.worldSubject.value;
      if (!world) return;
      this.applyJsonPatch(world, patch);
      this.worldSubject.next({ ...world });
    });
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

  async load(name: string) {
    this.worldName = name;
    let w = await this.api.getWorld(name);
    if (!w) {
      w = { characters: [], party: [], library: { items: [], runes: [], spells: [] }, battleLoot: [] };
      this.worldSubject.next(w);
      await this.api.saveWorld(name, w);
    } else {
      this.worldSubject.next(w);
    }

    this.socket.connect();
    this.socket.joinWorld(name);
  }

  async save(): Promise<void> {
    const w = this.worldSubject.value;
    if (!w) return;
    await this.api.saveWorld(this.worldName, w);
  }

  applyPatch(patch: JsonPatch) {
    // Prefer sending via socket; fallback to HTTP PATCH if socket not connected
    if (this.socket && this.socket['isConnected'] && this.socket.isConnected()) {
      this.socket.sendPatch(this.worldName, patch);
    } else {
      // Use HTTP PATCH as fallback to persist state
      this.api.patchWorld(this.worldName, patch).catch((err) => console.error('Patch world failed', err));
    }
  }
}
