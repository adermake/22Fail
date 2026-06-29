import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';
import { Point } from '../model/lobby.model';

export interface WorldMapMeasurement {
  id: string;
  start: Point;
  end: Point;
  createdBy: string;
}

@Injectable({ providedIn: 'root' })
export class WorldMapSocketService {
  private socket?: Socket;
  private isConnected = false;
  private worldName = '';

  private patchSubject = new Subject<JsonPatch>();
  private measurementSubject = new Subject<WorldMapMeasurement[]>();
  private connectionReadySubject = new Subject<void>();

  patches$ = this.patchSubject.asObservable();
  measurements$ = this.measurementSubject.asObservable();
  connectionReady$ = this.connectionReadySubject.asObservable();

  connect(worldName: string): void {
    this.worldName = worldName;
    if (this.socket?.connected) return;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }

    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.socket?.emit('joinWorldMap', { worldName });
      this.connectionReadySubject.next();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('worldMapPatched', (patch: JsonPatch) => {
      this.patchSubject.next(patch);
    });

    this.socket.on('worldMapMeasurementUpdate', (measurements: WorldMapMeasurement[]) => {
      this.measurementSubject.next(measurements);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
    this.isConnected = false;
    this.worldName = '';
  }

  async ensureConnected(): Promise<void> {
    if (this.socket?.connected) return;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket timeout')), 10000);
      const sub = this.connectionReady$.subscribe(() => {
        clearTimeout(timeout);
        sub.unsubscribe();
        resolve();
      });
    });
  }

  sendPatch(patch: JsonPatch): void {
    if (!this.socket?.connected || !this.worldName) return;
    this.socket.emit('patchWorldMap', { worldName: this.worldName, patch });
  }

  sendMeasurement(measurement: WorldMapMeasurement | null): void {
    if (!this.socket?.connected || !this.worldName) return;
    this.socket.emit('updateWorldMapMeasurement', { worldName: this.worldName, measurement });
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}
