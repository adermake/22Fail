import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';
import { LootItem } from '../model/world.model';

export interface CharacterPatchEvent {
  characterId: string;
  patch: JsonPatch;
}

@Injectable({ providedIn: 'root' })
export class CharacterSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<CharacterPatchEvent>();
  private lootReceivedSubject = new Subject<LootItem>();
  private battleLootReceivedSubject = new Subject<LootItem[]>();

  patches$ = this.patchSubject.asObservable();
  lootReceived$ = this.lootReceivedSubject.asObservable();
  battleLootReceived$ = this.battleLootReceivedSubject.asObservable();

  connect() {
    if (this.socket) return;
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('characterPatched', (data: CharacterPatchEvent) => {
      this.patchSubject.next(data);
    });

    this.socket.on('lootReceived', (loot: LootItem) => {
      this.lootReceivedSubject.next(loot);
    });

    this.socket.on('battleLootReceived', (lootItems: LootItem[]) => {
      this.battleLootReceivedSubject.next(lootItems);
    });
  }

  joinCharacter(characterId: string) {
    this.socket?.emit('joinCharacter', characterId);
  }

  sendPatch(characterId: string, patch: JsonPatch) {
    console.log('Sending patch '+JSON.stringify(patch));
    this.socket?.emit('patchCharacter', { characterId, patch });
  }
}
