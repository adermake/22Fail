import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SpellComponent } from '../spell/spell.component';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SpellCreatorComponent } from '../spell-creator/spell-creator.component';
import { SpellBlock } from '../../model/spell-block-model';

@Component({
  selector: 'app-spells',
  imports: [CommonModule, SpellComponent, CardComponent, SpellCreatorComponent, DragDropModule],
  templateUrl: './spells.component.html',
  styleUrl: './spells.component.css',
})
export class SpellsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  showCreateDialog = false;
  private editingSpells = new Set<number>();
  placeholderHeight = '90px';
  placeholderWidth = '100%';

  ngOnInit() {
    if (!this.sheet.spells) {
      this.sheet.spells = [];
    }
  }

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  createSpell(spell: SpellBlock) {
    this.sheet.spells = [...this.sheet.spells, spell];
    this.patch.emit({
      path: 'spells',
      value: this.sheet.spells,
    });
    this.closeCreateDialog();
  }

  deleteSpell(index: number) {
    this.sheet.spells = this.sheet.spells.filter((_, i) => i !== index);
    this.patch.emit({
      path: 'spells',
      value: this.sheet.spells,
    });
  }

  updateSpell(index: number, patch: JsonPatch) {
    const pathParts = patch.path.split('.');
    
    if (pathParts.length === 1) {
      (this.sheet.spells[index] as any)[patch.path] = patch.value;
    } else if (pathParts[0] === 'binding') {
      if (!this.sheet.spells[index].binding) {
        this.sheet.spells[index].binding = { type: 'learned' };
      }
      (this.sheet.spells[index].binding as any)[pathParts[1]] = patch.value;
    }
    
    this.sheet.spells = [...this.sheet.spells];
    
    this.patch.emit({
      path: `spells.${index}.${patch.path}`,
      value: patch.value,
    });
  }

  onDragStarted(event: CdkDragStart) {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    this.placeholderHeight = `${rect.height}px`;
    this.placeholderWidth = `${rect.width}px`;
  }

  onDrop(event: CdkDragDrop<SpellBlock[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    if (previousIndex === currentIndex) {
      return;
    }

    const newSpells = [...this.sheet.spells];
    moveItemInArray(newSpells, previousIndex, currentIndex);
    
    this.sheet.spells = newSpells;
    
    this.patch.emit({
      path: 'spells',
      value: newSpells,
    });
  }

  onEditingChange(index: number, isEditing: boolean) {
    if (isEditing) {
      this.editingSpells.add(index);
    } else {
      this.editingSpells.delete(index);
    }
  }

  isSpellEditing(index: number): boolean {
    return this.editingSpells.has(index);
  }
}