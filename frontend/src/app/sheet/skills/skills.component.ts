import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from "../../shared/card/card.component";
import { SkillComponent } from '../skill/skill.component';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { SkillCreatorComponent } from '../skillcreator/skillcreator.component';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, SkillComponent, CardComponent, SkillCreatorComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css',
})
export class SkillsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  showCreateDialog = false;

  ngOnInit() {
    // Initialize skills array if it doesn't exist
    if (!this.sheet.skills) {
      this.sheet.skills = [];
    }
  }

  openCreateDialog() {
    this.showCreateDialog = true;
  }

  closeCreateDialog() {
    this.showCreateDialog = false;
  }

  createSkill(skill: SkillBlock) {
    // Add new skill to array (optimistic update)
    this.sheet.skills = [...this.sheet.skills, skill];
    
    // Emit patch
    this.patch.emit({
      path: 'skills',
      value: this.sheet.skills,
    });
    
    this.closeCreateDialog();
  }

  deleteSkill(index: number) {
    // Remove skill from array (optimistic update)
    this.sheet.skills = this.sheet.skills.filter((_, i) => i !== index);
    
    // Emit patch
    this.patch.emit({
      path: 'skills',
      value: this.sheet.skills,
    });
  }

  updateSkill(index: number, patch: JsonPatch) {
    // Forward patch with index prefix
    this.patch.emit({
      path: `skills.${index}.${patch.path}`,
      value: patch.value,
    });
  }
}