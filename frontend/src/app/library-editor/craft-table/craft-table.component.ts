import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit,
  Output, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import { ForgeTrait, createEmptyForgeTrait } from '../../model/forging.model';
import {
  BrewTrait, ExtractorBlock, IngredientBlock, BREW_SLOT_LABELS,
  createEmptyBrewTrait, createEmptyExtractorBlock, createEmptyIngredientBlock,
} from '../../model/brewing.model';
import {
  KNOWLEDGE_TIERS, KnowledgeTier, knowledgeTierOf, setKnowledgeTier,
} from '../../utils/knowledge-tier.util';
import { ItemBlock } from '../../model/item-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { StatusEffect, createEmptyStatusEffect } from '../../model/status-effect.model';

/** Item kinds offered in the Gegenstände table's type column. */
export const ITEM_TYPE_OPTIONS = [
  { value: 'weapon', label: 'Waffe' },
  { value: 'armor', label: 'Rüstung' },
  { value: 'consumable', label: 'Verbrauch' },
  { value: 'potion', label: 'Trank' },
  { value: 'other', label: 'Sonstiges' },
];

/** The asset kinds this one table can edit. */
export type CraftTableType =
  | 'forge-trait' | 'ingredient' | 'extractor' | 'brew-trait'
  | 'item' | 'spell' | 'status-effect';

export const CRAFT_TABLE_LABELS: Record<CraftTableType, string> = {
  'forge-trait': 'Schmiedemerkmale',
  'ingredient': 'Wirkstoffe',
  'extractor': 'Extraktoren',
  'brew-trait': 'Braumerkmale',
  'item': 'Gegenstände',
  'spell': 'Zauber',
  'status-effect': 'Statuseffekte',
};

/** Only craft knowledge is graded — an item or a spell has no Wissensstufe. */
const GRADED_TYPES = new Set<CraftTableType>([
  'forge-trait', 'ingredient', 'extractor', 'brew-trait',
]);

/**
 * One table for every small craft asset — Merkmale, Wirkstoffe, Extraktoren, Braumerkmale. They
 * share the same shape (a name, a Wissensstufe and a handful of numbers), so they share a table
 * instead of getting four near-identical components. Materials keep their own table: their
 * weapon/armour stat blocks are far wider than anything here.
 */
