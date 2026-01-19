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

    // Calculate target position in tiles array
    let targetIndex = targetGroupIndex;
    if (position === 'after') {
      targetIndex++;
    }

    // Adjust for removal
    if (tileIndex < targetIndex) {
      targetIndex--;
    }

    // Remove dragged tile
    this.tiles.splice(tileIndex, 1);

    // Insert at new position
    this.tiles.splice(targetIndex, 0, draggedTile);

    // Remove earlier occurrences of this character (before the dropped position)
    const newPosition = this.tiles.findIndex((t) => t.id === tileId);
    this.tiles = this.tiles.filter((t, i) => {
      // Keep the dragged tile
      if (t.id === tileId) return true;
      // Remove same-character tiles that come before it
      if (t.characterId === draggedTile.characterId && i < newPosition) return false;
      return true;
    });

    // Recalculate position after filtering
    const finalPosition = this.tiles.findIndex((t) => t.id === tileId);

    // Truncate everything after the dropped tile and rebuild
    this.tiles = this.tiles.slice(0, finalPosition + 1);

    // Sync participant turn numbers based on remaining tiles
    this.syncTurnNumbers();

    // Refill the timeline
    this.fillTimeline();
    this.notifyChange();
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

  /** Sync participant nextTurn values based on existing tiles */
  private syncTurnNumbers(): void {
    // Find the highest turn number for each character in existing tiles
    const maxTurns = new Map<string, number>();

    this.tiles.forEach((tile) => {
      const current = maxTurns.get(tile.characterId) ?? 0;
      if (tile.turn > current) {
        maxTurns.set(tile.characterId, tile.turn);
      }
    });

    // Set nextTurn to maxTurn + 1 for each participant
    this.participants.forEach((participant, id) => {
      const maxTurn = maxTurns.get(id);
      if (maxTurn !== undefined) {
        participant.nextTurn = maxTurn + 1;
      } else {
        // Character has no tiles, start from 1
        participant.nextTurn = 1;
      }
    });
  }
}
