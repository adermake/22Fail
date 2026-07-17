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
import { IngredientBlock, ExtractorBlock, BREW_SLOT_LABELS } from '../../model/brewing.model';

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

  activeTab: 'runes' | 'materials' | 'traits' | 'ingredients' | 'extractors' = 'runes';
  isLoading = signal(false);
  knownMaterials: MaterialBlock[] = [];
  knownTraits: ForgeTrait[] = [];
  knownIngredients: IngredientBlock[] = [];
  knownExtractors: ExtractorBlock[] = [];
  slotLabels = BREW_SLOT_LABELS;

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadMaterials(),
      this.loadTraits(),
      this.loadIngredients(),
      this.loadExtractors(),
    ]);
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
        .map(f => ({ ...(f.data as MaterialBlock), id: (f.data as MaterialBlock).id || f.id }))
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
        .map(f => ({ ...(f.data as ForgeTrait), id: (f.data as ForgeTrait).id || f.id }))
        .filter(t => t.isPublic || knownIds.has(t.id));
    } catch (e) {
      console.error('Wissen: Fehler beim Laden der Schmiedemerkmale', e);
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async loadIngredients(): Promise<void> {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const files: AssetFile[] = [];
      for (const lib of libraries) {
        files.push(...await firstValueFrom(this.api.searchFiles(lib.id, '', ['ingredient'])));
      }
      const knownIds = new Set(this.sheet.knownIngredientIds ?? []);
      this.knownIngredients = files
        .map(f => ({ ...(f.data as IngredientBlock), id: (f.data as IngredientBlock).id || f.id }))
        .filter(i => i.isPublic || knownIds.has(i.id));
    } catch (e) {
      console.error('Wissen: Fehler beim Laden der Wirkstoffe', e);
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async loadExtractors(): Promise<void> {
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const files: AssetFile[] = [];
      for (const lib of libraries) {
        files.push(...await firstValueFrom(this.api.searchFiles(lib.id, '', ['extractor'])));
      }
      const knownIds = new Set(this.sheet.knownExtractorIds ?? []);
      this.knownExtractors = files
        .map(f => ({ ...(f.data as ExtractorBlock), id: (f.data as ExtractorBlock).id || f.id }))
        .filter(e => e.isPublic || knownIds.has(e.id));
    } catch (e) {
      console.error('Wissen: Fehler beim Laden der Extraktoren', e);
    } finally {
      this.cdr.markForCheck();
    }
  }

  setTab(tab: 'runes' | 'materials' | 'traits' | 'ingredients' | 'extractors'): void {
    this.activeTab = tab;
  }

  get runeCount(): number { return (this.sheet.runes || []).length; }
}
