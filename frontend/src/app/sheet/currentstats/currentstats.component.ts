import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SheetComponent } from '../sheet.component';
import { CurrentstatComponent } from '../currentstat/currentstat.component';
import { CardComponent } from '../../shared/card/card.component';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-currentstats',
  imports: [CurrentstatComponent, CardComponent, FormsModule],
  templateUrl: './currentstats.component.html',
  styleUrl: './currentstats.component.css',
})
export class CurrentstatsComponent {
  @Input() sheet!: CharacterSheet;

  @Output() patch = new EventEmitter<JsonPatch>();

  updateField(prefix: string, patch: JsonPatch) {
    patch.path = prefix + '.' + patch.path;
    console.log("PATCHING "+patch.path);
    this.patch.emit(patch);
  }
}
