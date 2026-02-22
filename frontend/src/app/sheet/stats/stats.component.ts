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
    return Math.floor((intelligence + (this.sheet.fokusBonus || 0)) * (this.sheet.fokusMultiplier || 1));
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
