import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorldApiService } from './world-api.service';
import { WorldSocketService } from './world-socket.service';
import { WorldData, createEmptyWorld } from '../model/world.model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class WorldStoreService {
  private worldSubject = new BehaviorSubject<WorldData | null>(null);
  world$ = this.worldSubject.asObservable();

  worldName!: string;

  get worldValue(): WorldData | null {
    return this.worldSubject.value;
  }

  constructor(
    private api: WorldApiService,
    private socket: WorldSocketService
  ) {
    this.socket.patches$.subscribe((patch) => {
      const world = this.worldSubject.value;
      if (!world) return;
      this.applyJsonPatch(world, patch);
      this.worldSubject.next({ ...world });
    });
  }

  async save(): Promise<void> {
    const world = this.worldSubject.value;
    if (!world) {
      console.warn('No world loaded, cannot save.');
      return;
    }

    if (!this.worldName) {
      console.error('No worldName set, cannot save.');
      return;
    }

    try {
      await this.api.saveWorld(this.worldName, world);
    } catch (err) {
      console.error('Failed to save world:', err);
    }
  }

  async load(name: string) {
    this.worldName = name;
    let world = await this.api.loadWorld(name);
    if (!world) {
      world = createEmptyWorld(name);
      this.worldSubject.next(world);
      this.save();
    } else {
      // Migrate existing worlds to include new fields
      if (!world.battleParticipants) {
        world.battleParticipants = [];
      }
      if (world.currentTurnIndex === undefined) {
        world.currentTurnIndex = 0;
      }
      if (!world.skillLibrary) {
        world.skillLibrary = [];
      }
      this.worldSubject.next(world);
    }

    this.socket.connect();
    this.socket.joinWorld(name);
  }

  applyPatch(patch: JsonPatch) {
    console.log('[WORLD STORE] Applying patch:', patch);
    // Apply optimistically
    const world = this.worldSubject.value;
    if (world) {
      console.log('[WORLD STORE] World before patch:', JSON.parse(JSON.stringify(world)));
      this.applyJsonPatch(world, patch);
      console.log('[WORLD STORE] World after patch:', JSON.parse(JSON.stringify(world)));
      this.worldSubject.next({ ...world });
    }
    console.log('[WORLD STORE] Sending patch to socket for world:', this.worldName);
    this.socket.sendPatch(this.worldName, patch);
  }

  revealBattleLoot() {
    this.socket.revealBattleLoot(this.worldName);
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.split('.');
    let current = target;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);

      // Check if it's an array index
      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = current[key] ??= {};
      }
    }

    const finalKey = keys[keys.length - 1];
    const finalIndex = parseInt(finalKey, 10);

    // Handle final key - could also be an array index
    if (!isNaN(finalIndex) && Array.isArray(current)) {
      current[finalIndex] = patch.value;
    } else {
      current[finalKey] = patch.value;
    }
  }
}
