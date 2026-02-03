/**
 * Lobby Toolbar Component
 * 
 * Tool selection and settings for the lobby.
 */

import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolType, DragMode } from '../lobby.component';

@Component({
  selector: 'app-lobby-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby-toolbar.component.html',
  styleUrls: ['./lobby-toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyToolbarComponent {
  // Inputs
  @Input() currentTool: ToolType = 'cursor';
  @Input() brushColor = '#000000';
  @Input() penBrushSize = 4;
  @Input() eraserBrushSize = 12;
  @Input() drawWithWalls = false;
  @Input() dragMode: DragMode = 'free';
  @Input() drawLayerVisible = true;
  @Input() isGM = false;

  // Outputs
  @Output() toolChange = new EventEmitter<ToolType>();
  @Output() brushColorChange = new EventEmitter<string>();
  @Output() penBrushSizeChange = new EventEmitter<number>();
  @Output() eraserBrushSizeChange = new EventEmitter<number>();
  @Output() drawWithWallsChange = new EventEmitter<boolean>();
  @Output() dragModeChange = new EventEmitter<DragMode>();
  @Output() drawLayerVisibleChange = new EventEmitter<boolean>();
  @Output() clearDrawings = new EventEmitter<void>();
  @Output() clearWalls = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  // Tool definitions
  tools: { id: ToolType; icon: string; label: string; shortcut: string }[] = [
    { id: 'cursor', icon: '↖️', label: 'Select/Move', shortcut: 'F' },
    { id: 'draw', icon: '✏️', label: 'Draw', shortcut: 'B' },
    { id: 'erase', icon: '🧹', label: 'Erase', shortcut: 'E' },
    { id: 'walls', icon: '🧱', label: 'Walls', shortcut: 'W' },
    { id: 'measure', icon: '📏', label: 'Measure', shortcut: 'R' },
    { id: 'image', icon: '🖼️', label: 'Images', shortcut: 'I' },
  ];

  // Brush sizes
  penBrushSizes = [2, 4, 8, 12, 20];
  eraserBrushSizes = [8, 12, 20, 32, 48];

  // Preset colors
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

  // Methods
  selectTool(tool: ToolType): void {
    this.toolChange.emit(tool);
  }

  selectColor(color: string): void {
    this.brushColorChange.emit(color);
  }

  onColorInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.brushColorChange.emit(target.value);
  }

  selectPenSize(size: number): void {
    this.penBrushSizeChange.emit(size);
  }

  selectEraserSize(size: number): void {
    this.eraserBrushSizeChange.emit(size);
  }

  toggleDrawWithWalls(): void {
    this.drawWithWallsChange.emit(!this.drawWithWalls);
  }

  setDragMode(mode: DragMode): void {
    this.dragModeChange.emit(mode);
  }

  clampSize(size: number): number {
    return Math.min(size, 24);
  }
}
