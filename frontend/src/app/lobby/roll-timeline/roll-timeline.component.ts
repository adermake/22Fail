/**
 * Roll Timeline Component
 * 
 * Displays a history of dice rolls in the lobby.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceRollEvent } from '../../services/world-socket.service';

@Component({
  selector: 'app-roll-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container" [class.collapsed]="collapsed">
      <div class="timeline-header" (click)="collapsed = !collapsed">
        <span class="header-title">
          🎲 Roll History
          @if (rolls.length > 0) {
            <span class="roll-count">({{ rolls.length }})</span>
          }
        </span>
        <span class="collapse-icon">{{ collapsed ? '▲' : '▼' }}</span>
      </div>
      
      @if (!collapsed) {
        <div class="timeline-content">
          @if (rolls.length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🎲</div>
              <div class="empty-text">No rolls yet</div>
            </div>
          } @else {
            <div class="roll-list">
              @for (roll of rolls; track roll.id) {
                <div class="roll-item" [class.secret]="roll.isSecret">
                  <div class="roll-header">
                    <span class="roll-character">{{ roll.characterName }}</span>
                    <span class="roll-time">{{ formatTime(roll.timestamp) }}</span>
                  </div>
                  <div class="roll-body">
                    <div class="roll-formula">
                      {{ roll.diceCount }}d{{ roll.diceType }}
                      @if (getTotalBonus(roll) !== 0) {
                        <span class="roll-bonus">
                          {{ getTotalBonus(roll) > 0 ? '+' : '' }}{{ getTotalBonus(roll) }}
                        </span>
                      }
                    </div>
                    <div class="roll-details">
                      <!-- Individual dice -->
                      @if (roll.rolls.length > 0) {
                        <div class="roll-dice">
                          @for (die of roll.rolls; track $index) {
                            <span 
                              class="die-value"
                              [class.crit-success]="die === roll.diceType && roll.diceType === 20"
                              [class.crit-fail]="die === 1 && roll.diceType === 20"
                            >
                              {{ die }}
                            </span>
                          }
                        </div>
                      }
                      <!-- Bonuses -->
                      @if (roll.bonuses.length > 0) {
                        <div class="roll-bonuses-list">
                          @for (bonus of roll.bonuses; track $index) {
                            <span class="bonus-chip">
                              {{ bonus.name }}: {{ bonus.value > 0 ? '+' : '' }}{{ bonus.value }}
                            </span>
                          }
                        </div>
                      }
                    </div>
                    <div class="roll-result">
                      Total: <strong>{{ roll.result }}</strong>
                    </div>
                  </div>
                  @if (roll.isSecret) {
                    <div class="secret-badge">🔒 Secret</div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 500px;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #334155;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      z-index: 100;
      display: flex;
      flex-direction: column;
    }

    .timeline-container.collapsed {
      max-height: 50px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 1px solid #334155;
      border-radius: 10px 10px 0 0;
      cursor: pointer;
      user-select: none;
      transition: background 0.2s;
    }

    .timeline-header:hover {
      background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
    }

    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .roll-count {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 600;
    }

    .collapse-icon {
      font-size: 12px;
      color: #94a3b8;
    }

    .timeline-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }

    .timeline-content::-webkit-scrollbar {
      width: 8px;
    }

    .timeline-content::-webkit-scrollbar-track {
      background: rgba(51, 65, 85, 0.3);
      border-radius: 4px;
    }

    .timeline-content::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.5);
      border-radius: 4px;
    }

    .timeline-content::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.7);
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: #64748b;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
      font-weight: 500;
    }

    .roll-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .roll-item {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      transition: all 0.2s;
      position: relative;
    }

    .roll-item:hover {
      background: rgba(30, 41, 59, 0.8);
      border-color: #475569;
      transform: translateX(-2px);
    }

    .roll-item.secret {
      border-color: #7c3aed;
      background: rgba(124, 58, 237, 0.1);
    }

    .roll-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .roll-character {
      font-size: 13px;
      font-weight: 700;
      color: #60a5fa;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .roll-time {
      font-size: 11px;
      color: #94a3b8;
    }

    .roll-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .roll-formula {
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
    }

    .roll-bonus {
      color: #22c55e;
      margin-left: 4px;
    }

    .roll-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .roll-dice {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .die-value {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 4px;
      background: #334155;
      border: 1px solid #475569;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .die-value.crit-success {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-color: #4ade80;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
    }

    .die-value.crit-fail {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-color: #f87171;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }

    .roll-bonuses-list {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
    }

    .bonus-chip {
      font-size: 10px;
      padding: 2px 6px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 4px;
      color: #93c5fd;
    }

    .roll-result {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }

    .roll-result strong {
      font-size: 15px;
      font-weight: 900;
      color: #f59e0b;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .secret-badge {
      position: absolute;
      top: -8px;
      right: 8px;
      font-size: 10px;
      padding: 2px 8px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;
      border-radius: 10px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.4);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RollTimelineComponent {
  @Input() rolls: DiceRollEvent[] = [];
  
  collapsed = false;

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHr < 24) {
      return `${diffHr}h ago`;
    } else {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
  }

  getTotalBonus(roll: DiceRollEvent): number {
    return roll.bonuses.reduce((sum, bonus) => sum + bonus.value, 0);
  }
}
