import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Race, createEmptyRace } from '../../model/race.model';
import { RaceService } from '../../services/race.service';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RaceCardComponent } from './race-card/race-card.component';
import { RaceFormComponent } from './race-form/race-form.component';

type ViewMode = 'select' | 'create' | 'edit';

@Component({
  selector: 'app-race-selector',
  standalone: true,
  imports: [CommonModule, RaceCardComponent, RaceFormComponent],
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

  pendingImageFile: File | null = null;
  pendingImagePreview = '';

  loading = true;
  saving = false;

  constructor(private raceService: RaceService, private cd: ChangeDetectorRef) {}

  async ngOnInit() {
    this.loading = true;
    this.cd.detectChanges();

    this.races = await this.raceService.loadRaces();
    this.loading = false;
    this.cd.detectChanges();

    if (this.sheet.raceId) {
      this.selectedRace = this.races.find(r => r.id === this.sheet.raceId) || null;
    }
  }

  // Single click selects the race
  selectRace(race: Race) {
    this.selectedRace = race;
    this.patch.emit({ path: 'raceId', value: race.id });
    this.patch.emit({ path: 'race', value: race.name });
  }

  clearRace() {
    this.patch.emit({ path: 'raceId', value: '' });
    this.patch.emit({ path: 'race', value: '' });
    this.selectedRace = null;
  }

  startCreate() {
    this.editingRace = createEmptyRace();
    this.editingRace.id = this.raceService.generateId();
    this.pendingImageFile = null;
    this.pendingImagePreview = '';
    this.viewMode = 'create';
  }

  // Double click opens edit mode
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
      this.viewMode = 'select';
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  async deleteRace() {
    if (this.editingRace && confirm(`Are you sure you want to delete "${this.editingRace.name}"?`)) {
      await this.raceService.deleteRace(this.editingRace.id);
      this.races = await this.raceService.loadRaces();
      if (this.selectedRace?.id === this.editingRace.id) {
        this.selectedRace = null;
        this.patch.emit({ path: 'raceId', value: '' });
        this.patch.emit({ path: 'race', value: '' });
      }
      this.viewMode = 'select';
    }
  }

  cancelEdit() {
    this.viewMode = 'select';
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
}
