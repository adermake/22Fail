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
 */
export class MyBattleEngine extends BattleTimelineEngine {
  // Characters available to add to battle
  private allCharacters: { id: string; name: string; portrait?: string; speed: number }[] = [];

  // Characters currently in battle with their state
  private participants: Map<string, Participant> = new Map();

  // The displayed timeline
  private tiles: TimelineTile[] = [];

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
      tiles: [tile],
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

    // Update that character's next turn number
    const participant = this.participants.get(completedTile.characterId);
    if (participant) {
      participant.nextTurn = completedTile.turn + 1;
    }

    // Generate more tiles to fill the queue
    this.fillTimeline();
    this.notifyChange();
  }

  onResetBattle(): void {
    this.participants.clear();
    this.tiles = [];
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

    // Step 1: Remove ALL tiles for the dragged character
    const otherTiles = this.tiles.filter((t) => t.characterId !== draggedCharId);

    // Step 2: Figure out where to insert relative to other characters' tiles
    // targetIndex was in the original array, we need to find where it maps to in otherTiles
    let insertAt = 0;
    let originalIndex = 0;
    for (let i = 0; i < this.tiles.length && originalIndex < targetIndex; i++) {
      if (this.tiles[i].characterId !== draggedCharId) {
        insertAt++;
      }
      originalIndex++;
    }

    // Step 3: Preserve tiles before the insert point exactly as they are
    const beforeTiles = otherTiles.slice(0, insertAt);
    const afterTiles = otherTiles.slice(insertAt);

    // Step 4: Create new tile for the dragged character at the insert point
    const participant = this.participants.get(draggedCharId);
    if (!participant) {
      this.notifyChange();
      return;
    }

    // Find the highest turn number used by this character in beforeTiles (should be 0)
    // and what turn this new tile should be
    const newTurn = participant.nextTurn;
    const newTile: TimelineTile = {
      id: `${draggedCharId}_turn_${newTurn}`,
      characterId: draggedCharId,
      name: participant.name,
      portrait: participant.portrait,
      team: participant.team,
      turn: newTurn,
      timing: this.calculateTiming(newTurn, participant.speed),
    };

    // Step 5: Build the new timeline - before + dragged + after
    this.tiles = [...beforeTiles, newTile, ...afterTiles];

    // Step 6: Update the participant's next turn
    participant.nextTurn = newTurn + 1;

    // Step 7: Append more tiles for the dragged character to fill timeline
    this.appendTilesForCharacter(draggedCharId);

    this.notifyChange();
  }

  /** Append tiles for a specific character until timeline has enough tiles */
  private appendTilesForCharacter(characterId: string): void {
    const participant = this.participants.get(characterId);
    if (!participant) return;

    // Count existing tiles
    while (this.tiles.length < 10) {
      // Find the right position to insert based on timing
      const turn = participant.nextTurn;
      const timing = this.calculateTiming(turn, participant.speed);

      const newTile: TimelineTile = {
        id: `${characterId}_turn_${turn}`,
        characterId: characterId,
        name: participant.name,
        portrait: participant.portrait,
        team: participant.team,
        turn: turn,
        timing: timing,
      };

      // Find insertion point - after existing tiles, sorted by timing among remaining
      let insertIndex = this.tiles.length;
      for (let i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i].timing > timing) {
          insertIndex = i;
          break;
        }
      }

      this.tiles.splice(insertIndex, 0, newTile);
      participant.nextTurn = turn + 1;
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
