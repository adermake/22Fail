import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldMapTool, FogMode } from '../../model/world-map.model';

@Component({
  selector: 'app-world-map-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-map-toolbar.component.html',
  styleUrls: ['./world-map-toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapToolbarComponent {
  @Input() currentTool: WorldMapTool = 'cursor';
  @Input() isGM = false;
  @Input() isEraserMode = false;
  @Input() fogMode: FogMode = 'neutral';
  @Input() brushColor = '#ef4444';
  @Input() penBrushSize = 4;
  @Input() worldName = '';

  @Output() toolChange = new EventEmitter<WorldMapTool>();
  @Output() brushColorChange = new EventEmitter<string>();
  @Output() penBrushSizeChange = new EventEmitter<number>();
  @Output() clearDrawings = new EventEmitter<void>();
  @Output() uploadTiles = new EventEmitter<void>();
  @Output() removeMacroTile = new EventEmitter<void>();
  @Output() hasMacroTileSelected = false;

  tools: { id: WorldMapTool; icon: string; label: string; shortcut: string }[] = [
    { id: 'cursor', icon: '↖️', label: 'Token bewegen', shortcut: 'S' },
    { id: 'draw', icon: '✏️', label: 'Zeichnen', shortcut: 'B' },
    { id: 'measure', icon: '📏', label: 'Messen', shortcut: 'M' },
  ];

  presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#000000',
  ];

  penBrushSizes = [2, 4, 8, 12, 20];

  selectTool(tool: WorldMapTool): void {
    this.toolChange.emit(tool);
  }

  selectColor(color: string): void {
    this.brushColorChange.emit(color);
  }

  onColorInput(event: Event): void {
    this.brushColorChange.emit((event.target as HTMLInputElement).value);
  }

  selectPenSize(size: number): void {
    this.penBrushSizeChange.emit(size);
  }

  clampSize(size: number): number {
    return Math.min(20, Math.max(4, size));
  }

  fogModeLabel(): string {
    switch (this.fogMode) {
      case 'reveal': return 'Aufdecken (V)';
      case 'hide': return 'Verbergen (V)';
      default: return 'Neutral (D)';
    }
  }
}
