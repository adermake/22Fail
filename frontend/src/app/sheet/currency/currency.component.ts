import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { CardComponent } from '../../shared/card/card.component';
import { COIN_WEIGHT } from '../../model/currency-model';

@Component({
  selector: 'app-currency',
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.css',
})
export class CurrencyComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.sheet.currency) {
      this.sheet.currency = {
        copper: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      };
    }
  }

  get totalCoins(): number {
    return (
      (this.sheet.currency?.copper || 0) +
      (this.sheet.currency?.silver || 0) +
      (this.sheet.currency?.gold || 0) +
      (this.sheet.currency?.platinum || 0)
    );
  }

  get currencyWeight(): number {
    return this.totalCoins * COIN_WEIGHT;
  }

  get totalValue(): number {
    // Convert to gold pieces for display (copper=0.01g, silver=0.1g, gold=1g, platinum=10g)
    return (
      (this.sheet.currency?.copper || 0) * 0.01 +
      (this.sheet.currency?.silver || 0) * 0.1 +
      (this.sheet.currency?.gold || 0) +
      (this.sheet.currency?.platinum || 0) * 10
    );
  }

  updateCurrency(type: 'copper' | 'silver' | 'gold' | 'platinum', value: any) {
    // Update locally first for immediate feedback
    if (!this.sheet.currency) {
      this.sheet.currency = { copper: 0, silver: 0, gold: 0, platinum: 0 };
    }
    this.sheet.currency[type] = Math.max(0, Number(value) || 0);
    this.cd.detectChanges();

    // Emit patch
    this.patch.emit({
      path: `currency.${type}`,
      value: this.sheet.currency[type],
    });
  }
}