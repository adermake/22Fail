/**
 * Battle Tracker Engine
 * 
 * Core concepts:
 * - Characters participate in battle with a speed stat
 * - Higher speed = more turns in the same time period
 * - Timeline shows upcoming turns as tiles
 * - Tiles can be grouped when consecutive tiles are same team (but not same character)
 * 
 * Scripted vs Calculated:
 * - When you drag a tile, everything to the LEFT of drop position becomes "scripted"
 * - Scripted tiles are locked in order - speed doesn't affect them
 * - Everything to the RIGHT is calculated based on speed
 * 
 * Grouping:
 * - Adjacent tiles of the same team are grouped into one turn
 * - A character cannot be grouped with themselves
 * - "Next turn" consumes the entire first group
 */

import { BattleParticipant, BattleTimelineEntry } from '../../model/world.model';
import { WorldStoreService } from '../../services/world-store.service';

// ============================================
// Types
// ============================================

/** A single turn slot in the timeline */
export interface TurnTile {
  id: string;           // Unique tile ID (characterId_turnNumber)
  characterId: string;
  name: string;
  portrait?: string;
  team: string;
  speed: number;
  turnNumber: number;   // Which turn this is for this character (1st, 2nd, etc.)
  timing: number;       // Calculated timing value (lower = sooner)
  isScripted?: boolean; // Is this tile in the scripted (locked) portion?
}

/** A group of consecutive tiles (same team, different characters) */
export interface TurnGroup {
  id: string;
  tiles: TurnTile[];
  team: string;
  isScripted: boolean;  // Is this group in the scripted portion?
}

/** A character that can participate in battle */
export interface BattleCharacter {
  id: string;
  name: string;
  portrait?: string;
  speed: number;
  team: string;
  isInBattle: boolean;
}

// ============================================
// Engine
// ============================================

export class BattleTrackerEngine {
  // Callback for UI updates
  private onChange: (() => void) | null = null;

  // World store for persistence
  private worldStore: WorldStoreService | null = null;
  private isSaving = false;
  private isInitialized = false; // Track if we've done initial load

  // All characters available to add to battle
  private allCharacters: Map<string, { id: string; name: string; portrait?: string; speed: number }> = new Map();

  // Characters currently in battle
  private participants: Map<string, { 
    characterId: string; 
    name: string; 
    portrait?: string; 
    speed: number; 
    team: string;
    currentTurn: number; // The next turn number to generate for this character
  }> = new Map();

  // The timeline of tiles
  // Index 0 is the current turn
  private tiles: TurnTile[] = [];

  // How many tiles from the start are "scripted" (locked order)
  private scriptedCount = 0;

  // How many tiles to show in the timeline
  private readonly TIMELINE_LENGTH = 12;

