import { Component, EventEmitter, HostListener, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';

type InfoTab = 'grundlagen' | 'stats' | 'ausruestung' | 'schmieden' | 'materialien' | 'traenke';

@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './game-info.component.html',
  styleUrl: './game-info.component.css',
})
export class GameInfoComponent {
  @Output() close = new EventEmitter<void>();
  
  activeTab = signal<InfoTab>('grundlagen');

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.onClose();
  }

  setTab(tab: InfoTab) {
    this.activeTab.set(tab);
  }

  onClose() {
    this.close.emit();
  }
}
