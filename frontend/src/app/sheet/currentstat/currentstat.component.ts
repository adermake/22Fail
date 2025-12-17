import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { required } from '@angular/forms/signals';
import { CharacterSheet } from '../../model/character-sheet-model';
import { FormulaType } from '../../model/formula-type.enum';
import { JsonPatch } from '../../model/json-patch.model';

@Component({
  selector: 'app-currentstat',
  imports: [CommonModule, FormsModule],
  templateUrl: './currentstat.component.html',
  styleUrl: './currentstat.component.css',
})
export class CurrentstatComponent {
  @Input() sheet!: CharacterSheet;
  @Input() name!: string;
  @Input() current!: number;
  @Input() color!: string;
  @Input() base!: number;
  @Input() bonus!: number;
  @Input() formula!: FormulaType;
  constructor(private cd: ChangeDetectorRef) {}
  get statusMax(): number {
    var value = this.base + this.bonus;
    switch (this.formula) {
      case FormulaType.LIFE:
        return value + this.sheet.constitution.current * 5;
      case FormulaType.ENERGY:
        return value + this.sheet.dexterity.current * 5;
      case FormulaType.MANA:
        return value + this.sheet.intelligence.current * 5;
      default:
        return value;
    }
  }

  @Output() patch = new EventEmitter<JsonPatch>();
  updateBase(path: string, value: any) {
    this.base = value;
    this.patch.emit({ path: path, value });
    this.cd.detectChanges();
  }
  updateCurrent(path: string, value: any) {
    this.current = value;
    this.patch.emit({ path: path, value });
    this.cd.detectChanges();
  }
  updateBonus(path: string, value: any) {
    this.bonus= value;
    this.patch.emit({ path, value });
    this.cd.detectChanges();
  }
}
