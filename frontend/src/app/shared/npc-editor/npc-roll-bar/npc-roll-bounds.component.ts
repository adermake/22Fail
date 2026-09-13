import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NpcRollBounds } from '../../../model/npc-statblock.model';

/** Min/Max-Eingabe für eine Liste oder eine Gruppe (z. B. „Rüstung", „Waffen"). */
@Component({
  selector: 'app-npc-roll-bounds',
  standalone: true,
  imports: [FormsModule],
  template: `
    <span class="rbd">
      @if (label) { <span class="rbd-label">{{ label }}</span> }
      <label class="rbd-field" title="Mindestens so viele">
        Min <input type="number" min="0" [ngModel]="bounds.min" (ngModelChange)="setMin($event)">
      </label>
      <label class="rbd-field" title="Höchstens so viele — leer = unbegrenzt">
        Max <input type="number" min="0" placeholder="–" [ngModel]="bounds.max ?? null" (ngModelChange)="setMax($event)">
      </label>
      @if (expected !== null) {
        <span class="rbd-hint" title="Summe der Chancen, vor Min/Max">&asymp; {{ expectedLabel }} erwartet</span>
      }
    </span>
  `,
  styles: [`
    .rbd { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .rbd-label { min-width: 64px; font-size: 0.76rem; font-weight: 600; color: var(--text, #e5e7eb); }
    .rbd-field { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted, #9ca3af); }
    .rbd-field input { width: 48px; padding: 2px 5px; background: var(--bg, #1e293b); border: 1px solid var(--border, #4a5568); border-radius: 5px; color: var(--text, #e5e7eb); }
    .rbd-field input:focus { outline: none; border-color: var(--accent, #8b5cf6); }
    .rbd-hint { font-size: 0.7rem; color: var(--text-muted, #9ca3af); }
  `],
})
export class NpcRollBoundsComponent {
  @Input({ required: true }) bounds!: NpcRollBounds;
  @Input() label = '';
  /** Sum of the chances involved; `null` hides the hint. */
  @Input() expected: number | null = null;

  get expectedLabel(): string {
    return (Math.round((this.expected ?? 0) * 10) / 10).toLocaleString('de-DE');
  }

  setMin(value: number | null): void {
    this.bounds.min = Math.max(0, Math.floor(value ?? 0) || 0);
  }

  setMax(value: number | null | string): void {
    if (value === null || value === '' || !Number.isFinite(+value)) delete this.bounds.max;
    else this.bounds.max = Math.max(0, Math.floor(+value));
  }
}
