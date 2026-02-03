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
      [style.left.px]="position.x"
      [style.top.px]="position.y"
      [style.transform]="'scale(' + scale + ')'"
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
      
      @if (token.team) {
        <div class="team-indicator" [style.background]="getTeamColor(token.team)"></div>
      }
      
      <div class="token-name">{{ token.name }}</div>
    </div>
  `,
  styles: [`
    .token {
      position: absolute;
      width: 48px;
      height: 48px;
      margin-left: -24px;
      margin-top: -24px;
      border-radius: 50%;
      border: 3px solid #475569;
      background: #1e293b;
      cursor: grab;
      pointer-events: auto;
      transition: transform 0.1s, box-shadow 0.1s;
      z-index: 1;
    }

    .token:hover {
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
      border-color: #3b82f6;
      z-index: 2;
    }

    .token:active,
    .token.dragging {
      cursor: grabbing;
      z-index: 10;
    }

    .token.current-turn {
      border-color: #22c55e;
      box-shadow: 0 0 16px rgba(34, 197, 94, 0.6);
    }

    .token-portrait {
      width: 100%;
      height: 100%;
      border-radius: 50%;
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
      background: #334155;
      border-radius: 50%;
    }

    .team-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #1e293b;
    }

    .token-name {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 10px;
      color: #e2e8f0;
      background: rgba(30, 41, 59, 0.9);
      padding: 2px 6px;
      border-radius: 4px;
      pointer-events: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyTokenComponent {
  @Input() token!: Token;
  @Input() position: Point = { x: 0, y: 0 };
  @Input() scale = 1;
  @Input() isCurrentTurn = false;

  @Output() dragStart = new EventEmitter<MouseEvent>();
  @Output() contextMenu = new EventEmitter<MouseEvent>();

  isDragging = false;

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

  onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = true;
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
