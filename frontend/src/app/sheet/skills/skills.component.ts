import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { SkillComponent } from '../skill/skill.component';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { SkillCreatorComponent } from '../skillcreator/skillcreator.component';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, SkillComponent, CardComponent, SkillCreatorComponent, DragDropModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css',
})
export class SkillsComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() editingSkills!: Set<number>;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() editingChange = new EventEmitter<{index: number, isEditing: boolean}>();

  showCreateDialog = false;
  placeholderHeight = '90px';
  placeholderWidth = '100%';

  ngOnInit() {
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
    this.sheet.skills = [...this.sheet.skills, skill];
    this.patch.emit({
      path: 'skills',
      value: this.sheet.skills,
    });
    this.closeCreateDialog();
  }

  deleteSkill(index: number) {
    const skill = this.sheet.skills[index];
    this.sheet.skills = this.sheet.skills.filter((_, i) => i !== index);

    // Add to trash
    const trash = this.sheet.trash || [];
    trash.push({
      type: 'skill',
      data: skill,
      deletedAt: Date.now()
    });

    this.patch.emit({
      path: 'skills',
      value: this.sheet.skills,
    });
    this.patch.emit({
      path: 'trash',
      value: trash,
    });
  }

  updateSkill(index: number, patch: JsonPatch) {
    const field = patch.path as keyof SkillBlock;
    (this.sheet.skills[index] as any)[field] = patch.value;
    this.sheet.skills = [...this.sheet.skills];
    
    this.patch.emit({
      path: `skills.${index}.${patch.path}`,
      value: patch.value,
    });
  }

  onDragStarted(event: CdkDragStart) {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    this.placeholderHeight = `${rect.height}px`;
    this.placeholderWidth = `${rect.width}px`;
  }

  onDrop(event: CdkDragDrop<SkillBlock[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    if (previousIndex === currentIndex) {
      return;
    }

    const newSkills = [...this.sheet.skills];
    moveItemInArray(newSkills, previousIndex, currentIndex);
    
    this.sheet.skills = newSkills;
    
    this.patch.emit({
      path: 'skills',
      value: newSkills,
    });
  }

  onEditingChange(index: number, isEditing: boolean) {
    this.editingChange.emit({index, isEditing});
  }

  isSkillEditing(index: number): boolean {
    return this.editingSkills.has(index);
  }
}