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
    const intelligence = this.sheet.intelligence?.current || 10;
    const base = Math.floor(intelligence / 2) + 5;
    return Math.floor((base + (this.sheet.fokusBonus || 0)) * (this.sheet.fokusMultiplier || 1));
  }

  get grundbonus(): number {
    return Math.floor((this.sheet.level || 1) / 5) + (this.sheet.grundbonusBonus || 0);
  }

  get reaktionswert(): number {
    const wille = this.sheet.chill?.current || 10;
    return 10 - Math.floor(wille / 5) + (this.sheet.reaktionswertBonus || 0);
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
