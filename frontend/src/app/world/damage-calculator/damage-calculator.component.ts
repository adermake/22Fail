import {
  Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiceRollEvent, WorldSocketService } from '../../services/world-socket.service';

export interface DamageSeverity {
  label: string;
  /** Dice count for standard severities; display hint for special ones */
  multiplier: number;
  color: string;
  icon: string;
}

export interface DamageRollPlan {
  diceCount: number;
  flatBonus: number;
  formula: string;
  displayMulti: string;
}

export interface DamageRollResult {
  formula: string;
  individualRolls: number[];
  flatBonus: number;
  total: number;
  severity: DamageSeverity;
  effektivitaet: number;
  stabilitaet: number;
  finalDamage: number;
  timestamp: Date;
}

const SEVERITY_OPTIONS: DamageSeverity[] = [
  { label: 'Schwacher Treffer',   multiplier: 1, color: '#eab308', icon: '\u25E6' },
  { label: 'Normaler Treffer',    multiplier: 2, color: '#f59e0b', icon: '\u25C8' },
  { label: 'Starker Treffer',     multiplier: 3, color: '#f97316', icon: '\u25C9' },
  { label: 'Kritischer Treffer',  multiplier: 3, color: '#ef4444', icon: '\u25CE' },
  { label: 'T\u00F6dlicher Treffer',   multiplier: 3, color: '#dc2626', icon: '\u2726' },
];

const STORAGE_KEY_STAB = 'dmg-calc-last-stab';
const STORAGE_KEY_HISTORY = 'dmg-calc-history';
const MAX_HISTORY = 20;

