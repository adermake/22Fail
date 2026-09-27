import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output,
  ViewChild, signal, computed,
} from '@angular/core';
import { distributeByRatio, soulPointBudget, NpcStatKey } from '../../model/npc-statblock.model';
import { QUICK_NPC_TRAITS, QuickNpcTraitId, quickNpcRatio } from '../../utils/quick-npc.util';

export interface QuickNpcRequest {
  name: string;
  traits: QuickNpcTraitId[];
  specialization: number;
  level: number;
}

const STAT_LABELS: { key: NpcStatKey; label: string }[] = [
  { key: 'strength', label: 'STR' },
  { key: 'constitution', label: 'KON' },
  { key: 'speed', label: 'TEM' },
  { key: 'dexterity', label: 'GES' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wille', label: 'WIL' },
];

/**
 * Schnell-NSC: an enemy in three seconds. Buttons for what it is good at, a slider for how
 * one-sided it is, a slider for how strong — Enter spawns it.
 *
 * Keyboard-first: the panel takes focus on open, 1–8 toggle the traits, Enter creates, Esc
 * cancels. Keys are stopped here so the map's own shortcuts (palette slots on the digits, tool
 * letters) don't fire underneath.
 */
@Component({
  selector: 'app-lobby-quick-npc',
  standalone: true,
  templateUrl: './lobby-quick-npc.component.html',
  styleUrls: ['./lobby-quick-npc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyQuickNpcComponent implements OnInit, AfterViewInit {
  /** Viewport position of the context menu the panel replaces. */
  @Input() screen: { x: number; y: number } = { x: 0, y: 0 };
  @Input() initialName = '';
  @Input() defaultLevel = 1;

  @Output() create = new EventEmitter<QuickNpcRequest>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('panel') panel?: ElementRef<HTMLElement>;

  readonly traits = QUICK_NPC_TRAITS;
  readonly statLabels = STAT_LABELS;
  readonly maxLevel = 30;

  name = signal('');
  selected = signal<ReadonlySet<QuickNpcTraitId>>(new Set());
  specialization = signal(50);
  level = signal(1);

  /** What the NSC will roughly look like — before the spawn's small shuffle. */
  preview = computed(() => {
    const ratio = quickNpcRatio([...this.selected()], this.specialization() / 100);
    return distributeByRatio(soulPointBudget(this.level(), 0, 'player'), ratio);
  });

  ngOnInit(): void {
    this.name.set(this.initialName);
    this.level.set(Math.max(1, Math.min(this.maxLevel, Math.round(this.defaultLevel) || 1)));
  }

  ngAfterViewInit(): void {
    this.panel?.nativeElement.focus();
  }

  /** Keep the panel on screen: it opens at the click, but a click near an edge would clip it. */
  get left(): number {
    return Math.max(8, Math.min(this.screen.x, window.innerWidth - 360));
  }
  get top(): number {
    return Math.max(8, Math.min(this.screen.y, window.innerHeight - 380));
  }

  isOn(id: QuickNpcTraitId): boolean {
    return this.selected().has(id);
  }

  toggle(id: QuickNpcTraitId): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  submit(): void {
    this.create.emit({
      name: this.name().trim(),
      traits: this.traits.map(t => t.id).filter(id => this.selected().has(id)),
      specialization: this.specialization() / 100,
      level: this.level(),
    });
  }

  onKey(event: KeyboardEvent): void {
    event.stopPropagation();
    const typing = (event.target as HTMLElement).tagName === 'INPUT'
      && (event.target as HTMLInputElement).type === 'text';
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel.emit();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
      return;
    }
    if (typing || event.ctrlKey || event.altKey) return;
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1 && n <= this.traits.length) {
      event.preventDefault();
      this.toggle(this.traits[n - 1]!.id);
    }
  }

  onRange(target: 'specialization' | 'level', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this[target].set(value);
  }
}
