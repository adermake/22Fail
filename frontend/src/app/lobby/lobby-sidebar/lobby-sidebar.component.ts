/**
 * Lobby Sidebar Component
 * 
 * Tabbed sidebar showing Characters and Images.
 * Characters can be dragged onto the grid.
 * Images can be uploaded and managed.
 */

import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { Token, LibraryImage, LibraryTexture } from '../../model/lobby.model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

@Component({
  selector: 'app-lobby-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './lobby-sidebar.component.html',
  styleUrls: ['./lobby-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbySidebarComponent {
  // Inputs
  @Input() characters: { id: string; sheet: CharacterSheet }[] = [];
  @Input() tokensOnMap: Token[] = [];
  @Input() images: LibraryImage[] = [];
  @Input() textures: LibraryTexture[] = [];
  @Input() isGM = false;
  @Input() selectedTextureId: string | null = null;

  // Outputs
  @Output() loadImages = new EventEmitter<FileList>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() renameImage = new EventEmitter<{ id: string; name: string }>();
  @Output() dragStart = new EventEmitter<LibraryImage>();
  @Output() loadTextures = new EventEmitter<FileList>();
  @Output() selectTexture = new EventEmitter<string | null>();

  // Local state
  activeTab = signal<'characters' | 'images' | 'textures'>('characters');
  editingImageId = signal<string | null>(null);
  editingName = signal('');
  searchQuery = signal('');

  // Methods
  switchTab(tab: 'characters' | 'images' | 'textures'): void {
    this.activeTab.set(tab);
  }

  // Character methods
  onCharacterDragStart(event: DragEvent, charId: string): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'character',
      characterId: charId
    }));
  }

  isTokenOnMap(charId: string): boolean {
    return this.tokensOnMap.some(t => t.characterId === charId);
  }

  get filteredCharacters() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.characters;
    return this.characters.filter(c => 
      c.sheet.name?.toLowerCase().includes(query) || 
      c.id.toLowerCase().includes(query)
    );
  }

  // Image methods
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loadImages.emit(input.files);
      input.value = ''; // Reset for future uploads
    }
  }

  onImageDragStart(event: DragEvent, image: LibraryImage): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'library-image',
      imageId: image.imageId,
      width: image.width,
      height: image.height
    }));
    this.dragStart.emit(image);
  }

  startRename(image: LibraryImage, event: MouseEvent): void {
    event.stopPropagation();
    this.editingImageId.set(image.id);
    this.editingName.set(image.name);
  }

  saveRename(): void {
    const id = this.editingImageId();
    const name = this.editingName().trim();
    if (id && name) {
      this.renameImage.emit({ id, name });
    }
    this.cancelRename();
  }

  cancelRename(): void {
    this.editingImageId.set(null);
    this.editingName.set('');
  }

  onRenameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.saveRename();
    } else if (event.key === 'Escape') {
      this.cancelRename();
    }
  }

  confirmDelete(id: string, name: string): void {
    if (confirm(`Delete "${name}"?`)) {
      this.deleteImage.emit(id);
    }
  }

  get filteredImages() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.images;
    return this.images.filter(img => 
      img.name.toLowerCase().includes(query)
    );
  }

  // Texture methods
  onTextureFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loadTextures.emit(input.files);
      input.value = ''; // Reset for future uploads
    }
  }

  onTextureSelect(textureId: string): void {
    if (this.selectedTextureId === textureId) {
      this.selectTexture.emit(null); // Deselect
    } else {
      this.selectTexture.emit(textureId);
    }
  }

  get filteredTextures() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.textures;
    return this.textures.filter(tex => 
      tex.name.toLowerCase().includes(query)
    );
  }
}
