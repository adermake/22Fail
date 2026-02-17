import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';

export interface DiceRollEvent {
  id: string;
  worldName: string;
  characterName: string;
  characterId: string;
  diceType: number;
  diceCount: number;
  bonuses: { name: string; value: number; source: string }[];
  result: number;
  rolls: number[];
  timestamp: Date;
  isSecret: boolean; // If true, only GM sees the result
  // Action macro details (optional)
  actionName?: string;
  actionIcon?: string;
  actionColor?: string;
  resourceChanges?: { resource: string; amount: number }[];
}

@Injectable({ providedIn: 'root' })
export class WorldSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();
  private lootReceivedSubject = new Subject<any>();
  private battleLootReceivedSubject = new Subject<any>();
  private connectionReadySubject = new Subject<void>();
  private diceRollSubject = new Subject<DiceRollEvent>();
  private isConnected = false;

  patches$ = this.patchSubject.asObservable();
  lootReceived$ = this.lootReceivedSubject.asObservable();
  battleLootReceived$ = this.battleLootReceivedSubject.asObservable();
  connectionReady$ = this.connectionReadySubject.asObservable();
  diceRoll$ = this.diceRollSubject.asObservable();

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

    this.socket.on('diceRolled', (roll: DiceRollEvent) => {
      console.log('[WORLD SOCKET] Received diceRolled:', roll);
      this.diceRollSubject.next(roll);
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
    // Don't log full patches - they can be huge with base64 data
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

  sendDiceRoll(roll: DiceRollEvent) {
    console.log('[WORLD SOCKET] Sending dice roll:', roll);
    this.socket?.emit('diceRoll', roll);
  }
}