  // Teams available
  readonly TEAMS = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];

  // ============================================
  // Setup
  // ============================================

  setChangeCallback(callback: () => void): void {
    this.onChange = callback;
  }

  setWorldStore(store: WorldStoreService): void {
    this.worldStore = store;
  }

  setAvailableCharacters(characters: { id: string; name: string; portrait?: string; speed?: number }[]): void {
    this.allCharacters.clear();
    for (const char of characters) {
      this.allCharacters.set(char.id, {
        id: char.id,
        name: char.name,
        portrait: char.portrait,
        speed: char.speed ?? 10,
      });
    }

    // Update existing participants with fresh data
    for (const [id, participant] of this.participants) {
      const char = this.allCharacters.get(id);
      if (char) {
        participant.name = char.name;
        participant.portrait = char.portrait;
        participant.speed = char.speed;
      }
    }

    // Update tiles with fresh data
    for (const tile of this.tiles) {
      const char = this.allCharacters.get(tile.characterId);
      if (char) {
        tile.name = char.name;
        tile.portrait = char.portrait;
        tile.speed = char.speed;
      }
    }

    this.notifyChange();
  }

  // ============================================
  // Persistence
  // ============================================

  /**
   * Load state from world store. Only loads on first call (initialization).
   * Subsequent calls are ignored to prevent animations from breaking.
   */
  loadFromWorldStore(): void {
    // Skip if already initialized or currently saving
    if (this.isInitialized || this.isSaving || !this.worldStore) return;

    const world = this.worldStore.worldValue;
    if (!world) return;

    // Mark as initialized - we won't reload again
    this.isInitialized = true;

    const saved = world.battleParticipants || [];
    if (saved.length === 0) {
      this.participants.clear();
      this.tiles = [];
      this.scriptedCount = 0;
      this.notifyChange();
      return;
    }

    // Extract scripted count from first entry (stored as turnFrequency >= 10000)
    const first = saved[0];
    this.scriptedCount = first.turnFrequency >= 10000 ? first.turnFrequency - 10000 : 0;

    // Rebuild participants
    this.participants.clear();
    for (const bp of saved) {
      const char = this.allCharacters.get(bp.characterId);
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: char?.name || bp.name,
        portrait: char?.portrait,
        speed: char?.speed || bp.speed,
        team: bp.team || 'blue',
        currentTurn: bp.currentTurn || 1,
      });
    }

    // Rebuild timeline
    // If we have a full timeline saved, use it faithfully
    const timeline = world.battleTimeline;
    if (timeline && timeline.length > 0) {
      console.log('[BattleEngine] Loading from saved timeline:', timeline.length, 'tiles');
      this.tiles = [];
      for (const entry of timeline) {
        const participant = this.participants.get(entry.characterId);
        if (participant) {
          this.tiles.push({
            id: entry.id,
            characterId: entry.characterId,
            name: participant.name,
            portrait: participant.portrait,
            team: participant.team,
            speed: participant.speed,
            turnNumber: entry.turnNumber,
            timing: entry.timing,
            isScripted: entry.isScripted,
          });
        }
      }
    } else {
      console.log('[BattleEngine] No timeline found, using fallback reconstruction');
      // Fallback: first round respects saved order (nextTurnAt is the order)
      const orderedBySaved = [...saved].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      
      this.tiles = [];
      for (const bp of orderedBySaved) {
        const participant = this.participants.get(bp.characterId);
        if (participant) {
          this.tiles.push(this.createTile(participant, 1, this.tiles.length));
          participant.currentTurn = 2;
        }
      }

      // Fill remaining slots with calculated tiles
      this.fillCalculatedTiles();
    }

    // Cap scripted count
    this.scriptedCount = Math.min(this.scriptedCount, this.tiles.length);

    this.notifyChange();
  }

  /**
   * Sync from world store without animations.
   * Used when changes come from other clients via websocket.
   * If a full battleTimeline is saved, reconstruct it faithfully.
   */
  syncFromWorldStore(): void {
    // Skip if no world store
    if (!this.worldStore) return;
    // Don't skip on isSaving - we need to sync from external changes

    const world = this.worldStore.worldValue;
    if (!world) return;

    const saved = world.battleParticipants || [];
    if (saved.length === 0) {
      this.participants.clear();
      this.tiles = [];
      this.scriptedCount = 0;
      this.notifyChange();
      return;
    }

    // Extract scripted count from first entry
    const first = saved[0];
    this.scriptedCount = first.turnFrequency >= 10000 ? first.turnFrequency - 10000 : 0;

    // Rebuild participants
    this.participants.clear();
    for (const bp of saved) {
      const char = this.allCharacters.get(bp.characterId);
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: char?.name || bp.name,
        portrait: char?.portrait,
        speed: char?.speed || bp.speed,
        team: bp.team || 'blue',
        currentTurn: bp.currentTurn || 1,
      });
    }

    // If we have a full timeline saved, reconstruct it faithfully
    const timeline = world.battleTimeline;
    if (timeline && timeline.length > 0) {
      console.log('[BattleEngine] Syncing from saved timeline:', timeline.length, 'tiles');
      this.tiles = [];
      for (const entry of timeline) {
        const participant = this.participants.get(entry.characterId);
        if (participant) {
          this.tiles.push({
            id: entry.id,
            characterId: entry.characterId,
            name: participant.name,
            portrait: participant.portrait,
            team: participant.team,
            speed: participant.speed,
            turnNumber: entry.turnNumber,
            timing: entry.timing,
            isScripted: entry.isScripted,
          });
        }
      }
      // Cap scripted count
      this.scriptedCount = Math.min(this.scriptedCount, this.tiles.length);
      console.log('[BattleEngine] Synced', this.tiles.length, 'tiles, scripted:', this.scriptedCount);
      this.notifyChange();
      return;
    }

    // Fallback: rebuild from participants (old format without battleTimeline)
    console.log('[BattleEngine] No timeline found, using fallback reconstruction');
    const orderedBySaved = [...saved].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
    
    this.tiles = [];
    for (const bp of orderedBySaved) {
      const participant = this.participants.get(bp.characterId);
      if (participant) {
        this.tiles.push(this.createTile(participant, 1, this.tiles.length));
        participant.currentTurn = 2;
      }
    }

    // Fill remaining slots
    this.fillCalculatedTiles();

    // Cap scripted count
    this.scriptedCount = Math.min(this.scriptedCount, this.tiles.length);

    this.notifyChange();
  }

  private saveToWorldStore(): void {
    if (!this.worldStore) return;

    this.isSaving = true;

    // Build participants in timeline order (first occurrence of each character)
    const battleParticipants: BattleParticipant[] = [];
    const seen = new Set<string>();

    for (const tile of this.tiles) {
      if (seen.has(tile.characterId)) continue;
      seen.add(tile.characterId);

      const participant = this.participants.get(tile.characterId);
      if (!participant) continue;

      const orderIndex = battleParticipants.length;
      battleParticipants.push({
        characterId: participant.characterId,
        name: participant.name,
        // NOTE: Do NOT save portrait here - it's a huge base64 string that crashes websockets
        // Portrait is retrieved at runtime from allCharacters
        team: participant.team,
        speed: participant.speed,
        currentTurn: participant.currentTurn,
        // Store scripted count in first entry
        turnFrequency: orderIndex === 0 ? 10000 + this.scriptedCount : participant.speed,
        nextTurnAt: orderIndex,
      });
    }

    // Save full timeline for faithful lobby sync
    const battleTimeline: BattleTimelineEntry[] = this.tiles.map((tile, index) => ({
      id: tile.id,
      characterId: tile.characterId,
      team: tile.team,
      turnNumber: tile.turnNumber,
      timing: tile.timing,
      isScripted: index < this.scriptedCount,
    }));

    // Apply both updates atomically to avoid race conditions
    this.worldStore.applyPatch({
      path: 'battleParticipants',
      value: battleParticipants,
    });

    // Small delay to ensure first patch is processed before second
    setTimeout(() => {
      if (this.worldStore) {
        this.worldStore.applyPatch({
          path: 'battleTimeline',
          value: battleTimeline,
        });
      }
    }, 10);

    setTimeout(() => { this.isSaving = false; }, 200);
  }

  // ============================================
  // Core Logic
  // ============================================

  /** Calculate timing for a turn: lower = sooner. Formula: (turn * 1000) / speed */
  private calculateTiming(turnNumber: number, speed: number): number {
    return (turnNumber * 1000) / Math.max(speed, 1);
  }

  /** Create a tile for a participant - ID is based on character and turn number */
  private createTile(
    participant: { characterId: string; name: string; portrait?: string; speed: number; team: string },
    turnNumber: number,
    positionHint: number
  ): TurnTile {
    return {
      // Content-based ID: follows the tile regardless of position
      // This allows FLIP animations to track tiles as they move
      id: `${participant.characterId}_t${turnNumber}`,
      characterId: participant.characterId,
      name: participant.name,
      portrait: participant.portrait,
      team: participant.team,
      speed: participant.speed,
      turnNumber,
      timing: this.calculateTiming(turnNumber, participant.speed),
    };
  }

  /** Fill timeline to TIMELINE_LENGTH with calculated tiles */
  private fillCalculatedTiles(): void {
    if (this.participants.size === 0) return;

    // Trim to max length first to prevent unbounded growth
    if (this.tiles.length > this.TIMELINE_LENGTH) {
      this.tiles = this.tiles.slice(0, this.TIMELINE_LENGTH);
    }

    // Track what turn numbers are already in use per character
    const usedTurns = new Map<string, Set<number>>();
    for (const tile of this.tiles) {
      if (!usedTurns.has(tile.characterId)) {
        usedTurns.set(tile.characterId, new Set());
      }
      usedTurns.get(tile.characterId)!.add(tile.turnNumber);
    }

    // Track next turn number to generate for each participant
    const nextTurnNumbers = new Map<string, number>();
    for (const [id, p] of this.participants) {
      // Start from currentTurn and find the next unused turn number
      let turn = p.currentTurn;
      const used = usedTurns.get(id) || new Set();
      while (used.has(turn)) {
        turn++;
      }
      nextTurnNumbers.set(id, turn);
    }

    // Generate tiles until full (with safety limit to prevent infinite loop)
    const maxIterations = this.TIMELINE_LENGTH * 2;
    let iterations = 0;
    
    while (this.tiles.length < this.TIMELINE_LENGTH && iterations < maxIterations) {
      iterations++;
      
      // Find participant with lowest timing for their next turn
      let best: { characterId: string; turn: number; timing: number } | null = null;

      for (const [id, p] of this.participants) {
        const turn = nextTurnNumbers.get(id) || 1;
        const timing = this.calculateTiming(turn, p.speed);
        if (!best || timing < best.timing) {
          best = { characterId: id, turn, timing };
        }
      }

      if (!best) break;

      const participant = this.participants.get(best.characterId)!;
      this.tiles.push(this.createTile(participant, best.turn, this.tiles.length));
      nextTurnNumbers.set(best.characterId, best.turn + 1);
    }

    // Sort only the calculated portion (after scripted)
    const scripted = this.tiles.slice(0, this.scriptedCount);
    const calculated = this.tiles.slice(this.scriptedCount);
    calculated.sort((a, b) => a.timing - b.timing);
    this.tiles = [...scripted, ...calculated];
  }

  /** Rebuild the entire timeline from scratch */
  private rebuildTimeline(): void {
    this.tiles = [];
    this.scriptedCount = 0;

    // Reset all participants to turn 1
    for (const p of this.participants.values()) {
      p.currentTurn = 1;
    }

    this.fillCalculatedTiles();
  }

  // ============================================
  // Public API - Queries
  // ============================================

  /** Get the timeline as groups for display */
  getTimeline(): TurnGroup[] {
    if (this.tiles.length === 0) return [];

    const groups: TurnGroup[] = [];
    let currentTiles: TurnTile[] = [];
    let currentTeam: string | null = null;
    let currentChars = new Set<string>();
    let tileIndex = 0;

    for (const tile of this.tiles) {
      const isScripted = tileIndex < this.scriptedCount;
      
      // Should we start a new group?
      const needNewGroup = 
        currentTeam === null ||
        tile.team !== currentTeam ||
        currentChars.has(tile.characterId);

      if (needNewGroup && currentTiles.length > 0) {
        const groupStartIdx = tileIndex - currentTiles.length;
        groups.push({
          id: `group_${groups.length}`,
          tiles: currentTiles,
          team: currentTeam!,
          isScripted: groupStartIdx < this.scriptedCount,
        });
        currentTiles = [];
        currentChars.clear();
      }

      if (needNewGroup) {
        currentTeam = tile.team;
      }

      // Add tile with isScripted flag
      currentTiles.push({ ...tile, isScripted });
      currentChars.add(tile.characterId);
      tileIndex++;
    }

    // Last group
    if (currentTiles.length > 0) {
      const startIndex = this.tiles.length - currentTiles.length;
      groups.push({
        id: `group_${groups.length}`,
        tiles: currentTiles,
        team: currentTeam!,
        isScripted: startIndex < this.scriptedCount,
      });
    }

    return groups;
  }

  /** Get characters for the character list */
  getCharacters(): BattleCharacter[] {
    const result: BattleCharacter[] = [];
    
    for (const [id, char] of this.allCharacters) {
      const participant = this.participants.get(id);
      result.push({
        id,
        name: char.name,
        portrait: char.portrait,
        speed: char.speed,
        team: participant?.team || 'blue',
        isInBattle: !!participant,
      });
    }

    return result;
  }

  /** Get current turn display text */
  getCurrentTurnDisplay(): string | null {
    const groups = this.getTimeline();
    if (groups.length === 0) return null;
    
    const firstGroup = groups[0];
    return firstGroup.tiles.map(t => t.name).join(' & ');
  }

  /** Check if there are any tiles */
  hasTiles(): boolean {
    return this.tiles.length > 0;
  }

  // ============================================
  // Public API - Actions
  // ============================================

  addCharacter(characterId: string): void {
    const char = this.allCharacters.get(characterId);
    if (!char || this.participants.has(characterId)) return;

    this.participants.set(characterId, {
      characterId,
      name: char.name,
      portrait: char.portrait,
      speed: char.speed,
      team: 'blue',
      currentTurn: 1,
    });

    this.rebuildTimeline();
    this.notifyChange();
    this.saveToWorldStore();
  }

  removeCharacter(characterId: string): void {
    this.participants.delete(characterId);
    
    // Remove all tiles for this character
    const oldTiles = this.tiles;
    this.tiles = this.tiles.filter(t => t.characterId !== characterId);
    
    // Adjust scripted count
    const removed = oldTiles.length - this.tiles.length;
    const removedBeforeScripted = oldTiles
      .slice(0, this.scriptedCount)
      .filter(t => t.characterId === characterId).length;
    this.scriptedCount = Math.max(0, this.scriptedCount - removedBeforeScripted);

    this.fillCalculatedTiles();
    this.notifyChange();
    this.saveToWorldStore();
  }

  setTeam(characterId: string, team: string): void {
    const participant = this.participants.get(characterId);
    if (!participant) return;

    participant.team = team;

    // Update all tiles
    for (const tile of this.tiles) {
      if (tile.characterId === characterId) {
        tile.team = team;
      }
    }

    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Advance to next turn - consumes the entire first group */
  nextTurn(): void {
    if (this.tiles.length === 0) return;

    // Get the first group
    const groups = this.getTimeline();
    if (groups.length === 0) return;

    const firstGroup = groups[0];
    const tilesToRemove = firstGroup.tiles.length;

    // Update currentTurn for each character whose tile we're removing
    // This represents the next turn they should get
    for (const tile of firstGroup.tiles) {
      const participant = this.participants.get(tile.characterId);
      if (participant) {
        // Set currentTurn to the next turn after the one being consumed
        participant.currentTurn = tile.turnNumber + 1;
      }
    }

    // Remove the first group's tiles
    this.tiles = this.tiles.slice(tilesToRemove);

    // Adjust scripted count
    this.scriptedCount = Math.max(0, this.scriptedCount - tilesToRemove);

    // Cap tiles to max length before refilling
    if (this.tiles.length > this.TIMELINE_LENGTH) {
      this.tiles = this.tiles.slice(0, this.TIMELINE_LENGTH);
    }

    // Refill with new tiles at the end
    this.fillCalculatedTiles();
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Reset the battle - also allows reloading from world store */
  resetBattle(): void {
    this.participants.clear();
    this.tiles = [];
    this.scriptedCount = 0;
    this.isInitialized = false; // Allow reload after reset
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** 
   * Handle tile drop
   * Simply moves the dragged tile to the new position.
   * Everything from position 0 to the new position becomes scripted.
   */
  dropTile(tileId: string, targetGroupIndex: number, position: 'before' | 'after'): void {
    // Find the dragged tile
    const tileIndex = this.tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return;

    const draggedTile = this.tiles[tileIndex];
    const groups = this.getTimeline();

    // Calculate target tile index from group index
    let targetTileIndex = 0;
    for (let i = 0; i < targetGroupIndex; i++) {
      targetTileIndex += groups[i]?.tiles.length || 0;
    }
    if (position === 'after') {
      targetTileIndex += groups[targetGroupIndex]?.tiles.length || 0;
    }

    // If dragging to same position or earlier, ignore
    if (targetTileIndex <= tileIndex) {
      return;
    }

    // Simple reorder: remove tile from old position, insert at new position
    const newTiles = [...this.tiles];
    newTiles.splice(tileIndex, 1); // Remove from old position
    
    // Adjust target index since we removed an element
    const adjustedTargetIndex = targetTileIndex - 1;
    
    // Insert at new position  
    newTiles.splice(adjustedTargetIndex, 0, draggedTile);

    this.tiles = newTiles;

    // Everything up to and including the dropped tile is now scripted
    this.scriptedCount = adjustedTargetIndex + 1;

    this.notifyChange();
    this.saveToWorldStore();
  }

  // ============================================
  // Private
  // ============================================

  private notifyChange(): void {
    if (this.onChange) {
      this.onChange();
    }
  }
}
