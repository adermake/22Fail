import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Race, RaceSkill } from '../../../model/race.model';
import { SkillBlock } from '../../../model/skill-block.model';

@Component({
  selector: 'app-race-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './race-form.component.html',
  styleUrl: './race-form.component.css'
})
export class RaceFormComponent {
  @Input() race!: Race;
  @Input() isCreate = false;
  @Input() saving = false;
  @Input() pendingImagePreview = '';
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() imageSelect = new EventEmitter<Event>();

  newSkillLevelRequired = 1;
  newSkill: SkillBlock = this.createEmptySkill();

  createEmptySkill(): SkillBlock {
    return {
      name: '',
      class: '',
      description: '',
      type: 'passive',
      enlightened: false
    };
  }

  addSkillToRace() {
    if (!this.newSkill.name.trim()) return;

    const raceSkill: RaceSkill = {
      levelRequired: this.newSkillLevelRequired,
      skill: { ...this.newSkill }
    };

    this.race.skills.push(raceSkill);
    this.newSkill = this.createEmptySkill();
    this.newSkillLevelRequired = 1;
  }

  removeSkillFromRace(index: number) {
    this.race.skills.splice(index, 1);
  }

  onImageSelect(event: Event) {
    this.imageSelect.emit(event);
  }

  onSave() { this.save.emit(); }
  onCancel() { this.cancel.emit(); }
}
