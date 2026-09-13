import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LobbyTokenActionsService } from '../lobby-token-actions.service';

/**
 * Linke Spalte bei ausgewähltem Token: was gerade läuft — gewirkte Zauber, aktive Fähigkeiten,
 * Ausrüstung mit Wirkung oder Auslösern — und darunter die Begleiter zum Beschwören.
 * Früher der „Aktiv"-Tab im Bottom-Panel; links ist Platz, den sonst niemand nutzt.
 */
@Component({
  selector: 'app-lobby-active-column',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby-active-column.component.html',
  styleUrl: './lobby-active-column.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyActiveColumnComponent {
  readonly svc = inject(LobbyTokenActionsService);

  @Input() canViewStats = true;

  counterPercent(current: number, min: number, max: number): number {
    return max > min ? ((current - min) / (max - min)) * 100 : 0;
  }
}
