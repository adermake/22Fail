import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Race, RaceAbilityCategory, normalizeRace, unarmedEffectiveness } from '../../../model/race.model';
import { SkillBlock } from '../../../model/skill-block.model';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';
import { SkillEditorComponent } from '../../../shared/skill-editor/skill-editor.component';

/** One racial ability as the editor sees it, wherever it currently lives. */
interface AbilityEntry {
  skill: SkillBlock;
  category: RaceAbilityCategory;
  /** Only for category 'skill'. */
  level: number;
}

@Component({
  selector: 'app-race-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ImageUrlPipe, SkillEditorComponent],
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

  // ── Skill editor state ──────────────────────────────────────────────────────
  showSkillEditor = false;
  skillEditorSkill: SkillBlock | null = null;
  /** The entry being edited (null while adding a new ability). */
  editingEntry: AbilityEntry | null = null;
  /** Category/level a newly created ability lands in. */
  pendingCategory: RaceAbilityCategory = 'skill';
  pendingSkillLevel = 1;

  // ── Reading the race ────────────────────────────────────────────────────────

  get advantages(): SkillBlock[] { return this.race.advantages ??= []; }
  get disadvantages(): SkillBlock[] { return this.race.disadvantages ??= []; }

  /** Waffenlose Effektivität — base strength halved, decimals stripped. */
  get unarmedEffectiveness(): number { return unarmedEffectiveness(this.race.baseStrength); }

  entryOf(skill: SkillBlock, category: RaceAbilityCategory, level = 0): AbilityEntry {
    return { skill, category, level };
  }

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  /** Moving a card is the ONLY way categories/Stufen change — no dropdowns involved. */
  onDrop(event: CdkDragDrop<SkillBlock[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data, event.container.data,
        event.previousIndex, event.currentIndex,
      );
    }
    this.refreshChoiceFlags();
  }

  /** A Stufe with more than one ability is a choice row — keep the flag honest after every move. */
  private refreshChoiceFlags(): void {
    for (const group of this.race.skills) group.isChoice = group.skills.length > 1;
  }

  // ── Stufen ──────────────────────────────────────────────────────────────────

  addLevelGroup(): void {
    const highest = this.race.skills.reduce((max, g) => Math.max(max, g.levelRequired), 0);
    const level = this.race.skills.length ? highest + 5 : 1;
    this.race.skills = [...this.race.skills, { levelRequired: level, skills: [], isChoice: false }];
  }

  removeLevelGroup(index: number): void {
    const group = this.race.skills[index];
    if (!group) return;
    if (group.skills.length && !confirm(
      `Stufe ${group.levelRequired} mit ${group.skills.length} Fähigkeit(en) löschen?`
    )) return;
    this.race.skills = this.race.skills.filter((_, i) => i !== index);
  }

  /** Retarget a whole Stufe; colliding Stufen merge into one choice row. */
  setGroupLevel(groupIndex: number, rawLevel: unknown): void {
    const level = Math.max(0, Math.floor(Number(rawLevel) || 0));
    const skills = this.race.skills.map((g, i) => (i === groupIndex ? { ...g, levelRequired: level } : g));
    this.commit([...this.advantages], [...this.disadvantages], skills);
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  /** Write back through the SAME race object (the parent holds this reference) and re-normalize.
   *  Empty Stufen are kept while editing — they are drop targets, and only dropped on save. */
  private commit(advantages: SkillBlock[], disadvantages: SkillBlock[], skills: Race['skills']): void {
    const normalized = normalizeRace({ ...this.race, advantages, disadvantages, skills }, { keepEmptyGroups: true });
    this.race.advantages = normalized.advantages;
    this.race.disadvantages = normalized.disadvantages;
    this.race.skills = normalized.skills;
  }

  removeSkill(skill: SkillBlock): void {
    if (!confirm(`„${skill.name}" wirklich entfernen?`)) return;
    this.race.advantages = this.advantages.filter(s => s !== skill);
    this.race.disadvantages = this.disadvantages.filter(s => s !== skill);
    for (const group of this.race.skills) {
      group.skills = group.skills.filter(s => s !== skill);
    }
    this.refreshChoiceFlags();
  }

  // ── Skill editor plumbing ───────────────────────────────────────────────────

  openNewSkillEditor(category: RaceAbilityCategory, level = 1): void {
    this.skillEditorSkill = null;
    this.editingEntry = null;
    this.pendingCategory = category;
    this.pendingSkillLevel = level;
    this.showSkillEditor = true;
  }

  openEditSkillEditor(entry: AbilityEntry): void {
    this.editingEntry = entry;
    this.skillEditorSkill = { ...entry.skill };
    this.pendingCategory = entry.category;
    this.pendingSkillLevel = entry.level || 1;
    this.showSkillEditor = true;
  }

  onSkillEditorSave(skill: SkillBlock): void {
    skill.skillSource = 'race';
    if (!skill.class) skill.class = this.race.name;

    if (this.editingEntry) {
      // Swap the edited ability in place, so it keeps its slot in a choice row.
      const old = this.editingEntry.skill;
      const swap = (list: SkillBlock[]) => list.map(s => (s === old ? skill : s));
      this.race.advantages = swap(this.advantages);
      this.race.disadvantages = swap(this.disadvantages);
      for (const group of this.race.skills) group.skills = swap(group.skills);
    } else if (this.pendingCategory === 'advantage') {
      this.race.advantages = [...this.advantages, skill];
    } else if (this.pendingCategory === 'disadvantage') {
      this.race.disadvantages = [...this.disadvantages, skill];
    } else {
      const level = this.pendingSkillLevel || 0;
      const group = this.race.skills.find(g => g.levelRequired === level);
      if (group) group.skills = [...group.skills, skill];
      else this.commit([...this.advantages], [...this.disadvantages],
                       [...this.race.skills, { levelRequired: level, skills: [skill], isChoice: false }]);
    }

    this.refreshChoiceFlags();
    this.showSkillEditor = false;
    this.editingEntry = null;
  }

  onSkillEditorDelete(): void {
    if (this.editingEntry) {
      const old = this.editingEntry.skill;
      this.race.advantages = this.advantages.filter(s => s !== old);
      this.race.disadvantages = this.disadvantages.filter(s => s !== old);
      for (const group of this.race.skills) group.skills = group.skills.filter(s => s !== old);
      this.refreshChoiceFlags();
    }
    this.showSkillEditor = false;
    this.editingEntry = null;
  }

  closeSkillEditor(): void {
    this.showSkillEditor = false;
    this.editingEntry = null;
  }

  // ── Card display helpers (mirrors the sheet's skill card) ───────────────────

  costIcon(skill: SkillBlock): string {
    switch (skill.cost?.type) {
      case 'mana':   return 'i-mana';
      case 'energy': return 'i-energy';
      default:       return 'i-life';
    }
  }

  statSummary(skill: SkillBlock): string {
    return (skill.statModifiers ?? [])
      .map(m => `${m.stat} ${m.amount > 0 ? '+' : ''}${m.amount}`)
      .join(', ');
  }

  // ── Misc ────────────────────────────────────────────────────────────────────

  onImageSelect(event: Event) { this.imageSelect.emit(event); }
  onSave() { this.save.emit(); }
  onCancel() { this.cancel.emit(); }
  onDelete() { this.delete.emit(); }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      active: 'i-active', passive: 'i-passive',
      dice_bonus: 'i-dice', stat_bonus: 'i-stat',
    };
    return icons[type] ?? 'i-ability';
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      active: 'Aktiv', passive: 'Passiv',
      dice_bonus: 'Würfelbonus', stat_bonus: 'Stat-Bonus',
    };
    return labels[type] ?? type;
  }
}
