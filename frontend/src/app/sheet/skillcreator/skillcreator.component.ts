import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillBlock } from '../../model/skill-block.model';

@Component({
  selector: 'app-skill-creator',
  imports: [CommonModule, FormsModule],
  templateUrl: './skillcreator.component.html',
  styleUrl: './skillcreator.component.css',
})
export class SkillCreatorComponent {
  @Output() create = new EventEmitter<SkillBlock>();
  @Output() cancel = new EventEmitter<void>();

  newSkill: SkillBlock = {
    name: '',
    class: '',
    description: '',
    type: 'active', // Default to active
    enlightened: false, // Default to not enlightened
  };

  createSkill() {
    if (!this.newSkill.name.trim()) {
      alert('Skill name is required');
      return;
    }

    this.create.emit({ ...this.newSkill });

    // Reset form
    this.newSkill = {
      name: '',
      class: '',
      description: '',
      type: 'active',
      enlightened: false,
    };
  }
  cancelCreate() {
    this.cancel.emit();
  }
}
