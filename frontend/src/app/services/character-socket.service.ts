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

  patches$ = this.patchSubject.asObservable();
  /** Fires immediately when the local UI mutates character data (before server echo). */
  localUpdate$ = this.localUpdateSubject.asObservable();

  notifyLocalUpdate(): void { this.localUpdateSubject.next(); }

  connect() {
    if (this.socket) return;
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      auth: identityAuth(),
      transports: ['websocket'],
    });

    this.socket.on('characterPatched', (data: CharacterPatchEvent) => {
      this.patchSubject.next(data);
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
