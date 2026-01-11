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
  private connectionReadySubject = new Subject<void>();
  private isConnected = false;

  patches$ = this.patchSubject.asObservable();
  lootReceived$ = this.lootReceivedSubject.asObservable();
  battleLootReceived$ = this.battleLootReceivedSubject.asObservable();
  connectionReady$ = this.connectionReadySubject.asObservable();

  connect() {
    if (this.socket) {
      console.log('[WORLD SOCKET] Already connected');
      if (this.isConnected) {
        // Emit immediately if already connected
        this.connectionReadySubject.next();
      }
      return;
    }
    console.log('[WORLD SOCKET] Connecting to:', window.location.origin);
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[WORLD SOCKET] Connected! Socket ID:', this.socket?.id);
      this.isConnected = true;
      this.connectionReadySubject.next();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WORLD SOCKET] Disconnected. Reason:', reason);
      this.isConnected = false;
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

  async joinWorld(worldName: string): Promise<void> {
    // If not connected yet, wait for connection
    if (!this.isConnected) {
      console.log('[WORLD SOCKET] Waiting for connection before joining world:', worldName);
      await new Promise<void>((resolve) => {
        const sub = this.connectionReady$.subscribe(() => {
          sub.unsubscribe();
          resolve();
        });
      });
    }
    console.log('[WORLD SOCKET] Joining world:', worldName);
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
