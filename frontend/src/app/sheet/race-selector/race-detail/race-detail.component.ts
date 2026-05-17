import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Race, RaceSkill, SkillBlock } from '../../../model/race.model';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

@Component({
  selector: 'app-race-detail',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  templateUrl: './race-detail.component.html',
  styleUrl: './race-detail.component.css'
})
export class RaceDetailComponent {
  @Input() race!: Race;
  @Input() selectedRacialSkills: { [level: number]: string } = {};
  @Output() confirm = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() selectSkill = new EventEmitter<{ level: number, skill: SkillBlock }>();

  onConfirm() { this.confirm.emit(); }
  onEdit() { this.edit.emit(); }
  onDelete() { this.delete.emit(); }
  
  onSelectSkill(raceSkill: RaceSkill, skill: SkillBlock) {
    if (raceSkill.isChoice) {
      this.selectSkill.emit({ level: raceSkill.levelRequired, skill });
    }
  }
  
  isSkillSelected(raceSkill: RaceSkill, skill: SkillBlock): boolean {
    return this.selectedRacialSkills[raceSkill.levelRequired] === skill.name;
  }
}
