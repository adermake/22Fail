import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SpellComponent } from '../spell/spell.component';
import { CardComponent } from '../../shared/card/card.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { SpellBlock, generateSpellId } from '../../model/spell-block-model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellEditorOverlayComponent } from '../spell-editor-overlay/spell-editor-overlay.component';

@Component({
  selector: 'app-spells',
  imports: [CommonModule, SpellComponent, CardComponent, DragDropModule, FormsModule, SpellEditorOverlayComponent],
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

  // Node editor state
  showNodeEditor = false;
  nodeEditorSpellIndex: number | null = null;
  get nodeEditorSpell(): SpellBlock | null {
    if (this.nodeEditorSpellIndex === null) return null;
    return this.sheet.spells[this.nodeEditorSpellIndex] ?? null;
  }
  get learnedRunes(): RuneBlock[] {
    return ((this.sheet.runes || []).filter(r => r !== null)) as RuneBlock[];
  }

  constructor(private cd: ChangeDetectorRef) {}

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

  // Spell editor overlay
  openNodeEditor(index: number | null) {
    this.nodeEditorSpellIndex = index;
    this.showNodeEditor = true;
  }

  closeNodeEditor() {
    this.showNodeEditor = false;
    this.nodeEditorSpellIndex = null;
  }

  deleteSpellFromEditor() {
    if (this.nodeEditorSpellIndex !== null) {
      this.deleteSpell(this.nodeEditorSpellIndex);
    }
    this.closeNodeEditor();
  }

  saveFromNodeEditor(spell: SpellBlock) {
    const spells = [...this.sheet.spells];

    // Prefer ID-based lookup — survives tab switching that resets nodeEditorSpellIndex
    let targetIndex = spell.id ? spells.findIndex(s => s.id === spell.id) : -1;

    // Fallback to index-based if no ID match (e.g., legacy spells without IDs)
    if (targetIndex < 0 && this.nodeEditorSpellIndex !== null) {
      targetIndex = this.nodeEditorSpellIndex;
    }

    if (targetIndex >= 0) {
      spells[targetIndex] = spell;
    } else {
      // Brand new spell — ensure it has an ID
      if (!spell.id) spell.id = generateSpellId();
      spells.push(spell);
    }

    this.sheet.spells = spells;
    this.patch.emit({ path: 'spells', value: this.sheet.spells });
    // Do NOT close — spell editor stays open after save (explicit close via cancel/X)
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