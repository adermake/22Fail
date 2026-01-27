import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillBlock, StatModifier } from '../../model/skill-block.model';

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
    statModifiers: []
  };

  // Track stat modifiers being edited
  tempModifiers: {[key: string]: number} = {
    strength: 0,
    dexterity: 0,
    speed: 0,
    intelligence: 0,
    constitution: 0,
    chill: 0,
    mana: 0,
    life: 0,
    energy: 0
  };

  createSkill() {
    if (!this.newSkill.name.trim()) {
      alert('Skill name is required');
      return;
    }

    // Build stat modifiers array from temp values
    const statModifiers: StatModifier[] = [];
    Object.entries(this.tempModifiers).forEach(([stat, amount]) => {
      if (amount !== 0) {
        statModifiers.push({
          stat: stat as any,
          amount
        });
      }
    });

    const skillToCreate = {
      ...this.newSkill,
      statModifiers: statModifiers.length > 0 ? statModifiers : undefined
    };

    this.create.emit(skillToCreate);

    // Reset form
    this.newSkill = {
      name: '',
      class: '',
      description: '',
      type: 'active',
      enlightened: false,
      statModifiers: []
    };
    this.tempModifiers = {
      strength: 0,
      dexterity: 0,
      speed: 0,
      intelligence: 0,
      constitution: 0,
      chill: 0,
      mana: 0,
      life: 0,
      energy: 0
    };
  }
  cancelCreate() {
    this.cancel.emit();
  }
}
