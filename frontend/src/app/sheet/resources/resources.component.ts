import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CharacterSheet } from '../../model/character-sheet-model';
import { ItemBlock, ResourceItemType, isResourceItemType } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { MaterialBlock } from '../../model/forging.model';
import { IngredientBlock, ExtractorBlock, createResourceItem } from '../../model/brewing.model';

type ResourceFilter = 'all' | ResourceItemType;

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesComponent {
  @Input({ required: true }) sheet!: CharacterSheet;
  @Output() patch = new EventEmitter<JsonPatch>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  filter: ResourceFilter = 'all';
  showAdd = false;
  addKind: ResourceItemType = 'raw-material';
  addFilter = '';
  isLoading = signal(false);

  materials: MaterialBlock[] = [];
  ingredients: IngredientBlock[] = [];
  extractors: ExtractorBlock[] = [];

  get resources(): ItemBlock[] {
    return (this.sheet.resources ?? []).filter(r => r && isResourceItemType(r.itemType));
  }

  get filtered(): ItemBlock[] {
    if (this.filter === 'all') return this.resources;
    return this.resources.filter(r => r.itemType === this.filter);
  }

  kindLabel(t: string | undefined): string {
    if (t === 'raw-material') return 'Material';
    if (t === 'ingredient') return 'Wirkstoff';
    if (t === 'extractor') return 'Extraktor';
    return t ?? '';
  }

  setFilter(f: ResourceFilter): void {
    this.filter = f;
    this.cdr.markForCheck();
  }

  async openAdd(kind: ResourceItemType): Promise<void> {
    this.addKind = kind;
    this.addFilter = '';
    this.showAdd = true;
    this.isLoading.set(true);
    this.cdr.markForCheck();
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      if (kind === 'raw-material') {
        const all: MaterialBlock[] = [];
        for (const lib of libraries) {
          const files = await firstValueFrom(this.api.searchFiles(lib.id, '', ['material']));
          for (const f of files) {
            const d = f.data as MaterialBlock;
            if (d) all.push({ ...d, id: d.id || f.id });
          }
        }
        this.materials = all.sort((a, b) => a.name.localeCompare(b.name));
      } else if (kind === 'ingredient') {
        const all: IngredientBlock[] = [];
        for (const lib of libraries) {
          const files = await firstValueFrom(this.api.searchFiles(lib.id, '', ['ingredient']));
          for (const f of files) {
            const d = f.data as IngredientBlock;
            if (d) all.push({ ...d, id: d.id || f.id });
          }
        }
        this.ingredients = all.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        const all: ExtractorBlock[] = [];
        for (const lib of libraries) {
          const files = await firstValueFrom(this.api.searchFiles(lib.id, '', ['extractor']));
          for (const f of files) {
            const d = f.data as ExtractorBlock;
            if (d) all.push({ ...d, id: d.id || f.id });
          }
        }
        this.extractors = all.sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (e) {
      console.error('Resources: load failed', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  closeAdd(): void {
    this.showAdd = false;
    this.cdr.markForCheck();
  }

  get addOptions(): { id: string; name: string }[] {
    const q = this.addFilter.toLowerCase();
    let list: { id: string; name: string }[] = [];
    if (this.addKind === 'raw-material') list = this.materials.map(m => ({ id: m.id, name: m.name }));
    else if (this.addKind === 'ingredient') list = this.ingredients.map(i => ({ id: i.id, name: i.name }));
    else list = this.extractors.map(e => ({ id: e.id, name: e.name }));
    if (q) list = list.filter(x => x.name.toLowerCase().includes(q));
    return list;
  }

  addUnit(id: string, name: string): void {
    const resources = [...(this.sheet.resources ?? [])];
    const existing = resources.findIndex(
      r => r?.itemType === this.addKind && r.libraryAssetId === id,
    );
    if (existing >= 0) {
      const r = resources[existing]!;
      resources[existing] = { ...r, amount: (r.amount ?? 1) + 1 };
    } else {
      resources.push(createResourceItem(this.addKind, name, id, 1));
    }
    this.patch.emit({ path: '/resources', value: resources });
    this.closeAdd();
  }

  adjustAmount(indexInFiltered: number, delta: number): void {
    const item = this.filtered[indexInFiltered];
    if (!item) return;
    const resources = [...(this.sheet.resources ?? [])];
    const idx = resources.findIndex(r => r?.id === item.id);
    if (idx < 0) return;
    const next = (resources[idx]!.amount ?? 1) + delta;
    if (next <= 0) resources.splice(idx, 1);
    else resources[idx] = { ...resources[idx]!, amount: next };
    this.patch.emit({ path: '/resources', value: resources });
  }

  remove(indexInFiltered: number): void {
    const item = this.filtered[indexInFiltered];
    if (!item) return;
    const resources = (this.sheet.resources ?? []).filter(r => r?.id !== item.id);
    this.patch.emit({ path: '/resources', value: resources });
  }
}
