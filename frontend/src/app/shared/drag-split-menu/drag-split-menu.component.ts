import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DRAG_SPLIT_OPERATIONS, DragSplitOperation, DragSplitService } from '../../services/drag-split.service';

/**
 * The radial split menu, shown while the right button is held during a drag.
 *
 * Sweeping the pointer over an option runs it ONCE and then locks that option until the pointer
 * leaves it again — so holding still does not run "+1" thirty times a second, but sweeping back
 * and forth deliberately does add one each time. Options the pile cannot support are dead.
 */
@Component({
  selector: 'app-drag-split-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (split.menuOpen()) {
      <div class="dsm" [class.closing]="closing()"
           [style.left.px]="split.menuPosition().x"
           [style.top.px]="split.menuPosition().y">

        <!-- Blender-style: just type the number you want -->
        <div class="dsm-core">
          <input class="dsm-input"
                 type="text"
                 inputmode="numeric"
                 [ngModel]="split.taken()"
                 (ngModelChange)="onTyped($event)"
                 (mousedown)="$event.stopPropagation()"
                 aria-label="Anzahl" />
          <span class="dsm-total">von {{ split.total() }}</span>
        </div>

        @for (op of operations; track op.id; let i = $index) {
          <button class="dsm-op"
                  [class.dsm-used]="used() === op.id"
                  [class.dsm-impossible]="!split.can(op.id)"
                  [style.--angle]="angleFor(i)"
                  [disabled]="!split.can(op.id)"
                  [title]="op.hint"
                  (mouseenter)="onSweep(op)"
                  (mouseleave)="onLeave(op)"
                  (mousedown)="$event.preventDefault()">
            {{ op.label }}
          </button>
        }
      </div>
    }
  `,
  styles: [`
    .dsm {
      position: fixed;
      z-index: 13500;
      width: 0; height: 0;
      pointer-events: none;
      animation: dsm-in 0.12s ease-out;
    }
    .dsm.closing { animation: dsm-out 0.16s ease-in forwards; }
    @keyframes dsm-in  { from { opacity: 0; transform: scale(0.86); } to { opacity: 1; transform: none; } }
    @keyframes dsm-out { from { opacity: 1; } to { opacity: 0; transform: scale(0.92); } }

    .dsm-core {
      position: absolute;
      left: 0; top: 0;
      transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 6px 10px;
      background: var(--card, #1a1f2e);
      border: 1px solid var(--accent, #8b5cf6);
      border-radius: 10px;
      box-shadow: 0 8px 26px rgba(0, 0, 0, 0.6);
      pointer-events: auto;
    }
    .dsm-input {
      width: 62px;
      background: transparent;
      border: none;
      color: #e5e7eb;
      font-size: 1.05rem; font-weight: 700; text-align: center;
      outline: none;
      font-variant-numeric: tabular-nums;
    }
    .dsm-total { color: var(--muted, #9ca3af); font-size: 0.64rem; }

    /* Each option sits on a circle around the cursor. */
    .dsm-op {
      position: absolute;
      left: 0; top: 0;
      width: 46px; height: 46px;
      margin: -23px 0 0 -23px;
      transform: rotate(var(--angle)) translate(76px) rotate(calc(-1 * var(--angle)));
      display: flex; align-items: center; justify-content: center;
      background: var(--card, #1a1f2e);
      border: 1px solid var(--border, #4a5568);
      border-radius: 50%;
      color: #e5e7eb;
      font-size: 0.95rem; font-weight: 700;
      cursor: pointer;
      pointer-events: auto;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
      transition: background 0.12s, border-color 0.12s, color 0.12s, opacity 0.12s;
    }
    .dsm-op:hover:not(:disabled):not(.dsm-used) {
      background: rgba(139, 92, 246, 0.35);
      border-color: var(--accent, #8b5cf6);
      color: #fff;
    }
    /* Already run on this sweep — move away and back to run it again. */
    .dsm-used { opacity: 0.45; border-style: dashed; color: var(--muted, #9ca3af); }
    /* The pile cannot support it at all. */
    .dsm-impossible {
      opacity: 0.18;
      cursor: not-allowed;
      border-color: #374151;
      color: #4b5563;
      box-shadow: none;
    }
  `],
})
export class DragSplitMenuComponent {
  readonly split = inject(DragSplitService);
  readonly operations = DRAG_SPLIT_OPERATIONS;

  /** The option that already fired on this pass, until the pointer leaves it. */
  readonly used = signal<DragSplitOperation['id'] | null>(null);
  readonly closing = signal(false);

  // The right button is watched globally: a drag can start in the inventory, the shared bag or
  // an equipment slot, and all of them get the same split menu.

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (event.button !== 2 || !this.split.isDragging()) return;
    event.preventDefault();
    this.closing.set(false);
    this.used.set(null);
    this.split.openMenu(event.clientX, event.clientY);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (event.button !== 2 || !this.split.menuOpen()) return;
    this.fadeOut();
  }

  /** No browser context menu while a drag is running — the right button belongs to us. */
  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    if (this.split.isDragging() || this.split.menuOpen()) event.preventDefault();
  }

  private fadeOut(): void {
    this.closing.set(true);
    setTimeout(() => {
      this.split.closeMenu();
      this.closing.set(false);
      this.used.set(null);
    }, 160);
  }

  /** Evenly spaced around the circle, starting at the top. */
  angleFor(index: number): string {
    return `${(360 / this.operations.length) * index}deg`;
  }

  onSweep(op: DragSplitOperation): void {
    if (this.used() === op.id) return;
    if (!this.split.apply(op.id)) return;
    this.used.set(op.id);
  }

  onLeave(op: DragSplitOperation): void {
    if (this.used() === op.id) this.used.set(null);
  }

  onTyped(value: string | number): void {
    this.split.setTaken(typeof value === 'number' ? value : parseInt(String(value), 10));
  }
}
