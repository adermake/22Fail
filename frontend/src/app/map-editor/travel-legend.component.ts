/**
 * Travel cost legend: how long each kind of terrain takes to cross, and what it costs.
 *
 * Collapsible and remembered, because it is reference material — you want it open while
 * planning a route and out of the way the rest of the session. The numbers come from
 * `TRAVEL_TIERS` rather than being written here, so the legend and any future route
 * calculation cannot disagree.
 */

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { STAMINA_PER_HOUR_ON_FOOT, TRAVEL_TIERS } from '../utils/travel.util';

const COLLAPSED_KEY = 'map.travelLegend.collapsed';

@Component({
  selector: 'app-travel-legend',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./map-card.css'],
  template: `
    <div class="map-card" (wheel)="$event.stopPropagation()">
      <button type="button" class="map-card-head" (click)="toggle()">
        <span>Reisekosten</span>
        <span class="map-card-caret">{{ collapsed() ? '▸' : '▾' }}</span>
      </button>

      @if (!collapsed()) {
        <div class="map-card-body">
          <p class="legend-intro">Zeit pro Hex, zu Fuß:</p>
          <table class="legend-table">
            @for (tier of tiers; track tier.level) {
              <tr>
                <td class="legend-level">{{ tier.level }}</td>
                <td class="legend-hours">{{ tier.hours }} h</td>
                <td class="legend-terrain">{{ tier.terrain }}</td>
              </tr>
            }
          </table>
          <p class="legend-note">
            Eine Stunde zu Fuß kostet <strong>{{ staminaPerHour }} Ausdauer</strong>.
            Reisemethoden verändern Zeit und Ausdauer in beide Richtungen.
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .legend-intro {
        margin: 0 0 4px;
        font-size: 11px;
        opacity: 0.65;
      }
      .legend-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      .legend-table td {
        padding: 2px 4px;
        vertical-align: top;
      }
      .legend-level {
        width: 16px;
        opacity: 0.55;
        font-variant-numeric: tabular-nums;
      }
      .legend-hours {
        width: 34px;
        white-space: nowrap;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .legend-note {
        margin: 6px 0 0;
        font-size: 11px;
        line-height: 1.4;
        opacity: 0.75;
      }
    `,
  ],
})
export class TravelLegendComponent {
  readonly tiers = TRAVEL_TIERS;
  readonly staminaPerHour = STAMINA_PER_HOUR_ON_FOOT;
  readonly collapsed = signal(readCollapsed());

  toggle(): void {
    this.collapsed.update(v => !v);
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0');
    } catch {
      // A lost preference is not worth an error.
    }
  }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}
