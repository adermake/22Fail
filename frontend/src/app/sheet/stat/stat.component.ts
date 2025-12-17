import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
} from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { required } from '@angular/forms/signals';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatBlock } from '../../model/stat-block.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';

@Component({
  selector: 'app-stat',
  imports: [CardComponent, FormsModule, CommonModule],
  templateUrl: './stat.component.html',
  styleUrl: './stat.component.css',
})
export class StatComponent {
  @Input({ required: true }) stat!: StatBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  isPopupVisible = false;

  constructor(private cd: ChangeDetectorRef) {}

  get total(): number {
    this.stat.current = (this.stat.base + this.stat.bonus + this.sheet.level / this.stat.gain) | 0;
    return this.stat.current;
  }

  get bonusNumeric(): number {
    return (-5 + this.total / 2) | 0;
  }

  get bonusValue(): string {
    const value = this.bonusNumeric;
    if (value < 0) {
      return '' + value;
    } else if (value > 0) {
      return '+' + value;
    }
    return '0';
  }
  pressed() {
    this.isPopupVisible = true;
    setTimeout(() => {
      this.isPopupVisible = false;
      this.cd.detectChanges();
    }, 1000);
  }

  get bonusClass(): string {
    const value = this.bonusNumeric;
    if (value < 0) return 'negative';
    if (value > 0) return 'positive';
    return '';
  }

  get popupClass(): string {
    if (this.isPopupVisible) return 'show';
    if (!this.isPopupVisible) return '';
    return '';
  }
  ngOnChanges() {
    this.cd.markForCheck(); // Trigger detection when inputs change
  }
  @Output() patch = new EventEmitter<JsonPatch>();
  updateField(path: string, value: any) {
    (this.stat as any)[path] = Number(value);
    console.log('Emitting patch:', { path, value });
    this.patch.emit({ path, value });
    this.cd.detectChanges();
  }
}
