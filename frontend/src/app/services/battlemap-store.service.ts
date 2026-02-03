import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattleMapApiService } from './battlemap-api.service';
import { BattleMapSocketService } from './battlemap-socket.service';
import { BattlemapData, BattlemapToken, BattlemapStroke, HexCoord, WallHex, LobbyData, MapData, MapImage, createEmptyBattlemap, createEmptyLobby, createEmptyMap, generateId } from '../model/battlemap.model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class BattleMapStoreService {
  private battleMapSubject = new BehaviorSubject<BattlemapData | null>(null);
  private lobbySubject = new BehaviorSubject<LobbyData | null>(null);
  
  battleMap$ = this.battleMapSubject.asObservable();
  lobby$ = this.lobbySubject.asObservable();

  worldName!: string;
  currentMapId!: string;
  private pendingPatchPaths = new Set<string>();
  
  // Undo history for strokes
  private strokeUndoHistory: BattlemapStroke[][] = [];
  private maxUndoHistory = 50;

  private api = inject(BattleMapApiService);
  private socket = inject(BattleMapSocketService);

  get battleMapValue(): BattlemapData | null {
    return this.battleMapSubject.value;
  }

  get lobbyValue(): LobbyData | null {
    return this.lobbySubject.value;
  }

  constructor() {
    this.socket.patches$.subscribe((patch) => {
      const battleMap = this.battleMapSubject.value;
      if (!battleMap) return;

      // Skip echoes of our own patches
      if (this.pendingPatchPaths.has(patch.path)) {
        this.pendingPatchPaths.delete(patch.path);
        return;
      }

      this.applyJsonPatch(battleMap, patch);
      this.battleMapSubject.next({ ...battleMap });
    });
  }

  // Lobby loading
  async loadLobby(worldName: string) {
    this.worldName = worldName;
    
    console.log('[LOBBY STORE] Loading lobby for world:', worldName);
    let lobby = await this.api.loadLobby(worldName);

    if (!lobby) {
      console.log('[LOBBY STORE] Creating new lobby');
      lobby = createEmptyLobby(worldName);
      this.lobbySubject.next(lobby);
      await this.api.createLobby(worldName);
    } else {
      console.log('[LOBBY STORE] Loaded existing lobby');
      this.lobbySubject.next(lobby);
    }

    // Load the active map or the first map
    const activeMapId = lobby.activeMapId || Object.keys(lobby.maps)[0];
    if (activeMapId) {
      await this.switchMap(activeMapId);
    }

    this.socket.connect();
    await this.socket.joinLobby(worldName);
  }

  // Legacy load method for backward compatibility
  async load(worldName: string, battleMapId: string) {
    this.worldName = worldName;
    this.currentMapId = battleMapId;
    
    console.log('[BATTLEMAP STORE] Loading battle map:', battleMapId, 'from world:', worldName);
    let battleMap = await this.api.loadBattleMap(worldName, battleMapId);

    if (!battleMap) {
      console.log('[BATTLEMAP STORE] Creating empty battle map');
      battleMap = createEmptyBattlemap(battleMapId, battleMapId, worldName);
      this.battleMapSubject.next(battleMap);
      await this.api.createBattleMap(worldName, battleMap);
    } else {
      console.log('[BATTLEMAP STORE] Loaded existing battle map');
      // Migrate old format if needed
      battleMap = this.migrateBattleMap(battleMap);
      this.battleMapSubject.next(battleMap);
    }

    this.socket.connect();
    await this.socket.joinBattleMap(worldName, battleMapId);
  }

  private migrateBattleMap(battleMap: any): BattlemapData {
    // Ensure all required fields exist
    if (!battleMap.strokes) {
      battleMap.strokes = battleMap.drawings || [];
    }
    if (!battleMap.tokens) {
      battleMap.tokens = [];
    }
    if (!battleMap.measurementLines) {
      battleMap.measurementLines = [];
    }
    if (!battleMap.walls) {
      battleMap.walls = [];
    }
    if (!battleMap.images) {
      battleMap.images = [];
    }
    return battleMap as BattlemapData;
  }

  // Map operations
  async switchMap(mapId: string) {
    const lobby = this.lobbyValue;
    if (!lobby || !lobby.maps[mapId]) {
      console.error('[BATTLEMAP STORE] Map not found:', mapId);
      return;
    }

    this.currentMapId = mapId;
    
    // Update lobby's active map
    lobby.activeMapId = mapId;
    lobby.updatedAt = Date.now();
    this.lobbySubject.next({ ...lobby });

    // Load the map data
    const mapData = lobby.maps[mapId];
    
    // Create a BattlemapData from MapData for backward compatibility
    const battleMap: BattlemapData = {
      ...mapData,
      worldName: this.worldName,
    };

    this.battleMapSubject.next(battleMap);

    // Join the socket room for this map
    await this.socket.joinMap(this.worldName, mapId);
  }

  async createMap(name: string) {
    const lobby = this.lobbyValue;
    if (!lobby) return;

    const newMap = createEmptyMap(generateId(), name);
    lobby.maps[newMap.id] = newMap;
    lobby.updatedAt = Date.now();
    this.lobbySubject.next({ ...lobby });

    // Save lobby to backend
    await this.api.saveLobby(this.worldName, lobby);
  }

  async deleteMap(mapId: string) {
    const lobby = this.lobbyValue;
    if (!lobby || !lobby.maps[mapId]) return;

    // Don't delete the last map
    if (Object.keys(lobby.maps).length <= 1) {
      console.warn('[BATTLEMAP STORE] Cannot delete the last map');
      return;
    }

    delete lobby.maps[mapId];
    
    // If we deleted the active map, switch to another
    if (lobby.activeMapId === mapId) {
      const newActiveMapId = Object.keys(lobby.maps)[0];
      await this.switchMap(newActiveMapId);
    }

    lobby.updatedAt = Date.now();
    this.lobbySubject.next({ ...lobby });

    // Save lobby to backend
    await this.api.saveLobby(this.worldName, lobby);
  }

  applyPatch(patch: JsonPatch) {
    const battleMap = this.battleMapSubject.value;
    if (battleMap) {
      this.pendingPatchPaths.add(patch.path);
      this.applyJsonPatch(battleMap, patch);
      battleMap.updatedAt = Date.now();
      this.battleMapSubject.next({ ...battleMap });
      
      // Also update the lobby's map data
      this.updateLobbyMap(battleMap);
    }
    this.socket.sendPatch(this.worldName, this.currentMapId, patch);
  }

  private updateLobbyMap(battleMap: BattlemapData) {
    const lobby = this.lobbyValue;
    if (!lobby || !lobby.maps[this.currentMapId]) return;

    // Update the map data in the lobby
    lobby.maps[this.currentMapId] = {
      id: battleMap.id,
      name: battleMap.name,
      tokens: battleMap.tokens,
      strokes: battleMap.strokes,
      walls: battleMap.walls,
      measurementLines: battleMap.measurementLines,
      images: battleMap.images,
      createdAt: battleMap.createdAt,
      updatedAt: battleMap.updatedAt,
    };
    
    lobby.updatedAt = Date.now();
    this.lobbySubject.next({ ...lobby });
  }

  // Image operations
  addImage(image: Omit<MapImage, 'id'>) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const newImage: MapImage = {
      ...image,
      id: generateId(),
    };

    const images = [...(battleMap.images || []), newImage];
    this.applyPatch({ path: 'images', value: images });
  }

  updateImage(imageId: string, updates: Partial<Omit<MapImage, 'id'>>) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const imageIndex = (battleMap.images || []).findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    const images = [...(battleMap.images || [])];
    images[imageIndex] = { ...images[imageIndex], ...updates };
    this.applyPatch({ path: 'images', value: images });
  }

  removeImage(imageId: string) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const images = (battleMap.images || []).filter(img => img.id !== imageId);
    this.applyPatch({ path: 'images', value: images });
  }

  // Token operations
  addToken(token: Omit<BattlemapToken, 'id'>) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const newToken: BattlemapToken = {
      ...token,
      id: generateId(),
    };

    const tokens = [...battleMap.tokens, newToken];
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  moveToken(tokenId: string, newPosition: HexCoord) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const tokenIndex = battleMap.tokens.findIndex(t => t.id === tokenId);
    if (tokenIndex === -1) return;

    const tokens = [...battleMap.tokens];
    tokens[tokenIndex] = { ...tokens[tokenIndex], position: newPosition };
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  removeToken(tokenId: string) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const tokens = battleMap.tokens.filter(t => t.id !== tokenId);
    this.applyPatch({ path: 'tokens', value: tokens });
  }

  // Stroke operations
  addStroke(stroke: Omit<BattlemapStroke, 'id'>) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    // Save current state to undo history before adding
    this.strokeUndoHistory.push([...battleMap.strokes]);
    if (this.strokeUndoHistory.length > this.maxUndoHistory) {
      this.strokeUndoHistory.shift();
    }

    const newStroke: BattlemapStroke = {
      ...stroke,
      id: generateId(),
    };

    const strokes = [...battleMap.strokes, newStroke];
    this.applyPatch({ path: 'strokes', value: strokes });
  }

  undoStroke(): boolean {
    const battleMap = this.battleMapValue;
    if (!battleMap || this.strokeUndoHistory.length === 0) return false;

    const previousStrokes = this.strokeUndoHistory.pop()!;
    this.applyPatch({ path: 'strokes', value: previousStrokes });
    return true;
  }

  clearStrokes() {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;
    
    // Save current state before clearing
    this.strokeUndoHistory.push([...battleMap.strokes]);
    if (this.strokeUndoHistory.length > this.maxUndoHistory) {
      this.strokeUndoHistory.shift();
    }
    
    this.applyPatch({ path: 'strokes', value: [] });
  }

  // Wall operations
  addWall(hex: HexCoord) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    // Check if wall already exists at this hex
    const exists = battleMap.walls.some(w => w.q === hex.q && w.r === hex.r);
    if (exists) return;

    const walls = [...battleMap.walls, { q: hex.q, r: hex.r }];
    this.applyPatch({ path: 'walls', value: walls });
  }

  removeWall(hex: HexCoord) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const walls = battleMap.walls.filter(w => !(w.q === hex.q && w.r === hex.r));
    this.applyPatch({ path: 'walls', value: walls });
  }

  toggleWall(hex: HexCoord) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const exists = battleMap.walls.some(w => w.q === hex.q && w.r === hex.r);
    if (exists) {
      this.removeWall(hex);
    } else {
      this.addWall(hex);
    }
  }

  clearWalls() {
    this.applyPatch({ path: 'walls', value: [] });
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.split('.');
    
    // Handle single key with array value
    if (keys.length === 1 && Array.isArray(patch.value)) {
      target[keys[0]] = patch.value;
      return;
    }
    
    // Handle single key with any value
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
