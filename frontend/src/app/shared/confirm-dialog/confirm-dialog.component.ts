import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * The app's own "are you sure?" — the browser's confirm() is ugly, blocks the whole tab and
 * cannot be styled. Drop it in behind an @if and listen for confirmed/cancelled.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cd-backdrop" (click)="cancel()">
      <div class="cd-panel" [class.danger]="danger" (click)="$event.stopPropagation()">
        <h3 class="cd-title">{{ title }}</h3>
        @if (message) { <p class="cd-message">{{ message }}</p> }
        @if (detail) { <p class="cd-detail">{{ detail }}</p> }
        <div class="cd-actions">
          <button class="cd-btn" (click)="cancel()">{{ cancelLabel }}</button>
          <button class="cd-btn cd-btn-primary" (click)="confirm()" autofocus>{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cd-backdrop {
      position: fixed; inset: 0; z-index: 12000;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0, 0, 0, 0.62);
      backdrop-filter: blur(3px);
      animation: cd-fade 0.14s ease-out;
    }
    @keyframes cd-fade { from { opacity: 0; } to { opacity: 1; } }
    .cd-panel {
      width: min(420px, calc(100vw - 2rem));
      padding: 1.25rem 1.35rem 1.1rem;
      background: var(--card, #1a1f2e);
      border: 1px solid var(--border, #2d3748);
      border-radius: 14px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
      animation: cd-pop 0.16s ease-out;
    }
    @keyframes cd-pop { from { transform: scale(0.96); opacity: 0; } to { transform: none; opacity: 1; } }
    .cd-panel.danger { border-color: rgba(239, 68, 68, 0.6); }
    .cd-title { margin: 0 0 0.5rem; font-size: 1.05rem; color: var(--text, #e5e7eb); }
    .cd-message { margin: 0 0 0.35rem; font-size: 0.9rem; color: var(--text, #e5e7eb); line-height: 1.45; }
    .cd-detail { margin: 0; font-size: 0.8rem; color: var(--muted, #9ca3af); line-height: 1.4; }
    .cd-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.1rem; }
    .cd-btn {
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid var(--border, #4a5568);
      border-radius: 8px;
      color: var(--muted, #9ca3af);
      font-size: 0.85rem; cursor: pointer;
      transition: all 0.15s;
    }
    .cd-btn:hover { color: var(--text, #e5e7eb); border-color: var(--accent, #8b5cf6); }
    .cd-btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
      border-color: transparent; color: #fff; font-weight: 600;
    }
    .cd-btn-primary:hover { filter: brightness(1.12); }
    .danger .cd-btn-primary { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
  `],
})
export class ConfirmDialogComponent {
  @Input() title = 'Bist du sicher?';
  @Input() message = '';
  /** Small print under the message — e.g. what the action will actually do. */
  @Input() detail = '';
  @Input() confirmLabel = 'Ja';
  @Input() cancelLabel = 'Abbrechen';
  /** Red styling for destructive actions. */
  @Input() danger = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void { this.cancel(); }

  confirm(): void { this.confirmed.emit(); }
  cancel(): void { this.cancelled.emit(); }
}
