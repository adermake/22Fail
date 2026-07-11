import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PingType, PING_TYPES } from './ping.model';

/** A ping resolved to screen-space for the current viewport. */
export interface RenderedPing {
  id: string;
  type: PingType;
  x: number;
  y: number;
}

/**
 * Presentational overlay that animates active pings (LoL-style: an icon that drops in
 * with a bounce plus expanding colour rings). The parent owns the ping list and their
 * lifetimes; this component only draws whatever it is handed at their screen positions.
 */
@Component({
  selector: 'app-ping-layer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ping-layer">
      @for (p of pings; track p.id) {
        <div
          class="ping"
          [style.left.px]="p.x"
          [style.top.px]="p.y"
          [style.--ping-color]="color(p.type)"
        >
          <span class="ping-ring"></span>
          <span class="ping-ring ping-ring-2"></span>
          <span class="ping-ring ping-ring-3"></span>
          <span class="ping-icon">{{ icon(p.type) }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ping-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 50;
        overflow: hidden;
      }
      .ping {
        position: absolute;
        width: 0;
        height: 0;
        transform: translate(-50%, -50%);
      }
      .ping-ring {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 54px;
        height: 54px;
        margin: -27px 0 0 -27px;
        border-radius: 50%;
        border: 3px solid var(--ping-color, #e2e8f0);
        opacity: 0;
        animation: ping-ring 0.85s ease-out 3;
      }
      .ping-ring-2 {
        animation-delay: 0.18s;
      }
      .ping-ring-3 {
        animation-delay: 0.36s;
      }
      .ping-icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 26px;
        line-height: 1;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6));
        animation: ping-icon 2.4s ease-out forwards;
        text-shadow: 0 0 6px var(--ping-color, #e2e8f0);
      }
      @keyframes ping-ring {
        0% {
          transform: scale(0.25);
          opacity: 0.9;
        }
        100% {
          transform: scale(1.7);
          opacity: 0;
        }
      }
      @keyframes ping-icon {
        0% {
          transform: translate(-50%, -160%) scale(0.6);
          opacity: 0;
        }
        12% {
          transform: translate(-50%, -50%) scale(1.35);
          opacity: 1;
        }
        22% {
          transform: translate(-50%, -50%) scale(1);
        }
        82% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -80%) scale(0.7);
          opacity: 0;
        }
      }
    `,
  ],
})
export class PingLayerComponent {
  @Input() pings: RenderedPing[] = [];

  color(type: PingType): string {
    return PING_TYPES[type].color;
  }
  icon(type: PingType): string {
    return PING_TYPES[type].icon;
  }
}
