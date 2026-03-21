import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { SkillComponent } from '../skill/skill.component';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { SkillBlock } from '../../model/skill-block.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillEditorComponent } from '../../shared/skill-editor/skill-editor.component';
import { SKILL_DEFINITIONS, CLASS_DEFINITIONS } from '../../data/skill-definitions';
import { SkillDefinition } from '../../model/skill-definition.model';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, FormsModule, SkillComponent, CardComponent, SkillEditorComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css',
})
export class SkillsComponent implements OnInit {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Input() editingSkills!: Set<number>;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() editingChange = new EventEmitter<{index: number, isEditing: boolean}>();

  // Search / filter state
  searchText = '';
  filterType = '';
  filterClass = '';
  filterAction = '';
  filterCost = '';
  filterTier = '';
  showFilters = false;

  // Sort state
  sortBy: 'type' | 'name' | 'class' | 'tier' | 'cost' = 'type';
  sortDir: 'asc' | 'desc' = 'asc';

  // Editor state
  showSkillEditor = false;
  editorSkillIndex: number | null = null;

  private readonly TYPE_LABELS: Record<string, string> = {
    active: 'aktiv',
    passive: 'passiv',
    dice_bonus: 'wuerfelbonus wuerfeln wuerfel',
    stat_bonus: 'stat-bonus',
  };

  private readonly COST_LABELS: Record<string, string> = {
    mana: 'mana',
    energy: 'energie ausdauer',
    life: 'leben',
  };

  private readonly RANK_ROMAN: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  };

  ngOnInit() {
    if (!this.sheet.skills) {
      this.sheet.skills = [];
    }
  }

  private buildSearchCorpus(s: SkillBlock): string {
    const def = this.getDefinition(s);
    const type = def?.type ?? s.type;
    const cost = def?.cost ?? s.cost;
    const action = def?.actionType ?? s.actionType;
    const tier = CLASS_DEFINITIONS[s.class]?.tier;
    const parts = [
      s.name ?? '',
      s.description ?? '',
      s.class ?? '',
      this.TYPE_LABELS[type] ?? type,
      action ?? '',
      cost ? (this.COST_LABELS[cost.type] ?? cost.type) : '',
      cost ? String(cost.amount) : '',
      tier ? (this.RANK_ROMAN[tier] ?? '') : '',
      tier ? `rang ${this.RANK_ROMAN[tier] ?? ''}` : '',
      s.enlightened ? 'erleuchtet' : '',
    ];
    return parts.join(' ').toLowerCase();
  }

  // --- Filter helpers ---

  getDefinition(skill: SkillBlock): SkillDefinition | undefined {
    if (skill.skillId) return SKILL_DEFINITIONS.find(s => s.id === skill.skillId);
    return SKILL_DEFINITIONS.find(s => s.name === skill.name && s.class === skill.class)
      ?? SKILL_DEFINITIONS.find(s => s.name === skill.name);
  }

  get availableClasses(): string[] {
    const classes = new Set<string>();
    (this.sheet.skills || []).forEach(s => { if (s.class) classes.add(s.class); });
    return [...classes].sort();
  }

  get filteredSkills(): SkillBlock[] {
    let skills = [...(this.sheet.skills || [])];

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      skills = skills.filter(s => this.buildSearchCorpus(s).includes(q));
    }

    if (this.filterType) {
      skills = skills.filter(s => (this.getDefinition(s)?.type ?? s.type) === this.filterType);
    }

    if (this.filterClass) {
      skills = skills.filter(s => s.class === this.filterClass);
    }

    if (this.filterAction) {
      skills = skills.filter(s => {
        const action = this.getDefinition(s)?.actionType ?? s.actionType;
        return action === this.filterAction;
      });
    }

    if (this.filterCost) {
      skills = skills.filter(s => {
        const cost = this.getDefinition(s)?.cost ?? s.cost;
        if (this.filterCost === 'free') return !cost;
        return cost?.type === this.filterCost;
      });
    }

    if (this.filterTier) {
      const tier = parseInt(this.filterTier, 10);
      skills = skills.filter(s => CLASS_DEFINITIONS[s.class]?.tier === tier);
    }

    // Dynamic sort
    const typeOrder: Record<string, number> = { active: 0, passive: 1, dice_bonus: 2, stat_bonus: 3 };
    const dir = this.sortDir === 'asc' ? 1 : -1;

    skills.sort((a, b) => {
      const da = this.getDefinition(a), db = this.getDefinition(b);
      let cmp = 0;
      switch (this.sortBy) {
        case 'type': {
          const ta = typeOrder[da?.type ?? a.type] ?? 4;
          const tb = typeOrder[db?.type ?? b.type] ?? 4;
          cmp = ta - tb;
          if (cmp === 0) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        }
        case 'name':
          cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        case 'class':
          cmp = (a.class ?? '').localeCompare(b.class ?? '');
          if (cmp === 0) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        case 'tier': {
          const ta = CLASS_DEFINITIONS[a.class]?.tier ?? 0;
          const tb = CLASS_DEFINITIONS[b.class]?.tier ?? 0;
          cmp = ta - tb;
          if (cmp === 0) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        }
        case 'cost': {
          const ca = (da?.cost ?? a.cost)?.amount ?? 0;
          const cb = (db?.cost ?? b.cost)?.amount ?? 0;
          cmp = ca - cb;
          if (cmp === 0) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        }
      }
      return cmp * dir;
    });

    return skills;
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText || this.filterType || this.filterClass ||
              this.filterAction || this.filterCost || this.filterTier);
  }

  clearFilters() {
    this.searchText = '';
    this.filterType = '';
    this.filterClass = '';
    this.filterAction = '';
    this.filterCost = '';
    this.filterTier = '';
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  }

  // --- Editor ---

  openEditor(index: number) {
    this.editorSkillIndex = index;
    this.showSkillEditor = true;
  }

  openCreateDialog() {
    this.editorSkillIndex = null;
    this.showSkillEditor = true;
  }

  closeEditor() {
    this.showSkillEditor = false;
    this.editorSkillIndex = null;
  }

  get editorSkill(): SkillBlock | null {
    if (this.editorSkillIndex === null) return null;
    return this.sheet.skills[this.editorSkillIndex] ?? null;
  }

  onEditorSave(skill: SkillBlock) {
    if (this.editorSkillIndex !== null) {
      this.sheet.skills[this.editorSkillIndex] = skill;
    } else {
      this.sheet.skills = [...this.sheet.skills, skill];
    }
    this.sheet.skills = [...this.sheet.skills];
    this.patch.emit({ path: 'skills', value: this.sheet.skills });
    this.closeEditor();
  }

  onEditorDelete() {
    if (this.editorSkillIndex !== null) {
      this.deleteSkill(this.editorSkillIndex);
    }
    this.closeEditor();
  }

  // --- CRUD ---

  deleteSkill(index: number) {
    const skill = this.sheet.skills[index];
    this.sheet.skills = this.sheet.skills.filter((_, i) => i !== index);
    const trash = this.sheet.trash || [];
    trash.push({ type: 'skill', data: skill, deletedAt: Date.now() });
    this.patch.emit({ path: 'skills', value: this.sheet.skills });
    this.patch.emit({ path: 'trash', value: trash });
  }

  getOriginalIndex(skill: SkillBlock): number {
    return this.sheet.skills.indexOf(skill);
  }
}
