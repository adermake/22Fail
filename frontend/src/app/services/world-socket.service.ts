import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class WorldSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();

  patches$ = this.patchSubject.asObservable();


  connect() {
    if (this.socket) return;
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('worldPatched', (patch: JsonPatch) => {
      this.patchSubject.next(patch);
    });
  }

  joinWorld(worldName: string) {
    this.socket?.emit('joinWorld', worldName);
  }

  sendPatch(worldName: string, patch: JsonPatch) {
    this.socket?.emit('patchWorld', { worldName, patch });
  }

  isConnected(): boolean {
    return !!(this.socket && this.socket.connected);
  }
}
