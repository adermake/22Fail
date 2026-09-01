import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { identityAuth } from './identity';
import { JsonPatch } from '../model/json-patch.model';
import { PartyStashEntry } from '../model/world.model';
import { DeskEntry, DeskTab } from '../model/gm-desk.model';

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
  /** Pre-stability damage total (damage calculator). */
  rawResult?: number;
  /** Target stability used when rolling damage. */
  stabilitaet?: number;
  /** Post-stability damage (shown in history). */
  finalDamage?: number;
}

@Injectable({ providedIn: 'root' })
export class WorldSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();
  private libraryChangedSubject = new Subject<{ libraryId: string }>();
  private connectionReadySubject = new Subject<void>();
  private diceRollSubject = new Subject<DiceRollEvent>();
  private isConnected = false;

  /** Rolling buffer of the last 100 received dice roll events (survives tab open/close) */
  private _rollBuffer: DiceRollEvent[] = [];
  get rollBuffer(): DiceRollEvent[] { return this._rollBuffer; }

  patches$ = this.patchSubject.asObservable();
  /** Eine Bibliothek wurde gespeichert — World und Lobby laden sie daraufhin neu. */
  libraryChanged$ = this.libraryChangedSubject.asObservable();
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
      auth: identityAuth(),
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

    this.socket.on('libraryChanged', (data: { libraryId: string }) => {
      console.log('[WORLD SOCKET] Library changed:', data?.libraryId);
      this.libraryChangedSubject.next(data);
    });

    this.socket.on('diceRolled', (roll: DiceRollEvent) => {
      console.log('[WORLD SOCKET] Received diceRolled:', roll);
      this._rollBuffer = [roll, ...this._rollBuffer.slice(0, 99)];
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

  // ── Shared party stash ──────────────────────────────────────────────────
  // Every change goes through the server and comes back as an ack, so a client only ever acts
  // on what the server actually did.

  /**
   * Wartet, bis die Verbindung steht — begrenzt, damit ein wirklich toter Socket nicht ewig hängt.
   *
   * Der Aufbau läuft asynchron und beginnt oft erst, nachdem eine Ansicht ihre Daten per HTTP
   * geladen hat. Wer direkt danach fragt, traf vorher auf `isConnected === false`.
   */
  private whenConnected(timeoutMs = 8000): Promise<boolean> {
    if (this.isConnected) return Promise.resolve(true);

    // Idempotent: baut die Verbindung auf, falls das noch niemand getan hat.
    this.connect();
    if (this.isConnected) return Promise.resolve(true);

    return new Promise<boolean>(resolve => {
      const sub = this.connectionReady$.subscribe(() => {
        clearTimeout(timer);
        sub.unsubscribe();
        resolve(true);
      });
      const timer = setTimeout(() => {
        sub.unsubscribe();
        resolve(false);
      }, timeoutMs);
    });
  }

  /**
   * Eine Frage an den Server, deren Antwort abgewartet wird.
   *
   * Wartet erst auf die Verbindung. Vorher gab es hier ein `if (!isConnected) return fallback` —
   * und weil der Socket erst am Ende von `WorldStoreService.load()` aufgebaut wird, lieferte ein
   * unmittelbar danach gestelltes `partyStashRead` still den leeren Ersatzwert. Der Beutel sah
   * nach jedem Neuladen leer aus, bis das nächste Broadcast ihn zufällig füllte.
   */
  private async ask<T>(event: string, payload: unknown, fallback: T): Promise<T> {
    if (!(await this.whenConnected())) return fallback;
    if (!this.socket) return fallback;
    try {
      return (await this.socket.timeout(8000).emitWithAck(event, payload)) as T;
    } catch (e) {
      console.error(`[WORLD SOCKET] ${event} failed`, e);
      return fallback;
    }
  }

  depositToPartyStash(worldName: string, entry: PartyStashEntry) {
    return this.ask<{ ok: boolean; stash: PartyStashEntry[]; reason?: string }>(
      'partyStashDeposit', { worldName, entry }, { ok: false, stash: [], reason: 'offline' },
    );
  }

  withdrawFromPartyStash(worldName: string, entryId: string, amount?: number) {
    return this.ask<{ ok: boolean; entry?: PartyStashEntry; stash: PartyStashEntry[]; reason?: string }>(
      'partyStashWithdraw', { worldName, entryId, amount }, { ok: false, stash: [], reason: 'offline' },
    );
  }

  readPartyStash(worldName: string) {
    return this.ask<{ ok: boolean; stash: PartyStashEntry[] }>(
      'partyStashRead', { worldName }, { ok: false, stash: [] },
    );
  }

  // ── GM-Schreibtisch ─────────────────────────────────────────────────────
  // Aufgedeckte Reiter sind ein gemeinsamer Pool: der Server gibt einen Eintrag genau einmal
  // heraus, damit zwei gleichzeitige Zugriffe nicht beide gewinnen.

  claimFromDesk(worldName: string, tabId: string, entryId: string, characterId: string) {
    return this.ask<{ ok: boolean; entry?: DeskEntry; desk: DeskTab[]; reason?: string }>(
      'gmDeskClaim', { worldName, tabId, entryId, characterId },
      { ok: false, desk: [], reason: 'offline' },
    );
  }

  readDesk(worldName: string) {
    return this.ask<{ ok: boolean; desk: DeskTab[] }>('gmDeskRead', { worldName }, { ok: false, desk: [] });
  }

  sendDiceRoll(roll: DiceRollEvent) {
    console.log('[WORLD SOCKET] Sending dice roll:', roll);
    this.socket?.emit('diceRoll', roll);
  }
}
