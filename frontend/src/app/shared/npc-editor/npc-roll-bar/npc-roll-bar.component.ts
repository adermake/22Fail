import { Component, Input } from '@angular/core';
import { NpcRollList } from '../../../model/npc-statblock.model';
import { NpcRollBoundsComponent } from './npc-roll-bounds.component';

/**
 * Kopfzeile eines NSC-Reiters: „Fest" nimmt die Liste wie sie ist, „Zufällig" würfelt jeden Eintrag
 * gegen seine Chance und hält die Anzahl zwischen Min und Max. Bearbeitet die Liste direkt im Entwurf.
 */
@Component({
  selector: 'app-npc-roll-bar',
  standalone: true,
  imports: [NpcRollBoundsComponent],
  template: `
    <div class="rb">
      <div class="rb-seg" role="group" aria-label="Modus">
        <button type="button" [class.on]="list.mode === 'fixed'" (click)="list.mode = 'fixed'"
                title="Jedes abgelegte NSC bekommt genau diese Liste">Fest</button>
        <button type="button" [class.on]="list.mode === 'random'" (click)="list.mode = 'random'"
                title="Beim Ablegen wird jeder Eintrag gegen seine Chance gewürfelt">Zufällig</button>
      </div>
      @if (list.mode === 'random' && showBounds) {
        <app-npc-roll-bounds [bounds]="list" [expected]="expected" />
      }
    </div>
  `,
  styles: [`
    .rb { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .rb-seg { display: inline-flex; border: 1px solid var(--border, #4a5568); border-radius: 6px; overflow: hidden; }
    .rb-seg button { padding: 3px 10px; background: var(--bg, #1e293b); border: none; color: var(--text-muted, #9ca3af); font-size: 0.74rem; cursor: pointer; }
    .rb-seg button + button { border-left: 1px solid var(--border, #4a5568); }
    .rb-seg button.on { background: color-mix(in srgb, var(--accent, #8b5cf6) 20%, transparent); color: var(--accent, #8b5cf6); font-weight: 600; }
  `],
})
export class NpcRollBarComponent {
  @Input({ required: true }) list!: NpcRollList;
  /** Off where the host shows its own grouped limits (equipment: Rüstung / Waffen). */
  @Input() showBounds = true;

  get expected(): number {
    return this.list.entries.reduce((total, e) => total + (e.chance || 0), 0);
  }
}
