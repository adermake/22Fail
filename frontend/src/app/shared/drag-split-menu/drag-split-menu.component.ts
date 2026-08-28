import {
  ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragSplitService } from '../../services/drag-split.service';
import { playSplitTick } from '../sound/split-audio';

/**
 * Keyboard and right-button handling for a drag in progress, plus a small count badge at the
 * cursor.
 *
 * There is no mode to enter and nothing to hold down: while a stack is being dragged, typing a
 * number sets how many come along, and each right-click drops a single unit into the slot under
 * the pointer. The grid draws the rest — the leftover badge on the source slot and the pending
 * badges on slots that have received units.
 *
 * The right button is claimed in the CAPTURE phase for the duration of a drag, so no card
 * underneath opens its own menu and the browser's never appears.
 */
@Component({
  selector: 'app-drag-split-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (split.isDragging() && split.splittable()) {
      <div class="dsb" [style.transform]="badgeTransform()">
        <span class="dsb-count" [class.typed]="split.typed()" [class.bump]="bump()">
          {{ split.carried() }}
        </span>
        <span class="dsb-of">von {{ split.total() }}</span>
        @if (split.leftover() > 0) {
          <span class="dsb-left">{{ split.leftover() }} bleibt</span>
        }
        <span class="dsb-hint">Zahl tippen · Rechtsklick legt eines ab</span>
      </div>
    }
  `,
  styles: [`
    .dsb {
      position: fixed;
      left: 0; top: 0;
      z-index: 13450;
      display: flex; align-items: center; gap: 8px;
      padding: 6px 12px;
      background: rgba(10, 14, 25, 0.95);
      border: 1px solid var(--accent, #8b5cf6);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      pointer-events: none;
      white-space: nowrap;
      will-change: transform;
    }
    .dsb-count {
      min-width: 1.4em;
      color: #fff; font-size: 1.1rem; font-weight: 800; text-align: center;
      font-variant-numeric: tabular-nums;
    }
    .dsb-count.typed { color: #ddd6fe; text-shadow: 0 0 14px rgba(167, 139, 250, 0.8); }
    .dsb-count.bump { animation: dsb-bump 0.2s cubic-bezier(0.2, 1.6, 0.4, 1); }
    @keyframes dsb-bump { 0% { transform: scale(1); } 45% { transform: scale(1.3); } 100% { transform: scale(1); } }
    .dsb-of { color: var(--muted, #9ca3af); font-size: 0.72rem; }
    .dsb-left {
      padding: 1px 7px; border-radius: 8px;
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24; font-size: 0.7rem; font-weight: 700;
    }
    .dsb-hint {
      padding-left: 8px;
      border-left: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--muted, #9ca3af); font-size: 0.66rem;
    }
  `],
})
export class DragSplitMenuComponent implements OnInit, OnDestroy {
  readonly split = inject(DragSplitService);
  private zone = inject(NgZone);

  readonly bump = signal(false);
  /** Cursor position, so the badge can follow it without a change-detection pass per move. */
  readonly badgeTransform = signal('translate3d(-1000px, -1000px, 0)');

  private typedDigits = '';
  private frame = 0;

  // ── Following the cursor ──────────────────────────────────────────────────

  private readonly onMove = (event: MouseEvent): void => {
    if (!this.split.isDragging() || this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.zone.run(() =>
        this.badgeTransform.set(`translate3d(${event.clientX + 18}px, ${event.clientY + 22}px, 0)`));
    });
  };

  // ── The right button belongs to the drag ──────────────────────────────────
  // Captured on window, not via @HostListener: host listeners are bubble-phase, so any card that
  // calls stopPropagation() on its own contextmenu would beat them and interrupt the drag.

  // Placing a unit is the GRID's job — only it knows which slot is under the pointer and whether
  // that slot can take the item. It claims right-mousedown itself; everything else about the
  // right button is neutralised here.

  private readonly onRightMouseUp = (event: MouseEvent): void => {
    if (event.button !== 2 || !this.split.isDragging()) return;
    this.swallow(event);
  };

  private readonly onAnyContextMenu = (event: MouseEvent): void => {
    if (this.split.isDragging()) this.swallow(event);
  };

  private readonly onAnyAuxClick = (event: MouseEvent): void => {
    if (event.button === 2 && this.split.isDragging()) this.swallow(event);
  };

  // ── Typing the count ──────────────────────────────────────────────────────

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.split.isDragging() || !this.split.splittable()) return;

    // Never steal keys from someone typing in a field.
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.typedDigits = (this.typedDigits + event.key).slice(0, 6);
      this.commitTyped();
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.typedDigits = this.typedDigits.slice(0, -1);
      this.commitTyped();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.typedDigits = '';
      this.zone.run(() => {
        this.split.setCarried(this.split.total() - this.split.parkedCount());
        this.feedback();
      });
    }
  };

  private commitTyped(): void {
    this.zone.run(() => {
      const max = this.split.total() - this.split.parkedCount();
      this.split.setCarried(this.typedDigits ? parseInt(this.typedDigits, 10) : max);
      this.split.markTyped();
      this.feedback();
    });
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMove, { passive: true });
      window.addEventListener('mouseup', this.onRightMouseUp, true);
      window.addEventListener('contextmenu', this.onAnyContextMenu, true);
      window.addEventListener('auxclick', this.onAnyAuxClick, true);
      window.addEventListener('keydown', this.onKeyDown, true);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('mouseup', this.onRightMouseUp, true);
    window.removeEventListener('contextmenu', this.onAnyContextMenu, true);
    window.removeEventListener('auxclick', this.onAnyAuxClick, true);
    window.removeEventListener('keydown', this.onKeyDown, true);
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private swallow(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  private feedback(): void {
    playSplitTick('set');
    this.bump.set(false);
    requestAnimationFrame(() => this.bump.set(true));
    setTimeout(() => this.bump.set(false), 220);
  }
}
