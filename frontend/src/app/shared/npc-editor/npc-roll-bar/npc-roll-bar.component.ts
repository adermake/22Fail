import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NpcRollList } from '../../../model/npc-statblock.model';

/**
 * Kopfzeile eines NSC-Reiters: „Fest" nimmt die Liste wie sie ist, „Zufällig" würfelt jeden Eintrag
 * gegen seine Chance und hält die Anzahl zwischen Min und Max. Bearbeitet die Liste direkt im Entwurf.
 */
@Component({
  selector: 'app-npc-roll-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="rb">
      <div class="rb-seg" role="group" aria-label="Modus">
        <button type="button" [class.on]="list.mode === 'fixed'" (click)="list.mode = 'fixed'"
                title="Jedes abgelegte NSC bekommt genau diese Liste">Fest</button>
        <button type="button" [class.on]="list.mode === 'random'" (click)="list.mode = 'random'"
                title="Beim Ablegen wird jeder Eintrag gegen seine Chance gewürfelt">Zufällig</button>
      </div>
      @if (list.mode === 'random') {
        <label class="rb-field" title="Mindestens so viele Einträge">
          Min <input type="number" min="0" [ngModel]="list.min" (ngModelChange)="setMin($event)">
        </label>
        <label class="rb-field" title="Höchstens so viele Einträge — leer = unbegrenzt">
          Max <input type="number" min="0" placeholder="–" [ngModel]="list.max ?? null" (ngModelChange)="setMax($event)">
        </label>
        <span class="rb-hint" title="Summe aller Chancen, vor Min/Max">&asymp; {{ expected }} erwartet</span>
      }
    </div>
  `,
  styles: [`
    .rb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .rb-seg { display: inline-flex; border: 1px solid var(--border, #4a5568); border-radius: 6px; overflow: hidden; }
    .rb-seg button { padding: 3px 10px; background: var(--bg, #1e293b); border: none; color: var(--text-muted, #9ca3af); font-size: 0.74rem; cursor: pointer; }
    .rb-seg button + button { border-left: 1px solid var(--border, #4a5568); }
    .rb-seg button.on { background: color-mix(in srgb, var(--accent, #8b5cf6) 20%, transparent); color: var(--accent, #8b5cf6); font-weight: 600; }
    .rb-field { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted, #9ca3af); }
    .rb-field input { width: 48px; padding: 2px 5px; background: var(--bg, #1e293b); border: 1px solid var(--border, #4a5568); border-radius: 5px; color: var(--text, #e5e7eb); }
    .rb-hint { font-size: 0.7rem; color: var(--text-muted, #9ca3af); }
  `],
})
export class NpcRollBarComponent {
  @Input({ required: true }) list!: NpcRollList;

  get expected(): string {
    const sum = this.list.entries.reduce((total, e) => total + (e.chance || 0), 0);
    return (Math.round(sum * 10) / 10).toLocaleString('de-DE');
  }

  setMin(value: number | null): void {
    this.list.min = Math.max(0, Math.floor(value ?? 0) || 0);
  }

  setMax(value: number | null | string): void {
    if (value === null || value === '' || !Number.isFinite(+value)) delete this.list.max;
    else this.list.max = Math.max(0, Math.floor(+value));
  }
}
