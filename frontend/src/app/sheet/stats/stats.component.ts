import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { StatComponent } from '../stat/stat.component';
import { CharacterSheet } from '../../model/character-sheet-model';
import { FormsModule } from '@angular/forms';
import { JsonPatch } from '../../model/json-patch.model';

@Component({
  selector: 'app-stats',
  imports: [CardComponent, StatComponent, FormsModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;

  @Output() patch = new EventEmitter<JsonPatch>();

  updateField(prefix: string, patch: JsonPatch) {
    patch.path = prefix + '.' + patch.path;
    this.patch.emit(patch);
  }
}
