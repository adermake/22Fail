import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() runMacro = new EventEmitter<ActionMacro>();
  @Output() editMacro = new EventEmitter<ActionMacro>();
  @Output() deleteMacro = new EventEmitter<string>();
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
  isDraggingMacro = false;

  get transformStyle(): string {
    return `translate(${this.panX}px, ${this.panY}px)`;
  }

  onDragStart(macro: ActionMacro): void {
    this.draggedMacro = macro;
    this.isDraggingMacro = true;
    this.dragStart.emit(macro);
  }

  onDragEnd(): void {
    this.draggedMacro = null;
    this.isDraggingMacro = false;
    this.dragEnd.emit();
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
