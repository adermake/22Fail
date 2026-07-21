import {
  Component, OnInit, Output, Input, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import {
  IngredientBlock, ExtractorBlock,
  BrewIngredientEntry, BrewExtractorEntry,
  BrewEffectSlot, BREW_SLOT_LABELS, BREW_SLOT_MULT,
  CraftAccessMode, PotionSlotAssignment, PotionEffectInstance, BrewingData,
  nextBrewCost, brewCountOf, effectOf, intensifiedAmount, newInstanceId, totalBrewBPSpent,
  BrewTrait, AppliedBrewTraitState, BrewedTraitRecord, brewTraitCost, formatBrewTraitEffect,
} from '../../model/brewing.model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';

@Component({
  selector: 'app-brewing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brewing.component.html',
  styleUrl: './brewing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrewingComponent implements OnInit {
  @Input() sheet: CharacterSheet | null = null;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() closeOverlay = new EventEmitter<void>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(false);
  accessMode: CraftAccessMode = 'enforced';
  brewPoints = 100;
  maxExtractors = 1;
  potionName = '';

  allIngredients: IngredientBlock[] = [];
  allBrewTraits: BrewTrait[] = [];

  /** Braumerkmale applied to the potion currently being brewed. */
  appliedTraits: AppliedBrewTraitState[] = [];
  showTraitPicker = false;
  traitFilter = '';
  allExtractors: ExtractorBlock[] = [];

  brewIngredients: BrewIngredientEntry[] = [];
  brewExtractors: BrewExtractorEntry[] = [];

  /** Potion slots locked to an ingredient instance. */
  potionSlots: Record<BrewEffectSlot, PotionSlotAssignment | null> = {
    primary: null,
    secondary: null,
    tertiary: null,
  };

  pickingKind: 'ingredient' | 'extractor' | null = null;
  pickerFilter = '';

  slots: BrewEffectSlot[] = ['primary', 'secondary', 'tertiary'];
  slotLabels = BREW_SLOT_LABELS;
  slotMult = BREW_SLOT_MULT;
  effectOf = effectOf;
  brewCountOf = brewCountOf;

  setAccessMode(mode: CraftAccessMode): void {
    this.accessMode = mode;
    this.cdr.markForCheck();
  }

  async ngOnInit(): Promise<void> {
    await this.loadLibrary();
  }

  private async loadLibrary(): Promise<void> {
    this.isLoading.set(true);
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const ings: IngredientBlock[] = [];
      const exts: ExtractorBlock[] = [];
      const traits: BrewTrait[] = [];
      for (const lib of libraries) {
        const [ingFiles, extFiles, traitFiles] = await Promise.all([
          firstValueFrom(this.api.searchFiles(lib.id, '', ['ingredient'])),
          firstValueFrom(this.api.searchFiles(lib.id, '', ['extractor'])),
          firstValueFrom(this.api.searchFiles(lib.id, '', ['brew-trait'])),
        ]);
        for (const f of ingFiles) {
          const d = f.data as IngredientBlock;
          if (d) ings.push({ ...d, id: d.id || f.id, libraryOrigin: lib.id, libraryOriginName: lib.name });
        }
        for (const f of extFiles) {
          const d = f.data as ExtractorBlock;
          if (d) exts.push({ ...d, id: d.id || f.id, libraryOrigin: lib.id, libraryOriginName: lib.name });
        }
        for (const f of traitFiles) {
          const d = f.data as BrewTrait;
          if (d) traits.push({ ...d, id: d.id || f.id, libraryOrigin: lib.id, libraryOriginName: lib.name });
        }
      }
      this.allIngredients = ings;
      this.allExtractors = exts;
      this.allBrewTraits = traits;
    } catch (e) {
      console.error('Brewing: library load failed', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  get spentBP(): number {
    let spent = 0;
    for (const entry of this.brewIngredients) {
      for (const slot of this.slots) {
        spent += totalBrewBPSpent(entry, slot, this.brewExtractors);
      }
    }
    // Braumerkmale draw from the same pool, at a flat cost per application.
    spent += this.appliedTraits.reduce((acc, t) => acc + brewTraitCost(t.trait, t.level), 0);
    return spent;
  }

  // ── Braumerkmale ───────────────────────────────────────────────────────────

  openTraitPicker(): void { this.showTraitPicker = true; this.traitFilter = ''; this.cdr.markForCheck(); }
  closeTraitPicker(): void { this.showTraitPicker = false; this.cdr.markForCheck(); }

  /** Traits the character may use: public ones, plus any they know. */
  get filteredBrewTraits(): BrewTrait[] {
    const q = this.traitFilter.trim().toLowerCase();
    const known = new Set(this.sheet?.knownBrewTraitIds ?? []);
    return this.allBrewTraits
      .filter(t => t.isPublic || known.has(t.id))
      .filter(t => !q || t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q));
  }

  getAppliedTraitLevel(trait: BrewTrait): number {
    return this.appliedTraits.find(t => t.trait.id === trait.id)?.level ?? 0;
  }

  /** Flat cost of adding one more application of this trait. */
  traitCost(trait: BrewTrait): number {
    return brewTraitCost(trait, 1);
  }

  canAddTrait(trait: BrewTrait): boolean {
    if (this.getAppliedTraitLevel(trait) >= Math.max(1, trait.maxLevel)) return false;
    return this.remainingBP >= this.traitCost(trait);
  }

  addTrait(trait: BrewTrait): void {
    if (!this.canAddTrait(trait)) return;
    const existing = this.appliedTraits.find(t => t.trait.id === trait.id);
    if (existing) existing.level++;
    else this.appliedTraits.push({ trait, level: 1 });
    this.cdr.markForCheck();
  }

  removeTrait(trait: BrewTrait): void {
    const idx = this.appliedTraits.findIndex(t => t.trait.id === trait.id);
    if (idx === -1) return;
    if (this.appliedTraits[idx].level <= 1) this.appliedTraits.splice(idx, 1);
    else this.appliedTraits[idx].level--;
    this.cdr.markForCheck();
  }

  formatTraitEffect(applied: AppliedBrewTraitState): string {
    return formatBrewTraitEffect(applied.trait, applied.level);
  }

  get remainingBP(): number {
    return this.brewPoints - this.spentBP;
  }

  get bpProgress(): number {
    if (this.brewPoints <= 0) return 0;
    return Math.min(100, Math.round((this.spentBP / this.brewPoints) * 100));
  }

  /** Ingredients visible in picker based on access mode. */
  get pickerIngredients(): IngredientBlock[] {
    const q = this.pickerFilter.toLowerCase();
    const known = new Set(this.sheet?.knownIngredientIds ?? []);
    let list = this.allIngredients.filter(i => i.isPublic || known.has(i.id));
    if (this.accessMode === 'enforced') {
      const owned = this.ownedAssetIds('ingredient');
      list = list.filter(i => owned.has(i.id));
    }
    if (q) list = list.filter(i => i.name.toLowerCase().includes(q));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  get pickerExtractors(): ExtractorBlock[] {
    const q = this.pickerFilter.toLowerCase();
    const known = new Set(this.sheet?.knownExtractorIds ?? []);
    let list = this.allExtractors.filter(e => e.isPublic || known.has(e.id));
    if (this.accessMode === 'enforced') {
      const owned = this.ownedAssetIds('extractor');
      list = list.filter(e => owned.has(e.id));
    }
    if (q) list = list.filter(e => e.name.toLowerCase().includes(q));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  private ownedAssetIds(kind: 'ingredient' | 'extractor' | 'raw-material'): Set<string> {
    const ids = new Set<string>();
    for (const r of this.sheet?.resources ?? []) {
      if (r && r.itemType === kind && r.libraryAssetId && (r.amount ?? 1) > 0) {
        ids.add(r.libraryAssetId);
      }
    }
    return ids;
  }

  private findResource(kind: 'ingredient' | 'extractor', assetId: string): ItemBlock | undefined {
    return (this.sheet?.resources ?? []).find(
      r => r && r.itemType === kind && r.libraryAssetId === assetId && (r.amount ?? 1) > 0,
    );
  }

  openIngredientPicker(): void {
    this.pickingKind = 'ingredient';
    this.pickerFilter = '';
    this.cdr.markForCheck();
  }

  openExtractorPicker(): void {
    if (this.brewExtractors.length >= this.maxExtractors) return;
    this.pickingKind = 'extractor';
    this.pickerFilter = '';
    this.cdr.markForCheck();
  }

  closePicker(): void {
    this.pickingKind = null;
    this.cdr.markForCheck();
  }

  addIngredient(ing: IngredientBlock): void {
    let resourceItemId: string | undefined;
    if (this.accessMode === 'enforced') {
      const res = this.findResource('ingredient', ing.id);
      if (!res) return;
      resourceItemId = res.id;
    }
    this.brewIngredients = [
      ...this.brewIngredients,
      {
        instanceId: newInstanceId('ing'),
        ingredient: ing,
        resourceItemId,
        primaryBrewCount: 0,
        secondaryBrewCount: 0,
        tertiaryBrewCount: 0,
      },
    ];
    this.closePicker();
  }

  addExtractor(ext: ExtractorBlock): void {
    if (this.brewExtractors.length >= this.maxExtractors) return;
    let resourceItemId: string | undefined;
    if (this.accessMode === 'enforced') {
      const res = this.findResource('extractor', ext.id);
      if (!res) return;
      resourceItemId = res.id;
    }
    this.brewExtractors = [
      ...this.brewExtractors,
      {
        instanceId: newInstanceId('ext'),
        extractor: ext,
        resourceItemId,
      },
    ];
    this.closePicker();
  }

  removeIngredient(instanceId: string): void {
    this.brewIngredients = this.brewIngredients.filter(e => e.instanceId !== instanceId);
    // Recompute / clear any slot whose owning ingredient no longer contributes.
    for (const slot of this.slots) {
      const a = this.potionSlots[slot];
      if (!a) continue;
      const total = this.slotBrewCount(slot, a.ingredientId);
      if (total <= 0) {
        this.potionSlots[slot] = null;
      } else {
        this.potionSlots[slot] = { ...a, brewCount: total };
      }
    }
    this.cdr.markForCheck();
  }

  /** Total brew clicks for a slot across every instance of the given ingredient. */
  private slotBrewCount(slot: BrewEffectSlot, ingredientId: string): number {
    return this.brewIngredients
      .filter(e => e.ingredient.id === ingredientId)
      .reduce((sum, e) => sum + brewCountOf(e, slot), 0);
  }

  removeExtractor(instanceId: string): void {
    this.brewExtractors = this.brewExtractors.filter(e => e.instanceId !== instanceId);
    this.cdr.markForCheck();
  }

  /**
   * Whether this entry may brew into the given potion slot.
   * A slot is locked to an ingredient identity — any instance of the SAME
   * ingredient may feed it, so adding extra copies lets you keep clicking
   * at the cheaper per-instance base cost.
   */
  canBrewSlot(entry: BrewIngredientEntry, slot: BrewEffectSlot): boolean {
    const effect = effectOf(entry.ingredient, slot);
    if (!effect.statusEffectId) return false;
    const assignment = this.potionSlots[slot];
    if (assignment && assignment.ingredientId !== entry.ingredient.id) return false;
    return true;
  }

  brewCost(entry: BrewIngredientEntry, slot: BrewEffectSlot): number {
    return nextBrewCost(entry, slot, this.brewExtractors);
  }

  brew(entry: BrewIngredientEntry, slot: BrewEffectSlot): void {
    if (!this.canBrewSlot(entry, slot)) return;
    const cost = this.brewCost(entry, slot);
    if (cost > this.remainingBP || !isFinite(cost)) return;

    const idx = this.brewIngredients.findIndex(e => e.instanceId === entry.instanceId);
    if (idx < 0) return;
    const updated = { ...this.brewIngredients[idx] };
    if (slot === 'primary') updated.primaryBrewCount++;
    else if (slot === 'secondary') updated.secondaryBrewCount++;
    else updated.tertiaryBrewCount++;

    this.brewIngredients = [
      ...this.brewIngredients.slice(0, idx),
      updated,
      ...this.brewIngredients.slice(idx + 1),
    ];

    const total = this.slotBrewCount(slot, updated.ingredient.id);
    this.potionSlots[slot] = {
      instanceId: updated.instanceId,
      ingredientId: updated.ingredient.id,
      ingredientName: updated.ingredient.name,
      brewCount: total,
    };
    this.cdr.markForCheck();
  }

  slotPreview(slot: BrewEffectSlot): PotionEffectInstance | null {
    const a = this.potionSlots[slot];
    if (!a) return null;
    const entry = this.brewIngredients.find(e => e.ingredient.id === a.ingredientId);
    if (!entry) return null;
    const effect = effectOf(entry.ingredient, slot);
    const total = this.slotBrewCount(slot, a.ingredientId);
    return {
      slot,
      statusEffectId: effect.statusEffectId,
      statusEffectName: effect.statusEffectName,
      sourceLibraryId: effect.sourceLibraryId ?? entry.ingredient.libraryOrigin,
      mode: effect.mode,
      amount: intensifiedAmount(effect.amount, total),
      ingredientName: entry.ingredient.name,
      brewCount: total,
    };
  }

  get allPotionEffects(): PotionEffectInstance[] {
    return this.slots.map(s => this.slotPreview(s)).filter((e): e is PotionEffectInstance => !!e);
  }

  /** Tiers that still need an effect. Every potion must carry one effect per tier. */
  get missingTiers(): BrewEffectSlot[] {
    return this.slots.filter(s => !this.slotPreview(s));
  }

  get missingTierLabels(): string {
    return this.missingTiers.map(s => BREW_SLOT_LABELS[s]).join(', ');
  }

  canFinish(): boolean {
    return !!this.potionName.trim() && this.missingTiers.length === 0;
  }

  finishBrewing(): void {
    if (!this.canFinish() || !this.sheet) return;

    const effects = this.allPotionEffects;
    const item = new ItemBlock();
    item.id = `potion_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    item.name = this.potionName.trim();
    item.itemType = 'potion';
    item.description = effects
      .map(e => `${BREW_SLOT_LABELS[e.slot]}: ${e.statusEffectName || e.statusEffectId} (${e.mode === 'STACK' ? e.amount + ' Stacks' : e.amount + ' Runden'})`)
      .join('\n');
    item.weight = 0.2;
    item.lost = false;
    item.broken = false;
    item.isIdentified = true;
    item.requirements = {};
    item.potionEffects = effects;
    item.stackable = true;
    item.amount = 1;

    const traitRecords: BrewedTraitRecord[] = this.appliedTraits.map(t => ({
      traitId: t.trait.id,
      name: t.trait.name,
      level: t.level,
      effect: formatBrewTraitEffect(t.trait, t.level),
    }));
    if (traitRecords.length) {
      item.description += '\nBraumerkmale:\n'
        + traitRecords.map(t => `• ${t.name}${t.level > 1 ? ` (${t.level})` : ''}: ${t.effect}`).join('\n');
    }

    const brewingData: BrewingData = {
      createdAt: Date.now(),
      ingredients: this.brewIngredients.map(e => ({ name: e.ingredient.name, ingredientId: e.ingredient.id })),
      extractors: this.brewExtractors.map(e => ({ name: e.extractor.name, extractorId: e.extractor.id })),
      effects,
      appliedTraits: traitRecords,
      totalBP: this.brewPoints,
      spentBP: this.spentBP,
    };
    item.brewingData = brewingData;
    item.primaryEffect = effects.map(e => e.statusEffectName || e.statusEffectId).join(' | ');

    this.patch.emit({ path: '/inventory/-', value: item });

    if (this.accessMode === 'enforced') {
      this.consumeResources();
    }

    this.resetSession();
    this.closeOverlay.emit();
  }

  private consumeResources(): void {
    const resources = [...(this.sheet?.resources ?? [])];
    const consumeOne = (resourceItemId: string | undefined, assetId: string, kind: 'ingredient' | 'extractor') => {
      let idx = resourceItemId
        ? resources.findIndex(r => r?.id === resourceItemId)
        : resources.findIndex(r => r?.itemType === kind && r.libraryAssetId === assetId && (r.amount ?? 1) > 0);
      if (idx < 0) {
        idx = resources.findIndex(r => r?.itemType === kind && r.libraryAssetId === assetId && (r.amount ?? 1) > 0);
      }
      if (idx < 0) return;
      const r = resources[idx]!;
      const amt = r.amount ?? 1;
      if (amt <= 1) resources.splice(idx, 1);
      else resources[idx] = { ...r, amount: amt - 1 };
    };

    for (const e of this.brewIngredients) {
      consumeOne(e.resourceItemId, e.ingredient.id, 'ingredient');
    }
    for (const e of this.brewExtractors) {
      consumeOne(e.resourceItemId, e.extractor.id, 'extractor');
    }
    this.patch.emit({ path: '/resources', value: resources });
  }

  private resetSession(): void {
    this.potionName = '';
    this.brewIngredients = [];
    this.brewExtractors = [];
    this.potionSlots = { primary: null, secondary: null, tertiary: null };
  }
}
