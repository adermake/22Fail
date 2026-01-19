/**
 * Battle Timeline Engine Interface
 *
 * YOU implement this interface with your game logic.
 * The UI component will call these methods and display the results.
 *
 * The timeline displays "tiles" that can be dragged anywhere.
 * Each tile represents a turn in the battle order.
 */

/**
 * A single tile in the timeline (one turn)
 */
export interface TimelineTile {
  id: string;           // Unique ID for this tile (e.g., "char1_turn_0")
  characterId: string;  // Which character this turn belongs to
  name: string;         // Display name
  portrait?: string;    // Optional portrait URL
  timing: number;
  team: string;         // Team color: 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange'
  // Add any extra data you need - the UI won't touch it
  [key: string]: any;
}

/**
 * A group of tiles (for visual grouping, e.g., same-team simultaneous turns)
 */
export interface TimelineGroup {
  id: string;           // Unique group ID
  tiles: TimelineTile[];
  team: string;         // Dominant team color for border styling
}

/**
 * Result of a drag operation
 */
export interface DragResult {
  tileId: string;       // Which tile was dragged
  fromGroupIndex: number;
  fromTileIndex: number;
  toGroupIndex: number;
  toPosition: 'before' | 'after' | 'into'; // Where relative to target group
}

/**
 * Character option for the character list
 */
export interface CharacterOption {
  id: string;
  name: string;
  portrait?: string;
  speed?: number;       // Optional - display in UI if provided
  turn: number;        // Current turn number
  team?: string;        // Current team if in battle
  isInBattle: boolean;
}

/**
 * ============================================
 * BATTLE TIMELINE ENGINE - IMPLEMENT THIS!
 * ============================================
 *
 * Fill in the methods below. The UI will:
 * - Call getTimeline() to render the turn queue
 * - Call getCharacters() to render the character list
 * - Call your handlers when user interacts
 *
 * After any state change, call engine.notifyChange() to refresh the UI.
 */
export abstract class BattleTimelineEngine {

  // Callback to notify UI of changes - set by component
  private _onChange: (() => void) | null = null;

  /** Call this after any state change to refresh the UI */
  protected notifyChange() {
    if (this._onChange) {
      this._onChange();
    }
  }

  /** @internal Used by component to subscribe to changes */
  _setChangeCallback(callback: () => void) {
    this._onChange = callback;
  }

  // ============================================
  // REQUIRED: Implement these methods
  // ============================================

  /**
   * Return the current timeline as groups of tiles.
   * Called on every render to display the turn queue.
   *
   * Example return:
   * [
   *   { id: 'g0', team: 'blue', tiles: [{ id: 't1', characterId: 'char1', name: 'Hero', team: 'blue' }] },
   *   { id: 'g1', team: 'red', tiles: [{ id: 't2', characterId: 'char2', name: 'Goblin', team: 'red' }] },
   * ]
   */
  abstract getTimeline(): TimelineGroup[];

  /**
   * Return list of available characters for the character panel.
   * Mark isInBattle: true for characters currently in the battle.
   */
  abstract getCharacters(): CharacterOption[];

  /**
   * Called when a tile is dragged and dropped.
   *
   * @param tileId - The ID of the tile that was dragged
   * @param targetGroupIndex - The group index where it was dropped
   * @param position - 'before' or 'after' the target group
   *
   * Update your internal state and call notifyChange().
   */
  abstract onTileDrop(tileId: string, targetGroupIndex: number, position: 'before' | 'after'): void;

  /**
   * Called when user clicks "Add" on a character.
   */
  abstract onAddCharacter(characterId: string): void;

  /**
   * Called when user clicks "Remove" on a character.
   */
  abstract onRemoveCharacter(characterId: string): void;

  /**
   * Called when user clicks "Next Turn".
   */
  abstract onNextTurn(): void;

  /**
   * Called when user clicks "Reset Battle".
   */
  abstract onResetBattle(): void;

  /**
   * Called when user changes a character's team.
   */
  abstract onTeamChange(characterId: string, team: string): void;

  // ============================================
  // OPTIONAL: Override these for extra features
  // ============================================

  /**
   * Available teams for the team selector dropdown.
   * Override to customize.
   */
  getAvailableTeams(): string[] {
    return ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];
  }

  /**
   * Called when drag starts on a tile.
   * Return false to prevent dragging this tile.
   * Default: all tiles are draggable.
   */
  canDragTile(tileId: string): boolean {
    return true;
  }

  /**
   * Called during drag to preview what would happen.
   * Return tile IDs that should visually "fade out" during drag.
   * Useful for showing which future turns would be removed.
   */
  getTilesToFadeOnDrag(draggedTileId: string): string[] {
    return [];
  }

  /**
   * Get display text for the "current turn" indicator.
   * Return null to hide the indicator.
   */
  getCurrentTurnDisplay(): string | null {
    const timeline = this.getTimeline();
    if (timeline.length === 0 || timeline[0].tiles.length === 0) return null;
    return timeline[0].tiles.map(t => t.name).join(', ');
  }
}
