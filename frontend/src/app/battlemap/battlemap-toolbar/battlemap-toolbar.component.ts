import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HexCoord, AiColorPrompt } from '../../model/battlemap.model';

type ToolType = 'cursor' | 'draw' | 'erase' | 'walls' | 'measure' | 'ai-draw';
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
  @Input() comfyUIAvailable = false;
  @Input() comfyUIGenerating = false;
  @Input() aiPrompt = '';
  @Input() aiSettings: { seed?: number; steps?: number; cfg?: number; denoise?: number } = {};
  @Input() drawLayerVisible = true;
  @Input() aiLayerVisible = true;
  @Input() aiColorPrompts: AiColorPrompt[] = [];
  @Input() selectedAiColor = '#22c55e';

  @Output() toolChange = new EventEmitter<ToolType>();
  @Output() brushColorChange = new EventEmitter<string>();
  @Output() penBrushSizeChange = new EventEmitter<number>();
  @Output() eraserBrushSizeChange = new EventEmitter<number>();
  @Output() drawWithWallsChange = new EventEmitter<boolean>();
  @Output() dragModeChange = new EventEmitter<DragMode>();
  @Output() aiPromptChange = new EventEmitter<string>();
  @Output() aiSettingsChange = new EventEmitter<{ seed?: number; steps?: number; cfg?: number; denoise?: number }>();
  @Output() drawLayerVisibleChange = new EventEmitter<boolean>();
  @Output() aiLayerVisibleChange = new EventEmitter<boolean>();
  @Output() toggleCharacterList = new EventEmitter<void>();
  @Output() toggleBattleTracker = new EventEmitter<void>();
  @Output() clearDrawings = new EventEmitter<void>();
  @Output() clearWalls = new EventEmitter<void>();
  @Output() quickTokenCreate = new EventEmitter<{ name: string; portrait: string; position: HexCoord }>();
  @Output() selectedAiColorChange = new EventEmitter<string>();
  @Output() aiColorPromptUpdate = new EventEmitter<{ id: string; updates: Partial<AiColorPrompt> }>();
  @Output() clearAiStrokes = new EventEmitter<void>();
  @Output() generateFromAiStrokes = new EventEmitter<void>();

  tools: { id: ToolType; icon: string; label: string }[] = [
    { id: 'cursor', icon: '↖️', label: 'Move Tokens (Middle-click to pan)' },
    { id: 'draw', icon: '✏️', label: 'Draw' },
    { id: 'erase', icon: '🧹', label: 'Erase' },
    { id: 'walls', icon: '🧱', label: 'Walls' },
    { id: 'measure', icon: '📏', label: 'Measure Distance' },
    { id: 'ai-draw', icon: '🎨', label: 'AI Region Draw (paint colors for AI generation)' },
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

  // AI Settings modal state
  showAiSettingsModal = signal(false);
  editingAiPrompt = signal('');
  editingSeed = signal<number>(-1);
  editingSteps = signal<number>(10);
  editingCfg = signal<number>(1.5);
  editingDenoise = signal<number>(0.75);

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

  // AI Settings modal methods
  openAiSettingsModal() {
    this.editingAiPrompt.set(this.aiPrompt || '');
    this.editingSeed.set(this.aiSettings?.seed ?? -1);
    this.editingSteps.set(this.aiSettings?.steps ?? 25);
    this.editingCfg.set(this.aiSettings?.cfg ?? 3.5); // Not used by FLUX
    this.editingDenoise.set(this.aiSettings?.denoise ?? 0.7); // ControlNet strength
    this.showAiSettingsModal.set(true);
  }

  closeAiSettingsModal() {
    this.showAiSettingsModal.set(false);
  }

  saveAiSettings() {
    this.aiPromptChange.emit(this.editingAiPrompt());
    this.aiSettingsChange.emit({
      seed: this.editingSeed(),
      steps: this.editingSteps(),
      cfg: this.editingCfg(),
      denoise: this.editingDenoise()
    });
    this.closeAiSettingsModal();
  }

  randomizeSeed() {
    this.editingSeed.set(-1);
  }

  // AI Color Prompt editing
  showAiColorPromptsModal = signal(false);
  editingColorPrompts = signal<AiColorPrompt[]>([]);

  openAiColorPromptsModal() {
    this.editingColorPrompts.set([...this.aiColorPrompts]);
    this.showAiColorPromptsModal.set(true);
  }

  closeAiColorPromptsModal() {
    this.showAiColorPromptsModal.set(false);
  }

  updateColorPromptField(id: string, field: 'name' | 'prompt', value: string) {
    this.aiColorPromptUpdate.emit({ id, updates: { [field]: value } });
  }

  selectAiColor(color: string) {
    this.selectedAiColorChange.emit(color);
  }

  getSelectedColorPrompt(): AiColorPrompt | undefined {
    return this.aiColorPrompts.find(p => p.color === this.selectedAiColor);
  }
}
