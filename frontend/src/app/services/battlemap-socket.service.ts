import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';

export interface BattleMapPatchEvent {
  battleMapId: string;
  patch: JsonPatch;
}

@Injectable({ providedIn: 'root' })
export class BattleMapSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();

  patches$ = this.patchSubject.asObservable();

  connect() {
    if (this.socket) return;
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('battleMapPatched', (patch: JsonPatch) => {
      this.patchSubject.next(patch);
    });
  }

  joinBattleMap(worldName: string, battleMapId: string) {
    this.socket?.emit('joinBattleMap', { worldName, battleMapId });
  }

  sendPatch(worldName: string, battleMapId: string, patch: JsonPatch) {
    console.log('Sending patch '+JSON.stringify(patch));
    this.socket?.emit('patchBattleMap', { worldName, battleMapId, patch });
  }
}
