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

import { BattleParticipant } from '../../model/world.model';
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
        currentTurn: 1,
      });
    }

    // Rebuild timeline
    // First round respects saved order (nextTurnAt is the order)
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
        portrait: participant.portrait, // Save portrait!
        team: participant.team,
        speed: participant.speed,
        // Store scripted count in first entry
        turnFrequency: orderIndex === 0 ? 10000 + this.scriptedCount : participant.speed,
        nextTurnAt: orderIndex,
      });
    }

    this.worldStore.applyPatch({
      path: 'battleParticipants',
      value: battleParticipants,
    });

    setTimeout(() => { this.isSaving = false; }, 100);
  }

  // ============================================
  // Core Logic
  // ============================================

  /** Calculate timing for a turn: lower = sooner. Formula: (turn * 1000) / speed */
  private calculateTiming(turnNumber: number, speed: number): number {
    return (turnNumber * 1000) / Math.max(speed, 1);
  }

  /** Create a tile for a participant - ID is stable based on character + turn number */
  private createTile(
    participant: { characterId: string; name: string; portrait?: string; speed: number; team: string },
    turnNumber: number,
    _indexHint: number
  ): TurnTile {
    return {
      // Stable ID: characterId + turnNumber only - this ensures animations work correctly
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

    // Track turn numbers for generation
    const turnNumbers = new Map<string, number>();
    for (const [id, p] of this.participants) {
      turnNumbers.set(id, p.currentTurn);
    }

    // Account for existing tiles
    for (const tile of this.tiles) {
      const current = turnNumbers.get(tile.characterId) || 1;
      if (tile.turnNumber >= current) {
        turnNumbers.set(tile.characterId, tile.turnNumber + 1);
      }
    }

    // Type for participant tracking
    type Participant = { 
      characterId: string; 
      name: string; 
      portrait?: string; 
      speed: number; 
      team: string;
      currentTurn: number;
    };

    // Generate tiles until full
    while (this.tiles.length < this.TIMELINE_LENGTH) {
      // Find participant with lowest timing for their next turn
      let best: { participant: Participant; turn: number; timing: number } | null = null;

      for (const [id, p] of this.participants) {
        const turn = turnNumbers.get(id) || 1;
        const timing = this.calculateTiming(turn, p.speed);
        if (!best || timing < best.timing) {
          best = { participant: p, turn, timing };
        }
      }

      if (!best) break;

      this.tiles.push(this.createTile(best.participant, best.turn, this.tiles.length));
      turnNumbers.set(best.participant.characterId, best.turn + 1);
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
    for (const tile of firstGroup.tiles) {
      const participant = this.participants.get(tile.characterId);
      if (participant) {
        participant.currentTurn = Math.max(participant.currentTurn, tile.turnNumber + 1);
      }
    }

    // Remove the first group's tiles
    this.tiles = this.tiles.slice(tilesToRemove);

    // Adjust scripted count
    this.scriptedCount = Math.max(0, this.scriptedCount - tilesToRemove);

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
   * When a tile is dragged and dropped, everything from position 0 to the drop position becomes scripted.
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

    // Can't drop before current position (no going back in time)
    if (targetTileIndex <= tileIndex) {
      this.notifyChange();
      return;
    }

    // Strategy:
    // 1. Remove all tiles for this character
    // 2. Insert one new tile for this character at the drop position
    // 3. Everything up to and including that position becomes scripted
    // 4. Regenerate calculated tiles after that

    const characterId = draggedTile.characterId;
    const participant = this.participants.get(characterId);
    if (!participant) return;

    // Remove character's tiles and track where they were
    const otherTiles: TurnTile[] = [];
    let insertPosition = 0;
    let foundTarget = false;

    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      if (tile.characterId === characterId) {
        continue; // Skip this character's tiles
      }
      
      otherTiles.push(tile);
      
      // Check if we've passed the target position
      if (!foundTarget && i >= targetTileIndex) {
        insertPosition = otherTiles.length;
        foundTarget = true;
      }
    }

    if (!foundTarget) {
      insertPosition = otherTiles.length;
    }

    // Create new tile for the character
    const newTile = this.createTile(participant, participant.currentTurn, insertPosition);

    // Build new tile list
    const newTiles = [
      ...otherTiles.slice(0, insertPosition),
      newTile,
      ...otherTiles.slice(insertPosition),
    ];

    // Everything up to and including the dropped tile is scripted
    this.tiles = newTiles;
    this.scriptedCount = insertPosition + 1;

    // Update participant's turn
    participant.currentTurn++;

    // Refill calculated portion
    this.fillCalculatedTiles();
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
