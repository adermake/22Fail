import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Race, RaceSkill } from '../../../model/race.model';
import { SkillBlock } from '../../../model/skill-block.model';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';
import { SkillEditorComponent } from '../../../shared/skill-editor/skill-editor.component';

@Component({
  selector: 'app-race-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe, SkillEditorComponent],
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
  @Output() delete = new EventEmitter<void>();
  @Output() imageSelect = new EventEmitter<Event>();

  // Skill editor state
  showSkillEditor = false;
  skillEditorSkill: SkillBlock | null = null;
  skillEditorRaceSkillIdx: number | null = null;
  pendingSkillLevel = 1;

  openNewSkillEditor() {
    this.skillEditorSkill = null;
    this.skillEditorRaceSkillIdx = null;
    this.showSkillEditor = true;
  }

  openEditSkillEditor(raceSkillIdx: number) {
    this.skillEditorRaceSkillIdx = raceSkillIdx;
    this.skillEditorSkill = { ...this.race.skills[raceSkillIdx].skills[0] };
    this.pendingSkillLevel = this.race.skills[raceSkillIdx].levelRequired;
    this.showSkillEditor = true;
  }

  onSkillEditorSave(skill: SkillBlock) {
    skill.skillSource = 'race';
    if (!skill.class) {
      skill.class = this.race.name;
    }
    if (this.skillEditorRaceSkillIdx !== null) {
      // Edit existing
      this.race.skills[this.skillEditorRaceSkillIdx] = {
        ...this.race.skills[this.skillEditorRaceSkillIdx],
        levelRequired: this.pendingSkillLevel,
        skills: [skill],
      };
    } else {
      // Add new
      this.race.skills.push({
        levelRequired: this.pendingSkillLevel,
        skills: [skill],
        isChoice: false,
      });
      this.race.skills.sort((a, b) => a.levelRequired - b.levelRequired);
    }
    this.showSkillEditor = false;
  }

  onSkillEditorDelete() {
    if (this.skillEditorRaceSkillIdx !== null) {
      this.race.skills.splice(this.skillEditorRaceSkillIdx, 1);
    }
    this.showSkillEditor = false;
  }

  closeSkillEditor() {
    this.showSkillEditor = false;
  }

  onImageSelect(event: Event) {
    this.imageSelect.emit(event);
  }

  onSave() { this.save.emit(); }
  onCancel() { this.cancel.emit(); }
  onDelete() { this.delete.emit(); }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      active: '\u26A1', passive: '\uD83D\uDD2E',
      dice_bonus: '\uD83C\uDFB2', stat_bonus: '\uD83D\uDCC8',
    };
    return icons[type] ?? '\u2726';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      active: 'Aktiv', passive: 'Passiv',
      dice_bonus: 'W\u00FCrfelbonus', stat_bonus: 'Stat-Bonus',
    };
    return labels[type] ?? type;
  }
}

