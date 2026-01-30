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

  onDragStart(macro: ActionMacro): void {
    this.draggedMacro = macro;
    this.dragStart.emit(macro);
  }

  onDragEnd(): void {
    this.draggedMacro = null;
    this.dragEnd.emit();
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
