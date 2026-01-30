import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ActionMacro, ActionConsequence } from '../../../model/action-macro.model';
import { CharacterSheet } from '../../../model/character-sheet-model';

@Component({
  selector: 'app-macro-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './macro-grid.component.html',
  styleUrls: ['./macro-grid.component.css']
})
export class MacroGridComponent {
  @Input() macros: ActionMacro[] = [];
  @Input() sheet!: CharacterSheet;
  @Input() gridColumns: number = 4;
  @Output() runMacro = new EventEmitter<ActionMacro>();
  @Output() editMacro = new EventEmitter<ActionMacro>();
  @Output() deleteMacro = new EventEmitter<string>();

  constructor(private elementRef: ElementRef) {}
  @Output() dropMacro = new EventEmitter<CdkDragDrop<ActionMacro[]>>();
  @Output() dragStart = new EventEmitter<ActionMacro>();
  @Output() dragEnd = new EventEmitter<void>();

  draggedMacro: ActionMacro | null = null;
  
  // Panning state
  isPanning = false;
  panX = 0;
  panY = 0;
  lastMouseX = 0;
  lastMouseY = 0;
  zoom = 1;
  isDraggingMacro = false;

  // Drop preview state
  showDropPreview = false;
  previewGridX = 0;
  previewGridY = 0;

  get transformStyle(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  onDragStart(macro: ActionMacro): void {
    this.draggedMacro = macro;
    this.isDraggingMacro = true;
    this.showDropPreview = true;
    this.dragStart.emit(macro);
  }

  onDragEnd(): void {
    this.draggedMacro = null;
    this.isDraggingMacro = false;
    this.showDropPreview = false;
    this.dragEnd.emit();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.isDraggingMacro || !this.showDropPreview) return;

    const gridElement = document.querySelector('.macro-grid') as HTMLElement;
    if (!gridElement) return;

    const rect = gridElement.getBoundingClientRect();
    const gridStyles = window.getComputedStyle(gridElement);
    const gap = parseFloat(gridStyles.gap) || 14;

    // Calculate cell dimensions
    const totalGapWidth = gap * (this.gridColumns - 1);
    const cellWidth = (rect.width - totalGapWidth) / this.gridColumns;
    const cellHeight = 120;

    // Get mouse position relative to grid
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    // Calculate grid cell position
    let gridX = 0;
    let accumulatedWidth = 0;
    for (let col = 0; col < this.gridColumns; col++) {
      const colEnd = accumulatedWidth + cellWidth;
      if (relativeX < colEnd || col === this.gridColumns - 1) {
        gridX = col;
        break;
      }
      accumulatedWidth = colEnd + gap;
    }

    const gridY = Math.max(0, Math.floor(relativeY / (cellHeight + gap)));

    // Update preview position
    this.previewGridX = gridX;
    this.previewGridY = gridY;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();
    
    const delta = event.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.1, this.zoom + delta), 3);
    
    // Zoom towards cursor position
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate the point under the cursor before zoom
    const pointX = (mouseX - this.panX) / this.zoom;
    const pointY = (mouseY - this.panY) / this.zoom;
    
    // Update zoom
    this.zoom = newZoom;
    
    // Adjust pan to keep the same point under the cursor
    this.panX = mouseX - pointX * this.zoom;
    this.panY = mouseY - pointY * this.zoom;
  }

  onMouseDown(event: MouseEvent): void {
    // Don't start panning if clicking on a macro card or dragging a macro
    const target = event.target as HTMLElement;
    if (this.isDraggingMacro || target.closest('.macro-card')) {
      return;
    }
    
    this.isPanning = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    event.preventDefault();
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      const deltaX = event.clientX - this.lastMouseX;
      const deltaY = event.clientY - this.lastMouseY;
      this.panX += deltaX;
      this.panY += deltaY;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  onMouseUp(): void {
    this.isPanning = false;
  }

  onMouseLeave(): void {
    this.isPanning = false;
  }

  getGridPosition(macro: ActionMacro): { x: number, y: number } {
    if (macro.gridX !== undefined && macro.gridY !== undefined) {
      return { x: macro.gridX, y: macro.gridY };
    }
    return { x: 0, y: 0 };
  }

  areConditionsMet(macro: ActionMacro): boolean {
    if (!macro.conditions || macro.conditions.length === 0) {
      return true;
    }
    
    return macro.conditions.every(condition => {
      if (condition.type === 'skill') {
        return true; // Simplified - assume skills are met
      }
      return true;
    });
  }

  getMissingSkills(macro: ActionMacro): string[] {
    return []; // Simplified
  }

  getConsequenceLabel(consequence: ActionConsequence): string {
    switch (consequence.type) {
      case 'dice_roll': return '🎲';
      case 'spend_resource': return '💧 -';
      case 'gain_resource': return '💧 +';
      case 'apply_bonus': return '⚡ +';
      default: return '?';
    }
  }
}
