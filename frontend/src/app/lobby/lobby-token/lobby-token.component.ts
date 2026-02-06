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

@Component({
  selector: 'app-lobby-token',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  template: `
    <div 
      class="token"
      [class.current-turn]="isCurrentTurn"
      [class.dragging]="isDragging"
      [class.non-interactive]="!isInteractive"
      [style.left.px]="position.x"
      [style.top.px]="position.y"
      [style.box-shadow]="getTokenBorder()"
      [style.cursor]="isInteractive ? 'grab' : 'default'"
      [style.pointer-events]="isInteractive ? 'auto' : 'none'"
      (mousedown)="onMouseDown($event)"
      (contextmenu)="onContextMenu($event)"
    >
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
      
      <div class="token-name">{{ token.name }}</div>
    </div>
  `,
  styles: [`
    .token {
      position: absolute;
      width: 56px;
      height: 56px;
      margin-left: -28px;
      margin-top: -28px;
      pointer-events: auto;
      z-index: 1;
      background: transparent;
      border-radius: 0;
      /* Flat-top hexagonal clipping */
      clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
      -webkit-clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
    }

    .token:hover:not(.non-interactive) {
      z-index: 2;
      filter: brightness(1.1);
    }

    .token:active,
    .token.dragging {
      cursor: grabbing;
      z-index: 10;
      opacity: 0.7;
    }

    .token.current-turn {
      filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.8));
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

    .token-name {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 10px;
      color: #1f2937;
      background: rgba(255, 255, 255, 0.9);
      padding: 2px 6px;
      border-radius: 4px;
      pointer-events: none;
      z-index: 100;
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
    return this.teamColors[team] || '#6b7280';
  }

  getTokenBorder(): string {
    // Use box-shadow for hexagonal border effect
    const color = this.token.team ? this.getTeamColor(this.token.team) : '#475569';
    return `0 0 0 3px ${color}`;
  }

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      event.preventDefault();
      event.stopPropagation();
      this.dragStart.emit(event);
    }
  }

  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.emit(event);
  }

  onImageError(event: Event): void {
    // Hide broken image
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
