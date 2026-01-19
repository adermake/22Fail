import { BattleTimelineEngine, TimelineGroup, TimelineTile, CharacterOption } from './battle-timeline-engine';

/**
 * Your Battle Engine Implementation
 *
 * Fill in the methods below with your game logic.
 * The UI will call these methods and display the results.
 */
export class MyBattleEngine extends BattleTimelineEngine {

  // ===========================================
  // YOUR STATE - store your data here
  // ===========================================

  private participants: Map<string, {
    characterId: string;
    name: string;
    portrait?: string;
    team: string;
    speed: number;
    // Add whatever else you need...
  }> = new Map();

  private allCharacters: CharacterOption[] = [];

  // The timeline - array of tiles in order
  private tiles: TimelineTile[] = [];

  // ===========================================
  // SETUP - call this to initialize characters
  // ===========================================

  setAvailableCharacters(characters: { id: string; name: string; portrait?: string; speed?: number }[]) {
    this.allCharacters = characters.map(c => ({
      id: c.id,
      name: c.name,
      portrait: c.portrait,
      speed: c.speed,
      isInBattle: this.participants.has(c.id),
      team: this.participants.get(c.id)?.team
    }));
    this.notifyChange();
  }

  // ===========================================
  // REQUIRED METHODS - Implement your logic
  // ===========================================

  getTimeline(): TimelineGroup[] {
    // TODO: Return your timeline as groups
    // For now, each tile is its own group
    return this.tiles.map((tile, index) => ({
      id: `group_${index}`,
      tiles: [tile],
      team: tile.team
    }));
  }

  getCharacters(): CharacterOption[] {
    // Update isInBattle status
    return this.allCharacters.map(c => ({
      ...c,
      isInBattle: this.participants.has(c.id),
      team: this.participants.get(c.id)?.team
    }));
  }

  onTileDrop(tileId: string, targetGroupIndex: number, position: 'before' | 'after'): void {
    // TODO: Implement your reorder logic

    // Find the tile being dragged
    const tileIndex = this.tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return;

    // Remove from current position
    const [tile] = this.tiles.splice(tileIndex, 1);

    // Calculate new index
    let newIndex = targetGroupIndex;
    if (position === 'after') {
      newIndex++;
    }
    // Adjust if we removed from before the target
    if (tileIndex < newIndex) {
      newIndex--;
    }

    // Insert at new position
    this.tiles.splice(newIndex, 0, tile);

    this.notifyChange();
  }

  onAddCharacter(characterId: string): void {
    const char = this.allCharacters.find(c => c.id === characterId);
    if (!char || this.participants.has(characterId)) return;

    // Add to participants
    this.participants.set(characterId, {
      characterId,
      name: char.name,
      portrait: char.portrait,
      team: 'blue', // Default team
      speed: char.speed ?? 10
    });

    // Add a tile for this character
    this.tiles.push({
      id: `${characterId}_turn_0`,
      characterId,
      name: char.name,
      portrait: char.portrait,
      team: 'blue'
    });

    this.notifyChange();
  }

  onRemoveCharacter(characterId: string): void {
    this.participants.delete(characterId);

    // Remove all tiles for this character
    this.tiles = this.tiles.filter(t => t.characterId !== characterId);

    this.notifyChange();
  }

  onNextTurn(): void {
    // TODO: Implement your turn advancement logic
    // Example: move first tile to end
    if (this.tiles.length > 0) {
      const first = this.tiles.shift()!;
      this.tiles.push(first);
      this.notifyChange();
    }
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

      // Update tiles for this character
      this.tiles.forEach(tile => {
        if (tile.characterId === characterId) {
          tile.team = team;
        }
      });

      this.notifyChange();
    }
  }

  // ===========================================
  // OPTIONAL OVERRIDES
  // ===========================================

  // Return false to prevent dragging specific tiles
  // canDragTile(tileId: string): boolean {
  //   return true;
  // }

  // Return tile IDs that should fade during drag
  // getTilesToFadeOnDrag(draggedTileId: string): string[] {
  //   return [];
  // }

  // Customize the "Current Turn" display
  // getCurrentTurnDisplay(): string | null {
  //   if (this.tiles.length === 0) return null;
  //   return this.tiles[0].name;
  // }
}
