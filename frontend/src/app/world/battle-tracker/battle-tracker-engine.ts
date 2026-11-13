/**
 * Battle Tracker Engine - Turn Meter Simulation System
 * 
 * Core Concept:
 * - Each character has a turn meter from 0 to 1000
 * - Every simulation tick, we add the character's speed to their turn meter
 * - When a character reaches >= 1000, they get a turn tile and their meter resets to (meter - 1000)
 * - If multiple characters reach 1000 in the same tick, the one with higher speed goes first
 * - "Next Turn" may split a tick: whoever is still >= 1000 stays pending and acts at tick 0
 *   of the next simulation, before any speed is added (see simulateTimeline)
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

/** Participant state as the simulation sees it. */
export interface TimelineParticipant {
  characterId: string;
  name: string;
  portrait?: string;
  speed: number;
  team: string;
  /**
   * Current turn meter. Normally 0-999, but may be >= 1000 when the previous turn group ended
   * in the middle of a tick: those characters are "pending" and act first, before any further
   * speed is added. Clamping them to 999 (the old behaviour) threw away their overshoot and
   * let faster characters overtake them — the rare "ally suddenly joins the group" glitch.
   */
  turnMeter: number;
  /** Turns already taken this battle. Gives tiles a stable identity across advances. */
  turnsTaken: number;
}

type Participant = TimelineParticipant;

/** Simulation state for a character during timeline calculation */
interface SimState {
  p: TimelineParticipant;
  speed: number;
  meter: number;
  /** How many turns this character has taken in this simulation */
  turnsTaken: number;
}

// ============================================
// Constants
// ============================================

const TURN_METER_MAX = 1000;
const TIMELINE_LENGTH = 15;
/** Base speed added to all characters to reduce speed variance impact */
const BASE_SPEED = 25;
/** How far ahead the deviation detector predicts. */
export const PREDICTION_LENGTH = 1000;

// ============================================
// Pure simulation
// ============================================

/** Effective per-tick meter gain. Floored at 1 so a huge speed malus can't stall the loop. */
function effectiveSpeed(speed: number): number {
  return Math.max(1, speed + BASE_SPEED);
}

/** Stable tile id: the n-th turn of this character in the whole battle. */
export function tileId(characterId: string, absoluteTurn: number): string {
  return `${characterId}#${absoluteTurn}`;
}

/**
 * Simulate `count` upcoming turns from the given state. Returns the tiles and the meters right
 * after the last emitted tile, which is exactly the state to persist after consuming them.
 *
 * Tick 0 has no speed added: it only releases characters still pending (meter >= 1000) from
 * a tick that was split by the previous advance. Within a tick: higher speed first, then higher
 * meter, then characterId so the order never depends on Map/array order.
 */
export function simulateTimeline(
  participants: readonly TimelineParticipant[],
  count: number,
): { tiles: TurnTile[]; meters: Map<string, number> } {
  const states: SimState[] = participants.map(p => ({
    p,
    speed: effectiveSpeed(p.speed),
    meter: p.turnMeter,
    turnsTaken: 0,
  }));
  const tiles: TurnTile[] = [];

  if (states.length > 0 && count > 0) {
    const minSpeed = Math.min(...states.map(s => s.speed));
    // Enough ticks for every requested tile even if only the slowest character existed.
    const maxTicks = Math.ceil(((count + 1) * TURN_METER_MAX) / minSpeed) + 1;

    outer: for (let tick = 0; tick <= maxTicks; tick++) {
      if (tick > 0) {
        for (const s of states) s.meter += s.speed;
      }

      const triggered = states.filter(s => s.meter >= TURN_METER_MAX);
      if (triggered.length === 0) continue;

      triggered.sort((a, b) => {
        if (b.speed !== a.speed) return b.speed - a.speed;
        if (b.meter !== a.meter) return b.meter - a.meter;
        return a.p.characterId < b.p.characterId ? -1 : a.p.characterId > b.p.characterId ? 1 : 0;
      });

      for (const s of triggered) {
        s.turnsTaken++;
        tiles.push({
          id: tileId(s.p.characterId, s.p.turnsTaken + s.turnsTaken),
          characterId: s.p.characterId,
          name: s.p.name,
          portrait: s.p.portrait,
          team: s.p.team,
          speed: s.speed,
          turnNumber: s.turnsTaken,
          simulationTick: tick,
          meterAtTurn: s.meter,
        });
        s.meter -= TURN_METER_MAX;
        if (tiles.length >= count) break outer;
      }
    }
  }

  const meters = new Map<string, number>();
  for (const s of states) meters.set(s.p.characterId, s.meter);
  return { tiles, meters };
}

