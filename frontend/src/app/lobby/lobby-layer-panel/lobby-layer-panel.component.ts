import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Layer, LayerType } from '../../model/lobby.model';

@Component({
  selector: 'app-lobby-layer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './lobby-layer-panel.component.html',
  styleUrls: ['./lobby-layer-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyLayerPanelComponent implements OnChanges {
  @Input() layers: Layer[] = [];
  @Input() activeLayerId: string | null = null;
  @Input() isGM = false;

  @Output() layerSelect = new EventEmitter<string>();
  @Output() layerToggleVisible = new EventEmitter<string>();
  @Output() layerToggleLock = new EventEmitter<string>();
  @Output() layerDelete = new EventEmitter<string>();
  @Output() layerRename = new EventEmitter<{ id: string; name: string }>();
  @Output() layerReorder = new EventEmitter<Layer[]>();
  @Output() layerAdd = new EventEmitter<LayerType>();

  editingLayerId: string | null = null;
  editingName = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Only log when layers changed to avoid spamming during drag operations
    if (changes['layers']) {
      console.log('[LayerPanel] ngOnChanges - Received', this.layers.length, 'layers:', this.layers.map(l => l.name));
    }
  }

  get sortedLayers(): Layer[] {
    // Sort by zIndex descending (top layer first)
    return [...this.layers].sort((a, b) => b.zIndex - a.zIndex);
  }

  onLayerClick(layerId: string): void {
    if (this.editingLayerId === layerId) return;
    this.layerSelect.emit(layerId);
  }

  onToggleVisible(event: Event, layerId: string): void {
    event.stopPropagation();
    this.layerToggleVisible.emit(layerId);
  }

  onToggleLock(event: Event, layerId: string): void {
    event.stopPropagation();
    this.layerToggleLock.emit(layerId);
  }

  onDeleteLayer(event: Event, layerId: string): void {
    event.stopPropagation();
    const layer = this.layers.find(l => l.id === layerId);
    if (layer && confirm(`Delete layer "${layer.name}"?`)) {
      this.layerDelete.emit(layerId);
    }
  }

  onStartRename(event: Event, layer: Layer): void {
    event.stopPropagation();
    this.editingLayerId = layer.id;
    this.editingName = layer.name;
  }

  onSaveRename(): void {
    if (this.editingLayerId && this.editingName.trim()) {
      this.layerRename.emit({ id: this.editingLayerId, name: this.editingName.trim() });
    }
    this.editingLayerId = null;
    this.editingName = '';
  }

  onCancelRename(): void {
    this.editingLayerId = null;
    this.editingName = '';
  }

  onRenameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSaveRename();
    } else if (event.key === 'Escape') {
      this.onCancelRename();
    }
  }

  onDrop(event: CdkDragDrop<Layer[]>): void {
    const reordered = [...this.sortedLayers];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    
    // Update zIndex based on new order (top = highest zIndex)
    reordered.forEach((layer, index) => {
      layer.zIndex = reordered.length - index;
    });
    
    this.layerReorder.emit(reordered);
  }

  onAddImageLayer(): void {
    this.layerAdd.emit('image');
  }

  onAddTextureLayer(): void {
    this.layerAdd.emit('texture');
  }

  getLayerIcon(type: LayerType): string {
    return type === 'image' ? '🖼️' : '🎨';
  }
}
