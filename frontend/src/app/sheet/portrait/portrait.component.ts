import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { CharacterApiService } from '../../services/character-api.service';

@Component({
  selector: 'app-portrait',
  imports: [CommonModule, FormsModule],
  templateUrl: './portrait.component.html',
  styleUrl: './portrait.component.css',
})
export class PortraitComponent {
  isDragging = false;
  @Output() baseImage = new EventEmitter<string>();
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) charId!: string;
  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private api: CharacterApiService
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    this.zone.run(() => {
      this.isDragging = false;

      const file = event.dataTransfer?.files?.[0];
      if (file) {
        this.loadImage(file);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.loadImage(input.files[0]);
    }
  }

  private async loadImage(file: File) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.sheet.portrait = base64;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      await this.api.uploadPortrait(this.charId, file);
    } catch (err) {
      console.error('Failed to upload portrait:', err);
    }
  }
}
