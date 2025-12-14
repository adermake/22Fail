import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, NgZone, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-portrait',
  imports: [CommonModule,FormsModule],
  templateUrl: './portrait.component.html',
  styleUrl: './portrait.component.css',
})
export class PortraitComponent {
  imagePreview: string | ArrayBuffer | null = null;
  isDragging = false;

  constructor(private zone: NgZone, private cd: ChangeDetectorRef) {}

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

    console.log("PRESS");
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

private loadImage(file: File) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
        this.imagePreview = reader.result;
        this.cd.detectChanges(); // <-- force update
    };

    reader.readAsDataURL(file);
}
}
