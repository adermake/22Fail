import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RuneBlock, RUNE_GLOW_COLORS, RUNE_TAG_OPTIONS } from '../../model/rune-block.model';

@Component({
  selector: 'app-rune-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rune-editor.component.html',
  styleUrl: './rune-editor.component.css',
})
export class RuneEditorComponent implements OnInit {
  @Input() rune: RuneBlock | null = null; // null = creating new rune
  @Output() save = new EventEmitter<RuneBlock>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  // Working copy
  editRune!: RuneBlock;
  isNewRune = true;

  glowColors = RUNE_GLOW_COLORS;
  tagOptions = RUNE_TAG_OPTIONS;

  // Tag input
  newTag = '';

  ngOnInit() {
    if (this.rune) {
      this.editRune = JSON.parse(JSON.stringify(this.rune));
      this.isNewRune = false;
    } else {
      this.editRune = {
        name: '',
        description: '',
        drawing: '',
        tags: [],
        strokeColor: '#8b5cf6'
      };
    }
  }

  saveRune() {
    this.save.emit(this.editRune);
  }

  cancelEdit() {
    this.cancel.emit();
  }

  deleteRune() {
    if (confirm('Rune wirklich löschen?')) {
      this.delete.emit();
    }
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.editRune.tags.includes(tag)) {
      this.editRune.tags = [...this.editRune.tags, tag];
      this.newTag = '';
    }
  }

  addExistingTag(tag: string) {
    if (!this.editRune.tags.includes(tag)) {
      this.editRune.tags = [...this.editRune.tags, tag];
    }
  }

  removeTag(index: number) {
    this.editRune.tags = this.editRune.tags.filter((_, i) => i !== index);
  }

  isTagSelected(tag: string): boolean {
    return this.editRune.tags.includes(tag);
  }
}
