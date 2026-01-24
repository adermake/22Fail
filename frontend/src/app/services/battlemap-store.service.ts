import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattleMapApiService } from './battlemap-api.service';
import { BattleMapSocketService } from './battlemap-socket.service';
import { BattlemapData, BattlemapToken, BattlemapStroke, HexCoord, WallHex, createEmptyBattlemap, generateId } from '../model/battlemap.model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class BattleMapStoreService {
  private battleMapSubject = new BehaviorSubject<BattlemapData | null>(null);
  battleMap$ = this.battleMapSubject.asObservable();

  worldName!: string;
  battleMapId!: string;
  private pendingPatchPaths = new Set<string>();
  
  // Undo history for strokes
  private strokeUndoHistory: BattlemapStroke[][] = [];
  private maxUndoHistory = 50;

  private api = inject(BattleMapApiService);
  private socket = inject(BattleMapSocketService);

  get battleMapValue(): BattlemapData | null {
    return this.battleMapSubject.value;
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

  async load(worldName: string, battleMapId: string) {
    this.worldName = worldName;
    this.battleMapId = battleMapId;
    
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
    return battleMap as BattlemapData;
  }

  applyPatch(patch: JsonPatch) {
    const battleMap = this.battleMapSubject.value;
    if (battleMap) {
      this.pendingPatchPaths.add(patch.path);
      this.applyJsonPatch(battleMap, patch);
      battleMap.updatedAt = Date.now();
      this.battleMapSubject.next({ ...battleMap });
    }
    this.socket.sendPatch(this.worldName, this.battleMapId, patch);
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

  // AI Layer operations
  setAiPrompt(prompt: string) {
    this.applyPatch({ path: 'aiPrompt', value: prompt });
  }

  setAiLayerImage(imageBase64: string, bounds: { centerX: number; centerY: number; worldSize: number }) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    // Apply both patches
    this.applyPatch({ path: 'aiLayerImage', value: imageBase64 });
    this.applyPatch({ path: 'aiLayerBounds', value: bounds });
  }

  clearAiLayer() {
    this.applyPatch({ path: 'aiLayerImage', value: null });
    this.applyPatch({ path: 'aiLayerBounds', value: null });
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
