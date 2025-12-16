import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { StatsComponent } from './stats/stats.component';
import { CharacterComponent } from './character/character.component';
import { LevelclassComponent } from './levelclass/levelclass.component';
import { CurrentstatComponent } from './currentstat/currentstat.component';
import { CurrentstatsComponent } from './currentstats/currentstats.component';
import { PortraitComponent } from './portrait/portrait.component';
import { CharacterSheetService } from './sheet.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sheet',
  imports: [
    StatsComponent,
    CharacterComponent,
    LevelclassComponent,
    CurrentstatComponent,
    CurrentstatsComponent,
    PortraitComponent,
  ],
  templateUrl: './sheet.component.html',
  styleUrl: './sheet.component.css',
})
export class SheetComponent implements OnInit {
  sheetservice: CharacterSheetService = inject(CharacterSheetService);
  private cdr = inject(ChangeDetectorRef);
  constructor(private route: ActivatedRoute) {}
  /*
  async ngOnInit() {
    // Get the ID from the URL
    console.log('INIT START');

    this.sheetservice.characterSheetId = this.route.snapshot.paramMap.get('id')!;
    console.log('ID' + this.sheetservice.characterSheetId);
    // Load the character sheet
    this.sheetservice.currentSheet = await this.sheetservice.loadCharacter(
      this.sheetservice.characterSheetId
    );


    if (!this.sheetservice.currentSheet) {
      this.sheetservice.currentSheet = JSON.parse(JSON.stringify(this.sheetservice.starterSheet));
      console.log('GOT NOTHING');
      // WE REACH THIS !!! GOOD
    } else {
      console.log('GOT SOMETHING');
    }
    this.cdr.detectChanges();
    console.log('INIT DONE');
  }
    */
  async ngOnInit() {
    this.sheetservice.characterSheetId = this.route.snapshot.paramMap.get('id')!;

    // 1️⃣ Load initial state
    this.sheetservice.currentSheet = await this.sheetservice.loadCharacter(
      this.sheetservice.characterSheetId
    );

    if (!this.sheetservice.currentSheet) {
      console.log('WAS null creating new');
      this.sheetservice.currentSheet = structuredClone(this.sheetservice.starterSheet);
    } else {
      console.log('Recieved ' + JSON.stringify(this.sheetservice.currentSheet));
    }

    // 2️⃣ Connect websocket
    this.sheetservice.connectSocket();

    // 3️⃣ Join room
    this.sheetservice.joinCharacter(this.sheetservice.characterSheetId);

    this.sheetservice.characterSheet$.subscribe((event) => {
      this.cdr.detectChanges(); // detect changes in the component
    });
    this.cdr.detectChanges();
  }
}
