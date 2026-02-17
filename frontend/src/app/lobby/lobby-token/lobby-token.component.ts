/**
 * Lobby Token Component
 * 
 * Renders a character token on the map.
 * Supports dragging and context menu.
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Token, Point } from '../../model/lobby.model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

export interface TokenResources {
  health: { current: number; max: number };
  mana: { current: number; max: number };
  energy: { current: number; max: number };
}

@Component({
  selector: 'app-lobby-token',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  template: `
    <div 
      class="token-wrapper"
      [class.current-turn]="isCurrentTurn"
      [class.dragging]="isDragging"
      [class.non-interactive]="!isInteractive"
      [class.show-resources]="showResources"
      [style.left.px]="position.x"
      [style.top.px]="position.y"
      [style.--team-color]="getTeamColor(token.team || 'default')"
      [style.--token-scale]="scale"
      [style.cursor]="isInteractive ? 'grab' : 'default'"
      [style.pointer-events]="isInteractive ? 'auto' : 'none'"
      (mousedown)="onMouseDown($event)"
      (contextmenu)="onContextMenu($event)"
      (dragstart)="onDragStart($event)"
    >
      <!-- Border layer: slightly larger hex with team color fill, NOT clipped by outer -->
      <div class="token-border"></div>
      <!-- Content layer: clipped hex with image/placeholder -->
      <div class="token-content">
        @if (token.portrait) {
          <img 
            class="token-portrait" 
            [src]="token.portrait | imageUrl" 
            alt=""
            (error)="onImageError($event)"
          />
        } @else {
          <div class="token-placeholder">
            {{ token.name.charAt(0).toUpperCase() }}
          </div>
        }
      </div>
      
      <!-- Resource Bars (only for party members) -->
      @if (resources && showResources) {
        <!-- Health Bar (bottom) -->
        <div class="resource-bar health-bar" [style.--bar-percentage]="getPercentage(resources.health)">
          <div class="bar-fill health-fill"></div>
        </div>
        
        <!-- Energy Bar (bottom-left diagonal) -->
        <div class="resource-bar energy-bar" [style.--bar-percentage]="getPercentage(resources.energy)">
          <div class="bar-fill energy-fill"></div>
        </div>
        
        <!-- Mana Bar (bottom-right diagonal) -->
        <div class="resource-bar mana-bar" [style.--bar-percentage]="getPercentage(resources.mana)">
          <div class="bar-fill mana-fill"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .token-wrapper {
      position: absolute;
      width: 60px;
      height: 60px;
      margin-left: -30px;
      margin-top: -30px;
      pointer-events: auto;
      z-index: 1;
      /* Scale with zoom to match hex grid size */
      transform: scale(var(--token-scale, 1));
      transform-origin: center center;
    }

    .token-border {
      position: absolute;
      top: 0;
      left: 0;
      width: 60px;
      height: 60px;
      background: var(--team-color, #475569);
      clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
      -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
    }

    .token-content {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 54px;
      height: 54px;
      clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
      -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
      overflow: hidden;
    }

    .token-wrapper:hover:not(.non-interactive) {
      z-index: 2;
      filter: brightness(1.1);
    }

    .token-wrapper:active,
    .token-wrapper.dragging {
      cursor: grabbing;
      z-index: 10;
      opacity: 0.7;
    }

    .token-wrapper.current-turn .token-border {
      background: #22c55e;
      filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.8));
    }

    .token-portrait {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .token-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
      color: #94a3b8;
      background: #1e293b;
    }

    /* Resource Bars */
    .resource-bar {
      position: absolute;
      height: 4px;
      background: rgba(0, 0, 0, 0.6);
      overflow: hidden;
      backdrop-filter: blur(2px);
      opacity: 0;
      transition: opacity 0.3s;
      border-radius: 2px;
    }

    .token-wrapper.show-resources .resource-bar {
      opacity: 1;
    }

    .bar-fill {
      height: 100%;
      width: calc(var(--bar-percentage, 0) * 1%);
      transition: width 0.3s ease-out;
      box-shadow: 0 0 4px currentColor;
      border-radius: 2px;
    }

    /* Health Bar - Bottom edge (flat, no skew) - Below token */
    .health-bar {
      bottom: -8px;
      left: 18px;
      right: 18px;
    }

    .health-fill {
      background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
      box-shadow: 0 0 6px #ef4444;
    }

    /* Mana Bar - Bottom-right diagonal aligned to hex wall */
    .mana-bar {
      bottom: 8px;
      right: 5px;
      width: 24px;
      transform: rotate(-60deg);
      transform-origin: bottom right;
    }

    .mana-fill {
      background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
      box-shadow: 0 0 6px #3b82f6;
    }

    /* Energy Bar - Bottom-left diagonal aligned to hex wall */
    .energy-bar {
      bottom: 8px;
      left: 5px;
      width: 24px;
      transform: rotate(60deg);
      transform-origin: bottom left;
    }

    .energy-fill {
      background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
      box-shadow: 0 0 6px #22c55e;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyTokenComponent {
  @Input() token!: Token;
  @Input() position: Point = { x: 0, y: 0 };
  @Input() scale = 1;
  @Input() isCurrentTurn = false;
  @Input() isInteractive = true;
  @Input() isDragging = false;
  @Input() resources: TokenResources | null = null; // Character resources
  @Input() showResources = false; // Only show for party members

  @Output() dragStart = new EventEmitter<MouseEvent>();
  @Output() contextMenu = new EventEmitter<MouseEvent>();

  // Team colors
  private teamColors: Record<string, string> = {
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#22c55e',
    yellow: '#eab308',
    purple: '#8b5cf6',
    orange: '#f97316',
  };

  getTeamColor(team: string): string {
    if (team === 'default' || !team) return '#475569';
    return this.teamColors[team] || '#475569';
  }

  getPercentage(resource: { current: number; max: number }): number {
    if (resource.max === 0) return 0;
    return Math.max(0, Math.min(100, (resource.current / resource.max) * 100));
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      event.preventDefault();
      event.stopPropagation();
      this.dragStart.emit(event);
    }
  }

  onDragStart(event: DragEvent): void {
    // Prevent native browser drag when right-clicking
    event.preventDefault();
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    // Don't stopPropagation - let the grid container handle this event
    // for both waypoint placement (during drag) and context menu display
    this.contextMenu.emit(event);
  }

  onImageError(event: Event): void {
    // Hide broken image
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
