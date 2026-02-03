/**
 * Lobby Socket Service
 * 
 * WebSocket communication for real-time lobby sync.
 * Handles patch broadcasting and room management.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { JsonPatch } from '../model/json-patch.model';
import { MeasurementLine } from '../model/lobby.model';

@Injectable({ providedIn: 'root' })
export class LobbySocketService {
  private socket?: Socket;
  private isConnected = false;
  
  // Subjects for observables
  private patchSubject = new Subject<JsonPatch>();
  private measurementSubject = new Subject<MeasurementLine[]>();
  private connectionReadySubject = new Subject<void>();

  // Public observables
  patches$ = this.patchSubject.asObservable();
  measurements$ = this.measurementSubject.asObservable();
  connectionReady$ = this.connectionReadySubject.asObservable();

  /**
   * Connect to the WebSocket server.
   */
  connect(): void {
    if (this.socket && this.isConnected) {
      return;
    }

    console.log('[LobbySocket] Connecting...');
    
    this.socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Add polling fallback
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[LobbySocket] Connected:', this.socket?.id);
      this.isConnected = true;
      this.connectionReadySubject.next();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[LobbySocket] Disconnected:', reason);
      this.isConnected = false;
      // Auto-reconnect after short delay
      if (reason === 'io server disconnect') {
        setTimeout(() => this.connect(), 2000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[LobbySocket] Connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', () => {
      console.log('[LobbySocket] Reconnected successfully');
    });

    // Listen for lobby patches
    this.socket.on('lobbyPatched', (patch: JsonPatch) => {
      console.log('[LobbySocket] Received lobby patch:', patch.path);
      this.patchSubject.next(patch);
    });

    // Legacy event for backward compatibility (MAIN EVENT FOR NOW)
    this.socket.on('battleMapPatched', (patch: JsonPatch) => {
      console.log('[LobbySocket] Received battleMap patch (using as lobby):', patch.path);
      this.patchSubject.next(patch);
    });

    // Measurement updates
    this.socket.on('measurementUpdate', (measurements: MeasurementLine[]) => {
      this.measurementSubject.next(measurements);
    });
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
      this.isConnected = false;
    }
  }

  /**
   * Wait for connection to be ready.
   */
  private async ensureConnected(): Promise<void> {
    if (this.isConnected) return;
    
    return new Promise((resolve) => {
      const sub = this.connectionReady$.subscribe(() => {
        sub.unsubscribe();
        resolve();
      });
    });
  }

  /**
   * Join a lobby room for real-time updates.
   */
  async joinLobby(worldName: string): Promise<void> {
    await this.ensureConnected();
    console.log('[LobbySocket] Joining lobby:', worldName);
    this.socket?.emit('joinLobby', { worldName });
  }

  /**
   * Join a specific map room within a lobby.
   */
  async joinMap(worldName: string, mapId: string): Promise<void> {
    await this.ensureConnected();
    console.log('[LobbySocket] Joining map:', mapId);
    this.socket?.emit('joinMap', { worldName, mapId });
  }

  /**
   * Send a patch to be broadcast to other clients.
   */
  sendPatch(worldName: string, mapId: string, patch: JsonPatch): void {
    if (!this.isConnected) {
      console.warn('[LobbySocket] Not connected, patch not sent:', patch.path);
      return;
    }
    console.log('[LobbySocket] Sending patch:', patch.path);
    // Use battlemap gateway since there's no lobby gateway
    this.socket?.emit('patchBattleMap', { worldName, battleMapId: mapId, patch });
  }

  /**
   * Send a measurement update.
   */
  sendMeasurement(worldName: string, mapId: string, measurement: MeasurementLine | null): void {
    this.socket?.emit('updateMeasurement', { worldName, battleMapId: mapId, measurement });
  }

  /**
   * Leave a lobby room.
   */
  leaveLobby(worldName: string): void {
    this.socket?.emit('leaveLobby', { worldName });
  }
}
