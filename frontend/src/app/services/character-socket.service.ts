import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { identityAuth } from './identity';
import { JsonPatch } from '../model/json-patch.model';

export interface CharacterPatchEvent {
  characterId: string;
  patch: JsonPatch;
}

@Injectable({ providedIn: 'root' })
export class CharacterSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<CharacterPatchEvent>();
  private localUpdateSubject = new Subject<void>();
  private reconnectedSubject = new Subject<void>();
  /**
   * Every character room this client asked for. Socket.IO forgets room membership when the
   * connection drops, so without re-joining on reconnect the page silently stopped receiving
   * patches (sheet ↔ lobby drifted apart after any network blip, sleep or server restart).
   */
  private joinedRooms = new Set<string>();
  private hasConnectedOnce = false;

  patches$ = this.patchSubject.asObservable();
  /** Fires immediately when the local UI mutates character data (before server echo). */
  localUpdate$ = this.localUpdateSubject.asObservable();
  /** Fires after a RE-connect (not the first connect): patches may have been missed, reload state. */
  reconnected$ = this.reconnectedSubject.asObservable();

  notifyLocalUpdate(): void { this.localUpdateSubject.next(); }

  connect() {
    if (this.socket) return;
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      auth: identityAuth(),
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      for (const id of this.joinedRooms) this.socket?.emit('joinCharacter', id);
      if (this.hasConnectedOnce) this.reconnectedSubject.next();
      this.hasConnectedOnce = true;
    });

    this.socket.on('characterPatched', (data: CharacterPatchEvent) => {
      this.patchSubject.next(data);
    });

  }

  joinCharacter(characterId: string) {
    this.joinedRooms.add(characterId);
    this.socket?.emit('joinCharacter', characterId);
  }

  sendPatch(characterId: string, patch: JsonPatch) {
    this.socket?.emit('patchCharacter', { characterId, patch });
  }
}
