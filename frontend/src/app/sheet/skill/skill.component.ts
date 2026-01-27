import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterSheet } from '../../model/character-sheet-model';
import { ClassTree } from '../class-tree-model';
import { KeywordEnhancer } from '../keyword-enhancer';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SKILL_DEFINITIONS } from '../../data/skill-definitions';

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
  @Input() isEditing = false;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() delete = new EventEmitter<void>();
  @Output() editingChange = new EventEmitter<boolean>();

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  // Get the effective type from SKILL_DEFINITIONS (source of truth)
  get effectiveType(): 'active' | 'passive' | 'dice_bonus' | 'stat_bonus' {
    // Find the definition by name
    const definition = SKILL_DEFINITIONS.find(s => s.name === this.skill.name);
    if (definition) {
      return definition.type;
    }
    // Fallback to stored type
    return this.skill.type;
  }

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

  get enhancedDescription(): SafeHtml {
    const original = this.skill.description || 'No description';
    const enhanced = KeywordEnhancer.enhance(original);
    return this.sanitizer.bypassSecurityTrustHtml(enhanced);
  }

  toggleEdit() {
    this.editingChange.emit(!this.isEditing);
  }

  updateField(field: string, value: any) {
    this.patch.emit({ path: field, value });
    this.cd.detectChanges();
  }

  deleteSkill() {
    this.delete.emit();
  }

  getTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'active': 'Active',
      'passive': 'Passive',
      'dice_bonus': 'Dice Bonus',
      'stat_bonus': 'Stat Bonus'
    };
    return typeLabels[type] || type;
  }
}