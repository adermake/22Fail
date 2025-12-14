import { Component, inject, Input } from '@angular/core';
import { CardComponent } from "../../shared/card/card.component";
import { PortraitComponent } from "../portrait/portrait.component";
import { CharacterSheet, CharacterSheetService } from '../sheet.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-character',
  imports: [CardComponent, PortraitComponent,FormsModule,CommonModule],
  templateUrl: './character.component.html',
  styleUrl: './character.component.css',
})
export class CharacterComponent {

  @Input({required:true}) sheet!: CharacterSheet;

}
