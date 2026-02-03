import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryImage } from '../../model/battlemap.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { BattlemapCharacterListComponent } from '../battlemap-character-list/battlemap-character-list.component';
import { BattlemapImageLibraryComponent } from '../battlemap-image-library/battlemap-image-library.component';
import { BattlemapToken } from '../../model/battlemap.model';

@Component({
  selector: 'app-battlemap-sidebar',
  standalone: true,
  imports: [CommonModule, BattlemapCharacterListComponent, BattlemapImageLibraryComponent],
  templateUrl: './battlemap-sidebar.component.html',
  styleUrls: ['./battlemap-sidebar.component.css']
})
export class BattlemapSidebarComponent {
  // Inputs
  characters = input<{ id: string; sheet: CharacterSheet }[]>([]);
  tokensOnMap = input<BattlemapToken[]>([]);
  images = input<LibraryImage[]>([]);
  isGM = input<boolean>(false);

  // Outputs
  loadImages = output<FileList>();
  deleteImage = output<string>();
  renameImage = output<{ id: string; name: string }>();
  dragStart = output<LibraryImage>();

  // Local state
  activeTab: 'characters' | 'images' = 'characters';

  switchTab(tab: 'characters' | 'images') {
    this.activeTab = tab;
  }
}
