import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BattleMapApiService } from './battlemap-api.service';
import { BattleMapSocketService } from './battlemap-socket.service';
import { BattlemapData, BattlemapToken, BattlemapStroke, HexCoord, createEmptyBattlemap, generateId } from '../model/battlemap.model';
import { JsonPatch } from '../model/json-patch.model';

@Injectable({ providedIn: 'root' })
export class BattleMapStoreService {
  private battleMapSubject = new BehaviorSubject<BattlemapData | null>(null);
  battleMap$ = this.battleMapSubject.asObservable();

  worldName!: string;
  battleMapId!: string;
  private pendingPatchPaths = new Set<string>();

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
    if (!battleMap.gridBounds) {
      battleMap.gridBounds = { minQ: -5, maxQ: 5, minR: -5, maxR: 5 };
    }
    if (!battleMap.strokes) {
      battleMap.strokes = battleMap.drawings || [];
    }
    if (!battleMap.tokens) {
      battleMap.tokens = [];
    }
    if (!battleMap.measurementLines) {
      battleMap.measurementLines = [];
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
    this.expandGridIfNeeded(token.position);
  }

  moveToken(tokenId: string, newPosition: HexCoord) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const tokenIndex = battleMap.tokens.findIndex(t => t.id === tokenId);
    if (tokenIndex === -1) return;

    const tokens = [...battleMap.tokens];
    tokens[tokenIndex] = { ...tokens[tokenIndex], position: newPosition };
    this.applyPatch({ path: 'tokens', value: tokens });
    this.expandGridIfNeeded(newPosition);
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

    const newStroke: BattlemapStroke = {
      ...stroke,
      id: generateId(),
    };

    const strokes = [...battleMap.strokes, newStroke];
    this.applyPatch({ path: 'strokes', value: strokes });
  }

  clearStrokes() {
    this.applyPatch({ path: 'strokes', value: [] });
  }

  // Grid expansion
  private expandGridIfNeeded(hex: HexCoord) {
    const battleMap = this.battleMapValue;
    if (!battleMap) return;

    const bounds = { ...battleMap.gridBounds };
    let changed = false;

    if (hex.q < bounds.minQ) { bounds.minQ = hex.q - 2; changed = true; }
    if (hex.q > bounds.maxQ) { bounds.maxQ = hex.q + 2; changed = true; }
    if (hex.r < bounds.minR) { bounds.minR = hex.r - 2; changed = true; }
    if (hex.r > bounds.maxR) { bounds.maxR = hex.r + 2; changed = true; }

    if (changed) {
      this.applyPatch({ path: 'gridBounds', value: bounds });
    }
  }

  expandGridToPixel(x: number, y: number) {
    // Import HexMath at the call site to calculate hex from pixel
    // This will be called by the component with calculated hex coords
  }

  private applyJsonPatch(target: any, patch: JsonPatch) {
    const keys = patch.path.split('.');
    
    // Handle single key with array value
    if (keys.length === 1 && Array.isArray(patch.value)) {
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
