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

export type FilterState = 'include' | 'exclude' | 'off';

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

  // Search
  searchText = '';

  // Multi-select filter state (Record<value, FilterState>)
  filterTypes:   Record<string, FilterState> = {};
  filterClasses: Record<string, FilterState> = {};
  filterActions: Record<string, FilterState> = {};
  filterCosts:   Record<string, FilterState> = {};
  filterTiers:   Record<string, FilterState> = {};

  showFilters = false;

  // Sort
  sortBy: 'type' | 'name' | 'class' | 'tier' | 'cost' = 'type';
  sortDir: 'asc' | 'desc' = 'asc';

  // Editor
  showSkillEditor = false;
  editorSkillIndex: number | null = null;

  // Static option lists
  readonly typeOptions = [
    { value: 'active',     label: '\u26A1 Aktiv' },
    { value: 'passive',    label: '\uD83D\uDD2E Passiv' },
    { value: 'dice_bonus', label: '\uD83C\uDFB2 W\u00FCrfelbonus' },
    { value: 'stat_bonus', label: '\uD83D\uDCC8 Stat-Bonus' },
  ];
  readonly actionOptions = [
    { value: 'Aktion',       label: '\u2694 Aktion' },
    { value: 'Bonusaktion',  label: '\u2726 Bonusaktion' },
    { value: 'Keine Aktion', label: '\u25CE Keine Aktion' },
    { value: 'Reaktion',     label: '\u21A9 Reaktion' },
  ];
  readonly costOptions = [
    { value: 'free',   label: 'Kostenlos' },
    { value: 'mana',   label: '\uD83D\uDCA7 Mana' },
    { value: 'energy', label: '\u26A1 Energie' },
    { value: 'life',   label: '\u2764 Leben' },
  ];
  readonly tierOptions = [
    { value: '1', label: 'Rang I' },
    { value: '2', label: 'Rang II' },
    { value: '3', label: 'Rang III' },
    { value: '4', label: 'Rang IV' },
    { value: '5', label: 'Rang V' },
  ];

  private readonly TYPE_LABELS: Record<string, string> = {
    active: 'aktiv',
    passive: 'passiv',
    dice_bonus: 'wuerfelbonus wuerfeln wuerfel',
    stat_bonus: 'stat-bonus',
  };
  private readonly COST_LABELS: Record<string, string> = {
    mana: 'mana', energy: 'energie ausdauer', life: 'leben',
  };
  private readonly RANK_ROMAN: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  };

  ngOnInit() {
    if (!this.sheet.skills) this.sheet.skills = [];
  }

  // --- Search corpus ---

  private buildSearchCorpus(s: SkillBlock): string {
    const def = this.getDefinition(s);
    const type = def?.type ?? s.type;
    const cost = def?.cost ?? s.cost;
    const action = def?.actionType ?? s.actionType;
    const tier = CLASS_DEFINITIONS[s.class]?.tier;
    return [
      s.name ?? '',
      s.description ?? '',
      s.class ?? '',
      this.TYPE_LABELS[type] ?? type,
      action ?? '',
      cost ? (this.COST_LABELS[cost.type] ?? cost.type) : '',
      cost ? String(cost.amount) : '',
      tier ? (this.RANK_ROMAN[tier] ?? '') : '',
      tier ? `rang ${this.RANK_ROMAN[tier] ?? ''}` : '',
      s.enlightened ? 'erkenntnis' : '',
    ].join(' ').toLowerCase();
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

  private applyMultiFilter(
    skills: SkillBlock[],
    getKey: (s: SkillBlock) => string,
    states: Record<string, FilterState>
  ): SkillBlock[] {
    const includes = Object.entries(states).filter(([, v]) => v === 'include').map(([k]) => k);
    const excludes = Object.entries(states).filter(([, v]) => v === 'exclude').map(([k]) => k);
    if (!includes.length && !excludes.length) return skills;
    return skills.filter(s => {
      const key = getKey(s);
      if (excludes.includes(key)) return false;
      if (includes.length) return includes.includes(key);
      return true;
    });
  }

  private hasFilter(obj: Record<string, FilterState>): boolean {
    return Object.values(obj).some(v => v !== 'off');
  }

  cycleFilter(
    dim: 'types' | 'classes' | 'actions' | 'costs' | 'tiers',
    key: string
  ) {
    const map: Record<string, Record<string, FilterState>> = {
      types: this.filterTypes, classes: this.filterClasses,
      actions: this.filterActions, costs: this.filterCosts, tiers: this.filterTiers,
    };
    const current = map[dim][key] || 'off';
    const next = current === 'off' ? 'include' : current === 'include' ? 'exclude' : 'off';
    const clone = { ...map[dim] };
    if (next === 'off') delete clone[key]; else clone[key] = next;
    if (dim === 'types')   this.filterTypes   = clone;
    if (dim === 'classes') this.filterClasses = clone;
    if (dim === 'actions') this.filterActions = clone;
    if (dim === 'costs')   this.filterCosts   = clone;
    if (dim === 'tiers')   this.filterTiers   = clone;
  }

  getFilterState(obj: Record<string, FilterState>, key: string): FilterState {
    return obj[key] || 'off';
  }

  get filteredSkills(): SkillBlock[] {
    let skills = [...(this.sheet.skills || [])];

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      skills = skills.filter(s => this.buildSearchCorpus(s).includes(q));
    }

    // Type filter
    if (this.hasFilter(this.filterTypes)) {
      skills = this.applyMultiFilter(
        skills,
        s => this.getDefinition(s)?.type ?? s.type,
        this.filterTypes
      );
    }

    // Class filter
    if (this.hasFilter(this.filterClasses)) {
      skills = this.applyMultiFilter(skills, s => s.class ?? '', this.filterClasses);
    }

    // Action filter
    if (this.hasFilter(this.filterActions)) {
      skills = this.applyMultiFilter(
        skills,
        s => this.getDefinition(s)?.actionType ?? s.actionType ?? '',
        this.filterActions
      );
    }

    // Cost filter — 'free' = no cost
    if (this.hasFilter(this.filterCosts)) {
      skills = this.applyMultiFilter(
        skills,
        s => {
          const cost = this.getDefinition(s)?.cost ?? s.cost;
          return cost ? cost.type : 'free';
        },
        this.filterCosts
      );
    }

    // Tier filter
    if (this.hasFilter(this.filterTiers)) {
      skills = this.applyMultiFilter(
        skills,
        s => String(CLASS_DEFINITIONS[s.class]?.tier ?? ''),
        this.filterTiers
      );
    }

    // Sort
    const typeOrder: Record<string, number> = { active: 0, passive: 1, dice_bonus: 2, stat_bonus: 3 };
    const dir = this.sortDir === 'asc' ? 1 : -1;
    skills.sort((a, b) => {
      const da = this.getDefinition(a), db = this.getDefinition(b);
      let cmp = 0;
      switch (this.sortBy) {
        case 'type': {
          cmp = (typeOrder[da?.type ?? a.type] ?? 4) - (typeOrder[db?.type ?? b.type] ?? 4);
          if (!cmp) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        }
        case 'name':  cmp = (a.name ?? '').localeCompare(b.name ?? ''); break;
        case 'class': cmp = (a.class ?? '').localeCompare(b.class ?? '');
                      if (!cmp) cmp = (a.name ?? '').localeCompare(b.name ?? ''); break;
        case 'tier': {
          cmp = (CLASS_DEFINITIONS[a.class]?.tier ?? 0) - (CLASS_DEFINITIONS[b.class]?.tier ?? 0);
          if (!cmp) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        }
        case 'cost': {
          cmp = ((da?.cost ?? a.cost)?.amount ?? 0) - ((db?.cost ?? b.cost)?.amount ?? 0);
          if (!cmp) cmp = (a.name ?? '').localeCompare(b.name ?? '');
          break;
        }
      }
      return cmp * dir;
    });

    return skills;
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchText) ||
      this.hasFilter(this.filterTypes) ||
      this.hasFilter(this.filterClasses) ||
      this.hasFilter(this.filterActions) ||
      this.hasFilter(this.filterCosts) ||
      this.hasFilter(this.filterTiers);
  }

  clearFilters() {
    this.searchText = '';
    this.filterTypes = {};
    this.filterClasses = {};
    this.filterActions = {};
    this.filterCosts = {};
    this.filterTiers = {};
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
    if (this.editorSkillIndex !== null) this.deleteSkill(this.editorSkillIndex);
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
