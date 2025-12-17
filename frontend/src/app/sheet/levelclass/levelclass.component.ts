import { Component, Input } from '@angular/core';
import { CardComponent } from "../../shared/card/card.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-levelclass',
  imports: [CardComponent,CommonModule,FormsModule],
  templateUrl: './levelclass.component.html',
  styleUrl: './levelclass.component.css',
})
export class LevelclassComponent {
  @Input({required:true}) sheet!: CharacterSheet;
}