/**
 * Group tiles by team (adjacent tiles of same team, but different characters).
 * Group ids derive from the first tile so they stay stable while the timeline shifts.
 */
export function groupTiles(tiles: readonly TurnTile[]): TurnGroup[] {
  const groups: TurnGroup[] = [];
  let current: TurnTile[] = [];
  const chars = new Set<string>();

  const flush = () => {
    if (current.length === 0) return;
    groups.push({ id: `g_${current[0].id}`, tiles: current, team: current[0].team });
    current = [];
    chars.clear();
  };

  for (const tile of tiles) {
    if (current.length > 0 && (tile.team !== current[0].team || chars.has(tile.characterId))) {
      flush();
    }
    current.push(tile);
    chars.add(tile.characterId);
  }
  flush();
  return groups;
}

/**
 * Consume the first turn group. Replays the exact same simulation for that many tiles and keeps
 * the resulting meters — no separate re-implementation that could drift from it, and no
 * clamping, so characters left pending in a split tick keep their place.
 */
export function advanceTimeline(participants: readonly TimelineParticipant[]): {
  consumed: TurnTile[];
  participants: TimelineParticipant[];
} {
  const groups = groupTiles(simulateTimeline(participants, TIMELINE_LENGTH).tiles);
  if (groups.length === 0) return { consumed: [], participants: participants.map(p => ({ ...p })) };
  const consumed = groups[0].tiles;
  const { meters } = simulateTimeline(participants, consumed.length);
  const acted = new Set(consumed.map(t => t.characterId));
  return {
    consumed,
    participants: participants.map(p => ({
      ...p,
      turnMeter: Math.max(0, meters.get(p.characterId) ?? p.turnMeter),
      turnsTaken: p.turnsTaken + (acted.has(p.characterId) ? 1 : 0),
    })),
  };
}

// ============================================
// Deviation detector
// ============================================

export interface TimelineDeviation {
  time: string;
  /** Index into the expected sequence where the first mismatch happened. */
  mismatchAt: number;
  /** How many tiles were consumed between the two predictions (0 = no advance). */
  consumed: number;
  expected: string[];
  actual: string[];
  before: { name: string; speed: number; meter: number; turnsTaken: number; team: string }[];
  after: { name: string; speed: number; meter: number; turnsTaken: number; team: string }[];
}

interface PredictionSnapshot {
  ids: string[];
  names: Map<string, string>;
  /** Tile counts at each group boundary of the visible timeline — valid advance sizes. */
  groupBoundaries: Set<number>;
  roster: string;
  participants: TimelineDeviation['before'];
}

