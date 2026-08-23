import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeldStackService } from '../../services/held-stack.service';

/**
 * The pile you are carrying, drawn under the cursor, with its count right there on it — that is
 * the only place the amount belongs while you are moving it.
 *
 * The pointer is followed OUTSIDE Angular and written straight to the element's transform. Going
 * through a signal meant a change-detection pass on every mousemove across the whole sheet, which
 * is what made picking things up feel sticky.
 */
@Component({
  selector: 'app-held-stack-cursor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (held.heldItem(); as item) {
      <div class="hsc" #chip>
        <span class="hsc-icon app-icon i-item"></span>
        <span class="hsc-name">{{ item.name }}</span>
        @if (held.heldAmount() > 1) {
          <span class="hsc-amount">&times;{{ held.heldAmount() }}</span>
        }
      </div>
    }
  `,
  styles: [`
    .hsc {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 13000;
      display: flex; align-items: center; gap: 7px;
      padding: 5px 11px;
      background: var(--card, #1a1f2e);
      border: 1px solid var(--accent, #8b5cf6);
      border-radius: 8px;
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);
      color: var(--text, #e5e7eb);
      font-size: 0.82rem;
      pointer-events: none;
      white-space: nowrap;
      will-change: transform;
    }
    .hsc-icon { width: 15px; height: 15px; color: #c4b5fd; }
    .hsc-amount {
      padding: 0 6px;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd; font-weight: 700;
    }
  `],
})
export class HeldStackCursorComponent implements AfterViewInit, OnDestroy {
  readonly held = inject(HeldStackService);
  private zone = inject(NgZone);
  private hostEl: ElementRef<HTMLElement> = inject(ElementRef);

  @ViewChild('chip') chip?: ElementRef<HTMLElement>;

  private lastX = 0;
  private lastY = 0;
  private frame = 0;

  private readonly onMove = (event: MouseEvent): void => {
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    if (this.frame || !this.held.isHolding()) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const el = this.chip?.nativeElement
        ?? (this.hostEl.nativeElement.querySelector('.hsc') as HTMLElement | null);
      if (el) el.style.transform = `translate3d(${this.lastX + 12}px, ${this.lastY + 12}px, 0)`;
    });
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => document.addEventListener('mousemove', this.onMove, { passive: true }));
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMove);
    if (this.frame) cancelAnimationFrame(this.frame);
  }
}
