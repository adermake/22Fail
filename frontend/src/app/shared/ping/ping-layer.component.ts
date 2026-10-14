import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PingType, PING_TYPES } from './ping.model';

/** A ping resolved to screen-space for the current viewport. */
export interface RenderedPing {
  id: string;
  type: PingType;
  x: number;
  y: number;
  /** Who pinged. Shown under the marker when present. */
  name?: string;
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
    <div class="ping-layer" #layer>
      @for (e of edgeIndicators(); track e.id) {
        <div
          class="ping-edge"
          [style.left.px]="e.x"
          [style.top.px]="e.y"
          [style.--ping-color]="color(e.type)"
        >
          <span class="ping-edge-arrow" [style.transform]="'rotate(' + e.angle + 'rad)'"></span>
          <span class="ping-edge-dot"></span>
          @if (e.name) {
            <span class="ping-edge-name">{{ e.name }}</span>
          }
        </div>
      }
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
          @if (p.name) {
            <span class="ping-name">{{ p.name }}</span>
          }
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
      /* Under the marker, fading with it. Outlined rather than boxed so it reads over any
         terrain without hiding what is being pointed at. */
      .ping-name {
        position: absolute;
        left: 50%;
        top: 22px;
        transform: translateX(-50%);
        white-space: nowrap;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        text-shadow:
          0 0 3px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
        animation: ping-name 2.4s ease-out forwards;
      }
      /* Off-screen marker: a dot pinned to the viewport edge, arrow pointing at the ping. */
      .ping-edge {
        position: absolute;
        width: 0;
        height: 0;
        animation: ping-edge 2.4s ease-out forwards;
      }
      .ping-edge-dot {
        position: absolute;
        left: -9px;
        top: -9px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--ping-color, #e2e8f0);
        border: 2px solid rgba(0, 0, 0, 0.55);
        box-shadow: 0 0 10px var(--ping-color, #e2e8f0);
        animation: ping-edge-pulse 0.8s ease-in-out 3;
      }
      .ping-edge-arrow {
        position: absolute;
        left: -22px;
        top: -22px;
        width: 44px;
        height: 44px;
        transform-origin: 50% 50%;
      }
      .ping-edge-arrow::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        margin-top: -7px;
        border-left: 11px solid var(--ping-color, #e2e8f0);
        border-top: 7px solid transparent;
        border-bottom: 7px solid transparent;
        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
      }
      .ping-edge-name {
        position: absolute;
        left: 0;
        top: 14px;
        transform: translateX(-50%);
        white-space: nowrap;
        font-size: 11px;
        font-weight: 600;
        color: #fff;
        text-shadow:
          0 0 3px rgba(0, 0, 0, 0.9),
          0 1px 2px rgba(0, 0, 0, 0.9);
      }
      @keyframes ping-edge {
        0%,
        85% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      @keyframes ping-edge-pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.3);
        }
      }
      @keyframes ping-name {
        0%,
        8% {
          opacity: 0;
        }
        16%,
        82% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
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
export class PingLayerComponent implements AfterViewInit, OnDestroy {
  @Input() pings: RenderedPing[] = [];

  @ViewChild('layer') private layerRef?: ElementRef<HTMLDivElement>;
  private readonly cdr = inject(ChangeDetectorRef);
  private resizeObserver: ResizeObserver | null = null;
  private width = 0;
  private height = 0;

  ngAfterViewInit(): void {
    const el = this.layerRef?.nativeElement;
    if (!el) return;
    this.resizeObserver = new ResizeObserver(() => {
      this.width = el.clientWidth;
      this.height = el.clientHeight;
      this.cdr.markForCheck();
    });
    this.resizeObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /**
   * Pings outside the visible area, projected onto the viewport edge along the line from the
   * centre, so you can see which way to scroll. Recomputed whenever the parent hands a new
   * (pan/zoom-adjusted) ping list.
   */
  edgeIndicators(): (RenderedPing & { angle: number })[] {
    const w = this.width;
    const h = this.height;
    if (!w || !h) return [];
    const margin = 26;
    const cx = w / 2;
    const cy = h / 2;
    const out: (RenderedPing & { angle: number })[] = [];
    for (const p of this.pings) {
      if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) continue;
      const dx = p.x - cx;
      const dy = p.y - cy;
      // Scale the centre→ping vector down until it touches the inset rectangle.
      const sx = dx !== 0 ? (cx - margin) / Math.abs(dx) : Infinity;
      const sy = dy !== 0 ? (cy - margin) / Math.abs(dy) : Infinity;
      const s = Math.min(sx, sy, 1);
      out.push({ ...p, x: cx + dx * s, y: cy + dy * s, angle: Math.atan2(dy, dx) });
    }
    return out;
  }

  color(type: PingType): string {
    return PING_TYPES[type].color;
  }
  icon(type: PingType): string {
    return PING_TYPES[type].icon;
  }
}
