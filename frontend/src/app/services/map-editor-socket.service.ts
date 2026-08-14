import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { identityAuth } from './identity';
import { MapOp } from '../map-editor/map-editor.model';

/**
 * Realtime channel for the map editor (format v2).
 *
 * Ops are small by construction — a terrain edit sends chunk coordinates and a version,
 * never pixels — so this stays responsive while the map grows. The pixels themselves are
 * fetched over HTTP by `MapEditorApiService`.
 */
@Injectable({ providedIn: 'root' })
export class MapEditorSocketService {
  private socket?: Socket;
  private worldName = '';

  private opSubject = new Subject<MapOp>();
  private readySubject = new Subject<void>();

  ops$ = this.opSubject.asObservable();
  connectionReady$ = this.readySubject.asObservable();

  connect(worldName: string): void {
    this.worldName = worldName;

    if (this.socket?.connected) {
      this.socket.emit('joinMapEditor', { worldName });
      return;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }

    this.socket = io(window.location.origin, {
      path: '/socket.io',
      // The server reads GM status from this to decide which room the client joins.
      auth: identityAuth(),
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.socket?.emit('joinMapEditor', { worldName: this.worldName });
      this.readySubject.next();
    });

    this.socket.on('mapEditorOp', (op: MapOp) => this.opSubject.next(op));
  }

  disconnect(): void {
    if (this.socket?.connected && this.worldName) {
      this.socket.emit('leaveMapEditor', { worldName: this.worldName });
    }
    this.socket?.disconnect();
    this.socket = undefined;
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

  sendOp(op: MapOp): void {
    if (!this.socket?.connected || !this.worldName) return;
    this.socket.emit('mapEditorOp', { worldName: this.worldName, op });
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}
