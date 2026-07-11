import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PingType, PING_TYPES, PING_WHEEL_TYPES } from './ping.model';

/**
 * Presentational radial ping menu shown while the user holds G and the mouse button.
 * The parent computes the currently-selected type from the drag direction and passes it
 * in; this component just highlights it. Centre = generic (no drag).
 */
@Component({
  selector: 'app-ping-wheel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wheel" [style.left.px]="x" [style.top.px]="y">
      @for (t of wheelTypes; track t.type) {
        <div
          class="seg"
          [class]="'seg-' + t.direction"
          [class.active]="selected === t.type"
          [style.--seg-color]="t.color"
          [title]="t.label"
        >
          <span class="seg-icon">{{ t.icon }}</span>
        </div>
      }
      <div
        class="center"
        [class.active]="selected === 'generic'"
        [style.--seg-color]="genericColor"
        [title]="genericLabel"
      >
        <span class="seg-icon">{{ genericIcon }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .wheel {
        position: absolute;
        width: 0;
        height: 0;
        z-index: 60;
        pointer-events: none;
      }
      .seg,
      .center {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.72);
        border: 2px solid rgba(148, 163, 184, 0.55);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        transition: transform 0.08s ease, background 0.08s ease, border-color 0.08s ease;
      }
      .seg {
        width: 46px;
        height: 46px;
        margin: -23px 0 0 -23px;
      }
      .center {
        width: 40px;
        height: 40px;
        left: 0;
        top: 0;
        margin: -20px 0 0 -20px;
      }
      .seg-up {
        left: 0;
        top: -58px;
      }
      .seg-right {
        left: 58px;
        top: 0;
      }
      .seg-down {
        left: 0;
        top: 58px;
      }
      .seg-left {
        left: -58px;
        top: 0;
      }
      .seg-icon {
        font-size: 22px;
        line-height: 1;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));
      }
      .seg.active,
      .center.active {
        background: var(--seg-color);
        border-color: #fff;
        transform: scale(1.22);
      }
      .seg.active .seg-icon,
      .center.active .seg-icon {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.85));
      }
    `,
  ],
})
export class PingWheelComponent {
  @Input() x = 0;
  @Input() y = 0;
  @Input() selected: PingType = 'generic';

  wheelTypes = PING_WHEEL_TYPES;
  genericColor = PING_TYPES.generic.color;
  genericIcon = PING_TYPES.generic.icon;
  genericLabel = PING_TYPES.generic.label;
}
