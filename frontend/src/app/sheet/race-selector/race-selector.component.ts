import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Race, RaceSkill, createEmptyRace } from '../../model/race.model';
import { RaceService } from '../../services/race.service';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { SkillBlock } from '../../model/skill-block.model';

type ViewMode = 'select' | 'create' | 'edit' | 'view';

@Component({
  selector: 'app-race-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './race-selector.component.html',
  styleUrl: './race-selector.component.css'
})
export class RaceSelectorComponent implements OnInit {
  @Input() sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() close = new EventEmitter<void>();

  races: Race[] = [];
  viewMode: ViewMode = 'select';
  selectedRace: Race | null = null;
  editingRace: Race = createEmptyRace();

  // For skill creation
  newSkillLevelRequired: number = 1;
  newSkill: SkillBlock = this.createEmptySkill();

  // Pending image file to upload after save
  pendingImageFile: File | null = null;
  pendingImagePreview: string = '';

  loading = true;
  saving = false;

  constructor(private raceService: RaceService, private cd: ChangeDetectorRef) {}

  async ngOnInit() {
    this.loading = true;
    this.cd.detectChanges();

    this.races = await this.raceService.loadRaces();
    this.loading = false;
    this.cd.detectChanges();

    // If character already has a race, try to find it
    if (this.sheet.raceId) {
      this.selectedRace = this.races.find(r => r.id === this.sheet.raceId) || null;
    }
  }

  // Selection screen methods
  selectRace(race: Race) {
    this.selectedRace = race;
    this.viewMode = 'view';
  }

  confirmSelection() {
    if (this.selectedRace) {
      // Update the character sheet with the selected race
      this.patch.emit({ path: 'raceId', value: this.selectedRace.id });
      this.patch.emit({ path: 'race', value: this.selectedRace.name });
      this.close.emit();
    }
  }

  clearRace() {
    this.patch.emit({ path: 'raceId', value: '' });
    this.patch.emit({ path: 'race', value: '' });
    this.selectedRace = null;
  }

  // View race details
  viewRace(race: Race) {
    this.selectedRace = race;
    this.viewMode = 'view';
  }

  // Creation/Edit methods
  startCreate() {
    this.editingRace = createEmptyRace();
    this.editingRace.id = this.raceService.generateId();
    this.pendingImageFile = null;
    this.pendingImagePreview = '';
    this.viewMode = 'create';
  }

  startEdit(race: Race) {
    this.editingRace = JSON.parse(JSON.stringify(race)); // Deep copy
    this.pendingImageFile = null;
    this.pendingImagePreview = '';
    this.viewMode = 'edit';
  }

  async saveRace() {
    if (!this.editingRace.name.trim() || this.saving) {
      return; // Name is required or already saving
    }

    this.saving = true;
    this.cd.detectChanges();

    try {
      // Don't include base64 image in the main save - it will be uploaded separately
      const raceToSave = { ...this.editingRace };
      if (this.pendingImageFile) {
        // Clear the base64 preview, we'll upload the file separately
        raceToSave.baseImage = this.editingRace.baseImage; // Keep existing if no new file
      }

      await this.raceService.saveRace(raceToSave);

      // Upload image separately if there's a pending file
      if (this.pendingImageFile) {
        await this.raceService.uploadRaceImage(this.editingRace.id, this.pendingImageFile);
        this.pendingImageFile = null;
        this.pendingImagePreview = '';
      }

      this.races = await this.raceService.loadRaces();
      this.viewMode = 'select';
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async deleteRace(race: Race) {
    if (confirm(`Are you sure you want to delete "${race.name}"?`)) {
      await this.raceService.deleteRace(race.id);
      this.races = await this.raceService.loadRaces();
      if (this.selectedRace?.id === race.id) {
        this.selectedRace = null;
      }
      this.viewMode = 'select';
    }
  }

  cancelEdit() {
    this.viewMode = 'select';
  }

  backToSelect() {
    this.viewMode = 'select';
  }

  // Skill management for race creation
  createEmptySkill(): SkillBlock {
    return {
      name: '',
      class: '',
      description: '',
      type: 'passive',
      enlightened: false
    };
  }

  addSkillToRace() {
    if (!this.newSkill.name.trim()) return;

    const raceSkill: RaceSkill = {
      levelRequired: this.newSkillLevelRequired,
      skill: { ...this.newSkill }
    };

    this.editingRace.skills.push(raceSkill);

    // Reset
    this.newSkill = this.createEmptySkill();
    this.newSkillLevelRequired = 1;
  }

  removeSkillFromRace(index: number) {
    this.editingRace.skills.splice(index, 1);
  }

  // Image handling - store file for later upload, show preview
  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.pendingImageFile = file;

      // Create preview for UI
      const reader = new FileReader();
      reader.onload = () => {
        this.pendingImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onClose() {
    this.close.emit();
  }

  // Helper for checking if race is selected on character
  isCurrentRace(race: Race): boolean {
    return this.sheet.raceId === race.id;
  }
}
