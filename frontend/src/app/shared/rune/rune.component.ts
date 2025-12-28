import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPatch } from '../../model/json-patch.model';
import { RuneBlock, RUNE_TAG_OPTIONS } from '../../model/rune-block.model';
import { KeywordEnhancer } from '../../sheet/keyword-enhancer';

@Component({
  selector: 'app-rune',
  imports: [CommonModule, FormsModule],
  templateUrl: './rune.component.html',
  styleUrl: './rune.component.css',
})
export class RuneComponent {
  @Input({ required: true }) rune!: RuneBlock;
  @Input({ required: true }) index!: number;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  isEditing = false;
  tagOptions = RUNE_TAG_OPTIONS;

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  get enhancedDescription(): SafeHtml {
    const original = this.rune.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editingChange.emit(this.isEditing);
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  toggleTag(tag: string) {
    if (!this.rune.tags) {
      this.rune.tags = [];
    }
    
    const index = this.rune.tags.indexOf(tag);
    let newTags: string[];
    
    if (index > -1) {
      newTags = this.rune.tags.filter(t => t !== tag);
    } else {
      newTags = [...this.rune.tags, tag];
    }
    
    this.updateField('tags', newTags);
  }

  hasTag(tag: string): boolean {
    return this.rune.tags?.includes(tag) || false;
  }

  deleteRune() {
    if (confirm(`Delete rune "${this.rune.name}"?`)) {
      this.delete.emit();
    }
  }
}