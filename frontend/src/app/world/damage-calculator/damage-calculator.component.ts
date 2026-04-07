import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiceRollEvent, WorldSocketService } from '../../services/world-socket.service';

export interface DamageSeverity {
  label: string;
  multiplier: number;
  color: string;
  icon: string;
}

export interface DamageRollResult {
  formula: string;
  individualRolls: number[];
  total: number;
  severity: DamageSeverity;
  effektivitaet: number;
  timestamp: Date;
}

const SEVERITY_OPTIONS: DamageSeverity[] = [
  { label: 'Schwacher Treffer',    multiplier: 1, color: '#6b7280', icon: '◦' },
  { label: 'Normaler Treffer',     multiplier: 2, color: '#f59e0b', icon: '◈' },
  { label: 'Starker Treffer',      multiplier: 3, color: '#f97316', icon: '◉' },
  { label: 'Kritischer Treffer',   multiplier: 4, color: '#ef4444', icon: '◎' },
  { label: 'Tödlicher Treffer',    multiplier: 5, color: '#dc2626', icon: '✦' },
];

@Component({
  selector: 'app-damage-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './damage-calculator.component.html',
  styleUrl: './damage-calculator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DamageCalculatorComponent {
  @Input() worldName: string = '';
  @Output() rolled = new EventEmitter<DamageRollResult>();

  private worldSocket = inject(WorldSocketService);
  private cdr = inject(ChangeDetectorRef);

  readonly severityOptions = SEVERITY_OPTIONS;

  effektivitaet: number = 6;
  stabilitaet: number = 0;
  selectedSeverity: DamageSeverity = SEVERITY_OPTIONS[1]; // Normaler Treffer default

  lastResult: DamageRollResult | null = null;
  isRolling = false;

  get formula(): string {
    return `${this.selectedSeverity.multiplier}d${this.effektivitaet}`;
  }

  selectSeverity(severity: DamageSeverity): void {
    this.selectedSeverity = severity;
    this.cdr.markForCheck();
  }

  rollDamage(): void {
    if (this.isRolling) return;
    if (!this.effektivitaet || this.effektivitaet < 2 || this.effektivitaet > 100) return;

    this.isRolling = true;
    this.cdr.markForCheck();

    const count = this.selectedSeverity.multiplier;
    const sides = this.effektivitaet;
    const rolls: number[] = [];

    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0);
    const formula = `${count}d${sides}`;

    const result: DamageRollResult = {
      formula,
      individualRolls: rolls,
      total,
      severity: this.selectedSeverity,
      effektivitaet: sides,
      timestamp: new Date(),
    };

    this.lastResult = result;

    // Broadcast via the existing roll system so it appears in lobby
    if (this.worldName) {
      const rollEvent: DiceRollEvent = {
        id: `dmg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        worldName: this.worldName,
        characterId: 'dm',
        characterName: 'Spielleiter',
        diceType: sides,
        diceCount: count,
        rolls,
        result: total,
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

  get finalDamage(): number {
    if (!this.lastResult) return 0;
    const stab = Math.max(0, this.stabilitaet || 0);
    return Math.round(this.lastResult.total * (100 / (100 + stab)));
  }

  onEffektivitaetInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val >= 2 && val <= 100) {
      this.effektivitaet = val;
    }
    this.cdr.markForCheck();
  }

  onStabilitaetInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val >= 0) {
      this.stabilitaet = val;
    }
    this.cdr.markForCheck();
  }

  trackBySeverity(_: number, s: DamageSeverity): number {
    return s.multiplier;
  }
}
