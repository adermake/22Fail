import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ClassTree } from '../class-tree-model';

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

  isEditing = false;

  constructor(private cd: ChangeDetectorRef) {}

  get isDisabled(): boolean {
    // Enlightened skills are never disabled
    if (this.skill.enlightened) {
      return false;
    }

    // Use ClassTree to check if skill is enabled
    return !ClassTree.isClassEnabled(
      this.skill.class,
      this.sheet.primary_class,
      this.sheet.secondary_class
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
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