@Component({
  selector: 'app-craft-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './craft-table.component.html',
  styleUrl: './craft-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CraftTableComponent implements OnInit, OnDestroy {
  @Input({ required: true }) libraryId!: string;
  @Input({ required: true }) folderId!: string;
  @Input({ required: true }) type!: CraftTableType;

  @Output() close = new EventEmitter<void>();
  @Output() filesChanged = new EventEmitter<void>();
  /** "Jump into the thing": open this asset in its normal editor. */
  @Output() openFile = new EventEmitter<AssetFile>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  files: AssetFile[] = [];
  isLoading = signal(false);
  savingIds = signal(new Set<string>());
  addingNew = signal(false);
  newName = '';

  readonly knowledgeTiers = KNOWLEDGE_TIERS;
  readonly itemTypes = ITEM_TYPE_OPTIONS;
  readonly rarities = [
    { value: 'COMMON', label: 'Gewöhnlich' },
    { value: 'RARE', label: 'Selten' },
    { value: 'LEGENDARY', label: 'Legendär' },
  ];
  readonly slotLabels = BREW_SLOT_LABELS;

  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  get title(): string { return CRAFT_TABLE_LABELS[this.type]; }

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    for (const t of this.saveTimers.values()) clearTimeout(t);
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(this.api.getFolderContents(this.libraryId, this.folderId));
      this.files = (contents.files ?? []).filter(f => f.type === this.type);
    } catch (e) {
      console.error('[CraftTable] Laden fehlgeschlagen', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // ── Typed accessors ────────────────────────────────────────────────────────

  forgeTrait(file: AssetFile): ForgeTrait { return file.data as ForgeTrait; }
  item(file: AssetFile): ItemBlock { return file.data as ItemBlock; }
  spell(file: AssetFile): SpellBlock { return file.data as SpellBlock; }
  statusEffect(file: AssetFile): StatusEffect { return file.data as StatusEffect; }

  /** Does this asset kind carry a Wissensstufe at all? */
  get isGraded(): boolean { return GRADED_TYPES.has(this.type); }
  brewTrait(file: AssetFile): BrewTrait { return file.data as BrewTrait; }
  ingredient(file: AssetFile): IngredientBlock { return file.data as IngredientBlock; }
  extractor(file: AssetFile): ExtractorBlock { return file.data as ExtractorBlock; }
  named(file: AssetFile): { name: string } { return file.data as { name: string }; }

  // ── Wissensstufe ───────────────────────────────────────────────────────────

  tierOf(file: AssetFile): KnowledgeTier {
    return knowledgeTierOf(file.data as { knowledgeTier?: KnowledgeTier; isPublic?: boolean });
  }

  setTier(file: AssetFile, tier: KnowledgeTier): void {
    setKnowledgeTier(file.data as { knowledgeTier?: KnowledgeTier; isPublic?: boolean }, tier);
    this.onFieldChange(file);
  }

  // ── Auto-save ──────────────────────────────────────────────────────────────

  onFieldChange(file: AssetFile): void {
    const prev = this.saveTimers.get(file.id);
    if (prev) clearTimeout(prev);
    this.saveTimers.set(file.id, setTimeout(() => this.save(file), 650));
  }

  async save(file: AssetFile): Promise<void> {
    const saving = new Set(this.savingIds());
    saving.add(file.id);
    this.savingIds.set(saving);
    this.cdr.markForCheck();
    try {
      await firstValueFrom(this.api.updateFile(this.libraryId, file.id, {
        data: file.data,
        name: this.named(file).name || file.name,
      }));
    } catch (e) {
      console.error('[CraftTable] Speichern fehlgeschlagen', e);
    } finally {
      const done = new Set(this.savingIds());
      done.delete(file.id);
      this.savingIds.set(done);
      this.cdr.markForCheck();
    }
  }

  isSaving(file: AssetFile): boolean { return this.savingIds().has(file.id); }

  // ── Add / remove ───────────────────────────────────────────────────────────

  startAdding(): void { this.newName = ''; this.addingNew.set(true); this.cdr.markForCheck(); }
  cancelAdding(): void { this.addingNew.set(false); this.newName = ''; }

  private blankFor(name: string): unknown {
    switch (this.type) {
      case 'forge-trait': return { ...createEmptyForgeTrait(), name };
      case 'brew-trait':  return { ...createEmptyBrewTrait(), name };
      case 'ingredient':  return createEmptyIngredientBlock(name);
      case 'extractor':   return createEmptyExtractorBlock(name);
      case 'item':        return { ...new ItemBlock(), name };
      case 'spell':       return { ...new SpellBlock(), name, description: '', tags: [] };
      case 'status-effect': return { ...createEmptyStatusEffect(), name };
    }
  }

  async confirmAdd(): Promise<void> {
    const name = this.newName.trim() || 'Neuer Eintrag';
    this.addingNew.set(false);
    try {
      const file = await firstValueFrom(
        this.api.createFile(this.libraryId, name, this.type, this.folderId, this.blankFor(name)),
      );
      this.files = [...this.files, file];
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[CraftTable] Anlegen fehlgeschlagen', e);
    }
  }

  async remove(file: AssetFile): Promise<void> {
    if (!confirm(`„${this.named(file).name}" löschen?`)) return;
    try {
      await firstValueFrom(this.api.deleteFile(this.libraryId, file.id));
      this.files = this.files.filter(f => f.id !== file.id);
      this.filesChanged.emit();
      this.cdr.markForCheck();
    } catch (e) {
      console.error('[CraftTable] Löschen fehlgeschlagen', e);
    }
  }

  jump(file: AssetFile): void {
    this.openFile.emit(file);
    this.close.emit();
  }

  onClose(): void { this.close.emit(); }
}
