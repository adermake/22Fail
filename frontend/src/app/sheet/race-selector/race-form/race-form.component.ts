import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  readonly categories: { value: RaceAbilityCategory; label: string }[] = [
    { value: 'advantage',    label: 'Vorteil' },
    { value: 'disadvantage', label: 'Nachteil' },
    { value: 'skill',        label: 'Rassenfähigkeit' },
  ];

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

  /** Waffenlose Effektivitaet — base strength halved. */
  get unarmedEffectiveness(): number { return unarmedEffectiveness(this.race.baseStrength); }
  get disadvantages(): SkillBlock[] { return this.race.disadvantages ??= []; }

  entryOf(skill: SkillBlock, category: RaceAbilityCategory, level = 0): AbilityEntry {
    return { skill, category, level };
  }

  // ── Mutations ───────────────────────────────────────────────────────────────

  /** Write back through the SAME race object (the parent holds this reference) and re-normalize. */
  private commit(advantages: SkillBlock[], disadvantages: SkillBlock[], skills: Race['skills']): void {
    const normalized = normalizeRace({ ...this.race, advantages, disadvantages, skills });
    this.race.advantages = normalized.advantages;
    this.race.disadvantages = normalized.disadvantages;
    this.race.skills = normalized.skills;
  }

  /** Remove an ability from wherever it currently lives; returns the remaining buckets. */
  private withoutEntry(entry: AbilityEntry) {
    const advantages = this.advantages.filter(s => s !== entry.skill);
    const disadvantages = this.disadvantages.filter(s => s !== entry.skill);
    const skills = this.race.skills
      .map(g => ({ ...g, skills: g.skills.filter(s => s !== entry.skill) }))
      .filter(g => g.skills.length > 0);
    return { advantages, disadvantages, skills };
  }

  /** Move an ability between Vorteil / Nachteil / Rassenfähigkeit without losing its content. */
  moveTo(entry: AbilityEntry, raw: string): void {
    const category = raw as RaceAbilityCategory;
    if (category === entry.category) return;
    const { advantages, disadvantages, skills } = this.withoutEntry(entry);

    if (category === 'advantage') advantages.push(entry.skill);
    else if (category === 'disadvantage') disadvantages.push(entry.skill);
    else {
      // Land on the level it had (or 1) — normalizeRace merges it into an existing row.
      const level = entry.level || 1;
      skills.push({ levelRequired: level, skills: [entry.skill], isChoice: false });
    }
    this.commit(advantages, disadvantages, skills);
  }

  /** Retarget a whole level row; colliding rows merge into one choice row. */
  setGroupLevel(groupIndex: number, rawLevel: unknown): void {
    const level = Math.max(0, Math.floor(Number(rawLevel) || 0));
    const skills = this.race.skills.map((g, i) => (i === groupIndex ? { ...g, levelRequired: level } : g));
    this.commit([...this.advantages], [...this.disadvantages], skills);
  }

  removeEntry(entry: AbilityEntry): void {
    if (!confirm(`„${entry.skill.name}" wirklich entfernen?`)) return;
    const { advantages, disadvantages, skills } = this.withoutEntry(entry);
    this.commit(advantages, disadvantages, skills);
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
      this.commit(
        swap(this.advantages),
        swap(this.disadvantages),
        this.race.skills.map(g => ({ ...g, skills: swap(g.skills) })),
      );
    } else {
      const advantages = [...this.advantages];
      const disadvantages = [...this.disadvantages];
      const skills = this.race.skills.map(g => ({ ...g, skills: [...g.skills] }));

      if (this.pendingCategory === 'advantage') advantages.push(skill);
      else if (this.pendingCategory === 'disadvantage') disadvantages.push(skill);
      else skills.push({ levelRequired: this.pendingSkillLevel || 0, skills: [skill], isChoice: false });

      this.commit(advantages, disadvantages, skills);
    }

    this.showSkillEditor = false;
    this.editingEntry = null;
  }

  onSkillEditorDelete(): void {
    if (this.editingEntry) {
      const { advantages, disadvantages, skills } = this.withoutEntry(this.editingEntry);
      this.commit(advantages, disadvantages, skills);
    }
    this.showSkillEditor = false;
    this.editingEntry = null;
  }

  closeSkillEditor(): void {
    this.showSkillEditor = false;
    this.editingEntry = null;
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
      dice_bonus: 'W\u00FCrfelbonus', stat_bonus: 'Stat-Bonus',
    };
    return labels[type] ?? type;
  }
}
