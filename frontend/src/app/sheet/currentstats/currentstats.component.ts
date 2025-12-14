import { Component, inject } from '@angular/core';
import { SheetComponent } from "../sheet.component";
import { CurrentstatComponent } from "../currentstat/currentstat.component";
import { CardComponent } from "../../shared/card/card.component";
import { CharacterSheetService } from '../sheet.service';

@Component({
  selector: 'app-currentstats',
  imports: [CurrentstatComponent, CardComponent],
  templateUrl: './currentstats.component.html',
  styleUrl: './currentstats.component.css',
})
export class CurrentstatsComponent {

  sheetservice: CharacterSheetService = inject(CharacterSheetService);
}
