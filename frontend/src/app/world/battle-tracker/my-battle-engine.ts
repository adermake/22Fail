import {
  BattleTimelineEngine,
  TimelineGroup,
  TimelineTile,
  CharacterOption,
} from './battle-timeline-engine';

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
 */
export class MyBattleEngine extends BattleTimelineEngine {
  // Characters available to add to battle
  private allCharacters: { id: string; name: string; portrait?: string; speed: number }[] = [];

  // Characters currently in battle with their state
  private participants: Map<string, Participant> = new Map();

  // The displayed timeline (scripted + calculated)
  private tiles: TimelineTile[] = [];

  // How many tiles at the front are "scripted" (locked in)
  private scriptedCount: number = 0;

  // ===========================================
  // SETUP
  // ===========================================

  setAvailableCharacters(
    characters: { id: string; name: string; portrait?: string; speed?: number }[],
  ) {
    this.allCharacters = characters.map((c) => ({
      id: c.id,
      name: c.name,
      portrait: c.portrait,
      speed: c.speed ?? 10,
    }));
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
    const char = this.allCharacters.find((c) => c.id === characterId);
    if (!char || this.participants.has(characterId)) return;

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
  }

  onRemoveCharacter(characterId: string): void {
    this.participants.delete(characterId);

    // Remove this character's tiles
    this.tiles = this.tiles.filter((t) => t.characterId !== characterId);

    // Refill if needed
    this.fillTimeline();
    this.notifyChange();
  }

  onNextTurn(): void {
    if (this.tiles.length === 0) return;

    // Remove the first tile (current turn)
    const completedTile = this.tiles.shift()!;

    // If we consumed a scripted tile, decrement the count
    if (this.scriptedCount > 0) {
      this.scriptedCount--;
    }

    // Update that character's next turn number (only if it would advance)
    const participant = this.participants.get(completedTile.characterId);
    if (participant && completedTile.turn >= participant.nextTurn) {
      participant.nextTurn = completedTile.turn + 1;
    }

    // Regenerate calculated portion of timeline
    this.rebuildCalculatedPortion();
    this.notifyChange();
  }

  onResetBattle(): void {
    this.participants.clear();
    this.tiles = [];
    this.scriptedCount = 0;
    this.notifyChange();
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
    }
  }

  onTileDrop(tileId: string, targetGroupIndex: number, position: 'before' | 'after'): void {
    const tileIndex = this.tiles.findIndex((t) => t.id === tileId);
    if (tileIndex === -1) return;

    const draggedTile = this.tiles[tileIndex];
    const draggedCharId = draggedTile.characterId;

    // Calculate target position in tiles array
    let targetIndex = targetGroupIndex;
    if (position === 'after') {
      targetIndex++;
    }

    // Can't drop before current position (no going backwards in time)
    if (targetIndex <= tileIndex) {
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
