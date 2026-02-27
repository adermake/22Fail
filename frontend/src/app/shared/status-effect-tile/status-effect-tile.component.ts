import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiveStatusEffect } from '../../model/status-effect.model';
import { StatusEffect } from '../../model/status-effect.model';
import { MacroExecutorService } from '../../services/macro-executor.service';
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-status-effect-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-effect-tile" 
         [class.clickable]="hasAction"
         [style.border-color]="statusEffect?.color || '#8b5cf6'"
         (click)="onTileClick()">
      <div class="status-icon">{{ statusEffect?.icon || '💫' }}</div>
      <div class="status-info">
        <div class="status-name">{{ activeEffect.customName || statusEffect?.name }}</div>
        @if (activeEffect.stacks > 1) {
          <div class="status-stacks">×{{ activeEffect.stacks }}</div>
        }
        @if (activeEffect.duration !== undefined && activeEffect.duration > 0) {
          <div class="status-duration">{{ activeEffect.duration }} turns</div>
        }
      </div>
      @if (hasAction) {
        <div class="action-indicator">⚡</div>
      }
    </div>
  `,
  styles: [`
    .status-effect-tile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 8px;
      cursor: default;
      transition: all 0.2s;
      position: relative;
    }

    .status-effect-tile.clickable {
      cursor: pointer;
    }

    .status-effect-tile.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: #3b82f6;
    }

    .status-icon {
      font-size: 1.5rem;
      line-height: 1;
    }

    .status-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .status-name {
      color: var(--text);
      font-weight: 600;
      font-size: 0.95rem;
    }

    .status-stacks {
      color: #3b82f6;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .status-duration {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .action-indicator {
      font-size: 1.2rem;
      color: #f59e0b;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class StatusEffectTileComponent {
  @Input({ required: true }) activeEffect!: ActiveStatusEffect;
  @Input({ required: true }) statusEffect?: StatusEffect;
  @Input({ required: true }) character!: CharacterSheet;
  @Output() triggerAction = new EventEmitter<void>();

  private macroExecutor = inject(MacroExecutorService);

  get hasAction(): boolean {
    return !!this.statusEffect?.macroActionId;
  }

  onTileClick() {
    if (this.hasAction) {
      this.triggerAction.emit();
    }
  }
}
