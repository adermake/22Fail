/**
 * The world clock in the Weltkarte toolbar — the same `world.worldClock` the lobby toolbar shows,
 * so both views always agree on the time. Everyone sees it; the GM can move it on.
 *
 * Changes go through `WorldStoreService.applyPatch`, which broadcasts over the world socket, so
 * a lobby open at the same time updates live (and its Begegnungswurf reminder fires there).
 * The lobby's clock dialog (set exact time, encounter timer) stays in the lobby.
 */

import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { WorldStoreService } from '../services/world-store.service';
import {
  DEFAULT_WORLD_CLOCK,
  formatWorldClock,
  shiftFantasyClock,
} from '../utils/world-clock.util';

@Component({
  selector: 'app-map-world-clock',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label(); as text) {
      <span class="clock-label" [title]="isGM() ? 'Weltzeit — gleich mit der Lobby' : 'Aktuelle Weltzeit'">
        {{ text }}
      </span>
      @if (isGM()) {
        <button type="button" (click)="shift(10)" title="+10 Minuten">+10′</button>
        <button type="button" (click)="shift(60)" title="+1 Stunde">+1h</button>
      }
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .clock-label {
        font-size: 12px;
        font-variant-numeric: tabular-nums;
        white-space: pre;
        padding: 3px 8px;
        border-radius: 5px;
        background: #2a2a33;
        border: 1px solid #3a3a46;
      }
      button {
        background: #2a2a33;
        color: #e6e6ea;
        border: 1px solid #3a3a46;
        border-radius: 5px;
        padding: 3px 7px;
        font-size: 12px;
        cursor: pointer;
      }
      button:hover {
        background: #343440;
      }
    `,
  ],
})
export class MapWorldClockComponent {
  readonly worldName = input.required<string>();
  readonly isGM = input(false);

  private worldStore = inject(WorldStoreService);
  private readonly world = toSignal(this.worldStore.world$, { initialValue: null });

  /** Empty until this page's world is loaded — never a stale clock from another world. */
  readonly label = computed(() => {
    const world = this.world();
    const name = this.worldName();
    if (!world || !name || this.worldStore.worldName !== name) return '';
    return formatWorldClock(world.worldClock ?? DEFAULT_WORLD_CLOCK);
  });

  constructor() {
    // The map view learns its world name late (ngAfterViewInit), so load when it arrives.
    effect(() => {
      const name = this.worldName();
      if (!name) return;
      this.worldStore
        .ensureLoaded(name)
        .catch(err => console.error('[MapWorldClock] Welt konnte nicht geladen werden', err));
    });
  }

  shift(minutes: number): void {
    if (!this.isGM()) return;
    const clock = this.worldStore.worldValue?.worldClock ?? DEFAULT_WORLD_CLOCK;
    this.worldStore.applyPatch({ path: 'worldClock', value: shiftFantasyClock(clock, minutes) });
  }
}
