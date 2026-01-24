import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HexCoord } from '../../model/battlemap.model';

type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure';
type DragMode = 'free' | 'enforced';

@Component({
  selector: 'app-battlemap-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battlemap-toolbar.component.html',
  styleUrl: './battlemap-toolbar.component.css',
})
export class BattlemapToolbarComponent {
  @Input() currentTool: ToolType = 'cursor';
  @Input() brushColor = '#ef4444';
  @Input() penBrushSize = 4;
  @Input() eraserBrushSize = 12;
  @Input() drawWithWalls = false;
  @Input() dragMode: DragMode = 'free';
  @Input() aiLayerEnabled = false;
  @Input() comfyUIAvailable = false;
  @Input() comfyUIGenerating = false;
  @Input() aiPrompt = '';

  @Output() toolChange = new EventEmitter<ToolType>();
  @Output() brushColorChange = new EventEmitter<string>();
  @Output() penBrushSizeChange = new EventEmitter<number>();
  @Output() eraserBrushSizeChange = new EventEmitter<number>();
  @Output() drawWithWallsChange = new EventEmitter<boolean>();
  @Output() dragModeChange = new EventEmitter<DragMode>();
  @Output() aiLayerToggle = new EventEmitter<void>();
  @Output() aiPromptChange = new EventEmitter<string>();
  @Output() toggleCharacterList = new EventEmitter<void>();
  @Output() toggleBattleTracker = new EventEmitter<void>();
  @Output() clearDrawings = new EventEmitter<void>();
  @Output() clearWalls = new EventEmitter<void>();
  @Output() quickTokenCreate = new EventEmitter<{ name: string; portrait: string; position: HexCoord }>();

  tools: { id: ToolType; icon: string; label: string }[] = [
    { id: 'cursor', icon: '↖️', label: 'Move Tokens (Middle-click to pan)' },
    { id: 'draw', icon: '✏️', label: 'Draw' },
    { id: 'erase', icon: '🧹', label: 'Erase' },
    { id: 'walls', icon: '🧱', label: 'Walls' },
    { id: 'measure', icon: '📏', label: 'Measure Distance' },
  ];

  penBrushSizes = [2, 4, 8, 12, 20];
  eraserBrushSizes = [8, 12, 20, 32, 48];

  // Helper to limit displayed dot size in the UI
  clampSize(size: number): number {
    return Math.min(size, 24);
  }

  presetColors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ffffff', // White
    '#000000', // Black
  ];

  // Quick token creator state
  showQuickTokenModal = signal(false);
  quickTokenName = signal('');
  quickTokenImageUrl = signal('');

  // AI Prompt modal state
  showAiPromptModal = signal(false);
  editingAiPrompt = signal('');

  selectTool(tool: ToolType) {
    this.toolChange.emit(tool);
  }

  selectColor(color: string) {
    this.brushColorChange.emit(color);
  }

  selectPenSize(size: number) {
    this.penBrushSizeChange.emit(size);
  }

  selectEraserSize(size: number) {
    this.eraserBrushSizeChange.emit(size);
  }

  toggleDrawWithWalls() {
    this.drawWithWallsChange.emit(!this.drawWithWalls);
  }

  setDragMode(mode: DragMode) {
    this.dragModeChange.emit(mode);
  }

  onColorInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.brushColorChange.emit(target.value);
  }

  // Quick token methods
  openQuickTokenModal() {
    this.showQuickTokenModal.set(true);
    this.quickTokenName.set('');
    this.quickTokenImageUrl.set('');
  }

  closeQuickTokenModal() {
    this.showQuickTokenModal.set(false);
  }

  // Use proxy for preview to avoid CORS issues
  getProxiedUrl(url: string): string {
    if (!url) return '';
    // If it's already a local path, use it directly
    if (url.startsWith('/api/') || url.startsWith('data:')) {
      return url;
    }
    return `/api/images/proxy?url=${encodeURIComponent(url)}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  async createQuickToken() {
    const name = this.quickTokenName();
    const imageUrl = this.quickTokenImageUrl();
    
    if (!name.trim()) {
      alert('Please enter a token name');
      return;
    }

    let portrait = '';
    
    // If there's an image URL, download it to the server
    if (imageUrl && imageUrl.trim()) {
      try {
        const response = await fetch('/api/images/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imageUrl, name: name }),
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.path) {
            portrait = result.path;
          }
        }
      } catch (e) {
        console.error('Failed to download image:', e);
      }
    }

    // Emit the quick token with position (0,0) - will be placed at center
    this.quickTokenCreate.emit({
      name: name,
      portrait: portrait,
      position: { q: 0, r: 0 },
    });

    this.closeQuickTokenModal();
  }

  // AI Prompt modal methods
  openAiPromptModal() {
    this.editingAiPrompt.set(this.aiPrompt || '');
    this.showAiPromptModal.set(true);
  }

  closeAiPromptModal() {
    this.showAiPromptModal.set(false);
  }

  saveAiPrompt() {
    this.aiPromptChange.emit(this.editingAiPrompt());
    this.closeAiPromptModal();
  }
}
