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
import { Token, LibraryImage, LibraryTexture, Layer, LayerType } from '../../model/lobby.model';
import { NpcStatblock } from '../../model/npc-statblock.model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { DiceRollEvent } from '../../services/world-socket.service';
import { LobbyLayerPanelComponent } from '../lobby-layer-panel/lobby-layer-panel.component';

type SidebarTab = 'characters' | 'images' | 'textures' | 'layers' | 'rolls';

@Component({
  selector: 'app-lobby-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe, LobbyLayerPanelComponent],
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
  @Input() npcStatblocks: { id: string; name: string; statblock: NpcStatblock }[] = [];
  @Input() layers: Layer[] = [];
  @Input() activeLayerId: string | null = null;
  @Input() rolls: DiceRollEvent[] = [];

  // Outputs
  @Output() loadImages = new EventEmitter<FileList>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() renameImage = new EventEmitter<{ id: string; name: string }>();
  @Output() dragStart = new EventEmitter<LibraryImage>();
  @Output() loadTextures = new EventEmitter<FileList>();
  @Output() selectTexture = new EventEmitter<string | null>();
  @Output() npcDragStart = new EventEmitter<{ id: string; name: string; portrait?: string }>();
  @Output() layerSelect = new EventEmitter<string>();
  @Output() layerToggleVisible = new EventEmitter<string>();
  @Output() layerToggleLock = new EventEmitter<string>();
  @Output() layerDelete = new EventEmitter<string>();
  @Output() layerRename = new EventEmitter<{ id: string; name: string }>();
  @Output() layerReorder = new EventEmitter<Layer[]>();
  @Output() layerAdd = new EventEmitter<LayerType>();

  // Local state
  activeTab = signal<SidebarTab>('characters');
  charSubTab = signal<'players' | 'npcs'>('players');
  editingImageId = signal<string | null>(null);
  editingName = signal('');
  searchQuery = signal('');

  // Methods
  switchTab(tab: SidebarTab): void {
    this.activeTab.set(tab);
  }

  getTotalBonus(roll: DiceRollEvent): number {
    return roll.bonuses.reduce((sum, b) => sum + b.value, 0);
  }

  formatTime(timestamp: Date): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (s < 10)  return 'Gerade eben';
    if (s < 60)  return `Vor ${s}s`;
    if (m < 60)  return `Vor ${m}min`;
    return `Vor ${h}h`;
  }

  get reversedRolls(): DiceRollEvent[] {
    return [...this.rolls].reverse().slice(0, 50);
  }

  // Character methods
  onCharacterDragStart(event: DragEvent, charId: string): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'character',
      characterId: charId
    }));
  }

  onNpcDragStart(event: DragEvent, npc: { id: string; name: string; statblock: NpcStatblock }): void {
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: 'npc-statblock',
      statblockId: npc.id,
      name: npc.name,
      portrait: npc.statblock.defaultPortrait || ''
    }));
    this.npcDragStart.emit({ id: npc.id, name: npc.name, portrait: npc.statblock.defaultPortrait });
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

  get filteredNpcs() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.npcStatblocks;
    return this.npcStatblocks.filter(n =>
      n.name.toLowerCase().includes(query) ||
      (n.statblock.raceName ?? '').toLowerCase().includes(query)
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

  onTextureDragStart(event: DragEvent, texture: any): void {
    event.dataTransfer!.effectAllowed = 'copy';
    event.dataTransfer!.setData('textureId', texture.textureId);
    event.dataTransfer!.setData('textureName', texture.name);
    console.log('[Sidebar] Dragging texture:', texture.name);
  }

  get filteredTextures() {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.textures;
    return this.textures.filter(tex => 
      tex.name.toLowerCase().includes(query)
    );
  }
}
