import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatComponent } from "./sheet/stat/stat.component";
import { StatsComponent } from "./sheet/stats/stats.component";
import { CharacterComponent } from "./sheet/character/character.component";
import { SheetComponent } from "./sheet/sheet.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StatComponent, StatsComponent, CharacterComponent, SheetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
