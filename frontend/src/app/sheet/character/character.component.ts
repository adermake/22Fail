import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { PortraitComponent } from '../portrait/portrait.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RaceSelectorComponent } from '../race-selector/race-selector.component';

@Component({
  selector: 'app-character',
  imports: [CardComponent, PortraitComponent, FormsModule, CommonModule, RaceSelectorComponent],
  templateUrl: './character.component.html',
  styleUrl: './character.component.css',
})
export class CharacterComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) characterId!: string;
  @Output() patch = new EventEmitter<JsonPatch>();

  showRaceSelector = false;

  updateField(path: string, value: any) {
    this.patch.emit({ path, value });
  }

  openRaceSelector() {
    this.showRaceSelector = true;
  }

  closeRaceSelector() {
    this.showRaceSelector = false;
  }

  onRacePatch(patch: JsonPatch) {
    this.patch.emit(patch);
  }

  openWorldLobby() {
    if (this.sheet.worldName) {
      window.open(`/lobby/${this.sheet.worldName}`, '_blank');
    }
  }
}
