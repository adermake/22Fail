import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WorldStoreService } from '../../services/world-store.service';
import { BattleParticipant, WorldData } from '../../model/world.model';

@Component({
  selector: 'app-battlemap-battle-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './battlemap-battle-tracker.component.html',
  styleUrl: './battlemap-battle-tracker.component.css',
})
export class BattlemapBattleTrackerComponent implements OnInit, OnDestroy {
  private worldStore = inject(WorldStoreService);
  private subscription?: Subscription;

  world: WorldData | null = null;
  participants: BattleParticipant[] = [];
  currentTurnIndex = 0;

  ngOnInit() {
    this.subscription = this.worldStore.world$.subscribe(world => {
      this.world = world;
      this.participants = world?.battleParticipants || [];
      this.currentTurnIndex = world?.currentTurnIndex || 0;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  isCurrentTurn(index: number): boolean {
    return index === this.currentTurnIndex;
  }

  getTeamColor(team?: string): string {
    switch (team) {
      case 'red': return '#ef4444';
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'purple': return '#a855f7';
      default: return '#60a5fa';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getHealthPercent(participant: BattleParticipant): number {
    if (!participant.maxHealth || participant.maxHealth <= 0) return 0;
    const current = participant.currentHealth || 0;
    return Math.round((current / participant.maxHealth) * 100);
  }
}
