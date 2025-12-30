import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SPELL_TAG_OPTIONS, SpellBlock } from '../../model/spell-block-model';
import { KeywordEnhancer } from '../keyword-enhancer';

@Component({
  selector: 'app-spell',
  imports: [CommonModule, FormsModule],
  templateUrl: './spell.component.html',
  styleUrl: './spell.component.css',
})
export class SpellComponent {
  @Input({ required: true }) spell!: SpellBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  isEditing = false;
  tagOptions = SPELL_TAG_OPTIONS;

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  get enhancedDescription(): SafeHtml {
    const original = this.spell.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  get isDisabled(): boolean {
    if (this.spell.binding.type === 'learned') {
      return false;
    }
    
    // Check if item exists in inventory or equipment
    const itemName = this.spell.binding.itemName?.toLowerCase().trim();
    if (!itemName) return true;
    
    const allItems = [
      ...(this.sheet.inventory || []),
      ...(this.sheet.equipment || [])
    ];
    
    return !allItems.some(item => item.name.toLowerCase().trim() === itemName);
  }

  get availableItems(): string[] {
    const allItems = [
      ...(this.sheet.inventory || []),
      ...(this.sheet.equipment || [])
    ];
    return allItems.map(item => item.name);
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
    if (!this.spell.tags) {
      this.spell.tags = [];
    }
    
    const index = this.spell.tags.indexOf(tag);
    let newTags: string[];
    
    if (index > -1) {
      newTags = this.spell.tags.filter(t => t !== tag);
    } else {
      newTags = [...this.spell.tags, tag];
    }
    
    this.updateField('tags', newTags);
  }

  hasTag(tag: string): boolean {
    return this.spell.tags?.includes(tag) || false;
  }

  deleteSpell() {
    if (confirm(`Delete spell "${this.spell.name}"?`)) {
      this.delete.emit();
    }
  }
}