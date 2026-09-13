import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NpcRollEntry } from '../../../model/npc-statblock.model';

/** Chance (und bei Beute: Anzahl von–bis) eines einzelnen Eintrags im Modus „Zufällig". */
@Component({
  selector: 'app-npc-roll-chance',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="rc">
      <label class="rc-field" title="Chance, dass ein abgelegtes NSC diesen Eintrag bekommt">
        Chance
        <input type="number" min="0" max="100" step="5" [ngModel]="percent" (ngModelChange)="setPercent($event)">
        <span class="rc-unit">%</span>
      </label>
      @if (amount) {
        <label class="rc-field" title="Gewürfelte Anzahl — leer = die Anzahl des Gegenstands">
          Anzahl
          <input type="number" min="0" placeholder="–" [ngModel]="entry.min ?? null" (ngModelChange)="setBound('min', $event)">
          <span class="rc-unit">–</span>
          <input type="number" min="0" placeholder="–" [ngModel]="entry.max ?? null" (ngModelChange)="setBound('max', $event)">
        </label>
      }
    </div>
  `,
  styles: [`
    .rc { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 3px 6px; }
    .rc-field { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted, #9ca3af); }
    .rc-field input { width: 50px; padding: 2px 5px; background: var(--card, #2d3748); border: 1px solid var(--border, #4a5568); border-radius: 5px; color: var(--text, #e5e7eb); }
    .rc-field input:focus { outline: none; border-color: var(--accent, #8b5cf6); }
    .rc-unit { color: var(--text-muted, #9ca3af); }
  `],
})
export class NpcRollChanceComponent {
  @Input({ required: true }) entry!: NpcRollEntry;
  /** Show the amount range (inventory only). */
  @Input() amount = false;

  get percent(): number {
    return Math.round((this.entry.chance ?? 0) * 100);
  }

  setPercent(value: number | null): void {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    this.entry.chance = pct / 100;
  }

  setBound(bound: 'min' | 'max', value: number | null | string): void {
    if (value === null || value === '' || !Number.isFinite(+value)) delete this.entry[bound];
    else this.entry[bound] = Math.max(0, Math.floor(+value));
  }
}
