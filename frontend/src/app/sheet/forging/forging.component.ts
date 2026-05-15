import {
  Component, OnInit, Output, Input, EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import {
  MaterialBlock, ForgeTrait,
  MaterialSlotState, SlotMaterialEntry,
  AppliedTraitState, ForgedStatPreview,
  ForgingData, ForgedMaterialRecord, ForgedTraitRecord,
  computeForgedStats, formatTraitEffect,
  nextForgeCost, totalForgeSPSpent,
  WeaponStatKey, WEAPON_STAT_KEYS,
  WeaponType, WEAPON_TYPES, WeaponCategory, WEAPON_CATEGORY_LABELS,
} from '../../model/forging.model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';
import { CharacterSheet } from '../../model/character-sheet-model';

export type SlotType = 'primary' | 'secondary' | 'bonus';

interface SlotConfig {
  key: SlotType;
  label: string;
  subtitle: string;
}

@Component({
  selector: 'app-forging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forging.component.html',
  styleUrl: './forging.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgingComponent implements OnInit {
  @Input() sheet: CharacterSheet | null = null;
  @Output() patch = new EventEmitter<JsonPatch>();
  @Output() closeOverlay = new EventEmitter<void>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  // ── Loading state ────────────────────────────────────────────────────────────
  isLoading = signal(true);

  // ── Library data ─────────────────────────────────────────────────────────────
  allMaterials: MaterialBlock[] = [];
  allForgeTraits: ForgeTrait[] = [];

  // ── Session configuration ────────────────────────────────────────────────────
  itemType: 'weapon' | 'armor' = 'weapon';
  itemName = '';
  schmiedepunkte = 100;
  /** Chosen stat requirement for the item (weapon only — label for min stat). */
  statRequirement: WeaponStatKey = 'STR';
  readonly statKeys = WEAPON_STAT_KEYS;
  /** Weapon size class — multiplies all stats by 0.8 / 1.0 / 1.2. */
  weaponSize: 'LIGHT' | 'MEDIUM' | 'HEAVY' = 'MEDIUM';
  readonly WEIGHT_MULT = { LIGHT: 0.8, MEDIUM: 1.0, HEAVY: 1.2 } as const;
  /** Session-level SP discount for traits (0–100 %). Applied during forging only. */
  traitDiscount = 0;
  /** Selected weapon type — cosmetic, stored in produced ItemBlock. */
  selectedWeaponType: WeaponType | null = null;
  readonly weaponTypes = WEAPON_TYPES;
  readonly weaponCategories: WeaponCategory[] = ['LEICHT', 'FERNKAMPF', 'SCHWER'];
  readonly weaponCategoryLabels = WEAPON_CATEGORY_LABELS;

  // ── Slots ────────────────────────────────────────────────────────────────────
  primarySlot: MaterialSlotState = { entries: [] };
  secondarySlot: MaterialSlotState = { entries: [] };
  bonusSlot: MaterialSlotState = { entries: [] };

  readonly slots: SlotConfig[] = [
    { key: 'primary',   label: 'Primär',   subtitle: 'Alle Werte + Extraeffekt' },
    { key: 'secondary', label: 'Sekundär', subtitle: 'Halbe Werte + Extraeffekt' },
    { key: 'bonus',     label: 'Zusatz',   subtitle: 'Nur Extraeffekt' },
  ];

  // ── Traits ───────────────────────────────────────────────────────────────────
  appliedTraits: AppliedTraitState[] = [];

  // ── UI state: material picker ────────────────────────────────────────────────
  pickingSlot: SlotType | null = null;
  materialFilter = '';
  materialTypeFilter: 'all' | 'weapon' | 'armor' = 'all';

  // ── UI state: trait picker ───────────────────────────────────────────────────
  showTraitPicker = false;
  traitFilter = '';

  // ── Available materials filtered by knowledge ─────────────────────────────────
  get availableMaterials(): MaterialBlock[] {
    const knownIds = new Set(this.sheet?.knownMaterialIds ?? []);
    const isWeapon = this.itemType === 'weapon';
    return this.allMaterials.filter(m => {
      const compatible = isWeapon ? m.canBeWeaponMaterial : m.canBeArmorMaterial;
      if (!compatible) return false;
      return m.isPublic || knownIds.has(m.id);
    });
  }

  get filteredMaterials(): MaterialBlock[] {
    const q = this.materialFilter.toLowerCase();
    return this.availableMaterials.filter(m => {
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (this.materialTypeFilter === 'weapon') return m.canBeWeaponMaterial;
      if (this.materialTypeFilter === 'armor') return m.canBeArmorMaterial;
      return true;
    });
  }

  get pickingSlotLabel(): string {
    const labels: Record<SlotType, string> = { primary: 'Primärslot', secondary: 'Sekundärslot', bonus: 'Zusatzslot' };
    return this.pickingSlot ? labels[this.pickingSlot] : '';
  }

  setMaterialTypeFilter(f: 'all' | 'weapon' | 'armor'): void {
    this.materialTypeFilter = f;
    this.cdr.markForCheck();
  }

  openTraitPicker(): void { this.showTraitPicker = true; this.traitFilter = ''; this.cdr.markForCheck(); }
  closeTraitPicker(): void { this.showTraitPicker = false; this.cdr.markForCheck(); }

  get filteredForgeTraits(): ForgeTrait[] {
    const q = this.traitFilter.toLowerCase();
    return this.allForgeTraits.filter(t => !q || t.name.toLowerCase().includes(q));
  }

  // ── SP calculations ──────────────────────────────────────────────────────────
  get spentSP(): number {
    let sp = 0;
    for (const slot of [this.primarySlot, this.secondarySlot, this.bonusSlot]) {
      for (const entry of slot.entries) {
        sp += totalForgeSPSpent(entry.forgeCount);
      }
    }
    sp += this.appliedTraits.reduce((acc, t) => acc + this.effectiveTraitCost(t.trait) * t.level, 0);
    return sp;
  }

  get remainingSP(): number {
    return this.schmiedepunkte - this.spentSP;
  }

  get spProgress(): number {
    if (this.schmiedepunkte <= 0) return 0;
    return Math.min(100, Math.round((this.spentSP / this.schmiedepunkte) * 100));
  }

  // ── Slot stat aggregation ────────────────────────────────────────────────────
  /** Effective SP cost of a trait after applying the session traitDiscount. */
  effectiveTraitCost(trait: ForgeTrait): number {
    return Math.max(1, Math.round(trait.schmiedepunktKosten * (1 - this.traitDiscount / 100)));
  }

  /** Weapon size multiplier — 1.0 when not forging a weapon. */
  get weightMultiplier(): number {
    if (this.itemType !== 'weapon') return 1;
    return this.WEIGHT_MULT[this.weaponSize];
  }

  /** Aggregate ForgedStatPreview for all entries in a slot. */
  aggregateSlot(slot: MaterialSlotState): ForgedStatPreview | null {
    if (slot.entries.length === 0) return null;
    // Count stack levels per material
    const stackCounts = new Map<string, number>();
    for (const entry of slot.entries) {
      stackCounts.set(entry.material.id, (stackCounts.get(entry.material.id) ?? 0) + 1);
    }
    let h = 0, e = 0, w = 0, mal = 0, req = 0;
    const effectParts: string[] = [];
    const seenMats = new Set<string>();
    for (const entry of slot.entries) {
      const preview = computeForgedStats(entry.material, entry.forgeCount, this.itemType === 'weapon');
      if (!preview) continue;
      h += preview.haltbarkeit;
      e += preview.effektivitaet;
      w += preview.weight;
      mal += preview.ruestungsmalus ?? 0;
      req += preview.statRequirement;
      // Effect text: for stackable materials use per-level description
      if (!seenMats.has(entry.material.id)) {
        seenMats.add(entry.material.id);
        const mat = entry.material;
        const count = stackCounts.get(mat.id) ?? 1;
        if (mat.stackable && mat.stackLevels && mat.stackLevels.length > 0) {
          const levelIdx = Math.min(count - 1, mat.stackLevels.length - 1);
          if (mat.stackLevels[levelIdx]) effectParts.push(mat.stackLevels[levelIdx]);
        } else if (preview.extraEffect) {
          effectParts.push(preview.extraEffect);
        }
      }
    }
    return { haltbarkeit: h, effektivitaet: e, weight: w, ruestungsmalus: mal || undefined, extraEffect: effectParts.join(', '), statRequirement: req };
  }

  get primaryPreview(): ForgedStatPreview | null { return this.aggregateSlot(this.primarySlot); }

  get secondaryPreview(): ForgedStatPreview | null {
    const raw = this.aggregateSlot(this.secondarySlot);
    if (!raw) return null;
    return {
      ...raw,
      haltbarkeit:   Math.floor(raw.haltbarkeit / 2),
      effektivitaet: Math.floor(raw.effektivitaet / 2),
      weight:        raw.weight / 2,
      ruestungsmalus: raw.ruestungsmalus != null ? Math.floor(raw.ruestungsmalus / 2) : undefined,
    };
  }

  get bonusPreview(): ForgedStatPreview | null { return this.aggregateSlot(this.bonusSlot); }

  get finalHaltbarkeit(): number {
    return Math.round(((this.primaryPreview?.haltbarkeit ?? 0) + (this.secondaryPreview?.haltbarkeit ?? 0)) * this.weightMultiplier);
  }

  get finalEffektivitaet(): number {
    return Math.round(((this.primaryPreview?.effektivitaet ?? 0) + (this.secondaryPreview?.effektivitaet ?? 0)) * this.weightMultiplier);
  }

  get finalWeight(): number {
    return Math.round(((this.primaryPreview?.weight ?? 0) + (this.secondaryPreview?.weight ?? 0) + (this.bonusPreview?.weight ?? 0)) * this.weightMultiplier * 10) / 10;
  }

  get finalRuestungsmalus(): number {
    return (this.primaryPreview?.ruestungsmalus ?? 0) + (this.secondaryPreview?.ruestungsmalus ?? 0) + (this.bonusPreview?.ruestungsmalus ?? 0);
  }

  /** Summed stat requirement from primary + secondary slots (not halved — it's an absolute requirement). */
  get finalStatRequirement(): number {
    const priReq = this.primaryPreview?.statRequirement ?? 0;
    // Secondary statRequirement is not halved — both contribute equally to the requirement
    const secReq = this.aggregateSlot(this.secondarySlot)?.statRequirement ?? 0;
    return priReq + secReq;
  }

  get allExtraEffects(): string[] {
    const seen = new Set<string>();
    for (const preview of [this.primaryPreview, this.secondaryPreview, this.bonusPreview]) {
      if (!preview?.extraEffect) continue;
      for (const part of preview.extraEffect.split(',').map(s => s.trim()).filter(Boolean)) {
        seen.add(part);
      }
    }
    return Array.from(seen);
  }

  getWeaponTypesForCategory(cat: WeaponCategory): WeaponType[] {
    return this.weaponTypes.filter(w => w.category === cat);
  }

  compareByName(a: WeaponType | null, b: WeaponType | null): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.name === b.name;
  }

  onWeaponTypeChange(): void {
    if (this.selectedWeaponType) {
      this.weaponSize = this.selectedWeaponType.defaultForgeSize;
    }
    this.cdr.markForCheck();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    await this.loadLibraryData();
  }

  private async loadLibraryData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const libraries = await firstValueFrom(this.api.getAllLibraries());
      const materialFiles: AssetFile[] = [];
      const traitFiles: AssetFile[] = [];

      for (const lib of libraries) {
        const [mats, traits] = await Promise.all([
          firstValueFrom(this.api.searchFiles(lib.id, '', ['material'])),
          firstValueFrom(this.api.searchFiles(lib.id, '', ['forge-trait'])),
        ]);
        materialFiles.push(...mats);
        traitFiles.push(...traits);
      }

      this.allMaterials = materialFiles.map(f => f.data as MaterialBlock);
      this.allForgeTraits = traitFiles.map(f => f.data as ForgeTrait);
    } catch (e) {
      console.error('Schmiede: Fehler beim Laden der Bibliothek', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // ── Slot helpers ─────────────────────────────────────────────────────────────
  getSlotState(key: SlotType): MaterialSlotState {
    if (key === 'primary') return this.primarySlot;
    if (key === 'secondary') return this.secondarySlot;
    return this.bonusSlot;
  }

  getSlotPreview(key: SlotType): ForgedStatPreview | null {
    if (key === 'primary') return this.primaryPreview;
    if (key === 'secondary') return this.secondaryPreview;
    return this.bonusPreview;
  }

  isBonusSlot(key: SlotType): boolean { return key === 'bonus'; }

  // ── Material picker ───────────────────────────────────────────────────────────
  openPicker(slot: SlotType): void {
    this.pickingSlot = slot;
    this.materialFilter = '';
    this.materialTypeFilter = 'all';
    this.cdr.markForCheck();
  }

  closePicker(): void { this.pickingSlot = null; }

  selectMaterial(mat: MaterialBlock): void {
    if (!this.pickingSlot) return;
    const slot = this.getSlotState(this.pickingSlot);
    // Non-stackable materials may only appear once per slot
    if (!mat.stackable && slot.entries.some(e => e.material.id === mat.id)) {
      this.pickingSlot = null;
      this.cdr.markForCheck();
      return;
    }
    slot.entries.push({ material: mat, forgeCount: 0 });
    this.pickingSlot = null;
    this.cdr.markForCheck();
  }

  /** How many times a given material ID appears in a slot's entries. */
  getStackCount(matId: string, slot: MaterialSlotState): number {
    return slot.entries.filter(e => e.material.id === matId).length;
  }

  /** Returns the stack-level description for an entry's material in a slot, or null if not applicable. */
  getStackLevelDesc(entry: SlotMaterialEntry, slot: MaterialSlotState): string | null {
    const mat = entry.material;
    if (!mat.stackable || !mat.stackLevels || mat.stackLevels.length === 0) return null;
    const count = this.getStackCount(mat.id, slot);
    if (count <= 0) return null;
    const levelIdx = Math.min(count - 1, mat.stackLevels.length - 1);
    return mat.stackLevels[levelIdx] || null;
  }

  removeMaterialEntry(slot: MaterialSlotState, idx: number): void {
    slot.entries.splice(idx, 1);
    this.cdr.markForCheck();
  }

  // ── Forging ───────────────────────────────────────────────────────────────────
  nextForgeCostFor(entry: SlotMaterialEntry): number {
    return nextForgeCost(entry.forgeCount);
  }

  canForge(entry: SlotMaterialEntry): boolean {
    return this.remainingSP >= nextForgeCost(entry.forgeCount);
  }

  /** Returns the per-forge stat gain for a single entry based on current itemType. */
  entryScaling(entry: SlotMaterialEntry): { halt: number; eff: number } {
    const stats = this.itemType === 'weapon'
      ? entry.material.weaponStats
      : entry.material.armorStats;
    return {
      halt: stats?.haltbarkeitSkalierung ?? 0,
      eff:  stats?.effektivitaetSkalierung ?? 0,
    };
  }

  forge(entry: SlotMaterialEntry): void {
    if (!this.canForge(entry)) return;
    entry.forgeCount++;
    this.cdr.markForCheck();
  }

  unforge(entry: SlotMaterialEntry): void {
    if (entry.forgeCount <= 0) return;
    entry.forgeCount--;
    this.cdr.markForCheck();
  }

  // ── Trait management ─────────────────────────────────────────────────────────
  getAppliedLevel(trait: ForgeTrait): number {
    return this.appliedTraits.find(t => t.trait.id === trait.id)?.level ?? 0;
  }

  canAddTrait(trait: ForgeTrait): boolean {
    const current = this.getAppliedLevel(trait);
    if (current >= trait.maxLevel) return false;
    return this.remainingSP >= this.effectiveTraitCost(trait);
  }

  addTrait(trait: ForgeTrait): void {
    if (!this.canAddTrait(trait)) return;
    const existing = this.appliedTraits.find(t => t.trait.id === trait.id);
    if (existing) existing.level++;
    else this.appliedTraits.push({ trait, level: 1 });
    this.cdr.markForCheck();
  }

  removeTrait(trait: ForgeTrait): void {
    const idx = this.appliedTraits.findIndex(t => t.trait.id === trait.id);
    if (idx === -1) return;
    if (this.appliedTraits[idx].level <= 1) this.appliedTraits.splice(idx, 1);
    else this.appliedTraits[idx].level--;
    this.cdr.markForCheck();
  }

  formatEffect(applied: AppliedTraitState): string {
    return formatTraitEffect(applied.trait, applied.level);
  }

  // ── Item type change ─────────────────────────────────────────────────────────
  onItemTypeChange(): void {
    for (const slot of [this.primarySlot, this.secondarySlot, this.bonusSlot]) {
      slot.entries = slot.entries.filter(e => {
        return this.itemType === 'weapon' ? e.material.canBeWeaponMaterial : e.material.canBeArmorMaterial;
      });
    }
    this.cdr.markForCheck();
  }

  // ── Finish forging ────────────────────────────────────────────────────────────
  canFinish(): boolean {
    return !!this.itemName.trim() && this.primarySlot.entries.length > 0;
  }

  finishForging(): void {
    if (!this.canFinish()) return;
    const isWeapon = this.itemType === 'weapon';

    const item = new ItemBlock();
    item.id = `forged_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    item.name = this.itemName.trim();
    item.itemType = isWeapon ? 'weapon' : 'armor';
    item.description = this.buildDescription();
    item.primaryEffect = this.allExtraEffects.join(' | ') || undefined;
    item.lost = false;
    item.broken = false;
    item.isIdentified = true;
    item.requirements = {};
    item.weight = Math.round(this.finalWeight * 10) / 10;
    item.hasDurability = true;
    item.durability = this.finalHaltbarkeit;
    item.maxDurability = this.finalHaltbarkeit;

    if (isWeapon) {
      item.efficiency = this.finalEffektivitaet;
      if (this.selectedWeaponType) {
        item.weaponTypeName = this.selectedWeaponType.name;
        item.damageType     = this.selectedWeaponType.damageType;
        item.range          = this.selectedWeaponType.range;
      }
    } else {
      item.stability = this.finalEffektivitaet;
      item.armorDebuff = this.finalRuestungsmalus || undefined;
    }

    if (this.appliedTraits.length > 0) {
      item.secondaryEffect = this.appliedTraits.map(t => this.formatEffect(t)).join('\n');
    }

    const toRecords = (slot: MaterialSlotState): ForgedMaterialRecord[] =>
      slot.entries.map(e => ({ name: e.material.name, forgeCount: e.forgeCount }));

    const forgingData: ForgingData = {
      createdAt: Date.now(),
      itemType: this.itemType,
      primaryMaterials: toRecords(this.primarySlot),
      secondaryMaterials: toRecords(this.secondarySlot),
      bonusMaterials: toRecords(this.bonusSlot),
      appliedTraits: this.appliedTraits.map(t => ({ name: t.trait.name, level: t.level })),
      totalSP: this.schmiedepunkte,
      spentSP: this.spentSP,
    };
    (item as any)['forgingData'] = forgingData;

    this.patch.emit({ path: '/inventory/-', value: item });
    this.resetSession();
    this.closeOverlay.emit();
  }

  private buildDescription(): string {
    const lines: string[] = [];
    if (this.itemType === 'weapon') {
      const sizeLabel = { LIGHT: 'Leicht', MEDIUM: 'Mittel', HEAVY: 'Schwer' }[this.weaponSize];
      if (this.selectedWeaponType) {
        lines.push(`Typ: ${this.selectedWeaponType.name}  ·  ${this.selectedWeaponType.damageType}  ·  ${this.selectedWeaponType.range}`);
      }
      lines.push(`Größe: ${sizeLabel} (×${this.WEIGHT_MULT[this.weaponSize]})`);
    }
    const addSlot = (label: string, slot: MaterialSlotState) => {
      if (slot.entries.length === 0) return;
      const parts = slot.entries.map(e => `${e.material.name}${e.forgeCount > 0 ? ` (+${e.forgeCount}×)` : ''}`);
      lines.push(`${label}: ${parts.join(', ')}`);
    };
    addSlot('Primär', this.primarySlot);
    addSlot('Sekundär', this.secondarySlot);
    addSlot('Zusatz', this.bonusSlot);
    if (this.appliedTraits.length > 0) {
      lines.push('');
      lines.push('Schmiedemerkmale:');
      this.appliedTraits.forEach(t => {
        lines.push(`  • ${t.trait.name}${t.level > 1 ? ` (Stufe ${t.level})` : ''}`);
      });
    }
    return lines.join('\n');
  }

  private resetSession(): void {
    this.itemName = '';
    this.primarySlot = { entries: [] };
    this.secondarySlot = { entries: [] };
    this.bonusSlot = { entries: [] };
    this.appliedTraits = [];
    this.pickingSlot = null;
    this.showTraitPicker = false;
    this.selectedWeaponType = null;
    this.cdr.markForCheck();
  }
}
