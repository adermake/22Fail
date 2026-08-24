import {
  ChangeDetectionStrategy, Component, HostListener, NgZone, OnDestroy, OnInit, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DRAG_SPLIT_OPERATIONS, DragSplitOperation, DragSplitService } from '../../services/drag-split.service';
import { playSplitTick } from '../sound/split-audio';

/**
 * The radial split menu, shown while the right button is held during a drag.
 *
 * Design notes, all of them learned the hard way:
 *  - While it is open the rest of the page is behind a scrim and cannot be hovered or clicked.
 *    Dragging a stack across the sheet used to light up every card it passed over.
 *  - The right button belongs entirely to this menu for as long as a drag is running. Every
 *    right-button event is caught in the CAPTURE phase, so no card underneath ever sees it and
 *    the browser's own context menu never appears.
 *  - Sweeping onto an option runs it once and locks it until the pointer leaves. Holding Shift
 *    repeats it instead, for getting from 200 to 12 without sixty separate sweeps.
 *  - Just type. Digits go into the count wherever the pointer happens to be.
 */
@Component({
  selector: 'app-drag-split-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (split.menuOpen()) {
      <!-- Everything behind the menu is inert while splitting. -->
      <div class="dsm-scrim" [class.closing]="closing()"></div>

      <div class="dsm" [class.closing]="closing()"
           [style.left.px]="split.menuPosition().x"
           [style.top.px]="split.menuPosition().y">

        <div class="dsm-core" [class.bump]="bump()">
          <span class="dsm-count">{{ split.taken() }}</span>
          <span class="dsm-total">von {{ split.total() }}</span>
          @if (typing()) { <span class="dsm-typed">Eingabe</span> }
        </div>

        @for (op of operations; track op.id; let i = $index) {
          <button class="dsm-op"
                  [class.dsm-used]="used() === op.id"
                  [class.dsm-fired]="fired() === op.id"
                  [class.dsm-impossible]="!split.can(op.id)"
                  [class.dsm-repeating]="repeatOp === op.id"
                  [style.--angle]="angleFor(i)"
                  [disabled]="!split.can(op.id)"
                  [title]="op.hint"
                  (mouseenter)="onSweep(op)"
                  (mouseleave)="onLeave(op)">
            <span class="dsm-op-label">{{ op.label }}</span>
            <span class="dsm-op-name">{{ op.name }}</span>
          </button>
        }

        <span class="dsm-hint">Zahl tippen · Shift = schnell · Rechtsklick loslassen</span>
      </div>
    }
  `,
  styles: [`
    .dsm-scrim {
      position: fixed; inset: 0;
      z-index: 13400;
      background: rgba(3, 6, 15, 0.62);
      backdrop-filter: blur(1.5px);
      animation: dsm-fade-in 0.12s ease-out;
    }
    .dsm-scrim.closing { animation: dsm-fade-out 0.16s ease-in forwards; }
    @keyframes dsm-fade-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dsm-fade-out { from { opacity: 1; } to { opacity: 0; } }

    .dsm {
      position: fixed;
      z-index: 13500;
      width: 0; height: 0;
      animation: dsm-in 0.14s cubic-bezier(0.2, 1.4, 0.5, 1);
    }
    .dsm.closing { animation: dsm-out 0.16s ease-in forwards; }
    @keyframes dsm-in  { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: none; } }
    @keyframes dsm-out { from { opacity: 1; } to { opacity: 0; transform: scale(0.92); } }

    /* ── The count in the middle ── */
    .dsm-core {
      position: absolute; left: 0; top: 0;
      transform: translate(-50%, -50%);
      display: flex; flex-direction: column; align-items: center;
      min-width: 108px;
      padding: 12px 18px;
      background: var(--card, #1a1f2e);
      border: 2px solid var(--accent, #8b5cf6);
      border-radius: 14px;
      box-shadow: 0 10px 34px rgba(0, 0, 0, 0.7), 0 0 30px rgba(139, 92, 246, 0.28);
    }
    .dsm-core.bump { animation: dsm-bump 0.22s cubic-bezier(0.2, 1.6, 0.4, 1); }
    @keyframes dsm-bump {
      0%   { transform: translate(-50%, -50%) scale(1); }
      45%  { transform: translate(-50%, -50%) scale(1.18); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }
    .dsm-count {
      color: #fff; font-size: 2rem; font-weight: 800; line-height: 1;
      font-variant-numeric: tabular-nums;
      text-shadow: 0 0 18px rgba(167, 139, 250, 0.75);
    }
    .dsm-total { margin-top: 3px; color: var(--muted, #9ca3af); font-size: 0.72rem; }
    .dsm-typed {
      margin-top: 3px; padding: 0 7px;
      background: rgba(139, 92, 246, 0.28);
      border-radius: 7px;
      color: #ddd6fe; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase;
    }

    /* ── The ring of operations ── */
    .dsm-op {
      position: absolute; left: 0; top: 0;
      width: 96px; height: 96px;
      margin: -48px 0 0 -48px;
      /* Big spread: the ring sits well clear of the item you are dragging. */
      transform: rotate(var(--angle)) translate(168px) rotate(calc(-1 * var(--angle)));
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      background: var(--card, #1a1f2e);
      border: 2px solid var(--border, #4a5568);
      border-radius: 50%;
      color: #e5e7eb;
      font-size: 1.5rem; font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
      transition: background 0.1s, border-color 0.1s, color 0.1s, opacity 0.1s;
    }
    .dsm-op-name {
      font-size: 0.62rem; font-weight: 600; letter-spacing: 0.05em;
      text-transform: uppercase; color: var(--muted, #9ca3af);
    }
    .dsm-op:hover:not(:disabled) {
      background: rgba(139, 92, 246, 0.42);
      border-color: var(--accent, #8b5cf6);
      color: #fff;
      transform: rotate(var(--angle)) translate(168px) rotate(calc(-1 * var(--angle))) scale(1.08);
    }

    /* Just fired — a bright pulse so you SEE the operation land. */
    .dsm-fired { animation: dsm-fire 0.34s ease-out; }
    @keyframes dsm-fire {
      0%   { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.95), 0 8px 24px rgba(0,0,0,0.55);
             background: rgba(196, 181, 253, 0.9); border-color: #fff; color: #1a1f2e; }
      100% { box-shadow: 0 0 0 26px rgba(167, 139, 250, 0), 0 8px 24px rgba(0,0,0,0.55); }
    }

    /* Already run on this sweep — leave and come back to run it again. */
    .dsm-used { opacity: 0.4; border-style: dashed; color: var(--muted, #9ca3af); }
    .dsm-used .dsm-op-name::after { content: ' ✓'; }

    /* Repeating under Shift. */
    .dsm-repeating { border-color: #fbbf24; box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.28); }

    /* The pile cannot support it at all. */
    .dsm-impossible {
      opacity: 0.16;
      cursor: not-allowed;
      border-color: #374151;
      color: #4b5563;
      box-shadow: none;
    }
    .dsm-impossible:hover { transform: rotate(var(--angle)) translate(168px) rotate(calc(-1 * var(--angle))); }

    .dsm-hint {
      position: absolute; left: 0; top: 0;
      transform: translate(-50%, 214px);
      white-space: nowrap;
      padding: 5px 12px;
      background: rgba(3, 6, 15, 0.82);
      border-radius: 9px;
      color: var(--muted, #9ca3af);
      font-size: 0.72rem;
    }
  `],
})
export class DragSplitMenuComponent implements OnInit, OnDestroy {
  readonly split = inject(DragSplitService);
  private zone = inject(NgZone);
  readonly operations = DRAG_SPLIT_OPERATIONS;

  /** The option that already fired on this pass, until the pointer leaves it. */
  readonly used = signal<DragSplitOperation['id'] | null>(null);
  /** The option flashing right now (visual confirmation that it landed). */
  readonly fired = signal<DragSplitOperation['id'] | null>(null);
  /** The count is bumping because it just changed. */
  readonly bump = signal(false);
  /** A typed number is being entered. */
  readonly typing = signal(false);
  readonly closing = signal(false);

  /** The option currently repeating because Shift is held over it. */
  repeatOp: DragSplitOperation['id'] | null = null;

  private repeatTimer: ReturnType<typeof setInterval> | null = null;
  private flashTimer: ReturnType<typeof setTimeout> | null = null;
  private typedDigits = '';
  private shiftDown = false;

  private static readonly REPEAT_MS = 90;

  ngOnDestroy(): void {
    this.stopRepeat();
    window.removeEventListener('mousedown', this.onRightMouseDown, true);
    window.removeEventListener('mouseup', this.onRightMouseUp, true);
    window.removeEventListener('contextmenu', this.onAnyContextMenu, true);
    window.removeEventListener('auxclick', this.onAnyAuxClick, true);
  }

  // ── The right button belongs to the split, always ─────────────────────────
  // These are registered by hand in the CAPTURE phase, not via @HostListener: Angular's host
  // listeners are bubble-phase, so any card that calls stopPropagation() on its own contextmenu
  // would beat them and interrupt the split. Capturing on window means nothing underneath ever
  // sees a right-button event while a drag is running — and the browser's own menu never opens,
  // including the contextmenu that fires AFTER the button is released.

  private readonly onRightMouseDown = (event: MouseEvent): void => {
    if (event.button !== 2 || !this.split.isDragging()) return;
    this.swallow(event);
    this.zone.run(() => {
      this.closing.set(false);
      this.used.set(null);
      this.typedDigits = '';
      this.typing.set(false);
      this.split.openMenu(event.clientX, event.clientY);
    });
  };

  private readonly onRightMouseUp = (event: MouseEvent): void => {
    if (event.button !== 2) return;
    if (!this.split.menuOpen()) return;
    this.swallow(event);
    this.zone.run(() => this.fadeOut());
  };

  private readonly onAnyContextMenu = (event: MouseEvent): void => {
    if (this.split.isDragging() || this.split.menuOpen() || this.closing()) this.swallow(event);
  };

  private readonly onAnyAuxClick = (event: MouseEvent): void => {
    if (event.button === 2 && (this.split.isDragging() || this.split.menuOpen())) this.swallow(event);
  };

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousedown', this.onRightMouseDown, true);
      window.addEventListener('mouseup', this.onRightMouseUp, true);
      window.addEventListener('contextmenu', this.onAnyContextMenu, true);
      window.addEventListener('auxclick', this.onAnyAuxClick, true);
    });
  }

  private swallow(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  // ── Keyboard: type a count, hold Shift to repeat ──────────────────────────

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.split.menuOpen()) return;

    if (event.key === 'Shift') {
      this.shiftDown = true;
      if (this.repeatOp) this.startRepeat(this.repeatOp);
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.typedDigits = (this.typedDigits + event.key).slice(0, 6);
      this.typing.set(true);
      this.split.setTaken(parseInt(this.typedDigits, 10));
      this.feedback('set');
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.typedDigits = this.typedDigits.slice(0, -1);
      this.typing.set(this.typedDigits.length > 0);
      if (this.typedDigits) this.split.setTaken(parseInt(this.typedDigits, 10));
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.split.setTaken(this.split.total()); // back to the whole pile
      this.typedDigits = '';
      this.typing.set(false);
      this.feedback('set');
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.shiftDown = false;
      this.stopRepeat();
    }
  }

  // ── Sweeping the ring ─────────────────────────────────────────────────────

  /** Evenly spaced around the circle, starting at the top. */
  angleFor(index: number): string {
    return `${(360 / this.operations.length) * index}deg`;
  }

  onSweep(op: DragSplitOperation): void {
    this.repeatOp = op.id;
    if (this.shiftDown) { this.startRepeat(op.id); return; }
    if (this.used() === op.id) return;
    this.run(op.id);
    this.used.set(op.id);
  }

  onLeave(op: DragSplitOperation): void {
    if (this.repeatOp === op.id) { this.repeatOp = null; this.stopRepeat(); }
    if (this.used() === op.id) this.used.set(null);
  }

  private run(id: DragSplitOperation['id']): boolean {
    // Typing and sweeping are alternatives; an operation ends the typed entry.
    this.typedDigits = '';
    this.typing.set(false);

    const ok = this.split.apply(id);
    this.feedback(ok ? id : 'blocked');
    if (ok) {
      this.fired.set(id);
      if (this.flashTimer) clearTimeout(this.flashTimer);
      this.flashTimer = setTimeout(() => this.fired.set(null), 340);
    }
    return ok;
  }

  private startRepeat(id: DragSplitOperation['id']): void {
    this.stopRepeat();
    if (!this.run(id)) return; // already at the limit — do not spin on a blocked op
    this.repeatTimer = setInterval(() => {
      if (!this.run(id)) this.stopRepeat();
    }, DragSplitMenuComponent.REPEAT_MS);
  }

  private stopRepeat(): void {
    if (this.repeatTimer) clearInterval(this.repeatTimer);
    this.repeatTimer = null;
  }

  /** Sound + the count's bump, together, so an applied operation is unmistakable. */
  private feedback(kind: string): void {
    playSplitTick(kind);
    this.bump.set(false);
    // Restart the animation on the next frame so repeated hits each get their own bump.
    requestAnimationFrame(() => this.bump.set(true));
    setTimeout(() => this.bump.set(false), 240);
  }

  private fadeOut(): void {
    this.stopRepeat();
    this.closing.set(true);
    setTimeout(() => {
      this.split.closeMenu();
      this.closing.set(false);
      this.used.set(null);
      this.fired.set(null);
      this.repeatOp = null;
      this.typedDigits = '';
      this.typing.set(false);
    }, 160);
  }
}
