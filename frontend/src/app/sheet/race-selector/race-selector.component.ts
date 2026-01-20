import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Race, createEmptyRace } from '../../model/race.model';
import { RaceService } from '../../services/race.service';
import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RaceCardComponent } from './race-card/race-card.component';
import { RaceDetailComponent } from './race-detail/race-detail.component';
import { RaceFormComponent } from './race-form/race-form.component';

type ViewMode = 'select' | 'create' | 'edit' | 'view';

@Component({
  selector: 'app-race-selector',
  standalone: true,
  imports: [CommonModule, RaceCardComponent, RaceDetailComponent, RaceFormComponent],
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

  selectRace(race: Race) {
    this.selectedRace = race;
    this.viewMode = 'view';
  }

  confirmSelection() {
    if (this.selectedRace) {
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

  startCreate() {
    this.editingRace = createEmptyRace();
    this.editingRace.id = this.raceService.generateId();
    this.pendingImageFile = null;
    this.pendingImagePreview = '';
    this.viewMode = 'create';
  }

  startEdit() {
    if (this.selectedRace) {
      this.editingRace = JSON.parse(JSON.stringify(this.selectedRace));
      this.pendingImageFile = null;
      this.pendingImagePreview = '';
      this.viewMode = 'edit';
    }
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
    if (this.selectedRace && confirm(`Are you sure you want to delete "${this.selectedRace.name}"?`)) {
      await this.raceService.deleteRace(this.selectedRace.id);
      this.races = await this.raceService.loadRaces();
      this.selectedRace = null;
      this.viewMode = 'select';
    }
  }

  cancelEdit() {
    this.viewMode = 'select';
  }

  backToSelect() {
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
