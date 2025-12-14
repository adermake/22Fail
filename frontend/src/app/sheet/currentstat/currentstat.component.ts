import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { required } from '@angular/forms/signals';
import { CharacterSheet, CharacterSheetService, FormulaType } from '../sheet.service';

@Component({
  selector: 'app-currentstat',
  imports: [CommonModule, FormsModule],
  templateUrl: './currentstat.component.html',
  styleUrl: './currentstat.component.css',
})
export class CurrentstatComponent {
  sheetservice: CharacterSheetService = inject(CharacterSheetService);

  @Input() name!: string;
  @Input() current!: number;
  @Input() color!: string;
  @Input() base!: number;
  @Input() bonus!: number;
  @Input() formula!: FormulaType;

  get statusMax(): number {
    var sheet = this.sheetservice.currentSheet;
    var value = this.base + this.bonus;
    switch (this.formula) {
      case FormulaType.LIFE:
        return value+ sheet.constitution.current * 5;
      case FormulaType.ENERGY:
        return value + sheet.dexterity.current * 5;
      case FormulaType.MANA:
        return value + sheet.intelligence.current * 5;
      default:
        return value;
    }
  }
}
