import {
  Component, OnInit, OnDestroy, Output, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef, inject, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import { MaterialBlock, ForgeTrait, WEAPON_TYPES, WeaponType, WeaponCategory } from '../../model/forging.model';
import { ItemBlock } from '../../model/item-block.model';
import {
  WeaponGeneratorService,
  GeneratorParams,
  GeneratedWeaponResult,
  ItemFilterState,
} from '../../services/weapon-generator.service';

const LS_PARAMS_KEY = 'wg_params';
const LS_MAT_FILTERS_KEY = 'wg_mat_filters';
const LS_TRAIT_FILTERS_KEY = 'wg_trait_filters';

const defaultParams = (): GeneratorParams => ({
  maxSP: 100,
  costPerSP: 5,
  minBudget: 0,
  budget: 0,
  forgingRatio: 50,
  weaponTypeName: null,
  weaponSize: null,
  minHaltbarkeit: null,
  minEffektivitaet: null,
  maxWeight: null,
});

@Component({
  selector: 'app-weapon-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weapon-generator.component.html',
  styleUrl: './weapon-generator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponGeneratorComponent implements OnInit, OnDestroy {
  @Output() itemCreated = new EventEmitter<ItemBlock>();
  @Output() closePanel = new EventEmitter<void>();

  private api    = inject(AssetBrowserApiService);
  private svc    = inject(WeaponGeneratorService);
  private cdr    = inject(ChangeDetectorRef);

  // ── Library data ─────────────────────────────────────────────────────────
  allMaterials: MaterialBlock[] = [];
  allTraits: ForgeTrait[] = [];
  isLoading = false;

  // ── Params ────────────────────────────────────────────────────────────────
  params: GeneratorParams = defaultParams();

  // ── Filters ───────────────────────────────────────────────────────────────
  materialFilters: Record<string, ItemFilterState> = {};
  traitFilters: Record<string, ItemFilterState> = {};

  // ── UI state ──────────────────────────────────────────────────────────────
  showMaterialFilters = false;
  showTraitFilters = false;
  showMetricFilters = false;
  matFilterSearch = '';
  traitFilterSearch = '';

  // ── Result ────────────────────────────────────────────────────────────────
  result: GeneratedWeaponResult | null = null;
  resultName = '';
  noResultFound = false;
  isGenerating = false;

  // ── Weapon type helpers ───────────────────────────────────────────────────
  readonly weaponTypes = WEAPON_TYPES;
  readonly weaponCategories: WeaponCategory[] = ['LEICHT', 'FERNKAMPF', 'SCHWER'];
  readonly categoryLabels: Record<WeaponCategory, string> = {
    LEICHT: 'Leicht', FERNKAMPF: 'Fernkampf', SCHWER: 'Schwer',
  };
  readonly sizeLabels = { LIGHT: 'Leicht (×0.8)', MEDIUM: 'Mittel (×1.0)', HEAVY: 'Schwer (×1.2)' };

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    this.loadFromStorage();
    await this.loadLibraryData();
  }

  ngOnDestroy(): void { this.saveToStorage(); }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'r' || e.key === 'R') {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      e.preventDefault();
      this.reroll();
    }
  }

  private loadFromStorage(): void {
    try {
      const p = localStorage.getItem(LS_PARAMS_KEY);
      if (p) this.params = { ...defaultParams(), ...JSON.parse(p) };
      const mf = localStorage.getItem(LS_MAT_FILTERS_KEY);
      if (mf) this.materialFilters = JSON.parse(mf);
      const tf = localStorage.getItem(LS_TRAIT_FILTERS_KEY);
      if (tf) this.traitFilters = JSON.parse(tf);
    } catch { /* ignore */ }
  }

  saveToStorage(): void {
    try {
      localStorage.setItem(LS_PARAMS_KEY, JSON.stringify(this.params));
      localStorage.setItem(LS_MAT_FILTERS_KEY, JSON.stringify(this.materialFilters));
      localStorage.setItem(LS_TRAIT_FILTERS_KEY, JSON.stringify(this.traitFilters));
    } catch { /* ignore */ }
  }

  private async loadLibraryData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const matFiles: AssetFile[] = [];
      const traitFiles: AssetFile[] = [];
      for (const lib of libraries) {
        const [mats, traits] = await Promise.all([
          firstValueFrom(this.api.searchFiles(lib.id, '', ['material'])),
          firstValueFrom(this.api.searchFiles(lib.id, '', ['forge-trait'])),
        ]);
        matFiles.push(...mats);
        traitFiles.push(...traits);
      }
      this.allMaterials = matFiles.map(f => f.data as MaterialBlock);
      this.allTraits = traitFiles.map(f => f.data as ForgeTrait);
    } catch (e) {
      console.error('Waffengenerator: Fehler beim Laden', e);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  // ── Generation ────────────────────────────────────────────────────────────
  reroll(): void {
    this.saveToStorage();
    this.isGenerating = true;
    this.noResultFound = false;
    this.cdr.markForCheck();

    // Run in next tick to allow spinner to render
    setTimeout(() => {
      this.result = this.svc.generate(
        this.params,
        this.allMaterials,
        this.allTraits,
        this.materialFilters,
        this.traitFilters,
      );
      this.noResultFound = this.result === null;
      if (this.result && !this.resultName) {
        this.resultName = this.result.weaponType.name;
      }
      this.isGenerating = false;
      this.cdr.markForCheck();
    }, 10);
  }

  confirmItem(): void {
    if (!this.result) return;
    const item = this.svc.buildItem(this.result, this.resultName);
    this.itemCreated.emit(item);
    this.result = null;
    this.resultName = '';
    this.cdr.markForCheck();
  }

  // ── Filter helpers ────────────────────────────────────────────────────────
  getMatFilter(id: string): ItemFilterState {
    return this.materialFilters[id] ?? 'neutral';
  }

  cycleMatFilter(id: string): void {
    const cur = this.getMatFilter(id);
    if (cur === 'neutral')    this.materialFilters[id] = 'whitelist';
    else if (cur === 'whitelist') this.materialFilters[id] = 'blacklist';
    else                          delete this.materialFilters[id];
    this.saveToStorage();
    this.cdr.markForCheck();
  }

  getTraitFilter(id: string): ItemFilterState {
    return this.traitFilters[id] ?? 'neutral';
  }

  cycleTraitFilter(id: string): void {
    const cur = this.getTraitFilter(id);
    if (cur === 'neutral')    this.traitFilters[id] = 'whitelist';
    else if (cur === 'whitelist') this.traitFilters[id] = 'blacklist';
    else                          delete this.traitFilters[id];
    this.saveToStorage();
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.materialFilters = {};
    this.traitFilters = {};
    this.saveToStorage();
    this.cdr.markForCheck();
  }

  resetParams(): void {
    this.params = defaultParams();
    this.saveToStorage();
    this.cdr.markForCheck();
  }

  get filteredMaterials(): MaterialBlock[] {
    const q = this.matFilterSearch.toLowerCase();
    return q ? this.allMaterials.filter(m => m.name.toLowerCase().includes(q)) : this.allMaterials;
  }

  get filteredTraits(): ForgeTrait[] {
    const q = this.traitFilterSearch.toLowerCase();
    return q ? this.allTraits.filter(t => t.name.toLowerCase().includes(q)) : this.allTraits;
  }

  get whitelistedMaterialCount(): number {
    return Object.values(this.materialFilters).filter(v => v === 'whitelist').length;
  }

  get blacklistedMaterialCount(): number {
    return Object.values(this.materialFilters).filter(v => v === 'blacklist').length;
  }

  get whitelistedTraitCount(): number {
    return Object.values(this.traitFilters).filter(v => v === 'whitelist').length;
  }

  get blacklistedTraitCount(): number {
    return Object.values(this.traitFilters).filter(v => v === 'blacklist').length;
  }

  get activeFilterCount(): number {
    return Object.values(this.materialFilters).filter(v => v !== 'neutral').length
      + Object.values(this.traitFilters).filter(v => v !== 'neutral').length;
  }

  // ── Display helpers ───────────────────────────────────────────────────────
  entryLabel(entry: { material: MaterialBlock; forgeCount: number }): string {
    return entry.forgeCount > 0
      ? `${entry.material.name} +${entry.forgeCount}×`
      : entry.material.name;
  }

  slotLabel(slot: { entries: { material: MaterialBlock; forgeCount: number }[] }): string {
    return slot.entries.map(e => this.entryLabel(e)).join(', ');
  }

  getWeaponTypesForCategory(cat: WeaponCategory): WeaponType[] {
    return WEAPON_TYPES.filter(w => w.category === cat);
  }

  get effectiveSPBudget(): number {
    if (this.params.budget > 0 && this.params.costPerSP > 0) {
      return Math.min(this.params.maxSP, Math.floor(this.params.budget / this.params.costPerSP));
    }
    return this.params.maxSP;
  }

  get resultSizeBadge(): string {
    if (!this.result) return '';
    return { LIGHT: 'Leicht', MEDIUM: 'Mittel', HEAVY: 'Schwer' }[this.result.weaponSize];
  }
}
