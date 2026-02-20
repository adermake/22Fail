/**
 * Battle Tracker Engine - Turn Meter Simulation System
 * 
 * Core Concept:
 * - Each character has a turn meter from 0 to 1000
 * - Every simulation tick, we add the character's speed to their turn meter
 * - When a character reaches >= 1000, they get a turn tile and their meter resets to (meter - 1000)
 * - If multiple characters reach 1000 in the same tick, the one with higher speed goes first
 * - We simulate until we have 15 tiles in the timeline
 * 
 * Key Properties:
 * - Timeline is purely calculated from current turn meters + speeds
 * - "Next Turn" advances the actual turn meters to the next state
 * - No manual dragging - everything is deterministic based on stats
 * 
 * Grouping:
 * - Adjacent tiles of the same team (but different characters) are grouped together
 */

import { BattleParticipant } from '../../model/world.model';
import { WorldStoreService } from '../../services/world-store.service';

// ============================================
// Types
// ============================================

/** A single turn tile in the timeline */
export interface TurnTile {
  id: string;           // Unique ID: characterId_simulationTick
  characterId: string;
  name: string;
  portrait?: string;
  team: string;
  speed: number;
  /** Which turn # this is for this character in the current simulation */
  turnNumber: number;
  /** The simulation tick when this turn was generated */
  simulationTick: number;
  /** The turn meter value when this tile was created (for display purposes) */
  meterAtTurn: number;
}

/** A group of consecutive tiles (same team, different characters) */
export interface TurnGroup {
  id: string;
  tiles: TurnTile[];
  team: string;
}

/** A character participating in battle */
export interface BattleCharacter {
  id: string;
  name: string;
  portrait?: string;
  speed: number;
  team: string;
  isInBattle: boolean;
  /** Current turn meter value (0-999) */
  turnMeter: number;
}

/** Internal participant state */
interface Participant {
  characterId: string;
  name: string;
  portrait?: string;
  speed: number;
  team: string;
  /** Current turn meter (0-999), persisted state */
  turnMeter: number;
}

/** Simulation state for a character during timeline calculation */
interface SimState {
  characterId: string;
  name: string;
  portrait?: string;
  speed: number;
  team: string;
  /** Simulated turn meter (can exceed 1000 during calculation) */
  meter: number;
  /** How many turns this character has taken in this simulation */
  turnsTaken: number;
}

// ============================================
// Constants
// ============================================

const TURN_METER_MAX = 1000;
const TIMELINE_LENGTH = 15;

// ============================================
// Engine
// ============================================

export class BattleTrackerEngine {
  // Callback for UI updates
  private onChange: (() => void) | null = null;

  // World store for persistence
  private worldStore: WorldStoreService | null = null;
  private isSaving = false;
  private isInitialized = false;

  // All characters available to add to battle (with their current stats)
  private allCharacters: Map<string, { id: string; name: string; portrait?: string; speed: number }> = new Map();

  // Characters currently in battle with their turn meter state
  private participants: Map<string, Participant> = new Map();

  // Available teams
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

    // Update existing participants with fresh character data
    for (const [id, participant] of this.participants) {
      const char = this.allCharacters.get(id);
      if (char) {
        participant.name = char.name;
        participant.portrait = char.portrait;
        participant.speed = char.speed;
      }
    }

