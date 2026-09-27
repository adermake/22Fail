import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output,
  ViewChild, signal, computed,
} from '@angular/core';
import { distributeByRatio, soulPointBudget, NpcStatKey } from '../../model/npc-statblock.model';
import {
  QUICK_GEAR_MAX_PIECES, QUICK_NPC_ARCHETYPES, QUICK_NPC_TRAITS, QuickNpcArchetypeId, QuickNpcGear,
  QuickNpcTrait, QuickNpcTraitId, quickGearBudget, quickNpcRatio,
} from '../../utils/quick-npc.util';

export interface QuickNpcRequest {
  name: string;
  traits: QuickNpcTraitId[];
  specialization: number;
  level: number;
  /** null = no gear: Effektivität and Stabilität are innate. */
  gear: QuickNpcGear | null;
}

const STAT_LABELS: { key: NpcStatKey; label: string }[] = [
  { key: 'strength', label: 'STR' },
  { key: 'constitution', label: 'KON' },
  { key: 'speed', label: 'TEM' },
  { key: 'dexterity', label: 'GES' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wille', label: 'WIL' },
];

const PANEL_WIDTH = 340;
const GEAR_WIDTH = 300;

/**
 * Schnell-NSC: an enemy in three seconds. Buttons for what it is good at, a slider for how
 * one-sided it is, a slider for how strong — Enter spawns it. Gear is opt-in through a second
 * window (A): archetype, number of pieces, material value and Schmiedepunkte.
 *
 * Keyboard-first: the panel takes focus on open, 1–9 toggle the traits (1–7 pick the archetype
 * while the gear window is open), Enter creates, Esc closes the gear window or cancels. Keys are
 * stopped here so the map's own shortcuts (palette slots on the digits, tool letters) don't fire.
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
  readonly archetypes = QUICK_NPC_ARCHETYPES;
  readonly statLabels = STAT_LABELS;
  readonly maxLevel = 30;
  readonly maxPieces = QUICK_GEAR_MAX_PIECES;

  name = signal('');
  selected = signal<ReadonlySet<QuickNpcTraitId>>(new Set());
  specialization = signal(50);
  level = signal(1);

  /** The gear that will be forged; null = none (the default — animals, golems, …). */
  gear = signal<QuickNpcGear | null>(null);
  gearOpen = signal(false);
  // Gear window draft — only becomes `gear` on „Übernehmen".
  draftArchetype = signal<QuickNpcArchetypeId>('krieger');
  draftAmount = signal(3);
  draftValue = signal(30);
  draftBudget = signal(10);
  /** Once the GM moved the Schmiedepunkte slider, the level stops dragging it along. */
  private budgetTouched = false;

  /** What the NSC will roughly look like — before the spawn's small shuffle. */
  preview = computed(() => {
    const ratio = quickNpcRatio([...this.selected()], this.specialization() / 100);
    return distributeByRatio(soulPointBudget(this.level(), 0, 'player'), ratio);
  });

  gearSummary = computed(() => {
    const g = this.gear();
    if (!g) return '';
    const label = this.archetypes.find(a => a.id === g.archetype)?.label ?? '';
    return `${label} · ${g.amount} Teile · ${g.budget} SP`;
  });

  ngOnInit(): void {
    this.name.set(this.initialName);
    this.level.set(Math.max(1, Math.min(this.maxLevel, Math.round(this.defaultLevel) || 1)));
    this.draftBudget.set(quickGearBudget(this.level()));
  }

  ngAfterViewInit(): void {
    this.focusPanel();
  }

  private focusPanel(): void {
    this.panel?.nativeElement.focus();
  }

  /** Keep the panel on screen: it opens at the click, but a click near an edge would clip it. */
  get left(): number {
    return Math.max(8, Math.min(this.screen.x, window.innerWidth - PANEL_WIDTH - 8));
  }
  get top(): number {
    return Math.max(8, Math.min(this.screen.y, window.innerHeight - 440));
  }
  /** The gear window sits beside the panel — right if there is room, else left. */
  get gearLeft(): number {
    const right = this.left + PANEL_WIDTH + 8;
    return right + GEAR_WIDTH + 8 <= window.innerWidth ? right : Math.max(8, this.left - GEAR_WIDTH - 8);
  }

  /** Gepanzert / Aggressiv / Aufmerksam touch no stat — drawn apart from the six stat traits. */
  isCombat(trait: QuickNpcTrait): boolean {
    return Object.keys(trait.weights).length === 0;
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

  // ─── Gear window ───────────────────────────────────────────────────────────

  openGear(): void {
    const g = this.gear();
    if (g) {
      this.draftArchetype.set(g.archetype);
      this.draftAmount.set(g.amount);
      this.draftValue.set(Math.round(g.value * 100));
      this.draftBudget.set(g.budget);
    }
    this.gearOpen.set(true);
  }

  closeGear(): void {
    this.gearOpen.set(false);
    this.focusPanel();
  }

  applyGear(): void {
    this.gear.set({
      archetype: this.draftArchetype(),
      amount: this.draftAmount(),
      value: this.draftValue() / 100,
      budget: this.draftBudget(),
    });
    this.closeGear();
  }

  removeGear(): void {
    this.gear.set(null);
    this.closeGear();
  }

  /** Klick auf ein Archetyp: wählen. Doppelt gemeint (schon gewählt) = gleich übernehmen. */
  pickArchetype(id: QuickNpcArchetypeId): void {
    if (this.draftArchetype() === id) {
      this.applyGear();
      return;
    }
    this.draftArchetype.set(id);
  }

  valueLabel(): string {
    const v = this.draftValue();
    return v < 25 ? 'Billig' : v < 50 ? 'Einfach' : v < 75 ? 'Gut' : 'Selten';
  }

  // ─── Input ─────────────────────────────────────────────────────────────────

  submit(): void {
    this.create.emit({
      name: this.name().trim(),
      traits: this.traits.map(t => t.id).filter(id => this.selected().has(id)),
      specialization: this.specialization() / 100,
      level: this.level(),
      gear: this.gear(),
    });
  }

  onKey(event: KeyboardEvent): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    const typing = target.tagName === 'INPUT' && target.type === 'text';
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.gearOpen()) this.closeGear();
      else this.cancel.emit();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.gearOpen()) this.applyGear();
      else this.submit();
      return;
    }
    if (typing || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key.toLowerCase() === 'a' && !this.gearOpen()) {
      event.preventDefault();
      this.openGear();
      return;
    }
    const n = Number(event.key);
    if (!Number.isInteger(n) || n < 1) return;
    if (this.gearOpen()) {
      const archetype = this.archetypes[n - 1];
      if (archetype) {
        event.preventDefault();
        this.draftArchetype.set(archetype.id);
      }
      return;
    }
    const trait = this.traits[n - 1];
    if (trait) {
      event.preventDefault();
      this.toggle(trait.id);
    }
  }

  onLevel(event: Event): void {
    this.level.set(Number((event.target as HTMLInputElement).value));
    if (!this.budgetTouched) this.draftBudget.set(quickGearBudget(this.level()));
  }

  onBudget(event: Event): void {
    this.budgetTouched = true;
    this.draftBudget.set(Number((event.target as HTMLInputElement).value));
  }

  onRange(target: 'specialization' | 'draftAmount' | 'draftValue', event: Event): void {
    this[target].set(Number((event.target as HTMLInputElement).value));
  }
}
