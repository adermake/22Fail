import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class WorldSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();
  private lootReceivedSubject = new Subject<any>();
  private battleLootReceivedSubject = new Subject<any>();

  patches$ = this.patchSubject.asObservable();
  lootReceived$ = this.lootReceivedSubject.asObservable();
  battleLootReceived$ = this.battleLootReceivedSubject.asObservable();

  connect() {
    if (this.socket) {
      console.log('[WORLD SOCKET] Already connected');
      return;
    }
    console.log('[WORLD SOCKET] Connecting to:', window.location.origin);
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
      maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB - match backend
    });

    this.socket.on('connect', () => {
      console.log('[WORLD SOCKET] Connected! Socket ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WORLD SOCKET] Disconnected. Reason:', reason);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        console.warn('[WORLD SOCKET] Socket disconnected! This may be due to large message size.');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WORLD SOCKET] Connection error:', error);
    });

    this.socket.on('worldPatched', (patch: JsonPatch) => {
      console.log('[WORLD SOCKET] Received worldPatched:', patch);
      this.patchSubject.next(patch);
    });

    this.socket.on('lootReceived', (loot: any) => {
      this.lootReceivedSubject.next(loot);
    });

    this.socket.on('battleLootReceived', (loot: any) => {
      this.battleLootReceivedSubject.next(loot);
    });
  }

  joinWorld(worldName: string) {
    this.socket?.emit('joinWorld', worldName);
  }

  sendPatch(worldName: string, patch: JsonPatch) {
    // Truncate portrait data in logs to keep console readable
    const logPatch = JSON.parse(JSON.stringify(patch));
    if (Array.isArray(logPatch.value)) {
      logPatch.value = logPatch.value.map((item: any) => {
        if (item?.portrait && typeof item.portrait === 'string' && item.portrait.length > 100) {
          return { ...item, portrait: item.portrait.substring(0, 50) + '...[TRUNCATED]' };
        }
        return item;
      });
    }
    console.log('Sending world patch:', JSON.stringify(logPatch));
    this.socket?.emit('patchWorld', { worldName, patch });
  }

  claimBattleLoot(worldName: string, lootId: string) {
    console.log('Claiming battle loot:', lootId);
    this.socket?.emit('claimBattleLoot', { worldName, lootId });
  }

  revealBattleLoot(worldName: string) {
    console.log('Revealing battle loot for:', worldName);
    this.socket?.emit('revealBattleLoot', { worldName });
  }

  sendDirectLoot(characterId: string, loot: any) {
    console.log('Sending direct loot to:', characterId, loot);
    this.socket?.emit('sendDirectLoot', { characterId, loot });
  }
}
