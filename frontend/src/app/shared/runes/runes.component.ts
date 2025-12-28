import { DragDropModule, CdkDragStart, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock } from '../../model/rune-block.model';
import { CardComponent } from '../card/card.component';
import { RuneComponent } from '../rune/rune.component';
import { RuneCreatorComponent } from '../runecreator/runecreator.component';

@Component({
  selector: 'app-runes',
  imports: [CommonModule, RuneComponent, CardComponent, RuneCreatorComponent, DragDropModule],
  templateUrl: './runes.component.html',
  styleUrl: './runes.component.css',
})
export class RunesComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  showCreateDialog = false;
  private editingRunes = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';

  ngOnInit() {
    if (!this.sheet.runes) {
      this.sheet.runes = [];
    }
  }

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  createRune(rune: RuneBlock) {
    this.sheet.runes = [...this.sheet.runes, rune];
    this.patch.emit({
      path: 'runes',
      value: this.sheet.runes,
    });
    this.closeCreateDialog();
  }

  deleteRune(index: number) {
    this.sheet.runes = this.sheet.runes.filter((_: any, i: number) => i !== index);
    this.patch.emit({
      path: 'runes',
      value: this.sheet.runes,
    });
  }

  updateRune(index: number, patch: JsonPatch) {
    const field = patch.path as keyof RuneBlock;
    (this.sheet.runes[index] as any)[field] = patch.value;
    this.sheet.runes = [...this.sheet.runes];
    
    this.patch.emit({
      path: `runes.${index}.${patch.path}`,
      value: patch.value,
    });
  }

  onDragStarted(event: CdkDragStart) {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    this.placeholderHeight = `${rect.height}px`;
    this.placeholderWidth = `${rect.width}px`;
  }

  onDrop(event: CdkDragDrop<RuneBlock[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    if (previousIndex === currentIndex) {
      return;
    }

    const newRunes = [...this.sheet.runes];
    moveItemInArray(newRunes, previousIndex, currentIndex);
    
    this.sheet.runes = newRunes;
    
    this.patch.emit({
      path: 'runes',
      value: newRunes,
    });
  }

  onEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingRunes.add(index);
    } else {
      this.editingRunes.delete(index);
    }
  }

  isRuneEditing(index: number): boolean {
    return this.editingRunes.has(index);
  }
}