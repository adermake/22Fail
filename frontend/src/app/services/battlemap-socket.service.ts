import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';
import { MeasurementLine } from '../model/battlemap.model';

export interface BattleMapPatchEvent {
  battleMapId: string;
  patch: JsonPatch;
}

@Injectable({ providedIn: 'root' })
export class BattleMapSocketService {
  private socket?: Socket;
  private patchSubject = new Subject<JsonPatch>();
  private measurementSubject = new Subject<MeasurementLine[]>();
  private connectionReadySubject = new Subject<void>();
  private isConnected = false;

  patches$ = this.patchSubject.asObservable();
  measurements$ = this.measurementSubject.asObservable();
  connectionReady$ = this.connectionReadySubject.asObservable();

  connect() {
    if (this.socket) {
      if (this.isConnected) {
        this.connectionReadySubject.next();
      }
      return;
    }
    
    console.log('[BATTLEMAP SOCKET] Connecting to:', window.location.origin);
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[BATTLEMAP SOCKET] Connected! Socket ID:', this.socket?.id);
      this.isConnected = true;
      this.connectionReadySubject.next();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[BATTLEMAP SOCKET] Disconnected. Reason:', reason);
      this.isConnected = false;
    });

    this.socket.on('battleMapPatched', (patch: JsonPatch) => {
      console.log('[BATTLEMAP SOCKET] Received patch:', patch.path);
      this.patchSubject.next(patch);
    });

    this.socket.on('measurementUpdate', (measurements: MeasurementLine[]) => {
      this.measurementSubject.next(measurements);
    });
  }

  async joinBattleMap(worldName: string, battleMapId: string): Promise<void> {
    if (!this.isConnected) {
      console.log('[BATTLEMAP SOCKET] Waiting for connection...');
      await new Promise<void>((resolve) => {
        const sub = this.connectionReady$.subscribe(() => {
          sub.unsubscribe();
          resolve();
        });
      });
    }
    console.log('[BATTLEMAP SOCKET] Joining battle map:', battleMapId);
    this.socket?.emit('joinBattleMap', { worldName, battleMapId });
  }

  sendPatch(worldName: string, battleMapId: string, patch: JsonPatch) {
    console.log('[BATTLEMAP SOCKET] Sending patch:', patch.path);
    this.socket?.emit('patchBattleMap', { worldName, battleMapId, patch });
  }

  sendMeasurement(worldName: string, battleMapId: string, measurement: MeasurementLine | null) {
    this.socket?.emit('updateMeasurement', { worldName, battleMapId, measurement });
  }

  leaveBattleMap(battleMapId: string) {
    this.socket?.emit('leaveBattleMap', { battleMapId });
  }
}
