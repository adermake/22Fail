import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SpellComponent } from '../spell/spell.component';
import { CardComponent } from '../../shared/card/card.component';
import { SpellCreatorComponent } from '../spell-creator/spell-creator.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SpellBlock } from '../../model/spell-block-model';

@Component({
  selector: 'app-spells',
  imports: [CommonModule, SpellComponent, CardComponent, SpellCreatorComponent, DragDropModule, FormsModule],
  templateUrl: './spells.component.html',
  styleUrl: './spells.component.css',
})
export class SpellsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() editingSpells!: Set<number>;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() editingChange = new EventEmitter<{index: number, isEditing: boolean}>();

  showCreateDialog = false;
  placeholderHeight = '90px';
  placeholderWidth = '100%';

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    if (!this.sheet.spells) {
      this.sheet.spells = [];
    }
    if (this.sheet.fokusMultiplier === undefined) {
      this.sheet.fokusMultiplier = 1;
    }
    if (this.sheet.fokusBonus === undefined) {
      this.sheet.fokusBonus = 0;
    }
  }
   get fokusValue(): number {
    const intelligence = this.sheet.intelligence?.current || 10;
    return Math.floor((intelligence + this.sheet.fokusBonus) * this.sheet.fokusMultiplier);
  }

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }




  updateFokusSetting(field: string, value: any) {
    // Update locally first for immediate feedback
    (this.sheet as any)[field] = Number(value);
    this.cd.detectChanges();
    
    // Then emit patch
    this.patch.emit({ path: field, value: Number(value) });
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
    const spell = this.sheet.spells[index];
    this.sheet.spells = this.sheet.spells.filter((_, i) => i !== index);

    // Add to trash
    const trash = this.sheet.trash || [];
    trash.push({
      type: 'spell',
      data: spell,
      deletedAt: Date.now()
    });

    this.patch.emit({
      path: 'spells',
      value: this.sheet.spells,
    });
    this.patch.emit({
      path: 'trash',
      value: trash,
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
    this.editingChange.emit({index, isEditing});
  }

  isSpellEditing(index: number): boolean {
    return this.editingSpells.has(index);
  }
}