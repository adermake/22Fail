import { Component, inject } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { StatComponent } from '../stat/stat.component';
import { CharacterSheetService } from '../sheet.service';

@Component({
  selector: 'app-stats',
  imports: [CardComponent, StatComponent],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  sheetservice: CharacterSheetService = inject(CharacterSheetService);
}
