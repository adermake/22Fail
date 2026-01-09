import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class CharacterSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();
  private lootOfferSubject = new Subject<any>();
  lootOffer$ = this.lootOfferSubject.asObservable();
  private lootClaimedSubject = new Subject<any>();
  lootClaimed$ = this.lootClaimedSubject.asObservable();

  patches$ = this.patchSubject.asObservable();

  connect() {
    if (this.socket) return;
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('characterPatched', (patch: JsonPatch) => {
      this.patchSubject.next(patch);
    });
    this.socket.on('lootOffer', (payload: any) => {
      this.lootOfferSubject.next(payload);
    });
    this.socket.on('lootClaimed', (payload: any) => {
      this.lootClaimedSubject.next(payload);
    });
  }

  joinCharacter(characterId: string) {
    this.socket?.emit('joinCharacter', characterId);
  }

  sendPatch(characterId: string, patch: JsonPatch) {
    console.log('Sending patch '+JSON.stringify(patch));
    this.socket?.emit('patchCharacter', { characterId, patch });
  }

  sendClaim(worldName: string, index: number, characterId: string) {
    this.socket?.emit('claimLoot', { worldName, index, characterId });
  }
}
