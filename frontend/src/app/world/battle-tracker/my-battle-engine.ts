import {
  BattleTimelineEngine,
  TimelineGroup,
  TimelineTile,
  CharacterOption,
} from './battle-timeline-engine';
import { WorldStoreService } from '../../services/world-store.service';
import { BattleParticipant } from '../../model/world.model';

interface Participant {
  characterId: string;
  name: string;
  portrait?: string;
  team: string;
  speed: number;
  nextTurn: number; // Which turn number this character will take next
}

/**
 * Battle Engine Implementation
 *
 * Turn timing formula: timing = (turnNumber * 1000) / speed
 * Higher speed = lower timing = goes first
 *
 * Timeline has two parts:
 * - Scripted: Locked in, won't change (everything affected by manual drags)
 * - Calculated: Predicted based on speed, can shift
 * 
 * STATE PERSISTENCE:
 * - The engine saves the TIMELINE (tiles array) to WorldStore.battleParticipants
 * - The order of battleParticipants IS the turn order
 * - This ensures the battlemap tracker shows the same order
 * - scriptedCount is stored in the first entry to preserve locked-in turns
 */
export class MyBattleEngine extends BattleTimelineEngine {
  // Reference to the world store for persistence
  private worldStore: WorldStoreService | null = null;
  
  // Characters available to add to battle
  private allCharacters: { id: string; name: string; portrait?: string; speed: number }[] = [];

  // Characters currently in battle with their state
  private participants: Map<string, Participant> = new Map();

  // The displayed timeline (scripted + calculated)
  private tiles: TimelineTile[] = [];

  // How many tiles at the front are "scripted" (locked in)
  private scriptedCount: number = 0;

  // ===========================================
  // SETUP & PERSISTENCE
  // ===========================================

  /**
   * Connect the engine to the WorldStore for persistence
   */
  setWorldStore(store: WorldStoreService) {
    this.worldStore = store;
  }