const DEVIATION_LOG_LIMIT = 50;
/** Every unexplained timeline change, newest last. Also exposed as `window.__kampfDiagnose`. */
export const timelineDeviations: TimelineDeviation[] = [];
(globalThis as { __kampfDiagnose?: TimelineDeviation[] }).__kampfDiagnose = timelineDeviations;

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
        turnsTaken: bp.currentTurn ?? 0,
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

    // Rebuild participants.
    // Prefer the LIVE character speed over the persisted bp.speed: the saved value is a
    // snapshot from when the participant was added, so preferring it froze the turn order
    // and speed changes (status effects, equipment) never sped anyone up. Both callers
    // (lobby + world) now supply a properly computed effective speed; bp.speed is only a
    // fallback for participants with no matching character (e.g. NPC-only entries).
    this.participants.clear();
    for (const bp of saved) {
      const char = this.allCharacters.get(bp.characterId);
      this.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: char?.name || bp.name,
        portrait: char?.portrait,
        speed: char?.speed ?? bp.speed ?? 10,
        team: bp.team || 'blue',
        turnMeter: bp.turnFrequency ?? 0,
        turnsTaken: bp.currentTurn ?? 0,
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
        // Turns taken so far — gives timeline tiles a stable id on every client (animations,
        // deviation detector).
        currentTurn: p.turnsTaken,
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

  private simulate(count: number) {
    return simulateTimeline([...this.participants.values()], count);
  }

  /** Consume the first turn group (see advanceTimeline). */
  private advanceToNextTurn(): void {
    const { participants } = advanceTimeline([...this.participants.values()]);
    for (const p of participants) this.participants.set(p.characterId, p);
  }

  // ============================================
  // Public API - Queries
  // ============================================

  /** Get the timeline as groups for display */
  getTimeline(): TurnGroup[] {
    return groupTiles(this.simulate(TIMELINE_LENGTH).tiles);
  }

  /** Get flat tile list (for animations) */
  getTiles(): TurnTile[] {
    return this.simulate(TIMELINE_LENGTH).tiles;
  }

  // ============================================
  // Deviation detector
  // ============================================

  private lastPrediction: PredictionSnapshot | null = null;
  /** Set by local edits that legitimately reshuffle the timeline (meter drag, reset). */
  private expectReshuffle = false;

  private snapshotParticipants(): TimelineDeviation['before'] {
    return [...this.participants.values()].map(p => ({
      name: p.name,
      speed: p.speed,
      meter: p.turnMeter,
      turnsTaken: p.turnsTaken,
      team: p.team,
    }));
  }

  /**
   * Predict the next PREDICTION_LENGTH turns and compare with the previous prediction. With an
   * unchanged roster (same participants + speeds) the only legal change is "the first k tiles
   * were consumed, k on a group boundary". Anything else is logged as a deviation.
   * Roster/speed changes and local manual edits just reset the baseline.
   */
  private checkPrediction(): void {
    const tiles = this.simulate(PREDICTION_LENGTH).tiles;
    const roster = [...this.participants.values()]
      .map(p => `${p.characterId}:${p.speed}`)
      .sort()
      .join('|');
    const groupBoundaries = new Set<number>([0]);
    let acc = 0;
    for (const g of groupTiles(tiles)) {
      acc += g.tiles.length;
      groupBoundaries.add(acc);
    }
    const next: PredictionSnapshot = {
      ids: tiles.map(t => t.id),
      names: new Map(tiles.map(t => [t.id, t.name])),
      groupBoundaries,
      roster,
      participants: this.snapshotParticipants(),
    };

    const prev = this.lastPrediction;
    this.lastPrediction = next;
    const reshuffle = this.expectReshuffle;
    this.expectReshuffle = false;
    if (!prev || reshuffle || prev.roster !== roster || prev.ids.length === 0) return;

    const k = next.ids.length > 0 ? prev.ids.indexOf(next.ids[0]) : -1;
    let mismatchAt = -1;
    if (k < 0 || !prev.groupBoundaries.has(k)) {
      mismatchAt = 0;
    } else {
      const overlap = Math.min(prev.ids.length - k, next.ids.length);
      for (let i = 0; i < overlap; i++) {
        if (prev.ids[k + i] !== next.ids[i]) {
          mismatchAt = i;
          break;
        }
      }
    }
    if (mismatchAt < 0) return;

    const base = Math.max(0, k);
    const from = Math.max(0, mismatchAt - 3);
    const name = (snap: PredictionSnapshot, id: string | undefined) =>
      id === undefined ? '-' : `${snap.names.get(id) ?? '?'}(${id.split('#')[1]})`;
    const deviation: TimelineDeviation = {
      time: new Date().toISOString(),
      mismatchAt,
      consumed: k,
      expected: prev.ids.slice(base + from, base + from + 12).map(id => name(prev, id)),
      actual: next.ids.slice(from, from + 12).map(id => name(next, id)),
      before: prev.participants,
      after: next.participants,
    };
    timelineDeviations.push(deviation);
    if (timelineDeviations.length > DEVIATION_LOG_LIMIT) timelineDeviations.shift();
    console.warn(
      `[Kampf-Diagnose] Zeitleiste weicht ab (Index ${mismatchAt}, ${k} Züge verbraucht).\n` +
        `  erwartet: ${deviation.expected.join(' → ')}\n` +
        `  tatsächlich: ${deviation.actual.join(' → ')}\n` +
        `  Alle Abweichungen: window.__kampfDiagnose`,
      deviation,
    );
  }

  /** Get characters for the character list */
  getCharacters(): BattleCharacter[] {
    const result = new Map<string, BattleCharacter>();

    // Base list from available characters (party, etc.)
    for (const [id, char] of this.allCharacters) {
      const participant = this.participants.get(id);
      result.set(id, {
        id,
        name: participant?.name || char.name,
        portrait: participant?.portrait || char.portrait,
        speed: participant?.speed ?? char.speed,
        team: participant?.team || 'blue',
        isInBattle: !!participant,
        turnMeter: participant?.turnMeter ?? 0,
      });
    }

    // Ensure participants that are not in allCharacters (e.g. NPC tokens) are included.
    for (const [id, participant] of this.participants) {
      if (result.has(id)) continue;
      result.set(id, {
        id,
        name: participant.name,
        portrait: participant.portrait,
        speed: participant.speed,
        team: participant.team,
        isInBattle: true,
        turnMeter: participant.turnMeter,
      });
    }

    const ordered = Array.from(result.values());
    ordered.sort((a, b) => {
      if (a.isInBattle !== b.isInBattle) return a.isInBattle ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return ordered;
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

  /** Character IDs in the current (first) turn group. */
  getCurrentTurnCharacterIds(): string[] {
    const groups = this.getTimeline();
    if (groups.length === 0) return [];
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const tile of groups[0].tiles) {
      if (!seen.has(tile.characterId)) {
        seen.add(tile.characterId);
        ids.push(tile.characterId);
      }
    }
    return ids;
  }

  /**
   * Current turn group straight from persisted `world.battleParticipants`, for views that
   * don't run a tracker (the sheet's turn glow). Uses the saved speed snapshot.
   */
  static currentTurnIdsFromSaved(saved: BattleParticipant[] | undefined | null): string[] {
    if (!saved?.length) return [];
    const engine = new BattleTrackerEngine();
    for (const bp of saved) {
      engine.participants.set(bp.characterId, {
        characterId: bp.characterId,
        name: bp.name,
        speed: bp.speed ?? 10,
        team: bp.team || 'blue',
        turnMeter: bp.turnFrequency ?? 0,
        turnsTaken: bp.currentTurn ?? 0,
      });
    }
    return engine.getCurrentTurnCharacterIds();
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
  /**
   * Register a character in the available-characters map without adding to battle.
   * Used for NPC tokens that aren't loaded via setAvailableCharacters.
   */
  registerCharacter(id: string, data: { name: string; portrait?: string; speed: number }): void {
    if (!this.allCharacters.has(id)) {
      this.allCharacters.set(id, { id, ...data });
      this.notifyChange();
    }
  }

  addCharacter(characterId: string): void {
    const char = this.allCharacters.get(characterId);
    if (!char || this.participants.has(characterId)) return;

    this.participants.set(characterId, {
      characterId,
      name: char.name,
      portrait: char.portrait,
      speed: char.speed,
      team: 'blue',
      // Random start so equal-speed combatants don't tick in lockstep and clump into
      // one big group turn every cycle. Same speed keeps the offset stable afterwards.
      turnMeter: Math.floor(Math.random() * TURN_METER_MAX),
      turnsTaken: 0,
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
    this.expectReshuffle = true;
    this.notifyChange();
    this.saveToWorldStore();
  }

  /** Set turn meter immediately without triggering animations (for drag) */
  setTurnMeterImmediate(characterId: string, value: number): void {
    const participant = this.participants.get(characterId);
    if (!participant) return;

    // Clamp to valid range
    participant.turnMeter = Math.max(0, Math.min(value, TURN_METER_MAX - 1));
    // Only update local state, no save - that's handled by saveTurnMeter
    this.expectReshuffle = true;
    this.notifyChange();
  }

  /** Save turn meter to world store (debounced call from UI) */
  saveTurnMeter(characterId: string, value: number): void {
    const participant = this.participants.get(characterId);
    if (!participant) return;

    participant.turnMeter = Math.max(0, Math.min(value, TURN_METER_MAX - 1));
    this.saveToWorldStore();
  }

  /** Advance to the next turn - consumes the first group */
  nextTurn(): void {
    if (this.participants.size === 0) return;

    this.advanceToNextTurn();
    this.notifyChange();
    this.saveToWorldStore();
    // Only the client that pressed "Nächster Zug" runs this, so turn-start effects (spell upkeep,
    // round counters) are applied exactly once and then sync like any other patch.
    this.onTurnStart?.(this.getCurrentTurnCharacterIds());
  }

  private onTurnStart: ((characterIds: string[]) => void) | null = null;

  /** Called with the ids whose turn just began, after a local `nextTurn()`. */
  setTurnStartCallback(callback: ((characterIds: string[]) => void) | null): void {
    this.onTurnStart = callback;
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
    this.expectReshuffle = true;
    this.notifyChange();
    this.saveToWorldStore();
  }

  // ============================================
  // Private
  // ============================================

  private notifyChange(): void {
    this.checkPrediction();
    if (this.onChange) {
      this.onChange();
    }
  }
}
