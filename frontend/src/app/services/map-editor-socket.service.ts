import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { identityAuth } from './identity';
import { MapOp } from '../map-editor/map-editor.model';
import { PingBroadcast } from '../shared/ping/ping.model';

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
  private pingSubject = new Subject<PingBroadcast>();
  private measureSubject = new Subject<MeasureLine[]>();

  ops$ = this.opSubject.asObservable();
  connectionReady$ = this.readySubject.asObservable();
  /** Ephemeral play aids. These never enter the document — see `play-aids.ts`. */
  pings$ = this.pingSubject.asObservable();
  measurements$ = this.measureSubject.asObservable();

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
    this.socket.on('mapEditorPing', (ping: PingBroadcast) => this.pingSubject.next(ping));
    this.socket.on('mapEditorMeasure', (lines: MeasureLine[]) =>
      this.measureSubject.next(lines ?? []),
    );
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

  sendPing(ping: PingBroadcast): void {
    if (!this.socket?.connected || !this.worldName) return;
    this.socket.emit('mapEditorPing', { worldName: this.worldName, ping });
  }

  /**
   * Publish or withdraw this client's ruler line.
   *
   * `null` withdraws. The server keys lines by socket, so this replaces rather than appends —
   * dragging the ruler cannot leave a trail of stale lines on everyone else's map.
   */
  sendMeasure(line: { start: Point; end: Point } | null): void {
    if (!this.socket?.connected || !this.worldName) return;
    this.socket.emit('mapEditorMeasure', { worldName: this.worldName, line });
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

interface Point {
  x: number;
  y: number;
}


export interface MeasureLine {
  id: string;
  start: Point;
  end: Point;
  by: string;
}
