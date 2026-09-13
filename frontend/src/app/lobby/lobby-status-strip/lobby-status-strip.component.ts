import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenStatusEffect } from '../../model/lobby.model';
import { StatusEffectEditorComponent } from '../../shared/status-effect-editor/status-effect-editor.component';
import { LobbyTokenActionsService } from '../lobby-token-actions.service';

/**
 * Status-Leiste oben in der Lobby: die Status-Effekte des ausgewählten Tokens als kleine Chips.
 * Überfahren zeigt die Details, Klick öffnet sie zum Bearbeiten, Rechtsklick das Kontextmenü.
 * „Alle ausführen" läuft wie bisher Schritt für Schritt; das Ergebnis erscheint unter dem Chip.
 */
@Component({
  selector: 'app-lobby-status-strip',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusEffectEditorComponent],
  templateUrl: './lobby-status-strip.component.html',
  styleUrl: './lobby-status-strip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyStatusStripComponent {
  readonly svc = inject(LobbyTokenActionsService);

  /** GM reminder: someone on turn still has effects to run. */
  @Input() blinking = false;
  @Output() dismissReminder = new EventEmitter<void>();

  /** The chip under the mouse, with where its tooltip goes. */
  hovered: { fx: TokenStatusEffect; x: number; y: number } | null = null;

  showTip(fx: TokenStatusEffect, event: MouseEvent): void {
    const r = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.hovered = { fx, x: Math.round(r.left + r.width / 2), y: Math.round(r.bottom + 8) };
  }

  hideTip(): void {
    this.hovered = null;
  }

  onStripClick(): void {
    if (this.blinking) this.dismissReminder.emit();
    this.svc.closeContextMenu();
  }

  hasDuration(fx: TokenStatusEffect): boolean {
    return fx.duration !== undefined && fx.duration !== null;
  }
}
