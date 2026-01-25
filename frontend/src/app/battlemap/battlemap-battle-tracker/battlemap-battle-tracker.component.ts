import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WorldStoreService } from '../../services/world-store.service';
import { BattleMapStoreService } from '../../services/battlemap-store.service';
import { WorldData } from '../../model/world.model';

/** Tile for display in the timeline */
interface DisplayTile {
  id: string;
  characterId: string;
  name: string;
  portrait?: string;
  team: string;
  turnNumber: number;
  isScripted: boolean;
}

/** Group of tiles */
interface DisplayGroup {
  id: string;
  tiles: DisplayTile[];
  team: string;
  isScripted: boolean;
}

@Component({
  selector: 'app-battlemap-battle-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battlemap-battle-tracker.component.html',
  styleUrl: './battlemap-battle-tracker.component.css',
})
export class BattlemapBattleTrackerComponent implements OnInit, OnDestroy {
  private worldStore = inject(WorldStoreService);
  private battlemapStore = inject(BattleMapStoreService);
  private subscriptions: Subscription[] = [];

  // Timeline groups for display
  groups: DisplayGroup[] = [];
  currentTurnDisplay: string | null = null;
  
  // Map of characterId -> portrait (from battlemap tokens)
  private portraitMap = new Map<string, string>();

  // Configuration
  private readonly TIMELINE_LENGTH = 12;

  ngOnInit() {
    // Subscribe to world updates
    this.subscriptions.push(
      this.worldStore.world$.subscribe(world => {
        if (world) {
          this.rebuildTimeline(world);
        }
      })
    );
    
    // Subscribe to battlemap updates to get token portraits
    this.subscriptions.push(
      this.battlemapStore.battleMap$.subscribe(() => {
        this.updatePortraitMap();
        // Rebuild timeline when portraits change
        const world = this.worldStore.worldValue;
        if (world) {
          this.rebuildTimeline(world);
        }
      })
    );
  }
  
  private updatePortraitMap() {
    const battlemap = this.battlemapStore.battleMapValue;
    if (!battlemap?.tokens) return;
    
    this.portraitMap.clear();
    for (const token of battlemap.tokens) {
      if (token.portrait && !this.portraitMap.has(token.characterId)) {
        this.portraitMap.set(token.characterId, token.portrait);
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Rebuild the timeline from world data.
   * This mirrors the logic in BattleTrackerEngine but is read-only.
   */
  private rebuildTimeline(world: WorldData) {
    const participants = world.battleParticipants || [];
    if (participants.length === 0) {
      this.groups = [];
      this.currentTurnDisplay = null;
      return;
    }

    // Extract scripted count from first entry
    const first = participants[0];
    const scriptedCount = first.turnFrequency >= 10000 ? first.turnFrequency - 10000 : 0;

    // Sort by nextTurnAt to get order
    const ordered = [...participants].sort((a, b) => a.nextTurnAt - b.nextTurnAt);

    // Build participants map with type annotation
    type ParticipantInfo = {
      characterId: string;
      name: string;
      portrait?: string;
      speed: number;
      team: string;
      currentTurn: number;
    };
    
    const participantMap = new Map<string, ParticipantInfo>();

    for (const bp of ordered) {
      participantMap.set(bp.characterId, {
        characterId: bp.characterId,
        name: bp.name,
        portrait: this.portraitMap.get(bp.characterId) || bp.portrait,
        speed: bp.speed,
        team: bp.team || 'blue',
        currentTurn: 1,
      });
    }

    // Build initial timeline (first round in saved order)
    const tiles: DisplayTile[] = [];
    for (const bp of ordered) {
      const p = participantMap.get(bp.characterId);
      if (p) {
        tiles.push({
          id: `${p.characterId}_t1`, // Content-based ID
          characterId: p.characterId,
          name: p.name,
          portrait: p.portrait,
          team: p.team,
          turnNumber: 1,
          isScripted: tiles.length < scriptedCount,
        });
        p.currentTurn = 2;
      }
    }

    // Fill remaining with calculated tiles (with safety limit)
    const maxIterations = this.TIMELINE_LENGTH * 2;
    let iterations = 0;
    
    while (tiles.length < this.TIMELINE_LENGTH && participantMap.size > 0 && iterations < maxIterations) {
      iterations++;
      let best: { p: ParticipantInfo; timing: number } | null = null;
      
      for (const p of participantMap.values()) {
        const timing = (p.currentTurn * 1000) / Math.max(p.speed, 1);
        if (!best || timing < best.timing) {
          best = { p, timing };
        }
      }

      if (!best) break;

      tiles.push({
        id: `${best.p.characterId}_t${best.p.currentTurn}`, // Content-based ID
        characterId: best.p.characterId,
        name: best.p.name,
        portrait: best.p.portrait,
        team: best.p.team,
        turnNumber: best.p.currentTurn,
        isScripted: tiles.length < scriptedCount,
      });
      best.p.currentTurn++;
    }

    // Sort calculated portion by timing
    const scripted = tiles.slice(0, scriptedCount);
    const calculated = tiles.slice(scriptedCount);
    
    // For calculated tiles, we need to recalculate timing and sort
    const tilesWithTiming = calculated.map(t => {
      const p = participantMap.get(t.characterId);
      return {
        ...t,
        timing: p ? (t.turnNumber * 1000) / Math.max(p.speed, 1) : 0,
      };
    });
    tilesWithTiming.sort((a, b) => a.timing - b.timing);

    const finalTiles = [...scripted, ...tilesWithTiming];

    // Update isScripted flag (but keep IDs unchanged)
    for (let i = 0; i < finalTiles.length; i++) {
      finalTiles[i].isScripted = i < scriptedCount;
    }

    // Group tiles
    this.groups = this.groupTiles(finalTiles, scriptedCount);

    // Set current turn display
    if (this.groups.length > 0) {
      this.currentTurnDisplay = this.groups[0].tiles.map(t => t.name).join(' & ');
    } else {
      this.currentTurnDisplay = null;
    }
  }

  /**
   * Group tiles by team (but not same character)
   */
  private groupTiles(tiles: DisplayTile[], scriptedCount: number): DisplayGroup[] {
    if (tiles.length === 0) return [];

    const groups: DisplayGroup[] = [];
    let currentTiles: DisplayTile[] = [];
    let currentTeam: string | null = null;
    let currentChars = new Set<string>();
    let tileIndex = 0;

    for (const tile of tiles) {
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
          isScripted: groupStartIdx < scriptedCount,
        });
        currentTiles = [];
        currentChars.clear();
      }

      if (needNewGroup) {
        currentTeam = tile.team;
      }

      currentTiles.push(tile);
      currentChars.add(tile.characterId);
      tileIndex++;
    }

    if (currentTiles.length > 0) {
      const startIndex = tiles.length - currentTiles.length;
      groups.push({
        id: `group_${groups.length}`,
        tiles: currentTiles,
        team: currentTeam!,
        isScripted: startIndex < scriptedCount,
      });
    }

    return groups;
  }

  getTeamColor(team: string): string {
    switch (team) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'yellow': return '#eab308';
      case 'purple': return '#a855f7';
      case 'orange': return '#f97316';
      default: return '#60a5fa';
    }
  }

  trackGroup(index: number, group: DisplayGroup): string {
    return group.id;
  }

  trackTile(index: number, tile: DisplayTile): string {
    return tile.id;
  }
}
