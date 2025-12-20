import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skill',
  imports: [CommonModule, FormsModule],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.css',
})
export class SkillComponent {
  @Input({ required: true }) skill!: SkillBlock;
  @Input({ required: true }) index!: number;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();

  isEditing = false;

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
  }

  deleteSkill() {
    if (confirm(`Delete skill "${this.skill.name}"?`)) {
      this.delete.emit();
    }
  }
}