  /**
   * Load state from WorldStore's battleParticipants.
   * Each entry represents one CHARACTER (not one turn).
   * The nextTurnAt value indicates when they next act (for ordering).
   */
  loadFromWorldStore() {
    console.log('[BATTLE ENGINE] loadFromWorldStore() called');
    
    if (!this.worldStore) {
      console.log('[BATTLE ENGINE] No world store, skipping load');
      return;
    }
    
    const world = this.worldStore.worldValue;
    if (!world) {
      console.log('[BATTLE ENGINE] No world data available, skipping load');
      return;
    }
    
    const savedParticipants = world.battleParticipants || [];
    console.log('[BATTLE ENGINE] Loading from world store, battleParticipants:', JSON.stringify(savedParticipants));
    
    if (savedParticipants.length === 0) {
      console.log('[BATTLE ENGINE] No participants, clearing state');
      // No battle in progress
      this.participants.clear();
      this.tiles = [];
      this.scriptedCount = 0;
      this.notifyChange();
      return;
    }
    
    // Clear current state
    this.participants.clear();
    this.tiles = [];
    
    // First, extract scriptedCount from first participant's turnFrequency
    // We use turnFrequency >= 10000 to indicate scriptedCount
    const firstParticipant = savedParticipants[0];
    if (firstParticipant && firstParticipant.turnFrequency >= 10000) {
      this.scriptedCount = firstParticipant.turnFrequency - 10000;
      console.log('[BATTLE ENGINE] Extracted scriptedCount from turnFrequency:', this.scriptedCount);
    } else {
      this.scriptedCount = 0;
    }
    
    // Sort by nextTurnAt to get the turn order (smaller = earlier)
    const sortedParticipants = [...savedParticipants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);
    
    console.log('[BATTLE ENGINE] Sorted participants:', sortedParticipants.map(p => `${p.name}(order=${p.nextTurnAt})`).join(', '));
    
    // Load participants - they start at turn 1 in the order they appear
    for (const bp of sortedParticipants) {
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: bp.name,
        portrait: bp.portrait,
        team: bp.team || 'blue',
        speed: bp.speed,
        nextTurn: 1, // Everyone starts at turn 1 when loading
      });
    }
    
    // Build the timeline respecting the saved order for first round
    this.tiles = [];
    this.buildInitialTimeline(sortedParticipants);
    
    // Re-apply scriptedCount (cap to tile length)
    this.scriptedCount = Math.min(this.scriptedCount, this.tiles.length);
    
    console.log('[BATTLE ENGINE] After fillTimeline: tiles count =', this.tiles.length);
    console.log('[BATTLE ENGINE] Timeline:', this.tiles.map(t => `${t.name}(turn ${t.turn})`).join(', '));
    
    this.notifyChange();
  }

  /**
   * Save current state to WorldStore.
   * We save participants in TIMELINE ORDER (based on first appearance in tiles).
   * This ensures the battlemap tracker shows them in the correct order.
   */
  private saveToWorldStore() {
    if (!this.worldStore) {
      console.log('[BATTLE ENGINE] No world store, cannot save');
      return;
    }
    
    // Build battleParticipants in the order they appear in the timeline
    // Each character appears once, based on their FIRST tile in the timeline
    const battleParticipants: BattleParticipant[] = [];
    const seen = new Set<string>();
    
    for (const tile of this.tiles) {
      if (seen.has(tile.characterId)) continue;
      seen.add(tile.characterId);
      
      const participant = this.participants.get(tile.characterId);
      if (!participant) continue;
      
      // Use index as the ordering value (smaller = earlier in queue)
      const orderIndex = battleParticipants.length;
      
      battleParticipants.push({
        characterId: participant.characterId,
        name: participant.name,
        portrait: participant.portrait,
        team: participant.team,
        speed: participant.speed,
        // Store scriptedCount in the first entry's turnFrequency (add 10000 to distinguish)
        turnFrequency: orderIndex === 0 ? (10000 + this.scriptedCount) : participant.speed,
        // Use order index for simple ordering (smaller = first)
        nextTurnAt: orderIndex,
      });
    }
    
    console.log('[BATTLE ENGINE] Saving to world store:', JSON.stringify(battleParticipants, null, 2));
    
    this.worldStore.applyPatch({
      path: 'battleParticipants',
      value: battleParticipants
    });
  }

  setAvailableCharacters(
    characters: { id: string; name: string; portrait?: string; speed?: number }[],
  ) {
    console.log('[BATTLE ENGINE] setAvailableCharacters called with', characters.length, 'characters');
    
    this.allCharacters = characters.map((c) => ({
      id: c.id,
      name: c.name,
      portrait: c.portrait,
      speed: c.speed ?? 10,
    }));
    
    // Update existing participants with fresh character data (name, portrait, speed)
    for (const char of this.allCharacters) {
      const participant = this.participants.get(char.id);
      if (participant) {
        participant.name = char.name;
        participant.portrait = char.portrait;
        participant.speed = char.speed;
        
        // Update tiles with new data
        this.tiles.forEach(tile => {
          if (tile.characterId === char.id) {
            tile.name = char.name;
            tile.portrait = char.portrait;
          }
        });
      }
    }
    
    this.notifyChange();
  }

  // ===========================================
  // REQUIRED METHODS
  // ===========================================

  getTimeline(): TimelineGroup[] {
    return this.tiles.map((tile, index) => ({
      id: `group_${tile.id}`, // Use tile id for stable group tracking
      tiles: [{
        ...tile,
        isScripted: index < this.scriptedCount, // Mark if this tile is scripted
      }],
      team: tile.team,
    }));
  }

  getCharacters(): CharacterOption[] {
    return this.allCharacters.map((c) => ({
      id: c.id,
      name: c.name,
      portrait: c.portrait,
      speed: c.speed,
      turn: this.participants.get(c.id)?.nextTurn ?? 1,
      isInBattle: this.participants.has(c.id),
      team: this.participants.get(c.id)?.team,
    }));
  }

  onAddCharacter(characterId: string): void {
    console.log('[BATTLE ENGINE] onAddCharacter called:', characterId);
    
    const char = this.allCharacters.find((c) => c.id === characterId);
    if (!char || this.participants.has(characterId)) {
      console.log('[BATTLE ENGINE] Character not found or already in battle');
      return;
    }

    console.log('[BATTLE ENGINE] Adding character:', char.name, 'speed:', char.speed);
    
    // Add to participants starting at turn 1
    this.participants.set(characterId, {
      characterId,
      name: char.name,
      portrait: char.portrait,
      team: 'blue',
      speed: char.speed,
      nextTurn: 1,
    });

    // Rebuild timeline from scratch
    this.rebuildTimeline();
    
    console.log('[BATTLE ENGINE] After rebuildTimeline, tiles:', this.tiles.length);
    
    // Persist to world store
    this.saveToWorldStore();
  }

  onRemoveCharacter(characterId: string): void {
    this.participants.delete(characterId);

    // Remove this character's tiles
    this.tiles = this.tiles.filter((t) => t.characterId !== characterId);

    // Refill if needed
    this.fillTimeline();
    this.notifyChange();
    
    // Persist to world store
    this.saveToWorldStore();
  }

  onNextTurn(): void {
    console.log('[BATTLE ENGINE] onNextTurn called, tiles.length =', this.tiles.length);
    
    if (this.tiles.length === 0) {
      console.log('[BATTLE ENGINE] No tiles, skipping next turn');
      return;
    }

    // Remove the first tile (current turn)
    const completedTile = this.tiles.shift()!;
    console.log('[BATTLE ENGINE] Completed turn for:', completedTile.name);

    // If we consumed a scripted tile, decrement the count
    if (this.scriptedCount > 0) {
      this.scriptedCount--;
    }

    // Update that character's next turn number
    const participant = this.participants.get(completedTile.characterId);
    if (participant) {
      // Always advance past the completed turn
      participant.nextTurn = Math.max(participant.nextTurn, completedTile.turn + 1);
    }

    // Fill timeline back to 10 tiles
    this.appendCalculatedTiles();
    this.notifyChange();
    
    // Persist to world store
    this.saveToWorldStore();
  }

  /** Append calculated tiles to fill timeline to 10, without touching existing tiles */
  private appendCalculatedTiles(): void {
    if (this.participants.size === 0) return;

    while (this.tiles.length < 10) {
      // Find which character should go next (lowest timing for their next turn)
      let bestParticipant: Participant | undefined;
      let bestTiming = Infinity;
      let bestTurn = 0;

      for (const participant of this.participants.values()) {
        const turn = participant.nextTurn;
        const timing = this.calculateTiming(turn, participant.speed);

        if (timing < bestTiming) {
          bestTiming = timing;
          bestParticipant = participant;
          bestTurn = turn;
        }
      }

      if (!bestParticipant) break;

      const newTile: TimelineTile = {
        id: `${bestParticipant.characterId}_turn_${bestTurn}`,
        characterId: bestParticipant.characterId,
        name: bestParticipant.name,
        portrait: bestParticipant.portrait,
        team: bestParticipant.team,
        turn: bestTurn,
        timing: bestTiming,
      };

      this.tiles.push(newTile);
      bestParticipant.nextTurn = bestTurn + 1;
    }
  }

  onResetBattle(): void {
    this.participants.clear();
    this.tiles = [];
    this.scriptedCount = 0;
    this.notifyChange();
    
    // Persist to world store
    this.saveToWorldStore();
  }

  onTeamChange(characterId: string, team: string): void {
    const participant = this.participants.get(characterId);
    if (participant) {
      participant.team = team;

      // Update all tiles for this character
      this.tiles.forEach((tile) => {
        if (tile.characterId === characterId) {
          tile.team = team;
        }
      });

      this.notifyChange();
      
      // Persist to world store
      this.saveToWorldStore();
    }
  }

  onTileDrop(tileId: string, targetGroupIndex: number, position: 'before' | 'after'): void {
    console.log('[BATTLE ENGINE] onTileDrop called:', { tileId, targetGroupIndex, position, tilesLength: this.tiles.length });
    
    const tileIndex = this.tiles.findIndex((t) => t.id === tileId);
    if (tileIndex === -1) {
      console.log('[BATTLE ENGINE] Tile not found:', tileId);
      return;
    }

    const draggedTile = this.tiles[tileIndex];
    const draggedCharId = draggedTile.characterId;
    console.log('[BATTLE ENGINE] Dragged tile:', draggedTile.name, 'from index', tileIndex);

    // Calculate target position in tiles array
    let targetIndex = targetGroupIndex;
    if (position === 'after') {
      targetIndex++;
    }

    // Can't drop before current position (no going backwards in time)
    if (targetIndex <= tileIndex) {
      console.log('[BATTLE ENGINE] Cannot drop before current position');
      this.notifyChange();
      return;
    }

    // Step 1: Remove ALL tiles for the dragged character from the timeline
    const otherTiles = this.tiles.filter((t) => t.characterId !== draggedCharId);

    // Step 2: Figure out where to insert relative to other characters' tiles
    let insertAt = 0;
    let originalIndex = 0;
    for (let i = 0; i < this.tiles.length && originalIndex < targetIndex; i++) {
      if (this.tiles[i].characterId !== draggedCharId) {
        insertAt++;
      }
      originalIndex++;
    }

    // Step 3: Create new tile for the dragged character at the insert point
    const participant = this.participants.get(draggedCharId);
    if (!participant) {
      this.notifyChange();
      return;
    }

    const newTurn = participant.nextTurn;
    const newTile: TimelineTile = {
      id: `${draggedCharId}_turn_${newTurn}`,
      characterId: draggedCharId,
      name: participant.name,
      portrait: participant.portrait,
      team: participant.team,
      turn: newTurn,
      timing: 0, // Timing doesn't matter for scripted tiles
    };

    // Step 4: Build the scripted portion - everything up to and including the dropped tile
    const scriptedTiles = [
      ...otherTiles.slice(0, insertAt),
      newTile,
    ];

    // Step 5: This becomes our new scripted count
    this.scriptedCount = scriptedTiles.length;

    // Step 6: Update the participant's next turn
    participant.nextTurn = newTurn + 1;

    // Step 7: Set tiles to just the scripted portion, then rebuild calculated
    this.tiles = scriptedTiles;
    this.rebuildCalculatedPortion();

    this.notifyChange();
    
    // Persist to world store
    this.saveToWorldStore();
  }

  /** Rebuild the calculated portion of the timeline (everything after scriptedCount) */
  private rebuildCalculatedPortion(): void {
    if (this.participants.size === 0) return;

    // Keep only the scripted tiles
    this.tiles = this.tiles.slice(0, this.scriptedCount);

    // Sync nextTurn for each participant based on scripted tiles
    for (const participant of this.participants.values()) {
      const maxTurnInScripted = this.tiles
        .filter(t => t.characterId === participant.characterId)
        .reduce((max, t) => Math.max(max, t.turn), 0);

      if (maxTurnInScripted >= participant.nextTurn) {
        participant.nextTurn = maxTurnInScripted + 1;
      }
    }

    // Generate calculated tiles until we have 10 total
    while (this.tiles.length < 10) {
      // Find which character should go next (lowest timing for their next turn)
      let bestParticipant: Participant | undefined;
      let bestTiming = Infinity;
      let bestTurn = 0;

      for (const participant of this.participants.values()) {
        const turn = participant.nextTurn;
        const timing = this.calculateTiming(turn, participant.speed);

        if (timing < bestTiming) {
          bestTiming = timing;
          bestParticipant = participant;
          bestTurn = turn;
        }
      }

      if (!bestParticipant) break;

      const newTile: TimelineTile = {
        id: `${bestParticipant.characterId}_turn_${bestTurn}`,
        characterId: bestParticipant.characterId,
        name: bestParticipant.name,
        portrait: bestParticipant.portrait,
        team: bestParticipant.team,
        turn: bestTurn,
        timing: bestTiming,
      };

      this.tiles.push(newTile);
      bestParticipant.nextTurn = bestTurn + 1;
    }
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

  /**
   * Build the initial timeline respecting saved order for the first round.
   * First round tiles are in saved order, subsequent rounds based on speed.
   */
  private buildInitialTimeline(orderedParticipants: BattleParticipant[]): void {
    if (orderedParticipants.length === 0) return;
    
    // First, add turn 1 for each participant in the saved order
    let baseTiming = 0;
    for (const bp of orderedParticipants) {
      const participant = this.participants.get(bp.characterId);
      if (!participant) continue;
      
      this.tiles.push({
        id: `${bp.characterId}_turn_1`,
        characterId: bp.characterId,
        name: bp.name,
        portrait: bp.portrait,
        team: bp.team || 'blue',
        turn: 1,
        timing: baseTiming++, // Use incrementing timing to preserve order
      });
      
      participant.nextTurn = 2; // Next turn for this character is 2
    }
    
    // Now fill remaining slots based on speed
    while (this.tiles.length < 10) {
      let bestParticipant: Participant | undefined;
      let bestTiming = Infinity;
      let bestTurn = 0;
      
      for (const participant of this.participants.values()) {
        const turn = participant.nextTurn;
        const timing = this.calculateTiming(turn, participant.speed);
        
        if (timing < bestTiming) {
          bestTiming = timing;
          bestParticipant = participant;
          bestTurn = turn;
        }
      }
      
      if (!bestParticipant) break;
      
      this.tiles.push({
        id: `${bestParticipant.characterId}_turn_${bestTurn}`,
        characterId: bestParticipant.characterId,
        name: bestParticipant.name,
        portrait: bestParticipant.portrait,
        team: bestParticipant.team,
        turn: bestTurn,
        timing: 1000 + bestTiming, // Offset to ensure they come after first round
      });
      
      bestParticipant.nextTurn = bestTurn + 1;
    }
    
    // Sort by timing to get final order
    this.tiles.sort((a, b) => a.timing - b.timing);
  }

  /** Rebuild the entire timeline from scratch */
  private rebuildTimeline(): void {
    this.tiles = [];

    // Reset all participants to turn 1
    this.participants.forEach((p) => {
      p.nextTurn = 1;
    });

    this.fillTimeline();
    this.notifyChange();
  }

  /** Fill the timeline to have at least 10 tiles */
  private fillTimeline(): void {
    if (this.participants.size === 0) return;

    // Create a working copy of turn numbers
    const turnNumbers = new Map<string, number>();
    this.participants.forEach((p, id) => {
      turnNumbers.set(id, p.nextTurn);
    });

    // Account for existing tiles
    this.tiles.forEach((tile) => {
      const current = turnNumbers.get(tile.characterId);
      if (current !== undefined && tile.turn >= current) {
        turnNumbers.set(tile.characterId, tile.turn + 1);
      }
    });

    // Generate tiles until we have 10
    while (this.tiles.length < 10) {
      const nextTile = this.generateNextTile(turnNumbers);
      if (!nextTile) break;
      this.tiles.push(nextTile);
    }

    // Sort by timing
    this.tiles.sort((a, b) => a.timing - b.timing);
  }

  /** Generate the next tile based on who has the lowest timing */
  private generateNextTile(turnNumbers: Map<string, number>): TimelineTile | null {
    let bestParticipant: Participant | undefined;
    let bestTiming = Infinity;
    let bestTurn = 0;

    for (const participant of this.participants.values()) {
      const turn = turnNumbers.get(participant.characterId) ?? 1;
      const timing = this.calculateTiming(turn, participant.speed);

      if (timing < bestTiming) {
        bestTiming = timing;
        bestParticipant = participant;
        bestTurn = turn;
      }
    }

    if (!bestParticipant) return null;

    const tile: TimelineTile = {
      id: `${bestParticipant.characterId}_turn_${bestTurn}`,
      characterId: bestParticipant.characterId,
      name: bestParticipant.name,
      portrait: bestParticipant.portrait,
      team: bestParticipant.team,
      turn: bestTurn,
      timing: bestTiming,
    };

    // Increment the turn counter for this character
    turnNumbers.set(bestParticipant.characterId, bestTurn + 1);

    return tile;
  }

  /** Calculate timing for a given turn and speed */
  private calculateTiming(turn: number, speed: number): number {
    return (turn * 1000) / speed;
  }
}
