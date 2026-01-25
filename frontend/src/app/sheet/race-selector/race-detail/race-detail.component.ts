import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Race } from '../../../model/race.model';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

@Component({
  selector: 'app-race-detail',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  templateUrl: './race-detail.component.html',
  styleUrl: './race-detail.component.css'
})
export class RaceDetailComponent {
  @Input() race!: Race;
  @Output() confirm = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onConfirm() { this.confirm.emit(); }
  onEdit() { this.edit.emit(); }
  onDelete() { this.delete.emit(); }
}
