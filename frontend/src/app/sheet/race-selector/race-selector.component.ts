import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Race, createEmptyRace, RaceSkill, SkillBlock, grantedRaceSkills, unarmedEffectiveness,
} from '../../model/race.model';
import { RaceService } from '../../services/race.service';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RaceFormComponent } from './race-form/race-form.component';
import { ImageUrlPipe } from '../../shared/image-url.pipe';

/** 'skills' = ability tree for the chosen race (default when a race is set).
 *  'select'  = browse races: list on the left, one full race on the right.
 *  'create'/'edit' = race form. */
type ViewMode = 'skills' | 'select' | 'create' | 'edit';

@Component({
  selector: 'app-race-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, RaceFormComponent, ImageUrlPipe],
  templateUrl: './race-selector.component.html',
  styleUrl: './race-selector.component.css'
})
export class RaceSelectorComponent implements OnInit, OnDestroy {
  @Input() sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() close = new EventEmitter<void>();

  races: Race[] = [];
  viewMode: ViewMode = 'select';
  selectedRace: Race | null = null;
  editingRace: Race = createEmptyRace();

  /** The race currently being READ in the browse view — selecting it is a separate, explicit step. */
  previewRace: Race | null = null;
  raceFilter = '';

  loreExpanded = false;

  /** Local mirror of selected racial skills for instant UI feedback.
   *  Key format: `${raceId}::${skillName}` */
  selectedSkillKeys = new Set<string>();

  pendingImageFile: File | null = null;
  pendingImagePreview = '';

  loading = true;
  saving = false;

  constructor(private raceService: RaceService, private cd: ChangeDetectorRef) {}

  async ngOnInit() {
    // The overlay covers the viewport; without this the sheet keeps its own scrollbar behind it.
    document.body.style.overflow = 'hidden';
    this.loading = true;
    this.cd.detectChanges();

    this.races = await this.raceService.loadRaces();
    this.loading = false;

    if (this.sheet.raceId) {
      this.selectedRace = this.races.find(r => r.id === this.sheet.raceId) || null;
      if (this.selectedRace) {
        this.viewMode = 'skills';
        this.syncSelectedSkillKeys();
        // Races edited after this character was created may have gained Vor-/Nachteile.
        this.grantAlwaysOnSkills(this.selectedRace);
      }
    }
    this.previewRace = this.selectedRace ?? this.filteredRaces[0] ?? null;
    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  // ── Browse view ─────────────────────────────────────────────────────────────

  get filteredRaces(): Race[] {
    const q = this.raceFilter.trim().toLowerCase();
    if (!q) return this.races;
    return this.races.filter(r => r.name.toLowerCase().includes(q));
  }

  showRace(race: Race) {
    this.previewRace = race;
    this.loreExpanded = false;
  }

  /** Waffenlose Effektivität — the race's BASE strength halved. */
  unarmedEff(race: Race): number {
    return unarmedEffectiveness(race.baseStrength);
  }

  // ── Ability tree helpers ────────────────────────────────────────────────────

  private syncSelectedSkillKeys() {
    this.selectedSkillKeys = new Set(
      (this.sheet.skills || [])
        .filter(s => s.sourceRaceId)
        .map(s => `${s.sourceRaceId}::${s.name}`)
    );
  }

  isSkillSelected(skill: SkillBlock, raceId: string): boolean {
    return this.selectedSkillKeys.has(`${raceId}::${skill.name}`);
  }

  isLevelUnlocked(levelRequired: number): boolean {
    return levelRequired <= (this.sheet.level || 1);
  }

  advantagesOf(race: Race): SkillBlock[] { return race.advantages ?? []; }
  disadvantagesOf(race: Race): SkillBlock[] { return race.disadvantages ?? []; }
  hasAlwaysOn(race: Race): boolean {
    return this.advantagesOf(race).length > 0 || this.disadvantagesOf(race).length > 0;
  }

  toggleSkill(skill: SkillBlock, raceId: string) {
    const key = `${raceId}::${skill.name}`;
    const currentSkills = [...(this.sheet.skills || [])];

    if (this.selectedSkillKeys.has(key)) {
      this.selectedSkillKeys.delete(key);
      const idx = currentSkills.findIndex(s => s.sourceRaceId === raceId && s.name === skill.name);
      if (idx >= 0) currentSkills.splice(idx, 1);
    } else {
      this.selectedSkillKeys.add(key);
      currentSkills.push({ ...skill, sourceRaceId: raceId });
    }
    this.patch.emit({ path: 'skills', value: currentSkills });
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'active':     return 'i-active';
      case 'passive':    return 'i-passive';
      case 'dice_bonus': return 'i-dice';
      case 'stat_bonus': return 'i-stat';
      default:           return 'i-ability';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'active':     return 'Aktiv';
      case 'passive':    return 'Passiv';
      case 'dice_bonus': return 'Würfelbonus';
      case 'stat_bonus': return 'Statbonus';
      default:           return type;
    }
  }

  // ── Selection ───────────────────────────────────────────────────────────────

  /** Dedicated confirm step — browsing a race no longer applies it. */
  confirmPreviewRace() {
    if (this.previewRace) this.selectRace(this.previewRace);
  }

