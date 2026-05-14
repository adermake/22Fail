import {
  Component, Input, Output, EventEmitter, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { CharacterSheet } from '../../model/character-sheet-model';
import { JsonPatch } from '../../model/json-patch.model';
import { RunesComponent } from '../../shared/runes/runes.component';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import { MaterialBlock, ForgeTrait } from '../../model/forging.model';

@Component({
  selector: 'app-wissen',
  standalone: true,
  imports: [CommonModule, RunesComponent],
  templateUrl: './wissen.component.html',
  styleUrl: './wissen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WissenComponent implements OnInit {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'runes' | 'materials' | 'traits' = 'runes';
  isLoading = signal(false);
  knownMaterials: MaterialBlock[] = [];
  knownTraits: ForgeTrait[] = [];

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadMaterials(), this.loadTraits()]);
  }

  private async loadMaterials(): Promise<void> {
    this.isLoading.set(true);
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const materialFiles: AssetFile[] = [];
      for (const lib of libraries) {
        const mats = await firstValueFrom(this.api.searchFiles(lib.id, '', ['material']));
        materialFiles.push(...mats);
      }
      const knownIds = new Set(this.sheet.knownMaterialIds ?? []);
      this.knownMaterials = materialFiles
        .map(f => f.data as MaterialBlock)
        .filter(m => m.isPublic || knownIds.has(m.id));
    } catch (e) {
      console.error('Wissen: Fehler beim Laden der Materialien', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  private async loadTraits(): Promise<void> {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const traitFiles: AssetFile[] = [];
      for (const lib of libraries) {
        const traits = await firstValueFrom(this.api.searchFiles(lib.id, '', ['forge-trait']));
        traitFiles.push(...traits);
      }
      const knownIds = new Set(this.sheet.knownForgeTraitIds ?? []);
      this.knownTraits = traitFiles
        .map(f => f.data as ForgeTrait)
        .filter(t => t.isPublic || knownIds.has(t.id));
    } catch (e) {
      console.error('Wissen: Fehler beim Laden der Schmiedemerkmale', e);
    } finally {
      this.cdr.markForCheck();
    }
  }

  setTab(tab: 'runes' | 'materials' | 'traits'): void {
    this.activeTab = tab;
  }

  get runeCount(): number { return (this.sheet.runes || []).length; }
  get publicMaterialCount(): number { return this.knownMaterials.filter(m => m.isPublic).length; }
  get knownOnlyCount(): number { return this.knownMaterials.filter(m => !m.isPublic).length; }
  get publicTraitCount(): number { return this.knownTraits.filter(t => t.isPublic).length; }
  get knownOnlyTraitCount(): number { return this.knownTraits.filter(t => !t.isPublic).length; }
}
