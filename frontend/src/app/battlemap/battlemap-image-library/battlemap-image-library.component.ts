import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibraryImage } from '../../model/battlemap.model';

@Component({
  selector: 'app-battlemap-image-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battlemap-image-library.component.html',
  styleUrls: ['./battlemap-image-library.component.css']
})
export class BattlemapImageLibraryComponent {
  // Inputs
  images = input<LibraryImage[]>([]);
  isGM = input<boolean>(false);

  // Outputs
  loadImages = output<FileList>();
  deleteImage = output<string>(); // image ID
  renameImage = output<{ id: string; name: string }>();
  dragStart = output<LibraryImage>();

  // Local state
  renamingId: string | null = null;
  renamingValue: string = '';

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loadImages.emit(input.files);
      input.value = ''; // Reset so same file can be selected again
    }
  }

  onDragStart(event: DragEvent, image: LibraryImage) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('application/json', JSON.stringify(image));
    }
    this.dragStart.emit(image);
  }

  startRename(image: LibraryImage, event: Event) {
    event.stopPropagation();
    this.renamingId = image.id;
    this.renamingValue = image.name;
  }

  cancelRename() {
    this.renamingId = null;
    this.renamingValue = '';
  }

  saveRename(id: string) {
    if (this.renamingValue.trim()) {
      this.renameImage.emit({ id, name: this.renamingValue.trim() });
    }
    this.cancelRename();
  }

  onDelete(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Delete this image from the library?')) {
      this.deleteImage.emit(id);
    }
  }
}
