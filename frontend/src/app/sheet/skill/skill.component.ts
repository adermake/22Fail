import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ClassTree } from '../class-tree-model';
import { KeywordEnhancer } from '../keyword-enhancer';

@Component({
  selector: 'app-skill',
  imports: [CommonModule, FormsModule],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.css',
})
export class SkillComponent {
  @Input({ required: true }) skill!: SkillBlock;
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input({ required: true }) index!: number;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  isEditing = false;

  constructor(private cd: ChangeDetectorRef) {}

  get isDisabled(): boolean {
    if (this.skill.enlightened) {
      return false;
    }

    return !ClassTree.isClassEnabled(
      this.skill.class,
      this.sheet.primary_class,
      this.sheet.secondary_class
    );
  }

  get enhancedDescription(): string {
    console.log('Full skill object:', this.skill);
    console.log('Description value:', this.skill.description);
    console.log('Description type:', typeof this.skill.description);

    const original = this.skill.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    console.log('Original:', original);
    console.log('Enhanced:', enhanced);
    return enhanced;
  }
  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editingChange.emit(this.isEditing);
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  deleteSkill() {
    if (confirm(`Delete skill "${this.skill.name}"?`)) {
      this.delete.emit();
    }
  }
}
