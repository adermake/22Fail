import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { StatComponent } from '../stat/stat.component';
import { CharacterSheet } from '../../model/character-sheet-model';
import { FormsModule } from '@angular/forms';
import { JsonPatch } from '../../model/json-patch.model';
import { TrueStatsService } from '../../services/true-stats.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  imports: [CardComponent, StatComponent, FormsModule, CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;

  @Output() patch = new EventEmitter<JsonPatch>();
  
  public trueStats = inject(TrueStatsService);

  get availableFreeStatPoints(): number {
    return this.trueStats.calculateAvailableFreeStatPoints(this.sheet);
  }

  get totalFreeStatPoints(): number {
    return this.trueStats.calculateTotalFreeStatPoints(this.sheet);
  }

  get spentFreeStatPoints(): number {
    return this.trueStats.calculateSpentFreeStatPoints(this.sheet);
  }

  get fokusValue(): number {
    return this.trueStats.calculateFokusMax(this.sheet);
  }

  get movementSpeed(): number {
    return this.trueStats.calculateMovementSpeed(this.sheet);
  }

  get effectiveSpeed(): number {
    return this.trueStats.calculateEffectiveSpeed(this.sheet);
  }

  get grundbonus(): number {
    return this.trueStats.calculateGrundbonus(this.sheet);
  }

  get reaktionswert(): number {
    return this.trueStats.calculateReaktionswert(this.sheet);
  }

  get grundbonusTooltip(): string {
    return this.trueStats.getGrundbonusFormulaTooltip(this.sheet);
  }

  get reaktionTooltip(): string {
    return this.trueStats.getReaktionswertFormulaTooltip(this.sheet);
  }

  get movementTooltip(): string {
    return this.trueStats.getMovementFormulaTooltip(this.sheet);
  }

  get fokusTooltip(): string {
    return this.trueStats.getFokusFormulaTooltip(this.sheet);
  }

  get armorNegationTooltip(): string {
    return this.trueStats.getArmorNegationFormulaTooltip(this.sheet);
  }

  adjustStatBonusPoints(delta: number): void {
    const current = this.sheet.freeStatPointsBonus || 0;
    const newValue = Math.max(0, current + delta);
    this.patch.emit({ path: 'freeStatPointsBonus', value: newValue });
  }

  updateDerivedBonus(field: 'grundbonusBonus' | 'reaktionswertBonus', value: number): void {
    this.patch.emit({ path: field, value: value });
  }

  ngOnInit() {
    if (this.sheet.fokusMultiplier === undefined) {
      this.sheet.fokusMultiplier = 1;
    }
    if (this.sheet.fokusBonus === undefined) {
      this.sheet.fokusBonus = 0;
    }
  }

  updateFokusSetting(field: 'fokusBonus' | 'fokusMultiplier', value: any) {
    this.patch.emit({ path: field, value: value });
  }

  updateField(prefix: string, patch: JsonPatch) {
    patch.path = prefix + '.' + patch.path;
    this.patch.emit(patch);
  }
}