  selectRace(race: Race) {
    const oldRaceId = this.sheet.raceId;
    let skills = [...(this.sheet.skills || [])];

    if (oldRaceId && oldRaceId !== race.id) {
      // Remove skills from the previously selected race
      skills = skills.filter(s => s.sourceRaceId !== oldRaceId);
      this.selectedSkillKeys.clear();
    }

    this.selectedRace = race;
    this.patch.emit({ path: 'raceId', value: race.id });
    this.patch.emit({ path: 'race', value: race.name });

    this.patch.emit({ path: 'strength.base', value: race.baseStrength });
    this.patch.emit({ path: 'dexterity.base', value: race.baseDexterity });
    this.patch.emit({ path: 'speed.base', value: race.baseSpeed });
    this.patch.emit({ path: 'intelligence.base', value: race.baseIntelligence });
    this.patch.emit({ path: 'constitution.base', value: race.baseConstitution });
    this.patch.emit({ path: 'chill.base', value: race.baseChill });
    this.patch.emit({ path: 'strength.gain', value: race.strengthPerLevel });
    this.patch.emit({ path: 'dexterity.gain', value: race.dexterityPerLevel });
    this.patch.emit({ path: 'speed.gain', value: race.speedPerLevel });
    this.patch.emit({ path: 'intelligence.gain', value: race.intelligencePerLevel });
    this.patch.emit({ path: 'constitution.gain', value: race.constitutionPerLevel });
    this.patch.emit({ path: 'chill.gain', value: race.chillPerLevel });
    // Statuses: [0] Leben, [1] Ausdauer, [2] Mana
    this.patch.emit({ path: 'statuses.0.statusBase', value: race.baseHealth });
    this.patch.emit({ path: 'statuses.1.statusBase', value: race.baseEnergy });
    this.patch.emit({ path: 'statuses.2.statusBase', value: race.baseMana });

    // Vor- und Nachteile are not chosen — they come with the race.
    this.patch.emit({ path: 'skills', value: this.withAlwaysOnSkills(race, skills) });
    this.syncSelectedSkillKeys();

    this.viewMode = 'skills';
  }

  /** Append the race's always-on abilities to a skill list, skipping ones already there. */
  private withAlwaysOnSkills(race: Race, skills: SkillBlock[]): SkillBlock[] {
    const out = [...skills];
    for (const skill of grantedRaceSkills(race)) {
      const exists = out.some(s => s.sourceRaceId === race.id && s.name === skill.name);
      if (!exists) out.push({ ...skill, sourceRaceId: race.id });
    }
    return out;
  }

  /** Patch in any always-on ability the sheet is missing (race edited after character creation). */
  private grantAlwaysOnSkills(race: Race): void {
    const current = this.sheet.skills || [];
    const next = this.withAlwaysOnSkills(race, current);
    if (next.length !== current.length) {
      this.patch.emit({ path: 'skills', value: next });
      this.selectedSkillKeys = new Set(
        next.filter(s => s.sourceRaceId).map(s => `${s.sourceRaceId}::${s.name}`)
      );
    }
  }

  clearRace() {
    const oldRaceId = this.sheet.raceId;
    const filteredSkills = (this.sheet.skills || []).filter(s => s.sourceRaceId !== oldRaceId);
    this.patch.emit({ path: 'skills', value: filteredSkills });
    this.patch.emit({ path: 'raceId', value: '' });
    this.patch.emit({ path: 'race', value: '' });
    this.selectedRace = null;
    this.selectedSkillKeys.clear();
    this.viewMode = 'select';
  }

  startRaceChange() {
    this.previewRace = this.selectedRace ?? this.filteredRaces[0] ?? null;
    this.viewMode = 'select';
  }

  startCreate() {
    this.editingRace = createEmptyRace();
    this.editingRace.id = this.raceService.generateId();
    this.pendingImageFile = null;
    this.pendingImagePreview = '';
    this.viewMode = 'create';
  }

  startEdit(race: Race) {
    this.editingRace = JSON.parse(JSON.stringify(race));
    this.pendingImageFile = null;
    this.pendingImagePreview = '';
    this.viewMode = 'edit';
  }

  async saveRace() {
    if (!this.editingRace.name.trim() || this.saving) return;

    this.saving = true;
    this.cd.detectChanges();

    try {
      await this.raceService.saveRace(this.editingRace);

      if (this.pendingImageFile) {
        await this.raceService.uploadRaceImage(this.editingRace.id, this.pendingImageFile);
        this.pendingImageFile = null;
        this.pendingImagePreview = '';
      }

      this.races = await this.raceService.loadRaces();
      const saved = this.races.find(r => r.id === this.editingRace.id) ?? null;
      this.previewRace = saved ?? this.previewRace;
      // If we just saved the race we're editing and it's also the selected race, refresh selectedRace
      if (this.selectedRace?.id === this.editingRace.id) {
        this.selectedRace = saved;
        if (this.selectedRace) this.grantAlwaysOnSkills(this.selectedRace);
        this.viewMode = 'skills';
      } else {
        this.viewMode = this.selectedRace ? 'skills' : 'select';
      }
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async deleteRace() {
    if (this.editingRace && confirm(`Rasse "${this.editingRace.name}" wirklich löschen?`)) {
      await this.raceService.deleteRace(this.editingRace.id);
      this.races = await this.raceService.loadRaces();
      if (this.selectedRace?.id === this.editingRace.id) {
        this.selectedRace = null;
        this.selectedSkillKeys.clear();
        this.patch.emit({ path: 'raceId', value: '' });
        this.patch.emit({ path: 'race', value: '' });
      }
      if (this.previewRace?.id === this.editingRace.id) {
        this.previewRace = this.filteredRaces[0] ?? null;
      }
      this.viewMode = this.selectedRace ? 'skills' : 'select';
    }
  }

  cancelEdit() {
    this.viewMode = this.selectedRace ? 'skills' : 'select';
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.pendingImageFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.pendingImagePreview = reader.result as string;
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onClose() {
    this.close.emit();
  }

  isCurrentRace(race: Race): boolean {
    return this.sheet.raceId === race.id;
  }

  countSelectedForGroup(raceId: string, group: RaceSkill): number {
    return group.skills.filter(s => this.selectedSkillKeys.has(`${raceId}::${s.name}`)).length;
  }
}