    this.notifyChange();
  }

  // ============================================
  // Persistence
  // ============================================

  /**
   * Load state from world store. Only loads on first call (initialization).
   */
  loadFromWorldStore(): void {
    if (this.isInitialized || this.isSaving || !this.worldStore) return;

    const world = this.worldStore.worldValue;
    if (!world) return;

    this.isInitialized = true;

    const saved = world.battleParticipants || [];
    if (saved.length === 0) {
      this.participants.clear();
      this.notifyChange();
      return;
    }

    // Rebuild participants from saved data
    this.participants.clear();
    for (const bp of saved) {
      const char = this.allCharacters.get(bp.characterId);
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: char?.name || bp.name,
        portrait: char?.portrait,
        speed: char?.speed || bp.speed,
        team: bp.team || 'blue',
        // Load turn meter from saved data (stored in turnFrequency for compatibility)
        turnMeter: bp.turnFrequency ?? 0,
      });
    }

    this.notifyChange();
  }

  /**
   * Sync from world store (for external updates via websocket).
   */
  syncFromWorldStore(): void {
    if (!this.worldStore) return;

    const world = this.worldStore.worldValue;
    if (!world) return;

    const saved = world.battleParticipants || [];
    if (saved.length === 0) {
      this.participants.clear();
      this.notifyChange();
      return;
    }

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
        turnMeter: bp.turnFrequency ?? 0,
      });
    }

    this.notifyChange();
  }

  private saveToWorldStore(): void {
    if (!this.worldStore) return;

    this.isSaving = true;

    // Build participants array
    const battleParticipants: BattleParticipant[] = [];
    
    for (const [id, p] of this.participants) {
      battleParticipants.push({
        characterId: p.characterId,
        name: p.name,
        team: p.team,
        speed: p.speed,
        // Store turn meter in turnFrequency field for compatibility
        turnFrequency: p.turnMeter,
        nextTurnAt: 0, // Not used in new system
        currentTurn: 0, // Not used in new system
      });
    }

    this.worldStore.applyPatch({
      path: 'battleParticipants',
      value: battleParticipants,
    });

    setTimeout(() => { this.isSaving = false; }, 200);
  }

  // ============================================
  // Core Simulation Logic
  // ============================================

  /**
   * Simulate the timeline from current turn meter states.
   * Returns an array of TurnTiles representing the upcoming turns.
   */
  private simulateTimeline(): TurnTile[] {
    if (this.participants.size === 0) return [];

    // Initialize simulation state from current participants
    const simStates: SimState[] = [];
    for (const [id, p] of this.participants) {
      simStates.push({
        characterId: p.characterId,
        name: p.name,
        portrait: p.portrait,
        speed: p.speed,
        team: p.team,
        meter: p.turnMeter,
        turnsTaken: 0,
      });
    }

    const tiles: TurnTile[] = [];
    let tick = 0;
    const maxTicks = 10000; // Safety limit

    while (tiles.length < TIMELINE_LENGTH && tick < maxTicks) {
      tick++;

      // Add speed to all meters
      for (const state of simStates) {
        state.meter += state.speed;
      }

      // Find all characters who reached or exceeded TURN_METER_MAX
      const triggered = simStates.filter(s => s.meter >= TURN_METER_MAX);

      if (triggered.length === 0) continue;

      // Sort by speed (higher first), then by current meter (higher first) for ties
      triggered.sort((a, b) => {
        if (b.speed !== a.speed) return b.speed - a.speed;
        return b.meter - a.meter;
      });

      // Generate tiles for each triggered character
      for (const state of triggered) {
        state.turnsTaken++;
        
        tiles.push({
          id: `${state.characterId}_tick${tick}_turn${state.turnsTaken}`,
          characterId: state.characterId,
          name: state.name,
          portrait: state.portrait,
          team: state.team,
          speed: state.speed,
          turnNumber: state.turnsTaken,
          simulationTick: tick,
          meterAtTurn: state.meter,
        });

        // Reset meter (keeping overshoot)
        state.meter -= TURN_METER_MAX;

        // Stop if we have enough tiles
        if (tiles.length >= TIMELINE_LENGTH) break;
      }
    }

    return tiles;
  }

  /**
   * Calculate the next turn meter state after the first turn (or group) completes.
   * This advances the actual turn meters to the state where the next turn would happen.
   */
  private advanceToNextTurn(): void {
    if (this.participants.size === 0) return;

    // Get current timeline
    const timeline = this.simulateTimeline();
    if (timeline.length === 0) return;

    // Get the first group of tiles
    const groups = this.groupTiles(timeline);
    if (groups.length === 0) return;

    const firstGroup = groups[0];
    const targetTick = firstGroup.tiles[0].simulationTick;

    // Simulate forward until we reach the target tick
    for (const [id, p] of this.participants) {
      let meter = p.turnMeter;
      
      for (let tick = 1; tick <= targetTick; tick++) {
        meter += p.speed;
        
        // Check if this character triggered in this tick
        const triggeredInTick = firstGroup.tiles.some(
          t => t.characterId === id && t.simulationTick === tick
        );
        
        if (triggeredInTick) {
          meter -= TURN_METER_MAX;
        }
      }
      
      // Clamp to valid range
      p.turnMeter = Math.max(0, Math.min(meter, TURN_METER_MAX - 1));
    }
  }

  /**
   * Group tiles by team (adjacent tiles of same team, but different characters).
   */
  private groupTiles(tiles: TurnTile[]): TurnGroup[] {
    if (tiles.length === 0) return [];

    const groups: TurnGroup[] = [];
    let currentTiles: TurnTile[] = [];
    let currentTeam: string | null = null;
    let currentChars = new Set<string>();

    for (const tile of tiles) {
      // Should we start a new group?
      const needNewGroup = 
        currentTeam === null ||
        tile.team !== currentTeam ||
        currentChars.has(tile.characterId);

      if (needNewGroup && currentTiles.length > 0) {
        groups.push({
          id: `group_${groups.length}`,
          tiles: [...currentTiles],
          team: currentTeam!,
        });
        currentTiles = [];
        currentChars.clear();
      }

      if (needNewGroup) {
        currentTeam = tile.team;
      }

      currentTiles.push(tile);
      currentChars.add(tile.characterId);
    }

    // Last group
    if (currentTiles.length > 0) {
      groups.push({
        id: `group_${groups.length}`,
        tiles: [...currentTiles],
        team: currentTeam!,
      });
    }

    return groups;
  }

  // ============================================
  // Public API - Queries
  // ============================================

  /** Get the timeline as groups for display */
  getTimeline(): TurnGroup[] {
    const tiles = this.simulateTimeline();
    return this.groupTiles(tiles);
  }

  /** Get flat tile list (for animations) */
  getTiles(): TurnTile[] {
    return this.simulateTimeline();
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
        turnMeter: participant?.turnMeter ?? 0,
      });
    }

    return result;
  }

  /** Get participants only (characters in battle) */
  getParticipants(): BattleCharacter[] {
    return this.getCharacters().filter(c => c.isInBattle);
  }

  /** Get current turn display text */
  getCurrentTurnDisplay(): string | null {
    const groups = this.getTimeline();
    if (groups.length === 0) return null;
    
    const firstGroup = groups[0];
    return firstGroup.tiles.map(t => t.name).join(' & ');
  }

  /** Check if there are any participants */
  hasParticipants(): boolean {
    return this.participants.size > 0;
  }

  /** Get turn meter value for a character (0-999) */
  getTurnMeter(characterId: string): number {
    return this.participants.get(characterId)?.turnMeter ?? 0;
  }

  /** Get all turn meters as a map */
  getTurnMeters(): Map<string, number> {
    const result = new Map<string, number>();
    for (const [id, p] of this.participants) {
      result.set(id, p.turnMeter);
    }
    return result;
  }

  // ============================================
  // Public API - Actions
  // ============================================

  /** Add a character to battle */
  addCharacter(characterId: string): void {
    const char = this.allCharacters.get(characterId);
    if (!char || this.participants.has(characterId)) return;

    this.participants.set(characterId, {
      characterId,
      name: char.name,
      portrait: char.portrait,
      speed: char.speed,
      team: 'blue',
      turnMeter: 0, // Start at 0
    });

    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Remove a character from battle */
  removeCharacter(characterId: string): void {
    this.participants.delete(characterId);
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Set a character's team */
  setTeam(characterId: string, team: string): void {
    const participant = this.participants.get(characterId);
    if (!participant) return;

    participant.team = team;
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Set a character's turn meter directly (0-999) */
  setTurnMeter(characterId: string, value: number): void {
    const participant = this.participants.get(characterId);
    if (!participant) return;

    // Clamp to valid range
    participant.turnMeter = Math.max(0, Math.min(value, TURN_METER_MAX - 1));
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Advance to the next turn - consumes the first group */
  nextTurn(): void {
    if (this.participants.size === 0) return;

    this.advanceToNextTurn();
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Reset battle - clear all participants and their turn meters */
  resetBattle(): void {
    this.participants.clear();
    this.isInitialized = false;
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Reset just the turn meters (keep participants) */
  resetTurnMeters(): void {
    for (const p of this.participants.values()) {
      p.turnMeter = 0;
    }
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
