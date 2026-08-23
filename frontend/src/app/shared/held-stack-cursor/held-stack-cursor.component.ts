import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeldStackService } from '../../services/held-stack.service';

/**
 * The pile you are carrying, drawn under the cursor. Rendered once at the page level so it can
 * float over the inventory, the equipment slots and the shared bag alike.
 */
@Component({
  selector: 'app-held-stack-cursor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (held.heldItem(); as item) {
      <div class="hsc" [style.left.px]="held.pointer().x" [style.top.px]="held.pointer().y">
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
      z-index: 13000;
      transform: translate(12px, 12px);
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
    }
    .hsc-icon { width: 15px; height: 15px; color: #c4b5fd; }
    .hsc-amount { color: #93c5fd; font-weight: 700; }
  `],
})
export class HeldStackCursorComponent {
  readonly held = inject(HeldStackService);

  @HostListener('document:mousemove', ['$event'])
  onMove(event: MouseEvent): void { this.held.trackPointer(event); }
}
