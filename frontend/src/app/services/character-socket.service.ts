import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class CharacterSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();

  patches$ = this.patchSubject.asObservable();

  connect() {
    if (this.socket) return;
    console.log('Connecting to socket!');
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('characterPatched', (patch: JsonPatch) => {
      this.patchSubject.next(patch);
    });
  }

  joinCharacter(characterId: string) {
    console.log('Joining character!');
    this.socket?.emit('joinCharacter', characterId);
  }

  sendPatch(characterId: string, patch: JsonPatch) {
    console.log('Sending patch');
    this.socket?.emit('patchCharacter', { characterId, patch });
  }
}
