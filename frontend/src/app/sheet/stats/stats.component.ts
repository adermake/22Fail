import { Component, inject, Input } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { StatComponent } from '../stat/stat.component';
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-stats',
  imports: [CardComponent, StatComponent],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  @Input({required:true}) sheet!: CharacterSheet;
  
}
