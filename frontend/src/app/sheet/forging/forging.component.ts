import {
  Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import {
  MaterialBlock, ForgeTrait,
  MaterialSlotState, AppliedTraitState, ForgedStatPreview,
  ForgingData, ForgedMaterialRecord, ForgedTraitRecord,
  computeForgedStats, formatTraitEffect,
} from '../../model/forging.model';
import { ItemBlock } from '../../model/item-block.model';
import { JsonPatch } from '../../model/json-patch.model';

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
  @Output() patch = new EventEmitter<JsonPatch>();

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

  // ── Slots ────────────────────────────────────────────────────────────────────
  primarySlot: MaterialSlotState = { material: null, forgeCount: 0 };
  secondarySlot: MaterialSlotState = { material: null, forgeCount: 0 };
  bonusSlot: MaterialSlotState = { material: null, forgeCount: 0 };

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

  // ── UI state: trait picker ───────────────────────────────────────────────────
  showTraitPicker = false;
  traitFilter = '';

  // ── Computed: spent SP ───────────────────────────────────────────────────────
  get spentSP(): number {
    const forgeSP = this.primarySlot.forgeCount + this.secondarySlot.forgeCount + this.bonusSlot.forgeCount;
    const traitSP = this.appliedTraits.reduce((acc, t) => acc + t.trait.schmiedepunktKosten * t.level, 0);
    return forgeSP + traitSP;
  }

  get remainingSP(): number {
    return this.schmiedepunkte - this.spentSP;
  }

  get spProgress(): number {
    if (this.schmiedepunkte <= 0) return 0;
    return Math.min(100, Math.round((this.spentSP / this.schmiedepunkte) * 100));
  }

  // ── Computed: slot previews ──────────────────────────────────────────────────
  get primaryPreview(): ForgedStatPreview | null {
    return this.previewForSlot(this.primarySlot);
  }

  get secondaryPreview(): ForgedStatPreview | null {
    const raw = this.previewForSlot(this.secondarySlot);
    if (!raw) return null;
    return {
      ...raw,
      haltbarkeit:  Math.floor(raw.haltbarkeit  / 2),
      effektivitaet: Math.floor(raw.effektivitaet / 2),
      weight:        raw.weight / 2,
      ruestungsmalus: raw.ruestungsmalus != null ? Math.floor(raw.ruestungsmalus / 2) : undefined,
    };
  }

  get bonusPreview(): ForgedStatPreview | null {
    return this.previewForSlot(this.bonusSlot);
  }

  get finalHaltbarkeit(): number {
    return (this.primaryPreview?.haltbarkeit ?? 0) + (this.secondaryPreview?.haltbarkeit ?? 0);
  }

  get finalEffektivitaet(): number {
    return (this.primaryPreview?.effektivitaet ?? 0) + (this.secondaryPreview?.effektivitaet ?? 0);
  }

  get finalWeight(): number {
    return (
      (this.primaryPreview?.weight ?? 0) +
      (this.secondaryPreview?.weight ?? 0) +
      (this.bonusPreview?.weight ?? 0)
    );
  }

  get finalRuestungsmalus(): number {
    return (
      (this.primaryPreview?.ruestungsmalus ?? 0) +
      (this.secondaryPreview?.ruestungsmalus ?? 0) +
      (this.bonusPreview?.ruestungsmalus ?? 0)
    );
  }

  get allExtraEffects(): string[] {
    const effects: string[] = [];
    for (const preview of [this.primaryPreview, this.secondaryPreview, this.bonusPreview]) {
      if (preview?.extraEffect) effects.push(preview.extraEffect);
    }
    return effects;
  }

  // ── Filtered lists ───────────────────────────────────────────────────────────
  get filteredMaterials(): MaterialBlock[] {
    const q = this.materialFilter.toLowerCase();
    const isWeapon = this.itemType === 'weapon';
    return this.allMaterials.filter(m => {
      const valid = isWeapon ? m.canBeWeaponMaterial : m.canBeArmorMaterial;
      if (!valid) return false;
      return !q || m.name.toLowerCase().includes(q);
    });
  }

  get filteredForgeTraits(): ForgeTrait[] {
    const q = this.traitFilter.toLowerCase();
    return this.allForgeTraits.filter(t => !q || t.name.toLowerCase().includes(q));
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

  // ── Slot management ──────────────────────────────────────────────────────────
  getSlotState(key: SlotType): MaterialSlotState {
    if (key === 'primary') return this.primarySlot;
    if (key === 'secondary') return this.secondarySlot;
    return this.bonusSlot;
  }

  openPicker(slot: SlotType): void {
    this.pickingSlot = slot;
    this.materialFilter = '';
  }

  closePicker(): void {
    this.pickingSlot = null;
  }

  selectMaterial(mat: MaterialBlock): void {
    if (!this.pickingSlot) return;
    const slot = this.getSlotState(this.pickingSlot);
    slot.material = mat;
    slot.forgeCount = 0;
    this.pickingSlot = null;
    this.cdr.markForCheck();
  }

  clearSlot(key: SlotType): void {
    const slot = this.getSlotState(key);
    slot.material = null;
    slot.forgeCount = 0;
    this.cdr.markForCheck();
  }

  canForge(slot: MaterialSlotState): boolean {
    return slot.material !== null && this.remainingSP > 0;
  }

  forge(slot: MaterialSlotState): void {
    if (!this.canForge(slot)) return;
    slot.forgeCount++;
    this.cdr.markForCheck();
  }

  unforge(slot: MaterialSlotState): void {
    if (slot.forgeCount <= 0) return;
    slot.forgeCount--;
    this.cdr.markForCheck();
  }

  // ── Trait management ─────────────────────────────────────────────────────────
  getAppliedLevel(trait: ForgeTrait): number {
    return this.appliedTraits.find(t => t.trait.id === trait.id)?.level ?? 0;
  }

  canAddTrait(trait: ForgeTrait): boolean {
    const current = this.getAppliedLevel(trait);
    if (current >= trait.maxLevel) return false;
    return this.remainingSP >= trait.schmiedepunktKosten;
  }

  addTrait(trait: ForgeTrait): void {
    if (!this.canAddTrait(trait)) return;
    const existing = this.appliedTraits.find(t => t.trait.id === trait.id);
    if (existing) {
      existing.level++;
    } else {
      this.appliedTraits.push({ trait, level: 1 });
    }
    this.cdr.markForCheck();
  }

  removeTrait(trait: ForgeTrait): void {
    const idx = this.appliedTraits.findIndex(t => t.trait.id === trait.id);
    if (idx === -1) return;
    if (this.appliedTraits[idx].level <= 1) {
      this.appliedTraits.splice(idx, 1);
    } else {
      this.appliedTraits[idx].level--;
    }
    this.cdr.markForCheck();
  }

  formatEffect(applied: AppliedTraitState): string {
    return formatTraitEffect(applied.trait, applied.level);
  }

  // ── Item type change ─────────────────────────────────────────────────────────
  onItemTypeChange(): void {
    // Clear slots that are incompatible with new type
    if (this.primarySlot.material) {
      const ok = this.itemType === 'weapon'
        ? this.primarySlot.material.canBeWeaponMaterial
        : this.primarySlot.material.canBeArmorMaterial;
      if (!ok) this.clearSlot('primary');
    }
    if (this.secondarySlot.material) {
      const ok = this.itemType === 'weapon'
        ? this.secondarySlot.material.canBeWeaponMaterial
        : this.secondarySlot.material.canBeArmorMaterial;
      if (!ok) this.clearSlot('secondary');
    }
    if (this.bonusSlot.material) {
      const ok = this.itemType === 'weapon'
        ? this.bonusSlot.material.canBeWeaponMaterial
        : this.bonusSlot.material.canBeArmorMaterial;
      if (!ok) this.clearSlot('bonus');
    }
    this.cdr.markForCheck();
  }

  // ── Finish forging ───────────────────────────────────────────────────────────
  canFinish(): boolean {
    return !!this.itemName.trim() && this.primarySlot.material !== null;
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
    } else {
      item.stability = this.finalEffektivitaet;
      item.armorDebuff = this.finalRuestungsmalus || undefined;
    }

    // Forge-trait effects as secondary / special effects
    if (this.appliedTraits.length > 0) {
      item.secondaryEffect = this.appliedTraits.map(t => this.formatEffect(t)).join('\n');
    }

    // Metadata — stored as arbitrary extra fields via type assertion
    const forgingData: ForgingData = {
      createdAt: Date.now(),
      itemType: this.itemType,
      primaryMaterial: this.primarySlot.material
        ? { name: this.primarySlot.material.name, forgeCount: this.primarySlot.forgeCount }
        : undefined,
      secondaryMaterial: this.secondarySlot.material
        ? { name: this.secondarySlot.material.name, forgeCount: this.secondarySlot.forgeCount }
        : undefined,
      bonusMaterial: this.bonusSlot.material
        ? { name: this.bonusSlot.material.name, forgeCount: this.bonusSlot.forgeCount }
        : undefined,
      appliedTraits: this.appliedTraits.map(t => ({ name: t.trait.name, level: t.level })),
      totalSP: this.schmiedepunkte,
      spentSP: this.spentSP,
    };
    (item as any)['forgingData'] = forgingData;

    // Emit as a patch — append to inventory
    this.patch.emit({
      path: '/inventory/-',
      value: item,
    });

    // Reset for next forging session
    this.resetSession();
  }

  private buildDescription(): string {
    const lines: string[] = [];
    if (this.primarySlot.material) {
      const fc = this.primarySlot.forgeCount;
      lines.push(`Primär: ${this.primarySlot.material.name}${fc > 0 ? ` (+${fc}× geschmiedet)` : ''}`);
    }
    if (this.secondarySlot.material) {
      const fc = this.secondarySlot.forgeCount;
      lines.push(`Sekundär: ${this.secondarySlot.material.name}${fc > 0 ? ` (+${fc}× geschmiedet)` : ''}`);
    }
    if (this.bonusSlot.material) {
      lines.push(`Zusatz: ${this.bonusSlot.material.name}`);
    }
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
    this.primarySlot = { material: null, forgeCount: 0 };
    this.secondarySlot = { material: null, forgeCount: 0 };
    this.bonusSlot = { material: null, forgeCount: 0 };
    this.appliedTraits = [];
    this.pickingSlot = null;
    this.showTraitPicker = false;
    this.cdr.markForCheck();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  private previewForSlot(slot: MaterialSlotState): ForgedStatPreview | null {
    if (!slot.material) return null;
    return computeForgedStats(slot.material, slot.forgeCount, this.itemType === 'weapon');
  }

  getSlotPreview(key: SlotType): ForgedStatPreview | null {
    if (key === 'primary') return this.primaryPreview;
    if (key === 'secondary') return this.secondaryPreview;
    return this.bonusPreview;
  }

  // bonus slot shows only extra effect
  isBonusSlot(key: SlotType): boolean {
    return key === 'bonus';
  }
}
