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
    if (this.socket?.connected && this.isConnected) {
      console.log('[LobbySocket] Already connected, skipping');
      return;
    }

    // Clean up any existing socket first
    if (this.socket) {
      console.log('[LobbySocket] Cleaning up existing socket');
      this.socket.disconnect();
      this.socket = undefined;
    }

    console.log('[LobbySocket] Creating new socket connection...');
    
    try {
      this.socket = io(window.location.origin, {
        path: '/socket.io',
        transports: ['polling', 'websocket'], // Polling first for reliability
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true, // Force new connection
      });

      console.log('[LobbySocket] Socket instance created:', !!this.socket);
    } catch (error) {
      console.error('[LobbySocket] Error creating socket:', error);
      this.socket = undefined;
      this.isConnected = false;
      return;
    }

    this.socket.on('connect', () => {
      console.log('[LobbySocket] ✅ Connected successfully:', this.socket?.id);
      this.isConnected = true;
      this.connectionReadySubject.next();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[LobbySocket] ❌ Disconnected:', reason);
      this.isConnected = false;
      
      // If server disconnected us, reconnect after delay
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('[LobbySocket] Scheduling reconnection...');
        setTimeout(() => {
          if (!this.socket?.connected) {
            console.log('[LobbySocket] Attempting reconnection...');
            this.connect();
          }
        }, 2000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[LobbySocket] ❌ Connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', () => {
      console.log('[LobbySocket] ✅ Reconnected successfully');
      this.isConnected = true;
      this.connectionReadySubject.next();
    });

    // Periodically sync our flag with the actual socket state
    setInterval(() => {
      if (this.socket && this.socket.connected !== this.isConnected) {
        console.log('[LobbySocket] 🔄 Syncing connection state - socket.connected:', this.socket.connected, 'isConnected:', this.isConnected);
        this.isConnected = this.socket.connected;
        if (this.isConnected) {
          this.connectionReadySubject.next();
        }
      }
    }, 1000);

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
   * Check if socket is connected
   */
  get connected(): boolean {
    return !!(this.socket?.connected && this.isConnected);
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
    // Check if socket exists
    if (!this.socket) {
      console.warn('[LobbySocket] ❌ No socket instance, patch not sent:', patch.path);
      console.log('[LobbySocket] Attempting to reconnect...');
      this.connect();
      return;
    }

    // Check if socket is connected
    if (!this.socket.connected) {
      console.warn('[LobbySocket] ❌ Socket not connected, patch not sent:', patch.path);
      console.log('[LobbySocket] Socket state - connected:', this.socket.connected, 'id:', this.socket.id);
      console.log('[LobbySocket] Attempting to reconnect...');
      this.connect();
      return;
    }

    // Check our internal state flag
    if (!this.isConnected) {
      console.warn('[LobbySocket] ❌ Internal state shows not connected, syncing with socket state');
      this.isConnected = this.socket.connected;
      if (!this.isConnected) {
        console.log('[LobbySocket] Still not connected, patch not sent:', patch.path);
        return;
      }
    }

    console.log('[LobbySocket] ✅ Sending patch:', patch.path);
    try {
      this.socket.emit('patchBattleMap', { worldName, battleMapId: mapId, patch });
    } catch (error) {
      console.error('[LobbySocket] Error sending patch:', error);
      // Reset connection on error
      this.isConnected = false;
    }
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
