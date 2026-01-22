import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ToolType = 'select' | 'cursor' | 'draw' | 'erase' | 'measure';

@Component({
  selector: 'app-battlemap-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './battlemap-toolbar.component.html',
  styleUrl: './battlemap-toolbar.component.css',
})
export class BattlemapToolbarComponent {
  @Input() currentTool: ToolType = 'select';
  @Input() brushColor = '#ef4444';
  @Input() brushSize = 4;

  @Output() toolChange = new EventEmitter<ToolType>();
  @Output() brushColorChange = new EventEmitter<string>();
  @Output() brushSizeChange = new EventEmitter<number>();
  @Output() toggleCharacterList = new EventEmitter<void>();
  @Output() toggleBattleTracker = new EventEmitter<void>();
  @Output() clearDrawings = new EventEmitter<void>();

  tools: { id: ToolType; icon: string; label: string }[] = [
    { id: 'select', icon: '🖐️', label: 'Pan' },
    { id: 'cursor', icon: '↖️', label: 'Move Tokens' },
    { id: 'draw', icon: '✏️', label: 'Draw' },
    { id: 'erase', icon: '🧹', label: 'Erase' },
    { id: 'measure', icon: '📏', label: 'Measure Distance' },
  ];

  brushSizes = [2, 4, 8, 12, 20];

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

  selectTool(tool: ToolType) {
    this.toolChange.emit(tool);
  }

  selectColor(color: string) {
    this.brushColorChange.emit(color);
  }

  selectSize(size: number) {
    this.brushSizeChange.emit(size);
  }

  onColorInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.brushColorChange.emit(target.value);
  }
}
