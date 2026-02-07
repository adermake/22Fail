/**
 * Lobby Store Service
 * 
 * Centralized state management for the lobby system.
 * Handles all map data, tokens, strokes, images, and walls.
 * Provides optimistic UI updates with server persistence.
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LobbyApiService } from './lobby-api.service';
import { LobbySocketService } from './lobby-socket.service';
import { ImageService } from './image.service';
import { TextureService } from './texture.service';
import {
  LobbyData,
  LobbyMap,
  Token,
  Stroke,
  MapImage,
  LibraryImage,
  LibraryTexture,
  WallHex,
  MeasurementLine,
  HexCoord,
  TextureStroke,
  generateId,
  createEmptyLobby,
  createEmptyMap,
} from '../model/lobby.model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class LobbyStoreService {
  private api = inject(LobbyApiService);
  private socket = inject(LobbySocketService);
  private imageService = inject(ImageService);
  private textureService = inject(TextureService);

  // Core state
  private lobbySubject = new BehaviorSubject<LobbyData | null>(null);
  lobby$ = this.lobbySubject.asObservable();

  // Current world and map
  worldName = '';
  currentMapId = '';

  // Undo history for strokes
  private strokeUndoHistory: Stroke[][] = [];
  private readonly MAX_UNDO = 50;

  // Pending patches to filter echoes
  private pendingPatchPaths = new Set<string>();

  // ============================================
  // Getters
  // ============================================

  get lobby(): LobbyData | null {
    return this.lobbySubject.value;
  }

  get currentMap(): LobbyMap | null {
    const lobby = this.lobby;
    if (!lobby || !this.currentMapId) return null;
    return lobby.maps[this.currentMapId] || null;
  }

  get tokens(): Token[] {
    return this.currentMap?.tokens || [];
  }

  get strokes(): Stroke[] {
    return this.currentMap?.strokes || [];
  }

  get textureStrokes(): TextureStroke[] {
    return this.currentMap?.textureStrokes || [];
  }

  get images(): MapImage[] {
    return this.currentMap?.images || [];
  }

  get walls(): WallHex[] {
    return this.currentMap?.walls || [];
  }

  get imageLibrary(): LibraryImage[] {
    return this.lobby?.imageLibrary || [];
  }

  // ============================================
  // Initialization
  // ============================================

  constructor() {
    // Listen for incoming patches from other clients
    this.socket.patches$.subscribe((patch) => {
      // Skip echoes of our own patches
      if (this.pendingPatchPaths.has(patch.path)) {
        this.pendingPatchPaths.delete(patch.path);
        return;
      }
      this.applyRemotePatch(patch);
    });
  }

  /**
   * Load or create a lobby for a world.
   */
  async loadLobby(worldName: string): Promise<LobbyData> {
    this.worldName = worldName;
    console.log('[LobbyStore] Loading lobby for:', worldName);

    let lobby = await this.api.loadLobby(worldName);

    if (!lobby) {
      console.log('[LobbyStore] Creating new lobby');
      lobby = await this.api.createLobby(worldName);
    }

    // Migrate old data if needed
    lobby = this.migrateLobby(lobby);
    
    this.lobbySubject.next(lobby);

    // Set active map
    const activeMapId = lobby.activeMapId || Object.keys(lobby.maps)[0] || 'default';
    await this.switchMap(activeMapId);

    // Connect socket and wait for connection
    console.log('[LobbyStore] Connecting to socket...');
    this.socket.connect();
    
    // Wait for socket connection to establish
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (this.socket.connected) {
        break;
      }
      attempts++;
      console.log(`[LobbyStore] Waiting for socket connection... attempt ${attempts}/${maxAttempts}`);
    }
    
    if (attempts >= maxAttempts) {
      console.warn('[LobbyStore] Socket connection timeout, continuing without real-time sync');
    } else {
      console.log('[LobbyStore] ✅ Socket connected successfully');
    }
    
    await this.socket.joinLobby(worldName);
    console.log('[LobbyStore] ✅ Socket connection and room join complete');

    return lobby;
  }

  /**
   * Migrate old lobby data to new format.
   */
  private migrateLobby(lobby: LobbyData): LobbyData {
    // Ensure all required fields exist
    if (!lobby.maps) {
      lobby.maps = { default: createEmptyMap('default', 'Main Map') };
    }
    if (!lobby.imageLibrary) {
      lobby.imageLibrary = [];
    }
    if (!lobby.activeMapId) {
      lobby.activeMapId = Object.keys(lobby.maps)[0] || 'default';
    }

    // Migrate each map
    for (const mapId of Object.keys(lobby.maps)) {
      const map = lobby.maps[mapId];
      if (!map.tokens) map.tokens = [];
      if (!map.strokes) map.strokes = [];
      if (!map.walls) map.walls = [];
      if (!map.images) map.images = [];
      if (!map.measurementLines) map.measurementLines = [];
      
      // Filter out broken images with undefined imageId
      map.images = map.images.filter(img => img.imageId);
      
      // Filter out broken library images
      lobby.imageLibrary = lobby.imageLibrary.filter(img => img.imageId);
    }

    return lobby;
  }

  // ============================================
  // Map Operations
  // ============================================

  /**
   * Switch to a different map within the lobby.
   */
  async switchMap(mapId: string): Promise<void> {
    const lobby = this.lobby;
    if (!lobby) return;

    if (!lobby.maps[mapId]) {
      console.error('[LobbyStore] Map not found:', mapId);
      return;
    }

    this.currentMapId = mapId;
    
    // Update lobby's active map
    lobby.activeMapId = mapId;
    lobby.updatedAt = Date.now();
    this.lobbySubject.next({ ...lobby });

    // Join the map's socket room
    await this.socket.joinMap(this.worldName, mapId);
  }

  /**
   * Create a new map within the lobby.
   */
  async createMap(name: string, mapId?: string): Promise<string> {
    const lobby = this.lobby;
    if (!lobby) throw new Error('No lobby loaded');

    const id = mapId || generateId();
    const newMap = createEmptyMap(id, name);
    lobby.maps[newMap.id] = newMap;
    lobby.updatedAt = Date.now();
    
    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);

    return newMap.id;
  }

  /**
   * Delete a map from the lobby.
   */
  async deleteMap(mapId: string): Promise<void> {
    const lobby = this.lobby;
    if (!lobby) return;

    const mapCount = Object.keys(lobby.maps).length;
    if (mapCount <= 1) {
      console.warn('[LobbyStore] Cannot delete the only map');
      return;
    }

    delete lobby.maps[mapId];

    // Switch to another map if we deleted the active one
    if (lobby.activeMapId === mapId) {
      const newActiveId = Object.keys(lobby.maps)[0];
      await this.switchMap(newActiveId);
    }

    lobby.updatedAt = Date.now();
    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);
  }

  /**
   * Rename a map.
   */
  async renameMap(mapId: string, name: string): Promise<void> {
    const lobby = this.lobby;
    if (!lobby || !lobby.maps[mapId]) return;

    lobby.maps[mapId].name = name;
    lobby.maps[mapId].updatedAt = Date.now();
    lobby.updatedAt = Date.now();

    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);
  }

  /**
   * Update map background color.
   */
  async updateMapBackground(mapId: string, color: string): Promise<void> {
    const lobby = this.lobby;
    if (!lobby || !lobby.maps[mapId]) return;

    lobby.maps[mapId].backgroundColor = color;
    lobby.maps[mapId].updatedAt = Date.now();
    lobby.updatedAt = Date.now();

    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);
  }

  /**
   * Alias for switchMap for consistency.
   */
  async setActiveMap(mapId: string): Promise<void> {
    await this.switchMap(mapId);
  }

  // ============================================
  // Token Operations
  // ============================================

  /**
   * Add a token to the current map.
   */
  addToken(token: Omit<Token, 'id'>): void {
    const newToken: Token = {
      ...token,
      id: generateId(),
    };

    const tokens = [...this.tokens, newToken];
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  /**
   * Move a token to a new hex position.
   */
  moveToken(tokenId: string, position: HexCoord): void {
    const tokens = [...this.tokens];
    const index = tokens.findIndex(t => t.id === tokenId);
    if (index === -1) return;

    tokens[index] = { ...tokens[index], position };
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  /**
   * Update a token's properties.
   */
  updateToken(tokenId: string, updates: Partial<Omit<Token, 'id'>>): void {
    const tokens = [...this.tokens];
    const index = tokens.findIndex(t => t.id === tokenId);
    if (index === -1) return;

    tokens[index] = { ...tokens[index], ...updates };
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  /**
   * Remove a token from the map.
   */
  removeToken(tokenId: string): void {
    const tokens = this.tokens.filter(t => t.id !== tokenId);
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  // ============================================
  // Stroke Operations (Drawing)
  // ============================================

  /**
   * Add a drawing stroke.
   */
  addStroke(stroke: Omit<Stroke, 'id'>): void {
    // Save undo state
    this.strokeUndoHistory.push([...this.strokes]);
    if (this.strokeUndoHistory.length > this.MAX_UNDO) {
      this.strokeUndoHistory.shift();
    }

    const newStroke: Stroke = {
      ...stroke,
      id: generateId(),
    };

    const strokes = [...this.strokes, newStroke];
    this.applyPatch({ path: 'strokes', value: strokes });
  }

  /**
   * Add a texture stroke.
   */
  addTextureStroke(textureStroke: Omit<TextureStroke, 'id'>): void {
    const newTextureStroke: TextureStroke = {
      ...textureStroke,
      id: generateId(),
    };

    const textureStrokes = [...this.textureStrokes, newTextureStroke];
    this.applyPatch({ path: 'textureStrokes', value: textureStrokes });
  }

  /**
   * Remove a specific stroke by ID (for eraser).
   */
  removeStroke(strokeId: string): void {
    const strokes = this.strokes.filter(s => s.id !== strokeId);
    this.applyPatch({ path: 'strokes', value: strokes });
  }

  /**
   * Undo the last stroke.
   */
  undoStroke(): boolean {
    if (this.strokeUndoHistory.length === 0) return false;

    const previousStrokes = this.strokeUndoHistory.pop()!;
    this.applyPatch({ path: 'strokes', value: previousStrokes });
    return true;
  }

  /**
   * Delete an image from the current map.
   */
  deleteImage(imageId: string): void {
    const images = this.images.filter(img => img.id !== imageId);
    this.applyPatch({ path: 'images', value: images });
  }

  /**
   * Clear all strokes.
   */
  clearStrokes(): void {
    if (this.strokes.length === 0) return;
    
    this.strokeUndoHistory.push([...this.strokes]);
    if (this.strokeUndoHistory.length > this.MAX_UNDO) {
      this.strokeUndoHistory.shift();
    }

    this.applyPatch({ path: 'strokes', value: [] });
  }

  // ============================================
  // Image Operations (Map Background)
  // ============================================

  /**
   * Add an image to the map.
   * @param imageId - The image ID from ImageService (not base64!)
   * @returns The generated MapImage ID
   */
  addImage(imageId: string, x: number, y: number, width: number, height: number): string {
    const newImage: MapImage = {
      id: generateId(),
      imageId,
      x,
      y,
      width,
      height,
      rotation: 0,
      zIndex: Math.max(0, ...this.images.map(i => i.zIndex)) + 1,
    };

    const images = [...this.images, newImage];
    this.applyPatch({ path: 'images', value: images });
    return newImage.id;
  }

  /**
   * Update an image's transform properties.
   */
  updateImage(id: string, updates: Partial<Omit<MapImage, 'id' | 'imageId'>>): void {
    const images = [...this.images];
    const index = images.findIndex(i => i.id === id);
    if (index === -1) return;

    images[index] = { ...images[index], ...updates };
    this.applyPatch({ path: 'images', value: images });
  }

  /**
   * Remove an image from the map.
   */
  removeImage(id: string): void {
    const images = this.images.filter(i => i.id !== id);
    this.applyPatch({ path: 'images', value: images });
  }

  // Z-index management
  moveImageForward(id: string): void {
    const images = [...this.images];
    const current = images.find(i => i.id === id);
    if (!current) return;

    const higherImages = images.filter(i => i.zIndex > current.zIndex);
    if (higherImages.length === 0) return;

    const nextZ = Math.min(...higherImages.map(i => i.zIndex));
    current.zIndex = nextZ + 0.5;

    this.normalizeZIndices(images);
    this.applyPatch({ path: 'images', value: images });
  }

  moveImageBackward(id: string): void {
    const images = [...this.images];
    const current = images.find(i => i.id === id);
    if (!current) return;

    const lowerImages = images.filter(i => i.zIndex < current.zIndex);
    if (lowerImages.length === 0) return;

    const prevZ = Math.max(...lowerImages.map(i => i.zIndex));
    current.zIndex = prevZ - 0.5;

    this.normalizeZIndices(images);
    this.applyPatch({ path: 'images', value: images });
  }

  moveImageToFront(id: string): void {
    const images = [...this.images];
    const index = images.findIndex(i => i.id === id);
    if (index === -1) return;

    const maxZ = Math.max(0, ...images.map(i => i.zIndex));
    images[index] = { ...images[index], zIndex: maxZ + 1 };
    this.applyPatch({ path: 'images', value: images });
  }

  moveImageToBack(id: string): void {
    const images = [...this.images];
    const index = images.findIndex(i => i.id === id);
    if (index === -1) return;

    const minZ = Math.min(0, ...images.map(i => i.zIndex));
    images[index] = { ...images[index], zIndex: minZ - 1 };
    this.applyPatch({ path: 'images', value: images });
  }

  private normalizeZIndices(images: MapImage[]): void {
    const sorted = [...images].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((img, idx) => {
      const original = images.find(i => i.id === img.id);
      if (original) original.zIndex = idx;
    });
  }

  // ============================================
  // Image Library Operations
  // ============================================

  /**
   * Add an image to the reusable library.
   * Uploads the image to the server first.
   */
  async addLibraryImage(base64Data: string, name: string): Promise<LibraryImage> {
    // Upload to server
    const imageId = await this.imageService.uploadImage(base64Data);
    
    const newImage: LibraryImage = {
      id: generateId(),
      name,
      imageId,
      width: 200,
      height: 200,
      createdAt: Date.now(),
    };

    const lobby = this.lobby;
    if (!lobby) throw new Error('No lobby loaded');

    lobby.imageLibrary = [...lobby.imageLibrary, newImage];
    lobby.updatedAt = Date.now();

    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);

    return newImage;
  }

  /**
   * Update a library image's name.
   */
  async updateLibraryImage(id: string, name: string): Promise<void> {
    const lobby = this.lobby;
    if (!lobby) return;

    const index = lobby.imageLibrary.findIndex(i => i.id === id);
    if (index === -1) return;

    lobby.imageLibrary = [...lobby.imageLibrary];
    lobby.imageLibrary[index] = { ...lobby.imageLibrary[index], name };
    lobby.updatedAt = Date.now();

    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);
  }

  /**
   * Remove an image from the library.
   */
  async removeLibraryImage(id: string): Promise<void> {
    const lobby = this.lobby;
    if (!lobby) return;

    lobby.imageLibrary = lobby.imageLibrary.filter(i => i.id !== id);
    lobby.updatedAt = Date.now();

    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);
  }

  /**
   * Add a texture to the reusable library.
   * Uploads the texture to the server first.
   */
  async addLibraryTexture(base64Data: string, name: string, tileSize: number = 100): Promise<LibraryTexture> {
    // Upload to server
    const textureId = await this.textureService.uploadTexture(base64Data);
    
    const newTexture: LibraryTexture = {
      id: generateId(),
      name,
      textureId,
      tileSize,
      createdAt: Date.now(),
    };

    const lobby = this.lobby;
    if (!lobby) throw new Error('No lobby loaded');

    lobby.textureLibrary = [...lobby.textureLibrary, newTexture];
    lobby.updatedAt = Date.now();

    this.lobbySubject.next({ ...lobby });
    await this.api.saveLobby(this.worldName, lobby);

    return newTexture;
  }

  // ============================================
  // Wall Operations
  // ============================================

  /**
   * Add a wall at a hex position.
   */
  addWall(hex: HexCoord): void {
    const exists = this.walls.some(w => w.q === hex.q && w.r === hex.r);
    if (exists) return;

    const walls = [...this.walls, { q: hex.q, r: hex.r }];
    this.applyPatch({ path: 'walls', value: walls });
  }

  /**
   * Remove a wall from a hex position.
   */
  removeWall(hex: HexCoord): void {
    const walls = this.walls.filter(w => !(w.q === hex.q && w.r === hex.r));
    this.applyPatch({ path: 'walls', value: walls });
  }

  /**
   * Toggle a wall at a hex position.
   */
  toggleWall(hex: HexCoord): void {
    const exists = this.walls.some(w => w.q === hex.q && w.r === hex.r);
    if (exists) {
      this.removeWall(hex);
    } else {
      this.addWall(hex);
    }
  }

  /**
   * Clear all walls.
   */
  clearWalls(): void {
    this.applyPatch({ path: 'walls', value: [] });
  }

  /**
   * Apply a batch of wall changes at once (add/remove multiple walls in one save).
   * This prevents flickering and server overload from per-hex saves.
   */
  applyWallBatch(changes: { hex: HexCoord; action: 'add' | 'remove' }[]): void {
    let walls = [...this.walls];
    
    for (const change of changes) {
      if (change.action === 'add') {
        const exists = walls.some(w => w.q === change.hex.q && w.r === change.hex.r);
        if (!exists) {
          walls.push({ q: change.hex.q, r: change.hex.r });
        }
      } else {
        walls = walls.filter(w => !(w.q === change.hex.q && w.r === change.hex.r));
      }
    }
    
    this.applyPatch({ path: 'walls', value: walls });
  }

  /**
   * Clean up orphaned images on the server and refresh the lobby.
   */
  async cleanupOrphanedImages(): Promise<void> {
    try {
      console.log('[LobbyStore] Starting image cleanup...');
      const response = await fetch('http://localhost:3000/api/images/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('[LobbyStore] Cleanup result:', result);
        
        // Refresh the lobby after cleanup
        if (this.worldName) {
          await this.loadLobby(this.worldName);
        }
      } else {
        console.error('[LobbyStore] Cleanup failed:', response.statusText);
      }
    } catch (error) {
      console.error('[LobbyStore] Error during cleanup:', error);
    }
  }

  // ============================================
  // Patch System
  // ============================================

  /**
   * Apply a patch locally and send to server.
   */
  private applyPatch(patch: JsonPatch): void {
    const map = this.currentMap;
    if (!map) return;

    // Track pending to filter echo
    this.pendingPatchPaths.add(patch.path);

    // Apply locally
    this.applyJsonPatch(map, patch);
    map.updatedAt = Date.now();

    // Update lobby
    const lobby = this.lobby;
    if (lobby) {
      lobby.maps[this.currentMapId] = { ...map };
      lobby.updatedAt = Date.now();
      this.lobbySubject.next({ ...lobby });

      // Save to server
      this.api.saveLobby(this.worldName, lobby).catch(err => {
        console.error('[LobbyStore] Failed to save:', err);
      });
    }

    // Broadcast to other clients
    this.socket.sendPatch(this.worldName, this.currentMapId, patch);
  }

  /**
   * Apply a patch received from another client.
   */
  private applyRemotePatch(patch: JsonPatch): void {
    const map = this.currentMap;
    if (!map) return;

    this.applyJsonPatch(map, patch);
    map.updatedAt = Date.now();

    const lobby = this.lobby;
    if (lobby) {
      lobby.maps[this.currentMapId] = { ...map };
      this.lobbySubject.next({ ...lobby });
    }
  }

  /**
   * Apply a JSON patch to a target object.
   */
  private applyJsonPatch(target: any, patch: JsonPatch): void {
    const keys = patch.path.split('.');
    
    if (keys.length === 1) {
      target[keys[0]] = patch.value;
      return;
    }

    let current = target;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const index = parseInt(key, 10);

      if (!isNaN(index) && Array.isArray(current)) {
        current = current[index];
      } else {
        current = current[key] ??= {};
      }
    }

    const finalKey = keys[keys.length - 1];
    const finalIndex = parseInt(finalKey, 10);

    if (!isNaN(finalIndex) && Array.isArray(current)) {
      current[finalIndex] = patch.value;
    } else {
      current[finalKey] = patch.value;
    }
  }
}
