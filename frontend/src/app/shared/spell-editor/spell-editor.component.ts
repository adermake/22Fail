import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpellBlock, SpellBinding, SPELL_TAG_OPTIONS, SPELL_GLOW_COLORS } from '../../model/spell-block-model';

@Component({
  selector: 'app-spell-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spell-editor.component.html',
  styleUrl: './spell-editor.component.css',
})
export class SpellEditorComponent implements OnInit {
  @Input() spell: SpellBlock | null = null; // null = creating new spell
  @Output() save = new EventEmitter<SpellBlock>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  // Working copy
  editSpell!: SpellBlock;
  isNewSpell = true;

  tagOptions = SPELL_TAG_OPTIONS;
  glowColors = SPELL_GLOW_COLORS;

  // Tag input
  newTag = '';

  ngOnInit() {
    if (this.spell) {
      this.editSpell = JSON.parse(JSON.stringify(this.spell));
      this.isNewSpell = false;
    } else {
      this.editSpell = {
        name: '',
        description: '',
        tags: [],
        binding: { type: 'item' }, // Item-based spells default to item binding
        strokeColor: '#8b5cf6'
      };
    }
  }

  saveSpell() {
    this.save.emit(this.editSpell);
  }

  cancelEdit() {
    this.cancel.emit();
  }

  deleteSpell() {
    if (confirm('Zauber wirklich löschen?')) {
      this.delete.emit();
    }
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.editSpell.tags.includes(tag)) {
      this.editSpell.tags = [...this.editSpell.tags, tag];
      this.newTag = '';
    }
  }

  addExistingTag(tag: string) {
    if (!this.editSpell.tags.includes(tag)) {
      this.editSpell.tags = [...this.editSpell.tags, tag];
    }
  }

  removeTag(index: number) {
    this.editSpell.tags = this.editSpell.tags.filter((_, i) => i !== index);
  }

  isTagSelected(tag: string): boolean {
    return this.editSpell.tags.includes(tag);
  }
}
