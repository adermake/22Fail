import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Race } from '../../../model/race.model';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

@Component({
  selector: 'app-race-card',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  templateUrl: './race-card.component.html',
  styleUrl: './race-card.component.css'
})
export class RaceCardComponent {
  @Input() race!: Race;
  @Input() isSelected = false;
  @Output() select = new EventEmitter<Race>();
  @Output() edit = new EventEmitter<Race>();

  onClick() {
    this.select.emit(this.race);
  }

  onDoubleClick() {
    this.edit.emit(this.race);
  }
}
