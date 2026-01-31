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
  @Output() dropMacro = new EventEmitter<{event: CdkDragDrop<ActionMacro[]>, zoom: number, panX: number, panY: number}>();
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

  onDrop(event: CdkDragDrop<ActionMacro[]>): void {
    this.dropMacro.emit({
      event,
      zoom: this.zoom,
      panX: this.panX,
      panY: this.panY
    });
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

    const container = this.elementRef.nativeElement.querySelector('.macro-grid-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Fixed cell dimensions matching CSS: 240px x 120px
    const cellWidth = 240;
    const cellHeight = 120;
    const gap = 14;
    
    // Get container padding (the wrapper starts at the padding offset)
    const containerStyles = window.getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyles.paddingLeft) || 0;
    const paddingTop = parseFloat(containerStyles.paddingTop) || 0;

    // Step 1: Convert mouse position from screen space to container-relative space
    const containerX = event.clientX - containerRect.left;
    const containerY = event.clientY - containerRect.top;
    
    // Step 2: Subtract padding to get position relative to the wrapper/grid origin
    // Then reverse pan and zoom to get position in untransformed grid space
    const gridX_pos = (containerX - paddingLeft - this.panX) / this.zoom;
    const gridY_pos = (containerY - paddingTop - this.panY) / this.zoom;
    
    // Step 3: Calculate grid cell from position using fixed cell size + gap
    const cellTotalWidth = cellWidth + gap;
    const cellTotalHeight = cellHeight + gap;
    
    // Allow infinite grid - just clamp negative to 0
    const gridX = Math.max(0, Math.floor(gridX_pos / cellTotalWidth));
    const gridY = Math.max(0, Math.floor(gridY_pos / cellTotalHeight));

    // Update preview position
    this.previewGridX = gridX;
    this.previewGridY = gridY;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();
    
    const delta = event.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.1, this.zoom + delta), 3);
    
    // Get container and its padding
    const container = this.elementRef.nativeElement.querySelector('.macro-grid-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerStyles = window.getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyles.paddingLeft) || 0;
    const paddingTop = parseFloat(containerStyles.paddingTop) || 0;
    
    // Mouse position relative to container
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;
    
    // Calculate the grid point under the cursor before zoom
    // The wrapper starts at (paddingLeft, paddingTop), so subtract that first
    const pointX = (mouseX - paddingLeft - this.panX) / this.zoom;
    const pointY = (mouseY - paddingTop - this.panY) / this.zoom;
    
    // Update zoom
    this.zoom = newZoom;
    
    // Adjust pan to keep the same grid point under the cursor
    // Reverse the formula: mousePos - padding = panOffset + gridPos * zoom
    // So: panOffset = mousePos - padding - gridPos * zoom
    this.panX = (mouseX - paddingLeft) - pointX * this.zoom;
    this.panY = (mouseY - paddingTop) - pointY * this.zoom;
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