@Component({
  selector: 'app-damage-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './damage-calculator.component.html',
  styleUrl: './damage-calculator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DamageCalculatorComponent implements OnChanges, OnInit, OnDestroy {
  @Input() worldName: string = '';
  @Input() characterName: string = 'Spielleiter';
  @Input() characterId: string = 'dm';
  /** Pre-fills the Effektivit\u00E4t field (e.g. from weapon efficiency) */
  @Input() initialEffektivitaet?: number;
  @Output() rolled = new EventEmitter<DamageRollResult>();
  @Output() close = new EventEmitter<void>();

  private worldSocket = inject(WorldSocketService);
  private cdr = inject(ChangeDetectorRef);

  readonly severityOptions = SEVERITY_OPTIONS;

  effektivitaet: number = 6;
  stabilitaet: number = 0;
  selectedSeverity: DamageSeverity = SEVERITY_OPTIONS[1]; // Normaler Treffer default

  lastResult: DamageRollResult | null = null;
  isRolling = false;
  rollHistory: DamageRollResult[] = [];

  private rollSound: HTMLAudioElement | null = null;

  get formula(): string {
    return this.getRollPlan(this.selectedSeverity, this.effektivitaet).formula;
  }

  getSeverityDisplay(severity: DamageSeverity): string {
    return this.getRollPlan(severity, this.effektivitaet).displayMulti;
  }

  private getRollPlan(severity: DamageSeverity, eff: number): DamageRollPlan {
    const sides = Math.max(2, eff || 2);
    switch (severity.label) {
      case 'Kritischer Treffer':
        return {
          diceCount: 3,
          flatBonus: sides,
          formula: `${sides} + 3d${sides}`,
          displayMulti: `Eff + ×3`,
        };
      case 'T\u00F6dlicher Treffer':
        return {
          diceCount: 3,
          flatBonus: sides * 2,
          formula: `${sides * 2} + 3d${sides}`,
          displayMulti: `2×Eff + ×3`,
        };
      default:
        return {
          diceCount: severity.multiplier,
          flatBonus: 0,
          formula: `${severity.multiplier}d${sides}`,
          displayMulti: `×${severity.multiplier}`,
        };
    }
  }

  ngOnInit(): void {
    // Lock background scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    this.initRollSound();

    const savedStab = localStorage.getItem(STORAGE_KEY_STAB);
    if (savedStab !== null) {
      const val = parseInt(savedStab, 10);
      if (!isNaN(val) && val >= 0) {
        this.stabilitaet = val;
      }
    }

    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        const parsed: DamageRollResult[] = JSON.parse(savedHistory);
        // Restore Date objects (JSON.parse turns them into strings)
        this.rollHistory = parsed.map(e => ({ ...e, timestamp: new Date(e.timestamp) }));
      } catch {
        this.rollHistory = [];
      }
    }
  }

  ngOnDestroy(): void {
    // Restore background scroll
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialEffektivitaet'] && changes['initialEffektivitaet'].currentValue != null) {
      this.effektivitaet = changes['initialEffektivitaet'].currentValue;
      this.cdr.markForCheck();
    }
  }

  selectSeverity(severity: DamageSeverity): void {
    this.selectedSeverity = severity;
    this.cdr.markForCheck();
  }

  onStabChange(): void {
    localStorage.setItem(STORAGE_KEY_STAB, String(this.stabilitaet || 0));
  }

  rollDamage(): void {
    if (this.isRolling) return;
    if (!this.effektivitaet || this.effektivitaet < 2) return;

    this.isRolling = true;
    this.playRollSound();
    this.cdr.markForCheck();

    const plan = this.getRollPlan(this.selectedSeverity, this.effektivitaet);
    const count = plan.diceCount;
    const sides = this.effektivitaet;
    const rolls: number[] = [];

    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const diceSum = rolls.reduce((a, b) => a + b, 0);
    const total = plan.flatBonus + diceSum;
    const formula = plan.formula;
    const stab = Math.max(0, this.stabilitaet || 0);
    const finalDmg = stab > 0 ? Math.round(total * (100 / (100 + stab))) : total;

    const result: DamageRollResult = {
      formula,
      individualRolls: rolls,
      flatBonus: plan.flatBonus,
      total,
      severity: this.selectedSeverity,
      effektivitaet: sides,
      stabilitaet: stab,
      finalDamage: finalDmg,
      timestamp: new Date(),
    };

    this.lastResult = result;
    this.rollHistory = [result, ...this.rollHistory].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.rollHistory));

    if (this.worldName) {
      const rollEvent: DiceRollEvent = {
        id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        worldName: this.worldName,
        characterId: this.characterId,
        characterName: this.characterName,
        diceType: sides,
        diceCount: count,
        rolls,
        result: finalDmg,
        rawResult: total,
        stabilitaet: stab,
        finalDamage: finalDmg,
        bonuses: [],
        timestamp: result.timestamp,
        isSecret: false,
        actionName: `${this.selectedSeverity.icon} ${this.selectedSeverity.label}`,
        actionIcon: this.selectedSeverity.icon,
        actionColor: this.selectedSeverity.color,
      };
      this.worldSocket.sendDiceRoll(rollEvent);
    }

    this.rolled.emit(result);

    setTimeout(() => {
      this.isRolling = false;
      this.cdr.markForCheck();
    }, 400);

    this.cdr.markForCheck();
  }

  /** Load a history entry's values back into the inputs */
  useHistoryEntry(entry: DamageRollResult): void {
    this.effektivitaet = entry.effektivitaet;
    this.stabilitaet = entry.stabilitaet;
    const sev = SEVERITY_OPTIONS.find(s => s.label === entry.severity.label);
    if (sev) this.selectedSeverity = sev;
    localStorage.setItem(STORAGE_KEY_STAB, String(entry.stabilitaet));
    this.cdr.markForCheck();
  }

  trackBySeverity(_: number, s: DamageSeverity): string {
    return s.label;
  }

  trackByTimestamp(_: number, r: DamageRollResult): number {
    return r.timestamp.getTime();
  }

  private initRollSound(): void {
    this.rollSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVQIj6PLwZ14MQ+E1uvl0pZlAQBfnNPq7LqBT+7uubvV8ei/Nx1u0fbuqXkmAKzw//+rZTofrdnt/5Z3LyKWy+/+tX0vH4fG7f/Hi0osaMjq/7eYPyZYsuT/1aNREV657/z/l2wdB1qf2er9qnwyDl+XyvKvhT4UUInB7rKKRxVGbJ/Xx5dOICdOXoO2s2orCBYrVHOhsGszCgAJGEBniqhiOwobJy9EYoOUZEoqKjQaHSw+VGmBbkguNjwsGRQhNERZbmtSQUxNQy0eDRQjN05mZU5DSkI9Ly0hERUiMEhebVZAPz02Li8oIiMiLDZIVk1BP0E8NjM0Li4sJiorNEFMRDs+QDs3NDUyNDEvMjY8Q0M9PD8+Ozg3NjY2NzQ4PEA+Ozw+Pjo5ODg5ODk6Ozw8Ozs8PDw7Ozs7PDw8PD08PD09PT4+Pj4+Pz8/Pz9AQEBAQEBAQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB');
  }

  private playRollSound(): void {
    if (this.rollSound) {
      this.rollSound.currentTime = 0;
      this.rollSound.volume = 0.3;
      this.rollSound.play().catch(() => {});
    }
  }
}
