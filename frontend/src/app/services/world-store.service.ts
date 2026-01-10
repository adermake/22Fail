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
      console.warn('[WORLD STORE] No world loaded, cannot save.');
      return;
    }

    if (!this.worldName) {
      console.error('[WORLD STORE] No worldName set, cannot save.');
      return;
    }

    console.log('[WORLD STORE] Saving world to backend:', this.worldName);
    console.log('[WORLD STORE] World data being saved:', JSON.stringify(world, null, 2));
    try {
      await this.api.saveWorld(this.worldName, world);
      console.log('[WORLD STORE] World saved successfully');
    } catch (err) {
      console.error('[WORLD STORE] Failed to save world:', err);
    }
  }

  async load(name: string) {
    this.worldName = name;
    console.log('[WORLD STORE] Loading world:', name);
    let world: any = await this.api.loadWorld(name);
    console.log('[WORLD STORE] Loaded world from API:', world);

    if (!world) {
      console.log('[WORLD STORE] No world found, creating new');
      world = createEmptyWorld(name);
      this.worldSubject.next(world);
      this.save();
    } else {
      // CRITICAL: Migrate old world format to new format
      let needsSave = false;

      // Old format had 'characters' instead of 'characterIds'
      if (world.characters && !world.characterIds) {
        console.log('[WORLD STORE] Migrating: characters -> characterIds');
        world.characterIds = world.characters;
        delete world.characters;
        needsSave = true;
      }

      // Old format had 'party' instead of 'partyIds'
      if (world.party && !world.partyIds) {
        console.log('[WORLD STORE] Migrating: party -> partyIds');
        world.partyIds = world.party;
        delete world.party;
        needsSave = true;
      }

      // Old format had 'library' object instead of separate library arrays
      if (world.library) {
        console.log('[WORLD STORE] Migrating: library object -> separate libraries');
        world.itemLibrary = world.library.items || [];
        world.runeLibrary = world.library.runes || [];
        world.spellLibrary = world.library.spells || [];
        world.skillLibrary = world.library.skills || [];
        delete world.library;
        needsSave = true;
      }

      // Add new fields if missing
      if (!world.name) {
        world.name = name;
        needsSave = true;
      }
      if (!world.battleParticipants) {
        console.log('[WORLD STORE] Migrating: adding battleParticipants');
        world.battleParticipants = [];
        needsSave = true;
      }
      if (world.currentTurnIndex === undefined) {
        console.log('[WORLD STORE] Migrating: adding currentTurnIndex');
        world.currentTurnIndex = 0;
        needsSave = true;
      }
      if (!world.lootBundles) {
        console.log('[WORLD STORE] Migrating: adding lootBundles');
        world.lootBundles = [];
        needsSave = true;
      }
      if (!world.skillLibrary) {
        console.log('[WORLD STORE] Migrating: adding skillLibrary');
        world.skillLibrary = [];
        needsSave = true;
      }

      console.log('[WORLD STORE] Setting loaded world with', world.battleParticipants?.length || 0, 'battle participants');
      this.worldSubject.next(world);

      // Save migrated world to backend
      if (needsSave) {
        console.log('[WORLD STORE] Saving migrated world to backend');
        await this.save();
      }
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
