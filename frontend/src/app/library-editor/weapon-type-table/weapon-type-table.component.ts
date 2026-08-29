import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter,
  inject, signal, ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AssetBrowserApiService } from '../../services/asset-browser-api.service';
import { AssetFile } from '../../model/asset-browser.model';
import { KNOWLEDGE_TIERS, KnowledgeTier } from '../../utils/knowledge-tier.util';
import { DamageType } from '../../model/forging.model';
import {
  DAMAGE_TYPES, DAMAGE_TYPE_SHORT, WEAPON_CATEGORIES, WEAPON_CATEGORY_LABELS, WEAPON_HANDED_LABELS,
  WEAPON_WEIGHTS, WEAPON_WEIGHT_LABELS, WeaponCategory, WeaponHanded, WeaponTypeBlock,
  WeaponWeight, createEmptyWeaponType, describeWeaponReach, normalizeWeaponType,
  setWeaponTypeKnowledgeTier, toggleDamageType, weaponTypeKnowledgeTier,
} from '../../model/weapon-type-block.model';

/**
 * Spreadsheet view over the Waffentypen in one folder — same shape as the Runen- and
 * Material-Tabelle: every cell edits in place and auto-saves after a short pause, and a row at the
 * bottom adds a new type without leaving the table.
 */
@Component({
  selector: 'app-weapon-type-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weapon-type-table.component.html',
  styleUrl: './weapon-type-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaponTypeTableComponent implements OnInit, OnDestroy {
  @Input() libraryId!: string;
  @Input() folderId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() filesChanged = new EventEmitter<void>();
  /** "Jump into the thing": open this type in the full editor. */
  @Output() openFile = new EventEmitter<AssetFile>();

  private api = inject(AssetBrowserApiService);
  private cdr = inject(ChangeDetectorRef);

  files: AssetFile[] = [];
  isLoading = signal(false);
  creating = signal(false);
  savingIds = signal(new Set<string>());
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly categories = WEAPON_CATEGORIES;
  readonly categoryLabels = WEAPON_CATEGORY_LABELS;
  readonly weights = WEAPON_WEIGHTS;
  readonly weightLabels = WEAPON_WEIGHT_LABELS;
  readonly handedLabels = WEAPON_HANDED_LABELS;
  readonly damageTypes = DAMAGE_TYPES;
  readonly damageShort = DAMAGE_TYPE_SHORT;
  readonly knowledgeTiers = KNOWLEDGE_TIERS;

  /** The pending new row at the bottom of the table. */
  draft: WeaponTypeBlock = createEmptyWeaponType('');

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    for (const t of this.saveTimers.values()) clearTimeout(t);
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    try {
      const contents = await firstValueFrom(
        this.api.getFolderContents(this.libraryId, this.folderId),
      );
      this.files = (contents.files ?? []).filter((f) => f.type === 'weapon-type');
      // Older entries predate `category`/`weight`; repair them so the selects have a value.
      for (const f of this.files) f.data = normalizeWeaponType(f.data as WeaponTypeBlock);
    } catch (e) {
      console.error('[WeaponTypeTable] Failed to load', e);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  block(file: AssetFile): WeaponTypeBlock {
    return file.data as WeaponTypeBlock;
  }

  reach(file: AssetFile): string {
    return describeWeaponReach(this.block(file));
  }

  // ─── Auto-save ────────────────────────────────────────────────────────────

  onFieldChange(file: AssetFile) {
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
      await firstValueFrom(
        this.api.updateFile(this.libraryId, file.id, {
          data: file.data,
          name: this.block(file).name || file.name,
        }),
      );
    } catch (e) {
      console.error('[WeaponTypeTable] Save failed', e);
    } finally {
      const s2 = new Set(this.savingIds());
      s2.delete(file.id);
      this.savingIds.set(s2);
      this.cdr.markForCheck();
    }
  }

  // ─── Per-cell setters ─────────────────────────────────────────────────────

  setCategory(file: AssetFile, c: WeaponCategory) {
    this.block(file).category = c;
    this.onFieldChange(file);
  }

  setWeight(file: AssetFile, w: WeaponWeight) {
    this.block(file).weight = w;
    this.onFieldChange(file);
  }

  setHanded(file: AssetFile, h: WeaponHanded) {
    this.block(file).handed = h;
    this.onFieldChange(file);
  }

  hasDamage(file: AssetFile, d: DamageType): boolean {
    return this.block(file).damageTypes?.includes(d) ?? false;
  }

  /** Multi-select: a sword is Schnitt AND Stich. The last one cannot be switched off. */
  toggleDamage(file: AssetFile, d: DamageType) {
    toggleDamageType(this.block(file), d);
    this.onFieldChange(file);
  }

  isOnlyDamage(file: AssetFile, d: DamageType): boolean {
    const list = this.block(file).damageTypes ?? [];
    return list.length <= 1 && list.includes(d);
  }

  // ─── Draft row damage types ───────────────────────────────────────────────

  hasDraftDamage(d: DamageType): boolean {
    return this.draft.damageTypes?.includes(d) ?? false;
  }

  toggleDraftDamage(d: DamageType) {
    toggleDamageType(this.draft, d);
  }

  getTier(file: AssetFile): KnowledgeTier {
    return weaponTypeKnowledgeTier(this.block(file));
  }

  setTier(file: AssetFile, tier: KnowledgeTier) {
    setWeaponTypeKnowledgeTier(this.block(file), tier);
    this.onFieldChange(file);
  }

  // ─── Add / remove ─────────────────────────────────────────────────────────

  /** Create the drafted type, then reset the draft row so several can be added in a row. */
  async addDraft(): Promise<void> {
    const name = this.draft.name?.trim();
    if (!name || this.creating()) return;
    this.creating.set(true);
    this.cdr.markForCheck();
    try {
      const created = await firstValueFrom(
        this.api.createFile(this.libraryId, name, 'weapon-type', this.folderId, {
          ...this.draft,
          name,
        }),
      );
      this.files = [...this.files, created];
      this.draft = createEmptyWeaponType('');
      this.filesChanged.emit();
    } catch (e) {
      console.error('[WeaponTypeTable] Create failed', e);
    } finally {
      this.creating.set(false);
      this.cdr.markForCheck();
    }
  }

  async remove(file: AssetFile): Promise<void> {
    if (!confirm(`Waffentyp "${this.block(file).name || file.name}" wirklich löschen?`)) return;
    try {
      await firstValueFrom(this.api.deleteFile(this.libraryId, file.id));
      this.files = this.files.filter((f) => f.id !== file.id);
      this.filesChanged.emit();
    } catch (e) {
      console.error('[WeaponTypeTable] Delete failed', e);
    } finally {
      this.cdr.markForCheck();
    }
  }

  jump(file: AssetFile): void {
    this.openFile.emit(file);
    this.close.emit();
  }
}
