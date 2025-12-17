import { Component, inject, Input } from '@angular/core';
import { SheetComponent } from "../sheet.component";
import { CurrentstatComponent } from "../currentstat/currentstat.component";
import { CardComponent } from "../../shared/card/card.component";
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-currentstats',
  imports: [CurrentstatComponent, CardComponent],
  templateUrl: './currentstats.component.html',
  styleUrl: './currentstats.component.css',
})
export class CurrentstatsComponent {

  @Input() sheet!: CharacterSheet;
}
