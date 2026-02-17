/**
 * Lobby Side Panel Component
 * 
 * Combines layer panel and roll timeline with tabs.
 * GM sees both tabs, players only see roll history.
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LobbyLayerPanelComponent } from '../lobby-layer-panel/lobby-layer-panel.component';
import { DiceRollEvent } from '../../services/world-socket.service';
import { Layer, LayerType } from '../../model/lobby.model';

type PanelTab = 'layers' | 'rolls';

@Component({
  selector: 'app-lobby-side-panel',
  standalone: true,
  imports: [CommonModule, LobbyLayerPanelComponent],
  template: `
    <div class="side-panel-container">
      <!-- Tab header (only show for GM) -->
      @if (isGM) {
        <div class="tab-header">
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'layers'"
            (click)="activeTab.set('layers')"
          >
            📐 Layers
          </button>
          <button 
            class="tab-button"
            [class.active]="activeTab() === 'rolls'"
            (click)="activeTab.set('rolls')"
          >
            🎲 Rolls <span class="roll-badge" *ngIf="rolls.length > 0">{{ rolls.length }}</span>
          </button>
        </div>
      } @else {
        <div class="tab-header">
          <div class="tab-title">🎲 Roll History</div>
        </div>
      }

      <!-- Tab content -->
      <div class="tab-content">
        <!-- Layers Tab (GM only) -->
        @if (isGM && activeTab() === 'layers') {
          <app-lobby-layer-panel
            [layers]="layers"
            [activeLayerId]="activeLayerId"
            [isGM]="isGM"
            (layerSelect)="layerSelect.emit($event)"
            (layerToggleVisible)="layerToggleVisible.emit($event)"
            (layerToggleLock)="layerToggleLock.emit($event)"
            (layerDelete)="layerDelete.emit($event)"
            (layerRename)="layerRename.emit($event)"
            (layerReorder)="layerReorder.emit($event)"
            (layerAdd)="layerAdd.emit($event)"
          />
        }

        <!-- Rolls Tab (all players) -->
        @if (!isGM || activeTab() === 'rolls') {
          <div class="roll-timeline">
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
                      @if (roll.actionName) {
                        <div class="action-header" [style.color]="roll.actionColor || '#f59e0b'">
                          {{ roll.actionIcon || '⚡' }} {{ roll.actionName }}
                        </div>
                      }
                      @if (roll.bonuses.length > 0 && roll.bonuses[0].source && !roll.actionName) {
                        <div class="roll-name">{{ roll.bonuses[0].source }}</div>
                      }
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
                                [style.border-color]="roll.actionColor || '#f59e0b'"
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
                        <!-- Resource Changes -->
                        @if (roll.resourceChanges && roll.resourceChanges.length > 0) {
                          <div class="resource-changes">
                            @for (change of roll.resourceChanges; track $index) {
                              <span 
                                class="resource-chip"
                                [class.gain]="change.amount > 0"
                                [class.spend]="change.amount < 0"
                              >
                                {{ getResourceIcon(change.resource) }} {{ change.amount > 0 ? '+' : '' }}{{ change.amount }} {{ getResourceName(change.resource) }}
                              </span>
                            }
                          </div>
                        }
                      </div>
                      <div class="roll-result" [style.color]="roll.actionColor || '#f59e0b'">
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
    </div>
  `,
  styles: [`
    .side-panel-container {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      max-height: calc(100vh - 120px);
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #334155;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      z-index: 50;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .tab-header {
      display: flex;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 1px solid #334155;
      border-radius: 10px 10px 0 0;
      overflow: hidden;
    }

    .tab-button {
      flex: 1;
      padding: 12px 8px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .tab-button:hover {
      background: rgba(51, 65, 85, 0.5);
      color: #f1f5f9;
    }

    .tab-button.active {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .tab-button.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: #60a5fa;
    }

    .tab-title {
      padding: 12px 16px;
      color: #f1f5f9;
      font-size: 14px;
      font-weight: 700;
      text-align: center;
      width: 100%;
    }

    .roll-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      background: #ef4444;
      border-radius: 9px;
      font-size: 11px;
      font-weight: 700;
      color: white;
    }

    .tab-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }

    .tab-content::-webkit-scrollbar {
      width: 8px;
    }

    .tab-content::-webkit-scrollbar-track {
      background: rgba(51, 65, 85, 0.3);
      border-radius: 4px;
    }

    .tab-content::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.5);
      border-radius: 4px;
    }

    .tab-content::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.7);
    }

    /* Roll Timeline Styles */
    .roll-timeline {
      padding: 8px;
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

    .roll-name {
      font-size: 12px;
      font-weight: 600;
      color: #a78bfa;
      font-style: italic;
    }

    .action-header {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 4px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
      display: inline-block;
      padding: 2px 6px;
      background: rgba(100, 116, 139, 0.3);
      esource-changes {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
      margin-top: 4px;
    }

    .resource-chip {
      display: inline-block;
      padding: 2px 6px;
      border: 1px solid;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .resource-chip.gain {
      background: rgba(34, 197, 94, 0.2);
      border-color: #22c55e;
      color: #86efac;
    }

    .resource-chip.spend {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      color: #fca5a5;
    }

    .rborder: 1px solid #475569;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      color: #cbd5e1;
    }

    .roll-result {
      margin-top: 4px;
      padding-top: 6px;
      border-top: 1px solid #334155;
      font-size: 12px;
      color: #94a3b8;
    }

    .roll-result strong {
      font-size: 14px;
      color: #f1f5f9;
      font-weight: 700;
    }

    .secret-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 2px 6px;
      background: rgba(124, 58, 237, 0.8);
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbySidePanelComponent {
  @Input() isGM = false;
  @Input() rolls: DiceRollEvent[] = [];
  @Input() layers: Layer[] = [];
  @Input() activeLayerId: string | null = null;

  @Output() layerSelect = new EventEmitter<string>();
  @Output() layerToggleVisible = new EventEmitter<string>();
  @Output() layerToggleLock = new EventEmitter<string>();
  @Output() layerDelete = new EventEmitter<string>();
  @Output() layerRename = new EventEmitter<{ id: string; name: string }>();
  @Output() layerReorder = new EventEmitter<Layer[]>();
  @Output() layerAdd = new EventEmitter<LayerType>();

  activeTab = signal<PanelTab>('layers');

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getTotalBonus(roll: DiceRollEvent): number {
    return roll.bonuses.reduce((sum, bonus) => sum + bonus.value, 0);
  }

  getResourceIcon(resource: string): string {
    const icons: Record<string, string> = {
      'health': '❤️',
      'energy': '⚡',
      'mana': '🔮'
    };
    return icons[resource] || '📊';
  }

  getResourceName(resource: string): string {
    const names: Record<string, string> = {
      'health': 'Leben',
      'energy': 'Energie',
      'mana': 'Mana'
    };
    return names[resource] || resource;
  }
}
